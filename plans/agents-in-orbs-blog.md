# Plan: Ampcode "Agents in Orbs" 深度解析博客（5 语言）

## Context
Ampcode 于 2026-06-30 发布《Agents in Orbs》，宣布 Amp agent 可在远端的「Orb」机器里无人值守运行；配合 `amp -ox`、`amp sync`、TUI 命令面板、Web/插件等入口，把 agent 从「编辑器侧栏」释放到「无监督远程执行」。这是 Amp 团队继 2026-02《The Coding Agent Is Dead》之后的关键落地：把「模型想在你不在编辑器前时继续跑代码」的口号，变成一条可点击的产品形态。

我们要把这条产品演进 + 形态细节 + 设计哲学，沉淀为一篇结构化的深度解析，并按 TopDigg 现有博客规范发布到 5 种语言（zh-Hans / zh-Hant / en / ja / vi）。

## Goals
- [ ] 一篇 zh-Hans 主文，覆盖：项目说明 / 详细教程 / 观点归纳 / 设计哲学
- [ ] 同样的结构化内容用 zh-Hant / en / ja / vi 同步发布
- [ ] 所有文件 frontmatter 正确（YAML，`gray-matter` 可解析）
- [ ] `npm run build:blog` 通过，新文章出现在 `src/lib/blog-data.json`
- [ ] git commit + push 到 origin

## Tasks
- [ ] 创建计划文件并加入 PLANS.md 索引
- [ ] 拉取来源资料（agents-in-orbs 公告 / Coding Agent Is Dead 编辑文 / Orbs Manual / Size the Orbs of Production 尺寸表）
- [ ] 撰写 zh-Hans 全文并写入 `content/blog/zh-Hans/agents-in-orbs-analysis.md`
- [ ] 翻译/改写为 zh-Hant、en、ja、vi
- [ ] 验证 frontmatter 与构建
- [ ] 提交并推送到远程
- [ ] 完工后删除计划文件 + 从 PLANS.md 移除条目

## Sources
- https://ampcode.com/news/agents-in-orbs (2026-06-30 公告)
- https://ampcode.com/news/the-coding-agent-is-dead (2026-02-19 编辑文)
- https://ampcode.com/manual/orbs (Orbs 用户手册)
- https://ampcode.com/news/size-the-orbs-of-production (2026-08-07 价格表 a1.tiny/small/medium/large/xxlarge)
- https://ampcode.com/news/more-orb-sizes (2026-07-03 存储从 20GB → 40GB)

## Verification
- `npm run build:blog` 解析 5 个新文件无报错
- `src/lib/blog-data.json` 包含 5 条新记录
- `git log -1` 显示提交；`git push origin main` 成功
- 完工后 `plans/agents-in-orbs-blog.md` 删除，`PLANS.md` 索引清理
