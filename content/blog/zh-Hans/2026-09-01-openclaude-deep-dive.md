---
title: "OpenClaude：一个开源的跨模型 coding-agent CLI 全解析"
date: "2026-09-01"
description: "深度解析 Gitlawb/openclaude 项目：一个支持任意模型provider的开源 coding-agent CLI，包含完整架构、设计哲学、核心功能详解和实践指南"
tags: ["OpenClaude", "AI Agent", "Coding Agent", "CLI", "Ollama", "Claude"]
categories: ["AI", "Developer Tools", "Open Source"]
---

# OpenClaude：一个开源的跨模型 coding-agent CLI 全解析

## 前言

当 Claude Code 成为越来越多开发者的主力工具时，一个开源项目正在悄然改变游戏规则：**OpenClaude**（Gitlawb/openclaude）。

它是一个开源的 coding-agent CLI，核心理念是——**runs anywhere, uses anything**。不绑定任何特定模型厂商，一个 CLI 对接云端 API 和本地模型，支持 OpenAI 兼容接口、Gemini、GitHub Models、Codex、Ollama 等 20+ 种后端，同时保持以终端为中心的工作流。

这意味着：无论你用 GPT、Claude、DeepSeek 还是本地跑的 Qwen，打开的都是同一个界面。

---

## 一、项目概述

### 1.1 什么是 OpenClaude

OpenClaude 是一个开源的 coding-agent 命令行工具，由 GitLawb 团队开发维护。它的核心定位是：

> **一个 CLI，跨云端 API 和本地模型后端——无需为每个 Provider 准备独立工具。**

关键特性：
- 一个 CLI 对接所有支持的模型（20+ Provider）
- 引导式 Provider 设置 + 保存 profiles
- 完整的 coding-agent 工作流：Bash、文件工具、grep、glob、Agent、任务、MCP、斜杠命令
- 打包的 VS Code 扩展
- 像素艺术伙伴系统（Buddy），每次回车发射一个技能

### 1.2 核心数据

| 指标 | 数据 |
|------|------|
| GitHub | Gitlawb/openclaude |
| npm 周下载 | 活跃增长中 |
| 支持 Provider 数 | 20+ |
| 核心依赖 | Node.js >=22.0.0 |
| 构建工具 | Bun（仅源码构建需要） |
| 许可证 | MIT |

### 1.3 支持的模型提供商

| 类别 | Provider |
|------|----------|
| OpenAI 兼容 | OpenAI, OpenRouter, DeepSeek, Groq, Mistral, LM Studio |
| 专用 API | Gemini, GitHub Models, Codex OAuth, Codex |
| 本地推理 | Ollama, Atomic Chat, LM Studio |
| 聚合网关 | AI/ML API, Concentrate, LLMTR, ApiSmart, Fireworks AI |
| 国内特供 | Z.AI GLM Coding Plan, Xiaomi MiMo, LongCat (美团), NEAR AI |
| 云厂商 | AWS Bedrock, Vertex AI, Cloudflare Workers AI, Microsoft Foundry |
| 其他 | Hicap, ClinePass, OpenCode Zen/Go, Gitlawb Opengateway |

---

## 二、核心技术架构

### 2.1 设计哲学：Provider 抽象层

OpenClaude 的核心架构是一层 **Provider 抽象**：

```
┌─────────────────────────────────────────────┐
│              OpenClaude CLI                  │
│                                             │
│  ┌─────────┐ ┌─────────┐ ┌─────────────┐  │
│  │ Slash   │ │ Agent   │ │ Tool System │  │
│  │Commands │ │ System  │ │ (Bash/File) │  │
│  └────┬────┘ └────┬────┘ └──────┬──────┘  │
│       └────────────┴────────────┘          │
│                    │                        │
│         ┌─────────▼─────────┐               │
│         │  Provider Layer   │               │
│         │  (统一抽象接口)     │               │
│         └─────────┬─────────┘               │
│    ┌──────────────┼──────────────┐          │
│    ▼              ▼              ▼          │
│ OpenAI        Anthropic      Ollama         │
│ Compatible    Native         Local          │
└─────────────────────────────────────────────┘
```

**关键设计原则：**

1. **Provider 即插拔**：任何支持 OpenAI 兼容 API 或 Anthropic 原生 API 的服务，都可以无缝接入
2. **环境变量优先**：所有配置通过环境变量注入，无需修改代码
3. **配置文件持久化**：`/provider` 命令引导设置的 profile 保存到 `~/.openclaude-profile.json`，跨会话保持

### 2.2 Repo Map：代码库智能理解

OpenClaude 引入了一个独特功能——**Repo Map**，让 AI 模型在会话开始时就具备代码库的结构化理解。

**工作原理（五步）：**

1. **文件枚举**：通过 `git ls-files` 列出跟踪和未跟踪的文件
2. **符号提取**：使用 tree-sitter 解析源码文件，提取函数、类、类型和接口定义
3. **引用图**：构建有向图，边表示文件间的符号引用，加权因子为引用次数 × IDF
4. **PageRank 排名**：按结构重要性排名文件，被越多文件导入的文件排名越高
5. **渲染输出**：按排名遍历文件，输出路径和定义签名直到 token 预算耗尽

**启用方式：**

```bash
# 环境变量启用（会话开始时自动注入，1024 token）
REPO_MAP=1 openclaude

# 斜杠命令查看（2048 token 默认）
/repomap
/repomap --tokens 4096
/repomap --focus src/tools/
```

**技术细节：**
- 结果缓存到 `~/.openclaude/repomap-cache/`，按文件路径、mtime、大小作为 key
- 支持 TypeScript/JavaScript/Python
- 首次构建大型仓库（2000+ 文件）需要 20-30 秒（因为 WASM 解析），之后缓存命中在 100ms 内

### 2.3 Agent 路由与步数限制

OpenClaude 支持**按类型路由 Agent 到不同模型**，这对于成本优化和按能力分配任务非常有用。

**配置文件 `~/.openclaude/settings.json`：**

```json
{
  "agentModels": {
    "deepseek-v4-flash": {
      "base_url": "https://api.deepseek.com/v1",
      "api_key": "sk-your-key"
    },
    "zai-default": {
      "model": "glm-5.2",
      "base_url": "https://api.z.ai/api/coding/paas/v4",
      "api_key": "sk-your-key"
    },
    "gpt-4o": {
      "base_url": "https://api.openai.com/v1",
      "api_key": "sk-your-key"
    }
  },
  "agentRouting": {
    "Explore": "deepseek-v4-flash",
    "Plan": "gpt-4o",
    "general-purpose": "gpt-4o",
    "frontend-dev": "zai-default",
    "default": "gpt-4o"
  }
}
```

**步数限制（maxSteps）：**

```markdown
---
name: bounded-researcher
description: Use for focused research with bounded tool use
maxSteps: 8
---

You are a focused research agent.
```

当步数耗尽，OpenClaude 停止工具调用，要求 sub-agent 提供涵盖已完成工作、发现、剩余任务的简洁总结。

### 2.4 Buddy 像素伙伴系统

这是 OpenClaude 最有趣的设计——一个 **truecolor 像素艺术伙伴**，住在你的提示符旁边，空闲时眨眼，每次回车时发射专属技能。

```
/buddy                  孵化（或抚摸）你的伙伴
/buddy set robinhood    绿弓手——每次回车射箭
/buddy set kaio         金发战士——充能全屏能量波
/buddy set strawhat     橡皮拳，弹回
/buddy set merlin       闪烁火花流
/buddy set kage         旋转手里剑
/buddy set ember        真实热梯度的龙火
/buddy set corsair      炮弹带烟轨
/buddy name Robin       给伙伴起名字
/buddy set random       随机重置伙伴
/buddy mute             静音
```

支持 `prefersReducedMotion`，低色彩终端优雅降级为线描，需要终端至少 100 列宽。

---

## 三、快速上手教程

### 3.1 安装

**npm 安装（推荐）：**

```bash
npm install -g @gitlawb/openclaude@latest
```

**Arch Linux AUR：**

```bash
paru -S openclaude
```

**从源码构建：**

```bash
git clone https://github.com/Gitlawb/openclaude.git
cd openclaude

bun install
bun run build
npm link
```

**依赖要求：**
- Node.js >= 22.0.0
- ripgrep（`rg --version` 需在同终端可用）
- Bun 1.3.13+（仅源码构建需要）

### 3.2 快速启动 OpenAI 模型

```bash
# macOS / Linux
export CLAUDE_CODE_USE_OPENAI=1
export OPENAI_API_KEY=sk-your-key-here
export OPENAI_MODEL=gpt-4o

openclaude

# Windows PowerShell
$env:CLAUDE_CODE_USE_OPENAI="1"
$env:OPENAI_API_KEY="sk-your-key-here"
$env.OPENAI_MODEL="gpt-4o"

openclaude
```

### 3.3 快速启动本地 Ollama

```bash
# 确保 Ollama 运行并加载模型
ollama pull qwen2.5-coder:7b

# macOS / Linux
export CLAUDE_CODE_USE_OPENAI=1
export OPENAI_BASE_URL=http://localhost:11434/v1
export OPENAI_MODEL=qwen2.5-coder:7b

openclaude
```

**Ollama 上下文长度优化：**

OpenClaude 默认请求 32768 token 的上下文窗口，避免 Ollama 的 OpenAI 兼容 shim 悄悄截断历史记录。自定义：

```bash
export OPENCLAUDE_OLLAMA_NUM_CTX=65536
```

### 3.4 使用 /provider 引导设置

```bash
openclaude
# 内部运行 /provider 进行引导式 Provider 设置
# 运行 /onboard-github 进行 GitHub Models 引导
```

`/provider` 会保存 profile 到 `~/.openclaude-profile.json`，无需每次设置环境变量。

### 3.5 恢复和分叉会话

```bash
# 按会话 ID 恢复
openclaude --resume <session-id>

# 继续当前目录最近的会话
openclaude --continue

# 分叉会话（创建新 ID 保留历史）
openclaude --resume <session-id> --fork-session
openclaude --continue --fork-session
```

### 3.6 后台任务

```bash
# 后台运行长任务
openclaude --bg "fix failing tests"
openclaude --bg --name auth-refactor "refactor auth middleware"

# 查看状态和日志
openclaude ps
openclaude logs auth-refactor
openclaude logs auth-refactor -f
openclaude kill auth-refactor
```

后台会话存储在 `~/.openclaude/bg-sessions/`，是本地子进程，不启动守护进程或网络服务。

---

## 四、进阶配置指南

### 4.1 Claude on Vertex AI

```bash
# 安装可选包
npm i -g google-auth-library

# 本地 ADC（交互式）
gcloud auth application-default login

# 或服务账号密钥（无头/CI）
export GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account.json

export CLAUDE_CODE_USE_VERTEX=1
export ANTHROPIC_VERTEX_PROJECT_ID=my-gcp-project
export CLOUD_ML_REGION=us-east5

openclaude --model claude-sonnet-4-6
```

### 4.2 DeepSeek

```bash
export CLAUDE_CODE_USE_OPENAI=1
export OPENAI_API_KEY=sk-...
export OPENAI_BASE_URL=https://api.deepseek.com/v1
export OPENAI_MODEL=deepseek-v4-flash
```

### 4.3 Gemini

```bash
export CLAUDE_CODE_USE_GEMINI=1
export GEMINI_API_KEY=...
export GEMINI_MODEL=gemini-3-flash-preview
```

### 4.4 国内模型配置

**Z.AI GLM Coding Plan：**

```bash
export CLAUDE_CODE_USE_OPENAI=1
export OPENAI_API_KEY=sk-your-key
export OPENAI_BASE_URL=https://api.z.ai/api/coding/paas/v4
export OPENAI_MODEL=glm-5.2
```

**Xiaomi MiMo：**

```bash
export CLAUDE_CODE_USE_OPENAI=1
export MIMO_API_KEY=...
export OPENAI_BASE_URL=https://api.mimo.mi.com/v1
export OPENAI_MODEL=mimo-v2.5-pro
```

**NEAR AI（统一网关）：**

```bash
export CLAUDE_CODE_USE_OPENAI=1
export NEARAI_API_KEY=...
export OPENAI_BASE_URL=https://cloud-api.near.ai/v1
export OPENAI_MODEL=anthropic/claude-sonnet-4-6
```

### 4.5 Web 搜索配置

默认情况下，非 Anthropic 模型使用 DuckDuckGo 进行 WebSearch。

如需更可靠的方式，配置 Firecrawl：

```bash
export FIRECRAWL_API_KEY=your-key-here
```

Firecrawl 免费额度：500 credits/月。

---

## 五、设计哲学归纳

### 5.1 哲学一：Provider 无锁定（Provider Agnosticism）

OpenClaude 不绑定任何模型厂商。20+ 种 Provider 支持是通过两层抽象实现的：

- **OpenAI 兼容层**：任何提供 `/v1/chat/completions` 的服务均可接入
- **Anthropic 原生层**：支持 Claude 直接 API、Bedrock、Vertex

这意味着：组织可以自由切换模型，无需改变工作流程。

### 5.2 哲学二：终端优先（Terminal-First）

所有功能都通过 CLI 交付，斜杠命令（`/provider`、`/buddy`、`/repomap`）提供交互式体验。这是工程效率的选择——开发者已经在终端中，工具应该来找他们，而不是让他们切换到 GUI。

### 5.3 哲学三：渐进复杂性（Progressive Complexity）

从零配置开始，一个 `openclaude` 命令就能跑。使用 `/provider` 逐步建立 Provider profile。用 `settings.json` 添加 Agent 路由。高级用户可以源码构建、配置 gRPC 服务、设置 MCP 服务器。

不要一开始就构建完整配置。从 `npm install -g` 开始，在使用中逐步定制。

### 5.4 哲学四：本地优先，但不止于本地

Ollama、Atomic Chat、LM Studio 支持让本地推理成为可能——无需 API 费用、离线可用、数据不离开机器。但 OpenClaude 同时支持云端 API，确保本地算力不足时依然可用。

**两者不是二选一，而是一个 CLI 的两种模式。**

### 5.5 哲学五：Buddy 是功能，不是噱头

像素伙伴系统不只是 UI 装饰。它解决了两个实际问题：

1. **进度反馈**：技能发射的视觉反馈让你知道 Agent 正在工作
2. **情感连接**：长期使用的工具更容易被坚持使用

Buddy 尊重 `prefersReducedMotion` 和低色彩终端，是有意识地处理无障碍需求的工程决策。

---

## 六、核心功能总结

### 6.1 功能矩阵

| 功能 | 描述 |
|------|------|
| **多 Provider 支持** | 20+ 云端和本地模型后端 |
| **Provider Profile** | 引导设置 + 保存配置，跨会话持久化 |
| **Coding 工作流** | Bash、文件读写编辑、grep、glob、Agent、任务、MCP |
| **流式响应** | 实时 token 输出和工具进度 |
| **工具调用** | 多步工具循环（模型调用→工具执行→后续响应） |
| **图像输入** | URL 和 base64 图像（支持 vision 的 Provider） |
| **Repo Map** | 基于 PageRank 的代码库结构理解 |
| **Agent 路由** | 按类型路由 Agent 到不同模型 |
| **步数限制** | 自定义 Agent 的最大工具调用步数 |
| **后台任务** | 子进程后台运行，非守护进程 |
| **会话管理** | 恢复、分叉、会话状态追踪 |
| **Buddy 系统** | 像素艺术伙伴，技能发射动画 |
| **VS Code 扩展** | 启动集成和主题支持 |
| **gRPC 服务** | 头less 模式，集成到其他应用 |
| **MCP 支持** | Model Context Protocol 集成 |

### 6.2 与 Claude Code 的区别

| 维度 | Claude Code | OpenClaude |
|------|------------|-----------|
| **Provider 绑定** | 仅 Anthropic | 20+ Provider |
| **本地模型** | 不支持 | Ollama, Atomic Chat, LM Studio |
| **国内模型** | 不直接支持 | MiMo, GLM, LongCat, NEAR AI 等 |
| **Buddy 系统** | 无 | 有 |
| **Repo Map** | 无（但有类似项目级上下文） | 有（PageRank 驱动） |
| **Provider Profile** | 无 | 有 |
| **开源** | 否 | 是（MIT） |

---

## 七、适用场景分析

### 7.1 适合使用 OpenClaude 的场景

1. **多模型团队**：团队成员使用不同模型，期望统一 CLI 体验
2. **成本敏感开发者**：需要本地运行避免 API 费用
3. **隐私敏感项目**：代码不离开本地机器
4. **国内开发者**：需要访问 GLM、MiMo 等国内模型
5. **离线环境**：无网络但需要 AI 辅助编程
6. **Provider 探索**：想尝试不同模型对比效果

### 7.2 可能更适合 Claude Code 的场景

1. **已深度集成 Anthropic 生态**：使用 Bedrock/Vertex 作为企业标准
2. **需要最新 Anthropic 功能**：Tool use、MCP 等特性可能非同步支持
3. **极简需求**：只用一个 Provider，不需要灵活性

---

## 八、给开发者的建议

### 8.1 本周可以做的事情

1. **安装体验**：`npm install -g @gitlawb/openclaude@latest`，5 分钟跑起来
2. **配置 Ollama**：如果你有支持 Apple Silicon 或 NVIDIA GPU 的机器，用 Ollama 跑 Qwen2.5-Coder，感受零 API 成本的 AI 编程
3. **试用 Buddy**：`/buddy hatch`，看看像素伙伴长什么样
4. **尝试 Repo Map**：在一个大型项目运行 `/repomap --stats`，看看结构化理解效果

### 8.2 进阶路径

1. **配置 Provider Profile**：用 `/provider` 建立多个 Provider profile，快速切换
2. **设置 Agent 路由**：将探索任务路由到便宜模型，将复杂重构路由到强模型
3. **启用 Repo Map**：在大型项目设置 `REPO_MAP=1`，观察上下文质量提升
4. **后台任务自动化**：将重复性任务写成脚本，用 `openclaude --bg` 自动化

### 8.3 源码贡献

```bash
git clone https://github.com/Gitlawb/openclaude.git
cd openclaude

bun install
bun run dev          # 开发模式
bun test             # 单元测试
bun run test:coverage # 覆盖率报告
bun run smoke        # 冒烟测试
```

PR 检查在 `.github/workflows/pr-checks.yml`，包含 lint、类型检查、测试。

---

## 结语

OpenClaude 代表了一种不同的思路：不是做一个更好的 Claude Code，而是做一个**不挑模型的 Agent CLI**。

它的核心价值主张是：**自由**。不锁定 Provider、不绑定生态、不要求用户为每个模型维护独立的工具链。一个 CLI，适配所有。

对于当前 AI 编程工具碎片化的现状，这是一剂有意义的解药。无论你是 cost-conscious 的个人开发者，还是需要多模型组合的企业团队，OpenClaude 都值得一试。

**相关资源：**
- GitHub: https://github.com/Gitlawb/openclaude
- npm: https://www.npmjs.com/package/@gitlawb/openclaude
- Discord: https://discord.gg/k68zFR6AcB
- X: @gitlawb

---

**首发于微信公众号「比特财商」**
