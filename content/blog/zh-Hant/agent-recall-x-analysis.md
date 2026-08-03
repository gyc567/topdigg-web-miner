---
title: "AgentRecall-X 深度解析：會從糾正中學習的 Agent 記憶，與誠實測量革命"
description: "全面分析 Goldentrii 開源的 AgentRecall-X —— 一個「從糾正中學習」的 Claude Code 記憶系統，也是唯一把「agent 是否真的不再重複犯錯」量化出來的開源專案。從「受治理的糾正帳本」與「缺失的測量儀器」雙核心定位，到基於認知心理學的五層記憶模型，從 35.3% 的真實捕獲率與 0/3 的誠實數據，到 /arstart /arsave /arrecall /arreflect 四步會話循環，再到完整的 MCP 安裝教學與「自動化原則」設計哲學，一文講透這個 312 stars 卻攪動整個 agent 記憶賽道的專案。"
date: "2026-08-03"
author: "TopDigg Research Team"
tags: ["AgentRecall", "Agent Memory", "Claude Code", "MCP", "Corrections Ledger", "RAG", "Mem0", "Retrieval", "AI Agent", "Memory Layers", "TypeScript"]
categories: ["深度解析"]
keywords: ["AgentRecall-X", "Agent 記憶", "Claude Code 記憶", "MCP Server", "糾正帳本", "測量儀器", "五層記憶", "會話循環", "自動化原則", "誠實測量", "RAG", "檢索增強", "Mem0 對比", "AI Agent 記憶"]
---

# AgentRecall-X 深度解析：會從糾正中學習的 Agent 記憶，與誠實測量革命

> 核心理念：**「記憶工具的價值不在於存了多少，而在於糾正是否真的改變了 agent 的下一次行為。」** AgentRecall-X 用一句話定義了它與所有競品的分野——它不只是一台記憶引擎，而是 **(a) 一個受治理的糾正帳本** 和 **(b) 一台測量「糾正→行為改變」的儀器**。當整個行業都在自報高分的檢索 benchmark 時，它選擇公布自己 35.3% 的捕獲率和 0/3 的遵從數據——**「Measured, not promised.」（被測量的，而非被承諾的）**。

---

## 一、專案說明

### 1.1 這是什麼？

**AgentRecall-X**（原倉庫名 AgentRecall-MCP）是 Goldentrii 開源的一個 Claude Code 記憶系統，官方自我定位是：

- **「從糾正中學習的 Claude Code 記憶」**——不是被動地記住對話，而是主動從你的每一次糾正中學習規則；
- **「唯一衡量 agent 是否真正不再重複犯錯的學習閉環」**——它不承諾「永不重複錯誤」，而是用數據告訴你它到底有沒有做到；
- 形態覆蓋 **MCP · SDK · CLI · Skill** 四種整合方式。

關鍵事實：

- 倉庫：`https://github.com/Goldentrii/AgentRecall-X`
- Stars：**312**，Forks：53
- 協議：MIT
- 語言：TypeScript / JavaScript（monorepo）
- 最新版本：v3.4.40（2026 年 7 月 27 日）
- npm 週下載：約 2,759 次

### 1.2 它想解決什麼問題？

用過 AI 程式設計助手的人都有這個體驗：**你糾正了 agent 一百遍「先問再改」「別動這個檔案」，它下一輪還是會犯同樣的錯。** 市面上主流的記憶工具（Mem0 ~60K stars、Graphiti/Zep ~28K、Supermemory ~28K、Letta ~24K）都在做「記住更多」，但沒有人回答一個更基本的問題：

> **記住的糾正，到底有沒有改變行為？**

AgentRecall-X 指出這個領域的兩大缺陷：

- **測檢索，不測行為**：LongMemEval、LoCoMo、MemoryAgentBench、Letta Leaderboard——所有公開 benchmark 都在測「能不能檢索到」，沒有一個是測「檢索到之後，agent 是否真的照做了」；
- **自報高分，無法復現**：大多數記憶工具的 benchmark 數字是自我報告、同一套檢索測試、難以獨立復現。

AgentRecall-X 的答案：**先造測量儀器，再談記憶。** 它把「糾正帳本」和「測量工具」作為第一公民，而檢索只是其中的一個零件。

---

## 二、核心思想：Measured, not promised

### 2.1 受治理的糾正帳本（Governed Corrections Ledger）

每次你糾正 agent（*「不對，不是那個版本」*、*「這段放前面」*、*「假設之前先問我」*），它都會被存成一條結構化記錄，帶嚴重度、證據與結果追蹤：

- `rule` —— 規則內容（agent 必須遵循的行為準則）
- `why` —— 這條規則為什麼存在
- `project` —— 屬於哪個專案
- `date` —— 記錄日期
- `severity` —— **P0**（never/always/don't）或 P1（一般偏好）
- `active` —— 是否啟用
- `holder` —— 規則所有者
- `heeded_count` —— 被遵從的次數
- `recurred_count` —— 錯誤復發的次數
- `proof_confidence` —— 證據置信度

它持久化在**跨會話、跨專案、跨 agent 重啟**的儲存中——糾正一次，終身有效，直到被顯式撤回。

### 2.2 缺失的測量儀器（The Missing Measurement Instrument）

這是 AgentRecall-X 最獨特的貢獻：**每一條糾正都會累積 `retrieved_count`（被檢索次數），而每當 agent 再次遇到相同情境，結果都會被記錄為 `heeded`（遵從）或 `recurred`（復發）。**

作者的原話：

> **「這個領域裡的每個 benchmark 都在測檢索；沒有一個測試跨會話的行為變化。我們先把測量工具造出來——並且公布我們發現的一切，包括那些不好看的數字。」**

### 2.3 它自己公布的真實數據（2026-07-03）

- **糾正捕獲召回率**（雙重盲審，n=59）：**35.3%** [17.3–58.7 信賴區間]——只捕獲了約 1/3 的真實糾正；
- **遵從率（證據支撐，重置後）**：**0/3** 事件——不是 92.5% 的「樂觀估計」，而是誠實的 0；
- **糾正遷移召回率**（離線基準，可達成水準）：**0/4** [Wilson 0–49%]——在自己的語料上得分 0；
- **session_start 注入中位數**：**1,489 tokens**（優化前 2,010；Mem0 錨點約 7K）；
- **p95 session_start 延遲（熱）**：**363 ms**（優化前 1,132）。

作者的解釋（誠實且精準）：

- 35.3% 的捕獲率說明**糾正捕獲本身是最大的瓶頸**；
- 0/3 不是「回歸」，而是**把預設值從「假設遵從」改為「未知」後的正確起點**；
- 遷移召回 0/4 是**數據密度問題**（19 個專案僅 32 條活躍糾正，太稀疏無法前置錯誤），**不是檢索架構問題**（內部實驗已確認 5 次）。

> 這一點極其罕見：**一個開源專案主動公布讓自己難看的數字，並且每個數字都能透過 `npm run bench` 從固定、雜湊鎖定的語料庫一鍵復現。**

---

## 三、技術架構：五層記憶模型

### 3.1 基於認知心理學的五層記憶

AgentRecall-X 把認知心理學的記憶分類法映射到 agent 的檔案系統：

- **第 1 層 · 情景記憶（Episodic）**——按時間順序記錄每次會話發生了什麼，路徑 `journal/`，工作中自動寫入；
- **第 2 層 · 語義記憶（Semantic）**——按主題聚類的事實，帶 `[[wikilinks]]` 雙向連結，路徑 `palace/rooms/`（Architecture、Goals、Blockers）；
- **第 3 層 · 程序記憶（Procedural）**——IF-THEN 產生式規則，可重複使用的 how-to，路徑 `palace/skills/`；
- **第 4 層 · 敘事記憶（Narrative）**——專案階段：目標 → 難點 → 如何解決 → 提煉，路徑 `palace/pipeline/`；
- **第 5 層 · 糾正記憶（Correction）**——行為校準規則，帶嚴重度與結果追蹤，路徑 `corrections/`；
- **+ 感知層（Awareness）**——從 N 次確認的糾正中提升出的跨專案洞察，路徑 `palace/awareness`，是「複利」的一層。

所有層共享同一套命名語法，任何 agent 都能從意圖組合出檢索路徑；既有檔案透過 `legacy_path` 檢視繼續工作，**無需遷移**。

### 3.2 本地檔案結構

所有記憶預設存本地 Markdown，零雲端：

```
~/.agent-recall/
├── awareness.md                  # 全域複合文件（約 200 行）
├── awareness-state.json          # 結構化 awareness 資料
├── insights-index.json           # 跨專案 insight 匹配
├── feedback-log.json             # 檢索品質評分
└── projects/<name>/
    ├── journal/YYYY-MM-DD--arsave--NL--slug.md
    ├── palace/
    │   ├── rooms/<room>/         # 持久知識房間
    │   ├── skills/               # 程序規則
    │   ├── pipeline/             # 敘事階段
    │   ├── awareness/            # 跨專案洞察
    │   ├── identity.md           # 專案意圖 + 目標
    │   └── graph.json            # 記憶連接邊
    └── corrections/
        └── alignment-log.json    # 糾正歷史
```

### 3.3 技術棧與檢索

- **核心**：TypeScript monorepo，4 個發布套件（`core` 儲存+工具邏輯、`mcp-server` 薄 MCP 包裝、`sdk` 程式化介面、`cli` 的 `ar` 命令）；
- **預設檢索**：關鍵詞/子字串匹配（詞幹還原 + 同義詞擴展 + 輕量 IDF + 按來源排序），透過 **RRF（Reciprocal Rank Fusion，Cormack 2009）** 融合——注意：**不是 BM25**，作者明確說沒有倒排索引，真實 BM25 是「未來可能」的升級；
- **可選語義檢索**：設定 `OPENAI_API_KEY` 後啟用向量搜尋；可選 Supabase 鏡像（pgvector）；
- **衰減演算法**：FSRS-lite（Ebbinghaus → SuperMemo → FSRS-6 譜系）；
- **重新排序**：Modern Hopfield re-rank primitive（Ramsauer 2020）存在於程式碼中，但**未接入預設路徑**——「現在跑什麼就是什麼」；
- **使用者回饋**：檢索結果可評分，透過 Bayesian Beta 模型更新排名。

---

## 四、設計哲學

### 4.1 自動化原則（The Automaticity Principle）

> **「記憶只有在自動觸發時才會複利，而不是按需呼叫。」**

實證依據：對 44 個專案、221 個 journals、81 個糾正的長期觀察（2026-06-12）發現——**所有「拉取式」工具（recall、memory_query）的有機呼叫次數為零**，包括建構它們的那台 agent 自己也不用。而「推送式」通道（session_start、session_end、糾正 hooks、ambient recall）持續產生行為改變。

結論：預設只發布 **5 個工具**；「雙動詞模型」——`session_start`（吸氣）和 `session_end`（呼氣）——承載了全部複利價值，其餘全部 opt-in（`--full`）。

### 4.2 誠實測量優先於行銷敘事

- 刪除了「Every correction saved is a mistake never repeated」（無法證偽的行銷話術）；
- 刪除了競品對比表（屬性會漂移，無法持續追蹤）；
- 建立了可復現測量框架：每個數字都可以用一條命令重新生成，「包括那些讓我們難看的數字」。

### 4.3 本地優先，零雲預設（Zero Cloud by Default）

預設路徑純本地 Markdown，不依賴任何雲服務；Supabase 鏡像和 OpenAI 向量是**可選項**。這也是「Cheap + Private」的體現——你的糾正帳本屬於你。

### 4.4 有主見的選擇

- **用 Markdown 而非向量庫做預設儲存**——可讀、可 diff、可 grep、可 git 版本控制；
- **用 RRF 而非 BM25**——夠用且誠實，不假裝比實際更複雜；
- **用 MCP 而非專有協定**——一套介面接入所有 agent 用戶端。

---

## 五、詳細教學：從零開始用 AgentRecall-X

### 5.1 安裝 MCP Server

**Claude Code（一鍵安裝）：**

```bash
claude mcp add --scope user agent-recall -- npx -y agent-recall-mcp
```

**Cursor（`.cursor/mcp.json`）：**

```json
{ "mcpServers": { "agent-recall": { "command": "npx", "args": ["-y", "agent-recall-mcp"] } } }
```

**VS Code（`.vscode/mcp.json`）：**

```json
{ "servers": { "agent-recall": { "command": "npx", "args": ["-y", "agent-recall-mcp"] } } }
```

**Windsurf（`~/.codeium/windsurf/mcp_config.json`）：**

```json
{ "mcpServers": { "agent-recall": { "command": "npx", "args": ["-y", "agent-recall-mcp"] } } }
```

**Codex：**

```bash
codex mcp add agent-recall -- npx -y agent-recall-mcp
```

### 5.2 安裝 Skill（Claude Code 專用）

```bash
mkdir -p ~/.claude/skills/agent-recall
curl -o ~/.claude/skills/agent-recall/SKILL.md \
  https://raw.githubusercontent.com/Goldentrii/AgentRecall-X/main/SKILL.md
```

### 5.3 安裝 SDK 與 CLI

```bash
npm install agent-recall-sdk            # JS/TS 應用
npx agent-recall-cli recall "topic"     # 終端 & CI
```

### 5.4 四步會話循環（The Session Loop）

這是 AgentRecall-X 的核心用法——**「沒有 /arstart，全新 agent 零定向；沒有 /arsave，一切不會複利。」**

- **`/arstart`**（每次會話**第一個**動作）——開啟狀態板：列出所有專案的待辦與阻塞項，按編號選擇後載入該專案的深度上下文（palace 房間、糾正、任務召回）；`/arstart <slug>` 直接載入；`/arstart bootstrap` 掃描整台機器匯入既有專案；
- **`/arsave`**（每次會話**最後一個**動作）——寫入 journal + palace 整合 + awareness 複利；`/arsave all` 批次儲存當天所有並行會話（掃描、合併、去重）；
- **`/arrecall`**（會話中途按需）——搜尋過去的知識：文件化修復、歷史決策、既有模式；
- **`/arreflect`**（每 K 個會話）——週期性整合：確認復發/幽靈匹配、聚類新錯誤類、提議規則再抽象（**規則修改始終由所有者把關**）。

### 5.5 核心 MCP 工具速查

**session_start（會話開始時）：**

```json
{ "project": "my-app" }
```

返回：專案身份、前 5 條 awareness insights、顯著度最高的 palace 房間、來自過去糾正模式的預測警告（`watch_for`）、最多 10 條 P0 行為規則、續接簡報。

**remember（學到新知識時）：**

```json
{
  "content": "We decided to use GraphQL instead of REST",
  "context": "architecture decision"
}
```

返回：自動路由目標（`routed_to`）、內容分類、自動生成的語義 slug。

**recall（搜尋過去知識時）：**

```json
{ "query": "authentication design", "limit": 5 }
```

可附帶回饋評分，驅動 Bayesian 排名更新。

**session_end（會話結束時）：**

```json
{
  "summary": "Built auth module with JWT refresh rotation. Fixed CORS bug.",
  "insights": [{
    "title": "JWT refresh tokens need httpOnly cookies",
    "evidence": "XSS attack vector discovered during security review",
    "applies_when": ["auth", "jwt", "security", "cookies"],
    "severity": "critical"
  }],
  "trajectory": "Next: add rate limiting to API endpoints"
}
```

**check（重大決策前驗證理解）：**

```json
{
  "goal": "Build REST API for user management",
  "confidence": "medium",
  "assumptions": ["User wants REST, not GraphQL", "CRUD endpoints"]
}
```

### 5.6 SDK 使用範例

```typescript
import { AgentRecall } from "agent-recall-sdk";

const memory = new AgentRecall({ project: "my-app" });

// 捕獲知識
await memory.capture("What stack?", "Next.js + Postgres");

// 搜尋記憶
const ctx = await memory.recall("rate limiting");
```

### 5.7 實驗性工具包（Recurrence & Reflection Harness Kit）

- `ar-scoreboard.py`（SessionStart hook）——每次會話的健康摘要：糾正流、洞察提升率、迴圈健康度、幽靈計數、反思節奏；
- `ar-recurrence-check.py`——基於錯誤類分類法的機械幽靈偵測（規則之後仍發生違規 = phantom gradient step，寫入了成本但行為從未改變）；
- `ar-nudge.py`（UserPromptSubmit hook）——會話中主動浮出逾期反思；
- `dispatch-model-guard.py`（PreToolUse hook，可選）——顯式模型調度策略的警告守衛。

首次驗證執行（2026-07-14，單台重度使用者）：**109 條糾正中發現 8 個錯誤類、18 個確認的幽靈梯度步，當天重抽象 6 條規則。**

### 5.8 War Room 視覺化儀表板

1. 從 [最新 Release](https://github.com/Goldentrii/AgentRecall-X/releases/latest) 下載 `ar-warroom-v3.4.40.zip`；
2. 解壓並本地啟動：

```bash
cd warroom
python3 -m http.server 8080
```

3. 開啟 **http://localhost:8080/AgentRecall.html** —— 活動日曆、各專案狀態、糾正、洞察，全部從本地 `~/.agent-recall/` 資料渲染，**完全離線，無需 Node 與建置步驟**。

---

## 六、功能清單：開箱即用

- **受治理糾正帳本**：嚴重度（P0/P1）+ 證據 + 撤回 + 結果追蹤
- **行為測量**：`retrieved_count` / `heeded` / `recurred` 三指標
- **五層記憶**：情景 / 語義 / 程序 / 敘事 / 糾正 + Awareness 複利層
- **雙動詞會話模型**：`session_start` / `session_end`，其餘 opt-in
- **檢索**：關鍵詞 + 同義詞 + 輕量 IDF + RRF 融合（可選 OpenAI 向量）
- **回饋學習**：檢索結果 Bayesian Beta 評分
- **夢境模式（可選）**：夜間自動整合，Ebbinghaus 衰減、journal 彙總、awareness 畢業、Telegram 日報
- **平台覆蓋**：Claude Code（主）、Cursor、Windsurf、VS Code/Copilot、Codex、Hermes、Roo Code、任意 JS/TS 應用、終端/CI
- **War Room**：離線視覺化儀表板
- **可復現基準**：`npm run bench` 一鍵復現全部數字
- **本地優先**：預設零雲端，Markdown 可讀可 git 管理

---

## 七、歸納總結：觀點與結論

### 7.1 核心觀點

1. **「記憶引擎」是個被誤用的標籤——AgentRecall-X 本質是糾正帳本 + 測量儀器。** 作者在內部研究文件裡直接斷言：「AgentRecall 不是記憶引擎。它是（a）一個受治理的糾正帳本和（b）糾正學習的缺失測量儀器——目前被誤標為記憶工具。」**這是定位的誠實，也是差異化的起點。**
2. **「測檢索不測行為」是整個 agent 記憶賽道的系統性盲區。** LongMemEval、LoCoMo、MemoryAgentBench 全在測檢索；AgentRecall-X 是唯一公開測量「跨會話行為改變」的開源系統。**當別人都在比「存得多」，它選擇比「改得真」。**
3. **誠實的數據是稀缺資產。** 公布 35.3% 的捕獲率和 0/3 的遵從率，短期看是「不好看的數字」，長期看是**信任的護城河**——因為每個數字都可以從雜湊鎖定的語料庫復現，「包括那些讓我們難看的數字」。
4. **自動化原則：記憶的複利來自推送，不來自拉取。** 44 個專案、數週真實使用中，所有拉取式工具零呼叫——**預設只發布 5 個工具、用雙動詞承載全部價值，是數據驅動的最優解，而不是設計者的偏好。**
5. **當前瓶頸是數據密度，不是檢索架構。** 19 個專案僅 32 條活躍糾正（75% 已被撤回）——糾正樣本太稀疏，無法前置錯誤。**先解決「捕獲」，再優化「檢索」，順序不能反。**

### 7.2 它在賽道中的位置（與競品對比）

- **Mem0**（~60K stars）——向量 + BM25 + 實體，糾正層低，編碼 agent 聚焦高；
- **Graphiti/Zep**（~28K）——時序知識圖譜（Neo4j），糾正層低；
- **Supermemory**（~28K）——fact + profiles + KG + RAG，編碼 agent 聚焦**最高**；
- **Letta**（~24K）——agent 可編輯記憶塊，糾正層中；
- **AgentRecall-X**（312 stars）——Markdown 糾正帳本 + 五層記憶，**糾正層原生**，編碼 agent 聚焦高，**預設本地零雲**。

**以 312 stars 對抗 60K stars 的巨頭，它的策略不是「做得更多」，而是「測得更真」。**

### 7.3 對開發者的啟示

- **糾正捕獲是最被低估的環節**——35.3% 的捕獲率意味著再強的檢索也救不回沒被記住的錯誤；
- **測量先行**：任何記憶系統都該先回答「它改變行為了嗎」，再談儲存與檢索；
- **預設值決定產品性格**：把「未驗證=遵從」改成「未驗證=未知」，0/3 才是誠實起點；
- **本地優先是可複製的產品策略**：Markdown 記憶可讀、可 diff、可 git，勝過任何黑盒向量庫。

### 7.4 結語

在 agent 記憶賽道擁擠到「人人自報 90%+ 檢索分」的 2026 年，AgentRecall-X 用一組「難看但真實」的數字，劃出了一條完全不同的起跑線。它可能沒有最多的 stars，但它擁有這個領域最稀缺的東西——**一個可以證偽自己的測量儀器，和一份願意公布壞消息的誠實**。

> **當整個行業都在展示檢索的輝煌時，AgentRecall-X 選擇測量行為的真相。這或許才是 agent 記憶真正該走的路。**

---

## 參考資料

- AgentRecall-X 官方倉庫：https://github.com/Goldentrii/AgentRecall-X
- 官方完整文件：https://github.com/Goldentrii/AgentRecall-X/blob/main/README.full.md
- 更新日誌（設計推理）：https://github.com/Goldentrii/AgentRecall-X/blob/main/UPDATE-LOG.md
- 競品研究報告：https://github.com/Goldentrii/AgentRecall-X/blob/main/docs/research/agent-memory-landscape-2026-07.md
- 基準復現指南：https://github.com/Goldentrii/AgentRecall-X/blob/main/docs/eval/REPRODUCE.md
- npm 套件：https://www.npmjs.com/package/agent-recall-mcp
