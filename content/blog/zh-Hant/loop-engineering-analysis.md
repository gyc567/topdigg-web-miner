---
title: "Loop Engineering 深度解析：停止提示詞工程，設計讓 AI 代理自主運行的循環系統"
description: "全面解析 Loop Engineering——Cobus Greyling 提出的 AI 代理循環工程框架。核心思想：你不需要再手動提示 AI，你需要設計一個自動提示 AI 的系統。包含五大構建塊（自動化/排程、工作樹、技能、插件/連接器、子代理）+ 記憶/狀態，7 個生產級模式（每日分診、PR 看護、CI 清掃、依賴清掃、變更日誌起草、合併後清理、Issue 分診），從 L1 報告到 L2 輔助修復到 L3 無人值守的漸進自治，以及完整的工具生態。從核心思想、設計哲學、完整教程到功能清單，一文講透。"
date: "2026-08-04"
author: "TopDigg Research Team"
tags: ["Loop Engineering", "AI Agent", "Automation", "Grok", "Claude Code", "Codex", "MCP", "DevTools", "Prompt Engineering"]
categories: ["Deep Dive"]
keywords: ["Loop Engineering", "AI 代理", "循環工程", "自動化", "Grok", "Claude Code", "Codex", "MCP", "技能", "工作樹", "分診", "自治"]
---

# Loop Engineering 深度解析：停止提示詞工程，設計讓 AI 代理自主運行的循環系統

> 核心思想：**你不需要再手動提示 AI——你需要設計一個自動提示 AI 的系統。** Peter Steinberger 說：「你不應該再提示編碼代理了。你應該設計循環來提示你的代理。」 Boris Cherny（Anthropic Claude Code 負責人）說：「我不再提示 Claude 了。我有運行中的循環在提示 Claude 並 figuring out 該做什麼。我的工作是寫循環。」 Loop Engineering 是 Cobus Greyling 提出的 AI 代理循環工程框架，核心是**五大構建塊**（自動化/排程、工作樹、技能、插件/連接器、子代理）+ **記憶/狀態**，配合 7 個生產級模式和從 L1 到 L3 的漸進自治，讓 AI 代理從「需要人提示」變成「自主運行的系統」。

---

## 一、專案說明

### 1.1 它是什麼？

**Loop Engineering** 是一個**AI 代理循環工程框架**——它不教你如何寫更好的提示詞，而是教你如何設計一個系統，讓 AI 代理自主運行。核心定位：**從「提示詞工程」到「循環工程」的範式轉移**。

### 1.2 關鍵資料

- 儲存庫：`https://github.com/cobusgreyling/loop-engineering`
- 官網：`https://cobusgreyling.github.io/loop-engineering/`
- Stars：**9,838**
- Forks：**1,335**
- License：**MIT**
- 語言：**JavaScript**
- 作者：**Cobus Greyling**
- 建立時間：2026-06-09
- 生態系統：memory-engineering → loop-engineering → harness-foundry → outerloop → fleet-engineering

### 1.3 它解決什麼問題？

傳統 AI 輔助開發的痛點：每次都要手動寫提示詞，AI 不記得上次做了什麼，沒有質量反饋迴路，無法安全地讓 AI 自主修改代碼。Loop Engineering 的答案：**設計一個循環系統**——定義排程頻率、分診邏輯、狀態持久化、隔離執行、驗證網關，讓 AI 代理按照你設計的循環自主運行。

---

## 二、核心思想

### 2.1 從「提示詞工程」到「循環工程」

傳統做法：人寫提示詞 → AI 執行 → 人檢查 → 人再寫提示詞。Loop Engineering 的做法：人設計循環 → 循環自動提示 AI → AI 自主執行 → 循環自動驗證 → 循環自動記錄。**人從「提示者」變成「系統設計者」**。

### 2.2 五大構建塊 + 記憶

- **自動化/排程**：按節奏發現和分診
- **工作樹**：安全的並行執行
- **技能**：持久化的專案知識
- **插件/連接器**：連接真實工具（MCP）
- **子代理**：製作/檢查分離
- **+ 記憶/狀態**：超越對話的持久化脊柱

### 2.3 七個生產級模式

- **Daily Triage（每日分診）**：1天-2小時節奏，L1 報告，低 token 成本
- **PR Babysitter（PR 看護）**：5-15分鐘節奏，L1 監控，高 token 成本
- **CI Sweeper（CI 清掃）**：5-15分鐘節奏，L2 謹慎修復，極高 token 成本
- **Dependency Sweeper（依賴清掃）**：6小時-1天節奏，L2 僅補丁，中等 token 成本
- **Changelog Drafter（變更日誌起草）**：1天或 tag 節奏，L1 草稿，低 token 成本
- **Post-Merge Cleanup（合併後清理）**：1天-6小時節奏，L1 低峰期，低 token 成本
- **Issue Triage（Issue 分診）**：2小時-1天節奏，L1 僅提議，低 token 成本

### 2.4 漸進自治：L1 → L2 → L3

- **L1 報告**：AI 只報告發現，不自動修復（第一週規則）
- **L2 輔助修復**：AI 在隔離工作樹中嘗試修復，需要驗證器確認
- **L3 無人值守**：AI 自主修復並自動合併，需要預算和門控

---

## 三、設計哲學

### 3.1 「設計系統，而不是寫提示詞」

Boris Cherny 說：「我的工作是寫循環。」這意味著 AI 工程師的價值不再是寫更好的提示詞，而是設計更好的控制系統。循環是可複用、可版本化、可審計的——而提示詞是一次性的。

### 3.2 「第一週只報告，不修復」

新系統上線第一週，AI 只能報告發現，不能自動修復。這給了人類足夠的時間理解循環的行為，建立信任，然後再逐步放開權限。

### 3.3 「記憶是超越對話的脊柱」

沒有記憶的 AI 代理每次對話都從零開始。Loop Engineering 通過 STATE.md、loop-budget.md 等文件，讓 AI 代理擁有跨會話的持久化記憶。

### 3.4 「驗證比生成更重要」

每個循環都有驗證器子代理——它不信任製作器子代理的輸出，而是獨立驗證。這種「製作/檢查分離」是安全自治的基礎。

### 3.5 「漸進式信任」

L1 → L2 → L3 不是技術升級，而是信任升級。每一步都需要人類確認系統值得更多自治。

---

## 四、詳細教程

### 4.1 五分鐘快速開始

**Step 1：選擇你的痛點**

不確定選哪個模式？用交互式模式選擇器：`https://cobusgreyling.github.io/loop-engineering/#interactive`

**Step 2：在你的倉庫中腳手架**

```bash
# 統一 CLI（推薦）
npx @cobusgreyling/loop init . --pattern daily-triage --tool grok

# 一次健康檢查
npx @cobusgreyling/loop doctor .
```

**Step 3：檢查成本**

```bash
npx @cobusgreyling/loop cost --pattern daily-triage --level L1 --cadence 1d
```

**Step 4：審計就緒度**

```bash
npx @cobusgreyling/loop doctor .
```

**Step 5：運行你的第一個循環——只報告**

Grok：
```bash
/loop 1d Run loop-triage. Update STATE.md. No auto-fix in week one.
```

Claude Code：
```bash
/loop 1d Run $loop-triage. Read STATE.md. Merge findings into High Priority and Watch List. Update Last run. Do not edit code.
```

**Step 6：讀取輸出，提交狀態**

打開 `STATE.md`，編輯錯誤的部分。

### 4.2 L2：隔離修復嘗試

```bash
npx @cobusgreyling/loop-worktree create --run-id pr-217-fix-1 --pattern pr-babysitter
npx @cobusgreyling/loop-worktree mark --run-id pr-217-fix-1 --status rejected
npx @cobusgreyling/loop-worktree cleanup --older-than 24h
```

### 4.3 斷路器

```bash
npx @cobusgreyling/loop context --check --ledger loop-ledger.json
# 退出 0 = 繼續 · 退出 2 = 升級給人類
```

---

## 五、工具生態

- **loop**：統一 CLI 入口
- **loop-audit**：循環就緒度評分（0-100）
- **loop-init**：腳手架 + 預算/運行日誌
- **loop-cost**：token 消耗估算器
- **loop-sync**：STATE.md 和 LOOP.md 漂移檢測
- **loop-context**：有狀態記憶管理器 + 斷路器
- **loop-mcp-server**：MCP 運行時查找
- **loop-worktree**：隔離 git 工作樹
- **loop-gate**：路徑拒絕列表 + 自動合併允許列表
- **loop-sandbox**：臨時工作樹隔離 + 補丁捕獲
- **loop-action**：GitHub Composite Action
- **loop-swarm**：多代理共識沙箱

---

## 六、歸納總結（觀點與結論）

1. **「寫循環」比「寫提示詞」更有槓桿效應。** 提示詞是一次性的，循環是可複用、可版本化、可審計的系統。

2. **漸進式信任是唯一安全的自治路徑。** L1 → L2 → L3 是信任升級，不是技術升級。

3. **記憶是 AI 代理的「脊柱」。** 沒有記憶的 AI 代理每次對話都從零開始。

4. **驗證器是信任的基石。** 製作/檢查分離是安全自治的基礎。

5. **token 成本是真實的約束。** 高頻循環會快速消耗 token，需要預算管理。

6. **生態系統思維。** Loop Engineering 是 memory → loop → foundry → outerloop → fleet 生態系統的一部分。

---

## 參考資料

- 儲存庫：`https://github.com/cobusgreyling/loop-engineering`
- 官網：`https://cobusgreyling.github.io/loop-engineering/`
- 原文：`https://cobusgreyling.substack.com/p/loop-engineering`
- Addy Osmani 評論：`https://addyosmani.com/blog/loop-engineering/`
- 快速開始：`https://github.com/cobusgreyling/loop-engineering/blob/main/docs/QUICKSTART.md`