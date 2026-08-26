# AI Daily 多语言工作流

AI Daily 模块（`/ai-daily`）的多语言内容生产、构建、验证标准流程。新增任意一期日报，按本文件执行可保证 5 语言齐全。

---

## 数据布局

```
content/ai-daily/
├── zh-Hans/2026-08-20-ai-daily.md   ← 主稿（人工写）
├── zh-Hant/2026-08-20-ai-daily.md   ← AI 一次性生成
├── en/2026-08-20-ai-daily.md        ← AI 一次性生成
├── ja/2026-08-20-ai-daily.md        ← AI 一次性生成
└── vi/2026-08-20-ai-daily.md        ← AI 一次性生成
```

每份 md 是独立文件，frontmatter 用字符串（与 `content/blog/*` 同构），slug 必须 5 语言一致才能聚合。

---

## 新增一期日报 SOP

### 1. 写 zh-Hans 主稿

`content/ai-daily/zh-Hans/YYYY-MM-DD-ai-daily.md`，frontmatter 字段：

```yaml
---
title: "本地化字符串"
date: "YYYY-MM-DD"
description: "本地化字符串"
tags:
  - AI日报
categories:
  - AI日报
source:
  aggregator: "AI HOT"
  aggregator_url: "https://aihot.virxact.com"
  original:
    name: "比特财商"
    # url: "https://..."  ← 自 2026-08-26 起已移除，前端不再渲染链接
hn_count: 5
hn_keywords: "AI OR GPT OR LLM OR ..."
---
```

正文 markdown：章节标题 / 条目标题 / 描述 / `来源：...` 行，HN 区块在内文末尾（snapshot 翻译）。

### 2. 让 AI 生成 4 语言 md

向 AI 提供「zh-Hans 原文 + frontmatter 模板」，要求生成 zh-Hant / en / ja / vi 4 份 md。

**AI 必须遵守**：
- frontmatter 用纯字符串（不要嵌套 `{ zh-Hant: ... }` 对象）
- `slug` 保持文件名（不带 locale 前缀），5 文件同名同 slug
- `tags/categories` 翻译，但保持单层数组（`["AI Daily"]` 而非 `{en: ...}`）
- `source.aggregator` 保留品牌名 "AI HOT"
- `source.original.name` 翻译
- ~~`source.original.url`~~ **不要**填 — 自 2026-08-26 起前端改为 QR 图片，不再渲染 weixin 链接
- `hn_keywords` 字段不变（机器可读，与语言无关）
- markdown body 章节标题 + 条目 + HN 区块全部翻译
- HN 区块 URL 不变；标题、来源行翻译
- 专有名词保留原文：Hugging Face / Claude Code / Hacker News / Liquid AI / Replit / FastMetal / GLM-5.3 / OpenRouter / Stripe / Anthropic / Google Blog / GitHub Releases / Sky Computing Lab 等

### 3. 跑构建

```bash
node scripts/build-ai-daily.js
```

会输出 5 个 meta json + 1 个全量 data json：

```
src/lib/ai-daily-data.json
src/lib/ai-daily-meta.json
src/lib/ai-daily-meta-zh-Hans.json
src/lib/ai-daily-meta-zh-Hant.json
src/lib/ai-daily-meta-en.json
src/lib/ai-daily-meta-ja.json
src/lib/ai-daily-meta-vi.json
```

### 4. 验证

```bash
npx vitest run    # 69 tests including i18n-keys + locale normalization
npm run build     # typecheck + bundle
```

接着浏览器实测 5 语言 URL，截图记录：

- `/ai-daily?lang=zh-Hans` 列表 / `/ai-daily/YYYY-MM-DD-ai-daily?lang=zh-Hans` 单篇
- 替换 lang 参数：`zh-Hant` / `en` / `ja` / `vi`
- 列表 h1 / 单篇 h1 / 章节 h2 翻译对齐
- console 无 404 / 资源错误
- 4 个 `meta-{locale}.json` 资源 status 200

---

## 翻译参考

i18n key 在 `src/locales/{locale}/translation.json` 的 `aiDaily` 节，5 语言全部就绪，无需修改：

| key | 示例（zh-Hans） |
|---|---|
| `aiDaily.indexTitle` | AI 日报 |
| `aiDaily.indexDesc` | 每日精选 AI 行业资讯，源自优质信源 |
| `aiDaily.source` | 来源 |
| `aiDaily.readMore` | 阅读全文 |
| `aiDaily.loadMore` | 加载更多 |
| `aiDaily.noReports` / `noReportsHint` | 暂无日报内容 / 日报将在每天 8 点自动更新，请稍后再来 |
| `aiDaily.resultsCount` | 共 {{count}} 期 |
| `aiDaily.aggregator` / `original` / `today` / `backToList` | — |
| `aiDaily.originalHint` | 扫码关注公众号获取原文（`<img>` alt） |
| `aiDaily.originalCaption` | 原文出处：{{name}}（`<figcaption>`） |
| `aiDaily.hackerNews` | Hacker News 热帖 |
| `aiDaily.hnTop5.{sectionTitle, source, hnrss, filteredFrom, keywords, viewOnHN, fetchFailed, fallbackNote, itemsCount}` | — |

新增 UI 文案 key 时同步翻译 5 个翻译文件。

---

## 原文出处展示（自 2026-08-26 v2）

**前端**：AI Daily post 页 header 用 `<picture>` 渲染 `public/qr-scan-follow.webp`
（PNG 回退 `public/qr-scan-follow.png`），不再展示 weixin 链接 Badge。

**frontmatter 约束**：
- `source.original.name` 必填（每 locale 一份本地化名）
- ~~`source.original.url`~~ **已移除**——新条目不要加

**图片资产所有权**：
| 文件 | 用途 | 大小 |
|------|------|------|
| `public/qr-scan-follow.webp` | 主用（`<source type="image/webp">`） | ~25 KB |
| `public/qr-scan-follow.png` | 回退（`<img>` 老浏览器/邮件） | ~115 KB |
| `public/扫码_搜索联合传播样式-标准色版.png` | **源图保留**，不要删除 | ~4 MB（BMP 格式 + .png 扩展名） |

**替换图流程**：
1. 用同规格 PNG/BMP覆盖 `public/扫码_搜索联合传播样式-标准色版.png`
2. 跑 PIL 重生成 webp + 英文名 png：
   ```python
   from PIL import Image
   img = Image.open('public/扫码_搜索联合传播样式-标准色版.png')
   img.thumbnail((1280, 1280), Image.LANCZOS)
   img.save('public/qr-scan-follow.webp', 'WEBP', quality=82)
   img.save('public/qr-scan-follow.png', 'PNG', optimize=True)
   ```
3. 不需要改任何代码

---

## 已知约束（本期 fix 后的现实）

| 维度 | 现状 |
|---|---|
| `title / description / content` | ✅ 5 语言齐全，`Record<string, string>` 类型 |
| `tags / categories` 顶层 | ⚠️ 单字符串数组，5 语言共用同一份（en 版"AI Daily"），不分 locale。前端当前用 `report.tags` 渲染 |
| `source.aggregator / aggregator_url` | ⚠️ 单层对象，5 语言共用 |
| `source.original.name` | ✅ 5 语言按 locale 分桶（`Record<locale, string>`） |
| ~~`source.original.url`~~ | ✅ **已移除**——QR 图取代链接 Badge |
| `author` | ⚠️ 单字符串（用 zh-Hans 的"比特财商"），不渲染 |
| HN 标题快照 | ✅ 随 md 翻译，curl 抓取的 URL 不变 |

**如要严格把 tags/categories/source.aggregator 也按 locale 分桶**，需要扩展 `AIDailyMeta` 类型 + 改造 build 脚本 + 调整 `AIDailyIndex.tsx` 的取数逻辑（单独排期）。

---

## 改动历史

- **2026-08-26** — 原文出处改 QR 图片：删除 24 个 md 的 `source.original.url`；`<Badge>` 改 `<picture>` 渲染 webp + png；新增 `aiDaily.originalHint` / `originalCaption` i18n × 5 locale；index.html 加 preload；SOP 更新
- **2026-08-20** — 首次补全 5 语言：4 份 md + build 脚本修复（`normalizeLocalized(value, locale)` + `file.locale` 字段）+ 5 个 meta/data json + 全链路 build + 浏览器实测
