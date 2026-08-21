---
title: "OpenAI Agents SDK 深掘り：軽量マルチエージェントワークフロー"
date: "2026-08-21"
description: "OpenAI/openai-agents-python の深掘り解析。軽量で強力なマルチエージェントワークフローフレームワーク。OpenAI Responses API と 100+ LLM Provider をサポート。核心のアイデア：十分な機能、极少のプリミティブ。Python-First 設計。"
tags:
  - OpenAI Agents SDK
  - マルチエージェント
  - Handoffs
  - Guardrails
  - Python
  - Swarm
  - MCP
  - Agent Orchestration
categories:
  - 深度解析
  - AI Agent
  - オープンソースフレームワーク
---

# OpenAI Agents SDK 深掘り：軽量マルチエージェントワークフロー

> 核心思想：**「十分な機能、非常に少数のプリミティブ」** ——OpenAI Agents SDK は複雑な新概念を発明するのではなく、Python 言語本身的능력を使って Agent を組織化する：他の Agent をツールとして扱う（Agents as Tools）、バトンパスを関数呼び出しとして実装する（Handoffs）、セキュリティチェックをデコレータとして組み込む（Guardrails）。これは Swarm（OpenAI の前世代実験的 Agent フレームワーク）のプロダクション対応アップグレード版であり、Swarm よりも抑制的で実用的である。

## 一、プロジェクト背景：Swarm から生産対応SDKへ

OpenAI Agents SDK は、OpenAI が公式に公開した Python Agent 開発フレームワークである。その前身は **Swarm** —— 2024年にリリースされた実験的フレームワークで、「Python 構文を使ってマルチエージェント協調を編成する」というアプローチを探求していた。Swarm は決してプロダクション向け製品ではなかったが、その核心的な洞察——「Agent 協調には新しいプログラミングパラダイムは不要」——は、Agents SDK に完全に継承され、プロダクション化された。

Agents SDK は Swarm の思路の**プロダクション対応アップグレードバージョン**である：

- Swarm は実験的（バグあり、不完全）
- Agents SDK はプロダクション対応（完全なテスト、ドキュメント、Tracing を搭載）
- Swarm が探求した方向：マルチエージェント協調 = 関数呼び出し + Handoff
- Agents SDK が実現した方向：Python のプリミティブで複雑なワークフローを表現

### プロジェクト基本情報

| 項目 | 値 |
|------|-----|
| リポジトリ | https://github.com/openai/openai-agents-python |
| 言語 | Python 3.10+ |
| インストール | `pip install openai-agents` または `uv add openai-agents` |
| オプショナル依存 | voice（音声）、redis（セッション永続化）、docker（サンドボックス）|
| プロトコル | Provider-agnostic（OpenAI + 100+ LLM）|
| 依存ライブラリ | Pydantic、MCP Python SDK、Griffe、uv、ruff |
| ライセンス | Apache 2.0 または MIT |

### 一言で表すなら

OpenAI Agents SDK は**軽量で機能强大、Python-First のマルチエージェントワークフローフレームワーク**である。非常に少数のコアプリミティブ（Agent + Handoff + Guardrail）で複雑なマルチエージェント協調を表現でき、内蔵の Tracing 可視化と Sandbox Agent 分離実行環境をサポートする。

## 二、コアプリミティブ：3つの概念、1つのフレームワーク

Agents SDK の設計哲学は**「Less is More（Less は Moreなり）」**である。フレームワーク全体を通じて、コアプリミティブはわずか3つしかない：

```
┌──────────────────────────────────────────────┐
│           OpenAI Agents SDK                   │
│                                              │
│  Agent = LLM + Instructions + ツール + Guardrails│
│                                              │
│  Handoff = Agent 間のバトンパス               │
│                                              │
│  Guardrail = 入力/出力のセキュリティチェック  │
└──────────────────────────────────────────────┘
```

この3つのプリミティブは自由に組み合わせることで、シンプルから複雑まですべての Agent ワークフローを表現できる。

## 三、詳細チュートリアル：Hello World からプロダクションシステムまで

### 3.1 インストール

```bash
# 方法1：pip
pip install openai-agents

# 方法2：uv（推奨、より高速）
uv init
uv add openai-agents

# 音声サポート
uv add 'openai-agents[voice]'

# Redis セッションサポート
uv add 'openai-agents[redis]'
```

### 3.2 クイックスタート：Text Agent

Text Agent は、永続的なリアルタイム接続やサンドボックスワークスペースが不要シナリオに適している：

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

`Runner.run_sync()` は同期的実行方式である。Jupyter Notebook で実行する場合は、async 方式またはセル直接実行が推奨される（SDK は Jupyter サポートを内置）。

### 3.3 中級チュートリアル：ツール付き Agent

`@tool` デコレータを使って、任意の Python 関数を Agent が呼び出せるツールに変換する：

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

ツールは Pydantic 驱动的自動スキーマ生成とパラメータバリデーションをサポートし、Agent がツールを呼び出す際の型安全を保証する。

### 3.4 マルチ Agent オーケストレーション：Manager モード vs Handoffs モード

これが最も重要な設計判断である。

#### 4A. Manager モード（Agents as Tools）

1つのセントラルマネージャー Agent が会話を掌控し、ツール呼び出しで専門の子 Agent を使用する：

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

特徴：**集中制御**、マネージャー Agent がいつどの専門家 Agent を呼び出すかを決定し、呼び出し結果はマネージャーーに返されてから会話を継続する。

#### 4B. Handoffs モード（分散型）

子 Agent が直接会話制御権を獲得し、より分散型である：

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

特徴：**分散型**、Agent は会話制御権を完全に別の Agent に转移でき、后者は完全な会話履歴を見て会話を主导する。

### 3.5 Guardrails：入力・出力セキュリティチェック

Guardrails は Agent の「セキュリティ門番」であり、Agent 実行前/後にバリデーションを実行できる：

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

# guardrail をトリガーしようとする
try:
    await Runner.run(agent, "Help me solve: 2x + 3 = 11")
except InputGuardrailTripwireTriggered:
    print("Math homework guardrail tripped!")
```

Guardrails は3種類をサポート：

| 種類 | トリガータイミング | 用途 |
|------|---------|------|
| Input Guardrail | 最初の Agent 実行前 | コンテンツフィルタリング、権限チェック、悪意ある入力遮断 |
| Output Guardrail | 最終 Agent 出力後 | コンプライアンスチェック、機密情報フィルタリング |
| Tool Guardrail | 各ツール呼び出し前後 | API キー保護、出力マスキング |

### 3.6 Sandbox Agent：分離ワークスペース実行

Agent がファイルのチェック、コマンド実行、ワークスペース状態の保存必要がある場合に SandboxAgent を使用する：

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

サポート対象のサンドボックスクライアント：

- `UnixLocalSandboxClient`（macOS/Linux ネイティブ）
- `DockerSandboxClient`（Windows またはクロスプラットフォーム）
- ホスト型サンドボックスクライアント（クラウド）

### 3.7 Realtime Agent：音声インタラクション

WebSocket ベースの低遅延音声 Agent：

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

### 3.8 Voice Pipeline：音声パイプライン

音声 → 文字起こし → Agent → 文字 → 音声の完全なパイプライン：

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

## 四、アーキテクチャとコアコンポーネント

### 4.1 Agent のコア設定

```python
Agent(
    name="Agent Name",                    # 必須：人間可読の Agent 名
    instructions="...",                  # 強く推奨：システムプロンプト
    model="gpt-5-nano",                   # オプショナル：モデル指定（デフォルトは OpenAI）
    tools=[...],                          # オプショナル：Agent が呼び出せるツールリスト
    handoffs=[...],                       # オプショナル：バトンパス可能な子 Agent リスト
    input_guardrails=[...],               # オプショナル：入力セキュリティチェック
    output_guardrails=[...],              # オプショナル：出力セキュリティチェック
    output_type=MyModel,                 # オプショナル：構造化出力（Pydantic モデル）
    hooks=MyHooks(),                     # オプショナル：ライフサイクルフック
    mcp_servers=[...],                    # オプショナル：MCP サーバー
    model_settings=ModelSettings(...)    # オプショナル：モデル微調整（temperature など）
)
```

### 4.2 Context：依存性注入

Context は依存性注入ツールであり、Agent、ツール、Handoff 間で状態を共有できる：

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

# Context は Runner.run() 時に渡す
result = await Runner.run(
    agent,
    "What did I buy?",
    context=UserContext(name="Alice", uid="123", is_pro_user=True)
)
```

### 4.3 Structured Outputs：構造化出力

デフォルトでは Agent 出力はプレーンテキストである。構造化データが必要な場合は、Pydantic モデルを使用する：

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

 내부적으로は OpenAI の Structured Outputs API を使用して、出力形式が Schema に厳密に準拠することを保証する。

### 4.4 Lifecycle Hooks：ライフサイクルフック

Hooks を使用すると、Agent の実行ライフサイクルを監視・干渉できる：

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

フックタイプ：

| フック | トリガータイミング |
|------|---------|
| `on_agent_start` | 特定の Agent が実行を開始 |
| `on_agent_end` | 特定の Agent が最終出力を生成 |
| `on_llm_start/end` | 各モデル呼び出しの前後 |
| `on_tool_start/end` | 各ツール呼び出しの前後 |
| `on_handoff` | 制御権が1つの Agent から別の Agent に转移 |

### 4.5 Tracing：内置オブザーバビリティ

Agents SDK は Tracing を内置し、Agent ワークフローの可視化、デバッグ、モニタリングをサポート：

- OpenAI の評価、微調整、蒸留ツールチェーンとの統合
- 各 Agent、ツール呼び出し、Handoff の実行状況を観察可能
- カスタム trace exporter をサポート

## 五、設計哲学：5つのコア原則

### 5.1 十分に强大だが、プリミティブは極めて少数

OpenAI Agents SDK の最初の設計原則は：**「使用する價值十分な機能を持ちながら、プリミティブは極めて少数で、学習コストが低い」** である。

これはつまり：
- 新しい DSL や設定フォーマットを学ぶ必要はない
- Python で Agent を書く、まるで普通の Python コードを書くように
- 複雑な動作は新しいプリミティブ类型を追加するのではなく、プリミティブの組み合わせで表現

### 5.2 箱から出してすぐに使えるが、精密なカスタマイズも可能

2番目の設計原則は：**「箱から出してすぐに使えるが、何が起こるかを完全にカスタマイズ可能」** である。

デフォルト設定でも十分に動作する：
- デフォルトで OpenAI Responses API を使用
- デフォルトで Session が会話履歴を管理
- デフォルトで Tracing が実行 과정을記録

しかし、各レベルで精密に制御できる：
- カスタムツール、Agent、Guardrail
- Session ストレージの置換（Redis など）
- 独自の LLM Provider への接続

### 5.3 Python-First：新しいパラダイムを発明しない

Agents SDK は「Agent オーケストレーション言語」を发明するのではなく、**Python そのものの能力を使って Agent 協調を表現する**：

- `@tool` デコレータで Python 関数をツールに変換（新しいツール定義フォーマットを発明しない）
- `Agent.as_tool()` で1つの Agent を別の Agent のツールに変換
- `handoff()` 関数でバトンパスを処理（新しいメッセージプロトコルを发明しない）
- Pydantic で構造化入出力を処理（新しいスキーマ言語を発明しない）

### 5.4 Provider-Agnostic：OpenAI にバインドされない

「OpenAI Agents SDK」という名前だが、実際には**OpenAI にバインドされていない**：

- デフォルトで OpenAI Responses API を使用
- 100+ の LLM Provider をサポート（any-llm と LiteLLM 経由）
- Anthropic、Google、Mistral などのモデルをサポート
- カスタム provider は統一されたインターフェースを実装するだけでよい

### 5.5 Guardrails First：セキュリティは後付けの补丁ではない

Guardrail は「後で追加するセキュリティチェック」ではなく、**フレームワークの一等市民**である：

- Input/Output/Tool の3層 Guardrail がすべてのチェックポイントをカバー
- Agent 実行と並行して実行（遅延を増加させない）
- fail-fast モードをサポート（Guardrail 失敗時は即座に停止、token を消費しない）

## 六、重要な見解：7つのポイント

### 見解 1：マルチエージェント協調のパラダイム戦争：Manager vs Handoff

現在のマルチエージェントシステムには2つの主流パラダイムがある：

| パラダイム | 代表 | 特徴 | 適用シナリオ |
|------|------|------|---------|
| **Manager（集中型）** | LangGraph、AutoGen | 中央 Agent が流程を制御、ツール呼び出しで子 Agent を使用 | 流程が固定、強制御が必要なシナリオ |
| **Handoff（分散型）** | Agents SDK、Swarm | Agent が直接制御権を转移、分散型 | 柔軟な協調、役割が明確なシナリオ |

Agents SDK は**どちらにも偏らない**。両モードを同時にサポートし、開発者がシナリオに応じて選択できる。

### 見解 2：「Python-First Agent フレームワーク」は正しい製品方向

従来の多くの Agent フレームワーク（LangChain、AutoGen 初期バージョン）の設計思路は「新しいつ抽象層を発明する」であった。結果は：

- 学習コストが高い（新言語、新概念）
- デバッグが困難（抽象層が 실제実行を隠す）
- フレームワークへのロックイン（フレームワークを替えると書き直し）

Agents SDK の Python-First 設計は意味すること：**Python で Agent を書き、Python プログラマーは新しいことを学ぶ必要がない**。これは Agent 開発ツールを「研究者の玩具」から「エンジニアのプロダクション道具」に押し上げる鍵である。

### 見解 3：Guardrails は Agent 製品化の必須条件

Agent がプロダクション環境に入ると、入力出力のセキュリティはもうオプションではない：

- ユーザーが悪意のあるプロンプトを挿入する可能性がある
- Agent 出力が機密情報を漏洩する可能性がある
- ツール呼び出しが予想範囲を超える可能性がある

Agents SDK が Guardrail をフレームワークコア（而非プラグイン）として設計したのは、正しい優先順位である。**Guardrail なしの Agent は、ファイアウォールなしのサーバーと同じくらい危険である。**

### 見解 4：Provider-Agnostic は川の護岸

OpenAI モデルが唯一のオプションではなく、すべてのシナリオに最適でもない：

- 単純なタスクには GPT-4o mini（安い、快速）
- 複雑な推論には Claude（より強い推論能力）
- コードタスクには Gemini（より長いコンテキスト）

Agents SDK の Provider-Agnostic は意味すること：**モデルを変えてもフレームワークを変える必要はない**。これは OpenAI ロックインを避ける鍵である。

### 見解 5：Sandbox Agent はコード Agent の正しい形態

 대부분의「AI プログラミング Agent」は实际上共有の REPL でコードを実行している——これは安全でもなく（コードがホストリソースにアクセス可能）、信頼性も低い（状態が互いに干渉する可能性がある）。

Sandbox Agent の思路は：**各 Agent が独立した分離ワークスペースで実行される**、コードが操作するのはサンドボックス内のファイルシステムと作業ディレクトリであり、ホストに影響しない。これはより安全で、より予測可能である。

### 見解 6：Tracing インフラストラクチャが Agent 開発効率を決める

Agent の実行パスは多くの場合非線形である（ループ、条件分岐、ツール呼び出しがある）。print デバッグだけではほぼ不可能である。

内置 Tracing + OpenAI 評価/微調整/蒸留ツールチェーンの統合は意味すること：**Agent のデバッグはもう「 Yadon 摸索」ではなく、完全な実行リンケージ記録が得られる**。これは Agent が「使える」から「保守可能」になるためのインフラストラクチャである。

### 見解 7：オープンソース Agent フレームワークの「公式化」トレンド

OpenAI が Agents SDK を公開した（Swarm 実験的プロジェクトを維持するのではなく）は、次を意味する：

- オープンソース Agent フレームワークはもう第三方だけの事ではない
- 公式フレームワークが「ベストプラクティス標準」を定義する
- 他のフレームワーク（LangGraph、Mastra など）は差別化競争が必要

これは Agent オープンソースエコシステム全体にとって良いことである：更多の投資、更多の標準、更多の相互運用性。

## 七、技術仕様早見表

| 項目 | 仕様 |
|------|------|
| 言語 | Python 3.10+ |
| インストール | `pip install openai-agents` |
| Agent タイプ | Text / Sandbox / Realtime / Voice |
| ツールタイプ | Function tools / MCP tools / Hosted tools |
| モデルサポート | OpenAI Responses API + 100+ Provider |
| セキュリティ機構 | Input/Output/Tool Guardrails |
| オーケストレーションモード | Manager（集中型）/ Handoff（分散型）|
| セッション管理 | 内蔵 Memory / Redis オプショナル |
| オブザーバビリティ | 内蔵 Tracing |
| ライフサイクルフック | RunHooks / AgentHooks |
| 構造化出力 | Pydantic モデル |
| Agent 再利用 | `clone()` メソッド |

## 八、結語

OpenAI Agents SDK の最大価値は「また1つ Agent フレームワークが増えた」ではなく、**最も少ない概念で、最も完全なことを達成した**点にある。

複雑な DSL を发明せず、おかしな状態機械を導入せず、新しい設定フォーマットを学ぶよう要求することもなかった。ただ単に：

- Python の `@tool` デコレータでツールを実現
- Python のクラスとメソッドで Agent の組合を実現
- Python の例外処理で Guardrail を実現
- Python の依存性注入で Context を実現

これが正しい。Agent 協調には本来新しい言語は不要であり、**Python そのものの能力を十分に活かすこと**が必要だ。

Agent アプリケーションを構築中のエンジニアにとって、Agents SDK は2つのことを提供する：**快速に立ち上がるためのフレームワークと、プロダクション対応として信頼可能な一連の機能**。現在の Alpha 状态は変化があることを意味しますが、Swarm よりもはるかに成熟している。

---

*プロジェクトアドレス：https://github.com/openai/openai-agents-python*
*ドキュメント：https://openai.github.io/openai-agents-python/*
*前身：OpenAI Swarm（実験的、Agents SDK に置き換え済み）*
