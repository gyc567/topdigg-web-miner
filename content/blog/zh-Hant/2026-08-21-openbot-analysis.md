---
title: "OpenBot 深度解析：給每個 AI Agent 一台自己的電腦"
date: "2026-08-21"
description: "深度解析 CopilotKit/OpenBot：AI Agent 平台，每個 Bot 擁有獨立電腦，真實瀏覽器加檔案系統加工具，所有操作先審批再執行並記錄。核心思想：可信賴的 AI Agent 同事。支援任意 AG-UI Agent 接入，完整審計日誌，Docker 一鍵部署。"
tags:
  - OpenBot
  - CopilotKit
  - AI Agent
  - AG-UI
  - Agent Platform
  - LangGraph
  - CrewAI
  - 自主權
  - 安全治理
  - MCP
categories:
  - 深度解析
  - AI Agent
  - 開源項目
---

# OpenBot 深度解析：給每個 AI Agent 一台自己的電腦

> 核心思想：**"AI coworkers you can hand real work to, and actually trust with the access"**——OpenBot 的創辦人認為，當前 AI Agent 缺少的不是「能力」，而是「可信賴的操作邊界」。一個 Agent 可以驅動真實瀏覽器、讀寫檔案、調用 MCP 服務，但它在做什麼、為什麼做、你能不能隨時接管——這些才是決定 Agent 能否真正成為你同事的關鍵。OpenBot 的答案是：**給每個 Agent 一台自己的電腦，配一個只看不管的網關，加上完整的操作記錄。**

## 一、專案背景與核心定位

CopilotKit 團隊在 AI Agent 領域有兩個廣為人知的產品：**Copilotkit**（前端 Agent 整合框架）和 **Copilot Runtime**。OpenBot 是他們在這個方向上的最新探索——一個**開源的 AI Agent 平台**，目標是讓 AI Agent 從「能調用工具」進化到「可以放心授權」。

當前大多數 Agent 產品的核心矛盾是：

- 你想讓它做真事（登入網站、讀寫檔案、調用外部服務）
- 但做真事意味著有風險（它會不會誤操作？會不會資料洩漏？）

OpenBot 的解法不是限制 Agent 的能力，而是**重構授權模型**：不是問「Agent 能做什麼」，而是問「誰在什麼情況下批准了什麼事，做了之後有記錄嗎」。

### 專案元資訊

| 欄位 | 值 |
|------|-----|
| 倉庫 | https://github.com/CopilotKit/openbot |
| 狀態 | Alpha（活躍開發中）|
| License | MIT |
| 語言 | TypeScript/React + Bun + Hono |
| 部署 | Docker Compose / 單容器 Docker |
| 資料庫 | PostgreSQL + pgvector |
| Agent 協議 | AG-UI（開放協議）|
| 依賴 | CopilotKit Intelligence（執行緒與記憶）|

### 一句話定位

OpenBot 是一個**本地優先、可審計、帶治理的 AI Agent 協作平台**：每個 Bot 有自己的獨立電腦（容器+瀏覽器+檔案系統），所有操作經過 CEL 策略網關審批，記錄完整審計日誌，使用戶隨時可接管。

## 二、核心思想：從「能做什麼」到「憑什麼做」

### 2.1 傳統 Agent 的信任困境

當前主流 Agent 產品（Claude Code、Cursor Agent、OpenAI Operator）的共性問題是：**Agent 執行操作和使用者感知操作之間存在巨大的資訊不對稱。**

使用者只知道「我讓 Agent 做了 X」，但不知道：

- Agent 呼叫的具體工具是什麼
- 工具的參數和目標是什麼
- 操作結果是否符合預期
- 是否有危險操作被悄悄拒絕

OpenBot 的核心判斷是：**信任不是靠限制能力建立的，而是靠透明性和可控性建立的。** 你不是透過告訴 Agent「你不能做什麼」來保護自己，而是透過**讓每個操作都經過審批網關、留下記錄，並隨時可以接管**來建立真正的信任。

### 2.2 「先審批再執行」的治理模型

OpenBot 的設計哲學核心是**Gateway（網關）作為唯一入口**：

```
使用者操作 → 伺服器網關 → 策略檢查 → 審計日誌 → 允許/拒絕 → Bot 電腦執行
```

這個流程的關鍵是：**永遠沒有不經過記錄的行動**。每個操作都是：

1. **resolve** - 從伺服器持有的快照解析目標
2. **evaluate** - 根據 CEL 策略評估是否允許
3. **audit** - 寫入審計行，記錄決定和原因
4. **act** - 僅在允許時才真正執行

### 2.3 每個 Bot 自己的電腦

OpenBot 最獨特的理念是**每個 Bot 擁有獨立的電腦**：

- 獨立的 Chromium 瀏覽器（自己的登入狀態）
- 獨立的 `/workspace` 檔案系統卷
- 獨立的瀏覽器 Profile
- 可選 gVisor 沙箱隔離

這意味著 Agent 之間的資料完全隔離，一個 Agent 洩露不等於所有 Agent 洩露。

## 三、專案說明：架構與元件

### 3.1 服務架構圖

OpenBot 由多個協同服務組成，透過 Docker Compose 編排：

```
┌─────────────────────────────────────────────────────┐
│                     React/Vite UI                   │
│                    (app :3010)                      │
└──────────────────────┬──────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────┐
│              Hono API Server (server :3001)          │
│  Auth / Policy / Audit / Credentials / Plugins       │
│  Components / Coworkers / Channels                   │
│  CopilotKit Runtime                                  │
└──────┬────────────────┬──────────────────┬───────────┘
       │                │                  │
┌──────▼──────┐  ┌──────▼──────┐  ┌────────▼────────┐
│agent-computer│  │ agent-bot   │  │agent-langgraph  │
│  (:4100)    │  │  (:4200)    │  │    (:4201)      │
│ Chromium    │  │ PoC AG-UI   │  │  LangGraph Bot  │
│ + workspace │  │  Bot        │  │                 │
└─────────────┘  └─────────────┘  └──────────────────┘
                       │
              ┌────────▼────────┐
              │   Supervisor    │
              │ (:4500 host /   │
              │  :4300 container)│
              │ 每個Bot獨立容器  │
              └─────────────────┘
                       │
              ┌────────▼────────┐
              │   PostgreSQL    │
              │ + pgvector (:5432)│
              │ 資料/審計/策略   │
              └─────────────────┘
```

### 3.2 核心元件詳解

#### Gateway（策略網關）

Gateway 是 OpenBot 安全模型的核心。它是 Bot 所有操作的唯一入口：

- 解析操作目標（URL、檔案路徑、MCP 呼叫）
- 根據 CEL 策略評估是否允許
- 寫入審計行
- 允許後呼叫 Bot 電腦執行

關鍵設計：**沒有路徑可以繞過網關直接操作。** 即使是低級別的 token 保護服務端口，也不能用於繞過網關。

#### Supervisor（監管者）

Supervisor 負責為每個 Bot 創建和管理獨立的電腦容器：

- 每個 Bot 一個 Docker 容器
- 每個容器獨立的 workspace 卷
- 每個容器獨立的瀏覽器 Profile
- 支援 gVisor（`runsc`）隔離執行環境

#### Agent Computer（Agent 電腦）

Agent Computer 是 Bot 操作真實瀏覽器的元件：

- 真實 Chromium 瀏覽器（可操控任何網站）
- 檔案系統工具（讀寫 Bot 的 workspace）
- Shell 執行（透過同一網關審批）
- 螢幕截圖與 DOM 快照

#### Bot Endpoints（Bot 端點）

OpenBot 支援兩種 Bot：

1. **內建 Bot**（built-in）：設定系統提示詞即可創建
2. **遠端 AG-UI Bot**（remote-ag-ui）：接入任意 AG-UI 協議端點

支援框架：LangGraph、Mastra、CrewAI、Pydantic AI、Google ADK，或手寫 AG-UI 端點。

### 3.3 三大內建同事

OpenBot 範例包內建三個 Bot（設定而非程式碼）：

| Bot | 定位 | 能力 |
|-----|------|------|
| **General Assistant** | 日常助手 | 瀏覽器操作、檔案處理、資訊查詢 |
| **Knowledge** | 企業知識庫 | 連接 Google Drive/OneDrive 知識源 |
| **Risk Analyst** | 風控合規 | 審查操作風險、出具合規意見 |

## 四、詳細教學：從零搭建 OpenBot

### 4.1 前置要求

- **Docker** + Docker Compose（用於 PostgreSQL 和 Bot 服務）
- **Bun 1.3+**（用於 App 和 API 服務）
- **CopilotKit Intelligence 專案和授權**（有免費方案，可自托管）
- **模型 API Key**（OpenAI / Anthropic / Google）

### 4.2 快速開始（5步完成）

**Step 1：複製環境變數**

```bash
cp .env.example .env
```

**Step 2：取得 CopilotKit Intelligence 憑證**

```bash
npx --yes copilotkit@latest login
npx --yes copilotkit@latest project select
npx --yes copilotkit@latest license --write
```

- `license --write` 會將 `COPILOTKIT_LICENSE_TOKEN` 寫入 `.env`
- `project select` 輸出的 `cpk-...` runtime key 設為 `INTELLIGENCE_API_KEY`

**Step 3：填寫剩餘設定**

```bash
# 必須填寫的
OPENAI_API_KEY=sk-...

# 產生加密金鑰（本地開發用）
openssl rand -base64 32
# 填入 KEY_ENCRYPTION_KEY
```

**Step 4：安裝依賴並啟動**

```bash
bun install
bash scripts/start.sh
```

`start.sh` 啟動流程：
1. Docker Compose 啟動 PostgreSQL、Bot 服務
2. 執行資料庫遷移
3. 啟動 API Server（:3001）
4. 啟動 React App（:3010）
5. 健康檢查確認所有服務就緒

**Step 5：開啟瀏覽器**

存取 http://localhost:3010

### 4.3 快速體驗路徑

啟動後可以立即嘗試以下場景：

**路徑1：直接對話 Bot**
- 存取 `/bot`
- 輸入：`Open news.ycombinator.com and tell me the top story.`
- 觀察 Bot 如何開啟瀏覽器、自主搜尋、匯報結果

**路徑2：審計日誌驗證**
- 讓 Bot 填寫 https://httpbin.org/forms/post
- 存取 `/admin/audit` 查看完整操作記錄
- 看到每一步操作都有時間戳、工具名、目標位址和結果

**路徑3：策略攔截**
- 存取 `/admin/boundaries`
- 新增一條拒絕規則（例如禁止存取某個網域）
- 重試相同操作，觀察 Bot 被拒絕並顯示規則名稱

**路徑4：創建自訂同事**
- 存取 `/agents`
- 創建新 Bot：填寫名稱、職位、角色描述
- 選擇 AG-UI 端點或內建模式
- 啟動專屬頻道

### 4.4 Docker 單容器部署（生產推薦）

```bash
# 建構映像檔
docker build -t openbot .

# 啟動（內建 PostgreSQL）
docker run -p 3001:3001 --env-file .env \
  -e EMBEDDED_POSTGRES=on \
  -v openbot-data:/var/lib/postgresql/data \
  openbot

# 或連接外部 PostgreSQL
docker run -p 3001:3001 --env-file .env \
  -e DATABASE_URL="postgresql://user:pass@host:5432/openbot" \
  openbot
```

### 4.5 Google OAuth 認證設定（可選）

本地開發預設使用 `OPENBOT_DEV_NO_AUTH`（跳過登入，所有請求以管理員身份執行）。

設定真實登入：

```bash
# 產生金鑰
openssl rand -base64 32

# .env 中設定
BETTER_AUTH_URL=http://localhost:3001
BETTER_AUTH_SECRET=<上面產生的金鑰（至少32字元）>
GOOGLE_OAUTH_CLIENT_ID=<你的Google OAuth Client ID>
GOOGLE_OAUTH_CLIENT_SECRET=<你的Google OAuth Client Secret>

# 信任來源（本地開發）
TRUSTED_ORIGINS=http://localhost:3010

# 初始管理員郵箱
INITIAL_ADMIN_EMAILS=your@email.com

# 刪除 OPENBOT_DEV_NO_AUTH
```

## 五、CEL 策略引擎詳解

### 5.1 策略規則格式

策略以 JSON 格式儲存在 `AGENT_COMPUTER_POLICY` 環境變數或管理員儲存的設定中：

```json
{
  "deny": [
    {
      "description": "阻止存取雲元資料位址",
      "expression": "page.host.matches('.*\\.google\\.com.*')"
    }
  ],
  "allow": [
    {
      "description": "允許瀏覽和搜尋",
      "expression": "tool.name in ['browser.navigate', 'browser.search']"
    }
  ]
}
```

### 5.2 可檢查的欄位

CEL 規則可以檢查以下欄位：

| 欄位類型 | 可用欄位 |
|---------|---------|
| 工具 | `tool.name` |
| 意圖 | `intent` |
| Bot | `bot.id` |
| 使用者 | `actor.id` |
| 頁面 | `page.url`, `page.host` |
| 元素 | `element.ref`, `element.role`, `element.name`, `element.type` |
| 鍵盤 | `key` |
| 檔案 | `file.path`, `file.name`, `file.extension` |
| MCP | `mcp.server`, `mcp.tool`, `mcp.effect` |

### 5.3 Fail-Closed 原則

OpenBot 的策略引擎**嚴格遵循 fail-closed 原則**：

- 拒絕規則先於允許規則評估
- **沒有設定策略 = 禁止一切**
- 損壞的拒絕規則 = 拒絕
- 損壞的允許規則 = 不允許

這意味著預設狀態下，Bot 什麼都做不了，直到管理員明確設定了允許規則。

### 5.4 策略管理介面

管理員可以透過 `/admin/boundaries` 介面：

- 查看目前策略
- 新增/編輯/刪除規則
- 選擇預設策略範本
- 查看規則生效後的攔截效果

## 六、關鍵功能深度解析

### 6.1 「接管方向盤」機制

當 Bot 遇到以下情況時，會請求人工協助：

- 登入牆（需要輸入憑據）
- 2FA 提示
- 不確定的危險操作

控制權交接被記錄為三個審計事件：

- `computer.help_requested` - Bot 請求協助
- `computer.control_taken` - 使用者接管控制
- `computer.control_released` - 使用者釋放控制

**關鍵設計**：使用者接管期間，Bot 的所有操作請求被**直接拒絕**，而不是排隊等待。這確保了使用者始終有最終決定權。

### 6.2 憑證金庫

敏感憑據（API Key、OAuth Token、資料庫密碼）不應出現在對話記錄中。

OpenBot 的解決方案：

- 透過 `/admin/credentials` 介面儲存加密憑據
- 憑據以加密形式儲存，**永遠不在 API 回應中返回**
- 審計日誌只記錄「憑據被請求」和「請求時長」，不記錄憑據內容

### 6.3 MCP 治理

OpenBot 整合了 MCP（Model Context Protocol）支援，並內建治理層：

**內建 MCP 整合**：

- Atlassian（Jira、Confluence）
- Box
- Slack
- Salesforce
- ServiceNow

**治理規則**：

- 自訂 MCP 伺服器必須透過 URL 檢查
- 無法明確分類為「讀」的工具，**預設視為寫操作**
- 每個 MCP 呼叫都經過 grant 檢查和策略評估

### 6.4 React 元件作為工具

與大多數 Agent 用純文字回覆不同，OpenBot 的 Bot 可以返回 **React 元件**：

- 編譯後的元件存放在 `app/src/components/gallery/`
- 沙箱元件在 `/admin/playground` 中創作並發布
- 每次元件呼叫都經過伺服器驗證（存在？已發布？允許該 Bot 使用？）
- 內建資料函數：`botActivity`（Bot 活動）和 `recentRefusals`（最近拒絕）

### 6.5 持久執行緒與記憶

OpenBot 透過 CopilotKit Intelligence 實現：

- 對話在服務重啟後保留（不丟失上下文）
- 每個部署的執行緒有獨立識別（`DEPLOYMENT_ID`）
- 支援跨工作階段記憶復用

## 七、設計哲學：六大核心原則

### 7.1 先記錄再執行（Record Before Act）

這是 OpenBot 最重要的設計原則：**沒有任何操作可以在審計日誌寫入之前執行。** 即使最終允許了操作，審計行也必須在行動之前寫入。這確保了即使系統被攻破，攻擊行為也會被記錄。

### 7.2 失敗即關閉（Fail Closed）

CEL 策略引擎的 fail-closed 行為意味著：

- 預設狀態是最安全的
- 安全漏洞來自設定錯誤，而不是設計缺陷
- 管理員必須明確授予每個權限

### 7.3 隔離而非限制（Isolate, Don't Restrict）

每個 Bot 有獨立容器、獨立瀏覽器 Profile、獨立 workspace——**隔離是預設**，而不是透過限制來實現安全。這直接對應了攀岩安全帶的邏輯：安全來自把墜落和你隔開，而不是不讓你爬高。

### 7.4 透明性即信任（Transparency is Trust）

OpenBot 不透過隱藏功能來建立信任，而是透過**完整透明**：

- 每個操作都有記錄
- 每個拒絕都有原因
- 使用者隨時可以接管
- 憑據從不進入對話記錄

### 7.5 協議而非平台（Protocol, Not Platform）

OpenBot 基於 AG-UI 協議構建，不綁定任何特定框架。這確保了：

- LangGraph、Mastra、CrewAI、Pydantic AI 可以無縫接入
- 治理邏輯隨協議走，不隨框架走
- 使用者不被鎖定在 CopilotKit 生態內

### 7.6 本地優先（Local-First）

OpenBot 設計為在**你自己的基礎設施**上執行：

- 資料在 PostgreSQL（你控制的資料庫）
- 模型由你選擇（你提供的 API Key）
- 瀏覽器綁定在 loopback（本地）
- 無需將敏感資料傳送到第三方服務

## 八、觀點總結與啟示

### 觀點 1：Agent 的下一個進化方向是「可審計性」，而非「能力」

當前 AI Agent 的軍備競賽集中在「能做什麼」——更多工具、更強推理、更長上下文。OpenBot 指出一個被忽視的方向：**可審計性**。當 Agent 能做的事情越來越多，信任問題的根源不是「能力太強」，而是「邊界不清」。下一個進化的焦點將是讓每個操作都可追溯、可干預、可解釋。

### 觀點 2：「先審批再執行」是企業級 Agent 的必經之路

對於企業場景，AI Agent 必須滿足合規要求（SOX、GDPR、SEC）。實現合規的技術路徑不是「限制 Agent 能力」，而是**在每次操作前建立決策點**。OpenBot 的 CEL 策略引擎 + 審計日誌是這個方向的技術實現參考。

### 觀點 3：隔離架構比權限系統更根本

傳統安全思維是 RBAC（基於角色的存取控制）：給 Agent 分配角色，角色決定權限。這在 Agent 場景下不夠用，因為 Agent 的行為是動態的、上下文相關的。OpenBot 的「每 Bot 獨立容器」架構提供了更根本的隔離——即使一個 Bot 被攻破，攻擊面也被限制在其獨立容器內。

### 觀點 4：憑證管理是 Agent 平台的基礎設施，不是功能

大多數 Agent 產品把「憑證管理」當作附加功能。OpenBot 將其作為一等公民：憑證金庫、加密儲存、永不返回 API、審計記錄但不記錄內容。這是 Agent 從「實驗玩具」到「生產系統」的基礎設施跨越。

### 觀點 5：AG-UI 協議的價值在於「治理跟協議走」

OpenBot 選擇 AG-UI 而非自建協議，核心邏輯是：**治理規則應該跟協議走，而不是跟框架走。** 如果治理邏輯嵌入在 LangGraph 或 CrewAI 裡，每當換框架就要重新實現治理。AG-UI 作為開放協議，提供了跨框架統一治理的可能性。

### 觀點 6：「人在回路」不是降低效率，而是提高信任度

有人質疑「使用者隨時接管」會降低 Agent 效率。OpenBot 的設計實踐表明：**信任建立後，使用者干預的頻率會大幅降低。** 真正降低效率的是「不知道 Agent 在做什麼所以不敢放手」。透明性和可控性是提高信任、減少干預的根本。

### 觀點 7：開源 Agent 平台正在縮小與商業產品的差距

CopilotKit 團隊將 OpenBot 完全開源（MIT），包括架構圖（可用 `bun run diagram` 重新產生）、策略引擎、MCP 治理。這標誌著開源社群在 AI Agent 基礎設施層面的成熟度正在快速追趕商業產品。

## 九、技術規格速覽

| 維度 | 規格 |
|------|------|
| 部署形態 | Docker Compose / 單容器 Docker |
| 資料庫 | PostgreSQL + pgvector |
| App 端口 | 3010 |
| API 端口 | 3001 |
| Bot 瀏覽器端口 | 4100 |
| Bot 端點端口 | 4200/4201 |
| 監管者端口 | 4500（主機）/ 4300（容器內）|
| 策略引擎 | CEL 表達式 + fail-closed |
| 隔離執行環境 | gVisor（可選）|
| 憑證加密 | AES-256，金鑰來自 KEY_ENCRYPTION_KEY |
| Agent 協議 | AG-UI |
| 支援框架 | LangGraph、Mastra、CrewAI、Pydantic AI、Google ADK |
| 內建 MCP | Atlassian、Box、Slack、Salesforce、ServiceNow |

## 十、結語

OpenBot 的核心貢獻不在於「又一個 Agent 框架」，而在於**重新定義了 Agent 的信任模型**。

大多數 Agent 產品試圖透過限制能力來建立信任（「這個 Agent 只能做這些事」）。OpenBot 的路徑是：**不限制能力，但讓每個行動都透明、可審計、可干預。** 信任不是透過「做更少的事」來建立的，而是透過「做每一件事都有記錄」來建立的。

它還帶來了一個更根本的提醒：**AI Agent 的問題不只是「模型夠不夠強」，還有「Agent 在真實環境中的行為邊界是否清晰」**。當 Agent 要操作真實瀏覽器、讀寫真實檔案、呼叫真實服務時，「能力」和「治理」必須同步進化。

OpenBot 目前處於 Alpha 階段（文件明確說「Expect rough edges and bugs」），但它的方向是正確的——它解決的不是 Agent 的能力問題，而是 Agent 的信任問題。這是 AI Agent 從「展示玩具」走向「生產系統」的必經之路。

---

*專案位址：https://github.com/CopilotKit/openbot*
*官網：https://copilotkit.ai/openbot*
*協議：AG-UI（開放協議，https://github.com/ag-ui-protocol/ag-ui）*
