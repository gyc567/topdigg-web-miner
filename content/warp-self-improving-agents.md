---
title: "Warp 如何在 Claude 上构建自我改进的 Agent：深度解析"
date: "2026-09-01"
description: "深度解析 Warp 如何利用 Claude Skills 构建自我改进的 AI Agent，包含完整架构设计、实践指南和核心观点归纳"
tags: ["AI Agent", "Claude", "Self-Improving", "Warp", "Skills"]
categories: ["AI", "Developer Tools"]
---

# Warp 如何在 Claude 上构建自我改进的 Agent：深度解析

## 前言

在 AI Agent 开发领域，大多数团队的做法是：部署一个 Agent，观察它工作，然后撒手不管。但有一家公司做了完全不同的选择——他们构建了一套让 Agent 能够研究人类如何纠正自己，并重写自身技能以在下一次做得更好的系统。

这家公司就是 **Warp**——一家 AI 终端公司，成立于 2020 年，CEO 是 Zach Lloyd，已融资 7300 万美元，财富 500 强中有 56% 是其用户。截至 2026 年 8 月，Warp 累计完成了 4000 万次 Agent 对话和超过 1000 万次 Claude Code 会话。

而他们的核心技术听起来难以置信：**让 Agent 改进的工具，只是一个文本文件。**

---

## 一、项目概述

### 1.1 问题背景

传统的 AI Agent 面临一个核心困境：**会话结束，记忆消失**。无论你在本次会话中如何纠正 Agent 的错误，下一次它依然会犯同样的错。这意味着：

- 每个新会话都要重新「教」一遍
- 团队积累的领域知识无法沉淀到 Agent 能力中
- 相同错误被重复犯，效率损耗持续存在

### 1.2 Warp 的解决思路

Warp 没有选择昂贵的微调方案，而是创新性地提出了**基于 Skills 的自改进循环**。其核心洞察是：

> "File-based skills are a way of encoding knowledge for agents without putting that knowledge directly in the prompt."
> 
> "基于文件的 Skills 是一种将知识编码给 Agent 的方式，而无需将这些知识直接放入提示词中。"
> 
> —— Zach Lloyd

**关键点不是模型，而是存储格式。** 改进的东西不是权重，而是一个普通的 markdown 文件，存放在 git 仓库中，由第二个 Agent 编辑，通过正常的代码审查流程合并。

---

## 二、核心技术架构

### 2.1 架构概览：两个 Skills + 一个 Pull Request

Warp 的架构只有三个移动部件：

1. **Inner Skill（内部 Skill）**：执行具体任务的「基础 Skill」，以文件形式存储领域知识和任务指令
2. **Human Feedback（人类反馈）**：被捕获在 PR 评论中，分为肯定性和纠正性反馈
3. **Outer Skill（改进者 Skill）**：定时调度的 Agent，读取反馈并提出 Skill 文件编辑建议

```
Inner Skill → 执行任务 → PR 评论（反馈）
                                  ↓
Outer Skill（Improver）→ 读取反馈 → 提出 Skill 修改 PR
                                  ↓
                            人工审查合并
                                  ↓
                         下一次 Inner Skill 继承变更
```

**就这么简单，没有权重移动。**

### 2.2 三大核心组件详解

#### 组件一：Inner Skill（内部 Skill）

以代码审查 Agent 为例：
- **职责**：分析 diff，理解代码变更，生成审查意见
- **内容**：包含该领域的基本原则、最佳实践、团队偏好
- **特点**：渐进式披露（Progressive Disclosure），保持精简

#### 组件二：Human Feedback（人类反馈）

反馈有两种类型：
- **肯定性反馈**（Affirming）：这个评论有用
- **纠正性反馈**（Corrective）：这个审查为什么是错的

**关键设计原则**：低摩擦是保持信号流动的关键。在已经存在的工作流程（PR 评论）中捕获反馈，而非创造新系统。

#### 组件三：Outer Skill（改进者 Skill）

定时调度的 Agent，功能是：
1. 读取积累的反馈
2. 比较 Agent 建议的内容与人类实际说的内容
3. 打开一个 PR，编辑基础 Skill 文件

---

## 三、与其他方案的对比

### 3.1 三种教 Agent 的方式

| 方案 | 需要什么 | 启动成本 | 谁能审计变更 |
|------|---------|---------|------------|
| **微调 (Fine-tuning)** | 标注数据集、GPU 时间、评估工具 | 高，持续投入 | 没有人——在权重里 |
| **RAG / 向量数据库** | 嵌入管道、向量存储、检索调优 | 中等，持续投入 | 部分可以——可以检查片段 |
| **自编辑 Skill 文件** | 一个 markdown 文件和 git 仓库 | 几乎为零 | 任何能看懂 diff 的人 |

### 3.2 为什么 Skill 文件更胜一筹

当你发现 Agent 变差了：
- **微调**：给你一个谜团，你无从下手
- **Skill 文件**：给你 git log，可以找到问题提交并回滚

**核心认知**：Agent 知识存在于可审查的文本文件中，这使得「AI 变差了」变成一个可调试的事件，而不是一个谜。

---

## 四、设计哲学

### 4.1 原则优于规则

Warp 明确建议：**写原则，而不是规则**。

- **规则**：`flag functions over 50 lines`（标记超过 50 行的函数）
- **原则**：`Functions should be small enough to have a single responsibility. Large functions are harder to test and reason about.`（函数应该小到足以具有单一职责）

原则能延伸到未见过的场景，规则只能覆盖写下的具体情形。

### 4.2 低摩擦反馈捕获

> "Low friction is what keeps signal flowing."
> 
> "低摩擦是保持信号流动的关键。"
> 
> —— Zach Lloyd

### 4.3 人类审查的必要性

所有 Skill 文件的变更都必须经过正常的代码审查流程。**禁止自动合并**。

### 4.4 小起步，逐步扩展

正确的起步：**一个 Agent + 一个 Skill 文件 + 一个反馈渠道**。

---

## 五、实践指南：如何从零开始构建

### 5.1 第一步：将提示词文件化

```markdown
# Code Review Skill

## 基本原则

1. **关注业务逻辑**：先理解这个 PR 在解决什么问题
2. **提出建设性意见**：不只是指出问题，还要给出建议
3. **尊重团队风格**：遵循项目的代码规范

## 具体检查项

- 函数是否过于复杂（建议不超过 50 行）
- 变量命名是否清晰表意
- 是否有适当的错误处理
- 单元测试覆盖率是否足够

## 反馈格式

每次审查后，等待用户反馈，并记录：
- 反馈类型：肯定 / 纠正
- 具体内容
```

### 5.2 完整实现步骤

#### Step 1: 创建基础 Skill 文件
将反复粘贴给 Agent 的提示词放到一个 `.md` 文件中，版本控制、可对比、可共享。

#### Step 2: 建立反馈捕获机制
在 PR 评论模板中添加反馈区域：

```markdown
## Agent Review Feedback

*请帮助我们改进 Agent 的审查质量*

- [ ] 本次审查有帮助
- [ ] 需要纠正：[具体说明哪里不对]
```

#### Step 3: 设置改进者 Agent（定时任务）

```javascript
// improver-skill.js
async function runImproverCycle() {
  const feedback = await summarizeFeedback({
    since: 'last-run-date',
    minItems: 5 // 至少 5 条反馈才运行
  });
  
  if (feedback.length < 5) {
    console.log('反馈数量不足，跳过本次改进');
    return;
  }
  
  const analysis = await analyzeFeedback(feedback);
  const edit = await proposeEdit(analysis);
  
  await createPullRequest({
    title: `chore: improve code-review skill based on ${feedback.length} feedback items`,
    changes: edit
  });
}
```

#### Step 4: 定期审查 Skill 文件更新

- 频率：初期每月一次，积累足够反馈后提高频率
- 必须有人工审查 PR
- 保持 Skill 文件精简（避免变成 4000 行的昂贵提示词）

### 5.3 团队实践建议

1. **从最小反馈单元开始**：先积累再归纳
2. **设置反馈质量门槛**：低于 N 条新反馈时不触发改进循环
3. **定期回顾 Skill 文件**：每季度审视 Skill 文件的增长是否健康
4. **保持增量修改**：每次 PR 只做一个小改动，便于审查和回滚

---

## 六、Warp 的规模验证

### 6.1 数据亮点

- **每月 80 万开发者**使用 Warp
- **4000 万次** Agent 对话
- **1000 万次** Claude Code 会话
- **56%** 财富 500 强企业用户

### 6.2 小团队的调整策略

| 场景 | 建议 |
|------|------|
| 4 人团队 | 每月运行一次改进循环，而非每日 |
| 反馈量不足 | 设置最小反馈数门槛（如 5 条），不达标则跳过 |
| 担心 Agent 幻觉 | 永远不要自动合并，所有变更必须人工审查 |
| Skill 文件膨胀 | 定期重构，保持精简；大文件是昂贵的提示词 |

---

## 七、核心观点归纳

### 观点一：知识应该存在于可审查的地方

把 Agent 的领域知识放在 Skill 文件中，而不是直接塞进提示词。知识可以被审计、版本控制、审查和回滚。

### 观点二：改进的瓶颈从计算转向组织

真正的转变不是 Agent 能改进自己，而是**改进变得足够小、足够透明，可以放进一个 Pull Request 中**。瓶颈从计算能力转移到——你的团队是否愿意写下「为什么某个建议是错的」。

### 观点三：摩擦杀死信号

如果留下反馈需要额外步骤，反馈就不会来。选择在工作已经发生的地方（PR 评论）捕获反馈。

### 观点四：从原则出发，而非规则

原则能延伸到未见过的场景，规则只能覆盖写下的具体情形。写「为什么」而不是「做什么」。

### 观点五：小起步，渐进扩展

一个 Agent + 一个 Skill 文件 + 一个反馈渠道，是正确的起点。不要一开始就构建复杂的 Agent 网络。

---

## 八、给不同读者的建议

### 8.1 给个人开发者

本周可以做的：把你给 AI 助手的提示词放到一个 markdown 文件中。添加一个反馈区域，记录哪些建议有用、哪些不对。每月让 AI 根据反馈提议一次改进。

### 8.2 给创业团队

通用的 AI 模型不知道你的客户要求使用特定的字符串处理方式，或者你的团队认为超过 30 行的函数应该被拆分。Self-Improving Agent 是「不遗忘」的方式。

### 8.3 给企业技术负责人

这个方案展示了从静态模型到动态反馈驱动系统的转变。关键是：从基于文件的 Skills 开始，捕获详细反馈，并在每一步确保人类监督。

---

## 结语

Warp 的方案揭示了一个深刻洞察：**自我改进的 AI Agent 不需要训练集群**。它只需要一个文本文件、一个 git 仓库，以及一个愿意写下「为什么某个建议是错的」的团队。

真正的问题不是「我们能不能构建自我改进的 Agent」，而是「我们是否愿意系统性地记录我们纠正了什么」。

如果你想从今天开始：

1. 把你的提示词放进一个文件
2. 在你团队已经使用的工具中建立反馈渠道
3. 每月让一个 Agent 读取纠正并提议编辑这个文件
4. 像审查其他 PR 一样审查它

Skill 文件里的知识是版本化的、可对比的、可共享的。这不是 AI 魔法，这是工程。

---

**参考资料**：
- Warp 官方博客：How Warp builds self-improving agents on Claude
- Anthropic 平台文档：Agent Skills Overview
- Warp 官方网络研讨会
