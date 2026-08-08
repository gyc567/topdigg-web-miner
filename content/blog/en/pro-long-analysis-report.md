---
title: "PRO-LONG Deep Dive: Programmatic Memory Enables Long-Horizon Reasoning"
description: "Comprehensive analysis of PRO-LONG — a minimal programmatic memory framework for LLM agents. In-depth exploration of its design philosophy, single-file log architecture, code retrieval mechanism, breakthrough performance on ARC-AGI-3, and why it represents the future paradigm of agent memory systems."
date: "2026-08-08"
author: "TopDigg Research Team"
tags: ["PRO-LONG", "LLM Agent", "Programmatic Memory", "Long-Horizon Reasoning", "ARC-AGI-3", "Context Management", "Open Source", "AI", "Fable", "Agent Memory"]
categories: ["Deep Analysis"]
keywords: ["PRO-LONG", "Programmatic Memory", "LLM Agent", "Long-Horizon Reasoning", "ARC-AGI-3", "Context Management", "Agent Memory System", "Code Retrieval"]
---

> **PRO-LONG** is a minimal programmatic memory framework for LLM agents that enables long-horizon reasoning through single-file logs and code retrieval. This comprehensive analysis covers the project's architecture, design philosophy, practical tutorials, and core insights into agent memory systems.

---

## 1. Project Overview

### 1.1 What is PRO-LONG?

PRO-LONG is a minimal context management framework designed for long-horizon tasks. Its core idea is elegantly simple:

1. **Append every observation, action, and outcome to a single structured `log.txt` file**
2. **Agent retrieves and reasons over this history programmatically (grep, Python)**
3. **No subagents, no specialized retrieval mechanisms, system prompt is only ~30 lines**

This is not another complex memory system. PRO-LONG's design philosophy is **minimalism** — achieving the most effective memory management with the least code.

### 1.2 Core Features

| Feature | Details |
|---------|---------|
| **Single File Log** | All history stored in one `log.txt` file |
| **Code Retrieval** | Agent uses grep, Python, and other tools to programmatically search history |
| **Minimal Prompt** | System prompt is only ~30 lines, no complex instructions |
| **Dual Backend Support** | Supports both OpenAI Codex and Claude Code backends |
| **Docker Sandbox** | Executes in isolated container environments for security |
| **ARC-AGI-3 Breakthrough** | Achieves 97.4% best@2 on ARC-AGI-3 |

### 1.3 Key Concepts

#### Programmatic Memory — Teaching Agents to "Look Things Up"

Traditional agent memory systems typically use two strategies:

1. **Context Injection**: Putting all historical information directly into the prompt (causing token explosion)
2. **Vector Retrieval**: Using embedding models to retrieve relevant history (adding complexity and latency)

PRO-LONG proposes a third strategy: **programmatic memory**. Agents can search and analyze history using tools like grep and Python scripts, just like programmers do.

Advantages of this approach:
- **Completeness**: Preserves complete history without losing any information
- **Precision**: Code retrieval is more precise than semantic retrieval
- **Interpretability**: Agent's retrieval process is transparent and debuggable
- **Zero Overhead**: No embedding models or vector databases needed

#### Single File Log — Simplest is Most Effective

PRO-LONG stores all information in a single `log.txt` file, including:
- Initial board states
- Board states after each action
- Agent's analysis and reasoning
- Action execution results

This design seems "naive" but is actually very clever:
- **No Information Loss**: Complete preservation of all history
- **Simple and Reliable**: No complex synchronization or indexing mechanisms
- **Efficient Retrieval**: grep performs extremely well on large files

#### 30-Line Prompt — Trusting Agent Capabilities

PRO-LONG's system prompt is only ~30 lines and does not include:
- Complex reasoning instructions
- Detailed strategy guidance
- Specific task format requirements

It only tells the agent:
1. What your goal is (solve puzzles)
2. Where history is stored (`log.txt`)
3. How to retrieve history (using code)
4. How to output actions (write `actions.json`)

This minimal design reflects trust in agent capabilities — letting the agent decide how to retrieve and reason.

---

## 2. Design Philosophy

### 2.1 Minimalism — Less is More

PRO-LONG's core design philosophy is **minimalism**. While other memory systems continuously add complexity, PRO-LONG chooses the simplest solution:

- One file stores all history
- One prompt tells the agent how to use it
- One set of tools lets the agent retrieve on its own

Advantages of this design:
- **Easy to Understand**: Anyone can see how the system works
- **Easy to Debug**: When problems occur, just check the log file
- **Easy to Extend**: Adding new features only requires modifying the log format

### 2.2 Trusting Agents — Letting Code Speak

PRO-LONG doesn't try to "teach" agents how to reason. It trusts agent capabilities and only provides:
- Access to history (file system)
- Retrieval tools (grep, Python)
- Output format (JSON)

Agents can:
- Use any retrieval strategy
- Write any analysis scripts
- Adopt any reasoning method

This design reflects confidence in modern LLM coding abilities.

### 2.3 Programmatic Over Semantic — Precision Beats Ambiguity

Traditional memory systems use semantic retrieval (embedding similarity), but PRO-LONG chooses programmatic retrieval (grep, Python).

Reasons:
- **Exact Matching**: grep can precisely find lines containing specific patterns
- **Structured Queries**: Python can parse log formats and execute complex queries
- **Zero Latency**: No embedding computation or vector search needed
- **Interpretable**: Agent's retrieval process is completely transparent

---

## 3. Detailed Tutorial

### 3.1 Installation and Setup

#### Requirements

- Python 3.12 (recommended)
- Docker

#### Installation Steps

```bash
# Clone the repository
git clone git@github.com:alexisfox7/PRO-LONG.git
cd PRO-LONG

# Create virtual environment
python -m venv .venv
source .venv/bin/activate

# Install dependencies
pip install -e .
```

#### Build Docker Images

```bash
# Codex backend
docker build -t rgb-agent/codex-sandbox:latest docker/codex-sandbox
docker build -t rgb-openai-proxy docker/openai-proxy

# Claude Code backend
docker build -t rgb-agent/claude-sandbox:latest docker/claude-sandbox
docker build -t rgb-anthropic-proxy docker/anthropic-proxy
```

#### Configure Environment Variables

Create `.env` file:

```
ARC_API_KEY=...
ANTHROPIC_API_KEY=...   # claude-code backend
OPENAI_API_KEY=...      # codex backend
```

### 3.2 Basic Usage

#### Running Evaluation

```bash
# Run all games with Codex backend
prolong-swarm --suite all -m gpt-5.5 --max-actions 500

# Run all games with Claude Code backend
prolong-swarm --suite all --backend claude-code -m claude-opus-4-6

# Run specific games
prolong-swarm --game ls20,ft09 -m gpt-5.5
```

#### Key Parameters

| Parameter | Default | Description |
|-----------|---------|-------------|
| `--backend` | `codex` | Backend: `codex` or `claude-code` |
| `--suite` | — | Game suite: `ls20`, `vc33`, `ft09`, or `all` |
| `--game` | — | Comma-separated game names or IDs |
| `--max-actions` | 500 | Maximum actions per game |
| `--model`, `-m` | `claude-opus-4-6` | Base model |
| `--effort` | `high` | Effort level (claude-code backend) |
| `--reasoning-effort` | `none` | Reasoning effort (codex backend) |
| `--operation-mode` | `online` | `online` / `offline` / `normal` |

### 3.3 Memory Conditions

Agent access to game history is controlled by `--log-window` and `--workspace`:

| Condition | Flags | Available History |
|-----------|-------|-------------------|
| **prolong** | （default） | Full game log |
| **lw25** | `--log-window 25` | Last 25 action sections of the log |
| **no-log (in-prompt)** | `--log-window -1` | No log file; current board added to prompt |
| **stateless** | `--workspace stateless` | Full log, but workspace wiped each call |

### 3.4 Understanding the System Prompt

PRO-LONG's system prompt is very concise, with core content:

```python
SYSTEM_PROMPT = """
You are a coding agent playing a grid-based puzzle game by writing Python action plans.

Your primary objective is to solve all levels in the game. Your secondary objective is to minimize total cumulative actions used.

`/workspace/logs.txt` is the game log: action headers, tool calls, board states, and your own prior analyses. Parse it **programmatically**, as reading full 64x64 board states from prompt can introduce precision errors.

**Tools**: Read, Write, Edit, Bash, Grep, Glob.

**Workspace**: `/workspace/` persists across calls. `actions.json` is cleared each call; other files accumulate.

**Response format**: a strategic briefing, then
[PLAN]
<2-3 sentence action plan>

**Write `/workspace/actions.json`** with a JSON object `{"actions": ["ACTION6(30,40)", "ACTION1", "RESET"]}` — a list of 1–{action_cap} actions to execute in order.
"""
```

Key points of this prompt:
1. **Clear Goal**: Solve puzzles + minimize action count
2. **指定记忆位置**：`/workspace/logs.txt`
3. **指定检索方式**：程序化（grep、Python）
4. **指定输出格式**：`actions.json`

### 3.5 Action System

PRO-LONG supports the following actions:

| Action | Description |
|--------|-------------|
| `ACTION1` | Up |
| `ACTION2` | Down |
| `ACTION3` | Left |
| `ACTION4` | Right |
| `ACTION5` | Spacebar / interact |
| `ACTION6(x,y)` | Click at column x (0-63), row y (0-63) |
| `ACTION7` | Undo |
| `RESET` | Reset level (actions still count) |

### 3.6 Output Results

Evaluation results are written to `evaluation_results/` directory. The `scorecards/` directory contains official online scorecards.

---

## 4. Core Architecture Deep Dive

### 4.1 Project Structure

```
prolong_agent/
├── agent/
│   ├── base.py               # Base architecture
│   ├── codex_agent.py        # Codex CLI backend
│   ├── claude_code_agent.py  # Claude Code backend
│   ├── swarm.py              # CLI entry point
│   ├── action_queue.py       # Action execution
│   ├── game_state.py         # Board/log formatting
│   └── prompts.py            # Prompt templates (~30 lines)
├── environment/
│   ├── arcagi3.py            # ARC-AGI-3 API wrapper
│   ├── runner.py             # Per-game loop
│   └── config.py
├── metrics/
└── utils/
```

### 4.2 Core Components

#### Agent Base Architecture

```python
class BaseAgent:
    """Base agent class defining standard interface"""
    
    def __init__(self, model: str, workspace: str):
        self.model = model
        self.workspace = workspace
        self.log_path = f"{workspace}/logs.txt"
    
    def act(self, observation: dict) -> list[str]:
        """Return action list based on observation"""
        # 1. Append observation to log
        # 2. Read log
        # 3. Use model to generate actions
        # 4. Write actions.json
        pass
```

#### Log Format

```log
[INITIAL BOARD STATE]
<64x64 board state>

[ACTION1]
Tool call: bash("python3 -c '...'")

[POST-ACTION BOARD STATE]
<updated board state>

[ACTION2]
Tool call: grep("pattern", "/workspace/logs.txt")
...
```

#### Action Execution

```python
class ActionQueue:
    """Action queue, executing actions in order"""
    
    def execute(self, actions: list[str]) -> dict:
        results = []
        for action in actions:
            result = self._run_action(action)
            results.append(result)
        return {"results": results, "total": len(results)}
```

### 4.3 Retrieval Mechanism

PRO-LONG's retrieval relies entirely on agent code capabilities:

```python
# Retrieval methods available to agents

# 1. grep search for specific patterns
grep -n "INITIAL BOARD STATE" /workspace/logs.txt

# 2. Python log parsing
python3 -c "
import re
with open('/workspace/logs.txt') as f:
    content = f.read()
boards = re.findall(r'\[POST-ACTION BOARD STATE\](.*?)\[', content, re.DOTALL)
print(f'Found {len(boards)} board states')
"

# 3. Statistical analysis
python3 -c "
with open('/workspace/logs.txt') as f:
    lines = f.readlines()
actions = [l for l in lines if l.startswith('[ACTION')]
print(f'Total actions: {len(actions)}')
"
```

### 4.4 Performance Data

According to the paper and official evaluation:

| Metric | Data |
|--------|------|
| **ARC-AGI-3 best@2** | 97.4% (Fable 5) |
| **Average Improvement** | +18.0 percentage points over base agent |
| **Token Efficiency** | 4.2-5.8x fewer than specialized frameworks |
| **Total Cost** | $1,750 (25 Fable 5 runs) |
| **Highest pass@1** | 76.1% |

---

## 5. Summary of Insights

### 5.1 Why PRO-LONG Matters

PRO-LONG represents an important paradigm shift in agent memory systems. While other systems continuously add complexity, PRO-LONG proves the **power of minimalism**.

**Three Core Insights**:

1. **Programmatic Memory Beats Semantic Retrieval**: Letting agents search history with code is more precise and efficient than embedding retrieval
2. **Single File Log is Enough**: One `log.txt` file can store all needed information
3. **Trust Agent Capabilities**: A 30-line prompt is sufficient for agents to autonomously complete complex tasks

### 5.2 Comparison with Other Tools

| Feature | PRO-LONG | LangChain Memory | AutoGPT | BabyAGI |
|---------|----------|------------------|---------|---------|
| **Memory Method** | Single file log | Vector database | Multiple files | Task queue |
| **Retrieval Method** | Code (grep/Python) | Semantic search | File reading | Priority sorting |
| **Prompt Length** | ~30 lines | Complex | Complex | Medium |
| **Token Efficiency** | Extremely high | Medium | Low | Medium |
| **ARC-AGI-3** | 97.4% | Not tested | Not tested | Not tested |
| **Open Source** | ✅ | ✅ | ✅ | ✅ |

### 5.3 Use Cases

**Best For**:
- Agent tasks requiring long-term memory
- Historical queries requiring precise retrieval
- Complex reasoning and planning tasks
- Cost-sensitive application scenarios

**Less Suitable For**:
- Simple single-turn conversations
- Tasks not requiring historical memory
- Non-coding agents (requires coding capabilities)

### 5.4 Design Philosophy Summary

PRO-LONG's design philosophy can be summarized as:

1. **Minimalism**: Least code, most effective memory
2. **Trust Agents**: Let agents decide how to retrieve and reason
3. **Programmatic Over Semantic**: Exact matching beats fuzzy similarity
4. **Complete Preservation**: Don't lose any historical information
5. **Zero Extra Overhead**: No embedding models or vector databases needed

---

## 6. Roadmap

Based on project trends and evolution in agent memory systems:

### Short-Term (3-6 months)
- Support more LLM backends
- Improve log format and retrieval efficiency
- Add more evaluation benchmarks

### Medium-Term (6-12 months)
- Multi-agent collaborative memory
- Incremental log compression
- Cross-session memory persistence

### Long-Term (1-2 years)
- Autonomous memory management agents
- Cross-organization memory sharing
- General long-horizon reasoning framework

---

## 7. Conclusion

PRO-LONG is a groundbreaking agent memory framework that achieves breakthrough performance through minimal design. Single file log, code retrieval, 30-line prompt — these seemingly "naive" designs achieved 97.4% accuracy on ARC-AGI-3.

**Core Value**:
- **Minimalism**: Least code, most effective memory
- **Programmatic Retrieval**: Precise, efficient, interpretable
- **Complete Preservation**: Don't lose any historical information
- **Zero Extra Overhead**: No embedding models needed

**Why Choose PRO-LONG?**
- Open and transparent (MIT License)
- Minimal design, easy to understand and debug
- Code retrieval, precise and efficient
- Breakthrough performance validated on ARC-AGI-3

**Get Started**:
```bash
# Clone the repository
git clone git@github.com:alexisfox7/PRO-LONG.git
cd PRO-LONG

# Install
python -m venv .venv
source .venv/bin/activate
pip install -e .

# Run evaluation
prolong-swarm --suite all -m gpt-5.5 --max-actions 500
```

---

> **Disclaimer**: This article is based on PRO-LONG's public documentation, paper, and technical analysis, aiming to provide comprehensive technical insights and practical guidance. Paper citation: arXiv:2607.20064.
