---
title: "Cloudflare OS 深度解析：重新定义 AI 时代的生产力操作系统"
description: "全面解析 Cloudflare OS — Cloudflare 开源的 AI 生产力环境。深度探讨其设计哲学、Gadget 沙箱架构、Gatekeeper 安全框架、异步人机协作机制，以及它为何代表了 SaaS 软件的未来范式。"
date: "2026-08-08"
author: "TopDigg Research Team"
tags: ["Cloudflare OS", "AI生产力", "Cloudflare Workers", "开源", "沙箱安全", "Gatekeeper", "Gadget", "Agent原生", "SaaS替代", "本地优先"]
categories: ["深度解析"]
keywords: ["Cloudflare OS", "AI生产力环境", "Cloudflare开源", "沙箱应用", "Gatekeeper安全", "Gadget", "Agent原生", "SaaS替代方案"]
---

> **Cloudflare OS** 是 Cloudflare 开源的 AI 生产力环境，它重新定义了软件的分发和使用方式。本全面分析涵盖项目的架构、设计哲学、实用教程以及 AI 时代的核心洞察。

---

## 1. 项目说明

### 1.1 什么是 Cloudflare OS?

Cloudflare OS 是一个 AI 生产力环境，最初为 Cloudflare 内部使用而开发。Cloudflare 的大量员工——从工程到销售——每天都在使用 Cloudflare OS 来帮助他们完成工作。

这不是传统的计算机操作系统。"操作系统"一词有两层含义：

- 一个让**公司**能够安全使用 AI 提高生产力的操作系统
- 一个管理 AI 工作负载的操作系统，类似于传统操作系统管理计算工作负载

Cloudflare OS 提供三个核心能力：

1. **Agent 聊天 UI**：你可以要求 Agent 执行任务，预加载了公司运营知识
2. **沙箱应用开发**：让 Agent 构建"Gadgets"（小型个人应用），并安全地与他人分享
3. **安全框架（Gatekeepers）**：应用护栏，让非技术用户可以安全地"尽情使用"

### 1.2 核心特性

| 特性 | 详情 |
|------|------|
| **Gadget 沙箱** | 每个应用运行在独立的 Dynamic Worker 中，默认无互联网访问 |
| **基于能力的安全** | Agent/Gadget 默认无访问权限；用户必须显式引入资源 |
| **异步人机协作** | Agent 继续工作，用户稍后批量审批 |
| **实时多人协作** | Durable Objects 使实时协作编辑开箱即用 |
| **Agent 友好 API** | 每个 Gadget 自动暴露 Agent 可调用的 Cap'n Web RPC API |
| **Blueprint 分享** | 分享应用代码作为模板，而非托管服务 |
| **BYOK AI 模型** | 支持多种 LLM 提供商；用户自行付费 |

### 1.3 关键概念

#### Gadgets（小工具）——一种新的软件思维方式

Cloudflare OS 不仅仅是另一个带连接器的聊天框。系统围绕一种新的软件方式展开——每个用户运行自己使用的生产力应用的私有副本。

当你在 Cloudflare OS 中创建幻灯片时，你不是在调用运行在云端的某个 SaaS 软件。系统会为你创建一个**私有实例**。我们称之为"Gadget"。这个实例在与其他人的幻灯片隔离的沙箱中运行。

这有两个深远的影响：

1. **安全**：幻灯片应用不可能有安全漏洞泄露你的数据到攻击者。Cloudflare OS 沙箱控制对你的应用私有实例的所有访问。
2. **可修改**：如果你想，你可以自由修改代码。如果幻灯片应用缺少你需要的功能，你只需要求你的 Agent 添加它。而且因为第 1 点，这样做完全安全。

这与过去 25 年的云架构和"软件即服务"有很大不同，但我们认为 AI 改变了方程式。当任何用户都能通过提示 Agent 添加他们需要的功能时，集中式的软件模式就不再有意义了。

#### Gatekeepers——基于能力的安全层

Gatekeepers 就像增强版的 MCP 服务器。

当你将 Agent 或 Gadget 引入外部资源时，会创建一个 Gatekeeper 来管理该访问。Gatekeeper 是特定于每个外部服务的软件，调节 Gadget 到该服务的连接。它：

- 提供干净的 Cap'n Web API 到服务（包装服务原生提供的任何 API）
- 处理授权（例如通过 OAuth）
- 强制执行仅对用户意图的特定资源的窄访问
- 记录 Gadget（或 Agent）执行的每个操作，供你审查
- 对于任何有副作用的操作，为人类用户提供批准或拒绝操作的机会（"人在回路中"）

**异步人机协作**是 Gatekeeper 的重大创新。传统的人在回路设置要求人类**同步**批准操作。当 Agent 想要做某事时，它必须**停止**并等待批准才能继续。这很烦人：你给 Agent 一个任务，然后走开去喝杯咖啡，结果回来发现 Agent 在第一步就卡在批准上，毫无进展。结果，人们经常妥协，将 Agent 设置为"自动批准"，或 `--dangerously-skip-permissions`，这显然是不安全的。

Gatekeeper 提供了更好的方式：当 Agent（或 Gadget）执行需要批准的操作时，Gatekeeper 会在本地**模拟**结果，允许 Agent 继续并排队更多操作。Gatekeeper 告诉 Agent 操作已完成，如果 Agent 尝试读回结果，Gatekeeper 会给它模拟的结果。一旦 Agent 完成，用户可以批量或逐个批准或拒绝操作，但无论如何，他们可以在方便时做。

#### Blueprints——分享你的代码

如果创建了一个对他人有用的 Gadget，但不想分享 Gadget 本身，你可以分享一个 Blueprint，允许其他人创建他们自己的 Gadget 副本。Blueprint 本质上是代码的副本。

Blueprint 是对云软件传统的重大改变。传统上，如果你想分享一个你创建的 Web 应用，你会将应用托管在你的服务器上，用户连接到它。Blueprint 更像移动应用和传统 PC 应用：每个用户运行自己的软件副本。

在 AI 时代，这种改变至关重要。一方面，AI 赋能单个开发者构建比以往更多的东西，但单个开发者仍然难以维护在线服务；这消除了这种需求。另一方面——甚至更重要——允许每个用户运行自己的软件副本，使用户能够使用 AI *修改*软件以满足他们的需求。无需提交功能请求，无需乞求开发者优先处理。最终用户可以解决自己的问题。

---

## 2. 详细教程

### 2.1 快速开始：本地运行

使用 Cloudflare OS 最快的方式是本地运行。

**前置条件**：
- 安装 [pnpm](https://pnpm.io/)

```bash
# 安装 pnpm（如果尚未安装）
npm install -g pnpm

# 克隆仓库
git clone https://github.com/cloudflare/cloudflare-os.git
cd cloudflare-os

# 运行完整栈
pnpm run-local
```

然后访问：http://localhost:8787

这使用 `wrangler`（Workers 开发工具 CLI）在本地运行 Cloudflare OS。这不是在生产服务器上运行 OS 的正确方式，但在本地机器上试用效果很好。

你的数据将存储在名为 `.wrangler` 的子目录中。

### 2.2 开发模式

开发时，你希望在两个终端中运行前端和后端：

```bash
# 终端 1：后端
pnpm dev-server

# 终端 2：前端
pnpm dev-client
```

然后访问：http://localhost:3000

### 2.3 部署到你的 Cloudflare 账户

#### 一键部署

Cloudflare 提供了在线部署流程：

访问 https://os.cloudflare.app/deploy

#### 高级部署

对于更复杂的部署，包括你的 gatekeepers 和可能的代码更改，使用部署启动仓库：

访问 https://github.com/cloudflare/cloudflare-os-starter

### 2.4 尝试这些提示

运行本地后，尝试这些提示：

- "为我即将与客户的会议制作幻灯片。"（使用内置的幻灯片 blueprint）
- "制作一个协作白板应用。"（从头开始创建新应用）
- "制作一个井字棋游戏。" 然后 "我是 X，你是 O。我已经走了第一步。轮到你了。"
- "为这个 GitHub 仓库制作一个 issue 仪表板。"（附加仓库；需要配置 GitHub 集成）
- "修复这个 Google 文档中的拼写错误。"（附加文档；需要配置 Google 集成）

### 2.5 配置外部服务

许多 Gatekeeper 需要配置才能连接到第三方服务，包括为每个服务获取 OAuth 客户端凭证。

每个 gatekeeper 包包含设置说明：

| Gatekeeper | 说明 |
|------------|------|
| `gatekeeper-github` | GitHub API 集成 |
| `gatekeeper-google` | Google API 集成 |
| `gatekeeper-cloudflare` | Cloudflare API 集成 |
| `gatekeeper-notion` | Notion API 集成 |
| `gatekeeper-slack` | Slack API 集成 |
| `gatekeeper-supabase` | Supabase API 集成 |
| `gatekeeper-confluence` | Confluence API 集成 |
| `gatekeeper-email` | Email Workers 集成 |
| `gatekeeper-spotify` | Spotify 集成 |
| `gatekeeper-homeassistant` | Home Assistant 集成 |
| `gatekeeper-zoominfo` | ZoomInfo API 集成 |
| `gatekeeper-mcp` | 通用 MCP 服务器连接器 |
| `gatekeeper-mcp-portal` | 管理员配置的 MCP 门户 |
| `gatekeeper-linear` | Linear 集成 |
| `gatekeeper-scheduler` | 调度器集成 |

**Gatekeeper OAuth 回调 URL**：
```
http://localhost:8787/gatekeeper/<provider>/oauth
```

**GitHub 集成配置示例**：
```bash
# packages/gatekeeper-github/.env
CLIENT_ID=your-client-id-here
CLIENT_SECRET=your-client-secret-here

# 添加到根目录 .dev.vars 用于登录
AUTH_GATEKEEPERS=cloudflare,google,github
```

### 2.6 认证模式

Cloudflare OS 支持两种认证模式：

1. **密码模式**（默认）- 用户名/密码注册
2. **Cloudflare Access 模式** - 设置 `VITE_CF_ACCESS_MODE=true`

---

## 3. 核心架构深度解析

### 3.1 操作系统类比

Cloudflare OS 在技术层面上实际上类似于操作系统：

| 传统 OS | Cloudflare OS |
|---------|---------------|
| 内核 | `packages/workshop-backend` |
| 设备驱动 | `packages/gatekeeper-*` |
| Shell | `packages/workshop-frontend` |
| 进程 | gadgets |
| 可执行文件 | blueprints |
| 用户 | users |
| ACLs | 共享权限 |
| （缺失） | **agents** |

我们的"内核"在 `workshop-backend` 包中。后端确实做了很多与真实操作系统内核相似的事情：它连接用户到程序和设备（Gadgets 和 Gatekeepers），同时通过沙箱应用和强制访问控制来实现安全性。

在类比中，Gatekeepers——连接用户和 Agent 到外部服务——就像驱动程序——连接用户和程序到外部设备。

有一个传统操作系统今天不真正管理的东西，但 Cloudflare OS 管理：**AI Agent**。如果你仔细想想，这实际上是传统操作系统中缺失的功能。我们相信 AI Agent 不能简单地被视为用户。它们必须对人类用户负责，同时拥有自己的受限权限。Agent 通过编写代码片段并即时执行来完成工作。这一切的理想安全模型是**基于能力的安全**，而不是访问控制列表。

### 3.2 技术栈

- **运行时**：Cloudflare Workers（Durable Objects、Dynamic Workers、Facets）
- **本地开发**：`workerd`（开源 Workers 运行时）
- **前端**：基于 Vite 的开发服务器
- **关键库**：
  - [Pi](https://pi.dev/) - LLM 提供商抽象
  - [Monaco Editor](https://microsoft.github.io/monaco-editor/) - 代码编辑器
  - [Yjs](https://yjs.dev/) - 实时协作
  - [Cap'n Web RPC](https://github.com/cloudflare/capnweb) - 低样板代码 RPC

### 3.3 项目结构

```
cloudflare-os/
├── packages/
│   ├── workshop-backend/      # 核心内核 - 连接用户到 gadgets/gatekeepers
│   ├── workshop-frontend/     # Shell UI（聊天、工作区）
│   ├── workshop-shared/       # 前后端共享类型
│   ├── router/                # HTTP 路由
│   │
│   ├── gatekeeper-*/          # 14+ Gatekeeper 包
│   │   ├── gatekeeper-github/
│   │   ├── gatekeeper-google/
│   │   ├── gatekeeper-cloudflare/
│   │   ├── gatekeeper-notion/
│   │   ├── gatekeeper-slack/
│   │   ├── gatekeeper-supabase/
│   │   ├── gatekeeper-confluence/
│   │   ├── gatekeeper-email/
│   │   ├── gatekeeper-spotify/
│   │   ├── gatekeeper-homeassistant/
│   │   ├── gatekeeper-zoominfo/
│   │   ├── gatekeeper-mcp-portal/
│   │   ├── gatekeeper-mcp/
│   │   └── gatekeeper-scheduler/
│   │
│   ├── gatekeeper-context/    # 共享 Gatekeeper 工具
│   ├── mcp-shared/            # MCP 协议共享代码
│   │
│   ├── backend-utils/         # 后端工具
│   ├── config-ui/             # 配置 UI
│   ├── error-reporting/       # 错误处理
│   ├── typed-storage/         # 存储抽象
│   └── integration-tests/     # 测试套件
│
├── docs/                      # 文档
├── plans/                     # 项目计划
├── scripts/                   # 构建/开发脚本
└── .github/workflows/         # CI/CD
```

### 3.4 沙箱安全模型

每个 Gadget 运行在安全沙箱中，防止其在未经你明确同意的情况下与互联网通信：

- **服务器端**：在禁用互联网访问的 Dynamic Worker 中运行。只能通过 Workers Bindings 与你明确指定的特定外部资源通信。
- **客户端**：在沙箱 iframe 中运行。只能通过父框架提供的 `postMessage()` 的 Cap'n Web RPC 会话与其服务器通信。iframe 被阻止访问互联网（通过 `Content-Security-Policy` 和 iframe 沙箱设置，浏览器允许的最大程度）。

### 3.5 基于能力的访问控制

每个 Agent 和每个 Gadget 默认无任何访问权限。即使你已配置 Gadget Workshop 访问外部帐户，Agent 和 Gadget **不会**自动获得使用它们的权限。

相反，你必须**引入**每个 Agent（或 Gadget）到你希望它访问的任何特定资源。例如，你可以通过粘贴链接或点击"添加资源"并选择它来引入 GitHub 仓库。Agent 也可以请求引入它认为需要的资源，然后你可以提供或拒绝。

这与大多数 Agent 框架不同，在那些框架中，MCP 服务器是预先配置的，使所有服务的广泛访问在每次聊天中都对 Agent 可用。基于能力的引入将每个 Agent 限制为仅其实际需要的访问。

---

## 4. 归纳总结：核心观点与洞察

### 4.1 SaaS 模式的终结：从托管到本地副本

Cloudflare OS 代表了软件分发模式的根本转变：

**传统模式**：你创建一个 Web 应用，托管在你的服务器上，用户连接到它。

**新模式**：你分享代码（Blueprint），每个用户运行自己的副本。

这种转变的原因：

1. **AI 赋能个人**：AI 让单个开发者能够构建比以往更多的东西
2. **维护负担**：单个开发者仍然难以维护在线服务
3. **定制需求**：用户可以用 AI 修改自己的软件副本
4. **无需请求**：无需提交功能请求，用户可以自己解决问题

**启示**：未来的软件可能是"代码即服务"，而非"软件即服务"。

### 4.2 基于能力的安全：超越访问控制列表

传统的访问控制列表（ACLs）为用户/角色分配固定权限。基于能力的安全为每次操作分配最小权限。

**传统 ACLs**：
```yaml
user: admin
permissions:
  - read
  - write
  - delete
```

**基于能力的安全**：
```yaml
agent: code-reviewer
task: review-pr-123
capabilities:
  - read:repo/my-project
  - read:pr/123
  # 没有 write、delete 等其他权限
```

**启示**：在 AI Agent 时代，基于能力的安全比 ACLs 更合适，因为：
- Agent 执行的任务是动态的
- 权限应该随任务变化
- 最小权限原则更易实施

### 4.3 异步人机协作：解决 Agent 卡顿问题

传统的人在回路（Human-in-the-Loop）设置要求同步批准，导致 Agent 经常卡住。

**传统方式**：
```
Agent 尝试操作 → 等待用户批准 → 用户去喝咖啡 → Agent 卡住 → 用户回来批准 → Agent 继续
```

**Cloudflare OS 方式**：
```
Agent 尝试操作 → Gatekeeper 模拟结果 → Agent 继续 → 用户稍后批量批准
```

**优势**：
- Agent 不会卡住
- 用户可以在方便时批量处理
- 减少"自动批准"的诱惑
- 保持安全性的同时提高效率

**启示**：异步人机协作是 AI 工具的必要特性。

### 4.4 操作系统类比：AI 时代的平台思维

将 Cloudflare OS 类比为操作系统不仅仅是营销：

| 组件 | 功能 |
|------|------|
| **内核** | 管理资源、进程、安全 |
| **驱动程序** | 连接外部设备/服务 |
| **Shell** | 用户界面 |
| **进程** | 运行中的应用 |
| **Agent** | 新型"进程"，具有受限权限 |

传统操作系统管理计算资源。Cloudflare OS 管理 AI 工作负载。

**启示**：AI Agent 需要操作系统级别的管理，而非简单的用户级权限。

### 4.5 开源的战略价值

Cloudflare 选择开源 Cloudflare OS 的原因：

1. **生态构建**：鼓励社区创建新的 Gatekeepers 和 Blueprints
2. **标准化**：推动 AI 生产力工具的标准化
3. **信任建立**：开源代码增加透明度和信任
4. **反馈循环**：社区使用反馈帮助改进产品
5. **人才吸引**：开源项目吸引优秀开发者

**启示**：开源是 AI 工具构建生态系统的有效策略。

---

## 5. 与传统方案的对比

### 5.1 Cloudflare OS vs 传统 SaaS

| 维度 | 传统 SaaS | Cloudflare OS |
|------|-----------|---------------|
| **数据存储** | 供应商服务器 | 你的 Cloudflare 账户 |
| **代码控制** | 供应商控制 | 你控制 |
| **定制能力** | 有限 API | 完全代码修改 |
| **安全模型** | 信任供应商 | 沙箱隔离 |
| **定价** | 订阅制 | BYOK（自带密钥） |
| **AI 集成** | 通常是事后添加 | 原生设计 |

### 5.2 Cloudflare OS vs 其他 Agent 框架

| 维度 | 通用 Agent 框架 | Cloudflare OS |
|------|-----------------|---------------|
| **安全模型** | MCP 服务器预配置 | 基于能力的引入 |
| **应用隔离** | 无 | 每个 Gadget 独立沙箱 |
| **人机协作** | 同步批准 | 异步模拟+批量批准 |
| **应用分发** | 共享实例 | Blueprint（代码副本） |
| **运行时** | 本地/自托管 | Cloudflare Workers |

---

## 6. 路线图与未来规划

### 6.1 当前状态

- **版本**：v2（2026 年 8 月早期访问）
- **状态**：积极开发中，从 v1 完全重写
- **成熟度**：功能强大，但仍有许多粗糙之处

### 6.2 即将到来

- **workerd 自托管**：完全在开源 `workerd` 运行时上运行的文档和工具
- **更多 Gatekeepers**：持续添加新的服务集成
- **社区贡献**：随着项目成熟，可能开放更多贡献机会

### 6.3 贡献政策

> 目前，我们不寻求外部贡献。外部 PR 是"捐赠"容易的部分（编写代码），同时创造了更多困难的工作（审查）。仅接受小型、可轻松验证的 PR（≤12 行）。大型想法 → 讨论。

---

## 7. 总结

Cloudflare OS 不仅仅是一个 AI 生产力工具——它代表了软件分发和使用的范式转变。通过将每个应用变成用户拥有的私有实例（Gadget），通过基于能力的安全框架（Gatekeeper），通过异步人机协作机制，Cloudflare OS 为 AI 时代的生产力设定了新的标准。

**核心价值**：
1. **安全**：沙箱隔离 + 基于能力的安全
2. **可控**：用户拥有代码和数据
3. **可定制**：AI 可以修改任何应用
4. **高效**：异步人机协作
5. **开放**：Apache-2.0 开源

**适用场景**：
- 需要安全使用 AI 的企业
- 希望用户能定制应用的组织
- 重视数据隐私和控制的团队
- 想要构建 AI 原生生产力工具的开发者

Cloudflare OS 为 AI 时代的生产力软件树立了一个新的标杆。它的设计哲学和实践经验值得所有 AI 工具开发者学习和借鉴。

---

> **参考资源**：
> - [GitHub 仓库](https://github.com/cloudflare/cloudflare-os)
> - [官方部署](https://os.cloudflare.app/deploy)
> - [部署启动仓库](https://github.com/cloudflare/cloudflare-os-starter)
> - [workerd 运行时](https://github.com/cloudflare/workerd)
> - [Cap'n Web RPC](https://github.com/cloudflare/capnweb)
