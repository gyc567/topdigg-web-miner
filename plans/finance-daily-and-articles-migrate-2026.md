# Plan: C1 A (财经简报完整化) + C2 A (articles/ 迁移 content/blog/)

## Context
审计报告里 2 个 critical dead-code 问题都选 A 方案处理。

## Tasks

### C1: 财经简报完整化
- [ ] T1: 创建 `src/pages/FinanceDailyIndex.tsx`（参考 AIDailyIndex 模式）
- [ ] T2: 创建 `src/pages/FinanceDailyPost.tsx`（参考 AIDailyPost 模式）
- [ ] T3: `src/App.tsx` 加路由 `/finance-daily` + `/finance-daily/:slug`
- [ ] T4: `src/config/site.ts` 加 nav.main entry
- [ ] T5: `scripts/build-sitemap.js` 加 `/finance-daily` 到 staticRoutes
- [ ] T6: `scripts/build-routes.mjs` 加 `/finance-daily` 到 STATIC_PATHS + 详情 slugs
- [ ] T7: `scripts/prerender.mjs` 加 `finance-daily` 到 DETAIL_ROUTE_RE
- [ ] T8: FinanceDailyPost 用 BlogPosting JSON-LD + breadcrumbs + publishedTime

### C2: articles/ 迁移
- [ ] T9: 移 `articles/blinken-ai-science/blinken-ai-science.md` → `content/blog/zh-Hans/blinken-ai-science.md`
- [ ] T10: 移 `articles/scientific-agent-skills/scientific-agent-skills.md` → `content/blog/zh-Hans/scientific-agent-skills.md`
- [ ] T11: 删 `articles/` 目录
- [ ] T12: 运行 build:blog 让 2 个新 blog 自动加到 meta

### Verification
- [ ] T13: 跑 build (含 prerender) — 财经简报路由必须 prerender 成功 + 2 篇新 blog 收录
- [ ] T14: i18n-keys.test 5 语言对齐
- [ ] T15: tsc 0 errors
- [ ] T16: 126/126 tests
- [ ] T17: commit + push

## Notes
- articles 只有 zh-Hans 源，靠 `localizeText` fallback 显示
  （en → zh-Hans fallback works 已 verify）

## North Star
- 内容完整性 +1（财经简报栏目上线 + 2 篇文章入库）
- SEO 收录覆盖 +1（sitemap 多 2 详情 + 1 栏目）
