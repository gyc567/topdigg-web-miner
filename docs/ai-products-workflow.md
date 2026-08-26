# AI产品分析 多语言工作流

AI产品分析模块（`/ai-products`）的多语言内容生产、构建、验证标准流程。新增一篇产品分析，按本文件执行可保证 5 语言齐全 + frontmatter 数据一致。

---

## 数据布局

```
content/ai-products/
├── zh-Hans/2026-08-26-product-slug.md   ← 主稿（人工写）
├── zh-Hant/2026-08-26-product-slug.md
├── en/2026-08-26-product-slug.md
├── ja/2026-08-26-product-slug.md
└── vi/2026-08-26-product-slug.md
```

每份 md 是独立文件，**frontmatter 中 title/description 用字符串**（与 `content/blog/*` 同构），**product/pricing/metrics/sources 跨 5 文件结构完全一致**。slug 必须 5 语言同名同拼写才能聚合。

---

## Frontmatter 模板

```yaml
---
title: "ProductName 深度分析：从 0 到 $X ARR 的变现路径"
description: "ProductName 是 AI 原生 X 赛道的标杆产品。本报告拆解..."
date: "YYYY-MM-DD"
author: "ERIC"
tags: ["AI产品", "AI编程", "变现", "SaaS"]
categories: ["AI产品分析"]
keywords: ["ProductName", "AI工具", "ARR"]
product:                          # 必填：结构化产品数据
  name: "ProductName"             # 品牌名（跨 5 文件不翻译）
  url: "https://product.com"
  category: "AI编程工具"          # 可本地化
  launch_date: "2023-03"          # YYYY-MM 格式
  revenue: "$X ARR (2025)"       # 人读摘要
  users: "1M+ 开发者"
  pricing_model: "免费 + Pro $20/月"
  logo: "/logos/product.svg"      # 可选，缺省时 ProductCard fallback 首字母
pricing:                          # 可选：结构化定价（喂 JSON-LD offers）
  - { plan: "Free",     price: 0,   currency: "USD", period: null }
  - { plan: "Pro",      price: 20,  currency: "USD", period: "month" }
  - { plan: "Business", price: 40,  currency: "USD", period: "month" }
metrics:                          # 可选：数字徽章
  - { name: "ARR",       value: "$X" }
  - { name: "团队规模",   value: "~50 人" }
sources:                          # 必填：数据可验证来源
  - { label: "官网博客",   url: "https://product.com/blog" }
  - { label: "TechCrunch", url: "https://techcrunch.com/..." }
---
```

---

## 边界规则（与博客的关键区别）

> **同一产品可在博客与 AI产品分析 双栖共存**：
> - 博客角度：创始人专访 / 技术解读 / 行业评论
> - AI产品分析角度：MRR 拆解 / 增长策略 / 可复制要素
>
> 当两模块角度不同时互不冲突。**新写的纯产品拆解统一进 AI产品分析**。

**不迁移**：现有博客全部保留，不做强制迁移。

---

## 翻译规范（与博客一致 + AI产品分析 特有约束）

- **品牌名不翻译**：Cursor / Perplexity / ElevenLabs 等所有产品名跨 5 语言保持原文
- **产品分类本地化**：zh-Hans "AI编程工具" / en "AI Coding Tool" / ja "AIプログラミングツール" / vi "Công cụ lập trình AI"
- **货币数字**：保留英文千分位 + 货币代码（`$100M`、`€50K`），不本地化为「100 百万美元」
- **日期**：ISO 格式 `YYYY-MM-DD` 或 `YYYY-MM`，5 文件一致
- **slug**：仅 ASCII 小写字母 + 数字 + 连字符；5 文件同名

### AI产品分析特有约束（与博客不同）

| 字段 | 跨 5 文件要求 | 说明 |
|---|---|---|
| `product.name` | **完全一致** | 品牌名不翻译 |
| `product.url` | **完全一致** | 官方 URL |
| `product.launch_date` | **完全一致** | 数据字段不本地化 |
| `product.revenue` | **完全一致** | 数据字段不本地化（避免 AI 编造） |
| `product.users` | **完全一致** | 同上 |
| `product.pricing_model` | **完全一致** | 同上（结构化定价见 `pricing` 数组） |
| `product.category` | **可本地化** | 分类标签，本地化为各语言习惯说法 |
| `pricing` | **完全一致** | 结构化数组喂 JSON-LD offers schema |
| `metrics` | **完全一致** | 数字徽章数据 |
| `sources` | **完全一致** | 数据可验证来源 |

---

## 数据准确性（防 AI 幻觉）

- **每个数字必填 sources**：revenue / users / launch_date 等字段必须 ≥ 1 个可访问来源链接
- **AI 翻译不编数据字段**：4 语言 AI 出稿时**禁止**改写 `product` / `pricing` / `metrics` / `sources` 字段；只翻译 `title` / `description` / 正文 / `product.category`
- **来源链接真实可访问**：标注的 URL 必须能打开（不用 fake / 测试 URL）
- **估算项标注**：估计而非官方披露的数字必须显式标注「估算」字样，并在正文里说明估算口径
- **构建脚本校验**：缺 `sources` 时 `console.warn` 但不阻断；数据真实性靠 SOP 流程而非脚本硬卡

---

## 新增一篇产品分析 SOP

### 1. 选产品 + 数据收集（人工）

- 选 1 个有公开报道 + 数据可验证的赚钱 AI 产品
- 收集：launch date / pricing 4 档 / funding 轮次 / 公开 ARR / 用户数 / team size
- 标注每个数字的来源 URL

### 2. 写 zh-Hans 主稿

- 文件名 `content/ai-products/zh-Hans/YYYY-MM-DD-product-slug.md`
- 按上面 Frontmatter 模板
- 正文 ~3000-4000 汉字（MRR/收入拆解、产品演进、增长引擎、可复制要素、风险）

### 3. AI 出 4 语言（zh-Hant/en/ja/vi）

向 AI 提供「zh-Hans 原文 + frontmatter 模板」，要求生成 4 份 md。

**AI 必须遵守**：
- frontmatter 中 `title` / `description` / 正文 / `product.category` 可翻译
- `product` 块（除 category 外） / `pricing` / `metrics` / `sources` **禁止修改**
- `slug` 保持文件名（不带 locale 前缀），5 文件同名
- `tags/categories` 翻译，但保持单层数组（`["AI Product"]` 而非 `{en: ...}`）

### 4. 验证

```bash
# 1. 构建产物
npm run build:ai-products
# ✅ 应输出 1 product + 4 类 JSON + per-slug 文件 + 5 per-locale-meta

# 2. 字段一致性（人工/脚本）
# 跨 5 文件比对 product.pricing / product.metrics / product.sources
# 任何字符差异 = 违规，需修复

# 3. 单元测试
npm test
# ✅ 应 106+ 全绿（含 ai-products-data.test.ts 23 用例）

# 4. 浏览器实测（per frontend-优化.md）
node tests/e2e-ai-products.mjs
# ✅ 5 语言 nav 位置 + 列表 + 详情 + 首页卡片

# 5. 完整 build
npm run build
# ✅ 不回归 168 ok + 4 skipped (Twitter 已知问题) + 0 fail
```

### 5. 发布

- commit + push（git commit log 即留档，plan 文件删除）
- 上线后监控：sitemap 含新 URL、GSC 提交索引

---

## 季度数据巡检（每 90 天）

对已发布的产品分析做：
- 检查 revenue / users / 估值等公开数字是否更新
- 若产品融资 / 重大变化，加 footnote 或写 follow-up 分析
- 检查 sources 链接是否失效（curl 200）

---

## 已知约束 / 限制

- **Markdown 分隔符**：正文**禁止**使用 `---`（gray-matter 会误识别为 YAML 边界，导致 body 被截断）。改用 `***` 或不写分隔线。
- **slug 命名**：含日期前缀 `YYYY-MM-DD-` 利于排序；无日期前缀被视为 evergreen（与 blog 模式一致）。
- **多语言 SOP 边界**：4 语言 AI 翻译时若发现数据字段差异，**必须**人工介入修复，不直接覆盖。

---

## 故障排除

| 症状 | 原因 | 修复 |
|---|---|---|
| `npm run build:ai-products` 报 "No AI products found" | content/ai-products/ 为空 | 加至少一篇 md 后再 build |
| 详情页正文只显示部分语言 | markdown `---` 被误识别为 YAML 边界 | 把正文 `---` 改 `***` |
| 列表页只有 0 篇产品 | meta JSON 文件过期 | `npm run build:ai-products` 重新生成 |
| JSON-LD 缺少 Product offers | 该产品 frontmatter 无 `pricing` 数组 | 补 `pricing` 数组或接受无 offers schema |
| 5 文件 product.pricing 字符差异 | AI 翻译时改了 data 字段 | 人工同步：取 zh-Hans 为规范覆盖其他 4 文件 |

---

*最后更新：2026-08-26 — AI产品分析 模块上线后定稿*
