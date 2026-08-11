---
title: "T3 Code 深度解析：一个能控制五家 coding agent 的开源\"agent harness control surface\"——产品形态、实操教程与设计哲学"
description: "以 pingdotgg/t3code（GitHub 18k+ stars，MIT，开源）为主线，逐层拆解 T3 Code：①项目说明——一个 Web + 桌面 + 移动三端、控制 Codex/Claude/Cursor/Grok/OpenCode 五家 agent provider 的开源 \"agent harness control surface\"；②详细教程——npx t3@latest 启动、桌面安装、5 种 provider 的安装登录、4 种权限模式（Supervised / Auto-accept edits / Auto / Full access）、远程访问（LAN / Tailscale / T3 Connect / SSH）、4 种 source control（GitHub/GitLab/Bitbucket/Azure DevOps）、WebSocket + OAuth + DPoP 鉴权、keybindings 与 thread pin；③技术架构——Effect RPC WebSocket、event-sourced 编排（command→decider→event→projector）、5 个 provider driver、checkpoint（隐藏 git ref）、3 个 queue-backed worker、Rust 资源监控 sidecar；④6 条设计哲学——Open at the core、Performance without compromise、Remote ready、Multi-surface、Complexity at the adapter boundary、Event-sourced truth。核心主张：把 agent harness 当作一种需要 control surface 的产品形态，而不是一种 agent 框架；T3 Code 是这个判断的工程实现。"
date: "2026-08-10"
author: "TopDigg Research Team"
tags: ["T3 Code", "t3code", "pingdotgg", "Agent Harness", "AI Agent", "Coding Agent", "Codex", "Claude Code", "Cursor", "Grok", "OpenCode", "Effect RPC", "Event Sourcing", "Remote Access", "Tailscale", "T3 Connect", "WebSocket", "OAuth", "Clerk", "Electron", "React Native", "Open Source", "MIT"]
categories: ["Deep Dive"]
keywords: ["T3 Code", "t3code", "pingdotgg", "agent harness", "control surface", "multi-provider", "Codex CLI", "Claude Code", "Cursor CLI", "Grok Build CLI", "OpenCode", "Effect RPC", "WebSocket", "event-sourced", "checkpoint", "Tailscale", "T3 Connect", "Clerk OAuth", "DPoP", "Electron", "React Native", "Expo", "设计哲学", "AGENTS.md"]
---

# T3 Code 深度解析：一个能控制五家 coding agent 的开源"agent harness control surface"——产品形态、实操教程与设计哲学

> 核心思想：**T3 Code（pingdotgg/t3code）不是另一种 agent 框架——它是一个"agent harness control surface"：一个 Node WebSocket 服务把 Codex / Claude / Cursor / Grok / OpenCode 五家 provider CLI 收成同一套可远程控制的执行环境，再用 Web + 桌面（Electron）+ 移动（React Native）三端让用户从任何设备控制 agent。** 它的核心工程判断是——模型能力已经超过 agent 框架，**真正的瓶颈是"如何在一台机器上同时管理 5 种 agent 并从任何地方连过去"**。T3 Code 用 Effect RPC WebSocket、event-sourced 编排、隐藏 git ref 形式的 checkpoint、独立 Rust 资源监控 sidecar、Clerk OAuth + DPoP 鉴权、Tailscale / T3 Connect / SSH 三种远程通道，**把"agent harness"做成了一个完整的产品形态**，并以 MIT 协议开源。它的设计哲学（AGENTS.md 第一手记录）可以压成 6 句——**Open at the core；Performance without compromise；Remote ready；Multi-surface；Complexity belongs at the adapter boundary；Event-sourced truth**。

---

## 一、项目说明

### 1.1 它是什么？

本文解析的是 GitHub 仓库 [`pingdotgg/t3code`](https://github.com/pingdotgg/t3code)（**18k+ stars / 4k+ forks / 1.5k+ issues**，TypeScript，**MIT 协议**）——一个跨五家 coding agent provider 的开源"agent harness control surface"。

它的工作方式可以一句话讲清：

> **T3 Code = 一台本地 Node WebSocket 服务 + 一个 React Web UI + 一个 Electron 桌面壳 + 一个 React Native 移动端，让你能从任何设备（手机、平板、另一台电脑）控制你本机跑的 Codex / Claude Code / Cursor / Grok Build / OpenCode agent。**

T3 Code 自己**不训练模型、不造 agent 框架、不替代你的订阅**——它做的事情是：

1. **包装 provider CLI**——把 5 家 provider 的不同协议（Codex app-server、Claude SDK、Cursor agent、Grok CLI、OpenCode SDK）统一收成同一种"provider driver + adapter"接口；
2. **跑一个本地服务端**——`npx t3@latest` 启动的 Node 进程（package 名就叫 `t3`），是**所有 provider 进程、terminal、git、文件系统操作的执行边界**（client 永远不直接调 provider）；
3. **远程化**——同一条 Effect RPC WebSocket 协议从同局域网、跨网络（Tailscale）、T3 Connect（Cloudflare 隧道）、桌面托管 SSH 4 种通道任选其一连过去；
4. **多端 UI**——Web、桌面（Electron 把 web 套一层壳）、移动（Expo/React Native，原生 iOS + Android）；
5. **开源 + MIT**——AGENTS.md 直说"if we ever go the wrong direction, you have everything you need to fork"。

### 1.2 一句话定位

> **T3 Code 是开源、bring-your-own-subscription 的 Claude Desktop / Codex App / Cursor Glass / Conductor 的替代品。**

### 1.3 关键事实

- **数据**：GitHub 18,104 stars · 4,083 forks · 1,510 open issues（README + GitHub API）
- **协议**：MIT
- **主语言**：TypeScript（pnpm workspace + Vite+ 构建）
- **服务端 Node 要求**：`^22.16 || ^23.11 || >=24.10`
- **支持 5 家 provider**：Codex（OpenAI）、Claude Code（Anthropic）、Cursor（Cursor）、Grok Build（xAI）、OpenCode（SST）
- **3 个客户端**：Web（`app.t3.codes` 托管 + `npx t3` 本地）、桌面（Electron 壳）、移动（React Native，iOS App Store / Google Play）
- **4 种远程通道**：直接 WebSocket、Tailscale Serve、T3 Connect（Cloudflare 隧道）、桌面托管 SSH
- **4 种权限模式**：`approval-required`（Supervised）/ `auto-accept-edits` / `auto` / `full-access`
- **3 个 layer（编排）**：`apps/server`（执行 runtime）/ `apps/web`、`apps/desktop`、`apps/mobile`（客户端）/ `packages/*`（共享 contracts、client runtime、telemetry、SSH、Tailscale）
- **架构关键事实**：服务端是 event-sourced 编排（command → decider → event → projector），每个 turn 用隐藏 git ref 做 checkpoint，资源监控用独立 Rust sidecar（不用 Node native addon），认证走 Clerk OAuth + DPoP proof-of-possession
- **贡献政策**：官方明确"（mostly）not accepting contributions yet. Small fixes may be considered. Big features will not be."——这是个高门槛、Theo（`-bPingdotgg`）亲自管的早期项目
- **使用规模**：AGENTS.md 提到"over 100,000 users"
- **官方主仓库**：`pingdotgg/t3code`（注意仓库名是 `t3code` 而非 `t3-code`，但应用名是 T3 Code）

### 1.4 它解决的问题

2026 年的"agent 开发体验"被撕成了 5 块：

1. **5 家 provider 各自一套**——Codex 有自己的 app、Claude Code 有自己的 CLI、Cursor 有自己的桌面应用、Grok Build 还在 beta、OpenCode 是 SDK。要在所有这些工具之间切来切去是不连续的。
2. **只能在工作机前面用**——你正在手机上，却没办法让本地跑的 agent 继续跑。
3. **跨设备同步差**——在桌面开一个 thread，手机看不到。
4. **远程 + 安全 + 性能**——自己搞 Tailscale 或 SSH 转发是可行的，但每个项目都要重新搞一遍；托管隧道又怕性能。
5. **权限控制粒度**——你不会让 agent 无监督在主分支上跑 `rm -rf`。

T3 Code 的回答：**一个开源执行 runtime、一种远程协议、一套 4 模式权限系统、3 个原生客户端、5 种 provider 兼容。** 让"agent harness"从 5 个产品变成 1 个产品。

---

## 二、详细教程：从 0 到能远程控制 5 家 agent

这一节按"安装 → 配 provider → 用 4 种权限模式 → 远程访问 → 源码控制 → 高级玩法"六步走，每步都给可拷贝命令、最小示例与注意事项。来源：[docs/user/](https://github.com/pingdotgg/t3code/tree/main/docs/user)。

### 2.1 第 1 步：安装 T3 Code

**前置条件**：

- Node.js `^22.16 || ^23.11 || >=24.10`（装在**跑 T3 server 的那台机器上**）
- 至少装好一家 provider CLI 并登录（下面第 2 步）

**最快试玩（不装任何东西）**：

```bash
npx t3@latest
```

这会在你机器上启动 T3 server 并自动开本地 Web 客户端。`npx t3@latest --help` 查完整 CLI 参考。

**桌面应用**（多数人从这里开始）：

| 平台 | 命令 |
|---|---|
| Windows | `winget install T3Tools.T3Code` |
| macOS | `brew install --cask t3-code` |
| Arch Linux | `yay -S t3code-bin` |
| 任何平台 | 从 [GitHub Releases](https://github.com/pingdotgg/t3code/releases) 下载 |

> 关键点：桌面应用自带一个 `t3` 后端，你也可以让桌面应用作为 server 让手机/另一台电脑连过来。

### 2.2 第 2 步：装 provider 并登录

T3 Code **不打包** provider CLI——你装哪家用哪家。在**跑 T3 server 的机器**上（不是手机！也不是你看的设备）：

| Provider | 装 CLI | 登录命令 | 默认二进制 |
|---|---|---|---|
| **Codex** | [Codex CLI](https://developers.openai.com/codex/cli) | `codex login` | `codex` |
| **Claude** | [Claude Code](https://claude.com/product/claude-code) | `claude auth login` | `claude` |
| **Cursor** | [Cursor CLI](https://cursor.com/cli) | `agent login` | `cursor-agent` |
| **Grok Build** | [Grok Build CLI](https://x.ai/cli) | `grok login` | `grok` |
| **OpenCode** | [OpenCode](https://opencode.ai) | `opencode auth login` | `opencode` |

> **关键提示（Cursor）**：装的是 `cursor-agent` 二进制，但**登录用 `agent login`，不是 `cursor-agent login`**。Cursor 文档里没明说，T3 Code 文档专门警告了。

**找不到 CLI？** 用 Settings → provider instance → **Binary path** 给一个绝对路径，覆盖默认 PATH 查找（这在用 Volta / asdf / fnm 等版本管理器时常见）。

**何时需要认证？** 在用该 provider 开 session **之前**——T3 Code 本身启动时不需要。可以先装先打开 T3，再补登录。

### 2.3 第 3 步：选权限模式（4 种）

权限模式在 message composer 的 mode control 上**每个 thread 独立**设置。AGENTS.md 与 docs/user/permission-modes.md 的对照：

| 模式 | 行为 | 适用场景 |
|---|---|---|
| **Supervised**（Supervised / Approve actions 移动端） | 所有命令、文件改动前都问 | 不熟悉的 task；操作贵重的 repo |
| **Auto-accept edits** | 文件改动自动过；命令仍问 | 重构型任务；你只在乎 shell 命令 |
| **Auto** | 例行操作不问，危险的仍问 | 常规开发；Codex 走 AI reviewer，Claude 走自己的 auto mode，没等价的（如 OpenCode）就退回 Supervised |
| **Full access**（默认） | 命令和编辑都不问 | worktree、sandbox，反正可丢的 |

线程创建自另一个 thread 时**继承**父 thread 的 mode；否则新 thread 默认 Full access。

每种模式由 provider 自己映射到自己的审批/sandbox 配置：Codex 把它转成 `approval-policy` + `sandbox` 等级，Claude 用 `auto-permission-mode`。**mobile 用同样的 4 种，但把 "Supervised" 显示为 "Approve actions"**。

### 2.4 第 4 步：远程访问

T3 Code 的核心承诺之一是**"remote ready"**。文档把 4 种远程通道分得很清。

#### 2.4.1 直接 WebSocket（同网段，最简单）

如果 T3 server 跑在 192.168.x.y:3773，你同一局域网内的手机/电脑直接连 `http://192.168.x.y:3773`，配上 pairing token 即可。**注意：浏览器在 HTTPS 页面里**不能用 plain HTTP 端点（mixed-content rule）——这种场景要么用 HTTPS，要么用桌面应用或 CLI 直接连。

#### 2.4.2 Tailscale（推荐）

如果你跑 Tailscale，桌面应用会自动发现 tailnet，把 tailnet IP（`100.x.y.z`）、MagicDNS、Tailscale Serve HTTPS 三种端点都列在 Settings → Connections。

```bash
# 启用 Tailscale HTTPS
npx t3 serve --tailscale-serve
# 这条把 backend 暴露到 https://machine.tailnet.ts.net/
```

或者在桌面 Settings → Tailscale HTTPS 行开开关（**默认关**），桌面应用会自动 `tailscale serve --https=443` 配好映射。

**为什么推荐**：稳定地址 + 传输层加密 + 不暴露公网。

#### 2.4.3 T3 Connect（Cloudflare 隧道，零网络配置）

T3 Connect 是 T3 Code 自带的 managed Cloudflare 隧道方案——**当你的机器在 NAT 后、入口端口不可用、或移动端需要能连到桌面托管的 env 时用**。认证走 Clerk OAuth。

```bash
# 在 T3 server 机器上
npx t3 connect link
# 这一步会装 pinned managed cloudflared，授权，把 intent 持久化
npx t3 serve
# 这一步 reconcile relay link 并启动 managed tunnel
```

工作机制：relay Worker **只做凭证和 managed endpoint 的中介**，应用流量走 provisioning 出来的 Cloudflare tunnel hostname，**不经过 relay Worker 本身**。

**桌面应用 + T3 Connect**：
1. 设置 → T3 Connect → 登录（Clerk）
2. 设置 → T3 Connect → "Link this environment"
3. 移动端在 Connections → Add Environment → 用同账号登录，自动发现

#### 2.4.4 桌面托管 SSH 启动

桌面应用可以**自己 SSH 到远程机器，启动或复用 T3 server，forward 端口回来**。Settings → Connections → Add environment → SSH launch flow → 输 `user@example.com` → 确认。桌面做：

1. 探测 host
2. 启或复用远程 T3 server
3. 开本地端口 forward
4. 把 env 保存（后续 reconnect 自动复用）

> **SSH launch 排错**：远端必须装兼容版本的 Node（`^22.16 || ^23.11 || >=24.10`）；用 nvm 用户跑 `nvm alias default 24`；Launcher 会写 `~/.t3/ssh-launch/<host-key>/`、清掉 stale 进程、起 fresh server——一般不需要手动删。

#### 2.4.5 Pairing 协议（所有通道共用）

不论哪种通道，pairing 流程一样：

1. `t3 serve` 一次性 owner pairing token
2. 远端设备拿 token 跟 server 换 session
3. 之后是 session-based 访问（不需要重发原始 token，除非你 pair 新设备）

**Hosted pairing 链接长这样**：

```text
https://app.t3.codes/pair?host=https://backend.example.com:3773#token=PAIRCODE
```

- token 放 URL hash 里（**不发给 hosted app origin**）
- hosted app **不代理流量**——浏览器直连 backend URL
- 适用 backend 必须从浏览器可达（HTTPS/WSS）；纯 HTTP LAN 端点请用桌面应用/CLI 直接给

#### 2.4.6 配对后管理

`npx t3 auth`：

- 增发 pairing 凭证
- 查 active sessions
- revoke 旧 pairing 链接或 sessions

### 2.5 第 5 步：源码控制集成

T3 Code 直接对接 4 个 Git 平台（认证都在 **T3 server 那一台机器上做**，不是浏览器）：

#### 2.5.1 GitHub

```bash
brew install gh
gh auth login
# 打开 T3 Code → Settings → Source Control 验证 GitHub 已认证
```

能做的事：clone、publish、PR（标题/描述基于 commits 建议）、审 PR（看团队成员的 branch，开 right-panel tabs）。

#### 2.5.2 GitLab

```bash
brew install glab
glab auth login
```

支持 Merge Request、仓库发布、hosted clone。

#### 2.5.3 Bitbucket

无 CLI，**用环境变量**（推荐用 access token）：

```bash
export T3CODE_BITBUCKET_ACCESS_TOKEN="your-access-token"
# 或
export T3CODE_BITBUCKET_EMAIL="you@example.com"
export T3CODE_BITBUCKET_API_TOKEN="your-token"
# 设完重启 T3 Code
```

两个都设了的话，access token 赢。

#### 2.5.4 Azure DevOps

```bash
brew install azure-cli
az extension add --name azure-devops
az login
```

#### 2.5.5 通用

**任何 Git URL** 都能 clone（用 Custom Git URL）。**没 commit 的本地仓库**用 **Publish Repository** 动作，一键在 GitHub/GitLab/Bitbucket/Azure DevOps 上建仓 + 加 origin + push。

### 2.6 第 6 步：键盘快捷键与 thread 管理

#### 2.6.1 Keybindings

存在 `~/.t3/userdata/keybindings.json`（T3 server 机器上）。T3 Code 启动时写入内置默认；以后启动时增量加新默认——但**不会覆盖你已声明的**或**已声明同 shortcut 的**。文件非法时整文件忽略，server log 警告。

格式：

```json
[
  { "key": "mod+g", "command": "terminal.toggle" },
  { "key": "mod+shift+g", "command": "terminal.new", "when": "terminalFocus" }
]
```

`key` 支持 `mod`（macOS=cmd，其他=ctrl）、`cmd`/`meta`、`ctrl`/`control`、`shift`、`alt`/`option`。`when` 支持 `!`、`&&`、`||`、括号；当前可用 context keys：`terminalFocus`、`terminalOpen`、`previewFocus`、`previewOpen`、`modelPickerOpen`（运行时增长，不视为定值）。

评估顺序：**数组顺序遍历，最后一条 key+when 都匹配的规则胜出**——跨命令也按顺序。

#### 2.6.2 Thread pin 与跨设备排序

- Pin 一个 thread → 出现在 sidebar 顶部 pinned 区
- 排序**存在 server 端**，**跨你所有连接的设备同步**
- Web/桌面：拖动；移动：菜单里的 Move up/Move down
- 旧 server 不认 synced 排序——升级 server

#### 2.6.3 项目图标自定义

`Settings → Projects → 选项目 → Appearance → Choose a project file`——选 SVG/PNG/ICO/JPEG/GIF/AVIF/WebP。默认自动检测 `t3.json`、favicon、HTML icon link。

### 2.7 第 7 步：保持 app 与 server 同步

`npm run build` 出来的 client 期望 server 是同版本——**版本不一致会出警告**。警告出现在：

- 当前对话的 message box 上方
- Settings → Connections 那个连接旁边

修复动作取决于 server 是怎么启动的：

| 启动方式 | 动作 |
|---|---|
| **Linux background service** | 点 **Update server** 按钮，让 T3 Code 自己停 → 装新 → 起 → 重连 |
| **桌面应用启动** | 在**启动 server 的桌面 app** 里点升级 |
| **CLI 跑** | **Copy update command** → 在 server 机器上跑 `npx t3@<client-version>` |

后台服务细节：`npx t3@latest service install/update/status/uninstall`。systemd 单元跑一个**稳定 launcher**（不变），`versions/<exact-version>` 各版本独立安装——失败的 trial 可以**回滚**到上一版本，不用重写 unit。Launcher 在停旧 server 后**snapshot 整个 SQLite**（含 WAL/SHM）——database migration 跟着版本回滚，**不需要 down migration**。Trial 必须在 120 秒内报 `prepared`，否则 launcher 停 trial → 恢复 snapshot → 记录 rollback → 启 A。

### 2.8 第 8 步：Linux 后台服务（让 server 跑你 logout 之后）

```sh
npx t3@latest service install   # 装
npx t3@latest service status    # 查
npx t3@latest service update    # 升级/修
npx t3@latest service uninstall # 卸
```

目前需要 **Linux + systemd**。Sign out of T3 Connect **不会**自动卸服务。

---

## 三、归纳总结：8 条核心观点

把 T3 Code 的设计文、AGENTS.md、架构文档读完后，可以归纳出 8 条**对 agent 时代的产品形态判断**。

### 3.1 观点一：agent harness 是一种新形态的产品，而不是一种 agent 框架

AGENTS.md 第一句："T3 Code is a minimal GUI for coding agents."——但它立刻被工具化：包 5 家 provider 的 CLI 进程、跑一个 Node server 收所有执行、用 3 个客户端远程控制。

含义：**模型能力够强后，agent 框架层趋于同质化——真正的差异化在"如何把 agent 跑得久、连得远、看得清"**。T3 Code 把这条判断做成了"agent harness control surface"这个**新形态产品**。

**结论**：如果你正在做 coding agent 类工具，**别再卷 agent 框架**——卷执行环境、远程通道、多端体验、可观测性。

### 3.2 观点二：执行边界在 server，不在 client

架构文档的"execution boundary"：

> "every provider process, terminal, git operation, and filesystem read happens there, never in the client."

具体落地：

- client **不直接调 provider**——所有 provider 操作都走 `orchestration.dispatchCommand` RPC
- client **不构造 RPC client、retry loop、raw orchestration command**（client-runtime 集中管）
- terminal、git、fs 都在 server

这条划线让 T3 Code **能任意切换 client 形态**（再加第 4、第 5 个 client 都不需要改 server 的执行语义）。

**结论**：做多端 agent 产品时，**把执行边界划在 server**——别让 client 跑 provider 进程，否则你每个新 client 都要重新实现 runtime。

### 3.3 观点三：event sourcing 是 agent 编排的正确结构

服务端编排是 event-sourced：

```
command → decideOrchestrationCommand（纯函数）→ events
events → projector → 读模型（messages、threads、checkpoints、session status）
事件同时 append 到 event store
整个 append + project 在一个 SQL 事务里
```

**好处**：
- **读模型不可能和事件日志长期不一致**——因为它们在同一事务里
- **失败回放容易**——dispatch 失败时重读事件从 starting sequence 之后 reconcile
- **turn 何时完成** 有一个权威定义：session 离开 `running` 状态（不是 checkpoint/diff 完成）
- **idempotency** 天然——`processEnvelope` 先查 durable command receipt，重试同 command 是幂等的

**结论**：agent 的"对话 + 工作"双层结构（用户消息 + 工具调用 + 文件 diff + agent 文本）天然适合 event sourcing；不要用 CRUD 状态机来描述。

### 3.4 观点四：provider 抽象做在 adapter 层，编排保持纯粹

5 个 provider driver + 5 个 adapter 是**两段**：

- **driver** 声明 `driverKind` + `configSchema` + `create`（构造 adapter）
- **adapter** 实现 `ProviderAdapter` 协议

`ProviderService` 在最上面——**它不知道 agent 是什么，只知道 thread**。"thread.turn.start"、"thread.approval.respond" 是 client 调用的所有原语；"thread.message.assistant.delta"、"thread.session.set" 是 server 内部 reactor 产生的事件。

**加新 provider 只需写一个 driver + adapter + 加到 `BUILT_IN_DRIVERS` 数组**——不碰 orchestration、contract、client。

**结论**：**complexity belongs at the adapter boundary**（AGENTS.md 原话）——把多样性关进 adapter，主干保持纯粹。

### 3.5 观点五：远程 = 同一条协议 + 多种访问通道，不分裂 runtime

文档原话："Remoteness is expressed at the connection layer, never by splitting the runtime."

具体落地：
- 不管 LAN、Tailscale、T3 Connect 还是桌面 SSH 启动，**T3 server 都是同一份进程**、同一份事件源、同一份 SQLite
- 4 种 access method（直接 / Tailscale / T3 Connect / 桌面 SSH）只是**不同的连接层**
- 3 种 launch method（预跑 server / 桌面 SSH 启 / 客户端用 relay publish）也只是**server 怎么出现的差异**

**结论**：做远程 agent 产品时，**协议稳定、连接层多变**——别给每种远程通道写一套独立 runtime。

### 3.6 观点六：capability-based OAuth 鉴权比角色鉴权更适合多端 agent

T3 Code 不用 `admin`/`user` 角色模型，用 OAuth 风格的 scope 字符串：

```
orchestration:read / orchestration:operate / terminal:operate /
review:write / access:read / access:write / relay:read / relay:write
```

普通 pairing 给 4 个 client-operation scope + `relay:read`；bootstrap credential 多给 `access:read/write` + `relay:write`。**RPC 每个 method 自己声明 required scope**——`RPC_REQUIRED_SCOPE` map。

鉴权流程符合 RFC 6750 (Bearer) + RFC 8693 (Token Exchange) + RFC 6749 (Scope)：
- `POST /oauth/token`（`grant_type=urn:ietf:params:oauth:grant-type:token-exchange`）
- `POST /api/auth/websocket-ticket` 拿 5 分钟短 ticket，**避免长寿命 token 出现在 WebSocket URL 里**
- **DPoP-bound** token（proof-of-possession）：relay 用的，**1 小时 TTL**——token 泄漏了没有 proof key 用不了

**结论**：agent 平台不该用"管理员/普通用户"二元模型——用 capability scope，每个 RPC method 自己声明能力需求。

### 3.7 观点七：独立 Rust 资源监控 sidecar 比 Node native addon 安全

为什么不直接用 Node native addon 读 process counter？文档原话：

> "The cost is one persistent child process and NDJSON serialization. That is a better failure boundary than repeatedly spawning shell utilities or loading native code into Node."

具体落地：
- `native/resource-monitor` 是**独立 Rust 可执行**（`sysinfo` crate），通过 stdin/stdout NDJSON 通信
- **不是** N-API / `ffi-rs` / dynamic library
- monitor 崩了 **不会污染 Node runtime**——server 可以 supervise、restart、version-check 它
- **同一个协议** 跨 desktop / web / headless server 都用
- **打包简单**——单平台 binary，**没有 N-API × Node × Electron ABI 矩阵**

**桌面 Electron 加 Electron 主机端 telemetry**（powerMonitor、app.getAppMetrics、host power state）——通过 inherited fd 4/5 跟 server 通信，**不走 renderer WebSocket**。

**结论**：需要 OS-level 数据时，**独立 sidecar + NDJSON 比 Node native addon 更安全**——你的失败边界、版本控制、打包复杂度都更优。

### 3.8 观点八：design philosophy 要写进 AGENTS.md，不要靠口口相传

T3 Code 把设计哲学写进 `AGENTS.md`（仓库根目录），这是它最值得抄的地方之一。摘录：

```
1. Open at the core
2. Performance without compromise
3. Remote ready
4. Multi-surface
   - Web (2 surfaces: app.t3.codes + npx t3)
   - Desktop (Electron shell)
   - Mobile (React Native)
```

Theo 的"a note from Theo"段尤其值得读：

> "I like ambitious ideas, simple systems, and software that feels obvious. Do not preserve complexity just because it already exists. Do not introduce machinery because it looks architecturally impressive. Understand the real constraint, then fight for the smallest model that makes the correct behavior unsurprising."

> "Channel both 'measure twice, cut once' and 'yagni'. Fight scope creep."

**结论**：把"我们不做什么"和"我们为什么这么做"明确写进 AGENTS.md——这是高门槛项目唯一能 scale 的方式。

### 3.9 8 条观点的关联结构

```
观点 1：agent harness 是新形态产品
   ↓ (产品定位)
观点 2：执行边界在 server，不在 client
   ↓ (架构基础)
观点 3：event sourcing 是 agent 编排的正确结构
观点 4：provider 抽象在 adapter 层，主干保持纯粹
   ↓ (可扩展性)
观点 5：远程 = 同协议 + 多连接层，不分裂 runtime
观点 6：capability-based OAuth 比角色模型更适合多端
   ↓ (运行质量)
观点 7：独立 Rust sidecar 比 Node native addon 安全
观点 8：design philosophy 写进 AGENTS.md，不靠口口相传
```

观点 1 是产品判断，观点 2/3/4 是工程基础，观点 5/6 是可扩展/可运营，观点 7/8 是工程纪律。少任何一条，整个产品形态会塌。

---

## 四、设计哲学：把 AGENTS.md 读成一份设计宣言

T3 Code 的设计哲学不是官方"manifesto"——它散在 `AGENTS.md`、`docs/internals/*.md`、architecture 决策记录里。把它们汇总起来，得到 6 条**可以独立判断决策**的哲学。

### 4.1 哲学 1：Open at the core

**原文**："T3 Code is truly open. We share our roadmap, we share how we think about things, and of course we share all our code."

**落地**：

- MIT 协议
- Roadmap 在 GitHub 上
- 内部 `.plans/` 目录记录**所有重大决策**（`01-shared-model-normalization.md` → `19-remote-endpoints-hosted-static.md` 完整公开）
- 写给 agent 的 `AGENTS.md` 也是开源的——**你 fork 后它能直接给新 agent 用**
- "We work in the open, and should strive to stay that way."

**判断依据**：如果连设计过程都不公开，"开源"就是壳子。T3 Code 把"open"做成**可审计的工程实践**——`.plans/` 是审计轨迹，`AGENTS.md` 是行动手册。

### 4.2 哲学 2：Performance without compromise

**原文**："Lots of apps have gotten bogged down with bad tech decisions and 'slop'. We have not, and we're proud of the performance of T3 Code. We regularly audit for performance regressions, often caused by sending too much data over websockets, css animations causing gpu spikes, lists being hard to render, and more."

**落地**：

- WebSocket 流量审计——**不要往 ws 发太多数据**
- CSS 动画审计——**不要持续重绘**
- 大列表渲染审计
- **No continuously repainting animations; they peg the GPU on high-refresh displays.**（AGENTS.md 原话）
- T3 Code 用户**整天跟 agent 干活**——"a dropped frame, a lying spinner, and a stale label" 都会被注意到

**判断依据**：agent 的 chat UI 经常是"长期挂着"的——性能问题会从微小摩擦变成持续沮丧。性能不是 nice-to-have，是用户留存。

### 4.3 哲学 3：Remote ready

**原文**："The architecture of T3 Code's websocket layer (npx t3) enables a lot of awesome remote features. These have become core to the product."

**落地**：

- 4 种 access method（直接 / Tailscale / T3 Connect / 桌面 SSH）共享一条 Effect RPC WebSocket
- 4 种 launch method（预跑 / 桌面 SSH 启 / 客户端 publish）只是 server 怎么出现的差异
- Tailscale 是 endpoint provider（add-on），**不是独立 runtime 概念**
- WebSocket 用 **5 分钟短 ticket** 认证（不把长寿命 token 放 URL）
- 任何"新功能"必须考虑"远程场景下能 work 吗"

**判断依据**：agent 是 24×7 跑的——用户不会守在编辑器前。**remote 不是附加功能，是核心能力**。架构早做对，比事后补便宜。

### 4.4 哲学 4：Multi-surface

**原文**："T3 Code has 3 key app surfaces: web, desktop, and mobile."

**落地**：

- **Web 实际上是两个 surface**：`app.t3.codes` 托管 + `npx t3` 本地跑——**两个都要支持**
- Desktop 是 Electron 壳，**加载 web bundle over `t3code://` 协议**
- Mobile 是 React Native（**同一份 `packages/client-runtime`**）
- `apps/web` 和 `apps/mobile` 的 `connection/runtime.ts` **逐行镜像**（除了 platform-specific 后台活动层）

**判断依据**：用户**不会只用一种设备**——桌面干活、手机盯进度、平板看 PR 评审。**多端是真实分布**，不是"加一个 native app 就完事"。

### 4.5 哲学 5：Complexity belongs at the adapter boundary

**原文**："Complexity belongs at the adapter boundary. Orchestration stays pure, UI stays dumb."

**落地**：

- Orchestration 层的 `decider.ts` **纯函数**——`(command, state) => events`，无副作用
- 5 个 provider adapter 把 5 种 CLI 协议的差异**关进各自文件**
- Effect 重度使用在 server，**React components never construct transports, retry loops, or RPC clients**（client-runtime 包了）
- UI 组件是 dumb 的——**domain state 是 Atom 工厂**（`createProjectEnvironmentAtoms`、`createThreadEnvironmentAtoms`）

**判断依据**：**纯函数核心 + 副作用边缘**是软件工程的银弹——可测试、可推理、可演化的部分最大，混乱的部分被压缩在边界。

### 4.6 哲学 6：Event-sourced truth

**文档**："Orchestration is event-sourced. The server does not mutate app state directly. Clients dispatch typed commands; the engine turns them into persisted events; projections derive the read model."

**落地**：

- **read model 跟 event log 同一 SQL 事务**——读模型不可能"长期不一致"
- `processEnvelope` 先查 **durable command receipt**——重试幂等
- **turn 完成** 有权威定义：session 离开 `running`（不是 checkpoint/diff 完成）
- 3 个 queue-backed worker（`ProviderRuntimeIngestion` / `ProviderCommandReactor` / `CheckpointReactor`）基于 `DrainableWorker`——**enqueue 原子 + 计数原子**
- **runtime receipts 是 test-only**——`RuntimeReceiptBusLive` 在生产 no-op，只有 test layer PubSub-backed

**判断依据**：agent 系统天然有"长流程 + 多步 + 易重试 + 工具副作用"——event sourcing 是这种系统的**最自然骨架**。**"requested" 想成"意图被记录"，"completed" 想成"结果被应用"，"receipt" 想成"测试用的异步里程碑"**（glossary 原文）。

### 4.7 哲学小结：6 条哲学构成 T3 Code 的设计宣言

| 哲学 | 一句话 | 落地表现 |
|---|---|---|
| 1. Open at the core | 设计过程也公开 | MIT + `.plans/` 决策公开 + AGENTS.md 开源 |
| 2. Performance without compromise | 性能是用户留存 | WebSocket 流量审计 + 动画审计 + 列表渲染审计 |
| 3. Remote ready | 远程不是附加功能 | 4 种 access 共享 1 协议 + 5 分钟短 ticket |
| 4. Multi-surface | 真实多端 | Web (2) + Desktop + Mobile 共享 client-runtime |
| 5. Complexity at adapter boundary | 纯函数核心 + 边缘副作用 | decider 纯函数 + 5 provider adapter + UI dumb |
| 6. Event-sourced truth | 读模型不可能不一致 | 命令 → 事件 → 投影（同一事务）+ 幂等重试 |

**6 条哲学不是独立的——它们形成一条链**：open 让 fork 容易 → performance 让用户留下 → remote 让 agent 不停 → multi-surface 让用户多端用 → adapter 隔离让 provider 多加 → event-sourcing 让异步不乱。**少任何一条，产品形态都不完整**。

### 4.8 一段"a note from Theo"

AGENTS.md 中 Theo 写的一段话值得单独引用：

> "I like ambitious ideas, simple systems, and software that feels obvious. Do not preserve complexity just because it already exists. Do not introduce machinery because it looks architecturally impressive. Understand the real constraint, then fight for the smallest model that makes the correct behavior unsurprising."

> "Channel both 'measure twice, cut once' and 'yagni'. Fight scope creep. Try to honor the dev's intent in both a minimal and realistic fashion."

> "The rest of this document is meant to help you navigate the codebase and make changes effectively. Think of these instructions less as 'hard rules', more as 'good defaults'. The developer's preferences should be able to override anything here."

**这条不是技术哲学——是工作哲学**。它解释了为什么 T3 Code 选择**包 5 家 provider 而不造第 6 家**、**写 event sourcing 而不写 CRUD**、**用 Rust sidecar 而不写 Node native addon**——都是因为**最简单的模型**。

---

## 五、核心思想总结

T3 Code 给出的最重要判断是：**2026 年，agent 时代的下一个产品形态不是"另一个 agent 框架"，而是"agent harness control surface"——一个能让你在 5 家 provider 之间自由切换、3 个客户端任意切换、4 种远程通道任意切换的本地执行 runtime。**

- **它重新定义了 agent harness**——不是框架，是 control surface；不是单一 provider，是 5 家兼容；不是 desktop-only，是 web + desktop + mobile 三端；不是 local-only，是 4 种远程通道
- **它把"执行边界"划在 server**——所有 provider 进程、terminal、git、fs 都在 server；client 永远不直接调 provider
- **它用 event sourcing 解决 agent 异步**——command → decider → event → projector（同一 SQL 事务），重试天然幂等，turn 完成有权威定义
- **它把 provider 差异关进 adapter**——5 个 driver + 5 个 adapter，orchestration 主干保持纯粹，加第 6 家 provider 不碰主干
- **它把远程做成 4 种 access × 3 种 launch 的矩阵**——同协议 + 多连接层，不分裂 runtime
- **它用 capability scope 鉴权**——OAuth 2.0 风格（RFC 6750/8693/6749）+ 5 分钟 WebSocket ticket + DPoP proof-of-possession
- **它用 Rust sidecar 做 OS-level 资源监控**——不污染 Node runtime，跨平台一致协议
- **它把"我们不做什么"写进 AGENTS.md**——设计哲学、`.plans/` 决策、Hit-every-surface checklist 全公开

记住它的一句话：**T3 Code 不做 agent，不做模型，不做订阅——它做的是"agent harness control surface"：让 Codex/Claude/Cursor/Grok/OpenCode 五家 agent 跑在同一台本地 server 上、被 web/桌面/移动三端从任何地方按你的权限策略控制。**

---

## 附录 A：参考链接

- [T3 Code GitHub 仓库](https://github.com/pingdotgg/t3code)
- [T3 Code README](https://github.com/pingdotgg/t3code/blob/main/README.md)
- [T3 Code AGENTS.md](https://github.com/pingdotgg/t3code/blob/main/AGENTS.md)
- [docs/README](https://github.com/pingdotgg/t3code/blob/main/docs/README.md)
- 用户文档：
  - [Install](https://github.com/pingdotgg/t3code/blob/main/docs/user/install.md)
  - [Permission modes](https://github.com/pingdotgg/t3code/blob/main/docs/user/permission-modes.md)
  - [Remote access](https://github.com/pingdotgg/t3code/blob/main/docs/user/remote-access.md)
  - [Source control](https://github.com/pingdotgg/t3code/blob/main/docs/user/source-control.md)
  - [Keybindings](https://github.com/pingdotgg/t3code/blob/main/docs/user/keybindings.md)
  - [Thread sidebar](https://github.com/pingdotgg/t3code/blob/main/docs/user/thread-sidebar.md)
  - [Project settings](https://github.com/pingdotgg/t3code/blob/main/docs/user/project-settings.md)
  - [Updating](https://github.com/pingdotgg/t3code/blob/main/docs/user/updating.md)
  - [Background service](https://github.com/pingdotgg/t3code/blob/main/docs/user/background-service.md)
- 内部架构：
  - [Architecture overview](https://github.com/pingdotgg/t3code/blob/main/docs/internals/overview.md)
  - [Workspace layout](https://github.com/pingdotgg/t3code/blob/main/docs/internals/workspace-layout.md)
  - [Providers](https://github.com/pingdotgg/t3code/blob/main/docs/internals/providers.md)
  - [Connection runtime](https://github.com/pingdotgg/t3code/blob/main/docs/internals/connection-runtime.md)
  - [Remote architecture](https://github.com/pingdotgg/t3code/blob/main/docs/internals/remote.md)
  - [T3 Connect](https://github.com/pingdotgg/t3code/blob/main/docs/internals/t3-connect.md)
  - [Environment auth](https://github.com/pingdotgg/t3code/blob/main/docs/internals/environment-auth.md)
  - [Server updates](https://github.com/pingdotgg/t3code/blob/main/docs/internals/server-updates.md)
  - [Resource telemetry](https://github.com/pingdotgg/t3code/blob/main/docs/internals/resource-telemetry.md)
  - [Glossary](https://github.com/pingdotgg/t3code/blob/main/docs/internals/glossary.md)
  - [CI gates](https://github.com/pingdotgg/t3code/blob/main/docs/internals/ci.md)
- [Mobile README](https://github.com/pingdotgg/t3code/blob/main/apps/mobile/README.md)
- 下载：[GitHub Releases](https://github.com/pingdotgg/t3code/releases) · `winget install T3Tools.T3Code` · `brew install --cask t3-code` · `yay -S t3code-bin`
- 在线：[app.t3.codes](https://app.t3.codes) · iOS App Store · Google Play
- 社区：[Discord](https://discord.gg/jn4EGJjrvv)
