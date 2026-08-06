---
title: "Loop Engineering Deep Dive (Cobus Greyling's Original): Stop Prompting Agents — Design the Loop That Discovers Work, Assigns Tasks, and Verifies Results"
description: "A complete analysis of Cobus Greyling's original Substack post 'Loop Engineering' (2026-06-09). Core idea: the shift from prompting coding agents turn-by-turn to designing a system (the loop) that discovers work, hands tasks to (sub-)agents, verifies results, persists state, and decides the next action — on a schedule or until a goal is met. Covers the concept evolution (Context Engineering → Harness Engineering → Loop Engineering), the harness/loop division of labor, the five building blocks + memory (Automations/Scheduling, Worktrees, Skills, Plugins & Connectors, Sub-agents + Memory), first-hand voices (Boris Cherny, Peter Steinberger, Addy Osmani), the tool-agnostic convergence of Grok/Codex/Claude Code primitives, and the realities not to skip (token costs, comprehension debt, cognitive surrender)."
date: "2026-08-06"
author: "TopDigg Research Team"
tags: ["Loop Engineering", "Cobus Greyling", "AI Agent", "Substack", "Harness Engineering", "Context Engineering", "Claude Code", "Grok", "Codex", "MCP", "Worktrees", "Skills", "Automation"]
categories: ["Deep Dive"]
keywords: ["Loop Engineering", "Cobus Greyling", "AI agent", "loop engineering", "Harness", "Context Engineering", "Claude Code", "Grok", "Codex", "worktrees", "skills", "sub-agents", "memory", "cognitive surrender"]
---

# Loop Engineering Deep Dive (Cobus Greyling's Original): Stop Prompting Agents — Design the Loop That Discovers Work, Assigns Tasks, and Verifies Results

> Core idea: **the shift from prompting coding agents turn-by-turn to designing a system (the loop).** In his original Substack post (2026-06-09), Cobus Greyling defines loop engineering as: you design a loop that **discovers work, hands tasks to agents (often sub-agents), verifies results, persists state, and decides the next action** — on a schedule or until a goal is met. The sharpest articulation comes from Boris Cherny (head of Claude Code at Anthropic): "I don't prompt Claude anymore. I have loops running that prompt Claude and figuring out what to do. **My job is to write loops.**" You are not writing a bigger prompt — you are building a system in which agents are just gears.

---

## 1. Project Overview

### 1.1 What Is It?

This article analyzes **Cobus Greyling's original Substack post "Loop Engineering"** (`cobusgreyling.substack.com/p/loop-engineering`, published **June 9, 2026**). It is not just a blog post — it is a manifesto-level articulation of a new AI-native development paradigm. In it, Cobus defines Loop Engineering as:

> **The shift from you being the one who prompts the coding agent turn-by-turn, to you designing a system (the loop) that discovers work, hands tasks to agents (often sub-agents), verifies results, persists state, and decides the next action — on a schedule or until a goal is met.**

The loop can be thought of as a **recursive goal** (Addy Osmani's framing): you define a purpose and the AI iterates until complete.

### 1.2 Key Facts

- Author: **Cobus Greyling**, Chief Evangelist at **Kore.ai**
- Platform: Substack (`cobusgreyling.substack.com`)
- Published: 2026-06-09
- Concept lineage: Context Engineering → Harness Engineering → **Loop Engineering**
- Companion OSS repo: `github.com/cobusgreyling/loop-engineering`
- Ecosystem links: Anthropic's *Effective harnesses for long-running agents*, *When AI builds itself*, Addy Osmani's X post, Peter Steinberger (creator of OpenClaw)

### 1.3 What Problem Does It Solve?

The legacy AI-coding workflow is: **write prompt → read output → write next prompt**. Humans hold the tool "one turn after another." The problem: you can't individually prompt 10 parallel agents, and the prompter role doesn't scale.

The answer (Loop Engineering): **build small autonomous control systems that use the agents.** You stop driving the agent turn-by-turn and instead design a system that runs itself — on a schedule or until a condition is met. That is the essential difference from a one-off conversation.

---

## 2. Core Ideas

### 2.1 The Three-Layer Evolution (Context First)

The post opens by situating the whole industry's evolution — which is itself a viewpoint:

> "(The AI landscape is unfolding fast…) remember when **Context Engineering** was new, then **Harness Engineering**… now we have **Loop Engineering**. Think of it as three layers, each solving a different problem."

The harness/loop division of labor:

- **Harness**: scaffolds a **single** agent run (tools, completion criteria, feedback).
- **Loop**: the layer that **keeps poking agents on a schedule, spawning helpers, and feeding itself.**

### 2.2 One-Sentence Definition (Addy Osmani's Framing)

> "Loop engineering is replacing yourself as the person who prompts the agent. You design the system that does it instead. A loop here can be thought of as a recursive goal where you define a purpose and the AI iterates until complete."

### 2.3 Two Signature Quotes

- **Peter Steinberger** (creator of OpenClaw): "You shouldn't be prompting coding agents anymore. **You should be designing loops that prompt your agents.**"
- **Boris Cherny** (head of Claude Code at Anthropic): "I don't prompt Claude anymore. I have loops running that prompt Claude and figuring out what to do. **My job is to write loops.**"

> The tooling convergence is striking: both Claude Code and OpenAI Codex have landed on very similar primitives, so the **"loop shape" is becoming somewhat tool-agnostic.**

---

## 3. Detailed Tutorial: Five Building Blocks + Memory (The Core Six-Part System)

This is the heart of the post. **A loop that actually runs unattended is not one long prompt — it is a small system with six parts.** Five are capabilities; the sixth is the spine that holds state between runs.

### 3.1 Block 1: Automations / Scheduling (The Heartbeat)

> **The heartbeat of the loop.**

- Without a schedule, you have a one-off agent session; with one, you have **discovery and triage on a cadence**.
- It turns "I should check CI every morning" into **something that happens whether or not you open a terminal**.
- **Claude Code**: `/loop`, `/schedule`, `/goal` (run until a verifiable condition is met, with a **separate model** checking "done" so the worker doesn't grade its own homework); Hooks and GitHub Actions carry the same idea outside the chat.
- **Grok**: `/loop [interval] <prompt>` plus the underlying scheduler tools (`scheduler_create`, `scheduler_list`, `scheduler_delete`) — recurring, durable, fire-immediately.

> "The heartbeat does not need to be clever but it needs to be reliable."

### 3.2 Block 2: Worktrees (Safe Parallel Execution)

- Two agents editing the same files at the same time = **a merge disaster waiting to happen**.
- Isolated git worktrees (or equivalent checkouts) give each agent its own working directory while sharing history.
- Both major coding-agent tools ship this; sub-agents can be launched into fresh checkouts so parallel work doesn't collide.

> In Grok: pass `isolation: "worktree"` when spawning sub-agents. **Cleanup matters.** A loop that leaves orphaned worktrees behind is a loop you will regret.

### 3.3 Block 3: Skills (Persistent Project Knowledge)

> Every session, the agent starts cold.

- Conventions, build commands, review standards, and the incident that taught you "we do not do it that way" — all of it must be externalized.
- **Skills are how you pay down intent debt.**
- A `SKILL.md` (plus optional scripts and references) holds the knowledge that should survive across runs.
- Claude Code uses `CLAUDE.md` and skills, packaged as plugins for sharing; Grok uses the same pattern.

> Without skills, every loop run is day one.

### 3.4 Block 4: Plugins & Connectors (Reaching Into Real Tools)

- **A loop that can only read the filesystem is a loop that can only suggest.**
- MCP-based connectors let the loop act: open PRs, update Linear tickets, post to Slack, query a database, trigger a runbook. The loop stops being a commentator and starts being an **operator**.
- MCP has become the common substrate — connectors written for one tool often port to another.

### 3.5 Block 5: Sub-agents (The Maker/Checker Split)

> **The agent that wrote the code is a poor judge of its own work.**

- This is not a model limitation — **it is a structural one**.
- One agent (or team) explores and implements; a **different one** (sometimes a stronger model, always with different instructions) verifies against specs, skills, and tests.
- In unattended loops, **the verifier is what lets you walk away with some confidence**.
- `/goal` in several tools applies the same principle: **a fresh model** decides whether the stopping condition has been met.

### 3.6 Block 6: Memory (The Durable Spine)

> None of the above survives a session boundary on its own.

- The loop must read from and write to something **external**: a `STATE.md`, a `LOOP-STATE.json`, a Linear board column, a GitHub Project view.
- Good state answers three questions:
  1. What are we working on right now?
  2. What did we try last time, and what happened?
  3. What is waiting for a human?

> For multi-day or multi-run loops, this is **non-negotiable**. The state file is often **the most important artifact the loop produces.**

---

## 4. Design Philosophy

### 4.1 Self-Driven Control Systems, Not Bigger Prompts

The spiritual core: **loop engineering is not a longer single prompt — it is a system that calls itself repeatedly.** Your role shifts from prompter to system designer. The leverage point has moved.

### 4.2 The Tool-Agnostic "Loop Shape"

On the convergence of agent tools, the post is explicit: Claude Code and OpenAI Codex landed on very similar primitives, so the loop shape is becoming **tool-agnostic** — a signal that the industry is converging on a standard orchestration playbook.

### 4.3 The Maker/Checker Separation Principle

Throughout the key quotes runs one philosophy: the most robust agent systems always keep an independent verifier, and **the agent that wrote the code never grades its own homework**. This is the minimum trust required for unattended operation.

### 4.4 Leverage or Trap — The Sobering Close

The post ends with a sober warning: "**Cognitive surrender is the comfortable trap.**" The same loop design can accelerate someone who stays the engineer — or let someone abdicate judgment entirely.

> Build the loop like someone who intends to stay the engineer — not just the person who presses go.

---

## 5. Summary: Viewpoints & Conclusions

1. **The direction of the shift is clear**: from "human writes prompt → agent executes" to "human designs loop → loop prompts agents automatically."
2. **The hierarchy**: Loop Engineering sits one level above "agent harness engineering."
3. **The shape**: loops are becoming tool-agnostic.
4. **The definition**: a recursive goal — you define a purpose, the AI iterates until complete.
5. **The structure**: any genuinely unattended loop is a "five capabilities + one memory" six-part system.
6. **The verifier is the reason you can walk away**: independent verification is what makes unattended operation trustworthy.
7. **The first-hand voices align**: Peter Steinberger and Boris Cherny both land on "my job is to write loops."
8. **Don't skip the realities**: token costs, comprehension debt, and cognitive surrender are real costs that an idealized narrative shouldn't hide.

### Key Quotes Worth Keeping

- Boris Cherny: "My job is to write loops."
- Peter Steinberger: "You should be designing loops that prompt your agents."
- "The heartbeat does not need to be clever but it needs to be reliable."
- "Skills are how you pay down intent debt."
- "The loop shipped it, but that does not mean you know how it works."

---

## References

- Original post: `https://cobusgreyling.substack.com/p/loop-engineering`
- Companion OSS repo: `https://github.com/cobusgreyling/loop-engineering`
- Anthropic engineering: `https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents`
- Anthropic (recursive self-improvement): `https://www.anthropic.com/institute/recursive-self-improvement`
- Author: Cobus Greyling (Chief Evangelist, Kore.ai) — `https://cobusgreyling.me/`
