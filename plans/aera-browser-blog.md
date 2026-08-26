# Plan: Aera Browser（getaera.app）深度解析博客（5 语言）

## Context
TrustMRR 上 Aera Browser（https://trustmrr.com/startup/aera-browser?ref=eric-kwok-b654e8）为 Chromium 本地优先自动浏览器：自然语言描述任务 → 定时在已登录的真实 Profile 执行 → MCP 集成。Stripe 验证 MRR $343 / 9 订阅 / ~1700 用户，2025-12 上线，定价 Free（自托管模型）+ Pro $20/月 + Ultra $200/月。需拆解其赚钱/变现模式、设计哲学、用户价值（$ / 月），输出微信公众号可发布长文，头尾带 product_url，回落至 content/ai-products 5 语言目录。

## Goals
- [ ] 产出 5 语言完整长文：zh-Hans / zh-Hant / en / ja / vi，文件名 2026-08-26-aera-browser.md
- [ ] 覆盖：详细教程、项目说明、设计哲学、观点归纳、变现模式、核心用户分析（每用户 $/月）、风险与可复制建议
- [ ] 头尾嵌入 $product_url，frontmatter 含 product/pricing/metrics/sources，符合 build-ai-products 规范
- [ ] 本地 build 全绿（build:blog + build:ai-products + build:vite）后 push 到 gyc567/topdigg-web-miner

## Tasks
- [ ] 抓取并翻译 TrustMRR + getaera.app（首页/pricing/features/use-cases/security/faq/docs）核心信息
- [ ] 撰写 zh-Hans 主稿（300+ 行）
- [ ] 翻译并落盘 zh-Hant / en / ja / vi
- [ ] 执行 npm run build:ai-products + npm run build 验证
- [ ] git commit + push 到 origin main

## Verification
- `npm run build:ai-products` 生成 ai-products-data.json 含 3 products
- `npm run build` 全链路成功（blog + ai-products + sitemap + llms + vite + prerender）
- 5 语言文件存在且 frontmatter 校验通过
