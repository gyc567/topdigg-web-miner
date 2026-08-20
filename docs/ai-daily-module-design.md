# AI日报模块设计方案

> 版本：v1.1
> 日期：2026-08-20
> 状态：方案审计完成，已优化

---

## 审计意见（v1.1）

### ✅ 方案优点

1. **复用现有架构** — 与 BlogDataSource 模式完全对齐，研发成本低
2. **目录结构清晰** — `content/ai-daily/` 与 `content/blog/` 并列，边界明确
3. **单日多篇过滤逻辑合理** — 保持期刊感，减少用户认知负担
4. **i18n 考虑周全** — 5语言支持，LocalizedText 类型定义正确
5. **SEO 有 Article schema** — 结构化数据完备
6. **幂等设计** — 重复执行不破坏，已有当日文件跳过

### ⚠️ 问题与优化

#### 1. frontmatter 的 title 混用了"AI日报｜"前缀

`title: "AI日报｜OpenAI暂停RL训练..."` — 这会导致多语言切换时标题仍显示中文"AI日报"字样。

**优化方案**：标题语义化，去掉语言相关前缀：

```yaml
title:
  zh-Hans: "OpenAI暂停RL训练、Anthropic冲刺IPO、具身智能大爆发"
  en: "OpenAI Pauses RL Training, Anthropic Eyes IPO, Embodied AI Surges"
  # frontmatter 作为 zh-Hans fallback
```

前端渲染时在 `AIDailyIndex` 和 `AIDailyPost` 页面标题区统一加上 `AI日报 ·` 前缀（从 i18n 文案取），这样各语言版本显示正常。

#### 2. 多语言 Markdown 文件缺失策略

`content/ai-daily/zh-Hans/2026-08-20-ai-daily.md` 只写了中文内容，`generate-ai-daily-data.mjs` 的 `title` / `description` 是 `{ "zh-Hans": "...", "en": "..." }` 结构——这意味着要么需要人工维护多语言版本，要么脚本需要自动翻译。

**优化方案**：明确多语言处理策略：

| 策略 | 适用场景 | 实现方式 |
|------|----------|----------|
| 机器翻译 | 初期，快速上线 | 调用 MiniMax API 翻译 title/description，content 保持中文 |
| 纯中文 | 初期不考虑出海 | zh-Hans 有内容，其余语言 fallback 到 zh-Hans |
| 人工维护 | 正式运营 | 各语言独立 Markdown 文件，脚本合并 |

建议初期用 **纯中文 + 机器翻译 title/description**，content 保持中文原文不做翻译（内容太长，成本高）。

#### 3. `source` 字段描述不准确

frontmatter 示例中 `source` 写的是比特财商微信公众号——这是**内容聚合来源**（机器之心 RSS），不是原文出处。日报文章本身也应该有原文链接。

**优化方案**：区分 `aggregator`（聚合来源）和 `source`（原文出处）：

```yaml
source:
  aggregator: "机器之心"
  aggregator_url: "https://rsshub.app/jiqizhixin/comics"
  original:
    name: "比特财商"
    url: "https://mp.weixin.qq.com/s/xxxxx"
```

#### 4. `AIDailyDataSource` 命名与现有风格不一致

现有 `BlogDataSource` 中"Post"是中心词（`getPostBySlug`），日报用 `Report`（`getReportBySlug`）逻辑没问题，但命名语义要统一。建议统一用 `AIDailyItem` / `getAIDailyBySlug` 等，明确叫 **item** 而非 post/report 混淆。

#### 5. Cron 失败告警缺失

方案提到"依赖 OpenClaw 的 failureAlert 机制"，但没有显式配置。应该显式声明：

```json
"failureAlert": {
  "channel": "feishu",
  "message": "AI日报生成失败，请检查信源和生成脚本"
}
```

#### 6. Build 脚本与博客脚本完全独立有冗余

未来合并时会有迁移成本。建议在文档中明确写明 **合流时间点**（例如 v2.0），并约定合并原则：共享 `lib/parse-frontmatter.mjs` 工具函数，分离 `generate-blog-data.mjs` 和 `generate-ai-daily-data.mjs` 但保持输出结构一致。

#### 7. 加载更多是伪代码，无分页策略

"每次加载10条"是前端行为，但如果 JSON 一次加载全部（2-5MB），首屏依然会慢。建议：

- `public/ai-daily-meta-{locale}.json` 按日期倒序，只保留最近30条（节省体积）
- 详情页跳转时不走全量 `ai-daily-data.json`，走 slug 直接定位
- 归档页（旧数据）单独提供 `/ai-daily/archive` 或按年/月分页

#### 8. 缺少降级方案

"机器之心 RSS 不可用"是高频风险。建议：

- 配置 2-3 个备用 RSS 源（Hacker News / arXiv cs.AI / Twitter AI 账号列表）
- 降级时发送通知，附带手动触发链接

### 📋 审计后的文件变更补充

| 操作 | 文件路径 | 说明 |
|------|----------|------|
| 修改 | `content/ai-daily/zh-Hans/YYYY-MM-DD-ai-daily.md` | frontmatter 去掉 title 前缀，增加 aggregator/original 分离 |
| 新增 | `scripts/utils/translate.mjs` | MiniMax 翻译工具（生成阶段用） |
| 新增 | `src/lib/parse-frontmatter.ts` | frontmatter 解析共享工具，blog/ai-daily 共用 |
| 新增 | `public/ai-daily-meta-{locale}.json` | **仅含最近30条**，减少首屏体积 |
| 新增 | `src/pages/AIDailyArchive.tsx` | 历史归档页（按月翻页） |
| 修改 | cron 任务 | 增加 `failureAlert` 配置 + 备用源降级逻辑 |

---

## 一、项目背景与目标

### 1.1 背景

TopDigg（topdigg.com）是一个AI/科技内容聚合站，目前主要内容模块包括：
- **博客**（/blog）— 深度解析文章，单篇独立，按标签/分类组织
- **Twitter分析**（/twitter）— 账号分析报告
- **专栏**（/columns/*）— Reddit/YouTube/Twitter社区导航

现有内容来源以手动触发为主，缺乏**每日自动化的行业资讯聚合能力**。

### 1.2 目标

在首页导航栏新增一个 **AI日报** 模块（与博客平级），实现：
1. 每日北京时间8点自动抓取优质AI资讯来源，生成日报文章
2. 用户访问 `/ai-daily` 可浏览每日日报时间线
3. 点击日报进入详情页阅读完整内容
4. 支持多语言（zh-Hans / zh-Hant / en / ja / vi）
5. 支持未来扩展更多来源（多源聚合）

---

## 二、现状分析

### 2.1 现有技术架构

**内容管理**：
- 博客文章存储于 `content/blog/{locale}/`（Markdown格式）
- Build时由 `scripts/generate-blog-data.mjs` 扫描所有Markdown，提取frontmatter生成JSON元数据
- 产出的JSON文件在 `public/` 目录，供前端 `BlogDataSource` 懒加载

**数据加载层**：
```
BlogDataSource（src/lib/blog-data.ts）
  ├── getPosts()              → 同步，返回所有文章元数据（全语言）
  ├── getPostsLocalized(locale) → 异步，按locale加载对应JSON（~80KB）
  ├── getPostBySlug(slug)     → 同步，全语言元数据中查找
  └── getPostWithContent(slug) → 异步，加载全量内容（9.9MB，按需）
```

**导航系统**：
- 导航配置在 `src/config/site.ts` → `siteConfig.nav.main`（数组）
- 路由在 `src/App.tsx` 注册

**构建流程**：
```
Markdown文件 → generate-blog-data.mjs → JSON元数据 → Vercel静态托管 → 前端加载
```

### 2.2 关键文件清单

| 文件 | 作用 |
|------|------|
| `src/config/site.ts` | 导航配置、全站静态数据 |
| `src/App.tsx` | React Router路由注册 |
| `src/lib/blog-data.ts` | 博客数据加载类 |
| `src/pages/BlogIndex.tsx` | 博客列表页 |
| `src/pages/BlogPost.tsx` | 博客详情页 |
| `scripts/generate-blog-data.mjs` | Build脚本，扫描Markdown生成JSON |
| `public/blog-meta*.json` | Build产出的博客元数据 |
| `public/blog-data.json` | Build产出的博客全量内容 |
| `src/locales/{locale}/*.json` | 国际化文案 |
| `src/components/layout/SiteHeader.tsx` | 顶部导航组件 |

---

## 三、内容管理方案

### 3.1 目录结构

新增 `content/ai-daily/` 目录，与现有 `content/blog/` 并列：

```
content/
  ai-daily/
    zh-Hans/
      2026-08-20-ai-daily.md
      2026-08-19-ai-daily.md
      ...
    zh-Hant/
    en/
    ja/
    vi/
  blog/
    zh-Hans/
    ...
```

### 3.2 Markdown frontmatter 格式

```yaml
---
title:
  zh-Hans: "OpenAI暂停RL训练、Anthropic冲刺IPO、具身智能大爆发"
  en: "OpenAI Pauses RL Training, Anthropic Eyes IPO, Embodied AI Surges"
date: "2026-08-20"
description:
  zh-Hans: "每日AI行业资讯精选，涵盖模型发布、具身智能、学术进展、行业动态。"
  en: "Daily AI industry news highlights, covering model releases, embodied AI, research progress, and industry updates."
tags:
  - AI日报
  - OpenAI
  - Anthropic
  - 具身智能
categories:
  - AI日报
source:
  aggregator: "机器之心"
  aggregator_url: "https://rsshub.app/jiqizhixin/comics"
  original:
    name: "比特财商"
    url: "https://mp.weixin.qq.com/s/xxxxx"
---
```

> ⚠️ **注意**：`title` 和 `description` 在 frontmatter 中直接写单语言字符串（作为 zh-Hans fallback），
> `generate-ai-daily-data.mjs` 执行时会扩展为完整 `LocalizedText` 结构并翻译其他语言。

### 3.3 单日多篇处理规则

**规则：同一自然日只保留一篇（最新的一篇）**

在 `AIDailyDataSource.getReportsLocalized()` 的数据加载时做过滤：

```typescript
// 伪代码示意
async getReportsLocalized(locale: SupportedLocale): Promise<AIDailyMeta[]> {
  const allReports = await loadMetaFromJSON(locale);
  // 按日期分组，每日期刊只保留最新一篇
  const byDate = new Map<string, AIDailyMeta>();
  for (const report of allReports) {
    const existing = byDate.get(report.date);
    if (!existing || report.slug > existing.slug) {
      byDate.set(report.date, report);
    }
  }
  return [...byDate.values()].sort((a, b) => b.date.localeCompare(a.date));
}
```

这样设计的好处：
- 用户看到的是"每日精华"，无信息冗余
- 多源时依然保持"一天一篇"的期刊感
- 未来如果需要查看历史全部文章，可以单独提供归档页

---

## 四、数据层方案

### 4.1 类型定义

```typescript
// src/lib/ai-daily-data.ts

export type AIDailySource = {
  aggregator: string;
  aggregator_url?: string;
  original: {
    name: string;
    url?: string;
  };
};

export type AIDailyMeta = {
  slug: string;
  title: LocalizedText;
  description: LocalizedText;
  date: string;          // ISO date: "2026-08-20"
  author: string;
  tags: string[];
  categories: string[];
  source: AIDailySource;
};

export type AIDailyPost = AIDailyMeta & {
  content: LocalizedText;   // Markdown内容
};
```

### 4.2 AIDailyDataSource 类

```typescript
// src/lib/ai-daily-data.ts

export class AIDailyDataSource {
  private static _instance: AIDailyDataSource;

  // 单日多篇过滤后的缓存（按locale）
  private _cache: Map<SupportedLocale, AIDailyMeta[]>;

  static getInstance(): AIDailyDataSource;

  /** 返回过滤后的日报列表（同日期刊只保留最新一篇），按日期倒序 */
  async getReportsLocalized(locale: SupportedLocale): Promise<AIDailyMeta[]>;

  /** 同步返回所有文章元数据（全语言，用于slug查找） */
  getReports(): AIDailyMeta[];

  /** 按slug查元数据 */
  getReportBySlug(slug: string): AIDailyMeta | undefined;

  /** 懒加载全量内容（含Markdown） */
  async getReportWithContent(slug: string): Promise<AIDailyPost | undefined>;
}
```

设计原则：
- 模式与 `BlogDataSource` 完全一致，降低学习成本
- `getReportsLocalized()` 内部做单日多篇过滤，对上层透明
- 使用 `Map<SupportedLocale, AIDailyMeta[]>` 做实例级缓存

### 4.3 JSON文件产出

Build脚本扫描 `content/ai-daily/` 目录后，产出的JSON文件：

| 文件 | 内容 | 大小估算 |
|------|------|----------|
| `public/ai-daily-meta.json` | 全语言汇总元数据 | ~50KB |
| `public/ai-daily-meta-zh-Hans.json` | 中文元数据 | ~10KB |
| `public/ai-daily-meta-zh-Hant.json` | 繁体元数据 | ~10KB |
| `public/ai-daily-meta-en.json` | 英文元数据 | ~10KB |
| `public/ai-daily-meta-ja.json` | 日文元数据 | ~10KB |
| `public/ai-daily-meta-vi.json` | 越南文元数据 | ~10KB |
| `public/ai-daily-data.json` | 全量内容（含Markdown） | ~2-5MB |

---

## 五、路由与导航方案

### 5.1 导航配置

在 `src/config/site.ts` → `siteConfig.nav.main` 中新增一项：

```typescript
{
  label: {
    "zh-Hans": "AI日报",
    "zh-Hant": "AI日報",
    "en": "AI Daily",
    "ja": "AIデイリー",
    "vi": "AI Hàng Ngày"
  },
  href: "/ai-daily"
}
```

**菜单位置**：在"博客"之后、"Reddit专栏"之前。

完整主导航顺序：
```
博客 → AI日报 → Reddit专栏 → YouTube专栏 → Twitter专栏 → Twitter分析 → 外链导航 → 关于我们 → 联系
```

### 5.2 路由注册

```typescript
// src/App.tsx
const AIDailyIndex = lazy(() => import("./pages/AIDailyIndex"));
const AIDailyPost = lazy(() => import("./pages/AIDailyPost"));

// 在 <Routes> 中：
<Route path="/ai-daily" element={<AIDailyIndex />} />
<Route path="/ai-daily/:slug" element={<AIDailyPost />} />
```

---

## 六、页面设计方案

### 6.1 列表页：`/ai-daily` — 时间线视图

**设计目标**：营造"每日期刊"的阅读节奏感，用户按日期自上而下浏览。

**布局**：

```
┌──────────────────────────────────────────────────────┐
│  AI 日报                                              │
│  每日精选AI行业资讯，源自优质信源                           │
├──────────────────────────────────────────────────────┤
│                                                      │
│  ● 2026年8月20日                                     │
│  ┄━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━   │
│  │ 📰 TrueForge深度解析：开源Agent Harness如何...  │  ← 卡片
│  │    来源：比特财商  ·  OpenAI / Anthropic / AI    │
│  │    [阅读全文 →]                                   │
│  └────────────────────────────────────────────────┘  │
│                                                      │
│  ● 2026年8月19日                                     │
│  ┄━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━   │
│  │ 📰 OpenAI GPT-5新进展：多模态能力大幅提升...     │  ← 卡片
│  │    来源：比特财商  ·  GPT-5 / 多模态              │
│  │    [阅读全文 →]                                   │
│  └────────────────────────────────────────────────┘  │
│                                                      │
│  ● 2026年8月18日                                     │
│  ...                                                │
│                                                      │
│  [加载更多]                                          │
└──────────────────────────────────────────────────────┘
```

**UI细节**：
- 日期作为时间线节点，用圆点 ● 标记
- 水平线连接同一日期内的所有文章（同日期多篇时并排）
- 每张卡片包含：标题、来源标签（可点击跳转）、标签、阅读全文链接
- 底部"加载更多"按钮（非分页），每次加载10条
- 移动端：日期分组可折叠

**来源标签设计**：
- 格式：`来源：比特财商`（比特财商带链接）
- 来源badge样式与标签badge区分开来

**筛选能力**（预留）：
- 按来源（source）筛选（下拉选择器）
- 按标签（tag）筛选
- 按日期范围筛选

### 6.2 详情页：`/ai-daily/:slug`

复用现有 `BlogPost` 组件逻辑，做以下调整：

| 调整项 | 说明 |
|--------|------|
| 移除分类筛选器 | 日报只有一个固定分类 |
| 增加来源显示 | 在文章头部显示 source 信息 |
| 移除相关文章推荐 | 日报不需要博客式的"相关阅读"模块 |
| SEO Article结构 | 使用 Article schema（见第七章） |

**详情页头部结构**：
```
┌─────────────────────────────────────────────────────┐
│  AI日报 · 2026年8月20日                              │
│  来源：比特财商                                      │
├─────────────────────────────────────────────────────┤
│  TrueForge深度解析：开源Agent Harness如何...         │
│  每日精选AI行业资讯，涵盖模型发布、具身智能...         │
│  标签：AI Agent  |  开源  |  Claude                  │
├─────────────────────────────────────────────────────┤
│  [文章正文内容...]                                   │
└─────────────────────────────────────────────────────┘
```

---

## 七、国际化（i18n）方案

### 7.1 导航文案

导航标签已在 `siteConfig.nav.main` 的 `LocalizedText` 中定义，无需额外配置。

### 7.2 页面文案

在 `src/locales/{locale}/` 目录下的JSON文件中增加 `aiDaily` 命名空间：

```json
// zh-Hans.json
{
  "aiDaily": {
    "indexTitle": "AI日报",
    "indexDesc": "每日精选AI行业资讯，源自优质信源",
    "source": "来源",
    "readMore": "阅读全文",
    "loadMore": "加载更多",
    "noReports": "暂无日报内容",
    "noReportsHint": "日报将在每天8点自动更新，请稍后再来",
    "resultsCount": "共 {{count}} 期"
  }
}
```

```json
// en.json
{
  "aiDaily": {
    "indexTitle": "AI Daily",
    "indexDesc": "Curated AI industry news daily, sourced from quality outlets",
    "source": "Source",
    "readMore": "Read more",
    "loadMore": "Load more",
    "noReports": "No daily reports available",
    "noReportsHint": "Daily reports are auto-generated at 8AM Beijing time",
    "resultsCount": "{{count}} editions"
  }
}
```

其余语言（zh-Hant / ja / vi）同理。

---

## 八、SEO方案

### 8.1 列表页 SEO

```typescript
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: `${siteConfig.siteName} AI日报`,
  description: "每日精选AI行业资讯，源自优质信源",
  url: `${siteConfig.baseUrl}/ai-daily`,
};
```

### 8.2 详情页 SEO

```typescript
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: post.title[currentLocale],
  description: post.description[currentLocale],
  datePublished: post.date,
  author: { "@type": "Person", name: post.author },
  publisher: { "@type": "Organization", name: siteConfig.siteName },
  isBasedOn: {
    "@type": "CreativeWork",
    name: post.source.original.name,
    url: post.source.original.url,
  },
  supplier: {
    "@type": "Organization",
    name: post.source.aggregator,
    url: post.source.aggregator_url,
  },
};
```

---

## 九、自动化发布方案（Cron）

### 9.1 触发机制

利用 OpenClaw 内置 cron 系统，每天 **北京时间8:00** 自动执行：

```
cron表达式：0 8 * * * （Asia/Shanghai时区）
```

### 9.2 执行流程

```
T=08:00  cron触发
  │
  ▼
[Step 1] 抓取信源
  - 访问机器之心RSS / 官方信源
  - 或调用已有内容工厂Skill获取当日AI日报内容
  │
  ▼
[Step 2] 生成Markdown
  - 按 ai-daily frontmatter格式写入
  - 文件名：content/ai-daily/zh-Hans/YYYY-MM-DD-ai-daily.md
  - 如当日已存在则跳过（幂等）
  │
  ▼
[Step 3] Git提交
  - git add content/ai-daily/
  - git commit -m "feat: AI日报 $(date +%Y-%m-%d)"
  - git push
  │
  ▼
[Step 4] Vercel自动构建
  - GitHub webhook触发Vercel构建
  - generate-ai-daily-data.mjs 执行JSON生成
  - 静态站点更新，约1-2分钟上线
```

### 9.3 幂等保证

生成脚本在执行前先检查当日文件是否已存在：

```bash
if [ -f "content/ai-daily/zh-Hans/$(date +%Y-%m-%d)-ai-daily.md" ]; then
  echo "今日日报已存在，跳过生成"
  exit 0
fi
```

### 9.4 Cron任务配置

```json
{
  "name": "AI日报自动生成",
  "schedule": {
    "kind": "cron",
    "expr": "0 8 * * *",
    "tz": "Asia/Shanghai"
  },
  "payload": {
    "kind": "agentTurn",
    "message": "请执行以下任务：\n1. 抓取当日AI资讯（机器之心或其他配置的信源）\n2. 生成AI日报Markdown文章，保存到 content/ai-daily/zh-Hans/YYYY-MM-DD-ai-daily.md\n3. frontmatter包含：title/date/description/tags/categories/source\n4. 如果当日文章已存在则跳过\n5. 执行 git add + commit + push"
  },
  "delivery": {
    "mode": "announce",
    "channel": "feishu"
  }
}
```

---

## 十、Build脚本扩展方案

### 10.1 修改策略

现有 `scripts/generate-blog-data.mjs` 保持不变（解耦），新建 `scripts/generate-ai-daily-data.mjs`。

未来可以合并为一个 `scripts/generate-all-data.mjs`，但初期保持独立更安全。

### 10.2 脚本逻辑

```javascript
// scripts/generate-ai-daily-data.mjs

// 1. 扫描 content/ai-daily/zh-Hans/*.md
// 2. 解析每篇Markdown的frontmatter
// 3. 提取 title/date/description/tags/source（按locale分组）
// 4. 生成 public/ai-daily-meta-zh-Hans.json 等per-locale文件
// 5. 生成 public/ai-daily-meta.json（全语言汇总）
// 6. 生成 public/ai-daily-data.json（全量内容，含Markdown）
```

### 10.3 JSON格式

```json
// public/ai-daily-meta-zh-Hans.json
{
  "reports": [
    {
      "slug": "2026-08-20-ai-daily",
      "title": { "zh-Hans": "...", "en": "...", "zh-Hant": "...", "ja": "...", "vi": "..." },
      "description": { "zh-Hans": "...", "en": "...", "zh-Hant": "...", "ja": "...", "vi": "..." },
      "date": "2026-08-20",
      "author": "比特财商",
      "tags": ["AI日报", "OpenAI", "Anthropic"],
      "categories": ["AI日报"],
      "source": {
        "aggregator": "机器之心",
        "aggregator_url": "https://rsshub.app/jiqizhixin/comics",
        "original": { "name": "比特财商", "url": "https://mp.weixin.qq.com/s/xxxx" }
      }
    }
  ]
}
```

---

## 十一、文件变更清单

| 操作 | 文件路径 | 说明 |
|------|----------|------|
| 新增 | `src/pages/AIDailyIndex.tsx` | 日报列表页，时间线视图 |
| 新增 | `src/pages/AIDailyPost.tsx` | 日报详情页 |
| 新增 | `src/lib/ai-daily-data.ts` | 数据加载层类 |
| 新增 | `scripts/generate-ai-daily-data.mjs` | Build脚本，扫描Markdown生成JSON |
| 新增 | `public/ai-daily-meta*.json` | Build产出（自动生成） |
| 新增 | `public/ai-daily-data.json` | Build产出（自动生成） |
| 新增 | `content/ai-daily/zh-Hans/` | 日报文章Markdown存储目录 |
| 修改 | `src/config/site.ts` | nav.main数组新增AI日报菜单项 |
| 修改 | `src/App.tsx` | 注册 /ai-daily 和 /ai-daily/:slug 路由 |
| 修改 | `src/locales/zh-Hans.json` | 新增 aiDaily.* 文案 |
| 修改 | `src/locales/zh-Hant.json` | 新增 aiDaily.* 文案 |
| 修改 | `src/locales/en.json` | 新增 aiDaily.* 文案 |
| 修改 | `src/locales/ja.json` | 新增 aiDaily.* 文案 |
| 修改 | `src/locales/vi.json` | 新增 aiDaily.* 文案 |
| 修改 | OpenClaw cron | 新增每日8:00 AI日报生成任务 |

---

## 十二、依赖与约束

### 12.1 约束

- **现有架构不破坏**：所有修改都是增量添加，不修改已有的Blog和Twitter模块
- **Build流程兼容**：Vercel现有构建流程不变，新增脚本独立运行
- **静态站点**：前端纯静态渲染，无后端API依赖
- **多语言**：复用现有的i18n框架，不引入新方案

### 12.2 外部依赖

| 依赖 | 用途 |
|------|------|
| OpenClaw cron | 每日8点自动化触发 |
| Vercel | 静态站点托管 + GitHub集成构建 |
| 机器之心RSS/API | 日报内容来源（初期） |
| GitHub | 代码托管 + Vercel webhook |

---

## 风险与备选方案

| 风险 | 概率 | 影响 | 备选方案 |
|------|------|------|----------|
| RSS源变更/不可用 | 中 | 高 | 配置 2-3 个备用源（Hacker News / arXiv cs.AI / Twitter AI 账号列表）；降级时发送通知，附带手动触发链接 |
| 单日多篇过滤逻辑丢失 | 低 | 中 | 单元测试覆盖过滤逻辑 |
| Build JSON 超出 Vercel 限制 | 低 | 低 | per-locale JSON 仅保留最近30条，归档页独立加载历史数据 |
| Cron 任务失败未通知 | 中 | 中 | 显式配置 `failureAlert`，发送到 feishu |
| 机器翻译 API 失败 | 低 | 低 | title/description 回退到仅 zh-Hans，en 等语言 fallback 到 zh-Hans |

---

## 里程碑

| 阶段 | 内容 | 产出 |
|------|------|------|
| Phase 0 | 审计方案 | ✅ 本文档（v1.1，审计完成） |
| Phase 1 | 基础设施 | 路由、导航、i18n、数据层 |
| Phase 2 | 前端页面 | AIDailyIndex + AIDailyPost + AIDailyArchive |
| Phase 3 | Build脚本 | generate-ai-daily-data.mjs + translate.mjs 工具 |
| Phase 4 | 自动化 | Cron任务配置 + failureAlert + 备用源降级 |
| Phase 5 | 验收 | 手动触发一次完整流程验证 |
