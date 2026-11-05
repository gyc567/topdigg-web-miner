---
title: "有人把 1407 张 AI 服装图做成网站，还接了虚拟试穿：拍片哥女装项目完整拆解"
date: "2026-11-05"
description: "深度拆解 paipiange/nvzhuang：一个零构建纯静态服装图库 + GoFrame AI 换装后端。附完整部署教程、多模型接入配置、接口安全设计解析与六大设计哲学。"
author: "瑞哥观势"
tags:
  - 开源项目分析
  - AI换装
  - 虚拟试穿
  - GoFrame
  - ComfyUI
  - 多模型适配
  - 安全设计
categories:
  - 开源项目分析
keywords:
  - paipiange nvzhuang
  - AI 虚拟试穿
  - AI 换装后端
  - GoFrame 开源项目
  - ComfyUI 本地换装
  - 多模型适配器
  - API 安全防护
  - 纯静态前端
---

# 有人把 1407 张 AI 服装图做成网站，还接了虚拟试穿

先说结论。

`paipiange/nvzhuang` 是一个 2026 年 10 月底才建仓、到 11 月 4 日已经拿到 **2193 Star / 555 Fork** 的项目。它的技术栈简单到有点反常识：前端是一个 3278 行的 `index.html`，后端是 GoFrame v2，AI 换装靠提示词工程 + 多模型适配器完成。

但它做对了几件很难的事，这些事比代码量重要得多：

**第一，它把"零成本可用"和"高质量能力"做成了两层，而不是一个。** 图库部分完全免费、零部署、零 Key，打开网页就能用；AI 换装部分需要自建后端、自备 Key。绝大多数同类项目会选择把核心功能锁在付费墙后面，或者干脆做成一个需要登录的 SaaS。它没有。

**第二，它在 6 天内补上了一整套生产级 API 安全防护。** Bearer Token 鉴权（SHA-256 摘要 + 恒定时间比较）、严格 CORS 白名单、令牌桶限流、每日额度、并发锁、请求体上限、像素炸弹防护、SSRF 防护。这套东西不是"顺手加的"，是被一份写得像产品文档的安全需求文档驱动出来的。

**第三，它用提示词工程绕开了模型审核这个真实世界约束。** 代码里有一段注释写得很直白：GPT-Image 系列对真人换装场景会被官方安全审核拦截，所以默认模型是 Gemini，并且专门为 GPT-Image 写了一套"防封控"提示词模板。这不是 hack，这是工程妥协，但它诚实。

接下来，本文会带你把这个项目拆开看：它是什么、怎么跑起来、安全是怎么做的、以及它背后的设计哲学。

---

## 一、项目说明：它到底是什么

### 1.1 一句话定位

> **衣装集 COSTUME-DB-01**：1407 套写实真人版 + 1320 套二次元动漫版 AI 生成纯服装图像（2:3 比例，人物不入镜），支持中英双语检索、多维筛选，配备可选的 AI 一键虚拟试穿。

### 1.2 三个图库

| 图库 | 数量 | 内容 | 数据文件 |
|---|---|---|---|
| 写实服装 | 1407 套 | 真人风格纯服装展示 | `data.js` |
| 二次元动漫服装 | 1320 套 | 动漫插画风格服饰 | `data-anime.js` |
| AI 模特脸部/造型库 | 1499 位 | 脸部特写（Face）与造型（Styling） | `data-portrait.js` |

合计超过 4200 组参考素材。模特库来自 CC0 1.0 授权的 `ai-portrait-gallery` 项目，支持按短发/中发/中长发/长发以及 50 种具体发型（如波波头、微卷、一刀切）精准筛选，支持中日英三语检索。

### 1.3 8 大分类（保留日文原名）

数据文件里的分类字段是日文，这是**为了兼容原始数据源而刻意保留**的，前端会自动本地化成中文或英文：

| 分类（日文原名） | 中文 | 数量 |
|---|---|---:|
| 春 | 春季 | 215 |
| 夏 | 夏季 | 254 |
| 秋 | 秋季 | 244 |
| 冬 | 冬季 | 253 |
| ランジェリー | 内衣 | 199 |
| パーティ | 派对 | 48 |
| 水着 | 泳装 | 54 |
| セクシー | 性感风格 | 140 |
| **合计** | | **1407** |

项目自带了一份《图库内容合规与社区发布审查报告》，明确把前 5 类共 1014 件判定为低风险、推荐作为宣传素材；后 3 类共 393 件判定为中到高风险，规定只作为完整数据集的一部分被动检索，不设首页特权置顶。

**这个细节值得单独说一句**：一个图库项目主动给自己的内容分级、给推广素材划红线、规定哪些内容不能当封面用，这是有社区意识的作者才会做的事。绝大多数同类项目只会想着怎么多放几张图。

### 1.4 数据结构：字段名是日文，值是英文

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

| 字段 | 说明 |
|---|---|
| `id` | 编号，如 `SPR-0001` |
| `カテゴリ` | 分类（日文分类名） |
| `キーワード` | 关键词（英文，空格分隔） |
| `サムネ` | 缩略图路径（WebP） |
| `画像` | 展示图路径（WebP） |
| `原寸` | 原尺寸 PNG 路径 |

字段名是日文（`カテゴリ`、`キーワード`、`サムネ`、`画像`、`原寸`），这是数据源的原始 schema，保留它是为了不破坏兼容性。值是英文关键词（`ivory frill knit denim mini skirt coat socks white sneakers`），所以中英文双向检索才能工作：中文模式输入"白"能命中，是因为前端做了关键词本地化映射。

**一个容易踩的坑**：原尺寸 PNG（约 1GB+）没有纳入仓库，`原寸` 字段指向的 `png/*.png` 在 GitHub Pages 上会 404。项目的处理方式是前端下载时自动平滑回退到已托管的高清 WebP 大图，保证按钮不点空。

### 1.5 AI 换装：图 1 + 图 2 ➔ 图 3

试穿流程的本质是把两张图喂给图像模型，让它合成一张：

- **图 1**：选中的服装参考图（来自内置图库，或用户自己上传）
- **图 2**：用户上传的模特照片
- **图 3**：AI 合成的换装效果（保留模特五官发型，融合服装材质与剪裁）

支持写实真人和二次元动漫双风格。项目还与兄弟项目 `ai-pose-gallery-zh`（288 组 / 1439 张多角度姿势参考）联动，形成"姿势参考 + 人物参考 → AI 生成"的完整工作流。

---

## 二、核心思想

如果只能记住三句话，是这三句。

### 思想一：静态站点负责"零摩擦"，后端负责"高质量"

这是整个项目最核心的架构判断。

大部分 AI 换装项目会把前后端捆死：想用？先部署后端、先买 Key、先填 Base URL。对个人用户来说，这个门槛劝退了 99% 的人。

`nvzhuang` 的做法是**能力分层**：

```
┌─────────────────────────────────────────┐
│  第一层：纯静态前端（零部署、零 Key）      │
│  · 4226 套图库浏览                        │
│  · 中英双向检索 / 分类筛选                 │
│  · 大图全屏 / 键盘翻页 / 原图下载          │
│  · 手动搭配台（纯浏览器抠图组合）           │
│  · 以图搜同款（淘宝 / 拼多多）             │
│  · 本地生成记录（IndexedDB）              │
│  ↓ 用户真的想要 AI 换装了                    │
├─────────────────────────────────────────┤
│  第二层：可选 GoFrame 后端（自建、自备 Key）  │
│  · 真正的 AI 换装生成                     │
│  · 5 种模型协议可插拔                     │
│  · ComfyUI 本地离线，零成本                 │
└─────────────────────────────────────────┘
```

第一层 100% 免费且无需任何准备，打开 `https://paipiange.github.io/nvzhuang/` 就能用。第二层才是需要付费能力的部分，而且**明码标价**：项目在 README、前端页面、审计报告三处都显式标注"需自备后端与 API Key，可能产生模型费用"。

**这种分层，本质上是把"获客成本"降到零，把"变现点"留在真正有价值的地方。**

### 思想二：模型是插件，不是硬编码

后端定义了一个极简的适配器接口：

```go
// ImageGenerator 图像生成模型适配器接口
type ImageGenerator interface {
    // Generate 生成换装图。入参为两张图的 base64（人像 + 服装），返回结果图 base64
    Generate(ctx context.Context, personB64, garmentB64, prompt, size string) (string, error)
    // Name 模型别名（对外暴露的名称）
    Name() string
}
```

然后每种协议实现一个适配器：`gpt_image.go`（OpenAI Images 协议）、`doubao.go`（火山方舟协议）、`gemini.go`（Google generateContent 协议）、`comfyui.go`（本地工作流）。

配置文件里加一段就能接入一个全新的国内模型，**不需要改一行代码**：

```yaml
llm:
  models:
    qwen:                 # 通义万相示例
      provider: openai
      envKey: "DASHSCOPE_API_KEY"
      baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1"
      model: "wanx2.1-t2i-turbo"
```

### 思想三：安全是产品特性，不是上线前的补丁

这是本项目和绝大多数开源项目最大的区别。

它有一份独立的《AI 换装接口保护与图片校验功能需求》文档，长达 562 行，结构完全是产品需求文档的写法：用户故事 → 证据表（Evidence）→ 结论表（Findings）→ 功能需求（FR-1 到 FR-16）→ 错误码表 → 配置项。

文档里的 Evidence 表长这样：

| ID | 代码位置 | 当前观察 | 复核命令 |
|---|---|---|---|
| E-001 | `backend/internal/cmd/cmd.go` | 当前只注册响应和默认 CORS 中间件，没有访问鉴权和限流 | `rg -n "Middleware\|CORSDefault" backend/internal/cmd/cmd.go` |
| E-002 | `backend/api/tryon/v1/tryon.go` | `/tryon` 可以直接接收两张 Base64 图片并触发生成 | `rg -n "PersonImage\|GarmentImage\|path:\"/tryon\"" backend/api/tryon/v1/tryon.go` |
| E-003 | `backend/internal/logic/tryon/gpt_image.go` | `decodeB64` 只检查 Base64 解码结果 | `rg -n "func decodeB64" backend/internal/logic/tryon/gpt_image.go` |

Findings 部分直接给出结论：

- **F-001**：公开部署时，任何人都可能调用生成接口 → 可能消耗模型额度或占满本地 GPU
- **F-002**：合法 Base64 不等于合法、安全的图片 → 可能造成内存、CPU、带宽浪费或模型调用失败

**这种"先取证、再下结论、最后给方案"的写法，比大部分公司的安全 PRD 都规范。** 而且它真的被执行了——我通读了 `internal/security/` 和 `internal/middleware/` 的全部实现，需求文档里的 FR-1 到 FR-16 全部有对应代码。

---

## 三、设计哲学：六条可以迁移的原则

这部分是我认为这个项目最有价值的产出。技术会过时，但下面这些判断不会。

### 哲学 1：Fail-Safe Defaults（失败时回到安全状态）

这条被写进了 `AGENTS.md` 的架构规范，并在代码里严格执行：

> 后端服务在启动时，若检测到宿主机未显式创建 `config.yaml`，必须具备代码层自动回退加载 `config.example.yaml` 的能力。

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

同理还有端口兜底：

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

**为什么这条重要？** 因为 Go 的 `net/http` 在 `ListenAndServe(":0")` 时会分配一个随机高位端口。AGENTS.md 里特别点名了这个坑：

> 绝对禁止因未配置 address 而进入系统 `:0` 随机高位临时端口（如 `:37093`）。

容器化部署里，一个随机的 `server.address` 配置缺失，会让健康检查、反向代理、容器编排全部失灵——而且不报错，只表现为"服务起来了但访问不到"。这种 bug 极难排查。

### 哲学 2：零泄露原则（Zero Leakage）

`AGENTS.md` 开篇就是一条红线：

> 绝对禁止将任何真实的 API Key（包括但不限于 OpenAI `sk-...`、火山方舟 `ARK...`、Google Gemini `AIza...`、通义千问 `sk-...` 等）、私有 Token、密码、证书密钥提交到 Git 仓库或暂存区。

配套的落地手段：

- `config.yaml`、`.env` 全部进 `.gitignore`，仓库里只保留 `config.example.yaml` 和 `.env.example`
- 模板里的 Key 字段必须是空字符串或 `sk-你的key` 这类占位符
- 前端的"个人模型配置"只存在浏览器 `localStorage`，后端只在内存中使用，**不写数据库、不写配置文件、不写业务日志**
- 日志只允许记录 MIME、宽高、字节数和最多 16 位 SHA-256 前缀，不记录图片内容和完整哈希

更狠的是提交前的自查清单，直接写成了可执行命令：

```markdown
- [ ] **步骤 1**：运行 `git status`，确保没有临时文件、日志文件、编译产物、真实配置文件进入暂存区。
- [ ] **步骤 2**：逐行审查 `git diff --cached`，确认无真实 Key、无个人姓名电话、无调试遗留硬编码凭证。
- [ ] **步骤 3**：敏感字符串安全扫描，执行正则 `(sk-[a-zA-Z0-9]{20,}|AIza[a-zA-Z0-9]{20,})`。
- [ ] **步骤 4**：运行 `go test ./...` 与 `go vet ./...`，确保代码编译通过、测试全绿。
```

**这条清单本身就可以直接抄走用。** 它把"要小心"这种口号变成了四个具体的门禁。

### 哲学 3：隐私边界要在文档里说清楚，而不是藏起来

项目在多处明确标注数据流向：

- 自定义上传的服装原图**仅保留在当前页面内存中**，不写入本地存储或生成记录，刷新或关闭页面后自动清除
- 生成记录只保存在当前浏览器的 IndexedDB，**不上传、不跨设备同步**
- 生成时只将**压缩后**的图片内容发送到用户配置的换装后端

这个透明度很关键。AI 换装涉及人像照片，用户最怕的就是"我的照片去哪了"。项目没有含糊其辞，而是把数据流画清楚。

### 哲学 4：显式拒绝优于静默降级

错误响应不是笼统的"生成失败"，而是精确到业务码：

| HTTP | 业务码 | `error_code` | 用户提示 |
|---:|---:|---|---|
| 401 | 40101 | `AUTH_REQUIRED` | 请在设置中心填写后端访问 Token |
| 401 | 40102 | `AUTH_INVALID` | 后端访问 Token 无效 |
| 403 | 40301 | `ORIGIN_NOT_ALLOWED` | 当前页面来源不允许访问后端 |
| 429 | 42901 | `RATE_LIMITED` | 请求过于频繁，请稍后重试 |
| 429 | 42902 | `DAILY_QUOTA_EXCEEDED` | 今日生成额度已用完 |
| 429 | 42903 | `CONCURRENCY_LIMITED` | 当前生成任务较多，请稍后重试 |
| 413 | 41301 | `REQUEST_TOO_LARGE` | 上传内容过大，请压缩图片后重试 |
| 422 | 42201 | `INVALID_IMAGE_BASE64` | 图片数据损坏，请重新选择图片 |
| 422 | 42202 | `UNSUPPORTED_IMAGE_TYPE` | 仅支持 JPEG、PNG 和 WebP |
| 422 | 42203 | `IMAGE_FILE_TOO_LARGE` | 图片文件过大，请压缩后重试 |
| 422 | 42204 | `IMAGE_DIMENSIONS_INVALID` | 图片尺寸不符合要求 |
| 422 | 42205 | `IMAGE_PIXEL_LIMIT_EXCEEDED` | 图片像素过高，请缩小后重试 |

前端根据 `error_code` 显示中英文提示，**不依赖后端原始错误字符串做正则匹配**。

而且所有错误响应必须包含 `request_id`，不得包含 Token、模型 API Key、图片 Base64 或供应商原始敏感错误。

### 哲学 5：让模型适配和业务逻辑解耦

`tryon.go` 的主流程很短，但每一步的判断都带着明确的理由：

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

注意最后那个错误处理的处理方式：

```go
result, err := gen.Generate(ctx, personB64, garmentB64, promptStr, size)
if err != nil {
    // 不记录原始错误：网络错误可能包含用户自定义 Base URL，供应商响应也可能含敏感信息。
    return "", "", "", gerror.Wrap(err, "换装生成失败，请稍后重试")
}
```

**为什么不记录原始错误？** 因为用户的 `client_config.base_url` 可能被拼进网络错误信息里，而供应商的响应体可能包含敏感内容。直接吞掉原始错误、统一成一句友好提示，是这里最安全的选择。

### 哲学 6：文档和代码必须对得上

这个项目有一份 `nvzhuang.md` 任务书，专门用来修文档和代码的偏差，里面点名了具体的不一致：

> 1. README 的根目录启动命令为 `cp backend/.env.example backend/.env` 后在**仓库根目录**执行 `docker compose up -d`，但 Compose 默认优先从工作目录读取 `.env`。应检查并修正这一误导。
> 2. 前端下拉框默认模型是 `gemini`；API 请求结构的 `Model` 默认值写 `gpt-image`，而部分业务逻辑注释/空值兜底又写 `gemini`。必须核对 GoFrame 默认值真正生效路径，统一 README/前端/后端说明，**不得简单声称"默认 GPT Image 2"**。

第二点尤其有意思——它连"文档里三种说法不一致"这种极细的偏差都抓出来了。这背后是作者（或者说给作者写任务书的 AI）的一种执念：**文档漂移是技术债，而且是最容易被忽略的那种。**

---

## 四、详细教程：从零跑起来

### 4.1 环境要求

| 用途 | 要求 |
|---|---|
| 前端静态站点 | 现代浏览器即可，或 Python 3 / Node |
| 后端编译运行 | Go 1.18+ 或 Docker |
| 云端 AI 换装 | 至少一个模型 API Key |
| 本地 AI 换装 | ComfyUI + 独立显卡（推荐），无需任何 Key |

### 4.2 第一步：跑前端（无需任何配置）

前端是纯静态站点，**不需要构建**。

```bash
# 方式一：Python 内置服务器（推荐，端口 3000，与后端 8000 不冲突）
python3 -m http.server 3000

# 方式二：Node 简单服务器
npx serve -l 3000 .

# 方式三：直接用现代浏览器打开 index.html
```

浏览器访问 `http://localhost:3000`。

此时你已经有：4226 套图库、中英双语检索、分类筛选、大图全屏、键盘翻页、无限滚动、原图下载、手动搭配台、以图搜同款、IndexedDB 本地生成记录——**全部免费，零 Key，零后端**。

> ⚠️ **端口别和后端撞车**：静态站点用 3000，后端用 8000。项目原任务书专门指出过这个混淆问题。

### 4.3 第二步：起后端（Docker，最省事）

```bash
cd backend

# 1. 复制环境变量模板并填入你的 Key
cp .env.example backend/.env
# 编辑 .env，例如：ARK_API_KEY=xxxx（国内推荐豆包，无需翻墙）

# 2. 一键启动（内置开箱即用兜底，默认监听 8000 端口）
docker compose up -d

# 3. 查看日志
docker compose logs -f
```

服务启动后监听在 `http://localhost:8000`。

**注意**：必须在 `backend/` 目录下执行这条命令（先 `cd backend` 再 `cp .env.example .env`）。如果在仓库根目录执行，Compose 会去读根目录的 `.env`，读不到后端的配置——这是项目任务书里专门点名过的坑。

Docker 单容器方式：

```bash
cd backend
docker build -f manifest/docker/Dockerfile -t costume-tryon .

docker run -d --name costume-tryon -p 8000:8000 \
  -e ARK_API_KEY="你的豆包ArkKey" \
  -e OPENAI_API_KEY="sk-你的OpenAIKey" \
  costume-tryon
```

Windows 用户有个偷懒福利：直接双击 `backend/restart.bat`，自动编译并启动。

无 Docker 环境（源码运行）：

```bash
cd backend
# 可选：复制配置文件（不复制时系统会自动安全回退加载模板并监听 8000）
# cp manifest/config/config.example.yaml manifest/config/config.yaml
export ARK_API_KEY="你的Key"      # Windows PowerShell 用 $env:ARK_API_KEY="你的Key"
go run main.go
```

### 4.4 第三步：配置前端指向后端

前端 `index.html` 按以下优先级识别换装后端地址（**从高到低**）：

1. **设置中心**：用户在当前浏览器保存的「后端 API 地址」（跨源外部公网后端须使用 **HTTPS**）
2. **全局变量**：在 HTML 加载前配置 `window.AI_API_URL = "http://localhost:8000"`
3. **URL 参数**：`https://你的前端地址/?tryon=http://localhost:8000`
4. **本地回退**：以 `localhost` 或 `127.0.0.1` 访问前端时，默认自动连接 `http://127.0.0.1:8000`

关于第 3 条，有一条**安全约束**必须知道：

> 为防止钓鱼窃取 API Key 与私密照片，`?tryon=` 仅允许同源或本机回环 `localhost`/`127.0.0.1`；外部后端须在设置中心显式保存。

也就是说，**你不能在公网网页上用 `?tryon=` 指向一个陌生后端**，这是防 SSRF 和防钓鱼的设计。

前端还有几个 URL 参数很实用：

```
?lang=en           # 初始语言（zh / en，默认 zh）
?q=lace            # 初始搜索词
?lang=en&q=white   # 组合使用
```

### 4.5 第四步：多模型接入

后端通过配置文件的 `llm.models` 管理模型，**Key、Base URL、模型名三项全部可配**：

```yaml
llm:
  models:
    gpt-image:              # 前端请求用的别名
      provider: openai      # 协议：openai / doubao / gemini
      apiKey: ""            # 直接填 Key，或留空用环境变量
      envKey: "OPENAI_API_KEY"   # 环境变量名（优先级高于 apiKey）
      baseURL: "https://api.openai.com/v1"
      model: "gpt-image-2"

    doubao:                 # 豆包（火山方舟），国内可用
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

**四种协议的区别**（这是接入时最容易搞混的地方）：

| provider | 协议 | 说明 |
|---|---|---|
| `openai` | `POST {baseURL}/images/generations` + `input` 数组 | OpenAI 官方 GPT-Image、通义万相、智谱 CogView、硅基流动、多数中转站 |
| `doubao` | 同上 `/images/generations`，但请求体是火山格式（`prompt` + `image[]`），返回 `url` | 豆包 Seedream |
| `gemini` | Google 原生 `generateContent` | Gemini 图像模型 |
| `comfyui` | 本机 ComfyUI API + 服务端固定工作流 | 本地离线，不接受 `client_config` |

**接一个国内模型，只需要在 `llm.models` 下加一段**，前端下拉框在 `index.html` 的 `<select id="aiModel">` 中增减 `<option>` 即可对应。

### 4.6 第五步：ComfyUI 本地离线模式（零成本、免 Key）

这是本项目最有想象力的部分：**让你的显卡替你付费**。

系统内置**双工作流自适应**：

| 工作流 | 模型 | 特点 |
|---|---|---|
| **Qwen-Image-Edit-2511（优先默认）** | `qwen_image_edit_2511_int8_convrot.safetensors` + 4 步 Lightning LoRA | 4 步极速生成，语义换装保真度更高 |
| **MiniMax H3（兼容保留）** | H3 Ref2VA 视频模型抽取第 31 帧定格 | 兜底方案 |

调用时系统自动检测可用状态：优先 Qwen，未就绪自动平滑回退 H3；也可以通过 `comfyui-qwen` 或 `comfyui-h3` 显式指定。

**准备模型文件：**

```bash
# Qwen-Image-Edit
models/diffusion_models/qwen_image_edit_2511_int8_convrot.safetensors
models/text_encoders/qwen_2.5_vl_7b_fp8_scaled.safetensors
models/vae/qwen_image_vae.safetensors
models/loras/Qwen-Image-Edit-2511-Lightning-4steps-V1.0-bf16.safetensors

# MiniMax H3（还需要）：H3、Qwen3-VL、ClipProj、LoRA、视频 VAE 和音频 VAE
```

**启动 ComfyUI：**

```bash
# 默认地址 http://127.0.0.1:8188
```

**在网页里启用：**

1. 打开右上角「设置中心」
2. 选择「使用我自己的模型配置」
3. 协议选「ComfyUI 本地」
4. 点「测试连接」——该接口（`GET /comfyui/health`）只检查 ComfyUI API、固定工作流以及节点与模型可用性，**不上传图片，也不执行生成**
5. 测试成功后保存

### 4.7 第六步：生产环境部署（重要）

#### 4.7.1 Nginx 反向代理

```nginx
server {
    listen 443 ssl;
    server_name api.你的域名.com;

    ssl_certificate     /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        # 大图片 base64 请求体，调大超时和体积上限
        client_max_body_size 30m;
        proxy_read_timeout 180s;
        proxy_send_timeout 180s;
    }
}
```

前端部署时在 `index.html` 顶部加一句：

```html
<script>window.AI_API_URL="https://api.你的域名";</script>
```

#### 4.7.2 安全配置清单

```yaml
security:
  authRequired: true                # 本地调试可设 false，线上部署必须为 true
  apiKeysEnv: "TRYON_API_KEYS"      # 多个 Token 用英文逗号分隔，每个 32~512 字符
  trustedOrigins:                   # CORS 严格白名单（精确匹配，禁止 *）
    - "https://paipiange.github.io"
    - "http://localhost:3000"
    - "http://127.0.0.1:3000"
  allowPrivateNetwork: false        # 是否允许来自私有网络的 PNA 预检
  rateLimit:
    requestsPerMinute: 10           # 单调用方每分钟请求速率上限
    burst: 3                        # 允许短时间突发容量
    limiterIdleMinutes: 30          # 限流器闲置自动清理周期（分钟）
    dailyRequestsPerPrincipal: 100  # 单调用方每日最高调用成功额度（自然日重置）
  concurrency:
    global: 2                       # 全局最大生图并发数
    perPrincipal: 1                 # 单调用方最大生图并发数
```

设置 Token：

```bash
TRYON_API_KEYS="your-secure-token-with-at-least-32-chars-long-1234,another-client-token-5678"
```

后端**只在内存保存 Token 的 SHA-256 哈希摘要**，比对使用恒定时间比较（Constant-Time Compare）防止时序侧信道攻击，日志、错误响应和响应头中绝不打印任何 Token 明文。

> ⚠️ **一个必须知道的限制**：每日额度计数器保存在进程内存中，**后端重启会重置**。多实例部署需要外部共享存储（Redis 等）。

#### 4.7.3 验证部署

```bash
# 未带 Token 或错误 Token（预期返回 HTTP 401: AUTH_REQUIRED）
curl -X POST https://api.你的域名/tryon -H "Content-Type: application/json" -d '{}'

# 预期返回：
# {"code":40101,"message":"请在设置中心填写后端访问 Token",
#  "data":{"error_code":"AUTH_REQUIRED","request_id":"..."}}

# 携带合法 Token 验证连通性
curl -X POST https://api.你的域名/tryon \
  -H "Authorization: Bearer 你的Token" \
  -H "Content-Type: application/json" \
  -d '{}'

# 预期返回缺少参数验证错误：
# {"code":51,"message":"The PersonImage field is required","data":null}
```

---

## 五、安全设计深度解析

这是我认为最值得学的部分，所以单独开一节。

### 5.1 请求处理顺序：先拒绝，再花钱

```
1. 接收请求并生成请求 ID
2. 校验 Origin（CORS 白名单）
3. 限制整个 HTTP 请求体大小（24 MiB，在 JSON 解析前）
4. 校验后端访问 Token
5. 执行速率、每日额度和并发检查
6. 校验两张图片的 Base64、真实 MIME、文件大小、宽高和像素数
7. 调用模型适配器
8. 无论成功或失败，都释放并发占用
```

**注意第 7 步在第 6 步之后**——所有非法请求都在触达模型之前就被拒绝。这是"不让攻击者花钱"的核心设计。

### 5.2 图片校验的九道关

`internal/imagevalidate/validate.go` 的 `ValidateImage` 函数，逻辑是层层递进的：

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

三个关键设计：

**① 不信任声明，只信内容。** Data URL 里写的 `image/png` 一律不信，用 `http.DetectContentType` 嗅探真实字节类型，并且声明和真实必须一致。伪造扩展名的攻击在这里就死了。

**② 先预估，后解码。** 第 2 步用 `len(rawB64) * 3 / 4` 预估解码大小，明显超限时**根本不执行完整解码**。这挡住了一类很朴素的 DoS：上传一个 500MB 的 Base64 字符串。

**③ 用 `DecodeConfig` 而不是 `Decode`。** `image.DecodeConfig` 只读图片头就能拿到宽高，不解码全部像素。这既快又安全——2000 万像素的图完整解码会吃掉上百 MB 内存。

**限制参数一览：**

| 项目 | 限制 |
|---|---|
| 整个 HTTP 请求体 | 24 MiB |
| 单张 Base64 编码字符串 | 12 MiB |
| 单张图片解码后 | 8 MiB |
| 两张图片解码后合计 | 16 MiB |
| 宽高范围 | 256 px ~ 8192 px |
| 总像素 | ≤ 20,000,000 px |
| 允许格式 | `image/jpeg`、`image/png`、`image/webp` |

### 5.3 前端压缩：让 99% 的用户根本撞不到后端限制

后端限制很严，但项目没有让用户去手动压缩图片，而是在前端做了自适应处理：

| 环节 | 处理 |
|---|---|
| 上传前 | 任一边 < 256 px 时自动等比**放大**到合规尺寸 |
| 常规模式 | 最长边缩放到 1280 px |
| 高清模式 | 最长边缩放到 2048 px |
| 编码格式 | 优先 WebP，浏览器不支持则降级 JPEG |
| 质量阶梯 | 0.90 → 0.75，逐级下调直到 ≤ 8 MiB |

结果是：**绝大多数手机实拍照片无感顺畅上传**，用户永远看不到"文件过大"这种提示。

### 5.4 SSRF 防护：公网后端不能被当内网跳板

`ModelConfig` 里有一个专门的标志：

```go
// ClientProvided 表示配置来自浏览器；启用后 HTTP 客户端会阻止内网/保留地址，降低 SSRF 风险。
ClientProvided bool
```

对应规则：

- 个人 Base URL 必须是 HTTP/HTTPS 公网地址
- **不能包含账号、查询参数或片段**
- **localhost、内网和保留地址一律拒绝**
- Gemini Key 使用请求头传递，**不进入上游 URL**
- ComfyUI **不接受** `client_config`，只使用后端本机配置

最后一条尤其关键。ComfyUI 的工作流路径和节点 ID 只允许来自服务端配置，不能由浏览器请求覆盖。否则公网部署的后端会变成一个"任意访问本机 8188 端口并执行任意工作流"的漏洞。

### 5.5 并发控制：不排队，直接拒绝

| 配置 | 默认值 |
|---|---|
| 全局最大并发 | 2 |
| 单 Token 最大并发 | 1 |

> 成功、失败、超时、Context 取消和 panic 都必须释放名额。

"不排队"是个有争议的设计。有些系统会选择排队等待，用户体验更平滑。但对**付费生图接口**来说，排队意味着请求堆积、内存占用上升、超时增加。直接返回 429 + `Retry-After` 更诚实。

### 5.6 提示词工程：与审核系统的周旋

这是项目里最有意思的一段代码。`prompt.go` 为不同模型准备了**三套提示词**。

**通用提示词（Gemini / 豆包等）——英文主用，中文备用：**

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

**GPT-Image 专用提示词**——注意它在措辞上明显更保守：

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

差异在哪？

- "professional commercial fashion virtual try-on photograph" —— 强调**商业摄影**语境
- "adult female model" —— 明确成人女性模特
- "Fully clothed, modest neckline, standard tailored fit, upright standing posture, non-revealing" —— 主动排除可能触发审核的描述
- "lookbook standard" —— 用高定时装画册这种更"无害"的行业语境

**为什么要专门写？** 因为代码注释说得很清楚：GPT-Image 系列对真人换装场景会被官方安全审核拦截（`moderation_blocked` / `sexual`）。

这是**工程上的真实妥协**：不是去绕过审核（那是违规的），而是把请求表述得更贴近一个本来就合规的商业摄影场景，让模型在正确的语义空间里工作。同时把默认模型设为审核更宽松的 Gemini。

**从内容策略的角度看，这也解释了为什么图库要做"人物不入镜"**。1407 套图全部是纯服装展示，人物不出现——这让整条链路从素材到提示词都远离了那些敏感的边界。项目自己的合规报告里也强调了这一点。

### 5.7 一个容易被忽略的细节：结果图 MIME 也是嗅探出来的

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

**入站信供应商的 header，出站也不信**——自己按文件签名判断。这个对称性很干净。

---

## 六、归纳总结：七个可以带走的观点

### 观点 1：免费层不是慈善，是获客结构

把 4200+ 组图库完全免费开放，把 AI 换装作为自建选项——这个决定让项目在 6 天内拿到 2193 Star。

**推广依赖"他人能立刻体验"，付费依赖"高价值场景"。** 把这两件事绑死，就等于把推广也绑死了。

### 观点 2：可选项要说透，不能含糊

项目在 README、页面、审计报告三处重复标注"需自备后端与 API Key，可能产生模型费用"。

很多项目怕说清楚就没人用了，于是含糊其辞，结果用户用不了还怪项目坑人。**说透反而建立了信任。**

### 观点 3：文档漂移是最容易被低估的技术债

那份 `nvzhuang.md` 任务书抓出的细节很说明问题：默认模型在 README、API 结构、业务逻辑注释三处有三种说法；Docker Compose 的 `.env` 读取路径会误导用户。

**这些都不会让程序崩溃，但每一个都会浪费用户半小时。** 一个项目愿意专门写一份任务书来消灭这类偏差，说明作者理解"文档是产品的一部分"。

### 观点 4：安全需求应该像产品需求一样写

那份 562 行的安全需求文档，用的是用户故事 → Evidence → Findings → FR → 错误码 → 配置项的标准结构。

关键在于 Evidence 表：**每条结论都附带代码位置和可复现的复核命令**。这让文档不会变成空想，也让后来者能自己验证。

### 观点 5：默认值的方向永远应该是"安全且可用"

`config.yaml` 缺失时自动回退到 `config.example.yaml`；`server.address` 未配置时显式绑定 `:8000` 而不是随机端口；`authRequired` 默认为 `true`；`allowPrivateNetwork` 默认为 `false`。

**Fail-safe 的意思是：出问题时，系统倒向"安全"这一侧，而不是倒向"能跑起来"那一侧。**

### 观点 6：本地化不是翻译，是数据模型决策

字段名保留日文、关键词用英文、分类值用日文，然后在**前端**做双向映射。这个决策让原始数据源不用改、也不用做一次高风险的数据迁移，同时拿到了中英双语的检索能力。

**兼容性的代价有时可以完全被架构消化掉。**

### 观点 7：兄弟项目是低成本增长杠杆

`nvzhuang` ↔ `ai-pose-gallery-zh`（288 组 / 1439 张姿势参考）互相引流，组合出"姿势参考 + 人物参考 + 服装参考 → AI 生成"的完整链路。

两个项目共享同一套 ComfyUI 工作流基础（`Ref2VA` 概念），技术复用 + 流量互导 + 场景互补。**这是独立开发者能打的最好组合拳之一。**

---

## 七、值得吐槽和需要留意的地方

客观说几个不足。

### 7.1 每日额度在内存里，重启即重置

文档里明确标注了这个限制。单实例自用没问题，但如果有人拿这个后端做成公网服务做二次分发，重启就能刷新额度。要上规模必须换 Redis。

### 7.2 原尺寸 PNG 不可用

`原寸` 字段指向的 `png/*.png` 目录超 1GB 未托管，GitHub Pages 上 404。前端做了 WebP 回退，所以用户体感不到。但"下载原尺寸"这个功能实质上是不存在的——**真正的原图需要另建图床**。

### 7.3 端口约定曾经自相矛盾

任务书里专门写了一段：

> 静态页面与后端都使用 8000 的示例容易冲突；请在 README 写出一组明确不冲突的本地演示端口。

当前 README 已经改成前端 3000、后端 8000，但这个坑提醒我们：**文档里的示例命令必须实际跑过**。

### 7.4 内容合规是永久的紧箍咒

项目自己的审查报告把 393 件（内衣/泳装/性感）标为中到高风险。这类内容在任何技术社区公开发布都可能被算法误判。项目的应对是"宣传只用日常款"，但这意味着**它永远无法展示自己库存最丰富的部分**，这是一个内在张力。

### 7.5 单文件前端的规模天花板

3278 行的 `index.html` 承载了样式、交互、双语字典、试穿台、IndexedDB 记录、设置中心、压缩逻辑。**零构建是优点，但文件超过 3000 行后，协作和可维护性的成本开始明显上升。**

值得学的是"零构建"，不值得学的是"永不拆分"。

### 7.6 AI 换装效果不可控

提示词写得再好，最终效果取决于模型。README 里的"精准保留五官""完美复刻"这类表述，项目自己的规范文档其实明确警告过不能这么写：

> 换装三图须真实对应实现，不得冒充算法必然效果；避免"精准保留五官""100%还原"之类不可保证的表述。

**理想和现实的落差，是这类产品最大的隐性成本。**

---

## 八、如果你要做类似的东西，抄什么

### 抄架构

```
纯静态前端（零构建、零 Key、零成本）
        ↓ 用户产生真实需求后
可选后端（多模型可插拔 + 完整安全防护）
        ↓ 想省钱
本地 ComfyUI（零成本、免 Key、离线）
```

### 抄文档

写一份 500+ 行的安全需求文档，Evidence 表带代码位置和复核命令；写一份审计报告，PASSED / PENDING / BLOCKED 三态分明；写一份许可证决策书，把代码授权和素材授权**分开**处理。

### 抄规范

把 `AGENTS.md` 里的四条提交前自查清单直接抄走，每条都要有可执行的命令，不能只是口号。

### 抄取舍

在"全面兼容"和"诚实标注"之间，选后者。README 里那句"生成属性声明：所有图像均为 AI 生成（t2i）概念服装设计，非现实品牌商品照片"，比多放 500 张图更能建立长期信任。

---

## 九、最后

`nvzhuang` 的代码量不大，技术栈也没有任何炫技成分。它能在 6 天内做到 2193 Star，靠的不是技术难度，而是**把每一个"应该做对"的地方都做对了**：

- 静态与动态分层，免费与付费分明
- 模型可插拔，配置即插拔
- 安全当特性做，从需求文档到代码全链路对齐
- 失败时倒向安全侧
- 文档与代码逐条对账
- 数据流向对用户完全透明

这些没有一项需要天赋，需要的是**在每一个细节上多花三分钟**。

如果你正在做 AI 应用类开源项目，这套"安全需求文档 + Evidence 追溯 + Fail-Safe 默认值 + 提交前四道门禁"的做法，值得完整搬过去。

---

**项目地址**

- 在线体验：https://paipiange.github.io/nvzhuang/
- GitHub 源码：https://github.com/paipiange/nvzhuang
- 兄弟项目（姿势参考与生图工坊）：https://github.com/paipiange/ai-pose-gallery-zh
- 许可证：MIT License（完全免费开源，允许商业使用）

**中文译本**

本项目全部技术文档的中文译本已同步至代码仓库 `docs/nvzhuang-translations/` 目录，包含 README、后端部署指南、安全校验需求、自定义上传技术方案、合规审查报告等 11 份文档。

---

Eric|瑞哥
广东 深圳

✅前IBM架构师｜区块链书《区块链核心技术与应用》合著作者
技术代码仓库:https://github.com/gyc567
个人网站:www.topdigg.com
💼新加坡资管公司前CTO
👉公众号「瑞哥观势」主理人
💎聚焦在:创富和守富
🎯专注老板群体：用AI 降本增效
微信:360369487

---

在这个快节奏的时代，我依然相信面对面、小范围、高浓度的链接力量。

我致力于搭建一个"去泡沫化"的老板圈子，重点关注：

🔹 电商全域：国内直播、跨境电商与出海项目孵化

🔹 创投与产投：金融银行资源对接、企业融资与并购

🔹 内容生态：MCN机构、达人矩阵与品牌整合

🔹 组织建设：企业核心团队搭建、高管寻访

## 【我的线下局】

不办大会，只办"小会"。

✅ 创业私董会：深度剖析商业难题

✅ 老板闭门饭：链接同频灵魂，甚至解决人生大事（高质量单身圈层）

✅ 行业沙龙：聚焦具体赛道，促成实质合作

## 筛选标准：

只欢迎有结果、有边界感、有长期主义心态的创始人/合伙人。

时间宝贵，只留给有价值的人。
