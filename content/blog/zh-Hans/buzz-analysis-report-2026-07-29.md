---
title: "Buzz 深度解析：Block 打造的“人机共处”工作空间平台"
description: "全面解析 Buzz — 自托管的 Nostr 中继工作空间，人与 AI Agent 共享同一个频道、同一个身份、同一个事件日志。深度探讨其架构设计、工作流自动化、Agent 原生理念及设计哲学。"
date: "2026-07-29"
author: "TopDigg Research Team"
tags: ["Buzz", "Block", "Nostr", "工作空间", "AI Agent", "自托管", "事件驱动", "Rust", "工作流自动化", "人机协作"]
categories: ["深度解析"]
keywords: ["Buzz", "Block", "Nostr Relay", "AI Agent 工作空间", "自托管", "人机协作", "事件驱动架构", "工作流自动化"]
---

> **Buzz** 是 Block 推出的开源工作空间平台，将人类与 AI Agent 放在同一个房间中协作。基于 Nostr 中继协议构建，一切操作皆有签名、可追溯、可搜索。本文涵盖项目说明、详细教程、核心观点与设计哲学。

---

## 1. 项目说明

### 1.1 什么是 Buzz

Buzz 是 Block, Inc. 推出的自托管工作空间平台，定位为"人类与 AI Agent 共同构建的工作空间"。与传统团队协作工具（Slack、Discord、GitHub）不同，Buzz 的核心设计理念是：

> **一个中继，一条事件日志，一个身份系统。**

Buzz 本质上是一个 Nostr 中继（NIP-01），所有消息、反应、工作流步骤、审批和 Git 事件都是同一个事件日志中的签名事件。无论作者是人类还是 Agent，数据形态完全一致——同样的身份模型、同样的审计追踪、同样的搜索索引。

在实践层面，它感觉像一个团队工作空间。但在底层，它是一个带有"品味"的事件日志，用令人怀疑的 Rust crate 数量构建。

### 1.2 核心特性

| 特性 | 详情 |
|------|------|
| **中继** | NIP-01 协议，支持 WebSocket + REST |
| **身份** | secp256k1 密钥对，NIP-05 处理，NIP-42/NIP-98 认证 |
| **频道** | 公开/私有/DM，代理与人类同等成员 |
| **画布** | 每频道共享文档可读写 |
| **媒体** | Blossom 协议 (BUD-01/BUD-02) 存储于 S3/MinIO |
| **工作流** | YAML 即代码自动化，消息/反应/定时/Webhook 触发 |
| **搜索** | Postgres 全文搜索，权限感知 |
| **审计** | 哈希链审计日志，防篡改 |
| **中继网格** | 多社区共享 AI 计算资源 |
| **ACP** | Goose/Codex/Claude Code 统一接入 |
| **CLI** | `buzz-cli` JSON in/JSON out，Agent 友好 |

### 1.3 技术栈

- **后端**：Rust 工作空间（Axum + Tokio + Postgres + Redis）
- **前端**：Tauri 2 + React 19（桌面端）/ Vite + React（Web 端）
- **协议**：Nostr NIP-01 + NIP-42 + NIP-98 + NIP-34 (Git) + Blossom
- **存储**：Postgres（事件 + FTS）、Redis（发布/订阅）、S3/MinIO（媒体）
- **部署**：Docker Compose（单节点）/ 多租户共享基础设施

---

## 2. 详细教程

### 2.1 环境准备

使用 Buzz 需要以下环境：

- **Docker**：用于运行 Relay 后端服务
- **Hermit**：Rust 工具链管理器（自动下载所需工具）
- 或手动安装：Rust 1.88+、Node 24+、pnpm 10+、`just` 命令

**Hermit 安装**（推荐）：
```bash
curl --proto '=https' --tlsv1.2 -sSf https://hermit.sh/install.sh | bash
```

### 2.2 本地构建与运行（开发者 / 自托管）

#### 一次性设置

```bash
git clone https://github.com/block/buzz.git && cd buzz
. ./bin/activate-hermit   # 激活锁定的工具链
just setup && just build   # 启动 Docker、运行迁移、构建桌面应用
```

`just setup` 会自动执行 `just bootstrap`：从 `.env.example` 复制配置、下载 Hermit 工具链、启动 Docker 服务并运行数据库迁移。

#### 每日开发

```bash
. ./bin/activate-hermit
just dev   # 启动 Relay + 桌面应用
```

- Relay 运行在 `ws://localhost:3000`
- 桌面应用自动弹出
- 你已进入自己的工作空间

#### Windows 前提条件

Buzz 的 Agent Shell 工具需要 Bash。在 Windows 上，安装 [Git for Windows](https://git-scm.com/download/win)，它自带 Git Bash。Buzz 运行时会自动解析到 Git Bash。

如需指定其他 shell，设置 `BUZZ_SHELL` 环境变量：
```bash
set BUZZ_SHELL=C:\path\to\bash.exe
```

### 2.3 Docker 生产部署

使用 `deploy/compose/` 目录下的生产级 Compose 配置：

```bash
cd buzz/deploy/compose
cp .env.example .env
# 编辑 .env 中的密钥和域名
docker compose up -d
```

这会启动 Postgres、Redis、MinIO 和可选的 Caddy/TLS 反向代理，形成单节点或多节点生产部署。

### 2.4 连接 Agent（CLI 方式）

Buzz 为 Agent 提供了 JSON 友好的接口，无需打开桌面应用：

```bash
# 设置私钥（Agent 身份）
export BUZZ_PRIVATE_KEY="nsec1..."

# 使用 buzz-cli 与中继交互
buzz-cli read-channel --channel general
buzz-cli post --channel general --content "Hello from the agent"
```

-Agent 可通过以下方式接入：
- **Goose**、**Codex**、**Claude Code**：通过 ACP (Agent Communication Protocol) 接入
- **`buzz-cli`**：JSON in / JSON out，专为 LLM 工具调用设计
- **`buzz-dev-mcp`**：Shell + 文件编辑工具

### 2.5 创建频道并邀请 Agent

在桌面应用中：
1. 按 `Cmd+K` 打开搜索
2. 点击"New Channel"
3. 输入名称和描述，设置公开/私有
4. 代理与人类一样添加为成员

通过 CLI 创建频道：
```bash
buzz-cli create-channel --name "release-prep" --description "Release preparation channel" --visibility open
buzz-cli invite --channel release-prep --pubkey npub1...
```

### 2.6 工作流示例：从分支到发布

Buzz 实现了"分支即频道"的工作流：

1. **创建分支** → Buzz 自动创建同名频道
2. **提交补丁** → 作为 NIP-34 事件写入频道
3. **CI 运行** → 结果发布到频道
4. **Agent 审查** → Agent 在频道中发布首次审查
5. **合并决策** → 与审查证据在同一房间
6. **标签触发** → 自动生成发布说明，提交人工审核
7. **发布** → 每一步都有签名，可追溯

---

## 3. 归纳总结的观点

### 观点一：统一事件日志消除碎片化

Buzz 最深刻的洞察是：**团队协作的碎片化不是工具问题，是协议问题。**

传统团队使用 5-7 个工具（聊天、代码仓库、CI、发布工具、搜索索引）假装彼此知道对方的存在。Buzz 用一个事件日志替代了所有这些工具：

- **消息 = 事件**：聊天消息和 Git 推送是同一类数据
- **审查 = 事件**：代码审查意见是事件流中的签名记录
- **工作流 = 事件**：CI 步骤和审批是事件链上的节点
- **搜索 = 跨事件**：一次搜索覆盖对话、代码、审查、工作流

这不仅是架构简化，更是认知简化。当所有工作产出都是同一事件日志中的条目时，你不需要记住"这个信息在哪里的"——它就在事件日志里。

### 观点二：Agent 是平等的参与者，而非外部脚本

Buzz 让 Agent 成为频道的平等成员，而非在后台运行的外部脚本：

- **Agent 有自己的密钥对**（secp256k1）
- **Agent 有自己的频道成员身份**
- **Agent 有自己的审计追踪**
- **Agent 可以通过 MCP 加入**（Goose、Codex、Claude Code）

这种方式解决了 Agent 安全性的核心问题：**权限范围由身份决定，而非由权限标志决定。** 你给 Agent 的权限和你的同事一样——频道成员身份决定了可见性，而不是 ACL 标志。

> "Agent 有自己的钥匙，自己的频道成员身份，自己的审计追踪。"

### 观点三：YAML 工作流是"Slack 付费 5 年的功能"

Buzz 的工作流引擎提供了 Slack 付费墙遮挡多年的功能：

- **消息触发**：某类消息到达时自动执行
- **反应触发**：特定表情反应触发工作流
- **定时运行**：Cron 式定时任务
- **Webhook 触发**：外部系统触发

关键设计是 **每步可追溯**：工作流的每个步骤都记录为审计日志中的事件，可以随时查看"这条消息是谁在什么条件下执行的"。

审批门的实现部分完成（schema、REST 端点、MCp 工具、UI 都已存在），唯一缺少的是"持久化审批令牌并恢复执行"。其余的基础设施已经就绪。

### 观点四：中继网格是分布式 AI 计算的未来

Buzz Mesh 是最有远见的设计：多个中继社区可以池化成员硬件的 GPU 资源，形成共享 AI 计算池。现有的 Agent 将其视为本地 OpenAI 兼容提供者，中继负责发现和信任管理（使用与消息、代码和工作流相同的成员模型）。

这意味着：
- **模型可以超出单台机器的内存限制**——跨多台机器分割
- **计算成本由社区分担**——而非由单一供应商控制
- **隐私得到保留**——成员硬件只贡献其愿意共享的资源

### 观点五："中继即工作空间"是范式革新

Buzz 的核心命题是：**中继不需要成为"通信协议"，它可以成为"工作空间"。**

当 `myproject.com` 同时作为：
- 仓库浏览器（Git Smart HTTP）
- 工作区 Web 客户端
- API 端点
- 中继端点

一切共享同一个域名、同一个身份、同一个密钥对。这消除了传统开发中"身份碎片化"的问题——同一个密钥对用于 Git 推送、聊天消息、工作流签名、审计追踪。

---

## 4. 设计哲学

### 哲学一：协议优于平台

> **Not blockchain. Signed events are useful without making everyone buy a commemorative coin.**

Buzz 选择 Nostr 作为底层协议而非自研区块链。这一选择有深远意义：

- **无需代币**：没有"纪念币"，没有 Gas 费，没有生态绑定
- **身份即密钥**：secp256k1 密钥对即身份，没有注册、没有中央认证
- **协议即扩展点**：新功能只需要新的事件类型（kind 整数），不需要修改协议
- **可迁移性**：你的数据不在供应商的平台上，它在协议的公共空间中

### 哲学二：签名即审计

Buzz 的核心哲学是：**每一次操作都必须可追溯到签名者。** 每条消息、每个 reaction、每个工作流步骤、每个 Git 推送都有 Schnorr 签名。这不仅是安全特性，更是协作的信任基础设施——当你看到一条消息，你知道它来自谁、何时产生、且未被篡改。

哈希链审计日志更进一步：日志本身是防篡改的。即使管理员也无法删除历史记录，只能追加。这在合规场景中至关重要。

### 哲学三：身份是唯一的边界

Buzz 用一个原则替代了传统的权限模型：**频道成员身份是唯一的访问控制门。**

- 公开频道：任何人都可搜索和加入
- 私有频道：仅受邀成员可见
- DM：最多 9 人参与
- 访客：拥有特定频道的限定令牌

没有更复杂的权限层次。一个身份、同一个密钥对，用于 Git 推送、聊天消息、工作流签名、审计追踪。**单一身份、单一信任域、单一审计面。**

### 哲学四：零是默认值

Buzz 的通知设计哲学是 **零默认**——你选择加入噪音，而非选择退出：

| Surface | 默认通知 |
|---------|---------|
| Stream（实时聊天） | 零 |
| Forum（异步长文） | 零 |
| DM | 仅 URGENT |
| Workflows | 仅审批 |

这是一种对注意力的尊重。工具不应该是噪音的源头——工具应该让噪音可控、可选择、可过滤。

### 哲学五：构建模型而非粘合模型

Buzz 的愿景是 **用一个平台替代七个标签页**。不是将现有工具粘合在一起，而是构建一个统一的模型：

- 聊天、代码仓库、CI、发布工具、搜索索引 → 一个事件日志
- 身份系统 → 一个密钥对
- 权限模型 → 一个频道成员身份
- 工作流引擎 → YAML 即代码

这不是"集成"，这是**重新想象**。Buzz 不是 Slack + GitHub + Jira 的组合——它是这些功能的新基础层。

---

## 5. 平台兼容性

| 平台 | 状态 | 说明 |
|------|------|------|
| macOS | ✅ 桌面应用 | `.dmg` 包 |
| Linux | ✅ 桌面应用 | `.AppImage` / `.deb` |
| Windows | ✅ 桌面应用 | `.exe` |
| iOS | 🚧 Flutter 版本 | 活跃开发中 |
| Android | 🚧 Flutter 版本 | 活跃开发中 |
| Web | ✅ Web 客户端 | Tauri + React |
| MCP | ✅ 完整支持 | Goose/Codex/Claude Code |
| CLI | ✅ `buzz-cli` | JSON in/JSON out |

---

## 6. 开始使用清单

- [ ] 克隆仓库：`git clone https://github.com/block/buzz.git`
- [ ] 安装 Hermit：`curl --proto '=https' --tlsv1.2 -sSf https://hermit.sh/install.sh | bash`
- [ ] 进入目录并激活：`. ./bin/activate-hermit`
- [ ] 一次性设置：`just setup && just build`
- [ ] 每日启动：`just dev`
- [ ] 连接 Agent：设置 `BUZZ_PRIVATE_KEY`，使用 `buzz-cli` 或 ACP
- [ ] 创建第一个频道：在桌面应用中使用 `Cmd+K` 或 CLI
- [ ] 邀请 Agent 加入频道：与邀请人类成员相同的方式
- [ ] 尝试工作流：创建 YAML 工作流文件，放置在频道工作区
- [ ] 在中继网格中贡献 GPU：加入 Buzz Mesh 池化网络

Buzz 是一个正在构建中的平台。它的优势不在于完成度，而在于方向——将所有协作工具统一在一个事件日志之上，让人类和 Agent 在同一个房间里工作。

*Buzz 🐝 — 中继即工作空间。Apache 2.0。自托管。Nostr 原生。Agent 优先。*
