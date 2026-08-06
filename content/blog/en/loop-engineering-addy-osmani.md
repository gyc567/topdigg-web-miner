---
title: "Loop Engineering Deep Dive (Addy Osmani's Original): Stop Prompting AI Turn-by-Turn — Design a Loop That Finds Work, Hands It Out, and Verifies Results, Then Stay the Engineer"
description: "A complete analysis of Addy Osmani's original blog post 'Loop Engineering' (2026-06-07) by the Google Cloud AI engineering director and former Chrome team member. Core idea: loop engineering is replacing yourself as the person who prompts the agent — a loop is a recursive goal where you define a purpose and the AI iterates until complete. Opens with the two quotes that frame the paradigm: Peter Steinberger ('You shouldn't be prompting coding agents anymore. You should be designing loops that prompt your agents.') and Anthropic Claude Code head Boris Cherny ('I don't prompt Claude anymore. I have loops running that prompt Claude and figuring out what to do. My job is to write loops.'). Covers: how loop sits one floor above the harness (runs on a timer, spawns sub-agents, feeds itself), the five building blocks + memory (Automations / Worktrees / Skills / Plugins & Connectors / Sub-agents + Memory), a primitive-by-primitive mapping between Codex app and Claude Code, what one complete loop looks like (morning automation → triage skill → isolated worktree → drafting/review sub-agents → connectors open the PR), the tool-agnostic insight (stop arguing about tools once the shape is the same), and the three things the loop still does NOT do for you (verification is still on you, comprehension rot, cognitive surrender). Closing maxim: Build the loop. Stay the engineer."
date: "2026-08-06"
author: "TopDigg Research Team"
tags: ["Loop Engineering", "Addy Osmani", "AI Agent", "Claude Code", "Codex", "Automations", "Worktrees", "Skills", "Sub-agents", "MCP", "Harness Engineering", "Cognitive Surrender"]
categories: ["Deep Dive"]
keywords: ["Loop Engineering", "Addy Osmani", "AI Agent", "Claude Code", "Codex", "Automations", "Worktrees", "Skills", "Sub-agents", "MCP", "Harness Engineering", "Memory", "Cognitive Surrender", "Stay the Engineer"]
---

# Loop Engineering Deep Dive (Addy Osmani's Original): Stop Prompting AI Turn-by-Turn — Design a Loop That Finds Work, Hands It Out, and Verifies Results, Then Stay the Engineer

> Core idea: **Loop engineering is replacing yourself as the person who prompts the agent.** In his original blog post (2026-06-07), Addy Osmani (former Google exec, Director of Engineering at Google Cloud AI) defines a loop as a **recursive goal** — you define a purpose and the AI iterates until complete. He believes this may be the future of how we work with coding agents, but: "it's still early, I'm skeptical and you absolutely have to be careful about token costs." Two quotes frame the whole piece: Peter Steinberger (OpenClaw creator) — "**You shouldn't be prompting coding agents anymore. You should be designing loops that prompt your agents.**" — and Boris Cherny, head of Claude Code at Anthropic — "**I don't prompt Claude anymore. I have loops running that prompt Claude and figuring out what to do. My job is to write loops.**" Instead of holding the tool turn after turn, you build a small control system that pokes the agents for you. But the sharpest warning comes at the end: **Build the loop. Stay the engineer.** The loop does not verify for you, does not stop your comprehension from rotting, and does not stop you from cognitive surrender. Designed with judgment, it is the cure; used to avoid thinking, it is the accelerant.

---

## 1. What This Is

### 1.1 The source

This analysis is based on **Addy Osmani's original blog post《Loop Engineering》published on addyosmani.com on 2026-06-07**. It is not a tutorial — it is a paradigm manifesto plus a practical breakdown of how we collaborate with coding agents.

Addy's background matters: **former Google exec, currently Director of Engineering at Google Cloud AI, 14 years at Google**, a giant in web performance and front-end engineering (author of *Learning JavaScript Design Patterns*, Chrome team background). In 2026 he wrote a dense series of posts about AI coding collaboration — agent harness engineering, the factory model, orchestration tax, intent debt, comprehension debt, cognitive surrender, adversarial code review, code agent orchestra, long-running agents — and *Loop Engineering* is the **culmination** of that series.

The definition:

> **Loop engineering is replacing yourself as the person who prompts the agent. You design the system that does it instead.**

A loop = **a recursive goal**: you define a purpose, the AI iterates until complete. It is an engineering discipline built on a shift in the human engineer's role: **you are no longer the person typing prompts every day — you design the system that decides who prompts, when, and how results get verified.**

### 1.2 Key facts

- Author: **Addy Osmani**, former Google exec, Director of Engineering at Google Cloud AI, world-renowned front-end engineer and developer advocate
- Channel: personal blog `addyosmani.com`
- Published: **2026-06-07**
- Stance: **"I believe this may be the future of how we work with coding agents. However, it's still early, I'm skeptical and you absolutely have to be careful about token costs"**
- Key quotes from: Peter Steinberger (OpenClaw creator), Boris Cherny (head of Claude Code at Anthropic)
- Concept lineage: agent harness engineering (the environment one agent runs in) → factory model (the system that builds software) → **loop engineering (one floor above the harness: runs on a timer, spawns little helpers, feeds itself)**
- Related series: orchestration tax, intent debt, comprehension debt, cognitive surrender, adversarial code review, code agent orchestra, long-running agents

### 1.3 What problem it solves

For the last two years, the way you got something out of a coding agent was: **write a good prompt, share enough context, type a thing, read what came back, type the next thing** — "the agent is a tool and you are holding it the entire time, one turn after the other." Addy's verdict: **"That part is kind of over, or at least some think it's going to be."**

The new paradigm's answer: **you build a small system that replaces your direct conversation with the agent.** That system finds the work, hands it out, checks it, writes down what is done, then decides the next thing — and you let that system poke the agents instead of you.

The key shift: **this is no longer a tool problem.** A year ago, a loop meant writing a pile of bash and maintaining it forever; **now the pieces just ship inside the products** (Codex, Claude Code). Steinberger's list maps almost exactly onto the Codex app, and almost the same onto Claude Code — once you notice the shape is the same, you stop arguing about which tool and just design a loop that works no matter which one you happen to be sitting in.

---

## 2. Core Ideas

### 2.1 One-line definition, two industry quotes

Addy opens with two quotes that land the paradigm. First, Peter Steinberger (OpenClaw creator, the breakout personal-AI-assistant open-source project of 2026):

> "You shouldn't be prompting coding agents anymore. You should be designing loops that prompt your agents."

Second, Boris Cherny, head of Claude Code at Anthropic:

> "I don't prompt Claude anymore. I have loops running that prompt Claude and figuring out what to do. My job is to write loops."

### 2.2 The loop sits one floor above the harness

Addy had already written about the *agent harness engineering* (the environment a single agent runs in) and the *factory model* (the system that builds software). Where loop engineering sits:

> **Loop engineering sits one floor above the harness.**

- **Harness**: the scaffolding for **one** agent run (tools, acceptance criteria, feedback)
- **Loop**: "the harness but it runs on a timer, it spawns little helpers, and it feeds itself"

So: the harness arms a single run; the loop is the layer that **continuously schedules agents, spawns sub-agents, and feeds itself.**

### 2.3 Same shape → stop arguing about tools

Addy highlights an observation that surprised him: **"This is not really a tool thing anymore."** A year ago a loop meant hand-written, forever-maintained bash; now **the pieces ship inside the products**. The conclusion:

> Once you notice the shape is the same, you stop arguing about which tool, and just design a loop that works no matter which one you happen to be sitting in.

Loop design is a **tool-agnostic craft** — one of the most important takeaways in the piece.

---

## 3. Tutorial: the five things a loop needs, plus one place to remember stuff

Addy gives the list explicitly: **"A loop needs five things and then one place to remember stuff."**

| # | Component | Job in the loop |
|---|-----------|-----------------|
| 1 | **Automations** | Fire on a schedule; do discovery and triage by themselves |
| 2 | **Worktrees** | So two agents working in parallel don't step on each other |
| 3 | **Skills** | Write down the project knowledge the agent would otherwise just guess |
| 4 | **Plugins & Connectors** | Plug the agent into the tools you already use |
| 5 | **Sub-agents** | One has the idea, a different one checks it |
| 6 | **Memory** | Something outside the single conversation that holds what's done and what's next |

### 3.1 Primitive mapping table (Codex app vs Claude Code)

| Primitive | Job in the loop | Codex app | Claude Code |
|---|---|---|---|
| **Automations** | Discovery + triage on a schedule | Automations tab: pick project, prompt, cadence, environment; runs that find something land in a Triage inbox; `/goal` for run-until-done | Scheduled tasks and cron, `/loop`, `/goal`, hooks, GitHub Actions |
| **Worktrees** | Isolate parallel features | Built-in worktree per thread | `git worktree`, `--worktree`, `isolation: worktree` on a subagent |
| **Skills** | Codify project knowledge | Agent Skills (`SKILL.md`), invoked with `$name` or implicitly | Agent Skills (`SKILL.md`) |
| **Plugins / Connectors** | Connect your tools | Connectors (MCP) plus plugins for distribution | MCP servers plus plugins |
| **Sub-agents** | Ideate and verify | Subagents defined as TOML in `.codex/agents/` | Task subagents in `.claude/agents/`, agent teams |
| **State (memory)** | Track what's done | Markdown or Linear via a connector | Markdown (`AGENTS.md`, progress files) or Linear via MCP |

> "The names are a bit different here and there but the capability is the same thing."

### 3.2 Automations — the heartbeat

**Automations are what make a loop an actual loop, not just one run you did once.**

- **Codex app**: create one in the Automations tab — pick the **project, the prompt it will run, how often, and whether it runs on your local checkout or a background worktree**. Runs that find something go to a **Triage inbox**; runs that find nothing archive themselves ("which is nice"). OpenAI uses them internally for boring stuff: **daily issue triage, summarising CI failures, writing commit briefings, hunting bugs somebody added last week.** An automation can call a skill — keeping the recurring thing maintainable: you fire `$skill-name` instead of pasting a giant wall of instructions into a schedule nobody will ever update.
- **Claude Code**: gets to the same place through scheduling and hooks — `/loop` to re-run a prompt/command on an interval, cron for scheduled tasks, hooks to fire shell commands at lifecycle points, or push the whole thing to **GitHub Actions** so it keeps running after you close the laptop.

Two in-session primitives worth knowing (closer to the heart of the post):

- **`/loop`**: re-runs on a cadence.
- **`/goal`**: keeps going until a condition you wrote is actually true; **after every turn a separate small model checks whether you're done** — the agent that wrote the code isn't the one grading it. Give it something like "all tests in test/auth pass and lint is clean" and walk away. Codex has the same thing, also called `/goal`: it works across turns until a verifiable stopping condition holds, with pause/resume/clear.

> "Same primitive, both tools, which is kind of the pattern for this whole article."

**Role**: Automations are the part that **surfaces the work**; the rest of the loop acts on it.

### 3.3 Worktrees — so parallel doesn't turn into chaos

**The moment you run more than one agent, file collisions become the failure.** Two agents writing the same file is the exact same headache as two engineers committing to the same lines without talking.

- **git worktree**: a separate working directory on its own branch sharing the same repo history — one agent's edits **literally cannot touch** the other's checkout.
- **Codex**: builds worktree support right in, so several threads hit the same repo at once without bumping into each other.
- **Claude Code**: same isolation via `git worktree`, a `--worktree` flag to open a session in its own checkout, and an `isolation: worktree` setting on a subagent so each helper gets a fresh self-cleaning checkout.

Addy's point (echoing his *orchestration tax*): **worktrees remove the mechanical collision, but YOU are still the ceiling** — your review bandwidth decides how many agents you can actually run, not the tool.

### 3.4 Skills — stop explaining your project every single time

**A skill is how you stop re-explaining the same project context every session like a goldfish.**

- Both tools share the same format: a folder with a `SKILL.md` inside holding instructions and metadata, plus optional scripts / references / assets.
- **Codex**: runs a skill when you call it with `$` or `/skills`, or by itself when your task matches the skill description — which is why a tight, boring description beats a clever one.
- **Claude Code**: same mechanism.

Skills are the antidote to **intent debt**. As Addy argued in *intent debt*: **an agent starts every session cold and fills any hole in your intent with a confident guess.** A skill writes that intent down on the outside — conventions, build steps, the "we don't do it like this because of that one incident" — written once where the agent reads it every run.

> Without skills the loop re-derives your whole project from zero every cycle; with skills it kind of compounds.

One distinction to keep straight: **the skill is the authoring format, a plugin is how you ship it.** Share a skill across repos or bundle several together by packaging them as a plugin — true in Codex, true in Claude Code.

### 3.5 Plugins & Connectors — the loop touches your real tools

**A loop that can only see the filesystem is a tiny loop.**

- **Connectors** (built on **MCP**) let the agent read your issue tracker, query a database, hit a staging API, drop a message in Slack.
- Codex and Claude Code both speak MCP, so **a connector you wrote for one usually just works in the other**.
- **Plugins** bundle connectors and skills together so your teammate installs your setup in one go instead of rebuilding everything from memory.

This is the difference between an agent that says "here is the fix" and **a loop that opens the PR, links the Linear ticket and pings the channel once CI is green — by itself.** Connectors are the reason the loop can act inside your actual environment instead of just telling you what it would do if it could.

### 3.6 Sub-agents — keep the maker away from the checker

**The most useful structural thing in a loop, by far, is splitting the one who writes from the one who checks.**

> The model that wrote the code is way too nice grading its own homework. A second agent with different instructions — and sometimes a different model — catches the stuff the first one talked itself into.

- **Codex**: only spawns subagents when you ask; runs them in parallel; folds the results back into one answer. Define your own agents as TOML in `.codex/agents/` (name, description, instructions, optional model and reasoning effort) — so your **security reviewer can be a strong model on high effort** while your **explorer is a fast read-only thing**.
- **Claude Code**: task subagents in `.claude/agents/` and **agent teams** that pass work between them.
- The usual split in both: **one explores, one implements, one verifies against the spec.**

Why it matters specifically inside a loop: **the loop runs while you are not watching, so a verifier you actually trust is the only reason you can walk away.** The cost: subagents burn more tokens (each does its own model and tool work) — spend them where a second opinion is worth paying for.

Addy also points out: **Claude Code's `/goal` is essentially this pattern under the hood** — a fresh model decides if the loop is done instead of the one that did the work: the maker/checker split applied to the stop condition itself.

### 3.7 What one complete loop looks like (a shape Addy keeps using)

Stick it together and a single thread turns into a little control panel:

> 1. **An automation runs every morning on the repo.** Its prompt calls a **triage skill** that reads yesterday's CI failures, the open issues, and the recent commits, and writes the findings into a markdown file or a Linear board.
> 2. For each finding worth doing, the thread opens an isolated **worktree** and sends a **sub-agent to draft the fix**.
> 3. **A second sub-agent reviews that draft** against the project skills and the existing tests.
> 4. **Connectors** let the loop open the PR and update the ticket.
> 5. Anything the loop can't handle lands in the **triage inbox** for you.
> 6. **The state file is the spine of the whole thing** — it remembers what got tried, what passed, what's still open, so tomorrow morning's run picks up where today stopped.

Then Addy lands the point:

> "Look at what you actually did there. **You designed it one time. You did not prompt any of those steps.** That's Steinberger's whole point made real — and it's the same loop in Codex or in Claude Code, because the pieces are the same pieces."

---

## 4. Design Philosophy: the three things the loop still does not do for you

Addy's most important warning in the whole piece: **"The loop changes the work, it does not delete you from it."** And three problems get *sharper* as the loop gets better, not easier.

### 4.1 Verification is still on you

> "A loop running unattended is also a loop making mistakes unattended."

You split the verifier sub-agent from the maker to make the loop's "it's done" mean something — but even then, **"done" is a claim and not a proof.** Addy keeps returning to the line from *code review in the age of AI*: **your job is to ship code you confirmed works.**

### 4.2 Your understanding still rots if you allow it

> The faster the loop ships code you did not write, the bigger the gap between what exists and what you actually get. That's **comprehension debt** — and a smooth loop just makes it grow faster, **unless you read what the loop made.**

### 4.3 The comfortable posture is the dangerous one: cognitive surrender

> When the loop runs itself, it's very tempting to stop having an opinion and just take whatever it gives back. Addy calls that **cognitive surrender**.

The most philosophical line in the piece:

> **"Designing the loop is the cure when you do it with judgement and the accelerant when you do it to avoid thinking — same action, opposite result."**

### 4.4 Closing maxim: Build the loop. Stay the engineer.

Addy's full closing argument:

1. **This is a preview of how our work will evolve**: "I think this is a preview of how our work is going to evolve."
2. **But he does not abandon human review**: "If I weren't reviewing the code myself or if I relied entirely on automated loops to fix it, my product's quality would suffer. I'd likely end up stuck in a downward spiral, continuously digging myself into a deeper hole."
3. **Balance**: "Go ahead and set up your loops, but don't forget that prompting your agents directly is also effective. It's all about finding the right balance."
4. **The loop is what you make of it**: "Two people can build the exact same loop and get completely opposite results. One uses it to move faster on work they understand deeply. The other uses it to avoid understanding the work at all. **The loop doesn't know the difference. You do.** That's what makes loop design harder than prompt engineering, not easier."
5. **The leverage point moved**: "Cherny's point isn't that the work got easier. It's that **the leverage point moved**."
6. **The final line**: "**Build the loop. But build it like someone who intends to stay the engineer, not just the person who presses go.**"

---

## 5. Summary

### 5.1 Core takeaways

1. **Definition**: loop engineering = replacing yourself as the person who prompts the agent; a loop is a recursive goal — you define a purpose, the AI iterates until complete.
2. **Paradigm shift**: the era of "the agent is a tool and you hold it turn after turn" is basically over — you build a small system that pokes the agents.
3. **Placement**: the loop sits one floor above the harness — the same harness, but it runs on a timer, spawns sub-agents, and feeds itself.
4. **Tool-agnostic**: the pieces ship inside the products (Codex / Claude Code); same shape → stop arguing about tools, design a loop that works wherever you sit.
5. **Five building blocks + memory**: Automations (heartbeat), Worktrees (parallel isolation), Skills (compounding project knowledge), Plugins/Connectors (reach your real tools), Sub-agents (maker/checker split) + Memory (the state file is the spine).
6. **Verification is still on you**: "done" is a claim, not a proof; an unattended loop makes mistakes unattended.
7. **Comprehension debt & cognitive surrender**: the faster the loop ships code you didn't write, the bigger the understanding gap; the comfortable "just take the output" posture is the dangerous one.
8. **Loop design is harder than prompt engineering**: the loop doesn't know whether you're accelerating or avoiding — only you do. The leverage point moved, but the responsibility didn't.

### 5.2 One-line summary

> **The loop changes the question of "who prompts" — not the question of "who is responsible."** Build your loop to find work, hand it out, and verify results; but read what it produces, keep your understanding of the code, and design it with judgment — **Build the loop. Stay the engineer.**

---

## References

- Original: Addy Osmani, *Loop Engineering* (2026-06-07) — `https://addyosmani.com/blog/loop-engineering/`
- Addy Osmani's related series: *Agent Harness Engineering*, *The Factory Model*, *Orchestration Tax*, *Intent Debt*, *Comprehension Debt*, *Cognitive Surrender*, *Adversarial Code Review*, *Code Agent Orchestra*, *Long-Running Agents*, *Code Review in the Age of AI* — all searchable at `addyosmani.com/blog/`
- Peter Steinberger (OpenClaw creator) on "designing loops that prompt your agents"
- Boris Cherny (head of Claude Code at Anthropic) on "my job is to write loops"
- Related on this site: *Loop Engineering Deep Dive (Cobus Greyling's Original)* (`loop-engineering-substack-analysis`), *Loop Engineering Orange Book Deep Dive* (`loop-engineering-orange-book`)
