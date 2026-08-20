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
- 老文章 frontmatter 的 categories 强制改 slug | 30 天兼容期后下掉 raw 字段 |


---



# Loop Engineering 实施记录：AI Daily 模块 5 语言国际化补全



> 项目：topdigg-web-miner — `/ai-daily` 模块

> 日期：2026-08-20

> 方法：loop engineering（observe → measure → decide → iterate）



---



## 实施循环



### 循环 1：缺口定位



**观察（observe）**

用户报告：https://www.topdigg.com/ai-daily 只有中文版。

通过 Graft + grep 摸清全貌：

- `src/locales/{5 语言}/translation.json` ✅ 5 语言 aiDaily 节已就绪（用户完成）
- `src/pages/AIDailyIndex.tsx` / `AIDailyPost.tsx` ✅ 已支持 `useTranslation` + per-locale lazy load
- `src/lib/ai-daily-data.ts` ✅ 数据源支持 `Record<string,string>` 多语言 + per-locale metadata
- `scripts/build-ai-daily.js` ✅ 支持 5 locale key + `normalizeLocalized(value, locale)`
- `content/ai-daily/` ❌ 只有 `zh-Hans/`，缺 4 个 locale 目录
- `src/lib/ai-daily-meta-{zh-Hant,en,ja,vi}.json` ❌ 4 个构建产物是中文占位（`"Liquid AI 发布..."`）

**测量（measure）**

切到 zh-Hant/ja/vi 任一语言，列表页打开 `/ai-daily`，内容全部 fallback 到 zh-Hans 中文；用户可见状态 = "i18n 失效"。

**决策（decide）**

纯数据缺口 + 构建产物陈旧。无须改 `.tsx` / 数据源 / i18n key。修复路径：

1. content 层：4 语言独立 md（与 blog 同构，更利于 reviewer）
2. scripts/build-ai-daily.js：修正 `normalizeLocalized` 让 `[locale]: value` 正确归属
3. 写 workflow SOP 防止未来新一期又卡在同一点

**行动（act）**

- ✅ `content/ai-daily/{zh-Hant,en,ja,vi}/2026-08-20-ai-daily.md`（4 个新 md）
- ✅ `scripts/build-ai-daily.js` — `normalizeLocalized(value, locale)` + scanDirectory 补 `file.locale`
- ✅ `docs/ai-daily-i18n-workflow.md` — SOP
- ✅ `.gitignore` — `screenshots/` 局部截图不入版本库

**验证（verify）**

- `npx vitest run` — 69/69 通过（含 17 个 ai-daily-data 测试 + 7 个 i18n-keys 测试）
- `npm run build` — 全绿，bundle 含 `ai-daily-data-{Do0NJPUy,CLd9eHC6}.js` 两个产物
- 浏览器实测 5 语言 URL，截图 10 张
- 4 个 `meta-{locale}.json` 资源 status 200（无 404）

---



### 循环 2：build 脚本 schema 兼容



**观察（observe）**

第一次跑 `node scripts/build-ai-daily.js` 后 `data.json` 输出：

```json

{ "reports": [{ "title": { "zh-Hans": "..." } }] }

```

只有 zh-Hans key 被合并。

**测量（measure）**

回看 `build-ai-daily.js` 第 16-22 行 `normalizeLocalized`：

```js

if (typeof value === 'string') return { 'zh-Hans': value };

```

它把字符串硬编码成 `zh-Hans`，无视调用方 locale。同时 `scanDirectory` 推入 item 时漏写 `locale` 字段，导致 `content[file.locale] = ...` 写入 `content["undefined"]`。

**决策（decide）**

用户选了"每语言 1 份 md"（与 blog 同构）—— 与现有 merge 逻辑互斥。

最小修复：

- `normalizeLocalized(value, locale)` 接受 locale 参数，字符串包成 `{[locale]: value}`
- scanDirectory 给 item 加 `locale: locale || 'zh-Hans'`

不动 type、不动前端、不动数据集以外的 schema。

**行动（act）**

- ✅ 改 `normalizeLocalized(value, locale)` 签名 + 2 个调用点
- ✅ scanDirectory item.push 补 `locale` 字段
- ✅ 重跑 build，验证 5 语言 content 都进 JSON

**验证（verify）**

```bash

node -e "const d=require('./src/lib/ai-daily-data.json'); \

  console.log('content locales:', Object.keys(d.reports[0].content))"

# → content locales: [ 'en', 'ja', 'vi', 'zh-Hans', 'zh-Hant' ]

```

`title locales: [ 'en', 'ja', 'vi', 'zh-Hans', 'zh-Hant' ]` — 5 语言全部正确合并。

---



### 循环 3：跨语言一致性



**观察（observe）**

前端渲染用到 `report.tags`、`report.source.aggregator` 等顶层字段，这些字段在 schema 里是单值不是 `Record<locale, string>`。

看 `meta-zh-Hant.json`：tags = `["AI Daily"]`，author = `"比特财商"`，source.original.name = `"Bitcai Business"` —— 5 语言 meta 都相同，没按 locale 分桶。

**测量（measure）**

- 5 语言用户在列表页看到的 `tags` 都是 "AI Daily"（en 版）
- 实际操作上没问题（"AI Daily" 就是产品英文品牌名），但严格说要"严格分桶"需扩 type + 改 build + 改 AIDailyIndex

**决策（decide）**

本期 fix 不卷入：tags/source 是产品级 metadata，"AI Daily" 作为产品英文名跨语言一致反而合理。

记入 `docs/ai-daily-i18n-workflow.md`「已知约束」一节，未来真要严格分桶单独立项。

**行动（act）**

不做代码改动，只在 workflow SOP 加 known constraint 段落。

**验证（verify）**

5 语言列表页 tags 都显示 "AI Daily" → 与设计意图一致 → 通过。

---



### 循环 4：人类 review 闭环



**观察（observe）**

用户选了"AI 翻译 + 人工 review 所有内容"，并要求"5 语言浏览器截图交付"。

**测量（measure）**

本地 `npm run dev` 后用 cmux headless browser 跑 10 个 URL：

- `/ai-daily?lang={zh-Hans,zh-Hant,en,ja,vi}` × 列表
- `/ai-daily/2026-08-20-ai-daily?lang={...}` × 5 单篇

每个页面注入 `await tab.waitForSelector('h1')` 等 render，捕获 h1 + h2 + hasMd + bodyText。

**决策（decide）**

截图全部落盘到 `screenshots/ai-daily-i18n/{type}-{locale}.png`，并加 `.gitignore` —— 截图是 reviewer 的临时工具，不入版本库。

**行动（act）**

- ✅ 10 张 webp 截图 → 复制为 `.png` 命名到 `screenshots/ai-daily-i18n/`
- ✅ `.gitignore` 加 `screenshots/`

**验证（verify）**

5 语言 h1 / h2 翻译对齐实测全通过：

| locale | h1 | h2 章节 |

|---|---|---|

| zh-Hans | AI 日报 | 【模型发布/更新】 |

| zh-Hant | AI 日報 | 【模型發布/更新】 |

| en | AI Daily | Model Releases / Updates |

| ja | AIデイリー | 【モデル公開/更新】 |

| vi | AI Hàng Ngày | 【Phát hành/Cập nhật mô hình】 |

console 无 404，无 Error 字符串匹配。等用户在 5 语言浏览器上肉眼复验。

---



## 最终验证



| 验证项 | 结果 |

|--------|------|

| `npx vitest run` | ✅ 69/69 |

| `npm run build` | ✅ 全绿 |

| content 合并 | ✅ 5 locale key (`en/ja/vi/zh-Hans/zh-Hant`) |

| `meta-{locale}.json` 资源加载 | ✅ 200 ×4 |

| 5 语言列表页 h1 | ✅ 5 语言正确 |

| 5 语言单篇 h1 + h2 翻译 | ✅ 章节标题对齐 |

| Console 错误 | ✅ 无 404 / 无资源错误 |

| 翻译准确性 | ⚠️ 待用户 5 语言浏览器肉眼 review |



---



## 变更摘要



### 新增文件

```

content/ai-daily/en/2026-08-20-ai-daily.md

content/ai-daily/ja/2026-08-20-ai-daily.md

content/ai-daily/vi/2026-08-20-ai-daily.md

content/ai-daily/zh-Hant/2026-08-20-ai-daily.md

docs/ai-daily-i18n-workflow.md

screenshots/ai-daily-i18n/{list,post}-{zh-Hans,zh-Hant,en,ja,vi}.png  (10 张, gitignored)

```



### 修改文件

```

scripts/build-ai-daily.js                      — normalizeLocalized + file.locale

src/lib/ai-daily-data.json                    — 5 语言 content 合并

src/lib/ai-daily-meta{,-{5 locale}}.json       — 重生成产物

.gitignore                                    — 加 screenshots/

DOCS.md / PLANS.md                            — 加索引

plans/ai-daily-i18n-repair.md                 — 计划文件留档

public/llms.txt                               — build 副作用（timestamp）

```



### 提交

```

980cecc feat(ai-daily): 补全 zh-Hant/en/ja/vi 4 语言内容

9959d6c feat(i18n): build-ai-daily 支持每语言独立 md + ai-daily 5 语言工作流 SOP

```



两者均 push 到 `origin/main`：d10faa6 → 9959d6c ✅



---



## 遗留风险（v2）



| 风险 | 状态 |

|---|---|

| tags/categories/source 顶层未按 locale 分桶（schema 改动波及 type + build + AIDailyIndex） | 推迟到 v2（已记入 workflow 文档） |

| HN 动态抓取标题仍是英文（运行时 hnrss） | 需翻译中间层，独立排期 |

| 用户 5 语言肉眼 review 待完成 | 在 user review |

