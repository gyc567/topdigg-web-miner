---
title: "Waza：Microsoft開源 AI Agent 技能評估框架——從入門到精通"
date: "2026-08-16"
description: "深度解析 Microsoft Waza 專案——Go 語言實現的 AI Agent 技能評估 CLI 工具，支援多模型對比、對抗性測試、MCP 模擬伺服器"
tags:
  - Waza
  - AI Agent
  - 技能評估
  - Microsoft
  - Go
  - CLI工具
  - 基準測試
  - 開源
categories:
  - AI Agent
  - 評估框架
  - Microsoft開源
  - Go工具
  - 技能評估
---

# Waza：Microsoft開源 AI Agent 技能評估框架——從入門到精通

## 專案背景與核心問題

### AI Agent 技能評估的困境

在 AI Agent 開發過程中，如何**系統性地評估和驗證 Agent 的技能品質**一直是開發者面臨的核心挑戰：

| 痛點 | 傳統方法的問題 | Waza 的解決方案 |
|------|---------------|----------------|
| **缺乏標準化** | 各團隊自建評估體系，難以復用 | 統一的 Eval Spec 規範 |
| **結果不可復現** | 隨機性導致結果波動 | Snapshot & Replay 機制 |
| **多模型對比困難** | 手動對比，效率低下 | 內建 compare 命令 |
| **對抗性測試缺失** | 難以發現安全隱患 | 內建 adversarial 故障注入 |
| **CI/CD 集成複雜** | 缺乏標準化介面 | 標準化 Exit Codes 和 Reporters |

### Waza 的誕生

Waza 是 Microsoft 推出的 **Go 語言 CLI 工具**，專門用於評估 AI Agent 的技能品質。它的核心理念是：

> **"為 AI Agent 技能評估提供標準化、可復現、可量化的評估框架。"**

---

## 專案概述

### 什麼是 Waza？

Waza 是一個**用於評估 AI Agent 技能的 命令列工具**，它可以幫助開發者：

- **腳手架評估套件**：從 SKILL.md 自動生成評估任務
- **運行基準測試**：跨不同模型運行並比較結果
- **品質評分**：使用 LLM-as-Judge 進行多維度評估
- **對抗性測試**：注入故障以發現潛在安全問題
- **Token 管理**：分析和優化技能文檔大小

### 核心特性一覽

| 特性 | 描述 |
|------|------|
| 🎯 **技能生命週期管理** | init、create、run、check 完整流程 |
| 📊 **多模型對比** | 跨不同模型運行基準測試並比較結果 |
| 🏅 **LLM-as-Judge** | 內建多種評分器：groundedness、helpfulness 等 |
| 🔢 **Token 管理** | 計數、對比、分析和建議優化 |
| 🛡️ **對抗性測試** | 離線故障注入：prompt injection、scope-bypass |
| 📸 **快照與回放** | 捕獲運行以確保可復現性 |
| 🔌 **MCP 模擬伺服器** | 無網路依賴的隔離測試 |
| ☁️ **雲端儲存集成** | 自動上傳結果到 Azure Blob Storage |
| 📈 **可視化儀表板** | 透過 HTTP 或 JSON-RPC 查看結果 |

---

## 架構設計深度解析

### 整體架構

Waza 採用模組化架構設計：

```
┌─────────────────────────────────────────────────────────────────────────┐
│                            Waza 架構概覽                                  │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│   ┌─────────────────────────────────────────────────────────────────┐   │
│   │                         CLI 入口 (cmd/waza)                      │   │
│   │                    init | run | check | compare | serve         │   │
│   └─────────────────────────────────────────────────────────────────┘   │
│                                    │                                     │
│   ┌─────────────────────────────────────────────────────────────────┐   │
│   │                       核心模組 (internal/)                       │   │
│   │  graders │ models │ orchestration │ metrics                      │   │
│   │  execution │ reporting │ transcript │ config                     │   │
│   └─────────────────────────────────────────────────────────────────┘   │
│                                    │                                     │
│   ┌─────────────────────────────────────────────────────────────────┐   │
│   │                        執行後端 (execution/)                      │   │
│   │              mock (CI友好)  │  copilot-sdk (預設)                 │   │
│   └─────────────────────────────────────────────────────────────────┘   │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### 評估規範格式（Eval Spec Schema 1.2）

```yaml
name: my-skill-eval
skill: my-skill
schemaVersion: "1.2"
version: "1.0.0"

config:
  trials: 3
  max_attempts: 2
  timeout: 300
  executor: mock

tasks:
  - task: hello-world
    assert:
      - grading: text
        config:
          contains: "Hello"
```

---

## 設計哲學

### 核心原則

#### 1. Schema 驅動（Schema-driven）

> **"版本管理顯式化，讀取時對相同主版本相容，對不同主版本嚴格。"**

#### 2. 快照式可復現性（Snapshot-based Determinism）

每個評估運行都會捕獲完整的上下文快照，確保結果可以精確復現：

```
waza run → 捕獲 Snapshot → 儲存為 JSON
                  ↓
waza replay snapshot.json → 精確重現之前的運行結果
```

#### 3. CI-First 設計

| CI 特性 | 實現 |
|--------|------|
| **Exit Codes** | 0=成功, 1=測試失敗, 2=設定錯誤 |
| **Reporters** | JSON、JUnit XML 格式支援 |
| **閾值檢查** | `waza tokens compare` 支援 CI 門控 |

#### 4. 執行與評分分離

```bash
# 步驟 1：運行評估（跳過評分）
waza run eval.yaml --skip-graders --output results.json

# 步驟 2：稍後評分
waza grade results.json
```

---

## 快速入門教程

### 安裝 Waza

#### 方法一：二進位安裝（推薦）

```bash
# Linux/macOS
curl -fsSL https://raw.githubusercontent.com/microsoft/waza/main/install.sh | bash

# Windows (PowerShell)
irm https://raw.githubusercontent.com/microsoft/waza/main/install.ps1 | iex
```

#### 方法二：從原始碼安裝

```bash
git clone https://github.com/microsoft/waza.git
cd waza
git lfs install && git lfs pull
go build -o waza ./cmd/waza
```

### 快速開始流程

```bash
# 1. 初始化專案
waza init my-agent-project && cd my-agent-project

# 2. 建立新技能
waza new skill my-skill

# 3. 運行評估
waza run my-skill
waza check my-skill
```

---

## 實戰教程：構建技能評估套件

### 第一步：初始化專案

```bash
waza init waza-demo && cd waza-demo
```

### 第二步：建立技能

```bash
waza new skill calculator
```

### 第三步：編寫 SKILL.md

```markdown
---
name: calculator
description: A calculator skill for basic arithmetic
triggers:
  - "calculate {{expression}}"
version: 1.0.0
---

# Calculator Skill
```

### 第四步：編寫評估任務

```yaml
# evals/calculator/tasks/basic-operations.yaml
- task: addition_test
  description: Test basic addition
  prompt: "Calculate 15 + 27"
  assert:
    - grading: text
      config:
        contains: "42"
```

### 第五步：設定評估

```yaml
# evals/calculator/eval.yaml
name: calculator-eval
skill: calculator
schemaVersion: "1.2"

config:
  trials: 3
  executor: mock

tasks:
  - task: basic-operations
```

### 第六步：運行評估

```bash
waza run calculator
```

---

## 高級特性詳解

### 1. LLM-as-Judge 評分

```yaml
graders:
  - type: prompt
    model: gpt-4
    dimensions:
      - groundedness
      - helpfulness
      - instruction_following
```

### 2. MCP 模擬伺服器

```yaml
mcp_mocks:
  - name: filesystem
    command: ["npx", "mcp-server-fs", "/tmp/test"]
```

### 3. 對抗性測試

```bash
waza adversarial --pack prompt-injection
waza adversarial --pack scope-bypass
```

### 4. 多模型對比

```bash
waza run eval.yaml --model gpt-4 --output gpt4-results.json
waza compare gpt4-results.json claude-results.json
```

### 5. Token 管理

```bash
waza tokens count skills/my-skill/SKILL.md
waza tokens suggest skills/my-skill/SKILL.md
```

---

## CI/CD 集成詳解

### GitHub Actions 工作流

```yaml
# .github/workflows/waza-eval.yml
name: Waza Evaluation

on:
  pull_request:
    branches: [main]

jobs:
  evaluate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Install Waza
        run: |
          curl -fsSL https://raw.githubusercontent.com/microsoft/waza/main/install.sh | bash
      - name: Run Evaluation
        run: waza run evals/my-skill/eval.yaml --output results.json --executor mock
```

---

## 評估器類型詳解

| 類型 | 用途 | 設定範例 |
|------|------|---------|
| **code** | Python/JS 斷言 | `assert: "result == 42"` |
| **text** | 文字匹配 | `contains: "success"` |
| **file** | 檔案驗證 | `path: "/tmp/out.txt"` |
| **diff** | 工作區對比 | `snapshot_path: "./snapshots/"` |
| **behavior** | 行為約束 | `max_tokens: 1000` |
| **action_sequence** | 工具呼叫序列 | `expected: ["read", "write"]` |
| **prompt** | LLM-as-Judge | `dimensions: ["groundedness"]` |

---

## 歸納與總結

### 核心觀點總結

#### 1. AI Agent 評估的標準化

Waza 最重要的貢獻是**為 AI Agent 技能評估建立了標準化框架**：

> **"評估 AI Agent 不應該依赖于臨時的、一次性的測試，而應該像程式碼測試一樣，有標準化的規範、可復現的結果、和自動化的流程。"**

#### 2. 可復現性的重要性

在 AI Agent 評估中，**可復現性是一個核心挑戰**。Waza 透過以下機制解決：
- Snapshot & Replay 捕獲完整上下文
- 多次試驗（trials）減少隨機性影響
- Mock 執行器消除網路依賴

#### 3. CI-First 不僅是噱頭

Waza 的 CI-First 設計意味著：
- Exit Codes：建置系統可以直接判斷成功/失敗
- 標準 Reporters：與現有 CI 工具無縫集成
- 閾值檢查：自動門控，避免品質退化

### 適用場景

✅ **強烈推薦使用 Waza**：
- AI Agent 開發團隊需要系統性評估
- 需要多模型對比的場景
- 對抗性測試需求（安全敏感應用）
- 需要 CI/CD 自動化的團隊
- 需要標準化技能評估的企業

---

## 資源連結

### 官方資源

| 資源 | 連結 |
|------|------|
| 🌐 官方網站 | https://microsoft.github.io/waza/ |
| 💻 GitHub 倉庫 | https://github.com/microsoft/waza |
| 📚 文件中心 | https://microsoft.github.io/waza/docs/ |

---

## 結語

Waza 代表了 **AI Agent 技能評估領域的一個重要里程碑**——它將原本零散、非標準的評估實踐，轉化為一個完整的、有標準的、可自動化的工作流程。

> **"沒有適當的評估，不要相信你的 AI agent。使用 Waza。"**

---

*本文基於 Microsoft Waza 開源專案（MIT License）編寫，相關資訊來源於 GitHub 倉庫和官方文件。*

**Sources:**
- [GitHub - microsoft/waza](https://github.com/microsoft/waza)
- [Waza Documentation](https://microsoft.github.io/waza/)
