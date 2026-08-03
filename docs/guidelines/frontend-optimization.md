# 前端优化规范（Frontend Optimization Guideline）

> 适用范围：任何修改前端代码（React 组件、样式、布局、交互、SEO 渲染）的施工。
> 核心要求：**改前端要看着浏览器**——可视化验证优先，不能只做代码审查。

## 为什么要看着浏览器

静态代码审查无法发现以下问题：

- 布局错位、溢出、遮挡（CSS 实际渲染与预期不符）
- 交互失效（点击/滚动/悬停无响应或报错）
- 控制台报错、网络请求 404
- 多语言切换后内容缺失或乱码
- SEO 元数据渲染异常（title/description/JSON-LD）

## 强制流程

1. **启动本地服务**：`npm run dev` 或 `npx vite --port 8099 --strictPort`（tmux 后台运行，如 `new-session -d -s dev`）
2. **浏览器实测**：用 Playwright（headless Chromium）或开发浏览器打开受影响页面
3. **逐项验证**：
   - 目标路由返回 200（非 404）
   - H1/标题/正文正确渲染
   - 无控制台报错、无 404 资源
   - 交互行为符合预期
   - 4 语言版本（zh-Hans/zh-Hant/en/ja）逐一检查
4. **记录结果**：验证脚本输出 OK/FAIL，全部通过才算完成

## 本仓库已知的浏览器验证路径

- 博客文章页：`/blog/:slug?lang={zh-Hans|zh-Hant|en|ja}`
- Playwright EXE：
  `/Users/jie/Library/Caches/ms-playwright/chromium-1228/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing`
- NODE_PATH：`/Users/jie/.hermes/node/lib/node_modules/@playwright/cli/node_modules`（`require("playwright")`）

## 验收标准

- [ ] 页面 200 无 404
- [ ] 无 console 报错
- [ ] 布局/交互符合设计预期
- [ ] 4 语言均可正常渲染
- [ ] 改动不回归现有功能（回归页抽查）

## 例外

- 纯逻辑改动（不触碰 DOM/样式）：可仅做单测/类型检查，但需在 PR 说明"无前端渲染影响"
- 无法本地验证时（如广告 SW）：说明理由并由人工抽查线上
