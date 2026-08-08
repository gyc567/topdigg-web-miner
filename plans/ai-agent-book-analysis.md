# Plan: ai-agent-book 深度分析博客文章（5 语言）

## Context

用户要求分析 GitHub 仓库 https://github.com/bojieli/ai-agent-book（《深入理解 AI Agent：设计原理与工程实践》，李博杰著），把相关文档翻译成中文，归纳总结核心观点与结论，生成一篇小学生都能看懂的、能在 X 正确显示的 markdown 长文（含详细教程、项目说明、归纳总结的观点、设计哲学），并将文章以 5 种语言（zh-Hans / zh-Hant / en / ja / vi）放入 `content/blog/` 相应目录，最后 push 到远程仓库。

## Goals

- [ ] 完成 ai-agent-book 项目信息收集与分析（README / 引言 / 后记 / 学习建议）
- [ ] 撰写中文版文章 `content/blog/zh-Hans/ai-agent-book-analysis.md`（X 友好格式、小学生可读、含核心思想）
- [ ] 翻译生成 zh-Hant / en / ja / vi 版本到相应目录
- [ ] `npm run build:blog` 验证 5 个语言版本被正确解析
- [ ] git commit 并 push 到 origin

## Tasks

- [ ] 创建本计划并在 PLANS.md 建索引（本文件即产物）
- [ ] 收集仓库信息（README 全文、introduction.md、afterword.md、LEARNING.md）
- [ ] 撰写中文正文（项目说明 / 详细教程 / 归纳总结观点 / 设计哲学 / 核心思想）
- [ ] 生成 zh-Hant / en / ja / vi 四个翻译版本（同 slug）
- [ ] 运行 `npm run build:blog` 检查 `src/lib/blog-data.json` 是否包含新 slug 的 5 个 locale
- [ ] 检查 git diff 只包含新增文章与计划文件，commit 并 push

## Verification

- `npm run build:blog` 成功，blog-data.json 中 `ai-agent-book-analysis` 包含 zh-Hans/zh-Hant/en/ja/vi 五个 locale 的 title/description/content
- frontmatter 使用 YAML `---` 格式（gray-matter 可解析）
- `git push origin main` 成功
