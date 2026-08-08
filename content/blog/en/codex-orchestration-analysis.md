---
title: "Codex-Orchestration Deep Dive: How One Plugin Embeds Fable 5, Opus 5, and Kimi K3 Into Codex So Every AI Plays a Different Role in Collaborative Development"
description: "A comprehensive analysis of Cjbuilds/Codex-Orchestration (580+ stars). This open-source plugin introduces Planner, Advisor, Designer, and Executor roles into a Codex task — letting Claude Fable 5 plan, Opus 5 review, Kimi K3 design, and GPT-5.6 Luna implement. Covers the three core problems it solves (single-model limitations, provider lock-in, no independent review), a detailed installation tutorial, the role-based workflow, design philosophy, and security boundaries distilled from the production-readiness audit."
date: "2026-08-08"
author: "TopDigg Research Team"
tags: ["Codex-Orchestration", "Codex", "OpenAI", "Multi-Agent", "Claude Fable 5", "Claude Opus 5", "Kimi K3", "OpenRouter", "MCP", "Model Routing", "AI Agent", "Python", "Role-Based Agent"]
categories: ["Analysis"]
keywords: ["Codex-Orchestration", "Codex multi-model collaboration", "Claude Fable 5", "Claude Opus 5", "Kimi K3", "OpenRouter", "MCP plugin", "model routing", "Planner Advisor Designer Executor", "external models", "Gate 0", "credential security", "multi-agent collaboration", "AI coding assistant", "OpenAI Codex"]
---

# Codex-Orchestration Deep Dive: One Plugin, Four Roles, Infinite Teamwork

> **Core idea:** "You don't need a single more powerful model — you need a better collaboration framework." Codex-Orchestration pushes multi-model cooperation to its extreme: Planner uses Fable 5 to plan, Advisor uses Opus 5 to review, Designer uses Kimi K3 to design, and Executor uses GPT-5.6 Luna to implement. Codex remains the boss, but now the right AI handles the right job.

---

## I. What Is It? (Explained for Absolute Beginners)

Imagine you're running a team coding project — but your team isn't made of people. It's made of AI assistants.

Normally, you only hire one AI assistant. It has to be the project manager, the designer, the coder, and the QA tester all at once. The result? The project manager rushes into coding without thinking hard enough. The designer's output isn't polished. The QA gets forgotten in the rush.

Codex-Orchestration is like a **smart team-management plugin** for Codex (OpenAI's AI coding assistant). It doesn't replace your AI assistant — it **hires more AI assistants**, each specializing in one job:

- **Planner** — Turns your request into a detailed execution plan. Think of it as the project manager drawing the roadmap.
- **Advisor** — Reviews the plan, finds gaps, makes sure nothing slips through. Like a quality manager catching bugs before code is written.
- **Designer** — Creates UI/UX designs, ensuring the product looks good and works well.
- **Executor** — Actually writes the code to implement the approved plan.

**The coolest part:** Each "assistant" can be a different model from a different company:
- Planner → **Claude Fable 5** (great at planning)
- Advisor → **Claude Opus 5** (great at reviewing)
- Designer → **Kimi K3** (massive 1M token context)
- Executor → **GPT-5.6 Luna** (fast at implementing)

And your original Codex AI stays as the **CEO** — deciding when each specialist joins, collecting their work, and signing off on the final result.

---

## II. Project Overview

### 2.1 Basics

| Attribute | Details |
|-----------|---------|
| **Name** | Codex-Orchestration |
| **Author/Organization** | Cjbuilds (GitHub) |
| **Repository** | [https://github.com/Cjbuilds/Codex-Orchestration](https://github.com/Cjbuilds/Codex-Orchestration) |
| **Stars** | 582+ (as of July 2026) |
| **Forks** | 59+ |
| **Language** | Python 3.11+ |
| **License** | MIT |
| **Created** | July 10, 2026 |
| **Current Version** | 0.9.3 (Unreleased) |

### 2.2 The Problem It Solves

#### Problem 1: One Model Can't Do Everything Well

When you ask Codex to do a complex task, it must wear many hats:

1. Understand requirements → 2. Plan the solution → 3. Review for risks → 4. Write code → 5. Test & verify

A single model is mediocre at each stage. GPT-5.6 Sol might have great planning intuition but miss edge cases in review. Fable 5 excels at reviewing details but isn't the fastest at implementation.

#### Problem 2: Model Selection Is Locked to ChatGPT/OpenAI

Codex's native interface only lets you pick models registered on the ChatGPT/OpenAI platform. Want to use Anthropic's Claude or OpenRouter's Kimi K3? Those "external models" normally can't be wired into Codex's workflow.

#### Problem 3: No Independent Review Mechanism

The most dangerous scenario in multi-model collaboration is **self-review** — the planner reviewing its own plan. Codex-Orchestration enforces strictly that **Planner and Advisor MUST use different models**, guaranteeing independent review every time.

#### Problem 4: Credential Security

Pasting an API key into chat, or writing it to a config file, is a massive security risk. Codex-Orchestration implements a **security checkpoint system** — credentials never appear in chat logs or code repositories.

### 2.3 Core Features

| Feature | Description |
|---------|-------------|
| **Role Routing** | Maps Planner, Advisor, Designer, Executor to different models |
| **External Model Support** | Brings in models from OpenRouter (e.g., Kimi K3) as external roles |
| **Claude Integration** | Connects Claude Fable 5 / Opus 5 as Planner or Advisor |
| **Secure Credential Management** | Uses OS credential store — never stores keys in chats or codebases |
| **Preview-First** | Every operation previews first, then applies — prevents accidental mistakes |
| **Routing Repair** | Fixes routing settings if they get out of sync |
| **Self-Updating Plugin** | `$codex-orchestration:codex-orchestration --update` |

---

## III. Core Ideas

### 3.1 The Four-Role System

Codex-Orchestration introduces four specialist roles into a Codex task, each responsible for one phase of the development lifecycle:

#### 🎯 Planner
- **Responsibility**: Translates user requirements into a detailed execution plan
- **Workflow**: Receives request → creates plan → receives Advisor feedback → improves plan
- **Optional**: If omitted, the current Codex model serves as Planner
- **Example models**: Claude Fable 5, GPT-5.6 Sol

#### 🔍 Advisor
- **Responsibility**: Reviews the plan for gaps, risks, and technical pitfalls
- **Workflow**: Receives plan → identifies issues → returns `PLAN_APPROVED` or `PLAN_REVISE`
- **Optional**: If omitted, no review stage occurs
- **Example models**: Claude Fable 5, Claude Opus 5, GPT-5.6 Sol
- **Limit**: Maximum 8 review rounds — stops execution if not approved

#### 🎨 Designer
- **Responsibility**: Turns the approved plan into design assets (UI/UX, interaction design, info architecture)
- **Workflow**: Receives plan → produces design files → passes to Executor
- **Optional**: If omitted, no design stage occurs
- **Example models**: GPT-5.6 Terra, Kimi K3 (external)

#### ⚙️ Executor
- **Responsibility**: Implements the approved plan in code
- **Workflow**: Receives plan + design → implements → delivers
- **Required**: Always must be specified
- **Example models**: GPT-5.6 Luna

### 3.2 Workflow

```text
                         YOUR TASK
                             |
                             v
                  CODEX COORDINATES THE WORK
                             |
                             v
               PLANNER CREATES THE FIRST PLAN
               Fable 5, another model, or Codex
                             |
                             v
                    ADVISOR REVIEWS IT
                       finds real gaps
                             |
                   needs work? -- yes --+
                             |            |
                            no            v
                             |      PLANNER IMPROVES IT
                             |            |
                             +<-----------+
                             |
                       PLAN APPROVED
                             |
                             v
                DESIGNER SHAPES THE EXPERIENCE
                (optional design handoff)
                             |
                             v
                  EXECUTORS IMPLEMENT IT
                             |
                             v
                    CODEX TESTS & DELIVERS
```

> **Key rule**: Planner and Advisor must use **different models**. This is the core safeguard that ensures "independent review."

### 3.3 Design Philosophy

#### Philosophy 1: Codex Is Always the Boss

> "The model selected for the Codex task remains in charge."

Codex-Orchestration **never replaces** Codex itself. It only brings more models in as "assistants." Codex remains:

- The one that decides how to decompose tasks
- The one that chooses when each assistant steps in
- The one that collects all results
- The one that does final validation & delivery

#### Philosophy 2: Preview First, Fail-Closed

All operations follow the "Preview → Confirm → Apply" flow:

```bash
# Preview (makes no changes)
python3 configure_native_routing.py --codex-bin <path> --status

# Apply
python3 configure_native_routing.py --codex-bin <path> --status --require-effective
```

If any check fails, the system **stops immediately** rather than proceeding. This "fail-closed" design ensures security boundaries aren't accidentally breached.

#### Philosophy 3: Credentials Are Never Stored

> "Never paste an API key into Codex chat. The repository, provider TOML, registry, journal, logs, and tests store no key."

The project enforces a strict rule: **API keys must never appear anywhere visible**. Credential handling works like this:

1. **Preparation phase**: A hidden local prompt in a trusted terminal
2. **Storage**: OS credential store (macOS Keychain / Linux Secret Service / Windows Credential Manager)
3. **Retrieval**: Only fetched at request time when an API call is needed
4. **Forbidden everywhere**: chat logs, config files, source code, Git, logs, tests, registry — none ever store the key

#### Philosophy 4: Routing Is Policy-Guided, Not Engine-Enforced

> "Same-provider routing could be mistaken for an engine-enforced executor selector."

Routing is **policy-guided**, meaning:

- Codex can still choose not to delegate
- The `model` parameter is a "suggested" route, not a hard mandate
- If routing fails, Codex falls back to the root model

#### Philosophy 5: Principle of Least Privilege

Every role has clearly defined permission boundaries:

- **Planner**: Can plan only; cannot edit code
- **Advisor**: Can review plans only; cannot execute or edit
- **Designer**: Can edit only design artifacts; cannot modify implementation code
- **Executor**: Can implement the plan; does not interfere with other roles
- **Claude subprocesses**: no-tools, no-persistence, minimal environment

---

## IV. Key Findings & Conclusions

### 4.1 Five Lessons from the Production-Readiness Audit

The project underwent a formal **production-readiness audit** on July 12, 2026. The audit found and fixed several issues:

| Severity | Original Problem | Resolution |
|----------|-----------------|------------|
| **High** | README led with internal routing details; ordinary users couldn't understand it | Rewrote in plain language: "What is it?", "Why it matters", "How to install" |
| **High** | Fable 5 was developed separately; advisor workflow couldn't be guaranteed | Integrated an opt-in, root-directed Fable bridge with login checks and fail-closed review |
| **High** | `main` branch was mutable; no PR review process | Required PRs, status checks, admin enforcement, blocked force-push |
| **High** | Same-provider routing could be mistaken for engine-enforced executor selector | Described as policy-guided routing; defined 4 precise states: config / effective / accepted / confirmed |
| **Medium** | Restore-state persistence failures ignored rollback errors | Added rollback status verification; report when managed fields may persist |

> **Conclusion**: The project started with a hard question — "how do we make complex routing tech both safe and usable?" — and solved it through rigorous auditing and iteration.

### 4.2 Three Routing Methods

| Method | When to Use | Example | Security Level |
|--------|-------------|---------|----------------|
| **Same-Provider Direct** | Switching models within one provider | GPT-5.6 Sol → Luna | Standard (through App Server config) |
| **Claude Subscription** | Want to use Fable 5 / Opus 5 as Planner or Advisor | Fable 5 High as Planner | High (sealed bridge) |
| **External Models** | Using OpenRouter-backed models | Kimi K3 via OpenRouter | High (Gate 0 + OS credential store) |

> **Conclusion**: The plugin provides a complete "model access pyramid" — from the simplest same-provider direct routing to the most stringent external model integration.

### 4.3 Kimi K3's Credential Security Architecture

Kimi K3 (via OpenRouter) is the most representative "external model" case in this project. It demonstrates the full security architecture:

1. **Provider Preparation**: Only adds `[model_providers.openrouter]` and command-backed `auth` table
2. **Authentication**: OS credential store + hidden local prompt (never paste keys in chat)
3. **Gate 0 Probe**: One paid, isolated probe to verify the model actually works
4. **Role Creation**: Creates provider-pinned personal agent variants
5. **Sealed Execution**: Uses `codex exec` direct CLI call with all tools disabled

> **Critical point**: Every installation starts "unqualified" until it passes one explicitly billable isolated Gate 0. You can't "steal" unbilled model access.

### 4.4 Version Evolution Timeline

From the CHANGELOG, we can trace a clear evolution:

- **v0.1–v0.3** (Jul 9): Basic advisor workflow; secure external model roles
- **v0.4** (Jul 10): Config-first routing becomes the primary workflow; v2 spawn metadata support
- **v0.5.1** (Jul 16): **Planner role added**; Fable 5 supports Planner + Advisor simultaneously
- **v0.6.0** (Jul 18): External models (Kimi K3), OS credential store, Gate 0 probe — security foundation complete
- **v0.7–v0.72** (Jul 18): Designer role; `--update`; concise activation confirmation
- **v0.8.0** (Jul 18): Sealed direct CLI transport for READY external models
- **v0.9.0** (Jul 25): **Claude Opus 5** added; raised review ceiling from 5 → 8 rounds; security hardened

> **Conclusion**: In just one month, the project went from v0.1 to v0.9 — each release fixing specific security or usability issues.

### 4.5 Engineering Craftsmanship

From the production-readiness audit's "Deliberate boundaries that remain" section, the designers showed meticulous attention to every attack surface:

1. **External Model READY roles use sealed direct CLI transport**, not Desktop native spawn-agent — preventing tool abuse
2. **There is no engine-level executor selector** — routing is always policy-guided; Codex retains final decision power
3. **Direct model overrides inherit the root provider** — cross-provider requires explicit configuration
4. **Claude Fable 5 is a narrowly-scoped built-in exception** — only as Planner/Advisor, never as Designer/Executor
5. **"Any model" has precise boundaries** — only models from Codex's provider, a configured compatible custom provider, or a deliberately bundled bridge. The plugin never creates accounts, credentials, or protocol compatibility.

> **Conclusion**: At every decision point, the designers chose **fail-closed** over **convenience-first**. In the age of increasingly autonomous AI agents, this "trust but verify, convenience but security" philosophy may well be the standard for future multi-model collaboration.

---

## V. Detailed Tutorial

### 5.1 Installation

First, install the Codex-Orchestration plugin into Codex:

```bash
# Install from marketplace
codex plugin marketplace add Cjbuilds/Codex-Orchestration

# Add the plugin to Codex
codex plugin add codex-orchestration@codex-orchestration
```

> ⚠️ **Important**: After installation, you must **restart Codex and start a new task** to activate the plugin.

### 5.2 Command Syntax

All operations are done through **Codex prompts** (not terminal commands). You type this format in the Codex chat:

```text
$codex-orchestration:codex-orchestration <command>
```

For example, to check current status:

```text
$codex-orchestration:codex-orchestration status
```

### 5.3 Configuring Roles (`setup`)

The `setup` command is the most important one — it maps each role to a specific model. Syntax:

```text
$codex-orchestration:codex-orchestration setup \
  planner: <model and effort>, \
  advisor: <model and effort>, \
  designer: <model and effort>, \
  executor: <model and effort>
```

#### Example 1: Fable 5 plans, Sol reviews, Luna implements

```text
$codex-orchestration:codex-orchestration setup planner: Claude Fable 5 High, advisor: GPT-5.6 Sol High, executor: GPT-5.6 Luna Extra High
```

Breakdown:
- **Planner** = Claude Fable 5 (effort: High) — planning
- **Advisor** = GPT-5.6 Sol (effort: High) — reviewing
- **Executor** = GPT-5.6 Luna (effort: Extra High) — implementing
- **Designer** = omitted (no designer configured)

#### Example 2: Full four-person team + Kimi K3 as designer

```text
$codex-orchestration:codex-orchestration setup planner: Claude Fable 5 High, advisor: GPT-5.6 Sol High, designer: GPT-5.6 Terra High, executor: GPT-5.6 Luna Extra High
```

#### Example 3: Current Codex model plans, Fable 5 only as Advisor

```text
$codex-orchestration:codex-orchestration setup advisor: Claude Fable 5 High, executor: GPT-5.6 Luna Extra High
```

### 5.4 Configuration Rules

- **`executor` is required** — determines who implements the plan
- **`planner` is optional** — if omitted, the current Codex model serves as Planner
- **`advisor` is optional** — if omitted, no review stage occurs
- **`designer` is optional** — if omitted, no design stage occurs
- **Planner and Advisor must use different models** — ensures independent review

### 5.5 Claude Fable 5 / Opus 5 Effort Options

| Model | Supported Efforts | Default | Notes |
|-------|-------------------|---------|-------|
| **Claude Fable 5** | Low, Medium, High, XHigh, Max | High | `Ultra` is accepted as an alias for `Max` |
| **Claude Opus 5** | Low, Medium, High, XHigh, Max | High | Does NOT accept `Ultra`; requires Claude Code 2.1.219+ |

> **Claude Fable 5 and Opus 5 can only be used as Planner or Advisor** — never as Designer or Executor.

### 5.6 Querying External Model Availability

You can ask natural-language questions to check if external models are available:

```text
is Kimi available to use as Designer?
```

The plugin checks the External Model registry and reports four distinct states:

1. **supported**: Kimi K3 is bundled and supported by the plugin
2. **configured**: Kimi K3 is configured on this installation
3. **locally ready**: Kimi K3 is ready to use in the current workspace
4. **callable now**: Kimi K3 has been verified callable via a sealed invocation

### 5.7 Configuring External Models (Kimi K3 Example)

If you want to use an external model like Kimi K3, you go through a staged process:

#### Step 1: Configure the External Role

```text
$codex-orchestration:codex-orchestration configure external role researcher with OpenRouter model moonshotai/kimi-k3 at max; job: gather evidence and cite sources
```

#### Step 2: Authentication

The plugin displays a hidden local prompt in your terminal, guiding you to store the API key in your OS credential store. **Never paste the API key into Codex chat!**

#### Step 3: Gate 0 Probe

You must **explicitly approve** one potentially billable, isolated probe:

```bash
python3 <skill-dir>/scripts/external_configurator.py \
  --codex-bin <codex-binary-path> \
  gate0 --provider openrouter --model moonshotai/kimi-k3 --effort max --acknowledge-billing
```

> This step incurs real API costs. Only run it after explicit confirmation.

#### Step 4: Create the Role

```bash
python3 <skill-dir>/scripts/external_configurator.py connect \
  --role researcher \
  --purpose "Gather evidence from the bounded packet and cite sources." \
  --provider openrouter \
  --model moonshotai/kimi-k3 \
  --effort max --apply
```

#### Step 5: Restart

After completion, you **must restart Codex and start a new task** for the role to load.

#### Step 6: Call the Role

```text
$codex-orchestration:codex-orchestration call researcher at max — review this bounded research packet
```

### 5.8 Status & Maintenance

| Command | Purpose |
|---------|---------|
| `status` | Show current routing configuration |
| `status --require-effective` | Check if configuration is actually effective (for CI/CD) |
| `repair` | Repair routing hints if they've drifted from saved state |
| `--update` | Update the plugin to the latest version |
| `disable` | Restore settings to pre-install state |

### 5.9 Designer: Kimi K3 Quick-Use Label

If Kimi K3 is already ready, you can use the shorthand seat-label syntax:

```text
$codex-orchestration:codex-orchestration Planner: Claude Fable 5 High, Designer: Kimi K3
```

`Designer: Kimi K3` maps automatically to role=designer, provider=openrouter, model=moonshotai/kimi-k3, effort=max. **Important caveats**:

- Kimi K3 only supports `max` reasoning; any other effort is rejected
- This shorthand does NOT add Kimi to the Codex Desktop model picker
- It does NOT replace any GPT route
- **Cannot** paste API keys in chat — cannot authorize Gate 0 paid probes

### 5.10 Using with Codex Goals

You can create a normal Codex Goal, then instruct Codex to use the saved workflow:

```text
Please use the saved codex-orchestration workflow until this Goal completes.
```

Codex still manages Goal state, permissions, integration, and verification; the plugin only guides which model performs each role.

### 5.11 Security Operations

#### How to safely store credentials

1. **Never** paste an API key in Codex chat
2. **Never** write the key to config files, source code, Git, or logs
3. **Correct method**: Store via the OS credential store (macOS Keychain / Linux Secret Service / Windows Credential Manager)

#### If a key is compromised

`disconnect` and `remove provider` only delete exact plugin-managed role files and provider config. They **never touch**:
- Chats or sessions
- OpenAI authentication
- User-owned custom roles

---

## VI. Installation & Development

### 6.1 Development Environment Setup

```bash
# Clone the repo
git clone https://github.com/Cjbuilds/Codex-Orchestration.git
cd Codex-Orchestration

# Install dev dependencies
python3 -m pip install -r requirements-dev.txt

# Compile & lint
python3 -m compileall -q plugins tests scripts
python3 -m ruff check plugins tests scripts

# Run tests
python3 -m unittest discover -s tests -v
python3 tests/plugin_lifecycle_smoke.py
python3 scripts/release_check.py
```

### 6.2 Version Requirements

- **Python**: 3.11+
- **Codex Desktop**: 0.144.0-alpha.4+ (for v2 spawn metadata)
- **Claude Code**: 2.1.219+ (for Opus 5 support)

---

## VII. Conclusion

Codex-Orchestration is an innovative **AI team management plugin**. It doesn't merely solve "single-model capability limits" — it redefines what multi-model collaboration can look like through three key architectural principles:

### 7.1 Three Groundbreaking Principles

1. **Role-based routing**: Assign different models to Planner / Advisor / Designer / Executor, maximizing each vendor's strengths
2. **Secure external model integration**: OpenRouter + OS credential store + Gate 0 probe safely brings models like Kimi K3 into Codex
3. **Policy-guided, not engine-enforced routing**: Codex remains CEO; routing is a suggestion, not a mandate

### 7.2 Three Delivered Values

1. **Stronger planning**: Fable 5 is great at planning — delegate planning to it
2. **Stricter quality control**: Opus 5 is great at reviewing — independent review prevents self-review
3. **Faster execution**: Luna excels at fast implementation — and supports parallel execution

### 7.3 The Designers' Wisdom

From the production-readiness audit, the designers chose **fail-closed** over **convenience-first** at every attack surface:

- **Credential security**: Keys are never stored in chats, code, configs, Git, or logs — always via OS credential store
- **Routing security**: Cross-provider requires explicit configuration, preventing accidental unauthorized provider use
- **Review security**: Planner and Advisor must be different models — preventing "reviewing your own homework"
- **Update security**: Plugin self-update requires canonical source verification, preventing malicious replacement

This project demonstrates a mature approach to AI agent safety: **not "what can we do?" but "what must we not do?"** In an age where AI agents are becoming increasingly autonomous, this "trust but verify, convenience but security" design philosophy may well become the standard for multi-model collaboration.

---

## VIII. Key Takeaways

| Viewpoint | Source | Conclusion |
|-----------|--------|------------|
| **Multi-model ≠ Single model stronger** | README | Assigning different models to different roles is more effective than maximizing a single model |
| **Review plans before coding** | Workflow diagram | Advisor review is a "planning gate," not an implementation guarantee |
| **External models need strict auditing** | Production-readiness audit | Can't use "arbitrary URL" as provider — must be a reviewed, bundled manifest |
| **Credential zero-retention is a floor** | CHANGELOG v0.6.0 | API keys are never stored in chats, code, Git, configs, or logs |
| **Codex is always the boss** | SKILL.md | The plugin never replaces Codex — it only guides model routing |
| **Fail-closed beats convenience** | Auditor | All security boundaries fail-closed, not best-effort |
| **Version evolution is security-driven** | CHANGELOG | v0.5→0.6: credential security; v0.7→0.8: sealed CLI transport; v0.9: Opus 5 + 8-round review |
| **Observable states beat promises** | Providers-and-models.md | Routes have precise states (installed/effective/accepted/confirmed) — never vague marketing claims |
