---
slug: langchain-graph-engineering-analysis
title: "LangGraph 深度解析：三年图工程实践总结——用图构建可靠 Agent 的完整指南（核心思想 + 项目说明 + 详细教程 + 设计哲学）"
description: "以 LangChain 官方博客《3 Years of Graph Engineering with LangGraph》（Harrison Chase 与 Sydney Runkle，2026-07-22）为蓝本，完整解析'图工程（graph engineering）'范式与 LangGraph 框架。核心思想：把 agentic 系统表示为图，让你（构建者）把对系统应该如何运作的预判（preconceptions）强加进更受限的路径，而不是仅仅依赖 LLM 的判断——在你想让 agent 走特定路径时更紧密地控制行为。项目说明：LangGraph 是 LangChain 团队三年前构建的 agent 编排框架，如今月下载量 65M+，被创业公司与大企业共同使用，其流行源于在'确定性路径'与'agentic 步骤'之间取得的平衡。详细教程：图建模三要素（节点做事/边定义下一步/状态机视角）、何时用图（支持 agent 分类再响应、编码 agent 检查仓库再提议、合规流程审批再行动）与何时不用（深度研究类天然 agentic 任务用 agent harness/Deep Agents）、map-reduce 与 Send API 动态转换、'节点里装一个完整 agent'的新模式与 docs agent 案例（Slack 请求 → PR，节点分布在确定性到 agentic 光谱的不同位置）。设计哲学：图即认知架构——像 prompt 携带领域知识一样，图编码你关于系统应如何工作的世界知识；模型只在它增值的地方推理，其余交给代码，于是 agent 更便宜、更快、更可预测。三年实践经验：agent 图通常不是 DAG（需要循环：重试、请求缺失信息、验证后修订、暂停等待人工输入）；循环是简单的图（loop engineering 是 graph engineering 的简化版，LangChain 本身构建在 LangGraph 之上）；动态转换很重要（运行时才知道要派生出多少工作，用 Send 动态路由）。"
date: "2026-08-12"
author: "TopDigg"
tags: ["LangGraph", "Graph Engineering", "AI Agent", "Agent Architecture", "LangChain", "Loop Engineering", "Multi-Agent", "Orchestration", "State Machine", "Cognitive Architecture", "Harness", "Agentic Systems"]
categories: ["Deep Dive"]
keywords: ["LangGraph", "图工程", "Graph Engineering", "AI Agent", "Agent 架构", "LangChain", "循环工程", "Loop Engineering", "多智能体", "Multi-Agent", "编排", "状态机", "State Machine", "认知架构", "Cognitive Architecture", "Send API", "Map-Reduce", "Harrison Chase", "确定性", "Agentic"]
---

# LangGraph 深度解析：三年图工程实践总结——用图构建可靠 Agent 的完整指南

> 核心思想：**把 agentic 系统表示为图（graph），让你作为构建者把对系统应如何运作的预判强加进更受限的路径，而不是仅仅依赖 LLM 的判断。** 图工程（graph engineering）是继 prompt engineering、context engineering、harness engineering、loop engineering 之后，来自 X 的 AI 内容工厂的最新术语。术语虽多，但背后的原因很实在：**让 LLM 干活很难**——它们是一种新型的、非鲁棒的、非确定性的软件，我们不断尝试新策略让它们工作，于是新策略催生新术语。LangGraph 正是基于这一直觉在三年前构建的框架，如今**月下载量 65M+**，被创业公司与大企业共同使用。它流行的原因是找到了一个平衡：**确定性路径与 agentic 步骤之间的平衡**。用图表示系统，本质是在编码你的世界知识——就像 prompt 携带的领域知识让你的 agent 区别于通用 ChatGPT 一样，图这种"认知架构"同样携带领域知识。结果就是代码与模型推理协同工作：**模型在它增值的地方推理，代码处理其余部分，于是 agent 更便宜、更快、更可预测。**

---

## 一、背景：图工程这个术语从哪来

### 1.1 术语的诞生

"图工程（graph engineering）"是 2026 年 7 月那个周末浮出水面的，由 Peter Steinberger 的一条推文引爆。它是 X 的 AI 内容工厂产出的最新术语，接在 prompt engineering（提示工程）、context engineering（上下文工程）、harness engineering（框架工程）、loop engineering（循环工程）之后。

虽然把这些术语称为"流行词（buzzwords）"既诱人又准确，但它们存在并且涌现是有原因的：**它们确实描述了构建者面对的真实挑战与设计决策**。

### 1.2 为什么有这么多术语

归根结底，目标是驾驭 LLM 的力量为我们做有用的事。无论你用 prompt、agent、loop 还是 graph，那些都只是实现细节。之所以存在这么多术语，是因为**让 LLM 干活很难**：

- 它们是一种新型的**非鲁棒（non-robust）、非确定性（non-deterministic）**软件
- 我们不断尝试新策略让它们可靠地工作
- 新策略 → 新术语

### 1.3 流行词之外：图为什么是合理的

抛开流行词不谈，**把 agentic 系统表示为图是一个非常合理的驾驭 LLM 的方式**。具体来说：

> 图允许你（构建者）把对系统应如何运作的**预判（preconceptions）**强加进更受限的路径，而不是仅仅依赖 LLM 的判断。更具体地说，它让你在希望 agent 走特定路径时更紧密地控制行为。

正是这个直觉，驱动 LangChain 团队在三年前构建了 LangGraph，作为一个帮助构建这类 agentic 系统的框架。

### 1.4 关键数据

| 指标 | 数据 |
|------|------|
| 发布时间 | 约三年前（2023 年左右） |
| 当前月下载量 | 65M+ 次/月 |
| 使用者 | 创业公司与大企业 |
| 核心卖点 | 确定性路径与 agentic 步骤的平衡 |
| 构建者 | LangChain 团队（Harrison Chase 等） |

---

## 二、项目说明：LangGraph 是什么

### 2.1 一句话定位

LangGraph 是一个**用图（graph）来构建、管理和部署长期运行、有状态（stateful）agent 的底层编排框架与运行时**。

### 2.2 与其它 agent 框架的区别

市面上有无数 agent 框架，LangGraph 之所以流行，是因为它**在确定性路径（deterministic paths）与 agentic 步骤（agentic steps）之间取得了平衡**：

- 太自由的框架（纯 agent 循环）：模型自己决定一切，行为不可预测
- 太僵硬的框架（纯流水线）：无法处理开放性任务，模型能力被浪费
- LangGraph：**把结构编码成图，把自由留给节点内部**——该确定的地方确定，该 agentic 的地方 agentic

### 2.3 三年实践总结的定位

这篇文章是 LangChain 团队（Harrison Chase 与 Sydney Runkle）在 2026 年 7 月 22 日发布的官方总结，标题《3 Years of Graph Engineering with LangGraph》——一句话概括：**三年来我们一直在用图构建 agentic 系统，以下是学到的经验。**

---

## 三、详细教程：如何把 Agent 建模成图

### 3.1 图的三要素

把 agent 建模成图，本质上是定义一个**状态机（state machine）**：

| 要素 | 作用 | 内容 |
|------|------|------|
| **节点（Nodes）** | 做事 | 确定性代码、单个 LLM 调用、工具调用，或一个带内部循环的完整 agent |
| **边（Edges）** | 定义下一步发生什么 | 确定性边（固定流转）；条件边（基于节点结果、当前状态或外部信号） |
| **状态（State）** | 在图里流动的数据 | 在图定义的流程中穿行，连接各步骤 |

你可以这样理解：**图定义工作流，状态在工作流中流动，边定义步骤之间的转换。**

### 3.2 最小示例：一个带分类的知识库 agent

这是原文给出的核心案例：一个知识库 agent，使用三个子 agent 搜索：

- **GitHub agent**：搜索代码、issue、pull request
- **Notion agent**：搜索内部文档与 wiki
- **Slack agent**：搜索相关线程

工作流有三个固定阶段：**分类（classify）→ 搜索（search）→ 综合（synthesize）**。

用 LangGraph 的 Python API 建模大致如下：

```python
from langgraph.graph import StateGraph, END
from typing import TypedDict, Literal

class AgentState(TypedDict):
    query: str
    source: Literal["github", "notion", "slack"]
    results: list

def classify(query: str) -> str:
    """分类节点：决定问题属于哪个知识源（模型单次调用，无工具）"""
    # 用 LLM 判断：代码问题 → github；内部文档 → notion；讨论 → slack
    return "github"  # 示例返回值

def search_github(state: AgentState) -> AgentState:
    """搜索节点：GitHub agent 在代码/issue/PR 中搜索"""
    return {**state, "results": search_code(state["query"])}

def search_notion(state: AgentState) -> AgentState:
    """搜索节点：Notion agent 在内部文档/wiki 中搜索"""
    return {**state, "results": search_docs(state["query"])}

def search_slack(state: AgentState) -> AgentState:
    """搜索节点：Slack agent 在相关线程中搜索"""
    return {**state, "results": search_threads(state["query"])}

def synthesize(state: AgentState) -> AgentState:
    """综合节点：把搜索结果合成最终答案（模型单次调用）"""
    return state

# 构建图
graph = StateGraph(AgentState)
graph.add_node("classify", classify)
graph.add_node("github", search_github)
graph.add_node("notion", search_notion)
graph.add_node("slack", search_slack)
graph.add_node("synthesize", synthesize)

graph.add_edge("classify", "github")   # 确定性边示例（也可改为条件边）
graph.add_edge("classify", "notion")
graph.add_edge("classify", "slack")
graph.add_edge("github", "synthesize")
graph.add_edge("notion", "synthesize")
graph.add_edge("slack", "synthesize")
graph.add_edge("synthesize", END)

app = graph.compile()
```

这个流程是**扇出再综合（fan-out and synthesize）**：一个输入分发给多个并行搜索者，再把所有结果汇聚到综合步骤。

### 3.3 什么时候应该用图

真实世界的 agent 工作流通常有**可预测的结构**：

- **支持 agent**：先分类问题，再回答或升级
- **编码 agent**：先检查仓库，再提议改动
- **合规工作流**：先获得审批，再采取外部行动

图让你**直接把这种结构编码进去**：哪些路径合法、哪里让模型选择、哪里应该由系统强制执行确定性行为而不是指望模型每次做对。

> **关键洞察**：通过把系统表示为图，你在编码自己对系统应如何运作的**世界知识（world knowledge）**。就像 prompt 携带领域知识让 agent 区别于通用 ChatGPT，图这种"认知架构（cognitive architecture）"同样携带领域知识。

**用图的收益**：代码与模型推理协同工作——模型在它增值的地方推理，代码处理其余部分，于是 agent **更便宜、更快、更可预测**。

### 3.4 什么时候不应该用图

有些任务天然更 agentic，强行塞进确定性路径是错误的选择。这时你不想把系统表示为图，而是直接用 **agent harness（agent 框架/容器）**，比如 LangChain 的 **Deep Agents**。

**典型例子：通用深度研究（deep research）**。研究 agent 需要规划、委派、搜索、阅读、综合，这些方式很难提前固定下来。原文透露：

- LangChain 早期用**预定义的 LangGraph 工作流**构建深度研究
- 后来迁移到**更 agentic 的核心循环（core loop）**
- 知名开源实现 **GPT Researcher** 也做了同样的迁移：把图状的多 agent 流水线换成了 Deep Agents，让规划、委派、上下文管理**在 harness 中涌现（emerge）**，而不是硬编码在图中

> **决策法则**：工作流结构可预测 → 用图，把结构显式化；工作流本质是开放式探索 → 用 agent harness，让结构涌现。

### 3.5 进阶：动态转换与 map-reduce

你并不总是想在构建时就定义每一条边。有时一个节点需要在运行时决定要产生多少工作。**Map-reduce 是经典场景**：

> 把输入拆成若干片段，每个片段发给一个 worker，再把结果合并。worker 的数量取决于输入，你事先并不知道这个数量。

LangGraph 用 **`Send` API** 处理这种情况——它让一个节点动态地把工作路由到一个或多个下游节点，**无需静态定义每条转换**：

```python
from langgraph.types import Send

def continue_to_sources(state):
    """动态分发：根据输入决定生成多少搜索任务"""
    return [
        Send("search", {"query": q})
        for q in split_into_queries(state["input"])
    ]

# 图中：source_router 节点用 Send 把工作扇出到多个 search 节点，
# search 完成后汇聚到 synthesize 节点
```

这很重要，因为**有用的 agent 系统混合了已知结构与运行时可变性**：

- 你可能知道研究应该扇出再综合，但不知道会有多少个来源
- 你可能知道 supervisor 应该委派给 workers，但不知道具体委派给谁，直到任务开始
- **图在运行时仍然需要灵活性**

---

## 四、什么才是真正的新东西

### 4.1 不是图本身，而是节点里能装什么

把 agentic 系统表示为图并不是新事——LangChain 已经做了三年！那么这波"图工程"浪潮里，真正改变的是什么？

一种宽厚的解释：**改变的是节点里能放什么**。

- **早期**：节点是确定性代码或单个 LLM 调用
- **现在**：agent 本身已经足够可靠，可以托付真实工作——**一个节点可以是一次完整的 agent 运行（agent run）**。你在编排 agent，而不只是编排 LLM 调用

### 4.2 编码 agent 作为节点：新近实用的模式

**编码 agent（coding agents）**是当今生产环境中最高效、最有影响力的 agent 之一。把一个编码 agent 作为节点嵌入更大的图，是一个**新近才变得实用的模式**。

**案例：docs agent（文档 agent）**。它把一个 Slack 请求：

> 比如："请为我们的自定义工具添加文档"

变成一份**可以评审的 pull request**。这个图中每个节点都位于**确定性到 agentic 的光谱**上不同的位置：

| 步骤类型 | 内容 | 例子 |
|---------|------|------|
| **固定步骤（Fixed steps）** | 设定代码与 API 调用 | Slack 与 Linear 操作 |
| **模型步骤（Model steps）** | 单个 LLM 调用，无工具 | 分类器、综合步骤 |
| **Agent 步骤（Agent steps）** | 更开放的工作 | reference docs agent、conceptual docs agent 在各自代码库中完成开放工作 |

> **核心洞察**：这里确定性与自主性的混合，正是这个 docs agent **可预测、强大、高效**的原因。

---

## 五、设计哲学：LangGraph 与图工程的世界观

### 5.1 图是认知架构

LangGraph 背后的设计哲学，核心主张是：

> **通过把系统表示为图，你是在编码自己关于系统应如何运作的世界知识。** 就像 prompt 携带领域知识让你的 agent 区别于通用 ChatGPT 一样，图这种"认知架构"同样携带领域知识。

**推论**：一个精心设计的图，本身就是领域知识的一种可执行形态——它把"系统应该如何运作"从模型的黑箱判断中解放出来，变成构建者可以审视、调整、验证的显式结构。

### 5.2 确定性路径与 agentic 步骤的平衡

LangGraph 存在的理由，就是**在确定性路径与 agentic 步骤之间找到平衡**：

- 不是"全自动"——某些路径必须强制，不能让模型自由发挥
- 不是"全流水线"——节点内部允许 agentic 自由
- **原则：该确定的地方确定，该自主的地方自主，自由度收在节点内部**

### 5.3 循环是简单的图

LangGraph 团队三年的第一手经验是：**loop engineering 不是 graph engineering 的替代品，而是它的简化版**。正如 XState 作者 David Khourshid 所说："循环就是一个有向的、循环的图（a loop is just a directed, cyclic graph）。"

最有力的证据：**LangChain 框架本身（基于一个简单的 agentic 循环）就是构建在 LangGraph 之上的。**

### 5.4 模型在它增值的地方推理

图工程的最终哲学目标是**成本与可预测性的优化**：

> 代码与模型推理协同工作：模型在它增值的地方推理，代码处理其余部分，于是 agent 更便宜、更快、更可预测。

**不要**让模型做它不擅长的固定逻辑；**要**让模型在判断、综合、开放式理解上发挥。图是把这两种能力精确分层的工具。

---

## 六、三年实践经验总结：学到的三件事

### 6.1 第一，agent 图通常不是 DAG

生产级 agent 需要**循环（cycles）**：

- 重试失败的工具调用
- 向用户询问缺失的信息
- 验证后修订答案
- 反复调用工具直到拥有足够上下文
- 暂停等待人工输入后再继续

**循环是 agentic 系统的核心组成部分**，所以 agent 图大概率不是 DAG（有向无环图）。

### 6.2 第二，循环是简单的图

- loop engineering 不是 graph engineering 的替代品，而是它的**简单版本**
- 一个循环 = 一个有向、循环的图
- LangChain（基于简单 agentic 循环的框架）构建在 LangGraph 之上——**最简单的图就是 LangGraph 能表达的**，两者不是对立关系，而是包含关系

### 6.3 第三，动态转换很重要

- 你不需要在构建时定义每一条边
- 有时节点在运行时决定要创建多少工作（map-reduce）
- **Send API** 让节点动态路由工作，无需静态定义每条转换
- 有用的 agent 系统 = **已知结构 + 运行时可变性**的混合

---

## 七、归纳总结：核心观点与结论

### 7.1 核心观点清单

1. **术语多 ≠ 炒作**：graph engineering 等术语描述了构建者真实面对的设计决策；它们存在是因为让 LLM 干活很难
2. **图是合理的范式**：图让你把预判强加进受限路径，在需要控制时更紧密地控制行为——这是 LangGraph 存在的理由
3. **平衡是 LangGraph 流行的原因**：确定性路径与 agentic 步骤之间的平衡，让它区别于其它 agent 框架
4. **图编码世界知识**：图是认知架构，与 prompt 一样携带领域知识，是可执行的领域知识形态
5. **有结构的任务用图**：支持分类、编码检查、合规审批——这些有可预测结构的工作流，直接用图编码
6. **开放任务用 harness**：深度研究这类天然 agentic 的任务，用 agent harness（Deep Agents），让规划/委派/上下文管理涌现
7. **agent 图不是 DAG**：循环（重试、询问、修订、暂停）是 agentic 系统的核心
8. **循环是简单的图**：LangChain 构建在 LangGraph 之上，两者是包含而非对立关系
9. **动态转换是刚需**：运行时才知道工作量（map-reduce），需要 Send API 这样的动态路由
10. **真正的变化在节点内部**：现在节点可以是完整 agent 运行——你在编排 agent，不只是 LLM 调用
11. **编码 agent 是新的实用节点**：docs agent 案例展示了确定性到 agentic 光谱上的节点混合
12. **模型在它增值的地方推理**：最终目标是更便宜、更快、更可预测的 agent

### 7.2 决策速查表

| 场景 | 选择 | 理由 |
|------|------|------|
| 工作流结构可预测（分类→响应/升级） | 图（LangGraph） | 直接编码合法路径 |
| 需要确定性控制（合规审批） | 图（LangGraph） | 系统强制执行而非指望模型 |
| 需要运行时扇出（map-reduce） | 图 + Send API | 动态路由不静态预定义 |
| 开放式探索（深度研究） | agent harness（Deep Agents） | 规划/委派/上下文管理涌现 |
| 单 agent 循环 | 图的最简形式 | 循环就是有向循环图 |
| 节点内部要自由度 | 节点内放 agent | 编排 agent 而非仅 LLM 调用 |

### 7.3 对构建者的启示

1. **先想结构，再写代码**：开工前问自己——这个工作流哪里是可预测的？哪里必须让模型自由？把可预测的部分显式化成图
2. **不要迷信图**：如果任务是开放式探索，图不是答案，harness 才是
3. **拥抱循环**：重试、询问、修订不是异常，是 agentic 系统的常态，图必须支持它们
4. **把自由度放在正确层级**：该确定的路径强制，该自主的步骤留在节点内部

---

## 八、延伸阅读

- [LangGraph 文档](https://docs.langchain.com/oss/python/langgraph/overview)
- [什么是认知架构（Cognitive Architectures）](https://www.langchain.com/blog/what-is-a-cognitive-architecture)
- [循环工程的艺术（The Art of Loop Engineering）](https://www.langchain.com/blog/the-art-of-loop-engineering)
- [agent harness 解剖（The Anatomy of an Agent Harness）](https://www.langchain.com/blog/the-anatomy-of-an-agent-harness)
- [如何构建自定义 agent harness](https://www.langchain.com/blog/how-to-build-a-custom-agent-harness)
- [Deep Agents vs LangChain vs LangGraph](https://www.langchain.com/blog/deep-agents-vs-langchain-vs-langgraph)

---

*本文基于 LangChain 官方博客《3 Years of Graph Engineering with LangGraph》（Sydney Runkle & Harrison Chase，2026-07-22）深度解析与二次创作。*
