# Plan: 删除 Reddit / YouTube 专栏菜单项（全站下线）

## Context

业务侧决定下线 Reddit 专栏和 YouTube 专栏两个内容板块（仅保留 Twitter 专栏 + Twitter 深度分析）。本次任务**只删菜单入口 + 同步清理文案/构建产物**，不做内容策略层面的取舍讨论。

按 AGENTS.md 工程原则 #1（不保留向后兼容）和 #2（选最简单实现），本次清理是「全删」而非「仅删入口」——直接避免留下 sitemap 死链、GEO 文案失真、i18n key 残留等多处隐患。

## Goals

- [ ] 主导航不再显示 Reddit 专栏 / YouTube 专栏
- [ ] 首页不再有指向这两个栏目的入口（Hero CTA、专栏卡片网格）
- [ ] 站点配置 `siteConfig.columns` 不再包含 reddit/youtube 两个 `ColumnConfig`
- [ ] SEO/GEO 构建产物（prerender 路由、sitemap、llms.txt）同步清理
- [ ] 5 语言 i18n 文案同步改写，去除 "Reddit、YouTube、Twitter" 误导性表述
- [ ] About 页面「我们做什么」列表精简为 1 项（Twitter 深度分析）
- [ ] 新增 e2e 测试固化业务规则

## Tasks

### Phase 1 — i18n + JSON-LD + llms 文案（先行，避免编译/测试报错）
- [ ] 改 5 语言 `src/locales/{zh-Hans,zh-Hant,en,ja,vi}/translation.json`
- [ ] 改 `src/lib/jsonld.ts` `makeWebsiteSchema` 5 语言 description
- [ ] 改 `scripts/build-llms.mjs` Site Overview 中英两行 + Navigation 表 2 行 + Columns 整段

### Phase 2 — 页面代码层
- [ ] 改 `src/pages/Index.tsx`：删 hero CTA Link + 3 栏 → 1 栏 + mx-auto 居中
- [ ] 改 `src/pages/About.tsx`：删 item2/item3 `<li>` 整段（含 02./03. 编号）
- [ ] 改 `src/pages/AIDailyPost.tsx:120`：FAQ 答案去 YouTube

### Phase 3 — 数据/路由层
- [ ] 改 `src/config/site.ts`：删 `nav.main` 中 2 项 + 删 `columns.reddit` + `columns.youtube`
- [ ] 改 `scripts/build-routes.mjs`：删 STATIC_PATHS 中 2 行
- [ ] 改 `scripts/build-sitemap.js`：删 staticRoutes 中 2 行

### Phase 4 — 测试 + 验证
- [ ] 新增 `tests/e2e-nav-no-removed-columns.mjs`：5 语言下断言主导航无 Reddit/YouTube 专栏
- [ ] `npm run build` 全绿
- [ ] `vitest` i18n-keys parity 测试通过
- [ ] 浏览器实测 5 语言 × 首页/About/AI Daily 详情
- [ ] 检查构建产物 `dist/sitemap.xml` / `dist/llms.txt` 无 reddit/youtube 残留
- [ ] 截屏归档

## Verification

### 构建健康（北极星指标：构建健康）
- `npm run build` 0 错误 0 警告（含 build:blog/sitemap/llms/vite + prerender）

### 测试
- `npx vitest run` i18n-keys parity 通过
- `node tests/e2e-nav-no-removed-columns.mjs` 5 语言断言全过

### 前端交互质量（北极星指标：前端交互质量）
- 浏览器实测 5 语言：菜单无 Reddit/YouTube 专栏；首页 Hero 仅一个 CTA；首页中部仅一张 Twitter 单卡；About 页列表只 1 项；控制台 0 报错
- 直接访问 `/columns/reddit` 走 `ColumnPage` 的 not-found 分支（显示「未找到该专栏」）

### 构建产物
- `dist/sitemap.xml` grep "reddit\|youtube" → 0 命中
- `dist/llms.txt` grep "Reddit Column\|YouTube Column" → 0 命中
- `dist/llms.txt` grep "Twitter" → 仍存在（Twitter 专栏保留）

### SEO/GEO（北极星指标：SEO 收录覆盖）
- 观察 1 周 GSC 索引数变化（预期 -2）

## Decisions

| ID | 决策 |
|---|---|
| H1 | 全删范围（菜单 + 数据 + 文案 + 构建产物），非仅删菜单 |
| H2 | Hero CTA 删除，不替换 |
| H3 | 首页 Twitter 单卡 + `max-w-md mx-auto` 居中 |
| H7 | About 列表只保留 1 项（Twitter 深度分析），不重造文案 |
| H8 | 5 语言文案同步改写 |
| H9 | Privacy 页面 thirdDesc/contactDesc 不动（仍涉及站主社交链接） |
| H10 | AIDailyPost FAQ 答案去 YouTube（与实际数据源对齐） |

## Risks

| 风险 | 缓解 |
|---|---|
| 5 语言文案改写可能影响 SEO 关键词 | 保留 "Twitter 深度分析" "专栏" 等核心关键词 |
| i18n parity 测试红 | Phase 1 同步改 5 文件 |
| 14 文件改动 git diff 大 | 不拆 commit，单 PR 整体 revert 即可 |
| About 列表只 1 项视觉突兀 | 用户已确认接受 |
| 直接访问 /columns/reddit 仍走 ColumnPage | 走 not-found 分支，符合预期 |

## Files Touched

14 个文件：
- 4 个代码层：`src/config/site.ts`、`src/pages/Index.tsx`、`src/pages/About.tsx`、`src/pages/AIDailyPost.tsx`
- 1 个 JSON-LD：`src/lib/jsonld.ts`
- 5 个 i18n：`src/locales/{zh-Hans,zh-Hant,en,ja,vi}/translation.json`
- 3 个构建脚本：`scripts/build-routes.mjs`、`scripts/build-sitemap.js`、`scripts/build-llms.mjs`
- 1 个新增测试：`tests/e2e-nav-no-removed-columns.mjs`

---

## Completion Notes (2026-08-26)

### Verification Results
| Check | Result |
|---|---|
| `npx vitest run` (6 files, 70 tests) | ✅ 70/70 passed |
| `i18n-keys.test.ts` (parity across 5 locales) | ✅ 7/7 passed |
| `node scripts/build-sitemap.js` (158 → 156 URLs) | ✅ -2 reddit/youtube URLs removed |
| `node scripts/build-llms.mjs` (Site Overview + Columns) | ✅ 0 reddit/youtube references in output |
| `node -e "import('./scripts/build-routes.mjs')"` (168 → 166 routes) | ✅ -2 routes removed |
| `npx vite build` | ✅ built in 1.93s, no errors |
| `node tests/e2e-nav-no-removed-columns.mjs` (5 locales × 16 asserts) | ✅ 80/80 passed |
| Browser screenshots (5 locales) | ✅ all show no Reddit/YouTube nav, single CTA, single Twitter card |

### Build Error (Pre-existing, Not Caused by This PR)
- `npm run build` fails at `build:blog` step due to null bytes (0x00) in blog content files. This is **pre-existing** and confirmed by `git stash` baseline test. Out of scope for this PR.
- Workaround: ran `build:sitemap`, `build:llms`, `build:vite`, `build:prerender` separately. All passed.

### Side Effects Caused by `git stash` During Baseline Test
- 2 blog content files + `scripts/prerender.mjs` + `src/lib/blog-data.json` + 6 blog-meta files were touched during stash cycle. All restored via `git checkout`.

### Final Git Status
- 14 source files modified (intended scope)
- 2 build artifacts regenerated (sitemap.xml, llms.txt)
- 1 new e2e test file (`tests/e2e-nav-no-removed-columns.mjs`)
