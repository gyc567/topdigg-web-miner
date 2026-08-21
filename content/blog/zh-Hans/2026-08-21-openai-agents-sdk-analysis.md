---
title: "OpenAI Agents SDK 深度解析：轻量级多 Agent 工作流框架"
date: "2026-08-21"
description: "深度解析 OpenAI openai-agents-python 开源框架：轻量级多 Agent 工作流框架，支援 OpenAI Responses API 和 100+ LLM Provider。核心思想：足夠強大的功能，極少的基础原语。Python-First 设计，原生整合 Tracing，支援 Sandbox Agent 隔离工作区。"
tags:
  - OpenAI Agents SDK
  - Multi-Agent
  - Handoffs
  - Guardrails
  - Python
  - Swarm
  - MCP
  - Agent Orchestration
categories:
  - 深度解析
  - AI Agent
  - 开源框架
---

# OpenAI Agents SDK 深度解析：轻量级多 Agent 工作流框架

> 核心思想：**"足够强大的功能，极少的基础原语"**——OpenAI Agents SDK 没有发明复杂的新概念，而是用 Python 语言本身的能力来组织 Agent：把其他 Agent 当工具用（Agents as Tools）、把交接棒当成调用（Handoffs）、把安全检查当成装饰器（Guardrails）。这是 Swarm（OpenAI 上一代实验性 Agent 框架）的生产级升级，但比 Swarm 更克制、更实用。

## 一、项目背景：从 Swarm 到 Agents SDK

OpenAI Agents SDK 是 OpenAI 官方发布的 Python Agent 开发框架。它的前身是 **Swarm**——一个 2024 年发布的实验性框架，探索了"用 Python 语法来编排多 Agent 协作"的思路。Swarm 从来不是生产级产品，但它的核心洞察：**"Agent 协作不应该需要新的编程范式"** 被 Agents SDK 完全继承并产品化。

Agents SDK 是 Swarm 思路的**生产级升级版本**：

- Swarm 是实验性的（有 bug、不完整）
- Agents SDK 是生产就绪的（有完整测试、文档、Tracing）
- Swarm 探索的方向：多 Agent 协作 = 函数调用 + Handoff
- Agents SDK 落地的方向：用 Python 原语表达复杂工作流

### 项目元信息

| 字段 | 值 |
|------|-----|
| 仓库 | https://github.com/openai/openai-agents-python |
| 语言 | Python 3.10+ |
| 安装 | `pip install openai-agents` 或 `uv add openai-agents` |
| 可选依赖 | voice（语音）、redis（会话持久化）、docker（沙箱）|
| 协议 | Provider-agnostic（OpenAI + 100+ LLM）|
| 依赖库 | Pydantic、MCP Python SDK、Griffe、uv、ruff |
| License | Apache 2.0 或 MIT |

### 一句话定位

OpenAI Agents SDK 是一个**轻量级、功能强大、Python-First 的多 Agent 工作流框架**：用极少的核心原语（Agent + Handoff + Guardrail）表达复杂的多 Agent 协作，内置 Tracing 可视化，支持 Sandbox Agent 隔离执行环境。

## 二、核心原语：三个概念，一个框架

Agents SDK 的设计哲学是**"少即是多"**。整个框架只有三个核心原语：

```
┌──────────────────────────────────────────────┐
│           OpenAI Agents SDK                   │
│                                              │
│  Agent = LLM + Instructions + 工具 + Guardrails│
│                                              │
│  Handoff = Agent 之间的交接棒                 │
│                                              │
│  Guardrail = 输入/输出的安全检查              │
└──────────────────────────────────────────────┘
```

这三个原语可以自由组合，表达从简单到复杂的所有 Agent 工作流。

## 三、详细教程：从 Hello World 到生产系统

### 3.1 安装

```bash
# 方式1：pip
pip install openai-agents

# 方式2：uv（推荐，更快）
uv init
uv add openai-agents

# 语音支持
uv add 'openai-agents[voice]'

# Redis 会话支持
uv add 'openai-agents[redis]'
```

### 3.2 快速开始：Text Agent

Text Agent 适用于不需要持久实时连接或沙箱工作区的场景：

```python
from agents import Agent, Runner

agent = Agent(
    name="Assistant",
    instructions="You are a helpful assistant"
)

result = Runner.run_sync(agent, "Write a haiku about recursion.")
print(result.final_output)
# Code within the code,
# Functions calling themselves,
# Infinite loop's dance.
```

`Runner.run_sync()` 是同步运行方式。如果在 Jupyter Notebook 中，推荐使用异步方式或直接运行单元格（SDK 内置 Jupyter 支持）。

### 3.3 中级教程：带工具的 Agent

使用 `@tool` 装饰器将任何 Python 函数变成 Agent 可调用的工具：

```python
from agents import Agent, Runner
from agents.decorators import tool

@tool
def get_weather(city: str) -> str:
    """Returns weather info for the specified city."""
    return f"The weather in {city} is sunny"

agent = Agent(
    name="Weather Agent",
    instructions="Always respond with weather information.",
    model="gpt-5-nano",
    tools=[get_weather]
)

result = Runner.run_sync(agent, "What's the weather in Tokyo?")
```

工具支持 Pydantic 驱动的自动 schema 生成和参数验证，确保 Agent 调用工具时参数类型安全。

### 3.4 多 Agent 编排：Manager 模式 vs Handoffs 模式

这是最关键的设计决策。

#### 4A. Manager 模式（Agents as Tools）

一个中央管理员 Agent 掌控对话，通过工具调用来使用专门的子 Agent：

```python
from agents import Agent

booking_agent = Agent(name="Booking Expert", ...)
refund_agent = Agent(name="Refund Expert", ...)

customer_agent = Agent(
    name="Customer-facing agent",
    instructions=(
        "Handle all direct user communication. "
        "Call the relevant tools when specialized expertise is needed."
    ),
    tools=[
        booking_agent.as_tool(
            tool_name="booking_expert",
            tool_description="Handles booking questions and requests.",
        ),
        refund_agent.as_tool(
            tool_name="refund_expert",
            tool_description="Handles refund questions and requests.",
        ),
    ],
)
```

特点：**集中控制**，管理员 Agent 决定何时调用哪个专家 Agent，调用结果返回给管理员再继续对话。

#### 4B. Handoffs 模式（去中心化）

子 Agent 直接获得对话控制权，更去中心化：

```python
from agents import Agent

booking_agent = Agent(name="Booking Agent", ...)
refund_agent = Agent(name="Refund Agent", ...)

triage_agent = Agent(
    name="Triage agent",
    instructions=(
        "Help the user with their questions. "
        "If they ask about booking, hand off to the booking agent. "
        "If they ask about refunds, hand off to the refund agent."
    ),
    handoffs=[booking_agent, refund_agent],
)
```

特点：**去中心化**，Agent 可以把对话控制权完全交给另一个 Agent，后者看到完整对话历史并继续主导。

### 3.5 Guardrails：输入输出安全检查

Guardrails 是 Agent 的"安全门卫"，可以在 Agent 执行前/后运行验证：

```python
from pydantic import BaseModel
from agents import Agent, Runner, GuardrailFunctionOutput, InputGuardrailTripwireTriggered
from agents.decorators import input_guardrail

class MathHomeworkOutput(BaseModel):
    is_math_homework: bool
    reasoning: str

guardrail_agent = Agent(
    name="Guardrail check",
    instructions="Check if the user is asking you to do their math homework.",
    output_type=MathHomeworkOutput,
)

@input_guardrail
async def math_guardrail(ctx, agent, input_str) -> GuardrailFunctionOutput:
    result = await Runner.run(guardrail_agent, input_str, context=ctx.context)
    return GuardrailFunctionOutput(
        output_info=result.final_output,
        tripwire_triggered=result.final_output.is_math_homework,
    )

agent = Agent(
    name="Customer support agent",
    instructions="You are a customer support agent.",
    input_guardrails=[math_guardrail],
)

# 尝试触发 guardrail
try:
    await Runner.run(agent, "Help me solve: 2x + 3 = 11")
except InputGuardrailTripwireTriggered:
    print("Math homework guardrail tripped!")
```

Guardrails 支持三种类型：

| 类型 | 触发时机 | 用途 |
|------|---------|------|
| Input Guardrail | 首个 Agent 执行前 | 内容过滤、权限检查、恶意输入拦截 |
| Output Guardrail | 最终 Agent 输出后 | 合规检查、敏感信息过滤 |
| Tool Guardrail | 每次工具调用前后 | API Key 保护、输出脱敏 |

### 3.6 Sandbox Agent：隔离工作区执行

当 Agent 需要检查文件、运行命令、保存工作区状态时，用 SandboxAgent：

```python
from agents import Runner
from agents.run import RunConfig
from agents.sandbox import Manifest, SandboxAgent, SandboxRunConfig
from agents.sandbox.entries import GitRepo
from agents.sandbox.sandboxes import UnixLocalSandboxClient

agent = SandboxAgent(
    name="Workspace Assistant",
    instructions="Inspect the sandbox workspace before answering.",
    default_manifest=Manifest(entries={"repo": GitRepo(repo="openai/openai-agents-python", ref="main")}),
)

result = Runner.run_sync(
    agent,
    "Inspect the repo README and summarize what this project does.",
    run_config=RunConfig(sandbox=SandboxRunConfig(client=UnixLocalSandboxClient())),
)
```

支持的沙箱客户端：

- `UnixLocalSandboxClient`（macOS/Linux 原生）
- `DockerSandboxClient`（Windows 或跨平台）
- 托管沙箱客户端（云端）

### 3.7 Realtime Agent：语音交互

基于 WebSocket 的低延迟语音 Agent：

```python
import asyncio
from agents.realtime import RealtimeAgent, RealtimeRunner

async def main():
    agent = RealtimeAgent(
        name="Assistant",
        instructions="You are a helpful voice assistant. Keep responses short."
    )
    runner = RealtimeRunner(starting_agent=agent)
    session = await runner.run()

    async with session:
        await session.send_message("Say hello in one short sentence.")
        async for event in session:
            if event.type == "audio":
                # Forward or play audio
                pass
            elif event.type == "history_added":
                print(event.item)
            elif event.type == "agent_end":
                break

asyncio.run(main())
```

### 3.8 Voice Pipeline：语音流水线

语音 → 文字 → Agent → 文字 → 语音的完整流水线：

```python
import asyncio
import numpy as np
from agents import Agent
from agents.voice import AudioInput, SingleAgentVoiceWorkflow, VoicePipeline

async def main():
    agent = Agent(name="Assistant", instructions="You are a helpful assistant.")
    pipeline = VoicePipeline(workflow=SingleAgentVoiceWorkflow(agent))
    audio_input = AudioInput(buffer=np.zeros(24000 * 3, dtype=np.int16))
    result = await pipeline.run(audio_input)
    async for event in result.stream():
        if event.type == "voice_stream_event_audio":
            # Forward or play audio
            pass

asyncio.run(main())
```

## 四、项目说明：架构与核心组件

### 4.1 Agent 的核心配置

```python
Agent(
    name="Agent Name",                    # 必须：人类可读的 Agent 名称
    instructions="...",                  # 强烈推荐：系统提示词
    model="gpt-5-nano",                   # 可选：指定模型，默认用 OpenAI
    tools=[...],                          # 可选：Agent 可调用的工具列表
    handoffs=[...],                       # 可选：可交接的子 Agent 列表
    input_guardrails=[...],               # 可选：输入安全检查
    output_guardrails=[...],              # 可选：输出安全检查
    output_type=MyModel,                 # 可选：结构化输出（Pydantic 模型）
    hooks=MyHooks(),                     # 可选：生命周期钩子
    mcp_servers=[...],                    # 可选：MCP 服务器
    model_settings=ModelSettings(...)    # 可选：模型调参（temperature 等）
)
```

### 4.2 Context：依赖注入

Context 是一个依赖注入工具，可以在 Agent、工具、Handoff 之间共享状态：

```python
from dataclasses import dataclass
from agents import Agent, RunContextWrapper

@dataclass
class UserContext:
    name: str
    uid: str
    is_pro_user: bool

    async def fetch_purchases(self) -> list[Purchase]:
        return []

agent = Agent[UserContext](
    name="Shopping Assistant",
    ...
)

# Context 在 Runner.run() 时传入
result = await Runner.run(
    agent,
    "What did I buy?",
    context=UserContext(name="Alice", uid="123", is_pro_user=True)
)
```

### 4.3 Structured Outputs：结构化输出

默认 Agent 输出纯文本。如果需要结构化数据，使用 Pydantic 模型：

```python
from pydantic import BaseModel
from agents import Agent

class CalendarEvent(BaseModel):
    name: str
    date: str
    participants: list[str]

agent = Agent(
    name="Calendar extractor",
    instructions="Extract calendar events from text",
    output_type=CalendarEvent,
)
```

内部使用 OpenAI 的 Structured Outputs API，确保输出格式严格符合 Schema。

### 4.4 Lifecycle Hooks：生命周期钩子

Hooks 让你观察和干预 Agent 的执行生命周期：

```python
from agents import Agent, RunHooks, Runner

class LoggingHooks(RunHooks):
    async def on_agent_start(self, context, agent):
        print(f"Starting {agent.name}")

    async def on_llm_end(self, context, agent, response):
        print(f"{agent.name} produced {len(response.output)} output items")

    async def on_agent_end(self, context, agent, output):
        print(f"{agent.name} finished with usage: {context.usage}")

agent = Agent(name="Assistant", instructions="Be concise.")
result = await Runner.run(agent, "Explain quines", hooks=LoggingHooks())
```

Hook 类型：

| 钩子 | 触发时机 |
|------|---------|
| `on_agent_start` | 特定 Agent 开始运行 |
| `on_agent_end` | 特定 Agent 产生最终输出 |
| `on_llm_start/end` | 每次模型调用前后 |
| `on_tool_start/end` | 每次工具调用前后 |
| `on_handoff` | 控制权从一个 Agent 转移到另一个 |

### 4.5 Tracing：内置可观测性

Agents SDK 内置 Tracing，支持可视化、调试和监控 Agent 工作流：

- 与 OpenAI 的评估、微调、蒸馏工具链集成
- 可观察每个 Agent、工具调用、Handoff 的执行情况
- 支持自定义 trace exporter

## 五、设计哲学：五个核心原则

### 5.1 足够强大，但原语极少

OpenAI Agents SDK 的第一个设计原则是：**"有足够的特性值得使用，但原语足够少，学习曲线低"**。

这意味着：
- 你不需要学习新的 DSL 或配置格式
- 你用 Python 写 Agent，就像写普通 Python 代码
- 复杂行为通过原语的组合来表达，而不是添加新的原语类型

### 5.2 开箱即用，但可精确定制

第二个设计原则是：**"开箱即用，但你完全可以定制发生了什么"**。

默认配置已经能工作得很好：
- 默认使用 OpenAI Responses API
- 默认 Session 管理对话历史
- 默认 Tracing 记录执行过程

但你可以在每个层次精确控制：
- 自定义工具、Agent、Guardrail
- 替换 Session 存储（Redis 等）
- 接入自己的 LLM Provider

### 5.3 Python-First：不用发明新范式

Agents SDK 没有发明"Agent 编排语言"，而是**用 Python 本身的能力来表达 Agent 协作**：

- 用 `@tool` 装饰器把 Python 函数变成工具（而不是发明新的工具定义格式）
- 用 `Agent.as_tool()` 把一个 Agent 变成另一个 Agent 的工具
- 用 `handoff()` 函数处理交接棒（而不是发明新的消息协议）
- 用 Pydantic 做结构化输入输出（而不是发明新的 Schema 语言）

### 5.4 Provider-Agnostic：不绑定 OpenAI

虽然名字叫 "OpenAI Agents SDK"，但它实际上**不绑定 OpenAI**：

- 默认使用 OpenAI Responses API
- 支持 100+ LLM Provider（通过 any-llm 和 LiteLLM）
- 支持 Anthropic、Google、Mistral 等模型
- 自定义 provider 只需要实现统一的接口

### 5.5 Guardrails First：安全不是补丁

Guardrail 不是"后面再加的安全检查"，而是**框架的一等公民**：

- Input/Output/Tool 三层 Guardrail 覆盖所有检查点
- 与 Agent 执行并行运行（不增加延迟）
- 支持 fail-fast 模式（Guardrail 失败立即停止，不消耗 token）

## 六、观点总结与启示

### 观点 1：多 Agent 协作的范式战争：Manager vs Handoff

当前多 Agent 系统有两种主流范式：

| 范式 | 代表 | 特点 | 适用场景 |
|------|------|------|---------|
| **Manager（集中式）** | LangGraph、AutoGen | 中央 Agent 控制流程，工具调用子 Agent | 流程固定、需要强控制的场景 |
| **Handoff（去中心化）** | Agents SDK、Swarm | Agent 直接移交控制权，去中心化 | 灵活协作、角色分明的场景 |

Agents SDK **不选边站**，同时支持两种模式，让开发者根据场景选择。

### 观点 2："Python-First Agent 框架"是正确的产品方向

之前很多 Agent 框架（LangChain、AutoGen早起版本）的设计思路是"发明新的抽象层"。结果是：

- 学习曲线陡峭（新语言、新概念）
- 调试困难（抽象层隐藏了真实执行）
- 绑定框架（换了框架要重写）

Agents SDK 的 Python-First 设计意味着：**你用 Python 写 Agent，Python 程序员不需要学习新东西**。这是把 Agent 开发工具从"研究员玩具"推向"工程师生产工具"的关键。

### 观点 3：Guardrails 是 Agent 产品化的必要条件

当 Agent 进入生产环境，输入输出的安全性不再是可选项：

- 用户可能注入恶意提示词
- Agent 输出可能泄露敏感信息
- 工具调用可能超出预期范围

Agents SDK 把 Guardrail 设计为框架核心（而非插件），是正确的优先级。**没有 Guardrail 的 Agent 和没有防火墙的服务器一样危险。**

### 观点 4：Provider-Agnostic 是护城河

OpenAI 模型不是唯一的选项，也不是所有场景的最佳选择：

- 简单任务用 GPT-4o mini（便宜、快速）
- 复杂推理用 Claude（更强的推理能力）
- 代码任务用 Gemini（更长的上下文）

Agents SDK 的 Provider-Agnostic 意味着：**换模型不需要换框架**，这是避免 OpenAI 锁定的关键。

### 观点 5：Sandbox Agent 是代码 Agent 的正确形态

大多数"AI 编程 Agent"实际上是在一个共享的 REPL 里运行代码——这既不安全（代码可以访问主机资源），也不可靠（状态可能互相干扰）。

Sandbox Agent 的思路是：**每个 Agent 运行在独立的隔离工作区**，代码操作的是沙箱内的文件系统和工作目录，不影响主机。这既更安全，也更可预测。

### 观点 6：Tracing 基础设施决定 Agent 开发效率

Agent 的执行路径往往是非线性的（有循环、有条件分支、有工具调用），纯靠 print 调试几乎不可能。

内置 Tracing + OpenAI 评估/微调/蒸馏工具链的整合，意味着：**调试 Agent 不再是盲人摸象**，而是有了完整的执行链路记录。这是 Agent 从"能用"到"可维护"的基础设施。

### 观点 7：开源 Agent 框架的"官方化"趋势

OpenAI 发布 Agents SDK（而不是继续维持 Swarm 实验性项目），说明：

- 开源 Agent 框架不再只是第三方的事
- 官方框架会定义"最佳实践标准"
- 其他框架（LangGraph、Mastra 等）需要差异化竞争

这对于整个 Agent 开源生态是好事：更多投入、更多标准、更多互操作性。

## 七、技术规格速览

| 维度 | 规格 |
|------|------|
| 语言 | Python 3.10+ |
| 安装 | `pip install openai-agents` |
| Agent 类型 | Text / Sandbox / Realtime / Voice |
| 工具类型 | Function tools / MCP tools / Hosted tools |
| 模型支持 | OpenAI Responses API + 100+ Provider |
| 安全机制 | Input/Output/Tool Guardrails |
| 编排模式 | Manager（集中式）/ Handoff（去中心化）|
| 会话管理 | 内置 Memory / Redis 可选 |
| 可观测性 | 内置 Tracing |
| 生命周期钩子 | RunHooks / AgentHooks |
| 结构化输出 | Pydantic 模型 |
| Agent 复用 | `clone()` 方法 |

## 八、结语

OpenAI Agents SDK 的最大价值不是"又多了一个人 Agent 框架"，而是**用最少的概念做了最完整的事**。

它没有发明复杂的 DSL，没有引入奇怪的状态机，没有要求你学习新的配置格式。它只是：

- 用 Python 的 `@tool` 装饰器做了工具
- 用 Python 的类和方法做了 Agent 的组合
- 用 Python 的异常处理做了 Guardrail
- 用 Python 的依赖注入做了 Context

这是对的。Agent 协作本来就不应该需要新语言，需要的是**把 Python 本身的能力用足**。

对于正在构建 Agent 应用的工程师，Agents SDK 提供了两件事：**一个可以快速起步的框架，和一套可以被信任的生产就绪特性**。它目前的 Alpha 状态意味着还会有变化，但它已经比 Swarm 成熟得多。

---

*项目地址：https://github.com/openai/openai-agents-python*
*文档：https://openai.github.io/openai-agents-python/*
*前身：OpenAI Swarm（实验性，已被 Agents SDK 取代）*
