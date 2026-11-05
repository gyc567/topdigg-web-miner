---
title: "有人把 1407 張 AI 服裝圖做成網站，還接了虛擬試穿：拍片哥女裝項目完整拆解"
date: "2026-11-05"
description: "深度拆解 paipiange/nvzhuang：一個零建置純靜態服裝圖庫 + GoFrame AI 換裝後端。附完整部署教學、多模型接入配置、介面安全設計解析與六大設計哲學。"
author: "瑞哥观势"
tags:
  - 開源項目分析
  - AI換裝
  - 虛擬試穿
  - GoFrame
  - ComfyUI
  - 多模型適配
  - 安全設計
categories:
  - 開源項目分析
keywords:
  - paipiange nvzhuang
  - AI 虛擬試穿
  - AI 換裝後端
  - GoFrame 開源項目
  - ComfyUI 本地換裝
  - 多模型適配器
  - API 安全防護
  - 純靜態前端
---

# 有人把 1407 張 AI 服裝圖做成網站，還接了虛擬試穿

先說結論。

`paipiange/nvzhuang` 是一個 2026 年 10 月底才建倉、到 11 月 4 日已經拿到 **2193 Star / 555 Fork** 的專案。它的技術堆疊簡單到有點反直覺：前端是一個 3278 行的 `index.html`，後端是 GoFrame v2，AI 換裝靠提示詞工程 + 多模型適配器完成。

但它做對了幾件很難的事，這些事比程式碼量重要得多：

**第一，它把「零成本可用」和「高品質能力」做成了兩層，而不是一個。** 圖庫部分完全免費、零部署、零 Key，開啟網頁就能用；AI 換裝部分需要自架後端、自備 Key。絕大多數同類專案會選擇把核心功能鎖在付費牆後面，或者乾脆做成一個需要登入的 SaaS。它沒有。

**第二，它在 6 天內補上了一整套生產級 API 安全防護。** Bearer Token 鑑權（SHA-256 摘要 + 恆定時間比較）、嚴格 CORS 白名單、權杖桶限流、每日額度、並行鎖、請求主體上限、像素炸彈防護、SSRF 防護。這套東西不是「順手加的」，是被一份寫得像產品文件的安全需求文件驅動出來的。

**第三，它用提示詞工程繞開了模型審核這個真實世界約束。** 程式碼裡有一段註解寫得很直白：GPT-Image 系列對真人換裝場景會被官方安全審核攔截，所以預設模型是 Gemini，並且專門為 GPT-Image 寫了一套「防封控」提示詞模板。這不是 hack，這是工程妥協，但它誠實。

接下來，本文會帶你把這個專案拆開看：它是什麼、怎麼跑起來、安全是怎麼做的、以及它背後的設計哲學。

---

## 一、專案說明：它到底是什麼

### 1.1 一句話定位

> **衣装集 COSTUME-DB-01**：1407 套寫實真人版 + 1320 套二次元動漫版 AI 生成純服裝圖像（2:3 比例，人物不入鏡），支援中英雙語檢索、多維篩選，配備可選的 AI 一鍵虛擬試穿。

### 1.2 三個圖庫

| 圖庫 | 數量 | 內容 | 資料檔案 |
|---|---|---|---|
| 寫實服裝 | 1407 套 | 真人風格純服裝展示 | `data.js` |
| 二次元動漫服裝 | 1320 套 | 動漫插畫風格服飾 | `data-anime.js` |
| AI 模特臉部/造型庫 | 1499 位 | 臉部特寫（Face）與造型（Styling） | `data-portrait.js` |

合計超過 4200 組參考素材。模特庫來自 CC0 1.0 授權的 `ai-portrait-gallery` 專案，支援按短髮/中髮/中長髮/長髮以及 50 種具體髮型（如波波頭、微捲、一刀切）精準篩選，支援中日英三語檢索。

### 1.3 8 大分類（保留日文原名）

資料檔案裡的分類欄位是日文，這是**為了相容原始資料來源而刻意保留**的，前端會自動本地化成中文或英文：

| 分類（日文原名） | 中文 | 數量 |
|---|---|---:|
| 春 | 春季 | 215 |
| 夏 | 夏季 | 254 |
| 秋 | 秋季 | 244 |
| 冬 | 冬季 | 253 |
| ランジェリー | 內衣 | 199 |
| パーティ | 派對 | 48 |
| 水着 | 泳裝 | 54 |
| セクシー | 性感風格 | 140 |
| **合計** | | **1407** |

專案自帶了一份《圖庫內容合規與社群發布審查報告》，明確把前 5 類共 1014 件判定為低風險、推薦作為宣傳素材；後 3 類共 393 件判定為中到高風險，規定只作為完整資料集的一部分被動檢索，不設首頁特權置頂。

**這個細節值得單獨說一句**：一個圖庫專案主動給自己的內容分級、給推廣素材劃紅線、規定哪些內容不能當封面用，這是有社群意識的作者才會做的事。絕大多數同類專案只會想著怎麼多放幾張圖。

### 1.4 資料結構：欄位名是日文，值是英文

```javascript
const META={"total":1407,"cats":["春","夏","秋","冬","ランジェリー","パーティ","水着","セクシー"],
"counts":{"春":215,"夏":254,"秋":244,"冬":253,"ランジェリー":199,"パーティ":48,"水着":54,"セクシー":140}};

const D=[{
  "id":"SPR-0001",
  "カテゴリ":"春",
  "キーワード":"ivory frill knit denim mini skirt coat socks white sneakers",
  "サムネ":"thumbs/SPR-0001.webp",
  "画像":"img/SPR-0001.webp",
  "原寸":"png/SPR-0001.png"
}];
```

| 欄位 | 說明 |
|---|---|
| `id` | 編號，如 `SPR-0001` |
| `カテゴリ` | 分類（日文分類名） |
| `キーワード` | 關鍵詞（英文，空格分隔） |
| `サムネ` | 縮圖路徑（WebP） |
| `画像` | 展示圖路徑（WebP） |
| `原寸` | 原尺寸 PNG 路徑 |

欄位名是日文（`カテゴリ`、`キーワード`、`サムネ`、`画像`、`原寸`），這是資料來源的原始 schema，保留它是為了不破壞相容性。值是英文關鍵詞（`ivory frill knit denim mini skirt coat socks white sneakers`），所以中英文雙向檢索才能運作：中文模式輸入「白」能命中，是因為前端做了關鍵詞本地化映射。

**一個容易踩的坑**：原尺寸 PNG（約 1GB+）沒有納入倉庫，`原寸` 欄位指向的 `png/*.png` 在 GitHub Pages 上會 404。專案的處理方式是前端下載時自動平滑回退到已託管的高清 WebP 大圖，保證按鈕不點空。

### 1.5 AI 換裝：圖 1 + 圖 2 ➔ 圖 3

試穿流程的本質是把兩張圖餵給圖像模型，讓它合成一張：

- **圖 1**：選中的服裝參考圖（來自內建圖庫，或使用者自己上傳）
- **圖 2**：使用者上傳的模特照片
- **圖 3**：AI 合成的換裝效果（保留模特五官髮型，融合服裝材質與剪裁）

支援寫實真人和二次元動漫雙風格。專案還與兄弟專案 `ai-pose-gallery-zh`（288 組 / 1439 張多角度姿勢參考）聯動，形成「姿勢參考 + 人物參考 → AI 生成」的完整工作流。

---

## 二、核心思想

如果只能記住三句話，是這三句。

### 思想一：靜態站負責「零摩擦」，後端負責「高品質」

這是整個專案最核心的架構判斷。

大部分 AI 換裝專案會把前後端綁死：想用？先部署後端、先買 Key、先填 Base URL。對個人使用者來說，這個門檻勸退了 99% 的人。

`nvzhuang` 的做法是**能力分層**：

```
┌─────────────────────────────────────────┐
│  第一層：純靜態前端（零部署、零 Key）      │
│  · 4226 套圖庫瀏覽                        │
│  · 中英雙向檢索 / 分類篩選                 │
│  · 大圖全螢幕 / 鍵盤翻頁 / 原圖下載          │
│  · 手動搭配台（純瀏覽器抠圖組合）           │
│  · 以圖搜同款（淘寶 / 拼多多）             │
│  · 本地生成記錄（IndexedDB）              │
│  ↓ 使用者真的想要 AI 換裝了                    │
├─────────────────────────────────────────┤
│  第二層：可選 GoFrame 後端（自架、自備 Key）  │
│  · 真正的 AI 換裝生成                     │
│  · 5 種模型協議可插拔                     │
│  · ComfyUI 本地離線，零成本                 │
└─────────────────────────────────────────┘
```

第一層 100% 免費且無需任何準備，開啟 `https://paipiange.github.io/nvzhuang/` 就能用。第二層才是需要付費能力的部分，而且**明碼標價**：專案在 README、前端頁面、稽核報告三處都顯式標註「需自備後端與 API Key，可能產生模型費用」。

**這種分層，本質上是把「獲客成本」降到零，把「變現點」留在真正有價值的地方。**

### 思想二：模型是外掛，不是硬編碼

後端定義了一個極簡的適配器介面：

```go
// ImageGenerator 图像生成模型适配器接口
type ImageGenerator interface {
    // Generate 生成换装图。入参为两张图的 base64（人像 + 服装），返回结果图 base64
    Generate(ctx context.Context, personB64, garmentB64, prompt, size string) (string, error)
    // Name 模型别名（对外暴露的名称）
    Name() string
}
```

然後每種協議實作一個適配器：`gpt_image.go`（OpenAI Images 協議）、`doubao.go`（火山方舟協議）、`gemini.go`（Google generateContent 協議）、`comfyui.go`（本地工作流）。

配置檔案裡加一段就能接入一個全新的國內模型，**不需要改一行程式碼**：

```yaml
llm:
  models:
    qwen:                 # 通义万相示例
      provider: openai
      envKey: "DASHSCOPE_API_KEY"
      baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1"
      model: "wanx2.1-t2i-turbo"
```

### 思想三：安全是產品特性，不是上線前的補丁

這是本專案和絕大多數開源專案最大的差別。

它有一份獨立的《AI 換裝介面保護與圖片校驗功能需求》文件，長達 562 行，結構完全是產品需求文件的寫法：使用者故事 → 證據表（Evidence）→ 結論表（Findings）→ 功能需求（FR-1 到 FR-16）→ 錯誤碼表 → 配置項。

文件裡的 Evidence 表長這樣：

| ID | 程式碼位置 | 目前觀察 | 複核命令 |
|---|---|---|---|
| E-001 | `backend/internal/cmd/cmd.go` | 目前只註冊回應和預設 CORS 中介層，沒有存取鑑權和限流 | `rg -n "Middleware\|CORSDefault" backend/internal/cmd/cmd.go` |
| E-002 | `backend/api/tryon/v1/tryon.go` | `/tryon` 可以直接接收兩張 Base64 圖片並觸發生成 | `rg -n "PersonImage\|GarmentImage\|path:\"/tryon\"" backend/api/tryon/v1/tryon.go` |
| E-003 | `backend/internal/logic/tryon/gpt_image.go` | `decodeB64` 只檢查 Base64 解碼結果 | `rg -n "func decodeB64" backend/internal/logic/tryon/gpt_image.go` |

Findings 部分直接給出結論：

- **F-001**：公開部署時，任何人都可能呼叫生成介面 → 可能消耗模型額度或佔滿本地 GPU
- **F-002**：合法 Base64 不等於合法、安全的圖片 → 可能造成記憶體、CPU、頻寬浪費或模型呼叫失敗

**這種「先取證、再下結論、最後給方案」的寫法，比大部分公司的安全 PRD 都規範。** 而且它真的被執行了——我通讀了 `internal/security/` 和 `internal/middleware/` 的全部實作，需求文件裡的 FR-1 到 FR-16 全部有對應程式碼。

---

## 三、設計哲學：六條可以遷移的原則

這部分是我認為這個專案最有價值的產出。技術會過時，但下面這些判斷不會。

### 哲學 1：Fail-Safe Defaults（失敗時回到安全狀態）

這條被寫進了 `AGENTS.md` 的架構規範，並在程式碼裡嚴格執行：

> 後端服務在啟動時，若偵測到主機未顯式建立 `config.yaml`，必須具備程式碼層自動回退載入 `config.example.yaml` 的能力。

```go
// InitConfigFallback 检查并保障配置文件就绪：
// 若当前没有可用的 config.yaml，自动尝试回退加载 config.example.yaml。
func InitConfigFallback(ctx context.Context) {
    if !g.Cfg().Available(ctx) {
        candidates := []string{
            "manifest/config/config.example.yaml",
            "config/config.example.yaml",
            "config.example.yaml",
        }
        for _, path := range candidates {
            if gfile.Exists(path) {
                ...
            }
        }
    }
}
```

同理還有連接埠兜底：

```go
// EnsureServerPort 确保 Server 具备显式监听端口，避免未配置时随机分配高位端口 (:0)
func EnsureServerPort(ctx context.Context, s *ghttp.Server) {
    addr, err := g.Cfg().Get(ctx, "server.address")
    if err != nil || addr.IsEmpty() {
        s.SetPort(8000)
        g.Log().Info("未指定 server.address 配置，已显式绑定默认端口 :8000")
    }
}
```

**為什麼這條重要？** 因為 Go 的 `net/http` 在 `ListenAndServe(":0")` 時會分配一個隨機高位連接埠。AGENTS.md 裡特別點名了這個坑：

> 絕對禁止因未配置 address 而進入系統 `:0` 隨機高位臨時連接埠（如 `:37093`）。

容器化部署裡，一個隨機的 `server.address` 配置缺失，會讓健康檢查、反向代理、容器編排全部失靈——而且不報錯，只表現為「服務起來了但存取不到」。這種 bug 極難排查。

### 哲學 2：零洩漏原則（Zero Leakage）

`AGENTS.md` 開篇就是一條紅線：

> 絕對禁止將任何真實的 API Key（包括但不限於 OpenAI `sk-...`、火山方舟 `ARK...`、Google Gemini `AIza...`、通義千問 `sk-...` 等）、私有 Token、密碼、憑證金鑰提交到 Git 倉庫或暫存區。

配套的落地手段：

- `config.yaml`、`.env` 全部進 `.gitignore`，倉庫裡只保留 `config.example.yaml` 和 `.env.example`
- 模板裡的 Key 欄位必須是空字串或 `sk-你的key` 這類佔位符
- 前端的「個人模型設定」只存在瀏覽器 `localStorage`，後端只在記憶體中使用，**不寫資料庫、不寫設定檔、不寫業務日誌**
- 日誌只允許記錄 MIME、寬高、位元組數和最多 16 位 SHA-256 前綴，不記錄圖片內容和完整雜湊值

更狠的是提交前的自查清單，直接寫成了可執行命令：

```markdown
- [ ] **步驟 1**：執行 `git status`，確保沒有臨時檔案、日誌檔案、編譯產物、真實設定檔進入暫存區。
- [ ] **步驟 2**：逐行審查 `git diff --cached`，確認無真實 Key、無個人姓名電話、無除錯遺留硬編碼憑證。
- [ ] **步驟 3**：敏感字串安全掃描，執行正則 `(sk-[a-zA-Z0-9]{20,}|AIza[a-zA-Z0-9]{20,})`。
- [ ] **步驟 4**：執行 `go test ./...` 與 `go vet ./...`，確保程式碼編譯通過、測試全綠。
```

**這條清單本身就可以直接抄走用。** 它把「要小心」這種口號變成了四個具體的門檻。

### 哲學 3：隱私邊界要在文件裡說清楚，而不是藏起來

專案在多處明確標註資料流向：

- 自訂上傳的服裝原圖**僅保留在當前頁面記憶體中**，不寫入本機儲存或生成記錄，重新整理或關閉頁面後自動清除
- 生成記錄只保存在當前瀏覽器的 IndexedDB，**不上傳、不跨裝置同步**
- 生成時只將**壓縮後**的圖片內容傳送到使用者設定的換裝後端

這個透明度很關鍵。AI 換裝涉及人像照片，使用者最怕的就是「我的照片去哪了」。專案沒有含糊其辭，而是把資料流畫清楚。

### 哲學 4：顯式拒絕優於靜默降級

錯誤回應不是籠統的「生成失敗」，而是精確到業務碼：

| HTTP | 業務碼 | `error_code` | 使用者提示 |
|---:|---:|---|---|
| 401 | 40101 | `AUTH_REQUIRED` | 請在設定中心填寫後端存取 Token |
| 401 | 40102 | `AUTH_INVALID` | 後端存取 Token 無效 |
| 403 | 40301 | `ORIGIN_NOT_ALLOWED` | 目前頁面來源不允許存取後端 |
| 429 | 42901 | `RATE_LIMITED` | 請求過於頻繁，請稍後重試 |
| 429 | 42902 | `DAILY_QUOTA_EXCEEDED` | 今日生成額度已用完 |
| 429 | 42903 | `CONCURRENCY_LIMITED` | 目前生成任務較多，請稍後重試 |
| 413 | 41301 | `REQUEST_TOO_LARGE` | 上傳內容過大，請壓縮圖片後重試 |
| 422 | 42201 | `INVALID_IMAGE_BASE64` | 圖片資料損毀，請重新選擇圖片 |
| 422 | 42202 | `UNSUPPORTED_IMAGE_TYPE` | 僅支援 JPEG、PNG 和 WebP |
| 422 | 42203 | `IMAGE_FILE_TOO_LARGE` | 圖片檔案過大，請壓縮後重試 |
| 422 | 42204 | `IMAGE_DIMENSIONS_INVALID` | 圖片尺寸不符合要求 |
| 422 | 42205 | `IMAGE_PIXEL_LIMIT_EXCEEDED` | 圖片像素過高，請縮小後重試 |

前端根據 `error_code` 顯示中英文提示，**不依賴後端原始錯誤字串做正規表示式比對**。

而且所有錯誤回應必須包含 `request_id`，不得包含 Token、模型 API Key、圖片 Base64 或供應商原始敏感錯誤。

### 哲學 5：讓模型適配和業務邏輯解耦

`tryon.go` 的主流程很短，但每一步的判斷都帶著明確的理由：

```go
// 默认模型：Gemini（Nano Banana 2），因为 GPT Image 系列对真人换装场景
// 会被官方安全审核拦截（moderation_blocked / sexual），Gemini 无此限制。
if model == "" {
    model = "gemini"
}

var gen ImageGenerator
if clientConfig != nil {
    gen, err = NewGeneratorFromClientConfig(clientConfig)
} else {
    gen, err = NewGenerator(ctx, model)
}

// 构建提示词：
// 1. GPT-Image-2 专门使用防封控安全提示词；
// 2. Gemini 保留原英文稳定提示词；
// 3. 豆包等其他模型保留原提示词（按语言选择）。
var promptStr string
isGemini := (clientConfig != nil && strings.EqualFold(clientConfig.Provider, "gemini")) || gen.Name() == "gemini"
if isGPTImageModel(model, clientConfig, gen.Name()) {
    promptStr = BuildGPTSafety(lang)
} else if isGemini {
    promptStr = BuildGemini(lang)
} else {
    promptStr = BuildDefault(lang)
}
```

注意最後那個錯誤處理的處理方式：

```go
result, err := gen.Generate(ctx, personB64, garmentB64, promptStr, size)
if err != nil {
    // 不记录原始错误：网络错误可能包含用户自定义 Base URL，供应商响应也可能含敏感信息。
    return "", "", "", gerror.Wrap(err, "换装生成失败，请稍后重试")
}
```

**為什麼不記錄原始錯誤？** 因為使用者的 `client_config.base_url` 可能被拼進網路錯誤資訊裡，而供應商的回應主體可能包含敏感內容。直接吞掉原始錯誤、統一成一句友好提示，是這裡最安全的選擇。

### 哲學 6：文件和程式碼必須對得上

這個專案有一份 `nvzhuang.md` 任務書，專門用來修文件和程式碼的落差，裡面點名了具體的不一致：

> 1. README 的根目錄啟動命令為 `cp backend/.env.example backend/.env` 後在**倉庫根目錄**執行 `docker compose up -d`，但 Compose 預設優先從工作目錄讀取 `.env`。應檢查並修正這一誤導。
> 2. 前端下拉選單預設模型是 `gemini`；API 請求結構的 `Model` 預設值寫 `gpt-image`，而部分業務邏輯註解/空值兜底又寫 `gemini`。必須核對 GoFrame 預設值真正生效路徑，統一 README/前端/後端說明，**不得簡單聲稱「預設 GPT Image 2」**。

第二點尤其有意思——它連「文件裡三種說法不一致」這種極細的落差都抓出來了。這背後是作者（或者說替作者寫任務書的 AI）的一種執念：**文件漂移是技術債，而且是最容易被忽略的那種。**

---

## 四、詳細教學：從零跑起來

### 4.1 環境需求

| 用途 | 需求 |
|---|---|
| 前端靜態站 | 現代瀏覽器即可，或 Python 3 / Node |
| 後端編譯執行 | Go 1.18+ 或 Docker |
| 雲端 AI 換裝 | 至少一個模型 API Key |
| 本地 AI 換裝 | ComfyUI + 獨立顯示卡（推薦），無需任何 Key |

### 4.2 第一步：跑前端（無需任何設定）

前端是純靜態站，**不需要建置**。

```bash
# 方式一：Python 內建伺服器（推薦，連接埠 3000，與後端 8000 不衝突）
python3 -m http.server 3000

# 方式二：Node 簡單伺服器
npx serve -l 3000 .

# 方式三：直接用現代瀏覽器開啟 index.html
```

瀏覽器存取 `http://localhost:3000`。

此時你已經有：4226 套圖庫、中英雙語檢索、分類篩選、大圖全螢幕、鍵盤翻頁、無限捲動、原圖下載、手動搭配台、以圖搜同款、IndexedDB 本地生成記錄——**全部免費，零 Key，零後端**。

> ⚠️ **連接埠別和後端撞車**：靜態站用 3000，後端用 8000。專案原任務書專門指出過這個混淆問題。

### 4.3 第二步：起後端（Docker，最省事）

```bash
cd backend

# 1. 複製環境變數模板並填入你的 Key
cp .env.example backend/.env
# 編輯 .env，例如：ARK_API_KEY=xxxx（國內推薦豆包，無需翻牆）

# 2. 一鍵啟動（內建開箱即用兜底，預設監聽 8000 連接埠）
docker compose up -d

# 3. 查看日誌
docker compose logs -f
```

服務啟動後監聽在 `http://localhost:8000`。

**注意**：必須在 `backend/` 目錄下執行這條命令（先 `cd backend` 再 `cp .env.example .env`）。如果在倉庫根目錄執行，Compose 會去讀根目錄的 `.env`，讀不到後端的設定——這是專案任務書裡專門點名過的坑。

Docker 單容器方式：

```bash
cd backend
docker build -f manifest/docker/Dockerfile -t costume-tryon .

docker run -d --name costume-tryon -p 8000:8000 \
  -e ARK_API_KEY="你的豆包ArkKey" \
  -e OPENAI_API_KEY="sk-你的OpenAIKey" \
  costume-tryon
```

Windows 使用者有個偷懶福利：直接雙擊 `backend/restart.bat`，自動編譯並啟動。

無 Docker 環境（原始碼執行）：

```bash
cd backend
# 可選：複製設定檔（不複製時系統會自動安全回退載入模板並監聽 8000）
# cp manifest/config/config.example.yaml manifest/config/config.yaml
export ARK_API_KEY="你的Key"      # Windows PowerShell 用 $env:ARK_API_KEY="你的Key"
go run main.go
```

### 4.4 第三步：設定前端指向後端

前端 `index.html` 依以下優先順序辨識換裝後端位址（**由高到低**）：

1. **設定中心**：使用者在當前瀏覽器儲存的「後端 API 位址」（跨來源外部公網後端須使用 **HTTPS**）
2. **全域變數**：在 HTML 載入前設定 `window.AI_API_URL = "http://localhost:8000"`
3. **URL 參數**：`https://你的前端位址/?tryon=http://localhost:8000`
4. **本機回退**：以 `localhost` 或 `127.0.0.1` 存取前端時，預設自動連線 `http://127.0.0.1:8000`

關於第 3 條，有一條**安全約束**必須知道：

> 為防止釣魚竊取 API Key 與私密照片，`?tryon=` 僅允許同來源或本機回環 `localhost`/`127.0.0.1`；外部後端須在設定中心明確儲存。

也就是說，**你不能在公網網頁上用 `?tryon=` 指向一個陌生後端**，這是防 SSRF 和防釣魚的設計。

前端還有幾個 URL 參數很實用：

```
?lang=en           # 初始語言（zh / en，預設 zh）
?q=lace            # 初始搜尋詞
?lang=en&q=white   # 組合使用
```

### 4.5 第四步：多模型接入

後端透過設定檔的 `llm.models` 管理模型，**Key、Base URL、模型名三項全部可配**：

```yaml
llm:
  models:
    gpt-image:              # 前端請求用的別名
      provider: openai      # 協議：openai / doubao / gemini
      apiKey: ""            # 直接填 Key，或留空用環境變數
      envKey: "OPENAI_API_KEY"   # 環境變數名（優先級高於 apiKey）
      baseURL: "https://api.openai.com/v1"
      model: "gpt-image-2"

    doubao:                 # 豆包（火山方舟），國內可用
      provider: doubao
      envKey: "ARK_API_KEY"
      baseURL: "https://ark.cn-beijing.volces.com/api/v3"
      model: "doubao-seedream-3-0-t2i-250415"

    gemini:                 # Google Nano Banana 2
      provider: gemini
      envKey: "GEMINI_API_KEY"
      baseURL: "https://generativelanguage.googleapis.com/v1beta"
      model: "gemini-3.1-flash-image"
```

**四種協議的區別**（這是接入時最容易搞混的地方）：

| provider | 協議 | 說明 |
|---|---|---|
| `openai` | `POST {baseURL}/images/generations` + `input` 陣列 | OpenAI 官方 GPT-Image、通義萬相、智譜 CogView、矽基流動、多數中轉站 |
| `doubao` | 同上 `/images/generations`，但請求主體是火山格式（`prompt` + `image[]`），回傳 `url` | 豆包 Seedream |
| `gemini` | Google 原生 `generateContent` | Gemini 圖像模型 |
| `comfyui` | 本機 ComfyUI API + 服務端固定工作流 | 本地離線，不接受 `client_config` |

**接一個國內模型，只需要在 `llm.models` 下加一段**，前端下拉選單在 `index.html` 的 `<select id="aiModel">` 中增減 `<option>` 即可對應。

### 4.6 第五步：ComfyUI 本地離線模式（零成本、免 Key）

這是本專案最有想像力的部分：**讓你的顯示卡替你付費**。

系統內建**雙工作流自適應**：

| 工作流 | 模型 | 特點 |
|---|---|---|
| **Qwen-Image-Edit-2511（優先預設）** | `qwen_image_edit_2511_int8_convrot.safetensors` + 4 步 Lightning LoRA | 4 步極速生成，語義換裝保真度更高 |
| **MiniMax H3（相容保留）** | H3 Ref2VA 影片模型抽取第 31 影格定格 | 兜底方案 |

呼叫時系統自動偵測可用狀態：優先 Qwen，未就緒自動平滑回退 H3；也可以透過 `comfyui-qwen` 或 `comfyui-h3` 明確指定。

**準備模型檔案：**

```bash
# Qwen-Image-Edit
models/diffusion_models/qwen_image_edit_2511_int8_convrot.safetensors
models/text_encoders/qwen_2.5_vl_7b_fp8_scaled.safetensors
models/vae/qwen_image_vae.safetensors
models/loras/Qwen-Image-Edit-2511-Lightning-4steps-V1.0-bf16.safetensors

# MiniMax H3（還需要）：H3、Qwen3-VL、ClipProj、LoRA、影片 VAE 和音訊 VAE
```

**啟動 ComfyUI：**

```bash
# 預設位址 http://127.0.0.1:8188
```

**在網頁裡啟用：**

1. 開啟右上角「設定中心」
2. 選擇「使用我自己的模型設定」
3. 協議選「ComfyUI 本地」
4. 點「測試連線」——該介面（`GET /comfyui/health`）只檢查 ComfyUI API、固定工作流以及節點與模型可用性，**不上傳圖片，也不執行生成**
5. 測試成功後儲存

### 4.7 第六步：生產環境部署（重要）

#### 4.7.1 Nginx 反向代理

```nginx
server {
    listen 443 ssl;
    server_name api.你的網域.com;

    ssl_certificate     /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        # 大圖片 base64 請求主體，調大逾時和體積上限
        client_max_body_size 30m;
        proxy_read_timeout 180s;
        proxy_send_timeout 180s;
    }
}
```

前端部署時在 `index.html` 頂部加一句：

```html
<script>window.AI_API_URL="https://api.你的網域";</script>
```

#### 4.7.2 安全設定清單

```yaml
security:
  authRequired: true                # 本機除錯可設 false，線上部署必須為 true
  apiKeysEnv: "TRYON_API_KEYS"      # 多個 Token 用英文逗號分隔，每個 32~512 字元
  trustedOrigins:                   # CORS 嚴格白名單（精確匹配，禁止 *）
    - "https://paipiange.github.io"
    - "http://localhost:3000"
    - "http://127.0.0.1:3000"
  allowPrivateNetwork: false        # 是否允許來自私有網路的 PNA 預檢
  rateLimit:
    requestsPerMinute: 10           # 單呼叫方每分鐘請求速率上限
    burst: 3                        # 允許短時間突發容量
    limiterIdleMinutes: 30          # 限流器閒置自動清理週期（分鐘）
    dailyRequestsPerPrincipal: 100  # 單呼叫方每日最高呼叫成功額度（自然日重置）
  concurrency:
    global: 2                       # 全域最大生圖並行數
    perPrincipal: 1                 # 單呼叫方最大生圖並行數
```

設定 Token：

```bash
TRYON_API_KEYS="your-secure-token-with-at-least-32-chars-long-1234,another-client-token-5678"
```

後端**只在記憶體儲存 Token 的 SHA-256 雜湊摘要**，比對使用恆定時間比較（Constant-Time Compare）防止時序側通道攻擊，日誌、錯誤回應和回應標頭中絕不列印任何 Token 明文。

> ⚠️ **一個必須知道的限制**：每日額度計數器儲存在行程記憶體中，**後端重啟會重置**。多執行個部署需要外部共享儲存（Redis 等）。

#### 4.7.3 驗證部署

```bash
# 未帶 Token 或錯誤 Token（預期返回 HTTP 401: AUTH_REQUIRED）
curl -X POST https://api.你的網域/tryon -H "Content-Type: application/json" -d '{}'

# 預期返回：
# {"code":40101,"message":"请在设置中心填写后端访问 Token",
#  "data":{"error_code":"AUTH_REQUIRED","request_id":"..."}}

# 攜帶合法 Token 驗證連通性
curl -X POST https://api.你的網域/tryon \
  -H "Authorization: Bearer 你的Token" \
  -H "Content-Type: application/json" \
  -d '{}'

# 預期返回缺少參數驗證錯誤：
# {"code":51,"message":"The PersonImage field is required","data":null}
```

---

## 五、安全設計深度解析

這是我認為最值得學的部分，所以單獨開一節。

### 5.1 請求處理順序：先拒絕，再花錢

```
1. 接收請求並產生請求 ID
2. 校驗 Origin（CORS 白名單）
3. 限制整個 HTTP 請求主體大小（24 MiB，在 JSON 解析前）
4. 校驗後端存取 Token
5. 執行速率、每日額度和並行檢查
6. 校驗兩張圖片的 Base64、真實 MIME、檔案大小、寬高和像素數
7. 呼叫模型適配器
8. 無論成功或失敗，都釋放並行佔用
```

**注意第 7 步在第 6 步之後**——所有非法請求都在觸達模型之前就被拒絕。這是「不讓攻擊者花錢」的核心設計。

### 5.2 圖片校驗的九道關

`internal/imagevalidate/validate.go` 的 `ValidateImage` 函式，邏輯是層層遞進的：

```go
// 1. 预检查 Base64 编码字符串长度
if limits.MaxEncodedImageBytes > 0 && int64(len(rawB64)) > limits.MaxEncodedImageBytes {
    return nil, security.ErrImageFileTooLarge
}

// 2. 根据字符串长度预估解码大小（防止超大 Base64 占满内存）
estimatedDecodedSize := int64(len(rawB64)) * 3 / 4
if limits.MaxDecodedImageBytes > 0 && estimatedDecodedSize > limits.MaxDecodedImageBytes+1024 {
    return nil, security.ErrImageFileTooLarge
}

// 3. 解码 Base64
data, err := base64.StdEncoding.DecodeString(rawB64)

// 5. 校验真实 MIME 类型（http.DetectContentType）
realMIME := http.DetectContentType(data)
// 若 Data URL 声明了 MIME，必须与真实内容严格一致
if declaredMIME != "" && !strings.EqualFold(declaredMIME, realMIME) {
    return nil, security.ErrUnsupportedImageType
}

// 6. 使用 image.DecodeConfig 校验图片头有效性并提取宽高
cfg, _, err := image.DecodeConfig(bytes.NewReader(data))

// 8. 总像素校验（防止乘法整数溢出）
pixels := int64(cfg.Width) * int64(cfg.Height)
if limits.MaxPixels > 0 && pixels > limits.MaxPixels {
    return nil, security.ErrImagePixelLimitExceeded
}
```

三個關鍵設計：

**① 不信任宣告，只信內容。** Data URL 裡寫的 `image/png` 一律不信，用 `http.DetectContentType` 嗅探真實位元組型別，而且宣告和真實必須一致。偽造副檔名的攻擊在這裡就死了。

**② 先預估，後解碼。** 第 2 步用 `len(rawB64) * 3 / 4` 預估解碼大小，明顯超限時**根本不執行完整解碼**。這擋住了一類很樸素的 DoS：上傳一個 500MB 的 Base64 字串。

**③ 用 `DecodeConfig` 而不是 `Decode`。** `image.DecodeConfig` 只讀圖片頭就能拿到寬高，不解碼全部像素。這既快又安全——2000 萬像素的圖完整解碼會吃掉上百 MB 記憶體。

**限制參數一覽：**

| 項目 | 限制 |
|---|---|
| 整個 HTTP 請求主體 | 24 MiB |
| 單張 Base64 編碼字串 | 12 MiB |
| 單張圖片解碼後 | 8 MiB |
| 兩張圖片解碼後合計 | 16 MiB |
| 寬高範圍 | 256 px ~ 8192 px |
| 總像素 | ≤ 20,000,000 px |
| 允許格式 | `image/jpeg`、`image/png`、`image/webp` |

### 5.3 前端壓縮：讓 99% 的使用者根本撞不到後端限制

後端限制很嚴，但專案沒有讓使用者去手動壓縮圖片，而是在前端做了自適應處理：

| 環節 | 處理 |
|---|---|
| 上傳前 | 任一邊 < 256 px 時自動等比**放大**到合規尺寸 |
| 常規模式 | 最長邊縮放到 1280 px |
| 高清模式 | 最長邊縮放到 2048 px |
| 編碼格式 | 優先 WebP，瀏覽器不支援則降級 JPEG |
| 品質階梯 | 0.90 → 0.75，逐級下調直到 ≤ 8 MiB |

結果是：**絕大多數手機實拍照片無感順暢上傳**，使用者永遠看不到「檔案過大」這種提示。

### 5.4 SSRF 防護：公網後端不能被當內網跳板

`ModelConfig` 裡有一個專門的旗標：

```go
// ClientProvided 表示配置来自浏览器；启用后 HTTP 客户端会阻止内网/保留地址，降低 SSRF 风险。
ClientProvided bool
```

對應規則：

- 個人 Base URL 必須是 HTTP/HTTPS 公網位址
- **不能包含帳號、查詢參數或片段**
- **localhost、內網和保留位址一律拒絕**
- Gemini Key 使用請求標頭傳遞，**不進入上游 URL**
- ComfyUI **不接受** `client_config`，只使用後端本機設定

最後一條尤其關鍵。ComfyUI 的工作流路徑和節點 ID 只允許來自服務端設定，不能由瀏覽器請求覆寫。否則公網部署的後端會變成一個「任意存取本機 8188 連接埠並執行任意工作流」的漏洞。

### 5.5 並行控制：不排隊，直接拒絕

| 設定 | 預設值 |
|---|---|
| 全域最大並行 | 2 |
| 單 Token 最大並行 | 1 |

> 成功、失敗、逾時、Context 取消和 panic 都必須釋放名額。

「不排隊」是個有爭議的設計。有些系統會選擇排隊等待，使用者體驗更順滑。但對**付費生圖介面**來說，排隊意味著請求堆積、記憶體佔用上升、逾時增加。直接返回 429 + `Retry-After` 更誠實。

### 5.6 提示詞工程：與審核系統的周旋

這是專案裡最有意思的一段程式碼。`prompt.go` 為不同模型準備了**三套提示詞**。

**通用提示詞（Gemini / 豆包等）——英文主用，中文備用：**

```
You are a professional fashion virtual try-on assistant.

Task: Dress the person in the first image wearing the garment in the second image,
and output a single photorealistic full-body or half-body photo.

Strict requirements:
1. Keep the person's identity EXACTLY the same: same face, same facial features,
   same skin tone, same hairstyle, same body type and proportions.
   Do not change who they are.
2. Keep the person's original pose, body angle and orientation as much as possible;
   only adjust the arms/limbs if strictly needed to fit the garment naturally.
3. Put the exact garment from the second image onto the person: preserve its color,
   fabric texture, pattern, neckline, sleeve length, hem length and silhouette faithfully.
   Do not redesign or simplify the garment.
4. The garment must drape naturally on the body, follow the body contours,
   and cast realistic folds, shadows and highlights consistent with the original lighting.
5. Keep the original background, lighting and overall mood of the person's photo.
6. Photorealistic, high detail, professional fashion editorial quality, 8k, natural skin texture.

Output: ONLY the final dressed-up photograph, nothing else.
```

**GPT-Image 專用提示詞**——注意它在措辭上明顯更保守：

```
Task: Professional commercial fashion virtual try-on photograph.

Strict Requirements:
1. Model Identity: Maintain the adult female model from Image 1 - faithfully preserve
   her facial features, ethnic identity, eye shape, smile, skin tone, and hairstyle.
2. Wardrobe: Dress her in the exact clothing and accessories shown in Image 2.
3. Safety & Fit: Professional high-end commercial lookbook standard. Fully clothed,
   modest neckline, standard tailored fit, upright standing posture, non-revealing.
4. Composition: Clean bright studio lighting, neutral minimal background,
   photorealistic 8k, high detail fashion editorial photograph.

Output: ONLY the final dressed-up photograph.
```

差異在哪？

- "professional commercial fashion virtual try-on photograph" —— 強調**商業攝影**語境
- "adult female model" —— 明確成人女性模特
- "Fully clothed, modest neckline, standard tailored fit, upright standing posture, non-revealing" —— 主動排除可能觸發審核的描述
- "lookbook standard" —— 用高定時裝型錄這種更「無害」的行業語境

**為什麼要專門寫？** 因為程式碼註解說得很清楚：GPT-Image 系列對真人換裝場景會被官方安全審核攔截（`moderation_blocked` / `sexual`）。

這是**工程上的真實妥協**：不是去繞過審核（那是違規的），而是把請求表述得更貼近一個本來就合規的商業攝影場景，讓模型在正確的語意空間裡工作。同時把預設模型設為審核更寬鬆的 Gemini。

**從內容策略的角度看，這也解釋了為什麼圖庫要做「人物不入鏡」**。1407 套圖全部是純服裝展示，人物不出現——這讓整條鏈路從素材到提示詞都遠離了那些敏感的邊界。專案自己的合規報告裡也強調了這一點。

### 5.7 一個容易被忽略的細節：結果圖 MIME 也是嗅探出來的

```go
// DetectGeneratedImageMIME determines the real media type from the generated
// file signature instead of trusting provider headers or declarations.
func DetectGeneratedImageMIME(value string) (string, error) {
    ...
    if len(data) >= 8 && string(data[:8]) == "\x89PNG\r\n\x1a\n" {
        return "image/png", nil
    }
    if len(data) >= 3 && data[0] == 0xff && data[1] == 0xd8 && data[2] == 0xff {
        return "image/jpeg", nil
    }
    if len(data) >= 12 && string(data[:4]) == "RIFF" && string(data[8:12]) == "WEBP" {
        return "image/webp", nil
    }
    return "", fmt.Errorf("生成结果不是受支持的图片格式")
}
```

**入站不信供應商的 header，出站也不信**——自己按檔案簽章判斷。這個對稱性很乾淨。

---

## 六、歸納總結：七個可以帶走的觀點

### 觀點 1：免費層不是慈善，是獲客結構

把 4200+ 組圖庫完全免費開放，把 AI 換裝作為自架選項——這個決定讓專案在 6 天內拿到 2193 Star。

**推廣依賴「他人能立刻體驗」，付費依賴「高價值場景」。** 把這兩件事綁死，就等於把推廣也綁死了。

### 觀點 2：可選項要說透，不能含糊

專案在 README、頁面、稽核報告三處重複標註「需自備後端與 API Key，可能產生模型費用」。

很多專案怕說清楚就沒人用了，於是含糊其辭，結果使用者用不了還怪專案坑人。**說透反而建立了信任。**

### 觀點 3：文件漂移是最容易被低估的技術債

那份 `nvzhuang.md` 任務書抓出的細節很說明問題：預設模型在 README、API 結構、業務邏輯註解三處有三種說法；Docker Compose 的 `.env` 讀取路徑會誤導使用者。

**這些都不會讓程式崩潰，但每一個都會浪費使用者半小時。** 一個專案願意專門寫一份任務書來消滅這類落差，說明作者理解「文件是產品的一部分」。

### 觀點 4：安全需求應該像產品需求一樣寫

那份 562 行的安全需求文件，用的是使用者故事 → Evidence → Findings → FR → 錯誤碼 → 設定項的標準結構。

關鍵在於 Evidence 表：**每條結論都附帶程式碼位置和可重現的複核命令**。這讓文件不會變成空想，也讓後來者能自己驗證。

### 觀點 5：預設值的方向永遠應該是「安全且可用」

`config.yaml` 缺失時自動回退到 `config.example.yaml`；`server.address` 未設定時明確綁定 `:8000` 而不是隨機連接埠；`authRequired` 預設為 `true`；`allowPrivateNetwork` 預設為 `false`。

**Fail-safe 的意思是：出問題時，系統倒向「安全」這一側，而不是倒向「能跑起來」那一側。**

### 觀點 6：在地化不是翻譯，是資料模型決策

欄位名保留日文、關鍵詞用英文、分類值用日文，然後在**前端**做雙向映射。這個決策讓原始資料來源不用改、也不用做一次高風險的資料遷移，同時拿到了中英雙語的檢索能力。

**相容性的代價有時可以完全被架構消化掉。**

### 觀點 7：兄弟專案是低成本成長槓桿

`nvzhuang` ↔ `ai-pose-gallery-zh`（288 組 / 1439 張姿勢參考）互相引流，組合出「姿勢參考 + 人物參考 + 服裝參考 → AI 生成」的完整鏈路。

兩個專案共享同一套 ComfyUI 工作流基礎（`Ref2VA` 概念），技術複用 + 流量互導 + 場景互補。**這是獨立開發者能打的最好組合拳之一。**

---

## 七、值得吐槽和需要留意的地方

客觀說幾個不足。

### 7.1 每日額度在記憶體裡，重啟即重置

文件裡明確標註了這個限制。單執行個自用沒問題，但如果有人拿這個後端做成公網服務做二次分發，重啟就能刷新額度。要上規模必須換 Redis。

### 7.2 原尺寸 PNG 不可用

`原寸` 欄位指向的 `png/*.png` 目錄超 1GB 未託管，GitHub Pages 上 404。前端做了 WebP 回退，所以使用者體感不到。但「下載原尺寸」這個功能實質上是不存在的——**真正的原圖需要另建圖床**。

### 7.3 連接埠約定曾經自相矛盾

任務書裡專門寫了一段：

> 靜態頁面與後端都使用 8000 的範例容易衝突；請在 README 寫出一組明確不衝突的本機示範連接埠。

目前 README 已經改成前端 3000、後端 8000，但這個坑提醒我們：**文件裡的範例命令必須實際跑過**。

### 7.4 內容合規是永久的緊箍咒

專案自己的審查報告把 393 件（內衣/泳裝/性感）標為中到高風險。這類內容在任何技術社群公開發布都可能被演算法誤判。專案的應對是「宣傳只用日常款」，但這意味著**它永遠無法展示自己庫存最豐富的部分**，這是一個內在張力。

### 7.5 單檔前端的規模天花板

3278 行的 `index.html` 承載了樣式、互動、雙語字典、試穿台、IndexedDB 記錄、設定中心、壓縮邏輯。**零建置是優點，但檔案超過 3000 行後，協作和可維護性的成本開始明顯上升。**

值得學的是「零建置」，不值得學的是「永不拆分」。

### 7.6 AI 換裝效果不可控

提示詞寫得再好，最終效果取決於模型。README 裡的「精準保留五官」「完美複刻」這類表述，專案自己的規範文件其實明確警告過不能這麼寫：

> 換裝三圖須真實對應實作，不得冒充演算法必然效果；避免「精準保留五官」「100%還原」之類不可保證的表述。

**理想和現實的落差，是這類產品最大的隱性成本。**

---

## 八、如果你要做類似的東西，抄什麼

### 抄架構

```
純靜態前端（零建置、零 Key、零成本）
        ↓ 使用者產生真實需求後
可選後端（多模型可插拔 + 完整安全防護）
        ↓ 想省錢
本地 ComfyUI（零成本、免 Key、離線）
```

### 抄文件

寫一份 500+ 行的安全需求文件，Evidence 表帶程式碼位置和複核命令；寫一份稽核報告，PASSED / PENDING / BLOCKED 三態分明；寫一份授權決策書，把程式碼授權和素材授權**分開**處理。

### 抄規範

把 `AGENTS.md` 裡的四條提交前自查清單直接抄走，每條都要有可執行的命令，不能只是口號。

### 抄取捨

在「全面相容」和「誠實標註」之間，選後者。README 裡那句「生成屬性聲明：所有圖像均為 AI 生成（t2i）概念服裝設計，非現實品牌商品照片」，比多放 500 張圖更能建立長期信任。

---

## 九、最後

`nvzhuang` 的程式碼量不大，技術堆疊也沒有任何炫技成分。它能在 6 天內做到 2193 Star，靠的不是技術難度，而是**把每一個「應該做對」的地方都做對了**：

- 靜態與動態分層，免費與付費分明
- 模型可插拔，設定即插拔
- 安全當特性做，從需求文件到程式碼全鏈路對齊
- 失敗時倒向安全側
- 文件與程式碼逐條對帳
- 資料流向對使用者完全透明

這些沒有一項需要天賦，需要的是**在每一個細節上多花三分鐘**。

如果你正在做 AI 應用類開源專案，這套「安全需求文件 + Evidence 追溯 + Fail-Safe 預設值 + 提交前四道門檻」的做法，值得完整搬過去。

---

**專案位置**

- 線上體驗：https://paipiange.github.io/nvzhuang/
- GitHub 原始碼：https://github.com/paipiange/nvzhuang
- 兄弟專案（姿勢參考與生圖工坊）：https://github.com/paipiange/ai-pose-gallery-zh
- 授權：MIT License（完全免費開源，允許商業使用）

**中文譯本**

本專案全部技術文件的中文譯本已同步至程式碼倉庫 `docs/nvzhuang-translations/` 目錄，包含 README、後端部署指南、安全校驗需求、自訂上傳技術方案、合規審查報告等 11 份文件。

---

Eric|瑞哥
廣東 深圳

✅前IBM架構師｜區塊鏈書《區塊鏈核心技術與應用》合著作者
技術程式碼倉庫:https://github.com/gyc567
個人網站:www.topdigg.com
💼新加坡資管公司前CTO
👉公眾號「瑞哥观势」主理人
💎聚焦在:創富和守富
🎯專注老板群體：用AI 降本增效
微信:360369487

---

在這個快節奏的時代，我依然相信面對面、小範圍、高濃度的連結力量。

我致力於搭建一個「去泡沫化」的老板圈子，重點關注：

🔹 電商全域：國內直播、跨境電商與出海專案孵化

🔹 創投與產投：金融銀行資源對接、企業融資與併購

🔹 內容生態：MCN機構、達人矩陣與品牌整合

🔹 組織建設：企業核心團隊搭建、高階人才尋訪

## 【我的線下局】

不辦大會，只辦「小會」。

✅ 創業私董會：深度剖析商業難題

✅ 老板閉門飯：連結同頻靈魂，甚至解決人生大事（高品質單身圈層）

✅ 行業沙龍：聚焦具體賽道，促成實質合作

## 篩選標準：

只歡迎有結果、有邊界感、有長期主義心態的創辦人/合夥人。

時間寶貴，只留給有價值的人。
