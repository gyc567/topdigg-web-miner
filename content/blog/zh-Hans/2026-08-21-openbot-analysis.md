---
title: "OpenBot 深度解析：给每个 AI Agent 一台自己的电脑"
date: "2026-08-21"
description: "深度解析 CopilotKit/OpenBot 开源项目：AI Agent 平台，每个 Bot 拥有独立电脑，所有操作先审批再执行并记录。核心思想：可信赖的 AI Agent 同事。内置 General Assistant / Knowledge / Risk Analyst 三大同事，支持任意 AG-UI Agent 接入，完整审计日志，Docker 一键部署。"
tags:
  - OpenBot
  - CopilotKit
  - AI Agent
  - AG-UI
  - Agent Platform
  - LangGraph
  - CrewAI
  - 自主权
  - 安全治理
  - MCP
categories:
  - 深度解析
  - AI Agent
  - 开源项目
---

# OpenBot 深度解析：给每个 AI Agent 一台自己的电脑

> 核心思想：**"AI coworkers you can hand real work to, and actually trust with the access"**——OpenBot 的创始人认为，当前 AI Agent 缺少的不是"能力"，而是"可信赖的操作边界"。一个 Agent 可以驱动真实浏览器、读写文件、调用 MCP 服务，但它在做什么、为什么做、你能不能随时接管——这些才是决定 Agent 能否真正成为你同事的关键。OpenBot 的答案是：**给每个 Agent 一台自己的电脑，配一个只看不管的网关，加上完整的操作记录。**

## 一、项目背景与核心定位

CopilotKit 团队在 AI Agent 领域有两个广为人知的产品：**Copilotkit**（前端 Agent 集成框架）和 **Copilot Runtime**。OpenBot 是他们在这个方向上的最新探索——一个**开源的 AI Agent 平台**，目标是让 AI Agent 从"能调用工具"进化到"可以放心授权"。

当前大多数 Agent 产品的核心矛盾是：

- 你想让它做真事（登录网站、读写文件、调用外部服务）
- 但做真事意味着有风险（它会不会误操作？会不会数据泄露？）

OpenBot 的解法不是限制 Agent 的能力，而是**重构授权模型**：不是问"Agent 能做什么"，而是问"谁在什么情况下批准了什么事，做了之后有记录吗"。

### 项目元信息

| 字段 | 值 |
|------|-----|
| 仓库 | https://github.com/CopilotKit/openbot |
| 状态 | Alpha（活跃开发中）|
| License | MIT |
| 语言 | TypeScript/React + Bun + Hono |
| 部署 | Docker Compose / 单容器 Docker |
| 数据库 | PostgreSQL + pgvector |
| Agent 协议 | AG-UI（开放协议） |
| 依赖 | CopilotKit Intelligence（线程与记忆）|

### 一句话定位

OpenBot 是一个**本地优先、可审计、带治理的 AI Agent 协作平台**：每个 Bot 有自己的独立电脑（容器+浏览器+文件系统），所有操作经过 CEL 策略网关审批，记录完整审计日志，用户随时可接管。

## 二、核心思想：从"能做什么"到"凭什么做"

### 2.1 传统 Agent 的信任困境

当前主流 Agent 产品（Claude Code、Cursor Agent、OpenAI Operator）的共性问题是：**Agent 执行操作和用户感知操作之间存在巨大的信息不对称。**

用户只知道"我让 Agent 做了 X"，但不知道：

- Agent 调用的具体工具是什么
- 工具的参数和目标是什么
- 操作结果是否符合预期
- 是否有危险操作被悄悄拒绝

OpenBot 的核心判断是：**信任不是靠限制能力建立的，而是靠透明性和可控性建立的。** 你不是通过告诉 Agent"你不能做什么"来保护自己，而是通过**让每个操作都经过审批网关、留下记录、并随时可以接管**来建立真正的信任。

### 2.2 "先审批再执行"的治理模型

OpenBot 的设计哲学核心是**Gateway（网关）作为唯一入口**：

```
用户操作 → 服务器网关 → 策略检查 → 审计日志 → 允许/拒绝 → Bot 电脑执行
```

这个流程的关键是：**永远没有不经过记录的行动**。每个操作都是：

1. **resolve** - 从服务器持有的快照解析目标
2. **evaluate** - 根据 CEL 策略评估是否允许
3. **audit** - 写入审计行，记录决定和原因
4. **act** - 仅在允许时才真正执行

### 2.3 每个 Bot 自己的电脑

OpenBot 最独特的理念是**每个 Bot 拥有独立的计算机**：

- 独立的 Chromium 浏览器（自己的登录状态）
- 独立的 `/workspace` 文件系统卷
- 独立的浏览器 Profile
- 可选 gVisor 沙箱隔离

这意味着 Agent 之间的数据完全隔离，一个 Agent 泄露不等于所有 Agent 泄露。

## 三、项目说明：架构与组件

### 3.1 服务架构图

OpenBot 由多个协同服务组成，通过 Docker Compose 编排：

```
┌─────────────────────────────────────────────────────┐
│                     React/Vite UI                   │
│                    (app :3010)                      │
└──────────────────────┬──────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────┐
│              Hono API Server (server :3001)          │
│  Auth / Policy / Audit / Credentials / Plugins       │
│  Components / Coworkers / Channels                   │
│  CopilotKit Runtime                                  │
└──────┬────────────────┬──────────────────┬───────────┘
       │                │                  │
┌──────▼──────┐  ┌──────▼──────┐  ┌────────▼────────┐
│agent-computer│  │ agent-bot   │  │agent-langgraph  │
│  (:4100)    │  │  (:4200)    │  │    (:4201)      │
│ Chromium    │  │ PoC AG-UI   │  │  LangGraph Bot  │
│ + workspace │  │  Bot        │  │                 │
└─────────────┘  └─────────────┘  └──────────────────┘
                       │
              ┌────────▼────────┐
              │   Supervisor    │
              │ (:4500 host /   │
              │  :4300 container)│
              │ 每个Bot独立容器  │
              └─────────────────┘
                       │
              ┌────────▼────────┐
              │   PostgreSQL    │
              │ + pgvector (:5432)│
              │ 数据/审计/策略   │
              └─────────────────┘
```

### 3.2 核心组件详解

#### Gateway（策略网关）

Gateway 是 OpenBot 安全模型的核心。它是 Bot 所有操作的唯一入口：

- 解析操作目标（URL、文件路径、MCP 调用）
- 根据 CEL 策略评估是否允许
- 写入审计行
- 允许后调用 Bot 计算机执行

关键设计：**没有路径可以绕过网关直接操作。** 即使是低级别的 token 保护服务端口，也不能用于绕过网关。

#### Supervisor（监管者）

Supervisor 负责为每个 Bot 创建和管理独立的计算机容器：

- 每个 Bot 一个 Docker 容器
- 每个容器独立的 workspace 卷
- 每个容器独立的浏览器 Profile
- 支持 gVisor（`runsc`）隔离运行时

#### Agent Computer（Agent 电脑）

Agent Computer 是 Bot 操作真实浏览器的组件：

- 真实 Chromium 浏览器（可操控任何网站）
- 文件系统工具（读写 Bot 的 workspace）
- Shell 执行（通过同一网关审批）
- 屏幕截图与 DOM 快照

#### Bot Endpoints（Bot 端点）

OpenBot 支持两种 Bot：

1. **内置 Bot**（built-in）：配置系统提示词即可创建
2. **远程 AG-UI Bot**（remote-ag-ui）：接入任意 AG-UI 协议端点

支持框架：LangGraph、Mastra、CrewAI、Pydantic AI、Google ADK，或手写 AG-UI 端点。

### 3.3 三大内置同事

OpenBot 示例包内置三个 Bot（配置而非代码）：

| Bot | 定位 | 能力 |
|-----|------|------|
| **General Assistant** | 日常助手 | 浏览器操作、文件处理、信息查询 |
| **Knowledge** | 企业知识库 | 连接 Google Drive/OneDrive 知识源 |
| **Risk Analyst** | 风控合规 | 审查操作风险、出具合规意见 |

## 四、详细教程：从零搭建 OpenBot

### 4.1 前置要求

- **Docker** + Docker Compose（用于 PostgreSQL 和 Bot 服务）
- **Bun 1.3+**（用于 App 和 API 服务）
- **CopilotKit Intelligence 项目和许可证**（有免费计划，可自托管）
- **模型 API Key**（OpenAI / Anthropic / Google）

### 4.2 快速开始（5步完成）

**Step 1：复制环境变量**

```bash
cp .env.example .env
```

**Step 2：获取 CopilotKit Intelligence 凭证**

```bash
npx --yes copilotkit@latest login
npx --yes copilotkit@latest project select
npx --yes copilotkit@latest license --write
```

- `license --write` 会将 `COPILOTKIT_LICENSE_TOKEN` 写入 `.env`
- `project select` 输出的 `cpk-...` runtime key 设为 `INTELLIGENCE_API_KEY`

**Step 3：填写剩余配置**

```bash
# 必须填写的
OPENAI_API_KEY=sk-...

# 生成加密密钥（本地开发用）
openssl rand -base64 32
# 填入 KEY_ENCRYPTION_KEY
```

**Step 4：安装依赖并启动**

```bash
bun install
bash scripts/start.sh
```

`start.sh` 启动流程：
1. Docker Compose 启动 PostgreSQL、Bot 服务
2. 执行数据库迁移
3. 启动 API Server（:3001）
4. 启动 React App（:3010）
5. 健康检查确认所有服务就绪

**Step 5：打开浏览器**

访问 http://localhost:3010

### 4.3 快速体验路径

启动后可以立即尝试以下场景：

**路径1：直接对话 Bot**
- 访问 `/bot`
- 输入：`Open news.ycombinator.com and tell me the top story.`
- 观察 Bot 如何打开浏览器、自主搜索、汇报结果

**路径2：审计日志验证**
- 让 Bot 填写 https://httpbin.org/forms/post
- 访问 `/admin/audit` 查看完整操作记录
- 看到每一步操作都有时间戳、工具名、目标地址和结果

**路径3：策略拦截**
- 访问 `/admin/boundaries`
- 添加一条拒绝规则（例如禁止访问某个域名）
- 重试相同操作，观察 Bot 被拒绝并显示规则名称

**路径4：创建自定义同事**
- 访问 `/agents`
- 创建新 Bot：填写名称、职位、角色描述
- 选择 AG-UI 端点或内置模式
- 启动专属频道

### 4.4 Docker 单容器部署（生产推荐）

```bash
# 构建镜像
docker build -t openbot .

# 启动（内置 PostgreSQL）
docker run -p 3001:3001 --env-file .env \
  -e EMBEDDED_POSTGRES=on \
  -v openbot-data:/var/lib/postgresql/data \
  openbot

# 或连接外部 PostgreSQL
docker run -p 3001:3001 --env-file .env \
  -e DATABASE_URL="postgresql://user:pass@host:5432/openbot" \
  openbot
```

### 4.5 Google OAuth 认证配置（可选）

本地开发默认使用 `OPENBOT_DEV_NO_AUTH`（跳过登录，所有请求以管理员身份运行）。

配置真实登录：

```bash
# 生成密钥
openssl rand -base64 32

# .env 中设置
BETTER_AUTH_URL=http://localhost:3001
BETTER_AUTH_SECRET=<上面生成的密钥（至少32字符）>
GOOGLE_OAUTH_CLIENT_ID=<你的Google OAuth Client ID>
GOOGLE_OAUTH_CLIENT_SECRET=<你的Google OAuth Client Secret>

# 信任来源（本地开发）
TRUSTED_ORIGINS=http://localhost:3010

# 初始管理员邮箱
INITIAL_ADMIN_EMAILS=your@email.com

# 删除 OPENBOT_DEV_NO_AUTH
```

## 五、CEL 策略引擎详解

### 5.1 策略规则格式

策略以 JSON 格式存储在 `AGENT_COMPUTER_POLICY` 环境变量或管理员保存的配置中：

```json
{
  "deny": [
    {
      "description": "阻止访问云元数据地址",
      "expression": "page.host.matches('.*\\.google\\.com.*')"
    }
  ],
  "allow": [
    {
      "description": "允许浏览和搜索",
      "expression": "tool.name in ['browser.navigate', 'browser.search']"
    }
  ]
}
```

### 5.2 可检查的字段

CEL 规则可以检查以下字段：

| 字段类型 | 可用字段 |
|---------|---------|
| 工具 | `tool.name` |
| 意图 | `intent` |
| Bot | `bot.id` |
| 用户 | `actor.id` |
| 页面 | `page.url`, `page.host` |
| 元素 | `element.ref`, `element.role`, `element.name`, `element.type` |
| 键盘 | `key` |
| 文件 | `file.path`, `file.name`, `file.extension` |
| MCP | `mcp.server`, `mcp.tool`, `mcp.effect` |

### 5.3 Fail-Closed 原则

OpenBot 的策略引擎**严格遵循 fail-closed 原则**：

- 拒绝规则先于允许规则评估
- **没有配置策略 = 禁止一切**
- 损坏的拒绝规则 = 拒绝
- 损坏的允许规则 = 不允许

这意味着默认状态下，Bot 什么都做不了，直到管理员明确配置了允许规则。

### 5.4 策略管理界面

管理员可以通过 `/admin/boundaries` 界面：

- 查看当前策略
- 添加/编辑/删除规则
- 选择预设策略模板
- 查看规则生效后的拦截效果

## 六、关键功能深度解析

### 6.1 "接管方向盘"机制

当 Bot 遇到以下情况时，会请求人工帮助：

- 登录墙（需要输入凭据）
- 2FA 提示
- 不确定的危险操作

控制权交接被记录为三个审计事件：

- `computer.help_requested` - Bot 请求帮助
- `computer.control_taken` - 用户接管控制
- `computer.control_released` - 用户释放控制

**关键设计**：用户接管期间，Bot 的所有操作请求被**直接拒绝**，而不是排队等待。这确保了用户始终有最终决定权。

### 6.2 凭证金库

敏感凭证（API Key、OAuth Token、数据库密码）不应出现在对话记录中。

OpenBot 的解决方案：

- 通过 `/admin/credentials` 界面存储加密凭证
- 凭证以加密形式存储，**永远不在 API 响应中返回**
- 审计日志只记录"凭证被请求"和"请求时长"，不记录凭证内容

### 6.3 MCP 治理

OpenBot 集成了 MCP（Model Context Protocol）支持，并内置治理层：

**内置 MCP 集成**：

- Atlassian（Jira、Confluence）
- Box
- Slack
- Salesforce
- ServiceNow

**治理规则**：

- 自定义 MCP 服务器必须通过 URL 检查
- 无法明确分类为"读"的工具，**默认视为写操作**
- 每个 MCP 调用都经过 grant 检查和策略评估

### 6.4 React 组件作为工具

与大多数 Agent 用纯文本回复不同，OpenBot 的 Bot 可以返回 **React 组件**：

- 编译后的组件存放在 `app/src/components/gallery/`
- 沙箱组件在 `/admin/playground` 中创作并发布
- 每次组件调用都经过服务器验证（存在？已发布？允许该 Bot 使用？）
- 内置数据函数：`botActivity`（Bot 活动）和 `recentRefusals`（最近拒绝）

### 6.5 持久线程与记忆

OpenBot 通过 CopilotKit Intelligence 实现：

- 对话在服务重启后保留（不丢失上下文）
- 每个部署的线程有独立标识（`DEPLOYMENT_ID`）
- 支持跨会话记忆复用

## 七、设计哲学：六大核心原则

### 7.1 先记录再执行（Record Before Act）

这是 OpenBot 最重要的设计原则：**没有任何操作可以在审计日志写入之前执行。** 即使最终允许了操作，审计行也必须在行动之前写入。这确保了即使系统被攻破，攻击行为也会被记录。

### 7.2 失败即关闭（Fail Closed）

CEL 策略引擎的 fail-closed 行为意味着：

- 默认状态是最安全的
- 安全漏洞来自配置错误，而不是设计缺陷
- 管理员必须明确授予每个权限

### 7.3 隔离而非限制（Isolate, Don't Restrict）

每个 Bot 有独立容器、独立浏览器 Profile、独立 workspace——**隔离是默认**，而不是通过限制来实现安全。这直接对应了攀岩安全带的逻辑：安全来自把坠落和你隔开，而不是不让你爬高。

### 7.4 透明性即信任（Transparency is Trust）

OpenBot 不通过隐藏功能来建立信任，而是通过**完整透明**：

- 每个操作都有记录
- 每个拒绝都有原因
- 用户随时可以接管
- 凭证从不进入对话记录

### 7.5 协议而非平台（Protocol, Not Platform）

OpenBot 基于 AG-UI 协议构建，不绑定任何特定框架。这确保了：

- LangGraph、Mastra、CrewAI、Pydantic AI 可以无缝接入
- 治理逻辑随协议走，不随框架走
- 用户不被锁定在 CopilotKit 生态内

### 7.6 本地优先（Local-First）

OpenBot 设计为在**你自己的基础设施**上运行：

- 数据在 PostgreSQL（你控制的数据库）
- 模型由你选择（你提供的 API Key）
- 浏览器绑定在 loopback（本地）
- 无需将敏感数据发送到第三方服务

## 八、观点总结与启示

### 观点 1：Agent 的下一个进化方向是"可审计性"，而非"能力"

当前 AI Agent 的军备竞赛集中在"能做什么"——更多工具、更强推理、更长上下文。OpenBot 指出一个被忽视的方向：**可审计性**。当 Agent 能做的事情越来越多，信任问题的根源不是"能力太强"，而是"边界不清"。下一个进化的焦点将是让每个操作都可追溯、可干预、可解释。

### 观点 2："先审批再执行"是企业级 Agent 的必经之路

对于企业场景，AI Agent 必须满足合规要求（SOX、GDPR、SEC）。实现合规的技术路径不是"限制 Agent 能力"，而是**在每次操作前建立决策点**。OpenBot 的 CEL 策略引擎 + 审计日志是这个方向的技术实现参考。

### 观点 3：隔离架构比权限系统更根本

传统安全思维是 RBAC（基于角色的访问控制）：给 Agent 分配角色，角色决定权限。这在 Agent 场景下不够用，因为 Agent 的行为是动态的、上下文相关的。OpenBot 的"每 Bot 独立容器"架构提供了更根本的隔离——即使一个 Bot 被攻破，攻击面也被限制在其独立容器内。

### 观点 4：凭证管理是 Agent 平台的基础设施，不是功能

大多数 Agent 产品把"凭证管理"当作附加功能。OpenBot 将其作为一等公民：凭证金库、加密存储、永不返回 API、审计记录但不记录内容。这是 Agent 从"实验玩具"到"生产系统"的基础设施跨越。

### 观点 5：AG-UI 协议的价值在于"治理跟协议走"

OpenBot 选择 AG-UI 而非自建协议，核心逻辑是：**治理规则应该跟协议走，而不是跟框架走。** 如果治理逻辑嵌入在 LangGraph 或 CrewAI 里，每当换框架就要重新实现治理。AG-UI 作为开放协议，提供了跨框架统一治理的可能性。

### 观点 6："人在回路"不是降低效率，而是提高信任度

有人质疑"用户随时接管"会降低 Agent 效率。OpenBot 的设计实践表明：**信任建立后，用户干预的频率会大幅降低。** 真正降低效率的是"不知道 Agent 在做什么所以不敢放手"。透明性和可控性是提高信任、减少干预的根本。

### 观点 7：开源 Agent 平台正在缩小与商业产品的差距

CopilotKit 团队将 OpenBot 完全开源（MIT），包括架构图（可用 `bun run diagram` 重新生成）、策略引擎、MCP 治理。这标志着开源社区在 AI Agent 基础设施层面的成熟度正在快速追赶商业产品。

## 九、技术规格速览

| 维度 | 规格 |
|------|------|
| 部署形态 | Docker Compose / 单容器 Docker |
| 数据库 | PostgreSQL + pgvector |
| App 端口 | 3010 |
| API 端口 | 3001 |
| Bot 浏览器端口 | 4100 |
| Bot 端点端口 | 4200/4201 |
| 监管者端口 | 4500（宿主机）/ 4300（容器内）|
| 策略引擎 | CEL 表达式 + fail-closed |
| 隔离运行时 | gVisor（可选）|
| 凭证加密 | AES-256，Key 来自 KEY_ENCRYPTION_KEY |
| Agent 协议 | AG-UI |
| 支持框架 | LangGraph、Mastra、CrewAI、Pydantic AI、Google ADK |
| 内置 MCP | Atlassian、Box、Slack、Salesforce、ServiceNow |

## 十、结语

OpenBot 的核心贡献不在于"又一个 Agent 框架"，而在于**重新定义了 Agent 的信任模型**。

大多数 Agent 产品试图通过限制能力来建立信任（"这个 Agent 只能做这些事"）。OpenBot 的路径是：**不限制能力，但让每个行动都透明、可审计、可干预。** 信任不是通过"做更少的事"来建立的，而是通过"做每一件事都有记录"来建立的。

它还带来了一个更根本的提醒：**AI Agent 的问题不只是"模型够不够强"，还有"Agent 在真实环境中的行为边界是否清晰"**。当 Agent 要操作真实浏览器、读写真实文件、调用真实服务时，"能力"和"治理"必须同步进化。

OpenBot 目前处于 Alpha 阶段（文档明确说"Expect rough edges and bugs"），但它的方向是正确的——它解决的不是 Agent 的能力问题，而是 Agent 的信任问题。这是 AI Agent 从"演示玩具"走向"生产系统"的必经之路。

---

*项目地址：https://github.com/CopilotKit/openbot*
*官网：https://copilotkit.ai/openbot*
*协议：AG-UI（开放协议，https://github.com/ag-ui-protocol/ag-ui）*
