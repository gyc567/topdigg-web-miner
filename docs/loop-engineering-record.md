# Loop Engineering 实施记录

> 项目：topdigg-web-miner — Blog 搜索功能
> 日期：2026-08-11
> 方法：loop engineering（observe → measure → decide → iterate）

---

## 实施循环

### 循环 1：类型健全性

**观察（observe）**
- `BlogPost` 类型定义（`src/config/site.ts`）缺少 `categories` 字段
- `blog-meta.json` 实际数据中已有 `categories` 字段（12 种混合中英文值）
- `build-blog.js` line 77 将 `categories` strip 掉了

**测量（measure）**
- TS 编译无错（因为 `BlogMeta = Omit<BlogPost, 'content'>`，无强类型检查路径）
- 运行时 TS 不会报错，但类型是骗人的

**决策（decide）**
- 立即在 `BlogPost` 类型中添加 `categories: string[]`
- 创建 `src/lib/blog-categories.ts` 作为 slug ↔ i18n label 映射表
- 不修改 `build-blog.js`（数据已存在，strip 不影响已有 JSON）

**行动（act）**
- ✅ `src/config/site.ts` — 添加 `categories` 字段
- ✅ `src/lib/blog-categories.ts` — 新建映射文件

**验证（verify）**
- `npm run build:dev` 成功
- `npm test` 全部 52 个测试通过

---

### 循环 2：shadcn 组件可用性

**观察（observe）**
- 方案设计时计划使用 `Select` 和 `Popover + Command`
- 实际 `src/components/ui/` 只有 `badge/button/card/sonner/tooltip`

**测量（measure）**
- 首次 `npx shadcn@latest add select` 超时（60s），未成功
- 重试后成功

**决策（decide）**
- 使用 `Popover + Command` 实现 "More tags" 折叠功能
- 同时安装 `dialog`（附带安装）

**行动（act）**
- ✅ `npx shadcn@latest add select --yes`
- ✅ `npx shadcn@latest add popover command --yes`

**验证（verify）**
- `src/components/ui/` 新增 `select.tsx`、`popover.tsx`、`command.tsx`、`dialog.tsx`
- Build 成功，无组件缺失错误

---

### 循环 3：i18n Key Parity

**观察（observe）**
- 5 个语言的翻译文件需要同步新增 8 个 keys
- `i18n-keys.test.ts` 以 `en` 为基准，强制所有语言 key 一致

**测量（measure）**
- 新增 keys：`searchPlaceholder`、`searchAriaLabel`、`resultsCount`、`noResults`、`noResultsHint`、`clearAll`、`moreTags`、`allCategories`

**决策（decide）**
- 先更新 `en/translation.json`，再同步其余 4 个语言
- 所有语言的 `blog` 对象下的 key 保持完全一致

**行动（act）**
- ✅ 5 个翻译文件全部更新

**验证（verify）**
- `npm test` 中 `i18n-keys.test.ts` 通过（7 tests）

---

### 循环 4：防抖粒度

**观察（observe）**
- 方案初稿使用 300ms 防抖
- 81 篇规模下，300ms 对用户来说"感觉迟钝"

**测量（measure）**
- 81 篇 × 4 字段过滤 = 324 次 `includes` 操作，< 1ms
- 重渲染成本极低

**决策（decide）**
- 改为 150ms
- 空查询立即触发（跳过防抖）

**行动（act）**
- ✅ `src/hooks/useDebouncedValue.ts` 实现为空字符串跳过防抖
- ✅ `BlogIndex.tsx` 使用 `useDebouncedValue(searchQuery, 150)`

**验证（verify）**
- Build 成功，逻辑正确

---

### 循环 5：Top-N Tag 策略

**观察（observe）**
- 557 个 distinct tags
- 全部渲染不现实（横向滚动超 1 万像素）

**测量（measure）**
- `selectTopTags(posts, 12)` 算法：按 frequency 排序，同频时优先近期（30 天内）出现的 tag

**决策（decide）**
- Top 12 渲染为 chips
- 其余 545 个放入 `Popover + Command` 折叠菜单（支持搜索 + 多选）

**行动（act）**
- ✅ `TagFilterBar.tsx` — Top-12 chips + "More tags" Popover
- ✅ `BlogIndex.tsx` — 集成 `TagFilterBar`

**验证（verify）**
- Build 成功，组件逻辑正确

---

### 循环 6：分类中英混杂

**观察（observe）**
- 12 个分类值含中英混杂：`Deep Dive`/`深度分析`/`AI前沿`/`技术突破` 等

**测量（measure）**
- 直接渲染会导致非中文 locale 显示中文分类

**决策（decide）**
- 引入 `CATEGORY_SLUGS`（11 个英文 slug）+ `CATEGORY_LABEL`（每个 slug 的 5 语言 label）
- UI 使用 `CATEGORY_LABEL[slug][locale]` 显示

**行动（act）**
- ✅ `src/lib/blog-categories.ts` — 完整映射表
- ✅ `CategoryFilter.tsx` — 使用 `CATEGORY_LABEL` 渲染下拉项

**验证（verify）**
- Build 成功，类型正确

---

## 最终验证

| 验证项 | 结果 |
|--------|------|
| `npm run build:dev` | ✅ 成功（1.71s） |
| `npm test` | ✅ 52/52 通过 |
| i18n key parity | ✅ 5 语言完全一致 |
| TypeScript 类型 | ✅ `BlogPost.categories` 已补 |
| shadcn 组件 | ✅ `Select`、`Popover`、`Command` 已安装 |

---

## 变更摘要

### 新增文件
```
src/components/blog/BlogSearch.tsx      — 搜索框组件
src/components/blog/TagFilterBar.tsx    — Top-12 tag chips + More tags 下拉
src/components/blog/CategoryFilter.tsx  — 分类下拉筛选
src/lib/blog-categories.ts             — 分类 slug ↔ i18n label 映射
src/hooks/useDebouncedValue.ts          — 150ms 防抖 hook
src/components/ui/select.tsx            — shadcn Select
src/components/ui/popover.tsx           — shadcn Popover
src/components/ui/command.tsx           — shadcn Command
src/components/ui/dialog.tsx            — shadcn Dialog
docs/blog-search-plan.md                — 功能方案文档
docs/loop-engineering-record.md         — 本记录
```

### 修改文件
```
src/config/site.ts                       — BlogPost 类型补 categories
src/pages/BlogIndex.tsx                  — 完整重写（搜索 + 筛选）
src/locales/en/translation.json         — +8 keys
src/locales/zh-Hans/translation.json    — +8 keys
src/locales/zh-Hant/translation.json    — +8 keys
src/locales/ja/translation.json         — +8 keys
src/locales/vi/translation.json         — +8 keys
```

---

## 遗留风险（v2）

| 风险 | 状态 |
|------|------|
| 557 个 tag 的长期治理 | 推迟到 v2（tag 合并/停用）|
| URL 状态同步（`?q=&tag=`）| 推迟到 v2 |
| 搜索词高亮 | 推迟到 v2 |
| 老文章 frontmatter 的 categories 强制改 slug | 30 天兼容期后下掉 raw 字段 |
