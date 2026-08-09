---
title: "Claude Code Enhancement Suite Deep Dive: gstack · Superpowers · Compound Engineering · ECC — Turning Your AI Assistant into a 20-Person Virtual Engineering Team"
description: "A complete breakdown of the four Claude Code enhancement tools integrated in the eric-claude-code-dev project: gstack (YC CEO Garry Tan's software factory with 15 specialized roles), Superpowers (GitHub ex-CTO Jesse Vincent's auto-triggered development workflow), Compound Engineering (Every's compounding engineering — each session makes the next one easier) and Everything Claude Code (the Anthropic Hackathon-winning token optimization system). This article explains the core idea of 'turning AI into a virtual engineering team' with metaphors simple enough for a child to understand, and provides a full installation tutorial, detailed walkthroughs of core commands (/office-hours, /ce:brainstorm, /tdd, etc.), a four-scenario guide to combining the tools, a summary of the four design philosophies (skills as software, auto-triggering, compounding mindset, sub-agent orchestration), and key takeaways such as 'writing code is only the last step' and 'knowledge must be captured, not carried around in people's heads.'"
date: "2026-08-09"
author: "TopDigg Research Team"
tags: ["Claude Code", "AI Agent", "gstack", "Superpowers", "Compound Engineering", "ECC", "Garry Tan", "Jesse Vincent", "Developer Tools", "AI Workflow", "TDD", "Open Source"]
categories: ["Analysis"]
keywords: ["Claude Code enhancement", "gstack", "Superpowers", "Compound Engineering", "Everything Claude Code", "AI development workflow", "virtual engineering team", "compounding engineering", "sub-agents", "TDD", "code review", "Git worktree", "skill system", "token optimization", "open source tools"]
---

# Claude Code Enhancement Suite Deep Dive: gstack · Superpowers · Compound Engineering · ECC — Turning AI into Your 20-Person Virtual Engineering Team

> **Core idea:** Writing code is only the last step. In real development, 80% of the work goes into "figuring out what to build, how to break it down, and how to verify it." eric-claude-code-dev packages four free, open-source Claude Code enhancement tools into a single "virtual engineering team": gstack gives you 15 specialized roles (from CEO to QA engineer), Superpowers makes skills trigger automatically like an assembly line (from ideation to release without manually directing every step), Compound Engineering makes every session "snowball" (knowledge accumulates, so the next one is easier), and ECC saves you tokens while remembering everything. Install them and an ordinary developer can write 10,000+ lines of production code in a day, just like a 20-person team.

---

## 1. What Is This? (Explained So Even a Kid Gets It)

Imagine you're a "one-man army" who wants to start a software company and build an app. You have a great vision, but you quickly realize one person can't do it all: you need someone to think about the product (CEO), someone to draw the blueprints (designer), someone to keep the books and plan (engineering manager), someone to write the code (programmer), someone to check for bugs (QA), and someone to handle releases (release engineer)…

**Hiring 20 people is way too expensive. What do you do? Let AI be your entire team!**

Claude Code is, at its core, "an AI assistant that's really good at writing code." The four tools in this repo are four "super add-ons" for that assistant, letting it play the whole team by itself:

- **gstack = the "company org chart"**: It installs a full set of "roles," and every role comes with its own job description (a skill). Want to think through a product? Call the "CEO." Want to write code? Call the "programmer." Ready to ship? Call the "release engineer" — the AI does different things depending on which role you invoke.
- **Superpowers = the "automated assembly line"**: It teaches AI a standard "workflow": think first (ideate) → then plan (plan) → then write (implement) → check (review) → test (test) → ship (release). **The killer feature is that this pipeline hands itself off automatically**: you state your requirements and it automatically knows what to do next, like a veteran supervisor watching over every step — no need to micromanage.
- **Compound Engineering = the "compound-interest piggy bank"**: After every session, it records "what we learned this time" and stores it in a knowledge base. Next time you hit a similar problem, you just pull it out and use it. Like saving money: every deposit earns interest, and the interest keeps compounding — **the more you use it, the easier it gets**.
- **ECC (Everything Claude Code) = the "smart penny-pincher"**: It helps AI get the job done with the fewest tokens (money), and it remembers where you left off — even if you shut down your computer, "it still remembers" when you open it back up.

**In one sentence: put these four together and you turn a brilliant but lonely AI programmer into an organized, specialized, self-reflecting, memory-keeping team.**

---

## 2. Project Overview

### 2.1 Basic Info

- **Project name**: eric-claude-code-dev (an integration guide repo that collects four Claude Code enhancement suites)
- **Open-source URL**: [https://github.com/gyc567/eric-claude-code-dev](https://github.com/gyc567/eric-claude-code-dev)
- **The four components**:
  - **gstack** — [Garage's software factory](https://github.com/garrytan/gstack), by Y Combinator President Garry Tan
  - **Superpowers** — [GitHub front-CTO Jesse Vincent's complete workflow](https://github.com/obra/superpowers)
  - **Compound Engineering** — [Every's compounding engineering](https://github.com/EveryInc/compound-engineering-plugin)
  - **Everything Claude Code (ECC)** — [The Anthropic Hackathon-winning optimization system](https://github.com/affaan-m/everything-claude-code)
- **License**: All free and open source (MIT License)
- **Prerequisites**: Claude Code + Git + Bun (for assisted installation/scripts)
- **Positioning**: Upgrades Claude Code from an "AI assistant" into a "complete virtual engineering team"

### 2.2 What Problem Does It Solve?

Modern software development has an awkward truth: **AI is great at writing code, but engineering is more than writing code.**

In a real team, writing code is only about 20% of the job; the other 80% is requirements discussion, design review, testing, debugging, releases, and retrospectives. When one person works with AI, those steps either get skipped (and you build features nobody wants) or you have to manually direct the AI through every one of them (which is exhausting).

The three authors each answered this "how do you actually use AI" question from a different angle:

- **Garry (YC President)**: Treat AI as an "actor" that can play any role — the key is writing it a good "role description" — hence gstack's 15 roles.
- **Jesse** (GitHub front-CTO): Standardize the entire development process into an auto-triggered skill chain — hence Superpowers.
- **Every**: The focus isn't "how fast can we do it this time" but "how can we do it faster next time" — hence compounding engineering.
- **The ECC author**: AI gets more expensive and more forgetful the more you use it, so **save tokens + remember everything** — hence Everything Claude Code.

### 2.3 Three Core Concepts (All in Plain English)

- **Skill / Command = job description**: A special block of instructions stored in a file called SKILL.md. It tells the AI when to trigger and what to do. gstack has 15 role skills, Superpowers has a whole skill chain, and Compound has the /ce: series of commands.
- **Auto-trigger = a mind-reading pipeline**: With Superpowers you don't need to memorize commands — the AI decides on its own "it's time to brainstorm" and triggers brainstorming, "time to write a plan" and triggers writing-plans, one step feeding into the next.
- **Compounding = the secret to getting easier the more you work**: After each completed session, record the experience, the pitfalls you hit, and the patterns you wrote into docs and a knowledge base. Next time, that knowledge is automatically invoked (the core of Compound Engineering).
- **Worktree isolation = an office where one person does many jobs**: Use git worktree to give each feature its own isolated working directory, so tasks don't interfere with each other and you can run several in parallel.
- **Sub-agents = the minions you send out to do the work**: The main AI splits tasks among several sub-agents that execute in parallel, then a dedicated review agent checks the results — a two-phase process that guarantees quality.

---

## 3. Detailed Tutorial (Step by Step)

### 3.1 Installation (Done in 10 Minutes)

**What you need**: A computer with Claude Code installed + Git + Bun (one-click install at bun.sh).

**Install gstack (global skills package)**: Open a terminal and run inside Claude Code:

```bash
git clone https://github.com/garrytan/gstack.git ~/.claude/skills/gstack && cd ~/.claude/skills/gstack && ./setup
```

**Install Superpowers (official marketplace)**: Type inside Claude Code:

```bash
/plugin install superpowers@claude-plugins-official
```

If the marketplace can't find it, add the marketplace first, then install:

```bash
/plugin marketplace add obra/superpowers-marketplace
/plugin install superpowers@superpowers-marketplace
```

**Install Compound Engineering**:

```bash
/plugin marketplace add EveryInc/compound-engineering-plugin
/plugin install compound-engineering
```

**Install ECC (optional, either method works)**

```bash
# Method 1: official install script
git clone https://github.com/affaan-m/everything-claude-code.git
cd everything-claude-code && ./install.sh

# Method 2: manually copy into the skills directory
cp -r . ~/.claude/skills/everything-claude-code
```

**Verify the installation**

Open a new Claude Code session and type each of these:

```
/office-hours      # gstack - should pop up "give feedback on new ideas"
/brainstorm        # Superpowers - should ask you to describe your requirements
/ce:brainstorm     # Compound - should start asking detailed questions about what you want to build
```

If the AI responds, you're all set! If nothing happens, check that the files in the skills directory are complete.

### 3.2 Your First Complete Case: Adding Comments to a Blog (Full Walkthrough)

This is a complete "virtual team pipeline" — **strongly recommended to follow along in order**.

**Step 1: Kick off a requirements meeting (gstack's /office-hours + /plan-ceo-review)**

Type inside Claude Code:

```
/office-hours
```

The AI plays "YC startup advisor" and asks you six questions: Who is it for? What pain point does it solve? How is it different from existing solutions? How do you define success? …

Once you've answered, type:

```
/plan-ceo-review
```

It becomes the "CEO" and reviews your plan from the angle of "can this become a 10-star product," challenging your assumptions. At this point you'll have a **design document** in hand.

**Step 2: Draw up the plan (/plan-eng-review)**

Type:

```
/plan-eng-review
```

The AI becomes an "engineering manager" and breaks the design document into a technical plan: which database to use, how the API should be designed, what the data structures look like, what edge cases exist. **From this point on, you already know what the feature "looks like."**

**Step 3: Refine the requirements (Superpowers' brainstorming)**

In a new conversation, type:

```
/brainstorm
```

Superpowers keeps asking questions to refine the requirements ("How should comments be sorted? Do you want moderation?"). You answer in a few sentences, and it shows you the final design for confirmation.

**Step 4: Write the implementation plan (/ce:plan)**

Type:

```
/ce:plan
```

It reads the requirements document from earlier and automatically generates an **executable task list**. For example:

```markdown
## Task 1: Create the comment database model
- File: src/models/comment.ts
- Verify: bun test models/comment.test.ts

## Task 2: Implement the comment API endpoint
- File: src/routes/comments.ts
- Verify: curl localhost:3000/api/comments
```

Every task has an exact file path, code, and verification method — clear enough to hand straight to a sub-agent.

**Step 5: Start working (/ce:work + Superpowers sub-agents)**

Type:

```
/ce:work
```

It creates an isolated git worktree, splits up the work, dispatches sub-agents to execute in parallel, and automatically makes atomic commits after each task completes. If it hits an error, it pauses and waits for your confirmation.

**Step 6: Enforced testing (TDD)**

Superpowers enforces the RED-GREEN-REFACTOR three-step loop:

1. **Write a test that fails first** (RED)
2. **Write the minimum code to make the test pass** (GREEN)
3. **Refactor and optimize, then commit** (REFACTOR)

If you write the code before the test, it will "angrily" delete your code and make you rewrite it — **TDD is mandatory**.

**Step 7: Code review + QA + release**

Run through the quality gates:

```
/review        # gstack: auto-fixes bugs, flags critical issues
/ce:review     # Compound: 4 review agents pick apart correctness/security/performance/tests
/qa            # gstack: runs regression tests in a real browser
/ship          # syncs the main branch, runs tests, pushes, auto-opens a PR
```

**Step 8: Retrospective — make the next one easier (/ce:compound)**

```
/ce:compound
```

The AI asks you three questions: What did you learn this time? What situations tend to go wrong? What advice would you give your future self? — then writes it all into the docs and knowledge base. **That's the compounding move that makes "next time" faster.**

### 3.3 Common Commands for the Four Tools

**gstack (15 role skills)**

- **/office-hours** — YC advisor: six questions to reshape your idea and challenge assumptions
- **/plan-ceo-review** — CEO: reviews from the "10-star product" angle
- **/plan-eng-review** — Engineering manager: locks down architecture, data flow, edge cases
- **/plan-design-review** — Senior designer: design review, sweeps out the junk
- **/review** — Senior engineer: auto-fixes bugs, finds production issues
- **/qa** — QA lead: real-browser testing + regression tests
- **/investigate** — Systematic debugging: root-cause analysis
- **/ship** — Release engineer: sync, test, push, open PR
- **/browse** — Browser operator: end-to-end testing

**Superpowers skill chain** (auto-triggered, nothing to memorize)

- **brainstorming** — triggers when you say "I want…": Socratic refinement of the design
- **using-git-worktrees** — triggers after the design is approved: isolated environments
- **writing-plans** — triggers once a design doc exists: breaks work into 2-5 minute tasks
- **subagent-driven-development** — triggers once a plan exists: sub-agent execution + two-stage review
- **test-driven-development** — triggers during implementation: enforces RED-GREEN-REFACTOR
- **systematic-debugging** — triggers when there's a bug: four-stage root-cause analysis
- **requesting-code-review** — triggers between tasks: reports issues by severity
- **finishing-a-development-branch** — triggers when a task is done: decides merge/PR/keep/discard

**Compound Engineering commands**

- **/ce:ideate** — diverges to find improvement points, adversarial filtering
- **/ce:brainstorm** — requirements exploration (Q&A) + generates a requirements document
- **/ce:plan** — turns the technical plan into executable tasks
- **/ce:work** — worktree execution + atomic commits
- **/ce:review** — 4 review agents pick apart from multiple angles
- **/ce:compound** — retrospective + knowledge capture (compounding)

**ECC commands**

- **/tdd** — forces the TDD three-step loop
- **/plan** — requirements analysis + task breakdown
- **/e2e** — generates and runs end-to-end tests
- **/code-review** — quality review (Critical/High/Medium)
- **/build-fix** — fixes build errors
- **/learn** — extracts reusable patterns from a session to generate skills
- **/worktree** — parallel worktrees

### 3.4 Advanced Combinations

**Scenario 1: Starting a new feature**

```bash
/office-hours   → /plan-ceo-review   → /plan-eng-review   → /ce:plan
```

First use gstack to set the direction, then Superpowers brainstorming to refine, and finally CE to produce an executable plan. **Each tool owns one stage; chained together they form a complete "from idea to task list" pipeline.**

**Scenario 2: Implementing a feature**

```
/ce:work → subagent-driven-development → test-driven-development → write code
```

**Scenario 3: Review + debugging**

```
/review → /ce:review → /qa → /investigate (if a bug is found)
```

**Scenario 4: Release + retrospective**

```
/ship → /document-release → /ce:compound
```

---

## 4. Design Philosophy (Why Is This System Designed This Way?)

### 4.1 Skills as Software: Turning "Experience" into Installable Code

Every role in gstack (CEO, QA, release engineer) and every workflow in Superpowers is a Markdown file (a skill) with detailed instructions. **The tutorials you've read, the pitfalls you've hit, your team's little conventions — all of it can be compiled into skills that the AI executes strictly.** This is "expert experience, source-coded" — you can "write" useful engineering capability without writing a program.

### 4.2 Automation Over Directing: Let the Process Run Itself

Superpowers' biggest breakthrough is **auto-triggering**: you don't need to memorize commands; the AI moves to the next stage automatically based on the state of the conversation. This mirrors how real human teams work — the leader doesn't direct every step; team members know on their own that "once the design is done, it's time to write the plan."

### 4.3 The Compounding Mindset: Make Every Session Pay Compound Interest

The essence of "compounding engineering": **traditional development means "every feature added makes the codebase harder to maintain," while compounding engineering means "every session leaves knowledge behind that makes the next one easier."** Technical debt vs. knowledge assets — choose the latter.

### 4.4 Sub-Agent Orchestration: Two-Stage Review Guarantees Quality

Superpowers and CE both use the same pattern: **main agent breaks down the task → sub-agents execute → an independent review agent re-checks.** Execution and review are separated, just like a real company where the code reviewers don't write the feature code — it avoids the blind spot of "checking your own work."

### 4.5 Parallelism Is the Secret to Outperforming a Single Person

gstack is a "process," not just a tool: it supports 10-15 parallel sprints (one chatting about ideas, one revising a PR, one writing a new feature, one doing QA). That's also the answer to "writing 10,000+ lines of code in a day" — it's not about writing faster, it's about **doing many things at once**.

### 4.6 Everything Is Free and Open Source

gstack / Superpowers / Compound / ECC are all MIT License. The core takeaway: **the most powerful AI development tools aren't the paid commercial products — they're the skill systems that the community has iterated on in the open.**

---

## 5. Summary: Core Takeaways and Conclusions

If you remember only these points, you've captured the essence of the whole project:

1. **"Writing code" is just the last step** — 80% of real engineering time goes to thinking, planning, and reviewing. This toolchain covers everything "before you start" and "after you finish," which actually shrinks the time you spend.
2. **Design first — a plan is worth more than code.** With a detailed plan and acceptance criteria, writing code becomes "filling in the blanks," and the AI's error rate drops accordingly.
3. **Enforced TDD (test-first) is the shortcut to quality** — write a failing test first, then make the code pass, then refactor. This old-school loop keeps AI-generated code at production quality too.
4. **Knowledge must be accumulated, not carried around in people's heads.** Technical debt "rots"; compounding accumulates. After every session, ask yourself "how do I do this faster next time."
5. **Auto-trigger > manual directing.** The human's only job is "state the requirement + make decisions"; the AI auto-relays everything else, which is the most efficient setup.
6. **One person + AI = a 20-person team.** That's not an exaggeration: gstack pushes one new feature per session while other sessions run QA/release in parallel, isolated via git worktree — completely reasonable.
7. **The holy grail isn't the number of features, it's whether the loop is closed.** Ideate → plan → develop → review → test → release → retrospect. Once that loop runs end to end, you've truly "learned" how to use AI.

---

## 6. References (Keep Learning)

- eric-claude-code-dev (this guide): https://github.com/gyc567/eric-claude-code-dev
- gstack (Garry's software factory): https://github.com/garrytan/gstack
- Superpowers (Jesse Vincent's workflow): https://github.com/obra/superpowers
- Superpowers official blog: https://blog.fsck.com/2025/10/09/superpowers
- Compound Engineering: https://github.com/EveryInc/compound-engineering-plugin
- Everything Claude Code (ECC optimization system): https://github.com/affaan-m/everything-claude-code

> **Next steps (30 minutes and you're done):**
>
> 1. Install gstack + Superpowers (about 10 minutes)
> 2. Run /office-hours to test your product idea (about 5 minutes)
> 3. Let /ce:plan generate a task list (about 5 minutes)
> 4. After development, run /review and /ship (about 10 minutes)
> 5. Finally, don't forget /ce:compound — make the next one faster!

**Let's ride the wave!** 🚀