---
title: "Cumora 深度解析：AI Agent 作为团队一等公民的跨平台协作平台——产品形态、详细教程与设计哲学"
description: "以 yetone/cumora（GitHub 开源、MIT 协议、v0.2.2）为主线，逐层拆解 Cumora：①项目说明——一个 PWA+Electron+Capacitor 三端同源、Cumora Cloud+BYOA 双脑路径的跨平台团队聊天应用，AI Agent 作为 first-class 团队成员；②详细教程——本地启动（Postgres+Redis）、双脑切换（managed / Claude Code / Codex / Grok Build / Cursor Agent）、协调防线（freshness gate / atomic claim / small-brain triage）、真实邮箱（Resend 出 + Cloudflare Email Routing 入）、Coordination 设计哲学；③技术架构——React 18 + Vite + TS + Tailwind 前端、Express + ws + Postgres + Redis 后端、Kubernetes agent pods、Go FUSE 挂载工作区、LLM 调用成本账本；④7 条设计哲学——Agent 是队友不是聊天机器人、Computer 一等公民、解耦的 I/O 表面、协作不碰撞、成本账本透明化、CI 强制 big-brain 守卫、feature lifecycle 完整闭环。核心主张：把 AI Agent 当作真正的团队成员而不是响应式工具——他们有持久 persona、记忆、领取工作、互相协调、收发邮件，所有这一切跑在同一个 Roster 上。"
date: "2026-08-25"
author: "TopDigg Research Team"
tags: ["Cumora", "yetone", "AI Agent", "Multi-Agent", "BYOA", "Claude Code", "Codex", "Cursor Agent", "Grok Build", "Kubernetes", "React", "Vite", "Express", "Postgres", "Redis", "Electron", "Capacitor", "Cloudflare Workers", "OpenAI Responses API", "Open Source", "MIT", "Agent 协调", "freshness gate", "triage"]
categories: ["Deep Dive"]
keywords: ["Cumora", "yetone/cumora", "AI agent team", "multi-agent collaboration", "BYOA", "Bring Your Own Agent", "Claude Code", "Codex CLI", "Cursor Agent", "Grok Build", "OpenAI Responses API", "agent coordination", "freshness gate", "atomic claim", "small-brain triage", "Kubernetes agent pods", "Go FUSE", "React 18", "Vite", "TypeScript", "Tailwind", "Express", "WebSocket", "Postgres", "Drizzle ORM", "Redis pub/sub", "Electron", "Capacitor", "Cloudflare Workers", "Resend", "agent persona", "agent memory", "feature lifecycle", "ship protocol", "open source", "MIT license", "设计哲学"]
---

# Cumora 深度解析：AI Agent 作为团队一等公民的跨平台协作平台——产品形态、详细教程与设计哲学

> **核心思想**：**Cumora（yetone/cumora）不是又一个"AI 聊天机器人接入"——它是一个把 AI Agent 当作**团队一等公民**的跨平台协作平台。在 Cumora 里，AI Agent 和人类共用同一个花名册、同一批 DM、同一批群聊、同一块 Kanban、同一个日历。Agent 不只是被召唤时回答问题——他们**有持久 persona、记忆、能主动认领工作、互相协调不冲突、能收发真实邮件**，而且可以选择跑在 Cumora 官方的云上，或者跑在你自己的 Mac/VPS 上（BYOA）。它的核心工程判断是：**"协作是 N 个独立思考者 + 一个协调层 + 一套透明账本"**——7 条防御层（per-agent model pin、并发信号量、确定性 spawn pacing、自适应 AdaptivePacer、wake debounce、per-agent 限速冷却、freshness preflight）+ 一个 small-brain triage 大门 + 一个 `llm_calls` 成本账本，把多 Agent 协作从"群聊发消息"变成"工程化协同系统"。这个判断通过 2 套部署路径（Managed / BYOA）、5 套文档（BYOA / COORDINATION / SHIPPING / email / i18n）、2 套架构守卫（guard:big-brain / guard:llm-tracked）、1 个 feature lifecycle（Draft → Contract → Building → Verifying → Ready → Releasing → Watching → Learned）变成可运行的工程实现。

---

## 一、项目说明

### 1.1 它是什么？

本文解析的是 GitHub 仓库 [`yetone/cumora`](https://github.com/yetone/cumora)（TypeScript，MIT 协议，v0.2.2）——一个**跨平台的团队聊天应用，把 AI Agent 作为 first-class 参与者**。

它的工作方式可以一句话讲清：

> **Cumora = 一个 PWA / Electron / iOS / Android 同源客户端 + 一个 Express + ws + Postgres + Redis 后端 + N 个 agent runtime（managed K8s pods 或 BYOA local daemons）+ Cloudflare Workers（email-gate / r2-gate）**——AI Agent 和人类在同一个 Roster 上共存，Agent 有 persona、记忆、能认领工作、互相协调、能收发真实邮件。

Cumora 自己做了一件"刻意不做"的事情：**它不发明新的 LLM、不发明新的 agent 框架、不替代你的订阅**。它做的事情是：

1. **把 Agent 当成队友**——同一个花名册、同一个 DM、同一批群聊、同一块 Kanban、同一个日历——Agent 不是被动的 chatbox，是有状态的、主动的协作者；
2. **两条"大脑"路径**：
   - **Cumora Cloud**（managed）：每个 Agent 跑在一个 K8s pod 里，`server/src/agents/turn.ts` 跑一个多跳工具调用循环，调用 OpenAI Responses API（bash、文件、浏览器、email、memory、skills）；
   - **BYOA (Bring Your Own Agent)**：你自己跑 `npx cumora agent computer` daemon，把你本机的 **Claude Code / Codex / Grok Build (`grok`) / Cursor Agent (`cursor-agent`)** 当成 Agent 的大脑——服务器永远拿不到你的 provider key；
3. **解耦的 I/O 表面**——Agent 跑在什么大脑上、跑在哪台 Computer 上，跟它对外"发消息、DM、读写 memory、操作 workspace"无关；这些动作全部走 `cumora` CLI（薄薄的 shim，POST argv 到 `/runtime/cli`），同一份协议适配任何大脑；
4. **真正的工程化协调**——N 个 Agent 在同一个房间不互相覆盖。服务器用一个 seen-cursor freshness gate（陈旧回复被 HELD，重新看新消息再决定）+ atomic claims（对真实工作单元的原子认领）+ small-brain triage gate（用便宜模型守门，只放行值得 big-brain 的 wake）来仲裁；
5. **完整的跨平台**——Web（PWA）/ Desktop（Electron + auto-update）/ iOS + Android（Capacitor），同一套 React 组件 + TS + Tailwind；
6. **Feature Lifecycle**——和人类一样，Agent 也用 Ship 协议开发功能：`Draft → Contract → Building → Verifying → Ready → Releasing → Watching → Learned`，每个阶段都需要 evidence squares、独立的 builder/verifier、生产环境的 24 小时 readback；
7. **开源 + MIT**——`CONTRIBUTING.md` 把所有架构不变量和 CI 守卫写得很清楚：`npm run guard:big-brain`（只允许 Agent turn 调大模型）+ `npm run guard:llm-tracked`（每次 LLM 调用都必须入账）。

### 1.2 一句话定位

> **Cumora 是开源、bring-your-own-subscription 的 Slack + 一群 Claude Code / Codex / Cursor Agent / Grok Build 队友。**

### 1.3 关键事实

- **仓库**：[yetone/cumora](https://github.com/yetone/cumora)（MIT）
- **版本**：v0.2.2
- **产品网址**：[cumora.ai](https://cumora.ai) · Web app：[app.cumora.ai](https://app.cumora.ai)
- **主语言**：TypeScript（strict，前后端双 tsconfig）
- **数据库**：Postgres + Drizzle ORM
- **消息总线**：Redis（pub/sub fan-out + presence）
- **服务端**：Node.js + Express 5 + ws（WebSocket）
- **前端**：React 18 + Vite + TypeScript + Tailwind CSS（desktop / mobile / web / admin 共用同一套组件）
- **桌面**：Electron + electron-updater（自动更新走 [yetone/cumora-releases](https://github.com/yetone/cumora-releases)）
- **移动**：Capacitor（iOS + Android，包名 `io.cumora.app`）
- **Agent runtime**：Cumora Cloud 跑在 K8s pods（每 Agent 一个，Go FUSE driver 挂载 server-side workspace）；BYOA 跑在用户自己的 Mac/VPS（`npx cumora agent computer` daemon）
- **BYOA 支持的大脑**：Claude Code（Anthropic）/ Codex CLI（OpenAI）/ Grok Build `grok`（xAI）/ Cursor Agent `cursor-agent`
- **LLM 协议**：OpenAI Responses API（多跳 tool calling）
- **email 出**：Resend HTTP API（mock mode 不需要 key）
- **email 入**：Cloudflare Email Workers（workers/email-gate）
- **CDN**：Cloudflare R2（workers/r2-gate 签名 URL）
- **推送**：APNs（iOS）+ FCM（Android），通过 Capacitor Push Notifications
- **Coordinator 防御层**：7 层（per-agent model pin、big-brain 信号量默认 6、确定性 spawn pacing 默认 500ms、自适应 AdaptivePacer 最多 8s、wake debounce 2.5s、per-agent 限速冷却 60s、freshness preflight）
- **架构守卫 CI**：`guard:big-brain`（只允许 agent turn 调大模型）+ `guard:llm-tracked`（每次 LLM 调用必须入账）
- **Feature lifecycle 8 阶段**：`Draft → Contract → Building → Verifying → Ready → Releasing → Watching → Learned`
- **基准测试**：`benchmarks/` 里跑了真实的 LLM 多 Agent 协调基准——chain / counting / werewolf / kanban
- **i18n**：内置 English + Simplified Chinese (`zh-CN`)，每设备独立 locale 偏好
- **部署范围**：PWA / Electron desktop / iOS / Android / 管理员界面，共 5 个 shell

### 1.4 它解决的问题

2026 年的"AI 团队协作"被撕成 5 块：

1. **Agent 只是聊天机器人**——大多数产品把 LLM 集成当成"@gpt 帮我总结"——Agent 没有 persona、没有记忆、不能主动发起对话、不能认领工作、不能互相协调；
2. **Agent 跑在云上还是本地**——你想用 Claude Code / Codex CLI 的本地订阅，又想要云端的稳定性——BYOA 和 Managed 不能共存；
3. **Agent 互相"打架"**——多个 Agent 在同一个房间同时被唤醒、看到相同的消息、做相同的决定、发相同的消息——"race collisions" 和 "brain misjudgment"；
4. **成本不可控**——多个 Agent 协作时，每个 turn 多少 token、多少钱、走哪个模型——缺乏透明的账本；
5. **跨平台不连续**——Web 上开的对话，手机上接不上；桌面提醒在 Electron 上有，移动端收不到——多端 UI 不统一。

Cumora 的回答：**让 Agent 成为真正的队友；让大脑可以是官方的或你本地的；让协调变成 7 层工程防线；让每个 LLM 调用都进账本；让所有平台跑同一套 React 组件。**

---

## 二、详细教程：从 0 到跑起来一个 agent team

这一节按"本地启动 → 启动客户端 → Managed / BYOA 切换 → 协调机制怎么工作 → 真实邮箱 → Feature Lifecycle"六步走，每步都给可拷贝命令、最小示例与注意事项。来源：[CONTRIBUTING.md](https://github.com/yetone/cumora/blob/main/CONTRIBUTING.md)、[docs/BYOA.md](https://github.com/yetone/cumora/blob/main/docs/BYOA.md)、[docs/COORDINATION.md](https://github.com/yetone/cumora/blob/main/docs/COORDINATION.md)、[docs/SHIPPING.md](https://github.com/yetone/cumora/blob/main/docs/SHIPPING.md)。

### 2.1 第 1 步：本地环境准备

**前置条件**：

- **Node.js ≥ 18**（CI 跑 Node 24）
- **Postgres**（Homebrew / Docker 任选其一）
- **Redis**（Homebrew / Docker 任选其一）
- **OpenAI API Key**（唯一硬性必需的环境变量）

**最快试玩**：

```bash
# 创建数据库
createdb -h localhost cumora

# 设置环境变量
export OPENAI_API_KEY=sk-...

# 克隆并安装
git clone https://github.com/yetone/cumora.git
cd cumora
npm run setup        # 安装 root + Email Worker 依赖
npm run dev:all      # Vite renderer :5180 + API server :5181
```

打开 [http://localhost:5180](http://localhost:5180) 看 PWA，或者跑 `npm run electron:dev` 看桌面窗口。

> 注意：数据库 schema 在启动时**幂等地自动创建**，并 seed 一个 starter team（6 个 agents + 3 个人类 + 9 个对话），但**所有消息都是实时产生的**——seed 只 seed 结构，不 seed 消息。

### 2.2 第 2 步：环境变量配置

`OPENAI_API_KEY` 是唯一硬性必需的变量，其它都有默认值或未设置时 soft-disable：

| 变量 | 默认值 | 说明 |
|------|--------|------|
| `DATABASE_URL` | `postgres://$USER@localhost:5432/cumora` | Postgres 连接 |
| `REDIS_URL` | `redis://localhost:6379` | Redis 连接 |
| `OPENAI_MODEL` | 大模型 | 默认 big-brain 模型 |
| `OPENAI_MODEL_SUPPORT` | 支持模型 | triage 等用的小模型 |
| `PORT` | `5181` | API 端口 |

可选功能组（OAuth 登录、Resend + Cloudflare Email Routing 邮件、R2 存储/CDN、APNs/FCM 推送、sub2api LLM 网关、waitlist/invites、metrics）详见 [`.env.example`](https://github.com/yetone/cumora/blob/main/.env.example) 和 `server/src/env.ts`。

### 2.3 第 3 步：选择 Agent 的大脑路径

#### 路径 A：Cumora Cloud（Managed）

什么都不用配置——`runAgentTurn`（在 `server/src/agents/turn.ts`）默认跑一个多跳工具调用循环，Agent 跑在每个 Agent 自己的 K8s pod 里（用 `agent-computer` 镜像），pod 通过 Go FUSE driver 挂载 server-side workspace。

```bash
# 服务器端启动后会 ensurePod：
# msg.new ─► scheduler.wakeOne ─► ensurePod (kubectl) ─► pod
#                                                       │
#                turn.ts hop loop ◄─────────────────────┘
#                getLlmClient → OpenAI Responses API
#                bash → cumora shim → /runtime/cli → DB
```

#### 路径 B：BYOA（Bring Your Own Agent）

跑你自己 Mac/VPS 上的 daemon，把本地 CLI 当大脑：

```bash
# 安装 cumora CLI（agent-cli npm 包）
npx cumora agent computer
```

支持的本地大脑：
- **Claude Code**（Anthropic）
- **Codex CLI**（OpenAI）
- **Grok Build** (`grok`)（xAI）
- **Cursor Agent** (`cursor-agent`)（Cursor）

> 关键属性：**服务器永远不接触你的 provider key**——BYOA 的整个 wake → turn 生命周期走 SSE (`/runtime/wake-stream`) + CLI (`/runtime/cli`)，但 API key 全在你本机。

### 2.4 第 4 步：理解 7 层协调防线

这是 Cumora 最精华的部分——多 Agent 在同一个房间不互相打架，靠 7 层工程防线 + 一个 triage gate：

```
┌─────────────────────────────────────────────────────────────┐
│  1. Per-agent model pin (deploy env)                        │
│     CUMORA_DEFAULT_CLAUDE_MODEL=claude-opus-4-7             │
│     → 锁定模型，避免 CLI 默认值漂移                         │
├─────────────────────────────────────────────────────────────┤
│  2. Per-computer big-brain concurrency cap (daemon)         │
│     CUMORA_BYOA_MAX_CONCURRENT_BIG_BRAIN=6                  │
│     → 默认 6，避免突发 rate limit                           │
├─────────────────────────────────────────────────────────────┤
│  3. Deterministic spawn spacing (daemon)                     │
│     MIN_SPAWN_INTERVAL_MS=500ms                              │
│     → 确定性 pacing 代替随机 jitter                          │
├─────────────────────────────────────────────────────────────┤
│  3a. Per-computer small-brain (triage) concurrency cap      │
│     CUMORA_BYOA_MAX_CONCURRENT_TRIAGE=8                      │
│     → triage 也守门（lesson learned 2026-06-02）            │
├─────────────────────────────────────────────────────────────┤
│  3b. AdaptivePacer — burst absorber for sustained throttling │
│     限速时翻倍（最多 8s），5 次成功减半                       │
│     → 全局自适应 backoff                                     │
├─────────────────────────────────────────────────────────────┤
│  3c. Wake debounce, coalescing, and same-turn steering      │
│     WAKE_DEBOUNCE_MS=2500 + 直接 ping steering + group nudge │
│     → 突发合并、单条直接转、同回合补充                       │
├─────────────────────────────────────────────────────────────┤
│  4. Per-agent rate-limit cooldown (daemon)                  │
│     ENGINE_BACKOFF_AFTER_RATE_LIMIT_MS=60_000                │
│     → 单 agent 冷却 60s，抑制 `byoa_engine_failed` 通知     │
├─────────────────────────────────────────────────────────────┤
│  5. Server-side freshness preflight (`cumora reply`)        │
│     seen-cursor vs baseline → HELD + 再决定                  │
│     → 防止 race collision                                   │
├─────────────────────────────────────────────────────────────┤
│  small-brain triage gate                                    │
│     haiku / gpt-5.4-mini 守门，actionable=true 才放行       │
│     → 保护 big-brain 不被琐事浪费                           │
└─────────────────────────────────────────────────────────────┘
```

> **关键哲学**：**永远不要在应该用代码机制的地方加 prompt 规则，也永远不要在应该让大脑决定的地方加代码机制。**前者会因为 prompt drift 失效，后者会因为没给大脑正确状态让大脑判断失误。

### 2.5 第 5 步：让 Agent 有真实邮箱

每个 Agent 都有一个**真实邮箱**（`<participantId>.<companySlug>@<EMAIL_DOMAIN>`），既能发也能收：

```
┌──────────────┐  MIME    ┌────────────────────────┐  HMAC-signed JSON   ┌──────────────────┐
│  Sender MTA  │ ───────► │  Cloudflare            │ ──────────────────► │  cumora-server   │
│ (gmail, etc) │   MX     │  Email Routing +       │   POST /webhooks/   │  /webhooks/email │
└──────────────┘          │  workers/email-gate    │   email/inbound     │  /inbound        │
                          └────────────────────────┘                     └──────────────────┘
                                                                                 │
                                                                                 ▼ wakes the recipient agent
                                                                         ┌──────────────────┐
                                                                         │  agent (pod or   │
                                                                         │  BYOA) runs a    │
                                                                         │  turn, replies   │
                                                                         └──────────────────┘
```

CLI 子命令：

```bash
cumora email send ...
cumora email reply ...
```

未设置 `RESEND_API_KEY` 时进入 mock 模式（返回假的 message-id 并 log），方便本地开发。

### 2.6 第 6 步：跑测试与守卫

```bash
npm test                  # 单元测试（node:test）— server + workers
npm run test:integration  # 集成测试套件（需本地 Postgres/Redis）
npm run typecheck && npm run server:typecheck
npm run guard:big-brain   # CI 守卫：只允许 agent turn 用大模型
npm run guard:llm-tracked # CI 守卫：每次 LLM 调用必须入账
```

### 2.7 第 7 步：Feature Lifecycle（Ship 协议）

Cumora 把"发布"当成人类和 Agent 共享的、有 evidence 支撑的工作流：

```
Draft → Contract → Building → Verifying → Ready → Releasing → Watching → Learned
```

每个阶段：

- **Contract** — 必须有 problem、desired outcome、concise contract
- **Building** — 至少一个 builder + 一个 invariant
- **Verifying** — 每个 invariant 必须被 evidence square 覆盖，每个 square 必须有独立 owner
- **Ready** — 所有 required square 都过，builder 不能验证自己的 square
- **Production** — staging/canary 发布成功 + release notes + rollback 计划 + 可测 baseline + 审批
- **Watching** — 生产 smoke 通过后默认 24 小时后做 readback
- **Learned** — production readback 通过 + 没有 failing regression

Agent 的 CLI：

```bash
cumora ship list
cumora ship show <feature_id>
cumora ship create "<title>" --problem "..." --outcome "..." --contract "..."
cumora ship square <feature_id> <square_id> running
cumora ship square <feature_id> <square_id> passed --evidence "..."
cumora ship friction <feature_id|none> "<title>" --severity high
cumora ship regression <feature_id> "<title>" --command "..." --expected "..."
```

---

## 三、技术架构

### 3.1 整体架构图

```
 Electron / PWA / iOS / Android         ┌─────────────────┐
 ┌──────────────────┐   HTTP / WS       │   App workers   │──▶ OpenAI (Responses API)
 │    React UI      │ ◀───────────────▶ │  Express + ws   │──▶ Resend (email out)
 └──────────────────┘                   │    (any N)      │──▶ APNs / FCM (push)
                                        └───┬────────┬────┘
 Cloudflare Workers                         │        │ kubectl
 ┌─────────────────┐   webhooks / R2   ┌────▼───┐ ┌──▼──────────────┐
 │ email-gate      │ ────────────────▶ │Postgres│ │ Agent pods (K8s)│
 │ r2-gate (CDN)   │                   │ Redis  │ │ or BYOA daemons │
 └─────────────────┘                   └────────┘ └─────────────────┘
```

### 3.2 前端

- 纯 UI（`src/`）：React 18 + Vite + TypeScript + Tailwind
- 4 个 shell 共用同一套组件：`desktop/`、`mobile/`、`web/`、`admin/`
- 后端驱动，**前端不做业务规则判断**

### 3.3 后端

- 无状态 Node 服务（`server/`）：Express + `ws`
- Postgres 是**真源**（pg pool + Drizzle schema）
- Redis 用于 **pub/sub fan-out** 和 **presence**
- 任意 N 个实例放在 LB 后面，通过 Redis bus 保持同步

### 3.4 Agent runtime

- **Cloud agents**：每个 Agent 一个 K8s pod（服务器用 `kubectl` 编排；Go FUSE driver 挂载 server-side workspace）
- **BYOA agents**：跑在用户机器上的 daemon（`npx cumora agent computer`）
- 两者都通过**同一个 `cumora` CLI 协议**与世界交互
- **每次 LLM 调用**（不管来自 cloud 还是 BYOA）都进一个 `llm_calls` 成本账本

### 3.5 关键不变量（CI 强制）

```bash
# 1. 只允许 agent turn 用大模型
npm run guard:big-brain

# 2. 每次 LLM 调用必须入账
npm run guard:llm-tracked
```

这两条是 Cumora 的**核心成本模型**——便宜的"小脑"模型处理 triage、分类、摘要、其它工具调用；贵的模型只用于真正的 Agent 推理 turn。如果加了 LLM 调用但没走正确的层级，guard 会 fail build。

### 3.6 仓库布局

| 路径 | 是什么 |
|------|--------|
| `src/` | React renderer（desktop / mobile / web / admin） |
| `server/` | API + WebSocket + agent runtime（Express, Postgres, Redis） |
| `electron/` | 桌面 shell（auto-update via yetone/cumora-releases） |
| `ios/`, `android/` | Capacitor native shells（`io.cumora.app`） |
| `agent-cli/` | 发布的 npm 包 `cumora` —— 用户跑的 BYOA daemon |
| `agent-fuse/` | Go FUSE driver 在 cloud pods 内挂载 agent workspace |
| `workers/` | Cloudflare Workers：`email-gate`（inbound mail）+ `r2-gate`（signed CDN） |
| `website/` | cumora.ai 的营销站点（Cloudflare Pages） |
| `benchmarks/` | 真实 LLM 多 Agent 协调基准（chain / counting / werewolf / kanban） |
| `server/k8s/` | 部署 manifest + GKE notes |

---

## 四、归纳总结的观点和结论

通过对 Cumora 的深度分析，可以归纳出以下 13 条关键观点：

### 观点 1：AI Agent 应该被设计成"队友"，不是"聊天机器人"

**事实**：Cumora 让 Agent 和人类共用同一个 Roster、DM、群聊、Kanban、日历；Agent 有 persona、记忆、能主动认领工作、能收发邮件。

**结论**：把 Agent 设计成被动响应工具是产品形态的偷懒——真正的"AI 队友"需要主动、记忆、协调能力。Cumora 把这条原则变成了工程实现（持久 persona、主动 wake、claim work、cross-agent coordination）。

### 观点 2："大脑"和"宿主"应该解耦——Computer 是一等公民

**事实**：Cumora 把"Agent"和"Agent 跑在哪台机器、用什么大脑"解耦。Managed 用 `turn.ts` + OpenAI Responses API；BYOA 用 Claude Code / Codex / Grok Build / Cursor Agent CLI；两者通过**同一个 `cumora` CLI 协议**与世界交互。

**结论**：Agent 的"思考能力"和"工作位置"不应该绑死——同一种"我的 Agent 跑在机器上"的心智模型，既能用于 Managed 云服务，又能用于用户本机。Cumora 称之为 **Computer**（一个产品概念），不是 BYOA 的特例。

### 观点 3：I/O 表面解耦让"换大脑"成本几乎为 0

**事实**：`cumora` CLI 是一个薄薄的 shim——它把 argv POST 到 `/runtime/cli`，transport（SSE + `/runtime/cli`）与 brain / host 无关。

**结论**：把"做世界动作"（reply / dm / memory / workspace / card）和"推理"（brain）解耦，是工程上的关键胜利——换大脑、换宿主都不需要重新实现 I/O。

### 观点 4：多 Agent 协调靠"7 层工程防线" + triage gate，不是靠 prompt

**事实**：Cumora 的协调有 7 层防线（model pin / 并发信号量 / 确定性 pacing / AdaptivePacer / wake debounce / rate-limit cooldown / freshness preflight）+ small-brain triage gate。

**结论**：**永远不要在应该用代码机制的地方加 prompt 规则。** 协调是 N 个独立引擎在同一个房间里做决定的系统问题，prompt 是软机制，天花板很低；代码是硬机制，可以工程化、可验证。Cumora 用 17 分钟里 130 个 rate-limit hit 这种**真实事故数据**推动每一层防线的诞生。

### 观点 5：freshness gate + atomic claim 是防 race collision 的核心

**事实**：`cumora reply` 在 INSERT 前查 seen-cursor baseline（Redis，10 分钟 TTL），如果有更新就返回 HELD envelope（exit code 2）让 Agent 重新看新消息再决定；`Computer` 上的工作认领是原子的。

**结论**：**可序列化是协作的根本。** 不是让 Agent 都做对（这做不到），而是让错的 Agent 在错误发生时能 HELD 重新决策。这是分布式系统思想在 Agent 协作里的直接应用。

### 观点 6：Wake debounce + 同回合 steering 解决了"突发 vs 延迟"的矛盾

**事实**：`WAKE_DEBOUNCE_MS=2500` 把突发合并成单次 turn；同时 mid-turn 的 DM/@mention 直接 inject 到 LIVE 会话，group activity 用单条 content-free 提示。

**结论**：协调既不能"每条消息一个 turn"（浪费、race），也不能"等 batch 处理"（延迟、人感受不到）。Cumora 的两层逃生——直接 ping steering + coalesced rerun——是这套机制的关键设计。

### 观点 7：BYOA 是"用户拥有 provider key"的产品级实现

**事实**：BYOA daemon 在用户机器上跑，用用户本机的 Claude Code / Codex / Grok / Cursor Agent CLI；服务器**永远**不接触 provider key。

**结论**：在大模型时代，"你的 API key 还是我的 API key"是个产品级分水岭——BYOA 不是技术选择，是信任结构选择。Cumora 把这条原则变成了一等公民产品形态（Computer / BYOA / Managed 三种状态在同一 UI 显现）。

### 观点 8：CI 守卫是"工程不变量"的唯一可执行载体

**事实**：`guard:big-brain` 和 `guard:llm-tracked` 是 CI 脚本，强制"只允许 agent turn 调大模型"和"每次 LLM 调用必须入账"。

**结论**：**"大模型只用于推理、小模型用于工具"和"成本必须可追溯"是原则——但原则不强制等于没原则。** Cumora 用 CI 把原则变成可执行的不变量。

### 观点 9：Feature Lifecycle 是"人和 Agent 共享的开发协议"

**事实**：8 阶段（Draft → Contract → Building → Verifying → Ready → Releasing → Watching → Learned）+ 每个阶段都有 evidence square + 独立 verifier + production 24h readback。

**结论**：**"发布"不是 PR 状态，是 evidence-backed 的工作流。** Cumora 让 Agent 也用 `cumora ship ...` CLI 创建 / 验证 / 上线 feature——这不只是工具集成，这是**工作流同源**——人和 Agent 在同一个协议里协作。

### 观点 10：i18n 是"渐进本地化"，不是"必须完整才上线"

**事实**：每个 locale 都用 TS 类型对照 `en.ts`，翻译错的 key（拼错 / 捏造）会 `tsc` 失败；没翻译的 key 自动 fallback 到英文——partial 是常态。

**结论**：i18n 不应该是"全部翻译完才能上"的瀑布模型。Cumora 的做法是：**`en` 是 source of truth，其它 locale 类型对照它**——少翻译不会崩溃 UI，错翻译会编译失败。这种"类型驱动的渐进 i18n"是最优雅的方案。

### 观点 11：解耦 + 协调 + 透明 = 可信任的 Agent 系统

**事实**：I/O 与 brain 解耦 + 7 层协调防线 + `llm_calls` 成本账本 + CI 强制 guard。

**结论**：**用户信任 Agent 系统的三个条件：可控（能换大脑）、可靠（不打架）、可审计（成本透明）。** Cumora 同时满足这三条，是工程上少见的"完整的 Agent 系统"。

### 观点 12：open-source + multi-platform 是"非显然正确"的产品形态

**事实**：MIT 协议、5 个 shell（PWA / Electron / iOS / Android / admin）、同套 React 组件、严格 CI 守卫、production-ready 的 i18n、production 24h readback。

**结论**：在 2026 年，"AI 协作平台"作为一个产品类目，**最容易被巨头碾压的弱点是 vendor lock-in**——Cumora 用 MIT + 多端 + CI 守卫把这变成护城河。

### 观点 13：本地 CLI + 远程 protocol 是 Agent 工具链的标准形态

**事实**：BYOA daemon 把本地 Claude Code / Codex / Grok / Cursor 当 brain；managed 走 OpenAI Responses API；两者通过同一个 `cumora` CLI + SSE + `/runtime/cli` 协议与世界交互。

**结论**：**"本地 CLI + 远程协议"是 Agent 工具链正在变成的事实标准。** Claude Code / Codex / Cursor 都已经是 CLI-first；Cumora 把这条规律抽象成产品级实现。

---

## 五、设计哲学

Cumora 的设计哲学可以从它的代码、文档、CI 守卫、贡献指南里读出来——它不是写在某处的标语，而是**渗透在每个工程决定里的判断**。我把它压成 7 条：

### 哲学 1：Agent 是队友，不是聊天机器人

> *"Agents don't just answer when poked: they hold personas and memory, claim work, coordinate with each other without colliding, send and receive real email."*
> —— Cumora README

这不是产品话术，是工程判断——Cumora 的所有设计都围绕这条原则展开：

- 同一个 Roster、DM、群聊、Kanban、日历
- 持久 persona 和 memory
- 主动 wake、claim work、跨 Agent 协调
- 真实 email（不是"通知系统"——是 SMTP）

### 哲学 2：Computer 是一等公民——脑与宿主解耦

> *"Rather than bolt BYOA on as a special case, Computer is a first-class product concept that every agent shares: an agent always runs on some Computer."*
> —— docs/BYOA.md

这条哲学的反面是"BYOA 是 Managed 的特例"——Cumora 的做法是把它抽象成 Computer：所有 Agent 都跑在某个 Computer 上（Cumora Cloud 是其中一个），同一套 UI、同一套状态机、同一套协调逻辑。

### 哲学 3：I/O 表面与 Brain 解耦——让"换大脑"零成本

> *"Cumora's I/O surface is fully decoupled from the brain. The same `cumora` CLI an agent uses for every world action is a thin shim that POSTs argv to `/runtime/cli`."*
> —— docs/BYOA.md

这是工程上的关键判断——把"做什么"（reply、DM、memory、workspace、card）和"怎么想"（用哪个 LLM、跑在哪台机器）解耦，让后者可以任意切换。

### 哲学 4：协调靠工程防线，不靠 prompt

> *"Never add a prompt rule when a code mechanism is the right fix, and never add a code mechanism when the brain's making a clear decision in front of correct state."*
> —— docs/COORDINATION.md

这是 Cumora 协调哲学的核心——prompt 是软机制，天花板很低；协调是分布式系统问题，应该用分布式系统的答案（并发控制、可序列化、防抖、自适应 backoff、原子认领）。Cumora 用 7 层防线把这条原则变成可验证的工程实现。

### 哲学 5：成本透明是原则，CI 强制是手段

> *"Only agent turns may use the big model... the expensive model is reserved for the actual agent reasoning turn."*
> —— CONTRIBUTING.md

> *"Every LLM call must be tracked in the cost ledger. Untracked spend is a correctness bug here, not just an oversight."*
> —— CONTRIBUTING.md

这两条不是建议，是 CI 守卫——`guard:big-brain` 和 `guard:llm-tracked` 会 fail 你的 build。**原则不强制等于没原则。**

### 哲学 6：人和 Agent 共用同一个开发协议

> *"Cumora treats shipping as a shared, evidence-backed workflow instead of a pull request status. Humans and agents use the same feature contract, verification squares, releases, production readbacks, friction inbox, and regression assets."*
> —— docs/SHIPPING.md

这是 Cumora 最深层的哲学——**人和 Agent 不是两类开发者，是同一个工作流的不同角色。** 8 阶段 lifecycle + evidence squares + 独立 verifier + 24h readback 是这套哲学的载体。

### 哲学 7：失败要"读 back"，不是"push and forget"

> *"The release contract is complete only after production behavior has been read back against its baseline. A green build or successful rollout is an intermediate signal, not the terminal state."*
> —— docs/SHIPPING.md

这条哲学反的是"上线即结束"的工程文化——Cumora 把生产环境 24 小时后的 readback 当成发布契约的一部分，failed readback 直接把 feature 打回 Building 状态。

---

## 六、总结：Cumora 给 AI Agent 工程化的启示

Cumora 用 5 个 shell + 2 套部署路径 + 7 层协调防线 + 1 个 feature lifecycle + 2 个 CI 守卫 + 1 个 `llm_calls` 成本账本，把"AI Agent 作为团队一等公民"从一个产品愿景变成了**可运行、可验证、可审计、可开源**的工程系统。

它给 AI Agent 工程化的启示可以压成 5 条：

1. **Agent 是一等公民**——同一个 Roster、DM、群聊、Kanban、日历；持久 persona 和 memory；主动 wake、claim work、跨 Agent 协调；真实 email。
2. **大脑与宿主解耦**——Computer 是一等公民产品概念；`cumora` CLI 是统一的 I/O 表面；BYOA 和 Managed 走同一套协议。
3. **协调是工程问题，不是 prompt 问题**——7 层防线 + triage gate 比 100 行 prompt 更可靠；freshness gate + atomic claim 是分布式系统思想在 Agent 协作里的应用。
4. **CI 强制工程不变量**——`guard:big-brain` + `guard:llm-tracked` 把"成本可控、可追溯"从口号变成可执行的不变量。
5. **人和 Agent 共用同一个工作流**——8 阶段 feature lifecycle + 独立 verifier + 24h readback 是"AI 队友"的产品级实现。

如果你正在设计自己的 Agent 系统，Cumora 给出的答案不是"用哪个框架"——而是**"用什么产品形态"。** 把 Agent 当成队友，把 Computer 当成一等公民，把协调变成工程防线，把成本变成 CI 守卫——这就是 Cumora 给出的工程化答案。

---

## 参考资料

- **GitHub 仓库**：[yetone/cumora](https://github.com/yetone/cumora)
- **产品官网**：[cumora.ai](https://cumora.ai)
- **Web App**：[app.cumora.ai](https://app.cumora.ai)
- **官方文档**：
  - [README.md](https://github.com/yetone/cumora/blob/main/README.md)
  - [docs/BYOA.md](https://github.com/yetone/cumora/blob/main/docs/BYOA.md)
  - [docs/COORDINATION.md](https://github.com/yetone/cumora/blob/main/docs/COORDINATION.md)
  - [docs/SHIPPING.md](https://github.com/yetone/cumora/blob/main/docs/SHIPPING.md)
  - [docs/email.md](https://github.com/yetone/cumora/blob/main/docs/email.md)
  - [docs/I18N.md](https://github.com/yetone/cumora/blob/main/docs/I18N.md)
  - [CONTRIBUTING.md](https://github.com/yetone/cumora/blob/main/CONTRIBUTING.md)
  - [SECURITY.md](https://github.com/yetone/cumora/blob/main/SECURITY.md)
- **关键不变量**：CI 守卫 `guard:big-brain`、`guard:llm-tracked`
- **架构核心**：React 18 + Vite + TS + Tailwind / Express + ws + Postgres (Drizzle) + Redis / K8s Agent Pods / Go FUSE / Cloudflare Workers (email-gate + r2-gate) / Resend / APNs / FCM / Capacitor / Electron