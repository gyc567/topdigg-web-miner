---
title: "open·kritt 深度解析：用 AI 智能体编排引擎发现真实代码漏洞"
description: "深度解析 open·kritt：一个开源的 AI 安全研究平台，通过工作流编排将复杂的安全审计分解为小而专注的任务，并行运行多个 AI 智能体，最终输出可去重、可排序、可验证的安全发现。平台核心思想来自真实漏洞赏金猎人经验，已累计获得超过 150 万美元漏洞赏金。全文覆盖：核心思想、项目架构、安装配置、详细教程、设计哲学、安全模型、观点总结。"
date: "2026-08-08"
author: "TopDigg Research Team"
tags: ["open-kritt", "AI Security", "Vulnerability Detection", "Bug Bounty", "AI Agent", "Security Research", "Code Analysis"]
categories: ["Deep Dive"]
keywords: ["open-kritt", "AI 安全", "漏洞检测", "漏洞赏金", "AI 智能体", "安全研究", "代码分析", "工作流编排", "模糊测试"]
---

# open·kritt 深度解析：用 AI 智能体编排引擎发现真实代码漏洞

> 核心思想：**open·kritt 是一个开源的 AI 安全研究平台，其核心理念是将复杂的安全审计分解为小而专注的任务，并行运行多个 AI 智能体，通过结构化工作流输出可去重、可排序、可验证的安全发现。** 不同于将整个代码库丢给 AI 模型让其"找漏洞"的粗放方式，open·kritt 强调任务分解与专注分析——给一个智能体分配一个小而明确的任务（如"分析某个文件中的某个函数"），比让它扫描整个代码库更有效。这个理念来自真实的安全研究实践：Kritt 团队在漏洞赏金猎人名号 **Blockian** 下已累计获得超过 **150 万美元**的漏洞赏金，open·kritt 是他们内部工具的开源版本。

---

## 一、项目说明

### 1.1 它是什么？

**open·kritt** 是一个**开源、自托管的 AI 安全研究平台**，用于编排 AI 智能体来发现真实代码漏洞。它的核心思路是：与其把整个代码库丢给一个大模型"找漏洞"，不如将研究分解为**小的、定义明确的任务**，并行运行多个 AI 智能体，然后将结果合并为可验证、可排序的发现。

该平台由 Kritt 团队开发，团队成员 Harel Rom（@harel-coffee）和 Gabriel Balko（@GabiCtrlZ）联合所有并维护。平台采用 **AGPL-3.0** 开源许可证。

### 1.2 关键数据

- GitHub 仓库：`https://github.com/Kritt-ai/open-kritt`
- 官网：`https://kritt.ai`
- 文档：`https://docs.kritt.ai`
- 许可证：**AGPL-3.0**
- 技术栈：前端（React/Vite）+ 后端（Express/Prisma/PostgreSQL）+ 引擎（Python/Codex 或 Claude Code）+ Docker
- CLI 工具：`./kritt`（仓库内置，无需安装）

### 1.3 项目结构

```
open-kritt/
├── backend/           # Express + Prisma REST API
├── frontend/          # React/Vite UI
├── engine/            # 扫描执行引擎（Python）
├── docs-site/         # Mintlify 文档站点
├── database/          # PostgreSQL 初始化
├── scripts/           # CLI 脚本
├── kritt              # 仓库内置 CLI 工具
└── docs/              # 安全威胁模型等文档
```

---

## 二、核心功能

### 2.1 工作流（Workflows）

工作流是**可复用的蓝图**——由 prompt 步骤组成的树形结构，引擎按深度顺序运行每个步骤，并将输出传递给下一步。

**关键特性：**
- **步骤（Steps）**：每个步骤是一个 prompt + 期望的 JSON 输出格式
- **深度（Depth）**：步骤按深度组织，深度 0 是入口，深度越深任务越具体
- **多输出（Multi-output）**：一个步骤可以产生多个结果，馈入下一深度的并行任务
- **结构化输出**：每个步骤声明输出格式（string/number/boolean/array/object），所有键全局唯一

### 2.2 扫描（Scans）

扫描是将工作流作用于目标代码库的执行单元：
- 支持**远程仓库**（GitHub owner/repo + commit_sha）和**本地仓库**
- 支持依赖仓库配置
- 支持可配置的 `repo_scope` 限定扫描范围
- 支持重复运行（`repeat_runs`）进行累积分析

### 2.3 后脚本（Post-scripts）

后脚本是**每个发现专属的后处理步骤**，在工作流完成、去重和排序后运行：
- 验证发现
- 构建概念验证（PoC）
- 撰写报告
- 添加分级、标签等元数据

### 2.4 严重性排序器（Severity Rankers）

严重性排序器是 **Markdown 规则**，指导模型如何对发现进行优先级排序。它们是自定义的，可根据目标项目的漏洞分类标准进行调整。

---

## 三、核心思想与设计哲学

### 3.1 任务分解哲学：小的、专注的任务 > 大的、模糊的任务

open·kritt 的核心理念来自于一个关键洞察：**"如果你把 AI 指向整个代码库让它'找漏洞'，它通常做不到。但如果你把 AI 指向某个文件中的某个函数并问一个专注的问题，它往往能行。"**

这个理念是 open·kritt 所有架构决策的基础。它体现为：

1. **工作流分解**：将复杂的安全审计分解为深度递增的步骤树
2. **并行执行**：每个深度可以并行运行多个任务，充分利用上下文窗口
3. **上下文效率**：智能体的上下文窗口被用于真正的分析工作，而不是在庞大的代码库中导航

### 3.2 内置工作流

open·kritt 预装了两个实用工作流：

#### 外部流分析（External Flow Analysis）

这是团队在实际研究中使用过的工作流，而非教程示例。它遵循从生产入口点到具体安全敏感行为的外部控制输入追踪：

1. **枚举入口点**：扫描代码库，识别外部可达的入口点及其处理攻击者控制输入的处理器
2. **追踪可达流**：对每个入口点，枚举不同的生产路径，包括验证结果、授权边界、状态变更、外部调用和敏感接收器
3. **调查每个流**：将每个可达流交给下游智能体验证。它只返回有支持的攻击者路径的具体漏洞，或无发现存根

> 这个分解策略节省上下文：入口点和流只映射一次，而每个最终智能体将上下文窗口花在一个具体路径上。

#### Cosmos ABCI Panic Halt Review

针对基于 Go 的 Cosmos 应用，其中生产 ABCI 路径中的 panic 可能导致共识停止：
1. **枚举 ABCI 方法**：证明哪些 ABCI 方法和阶段处理器被接入生产应用
2. **调查 panic 类型**：对每个可达方法展开四个专注审查——显式 panic、算术 panic、nil 指针 panic、越界或类型 panic

### 3.3 发现 schema 的强制性

最深步骤（终端步骤）必须发出固定的**发现 schema**，确保每个发现一致且可比较：
- `explanation`、`file_path`、`line`、`malicious_input_example`、`summary`
- `trigger_flow`、`vulnerability_type`、`malicious_actor`
- 可选的 `exploitable`

这个强制约束确保所有发现可以被统一处理、去重和排序。

### 3.4 自托管优先

open·kritt 明确选择**自托管**作为默认和推荐部署方式：
- 用户拥有自己的基础设施、数据和凭证
- 支持 Codex 登录（推荐）、OpenAI API Key、Anthropic API Key 或 OpenRouter
- 后端默认不包含应用层认证，需要用户自行在网络层添加认证

---

## 四、详细安装配置教程

### 4.1 前置要求

- Git
- Docker Desktop 或 Docker Engine + Docker Compose 插件
- Node.js 20 或更高版本（仅用于 CLI）
- 模型访问凭证（Codex 登录推荐，或 API Key）

### 4.2 快速安装

```bash
# 1. 克隆仓库
git clone https://github.com/Kritt-ai/open-kritt && cd open-kritt

# 2. 运行交互式 CLI 配置
./kritt

# 3. 启动完整堆栈
./kritt start
```

安装后访问 http://localhost:5173 打开前端界面。

### 4.3 模型访问配置

| 选项 | 说明 |
|------|------|
| **Codex 登录**（推荐） | 使用符合条件的 ChatGPT/Codex 订阅的引导式设备流访问 |
| `OPENAI_API_KEY` | 使用 OpenAI Platform API Key + Codex harness |
| `ANTHROPIC_API_KEY` | 使用 Claude Code + Anthropic API 计费 |
| `OPENROUTER_API_KEY` | 通过 OpenRouter 路由兼容模型 |

`GITHUB_TOKEN` 是可选的，仅在需要克隆私有 GitHub 仓库或其依赖时需要。

### 4.4 手动 Docker 配置

```bash
# 复制环境变量模板
cp .env.example .env
chmod 600 .env

# 在 .env 中设置一个 Provider 凭证：
# OPENAI_API_KEY, CODEX_API_KEY, ANTHROPIC_API_KEY, 或 OPENROUTER_API_KEY

# 创建必要的目录
mkdir -p .data/codex
chmod 700 .data/codex

# 启动
docker compose up --build
```

### 4.5 加载示例数据

```bash
docker compose exec backend npm run seed
```

示例数据是附加的、幂等的，会保留现有数据。

---

## 五、第一次扫描完整教程

### 5.1 创建工作流

1. 打开 **Workflows → New workflow**
2. 选择 **Blank workflow**，命名并添加描述
3. 添加步骤：

**深度 0 - 枚举（Entry Point）**
- 名称：`Enumerate Entrypoints`
- 内容：识别这个代码库中所有外部可达的入口点（HTTP 路由、API 端点、用户输入处理函数）
- 输出格式：`endpoints` (array)
- 勾选 **Multi-output**

**深度 1 - 分析（Analysis）**
- 名称：`Analyze Endpoint`
- 内容：分析入口点 `{{endpoint}}`，识别可能的注入点、数据流和安全敏感操作
- 输出格式：`findings` (array)，每个发现包含 `vulnerability_type`、`file_path`、`line` 等
- 引用深度 0 的键：`{{endpoint}}`

**深度 2 - 终端（Terminal）**
- 名称：`Document Finding`
- 内容：详细记录发现的漏洞，提供攻击路径和概念验证
- 输出格式：必须包含发现 schema 的所有必需键

### 5.2 创建后脚本

1. 打开 **Post-scripts → New post-script**
2. 选择 **Blank post-script**
3. 内容示例：

```
评估发现 "{{summary}}" - 一个位于 {{file_path}}:{{line}} 的 {{vulnerability_type}} 漏洞。

返回：
- severity (string): CRITICAL, HIGH, MEDIUM, 或 LOW
- confidence (string): HIGH, MEDIUM, 或 LOW
- recommendation (string): 修复建议
```

### 5.3 创建严重性排序器

1. 打开 **Severity Rankers → New ranker**
2. 编写 Markdown 规则，定义漏洞类型和上下文如何映射到严重性等级

### 5.4 运行扫描

1. 打开 **Scans → New scan**
2. 选择工作流
3. 设置目标：远程（GitHub owner/repo）或本地
4. 选择模型、提供者和 harness
5. 附加后脚本和排序器
6. 提交启动

### 5.5 查看结果

扫描完成后，打开任何发现查看完整报告、概念验证和后脚本输出。

---

## 六、安全模型与威胁分析

### 6.1 信任边界

| 组件 | 角色 | 信任级别 |
|------|------|---------|
| 前端 | UI（React/Vite） | 操作员面向 |
| 后端 | REST API + Postgres（Express/Prisma） | 操作员面向，**默认无认证** |
| 数据库 | PostgreSQL — 工作流、扫描、发现 | 信任存储 |
| 引擎 | 认领扫描、检出仓库、运行 harness | **分析不受信任的代码和 prompt** |
| executor-view | 只读视图 | 操作员面向 |

### 6.2 关键威胁与缓解

#### 1. 不受信任的代码和 Prompt 注入

引擎分析攻击者控制的代码，仓库可能包含旨在操纵智能体的内容（prompt 注入）。

**缓解措施：**
- 每个启用工具的作业在一次性容器中运行
- 容器有可写的每次作业检出目录和复制的作业主目录
- 作业不挂载 Docker socket、数据库、项目 `.env` 或其他作业
- Harness 输出是模式约束的 JSON
- 草稿生成调用禁用模型工具、用户规则/设置和会话持久化

#### 2. 秘钥泄露

被入侵/注入的智能体可能尝试读取凭证或发送数据。

**缓解措施：**
- 秘钥保存在 `.env` 和 provider 登录/凭证存储中（均 gitignored）
- 优先使用**范围窄、短期**的 `GITHUB_TOKEN`（只读，仅需扫描的仓库）
- 定期轮换 provider 密钥
- 扫描运行器**默认有直接出站互联网访问**（用于智能体研究、安装工具和获取依赖）

#### 3. 数据外流到模型提供商

扫描默认将代码发送到外部端点。

**缓解措施：**
- 扫描敏感代码前了解数据去向
- 选择数据处理方式与代码敏感性相匹配的模型端点
- 审查提供商的数据保留条款

#### 4. API 无认证暴露

`/api/*` **默认无认证**。

**缓解措施：**
- 不要绑定到公共接口
- 在后端 API 和 UI 前放置自己的认证/授权代理
- 在代理层应用认证、网络控制和速率限制

### 6.3 安全部署检查清单

- [ ] 在**专用 VM 或 Docker 主机**上运行完整堆栈
- [ ] 如果直接互联网访问不符合策略，添加主机级出口控制
- [ ] 在后端 API 和 UI 前**放置认证**
- [ ] 使用**最小、短期**的 `GITHUB_TOKEN`；轮换 provider 密钥
- [ ] 选择**数据处理**与代码敏感性相匹配的模型端点
- [ ] 保持 `.env` 和 `.data/` 凭证存储私有；永远不要提交它们

---

## 七、观点与结论总结

### 7.1 核心观点

**观点一：任务分解是 AI 安全研究的关键**

open·kritt 最重要的洞察是，将复杂的安全审计分解为小的、专注的任务，比尝试用一个大模型解决整个问题要有效得多。这与人类安全研究员的实际工作方式一致——专家不会同时审视整个代码库，他们会关注特定的入口点、数据流和函数。

**观点二：结构化输出强制发现质量**

要求每个终端步骤发出固定的发现 schema（包含必需键），确保所有发现可以被统一处理、去重和排序。这是 AI 输出质量控制的一个重要实践。

**观点三：自托管是信任的基础**

open·kritt 选择自托管作为默认部署方式，反映了对代码安全的深刻理解——用户需要控制他们的数据、凭证和基础设施。这不是功能缺失，而是有意识的设计决策。

**观点四：真实漏洞赏金经验驱动产品设计**

open·kritt 不是理论项目。它来自实际的安全研究，团队成员在 Blockian 名下已获得超过 150 万美元的漏洞赏金。内置的工作流反映了真实的安全研究实践，而非教程示例。

**观点五：安全与功能的平衡**

open·kritt 的设计在安全性和功能性之间取得平衡——智能体需要互联网访问来安装工具和研究目标，但平台提供了隔离和监控机制。这是处理不受信任代码的实际必要。

### 7.2 适用场景

- **安全研究人员**：将 AI 整合到研究流程中，而不放弃对 prompt、数据或模型的控制
- **安全意识开发者**：获取 AI 帮助编写和审计安全代码
- **漏洞赏金猎人**：系统化漏洞发现流程，提高效率
- **安全团队**：对内部代码库进行持续安全审计

### 7.3 局限性

- 默认无应用层认证，需要用户自行添加
- 依赖于外部模型提供商，存在数据外流风险
- 需要 Docker 基础设施，对某些用户可能增加复杂度
- 扫描不受信任的代码需要专用隔离环境

### 7.4 总结

open·kritt 是一个将 AI 智能体编排应用于安全研究的成熟平台。它的核心价值在于：
1. **任务分解方法论**：将复杂审计变为可管理的专注任务
2. **真实世界验证**：来自实际漏洞赏金经验
3. **自托管控制**：用户拥有数据和基础设施
4. **结构化发现输出**：可验证、可排序、可操作的结果

对于认真对待代码安全的团队和个人，open·kritt 提供了一个既实用又有原则的解决方案。它的设计哲学——专注的任务分解、结构化的输出和自托管控制——代表了 AI 辅助安全研究的最佳实践。

---

## 八、参考资料

- 项目仓库：https://github.com/Kritt-ai/open-kritt
- 官方文档：https://docs.kritt.ai
- 官网：https://kritt.ai
- 研究论文：https://kritt.ai/open-kritt-launch
- Discord 社区：https://discord.gg/kritt
- X (Twitter)：https://x.com/Kritt_AI
- 威胁模型文档：https://github.com/Kritt-ai/open-kritt/blob/main/docs/threat-model.md
- 漏洞赏金主页（Blockian）：https://immunefi.com/profile/Blockian/
