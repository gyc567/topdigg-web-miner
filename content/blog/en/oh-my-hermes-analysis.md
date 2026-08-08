---
title: "Oh My Hermes Deep Dive: A Multi-Agent Orchestration Framework That Turns Multiple AIs Bickering into Engineering Discipline"
description: "A complete analysis of the GitHub project witt3rd/oh-my-hermes (OMH) — a multi-agent orchestration skill collection built for Nous Research's Hermes Agent, inspired by oh-my-claudecode but fully rewritten from scratch on Hermes primitives. Core idea: a single AI answering in one pass is prone to blind spots, so OMH has a Planner, an Architect, and a Critic debate one another to consensus, then lets an Executor write the code, a Verifier check the evidence, and the Architect do the final review. The article covers: the ten skills (omh-ralplan / omh-ralph / omh-deep-research / omh-deep-interview / omh-autopilot and their respective driver scripts), the hook-based role injection mechanism, atomic state management, the three-strike circuit breaker, the iron law that evidence beats assertion, file ownership isolation, the '.omh directory selective sharing' convention, and the fourteen design principles written explicitly into the repo. From core ideas, project overview, and design philosophy to a beginner-friendly step-by-step tutorial (install → first planning session → execution loop → fully automatic pipeline) and takeaways, the article covers it all in one read."
date: "2026-08-08"
author: "TopDigg Research Team"
tags: ["Oh My Hermes", "OMH", "Hermes Agent", "AI Agent", "Multi-Agent", "多智能体", "Agent Skills", "Nous Research", "oh-my-claudecode", "Orchestration", "Consensus Planning"]
categories: ["Deep Dive"]
keywords: ["Oh My Hermes", "OMH", "Hermes Agent", "multi-agent orchestration", "consensus planning", "omh-ralplan", "omh-ralph", "AI agent skills", "delegate_task", "role injection", "three strikes", "evidence verification", "Nous Research"]
---

# Oh My Hermes Deep Dive: A Multi-Agent Orchestration Framework That Turns Multiple AIs Bickering into Engineering Discipline

> Core idea: **A single AI working alone has blind spots it can't even see itself; let several AIs each play a different role, challenge one another, and argue until they agree, and the resulting plan is far stronger.** Oh My Hermes (OMH for short) turns exactly that into a reusable "skill pack." It gives Nous Research's Hermes Agent ten skills: during planning, the **Planner** drafts a plan first, the **Architect** reviews the structure, and the **Critic** is there specifically to tear it down — all three have to approve before it passes; during execution, the **Executor** writes the code, the **Verifier** looks only at real test output (never at what anyone claims), and the **Architect** does one final review at the end. The whole framework rests on two ballast-stone iron laws — "**evidence, not assertion**" (if you haven't seen test output, it didn't pass) and "**stop after the same mistake three times**" (the three-strike circuit breaker). Even better: OMH **built itself** — the first skill ever created was the consensus planner `omh-ralplan`, and it then used that skill, through multi-agent debate, to design all the remaining skills.

---

## 目录

- [1. Plain Language: What This Project Actually Does](#1-plain-language-what-this-project-actually-does)
- [2. Project Overview](#2-project-overview)
- [3. Core Ideas: Five Key Concepts](#3-core-ideas-five-key-concepts)
- [4. The Ten Skills, One by One](#4-the-ten-skills-one-by-one)
- [5. The Plugin Layer: Role Injection and Atomic State](#5-the-plugin-layer-role-injection-and-atomic-state)
- [6. Design Philosophy (Fourteen Principles)](#6-design-philosophy-fourteen-principles)
- [7. Detailed Tutorial: From Zero to Hands-On](#7-detailed-tutorial-from-zero-to-hands-on)
- [8. Takeaways: Observations and Conclusions](#8-takeaways-observations-and-conclusions)
- [9. References](#9-references)

---

## 1. Plain Language: What This Project Actually Does

### 1.1 A Metaphor Even a Schoolkid Can Understand

Imagine you want to build a LEGO castle.

**The usual way** (one AI working alone): you call over a really smart classmate and say, "Help me design a castle." He thinks for three minutes, draws a picture, and says, "Done." You build according to the drawing, and halfway through you discover — the gate opens right into the middle of the moat. You can't get in.

**The Oh My Hermes way** (multiple AIs with divided labor): you call over three classmates.

- **The first classmate is the "Planner"**: he draws the blueprint, breaking "build a castle" into small step-by-step tasks — first lay the foundation, then build the walls, then install the gate, and finally plant the flag.
- **The second classmate is the "Architect"**: he doesn't draw; he only checks whether the blueprint is sound. "The foundation is only two bricks and you're stacking twenty layers on top? What if it collapses?"
- **The third classmate is the "Critic"**: his job is **specifically to nitpick and argue**. He'll ask: "Are you sure you want to build a castle? The assignment says 'a place where someone can live' — wouldn't a tent be faster?" — note that he dares to question the **assignment itself**.

The three of them argue for a round, and the Planner revises the drawing based on the feedback; then they argue a second round. **Only when all three say "I agree" is the drawing considered final.**

Once the drawing is final, three different classmates take the stage:

- **The "Executor"**: the one who actually builds with the blocks. The rules are strict — **you may only touch the blocks assigned to you**; you can look at the parts others are responsible for, but you may not touch them.
- **The "Verifier"**: he comes to inspect when the building is done. But he has an iron rule: **he doesn't listen to the Executor saying "I built it" — he only looks at photos.** No real photos (actual test output), no pass — always a fail.
- **The "Architect"**: after all tasks are done, he takes one overall look, and only when he nods is the work truly finished.

That is Oh My Hermes. It's not a software tool; it's **a set of rules that teach AIs how to divide labor, how to argue, and how to accept or reject work**.

### 1.2 Why Do We Need These Rules

AI has a well-known flaw: **it is very confident**.

Ask it to write code, and when it's done it will tell you "Done, tests pass." But many times it never actually ran the tests, or ran them without looking at the results. This isn't lying — it's a property of how large language models generate text: it's "completing a sentence that sounds right."

OMH's solution is simple and very engineering-minded: **don't trust what it says; only look at what it does.**

- The Verifier is **read-only**; it can't modify code, only judge "pass" or "fail".
- Running the tests is **not given to the Verifier, nor to the Executor — the orchestrator runs them itself**, then hands the real output to the Verifier. That way the Verifier holds the "ground truth" and can't be led astray by the Executor's report.
- Passed four out of five acceptance criteria? **Verdict: fail.** Not "mostly passing" — it's "FAIL".

---

## 2. Project Overview

### 2.1 What It Is

**Oh My Hermes (OMH)** is a **multi-agent orchestration skill collection** written for [Hermes Agent](https://github.com/NousResearch/hermes-agent), the open-source AI agent from Nous Research.

Repository: `https://github.com/witt3rd/oh-my-hermes`

One line from the README sums it up:

> "OMH provides composable skills for consensus planning, requirements interviewing, and verified execution — plus an optional plugin that adds hook-based role injection, atomic state management, and evidence gathering. **Skills work standalone with zero dependencies.**"

Note that last sentence — **"Skills work standalone with zero dependencies"** — it's the first key to understanding OMH's architecture, and we'll get into it in detail later.

### 2.2 Key Facts

| Field | Value |
| --- | --- |
| Repository | `witt3rd/oh-my-hermes` |
| Stars | 243 (at the time of analysis) |
| Forks | 22 |
| Commits | 76 commits |
| License | MIT |
| Language | Python (plugin) + Markdown (skill definitions) |
| Requirements | Hermes Agent v0.7.0+; the plugin additionally needs Python 3.10+ and `pyyaml` |
| Inspiration | [oh-my-claudecode](https://github.com/Yeachan-Heo/oh-my-claudecode) (OMC for short) |

### 2.3 The Ten Skills at a Glance

| Skill | What it does |
| --- | --- |
| **omh-deep-research** | Multi-stage web research: decompose → parallel search → synthesize → verify the authenticity of citations |
| **omh-ralplan** | Consensus planning: Planner → Architect → Critic, debating until agreement |
| **omh-ralplan-driver** | The **orchestrator script** that drives ralplan — context-package authoring (where quality is born), round scheduling, distillation, final review |
| **omh-deep-interview** | Socratic requirements interviewing with coverage tracking |
| **omh-ralph** | Verified execution: implement → verify → iterate until done |
| **omh-ralph-driver** | The **orchestrator script** that drives ralph — plan shape, parallel batching, evidence gathering, verifier discipline, strike categorization, the step-7 architect final review, commit conventions |
| **omh-ralph-task** | The discipline of a single-task executor — task envelope contract, strict file scope, stash-based verification against HEAD (isolating sibling-task interference), commit author override, structured reporting format |
| **omh-triage** (v0.1) | Multi-role consensus issue triage — Maintainer (code-anchored) + Skeptic (pruning) |
| **omh-triage-driver** (v0.1) | The orchestrator script that drives triage — pre-flight backlog audit, role round scheduling, distillation, user sign-off gate |
| **omh-autopilot** | The full pipeline, chaining all the skills above end to end |

### 2.4 The Recommended Combined Pipeline

For a requirement in an **unfamiliar domain**, the official recommended full chain is:

```
omh-deep-research  →  omh-deep-interview  →  omh-ralplan  →  omh-ralph
   (understand the domain first)  (clarify the requirements)  (debate a plan)  (work + verify)
```

If the domain is familiar to you, start from the interview and skip the research stage.

### 2.5 Version Roadmap (ROADMAP.md)

```
v1.0:           Skills only — verbose but usable, zero dependencies
v2.0 (current): Hermes plugin — an infrastructure layer with hook-based role injection
v3.0 (future):  PR upstream into NousResearch/hermes-agent's optional-skills/
```

The roadmap itself embodies a kind of pragmatism: **first get it working the dumbest way possible with zero dependencies, then layer on infrastructure, and only consider upstreaming at the end.**

---

## 3. Core Ideas: Five Key Concepts

### 3.1 Consensus Planning: Let the Critic Crash the Party

The `omh-ralplan` flow looks like this:

```
Planner drafts the plan
    → Architect reviews whether the structure is sound
    → Critic challenges assumptions with an adversarial mindset
    → If not all three APPROVE: Planner revises, back to the previous step (max 3 rounds)
    → Consensus reached: plan written to .omh/plans/
```

The docs say it in their own words, getting straight to the Critic's value:

> "**The Critic's job is to break the plan — if it survives, it's stronger for it.**"

**There's also a deliberate strategy to the rounds**:

- **Round 1: serial.** Planner → Architect → Critic, one after another, because each later role needs to see the earlier role's output.
- **Round 2 and beyond: parallel.** After the Planner finishes revising, the Architect and the Critic review **simultaneously** (using batched `delegate_task` calls) to save time.

**Stopping condition**: 3 rounds maximum. If there's still no consensus by round 3, output the plan with "reservations noted" and let a human decide. If any role votes REJECT, surface the concern directly to the user.

### 3.2 The META Question: The Critic Must Be Licensed to Challenge the Task Itself

This is **the most insightful design in all of OMH**, and it comes from pitfall P4 in `omh-ralplan-driver`:

> "**P4 — Critic must be licensed to contest framing:** If the context package lists only 'things to push on inside the current frame,' the Critic will stay inside the frame. Add the META question explicitly. [...] **Without licensing, the Critic catches details. With licensing, the Critic catches the frame.**"

To use the LEGO castle analogy: if you only tell the Critic "please check whether the drawing has problems," he'll say "the moat isn't wide enough"; but if you tell him "you can also question whether we should be building a castle at all," he might say "the user actually just wants a place to live — a tent goes up in ten minutes."

**The latter is the opinion that's actually worth money.**

The docs even include a real case to back up this rule:

> "The Critic's simplicity test can change architecture — don't dismiss it. In the ralph consensus, the Critic proposed one-task-per-invocation (instead of an in-session loop) which both reviewers then approved as fundamentally better."

**OMH's most central execution architecture was hammered out by the Critic.**

### 3.3 The Counterfactual Deference Test

This is pitfall P7, a very clever check that "prevents an AI from faking being persuaded":

> "**P7 — Counterfactual deference test:** Would this defense have adopted a *different* alternative if a counterfactual Critic had proposed it? If all the Planner's grounds also justify a counterfactual alternative, the adoption is deferential — pattern-matching, not principled."

In plain words: **AI has a bad habit of agreeing with whoever spoke last.** The Critic says "use four dimensions," and the Planner immediately says "you're right, I'll switch to four dimensions, for reasons A, B, C." But if the Critic had instead said "use six dimensions," would the Planner have agreed using those same A, B, C reasons? If so, the Planner wasn't thinking at all — it was just deferring.

OMH turned this psychological failure mode **into an executable checklist item**. That's a rare level of engineering maturity.

### 3.4 Evidence Over Assertion: ralph's Iron Law

The core mechanism of the execution phase (`omh-ralph`):

> "The iron law of ralph verification: **evidence, not assertion.** Verifiers must see actual test output; executor claims without evidence are rejected."

The definition in `role-verifier.md` is even harsher:

> "No approval without fresh evidence. If you don't see test output, it didn't pass."

What's more, **acceptance is binary — no discounts**:

> "Binary per criterion: VERIFIED / PARTIAL / MISSING. **4 of 5 criteria = FAIL, not PASS.**"

**The single most critical discipline** (`omh-ralph-driver` step 4 and P6):

> "**Critical: the verifier does NOT run evidence themselves. Gathering happens at the orchestrator level** so you can verify executor claims match reality before the verifier reads them."

> "Always run `omh_gather_evidence` before dispatching verifiers. [...] If you skip evidence-gathering, the verifier reads only the executor's report and has no ground truth to grade against."

This is a very clever **three-way checks-and-balances** design:

```
Executor      — writes code, claims "I'm done"
   ↓
Orchestrator  — runs the tests itself, gets the real output (ground truth)
   ↓
Verifier      — holds the "executor's claim" + the "orchestrator's real output" and renders a comparison verdict
```

The Executor can't fake evidence, because the evidence doesn't come from him; and the Verifier can't slack off, because the truth is right in front of it.

### 3.5 The Three-Strike Circuit Breaker

A typical AI failure mode when fixing bugs: try one version, it fails → try a different approach → still doesn't work → try again... an infinite loop burning money.

OMH's solution counts **by error fingerprint**:

> "Construct error fingerprint `{task_id, category, error_key}`. Add to `task.error_fingerprints`. If 3 fingerprints share the same `category + error_key`: mark task blocked, log the error, continue to next eligible task on next invocation."

**Note the "category" field** (pitfall P5):

> "Tag the strike category in the error fingerprint. The 3-strike circuit breaker fires when the same `(category, error_key)` repeats. **Tagging by category prevents test-infra strikes from masking real bugs.**"

The three categories:

| Category | Meaning | Example |
| --- | --- | --- |
| `test-infra` | The test environment itself is broken | A missing dependency in CI |
| `spec-misread` | The Executor misread the requirement | Reading "sort by time" as "sort by name" |
| `implementation-bug` | The code is genuinely wrong | An array index out of bounds |

Without categorizing, three failures of different natures would be misjudged as "the same infinite loop" and wrongly trip the breaker; with categorization, only **the same kind of failure repeating three times** trips it — that's what a real infinite loop looks like.

---

## 4. The Ten Skills, One by One

### 4.1 omh-ralplan (Consensus Planning)

**Roles**: Planner / Architect / Critic

**Phases**:

| Phase | What happens |
| --- | --- |
| Phase 0 | Context gathering — read files, summarize in ~500 words |
| Phase 1 | Planning loop, max 3 rounds. Round 1 is serial; from round 2 on, parallel review |
| Phase 2 | Output the consensus plan to `.omh/plans/ralplan-{slug}.md` |

**Verdict**: consensus requires all three to APPROVE. Any REQUEST_CHANGES moves to the next round. Any REJECT is immediately escalated to the user.

### 4.2 omh-ralph (Verified Execution)

**Dependency**: the OMH plugin (v2) **must** be installed; it cannot run standalone.

**Architecture**: **one task per invocation**, then exit; the caller invokes again for the next task.

This design was forced out by the Critic; the reasoning is laid out clearly in `docs/omc-comparison.md`:

> "Hermes can't prevent exit mechanically. **State-based resume is more robust and eliminates context exhaustion.**"

Compare with OMC's approach: OMC used a 1144-line `persistent-mode.cjs` to stop the AI from exiting the session, forcing the loop to run to completion. OMH does the opposite — **since you can't prevent exits, make every exit a safe save point.**

**The eight-step state machine**:

| Step | Name | What it does |
| --- | --- | --- |
| 0 | Parse instance + acquire lock | Isolate state per instance; advisory lock prevents the same plan from being run concurrently |
| 1 | Read state | Determine whether this is fresh / needs a planning gate / resuming / complete / blocked / cancelled |
| 2 | Planning gate | Parse `.omh/plans/ralplan-*.md`; **refuse to execute without a plan that has acceptance criteria** |
| 3 | Pick the next task | Pick from all tasks with `passes=false` whose dependencies are met, by priority; can form 2–3 parallel-safe batches |
| 4 | Execute | `delegate_task` with `[omh-role:executor]`; parse COMPLETE/PARTIAL/BLOCKED |
| 5 | Verify | The orchestrator runs `omh_gather_evidence` first, then dispatches `[omh-role:verifier]` |
| 6 | Error handling | Three-strike circuit breaker on `(category + error_key)` fingerprints |
| 7 | Final review | After all tasks pass, the Architect reviews the whole. APPROVE = done; REQUEST_CHANGES = spawn newly discovered tasks |

**Other mechanisms**:

- **Cancellation signal**: `.omh/state/ralph-cancel.json`, with a 30-second TTL, for a clean abort.
- **Learning forward**: findings from completed tasks are fed into the context of later executors.
- **Parallelism first**: at most 3 concurrent subagents for independent tasks (Hermes's `MAX_CONCURRENT_CHILDREN` default).

### 4.3 omh-ralph-task (The Single-Task Executor's Discipline)

This is the narrow contract the Executor must obey **inside a single `delegate_task` call**.

**The Task Envelope contract fields**:

- Project root + branch
- Commit author (overridden with `-c user.name -c user.email`)
- **Files owned by this task** (these are the only files you may `git add`)
- **Files you must not modify** (owned by sibling tasks; you only read them)
- Acceptance criteria
- TDD instructions
- Commit metadata (the exact `git add` command + commit message)
- Expected output format

**Strict file scope** (this is what keeps parallel execution from colliding):

> "**Stay in your file scope.** When implementing, you may need to *read* sibling-owned files for context. You may not *modify* them."

This corresponds to pitfall P3 on the orchestrator side:

> "When dispatching parallel executors, **only ONE task owns each shared file.** The other executors must import (read-only) but not modify it. Encode this explicitly in each executor's dispatch context."

**The stash verification method** (figuring out whether a failing test is actually your fault):

```bash
# 1. Stash your work
git stash
# 2. Run the failing test on the clean HEAD
uv run pytest <failing-test-path> -q
# 3a. If it PASSES on the clean state → the failure is yours. Pop, fix, retry.
# 3b. If it also FAILS on the clean state → it's a pre-existing issue or a sibling task's doing. Pop, keep going.
git stash pop
```

This trick is extremely practical: **it turns the vague signal of "this test is failing" into the clear answer of "is this my responsibility."** Without it, executors waste many rounds fixing a failure that was never theirs.

**TDD can't be faked**:

> "Going green-first (writing the implementation before the test) defeats the orchestrator's audit signal — they wanted to see real test-driven evidence in the commit, not after-the-fact tests rationalized to pass."

### 4.4 omh-deep-research (Deep Research)

**Dependencies**: the `web` tool set + the `omh_state` tool

**Five phases; you can exit safely between any two phases**:

| Phase | Name | Subagent | Key behavior |
| --- | --- | --- | --- |
| 0 | Sentinel check | none | Check for an existing confirmed report; resume if the topic matches |
| 1 | Decompose | none | Generate a slug, write the plan, initialize state, exit |
| 2 | Search (batched) | 1–3 `researcher`s in parallel | **One batch per invocation**; re-entrant |
| 3 | Gap check | 0 or 1 `researcher` | Only two branches: 0 gaps → synthesize; ≥1 gap → chase down |
| 4 | Synthesize | 1 `research-synthesist` | The parent agent inlines all findings; **the parent writes the report** |
| 5 | Verify | 1 `research-verifier` | Three-strike gate; ordered confirmation |

**The Sentinel mechanism**: `.omh/research/{slug}-report.md` carries a `status: confirmed` marker — a durable interface meaning "this research is finalized," which downstream skills consume directly.

**The order of operations when verification passes cannot be reversed**:

1. First write the report with `status: confirmed` (the atomic, idempotent sentinel)
2. Then append `REPORT_CONFIRMED` to the event log
3. Finally clean up the state

Reverse the order and you can get an inconsistency where "the state is cleaned up but the report never hit disk."

**Cost envelope** (the README states it explicitly — a rare courtesy):

> "A typical happy-path session is roughly **5-8 `delegate_task` calls** [...] With one synthesis retry, expect **up to ~10-12 calls**. The 3-strike retry cap bounds worst-case at ~14-16 calls before BLOCKED is surfaced."

**Putting the cost ceiling in the README is a sign of respect for the user's wallet.** Many AI frameworks never dare to publish that number.

**The researcher's honesty protocol**:

> "**Empty-result protocol:** Return block with `SYNTHESIS: (insufficient sources for this subtopic)` — honest, not a failure."

The verifier honors this too: `(insufficient sources for this subtopic)` is an **honest signal and is not judged FAIL**. But **fabricating content = FAIL — the unforgivable original sin**.

### 4.5 omh-deep-interview (Deep Requirements Interview)

**Architecture**: a Socratic dialogue, **with the user controlling when it ends**.

**Coverage dimensions**: Goal, Constraints, Success Criteria, Existing Context (brownfield projects only)

**Scoring**: coarse-grained bins (HIGH / MEDIUM / LOW / CLEAR), **never auto-terminates**.

This is a deliberate point of divergence between OMH and OMC:

> "**LLM self-assessment lacks decimal precision. The user is the authority on readiness.**"

OMC scores with floats from 0.0–1.0 and auto-exits the interview once a threshold is reached. OMH considers that fake precision — there's no real difference between an AI saying "ambiguity 0.23" and "0.31" — and **letting the AI decide "I've asked enough" is itself a bad idea**.

**Other deliberate divergences**:

| OMC's approach | OMH's approach | Rationale (verbatim) |
| --- | --- | --- |
| Auto-detect brownfield projects | **Ask the user** | "Checking for `package.json` etc. is unreliable and presumptuous." |
| Put the full interview transcript in the spec | **Only the distilled summary** | "Keeps specs readable and focused. Full transcript is ephemeral." |
| 3 named challenge modes | **A single adaptive instruction** | "Same effect, less ceremony. **Consensus review called the modes 'cargo cult.'**" |

That "cargo cult" jab is quite biting — it refers to copying the form without understanding the substance.

**Adaptive questioning**: if you've been pressing on the same dimension for more than 2 rounds with no progress, switch the angle of the question.

**Sentinel**: `.omh/specs/{name}-spec.md` carries `status: confirmed` — only confirmed specs are valid for downstream skills.

### 4.6 omh-autopilot (The Fully Automatic Pipeline)

**Architecture**: **advance one phase step per invocation**, with fresh context at each phase boundary.

| Phase | Name | Key behavior |
| --- | --- | --- |
| 0 | Requirements | Check for a confirmed spec; vague requirements → load deep-interview (interactive) |
| 1 | Planning | Check for a consensus plan; none → load ralplan |
| 2 | Execution | Run one ralph iteration per invocation; repeat until `phase="complete"` |
| 3 | QA loop | Run one QA cycle per invocation; gather evidence, diagnose, fix; three-strike against `qa_error_history` |
| 4 | Multi-review verification | 3 parallel reviews (Architect + Security Reviewer + Code Reviewer) — **filling exactly the 3 concurrency slots** |
| 5 | Cleanup | Delete state files; **keep** logs, plans, specs |

**Smart skipping**: on a fresh start, it detects existing artifacts and skips phases that are already done. If you finished the interview yesterday, running autopilot today won't ask you again.

**Context checkpoints**: after each phase completes, it sets `context_checkpoint: true` and exits the session. The next invocation reads the state, clears the flag, and continues.

The beauty of this design: **the context window is reset at every phase boundary, so no matter how long the project, the context never blows up.** All state lives on disk, not in the conversation history.

### 4.7 The Two Drivers: The Orchestrator's Scripts

OMH does something distinctive here: **it splits "the worker's discipline" from "the foreman's script" into two separate skills.**

- `omh-ralplan` / `omh-ralph` = the **worker-side discipline** (used inside `delegate_task`, when role tags are present)
- `omh-ralplan-driver` / `omh-ralph-driver` = the **foreman's scripts** (used **between** dispatches)

`omh-ralplan-driver` has **26 numbered pitfalls (P1–P26)**, and `omh-ralph-driver` has **10 (P1–P10)**. These aren't made up off the top of someone's head — they're failure modes learned from real runs.

**A few that are especially worth remembering**:

> "**P6 — Specific counter-proposals beat flagged concerns:** A strong Critic proposes a concrete alternative ('use four dimensions: X / Y / Z / W'), not just 'consider a different decomposition.'"

> "**P10 — Iterate context package with user before dispatching:** Drafting from reading alone misses dimensions only the user can name."

> "**P2 — Identify parallel-safe batches before dispatching, not during:** If you wait until after dispatching one task to consider whether others could have run in parallel, you've forfeited the wall-clock savings."

### 4.8 The Altitude Contract: Brief vs. Deep Review

Pitfall P26 in `omh-ralplan-driver` is about the **shape of the deliverables**:

> "Two artifacts at the orchestrator-review step, not one. Deep review for the archive (preserves provenance and your honest self-assessment). Brief for delivery."

- **`brief.md`** — the one the user reads. **Decisions first, 1–2 pages.** "The user must be able to **give judgment from this alone**."
- **`<orchestrator>-review-deep.md`** — for the archive. Internal reasoning, full argumentation, the deference test, observations on how it ran. **Not meant to be read by default.**

And the harshest line in P26 is:

> "**The brief is the test of altitude: if you cannot reduce the deep review to a clean decisions-first brief, you do not have the altitude you think you have.**"

There's an even more fundamental one:

> "An executive presented with the deep review cannot give judgment from it; an executive presented with a brief can."

**That sentence applies to all AI output.** Your AI assistant hands you a 3000-word analysis that looks very effortful, but you actually can't make a decision from it — that's "insufficient altitude."

### 4.9 omh-triage (Issue Triage, v0.1)

**Status**: v0.1, **deliberately kept small** — only 2 roles, polished in real scenarios before expanding.

- **Triage Maintainer** — code-anchored ground truth: "Does this issue's premise still hold?"
- **Triage Skeptic** — pruning: "Does it deserve a slot?"

Planned v0.2+ roles: Operator, Architect, Member-advocate.

**The verdict combination matrix** (the authoritative table):

| Maintainer | Skeptic | Verdict |
| --- | --- | --- |
| stale | (not run) | Close |
| out-of-scope | (not run) | Close |
| recast/partial-stale | keep | Rewrite the body, keep |
| recast/partial-stale | drop/wait | Close |
| live | keep | Keep as live |
| live | drop/wait | Close |
| live | dedup | Close + leave a comment |
| live | refile-smaller | Close + reopen a smaller one |

**Pre-flight discipline** (`omh-triage-driver`):

- Fewer than 10 issues → handle manually, don't bring in AI
- More than 100 issues → do a manual coarse pass first
- Less than 2 weeks since the last pass and no major refactors → **low leverage, don't run**
- The single most important check: **"what code surfaces have moved since this issue was filed?"**

Plus a caution against overuse:

> "**T6:** Running too often — If you find yourself dispatching `omh-triage` weekly, the fix is upstream."

**A framework that dares to write "don't use me too often" in its own docs is displaying rare honesty.**

---

## 5. The Plugin Layer: Role Injection and Atomic State

### 5.1 Role Injection: The Key Optimization from v1 to v2

**v1 (the verbose version)**: the role's full description text is inlined into the `context` field of `delegate_task`.

**v2 (the lean version)**: just a `[omh-role:NAME]` marker in the goal string, with the role injected automatically by a hook.

```python
delegate_task(
    goal="[omh-role:executor] Implement the following task:\n\n<task>...",
    context="<project context only>"
)
```

**The mechanism** (`docs/plugin.md`):

> "The key architectural insight for role injection: `delegate_task` passes `goal` as `user_message` to the subagent's `run_conversation()`. The `pre_llm_call` hook receives this as `user_message` on `is_first_turn=True`, making it the natural injection point — **no new Hermes primitives required.**"

The direct payoff:

> "**Parent context never loads role text — zero token overhead.**"

This is a very clever lever: **without changing a single line of the upstream framework, it found an existing injection seam.**

### 5.2 The Role Catalog (15 Role Files)

| Role | Responsibility | Used by |
| --- | --- | --- |
| Planner | Task decomposition, ordering, risk marking | ralplan |
| Architect | Structural review, boundary clarity, long-term maintainability | ralplan, ralph final review |
| Critic | Adversarial challenge, assumption testing, stress testing | ralplan |
| Executor | Code implementation, test-first, minimal changes | ralph |
| Verifier | Evidence-based completeness check, **read-only**, pass/fail | ralph |
| Analyst | Requirements extraction, hidden constraints, acceptance criteria | deep-interview, autopilot |
| Security Reviewer | Vulnerabilities, trust boundaries, injection vectors | autopilot verification phase |
| Test Engineer | Test strategy, coverage, edge cases, flakiness resistance | autopilot QA phase |
| Code Reviewer | Diff review, conventions, overall quality | autopilot verification phase |
| Debugger | Root-cause analysis, hypothesis testing, minimal targeted fixes | ralph error diagnosis |
| Researcher | Single-subtopic research, structured finding blocks | deep-research |
| Research Synthesist | Synthesizing multiple findings | deep-research |
| Research Verifier | **Read-only** verification of citation integrity | deep-research |
| Triage Maintainer / Skeptic | The two triage roles | triage |

### 5.3 The Three Hooks

| Hook | What it does |
| --- | --- |
| `pre_llm_call` | Detects `[omh-role:NAME]` in the subagent's `user_message`, injects the role prompt into the system context; also injects "mode awareness" (current phase/iteration) |
| `pre_tool_call` | Validates the role tag before the subagent starts; an unknown role name only **warns, doesn't block** (catches typos fast) |
| `on_session_end` | On an unexpected exit, writes an `_interrupted_at` timestamp into the active mode's state file |

### 5.4 The omh_state Tool: The Atomic State Engine

**Atomic write pattern**:

```
write .tmp.{uuid} → fsync → os.replace
```

This is the standard atomic file replacement pattern — `os.replace` is atomic on POSIX, so a state file is **never caught in a half-written state**. No matter when the program crashes, what's on disk is either the old version or the new version, never a mangled one.

**Every write carries a `_meta` envelope**:

```python
{
  "_meta": {
    "written_at": "ISO8601 timestamp",
    "mode": "...",
    "schema_version": 1,
    "written_by": "omh-plugin"
  },
  ...actual data
}
```

**Advisory lock**:

- A `.lock` file containing JSON: `{pid, session_id, started_at, lock_key, holder_note?}`
- **Stale lock detection**: uses `os.kill(pid, 0)` to check whether the lock-holding process is still alive
- Automatically releases stale locks on retry

This solves a real problem: an AI session crashes, the lock file stays on disk, and the next startup gets locked out by its own corpse. PID liveness detection sidesteps that.

### 5.5 The omh_gather_evidence Tool: The Security Model of Evidence Gathering

This tool has to execute shell commands (running tests, running builds), making it the largest attack surface in the whole system. Its defenses are layered:

| Defense | Description |
| --- | --- |
| **Reject shell metacharacters** | Any `;` `&` `\|` `` ` `` `<` `>` in the command is rejected — injection prevention |
| **Token-prefix allowlist** | `npm test` matches `npm test --verbose`, but **not** `npm testing-malicious` |
| **`shell=False`** | subprocess never goes through a shell, eliminating variable expansion |
| **Working-directory confinement** | Pinned to the project root; can't escape via tool arguments |
| **Per-command timeout** | 120 seconds by default, 300 seconds max |
| **Output truncation** | 2000 characters by default, **keeping the tail** (error messages usually live at the end) |

Note the detail of the "token-prefix allowlist" — with a naive `startswith("npm test")`, `npm testing-malicious` would get through. Splitting on whitespace and comparing prefix tokens is the correct approach. **This is code written by someone who genuinely understands security.**

### 5.6 omh-delegate: A Hardened Dispatch Wrapper

`docs/omh-delegate.md` contains an extremely restrained, extremely honest passage:

> "omh_delegate mitigates an **intentional architectural property** of Hermes's `delegate_task`, not a bug. By design, `delegate_task` returns *only the subagent's final summary* to the parent [...] **There is no upstream fix to wait for: the contract is the feature.**"

**"Don't file someone else's design trade-off as a bug"** — that's the dividing line between a mature engineer and a complaining engineer.

**The solution: pure subagent persistence (subagent-persists)**

Give the subagent a deterministic output path, append a "brutal prose contract block" to the goal telling it: **your last action must be `write_file` to this exact path.** Then the wrapper checks whether the file exists.

**No rescue branch**:

> "There is **no rescue branch in v0**. If the subagent ignores the contract, the wrapper returns `ok=False` with the raw return preserved [...] — **loud failure, not silent rescue.** This is deliberate: it preserves the feedback signal that teaches us whether the contract prose works in practice."

**This philosophy deserves to be copied by everyone.** We're way too used to writing fallback logic: "if the AI doesn't return in the right format, I'll rescue it with a regex." The result — you never learn how bad your prompt actually is, because the fallback swallowed the bad signal.

**Breadcrumbs are append-only, never mutated**:

```
.omh/state/dispatched/{id}.dispatched.json   ← written by prepare()
.omh/state/dispatched/{id}.completed.json    ← written by finalize() (a separate file)
```

> "Both breadcrumbs are **append-only**. The wrapper never mutates a breadcrumb after writing it; completion data lives in a sibling file. **This eliminates a class of read-modify-write race conditions.**"

**Forward-compatible foresight (AC-1)**:

> "In v0 the `ok` field is a plain bool. v1.B may reintroduce a rescue branch and make `ok` tri-state (`True | False | "degraded"`). **Python truthiness will treat the string `"degraded"` as truthy**, so naïve callers writing `if result["ok"]:` would silently treat a degraded result as success. To stay correct across that future change, callers needing a hard pass/fail check should use `ok_strict`."

The author **foresaw in v0 that the v1 tri-state change would silently break callers**, so `ok_strict` is provided now. This awareness of "leaving a door open for yourself three years from now" lines up neatly with the "make architecture decisions for the long haul" principle in this repo's engineering guidelines.

### 5.7 The .omh/ Directory: Selective Sharing

| Subdirectory | In git? | Lifecycle | Contents |
| --- | --- | --- | --- |
| `state/` | **No** | Per-session | Active mode state JSON + `.lock` files |
| `logs/` | **No** | Per-session | Append-only event logs — decisions/state transitions only, not content |
| `progress/` | **No** | Per-session | ralph execution progress logs |
| `specs/` | **Yes** | Durable | Confirmed interview specs |
| `plans/` | **Yes** | Durable | Consensus plans (ADR-form) |
| `research/` | **Yes** | Durable | Research reports produced by deep-research |

The docs put the philosophy behind this split very well:

> "A spec or a consensus plan is a **decision artifact** — the canonical record of 'what we agreed to build.' It belongs in the repo for the same reason an ADR belongs in the repo. Treating these as user-private throws that away. State and logs are **per-session runtime.**"

> "State and logs [...] reflect what one developer was doing at one moment, and they're cleared on completion. **Sharing them adds noise without value.**"

**That boundary is drawn with remarkable precision**: of everything an AI produces, the "conclusions" deserve to be in version control; the "process" doesn't. Many teams commit AI session logs wholesale, nobody ever reads them, and the repo just gets fatter.

---

## 6. Design Philosophy (Fourteen Principles)

Every principle below has an explicit source in the repo; this isn't my interpretation.

### 6.1 Skills Work Standalone; the Plugin Enhances, It Doesn't Gate

> "Skills work standalone with zero dependencies."（README）

> "Keep skills standalone-capable; plugin features should enhance, not gate."（CONTRIBUTING）

Meaning: without the plugin, the skills still work — just more verbosely (role text must be inlined). With the plugin, the experience is better. **There's no "you must install the plugin to get started" hostage-taking.**

(The one exception is `omh-ralph`, which genuinely needs the plugin — because it depends on atomic state and locks.)

### 6.2 Consensus Debate Beats a Single-Pass Output

> "This catches blind spots that a single agent misses. The Critic's job is to break the plan — if it survives, it's stronger for it."

### 6.3 Evidence Over Assertion

> "The iron law of ralph verification: evidence, not assertion."

> "No approval without fresh evidence. If you don't see test output, it didn't pass."

### 6.4 Strict File Ownership

> "When dispatching parallel executors, only ONE task owns each shared file."

> "Stay in your file scope."

### 6.5 The Orchestrator Gathers Evidence; the Verifier Doesn't

> "Critical: the verifier does NOT run evidence themselves. Gathering happens at the orchestrator level."

### 6.6 Three-Strike Breaker Counts by Category

> "Tagging by category prevents test-infra strikes from masking real bugs."

### 6.7 The Orchestrator Stays Above the Work, Not in It

> "The orchestrator role exists for one reason: **to stay above the work** so you can dispatch with one altitude and review with another."

> "The orchestrator's discipline: **skepticism, not deference.** Trust given to you (by the user installing you as orchestrator) is meant to be **USED**, not held in reserve."

That last line is brilliant — **the most common AI failure isn't doing something wrong; it's being overly polite and afraid to make a judgment call.**

### 6.8 The Altitude Contract: Brief vs. Deep Review

> "The brief is the test of altitude: if you cannot reduce the deep review to a clean decisions-first brief, you do not have the altitude you think you have."

### 6.9 The META Question: The Critic Must Be Able to Contest the Frame

> "The single most load-bearing move: the Critic must be licensed to contest the framing itself."

### 6.10 The User Always Holds the Exit Right

> "The user always decides when they're done — scoring never auto-terminates."

> "Coarse bins are advisory heuristics for question targeting. The user always decides when they're done. **Never auto-terminate based on coverage scores.**"

### 6.11 Loud Failure, Not Silent Rescue

> "Loud failure, not silent rescue. This is deliberate: it preserves the feedback signal."

### 6.12 The Context Package Is Where Quality Is Born

> "**The context package is where quality is born.** Verify ground truth, surface adjacent mechanisms, verify external premises, settle filesystem layout, walk it with the user, kill phantom contests on reframe. **Most pitfalls in this skill are pre-dispatch failures.** Treat the package as the load-bearing artifact it is."

**This may be the most practical principle of all.** Most people think AI output quality depends on how strong the model is; it actually depends on how accurate the context you feed it is. The vast majority of the 26 pitfalls are pre-dispatch failures — **the problem lives before you hit Enter.**

### 6.13 A "Design Stance" ≠ a "Requirements Document"

> "A 'design stance' and a 'requirements document' are different artifacts."

> "Requirements need: **needs not features; every item has inline citations; prefer missing to fabricating; forbid feature-by-analogy.**"

Forbid feature-by-analogy is a great term — it's about the fake requirement of "another product has this feature, so we should too."

### 6.14 Bootstrapping: Building Itself with Itself

> "OMH was built using its own tools. The first skill implemented was `omh-ralplan` (consensus planning), which was then used to design the remaining skills through multi-agent debate."

> "Each consensus process produced a plan that was then reviewed against the actual OMC source code and LobeHub marketplace implementations."

**Bootstrapping is the strongest proof of credibility.** A multi-agent orchestration framework whose own author doesn't use it to design things is a toy.

---

## 7. Detailed Tutorial: From Zero to Hands-On

> The tutorial below assumes you already have [Hermes Agent](https://github.com/NousResearch/hermes-agent) v0.7.0 or later installed.

### 7.1 Step 1: Installation

**Option A: via the skills tap (recommended)**

```bash
# 1. Add the skill source
hermes skills tap add witt3rd/oh-my-hermes

# 2. Install the skills you need
hermes skills install \
  omh-deep-research \
  omh-ralplan \
  omh-ralplan-driver \
  omh-deep-interview \
  omh-ralph \
  omh-ralph-driver \
  omh-ralph-task \
  omh-autopilot
```

**Option B: manual copy**

Just copy the `skills/<name>/` directory into `~/.hermes/skills/omh/`.

**Install the optional plugin** (strongly recommended; required for `omh-ralph`):

```bash
# Requires Python 3.10+ and pyyaml
pip install pyyaml

# Install plugins/omh/ into ~/.hermes/plugins/omh/
cp -r plugins/omh ~/.hermes/plugins/omh
```

### 7.2 Step 2: Initialize the `.omh/` Directory

OMH seeds the `.omh/` directory into your project automatically on first use (requires the plugin). To set up the skeleton in advance:

```
omh_state(action="init")
```

The generated structure:

```
.omh/
├── .gitignore        ← preconfigured "selective sharing"
├── README.md         ← explains the convention
├── state/            ← not in git
├── logs/             ← not in git
├── progress/         ← not in git
├── specs/            ← in git (decision artifacts)
├── plans/            ← in git (decision artifacts)
└── research/         ← in git (decision artifacts)
```

The generated `.gitignore` looks like this:

```gitignore
# Ephemeral runtime — not for sharing
state/
logs/
progress/

# Durable decision artifacts — tracked in git
# specs/      confirmed interview specs
# plans/      consensus plans (ADR-form)
# research/   research reports
```

### 7.3 Step 3: Requirements Still Vague? Interview First

```
Load the omh-deep-interview skill and start a requirements interview: I want to build an XXX
```

It will:

1. **Open with two questions**: the project description + whether this is a brand-new project (greenfield) or an existing one (brownfield).
2. **Enter the interview loop** (≤5 rounds, extendable to 10): each round asks one question targeting the **weakest dimension**.
3. **Generate a spec**: distilled into `.omh/specs/{name}-spec.md`
4. **Wait for your confirmation**: confirm / request changes / abandon

**Key point**: it **never decides on its own that "I've asked enough."** The coarse-grained scores (HIGH/MEDIUM/LOW/CLEAR) only decide "which dimension does the next question target," never when to end.

**Artifact**: `.omh/specs/{name}-spec.md`, with `status: confirmed`. Only specs in this state are valid for downstream skills.

### 7.4 Step 4: Run a Consensus Planning Session

```
Load the omh-ralplan and omh-ralplan-driver skills,
and run a consensus planning session based on .omh/specs/my-feature-spec.md
```

**If you're acting as the orchestrator yourself, make sure you load the driver skills too.**

**Phase 0: Author the context package** — this is the most important step. Per P10, **walk it through with the user before dispatching**:

```markdown
## Context Package

### What we're solving
(distill the core requirements from the spec)

### Relevant existing code
(list key file paths + a one-line description of each)

### Known constraints
(tech stack, performance requirements, things that can't be touched)

### Things to push on inside the current frame
1. ...
2. ...

### META question (mandatory!)
Is the framing above itself correct? Are we solving the right problem?
Is there a fundamentally different decomposition?
```

**That final META question can't be omitted.** Without it, the Critic only catches details.

**Phase 1: Run the rounds**

- Round 1 serial: Planner → Architect → Critic
- From round 2 on, parallel: after the Planner revises, the Architect and Critic review simultaneously

**Phase 2: Distill into two artifacts**

- `brief.md` — for the user, 1–2 pages, decisions first
- `<orchestrator>-review-deep.md` — for the archive, not meant to be read by default

**Artifact**: `.omh/plans/ralplan-{slug}.md`

### 7.5 Step 5: Execute

```
Load the omh-ralph and omh-ralph-driver skills,
and start executing per .omh/plans/ralplan-my-feature.md
```

**The planning gate blocks you first**: without a numbered task list with **testable acceptance criteria**, ralph refuses to execute. This is deliberate — it prevents "just start coding and figure it out later."

A proper ralph-shaped plan looks like this:

```markdown
## Task List

### Task 1: Add the user model
- **Owned files**: `src/models/user.py`, `tests/test_user.py`
- **Do not modify**: `src/models/__init__.py` (owned by Task 3)
- **Dependencies**: none
- **Acceptance criteria**:
  - [ ] The `User` class has `id` / `email` / `created_at` fields
  - [ ] `pytest tests/test_user.py` is all green
  - [ ] The email field has format validation; invalid input raises `ValidationError`

### Task 2: Add the user repository
- **Owned files**: `src/repos/user_repo.py`, `tests/test_user_repo.py`
- **Dependencies**: Task 1
- **Acceptance criteria**:
  - [ ] Three methods: `save()` / `find_by_id()` / `find_by_email()`
  - [ ] `pytest tests/test_user_repo.py` is all green
```

**Run only one task per invocation (or a batch of 2–3 parallel-safe tasks), then exit.** You need to keep invoking until the state becomes `complete`.

**The four things the orchestrator does between each iteration**:

1. **Pick the right batch** — 2–4 independent tasks whose files don't overlap
2. **Write enough context for the executors** — TDD instructions, the "do not modify" list, commit metadata, learnings from earlier tasks
3. **Gather evidence yourself before dispatching verifiers** — `omh_gather_evidence`
4. **Dispatch the verifiers in parallel**

**To stop in the middle**:

```
omh_state(action="cancel", mode="ralph", instance_id="{instance_id}", reason="user request")
```

30-second TTL, clean abort.

### 7.6 Step 6 (Optional): The Fully Automatic Pipeline

```
Load the omh-autopilot skill and complete end to end: I want to build an XXX
```

It chains the 6 phases automatically. **Each invocation advances one phase step**, so you still keep invoking, but every invocation has fresh context and never blows up.

It also **smartly skips completed phases**: you did the interview yesterday, so today it starts straight from planning.

### 7.7 Step 7: Facing an Unfamiliar Domain? Research First

```
Load the omh-deep-research skill and research: the current state of XXX technology and its best practices
```

A five-phase flow, **advancing one batch per invocation** (at most 3 parallel researchers).

**Artifact**: `.omh/research/{slug}-report.md`, with `status: confirmed`.

**Cost expectations**: 5–8 subagent calls on the happy path; 14–16 worst case.

### 7.8 A Full Pipeline Example

```bash
# Scenario: building a new feature in an unfamiliar domain

# 1. Understand the domain first (invoke repeatedly until status: confirmed)
> Load omh-deep-research and research the SFU architecture of WebRTC

# 2. Clarify the requirements (interactive — you answer the questions)
> Load omh-deep-interview and interview my requirements based on the research report above

# 3. Argue out a plan (max 3 rounds)
> Load omh-ralplan + omh-ralplan-driver and run consensus planning based on the spec

# 4. Do the work (invoke repeatedly until complete)
> Load omh-ralph + omh-ralph-driver and execute per the plan
> continue
> continue
> ...

# 5. Inspect the artifacts
$ ls .omh/plans/     # consensus plans (in git)
$ ls .omh/specs/     # requirement specs (in git)
$ ls .omh/research/  # research reports (in git)
$ git log --oneline  # one commit per task
```

### 7.9 Common Pitfalls and Troubleshooting

| Symptom | Cause | Fix |
| --- | --- | --- |
| ralph refuses to execute | The plan has no numbered tasks with acceptance criteria | Fill in the task list; every task needs testable acceptance criteria |
| Parallel tasks conflict by editing the same file | No "do not modify" list written at dispatch time | Each shared file can only be owned by one task (P3) |
| The verifier always passes, but the code is actually broken | You didn't gather evidence before dispatching verifiers | Run `omh_gather_evidence` first and feed the output to the verifier (P6) |
| The Critic only catches small issues | No META question in the context package | Explicitly add the "is the frame itself correct" license (P4) |
| Locked out after a session crash | A stale `.lock` file | The plugin detects it with `os.kill(pid, 0)` and releases it automatically |
| Context window blows up | Trying to run all tasks in one session | That's exactly what "one task per invocation" solves — let it exit, then invoke again |
| The executor is fixing test failures it didn't cause | Interference from sibling tasks | Use the `git stash`-against-HEAD verification to pin down responsibility |

---

## 8. Takeaways: Observations and Conclusions

### Takeaway 1: The Value of Multi-Agent Isn't "More Compute," It's "Structured Dissent"

A lot of people think multi-agent just means "run it three times and keep the best." OMH does something completely different: **the three roles have mutually conflicting objectives.**

- The Planner's objective is to **produce a plan**
- The Critic's objective is to **destroy the plan**
- The Architect's objective is to **evaluate the structure**

This **built-in adversarial quality** is where the value comes from. If all three roles were "help me think about what else could go wrong," it would degrade into three passes of homogeneous sampling — burning money for nothing.

**Conclusion**: when designing a multi-agent system, ask first — "do these roles' objectives actually conflict?" If they don't, you're just wasting tokens.

### Takeaway 2: The Biggest Insight Is "The Critic Must Be Licensed to Question the Task Itself"

Pitfall P4 is the single densest entry in the whole repo:

> "Without licensing, the Critic catches details. With licensing, the Critic catches the frame."

This rule reveals a more general phenomenon: **AI thinks inside the frame you give it by default.** Ask "how do I optimize this for loop," and it will never say "this loop shouldn't exist at all." You have to explicitly grant it "you may overturn my premises."

And the supporting evidence is right in the repo: OMH's most central execution architecture (one task per invocation) **was hammered out by the Critic once it was licensed.**

**Conclusion**: in any important AI consultation, explicitly add — "you can also question whether this question of mine is even the right one to ask." The expected value of that single sentence may exceed switching to a more expensive model.

### Takeaway 3: "Evidence Over Assertion" Should Be the Default Setting of All AI Engineering

An AI's "it's done" has credibility close to zero. Not because it's malicious — because its generation mechanism is "completing a sentence that sounds right."

OMH's three-layer defense is worth copying:

1. **The Verifier is read-only** — it can't modify code, so it can't "fix it in passing and then claim it passes"
2. **The Orchestrator gathers evidence** — the evidence doesn't come from the party being audited, cutting off fabrication at the source
3. **Binary verdicts with no discounts** — four of five criteria = FAIL

**Conclusion**: in any AI automation pipeline, the answer to "who runs the tests" cannot be "the party being accepted." That's the oldest principle in audit theory, and it holds just as well in the AI era.

### Takeaway 4: "Loud Failure" Has More Long-Term Value Than "Silent Rescue"

> "Loud failure, not silent rescue. This is deliberate: it preserves the feedback signal."

This philosophy is counterintuitive but deeply correct. Our instinct is to add safety nets around AI output: regex-rescue a wrong format, fill in default values for missing fields. The result — **your prompt never improves, because how bad it is got swallowed by the fallback.**

OMH deliberately chose not to have a rescue branch in v0, precisely to collect the real signal of "does the contract prose actually work."

**Conclusion**: while a system is still evolving, **don't rush to add fallbacks.** Add them only after you fully understand the failure distribution — otherwise they're just painkillers masking the illness.

### Takeaway 5: Splitting "Worker Discipline" from "Foreman Scripts" Is an Underrated Architectural Decision

OMH splits every workflow into two skills:

- `omh-ralph` = the worker's discipline **inside** `delegate_task`
- `omh-ralph-driver` = the foreman's script **between** dispatches

This solves a real pain point: **the load timing and consumers of these two kinds of knowledge are completely different.** The worker doesn't need to know how to batch; the foreman doesn't need to know how to write unit tests. Mixed together, both sides have to read a pile of irrelevant content, burning context for nothing.

**Conclusion**: when writing AI skills/prompts, split by "who reads this and when," not by "topic relevance."

### Takeaway 6: The 36 Numbered Pitfalls Are the Most Valuable Asset in This Project

The two drivers add up to 36 pitfalls (P1–P26 + P1–P10), every single one of them learned from real runs. These aren't the empty talk of a "best practices checklist" — they're executable causal judgments as specific as "if you don't write the META question, the Critic stays inside the frame."

Especially that P26 line:

> "The brief is the test of altitude: if you cannot reduce the deep review to a clean decisions-first brief, you do not have the altitude you think you have."

**That sentence is a mirror for every AI user.** Your AI gives you 3000 words and you still don't know what to do after reading them — it's not that the AI didn't try hard; it's that "altitude" went wrong.

**Conclusion**: to tell whether an AI framework is mature, look for its "pitfall list." One with principles but no pitfalls probably never ran in a real scenario.

### Takeaway 7: "Don't File Someone Else's Design Trade-off as a Bug"

That line in `omh-delegate.md` — "There is no upstream fix to wait for: the contract is the feature" — shows a rare kind of restraint.

Hermes's `delegate_task` returns only the final summary — which means the parent can't get the intermediate process. It's very easy to complain about this as a bug and wait for upstream to fix it. OMH's judgment: **this is the necessary cost of isolation, a feature, not a flaw.** So it designed "subagent persistence" to work around it, instead of waiting.

**Conclusion**: when facing a third-party framework's limitation, first ask "is this intentional?" If it is, design the adaptation on your own side — don't bet on upstream changing.

### Takeaway 8: Cost Transparency Is Professional Ethics

The README states it plainly: 5–8 calls on the happy path, 14–16 worst case.

**The vast majority of AI frameworks don't dare to publish that number.** Because once you write it down, you have to own it — and it makes things look "less magical." OMH wrote it down, and backed it with the three-strike cap as a hard constraint.

**Conclusion**: when evaluating any AI tool, look for its cost envelope first. If you can't find one, assume it has no upper bound.

### Takeaway 9: The `.omh/` Selective Sharing Is the New Version-Control Etiquette of the AI Era

> "A spec or a consensus plan is a decision artifact [...] State and logs are per-session runtime. Sharing them adds noise without value."

**Decisions go in the repo; process doesn't.** That boundary is drawn with remarkable precision. A consensus plan is an ADR, worth keeping forever; a session's state JSON serves only to dirty up `git log`.

**Conclusion**: define an "AI artifact commit rule" for your project. Specs, plans, research reports → commit. State, logs, progress → don't.

### Takeaway 10: Bootstrapping Is the Strongest Proof of Credibility

> "OMH was built using its own tools. The first skill implemented was `omh-ralplan`, which was then used to design the remaining skills through multi-agent debate."

Build the consensus planner first, then use it to design all the remaining skills. And every plan produced by a consensus process was **cross-checked against the real OMC source code**, making sure it wasn't pure imagination.

**Conclusion**: to judge whether a developer tool is trustworthy, look at whether its author uses it. A tool its author doesn't use is, at bottom, a demo.

### Summary: What OMH Is Really Passing On

Set aside all the technical details, and Oh My Hermes is passing on one belief:

**AI being unreliable isn't the problem. The problem is that you haven't designed a process for "AI being unreliable."**

- AI has blind spots → so have another AI whose only job is finding blind spots (the Critic)
- AI talks out of its own head → so don't listen to it; look only at evidence (Verifier + Orchestrator running tests)
- AI gets stuck in infinite loops → so count error fingerprints, and trip the breaker after three
- AI blows up the context window → so do one thing per invocation and keep state on disk
- AI thinks inside the frame → so explicitly license it to overturn the frame (the META question)
- AI is overly polite → so tell it plainly "trust is meant to be used, not held in reserve"

**Every unreliability maps to one engineering discipline.** That's the entire secret of OMH — it doesn't try to make AI smarter; it tries to make **a not-so-smart AI, under a good set of rules, produce reliable results.**

That's also why it's worth learning: **these rules have almost nothing to do with which model or framework you use.**

---

## 9. References

- Project repository: `https://github.com/witt3rd/oh-my-hermes`
- Hermes Agent: `https://github.com/NousResearch/hermes-agent`
- Inspiration oh-my-claudecode: `https://github.com/Yeachan-Heo/oh-my-claudecode`
- Concepts doc: `https://github.com/witt3rd/oh-my-hermes/blob/master/docs/concepts.md`
- Plugin doc: `https://github.com/witt3rd/oh-my-hermes/blob/master/docs/plugin.md`
- Dispatch wrapper: `https://github.com/witt3rd/oh-my-hermes/blob/master/docs/omh-delegate.md`
- Comparison with OMC: `https://github.com/witt3rd/oh-my-hermes/blob/master/docs/omc-comparison.md`
- Hermes constraints doc: `https://github.com/witt3rd/oh-my-hermes/blob/master/docs/hermes-constraints.md`
- Unbuilt parts: `https://github.com/witt3rd/oh-my-hermes/blob/master/docs/gaps.md`
- Roadmap: `https://github.com/witt3rd/oh-my-hermes/blob/master/ROADMAP.md`
- Contributing guide: `https://github.com/witt3rd/oh-my-hermes/blob/master/CONTRIBUTING.md`
- Triage skill discussion: `https://github.com/witt3rd/oh-my-hermes/issues/9`
