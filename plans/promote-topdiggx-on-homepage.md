# Plan: 首页置顶推广「推文打分器」（TopDiggX @ x.topdigg.com）— v2 Loop Engineering

## Context

- 现有 `topdigg.com` 首页（`src/pages/Index.tsx`）结构：Hero（标题+描述+单 CTA「阅读博客」）→ Twitter 专栏卡（topAccounts 列表）→ 最新博客（2 列网格）→ 最新 AI 产品分析（2 列网格）。
- `x.topdigg.com`（TopDiggX）是一个**独立的 Next.js 应用**（不在本仓库），提供实时在设备上的推文打分能力：280 字输入区 + 25 个信号（Engagement / Curiosity / Dwell / Risk）+ What-if 优化器（图/视频/峰值时段/趋势）+ AI Optimize（按需调用）。多语言 UI（EN/中文）。
- 目标：将 `x.topdigg.com` 以「**推文打分器**」品牌名置顶到 `topdigg.com` 首页，让访客一眼看到、一步点击进入。
- 与现有内容的差异：现首页所有 section 都是「**阅读型内容**」（博客、分析、专栏）；TopDiggX 是**工具**（用户主动创作），需要被推到访客视线最前的位置。

## Loop Engineering 优化（v1 → v2 增量）

| # | 维度 | v1 | v2 |
|---|------|----|----|
| 1 | 视觉差异化 | 同 Hero 风格（`from-accent`） | 鲜明品牌渐变 `from-blue-600 via-indigo-600 to-purple-700` + CSS-only 9-dot 信号网格预览 |
| 2 | LCP 友好 | 默认 | `fetchpriority="high"` 加在主 CTA；零图片；纯 CSS 渐变；系统字体 |
| 3 | 可测量 | 无 | UTM 参数 + GA4 `topdiggx_cta_click` 事件 + `cta_variant` / `language` 维度 |
| 4 | A11y | 基础 | `aria-label` 全上下文 + `ExternalLinkIcon` 视觉标识 + 沿用 focus-visible ring |
| 5 | i18n 一致性 | 嵌套 `home.promo.*` | 改用 flat key（`home.promoTitle / promoDesc / promoPrimaryCta / promoBadge`），与 `home.heroTitle` 一致 |
| 6 | 跨域 SEO | 无 | Index 的 JSON-LD 加一条 `WebApplication` schema 指向 `https://x.topdigg.com/`（轻量） |
| 7 | Hero CTA | 不动 | **保持「阅读博客」**（与推文打分器形成「工具 vs 阅读」互补，不互相稀释） |
| 8 | Twitter 专栏卡 | 保留 | **保留**（语义不冲突：专栏=推荐关注的人，打分器=工具） |
| 9 | SiteHeader.mySites | 加 | 加 `{ label, href, external: true }` |
| 10 | 回滚 | 无 | 单 commit，git revert 即可；无 DB / 无 flag 依赖 |

## Goals

- [ ] G1：首页最显眼位置（Section 0，Hero 之上）出现「推文打分器」入口
- [ ] G2：5 语言全量适配（zh-Hans/zh-Hant/en/ja/vi），i18n-keys.test 通过
- [ ] G3：GA4 事件 `topdiggx_cta_click` 上线 7 天后能在 DebugView 看到（验证埋点连通）
- [ ] G4：`npm run build` 全绿；浏览器实测 desktop 1440 / mobile 375 / tablet 768 无 404 / 无 console error
- [ ] G5：Core Web Vitals 不退化（LCP < 2.5s / CLS < 0.1 / INP < 200ms）
- [ ] G6：WebApplication JSON-LD 出现在首页 `<script type="application/ld+json">`

## 设计稿（v2 文案与视觉）

**Banner 内容布局**（桌面 md+，移动端上下堆叠）：

```
┌─────────────────────────────────────────────────────────────┐
│  [🚀 新工具 / New Tool]                                     │
│                                                              │
│  推文打分器                                                  │
│  25 个信号 × 实时打分，发推前先验一下                          │
│                                                              │
│  [ 立即打分 → ]   [ 了解 25 个信号 ]                          │
│                                                              │
│  x.topdigg.com ↗                              [· · · 信号网格]│
└─────────────────────────────────────────────────────────────┘
```

**视觉规格**：
- 容器：与现有首页一致（`container` 内），但用 `rounded-2xl`
- 背景：`bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700`
- 文字：白色（`text-white`），副标题 `text-white/85`
- 主 CTA：白底蓝字（`bg-white text-blue-700 hover:bg-white/90`），`fetchpriority="high"`
- 次 CTA：透明边框（`border-white/40 text-white hover:bg-white/10`）
- 信号网格：CSS-only 9 个 dot（`grid-cols-3 gap-2`，每点 6×6，渐变 opacity 模拟权重），仅桌面端显示
- 移动端：网格隐藏，CTA 全宽
- Padding：`p-8 md:p-12`

**5 语言文案（flat i18n key）**：

| key | zh-Hans | zh-Hant | en | ja | vi |
|-----|---------|---------|----|----|-----|
| `home.promoBadge` | 🚀 新工具 | 🚀 新工具 | 🚀 New Tool | 🚀 新ツール | 🚀 Công cụ mới |
| `home.promoTitle` | 推文打分器 | 推文打分器 | Tweet Scorer | ツイートスコアラ― | Trình chấm điểm Tweet |
| `home.promoDesc` | 25 个信号 × 实时打分，发推前先验一下 | 25 個信號 × 即時打分，發文前先驗一下 | 25 signals × real-time scoring. Validate before posting. | 25シグナル × リアルタイムスコアリング。投稿前にチェック。 | 25 tín hiệu × chấm điểm thời gian thực. Kiểm tra trước khi đăng. |
| `home.promoPrimaryCta` | 立即打分 → | 立即打分 → | Score now → | 今すぐ採点 → | Chấm điểm ngay → |
| `home.promoSecondaryCta` | 了解 25 个信号 | 了解 25 個信號 | See the 25 signals | 25のシグナルを見る | Xem 25 tín hiệu |

## Tasks

### 实现
- [ ] T1: 新建 `src/components/TopDiggXPromo.tsx`（独立组件，含 i18n hook、desktop/mobile 响应式、信号网格 CSS、fetchpriority 主 CTA、aria-label、ExternalLinkIcon、UTM 参数、GA4 event）
- [ ] T2: `src/pages/Index.tsx` 在 Hero `<section>` 之前插入 `<TopDiggXPromo />`
- [ ] T3: 5 语言 locales 各加 5 个 flat key（`home.promoBadge / promoTitle / promoDesc / promoPrimaryCta / promoSecondaryCta`）— 表格如上
- [ ] T4: `src/locales/i18n-keys.test.ts` 自动校验（已有测试覆盖）
- [ ] T5: `siteConfig.nav.mySites` 增加 `{ label, href: "https://x.topdigg.com/?utm_source=topdigg...", external: true }`
- [ ] T6: Index.tsx 的 SEO `jsonLd` 数组追加 `WebApplication` schema 指向 x.topdigg.com
- [ ] T7: T1 组件内的 GA4 事件：`window.gtag?.('event', 'topdiggx_cta_click', { cta_variant: 'primary' | 'secondary', language })`
- [ ] T8: 视觉验证：与现有 Hero 在桌面 / 移动 / 平板三档对比，确保 banner 视觉上**更突出**（更鲜明颜色 + Badge + 信号网格）
- [ ] T9: 可访问性：颜色对比度 ≥ 4.5、focus-visible ring、aria-label、external link icon
- [ ] T10: 若 x.topdigg.com 无 `#signals` 锚点 → 次 CTA 隐藏（运行时 health check 复杂度高，V1 用静态判断）

### 验证
- [ ] V1: `npm run build` 全绿（build:blog / build:ai-products / build:sitemap / build:llms / build:vite / build:prerender）
- [ ] V2: 浏览器实测：desktop 1440 / mobile 375 / tablet 768，banner 在首屏、无 404、无 console error
- [ ] V3: Lighthouse：LCP / CLS / INP 全部达标
- [ ] V4: 5 语言切换后文案完整、CTA 可点击、信号网格正确显示
- [ ] V5: DevTools GA4 DebugView 验证 `topdiggx_cta_click` 事件触发（含 cta_variant/language 维度）
- [ ] V6: HTML 源码 grep 确认 WebApplication JSON-LD 出现在首页
- [ ] V7: `git commit + push`，PLANS.md 移除本条

## KPI 验收（上线 7 天后）

| 指标 | 目标 | 数据源 |
|------|------|--------|
| Banner 点击数 | ≥ 100（基于现有首页流量基线） | GA4 事件 |
| 点击到跳出率 | x.topdigg.com 落地 ≤ 70% | GA4 |
| 5 语言点击分布 | zh-Hans + en 合计 ≥ 70% | GA4 维度 `language` |

## North Star 影响

- 博客内容完整性 — 不变
- SEO 收录覆盖 — +1 首页新增可索引入口 + WebApplication schema
- 页面性能 — 目标持平或更优（纯 CSS 渐变 + 零图片）
- 构建健康 — 必须保持全绿
- 前端交互质量 — 首页 5 语言实测无报错

## Risks & Mitigations

| Risk | Mitigation |
|------|-----------|
| Banner 在 Hero 之上 → 新 LCP 元素 | 纯 CSS 渐变 + 系统字体 + `fetchpriority="high"` + 零图片；Hero 退为 2nd LCP |
| 与 Hero 视觉冲突 | 用 `from-blue-600 via-indigo-600 to-purple-700` 鲜明品牌色，与 Hero 的 `from-accent` 软色明显区分 |
| x.topdigg.com 跨域 cookie / session 污染 | `target="_blank" rel="noopener noreferrer"` 标配；不内嵌 iframe |
| GA4 埋点阻塞首屏 | 事件绑在 `onClick`，不影响初次渲染；不引第三方 SDK |
| 5 语言翻译缺失导致 i18n test 挂 | 沿用 `i18n-keys.test.ts` 自动校验；先英文主稿、再译 4 语言 |
| x.topdigg.com `#signals` 锚点不存在 | V1 静态判断（dev 阶段手动验证）；未来加 health check |
| KPI 不达预期 | 7 天后看数据；CTR 低则改 CTA 文案 / 位置 / 颜色 A/B |

