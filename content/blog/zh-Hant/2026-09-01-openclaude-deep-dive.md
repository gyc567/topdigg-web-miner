---
title: "OpenClaude：開源的跨模型 coding-agent CLI 全面解析"
date: "2026-09-01"
description: "深度解析 Gitlawb/openclaude 專案：一個支援任意模型provider的開源 coding-agent CLI，包含完整架構、設計哲學、核心功能詳解和實踐指南"
tags: ["OpenClaude", "AI Agent", "Coding Agent", "CLI", "Ollama", "Claude"]
categories: ["AI", "Developer Tools", "Open Source"]
---

# OpenClaude：開源的跨模型 coding-agent CLI 全面解析

## 前言

當 Claude Code 成為越來越多開發者的主力工具時，一個開源專案正在悄然改變遊戲規則：**OpenClaude**（Gitlawb/openclaude）。

它是一個開源的 coding-agent 命令列工具，核心理念是——**runs anywhere, uses anything**。不綁定任何特定模型廠商，一個 CLI 對接雲端 API 和本地模型，支援 OpenAI 兼容介面、Gemini、GitHub Models、Codex、Ollama 等 20+ 種後端，同時保持以終端為中心的工作流。

---

## 一、專案概述

### 1.1 什麼是 OpenClaude

OpenClaude 是一個開源的 coding-agent 命令列工具，由 GitLawb 團隊開發維護。核心定位：

> **一個 CLI，跨雲端 API 和本地模型後端——無需為每個 Provider 準備獨立工具。**

關鍵特性：
- 一個 CLI 對接所有支援的模型（20+ Provider）
- 引導式 Provider 設定 + 保存 profiles
- 完整的 coding-agent 工作流
- 打包的 VS Code 擴展
- 像素藝術夥伴系統（Buddy）

### 1.2 支援的模型提供商

| 類別 | Provider |
|------|----------|
| OpenAI 兼容 | OpenAI, OpenRouter, DeepSeek, Groq, Mistral, LM Studio |
| 專用 API | Gemini, GitHub Models, Codex OAuth, Codex |
| 本地推理 | Ollama, Atomic Chat, LM Studio |
| 聚合閘道 | AI/ML API, Concentrate, LLMTR, ApiSmart, Fireworks AI |
| 國內特供 | Z.AI GLM Coding Plan, Xiaomi MiMo, LongCat (美團), NEAR AI |
| 雲廠商 | AWS Bedrock, Vertex AI, Cloudflare Workers AI, Microsoft Foundry |

---

## 二、核心技術架構

### 2.1 設計哲學：Provider 抽象層

OpenClaude 的核心架構是一層 **Provider 抽象**。任何支援 OpenAI 兼容 API 或 Anthropic 原生 API 的服務，都可以無縫接入。

**關鍵設計原則：**

1. **Provider 即插拔**：不綁定廠商
2. **環境變數優先**：所有配置通過環境變數注入
3. **設定檔持久化**：`/provider` 保存到 `~/.openclaude-profile.json`

### 2.2 Repo Map：代碼庫智慧理解

OpenClaude 引入了**Repo Map**功能，讓 AI 模型在會話開始時就具備代碼庫的結構化理解。

**工作原理（五步）：**

1. **檔案列舉**：通過 `git ls-files` 列出檔案
2. **符號提取**：使用 tree-sitter 解析源碼，提取函數、類、類型和介面定義
3. **引用圖**：構建有向圖，按引用次數 × IDF 加權
4. **PageRank 排名**：按結構重要性排名檔案
5. **渲染輸出**：按排名遍歷輸出直到 token 預算耗盡

### 2.3 Agent 路由與步數限制

OpenClaude 支援**按類型路由 Agent 到不同模型**，支持在 `~/.openclaude/settings.json` 中配置：

```json
{
  "agentModels": {
    "deepseek-v4-flash": { "base_url": "...", "api_key": "..." }
  },
  "agentRouting": {
    "Explore": "deepseek-v4-flash",
    "default": "gpt-4o"
  }
}
```

**步數限制（maxSteps）**：

```markdown
---
name: bounded-researcher
maxSteps: 8
---

You are a focused research agent.
```

### 2.4 Buddy 像素夥伴系統

一個 **truecolor 像素藝術夥伴**，住在提示符旁邊，每次回車發射專屬技能。

```
/buddy set robinhood    綠弓手——每次回車射箭
/buddy set kaio         金髮戰士——充能全屏能量波
/buddy set ember        龍火
```

---

## 三、快速上手教程

### 3.1 安裝

```bash
npm install -g @gitlawb/openclaude@latest
```

### 3.2 快速啟動 OpenAI 模型

```bash
export CLAUDE_CODE_USE_OPENAI=1
export OPENAI_API_KEY=sk-your-key-here
export OPENAI_MODEL=gpt-4o
openclaude
```

### 3.3 快速啟動本地 Ollama

```bash
ollama pull qwen2.5-coder:7b

export CLAUDE_CODE_USE_OPENAI=1
export OPENAI_BASE_URL=http://localhost:11434/v1
export OPENAI_MODEL=qwen2.5-coder:7b
openclaude
```

### 3.4 會話管理

```bash
openclaude --resume <session-id>
openclaude --continue
openclaude --bg "fix failing tests"
openclaude ps && openclaude logs auth-refactor
```

---

## 四、設計哲學歸納

### 4.1 Provider 無鎖定
20+ 種 Provider 支持，通過 OpenAI 兼容層 + Anthropic 原生層兩層抽象實現。

### 4.2 終端優先
所有功能通過 CLI 交付，開發者已在終端中，工具應該來找他。

### 4.3 漸進複雜性
從零配置開始，一個 `openclaude` 命令就能跑。使用中逐步定製。

### 4.4 本地優先，但不僅於本地
Ollama、Atomic Chat、LM Studio 支援本地推理，無 API 費用、離線可用、資料不離開機器。但同時支援雲端 API。

---

## 五、核心功能總結

| 功能 | 描述 |
|------|------|
| 多 Provider 支援 | 20+ 雲端和本地模型後端 |
| Provider Profile | 引導設定 + 保存配置 |
| Coding 工作流 | Bash、檔案工具、grep、glob、Agent、任務、MCP |
| Repo Map | 基於 PageRank 的代碼庫結構理解 |
| Agent 路由 | 按類型路由 Agent 到不同模型 |
| Buddy 系統 | 像素藝術夥伴，技能發射動畫 |
| 後台任務 | 子行程後台運行，非守護行程 |
| VS Code 擴展 | 啟動集成和主題支援 |
| gRPC 服務 | 頭less 模式，集成到其他應用 |

---

## 六、結語

OpenClaude 代表了一種不同的思路：不是做一個更好的 Claude Code，而是做一個**不挑模型的 Agent CLI**。

核心價值主張：**自由**。不鎖定 Provider、不綁定生態、不要求用戶為每個模型維護獨立的工具鏈。

**相關資源：**
- GitHub: https://github.com/Gitlawb/openclaude
- npm: https://www.npmjs.com/package/@gitlawb/openclaude
- Discord: https://discord.gg/k68zFR6AcB
