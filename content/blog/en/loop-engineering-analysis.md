---
title: "Loop Engineering Deep Dive: Stop Prompting — Design the Loop That Runs Your AI Agent Autonomously"
description: "A complete analysis of Loop Engineering — Cobus Greyling's AI agent loop engineering framework. Core idea: you don't need to prompt AI anymore. You need to design a system that prompts AI automatically. Features 5 building blocks (Automations/Schedule, Worktrees, Skills, Plugins/Connectors, Sub-agents) + Memory/State, 7 production patterns (Daily Triage, PR Babysitter, CI Sweeper, Dependency Sweeper, Changelog Drafter, Post-Merge Cleanup, Issue Triage), progressive autonomy from L1 reporting to L2 assisted fixes to L3 unattended, and a full tool ecosystem (loop-audit/loop-init/loop-cost/loop-sync/loop-context/loop-worktree/loop-gate/loop-sandbox/loop-swarm). Covers core ideas, design philosophy, full tutorial, and feature inventory."
date: "2026-08-04"
author: "TopDigg Research Team"
tags: ["Loop Engineering", "AI Agent", "Automation", "Grok", "Claude Code", "Codex", "MCP", "DevTools", "Prompt Engineering"]
categories: ["Deep Dive"]
keywords: ["Loop Engineering", "AI agent", "loop engineering", "automation", "Grok", "Claude Code", "Codex", "MCP", "skills", "worktrees", "triage", "autonomy"]
---

# Loop Engineering Deep Dive: Stop Prompting — Design the Loop That Runs Your AI Agent Autonomously

> Core idea: **You don't need to prompt AI anymore. You need to design a system that prompts AI automatically.** Peter Steinberger says: "You should not be prompting your coding agent anymore. You should be engineering loops that prompt your agent." Boris Cherny (Anthropic Claude Code lead): "I don't prompt Claude anymore. I have loops running that prompt Claude and figuring out what to do. My job is to write the loop." Loop Engineering is Cobus Greyling's AI agent loop engineering framework — its core is **5 building blocks** (Automations/Schedule, Worktrees, Skills, Plugins/Connectors, Sub-agents) + **Memory/State**, paired with 7 production patterns and progressive autonomy from L1 to L3, transforming AI agents from "needs human prompting" into "autonomously running systems."

---

## 1. Project Overview

### 1.1 What Is It?

**Loop Engineering** is an **AI agent loop engineering framework** — it doesn't teach you how to write better prompts, but how to design a system that makes AI agents run autonomously. Core positioning: **the paradigm shift from "prompt engineering" to "loop engineering."**

### 1.2 Key Facts

- Repository: `https://github.com/cobusgreyling/loop-engineering`
- Website: `https://cobusgreyling.github.io/loop-engineering/`
- Stars: **9,838**
- Forks: **1,335**
- License: **MIT**
- Language: **JavaScript**
- Author: **Cobus Greyling**
- Created: 2026-06-09
- Ecosystem: memory-engineering → loop-engineering → harness-foundry → outerloop → fleet-engineering

### 1.3 What Problem Does It Solve?

The pain of traditional AI-assisted development: you manually write prompts every time, AI doesn't remember what it did last, there's no quality feedback loop, and you can't safely let AI modify code autonomously. Loop Engineering's answer: **design a loop system** — define cadence, triage logic, state persistence, isolated execution, and verification gates, so AI agents run autonomously within the loops you design.

---

## 2. Core Ideas

### 2.1 From "Prompt Engineering" to "Loop Engineering"

Traditional: human writes prompt → AI executes → human checks → human writes another prompt. Loop Engineering: human designs loop → loop automatically prompts AI → AI executes autonomously → loop verifies automatically → loop records automatically. **Human shifts from "prompter" to "system designer."**

### 2.2 The 5 Building Blocks + Memory

- **Automations/Schedule**: discover and triage on a cadence
- **Worktrees**: safe parallel execution
- **Skills**: persistent project knowledge
- **Plugins/Connectors**: connect to real tools (MCP)
- **Sub-agents**: maker/checker separation
- **+ Memory/State**: the persistent spine beyond conversation

### 2.3 Seven Production Patterns

- **Daily Triage**: 1d-2h cadence, L1 report-only, low token cost
- **PR Babysitter**: 5-15min cadence, L1 monitor, high token cost
- **CI Sweeper**: 5-15min cadence, L2 cautious fix, very high token cost
- **Dependency Sweeper**: 6h-1d cadence, L2 patch-only, medium token cost
- **Changelog Drafter**: 1d or tag cadence, L1 draft, low token cost
- **Post-Merge Cleanup**: 1d-6h cadence, L1 off-peak, low token cost
- **Issue Triage**: 2h-1d cadence, L1 propose-only, low token cost

### 2.4 Progressive Autonomy: L1 → L2 → L3

- **L1 Report-only**: AI reports findings only, no auto-fix (first-week rule)
- **L2 Assisted fix**: AI attempts fixes in isolated worktrees, requires verifier confirmation
- **L3 Unattended**: AI fixes autonomously and auto-merges, requires budget and gating

### 2.5 Loop Readiness Score

`loop-audit` scores your loop system 0-100, telling you what still needs improvement. Score ≥ 80 → recommended to version as a harness-foundry runtime stack.

---

## 3. Design Philosophy

### 3.1 "Design the System, Not the Prompt"

Boris Cherny says: "My job is to write the loop." This means an AI engineer's value is no longer writing better prompts, but designing better control systems. Loops are reusable, versionable, auditable — prompts are disposable.

### 3.2 "First Week: Report Only, Don't Fix"

In the first week of a new system, AI can only report findings, never auto-fix. This gives humans enough time to understand the loop's behavior, build trust, then gradually grant more permissions.

### 3.3 "Memory Is the Spine Beyond Conversation"

Without memory, AI agents start from zero every conversation. Loop Engineering gives AI agents cross-session persistent memory through STATE.md, loop-budget.md, and other files.

### 3.4 "Verification Is More Valuable Than Generation"

Every loop has a verifier sub-agent — it doesn't trust the maker sub-agent's output, but verifies independently. This maker/checker separation is the foundation of safe autonomy.

### 3.5 "Progressive Trust"

L1 → L2 → L3 is not a technical upgrade, but a trust upgrade. Each step requires human confirmation that the system deserves more autonomy.

---

## 4. Full Tutorial

### 4.1 Five-Minute Quickstart

**Step 1: Choose your pain point**

Not sure which pattern to use? Interactive selector: `https://cobusgreyling.github.io/loop-engineering/#interactive`

Or start with Daily Triage — low risk, learn loop discipline.

**Step 2: Scaffold in your repo**

```bash
# Unified CLI (recommended)
npx @cobusgreyling/loop init . --pattern daily-triage --tool grok

# One-shot health check (audit + sync + first 3 actions)
npx @cobusgreyling/loop doctor .
```

Supported tools: `grok` (default), `claude`, `codex`, `opencode`. `cursor`, `windsurf`, `openclaw` need manual copying.

**Step 3: Check cost**

```bash
npx @cobusgreyling/loop cost --pattern daily-triage --level L1 --cadence 1d
```

**Step 4: Audit readiness**

```bash
npx @cobusgreyling/loop doctor .
```

Score 0-100 with specific improvement suggestions. Score ≥ 80 → version as harness-foundry.

**Step 5: Run your first loop — report only**

Grok:
```bash
/loop 1d Run loop-triage. Update STATE.md. No auto-fix in week one.
```

Claude Code:
```bash
/loop 1d Run $loop-triage. Read STATE.md. Merge findings into High Priority and Watch List. Update Last run. Do not edit code.
```

**Step 6: Read output, commit state**

Open `STATE.md`. Did the loop capture real priorities? Edit the wrong parts — you're still the engineer.

### 4.2 L2: Isolated Fix Attempts

```bash
# Create isolated worktree for a fix attempt
npx @cobusgreyling/loop-worktree create --run-id pr-217-fix-1 --pattern pr-babysitter

# Verifier rejects — mark for cleanup
npx @cobusgreyling/loop-worktree mark --run-id pr-217-fix-1 --status rejected

# Clean up rejected/upgraded worktrees older than 24h
npx @cobusgreyling/loop-worktree cleanup --older-than 24h
```

### 4.3 Circuit Breakers (L2+)

```bash
npx @cobusgreyling/loop context --check --ledger loop-ledger.json
# Exit 0 = continue · Exit 2 = escalate to human
```

Triggers: max iterations, same error N times, too many consecutive failures, token budget cap.

### 4.4 Gate Configuration

Create `gate.yaml` in repo root:

```yaml
version: 1
denylist:
  - "src/auth/**"
  - "**/*.env"
autoMergeAllowlist:
  - "docs/**"
  - "**/*.md"
```

```bash
npx @cobusgreyling/loop gate check --action auto-merge --paths <f1,f2,...>
# Exit 0 = allowed · Exit 2 = escalate to human
```

---

## 5. Tool Ecosystem

- **loop**: unified CLI entry point (init/doctor/status/audit/cost)
- **loop-audit**: loop readiness score CLI (0-100)
- **loop-init**: scaffolding + budget/run log + constraints
- **loop-cost**: token consumption estimator
- **loop-sync**: STATE.md ↔ LOOP.md drift detection
- **loop-context**: stateful memory manager + circuit breakers
- **loop-mcp-server**: MCP runtime lookup (patterns/skills/state)
- **loop-worktree**: isolated git worktree per fix attempt
- **loop-gate**: path deny-list + auto-merge allow-list enforcement
- **loop-sandbox**: temporary worktree isolation + patch capture
- **loop-action**: GitHub Composite Action for running loops in CI
- **loop-swarm**: multi-agent consensus sandbox (N sequential runs, majority must pass)

---

## 6. Takeaways (Key Insights & Conclusions)

1. **"Writing loops" has more leverage than "writing prompts."** Prompts are disposable — loops are reusable, versionable, and auditable systems. Boris Cherny says "my job is to write the loop," signaling a shift from prompter to system designer.

2. **Progressive trust is the only safe path to autonomy.** L1 → L2 → L3 is a trust upgrade, not a technical one. First week report only, second week attempt fixes, third week consider unattended. This progressive approach gives humans verification opportunities at every step.

3. **Memory is the AI agent's "spine."** Without memory, AI agents start from zero every conversation. Loop Engineering gives agents persistent cross-session memory through STATE.md, loop-budget.md, and other files.

4. **Verifiers are the foundation of trust.** Every loop has maker and verifier sub-agents — the verifier doesn't trust the maker's output, but verifies independently. This maker/checker separation is the basis for safe autonomy.

5. **Token cost is a real constraint.** High-frequency loops (like CI Sweeper every 5 minutes) consume tokens rapidly. Loop Engineering makes token cost visible and manageable through the loop-cost estimator and loop-budget files.

6. **Ecosystem thinking.** Loop Engineering is not an isolated tool — it's part of the memory → loop → foundry → outerloop → fleet ecosystem. Each layer solves a different dimension: memory, patterns, runtime, governance, swarm.

---

## References

- Repository: `https://github.com/cobusgreyling/loop-engineering`
- Website: `https://cobusgreyling.github.io/loop-engineering/`
- Original post: `https://cobusgreyling.substack.com/p/loop-engineering`
- Addy Osmani commentary: `https://addyosmani.com/blog/loop-engineering/`
- Quickstart: `https://github.com/cobusgreyling/loop-engineering/blob/main/docs/QUICKSTART.md`
- Pattern registry: `https://github.com/cobusgreyling/loop-engineering/blob/main/patterns/registry.yaml`