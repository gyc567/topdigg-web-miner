---
title: "Cloudflare OS 深度解析：重新定義 AI 時代的生產力作業系統"
description: "全面解析 Cloudflare OS — Cloudflare 開源的 AI 生產力環境。深度探討其設計哲學、Gadget 沙箱架構、Gatekeeper 安全框架、異步人機協作機制，以及它為何代表了 SaaS 軟體的未來範式。"
date: "2026-08-08"
author: "TopDigg Research Team"
tags: ["Cloudflare OS", "AI生產力", "Cloudflare Workers", "開源", "沙箱安全", "Gatekeeper", "Gadget", "Agent原生", "SaaS替代", "本地優先"]
categories: ["深度解析"]
keywords: ["Cloudflare OS", "AI生產力環境", "Cloudflare開源", "沙箱應用", "Gatekeeper安全", "Gadget", "Agent原生", "SaaS替代方案"]
---

> **Cloudflare OS** 是 Cloudflare 開源的 AI 生產力環境，它重新定義了軟體的分發和使用方式。本全面分析涵蓋項目的架構、設計哲學、實用教程以及 AI 時代的核心洞察。

---

## 1. 專案說明

### 1.1 什麼是 Cloudflare OS?

Cloudflare OS 是一個 AI 生產力環境，最初為 Cloudflare 內部使用而開發。Cloudflare 的大量員工——從工程到銷售——每天都在使用 Cloudflare OS 來幫助他們完成工作。

這不是傳統的電腦作業系統。"作業系統"一詞有兩層含義：

- 一個讓**公司**能夠安全使用 AI 提高生產力的作業系統
- 一個管理 AI 工作負載的作業系統，類似於傳統作業系統管理計算工作負載

Cloudflare OS 提供三個核心能力：

1. **Agent 聊天 UI**：你可以要求 Agent 執行任務，預載入了公司運營知識
2. **沙箱應用開發**：讓 Agent 構建"Gadgets"（小型個人應用），並安全地與他人分享
3. **安全框架（Gatekeepers）**：應用護欄，讓非技術使用者可以安全地"盡情使用"

### 1.2 核心特性

| 特性 | 詳情 |
|------|------|
| **Gadget 沙箱** | 每個應用運行在獨立的 Dynamic Worker 中，預設無網際網路存取 |
| **基於能力的安全** | Agent/Gadget 預設無存取權限；使用者必須明確引入資源 |
| **異步人機協作** | Agent 繼續工作，使用者稍後批次審批 |
| **即時多人協作** | Durable Objects 使即時協作編輯開箱即用 |
| **Agent 友善 API** | 每個 Gadget 自動暴露 Agent 可呼叫的 Cap'n Web RPC API |
| **Blueprint 分享** | 分享應用程式碼作為範本，而非託管服務 |
| **BYOK AI 模型** | 支援多種 LLM 供應商；使用者自行付費 |

### 1.3 關鍵概念

#### Gadgets（小工具）——一種新的軟體思維方式

Cloudflare OS 不僅僅是另一個帶連接器的聊天框。系統圍繞一種新的軟體方式展開——每個使用者運行自己使用的生產力應用的私有副本。

當你在 Cloudflare OS 中建立投影片時，你不是在呼叫執行在雲端的某個 SaaS 軟體。系統會為你建立一個**私有實例**。我們稱之為"Gadget"。這個實例在與其他人的投影片隔離的沙箱中執行。

這有兩個深遠的影響：

1. **安全**：投影片應用不可能有安全漏洞洩露你的資料到攻擊者。Cloudflare OS 沙箱控制對你的應用私有實例的所有存取。
2. **可修改**：如果你想，你可以自由修改程式碼。如果投影片應用缺少你需要的功能，你只需要求你的 Agent 新增它。而且因為第 1 點，這樣做完全安全。

這與過去 25 年的雲端架構和"軟體即服務"有很大不同，但我們認為 AI 改變了方程式。當任何使用者都能透過提示 Agent 新增他們需要的功能時，集中式的軟體模式就不再有意義了。

#### Gatekeepers——基於能力的安全層

Gatekeepers 就像增強版的 MCP 伺服器。

當你將 Agent 或 Gadget 引入外部資源時，會建立一個 Gatekeeper 來管理該存取。Gatekeeper 是特定於每個外部服務的軟體，調節 Gadget 到該服務的連接。它：

- 提供乾淨的 Cap'n Web API 到服務（包裝服務原生提供的任何 API）
- 處理授權（例如透過 OAuth）
- 強制執行僅對使用者意圖的特定資源的窄存取
- 記錄 Gadget（或 Agent）執行的每個操作，供你審查
- 對於任何有副作用的操作，為人類使用者提供批准或拒絕操作的機會（"人在迴圈中"）

**異步人機協作**是 Gatekeeper 的重大創新。傳統的人在迴圈設定要求人類**同步**批准操作。當 Agent 想要做某事時，它必須**停止**並等待批准才能繼續。這很煩人：你給 Agent 一個任務，然後走開去喝杯咖啡，結果回來發現 Agent 在第一步就卡在批准上，毫無進展。結果，人們經常妥協，將 Agent 設定為"自動批准"，或 `--dangerously-skip-permissions`，這顯然是不安全的。

Gatekeeper 提供了更好的方式：當 Agent（或 Gadget）執行需要批准的操作時，Gatekeeper 會在本地**模擬**結果，允許 Agent 繼續並排程更多操作。Gatekeeper 告訴 Agent 操作已完成，如果 Agent 嘗試讀回結果，Gatekeeper 會給它模擬的結果。一旦 Agent 完成，使用者可以批次或逐個批准或拒絕操作，但无论如何，他們可以在方便時做。

#### Blueprints——分享你的程式碼

如果建立了一個對他人有用的 Gadget，但不想分享 Gadget 本身，你可以分享一個 Blueprint，允許其他人建立他們自己的 Gadget 副本。Blueprint 本質上是程式碼的副本。

Blueprint 是對雲端軟體傳統的重大改變。傳統上，如果你想分享一個你建立的 Web 應用，你會將應用託管在你的伺服器上，使用者連接到它。Blueprint 更像行動應用和傳統 PC 應用：每個使用者運行自己的軟體副本。

在 AI 時代，這種改變至關重要。一方面，AI 賦能單個開發者構建比以往更多的東西，但單個開發者仍然難以維護線上服務；這消除了這種需求。另一方面——甚至更重要——允許每個使用者運行自己的軟體副本，使使用者能夠使用 AI *修改*軟體以滿足他們的需求。無需提交功能請求，無需乞求開發者優先處理。最終使用者可以解決自己的問題。

---

## 2. 詳細教程

### 2.1 快速開始：本地執行

使用 Cloudflare OS 最快的方式是本地執行。

**前置條件**：
- 安裝 [pnpm](https://pnpm.io/)

```bash
# 安裝 pnpm（如果尚未安裝）
npm install -g pnpm

# 克隆倉庫
git clone https://github.com/cloudflare/cloudflare-os.git
cd cloudflare-os

# 執行完整堆疊
pnpm run-local
```

然後存取：http://localhost:8787

這使用 `wrangler`（Workers 開發工具 CLI）在本地執行 Cloudflare OS。這不是在生產伺服器上執行 OS 的正確方式，但在本地機器上試用效果很好。

你的資料將儲存在名為 `.wrangler` 的子目錄中。

### 2.2 開發模式

開發時，你希望在兩個終端中執行前端和後端：

```bash
# 終端 1：後端
pnpm dev-server

# 終端 2：前端
pnpm dev-client
```

然後存取：http://localhost:3000

### 2.3 部署到你的 Cloudflare 帳戶

#### 一鍵部署

Cloudflare 提供了線上部署流程：

存取 https://os.cloudflare.app/deploy

#### 進階部署

對於更複雜的部署，包括你的 gatekeepers 和可能的程式碼更改，使用部署啟動倉庫：

存取 https://github.com/cloudflare/cloudflare-os-starter

### 2.4 嘗試這些提示

執行本地後，嘗試這些提示：

- "為我即將與客戶的會議製作投影片。"（使用內建的投影片 blueprint）
- "製作一個協作白板應用。"（從頭開始建立新應用）
- "製作一個井字棋遊戲。" 然後 "我是 X，你是 O。我已經走了第一步。輪到你了。"
- "為這個 GitHub 倉庫製作一個 issue 儀表板。"（附加倉庫；需要配置 GitHub 整合）
- "修復這個 Google 文件中的拼寫錯誤。"（附加文件；需要配置 Google 整合）

### 2.5 配置外部服務

許多 Gatekeeper 需要配置才能連接到第三方服務，包括為每個服務獲取 OAuth 客戶端憑證。

每個 gatekeeper 包含設定說明：

| Gatekeeper | 說明 |
|------------|------|
| `gatekeeper-github` | GitHub API 整合 |
| `gatekeeper-google` | Google API 整合 |
| `gatekeeper-cloudflare` | Cloudflare API 整合 |
| `gatekeeper-notion` | Notion API 整合 |
| `gatekeeper-slack` | Slack API 整合 |
| `gatekeeper-supabase` | Supabase API 整合 |
| `gatekeeper-confluence` | Confluence API 整合 |
| `gatekeeper-email` | Email Workers 整合 |
| `gatekeeper-spotify` | Spotify 整合 |
| `gatekeeper-homeassistant` | Home Assistant 整合 |
| `gatekeeper-zoominfo` | ZoomInfo API 整合 |
| `gatekeeper-mcp` | 通用 MCP 伺服器連接器 |
| `gatekeeper-mcp-portal` | 管理員配置的 MCP 門戶 |
| `gatekeeper-linear` | Linear 整合 |
| `gatekeeper-scheduler` | 排程器整合 |

**Gatekeeper OAuth 回呼 URL**：
```
http://localhost:8787/gatekeeper/<provider>/oauth
```

**GitHub 整合配置範例**：
```bash
# packages/gatekeeper-github/.env
CLIENT_ID=your-client-id-here
CLIENT_SECRET=your-client-secret-here

# 新增到根目錄 .dev.vars 用於登入
AUTH_GATEKEEPERS=cloudflare,google,github
```

### 2.6 認證模式

Cloudflare OS 支援兩種認證模式：

1. **密碼模式**（預設）- 使用者名稱/密碼註冊
2. **Cloudflare Access 模式** - 設定 `VITE_CF_ACCESS_MODE=true`

---

## 3. 核心架構深度解析

### 3.1 作業系統類比

Cloudflare OS 在技術層面上實際上類似於作業系統：

| 傳統 OS | Cloudflare OS |
|---------|---------------|
| 核心 | `packages/workshop-backend` |
| 裝置驅動 | `packages/gatekeeper-*` |
| Shell | `packages/workshop-frontend` |
| 行程 | gadgets |
| 可執行檔案 | blueprints |
| 使用者 | users |
| ACLs | 共享權限 |
| （缺失） | **agents** |

我們的"核心"在 `workshop-backend` 套件中。後端確實做了很多與真實作業系統核心相似的事情：它連接使用者到程式和裝置（Gadgets 和 Gatekeepers），同時透過沙箱應用和強制存取控制來實現安全性。

在類比中，Gatekeepers——連接使用者和 Agent 到外部服務——就像驅動程式——連接使用者和程式到外部裝置。

有一個傳統作業系統今天不真正管理的東西，但 Cloudflare OS 管理：**AI Agent**。如果你仔細想想，這實際上是傳統作業系統中缺失的功能。我們相信 AI Agent 不能簡單地被視為使用者。它們必須對人類使用者負責，同時擁有自己的受限權限。Agent 透過編寫程式碼片段並即時執行來完成工作。這一切的理想安全模型是**基於能力的安全**，而不是存取控制清單。

### 3.2 技術棧

- **執行時**：Cloudflare Workers（Durable Objects、Dynamic Workers、Facets）
- **本地開發**：`workerd`（開源 Workers 執行時）
- **前端**：基於 Vite 的開發伺服器
- **關鍵庫**：
  - [Pi](https://pi.dev/) - LLM 供應商抽象
  - [Monaco Editor](https://microsoft.github.io/monaco-editor/) - 程式碼編輯器
  - [Yjs](https://yjs.dev/) - 即時協作
  - [Cap'n Web RPC](https://github.com/cloudflare/capnweb) - 低樣板程式碼 RPC

### 3.3 專案結構

```
cloudflare-os/
├── packages/
│   ├── workshop-backend/      # 核心核心 - 連接使用者到 gadgets/gatekeepers
│   ├── workshop-frontend/     # Shell UI（聊天、工作區）
│   ├── workshop-shared/       # 前後端共享型別
│   ├── router/                # HTTP 路由
│   │
│   ├── gatekeeper-*/          # 14+ Gatekeeper 套件
│   │   ├── gatekeeper-github/
│   │   ├── gatekeeper-google/
│   │   ├── gatekeeper-cloudflare/
│   │   ├── gatekeeper-notion/
│   │   ├── gatekeeper-slack/
│   │   ├── gatekeeper-supabase/
│   │   ├── gatekeeper-confluence/
│   │   ├── gatekeeper-email/
│   │   ├── gatekeeper-spotify/
│   │   ├── gatekeeper-homeassistant/
│   │   ├── gatekeeper-zoominfo/
│   │   ├── gatekeeper-mcp-portal/
│   │   ├── gatekeeper-mcp/
│   │   └── gatekeeper-scheduler/
│   │
│   ├── gatekeeper-context/    # 共享 Gatekeeper 工具
│   ├── mcp-shared/            # MCP 協定共享程式碼
│   │
│   ├── backend-utils/         # 後端工具
│   ├── config-ui/             # 配置 UI
│   ├── error-reporting/       # 錯誤處理
│   ├── typed-storage/         # 儲存抽象
│   └── integration-tests/     # 測試套件
│
├── docs/                      # 文件
├── plans/                     # 專案計畫
├── scripts/                   # 建構/開發指令碼
└── .github/workflows/         # CI/CD
```

### 3.4 沙箱安全模型

每個 Gadget 運行在安全沙箱中，防止其在未經你明確同意的情況下與網際網路通訊：

- **伺服器端**：在禁用網際網路存取的 Dynamic Worker 中執行。只能透過 Workers Bindings 與你明確指定的特定外部資源通訊。
- **客戶端**：在沙箱 iframe 中執行。只能透過父框架提供的 `postMessage()` 的 Cap'n Web RPC 會話與其伺服器通訊。iframe 被阻止存取網際網路（透過 `Content-Security-Policy` 和 iframe 沙箱設定，瀏覽器允許的最大程度）。

### 3.5 基於能力的存取控制

每個 Agent 和每個 Gadget 預設無任何存取權限。即使你已配置 Gadget Workshop 存取外部帳戶，Agent 和 Gadget **不會**自動獲得使用它們的權限。

相反，你必須**引入**每個 Agent（或 Gadget）到你希望它存取的任何特定資源。例如，你可以透過貼上連結或點擊"新增資源"並選擇它來引入 GitHub 倉庫。Agent 也可以請求引入它認為需要的資源，然後你可以提供或拒絕。

這與大多數 Agent 框架不同，在那些框架中，MCP 伺服器是預先配置的，使所有服務的廣泛存取在每次聊天中都對 Agent 可用。基於能力的引入將每個 Agent 限制為僅其實際需要的存取。

---

## 4. 歸納總結：核心觀點與洞察

### 4.1 SaaS 模式的終結：從託管到本地副本

Cloudflare OS 代表了軟體分發模式的根本轉變：

**傳統模式**：你建立一個 Web 應用，託管在你的伺服器上，使用者連接到它。

**新模式**：你分享程式碼（Blueprint），每個使用者運行自己的副本。

這種轉變的原因：

1. **AI 賦能個人**：AI 讓單個開發者能夠構建比以往更多的東西
2. **維護負擔**：單個開發者仍然難以維護線上服務
3. **定制需求**：使用者可以用 AI 修改自己的軟體副本
4. **無需請求**：無需提交功能請求，使用者可以自己解決問題

**啟示**：未來的軟體可能是"程式碼即服務"，而非"軟體即服務"。

### 4.2 基於能力的安全：超越存取控制清單

傳統的存取控制清單（ACLs）為使用者/角色分配固定權限。基於能力的安全為每次操作分配最小權限。

**傳統 ACLs**：
```yaml
user: admin
permissions:
  - read
  - write
  - delete
```

**基於能力的安全**：
```yaml
agent: code-reviewer
task: review-pr-123
capabilities:
  - read:repo/my-project
  - read:pr/123
  # 沒有 write、delete 等其他權限
```

**啟示**：在 AI Agent 時代，基於能力的安全比 ACLs 更合適，因為：
- Agent 執行的任務是動態的
- 權限應該隨任務變化
- 最小權限原則更易實施

### 4.3 異步人機協作：解決 Agent 卡頓問題

傳統的人在迴路（Human-in-the-Loop）設定要求同步批准，導致 Agent 經常卡住。

**傳統方式**：
``� Agent 嘗試操作 → 等待使用者批准 → 使用者去喝咖啡 → Agent 卡住 → 使用者回來批准 → Agent 繼續
```

**Cloudflare OS 方式**：
```
Agent 嘗試操作 → Gatekeeper 模擬結果 → Agent 繼續 → 使用者稍後批次批准
```

**優勢**：
- Agent 不會卡住
- 使用者可以在方便時批次處理
- 減少"自動批准"的誘惑
- 保持安全性的同時提高效率

**啟示**：異步人機協作是 AI 工具的必要特性。

### 4.4 作業系統類比：AI 時代的平台思維

將 Cloudflare OS 類比為作業系統不僅僅是行銷：

| 組件 | 功能 |
|------|------|
| **核心** | 管理資源、行程、安全 |
| **驅動程式** | 連接外部裝置/服務 |
| **Shell** | 使用者介面 |
| **行程** | 執行中的應用 |
| **Agent** | 新型"行程"，具有受限權限 |

傳統作業系統管理計算資源。Cloudflare OS 管理 AI 工作負載。

**啟示**：AI Agent 需要作業系統級別的管理，而非簡單的使用者級權限。

### 4.5 開源的戰略價值

Cloudflare 選擇開源 Cloudflare OS 的原因：

1. **生態構建**：鼓勵社群建立新的 Gatekeepers 和 Blueprints
2. **標準化**：推動 AI 生產力工具的標準化
3. **信任建立**：開源程式碼增加透明度和信任
4. **反饋迴圈**：社群使用反饋幫助改進產品
5. **人才吸引**：開源專案吸引優秀開發者

**啟示**：開源是 AI 工具構建生態的有效策略。

---

## 5. 與傳統方案的對比

### 5.1 Cloudflare OS vs 傳統 SaaS

| 維度 | 傳統 SaaS | Cloudflare OS |
|------|-----------|---------------|
| **資料儲存** | 供應商伺服器 | 你的 Cloudflare 帳戶 |
| **程式碼控制** | 供應商控制 | 你控制 |
| **定制能力** | 有限 API | 完全程式碼修改 |
| **安全模型** | 信任供應商 | 沙箱隔離 |
| **定價** | 訂閱制 | BYOK（自帶密鑰） |
| **AI 整合** | 通常是事後新增 | 原生設計 |

### 5.2 Cloudflare OS vs 其他 Agent 框架

| 維度 | 通用 Agent 框架 | Cloudflare OS |
|------|-----------------|---------------|
| **安全模型** | MCP 伺服器預配置 | 基於能力的引入 |
| **應用隔離** | 無 | 每個 Gadget 獨立沙箱 |
| **人機協作** | 同步批准 | 異步模擬+批次批准 |
| **應用分發** | 共享實例 | Blueprint（程式碼副本） |
| **執行時** | 本地/自託管 | Cloudflare Workers |

---

## 6. 路線圖與未來規劃

### 6.1 當前狀態

- **版本**：v2（2026 年 8 月早期存取）
- **狀態**：積極開發中，從 v1 完全重寫
- **成熟度**：功能強大，但仍有許多粗糙之處

### 6.2 即將到來

- **workerd 自託管**：完全在開源 `workerd` 執行時上執行的文件和工具
- **更多 Gatekeepers**：持續新增新的服務整合
- **社群貢獻**：隨著專案成熟，可能開放更多貢獻機會

### 6.3 貢獻政策

> 目前，我們不尋求外部貢獻。外部 PR 是"捐贈"容易的部分（編寫程式碼），同時創造了更多困難的工作（審查）。僅接受小型、可輕鬆驗證的 PR（≤12 行）。大型想法 → 討論。

---

## 7. 總結

Cloudflare OS 不僅僅是一個 AI 生產力工具——它代表了軟體分發和使用的範式轉變。透過將每個應用變成使用者擁有的私有實例（Gadget），透過基於能力的安全框架（Gatekeeper），透過異步人機協作機制，Cloudflare OS 為 AI 時代的生產力設定了新的標準。

**核心價值**：
1. **安全**：沙箱隔離 + 基於能力的安全
2. **可控**：使用者擁有程式碼和資料
3. **可定制**：AI 可以修改任何應用
4. **高效**：異步人機協作
5. **開放**：Apache-2.0 開源

**適用場景**：
- 需要安全使用 AI 的企業
- 希望使用者能定制應用的組織
- 重視資料隱私和控制的團隊
- 想要構建 AI 原生生產力工具的開發者

Cloudflare OS 為 AI 時代的生產力軟體樹立了一個新的標杆。它的設計哲學和實踐經驗值得所有 AI 工具開發者學習和借鑒。

---

> **參考資源**：
> - [GitHub 倉庫](https://github.com/cloudflare/cloudflare-os)
> - [官方部署](https://os.cloudflare.app/deploy)
> - [部署啟動倉庫](https://github.com/cloudflare/cloudflare-os-starter)
> - [workerd 執行時](https://github.com/cloudflare/workerd)
> - [Cap'n Web RPC](https://github.com/cloudflare/capnweb)
