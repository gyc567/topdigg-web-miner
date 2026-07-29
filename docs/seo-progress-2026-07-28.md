# TopDigg SEO/GEO 会话进度（2026-07-28 重启续办用）

## 当前状态总览

| 项 | 状态 |
|---|---|
| 工作区 | `/Users/stevenw/code/topdigg-web-miner` |
| 当前 HEAD | `4db5df0` |
| 远端 | `origin/main` 已同步 |
| 工作区未提交 | 无（clean） |
| Vercel 部署 | 已上线 PR3 + PR4（4db5df0） |

## 已完成

### PR1 (commit `43f4d5f`) — SEO 基础配置
- `public/robots.txt` 增加 AI 爬虫白名单段（GPTBot/ClaudeBot/Claude-Web/PerplexityBot/Google-Extended/Applebot-Extended/CCBot/cohere-ai）
- `vercel.json` 配置 SEO/security headers
- ❗ 注意：PR1 中的 308 重定向**语法不合法**（用了完整 URL 作 source），被 PR3 修复

### PR2 (commit `20e0526`) — 自研 prerender
- `scripts/build-routes.mjs`：从 `blog-data.json` + `site.ts` 自动生成 40 个路由
- `scripts/prerender.mjs`：puppeteer + Chromium 后构建预渲染
- `src/main.tsx`：`render-event` 事件派发
- `src/components/SEO.tsx`：**使用 `normalizeLang`** 让 canonical/hreflang 规范化（不再是 `?lang=en-US`）
- `index.html`：清理默认 description / og / twitter meta
- ❗ **PR2 在 Vercel 上 build 失败**（puppeteer 启动超时）→ 被 PR4 修复

### PR3 (commit `ab2dccb`) — Vercel 构建兼容
- `vercel.json` 改用 `has.host` redirect pattern（308 配置）
- `scripts/prerender.mjs`：chromium 失败时 exit 0（不阻塞 build）
- `package.json`：拆分 `build:vite` 独立脚本
- 移除了手写的 HSTS（Vercel 自动加）
- ✅ 测试：**所有 5 个 SEO/security headers 在生产生效**

### PR4 (commit `4db5df0`) — Vercel 真 prerender
- 引入 `@sparticuz/chromium` + `puppeteer-core`
- `scripts/prerender.mjs` 通过 `VERCEL=1` 自动切换到 sparticuz code path
- 简化 `IS_VERCEL = process.env.VERCEL === "1"`（避免 VERCEL=0 被当作 truthy）
- README.md 末尾添加"Deploying to Vercel with prerendered SEO"章节
- ✅ 测试：**生产环境 40 路由全部返回 26K-58K 字节完整 HTML**，title/description/h1 都是每页专属

### 资料文档
- `docs/seo-geo-optimization-plan.md`（v3 完整方案，~470 行）
- `docs/seo-geo-audit-notes.md`（v2→v3 审计笔记，~120 行）
- `docs/test-report-2026-07-28.md`（早期修复测试报告）

## 生产环境验证（4db5df0 部署后）

| 路由 | 字节数 | title |
|---|---|---|
| `/` | 26,637 | Discover Web Traffic & Business Opportunities \| TopDigg |
| `/blog` | 56,507 | Blog \| TopDigg |
| `/twitter` | 50,021 | Twitter Deep Analysis \| TopDigg |
| `/columns/reddit` | 36,996 | Reddit Column \| TopDigg |
| `/blog/qwen3-4b-...` | 44,361 | Qwen3-4B 克劳德幻境5... \| TopDigg |
| `/twitter/AliAbdaal-...` | 58,615 | Ali Abdaal Twitter Deep Analysis Report \| TopDigg |
| `/blog/harper-...` | 50,400 | Harper Deep Dive: The Open-Source Grammar Checker... \| TopDigg |

✅ Security/Cache headers 全生效
✅ LLM robots 全生效
⚠️ 307（不是 308）：topdigg.com → www.topdigg.com（Vercel Domain Settings 平台级，未在 vercel.json 解决，需要用户在 Vercel UI 配置）

## 未完成任务

### 短期续办（按优先级）

1. **PR3.5**：在 Vercel Dashboard 把 `topdigg.com` 配置为 301/308 redirect → `www.topdigg.com`
   - 不是代码改动，是平台 UI 配置
   - 我无法从仓库内完成

2. **PR4 JSON-LD 全量 ✅**（commit `cee71c4`）
   - ✅ 全站 `WebSite` + `Organization`（makeWebsiteSchema / makeOrganization）
   - ✅ 首页 `SearchAction`（makeSearchActionSchema）
   - ✅ Blog 详情 `Article` + `BreadcrumbList`（makeArticleSchema）
   - ✅ Twitter 详情 `Article`（author 用 Person schema，sameAs 链接账号）（makeTwitterArticleSchema）
   - ✅ 栏目页 `CollectionPage` + `ItemList`（makeCollectionPageSchema）
   - ✅ 抽 `src/lib/jsonld.ts` 工厂函数（~205 行）
   - ✅ 改 `src/components/SEO.tsx` 增加 `breadcrumbs` 属性
   - ⚠️ BlogIndex（博客列表页）尚未加 schema（可选，下次补）

3. **PR5 性能优化**（P2）：
   - `dompurify` / `marked` 改为按需 dynamic import（仅博客详情页加载）
   - 验证主包降到 < 250KB
   - 图片：所有 `<img>` 用 `<picture>` 或 Astro `<Image>`（如果未迁移 Astro）
   - 字体：`font-display: swap`，自托管子集化

4. **PR6 llms.txt + llms-full.txt**：
   - 写 `public/llms.txt`（站点简介 + 链接）
   - 写 `public/llms-full.txt`（所有文章全文 markdown，单文件 < 50MB）
   - 从 `scripts/build-routes.mjs` 派生

5. **PR7 E-E-A-T 页面**：
   - About 页（站点介绍 + 作者团队 + 联系方式 + sameAs 社交账号）
   - Contact 页
   - Privacy Policy / 版权声明页
   - Author bio 页
   - 注意：新增页也要加到 `build-routes.mjs` + prerender

6. **PR8 监控**：
   - 在 Vercel 日志中按 UA 分桶 GPTBot/ClaudeBot/PerplexityBot
   - 写 `scripts/bot-audit.mjs` 拉取 GSC 的 indexed pages 计数
   - 配置 GSC + Bing Webmaster

### 中期（可选）

7. **P0-B Astro 迁移**（如 P0-A 跑了一段时间流量增长不如预期 → 升级）
   - 适用场景：当前 prerender 满足需求则不必做

8. **运行时 md 用法**（可在 Astro 迁移后做）

## 文件留念

### 修改过的关键文件

```
vercel.json                          # 308 redirect + headers
public/robots.txt                    # AI bots
index.html                           # cleaned default head
src/main.tsx                         # render-event dispatch
src/components/SEO.tsx               # normalizeLang for canonical
package.json                         # build:vite + prerender scripts
scripts/build-routes.mjs             # 自动生成路由清单
scripts/prerender.mjs                # puppeteer + sparticuz 后构建
vite.config.ts                       # (早期修改后被回滚回原状)
README.md                            # 末尾加部署说明
```

### 未改动的关键代码

```
src/i18n.ts                          # i18n 配置
src/hooks/useSupportedLocale.ts      # 已存在并被使用
src/lib/locale.ts                    # normalizeLang 等
src/lib/blog-data.json               # build:blog 自动生成
src/config/site.ts                   # 含 twitter analyses 4 条
```

## 关键命令

```bash
# 本地完整构建（带 prerender）
npm run build
# 输出：[prerender] done: 40 ok, 0 fail
#       dist/blog/<slug>/index.html (50K bytes each)

# 列路由
npm run build:routes

# Vercel 部署后验证
curl -s https://www.topdigg.com/blog/harper-analysis-report-2026-07-27 | grep -oE "<title>[^<]+</title>"
curl -sI https://www.topdigg.com/ | grep -iE "x-frame|x-content|referrer|permissions"
curl -s https://www.topdigg.com/robots.txt | grep GPTBot
```

## 关于 puppeteer 在 Vercel 的细节

- **生产 verified**: `VERCEL=1` 由 Vercel 自动设置（Vercel 暴露 `VERCEL` env var 为 `"1"`）
- Sparticuz Chromium for AWS Lambda @sparticuz/chromium@149 下载约 50MB（vs 完整 chromium ~150MB）
- Sparticuz 必须配 puppeteer-core，不能用完整 puppeteer（puppeteer 自身带 chromium 路径解析会错）
- `chromium.args` 包括 AWS Lambda 沙箱必需 flags

## 用户偏好

- 进度透明：每次变化给报告
- 简洁对话，单条 < 5 行
- 中文优先
- 风险最低，回滚容易
- KISS + 文档可读

## 启动后第一句话模板

```
继续执行 docs/seo-progress-2026-07-28.md 中的"未完成任务" ——
从 PR4 JSON-LD 全量开始（任务 #2），需先读 src/components/SEO.tsx、
src/lib/blog-data.json、src/config/site.ts，然后抽 src/lib/jsonld.ts
工厂函数。
```
