# Plan: awesome-agent-trading 生态深度解析博客（5 语言）

## Context

用户要求分析 GitHub 仓库 https://github.com/gyc567/awesome-agent-trading（AI Agent 交易精选清单），翻译相关文档为中文，归纳总结核心观点与结论，产出一篇**详细、内容丰富、含核心思想**的博客文章，格式需在 X（Twitter）上正确渲染，并包含：详细教程、项目说明、观点归纳、设计哲学。

## Goals

- [ ] 在 `content/blog/zh-Hans/awesome-agent-trading-analysis.md` 写入中文主版本
- [ ] 生成 zh-Hant / en / ja / vi 四个语言版本（同文件名，5 语言齐全）
- [ ] 重新生成 `src/lib/blog-data.json`、`src/lib/blog-meta.json`、`public/sitemap.xml`、`public/llms.txt`
- [ ] 验证 frontmatter 解析与构建（`npm run build:blog` + `npm run build:sitemap`）
- [ ] commit + push 到远程仓库 origin/main

## Tasks

- [ ] 创建计划文件并在 PLANS.md 建立索引
- [ ] 撰写 zh-Hans 主文章（项目说明 / 详细教程 / 观点归纳 / 设计哲学 / 核心思想）
- [ ] 翻译并撰写其余 4 语言版本（保持 frontmatter 一致、术语表一致）
- [ ] 运行构建脚本生成 blog-data / blog-meta / sitemap / llms.txt
- [ ] 验证构建与 frontmatter
- [ ] 提交并推送
- [ ] 删除计划文件、更新 PLANS.md

## Verification

- `node -e "const m=require('gray-matter'); ..."` 验证 5 个文件 frontmatter 可解析且 title/description 非空
- `npm run build:blog` 退出码 0，且 blog-data.json 包含新文章（5 个 locale）
- `npm run build:sitemap` 退出码 0，sitemap 包含 /blog/awesome-agent-trading-analysis
- `git push` 成功
