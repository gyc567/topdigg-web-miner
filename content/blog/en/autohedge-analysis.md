---
slug: autohedge-analysis
title: "AutoHedge: Architecture Analysis and Hands-On Tutorial of a Multi-Agent Autonomous Hedge Fund"
description: "In-depth analysis of AutoHedge — a multi-agent autonomous hedge fund built on the swarms framework. Covers: the Director/Quant/Risk/Execution/Sentiment agent pipeline, risk-first design philosophy, the Solana execution path (Jupiter Ultra API), a detailed installation and configuration tutorial, Python API and CLI usage, plus a summary of the project's strengths, limitations, and applicable scenarios."
date: "2026-09-07"
author: "TopDigg"
tags: ["AutoHedge", "Multi-Agent", "AI Agent", "Hedge Fund", "Trading", "Swarms", "Solana", "Risk Management", "Quantitative Trading", "LLM"]
categories: ["Deep Dive"]
keywords: ["AutoHedge", "Multi-Agent", "Hedge Fund", "AI Agent", "Autonomous Trading", "Swarms Framework", "Risk Management", "Solana", "Jupiter", "Quantitative Trading", "Design Philosophy", "Trading Pipeline"]
---

# AutoHedge: Architecture Analysis and Hands-On Tutorial of a Multi-Agent Autonomous Hedge Fund

> Core idea: **replicate the organizational structure of a hedge fund with a set of specialized AI agents.** AutoHedge maps five roles — portfolio manager, quantitative researcher, risk manager, execution trader, and sentiment analyst — onto five LLM agents, chained by structured handoffs into one trading pipeline: the Director generates the thesis, the Quant validates it numerically, Risk sizes the position, and Execution produces the order. Roughly 1,600 lines of code make it a readable specimen for studying "LLM organization."

**Risk notice: this is experimental open-source software in Beta. This article is a technical analysis only and is not investment advice. Assess risk and regulatory compliance yourself before running any automated trading system with real funds.**

## 1. Project Overview

### 1.1 One-line pitch

**AutoHedge is an enterprise-grade autonomous agent hedge fund: it uses swarm intelligence to coordinate specialized AI agents that perform end-to-end market analysis, risk management, and trade execution with minimal human intervention.**

### 1.2 Project metadata

| Field | Value |
|-------|-------|
| GitHub | [The-Swarm-Corporation/AutoHedge](https://github.com/The-Swarm-Corporation/AutoHedge) |
| Developer | The Swarm Corporation (author: Kye Gomez) |
| License | MIT |
| Language | Python 3.10+ |
| Version | 0.1.5 (Beta) |
| Core dependencies | swarms, swarm-models, pydantic, loguru, httpx, solders, yfinance, rich |
| Venues | Solana (full support); Coinbase (in development); other CEXs (roadmap) |
| Framework | [Swarms](https://github.com/The-Swarm-Corporation/swarms) |

### 1.3 Capability boundary

- Supported: multi-agent thesis generation, quantitative and sentiment analysis, position sizing and risk assessment, order parameter generation, Solana on-chain token queries and swaps (Jupiter Ultra API), interactive REPL console.
- Not supported: backtesting engine, account-level hard risk limits, production order management system (OMS), multi-account portfolio management.

The project is early-stage. The trade logs in `logs/` come from market-making scripts under `experimental/`, not from the main system's live output.

## 2. Architecture

### 2.1 Five specialized agents

`autohedge/workers.py` defines every agent. Each agent consists of a system prompt (`prompts.py`), a model, and a tool set.

| Agent | Model | Responsibility | Human counterpart |
|-------|-------|----------------|-------------------|
| Trading-Director | gpt-4.1 | Generates market theses, discovers tickers from the task, orchestrates downstream agents | Portfolio manager |
| Quant-Analyst | gpt-4.1 | Technical indicators, statistical patterns, VaR/ES risk metrics, trade success probability | Quant researcher |
| Risk-Manager | gpt-4.1 | Position sizing, max drawdown, market risk exposure, overall risk score | Risk manager |
| Execution-Agent | gpt-4.1 | Order type, quantity, entry price, stop loss, take profit, time in force | Execution trader |
| Sentiment-Agent | gpt-4o-mini | News/social sentiment scores (0-1), theme identification, contrarian signals | Sentiment analyst |

### 2.2 The pipeline: the Director's handoff mechanism

The main entry point `AutoHedge.run(task)` does one thing: hand the user task to the Director. The Director holds all downstream agents through the swarms framework's `handoffs` parameter:

```
User task (natural language)
  │
  ▼
Trading-Director ──handoff──▶ Quant-Analyst ──handoff──▶ Risk-Manager ──handoff──▶ Execution-Agent
  │ thesis                      │ numerical validation       │ sizing & risk score       │ structured order
  ▼
Output: full conversation log (Conversation)
```

Key implementation details:

1. **No predefined ticker list.** The Director parses tickers from the natural-language task (a dedicated `DIRECTOR_TICKER_DISCOVERY_PROMPT` instructs the model to return only a JSON array). The task can be "Analyze NVDA for a 50k allocation" or "Analyze oil market sentiment."
2. **Each agent runs `max_loops=1`.** Every stage calls the model exactly once, with no self-iteration. The pipeline is one-directional — no feedback loop.
3. **Handoff contents follow an explicit contract.** The Risk-Manager always receives "Stock, Thesis, Quant Analysis"; the Execution-Agent always receives "Stock, Thesis, Risk Assessment." Each stage must emit structured fields: the Quant outputs `technical_score / volume_score / trend_strength / volatility / probability_score / key_levels(support, resistance, pivot)`; Risk outputs position size, max drawdown, exposure, and a risk score; Execution outputs order type, quantity, entry price, stop loss, take profit, and time-in-force.
4. **Time-aware prompts.** The current date and time are appended to every system prompt at startup ("Current date and time (use this as now)"), preventing the model from reasoning with stale information.
5. **Full audit trail.** A `Conversation` object records every role's output; `output_type` supports `list / dict / str` return formats for downstream auditing.

### 2.3 Tool layer

`autohedge/tools/` provides data and execution tools, registered through `tools_registry.py`:

| Tool | Function | Dependency |
|------|----------|------------|
| `search_tokens` | Solana token search | Jupiter API |
| `get_token_price` | USD price by mint address | Jupiter Price API V3 |
| `execute_trade` | Sign and submit on-chain swap | Jupiter Ultra API + solders |
| `get_holdings` | Wallet holdings | Jupiter Ultra API |
| `get_order` | Order status | Jupiter Ultra API |
| `exa_search` | Web news/sentiment retrieval (attached to Sentiment-Agent) | Exa |
| `yahoo_api` / `polygon_api` | US equity market data (yfinance, Polygon) | yfinance, httpx |

The Solana execution path is complete: `WALLET_PRIVATE_KEY` is loaded as a Keypair via `solders`, and `execute_trade` follows Jupiter Ultra's quote-sign-submit flow under `/ultra/v1`. Note: in the current version these trading tools are not wired into the main agents' tool lists — the main agents emit order-parameter text, and the final live-execution step requires manual or custom integration.

## 3. Design Philosophy

Six principles emerge from the code and documentation.

### 3.1 Organization as code

A human hedge fund divides labor by function: the PM sets direction, quants produce signals, risk caps exposure, traders execute. AutoHedge maps that organization directly onto the agent topology — roles defined by prompts, process defined by handoffs, reporting structure defined by a one-directional pipeline with `max_loops=1`. Organizational design becomes prompt engineering.

### 3.2 Risk-first design

The risk agent sits between quant and execution and is a mandatory node in the pipeline. Every order must pass position sizing, drawdown estimation, and exposure assessment before it is generated. The README states it plainly: "Risk-First Design: Built-in risk management and position sizing before any execution." This inverts the amateur pattern of "signal first, risk later" — the risk gate is placed before execution, not patched on afterward.

### 3.3 Single responsibility and structured handoffs

Each agent does exactly one thing, with input and output formats written into its prompt. Handoffs use fixed fields (position size, stop loss, probability score, etc.), and each downstream prompt explicitly states what it will receive — "You will receive Stock, Thesis, Quant Analysis." This degrades inter-agent communication from free conversation to a constrained protocol, reducing the spread of hallucinations.

### 3.4 Task-driven, no predefined stock pool

There is no built-in ticker whitelist. The Director discovers tickers from the task itself. When the task is "analyze the oil market" the system takes a macro path; when it is "analyze NVDA" it takes a single-stock path. Flexibility comes from prompts, not configuration.

### 3.5 Modular extensibility

Prompts live in `prompts.py` (202 lines), agent definitions in `workers.py` (93 lines), and tools register through a registry. Adding an exchange means adding a set of tool functions; adding a role means defining one agent and appending it to the handoffs list. Module boundaries match file boundaries.

### 3.6 Institutional-grade auditability

Everything is logged via loguru; the conversation is retained in a Conversation object and exportable in three formats. The design targets "institutional reliability" — every decision is traceable, and failures are replayable.

## 4. Hands-On Tutorial

### 4.1 Installation

```bash
pip install -U autohedge
```

Requires Python 3.10+. Or install from source:

```bash
git clone https://github.com/The-Swarm-Corporation/AutoHedge.git
cd AutoHedge
pip install -r requirements.txt
```

### 4.2 Environment variables

Create a `.env` in the project root (see `.env.example`):

```bash
# Jupiter API: token price & search tools, get a key at https://portal.jup.ag
JUPITER_API_KEY=your_jupiter_key

# LLMs (the swarms framework requires an OpenAI-compatible interface)
OPENAI_API_KEY=your_openai_key
ANTHROPIC_API_KEY=your_anthropic_key

# Agent workspace directory
WORKSPACE_DIR="agent_workspace"

# Solana trading: fill in only if you need live order placement
WALLET_PRIVATE_KEY=your_solana_private_key
```

Notes: the main agents use gpt-4.1 and gpt-4o-mini. The CLI prints a warning if `OPENAI_API_KEY` is missing at startup. The Jupiter key is used by price/search tools; without it, some tools will call the API unauthenticated or fail.

### 4.3 Option 1: CLI interactive mode

```bash
autohedge
```

This starts a REPL (rendered with rich) showing the version, working directory, usage tips, and the last five tasks (stored in `~/.autohedge/recent_tasks.txt`).

Interaction example:

```
> Analyze NVDA for a 50k allocation
```

Typing any task triggers one full trading cycle. Results display in a panel (truncated to 2,000 characters). Commands:

- `help` / `?` / `h`: show tips
- `quit` / `exit` / `q`: exit

Other flags: `autohedge --version`; `autohedge help`.

### 4.4 Option 2: Python API

```python
from autohedge import AutoHedge

trading_system = AutoHedge(
    name="my-fund",
    description="Private Hedge Fund",
)

task = "Analyze the sentiment of oil market and provide a thesis on the overall market position and expected trends."
result = trading_system.run(task=task)
print(result)
```

`AutoHedge` parameters:

| Parameter | Default | Purpose |
|-----------|---------|---------|
| `name` | "autohedge" | System name |
| `description` | "fully autonomous hedgefund" | System description |
| `output_dir` | "outputs" | Output directory |
| `output_type` | "list" | Return format: `list` / `dict` / `str` |

### 4.5 Minimal customization: swap models, add tools, edit prompts

All changes concentrate in `workers.py`:

```python
# Swap models: replace gpt-4.1 with any OpenAI-compatible model name
risk_agent = Agent(
    agent_name="Risk-Manager",
    system_prompt=RISK_PROMPT,
    model_name="gpt-4o",        # ← change here
    max_loops=1,
)
```

Add a tool: write a function under `tools/`, register it in `get_tools()` inside `tools_registry.py`, then attach the function to the target agent's `tools=[...]` parameter.

Edit prompts: modify the corresponding constant in `prompts.py`. To make the Quant additionally output a Sharpe ratio, add one line to `QUANT_PROMPT`.

### 4.6 Expected output of a full cycle

For the task "Analyze NVDA for a 50k allocation": the Director discovers the ticker NVDA and produces a market thesis; the Quant produces indicator scores and support/resistance levels; Risk produces a recommended position size and risk score; Execution produces order parameters with stop loss and take profit. The `Conversation` holds every role's full output, retrievable by role name via `output_type="dict"`.

## 5. Findings and Conclusions

### 5.1 The project's real value

AutoHedge's value is not "making money" — it is a readable answer to the question: **how does a multi-agent system organize a complete business process.** In 1,600 lines you can see role definitions, a communication protocol, process orchestration, and audit logs, each in a fixed place. For anyone studying agent orchestration or designing their own multi-agent system, it is more concrete teaching material than a paper.

### 5.2 Three architectural strengths

1. **Risk gate placed first.** The risk agent is a mandatory pipeline node, the principle is written into every stage's prompt contract, and it is correct.
2. **Explicit handoff contracts.** Every agent knows what it will receive and what it must emit. This is far more stable than "a group of agents in free discussion."
3. **Time awareness.** Injecting the current time into every prompt costs one line of code and prevents the model from trading on information stale past its training cutoff — a finance-specific detail.

### 5.3 Limitations and risks (must be faced)

1. **Experimental.** Version 0.1.5, Beta label. The main agents are not wired to live trading tools; `WALLET_PRIVATE_KEY` is only used in experimental scripts. The README claims Pydantic structured outputs; the implementation actually uses string outputs.
2. **No backtesting framework.** Any strategy needs historical validation before deployment; the project provides none.
3. **Risk is "advice," not "constraint."** Position sizes and stop losses are all LLM-generated; there is no account-level hard limit in code (e.g., a max daily-loss circuit breaker). An LLM can be induced by prompt injection to inflate position sizes.
4. **No feedback loop.** The pipeline runs one way; the Quant's findings never return to the Director for thesis correction — errors are not self-corrected.
5. **Single-framework dependency.** Deeply coupled to the swarms Agent/Conversation abstractions; migration cost is high.
6. **Cost.** One cycle invokes gpt-4.1-class models 4-5 times; running at high frequency is expensive.

### 5.4 Applicable scenarios

- Teaching sample for multi-agent architecture and prompt engineering
- Prototype starting point for autonomous trading systems (add backtesting, hard risk limits, execution integration on top)
- Research vehicle for studying error propagation of LLMs in financial decision chains

Not applicable: running live with real funds out of the box.

### 5.5 Conclusion

AutoHedge packs a hedge fund into a Python package: five roles, one pipeline, one handoff protocol. Its design philosophy — risk-first, single responsibility, structured handoffs, task-driven, auditable — is worth borrowing for any multi-agent system. Its implementation completeness reminds everyone: between "architecturally correct" and "system trustworthy" lie backtesting, hard constraints, monitoring, and a large amount of engineering. AutoHedge demonstrates the former; the latter you must build yourself.

## 6. References

- Repository: https://github.com/The-Swarm-Corporation/AutoHedge
- Swarms framework: https://github.com/The-Swarm-Corporation/swarms
- Jupiter API docs: https://dev.jup.ag
- Jupiter key signup: https://portal.jup.ag
