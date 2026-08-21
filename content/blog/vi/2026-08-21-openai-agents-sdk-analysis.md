---
title: "OpenAI Agents SDK Phan Tich Sau: Khuon Khanh Da Agent Nhe"
date: "2026-08-21"
description: "Phan tich chuyen sau OpenAI/openai-agents-python: khuon khung workflow da agent nhe nhung manh me, ho tro OpenAI Responses API va 100+ LLM provider. Y tuong cot loi: du kha nang nhung it nguyen thuy. Python-First, tich hop Tracing, Sandbox Agent, Realtime Agent."
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
  - Phan tich chuyen sau
  - AI Agent
  - Khung nguon mo
---

# OpenAI Agents SDK Phan Tich Sau: Khuon Khanh Da Agent Nhung Manh Me

> Y tuong cot loi: **"Du kha nang, nhung it nguyen thuy"** — OpenAI Agents SDK khong chep mot giao thuc phuc tap nao moi, ma to chuc Agent bang chinh kha nang cua ngon ngu Python: coi Agent khac nhu tool (Agents as Tools), xu ly chuyen giao nhu goi ham (Handoffs), kiem tra bao mat nhu decorator (Guardrails). Day la ban nang cap san xuat cua Swarm (framework Agent thu nghiem he truoc cua OpenAI), nhung thanh thuc hon, thuc tien hon.

## I. Bong tai du an: Tu Swarm den Agents SDK

OpenAI Agents SDK la framework phat trien Agent bang Python duoc OpenAI phat hanh chinh thuc. Tien than cua no la **Swarm** — mot framework thu nghiem phat hanh nam 2024, kham pha huong di "dung cu phap Python de bieu dien bieu dien viec bieu dien viec bieu dien viec bieu dien viec bieu dien viec bieu dien Agent". Swarm khong bao gio la san pham production, nhung nhan dinh cot loi cua no — **"Hop tac giua cac Agent khong nen can paradigm lap trinh moi"** — da duoc Agents SDK ke thua va dua vao san pham hoan toan.

Agents SDK la **ban nang cap production cua huong di Swarm**:

- Swarm la thu nghiem (co bug, khong day du)
- Agents SDK san sang production (co test day du, tai lieu, Tracing)
- Swarm kham pha: hop tac nhieu Agent = goi ham + Handoff
- Agents SDK trien khai: dung nguyen thuy Python bieu dien workflow phuc tap

### Thong tin chi tiet du an

| Truong | Gia tri |
|--------|---------|
| Repository | https://github.com/openai/openai-agents-python |
| Ngon ngu | Python 3.10+ |
| Cai dat | `pip install openai-agents` hoac `uv add openai-agents` |
| Phu thuoc tuy chon | voice (giong noi), redis (luu tru session), docker (sandbox)|
| Giao thuc | Provider-agnostic (OpenAI + 100+ LLM)|
| Thu vien phu thuoc | Pydantic, MCP Python SDK, Griffe, uv, ruff |
| Ban quyen | Apache 2.0 hoac MIT |

### dinh vi mot cau

OpenAI Agents SDK la **khuon khung workflow da agent nhe, manh me, Python-First**: bieu dien hop tac da Agent tu don gian den phuc tap bang it nguyen thuy cot loi (Agent + Handoff + Guardrail), tich hop san Tracing de hien thi, ho tro Sandbox Agent de thuc thi cach ly, Realtime Agent de tuong tac bang giong noi.

## II. Nguyen thuy cot loi: Ba khai niem, mot khuon khung

Trien phong thiet ke cua Agents SDK la **"it la nhieu"**. Toan bo framework chi co ba nguyen thuy cot loi:

```
+----------------------------------------------------------+
|                    OpenAI Agents SDK                      |
|                                                            |
|  Agent = LLM + Huong dan + Cong cu + Guardrails           |
|                                                            |
|  Handoff = Giao quyen giua cac Agent                      |
|                                                            |
|  Guardrail = Kiem tra bao mat dau vao/ dau ra             |
+----------------------------------------------------------+
```

Ba nguyen thuy nay co the ket hop tu do, bieu dien moi loai workflow Agent tu don gian den phuc tap.

## III. Huong dan chi tiet: Tu Hello World den he thong production

### 3.1 Cai dat

```bash
# Cach 1: pip
pip install openai-agents

# Cach 2: uv (khuyen nghi, nhanh hon)
uv init
uv add openai-agents

# Ho tro giong noi
uv add 'openai-agents[voice]'

# Ho tro Redis session
uv add 'openai-agents[redis]'
```

### 3.2 Bat dau nhanh: Text Agent

Text Agent phu hop cho cac truong hop khong can ket noi realtime lien tuc hoac vung lam viec sandbox:

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

`Runner.run_sync()` la cach chay dong bo. Neu trong Jupyter Notebook, khuyen nghi su dung async hoac chay truc tiep cell (SDK co ho tro Jupyter san).

### 3.3 Huong dan trung cap: Agent voi Cong cu

Su dung decorator `@tool` de bien bat ky ham Python nao thanh cong cu ma Agent co the goi:

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

Cong cu ho tro tao schema tu dong Pydantic va xac thuc tham so, dam bao Agent goi cong cu voi kieu tham so an toan.

### 3.4 Dieu phoi nhieu Agent: Che do Manager va Che do Handoffs

Day la quyet dinh thiet ke quan trong nhat.

#### 4A. Che do Manager (Agent la Cong cu)

Mot Agent quan tri vien trung tam kiem soat cuoc tro chuyen, su dung cong cu de goi cac sub-agent chuyen mon:

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

Dac diem: **Kiem soat tap trung**, Agent quan tri vien quyet dinh khi nao goi Agent chuyen mon nao, ket qua tra ve cho quan tri vien roi tiep tuc cuoc tro chuyen.

#### 4B. Che do Handoffs (Phi tap trung)

Cac sub-agent truc tiep nhan quyen kiem soat cuoc tro chuyen, phi tap trung hon:

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

Dac diem: **Phi tap trung**, Agent co the chuyen quyen kiem soat cuoc tro chuyen hoan toan cho Agent khac, Agent kia thay day du lich su cuoc tro chuyen va tiep tuc dieu khien.

### 3.5 Guardrails: Kiem tra bao mat dau vao va dau ra

Guardrails la "nguoi giam sat bao mat" cua Agent, co the chay xac minh truoc/sau khi Agent thuc thi:

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

# Thu trigger guardrail
try:
    await Runner.run(agent, "Help me solve: 2x + 3 = 11")
except InputGuardrailTripwireTriggered:
    print("Math homework guardrail tripped!")
```

Guardrails ho tro ba loai:

| Loai | Thoi diem trigger | Muc dich |
|------|-------------------|----------|
| Input Guardrail | Truoc khi Agent dau tien thuc thi | Loc noi dung, kiem tra quyen, chan dau vao doc hai |
| Output Guardrail | Sau khi Agent cuoi cung xuat ra | Kiem tra tinh tuyen, loc thong tin nhay cam |
| Tool Guardrail | Truoc/sau moi lan goi cong cu | Bao ve API Key, an danh dau ra |

### 3.6 Sandbox Agent: Vung lam viec cach ly

Khi Agent can kiem tra tap tin, chay lenh, luu trang thai vung lam viec, su dung SandboxAgent:

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

Ho tro cac sandbox client:

- `UnixLocalSandboxClient` (macOS/Linux nguyen thuy)
- `DockerSandboxClient` (Windows hoac da nen tang)
- Managed sandbox client (cloud)

### 3.7 Realtime Agent: Tuong tac giong noi

Agent giong noi dua tren WebSocket voi do tre thap:

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

### 3.8 Voice Pipeline: Dong san xuat giong noi

Day la dong san xuat day du tu giong noi sang van ban sang Agent sang van ban sang giong noi:

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

## IV. Giai thich du an: Kien truc va thanh phan cot loi

### 4.1 Cau hinh cot loi cua Agent

```python
Agent(
    name="Agent Name",                    # Bat buoc: Ten Agent doc duoc
    instructions="...",                  # Khuyen nghi manh: System prompt
    model="gpt-5-nano",                   # Tuy chon: Chi dinh model, mac dinh la OpenAI
    tools=[...],                          # Tuy chon: Danh sach cong cu Agent co the goi
    handoffs=[...],                       # Tuy chon: Danh sach sub-agent co the chuyen
    input_guardrails=[...],               # Tuy chon: Kiem tra bao mat dau vao
    output_guardrails=[...],              # Tuy chon: Kiem tra bao mat dau ra
    output_type=MyModel,                 # Tuy chon: Dau ra cau truc (Pydantic model)
    hooks=MyHooks(),                     # Tuy chon: Hook chu ky song
    mcp_servers=[...],                    # Tuy chon: MCP server
    model_settings=ModelSettings(...)    # Tuy chon: Dieu chinh model (temperature, etc.)
)
```

### 4.2 Context: Tiêm dep tra cu dependency

Context la cong cu tiêm dep (dependency injection), co the chia se trang thai giua Agent, cong cu va Handoff:

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

# Context duoc truyen khi Runner.run()
result = await Runner.run(
    agent,
    "What did I buy?",
    context=UserContext(name="Alice", uid="123", is_pro_user=True)
)
```

### 4.3 Structured Outputs: Dau ra cau truc

Mac dinh Agent xuat ra van ban thuan tuyen. Neu can du lieu cau truc, su dung Pydantic model:

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

Ben trong su dung OpenAI Structured Outputs API, dam bao dau ra tuan theo Schema ngan ngat.

### 4.4 Lifecycle Hooks: Hook chu ky song

Hooks cho phep theo doi va can thiep vao chu ky thuc thi cua Agent:

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

Cac loai Hook:

| Hook | Thoi diem trigger |
|------|-------------------|
| `on_agent_start` | Mot Agent bat dau chay |
| `on_agent_end` | Mot Agent tao dau ra cuoi |
| `on_llm_start/end` | Truoc/sau moi lan goi model |
| `on_tool_start/end` | Truoc/sau moi lan goi cong cu |
| `on_handoff` | Quyen dieu khien chuyen tu Agent nay sang Agent khac |

### 4.5 Tracing: Kha nang quan sat tich hop san

Agents SDK co Tracing tich hop san, ho tro hien thi, go loi va giam sat workflow Agent:

- Tich hop voi cong cu danh gia, fine-tune, distill cua OpenAI
- Co the quan sat moi Agent, loi goi cong cu, Handoff duoc thuc thi
- Ho tro custom trace exporter

## V. Triet ly thiet ke: Nam nguyen tac cot loi

### 5.1 Du manh, nhung it nguyen thuy

Nguyen tac thiet ke thu nhat cua OpenAI Agents SDK la: **"Co dac diem du su dung, nhung nguyen thuy it, duoc thiet ke de nguoi dung hoc nhanh"**.

 Dieu nay co nghia:
- Ban khong can hoc DSL moi hay dinh dang cau hinh moi
- Ban viet Agent bang Python, giong nhu viet ma Python binh thuong
- Hanh vi phuc tap duoc bieu dien qua viec ket hop cac nguyen thuy, khong phai them loai nguyen thuy moi

### 5.2 San sang su dung, nhung co the tuy chinh chinh xac

Nguyen tac thiet ke thu hai la: **"San sang su dung, nhung ban hoan toan co the tuy chinh nhung gi xay ra"**.

Cau hinh mac dinh da co the hoat dong tot:
- Mac dinh su dung OpenAI Responses API
- Mac dinh Quan ly Session lich su cuoc tro chuyen
- Mac dinh Tracing ghi lai qua trinh thuc thi

Nhung ban co the dieu khe chinh xac o moi lop:
- Tuy chinh cong cu, Agent, Guardrail
- Thay the luu tru Session (Redis, etc.)
- Ket noi LLM Provider cua ban

### 5.3 Python-First: Khong phai invented paradigm moi

Agents SDK khong invented "ngon ngu bieu dien Agent", ma **su dung chinh kha nang cua Python de bieu dien viec bieu dien**:

- Dung `@tool` decorator de bien ham Python thanh cong cu (thay vi invented dinh dang dinh nghia cong cu moi)
- Dung `Agent.as_tool()` de bien mot Agent thanh cong cu cho Agent khac
- Dung ham `handoff()` de xu ly chuyen giao (thay vi invented giao thuc tin nhan moi)
- Dung Pydantic de xu ly dau vao/ra cau truc (thay vi invented ngon ngu Schema moi)

### 5.4 Provider-Agnostic: Khong bi rang buoc voi OpenAI

Du ten no la "OpenAI Agents SDK", nhung thuc te **nó khong bi rang buoc voi OpenAI**:

- Mac dinh su dung OpenAI Responses API
- Ho tro 100+ LLM Provider (qua any-llm va LiteLLM)
- Ho tro Anthropic, Google, Mistral va cac model khac
- Provider tuy chinh chi can implement giao dien thong nhat

### 5.5 Guardrails First: Bao mat khong phai la patch

Guardrail khong phai "kiem tra bao mat them sau", ma **la cong dan chinh thu nhat cua framework**:

- Ba lop Input/Output/Tool Guardrail phu het moi diem kiem tra
- Chay song song voi thuc thi Agent (khong tang do tre)
- Ho tro che do fail-fast (Guardrail that bai dung ngay, khong tieu ton token)

## VI. Tom tat quan diem va su hieu tri

### Quan diem 1: Cuoc chien paradigm nhieu Agent: Manager vs Handoff

Hien tai co hai paradigm chinh cho he thong nhieu Agent:

| Paradigm | Dai dien | Dac diem | Truong hop su dung |
|----------|----------|----------|---------------------|
| **Manager (Tap trung)** | LangGraph, AutoGen | Agent trung tam kiem soat quy trinh, goi sub-agent bang cong cu | Quy trinh co dinh, can kiem soat manh |
| **Handoff (Phi tap trung)** | Agents SDK, Swarm | Agent truc tiep chuyen quyen, phi tap trung | Hop tac linh hoat, vai tro ro rang |

Agents SDK **khong chon bên**, dong thoi ho tro hai che do, cho phep lap trinh vien lua chon theo truong hop.

### Quan diem 2: "Khuon khung Agent Python-First" la huong san pham dung

Nhieu khuon khung Agent truoc do (LangChain, phien ban dau cua AutoGen) co huong thiet ke "invented lop truu tuong moi". Ket qua la:

- Duong cong hoc doc (ngon ngu moi, khai niem moi)
- Go loi kho (lop truu tuong an di thuc thi that)
- Rang buoc framework (doi framework phai viet lai)

Thiet ke Python-First cua Agents SDK co nghia: **Ban viet Agent bang Python, lap trinh vien Python khong can hoc cai moi**. Day la buoc quan trong de dua cong cu phat trien Agent tu "do choi nghien cuu vien" thanh "cong cu san xuat ky su".

### Quan diem 3: Guardrails la dieu kien tien quyet de san pham hoa Agent

Khi Agent di vao moi truong production, bao mat dau vao/ra khong con la tuy chon:

- Nguoi dung co the tien hanh tan cong prompt injection
- Dau ra cua Agent co the ro rong thong tin nhay cam
- Loi goi cong cu co the vuot qua pham vi du kien

Agents SDK dat Guardrail thanh thanh phan cot loi cua framework (khong phai plugin), la uu tien dung. **Agent khong co Guardrail cung nguy hiem nhu server khong co firewall.**

### Quan diem 4: Provider-Agnostic la hau vu

Model OpenAI khong phai tuy chon duy nhat, cung khong phai la tot nhat cho moi truong hop:

- Cong viec don gian dung GPT-4o mini (re, nhanh)
- Su ly bai toan phuc tap dung Claude (kha nang suy luan manh hon)
- Vien may can dung Gemini (bo nho dai hon)

Provider-Agnostic cua Agents SDK co nghia: **Doi model khong can doi framework**, day la dieu kien then chot de tranh bi rang buoc voi OpenAI.

### Quan diem 5: Sandbox Agent la hinh thuc dung cho Agent viet ma

Phan lon "AI Programming Agent" thuc ra chay ma trong REPL chia se — điều này vừa không an toàn (ma co the truy cap tai nguyen may chu), vừa không đáng tin cậy (trạng thái có thể can thiệp lẫn nhau).

Y tuong Sandbox Agent là: **Moi Agent chay trong vung lam viec cach ly rieng biệt**, ma thao tac tren he thong tap tin trong sandbox va thu muc lam viec, khong anh huong may chu. Điều này vừa an toàn hơn, vừa có thể dự đoán được.

### Quan diem 6: Ha tang Tracing quyet dinh hieu suat phat trien Agent

Duong dan thuc thi Agent thuong phi tuyen (co vong lap, nhanh cua, loi goi cong cu), chi靠 print调试几乎不可能。

Tracing tich hop san + tich hop voi he thong danh gia/fine-tune/distill cua OpenAI, co nghia: **Go loi Agent khong con nhu mu man mo**, ma co the ghi lai day du lich su thuc thi. Đây la ha tang de Agent di tu "co the su dung" den "co the bao tri".

### Quan diem 7: Xu huong "chinh thuc hoa" cua framework Agent nguon mo

OpenAI phat hanh Agents SDK (thay vi tiep tuc duy tri Swarm la du an thu nghiem), cho thay:

- Framework Agent nguon mo khong con la viec cua ben thu ba
- Framework chinh thuc se dinh nghia "tieu chuan thuc hanh tot nhat"
- Cac framework khac (LangGraph, Mastra, etc.) can coi cuoc thi差异化竞争

Điều này tot cho toan bo he sinh thai Agent nguon mo: nhieu dau tu hon, nhieu tieu chuan hon, nhieu kha nang tuong thich hon.

## VII. Tom tat thong so ky thuat

| Kich thuoc | Thong so |
|-------------|----------|
| Ngon ngu | Python 3.10+ |
| Cai dat | `pip install openai-agents` |
| Loai Agent | Text / Sandbox / Realtime / Voice |
| Loai cong cu | Function tools / MCP tools / Hosted tools |
| Ho tro model | OpenAI Responses API + 100+ Provider |
| Co che bao mat | Input/Output/Tool Guardrails |
| Che do bieu dien | Manager (tap trung) / Handoff (phi tap trung)|
| Quan ly session | Memory tich hop / Redis tuy chon |
| Kha nang quan sat | Tracing tich hop san |
| Hook chu ky song | RunHooks / AgentHooks |
| Dau ra cau truc | Pydantic model |
| Tai su dung Agent | Phuong thuc `clone()` |

## VIII. Ket luan

Gia tri lon nhat cua OpenAI Agents SDK khong phai "them mot framework Agent nua", ma **lam day du nhung thu can thiet voi it khai niem nhat**.

No khong invented DSL phuc tap, khong dua vao may trang thai strange, khong yeu cau ban hoc dinh dang cau hinh moi. No chi:

- Dung `@tool` decorator cua Python de lam cong cu
- Dung lop va phuong thuc Python de to hop Agent
- Dung xu ly ngoai le cua Python de lam Guardrail
- Dung tiêm dep cua Python de lam Context

Điều này la dung. Hop tac Agent vốn không can ngon ngu moi, can **su dung tot kha nang cua chinh Python**.

Voi ky su dang xay dung ung dung Agent, Agents SDK cung cap hai thu: **một khuon khung co the bat dau nhanh, va mot bo dac diem san sang duoc tin tuong production**. Trang thai Alpha hien tai co nghia la van con thay doi, nhung no da truong thanh hon nhieu so voi Swarm.

---

*Địa chỉ dự án: https://github.com/openai/openai-agents-python*
*Tài liệu: https://openai.github.io/openai-agents-python/*
*Tiền thân: OpenAI Swarm (thử nghiệm, đã bị Agents SDK thay thế)*
