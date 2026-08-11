---
title: "T3 Code 深度解析：一個能控制五家 coding agent 的開源「agent harness control surface」——產品形態、實戰教學與設計哲學"
description: "以 pingdotgg/t3code（GitHub 18k+ stars，MIT，開源）為主線，逐層拆解 T3 Code：①專案說明——一個 Web + 桌面 + 移動三端、控制 Codex/Claude/Cursor/Grok/OpenCode 五家 agent provider 的開源「agent harness control surface」；②詳細教學——npx t3@latest 啟動、桌面安裝、5 種 provider 的安裝登入、4 種權限模式（Supervised / Auto-accept edits / Auto / Full access）、遠端存取（LAN / Tailscale / T3 Connect / SSH）、4 種 source control（GitHub/GitLab/Bitbucket/Azure DevOps）、WebSocket + OAuth + DPoP 認證、keybindings 與 thread pin；③技術架構——Effect RPC WebSocket、event-sourced 編排（command→decider→event→projector）、5 個 provider driver、checkpoint（隱藏 git ref）、3 個 queue-backed worker、Rust 資源監控 sidecar；④6 條設計哲學——Open at the core、Performance without compromise、Remote ready、Multi-surface、Complexity at the adapter boundary、Event-sourced truth。核心主張：把 agent harness 當作一種需要 control surface 的產品形態，而不是一種 agent 框架；T3 Code 是這個判斷的工程實現。"
date: "2026-08-10"
author: "TopDigg Research Team"
tags: ["T3 Code", "t3code", "pingdotgg", "Agent Harness", "AI Agent", "Coding Agent", "Codex", "Claude Code", "Cursor", "Grok", "OpenCode", "Effect RPC", "Event Sourcing", "Remote Access", "Tailscale", "T3 Connect", "WebSocket", "OAuth", "Clerk", "Electron", "React Native", "Open Source", "MIT"]
categories: ["Deep Dive"]
keywords: ["T3 Code", "t3code", "pingdotgg", "agent harness", "control surface", "multi-provider", "Codex CLI", "Claude Code", "Cursor CLI", "Grok Build CLI", "OpenCode", "Effect RPC", "WebSocket", "event-sourced", "checkpoint", "Tailscale", "T3 Connect", "Clerk OAuth", "DPoP", "Electron", "React Native", "Expo", "設計哲學", "AGENTS.md"]
---

# T3 Code 深度解析：一個能控制五家 coding agent 的開源「agent harness control surface」——產品形態、實戰教學與設計哲學

> 核心思想：**T3 Code（pingdotgg/t3code）不是另一種 agent 框架——它是一個「agent harness control surface」：一個 Node WebSocket 服務把 Codex / Claude / Cursor / Grok / OpenCode 五家 provider CLI 收成同一套可遠端控制的執行環境，再用 Web + 桌面（Electron）+ 移動（React Native）三端讓使用者從任何裝置控制 agent。** 它的核心工程判斷是——模型能力已超過 agent 框架，**真正的瓶頸是「如何在一台機器上同時管理 5 種 agent 並從任何地方連過去」**。T3 Code 用 Effect RPC WebSocket、event-sourced 編排、隱藏 git ref 形式的 checkpoint、獨立 Rust 資源監控 sidecar、Clerk OAuth + DPoP 認證、Tailscale / T3 Connect / SSH 三種遠端通道，**把「agent harness」做成了一個完整的產品形態**，並以 MIT 協議開源。它的設計哲學（AGENTS.md 第一手記錄）可以壓成 6 句——**Open at the core；Performance without compromise；Remote ready；Multi-surface；Complexity belongs at the adapter boundary；Event-sourced truth**。

---

## 一、專案說明

### 1.1 它是什麼？

本文解析的是 GitHub 倉庫 [`pingdotgg/t3code`](https://github.com/pingdotgg/t3code)（**18k+ stars / 4k+ forks / 1.5k+ issues**，TypeScript，**MIT 協議**）——一個跨五家 coding agent provider 的開源「agent harness control surface」。

它的工作方式可以一句話講清：

> **T3 Code = 一台本地 Node WebSocket 服務 + 一個 React Web UI + 一個 Electron 桌面殼 + 一個 React Native 移動端，讓你能從任何裝置（手機、平板、另一台電腦）控制你本機跑的 Codex / Claude Code / Cursor / Grok Build / OpenCode agent。**

T3 Code 自己**不訓練模型、不造 agent 框架、不替代你的訂閱**——它做的事情是：

1. **包裝 provider CLI**——把 5 家 provider 的不同協定（Codex app-server、Claude SDK、Cursor agent、Grok CLI、OpenCode SDK）統一收成同一種「provider driver + adapter」介面；
2. **跑一個本地 server 端**——`npx t3@latest` 啟動的 Node 行程（package 名就叫 `t3`），是**所有 provider 行程、terminal、git、檔案系統操作的執行邊界**（client 永遠不直接呼叫 provider）；
3. **遠端化**——同一條 Effect RPC WebSocket 協議從同網域、跨網路（Tailscale）、T3 Connect（Cloudflare 通道）、桌面託管 SSH 4 種通道任選其一連過去；
4. **多端 UI**——Web、桌面（Electron 把 web 套一層殼）、移動（Expo/React Native，原生 iOS + Android）；
5. **開源 + MIT**——AGENTS.md 直說「if we ever go the wrong direction, you have everything you need to fork」。

### 1.2 一句話定位

> **T3 Code 是開源、bring-your-own-subscription 的 Claude Desktop / Codex App / Cursor Glass / Conductor 的替代品。**

### 1.3 關鍵事實

- **資料**：GitHub 18,104 stars · 4,083 forks · 1,510 open issues（README + GitHub API）
- **協議**：MIT
- **主語言**：TypeScript（pnpm workspace + Vite+ 建置）
- **server 端 Node 要求**：`^22.16 || ^23.11 || >=24.10`
- **支援 5 家 provider**：Codex（OpenAI）、Claude Code（Anthropic）、Cursor（Cursor）、Grok Build（xAI）、OpenCode（SST）
- **3 個 client 端**：Web（`app.t3.codes` 託管 + `npx t3` 本地）、桌面（Electron 殼）、移動（React Native，iOS App Store / Google Play）
- **4 種遠端通道**：直接 WebSocket、Tailscale Serve、T3 Connect（Cloudflare 通道）、桌面託管 SSH
- **4 種權限模式**：`approval-required`（Supervised）/ `auto-accept-edits` / `auto` / `full-access`
- **3 個 layer（編排）**：`apps/server`（執行 runtime）/ `apps/web`、`apps/desktop`、`apps/mobile`（client 端）/ `packages/*`（共用 contracts、client runtime、telemetry、SSH、Tailscale）
- **架構關鍵事實**：server 端是 event-sourced 編排（command → decider → event → projector），每個 turn 用隱藏 git ref 做 checkpoint，資源監控用獨立 Rust sidecar（不用 Node native addon），認證走 Clerk OAuth + DPoP proof-of-possession
- **貢獻政策**：官方明確「（mostly）not accepting contributions yet. Small fixes may be considered. Big features will not be.」——這是個高門檻、Theo（`-bPingdotgg`）親自管的早期專案
- **使用規模**：AGENTS.md 提到「over 100,000 users」
- **官方主倉庫**：`pingdotgg/t3code`（注意倉庫名是 `t3code` 而非 `t3-code`，但應用名是 T3 Code）

### 1.4 它解決的問題

2026 年的「agent 開發體驗」被撕成了 5 塊：

1. **5 家 provider 各一套**——Codex 有自己的 app、Claude Code 有自己的 CLI、Cursor 有自己的桌面應用、Grok Build 還在 beta、OpenCode 是 SDK。要在所有這些工具之間切來切去是不連續的。
2. **只能在工作機前面用**——你正在手機上，卻沒辦法讓本地跑的 agent 繼續跑。
3. **跨裝置同步差**——在桌面開一個 thread，手機看不到。
4. **遠端 + 安全 + 效能**——自己搞 Tailscale 或 SSH 轉發是可行的，但每個專案都要重新搞一遍；託管通道又怕效能。
5. **權限控制粒度**——你不會讓 agent 無監督在主分支上跑 `rm -rf`。

T3 Code 的回答：**一個開源執行 runtime、一種遠端協議、一套 4 模式權限系統、3 個原生 client 端、5 種 provider 相容。** 讓「agent harness」從 5 個產品變成 1 個產品。

---

## 二、詳細教學：從 0 到能遠端控制 5 家 agent

這一節按「安裝 → 配 provider → 用 4 種權限模式 → 遠端存取 → 源碼控制 → 進階玩法」六步走，每步都給可複製指令、最小範例與注意事項。來源：[docs/user/](https://github.com/pingdotgg/t3code/tree/main/docs/user)。

### 2.1 第 1 步：安裝 T3 Code

**先決條件**：

- Node.js `^22.16 || ^23.11 || >=24.10`（裝在**跑 T3 server 的那台機器上**）
- 至少裝好一家 provider CLI 並登入（下面第 2 步）

**最快試玩（不裝任何東西）**：

```bash
npx t3@latest
```

這會在你機器上啟動 T3 server 並自動開本地 Web client。`npx t3@latest --help` 查完整 CLI 參考。

**桌面應用**（多數人從這裡開始）：

| 平台 | 指令 |
|---|---|
| Windows | `winget install T3Tools.T3Code` |
| macOS | `brew install --cask t3-code` |
| Arch Linux | `yay -S t3code-bin` |
| 任何平台 | 從 [GitHub Releases](https://github.com/pingdotgg/t3code/releases) 下載 |

> 重點：桌面應用自帶一個 `t3` 後端，你也可以讓桌面應用作為 server 讓手機/另一台電腦連過來。

### 2.2 第 2 步：裝 provider 並登入

T3 Code **不打包** provider CLI——你裝哪家用哪家。在**跑 T3 server 的機器**上（不是手機！也不是你看的裝置）：

| Provider | 裝 CLI | 登入指令 | 預設二進位 |
|---|---|---|---|
| **Codex** | [Codex CLI](https://developers.openai.com/codex/cli) | `codex login` | `codex` |
| **Claude** | [Claude Code](https://claude.com/product/claude-code) | `claude auth login` | `claude` |
| **Cursor** | [Cursor CLI](https://cursor.com/cli) | `agent login` | `cursor-agent` |
| **Grok Build** | [Grok Build CLI](https://x.ai/cli) | `grok login` | `grok` |
| **OpenCode** | [OpenCode](https://opencode.ai) | `opencode auth login` | `opencode` |

> **關鍵提示（Cursor）**：裝的是 `cursor-agent` 二進位，但**登入用 `agent login`，不是 `cursor-agent login`**。Cursor 文件裡沒明說，T3 Code 文件專門警告了。

**找不到 CLI？** 用 Settings → provider instance → **Binary path** 給一個絕對路徑，覆蓋預設 PATH 查找（這在用 Volta / asdf / fnm 等版本管理器時常見）。

**何時需要認證？** 在用該 provider 開 session **之前**——T3 Code 本身啟動時不需要。可以先裝先打開 T3，再補登入。

### 2.3 第 3 步：選權限模式（4 種）

權限模式在 message composer 的 mode control 上**每個 thread 獨立**設定。AGENTS.md 與 docs/user/permission-modes.md 的對照：

| 模式 | 行為 | 適用場景 |
|---|---|---|
| **Supervised**（Supervised / Approve actions 行動端） | 所有指令、檔案改動前都問 | 不熟悉的 task；操作貴重的 repo |
| **Auto-accept edits** | 檔案改動自動過；指令仍問 | 重構型任務；你只在乎 shell 指令 |
| **Auto** | 例行操作不問，危險的仍問 | 常規開發；Codex 走 AI reviewer，Claude 走自己的 auto mode，沒等價的（如 OpenCode）就退回 Supervised |
| **Full access**（預設） | 指令和編輯都不問 | worktree、sandbox，反正可丟的 |

執行緒建立自另一個 thread 時**繼承**父 thread 的 mode；否則新 thread 預設 Full access。

每種模式由 provider 自己映射到自己的審批/sandbox 配置：Codex 把它轉成 `approval-policy` + `sandbox` 等級，Claude 用 `auto-permission-mode`。**mobile 用同樣的 4 種，但把 "Supervised" 顯示為 "Approve actions"**。

### 2.4 第 4 步：遠端存取

T3 Code 的核心承諾之一是**「remote ready」**。文件把 4 種遠端通道分得很清。

#### 2.4.1 直接 WebSocket（同網段，最簡單）

如果 T3 server 跑在 192.168.x.y:3773，你同一區域網內的手機/電腦直接連 `http://192.168.x.y:3773`，配上 pairing token 即可。**注意：瀏覽器在 HTTPS 頁面裡**不能用 plain HTTP 端點（mixed-content rule）——這種場景要用 HTTPS，或用桌面應用或 CLI 直接連。

#### 2.4.2 Tailscale（推薦）

如果你跑 Tailscale，桌面應用會自動發現 tailnet，把 tailnet IP（`100.x.y.z`）、MagicDNS、Tailscale Serve HTTPS 三種端點都列在 Settings → Connections。

```bash
# 啟用 Tailscale HTTPS
npx t3 serve --tailscale-serve
# 這條把 backend 暴露到 https://machine.tailnet.ts.net/
```

或者在桌面 Settings → Tailscale HTTPS 行開開關（**預設關**），桌面應用會自動 `tailscale serve --https=443` 配好映射。

**為什麼推薦**：穩定地址 + 傳輸層加密 + 不暴露公網。

#### 2.4.3 T3 Connect（Cloudflare 通道，零網路設定）

T3 Connect 是 T3 Code 自帶的 managed Cloudflare 通道方案——**當你的機器在 NAT 後、入口連接埠不能用、或行動端需要能連到桌面託管的 env 時用**。認證走 Clerk OAuth。

```bash
# 在 T3 server 機器上
npx t3 connect link
# 這一步會裝 pinned managed cloudflared，授權，把 intent 持久化
npx t3 serve
# 這一步 reconcile relay link 並啟動 managed tunnel
```

工作機制：relay Worker **只做憑證和 managed endpoint 的中介**，應用流量走 provisioning 出來的 Cloudflare tunnel hostname，**不經過 relay Worker 本身**。

**桌面應用 + T3 Connect**：
1. 設定 → T3 Connect → 登入（Clerk）
2. 設定 → T3 Connect → 「Link this environment」
3. 行動端在 Connections → Add Environment → 用同帳號登入，自動發現

#### 2.4.4 桌面託管 SSH 啟動

桌面應用可以**自己 SSH 到遠端機器，啟動或複用 T3 server，forward 連接埠回來**。Settings → Connections → Add environment → SSH launch flow → 輸 `user@example.com` → 確認。桌面做：

1. 探測 host
2. 啟或複用遠端 T3 server
3. 開本地連接埠 forward
4. 把 env 儲存（後續 reconnect 自動複用）

> **SSH launch 排錯**：遠端必須裝相容版本的 Node（`^22.16 || ^23.11 || >=24.10`）；用 nvm 的使用者跑 `nvm alias default 24`；Launcher 會寫 `~/.t3/ssh-launch/<host-key>/`、清掉 stale 行程、起 fresh server——一般不需要手動刪。

#### 2.4.5 Pairing 協議（所有通道共用）

不論哪種通道，pairing 流程一樣：

1. `t3 serve` 一次性 owner pairing token
2. 遠端裝置拿 token 跟 server 換 session
3. 之後是 session-based 存取（不需要重發原始 token，除非你 pair 新裝置）

**Hosted pairing 連結長這樣**：

```text
https://app.t3.codes/pair?host=https://backend.example.com:3773#token=PAIRCODE
```

- token 放 URL hash 裡（**不發給 hosted app origin**）
- hosted app **不代理流量**——瀏覽器直連 backend URL
- 適用 backend 必須從瀏覽器可達（HTTPS/WSS）；純 HTTP LAN 端點請用桌面應用/CLI 直接給

#### 2.4.6 配對後管理

`npx t3 auth`：

- 增發 pairing 憑證
- 查 active sessions
- revoke 舊 pairing 連結或 sessions

### 2.5 第 5 步：源碼控制整合

T3 Code 直接對接 4 個 Git 平台（認證都在 **T3 server 那一台機器上做**，不是瀏覽器）：

#### 2.5.1 GitHub

```bash
brew install gh
gh auth login
# 打開 T3 Code → Settings → Source Control 驗證 GitHub 已認證
```

能做的事：clone、publish、PR（標題/描述基於 commits 建議）、審 PR（看團隊成員的 branch，開 right-panel tabs）。

#### 2.5.2 GitLab

```bash
brew install glab
glab auth login
```

支援 Merge Request、倉庫發布、hosted clone。

#### 2.5.3 Bitbucket

無 CLI，**用環境變數**（推薦用 access token）：

```bash
export T3CODE_BITBUCKET_ACCESS_TOKEN="your-access-token"
# 或
export T3CODE_BITBUCKET_EMAIL="you@example.com"
export T3CODE_BITBUCKET_API_TOKEN="your-token"
# 設完重啟 T3 Code
```

兩個都設了的話，access token 贏。

#### 2.5.4 Azure DevOps

```bash
brew install azure-cli
az extension add --name azure-devops
az login
```

#### 2.5.5 通用

**任何 Git URL** 都能 clone（用 Custom Git URL）。**沒 commit 的本地倉庫**用 **Publish Repository** 動作，一鍵在 GitHub/GitLab/Bitbucket/Azure DevOps 上建倉 + 加 origin + push。

### 2.6 第 6 步：鍵盤快速鍵與 thread 管理

#### 2.6.1 Keybindings

存在 `~/.t3/userdata/keybindings.json`（T3 server 機器上）。T3 Code 啟動時寫入內建預設；以後啟動時增量加新預設——但**不會覆蓋你已宣告的**或**已宣告同 shortcut 的**。檔案非法時整檔忽略，server log 警告。

格式：

```json
[
  { "key": "mod+g", "command": "terminal.toggle" },
  { "key": "mod+shift+g", "command": "terminal.new", "when": "terminalFocus" }
]
```

`key` 支援 `mod`（macOS=cmd，其他=ctrl）、`cmd`/`meta`、`ctrl`/`control`、`shift`、`alt`/`option`。`when` 支援 `!`、`&&`、`||`、括號；當前可用 context keys：`terminalFocus`、`terminalOpen`、`previewFocus`、`previewOpen`、`modelPickerOpen`（執行時增長，不視為定值）。

評估順序：**陣列順序遍歷，最後一條 key+when 都符合的規則勝出**——跨命令也按順序。

#### 2.6.2 Thread pin 與跨裝置排序

- Pin 一個 thread → 出現在 sidebar 頂部 pinned 區
- 排序**存在 server 端**，**跨你所有連線的裝置同步**
- Web/桌面：拖曳；行動：選單裡的 Move up/Move down
- 舊 server 不認 synced 排序——升級 server

#### 2.6.3 專案圖示自訂

`Settings → Projects → 選專案 → Appearance → Choose a project file`——選 SVG/PNG/ICO/JPEG/GIF/AVIF/WebP。預設自動偵測 `t3.json`、favicon、HTML icon link。

### 2.7 第 7 步：保持 app 與 server 同步

`npm run build` 出來的 client 期望 server 是同版本——**版本不一致會出警告**。警告出現在：

- 當前對話的 message box 上方
- Settings → Connections 那個連線旁邊

修復動作取決於 server 是怎麼啟動的：

| 啟動方式 | 動作 |
|---|---|
| **Linux background service** | 點 **Update server** 按鈕，讓 T3 Code 自己停 → 裝新 → 起 → 重連 |
| **桌面應用啟動** | 在**啟動 server 的桌面 app** 裡點升級 |
| **CLI 跑** | **Copy update command** → 在 server 機器上跑 `npx t3@<client-version>` |

背景服務細節：`npx t3@latest service install/update/status/uninstall`。systemd 單元跑一個**穩定 launcher**（不變），`versions/<exact-version>` 各版本獨立安裝——失敗的 trial 可以**回滾**到上一版本，不用重寫 unit。Launcher 在停舊 server 後**snapshot 整個 SQLite**（含 WAL/SHM）——database migration 跟著版本回滾，**不需要 down migration**。Trial 必須在 120 秒內報 `prepared`，否則 launcher 停 trial → 恢復 snapshot → 記錄 rollback → 啟 A。

### 2.8 第 8 步：Linux 背景服務（讓 server 跑你 logout 之後）

```sh
npx t3@latest service install   # 裝
npx t3@latest service status    # 查
npx t3@latest service update    # 升級/修
npx t3@latest service uninstall # 卸
```

目前需要 **Linux + systemd**。Sign out of T3 Connect **不會**自動卸服務。

---

## 三、歸納總結：8 條核心觀點

把 T3 Code 的設計文、AGENTS.md、架構文件讀完後，可以歸納出 8 條**對 agent 時代的產品形態判斷**。

### 3.1 觀點一：agent harness 是一種新形態的產品，而不是一種 agent 框架

AGENTS.md 第一句：「T3 Code is a minimal GUI for coding agents.」——但它立刻被工具化：包 5 家 provider 的 CLI 行程、跑一個 Node server 收所有執行、用 3 個 client 端遠端控制。

含義：**模型能力夠強後，agent 框架層趨於同質化——真正的差異化在「如何把 agent 跑得久、連得遠、看得清」**。T3 Code 把這條判斷做成了「agent harness control surface」這個**新形態產品**。

**結論**：如果你正在做 coding agent 類工具，**別再卷 agent 框架**——卷執行環境、遠端通道、多端體驗、可觀測性。

### 3.2 觀點二：執行邊界在 server，不在 client

架構文件的「execution boundary」：

> "every provider process, terminal, git operation, and filesystem read happens there, never in the client."

具體落地：

- client **不直接呼叫 provider**——所有 provider 操作都走 `orchestration.dispatchCommand` RPC
- client **不構造 RPC client、retry loop、raw orchestration command**（client-runtime 集中管）
- terminal、git、fs 都在 server

這條劃線讓 T3 Code **能任意切換 client 形態**（再加第 4、第 5 個 client 都不需要改 server 的執行語意）。

**結論**：做多端 agent 產品時，**把執行邊界劃在 server**——別讓 client 跑 provider 行程，否則你每個新 client 都要重新實作 runtime。

### 3.3 觀點三：event sourcing 是 agent 編排的正確結構

server 端編排是 event-sourced：

```
command → decideOrchestrationCommand（純函式）→ events
events → projector → 讀模型（messages、threads、checkpoints、session status）
事件同時 append 到 event store
整個 append + project 在一個 SQL 交易裡
```

**好處**：
- **讀模型不可能和事件日誌長期不一致**——因為它們在同一交易裡
- **失敗回放容易**——dispatch 失敗時重讀事件從 starting sequence 之後 reconcile
- **turn 何時完成** 有一個權威定義：session 離開 `running` 狀態（不是 checkpoint/diff 完成）
- **idempotency** 天然——`processEnvelope` 先查 durable command receipt，重試同 command 是冪等的

**結論**：agent 的「對話 + 工作」雙層結構（使用者訊息 + 工具呼叫 + 檔案 diff + agent 文字）天然適合 event sourcing；不要用 CRUD 狀態機來描述。

### 3.4 觀點四：provider 抽象做在 adapter 層，編排保持純粹

5 個 provider driver + 5 個 adapter 是**兩段**：

- **driver** 宣告 `driverKind` + `configSchema` + `create`（構造 adapter）
- **adapter** 實作 `ProviderAdapter` 協議

`ProviderService` 在最上面——**它不知道 agent 是什麼，只知道 thread**。「thread.turn.start」、「thread.approval.respond」是 client 呼叫的所有原語；「thread.message.assistant.delta」、「thread.session.set」是 server 內部 reactor 產生的事件。

**加新 provider 只需寫一個 driver + adapter + 加到 `BUILT_IN_DRIVERS` 陣列**——不碰 orchestration、contract、client。

**結論**：**complexity belongs at the adapter boundary**（AGENTS.md 原話）——把多樣性關進 adapter，主幹保持純粹。

### 3.5 觀點五：遠端 = 同一條協議 + 多種存取通道，不分裂 runtime

文件原話：「Remoteness is expressed at the connection layer, never by splitting the runtime.」

具體落地：
- 不管 LAN、Tailscale、T3 Connect 還是桌面 SSH 啟動，**T3 server 都是同一份行程**、同一份事件源、同一份 SQLite
- 4 種 access method（直接 / Tailscale / T3 Connect / 桌面 SSH）只是**不同的連線層**
- 3 種 launch method（預跑 server / 桌面 SSH 啟 / client 端用 relay publish）也只是**server 怎麼出現的差異**

**結論**：做遠端 agent 產品時，**協議穩定、連線層多變**——別給每種遠端通道寫一套獨立 runtime。

### 3.6 觀點六：capability-based OAuth 認證比角色認證更適合多端 agent

T3 Code 不用 `admin`/`user` 角色模型，用 OAuth 風格的 scope 字串：

```
orchestration:read / orchestration:operate / terminal:operate /
review:write / access:read / access:write / relay:read / relay:write
```

普通 pairing 給 4 個 client-operation scope + `relay:read`；bootstrap credential 多給 `access:read/write` + `relay:write`。**RPC 每個 method 自己宣告 required scope**——`RPC_REQUIRED_SCOPE` map。

認證流程符合 RFC 6750 (Bearer) + RFC 8693 (Token Exchange) + RFC 6749 (Scope)：
- `POST /oauth/token`（`grant_type=urn:ietf:params:oauth:grant-type:token-exchange`）
- `POST /api/auth/websocket-ticket` 拿 5 分鐘短 ticket，**避免長壽命 token 出現在 WebSocket URL 裡**
- **DPoP-bound** token（proof-of-possession）：relay 用的，**1 小時 TTL**——token 洩漏了沒有 proof key 用不了

**結論**：agent 平台不該用「管理員/普通使用者」二元模型——用 capability scope，每個 RPC method 自己宣告能力需求。

### 3.7 觀點七：獨立 Rust 資源監控 sidecar 比 Node native addon 安全

為什麼不直接用 Node native addon 讀 process counter？文件原話：

> "The cost is one persistent child process and NDJSON serialization. That is a better failure boundary than repeatedly spawning shell utilities or loading native code into Node."

具體落地：
- `native/resource-monitor` 是**獨立 Rust 可執行檔**（`sysinfo` crate），透過 stdin/stdout NDJSON 通訊
- **不是** N-API / `ffi-rs` / dynamic library
- monitor 崩了 **不會污染 Node runtime**——server 可以 supervise、restart、version-check 它
- **同一個協議** 跨 desktop / web / headless server 都用
- **打包簡單**——單平台 binary，**沒有 N-API × Node × Electron ABI 矩陣**

**桌面 Electron 加 Electron 主機端 telemetry**（powerMonitor、app.getAppMetrics、host power state）——透過 inherited fd 4/5 跟 server 通訊，**不走 renderer WebSocket**。

**結論**：需要 OS-level 資料時，**獨立 sidecar + NDJSON 比 Node native addon 更安全**——你的失敗邊界、版本控制、打包複雜度都更優。

### 3.8 觀點八：design philosophy 要寫進 AGENTS.md，不要靠口耳相傳

T3 Code 把設計哲學寫進 `AGENTS.md`（倉庫根目錄），這是它最值得抄的地方之一。摘錄：

```
1. Open at the core
2. Performance without compromise
3. Remote ready
4. Multi-surface
   - Web (2 surfaces: app.t3.codes + npx t3)
   - Desktop (Electron shell)
   - Mobile (React Native)
```

Theo 的「a note from Theo」段尤其值得讀：

> "I like ambitious ideas, simple systems, and software that feels obvious. Do not preserve complexity just because it already exists. Do not introduce machinery because it looks architecturally impressive. Understand the real constraint, then fight for the smallest model that makes the correct behavior unsurprising."

> "Channel both 'measure twice, cut once' and 'yagni'. Fight scope creep."

**結論**：把「我們不做什麼」和「我們為什麼這麼做」明確寫進 AGENTS.md——這是高門檻專案唯一能 scale 的方式。

### 3.9 8 條觀點的關聯結構

```
觀點 1：agent harness 是新形態產品
   ↓ (產品定位)
觀點 2：執行邊界在 server，不在 client
   ↓ (架構基礎)
觀點 3：event sourcing 是 agent 編排的正確結構
觀點 4：provider 抽象在 adapter 層，主幹保持純粹
   ↓ (可擴展性)
觀點 5：遠端 = 同協議 + 多連線層，不分裂 runtime
觀點 6：capability-based OAuth 比角色模型更適合多端
   ↓ (執行品質)
觀點 7：獨立 Rust sidecar 比 Node native addon 安全
觀點 8：design philosophy 寫進 AGENTS.md，不靠口耳相傳
```

觀點 1 是產品判斷，觀點 2/3/4 是工程基礎，觀點 5/6 是可擴展/可運營，觀點 7/8 是工程紀律。少任何一條，整個產品形態會塌。

---

## 四、設計哲學：把 AGENTS.md 讀成一份設計宣言

T3 Code 的設計哲學不是官方「manifesto」——它散在 `AGENTS.md`、`docs/internals/*.md`、architecture 決策記錄裡。把它們彙總起來，得到 6 條**可以獨立判斷決策**的哲學。

### 4.1 哲學 1：Open at the core

**原文**：「T3 Code is truly open. We share our roadmap, we share how we think about things, and of course we share all our code.」

**落地**：

- MIT 協議
- Roadmap 在 GitHub 上
- 內部 `.plans/` 目錄記錄**所有重大決策**（`01-shared-model-normalization.md` → `19-remote-endpoints-hosted-static.md` 完整公開）
- 寫給 agent 的 `AGENTS.md` 也是開源的——**你 fork 後它能直接給新 agent 用**
- 「We work in the open, and should strive to stay that way.」

**判斷依據**：如果連設計過程都不公開，「開源」就是殼子。T3 Code 把「open」做成**可稽核的工程實踐**——`.plans/` 是稽核軌跡，`AGENTS.md` 是行動手冊。

### 4.2 哲學 2：Performance without compromise

**原文**：「Lots of apps have gotten bogged down with bad tech decisions and 'slop'. We have not, and we're proud of the performance of T3 Code. We regularly audit for performance regressions, often caused by sending too much data over websockets, css animations causing gpu spikes, lists being hard to render, and more.」

**落地**：

- WebSocket 流量稽核——**不要往 ws 發太多資料**
- CSS 動畫稽核——**不要持續重繪**
- 大列表渲染稽核
- **No continuously repainting animations; they peg the GPU on high-refresh displays.**（AGENTS.md 原話）
- T3 Code 使用者**整天跟 agent 幹活**——「a dropped frame, a lying spinner, and a stale label」都會被注意到

**判斷依據**：agent 的 chat UI 經常是「長期掛著」的——效能問題會從微小摩擦變成持續沮喪。效能不是 nice-to-have，是使用者留存。

### 4.3 哲學 3：Remote ready

**原文**：「The architecture of T3 Code's websocket layer (npx t3) enables a lot of awesome remote features. These have become core to the product.」

**落地**：

- 4 種 access method（直接 / Tailscale / T3 Connect / 桌面 SSH）共用一條 Effect RPC WebSocket
- 4 種 launch method（預跑 / 桌面 SSH 啟 / client 端 publish）只是 server 怎麼出現的差異
- Tailscale 是 endpoint provider（add-on），**不是獨立 runtime 概念**
- WebSocket 用 **5 分鐘短 ticket** 認證（不把長壽命 token 放 URL）
- 任何「新功能」必須考慮「遠端場景下能 work 嗎」

**判斷依據**：agent 是 24×7 跑的——使用者不會守在編輯器前。**remote 不是附加功能，是核心能力**。架構早做對，比事後補便宜。

### 4.4 哲學 4：Multi-surface

**原文**：「T3 Code has 3 key app surfaces: web, desktop, and mobile.」

**落地**：

- **Web 實際上是兩個 surface**：`app.t3.codes` 託管 + `npx t3` 本地跑——**兩個都要支援**
- Desktop 是 Electron 殼，**載入 web bundle over `t3code://` 協議**
- Mobile 是 React Native（**同一份 `packages/client-runtime`**）
- `apps/web` 和 `apps/mobile` 的 `connection/runtime.ts` **逐行鏡像**（除了 platform-specific 背景活動層）

**判斷依據**：使用者**不會只用一種裝置**——桌面幹活、手機盯進度、平板看 PR 評審。**多端是真實分佈**，不是「加一個 native app 就完事」。

### 4.5 哲學 5：Complexity belongs at the adapter boundary

**原文**：「Complexity belongs at the adapter boundary. Orchestration stays pure, UI stays dumb.」

**落地**：

- Orchestration 層的 `decider.ts` **純函式**——`(command, state) => events`，無副作用
- 5 個 provider adapter 把 5 種 CLI 協議的差異**關進各自檔案**
- Effect 重度使用在 server，**React components never construct transports, retry loops, or RPC clients**（client-runtime 包了）
- UI 元件是 dumb 的——**domain state 是 Atom 工廠**（`createProjectEnvironmentAtoms`、`createThreadEnvironmentAtoms`）

**判斷依據**：**純函式核心 + 副作用邊緣**是軟體工程的銀彈——可測試、可推理、可演化的部分最大，混亂的部分被壓縮在邊界。

### 4.6 哲學 6：Event-sourced truth

**文件**：「Orchestration is event-sourced. The server does not mutate app state directly. Clients dispatch typed commands; the engine turns them into persisted events; projections derive the read model.」

**落地**：

- **read model 跟 event log 同一 SQL 交易**——讀模型不可能「長期不一致」
- `processEnvelope` 先查 **durable command receipt**——重試冪等
- **turn 完成** 有權威定義：session 離開 `running`（不是 checkpoint/diff 完成）
- 3 個 queue-backed worker（`ProviderRuntimeIngestion` / `ProviderCommandReactor` / `CheckpointReactor`）基於 `DrainableWorker`——**enqueue 原子 + 計數原子**
- **runtime receipts 是 test-only**——`RuntimeReceiptBusLive` 在生產 no-op，只有 test layer PubSub-backed

**判斷依據**：agent 系統天然有「長流程 + 多步 + 易重試 + 工具副作用」——event sourcing 是這種系統的**最自然骨架**。**「requested」想成「意圖被記錄」，「completed」想成「結果被套用」，「receipt」想成「測試用的非同步里程碑」**（glossary 原文）。

### 4.7 哲學小結：6 條哲學構成 T3 Code 的設計宣言

| 哲學 | 一句話 | 落地表現 |
|---|---|---|
| 1. Open at the core | 設計過程也公開 | MIT + `.plans/` 決策公開 + AGENTS.md 開源 |
| 2. Performance without compromise | 效能是使用者留存 | WebSocket 流量稽核 + 動畫稽核 + 列表渲染稽核 |
| 3. Remote ready | 遠端不是附加功能 | 4 種 access 共用 1 協議 + 5 分鐘短 ticket |
| 4. Multi-surface | 真實多端 | Web (2) + Desktop + Mobile 共用 client-runtime |
| 5. Complexity at adapter boundary | 純函式核心 + 邊緣副作用 | decider 純函式 + 5 provider adapter + UI dumb |
| 6. Event-sourced truth | 讀模型不可能不一致 | 指令 → 事件 → 投影（同一交易）+ 冪等重試 |

**6 條哲學不是獨立的——它們形成一條鏈**：open 讓 fork 容易 → performance 讓使用者留下 → remote 讓 agent 不停 → multi-surface 讓使用者多端用 → adapter 隔離讓 provider 多加 → event-sourcing 讓非同步不亂。**少任何一條，產品形態都不完整**。

### 4.8 一段「a note from Theo」

AGENTS.md 中 Theo 寫的一段話值得單獨引用：

> "I like ambitious ideas, simple systems, and software that feels obvious. Do not preserve complexity just because it already exists. Do not introduce machinery because it looks architecturally impressive. Understand the real constraint, then fight for the smallest model that makes the correct behavior unsurprising."

> "Channel both 'measure twice, cut once' and 'yagni'. Fight scope creep. Try to honor the dev's intent in both a minimal and realistic fashion."

> "The rest of this document is meant to help you navigate the codebase and make changes effectively. Think of these instructions less as 'hard rules', more as 'good defaults'. The developer's preferences should be able to override anything here."

**這條不是技術哲學——是工作哲學**。它解釋了為什麼 T3 Code 選擇**包 5 家 provider 而不造第 6 家**、**寫 event sourcing 而不寫 CRUD**、**用 Rust sidecar 而不寫 Node native addon**——都是因為**最簡單的模型**。

---

## 五、核心思想總結

T3 Code 給出的最重要判斷是：**2026 年，agent 時代的下一個產品形態不是「另一個 agent 框架」，而是「agent harness control surface」——一個能讓你在 5 家 provider 之間自由切換、3 個 client 端任意切換、4 種遠端通道任意切換的本地執行 runtime。**

- **它重新定義了 agent harness**——不是框架，是 control surface；不是單一 provider，是 5 家相容；不是 desktop-only，是 web + desktop + mobile 三端；不是 local-only，是 4 種遠端通道
- **它把「執行邊界」劃在 server**——所有 provider 行程、terminal、git、fs 都在 server；client 永遠不直接呼叫 provider
- **它用 event sourcing 解決 agent 非同步**——command → decider → event → projector（同一 SQL 交易），重試天然冪等，turn 完成有權威定義
- **它把 provider 差異關進 adapter**——5 個 driver + 5 個 adapter，orchestration 主幹保持純粹，加第 6 家 provider 不碰主幹
- **它把遠端做成 4 種 access × 3 種 launch 的矩陣**——同協議 + 多連線層，不分裂 runtime
- **它用 capability scope 認證**——OAuth 2.0 風格（RFC 6750/8693/6749）+ 5 分鐘 WebSocket ticket + DPoP proof-of-possession
- **它用 Rust sidecar 做 OS-level 資源監控**——不污染 Node runtime，跨平台一致協議
- **它把「我們不做什麼」寫進 AGENTS.md**——設計哲學、`.plans/` 決策、Hit-every-surface checklist 全公開

記住它的一句話：**T3 Code 不做 agent，不做模型，不做訂閱——它做的是「agent harness control surface」：讓 Codex/Claude/Cursor/Grok/OpenCode 五家 agent 跑在同一台本地 server 上、被 web/桌面/行動三端從任何地方按你的權限策略控制。**

---

## 附錄 A：參考連結

- [T3 Code GitHub 倉庫](https://github.com/pingdotgg/t3code)
- [T3 Code README](https://github.com/pingdotgg/t3code/blob/main/README.md)
- [T3 Code AGENTS.md](https://github.com/pingdotgg/t3code/blob/main/AGENTS.md)
- [docs/README](https://github.com/pingdotgg/t3code/blob/main/docs/README.md)
- 使用者文件：
  - [Install](https://github.com/pingdotgg/t3code/blob/main/docs/user/install.md)
  - [Permission modes](https://github.com/pingdotgg/t3code/blob/main/docs/user/permission-modes.md)
  - [Remote access](https://github.com/pingdotgg/t3code/blob/main/docs/user/remote-access.md)
  - [Source control](https://github.com/pingdotgg/t3code/blob/main/docs/user/source-control.md)
  - [Keybindings](https://github.com/pingdotgg/t3code/blob/main/docs/user/keybindings.md)
  - [Thread sidebar](https://github.com/pingdotgg/t3code/blob/main/docs/user/thread-sidebar.md)
  - [Project settings](https://github.com/pingdotgg/t3code/blob/main/docs/user/project-settings.md)
  - [Updating](https://github.com/pingdotgg/t3code/blob/main/docs/user/updating.md)
  - [Background service](https://github.com/pingdotgg/t3code/blob/main/docs/user/background-service.md)
- 內部架構：
  - [Architecture overview](https://github.com/pingdotgg/t3code/blob/main/docs/internals/overview.md)
  - [Workspace layout](https://github.com/pingdotgg/t3code/blob/main/docs/internals/workspace-layout.md)
  - [Providers](https://github.com/pingdotgg/t3code/blob/main/docs/internals/providers.md)
  - [Connection runtime](https://github.com/pingdotgg/t3code/blob/main/docs/internals/connection-runtime.md)
  - [Remote architecture](https://github.com/pingdotgg/t3code/blob/main/docs/internals/remote.md)
  - [T3 Connect](https://github.com/pingdotgg/t3code/blob/main/docs/internals/t3-connect.md)
  - [Environment auth](https://github.com/pingdotgg/t3code/blob/main/docs/internals/environment-auth.md)
  - [Server updates](https://github.com/pingdotgg/t3code/blob/main/docs/internals/server-updates.md)
  - [Resource telemetry](https://github.com/pingdotgg/t3code/blob/main/docs/internals/resource-telemetry.md)
  - [Glossary](https://github.com/pingdotgg/t3code/blob/main/docs/internals/glossary.md)
  - [CI gates](https://github.com/pingdotgg/t3code/blob/main/docs/internals/ci.md)
- [Mobile README](https://github.com/pingdotgg/t3code/blob/main/apps/mobile/README.md)
- 下載：[GitHub Releases](https://github.com/pingdotgg/t3code/releases) · `winget install T3Tools.T3Code` · `brew install --cask t3-code` · `yay -S t3code-bin`
- 線上：[app.t3.codes](https://app.t3.codes) · iOS App Store · Google Play
- 社群：[Discord](https://discord.gg/jn4EGJjrvv)
