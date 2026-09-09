# Plan: 构建速度优化（prerender 提速 + CI 增量缓存）

## Context

本地 `npm run build` 实测 **7m18s**，其中 prerender（210 路由 × puppeteer）占 ~97%。根因：

1. **内容 bug**：`content/ai-products/**/uplinked-b-v.md`（6 个语言文件）缺 `product:` frontmatter → `Index.tsx:101` / `AIProductsIndex.tsx:96` 的 `post.product.name` 抛 TypeError → 首页 `/`、`/ai-products`、`/ai-products/uplinked-b-v` 三个路由 React 白屏 → 每个 60s 超时 × 3 次重试。**线上首页当前是 CSR 空壳，未预渲染**。
2. **Twitter 详情页无 `<article>` 标签**：4 个 `/twitter/*` 路由实际渲染成功但被 prerender 的 detail 判断（要求 `<article>`）丢弃，每个白等 60s。
3. **prerender 固定开销**：每路由 newPage/close + READY_WAIT_MS=500ms + 50ms sleep ≈ 0.7s；页面加载图片/字体等无关资源。
4. **CI 无增量**：典型提交只加 1-2 篇博客，但 210 路由全部重渲染（CI build 7.5min）。

## Goals

- [ ] 首页 / ai-products / twitter 页面恢复预渲染（修复 SEO 损失）
- [ ] 本地全量构建 7m18s → ≤ 2min；二次构建（缓存命中）≤ 1min
- [ ] CI 常规提交 8.5min → ≤ 3min
- [ ] 新增代码有测试（vitest）

## Tasks（全部完成 ✓）

### P0 — 修复渲染失败的 7 个路由

- [ ] 补全 `content/ai-products/{,zh-Hant/,en/,ja/,vi/}uplinked-b-v.md` 的 `product:` frontmatter（参照其他产品的字段结构，从正文提取真实数据）
- [ ] `Index.tsx`、`AIProductsIndex.tsx`：`post.product.name` → `post.product?.name` 防御（卡片 product 区块条件渲染）
- [ ] `AIProductsPost.tsx`：`fullPost.product.xxx` 全部加空值防御（detail 页不再白屏）
- [ ] `TwitterPost.tsx`：正文包 `<article>` 语义标签
- [ ] `prerender.mjs`：非 detail 路由超时 60s → 30s（快速失败）

### P1 — prerender 单路由提速

- [ ] worker 复用 page（路由间 goto 代替 newPage/close）
- [ ] 请求拦截：abort 图片/字体/媒体（保留 html/js/css/json）
- [ ] `READY_WAIT_MS` 500 → 150
- [ ] pool size 默认 `min(cpus, 8)`（CI 4 vCPU 仍为 4）

### P2 — 增量缓存

- [ ] 新增 `scripts/lib/prerender-cache.mjs`：cacheKey = sha256(chromeHash + 路由自身内容 hash + route)；chromeHash = src/ + scripts/ + 配置文件内容 hash；detail 路由内容 = 对应 content md 文件
- [ ] `prerender.mjs` 集成：命中缓存直接写入 dist 并跳过渲染；渲染成功后回写缓存
- [ ] `.gitignore` 加 `.prerender-cache/`
- [ ] `.github/workflows/deploy.yml` 加 `actions/cache`（restore-keys 前缀匹配，每次上传）
- [ ] 缓存模块单元测试（vitest）

## Verification（实测结果 ✅）

- `npx tsc --noEmit` 0 错误；eslint 改动文件 0 问题
- `npm test`：120/120 通过（含新增 prerender-cache 14 个用例）
- 冷缓存全量构建：**1m00s**（优化前 7m18s），`210 rendered, 0 cached, 0 skipped, 0 fail`
- 热缓存二次构建：**4.2s**，`210 cached`
- 增量（改 1 篇博客）：**5.9s**，`12 rendered, 198 cached`（12 = 11 静态/列表 + 1 该文 detail）
- `dist/index.html` 28KB 含 h1（原 984B 空壳）；4 个 twitter 页含 `<article>`；uplinked-b-v 详情页 60KB 产出
- `npm run build:fast` 正常（156 路由全部缓存命中）

## 测试报告

- 总数 120，通过 120，失败 0
- 新增：`scripts/lib/prerender-cache.test.mjs` 14 用例，覆盖 hash 语义（chrome/data/content 三层失效）、路由→内容文件映射、缓存读写往返
- 被测功能：prerender 增量缓存模块
