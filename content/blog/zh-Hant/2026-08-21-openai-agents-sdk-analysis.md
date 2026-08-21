---
title: "OpenAI Agents SDK 深度解析：輕量級多 Agent 工作流框架"
date: "2026-08-21"
description: "深度解析 OpenAI/openai-agents-python 開源框架：輕量級多 Agent 工作流框架，支援 OpenAI Responses API 和 100+ LLM Provider。核心思想：足夠強大的功能，極少的基礎原語。Python-First 設計，原生整合 Tracing，支援 Sandbox Agent 隔離工作區、Realtime Agent 語音交互。"
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
  - 開源框架
---

# OpenAI Agents SDK 深度解析：輕量級多 Agent 工作流框架

> 核心思想：**「足夠強大的功能，極少的基礎原語」**——OpenAI Agents SDK 沒有發明複雜的新概念，而是用 Python 語言本身的能力來組織 Agent：把其他 Agent 當工具用（Agents as Tools）、把交接棒當成調用（Handoffs）、把安全檢查當成裝飾器（Guardrails）。這是 Swarm（OpenAI 上一代實驗性 Agent 框架）的生產級升級，但比 Swarm 更節制、更實用。

## 一、專案背景：從 Swarm 到 Agents SDK

OpenAI Agents SDK 是 OpenAI 官方發布的 Python Agent 開發框架。它的前身是 **Swarm**——一個 2024 年發布的實驗性框架，探索了「用 Python 語法來編排多 Agent 協作」的思路。Swarm 從來不是生產級產品，但它的核心洞察：**「Agent 協作不應該需要新的編程範式」** 被 Agents SDK 完全繼承並產品化。

Agents SDK 是 Swarm 思路的**生產級升級版本**：

- Swarm 是實驗性的（有 bug、不完整）
- Agents SDK 是生產就緒的（有完整測試、文檔、Tracing）
- Swarm 探索的方向：多 Agent 協作 = 函數調用 + Handoff
- Agents SDK 落地的方向：用 Python 原語表達複雜工作流

### 專案元資訊

| 欄位 | 值 |
|------|-----|
| 倉庫 | https://github.com/openai/openai-agents-python |
| 語言 | Python 3.10+ |
| 安裝 | `pip install openai-agents` 或 `uv add openai-agents` |
| 可選依賴 | voice（語音）、redis（會話持久化）、docker（沙箱）|
| 協議 | Provider-agnostic（OpenAI + 100+ LLM）|
| 依賴庫 | Pydantic、MCP Python SDK、Griffe、uv、ruff |
| License | Apache 2.0 或 MIT |

### 一句話定位

OpenAI Agents SDK 是一個**輕量級、功能強大、Python-First 的多 Agent 工作流框架**：用極少的核心原語（Agent + Handoff + Guardrail）表達複雜的多 Agent 協作，內建 Tracing 可視化，支援 Sandbox Agent 隔離執行環境。

## 二、核心原語：三個概念，一個框架

Agents SDK 的設計哲學是**「少即是多」**。整個框架只有三個核心原語：

```
┌──────────────────────────────────────────────┐
│           OpenAI Agents SDK                   │
│                                              │
│  Agent = LLM + 指示 + 工具 + Guardrails       │
│                                              │
│  Handoff = Agent 之間的交接棒                 │
│                                              │
│  Guardrail = 輸入/輸出的安全檢查              │
└──────────────────────────────────────────────┘
```

這三個原語可以自由組合，表達從簡單到複雜的所有 Agent 工作流。

## 三、詳細教學：從 Hello World 到生產系統

### 3.1 安裝

```bash
# 方式1：pip
pip install openai-agents

# 方式2：uv（推薦，更快）
uv init
uv add openai-agents

# 語音支援
uv add 'openai-agents[voice]'

# Redis 會話支援
uv add 'openai-agents[redis]'
```

### 3.2 快速開始：Text Agent

Text Agent 適用於不需要持久即時連接或沙箱工作區的場景：

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

`Runner.run_sync()` 是同步運行方式。如果在 Jupyter Notebook 中，推薦使用非同步方式或直接運行儲存格（SDK 內建 Jupyter 支援）。

### 3.3 中級教學：帶工具的 Agent

使用 `@tool` 裝飾器將任何 Python 函數變成 Agent 可呼叫的工具：

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

工具支援 Pydantic 驅動的自動 schema 生成和參數驗證，確保 Agent 呼叫工具時參數類型安全。

### 3.4 多 Agent 編排：Manager 模式 vs Handoffs 模式

這是最關鍵的設計決策。

#### 4A. Manager 模式（Agents as Tools）

一個中央管理員 Agent 掌控對話，透過工具呼叫來使用專門的子 Agent：

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

特點：**集中控制**，管理員 Agent 決定何時呼叫哪個專家 Agent，呼叫結果返回給管理員再繼續對話。

#### 4B. Handoffs 模式（去中心化）

子 Agent 直接獲得對話控制權，更去中心化：

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

特點：**去中心化**，Agent 可以把對話控制權完全交給另一個 Agent，後者看到完整對話歷史並繼續主導。

### 3.5 Guardrails：輸入輸出安全檢查

Guardrails 是 Agent 的「安全門衛」，可以在 Agent 執行前/後執行驗證：

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

# 嘗試觸發 guardrail
try:
    await Runner.run(agent, "Help me solve: 2x + 3 = 11")
except InputGuardrailTripwireTriggered:
    print("Math homework guardrail tripped!")
```

Guardrails 支援三種類型：

| 類型 | 觸發時機 | 用途 |
|------|---------|------|
| Input Guardrail | 首個 Agent 執行前 | 內容過濾、權限檢查、惡意輸入攔截 |
| Output Guardrail | 最終 Agent 輸出後 | 合規檢查、敏感資訊過濾 |
| Tool Guardrail | 每次工具呼叫前後 | API Key 保護、輸出脫敏 |

### 3.6 Sandbox Agent：隔離工作區執行

當 Agent 需要檢查檔案、執行命令、保存工作區狀態時，用 SandboxAgent：

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

支援的沙箱用戶端：

- `UnixLocalSandboxClient`（macOS/Linux 原生）
- `DockerSandboxClient`（Windows 或跨平台）
- 託管沙箱用戶端（雲端）

### 3.7 Realtime Agent：語音交互

基於 WebSocket 的低延遲語音 Agent：

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

### 3.8 Voice Pipeline：語音流水線

語音 → 文字 → Agent → 文字 → 語音的完整流水線：

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

## 四、專案說明：架構與核心元件

### 4.1 Agent 的核心配置

```python
Agent(
    name="Agent Name",                    # 必須：人類可讀的 Agent 名稱
    instructions="...",                  # 強烈推薦：系統提示詞
    model="gpt-5-nano",                   # 可選：指定模型，預設用 OpenAI
    tools=[...],                          # 可選：Agent 可呼叫的工具列表
    handoffs=[...],                       # 可選：可交接的子 Agent 列表
    input_guardrails=[...],               # 可選：輸入安全檢查
    output_guardrails=[...],              # 可選：輸出安全檢查
    output_type=MyModel,                 # 可選：結構化輸出（Pydantic 模型）
    hooks=MyHooks(),                     # 可選：生命週期鉤子
    mcp_servers=[...],                    # 可選：MCP 伺服器
    model_settings=ModelSettings(...)    # 可選：模型調參（temperature 等）
)
```

### 4.2 Context：依賴注入

Context 是一個依賴注入工具，可以在 Agent、工具、Handoff 之間共享狀態：

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

# Context 在 Runner.run() 時傳入
result = await Runner.run(
    agent,
    "What did I buy?",
    context=UserContext(name="Alice", uid="123", is_pro_user=True)
)
```

### 4.3 Structured Outputs：結構化輸出

預設 Agent 輸出純文字。如果需要結構化資料，使用 Pydantic 模型：

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

內部使用 OpenAI 的 Structured Outputs API，確保輸出格式嚴格符合 Schema。

### 4.4 Lifecycle Hooks：生命週期鉤子

Hooks 讓你觀察和干預 Agent 的執行生命週期：

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

Hook 類型：

| 鉤子 | 觸發時機 |
|------|---------|
| `on_agent_start` | 特定 Agent 開始運行 |
| `on_agent_end` | 特定 Agent 產生最終輸出 |
| `on_llm_start/end` | 每次模型呼叫前後 |
| `on_tool_start/end` | 每次工具呼叫前後 |
| `on_handoff` | 控制權從一個 Agent 轉移到另一個 |

### 4.5 Tracing：內建可觀測性

Agents SDK 內建 Tracing，支援可視化、除錯和監控 Agent 工作流：

- 與 OpenAI 的評估、微調蒸餾工具鏈整合
- 可觀察每個 Agent、工具呼叫、Handoff 的執行情況
- 支援自訂 trace exporter

## 五、設計哲學：五個核心原則

### 5.1 足夠強大，但原語極少

OpenAI Agents SDK 的第一個設計原則是：**「有足夠的特性值得使用，但原語足夠少，學習曲線低」**。

這意味著：
- 你不需要學習新的 DSL 或配置格式
- 你用 Python 寫 Agent，就像寫普通 Python 程式碼
- 複雜行為透過原語的組合來表達，而不是添加新的原語類型

### 5.2 開箱即用，但可精確定制

第二個設計原則是：**「開箱即用，但你完全可以定制發生了什麼」**。

預設配置已經能工作得很好：
- 預設使用 OpenAI Responses API
- 預設 Session 管理對話歷史
- 預設 Tracing 記錄執行過程

但你可以在每個層次精確控制：
- 自訂工具、Agent、Guardrail
- 替換 Session 儲存（Redis 等）
- 接入自己的 LLM Provider

### 5.3 Python-First：不用發明新範式

Agents SDK 沒有發明「Agent 編排語言」，而是**用 Python 本身的能力來表達 Agent 協作**：

- 用 `@tool` 裝飾器把 Python 函數變成工具（而不是發明新的工具定義格式）
- 用 `Agent.as_tool()` 把一個 Agent 變成另一個 Agent 的工具
- 用 `handoff()` 函數處理交接棒（而不是發明新的訊息協定）
- 用 Pydantic 做結構化輸入輸出（而不是發明新的 Schema 語言）

### 5.4 Provider-Agnostic：不綁定 OpenAI

雖然名字叫 "OpenAI Agents SDK"，但它實際上**不綁定 OpenAI**：

- 預設使用 OpenAI Responses API
- 支援 100+ LLM Provider（透過 any-llm 和 LiteLLM）
- 支援 Anthropic、Google、Mistral 等模型
- 自訂 provider 只需要實作統一的介面

### 5.5 Guardrails First：安全不是補丁

Guardrail 不是「後面再加的安全檢查」，而是**框架的一等公民**：

- Input/Output/Tool 三層 Guardrail 覆蓋所有檢查點
- 與 Agent 執行並行運行（不增加延遲）
- 支援 fail-fast 模式（Guardrail 失敗立即停止，不消耗 token）

## 六、觀點總結與啟示

### 觀點 1：多 Agent 協作的範式戰爭：Manager vs Handoff

當前多 Agent 系統有兩種主流範式：

| 範式 | 代表 | 特點 | 適用場景 |
|------|------|------|---------|
| **Manager（集中式）** | LangGraph、AutoGen | 中央 Agent 控制流程，工具呼叫子 Agent | 流程固定、需要強控制的場景 |
| **Handoff（去中心化）** | Agents SDK、Swarm | Agent 直接移交控制權，去中心化 | 靈活協作、角色分明的場景 |

Agents SDK **不選邊站**，同時支援兩種模式，讓開發者根據場景選擇。

### 觀點 2：「Python-First Agent 框架」是正確的產品方向

之前很多 Agent 框架（LangChain、AutoGen早期版本）的設計思路是「發明新的抽象層」。結果是：

- 學習曲線陡峭（新語言、新概念）
- 除錯困難（抽象層隱藏了真實執行）
- 綁定框架（換了框架要重寫）

Agents SDK 的 Python-First 設計意味著：**你用 Python 寫 Agent，Python 程式員不需要學習新東西**。這是把 Agent 開發工具從「研究員玩具」推向「工程師生產工具」的關鍵。

### 觀點 3：Guardrails 是 Agent 產品化的必要條件

當 Agent 進入生產環境，輸入輸出的安全性不再是可選項：

- 用戶可能注入惡意提示詞
- Agent 輸出可能洩露敏感資訊
- 工具呼叫可能超出預期範圍

Agents SDK 把 Guardrail 設計為框架核心（而非插件），是正確的優先級。**沒有 Guardrail 的 Agent 和沒有防火牆的伺服器一樣危險。**

### 觀點 4：Provider-Agnostic 是護城河

OpenAI 模型不是唯一的選項，也不是所有場景的最佳選擇：

- 簡單任務用 GPT-4o mini（便宜、快速）
- 複雜推理用 Claude（更強的推理能力）
- 程式碼任務用 Gemini（更長的上下文）

Agents SDK 的 Provider-Agnostic 意味著：**換模型不需要換框架**，這是避免 OpenAI 鎖定的關鍵。

### 觀點 5：Sandbox Agent 是程式碼 Agent 的正確形態

大多數「AI 程式設計 Agent」實際上是在一個共享的 REPL 裡運行程式碼——這既不安全（程式碼可以存取主機資源），也不可靠（狀態可能互相干擾）。

Sandbox Agent 的思路是：**每個 Agent 運行在獨立的隔離工作區**，程式碼操作的是沙箱內的檔案系統和工作目錄，不影響主機。這既更安全，也更可預測。

### 觀點 6：Tracing 基礎設施決定 Agent 開發效率

Agent 的執行路徑往往是非線性的（有循環、有條件分支、有工具呼叫），純靠 print 除錯幾乎不可能。

內建 Tracing + OpenAI 評估/微調/蒸餾工具鏈的整合，意味著：**除錯 Agent 不再是盲人摸象**，而是有了完整的執行鏈路記錄。這是 Agent 從「能用」到「可維護」的基礎設施。

### 觀點 7：開源 Agent 框架的「官方化」趨勢

OpenAI 發布 Agents SDK（而不是繼續維持 Swarm 實驗性專案），說明：

- 開源 Agent 框架不再只是第三方的事
- 官方框架會定義「最佳實踐標準」
- 其他框架（LangGraph、Mastra 等）需要差異化競爭

這對於整個 Agent 開源生態是好事：更多投入、更多標準、更多互操作性。

## 七、技術規格速覽

| 維度 | 規格 |
|------|------|
| 語言 | Python 3.10+ |
| 安裝 | `pip install openai-agents` |
| Agent 類型 | Text / Sandbox / Realtime / Voice |
| 工具類型 | Function tools / MCP tools / Hosted tools |
| 模型支援 | OpenAI Responses API + 100+ Provider |
| 安全機制 | Input/Output/Tool Guardrails |
| 編排模式 | Manager（集中式）/ Handoff（去中心化）|
| 會話管理 | 內建 Memory / Redis 可選 |
| 可觀測性 | 內建 Tracing |
| 生命週期鉤子 | RunHooks / AgentHooks |
| 結構化輸出 | Pydantic 模型 |
| Agent 復用 | `clone()` 方法 |

## 八、結語

OpenAI Agents SDK 的最大價值不是「又多了一個人 Agent 框架」，而是**用最少的概念做了最完整的事**。

它沒有發明複雜的 DSL，沒有引入奇怪的狀態機，沒有要求你學習新的配置格式。它只是：

- 用 Python 的 `@tool` 裝飾器做了工具
- 用 Python 的類和方法做了 Agent 的組合
- 用 Python 的異常處理做了 Guardrail
- 用 Python 的依賴注入做了 Context

這是對的。Agent 協作本來就不應該需要新語言，需要的是**把 Python 本身的能力用足**。

對於正在建構 Agent 應用的工程師，Agents SDK 提供了兩件事：**一個可以快速起步的框架，和一套可以被信任的生產就緒特性**。它目前的 Alpha 狀態意味著還會有變化，但它已經比 Swarm 成熟得多。

---

*專案地址：https://github.com/openai/openai-agents-python*
*文檔：https://openai.github.io/openai-agents-python/*
*前身：OpenAI Swarm（實驗性，已被 Agents SDK 取代）*
