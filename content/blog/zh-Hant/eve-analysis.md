---
title: "Eve：Vercel 開源 Agent 框架——以目錄結構管理 AI 智慧體"
date: "2026-08-16"
description: "深度解析 Vercel Eve 開源 Agent 框架，Next.js for Agents，以目錄結構管理智慧體，支援子智慧體、工作流、MCP 集成"
tags:
  - Eve
  - Vercel
  - AI Agent
  - 智慧體框架
  - 開源
  - 工作流
  - MCP
  - TypeScript
categories:
  - AI Agent
  - 智慧體框架
  - Vercel 開源
  - TypeScript
  - 工作流引擎
---

# Eve：Vercel 開源 Agent 框架——以目錄結構管理 AI 智慧體

## 專案背景與核心問題

### AI Agent 開發的基礎設施困境

在 AI Agent 開發領域，開發者面臨著一個普遍的問題：**建構 Agent 循環（loop）之後，如何處理基礎設施挑戰？**

| 痛點 | 描述 | 現有方案的不足 |
|------|------|---------------|
| **程式碼組織混亂** | 智慧體的程式碼、配置、指令散落各處 | 缺乏統一的專案結構 |
| **部署複雜** | 狀態管理、持久化、錯誤恢復難以處理 | 需要大量定制開發 |
| **多渠道集成困難** | Slack、Discord、Telegram 等渠道接入複雜 | 每個渠道需要獨立適配 |
| **模型切換不便** | 依賴單一模型提供商，風險集中 | 缺乏靈活的模型切換機制 |
| **子智慧體管理** | 複雜任務難以分解和委託 | 缺乏標準化架構 |

### Eve 的誕生

> **"Eve — 為 Agent 提供的 Next.js 體驗"**

Eve 是 Vercel 於 2025 年 6 月發布的**開源 Agent 建構框架**，它將 Web 開發領域累積十年的最佳實踐引入 AI Agent 開發：

```
┌─────────────────────────────────────────────────────────────────┐
│                      Eve 核心定位                                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  🎯 定位:        "Next.js for Agents"                            │
│  🏢 開發:        Vercel                                          │
│  📅 發布:        2025年6月                                       │
│  📦 語言:        TypeScript                                      │
│  🛠️ 架構:        目錄結構即智慧體                                │
│  🔌 集成:        MCP、Slack、Discord、多渠道支援                  │
│  ⚙️ 引擎:        基於 Vercel Workflow SDK                        │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 專案概述

### 什麼是 Eve？

Eve 是一個**用於建構和部署 AI Agent 的生產級框架**，它的核心理念是將每個 Agent 視為一個獨立的目錄，所有相關程式碼、配置和指令都集中管理。

### 核心特性一覽

| 特性 | 描述 |
|------|------|
| 🗂️ **目錄即智慧體** | 每個 Agent 是一個獨立目錄，包含完整定義 |
| 📝 **Markdown 指令** | 系統提示詞以 Markdown 格式編寫，直觀易維護 |
| 🔧 **工具即檔案** | 每個工具是獨立的 TypeScript 檔案，自動註冊 |
| 🔄 **模型自動切換** | AI Gateway 自動處理模型提供商的故障切換 |
| 💬 **多渠道支援** | 內建 Slack、Discord、Teams、Telegram 等支援 |
| ⚡ **工作流驅動** | 基於持久化工作流，支援暫停、恢復、調度 |
| 🔌 **MCP 集成** | 透過 MCP 伺服器連接外部工具 |
| 🏗️ **子智慧體支援** | 支援建構 Agent Team，分解複雜任務 |

---

## 架構設計深度解析

### 核心理念：目錄即智慧體

Eve 最重要的設計決策是將**目錄結構作為組織智慧體的核心方式**：

```
my-agent/
├── package.json           # 專案依賴配置
├── tsconfig.json          # TypeScript 配置
├── .env.example           # 環境變數範例
└── agent/
    ├── agent.ts           # Agent 核心邏輯
    ├── instructions.md    # 系統指令（Markdown）
    ├── model.ts           # 模型配置
    ├── channels/          # 渠道配置
    │   ├── eve.ts         # Eve 內建渠道
    │   ├── slack.ts       # Slack 集成
    │   └── discord.ts     # Discord 集成
    └── tools/             # 工具定義
        ├── search.ts      # 搜尋工具
        └── send.ts        # 傳送訊息工具
```

**為什麼選擇目錄結構？**

| 優勢 | 說明 |
|------|------|
| **自包含** | Agent 的所有相關檔案都在同一目錄，，便於移動和復用 |
| **直觀** | 檔案結構清晰，新開發者能快速理解 |
| **版本控制友好** | 整個 Agent 可以作為獨立模組進行版本管理 |
| **部署簡單** | 目錄即部署單元，Vercel 平台天然支援 |

### 工作流引擎

Eve 的底層基於 **Vercel 開源的 Workflow SDK**，這帶來了以下能力：

- **持久化狀態**：會話可以在任意步驟暫停和恢復
- **錯誤恢復**：失敗的工作流可以從斷點重試
- **調度執行**：支援定時任務和延遲執行
- **並發控制**：內建並發限制，防止資源耗盡

### 模型與 AI Gateway

Eve 透過 **AI Gateway** 實現模型的統一管理和自動故障切換：

```typescript
// agent/model.ts
export default defineModel({
  provider: "openai",
  model: "gpt-4o",
});
```

### 工具系統

```typescript
// agent/tools/search.ts
export const search = defineTool({
  name: "search",
  description: "Search the web for information",
  parameters: z.object({
    query: z.string().describe("The search query"),
  }),
  execute: async ({ query }) => {
    const results = await performSearch(query);
    return results;
  },
});
```

---

## 設計哲學

### 核心原則

#### 1. 約定優於配置（Convention over Configuration）

> **"像 Next.js 一樣，用約定減少決策負擔，讓開發者專注業務邏輯。"**

#### 2. 目錄即邊界（Directory as Boundary）

> **"一個目錄定義一個智慧體的完整邊界，包括程式碼、配置、指令和渠道。"**

#### 3. 工作流優先（Workflow First）

> **"所有會話都是持久化工作流，這意味著可靠性和可恢復性是內建的。"**

#### 4. 渠道抽象（Channel Abstraction）

> **"智慧體的核心邏輯與渠道解耦，同一個智慧體可以接入任何渠道。"**

---

## 快速入門教程

### 環境準備

| 要求 | 說明 |
|------|------|
| **Node.js** | 24.0.0 或更高版本 |
| **包管理器** | npm、pnpm 或 bun |
| **API Key** | Vercel AI Gateway API Key |

### 安裝 Eve CLI

```bash
# 使用 npm
npm install -g eve-cli

# 或使用 pnpm
pnpm add -g eve-cli

# 驗證安裝
eve --version
```

### 建立第一個 Agent

#### 步驟 1：初始化專案

```bash
eve init my-first-agent
cd my-first-agent
npm install
```

#### 步驟 2：配置環境變數

```bash
cp .env.example .env
# 編輯 .env 檔案，添加你的 API Key
```

#### 步驟 3：編寫系統指令

```markdown
<!-- agent/instructions.md -->
# 我的第一個 Agent

你是一個友好的 AI 助理，專門幫助使用者回答問題。
```

#### 步驟 4：定義模型和工具

```typescript
// agent/model.ts
export default defineModel({
  provider: "openai",
  model: "gpt-4o",
});
```

#### 步驟 5：運行 Agent

```bash
eve dev
```

---

## 實戰教程：建構多渠道客服 Agent

### 專案結構

```
customer-service-agent/
├── package.json
├── tsconfig.json
└── agent/
    ├── agent.ts
    ├── instructions.md
    ├── model.ts
    ├── channels/
    │   ├── slack.ts
    │   └── discord.ts
    └── tools/
        ├── lookup-order.ts
        ├── faq.ts
        └── escalate.ts
```

### 完整實現

```typescript
// agent/tools/lookup-order.ts
export const lookupOrder = defineTool({
  name: "lookup_order",
  description: "Look up order status by order ID",
  parameters: z.object({
    orderId: z.string().describe("The order ID"),
  }),
  execute: async ({ orderId }) => {
    const order = await fetchOrder(orderId);
    return order;
  },
});
```

---

## 多智慧體與子智慧體

### 建構 Agent Team

Eve 支援將複雜任務分解為多個子智慧體：

```
┌─────────────────────────────────────────────────────────────┐
│                    Agent Team 架構                           │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│                    主智慧體 (Manager)                        │
│                         │                                    │
│          ┌──────────────┼──────────────┐                    │
│          ▼              ▼              ▼                    │
│    ┌──────────┐   ┌──────────┐   ┌──────────┐             │
│    │ 子智慧體A │   │ 子智慧體B │   │ 子智慧體C │             │
│    │ (研究)    │   │ (分析)    │   │ (報告)    │             │
│    └──────────┘   └──────────┘   └──────────┘             │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 渠道集成詳解

### 支援的渠道

| 渠道 | 說明 | 配置要求 |
|------|------|---------|
| **Eve** | 內建 CLI 聊天介面 | 無需額外配置 |
| **Slack** | 企業團隊協作平台 | Bot Token, Signing Secret |
| **Discord** | 社區和遊戲平台 | Bot Token |
| **Teams** | Microsoft 協作平台 | App ID, App Password |
| **Telegram** | 即時通訊 | Bot Token |

---

## 歸納與總結

### 核心觀點總結

#### 1. 框架的本質是約定

Eve 最重要的貢獻不是程式碼，而是一套**清晰的約定體系**：

> **"約定減少決策負擔，讓開發者專注真正重要的業務邏輯。"**

#### 2. 目錄結構是組織複雜性的利器

將「目錄」作為智慧體的邊界，是一個簡單但強大的設計決策。

#### 3. 工作流是可靠性的基礎

持久化工作流不僅僅是「狀態保存」，它意味著：
- **錯誤恢復**：失敗後可以從斷點重試
- **暫停/恢復**：耗時任務可以分步執行
- **調度執行**：可以安排在特定時間執行

### 適用場景

✅ **強烈推薦使用 Eve**：
- 需要快速建構生產級 Agent 的團隊
- 需要多渠道接入的企業應用
- 需要可靠狀態管理的複雜對話場景
- 熟悉 Next.js/Vercel 生態的開發者

---

## 資源連結

### 官方資源

| 資源 | 連結 |
|------|------|
| 🌐 官方網站 | https://vercel.com/ |
| 💻 GitHub 倉庫 | https://github.com/vercel/eve |
| 🐦 Twitter | @vercel |

### 安裝

| 平台 | 安裝命令 |
|------|---------|
| npm | `npm install -g eve-cli` |
| pnpm | `pnpm add -g eve-cli` |

### 環境要求

| 要求 | 最低版本 |
|------|---------|
| Node.js | 24.0.0+ |

---

## 結語

Eve 代表了 **AI Agent 開發框架的一個重要方向——將 Web 開發領域累積的最佳實踐引入 Agent 開發領域**。

> **"Next.js 改變了 Web 開發的方式，Eve 正在改變 Agent 開發的方式。"**

---

*本文基於 Vercel Eve 開源專案編寫。*

**Sources:**
- [GitHub - vercel/eve](https://github.com/vercel/eve)
- [Vercel Agentic Infrastructure](https://vercel.com/)
