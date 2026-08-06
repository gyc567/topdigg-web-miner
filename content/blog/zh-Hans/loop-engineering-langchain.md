---
title: "The Art of Loop Engineering 深度解析（LangChain 官方）：四层循环堆叠——从 Agent 循环到验证循环、事件驱动循环与爬山改进循环，以及每层对应的 LangChain 原语"
description: "以 LangChain 官方博客《The Art of Loop Engineering》（作者 Sydney Runkle，2026-06-16，7 分钟阅读）为蓝本，完整解析 LangChain 眼中的\"循环堆叠\"（loopcraft）世界观。核心思想：核心 agent 算法本身就是一个循环——给 LLM 上下文，让它循环调用工具直到完成。但这只是最基础的循环，远非唯一。借鉴 swyx 的 loopcraft 思想，LangChain 提出四层循环：① Agent loop（模型循环调用工具直到任务完成，对应 create_agent）；② Verification loop（验证循环：grader 对照 rubric 检查输出，不合格则带反馈重试，对应 RubricMiddleware/after_agent hook，LLM-as-judge 是经典实现）；③ Event driven loop（事件驱动循环：事件触发 agent 运行——新文档落地、cron 调度、webhook 到达，agent 成为常驻组件，对应 LangSmith Deployment 的 cron/webhooks、Fleet 的 channels/schedules、OpenClaw 的 heartbeats）；④ Hill climbing loop（爬山循环：每个 agent 运行产生 trace，分析 agent 阅读 trace 并用发现重写 harness 配置——提示词/工具/grader 调整，对应 LangSmith Engine；还可外推至 RL 微调与记忆/技能优化）。文章强调：第四层（也许最重要）自动化的是\"改进本身\"，关键在于返回箭头不是回到顶部，而是直接伸进内部更新 agent 循环——外层循环的每一轮都让内层循环更有效。同时坚持\"自动化不等于移除人类\"：每一层都有天然的人类监督点，敏感动作（金融交易、数据库操作）需要实时人工审查。结尾引用 Satya Nadella：尽早建立学习循环的公司，人类判断与 token 资本复利，将构建难以复制的优势。"
date: "2026-08-06"
author: "TopDigg Research Team"
tags: ["Loop Engineering", "LangChain", "LangSmith", "AI Agent", "loopcraft", "swyx", "create_agent", "RubricMiddleware", "LLM-as-Judge", "Deep Agents", "LangGraph", "Fleet", "Satya Nadella"]
categories: ["Deep Dive"]
keywords: ["Loop Engineering", "LangChain", "LangSmith", "循环工程", "AI 代理", "loopcraft", "swyx", "验证循环", "事件驱动", "爬山循环", "create_agent", "RubricMiddleware", "Engine", "Fleet", "人类监督", "Satya Nadella"]
---

# The Art of Loop Engineering 深度解析（LangChain 原文）：四层循环堆叠——从 Agent 循环到验证循环、事件驱动循环与爬山改进循环

> 核心思想：**Agent 的核心算法就是一个循环——给 LLM 上下文，让它循环调用工具直到完成。但这只是最基础的循环，远非唯一。** LangChain 官方博客（作者 Sydney Runkle，2026-06-16）借鉴 swyx 的 "loopcraft: the art of stacking loops"（堆叠循环的艺术）思想，提出四层循环堆叠的世界观：**① Agent loop**（模型调用工具直到任务完成，`create_agent` 原语）；**② Verification loop**（验证循环——grader 对照 rubric 检查输出，不合格就带反馈重试，`RubricMiddleware` / `after_agent` hook，LLM-as-judge 是经典实现）；**③ Event driven loop**（事件驱动循环——事件触发 agent 运行：新文档落地、cron 调度、webhook 到达，agent 成为整个系统中常驻运行的组件，LangSmith Deployment 的 cron/webhooks、Fleet 的 channels/schedules、OpenClaw 的 heartbeats）；**④ Hill climbing loop**（爬山改进循环——每个 agent 运行产生 trace，分析 agent 阅读 trace 并用发现重写 harness 配置，LangSmith Engine 实现；还能外推为 RL 微调信号与记忆/技能优化）。关键动作：**第四层的返回箭头不是回到顶部，而是伸进内部直接更新 agent 循环**——外层循环的每一轮让内层循环更有效。但自动化不等于移除人类：每一层都有天然的人类监督点，敏感动作（金融交易、数据库操作）需要实时人工审查。结尾引用 Satya Nadella：**尽早建立学习循环的公司，人类判断与 token 资本复利，将构建难以复制的优势。**

---

## 一、项目说明

### 1.1 它是什么？

本文要解析的是 **LangChain 官方博客发表的文章《The Art of Loop Engineering》**，作者 **Sydney Runkle（LangChain）**，发布于 **2026-06-16**，阅读时长约 7 分钟。它不是纯概念文，而是一篇**产品化的工程世界观**：LangChain/LangSmith 平台（Observability、Evaluation、Deployment、Sandboxes、LLM Gateway、Fleet、Engine、deepagents、langgraph）几乎每个能力都能在这套"循环堆叠"框架里找到位置。

文章立场一句话：**Agent 有用，是因为它们通过在现实世界中采取行动来自动化工作。但让 agent 可靠地做有价值的工作，需要的不仅仅是一个好模型——它需要一个精心设计的、适配一组任务的 harness（脚手架）。** 核心 agent 算法很简单：给 LLM 上下文，让它在一个循环里调用工具直到完成——这是最基础的循环。**但它远非唯一驱动 agent 的循环。**

文章引用了 swyx（Shawn Wang）最近写的一篇关于 **"loopcraft: the art of stacking loops"** 的文章——核心思想是：**你可以堆叠和扩展循环，来构建更有效的 agent。** LangChain 这篇文章就是回答："这是我们如何看待这个堆叠结构，以及如何用 LangChain 原语为每一层插桩（instrument）。"

### 1.2 关键数据与信息

- 作者：**Sydney Runkle（LangChain）**，致谢 Vivek、Mason、Harrison、Hunter
- 发布渠道：LangChain 官方博客 `langchain.com/blog`
- 发布时间：**2026-06-16**，阅读时长 7 分钟
- 核心灵感来源：swyx 的《loopcraft: the art of stacking loops》
- 贯穿全文的动机示例：**LangChain 内部文档 agent（docs agent）**——收到文档改进请求 → 模型规划并起草修改 → 用工具 clone 仓库、读文件、写文档、开 PR
- 平台上下文：LangSmith（Observability / Evaluation / Deployment / Sandboxes / LLM Gateway / Fleet / Engine）+ 开源框架（deepagents / langgraph / langchain）
- 结尾观点来源：Satya Nadella（微软 CEO）关于组织学习循环的论述
- 同行结论：Steipete（Peter Steinberger）、Boris（Cherny）、Andrej（Karpathy）"都得出了同样的结论"

### 1.3 它解决什么问题？

文章解决的是一系列嵌套的问题：

1. **单层问题**：agent 循环能干活，但**第一次跑不一定产生正确、一致的输出**——需要验证层兜底。
2. **集成问题**：agent 不该是被你手动调用的东西，而应该是**在更大系统里持续运行的组件**——需要事件驱动层。
3. **改进问题**（也许最重要）：前三层自动化的是"工作"，第四层自动化的是"**改进本身**"——通过阅读 trace 反向优化 harness。

它的回答是四层循环堆叠 + 每层的 LangChain 原语 + 每层的人类监督点。

---

## 二、核心思想

### 2.1 一句话世界观

> **"Agent 的核心算法是简单的：给 LLM 上下文，让它在一个循环里调用工具直到完成。这是最基础的循环。但它远非唯一驱动 agent 的循环。"**

所有更高级的能力，都是在这个基础循环之上**堆叠**出来的。文章的核心框架是四层：

| 层级 | 循环 | 作用 | LangChain 原语 |
|------|------|------|----------------|
| 1 | **Agent loop** | 模型反复调用工具直到任务完成 | `create_agent`、任何 LangChain 支持的模型 |
| 2 | **Verification loop** | agent 运行后，输出对照 rubric 打分，不合格就带反馈重试 | `RubricMiddleware` |
| 3 | **Event driven loop** | 事件触发 agent 运行，更新真实系统 | LangSmith Deployment（cron 触发 / webhooks）或 Fleet channels |
| 4 | **Hill climbing loop** | 生产运行产生的 trace 喂给分析 agent，改进 harness 配置 | LangSmith Engine |

### 2.2 循环堆叠的本质：返回箭头伸进内部

LangChain 强调第四层的关键动作：

> **"The key move here is that the return arrow doesn't just loop back to the top — it reaches inside and updates the agent loop directly. Each cycle of the outer loop makes the inner loops more effective."**
> （这里的关键动作是：返回箭头不只是回到顶部——它直接伸进内部，更新 agent 循环本身。外层循环的每一轮循环，都让内层循环更有效。）

这正是"堆叠循环"与"串行执行多个任务"的本质区别：**循环套循环，外层的输出反过来优化内层的配置。**

### 2.3 自动化 ≠ 移除人类

文章专门用一节强调：

> **"Automation doesn't mean removing humans from the loop."**（自动化不意味着把人类从循环中移除。）

每一层都有**天然的人类监督点（natural points where human oversight adds value）**：

- 在 **agent loop**：敏感动作/工具调用前要求人工输入
- 在 **verification loop**：敏感工作流中人类可以作为 grader
- 在 **application loop**：输出返回给终端用户前，人类可以审批
- 在 **hill climbing loop**：harness 改进在部署前可经过人工审查

LangChain 的立场：**所有开源框架都把"human in the loop"作为一等公民原语。** 一个例子："自动化 grader 能检查链接是否解析；但要发现框架对目标受众来说不对，需要人类——那种从上下文、经验和品味中获得的判断，正是人类审查的价值所在。"

---

## 三、详细教程：四层循环逐层拆解

### 3.1 Loop 1：The Agent（Agent 循环）——自动化工作的基础

**在最核心处，agent 就是一个"在一个循环里调用工具直到任务完成"的模型。** 这就是 LangChain 的 `create_agent` 给你的东西：**选任意模型、插上工具，你就有了一个可工作的 agent 循环。**

- **工具是 agent 获得"在现实世界采取行动"能力的来源。** 没有工具，agent 只是生成文本；有了工具，agent 可以写文件、跑代码、调用 API。
- **贯穿全文的动机示例（docs agent）**：在第一个循环层级，它收到一个文档改进请求，模型规划和起草修改，并使用工具**clone 仓库、读文件、写文档、开 pull request** 等。

这一层自动化的是"**做事**"（getting work done）。

### 3.2 Loop 2：The Verification Loop（验证循环）——保证质量与正确性

**Agent 循环能干活，但它不总是第一次就跑出正确、一致的输出。当一致性重要时，用一个验证循环把它包起来：检查输出，不达标就把反馈送回给模型。**

验证循环增加一个 **grader（评分器）**：

> 检查 agent 的输出是否对照 **rubric（评分标准）** 达标；不达标就把结果连同反馈一起送回。

- **Grader 可以是确定性的（deterministic），也可以是 agentic 的（LLM-as-judge 是经典例子）。**
- **LangChain 实现**：`RubricMiddleware` 直接处理这个模式；或者用 `create_agent` 上的 `after_agent` hook 自己接。

**docs agent 示例**：grader 在每次尝试后运行测试——**检查所有链接能否解析、所有 CI 检查是否通过、diff 是否限定在实际请求的范围内**。这类错误无需人工审查即可捕获。

**权衡**：增加验证会增加**每次运行的延迟和成本**。当质量比速度重要时（大多数生产用例正是如此），它值得。

这一层自动化的是"**验证**"（verifying）。

### 3.3 Loop 3：The Event Driven Loop（事件驱动循环）——规模化地自动化工作

**agent 开发最重要的部分之一是集成层：把 agent 连接到你的生态系统中，让它能在后台运行。**

事件驱动循环就是这样做的：**一个事件触发——新文档落地、一个调度触发、一个 webhook 到达——然后 agent 运行。**

> **"The agent isn't something you invoke manually; it's a component running continuously inside a larger system."**
> （agent 不是你手动调用的东西；它是更大系统内部持续运行的一个组件。）

**LangChain 实现**：

- **LangSmith Deployment** 支持触发基础设施，包括 **cron 调度和 webhooks**。
- **cron 的流行应用案例："heartbeats"（心跳）**——来自 **OpenClaw** 项目，把 agent 变成**永远在线、主动的助手**。
- **docs agent 由 Fleet（LangChain 的无代码 agent 构建器）驱动**：Fleet 的 **channels 和 schedules** 处理事件驱动与 cron 式触发。例如用 channel 在有人于 `#docs-plz` Slack 频道发消息时触发 docs agent。

这一层自动化的是"**规模化的工作**"（work at scale）——agent 从"你叫它才来"变成"系统的一部分，事件来了就干活"。

### 3.4 Loop 4：The Hill Climbing Loop（爬山改进循环）——自动化改进本身

**前三层自动化的是工作；第四层（也许是最重要的）自动化的是改进！**

- **每个 agent 运行都会产生一个 trace（轨迹）**：模型做了什么、调用了哪些工具、grader 反馈等等的记录。
- 这些 trace 包含关于"**什么有效、什么无效**"的高价值信号。
- **爬山循环在 trace 上运行一个分析 agent，并用发现来重写 harness 的改进配置**——包括**提示词/工具的调整，或 grader 的调整**。
- **LangChain 实现**：**LangSmith Engine**（trace 分析 agent）用于给这个第四循环插桩。

**docs agent 示例**：他们在 docs agent 的 trace 上运行 Engine 来检测问题。**当多个 trace 指向一个潜在问题时，就会提交一个 issue，要求修改有问题的提示词或工具。**

**外推方向**（文章明确列出）：

> "展望未来：提示词和工具配置是最容易改进的东西，但它们不是唯一选项。对于运行开放权重模型的团队，爬山循环可以喂给 **RL 微调（reinforcement fine-tuning）**，用 trace 或 eval 结果作为训练信号来改进模型本身。**辅助上下文（auxiliary context）**——如记忆和检索到的技能——也可以用同样的方式改进。**循环是模式；它优化什么取决于你。**"

（"The loop is the pattern; what it optimizes is up to you."）

这一层自动化的是"**改进**"（improvement）——而且是**持续、自主的改进**。

### 3.5 完整对照表

| 循环 | 做什么 | 影响 | LangChain 原语 |
|------|--------|------|----------------|
| 1. Agent loop | 模型反复调用工具直到任务完成 | 自动化工作 | `create_agent`、任何 LangChain 支持的模型 |
| 2. Verification loop | agent 运行后输出对照 rubric 打分，失败则带反馈重试 | 保证工作的质量与正确性 | `RubricMiddleware` |
| 3. Event driven loop | 事件触发 agent 运行，更新真实系统 | 规模化自动化工作 | LangSmith Deployment 的 cron 触发 / webhooks，或 Fleet channels |
| 4. Hill climbing loop | 生产运行的 trace 喂给分析 agent，改进 harness 配置 | 改进 harness 本身 | LangSmith Engine |

---

## 四、设计哲学

### 4.1 "循环是模式；它优化什么取决于你"

LangChain 把 loop 抽象成一个**元模式**：同一个"分析-调整-重试"循环，可以用来优化提示词、工具、grader、RL 训练信号、乃至记忆与技能。**工具不同，模式相同。** 这是从"做一个 agent"到"做一个会自己变好的 agent 系统"的哲学跳跃。

### 4.2 从工具之争到堆叠结构

文章的潜台词呼应了 swyx 的 loopcraft 与 Addy Osmani 的观察：**一旦你把注意力从"哪个 agent 工具"转移到"循环如何堆叠"，争论就结束了。** 价值不在任何一个单独的循环里，而在循环之间的**层级关系**里——特别是第四层"外层循环优化内层循环"的递归结构。

### 4.3 人类监督是分层设计的一部分，不是补丁

每层都有天然的介入点，且 LangChain 明确把 human-in-the-loop 作为**一等公民原语**而非事后补救。判断（judgment）——"从上下文、经验和品味中获得"的能力——是自动化 grader 无法替代的。**敏感动作（金融交易、数据库操作）需要实时人工审查。**

### 4.4 组织视角：学习循环是护城河

文章结尾引用 Satya Nadella（微软 CEO）框定组织层面的利害：

> **"companies that build learning loops early, where human judgment and token capital compound together, will build an advantage that's hard to replicate."**
> （**尽早建立学习循环的公司——人类判断与 token 资本在其中共同复利——将构建一个难以复制的优势。**）

同时文章指出行业共识已经形成：

> **"AI leaders like Steipete, Boris, and Andrej have all arrived at the same conclusion: the potential in agents is in the loops you build around them."**
> （Steipete、Boris、Andrej 等 AI 领袖都得出了同样的结论：**agent 的潜力在于你围绕它们构建的循环。**）

### 4.5 重心转移：从 Loop 1/2 到 Loop 3/4

> **"We've been thinking about loops 1 and 2 for a while. But focus should pivot to loops 3 and 4 where value compounds by embedding agents into your ecosystem that continuously improve in response to your criteria."**
> （我们一直在思考循环 1 和 2。但重心应该转向循环 3 和 4——价值通过把 agent 嵌入你的生态系统、让它们按你的标准持续改进而复利增长。）

---

## 五、归纳总结

### 5.1 核心观点清单

1. **Agent 的核心是一个循环**：给 LLM 上下文，循环调用工具直到完成——这是所有 agent 工作的基础（Loop 1，`create_agent`）。
2. **可靠性需要验证循环**：grader 对照 rubric 检查输出，不合格带反馈重试；grader 可以是确定性逻辑或 LLM-as-judge（Loop 2，`RubricMiddleware` / `after_agent` hook）。代价是延迟与成本，质量优先时值得。
3. **规模化需要事件驱动**：agent 从"被手动调用"变成"系统里持续运行的组件"——事件（新文档、cron、webhook）触发运行（Loop 3，LangSmith Deployment cron/webhooks、Fleet channels、OpenClaw heartbeats）。
4. **改进可以自动化**：trace 是改进信号，分析 agent 阅读 trace 并重写 harness 配置——提示词、工具、grader（Loop 4，LangSmith Engine）。
5. **关键动作是"伸进内部"**：第四层的返回箭头不是回到顶部，而是直接更新 agent 循环——外层循环让内层循环更有效。这是 loopcraft 的本质。
6. **外推空间巨大**：同样的循环模式可优化 RL 微调信号、记忆、检索技能——"循环是模式，它优化什么取决于你"。
7. **自动化不意味着移除人类**：每层都有天然监督点；判断力来自上下文、经验与品味，是自动化 grader 无法替代的；敏感动作（金融交易、DB 操作）需要实时人工审查。
8. **学习循环是组织护城河**（Satya Nadella）：人类判断与 token 资本复利 → 难以复制的优势；行业共识（Steipete/Boris/Andrej）已形成。

### 5.2 一句话总结

> **Agent 的价值不在单个循环里，而在循环的堆叠结构里：Agent 循环做事，验证循环兜底，事件驱动循环规模化，爬山循环让系统自己变好——而人类判断是贯穿每一层、让 token 资本复利的那个常数。** 从"构建 agent"到"构建会自己改进 agent 的系统"，这就是 loop engineering 的落地方案。

---

## 参考资料

- 原文：LangChain，《The Art of Loop Engineering》（Sydney Runkle，2026-06-16）—— `https://www.langchain.com/blog/the-art-of-loop-engineering`
- swyx，《loopcraft: the art of stacking loops》
- LangChain 相关文档：`create_agent`、`RubricMiddleware`、`after_agent` hook、LangSmith Deployment（cron jobs / webhooks）、LangSmith Engine、Fleet channels、deepagents quickstart、langgraph
- 关联项目：OpenClaw（heartbeats，Peter Steinberger）
- 关联人物观点：Steipete（Peter Steinberger）、Boris Cherny（Anthropic Claude Code）、Andrej Karpathy、Satya Nadella（微软 CEO）
- 本站相关：《Loop Engineering 深度解析（Addy Osmani 原作）》（`loop-engineering-addy-osmani`）、《Loop Engineering 深度解析（Cobus Greyling 原作）》（`loop-engineering-substack-analysis`）
