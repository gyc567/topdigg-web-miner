# Plan: Terminal-Bench 2.0 深度解析博客（5 语言）

## Context

用户要求分析 **Terminal-Bench 2.0**——一个在真实终端环境中执行的 agentic 软件工程基准。材料来源：
1. BenchLM 基准档案页（`benchlm.ai/benchmarks/terminal-bench-2`）：排行榜快照、评分说明
2. BenchLM 深度解析文章（`benchlm.ai/blog/posts/terminal-bench-2-agentic-benchmark`）：TB2 测什么、为什么重要、好分数含义、与其他基准搭配
3. 官方 tbench.ai 站点：任务示例（build-linux-kernel-qemu、crack-7z-hash、train-fasttext 等 6 个）、基准家族（TB1.0/2.0/2.1/TB3/Science/Challenges）、Stanford x Laude 合作背景

产出：一篇**详细、内容丰富、含核心思想**的博客文章，中文版放 `content/blog/zh-Hans/`，其余语言版本放对应目录（5 语言齐全）。

## Goals

- [ ] 在 `content/blog/zh-Hans/terminal-bench-2-analysis.md` 写入中文主版本
- [ ] 生成 zh-Hant / en / ja / vi 四个语言版本（同文件名，5 语言齐全）
- [ ] 重新生成 `src/lib/blog-data.json`、`src/lib/blog-meta.json`、`public/sitemap.xml`、`public/llms.txt`
- [ ] 验证 frontmatter 解析与构建（`npm run build:blog` + `npm run build:sitemap` + `npm run build:llms`）
- [ ] commit + push 到远程仓库 origin/main

## Tasks

- [x] 创建计划文件并在 PLANS.md 建立索引
- [ ] 撰写 zh-Hans 主文章（项目说明 / 核心思想 / 任务剖析 / 观点归纳 / 设计哲学）
- [ ] 翻译并撰写其余 4 语言版本（保持 frontmatter 一致、术语表一致）
- [ ] 运行构建脚本生成 blog-data / blog-meta / sitemap / llms.txt
- [ ] 验证构建与 frontmatter
- [ ] 提交并推送
- [ ] 删除计划文件、更新 PLANS.md

## Verification

- `node -e "const m=require('gray-matter'); ..."` 验证 5 个文件 frontmatter 可解析且 title/description 非空
- `npm run build:blog` 退出码 0，且 blog-data.json 包含新文章（5 个 locale：zh-Hans/zh-Hant/en/ja/vi 均已合并）
- `npm run build:sitemap` 退出码 0，sitemap 包含 /blog/terminal-bench-2-analysis
- `git push` 成功
