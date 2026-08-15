---
title: 'holaOS 深度解析：屬於你和你的 Agent 的電腦——一個開源的全能 AI Agent 工作空間'
date: "2026-08-15"
description: "深入解析 holaboss-ai/holaOS（7.4k Stars 開源專案，Electron + TypeScript）：開源的全能 AI Agent 工作空間——在一個本地優先的工作空間裡執行任何 Agent（Claude Code、Codex、holaOS 內建 Agent），共享同一份記憶、同一套工具、同一個工作區。核心思想：'The Computer for You and Your Agent'（屬於你和你的 Agent 的電腦）——Agent 時代的主角不是聊天視窗，而是一台你可以與 Agent 共同使用的電腦；真正有價值的不是模型本身（模型已商品化），而是 Agent 之上的工作空間層：共享記憶、真實應用介面（HolaApps）、可讓 Agent 操作的完整工作站。專案說明：本地優先的 Electron 桌面應用 + 程序內執行時（runtime/{harnesses,harness-host,api-server,state-store}），bun + turbo monorepo；六大特性——執行任何 Agent、一份記憶所有 Agent 共享、模型內建或 BYOK、HolaApps 真實應用介面、Skills/Integrations/MCP 一次教學處處重用、整個工作站可被 Agent 操作（真實瀏覽器/前沿生成/真實交付物/任意聊天入口/自動化）；三形態交付（桌面 App/開源自託管/企業版 SSO）。詳細教學：一鍵安裝（install.sh）、手動安裝全流程（desktop:install → .env → prepare-runtime:local → typecheck → dev）、執行時捆綁（自包含 runtime：API + 內建 Node/npm + 內建 Python）、hola CLI 偵錯 pi 大腦、打包發布（dist:mac/dist:win、CI 簽名公證、YYYY.MDD.R 版本號）、安全模型（contextIsolation/nodeIntegration/webviewTag）。設計哲學：本地優先與資料所有權、Agent 無關（無鎖定）、共享上下文優於 Agent 孤島、真實介面而非聊天記錄、一次教學處處重用、零設定預設 + BYOK 彈性、自包含執行時、安全至上、人在迴路。觀點歸納：Agent OS 是下一個平台層；記憶是護城河；模型商品化後工作空間層捕獲價值；開源 + 託管的雙路徑；自包含執行時是 AI 工作空間的務實選擇。"
tags:
  - holaOS
  - Holaboss
  - AI Agent
  - Agent Workspace
  - Agent OS
  - Electron
  - TypeScript
  - Claude Code
  - Codex
  - MCP
  - Skills
  - 共享記憶
  - Local-First
  - BYOK
  - HolaApps
  - 設計哲學
categories:
  - 深度解析
  - AI Agent
  - 開源專案
---

# holaOS 深度解析：屬於你和你的 Agent 的電腦——一個開源的全能 AI Agent 工作空間

> 核心思想：**"The Computer for You and Your Agent"（屬於你和你的 Agent 的電腦）**。holaOS 的創辦人認為，Agent 時代真正的主角不是一個個聊天視窗，而是一台**你可以與 Agent 共同使用的電腦**。它把這個理念落成一個開源的全能 AI Agent 工作空間：在一個本地優先的工作區裡執行**任何** Agent（Claude Code、Codex、或 holaOS 內建 Agent），它們共享同一份記憶、同一套工具、同一個瀏覽器、同一個應用生態——"用最適合工作的 Agent，而不是每次都重新搭建環境"。更深刻的判斷是：**模型本身正在快速商品化（模型層價值趨零），真正捕獲價值的是 Agent 之上的「工作空間層」**——共享記憶、真實應用介面、可被 Agent 操作的完整工作站。

## 文章背景與專案簡介

2026 年，AI Agent 領域的競爭已經進入白熱化：Claude Code、OpenAI Codex、Cursor、Windsurf……每個 Agent 都試圖成為開發者的唯一入口。但 holaOS 的團隊（holaboss-ai）提出了一個不同的視角：**為什麼我們要在 Agent 之間做單選題？**

holaOS 的答案是——不要押注某一個 Agent，而是押注**承載所有 Agent 的那台「電腦」**。就像你不會因為換了瀏覽器就丟失檔案、書籤和歷史記錄一樣，你也不應該因為換了 Agent 就丟失記憶、工具和技能。holaOS 就是這個「Agent 時代的作業系統」：它是開源的、本地優先的、與具體 Agent 無關的**工作空間層**。

### 專案元資訊

| 欄位 | 值 |
|------|-----|
| 倉庫 | https://github.com/holaboss-ai/holaOS |
| Stars | 7.4k |
| Forks | 642 |
| Watchers | 172 |
| License | Modified Apache 2.0（附加商業散佈與品牌條款） |
| 語言 | TypeScript（Electron 桌面應用 + 程序內執行時） |
| 套件管理 | bun 1.3.6 + turbo（monorepo） |
| 平台 | macOS（Apple Silicon + Intel）、Windows、Linux |
| 形態 | Electron 桌面應用 + 自包含執行時捆綁 |
| 提交數 | 73 commits |
| 官網 | https://www.holaos.ai |
| 安全報告 | admin@holaboss.ai（私有報告） |

### 一句話定位

holaOS 是一個**開源的、本地優先的全能 AI Agent 工作空間（All-in-One AI Agent Workspace）**：在一個工作區裡執行任何 Agent——Claude Code、Codex、或內建的 holaOS Agent——共享同一份記憶、同一套工具、同一個應用生態，模型內建或自帶金鑰（BYOK）均可。

## 核心思想：為什麼是「一台電腦」，而不是「一個聊天框」

holaOS 整個專案的靈魂可以拆成四個遞進的判斷：

### 1. Agent 時代的主角是「電腦」，不是「聊天」

絕大多數 AI 產品把互動設計成聊天框：你發訊息，AI 回覆文字。holaOS 的創辦人認為這是錯的隱喻。真正的典範是**電腦**——你和 Agent 共享一台機器、一套檔案、一個瀏覽器、一組應用。Agent 產出的不是「對話記錄」，而是**真實落地的成果**：真實的 `.xlsx` 報表、真實的 `.pptx` 幻燈片、真實的 `.docx` 文件、真實的操作過的應用介面。

### 2. 模型已商品化，價值在工作空間層

內建 Kimi K3、GLM 5.2（日常性價比）、GPT 5.6、Claude Opus 5、Fable 5（困難任務），同時支援 OpenAI/Anthropic 或任何相容端點的 BYOK——這背後的判斷是：**模型本身已經不再是差異化來源**。差異化在於模型之上的那一層：記憶、工具、技能、應用、工作流的**編排與共享**。

### 3. 無鎖定：Agent 是插拔的，工作空間是持久的

holaOS 明確打出「No lock-in」（無鎖定）：帶來你已經信任的 Agent 即可。換 Agent、關應用、下週再回來——它還記得你上次停在哪裡。**共享一切**（一份上下文、一套工具、一個工作區）+ **一致的結果**（無論誰在驅動，技能和整合始終如一）。

### 4. 一次教學，處處重用（Teach once, reuse everywhere）

在 holaOS 裡，你為某個 Agent 配好的 Skills（技能）、Integrations（整合）、MCP 伺服器、Combos（組合包），**所有 Agent 自動繼承**。這直接把「換 Agent 的遷移成本」降到了零——這正是無鎖定承諾能成立的技術基礎。

## 專案說明：holaOS 是什麼

### 六大核心特性

#### 🔀 執行任何 Agent，一個工作空間

Claude Code、Codex、內建 holaOS Agent——並排執行，無需切換。無論執行哪個，都共享同一份記憶、工具、技能和應用。

#### 🧠 一份記憶，所有 Agent 共享

上下文、偏好、專案歷史存放在**單一共享記憶**中——以**本地純文字檔案**儲存，你可以直接閱讀和編輯。切換 Agent、關閉應用、一週後回來：它已經知道你在哪裡停下。

- **永不從零開始**——跨工作階段、跨 Agent 的持久記憶
- **本地優先、屬於你**——在你的機器上，可見可編輯，不鎖在別人的雲端
- **真正可召回**——結構化和嵌入式的儲存，讓正確的上下文在需要時返回

#### 💸 模型你做主——內建或自帶

一個帳號，所有模型，無需金鑰、無需設定、無需在提供者之間切換。前沿模型**內建**：性價比的 **Kimi K3** 和 **GLM 5.2** 處理日常量，頂級的 **GPT 5.6**、**Claude Opus 5**、**Fable 5** 處理難題。想用自己的提供者？為 OpenAI、Anthropic 或任何相容端點**自帶金鑰（BYOK）**——那些跑在你的帳號上，而不是你的 holaOS 方案上。

#### 🪟 HolaApps——應用與 Agent 並排

從工作區內的應用市集安裝應用，它們會作為**真實的、可互動的介面**開啟在你的 Agent 旁邊。看著它在應用裡工作，隨時插手，結果就地落地——不是一堵聊天文字牆，而是**真正的應用**，由 Agent 驅動，就在 Agent 旁邊。

- **真實介面，不是聊天**——每個應用都是活 UI（Notion、瀏覽器、你自己的應用）
- **並排是設計**——應用和 Agent 共享螢幕
- **一鍵安裝**——瀏覽應用市集，即刻開啟
- **自帶應用**——把任何 URL 和 MCP 伺服器指向一個 HolaApp

#### 🧩 Skills、Integrations 與 MCP——一次教學，處處重用

- **Integrations**——Gmail、Notion、Slack、GitHub、Linear 等 50+ 應用一鍵 OAuth 連線，Agent 直接跨工具讀寫，無需膠水程式碼
- **MCP**——接入任何 Model Context Protocol 伺服器，或一鍵安裝社群 MCP 伺服器
- **Skills**——把工作流打包一次，任何 Agent 按需執行
- **Combos**——把技能和整合捆綁成一次點擊的安裝包

#### 🛠️ 你的整個工作站，可被 Agent 操作

- **🌐 真實瀏覽器，由 Agent 驅動**——已登入的瀏覽器讓 Agent 瀏覽、點擊、提取，一切在你的掌控之下
- **🎨 前沿生成內建**——最新的影像、影片、音訊模型在每個 Agent 裡
- **📄 真實交付物**——報表、表格、幻燈片存成真實的 `.xlsx`、`.pptx`、`.docx` 檔案
- **💬 從任何聊天入口觸達**——飛書、微信、Slack、Telegram
- **⏰ 自動化**——按計畫或觸發器執行

### 三種執行形態

| 形態 | 說明 |
|------|------|
| 🖥️ 桌面 App | 下載即用，前沿模型內建，免費開始 |
| 🔓 開源自託管 | Modified Apache 2.0，自帶金鑰，完全跑在自己的機器上 |
| 🏢 企業版 | SSO + 每個 Agent/技能/應用的按角色權限、稽核日誌、內部系統安全連線、本地或自有雲部署 |

### 技術架構：Electron 桌面 + 程序內執行時

holaOS 採用 bun + turbo 的 monorepo 結構，核心是**桌面應用**與**程序內執行時**的分離：

```text
holaOS/
├── apps/                     # 應用
│   ├── desktop/              # Electron 桌面應用（Vite renderer + electron main/preload）
│   └── docs/                 # 文件站
├── runtime/                  # 程序內執行時（核心）
│   ├── api-server/           # 執行時 API 伺服器
│   ├── channel-gateway/      # 通道閘道
│   ├── harness-host/         # 執行時宿主機（pi/Hola 大腦在此執行）
│   ├── harnesses/            # 各類 harness（含 pi 大腦）
│   └── state-store/          # 狀態儲存（better-sqlite3）
├── packages/                 # 共享套件（如 @holaboss/app-sdk）
├── shared/                   # 共享程式碼
├── scripts/                  # install.sh、hola.mts 等
└── patches/                  # 依賴修補
```

桌面端是 Electron + React 19 + TypeScript + Vite + Tailwind CSS，三欄佈局（檔案資源管理器 / 內建瀏覽器面板 / AI 聊天助手），透過安全的 preload 橋接（`contextIsolation: true`、`nodeIntegration: false`、`webviewTag: true`）存取本地檔案系統與內建瀏覽器。

執行時是**自包含捆綁**（runtime bundle）：打包了執行時 API、內建的 Node/npm、內建的 Python——桌面應用在 `apps/desktop/out/runtime-<platform>` 下 staging 執行時，保證環境確定性與可移植性。

### 內建 Skills（預設技能庫）

audience-analyst（受眾分析）、content-planner（內容規劃）、content-writer（內容寫作）、data-analyst（資料分析）、email-writer（郵件寫作）、idea-generator（創意生成）、image-generator（影像生成）、meeting-notes（會議紀要）、performance-reporter（績效報告）、prd-writer（PRD 寫作）、proposal-writer（提案寫作）、summarizer（摘要）、tone-adapter（語氣適配）、translator（翻譯）、trend-spotter（趨勢發現）、video-generator（影片生成）、web-researcher（網路研究）——這是「一次教學、處處重用」的預設範例。

## 詳細教學：從零安裝 holaOS

### 方式一：一鍵安裝（推薦）

在 macOS、Linux 或 WSL 的全新機器上：

```bash
curl -fsSL https://raw.githubusercontent.com/holaboss-ai/holaOS/refs/heads/main/scripts/install.sh | bash -s -- --launch
```

該腳本預設會：
1. 缺 git 則安裝 git
2. 缺 Node.js 24 + npm 則安裝
3. 克隆倉庫到 `~/holaboss-ai`
4. 按需從 `apps/desktop/.env.example` 建立 `apps/desktop/.env`
5. 執行 `npm run desktop:install`
6. 執行 `npm run desktop:prepare-runtime:local`
7. 執行 `npm run desktop:typecheck`
8. 在驗證前停下（除非傳了 `--launch`）

可選參數：
- `--dir <path>` 指定克隆目錄
- `--ref <git-ref>` / `--branch <git-ref>` 從指定分支或標籤安裝
- `--launch` 驗證後繼續進入 `npm run desktop:dev`

如果你已經在本地 checkout 裡，想直接重用同一個包裝腳本：

```bash
bash scripts/install.sh --dir "$PWD"
```

### 方式二：手動安裝（控制每一步）

先驗證前置條件：

```bash
git --version
node --version    # 必須 ≥ 24
npm --version
```

然後按順序執行：

```bash
# 1. 克隆倉庫
git clone https://github.com/holaboss-ai/holaOS.git holaboss-ai
cd holaboss-ai

# 2. 安裝桌面端依賴
npm run desktop:install

# 3. 建立本地環境檔案
cp apps/desktop/.env.example apps/desktop/.env

# 4. 準備本地執行時捆綁
npm run desktop:prepare-runtime:local

# 5. 啟動前快速驗證（非互動）
npm run desktop:typecheck

# 6. 啟動開發模式
npm run desktop:dev
```

`npm run desktop:dev` 的 `predev` 鉤子會自動校驗環境、重建原生模組、確保 runtime 捆綁已 staging——所以正常開發路徑不需要手動 prepare。

### 執行時捆綁的兩種來源

```bash
# 從本地原始碼建構 runtime 並 staging
npm run desktop:prepare-runtime:local

# 從 GitHub Releases 拉取目前平台最新已發布 runtime
npm run desktop:prepare-runtime
```

本地原始碼路徑用於你在改執行時代碼時；已發布捆綁用於驗證桌面端對已知發布產物的相容性。

### 執行時驗證（可選，針對全新克隆）

```bash
npm run runtime:state-store:install
npm run runtime:state-store:build
npm run runtime:harness-host:install
npm run runtime:harness-host:build
npm run runtime:api-server:install
npm run runtime:test
```

### 進階：用 hola CLI 偵錯 pi 大腦

`scripts/hola.mts` 允許你在**不開啟桌面 UI** 的情況下，直接從原始碼程序內執行 **pi（Hola）大腦**進行偵錯：在 `runtime/harness-host/src/pi.ts` 中斷點、改完即重跑、無需建構/staging 循環、可同時開多個實例。

```bash
# 先關閉該 checkout 的桌面（避免寫衝突），然後：
npm --prefix runtime/api-server run hola -- -p "list the files in this repo and summarize it"
```

它呼叫執行時真實的 `executeTsRunnerRequest` 流水線，只把 `runHarnessHost` 依賴替換為程序內 `runPi()`——所以 MCP、sidecar、skills、工具、`model_client`、注入上下文等所有建構階段都**忠實於桌面執行**，只有 harness 子程序被替換。事件流經真實 relay（`harness_session_id` 持久化 → resume 可用）。

常用 flags：`-p/--prompt`、`--cwd`、`-m/--model`、`-s/--session <path>`（恢復指定工作階段）、`--fresh`（新工作階段）、`--no-runtime`（跳過 HTTP 後端工具）、`--keep`（保留啟動的 runtime）、`--force`（強制開啟正在被桌面使用的 root）、`--print-request`（只建構+列印請求，不呼叫模型）、`--debug`（原始事件）、`--port`。

### 打包發布（進階）

```bash
# macOS（本地 ad-hoc 簽名）
npm run dist:mac
npm run dist:mac:dmg

# Windows（NSIS 安裝器）
npm run dist:win
```

- `dist:mac` 產出未簽名的本地 `.app`（runtime-macos 嵌入 `Contents/Resources/`）
- `dist:mac:dmg` 產出本地使用 `.dmg` 安裝器
- 生產簽名與公證在 GitHub Actions 中完成（Apple 金鑰設定好後）
- 桌面發布版本號用 `YYYY.MDD.R` 穩定 semver（如 `2026.410.1`、`2026.1113.1`），GitHub release tag 為 `holaOS-YYYY.MDD.R`

### 安全模型

- 渲染程序：`contextIsolation: true`、`nodeIntegration: false`、`webviewTag: true`（為內建瀏覽器面板有意開啟）
- preload 橋只暴露執行時資訊與受約束的檔案系統 API
- 安全事件（憑證洩漏、RCE、沙箱逃逸、越權、不安全預設設定）請**私有**回報到 `admin@holaboss.ai`，不要公開開 issue

## 設計哲學：holaOS 的九個原則

### 1. 本地優先與資料所有權（Local-first & data ownership）

記憶是純文字檔案，存在你的機器上，可見、可編輯、可遷移。「Not locked in someone else's cloud」（不鎖在別人的雲端）——這是對 SaaS AI 產品「記憶黑盒」的正面回應。使用者的資料主權是產品信任的基礎。

### 2. Agent 無關（Agent-agnostic）

不押注單一 Agent，而是讓工作空間層與 Agent 解耦。Claude Code、Codex、內建 Agent 是**可插拔的執行器**，工作空間（記憶/工具/技能/應用）是**持久的資產**。這既是對使用者的承諾（無鎖定），也是產品定位的選擇（不站隊）。

### 3. 共享上下文優於 Agent 孤島

每個 Agent 各自維護一套記憶和工具是巨大的浪費與碎片化。holaOS 的核心主張是：**上下文、偏好、專案歷史應該是一個共享的單一資產**，無論哪個 Agent 在驅動。這也是「一致的結果」（Consistent results）承諾的來源。

### 4. 真實介面，而非聊天記錄（Real surfaces, not chat）

Agent 的工作成果應該是**真實的應用介面和真實檔案**，而不是聊天記錄牆。HolaApps 讓應用與 Agent 並排存在——「app and agent share the screen, so you always see what's happening and can take over」（應用與 Agent 共享螢幕，你始終能看到正在發生什麼並隨時接管）。**人在迴路（human-in-the-loop）** 是設計內建，不是事後補丁。

### 5. 一次教學，處處重用（Teach once, reuse everywhere）

技能、整合、MCP、Combos 是**與 Agent 無關的資產**。這直接把知識重用的單位從「單個 Agent」提升到「整個工作空間」，也讓「換 Agent」的遷移成本趨近於零——無鎖定承諾因此變得可信。

### 6. 零設定預設 + BYOK 彈性

內建模型意味著「一個帳號、每個 SOTA 模型、無需管理 API 金鑰」的零設定預設；BYOK 意味著「你的金鑰、你的提供者、你的費率」。這是對「易用性」與「自主權」的雙重滿足——預設路徑無障礙，進階路徑不鎖死。

### 7. 自包含執行時（Self-contained runtime）

把執行時 API、Node/npm、Python 全部捆綁進 runtime bundle，桌面應用 staging 後執行。這保證了**環境確定性**（不依賴宿主機的 Node/Python 版本）、可移植性與可重現性——AI 工作空間不能建立在「依賴使用者機器環境恰好正確」的假設上。

### 8. 安全至上（Security-first）

`contextIsolation` + 受限 preload 橋 + 明確的私有漏洞回報流程 + 企業版稽核日誌——Agent 能操作你的瀏覽器和檔案，安全必須是第一公民。安全策略明確列出五類敏感問題（憑證洩漏、RCE、沙箱逃逸/提權、認證繞過、暴露本地執行時的不安全預設設定），說明團隊對「Agent 權限」的嚴肅態度。

### 9. 面向 Agent 的確定性文件（Deterministic docs for agents）

INSTALL.md 被明確寫成「為編碼 Agent 準備的確定性 runbook」（deterministic setup runbook for an agent）——甚至提供一句話 handoff 讓 Codex/Claude Code 直接執行安裝。AGENTS.md 規定圖示必須走 `@/components/ui/icons` 包裝層、commit 用 Conventional Commits 詳細格式。**這個倉庫本身就是「Agent 友好的程式碼庫」的示範**——文件不是給人看的，是給 Agent 執行的。

## 關鍵觀點總結

### 觀點 1：Agent OS 是下一個平台層

模型層正在商品化（各家 SOTA 模型差距縮小且互相追趕），應用層已經被巨頭把持。真正的空白是**承載 Agent 的作業系統層**——記憶、工具、技能、應用的編排層。holaOS 押注的就是這個位置。「The Computer for You and Your Agent」不是行銷口號，而是一個平台判斷。

### 觀點 2：記憶是護城河

跨工作階段、跨 Agent 的持久共享記憶是 holaOS 最深的差異化。當所有 Agent 都能呼叫模型和工具時，**「記得」才是稀缺的**。而「以純文字檔案儲存」這個選擇極其聰明：既兌現本地優先的承諾，又讓使用者可稽核、可遷移、可信任。

### 觀點 3：模型商品化後，工作空間層捕獲價值

內建多種前沿模型 + BYOK 的姿態表明：holaOS 不靠模型賺錢（那是被商品化的層），而靠**編排、記憶、應用生態、企業安全**賺錢。這是對「模型即護城河」敘事的明確反駁——護城河在模型之上。

### 觀點 4：開源 + 託管 + 企業版的三路徑

桌面 App（免費開始）→ 開源自託管（BYOK）→ 企業版（SSO/稽核/私有部署）。這既是增長漏斗（開源引流、企業變現），也是信任策略（自託管選項消除了「我的資料在你的雲裡」的顧慮）。

### 觀點 5：Agent 需要「看得見、可接管」的操作介面

HolaApps 的並排設計回答了 Agent 安全性的一個關鍵問題：**如何讓使用者信任 Agent 操作真實應用？** 答案是——讓操作全程可見（side-by-side），讓接管隨時可能（step in whenever）。信任不是靠權限系統堆出來的，是靠**透明性**堆出來的。

### 觀點 6：自包含執行時是 AI 工作空間的務實選擇

捆綁 Node/npm/Python 的 runtime bundle 犧牲了體積，換來了確定性與可移植性。對 AI 工作空間而言，**可重現比輕量更重要**——因為 Agent 要執行的工具鏈必須穩定。這一選擇對同類產品有直接借鑑意義。

### 觀點 7：從「對話式 AI」到「工作空間式 AI」的典範轉移

holaOS 代表了一類正在成形的共識：**AI 的終極互動不是對話框，而是共享的工作環境**。Agent 在你的瀏覽器裡、你的應用裡、你的檔案系統裡工作，產出真實的交付物，從你所在的任何聊天入口觸達，按計畫自動執行——「對話」只是其中一個人性化介面，不再是產品的全部。

## 結語

holaOS 是 2026 年 Agent 基礎設施競爭中最具代表性的「工作空間派」專案之一。它不押注某個 Agent 的勝負，而是押注一個更根本的層：**Agent 時代的電腦**。7.4k Stars 與 642 Forks 說明這個判斷引發了廣泛共鳴。

它的核心啟示可以濃縮成一句話：**當模型不再是稀缺品，「與 Agent 共享的持久工作空間」才是稀缺品。** 無論是共享記憶的本地優先設計、真實介面而非聊天記錄的 HolaApps 典範、一次教學處處重用的技能體系，還是面向 Agent 的確定性文件，holaOS 都在回答同一個問題：**如何讓「用任何 Agent 幹任何活」這件事，像用一台電腦一樣自然、可靠、可接管。**

對於正在建構 AI 產品的人，holaOS 值得拆解的地方很多：它的 monorepo 結構、自包含執行時方案、HolaApps 的並排互動典範、以及「記憶即護城河」的產品判斷。而對於終端使用者，它提供了一個罕見的承諾：**換 Agent 不再意味著從零開始。**