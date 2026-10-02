# Cua：让 AI 智能体真正「会用电脑」的开放源代码平台

## 项目概述

在人工智能飞速发展的今天，大语言模型（LLM）已经能够处理复杂的自然语言任务，但在**真正操控计算机**这件事上，大多数 AI 智能体仍处于蹒跚学步的阶段。它们能够回答问题、撰写文章、编写代码，却难以像人类一样流畅地操作桌面应用程序、浏览器和文件系统。

**Cua**（发音同 "see-you-ei"，官方网站为 [cua.ai](https://cua.ai)，开源仓库位于 [github.com/trycua/cua）正是为解决这一核心痛点而诞生。**

> **Cua 的使命：Give AI agents computers they can use.**
>
> 让 AI 智能体拥有真正可使用的计算机。

Cua 提供了一整套开放源代码工具链，涵盖桌面自动化、云端隔离沙箱、本地虚拟机、专业决策模型以及标准化基准测试，致力于将 AI 从「能说不能做」的对话机器，提升为能够**自主操作计算机**的行动代理。

### Cua 能做什么？

简而言之，Cua 将一台计算机（无论是云端桌面、本地虚拟机还是你正在使用的这台 Mac）的**控制权**以结构化接口的方式交给 AI 智能体。智能体可以像人类一样：

- 查看屏幕内容（截图与可访问性树）
- 操作桌面应用程序（点击、输入、拖拽、快捷键）
- 在浏览器中导航和交互
- 创建和管理隔离的计算环境
- 评估和基准测试计算机操控能力

更重要的是，Cua 的设计从一开始就将**后台运行**（background-first）作为核心原则——AI 智能体可以在不影响用户当前工作的情况下，在后台静默执行任务。

---

## 核心组件详解

Cua 并非单一工具，而是一套由多个相互协作组件构成的完整生态系统。下面逐一深入解析每个组件。

### 1. Cua Fleets — 云端隔离桌面

[Cua Fleets](https://cua.ai/docs/fleets/quickstart) 是 Cua 提供的**托管式云端桌面服务**，用户可通过 [run.cua.ai](https://run.cua.ai) 快速获取一台隔离的 Linux 桌面环境。

**为什么需要云端桌面？**

- **弹性扩展**：根据任务需求动态创建和销毁计算环境
- **完全隔离**：每个沙箱相互独立，不影响宿主机
- **一致性**：无论在何地运行，桌面环境的行为完全一致
- **无状态化**：任务结束即销毁，不留痕迹

**核心使用方式：**

```bash
# 安装 cua CLI
curl -fsSL https://cua.ai/install.sh | sh
cua auth login

# 创建云端 Linux 桌面
cua sb create linux --on cloud --name dev

# 上传文件
printf 'pear\napple\npear\nbanana\n' > fruit.txt
cua sb cp fruit.txt dev:/tmp/fruit.txt

# 在云端执行命令
cua sb exec dev sha256sum /tmp/fruit.txt

# 截图
cua sb screenshot dev -o desktop.png

# 清理
cua sb rm -f dev
```

Cua Fleets 支持池化（Pool）管理，可以预先创建「温热」容器，实现毫秒级容器分配，非常适合需要频繁创建临时环境的 AI 工作流。结合 Terraform 支持，团队可以将 Cua Fleets 集成到现有的基础设施即代码（IaC）流程中。

---

### 2. Cua SDK & CLI — 统一开发套件

[Cua SDK](https://cua.ai/docs/cua-sdk/quickstart) 是整个生态系统的核心 API 层，提供**统一的编程接口**，屏蔽底层运行时差异，让开发者无需关心容器、虚拟机或云端的具体实现细节。

**多语言支持：**

| 语言 | 包管理 | 安装命令 |
|------|--------|----------|
| Python | pip | `pip install cua` |
| TypeScript | npm | `npm install @trycua/cua` |
| Swift | SwiftPM / XCFramework | `https://github.com/trycua/cua` |
| Kotlin | 自动生成绑定 | — |

**Python 示例（本地沙箱）：**

```python
import asyncio
from cua_sandbox import Image, Sandbox, http

async def main():
    async with Sandbox.ephemeral(
        Image.linux(),
        command=["python", "-m", "http.server", "8000"],
        services={"web": 8000},
        wait_for=http("web", "/"),
    ) as sb:
        print((await sb.service("web").request("GET", "/")).status_code)
        print(await sb.service("web").url())

asyncio.run(main())
```

**核心概念：**

- **Sandbox（沙箱）**：计算环境的基本单元，可本地可云端，API 完全一致
- **Image（镜像）**：操作系统模板，支持 Linux、Windows、macOS 等多种选择
- **Pool（池）**：预热的容器队列，支持高频率任务分配
- **Spaces（空间）**：共享式桌面，支持实时视频流、文件传输、远程应用投射（teleport）和多代理线程协作

Cua CLI（`cua` 命令）则是 SDK 的命令行外壳，适合脚本化和快速调试：

```bash
# 查看运行时状态
cua runtime doctor

# 创建本地容器
cua sb create ubuntu --name dev
cua sb exec dev uname -a

# 切换默认后端为云端
cua config set default.on cloud
```

---

### 3. Cua Driver — 跨平台桌面自动化引擎

[Cua Driver](https://cua.ai/docs/cua-driver/quickstart) 是 Cua 项目中最具技术深度的组件之一——它让 AI 智能体能够**像人类一样操作真实的桌面应用程序**，支持 macOS、Windows 和 Linux 三大平台。

**架构设计：**

```
模型 → Agent Harness → Cua Driver（MCP / CLI / SDK）→ OS 无障碍层 + 输入事件 → 应用程序
```

**核心工作流程：**

1. **观察（Observe）**：`get_window_state()` 同时返回窗口的**可访问性树**（Accessibility Tree）和**截图**。前者告知哪些元素可操作，后者展示实际视觉效果。两者结合，AI 既知道「点什么」，也看到「长什么样」。
2. **行动（Act）**：每个操作工具（`click`、`type_text`、`press_key`、`scroll`、`drag` 等）都**精确指定目标**，而非模糊坐标。
3. **验证（Verify）**：每个操作返回结构化的执行结果，包括 `effect`（confirmed / unverifiable / suspected_noop / partial / refused）和 `escalation`（是否需要升级到更高阶的操作方式）。

**后台优先（Background-First）原则：**

Cua Driver 最独特的设计哲学是**默认后台执行**——AI 操控应用程序时：

- 不会抢占前台窗口
- 不会移动用户的真实鼠标指针
- 不会切换前台应用程序

AI 获得的是自己的**光标覆盖层**（cursor overlay），用户完全感知不到后台正在进行自动化操作。这对于需要长时间运行的 AI 工作流意义重大——用户可以一边让 AI 处理文档，一边继续用电脑做其他事情。

**行动阶梯（Action Ladder）：**

Cua Driver 按「智能程度」将操作从低到高分为四个层级，层层递进、自动升级：

| 层级 | 操作方式 | 说明 |
|------|----------|------|
| **1. Element + Background** | 通过 `element_token` 调用系统级 UI Automation（Windows）、`AXPerformAction`（macOS）或 AT-SPI（Linux）| 最精确，可自我验证 |
| **2. Pixel + Background** | 在截图上读取 x,y 坐标后执行点击/输入 | 适用于无障碍 API 覆盖不到的场景 |
| **3. Page** | 通过 Chrome DevTools Protocol（CDP）操作浏览器 DOM | 专用于浏览器标签页 |
| **4. Foreground** | 将窗口提升到前台、获得焦点后执行操作 | 仅作为前几层失败后的兜底方案 |

**支持的平台：**

| 平台 | 底层 API | 状态 |
|------|----------|------|
| macOS 14+ | AppKit / Accessibility / ScreenCaptureKit | 完整支持 |
| Windows 10/11 | Win32 / UI Automation / 原生输入 | 完整支持（Electron、Tauri、WPF、WinUI3） |
| Linux X11 | X11/EWMH / XTest / AT-SPI | 支持（有工具包限制） |
| Linux Wayland | AT-SPI + Portal / libei | 支持（有合成器限制） |

**安装命令：**

```bash
# macOS / Linux
/bin/bash -c "$(curl -fsSL https://cua.ai/driver/install.sh)"

# Windows (PowerShell)
irm https://cua.ai/driver/install.ps1 | iex

# macOS 启动守护进程并授权
open -n -g -a CuaDriver --args serve
cua-driver permissions grant

# 验证安装
cua-driver call list_apps
```

---

### 4. CUA-S1 — 专业化决策模型

[CUA-S1](https://cua.ai/docs/cua-s1) 是 Cua 团队研发的**小型专业化系统 1 模型**（System 1 Model）家族，专门用于计算机操控中的快速决策。

**为什么需要专用模型？**

在 AI 操控计算机的场景中，有大量决策是**低复杂度、高频率**的：比如判断表单字段该填什么值、判断是否应该点击某个按钮、判断某个元素是否需要操作。这些决策不需要 GPT-4 级别的通用推理能力，一个精小的专用模型反而更快、更便宜、更可控。

Cua 团队将这种思路类比为人脑的「系统 1 / 系统 2」理论：**系统 1** 负责快速、自动化的直觉决策；**系统 2** 负责慢速、深思熟虑的推理规划。

**CUA-S1 的技术特点：**

- **小而专**：参数规模远小于通用大模型，专注于结构化界面元素评分
- **评分导向**：不是逐 token 生成文本，而是对候选值进行**评分排序**
- **明确边界**：动作边界由应用代码显式定义，而非模型自行推断
- **MIT 许可**：源代码完全开源（模型权重托管在 Hugging Face）

**首个研究轮廓——CUA-S1-FORMS：**

专门针对表单填写场景优化，从结构化界面元素和文档值中进行评分决策，而非逐 token 生成响应。

| 资源 | 链接 |
|------|------|
| 模型权重 | [Hugging Face - cua-s1-forms](https://huggingface.co/cua-ai/cua-s1-forms) |
| 训练数据集 | [Hugging Face - cua-s1-forms dataset](https://huggingface.co/datasets/cua-ai/cua-s1-forms) |

---

### 5. Lume — 本地 macOS / Linux 虚拟机

[Lume](https://cua.ai/docs/lume/quickstart) 利用 Apple 的 **Virtualization.Framework**，在 Apple Silicon Mac 上创建本地 macOS 和 Linux 虚拟机。与云端 Fleets 不同，Lume 完全在本地运行，数据无需离开你的设备。

**核心安装与使用：**

```bash
# 安装
/bin/bash -c "$(curl -fsSL https://cua.ai/lume/install.sh)"

# 创建 macOS Tahoe 虚拟机（自动从 Apple 恢复镜像下载）
lume create macos-tahoe --ipsw latest --unattended tahoe

# 启动虚拟机
lume run macos-tahoe

# SSH 连接
lume ssh macos-tahoe 'sw_vers; id -un'

# 清理
lume stop macos-tahoe
lume delete macos-tahoe
```

**Lume 的定位：**

- **隐私优先**：所有计算在本地完成，适合处理敏感数据
- **开发测试**：在隔离环境中测试跨平台应用
- **AI 训练**：为 Cua Bench 提供本地桌面环境
- **结合 lumier**：提供 Docker 兼容接口，方便现有容器化工具链接入

**支持的 macOS 版本：**

| 镜像 | 说明 | cua-spacesd |
|------|------|-------------|
| macOS Tahoe 26 | 最新长期支持版 | ✅ |
| macOS 26 slim | 精简版 | ✅ |
| macOS Sequoia 15 | 当前最新版 | ❌ |

---

### 6. Cua Bench — 基准测试与评估框架

[Cua Bench](https://cua.ai/docs/cua-bench/quickstart) 是 Cua 生态系统的**评测层**，用于构建计算机操控任务、评估 AI 智能体表现，并将轨迹（trajectory）数据导出用于模型训练。

**为什么需要基准测试？**

通用基准测试（如 MMLU、HumanEval）无法衡量 AI **操控计算机**的真实能力。Cua Bench 填补了这一空白，提供：

- **标准化任务集**：经过验证的桌面操控任务
- **自动化评估**：无需人工判分
- **轨迹导出**：可用于强化学习训练数据

**快速上手：**

```bash
# 安装
uv tool install 'cua-bench[browser]'
uv tool run --from 'cua-bench[browser]' playwright install chromium

# 查看可用任务集
cb dataset list

# 运行任务（内置 oracle，无需 API key）
cb run cua-bench-basic --task-filter click-button --max-variants 1

# 用 AI 智能体运行任务
cb run cua-bench-basic --agent cua-agent \
  --model anthropic/claude-sonnet-4-20250514 -j 4

# 读取结果
cb run list
cb run info <run-id>
```

**内置任务集（Adapter Benchmarks）：**

| 基准名称 | 描述 | 任务数 |
|---------|------|--------|
| MiniWoB++ | 合成 Web 小部件 | 130 |
| WebVoyager | 真实网站，LLM 评判 | 643 |
| Online-Mind2Web | 真实网站，WebJudge 评判 | 300 |
| WebGym | 真实网站测试分割 | 1,167 |
| OSWorld-Verified | Ubuntu 桌面应用 | 369 |

**任务结果存储：** 每个任务的执行结果保存在 `~/.local/share/cua-bench/runs/<run-id>/`，包含 `result.json`（评分）、`run.log`（日志）和 `trajectory.json`（完整轨迹）。

---

## 设计哲学：Computer-Use 2.0

### 从「屏幕感知」到「环境交互」

传统的 AI 桌面自动化方案通常遵循一个简单模式：**截图 → 发送给大模型 → 模型输出操作指令 → 执行**。这种方式存在根本性缺陷：

1. **信息丢失**：截图无法提供 UI 元素的语义信息（按钮功能、输入框类型等）
2. **幻觉风险**：大模型可能「误读」屏幕内容，产生错误决策
3. **无状态**：每次交互独立，无法理解操作上下文

Cua 提出的 **Computer-Use 2.0** 概念代表了范式转变：一个智能体在**同一任务**中，可以在代码执行、API 调用和图形界面之间**自由切换**，而无需切换工具或上下文。

### 背景优先原则

Cua 的后台优先（Background-First）设计哲学要求：AI 操控计算机时，**永远默认不打扰用户**。这一原则通过以下机制实现：

- **光标隔离**：AI 使用独立的光标覆盖层，不影响真实鼠标位置
- **窗口不抢占**：后台操作不会将目标窗口提升到前台
- **前台保护**：当 AI 需要强制前台操作时，必须明确声明
- **平台级支持**：各操作系统均提供了相应的底层机制（macOS 的 ScreenCaptureKit、Windows 的 `WDA_EXCLUDEFROMCAPTURE` 等）

### 层级递进策略

行动阶梯（Action Ladder）的设计体现了**渐进式能力增强**的思想：

```
Element（元素级，可验证）
    ↓ 不支持时
Pixel（像素级，上下文感知）
    ↓ 不支持时
Page（浏览器级，DOM 精准操控）
    ↓ 最后手段
Foreground（前台级，完全控制）
```

每一层都有明确的**升级条件**和**降级建议**，AI 智能体可以根据上一轮操作的反馈结果，自动选择最优的操作路径，而无需人工干预。

---

## 详细安装教程

### 统一安装脚本（推荐）

适用于 macOS / Linux：

```bash
curl -fsSL https://cua.ai/install.sh | sh
```

适用于 Windows（PowerShell）：

```powershell
irm https://cua.ai/install.ps1 | iex
```

安装脚本会自动检测并安装：
- `cua` CLI 工具
- Cua Spaces 应用（macOS 默认）
- `cua-driver` MCP 服务器和技能包
- 主机配置（使本机可通过 cua.ai 中继被访问）

**选择性安装**（仅安装特定组件）：

```bash
# 仅安装 cua-driver
curl -fsSL https://cua.ai/install.sh | sh -s -- --only cua-driver

# 选择性安装（交互式选择）
curl -fsSL https://cua.ai/install.sh | sh -s -- --select cua-driver
```

### 各组件独立安装

**Cua SDK（多语言）：**

```bash
# Python
pip install cua

# TypeScript
npm install @trycua/cua

# Swift（通过 SwiftPM）
# https://github.com/trycua/cua
```

**Cua Driver：**

```bash
# macOS / Linux
/bin/bash -c "$(curl -fsSL https://cua.ai/driver/install.sh)"

# Windows
irm https://cua.ai/driver/install.ps1 | iex
```

**Lume（本地 macOS VM）：**

```bash
/bin/bash -c "$(curl -fsSL https://cua.ai/lume/install.sh)"
```

**Cua Bench：**

```bash
uv tool install 'cua-bench[browser]'
uv tool run --from 'cua-bench[browser]' playwright install chromium
```

### 运行时环境检查

```bash
# 检查容器运行时
cua runtime doctor

# 如需安装/配置运行时
cua runtime setup
```

---

## 核心概念深度解析

### 行动阶梯（Action Ladder）详解

行动阶梯是 Cua Driver 自动化能力的核心，每一层都有其独特的工作机制和适用场景：

**第一层：Element + Background（元素级后台操作）**

这是 Cua Driver 最精确的操作方式。通过系统级的无障碍 API（UI Automation / AX / AT-SPI），AI 直接向目标元素的底层接口发送操作指令。这种方式的优势在于：

- **可验证性**：操作结果可以通过无障碍 API 直接读取回来
- **精确性**：不依赖屏幕坐标，UI 布局变化不影响操作准确性
- **效率高**：无需截图，直接操作元素对象

**第二层：Pixel + Background（像素级后台操作）**

当第一层不可用时（例如，某些 Electron 应用的部分控件），Cua Driver 会回退到像素级操作：

- 在同一张截图中读取目标元素的 x,y 坐标
- 向该坐标位置发送输入事件
- 对于键盘输入，先点击目标位置获得焦点，再输入文本

**第三层：Page（浏览器页面操作）**

当目标是浏览器标签页时，Cua Driver 切换到 Chrome DevTools Protocol（CDP）通道，直接操作 DOM 树。这种方式：

- 无需截图，直接读取和修改页面结构
- 支持浏览器原生控件（文件上传、下载、对话框等）
- 不受窗口焦点影响

**第四层：Foreground（前台操作）**

仅作为兜底方案。当前三层均无法成功时，将目标窗口提升到前台，获得焦点后执行操作。这种方式：

- 覆盖最广，但会「抢占」用户界面
- 适用于游戏、画布应用（如 Blender）等特殊应用
- 操作完成后**不会**自动恢复前台状态

### 权限模型

Cua Driver 的权限体系设计遵循一个关键原则：**权限由运行时拥有，不由传输层决定**。

无论通过 CLI、MCP、SDK 还是守护进程调用，权限检查都在运行时内部完成。Cua Driver 安装时会申请以下系统级权限：

| 平台 | 必要权限 |
|------|----------|
| macOS | Accessibility（无障碍访问）、Screen Recording（屏幕录制） |
| Windows | UIAccess（UI 自动访问）|
| Linux | AT-SPI2（无障碍服务）|

守护进程的存在是有充分理由的：

- **macOS**：无障碍和屏幕录制权限归属于 `CuaDriver.app`（`com.trycua.driver`）进程，而非终端会话
- **Windows**：SSH 进程运行在 Session 0，无法看到用户桌面，必须有守护进程运行在用户会话中

### Sessions（会话）管理

Cua Driver 的每个 MCP 连接或 SDK 运行时都会获得一个**隐式会话**（implicit session）：

- 共享屏幕、键盘和焦点
- 一次只允许一个原生输入操作
- 空闲 5 分钟后自动结束
- 命名的具名会话（named session）可通过 `session` 标签区分，适合调试

```python
# 创建命名的持久会话
from cua_driver import CuaDriver

driver = CuaDriver.create()
driver.start_session(name="my-session")
# ... 执行一系列操作 ...
driver.end_session()
```

### 后台交付（Background Delivery）的技术实现

后台交付的稳定性是 Cua Driver 最具技术挑战性的部分。不同平台有不同实现：

**macOS**：使用 Scoped CoreGraphics 和 SkyLight 事件，ScreenCaptureKit 用于窗口级捕获。cursor exclusion 通过 `WDA_EXCLUDEFROMCAPTURE` 实现。

**Windows**：向目标 HWND 发送 Window 消息。通过 `WDA_EXCLUDEFROMCAPTURE`（Windows 10 2004+）将光标排除在截图外。

**Linux X11**：通过 Root 窗口抓取实现 cursor exclusion。在合成器环境下，`method` 名称以 `+x11_save_under` 结尾时有效。

**Linux Wayland**：由于 Wayland 的安全模型不允许向非焦点窗口发送原始输入，Cua Driver 在 Wayland 上**拒绝**后台原始按键，而是推荐使用 AT-SPI 语义操作或 Portal/libei 通道。

---

## 归纳总结

### 项目亮点

1. **全栈覆盖**：从底层驱动到云端基础设施，从 SDK 到基准测试，Cua 提供了计算机操控领域最完整的开源工具链。

2. **后台优先**：真正实现 AI 在后台静默工作的设计，目前市面上仅有 Cua 将此作为核心原则并完整实现。

3. **跨平台一致性**：macOS、Windows、Linux 三大桌面平台统一接口，同一套代码可在不同平台无缝切换。

4. **混合运行时**：支持本地容器（gVisor）、本地虚拟机（QEMU / Lume）、云端容器（gVisor / KubeVirt）等多种运行后端，API 完全统一。

5. **开放生态**：MIT 许可证下的核心组件完全开源，支持 Claude Code、Codex、Cursor、OpenClaw 等主流 AI 编码智能体。

### 技术创新

- **行动阶梯与自动升级**：业界首创的分层操作机制，结合结构化反馈实现自动化最优路径选择。
- **多模态观察融合**：同时提供可访问性树（语义）和截图（视觉），让 AI 既「理解」界面结构，又「看到」实际外观。
- **专业化决策模型**：CUA-S1 将 System 1/2 理论工程化落地，用小模型处理高频简单决策，降低通用大模型的负担和成本。
- **平台级 cursor exclusion**：在操作系统底层实现了 AI 光标与用户光标的真正隔离。

### 应用场景

| 场景 | 适用组件 |
|------|----------|
| **AI 编程助手** | Cua Driver + Claude Code / Codex，自动化 IDE 操作 |
| **数据处理流水线** | Cua Fleets / SDK，构建可扩展的自动化处理环境 |
| **网页内容采集与操作** | Cua Driver 浏览器工具 + Cua Bench 任务集 |
| **跨平台 UI 测试** | Cua Driver + Lume，本地多系统覆盖测试 |
| **AI 模型 RL 训练数据生成** | Cua Bench 轨迹导出 |
| **企业业务流程自动化** | Cua Fleets 云端桌面 + SDK 集成 |
| **隐私敏感的本地 AI 操控** | Cua Driver + Lume，完全本地化 |

### 未来展望

Cua 项目仍处于快速发展阶段，根据 GitHub 仓库和文档的规划方向，未来值得关注的领域包括：

- **更广泛的 Wayland 支持**：目前 Hyprland/Omarchy 已有实验性支持，未来有望覆盖更多 Wayland 合成器
- **Android 支持**（社区呼声较高）：移动端桌面操控
- **CUA-S1 模型家族扩展**：从表单场景扩展到更复杂的决策场景
- **Cua Spaces 协作功能深化**：支持多人实时协作和更丰富的远程投射能力
- **与更多 AI 智能体框架的深度集成**

### 资源链接

| 资源 | 地址 |
|------|------|
| 官方网站 | [cua.ai](https://cua.ai) |
| GitHub 仓库 | [github.com/trycua/cua](https://github.com/trycua/cua) |
| 云端 Fleets | [run.cua.ai](https://run.cua.ai) |
| 完整文档 | [cua.ai/docs](https://cua.ai/docs) |
| 博客更新 | [cua.ai/blog](https://cua.ai/blog) |
| Discord 社区 | [discord.gg/mVnXXpdE85](https://discord.gg/mVnXXpdE85) |
| X (Twitter) | [@trycua](https://x.com/trycua) |
| CUA-S1 模型 | [Hugging Face - cua-ai/cua-s1-forms](https://huggingface.co/cua-ai/cua-s1-forms) |
| Cua Bench 注册表 | [cuabench.ai](https://cuabench.ai/) |

---

> **结语：** Cua 的出现标志着 AI 从「能思考」向「能行动」迈出了关键一步。在 Computer-Use 2.0 的理念下，AI 不再是被困在对话框里的「文字机器」，而是真正拥有了操控数字世界的能力。无论是开发者构建下一代 AI 应用，还是企业寻求业务流程自动化，Cua 都提供了坚实的技术基础和开放的生态系统。未来已来——只是还需要一个能让 AI 真正「用电脑」的基础设施，而 Cua 正在成为这个基础设施的核心。

*文章基于 cua.ai 官方文档及 GitHub 仓库信息撰写，如有疏漏之处敬请指正。*
