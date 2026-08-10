---
title: "Agents in Orbs 深度解析：当 agent 学会在你不在电脑前时自己跑代码——Amp 远程 Orb 实操教程、设计哲学与五个核心观点"
description: "基于 Amp 官方 2026-06-30 公告《Agents in Orbs》、2026-02-19 编辑文《The Coding Agent Is Dead》、Orbs 用户手册与 2026-08-07《Size the Orbs of Production》价格表，全文解析 Amp「Orb」形态的产品形态、技术细节与设计哲学。一文讲透：① Orb 是什么——一台承载 Amp agent 的 Debian 12 远程机器，billed by the minute，5 分钟空闲自动暂停；② 完整上手教程——Web/CLI `amp -ox`/TUI 命令面板/插件 `agent.createThread()` 四种入口、`amp sync <thread>` 双向同步、`--orb-size` 自选规格、`.agents/setup` 与 `.agents/resume` 仓库生命周期钩子、OIDC 联邦、Webhook 与 Portal；③ a1 五档规格与计费表（a1.tiny/small/medium/large/xxlarge，0.08/0.17/0.33/0.66/1.32 美元每小时）；④ 设计哲学——「把 agent 从编辑器侧栏里释放出来」「能力不是权威」「以结果为单位计价」「按需唤醒、用完即睡」「让 fan-out 不再受本地资源约束」；⑤ 五个核心观点：门槛消失释放并行潜能、无人值守成为默认形态、agent 与编辑器解绑、模型自驱交付提速、计费单位从座位到分钟。核心主张：模型越强、越不能把它锁在单台机器里；Orbs 是 Amp 给「agent 时代」给出的工程答案。"
date: "2026-08-10"
author: "TopDigg Research Team"
tags: ["Amp", "Agents in Orbs", "Coding Agent", "AI Agent", "Remote Agent", "Orb", "amp CLI", "amp -ox", "amp sync", "CLI Agent", "Debian 12", "OIDC", "Webhook", "Plugin", "TUI", "SaaS", "Ampcode", "DevOps"]
categories: ["Deep Dive"]
keywords: ["Agents in Orbs", "Amp Orb", "远程 agent", "无监督 agent", "amp -ox", "amp sync", "Orb 规格", "a1.tiny", "a1.small", "a1.medium", "a1.large", "a1.xxlarge", "按分钟计费", "Amp CLI", "ampcode", "agent 范式", "设计哲学", "Coding Agent Is Dead", "OIDC 联邦", "amp webhooks", "Orbs Manual"]
---

# Agents in Orbs 深度解析：当 agent 学会在你不在电脑前时自己跑代码——Amp 远程 Orb 实操教程、设计哲学与五个核心观点

> 核心思想：**Agents in Orbs 是 Amp 给「agent 不再被锁在编辑器侧栏里」这条口号做出的工程回答——一台能跑 Amp agent 的远程机器（Debian 12），billed by the minute，5 分钟空闲自动暂停，用 Web/CLI/TUI/插件四种入口随时唤醒，用 `amp sync` 与本地双向同步，把 fan-out 并行调度的资源约束从「你的笔记本」释放到「云端按需的虚拟机舰队」。** 2026-06-30 发布的这条产品形态，不是 Amp 加了一个新功能，而是 Amp 完成了 2026-02《The Coding Agent Is Dead》的关键一步：把「模型想在你不在编辑器前时继续跑代码」的判断，变成一条可点击、可计费、可暂停、可观测的产品形态。它的设计哲学可以压缩成五句话——**把 agent 从编辑器侧栏里释放出来；能力不等于权威；以结果而非座位为单位计价；按需唤醒、用完即睡；让 fan-out 不再受本地资源约束。**

---

## 一、项目说明

### 1.1 它是什么？

本文解析的是 Amp 团队 2026-06-30 发布的公告《Agents in Orbs》（[ampcode.com/news/agents-in-orbs](https://ampcode.com/news/agents-in-orbs)）——一条把 Amp agent 搬出编辑器、搬出本地笔记本、搬进按需远程机器的产品形态。

它不是「给 Amp 加一个新功能」，而是 Amp 在 2026-02-19 编辑文《The Coding Agent Is Dead》（[ampcode.com/news/the-coding-agent-is-dead](https://ampcode.com/news/the-coding-agent-is-dead)）里立下的承诺：

> "These models no longer need the hand-holding and really want to kick off their training wheels. They want to write code and run even when you're not sitting in front of your editor. It's time to see what they can do without supervision."

——把这条口号变成产品形态，就是 Agents in Orbs。

### 1.2 一句话概括形态

**Orb 是一台能跑 Amp agent 的远程机器**：Debian 12 系统、预先装好 `gh`、`amp`、git、SSH、tmux、Bun、Node.js、Python、ripgrep 等常用工具；一个 Amp 线程（thread）启动时克隆你的项目仓库，预装你设置的 secrets 与环境变量，让 agent 在里面 24×7 无人值守地跑；按分钟计费，5 分钟空闲自动暂停，归档即停。

四件事把它和「在你的笔记本里跑的 agent」区分开：

1. **不在你的机器上**：agent 跑在云端 Debian 12 沙箱里，与你的本机完全隔离，资源消耗不挤占你的 CPU/内存。
2. **与本地接口完全一致**：用 Web UI、CLI、TUI、插件都可以远程控制它；你可以审阅 diff、浏览文件、打开一个共享 tmux 的终端。
3. **按需唤醒、用完即睡**：从空闲起 5 分钟后自动暂停，归档 thread 立即暂停；billed by the minute，暂停不花钱。
4. **可任意 fan-out**：本地一台机器跑不了 8 个并行 agent，但云端可以；这是 Amp 团队重点想让你意识到的「门槛消失后带来的范式转变」。

### 1.3 关键事实

- **发布时间**：2026-06-30（公告《Agents in Orbs》）；同源早期编辑文 2026-02-19（《The Coding Agent Is Dead》）；Orbs 用户手册见 [ampcode.com/manual/orbs](https://ampcode.com/manual/orbs)。
- **底层系统**：Orb 跑 Debian 12，已预装 `gh`（已认证）、`amp`（已认证）、git、SSH、tmux、ffmpeg、ImageMagick、vim、jq、fzf、unzip、zstd、lsof、websocat、ripgrep、Bun、Node.js、npm、pnpm、Yarn、Python、pip、agent-browser 等。
- **计费单位**：按分钟（billed by the minute）；暂停不花钱。
- **自动暂停**：5 分钟空闲后自动暂停（原 15 分钟，2026-08-07 缩短为 5 分钟）；thread 归档立即暂停；无需手动暂停。
- **启动优化**：同项目其他成员近期启动过 orb 时，新 orb 启动时间显著缩短。
- **价格档位**（[2026-08-07《Size the Orbs of Production》](https://ampcode.com/news/size-the-orbs-of-production)）：
  - `a1.tiny`：1 CPU · 2 GB 内存 · **$0.08/小时**
  - `a1.small`：2 CPU · 4 GB 内存 · **$0.17/小时**
  - `a1.medium`：4 CPU · 8 GB 内存 · **$0.33/小时**（2026-08-07 新增，比旧 `a0.medium` 便宜 50%）
  - `a1.large`：8 CPU · 16 GB 内存 · **$0.66/小时**
  - `a1.xxlarge`：16 CPU · 32 GB 内存 · **$1.32/小时**
  - 企业版 workspace 价格上浮 50%；Megawatt 订阅个人项目默认 `a1.small`。
- **存储**：2026-07-03《More Orb Sizes》将存储从 20 GB 翻倍到 40 GB，不涨价（[ampcode.com/news/more-orb-sizes](https://ampcode.com/news/more-orb-sizes)）。
- **入口**：Web（[ampcode.com](https://ampcode.com/)）→ Create New Thread；CLI `amp -ox`；TUI 命令面板 `thread: new in orb`；插件 `agent.createThread()`。
- **同步命令**：`amp sync <thread>` 把 orb 的改动镜像到本地，agent 在云端继续跑。
- **生命周期钩子**：仓库内 `.agents/setup`（准备阶段）、`.agents/resume`（恢复阶段，最长阻塞 10 秒）；服务声明 `.amp/services.yaml`；portal 描述 `.amp/portals/*.json`。
- **安全/集成**：可签发短时 OIDC token 联邦 Google Cloud / Tailscale / AWS；插件可注册 webhook（外部事件唤醒 paused orb），处理超时 30 秒，至少一次投递、10/分钟限流、单 endpoint 100 事件排队；任何 Git 主机都支持（私有仓可通过 `GIT_CONFIG_*` 环境变量注入凭据）。
- **Git 签名**：可在个人设置里启用「Sign Git commits in orbs」，项目需使用 Thread Creator 作为 Orb Commit Author。

### 1.4 它解决的问题

「Agents in Orbs」要解决的不是「agent 怎么跑」，而是「怎么让 agent 在你不在电脑前时把活干完」。本地跑 agent 的三大限制被 Orb 一并解掉：

1. **本机资源挤兑**：你正在跑 8 个并行 agent？风扇狂转、电量见底、IDE 卡顿。Amp 在公告里直接点了这条——「launch a group of agents to investigate eight different bugs independently when there are no local resource clashes to worry about」。Orb 把这条冲突从你的笔记本搬到了云端。
2. **时间维度的限制**：本地 agent 跟着你的工作日走——你离开电脑、它就停了；时区切换、跨国协作、夜晚编译都被你「不在」这件事卡住。Orb 24×7 跑，billed by the minute，没人在也不浪费钱（5 分钟空闲就睡）。
3. **把 agent 当 ticket 用而不是当工具用**：Amp 团队反复在公告里强调这一点——「Why not turn a bug report into an agent and an investigation instead of a ticket? Why not manage the agent and its results instead of the ticket?」Orb 让 agent 可以脱离 ticket 进入持续运营状态——一个 webhook、一个 portal、一个 OIDC 联邦的 agent，从今往后都「活着」。

---

## 二、详细教程：从 0 到 1 启动你的第一个 Orb agent

这一节按「准备 → 启动 → 控制 → 同步 → 进阶」五步走，每一步都给你可拷贝的命令、最小可运行示例与注意事项。来源：[ampcode.com/manual/orbs](https://ampcode.com/manual/orbs)。

### 2.1 第 1 步：选入口并启动一个 Orb 线程

Orb 支持四种入口，挑一种适合你工作流的。

**入口 A：Web 控制台**

打开 [ampcode.com](https://ampcode.com/)，点 **Create New Thread**，选一个项目（Project），输入 prompt，提交。Amp 会自动为你 spawn 一个新的 orb、克隆仓库、跑 `.agents/setup`、启动 agent。

**入口 B：CLI（最常用的形态）**

```bash
# 在项目目录下：
amp -ox "Investigate why the latest CI run on 'main' failed"
```

这是公告里反复示范的形态——和你原本用 `amp -x` 启本地 agent 几乎一模一样，只是把 `-x` 换成 `-ox`（orb execute）。带默认项目规格；如果要指定规格：

```bash
amp -ox "your prompt" --orb-size a1.small
```

**入口 C：Amp TUI 命令面板**

在 TUI 里打开命令面板，搜 `thread: new in orb` 回车；选项目、输 prompt、回车。优势是你可以继续留在原本的 terminal workflow 里。

**入口 D：插件**

```ts
await amp.createThread({
  prompt: 'Investigate flaky tests',
  orb: true,
})
```

适用场景：CI 失败自动触发一个 orb agent 调查；webhook 处理器里启动 agent；批处理脚本里 fan-out。

### 2.2 第 2 步：审阅改动与浏览文件（无需先同步）

Orb 线程里有两个常用面板：

1. **Review 面板**：看 agent 改动的 diff；逐文件检查；可拒绝、可接受；不需要先把改动拉到本地。
2. **File Browser 面板**：直接浏览 orb 上的整个仓库，包括 agent 改的、没改的、临时文件、生成产物。

这意味着你审 PR 的方式可以彻底脱离「先 git clone 到本地」的步骤——你审 orb，agent 继续在 orb 里跑下一轮。

### 2.3 第 3 步：用终端协作（共享 tmux）

打开 orb 线程的 Terminal 面板，你就进入一个**与 agent 共享的 tmux 会话**：

- 文件系统是同一份（orb 的工作副本），你在终端里改的文件，agent 立刻能看到。
- 你可以装依赖、跑测试、看进程、写脚本、改本地配置——一切与本地开发无异。
- agent 也能看到你终端里的输出——这意味着「我在 orb 里开终端跑 build agent 一起看 log」这种协作方式天然成立。

这是 Orb 形态里最容易被低估的设计：**它不强迫 agent 和人在两台机器上各干各的——它给了你一个共享 shell 会话作为协作面。**

### 2.4 第 4 步：把改动拉回本地（`amp sync`）

你想本地继续工作时：

```bash
amp sync <thread>
```

`<thread>` 可以是 thread URL，也可以是 thread ID。`amp sync` 会把 orb 工作副本里的所有改动**镜像到你的本地 checkout**，agent 在云端继续它的工作。本地与云端是双向的，但要注意：

- 在同一文件上不要同时在本地和 orb 里改——后写覆盖先写。
- 想把本地改动推回 orb？直接在 Terminal 面板里编辑、commit、push 就行（tmux 会话共享文件系统）。

### 2.5 第 5 步：进阶玩法

#### 2.5.1 仓库生命周期钩子

在仓库根目录创建两个 shell 脚本，Amp 会按下面的时机自动跑：

| 文件 | 时机 | 阻塞策略 | 日志 |
|---|---|---|---|
| `.agents/setup` | 准备 orb 状态时，从 repo root 运行 | 同步阻塞 | `/home/user/.cache/amp/logs/setup.log` |
| `.agents/resume` | 已存在的 orb 恢复后、agent 继续工作前 | 最多阻塞 10 秒；超时后继续 | `/home/user/.cache/amp/logs/resume.log` |

最小 `.agents/setup`：

```bash
#!/usr/bin/env bash
set -euo pipefail

corepack enable
pnpm install --frozen-lockfile
[ -f .env.local ] || cp -- .env.example .env.local
```

最小 `.agents/resume`（**只放快速幂等修复工作**，不要在这里装依赖）：

```bash
#!/usr/bin/env bash
set -euo pipefail

# Fast, idempotent repair work only. Do not install dependencies here.
mkdir -p .amp
date > .amp/resume-last-ran.txt
```

两个脚本都要 `chmod +x`，并 commit。

> **关键规则**：`.agents/resume` 必须保持轻量——它的设计目标就是「10 秒内完成、不阻塞 agent 继续」。如果你需要「agent 重启后跑一遍全量迁移」，请放进 `.agents/setup`，并在 `.agents/resume` 里只做「上次跑到哪了、是否能继续」的检查。

#### 2.5.2 长生命周期服务与 Portal

在仓库里声明服务，让 orb 启动时跑起来并暴露 portal URL：

`.amp/services.yaml`：

```yaml
services:
  dev:
    command: pnpm dev
    ports: [5173]
```

`.amp/portals/dev.json`：

```json
{
  "title": "Dev Server",
  "links": [
    { "url": "http://localhost:5173", "note": "Local dev server" }
  ]
}
```

portal 启动后，Amp 会在 thread UI 里给一个 tab 链接，让你能直接在浏览器里看 dev server（不需要本地跑，也不需要 SSH 隧道）。

#### 2.5.3 OIDC 联邦（短时 token 替代长寿命凭据）

不要把 Google Cloud / AWS / Tailscale 的 service account key 直接塞进 project secrets——改用 OIDC：

```bash
amp orb id-token --audience my-service
```

token 里带有 workspace / project / user / thread 身份，对方服务用这个身份做联邦即可。完整配方见 [OIDC from Orbs](https://ampcode.com/manual/orbs/oidc)。

#### 2.5.4 Webhook：让外部事件唤醒 paused orb

插件里注册 webhook，让外部服务（如 GitHub）唤醒 paused orb：

```ts
const { url } = await amp.createWebhook({
  key: 'github-events',
  headers: ['x-hub-signature-256'],
  handler: async (event, ctx) => {
    await verifyAndApply(
      event.id,
      event.body,
      event.headers['x-hub-signature-256'],
      ctx.signal,
    )
  },
})
```

要点：

- **HTTP 202 = 入队成功 ≠ 处理完成**。
- **至少一次投递**——用 `event.id` 做幂等键。
- 处理超时 30 秒；超时前把 `ctx.signal` 传给可取消的网络调用。
- 限流：burst 10 事件，10/分钟 refill，超 100 事件排队返 429。
- 请求体上限 1 MB。
- **URL 当密码对待**——不要 commit、不要贴进 thread message。
- **Amp 不替你验签**——所有签名校验都在 handler 里做。

#### 2.5.5 私有仓 / 自托管 Git

- **GitHub 私有仓**：走 [GitHub connection](https://ampcode.com/settings/integrations)，无需额外配置。
- **其他 Git 主机（GitLab / Bitbucket / 自托管）**：通过 secrets 注入凭据。Git 会读 `GIT_CONFIG_*` 环境变量，所以一条 url 重写就能完成认证：

```
GIT_CONFIG_COUNT=1
GIT_CONFIG_KEY_0=url.https://USERNAME:TOKEN@gitlab.com/.insteadOf
GIT_CONFIG_VALUE_0=https://gitlab.com/
```

把含 TOKEN 的那条存在 secret 里，不要 commit。

#### 2.5.6 Git 签名提交

需要 orb 里出 signed commit？两步：

1. 个人设置里开「[Sign Git commits in orbs](https://ampcode.com/settings/keys#signing-keys)」。
2. 项目的 Orb Commit Author 设为 Thread Creator。

否则 orb 里的 commit 会用 orb 自己的临时身份签名，你的本地 git 会因为 unknown signer 拒绝接受。

#### 2.5.7 选 Orb 规格的实战经验

公告里没明说，但综合 [Size the Orbs of Production](https://ampcode.com/news/size-the-orbs-of-production) 与典型 workload：

| 场景 | 推荐规格 | 原因 |
|---|---|---|
| 简单脚手架 / 单文件改动 | `a1.tiny` | 1 CPU 足够，省钱 |
| 一般项目 fan-out（默认） | `a1.small` | Megawatt 订阅默认；4 GB 内存跑大多数 Node/Python 项目不卡 |
| 跑测试套件 + 编译前端 | `a1.medium` | 4 CPU 跑并行 test、8 GB 内存留给 webpack/vite |
| 重型 ML / 编译 Rust | `a1.large` | 16 GB 内存避免 OOM |
| 大仓库全量 CI / 复杂构建 | `a1.xxlarge` | 32 GB 内存应付 monorepo |

进阶用法：

```bash
# 让 agent 自己挑规格（在 prompt 里说清楚）
amp -ox "Run full E2E suite. Use a1.large if available — tests are memory-heavy."

# per-thread 指定规格
amp -ox "Quick lint check" --orb-size a1.tiny
```

Amp 还支持让 agent 自己「开更小或更大的 orb」——和主 agent 对话时说「use a smaller orb for this」即可，sub-agent 会按需降配。

### 2.6 第 6 步：归档与停用

- 想停 orb？**归档 thread**——orb 立即暂停。
- 想恢复？在 thread 列表里点 resume；`.agents/resume` 会被跑（最多 10 秒），然后 agent 继续。
- 想彻底删？删除 thread；绑定的 webhook URL 返 404。

### 2.7 5 分钟空闲暂停机制

Orb 5 分钟无活动后自动暂停（2026-07-27 全员降价 20% 的同一周后，2026-08-07 又把空闲暂停从 15 分钟调到 5 分钟）。**暂停 = 不计费**。重新激活几乎是即时的，特别当同项目其他成员近期开过 orb 时，启动会被「预热」进一步加速。

---

## 三、观点归纳：把 Amp 公告里的核心判断翻译成 5 条结论

### 3.1 观点一：把 agent 从编辑器侧栏里释放出来是 2026 年最值得做的一步

2026-02-19《The Coding Agent Is Dead》已经明确说了——「the agent is no longer the limiting factor」「These new models barely need to be told how to act like coding agents anymore」。限制从「agent 能力」挪到了「你愿不愿意放手让它跑」。Orbs 把这条放手做成了产品：你的 agent 不再因为「你不在编辑器前」停下。

**结论**：如果你还在用 IDE 侧栏里的 agent 做严肃工作，你应该立刻至少有一条工作流迁到 Orb——不是因为它更快，而是因为它**允许你不在的时候它也能干**。

### 3.2 观点二：能力不是权威——但能力越大，越需要「计费单位」从座位改为结果

公告与《Coding Agent Is Dead》反复强调：模型能力超过了你给它的脚手架之后，把脚手架放大（更多 agent）才有用。但放大 agent 数量的瓶颈不是 AI——是**你愿意为多少个并行 agent 付钱**。Orbs 的按分钟计费（5 分钟空闲免费暂停）是 Amp 给出的答案：把「我愿意为 agent 付多少钱」从「我买了多少订阅」改为「我让多少 agent 跑了多少分钟」。前者是座位，后者是结果。

**结论**：未来几年，按分钟计费会成为 agent 平台的标配——因为只有按分钟计费才能让 fan-out 不再是「需要先估算 ROI 才能启动」的奢侈动作，而是「先启动、看着账单决定要不要继续」的随手行为。

### 3.3 观点三：让 fan-out 不再受本地资源约束，把 8 个并行 agent 从演示变成日常

公告里最直白的一段：

> "Why not launch a group of agents to investigate eight different bugs independently when there are no local resource clashes to worry about? Why not turn a bug report into an agent and an investigation instead of a ticket? Why not manage the agent and its results instead of the ticket?"

「为什么不把一个 bug report 直接变成一个 agent？」——这条以前在本地是不可能的（你的 CPU/内存争抢、IDE 卡顿、电源焦虑）。Orbs 把这条从「偶尔做一次的演示」变成「每天都能做的日常工作」。

**结论**：当「开 8 个并行 agent 调查 8 个独立 bug」从演示变成日常，ticket-first 的工作流就被替换成了 agent-first 的工作流。你管理的对象从「人写的 ticket」变成「agent 跑出来的结果」。

### 3.4 观点四：无人值守是新默认值——从此 agent 不再需要你「盯着」

公告原话：

> "Never mind the editor, now we can let our agents run even when we're not sitting at our computer."

把这条和《Coding Agent Is Dead》连起来读：Amp 在 2026-02 杀死了「编辑器里的 agent」（自爆 VS Code / Cursor 扩展），在 2026-06 把 agent 放进 Orb——两步合起来就是把「agent 必须有 editor 才能干活」这条假设彻底删除。

**结论**：把 agent 当 ticket 一样归档/唤醒（webhook、OIDC、portal），是 2026 下半年每个 agent 平台都会复制的形态。你的运维心智模型要从「我开 8 个 IDE 标签页盯 8 个 agent」切换成「我有一个 inbox，里面是 8 个 agent 的产出，等我下班/起床/吃完饭再看」。

### 3.5 观点五：计费单位从订阅到分钟，从按月到按用——这是 SaaS 的下一场革命

把订阅切成「月卡 + 按分钟 Orb 计费」是一种混合形态——LLM 仍是订阅（按 token 用），但 Orb（计算资源）按分钟。Megawatt 订阅覆盖「几乎所有人整个月的 Orb 使用」，但当用量超过这条线时，按分钟的计费让它**不变成封顶变慢**，而是按需扩容。

**结论**：未来 agent 平台的定价会持续向「按用付费」倾斜——但它不会完全替代订阅，而是「订阅兜底 + 按用扩展」的双层结构。Amp Orbs 是这条趋势的早期样板。

### 3.6 5 个观点的关联结构

```
观点 1：把 agent 释放出编辑器
       ↓（实现路径）
观点 4：无人值守是新默认值
       ↓（经济基础）
观点 2 & 5：计费从订阅到分钟、从座位到结果
       ↓（解锁的应用形态）
观点 3：fan-out 不再受本地资源约束
```

观点 1 是哲学前提，观点 4 是产品形态，观点 2/5 是经济基础设施，观点 3 是被解锁的新应用。读公告与编辑文时按这个顺序读，能看到 Amp 团队的一条完整叙事线。

---

## 四、设计哲学：把 Amp 公告与编辑文读成一份设计宣言

### 4.1 哲学 1：从「编辑器里的辅助」到「云端里的独立机器」——重新定义 agent 的存在位置

A：《Coding Agent Is Dead》说：

> "They're now much more than mere assistants. They no longer need the hand-holding and really want to kick off their training wheels."

B：《Agents in Orbs》说：

> "Orbs are machines where agents can run without supervision."

A 把 agent 从「助手」提到「独立体」，B 把「独立」具象化成 Orb（独立机器）。这条哲学的实质是：**agent 不再寄生于你的工具链，它有自己的操作系统、自己的文件系统、自己的暂停/唤醒节奏**。

落地表现：

- Orb 跑自己的 Debian 12，有自己的文件系统、自己的进程空间。
- Agent 用自己的 tmux 会话工作；你是「受邀进入」那个会话的访客，不是「拥有那台机器」的主人。
- Webhook / OIDC 让外部服务能把 Orb 当成一个**长期身份**调用，而不是当成「我让 agent 跑一下」的一次性动作。

### 4.2 哲学 2：能力不等于权威——模型越强，越要给它更小的权威边界

Orb 形态里有一个细节容易忽略：**agent 不是 root**。它在 Orb 里能跑 `apt install`、能跑 build、能改文件，但 OIDC token 仍然需要外部服务显式接受；webhook URL 仍然需要插件签名校验；sensitive 操作仍然走你审批过的 secrets。

这条与 [fde-guide 的 12 因子](docs/blog/fde-guide-analysis)（本站）：**Tokens 是输入，自主性是设计选择，被接受的结果才是产品**）同源——能力是能力，权威是权威，两者必须分开设计。

落地表现：

- **能跑 ≠ 能动你的生产环境**：OIDC 联邦代替长寿命 service account key。
- **能改文件 ≠ 能 push 到主分支**：你审 diff、按需 accept；agent 默认不会绕过你的 review。
- **能起 webhook ≠ 能伪装事件**：Amp 不替你验签，handler 必须自验。

**这条哲学是「无监督运行」成立的前提**——你愿意放手 agent 跑，正是因为权威边界画得很清。

### 4.3 哲学 3：以结果而非座位为单位计价——把 agent 从订阅产品变成可计量服务

Orb 的计费单位是分钟、暂停不计费、归档立即停止。这条计费形态的背后是 Amp 的一个判断：**agent 是一种按使用付钱的服务，不是一种按月订阅的产品**。

为什么这条重要？因为只有「按使用付钱」，你才会愿意放手做以下事情：

- 让 agent 跑长任务（一晚上编译、一整夜跑测试）——因为它真的只在跑的时候计费。
- 让 agent 并行 fan-out（8 个并行调查 8 个 bug）——因为你只为真正在跑的 8 个付费。
- 让 agent 当 ticket 用（一个 bug report → 一个 agent）——因为归档即停，不需要「保留这张 ticket」这件事产生订阅成本。

**这条哲学把 Amp 的整个商业模式从「我有多少开发者订阅 Amp」挪到「我让多少 agent 在 Amp 上跑了多少分钟」。**

### 4.4 哲学 4：按需唤醒、用完即睡——把「弹性」从云概念移植到 agent 体验

云计算花了 20 年教会所有人「按需分配、用完释放」；Amp 把同样的弹性移植到 agent 上：

- 5 分钟空闲自动暂停（2026-08-07 从 15 分钟调到 5 分钟）。
- 暂停不花钱。
- webhook 唤醒时几乎即时启动（特别是同项目近期有人启动过 orb 时，启动会被预热加速）。

这条哲学的实质：**agent 平台应该有「冷/热」两种状态，而不是只有「开」和「关」**。冷态不花钱、随叫随醒、热态全力运转——这是 Orb 给出的形态参考。

### 4.5 哲学 5：让 fan-out 不再受本地资源约束——把「并行」从单机能力变成平台能力

公告最直白的一段：

> "Why not launch a group of agents to investigate eight different bugs independently when there are no local resource clashes to worry about? Why not turn a bug report into an agent and an investigation instead of a ticket?"

这条哲学把「并行」从「你这台机器有几个核心」挪到「平台愿意为你 spawn 几个 Orb」——后者在云上几乎是无限的。

落地表现：

- Megawatt 订阅覆盖「几乎所有人整个月的 Orb 使用」——鼓励你多用。
- 按线程选规格（`--orb-size` 或让 agent 自己选）——简单任务用 `a1.tiny`，重型任务用 `a1.xxlarge`。
- 与 webhook 组合——外部事件触发新 orb，并行 fan-out 完全在后台。

### 4.6 哲学 6：与本地接口完全一致——降低迁移成本是平台扩展的真正护城河

Orb 的设计细节里最不起眼但最重要的一条：**agent 在 Orb 里的所有控制接口（审 diff、开 terminal、`amp sync`、TUI 启动）与本地完全一致**。

这条哲学的实质：**「上云」不能以「换一套用法」为代价**。如果你要把工作流迁到 Orb 后还得学一套新命令，那迁移成本会杀死采用率。Amp 把这条做成「`amp -x` 变 `amp -ox`，仅此而已」，让迁移成本接近于零。

落地表现：

- `amp -x` 与 `amp -ox` 同一个心智模型。
- Orb 上的 tmux 会话与本地 shell 用法完全一致。
- 审 diff、看文件、跑命令的 UI 与本地 agent 共享组件。

**这条哲学也是 Orbs 能快速被采纳的根本原因——不是它「强大」，而是它「不打断你现有的工作流」。**

### 4.7 哲学小结：六条哲学构成 Orb 的设计宣言

| 哲学 | 一句话 | 落地表现 |
|---|---|---|
| 1. 独立机器 | agent 不寄生于你的工具 | Orb = Debian 12 沙箱 |
| 2. 能力≠权威 | 模型越强，权威边界要画得越清 | OIDC、webhook 验签、review 必走 |
| 3. 按结果计费 | agent 是服务，不是订阅 | billed by the minute |
| 4. 按需弹性 | agent 应该有冷/热态 | 5 分钟空闲暂停 |
| 5. 平台级并行 | fan-out 不该被笔记本卡住 | per-thread 选规格、按需 fan-out |
| 6. 接口一致 | 上云不该换一套用法 | `amp -x` ↔ `amp -ox`、共享 UI |

这六条不是互相独立的——它们构成一条链：**接口一致让人愿意迁过来；独立机器让它真的能迁；能力≠权威让它能放心迁；按结果计费让它经济上能迁；按需弹性让它不烧钱；平台级并行解锁新用法**。少任何一条，这条形态都不成立。

---

## 五、核心思想总结

Agents in Orbs 给出的最重要的判断是：**2026 年下半年，agent 平台的形态之争已经从「谁的模型更好」迁移到「谁能让 agent 在用户不在时也把活干完」。**

- **它重新定义了 agent 的存在位置**：从 IDE 侧栏搬到云端 Orb，agent 拥有自己的机器、自己的暂停/唤醒节奏、自己的计费单位。
- **它把「无监督运行」做成了产品**：共享 tmux、Webhook 唤醒、OIDC 联邦、按分钟计费、5 分钟空闲暂停——六条缺一不可。
- **它把 fan-out 从演示变成日常**：本地跑 8 个并行 agent 是「我能/不能」的问题，云端跑 8 个是「我愿不愿意花这些钱」的问题——而 Orb 把后者压到「按分钟付」。
- **它把 agent 与 ticket 的关系反转**：以前你给 agent 开 ticket；以后你给 ticket 开 agent——agent 是 ticket 的执行者，ticket 退化成通知与归档容器。
- **它给「无人值守 agent」画出了安全护栏**：能力不等于权威，OIDC 联邦 + webhook 验签 + 必走的 review + 共享 tmux 让放手这件事有边界。

记住它的一句话：**模型越强，越不能把它锁在单台机器里。Orbs 是 Amp 给「agent 时代」给出的工程答案——一台能跑 Amp agent 的远程机器，按分钟计费，按需唤醒，五分钟空闲即睡，让你离开电脑也能继续让 agent 干活。**

---

## 附：参考链接

- [Agents in Orbs（2026-06-30 公告）](https://ampcode.com/news/agents-in-orbs)
- [The Coding Agent Is Dead（2026-02-19 编辑文）](https://ampcode.com/news/the-coding-agent-is-dead)
- [Orbs User Manual](https://ampcode.com/manual/orbs)
- [Size the Orbs of Production（2026-08-07 价格表）](https://ampcode.com/news/size-the-orbs-of-production)
- [More Orb Sizes（2026-07-03 存储翻倍）](https://ampcode.com/news/more-orb-sizes)
- [OIDC from Orbs](https://ampcode.com/manual/orbs/oidc)
- [Amp Pricing](https://ampcode.com/pricing)
