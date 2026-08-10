# Plan: FDE Guide 深度解析博客（5 语言）

## Context

用户要求分析 **davidahmann/fde-guide**（GitHub 开源项目）——一个面向前向部署工程师（FDE）与 AI 工程师的**价值工程与生产架构指南**。材料来源：
1. 仓库 README（项目定位、三层深度、工程套件结构、10 个 agent 技能、业务流/行业画像）
2. `guide/README.md`（简明指南：FDE 职责、7 阶段交付循环、价值契约、机制选择、系统设计、受控切片、验证、运营与移交、现场学习）
3. `library/14-twelve-factors-ai-value-engineering.md`（AI 价值工程 12 因子：4 个硬门禁 + 0/1/2 评分）
4. `library/12-software-architecture-and-intelligence-selection.md`（机制选择表、混合系统设计、云原生基线、架构不可妥协项与反模式）
5. `examples/invoice-exception/README.md`（受控写入参考系统：模型提议 → 可信软件授权提交 → 真相源回读）

产出：一篇**详细、内容丰富、含核心思想**的博客文章，中文版放 `content/blog/zh-Hans/`，其余语言版本放对应目录（5 语言齐全）。文章必须包含：项目说明、核心思想、详细教程、设计哲学、归纳总结的观点。

## Goals

- [ ] 在 `content/blog/zh-Hans/fde-guide-analysis.md` 写入中文主版本
- [ ] 生成 zh-Hant / en / ja / vi 四个语言版本（同文件名，5 语言齐全，frontmatter 一致）
- [ ] 重新生成 `src/lib/blog-data.json`、`src/lib/blog-meta.json`、`public/sitemap.xml`、`public/llms.txt`
- [ ] 验证 frontmatter 解析与构建（`npm run build:blog` + `npm run build:sitemap` + `npm run build:llms`）
- [ ] commit + push 到远程仓库 origin/main

## Tasks

- [x] 创建计划文件并在 PLANS.md 建立索引
- [ ] 撰写 zh-Hans 主文章（项目说明 / 核心思想 / 详细教程 / 设计哲学 / 归纳总结）
- [ ] 翻译并撰写其余 4 语言版本（保持 frontmatter 一致、术语表一致）
- [ ] 运行构建脚本生成 blog-data / blog-meta / sitemap / llms.txt
- [ ] 验证构建与 frontmatter
- [ ] 提交并推送
- [ ] 删除计划文件、更新 PLANS.md

## Verification

- 5 个文件 frontmatter 可解析且 title/description 非空（zh-Hans/zh-Hant/en/ja/vi）
- `npm run build:blog` 退出码 0，且 blog-data.json 包含新文章（5 个 locale 均已合并）
- `npm run build:sitemap` 退出码 0，sitemap 包含 /blog/fde-guide-analysis
- `git push` 成功
