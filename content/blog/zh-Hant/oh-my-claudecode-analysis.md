---
slug: oh-my-claudecode-analysis
title: "oh-my-claudecode：Claude Code 智慧多智慧體編排框架詳解"
description: "全面解析 oh-my-claudecode（38.5k+ stars，MIT，TypeScript）—— Claude Code 智慧多智慧體編排框架。核心設計哲學：零學習曲線、多智慧體編排、智慧路由、技能組合。詳細涵蓋：19個專業智慧體、3檔模型路由、31個Skills、五階段Team Pipeline、Magic Keywords自然語言觸發、安裝配置教程、團隊協作模式、最佳實踐。"
date: "2026-08-13"
author: "TopDigg"
tags: ["oh-my-claudecode", "Claude Code", "Multi-Agent", "Orchestration", "TypeScript", "AI Agents", "Developer Tools", "Skills", "Team Pipeline"]
categories: ["Deep Dive"]
keywords: ["oh-my-claudecode", "Claude Code 多智慧體編排", "多智慧體", "編排系統", "TypeScript", "AI Agent", "開發者工具", "Skills系統", "Team Pipeline", "Magic Keywords", "autopilot", "ralph", "ultrawork", "團隊協作", "智慧路由"]
---

# oh-my-claudecode：Claude Code 智慧多智慧體編排框架詳解

> 核心思想：**別學 Claude Code，直接用 OMC。** oh-my-claudecode（簡稱 OMC）是一個執行在 Claude Code 之上的多智慧體編排層，透過 19 個專業智慧體、3 檔模型路由、31 個 Skills 和 5 階段 Team Pipeline，讓人類工程師用自然語言驅動一支 AI 團隊。它不替換 Claude Code，而是疊加在其之上——零學習曲線，現有工作流無縫接入。這是一份從零開始的完整指南，涵蓋專案介紹、核心設計哲學、安裝配置、團隊協作模式、智慧體目錄、技能系統、使用範例和最佳實踐。

## 一、專案介紹與概述

### 1.1 一句話定位

**oh-my-claudecode（OMC）是一個多智慧體編排系統，執行在 Claude Code 之上，用 Skills 和專業智慧體替代手動配置和提示工程。** 口號是"Don't learn Claude Code. Just use OMC."——它把 Claude Code 從一個需要精心構建提示的單智慧體工具，變成一個可以用自然語言驅動多智慧體團隊的開發環境。

### 1.2 專案元資訊

| 欄位 | 值 |
|------|-----|
| GitHub | [Yeachan-Heo/oh-my-claudecode](https://github.com/Yeachan-Heo/oh-my-claudecode) |
| Stars | 38,500+（持續增長中）|
| Forks | 3,400+ |
| 授權條款 | MIT |
| 語言 | TypeScript |
| 最新版本 | 4.15.7+ |
| npm 套件 | `oh-my-claude-sisyphus` |
| 創辦人 | Yeachan Heo（[@Yeachan-Heo](https://github.com/Yeachan-Heo)）|
| 官網 | https://yeachan-heo.github.io/oh-my-claudecode-website |
| Discord | https://discord.gg/jq6jnSGABY |

### 1.3 核心價值主張

OMC 的核心價值可以用三個詞概括：

- **零學習曲線**：不需要記憶複雜的命令或語法，用自然語言描述需求即可
- **多智慧體編排**：19 個專業智慧體協同工作，覆蓋從探索到驗證的完整開發生命週期
- **智慧組合**：Skills 系統讓你像堆積木一樣組合功能，按需增強

### 1.4 與 Claude Code 的關係

OMC **不是** Claude Code 的替代品，而是一個增強層：

```
┌─────────────────────────────────────────────┐
│  使用者（自然語言）                           │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│  OMC 編排層（Skills + Agents + Hooks）        │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│  Claude Code（底層執行引擎）                  │
└─────────────────────────────────────────────┘
```

這意味著：
- Claude Code 的所有功能依然可用
- OMC 只是在你需要多智慧體協作時提供編排能力
- 無需改變現有的 Claude Code 使用習慣

## 二、核心設計哲學

### 2.1 零學習曲線哲學

OMC 最重要的設計原則是**零學習曲線**。這體現在：

**自然語言優先**
- 不需要學習特殊的命令語法
- 直接用人類語言描述你想要什麼
- 系統自動識別意圖並觸發相應技能

**漸進式複雜性**
- 從最簡單的使用開始：`/team "task description"`
- 需要時再添加複雜性：指定模型、選擇技能組合
- 不強制使用者一次性掌握所有功能

**現有工作流無縫接入**
- 不需要重建你的開發流程
- OMC 可以增量添加到現有工作流中
- 任何時候都可以回退到純 Claude Code

### 2.2 多智慧體編排哲學

**專業分工**
- 每個智慧體只做一件事，但做到極致
- 19 個智慧體覆蓋 4 個車道：建構/分析、審查、領域專家、協調
- 智慧體之間透過明確定義的介面協作

**動態路由**
- 根據任務複雜度自動選擇合適的模型
- 簡單任務用 haiku（快且便宜）
- 複雜任務用 opus（最高推理品質）
- 一切都是自動的，使用者無需操心

**團隊協作模式**
- 5 階段流水線確保每個任務都經過充分考慮
- team-plan → team-prd → team-exec → team-verify → team-fix
- 每個階段都有明確的輸入輸出和驗收標準

### 2.3 智慧路由哲學

OMC 的模型路由遵循一個簡單原則：**用最合適的資源完成每項任務**。

| 任務類型 | 推薦模型 | 原因 |
|---------|---------|------|
| 程式碼庫探索 | haiku | 快速掃描大量檔案 |
| 需求分析 | opus | 需要深度推理和隱含約束發現 |
| 程式碼實現 | sonnet | 平衡速度和品質 |
| 安全審查 | sonnet | 需要足夠的推理能力 |
| 架構設計 | opus | 複雜權衡分析 |
| 文件編寫 | haiku | 簡單直接的任務 |

### 2.4 Skills 組合哲學

Skills 系統是 OMC 最強大的特性之一。它的設計哲學是**可組合的層次結構**：

```
┌─────────────────────────────────────────────┐
│  GUARANTEE LAYER（可選保障層）                │
│  例如：ralph — 驗證未完成前不能停止            │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│  ENHANCEMENT LAYER（增強層，0-N 個）          │
│  例如：ultrawork（並行）| git-master（提交）  │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│  EXECUTION LAYER（執行層，主要技能）           │
│  例如：default（建構）| planner（規劃）      │
└─────────────────────────────────────────────┘
```

這種設計的優勢：
- **按需組合**：只載入你需要的層次
- **可預測性**：每層職責明確，不會混淆
- **可擴展性**：可以建立自訂 Skills 組合

## 三、安裝配置教程

### 3.1 環境要求

在開始安裝之前，請確保你的環境滿足以下要求：

| 要求 | 最低版本 | 推薦版本 |
|------|---------|---------|
| Node.js | 18.0+ | 20.0+ |
| npm | 8.0+ | 10.0+ |
| Claude Code | 最新版本 | 最新版本 |
| 作業系統 | macOS/Linux/Windows (WSL) | macOS/Linux |

### 3.2 安裝步驟

**方式一：npm 全域安裝（推薦用於插件模式）**

```bash
# 安裝最新版本
npm install -g oh-my-claude-sisyphus

# 驗證安裝
omc --version

# 執行設定精靈
omc setup
```

**方式二：本機開發安裝**

```bash
# 複製儲存庫
git clone https://github.com/Yeachan-Heo/oh-my-claudecode.git
cd oh-my-claudecode

# 安裝依賴
npm install

# 連結到全域（開發模式）
npm link

# 執行設定
npm run setup
```

**方式三：Docker 部署**

```bash
# 建構映像
docker build -t oh-my-claudecode .

# 執行容器
docker run -it oh-my-claudecode omc --version
```

### 3.3 設定檔案

OMC 的設定檔位於 `~/.omc/` 目錄下。建立或編輯 `~/.omc/config.json`：

```json
{
  "version": "4.15.7",
  "model": {
    "default": "sonnet",
    "routing": {
      "haiku": ["explore", "writer"],
      "sonnet": ["executor", "debugger", "test-engineer"],
      "opus": ["architect", "planner", "critic"]
    }
  },
  "skills": {
    "default": ["default"],
    "autoLoad": true
  },
  "team": {
    "pipeline": ["team-plan", "team-prd", "team-exec", "team-verify", "team-fix"]
  },
  "hooks": {
    "enabled": true,
    "events": ["onStart", "onError", "onComplete"]
  }
}
```

### 3.4 Claude Code 整合設定

為了讓 OMC 與 Claude Code 無縫協作，需要進行以下設定：

**在 Claude Code 的設定中啟用 OMC**

```bash
# 初始化 OMC 連線
omc init

# 在 Claude Code 中啟動技能
/claude-code:omc-setup
```

**設定環境變數**

```bash
# 在 ~/.bashrc 或 ~/.zshrc 中添加
export OMC_API_KEY="your-api-key"
export OMC_MODEL_PROVIDER="anthropic"  # 或 "openai", "google"
export OMC_DEFAULT_MODEL="claude-sonnet-4-20250514"
```

### 3.5 驗證安裝

安裝完成後，執行以下命令驗證設定是否正確：

```bash
# 檢查版本
omc --version
# 輸出應該是：omc v4.15.7

# 檢查 Claude Code 連線
omc doctor

# 執行基準測試
./setup.sh
./quick_test.sh
```

如果所有檢查都通過，恭喜你！OMC 已成功安裝並設定完成。

## 四、團隊協作模式（Team Pipeline）完整說明

### 4.1 Team 模式概述

Team 模式是 OMC v4.1.7 起推薦的編排方案。它將複雜任務分解為 5 個階段，每個階段由專門的智慧體負責，確保任務得到全面考慮和高品質完成。

### 4.2 五階段流水線詳解

**階段 1：team-plan（規劃階段）**

輸入：使用者的自然語言需求
輸出：結構化任務清單和執行計畫

主要職責：
- 分析需求，識別隱含約束
- 將大任務分解為可執行的小任務
- 確定任務依賴關係和執行順序
- 評估風險和資源需求

使用的智慧體：`analyst` + `planner`

**階段 2：team-prd（產品需求階段）**

輸入：規劃階段的任務清單
輸出：詳細的 PRD（產品需求文件）

主要職責：
- 編寫每個功能的詳細規格說明
- 定義驗收標準和成功條件
- 識別邊緣情況和錯誤處理需求
- 協調相關利害關係人的意見

使用的智慧體：`writer` + `analyst`

**階段 3：team-exec（執行階段）**

輸入：PRD 文件
輸出：實現的程式碼和初步測試

主要職責：
- 按照計畫執行開發任務
- 編寫單元測試和整合測試
- 遵循程式碼規範和最佳實踐
- 記錄遇到的任何問題

使用的智慧體：`executor` + `explore` + `debugger`

**階段 4：team-verify（驗證階段）**

輸入：實現的程式碼
輸出：驗證報告和測試結果

主要職責：
- 執行完整的測試套件
- 檢查程式碼品質和覆蓋率
- 驗證功能是否符合 PRD
- 識別任何回歸問題

使用的智慧體：`verifier` + `test-engineer`

**階段 5：team-fix（修復階段）**

輸入：驗證報告
輸出：修復後的程式碼和最終驗證

主要職責：
- 修復驗證階段發現的問題
- 重新執行驗證確保所有問題已解決
- 更新相關文件
- 準備最終提交

使用的智慧體：`executor` + `debugger` + `verifier`

### 4.3 Team 模式使用範例

**基本用法**

```bash
# 在 Claude Code 中啟動 Team 模式
/team 3:executor "實現一個使用者認證系統"
```

這將啟動一個 3 個 executor 智慧體的團隊來完成認證系統的實現。

**指定特定智慧體組合**

```bash
# 啟動包含特定角色的團隊
/team architect + 2:executor + qa-tester "重構訂單處理模組"
```

**Team 模式的輸出範例**

```
[team-plan] 分析需求，建立執行計畫...
[team-plan] ✓ 識別出 12 個子任務，4 個依賴關係

[team-prd] 編寫詳細規格說明...
[team-prd] ✓ PRD 已產生，5 個驗收標準

[team-exec] 開始執行...
[team-exec] [1/5] 實現使用者註冊 API...
[team-exec] [2/5] 實現登入 API...
[team-exec] [3/5] 編寫單元測試...
[team-exec] ✓ 4/5 任務完成，1 個需要修復

[team-verify] 執行測試...
[team-verify] ⚠ 發現 2 個測試失敗

[team-fix] 修復問題...
[team-fix] ✓ 所有測試通過

[team] 任務完成！最終驗證通過。
```

### 4.4 與其他模式的對比

| 模式 | 適用場景 | 複雜度 | 團隊規模 |
|------|---------|--------|---------|
| Team | 共享任務清單的協調任務 | 中高 | 2-5 智慧體 |
| Autopilot | 端到端功能開發 | 低 | 單智慧體主導 |
| Ultrawork | 突發並行修復/重構 | 中 | 多智慧體並行 |
| Ralph | 必須完整完成的關鍵任務 | 中 | 單智慧體 + verify 循環 |
| UltraQA | 需要重複驗證的品質門 | 中 | 雙智慧體循環 |

## 五、智慧體目錄與角色說明

### 5.1 智慧體概覽

OMC 提供 19 個專職智慧體，分為 4 個車道。每個智慧體作為 `oh-my-claudecode:<agent-name>` 呼叫。

### 5.2 建構/分析車道

這些智慧體覆蓋從探索到驗證的完整開發生命週期：

| 智慧體 | 預設模型 | 核心職責 |
|-------|---------|---------|
| `explore` | haiku | 程式碼庫探索，檔案/symbol 對應 |
| `analyst` | opus | 需求分析，隱含約束發現 |
| `planner` | opus | 任務排序，執行計畫建立 |
| `architect` | opus | 系統設計，介面定義，權衡分析 |
| `debugger` | sonnet | 根因分析，建構錯誤修復 |
| `executor` | sonnet | 程式碼實現，重構 |
| `verifier` | sonnet | 完工驗證，測試充分性確認 |
| `tracer` | sonnet | 證據驅動的因果追蹤，競爭假設分析 |

**典型使用場景**

```bash
# 探索程式碼庫
/explore "找到所有與支付相關的模組"

/analyst "分析使用者認證的隱含需求"

/planner "為新功能建立執行計畫"

/architect "設計微服務架構方案"

/debugger "修復登入失敗的問題"

/executor "實現訂單退貨功能"

/verifier "驗證支付模組的測試覆蓋率"

/tracer "追蹤記憶體洩漏的根本原因"
```

### 5.3 審查車道

這些智慧體在交接前提供品質門檢查：

| 智慧體 | 預設模型 | 核心職責 |
|-------|---------|---------|
| `security-reviewer` | sonnet | 安全漏洞，信任邊界，authn/authz 審查 |
| `code-reviewer` | opus | 全程式碼審查，API 合約，向後相容性 |

**典型使用場景**

```bash
# 安全審查
/security-reviewer "審查新的 API 端點"

# 程式碼審查
/code-reviewer "審查訂單模組的程式碼改動"
```

### 5.4 領域專家車道

這些智慧體提供按需呼叫的領域專業知識：

| 智慧體 | 預設模型 | 核心職責 |
|-------|---------|---------|
| `test-engineer` | sonnet | 測試策略，覆蓋率，防 flaky 測試 |
| `designer` | sonnet | UI/UX 架構，互動設計 |
| `writer` | haiku | 文件，遷移說明 |
| `qa-tester` | sonnet | 透過 tmux 的互動式 CLI/服務執行期驗證 |
| `scientist` | sonnet | 資料分析，統計研究 |
| `git-master` | sonnet | Git 操作，提交，變基，歷史管理 |
| `document-specialist` | sonnet | 外部文件，API/SDK 參考查找 |
| `code-simplifier` | opus | 程式碼清晰化，簡化，可維護性改進 |

**典型使用場景**

```bash
# 測試工程
/test-engineer "為支付模組設計測試策略"

# UI/UX 設計
/designer "設計結帳流程的 UI 元件"

# 文件編寫
/writer "編寫使用者認證的 API 文件"

# QA 測試
/qa-tester "執行端到端測試驗證訂單流程"

# 資料分析
/scientist "分析使用者行為資料"

# Git 操作
/git-master "建立一個功能分支並提交程式碼"

# 外部文件
/document-specialist "查找 Stripe API 的最新文件"

# 程式碼簡化
/code-simplifier "簡化訂單服務中的複雜業務邏輯"
```

### 5.5 協調車道

這個智慧體提供高層次的計畫和設計審查：

| 智慧體 | 預設模型 | 核心職責 |
|-------|---------|---------|
| `critic` | opus | 計畫/設計的差距分析，多角度審查 |

**典型使用場景**

```bash
# 計畫審查
/critic "審查新功能的實現計畫"

# 設計審查
/critic "審查微服務拆分方案的權衡"
```

### 5.6 智慧體組合使用

多個智慧體可以組合使用以完成複雜任務：

```bash
# 完整功能開發流程
/team architect + 2:executor + verifier "實現即時通知系統"

/# 緊急修復流程
/team debugger + verifier "修復生產環境的支付問題"

/# 架構重構
/team architect + code-reviewer + code-simplifier "重構單體應用為微服務"
```

## 六、技能系統詳解

### 6.1 Skills 是什麼

Skills 是 OMC 的行為注入機制。它們修改編排器的工作方式，讓你可以按需增強智慧體的能力。每個 Skill 是一個獨立的行為模組，可以疊加在智慧體之上。

### 6.2 核心概念

**執行層（Execution Layer）**
主要的技能類型，定義任務執行的去方式：
- `default`：標準建構流程
- `planner`：規劃驅動的工作流
- `orchestrate`：協調多智慧體工作

**增強層（Enhancement Layer）**
可選的增強功能，可以添加 0-N 個：
- `ultrawork`：最大並行度執行
- `git-master`：Git 操作整合
- `frontend-ui-ux`：前端開發增強

**保障層（Guarantee Layer）**
可選的保障機制：
- `ralph`：持久循環，確保任務完成

### 6.3 常用 Skills 詳解

**autopilot**

自主執行技能，適合端到端功能開發。

觸發關鍵詞：`autopilot`、`build me`、`I want a`

```bash
/autopilot "建構一個部落格系統"
```

特點：
- 單一主導智慧體
- 最小儀式感
- 自動處理規劃到驗證的全流程

**ultrawork**

最大並行度執行技能，適合突發並行任務。

觸發關鍵詞：`ultrawork`、`ulw`、`parallel`

```bash
/ultrawork "並行修復所有安全漏洞"
```

特點：
- 多智慧體同時工作
- 最大並行度
- 不需要 Team 的順序協調

**ralph**

持久循環技能，確保任務完整完成。

觸發關鍵詞：`ralph`、`don't stop`、`must complete`

```bash
/ralph "完成資料庫遷移，不能中途停止"
```

特點：
- verifier 確認完成後才退出
- 不會靜默跳過部分任務
- 適合關鍵任務

**deep-interview**

Socratic 深度訪談技能，用於需求澄清。

觸發關鍵詞：`interview`、`deep interview`、`gather requirements`

```bash
/deep-interview "收集新功能的詳細需求"
```

特點：
- 透過提問澄清模糊點
- 模糊度門控確保充分理解
- Ouroboros 啟發的對話設計

**ralplan**

迭代共識規劃技能。

觸發關鍵詞：`ralplan`、`consensus plan`

```bash
/ralplan "制定專案共識計畫"
```

特點：
- RALPLAN-DR 迭代方法
- 多輪討論達成共識
- 記錄決策過程

### 6.4 Magic Keywords

OMC 提供 Magic Keywords 功能，可以透過自然語言自動觸發 Skills：

| 關鍵詞 | 觸發的 Skill | 效果 |
|-------|-------------|------|
| `ralph` / `don't stop` / `must complete` | `$ralph` | 持久循環，verifier 確認完成後才退出 |
| `autopilot` / `build me` / `I want a` | `$autopilot` | 自主執行流水線 |
| `ultrawork` / `ulw` / `parallel` | `$ultrawork` | 最大並行智慧體編排 |
| `plan this` / `plan the` | `$plan` | 規劃工作流 |
| `interview` / `deep interview` / `gather requirements` | `$deep-interview` | Socratic 深度訪談 |
| `ralplan` / `consensus plan` | `$ralplan` | RALPLAN-DR 迭代共識規劃 |
| `ecomode` / `eco` / `budget` | `$ecomode` | 代幣高效模式 |
| `cancel` / `stop` / `abort` | `$cancel` | 取消啟動模式 |

### 6.5 自訂 Skills 組合

你可以在 `~/.omc/skills/` 目錄下建立自訂 Skills：

```bash
# 建立自訂 Skill
mkdir -p ~/.omc/skills/my-custom-skill
cd ~/.omc/skills/my-custom-skill

# 建立 SKILL.md
cat > SKILL.md << 'EOF'
# My Custom Skill

## 描述
這是一個自訂技能

## 觸發條件
當使用者說 "my task" 時觸發

## 執行流程
1. 步驟一
2. 步驟二
3. 步驟三
EOF
```

## 七、關鍵觀點總結

### 7.1 OMC 的核心價值

1. **降低門檻**：不需要學習複雜的提示工程，用自然語言即可驅動複雜的多智慧體工作流
2. **專業化分工**：19 個專業智慧體各司其職，確保每項任務都由最合適的智慧體處理
3. **智慧資源分配**：根據任務複雜度自動選擇模型，最佳化成本和效率
4. **可組合性**：Skills 系統讓你可以像堆積木一樣建構工作流
5. **團隊協作**：Team Pipeline 提供完整的團隊協作框架

### 7.2 適用場景

**強烈推薦使用 OMC 的場景**

- 複雜的多檔案重構專案
- 需要多個專業領域協作的大型功能
- 品質要求高的生產級程式碼開發
- 需要反覆驗證和修復的 bug 修復流程
- 快速原型開發後需要進行系統性完善

**可能不需要 OMC 的場景**

- 簡單的單檔案修改
- 快速臨時的腳本編寫
- 只需要簡單查找和取代的任務
- 已經有成熟 CI/CD 流程的增量改動

### 7.3 最佳實踐建議

1. **從簡單開始**：先用 `/team` 命令處理中等複雜度的任務，熟悉後再嘗試更進階的組合
2. **選擇合適的模式**：根據任務類型選擇合適的編排模式（Team、Autopilot、Ultrawork 等）
3. **利用 Magic Keywords**：善用自然語言觸發功能，減少命令記憶負擔
4. **重視驗證階段**：不要跳過 team-verify 階段，品質門是程式碼交付的重要保障
5. **持續學習**：關注 OMC 的更新和新功能，持續最佳化你的工作流

### 7.4 局限性認知

OMC 也不是銀彈，應該認識到它的局限性：

- 對於非常簡單直接的任務，OMC 的額外負擔可能大於收益
- 多智慧體協作增加了系統的複雜性，調試難度相應增加
- 團隊協作模式需要一定的任務分解能力
- 智慧路由雖然智慧，但並非完美，可能需要手動干預

## 八、使用範例和最佳實踐

### 8.1 日常開發場景

**場景 1：實現新功能**

```bash
# 使用 Team 模式實現完整功能
/team architect + 2:executor + verifier "實現商品評論功能"
```

執行流程：
1. architect 分析架構需求
2. executor 並行實現 API 和前端元件
3. verifier 驗證測試覆蓋率

**場景 2：Bug 修復**

```bash
# 使用 ralph 確保完整修復
/ralph "修復使用者登入後 session 遺失的問題"
```

執行流程：
1. debugger 分析根因
2. 實施修復
3. verifier 確認問題已解決
4. 只有驗證通過才退出

**場景 3：程式碼重構**

```bash
# 使用 ultrawork 進行並行重構
/ultrawork "並行重構所有服務層的同步呼叫為非同步"
```

執行流程：
- 多個 executor 同時處理不同模組
- 最大並行度加快重構速度

### 8.2 進階使用技巧

**技巧 1：自訂團隊組成**

```bash
# 指定特定數量和類型的智慧體
/team 2:architect + 3:executor + 2:verifier + security-reviewer "重構整個後端架構"
```

**技巧 2：使用 ecomode 最佳化成本**

```bash
# 啟動代幣高效模式
/ecomode /team "開發內部工具"
```

在預算有限時使用 haiku 進行更多任務。

**技巧 3：深度需求訪談**

```bash
# 在開始實現前進行深度需求澄清
/deep-interview "收集電子商務平台的完整需求"
```

確保在動手前充分理解需求，避免返工。

### 8.3 效能最佳化建議

**最佳化 1：合理選擇模型**

```json
// 在設定中設置智慧體到模型的對應
{
  "model": {
    "routing": {
      "haiku": ["explore", "writer", "document-specialist"],
      "sonnet": ["executor", "debugger", "test-engineer", "verifier"],
      "opus": ["architect", "planner", "critic", "analyst"]
    }
  }
}
```

**最佳化 2：並行任務組合**

```bash
# 將相互獨立的任務並行執行
/ultrawork "並行執行：程式碼審查 + 安全掃描 + 效能測試"
```

**最佳化 3：增量工作流**

```bash
# 分階段執行，每個階段後驗證
/team "實現使用者模組"
# 驗證通過後再繼續
/team "實現訂單模組"
```

### 8.4 故障排除

**問題：Team 模式執行時間過長**

解決方案：
- 檢查是否有循環依賴
- 減少並行智慧體數量
- 使用 ultrawork 代替 Team（如果不需要順序協調）

**問題：驗證階段反覆失敗**

解決方案：
- 使用 ralph 模式進行深度修復
- 檢查是否有未解決的依賴問題
- 考慮分解任務為更小的單元

**問題：模型回應品質下降**

解決方案：
- 切換到更高級的模型（sonnet → opus）
- 簡化提示詞
- 檢查上下文長度是否超出限制

## 結語

oh-my-claudecode 代表了 AI 輔助開發的新典範。它不是要取代 Claude Code，而是要增強它，讓單個工具變成一個可以協同工作的 AI 團隊。透過專業的智慧體分工、智慧的模型路由、彈性可組合的 Skills 系統，OMC 讓複雜軟體的開發變得更加可管理和高效。

無論你是獨立開發者還是團隊負責人，OMC 都有值得探索的價值。從今天開始，嘗試在你的下一個專案中引入 OMC，體驗用自然語言驅動一支 AI 團隊的感覺。

**記住：不要學習 Claude Code，直接用 OMC。**

---

*本文基於 oh-my-claudecode v4.15.7 版本編寫，如有更新請參考官方文件。*
