---
title: "Cumora 深度解析：AI Agent 作為團隊一等公民的跨平臺協作平臺——產品形態、詳細教程與設計哲學"
description: "以 yetone/cumora（GitHub 開源、MIT、v0.2.2）為主線，逐層拆解 Cumora：①項目說明——一個 PWA+Electron+Capacitor 三端同源、Cumora Cloud+BYOA 雙腦路徑的跨平臺團隊聊天應用，AI Agent 作為 first-class 團隊成員；②詳細教程——本地啟動（Postgres+Redis）、雙腦切換（managed / Claude Code / Codex / Grok Build / Cursor Agent）、協調防線（freshness gate / atomic claim / small-brain triage）、真實郵箱（Resend 出 + Cloudflare Email Routing 入）、Coordination 設計哲學；③技術架構——React 18 + Vite + TS + Tailwind 前端、Express + ws + Postgres + Redis 後端、Kubernetes agent pods、Go FUSE 掛載工作區、LLM 呼叫成本帳本；④7 條設計哲學——Agent 是隊友不是聊天機器人、Computer 一等公民、解耦的 I/O 表面、協作不碰撞、成本帳本透明化、CI 強制 big-brain 守衛、feature lifecycle 完整閉環。核心主張：把 AI Agent 當作真正的團隊成員而不是響應式工具——他們有持久 persona、記憶、領取工作、互相協調、收發郵件，所有這一切跑在同一個 Roster 上。"
date: "2026-08-25"
author: "TopDigg Research Team"
tags: ["Cumora", "yetone", "AI Agent", "Multi-Agent", "BYOA", "Claude Code", "Codex", "Cursor Agent", "Grok Build", "Kubernetes", "React", "Vite", "Express", "Postgres", "Redis", "Electron", "Capacitor", "Cloudflare Workers", "OpenAI Responses API", "Open Source", "MIT", "Agent 協調", "freshness gate", "triage"]
categories: ["Deep Dive"]
keywords: ["Cumora", "yetone/cumora", "AI agent team", "multi-agent collaboration", "BYOA", "Bring Your Own Agent", "Claude Code", "Codex CLI", "Cursor Agent", "Grok Build", "OpenAI Responses API", "agent coordination", "freshness gate", "atomic claim", "small-brain triage", "Kubernetes agent pods", "Go FUSE", "React 18", "Vite", "TypeScript", "Tailwind", "Express", "WebSocket", "Postgres", "Drizzle ORM", "Redis pub/sub", "Electron", "Capacitor", "Cloudflare Workers", "Resend", "agent persona", "agent memory", "feature lifecycle", "ship protocol", "open source", "MIT license", "設計哲學"]
---

# Cumora 深度解析：AI Agent 作為團隊一等公民的跨平臺協作平臺——產品形態、詳細教程與設計哲學

> **核心思想**：**Cumora（yetone/cumora）不是又一個"AI 聊天機器人接入"——它是一個把 AI Agent 當作**團隊一等公民**的跨平臺協作平臺。在 Cumora 裡，AI Agent 和人類共用同一個花名冊、同一批 DM、同一批群聊、同一塊 Kanban、同一個日曆。Agent 不只是被召喚時回答問題——他們**有持久 persona、記憶、能主動認領工作、互相協調不衝突、能收發真實郵件**，而且可以選擇跑在 Cumora 官方的雲上，或者跑在你自己的 Mac/VPS 上（BYOA）。它的核心工程判斷是：**"協作是 N 個獨立思考者 + 一個協調層 + 一套透明帳本"**——7 條防禦層（per-agent model pin、並發信號量、確定性 spawn pacing、自適應 AdaptivePacer、wake debounce、per-agent 限速冷卻、freshness preflight）+ 一個 small-brain triage 大門 + 一個 `llm_calls` 成本帳本，把多 Agent 協作從"群聊發訊息"變成"工程化協同系統"。這個判斷透過 2 套部署路徑（Managed / BYOA）、5 套文件（BYOA / COORDINATION / SHIPPING / email / i18n）、2 套架構守衛（guard:big-brain / guard:llm-tracked）、1 個 feature lifecycle（Draft → Contract → Building → Verifying → Ready → Releasing → Watching → Learned）變成可執行的工程實現。

---

## 一、專案說明

### 1.1 它是什麼？

本文解析的是 GitHub 倉庫 [`yetone/cumora`](https://github.com/yetone/cumora)（TypeScript，MIT 協議，v0.2.2）——一個**跨平臺的團隊聊天應用，把 AI Agent 作為 first-class 參與者**。

它的工作方式可以一句話講清：

> **Cumora = 一個 PWA / Electron / iOS / Android 同源客戶端 + 一個 Express + ws + Postgres + Redis 後端 + N 個 agent runtime（managed K8s pods 或 BYOA local daemons）+ Cloudflare Workers（email-gate / r2-gate）**——AI Agent 和人類在同一個 Roster 上共存，Agent 有 persona、記憶、能認領工作、互相協調、能收發真實郵件。

Cumora 自己做了一件"刻意不做"的事情：**它不發明新的 LLM、不發明新的 agent 框架、不替代你的訂閱**。它做的事情是：

1. **把 Agent 當成隊友**——同一個花名冊、同一個 DM、同一批群聊、同一塊 Kanban、同一個日曆——Agent 不是被動的 chatbox，是有狀態的、主動的協作者；
2. **兩條"大腦"路徑**：
   - **Cumora Cloud**（managed）：每個 Agent 跑在一個 K8s pod 裡，`server/src/agents/turn.ts` 跑一個多跳工具呼叫迴圈，呼叫 OpenAI Responses API（bash、檔案、瀏覽器、email、memory、skills）；
   - **BYOA (Bring Your Own Agent)**：你自己跑 `npx cumora agent computer` daemon，把你本機的 **Claude Code / Codex / Grok Build (`grok`) / Cursor Agent (`cursor-agent`)** 當成 Agent 的大腦——伺服器永遠拿不到你的 provider key；
3. **解耦的 I/O 表面**——Agent 跑在什麼大腦上、跑在哪臺 Computer 上，跟它對外"發訊息、DM、讀寫 memory、操作 workspace"無關；這些動作全部走 `cumora` CLI（薄薄的 shim，POST argv 到 `/runtime/cli`），同一份協議適配任何大腦；
4. **真正的工程化協調**——N 個 Agent 在同一個房間不互相覆蓋。伺服器用一個 seen-cursor freshness gate（陳舊回覆被 HELD，重新看新訊息再決定）+ atomic claims（對真實工作單元的原子認領）+ small-brain triage gate（用便宜模型守門，只放行值得 big-brain 的 wake）來仲裁；
5. **完整的跨平臺**——Web（PWA）/ Desktop（Electron + auto-update）/ iOS + Android（Capacitor），同一套 React 元件 + TS + Tailwind；
6. **Feature Lifecycle**——和人類一樣，Agent 也用 Ship 協議開發功能：`Draft → Contract → Building → Verifying → Ready → Releasing → Watching → Learned`，每個階段都需要 evidence squares、獨立的 builder/verifier、生產環境的 24 小時 readback；
7. **開源 + MIT**——`CONTRIBUTING.md` 把所有架構不變量和 CI 守衛寫得很清楚：`npm run guard:big-brain`（只允許 Agent turn 調大模型）+ `npm run guard:llm-tracked`（每次 LLM 呼叫都必須入帳）。

### 1.2 一句話定位

> **Cumora 是開源、bring-your-own-subscription 的 Slack + 一群 Claude Code / Codex / Cursor Agent / Grok Build 隊友。**

### 1.3 關鍵事實

- **倉庫**：[yetone/cumora](https://github.com/yetone/cumora)（MIT）
- **版本**：v0.2.2
- **產品網址**：[cumora.ai](https://cumora.ai) · Web app：[app.cumora.ai](https://app.cumora.ai)
- **主語言**：TypeScript（strict，前後端雙 tsconfig）
- **資料庫**：Postgres + Drizzle ORM
- **訊息匯流排**：Redis（pub/sub fan-out + presence）
- **服務端**：Node.js + Express 5 + ws（WebSocket）
- **前端**：React 18 + Vite + TypeScript + Tailwind CSS（desktop / mobile / web / admin 共用同一套元件）
- **桌面**：Electron + electron-updater（自動更新走 [yetone/cumora-releases](https://github.com/yetone/cumora-releases)）
- **行動**：Capacitor（iOS + Android，包名 `io.cumora.app`）
- **Agent runtime**：Cumora Cloud 跑在 K8s pods（每 Agent 一個，Go FUSE driver 掛載 server-side workspace）；BYOA 跑在使用者自己的 Mac/VPS（`npx cumora agent computer` daemon）
- **BYOA 支援的大腦**：Claude Code（Anthropic）/ Codex CLI（OpenAI）/ Grok Build `grok`（xAI）/ Cursor Agent `cursor-agent`
- **LLM 協議**：OpenAI Responses API（多跳 tool calling）
- **email 出**：Resend HTTP API（mock mode 不需要 key）
- **email 入**：Cloudflare Email Workers（workers/email-gate）
- **CDN**：Cloudflare R2（workers/r2-gate 簽章 URL）
- **推送**：APNs（iOS）+ FCM（Android），透過 Capacitor Push Notifications
- **Coordinator 防禦層**：7 層（per-agent model pin、big-brain 信號量預設 6、確定性 spawn pacing 預設 500ms、自適應 AdaptivePacer 最多 8s、wake debounce 2.5s、per-agent 限速冷卻 60s、freshness preflight）
- **架構守衛 CI**：`guard:big-brain`（只允許 agent turn 調大模型）+ `guard:llm-tracked`（每次 LLM 呼叫必須入帳）
- **Feature lifecycle 8 階段**：`Draft → Contract → Building → Verifying → Ready → Releasing → Watching → Learned`
- **基準測試**：`benchmarks/` 裡跑了真實的 LLM 多 Agent 協調基準——chain / counting / werewolf / kanban
- **i18n**：內建 English + Simplified Chinese (`zh-CN`)，每裝置獨立 locale 偏好
- **部署範圍**：PWA / Electron desktop / iOS / Android / 管理員介面，共 5 個 shell

### 1.4 它解決的問題

2026 年的"AI 團隊協作"被撕成 5 塊：

1. **Agent 只是聊天機器人**——大多數產品把 LLM 整合當成"@gpt 幫我總結"——Agent 沒有 persona、沒有記憶、不能主動發起對話、不能認領工作、不能互相協調；
2. **Agent 跑在雲上還是本地**——你想用 Claude Code / Codex CLI 的本地訂閱，又想要雲端的穩定性——BYOA 和 Managed 不能共存；
3. **Agent 互相"打架"**——多個 Agent 在同一個房間同時被喚醒、看到相同的訊息、做相同的決定、發發相同的訊息——"race collisions" 和 "brain misjudgment"；
4. **成本不可控**——多個 Agent 協作時，每個 turn 多少 token、多少錢、走哪個模型——缺乏透明的帳本；
5. **跨平臺不連續**——Web 上開的對話，手機上接不上；桌面提醒在 Electron 上有，行動端收不到——多端 UI 不統一。

Cumora 的回答：**讓 Agent 成為真正的隊友；讓大腦可以是官方的或你本地的；讓協調變成 7 層工程防線；讓每個 LLM 呼叫都進帳本；讓所有平臺跑同一套 React 元件。**

---

## 二、詳細教程：從 0 到跑起來一個 agent team

這一節按"本地啟動 → 啟動客戶端 → Managed / BYOA 切換 → 協調機制怎麼工作 → 真實郵箱 → Feature Lifecycle"六步走，每步都給可複製命令、最小示例與注意事項。來源：[CONTRIBUTING.md](https://github.com/yetone/cumora/blob/main/CONTRIBUTING.md)、[docs/BYOA.md](https://github.com/yetone/cumora/blob/main/docs/BYOA.md)、[docs/COORDINATION.md](https://github.com/yetone/cumora/blob/main/docs/COORDINATION.md)、[docs/SHIPPING.md](https://github.com/yetone/cumora/blob/main/docs/SHIPPING.md)。

### 2.1 第 1 步：本地環境準備

**前置條件**：

- **Node.js ≥ 18**（CI 跑 Node 24）
- **Postgres**（Homebrew / Docker 任選其一）
- **Redis**（Homebrew / Docker 任選其一）
- **OpenAI API Key**（唯一硬性必需的環境變數）

**最快試玩**：

```bash
# 建立資料庫
createdb -h localhost cumora

# 設定環境變數
export OPENAI_API_KEY=sk-...

# 克隆並安裝
git clone https://github.com/yetone/cumora.git
cd cumora
npm run setup        # 安裝 root + Email Worker 依賴
npm run dev:all      # Vite renderer :5180 + API server :5181
```

開啟 [http://localhost:5180](http://localhost:5180) 看 PWA，或者跑 `npm run electron:dev` 看桌面視窗。

> 注意：資料庫 schema 在啟動時**冪等地自動建立**，並 seed 一個 starter team（6 個 agents + 3 個人類 + 9 個對話），但**所有訊息都是實時產生的**——seed 只 seed 結構，不 seed 訊息。

### 2.2 第 2 步：環境變數配置

`OPENAI_API_KEY` 是唯一硬性必需的變數，其它都有預設值或未設定時 soft-disable：

| 變數 | 預設值 | 說明 |
|------|--------|------|
| `DATABASE_URL` | `postgres://$USER@localhost:5432/cumora` | Postgres 連線 |
| `REDIS_URL` | `redis://localhost:6379` | Redis 連線 |
| `OPENAI_MODEL` | 大模型 | 預設 big-brain 模型 |
| `OPENAI_MODEL_SUPPORT` | 支援模型 | triage 等用的小模型 |
| `PORT` | `5181` | API 連接埠 |

可選功能組（OAuth 登入、Resend + Cloudflare Email Routing 郵件、R2 儲存/CDN、APNs/FCM 推送、sub2api LLM 閘道、waitlist/invites、metrics）詳見 [`.env.example`](https://github.com/yetone/cumora/blob/main/.env.example) 和 `server/src/env.ts`。

### 2.3 第 3 步：選擇 Agent 的大腦路徑

#### 路徑 A：Cumora Cloud（Managed）

什麼都不用配置——`runAgentTurn`（在 `server/src/agents/turn.ts`）預設跑一個多跳工具呼叫迴圈，Agent 跑在每個 Agent 自己的 K8s pod 裡（用 `agent-computer` 映像），pod 透過 Go FUSE driver 掛載 server-side workspace。

```bash
# 伺服器端啟動後會 ensurePod：
# msg.new ─► scheduler.wakeOne ─► ensurePod (kubectl) ─► pod
#                                                       │
#                turn.ts hop loop ◄─────────────────────┘
#                getLlmClient → OpenAI Responses API
#                bash → cumora shim → /runtime/cli → DB
```

#### 路徑 B：BYOA（Bring Your Own Agent）

跑你自己 Mac/VPS 上的 daemon，把本地 CLI 當大腦：

```bash
# 安裝 cumora CLI（agent-cli npm 包）
npx cumora agent computer
```

支援的本地大腦：
- **Claude Code**（Anthropic）
- **Codex CLI**（OpenAI）
- **Grok Build** (`grok`)（xAI）
- **Cursor Agent** (`cursor-agent`)（Cursor）

> 關鍵屬性：**伺服器永遠不接觸你的 provider key**——BYOA 的整個 wake → turn 生命週期走 SSE (`/runtime/wake-stream`) + CLI (`/runtime/cli`)，但 API key 全在你本機。

### 2.4 第 4 步：理解 7 層協調防線

這是 Cumora 最精華的部分——多 Agent 在同一個房間不互相打架，靠 7 層工程防線 + 一個 triage gate：

```
┌─────────────────────────────────────────────────────────────┐
│  1. Per-agent model pin (deploy env)                        │
│     CUMORA_DEFAULT_CLAUDE_MODEL=claude-opus-4-7             │
│     → 鎖定模型，避免 CLI 預設值漂移                         │
├─────────────────────────────────────────────────────────────┤
│  2. Per-computer big-brain concurrency cap (daemon)         │
│     CUMORA_BYOA_MAX_CONCURRENT_BIG_BRAIN=6                  │
│     → 預設 6，避免突發 rate limit                           │
├─────────────────────────────────────────────────────────────┤
│  3. Deterministic spawn spacing (daemon)                     │
│     MIN_SPAWN_INTERVAL_MS=500ms                              │
│     → 確定性 pacing 代替隨機 jitter                          │
├─────────────────────────────────────────────────────────────┤
│  3a. Per-computer small-brain (triage) concurrency cap      │
│     CUMORA_BYOA_MAX_CONCURRENT_TRIAGE=8                      │
│     → triage 也守門（lesson learned 2026-06-02）            │
├─────────────────────────────────────────────────────────────┤
│  3b. AdaptivePacer — burst absorber for sustained throttling │
│     限速時翻倍（最多 8s），5 次成功減半                       │
│     → 全域自適應 backoff                                     │
├─────────────────────────────────────────────────────────────┤
│  3c. Wake debounce, coalescing, and same-turn steering      │
│     WAKE_DEBOUNCE_MS=2500 + 直接 ping steering + group nudge │
│     → 突發合併、單條直接轉、同回合補充                       │
├─────────────────────────────────────────────────────────────┤
│  4. Per-agent rate-limit cooldown (daemon)                  │
│     ENGINE_BACKOFF_AFTER_RATE_LIMIT_MS=60_000                │
│     → 單 agent 冷卻 60s，抑制 byoa_engine_failed 通知        │
├─────────────────────────────────────────────────────────────┤
│  5. Server-side freshness preflight (`cumora reply`)        │
│     seen-cursor vs baseline → HELD + 再決定                  │
│     → 防止 race collision                                   │
├─────────────────────────────────────────────────────────────┤
│  small-brain triage gate                                    │
│     haiku / gpt-5.4-mini 守門，actionable=true 才放行       │
│     → 保護 big-brain 不被瑣事浪費                           │
└─────────────────────────────────────────────────────────────┘
```

> **關鍵哲學**：**永遠不要在應該用程式碼機制的地方加 prompt 規則，也永遠不要在應該讓大腦決定的地方加程式碼機制。**前者會因為 prompt drift 失效，後者會因為沒給大腦正確狀態讓大腦判斷失誤。

### 2.5 第 5 步：讓 Agent 有真實郵箱

每個 Agent 都有一個**真實郵箱**（`<participantId>.<companySlug>@<EMAIL_DOMAIN>`），既能發也能收：

```
┌──────────────┐  MIME    ┌────────────────────────┐  HMAC-signed JSON   ┌──────────────────┐
│  Sender MTA  │ ───────► │  Cloudflare            │ ──────────────────► │  cumora-server   │
│ (gmail, etc) │   MX     │  Email Routing +       │   POST /webhooks/   │  /webhooks/email │
└──────────────┘          │  workers/email-gate    │   email/inbound     │  /inbound        │
                          └────────────────────────┘                     └──────────────────┘
                                                                                 │
                                                                                 ▼ wakes the recipient agent
                                                                         ┌──────────────────┐
                                                                         │  agent (pod or   │
                                                                         │  BYOA) runs a    │
                                                                         │  turn, replies   │
                                                                         └──────────────────┘
```

CLI 子命令：

```bash
cumora email send ...
cumora email reply ...
```

未設定 `RESEND_API_KEY` 時進入 mock 模式（回傳假的 message-id 並 log），方便本地開發。

### 2.6 第 6 步：跑測試與守衛

```bash
npm test                  # 單元測試（node:test）— server + workers
npm run test:integration  # 整合測試套件（需本地 Postgres/Redis）
npm run typecheck && npm run server:typecheck
npm run guard:big-brain   # CI 守衛：只允許 agent turn 用大模型
npm run guard:llm-tracked # CI 守衛：每次 LLM 呼叫必須入帳
```

### 2.7 第 7 步：Feature Lifecycle（Ship 協議）

Cumora 把"釋出"當成人類和 Agent 共享的、有 evidence 支撐的工作流：

```
Draft → Contract → Building → Verifying → Ready → Releasing → Watching → Learned
```

每個階段：

- **Contract** — 必須有 problem、desired outcome、concise contract
- **Building** — 至少一個 builder + 一個 invariant
- **Verifying** — 每個 invariant 必須被 evidence square 覆蓋，每個 square 必須有獨立 owner
- **Ready** — 所有 required square 都過，builder 不能驗證自己的 square
- **Production** — staging/canary 釋出成功 + release notes + rollback 計畫 + 可測 baseline + 審批
- **Watching** — 生產 smoke 通過後預設 24 小時後做 readback
- **Learned** — production readback 通過 + 沒有 failing regression

Agent 的 CLI：

```bash
cumora ship list
cumora ship show <feature_id>
cumora ship create "<title>" --problem "..." --outcome "..." --contract "..."
cumora ship square <feature_id> <square_id> running
cumora ship square <feature_id> <square_id> passed --evidence "..."
cumora ship friction <feature_id|none> "<title>" --severity high
cumora ship regression <feature_id> "<title>" --command "..." --expected "..."
```

---

## 三、技術架構

### 3.1 整體架構圖

```
 Electron / PWA / iOS / Android         ┌─────────────────┐
 ┌──────────────────┐   HTTP / WS       │   App workers   │──▶ OpenAI (Responses API)
 │    React UI      │ ◀───────────────▶ │  Express + ws   │──▶ Resend (email out)
 └──────────────────┘                   │    (any N)      │──▶ APNs / FCM (push)
                                        └───┬────────┬────┘
 Cloudflare Workers                         │        │ kubectl
 ┌─────────────────┐   webhooks / R2   ┌────▼───┐ ┌──▼──────────────┐
 │ email-gate      │ ────────────────▶ │Postgres│ │ Agent pods (K8s)│
 │ r2-gate (CDN)   │                   │ Redis  │ │ or BYOA daemons │
 └─────────────────┘                   └────────┘ └─────────────────┘
```

### 3.2 前端

- 純 UI（`src/`）：React 18 + Vite + TypeScript + Tailwind
- 4 個 shell 共用同一套元件：`desktop/`、`mobile/`、`web/`、`admin/`
- 後端驅動，**前端不做業務規則判斷**

### 3.3 後端

- 無狀態 Node 服務（`server/`）：Express + `ws`
- Postgres 是**真源**（pg pool + Drizzle schema）
- Redis 用於 **pub/sub fan-out** 和 **presence**
- 任意 N 個例項放在 LB 後面，透過 Redis bus 保持同步

### 3.4 Agent runtime

- **Cloud agents**：每個 Agent 一個 K8s pod（伺服器用 `kubectl` 編排；Go FUSE driver 掛載 server-side workspace）
- **BYOA agents**：跑在使用者機器上的 daemon（`npx cumora agent computer`）
- 兩者都透過**同一個 `cumora` CLI 協議**與世界互動
- **每次 LLM 呼叫**（不管來自 cloud 還是 BYOA）都進一個 `llm_calls` 成本帳本

### 3.5 關鍵不變量（CI 強制）

```bash
# 1. 只允許 agent turn 用大模型
npm run guard:big-brain

# 2. 每次 LLM 呼叫必須入帳
npm run guard:llm-tracked
```

這兩條是 Cumora 的**核心成本模型**——便宜的"小腦"模型處理 triage、分類、摘要、其它工具呼叫；貴的模型只用於真正的 Agent 推理 turn。

### 3.6 倉庫佈局

| 路徑 | 是什麼 |
|------|--------|
| `src/` | React renderer（desktop / mobile / web / admin） |
| `server/` | API + WebSocket + agent runtime（Express, Postgres, Redis） |
| `electron/` | 桌面 shell（auto-update via yetone/cumora-releases） |
| `ios/`, `android/` | Capacitor native shells（`io.cumora.app`） |
| `agent-cli/` | 發布的 npm 包 `cumora` —— 使用者跑的 BYOA daemon |
| `agent-fuse/` | Go FUSE driver 在 cloud pods 內掛載 agent workspace |
| `workers/` | Cloudflare Workers：`email-gate`（inbound mail）+ `r2-gate`（signed CDN） |
| `website/` | cumora.ai 的行銷站點（Cloudflare Pages） |
| `benchmarks/` | 真實 LLM 多 Agent 協調基準（chain / counting / werewolf / kanban） |
| `server/k8s/` | 部署 manifest + GKE notes |

---

## 四、歸納總結的觀點和結論

透過對 Cumora 的深度分析，可以歸納出以下 13 條關鍵觀點：

### 觀點 1：AI Agent 應該被設計成"隊友"，不是"聊天機器人"

**事實**：Cumora 讓 Agent 和人類共用同一個 Roster、DM、群聊、Kanban、日曆；Agent 有 persona、記憶、能主動認領工作、能收發郵件。

**結論**：把 Agent 設計成被動響應工具是產品形態的偷懶——真正的"AI 隊友"需要主動、記憶、協調能力。Cumora 把這條原則變成了工程實現（持久 persona、主動 wake、claim work、cross-agent coordination）。

### 觀點 2："大腦"和"宿主"應該解耦——Computer 是一等公民

**事實**：Cumora 把"Agent"和"Agent 跑在哪臺機器、用什麼大腦"解耦。Managed 用 `turn.ts` + OpenAI Responses API；BYOA 用 Claude Code / Codex / Grok Build / Cursor Agent CLI；兩者透過**同一個 `cumora` CLI 協議**與世界互動。

**結論**：Agent 的"思考能力"和"工作位置"不應該綁死——同一種"我的 Agent 跑在機器上"的心智模型，既能用於 Managed 雲服務，又能用於使用者本機。Cumora 稱之為 **Computer**（一個產品概念），不是 BYOA 的特例。

### 觀點 3：I/O 表面解耦讓"換大腦"成本幾乎為 0

**事實**：`cumora` CLI 是一個薄薄的 shim——它把 argv POST 到 `/runtime/cli`，transport（SSE + `/runtime/cli`）與 brain / host 無關。

**結論**：把"做世界動作"（reply / dm / memory / workspace / card）和"推理"（brain）解耦，是工程上的關鍵勝利——換大腦、換宿主都不需要重新實現 I/O。

### 觀點 4：多 Agent 協調靠"7 層工程防線" + triage gate，不是靠 prompt

**事實**：Cumora 的協調有 7 層防線（model pin / 並發信號量 / 確定性 pacing / AdaptivePacer / wake debounce / rate-limit cooldown / freshness preflight）+ small-brain triage gate。

**結論**：**永遠不要在應該用程式碼機制的地方加 prompt 規則。** 協調是 N 個獨立引擎在同一個房間裡做決定的系統問題，prompt 是軟機制，天花板很低；程式碼是硬機制，可以工程化、可驗證。Cumora 用 17 分鐘裡 130 個 rate-limit hit 這種**真實事故資料**推動每一層防線的誕生。

### 觀點 5：freshness gate + atomic claim 是防 race collision 的核心

**事實**：`cumora reply` 在 INSERT 前查 seen-cursor baseline（Redis，10 分鐘 TTL），如果有更新就回傳 HELD envelope（exit code 2）讓 Agent 重新看新訊息再決定；`Computer` 上的工作認領是原子的。

**結論**：**可序列化是協作的根本。** 不是讓 Agent 都做對（這做不到），而是讓錯的 Agent 在錯誤發生時能 HELD 重新決策。這是分散式系統思想在 Agent 協作裡的直接應用。

### 觀點 6：Wake debounce + 同回合 steering 解決了"突發 vs 延遲"的矛盾

**事實**：`WAKE_DEBOUNCE_MS=2500` 把突發合併成單次 turn；同時 mid-turn 的 DM/@mention 直接 inject 到 LIVE 會話，group activity 用單條 content-free 提示。

**結論**：協調既不能"每條訊息一個 turn"（浪費、race），也不能"等 batch 處理"（延遲、人感受不到）。Cumora 的兩層逃生——直接 ping steering + coalesced rerun——是這套機制的關鍵設計。

### 觀點 7：BYOA 是"使用者擁有 provider key"的產品級實現

**事實**：BYOA daemon 在使用者機器上跑，用使用者本機的 Claude Code / Codex / Grok / Cursor Agent CLI；伺服器**永遠**不接觸 provider key。

**結論**：在大模型時代，"你的 API key 還是我的 API key"是個產品級分水嶺——BYOA 不是技術選擇，是信任結構選擇。Cumora 把這條原則變成了一等公民產品形態（Computer / BYOA / Managed 三種狀態在同一 UI 顯現）。

### 觀點 8：CI 守衛是"工程不變量"的唯一可執行載體

**事實**：`guard:big-brain` 和 `guard:llm-tracked` 是 CI 腳本，強制"只允許 agent turn 調大模型"和"每次 LLM 呼叫必須入帳"。

**結論**：**"大模型只用於推理、小模型用於工具"和"成本必須可追溯"是原則——但原則不強制等於沒原則。** Cumora 用 CI 把原則變成可執行的不變量。

### 觀點 9：Feature Lifecycle 是"人和 Agent 共享的開發協議"

**事實**：8 階段（Draft → Contract → Building → Verifying → Ready → Releasing → Watching → Learned）+ 每個階段都有 evidence square + 獨立 verifier + production 24h readback。

**結論**：**"釋出"不是 PR 狀態，是 evidence-backed 的工作流。** Cumora 讓 Agent 也用 `cumora ship ...` CLI 建立 / 驗證 / 上線 feature——這不只是工具整合，這是**工作流同源**——人和 Agent 在同一個協議裡協作。

### 觀點 10：i18n 是"漸進本地化"，不是"必須完整才上線"

**事實**：每個 locale 都用 TS 型別對照 `en.ts`，翻譯錯的 key（拼錯 / 捏造）會 `tsc` 失敗；沒翻譯的 key 自動 fallback 到英文——partial 是常態。

**結論**：i18n 不應該是"全部翻譯完才能上"的瀑布模型。Cumora 的做法是：**`en` 是 source of truth，其它 locale 型別對照它**——少翻譯不會崩潰 UI，錯翻譯會編譯失敗。這種"型別驅動的漸進 i18n"是最優雅的方案。

### 觀點 11：解耦 + 協調 + 透明 = 可信任的 Agent 系統

**事實**：I/O 與 brain 解耦 + 7 層協調防線 + `llm_calls` 成本帳本 + CI 強制 guard。

**結論**：**使用者信任 Agent 系統的三個條件：可控（能換大腦）、可靠（不打架）、可審計（成本透明）。** Cumora 同時滿足這三條，是工程上少見的"完整的 Agent 系統"。

### 觀點 12：open-source + multi-platform 是"非顯然正確"的產品形態

**事實**：MIT 協議、5 個 shell（PWA / Electron / iOS / Android / admin）、同套 React 元件、嚴格 CI 守衛、production-ready 的 i18n、production 24h readback。

**結論**：在 2026 年，"AI 協作平臺"作為一個產品類目，**最容易被巨頭碾壓的弱點是 vendor lock-in**——Cumora 用 MIT + 多端 + CI 守衛把這變成護城河。

### 觀點 13：本地 CLI + 遠端 protocol 是 Agent 工具鏈的標準形態

**事實**：BYOA daemon 把本地 Claude Code / Codex / Grok / Cursor 當 brain；managed 走 OpenAI Responses API；兩者透過同一個 `cumora` CLI + SSE + `/runtime/cli` 協議與世界互動。

**結論**：**"本地 CLI + 遠端協議"是 Agent 工具鏈正在變成的事實標準。** Claude Code / Codex / Cursor 都已經是 CLI-first；Cumora 把這條規律抽象成產品級實現。

---

## 五、設計哲學

Cumora 的設計哲學可以從它的程式碼、文件、CI 守衛、貢獻指南裡讀出來——它不是寫在某處的標語，而是**滲透在每個工程決定裡的判斷**。我把它壓成 7 條：

### 哲學 1：Agent 是隊友，不是聊天機器人

> *"Agents don't just answer when poked: they hold personas and memory, claim work, coordinate with each other without colliding, send and receive real email."*
> —— Cumora README

這不是產品話術，是工程判斷——Cumora 的所有設計都圍繞這條原則展開：

- 同一個 Roster、DM、群聊、Kanban、日曆
- 持久 persona 和 memory
- 主動 wake、claim work、跨 Agent 協調
- 真實 email（不是"通知系統"——是 SMTP）

### 哲學 2：Computer 是一等公民——腦與宿主解耦

> *"Rather than bolt BYOA on as a special case, Computer is a first-class product concept that every agent shares: an agent always runs on some Computer."*
> —— docs/BYOA.md

這條哲學的反面是"BYOA 是 Managed 的特例"——Cumora 的做法是把它抽象成 Computer：所有 Agent 都跑在某個 Computer 上（Cumora Cloud 是其中一個），同一套 UI、同一套狀態機、同一套協調邏輯。

### 哲學 3：I/O 表面與 Brain 解耦——讓"換大腦"零成本

> *"Cumora's I/O surface is fully decoupled from the brain. The same `cumora` CLI an agent uses for every world action is a thin shim that POSTs argv to `/runtime/cli`."*
> —— docs/BYOA.md

這是工程上的關鍵判斷——把"做什麼"（reply、DM、memory、workspace、card）和"怎麼想"（用哪個 LLM、跑在哪臺機器）解耦，讓後者可以任意切換。

### 哲學 4：協調靠工程防線，不靠 prompt

> *"Never add a prompt rule when a code mechanism is the right fix, and never add a code mechanism when the brain's making a clear decision in front of correct state."*
> —— docs/COORDINATION.md

這是 Cumora 協調哲學的核心——prompt 是軟機制，天花板很低；協調是分散式系統問題，應該用分散式系統的答案（並行控制、可序列化、防抖、自適應 backoff、原子認領）。Cumora 用 7 層防線把這條原則變成可驗證的工程實現。

### 哲學 5：成本透明是原則，CI 強制是手段

> *"Only agent turns may use the big model... the expensive model is reserved for the actual agent reasoning turn."*
> —— CONTRIBUTING.md

> *"Every LLM call must be tracked in the cost ledger. Untracked spend is a correctness bug here, not just an oversight."*
> —— CONTRIBUTING.md

這兩條不是建議，是 CI 守衛——`guard:big-brain` 和 `guard:llm-tracked` 會 fail 你的 build。**原則不強制等於沒原則。**

### 哲學 6：人和 Agent 共用同一個開發協議

> *"Cumora treats shipping as a shared, evidence-backed workflow instead of a pull request status. Humans and agents use the same feature contract, verification squares, releases, production readbacks, friction inbox, and regression assets."*
> —— docs/SHIPPING.md

這是 Cumora 最深層的哲學——**人和 Agent 不是兩類開發者，是同一個工作流的不同角色。** 8 階段 lifecycle + evidence squares + 獨立 verifier + 24h readback 是這套哲學的載體。

### 哲學 7：失敗要"read back"，不是"push and forget"

> *"The release contract is complete only after production behavior has been read back against its baseline. A green build or successful rollout is an intermediate signal, not the terminal state."*
> —— docs/SHIPPING.md

這條哲學反的是"上線即結束"的工程文化——Cumora 把生產環境 24 小時後的 readback 當成釋出契約的一部分，failed readback 直接把 feature 打回 Building 狀態。

---

## 六、總結：Cumora 給 AI Agent 工程化的啟示

Cumora 用 5 個 shell + 2 套部署路徑 + 7 層協調防線 + 1 個 feature lifecycle + 2 個 CI 守衛 + 1 個 `llm_calls` 成本帳本，把"AI Agent 作為團隊一等公民"從一個產品願景變成了**可執行、可驗證、可審計、可開源**的工程系統。

它給 AI Agent 工程化的啟示可以壓成 5 條：

1. **Agent 是一等公民**——同一個 Roster、DM、群聊、Kanban、日曆；持久 persona 和 memory；主動 wake、claim work、跨 Agent 協調；真實 email。
2. **大腦與宿主解耦**——Computer 是一等公民產品概念；`cumora` CLI 是統一的 I/O 表面；BYOA 和 Managed 走同一套協議。
3. **協調是工程問題，不是 prompt 問題**——7 層防線 + triage gate 比 100 行 prompt 更可靠；freshness gate + atomic claim 是分散式系統思想在 Agent 協作裡的應用。
4. **CI 強制工程不變量**——`guard:big-brain` + `guard:llm-tracked` 把"成本可控、可追溯"從口號變成可執行的不變量。
5. **人和 Agent 共用同一個工作流**——8 階段 feature lifecycle + 獨立 verifier + 24h readback 是"AI 隊友"的產品級實現。

如果你正在設計自己的 Agent 系統，Cumora 給出的答案不是"用哪個框架"——而是**"用什麼產品形態"。** 把 Agent 當成隊友，把 Computer 當成一等公民，把協調變成工程防線，把成本變成 CI 守衛——這就是 Cumora 給出的工程化答案。

---

## 參考資料

- **GitHub 倉庫**：[yetone/cumora](https://github.com/yetone/cumora)
- **產品官網**：[cumora.ai](https://cumora.ai)
- **Web App**：[app.cumora.ai](https://app.cumora.ai)
- **官方文件**：
  - [README.md](https://github.com/yetone/cumora/blob/main/README.md)
  - [docs/BYOA.md](https://github.com/yetone/cumora/blob/main/docs/BYOA.md)
  - [docs/COORDINATION.md](https://github.com/yetone/cumora/blob/main/docs/COORDINATION.md)
  - [docs/SHIPPING.md](https://github.com/yetone/cumora/blob/main/docs/SHIPPING.md)
  - [docs/email.md](https://github.com/yetone/cumora/blob/main/docs/email.md)
  - [docs/I18N.md](https://github.com/yetone/cumora/blob/main/docs/I18N.md)
  - [CONTRIBUTING.md](https://github.com/yetone/cumora/blob/main/CONTRIBUTING.md)
  - [SECURITY.md](https://github.com/yetone/cumora/blob/main/SECURITY.md)
- **關鍵不變量**：CI 守衛 `guard:big-brain`、`guard:llm-tracked`
- **架構核心**：React 18 + Vite + TS + Tailwind / Express + ws + Postgres (Drizzle) + Redis / K8s Agent Pods / Go FUSE / Cloudflare Workers (email-gate + r2-gate) / Resend / APNs / FCM / Capacitor / Electron