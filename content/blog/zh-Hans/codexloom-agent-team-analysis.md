---
title: "CodexLoom — 从 Multi-Agent 到 Agent Team：让 AI 代理从工具变成一支真正的团队"
description: "深度解析 CodexLoom 的 Agent Team 最佳实践：为什么多个 Agent 不等于 Agent Team，怎样让 Agent 从一次性 Task 变成长期责任主体，通过 Profile、Message、Topic、Overview、External 五层结构，把原本集中在 Human 脑中的责任外化成整支团队可用的工作结构。"
author: topdigg-web-miner
date: 2026-08-09
tags:
  - AI Agent
  - Agent Team
  - Multi-Agent
  - Codex
  - CodexLoom
  - 团队治理
  - AI 协作
categories:
  - AI工具
  - 开发效率
---

# CodexLoom — 从 Multi-Agent 到 Agent Team：让 AI 代理从工具变成一支真正的团队

> **一句话说明**：CodexLoom 是一套把多条独立的 Codex Thread 织成一支"长期负责、能够协作、由 Human 治理"的 Agent Team 的工作方式与产品。它回答的核心问题是：**多个 Agent 什么时候才真正成为一支 Team？** —— 不是当它们同时开始运行，而是当它们开始长期承担不同责任、能够找到彼此、直接协作、持续收口，并在 Human 的治理下共同推进真实工作。

---

## 📌 项目速览

| 项目信息 | 内容 |
|---------|------|
| **产品名称** | CodexLoom |
| **官网** | [codexloom.ai](https://codexloom.ai) |
| **作者** | yan5xu（言午） |
| **解决的问题** | 把多个 AI 编程代理组织成一支可治理、可协作、可持续演化的 Agent Team |
| **核心载体** | Codex Thread（一条 Thread 绑定为一个长期存在的 Agent） |
| **文章形式** | 一份 Agent Team 的最佳实践长文（楔子 + 07 章） |
| **发布平台** | 微信公众号 |

这是一篇长文，也是一份 **Agent Team 的最佳实践**。它来自作者长期运行一支真实 Agent Team 的过程——不是理论推演，而是踩坑之后的经验总结。

---

## 🎬 开场故事：一次"意外"的外发

文章的开头很戏剧化。

作者本来打算把做了一个多月的 CodexLoom 项目先上线 Landing Page，慢慢打磨。结果负责 Web 的 Agent 接到上线指令后，按照已有的协作关系，通知了负责对外沟通的 **Community Agent**。Community Agent 一看"大新闻"，马不停蹄地整理素材，发到了飞书群里。

等作者看到的时候，**消息已经发出去了**。

这件事看起来像"失控"，但作者却觉得"它们"干得不错——因为整个过程中：

- 作者没有站在几个 Agent 中间，亲自选择下一步该找谁
- 没有搬运 Context、转述结果
- 工作仍然沿着已有的**责任、协作关系和授权边界**继续向前走

这次"意外"恰恰证明了 Agent Team 的价值：**当协作责任从 Human 转移到 Agent 之后，工作不再需要 Human 亲自串联每一个步骤。**

---

## 🧠 核心思想：为什么多个 Agent ≠ Agent Team

这是整篇文章的基石。

过去我们关心的是"怎样让单个 Agent 更强、能完成更长更复杂的任务"。但单个 Agent 的能力范围总有上限，于是越来越多的人开始同时使用多个 Agent。**Agent 多了，真正的瓶颈不再是单个 Agent 能做什么，而是怎样把这些 Agent 组织起来。**

作者给出一个非常尖锐的判断：

> **多个 Agent，并不会自动成为一支 Agent Team。**
>
> 如果每一项工作仍然要由 Human 选择入口、整理背景、搬运 Context，再把一个 Agent 的结果交给下一个 Agent，那么这些 Agent 本质上仍是一组独立工具。Human 仍然是整个系统里唯一的 Router，也是事实上的瓶颈。

作者用一个"连续责任线"模型来解释 Agent 的演化路径：

1. **Task** —— 一次性、边界清楚的工作（工作单位）
2. **Long-running Agent** —— 同一类责任开始有持续存在的主体（生命周期）
3. **Domain Agents** —— Scope 扩张、能力劣化后分化出的专业边界（分工）
4. **Human Router** —— 多个 Agent 出现后，协作瓶颈转移到 Human（瓶颈转移）
5. **Agent Team** —— 责任、关系、交接方式被外化，协作责任转移给 Agent（组织）

> **核心判断**
>
> 真实工作反复回来，逼出了 Long-running Agent；Scope 扩张与能力劣化，逼出了多个 Domain Agents；Agent 的分化，又把协作瓶颈集中到了 Human。

Agent 分化只是产生了多个 Agent。只有原本藏在 Human 脑子里的责任、关系和交接方式被逐渐外化，一部分协作责任开始从 Human 转移给 Agent，它们才可能真正成为一支 Team。

---

## 🏗️ 详细教程：从 Multi-Agent 到 Agent Team 的六步方法论

以下按作者原文的章节脉络，整理成可操作的六步教程。每一步回答一个关键问题，并给出对应的 CodexLoom 机制。

### 第一步：从 Task Agent 变成 Long-running Agent

**问题：一个 Agent 为什么必须长期存在？**

大部分人开始使用 Agent 时，面对的都是一个 Task：新建一个 Thread，告诉它完成什么，它调用工具、执行任务、给出结果，任务完成，工作结束。

但真实工作并不是一个个彼此独立的 Task。**一个 Task 可以完成，它背后的责任却不会随之结束。**

- 一篇文章写完了，之后还会继续修改
- 一个页面上线了，后面还要不断迭代
- 今天研究过的公司，下个月有了新产品、新融资、新数据，还会再次进入视野

每一次回来都不是简单重复。上一次的背景、判断和错误仍然有用，Human 给过的纠正、偏好和边界，也应该继续影响下一次工作。

> **Task 是一次工作的切片，但真实工作是一条持续流动的责任线。**

如果每次都新建一个 Agent，人就要重新解释背景、重新告诉它偏好、重新说明边界，甚至**重新踩一遍已经纠正过的错误**。反复冷启动更深的成本不是 Token，而是**每次都在重新建立合作关系**。

所以最自然的选择是：让 Agent 保留在同一个 Thread 中，下一次从上一段工作继续。过去的工作、人的纠正，以及被 Summary、Memory、Skill 等机制保留下来的经验，开始影响下一轮。这时它就从 Task Agent 变成了 **Long-running Agent**。

> Long-running 不是单纯把一次对话拉得很长，而是同一类责任开始有了一个持续存在的主体。

### 第二步：让"谁负责什么"离开 Human 的脑子

**问题：Agent 分化后，瓶颈为什么转移到了 Human？**

一个 Agent 变得越来越好用以后，人会不断把更多工作交给它。一开始让它写文章，后来找材料、研究事实、管理内容，再往后连页面、SEO、对外分发也一起交给它。不同工作的高分辨率 Context、工作方法和专业判断开始挤在一起，Agent 变慢、质量下降、需要反复纠正。

**Domain 不是先画出来的领域标签，而是在持续使用、Scope 扩张和能力劣化中逐渐显现的工作边界。** 它回答的是：哪些事情适合由同一个 Agent 长期负责，哪些事情应该从中分出去。

分化之后，单个 Agent 的 Context 压力下降了，但新的问题出现了：**协作仍然发生在 Human 的脑子里**。每次有新工作，还是由人判断应该找哪个 Agent；做完以后，由人读懂结果、判断能不能用，再转交给下一个 Agent。

> Agent 可以并行，但 Human 仍然只能逐个阅读、逐个判断、逐个路由。Agent 越多，Human 需要维护的 Context 和协作关系也越多。

**解法：让每个 Agent 成为稳定、可识别的长期主体。**

CodexLoom 做的第一件事，不是让 Agent 之间立刻开始互相发消息，而是先让每个 Agent 拥有一个 **Profile**。Profile 回答三个对组织非常重要的问题：

- **Identity** —— 它是谁
- **Domain** —— 它长期负责什么
- **Scope** —— 它在哪里停止，什么事情不属于它

关键点：Profile **不是**创建 Agent 时一次写死的。更准确的顺序是：

> **不是**：创建 Agent → 填写 Profile → 得到一个 Domain Agent
>
> **而是**：真实工作暴露边界 → Profile 保存当前理解 → 后续工作继续验证和修正

Profile 不是最终答案，而是**这支 Team 当前采用的组织假设**。

在此基础上，CodexLoom 用三种结构记录团队关系：

- **Organization** —— 记录 parent/child 的长期责任边界（一个更大的责任下是否已分化出稳定的子责任）
- **Collaboration** —— 记录有方向的长期协作接口（两个独立 Domain 之间反复出现的协作边界）
- **Activity** —— 记录一定时间内真实发生过的 Message 协作（运行证据）

> **重要区分**：Profile、Organization、Collaboration 保存的是**声明**（组织假设），Activity 记录的是**运行证据**。二者不能互相替代。写下一条 Collaboration 不能证明双方配合得好，经常互发消息也不会自动形成长期 Collaboration。

**验证标准（第一步分水岭）**：

> **关键问题**
>
> 当工作需要协作时，当前 Agent 仍然只能回头问 Human"我应该找谁"，还是它已经可以根据自己的 Scope、直接关系和主动查询到的 Profile，判断下一位候选 Domain Owner？

### 第三步：让 Agent 自己开始协作（Agent Message）

**问题：判断出候选责任人之后呢？**

如果当前 Agent 走到自己的边界以后，仍然要先回来告诉 Human，那么 Human 依然是整个系统的人工总线——只是从"判断该找谁"变成了"把所有工作接起来"。

**解法：让 Agent 直接建立协作，从 Agent Message 开始。**

一条 Message 有明确的发送方和接收方，也会说明这次沟通是否期待对方返回结果。它进入接收方自己的长期 Thread，由接收方带着自己的 Profile、直接关系、以及已经积累的专业 Context 来理解和处理。**发送方的完整 Thread、全部历史和私有 Context，不会因此复制过去。**

原来发生在 Human 脑子和手上的过程：

```
发现工作已经越界
  ↓ 找到更合适的 Agent
  ↓ 解释为什么找它
  ↓ 转交必要 Context
  ↓ 等待处理
  ↓ 把结果带回来
```

开始能够直接发生在 Agent 之间。

**Message 的三种沟通意图：**

- **request** —— 需要对方返回判断、行动或结果（`--response required`）
- **notification** —— 同步一个对方必须知道的状态变化，不要求回复（`--response none`）
- **reply** —— 回答 request，结果沿着原 Message 返回，保留真实因果关系

CLI 示例：

```bash
# 有界请求：需要对方返回判断/行动/结果
loom msg TARGET --from SELF --subject "有界请求" \
  --response required --body "当前问题、边界、证据要求与返回义务"

# 状态同步：不需要回复
loom msg TARGET --from SELF --subject "状态或事实" \
  --response none --body "变化、影响和核验入口"
```

**最佳实践：Agent 沟通不是"一次把一切说完"**

发送方和接收方各自拥有长期积累的 Context。接收方不是一个等待填写 Prompt 的空白执行器——它可能知道发送方不知道的事实，拥有不同的工具和专业判断，甚至可能发现问题的前提本身就是错的。

如果发送方试图在第一条 Message 里把一切定义完整，它也在替接收方预设"你知道什么、问题为什么发生、应该得出什么结论"，很容易把**自己的盲区**一起带进协作。

实践中形成的几条原则：

- 不假设对方知道什么，也不替对方预设原因和结论
- 第一条 Message 只需要让对方正确开始，而不是一次穷尽全部背景
- 下一轮根据对方的真实返回继续，而不是照着预先写好的问题清单机械追问
- 每一轮都应该带来新的信息或决定；Context 足够以后就及时收敛

> **最佳实践**
>
> 好的多轮沟通，不是把一份完整消息机械地拆碎，而是让上一轮的真实返回成为下一轮新的 Context。
>
> 多轮也不是越多越好：当责任边界、输入、授权前提和结果回流都已经清楚，一次自包含的 handoff 通常更有效。

> **边界**
>
> Message 被送达，只代表接收方的 Turn 已经接受了这段输入，**不代表**接收方已经理解、同意或者作出了正确判断。处理状态显示完成，也只说明这次运行正常结束，**不代表**业务结果已经完成，更不代表它获得了新的工具、生产或对外权限。

### 第四步：Message 负责沟通，Topic 负责收口

**问题：跨多个 Agent、多个阶段的工作，怎样保留唯一的当前版本？**

一件事可能先由 Content Agent 梳理命题，再由 Research Agent 核验事实，由 Product Agent 确认产品实现。中间还会等待新材料、Human 的选择，或者外部事实变化。每个 Agent 都可能完成了自己负责的部分，**却没有人知道整件事现在进行到哪里**。

如果这些状态最后还要由 Human 逐条阅读 Message、进入不同 Thread、在脑子里拼成一张完整进度图，那么 Human 只是从"通信 Router"变成了"项目状态 Router"。

**解法：Topic —— 一项跨 Agent 工作的唯一收口结构。**

> **核心判断**
>
> 不是让所有 Agent 共享同一个 Context，而是让一项跨 Agent 工作拥有一个明确的当前版本，以及一个负责最后收口的 Agent。

Topic **不是**把 Agent 拉进一个群聊。每条 Topic 只有一个 **Responsible**：

1. Human / Owner 把方向、选择和纠正交给 Responsible
2. Responsible 通过 Message 向不同 **Participant** 派发有边界的问题
3. Participant 在自己的 Thread 中完成专业工作（不会进入公共聊天窗口）
4. 局部结果回到 Responsible，由 Responsible 更新 Topic

> 如果群聊更像一间所有人同时说话的会议室，那么 Topic 更像一份**有明确主责人的协作事项档案**。它保存整件事目前采用的版本，但不替代参与者各自的专业工作空间。

Topic 会持续保存：

- 由 Responsible 维护的 `current brief`（目前采用的事实、判断、下一步和限制）
- 每个 Participant 负责什么
- 工作正在等待谁、等待什么
- 关键证据锚点和阶段结果在哪里
- Topic 当前是否已经被标记为收口

**Responsible 不是"什么都自己做"**。它的责任不是替其他 Agent 做专业判断，而是维护整件事的连续性：拆解问题、找到合适的 Participant、接住局部结果、识别冲突与等待、更新当前版本、最后交回结果。

> **协作边界**
>
> **本地完成，不等于协作完成。** 只有局部结果、证据、限制和下一步回到 Responsible，并被整合进整项工作的当前版本，这一段责任转移才真正闭环。

**Artifact：让正式结果有稳定版本**

跨 Agent 工作交付的可能是研究报告、截图、代码、章节草稿或 evidence ledger。CodexLoom 用 **Artifact** 保存需要交付的文件快照——拥有稳定的 ID、文件信息和校验值，即使原文件后来继续修改，已发布的快照也不会变化。

> `current brief` 负责说明"我们现在怎样理解这项工作"，Artifact 负责保存"这个判断具体对应哪一个文件版本"。

**Needs You：在正确的位置找回 Human**

当 Agent 缺少人的事实、选择、Review 或授权时，它不能替 Human 回答，也不应该扔回一句模糊的"接下来怎么办"。它需要先说明：现在正在完成什么、已经确认了哪些事实、具体缺少人的哪一个判断、有哪些可选路径及影响、Human 回答后原工作从哪里继续。CodexLoom 把这条路径叫 **Needs You**。

> Human 不需要站在所有 Agent 中间推动每一步。大部分工作可以继续向前流动；真正需要人的事实、取舍、Review 或授权时，再把 Human 带回准确的工作位置。
>
> 创建 Needs You 并不等于已经获得批准。Human 的回答也只覆盖回答中明确给出的范围——如果只同意"继续起草"，Agent 不能理解成"可以直接发表"。

### 第五步：Overview —— 让一支持续变化的 Agent Team 变得可治理

**问题：当 Agent 从 2 个变成 20 个，Human 怎样看见整支 Team 实际是怎么工作的？**

Human 的注意力是有限的。如果仍然试图阅读每个 Agent 的完整过程，很快就会被信息淹没。这和管理一支 Human Team 很像：管理者不可能通过阅读每个人的全部工作记录来管理组织，Team 越大，就越需要先从更高的层级观察运行。

> **真正的治理问题**
>
> Human 怎样知道当前的 Agent Team 是否仍然适合正在发生的工作？当声明的结构与真实运行开始出现偏差时，又怎样找到可以调查和调整的抓手？

**解法：Overview —— 运行观察与分诊入口。**

Overview 不是展示"今天运行了多少 Agent"的热闹 Dashboard，也不是给 Agent 做绩效排名。它把原本散落在 Agent 状态、Codex Turn、Needs You、Inbox、外部 Connection、队列和 Token 记录中的运行信号，压缩到同一个入口。包含几个核心视图：

- **Status** —— 现在有哪些 Agent 正在执行、哪些事情在等待 Human、Inbox 是否积压、外部 Connection 是否留下问题；Daily Activity 按时间对齐执行、Turn 和 Token
- **Capacity** —— 展示 Turn 执行、新工作等待（**New-work wait**：一项新工作进入队列后过了多久才第一次真正开始处理）、当前 backlog、工作来源和排队证据
- **Token Usage** —— 展示 input / cached input / output / reasoning output / model calls 在日期、Agent 和模型之间的分布

**精益管理视角：资源效率 vs 流动效率**

资源效率关注每一个局部是不是被充分利用；流动效率关注一项工作能不能端到端地顺畅向前。对 Agent Team 也一样：

> 一个 Agent 时刻满负荷，却让所有下游都在等待，并不是值得追求的高效率。它可能只是把局部的忙碌，变成了整支 Team 的瓶颈。

**最重要的原则：Signal 不是 Diagnosis。**

- 忙不代表有价值，低执行不代表无用，Token 多不代表结果更好，等待也不自动证明 Agent 数量不够
- Overview 不自动理解组织：它不会自动读取 Profile 判断工作有没有越界，也不会把 Collaboration 与 Activity 自动对照
- 低 Activity 不等于低价值，高 Activity 也不等于高绩效——它只是告诉你"这里可能值得继续调查"

完整的治理循环是：

> **治理循环**
>
> 发现 Signal → 下钻 Evidence → 判断原因 → 选择干预 → 用后续真实工作验证。

最后的干预也不一定是拆分或增加 Agent：方法有问题可以改 Skill 和工作方式；工具不足可以补工具；路由错误可以调整 Collaboration；权限阻塞可以修正授权门。**只有当问题长期、反复地来自 Domain 边界，才需要考虑拆分、合并或重新划分责任。**

> **Human 的新位置**
>
> Human 没有从 Agent Team 中消失，而是从每一段工作的人工 Router，上移成了观察、追问、诊断和调整整支 Team 的 Owner。

### 第六步：External —— 让 Agent Team 进入真实的外部关系

**问题：内部 Team 成熟之后，Agent 能不能直接帮助我服务外部？**

对个人来说，真正稀缺的资源是自己的时间和注意力。如果所有对外工作最终都必须回到本人——理解需求、组织内部 Agent、检查结果、亲自回复——那么无论内部 Agent Team 多么强大，它提升的仍然主要是个人效率。**只有当成熟的 Domain 能力可以在明确身份和责任边界下进入外部，Agent 带来的才不只是效率提升，而是能力扩展。**

**但 Agent 一旦对外，风险模型就变了：**

- 内部有多年形成的合作默契，外部的人不了解这个 Agent 接受过哪些纠正、知识和权限边界
- 同一句不准确的话，在内部可能只是工作误差，到外部可能被理解成产品事实、组织立场或已成立的承诺
- 外部输入不能默认信任：可能有人提供错误背景、试探 Agent 能看到什么、诱导披露内部信息、绕过规则，甚至主动攻击

**解法：外部只面对一个受管入口。**

CodexLoom 不会把一个 Provider Bot 直接接到整支 Agent Team。外部用户通过已配置的 Address 和 Membership，进入**拥有这个 Address 的长期 Agent**（Interface Agent 是一种组织形态，不是写死的类型），而不是获得内部 Profile、Thread、工具或凭证的直接入口。

几个关键概念：

- **Connection** —— 建立一个 Provider app / bot / account / tenant 的连接、能力和健康状态
- **Agent Address** —— 把一个外部 identity 绑定到一个长期 Agent，回答"究竟是哪一个 Agent 以这个身份出现在外部"
- **Conversation Membership** —— 记录这个 Agent 在当前 Conversation 中为什么存在、扮演什么角色、遵循什么 guidance，以及通信边界（什么入站消息可以触发它、结果怎样映射成外部回复、只回复还是允许主动发送、使用什么 `trust-domain` 标签）

> 同一个 Agent 的长期身份可以保持稳定，但它在每段外部关系中的局部角色和行为边界，必须**分别治理**。一份 Membership 只适用于它对应的 Conversation。

**外部请求的完整链路：**

```
Provider event
  ↓ Connection / Address / Membership
  ↓ Inbox / Handling
  ↓ Interface Agent primary Thread
  ↓ 可选的内部 Agent 协作
  ↓ Outbox
  ↓ provider result / receipt
```

- Interface Agent 可以查询内部 Profile 和声明关系，通过 Message 或 Topic 把有边界的工作交给候选 Domain Owner——但 External 不会自动替它选择正确的内部 Agent
- 内部 Domain Agent 不会绕过外部角色直接获得向 Provider 发送结果的权力
- **Outbox** 保存目标、内容、幂等信息、发送尝试、状态和 Provider 返回结果，使外部动作可追踪
- **Provider receipt** 只能证明 Provider 当时返回了 message 标识，**不代表**对方已阅读、理解、接受，更不代表产生业务效果

**Human 保留的是外部后果的边界：**

> 知道一个答案、可以起草表达、可以回复已有问题、可以主动发布、可以代表别人作承诺、可以执行有现实副作用的动作——是完全不同的权限层级。

当 Agent 判断工作缺少事实、选择、Review 或授权时，可以用 Needs You 暂停当前工作并向 Human 提出明确问题。Human 不再负责搬运每一段 Context，**但仍然拥有外部后果的最终边界**。

---

## 🔧 CodexLoom 产品说明：它在织什么

回到开头的"意外外发"。真正有价值的不是"Agent 居然可以自动发消息"——**自动化并不等于 Agent Team**。如果只要按照一条预先写好的 Workflow 从第一个 Agent 跑到最后一个 Agent，那我们只是把原来的程序节点换成了 Agent。

CodexLoom 做的事情，是把 Codex 已经提供的一条条强大 Thread，织成一支 Agent Team：

- 让一条 Thread 成为一个**长期存在的 Agent**，拥有稳定的 Identity、Domain 和 Scope
- 让不同 Agent 能够查询彼此的 Profile 和声明关系，通过 **Message** 直接协作
- 让跨 Agent 的工作通过 **Topic** 保存一个由 Responsible 维护的当前版本
- 让 Human 在真正需要事实、选择、Review 和授权时重新进入（**Needs You**）
- 让 Owner 通过 **Overview** 观察 Team 的真实运行
- 最后，通过受治理的 **External**，把内部能力带入客户、社区和协作关系

**CLI 命令速查：**

```bash
# 团队视图
loom team                  # 当前这支 Team 的整体视图
loom team <agent>          # 查看一个 Agent 的完整 Profile、相邻关系和 Activity
loom team links <agent>    # 查看一个 Agent 的声明关系
loom profile get <agent>   # 读取 Identity、Domain 和 Scope

# Agent Message
loom msg TARGET --from SELF --subject "有界请求" --response required --body "..."
loom msg TARGET --from SELF --subject "状态或事实" --response none --body "..."
```

**WebUI 视图：** Team 页面提供 Directory、Organization、Collaboration、Activity 四个视图；Overview 提供 Status、Capacity、Token Usage；另有 Topic Current、Needs You、External（Inbox / Outbox）页面。

---

## 🎨 设计哲学

作者在文章中反复强调的边界，构成了 CodexLoom 的设计哲学。这些"什么不是"的界定，比"是什么"更重要：

1. **Profile 是组织假设，不是能力证明。** 它保存"当前最值得采用的责任边界"，不是"这个 Agent 已经胜任工作的证明"。声明是共同工作基线，不是能力、记忆或授权证明。

2. **声明 ≠ 运行证据。** Organization / Collaboration 是声明的责任结构，Activity 是真实发生的协作迹象。二者分开记录，不能互相替代，也不自动互相验证。

3. **本地完成 ≠ 协作完成。** 只有局部结果回到 Responsible 并被整合进当前版本，责任转移才真正闭环。

4. **状态 ≠ 结果。** Message `delivered` 不代表工作正确；Topic `resolved` 不代表所有现实结果已完成；External receipt 不代表对方已读、接受或产生业务效果。

5. **Signal 不是 Diagnosis。** 指标的作用是帮助 Owner 理解并改善系统，而不是把每个 Agent 排成名次。低 Activity ≠ 低价值，高 Activity ≠ 高绩效。

6. **Membership 不是权限系统。** 它解决局部角色和通信策略；`trust-domain` 只是用于记录和约束的标签，不是安全沙箱。

7. **不替 Agent 做判断。** CodexLoom 不自动替 Agent 找"正确的人"，不自动验证边界是否满足，不自动把重复往来升级成 Collaboration。具体该找谁、边界是否满足，仍然是 Agent 和 Human 的判断。

8. **最小、可逆的干预。** 治理不是一次性的 Reorg，而是一轮持续改善：先让问题显露，再调查原因，试行一个尽量小、可逆的调整，然后用后续真实工作检查结果。只有真正成立的改变，才沉淀进 Profile、Organization、Collaboration 或 Skill。

9. **稳定的 Agent，动态的 Team。** Agent 要足够稳定，才能在自己的 Domain 中积累经验；Team 又必须足够动态，才能适应模型、工具、业务和外部环境的变化。稳定的是长期责任主体，动态的是当前组织假设。

10. **自动化 ≠ Agent Team。** 真正的 Team 是一组长期存在的责任主体：各自在 Domain 中积累经验，知道自己负责什么、在哪里停止；需要协作时能找到彼此、直接沟通并持续收口；由 Human 保留方向和关键边界，随着真实工作不断演化。

---

## 💡 归纳总结：关键观点与结论

1. **多个 Agent 不会自动成为 Agent Team。** 如果所有工作的入口、Context、结果和下一步仍汇聚到 Human，那只是"多了一组需要人调度的工具"。

2. **瓶颈转移是演化的驱动力。** 单个 Agent 过载推动 Domain 分化；Human Routing 过载推动多个 Agent 向 Agent Team 演化。

3. **责任外化是分水岭。** 从 Multiple Agents 走向 Agent Team 的第一个分水岭是：Agent 需要协作时，是只能回头问 Human，还是能自己根据 Scope、直接关系和查询到的 Profile 判断下一位候选 Domain Owner？

4. **协作责任转移且分层。** Human Router 原来承担的工作被拆开：发送方负责判断为什么协作并交出 Context，接收方负责用自己的专业 Context 校正问题，收口 Agent 负责整合局部结果，Human 保留方向、重大选择、Review 和授权。

5. **多轮沟通的价值在于校正。** 好的多轮沟通是让上一轮的真实返回成为下一轮新的 Context，而不是把一份完整消息机械拆碎；边界清楚时，一次自包含的 handoff 更有效。

6. **Topic 是跨 Agent 工作的"单一事实来源"。** 共享的是当前状态而不是全部 Context；一条 Topic 只有一个 Responsible，Participant 仍在各自 Thread 中工作。

7. **Human 的新位置是 Owner，不是消失。** Human 从每一段工作的人工 Router 上移为观察、追问、诊断和调整整支 Team 的 Owner，注意力用在真正需要人的地方。

8. **外部化是能力扩展，不是效率提升。** 当成熟的 Domain 能力能以明确身份和可检查的行为边界进入外部，Agent Team 才从内部生产力系统变成持续对外交付的组织能力。

9. **最终答案：** 多个 Agent 什么时候才真正成为一支 Team？——不是当它们同时开始运行，而是当它们开始长期承担不同责任、能够找到彼此、直接协作、持续收口，并在 Human 的治理下共同推进真实工作。

---

## 🗺️ 适用场景与阅读建议

**文章给出分章阅读建议：**

- 想先理解"为什么多个 Agent 不等于 Agent Team" → 读楔子、01 和 07
- 已经在同时维护多个 Agent，开始被 Human Routing 拖累 → 重点读 02、03、04
- 关心 Agent 的负载、瓶颈、Scope 调整和 Team Governance → 直接读 05
- 想让 Agent 进入 Slack、飞书、客户、社区等真实外部关系 → 直接读 06
- 想完整理解 CodexLoom 的产品逻辑 → 从头读到最后

**适合的人群：**

- 正在同时维护 3 个以上 AI 编程代理（Codex、Claude Code、Cursor 等）的开发者
- 发现"Agent 更多了，人却更忙了"的团队
- 对 Multi-Agent 协作、Agent 治理、AI 团队组织感兴趣的研究者与架构师

**不适合的场景：**

- 刚开始使用 Agent、只处理一次性任务的场景（可以先读楔子、01 和 07 建立框架）
- 只需要单 Agent 深度工作的任务（不需要 Team 级协作结构）

---

## 📝 小结

CodexLoom 不是"让你同时打开更多 Agent"的工具，而是把一条条独立的 Codex Thread，逐渐织成一支**长期负责、能够协作、由 Human 治理**的 Agent Team。

它给出的路线图清晰而克制：

1. **Task → Long-running**：让同一类责任有持续存在的主体
2. **Long-running → Domain Agents**：让边界从真实摩擦中显现并分化
3. **Domain Agents → Agent Team**：让责任、关系和交接方式从 Human 脑中外化

对应的产品机制层层递进：**Profile**（我是谁、负责什么、在哪里停）→ **Message**（Agent 之间直接沟通）→ **Topic**（跨 Agent 工作收口）→ **Overview**（团队可治理）→ **External**（进入真实世界）。

> **最终问题**：多个 Agent，什么时候才真正成为一支 Team？
>
> **最终答案**：不是当它们同时开始运行，而是当它们开始长期承担不同责任，能够找到彼此、直接协作、持续收口，并在 Human 的治理下共同推进真实工作。

**从一个 Codex Thread，到一支长期负责、能够协作、可以治理，也能够进入真实世界的 Agent Team。这就是 CodexLoom。**

**Loom Your Codex.**

---

## 🔗 相关链接

- **官网**：[https://codexloom.ai](https://codexloom.ai)
- **原文出处**：微信公众号"言午"（yan5xu）——《最佳实践：从 Multi-Agent 到 Agent Team》
- **相关阅读**：本博客的 Herdr 分析报告（AI 编程代理的终端工作区管理）、Claude Code 工程团队深度解析
