---
title: "Warp如何在Claude上构建自我改进Agent"
date: "2026-09-08"
description: "深度解析Warp如何利用Claude Skills构建自我改进的AI Agent，包含完整架构设计、实战教程和核心观点归纳"
tags: ["AI Agent", "Claude", "Self-Improving", "Warp", "Skills"]
categories: ["AI", "Developer Tools"]
author: "比特财商"
---

> **封面图说明**：本文使用默认封面图，建议后续配一张 Warp Terminal + Claude Code 集成界面的截图作为封面。

## 前言

在 AI Agent 开发领域，大多数团队的共同选择是：部署一个 Agent，观察它工作，然后撒手不管。出错了就重新来，反正下一次会话 Agent 什么也不记得。

但有一家公司做了完全不同的选择——他们构建了一套让 Agent 能够**研究人类如何纠正自己，并主动重写自身技能以在下一次做得更好**的系统。

这家公司就是 **Warp**。

**关键数据：**
- 每月约 80 万开发者使用 Warp
- 56% 的 Fortune 500 在使用 Warp
- 每周超过 40 万次 Claude Code session 在 Warp 中运行
- 创始人：Zach Lloyd

他们的核心技术听起来难以置信：**让 Agent 改进的工具，只是一个文本文件。**

---

## 一、问题：为什么大多数 Agent 从不进步

大多数 Agent 团队面临一个令人沮丧的现实：无论你在本次会话中如何纠正 Agent 的错误，下一次它依然会犯同样的错。

会话结束，反馈消失。Agent 每次运行都从空白开始，同样的错误反复出现。团队积累的领域知识无法沉淀到 Agent 能力中。

Warp 也不例外。他们在 2024 年初部署 Claude Code 时遇到了同样的问题。

他们的解法出人意料地简洁——**不靠微调，不靠 RAG，靠一个普通文本文件。**

---

## 二、核心机制：四个部件，一个 PR

Warp 的自我改进循环只有四个移动部件：

| 组件 | 作用 | 存在形式 |
|------|------|---------|
| **Inner Skill** | Agent 执行任务时读取的领域知识和指令 | 普通 .md 文件，git 版本控制 |
| **Human Feedback** | 人类在 PR/Issue 上评论，指出 Agent 哪里做错了 | PR 评论、Issue 回复 |
| **Outer Improver Skill** | 定时运行的观察者 Agent，读取反馈并提议修改 | 定时调度任务 |
| **Merge** | 人工审查 PR，批准后合并到 Skill 文件 | 标准代码审查流程 |

**完整循环如下：**

```
Agent 读取 Inner Skill 文件 → 执行任务
       ↓
用户在 PR/Issue 上评论（反馈）
       ↓
Outer Improver Agent（定时）拉取所有反馈
       ↓
对比人类响应 vs Agent 建议
       ↓
打开一个 PR，提议对 Skill 文件做一个小修改
       ↓
人工审查 PR → 批准并合并
       ↓
下一次 Agent 运行，继承这个改变
```

**就这么简单。没有权重移动，没有微调，没有向量数据库。**

---

## 三、Skills vs Memory：被混淆的关键概念

Warp 创始人 Zach Lloyd 在博客中特别强调了 Skill 和 Memory 的本质区别，这个区别大多数供应商都在刻意混淆：

**Skills（技能）** 是程序性的、稳定的、刻意改变的。
- 刻意设计的领域知识
- 放在版本控制的文件中
- 人类可以读取、审查、批准
- 每次改一小点

**Memory（记忆）** 是 Agent 在推理时自动写入的，不断移动的。
- 会话期间的临时状态
- 存在 Agent 的上下文窗口中
- 人类难以审计
- 无法精确控制

**很多供应商把 Memory 包装成 Skills 的语言来卖**，本质上是把临时上下文当成了持久知识。Warp 的立场是：自我改进的基础设施必须建立在 Skills 之上，而不是 Memory。

---

## 四、设计哲学：五条原则

### 原则一：低摩擦反馈捕获

> "Low friction is what keeps signal flowing."
> "低摩擦是保持信号流动的关键。"

反馈应该在工作已经发生的地方捕获——而不是创造一个新的系统让人类去使用。如果留下反馈需要额外步骤，反馈就不会来。Warp 选择在人类已经使用的 PR 评论中捕获反馈。

### 原则二：Skills 是版本化的、可审查的、可回滚的

当你发现 Agent 变差了，Skill 文件给你的是 git log，可以找到问题提交并回滚。Agent 知识存在于可审查的文本文件中，这让"AI 变差了"变成一个可调试的事件，而不是一个谜。

### 原则三：每次只做一个小的修改

Outer Improver Skill 每次只提议对 Skill 文件做一个很小的改动。改动越大，越难审查，越难回滚。小的改动易于理解、易于合并、易于在出问题的时候撤销。

### 原则四：反馈质量 > 反馈数量

来自一位资深领域专家的少量详细纠正，胜过一大堆点赞。二元评分从不说明为什么错。Warp 的系统刻意让人类用文字描述"为什么这个建议是错的"，而不是简单点一个赞。

### 原则五：人类始终控制批准权

所有 Skill 文件的变更都必须经过正常的代码审查流程。禁止自动合并。Outer Improver Agent 只负责提议，改动必须经过人工审查才能生效。

---

## 五、Skill 文件格式

Warp 的 Skill 文件是一个普通的 Markdown 文件，带有 YAML frontmatter。以下是一个示例：

```yaml
---
name: add-feature-flag
description: Add a new feature flag to the codebase
---

# Add Feature Flag

## Instructions
1. Ask the user for the feature flag name
2. Verify the name follows kebab-case convention
3. Add entry to config/feature_flags.yaml
4. Run the flag registration script
5. Confirm the flag is active
```

Skill 文件存放在 git 仓库中，由 git 管理版本 history_diff_line_prefix。

---

## 六、实战教程：用 Warp 模式构建自我改进的 Issue Triage Agent

下面展示如何在 Warp 中构建一个自我改进的 Issue Triage Agent，包含 Inner Loop 和 Outer Loop 的完整实现。

### 6.1 Inner Loop：Issue 分类 Agent

**Step 1：创建 Inner Skill 文件**

```yaml
---
name: issue-triage
description: Triage incoming GitHub Issues and assign appropriate labels
---

# Issue Triage Skill

## Instructions

You are an issue triage specialist. For each new issue:

1. Read the issue title and body carefully
2. Determine the issue type:
   - bug: unexpected behavior or error
   - feature-request: new functionality desired
   - question: user asking for help
   - documentation: missing or incorrect docs
3. Assess priority:
   - p0: security issues, data loss
   - p1: broken core functionality
   - p2: non-critical bugs
   - p3: nice-to-have
4. Add appropriate labels
5. If urgent (p0/p1), assign to on-call engineer

## Output Format

After triage, comment:
```
## Triage Result
Type: [bug/feature-request/question/documentation]
Priority: [p0/p1/p2/p3]
Labels: [list of labels]
Reasoning: [brief explanation]
```

## Feedback

If a human modifies your triage decision, please note the feedback
below for future reference. This helps the Outer Improver Skill
identify patterns in misclassification.
```

**Step 2：部署 Agent**

通过 GitHub Action 在每个新 Issue 创建时触发：

```yaml
name: Issue Triage
on:
  issues:
    types: [opened]

jobs:
  triage:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Run Triage Agent
        env:
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
        run: |
          # 调用 Claude Code 或 Warp Cloud Agent
          warp agent run issue-triage \
            --issue-number ${{ github.event.issue.number }} \
            --issue-body "${{ github.event.issue.body }}"
```

### 6.2 Outer Loop：观察者 Agent

**Step 3：创建 Outer Improver Skill**

```yaml
---
name: improver-issue-triage
description: Observes human label corrections and proposes skill improvements
---

# Issue Triage Improver

## Purpose

This skill runs periodically (daily) to:
1. Find issues where humans changed the Agent's triage labels
2. Extract the correction feedback
3. Analyze patterns in misclassifications
4. Propose a small edit to the issue-triage skill file

## Instructions

1. Query all issues closed in the last 7 days where labels were modified
2. For each modification, extract:
   - Original Agent label vs Human's final label
   - The human's comment explaining the correction (if any)
   - The issue body text
3. Identify patterns:
   - Are certain issue types consistently misclassified?
   - Is the priority assessment wrong in specific scenarios?
4. If a clear pattern emerges (e.g., "Agent always misses bug labels for async code"):
   - Write a targeted addition to the issue-triage skill
   - Keep the edit small (one principle or one rule)
   - Open a PR with the proposed change
5. If no clear pattern (noise), do nothing this cycle

## Constraints

- Only propose changes backed by at least 3 examples
- Never delete existing skill content, only add
- Each PR should contain exactly one principle addition
```

**Step 4：定时调度**

```yaml
# .github/workflows/improver.yaml
name: Skill Improver
on:
  schedule:
    - cron: '0 8 * * *'  # 每天早上 8 点 UTC 运行

jobs:
  improve:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          token: ${{ secrets.GH_PAT }}
      - name: Run Improver
        env:
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
        run: |
          warp agent run improver-issue-triage \
            --dry-run false \
            --skill-file skills/issue-triage.md
```

### 6.3 完整的反馈流

```
Day 1: Agent triages Issue #42 as "feature-request, p3"
Day 2: Human changes label to "bug, p1" and comments: "This is a regression in existing behavior"
Day 3: Improver Agent runs, finds this correction
Day 4: Improver Agent opens PR: "Add regression detection to triage skill"
Day 5: Maintainer reviews PR, approves, merges
Day 6: Agent re-triages Issue #56, now correctly identifies it as a regression
```

---

## 七、评估任何"会学习的 Agent"供应商：五个关键问题

当你在评估一个声称能"让 Agent 从反馈中学习"的供应商时，Warp 的框架可以帮助你问出关键问题：

**问题一：学到的知识存在哪里？我能读取吗？**

如果答案是一个黑箱（"在我们的服务器上"、"在模型的权重里"），这是一个红旗。你无法审计 Agent 知道什么。Warp 的答案是：Skill 文件，git 仓库，任何人能读。

**问题二：谁批准变更生效？**

如果是"系统自动批准"，这是严重的红旗。人类审查不可跳过。Warp 的答案是：每次 Skill 文件变更都必须经过人工 PR 审查。

**问题三：反馈如何捕获？如果需要额外操作，循环会饿死**

如果反馈需要人类主动打开一个专门的界面或填写一个表单，摩擦太高，反馈会枯竭。Warp 的答案是：在人类已经工作的地方（PR 评论）捕获反馈。

**问题四：反馈错了怎么办？**

如果 Agent 学了一个错误的反馈，谁来纠正？需要什么操作？Warp 的答案是：Skill 文件在 git 中，可以回滚到任何一个历史版本。

**问题五：如何回滚坏变更？**

如果新学到的内容让 Agent 表现变差了，你能否快速恢复到之前的状态？Warp 的答案是：`git revert`，就像处理任何代码变更一样。

---

## 八、Warp 的 Claude Code 集成：六个钩子

Warp 的 Claude Code 插件提供了六个钩子，允许 Warp 与 Claude Code 会话进行深度集成：

| 钩子名称 | 触发时机 | 用途 |
|---------|---------|------|
| `SessionStart` | Claude Code session 启动时 | 初始化上下文 |
| `Stop` | 用户停止 session 时 | 捕获最终状态 |
| `Notification(idle_prompt)` | session 空闲时 | 恢复或继续 |
| `PermissionRequest` | Agent 请求权限时 | Warp 拦截处理 |
| `UserPromptSubmit` | 用户提交 prompt 时 | 记录用户意图 |
| `PostToolUse` | Agent 使用工具后 | 跟踪工具调用 |

通过 OSC 777 escape sequences 与 Warp 通信，插件版本需要与 Warp 客户端中的 `MINIMUM_PLUGIN_VERSION` 匹配。

---

## 九、给不同读者的建议

**给个人开发者：**

本周可以做的：把你给 AI 助手的提示词放到一个 markdown 文件中。添加一个反馈区域，记录哪些建议有用、哪些不对。每月让 AI 根据反馈提议一次改进。

**给创业团队：**

通用的 AI 模型不知道你的客户要求使用特定的字符串处理方式，或者你的团队认为超过 30 行的函数应该被拆分。Self-Improving Agent 是"不遗忘"的方式——团队纠正过的错误，不会再犯第二遍。

**给企业技术负责人：**

这个方案展示了从静态模型到动态反馈驱动系统的转变。关键路径是：从基于文件的 Skills 开始，捕获详细反馈，在每一步确保人类监督。

---

## 结语

Warp 的方案揭示了一个深刻的洞察：**自我改进的 AI Agent 不需要训练集群**。

它只需要一个文本文件、一个 git 仓库，以及一个愿意写下"为什么某个建议是错的"的团队。

真正的问题不是"我们能不能构建自我改进的 Agent"，而是"我们是否愿意系统性地记录我们纠正了什么"。

如果你想从今天开始：

1. 把你的提示词放进一个文件
2. 在你团队已经使用的工具中建立反馈渠道
3. 每月让一个 Agent 读取纠正并提议编辑这个文件
4. 像审查其他 PR 一样审查它

Skill 文件里的知识是版本化的、可对比的、可共享的。这不是 AI 魔法，这是工程。

---

**关于比特财商**

比特财商是一家专注于 AI 和加密货币领域的内容平台，致力于为中文读者提供深度、有观点的技术分析和行业观察。我们相信好的技术内容应该既有深度，又能让读者真正理解并运用到实际工作中。

如果你觉得这篇文章有帮助，欢迎转发给需要的朋友。

**往期推荐：**
- 如何用大型语言模型构建可靠的 AI Agent
- 从零构建你的第一个 RAG 系统
- AI Agent 的记忆机制：设计篇

（点击上方蓝字或关注公众号，回复"技术"，获取更多深度内容）
