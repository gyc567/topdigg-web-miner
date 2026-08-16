---
title: "Eve：Vercel 开源 Agent 框架——以目录结构管理 AI 智能体"
date: "2026-08-16"
description: "深度解析 Vercel Eve 开源 Agent 框架，Next.js for Agents，以目录结构管理智能体，支持子智能体、工作流、MCP 集成"
tags:
  - Eve
  - Vercel
  - AI Agent
  - 智能体框架
  - 开源
  - 工作流
  - MCP
  - TypeScript
categories:
  - AI Agent
  - 智能体框架
  - Vercel 开源
  - TypeScript
  - 工作流引擎
---

# Eve：Vercel 开源 Agent 框架——以目录结构管理 AI 智能体

## 项目背景与核心问题

### AI Agent 开发的基础设施困境

在 AI Agent 开发领域，开发者面临着一个普遍的问题：**构建 Agent 循环（loop）之后，如何处理基础设施挑战？**

| 痛点 | 描述 | 现有方案的不足 |
|------|------|---------------|
| **代码组织混乱** | 智能体的代码、配置、指令散落各处 | 缺乏统一的项目结构 |
| **部署复杂** | 状态管理、持久化、错误恢复难以处理 | 需要大量定制开发 |
| **多渠道集成困难** | Slack、Discord、Telegram 等渠道接入复杂 | 每个渠道需要独立适配 |
| **模型切换不便** | 依赖单一模型提供商，风险集中 | 缺乏灵活的模型切换机制 |
| **子智能体管理** | 复杂任务难以分解和委托 | 缺乏标准化架构 |

### Eve 的诞生

> **"Eve — 为 Agent 提供的 Next.js 体验"**

Eve 是 Vercel 于 2025 年 6 月发布的**开源 Agent 构建框架**，它将 Web 开发领域积累十年的最佳实践引入 AI Agent 开发：

```
┌─────────────────────────────────────────────────────────────────┐
│                      Eve 核心定位                                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  🎯 定位:        "Next.js for Agents"                            │
│  🏢 开发:        Vercel                                          │
│  📅 发布:        2025年6月                                       │
│  📦 语言:        TypeScript                                      │
│  🛠️ 架构:        目录结构即智能体                                │
│  🔌 集成:        MCP、Slack、Discord、多渠道支持                  │
│  ⚙️ 引擎:        基于 Vercel Workflow SDK                        │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 项目概述

### 什么是 Eve？

Eve 是一个**用于构建和部署 AI Agent 的生产级框架**，它的核心理念是将每个 Agent 视为一个独立的目录，所有相关代码、配置和指令都集中管理。

### 核心特性一览

| 特性 | 描述 |
|------|------|
| 🗂️ **目录即智能体** | 每个 Agent 是一个独立目录，包含完整定义 |
| 📝 **Markdown 指令** | 系统提示词以 Markdown 格式编写，直观易维护 |
| 🔧 **工具即文件** | 每个工具是独立的 TypeScript 文件，自动注册 |
| 🔄 **模型自动切换** | AI Gateway 自动处理模型提供商的故障切换 |
| 💬 **多渠道支持** | 内置 Slack、Discord、Teams、Telegram 等支持 |
| ⚡ **工作流驱动** | 基于持久化工作流，支持暂停、恢复、调度 |
| 🔌 **MCP 集成** | 通过 MCP 服务器连接外部工具 |
| 🏗️ **子智能体支持** | 支持构建 Agent Team，分解复杂任务 |

---

## 架构设计深度解析

### 核心理念：目录即智能体

Eve 最重要的设计决策是将**目录结构作为组织智能体的核心方式**：

```
my-agent/
├── package.json           # 项目依赖配置
├── tsconfig.json          # TypeScript 配置
├── .env.example           # 环境变量示例
└── agent/
    ├── agent.ts           # Agent 核心逻辑
    ├── instructions.md    # 系统指令（Markdown）
    ├── model.ts           # 模型配置
    ├── channels/          # 渠道配置
    │   ├── eve.ts         # Eve 内置渠道
    │   ├── slack.ts       # Slack 集成
    │   └── discord.ts     # Discord 集成
    └── tools/             # 工具定义
        ├── search.ts      # 搜索工具
        └── send.ts        # 发送消息工具
```

**为什么选择目录结构？**

| 优势 | 说明 |
|------|------|
| **自包含** | Agent 的所有相关文件都在同一目录，便于移动和复用 |
| **直观** | 文件结构清晰，新开发者能快速理解 |
| **版本控制友好** | 整个 Agent 可以作为独立模块进行版本管理 |
| **部署简单** | 目录即部署单元，Vercel 平台天然支持 |

### 工作流引擎

Eve 的底层基于 **Vercel 开源的 Workflow SDK**，这带来了以下能力：

```
┌─────────────────────────────────────────────────────────────┐
│                    工作流架构                                  │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│   用户会话                                                    │
│       │                                                      │
│       ▼                                                      │
│   ┌─────────────────────────────────────────────────────┐   │
│   │              持久化工作流 (Workflow)                  │   │
│   │                                                      │   │
│   │   ┌──────────┐    ┌──────────┐    ┌──────────┐     │   │
│   │   │  Step 1  │───▶│  Step 2  │───▶│  Step 3  │     │   │
│   │   └──────────┘    └──────────┘    └──────────┘     │   │
│   │        │               │               │            │   │
│   │        ▼               ▼               ▼            │   │
│   │   ┌─────────────────────────────────────────────┐   │   │
│   │   │              状态持久化                      │   │   │
│   │   │         (支持暂停、恢复、调度)                │   │   │
│   │   └─────────────────────────────────────────────┘   │   │
│   └─────────────────────────────────────────────────────┘   │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

**工作流的核心优势：**

- **持久化状态**：会话可以在任意步骤暂停和恢复
- **错误恢复**：失败的工作流可以从断点重试
- **调度执行**：支持定时任务和延迟执行
- **并发控制**：内置并发限制，防止资源耗尽

### 模型与 AI Gateway

Eve 通过 **AI Gateway** 实现模型的统一管理和自动故障切换：

```typescript
// agent/model.ts
export default defineModel({
  // 自动从环境变量 EVE_API_KEY 获取凭证
  // 自动处理模型提供商的故障切换
  provider: "openai",
  model: "gpt-4o",
});
```

**AI Gateway 的能力：**

| 能力 | 说明 |
|------|------|
| **Provider 抽象** | 统一的接口，屏蔽不同提供商的差异 |
| **自动故障切换** | 主 Provider 失败时自动切换到备用 |
| **负载均衡** | 多 Provider 间的请求分发 |
| **用量监控** | 追踪各 Provider 的使用量和成本 |
| **自定义 Provider** | 通过 `EVE_MODEL_BASE_URL` 配置自定义端点 |

### 工具系统

Eve 的工具系统设计简洁而强大：

```typescript
// agent/tools/search.ts
export const search = defineTool({
  name: "search",
  description: "Search the web for information",
  
  parameters: z.object({
    query: z.string().describe("The search query"),
    limit: z.number().optional().describe("Max results"),
  }),

  execute: async ({ query, limit = 10 }) => {
    // 工具实现逻辑
    const results = await webSearch({ query, limit });
    return results;
  },
});
```

**工具系统的特点：**

- **文件即定义**：每个工具是独立的 `.ts` 文件
- **自动注册**：文件名自动作为工具名，无需额外注册
- **类型安全**：完整的 TypeScript 类型推导
- **Schema 验证**：基于 Zod 的参数验证

---

## 设计哲学

### 核心理念

Eve 的设计哲学可以概括为以下几个核心原则：

#### 1. 约定优于配置（Convention over Configuration）

> **"像 Next.js 一样，用约定减少决策负担，让开发者专注业务逻辑。"**

Eve 为项目结构、文件命名、工具注册等都制定了清晰的约定，开发者只需要遵循约定，无需做额外配置。

#### 2. 目录即边界（Directory as Boundary）

> **"一个目录定义一个智能体的完整边界，包括代码、配置、指令和渠道。"**

这种设计使得：
- 智能体可以完整地移动、复制、版本化
- 团队可以独立开发和测试单个智能体
- 部署变得简单而可靠

#### 3. 工作流优先（Workflow First）

> **"所有会话都是持久化工作流，这意味着可靠性和可恢复性是内置的。"**

#### 4. 渠道抽象（Channel Abstraction）

> **"智能体的核心逻辑与渠道解耦，同一个智能体可以接入任何渠道。"**

#### 5. 开发者体验优先（DX First）

- **即时反馈**：`eve dev` 支持热重载开发
- **类型安全**：完整的 TypeScript 支持
- **清晰错误**：友好的错误信息和调试建议

### 与其他框架的对比

| 维度 | Eve | LangChain | CrewAI |
|------|-----|-----------|--------|
| **组织方式** | 目录结构 | 代码优先 | Role/Agent 定义 |
| **状态管理** | 内置工作流 | 需自行实现 | 有限支持 |
| **渠道集成** | 内置多渠道 | 需自行适配 | 需自行适配 |
| **模型切换** | AI Gateway | 多 Provider 支持 | 多 Provider 支持 |
| **部署体验** | 类 Vercel 体验 | 需要自行配置 | 需要自行配置 |
| **学习曲线** | 低 | 高 | 中 |

---

## 快速入门教程

### 环境准备

| 要求 | 说明 |
|------|------|
| **Node.js** | 24.0.0 或更高版本 |
| **包管理器** | npm、pnpm 或 bun |
| **API Key** | Vercel AI Gateway API Key |

### 安装 Eve CLI

```bash
# 使用 npm
npm install -g eve-cli

# 或使用 pnpm
pnpm add -g eve-cli

# 验证安装
eve --version
```

### 创建第一个 Agent

#### 步骤 1：初始化项目

```bash
# 创建新项目
eve init my-first-agent

# 进入项目目录
cd my-first-agent

# 安装依赖
npm install
```

#### 步骤 2：配置环境变量

```bash
# 复制环境变量模板
cp .env.example .env

# 编辑 .env 文件，添加你的 API Key
# EVE_API_KEY=your_api_key_here
```

#### 步骤 3：编写系统指令

```markdown
<!-- agent/instructions.md -->
# 我的第一个 Agent

你是一个友好的 AI 助手，专门帮助用户回答问题。

## 能力
- 回答常见问题
- 提供信息查询
- 协助解决问题

## 行为准则
- 使用友好的语气
- 回答简洁明了
- 遇到不确定的问题，诚实地说明
```

#### 步骤 4：定义模型

```typescript
// agent/model.ts
import { defineModel } from "eve";

export default defineModel({
  provider: "openai",
  model: "gpt-4o",
});
```

#### 步骤 5：实现工具

```typescript
// agent/tools/search.ts
import { defineTool } from "eve";
import { z } from "zod";

export const search = defineTool({
  name: "search",
  description: "Search the web for information",
  parameters: z.object({
    query: z.string().describe("The search query"),
  }),
  execute: async ({ query }) => {
    // 实现搜索逻辑
    const results = await performSearch(query);
    return results;
  },
});
```

#### 步骤 6：配置渠道

```typescript
// agent/channels/eve.ts
import { defineChannel } from "eve";

export default defineChannel({
  type: "eve",
  // Eve 内置渠道，无需额外配置
});
```

#### 步骤 7：运行 Agent

```bash
# 开发模式（支持热重载）
eve dev

# 或构建生产版本
eve build

# 部署到 Vercel
eve deploy
```

---

## 实战教程：构建多渠道客服 Agent

### 项目结构

```
customer-service-agent/
├── package.json
├── tsconfig.json
├── .env.example
└── agent/
    ├── agent.ts
    ├── instructions.md
    ├── model.ts
    ├── channels/
    │   ├── slack.ts
    │   ├── discord.ts
    │   └── telegram.ts
    └── tools/
        ├── lookup-order.ts
        ├── faq.ts
        └── escalate.ts
```

### 完整实现

#### 1. 系统指令

```markdown
<!-- agent/instructions.md -->
# 客服智能体

你是一个专业的客户服务代表，帮助客户解决订单问题和常见疑问。

## 可用工具
- `lookup_order`: 查询订单状态
- `faq`: 回答常见问题
- `escalate`: 转接人工客服

## 处理流程
1. 首先尝试使用 FAQ 回答客户问题
2. 如果无法回答，尝试查询订单相关信息
3. 如果问题无法解决，使用 escalate 转接人工

## 注意事项
- 保持专业和友好的语气
- 不要泄露客户的敏感信息
- 遇到投诉要冷静处理
```

#### 2. 订单查询工具

```typescript
// agent/tools/lookup-order.ts
import { defineTool } from "eve";
import { z } from "zod";

export const lookupOrder = defineTool({
  name: "lookup_order",
  description: "Look up order status by order ID",
  parameters: z.object({
    orderId: z.string().describe("The order ID to look up"),
  }),
  execute: async ({ orderId }) => {
    // 调用后端 API 查询订单
    const order = await fetchOrder(orderId);
    
    return {
      orderId: order.id,
      status: order.status,
      items: order.items,
      total: order.total,
      estimatedDelivery: order.estimatedDelivery,
    };
  },
});
```

#### 3. FAQ 工具

```typescript
// agent/tools/faq.ts
import { defineTool } from "eve";
import { z } from "zod";

const FAQ_DATA = {
  shipping: "我们的标准配送时间为 3-5 个工作日。",
  returns: "我们提供 30 天无理由退换服务。",
  payment: "我们支持信用卡、PayPal 和 Apple Pay。",
};

export const faq = defineTool({
  name: "faq",
  description: "Answer frequently asked questions",
  parameters: z.object({
    topic: z.enum(["shipping", "returns", "payment"]).describe("The FAQ topic"),
  }),
  execute: async ({ topic }) => {
    return FAQ_DATA[topic] || "抱歉，我没有找到相关问题的答案。";
  },
});
```

#### 4. Slack 渠道配置

```typescript
// agent/channels/slack.ts
import { defineChannel } from "eve";

export default defineChannel({
  type: "slack",
  config: {
    botToken: process.env.SLACK_BOT_TOKEN,
    signingSecret: process.env.SLACK_SIGNING_SECRET,
  },
});
```

#### 5. Agent 核心逻辑

```typescript
// agent/agent.ts
import { EveAgent } from "eve";
import { search } from "./tools/search";
import { lookupOrder } from "./tools/lookup-order";
import { faq } from "./tools/faq";
import { escalate } from "./tools/escalate";

export default new EveAgent({
  name: "customer-service",
  tools: [search, lookupOrder, faq, escalate],
});
```

### 运行和测试

```bash
# 启动开发服务器
eve dev

# 测试 Eve 渠道
eve chat

# 测试 Slack 渠道（需要配置 SLACK_BOT_TOKEN）
eve dev --channel slack
```

---

## 多智能体与子智能体

### 构建 Agent Team

Eve 支持将复杂任务分解为多个子智能体：

```
┌─────────────────────────────────────────────────────────────┐
│                    Agent Team 架构                           │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│                    主智能体 (Manager)                        │
│                         │                                    │
│          ┌──────────────┼──────────────┐                    │
│          ▼              ▼              ▼                    │
│    ┌──────────┐   ┌──────────┐   ┌──────────┐             │
│    │ 子智能体A │   │ 子智能体B │   │ 子智能体C │             │
│    │ (研究)    │   │ (分析)    │   │ (报告)    │             │
│    └──────────┘   └──────────┘   └──────────┘             │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 子智能体示例

```typescript
// agents/researcher/agent.ts
export default new EveAgent({
  name: "researcher",
  description: "Research agent for gathering information",
  tools: [search, scrape],
});

// agents/analyst/agent.ts
export default new EveAgent({
  name: "analyst",
  description: "Analysis agent for processing data",
  tools: [analyze, visualize],
});

// main-agent/agent.ts
import { researcher } from "./agents/researcher";
import { analyst } from "./agents/analyst";

export default new EveAgent({
  name: "manager",
  tools: [], // 工具通过委托给子智能体使用
  subagents: {
    researcher,
    analyst,
  },
});
```

---

## 渠道集成详解

### 支持的渠道

| 渠道 | 说明 | 配置要求 |
|------|------|---------|
| **Eve** | 内置 CLI 聊天界面 | 无需额外配置 |
| **Slack** | 企业团队协作平台 | Bot Token, Signing Secret |
| **Discord** | 社区和游戏平台 | Bot Token |
| **Teams** | Microsoft 协作平台 | App ID, App Password |
| **Telegram** | 即时通讯 | Bot Token |
| **Twilio** | SMS 和语音 | Account SID, Auth Token |
| **GitHub** | 代码和 DevOps | App ID, Private Key |
| **Linear** | 项目管理 | API Key |

### 渠道配置示例

```typescript
// Slack 配置
export default defineChannel({
  type: "slack",
  config: {
    botToken: process.env.SLACK_BOT_TOKEN!,
    signingSecret: process.env.SLACK_SIGNING_SECRET!,
    // 可选：指定监听的事件类型
    events: ["message", "app_mention"],
  },
});

// Discord 配置
export default defineChannel({
  type: "discord",
  config: {
    token: process.env.DISCORD_BOT_TOKEN!,
    intents: ["Guilds", "GuildMessages"],
  },
});
```

---

## MCP 集成

### 什么是 MCP？

MCP（Model Context Protocol）是一种标准协议，允许 AI 系统连接外部工具和数据源。Eve 原生支持 MCP 服务器。

### 配置 MCP 服务器

```typescript
// agent/mcp.ts
import { McpServer } from "eve";

export const filesystem = new McpServer({
  name: "filesystem",
  command: "npx",
  args: ["-y", "@modelcontextprotocol/server-filesystem", "/tmp"],
});

export const github = new McpServer({
  name: "github",
  command: "npx",
  args: ["-y", "@modelcontextprotocol/server-github"],
  env: {
    GITHUB_TOKEN: process.env.GITHUB_TOKEN!,
  },
});
```

---

## 归纳与总结

### 核心观点总结

#### 1. 框架的本质是约定

Eve 最重要的贡献不是代码，而是一套**清晰的约定体系**：

> **"约定减少决策负担，让开发者专注于真正重要的业务逻辑。"**

#### 2. 目录结构是组织复杂性的利器

将"目录"作为智能体的边界，是一个简单但强大的设计决策：

- **一致性**：所有开发者都知道去哪里找什么
- **可组合性**：目录可以嵌套，智能体可以组合
- **可版本化**：整个智能体可以进行版本控制和发布

#### 3. 工作流是可靠性的基础

持久化工作流不仅仅是"状态保存"，它意味着：

| 能力 | 价值 |
|------|------|
| **错误恢复** | 失败后可以从断点重试，而不是从头开始 |
| **暂停/恢复** | 耗时任务可以分步执行 |
| **调度执行** | 可以安排在特定时间执行 |
| **并发控制** | 防止资源耗尽，保证系统稳定性 |

#### 4. 渠道抽象释放了灵活性

同一个智能体可以接入不同渠道，意味着：

- **一次开发，多端部署**：智能体逻辑只需编写一次
- **渠道特定优化**：每个渠道可以有定制行为
- **独立演进**：渠道和智能体可以独立迭代

### 适用场景

✅ **强烈推荐使用 Eve**：

- 需要快速构建生产级 Agent 的团队
- 需要多渠道接入的企业应用
- 需要可靠状态管理的复杂对话场景
- 熟悉 Next.js/Vercel 生态的开发者

⚠️ **需要评估**：

- 简单的单轮问答场景（可能过于复杂）
- 需要极端定制化的场景（受约定限制）
- 对延迟极其敏感的场景（工作流有额外开销）

❌ **不太适合**：

- 纯研究目的的 Agent 实验
- 资源极其受限的边缘部署
- 需要完全控制底层实现的场景

### 未来展望

Eve 作为一个新兴框架，未来发展值得关注：

1. **更丰富的工具生态**：官方和社区提供的工具库
2. **更深入的 Vercel 集成**：与 Vercel 平台的更多联动
3. **可视化调试**：类似 Next.js DevTools 的 Agent 调试体验
4. **企业级特性**：更完善的权限管理和审计日志

---

## 资源链接

### 官方资源

| 资源 | 链接 |
|------|------|
| 🌐 官方网站 | https://vercel.com/ |
| 💻 GitHub 仓库 | https://github.com/vercel/eve |
| 📚 文档中心 | （即将推出） |
| 🐦 Twitter | @vercel |

### 安装资源

| 平台 | 安装命令 |
|------|---------|
| npm | `npm install -g eve-cli` |
| pnpm | `pnpm add -g eve-cli` |
| 源码 | `git clone && npm install && npm run build` |

### 环境要求

| 要求 | 最低版本 |
|------|---------|
| Node.js | 24.0.0+ |
| npm/pnpm/bun | 最新版本 |

---

## 结语

Eve 代表了 **AI Agent 开发框架的一个重要方向——将 Web 开发领域积累的最佳实践引入 Agent 开发领域**。

它的设计哲学提醒我们：**好的框架不只是提供工具，更是提供约定；不只是解决当下问题，更是为未来留出空间。**

> **"Next.js 改变了 Web 开发的方式，Eve 正在改变 Agent 开发的方式。"**

---

*本文基于 Vercel Eve 开源项目编写，相关信息来源包括 GitHub 仓库和官方公告。*

**Sources:**
- [GitHub - vercel/eve](https://github.com/vercel/eve)
- [Vercel Agentic Infrastructure](https://vercel.com/)
- [腾讯网 - Vercel发布开源智能体框架Eve](https://so.html5.qq.com/page/real/search_news?docid=70000021_8556a54498293652)
