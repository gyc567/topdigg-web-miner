---
slug: oh-my-claudecode-analysis
title: "oh-my-claudecode Deep Dive: Claude Code Multi-Agent Orchestration That Actually Works (Core Ideas + Project Overview + Tutorial + Design Philosophy)"
description: "Deep analysis of Yeachan-Heo/oh-my-claudecode (38.5k stars, MIT, TypeScript, v4.15.7) — a multi-agent orchestration layer for Claude Code. Core idea: 19 specialized agents (4 lanes) + 3-tier model routing (haiku/sonnet/opus) + 31 Skills + 5-stage Team pipeline + Magic Keywords. Design philosophy: zero learning curve, teams-first orchestration, intelligent routing, composable Skills."
date: "2026-08-12"
author: "TopDigg"
tags: ["oh-my-claudecode", "Claude Code", "Multi-Agent", "Orchestration", "TypeScript", "AI Agents", "Developer Tools", "SWE-bench"]
categories: ["Deep Dive"]
keywords: ["oh-my-claudecode", "Claude Code Multi-Agent Orchestration", "Multi-Agent Systems", "Orchestration", "TypeScript", "AI Agent", "Developer Tools", "SWE-bench", "autopilot", "ralph", "ultrawork", "team orchestration", "Claude Code plugin"]
---

# oh-my-claudecode Deep Dive: Claude Code Multi-Agent Orchestration That Actually Works

> Core Idea: **Don't learn Claude Code. Just use OMC.** oh-my-claudecode (OMC) is a multi-agent orchestration layer that sits on top of Claude Code, using 19 specialized agents, 3-tier model routing, 31 Skills, and a 5-stage Team pipeline — letting engineers drive an AI team with natural language. It doesn't replace Claude Code; it layers on top with zero learning curve and seamless workflow integration.

## 1. Project Overview: What Is oh-my-claudecode

### 1.1 One-Sentence Positioning

**oh-my-claudecode (OMC) is a multi-agent orchestration system that runs on Claude Code, replacing manual configuration and prompt engineering with Skills and specialized agents.** The tagline: "Don't learn Claude Code. Just use OMC." It transforms Claude Code from a single-agent tool requiring carefully crafted prompts into a development environment where you can drive a multi-agent team with natural language.

### 1.2 Project Metadata

| Field | Value |
|-------|-------|
| GitHub | [Yeachan-Heo/oh-my-claudecode](https://github.com/Yeachan-Heo/oh-my-claudecode) |
| Stars | 38,530 |
| Forks | 3,462 |
| License | MIT |
| Language | TypeScript |
| Latest Version | 4.15.7 (npm: oh-my-claude-sisyphus) |
| npm Package | `oh-my-claude-sisyphus` |
| Creator | Yeachan Heo ([@Yeachan-Heo](https://github.com/Yeachan-Heo)) |
| Website | https://yeachan-heo.github.io/oh-my-claudecode-website |
| Discord | https://discord.gg/jq6jnSGABY |

### 1.3 Orchestration Modes

| Mode | Description | Use For |
|------|------------|---------|
| **Team (recommended)** | 5-stage pipeline: `team-plan → team-prd → team-exec → team-verify → team-fix` | Coordinated Claude agents on shared task list |
| **omc team (CLI)** | tmux CLI workers: real `claude`/`codex`/`gemini`/`grok`/`cursor-agent` split-pane processes | Codex/Gemini/Grok/Cursor CLI tasks |
| **ccg** | Tri-model advisors: `/ask codex` + `/ask antigravity`, Claude synthesizes | Mixed backend+UI work needing Codex + Antigravity |
| **Autopilot** | Autonomous execution (single lead agent) | End-to-end feature work with minimal ceremony |
| **Ultrawork** | Maximum parallelism (non-team) | Burst parallel fixes/refactors where Team isn't needed |
| **Ralph** | Persistent mode with verify/fix loops | Tasks that must complete fully (no silent partials) |
| **UltraQA** | QA cycling until tests/build/lint/typecheck pass | Quality gates needing repeat diagnose/fix cycles |
| **Pipeline** | Sequential, staged processing | Multi-step transformations with strict ordering |

### 1.4 Four Interlocking Systems

```
User Input --> Hooks (lifecycle event detection) --> Skills (behavior injection)
           --> Agents (task execution) --> State (progress tracking)
```

1. **Hooks**: Detect Claude Code lifecycle events, trigger corresponding Skills
2. **Skills**: Inject behaviors, modify how the orchestrator operates
3. **Agents**: Execute specialized work (19 agents across 4 lanes)
4. **State**: Track progress across context resets (`.omc/` directory)

### 1.5 SWE-bench Benchmark

OMC includes a SWE-bench benchmark suite comparing vanilla Claude Code vs OMC-enhanced:

```bash
./setup.sh        # One-time setup
./quick_test.sh   # 5 instances sanity check
./run_full_comparison.sh  # Full comparison
```

## 2. Core Ideas: Agent System, Model Routing, and Skills Composition

### 2.1 19 Specialized Agents (4 Lanes)

**Build/Analysis Lane** (full development lifecycle):

| Agent | Default Model | Role |
|-------|--------------|------|
| `explore` | haiku | Codebase discovery, file/symbol mapping |
| `analyst` | opus | Requirements analysis, hidden constraint discovery |
| `planner` | opus | Task sequencing, execution plan creation |
| `architect` | opus | System design, interface definition, trade-off analysis |
| `debugger` | sonnet | Root-cause analysis, build error resolution |
| `executor` | sonnet | Code implementation, refactoring |
| `verifier` | sonnet | Completion verification, test adequacy confirmation |
| `tracer` | sonnet | Evidence-driven causal tracing, competing hypothesis analysis |

**Review Lane** (quality gates before handoff):

| Agent | Default Model | Role |
|-------|--------------|------|
| `security-reviewer` | sonnet | Security vulnerabilities, trust boundaries, authn/authz review |
| `code-reviewer` | opus | Comprehensive code review, API contracts, backward compatibility |

**Domain Lane** (domain experts called in when needed):

| Agent | Default Model | Role |
|-------|--------------|------|
| `test-engineer` | sonnet | Test strategy, coverage, flaky-test hardening |
| `designer` | sonnet | UI/UX architecture, interaction design |
| `writer` | haiku | Documentation, migration notes |
| `qa-tester` | sonnet | Interactive CLI/service runtime validation via tmux |
| `scientist` | sonnet | Data analysis, statistical research |
| `git-master` | sonnet | Git operations, commits, rebase, history management |
| `document-specialist` | sonnet | External documentation, API/SDK reference lookup |
| `code-simplifier` | opus | Code clarity, simplification, maintainability improvement |

**Coordination Lane**:

| Agent | Default Model | Role |
|-------|--------------|------|
| `critic` | opus | Gap analysis of plans and designs, multi-angle review |

### 2.2 Three-Tier Model Routing

| Tier | Model | Characteristics | Cost |
|------|-------|---------------|------|
| LOW | haiku | Fast, inexpensive | Low |
| MEDIUM | sonnet | Balanced performance and cost | Medium |
| HIGH | opus | Highest-quality reasoning | High |

**Assignment principle**: haiku for fast lookups, sonnet for implementation/debugging/testing, opus for architecture/strategy/review.

### 2.3 Skills System: Layered Behavior Injection

**Core formula**:

```
[Execution Skill] + [0-N Enhancements] + [Optional Guarantee]
```

**Example**:

```
Task: "ultrawork refactor API with proper commits"
Active skills: ultrawork + default + git-master
```

**Skills three-layer architecture**:

```
┌─────────────────────────────────────────────────┐
│  GUARANTEE LAYER (optional)                     │
│  ralph: "Cannot stop until verified done"       │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│  ENHANCEMENT LAYER (0-N skills)                 │
│  ultrawork (parallel) | git-master (commits) | frontend-ui-ux │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│  EXECUTION LAYER (primary skill)                │
│  default (build) | orchestrate (coordinate) | planner (plan) │
└─────────────────────────────────────────────────┘
```

### 2.4 Magic Keywords: Natural Language Skill Triggers

| Keyword | Triggers | Effect |
|---------|----------|--------|
| `ralph`/`don't stop`/`must complete` | `$ralph` | Persistence loop, verifier confirms completion before exit |
| `autopilot`/`build me`/`I want a` | `$autopilot` | Autonomous execution pipeline |
| `ultrawork`/`ulw`/`parallel` | `$ultrawork` | Maximum parallel agent orchestration |
| `plan this`/`plan the` | `$plan` | Planning workflow |
| `interview`/`deep interview`/`gather requirements` | `$deep-interview` | Socratic requirements clarification with Ouroboros-inspired ambiguity gating |
| `ralplan`/`consensus plan` | `$ralplan` | RALPLAN-DR iterative consensus planning |
| `ecomode`/`eco`/`budget` | `$ecomode` | Token-efficient mode |

### 2.5 Team Mode: The Canonical Multi-Agent Orchestration

**Since v4.1.7, Team is the canonical orchestration surface** (old `swarm` keyword removed):

```bash
/team 3:executor "fix all TypeScript errors"
```

**5-stage pipeline**:

```
team-plan → team-prd → team-exec → team-verify → team-fix (loop)
```

### 2.6 Typical Agent Workflow

```
explore → analyst → planner → critic → executor → verifier
(discover)  (analyze)   (sequence)  (review)   (implement)  (confirm)
```

## 3. Tutorial: From Zero to First Task

### 3.1 Installation (Two Methods)

**Method 1: Marketplace/Plugin (recommended)**

**Important: paste ONE line at a time, not both together**:

```bash
# Line 1: add marketplace (paste, press enter)
/plugin marketplace add https://github.com/Yeachan-Heo/oh-my-claudecode

# Line 2: install plugin (paste, press enter)
/plugin install oh-my-claudecode
```

**Method 2: npm global install**

```bash
npm i -g oh-my-claude-sisyphus@latest
```

> **Known npm warning**: `better-sqlite3` dependency prints a `deprecated prebuild-install@7.1.3` warning — upstream issue, not OMC-specific. Does not affect installation.

### 3.2 Setup

```bash
# Inside Claude Code / OMC session
/setup
/omc-setup

# From terminal
omc setup
```

### 3.3 Basic Usage

**Autopilot (autonomous execution)**:

```bash
/autopilot "build a REST API for managing tasks"
```

**Team (recommended for multi-role tasks)**:

```bash
/team 3:executor "fix all TypeScript errors"
```

**Ralph (persistent mode)**:

```bash
/ralph "refactor the authentication module"
```

**Ultrawork (maximum parallelism)**:

```bash
/ultrawork "fix all TypeScript errors"
```

### 3.4 Skills Advanced Usage

**Custom Skills** (extract reusable patterns from sessions):

```bash
/skill list    # Browse skills
/skill add     # Add a skill
/skill search  # Search skills
/skillify      # Extract from session
```

**Skill composition example**: "ultrawork: refactor API with proper commits" → auto-activates ultrawork + default + git-master.

### 3.5 Multi-Model Advisor (Provider Advisor)

```bash
omc ask claude "review this migration plan"
omc ask codex --prompt "identify architecture risks"
omc ask gemini --prompt "propose UI polish ideas"

# In-session
/ask claude "review this migration plan"
/ask codex "identify architecture risks"
```

### 3.6 Deep Interview (Socratic Requirements Clarification)

```bash
/deep-interview "I want to build a task management app"
```

Deep Interview uses Socratic questioning to clarify thinking before any code is written, exposing hidden assumptions and measuring clarity across weighted dimensions.

### 3.7 SWE-bench Benchmark

```bash
export ANTHROPIC_API_KEY=your_key_here
./setup.sh
./quick_test.sh
./run_full_comparison.sh --skip-vanilla  # Only test OMC, reuse vanilla results
```

## 4. Summary: Core Views and Conclusions

### 4.1 Core Views

**View 1: Claude Code itself is not the destination — the orchestration layer is the productivity lever.** OMC's core insight: treat Claude Code as a programmable runtime, not a single agent to be optimized. When 19 specialized agents and 31 Skills layer on top, Claude Code transforms from "one smart assistant" into "an AI engineering team."

**View 2: Skills composition > fixed agent workflows.** OMC's Skills system doesn't define rigid agent chains. The formula `[Execution] + [0-N Enhancements] + [Optional Guarantee]` enables dynamic composition — the same task can activate ultrawork + default + git-master, or ralph + default + test-engineer, on demand.

**View 3: Magic Keywords turn "learning curve" into "expressiveness."** Instead of requiring users to learn specific command syntax, OMC lets natural language intent trigger Skills ("build me a REST API" triggers Autopilot, "don't stop" triggers Ralph).

**View 4: Team pipeline is the most reliable multi-agent collaboration pattern so far.** The 5-stage pipeline achieves the best balance between structure and flexibility. The `team-fix` loop ensures that when verification fails, agents return to execution rather than simply reporting failure.

**View 5: Model routing is the key to cost control.** Not every task needs Opus reasoning. haiku/sonnet/opus three-tier routing lets the same API budget handle more tasks by matching model tier to task complexity.

**View 6: Persistence is the prerequisite for quality assurance.** Ralph's design philosophy: an agent shouldn't claim completion on first pass — it must pass verifier confirmation. This turns "looks done" into "proven done."

**View 7: Zero learning curve is not reduced capability — it's improved discoverability.** Magic Keywords (discoverability) + Skills composition (composability) = full capability with zero learning curve.

### 4.2 Technical Conclusions

**Conclusion 1**: The core problem of multi-agent orchestration is not "how many agents" but "who decides which agent to use." OMC's three-layer routing (model + agent + Skill) solves this systematically.

**Conclusion 2**: Skills is the optimal abstraction level for agent orchestration. Too fine (tool-level) = combinatorial explosion. Too coarse (workflow-level) = loss of flexibility. 31 Skills (28 user-invocable) is at the sweet spot.

**Conclusion 3**: The verify stage in Team Pipeline is the quality anchor of the entire pipeline. The `team-verify → team-fix → team-exec` loop is the core quality assurance mechanism of OMC.

**Conclusion 4**: Magic Keywords' success depends on keyword detection accuracy and Skill triggering correctness. OMC's case-insensitive, anywhere-match, and longest-match rules ensure smooth UX in most cases.

## 5. Design Philosophy: OMC's Engineering Philosophy

### 5.1 Zero Learning Curve

"Don't learn Claude Code. Just use OMC" is a design constraint, not a marketing slogan. Every OMC design decision serves one goal: **let users express intent in natural language, and let the tool find the right execution path**. Magic Keywords embody this: users don't need to know "autopilot" is a Skill — they just say "build me a REST API" and the system routes automatically.

### 5.2 Teams-First

**Since v4.1.7, Team is the canonical orchestration surface**. The old `swarm` keyword was removed. Philosophy behind this decision:
- **Structured > free collision**: Multi-agent without pipeline constraints produces unpredictable noise
- **Explicit > implicit**: Team pipeline requires clear input/output for each stage with explicit handoff contracts
- **Verifiable > unverifiable**: Verify stage ensures each stage's output is checked, not relying on the agent's own "I think I'm done"

### 5.3 Intelligent Routing

OMC routing happens at three layers:

1. **Model routing**: haiku/sonnet/opus selected by task complexity
2. **Agent routing**: 19 specialized agents selected by task type
3. **Skill routing**: Magic Keywords + explicit invocation determine behavior injection

### 5.4 State Persistence and Recoverability

OMC writes runtime state to `.omc/`:
- `.omc/plans/`: planning documents and PRDs
- `.omc/state/`: session state and replay logs
- `.omc/artifacts/`: generated artifacts
- `.omc/sessions/`: session summaries

Key design: `.omc/skills/` files can be committed to Git for team sharing. Everything else under `.omc/` is in `.gitignore`.

### 5.5 Observability

- **HUD status bar**: real-time orchestration metrics
- **Session summaries**: `.omc/sessions/*.json`
- **Replay logs**: `.omc/state/agent-replay-*.jsonl`
- **Friction reports**: `omc session friction report --since 24h`

### 5.6 Open Ecosystem

OMC is not a closed system:
- **Multi-provider**: `claude`, `codex`, `gemini`, `antigravity`, `grok`, `cursor`
- **MCP Server**: `.mcp.json` integration
- **Custom Skills**: extract from sessions and share across teams
- **Plugin marketplace**: community-contributed plugins via `/plugin marketplace`

---

**OMC's core insight: when you treat Claude Code as a programmable runtime rather than a single agent to optimize, the possibility space of multi-agent orchestration opens up.** 19 agents, 31 Skills, 3 model tiers, 5-stage Team Pipeline — these aren't feature bloat; they're a systematic answer to one core question: **in every task, how do you choose the right agent, right model, and right Skill combination at the lowest cost?**
