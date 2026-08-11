# Plan: Promptless《Writing code was hard, actually》深度解析博客（5 语言）

## Context
Promptless（promptless.ai，AI 自动维护客户文档的工具）于 2026 年 7-8 月在工程社区传播了一篇短文《Writing code was hard, actually》——直接反驳"写代码从来不是难事"的流行观点。本文的核心是：三十年软件工程师薪资市场、数十亿美元训练成本、芯片级机器的存在本身，都是"写代码很难"的证据；它不是"AI 让代码变便宜了所以代码从来容易"，而是"AI 让最难的问题之一被部分自动化"。

要把这篇短文 + Promptless 产品形态一起，做成结构化深度解析（项目说明 + 详细教程 + 观点归纳 + 设计哲学），发到 5 种语言（zh-Hans / zh-Hant / en / ja / vi）。

## Goals
- [ ] 一篇 zh-Hans 主文，覆盖：项目说明 / 详细教程 / 观点归纳 / 设计哲学
- [ ] 同样结构化的内容用 zh-Hant / en / ja / vi 同步发布
- [ ] 所有文件 frontmatter 正确（YAML，`gray-matter` 可解析）
- [ ] `npm run build:blog` 通过，新文章出现在 `src/lib/blog-data.json`
- [ ] git commit + push 到 origin

## Tasks
- [ ] 创建计划文件并加入 PLANS.md 索引
- [ ] 撰写 zh-Hans 全文并写入 `content/blog/zh-Hans/writing-code-was-hard-actually-analysis.md`
- [ ] 翻译/改写为 zh-Hant、en、ja、vi
- [ ] 验证 frontmatter 与构建
- [ ] 提交并推送到远程
- [ ] 完工后删除计划文件 + 从 PLANS.md 移除条目

## Sources
- https://promptless.ai/blog/technical/writing-code-was-hard-actually
- https://promptless.ai/llms.txt
- https://promptless.ai/index.md
- https://promptless.ai/free-tools.md

## Verification
- `npm run build:blog` 解析 5 个新文件无报错
- `src/lib/blog-data.json` 包含 5 条新记录
- `git log -1` 显示提交；`git push origin main` 成功
- 完工后 `plans/promptless-writing-code-blog.md` 删除，`PLANS.md` 索引清理
