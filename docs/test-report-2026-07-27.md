# 测试报告 — 步骤 3（死代码/依赖清理）

> 日期：2026-07-27 ｜ 范围：删除 43 个 ui 组件、6 个死代码文件、36 个依赖包、radix Toaster、react-query
> 结论：**全部通过，可提交**

## 测试结果汇总

| # | 测试项 | 方法 | 结果 |
|---|--------|------|------|
| 1 | TypeScript 类型检查 | `npx tsc --noEmit` | ✅ 0 错误（vite build 不做类型检查，此项独立验证） |
| 2 | 已删依赖残留引用 | grep 12 个已删包名 + 全部已删 radix 包 | ✅ src 零残留；radix 仅剩 react-slot / react-tooltip（button/tooltip 所需） |
| 3 | 依赖树完整性 | `npm ls --depth=0` | ✅ 无 missing / invalid / UNMET |
| 4 | 生产构建 | `npm run build` | ✅ 26 篇博客数据生成，构建 993ms 通过 |
| 5 | ESLint | `npx eslint src` | ✅ 无新增错误（剩余 21 errors 均为历史 `any` 类型问题，与清理前一致） |
| 6 | SPA 路由冒烟 | vite preview + curl 8 条路由 | ✅ 全部 200（含 /、/blog、/twitter、/columns/:id、/external-links、404 页） |
| 7 | twitter 分析 md 加载 | curl 4 篇 md（P0 修复的核心验证） | ✅ 全部 200（修复前 3 篇 404） |
| 8 | 关键静态资源 | curl robots.txt / favicon / knowledge-card.html / JS bundle | ✅ 全部 200 |
| 9 | bundle 内容 | 检查产物含正确 baseUrl | ✅ 含 topdigg.com |
| 10 | dev 服务器 | `npm run dev` + curl :8080 | ✅ 200，入口正常挂载 |

## 构建产物对比

| 指标 | 清理前 | 清理后 | 变化 |
|------|--------|--------|------|
| 源码行数 | 7,176 | 2,027 | **-72%** |
| CSS | 79.56 KB | 36.26 KB | **-54%** |
| JS | 830.68 KB | 781.86 KB | -6%（大头为 623KB blog-data.json，待步骤 4 代码分割） |
| 依赖包数 | ~90 | ~54 | -36 |
| ui 组件 | 48 | 5 | 仅保留 button/badge/card/tooltip/sonner |

## 已知遗留（非本次范围）

- Index/BlogPost/ColumnPage/SEO 等文件 21 个历史 `any` 类型 lint 错误
- blog-data.json 623KB 打进主 bundle（步骤 4 React.lazy 解决）
- npm audit 报告若干安全漏洞、browserslist 数据过期
