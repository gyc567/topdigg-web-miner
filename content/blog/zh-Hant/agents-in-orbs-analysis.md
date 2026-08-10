---
title: "Agents in Orbs 深度解析（Amp 官方）：把 agent 放進無監督的遠端機器——從 `amp -ox` 到託管式雲端開發，以及「編碼 agent 已死」之後的世界（專案說明 + 完整教學 + 設計哲學）"
description: "以 Amp（ampcode.com，Sourcegraph 團隊背景）官方公告《Agents in Orbs》（Chronicle 新聞，2026-06-30）為藍本，完整解析 Amp 的 Orbs 功能：**遠端機器上無監督執行的 agent**。核心思想：**模型想寫程式碼、執行程式碼，甚至在你不在電腦前的時候**——2026 年 2 月 Amp 宣告『編碼 agent 已死』並殺掉了自家 VS Code/Cursor 編輯器擴充功能，把模型從編輯器側欄解放出來；4 個月後 Orbs 上線：每個新執行緒都得到一個全新的 orb（含程式碼、外掛程式、工具），按分鐘計費（a1.tiny→a1.xxlarge，$0.08-$1.32/小時），5 分鐘無活動自動暫停（暫停不收費）。四個入口：web（Create New Thread + 選 Project）、CLI（`amp -ox \"提示詞\"`）、TUI（`thread: new in orb`）、外掛程式（`agent.createThread({ executor: 'orb' })`）。核心體驗：① 遠端但如本機——可審閱變更、瀏覽檔案、共用 tmux 終端（終端與 agent 共用檔案系統，變更立即對 agent 可見）；② `amp sync <thread>` 把 orb 內變更鏡像到本機 checkout，agent 繼續遠端工作；③ `amp -ox --orb-size` 指定機器大小；④ 生命週期掛鉤 `.agents/setup`（裝依賴/準備產生檔案）與 `.agents/resume`（冪等恢復，阻塞最多 10 秒）；⑤ Portals（認證 URL 暴露 orb 內 Web 服務）與 Webhooks（外部事件喚醒 orb）。『Things change』：當啟動一個不在你機器上的 agent 變得和本機 agent 一樣簡單時，你會用得更多——並行調查 8 個 bug、把 bug 報告變成 agent 與調查而非 ticket、跑長期效能最佳化、不搶佔本機記憶體的測試工作流程。『Time to find out』：未來大量程式碼將在無人監督下由 agent 寫成；有些程式碼永遠需要本機、近距離監督、反覆往返，但模型能獨立寫/跑/測/發布的部分只會增長——把模型限制在單台機器上就是在拖它們後腿。文章包含：專案說明、核心思想、完整教學（四入口 + 功能 + 定價 + 生命週期掛鉤 + Portals/Webhooks/Docker/OIDC）、設計哲學六條、10 條歸納總結的觀點。"
date: "2026-08-10"
author: "TopDigg Research Team"
tags: ["Agents in Orbs", "Amp", "ampcode", "Remote Agents", "Orbs", "Unsupervised Agents", "Cloud Development", "Agent Architecture", "Sourcegraph", "amp -ox", "amp sync", "Coding Agent", "E2B"]
categories: ["Deep Dive"]
keywords: ["Agents in Orbs", "Amp", "ampcode", "遠端 agent", "無監督 agent", "orb", "amp -ox", "amp sync", "雲端開發", "編碼 agent 已死", "E2B", "按分鐘計費", "生命週期掛鉤", "Portal", "Webhook"]
---

# Agents in Orbs 深度解析（Amp 官方）：把 agent 放進無監督的遠端機器——從 `amp -ox` 到託管式雲端開發

> 核心思想：**模型想寫程式碼、執行程式碼，甚至在你不在電腦前的時候。** Amp（ampcode.com，Sourcegraph 團隊背景）在 2026 年 2 月宣告「編碼 agent 已死」（The Coding Agent Is Dead）——新一代模型讓「包裝在模型周圍的 agent（提示詞與工具）」不再是限制因素，瓶頸轉移到了**程式碼庫如何為 agent 組織、組織如何使用它們**。於是 Amp 殺掉了自家 VS Code/Cursor 編輯器擴充功能，把模型從編輯器側欄解放出來。2026 年 6 月 30 日，**Orbs** 上線：**遠端機器上可以無監督執行的 agent**。建立一個新執行緒，你就得到一個全新的 orb——裡面裝著你需要的程式碼、外掛程式和工具。Orbs 按分鐘計費（a1.tiny 到 a1.xxlarge，$0.08-$1.32/小時），啟動快，你和 agent 不再需要它時自動休眠。關鍵轉變：**當啟動一個不在你機器上的 agent，變得和你管理本機 agent 的介面一模一樣、就在本機 agent 旁邊、用完全相同的控制時，事情就變了**——你會用得更多，也會用在做以前沒想過的事上：並行調查八個 bug、把 bug 報告變成 agent 與調查而不是 ticket、跑不佔本機 CPU 的長期效能最佳化。Amp 的信念：**未來大量程式碼將這樣被寫出來——這不止是又一步，而是跨過了一道重要門檻。**

---

## 一、專案說明

### 1.1 它是什麼？

本文解析的是 **Amp（ampcode.com）官方公告《Agents in Orbs》**，發布於其 **Chronicle 新聞欄目，2026-06-30**。Amp 是一個面向 AI 編碼的 CLI/終端工具（擁有 Sourcegraph 團隊背景），其口號與原則：不限制 token 用量、始終使用最好的模型、給你原始模型能力、隨新模型演化而進化。

**Orbs 是 agent 可以無監督執行的機器。** 當你建立一個新執行緒時，你會得到一個全新的 orb，裡面包含 agent 可能需要的程式碼、外掛程式和工具。它不在你的機器上執行，但你可以像控制本機 agent 一樣控制它：審閱變更、瀏覽檔案、用終端。

公告同時是**一篇產品發布 + 一篇哲學宣言**：前半段（Remote and Yet So Near / Things Change）講功能與用法，後半段（Time to Find Out）接續 2 月的《The Coding Agent Is Dead》論述**為什麼這跨過了一道重要門檻**。

### 1.2 關鍵資料與資訊

- 作者/管道：Amp 官方 Chronicle 新聞欄目（ampcode.com），2026-06-30
- 前置宣言：《The Coding Agent Is Dead》（2026-02-19）——模型不再是限制因素；殺死編輯器擴充功能
- 定義：**Orb = 遠端機器，agent 可無監督執行**；每個從 ampcode.com 啟動的執行緒都有專屬 orb
- 四個啟動入口：web（ampcode.com 建立新執行緒）、CLI（`amp -ox "提示詞"`）、TUI（`thread: new in orb`）、外掛程式（`agent.createThread({ executor: 'orb' })`）
- 計費：按分鐘計費，暫停的 orb 不收費；5 分鐘無活動自動暫停；執行緒封存立即暫停
- 規格與價格：`a1.tiny` 1 CPU/2GB/$0.08·h⁻¹ → `a1.small` 2 CPU/4GB/$0.17·h⁻¹ → `a1.medium` 4 CPU/8GB/$0.33·h⁻¹ → `a1.large` 8 CPU/16GB/$0.66·h⁻¹ → `a1.xxlarge` 16 CPU/32GB/$1.32·h⁻¹（企業工作區價格上浮 50%）
- 系統：Debian 12，預裝 `gh`/`amp`/Git/SSH/tmux/ffmpeg/ImageMagick/vim/jq/fzf/ripgrep/Bun/Node.js/npm/pnpm/Yarn/Python/pip/agent-browser 等
- 基礎設施提示：portal 域名帶 `onamp.dev`，Vite 疑難排解提到 `.e2b.app`（E2B 沙盒技術背景）
- 生命週期掛鉤：`.agents/setup`（準備 orb 狀態）、`.agents/resume`（冪等恢復，Amp 最多阻塞 10 秒）
- 相關新聞：《Agents, Everywhere》——從 web、CLI 與行動端觀看並驅動 agent

### 1.3 它解決什麼問題？

公告回答的核心問題：**當模型強大到不再需要編輯器側欄的手把手指導時，我們該把 agent 放到哪裡去跑？**

- **本機資源衝突問題**：多個 agent 同時跑會搶 CPU/記憶體；Orbs 把 agent 挪到遠端機器，本機不再有資源衝突。
- **監督瓶頸問題**：模型「想寫程式碼並執行，甚至在你不在編輯器前的時候」；把模型鎖在側欄（或單機）是在限制它們。
- **長期執行問題**：長期效能最佳化、完整測試工作流程以前會吃掉你的 CPU；在 orb 裡跑既不衝突也不偷走本機 agent 的記憶體。
- **規模化並行問題**：八個 bug 想並行調查？以前要 checkout、worktree、SSH 手工搭遠端主機；現在 `amp -ox` 一下即可。

它的答案：**一個按分鐘計費、自動休眠、與本機 agent 同介面同控制的託管式遠端 agent 執行環境。**

---

## 二、核心思想

### 2.1 一句話世界觀

> **"We believe that is how a lot of code will be written in the future. We believe that this is not just another step, but a step over an important threshold."**
> （**我們相信未來大量程式碼將這樣被寫出來。我們相信這不只是又一步，而是跨過一道重要門檻。**）

### 2.2 從「編碼 agent 已死」到「把模型放歸曠野」

2 月的宣言奠定了哲學地基：**「當前這一代編碼 agent 已死。心臟還在跳動，但子彈已經出膛。」** 新一代模型（如 GPT-5.3 Codex）已經「完全訓練好了怎麼當編碼 agent」——一個簡單的 `bash` 工具往往就夠，模型靠蠻力就能出好結果。因此：

> **"How you organize your codebase for agents, how your organization uses them — those are now the bottlenecks."**
> （**你如何為 agent 組織程式碼庫、你的組織如何使用它們——這些才是現在的瓶頸。**）

所以 Amp 殺掉了編輯器擴充功能：「透過把這些新模型留在編輯器側欄裡，我們限制了它們。它們現在遠不止是助手。它們不再需要手把手，真的想甩掉輔助輪。**它們想寫程式碼並執行，即使你不在編輯器前。**」 Orbs 就是這個信念的落地：連「坐在電腦前」這個前提也拿掉了——**「別管編輯器了，現在我們甚至可以在你不在電腦前的時候讓 agent 執行。」**

### 2.3 Orbs 的互動模型：遠端但如近在咫尺（Remote and Yet So Near）

Orbs 的核心體驗矛盾是：**agent 不在你的機器上，但控制起來就像在本機一樣。**

- 你可以審閱變更、瀏覽 orb 上的檔案；
- 你可以用終端（終端與 agent 共用同一 tmux 工作階段和檔案系統，變更立即對 agent 可見）；
- 想與 agent 並行迭代時，`amp sync <thread>` 把 orb 的變更鏡像到本機 checkout；
- 像 `amp -x` 產生新執行緒一樣，`amp -ox` 在 orb 裡產生執行緒；
- 你甚至不用離開 Amp TUI 就能產生一個活在 orb 裡的 agent。

### 2.4 「Things change」：當門檻被跨過，行為改變

**在 orb 出現之前，多 agent 並行也並非不可能**——不同的 checkout、worktree、手工 SSH 到遠端主機。但「當啟動一個不在你機器上的 agent，變得如此容易——就在你管理本機 agent 的同一個介面裡、緊挨著本機 agent、用完全相同的控制」時：

- **你會用得更多**：沒有本機資源衝突，為什麼不並行派一組 agent 獨立調查八個不同的 bug？
- **你會重新定義工作單元**：為什麼不把 bug 報告變成「一個 agent + 一次調查」，而不是一張 ticket？為什麼不管理 agent 和它的結果，而是管理 ticket？
- **你會啟用以前想都沒想過的用法**：為什麼不派一個 agent 跑很長時間、試遍所有可能的效能最佳化——反正不佔你的 CPU？為什麼不讓 agent 跑完整測試工作流程——反正不搶本機 agent 的記憶體？為什麼不建那個原型？為什麼不追那個登月計畫？**為什麼不試試？**

### 2.5 「Time to find out」：放手讓它們跑

> **"At this point, we hold them back if we require them to do it all on a single machine. And once you let them loose in orbs, you realize how constrained they've been."**
> （**到這一步，如果我們要求它們在單台機器上完成一切，就是在拖它們後腿。而一旦你把它們放進 orbs 放歸曠野，你會意識到它們一直被限制得多厲害。**）

Amp 誠實地承認不知道「這究竟會如何展開」：**有些程式碼大概永遠會在本機、在近距離監督下、帶著大量來回往返被建立**。但模型能獨立「寫 + 跑 + 測 + 發布」的程式碼量只會增長。結論是行動而非空談：**「Time to find out how far they can go.」（是時候看看它們能走多遠了。）**

---

## 三、詳細教學：從四個入口到生產級 orb 配置

### 3.1 概念：一個 orb 裡到底有什麼？

- 系統：Debian 12
- 預裝：認證過的 `gh` 與 `amp`；Git 與 SSH；tmux、ffmpeg、ImageMagick、vim、jq、fzf、unzip、zstd、lsof、websocat；ripgrep；Bun、Node.js、npm、pnpm、Yarn；Python 與 pip；agent-browser
- 系統套件用 `apt`/`apt-get` 安裝；JavaScript 依賴用 `pnpm`
- 私有儲存庫複製：GitHub 用你的 GitHub 連線；GitLab/Bitbucket/自建伺服器透過 Secrets & Env Vars 提供複製憑證（`GIT_CONFIG_*` URL 重寫插入存取權杖）

### 3.2 入門：四個啟動入口

| 入口 | 操作 | 適用情境 |
|------|------|---------|
| **Web** | ampcode.com → Create New Thread → 選 Project → 輸入提示詞 → 提交 | 臨時任務、分享執行緒 |
| **CLI** | `amp -ox "提示詞"`（execute 模式在 orb 中開執行緒） | 腳本化、快速啟動 |
| **TUI** | 指令面板 `thread: new in orb` | 保持正常終端工作流程 |
| **外掛程式** | `agent.createThread({ executor: 'orb' })` | 程式化編排 |

啟動後：**產生一個新 orb → 複製你的儲存庫 → 在其中啟動 agent。**

### 3.3 功能速查

**Review & File Access**：不先同步到筆電就能審閱 agent 的變更、瀏覽檔案。

**Terminal（終端窗格）**：在 orb 執行緒裡選 Terminal 窗格，直接開啟 orb 內的 shell。終端與 agent **共用 orb 的檔案系統和工作副本**——你可以檢查/編輯檔案、加本機配置、裝依賴、跑測試、除錯程序；檔案系統變更**立即對 agent 可見**。終端執行在與 agent 共用的 **tmux 工作階段**中，agent 能看到終端輸出並在同一 shell 工作階段裡協作。

**`amp sync <thread>`**：把 orb 執行緒的變更鏡像到本機 checkout，**agent 繼續遠端工作**。`<thread>` 可以是執行緒 URL 或 ID。

**`amp -ox` 進階**：`amp -ox "提示詞" --orb-size a1.small` 用非專案預設的規格啟動；也可以讓 agent 自己建立更小/更大的 orb 執行緒。

**Project 選擇（TUI）**：`project: select` 選擇下一個 orb 執行緒的專案；`project: create` 建立新專案。

### 3.4 定價模型：按分鐘計費 + 自動休眠

| 規格 | CPU | 記憶體 | 磁碟 | 價格 |
|------|-----|------|------|------|
| `a1.tiny` | 1 | 2GB | 40GB | $0.08/小時 |
| `a1.small` | 2 | 4GB | 40GB | $0.17/小時 |
| `a1.medium` | 4 | 8GB | 40GB | $0.33/小時 |
| `a1.large` | 8 | 16GB | 40GB | $0.66/小時 |
| `a1.xxlarge` | 16 | 32GB | 40GB | $1.32/小時 |

- 每個專案可在專案設定裡選預設 orb 規格；Megawatt 訂閱者的個人專案預設 `a1.small`
- **按分鐘計費；暫停的 orb 不花一分錢**
- **5 分鐘無活動自動暫停；執行緒封存立即暫停**；永遠不需要手動暫停（企業工作區價格上浮 50%）

### 3.5 Secrets & Env Vars：三優先順序覆蓋

- **工作區級**（如果在工作區內）套用於每個 orb，包括個人專案
- **專案級**覆蓋工作區的同名條目
- **個人級**覆蓋專案與工作區

`amp secrets` 可從 CLI 管理；`amp secrets history` 顯示變更歷史（**永不包含值**）；Amp 記錄每條目的建立者與最後修改者。一次性變更可直接用 Terminal 窗格編輯。

### 3.6 OIDC Workload Identity：短時權杖替代長期憑證

Orb 可以鑄造一個標識其**工作區、專案、使用者與執行緒**的短時 OIDC 權杖，用來與雲端廠商/內部服務聯合，而不是在專案設定裡放長期憑證：

```bash
amp orb id-token --audience my-service
```

`audience` 必須標識將驗證權杖的服務。手冊提供 Google Cloud、Tailscale 與 AWS 的完整聯合配方。

### 3.7 生命週期掛鉤：`.agents/setup` 與 `.agents/resume`

把檔案放進儲存庫、提交、保持簡短。Amp 從儲存庫根目錄把這兩個檔案作為**儲存庫生命週期掛鉤**執行：

| 檔案 | 作用 | 日誌 |
|------|------|------|
| `.agents/setup` | 準備專案 orb 狀態時執行：裝依賴、準備產生檔案、檢查所需工具（需可執行位） | `/home/user/.cache/amp/logs/setup.log` |
| `.agents/resume` | 現有 orb 恢復、agent 繼續工作前執行：快速冪等的重連/修復步驟（如重新啟動隧道）；**Amp 最多阻塞 10 秒**，逾時則讓其在 orb 內繼續跑 | `/home/user/.cache/amp/logs/resume.log` |

最小 `.agents/setup` 範例：

```bash
#!/usr/bin/env bash
set -euo pipefail

corepack enable
pnpm install --frozen-lockfile
[ -f .env.local ] || cp -- .env.example .env.local
```

```bash
chmod +x .agents/setup
```

最小 `.agents/resume` 範例（只做快速冪等修復，不裝依賴）：

```bash
#!/usr/bin/env bash
set -euo pipefail

mkdir -p .amp
date > .amp/resume-last-ran.txt
```

**重點**：`.agents/resume` 阻塞最多 10 秒；視窗內若以非零退出則先浮出失敗再繼續；超過 10 秒則繼續並讓掛鉤在 orb 裡跑完——**把進度和診斷寫進日誌，別指望 agent 等待**。

### 3.8 Webhooks：外部事件喚醒 orb

Amp 外掛程式可以建立**公用 HTTP 端點**儲存事件並喚醒其 orb——當 GitHub 等外部服務需要在 orb 裡開始工作時用 webhook（與 Portal 不同：webhook **不暴露** orb 內執行的伺服器）。

```ts
const { url } = await amp.createWebhook({
	key: 'github-events',
	headers: ['x-hub-signature-256'],
	handler: async (event, ctx) => {
		await verifyAndApply(
			event.id,
			event.body,
			event.headers['x-hub-signature-256'],
			ctx.signal,
		)
	},
})
```

關鍵語意：註冊屬於 orb 執行緒/外掛程式/key；相同 key 跨外掛程式重載與 orb 重啟保持同一 URL；**請求先儲存再回傳 HTTP 202**（202 = 已排隊，不代表 handler 完成）；**至少一次投遞**——用 `event.id` 防重送；handler 有 30 秒完成時限；超長工作放持久佇列或另開執行緒。每端點突發 10 個新事件、每分鐘補 10 個，超限回傳 HTTP 429 帶 `Retry-After`；請求體上限 1MB。**把 webhook URL 當作密碼**：任何人持有它都能未經登入提交事件——別提交進儲存庫、別寫進執行緒訊息或一般日誌；封存所屬執行緒會暫停 orb 並使 URL 回傳 404。Amp **不驗證**外部服務的簽章——把簽章/授權標頭加進 `headers`、把對應金鑰放進專案設定並自己驗證；**永遠不要把 webhook 文字未經驗證就當 agent 指令**。

### 3.9 Portals：把 orb 裡的 Web 服務帶出來

Portals 是**經過認證的 URL**，暴露 orb 內執行的 Web 伺服器——直接從執行緒的 Portal 標籤開啟 dev server 或預覽應用程式。最簡單：直接讓 agent「啟動 dev server 並給我一個 portal 連結」。

宣告服務（通常 agent 會幫你寫這個檔案）——提交 `.amp/services.yaml`：

```yaml
services:
  web:
    command: pnpm dev
    portal:
      title: App
      description: Use the seeded test account.
```

- `amp orb services ensure` 以受監督方式啟動每個宣告的服務（在 Amp CLI 更新與 orb 暫停/恢復後存活）；每條命令以 `$PORT` 執行並須監聽該連接埠；帶 portal 的服務還收到公用 URL 作為 `$PUBLIC_URL`
- 改原始碼/命令/依賴後 `amp orb service restart <name>`（不改連接埠與 portal 設定）
- 臨時服務：`amp orb service start <name> --command '<command>'`
- **存取控制**：只有能查看該執行緒的人能存取其 portals——「所以你不需要用 Tailscale 來限制存取」；任何對 portal 的 HTTP 請求都會喚醒暫停的 orb 並恢復計費直到再次暫停
- **orb 內部回環（hairpin）**：在所屬 orb 內部，對該執行緒 portal URL 的請求直接回環到本機服務而不離開 orb——`$PUBLIC_URL` 對 orb 內的 curl/Node/Python/瀏覽器自動化開箱即用，無需額外認證

**Vite dev server 配方**：Amp 在每個 orb 裡設定 `AMP_ORB=1`；dev server 需接受任意 host（Vite 用 `allowedHosts: process.env.AMP_ORB ? true : undefined`）——注意只用 orb 內，別在 orb 外放開所有 host。

**Dev Magic Link 認證配方**：agent 沒有密碼管理員也沒有電子郵件收件匣，無法完成 OAuth/郵件 magic link 登入——加一個僅開發用的登入路由（`GET /__dev/log-me-in/<email>?returnTo=<path>`），只接受同源相對路徑以防開放重新導向，`NODE_ENV` 為 production 時回傳 404，把路由 URL 寫進 `AGENTS.md` 讓 agent 找到。

### 3.10 Docker in Orbs

在儲存庫的 `.agents/setup` 裡安裝 Docker（apt 來源 + docker-ce 全家桶），然後以受監督 orb 服務方式啟動 daemon：

```bash
amp orb service start docker-daemon --command 'sudo dockerd'
sudo docker run hello-world
```

要共用容器化 Web 伺服器：用 `-p` 發布連接埠，再用 portal 暴露該連接埠。

### 3.11 實戰工作流程範例

**並行 bug 調查**：

```bash
amp -ox "Investigate why the latest CI run on 'main' failed"
amp -ox "Check the flaky test in payments module"
amp -ox "Profile the memory leak in the worker queue"
```

**與 agent 並行迭代**：agent 在 orb 裡跑，本機 `amp sync <thread>` 拉取變更繼續手改，再讓 agent 繼續。

**長期任務**：`a1.small` 起步跑效能最佳化，結束後暫停不花錢。

---

## 四、設計哲學

### 4.1 「編碼 agent 已死」：模型是主角，腳手架是臨時的

Amp 最激進的設計哲學來自 2 月宣言：**當前這一代編碼 agent（提示詞 + 工具的包裝）已死**——新模型已經「完全訓練好了怎麼當編碼 agent」，簡單的 `bash` 就夠，蠻力即可。因此**真正的瓶頸不是 agent 框架，而是程式碼庫如何為 agent 組織、組織如何使用它們**。這與「agent 框架軍備競賽」的主流敘事相反：Amp 把賭注押在模型能力 + 執行環境（Orbs）上，而不是更聰明的腳手架。

### 4.2 自我毀滅式的演化：殺死自家編輯器擴充功能

「編碼 agent 已死」的推論是對**自家產品**下手：Amp 編輯器擴充功能（VS Code/Cursor）在 2026 年 3 月 5 日**自毀**（"The Amp editor extensions will self-destruct on March 5 at 8pm Pacific Time"）。哲學邏輯：**把模型留在編輯器側欄 = 限制模型**；「它們不再需要手把手，真的想甩掉輔助輪」。連 CLI 都被定位為**梯子**——「用它爬到下一層，然後我們可能就不再需要它」。Amp 自述：「它可能也會自毀。」 這是**反對局部最佳**的工程立場：停在當前成功的架構上 = 坐在局部最大值上看著前沿越來越遠。

### 4.3 監督是選擇，不是預設

從「編輯器側欄裡的助手」到「orb 裡無監督執行的 agent」，Amp 的設計隱含一個判斷：**監督的程度應由任務決定，而不是由工具型態決定**。有些程式碼永遠需要本機、近距離監督、大量往返——但大量程式碼將由 agent 獨立寫/跑/測/發布。**把單機要求強加給所有 agent = 拖它們後腿**。遠端機器 + 按分鐘計費 + 自動休眠，是「讓 agent 自己跑」這個選擇的經濟學配套：放任但不浪費。

### 4.4 「同一介面，同一控制」：遠端透明性

Orbs 的設計原則是**消除遠端與本機之間的認知摩擦**：同一 TUI、同一控制、緊挨著本機 agent。遠端不是另一個世界，而是同一個工作流程的延伸。`amp sync` 的存在進一步說明：**本機與遠端是同一份工作的一體兩面**——agent 在 orb 裡跑，你在本機改，同步讓兩者合一。

### 4.5 「為什麼不試試？」：成本下降釋放行為變化

哲學上最動人的一段是 Things Change：**當啟動遠端 agent 的成本（認知 + 金錢 + 資源衝突）趨近於零，行為就改變了**。八個並行調查、bug 報告變 agent、長期最佳化任務、原型與登月計畫——這些不是因為「新增了功能」，而是因為**一個門檻被跨過**。按分鐘計費 + 自動暫停讓「讓 agent 跑很久」從奢侈變成預設；"Why not?" 成為預設心態。

### 4.6 誠實面對不確定性：「Time to find out」

Amp 沒有假裝知道未來：「**這究竟會如何展開我們不知道。**」但它給出了明確的方向性判斷（大量程式碼將無監督產生）和一個可證偽的行動（把 agent 放歸曠野，看它們能走多遠）。這是一種**假設驅動的產品哲學**：不是先證明再放開，而是先放開、用真實使用來發現邊界——「一旦你把它們放進 orbs 放歸曠野，你就會意識到它們一直被限制得多厲害」。

---

## 五、歸納總結：觀點與結論

### 5.1 核心觀點清單

1. **Orbs 定義**：遠端機器上 agent 可以無監督執行的執行環境；每個執行緒一個專屬 orb（程式碼 + 外掛程式 + 工具），按分鐘計費，5 分鐘無活動自動暫停。
2. **起點是模型，不是腳手架**：「編碼 agent 已死」——新模型已完全訓練好怎麼當編碼 agent；瓶頸轉移到程式碼庫組織與組織使用方式。
3. **殺死自家擴充功能**：編輯器側欄 = 限制模型；Amp 在 3 月 5 日讓自家 VS Code/Cursor 擴充功能自毀，轉向 CLI，再轉向 Orbs。
4. **遠端但如近在咫尺**：同介面、同控制、緊挨本機 agent；審閱變更、瀏覽檔案、共用 tmux 終端、`amp sync` 雙向同步。
5. **四個入口**：web（Create New Thread）、CLI（`amp -ox`）、TUI（`thread: new in orb`）、外掛程式（`agent.createThread({ executor: 'orb' })`）。
6. **經濟學配套**：按分鐘計費 + 自動休眠 = 「放任但不浪費」；暫停的 orb 不花錢，永遠不需要手動暫停。
7. **生命週期掛鉤**：`.agents/setup`（準備）與 `.agents/resume`（冪等恢復，阻塞最多 10 秒）把「為 orb 準備程式碼庫」變成儲存庫內可提交、可稽核的工程實踐。
8. **外部整合**：Webhooks（事件喚醒 orb，至少一次投遞 + 冪等 key + URL 當密碼）與 Portals（認證 URL 暴露 orb 內服務，內部回環免認證）讓 orb 成為更大系統的一部分。
9. **行為改變**：當遠端啟動 agent 足夠容易，你會用得更多——並行調查、bug 變 agent、長期最佳化、完整測試工作流程、原型與登月計畫；"Why not?" 成為預設心態。
10. **跨過門檻**：未來大量程式碼將在無人監督下寫成；把模型限制在單台機器 = 拖後腿；有些程式碼永遠需要本機監督，但獨立寫/跑/測/發布的比例只會增長——「是時候看看它們能走多遠了」。

### 5.2 關鍵金句（值得 memo 的）

- "The current generation of coding agents is dead. The heart is still beating, yes, but the bullet has already left the chamber."（**當前這一代編碼 agent 已死。心臟還在跳動，但子彈已經出膛。**）
- "They want to write code and run even when you're not sitting in front of your editor."（**它們想寫程式碼並執行，即使你不在編輯器前。**）
- "How you organize your codebase for agents, how your organization uses them — those are now the bottlenecks."（**你如何為 agent 組織程式碼庫、你的組織如何使用它們——這些才是現在的瓶頸。**）
- "Never mind the editor, now we can let our agents run even when we're not sitting at our computer."（**別管編輯器了，現在我們甚至可以在你不在電腦前的時候讓 agent 執行。**）
- "At this point, we hold them back if we require them to do it all on a single machine."（**到這一步，如果我們要求它們在單台機器上完成一切，就是在拖它們後腿。**）
- "Once you let them loose in orbs, you realize how constrained they've been."（**一旦你把它們放進 orbs 放歸曠野，你會意識到它們一直被限制得多厲害。**）
- "Why not turn a bug report into an agent and an investigation instead of a ticket?"（**為什麼不把 bug 報告變成 agent 與調查，而不是一張 ticket？**）
- "Time to find out how far they can go."（**是時候看看它們能走多遠了。**）
- "It's not a stop, but a ride. And it might self-destruct too."（**它不是站點，而是旅程。而且它可能也會自毀。**）

### 5.3 與本站其他深度解析的銜接（讀者下一步）

- **The Art of Loop Engineering（LangChain 官方）**（`loop-engineering-langchain`）：LangChain 的第三層「事件驅動迴圈」討論「agent 成為更大系統裡持續執行的元件」——Orbs 就是這一層的具體執行環境型態（webhook 喚醒、cron 式長期任務、外部事件驅動）。
- **FDE Guide 深度解析**（`fde-guide-analysis`）：FDE Guide 強調「自主性是設計選擇」與「最小充分機制」——Orbs 提供的是「當自主性成為正確選擇時」的託管執行環境；兩者互補：一個回答「該不該自主、值不值得做」，一個回答「自主了往哪裡跑」。
- **Graph Engineering Guide (2026)**（`graph-engineering-guide-2026-analysis`）：圖工程討論多 agent 協調；Orbs 解決的是**多 agent 的資源底座**——讓協調出來的並行結構真正跑得起來。

---

## 參考資料

- 原文：Amp Chronicle，《Agents in Orbs》（2026-06-30）—— `https://ampcode.com/news/agents-in-orbs`
- 官方手冊：Amp Owner's Manual → Orbs（Orbs 定義、入門、功能、定價、Secrets & Env Vars、Git 託管、OIDC、Projects、Orb 內容、Setup Files、Webhooks、Portals、Docker）—— `https://ampcode.com/manual/orbs`
- 哲學前作：Amp Chronicle，《The Coding Agent Is Dead》（2026-02-19）—— `https://ampcode.com/news/the-coding-agent-is-dead`
- 關聯新聞：《Agents, Everywhere》（web/CLI/行動端驅動 agent）—— `https://ampcode.com/news/agents-everywhere`
- 關聯筆記：《Putting an Agent in an Orb》（為 orb 準備程式碼庫）、《What I Want to Tell You About Orbs》（orb 如何改變建置方式）
- 基礎設施線索：portal 域名 `*.onamp.dev`、Vite 疑難排解中的 `.e2b.app`（E2B 沙盒技術）
- 本站相關：《The Art of Loop Engineering 深度解析（LangChain 官方）》、《FDE Guide 深度解析》、《Graph Engineering Guide (2026) 深度解析》
