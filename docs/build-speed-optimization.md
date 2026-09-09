# 构建速度优化记录（2026-09）

> 背景：本地 `npm run build` 从 **7m18s 优化到 ~1min（冷缓存）/ ~4s（热缓存）**；
> 同时修复了 7 个路由预渲染失败的问题（含首页白壳）。

## 瓶颈定位方法

按构建管道逐阶段计时（数据生成 → sitemap/llms → vite → prerender），实测：
数据生成 ~3s、vite build 1.96s、**prerender ~7min（占 97%）**。
瓶颈不在 Vercel 部署链路（CI 用 `vercel deploy --prebuilt`，Vercel 端不构建）。

## 修复的渲染失败（P0）

历史构建 `done: 203 ok, 7 skipped`，以下路由曾白等 60s 超时 × 3 次重试：

| 路由 | 根因 | 修复 |
|---|---|---|
| `/`、`/ai-products`、`/ai-products/uplinked-b-v` | `uplinked-b-v.md` 缺 `product:` frontmatter → `post.product.name` 抛 TypeError 打挂整页 | 补全 5 语言 frontmatter；`Index.tsx` / `AIProductsIndex.tsx` / `AIProductsPost.tsx` 加空值防御 |
| 4 个 `/twitter/*` | 页面渲染成功但无 `<article>` 标签，被 prerender detail 判断丢弃 | `TwitterPost.tsx` 正文包 `<article>` |

教训：**ai-products 文章的 `product:` frontmatter 是必填**（类型定义在 `src/config/site.ts` 的 `AIProduct`），缺一个字段会打挂首页。新增产品分析时按 [AI 产品分析工作流](ai-products-workflow.md) 的模板填写。

## prerender 提速（P1）

`scripts/prerender.mjs`：

- **worker 复用 page**：路由间直接 `goto`，不再每路由 newPage/close
- **请求拦截**：abort 图片/字体/媒体（只要 HTML）
- `READY_WAIT_MS` 500 → 150；非 detail 超时 60s → 30s（快速失败）
- worker pool 默认上限 4 → `min(cpus, 8)`（CI 4 vCPU 仍为 4）

## 增量缓存（P2）

新增 [`scripts/lib/prerender-cache.mjs`](../scripts/lib/prerender-cache.mjs)，路由级失效语义：

| 层 | 覆盖 | 变化时失效 |
|---|---|---|
| chromeHash | src/** 代码（排除 src/lib 生成 JSON）+ vite.config/package-lock/index.html | 所有路由 |
| dataHash | src/lib/*.json（meta 类） | 仅列表/静态页 |
| contentHash | 路由自身（per-slug JSON，回退 content md） | 仅该 detail 页 |

效果（实测）：

- 改 1 篇博客 → 12 个列表/静态页重渲染 + 该 detail 页，其余 198 路由缓存命中，全量构建 5.9s
- 纯代码提交 → 全量重渲染（正确性优先）

缓存目录 `.prerender-cache/`（gitignored，CI 经 `actions/cache` 持久化，key 前缀 `prerender-v1-`）。
环境变量：`PRERENDER_CACHE=0` 禁用（强制全量验证）；`PRERENDER_CACHE_DIR` 改目录。

## 指标

| 指标 | 优化前 | 优化后 |
|---|---|---|
| 本地全量构建（冷缓存） | 7m18s | 1m00s |
| 本地二次构建（热缓存） | 7m18s | 4.2s |
| 本地增量（改 1 篇文章） | 7m18s | 5.9s |
| 预渲染失败路由 | 7 skipped | 0 skipped |
| CI 总耗时（GitHub Actions） | ~8.5min | **1m38s**（冷缓存，2026-09-09 实测） |
| CI build 步骤 | ~7.5min | **47s**（冷缓存；sparticuz chromium 213 路由全成功） |
| Vercel 部署构建时长 | 20min（远端构建） | 12s（--prebuilt 上传） |

CI 部署链路：`vercel pull` → `vercel build`（执行 vercel.json 的 buildCommand，
打包 `.vercel/output`）→ `vercel deploy --prebuilt --no-wait`。
注意：`vercel build` 在本地 mac 会因 sparticuz/chromium 报 ENOEXEC 而 prerender 失败（loudly），
这是预期行为——预渲染验证以 CI（Linux）为准。
