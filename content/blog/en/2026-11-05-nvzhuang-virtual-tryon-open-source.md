---
title: "Someone Turned 1,407 AI Clothing Images Into a Website and Wired Up Virtual Try-On: A Complete Teardown of the Photo-Shoot Bro's Women's Clothing Project"
date: "2026-11-05"
description: "A deep teardown of paipiange/nvzhuang: a zero-build, purely static clothing image library plus a GoFrame AI try-on backend. Includes a complete deployment tutorial, multi-model integration config, an analysis of the API security design, and six design philosophies."
author: "瑞哥观势"
tags:
  - open source project analysis
  - AI clothing try-on
  - virtual try-on
  - GoFrame
  - ComfyUI
  - multi-model adaptation
  - security design
categories:
  - open source project analysis
keywords:
  - paipiange nvzhuang
  - AI virtual try-on
  - AI try-on backend
  - GoFrame open source project
  - ComfyUI local try-on
  - multi-model adapter
  - API security protection
  - zero-build frontend
---

# Someone Turned 1,407 AI Clothing Images Into a Website and Wired Up Virtual Try-On

Conclusions first.

`paipiange/nvzhuang` is a project whose repository was only created in late October 2026 and which, by November 4, had already racked up **2,193 Stars / 555 Forks**. Its tech stack is simple to the point of being counterintuitive: the frontend is a single 3,278-line `index.html`, the backend is GoFrame v2, and the AI clothing try-on is done with prompt engineering plus multi-model adapters.

But it got several hard things right, and those things matter far more than the amount of code:

**First, it made "zero-cost and usable" and "high-quality capability" two separate layers instead of one.** The gallery part is completely free, zero-deployment, zero-Key — open the page and it works. The AI try-on part requires your own backend and your own Key. Most comparable projects would either lock the core feature behind a paywall, or turn the whole thing into a login-gated SaaS. This one doesn't.

**Second, it added a complete production-grade API security layer in 6 days.** Bearer Token authentication (SHA-256 digest + constant-time comparison), a strict CORS allowlist, token-bucket rate limiting, daily quota, concurrency locks, request body size caps, pixel-bomb protection, and SSRF protection. None of this was "added in passing" — it was driven by a security requirements document written like a product spec.

**Third, it used prompt engineering to work around model moderation, a very real-world constraint.** There's a comment in the code that puts it bluntly: the GPT-Image family gets blocked by the official safety moderation for real-person try-on scenarios, so the default model is Gemini, and there's a dedicated "moderation-proofing" prompt template written for GPT-Image. This isn't a hack — it's an engineering compromise, but it's an honest one.

Next, this article takes the project apart: what it is, how to run it, how the security works, and the design philosophy behind it.

---

## 1. Project Overview: What Exactly Is It?

### 1.1 One-Line Positioning

> **Costume collection COSTUME-DB-01**: 1,407 photorealistic real-person sets + 1,320 anime-style AI-generated garment-only images (2:3 ratio, no people in frame), supporting bilingual Chinese/English search, multi-dimensional filtering, with optional one-click AI virtual try-on.

### 1.2 Three Galleries

| Gallery | Count | Content | Data File |
|---|---|---|---|
| Photorealistic garments | 1,407 sets | Real-person-style, garment-only presentation | `data.js` |
| Anime-style garments | 1,320 sets | Anime-illustration-style clothing | `data-anime.js` |
| AI model face/styling library | 1,499 people | Face close-ups (Face) and styling (Styling) | `data-portrait.js` |

Over 4,200 reference assets in total. The model library comes from the CC0 1.0 licensed `ai-portrait-gallery` project, supports precise filtering by short / medium / medium-long / long hair and by 50 specific hairstyles (bob, micro curls, blunt cut, and so on), and supports search in Chinese, Japanese, and English.

### 1.3 The 8 Categories (Japanese names preserved)

The category field in the data files is in Japanese. This is **deliberately kept for compatibility with the original data source**, and the frontend automatically localizes it into Chinese or English:

| Category (original Japanese) | English | Count |
|---|---|---:|
| 春 | Spring | 215 |
| 夏 | Summer | 254 |
| 秋 | Autumn | 244 |
| 冬 | Winter | 253 |
| ランジェリー | Lingerie | 199 |
| パーティ | Party | 48 |
| 水着 | Swimwear | 54 |
| セクシー | Sexy style | 140 |
| **Total** | | **1407** |

The project ships with a "Gallery Content Compliance and Community Publishing Review Report" that explicitly classifies the first 5 categories (1,014 items in total) as low-risk and recommended as promotional material, while the last 3 categories (393 items) are classified as medium-to-high risk, allowed only to be passively searched as part of the complete dataset, with no homepage featured slots.

**This detail deserves a separate mention**: a gallery project that proactively grades its own content, draws red lines around promotional material, and specifies which items can't be used as cover images — that's something only an author with community awareness would do. Most comparable projects only think about how to cram in a few more images.

### 1.4 Data Structure: Field Names Are Japanese, Values Are English

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

| Field | Description |
|---|---|
| `id` | Identifier, e.g. `SPR-0001` |
| `カテゴリ` | Category (Japanese category name) |
| `キーワード` | Keywords (English, space-separated) |
| `サムネ` | Thumbnail path (WebP) |
| `画像` | Display image path (WebP) |
| `原寸` | Full-resolution PNG path |

The field names are Japanese (`カテゴリ`, `キーワード`, `サムネ`, `画像`, `原寸`) — this is the original schema of the data source, and keeping it avoids breaking compatibility. The values are English keywords (`ivory frill knit denim mini skirt coat socks white sneakers`), which is why bidirectional Chinese/English search works: typing "white" in Chinese mode matches, because the frontend does keyword localization mapping.

**A common pitfall**: the full-resolution PNGs (~1GB+) are not in the repository, so the `png/*.png` files that `原寸` points to will 404 on GitHub Pages. The project's solution is to automatically and smoothly fall back to the hosted high-resolution WebP images on download, so the button never dead-ends.

### 1.5 AI Try-On: Image 1 + Image 2 ➔ Image 3

The essence of the try-on flow is feeding two images into an image model so that it composes one:

- **Image 1**: The selected garment reference image (from the built-in gallery, or uploaded by the user)
- **Image 2**: The model photo uploaded by the user
- **Image 3**: The AI-composited try-on result (keeps the model's facial features and hairstyle, fuses in the garment's material and cut)

Both photorealistic real-person and anime-style are supported. The project also integrates with its sibling project `ai-pose-gallery-zh` (288 sets / 1,439 multi-angle pose references), forming a complete "pose reference + person reference → AI generation" workflow.

---

## 2. Core Ideas

If you can only remember three sentences, these are the three.

### Idea 1: The Static Site Handles "Zero Friction", the Backend Handles "High Quality"

This is the single most important architectural judgment in the whole project.

Most AI try-on projects tie the frontend and backend together: want to use it? Deploy a backend first, buy a Key first, fill in a Base URL first. For an individual user, that barrier turns away 99% of people.

What `nvzhuang` does is **layer the capabilities**:

```
┌─────────────────────────────────────────┐
│  Layer 1: Pure static frontend (zero deployment, zero Key)      │
│  · Browsing 4,226 gallery items                        │
│  · Bidirectional Chinese/English search / category filtering                 │
│  · Full-screen large images / keyboard paging / original download          │
│  · Manual outfitting bench (pure browser cutout compositing)           │
│  · Search-by-image for the same item (Taobao / Pinduoduo)             │
│  · Local generation history (IndexedDB)              │
│  ↓ Only when the user really wants AI try-on                    │
├─────────────────────────────────────────┤
│  Layer 2: Optional GoFrame backend (self-hosted, bring your own Key)  │
│  · Real AI try-on generation                     │
│  · 5 model protocols, pluggable                     │
│  · ComfyUI local offline, zero cost                 │
└─────────────────────────────────────────┘
```

Layer 1 is 100% free and needs zero preparation — just open `https://paipiange.github.io/nvzhuang/`. Layer 2 is where the paid capability lives, and it's **clearly priced**: the project explicitly labels "you need to bring your own backend and API Key, and model fees may be incurred" in three places — the README, the frontend page, and the audit report.

**This layering essentially drives acquisition cost to zero while leaving the monetization point in the place that actually has value.**

### Idea 2: Models Are Plugins, Not Hardcoded

The backend defines a minimal adapter interface:

```go
// ImageGenerator 图像生成模型适配器接口
type ImageGenerator interface {
    // Generate 生成换装图。入参为两张图的 base64（人像 + 服装），返回结果图 base64
    Generate(ctx context.Context, personB64, garmentB64, prompt, size string) (string, error)
    // Name 模型别名（对外暴露的名称）
    Name() string
}
```

Then each protocol gets one adapter: `gpt_image.go` (OpenAI Images protocol), `doubao.go` (Volcano Ark protocol), `gemini.go` (Google generateContent protocol), `comfyui.go` (local workflow).

Adding a brand-new domestic model just means adding a block to the config file — **without changing a single line of code**:

```yaml
llm:
  models:
    qwen:                 # 通义万相示例
      provider: openai
      envKey: "DASHSCOPE_API_KEY"
      baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1"
      model: "wanx2.1-t2i-turbo"
```

### Idea 3: Security Is a Product Feature, Not a Pre-Launch Patch

This is the biggest difference between this project and the vast majority of open source projects.

It has a standalone document, "AI Try-On Interface Protection and Image Validation Requirements", running to 562 lines and written entirely in the style of a product requirements document: user stories → evidence table (Evidence) → conclusions table (Findings) → functional requirements (FR-1 through FR-16) → error code table → configuration items.

The Evidence table looks like this:

| ID | Code Location | Current Observation | Re-verification Command |
|---|---|---|---|
| E-001 | `backend/internal/cmd/cmd.go` | Only the recovery and default CORS middleware are registered; there is no access authentication and no rate limiting | `rg -n "Middleware\|CORSDefault" backend/internal/cmd/cmd.go` |
| E-002 | `backend/api/tryon/v1/tryon.go` | `/tryon` can directly receive two Base64 images and trigger generation | `rg -n "PersonImage\|GarmentImage\|path:\"/tryon\"" backend/api/tryon/v1/tryon.go` |
| E-003 | `backend/internal/logic/tryon/gpt_image.go` | `decodeB64` only checks the Base64 decoding result | `rg -n "func decodeB64" backend/internal/logic/tryon/gpt_image.go` |

The Findings section states the conclusions directly:

- **F-001**: On a public deployment, anyone may call the generation endpoint → model quota could be burned or the local GPU saturated
- **F-002**: Valid Base64 is not the same as a valid, safe image → wasted memory, CPU, and bandwidth, or failed model calls

**This "gather evidence first, then draw conclusions, then propose a solution" way of writing is more rigorous than most companies' security PRDs.** And it was actually executed — I read through the complete implementations in `internal/security/` and `internal/middleware/`, and every one of FR-1 through FR-16 in the requirements document has corresponding code.

---

## 3. Design Philosophy: Six Principles You Can Carry Over

This section, to me, is the most valuable output of the project. Technology goes stale; the judgments below don't.

### Philosophy 1: Fail-Safe Defaults

This one is written into the architecture rules in `AGENTS.md` and enforced strictly in code:

> If the backend service detects, at startup, that the host machine has not explicitly created `config.yaml`, it must be able to automatically fall back to loading `config.example.yaml` at the code level.

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

Similarly, there's a port fallback:

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

**Why does this matter?** Because Go's `net/http` assigns a random high port when you call `ListenAndServe(":0")`. AGENTS.md calls out this trap by name:

> It is absolutely forbidden to fall into the system's `:0` random high temporary port (such as `:37093`) because `address` is not configured.

In containerized deployments, a missing `server.address` config causes health checks, reverse proxies, and container orchestration to all break — and without any error, it only shows up as "the service started but can't be reached". This kind of bug is extremely hard to debug.

### Philosophy 2: The Zero Leakage Principle

The opening line of `AGENTS.md` is a red line:

> Absolutely forbid committing any real API Key (including but not limited to OpenAI `sk-...`, Volcano Ark `ARK...`, Google Gemini `AIza...`, Tongyi Qianwen `sk-...`, etc.), private tokens, passwords, or certificate keys to the Git repository or staging area.

The supporting mechanisms:

- `config.yaml` and `.env` are both in `.gitignore`; only `config.example.yaml` and `.env.example` stay in the repo
- Key fields in the templates must be empty strings or placeholders like `sk-你的key`
- The frontend's "personal model configuration" lives only in the browser's `localStorage`; the backend keeps it in memory only, and **never writes it to a database, a config file, or business logs**
- Logs may only record the MIME type, width/height, byte count, and at most a 16-character SHA-256 prefix — never image content and never the full hash

Even more aggressive is the pre-commit self-check list, written directly as executable commands:

```markdown
- [ ] **Step 1**: Run `git status` and make sure no temporary files, log files, build artifacts, or real config files have entered the staging area.
- [ ] **Step 2**: Review `git diff --cached` line by line and confirm there are no real Keys, no personal names or phone numbers, and no leftover hardcoded credentials from debugging.
- [ ] **Step 3**: Run a sensitive-string security scan with the regex `(sk-[a-zA-Z0-9]{20,}|AIza[a-zA-Z0-9]{20,})`.
- [ ] **Step 4**: Run `go test ./...` and `go vet ./...` to make sure the code compiles and all tests pass.
```

**This checklist can be copied and used as-is.** It turns the slogan "be careful" into four concrete gates.

### Philosophy 3: Privacy Boundaries Should Be Explained in the Docs, Not Hidden

The project explicitly labels data flows in multiple places:

- Custom-uploaded original garment images are **kept only in the memory of the current page**, are not written to local storage or the generation history, and are cleared automatically on refresh or page close
- Generation history is stored only in the current browser's IndexedDB, and is **not uploaded and not synced across devices**
- During generation, only the **compressed** image content is sent to the user-configured try-on backend

This transparency is critical. AI try-on involves portrait photos, and the thing users fear most is "where did my photo go?". The project doesn't talk vaguely — it draws the data flow clearly.

### Philosophy 4: Explicit Rejection Beats Silent Degradation

Error responses are not a vague "generation failed" — they're precise down to the business code:

| HTTP | Business Code | `error_code` | User Message |
|---:|---:|---|---|
| 401 | 40101 | `AUTH_REQUIRED` | Please fill in the backend access Token in the settings center |
| 401 | 40102 | `AUTH_INVALID` | The backend access Token is invalid |
| 403 | 40301 | `ORIGIN_NOT_ALLOWED` | The current page origin is not allowed to access the backend |
| 429 | 42901 | `RATE_LIMITED` | Requests are too frequent, please retry later |
| 429 | 42902 | `DAILY_QUOTA_EXCEEDED` | Today's generation quota has been used up |
| 429 | 42903 | `CONCURRENCY_LIMITED` | There are many generation tasks in progress, please retry later |
| 413 | 41301 | `REQUEST_TOO_LARGE` | Uploaded content is too large, please compress the image and retry |
| 422 | 42201 | `INVALID_IMAGE_BASE64` | The image data is corrupted, please select the image again |
| 422 | 42202 | `UNSUPPORTED_IMAGE_TYPE` | Only JPEG, PNG and WebP are supported |
| 422 | 42203 | `IMAGE_FILE_TOO_LARGE` | The image file is too large, please compress it and retry |
| 422 | 42204 | `IMAGE_DIMENSIONS_INVALID` | The image dimensions do not meet the requirements |
| 422 | 42205 | `IMAGE_PIXEL_LIMIT_EXCEEDED` | The image has too many pixels, please downscale and retry |

The frontend displays Chinese/English hints based on `error_code`, and **does not rely on regex matching against the backend's raw error strings**.

Also, all error responses must include `request_id`, and must not contain the Token, the model API Key, image Base64, or the provider's raw sensitive errors.

### Philosophy 5: Decouple Model Adapters from Business Logic

The main flow in `tryon.go` is short, but every branch carries an explicit rationale:

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

Note how the error handling at the end is handled:

```go
result, err := gen.Generate(ctx, personB64, garmentB64, promptStr, size)
if err != nil {
    // 不记录原始错误：网络错误可能包含用户自定义 Base URL，供应商响应也可能含敏感信息。
    return "", "", "", gerror.Wrap(err, "换装生成失败，请稍后重试")
}
```

**Why isn't the raw error logged?** Because the user's `client_config.base_url` may be spliced into network error messages, and the provider's response body may contain sensitive content. Swallowing the raw error and standardizing it into one friendly message is the safest choice here.

### Philosophy 6: Documentation and Code Must Match

This project has an `nvzhuang.md` task sheet dedicated to fixing the drift between documentation and code, and it names specific inconsistencies:

> 1. The README's root-directory startup command says to run `cp backend/.env.example backend/.env` and then execute `docker compose up -d` **at the repository root**, but Compose by default reads `.env` from the working directory. This misleading instruction should be checked and corrected.
> 2. The frontend dropdown's default model is `gemini`; the `Model` default value in the API request structure is written as `gpt-image`, while some business logic comments / null-value fallbacks say `gemini`. The path where the GoFrame default actually takes effect must be verified, and the README / frontend / backend documentation unified. **It must not simply claim "the default is GPT Image 2".**

The second point is especially interesting — it even catches the extremely fine-grained drift of "three different statements in the docs". Behind this is an obsession (from the author, or from the AI writing the task sheet for the author): **documentation drift is technical debt, and it's the kind that is easiest to overlook.**

---

## 4. Detailed Tutorial: Running It From Scratch

### 4.1 Requirements

| Use | Requirement |
|---|---|
| Frontend static site | A modern browser is enough, or Python 3 / Node |
| Backend build & run | Go 1.18+ or Docker |
| Cloud AI try-on | At least one model API Key |
| Local AI try-on | ComfyUI + a discrete GPU (recommended), no Key required |

### 4.2 Step One: Run the Frontend (No Configuration Required)

The frontend is a pure static site, and it **requires no build**.

```bash
# Method one: Python built-in server (recommended, port 3000, no conflict with the backend's 8000)
python3 -m http.server 3000

# Method two: Node simple server
npx serve -l 3000 .

# Method three: just open index.html in a modern browser
```

Browse to `http://localhost:3000`.

At this point you already have: 4,226 gallery items, bilingual Chinese/English search, category filtering, full-screen large images, keyboard paging, infinite scroll, original image download, a manual outfitting bench, search-by-image, IndexedDB local generation history — **all free, zero Key, zero backend**.

> ⚠️ **Don't let the ports collide**: the static site uses 3000, the backend uses 8000. The original task sheet for this project specifically called out this confusion.

### 4.3 Step Two: Start the Backend (Docker, the Easiest Way)

```bash
cd backend

# 1. Copy the env var template and fill in your Key
cp .env.example backend/.env
# Edit .env, e.g.: ARK_API_KEY=xxxx (Doubao recommended in China, no VPN needed)

# 2. One-shot startup (built-in out-of-the-box fallback, listens on port 8000 by default)
docker compose up -d

# 3. Watch the logs
docker compose logs -f
```

Once the service is up it listens on `http://localhost:8000`.

**Note**: you must run this command inside the `backend/` directory (`cd backend` first, then `cp .env.example .env`). If you run it at the repository root, Compose reads the root `.env` and won't find the backend's configuration — a trap specifically called out in the project task sheet.

Single-container Docker approach:

```bash
cd backend
docker build -f manifest/docker/Dockerfile -t costume-tryon .

docker run -d --name costume-tryon -p 8000:8000 \
  -e ARK_API_KEY="your Doubao Ark Key" \
  -e OPENAI_API_KEY="sk-yourOpenAIKey" \
  costume-tryon
```

Windows users get a shortcut: just double-click `backend/restart.bat` and it compiles and starts automatically.

No Docker (running from source):

```bash
cd backend
# Optional: copy the config file (if you don't, the system safely falls back to the template and listens on 8000)
# cp manifest/config/config.example.yaml manifest/config/config.yaml
export ARK_API_KEY="yourKey"      # In Windows PowerShell use $env:ARK_API_KEY="yourKey"
go run main.go
```

### 4.4 Step Three: Point the Frontend at the Backend

The frontend `index.html` identifies the try-on backend address by the following priority (**highest to lowest**):

1. **Settings center**: the "backend API address" the user saved in the current browser (cross-origin external public backends must use **HTTPS**)
2. **Global variable**: configure `window.AI_API_URL = "http://localhost:8000"` before the HTML loads
3. **URL parameter**: `https://your-frontend-address/?tryon=http://localhost:8000`
4. **Local fallback**: when the frontend is accessed via `localhost` or `127.0.0.1`, it automatically connects to `http://127.0.0.1:8000` by default

Regarding item 3, there's one **security constraint** you must know:

> To prevent phishing theft of API Keys and private photos, `?tryon=` only allows same-origin or the local loopback `localhost`/`127.0.0.1`; external backends must be explicitly saved in the settings center.

In other words, **you cannot use `?tryon=` on a public web page to point at an unknown backend** — this is by design, for SSRF prevention and anti-phishing.

The frontend also has a few very useful URL parameters:

```
?lang=en           # Initial language (zh / en, default zh)
?q=lace            # Initial search term
?lang=en&q=white   # Combined usage
```

### 4.5 Step Four: Multi-Model Integration

The backend manages models through `llm.models` in the config file, with **the Key, Base URL, and model name all configurable**:

```yaml
llm:
  models:
    gpt-image:              # The alias used in frontend requests
      provider: openai      # Protocol: openai / doubao / gemini
      apiKey: ""            # Fill in the Key directly, or leave empty to use an env var
      envKey: "OPENAI_API_KEY"   # Env var name (takes priority over apiKey)
      baseURL: "https://api.openai.com/v1"
      model: "gpt-image-2"

    doubao:                 # Doubao (Volcano Ark), available in China
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

**The differences between the four protocols** (this is the easiest thing to get wrong when integrating):

| provider | Protocol | Description |
|---|---|---|
| `openai` | `POST {baseURL}/images/generations` + `input` array | Official OpenAI GPT-Image, Tongyi Wanxiang, Zhipu CogView, SiliconFlow, most relay stations |
| `doubao` | Same `/images/generations`, but the request body uses the Volcano format (`prompt` + `image[]`), and it returns `url` | Doubao Seedream |
| `gemini` | Google's native `generateContent` | Gemini image models |
| `comfyui` | Local ComfyUI API + a server-side fixed workflow | Local offline; does not accept `client_config` |

**To add a domestic model, you just add a block under `llm.models`**; the frontend dropdown is then updated by adding or removing `<option>` elements in the `<select id="aiModel">` in `index.html`.

### 4.6 Step Five: ComfyUI Local Offline Mode (Zero Cost, No Key)

This is the most imaginative part of the project: **let your GPU pay for you**.

The system ships with a **dual-workflow adaptive** setup:

| Workflow | Model | Characteristics |
|---|---|---|
| **Qwen-Image-Edit-2511 (preferred default)** | `qwen_image_edit_2511_int8_convrot.safetensors` + 4-step Lightning LoRA | 4-step ultra-fast generation, higher fidelity for semantic clothing transfer |
| **MiniMax H3 (kept for compatibility)** | The 31st frame extracted from the H3 Ref2VA video model, frozen | Fallback option |

At call time the system auto-detects availability: Qwen first, with a smooth fallback to H3 when it's not ready; you can also specify explicitly via `comfyui-qwen` or `comfyui-h3`.

**Preparing the model files:**

```bash
# Qwen-Image-Edit
models/diffusion_models/qwen_image_edit_2511_int8_convrot.safetensors
models/text_encoders/qwen_2.5_vl_7b_fp8_scaled.safetensors
models/vae/qwen_image_vae.safetensors
models/loras/Qwen-Image-Edit-2511-Lightning-4steps-V1.0-bf16.safetensors

# MiniMax H3 (also needed): H3, Qwen3-VL, ClipProj, LoRA, video VAE and audio VAE
```

**Starting ComfyUI:**

```bash
# Default address http://127.0.0.1:8188
```

**Enabling it in the web page:**

1. Open the "Settings center" in the top right
2. Choose "Use my own model configuration"
3. Set the protocol to "ComfyUI local"
4. Click "Test connection" — this endpoint (`GET /comfyui/health`) only checks the ComfyUI API, the fixed workflow, and node/model availability; it **does not upload images and does not run a generation**
5. Save after the test succeeds

### 4.7 Step Six: Production Deployment (Important)

#### 4.7.1 Nginx Reverse Proxy

```nginx
server {
    listen 443 ssl;
    server_name api.yourdomain.com;

    ssl_certificate     /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        # Large base64 image request bodies: raise the timeout and body size limits
        client_max_body_size 30m;
        proxy_read_timeout 180s;
        proxy_send_timeout 180s;
    }
}
```

When deploying the frontend, add one line at the top of `index.html`:

```html
<script>window.AI_API_URL="https://api.yourdomain";</script>
```

#### 4.7.2 Security Configuration Checklist

```yaml
security:
  authRequired: true                # May be false for local debugging; must be true in production
  apiKeysEnv: "TRYON_API_KEYS"      # Multiple Tokens separated by commas, each 32~512 characters
  trustedOrigins:                   # Strict CORS allowlist (exact match, no *)
    - "https://paipiange.github.io"
    - "http://localhost:3000"
    - "http://127.0.0.1:3000"
  allowPrivateNetwork: false        # Whether to allow PNA preflight from private networks
  rateLimit:
    requestsPerMinute: 10           # Per-caller request rate ceiling per minute
    burst: 3                        # Allowed short-term burst capacity
    limiterIdleMinutes: 30          # Idle limiter auto-cleanup cycle (minutes)
    dailyRequestsPerPrincipal: 100  # Per-caller daily quota of successful calls (resets on a calendar day)
  concurrency:
    global: 2                       # Global maximum image-generation concurrency
    perPrincipal: 1                 # Per-caller maximum image-generation concurrency
```

Setting the Token:

```bash
TRYON_API_KEYS="your-secure-token-with-at-least-32-chars-long-1234,another-client-token-5678"
```

The backend **keeps only the SHA-256 hash digest of the Token in memory**, compares using constant-time compare (Constant-Time Compare) to prevent timing side-channel attacks, and never prints any plaintext Token in logs, error responses, or response headers.

> ⚠️ **One limitation you must know**: the daily quota counters are kept in process memory, so **a backend restart resets them**. Multi-instance deployments need external shared storage (Redis, etc.).

#### 4.7.3 Verifying the Deployment

```bash
# Without a Token or with a wrong Token (expected: HTTP 401: AUTH_REQUIRED)
curl -X POST https://api.yourdomain/tryon -H "Content-Type: application/json" -d '{}'

# Expected response:
# {"code":40101,"message":"请在设置中心填写后端访问 Token",
#  "data":{"error_code":"AUTH_REQUIRED","request_id":"..."}}

# Verify connectivity with a valid Token
curl -X POST https://api.yourdomain/tryon \
  -H "Authorization: Bearer yourToken" \
  -H "Content-Type: application/json" \
  -d '{}'

# Expected response: missing-parameter validation error:
# {"code":51,"message":"The PersonImage field is required","data":null}
```

---

## 5. Deep Dive Into the Security Design

This is the part I think is most worth learning, so it gets its own section.

### 5.1 Request Processing Order: Reject First, Then Spend Money

```
1. Receive the request and generate a request ID
2. Validate Origin (CORS allowlist)
3. Limit the entire HTTP request body size (24 MiB, before JSON parsing)
4. Validate the backend access Token
5. Enforce rate, daily quota, and concurrency checks
6. Validate the two images' Base64, true MIME type, file size, dimensions, and pixel count
7. Call the model adapter
8. Release the concurrency slot regardless of success or failure
```

**Notice that step 7 comes after step 6** — every invalid request is rejected before it ever reaches the model. This is the core design of "don't let attackers spend your money".

### 5.2 The Nine Gates of Image Validation

The `ValidateImage` function in `internal/imagevalidate/validate.go` layers its logic progressively:

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

Three key designs:

**① Don't trust declarations, trust content.** Whatever the Data URL says — `image/png` — is not trusted; the real byte type is sniffed with `http.DetectContentType`, and the declaration must match the reality exactly. Attacks that fake the extension die right here.

**② Estimate first, decode later.** Step 2 uses `len(rawB64) * 3 / 4` to estimate the decoded size; when it's clearly over the limit, **the full decode is never executed**. This blocks a very plain DoS: uploading a 500MB Base64 string.

**③ Use `DecodeConfig` instead of `Decode`.** `image.DecodeConfig` reads only the image header to get the dimensions, without decoding every pixel. That's both fast and safe — fully decoding a 20-megapixel image would eat over a hundred MB of memory.

**The limit parameters at a glance:**

| Item | Limit |
|---|---|
| Entire HTTP request body | 24 MiB |
| Single Base64-encoded string | 12 MiB |
| Single image after decoding | 8 MiB |
| Two images combined after decoding | 16 MiB |
| Dimension range | 256 px ~ 8192 px |
| Total pixels | ≤ 20,000,000 px |
| Allowed formats | `image/jpeg`, `image/png`, `image/webp` |

### 5.3 Frontend Compression: Let 99% of Users Never Hit the Backend Limits

The backend limits are strict, but the project doesn't make users compress images by hand — instead it handles this adaptively on the frontend:

| Stage | Handling |
|---|---|
| Before upload | Automatically **upscale** proportionally to a compliant size when either side is < 256 px |
| Normal mode | Longest edge scaled down to 1280 px |
| HD mode | Longest edge scaled down to 2048 px |
| Encoding format | WebP preferred, falling back to JPEG when the browser doesn't support it |
| Quality ladder | 0.90 → 0.75, stepping down until ≤ 8 MiB |

The result: **the vast majority of real phone photos upload smoothly and invisibly**, and users never see a "file too large" message.

### 5.4 SSRF Protection: A Public Backend Can't Be Used as an Intranet Jump Host

`ModelConfig` has a dedicated flag:

```go
// ClientProvided 表示配置来自浏览器；启用后 HTTP 客户端会阻止内网/保留地址，降低 SSRF 风险。
ClientProvided bool
```

The corresponding rules:

- A personal Base URL must be an HTTP/HTTPS public address
- It **must not contain credentials, query parameters, or fragments**
- **localhost, intranet, and reserved addresses are rejected outright**
- The Gemini Key is passed in request headers and **never enters the upstream URL**
- ComfyUI **does not accept** `client_config` and only uses the backend's local configuration

The last one is especially critical. ComfyUI's workflow path and node IDs may only come from server-side configuration and cannot be overridden by the browser request. Otherwise a publicly deployed backend would become a vulnerability that can "access any port 8188 on the local machine and execute arbitrary workflows".

### 5.5 Concurrency Control: No Queueing, Just Rejecting

| Configuration | Default |
|---|---|
| Global max concurrency | 2 |
| Max concurrency per Token | 1 |

> Success, failure, timeout, Context cancellation, and panic must all release the slot.

"No queueing" is a debatable design. Some systems choose to queue and wait, which gives a smoother experience. But for a **paid image-generation endpoint**, queueing means requests pile up, memory usage grows, and timeouts increase. Returning 429 + `Retry-After` directly is more honest.

### 5.6 Prompt Engineering: Dancing Around the Moderation System

This is the most interesting piece of code in the project. `prompt.go` prepares **three sets of prompts** for different models.

**Generic prompt (Gemini / Doubao and others) — English primary, Chinese as backup:**

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

**GPT-Image dedicated prompt** — note how noticeably more conservative the wording is:

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

Where do the differences lie?

- "professional commercial fashion virtual try-on photograph" — emphasizes the **commercial photography** context
- "adult female model" — explicitly an adult female model
- "Fully clothed, modest neckline, standard tailored fit, upright standing posture, non-revealing" — proactively excludes descriptions that could trigger moderation
- "lookbook standard" — uses the high-fashion lookbook industry context, a more "harmless" framing

**Why write a dedicated one?** Because the code comment says it clearly: the GPT-Image family gets blocked by the official safety moderation for real-person try-on scenarios (`moderation_blocked` / `sexual`).

This is a **real engineering compromise**: not about bypassing moderation (that would be a violation), but about expressing the request in terms that are close to a commercial photography scenario that is inherently compliant, so the model works in the right semantic space. At the same time, the default model is set to Gemini, whose moderation is looser.

**From a content strategy angle, this also explains why the gallery is designed with "no people in frame"**. All 1,407 sets are garment-only presentations with no people — this keeps the entire chain, from assets to prompts, far away from those sensitive boundaries. The project's own compliance report emphasizes this point too.

### 5.7 An Easily Overlooked Detail: The Result Image MIME Is Also Sniffed

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

**It doesn't trust the provider's headers on the way in, and doesn't trust them on the way out either** — it judges by file signature itself. This symmetry is very clean.

---

## 6. Summary: Seven Takeaways

### Takeaway 1: The Free Tier Isn't Charity, It's Acquisition Structure

Opening all 4,200+ gallery assets for free while making AI try-on a self-hosted option — this decision got the project 2,193 Stars in 6 days.

**Promotion depends on "others can experience it immediately"; payment depends on "high-value scenarios".** Tie those two together and you've tied your promotion to them too.

### Takeaway 2: Options Must Be Spelled Out, Not Vague

The project repeats the label "you need to bring your own backend and API Key, and model fees may be incurred" in the README, on the page, and in the audit report.

Many projects are afraid that spelling it out will scare people away, so they stay vague — and then users can't get it working and blame the project. **Spelling it out actually builds trust.**

### Takeaway 3: Documentation Drift Is the Most Underestimated Technical Debt

The details that `nvzhuang.md` task sheet caught are very telling: the default model has three different statements across the README, the API structure, and the business logic comments; the Docker Compose `.env` read path misleads users.

**None of these will crash the program, but every single one wastes half an hour of a user's life.** A project willing to write a dedicated task sheet just to eliminate this kind of drift shows the author understands that "documentation is part of the product".

### Takeaway 4: Security Requirements Should Be Written Like Product Requirements

That 562-line security requirements document uses the standard structure of user stories → Evidence → Findings → FR → error codes → configuration items.

The key is the Evidence table: **every conclusion carries a code location and a reproducible re-verification command**. This keeps the document from becoming wishful thinking and lets later readers verify things on their own.

### Takeaway 5: The Direction of Defaults Should Always Be "Safe and Usable"

When `config.yaml` is missing it automatically falls back to `config.example.yaml`; when `server.address` is unset it explicitly binds `:8000` instead of a random port; `authRequired` defaults to `true`; `allowPrivateNetwork` defaults to `false`.

**Fail-safe means: when something breaks, the system leans toward "secure" rather than toward "it runs".**

### Takeaway 6: Localization Is a Data Model Decision, Not a Translation Task

Keeping field names in Japanese, keywords in English, and category values in Japanese, then doing the bidirectional mapping **on the frontend**. This decision means the original data source doesn't need to change and no risky data migration is needed, while still delivering bilingual Chinese/English search.

**The cost of compatibility can sometimes be fully absorbed by architecture.**

### Takeaway 7: Sibling Projects Are a Low-Cost Growth Lever

`nvzhuang` ↔ `ai-pose-gallery-zh` (288 sets / 1,439 pose references) drive traffic to each other, combining into a complete "pose reference + person reference + garment reference → AI generation" chain.

The two projects share the same ComfyUI workflow foundation (the `Ref2VA` concept): technical reuse + cross-traffic + complementary scenarios. **This is one of the best combinations an independent developer can play.**

---

## 7. Things Worth Criticizing and Watching Out For

Objectively, a few shortcomings.

### 7.1 The Daily Quota Lives in Memory and Resets on Restart

The documentation explicitly flags this limitation. For single-instance personal use it's fine, but if someone turns this backend into a public service for secondary distribution, a restart refreshes the quota. Scaling up requires Redis.

### 7.2 Full-Resolution PNGs Are Unavailable

The `png/*.png` directory referenced by the `原寸` field exceeds 1GB and isn't hosted, so it 404s on GitHub Pages. The frontend has a WebP fallback, so users don't feel it. But the "download the original" feature effectively doesn't exist — **a real image host is needed for genuine originals**.

### 7.3 The Port Convention Was Once Self-Contradictory

The task sheet has a dedicated paragraph on this:

> The static page and the backend both using 8000 in examples is easy to conflict with; please write a set of clearly non-conflicting local demo ports in the README.

The current README has already been changed to 3000 for the frontend and 8000 for the backend, but the trap reminds us: **example commands in the docs must actually have been run.**

### 7.4 Content Compliance Is a Permanent Tightrope

The project's own review report marks 393 items (lingerie / swimwear / sexy) as medium-to-high risk. This kind of content can be misjudged by algorithms whenever it's published publicly in any technical community. The project's response is "use everyday styles for promotion only", but that means **it can never showcase its richest inventory** — an inherent tension.

### 7.5 The Scale Ceiling of a Single-File Frontend

A 3,278-line `index.html` carries the styles, the interactions, the bilingual dictionary, the try-on bench, the IndexedDB records, the settings center, and the compression logic. **Zero-build is a virtue, but once the file passes 3,000 lines, the cost of collaboration and maintainability clearly rises.**

Worth learning is "zero-build"; not worth learning is "never split".

### 7.6 AI Try-On Results Are Not Controllable

No matter how good the prompt is, the final result depends on the model. Phrases in the README like "precisely preserves the five facial features" or "perfectly reproduces" — the project's own spec document actually explicitly warns against writing it that way:

> The three try-on images must correspond truthfully to the implementation, and must not masquerade as an algorithmic certainty; avoid unguaranteeable expressions such as "precisely preserves the five facial features" or "100% restoration".

**The gap between ideal and reality is the biggest hidden cost of this kind of product.**

---

## 8. If You're Building Something Similar, Copy This

### Copy the Architecture

```
Pure static frontend (zero build, zero Key, zero cost)
        ↓ Once users have a real need
Optional backend (pluggable multi-model + complete security protection)
        ↓ If you want to save money
Local ComfyUI (zero cost, no Key, offline)
```

### Copy the Documentation

Write a 500+ line security requirements document whose Evidence table carries code locations and re-verification commands; write an audit report with a clear PASSED / PENDING / BLOCKED three-state; write a licensing decision document that handles **code licensing and asset licensing separately**.

### Copy the Conventions

Copy the four-item pre-commit self-check list from `AGENTS.md` directly; each item must have an executable command, not just a slogan.

### Copy the Trade-off

Between "full compatibility" and "honest labeling", choose the latter. That line in the README — "generation attribute declaration: all images are AI-generated (t2i) conceptual clothing designs, not photos of real branded products" — builds more long-term trust than 500 more images.

---

## 9. Finally

`nvzhuang` doesn't have a lot of code, and its tech stack has no showy elements whatsoever. What let it reach 2,193 Stars in 6 days wasn't technical difficulty, but **getting every single "thing that should be done right" done right**:

- Static and dynamic layered, free and paid clearly separated
- Models pluggable, configuration is pluggable
- Security treated as a feature, aligned end-to-end from requirements doc to code
- On failure, lean toward the secure side
- Documentation and code reconciled item by item
- Data flow completely transparent to the user

Not one of these requires talent. What they require is **spending three extra minutes on every detail**.

If you're working on an AI-application open source project, this approach of "security requirements document + Evidence traceability + fail-safe defaults + four pre-commit gates" is worth carrying over in full.

---

**Project Links**

- Live demo: https://paipiange.github.io/nvzhuang/
- GitHub source: https://github.com/paipiange/nvzhuang
- Sibling project (pose references and image generation workshop): https://github.com/paipiange/ai-pose-gallery-zh
- License: MIT License (fully free and open source, commercial use permitted)

**Chinese Translation**

The Chinese translations of all technical documentation for this project have been synced to the `docs/nvzhuang-translations/` directory in the code repository, including the README, the backend deployment guide, the security validation requirements, the custom upload technical proposal, the compliance review report, and 11 documents in total.

---

Eric|瑞哥
Guangdong, Shenzhen

✅Former IBM architect｜Co-author of the blockchain book "Core Blockchain Technologies and Applications"
Tech code repository:https://github.com/gyc567
Personal site:www.topdigg.com
💼Former CTO of a Singapore asset management company
👉Principal of the WeChat official account "瑞哥观势" (Rui Ge Guan Shi)
💎Focus: creating and preserving wealth
🎯Focused on the boss crowd: using AI to cut costs and boost efficiency
WeChat:360369487

---

In this fast-paced era, I still believe in the power of face-to-face, small-scale, high-density connections.

I'm dedicated to building a "de-bubbled" circle of bosses, focused on:

🔹 Full-spectrum e-commerce: domestic livestreaming, cross-border e-commerce, and incubation of overseas expansion projects

🔹 Venture capital and industrial investment: financial and banking resource matchmaking, corporate financing and M&A

🔹 Content ecosystem: MCN agencies, creator matrices, and brand integration

🔹 Organization building: core team assembly, executive search

## 【My Offline Gatherings】

No conferences — only "small meetings".

✅ Founder private board: deep analysis of business problems

✅ Boss closed-door dinner: connecting with like-minded souls, and even solving life-scale matters (a high-quality single circle)

✅ Industry salons: focused on specific tracks, driving substantive collaboration

## Selection criteria:

Only founders and partners who have results, a sense of boundaries, and a long-term mindset are welcome.

Time is precious — it is reserved only for people with value.
