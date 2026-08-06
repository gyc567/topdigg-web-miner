---
title: "Loop Engineering 深度解析（Addy Osmani 原作）：别再逐轮提示 AI——设计一个能自己发现工作、分配任务、验证结果的循环系统，然后留在工程师的位置"
description: "以 Addy Osmani（Google 前高管、Director of Engineering at Google Cloud AI）在个人博客发表的原版文章《Loop Engineering》（2026-06-07）为蓝本，完整解析这一 AI 编码新范式的核心。核心思想：loop engineering 是「用你设计的系统取代'提示 agent 的那个人'」——loop 是一个递归目标，你定义目的，AI 迭代直到完成。文章开篇引用 Peter Steinberger（'别再提示编码代理了，你应该设计会提示代理的循环'）与 Anthropic Claude Code 负责人 Boris Cherny（'我不再提示 Claude 了，我有正在运行的循环替我提示 Claude；我的工作是写循环'）。一文讲透：概念定位（loop 站在 harness 之上、按定时器运行、派生子代理、自我喂食）、五大构建块 + 记忆（Automations/Worktrees/Skills/Plugins & Connectors/Sub-agents + Memory）、Codex app 与 Claude Code 原语逐项对拍、一个完整循环长什么样（早晨自动化 → triage 技能 → worktree 隔离 → 子代理起草/审查 → 连接器开 PR）、以及循环不替你做的三件事（验证仍是你的责任、理解腐化、认知投降）。结尾金句：Build the loop. Stay the engineer.（建造循环，但留在工程师的位置）。"
date: "2026-08-06"
author: "TopDigg Research Team"
tags: ["Loop Engineering", "Addy Osmani", "AI Agent", "Claude Code", "Codex", "Automations", "Worktrees", "Skills", "Sub-agents", "MCP", "Harness Engineering", "认知投降"]
categories: ["Deep Dive"]
keywords: ["Loop Engineering", "Addy Osmani", "循环工程", "AI 代理", "Claude Code", "Codex", "自动化", "工作树", "技能", "子代理", "MCP", "Harness", "记忆", "认知投降", "Stay the Engineer"]
---

# Loop Engineering 深度解析（Addy Osmani 原文）：别再逐轮提示 AI——设计一个能自己找活、派活、验活的循环系统，然后留在工程师的位置

> 核心思想：**Loop engineering 是"用你设计的系统取代'提示 agent 的那个人'"。** Addy Osmani（Google 前高管，Director of Engineering at Google Cloud AI）在个人博客原文章（2026-06-07）中定义：一个 loop 可以被理解成**递归目标（a recursive goal）**——你定义一个目的，AI 不断迭代直到完成。他断言这可能就是我们与编码代理协作方式的未来，但**"现在还为时过早，我持怀疑态度"**，而且必须警惕 token 成本。文中引用两句圈内名言定调：Peter Steinberger（OpenClaw 作者）说"**你（作为用户）不该再提示编码代理了，你应该设计会提示代理的循环**"；Anthropic Claude Code 负责人 Boris Cherny 说"**我不再提示 Claude 了，我有正在运行的循环在替我提示 Claude 并决定该做什么，我的工作是写循环**"。你不再一回合接一回合地握着工具，而是建造一个小的控制系统去"戳"那些代理。但文章最锋利的提醒在结尾：**Build the loop. Stay the engineer.**——循环不会替你验证、不会阻止你理解腐化、不会阻止你认知投降。设计循环时带着判断力，它就是解药；用它逃避思考，它就是加速器。

---

## 一、项目说明

### 1.1 它是什么？

本文要解析的是 **Addy Osmani 在他的个人博客（addyosmani.com）上发表的原版文章《Loop Engineering》**，发布于 **2026-06-07**。它不是一篇教程，而是关于"我们如何与编码代理协作"的一次范式宣言 + 落地拆解。

Addy Osmani 的身份值得注意：**Google 前高管、现任 Director of Engineering at Google Cloud AI，在 Google 工作了 14 年**，长期在 Web 性能与前端工程领域有巨大影响力（《Learning JavaScript Design Patterns》作者、Chrome 团队出身）。他在 2026 年密集写作了一批关于 AI 编码协作的文章——agent harness engineering、the factory model、orchestration tax、intent debt、comprehension debt、cognitive surrender、adversarial code review、code agent orchestra、long-running agents——而《Loop Engineering》正是这一系列思想的**收束之作**。

文章把 Loop Engineering 定义为：

> **Loop engineering is replacing yourself as the person who prompts the agent. You design the system that does it instead.**（Loop engineering 是取代"提示 agent 的那个人"——你设计系统来替代自己做这件事。）

一个 loop = **递归目标**：你定义目的，AI 迭代直到完成。它是建立在人类工程师角色迁移之上的工程纪律：**你不再是每天敲提示词的人，而是设计"谁去敲、什么时候敲、怎么验证"这套系统的人。**

### 1.2 关键数据与信息

- 作者：**Addy Osmani**，Google 前高管、Google Cloud AI 工程总监、全球知名前端工程师与开发者布道者
- 发布渠道：个人博客 `addyosmani.com`
- 发布时间：**2026-06-07**
- 文章立场：**"它可能成为未来，但现在还早，我持怀疑态度，你必须警惕 token 成本"**（原话："I believe this may be the future of how we work with coding agents. However, its still early, I'm skeptical and you absolutely have to be careful about token costs"）
- 核心引语来源：Peter Steinberger（OpenClaw 创造者）、Boris Cherny（Anthropic Claude Code 负责人）
- 概念谱系：agent harness engineering（单次运行的环境）→ factory model（构建软件的系统）→ **loop engineering（站在 harness 之上：按定时器运行、派生子代理、自我喂食）**
- 关联文章系列：orchestration tax、intent debt、comprehension debt、cognitive surrender、adversarial code review、code agent orchestra、long-running agents

### 1.3 它解决什么问题？

过去两年，我们从编码代理那里拿到产出的方式是：**写一个好提示词、分享足够多的上下文、输入一句、读返回、再输入下一句**——"agent 是一个工具，你全程握着它，一回合接着一回合"。Addy 说：**"那部分基本结束了"**（"That part is kind of over, or at least some think it's going to be."）。

新范式的回答是：**你建造一个小型系统来替代你与代理的直接对话。** 这个系统负责：发现工作（finds the work）、把工作派发出去（hands it out）、检查结果（checks it）、写下已完成的事项（writes down what is done）、然后决定下一步（decides the next thing）。然后你让这套系统去"戳"那些代理，而不是你亲自戳。

关键转变：这**已经不是工具层面的问题**了。Addy 原话：一年前你想要一个 loop，得自己写一堆 bash 脚本并且永远维护它；**现在这些构件直接内置在（Codex、Claude Code 这类）产品里**。Steinberger 列出的清单几乎可以一一映射到 Codex app，也能几乎原样映射到 Claude Code——一旦你发现形状是相同的，就停止争论"用哪个工具"，转而设计一个"无论你坐在哪个工具里都能工作"的循环。

---

## 二、核心思想

### 2.1 一句话定义与两句圈内名言

Addy 开篇两句话把范式讲透。第一句是 Peter Steinberger（OpenClaw 作者，2026 年最火的个人 AI 助理开源项目）：

> "You shouldn't be prompting coding agents anymore. You should be designing loops that prompt your agents."（你（作为用户）不该再提示编码代理了，你应该设计会提示代理的循环。）

第二句来自 Anthropic Claude Code 负责人 Boris Cherny：

> "I don't prompt Claude anymore. I have loops running that prompt Claude and figuring out what to do. My job is to write loops."（我不再提示 Claude 了，我有正在运行的循环替我提示 Claude 并决定该做什么。我的工作是写循环。）

### 2.2 loop 站在 harness 之上：分层世界观

Addy 之前在《agent harness engineering》和《the factory model》里分别写过"单次 agent 运行的环境"和"构建软件的系统"。Loop engineering 的位置是：

> **Loop engineering sits one floor above the harness.**（Loop engineering 坐在 harness 的上一层。）

- **Harness**：单次 agent 运行所在的脚手架（工具、验收标准、反馈循环）
- **Loop**：**"the harness but it runs on a timer, it spawns little helpers, and it feeds itself"**——同一个 harness，但它在定时器上运行、派生出小助手（子代理）、并且自我喂食（self-feeding）

也就是说：harness 武装的是**一次** agent run；loop 是那个**持续调度 agent、派生子代理、自我加料**的层。

### 2.3 形状相同 → 停止争论工具

Addy 强调了一个让他惊讶的观察：**"This is not really a tool thing anymore."**（这已经不再是工具层面的问题了。）

一年前，想要一个 loop 意味着自己写一坨 bash 并永远维护它；而现在，**构件直接内置在产品里**。Steinberger 的清单几乎一一映射到 Codex app，也几乎原样映射到 Claude Code。结论：

> 一旦你注意到形状是相同的，你就停止争论"用哪个工具"，转而设计一个**无论你恰好坐在哪个工具里都有效的循环**。

这意味着 loop 设计是一门**工具无关（tool-agnostic）**的技艺——这是本文最重要的认知之一。

---

## 三、详细教程：一个 loop 需要的五件东西 + 一处记忆

Addy 明确给出清单：**"A loop needs five things and then one place to remember stuff."**（一个循环需要五样东西，外加一个记住事情的地方。）

| # | 构件 | 在循环中的作用 |
|---|------|--------------|
| 1 | **Automations（自动化）** | 按计划自动触发，自己完成发现与分类（discovery and triage） |
| 2 | **Worktrees（工作树）** | 让两个并行 agent 不互相踩脚 |
| 3 | **Skills（技能）** | 写下 agent 否则只能靠猜的项目知识 |
| 4 | **Plugins & Connectors（插件与连接器）** | 把 agent 接入你已经在用的工具 |
| 5 | **Sub-agents（子代理）** | 一个出主意，另一个检查 |
| 6 | **Memory（记忆）** | 一个存在于单次对话之外、记录"做了什么/接下来做什么"的地方 |

### 3.1 工具原语对拍表（Codex app vs Claude Code）

Addy 给了一张关键对照表——同样五种能力，两个主流产品的原语几乎一一对应：

| 原语（Primitive） | 在循环中的职责 | Codex app | Claude Code |
|---|---|---|---|
| **Automations** | 按计划自动发现 + 分类 | Automations 标签页：选项目、提示词、节奏、环境；发现内容的运行结果进入 Triage 收件箱；`/goal` 用于"跑到完成为止" | 定时任务与 cron、`/loop`、`/goal`、hooks、GitHub Actions |
| **Worktrees** | 隔离并行功能开发 | 每个线程内置 worktree | `git worktree`、`--worktree`、子代理上的 `isolation: worktree` |
| **Skills** | 沉淀项目知识 | Agent Skills（`SKILL.md`），用 `$名称` 或隐式调用 | Agent Skills（`SKILL.md`） |
| **Plugins / Connectors** | 连接你的工具 | Connectors（基于 MCP）+ 用于分发的 plugins | MCP servers + plugins |
| **Sub-agents** | 出主意 + 验证 | 以 TOML 定义在 `.codex/agents/` | Task 子代理在 `.claude/agents/`，agent teams |
| **State（记忆）** | 跟踪已完成与待办 | 通过 connector 写入 Markdown 或 Linear | Markdown（`AGENTS.md`、progress 文件）或通过 MCP 写 Linear |

> "名字在这里那里有点不同，但能力是同一个东西。"（"The names are a bit different here and there but the capability is the same thing."）

### 3.2 逐个拆解：Automations——循环的心跳

**Automations 是让 loop 成为真正的"循环"、而不是"你手动跑过一次"的东西。**

- **Codex app**：在 Automations 标签页创建一个自动化，选择**项目、提示词、运行频率、运行环境**（本地 checkout 还是后台 worktree）。发现内容的运行结果进入 **Triage 收件箱**；什么都没找到的运行会自己归档（"which is nice"）。OpenAI 内部用它做无聊的日常事务：**每日 issue 分类、汇总 CI 失败、写 commit 简报、追查上周有人引入的 bug**。一个自动化可以调用一个 skill——这样可重复事务保持可维护，你触发 `$skill-name` 而不是把一堵巨大的指令墙贴进永远不会更新的调度里。
- **Claude Code**：通过调度与 hooks 达到同一效果。`/loop` 按间隔重跑一个提示或命令；`cron` 调度定时任务；hooks 在 agent 生命周期某些节点触发 shell 命令；或者把整个东西推到 **GitHub Actions** 让它在你合上笔记本后继续跑。

还有一个值得知道的**会话内原语**（in-session primitive），它更贴近本文主题：

- **`/loop`**：按节奏（cadence）重跑。
- **`/goal`**：持续运行直到你写下的条件为真。**每轮之后，由另一个独立的小模型检查你是否完成**——写代码的 agent 不给自己打分。你给它类似"`all tests in test/auth pass and lint is clean`"这样的条件，然后走开。Codex 也有同名的 `/goal`：跨轮次持续工作直到一个**可验证的停止条件**成立，支持 pause / resume / clear。

> "同一个原语，两个工具都有——这差不多就是整篇文章的主题模式。"（"Same primitive, both tools, which is kind of the pattern for this whole article."）

**Automations 的角色定位**：它是"把工作浮出水面"的那一层（"the part that surfaces the work"），循环的其余部分是"对工作采取行动"的那一层。

### 3.3 逐个拆解：Worktrees——让并行不变成混乱

**一旦你同时运行多个 agent，文件碰撞就会发生，而那就是失败点。** 两个 agent 写同一个文件，和两个工程师没打招呼就提交到同一行，是同一个头痛。

- **git worktree** 解决它：一个**独立的工作目录 + 自己的分支**，共享同一个 repo 历史——所以一个 agent 的编辑**物理上不可能**碰到另一个的 checkout。
- **Codex**：把 worktree 支持内置，多个线程同时打同一个 repo 而互不干扰。
- **Claude Code**：用 `git worktree`、`--worktree` 标志（在自己的 checkout 里打开会话）、以及放在子代理上的 `isolation: worktree` 设置（每个助手拿到一个全新的、用后自清的 checkout）。

Addy 的补充观点（呼应他自己的《orchestration tax》一文）：**worktrees 消除了机械碰撞，但你仍然是天花板**——你的 review 带宽决定了你实际能并行跑多少个 agent，而不是工具决定的。

### 3.4 逐个拆解：Skills——停止每次都重新解释你的项目

**Skill 是让你停止"像金鱼一样每个会话都重新解释同一套项目上下文"的东西。**

- 两个工具使用**相同的格式**：一个包含 `SKILL.md` 的文件夹（里面是指令和元数据），外加可选的 scripts / references / assets。
- **Codex**：当你用 `$` 或 `/skills` 调用技能时运行它；或者当你的任务匹配技能描述时**自动**运行——这就是"一个紧凑无聊的描述胜过花哨描述"的原因。
- **Claude Code**：同样机制。

Skills 是 **intent debt**（意图债）的解药。Addy 在《intent debt》中论证过：**agent 每次会话都是冷启动，它会把你的意图里的任何空洞用"自信的猜测"填上**。一个 skill 就是把意图写在外部：约定、构建步骤、"我们之所以不这么做是因为那起事故"——写一次，agent 每次运行都读。

> 没有 skills，loop 每个周期都从零重新推导你的整个项目；有了 skills，它就会**复利增长**（compounds）。

一个重要区分：**skill 是"创作格式"，plugin 是"分发方式"**。跨仓库共享 skill、或打包多个 skill 时，你把它打包成 plugin——Codex 和 Claude Code 都如此。

### 3.5 逐个拆解：Plugins & Connectors——循环触达你的真实工具

**一个只能看到文件系统的循环，是一个很小的循环。**

- **Connectors**（构建在 **MCP** 之上）让 agent 读你的 issue tracker、查数据库、打 staging API、往 Slack 丢消息。
- Codex 和 Claude Code 都讲 MCP，所以**你为一个写的 connector 通常直接能用在另一个**。
- **Plugins** 把 connectors 和 skills 打包在一起，让队友一次性安装你的整套配置，而不是凭记忆重建一切。

这是"agent 说'这是修复方案'"与"**loop 在 CI 变绿后自己开 PR、关联 Linear ticket、ping 频道**"之间的区别。**Connectors 是 loop 能真正在你实际环境里行动、而不是只告诉你"如果可以它会怎么做"的原因。**

### 3.6 逐个拆解：Sub-agents——让"制造者"远离"检查者"

**一个循环里最有用的结构性东西，是把"写的人"和"查的人"分开。**

> "写代码的那个模型给自己改的作业打分时太客气了（way too nice grading its own homework）。"一个带着不同指令、有时是不同模型的第二个 agent，能抓住第一个 agent 自己说服自己的那些问题。

- **Codex**：只有当你要求时才派生子代理，并行运行，然后把结果折叠进一个答案。你在 `.codex/agents/` 里以 TOML 定义自己的 agent（name、description、instructions、可选 model 与 reasoning effort）——所以你的**安全审查员可以是高 effort 的强模型**，而你的**探索者可以是快速只读的小东西**。
- **Claude Code**：`.claude/agents/` 里的 task 子代理，以及能互相传活的 **agent teams**。
- 常见分工（两个工具都是）：**一个探索（explores）、一个实现（implements）、一个对照规格验证（verifies）**。

为什么这在 loop 里特别重要：**loop 在你没盯着的时候运行**，所以一个你真正信任的验证者，是你敢于走开的唯一理由。代价：子代理各自做模型和工具工作，**更烧 token**——把钱花在"值得为第二种意见买单"的地方。

Addy 还点破一层：**Claude Code 的 `/goal` 底层就是这个模式**——由一个新模型决定循环是否完成，而不是由干活的模型决定——"制造者/检查者分离"被应用到了**停止条件本身**。

### 3.7 一个完整循环长什么样（Addy 常用的形状）

把上面拼起来，单条线程就变成一个小控制面板。Addy 给出一个他反复使用的形态：

> 1. **每天早上，一个自动化在这个 repo 上运行**。它的提示词调用一个 **triage skill**——读取昨天的 CI 失败、打开的问题、最近的提交，把发现写进一个 Markdown 文件或 Linear board。
> 2. 对每条**值得做的发现**，线程打开一个隔离的 **worktree**，派一个**子代理去起草修复**。
> 3. **第二个子代理**对照项目 skills 和既有测试审查那份草稿。
> 4. **Connectors** 让 loop 自己打开 PR、更新 ticket。
> 5. 任何 loop 处理不了的东西，落到 **triage 收件箱**等你处理。
> 6. **状态文件是整件事的脊柱**——它记住什么试过了、什么通过了、什么还开着，所以第二天早上的运行**从今天结束的地方继续**。

然后 Addy 用一句话点出本质：

> "看看你实际上做了什么：**你只设计了一次。你没有提示过其中任何一步。** 这就是 Steinberger 的整点真义——而且它在 Codex 或 Claude Code 里是同一个循环，因为构件是同样的构件。"

---

## 四、设计哲学：循环不替你做的三件事

Addy 全篇最重要的警告：**"The loop changes the work, it does not delete you from it."**（循环改变了工作，但它不会把你从工作中删除。）而且有三个问题**随着循环变好而变得更尖锐，而不是更容易**。

### 4.1 验证仍然是你的责任（Verification is still on you）

> "一个无人值守的循环，也是一个无人值守地犯错的循环。"

你把验证子代理从制造者那里拆出来，是为了让循环的"完成了"有意义；但即便那样，**"完成了"是一个主张（a claim），不是证明（a proof）**。Addy 反复引用他在《code review in the age of AI》里的同一句话：**你的工作是把"你确认过它确实能跑"的代码发布出去。**

### 4.2 你的理解仍然会腐化（Your understanding still rots if you allow it）

> 循环越快交付你没写过的代码，**"存在的东西"与"你实际理解的东西"之间的差距就越大**。这就是**理解债（comprehension debt）**——一个顺畅的循环只会让它增长得更快，**除非你阅读循环产出的东西**。

### 4.3 舒适的姿态是危险的姿态：认知投降（Cognitive surrender）

> 当循环自己运行得很好时，人很容易停止持有意见，直接收下它给你的任何东西。Addy 称之为**认知投降（cognitive surrender）**。

最有哲学分量的句子在这：

> **"Designing the loop is the cure when you do it with judgement and the accelerant when you do it to avoid thinking, same action, opposite result."**（当你带着判断力设计循环时，它是解药；当你用它来逃避思考时，它是加速器。同样的动作，相反的结果。）

### 4.4 结语金句：Build the loop. Stay the engineer.

Addy 的完整收官论证：

1. **这是工作如何演化的预览**："I think this is a preview of how our work is going to evolve."
2. **但他不放弃人工审查**："如果我不亲自审查代码、或者完全依赖自动化循环去修它，我的产品质量会下降。我可能会陷入一个向下的螺旋，不断把自己挖进更深的坑。"
3. **保持平衡**："尽管去搭你的循环，但别忘了直接提示你的代理也同样有效。关键在于找到平衡。"
4. **循环因你而异**："两个人可以搭出完全相同的循环，却得到完全相反的结果。一个用它来加速理解深刻的工作；另一个用它来逃避理解工作。**循环不知道其中的区别。你知道。** 这就是为什么循环设计比提示词工程更难，而不是更容易。"
5. **杠杆点移动了**："Cherny 的观点不是工作变容易了，而是**杠杆点移动了（the leverage point moved）**。"
6. **最终句**："**Build the loop. But build it like someone who intends to stay the engineer, not just the person who presses go.**"（建造循环。但要像一个"打算继续做工程师的人"那样建造，而不是像一个"只负责按下开始按钮的人"。）

---

## 五、归纳总结

### 5.1 核心观点清单

1. **Loop engineering 的定义**：用你设计的系统取代"提示 agent 的那个人"；loop = 递归目标，你定义目的，AI 迭代直到完成。
2. **范式迁移**："agent 是工具、你全程握着它、一回合接一回合"的时代基本结束——现在你建造小型系统去"戳"代理。
3. **层级定位**：loop 坐在 harness 之上一层——同一个 harness，但它在定时器上运行、派生子代理、自我喂食。
4. **工具无关性**：构件已经内置进产品（Codex / Claude Code），形状相同 → 停止争论工具，设计一个无论坐在哪个工具里都能工作的循环。
5. **五大构建块 + 记忆**：Automations（心跳）、Worktrees（并行隔离）、Skills（项目知识复利）、Plugins/Connectors（触达真实工具）、Sub-agents（制造者/检查者分离）+ Memory（状态文件是脊柱）。
6. **验证仍是你的责任**："done"是主张不是证明；无人值守的循环也在无人值守地犯错。
7. **理解债与认知投降**：循环越快交付你没写的代码，理解差距越大；舒适的"直接收下结果"姿态是危险的。
8. **循环设计比提示词工程更难**：循环不知道你在加速还是在逃避，区别只有你知道——所以杠杆点移动了，但责任没有消失。

### 5.2 一句话总结

> **循环改变的是"谁来提示"这个问题，不是"谁该负责"这个问题。** 建造你的循环，让它替你发现工作、派发任务、验证结果；但阅读它产出的东西、保持你对代码的理解、带着判断力设计它——**Build the loop. Stay the engineer.**

---

## 参考资料

- 原文：Addy Osmani，《Loop Engineering》（2026-06-07）—— `https://addyosmani.com/blog/loop-engineering/`
- Addy Osmani 关联系列：《Agent Harness Engineering》《The Factory Model》《Orchestration Tax》《Intent Debt》《Comprehension Debt》《Cognitive Surrender》《Adversarial Code Review》《Code Agent Orchestra》《Long-Running Agents》《Code Review in the Age of AI》—— 均可在 `addyosmani.com/blog/` 检索
- Peter Steinberger（OpenClaw 作者）关于"designing loops that prompt your agents"的公开言论
- Boris Cherny（Anthropic Claude Code 负责人）关于"my job is to write loops"的公开言论
- 本站相关：《Loop Engineering 深度解析（Cobus Greyling 原作）》（`loop-engineering-substack-analysis`）、《Loop Engineering 橙皮书深度解析》（`loop-engineering-orange-book`）
