---
title: "有人把 Excel、Slack、PS 全部重寫了一遍：HeyPuter 的 53 個世界級軟體"
description: "深度拆解 HeyPuter/everything 單倉庫專案：51 個應用、224 萬行程式碼、8711 個測試檔案、零前端框架。附完整本地執行教程、Amplify 部署配置解析、六大設計哲學與八個可遷移觀點。"
date: "2026-11-03"
author: "瑞哥观势"
tags:
  - HeyPuter
  - 開源專案分析
  - 開源軟體
  - 單倉庫
  - 無框架前端
  - 開發教程
categories:
  - 開源專案分析
keywords:
  - HeyPuter
  - Everything Project
  - 開源軟體替代
  - monorepo
  - 無框架前端開發
  - Puter 平臺
  - Spreadsheet 開源
  - 3D Studio 開源
  - Clean-room 實現
  - 軟體架構方法論
---

# HeyPuter 53 個世界級軟體：有人把 Excel、Slack、PS、AutoCAD 全部重寫了一遍

先說結論。

**第一，這不是又一個"AI 套殼應用"，而是一場用十年時間才可能完成的長跑。** 我把 HeyPuter/everything 完整克隆下來逐個翻了一遍：51 個應用目錄，48 個已部署上線，2.24M 行 JavaScript / TypeScript，8700 多個測試檔案，沒有任何一個前端框架（React、Vue、Svelte 全都沒有），後端統一掛在一個叫 Puter 的雲平臺上。這是一個用"最笨的方式"堆出來的軟體帝國。

**第二，它最狠的地方不是功能對齊，是它敢把"沒有伺服器"寫進架構。** 24 個應用的 README 裡都寫著同一句話："no server of its own"（沒有屬於自己的伺服器）。所有後端能力（賬號、儲存、資料庫、KV、Worker、部署）全部來自 Puter 平臺。這意味著每個應用都能被丟進任何靜態託管（AWS Amplify、物件儲存、自己的 Nginx），而且不用配一行環境變數、不用申請 API Key。這在 SaaS 裡是反常識的。

**第三，絕大多數應用都明確標註自己是 alpha 狀態。** CAD 的 README 第一句就是"Early alpha，請不要依賴它做真實專案，重要工作請自行留副本"。Records、Wiki、Expenses 也都有類似警告。所以正確的讀法是：把它當一份**公開的、可以白嫖原始碼的架構範本**，而不是一個能直接替代 Office 的產品。

**第四，它最有價值的部分不是 53 個應用，而是一套"如何在不寫後端、不用框架、不碰許可證紅線的前提下，做出一個真能用的專業軟體"的完整方法論。** 下面我會把這套方法論拆開講，包括可以直接上手的本地執行教程。

---

## 一、專案說明：它到底是什麼

### 1.1 一句話定位

The Everything Project 的自我描述是："重建並開源整個世界的軟體"。從 Office 到 Slack，從 Photoshop 到 AutoCAD，把所有專有軟體的自由開源替代品重新做一遍，全部放在一個單倉庫（mono-repository）裡。

### 1.2 規模盤點

我按實際檔案統計（排除 node_modules、dist、tests、vendor、tmp）：

| 維度 | 實際資料 |
|---|---|
| 應用目錄數 | 51 個（src/ 下） |
| 已上線站點 | 48 個 `*.puter.com` 子域 |
| 主程式碼行數（js/ts/jsx/tsx） | 約 2,242,000 行 |
| HTML + CSS | 約 243,000 行 |
| 原始檔數 | 7,945 個 |
| 測試檔案數 | 8,711 個 |
| 前端框架依賴 | **0**（無 React / Vue / Svelte / Angular） |
| 構建工具 | Vite（統一） |
| 根倉庫許可證 | MIT |

各應用程式碼量 TOP 10：

| 應用 | 行數 | 對標產品 |
|---|---|---|
| 3d | 404,367 | Blender |
| presentation | 252,512 | PowerPoint |
| vector-studio | 158,337 | Illustrator |
| spreadsheet | 154,514 | Excel |
| photo-studio | 151,674 | Photoshop |
| whiteboard | 117,710 | Miro |
| documents | 108,657 | Word |
| video-studio | 70,944 | Premiere Pro |
| pdf | 64,313 | Acrobat |
| audio-studio | 57,416 | Audition |

程式碼量最大的 3D 單個應用就超過 40 萬行，而且是從零手寫的。這不是"做個殼然後接 API"的量級，這是把專業軟體的核心資料結構、渲染管線、幾何核心全部重新實現了一遍。

### 1.3 分類清單

README 把 51 個應用分成 9 大類：

- **辦公**（7 個）：Spreadsheet、Documents、Presentation、Whiteboard、PDF、Notes、Records
- **協作**（6 個）：Meetings、Teamchat、Email、Contacts、Calendar、Signatures
- **創意工具**（6 個）：Photo Studio、Video Studio、Vector Studio、Audio Studio、Music Studio、3D Studio
- **工程**（4 個）：CAD、Parametric、Circuits、Building Design
- **效率**（5 個）：Tasks、Projects、Wiki、Time Tracking、Surveys
- **財務**（4 個）：Accounting、Invoicing、Expenses、Cap Table
- **商業**（13 個）：CRM、Help Desk、Contracts、POS、Inventory、Assets、Hiring、Shifts、Childcare、Field Service、Legal、Fleet、Property Management
- **開發者工具**（1 個）：API Client
- **遊戲**（5 個）：Chess、Backgammon、Checkers、Solitaire、Sudoku

**這 9 類的分佈本身就是一份需求清單。** 有人認真統計過全球軟體的品類構成，然後把每一格都填上了。這背後是一種罕見的耐心。

### 1.4 許可證：有個坑，必須先說

根倉庫 LICENSE 是 MIT，但**子應用不是統一 MIT**。逐個看 package.json 的結果：

- **AGPL-3.0-only（9 個）**：3d、building-design、email、notes、pdf、presentation、spreadsheet、video-studio、whiteboard
- **MIT（7 個）**：accounting、calendar、help-desk、parametric、projects、records、survey
- **未在 package.json 宣告（其餘）**：多數以根倉庫 MIT 為準，但需逐個確認

AGPL 是什麼概念？只要有人透過網路使用該軟體（即便是 SaaS），就必須向使用者提供完整原始碼。這是比 GPL 更狠的一層。你要拿 spreadsheet 去做商業閉源產品，AGPL 會直接卡住你。

另外，`documents` 應用的 AGENTS.md 裡寫了一條硬規則，我覺得是整個專案最有價值的一段工程治理文字：

> 不引入 AGPL 許可的程式碼或依賴（直接、間接、vendored 或遠端載入的都不行）。不引入專有的第三方文件引擎，包括在測試和工具裡。每一個釋出的二進位制都必須有對應原始碼和可接受的許可證。依賴變更後執行 `npm run check:licenses`。**不要為了透過檢查而擴大許可證白名單，先審查真實許可證。**

最後一句尤其重要。這是防止開源專案在合規檢查上自我麻痺的護欄。

---

## 二、詳細教程

### 2.1 環境要求

| 專案 | 要求 |
|---|---|
| Node.js | 22.12+ （部分應用推薦 24 LTS，3d 明確要求 24） |
| npm | 隨 Node 附帶 |
| 瀏覽器 | 支援 WebGL2 的現代瀏覽器（Chrome / Edge / Firefox / Safari） |
| 磁碟 | 完整克隆約 1.8GB，裝完依賴會更多 |

### 2.2 克隆與本地執行

```sh
git clone https://github.com/HeyPuter/everything.git
cd everything/src/spreadsheet
npm install
npm run dev
```

就這麼四步。沒有 `.env` 配置檔案，沒有資料庫初始化指令碼，沒有 Docker Compose。

跑起來後瀏覽器開啟的地址有點特別：

```
http://spreadsheet.puter.localhost:5173/
```

**這個 `puter.localhost` 域名是刻意設計的。** 倉庫根目錄有個 `dev/puter-localhost.mjs`，它是個 Vite 外掛，會在伺服器監聽後把本地 URL 的主機名改寫成 `<應用名>.puter.localhost`。原理很簡單：瀏覽器會把所有 `*.localhost` 解析到迴環地址，Vite 預設也接受 `.localhost` 主機名。所以不需要改 `/etc/hosts`，不需要配代理。**一個 20 行的外掛解決了多應用本地開發的域名隔離問題**，這個設計相當乾淨。

每個應用的 vite.config 裡都引入了這個共享外掛：

```js
import puterLocalhost from '../../dev/puter-localhost.mjs';
```

### 2.3 切換到其他應用

所有應用在同一倉庫下，切換方式就是換目錄：

```sh
cd ../3d            # 3D Studio，40 萬行
npm install
npm run dev

cd ../documents     # 文件編輯器
npm install
npm run dev
```

### 2.4 不登入也能用

這是很關鍵的一點，值得單獨說。**絕大多數應用不需要登入就能幹活。**

Spreadsheet 的 README 寫得很清楚：

> 沒人需要登入才能使用：應用直接開啟一個新表格，Puter 只在第一個需要雲端的動作時才要求登入，比如儲存、開啟檔案，或者表格列表。在此之前，編輯內容留在標籤頁裡（以及這個瀏覽器的本地草稿中），狀態膠囊顯示 "Sign in to save"。

Records、Presentation、CAD 都是同一套模式。這意味著什麼？意味著你可以在完全離線的狀態下把這套軟體當作本地應用來用，包括：

- Spreadsheet：公式、圖表、格式全都能用
- CAD：開啟本地圖紙、儲存到本地裝置、重新整理後從瀏覽器恢復
- PDF：本地開啟 PDF、編輯、匯出
- Documents：`/playground.html` 獨立執行，不需要賬號也不需要雲 SDK

登入只在四個時刻才發生：**存雲端檔案、開雲端檔案、協同編輯、需要後端運算的功能**（比如 Spreadsheet 的 `AI()` 和 `IMPORTDATA()`）。

### 2.5 各應用的構建與測試

不同應用的指令碼略有差異，按需選擇：

```sh
# 通用：單元測試
npm test

# 3d：完整檢查鏈（單元測試 + 型別檢查 + 生產構建 + 瀏覽器 E2E）
npm run check

# documents：許可檢查 + DOCX 規範符合性檢查
npm run check:licenses
npm run check:conformance

# pdf：生成第三方宣告 + 構建 + 跨瀏覽器 E2E
npm run licenses
npm run build
npm test:e2e

# 白板 / 通用：生產構建 + 本地預覽
npm run build
npm run preview
```

**E2E 需要先裝瀏覽器：**

```sh
npx playwright install chromium
npm run test:e2e
```

### 2.6 部署：每個應用是一個獨立的 Amplify 應用

倉庫根目錄兩個檔案定義了整套部署：

**`amplify.yml`** 裡，每個 `src/xxx` 目錄是一個獨立的 Amplify 應用，根目錄是那個子目錄：

```yaml
applications:
  - appRoot: src/whiteboard
    frontend:
      phases:
        preBuild:
          commands:
            - nvm install 22
            - npm ci
        build:
          commands:
            - npm run build
      artifacts:
        baseDirectory: dist
        files:
          - '**/*'
```

**`customHttp.yml`** 定義快取策略。注意它的檔案頭有一句關鍵說明：

> Amplify 對單倉庫應用的請求頭只從倉庫根目錄的這個檔案讀取，所以每個應用的頭部都放在 appRoot 匹配它自己目錄的條目裡。**每個從本倉庫部署的應用都需要在這裡有一個條目，哪怕它自己沒有頭部：Amplify 會讓找不到條目的應用部署失敗。**

快取策略本身也值得學：

```yaml
- pattern: '/'
  headers:
    - key: 'Cache-Control'
      value: 'no-cache, max-age=0, s-maxage=0, must-revalidate'
- pattern: '/assets/*'
  headers:
    - key: 'Cache-Control'
      value: 'public, max-age=31536000, immutable'
```

入口頁永不快取（因為 Vite 產物帶 hash，入口卻可能指向舊資源），帶 hash 的資源永久快取。這個"入口不快取 + 資源 immutable"的組合，是任何 Vite 靜態站的標準配置，但它是被寫在配置檔案裡、被 CI 強制的，而不是靠人記得。

### 2.7 部署到 Puter 平臺

部分應用自帶 Puter 專用部署指令碼，比如 Spreadsheet：

```sh
npm run deploy:email-worker
```

Teamchat 的機制更狠：**每個工作區會在建立者的 Puter 賬戶裡跑一個屬於自己的 Worker**。原文：

> 應用在使用者首次建立工作區時，把自帶的 worker 包（`public/worker/teamchat-worker.js`）複製到他的雲盤，然後呼叫 `puter.workers.create()`。這個 worker 的 KV 和檔案系統儲存著所有資料。

也就是說，一個 Slack 替代品的多租戶隔離，是靠"每個租戶一個獨立 Worker 例項"實現的，許可權校驗在 worker 的每一條路由上強制執行。

### 2.8 三條深度閱讀路線

如果只讀三份文件，我推薦這三份：

**① `src/documents/AGENTS.md`（27 行）**：最短，但資訊密度最高。定義了依賴策略、許可紅線、canvas 引擎的里程碑要求、以及 OOXML 規範符合性記錄方式。核心是一條：

> 把文件變更、DOCX 序列化、佈局、繪製四件事分開。保留未被觸碰的 DOCX 包元件。用不支援的特性開啟文件時按盡力而為處理；在安全編輯不可用時退回只讀近似，**並且不要掛上可能丟棄不支援內容的儲存處理器**。

這句話的分量很重。它承認了"我做不到 100% 相容"，但規定了做不到時該怎麼優雅降級，而不是默默吃掉使用者的資料。

**② `src/3d/ARCHITECTURE.md`（273 行）**：工業級 3D 引擎的模組劃分。核心概念是 Depsgraph（依賴圖）和 COW（寫時複製）快照：

> **型別化陣列在一次撤銷推入之後是不可變的。** 要在操作中原地修改，用 `data/cow.ts` 裡的 `cow(owner, 'key')`（每個撤銷步驟只複製一次），或者直接賦一個新陣列。

配套的還有完整的 operator 註冊模型：

```ts
registerOperators([{
  idname: 'mesh.subdivide',
  label: 'Subdivide',
  props: [...PropDef],
  poll: (ctx) => bool,
  exec: (ctx, props) => 'FINISHED' | 'CANCELLED' | void,
  undo?: boolean
}]);
```

**③ `src/spreadsheet/README.md`（1200 行）**：這是一個"功能規格說明書"級別的文件，也是全專案文件質量的標杆。它把 510 多個 Excel 函式按類別逐個列出，包括 `LAMBDA` 的自遞迴、`GROUPBY` 的分組彙總、`PIVOTBY` 的交叉透視、`@` 隱式交集運算子、以及 `IMPORTXML` 的 XPath 節點提取。文件詳細到能直接當 Excel 函式手冊用。

---

## 三、幾個關鍵應用的技術看點

### 3.1 Spreadsheet：把 Excel 相容做到什麼程度

510+ 函式只是基礎。真正難的是這些：

**動態陣列**：`UNIQUE`、`FILTER`、`SORT`、`SORTBY`、`SEQUENCE`、`RANDARRAY`、`TRANSPOSE`、`TEXTSPLIT`、`VSTACK`、`HSTACK`、`WRAPROWS`、`TOCOL` 全部支援溢位（spill），`A1#` 引用溢位區域，被佔用時報 `#SPILL!`。

**Excel 查詢語言**：直接支援 Sheets 風格的查詢字串：

```
=QUERY(range, "select A, sum(C) where B > 5 group by A order by sum(C) desc limit 10 label sum(C) 'Total'")
```

**錯誤提示是產品級的**：`#NAME?` 會直接告訴你"沒有叫 SUMM 的函式，你是不是想用 SUM？"，`#REF!` 會指出缺失的是哪個工作表。這不是報錯，這是教學。

**AI 直接寫進單元格**：

```
=AI(prompt, [data])
=TRANSLATE(text, [from], [to])
=DETECTLANGUAGE(text)
```

`AI()` 思考期間返回 `#BUSY!`，相同 prompt 只問一次，按 F9 重新提問。

**真實 .xlsx 檔案**：存下來的就是真正的 Excel 檔案，能在 Excel、Numbers、LibreOffice 裡開啟。往返匯入匯出覆蓋了 Excel 原生圖表（折線、散點、簇狀柱、堆積柱、Pareto 組合圖）、主題顏色、日期軸、隱藏輔助表、命名公式定位標籤等一堆細節。

**沒有後端伺服器**，全部靠 Puter.js。

### 3.2 3D Studio：Clean-room 實現的 Blender 替代品

這個應用的野心最嚇人：建模、雕刻、UV、材質節點 / 幾何節點 / 合成器、動畫繫結、物理模擬、路徑追蹤與實時渲染、影片剪輯、運動追蹤、Grease Pencil、指令碼系統，**全部跑在瀏覽器裡**。

技術選型：**純 TypeScript + three.js（WebGL2）**，不用任何前端框架。

**Z 軸向上，單位是米，角度內部用弧度。** 屬性命名遵循廣泛使用的 `bpy` 指令碼約定（`location`、`rotation_euler`、`hide_render`），這樣動畫路徑、指令碼和匯入器能 1:1 對應。

關於許可證有一段宣告：

> 本專案是獨立的：這是一個 clean-room 實現，不包含任何 Blender 原始碼、圖示、主題或其他資源，與 Blender 基金會無隸屬關係，也未獲其背書。

**clean-room 實現**是軟體工程裡最難的一種乾淨：不是"讀了原始碼再重寫"，而是"看了規格和文件，從零實現"。3D 的 README 裡有一句話點破了這種做法的代價：

> `.blend` 匯入覆蓋活動場景和常見資料（不含體積、點雲或線渲染設定）；不支援的資料會被報告出來，而不是靜默丟失。**不支援匯出 `.blend`。**

**AI 助手**部分的設計很值得抄：它讀取場景、對 `bpy` 風格 API 寫並執行指令碼（失敗的指令碼會回滾）、查詢 API 文件、擷取視口截圖來自檢、讀取使用者附帶的參考影象 / PDF / 文字。**它為一條訊息所做的一切修改，合併成一個撤銷步驟。**

### 3.3 Documents：重新實現一個 Canvas 編輯器

不是嵌入第三方富文字編輯器，是自己寫渲染引擎。

**雙模式執行**：

- `/playground.html`：獨立本地編輯器，不需要賬號也不需要雲 SDK
- `/mock.html`：帶記憶體版 Puter 模擬，測試儲存與重開
- `/`：走真實 Puter 雲端儲存

**字型度量相容**：為 Calibri、Cambria、Arial、Times New Roman、Courier New 提供了度量相容的替代字型。這不是"長得像"，是"排版結果一樣"。

**功能覆蓋**：審閱（批註執行緒、修訂模式、接受 / 拒絕、變更欄、審閱窗格）、引用（目錄、頁尾腳註、題注 SEQ、交叉引用 REF / PAGEREF、F9 更新域）、頁首頁尾、單雙刪除線、字距調整與樣式繼承、上下文間距、水平文字縮放 1% 至 600%、字元間距擴充套件與壓縮、帶符號的基線偏移、上下標、OOXML 高亮調色盤、繼承式主題色、表格跨頁與重複表頭、浮動圖片（含裁剪、翻轉、旋轉、alt 文字）。

**最重要的誠實**：文件明確寫了自己是什麼。

> 這是一個受限的編輯器原型。頁面預覽使用儲存的單節尺寸 / 頁邊距和內建的 Noto Sans 字型，**不是原生 DOCX 佈局的完整復現**。域、批註、修訂、多節、巢狀表格、浮動圖片、自動段落間距等不支援的結構，在進入編輯前就會被拒絕。

最後那半句是關鍵：**寧可在編輯前明確拒絕，也不讓使用者改完之後發現內容被吞了。**

### 3.4 Teamchat：許可權設計比功能列表更值得看

Slack 的替代品，1292 行 README 裡有大量篇幅在講許可權矩陣：

**角色**：owner、admin、member、guest。嘉賓可以被單獨邀請進某一個頻道，連結和邀請碼形狀一致、過期機制一致、暴力破解預算一致。**嘉賓只能看到自己所在的頻道和與自己共享頻道的人**，不能瀏覽、加入、建立頻道，不能邀請任何人，不能給陌生人發訊息，這些全部由 worker 在每一條路由上強制執行。

**管理員可以限制頻道發言**（公告頻道：所有人只讀和表態，側邊欄掛一個喇叭圖示），以及**獨立設定執行緒回覆許可權**（所有人 / 僅管理員 / 關閉）。同樣由 worker 強制執行，成員仍然可以編輯和刪除自己發的舊訊息。

**交付誠實**：原文寫 "Delivery is honest: a Puter worker only runs while handling a request"，即 worker 只在處理請求時執行。空口承諾不算承諾。

### 3.5 Whiteboard：把"引導式工作坊"做進產品

白板不只是畫圖。內建一整套會議引導機制：

- **實時反應**：8 種表情在畫布上飄浮，不寫入看板也不進撤銷歷史，需要實時 peer 連線
- **舉手**：按舉手順序顯示，螢幕閱讀器播報變化，人離開自動放下
- **點投票**：Miro 式點選物件投票，也支援徽章和無障礙列表投票，結果可隱藏到揭曉，支援時間限制，可匯出 CSV / JSON
- **私密模式**：每個人的新便籤對他人保持背面朝上，直到引導者一次性揭示
- **議程執行器**：有序畫框變成步驟，帶時長和說明，儲存為可複用內容後，引導者自己的劇本可以帶著原始時間插進來
- **跟隨演示**：跟隨者只看得到當前幻燈片，被畫框邊緣裁切

匿名模式在應用裡隱藏內容與姓名，README 明確註明：**它們不是加密**。

### 3.6 CAD：幾何核心是自己寫的

```
src/
  core/                # 無框架模型（可單元測試）
    schema.js            實體和圖紙資料模型
    drawing.js           帶撤銷重做的事務式繪圖
    spatial.js           用於拾取、選擇、捕捉的 R-tree 空間索引
    tessellate.js        實體到顯示列表（樣式、塊、文字、填充）
    geom/                幾何核心：求交、偏移、修剪、倒角...
    text/                筆畫字型和文字佈局
```

命令列支援自動補全、座標多種寫法（`x,y`、`@dx,dy`、`@distance<angle`、直接距離、`<angle` 鎖角）、英尺英寸與分數輸入、十二種物件捕捉、極軸追蹤。DXF 匯入匯出（R2000 ASCII）在 Web Worker 裡做。

### 3.7 PDF：真正把"刪除"做到位

它的安全刪除邏輯寫得非常剋制：

> 標記下的文字、圖片畫素、繪圖、連結和批註會**從檔案中移除，而不是被覆蓋**。標記下的表單欄位會在它出現的所有位置被移除。任何無法按常規處理的內容都會列出來供檢查。

OCR 用 Tesseract 在裝置本地完成，加一層不可見文字層，讓掃描件變得可搜尋可選擇。數字簽名用增量更新追加，早先的簽名保持有效。

---

## 四、設計哲學：這套東西為什麼值得研究

### 4.1 「無框架」是一種立場，不是省錢

React 有 40 萬行不是問題，問題是**你能不能解釋為什麼需要它**。這個專案的答案是：不需要。

Vanilla JS + Vite 的結果是：沒有框架升級帶來的破壞性變更，沒有 hydration 問題，沒有虛擬 DOM 和真實 DOM 之間的不一致，構建產物就是你能讀懂的程式碼。對一個要長期維護、可能被審計、可能需要被移植到其他執行環境的專業軟體來說，這是更安全的選擇。

**特別是 Documents 和 3D 這兩個最複雜的應用**，它們是"不寫框架"這個決定的最大受益者：文件引擎需要精確控制渲染和序列化的邊界，3D 引擎需要直接控制 WebGL 生命週期，框架在這兩個場景裡只會礙事。

### 4.2 「後端即平臺」：把複雜度集中到一處

每個應用都寫著 "no server of its own"。這帶來三個後果：

1. **應用側零配置**：沒有環境變數、沒有 API Key、沒有資料庫遷移。靜態託管即可。
2. **資料側統一**：賬號、許可權、儲存、KV、Worker、部署全部走同一套抽象，新應用接入成本極低。
3. **協作側自然**：因為儲存和 Worker 都在平臺側，多人協同、資料一致性、許可權校驗這些最難的部分由平臺統一提供。

**代價是應用高度依賴平臺。** 這是一個明確的取捨，不是免費的午餐。用 Puter.js 意味著你的應用不能獨立於 Puter 存在。

### 4.3 「不靜默丟失」是貫穿全專案的一條鐵律

這條原則在多個應用裡反覆出現，我把它單獨拎出來：

- Documents：*"用不支援的特性開啟文件時按盡力而為處理……不要掛上可能丟棄不支援內容的儲存處理器"*
- 3D：*"不支援的資料會被報告出來，而不是靜默丟失"*
- PDF：*"任何無法按常規處理的內容都會列出來供檢查"*
- Records（alpha）：*"功能可能變化，資料可能丟失"*
- CAD（alpha）：*"特性可能變化，圖紙可能丟失，請自行留副本"*

**這是一條把"使用者的資料安全"放在"功能演示效果"之前的原則。** 大多數創業專案做不到，因為 alpha 階段的 alpha 就是要把所有按鈕都點亮。但這裡選擇了在 README 第一段就寫"請不要依賴它"，並且在程式碼層面拒絕無法安全處理的操作。

### 4.4 「文件即規格」

看 documents 的文件結構就知道這是什麼做法：

```
src/documents/docs/
  conformance.md                          # 規範符合性記錄
  docx-parity-roadmap.md                  # 與 Word 的差距路線圖
  paragraph-property-coverage.md          # 段落屬性覆蓋情況
  run-property-coverage.md                # 字元屬性覆蓋情況
  field-code-coverage.md                  # 域程式碼覆蓋情況
  table-property-coverage.md              # 表格屬性覆蓋情況
  theme-structure-coverage.md             # 主題結構覆蓋情況
  shape-fill-outline-coverage.md          # 形狀填充與輪廓覆蓋情況
  comment-revision-property-coverage.md   # 批註修訂屬性覆蓋情況
  ...（共 20+ 份覆蓋度文件）
  parity/                                 # 按功能域拆分的差距清單
    chrome.md, collab.md, design.md, draw.md, format.md,
    insert.md, mailings.md, pictures.md, references.md,
    review.md, tables.md, views.md
```

而且規矩很硬：

> 為每個編輯器功能，記錄相關的 ECMA-376 / OOXML 條款和已支援子集。加上行為測試以及獨立生成的 DOCX fixture，用 `npm run check:conformance` 驗證瀏覽器匯出。**在宣告功能完成之前，修正規範審查發現的差異。明確記錄剩餘的差距；schema 透過不等於完整的 OOXML 符合性或佈局保真度。**

**"schema 透過不等於佈局保真度"** 這句話，是整份文件裡最值錢的一句。它戳破了軟體工程裡一個非常常見的自欺：資料模型對上了，不代表渲染結果對。

同樣的嚴謹度體現在 Documents 的測試結構上：光 `tests/fixtures/` 下面就有幾百個目錄，每個目錄對應一個細分特性（`border-round-continuous`、`cjk-wrap`、`script-line-boxes`、`para-line-units-default-24`……）。有些 fixture 目錄裡甚至還有自己的 README，說明這個特性具體測什麼。

### 4.5 「AI 是功能，不是主角」

這個專案最反潮流的一點是：**它幾乎不談 AI。**

Spreadsheet 裡 AI 是單元格函式 `AI()`。3D 裡有 AI 助手側邊欄。Whiteboard 裡有 AI 整合。但整個倉庫的敘事主線是"重建世界的軟體"，AI 只是若干應用裡的一個能力。

對比一下當下開源專案動輒把 "AI-native"、"agentic" 掛在標題上的風氣，這專案顯得像個老派工匠。**但它把力氣全花在了對的地方**：510 個 Excel 函式、4 萬行 3D 幾何與渲染、乾淨的資料結構、兩千多個測試 fixture。這些東西 AI 寫不出來，因為它們需要幾十年的領域知識沉澱和耐心。

### 4.6 「把許可證合規寫進 CI」

`check:licenses` 不是一個提醒，是一道會擋住構建的門（`prebuild` 鉤子）。而且規矩明確禁止"為了過檢查而放寬白名單"。

在一個 AI 可以批次生成程式碼的年代，許可證汙染是最容易發生的合規事故。這條規則來得正是時候。

---

## 五、歸納總結：八個可遷移的觀點

**觀點一：專業軟體的護城河在資料結構，不在介面。** 3D 的 40 萬行裡，最核心的是 `data/types.ts` 裡的 data-block 表（objects、meshes、materials、node_groups、actions）和依賴圖求值。UI 是殼，資料模型是命。AI 能幫你寫介面，寫不出成熟的文件物件模型。

**觀點二：「無伺服器」不等於「無架構」，是把架構集中投資。** 這個專案沒有在每個應用裡重複實現使用者系統、許可權、儲存，而是把這些沉到平臺層，然後專心做差異化功能。這是平臺型創業的標準路徑，但很少有開源專案敢做得這麼徹底。

**觀點三：誠實的降級比勉強的相容更有價值。** Documents 寧可編輯前拒絕不支援的結構，也不做"看起來能開啟但存下去丟內容"的假相容。同樣的判斷力體現在 3D 不支援匯出 `.blend`、CAD 明確標註 alpha。**產品信任是這麼攢出來的。**

**觀點四：文件的質量決定專案的上限。** Spreadsheet 那 1200 行 README 本身就是產品說明書；Documents 那 20 多份覆蓋度文件是工程資產。對比一下大部分開源專案 README 裡"Contributing welcome!"的空白，這個專案的文件密度高出一個數量級。

**觀點五：測試夾具（fixture）比單元測試更能逼近真實複雜度。** Documents 為每個細分排版特性建獨立 fixture 目錄，比一個大而全的測試檔案更容易定位迴歸。**按特性維度切分測試，比按函式維度切分更貼近 bug 的發生方式。**

**觀點六：把「一致性」做成 CI 契約。** `amplify.yml` 要求每個應用都有條目，`customHttp.yml` 明確"找不到條目就部署失敗"，`check:licenses` 掛在 `prebuild` 上。**規則寫進配置，而不是寫進 wiki。** wiki 會過時，CI 不會。

**觀點七：AI 應該是檔案格式裡的一等公民。** `AI()` 作為 Excel 函式、`TRANSLATE()` 作為內建函式，比"加個 AI 側邊欄"更有用。因為使用者要的是**在具體工作流裡的一步**，不是一個需要額外切換的獨立工具。

**觀點八：對這個專案最理性的使用方式，是當架構教材而不是當產品。** 它自己都寫了 "Early alpha"、"do not rely on it for real projects yet"。所以正確的讀法是：**讀它的 AGENTS.md、ARCHITECTURE.md、conformance.md，然後在自己有真實商業約束的場景裡，複製它的判斷，而不只是複製它的程式碼。**

---

## 六、老闆視角：這堆程式碼跟生意有什麼關係

上面全是工程視角，做生意的人可能想問：這個東西對我有什麼用？

**第一，它是一份用真金白銀換來的"功能清單"。** 53 個應用覆蓋了從個人效率到企業經營的完整鏈條。哪個品類你做了很多年還沒找到好的開源方案，看一眼這個清單，可能就找到了現成的起點。

**第二，它證明了一件事：軟體的生產成本正在塌方，但塌的是哪一截要看清楚。** 40 萬行的 3D 引擎、25 萬行的 PPT 引擎，寫它們的成本在 AI 輔助下會持續下降。**但 Spreadsheet 裡那 510 個函式的邊界情況、Documents 裡那幾百個 fixture 背後的規範知識，不會因為 AI 更強就自動出現。** AI 能寫實現，寫不出"知道哪條規範條款要覆蓋"。

**第三，"不寫後端"正在變成一種可行的架構風格。** 如果你的業務裡，每個應用都自己搭一遍使用者系統、許可權、儲存，你會在第三個應用上耗盡耐心。這個專案的做法是：把這些沉到一個平臺層。**對做 SaaS 的老闆來說，這是成本結構的重排，不是技術選型的偏好。**

**第四，最值錢的一條：資料主權是可以被工程化的。** "你的檔案存在你自己的雲上"聽起來像營銷詞，但落到實現上是一整套具體決策：存真實 `.xlsx` 而不是私有格式、用真實 `.docx` 而不是自有結構、不靜默丟棄、匯出路徑完整。對做企業服務的老闆來說，**這意味著你的客戶不被鎖定，而你的產品不被平臺的策略變更綁架。**

---

## 七、寫在最後

我翻完這個倉庫，最強烈的感受不是"這些應用真厲害"，而是**一種久違的耐心**。

53 個應用，每個都是從零實現，沒有一個是套殼。40 萬行的 3D 引擎，8,711 個測試檔案，幾百個排版特性 fixture，20 多份 OOXML 覆蓋度文件。這些東西沒有 AI 幫忙的時候，一家公司要花多少錢多少年才做得出來？現在，它全部躺在 GitHub 上，MIT 和 AGPL 混合，免費。

這不是"顛覆 Microsoft Office"的故事。這是一個更樸素也更值得尊重的故事：**有人決定認真做一件難很久的事，然後把它放在大家都能拿到的地方。**

至於要不要用？我的建議是：**程式碼隨便拿，文件認真讀，alpha 的部分謹慎跑，許可證先看清楚。** 這四句話，恰好就是這個專案教給我們最好的東西。

---

## 附：核心資料索引

| 用途 | 路徑 |
|---|---|
| 專案總覽 | `README.md` |
| 許可與依賴紅線 | `src/documents/AGENTS.md` |
| 3D 引擎架構 | `src/3d/ARCHITECTURE.md` |
| 功能規格範本 | `src/spreadsheet/README.md` |
| OOXML 符合性記錄 | `src/documents/docs/conformance.md` |
| 多應用部署配置 | `amplify.yml` / `customHttp.yml` |
| 本地域名外掛 | `dev/puter-localhost.mjs` |

> 相關的中文譯本已同步至公開程式碼倉庫的 `docs/everything-translations/` 目錄，包含專案總覽、Spreadsheet、Documents、3D Studio、CAD、Teamchat、PDF、3D 架構與依賴規範共 9 份文件的完整中文翻譯。

---

**口徑說明**：本文基於 HeyPuter/everything 公開倉庫 <https://github.com/HeyPuter/everything> 的 commit `f45527dee1f82c816849e6a3854c09da591f50b8` 整理，程式碼行數、檔案數、測試檔案數均為本地完整克隆後按統一口徑統計得出（排除 node_modules、dist、tests、vendor、tmp 目錄），各應用行數按同一口徑逐個統計。許可證資訊取自各子應用 package.json 的 `license` 欄位與倉庫內 LICENSE 檔案，MIT 與 AGPL-3.0-only 混用情況已逐個核對。文中引用的應用功能描述、限制說明與警示（如 CAD 的 "Early alpha"、3D 的 clean-room 宣告與不支援匯出 .blend）均譯自官方 README 原文，未作美化。文件中文譯本已同步釋出在配套程式碼倉庫的 `docs/everything-translations/` 目錄，共 9 份。文中關於設計哲學、歸納觀點與商業影響的分析為本人判斷，不代表專案官方立場。

---

Eric|瑞哥
廣東 深圳

✅前IBM架構師｜區塊鏈書《區塊鏈核心技術與應用》合著作者
技術程式碼倉庫:https://github.com/gyc567
個人網站:www.topdigg.com
💼新加坡資管公司前CTO
👉公眾號「瑞哥觀勢」主理人
💎聚焦在:創富和守富
🎯專注老闆群體：用AI 降本增效
微信:360369487

---

在這個快節奏的時代，我依然相信面對面、小範圍、高濃度的連結力量。

我致力於搭建一個"去泡沫化"的老闆圈子，重點關注：

🔹 電商全域：國內直播、跨境電商與出海專案孵化

🔹 創投與產投：金融銀行資源對接、企業融資與併購

🔹 內容生態：MCN機構、達人矩陣與品牌整合

🔹 組織建設：企業核心團隊搭建、高管尋訪

**【我的線下局】**

不辦大會，只辦"小會"。

✅ 創業私董會：深度剖析商業難題

✅ 老闆閉門飯：連結同頻靈魂，甚至解決人生大事（高質量單身圈層）

✅ 行業沙龍：聚焦具體賽道，促成實質合作

**篩選標準：**

只歡迎有結果、有邊界感、有長期主義心態的創始人/合夥人。

時間寶貴，只留給有價值的人。
