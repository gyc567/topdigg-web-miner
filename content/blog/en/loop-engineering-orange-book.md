---
title: "Loop Engineering Orange Book Deep Dive: Stop Asking Me What It Is — From Prompter to System Designer"
description: "A complete analysis of the Loop Engineering Orange Book (v260615, MIT) by HuaShu (花叔) — a free open-source PDF book that explains loop engineering in plain language. Core idea: stop being the person who prompts the agent — design the system that prompts it for you. Covers the prompt→context→harness→loop stack, the five moves of one loop (Automations/Worktrees/Skills/Plugins/Sub-agents) + Memory, why an AI can't grade its own code, three real loops (Addy's morning triage / Stripe's Minions / the scheduling reality), four costs (verification debt / comprehension rot / token blowout / cognitive surrender), plus a full chapter-by-chapter tutorial from §01 to §09 and a hands-on guide to building your first loop today. Project overview, core ideas, design philosophy, and key takeaways in one read."
date: "2026-08-06"
author: "TopDigg Research Team"
tags: ["Loop Engineering", "Orange Book", "AI Agent", "Harness", "Claude Code", "Codex", "MCP", "HuaShu", "Automation"]
categories: ["Deep Dive"]
keywords: ["Loop Engineering", "Orange Book", "loop engineering", "AI agent", "Harness", "Claude Code", "Codex", "worktrees", "skills", "sub-agents", "verification debt", "cognitive surrender"]
---

# Loop Engineering Orange Book Deep Dive: Stop Asking Me What It Is — From Prompter to System Designer

> Core idea: **Stop being the person who prompts the AI — design the system that prompts it for you.** In June 2026, three industry figures — Peter Steinberger, Anthropic Claude Code lead Boris Cherny, and Google's Addy Osmani — independently named the same shift within a single week. HuaShu (花叔) turned it into a free, open-source Loop Engineering Orange Book: it doesn't teach you to write better prompts, it teaches you to design a loop system that finds work, hands it out, checks it, records it, and decides the next step. **Your job is no longer "prompting the agent" — it's "writing the loop."**

---

## 1. Project Overview

### 1.1 What Is It?

The **Loop Engineering Orange Book** (`Stop Asking Me What It Is`) is the Loop Engineering volume of HuaShu's Orange Book series — an open-source book that explains AI agent loop engineering in **plain language**. It ships as PDFs: a full Chinese edition (4.3MB) and an English edition (859KB), completely free under the MIT license.

It answers one question: when the "write a prompt" era ends, where does a programmer's value live? The answer is in the title — **stop asking what loop engineering is. Read the book, then go build your loop.**

### 1.2 Key Facts

- Repository: `https://github.com/alchaincyf/loop-engineering-orange-book`
- Version: **v260615** (first edition, June 2026)
- License: **MIT** (c) 2026
- Author: **HuaShu (花叔)** — AI Native Coder, indie developer
- Author platform: **500K+ followers** across platforms; shipped an App Store #1 paid iOS app built entirely with AI, never writing code by hand
- Author links: X @AlchainHust · YouTube @Alchain · website `huasheng.ai`
- Format: Chinese PDF (4.3MB, full) + English PDF (859KB) + free on WeChat Books

### 1.3 The Orange Book Series

This is the Loop Engineering volume of the **Orange Book series** — **12 published books, 994 pages total, all free** at `huasheng.ai/orange-books`:

| Vol. | Title | Pages |
|------|-------|-------|
| 01 | Claude Code: From Beginner to Pro | 102 |
| 02 | Claude Code Source Code Analysis | 72 |
| 03 | Harness Engineering (prerequisite) | 102 |
| 04 | Agent Skills | 80 |
| 05 | OpenClaw | 120 |
| 06 | Hermes Agent | 63 |
| 07 | Cursor: From Beginner to Pro | 50 |
| 08 | Gemma 4 Complete Guide | 42 |
| 09 | Polymarket Guide | — |
| 10 | Claude Opus 4.7 System Card (Chinese) | 232 |
| 11 | OpenAI Codex: From Beginner to Pro | 95 |
| 12 | Founder Action Handbook | 36 |

### 1.4 What Problem Does It Solve?

For ~2 years, the way to get value from coding agents was: write a good prompt → share context → read the response → write the next prompt. **The human held the tool one turn after another.** Loop engineering claims that era is ending: now you build a system that finds work, hands it out, checks it, records what was done, and decides the next step — **the system pokes the agents instead of you.** This book is the hands-on manual for building that system.

---

## 2. Core Ideas

### 2.1 The Paradigm Shift: From Prompter to System Designer

- Traditional way: human writes prompt → AI executes → human reviews → human writes another prompt.
- Loop engineering: human designs loop → loop prompts AI automatically → AI executes autonomously → loop verifies automatically → loop records automatically.
- **The human shifts from operator to architect** — your value is no longer writing better prompts, it's designing better control systems.

> "I don't prompt Claude anymore. I have loops running that prompt Claude and figuring out what to do. My job is to write loops." — Boris Cherny, head of Claude Code at Anthropic

> "You shouldn't be prompting coding agents anymore. You should be designing loops that prompt your agents." — Peter Steinberger

### 2.2 The Four-Layer Stack: prompt → context → harness → loop

```
prompt → context → harness → loop
```

- **Prompt**: The individual instruction.
- **Context**: What you give the agent to work with.
- **Harness**: The scaffolding around a single agent run — tools, completion criteria, feedback.
- **Loop**: The outer system that runs on a timer, spawns helpers, verifies, remembers, and decides.

Loop engineering **sits one floor above harness engineering**: harness equips a single run, loop equips the whole system.

### 2.3 The Five Moves of One Loop + Memory

| Move | Job in the Loop |
|------|-----------------|
| **Automations** | Go off on a schedule and do discovery + triage autonomously |
| **Worktrees** | So two agents working in parallel don't step on each other |
| **Skills** | Write down project knowledge the agent would otherwise just guess |
| **Plugins / Connectors** | Plug the agent into tools you already use (MCP) |
| **Sub-agents** | One has the idea, a different one checks it |
| **+ Memory / State** | A markdown file, a Linear board — anything outside the single conversation that holds what's done and what's next |

### 2.4 Maker/Checker Split: Why an AI Can't Grade Its Own Code

The book devotes a full chapter to arguing that **an AI that writes code cannot grade its own code.** Generation and evaluation must be split across separate agents (or separate model instances) — the author calls it **"GANs for prose."** The `/goal` command embodies this: it keeps working until a verifiable stopping condition holds, and **a separate small model checks whether you're done** — the agent that wrote the code isn't the one grading it.

---

## 3. Detailed Tutorial: 9 Sections Through the Whole Loop

The book is organized into **4 parts, 9 sections**. Here's the chapter-by-chapter walkthrough.

### 3.1 §01–§02 What It Is: Definition & the "One-Week Origin Story"

- **§01 Definition**: The precise definition and boundaries of loop engineering — not an upgrade to prompting, but a system layer beyond it.
- **§02 Origin**: The viral week of June 2026, when three industry figures (Peter Steinberger, Boris Cherny, Addy Osmani) independently named the same shift — plus the **prompt → context → harness → loop** stack.

### 3.2 §03 The Five Moves of One Loop

§03 walks through how each move works inside a real loop: scheduling handles discovery and triage, worktrees isolate parallelism, skills persist knowledge, connectors reach real tools, sub-agents split making from checking — plus memory as "the sixth thing."

### 3.3 §04 The Six Parts You Build It From

- Map the five moves onto your tools and you get six parts: **scheduler, worktrees, skill files, plugins/connectors, sub-agent definitions, state store**.
- The key primitives map almost **one-to-one** between the two big tools:

| Primitive | Job in the Loop | Codex App | Claude Code |
|-----------|-----------------|-----------|-------------|
| **Automations** | Discovery + triage on schedule | Automations tab, `/goal` | Scheduled tasks, `/loop`, `/goal`, hooks, GitHub Actions |
| **Worktrees** | Isolate parallel features | Built-in worktree per thread | `git worktree`, `--worktree`, `isolation: worktree` |
| **Skills** | Codify project knowledge | `SKILL.md` invoked with `$name` | `SKILL.md` (same format) |
| **Plugins / Connectors** | Connect your tools | MCP connectors + plugins | MCP servers + plugins |
| **Sub-agents** | Ideate and verify | TOML in `.codex/agents/` | Task subagents in `.claude/agents/` |
| **State** | Track what's done | Markdown or Linear | Markdown (`AGENTS.md`) or Linear via MCP |

### 3.4 §05 Why an AI Can't Grade Its Own Code

- **The verification principle**: the agent that writes code can't grade it — "maker" and "checker" must be separated.
- This is the design root of `/goal`: an independent small model checks "is it done" (e.g., "all tests in test/auth pass and lint is clean").

### 3.5 §06 Three Real Loops

1. **Addy's morning triage loop**: every morning an automation runs → invokes a triage skill that reads yesterday's CI failures, open issues, and recent commits → writes findings into a markdown file or Linear board → for each finding worth doing, opens an isolated worktree → sends a sub-agent to draft the fix → sends a second sub-agent to review against project skills and existing tests → connectors open the PR and update the ticket.
2. **Stripe's Minions**: Stripe's autonomous coding system that processes **~1,300 PRs per week** — a production-scale, assembly-line example of loop engineering.
3. **The scheduling reality**: time-driven execution brings its own engineering challenges — state management, failure recovery, human oversight. "Runs on a timer" is not free.

### 3.6 §07 The Four Costs (Sharper as Loops Get More Autonomous)

1. **Verification Debt**: a loop running unattended is also a loop making mistakes unattended. The maker/checker split makes "it's done" meaningful — but it's still a claim, not a proof.
2. **Comprehension Rot**: the faster the loop ships code you didn't write, the bigger the gap between what exists and what you actually understand. A smooth loop makes comprehension debt grow faster — unless you read what the loop made.
3. **Token Blowout**: an unchecked loop can consume massive tokens. Whether you're "token rich or poor" changes usage patterns wildly; carefully designed stop conditions are essential.
4. **Cognitive Surrender**: when the loop runs itself, it's tempting to stop having an opinion and just take whatever it gives back. **Designing the loop is the cure when done with judgment — and the accelerant when done to avoid thinking. Same action, opposite result.**

### 3.7 §08 Staying the Engineer

- The loop changes the work — **it doesn't delete you from it**.
- Two people can build the exact same loop and get opposite results: one uses it to move faster on work they understand deeply; the other uses it to avoid understanding the work at all.

> "The loop doesn't know the difference. You do."

### 3.8 §09 Build Your First Loop Today (Hands-On)

**Step 1: Pick a small chore**
Pick a repetitive task with a clear acceptance criterion (e.g., daily issue triage, daily CI sweep report).

**Step 2: Set the schedule**
Decide frequency and trigger. Use Claude Code scheduled tasks/`/loop`, GitHub Actions cron, or Codex's Automations tab.

**Step 3: Write the skill**
Put "how this project runs, why we don't do it this way" into `SKILL.md` — every loop round starts cold, so the skill is your externalized intent.

**Step 4: Set up state**
Create a `STATE.md` (or Linear board) recording "what's done, what's next" — that's memory, the sixth thing.

**Step 5: Split maker/checker**
Define two sub-agents in `.claude/agents/` or `.codex/agents/`: one drafts, one reviews against skills and tests. **The one who writes code doesn't grade.**

**Step 6: Week one — report only, no auto-fix**
Let the loop output findings only, without editing code. Read its output, correct the wrong parts — **you're still the engineer.**

**Step 7: Loosen the reins gradually**
Week one: report only → week two: attempt fixes in isolated worktrees → only then consider auto-merge. Every rule in `AGENTS.md` or a skill should trace back to a specific past failure — **earn each line.**

### 3.9 Tools & Commands Cheat Sheet

- Claude Code: `/goal` (run until a verifiable stopping condition), `/loop` (re-run on a cadence), scheduled tasks/cron, hooks, GitHub Actions, `git worktree`/`--worktree`, `isolation: worktree`, `.claude/agents/`
- Codex App: Automations tab (pick project/prompt/cadence/environment), triage inbox, built-in worktree per thread, `.codex/agents/` TOML
- Common to both: `SKILL.md` skills, MCP connectors, plugin distribution

---

## 4. Design Philosophy

### 4.1 "Build the System, Don't Be the Prompter"

The central philosophy: **you stop driving the agent turn-by-turn; you design the outer system once and let it drive.** Your job shifts from operator to architect. Loops are reusable, versionable, auditable — prompts are disposable.

### 4.2 The Loop Sits Above the Harness

Loop engineering **is one full floor above harness engineering**. Harness = equipping one agent run. Loop = the outer shell that runs on a timer, spawns helpers, verifies work, remembers state, decides next steps.

### 4.3 The Ratchet Principle: Every Mistake Becomes a Rule

**"Every mistake becomes a rule."** When the agent makes a mistake, you add a constraint so it never happens again. Every line in `AGENTS.md` or a skill should trace back to a specific past failure — **earn each line.** Loops compound: mistakes get absorbed into rules, and rules make the system stronger next round.

### 4.4 Worktrees Are the Discipline of Parallelism

Two agents writing the same file = the same headache as two engineers committing to the same lines. Git worktrees fix it: a separate working directory on its own branch, sharing repo history — **edits physically cannot touch each other.**

### 4.5 Skills Are Intent Externalized

Agents start every session cold. A skill is "intent written down on the outside" — conventions, build steps, "why we don't do it like this." Without skills, the loop re-derives project context from scratch every cycle. With skills, it **compounds**.

### 4.6 Products Are Converging, Not Diverging

Claude Code, Cursor, Codex, Aider, Cline — **they look more like each other than their underlying models do.** The models differ, but the harness patterns converge. That signals the industry is finding the load-bearing scaffolding that turns a generative model into something that ships.

> "A decent model with a great harness beats a great model with a bad harness."

---

## 5. Key Takeaways: Viewpoints & Conclusions

1. **The prompting era is ending; the loop era is beginning.** Three industry leaders independently said the same thing in one week — this isn't hype, it's industry consensus forming. The human moves from prompter to system designer.

2. **A loop's value is compounding, not one-off.** Prompts are disposable; loops are reusable, versionable, auditable assets. Mistakes get absorbed into rules via the ratchet, and rules make the system stronger every round.

3. **The maker/checker split is the bedrock of safety.** An AI can't grade its own code — the book's hardest technical argument. Generation and evaluation must be separated ("GANs for prose"), with an independent small model checking "done."

4. **Autonomy is not free; the four costs sharpen as autonomy deepens.** Verification debt, comprehension rot, token blowout, cognitive surrender — `/goal` stop conditions, isolated worktrees, and human gates all exist to brake these four costs.

5. **Same loop, different people, opposite results.** "The loop doesn't know the difference. You do." A loop is an amplifier: it accelerates people who understand deeply, and also people who avoid understanding. **Staying the engineer is the only correct posture.**

6. **Week one: report only, no auto-fix.** A new system's first week should only output findings, not edit code — build understanding and trust of the system's behavior first, then loosen permissions. This is loop engineering's safety philosophy.

7. **Tools converging means the industry found the load-bearing walls.** The harness patterns of major coding agents are converging — the scaffolding that turns models into shippable things has been validated. That's a paradigm signal for the whole industry.

> "Build the loop. But build it like someone who intends to stay the engineer, not just the person who presses go."

---

## References

- Repository: `https://github.com/alchaincyf/loop-engineering-orange-book`
- Chinese PDF: `https://github.com/alchaincyf/loop-engineering-orange-book/raw/main/Loop-Engineering橙皮书-v260615.pdf`
- English PDF: `https://github.com/alchaincyf/loop-engineering-orange-book/raw/main/Loop-Engineering-The-Complete-Guide-v260615.pdf`
- Orange Book series: `https://huasheng.ai/orange-books` (12 books, all free)
- Author site: `https://huasheng.ai` · X: @AlchainHust
- Foundations: Addy Osmani's founding Loop Engineering post (2026-06-07), Anthropic's harness-design engineering blog, Stripe's Minions public case study, official Claude Code / Codex docs
