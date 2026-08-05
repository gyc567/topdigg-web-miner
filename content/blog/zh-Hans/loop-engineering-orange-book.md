---
title: "Loop Engineering 橙皮书深度解析：别再问我什么是 Loop Engineering——从「提示者」到「系统设计者」"
description: "全面解析花叔（HuaShu）开源的《Loop Engineering 橙皮书》——一本用大白话讲透 Loop Engineering 的免费 PDF 书籍（v260615，MIT 协议）。核心思想：别再当那个手动提示 AI 的人，去设计一个替你提示 AI 的系统。涵盖 prompt→context→harness→loop 四层栈、一个循环的五个动作（自动化/工作树/技能/插件/子代理）+ 记忆、为什么 AI 不能给自己的代码打分、三个真实循环案例（Addy 早晨分诊 / Stripe Minions / 调度的现实）、四种代价（验证债/理解腐化/token 爆炸/认知投降），以及从 §01 到 §09 的完整章节教程与「今天构建第一个循环」的实操指南。项目说明、核心思想、设计哲学、观点归纳一文讲透。"
date: "2026-08-06"
author: "TopDigg Research Team"
tags: ["Loop Engineering", "Orange Book", "AI Agent", "Harness", "Claude Code", "Codex", "MCP", "花叔", "自动化"]
categories: ["Deep Dive"]
keywords: ["Loop Engineering", "橙皮书", "循环工程", "AI 代理", "Harness", "Claude Code", "Codex", "工作树", "技能", "子代理", "验证债", "认知投降"]
---

# Loop Engineering 橙皮书深度解析：别再问我什么是 Loop Engineering——从「提示者」到「系统设计者」

> 核心思想：**别再当那个手动提示 AI 的人——去设计一个替你提示 AI 的系统。** 2026 年 6 月，Peter Steinberger、Anthropic Claude Code 负责人 Boris Cherny、Google 的 Addy Osmani 三位行业人物几乎在同一周独立喊出了同一个转变。花叔（HuaShu）把它写成了一本免费开源的《Loop Engineering 橙皮书》：不教你写更好的提示词，而是教你设计一个循环系统——它自动发现工作、分配工作、检查工作、记录工作、决定下一步。**你的工作不再是"提示代理"，而是"设计循环"。**

---

## 一、项目说明

### 1.1 它是什么？

**Loop Engineering 橙皮书**（`别再问我什么是 Loop Engineering` / *Stop Asking Me What It Is*）是花叔橙皮书系列的 Loop Engineering 卷——一本以**大白话**讲透 AI 代理循环工程的开源书籍。它以 PDF 形式发布，中文完整版 4.3MB，英文版 859KB，完全免费、MIT 开源。

它回答一个问题：当"写提示词"这个时代结束时，程序员的价值在哪里？答案写在书名里——**别再问我什么是 Loop Engineering，去读这本书，然后去构建你的循环。**

### 1.2 关键数据

- 储存库：`https://github.com/alchaincyf/loop-engineering-orange-book`
- 版本：**v260615**（2026 年 6 月首版）
- License：**MIT**（c）2026
- 作者：**花叔（HuaShu）**——AI Native Coder、独立开发者
- 作者平台：全平台 **50 万+ 粉丝**；用 AI 独立做出了 App Store 付费榜 #1 的 iOS 应用，全程没有手写代码
- 作者主页：X @AlchainHust · YouTube @Alchain · 网站 `huasheng.ai`
- 内容形态：中文 PDF（4.3MB，完整版）+ 英文 PDF（859KB）+ 微信读书免费上架

### 1.3 橙皮书系列

这是**橙皮书系列**中的 Loop Engineering 卷。该系列已出版 **12 本**、合计 **994 页**、全部免费，可在 `huasheng.ai/orange-books` 获取：

| 卷 | 书名 | 页数 |
|----|------|------|
| 01 | Claude Code 从入门到精通 | 102 |
| 02 | Claude Code 源码解析 | 72 |
| 03 | Harness Engineering（前置知识） | 102 |
| 04 | Agent Skills | 80 |
| 05 | OpenClaw | 120 |
| 06 | Hermes Agent | 63 |
| 07 | Cursor 从入门到精通 | 50 |
| 08 | Gemma 4 完全指南 | 42 |
| 09 | Polymarket 指南 | — |
| 10 | Claude Opus 4.7 System Card 中文版 | 232 |
| 11 | OpenAI Codex 从入门到精通 | 95 |
| 12 | 创始人行动手册 | 36 |

### 1.4 它解决什么问题？

过去两年，从编码代理获取价值的方式是：写一个好的提示词 → 分享上下文 → 读回复 → 再写下一个提示词。**人类一回合又一回合地握着工具。** Loop Engineering 断言这个时代正在结束：现在你构建一个系统，让它去找工作、发工作、检查工作、记录工作、决定下一步——**是系统在戳代理，而不是你在戳代理。** 这本书就是教你如何构建这个系统的落地手册。

---

## 二、核心思想

### 2.1 范式转移：从「提示者」到「系统设计者」

- 传统做法：人写提示词 → AI 执行 → 人检查 → 人再写提示词。
- Loop Engineering 的做法：人设计循环 → 循环自动提示 AI → AI 自主执行 → 循环自动验证 → 循环自动记录。
- **人从「操作员」变成「架构师」**——你的价值不再是写出更好的提示词，而是设计出更好的控制系统。

> "I don't prompt Claude anymore. I have loops running that prompt Claude and figuring out what to do. My job is to write loops."（我不再提示 Claude 了。我有正在运行的循环在提示 Claude 并决定该做什么。我的工作是写循环。）——Boris Cherny，Anthropic Claude Code 负责人

> "You shouldn't be prompting coding agents anymore. You should be designing loops that prompt your agents."（你不应该再提示编码代理了。你应该设计循环来提示你的代理。）——Peter Steinberger

### 2.2 四层栈：prompt → context → harness → loop

```
prompt（提示词）→ context（上下文）→ harness（脚手架）→ loop（循环）
```

- **Prompt**：单条指令。
- **Context**：你给代理的工作素材。
- **Harness**：单次代理运行的脚手架——工具、完成标准、反馈回路。
- **Loop**：外层系统——按定时器运行、派生子代理、验证结果、记住状态、决定下一步。

Loop Engineering **比 Harness Engineering 高一层**：harness 是武装单次运行，loop 是武装整个系统。

### 2.3 一个循环的五个动作 + 记忆

| 动作 | 在循环中的职责 |
|------|--------------|
| **自动化（Automations）** | 按调度自主出去做发现 + 分诊 |
| **工作树（Worktrees）** | 让并行工作的两个代理互不踩脚 |
| **技能（Skills）** | 把代理本来只能靠猜的项目知识写下来 |
| **插件/连接器（Plugins/Connectors）** | 把代理插进你已经在用的工具（MCP） |
| **子代理（Sub-agents）** | 一个负责产出想法，另一个负责检查 |
| **+ 记忆/状态（Memory）** | 一个 markdown 文件、Linear 看板——任何存在于单次对话之外、记录"做了什么、下一步做什么"的东西 |

### 2.4 制作/检查分离：为什么 AI 不能给自己的代码打分

书的第五章专门论证：**写代码的 AI 不能给自己写的代码打分。** 生成与评估必须分离到不同的代理（或不同的模型实例）中——作者称之为 **"GANs for prose"**（散文版生成对抗网络）。`/goal` 命令就是这一原则的体现：它持续工作直到一个可验证的停止条件成立，而**由另一个独立的小模型检查你是否完成**——写代码的代理不是打分的那一个。

---

## 三、详细教程：9 个章节带你走完整个循环

书分 **4 大部分、9 个章节**，下面按章节梳理。

### 3.1 §01–§02 它是什么：定义与"一周起源故事"

- **§01 定义**：Loop Engineering 的正确定义与边界——它不是提示词的升级，而是提示词之外的系统层。
- **§02 起源**：2026 年 6 月那个病毒式传播的一周，三位行业人物（Peter Steinberger、Boris Cherny、Addy Osmani）独立命名了同一个转变；并给出 **prompt → context → harness → loop** 四层栈。

### 3.2 §03 一个循环的五个动作

第五章（§03）详细展开每个动作如何在真实循环中工作：调度负责发现与分诊、工作树负责隔离并行、技能负责持久化知识、连接器负责接真实工具、子代理负责制作/检查分离，外加记忆作为"第六件事"。

### 3.3 §04 构建循环的六个部件

- 把五个动作映射到你的工具上，就有了六大部件：**调度器、工作树、技能文件、插件/连接器、子代理定义、状态存储**。
- 关键原语在两大工具间几乎是**一一对应**的：

| 原语 | 在循环中的职责 | Codex App | Claude Code |
|------|--------------|-----------|-------------|
| **自动化** | 按调度发现 + 分诊 | Automations 标签页、`/goal` | 定时任务、`/loop`、`/goal`、hooks、GitHub Actions |
| **工作树** | 隔离并行特性 | 每线程内置工作树 | `git worktree`、`--worktree`、`isolation: worktree` |
| **技能** | 固化项目知识 | `SKILL.md`，用 `$name` 调用 | `SKILL.md`（同一格式） |
| **插件/连接器** | 连接你的工具 | MCP 连接器 + 插件 | MCP 服务器 + 插件 |
| **子代理** | 产出与验证 | `.codex/agents/` 里的 TOML | `.claude/agents/` 里的任务子代理 |
| **状态** | 追踪进度 | markdown 或 Linear | markdown（`AGENTS.md`）或经 MCP 接 Linear |

### 3.4 §05 为什么 AI 不能给自己的代码打分

- **验证原则**：写代码的代理不能给代码打分——"制作器"与"检查器"必须分离。
- 这也是 `/goal` 命令的设计根源：一个独立的小模型负责检查"是否已完成"（例如"test/auth 下所有测试通过且 lint 干净"）。

### 3.5 §06 三个真实的循环

1. **Addy 的早晨分诊循环**：每天早上定时跑一个自动化 → 调用分诊技能读取昨天的 CI 失败、打开的 issue、最近的 commit → 把发现写进 markdown 文件或 Linear 看板 → 对每个值得做的事，开一个隔离工作树 → 派一个子代理起草修复 → 派第二个子代理按项目技能和既有测试审查 → 连接器开 PR、更新 ticket。
2. **Stripe 的 Minions**：Stripe 的自主编码系统，**每周处理约 1,300 个 PR**——流水线式的循环工程在生产规模上的活例子。
3. **调度的现实**：定时驱动带来它自己的工程挑战——状态管理、失败恢复、人类监督，"按定时器跑"并不是免费的。

### 3.6 §07 四种代价（越自治越尖锐）

1. **验证债（Verification Debt）**：无人值守的循环也在无人值守地犯错。"制作/检查分离"让"做完了"变得有意义，但它仍然是一个声明，而不是一个证明。
2. **理解腐化（Comprehension Rot）**：循环越快地产出你没写过的代码，已存在的东西与你真正理解的东西之间的鸿沟就越大。顺滑的循环会让理解债长得更快——除非你读循环产出的东西。
3. **Token 爆炸（Token Blowout）**：不加约束的循环可能吞噬巨量 token。你是"token 富有"还是"token 贫穷"决定用法天差地别，精心设计停止条件至关重要。
4. **认知投降（Cognitive Surrender）**：当循环自己跑起来时，你会忍不住放弃自己的判断，它给什么就收什么。**设计循环是解药——但当它被用来逃避思考时，它就是助燃剂。同样的动作，相反的结果。**

### 3.7 §08 留在工程师的位置上

- 循环改变了工作，但它**不会把你从工作中删除**。
- 两个完全相同的循环，两个人可以跑出相反的结果——一个人用它来加速自己深刻理解的工作；另一个人用它来逃避理解工作本身。

> "The loop doesn't know the difference. You do."（循环不知道区别。你知道。）

### 3.8 §09 今天就开始：构建你的第一个循环（手把手）

**Step 1：选一件小事**
选一个重复性的、你有明确验收标准的小杂活（例如每日 issue 分诊、每日 CI 清扫报告）。

**Step 2：定调度**
决定频率与触发方式。用 Claude Code 的定时任务/`/loop`，或 GitHub Actions cron，或 Codex 的 Automations 标签页。

**Step 3：写技能**
把"这个项目怎么跑、为什么不能这么做"写进 `SKILL.md`——循环的每一轮都会从冷启动开始，技能就是你的"外化意图"。

**Step 4：搭状态**
建一个 `STATE.md`（或 Linear 看板），记录"做了什么、下一步做什么"——这是记忆，是第六件事。

**Step 5：制作/检查分离**
在 `.claude/agents/` 或 `.codex/agents/` 里定义两个子代理：一个起草，一个按技能与测试审查。**写代码的不打分。**

**Step 6：第一周只报告，不修复**
让循环只输出发现，不自动改代码。读它的输出，纠正错误的部分——**你仍然是工程师。**

**Step 7：逐步放开**
第一周只报告 → 第二周在隔离工作树里尝试修复 → 确认无误后再考虑自动合并。每一条 `AGENTS.md` 或技能里的规则，都应能追溯到一个具体的过去失败——**每一行都要挣来。**

### 3.9 工具与命令速查

- Claude Code：`/goal`（跑到可验证停止条件）、`/loop`（按节奏重跑）、定时任务/cron、hooks、GitHub Actions、`git worktree`/`--worktree`、`isolation: worktree`、`.claude/agents/`
- Codex App：Automations 标签页（选项目/提示词/节奏/环境）、分诊收件箱、每线程内置工作树、`.codex/agents/` TOML
- 两者通用：`SKILL.md` 技能格式、MCP 连接器、插件分发

---

## 四、设计哲学

### 4.1 「构建系统，而不是当提示者」

中心哲学：**你停止一回合又一回合地驱动代理，而是设计一个外层系统让它自己驱动。** 你的工作从操作员变成架构师。循环是可复用、可版本化、可审计的——提示词是一次性的。

### 4.2 循环在 Harness 之上

Loop Engineering **比 Harness Engineering 高一整层**。harness = 武装一次代理运行；loop = 外层外壳——按定时器跑、派生子代理、验证工作、记住状态、决定下一步。

### 4.3 棘轮原理：每一次错误都变成一条规则

**"Every mistake becomes a rule."** 代理犯错，你就加一条约束让它永不再犯。`AGENTS.md` 或技能里的每一行都应能追溯到一次具体的失败——**挣来每一行**（Earn each line）。循环是复合的：错误被规则吸收，规则让系统下次更强。

### 4.4 工作树即并行纪律

两个代理写同一个文件 = 两个工程师提交同一行代码的头痛。Git worktree 修复了它：独立工作目录、独立分支、共享仓库历史——**编辑在物理上不可能互相碰到。**

### 4.5 技能是外化的意图

代理每一轮都是冷启动。技能就是"写在外部的大脑"——约定、构建步骤、"我们为什么不这样做"。没有技能，循环每轮都从零重新推导项目上下文；有了技能，循环开始**复利**。

### 4.6 产品在趋同，不在发散

Claude Code、Cursor、Codex、Aider、Cline——**它们长得比它们的底层模型更像彼此。** 模型各不相同，但 harness 模式在收敛。这标志着行业正在找到把生成式模型变成"能交付的东西"的那些承重脚手架。

> "A decent model with a great harness beats a great model with a bad harness."（不错的模型 + 优秀的 harness，胜过优秀的模型 + 糟糕的 harness。）

---

## 五、归纳总结：观点与结论

1. **提示词工程的时代在结束，循环工程的时代在开始。** 三位行业领袖同一周独立说出同一件事，说明这不是炒作，而是行业共识在成形。人从「提示者」变成「系统设计者」。

2. **循环的价值在于复合，不在于单次。** 提示词是一次性的，循环是可复用、可版本化、可审计的资产。错误被棘轮原理吸收成规则，规则让系统每轮更强。

3. **制作/检查分离是安全的基石。** AI 不能给自己的代码打分——这是书里最硬的技术论点。生成与评估必须分离（"GANs for prose"），独立小模型检查"是否完成"。

4. **自治不是免费的，四种代价会随自治加深而尖锐。** 验证债、理解腐化、token 爆炸、认知投降——`/goal` 的停止条件、隔离工作树、人类门控，都是为了给这四种代价装上刹车。

5. **同样的循环，不同的人，相反的结果。** "The loop doesn't know the difference. You do." 循环是放大器：加速深刻理解的人，也加速逃避理解的人。**留在工程师的位置上（Stay the engineer）是唯一正确的使用姿势。**

6. **第一周只报告，不修复。** 新系统上线第一周只输出发现、不自动改代码——先建立对系统行为的理解与信任，再逐步放开权限。这是 Loop Engineering 的安全哲学。

7. **工具在趋同，说明行业找到了承重墙。** 各大编码代理的 harness 模式收敛，意味着"把模型变成能交付的东西"的脚手架已被验证——这是整个行业的范式信号。

> "Build the loop. But build it like someone who intends to stay the engineer, not just the person who presses go."（构建循环。但要像打算一直当工程师的人那样构建，而不是像只负责按开始键的人那样。）

---

## 参考资料

- 储存库：`https://github.com/alchaincyf/loop-engineering-orange-book`
- 中文 PDF：`https://github.com/alchaincyf/loop-engineering-orange-book/raw/main/Loop-Engineering橙皮书-v260615.pdf`
- 英文 PDF：`https://github.com/alchaincyf/loop-engineering-orange-book/raw/main/Loop-Engineering-The-Complete-Guide-v260615.pdf`
- 橙皮书系列：`https://huasheng.ai/orange-books`（12 本全免费）
- 作者主页：`https://huasheng.ai` · X：@AlchainHust
- 来源基础：Addy Osmani《Loop Engineering》奠基文（2026-06-07）、Anthropic harness-design 工程博客、Stripe Minions 公开案例、Claude Code / Codex 官方文档
