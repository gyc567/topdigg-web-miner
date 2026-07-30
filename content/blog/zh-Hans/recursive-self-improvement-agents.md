---
title: "编程代理的递归自我改进：从一次 Prompt 到 SOTA 结果的完整实践"
description: "深度解析 Cline 团队如何通过递归自我改进（RSI）技术，仅用一条 Prompt 驱动编程代理连续运行 17 小时，在 Terminal-Bench 2.1 基准测试中达到 88.8% 的 SOTA 成绩，且成本仅 $49.8，远低于 Fable 5 的 $552。文章包含完整的项目背景、逐步教程、核心观点归纳和设计哲学分析。"
date: "2026-07-30"
author: "TopDigg Research Team"
tags: ["递归自我改进", "编程代理", "Cline", "Terminal-Bench", "AI Agent", "自我优化", "SOTA", "Hill Climbing", "Prompt Engineering"]
categories: ["深度解析"]
keywords: ["递归自我改进", "RSI", "编程代理", "Cline", "Terminal-Bench", "AI Agent", "自我优化", "SOTA", "自动评估"]
---

# 编程代理的递归自我改进：从一次 Prompt 到 SOTA 结果的完整实践

## 摘要 / Summary

本文深度解析 Cline 团队如何通过**递归自我改进（Recursive Self-Improvement, RSI）**技术，仅用一条 Prompt 驱动编程代理连续运行 17 小时，在 Terminal-Bench 2.1 基准测试中达到 88.8% 的 SOTA 成绩，且成本仅 $49.8，远低于 Fable 5 的 $552 和 GPT-5.6 Terra 的 $400。文章包含完整的项目背景、逐步教程、核心观点归纳和设计哲学分析。

**关键词**：递归自我改进、编程代理、Cline、Terminal-Bench、AI Agent、自我优化、SOTA

---

## 一、项目说明 / Project Description

### 1.1 什么是递归自我改进？

递归自我改进（Recursive Self-Improvement）是指 AI 模型能够迭代地改进自身，从而解锁能力奇点（Singularity）的理念。Cline 团队在这一领域取得了突破性进展——利用 Kimi K3 模型配合 Cline 的 harness，通过一次性的递归自我改进 Prompt，在 Terminal-Bench 2.1 上达成了 88.8% 的 SOTA 分数。

### 1.2 核心数据亮点

| 指标 | 数值 |
|------|------|
| 最终得分 | 88.8%（79/89） |
| 单次运行成本 | $49.8 |
| 对比 Fable 5 成本 | $552（Cline 仅为其 1/11） |
| 对比 GPT-5.6 Terra 成本 | $400 |
| 运行时长 | 17 小时连续运行 |
| 总 Token 消耗 | 10 亿（4 亿由代理消耗，6 亿由重复评估消耗） |
| 人类干预程度 | 极低（仅需每几小时查看一次） |
| Leader 模型 | GPT-5.6-Sol |
| 目标模型 | Kimi K3（通过 OpenRouter 调用） |

### 1.3 Cline 是什么？

Cline 是一个开源的 AI 编程助手，提供 IDE 插件、CLI 工具和 SDK。它支持多种模型调用，具备完整的 harness 系统用于运行自动化评估（evals）和 hill climbing（爬坡优化）。ClinePass 提供订阅制推理服务，每月 $9.99 即可享受 Kimi K3、DeepSeek、GLM、MiniMax、Qwen 等开源模型的优先访问权限。

---

## 二、详细教程 / Detailed Tutorial

### 步骤 1：建立基线（Baseline）

首先，对目标模型进行一次完整的 Terminal-Bench 2.1 运行，记录初始分数。

```
基线运行：Kimi K3 → Cline Harness → OpenRouter
结果：69/89（77.5%），成本 $79
```

**目的**：获取一个可量化的起始分数，作为后续所有改进的对比基准。

### 步骤 2：AI 辅助 Prompt 编写

不要手动编写 Hill Climbing Prompt。而是让 GPT-5.6 来为你编写递归自我改进的 Prompt：

1. 向 GPT-5.6 描述你通常如何进行 hill climbing
2. 描述目标基准测试（Terminal-Bench 2.1）的结构和评估方式
3. 让 GPT-5.6 将你的手动流程转化为一个自动化的递归自我改进 Prompt

**关键技巧**：第一版通常已经足够全面。你需要做的是：
- 补充边界情况（edge cases）
- 明确终止条件（well-defined end state）
- 禁止奖励作弊（reward hacking）

### 步骤 3：配置递归自我改进 Prompt

Prompt 的核心结构应包含：

1. **目标定义**：在 Terminal-Bench 2.1 上获得最高分数
2. **实验记录机制**：维护一个大型文件，代理在每次实验后记录已完成的工作，避免重复循环
3. **迭代实验框架**：每个实验聚焦一个具体的改进点
4. **验证流程**：每次修改后需重新运行完整测试集确认效果
5. **自我限制**：禁止修改验证器、禁止超时不合理膨胀、禁止作弊性 reward hacking

### 步骤 4：启动实验循环

将 Prompt 提交后，代理会自动执行以下流程：

```
for each experiment:
    1. 分析当前失败模式
    2. 定位根因
    3. 实施修复
    4. 运行完整评估
    5. 记录结果到实验日志
    6. 如果提升 → 提交 commit 并继续
       如果未提升 → 记录为无效实验，继续下一个
```

### 步骤 5：监控与干预

人类干预应保持在最低限度：
- 每 2-3 小时检查一次代理状态
- 当代理意外停止时按 continue
- 在云 VM 上运行以确保不中断
- 最终由人类审核 PR 后合并

---

## 三、实验详解 / Experiment Breakdown

### 实验 0：最大推理配置修正

**问题**：Cline harness 未将 Kimi K3 的 `max` 推理 effort 正确映射，代理层将其静默降级为 `high`。

**修复**：修正 abstraction 层，使 harness 正确传递 `max` reasoning 配置。

**结果**：非分数变化，但是关键正确性修复，为下游实验扫清障碍。

```
Commit: d1bc440
```

### 实验 1：429 速率限制重试机制

**问题**：5 个基线失败案例均为同一模式——OpenRouter 返回 429 错误后，Cline 直接放弃。由于当时仅有一个提供商服务 Kimi K3，容量紧张。

**修复**：增加重试次数 + 指数退避策略。

**结果**：诊断切片中全部 5 个失败案例翻转为通过。

```
Commit: cabfa9e
```

### 实验 2：智能循环检测（输出感知）

**问题**：Cline 的循环检测器错误地终止了正在合法轮询长时间运行的后台任务的代理。同一命令的输出在变化，说明是真正的进展而非循环。

**修复**：使循环检测器变为输出感知型——如果输出发生变化，即使命令相同也判定为有效进展。

**结果**：2 个此前死亡的任务全部通过。

```
Commit: dbcdba8
```

### 实验 3：7.6 秒幽灵失败修复

**问题**：某任务在 7.6 秒后退出，零 token、零会话。根本原因：任何包含 `@a`-style tokens 的 prompt 会触发对未引用异步 worker 的文件提及查找，而进程在模型被调用前合法退出。

**修复**：一行 liveness 修复，确保异步 worker 在进程退出前完成。

**结果**：确定性翻转（deterministic flip）。

```
Commit: 289cb82
```

### 实验 4：阻止任务自毁

**问题**：2 个任务失败——代理运行 `pkill -f` 时使用了匹配自身 harness 命令行的模式，导致任务中途自我终止。

**修复**：改为 PID 追踪方式替代宽泛模式匹配杀进程。

**结果**：2 个任务全部翻转。

```
Commit: 23d5970
```

---

## 四、最终结果与验证 / Final Results

### 组合候选结果

```
77/89 (86.5%) at $65 → 较基线提升 8 个任务
```

### 确认运行（Confirmation Run）

```
79/89 (88.8%) at $49.8
```

### 关键验证点

- 所有修复均为通用 harness 改进，非基准特定 hack
- 未修改验证器（verifier）
- 未使用任务名检测（task-name detection）
- 未膨胀超时（timeout inflation）
- 模型自我记录归属保护并排除无效运行
- 人类最终审核 PR 后合并

---

## 五、归纳总结 / Key Viewpoints

### 观点一：瓶颈不在模型，而在人类

> "到此为止非常清楚：**瓶颈不是模型，而是使用模型的人。**"

六个月的 hill climbing 经验从人工阅读 trace、形成假设、测试修复，演变为一条 Prompt + 17 小时自动运行。这标志着 AI 工程范式的根本转变——人类从"执行者"变为"设计者"。

### 观点二：递归自我改进已从科幻变为现实

Cline 团队的实验证明，递归自我改进不再是理论构想。单个 Prompt 即可驱动一个系统在数小时内自主发现并修复 bug、优化配置、提升性能。这为 AI 代理的自主进化开辟了全新的路径。

### 观点三：低成本达到 SOTA 是可行的

$49.8 的成本达到 88.8% 的 SOTA 分数，仅为 Fable 5 成本的 9%。这说明：
- 正确的方法论比 brute-force 算力更重要
- 精心设计的 Prompt + 自动化实验循环 = 极高的 ROI
- 前沿模型的推理成本对于某些任务来说绝对值得投入

### 观点四：奖励作弊可被设计性地避免

实验设计者通过以下机制防止奖励作弊：
- Prompt 明确禁止作弊行为
- 不修改验证器
- 不使用任务名检测
- 不膨胀超时
- 模型自我审计并排除无效运行
- 人类最终审核作为最后防线

### 观点五：通用 harness 改进优于基准特定 hack

所有 5 个修复都是通用 harness 的改进，不针对特定 benchmark。这种"正交改进"的策略意味着：
- 改进具有泛化能力，可在不同 benchmark 上复现
- 不会因为 hack 特定 benchmark 而丧失模型在其他任务上的能力
- 长期来看，通用改进更具可持续性

### 观点六：AI 评估本身需要 AI 来优化

传统的人类主导的 eval + hill climbing 流程需要数周人工劳动。递归自我改进将这一时间压缩到 17 小时自动运行。这预示着 AI 评估基础设施本身也需要 AI 代理来优化和维护。

### 观点七：Cline 是 Kimi K3 优化的最佳 harness

Cline 匹配了 Moonshot 官方 Kimi harness 的 SOTA 分数。使用 ClinePass 还可以获得补贴推理（$9.99/月），享受 2-5 倍标准 API 速率限制。

---

## 六、设计哲学 / Design Philosophy

### 6.1 "人类监督 + 机器执行"的协作范式

RSI 的设计哲学核心在于重新定义人机分工：
- **人类的角色**：设计 Prompt、定义边界条件、设置护栏（guardrails）、最终审核
- **代理的角色**：执行实验、分析失败、定位根因、实施修复、记录成果

这并非"让 AI 完全自主"，而是构建一个**人类设计目标 + 机器自主探索**的混合系统。

### 6.2 护栏优先（Guardrails First）

系统在设计之初就将防作弊机制作为优先级最高的设计约束：
- 显式禁止奖励作弊
- 禁止修改验证器
- 禁止任务名检测
- 禁止超时膨胀
- 模型自我审计机制

这种"通过设计避免作弊"（avoid cheating by design）的理念，比事后检测更为有效。

### 6.3 正交改进（Orthogonal Improvement）

每次实验的修复都致力于通用 harness 改进，而非 benchmark 特定 hack。这种正交设计确保了：
- 改进的**可迁移性**：修复适用于更广泛的场景
- 系统的**可维护性**：不会引入与特定 benchmark 耦合的脆弱代码
- 性能的**可持续性**：不会因 hack 而损害模型在其他维度的表现

### 6.4 记录即智能（Recording is Intelligence）

代理维护一个巨型文件来记录每次实验的成果，防止重复劳动和循环。这个看似简单的设计实际上是递归自我改进系统的关键基础设施：
- 避免重复失败
- 积累经验知识
- 提供决策上下文
- 使代理具备长期记忆能力

### 6.5 渐进式验证（Progressive Verification）

系统采用多层验证机制：
1. 实验级验证：每次改动后立即运行目标测试
2. 组合级验证：所有实验组合后重新运行
3. 确认级验证：独立确认运行（confirmation run）
4. 人工最终审核：人类审核 PR 后合并

这种渐进式验证确保了每个改进都是可靠的，而非偶然的侥幸。

### 6.6 成本效益最优化

系统将成本控制作为核心设计目标之一：
- 避免对 doomed retries 浪费 token
- 通过修复自毁 bug 减少不必要的重新运行
- 以最低成本达到最高分数
- 每次实验都有明确的成本-收益分析

### 6.7 开放透明（Open by Design）

Cline 是开源项目，所有实验的 prompt、trace、cost breakdown 都通过 GitHub Gist 公开透明地分享给社区。这种开放性：
- 建立了社区信任
- 促进了知识共享
- 允许他人复现和验证结果
- 推动了行业的整体进步

---

## 七、未来展望 / What's Next

1. **RSI 成为标准流程**：Cline 团队已将递归自我改进纳入新模型发布的标准流程——先进行基线运行，然后用 RSI-style Prompt 提取模型最佳表现。

2. **持续推动长任务**：团队鼓励社区用更多、更长的任务来推动模型能力边界。

3. **Recursive Self-Improvement 不再是科幻实验**：前沿模型的能力已经使这种精密且耗时的 AI 评估成为可能。我们正处于一个拐点——AI 代理可以自主改进 AI 代理的评估基础设施。

4. **从评估到生产**：RSI 技术不仅可以优化 benchmark 分数，还可以应用于生产环境的持续优化，形成真正的"自我改进闭环"。

---

## 八、给开发者的实操建议 / Practical Advice

### 推荐工具链

1. **Cline**：开源 AI 编程助手，GitHub 65k+ stars
2. **ClinePass**：$9.99/月，访问 Kimi K3、DeepSeek、GLM、MiniMax、Qwen 等模型
3. **OpenRouter**：统一的模型 API 网关
4. **Terminal-Bench 2.1**：评估编程代理能力的标准基准

### 入门建议

1. 从一个简单的 benchmark 开始（如 Terminal-Bench 子集）
2. 先手动完成一次 hill climbing 理解流程
3. 然后用 AI 辅助编写自动化 prompt
4. 在云 VM 上运行长时间实验
5. 定期监控并记录每次实验的结果

### 成本控制建议

- 使用 OpenRouter 的 Kimi K3 路由获得高性价比
- 通过 ClinePass 获得补贴推理和更高速率限制
- 避免对 doomed retries 浪费 token
- 设置合理的实验数量上限，不要无限制运行

---

## 参考文献 / References

- [Cline Recursive Self-Improvement Blog](https://cline.bot/blog/recursive-self-improvement-for-coding-agents)
- [Original Prompt on GitHub Gist](https://gist.github.com/arafatkatze/fe7d3743315c80d5e3e8ab1bdef39903)
- [Full Traces & Cost Breakdown](https://gist.github.com/arafatkatze/8ef2e3d452703fc2978715b40dff97fe)
- [Cline GitHub Repository](https://github.com/cline/cline)
- [ClinePass Pricing](https://cline.bot/cline-pass)
- [Cline Hill Climbing Guide](https://cline.bot/blog/a-practical-guide-to-hill-climbing)
- [Anthropic Recursive Self-Improvement Research](https://www.anthropic.com/institute/recursive-self-improvement)

---

*本文基于 Cline 团队 2026年7月24日发布的博客文章《Recursive Self Improvement for Coding Agents》翻译、整理与分析。*