# TopDigg Web Miner - 修复与测试报告

**日期**：2026-07-28  
**提交**：`d751d82` (main)  
**测试环境**：macOS / ego-browser (Chromium) / 生产环境 `https://www.topdigg.com`

---

## 已修复的问题

### 1. i18n 标题/内容不一致
- **问题**：首页 `Index.tsx` SEO 标题和描述硬编码中文；Twitter 页面缺少非中文翻译 key，导致英文用户看到中文。
- **修复**：
  - 为所有 4 种语言补充 `home.seoTitle`、`home.seoDesc`。
  - 为所有 4 种语言补充 `pages.twitter.*`（title / subtitle / description / engagementRate / totalTweets / avgLikes / avgRetweets / noAnalyses / noAnalysesDesc）。
  - `Index.tsx` 改用 `t("home.seoTitle")` / `t("home.seoDesc")`。
  - `TwitterIndex.tsx` 指标标签改用 i18n key。

### 2. 语言选择器初始状态不同步 / 页面出现中英文混合
- **根因**：`LanguageInitializer` 使用 GeoIP 覆盖 i18next 的浏览器/URL 检测；同时全站多处使用不安全的 `i18n.language as SupportedLocale` 强制类型转换，当浏览器返回 `en-US`、`zh-CN` 等完整 locale 时会命中 fallback 回退到中文。
- **修复**：
  - 删除 `LanguageInitializer.tsx` 与 `useGeoLanguage.ts`，让 i18next LanguageDetector 独立负责检测（querystring → localStorage → navigator）。
  - 新增 `useSupportedLocale()` hook，统一封装 `normalizeLang(i18n.language)`。
  - 全站替换危险类型转换：`SiteHeader`、`Index`、`BlogIndex`、`BlogPost`、`ColumnPage`、`ExternalLinks`、`TwitterIndex`、`TwitterPost`。

### 3. Twitter 分析详情页 `<h1>` 为空
- **问题**：`TwitterPost.tsx` 用原始 `i18n.language` 作为 `analysis.title` 的 key，浏览器 locale 如 `en-US` 无法命中。
- **修复**：使用 `useSupportedLocale()` 获取规范化后的 locale。

### 4. 死代码与重复数据源
- **问题**：博客数据同时存在于 `content/blog/*.md`、`site.ts` 硬编码 `blog.posts`、`src/lib/blog-data.json`、以及未使用的 `blog-loader.ts` / `blog-fs.ts` / `blog-adapter.ts`。
- **修复**：
  - 删除 `src/lib/blog-loader.ts`、`src/lib/blog-fs.ts`、`src/lib/blog-adapter.ts`。
  - 删除 `src/config/site.ts` 中已废弃的 `blog.posts` 数组。
  - 保留 `src/lib/blog-data.json` 作为运行时唯一数据源（由 `scripts/build-blog.js` 生成）。

### 5. 路由未做代码分割
- **问题**：`App.tsx` 静态导入全部页面，首屏 JS 包含所有页面逻辑和完整的 `blog-data.json`。
- **修复**：路由级 `React.lazy` + `Suspense`。

### 6. `index.html` 默认元信息为 Lovable 模板占位
- **修复**：更新 title / description / author / og / twitter 为 TopDigg 品牌信息（合并远程已有的 favicon 链接）。

### 7. 与远程改进的集成
远程在并行推进中已完成的优化：
- 清理未使用的 shadcn 组件与未使用依赖（源码 -72%，CSS 产物 -54%）。
- 新增 `build:sitemap` 脚本与 `public/sitemap.xml`。
- 新增 Vercel SPA fallback 配置（`vercel.json`）。
- 上线 TopDigg Logo、favicon、og-image。
- 新增 Harper 文章。

本次合并保留了这些改进，并在此基础上叠加了 i18n 与 locale 规范化修复。

---

## 新增测试

### 测试框架配置
- `vitest.config.ts`：使用 `@vitejs/plugin-react-swc` + `jsdom` 环境。
- `src/test/setup.ts`：引入 `@testing-library/jest-dom` 断言。
- `package.json`：新增 `test` / `test:watch` / `test:coverage` 脚本及所需 devDependencies。

### 测试文件
| 文件 | 覆盖内容 |
|---|---|
| `src/lib/locale.test.ts` | `supportedLocales`、`defaultLocale`、`countryToLocale`、`normalizeLang`、`localizeText`、`withLangParam`、`ogLocaleMap`、`htmlLangMap` 的全部分支。 |
| `src/components/SEO.test.tsx` | title/description/canonical 渲染、hreflang 交替链接、noindex、JSON-LD 注入。 |
| `src/components/LanguageSwitcher.test.tsx` | 当前语言选中状态、切换语言时调用 `i18n.changeLanguage` 并写入 `localStorage`。 |
| `src/hooks/useSupportedLocale.test.ts` | 验证浏览器完整 locale（如 `en-US`）被规范化为支持的 `en`。 |

---

## 环境限制说明

当前会话环境 **没有 Node.js / npm**，因此：
- 无法执行 `npm install` 安装新增的测试依赖。
- 无法运行 `npm run test`、`npm run build`、`npm run lint`。
- 无法通过本地构建直接验证代码。

所有单元测试代码已按 Vitest + React Testing Library 标准编写；请在本地或 CI 中执行：

```bash
npm install
npm run test          # 运行测试
npm run test:coverage # 覆盖率报告
npm run build         # 构建验证
npm run lint          # 代码检查
```

---

## E2E 验证结果（生产环境）

使用 `/ego-browser` 对 `https://www.topdigg.com` 进行验证：

| 检查项 | 结果 | 备注 |
|---|---|---|
| 首页 `/` 加载 | 通过 | 内容正常渲染 |
| 首页 `/` 导航标签 | 通过 | 英文浏览器下显示英文 nav |
| 语言选择器默认值 | 通过 | 显示 `en` |
| `?lang=en` 首页 h1 | 通过 | `Leverage content and data to systematically find web traffic opportunities` |
| Twitter 列表 `/twitter?lang=en` | 通过 | 页面渲染正常 |
| Twitter 详情 `/twitter/AliAbdaal...?lang=en` h1 | 通过 | `Ali Abdaal Twitter Deep Analysis Report` |
| 404 页面 | 通过 | `Page not found \| TopDigg` |

### 仍存在的部署/缓存问题
- 直链访问时 `document.title` 有时仍显示 `topdigg-web-miner`（`index.html` 默认值），而非 React Helmet 更新后的值。
- 这一现象在不同时间点/不同页面表现不一致，推测与 Vercel 边缘缓存或部署同步有关；代码层面 `index.html` 已更新为 TopDigg 默认元信息。
- 由于生产环境为纯 CSR SPA，**SEO 爬虫可见性**问题（无 SSR/SSG）本质上无法通过前端代码完全解决；远程新增的 `sitemap.xml` 与 Vercel fallback 已缓解部分问题，但长期建议引入静态生成或 ISR。

---

## 运行测试的命令

```bash
npm install
npm run test
npm run test:coverage
npm run build
```

## 建议后续动作

1. 在本地/CI 运行测试套件，确认全部通过。
2. 检查测试覆盖率报告，对未覆盖的行补充测试。
3. 观察 Vercel 部署后 `index.html` 缓存是否刷新；如仍有问题，可配置 `Cache-Control` 或purge CDN。
4. 评估是否引入 Vite SSG / Next.js / ISR 以彻底解决搜索引擎可索引性问题。
