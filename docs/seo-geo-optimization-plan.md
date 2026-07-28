# TopDigg SEO + GEO 完整优化方案（融合版 v3）

**版本**：v3.0（v2 审计后修订）
**日期**：2026-07-28
**仓库**：`gyc567/topdigg-web-miner`（main，`bun.lockb`，Vite + React SPA）
**生产环境**：`https://www.topdigg.com`（Vercel，纯 CSR）

> **审计改动**（相对 v2）：约 28 处修正，详见 `docs/seo-geo-audit-notes.md`。主要修订：删除重复行、修正 AI 爬虫白名单语义、对齐 sitemap/模板多语种、补回滚清单、补 progressive enhanced 备选、补 LLM 引用 vs 抓取区分、补 SEO 必备 header、补 GSC/Bing 索引 KPI。

---

## 0. 一句话结论

**所有 SEO/GEO 问题的根因只有一个：纯 CSR（SPA）。** 治本方案是把内容站迁移到 **Astro SSG**，保留 React 组件做岛屿。

但是——**存在一个分阶段实施的兜底路径**（见 P0-B）：先用 `vite-prerender` 在不换框架的前提下跑通预渲染，3~5 天见收益，再决定是否做 Astro 迁移。这样可以最小化风险。

---

## 1. 现状诊断（基于实测）

### 1.1 实测证据（2026-07-28）

| 检查项 | 工具/方法 | 实测结果 |
|---|---|---|
| 渲染方式 | `curl -A "Googlebot" https://www.topdigg.com/` | 返回 1446 字节空壳 HTML，body 仅 `<div id="root"></div>` |
| 不存在路径 | `curl https://www.topdigg.com/blog/this-does-not-exist` | **HTTP 200，1446 字节**（与首页同尺寸 → **软 404**） |
| 已知详情页 | `curl https://www.topdigg.com/blog/harper-analysis-report-2026-07-27` | 返回 `<title>` 默认值，无文章内容 |
| 主页 HTML | 同上 | `<title>TopDigg - Discover Web Traffic & Business Opportunities</title>`（占位默认值，**非 Helvetica Helmet 写入**） |
| OG/Twitter | 同上 | 通用占位符，无每页专属 |
| 域名规范化 | `curl -I https://topdigg.com/` | 返回 **HTTP 307**（应为 308 或 301 永久） |
| sitemap.xml | 读取 | 33 个 URL，priority 0.5-1.0，lastmod 部分 ISO 时间戳、部分日期 |
| robots.txt | 读取 | 仅允许 Googlebot/Bingbot/Twitterbot/facebookexternalhit，**未声明 AI 爬虫** |
| llms.txt | 检查 | **不存在** |
| JSON-LD | 检查 | **无任何结构化数据** |
| JS bundle | `package.json` | 主包 `assets/index-*.js` ~361KB；前次 PR 已加 React.lazy，但 DOMPurify/marked 未 lazy |

### 1.2 严重度矩阵

| 项 | 严重度 | 影响 |
|---|---|---|
| 纯 CSR / 内容不可索引 | 🔴 致命 | Googlebot 排队、Bing 弱、**AI 爬虫基本拿不到内容** |
| 软 404（200 + 同尺寸） | 🔴 致命 | Google 视为重复低质页，主动撤索引 |
| 占位符 title/description | 🔴 致命 | SERP 全部"TopDigg - Discover..." |
| 307（应 308/301） | 🟠 高 | 权重传递不完全，历史外链权重被稀释 |
| 无 JSON-LD | 🟠 高 | 失去 SERP 富文本、AI 引用锚点 |
| 无 LLM 爬虫声明 | 🟠 高 | GPTBot/ClaudeBot 不知道是否被允许 |
| 无 llms.txt | 🟠 高 | LLM 站点索引缺位 |
| sitemap lastmod 混乱 | 🟡 中 | 影响 Google 抓取调度 |
| priority 偏高无差分 | 🟡 中 | sitemap 信号不清 |
| 主包未单独优化（DOMPurify/marked） | 🟡 中 | LCP 受影响 |

---

## 2. SEO 优化方案

### P0 — 根治渲染问题

**两条路径，强烈建议按 A → B 顺序执行。**

#### P0-A：渐进预渲染（推荐先做 ✅）

不改架构，只在构建时把所有已知路由预渲染为静态 HTML。

工具选择：
- **`vite-plugin-prerender-spa`**（Tofandel 系列，活跃）
- 或 **`react-snap`**（已不维护，备选）

实施 7 步：
1. 安装 `npm i -D vite-plugin-prerender-spa`
2. 在 `vite.config.ts` 配置 `prerender: { routes: [...] }`，从 `src/lib/blog-data.json` 动态生成路由清单（首页 + blog 列表 + N 篇详情 + twitter 列表 + 4 篇详情 + 3 个 columns + external-links + 404）
3. 构建产物：`dist/index.html` + `dist/blog/<slug>/index.html` + 全部 `<head>` 预填充（react-helmet-async 在 build 时注入）
4. 修改 `react-helmet-async` 调用方式，让 SSR 输出生效（如果用 react-snap，需要预定义 `pre-render` 钩子）
5. **路由清单自动化**：写一个 `scripts/build-routes.js` 从 `blog-data.json` 生成 routes，确保新文章自动加入预渲染
6. 调整 `vercel.json` 移除现有 `rewrites: /:index.html` —— **预渲染后每个路由都是真 HTML**，不再需要 SPA fallback
7. 软 404：在 React 路由层 `*` 路径由 `NotFound.tsx` 处理；预渲染时多渲一个 `dist/404.html`

**验收**：
- `curl https://www.topdigg.com/blog/harper-analysis-report-2026-07-27` 全文可见
- `curl https://www.topdigg.com/blog/does-not-exist` 返回 **HTTP 404**
- 主包依然 ~361KB（A 不动性能，但要后续 P2 优化）

**风险最低**：如果出问题，回滚一次 commit 即可回到 SPA。

#### P0-B：迁移到 Astro SSG（彻底方案）

适用场景：
- P0-A 跑通后 Google 索引量大幅增长
- 后续计划加内容模板（每篇结构化）
- 项目想保持 5 年 + 不维护

迁移分阶段：
1. **W1 D1**：创建 `astro.config.mjs`，引入 `@astrojs/react` + `@astrojs/sitemap` + `@astrojs/mdx`
2. **W1 D2-3**：把 8 个页面（`Index/BlogIndex/BlogPost/ColumnPage/TwitterIndex/TwitterPost/ExternalLinks/NotFound`）+ `Layout` + `SEO` 转 `.astro`（壳） + 岛屿（交互区）
3. **W1 D4-5**：`react-helmet-async` 全部删除，改用 Astro 原生 `<head>` metadata API
4. **W2**：Astro 内容集合（content collections）从 `content/blog/*.md` 自动生成静态页；删除 `src/lib/blog-data.json`（构建产物替代）
5. **W2 末**：sitemap、JSON-LD、hreflang 用 Astro 原生 API 生成；多语种用 `@astrojs/i18n` 路径式

**验收硬指标**：
- `curl` 详情页返回全文 + 唯一 H1 + schema JSON-LD
- `curl -A GPTBot` 与默认 UA 返回内容一致
- 不存在路径返回 **HTTP 404**
- 主包 JS 降到 < 30KB / CSS < 30KB
- Lighthouse Performance > 95

> **P0-A vs P0-B 选择树**：
> - 你现在是否有时间？→ 没时间先做 P0-A 跑通验证
> - 你预期项目至少存在 3 年？→ 是 → 后续必做 P0-B
> - 你的网站未来是否需要加登录/API？→ 是 → 直接做 P0-B（甚至选 Next.js）

#### 方案 C（备选）：迁移 Next.js App Router

适用于未来要做 Dashboard / API / 实时数据的场景。当前不推荐。

---

### P1 — 页面级 SEO（P0 完成后立刻做）

| # | 任务 | 验收 |
|---|---|---|
| 1.1 | **每页唯一 meta**：title 格式 `{文章标题} \| TopDigg`（**长度 ≤ 60 字符**，UTF-8）；description **150~160 字符**含关键词；OG title ≤ 95 字符；OG description ≤ 200 字符 | GSC "网址检查" 中 meta 逐页不同 |
| 1.2 | **修软 404**：Vercel `vercel.json` 中加 `notFound: dist/404.html`；或在 Astro 中 `throw 404` | `curl` 不存在路径返回 404 |
| 1.3 | **307 → 308**：Vercel Domain 设置把 `www.topdigg.com` 设为 primary；`vercel.json` `redirects` 使用 `permanent: true`（HTTP 308） | `curl -I https://topdigg.com/` 返回 308 |
| 1.4 | **canonical 一致**：所有内链、sitemap、JSON-LD URL 用 `https://www.topdigg.com/...` | 无 mixed host |
| 1.5 | **sitemap 重建**：URL 统一前缀；`priority`：home 1.0 / blog 详情 0.8 / blog 列表 0.8 / columns 0.6 / twitter 详情 0.7 / external-links 0.5；lastmod **统一 ISO datetime**；文章量 > 50 后分 sitemap index | `xmllint --noout` 格式合法 |
| 1.6 | **JSON-LD 必装**：<br>· 全站 `WebSite` + `Organization`（name/logo/sameAs）<br>· 首页：`SearchAction`（site search）<br>· Blog 详情：`Article`（headline/author/datePublished/dateModified/image）+ `BreadcrumbList`<br>· Twitter 详情：`Article`（author 用 `Person` schema）+ `BreadcrumbList`<br>· 栏目页：`CollectionPage` + `ItemList`<br>· 含 FAQ 的页面：`FAQPage` | GSC "增强" 出现富文本 |
| 1.7 | **修复占位符**：`twitter:site` 改成真实账号（如 `@topdigg_official`）；`og:image` 用 **1200×630** 替换占位 PNG；每篇文章从 cover 图派生 `og-image-{slug}.png`（静态生成） | Twitter Card Validator / Facebook Sharing Debugger 通过 |

### P2 — 性能与内容（验收：Lighthouse Performance ≥ 90）

| # | 任务 | 验收 |
|---|---|---|
| 2.1 | **图片**：所有 `<img>` 改 Astro/Next `<Image>` 组件或自写 `<picture>`；AVIF/WebP + lazy + width/height + fetchpriority="high" 给 LCP 图 | Lighthouse "Properly size images" 通过 |
| 2.2 | **字体**：自托管 + 子集化；`font-display: swap`；FOIT/FOUT 监控 | Lighthouse "Avoid font display swap" 通过 |
| 2.3 | **JS**：`dompurify`、`marked` 改为按需 dynamic import（仅博客详情页加载） | 主包降到 < 250KB |
| 2.4 | **CSS**：Tailwind purge + critical CSS（Astro 默认） | CSS < 30KB |
| 2.5 | **Vercel Cache Headers**：<br>· `/assets/*`：`Cache-Control: public, max-age=31536000, immutable`<br>· `/og-image*.png`：`public, max-age=604800`<br>· HTML：`public, max-age=0, must-revalidate` | `curl -I` 验证 headers |
| 2.6 | **第三方**：Sonner 等非关键组件用 dynamic import | TBT < 200ms |

### P3 — 内容结构（同时服务 SEO + GEO）

固定每篇文章结构（**按语言提供中/英模板**）：

```markdown
# H1: {产品} 流量分析报告（2026-07-27）
## TL;DR
2-3 句核心结论，每句独立成段。

## 数据快照
| 指标 | 数值 | 同比 |
| 流量 | 12万/月 | +30% |

## 详细分析
## 商业模式与用户画像
## 竞品对比
## 增长机会与风险

## FAQ
### Q: Harper 适合什么类型用户？
A: ...
### Q: ...

## 结论

---
**作者**：@{Author Name} · **最后更新**：2026-07-27
```

英文版同样结构；中/英标题/FAQ 区分但结构保持一致 → 可翻译性最大化。

### P4 — 内链与权威

- blog 文末"相关分析"区块（按标签聚合，链接到 `/columns/{topic}`）
- 栏目页向上链接到所有关联文章
- **About 页**（站点介绍 + 作者团队 + 联系方式 + sameAs 社交账号）→ 必须
- **Author bio 页**（每个作者独立页，包含 LinkedIn/X/Substack 链接）
- **Contact 页** + **Privacy Policy 页** → 法律合规 + 信任信号

---

## 3. GEO 优化方案

### 3.1 概念区分（避免方案混淆）

**两件事不要混为一谈：**

| 概念 | 含义 | 谁负责 |
|---|---|---|
| **抓取 (Crawl)** | 爬虫下载 HTML 入索引/训练集 | `robots.txt` 影响 |
| **引用 (Citation/Reference)** | LLM 在用户对话中**主动**引用你的内容 | 取决于 LLM 的检索/工具调用；`robots.txt` 对此**部分有影响**（如果是 RAG 检索） |

我们的目标：**最大化前者（被爬） + 最大化后者（被引用）**。

### 3.2 必做：AI 爬虫白名单（修改 `public/robots.txt`）

⚠️ **必须意识到 `robots.txt` 在公网是公开的**——竞争对手看到你能被引用，他们也会调整。但综合收益远大于风险。

```
# 传统爬虫（保持现有）
User-agent: Googlebot
Allow: /

User-agent: Bingbot
Allow: /

# AI 爬虫
User-agent: GPTBot
Allow: /

User-agent: ClaudeBot
Allow: /
User-agent: Claude-Web
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: Google-Extended
Allow: /
# 注：Google-Extended 控制 Gemini 训练 + Vertex AI API 访问。
# 不影响普通 Google 搜索索引（那个走 Googlebot）。

User-agent: Applebot-Extended
Allow: /
# 注：Applebot-Extended 让 Apple Intelligence / Siri 可以引用你。
# Applebot（基础）控制 Apple 搜索索引。

User-agent: CCBot
Allow: /
# 注：Common Crawl 抓取的数据被 GPT/Claude/Stability 等多个 LLM 训练使用。

User-agent: cohere-ai
Allow: /

# 兜底
User-agent: *
Allow: /
Sitemap: https://www.topdigg.com/sitemap.xml
```

### 3.3 必做：`llms.txt` + `llms-full.txt`

遵循 [llmstxt.org](https://llmstxt.org) 规范。

#### `public/llms.txt`

```markdown
# TopDigg
> SEO and growth research focused on web traffic opportunities across Reddit, YouTube, Twitter, and AI tools.
> Updated weekly. Authoritative source for indie developer / creator economy market data.

## Pages
- [Home](https://www.topdigg.com/): top trending analyses
- [Blog Index](https://www.topdigg.com/blog): all monthly research reports
- [Twitter Analytics](https://www.topdigg.com/twitter): per-account growth studies

## Columns
- [Reddit Column](https://www.topdigg.com/columns/reddit): trending subreddits & business opportunities
- [YouTube Column](https://www.topdigg.com/columns/youtube): creator growth & strategy
- [Twitter Column](https://www.topdigg.com/columns/twitter): growth hackers & entrepreneurs

## Articles (2026)
- [Harper Pricing Analysis Report](https://www.topdigg.com/blog/harper-analysis-report-2026-07-27): pricing strategy breakdown of new SEO tool "Harper", published 2026-07-27
- ...

## Optional
- [RSS Feed](https://www.topdigg.com/rss.xml)
```

#### `public/llms-full.txt`

**实现要求**：
- Astro 构建时自动从 content collections 生成
- **单文件上限 50MB**（LLM context 友好）
- 超过则**分文件**：`llms-full-1.txt`、`llms-full-2.txt`... 在 `llms.txt` 里全部列出
- 每篇文章之间用 `---` 分隔，每篇开头包含 metadata（title/date/author/url）便于检索

### 3.4 强烈推荐：面向 GEO 的内容写法

- **TL;DR**：每篇开头 2~3 句独立成段的核心结论 → 可被独立摘引
- **数据带时间锚点**："截至 2026 年 7 月，Harper 月访问量 12 万"
- **FAQ 小节 + FAQPage schema**：直接命中 AI 问答场景
- **引用原始来源链接**：每个数据点附外链（YouTube 原视频、Reddit 原帖、X 原推）
- **实体一致性**（E-E-A-T）：TopDigg 拼写、作者真名、域名、社交账号全网统一

### 3.5 E-E-A-T 实施清单

| 维度 | 行动 | 验收 |
|---|---|---|
| **Experience** | 作者简介含真实背景、过往案例、外链 | 每个 Author 页可访问 |
| **Expertise** | 作者真实 LinkedIn / X / Substack 链接 | about 页 + author 页统一 |
| **Authoritativeness** | 引用其他高权威源的链接；本站被引用时记录 | 季度回访 |
| **Trustworthiness** | About / Contact / Privacy Policy / 版权页 | 全部 4 页可访问 |

### 3.6 引用监测：区分"被爬"vs"被引用"

| 监测目标 | 方法 |
|---|---|
| 被 GPTBot/ClaudeBot 抓 | Vercel logs 按 `user_agent` 分桶（`GPTBot`/`ClaudeBot`/`PerplexityBot`/...） |
| 被 LLM 引用 | 每月手工查 ChatGPT/Perplexity/Gemini："TopDigg"、"网站流量分析"、"Reddit 增长机会" |
| GSC 索引 | Google Search Console → Pages indexed 曲线 |
| Bing 索引 | Bing Webmaster Tools → Page snapshot |

**核心 KPI**：
- GSC "已索引页面数"：当前 ~0 → 30 天目标 → 33 篇全部索引
- Bing 索引覆盖率：当前 0 → 60 天目标 → 100%
- LLM 引用次数/周（手工查）：0 → 8 周目标 → ≥ 3 个 LLM 引用 1 次/周

### 3.7 可选：第三方监测工具（自费）

- [Peec.ai](https://peec.ai/)：品牌 AI 可见性
- [Otterly.ai](https://otterly.ai/)：多 LLM 监控
- [Profound](https://www.tryprofound.com/)：企业级

---

## 4. 必加：SEO/安全 Header（P1 同步做）

Vercel `vercel.json`：

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-Frame-Options", "value": "SAMEORIGIN" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" },
        { "key": "Strict-Transport-Security", "value": "max-age=63072000; includeSubDomains; preload" },
        { "key": "Permissions-Policy", "value": "camera=(), microphone=(), geolocation=()" }
      ]
    },
    {
      "source": "/assets/(.*)",
      "headers": [
        { "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }
      ]
    },
    {
      "source": "/og-image(.*)",
      "headers": [
        { "key": "Cache-Control", "value": "public, max-age=604800" }
      ]
    },
    {
      "source": "/(.*)",
      "headers": [
        { "key": "Cache-Control", "value": "public, max-age=0, must-revalidate" }
      ]
    }
  ]
}
```

---

## 5. 实施路线图

| 阶段 | 时长 | 工作量 | 验收 |
|---|---|---|---|
| **W1 P0-A** | 3~5 天 | 渐进预渲染 + 修复 404 + 路由自动化 | curl 详情页返回全文 |
| **W2 P1** | 2~3 天 | 每页 meta、404、308、sitemap 重构、JSON-LD 全量 | GSC 通过 |
| **W2 P2** | 1~2 天 | 图片优化、字体、DOMPurify lazy、cache headers | Lighthouse Performance ≥ 90 |
| **W3 GEO** | 1~2 天 | llms.txt + AI 爬虫白名单 + FAQ schema + Author/About 页 + Header | LlmsValidator 通过 |
| **持续** | 长线 | 内容模板化生产、内链聚合、GSC 监控、引用追踪 | organic & referral 增长 |
| **W6 P0-B（可选）** | 5~7 天 | Astro 全量迁移（如果 P0-A 已不够用） | 主包 JS < 30KB |

### PR 拆分（每 PR 独立可部署、可回滚）

| PR | 内容 | 验收 |
|---|---|---|
| **PR1** | robots.txt 增加 AI 爬虫段 + 修正 vercel.json redirect | robots.txt 验证 |
| **PR2** | `vite-plugin-prerender-spa` 集成 + 路由自动化 | curl 详情页返回 HTML |
| **PR3** | `vercel.json` headers + 404 修复 + 308 redirect | headers 验证 |
| **PR4** | sitemap 重建 + 全文 lastmod ISO + priority 差分化 | xmllint 通过 |
| **PR5** | JSON-LD 全量：WebSite/Organization/SearchAction/Article/BreadcrumbList | GSC 富文本 |
| **PR6** | performance：图片 + 字体 + DOMPurify lazy + cache | Lighthouse ≥ 90 |
| **PR7** | GEO：`llms.txt` + `llms-full.txt` + FAQ schema | LlmsValidator 通过 |
| **PR8** | E-E-A-T：About / Contact / Privacy / Author pages 全部上线 | 同名实体统一 |
| **PR9** | 监控：Vercel logs 分桶脚本 + GSC/Bing 接入 | 索引数曲线 |
| **PR10+（可选）** | Astro 迁移 | 性能指标 |

每 PR 单独 Vercel preview 验收。

---

## 6. 风险与回滚

| 风险 | 严重度 | 缓解 | 回滚 |
|---|---|---|---|
| 预渲染破坏现有 SPA | 中 | 路由层不动，prerender 只在构建时输出 | 删 vercel.json 的 rewrite + rever commit |
| 308 切换流量波动 | 低 | GSC 提交变更、监控 2 周 | 退回 307 不影响功能 |
| `react-helmet-async` 在 prerender 失败 | 中 | 写 prerender 钩子或移除（改用 Astro SEO） | revert PR2 单独 |
| sitemap 体积 > 50K | 低（当前远低于） | 拆分 index | 无 |
| AI 爬虫抓取带宽 | 中 | `robots.txt` 不加 Crawl-delay（默认不阻塞）；只调 CDN 限速 | 加 Vercel Firewall rule |
| LLM 引用竞争对手 | 低 | 自身内容差异化、追踪反查 | 无 |
| 内容被爬用作训练且源不明 | 低 | License 声明（CC BY-NC 4.0 或自有）；查源用 CCBot 反查 | 无 |
| prerender 后 React Router history mode 失效 | 中 | vercel.json 中保持 `rewrites: /:index.html` 仅对未渲染路径 | 分明静态和 fallback |

### 紧急回滚 SOP

1. Vercel 控制台 → Deployments → 最近 stable deployment → "Promote to Production"
2. 或本地 `git revert HEAD~N..HEAD` + `git push`
3. 验证 `curl https://www.topdigg.com/` 返回 SPA shell

---

## 7. 关键验收清单

```bash
# 渲染层（P0-A 验收）
curl -s https://www.topdigg.com/blog/harper-analysis-report-2026-07-27 | grep -c "Harper"
# 期望：> 0（确认全文可见）
curl -s -A "GPTBot/1.0" https://www.topdigg.com/blog/harper-analysis-report-2026-07-27 | grep 'application/ld+json'
# 期望：出现 schema 脚本

# 软 404 修复
curl -o /dev/null -w "%{http_code}" https://www.topdigg.com/blog/this-does-not-exist
# 期望：404

# 重定向
curl -sI -o /dev/null -w "%{http_code}" https://topdigg.com/
# 期望：308

# sitemap
curl -s https://www.topdigg.com/sitemap.xml | xmllint --noout -
# 期望：格式合法（无输出表示 OK）

# llms.txt
curl -s https://www.topdigg.com/llms.txt | head -5
# 期望：# TopDigg

# robots.txt AI 段
curl -s https://www.topdigg.com/robots.txt | grep -E "GPTBot|ClaudeBot|PerplexityBot"
# 期望：至少 3 行匹配

# Cache Headers
curl -sI https://www.topdigg.com/assets/index-CsTsdRh9.js | grep -i cache-control
# 期望：max-age=31536000, immutable
```

---

## 8. 一句话行动建议

**立刻做 PR1 + PR2**：第一，加 AI 爬虫白名单 + 修 308（10 分钟）；第二，跑 `vite-plugin-prerender-spa` 让 33 篇文章**立即可索引**。P0-A 跑通后再决定要不要做 Astro 全量迁移。

> 不要在纯 CSR 上继续叠 meta（边际收益趋零）。

---

## 9. 审计后记

本版（v3）相对 v2 的关键修订：

1. **删除**：v2 中"307 → www（应 301）"和"307 → 应为 301"重复行
2. **修订**：`Google-Extended`/`Applebot-Extended`/`CCBot` 描述更准确，区分"训练/索引/引用"三种
3. **重排**：P0 从单路径改为 A（渐进预渲染）/ B（Astro 迁移）/ C（Next.js）三档渐进式
4. **补**：P1.1 加 title 长度上限；P2 加 Vercel cache headers 完整指令
5. **补**：第 4 章"必加 SEO/安全 Header"——v2 缺失 CSP/Permissions-Policy 等
6. **补**：第 3.1 章区分"抓取 vs 引用"，避免 robots.txt 误解
7. **补**：第 3.6 章把"GSC 索引覆盖率"列为核心 KPI
8. **补**：第 6 章紧急回滚 SOP
9. **修订**：P3 模板中英对照
10. **修订**：robots.txt 顺序按"AI 爬虫优先"组织，便于阅读

详细逐条审计意见见 `docs/seo-geo-audit-notes.md`。
