---
title: 'MetaRSI/RSI-Harness 深度解析：一个能自己造工具的 AI 工具'
date: "2026-09-09"
description: "深度解析 CosmosMind-ai/RSI-Harness：Meta-Recursive Self-Improving System。Genome 把 AI 的 harness 配置变成可版本化、可分享、可自动生成的目录；harness-rsi 则是一个用自身能力构建出来的、能读你历史记录生成个性化 Genome 的元工具。"
tags:
  - RSI-Harness
  - MetaRSI
  - Genome
  - 递归自我改进
  - Pi Coding Agent
  - AI Agent
  - 提示词工程
  - 开源项目
categories:
  - 深度解析
  - AI工具
  - 开源项目
  - 递归自我改进
---

# MetaRSI/RSI-Harness 深度解析：一个能自己造工具的 AI 工具

"调 AI agent 这件事，今天的做法是把配置散落在 settings.json、CLI 参数、粘贴的提示词和'我记得上次那个提示词挺好用'之间——没有任何一样东西是可版本化、可 diff、可复现、可交给别人的。"

这是 RSI-Harness 开发者写下的开场白。这个项目试图回答一个根本问题：**如果一个 AI 能修改自己的权重，为什么不能修改自己的 harness——用和你手动写它一样的方式？**

答案就是 RSI-Harness。

---

## 一、项目背景与核心定位

### 名字的含义

**RSI-Harness** = Recursive Self-Improving Harness。名字里有两层递归：

- **第一层**：用 Pi coding agent 作为底层，在它上面加了一个配置层叫 Genome
- **第二层**：harness-rsi 是 Genome 里的一个特殊存在，它的输出是其他 Genome——一个用自身能力构建出来的、能读你历史记录自动生成个性化 harness 的元工具

**MetaRSI** 是论文标题里的名字，指的是"元递归自我改进系统"——不是模型自己改自己的权重，而是 harness 自己改自己的配置，用的正是你平时用来写 harness 的那些手段。

### 它解决什么问题

今天调 AI agent 的困境：

| 现状 | 问题 |
|------|------|
| settings.json | 只能改部分字段，不完整 |
| CLI 参数 | 每次都要敲，不能固化 |
| 提示词粘贴 | 无法版本管理 |
| "我记得" | 完全不可复现 |

RSI-Harness 的解法：把 harness 的所有配置（系统提示词、工具集、技能、MCP 服务器、扩展、运行时策略、记忆、快捷键、主题）收敛到一个目录里，叫 **Genome**。切换场景就是切换 Genome。

### 核心架构

```
Pi coding-agent ← 不可变 Core，不 fork
     ↓
Genome adapter ← RSI-Harness 项目本身
     ↓
harness-rsi ← 一个 Genome，输出是其他 Genome
```

整个 RSI-Harness 只做一件事：**在 Pi 的公开配置表面上，加一层 Genome 配置层**。Pi 的 CLI、TUI、斜杠命令、快捷键、会话树/fork/resume、模型和设置界面——全部由 Pi 提供，RSI-Harness 不重新实现任何一样。

---

## 二、核心概念：Genome 是什么

### 2.1 定义

Genome 是一个完整的、可独立交付的 harness 配置目录。

一个 Genome 目录长这样：

```
my-genome/
  genome.json              # manifest + 组件列表
  components/
    instructions.json      # 系统提示词
    tools.json             # 工具配置
    skills.json            # 技能列表
    commands.json          # 斜杠命令
    model.json             # 模型配置
    runtime.json           # 运行时策略
    policies.json          # 工具策略
    integrations.json      # MCP 服务器
    appearance.json        # 主题
    settings.json          # 所有设置字段
    keybindings.json       # 快捷键
    resources.json         # 资源发现范围
  contracts/               # 每个组件的契约文档
  skills/                  # 内置技能文件
  extension/               # 内置扩展
```

12 个组件，字段所有权互斥。越界写入在加载时就失败——比如 tools 组件想设置 system_prompt，立即报错。

### 2.2 合并语义：继承而非替换

Genome 的配置是 **patch，不是 replacement**：

- 字段缺省 → 继承 base（最终继承 Pi 默认值）
- 字段为 `null` → 删除该字段，显式交还 Pi
- 字段有值 → 覆盖；对象递归合并，数组整体替换

这意味着一个只声明 `model` 组件的 Genome，仍然拥有 Pi 的完整系统提示词、完整工具集和 AGENTS.md 发现能力。**你不需要为了改一个字段而重写整个 harness。**

### 2.3 两个内置 Genome

| Genome | 作用 |
|--------|------|
| `coding`（或 `paperlab`） | 代码编写 harness 的示例配置 |
| `harness-rsi` | 生成其他 Genome 的工具，用 GEE 命令 `gee` 启动 |

---

## 三、harness-rsi：如何用自身能力构建自身

这是整个项目最精彩的部分。

### 3.1 它住在哪里

`config/genomes/harness-rsi/` 只是**种子**。首次 `rsih --genome harness-rsi` 会把整个目录拷进 `~/.rsih/genomes/harness-rsi/`，之后一律从用户自己的目录加载——skill 和 extension 都从用户目录读，不会指回仓库。

### 3.2 为什么它能只是一个 Genome

harness-rsi 需要的每一样东西，都是 Genome 已有组件提供的：

| 需要什么 | 用哪个组件 |
|----------|------------|
| 定位与强制流程 | `instructions` 的 `append_system_prompt` |
| 方法论文档，按需加载 | `skills`，一个文件型 Pi skill |
| 读 session 用的 `grep`/`find`/`ls` | `tools`（Pi 默认关掉这三个） |
| 三个交互工具 | `integrations.extensions`，Genome 自带的 `.ts` |
| 草稿与长会话 | `policies` 的 scratchpad 和 compaction |
| 屏蔽无关的全局 skill | `resources.isolate: true` |

**`src/` 里没有一行**为 harness-rsi 特设的代码。它是"Genome 能配一切"这条不变量的证明。

### 3.3 `resources.isolate: true` 的作用

实测：不隔离时用户 `~/.agents/skills` 下的 **58** 个 skill 全部进入 system prompt，prompt 36 KB；隔离后只剩 `genome-authoring` 一个，prompt 7 KB。对一个流程被严格规定的 agent 来说，那 57 个无关 skill 既是噪音也是干扰源。

隔离只关掉 Pi 的**自动发现**（`--no-skills --no-prompt-templates --no-themes --no-extensions`），Genome 自己声明的资源照常加载。

### 3.4 GEE：Genome Expression Engine

GEE 是 harness-rsi 的前端命令：

```bash
gee  # 等价于 rsih :harness-rsi
```

GEE 的工作方式独特：**不问你要什么系统提示词，而是读你实际上做过什么**。

交互流程：

1. **先问场景**：这个 Genome 是干什么的？用你自己的话说细一点——产出什么、碰哪些工具和文件、什么算做好了、平时哪里出岔子
2. **问 session 范围**：扫描哪些 harness 的历史记录（RSIH 默认包含，可加入 Pi 和 Claude Code 的）
3. **按工作目录归并 session**：返回路径、来源、session 数、字节数、时间跨度、用户开头几句原话摘要
4. **用户选择工作区**
5. **agent 自己分析**：先用 bash 做聚合（工具调用直方图、高频命令、高频路径、访问过的域名），再选择性读原文
6. **落笔前先给方案**：把整个 Genome 以正文形式讲出来——叫什么名字、声明哪些组件、每个组件放什么、每条背后的证据、以及考虑过但砍掉了什么
7. **确认后才写文件**：写 `~/.rsih/genomes/<name>/`，跑 `rsih genome validate`

### 3.5 一条设计原则

> **除了 agent 自己确实拿不到的东西，什么都不写成代码。**

extension 里只有三个工具，因为只有三件事 agent 做不到：
- session 目录名是编码过的路径
- 库大到不能整份读所以必须有界地读
- 多选页面需要键盘焦点

其他一切——怎么读长 session、怎么排序、什么该变成什么——都是 skill 和 system prompt 里的文字。**改策略不需要改代码。**

---

## 四、12 个组件详解

| 组件 | 拥有字段 |
|------|----------|
| instructions | `system_prompt`, `append_system_prompt` |
| tools | 内置工具开关（patch 语义）、参数收窄、生成工具 |
| skills | 内联技能和 Pi skill 文件/目录 |
| commands | 内联斜杠命令和 Pi prompt 模板文件 |
| model | 默认 provider/model、模型轮换列表、请求选项 |
| runtime | 工具执行、steering、follow-up、最大轮次、thinking 级别 |
| policies | 工具策略、scratchpad、压缩、记忆 |
| integrations | Pi 扩展和 stdio MCP 服务器 |
| appearance | Pi 主题资产、主题选择、主题发现 |
| settings | Pi settings.json 的每个字段 |
| keybindings | Pi keybindings.json 的每个绑定 |
| resources | Pi 自动资源发现的范围（isolate） |

---

## 五、安装与使用教程

### 5.1 环境要求

- Node 22.19+
- 建议安装 bun（可编译成单文件二进制）

### 5.2 安装

```bash
git clone https://github.com/CosmosMind-ai/RSI-Harness.git
cd RSI-Harness
./install.sh
```

安装脚本检查依赖、构建、装到 `~/.local/bin`，然后让你选安装模式：
- `--copy`：二进制和所有资产移出仓库（生产使用）
- `--link`：符号链接到构建输出（用于修改 RSIH 本身）

### 5.3 基本用法（不带 Genome）

```bash
rsih                           # 启动，等价于 pi
rsih --resume                  # 恢复上一个会话
rsih --fork <session>          # fork 一个会话
rsih -p "Review the workspace" # 单次命令
```

带 `--run-id` 的脚本化用法：

```bash
rsih :notes -p "Outline this week's lab notes" --run-id week-32 --cwd ~/lab
rsih -p "Section 3 is too long; split it" --run-id week-32 --cwd ~/lab
rsih -p "Export as markdown" --run-id week-32 --cwd ~/lab --json
```

### 5.4 启动 Genome

四种写法完全等价：

```bash
rsih --genome coding           # 显式
rsih :coding                   # 冒号简写
rsih ::coding                  # 双冒号
rsih +coding                   # 加号
```

### 5.5 GEE 生成新 Genome

```bash
gee  # 等价于 rsih :harness-rsi
```

按提示操作即可。生成的 Genome 在 `~/.rsih/genomes/<name>/`。

### 5.6 管理 Genome

```bash
rsih genome list               # 列出已安装的 Genome
rsih genome show coding        # 查看 resolved Genome
rsih genome validate ./my-genome  # 验证 Genome
rsih genome install coding     # 恢复出厂版本
```

### 5.7 开发检查

```bash
npm run check       # typecheck + test + build
npm run build:binary
npm run smoke:binary
npm run sync:contracts  # 修改 docs/genome/components/ 后同步
```

---

## 六、设计哲学

### 6.1 配置是第一等的

"调 AI agent 今天是散的"这个问题，只有在把配置当成第一等公民来对待时才能解决。Genome 把所有配置收敛到一个可版本化、可 diff、可分享的目录里，让 harness 配置真正成为工程资产，而不是记忆碎片。

### 6.2 不可变 Core，配置即一切

Pi 的 Core 是不可变的。RSI-Harness 没有 fork 它，只用了它的公开配置表面。这意味着：
- Pi 的每次升级，RSI-Harness 自动获得新能力（测试保护这个不变式）
- Genome 的每次修改，只改配置，不改行为引擎

### 6.3 自指的元工具

harness-rsi 是用 Genome 自身的组件构建的：它的 charter 在 instructions 里，方法论在 skill 文件里，交互工具在自己 extension 里。没有一行特设代码。这不是巧妙的工程技巧，而是对"RSI"这个词的严格实践：**工具用它自己的手段建造自身**。

### 6.4 证据优于自述

GEE 不问"你想要什么 harness"，而是读你实际上做过什么。工具调用直方图、高频 bash 命令、hot files、你反复做的修改——这些是证据。场景描述是尺子：证据必须回答"这件事是真的"，而不是"这件事是他想的"。证据和意图打架时，用 `AskUserQuestion` 把两种读法一起交给用户。

### 6.5 种子会更新，但不会覆盖你

内置 Genome 的种子在首次使用时拷到 `~/.rsih/genomes/`，之后从那里加载。种子更新时：
- 你没改过 → 自动刷新
- 你改过 → 只警告，不覆盖
- 别人的同名 Genome → 不覆盖（genome_id 不同）

### 6.6 约束产生稳定性

12 个组件，字段所有权互斥，越界写入在加载时就失败。这不只是工程约束，也是对"好的 harness 应该清晰"这件事的坚持。一个组件只能管自己该管的东西，不允许越界。

---

## 七、核心观点与结论

### 观点一：Harness 的配置应该是一个版本化的工程对象

今天我们能给代码做 code review，但没办法给"那个好用的提示词"做 diff。Genome 把这件事做成了——你可以在 Git 里 commit genome，可以做 PR，可以做 code review，可以用 CI 验证。**这才是 AI agent 工程化的起点。**

### 观点二：Meta-RSI 的正确形式不是改权重，而是改配置

递归自我改进不应该是模型改自己的权重（那是危险且不可预测的），而应该是 harness 改自己的配置（这是安全的、可审计的、可回滚的）。RSI-Harness 证明了：用一个和你手动写 harness 一样的方式，让 harness 自己改进自己——既保持了可解释性，又实现了自我改进。

### 观点三：Personalization from evidence 是下一代 AI 配置的方向

传统做法是问用户"你想要什么"，然后根据回答写配置。问题是用户不知道自己要什么，或者表达不出来。GEE 的方法是从实际行为中提炼模式——你做了什么比你说了什么更可靠。没有证据支撑的配置项保持空状态，空意味着继承 Pi 默认值，而默认值永远是安全答案。

### 观点四：工具用它自己的手段建造自身是可行的

harness-rsi 证明了这件事：extension 里只有三个工具（`scan_workspaces`、`choose_workspaces`、`ask_user_question`），因为只有这三件事 agent 真的做不到。其他一切——分析 session、制定方案、写配置——都由 agent 在 skill 和 system prompt 里的文字驱动完成。**改策略不需要改代码**，这才是真正可持续的设计。

### 观点五：隔离是专业 agent 的必要条件

58 个无关 skill 进入 prompt 会把信号淹没。`resources.isolate: true` 把自动发现关掉，让 prompt 只包含 Genome 自己声明的内容。对于流程被严格规定的 agent，无关的干扰源不只是噪音，也是稳定性的敌人。

---

## 八、当前状态与限制

### 已实现

- 构建端到端可用的 Genome（12 个组件覆盖 Pi 全部配置表面）
- inherit-by-default 合并语义
- settings 编译层
- 目录打包与分发
- 种子更新机制
- harness-rsi 从 RSIH、Pi、Claude Code session store 交互式生成 Genome

### 尚未实现

- 一句话远程安装（`genome install` 目前只接受内置名称和本地路径，不支持 git/npm URL）
- 发布前编辑 gate（Genome 从私人 transcript 提炼，分享前需要能标记绝对路径、内网域名和可能的 secret）
- Codex session store 集成（1341 个文件 / 2.9 GB，单文件最大 298 MB，需要 MB 级读窗口或与 history.jsonl 做 join）

---

## 九、总结

RSI-Harness 回答了一个根本问题：AI agent 的 harness 配置如何才能像代码一样工程化？

答案是：**把它做成一个目录，一个 Genome。**

- 可版本化、可 diff、可复现、可分享
- 12 个组件覆盖全部配置表面，inherit-by-default 合并
- harness-rsi 用自身手段构建自身，读用户实际行为生成个性化 Genome
- 不 fork Pi Core，只用公开配置表面，Pi 每次升级自动受益

这不是一个配置工具——这是一个关于 AI 如何建造自己的思想实验。**工具用它自己的手段建造自身，用证据而非自述来认识自己，用配置而非权重来实现递归改进。** 这才是 Meta-RSI 该有的样子。

项目地址：https://github.com/CosmosMind-ai/RSI-Harness
论文：https://www.cosmosmind.ai/research/metarsi-v1.pdf
HuggingFace：https://huggingface.co/CosmosMind/RSI-Harness

---

以上，既然看到这里了，如果觉得不错，随手点个赞、在看、转发三连吧，如果想第一时间收到推送，也可以给我个星标，谢谢你看我的文章，我们，下次再见。

首发于微信公众号「比特财商」。
