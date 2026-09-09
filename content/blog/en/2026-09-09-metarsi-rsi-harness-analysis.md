---
title: 'MetaRSI/RSI-Harness Deep Analysis: An AI Tool That Builds Its Own Tools'
date: "2026-09-09"
description: "Deep analysis of CosmosMind-ai/RSI-Harness: Meta-Recursive Self-Improving System. Genome turns AI harness configuration into a versionable, shareable, auto-generable directory; harness-rsi is a meta-tool built with its own capabilities that reads your history to generate personalized Genomes."
tags:
  - RSI-Harness
  - MetaRSI
  - Genome
  - Recursive Self-Improving
  - Pi Coding Agent
  - AI Agent
  - Prompt Engineering
  - Open Source
categories:
  - Deep Analysis
  - AI Tools
  - Open Source
  - Recursive Self-Improving
---

# MetaRSI/RSI-Harness Deep Analysis: An AI Tool That Builds Its Own Tools

"Tuning an AI agent today scatters configuration across settings.json, CLI flags, prompts pasted around, and 'I remember that prompt worked well last time' — none of it versionable, diffable, reproducible, or handable to someone else."

This is the opening line from the RSI-Harness developer. The project attempts to answer a fundamental question: **if an AI can modify its own weights, why can't it modify its own harness — using the exact same means you'd use to write one manually?**

The answer is RSI-Harness.

---

## 1. Project Background and Core Positioning

### Meaning of the Name

**RSI-Harness** = Recursive Self-Improving Harness. The name contains two layers of recursion:

- **Layer 1**: Uses Pi coding agent as the base, adds a configuration layer called Genome on top
- **Layer 2**: harness-rsi is a special Genome inside it, whose output is other Genomes — a meta-tool built using its own capabilities, that reads your history to generate personalized harnesses

**MetaRSI** is the name in the paper title, referring to "Meta-Recursive Self-Improving System" — not the model editing its own weights, but the harness editing its own configuration, using exactly the same means you'd use to hand-write one.

### The Problem It Solves

Today's AI agent tuning dilemma:

| Current State | Problem |
|---------------|---------|
| settings.json | Only partial field coverage |
| CLI flags | Must be typed each time, can't be solidified |
| Pasted prompts | No version control |
| "I remember" | Completely non-reproducible |

RSI-Harness's solution: converge all harness configuration — system prompt, tool set, skills, MCP servers, extensions, runtime policies, memory, keybindings, themes — into one directory, called **Genome**. Switching contexts means switching Genomes.

### Core Architecture

```
Pi coding-agent ← immutable Core, not forked
     ↓
Genome adapter ← RSI-Harness project itself
     ↓
harness-rsi ← a Genome whose output is other Genomes
```

RSI-Harness does only one thing: **adds a Genome configuration layer on top of Pi's public configuration surface**. Pi's CLI, TUI, slash commands, keybindings, session tree/fork/resume, model and settings screens — all provided by Pi; RSI-Harness re-implements none of it.

---

## 2. Core Concept: What Is a Genome

### 2.1 Definition

A Genome is a complete, self-contained, deliverable harness configuration directory.

A Genome directory looks like:

```
my-genome/
  genome.json              # manifest + component list
  components/
    instructions.json      # system prompt
    tools.json             # tool configuration
    skills.json            # skill list
    commands.json          # slash commands
    model.json             # model configuration
    runtime.json           # runtime policies
    policies.json          # tool policies
    integrations.json      # MCP servers
    appearance.json        # theme
    settings.json          # all settings fields
    keybindings.json       # keybindings
    resources.json         # resource discovery scope
  contracts/               # contract docs for each component
  skills/                  # bundled skill files
  extension/               # bundled extensions
```

12 components with mutually exclusive field ownership. Out-of-bounds writes fail at load time — for example, a tools component trying to set system_prompt → immediate failure.

### 2.2 Merge Semantics: Inherit, Not Replace

Genome configuration is **patch, not replacement**:

- Field absent → inherits from base (ultimately Pi's default)
- Field is `null` → explicitly resets to Pi default
- Field has value → overrides; objects merge recursively, arrays replace wholesale

This means a Genome that only declares the `model` component still gets Pi's full system prompt, full tool set, and AGENTS.md discovery. **You never reimplement a harness to change one field.**

### 2.3 Two Built-in Genomes

| Genome | Purpose |
|--------|---------|
| `coding` (or `paperlab`) | Example code-writing harness configuration |
| `harness-rsi` | Generates other Genomes, launched via `gee` command |

---

## 3. harness-rsi: Building Itself with Its Own Means

This is the most brilliant part of the project.

### 3.1 Where It Lives

`config/genomes/harness-rsi/` is only the **seed**. The first time you run `rsih --genome harness-rsi`, it copies the entire directory into `~/.rsih/genomes/harness-rsi/`, and loads from there ever after — skills and extensions all read from the user's own directory, never pointing back to the repo.

### 3.2 Why It Can Be Just a Genome

Everything harness-rsi needs is provided by Genome's existing components:

| Need | Component |
|------|-----------|
| Positioning and enforced workflow | `instructions` `append_system_prompt` |
| Methodology docs, loaded on demand | `skills`, a file-based Pi skill |
| `grep`/`find`/`ls` for reading sessions | `tools` (Pi disables these by default) |
| Three interactive tools | `integrations.extensions`, Genome's own `.ts` |
| Draft and long-session handling | `policies` scratchpad and compaction |
| Block irrelevant global skills | `resources.isolate: true` |

**Zero lines in `src/` are specifically for harness-rsi.** It is proof of the invariant: "Genome can configure anything."

### 3.3 `resources.isolate: true`

Measured: without isolation, 58 skills from `~/.agents/skills` all enter the system prompt, prompt size 36 KB; after isolation, only `genome-authoring` remains, prompt size 7 KB. For an agent with a strictly defined workflow, those 57 irrelevant skills are both noise and interference.

Isolation only disables Pi's **automatic discovery** (`--no-skills --no-prompt-templates --no-themes --no-extensions`). Resources declared by the Genome still load normally.

### 3.4 GEE: Genome Expression Engine

GEE is harness-rsi's frontend command:

```bash
gee  # equivalent to rsih :harness-rsi
```

GEE's approach is unique: **it never asks what system prompt you want — it reads what you actually did**.

Interaction flow:

1. **Ask about the scenario first**: what is this Genome for? Use your own words, be specific — what it outputs, what tools and files it touches, what counts as done, where it usually goes wrong
2. **Ask about session scope**: which harness histories to scan (RSIH included by default, can add Pi and Claude Code's)
3. **Group sessions by working directory**: return path, sources, session count, byte count, time span, excerpts of first user messages
4. **User selects workspaces**
5. **Agent analyzes on its own**: first use bash for aggregation (tool-call histograms, frequent commands, frequent paths, accessed domains), then selectively read raw text
6. **Show the plan before writing**: present the entire Genome in prose — what it's called, which components it declares, what goes in each component (prompt text, what each skill manages, each generated tool's parameters, each MCP command, each memory entry, each setting value), evidence for each decision, and what was considered but cut. Detailed enough that the user can object to wording, not just the title. Then ask "build it like this?"
7. **Write files only after confirmation**: write to `~/.rsih/genomes/<name>/`, run `rsih genome validate`

### 3.5 One Design Principle

> **Nothing is written as code except what the agent genuinely cannot obtain on its own.**

The extension has only three tools, because only three things are genuinely beyond the agent:
- Session directory names are encoded paths
- The library is too large to read whole, so must be bounded
- Multi-select pages require keyboard focus

Everything else — how to read long sessions, how to sort, what becomes what — is text in skills and system prompt, executed by the agent facing the user. **Changing strategy doesn't require changing code.**

---

## 4. 12 Components in Detail

| Component | Owns |
|-----------|------|
| instructions | `system_prompt`, `append_system_prompt` |
| tools | Built-in tool on/off (patch semantics), argument narrowing, generated tools |
| skills | Inline skills and Pi skill files/directories |
| commands | Inline slash commands and Pi prompt template files |
| model | Default provider/model, model cycle list, request options |
| runtime | Tool execution, steering, follow-up, max turns, thinking level |
| policies | Tool policies, scratchpad, compaction, memory |
| integrations | Pi extensions and stdio MCP servers |
| appearance | Pi theme assets, theme selection, theme discovery |
| settings | Every field of Pi's settings.json |
| keybindings | Every binding in Pi's keybindings.json |
| resources | Scope of Pi's automatic resource discovery (isolate) |

---

## 5. Installation and Usage Tutorial

### 5.1 Requirements

- Node 22.19+
- bun recommended (compiles to single-file binary)

### 5.2 Installation

```bash
git clone https://github.com/CosmosMind-ai/RSI-Harness.git
cd RSI-Harness
./install.sh
```

The install script checks dependencies, builds, installs to `~/.local/bin`, then asks for install mode:
- `--copy`: moves binary and all assets out of the repo (production use)
- `--link`: symlinks to build output (for hacking on RSIH itself)

### 5.3 Basic Usage (without Genome)

```bash
rsih                           # launch, equivalent to pi
rsih --resume                  # resume last session
rsih --fork <session>          # fork a session
rsih -p "Review the workspace" # single command
```

Scripted usage with `--run-id`:

```bash
rsih :notes -p "Outline this week's lab notes" --run-id week-32 --cwd ~/lab
rsih -p "Section 3 is too long; split it" --run-id week-32 --cwd ~/lab
rsih -p "Export as markdown" --run-id week-32 --cwd ~/lab --json
```

### 5.4 Launch a Genome

Four equivalent spellings:

```bash
rsih --genome coding           # explicit
rsih :coding                   # colon shorthand
rsih ::coding                  # double colon
rsih +coding                   # plus
```

### 5.5 GEE: Generate a New Genome

```bash
gee  # equivalent to rsih :harness-rsi
```

Follow the prompts. The generated Genome goes to `~/.rsih/genomes/<name>/`.

### 5.6 Manage Genomes

```bash
rsih genome list               # list installed Genomes
rsih genome show coding        # show resolved Genome
rsih genome validate ./my-genome  # validate Genome
rsih genome install coding     # restore factory version
```

### 5.7 Development Checks

```bash
npm run check       # typecheck + test + build
npm run build:binary
npm run smoke:binary
npm run sync:contracts  # after editing docs/genome/components/
```

---

## 6. Design Philosophy

### 6.1 Configuration Is First-Class

The problem of "scattered AI agent configuration" can only be solved by treating configuration as a first-class engineering artifact. Genome converges all configuration into a versionable, diffable, shareable directory, making harness configuration a real engineering asset instead of fragmented memory.

### 6.2 Immutable Core, Configuration Is Everything

Pi's Core is immutable. RSI-Harness doesn't fork it — only uses its public configuration surface. This means:
- Every Pi upgrade, RSI-Harness automatically gains new capabilities (tests protect this invariant)
- Every Genome modification changes only configuration, not the behavior engine

### 6.3 Self-Referential Meta-Tool

harness-rsi is built from Genome's own components: its charter lives in instructions, methodology in skill files, interactive tools in its own extension. Zero lines of special-purpose code. This isn't clever engineering — it's strict adherence to what "RSI" means: **the tool builds itself using exactly the means you'd use to build it manually.**

### 6.4 Evidence Over Self-Report

GEE doesn't ask "what harness do you want" — it reads what you actually did. Tool-call histograms, frequent bash commands, hot files, corrections you repeat — these are evidence. The scenario description is the yardstick: evidence must answer "is this thing true" not "is this what they wanted." When evidence and intent conflict, use `AskUserQuestion` to present both readings with their evidence to the user.

### 6.5 Seeds Update, But Never Overwrite You

Built-in Genome seeds copy to `~/.rsih/genomes/` on first use and load from there ever after. When a seed updates:
- You didn't edit → auto refresh
- You edited → warning only, no overwrite
- Someone else's same-name Genome → no overwrite (different genome_id)

### 6.6 Constraints Produce Stability

12 components, mutually exclusive field ownership, out-of-bounds writes fail at load time. This isn't just an engineering constraint — it's a commitment to "good harnesses should be clear." A component can only manage what it's supposed to manage, no boundary crossing.

---

## 7. Core Views and Conclusions

### View 1: Harness Configuration Should Be a Versioned Engineering Artifact

Today we can code-review code, but we can't diff "that prompt that worked well." Genome makes this possible — you can Git commit a genome, file a PR, do code review, run CI validation. **This is the starting point of true AI agent engineering.**

### View 2: The Correct Form of Meta-RSI Is Not Editing Weights

Recursive self-improvement shouldn't be the model editing its own weights (that's dangerous and unpredictable) — it should be the harness editing its own configuration (that's safe, auditable, rollbackable). RSI-Harness proves: letting a harness improve itself using exactly the means you'd use to write one manually — preserves explainability while achieving self-improvement.

### View 3: Personalization from Evidence Is the Direction of Next-Gen AI Configuration

The traditional approach asks users "what do you want" and writes configuration from answers. The problem: users don't know what they want, or can't express it. GEE's approach extracts patterns from actual behavior — what you did is more reliable than what you said. Configuration fields without supporting evidence stay empty — empty means inheriting Pi's default, and the default is always the safe answer.

### View 4: A Tool Building Itself with Its Own Means Is Feasible

harness-rsi proves this: the extension has only three tools (`scan_workspaces`, `choose_workspaces`, `ask_user_question`), because only three things are genuinely beyond the agent. Everything else — analyzing sessions, formulating plans, writing configuration — is driven by text in skills and system prompt. **Changing strategy doesn't require changing code.** That's truly sustainable design.

### View 5: Isolation Is a Necessary Condition for Professional Agents

58 irrelevant skills flooding the prompt drown the signal. `resources.isolate: true` disables automatic discovery so the prompt contains only what the Genome declares. For agents with strictly defined workflows, irrelevant inputs are not just noise — they're enemies of stability.

---

## 8. Current Status and Limitations

### Implemented

- Building end-to-end usable Genomes (12 components covering Pi's entire configuration surface)
- Inherit-by-default merge semantics
- Settings compilation layer
- Directory bundling and distribution
- Seed update mechanism
- harness-rsi interactively generating Genomes from RSIH, Pi, and Claude Code session stores

### Not Yet

- One-command remote installs (`genome install` currently accepts only built-in names and local paths, not git/npm URLs)
- Pre-publish redaction gate (a Genome distilled from private transcripts needs to flag absolute paths, intranet domains, and possible secrets before sharing)
- Codex session store integration (1341 files / 2.9 GB, largest single file 298 MB, needs MB-scale read windows or a join against history.jsonl)

---

## 9. Summary

RSI-Harness answers a fundamental question: how can an AI agent's harness configuration be treated as an engineering artifact like code?

Answer: **make it a directory, a Genome.**

- Versionable, diffable, reproducible, shareable
- 12 components covering full configuration surface, inherit-by-default merging
- harness-rsi builds itself using its own means, generates personalized Genomes from actual user behavior
- Doesn't fork Pi Core, only uses public configuration surface, automatically benefits from every Pi upgrade

This isn't a configuration tool — it's a thought experiment about how AI can build itself. **The tool builds itself using its own means, knows itself through evidence not self-report, and achieves recursive improvement through configuration not weights.** That is what Meta-RSI should look like.

Project: https://github.com/CosmosMind-ai/RSI-Harness
Paper: https://www.cosmosmind.ai/research/metarsi-v1.pdf
HuggingFace: https://huggingface.co/CosmosMind/RSI-Harness

---

If you found this article helpful, feel free to like, share, and leave a comment. To receive updates promptly, hit the follow button. See you in the next article.

First published on WeChat Official Account 「比特财商」.
