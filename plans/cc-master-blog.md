# Plan: cc-master（nemori-ai/cc-master）深度解析博客（5 语言）

## Context

用户要求分析 GitHub 开源项目 `https://github.com/nemori-ai/cc-master`，把相关文档翻译成中文并归纳总结，生成详细易懂、可在 X 正确显示的 Markdown 文章，要求包含：核心思想、详细教程、项目说明、归纳总结的观点、设计哲学。中文版放 `content/blog/zh-Hans`，其他语言版本放对应目录（zh-Hant/en/ja/vi），最后 push 到远程仓库。

## Goals

- [ ] 中文主稿：`content/blog/zh-Hans/cc-master-analysis.md`（项目说明 + 核心思想 + 详细教程 + 设计哲学 + 观点归纳，≥300 行）
- [ ] 五个语言版本齐全且 slug/frontmatter 结构一致（zh-Hans/zh-Hant/en/ja/vi）
- [ ] 遵循 fde-guide 翻译惯例（frontmatter 本地化、代码块内注释可翻译、命令原样保留）
- [ ] `npm run build:blog` 通过
- [ ] push 到远程仓库

## Tasks

- [ ] 调研 cc-master 仓库（README、docs、结构、stars、license、package.json）
- [ ] 写中文主稿
- [ ] 并行翻译 zh-Hant/en/ja/vi
- [ ] 验证翻译质量（frontmatter 一致性、代码块完整性、无乱码）
- [ ] build:blog 验证
- [ ] 删除计划文件 + 更新 PLANS.md
- [ ] git add/commit/push

## Verification

- `npm run build:blog` 全绿
- 5 个语言文件存在且结构一致
- git push 成功
