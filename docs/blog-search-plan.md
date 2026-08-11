# 🔍 Blog 关键词搜索功能方案

> 文档版本：2026-08-11（v2 — loop-engineering 审计后）
> 项目：topdigg-web-miner
> 状态：方案设计阶段（待评审）
> 审计方法：loop engineering（observe → measure → decide → iterate），直接覆盖在原方案上

---

## 〇、v2 审计记录（loop engineering 决策）

> 本节为 v2 增量，所有对原方案的修订都在这里登记，并在对应章节直接体现。

### 0.1 审计循环

| 循环 | 观察（observe） | 测量（measure） | 决策（decide） | 修订章节 |
|---|---|---|---|---|
| 1. 类型健全性 | `BlogPost` 缺 `categories`，但 `blog-meta.json` 已含 | 编译无错（build 路径无强类型检查），运行时 TS 不会拒 | 在动 UI 之前**先修类型**和**先修 build 脚本**——否则 UI 类型是骗人的 | §2.1, §3.5, §10.3, §十一 |
| 2. 标签规模 | 557 个 distinct tag | 任意页面渲染 557 个 chip 不可用；横向滚动超 1 万像素 | **Top N**（默认 12）按频率+近期性排序；其余折叠到 combobox | §3.2, §4.2 |
| 3. shadcn 组件 | 实际只装 `badge/button/card/sonner/tooltip` | 计划引用 `Select` 组件不存在 | 分类筛选用 **shadcn `Select`（需新装）**或用 **Popover+Command（命令面板式）**——更省空间，零滚动 | §3.1, §4.2, §10.2 |
| 4. 多语言 categories | 12 个值含中英混杂（`Deep Dive`/`深度分析`/`AI前沿`） | 渲染时会按 `深度分析` 给非中文用户显示，违反 i18n 假设 | 引入 **`category: category_i18n` 映射表**；先只把数据规整到英文 slug，再展示 | §3.5, §十 1.4 |
| 5. 防抖粒度 | 300ms 用于 onChange | 300ms 在 81 篇规模下属于"感觉迟钝"——>200ms 已无重渲染压力 | **改为 150ms**；空查询立即触发 | §3.4, §3.5 |
| 6. 搜索算法 | 用 `String.includes` 做子串匹配 | 81 篇×5 字段 = 405 次 includes/op，无须建索引 | **保留 includes**；仅在 >500 篇时考虑预计算 | §六 |
| 7. v2 URL 同步 | 已记入 §七（非目标） | 实际实现成本低（5 行），但需要 v2 配套 | **继续推迟**——v1 先证明搜索价值，URL 状态是优化 | §七 |
| 8. 高亮匹配词 | 已记入 non-goals | 加 highlight 需对 title/desc 做安全转义，开销大 | 保持 v1 不做 | §十一 |
| 9. 搜索框聚焦 | 未设计 | 没有聚焦时，键盘用户无法跳转 | **首屏 `useEffect` 自动 focus 搜索框**；为可访问性加 `aria-label` | §3.2, §4.1 |
| 10. 滚动位置 | 搜索后浏览器位置不变 | 用户搜后看到空结果时位置在顶部，困惑 | **结果区域插一个 sentinel + `scrollIntoView`**，无结果时也保留锚点 | §4.3, §九 T6 |

### 0.2 v1 → v2 决策汇总

- **必修（block v1 实现）**：`BlogPost` 类型补 `categories`；build-blog.js 不再 strip `categories`；`Select` 组件装好或换组件。
- **必做（避免翻车）**：tag chip 限 Top 12 + 折叠下拉；categories 标准化到英文 slug + i18n label 映射。
- **可做（提升质量）**：搜索框自动 focus；150ms 防抖；空结果保留位置。
- **不做（非目标升级）**：URL 状态、高亮、分页、搜索历史。

---

## 一、需求分析

### 1.1 功能范围

| 功能点 | 说明 |
|--------|------|
| 搜索入口 | 在 `/blog` 页面头部添加搜索框；自动 focus |
| 搜索方式 | 客户端实时搜索（所有 81 篇文章已在 `blog-meta.json` 中预加载，无需额外网络请求） |
| 搜索字段 | `title`、`description`、`tags`、`author`（均支持 i18n） |
| 筛选维度 | 按 **tag chip**（Top 12 多选）+ 按 **category**（单选下拉，标准化到英文 slug + i18n label） |
| 结果展示 | 实时过滤原有博客列表，保持 2 列 grid 布局 |
| 空状态 | 友好的无结果提示 UI；保留滚动位置 |

### 1.2 搜索策略

- **即时搜索（Instant Search）**：用户输入时实时过滤，无需回车
- **大小写不敏感**
- **多语言支持**：搜索当前 locale 下的 `title` 和 `description`；`tags`/`categories` 跨语言匹配（用英文 slug）
- **防抖处理**：150ms（v1 草案为 300ms，审计后下调）
- **键盘可达**：搜索框初始 auto-focus，tab 顺序合理

---

## 二、当前代码库现状

### 2.1 相关文件

| 文件 | 用途 | v2 备注 |
|------|------|------|
| `src/pages/BlogIndex.tsx` | 博客列表页（当前为静态列表，无搜索） | v1 需重构 |
| `src/pages/BlogPost.tsx` | 单篇博客详情页 | 不动 |
| `src/lib/blog-data.ts` | `getPosts()` 返回 `BlogMeta[]`（去 content） | v1 需确认 `BlogMeta` 包含 `categories` |
| `src/config/site.ts` | `BlogPost` 类型定义 | **v1 必修**：`BlogPost` 加 `categories: string[]` |
| `src/locales/{lang}/translation.json` × 5 | 国际化翻译文件 | v1 需新增 8 个 key |
| `scripts/build-blog.js` | 生成 `blog-data.json` + `blog-meta.json` | **v1 必修**：line 77 不能 strip `categories` |
| `src/components/ui/` | shadcn 组件 | **v1 必修**：`Select`（或 `Popover+Command`）需 `npx shadcn@latest add select` |
| `src/locales/i18n-keys.test.ts` | i18n key 一致性测试 | v1 必须保证 5 语言 key 完全一致（以 `en` 为基准） |

### 2.2 关键数据

- **文章总数**：81 篇
- **数据来源**：`blog-meta.json`（含 `categories` 字段，~13 KB；全量加载到客户端）
- **字段**：slug, title (LocalizedText), description (LocalizedText), date, author, tags (string[]), categories (string[])
- **distinct tags**：**557**（v1 必修：用 Top-N 策略，否则 chip 不可用）
- **distinct categories**：**12**（v1 必修：含中英混杂，需映射到英文 slug + i18n label）
- **排序**：已在构建时按 `date DESC` 排序
- **现有翻译 keys**：仅 `blog.indexTitle` 和 `blog.indexDesc`，无搜索相关文案

### 2.3 现有组件树

```
src/pages/BlogIndex.tsx
└── <section.grid> — 81 篇静态渲染，无状态
```

---

## 三、架构设计

### 3.1 文件变更清单

| 操作 | 文件路径 | 说明 | 优先级 |
|------|----------|------|--------|
| **必修** | `src/config/site.ts` | `BlogPost` 加 `categories: string[]` | P0 |
| **必修** | `scripts/build-blog.js` | line 77 改为不 strip `categories`（保留 `categories` 字段） | P0 |
| **必修** | `npx shadcn@latest add select`（或 popover+command） | 引入 shadcn `Select` 组件 | P0 |
| 必修 | `src/components/blog/BlogSearch.tsx` | 搜索框组件（含 auto-focus、清除按钮） | P0 |
| 必修 | `src/components/blog/TagFilterBar.tsx` | Top-12 tag chip + "more" 下拉 | P0 |
| 必修 | `src/components/blog/CategoryFilter.tsx` | 分类下拉筛选（标准化 slug + i18n label） | P0 |
| 必修 | `src/lib/blog-categories.ts` | **新增**：英文 slug ↔ i18n label 映射 | P0 |
| 必修 | `src/hooks/useDebouncedValue.ts` | 150ms 防抖 hook | P0 |
| 必修 | `src/pages/BlogIndex.tsx` | 添加搜索/筛选状态和过滤逻辑 | P0 |
| 必修 | `src/locales/{lang}/translation.json` × 5 | 新增 i18n keys（8 个） | P0 |
| 增强 | 现有 chip 多选 → 复用 shadcn `Command`（多选带搜索） | nice-to-have | P2 |

### 3.2 组件结构

```
src/pages/BlogIndex.tsx
├── <header>
│   ├── <h1> {t("blog.indexTitle")} </h1>
│   └── <p>  {t("blog.indexDesc")} </p>
├── <BlogSearch autoFocus />        ← 搜索框（顶部，响应式宽度）
├── <TagFilterBar />              ← Top-12 tag chip + 折叠菜单
├── <CategoryFilter />            ← 分类下拉（标准化 + i18n label）
├── <ResultSummary count={n} />   ← "找到 X 篇文章" 或空状态
└── <section.grid>                 ← 过滤后的文章列表
    └── { filteredPosts.map(post => <article />) }
```

### 3.3 状态管理（BlogIndex 本地 state）

```ts
const [searchQuery, setSearchQuery] = useState('');                                 // 原始输入
const [debouncedQuery, setDebouncedQuery] = useDebouncedValue(searchQuery, 150);    // 防抖后
const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());           // Top-12 tag 多选
const [overflowTag, setOverflowTag] = useState<string | null>(null);                // 折叠的标签
const [selectedCategory, setSelectedCategory] = useState<CategorySlug | 'all'>('all');

const filteredPosts = useMemo(() => {
  return posts.filter(post => {
    if (selectedCategory !== 'all' && !post.categories.includes(selectedCategory)) return false;
    if (selectedTags.size > 0 && ![...selectedTags].every(t => post.tags.includes(t))) return false;
    if (debouncedQuery.trim() && !matchesQuery(post, debouncedQuery, currentLocale)) return false;
    return true;
  });
}, [posts, debouncedQuery, selectedTags, selectedCategory, currentLocale]);
```

### 3.4 防抖实现（v2 修订：150ms 而非 300ms）

```
用户输入 → useDebouncedValue(150ms) → 触发 useMemo 过滤
空查询跳过防抖，立即触发（perceived as instant）
```

### 3.5 数据规整：categories 标准化（v2 新增）

当前 `categories` 含中英混杂值（`Deep Dive`、`深度分析`、`AI前沿` 等）。v1 引入映射表：

```ts
// src/lib/blog-categories.ts
export const CATEGORY_SLUGS = [
  'deep-dive',
  'ai-analysis',
  'analysis',
  'ai-tools',
  'development-efficiency',
  'deep-analysis',
  'review',
  'tech-breakthrough',
  'ai-frontier',
  'daily-report',
  'reviews',
] as const;
export type CategorySlug = typeof CATEGORY_SLUGS[number];

// 映射 raw label → slug（首次 v1 上线时跑一次脚本）
// 在 build-blog.js 里完成：raw → slug

// slug → i18n label
export const CATEGORY_LABEL: Record<CategorySlug, LocalizedText> = {
  'deep-dive':              { 'en': 'Deep Dive',        'zh-Hans': '深度分析', 'zh-Hant': '深度分析', 'ja': '深掘り', 'vi': 'Phân tích sâu' },
  'ai-analysis':            { 'en': 'AI Analysis',      'zh-Hans': 'AI 分析',  'zh-Hant': 'AI 分析',  'ja': 'AI 分析', 'vi': 'Phân tích AI'  },
  // ... 其余 9 个
};
```

UI 上：
- `<CategoryFilter />` 渲染时下拉项使用 `CATEGORY_LABEL[slug][currentLocale]` 显示
- `<ResultSummary />` 等地方对 category 的引用统一用 `slug`
- 旧 raw 标签的兼容期：v1 上线后保留 30 天，再下掉 raw 字段

---

## 四、UI/UX 设计（v2 修订）

### 4.1 搜索框（BlogSearch）

| 属性 | 说明 |
|------|------|
| 组件 | `<input type="text">` + Lucide `Search` 图标 |
| 样式 | 圆角边框，全宽，与页面标题对齐 |
| Placeholder | i18n: `blog.searchPlaceholder` |
| **auto-focus** | **v2 新增**：`useEffect(() => inputRef.current?.focus(), [])`，键盘用户无需 Tab |
| **aria-label** | **v2 新增**：`blog.searchAriaLabel` |
| 清除按钮 | 有内容时显示 `X` 图标，点击清空（清空时 auto-focus 不丢） |
| 图标 | 左侧 `Search` 图标，右侧条件 `X` 图标 |

### 4.2 筛选栏（v2 重大修订）

**Tag 筛选 — 两条规则**：
1. **Top 12 by frequency**：从 557 个 tag 中取出现频次最高 12 个，作为 chip
2. **其余折叠**：剩余 545 个进 "More tags" 下拉（shadcn `Popover` + `Command` 组件，可搜索 + 多选）
3. **排序键**：frequency 优先 → 同频时按最近 30 天出现次数（让热门 + 新鲜的 tag 优先显示）

```ts
function selectTopTags(posts: BlogMeta[], n = 12): string[] {
  const counts = new Map<string, number>();
  const recent = new Map<string, number>();
  const now = Date.now();
  for (const p of posts) {
    for (const t of p.tags) {
      counts.set(t, (counts.get(t) ?? 0) + 1);
      if (now - new Date(p.date).getTime() < 30 * 86400_000) {
        recent.set(t, (recent.get(t) ?? 0) + 1);
      }
    }
  }
  return [...counts.entries()]
    .sort((a, b) => (b[1] - a[1]) || ((recent.get(b[0]) ?? 0) - (recent.get(a[0]) ?? 0)))
    .slice(0, n)
    .map(([t]) => t);
}
```

**Category 筛选**：
- 装 shadcn `Select` 组件：`npx shadcn@latest add select`
- 选项用 `CATEGORY_LABEL[slug][currentLocale]` 显示
- 默认值：i18n key `blog.allCategories`（如 "全部分类" / "All categories"）

### 4.3 结果区域

| 状态 | UI | v2 修订 |
|------|-----|---|
| 正常 | "找到 X 篇文章" + 文章 grid | 文本用 i18n + 数字用 `Intl.NumberFormat` |
| 空结果 | 居中图标 + i18n 文案 + 清除按钮 | **v2**：清除按钮一次性清空 query+tags+category；保留滚动位置 |
| 加载中 | 实际上几乎不出现（已预加载） | 保留以备未来分页 |
| **键盘焦点** | **v2 新增**：搜索框/筛选变更后，结果区 `tabindex="-1"` + `scrollIntoView({ block: 'nearest' })` | 避免结果更新时位置漂移 |

---

## 五、i18n 方案

### 5.1 新增 Translation Keys（v2 修订：8 个 key，结构稳定）

在 5 个语言的 `translation.json` 中均需添加：

```json
{
  "blog": {
    "indexTitle": "博客",
    "indexDesc": "阅读最新文章",
    "searchPlaceholder": "搜索文章...",
    "searchAriaLabel": "搜索博客文章",     // v2 新增
    "resultsCount": "找到 {{count}} 篇文章", // 用 Intl.NumberFormat
    "noResults": "未找到相关文章",
    "noResultsHint": "尝试其他关键词或清除筛选条件",
    "clearAll": "清除所有筛选",              // v2 新增（替代 clearSearch）
    "moreTags": "更多标签 ({{count}})",        // v2 新增
    "allCategories": "全部分类"
  }
}
```

### 5.2 各语言翻译对照（v2 修订）

| Key | en | zh-Hans | zh-Hant | ja | vi |
|-----|-----|---------|---------|-----|-----|
| searchPlaceholder | Search articles... | 搜索文章... | 搜尋文章... | 記事を検索... | Tìm kiếm bài viết... |
| searchAriaLabel | Search blog posts | 搜索博客文章 | 搜尋部落格文章 | ブログ記事を検索 | Tìm kiếm bài viết trên blog |
| resultsCount | Found {{count}} articles | 找到 {{count}} 篇文章 | 找到 {{count}} 篇文章 | {{count}} 件の記事が見つかりました | Tìm thấy {{count}} bài viết |
| noResults | No articles found | 未找到相关文章 | 未找到相關文章 | 記事が見つかりませんでした | Không tìm thấy bài viết nào |
| noResultsHint | Try different keywords or clear filters | 尝试其他关键词或清除筛选条件 | 嘗試其他關鍵詞或清除篩選條件 | 別のキーワードを試すか、フィルターをクリアしてください | Thử từ khóa khác hoặc xóa bộ lọc |
| clearAll | Clear all filters | 清除所有筛选 | 清除所有篩選 | すべてのフィルターをクリア | Xóa tất cả bộ lọc |
| moreTags | More tags ({{count}}) | 更多标签（{{count}}） | 更多標籤（{{count}}） | その他のタグ（{{count}}） | Thêm thẻ ({{count}}) |
| allCategories | All categories | 全部分类 | 全部分類 | すべてのカテゴリ | Tất cả danh mục |

> **en 是 source of truth**（`i18n-keys.test.ts` 强制），所有其它语言必须 1:1 对齐。

---

## 六、搜索算法（v2 修订：tag/category 走 slug）

```ts
const matchesQuery = (post: BlogMeta, query: string, locale: SupportedLocale): boolean => {
  if (!query.trim()) return true;

  const q = query.toLowerCase();
  const title = localizeText(post.title, locale).toLowerCase();
  const desc = localizeText(post.description, locale).toLowerCase();
  // tag 和 author 是英文原文，跨语言直接匹配
  const tags = post.tags.join(' ').toLowerCase();
  const author = post.author.toLowerCase();

  return [title, desc, tags, author].some(field => field.includes(q));
};
```

### 多语言匹配说明

- `title` / `description`：使用当前 `locale` 本地化后的文本搜索
- `tags` / `author`：英文原文，跨语言直接匹配
- `categories`：v2 已统一为英文 slug，**不再混合中文**（见 §3.5）

---

## 七、URL 状态同步（继续推迟到 v2）

将搜索状态同步到 URL，支持分享链接：

```
/blog?q=AI+Agent&tag=MCP&category=Deep+Dive
```

实现方式（v2 落地，不在 v1 范围）：

```tsx
const [searchParams, setSearchParams] = useSearchParams();

useEffect(() => {
  setSearchParams({
    ...(searchQuery && { q: searchQuery }),
    ...(selectedTags.size > 0 && { tag: [...selectedTags].join(',') }),
    ...(selectedCategory !== 'all' && { category: selectedCategory }),
  }, { replace: true });
}, [searchQuery, selectedTags, selectedCategory]);
```

**v1 不实现**：避免首次实现过载；v1 先证明搜索价值。

---

## 八、测试计划（v2 修订）

| 测试点 | 验证方式 | v2 修订 |
|--------|----------|--------|
| 搜索框输入 → 结果实时过滤 | 手动测试 | 验证 150ms 内响应 |
| 清空搜索 → 恢复全部 81 篇文章 | 手动测试 | — |
| **Top-12 tag chip 渲染** | **手动测试** | **v2 新增**：只显示 12 个，"More tags" 折叠菜单可搜索 |
| **单选 tag chip → 立即筛选** | **手动测试** | — |
| **多选 tag chip → AND 关系** | **手动测试** | — |
| **组合搜索（关键词 + tag + category）** | 手动测试 | 三种筛选 AND 组合 |
| **空结果状态显示** | 手动测试 | 验证"清除所有筛选"按钮一键还原 |
| **5 种语言切换 → placeholder / 文案正确** | 手动测试 | 验证 searchAriaLabel、moreTags 等 v2 新增 key |
| **categories 显示用 i18n label** | 手动测试 | **v2 新增**：英文 locale 显示 "Deep Dive"，中文显示 "深度分析" |
| **auto-focus 搜索框** | 手动测试 | **v2 新增**：进入页面无需 Tab 即可输入 |
| 81 篇文章全部可搜索到（随机抽样） | 手动测试 | — |
| 防抖 150ms | 手动测试 | 快速连打不卡顿 |
| **i18n key parity 测试** | **自动跑 `npm test`** | **v2 强化**：5 个翻译文件必须 1:1 |
| **TypeScript 编译无错** | **自动跑 `npm run build:dev`** | **v2 强化**：保证 `BlogPost.categories` 类型健全 |

---

## 九、Implementation Task Breakdown（v2 修订：P0 任务前置）

| # | Task | 依赖 | 文件 | 优先级 |
|---|------|------|------|--------|
| 1 | **类型与数据规整**：补 `BlogPost.categories` + 修 `build-blog.js` + 写 `blog-categories.ts` | — | `site.ts`, `build-blog.js`, `src/lib/blog-categories.ts` | **P0** |
| 2 | 装 shadcn `Select` 组件 | — | `src/components/ui/select.tsx` | **P0** |
| 3 | 添加 8 个 i18n keys 到 5 个翻译文件（`en` 先） | T1 | `src/locales/*/translation.json` | **P0** |
| 4 | 创建 `useDebouncedValue(150ms)` hook | — | `src/hooks/useDebouncedValue.ts` | P0 |
| 5 | 跑 `selectTopTags(posts, 12)` 验证（console.log） | T1 | — | P0（验证性） |
| 6 | 创建 `BlogSearch` 组件（含 auto-focus） | T3, T4 | `src/components/blog/BlogSearch.tsx` | P0 |
| 7 | 创建 `TagFilterBar` 组件（Top-12 chip + More 下拉） | T3, T5 | `src/components/blog/TagFilterBar.tsx` | P0 |
| 8 | 创建 `CategoryFilter` 组件（shadcn Select + i18n label） | T2, T3 | `src/components/blog/CategoryFilter.tsx` | P0 |
| 9 | 重构 `BlogIndex` 集成搜索 + 筛选 + 滚动位置保持 | T1–T8 | `src/pages/BlogIndex.tsx` | P0 |
| 10 | 端到端验证（手动 + 跑 `npm test`） | T9 | — | P0 |
| 11 | （v2）URL 状态同步 | T9 | `src/pages/BlogIndex.tsx` | P2 |
| 12 | （v2）高亮匹配词 | T9 | `src/components/blog/BlogSearch.tsx` | P3 |

---

## 十、风险与注意事项（v2 修订）

### 10.1 i18n Key Parity
- `src/locales/i18n-keys.test.ts` 会强制 5 语言 key 一致（`en` 为基准）
- v1 新增 8 个 key 必须在 **所有 5 个** 翻译文件中同步添加
- **v2 强化**：CI 必须跑这个测试，**失败阻断 merge**

### 10.2 shadcn/ui 组件
- 方案中使用了 `Badge`、`Select`、可能 `Popover`+`Command`
- 当前 `src/components/ui/` 只有 `badge/button/card/sonner/tooltip`
- **v1 必修**：`npx shadcn@latest add select`；Tag 折叠可考虑 `popover command`
- 装好后跑一遍 `npx shadcn@latest` 的 lint 检查

### 10.3 `categories` 类型与 build 脚本
- `BlogPost` 类型定义（`src/config/site.ts`）**无** `categories` 字段 → **v1 必修**
- `scripts/build-blog.js` line 77 `({ categories, ...post })` **会 strip** categories from blog-data.json → **v1 必修**（保留 categories）
- 规整策略：v1 上线时同步跑一次 `raw → slug` 映射脚本，老数据带 raw，新数据只带 slug

### 10.4 日期格式不一致
- 76 篇使用 `YYYY-MM-DD`，5 篇使用完整 ISO `T...Z` 格式
- v1 不涉及日期过滤；若未来需要，先用 `new Date(post.date)` 统一归一化

### 10.5 标签数量爆炸（v2 新增风险）
- 557 个 distinct tag 是真实风险
- Top-12 + 折叠只是 v1 缓解方案
- 长期方案：v2 引入 tag 治理（合并同义、停用孤儿、限制每篇 tag 数 ≤ 5）
- v1 接受"Top 12 显示热门 + 其余可搜"的折中

### 10.6 Categories 中英混杂（v2 新增风险）
- v1 必修：用 `blog-categories.ts` 映射表
- raw 字段保留 30 天做兼容
- 老文章 frontmatter 不强制改（v1 读 slug；v1 写新文章时用 slug）

### 10.7 搜索框 auto-focus 的副作用（v2 新增风险）
- 进入页面立即抢焦点可能影响屏幕阅读器
- **缓解**：仅在用户上次**没**主动滚动过页面时 auto-focus；或加 `prefers-reduced-motion` 兼容
- 简化决策：**v1 先 auto-focus**，v2 根据反馈再决定

---

## 十一、Non-Goals（v2 修订：明确不做）

- [ ] 服务端搜索
- [ ] 全文搜索（当前 `blog-meta.json` 不含 content 字段；可作 v3）
- [ ] 分页（81 篇全量展示）
- [ ] 搜索历史
- [ ] 高亮匹配词（v2 推迟到 P3）
- [ ] URL 状态同步（v2 推迟到 P2）
- [ ] 日期范围筛选
- [ ] Tag 治理（合并同义、停用孤儿）—— v2 推迟
- [ ] Categories 强制老文章改 frontmatter——v1 通过映射表兼容

---

## 十二、Rollout 策略（v2 新增）

| 阶段 | 行为 | 回滚 |
|---|---|---|
| 1. 准备（无 UI） | 补 `BlogPost.categories`、修 build 脚本、写 `blog-categories.ts`、加 i18n keys | 修类型回 git revert 即可；数据无破坏性 |
| 2. 灰度（feature flag） | 加 `?search=v1` query 控制是否启用新搜索 UI；默认 OFF | 关 flag 即回退 |
| 3. 全量 | 移除 flag，搜索 UI 始终启用 | git revert（数据准备已完成，回滚无副作用） |
| 4. 数据清理 | 30 天后下掉 raw `categories` 字段，删除兼容层 | — |

---

## 附录 A：v1 vs v2 关键变更对照

| 章节 | v1 | v2 | 理由 |
|------|----|----|------|
| §1.1 搜索字段 | title/desc/tags/categories/author | title/desc/tags/author | categories 已统一为英文 slug，不再作为搜索字段 |
| §3.1 必修项 | 4 项 | **9 项**（含类型、build 脚本、shadcn 组件） | 类型/数据/组件不全则 v1 无法 compile/run |
| §3.4 防抖 | 300ms | 150ms | 81 篇规模下 300ms 偏慢 |
| §3.5 数据规整 | 无 | 新增 §3.5（slug 映射） | categories 中英混杂是真实数据问题 |
| §4.1 搜索框 | 无 auto-focus | auto-focus + aria-label | 键盘可达性 |
| §4.2 Tag 筛选 | 全部聚合 | **Top-12 by frequency + 折叠** | 557 个 chip 不可用 |
| §4.3 空结果 | 仅提示 | 提示 + 一键清除 + 保留滚动 | UX 完整性 |
| §5.1 i18n keys | 8 个 | 8 个（重命名 `clearSearch → clearAll`，新增 `searchAriaLabel`/`moreTags`） | 与设计语义对齐 |
| §十 风险 | 4 项 | 7 项（新增 10.5/10.6/10.7） | 真实风险面 |
| §十一 Non-Goals | 7 项 | 9 项 | 明确推迟项的范围扩大 |
| §十二 Rollout | 无 | 4 阶段（准备/灰度/全量/清理） | 风险控制 |

---

## 附录 B：参考资料

- `src/lib/blog-data.ts`：`BlogDataSource` 单例 + `getPosts()` / `getPostBySlug()` / `getPostWithContent()`
- `src/lib/blog-meta.json`：13 KB 元数据（含 categories）
- `src/config/site.ts`：`BlogPost` 类型定义（v1 需补 `categories: string[]`）
- `scripts/build-blog.js`：扫描 `content/blog/` + 生成 `blog-data.json`/`blog-meta.json`
- `src/locales/i18n-keys.test.ts`：5 语言 key parity 测试
- [shadcn/ui Select 文档](https://ui.shadcn.com/docs/components/select)
- [shadcn/ui Command 文档](https://ui.shadcn.com/docs/components/command)（用于"More tags"折叠菜单）
