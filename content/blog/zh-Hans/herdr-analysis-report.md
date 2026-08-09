---
title: Herdr — 编程智能体的"栖息地"，让 AI 代理永不中断
description: 深度解析 Herdr 项目：一款让 AI 编程代理永不掉线的终端工作区管理器，支持 Claude Code、Codex、Cursor 等主流代理，内置 Rust 编写、零 Electron、开源免费。
author: topdigg-web-miner
date: 2026-08-09
tags:
  - AI Agent
  - 终端工具
  - 开发环境
  - Rust
  - Herdr
categories:
  - AI工具
  - 开发效率
---

# Herdr — 编程智能体的"栖息地"，让 AI 代理永不中断

> **一句话说明**：Herdr 是一个后台终端服务器，它能让 Claude Code、Codex、Cursor 等 AI 编程代理在后台持续运行，即使你合上笔记本、断网、重启电脑，代理依然在干活，你随时可以切回去继续。

---

## 📌 项目速览

| 项目信息 | 内容 |
|---------|------|
| **项目名称** | Herdr |
| **GitHub** | [herdrdev/herdr](https://github.com/herdrdev/herdr) |
| **Star 数** | 26,000+ ⭐ |
| **编程语言** | Rust（无 Electron，纯二进制） |
| **支持平台** | macOS、Linux、Windows Beta |
| **开源协议** | Apache 2.0 |
| **安装量** | 363,000+ 次 |

---

## 🎯 它解决了什么问题？

想象一下这个场景：

你让一个 AI 编程代理（ 比如 Claude Code）帮你写一个星巴克点单程序。程序很大，需要 3 个小时才能写完。

**没有 Herdr 的时候：**
- 你必须开着电脑，不能合上屏幕
- 断网了？程序停了
- 代理卡住了要问你问题，但你正好在外面？完蛋了
- 重启电脑？一切重来

**有 Herdr 的时候：**
- 代理在你的"数字牧场"里跑，你在不在都行
- 合上笔记本 → 代理继续跑
- 断网 → 代理继续跑
- 重启电脑 → Herdr 自动恢复，代理接着干
- 代理卡住了需要你 → Herdr 告诉你"哪个代理在等你"

---

## 🏗️ 核心概念（小学生都能懂）

Herdr 有几个基本概念，用现实世界打比方：

### 1. 工作区（Workspace）= 一个大办公室

一个工作区就是一个项目。比如你同时在做一个"星巴克点单系统"和"外卖配送系统"，可以开两个工作区，互不干扰。

### 2. 标签页（Tab）= 办公室里的不同白板

一个工作区可以有多个标签页，比如：
- `agents` 标签页 → 放 AI 代理
- `logs` 标签页 → 放日志
- `review` 标签页 → 放代码审查

### 3. 窗格（Pane）= 每个代理的"工位"

每个窗格就是一个真正的终端，里面跑着一个 AI 代理。可以左右分屏，也可以上下分屏。

### 4. 代理（Agent）= 你雇的程序员

Herdr 能自动识别以下 AI 编程代理：

| 代理名称 | 说明 |
|---------|------|
| Claude Code | Anthropic 官方出品 |
| Codex | OpenAI 出品 |
| Cursor Agent | Cursor IDE 的 AI 模式 |
| Pi / OMP | 编程代理 |
| OpenCode | 开源代理 |
| Grok CLI | xAI 出品 |
| GitHub Copilot CLI | GitHub 出品 |
| Kimi Code CLI | 月之暗面出品 |
| …… | 还有很多 |

### 5. 代理状态 — 它在干嘛？

Herdr 能自动判断每个代理在做什么：

| 状态 | 意思 |
|------|------|
| `working` 🔵 | 正在努力写代码 |
| `blocked` 🟡 | 遇到问题，需要你来回答 |
| `done` ✅ | 干完了，等你看结果 |
| `idle` ⚪ | 闲着，或者在等什么 |
| `unknown` ❓ | 看不出来在干嘛 |

> 💡 **这就是 Herdr 最聪明的地方**：你不用一个个窗口去找哪个代理卡住了，侧边栏直接告诉你"项目 A 的代理在等你回答问题"。

---

## 🚀 详细安装教程

### 方法一：一键安装（最简单）

**macOS / Linux：**
```bash
curl -fsSL https://herdr.dev/install.sh | sh
```

**Windows（测试版）：**
```powershell
powershell -ExecutionPolicy Bypass -c "irm https://herdr.dev/install.ps1 | iex"
```

### 方法二：用 Homebrew 安装

```bash
brew install herdr
```

### 方法三：用 mise 安装

```bash
mise use -g herdr
```

### 方法四：用 Nix 安装

```bash
nix run github:herdrdev/herdr/v0.x.y
```

### 方法五：手动下载

去 [GitHub Releases](https://github.com/herdrdev/herdr/releases) 页面下载对应平台的二进制文件：

| 系统 | 下载文件 |
|------|---------|
| Linux x86_64 | `herdr-linux-x86_64` |
| Linux ARM64 | `herdr-linux-aarch64` |
| macOS Intel | `herdr-macos-x86_64` |
| macOS Apple Silicon | `herdr-macos-aarch64` |

下载后执行：
```bash
chmod +x herdr-linux-x86_64
mv herdr-linux-x86_64 ~/.local/bin/herdr
```

### ✅ 验证安装成功

```bash
herdr
```

看到 Herdr 界面就说明安装成功了！

---

## 📖 快速上手教程

### 第一步：启动 Herdr

在任意目录运行：
```bash
herdr
```

Herdr 会自动启动或连接到你之前的后台会话。

### 第二步：创建一个工作区

Herdr 第一次启动会自动创建一个工作区。你也可以按 `ctrl+b c` 创建新标签页。

### 第三步：启动一个 AI 代理

在窗格里输入你喜欢的代理命令，比如：

```bash
claude
```

或者：
```bash
codex
```

或者：
```bash
pi
```

Herdr 会自动识别它是一个 AI 代理，并在侧边栏显示它的状态。

### 第四步：鼠标操作（完全可选）

Herdr 原生支持鼠标：
- **点击** 窗格/标签页/工作区来切换
- **拖拽** 分割线来调整大小
- **右键** 创建新窗格或标签页
- **选中文字** 直接复制（不需要按 Ctrl+C）

### 第五步：键盘操作

| 操作 | 按键 |
|------|------|
| 进入命令模式 | `ctrl+b` |
| 新建标签页 | `ctrl+b c` |
| 左右分屏 | `ctrl+b v` |
| 上下分屏 | `ctrl+b -` |
| 切换窗格 | `ctrl+b h/j/k/l` 或方向键 |
| 下一个/上一个标签页 | `ctrl+b n` / `ctrl+b p` |
| 工作区导航 | `ctrl+b w` |
| 断开连接（代理继续跑） | `ctrl+b q` |

> 💡 按 `ctrl+b ?` 可以查看所有快捷键。

### 第六步：断开与恢复

**断开连接**（代理继续跑）：
- 按 `ctrl+b q`
- 或者直接关闭终端窗口

**恢复连接**：
```bash
herdr
```

Herdr 会自动恢复你之前的会话，所有代理都在原来的状态。

### 完全停止

```bash
herdr server stop
```

这会停止所有代理和窗格。

---

## 🧠 设计哲学（Design Philosophy）

Herdr 的设计哲学非常清晰，可以总结为以下几点：

### 1. "代理原生"（Agent-Native）

Herdr 不只是"终端多路复用器"，它是**为 AI 代理设计的**。

- Herdr 的 CLI 和 Socket API 是同一个接口，代理可以通过它创建窗格、启动其他代理、等待其他代理blocked
- 这不是 tmux 能做到的事情——tmux 只是终端复用器，不懂 AI 代理是什么

> 简单说：Herdr 是专门给 AI 代理住的"房子"，而 tmux 只是普通的"公寓"。

### 2. "不抢风头"（Non-Invasive）

Herdr **不包装、不替换**你已经在用的代理工具：

- Claude Code 还是 Claude Code，原封不动
- Codex 还是 Codex，原封不动
- Herdr 只是"拥有"它们的终端，让它们可以一直跑

这叫做 **"Ownership without Replacement"**（拥有但不替代）。

### 3. "真终端"（Real Terminals）

Herdr 里的每个窗格都是**真正的终端**：

- 不是模拟的，不是假的
- 代理在里面看到的和直接跑终端一模一样
- 支持所有终端功能：ANSI 颜色、光标控制、OSC 序列等

### 4. "零 Electron"（No Electron）

Herdr 使用 Rust 编写，编译成单一二进制文件：

- 没有 Electron，没有 Node.js 依赖
- 体积小、启动快、内存占用低
- 跑在你已经用的终端里（iTerm2、Kitty、Alacritty、Windows Terminal……）

### 5. "永远在线"（Always Running）

Herdr 是一个**后台服务器**：

- 客户端可以随时断开、重新连接
- 服务器和代理一直运行
- 笔记本合盖不断网 → 代理继续跑
- 这叫做 **"Sessions Survive"**（会话永生）

### 6. "状态聚合"（State Rollup）

Herdr 会把状态向上聚合：

- 一个 `blocked` 的代理会让它的窗格、标签页、工作区都显示为 `blocked`
- 你不需要一个个窗口去找哪个代理卡住了
- 侧边栏一眼告诉你"项目 A 需要你回答问题"

### 7. "远程优先"（Remote-First）

Herdr 支持远程连接：

- 通过 SSH 连接到远程机器的 Herdr
- 在手机上通过 SSH 也能查看代理状态
- `herdr --remote user@host` 一条命令搞定

### 8. "开源且免费"（Open Source & Free）

- 代码完全开源（Apache 2.0）
- 永远免费（没有付费墙）
- 社区插件生态：[herdr.dev/plugins](https://herdr.dev/plugins/)

---

## 📊 核心功能总结

### 功能对比表

| 功能 | tmux | screen | Herdr |
|------|------|--------|-------|
| 终端持久化 | ✅ | ✅ | ✅ |
| 多路复用 | ✅ | ✅ | ✅ |
| AI 代理识别 | ❌ | ❌ | ✅ |
| 代理状态显示 | ❌ | ❌ | ✅ |
| 状态聚合 | ❌ | ❌ | ✅ |
| Socket API（代理驱动） | ❌ | ❌ | ✅ |
| 鼠标原生支持 | 有限 | 有限 | ✅ |
| 零配置开箱即用 | ❌ | ❌ | ✅ |

---

## 🔌 高级功能

### 1. Socket API（给代理用的接口）

Herdr 提供了一个 Socket API，代理可以通过它：
- 创建新窗格
- 向其他窗格发送输入
- 等待某个窗格真正 blocked（而不是盲目等待）
- 查询代理状态

这是 Herdr 独有的能力，其他终端复用器都没有。

### 2. 插件系统

Herdr 支持插件扩展：
- 可以安装社区插件
- 可以自定义窗格和workflow
- 插件市场：[herdr.dev/plugins](https://herdr.dev/plugins/)

### 3. Git 工作树集成

Herdr 和 Git 工作树深度集成：
- 可以直接从侧边栏创建 Git 工作树
- 工作树作为独立工作区管理
- 不需要手动切换目录

### 4. 远程工作流

几种远程使用 Herdr 的方式：

**方式一：SSH 远程连接**
```bash
herdr --remote user@your-server.com
```

**方式二：先 SSH 到服务器，再运行 Herdr**
```bash
ssh user@your-server.com
herdr
```

**方式三：手机通过 SSH 查看状态**（只能看，不能操作复杂任务）

### 5. 配置管理

Herdr 配置文件在：
- **Linux/macOS**：`~/.config/herdr/config.toml`
- **Windows**：`%APPDATA%\herdr\config.toml`

可以配置：
- 快捷键（prefix 键、窗格切换等）
- 主题颜色
- 通知设置
- SSH 连接参数
- 插件设置

查看默认配置：
```bash
herdr --default-config
```

---

## 🗺️ 适用场景

### ✅ 非常适合的场景

1. **长时间运行的代码任务**
   - 训练大模型、数据处理、批量重构
   - 让代理在后台跑，你去做别的事

2. **多代理并行工作**
   - 同时跑 3 个代理分别开发 3 个功能
   - 侧边栏一眼看出哪个在等你

3. **远程服务器开发**
   - 在服务器上跑代理，本地通过 SSH 查看
   - 公司电脑跑代理，回家用笔记本接着看

4. **需要中断/恢复的工作**
   - 代理遇到问题需要你，但你正好要出门
   - 合上笔记本，代理继续思考，你回来继续

### ❌ 不太适合的场景

1. **需要图形界面的工作**（代理需要浏览器操作 UI）
2. **极短的任务**（几秒钟就能完成的任务不需要 Herdr）
3. **Windows 用户**（Windows 版还是 Beta，可能不稳定）

---

## 💡 关键观点和结论

### 观点一：Herdr 是 AI 编程代理的"操作系统"

如果把 AI 代理比作"打工仔"，那么 Herdr 就是"工位管理系统"：
- 打工仔（代理）可以在工位（窗格）里工作
- 工位管理系统（Herdr）确保打工仔不会因为老板（你）不在就停工
- 打工仔遇到问题，工位管理系统会通知你

### 观点二：Herdr 不是 tmux 的替代品，而是进化

tmux 解决的是"终端持久化"的问题，Herdr 在这个基础上增加了"AI 代理管理"的能力。

如果你只用 tmux 做终端复用，Herdr 也可以做，而且更好用。
如果你跑 AI 编程代理，Herdr 是唯一的选择。

### 观点三：状态可见性是 Herdr 的核心价值

在一个有 5 个代理同时跑的项目里，最烦人的事情是"我不知道哪个代理卡住了"。

Herdr 通过状态聚合（blocked → pane → tab → workspace）彻底解决了这个问题。

### 观点四："Agent-Native"是关键差异化

Herdr 的 Socket API 让代理可以互相通信、互相等待。这是其他工具都没有的能力。

未来，当多代理协作成为主流时，Herdr 的价值会更加明显。

### 观点五：Rust 是正确的选择

- 没有 Electron 依赖 → 体积小、启动快
- 单一二进制文件 → 安装简单
- 性能好 → 可以处理大量终端输出

这是为服务器端工具选择的最务实的语言。

---

## 📝 小结

Herdr 是一个专门为 AI 编程代理设计的终端工作区管理器。它的核心价值是：

1. **让代理永不掉线** — 即使你不在，代理也在跑
2. **让代理状态一目了然** — 侧边栏直接告诉你谁在干嘛
3. **让多代理协作成为可能** — Socket API 支持代理间通信
4. **零学习成本** — 不改变你已有的工作流程

> **如果你用 Claude Code、Codex、Cursor 等 AI 编程代理，Herdr 是你值得拥有的工具。** 它让 AI 代理从"需要你盯着"变成"可以托管"。

---

## 🔗 相关链接

- **官网**：[https://herdr.dev](https://herdr.dev)
- **文档**：[https://herdr.dev/docs/](https://herdr.dev/docs/)
- **GitHub**：[https://github.com/herdrdev/herdr](https://github.com/herdrdev/herdr)
- **插件市场**：[https://herdr.dev/plugins/](https://herdr.dev/plugins/)
- **安装命令**：`curl -fsSL https://herdr.dev/install.sh | sh`
