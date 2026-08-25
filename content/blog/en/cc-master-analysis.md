---
slug: cc-master-analysis
title: "cc-master Deep Dive: Turn Any Coding Agent Session into a Long-horizon Project Lead (Project Overview + Quickstart Tutorial + System Architecture + Design Philosophy)"
description: "An in-depth analysis of nemori-ai/cc-master (open source project, TypeScript, PolyForm Noncommercial 1.0.0 license) — 'turning a coding agent session into a project lead for long-running work'. Core idea: cc-master turns any supported coding agent session (Claude Code, Codex, Cursor, kimi-code) into a 'project lead' — you bring the idea and make the few decisions that truly need you; it breaks the goal down, runs independent pieces in parallel, tracks progress and quota, and verifies the result against an explicit goal. The board survives context resets and session handoffs, so work does not depend on one conversation's memory. Installation: a one-line curl installs the ccm engine + plugins; the plugin generates native adapters for each harness (Claude Code slash command /cc-master:as-master-orchestrator, Codex $cc-master-as-master-orchestrator, Cursor /as-master-orchestrator, kimi-code cc-master:as-master-orchestrator). System architecture: a three-layer product model (per-harness plugin adapters → ccm CLI + @ccm/engine → ccm web-viewer read-only view); Board v2 JSON data model (narrow waist); 8 distributed Skills (master-orchestrator-guide / authoring-workflows / using-ccm / slicing-goals-into-dags / dev-as-ml-loop / engineering-with-craft / pacing-and-estimation / distilling-lessons-into-assets); unified O/T1/T2/T3 model assignment; 7 dormant-until-armed Hook categories; quota posture + Monte Carlo delivery prediction; cross-harness worker dispatch and Agent Registry. Design philosophy: 'the conductor never plays an instrument' (the coordinator never does unit work itself), attention reallocation (reroute attention to where it is actually worth spending), six charter goals, ship-anywhere (hooks use only bash + node/JS), the narrow waist principle (only a small set of fixed board fields are depended on by hooks), dual version-line decoupling (plugin vX.Y.Z vs ccm ccm-vX.Y.Z released independently). Explicit boundary: this is not 'wish and AI does it all' — the calls only you can make (taste, design, direction) still belong to you; ten-minute one-or-two-line fixes are also not worth asking a 'project lead' for."
date: "2026-08-11"
author: "TopDigg"
tags: ["cc-master", "Claude Code", "Codex", "Cursor", "kimi-code", "Agent Orchestration", "AI Agent", "Long-horizon", "Task DAG", "Monte Carlo", "Project Lead", "DevTools", "Agent Plugin"]
categories: ["Deep Dive"]
keywords: ["cc-master", "Claude Code", "Codex", "Cursor", "kimi-code", "Agent Orchestration", "Orchestration", "long-running", "Long-horizon", "Board", "DAG", "O/T1/T2/T3", "model assignment", "design philosophy", "nemori-ai", "quota", "Monte Carlo", "Worker", "Agent Registry"]
---

# cc-master Deep Dive: Turn Any Coding Agent Session into a Long-horizon Project Lead

> Core idea: **cc-master turns any supported coding agent session — Claude Code, Codex, Cursor, or kimi-code — into a "project lead for long-running work."** You bring the idea and make the few calls that truly need you; it helps break the work down, run independent pieces in parallel, track progress and quota, and verify the result against an explicit goal. **The board survives context resets and session handoffs**, so work can continue without relying on one conversation's memory — this is the essential difference between it and "an agent inside a single conversation."

## 1. Project Overview

### 1.1 What is it?

cc-master is an **Agent orchestration framework** (written in TypeScript) open-sourced by nemori-ai, aimed at upgrading "a single coding agent session" into a **project lead** that can survive days of work, run multiple threads in parallel, and persist across sessions.

Official one-line positioning:

> cc-master turns a supported coding-agent session into a project lead for long-running work. You bring the idea and make the handful of calls that truly need you; it helps break the work down, run independent pieces in parallel, track progress and quota, and verify the result against an explicit goal. The board survives context resets and session handoffs, so the work can continue without relying on one conversation's memory.

**One-sentence summary**: in the age of AI-assisted coding, cc-master reroutes your human attention to where it is actually worth spending — the dirty work of breaking things down, scheduling, progress and quota bookkeeping is handed to the "project lead," and you only handle direction and major decisions.

### 1.2 Project metadata

| Field | Value |
|------|-----|
| Repo | https://github.com/nemori-ai/cc-master |
| Stars | 8 |
| License | PolyForm Noncommercial 1.0.0 (source available, non-commercial use only) |
| Language | TypeScript |
| Latest push | 2026-08-07 |
| Topics | `agent-plugin` `agent-skill` `claude-code` `claude-plugin` `dynamic-workflow` `orchestration` |
| Chinese docs | README_zh.md (ships with a Chinese README) |

### 1.3 What it is NOT (important boundary)

> But please don't misunderstand — this is NOT "make a wish and AI handles everything." Taste, design, direction — the decisions only you can make still belong to you; what it takes off your plate is only the breaking down, scheduling, progress and bookkeeping that should have buried you otherwise.

**When NOT to use cc-master**:

> A fix that's a couple of lines you can finish in ten minutes? Just do it — don't call in a "project lead," that's overkill and only makes you slower. **It is built for goals one person can't watch over, that run for days, and that fan out into many threads at once. The bigger, messier, and longer the work, the more it's worth using.**

### 1.4 Who it is for (three target personas)

| Persona | Pain point | Value from cc-master |
|----------|------|---------------------|
| 🚀 You with an idea but not engineering | Can articulate what you want, missing a **reliable project lead** | Breaks the idea into executable tasks, watches progress, verifies |
| 🔧 Engineer who doesn't want to be "a manager" | Management eats coding time | Takes management off your plate, keeps you in the craft |
| 🧭 Team lead who wants to be "ten copies" of themselves | Wants to scale direction | It carries the tedious scheduling, you set direction and make the big calls |

## 2. Core Idea

### 2.1 Attention Reallocation

> At bottom it does one thing: in the age of AI-assisted coding, it **reallocates your attention to where it's actually worth spending**.

At bottom it does one thing: in the age of AI-assisted coding, **it reroutes your attention to where it is actually worth spending**. Human attention is a scarce resource; instead of staring at every agent's output and tracking every line of progress, concentrate your attention on the judgments only you can make.

### 2.2 The conductor never plays an instrument

> The conductor never plays an instrument.

This is cc-master's most important design red line: **the coordinator coordinates and never does unit work itself**. Any change pushing the main thread toward "implementing it myself" or "reviewing it myself" is the wrong direction. This principle runs through skill design, hook design, and the board state machine.

### 2.3 Six charter goals

The project charter lists six goals (some still evolving):

1. **Async parallel multi-threaded push**, goal-complete delivery
2. **Control token consumption pacing** (quota-aware)
3. **Master the boundary between autonomous decisions and human-machine collaboration** (which calls to escalate to humans)
4. **Goal slicing, management, update, planning**
5. **Scheduling orchestration that maximizes efficiency within reasonable resource consumption**
6. **Select the right model by complexity / difficulty / duration** (O/T1/T2/T3)

### 2.4 The essential difference from "fully autonomous agents"

- **Not** "one prompt runs everything" — it introduces an **explicit Goal Contract** and **verification gate**, and the result must be checked item by item against the goal.
- **Not** a single conversation — **the Board persists to disk** (`~/.cc_master/boards/*.board.json`), surviving context resets and session handoffs.
- **Not** for every kind of work — it has explicit "when NOT to use it" boundaries (small fixes: just do them, don't call the project lead).

## 3. Detailed Tutorial

### 3.1 Hard prerequisites

| Dependency | Requirement |
|------|------|
| Node.js | **22+** (required for all modes, including offline / version-locked) |
| unzip | To extract plugins and the engine |
| SHA256 tool | `sha256sum` / `shasum` / `openssl` — any one |
| Network tool | `curl` or `wget` (required for online install) |

### 3.2 One-line install (ccm engine + plugin together)

```bash
# Install ccm engine + plugin (auto-detects harness by default)
curl -fsSL https://raw.githubusercontent.com/nemori-ai/cc-master/main/install.sh | bash
```

### 3.3 Install options (pin version / target harness)

```bash
# Pin both engine and plugin versions (the two flags are independent and both optional)
curl -fsSL https://raw.githubusercontent.com/nemori-ai/cc-master/main/install.sh | bash -s -- \
  --ccm-version ccm-v0.23.0 --plugin-version v0.22.0

# Pin only the engine; plugin uses latest
curl -fsSL https://raw.githubusercontent.com/nemori-ai/cc-master/main/install.sh | bash -s -- --ccm-version ccm-v0.23.0

# Target a specific harness
curl -fsSL https://raw.githubusercontent.com/nemori-ai/cc-master/main/install.sh | bash -s -- --harness claude-code
curl -fsSL https://raw.githubusercontent.com/nemori-ai/cc-master/main/install.sh | bash -s -- --harness cursor
curl -fsSL https://raw.githubusercontent.com/nemori-ai/cc-master/main/install.sh | bash -s -- --harness kimi-code

# Install for every harness
curl -fsSL https://raw.githubusercontent.com/nemori-ai/cc-master/main/install.sh | bash -s -- --all-harnesses
```

### 3.4 Key environment variables

| Variable | Default | Purpose |
|------|--------|------|
| `CC_MASTER_HOME` | `$HOME/.cc_master` | Runtime state root (boards, Goal Briefs, account registry, quota sidecar) |
| `PREFIX` | `$HOME/.local/bin` | Install location for the `ccm` binary |
| `CC_MASTER_PLUGIN_DIR` | `$HOME/.local/share/cc-master` | Plugin staging root |
| `CC_MASTER_INSTALL_LOCAL` | _empty_ | Set to a local directory path → install offline from local assets |
| `CC_MASTER_NO_AUTOINSTALL` | _empty_ | Set to `1` → disable the auto statusline install on Claude Code |

### 3.5 Starting orchestration in each harness

After install, use the native entry point for your harness:

```bash
# Claude Code (slash command)
/cc-master:as-master-orchestrator <your goal>

# Codex (subcommand)
$cc-master-as-master-orchestrator <your goal>

# Cursor (Agent chat slash command)
/as-master-orchestrator <your goal>

# kimi-code (namespaced plugin command)
cc-master:as-master-orchestrator <your goal>
```

### 3.6 Daily command cheat-sheet

| Command | Purpose |
|------|------|
| `/cc-master:as-master-orchestrator <goal>` | Start a brand-new orchestration |
| `/cc-master:as-master-orchestrator --resume` | Resume an existing board |
| `ccm harness list --machine-wide --json` | Discover machine-wide harness surface |
| `ccm quota status --machine-wide --json` | Read cached quota posture |
| `ccm model-policy show --task <taxonomy> --json` | Inspect O/T1/T2/T3 model role candidates |
| `ccm worker help --harness <target>` | Read the real agent-command help for the target CLI |
| `ccm worker run` | Raw worker transport (no board side effects) |
| `ccm worker dispatch --board … --task … --idempotency-key …` | Bookkeeping-aware dispatch (Agent Registry entry) |
| `ccm agent list --json` | View the runtime roster and lifecycle evidence |
| `ccm status-report show` | Generate a board status report |
| `ccm web-viewer open` | Open the read-only live plan graph in the browser |
| `/cc-master:discuss <decision>` | Throw a decision to the human |
| `/cc-master:bulk-discuss` | Walk through all pending decisions in one go |
| `/cc-master:stop` | Wrap up and archive the board |
| `/cc-master:handoff-to-new-session` | Prepare for a session handoff |
| `/cc-master:retro` | Read-only retrospective → lessons-learned document |
| `/cc-master:distill <retro-path...>` | Distill lessons into project assets (discipline-doc / skill / workflow / subagent) |
| `ccm account add\|list\|switch <email>` | Manage the Claude Code account pool |

### 3.7 The shape of one full workflow

```text
1. You:        /cc-master:as-master-orchestrator "Migrate the blog site to the new i18n architecture"
2. cc-master:  Create a Goal Contract → slice the goal into a DAG (T0 research → T1/T2 parallel implementation → T3 verification)
3. cc-master:  Assign each task a model role per O/T1/T2/T3, dispatch workers to Claude Code / Codex / etc.
4. Hit a call that truly needs you → /cc-master:discuss or /cc-master:bulk-discuss
5. Context nearly full → /cc-master:handoff-to-new-session → new session --resume, board is restored as-is
6. All tasks done → verify-board gate checks each Goal Contract clause → /cc-master:stop to archive
7. Optional:    /cc-master:retro → /cc-master:distill turns the lessons into team assets
```

## 4. System Architecture

### 4.1 Three-layer product model

```text
┌─────────────────────────────────────────────────────────┐
│  cc-master plugin (per-harness adapters)                  │
│  commands / skills / rules / hooks                          │
│  → Claude Code · Codex · Cursor · kimi-code            │
├─────────────────────────────────────────────────────────┤
│  ccm CLI + @ccm/engine (independent product)              │
│  board / Goal Contract / worker / agent registry /      │
│  quota / model policy / runtime / monitor / viewer      │
├─────────────────────────────────────────────────────────┤
│  ccm web-viewer (read-only, embedded in the ccm binary)   │
│  Graph / Board / List / Timeline / DecisionCard          │
└─────────────────────────────────────────────────────────┘
```

- **Layer 1**: per-harness plugin adapters — translate the same commands/skills/hooks into each harness's native shape.
- **Layer 2**: `ccm` CLI and `@ccm/engine` — the harness-decoupled engine product, responsible for the board, worker, quota, and model policy.
- **Layer 3**: `ccm web-viewer` — read-only browser view (Graph / Board / List / Timeline / DecisionCard).

### 4.2 The source-to-adapter projection model (paragoge style)

```text
plugin/src/                      ← canonical source (SSOT)
  skills/                        ← SAP: <skill>/canonical/ + adapters/<host>/strategy.yaml
  hooks/                         ← PHIP: _manifest/ + _hosts/<host>/ + implementations/<host>/
  commands/                      ← command body source
  adapters/                      ← cross-surface host-native invocation maps
plugin/dist/<host>/              ← generated adapter artifacts (committed to the repo)
  cc-master-plugin-claude-code-<version>.zip
  cc-master-plugin-codex-<version>.zip
  cc-master-plugin-cursor-<version>.zip
  cc-master-plugin-kimi-code-<version>.zip
```

### 4.3 Board v2 data model (narrow waist)

The Board is a JSON file at `~/.cc_master/boards/<UTC-timestamp>-<pid>.board.json`:

```json
{
  "schema": "cc-master/v1",
  "goal": "...",
  "owner": { "active": true, "session_id": "abc123", "heartbeat": "..." },
  "git": { "worktree": "/.../.claude/worktrees/i18n", "branch": "feat/i18n-rollout" },
  "wip_limit": 4,
  "tasks": [
    { "id": "T0", "status": "done", "deps": [], "artifact": "commit a1b2c3", "verified": true },
    { "id": "T1", "status": "in_flight", "deps": ["T0"], "mechanism": "sub-agent", "handle": "bg-7a" },
    { "id": "D1", "status": "blocked", "blocked_on": "user", "title": "Should the PR be split into two?" }
  ],
  "log": []
}
```

**Task status enum**: `ready / in_flight / blocked(blocked_on:"user"|"<taskid>") / done / escalated / failed / stale / uncertain`

**Narrow-waist principle**: only a small fixed set of fields are depended on by hooks — `schema / goal / owner.session_id / git / tasks[{id,status,deps}]` plus the status enum; everything else is "free-form for the agent." To change the narrow waist, you must update every hook + test in the same PR.

### 4.4 Eight distributed Skills (shared across all harnesses)

| Skill | Responsibility |
|-------|------|
| `master-orchestrator-guide` | Project lead identity, main-line decisions, DAG slicing/dispatch, dispatch/resume/verification/account-switching boundaries |
| `authoring-workflows` | Deterministically author workflows on supported hosts; explicitly degrade on unsupported hosts |
| `using-ccm` | Full ccm CLI manual, board model, state machine, Agent Registry, and engine validation rules |
| `slicing-goals-into-dags` | Slice goals into shippable, parallelizable, verifiable DAGs |
| `dev-as-ml-loop` | Treat a single dev task as a "propose → measure → adjust → converge" optimization loop |
| `engineering-with-craft` | DDD / SDD / TDD / OOP engineering craft and implementation red lines |
| `pacing-and-estimation` | Consume ccm read-only advice (usage / estimate / baseline) for pacing and estimation |
| `distilling-lessons-into-assets` | Route retrospective evidence into discipline-doc / skill / workflow / subagent assets |

### 4.5 O / T1 / T2 / T3 unified model assignment

| Role | Use |
|------|------|
| **O** (orchestrator) | Systems / architecture / design, adversarial review |
| **T1** | Primary implementation after the spec is complete |
| **T2** | Routine review, testing, repo investigation, structured summarization |
| **T3** | Mechanical, low-risk, highly verifiable batch work |

### 4.6 Hooks: dormant-until-armed

Every hook is fully dormant until the session is taken over by `as-master-orchestrator` and the board is activated; only `bootstrap-board.sh` is the exception (it IS the arming action). Seven categories of capability:

| Hook | Capability |
|------|------|
| `bootstrap` / `resume` | Create a board / take over an existing one |
| `reinject` / orchestrator context | After compaction, restore identity, Goal Contract, tasks, machine-level facts |
| `verify-board` | Stop gate: check unfinished goals, background agents, real completion evidence |
| `board-guard` / `board-lint` | Block manual edits to the board; structural validation after writes |
| `usage-pacing` | Consume ccm-cached quota / advice |
| `coordination inbox` | Decision-level notifications across sessions |
| `identity` / `critical-path nudge` | Restore role + critical-path attention in long sessions |

### 4.7 Quota posture and Monte Carlo prediction

- **Quota posture**: per-provider cached machine-level quota signals — Claude Code 5h/7d, Codex 7d hard limit, Cursor billing cycle, kimi-code rolling 5h/7d.
- **Monte Carlo prediction**: runs thousands of simulations on a schedule, producing a delivery-probability estimate — instead of guessing "it'll be ready tomorrow," you get a distribution.

### 4.8 Dual version line (ADR-022)

| Product | Version tag pattern | Release track |
|------|--------------|----------|
| cc-master plugin | `v0.22.0` (bare version) | Plugin release |
| `ccm` engine | `ccm-v0.23.0` | ccm release |

The plugin and engine are two independent version lines, pinnable separately — this guarantees "engine upgrades don't blow up plugins, plugin updates don't have to wait for the engine."

## 5. Design Philosophy

### 5.1 The conductor never plays an instrument

The coordinator coordinates, and never does unit work itself. Any change pushing the main thread toward "implementing/reviewing it myself" is the wrong direction — this is the single most important red line in the entire system.

### 5.2 Attention reallocation

The system's ultimate goal is not "automate everything," but to **reroute human attention to where it is actually worth spending**. Deterministic dirty work — breaking down, scheduling, progress, bookkeeping — gets automated; the non-outsourceable judgment — taste, design, direction — stays with the human.

### 5.3 ship-anywhere

Hooks only use **bash + node/JS** (the runtime guaranteed by the Claude Code host), not `jq` / `python` / raw TS; they don't depend on `agent-teams` or scheduled routines (unreliable); scheduled primitives (CronCreate) are used only for watchdogs, never for normal scheduling.

### 5.4 dormant-until-armed

If not activated, it does not exist: every hook is fully dormant until the session takes over and the board is activated, pushing "side effects when not in use" to zero.

### 5.5 Narrow waist

Hooks only depend on a tiny fixed field set; everything else is free-form space for the agent; changing the narrow waist must update every hook + test in the same PR. This lets the system balance "deterministic core" against "agent freedom."

### 5.6 Dual version-line decoupling

Plugin and engine release independently and can be version-pinned separately; the architecture decision is captured in ADRs (39 already exist). This embodies "long-horizon architecture decisions": make selections on a 3-year horizon, no temporary workarounds.

### 5.7 Explicit usage boundary

The most counter-intuitive part of the design philosophy is **proactively drawing the "shouldn't use" boundary**: ten-minute small fixes — just do them, don't call a project lead. The system is built for "too big, too messy, too long" goals — the larger the work, the more worth using it.

## 6. Synthesis: opinions and conclusions

1. **A single conversation's memory should not be the only work state**: persisting the Board to disk, surviving context resets and session handoffs, is the key step that takes long-horizon agent work from "demo" to "production-ready."

2. **Orchestration over invention**: cc-master doesn't invent a new agent — it orchestrates Claude Code / Codex / Cursor / kimi-code together — reusing existing authentication and capability; the value is in "conducting," not "the instrument."

3. **Human attention is a scarce resource; reallocate it**: automating deterministic dirty work (breaking down / scheduling / bookkeeping) while preserving non-outsourceable judgment (taste / design / direction) is the right division of labor in the age of AI-assisted coding.

4. **"Wish-driven full automation" is a fake need**: the explicit Goal Contract + verification gate + discuss mechanism prove that real usable orchestration must put humans back in the decision loop, not bypass them.

5. **Quota awareness is the foundation of long-horizon work**: Monte Carlo delivery prediction + per-provider quota posture turns "can it ship on time" from gut feeling into a probability distribution.

6. **A deterministic core and agent freedom can coexist**: the narrow-waist board + dormant hooks + ship-anywhere runtime give the system both verifiable determinism and agent flexibility.

7. **Cross-harness adaptation is systems engineering**: projecting the same set of skills/hooks/commands onto the native shape of 4 harnesses (SAP/PHIP model) is more sustainable than "writing a separate stack for each harness."

8. **Boundary awareness is a sign of maturity**: explicitly saying "when not to use" reflects a tool's clarity about its own positioning more than piling on features does.

## References

- Repo home: https://github.com/nemori-ai/cc-master
- Chinese README: `README_zh.md`
- Feature manual: `design_docs/feature-manual.md`
- Capability model: `design_docs/cross-harness-orchestration-capability-model.md`
- Full spec: `design_docs/spec.md`
- Glossary: `design_docs/glossary.md`
- Architecture decision records: `adrs/ADR-001…ADR-039`
- Command catalog: `plugin/src/skills/using-ccm/canonical/references/command-catalog.md`