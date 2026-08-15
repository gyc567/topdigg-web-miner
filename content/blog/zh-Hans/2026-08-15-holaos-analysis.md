---
title: 'holaOS 深度解析：属于你和你的 Agent 的电脑——一个开源的全能 AI Agent 工作空间'
date: "2026-08-15"
description: "深入解析 holaboss-ai/holaOS（7.4k Stars 开源项目，Electron + TypeScript）：开源的全能 AI Agent 工作空间——在一个本地优先的工作空间里运行任何 Agent（Claude Code、Codex、holaOS 内置 Agent），共享同一份内存、同一套工具、同一个工作区。核心思想：'The Computer for You and Your Agent'（属于你和你的 Agent 的电脑）——Agent 时代的主角不是聊天窗口，而是一台你可以与 Agent 共同使用的电脑；真正有价值的不是模型本身（模型已商品化），而是 Agent 之上的工作空间层：共享内存、真实应用界面（HolaApps）、可让 Agent 操作的完整工作站。项目说明：本地优先的 Electron 桌面应用 + 进程内运行时（runtime/{harnesses,harness-host,api-server,state-store}），bun + turbo monorepo；六大特性——运行任何 Agent、一份内存所有 Agent 共享、模型内置或 BYOK、HolaApps 真实应用界面、Skills/Integrations/MCP 一次教学处处复用、整个工作站可被 Agent 操作（真实浏览器/前沿生成/真实交付物/任意聊天入口/自动化）；三形态交付（桌面 App/开源自托管/企业版 SSO）。详细教程：一键安装（install.sh）、手动安装全流程（desktop:install → .env → prepare-runtime:local → typecheck → dev）、运行时捆绑（自包含 runtime：API + 内置 Node/npm + 内置 Python）、hola CLI 调试 pi 大脑、打包发布（dist:mac/dist:win、CI 签名公证、YYYY.MDD.R 版本号）、安全模型（contextIsolation/nodeIntegration/webviewTag）。设计哲学：本地优先与数据所有权、Agent 无关（无锁定）、共享上下文优于 Agent 孤岛、真实界面而非聊天记录、一次教学处处复用、零设置默认 + BYOK 灵活、自包含运行时、安全至上、人在回路。观点归纳：Agent OS 是下一个平台层；内存是护城河；模型商品化后工作空间层捕获价值；开源 + 托管的双路径；自包含运行时是 AI 工作空间的务实选择。"
tags:
  - holaOS
  - Holaboss
  - AI Agent
  - Agent Workspace
  - Agent OS
  - Electron
  - TypeScript
  - Claude Code
  - Codex
  - MCP
  - Skills
  - 共享内存
  - Local-First
  - BYOK
  - HolaApps
  - 设计哲学
categories:
  - 深度解析
  - AI Agent
  - 开源项目
---

# holaOS 深度解析：属于你和你的 Agent 的电脑——一个开源的全能 AI Agent 工作空间

> 核心思想：**"The Computer for You and Your Agent"（属于你和你的 Agent 的电脑）**。holaOS 的创始人认为，Agent 时代真正的主角不是一个个聊天窗口，而是一台**你可以与 Agent 共同使用的电脑**。它把这个理念落成一个开源的全能 AI Agent 工作空间：在一个本地优先的工作区里运行**任何** Agent（Claude Code、Codex、或 holaOS 内置 Agent），它们共享同一份内存、同一套工具、同一个浏览器、同一个应用生态——"用最适合工作的 Agent，而不是每次都重新搭建环境"。更深刻的判断是：**模型本身正在快速商品化（模型层价值趋零），真正捕获价值的是 Agent 之上的"工作空间层"**——共享内存、真实应用界面、可被 Agent 操作的完整工作站。

## 文章背景与项目简介

2026 年，AI Agent 领域的竞争已经进入白热化：Claude Code、OpenAI Codex、Cursor、Windsurf……每个 Agent 都试图成为开发者的唯一入口。但 holaOS 的团队（holaboss-ai）提出了一个不同的视角：**为什么我们要在 Agent 之间做单选题？**

holaOS 的答案是——不要押注某一个 Agent，而是押注**承载所有 Agent 的那台"电脑"**。就像你不会因为换了浏览器就丢失文件、书签和历史记录一样，你也不应该因为换了 Agent 就丢失内存、工具和技能。holaOS 就是这个"Agent 时代的操作系统"：它是开源的、本地优先的、与具体 Agent 无关的**工作空间层**。

### 项目元信息

| 字段 | 值 |
|------|-----|
| 仓库 | https://github.com/holaboss-ai/holaOS |
| Stars | 7.4k |
| Forks | 642 |
| Watchers | 172 |
| License | Modified Apache 2.0（附加商业分发与品牌条款） |
| 语言 | TypeScript（Electron 桌面应用 + 进程内运行时） |
| 包管理 | bun 1.3.6 + turbo（monorepo） |
| 平台 | macOS（Apple Silicon + Intel）、Windows、Linux |
| 形态 | Electron 桌面应用 + 自包含运行时捆绑 |
| 提交数 | 73 commits |
| 官网 | https://www.holaos.ai |
| 安全报告 | admin@holaboss.ai（私有报告） |

### 一句话定位

holaOS 是一个**开源的、本地优先的全能 AI Agent 工作空间（All-in-One AI Agent Workspace）**：在一个工作区里运行任何 Agent——Claude Code、Codex、或内置的 holaOS Agent——共享同一份内存、同一套工具、同一个应用生态，模型内置或自带密钥（BYOK）均可。

## 核心思想：为什么是"一台电脑"，而不是"一个聊天框"

holaOS 整个项目的灵魂可以拆成四个递进的判断：

### 1. Agent 时代的主角是"电脑"，不是"聊天"

绝大多数 AI 产品把交互设计成聊天框：你发消息，AI 回复文本。holaOS 的创始人认为这是错的隐喻。真正的范式是**电脑**——你和 Agent 共享一台机器、一套文件、一个浏览器、一组应用。Agent 产出的不是"对话记录"，而是**真实落地的成果**：真实的 `.xlsx` 报表、真实的 `.pptx` 幻灯片、真实的 `.docx` 文档、真实的操作过的应用界面。

### 2. 模型已商品化，价值在工作空间层

内置 Kimi K3、GLM 5.2（日常性价比）、GPT 5.6、Claude Opus 5、Fable 5（困难任务），同时支持 OpenAI/Anthropic 或任何兼容端点的 BYOK——这背后的判断是：**模型本身已经不再是差异化来源**。差异化在于模型之上的那一层：内存、工具、技能、应用、工作流的**编排与共享**。

### 3. 无锁定：Agent 是插拔的，工作空间是持久的

holaOS 明确打出"No lock-in"（无锁定）：带来你已经信任的 Agent 即可。换 Agent、关应用、下周再回来——它还记得你上次停在哪里。**共享一切**（一份上下文、一套工具、一个工作区）+ **一致的结果**（无论谁在驱动，技能和集成始终如一）。

### 4. 一次教学，处处复用（Teach once, reuse everywhere）

在 holaOS 里，你为某个 Agent 配好的 Skills（技能）、Integrations（集成）、MCP 服务器、Combos（组合包），**所有 Agent 自动继承**。这直接把"换 Agent 的迁移成本"降到了零——这正是无锁定承诺能成立的技术基础。

## 项目说明：holaOS 是什么

### 六大核心特性

#### 🔀 运行任何 Agent，一个工作空间

Claude Code、Codex、内置 holaOS Agent——并排运行，无需切换。无论运行哪个，都共享同一份内存、工具、技能和应用。

#### 🧠 一份内存，所有 Agent 共享

上下文、偏好、项目历史存放在**单一共享内存**中——以**本地纯文本文件**存储，你可以直接阅读和编辑。切换 Agent、关闭应用、一周后回来：它已经知道你在哪里停下的。

- **永不从零开始**——跨会话、跨 Agent 的持久内存
- **本地优先、属于你**——在你的机器上，可见可编辑，不锁在别人的云端
- **真正可召回**——结构化和嵌入式的存储，让正确的上下文在需要时返回

#### 💸 模型你做主——内置或自带

一个账号，所有模型，无需密钥、无需设置、无需在提供商之间切换。前沿模型**内置**：性价比的 **Kimi K3** 和 **GLM 5.2** 处理日常量，顶级的 **GPT 5.6**、**Claude Opus 5**、**Fable 5** 处理难题。想用自己的提供商？为 OpenAI、Anthropic 或任何兼容端点**自带密钥（BYOK）**——那些跑在你的账号上，而不是你的 holaOS 套餐上。

#### 🪟 HolaApps——应用与 Agent 并排

从工作区内的应用市场安装应用，它们会作为**真实的、可交互的界面**打开在你的 Agent 旁边。看着它在应用里工作，随时插手，结果就地落地——不是一堵聊天文本墙，而是**真正的应用**，由 Agent 驱动，就在 Agent 旁边。

- **真实界面，不是聊天**——每个应用都是活 UI（Notion、浏览器、你自己的应用）
- **并排是设计**——应用和 Agent 共享屏幕
- **一键安装**——浏览应用市场，即刻打开
- **自带应用**——把任何 URL 和 MCP 服务器指向一个 HolaApp

#### 🧩 Skills、Integrations 与 MCP——一次教学，处处复用

- **Integrations**——Gmail、Notion、Slack、GitHub、Linear 等 50+ 应用一键 OAuth 连接，Agent 直接跨工具读写，无需胶水代码
- **MCP**——接入任何 Model Context Protocol 服务器，或一键安装社区 MCP 服务器
- **Skills**——把工作流打包一次，任何 Agent 按需运行
- **Combos**——把技能和集成捆绑成一次点击的安装包

#### 🛠️ 你的整个工作站，可被 Agent 操作

- **🌐 真实浏览器，由 Agent 驱动**——已登录的浏览器让 Agent 浏览、点击、提取，一切在你的掌控之下
- **🎨 前沿生成内置**——最新的图像、视频、音频模型在每个 Agent 里
- **📄 真实交付物**——报表、表格、幻灯片存成真实的 `.xlsx`、`.pptx`、`.docx` 文件
- **💬 从任何聊天入口触达**——飞书、微信、Slack、Telegram
- **⏰ 自动化**——按计划或触发器运行

### 三种运行形态

| 形态 | 说明 |
|------|------|
| 🖥️ 桌面 App | 下载即用，前沿模型内置，免费开始 |
| 🔓 开源自托管 | Modified Apache 2.0，自带密钥，完全跑在自己的机器上 |
| 🏢 企业版 | SSO + 每个 Agent/技能/应用的按角色权限、审计日志、内部系统安全连接、本地或自有云部署 |

### 技术架构：Electron 桌面 + 进程内运行时

holaOS 采用 bun + turbo 的 monorepo 结构，核心是**桌面应用**与**进程内运行时**的分离：

```text
holaOS/
├── apps/                     # 应用
│   ├── desktop/              # Electron 桌面应用（Vite renderer + electron main/preload）
│   └── docs/                 # 文档站
├── runtime/                  # 进程内运行时（核心）
│   ├── api-server/           # 运行时 API 服务器
│   ├── channel-gateway/      # 通道网关
│   ├── harness-host/         # 运行时宿主机（pi/Hola 大脑在此运行）
│   ├── harnesses/            # 各类 harness（含 pi 大脑）
│   └── state-store/          # 状态存储（better-sqlite3）
├── packages/                 # 共享包（如 @holaboss/app-sdk）
├── shared/                   # 共享代码
├── scripts/                  # install.sh、hola.mts 等
└── patches/                  # 依赖补丁
```

桌面端是 Electron + React 19 + TypeScript + Vite + Tailwind CSS，三栏布局（文件资源管理器 / 内置浏览器面板 / AI 聊天助手），通过安全的 preload 桥接（`contextIsolation: true`、`nodeIntegration: false`、`webviewTag: true`）访问本地文件系统与内置浏览器。

运行时是**自包含捆绑**（runtime bundle）：打包了运行时 API、内置的 Node/npm、内置的 Python——桌面应用在 `apps/desktop/out/runtime-<platform>` 下 staging 运行时，保证环境确定性与可移植性。

### 内置 Skills（默认技能库）

audience-analyst（受众分析）、content-planner（内容规划）、content-writer（内容写作）、data-analyst（数据分析）、email-writer（邮件写作）、idea-generator（创意生成）、image-generator（图像生成）、meeting-notes（会议纪要）、performance-reporter（绩效报告）、prd-writer（PRD 写作）、proposal-writer（提案写作）、summarizer（摘要）、tone-adapter（语气适配）、translator（翻译）、trend-spotter（趋势发现）、video-generator（视频生成）、web-researcher（网络研究）——这是"一次教学、处处复用"的默认示例。

## 详细教程：从零安装 holaOS

### 方式一：一键安装（推荐）

在 macOS、Linux 或 WSL 的全新机器上：

```bash
curl -fsSL https://raw.githubusercontent.com/holaboss-ai/holaOS/refs/heads/main/scripts/install.sh | bash -s -- --launch
```

该脚本默认会：
1. 缺 git 则安装 git
2. 缺 Node.js 24 + npm 则安装
3. 克隆仓库到 `~/holaboss-ai`
4. 按需从 `apps/desktop/.env.example` 创建 `apps/desktop/.env`
5. 运行 `npm run desktop:install`
6. 运行 `npm run desktop:prepare-runtime:local`
7. 运行 `npm run desktop:typecheck`
8. 在验证前停下（除非传了 `--launch`）

可选参数：
- `--dir <path>` 指定克隆目录
- `--ref <git-ref>` / `--branch <git-ref>` 从指定分支或标签安装
- `--launch` 验证后继续进入 `npm run desktop:dev`

如果你已经在本地 checkout 里，想直接复用同一个包装脚本：

```bash
bash scripts/install.sh --dir "$PWD"
```

### 方式二：手动安装（控制每一步）

先验证前置条件：

```bash
git --version
node --version    # 必须 ≥ 24
npm --version
```

然后按顺序执行：

```bash
# 1. 克隆仓库
git clone https://github.com/holaboss-ai/holaOS.git holaboss-ai
cd holaboss-ai

# 2. 安装桌面端依赖
npm run desktop:install

# 3. 创建本地环境文件
cp apps/desktop/.env.example apps/desktop/.env

# 4. 准备本地运行时捆绑
npm run desktop:prepare-runtime:local

# 5. 启动前快速验证（非交互）
npm run desktop:typecheck

# 6. 启动开发模式
npm run desktop:dev
```

`npm run desktop:dev` 的 `predev` 钩子会自动校验环境、重建原生模块、确保 runtime 捆绑已 staging——所以正常开发路径不需要手动 prepare。

### 运行时捆绑的两种来源

```bash
# 从本地源码构建 runtime 并 staging
npm run desktop:prepare-runtime:local

# 从 GitHub Releases 拉取当前平台最新已发布 runtime
npm run desktop:prepare-runtime
```

本地源码路径用于你在改运行时代码时；已发布捆绑用于验证桌面端对已知发布产物的兼容性。

### 运行时验证（可选，针对全新克隆）

```bash
npm run runtime:state-store:install
npm run runtime:state-store:build
npm run runtime:harness-host:install
npm run runtime:harness-host:build
npm run runtime:api-server:install
npm run runtime:test
```

### 进阶：用 hola CLI 调试 pi 大脑

`scripts/hola.mts` 允许你在**不打开桌面 UI** 的情况下，直接从源码进程内运行 **pi（Hola）大脑**进行调试：在 `runtime/harness-host/src/pi.ts` 打断点、改完即重跑、无需构建/staging 循环、可同时开多个实例。

```bash
# 先关闭该 checkout 的桌面（避免写冲突），然后：
npm --prefix runtime/api-server run hola -- -p "list the files in this repo and summarize it"
```

它调用运行时真实的 `executeTsRunnerRequest` 流水线，只把 `runHarnessHost` 依赖替换为进程内 `runPi()`——所以 MCP、sidecar、skills、工具、`model_client`、注入上下文等所有构建阶段都**忠实于桌面运行**，只有 harness 子进程被替换。事件流经真实 relay（`harness_session_id` 持久化 → resume 可用）。

常用 flags：`-p/--prompt`、`--cwd`、`-m/--model`、`-s/--session <path>`（恢复指定会话）、`--fresh`（新会话）、`--no-runtime`（跳过 HTTP 后端工具）、`--keep`（保留启动的 runtime）、`--force`（强制打开正在被桌面使用的 root）、`--print-request`（只构建+打印请求，不调模型）、`--debug`（原始事件）、`--port`。

### 打包发布（进阶）

```bash
# macOS（本地 ad-hoc 签名）
npm run dist:mac
npm run dist:mac:dmg

# Windows（NSIS 安装器）
npm run dist:win
```

- `dist:mac` 产出未签名的本地 `.app`（runtime-macos 嵌入 `Contents/Resources/`）
- `dist:mac:dmg` 产出本地使用 `.dmg` 安装器
- 生产签名与公证在 GitHub Actions 中完成（Apple 密钥配置好后）
- 桌面发布版本号用 `YYYY.MDD.R` 稳定 semver（如 `2026.410.1`、`2026.1113.1`），GitHub release tag 为 `holaOS-YYYY.MDD.R`

### 安全模型

- 渲染进程：`contextIsolation: true`、`nodeIntegration: false`、`webviewTag: true`（为内置浏览器面板有意开启）
- preload 桥只暴露运行时信息与受约束的文件系统 API
- 安全事件（凭据泄露、RCE、沙箱逃逸、越权、不安全默认配置）请**私有**报告到 `admin@holaboss.ai`，不要公开开 issue

## 设计哲学：holaOS 的九个原则

### 1. 本地优先与数据所有权（Local-first & data ownership）

内存是纯文本文件，存在你的机器上，可见、可编辑、可迁移。"Not locked in someone else's cloud"（不锁在别人的云端）——这是对 SaaS AI 产品"内存黑盒"的正面回应。用户的数据主权是产品信任的基础。

### 2. Agent 无关（Agent-agnostic）

不押注单一 Agent，而是让工作空间层与 Agent 解耦。Claude Code、Codex、内置 Agent 是**可插拔的执行器**，工作空间（内存/工具/技能/应用）是**持久的资产**。这既是对用户的承诺（无锁定），也是产品定位的选择（不站队）。

### 3. 共享上下文优于 Agent 孤岛

每个 Agent 各自维护一套内存和工具是巨大的浪费与碎片化。holaOS 的核心主张是：**上下文、偏好、项目历史应该是一个共享的单一资产**，无论哪个 Agent 在驱动。这也是"一致的结果"（Consistent results）承诺的来源。

### 4. 真实界面，而非聊天记录（Real surfaces, not chat）

Agent 的工作成果应该是**真实的应用界面和真实文件**，而不是聊天记录墙。HolaApps 让应用与 Agent 并排存在——"app and agent share the screen, so you always see what's happening and can take over"（应用与 Agent 共享屏幕，你始终能看到正在发生什么并随时接管）。**人在回路（human-in-the-loop）** 是设计内建，不是事后补丁。

### 5. 一次教学，处处复用（Teach once, reuse everywhere）

技能、集成、MCP、Combos 是**与 Agent 无关的资产**。这直接把知识复用的单位从"单个 Agent"提升到"整个工作空间"，也让"换 Agent"的迁移成本趋近于零——无锁定承诺因此变得可信。

### 6. 零设置默认 + BYOK 灵活

内置模型意味着"一个账号、每个 SOTA 模型、无需管理 API 密钥"的零设置默认；BYOK 意味着"你的密钥、你的提供商、你的费率"。这是对"易用性"与"自主权"的双重满足——默认路径无障碍，进阶路径不锁死。

### 7. 自包含运行时（Self-contained runtime）

把运行时 API、Node/npm、Python 全部捆绑进 runtime bundle，桌面应用 staging 后运行。这保证了**环境确定性**（不依赖宿主机的 Node/Python 版本）、可移植性与可复现性——AI 工作空间不能建立在"依赖用户机器环境恰好正确"的假设上。

### 8. 安全至上（Security-first）

`contextIsolation` + 受限 preload 桥 + 明确的私有漏洞报告流程 + 企业版审计日志——Agent 能操作你的浏览器和文件，安全必须是第一公民。安全策略明确列出五类敏感问题（凭据泄露、RCE、沙箱逃逸/提权、认证绕过、暴露本地运行时的不安全默认配置），说明团队对"Agent 权限"的严肃态度。

### 9. 面向 Agent 的确定性文档（Deterministic docs for agents）

INSTALL.md 被明确写成"为编码 Agent 准备的确定性 runbook"（deterministic setup runbook for an agent）——甚至提供一句话 handoff 让 Codex/Claude Code 直接执行安装。AGENTS.md 规定图标必须走 `@/components/ui/icons` 包装层、commit 用 Conventional Commits 详细格式。**这个仓库本身就是"Agent 友好的代码库"的示范**——文档不是给人看的，是给 Agent 执行的。

## 关键观点总结

### 观点 1：Agent OS 是下一个平台层

模型层正在商品化（各家 SOTA 模型差距缩小且互相追赶），应用层已经被巨头把持。真正的空白是**承载 Agent 的操作系统层**——内存、工具、技能、应用的编排层。holaOS 押注的就是这个位置。"The Computer for You and Your Agent" 不是营销口号，而是一个平台判断。

### 观点 2：内存是护城河

跨会话、跨 Agent 的持久共享内存是 holaOS 最深的差异化。当所有 Agent 都能调用模型和工具时，**"记得"才是稀缺的**。而"以纯文本文件存储"这个选择极其聪明：既兑现本地优先的承诺，又让用户可审计、可迁移、可信任。

### 观点 3：模型商品化后，工作空间层捕获价值

内置多种前沿模型 + BYOK 的姿态表明：holaOS 不靠模型赚钱（那是被商品化的层），而靠**编排、内存、应用生态、企业安全**赚钱。这是对"模型即护城河"叙事的明确反驳——护城河在模型之上。

### 观点 4：开源 + 托管 + 企业版的三路径

桌面 App（免费开始）→ 开源自托管（BYOK）→ 企业版（SSO/审计/私有部署）。这既是增长漏斗（开源引流、企业变现），也是信任策略（自托管选项消除了"我的数据在你的云里"的顾虑）。

### 观点 5：Agent 需要"看得见、可接管"的操作界面

HolaApps 的并排设计回答了 Agent 安全性的一个关键问题：**如何让用户信任 Agent 操作真实应用？** 答案是——让操作全程可见（side-by-side），让接管随时可能（step in whenever）。信任不是靠权限系统堆出来的，是靠**透明性**堆出来的。

### 观点 6：自包含运行时是 AI 工作空间的务实选择

捆绑 Node/npm/Python 的 runtime bundle 牺牲了体积，换来了确定性与可移植性。对 AI 工作空间而言，**可复现比轻量更重要**——因为 Agent 要执行的工具链必须稳定。这一选择对同类产品有直接借鉴意义。

### 观点 7：从"对话式 AI"到"工作空间式 AI"的范式转移

holaOS 代表了一类正在成形的共识：**AI 的终极交互不是对话框，而是共享的工作环境**。Agent 在你的浏览器里、你的应用里、你的文件系统里工作，产出真实的交付物，从你所在的任何聊天入口触达，按计划自动运行——"对话"只是其中一个人机接口，不再是产品的全部。

## 结语

holaOS 是 2026 年 Agent 基础设施竞争中最具代表性的"工作空间派"项目之一。它不押注某个 Agent 的胜负，而是押注一个更根本的层：**Agent 时代的电脑**。7.4k Stars 与 642 Forks 说明这个判断引发了广泛共鸣。

它的核心启示可以浓缩为一句话：**当模型不再是稀缺品，"与 Agent 共享的持久工作空间"才是稀缺品。** 无论是共享内存的本地优先设计、真实界面而非聊天记录的 HolaApps 范式、一次教学处处复用的技能体系，还是面向 Agent 的确定性文档，holaOS 都在回答同一个问题：**如何让"用任何 Agent 干任何活"这件事，像用一台电脑一样自然、可靠、可接管。**

对于正在构建 AI 产品的人，holaOS 值得拆解的地方很多：它的 monorepo 结构、自包含运行时方案、HolaApps 的并排交互范式、以及"内存即护城河"的产品判断。而对于终端用户，它提供了一个罕见的承诺：**换 Agent 不再意味着从零开始。**