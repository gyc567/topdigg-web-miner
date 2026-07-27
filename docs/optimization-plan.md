# TopDigg 项目优化方案（审计修订版）

> 本文档由原分析方案经逐条代码核验后修订生成。
> 审计日期：2026-07-27 ｜ 审计方式：对每条论断用 grep/读码实际验证
> 原始分析见对话记录；本文档为唯一有效版本。

## 审计修订记录（相对原方案的更正）

| # | 原方案表述 | 审计结论 |
|---|-----------|---------|
| 1 | blog-data.json 为 638KB | ❌ 实际为 **623KB**（`ls -lh` 实测），不影响结论 |
| 2 | 双 toast 系统"二选一" | ❌ 已验证全站 `toast(` 调用数为 **0**，**两套都是死重**，可整体删除（含双份 use-toast.ts）；若未来需要通知能力再引入 sonner |
| 3 | next-themes 列入可删依赖 | ⚠️ **不能直接删**：`ui/sonner.tsx` 依赖它。若保留 sonner 则必须保留 next-themes；两者一起删才成立 |
| 4 | TwitterPost hooks 违规是"fragile 反模式" | ⚠️ 措辞过轻。已读码确认 `TwitterPost.tsx` L23-29 存在**两个条件 early return 位于 useEffect（L32）之前**，是明确的 react-hooks/rules-of-hooks 违规，路由参数变化时会真实触发 React 报错，应升级为 P1 必修 bug |
| 5 | 数据质量问题清单 | ➕ 补充：除假 avatar（site.ts:417）外，**site.ts:428 还有假的 x.com status URL**（`status/1234567890`） |
| 6 | 可删依赖清单 | ➕ 补充：**date-fns** 在 src 中引用数为 0，一并列入可删 |

其余论断（baseUrl 占位符、twitter 3 篇 404、死代码清单、7 个在用 ui 组件、react-query 零调用、无 React.lazy、i18n 覆盖缺失、乱码、无 sitemap、?lang= canonical、26/7/7/7 博客语言覆盖、19 个 knowledge-card 堆在 public 根目录、Index.tsx 原地 sort 副作用）**全部验证属实**。

---

## 🔴 P0 — 严重问题（影响线上功能/SEO）

### 1. `baseUrl` 是占位符【已验证】
`src/config/site.ts:71` 为 `https://topdigg.example.com`，全站 canonical / og:url / hreflang 全部指向错误域名。
**修复**：改为真实域名（一行改动）。

### 2. 4 篇 Twitter 分析中 3 篇正文 404【已验证】
- `TwitterPost.tsx:36` 运行时 `fetch('/content/twitter/${slug}.md')`
- slug 与 md 文件名一一对应（已核对：`AliAbdaal-twitter-analysis-2025-08-22` 等）
- 但 `public/content/twitter/` 只有 `yangyi-...md` 一篇；`content/twitter/` 下 3 篇从未拷入
**修复**：
- 快速修复：拷贝 3 个 md 到 `public/content/twitter/`
- 根治：仿照 `build-blog.js` 把 twitter 内容纳入构建管线，消除 `content/` 与 `public/content/` 双目录手工同步

---

## 🟠 P1 — 死代码 / Bug / 依赖膨胀

### 3. TwitterPost hooks 违规【已验证，审计升级】
条件 return 在 `useEffect` 之前。修复：把 early return 移到所有 hooks 之后，或用可选链守卫。

### 4. 死代码集中区【已验证，全部零引用】
- `src/lib/blog-loader.ts`（105 行，import.meta.glob 用法本身在 Vite 中无效）
- `src/lib/blog-fs.ts`（102 行，含过期数据副本，日期与 site.ts 不一致）
- `src/lib/blog-adapter.ts`（68 行，唯一引用 blog-fs 和 siteConfig.blog.posts 的地方，fallback 形同虚设）
- `site.ts` 的 `blog.posts`（L220-319，博客已迁至 blog-data.json，此处为失效残留）
- `src/components/KnowledgeCard.tsx`、双份 `use-toast.ts`、双 Toaster（见修订 #2）

### 5. shadcn ui 48 个组件仅 7 个在用【已验证】
业务代码实际引用：button、badge、card、tooltip、toast、toaster、sonner（其中 toast 系从未触发，见修订 #2）。其余 **41 个组件文件零引用**（sidebar 761 行、chart、carousel、form 等），为 lovable 模板全量拷贝遗留。

### 6. 未使用依赖【已验证，引用数均为 0】
- `@tanstack/react-query`（App.tsx 包了 Provider 但全站 useQuery 调用 = 0）
- `zod`、`@hookform/resolvers`、`date-fns`（src 内零引用）
- `recharts`、`cmdk`、`embla-carousel-react`、`input-otp`、`react-day-picker`、`vaul`、`react-hook-form`（仅被未使用的 ui 组件引用，随第 5 条一起删）
- ⚠️ `next-themes` 只能与 sonner 一同删除（修订 #3）

### 7. 无代码分割【已验证】
`App.tsx` 静态 import 全部 8 个页面，首屏 bundle 含 623KB blog-data.json。
**修复**：路由级 `React.lazy` + `Suspense`。

### 8. Index.tsx 原地 sort 副作用【已验证】
`blogDataSource.getPosts()` 返回单例内部数组引用，`.sort()` 原地修改共享数据；且 build-blog.js 已按日期排序，此 sort 本就多余。
**修复**：直接 `.slice(0, 3)`。

### 9. 数据质量【已验证】
- site.ts:276 日语标题乱码（"白ocopey"、未翻译的"瓶颈"）
- site.ts:464 日语混入简体（"转型""制品""完整"）
- site.ts:417 假 avatar URL、:428 假 x.com status URL

---

## 🟡 P2 — 质量与一致性

### 10. i18n 三套并存、覆盖不全【已验证】
- `pages.twitter.*` key 仅 zh-Hans 有（zh-Hant/en/ja grep = 0），靠 `t(key, "中文默认值")` 兜底，非中文用户看到中文
- `useGeoLanguage.ts` 每次挂载请求 `ipapi.co`（无缓存），与 i18next LanguageDetector、LanguageInitializer 职责重叠
- Index（SEO title/description 硬编码中文）、Twitter 系列、ExternalLinks（282 行数据硬编码在组件内）不走 `t()`

### 11. SEO 缺失【已验证】
- 无 sitemap.xml；robots.txt 无 Sitemap 指令（只有 Allow 行）
- 多语言 canonical 用 `?lang=` query（SEO.tsx:29 `withLangParam`），不如路径前缀 `/en/`
- 纯 CSR 无预渲染，og/JSON-LD 对不执行 JS 的爬虫不可见
- Twitter 页面缺 JSON-LD
- 博客语言覆盖失衡：zh-Hans 26 篇 vs 其他语言各 7 篇（靠 localizeText 回退兜底）

### 12. 目录卫生【已验证】
- 项目根目录散落 mindvideo-ai-* 等内容生产中间产物 → 移入 `content/templates/` 或 gitignore
- public 根目录 19 个 `*-knowledge-card.html` → 收入 `public/cards/`（需同步改 md 引用路径）
- 违反 CLAUDE.md 自定的"≤ 8 文件/目录"规则（ui 49 文件、public 23 文件）

---

## 📋 建议行动顺序

| 步骤 | 内容 | 预估 | 风险 |
|-----|------|-----|------|
| 1 | 改 baseUrl + 拷贝 3 篇 twitter md（快速修复） | 10 分钟 | 无 | ✅ 已完成（2026-07-27，baseUrl=https://topdigg.com，构建+lint 验证通过） |
| 2 | 修 TwitterPost hooks 违规 + Index sort 副作用 | 30 分钟 | 低 | ✅ 已完成（2026-07-27，TwitterPost lint 已 clean；Index 残留 4 个 any 为历史问题） |
| 3 | 删死代码（第 4/5/6 条）+ 双 Toaster | 1 天 | 低（纯删除，删后跑 build 验证） | ✅ 已完成（2026-07-27：删 3 个 lib 死文件、KnowledgeCard、双 use-toast、use-mobile、43 个未用 ui 组件、radix Toaster、react-query Provider；卸载 12 个运行时依赖 + 24 个 radix 包；构建通过，剩余 lint 错误均为历史 any 类型问题） |
| 4 | React.lazy 路由分割 + sitemap 生成 + robots 加 Sitemap | 半天 | 低 |
| 5 | 统一 i18n（补 locale key、收敛语言检测、ExternalLinks 数据外置）+ 修数据质量 | 1 天 | 中 |
| 6 | twitter 内容构建管线化 + 长期考虑预渲染 | 1-2 天 | 中 |

> 步骤 1-4 均为低风险高收益，建议一批完成；每步完成后用 `npm run build` 验证。
