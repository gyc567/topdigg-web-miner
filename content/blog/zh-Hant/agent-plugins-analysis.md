---
title: "Agent Plugins 深度解析：一個由 Amazon、Cursor、微軟、OpenAI、Vercel 聯合制定的 AI 代理外掛可攜標準"
description: "全面解析 agent-plugins.org 發布的 Agent Plugins 規範 v1.0.0——一個開放、廠商中立的外掛打包標準，為 Agent Skills 和 MCP servers 定義統一的可攜包格式。核心思想：各 AI 代理客戶端各搞一套外掛格式，外掛作者被迫為每個客戶端重新整理或複製元件；Agent Plugins 只定義一個「互通性最小公約數」——共享元件用統一結構，而分發、安裝、權限、使用者體驗和客戶端專屬能力仍由各客戶端掌控。全文涵蓋：為什麼需要它、可攜包的目錄結構與 manifest 規範、五種 MCP 傳輸（stdio/Streamable HTTP/HTTP+SSE）、PLUGIN_ROOT 與 PLUGIN_DATA 外掛變數、反向網域客戶端擴充、漸進式採用、失敗隔離，以及十條設計決策背後的哲學。從核心思想、專案說明、設計哲學到零基礎教學（最小 hello-plugin → 完整 manifest → 打包技能 → 設定 MCP → 實作客戶端）和歸納觀點，一文講透。"
date: "2026-08-07"
author: "TopDigg Research Team"
tags: ["Agent Plugins", "AI Agent", "MCP", "Agent Skills", "Plugin", "Interoperability", "Open Standard", "Amazon", "OpenAI", "Microsoft", "Cursor", "Vercel"]
categories: ["Deep Dive"]
keywords: ["Agent Plugins", "AI 代理外掛", "MCP", "Agent Skills", "可攜外掛", "互通性", "開放標準", "plugin.json", "mcp.json", "PLUGIN_ROOT", "PLUGIN_DATA", "技術指導委員會"]
---

# Agent Plugins 深度解析：一個由 Amazon、Cursor、微軟、OpenAI、Vercel 聯合制定的 AI 代理外掛可攜標準

> 核心思想：**Agent Plugins 是一個開放、廠商中立的 AI 代理外掛打包標準（v1.0.0）。** 它解決一個真實存在的碎片化問題：AI 代理客戶端各自發明了自己的外掛格式，即使外掛裝的是同樣的元件（技能、MCP 伺服器），作者也必須為每個客戶端重新整理或複製一份。Agent Plugins 不試圖統一一切，它只定義一個「互通性最小公約數」——共享元件用一套可預測的結構，而分發、安裝、權限、使用者體驗和客戶端專屬能力，全部留給各客戶端自己掌控。這個由 Amazon、Cursor、Microsoft、OpenAI、Vercel 核心維護者組成的**技術指導委員會（TSC）**推動的標準，把「可攜性」和「客戶端自主權」同時寫進了規範：目錄即包、根級 `plugin.json` 是唯一一致性地板、`skills/` 與 `mcp.json` 是固定元件位置、反向網域命名空間是客戶端擴充的出口。它用十條清晰的設計決策回答了同一個問題：**如何用最小的規範面，換取最大的生態互通。**

---

## 一、專案說明

### 1.1 它是什麼？

**Agent Plugins** 是一個**開放、廠商中立的外掛打包標準**，用於把可複用元件打包成可攜外掛，從而擴充 AI 代理的能力。它的 **v1.0.0 規範**為兩類元件定義了統一的共享格式：

- **Agent Skills**（`https://agentskills.io/specification` 定義的技能格式）
- **MCP servers**（`https://modelcontextprotocol.io/specification` 定義的模型上下文協定伺服器）

相容的客戶端（AI 代理工具、開發工具）可以一致地發現和載入這些外掛。

### 1.2 關鍵資料

- 官網：`https://agent-plugins.org`
- 規範倉庫：`https://github.com/agentplugins/agent-plugins-spec`
- 規範版本：**1.0.0**（狀態：Working Draft，工作草案）
- 許可證：**Apache-2.0**（規範文字 + 配套文件以 Apache-2.0 / CC-BY-4.0 雙軌發布）
- 技術指導委員會（TSC）初始核心維護者來自：**Amazon、Cursor、Microsoft、OpenAI、Vercel**
- 治理模式：社群治理的開放規範專案，個人持有角色（非公司席位），單一廠商不得佔據核心維護者多數席位
- 發布物：規範文字（`spec/1.0.0.md`）、外掛清單 JSON Schema、MCP 設定 JSON Schema、一致性檢查清單
- 配套文件：`plugin-authors`（外掛作者指南）、`client-implementers`（客戶端實作指南）、`schemas`（機器可讀 Schema）、`llms.txt` / `sitemap.md`（文件索引）

### 1.3 它解決什麼問題？

**問題：外掛格式碎片化。** AI 代理客戶端（Claude Code、Cursor、OpenAI 系工具、各類 agent 框架……）各自定義了自家的外掛格式，即使這些外掛包含的是相同的底層元件。結果是：一個為客戶端 A 打包的外掛，客戶端 B 往往需要改造後才能使用；外掛作者不得不為每個客戶端重複整理、重複複製元件。

**答案：定義一個「互通性地板」。** Agent Plugins 只對「可以跨客戶端移植的部分」設定標準——共享元件使用一種可預測的結構；而分發、安裝、權限、使用者體驗、更新、客戶端專屬能力，全部保留在客戶端自己的控制之下。規範有意不去規定：安裝源/註冊表/市場、啟用/更新/快取的 UX、權限提示/信任策略/沙箱、技能如何展示給使用者或模型、客戶端擴充的內部行為。

---

## 二、核心思想

### 2.1 互通性最小公約數

Agent Plugins 的設計不是「大一統」——它明確只定義**可攜部分的共享格式**。規範原文這樣表述：

> Agent Plugins defines a small interoperability floor for the parts that can be portable across clients.（Agent Plugins 為可跨客戶端移植的部分定義了一個小型的互通性地板。）

這是一個精妙的邊界劃分：**標準化的是「包裝」而非「執行時」**。外掛如何被發現、安裝、執行、展示、授權——這些繼續由每個客戶端決定。標準只保證「同一個包，任何相容客戶端都能讀懂」。

### 2.2 目錄即包

一個 Agent Plugin 就是一個**目錄**（不是 zip、不是註冊表拉取的捆綁包）：

```text
my-plugin/
├── plugin.json          # 必選：清單，標識外掛與目標規範版本
├── skills/              # 可選：Agent Skills 固定位置
│   └── summarize/
│       ├── SKILL.md
│       ├── scripts/
│       └── references/
├── mcp.json             # 可選：MCP 伺服器設定
└── com.example.client/  # 可選：客戶端擴充目錄（反向網域）
```

選擇目錄作為包單位，帶來四個直接收益：**可用標準工具檢查**（`ls`、`cat`、`git`）、**開發時可原地編輯**、**無需特殊工具即可版本控制**、**沒有發現間接層**。

### 2.3 兩個固定元件位置

v1 規範定義了恰好兩種元件類型，各有一個固定位置：

- **Skills** → `skills/`：每個包含 `SKILL.md` 的直接子目錄就是一個技能（不遞迴搜尋深層後代）
- **MCP servers** → `mcp.json`：根級 JSON 設定檔

固定位置的意義：`plugin.json` 不能覆蓋這些位置，也不能內聯元件設定——**發現規則對每個客戶端都一樣**，客戶端無需實作「尋找替代來源」的複雜邏輯。

### 2.4 開放開發與公開治理

- 提案與技術決策**公開**，參與對更廣泛生態開放
- 新特性與實質性變更從 **GitHub Discussions** 開始，提案須證明「具體的可攜性需求 + 實作者支援」
- 治理章程（Technical Charter）獨立於包格式定義，角色由**個人**持有，公司不佔席位，單一廠商不能控制核心維護者多數

---

## 三、設計哲學

規範末尾的 **Design Decisions** 附錄是理解這個專案設計哲學的最佳入口——它逐條解釋「為什麼這樣設計」。以下十條是核心：

### 3.1 為什麼用目錄做發現，而不是歸檔格式？

`zip`/`tar.gz` 或註冊表捆綁包需要專門的工具才能檢查。目錄則可以用 `ls`/`cat`/`git` 直接檢查，開發時可以原地編輯，版本控制無需特殊工具。**固定根級位置**（`skills/`、`mcp.json`）消除了發現間接層、替代來源優先級和清單設定——這些都是每個客戶端原本都要各自實作的複雜度。

### 3.2 為什麼 v1 只做 Agent Skills 和 MCP？

因為這兩者**在專案外部已經有成熟的規範**（agentskills.io、modelcontextprotocol.io），且有可觀的跨客戶端採用。其他被提議的元件類型——commands、hooks、agents、rules、LSP servers——仍然太客戶端專屬，無法形成穩定的可攜契約，**在其格式收斂之前不進入 v1**。這是典型的「先跑通最小端到端」工程原則：先做有共識的兩類，把不確定性留給未來。

### 3.3 為什麼根級 `plugin.json` 是一致性地板？

每個合規客戶端**必須**檢查外掛根目錄的 `plugin.json`。這給外掛作者一個**跨所有客戶端保證存在**的單一清單——作者無需知道任何客戶端專屬的路徑知識。

### 3.4 為什麼是可攜清單的封閉 Schema？

根級 `plugin.json` 只允許 10 個頂層欄位：`$schema`、`name`、`version`、`description`、`author`、`homepage`、`repository`、`license`、`keywords`、`extensions`。封閉 Schema 帶來：**嚴格校驗、拼寫錯誤偵測、Schema 驅動的鍵補全**。客戶端的實驗性欄位不能佔用任意頂層欄位，只能收進 `extensions` 的反向網域鍵下。未知頂層欄位是 Schema 違規，但客戶端**報告並忽略**而不是拒絕整個外掛——寬容地容納未來。

### 3.5 為什麼用反向網域做客戶端擴充？

反向網域識別碼提供了一種**去中心化的防衝突約定**，不需要中心化的客戶端名註冊表。同一個識別碼可以同時用於清單資料（`extensions` 鍵）和客戶端專屬目錄（頂層目錄名），兩種表示可以獨立存在。擴充目錄保持在頂層，讓外掛佈局保持扁平、約定驅動。

### 3.6 為什麼要有顯式的 MCP 設定格式？

現有客戶端使用的 MCP 設定形狀互不相容，傳輸推斷方式各異。Agent Plugins 定義一個**顯式的封閉聯合（closed union）**，其含義獨立於任何客戶端原生格式。區分 Streamable HTTP 與舊版 HTTP+SSE，讓每個條目有**無歧義的初始傳輸**，而連線失敗後的回退行為則留在可攜格式之外。

### 3.7 為什麼允許客戶端只支援一種標準 MCP 傳輸？

Stdio 和 Streamable HTTP 服務於不同的部署與安全模型。要求每個支援 MCP 的客戶端同時支援本機程序執行和遠端 HTTP 連線，會**擴大其實作面和信任面**，卻不改變可攜設定格式。由於每個伺服器條目宣告了自己的傳輸，客戶端可以跳過不支援的條目，同時繼續載入獨立伺服器和元件。

### 3.8 為什麼 Schema 與規範共享版本號？

`plugin.json` 和 `mcp.json` 的 Schema 使用 Agent Plugins 規範版本號，而不是獨立的版本序列。這讓作者和客戶端只需理解**一個**可攜格式版本，防止混合版本包，並讓 `$schema` 選擇完整的校驗與解釋契約——包括 JSON Schema 表達不了的要求。相比暴露三條獨立的相容性時間線，規範發布時重發一份未變的 Schema 只是很小的維護成本。

### 3.9 為什麼用外掛變數而不是設定裡的相對路徑？

MCP 伺服器參數在執行時往往需要絕對路徑。`${PLUGIN_ROOT}` 提供無歧義的、由客戶端解析的**捆綁檔案錨點**；`${PLUGIN_DATA}` 標識客戶端管理的、跨更新持久化的**可寫狀態目錄**。`command` 欄位不做插值：`./` 路徑直接相對外掛根解析，裸名稱用平台可執行檔搜尋規則。**把 `command` 當作單個 token**，避免要求客戶端解析和轉義使用者手寫的 shell 命令字串。不同客戶端的繼承環境和 `PATH` 行為各異，所以標準統一了設定的環境覆蓋，但把裸命令搜尋留給客戶端定義——外掛相對路徑提供確定性的捆綁執行。

### 3.10 為什麼元件失敗是非致命的？

MCP 伺服器啟動或連線失敗時，客戶端**繼續載入**外掛的其餘元件。一個同時提供技能和 MCP 伺服器的外掛，不應因為一個伺服器不可用就整體不可用。規範把非致命元件失敗與**診斷要求**配對，讓失敗可見而非沉默。

---

## 四、詳細教學

### 4.1 建立最小外掛（hello-plugin）

最小的可用外掛是一個目錄 + 一個技能，三步完成：

```text
hello-plugin/
├── plugin.json
└── skills/
    └── greet/
        └── SKILL.md
```

**Step 1：建立 `plugin.json`**

```json
{
  "$schema": "https://agent-plugins.org/schemas/1.0.0/plugin.schema.json",
  "name": "hello-plugin"
}
```

**Step 2：建立技能 `skills/greet/SKILL.md`**

```markdown
---
name: greet
description: Greet the user and offer help.
---

Greet the user and offer help.
```

**Step 3：載入**

支援技能的客戶端讀取 `plugin.json`，掃描 `skills/` 的直接子目錄，並按 Agent Skills 規範校驗每個 `SKILL.md`。要加 MCP 伺服器，就把 `mcp.json` 放在外掛根目錄，使用相同的 Agent Plugins Schema 版本。

> 完整可複製的例子見：`https://github.com/agentplugins/agent-plugins-example`

### 4.2 完整清單欄位

```json
{
  "$schema": "https://agent-plugins.org/schemas/1.0.0/plugin.schema.json",
  "name": "plugin-name",
  "version": "1.2.0",
  "description": "Brief plugin description",
  "author": {
    "name": "Author Name",
    "email": "author@example.com",
    "url": "https://example.com"
  },
  "homepage": "https://docs.example.com/plugin",
  "repository": "https://github.com/example/plugin",
  "license": "MIT",
  "keywords": ["keyword1", "keyword2"],
  "extensions": {
    "com.example.client": {
      "setting": true
    }
  }
}
```

要點：

- **必填欄位只有兩個**：`$schema`（目標規範版本識別碼）和 `name`（可讀外掛名）。缺失/型別錯誤/為空 → 客戶端拒絕外掛且不得發現或執行任何元件
- `version` 建議用語意化版本（SemVer），用於更新檢查與快取新鮮度
- `author` 物件只允許 `name`/`email`/`url` 三個欄位
- 除顯式約束外，中繼資料欄位只按 JSON 型別校驗——**不會**因為 version 不是合法 SemVer、URL 不合法、信箱不合法、license 不是 SPDX 識別碼而拒絕外掛
- 未知頂層欄位 → 報告並忽略，繼續載入（非致命）

### 4.3 外掛命名約束

`name` 必須全部滿足：

- 長度 **1–64 字元**
- 字元集僅限 **小寫字母、數字、`-`、`.`**
- **首尾必須是字母數字**
- **不允許連續 `--` 或 `..`**（但允許單個 `.`，如 `acme.tools`）

合法範例：`my-plugin`、`acme.tools`、`lint3r`、`a`
非法範例：`My-Plugin`（大寫）、`-start`（前導連字號）、`has--double`（連續連字號）、`too.many..dots`（連續句點）、空字串

### 4.4 打包 Agent Skills

- 固定位置 `skills/`，每個包含 `SKILL.md` 的**直接子目錄**算一個技能；**不遞迴**搜尋更深後代
- 技能本身必須符合 Agent Skills 規範（`SKILL.md` 格式、frontmatter、`scripts/`/`references/`/`assets/` 佈局）
- 技能不合規 → **跳過該技能**並繼續載入其他技能（建議報告無效技能）

```text
skills/
└── deploy/
    ├── SKILL.md          # name: deploy
    ├── scripts/
    │   └── rollback.sh
    └── references/
        └── runbook.md
```

### 4.5 設定 MCP 伺服器（mcp.json）

`mcp.json` 必須是 JSON 物件，只含兩個頂層欄位：`$schema` 和 `mcpServers`。每個伺服器條目必須包含 `type`，並匹配以下封閉變體之一：

**stdio（本機程序）**

```json
{
  "type": "stdio",
  "command": "./bin/validator",
  "args": ["--data", "${PLUGIN_DATA}/validator"],
  "env": {
    "CONFIG": "${PLUGIN_ROOT}/config.json"
  },
  "cwd": "${PLUGIN_ROOT}"
}
```

要點：

- `command` 必須是**單個可執行 token**（裸名稱或 `./` 開頭的外掛相對路徑），不能是 shell 命令字串，不做佔位符展開
- 省略 `cwd` 時預設外掛根目錄；`cwd` 只能是外掛相對路徑、`${PLUGIN_ROOT}` 開頭、或 `${PLUGIN_DATA}` 開頭三種形式
- `args`/`env`/`cwd` 支援 `${PLUGIN_ROOT}` 和 `${PLUGIN_DATA}` 展開

**Streamable HTTP（遠端）**

```json
{
  "type": "streamable-http",
  "url": "https://deploy.example.com/mcp",
  "headers": {
    "X-Tenant": "public-tenant"
  }
}
```

**舊版 HTTP+SSE（已棄用）**

```json
{
  "type": "sse",
  "url": "https://legacy.example.com/sse"
}
```

遠端要點：

- `url` 必須是絕對 HTTP/HTTPS URL，不含使用者資訊或 fragment；非回環端點**必須用 HTTPS**
- header 名稱大小寫不敏感，不允許同名字段不同大小寫重複出現
- **header 值是可見的包資料，不是機密機制**——禁止在 header 裡嵌入憑證；v1 不定義 OAuth 或可攜憑證引用欄位，授權發現/使用者互動/憑證儲存由客戶端管理

**傳輸支援要求**：支援 MCP 的客戶端必須至少支援 `stdio` 或 `streamable-http` 之一（SHOULD 兩者都支援），`sse` 可選。客戶端必須用 `type` 宣告的傳輸做首次連線嘗試，Agent Plugins 不定義失敗後的回退行為。

### 4.6 外掛變數：PLUGIN_ROOT 與 PLUGIN_DATA

啟動外掛子程序的客戶端**必須**為每個子程序提供兩個環境變數：

- `PLUGIN_ROOT`：檔案系統解析後的外掛根目錄絕對路徑——用於引用**隨外掛捆綁**的指令碼、二進位和設定檔
- `PLUGIN_DATA`：客戶端管理的持久化資料目錄絕對路徑——用於 `node_modules`、虛擬環境、生成程式碼、快取等**跨更新持久化**的狀態（客戶端必須在啟動前建立、保證可寫、跨更新保留；解除安裝時可刪除）

展開規則：

- 展開是**單次、非遞迴**的文字替換，替換引入的文字不再掃描佔位符
- 展開適用於 `args` 的每個字串元素、`env` 的每個字串值、`cwd`；**不適用**於 `env` 鍵、`command`、固定元件位置
- 未識別的類佔位符文字保持字面量；客戶端不得做任何其他佔位符/環境變數展開
- 伺服器 `env` 物件**禁止**包含名為 `PLUGIN_ROOT` 或 `PLUGIN_DATA` 的條目（保留變數由客戶端供應，違規則該伺服器條目無效）
- `env` 值同樣是可見包資料，禁止嵌入憑證

### 4.7 實作一個相容客戶端

**載入序列（客戶端視角）**：

1. 建立檔案系統解析後的外掛根目錄
2. 用 `$schema` 選定的本地支援 Schema 定位並校驗根 `plugin.json`
3. 致命清單違規 → 拒絕外掛；顯式非致命情形 → 報告並忽略
4. 從固定位置發現每種支援的元件類型
5. 套用每種元件類型/條目定義的失敗邊界
6. 套用已實作的客戶端擴充命名空間，忽略其他

**最小客戶端要求**（一致性要點）：

- 能從目錄路徑載入外掛
- 校驗封閉的 `plugin.json` Schema，忽略未實作的 `extensions` 成員（不校驗其值的內容）
- 為支援的元件類型在固定位置發現元件
- 支援 MCP 時：至少支援 `stdio` 或 `streamable-http` 之一；提供 `PLUGIN_ROOT`/`PLUGIN_DATA` 並展開執行時設定值
- 把 `command` 解析為單個可執行 token，預設工作目錄為外掛根
- **至少支援一種元件類型**（技能或 MCP）——增量採用是被明確允許的：僅技能客戶端也可以合規

**失敗隔離**：未知元件類型 → 忽略；獨立元件的失敗 → 不得阻止載入其他獨立有效的元件；失敗必須可見（SHOULD 報告），但「不支援某種元件類型/傳輸/擴充」本身不是錯誤。

---

## 五、歸納總結（觀點與結論）

1. **碎片化是 AI 代理生態當前最大的互通稅。** 每個客戶端一套外掛格式，作者被迫重複打包。Agent Plugins 判斷：與其統一執行時，不如統一「包裝契約」——這是成本最低、共識最大的標準化切入點。

2. **「互通性地板」而非「大一統」是正確的野心。** 規範明確把分發、安裝、權限、UX、沙箱、客戶端擴充留給各家。這個邊界克制讓 Amazon、Cursor、微軟、OpenAI、Vercel 這些互為競爭對手的廠商能坐到同一張桌子上——沒人願意把自家執行時完全交出去。

3. **先做有共識的兩類元件。** v1 只標準 Agent Skills 和 MCP，因為它們在專案外部已有成熟規範。commands/hooks/agents/LSP 伺服器等仍在收斂中——「等格式收斂再進 v1」是防止過早標準化的教科書級做法。

4. **封閉 Schema + 寬容處理，是給未來留活口的智慧。** 未知頂層欄位不致命（報告並忽略），客戶端實驗收進反向網域 `extensions`——既守住可攜契約的嚴格性，又允許生態在命名空間內自由實驗。

5. **安全是設計出來的，不是口號。** 外掛路徑必須留在外掛根內（拒絕 `../` 逃逸）、`command` 不做 shell 解釋、header/env 明確「不是機密機制」、非回環端點強制 HTTPS、OAuth 明確留給客戶端——每一條都在壓縮攻擊面。

6. **失敗隔離讓外掛生態更健壯。** 一個 MCP 伺服器掛了，整個外掛不該不可用。非致命元件失敗 + 診斷報告要求，讓「部分可用」成為預設姿態。

7. **增量採用是標準落地的關鍵。** 客戶端可以只支援技能、只支援 MCP，或只支援一種傳輸——標準為漸進式採用留了清晰的合規路徑，大幅降低接入門檻。

8. **治理設計決定了標準的可信度。** 個人持有角色而非公司席位、單一廠商不得佔多數、TSC 會議公開、提案從 GitHub Discussions 起步——這些條款讓一個由競爭對手組成的標準組織有了長期可信的基礎。

---

## 參考資料

- 官網：`https://agent-plugins.org`
- 規範倉庫：`https://github.com/agentplugins/agent-plugins-spec`
- 規範文字 v1.0.0：`https://github.com/agentplugins/agent-plugins-spec/blob/main/spec/1.0.0.md`
- 外掛清單 Schema：`https://agent-plugins.org/schemas/1.0.0/plugin.schema.json`
- MCP 設定 Schema：`https://agent-plugins.org/schemas/1.0.0/mcp.schema.json`
- 外掛作者指南：`https://agent-plugins.org/plugin-authors`
- 客戶端實作指南：`https://agent-plugins.org/client-implementers`
- 治理章程（Technical Charter）：`https://github.com/agentplugins/agent-plugins-spec/blob/main/GOVERNANCE.md`
- 範例外掛：`https://github.com/agentplugins/agent-plugins-example`
- Agent Skills 規範：`https://agentskills.io/specification`
- MCP 規範：`https://modelcontextprotocol.io/specification`
- 討論區：`https://github.com/agentplugins/agent-plugins-spec/discussions`
