---
title: "Loop Engineering 深度解析（Cobus Greyling 原作）：别再逐轮提示 AI——设计一个会自己发现工作、派发任务、验证结果的循环系统"
description: "以 Cobus Greyling 在 Substack 发表的原版文章《Loop Engineering》为蓝本，完整解析这一 AI 编码范式的核心。核心思想：从「你一回合接着一回合提示编码代理」转向「你设计一个循环系统（the loop）」，让它按调度或直到目标达成为止，自动发现工作、把任务交给（子）代理、验证结果、持久化状态、决定下一步。一文讲透概念演进（Context Engineering→Harness Engineering→Loop Engineering）、harness 与 loop 的分工、五大构建块（自动化/调度、工作树、技能、插件/连接器、子代理）+ 记忆、Anthropic Boris Cherny / Peter Steinberger / Addy Osmani 三位一线观点、Grok/Codex/Claude Code 三工具原语对拍，以及「现实的代价」（token 成本、理解债、认知投降）。"
date: "2026-08-06"
author: "TopDigg Research Team"
tags: ["Loop Engineering", "Cobus Greyling", "AI Agent", "Substack", "Harness Engineering", "Context Engineering", "Claude Code", "Grok", "Codex", "MCP", "Worktrees", "Skills", "Automation"]
categories: ["Deep Dive"]
keywords: ["Loop Engineering", "Cobus Greyling", "循环工程", "AI 代理", "Harness", "Context Engineering", "Claude Code", "Grok", "Codex", "工作树", "技能", "子代理", "记忆", "认知投降"]
---

# Loop Engineering 深度解析（Cobus Greyling 原文）：别再提示词 AI——设计一个会自己发现工作、派发任务、向代理的循环系统

> 核心思想：**从「你逐回合提示编码代理」转向「你设计一个系统（the loop）」。** Cobus Greyling 在 Substack 原文章（2026-06-09）中说：Loop engineering 是——由你设计一个循环，让它**自动发现工作、把任务交给代理（往往是子代理）、验证结果、持久化状态、并决定下一步动作**，按调度运行或直到目标达成。他说得最透彻的一句来自 Boris Cherny（Anthropic Claude Code 负责人）："我不再提示 Claude 了。我有正在运行的循环在提示 Claude 并决定该做什么。**我的工作是写循环。**" 你不是在写一个更大的提示词，而是在构建一个系统——Agent 只是该系统里的齿轮。

---

## 一、项目说明

### 1.1 它是什么？

本文要解析的是 **Cobus Greyling 在 Substack 上发表的原文章《Loop Engineering》**（`cobusgreyling.substack.com/p/loop-engineering`），发布于 **2026-06-09**。它不是一篇文章，而是 AI 原生开发范式的一次宣言与落地指南。文章里，Cobus 把 Loop Engineering 定义为：

> **Loop Engineering 是从「你逐回合提示编码代理」向「你设计一个系统（the loop）自动提示代理」的转型。**

loop 本身可以被想象成一个**递归目标（a recursive goal）**：你定义一个目的，AI 不断迭代直到完成（Addy Osmani 的框架）。它是一套建立在人类工程师角色迁移之上的工程纪律：你不是那个每天敲提示词的人，而是那个设计"谁来敲、什么时候敲、怎么验证"这套系统的人。

### 1.2 关键数据与信息

- 作者：Cobus Greyling，Kore.ai **首席布道官（Chief Evangelist）**，AI Native 布道者
- 发布渠道：Substack（`cobusgreyling.substack.com`）
- 发布时间：2026-06-09
- 同系列背景：Context Engineering → Harness Engineering → Loop Engineering（AI 概念逐层演进）
- 关联开源仓库：`github.com/cobusgreyling/loop-engineering`
- 生态关联系：Anthropic 工程博客《Effective harnesses for long-running agents》、Addy Osmani 的 X 帖子、OpenClaw 创作者 Peter Steinberger

### 1.3 它解决什么问题？

传统 AI 编码工作流是：**写提示词 → 读输出 → 写下一个提示词**。人在"一回合又一回合地握着工具"。Cobus 指出：旧范式没法规模化——它在每个文件、每个仓库、每个团队重复劳动，而且人无法同时给 10 个代理逐条提示。

Loop Engineering 的答案：**构建小型自主控制系统来使用这些代理。** 你不再逐回合驱动代理，而是设计一个系统让它在无人的情况下自己运行——按调度（schedule）或直到条件达成——这正是它相对"单次对话"的本质性不同。

---

## 二、核心思想

### 2.1 概念演进：三层的世界观

文章开篇就厘清了 AI 编码工具的演进脉络（这本身就是一个观点）：

| 层级 | 解决的问题 | 比喻 |
|------|-----------|------|
| **Context Engineering** | 让代理一开场就带对信息 | 喂饱上下文 |
| **Harness Engineering** | 武装单次代理运行（工具/回自动） | 给单次"出拳"装套 |
| **Loop Engineering** | 让代理被反复反复地调度、自我喂食 | 让"系统"自己挥拳 |

> "想想它像三个层级，每一层解决一个不同的问题……**harness 武装单次代理运行；loop 是持续调度上 pfone agents、派生子代理、并自我加料的那个层。**"

### 2.2 harness 与 loop 的分工（关键区别）

- **Harness**：为**一次** agent run 提供脚手架（tools、acceptance criteria、feedback）。
- **Loop**：是**外层**外壳——按调度运行、派生子代理、循环验证、持久化、自我喂食。

循环不是"更好的提示词"，而是一个**有心脏与脊柱的系统**。

### 2.3 一句话的定义（Addy Osmani 的框架）

> **Addy Osmani 的框架："Loop engineering 就是用你替换自己作为"提示 agent 那个人"的身份。你设计系统来代替。这里的 loop 可以看成一种递归式目标——你定义目的，AI 不断迭代直到完成。"**

### 2.4 两个关键引语（行业落脚点）

- **Peter Steinberger（OpenClaw 创造者）**："你不应该再提示编码代理了。你应该设计循环来提示你的代理。"
- **Boris Cherny（Claude Code 负责人）**："我不再提示 Claude 了。我有正在运行的循环在提示 Claude 并决定该干什么。**我的工作是写循环。**"

> 工具融合的趋势很鲜明：Claude Code 与 OpenAI Codex 都落在了非常相似的原语上，所以「循环的形状」正变得**几乎与工具无关**。

---

## 三、详细教程：五大构建块 + 记忆（核心六件套）

这是文章的重头戏。一个真正无人看管的循环**不是一条很长的提示词，而是一个有 6 个部分的小系统**——五个是能力，第六个是支撑状态的脊柱。

### 3.1 行动一：自动化/调度（The Heartbeat）

> **循环的心脏：调度。**

没有调度，你只有一个一次性代理会话；有了调度，你有**按节奏进行发现与分诊**的能力。

- 它把"我每天早上该查一下 CI"变成**一种无论你是否打开终端都会发生的事**。
- **Claude Code**：`/loop`、`/schedule`、`/goal`（"执行直到可验证条件达成"，用一个**独立模型**检查"完成"，不让工人给自己的作业打分）；Hooks 和 GitHub Actions 把同一想法带到聊天之外的持久化。
- **Grok**：`/loop [interval] <prompt>` + 底层调度器工具（`scheduler_create`、`scheduler_list`、`scheduler_delete`）——可重复、持久、可立即执行。

> **"心跳不需要很聪明，但它需要可靠。"**

### 3.2 行动二：工作树（Worktrees）——安全的并行

- 两个代理同时编辑同一批文件 = **合并事故的前戏**。
- 用隔离的 git 工作树（或等价 checkout）：每个代理拥有自己的工作目录，同时共享历史。
- 两大主流代理工具都内置支持；子代理可以被送到全新的 checkout 里并行工作。

> 在 Grok 里：生成子代理时传 `isolation: "worktree"`。**清理很重要**——一个遗留孤儿工作树的循环，是个你会后悔的循环。

### 3.3 行动三：技能（Skills）——持久化项目知识

> **每个会话，代理都是冷启动。**

- 惯例、构建命令、审查标准，甚至踩过的坑（"我们不做那件事"）都必须被外部化（externalise）。
- **技能（[Skills）是偿还"意图债务"（intent debt）的方式。**
- 一个 `SKILL.md`（+ 可选脚本与引用）装下那些**跨会话成本地传承**的知识。
- Claude Code 用它 `CLAUDE.md` 与 skills，打包成 plugin 便于分发；Grok 用同一模式。

> 没有技能，**每个 loop run 都是第一天**。

### 3.4 行动四：插件与连接器（Plugins & Connectors）——连真工具

- **一个只能读文件系统的 loop，只是一个只能提出建议的 loop。**
- MCP（Model Context Protocol）让 loop**可以行动**：开 PR、更新 Linear ticket、发 Slack 通知、查数据库、触发 runbook……loop 从"评论员"变成"操作员"。
- MCP 已成为公共基座（common substrate），为一个工具写的连接器常常能平移到另一个工具。

### 3.5 行动五：子代理 | 制作者/检查者分离（Maker/Checker）

> **写代码的代理是它自己工作的蹩脚评断者。**

- 这不是"模型能力的限制"，而是**结构性的**（structural）。
- 一个代理（或团队负）探索与实现，**另一个**（有时是更强的模型，但总是不同的指令）按 specs、skills、tests 来验证。
- 在无人看管的 loop 里，**验证者是你能放心离开的基础**。
- `/goal` 在很多工具应用了同一原则：**一个全新的（fresh）模型决定停止条件是否达成**。

### 3.6 第六件：记忆（Memory）——连贯的脊柱

> **以上所有都过不了会话边界。**

- loop 必须读写某种**外部**存储：`STATE.md`、`LOOP-STATE.json`、Linear 看板的一列、GitHub Projects 的一个视图。
- 一个好状态回答三个问题：
  1. 我们现在在做什么？
  2. 上次我们试了什么、结果如何？
  3. 什么在等待人类处理？

> 对于跨天、跨多轮的 loop，这是**不可协商**的。**状态文件通常是 loop 产生的最重要的产物。**

---

## 四、设计哲学

### 4.1 「自我驱动控制系统」而非「大提示」

文章的精神内核：**Loop Engineering 不是把单点提示写得更长，而是构建一个会反复自我调用的系统。** 你的角色从"提示者"转向"系统的设计者"。

### 4.2 「工具无关的循环形状」

关于 Agent 工具的融合趋势，文章强调 Tool-Agnostic："Claude Code 与 OpenAI Codex 都落在非常相似的原语上，所以 loop 的形状正变得与工具无关。"——这暗示了行业正在收敛到一套**标准的代理编排脚本**。（下节的映射表证明了这件事）

### 4.3 「心需公平，验证者独立」的原则

多位引言共同体现了"制作/检查分离"的哲学：最有力的代理系统同时保有一个高质量的**验证者**，并且不会让"写代码的代理给自己的作业打分"。这是一种面向安全的——在无人值守环路中最低限度的信任。

### 4.4 「可以杠杆，也可以陷阱」的战斗精神

文章的结尾广播出一个清醒的警告："认知的投降是诱人的陷阱（Cognitive surrender is the comfortable trap）。" **同一个 loop 设计可以加速一个坚持当好工程师的人，也能让一个人完全放弃判断。** 构建 loop 时，要像"打算留在工程师位置上的人"那样，而不是"只按按钮 go 的人"。

---

## 五、评估总结：观点与结论

### 5.1 观点/结论清单（直接引用原文的表述）

1. **旧流程的可替代性：** 旧的"写提示词 → 读输出 → 写下一个提示词"正在被"构建小型自主控制系统来使用代理"取代。
2. **层级观：** Loop Engineering 是比 "agent harness engineering" 更高的一层。
3. **循环的形状走向工具无关：** Claude Code 与 Codex 已经收敛到类似的原语。
4. **核心的定义是递归目标：** 你定义一个目的，AI 迭代直到完成。
5. **五大块 + 记忆的完整结构**：Any真正无人看管的 loop 永远不只是一条提示词，而是六个部分的小系统。
6. **「验证器是让你能走开的原因」：** 独立验证者让你能离开并信任无人操作的部分。
7. **现实不该被跳过：** token 成本、认知投降与理解债——这些是真实的成本，不应被理想化的叙事掩盖。
8. **承担者观点（原文引语）：** Peter Steinberger和Boris Cherny 的一线观点却共同聚焦在"我的工作是写循环"。

### 5.2 关键金句（值得 memo 的）

- Boris Cherny："我不再提示 Claude 了。我有正在运行的循环在提示 Claude 并决定该怎么做。**我的工作是写循环。**"
- Peter Steinberger："你不应该再提示编码代理了。你应该设计循环来提示你的代理。"
- "心跳不需要更聪明，但需要可靠。"
- "技能是偿还完意图债务的方式。"
- "通用的循环无法通过会话边界靠数字生存——记忆是持久的脊柱。"
- "为打算留好工程师的人构建循环，而不是为只按 go 的人。"

---

## 参考文献

- 原文：`https://cobusgreyling.substack.com/p/loop-engineering`
- 关联开源仓库：`https://github.com/cobusgreyling/loop-engineering`
- Anthropic 工程博客：`https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents`
- Anthropic 递归自改：`https://www.anthropic.com/institute/recursive-self-improvement`
- 作者主页：`https://cobusgreyling.me/`
- 作者：Cobus Greyling（Kore.ai 首席布道官）