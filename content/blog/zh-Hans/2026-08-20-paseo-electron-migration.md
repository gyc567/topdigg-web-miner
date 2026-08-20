---
title: "从 Tauri 到 Electron：Paseo 创始人的血泪踩坑复盘"
date: "2026-08-20"
description: "2026年5月28日，Paseo创始人Mo Boudra在博客写下了「我错怪Electron了」。这篇博文详细复盘了Paseo从Tauri迁移到Electron的全过程，揭示了技术选型中「凭感觉」决策的危害。本文深度解析Paseo项目、技术架构、迁移教训和工程哲学。"
tags:
  - 技术选型
  - Electron
  - Tauri
  - 桌面应用
  - 开源
  - Paseo
categories:
  - 技术深度
source:
  aggregator: "比特财商"
  aggregator_url: "https://mp.weixin.qq.com/s/Q-SOuDzIX69B_KE4pIAwWlofqxUaRF4H7CkCksIl3VD0gyRIeDsQkZPPl3Ms0hV1"
  original:
    name: "比特财商"
    url: "https://mp.weixin.qq.com/s/Q-SOuDzIX69B_KE4pIAwWlofqxUaRF4H7CkCksIl3VD0gyRIeDsQkZPPl3Ms0hV1"
---

## 开篇：一位创始人承认自己错了

2026 年 5 月 28 日，Paseo 创始人 **Mo Boudra** 在博客里写下了一个让技术圈颇感意外的文章标题：**"I was wrong about Electron"**（我错怪 Electron 了）。

这并不是一句轻描淡写的自我检讨。在那篇博文里，Boudra 详细复盘了 Paseo 桌面应用在技术选型上经历的一次"换心手术"——将底层框架从 Tauri 迁移到 Electron 的全过程。

对于一个刚获得 **14.4k GitHub Stars**、被社区广泛关注的开源项目而言，这样的坦诚反思极其难得。更难得的是，他没有止步于"认错"，而是把整个迁移决策链条、踩坑细节和心路历程完整地摊开在了所有人面前。

**这篇文章，是一堂关于技术选型的公开课。**

---

## 一、Paseo 是什么？

在深入技术细节之前，我们先回答一个基础问题：**Paseo 究竟是什么？**

Paseo 是一个**桌面级编程智能体编排平台**，它的核心使命是让你在**同一个界面**里，调用来自不同厂商的 AI 编程助手——包括 **Claude Code、Copilot、Codex、OpenCode 和 Pi**。

换句话说，它不是又一个 AI 编程工具，而是一个**统一编排层**。无论你习惯用哪家的 Agent，都可以通过 Paseo 的同一套界面、同一套工作流来进行管理、切换和协作。

### 核心特性一览

| 特性 | 说明 |
|---|---|
| **多智能体统一入口** | 接入 Claude Code、Copilot、Codex、OpenCode、Pi |
| **本地优先运行** | 智能体在你的本地机器上运行，完整访问你的开发环境 |
| **跨设备同步** | iOS、Android、桌面端、Web、CLI 五端统一体验 |
| **语音控制** | 支持语音输入，直接"说话"下达任务 |
| **隐私零妥协** | 无遥测、无追踪、无强制登录 |
| **端对端加密** | 跨设备配对使用加密传输 |
| **开源 AGPL-3.0** | 代码开放，社区驱动 |

### Paseo 的架构哲学

Paseo 的架构设计清晰地体现了一个核心理念：**你的代码和数据永远留在你这里**。

它通过一个运行在本地端口 `6767` 上的 **Node.js daemon** 来编排各个智能体进程。所有客户端（桌面端、移动端、Web、CLI）均通过 **WebSocket** 与这个 daemon 通信。跨设备配对则通过一个**端对端加密的 relay 服务**实现。

这种架构带来了几个关键优势：

1. **隐私天然保障**：代码不经过任何第三方服务器
2. **性能出色**：daemon 与本地开发环境直接交互，无网络延迟
3. **扩展性强**：TypeScript SDK 允许任何人基于 Paseo 构建自己的集成

---

## 二、技术架构详解：一个 daemon + 多个客户端

### 2.1 Monorepo 结构

Paseo 采用 monorepo 管理，核心包如下：

```
packages/
├── server/    # Node.js daemon，智能体进程编排、WebSocket API、MCP 服务器
├── app/       # Expo 客户端（iOS、Android、Web）
├── cli/       # paseo CLI 工具
├── desktop/   # Electron 桌面应用
├── relay/     # relay 传输层与加密模块
└── website/   # 官网与文档站点
```

### 2.2 Daemon 模式的工作原理

Paseo daemon 是整个系统的中枢神经。它负责：

- **智能体生命周期管理**：启动、停止、监控各个编程智能体进程
- **WebSocket API**：为所有客户端提供实时通信接口
- **MCP（Model Context Protocol）服务器**：与各大 AI 模型供应商的标准对接协议实现
- **跨进程协调**：在多个智能体之间进行上下文传递和任务分发

启动 daemon 只需要一行命令：

```bash
# Docker 部署
docker run -d --name paseo \
  -p 6767:6767 \
  -e PASEO_PASSWORD=change-me \
  -v "$PWD/paseo-home:/home/paseo" \
  -v "$PWD:/workspace" \
  ghcr.io/getpaseo/paseo:latest

# CLI 启动（本地开发）
paseo daemon start
```

### 2.3 WebSocket 实时通信

所有客户端通过 WebSocket 连接到 `localhost:6767`，这意味着：

- 桌面客户端可以实时看到智能体的输出流
- 移动端可以远程监控任务进度
- CLI 工具可以嵌入到任何终端工作流中

```bash
# 通过 CLI 连接 daemon
paseo connect --agent claude-code

# 查看当前活跃的智能体
paseo status
```

### 2.4 TypeScript SDK：无缝集成到你的项目

如果你想基于 Paseo 构建自己的工具或平台，可以使用官方提供的 `@getpaseo/client` SDK：

```typescript
import { createClient } from '@getpaseo/client';

const client = createClient({
  password: process.env.PASEO_PASSWORD,
  host: 'localhost',
  port: 6767,
});

// 连接到 daemon 并获取活跃智能体列表
const agents = await client.listAgents();
console.log('活跃智能体:', agents);

// 向指定智能体发送任务
await client.sendTask({
  agentId: 'claude-code',
  prompt: '优化当前项目的构建速度',
});
```

---

## 三、从 Tauri 迁移到 Electron：完整技术复盘

### 3.1 最初的选择：为什么是 Tauri？

在项目初期，Mo Boudra 和很多开发者一样，对 Electron 持有偏见——**体积大、内存占用高、启动慢**。他们选择了 Tauri，理由听起来非常合理：

- **Rust 后端**：性能优秀，内存占用低
- **小巧的二进制包**：Tauri 打包出来的应用体积远小于 Electron
- **原生 webview**：以为能在各平台获得"原生级"的性能表现

这些确实是 Tauri 的真实优势。但问题在于，**理论优势和实际落地之间，隔着整个工程现实。**

### 3.2 问题一：Linux 上的 WebKitGTK 噩梦

Tauri 在 Linux 上依赖系统自带的 WebKitGTK 引擎，而非捆绑自己的浏览器运行时。

这带来了三个层面的问题：

**（1）版本碎片化**
不同 Linux 发行版自带的 WebKitGTK 版本差异巨大。Ubuntu 22.04 可能用着 WebKitGTK 4.1，而 Fedora 40 可能还在用 4.0。API 细微的差异足以让同一个功能在两个发行版上表现截然不同。

**（2）Wayland 兼容性问题**
现代 Linux 桌面正在向 Wayland 过渡，但 WebKitGTK 在 Wayland 下的输入法支持、硬件加速等仍存在已知问题。

**（3）真实存在的布局差异**
同一个 CSS flexbox 布局，在 macOS 的 WKWebView、Windows 的 WebView2 和 Linux 的 WebKitGTK 下渲染结果可能不一致。Boudra 坦言："你花了两天调试一个居中问题，结果发现它只在 Ubuntu 上出现。"

### 3.3 问题二：通知系统：看似简单，实则坑深

桌面通知是一个看似微不足道、却极其考验平台适配能力的功能。

Paseo 需要支持：**点击通知 → 聚焦应用窗口 → 跳转到相关任务**。

这要求精确处理：

- 通知的点击事件捕获
- 应用窗口的激活与焦点管理
- 跨平台行为一致性

Tauri 的通知插件提供了基础能力，但**不支持桌面通知的点击处理**。Boudra 尝试了多个 Rust crates：——没有任何一个能可靠地在所有目标平台上提供完整的通知交互能力。

最终，他被迫为每个平台写**平台特定的原生通知处理代码**。这对于一个追求跨平台一致性的项目来说，是一个巨大的讽刺——为了解决跨平台问题，引入了更多跨平台问题。

### 3.4 问题三：Daemon 复杂度：Tauri Sidecar 的真实代价

Paseo 的核心是一个 Node.js daemon。这在 Electron 生态里几乎是天然的选择——Node.js 随 Electron 预装，无需额外配置。

但 Tauri 的方案是 **Sidecar**（边车）模式：

- Sidecar 是一个**独立编译的二进制文件**，针对特定平台和目标三元组（target triple）编译
- 需要处理：跨平台打包、文件路径解析、进程启动参数、权限配置、版本升级
- 每次新增一个目标平台，都意味着 sidecar 的编译矩阵扩大一倍

Boudra 的评价一针见血：**"我发现自己其实是在'用 Rust 重新实现一个 Electron 环境'——而且还不如 Electron 成熟。"**

### 3.5 迁移过程：痛苦但出乎意料地快

决定迁移之后，团队用了一周时间完成了从 Tauri 到 Electron 的切换。

Boudra 特别提到，这个过程虽然需要大量重写，但**比预期快得多**，原因在于：

1. **应用逻辑完全不需要改变**：所有的业务代码都在 JavaScript/TypeScript 层，迁移不影响这些
2. **Electron 工具链更成熟**：调试工具、热重载、生态插件都比 Tauri 丰富很多
3. **跨平台一致性让 QA 成本骤降**：不需要再为每个发行版单独调试

迁移完成后的体验改善是全方位的：

- **跨平台 UI 表现一致**，不再有"Ubuntu 上那个按钮歪了"的问题
- **通知功能正常工作**，包括点击处理
- **daemon 管理大幅简化**，Node.js 运行时直接由 Electron 进程管理
- **整体感觉更轻快**，这可能是最令人意外的发现

### 3.6 迁移后的反思：Tauri 并不差，只是不适合

Boudra 在博文结尾特别强调：Tauri 本身并不是一个糟糕的选择——它对于某些场景确实非常出色。他的失误在于**没有客观评估场景需求**，而是凭"感觉"选择了 Tauri。

> "我做了这个选择，是因为我喜欢 Rust，或者因为 Tauri 在 HN 上有很多热度。但我没有真正问自己：我的应用场景到底是什么？"

这个反思比任何技术细节都更有价值。

---

## 四、设计哲学：从 Paseo 提炼出的工程方法论

### 4.1 技术选型要回答的三个问题

Paseo 的迁移经历告诉我们，技术选型不能只问"这个技术好不好"，而要问：

**① 我的实际场景是什么？**
Paseo 是一个多智能体编排平台，需要：
- 稳定的跨平台 webview 渲染（三个平台都要完美一致）
- Node.js runtime（daemon 本质是 Node.js 应用）
- 复杂的通知和窗口管理

这些都是 Electron 的**核心能力**，而不是附加功能。对于这些需求，Electron 不是"凑合用"，而是"天生适配"。

**② 我的约束边界在哪里？**
如果应用二进制体积是硬性约束（比如必须小于 10MB），Tauri 可能是必选项。但如果只是"希望体积小一点"，就需要权衡为此付出的工程复杂度。

**③ 我能接受的维护成本是多少？**
Tauri 的 sidecar 模式、生态不成熟度、plugin 质量参差不齐——这些都是隐形的维护成本。Boudra 最终意识到，他在 Tauri 上花的额外精力，本质上是在"自己造轮子"来弥补 Tauri 的生态缺口。

### 4.2 本地优先不等于简单

Paseo 选择了本地 daemon 架构，这意味着必须自己处理：

- 进程生命周期管理
- WebSocket 长连接维护
- 跨平台路径和权限处理

这显然比"把代码扔给第三方 API"复杂得多。但 Boudra 选择了这条更难的路，因为**隐私和数据主权是不可妥协的**。

这体现了一种工程哲学：**有时候，更复杂的技术实现，是对更重要价值的守护。**

### 4.3 跨平台一致性是核心竞争力，而非装饰品

很多框架都宣称"跨平台"，但真正能做到 UI 一致、功能一致、体验一致的少之又少。Paseo 在迁移过程中花大量时间解决 WebKitGTK 差异问题，恰恰说明了——**跨平台的一致性不是自然而然发生的，而是需要刻意投入的**。

桌面应用开发者在选择框架时，应该把"目标平台的 webview 差异"列为必考项，而不是想当然地以为"写一次，到处跑"。

---

## 五、Paseo 实战教程

### 5.1 安装 Paseo

#### 方式一：桌面应用（推荐新手）

访问 [paseo.sh/download](https://paseo.sh/download)，下载对应平台的安装包。

#### 方式二：CLI 工具

```bash
# 全局安装 CLI
npm install -g @getpaseo/cli

# 验证安装
paseo --version

# 启动 daemon
paseo daemon start

# 连接第一个智能体
paseo connect --agent claude-code
```

#### 方式三：Docker 部署（适合服务器或无头环境）

```bash
docker run -d --name paseo \
  --restart unless-stopped \
  -p 6767:6767 \
  -e PASEO_PASSWORD=your-secure-password \
  -v "$PWD/paseo-home:/home/paseo" \
  -v "$PWD:/workspace" \
  ghcr.io/getpaseo/paseo:latest
```

> ⚠️ **安全提示**：务必修改 `PASEO_PASSWORD`，默认密码在生产环境中极不安全。

### 5.2 桌面端使用指南

安装完成后：

1. 打开 Paseo 桌面应用
2. 首次使用需要设置 daemon 连接密码
3. 连接你的第一个智能体 Provider（Claude Code / Copilot / Codex 等）
4. 在统一的界面中创建任务、监控进度、切换智能体

 Paseo 支持**语音输入模式**，点击界面中的麦克风图标，可以直接用语音描述任务，特别适合在通勤或双手不便时使用。

### 5.3 移动端使用

 Paseo 同时支持 iOS 和 Android，通过 Expo 构建。下载对应 App，扫描桌面端的配对二维码，即可远程连接本地 daemon，实现跨设备任务管理。

### 5.4 进阶：使用 Paseo Skills

Paseo 内置了三个强大的内置 Skill，用于多智能体协作：

#### `/paseo-handoff` — 智能体交接

当一个智能体完成部分工作后，将上下文完整移交给另一个智能体继续处理：

```
/paseo-handoff --from claude-code --to opencode --reason "需要更强的代码重构能力"
```

#### `/paseo-advisor` — 顾问智能体

引入一个专注于"审查和建议"的 advisor 智能体，在不干扰主智能体工作流的情况下，提供实时反馈：

```
/paseo-advisor enable --mode realtime
```

#### `/paseo-committee` — 多智能体委员会

将多个智能体组成委员会，通过投票或共识机制做决策：

```
/paseo-committee create --agents claude-code,copilot,opencode --task "架构评审"
```

### 5.5 TypeScript SDK 进阶示例

构建一个自动化代码审查流水线：

```typescript
import { createClient } from '@getpaseo/client';

async function automatedCodeReview() {
  const client = createClient({
    password: process.env.PASEO_PASSWORD!,
    host: process.env.PASEO_HOST || 'localhost',
    port: 6767,
  });

  // 监听智能体输出流
  client.on('agent:output', (event) => {
    console.log(`[${event.agentId}] ${event.type}: ${event.content}`);
  });

  // 启动代码审查任务
  const task = await client.sendTask({
    agentId: 'claude-code',
    prompt: `
      请对 /workspace 目录下的所有 TypeScript 文件进行代码审查：
      1. 检查类型安全性
      2. 识别潜在的空指针异常
      3. 提出重构建议
      输出格式：JSON
    `,
    options: {
      timeout: 300000, // 5分钟超时
      stream: true,
    },
  });

  console.log(`任务已提交，ID: ${task.id}`);
}

automatedCodeReview().catch(console.error);
```

---

## 六、总结：框架没有最好，只有最合适

Paseo 的故事，最打动人心的不是技术本身，而是一个创始人**敢于承认错误、公开复盘**的坦诚态度。

Boudra 没有把锅甩给 Tauri，也没有事后诸葛亮地说"我早知道 Electron 更好"。他诚实地承认：**他是被技术本身的魅力（Rust、性能、小体积）所吸引，而不是被实际需求所驱动。**

这恰恰是技术选型中最常见的陷阱——**我们不是因为某个框架"更好"而选择它，而是因为它让我们感觉"更好"而选择它。**

关于 Tauri vs Electron 的争论，Paseo 给出了一个相当有说服力的答案：

- **Tauri 适合**：对包体积有严格限制、UI 交互简单、不需要复杂原生集成的工具类应用
- **Electron 适合**：需要稳定跨平台 UI 表现、依赖 Node.js 生态、有复杂原生系统集成需求的应用

而一个优秀的工程师，应该根据**业务需求**而非**技术偏好**来回答这个问题。

---

**相关链接**

- Paseo 官网：[https://paseo.sh](https://paseo.sh)
- GitHub：[https://github.com/getpaseo/paseo](https://github.com/getpaseo/paseo)
- 官方文档：[https://docs.paseo.sh](https://docs.paseo.sh)
- Mo Boudra 博客原文：[https://moboudra.com](https://moboudra.com)

---

*首发于微信公众号「比特财商」。*
