# Plan: T3 Code 深度解析博客（5 语言）

## Context
T3 Code（`pingdotgg/t3code`，GitHub 18k+ stars，MIT，开源"agent harness control surface"）是一个跨 5 家 agent provider（Codex / Claude / Cursor / Grok / OpenCode）的 Web + 桌面 + 移动端控制层。它用一条 Effect RPC WebSocket 让 web / Electron / React Native 三种客户端远程控制本地跑的 agent CLIs，并附带 event-sourced 编排、checkpoint（隐藏 git ref）、Tailscale / T3 Connect 远程隧道、Clerk OAuth 认证、Rust 资源监控等深度设计。

我们要把这条产品形态 + 架构 + 设计哲学，沉淀为一篇结构化深度解析，发布到 5 种语言（zh-Hans / zh-Hant / en / ja / vi）。

## Goals
- [ ] 一篇 zh-Hans 主文，覆盖：项目说明 / 详细教程 / 观点归纳 / 设计哲学
- [ ] 同样结构化的内容用 zh-Hant / en / ja / vi 同步发布
- [ ] 所有文件 frontmatter 正确（YAML，`gray-matter` 可解析）
- [ ] `npm run build:blog` 通过，新文章出现在 `src/lib/blog-data.json`
- [ ] git commit + push 到 origin

## Tasks
- [ ] 创建计划文件并加入 PLANS.md 索引
- [ ] 拉取来源资料（README、AGENTS.md、docs/user/*、docs/internals/*、apps/mobile/README）
- [ ] 撰写 zh-Hans 全文并写入 `content/blog/zh-Hans/t3code-analysis.md`
- [ ] 翻译/改写为 zh-Hant、en、ja、vi
- [ ] 验证 frontmatter 与构建
- [ ] 提交并推送到远程
- [ ] 完工后删除计划文件 + 从 PLANS.md 移除条目

## Sources
- https://github.com/pingdotgg/t3code
- https://raw.githubusercontent.com/pingdotgg/t3code/main/README.md
- https://raw.githubusercontent.com/pingdotgg/t3code/main/AGENTS.md
- https://raw.githubusercontent.com/pingdotgg/t3code/main/docs/user/install.md
- https://raw.githubusercontent.com/pingdotgg/t3code/main/docs/user/permission-modes.md
- https://raw.githubusercontent.com/pingdotgg/t3code/main/docs/user/remote-access.md
- https://raw.githubusercontent.com/pingdotgg/t3code/main/docs/user/source-control.md
- https://raw.githubusercontent.com/pingdotgg/t3code/main/docs/user/keybindings.md
- https://raw.githubusercontent.com/pingdotgg/t3code/main/docs/user/updating.md
- https://raw.githubusercontent.com/pingdotgg/t3code/main/docs/user/background-service.md
- https://raw.githubusercontent.com/pingdotgg/t3code/main/docs/user/thread-sidebar.md
- https://raw.githubusercontent.com/pingdotgg/t3code/main/docs/internals/overview.md
- https://raw.githubusercontent.com/pingdotgg/t3code/main/docs/internals/providers.md
- https://raw.githubusercontent.com/pingdotgg/t3code/main/docs/internals/connection-runtime.md
- https://raw.githubusercontent.com/pingdotgg/t3code/main/docs/internals/remote.md
- https://raw.githubusercontent.com/pingdotgg/t3code/main/docs/internals/t3-connect.md
- https://raw.githubusercontent.com/pingdotgg/t3code/main/docs/internals/environment-auth.md
- https://raw.githubusercontent.com/pingdotgg/t3code/main/docs/internals/server-updates.md
- https://raw.githubusercontent.com/pingdotgg/t3code/main/docs/internals/resource-telemetry.md
- https://raw.githubusercontent.com/pingdotgg/t3code/main/docs/internals/glossary.md
- https://raw.githubusercontent.com/pingdotgg/t3code/main/docs/internals/workspace-layout.md
- https://raw.githubusercontent.com/pingdotgg/t3code/main/docs/internals/ci.md
- https://raw.githubusercontent.com/pingdotgg/t3code/main/apps/mobile/README.md

## Verification
- `npm run build:blog` 解析 5 个新文件无报错
- `src/lib/blog-data.json` 包含 5 条新记录
- `git log -1` 显示提交；`git push origin main` 成功
- 完工后 `plans/t3code-blog.md` 删除，`PLANS.md` 索引清理
