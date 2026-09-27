# Plan: SEO Performance Excellence (比推文更深一层)

## Context
@TOMRICH1619 推文覆盖「Google 抓取」3 分钟排查 — 这是最基础的 indexability 层。
要做比推文更好：覆盖**性能 / 渲染优先级 / 内链图 / CLS / Resource hints** 这层直接影响 Google 排名（CWV + Page Experience）。

## Tasks
- [ ] T1: `vite.config.ts` 加 `manualChunks`：react / i18n / icons / data 四个 vendor chunk
- [ ] T2: `index.html` 加 `preconnect` + `dns-prefetch`（gtag / clarity / fonts / unpkg）
- [ ] T3: `index.html` `<head>` 加 `preload` logo-header.png（已存在）+ 确认 fetchpriority
- [ ] T4: 全局 layout 检查 home link + 内部 anchor 真实可达
- [ ] T5: 主页 hero image 加 `fetchpriority="high"` 与 `loading="eager"`
- [ ] T6: 验证 prerendered `dist/<route>/index.html` 数量（健康指标）
- [ ] T7: build 验证 + 跑 `npm run build:prerender` 看真效果
- [ ] T8: commit + push

## Verification
- `npm run build` 完整流程（vite + prerender）
- `dist/` 出现 `dist/blog/<slug>/index.html` 多份
- bundle 显著化小（看 `dist/assets/` size）

