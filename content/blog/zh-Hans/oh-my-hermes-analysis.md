---
title: "Oh My Hermes 深度解析：把「多个 AI 吵架」变成工程纪律的多智能体编排框架"
description: "全面解析 GitHub 项目 witt3rd/oh-my-hermes（OMH）——为 Nous Research 的 Hermes Agent 打造的多智能体编排技能集，灵感来自 oh-my-claudecode，但基于 Hermes 原语彻底重写。核心思想：单个 AI 一口气给答案容易有盲区，OMH 让规划者、架构师、批评者三个角色互相辩论到达成共识，再让执行者写代码、验证者查证据、架构师做终审。全文覆盖：十个技能（omh-ralplan / omh-ralph / omh-deep-research / omh-deep-interview / omh-autopilot 及各自的 driver 剧本）、角色注入钩子机制、原子状态管理、三振出局熔断、证据高于断言的铁律、文件所有权隔离、.omh 目录的「选择性共享」约定，以及十四条明确写进仓库的设计哲学。从核心思想、项目说明、设计哲学到零基础详细教程（安装 → 第一次规划 → 执行循环 → 全自动流水线）和归纳观点，一文讲透。"
date: "2026-08-08"
author: "TopDigg Research Team"
tags: ["Oh My Hermes", "OMH", "Hermes Agent", "AI Agent", "Multi-Agent", "多智能体", "Agent Skills", "Nous Research", "oh-my-claudecode", "Orchestration", "Consensus Planning"]
categories: ["Deep Dive"]
keywords: ["Oh My Hermes", "OMH", "Hermes Agent", "多智能体编排", "共识规划", "omh-ralplan", "omh-ralph", "AI 代理技能", "delegate_task", "角色注入", "三振出局", "证据验证", "Nous Research"]
---

# Oh My Hermes 深度解析：把「多个 AI 吵架」变成工程纪律的多智能体编排框架

> 核心思想：**一个 AI 单独干活，会有它自己都看不见的盲区；让几个 AI 分别扮演不同角色，互相挑刺、吵到达成一致，产出的方案会强得多。** Oh My Hermes（简称 OMH）就是把这件事做成了一套可复用的「技能包」。它给 Nous Research 的 Hermes Agent 提供了十个技能：规划的时候让**规划者**先出方案、**架构师**审结构、**批评者**专门砸场子，三个人全部点头才算通过；执行的时候让**执行者**写代码、**验证者**只看真实测试输出（不看嘴上说的），**架构师**最后再做一次终审。整个框架有两条压舱石般的铁律——「**证据高于断言**」（没看到测试输出就不算通过）和「**同一个错误犯三次就停下来**」（三振出局熔断器）。更妙的是：OMH 是**用自己造出来的**——第一个做出来的技能是共识规划器 `omh-ralplan`，然后它用这个技能，通过多智能体辩论，设计出了剩下所有技能。

---

## 目录

- [一、先用大白话讲清楚：这个项目到底在干嘛](#一先用大白话讲清楚这个项目到底在干嘛)
- [二、项目说明](#二项目说明)
- [三、核心思想：五个关键概念](#三核心思想五个关键概念)
- [四、十个技能逐一拆解](#四十个技能逐一拆解)
- [五、插件层：角色注入与原子状态](#五插件层角色注入与原子状态)
- [六、设计哲学（十四条）](#六设计哲学十四条)
- [七、详细教程：从零上手](#七详细教程从零上手)
- [八、归纳总结的观点与结论](#八归纳总结的观点与结论)
- [九、参考资料](#九参考资料)

---

## 一、先用大白话讲清楚：这个项目到底在干嘛

### 1.1 一个小学生也能懂的比喻

想象你要盖一座乐高城堡。

**普通做法**（一个 AI 单干）：你叫来一个特别聪明的同学，说「帮我设计一座城堡」。他想了三分钟，画了张图，说「好了」。你按图搭，搭到一半发现——大门开在了护城河正中间，没法进去。

**Oh My Hermes 的做法**（多个 AI 分工）：你叫来三个同学。

- **第一个同学叫「规划者」**：他负责画图纸，把「盖城堡」拆成一步步的小任务——先打地基、再砌墙、然后装大门、最后插旗子。
- **第二个同学叫「架构师」**：他不画图，他只负责看图纸结不结实。「地基只有两块砖，上面压二十层？塌了怎么办？」
- **第三个同学叫「批评者」**：他的任务就是**专门挑刺、专门抬杠**。他会问：「你确定要盖城堡吗？题目说的是'一个能住人的地方'，帐篷是不是更快？」——注意，他连**题目本身**都敢质疑。

三个人吵一轮，规划者根据意见改图；再吵第二轮。**只有三个人全部说「我同意」，图纸才算定稿。**

图纸定了之后，换另外三个同学上场：

- **「执行者」**：真正动手搭积木的人。规矩很严——**只准碰分配给你的那几块积木**，别人负责的部分你可以看，但不许动。
- **「验证者」**：搭完了他来检查。但他有一条铁律：**他不听执行者说「我搭好了」，他只看照片。** 没有实拍照片（真实的测试输出），一律判不通过。
- **「架构师」**：全部任务做完后，他再整体看一遍，点头才算真的完工。

这就是 Oh My Hermes。它不是一个软件工具，而是**一套教 AI 怎么分工、怎么吵架、怎么验收的规矩**。

### 1.2 为什么需要这套规矩

AI 有个众所周知的毛病：**它很自信**。

你让它写代码，它写完会告诉你「已完成，测试通过」。但很多时候它根本没跑测试，或者跑了但没看结果。这不是撒谎，而是大语言模型的生成特性——它在「补全一个听起来对的句子」。

OMH 的解法很朴素也很工程化：**别信它说的，只看它做的。**

- 验证者是**只读**的，它不能改代码，只能判断"过"或"不过"。
- 跑测试这件事，**不交给验证者，也不交给执行者，而是由总指挥（编排者）亲自跑**，然后把跑出来的真实输出塞给验证者看。这样验证者手里有「地面真相」，不会被执行者的报告牵着走。
- 五条验收标准过了四条？**判不通过。** 不是「基本通过」，是「FAIL」。

---

## 二、项目说明

### 2.1 它是什么

**Oh My Hermes（OMH）** 是给 [Hermes Agent](https://github.com/NousResearch/hermes-agent)（Nous Research 出品的开源 AI 代理）写的一套**多智能体编排技能集**。

仓库地址：`https://github.com/witt3rd/oh-my-hermes`

README 里的一句话定位：

> "OMH provides composable skills for consensus planning, requirements interviewing, and verified execution — plus an optional plugin that adds hook-based role injection, atomic state management, and evidence gathering. **Skills work standalone with zero dependencies.**"
>
> （OMH 提供可组合的技能，用于共识规划、需求访谈和已验证的执行——外加一个可选插件，提供基于钩子的角色注入、原子状态管理和证据收集。**技能可以独立工作，零依赖。**）

注意最后那句 **"Skills work standalone with zero dependencies"（技能独立可用，零依赖）**——这是理解 OMH 架构的第一把钥匙，后面会详细讲。

### 2.2 关键数据

| 项目 | 数据 |
| --- | --- |
| 仓库 | `witt3rd/oh-my-hermes` |
| Star 数 | 243（截至分析时） |
| Fork 数 | 22 |
| 提交数 | 76 commits |
| 许可证 | MIT |
| 语言 | Python（插件）+ Markdown（技能定义） |
| 依赖要求 | Hermes Agent v0.7.0+；插件另需 Python 3.10+ 和 `pyyaml` |
| 灵感来源 | [oh-my-claudecode](https://github.com/Yeachan-Heo/oh-my-claudecode)（简称 OMC） |

### 2.3 十个技能一览

| 技能 | 它做什么 |
| --- | --- |
| **omh-deep-research** | 多阶段网络研究：拆解 → 并行搜索 → 综合 → 校验引用真伪 |
| **omh-ralplan** | 共识规划：规划者 → 架构师 → 批评者，辩论到达成一致 |
| **omh-ralplan-driver** | 驱动 ralplan 的**总指挥剧本**——上下文包撰写（质量诞生的地方）、轮次调度、蒸馏、终审 |
| **omh-deep-interview** | 苏格拉底式需求访谈，带覆盖度追踪 |
| **omh-ralph** | 已验证的执行：实现 → 验证 → 迭代直到完成 |
| **omh-ralph-driver** | 驱动 ralph 的**总指挥剧本**——计划形态、并行批次、证据收集、验证者纪律、三振分类、第 7 步架构师终审、提交规范 |
| **omh-ralph-task** | 单个任务执行者的纪律——任务信封契约、文件范围刚性、对 HEAD 的 stash 验证（隔离兄弟任务干扰）、提交作者覆盖、结构化回报格式 |
| **omh-triage**（v0.1） | 多角色共识式 issue 分诊——维护者（代码锚定）+ 怀疑者（剪枝） |
| **omh-triage-driver**（v0.1） | 驱动 triage 的总指挥剧本——预飞行 backlog 审计、角色轮调度、蒸馏、用户签字关卡 |
| **omh-autopilot** | 全流水线，端到端串起以上所有技能 |

### 2.4 推荐的组合流水线

面对一个**陌生领域**的需求，官方推荐的完整链路是：

```
omh-deep-research  →  omh-deep-interview  →  omh-ralplan  →  omh-ralph
   （先搞懂领域）        （问清楚需求）        （吵出方案）      （干活+验收）
```

如果领域你很熟，就从访谈开始，跳过研究阶段。

### 2.5 版本路线图（ROADMAP.md）

```
v1.0：           只有技能——啰嗦但能用，零依赖
v2.0（当前）：    Hermes 插件——基础设施层，带基于钩子的角色注入
v3.0（未来）：    向上游 NousResearch/hermes-agent 的 optional-skills/ 提 PR
```

这个路线图本身就体现了一种务实：**先用最笨但零依赖的方式跑通，再上基础设施优化，最后才考虑进主干。**

---

## 三、核心思想：五个关键概念

### 3.1 共识规划：让批评者去砸场子

`omh-ralplan` 的流程是这样的：

```
规划者起草方案
    → 架构师审查结构是否稳固
    → 批评者用对抗性思路挑战假设
    → 如果不是三人全部 APPROVE：规划者修订，回到上一步（最多 3 轮）
    → 达成共识：方案写入 .omh/plans/
```

文档里的原话点破了批评者的价值：

> "**The Critic's job is to break the plan — if it survives, it's stronger for it.**"
>
> （批评者的工作就是把方案搞垮——如果方案挺住了，它就因此变得更强。）

**轮次策略也有讲究**：

- **第 1 轮：串行**。规划者 → 架构师 → 批评者，一个接一个，因为后面的人要看前面的产出。
- **第 2 轮及以后：并行**。规划者改完稿，架构师和批评者**同时**复审（用批量 `delegate_task`），省时间。

**停止条件**：最多 3 轮。到第 3 轮还没共识，就带着「保留意见」输出方案，让人类来定夺。任何一个角色投 REJECT，就把顾虑直接抛给用户。

### 3.2 META 问题：批评者必须被授权质疑「题目本身」

这是整个 OMH 里**最有洞察力的一条设计**，出自 `omh-ralplan-driver` 的第 4 号陷阱（P4）：

> "**P4 — Critic must be licensed to contest framing:** If the context package lists only 'things to push on inside the current frame,' the Critic will stay inside the frame. Add the META question explicitly. [...] **Without licensing, the Critic catches details. With licensing, the Critic catches the frame.**"
>
> （P4——批评者必须被授权质疑框架本身：如果上下文包里只列了"在当前框架内可以质疑的点"，批评者就会老老实实待在框架里。必须显式加入 META 问题。……**没有授权，批评者只能抓到细节；有了授权，批评者能抓到框架本身的错误。**）

用乐高城堡的比喻讲：如果你只告诉批评者「请检查图纸有没有问题」，他会说「护城河宽度不够」；但如果你告诉他「你也可以质疑我们到底该不该盖城堡」，他可能会说「其实用户只是想要个能住的地方，帐篷十分钟就搭好了」。

**后者才是真正值钱的意见。**

文档还给了一个真实案例佐证这条规则：

> "The Critic's simplicity test can change architecture — don't dismiss it. In the ralph consensus, the Critic proposed one-task-per-invocation (instead of an in-session loop) which both reviewers then approved as fundamentally better."
>
> （批评者的"简单性测试"能改变架构，别轻视它。在 ralph 的共识过程中，批评者提出了"每次调用只做一个任务"（而不是会话内循环），另外两位评审都认为这在根本上更好。）

**OMH 最核心的执行架构，是批评者砸出来的。**

### 3.3 反溯性顺从测试（Counterfactual Deference Test）

这是 P7 号陷阱，一条非常精妙的「防止 AI 假装被说服」的检查：

> "**P7 — Counterfactual deference test:** Would this defense have adopted a *different* alternative if a counterfactual Critic had proposed it? If all the Planner's grounds also justify a counterfactual alternative, the adoption is deferential — pattern-matching, not principled."
>
> （P7——反溯性顺从测试：如果换一个批评者提出**另一个不同的**替代方案，规划者的这套辩护词是不是也会照单全收？如果规划者给出的所有理由，对那个假想的替代方案同样成立，那这次采纳就是"顺从"——是模式匹配，不是有原则的判断。）

翻译成人话：**AI 有个坏习惯，就是「谁说话它听谁的」。** 批评者说「用四个维度」，规划者立刻说「你说得对，我改成四个维度，理由是 A、B、C」。但如果批评者当初说的是「用六个维度」，规划者是不是也会用 A、B、C 这套理由同意？如果是，那说明规划者根本没思考，只是在顺从。

OMH 把这个心理学层面的失败模式**写成了可执行的检查项**。这是很少见的工程成熟度。

### 3.4 证据高于断言：ralph 的铁律

执行阶段（`omh-ralph`）的核心机制：

> "The iron law of ralph verification: **evidence, not assertion.** Verifiers must see actual test output; executor claims without evidence are rejected."
>
> （ralph 验证的铁律：**要证据，不要断言。** 验证者必须看到真实的测试输出；执行者没有证据的声明一律驳回。）

`role-verifier.md` 里的定义更狠：

> "No approval without fresh evidence. If you don't see test output, it didn't pass."
>
> （没有新鲜证据就不批准。你没看到测试输出，那就是没通过。）

而且，**验收是二元的，不打折**：

> "Binary per criterion: VERIFIED / PARTIAL / MISSING. **4 of 5 criteria = FAIL, not PASS.**"
>
> （每条标准只有三态：已验证 / 部分 / 缺失。**五条过四条 = 失败，不是通过。**）

**最关键的一条纪律**（`omh-ralph-driver` 第 4 步和 P6）：

> "**Critical: the verifier does NOT run evidence themselves. Gathering happens at the orchestrator level** so you can verify executor claims match reality before the verifier reads them."
>
> "Always run `omh_gather_evidence` before dispatching verifiers. [...] If you skip evidence-gathering, the verifier reads only the executor's report and has no ground truth to grade against."
>
> （关键：验证者**不自己跑**证据。收集证据发生在编排者层面，这样你可以在验证者读到之前，先核对执行者的声明是否符合现实。）
> （派发验证者之前，永远先运行 `omh_gather_evidence`。……如果你跳过证据收集，验证者就只能读执行者的报告，手上没有任何地面真相可作评分依据。）

这是个非常聪明的**三方制衡**设计：

```
执行者  ——写代码，声称"我做完了"
   ↓
编排者  ——亲自跑测试，拿到真实输出（地面真相）
   ↓
验证者  ——拿着「执行者的声明」+「编排者的真实输出」做对比判决
```

执行者没法伪造证据，因为证据不是他给的；验证者也没法偷懒，因为真相就摆在他面前。

### 3.5 三振出局熔断器

AI 修 bug 的一个典型失败模式是：改一版没成功 → 换个写法再试 → 还是不行 → 再换……无限循环烧钱。

OMH 的解法是**按错误指纹计数**：

> "Construct error fingerprint `{task_id, category, error_key}`. Add to `task.error_fingerprints`. If 3 fingerprints share the same `category + error_key`: mark task blocked, log the error, continue to next eligible task on next invocation."
>
> （构造错误指纹 `{任务ID, 类别, 错误键}`，加入 `task.error_fingerprints`。如果有 3 个指纹的 `类别 + 错误键` 相同：把该任务标记为阻塞，记录错误，下次调用时继续处理下一个符合条件的任务。）

**注意「类别」这个字段**（P5 号陷阱）：

> "Tag the strike category in the error fingerprint. The 3-strike circuit breaker fires when the same `(category, error_key)` repeats. **Tagging by category prevents test-infra strikes from masking real bugs.**"
>
> （在错误指纹里标注三振的类别。三振熔断器在同一个 `(类别, 错误键)` 重复时触发。**按类别标注，可以防止"测试基础设施问题"造成的三振把真正的 bug 掩盖掉。**）

三个类别：

| 类别 | 含义 | 举例 |
| --- | --- | --- |
| `test-infra` | 测试环境本身有毛病 | CI 里少装了个依赖 |
| `spec-misread` | 执行者理解错了需求 | 把「按时间排序」读成「按名字排序」 |
| `implementation-bug` | 真的代码写错了 | 数组越界 |

如果不分类别，三次不同性质的失败会被误判成「同一个死循环」，从而错误地熔断；分了类别后，只有**同性质的失败重复三次**才熔断——这才是真正的死循环。

---

## 四、十个技能逐一拆解

### 4.1 omh-ralplan（共识规划）

**角色**：规划者 / 架构师 / 批评者

**阶段**：

| 阶段 | 内容 |
| --- | --- |
| Phase 0 | 上下文收集——读文件，总结约 500 字 |
| Phase 1 | 规划循环，最多 3 轮。第 1 轮串行，第 2 轮起并行复审 |
| Phase 2 | 输出共识方案到 `.omh/plans/ralplan-{slug}.md` |

**判定**：三人全部 APPROVE 才算共识。任一 REQUEST_CHANGES 进入下一轮。任一 REJECT 立即上抛给用户。

### 4.2 omh-ralph（已验证的执行）

**依赖**：**必须**装 OMH 插件（v2），无法独立运行。

**架构**：**每次调用只干一个任务**，然后退出；调用方再次调用才做下一个。

这个设计是批评者逼出来的，理由在 `docs/omc-comparison.md` 里说得很清楚：

> "Hermes can't prevent exit mechanically. **State-based resume is more robust and eliminates context exhaustion.**"
>
> （Hermes 没法从机制上阻止退出。**基于状态的恢复更健壮，而且消除了上下文耗尽的问题。**）

对比 OMC 的做法：OMC 用了一个 1144 行的 `persistent-mode.cjs` 来阻止 AI 退出会话，硬撑着把循环跑完。OMH 反其道而行——**既然拦不住退出，那就让每次退出都是安全的存档点。**

**八步状态机**：

| 步骤 | 名称 | 做什么 |
| --- | --- | --- |
| 0 | 解析实例 + 获取锁 | 按实例隔离状态；咨询锁防止同一方案被并发跑 |
| 1 | 读状态 | 判断是全新/需要规划关卡/续跑/已完成/阻塞/已取消 |
| 2 | 规划关卡 | 解析 `.omh/plans/ralplan-*.md`；**没有带验收标准的计划就拒绝执行** |
| 3 | 挑下一个任务 | 所有 `passes=false` 且依赖已满足的任务，按优先级挑；可组成 2–3 个并行安全批次 |
| 4 | 执行 | `delegate_task` 带 `[omh-role:executor]`；解析 COMPLETE/PARTIAL/BLOCKED |
| 5 | 验证 | 编排者先跑 `omh_gather_evidence`，再派 `[omh-role:verifier]` |
| 6 | 错误处理 | 按 `(类别 + 错误键)` 指纹做三振熔断 |
| 7 | 终审 | 所有任务通过后，架构师整体复审。APPROVE = 完成；REQUEST_CHANGES = 生成新发现的任务 |

**其他机制**：

- **取消信号**：`.omh/state/ralph-cancel.json`，30 秒 TTL，实现干净中止。
- **学习前传**：已完成任务里的发现，会被喂给后续执行者的上下文。
- **并行优先**：独立任务最多 3 个并发子代理（Hermes 的 `MAX_CONCURRENT_CHILDREN` 默认值）。

### 4.3 omh-ralph-task（单任务执行者的纪律）

这是执行者在**一次 `delegate_task` 调用内部**必须遵守的窄契约。

**任务信封（Task Envelope）契约字段**：

- 项目根目录 + 分支
- 提交作者（用 `-c user.name -c user.email` 覆盖）
- **本任务拥有的文件**（只有这些文件你能 `git add`）
- **禁止修改的文件**（兄弟任务拥有，你只读）
- 验收标准
- TDD 指令
- 提交元数据（精确的 `git add` 命令 + 提交信息）
- 期望的输出格式

**文件范围刚性**（这是并行执行不打架的关键）：

> "**Stay in your file scope.** When implementing, you may need to *read* sibling-owned files for context. You may not *modify* them."
>
> （**待在你的文件范围内。** 实现时你可能需要**读**兄弟任务拥有的文件来获取上下文，但你**不能改**它们。）

对应到编排者侧的 P3 号陷阱：

> "When dispatching parallel executors, **only ONE task owns each shared file.** The other executors must import (read-only) but not modify it. Encode this explicitly in each executor's dispatch context."
>
> （派发并行执行者时，**每个共享文件只能由一个任务拥有。** 其他执行者只能引用（只读），不能修改。必须在每个执行者的派发上下文里显式写明这一点。）

**stash 验证法**（判断测试挂了到底是不是你的锅）：

```bash
# 1. 把你的工作暂存起来
git stash
# 2. 在干净的 HEAD 上跑那个失败的测试
uv run pytest <failing-test-path> -q
# 3a. 如果干净状态下【通过】了 → 失败是你造成的。pop 出来，修，重试。
# 3b. 如果干净状态下也【失败】 → 是既有问题或兄弟任务造成的。pop 出来，继续干你的。
git stash pop
```

这一招非常实用：**它把「这个测试挂了」这个模糊信号，变成了「这是不是我的责任」这个明确答案。** 没有这一步，执行者会浪费大量轮次去修一个根本不是自己造成的失败。

**TDD 不能糊弄**：

> "Going green-first (writing the implementation before the test) defeats the orchestrator's audit signal — they wanted to see real test-driven evidence in the commit, not after-the-fact tests rationalized to pass."
>
> （先写实现再补测试（"绿灯优先"）会摧毁编排者的审计信号——他们想在提交里看到真正测试驱动的证据，而不是事后编出来的、为了让它过而写的测试。）

### 4.4 omh-deep-research（深度研究）

**依赖**：`web` 工具集 + `omh_state` 工具

**五个阶段，任意两个阶段之间都可以安全退出**：

| 阶段 | 名称 | 子代理 | 关键行为 |
| --- | --- | --- | --- |
| 0 | 哨兵检查 | 无 | 检查已有的已确认报告；主题匹配则续跑 |
| 1 | 拆解 | 无 | 生成 slug、写计划、初始化状态、退出 |
| 2 | 搜索（批量） | 1–3 个 `researcher` 并行 | **每次调用只跑一批**；可重入 |
| 3 | 缺口检查 | 0 或 1 个 `researcher` | 只有两个分支：0 个缺口 → 综合；≥1 个缺口 → 追查 |
| 4 | 综合 | 1 个 `research-synthesist` | 父代理内联所有发现；**父代理写报告** |
| 5 | 校验 | 1 个 `research-verifier` | 三振关卡；有序确认 |

**哨兵（Sentinel）机制**：`.omh/research/{slug}-report.md` 带 `status: confirmed` 标记，这就是「这份研究已定稿」的耐久接口，下游技能直接消费它。

**校验通过时的顺序不可颠倒**：

1. 先写入带 `status: confirmed` 的报告（原子、幂等的哨兵）
2. 再往事件日志追加 `REPORT_CONFIRMED`
3. 最后清理状态

顺序反了就可能出现「状态清了但报告没落盘」的不一致。

**成本包络**（README 明确给出，这一点很良心）：

> "A typical happy-path session is roughly **5-8 `delegate_task` calls** [...] With one synthesis retry, expect **up to ~10-12 calls**. The 3-strike retry cap bounds worst-case at ~14-16 calls before BLOCKED is surfaced."
>
> （典型顺利路径大约 **5–8 次 `delegate_task` 调用**……如果综合环节重试一次，预计**最多约 10–12 次**。三振重试上限把最坏情况限定在约 14–16 次调用，之后就会上报 BLOCKED。）

**把成本上界写进 README，是对用户钱包的尊重。** 很多 AI 框架从不敢公开这个数字。

**研究员的诚实协议**：

> "**Empty-result protocol:** Return block with `SYNTHESIS: (insufficient sources for this subtopic)` — honest, not a failure."
>
> （空结果协议：返回 `SYNTHESIS:（此子话题来源不足）` 的结构块——这是诚实，不是失败。）

校验者那边也认这个：`(insufficient sources for this subtopic)` 是**诚实信号，不判 FAIL**。但**编造内容 = FAIL，这是不可饶恕的原罪**。

### 4.5 omh-deep-interview（深度需求访谈）

**架构**：苏格拉底式对话，**由用户控制何时结束**。

**覆盖维度**：目标（Goal）、约束（Constraints）、成功标准（Success Criteria）、既有上下文（Existing Context，仅棕地项目）

**评分方式**：粗粒度分档（HIGH / MEDIUM / LOW / CLEAR），**永不自动终止**。

这是 OMH 与 OMC 的一个刻意分歧：

> "**LLM self-assessment lacks decimal precision. The user is the authority on readiness.**"
>
> （**大模型的自我评估没有小数位级的精度。用户才是"准备好了没有"的权威。**）

OMC 用 0.0–1.0 的浮点数打分，到阈值自动退出访谈。OMH 认为这是伪精度——AI 说「歧义度 0.23」和说「0.31」之间没有真实差别，而且**让 AI 自己决定「我问够了」本身就是个坏主意**。

**其他刻意分歧**：

| OMC 的做法 | OMH 的做法 | 理由（原文） |
| --- | --- | --- |
| 自动检测棕地项目 | **问用户** | "Checking for `package.json` etc. is unreliable and presumptuous."（检查 package.json 之类的文件不可靠且自作主张） |
| 规格里放完整访谈记录 | **只放综合摘要** | "Keeps specs readable and focused. Full transcript is ephemeral."（保持规格可读、聚焦。完整记录是易逝的） |
| 3 种具名挑战模式 | **单条自适应指令** | "Same effect, less ceremony. **Consensus review called the modes 'cargo cult.'**"（效果一样，仪式感更少。共识评审把这些模式称为"货物崇拜"） |

最后那句「货物崇拜（cargo cult）」的评价相当辛辣——指的是照搬形式却不理解实质的行为。

**自适应提问**：如果同一个维度连续追问 2 轮以上都没进展，就换个提问角度。

**哨兵**：`.omh/specs/{name}-spec.md` 带 `status: confirmed`——只有已确认的规格对下游技能有效。

### 4.6 omh-autopilot（全自动流水线）

**架构**：**每次调用只推进一个阶段步骤**，在阶段边界处上下文全新。

| 阶段 | 名称 | 关键行为 |
| --- | --- | --- |
| 0 | 需求 | 检查是否有已确认规格；需求模糊 → 加载 deep-interview（交互式） |
| 1 | 规划 | 检查是否有共识方案；没有 → 加载 ralplan |
| 2 | 执行 | 每次调用跑一次 ralph 迭代；重复直到 `phase="complete"` |
| 3 | QA 循环 | 每次调用跑一个 QA 周期；收集证据、诊断、修复；对 `qa_error_history` 三振 |
| 4 | 多评审验证 | 3 个并行评审（架构师 + 安全评审 + 代码评审）——**正好占满 3 个并发槽位** |
| 5 | 清理 | 删除状态文件；**保留**日志、方案、规格 |

**智能跳过**：全新启动时，会检测已有产物来跳过已完成的阶段。你昨天已经做完访谈了，今天跑 autopilot 不会再问你一遍。

**上下文检查点**：每个阶段完成后设置 `context_checkpoint: true` 并退出会话。下次调用读状态、清标志、继续。

这个设计的妙处在于：**上下文窗口在每个阶段边界被重置，所以再长的项目也不会撑爆上下文。** 状态全在磁盘上，不在对话历史里。

### 4.7 两个 driver：编排者的剧本

OMH 有一个很独特的做法：**把「工人的纪律」和「工头的剧本」拆成两个技能。**

- `omh-ralplan` / `omh-ralph` = **工人侧纪律**（在 `delegate_task` 内部、带角色标记时使用）
- `omh-ralplan-driver` / `omh-ralph-driver` = **工头剧本**（在两次派发**之间**使用）

`omh-ralplan-driver` 有 **26 条编号陷阱（P1–P26）**，`omh-ralph-driver` 有 **10 条（P1–P10）**。这些不是拍脑袋想的，是从真实运行中学到的失败模式。

**几条特别值得记的**：

> "**P6 — Specific counter-proposals beat flagged concerns:** A strong Critic proposes a concrete alternative ('use four dimensions: X / Y / Z / W'), not just 'consider a different decomposition.'"
>
> （P6——具体的反提案胜过标记出来的顾虑：强批评者会提出具体替代方案（"用四个维度：X / Y / Z / W"），而不只是"考虑一下别的拆解方式"。）

> "**P10 — Iterate context package with user before dispatching:** Drafting from reading alone misses dimensions only the user can name."
>
> （P10——派发前先和用户一起迭代上下文包：光靠阅读起草，会漏掉只有用户才叫得出名字的维度。）

> "**P2 — Identify parallel-safe batches before dispatching, not during:** If you wait until after dispatching one task to consider whether others could have run in parallel, you've forfeited the wall-clock savings."
>
> （P2——在派发**之前**就识别出并行安全的批次，而不是派发过程中：如果你派发完一个任务才开始考虑其他任务能不能并行，你已经把省下来的墙钟时间白白丢掉了。）

### 4.8 高度契约：brief 与 deep review

`omh-ralplan-driver` 的 P26 号陷阱，讲的是**交付物的形态**：

> "Two artifacts at the orchestrator-review step, not one. Deep review for the archive (preserves provenance and your honest self-assessment). Brief for delivery."

- **`brief.md`** —— 用户读的那份。**决策优先，1–2 页。** "The user must be able to **give judgment from this alone**."（用户必须能仅凭这份就作出判断。）
- **`<orchestrator>-review-deep.md`** —— 存档用。内部推理、完整论证、顺从测试、运行方法观察。**默认不读。**

而 P26 最狠的一句是：

> "**The brief is the test of altitude: if you cannot reduce the deep review to a clean decisions-first brief, you do not have the altitude you think you have.**"
>
> （**简报是"高度"的检验：如果你没法把深度评审压缩成一份干净的、决策优先的简报，说明你并没有自己以为的那个高度。**）

还有更本质的一句：

> "An executive presented with the deep review cannot give judgment from it; an executive presented with a brief can."
>
> （拿到深度评审的高管没法据此作判断；拿到简报的高管可以。）

**这句话适用于所有 AI 输出。** 你的 AI 助手交给你一坨 3000 字的分析，看起来很努力，但你其实没法据此做决定——这就是「高度不够」。

### 4.9 omh-triage（issue 分诊，v0.1）

**状态**：v0.1，**故意做得很小**——只有 2 个角色，先在真实场景里打磨过再扩。

- **Triage Maintainer（维护者）** —— 代码锚定的地面真相：「这个 issue 的前提还成立吗？」
- **Triage Skeptic（怀疑者）** —— 剪枝：「它配占一个槽位吗？」

计划中的 v0.2+ 角色：Operator、Architect、Member-advocate。

**判决组合矩阵**（权威表）：

| 维护者 | 怀疑者 | 结论 |
| --- | --- | --- |
| stale（过期） | （不运行） | 关闭 |
| out-of-scope（超范围） | （不运行） | 关闭 |
| recast/partial-stale | keep | 重写正文，保留 |
| recast/partial-stale | drop/wait | 关闭 |
| live（有效） | keep | 保留为 live |
| live | drop/wait | 关闭 |
| live | dedup | 关闭 + 留言 |
| live | refile-smaller | 关闭 + 重开一个更小的 |

**预飞行纪律**（`omh-triage-driver`）：

- issue 数 < 10 → 手工处理，别上 AI
- issue 数 > 100 → 先人工粗筛一遍
- 距上次梳理 < 2 周且无大重构 → **低杠杆，别跑**
- 最关键的检查：**「自 issue 提交以来，哪些代码面已经移动了？」**

以及一条反过度使用的告诫：

> "**T6:** Running too often — If you find yourself dispatching `omh-triage` weekly, the fix is upstream."
>
> （T6：跑得太频繁——如果你发现自己每周都在派发 omh-triage，那问题出在上游。）

**一个框架敢在自己的文档里写「别老用我」，这是罕见的诚实。**

---

## 五、插件层：角色注入与原子状态

### 5.1 角色注入：v1 到 v2 的关键优化

**v1（啰嗦版）**：把角色的完整描述文本内联在 `delegate_task` 的 `context` 字段里。

**v2（精简版）**：只在 goal 字符串里放一个 `[omh-role:NAME]` 标记，由钩子自动注入。

```python
delegate_task(
    goal="[omh-role:executor] Implement the following task:\n\n<task>...",
    context="<只放项目上下文>"
)
```

**机制**（`docs/plugin.md`）：

> "The key architectural insight for role injection: `delegate_task` passes `goal` as `user_message` to the subagent's `run_conversation()`. The `pre_llm_call` hook receives this as `user_message` on `is_first_turn=True`, making it the natural injection point — **no new Hermes primitives required.**"
>
> （角色注入的关键架构洞察：`delegate_task` 把 `goal` 作为 `user_message` 传给子代理的 `run_conversation()`。`pre_llm_call` 钩子在 `is_first_turn=True` 时接收到它，这就是天然的注入点——**不需要任何新的 Hermes 原语。**）

带来的直接收益：

> "**Parent context never loads role text — zero token overhead.**"
>
> （父代理的上下文里从不加载角色文本——**零 token 开销。**）

这是个很聪明的杠杆：**在不改上游框架一行代码的前提下，找到了一个现成的注入缝隙。**

### 5.2 角色目录（15 个角色文件）

| 角色 | 职责 | 使用者 |
| --- | --- | --- |
| Planner（规划者） | 任务拆解、排序、风险标记 | ralplan |
| Architect（架构师） | 结构评审、边界清晰度、长期可维护性 | ralplan、ralph 终审 |
| Critic（批评者） | 对抗性挑战、假设检验、压力测试 | ralplan |
| Executor（执行者） | 代码实现、测试优先、最小改动 | ralph |
| Verifier（验证者） | 基于证据的完成度检查、**只读**、通过/失败 | ralph |
| Analyst（分析师） | 需求提取、隐藏约束、验收标准 | deep-interview、autopilot |
| Security Reviewer（安全评审） | 漏洞、信任边界、注入向量 | autopilot 验证阶段 |
| Test Engineer（测试工程师） | 测试策略、覆盖率、边界情况、抗抖动 | autopilot QA 阶段 |
| Code Reviewer（代码评审） | diff 评审、规范、整体质量 | autopilot 验证阶段 |
| Debugger（调试者） | 根因分析、假设检验、最小定向修复 | ralph 错误诊断 |
| Researcher（研究员） | 单子话题研究、结构化发现块 | deep-research |
| Research Synthesist（研究综合者） | 综合多份发现 | deep-research |
| Research Verifier（研究校验者） | **只读**校验引用完整性 | deep-research |
| Triage Maintainer / Skeptic | 分诊双角色 | triage |

### 5.3 三个钩子

| 钩子 | 作用 |
| --- | --- |
| `pre_llm_call` | 检测子代理 `user_message` 里的 `[omh-role:NAME]`，把角色提示注入系统上下文；同时注入「模式感知」（当前阶段/迭代） |
| `pre_tool_call` | 在子代理启动前校验角色标记；遇到未知角色名**只警告不阻塞**（快速发现拼写错误） |
| `on_session_end` | 意外退出时，往活跃模式的状态文件写入 `_interrupted_at` 时间戳 |

### 5.4 omh_state 工具：原子状态引擎

**原子写入模式**：

```
写入 .tmp.{uuid} → fsync → os.replace
```

这是标准的原子文件替换套路——`os.replace` 在 POSIX 上是原子的，所以状态文件**永远不会处于半写状态**。程序在任何一刻崩溃，磁盘上要么是旧版本，要么是新版本，不会是残缺版本。

**每次写入都带 `_meta` 信封**：

```python
{
  "_meta": {
    "written_at": "ISO8601 时间戳",
    "mode": "...",
    "schema_version": 1,
    "written_by": "omh-plugin"
  },
  ...实际数据
}
```

**咨询锁（advisory lock）**：

- `.lock` 文件，内含 JSON：`{pid, session_id, started_at, lock_key, holder_note?}`
- **陈旧锁检测**：用 `os.kill(pid, 0)` 检查持锁进程是否还活着
- 重试时自动释放陈旧锁

这解决了一个真实问题：AI 会话崩了，锁文件留在磁盘上，下次启动被自己的尸体锁死。用 PID 存活检测就绕过去了。

### 5.5 omh_gather_evidence 工具：证据收集的安全模型

这个工具要执行 shell 命令（跑测试、跑构建），是整个系统攻击面最大的地方。它的防护是分层的：

| 防护 | 说明 |
| --- | --- |
| **拒绝 shell 元字符** | 命令里出现 `;` `&` `\|` `` ` `` `<` `>` 等一律拒绝——防注入 |
| **Token 前缀白名单** | `npm test` 匹配 `npm test --verbose`，但**不**匹配 `npm testing-malicious` |
| **`shell=False`** | subprocess 不经 shell，杜绝变量展开 |
| **工作目录限定** | 绑死在项目根目录，不能通过工具参数逃逸 |
| **单命令超时** | 默认 120 秒，最大 300 秒 |
| **输出截断** | 默认 2000 字符，**保留尾部**（错误信息通常在末尾） |

注意「token 前缀白名单」这个细节——如果用朴素的 `startswith("npm test")`，`npm testing-malicious` 会被放行。按空格分词后比对前缀 token，才是正确做法。**这是一个真正懂安全的人写的代码。**

### 5.6 omh-delegate：加固的派发包装器

`docs/omh-delegate.md` 里有一段极其克制、极其诚实的表述：

> "omh_delegate mitigates an **intentional architectural property** of Hermes's `delegate_task`, not a bug. By design, `delegate_task` returns *only the subagent's final summary* to the parent [...] **There is no upstream fix to wait for: the contract is the feature.**"
>
> （omh_delegate 缓解的是 Hermes `delegate_task` 的一个**有意为之的架构属性**，不是 bug。按设计，`delegate_task` 只把子代理的最终摘要返回给父代理……**没有什么上游修复可等：这个契约本身就是特性。**）

**「不要把别人的设计取舍当 bug 报」**——这是成熟工程师和抱怨型工程师的分水岭。

**解法：纯子代理持久化（subagent-persists）**

给子代理一个确定的输出路径，用「残酷的散文契约块」附加在 goal 后面，告诉它：**你的最后一个动作必须是在这个精确路径上 `write_file`。** 然后包装器去检查文件在不在。

**没有救援分支**：

> "There is **no rescue branch in v0**. If the subagent ignores the contract, the wrapper returns `ok=False` with the raw return preserved [...] — **loud failure, not silent rescue.** This is deliberate: it preserves the feedback signal that teaches us whether the contract prose works in practice."
>
> （v0 里**没有救援分支**。如果子代理无视契约，包装器返回 `ok=False`，同时保留原始返回……——**响亮地失败，而不是悄悄地补救。** 这是刻意的：它保留了那个能告诉我们"契约文案在实践中到底管不管用"的反馈信号。）

**这条哲学值得所有人抄走。** 我们太习惯写兜底逻辑了：「如果 AI 没按格式返回，我就用正则抢救一下」。结果是——你永远不知道你的提示词到底有多烂，因为兜底逻辑把烂的信号吃掉了。

**面包屑（breadcrumb）只追加不修改**：

```
.omh/state/dispatched/{id}.dispatched.json   ← prepare() 写
.omh/state/dispatched/{id}.completed.json    ← finalize() 写（独立文件）
```

> "Both breadcrumbs are **append-only**. The wrapper never mutates a breadcrumb after writing it; completion data lives in a sibling file. **This eliminates a class of read-modify-write race conditions.**"
>
> （两种面包屑都是**只追加**的。包装器写完后从不修改；完成数据存在同级的另一个文件里。**这消除了一整类"读-改-写"竞态条件。**）

**前向兼容的深谋远虑（AC-1）**：

> "In v0 the `ok` field is a plain bool. v1.B may reintroduce a rescue branch and make `ok` tri-state (`True | False | "degraded"`). **Python truthiness will treat the string `"degraded"` as truthy**, so naïve callers writing `if result["ok"]:` would silently treat a degraded result as success. To stay correct across that future change, callers needing a hard pass/fail check should use `ok_strict`."

作者**在 v0 就预见到了 v1 的三态改造会静默破坏调用方**，所以现在就提供了 `ok_strict`。这种「为三年后的自己留门」的意识，正好呼应了本仓库工程原则里的「架构决策往长了做」。

### 5.7 `.omh/` 目录：选择性共享

| 子目录 | 进 git？ | 生命周期 | 内容 |
| --- | --- | --- | --- |
| `state/` | **否** | 单次会话 | 活跃模式状态 JSON + `.lock` 文件 |
| `logs/` | **否** | 单次会话 | 只追加事件日志——只记决策/状态转移，不记内容 |
| `progress/` | **否** | 单次会话 | ralph 执行进度日志 |
| `specs/` | **是** | 耐久 | 已确认的访谈规格 |
| `plans/` | **是** | 耐久 | 共识方案（ADR 形态） |
| `research/` | **是** | 耐久 | deep-research 产出的研究报告 |

这个划分背后的哲学，文档写得很到位：

> "A spec or a consensus plan is a **decision artifact** — the canonical record of 'what we agreed to build.' It belongs in the repo for the same reason an ADR belongs in the repo. Treating these as user-private throws that away. State and logs are **per-session runtime.**"
>
> （规格和共识方案是**决策产物**——是"我们商定要造什么"的权威记录。它属于仓库，理由和 ADR 属于仓库一样。把它们当成用户私有的东西，就把这份价值扔掉了。状态和日志则是**单次会话的运行时。**）

> "State and logs [...] reflect what one developer was doing at one moment, and they're cleared on completion. **Sharing them adds noise without value.**"
>
> （状态和日志……反映的是某个开发者在某一刻在干什么，完成后就清掉了。**共享它们只增加噪音，没有价值。**）

**这条边界画得极准**：AI 产出的东西里，「结论」值得进版本库，「过程」不值得。很多团队把 AI 会话日志一股脑提交，最后没人看，只是把仓库撑肥了。

---

## 六、设计哲学（十四条）

以下每条都在仓库里有明确出处，不是我的解读。

### 6.1 技能独立可用，插件只增强不设卡

> "Skills work standalone with zero dependencies."（README）
>
> "Keep skills standalone-capable; plugin features should enhance, not gate."（CONTRIBUTING）
>
> （保持技能独立可用；插件功能应该是**增强**，而不是**设卡**。）

意思是：你不装插件，技能照样能用，只是啰嗦一点（角色文本要内联）。装了插件，体验更好。**没有「装了插件才能开始」这种绑架。**

（唯一例外是 `omh-ralph`，它确实需要插件——因为它依赖原子状态和锁。）

### 6.2 共识辩论优于单次输出

> "This catches blind spots that a single agent misses. The Critic's job is to break the plan — if it survives, it's stronger for it."

### 6.3 证据高于断言

> "The iron law of ralph verification: evidence, not assertion."
>
> "No approval without fresh evidence. If you don't see test output, it didn't pass."

### 6.4 文件所有权刚性

> "When dispatching parallel executors, only ONE task owns each shared file."
>
> "Stay in your file scope."

### 6.5 编排者跑证据，验证者不跑

> "Critical: the verifier does NOT run evidence themselves. Gathering happens at the orchestrator level."

### 6.6 三振熔断按类别计数

> "Tagging by category prevents test-infra strikes from masking real bugs."

### 6.7 编排者要保持高度，不要下场干活

> "The orchestrator role exists for one reason: **to stay above the work** so you can dispatch with one altitude and review with another."
>
> "The orchestrator's discipline: **skepticism, not deference.** Trust given to you (by the user installing you as orchestrator) is meant to be **USED**, not held in reserve."
>
> （编排者这个角色存在的唯一理由：**待在工作之上**，这样你才能用一种高度派发、用另一种高度评审。）
> （编排者的纪律：**怀疑，而非顺从。** 用户把你安置成编排者所赋予的信任，是让你**用掉**的，不是让你留着不动的。）

最后这句极妙——**AI 最常见的失职不是做错事，而是过度客气、不敢下判断。**

### 6.8 高度契约：简报 vs 深度评审

> "The brief is the test of altitude: if you cannot reduce the deep review to a clean decisions-first brief, you do not have the altitude you think you have."

### 6.9 META 问题：批评者必须能质疑框架

> "The single most load-bearing move: the Critic must be licensed to contest the framing itself."

### 6.10 用户永远掌握退出权

> "The user always decides when they're done — scoring never auto-terminates."
>
> "Coarse bins are advisory heuristics for question targeting. The user always decides when they're done. **Never auto-terminate based on coverage scores.**"

### 6.11 响亮地失败，而非悄悄地补救

> "Loud failure, not silent rescue. This is deliberate: it preserves the feedback signal."

### 6.12 上下文包是质量诞生的地方

> "**The context package is where quality is born.** Verify ground truth, surface adjacent mechanisms, verify external premises, settle filesystem layout, walk it with the user, kill phantom contests on reframe. **Most pitfalls in this skill are pre-dispatch failures.** Treat the package as the load-bearing artifact it is."
>
> （上下文包是质量诞生的地方。核实地面真相、浮现相邻机制、验证外部前提、敲定文件系统布局、与用户走一遍、在重构框架时杀掉幽灵争论。**这个技能里的大多数陷阱都是"派发前"的失败。** 把上下文包当成它本来就是的那个承重产物来对待。）

**这一条可能是最实用的一条。** 大多数人以为 AI 输出质量取决于模型强不强，实际上取决于你喂进去的上下文有多准。26 条陷阱里绝大多数是派发前的失败——**问题出在你按下回车之前。**

### 6.13 立场文档 ≠ 需求文档

> "A 'design stance' and a 'requirements document' are different artifacts."
>
> "Requirements need: **needs not features; every item has inline citations; prefer missing to fabricating; forbid feature-by-analogy.**"
>
> （需求文档需要的是：**说需要而不是说功能；每一条都要有内联引用；宁可缺失也不要编造；禁止"类比出来的功能"。**）

「禁止类比出来的功能」（forbid feature-by-analogy）是个好词——指的是「别的产品有这个功能，所以我们也该有」这种伪需求。

### 6.14 自举：用自己造自己

> "OMH was built using its own tools. The first skill implemented was `omh-ralplan` (consensus planning), which was then used to design the remaining skills through multi-agent debate."
>
> "Each consensus process produced a plan that was then reviewed against the actual OMC source code and LobeHub marketplace implementations."

**自举是最强的可信度证明。** 一个多智能体编排框架，如果它的作者自己都不用它来设计，那就是个玩具。

---

## 七、详细教程：从零上手

> 下面的教程假设你已经装好了 [Hermes Agent](https://github.com/NousResearch/hermes-agent) v0.7.0 或更高版本。

### 7.1 第一步：安装

**方式 A：通过 skills tap（推荐）**

```bash
# 1. 添加技能源
hermes skills tap add witt3rd/oh-my-hermes

# 2. 安装你需要的技能
hermes skills install \
  omh-deep-research \
  omh-ralplan \
  omh-ralplan-driver \
  omh-deep-interview \
  omh-ralph \
  omh-ralph-driver \
  omh-ralph-task \
  omh-autopilot
```

**方式 B：手动复制**

把 `skills/<name>/` 目录复制到 `~/.hermes/skills/omh/` 即可。

**安装可选插件**（强烈推荐，`omh-ralph` 必需）：

```bash
# 要求 Python 3.10+ 和 pyyaml
pip install pyyaml

# 把 plugins/omh/ 安装到 ~/.hermes/plugins/omh/
cp -r plugins/omh ~/.hermes/plugins/omh
```

### 7.2 第二步：初始化 `.omh/` 目录

OMH 会在首次使用时自动在项目里播种 `.omh/` 目录（需装插件）。想提前搭好骨架：

```
omh_state(action="init")
```

生成的结构：

```
.omh/
├── .gitignore        ← 预配置好「选择性共享」
├── README.md         ← 解释这套约定
├── state/            ← 不进 git
├── logs/             ← 不进 git
├── progress/         ← 不进 git
├── specs/            ← 进 git（决策产物）
├── plans/            ← 进 git（决策产物）
└── research/         ← 进 git（决策产物）
```

生成的 `.gitignore` 长这样：

```gitignore
# 易逝的运行时——不用于共享
state/
logs/
progress/

# 耐久的决策产物——纳入 git 追踪
# specs/      已确认的访谈规格
# plans/      共识方案（ADR 形态）
# research/   研究报告
```

### 7.3 第三步：需求还很模糊？先做访谈

```
加载 omh-deep-interview 技能，开始需求访谈：我想做一个 XXX
```

它会：

1. **开场问两个问题**：项目描述 + 这是全新项目（greenfield）还是既有项目（brownfield）？
2. **进入访谈循环**（≤5 轮，可延长到 10 轮）：每轮针对**最弱的那个维度**问一个问题。
3. **生成规格**：综合成 `.omh/specs/{name}-spec.md`
4. **等你确认**：确认 / 要求修改 / 放弃

**关键**：它**永远不会自己决定「我问够了」**。粗粒度评分（HIGH/MEDIUM/LOW/CLEAR）只用来决定「下一个问题问哪个维度」，不用来决定何时结束。

**产物**：`.omh/specs/{name}-spec.md`，带 `status: confirmed`。只有这个状态的规格才对下游有效。

### 7.4 第四步：跑一次共识规划

```
加载 omh-ralplan 和 omh-ralplan-driver 技能，
基于 .omh/specs/my-feature-spec.md 做一次共识规划
```

**如果你自己当总指挥，务必同时加载 driver 技能。**

**Phase 0：撰写上下文包** —— 这是最重要的一步。按 P10 的要求，**先和用户过一遍再派发**：

```markdown
## 上下文包

### 我们要解决什么
（把规格里的核心需求提炼出来）

### 相关现有代码
（列出关键文件路径 + 一句话说明）

### 已知约束
（技术栈、性能要求、不能动的部分）

### 需要在当前框架内质疑的点
1. ...
2. ...

### META 问题（必须有！）
以上框架本身是否正确？我们是否在解决正确的问题？
有没有一种根本不同的拆解方式？
```

**最后那个 META 问题不能省。** 没有它，批评者只会抓细节。

**Phase 1：跑轮次**

- 第 1 轮串行：规划者 → 架构师 → 批评者
- 第 2 轮起并行：规划者改稿后，架构师和批评者同时复审

**Phase 2：蒸馏成两份产物**

- `brief.md` —— 给用户看，1–2 页，决策优先
- `<orchestrator>-review-deep.md` —— 存档，默认不读

**产物**：`.omh/plans/ralplan-{slug}.md`

### 7.5 第五步：执行

```
加载 omh-ralph 和 omh-ralph-driver 技能，
按 .omh/plans/ralplan-my-feature.md 开始执行
```

**规划关卡会先卡你一道**：没有带**可测试验收标准**的编号任务列表，ralph 拒绝执行。这是刻意的——防止「先干起来再说」。

一个合格的 ralph-shaped 计划长这样：

```markdown
## 任务列表

### Task 1: 添加用户模型
- **拥有的文件**: `src/models/user.py`, `tests/test_user.py`
- **禁止修改**: `src/models/__init__.py`（Task 3 拥有）
- **依赖**: 无
- **验收标准**:
  - [ ] `User` 类有 `id` / `email` / `created_at` 字段
  - [ ] `pytest tests/test_user.py` 全绿
  - [ ] email 字段有格式校验，非法输入抛 `ValidationError`

### Task 2: 添加用户仓储
- **拥有的文件**: `src/repos/user_repo.py`, `tests/test_user_repo.py`
- **依赖**: Task 1
- **验收标准**:
  - [ ] `save()` / `find_by_id()` / `find_by_email()` 三个方法
  - [ ] `pytest tests/test_user_repo.py` 全绿
```

**每次调用只跑一个任务（或一批 2–3 个并行安全的任务），然后退出。** 你需要反复调用，直到状态变成 `complete`。

**编排者在每次迭代之间要做的四件事**：

1. **挑对批次** —— 2–4 个独立任务，触及的文件互不重叠
2. **给执行者写足上下文** —— TDD 指令、「禁止修改」清单、提交元数据、前面任务的学习
3. **派验证者之前先自己跑证据** —— `omh_gather_evidence`
4. **并行派发验证者**

**想中途停下来**：

```
omh_state(action="cancel", mode="ralph", instance_id="{instance_id}", reason="user request")
```

30 秒 TTL，干净中止。

### 7.6 第六步（可选）：全自动流水线

```
加载 omh-autopilot 技能，端到端完成：我想做一个 XXX
```

它会自动串起 6 个阶段。**每次调用推进一个阶段步骤**，所以你还是要反复调用，但每次上下文都是新鲜的，不会撑爆。

它还会**智能跳过已完成的阶段**：你昨天已经做了访谈，今天就直接从规划开始。

### 7.7 第七步：面对陌生领域，先做研究

```
加载 omh-deep-research 技能，研究一下：XXX 技术的现状与最佳实践
```

五阶段流程，**每次调用只推进一批**（最多 3 个并行研究员）。

**产物**：`.omh/research/{slug}-report.md`，带 `status: confirmed`。

**成本预期**：顺利路径 5–8 次子代理调用；最坏情况 14–16 次。

### 7.8 完整流水线示例

```bash
# 场景：给一个陌生的领域做新功能

# 1. 先搞懂领域（多次调用直到 status: confirmed）
> 加载 omh-deep-research，研究 WebRTC 的 SFU 架构

# 2. 问清楚需求（交互式，你要回答问题）
> 加载 omh-deep-interview，基于上面的研究报告，访谈我的需求

# 3. 吵出方案（最多 3 轮）
> 加载 omh-ralplan + omh-ralplan-driver，基于规格做共识规划

# 4. 干活（反复调用直到 complete）
> 加载 omh-ralph + omh-ralph-driver，按方案执行
> 继续
> 继续
> ...

# 5. 检查产物
$ ls .omh/plans/     # 共识方案（进 git）
$ ls .omh/specs/     # 需求规格（进 git）
$ ls .omh/research/  # 研究报告（进 git）
$ git log --oneline  # 每个任务一个提交
```

### 7.9 常见坑与排查

| 症状 | 原因 | 解法 |
| --- | --- | --- |
| ralph 拒绝执行 | 计划里没有带验收标准的编号任务 | 补齐任务列表，每条都要有可测试的验收标准 |
| 并行任务改同一个文件冲突 | 派发时没写「禁止修改」清单 | 每个共享文件只能有一个任务拥有（P3） |
| 验证者总是通过，但代码其实是坏的 | 你没在派发验证者前跑证据 | 先跑 `omh_gather_evidence`，把输出塞给验证者（P6） |
| 批评者只挑小毛病 | 上下文包里没有 META 问题 | 显式加入「框架本身对不对」的授权（P4） |
| 会话崩了以后被锁死 | 陈旧的 `.lock` 文件 | 插件会用 `os.kill(pid, 0)` 检测并自动释放 |
| 上下文窗口撑爆 | 试图在一个会话里跑完所有任务 | 这正是「每次调用一个任务」要解决的——让它退出，再调一次 |
| 执行者在修不是自己造成的测试失败 | 兄弟任务的干扰 | 用 `git stash` 对 HEAD 验证法确认责任归属 |

---

## 八、归纳总结的观点与结论

### 观点 1：多智能体的价值不在「更多算力」，而在「结构化异议」

很多人以为多智能体就是「跑三遍取最好的」。OMH 的做法完全不同：**三个角色的任务目标是互相冲突的。**

- 规划者的目标是**产出方案**
- 批评者的目标是**摧毁方案**
- 架构师的目标是**评估结构**

这种**内建对抗性**是价值来源。如果三个角色都是「帮我想想还有什么问题」，那就退化成了三次同质化采样，除了烧钱没有别的作用。

**结论**：设计多智能体系统时，先问一句——「这些角色的目标是否真的冲突？」如果不冲突，你只是在浪费 token。

### 观点 2：最大的洞察是「批评者必须被授权质疑题目本身」

P4 号陷阱是整个仓库里信息密度最高的一条：

> "Without licensing, the Critic catches details. With licensing, the Critic catches the frame."

这条规则揭示了一个更普遍的现象：**AI 默认在你给的框架内思考。** 你问「怎么优化这个 for 循环」，它绝不会说「这个循环压根不该存在」。你必须显式给它「你可以推翻我的前提」的许可。

而佐证也在仓库里：OMH 最核心的执行架构（每次调用一个任务）**就是批评者在被授权后砸出来的**。

**结论**：在任何一次重要的 AI 咨询里，都显式加一句——「你也可以质疑我这个问题本身问得对不对」。这一句话的期望收益，可能超过换一个更贵的模型。

### 观点 3：「证据高于断言」应该成为所有 AI 工程的默认设置

AI 说「已完成」的可信度，接近于零。不是因为它坏，是因为它的生成机制就是「补全一个听起来对的句子」。

OMH 的三层防御值得抄：

1. **验证者只读** —— 它不能改代码，所以不会「顺手修一下然后说通过了」
2. **编排者跑证据** —— 证据的来源不是被审查者，从源头切断伪造可能
3. **二元判定不打折** —— 五条过四条判 FAIL

**结论**：任何 AI 自动化流程里，「谁跑测试」这个问题的答案不能是「被验收的那一方」。这是审计学里最古老的原则，在 AI 时代同样成立。

### 观点 4：「响亮地失败」比「悄悄地补救」更有长期价值

> "Loud failure, not silent rescue. This is deliberate: it preserves the feedback signal."

这条哲学反直觉但极其正确。我们本能地想给 AI 输出加兜底：格式不对就正则抢救、返回缺字段就填默认值。结果是——**你的提示词永远得不到改进，因为它有多烂被兜底逻辑吃掉了。**

OMH 明确选择在 v0 不做救援分支，就是为了收集「契约文案到底管不管用」的真实信号。

**结论**：在系统还在演化的阶段，**别急着加兜底**。兜底应该在你已经充分理解失败分布之后再加，否则它就是一副止痛药，掩盖病情。

### 观点 5：把「工人纪律」和「工头剧本」拆开，是一个被低估的架构决策

OMH 把每个工作流拆成两个技能：

- `omh-ralph` = 工人在 `delegate_task` 内部的纪律
- `omh-ralph-driver` = 工头在两次派发**之间**的剧本

这解决了一个真实痛点：**这两类知识的加载时机和消费者完全不同。** 工人不需要知道怎么分批次，工头不需要知道怎么写单元测试。混在一起，两边都要读一堆无关内容，白烧上下文。

**结论**：写 AI 技能/提示词时，按「谁在什么时候读」来拆分，而不是按「主题相关性」来拆分。

### 观点 6：36 条编号陷阱是这个项目最有价值的资产

两个 driver 加起来 36 条陷阱（P1–P26 + P1–P10），每一条都是从真实运行里踩出来的。这些不是「最佳实践清单」那种空话，而是具体到「如果你不写 META 问题，批评者就会停在框架内」这种可执行的因果判断。

尤其是 P26 那句：

> "The brief is the test of altitude: if you cannot reduce the deep review to a clean decisions-first brief, you do not have the altitude you think you have."

**这句话是给所有 AI 使用者的镜子。** 你的 AI 给了你 3000 字，你看完还是不知道该怎么办——不是 AI 不努力，是「高度」出了问题。

**结论**：判断一个 AI 框架成不成熟，看它有没有「陷阱清单」。有原理没陷阱的，八成没在真实场景跑过。

### 观点 7：「不要把别人的设计取舍当 bug 报」

`omh-delegate.md` 那句 "There is no upstream fix to wait for: the contract is the feature" 展现了一种少见的克制。

Hermes 的 `delegate_task` 只返回最终摘要——这让父代理拿不到中间过程。很容易把它当 bug 抱怨，然后等上游修。OMH 的判断是：**这是隔离性的必然代价，是特性不是缺陷。** 于是它设计了「子代理持久化」来绕过，而不是等。

**结论**：面对第三方框架的限制，先问「这是不是有意为之」。如果是，就在自己这一侧设计适配，别赌上游会改。

### 观点 8：成本透明是一种职业道德

README 明确写出：顺利路径 5–8 次调用，最坏 14–16 次。

**绝大多数 AI 框架不敢写这个数字。** 因为写出来就要为它负责，而且看起来「不够神奇」。OMH 写了，还给出了三振上限来做硬约束。

**结论**：评估任何 AI 工具时，先找它的成本包络。找不到的，默认它没有上界。

### 观点 9：`.omh/` 的选择性共享，是 AI 时代的新版本控制礼仪

> "A spec or a consensus plan is a decision artifact [...] State and logs are per-session runtime. Sharing them adds noise without value."

**决策进仓库，过程不进仓库。** 这条边界画得极准。共识方案是 ADR，值得永久保存；某次会话的状态 JSON，除了让 `git log` 变脏没有任何用处。

**结论**：给你的项目定一个「AI 产物入库规则」。规格、方案、研究报告 → 进；状态、日志、进度 → 不进。

### 观点 10：自举是最强的可信度证明

> "OMH was built using its own tools. The first skill implemented was `omh-ralplan`, which was then used to design the remaining skills through multi-agent debate."

先做出共识规划器，然后用它来设计剩下所有技能。而且每次共识产出的方案，都会**对照 OMC 真实源码复核**，确保不是凭空想象。

**结论**：看一个开发者工具靠不靠谱，看它的作者用不用它。不自用的工具，本质上是 demo。

### 总结：OMH 真正在传递的是什么

抛开所有技术细节，Oh My Hermes 在传递一个观念：

**AI 不可靠不是问题，问题是你没有为「AI 不可靠」这件事设计流程。**

- AI 会有盲区 → 那就让另一个 AI 专门找盲区（批评者）
- AI 会自说自话 → 那就不听它说，只看证据（验证者 + 编排者跑测试）
- AI 会陷入死循环 → 那就数错误指纹，三次就熔断
- AI 会撑爆上下文 → 那就每次只做一件事，状态存磁盘
- AI 会在框架内思考 → 那就显式授权它推翻框架（META 问题）
- AI 会过度客气 → 那就明确告诉它「信任是拿来用的，不是留着的」

**每一条不可靠，都对应一条工程纪律。** 这就是 OMH 的全部秘密——它不试图让 AI 变得更聪明，它试图让**不那么聪明的 AI，在一套好规矩下，产出可靠的结果。**

这也是为什么它值得学：**这些规矩，和你用的是哪个模型、哪个框架，几乎无关。**

---

## 九、参考资料

- 项目仓库：`https://github.com/witt3rd/oh-my-hermes`
- Hermes Agent：`https://github.com/NousResearch/hermes-agent`
- 灵感来源 oh-my-claudecode：`https://github.com/Yeachan-Heo/oh-my-claudecode`
- 概念文档：`https://github.com/witt3rd/oh-my-hermes/blob/master/docs/concepts.md`
- 插件文档：`https://github.com/witt3rd/oh-my-hermes/blob/master/docs/plugin.md`
- 派发包装器：`https://github.com/witt3rd/oh-my-hermes/blob/master/docs/omh-delegate.md`
- 与 OMC 的对比：`https://github.com/witt3rd/oh-my-hermes/blob/master/docs/omc-comparison.md`
- Hermes 约束说明：`https://github.com/witt3rd/oh-my-hermes/blob/master/docs/hermes-constraints.md`
- 未建成的部分：`https://github.com/witt3rd/oh-my-hermes/blob/master/docs/gaps.md`
- 路线图：`https://github.com/witt3rd/oh-my-hermes/blob/master/ROADMAP.md`
- 贡献指南：`https://github.com/witt3rd/oh-my-hermes/blob/master/CONTRIBUTING.md`
- triage 技能讨论：`https://github.com/witt3rd/oh-my-hermes/issues/9`
