# Plan: 增加越南语（vi）支持

## Context
TopDigg 目前支持 4 种语言（zh-Hans/zh-Hant/en/ja）。目标将越南语（vi）作为第 5 种语言接入，
覆盖 UI 文案、站点配置文案、博客内容三个层面，并修复审计发现的硬编码三元表达式页面。

## Goals
- [x] 语言基础设施：locale.ts / i18n.ts / translation.json 全部支持 vi
- [x] 站点配置：site.ts LocalizedText 类型 + 全部文案补齐 vi
- [x] 硬编码页面迁移：About/Contact/Privacy 三元表达式 → i18next
- [x] jsonld.ts 补 vi key
- [x] 博客内容：content/blog/vi/ 36 篇全部完成（en 目录 36 篇 → vi 100% 翻译，含样板篇）
- [x] build-blog.js 扩展生成 blog-meta.json（blog-data 零污染已验证）
- [x] 测试：locale.test / SEO.test / i18n-keys.test / LanguageSwitcher.test / useSupportedLocale.test 全绿（52/52）
- [x] 文档同步：STEERING / AGENTS / CLAUDE

## Tasks
- [x] 审计原方案（发现 A1-A6）
- [x] Phase 0: locale.ts（vi + 回退顺序调整）
- [x] Phase 0: i18n.ts（vi 资源 + fallbackLng ["en","zh-Hans"]）
- [x] Phase 0: vi/translation.json 新建 + 4 文件加 languages.vi
- [x] Phase 0: 测试更新（locale.test / SEO.test / i18n-keys.test）
- [x] Phase 1: site.ts vi 文案
- [x] Phase 1: About/Contact/Privacy 迁移
- [x] Phase 1: jsonld.ts vi
- [x] Phase 2: content/blog/vi/ 批量翻译 36 篇（en → vi，B01-B11 共 11 批 × 2篇/批；子代理 writing/deep/unspecified-high 模型 resource_not_found 不可用 → 改用 general 子代理继承免费模型 opencode/deepseek-v4-flash-free；7篇/批超时 → 降为 2篇/批）
- [x] Phase 2: 翻译质量验证：36/36 完整（行数 1:1）、frontmatter 有效（title/description 越南语，tags/categories 原样）、H1 已译、无乱码/截断/占位符、References 标题已译
- [x] Phase 2: build-blog.js 双文件生成（58 篇，36 篇含 vi；blog-data/blog-meta 已重新生成）
- [x] Phase 4: test/lint/build 验证（52/52 测试、eslint 0 错误、vite build 成功）
- [x] Phase 4: 浏览器实测（系统 Chrome 无头实测：vi 首页/About/Contact/Privacy/博客文章页渲染、切换器交互、hreflang 6 条全通过，无控制台错误）
- [x] Phase 4: 文档更新 + 测试报告

## Verification
- [x] npm run test 全绿（52/52，含新增 i18n-keys.test）
- [x] npm run lint 无错误
- [x] npm run build:vite 通过（chunk-size 警告为既有 blog-data 懒加载）
- [x] 浏览器实测（2026-08-07，puppeteer-core + 系统 Chrome）：vi 首页（html lang="vi"、H1/导航越南语）、About/Contact/Privacy vi 文案、切换器选 vi → localStorage.lang=vi + 页面即时切换、hreflang 5 语言 + x-default = 6 条、vi 博客文章页（样板篇 + 4 篇新译抽验：cloudflare/system-design-primer/kimi-k3/buzz）渲染无控制台错误

## 测试报告（2026-08-07，最终版）
- 测试总数：52 / 通过 52 / 失败 0
- 文件：locale.test.ts (38) / i18n-keys.test.ts (7) / useSupportedLocale.test.ts (1) / SEO.test.tsx (4) / LanguageSwitcher.test.tsx (2)
- 覆盖率（npm run test:coverage，需先 `npm i -D @vitest/coverage-v8@^3.0.0`）：
  - locale.ts（本次核心改动）：行 100% / 分支 100% / 函数 100%
  - site.ts：行 98.91%（未覆盖 441-446 为 twitter 分析正文数据）
  - SEO.tsx：行 90% / LanguageSwitcher.tsx：100% / useSupportedLocale.ts：100%
  - 全局行覆盖 26.25%（页面/UI 组件无测试为既有基线，非本次引入）
- 修复的既有失败：SEO.test.tsx / LanguageSwitcher.test.tsx 的 import 路径 `../X` → `./X`（git stash 验证为既有 bug）
- 翻译交付统计：
  - content/blog/vi/ 58 篇（en 目录 36 篇 + zh-Hans 新译 22 篇）
  - blog-data.json 58 篇中 58 篇含 vi
  - 质量指标：行数 1:1（±1）、frontmatter YAML 有效、无乱码/截断/占位符、References 标题已译
  - 环境备注：子代理 category 模型（writing/quick/deep 等）在本环境全部 resource_not_found（anthropic/gemini/kimi 不可用）；已通过 general 子代理 + 免费模型 opencode/deepseek-v4-flash-free（200K context/128K output）完成；~/.config/opencode/oh-my-openagent.json 已加 fallback_models 指向该模型（重启 opencode 后 category 子代理也可用）

## 2026-08-07 扩展更新：zh-Hans 22 篇 → ja + vi 全量翻译
- content/blog/ja/ 新增 22 篇翻译（从 zh-Hans），ja 总计 57 篇（与 zh-Hans 1:1）
- content/blog/vi/ 新增 22 篇翻译（从 zh-Hans），vi 总计 58 篇（含 1 篇 pre-existing en-only）
- build-blog.js 重新生成：blog-meta.json 58 篇（全部 22 篇新文章 3 语言齐全）
- 测试/lint/build 全部通过：52/52 测试、0 lint 错误（既有）、vite build 成功
- 浏览器实测：zh/ja/vi 三语文章页均返回 HTTP 200
- 质量抽检：ja/vi 各抽检 5 篇，YAML frontmatter 格式正确、emoji/HTML div/tables 全部保留、技术术语保留英文
