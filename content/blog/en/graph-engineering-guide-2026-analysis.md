---
title: "Graph Engineering (2026) Deep Dive: Wiring Loops into a Graph — Nodes, Edges, Shared State, and an Honest Hype Check"
description: "A complete analysis of AI Builder Club's 'Graph Engineering Guide (2026)' — the mid-2026 paradigm shift on X from a single agent loop to a multi-node agent graph (nodes do the work, edges route between them, shared state flows along the edges). Covers the concept's origin (Peter Steinberger's question, @rohit4verse's org-chart metaphor), the nodes/edges/shared-state trio, the loop-vs-graph decision table, the prior art (LangGraph, AutoGen GraphFlow, Google ADK, A2A), the 5 layers of AI engineering (Prompt→Context→Harness→Loop→Graph), and the honest hype check: is graph engineering just slop? Core claim: master the loop first, and only split into a graph when the work forces your hand."
date: "2026-08-10"
author: "TopDigg Research Team"
tags: ["Graph Engineering", "AI Agent", "Loop Engineering", "LangGraph", "AutoGen", "Google ADK", "A2A", "Multi-Agent", "Orchestration", "AI Engineering", "Harness"]
categories: ["Deep Dive"]
keywords: ["Graph Engineering", "AI agent", "loop engineering", "LangGraph", "AutoGen", "Google ADK", "A2A", "multi-agent", "orchestration", "shared state", "nodes", "edges", "hype"]
---

# Graph Engineering (2026) Deep Dive: Wiring Loops into a Graph — Nodes, Edges, Shared State, and an Honest Hype Check

> Core idea: **when a single agent running one loop isn't enough, wire multiple specialized agents or steps into a graph — nodes do the work, edges route between them, and shared state flows along those edges.** AI Builder Club's *Graph Engineering Guide (2026)* (published 2026-07-20 by Shirley) delivers the clearest framing of the whole discussion: loop engineering designs the cycle *one* agent repeats; graph engineering decides how *several* of those loops connect. And the very first thing an honest guide has to tell you: **most tasks never need it** — the people mocking it as slop have a point worth keeping in your pocket the whole way through. The sharpest one-line test is from @shannholmberg: "the difference is who decides the path, the agent or you." In a loop you set the goal and the bar and the agent picks its own route; in a graph you declare the valid paths and the checks along them, so the agent's freedom lives *inside* each node instead of across the whole job.

---

## 1. Project Overview

### 1.1 What Is It?

This article analyzes **AI Builder Club's *Graph Engineering Guide (2026)* at aibuilderclub.com** (published **July 20, 2026**, updated July 27, 2026, ~17 min read) — section 4.16 of its "Build AI Agents" course outline. It is not a product review but a **plain, non-hype decode** of the "graph engineering" discussion that exploded on X in mid-July 2026.

The guide defines graph engineering as:

> **The practice of designing the graph your agents run in: which specialized nodes exist, which edges route work between them, and what shared state travels along those edges.** Loop engineering designs the cycle *one* agent repeats. Graph engineering decides how several of those loops connect.

A single loop is the smallest possible graph — one node with an edge back to itself — so this isn't a replacement for loop engineering. It's the layer directly above it.

### 1.2 Key Facts

- Source: AI Builder Club, *Graph Engineering Guide (2026)* (`aibuilderclub.com/blog/graph-engineering-guide-2026`)
- Author: Shirley (AI Builder Club editorial team)
- Published: 2026-07-20 (updated 2026-07-27)
- Positioning: the outermost layer of the 5-layer AI engineering stack (Prompt → Context → Harness → Loop → **Graph**); part of a 40+ article course series alongside the Loop Engineering guide (4.8)
- Concept crystallization timeline: July 18-19, 2026 on X (Peter Steinberger's question → amplified by @svpino, @rohit4verse, @VaibhavSisinty)
- Key people: Peter Steinberger (creator of OpenClaw), Harrison Chase (creator of LangGraph), @sairahul1, @shannholmberg, @rohit4verse, @daleverett, @RhysSullivan, @DavidKPiano (creator of XState), @PawelHuryn, @NathanFlurry

### 1.3 What Problem Does It Solve?

The moment it clicked for many people: you have an agent happily grinding through a loop — discover, plan, execute, verify, repeat — and it's fine, until the task stops being one job. Now it's *research this, then write it up, then have something skeptical tear the draft apart, then decide whether to ship or send it back.* You can cram all of that into one agent's loop and watch it lose the plot. Or you can give each job its own node and wire them together. The second thing is a graph.

The problem it solves, at bottom: **when a single loop is no longer the right shape for the work** — when the task splits into distinct specialties that need to hand off — the loop engineering frame is not enough.

---

## 2. Core Ideas

### 2.1 The Sharpest Definition: Who Decides the Path?

@shannholmberg (on X, July 20, 2026) framed loops and graphs as two ways to run an agent where:

> **"The difference is who decides the path, the agent or you."**

- **Loop**: you set the goal and the bar; the agent picks its own route to clear it.
- **Graph**: you declare the valid paths and the checks along them — this node, then that one, branch here if the review fails — while some edges still get decided at runtime, so the agent's freedom lives *inside* each node instead of across the whole job.

That framing also explains why the term drew fire as fast as it drew followers. Harrison Chase, who built LangGraph, replied to that same thread:

> "So I didn't really know what graph engineering is, and i still don't really... but it's basically just langgraph?"

When the person whose framework is the reference implementation isn't sure the word names anything new, that's worth registering rather than waving off. Pushing the other way, @daleverett published a piece on July 19 titled *"Loops are just shitty graphs"*, arguing the graph was always the real structure and the single loop was the degenerate case we settled for.

### 2.2 Three Things Graph Engineering Is Not

1. **Not knowledge graphs or GraphRAG.** Those model *data* as entities and relations for retrieval. Graph engineering models *execution* — which agent runs next and what state it gets. Same word, unrelated problem.
2. **Not a new capability.** Nothing shipped in July 2026 that you couldn't build in 2025. LangGraph, Microsoft AutoGen, and Google ADK were doing graph orchestration well before the term existed. What's new is the vocabulary.
3. **Not a default.** Most tasks are one job with one verifier, and that's a loop. Reaching for a graph before the work forces you is how you buy yourself a distributed-systems problem you didn't have.

### 2.3 The Line From Loops to Graphs: Leverage Moves Out One Layer Every Year

| Era | Layer | What you engineer | Your role |
|------|-------|-------------------|-----------|
| 2023-24 | **Prompt** | The request you send | Operator |
| 2024 | **Context** | What the model gets to see | Editor |
| 2025 | **Harness** | The tools, memory, and scaffolding around it | Toolmaker |
| Early 2026 | **Loop** | The cycle one agent repeats until done | System designer |
| Mid 2026 | **Graph** | The coordination between many agents/steps | Org designer |

The graph is the newest rung — newest by a matter of days. The word crystallized on X around **July 18-19, 2026**. The seed was a question: Peter Steinberger (creator of OpenClaw) asked, in a line relayed by @sairahul1: *"Are we still talking loops or did we shift to graphs yet?"* That's the whole origin — not a launch, not a paper, a builder wondering out loud whether the frame had already moved.

Within a day the timeline answered. @svpino put it as a mock-eulogy: *"Loop Engineering is dead. Long live Graph Engineering!"* @rohit4verse gave it the framing that stuck: *"Loop engineering was the last unlock. Graph engineering is the next one. Agents are graduating from while-loops to org charts."*

Notice what's *not* here: a new capability. Nobody shipped a thing on July 18 that you couldn't do on July 17. What shifted was the name people put on a design problem they were already having.

---

## 3. Detailed Tutorial: Nodes, Edges, Shared State + the Eight-Step Starting Checklist

### 3.1 What Is an Agent Graph, Exactly? — Exactly Three Parts

Strip the jargon and an agent graph has exactly three parts:

1. **Nodes** — the units that do work. A node is usually a specialized agent (a "researcher," a "writer," a "reviewer") or a plain deterministic step (a function, a tool call, a data fetch). Each node has one job.
2. **Edges** — the routing between nodes. An edge says *after this node, go to that one.* Edges can be straight (A then B), **conditional** (if the review passes, ship; if not, loop back), **fan-out** (one node kicks off three in parallel), and **fan-in** (three results join back into one).
3. **Shared state** — the object that travels along the edges. It's what every node reads from and writes to: the task, the draft so far, the notes, the verdict. State is what turns a pile of agents into a *system* instead of a group chat that forgets everything.

The metaphor doing the heavy lifting on X is @rohit4verse's **org chart**. A company doesn't make one person do research, writing, and review in a single unbroken stint — it gives those to different roles, routes work between them, and lets results roll back up. An agent graph is the same idea: specialized roles, defined hand-offs, a shared record.

Honesty check on how far that metaphor travels: when the roles are actual business functions rather than nodes in one workflow, most teams never need edges at all. Point every loop at the same folder and let it read state, work, and write state back.

**The canonical starter graph**: a researcher feeds a writer, a reviewer checks the draft, and a conditional edge decides whether to ship or send it back:

```
Task enters [Researcher node] → gathers sources, writes notes → state {task, notes}
  → [Writer node] → turns notes into a draft → state {task, notes, draft}
  → [Reviewer node] → scores the draft against the bar → conditional edge "pass" → Ship
                                           ↘ dashed edge "reject: loop back" → back to Writer
```

Three nodes, four edges — one of them conditional, one of them a loop back to the writer. State grows as it flows: the researcher's notes ride along to the writer, the draft rides along to the reviewer, and the reviewer's verdict decides the next edge.

The key realization that keeps this from feeling like a brand-new universe: **a loop is just a single-node graph with an edge back to itself.** Everything you learned about designing loops — the discover/plan/execute/verify cycle, the stop condition, the verifier — is the *inside* of one node. A graph doesn't replace the loop; it's what you get when you have several loops that need to hand off to each other.

### 3.2 When Should You Reach for a Graph? — The Honest Decision Table

This is the question that separates useful builders from people adding boxes to a diagram for fun. The default answer — the load-bearing claim of the whole guide — is: **you probably don't.** A single well-scoped task with a clear verifier is a loop, and reaching for a graph there is pure overhead.

| Signal in the work | Loop is enough | Reach for a graph |
|--------------------|---------------|-------------------|
| **Shape of the task** | One job with a clear finish line | Splits into distinct specialties that hand off |
| **Parallelism** | Steps are sequential | You need fan-out (many at once) then a join |
| **Tools / models per step** | Same tools throughout | Different model or toolset per step |
| **Control flow** | One agent can free-roam safely | You need explicit, auditable routing between roles |
| **Failure isolation** | A bad step just retries | You want one bad node to fail without poisoning the rest |
| **Who verifies** | The agent checks its own loop output | A dedicated reviewer node checks another node's work |

Read that table as a set of *triggers*, not a checklist to satisfy. You don't need all six. But if the honest answer to most of them is the left column, building a graph is how you turn a two-hour task into a two-day framework project.

**Over-engineered — a graph you didn't need:**
"Summarize this PDF." You build a five-node graph: a fetcher, a chunker, a summarizer, a reviewer, and a formatter, with conditional edges and a shared state object. It works — and it's slower to build, harder to debug, and more expensive to run than the one thing it should have been: an agent in a loop that reads the file and writes a summary. **You engineered an org chart to answer an email.**

**Right-sized — a graph that earns its keep:**
"Produce a researched, fact-checked market brief every morning." A researcher node fans out across five sources in parallel; a synthesizer joins their findings; a writer drafts; a skeptical reviewer node — different model, read-only — scores it and loops back on a fail. Each node has a job a single loop couldn't hold, and the hand-offs are the point.

The tell is whether the graph is *doing work the loop couldn't.* If you can collapse your five nodes back into one agent's loop and lose nothing, you should. The one-line version: **master the loop first, and only split it into a graph when the work forces your hand.**

### 3.3 Isn't This Just LangGraph? — The Prior Art

The sharpest reply on the timeline was some version of *"congrats, you reinvented LangGraph."* It deserves a straight answer, because it's mostly right. The idea of building agent systems as **graphs of nodes and edges over shared state** shipped in real tools well before the term trended (described here only at the level the official docs support, as of July 2026):

- **LangGraph** (from LangChain) is, per its own docs, *"a low-level orchestration framework and runtime for building, managing, and deploying long-running, stateful agents."* In practice you define a `StateGraph`, add nodes, and add the edges between them — the exact nodes/edges/state model above. **If you've used LangGraph, you've been doing graph engineering under a different name.**
- **Microsoft AutoGen — GraphFlow** brings graph-based multi-agent orchestration to AutoGen: you describe how a team of agents connects and hands off, rather than running one agent in isolation. (The API was still moving during 2026; check the current docs.)
- **Google ADK** (Agent Development Kit) makes the graph model a headline feature: *"Orchestrate complex tasks through structured, graph-based architectures,"* with named **sequential, parallel, and loop workflow agents**, plus agent routing — fan-out/fan-in and loops as first-class building blocks. (Its Go SDK hit 2.0 GA in 2026; the graph model spans the Python/TypeScript/Java/Kotlin SDKs too.)
- **A2A (Agent2Agent)** is an open protocol for agents to delegate to each other across systems — the "edges between graphs owned by different teams" layer. It's the clearest evidence the multi-agent idea has real, pre-buzzword history in the enterprise.

**Conclusion**: is graph engineering just LangGraph? The technology, largely yes — LangGraph, GraphFlow, and ADK got there first. What's actually new in mid-2026 is narrower and softer: a *shared name* for the design decisions those frameworks always asked of you, and a growing sense that this is a distinct skill worth teaching rather than a framework detail. That's a real thing — just much smaller than "a new paradigm."

### 3.4 The 5 Layers of AI Engineering: Where Does Graph Sit?

@sairahul1 framed the whole stack in one line: *"Prompt, context, harness, loop & graph engineering, clearly explained! The best AI engineers don't just write prompts anymore. They engineer the entire system around the model."*

| # | Layer | What it engineers | The core question |
|---|-------|-------------------|-------------------|
| 1 | **Prompt** | The single request | Am I asking well? |
| 2 | **Context** | What the model sees | Does it have the right information? |
| 3 | **Harness** | Tools, memory, scaffolding | Can it act on the world and remember? |
| 4 | **Loop** | The repeat cycle one agent runs | When does it check its work and stop? |
| 5 | **Graph** | Coordination between many agents/steps | Who does what, in what order, sharing what state? |

The stack is **cumulative**, not a ladder you climb away from. A graph is full of nodes; a good node is a well-designed loop; a good loop needs a real harness (the six components: context, tools, orchestration, state, evaluation, recovery). Skip a lower layer and the graph on top just fails in a more elaborate way — **if your nodes are weak agents, wiring them into an org chart gives you a weak org.**

### 3.5 Is Graph Engineering Just Slop? — The Honest Hype Check

The critics aren't cranks; they're some of the people who know this domain best:

- **@RhysSullivan** called the shot before the article existed: *"there's going to be a 10,000 word slop article on x tomorrow about graph engineering,"* then dryly, when one appeared: *"a graph engineering article has hit the timeline."* The mockery targets the content-farm gold-rush around the term — and it's fair, a lot of what got published that week was exactly that.
- **@DavidKPiano**, creator of XState — someone who has spent years building state-machine tooling — warned: *"Keep this in mind before reading a slop article about 'agent graph engineering'."* When a literal state-machine expert rolls his eyes at "graphs" being announced as new, it's not gatekeeping; it's pointing out that directed graphs of states and transitions are decades-old computer science.
- **@PawelHuryn** went after the whole lineage: *"I call BS on graph engineering. Loop engineering was already confusing..."* His alternative: skip the mechanism-naming and just give the agent the objective, why it matters, and how success gets measured. The point: **the naming keeps mistaking the mechanism (loops, graphs) for the substance (objectives and verification).**
- **@NathanFlurry** made the prior-art point concrete: *"funny that these 'graph engineering' posts don't mention a2a."* The multi-agent-delegation idea (A2A and its cousins) already has real enterprise history, so coining a Twitter term for it in July 2026 is late, not early.

Concede all of it, because all of it is true. The mechanics are not new: directed graphs, state machines, orchestration engines, and agent-to-agent protocols predate the buzzword by years. Much of the content riding the term is slop. And "graph engineering" as a *phrase* is optional — you can build every system in this guide and never once use the words.

Now separate the word from the shift. Under the noise, a real design escalation is happening: teams that spent early 2026 getting good at running *one* agent in a loop are hitting the wall where one loop is the wrong shape, and are deliberately splitting the work into coordinated, specialized nodes with state flowing between them. That escalation is real whether or not you call it "graph engineering," the same way loop engineering was real whether or not you liked the word. The skeptics aren't refuting the escalation — they're refuting the *hype around a name for it*, and on that they're correct.

The filter, same as the loop guide:

- Are teams genuinely moving from "one agent in a loop" to "several specialized agents coordinated over shared state" when the work demands it? **Yes.**
- Is that coordination a distinct design skill — picking nodes, edges, and state — separate from designing a single loop? **Yes.**
- Is the *word* "graph engineering" new, load-bearing, or free of slop? **No — the mechanics are old, and most of the July 2026 content is noise.**

**The label is optional. The escalation from one loop to a coordinated graph is real. Just don't reach for it before you need it** — which, for most of what you're building this week, is not yet.

### 3.6 The Graph Engineering Starting Checklist

Before you turn a loop into a graph, run the idea through this:

1. **Try to keep it a loop.** Can a single well-scoped agent with a good verifier do this? If yes, stop here. You're done.
2. **Name the nodes only if they're real specialties.** Each node should have a job a single loop genuinely couldn't hold — a different model, a different toolset, or a read-only reviewer role. "Steps I could inline" are not nodes.
3. **Draw the edges before you code.** Sketch the routing: what's sequential, what fans out, what fans in, and where the one conditional/loop-back edge lives. If you can't draw it on a napkin, it's too complex.
4. **Design the shared state object explicitly.** Decide what travels along the edges and who's allowed to write to it. State drift is the #1 way graphs rot.
5. **Give the reviewer node teeth.** The single highest-value node is usually a separate, read-only verifier — a different agent from the one that produced the work. (The loop guide's "don't let an agent self-verify," promoted to a node.)
6. **Isolate failure.** Make sure one node can fail and retry without corrupting the shared state or poisoning downstream nodes.
7. **Pick a framework instead of hand-rolling.** LangGraph, AutoGen GraphFlow, or Google ADK already give you nodes, edges, state, fan-out/fan-in, and loops. Reinventing the runtime is its own kind of slop.
8. **Set a spend cap and a hard bound.** A graph is many loops; a weak verifier now burns tokens in parallel. Cap it.

If you build a graph this week, the win condition isn't "it has the most nodes." It's "**every node is doing work a loop couldn't, and I could still explain the whole thing in one breath.**"

---

## 4. Design Philosophy

### 4.1 "Who Decides the Path": Where Freedom Lives Is a Design Decision

The deepest philosophical claim in the article is @shannholmberg's: the loop/graph distinction is not a *mechanism* distinction but a *control-ownership* distinction. In a loop, the agent's freedom spans the whole task — it free-roams; you give it a goal and a bar. In a graph, you gather that freedom into the nodes — the path is declared, the checkpoints are placed, and the agent's freedom exists only within each node's boundary. **It's a continuum of "how far do you trust the agent," not a binary technology choice.**

### 4.2 The Anti-Hype Virtue: Separate the Word From the Shift

The whole article runs the same cognitive surgery: **concede every fair criticism, then separate the word from the shift.** The mechanics are decades-old CS (directed graphs, state machines — the XState creator's whole point); the word was minted on X 48 hours earlier; but "escalating from one loop to coordinated graphs" is a design escalation teams genuinely experience. **The label is optional. The escalation is real.** This is the same stance as the Loop Engineering guide — don't hype the new word, just acknowledge the underlying movement.

### 4.3 "Master the Loop First": Layers Are Cumulative, Not Replacing

The philosophical core of the five-layer stack is **cumulativity**: a graph is full of nodes; a good node is a well-designed loop; a good loop needs a real harness. Skip a lower layer and the graph on top fails in a more elaborate way. The graph is the *outermost* layer — therefore the one you should reach for *last*. Likewise, a loop is just a single-node self-loop graph — everything you learned about loops is the inside of a node. **Graph engineering is not an upgrade; it's an overlay.**

### 4.4 "Don't Engineer an Org Chart to Answer an Email": Simplicity as Discipline

The over-engineering warning is the most vivid line in the piece. The decision table is read as "triggers, not a checklist"; the test is "is the graph doing work the loop couldn't — if you can collapse it back without loss, you should." Combined with "pick a framework instead of hand-rolling" and "set a spend cap," the philosophy is: **graphs are expensive structures; pay their cost only when the work forces you to.**

### 4.5 Independent Verification: "Don't Self-Grade" Promoted to a Node

In a loop, the rule is "don't let an agent grade its own homework" (use a separate model to check completion). In a graph, that rule is **promoted into a node** — an independent, read-only reviewer, ideally on a different model, is the single highest-value node in a graph. **The minimal-trust design: producer and adjudicator separated is the one structure worth prioritizing in a graph.**

---

## 5. Evaluation Summary: Viewpoints and Conclusions

### 5.1 Viewpoint / Conclusion List

1. **Definition:** graph engineering designs the graph agents run in — nodes, edges, shared state; a loop is the minimal graph (single-node self-loop); the graph is the layer above the loop, not a replacement.
2. **Core test:** the loop/graph boundary is "who decides the path" — you declare paths, it's a graph; the agent free-roams, it's a loop.
3. **Not a new capability:** nothing shipped in July 2026; LangGraph/AutoGen GraphFlow/Google ADK were already doing it; what's new is the vocabulary and naming.
4. **Not a default:** most tasks are "one job + one verifier" = a loop; reaching for a graph before the work forces you buys a distributed-systems problem you didn't have.
5. **The decision table is triggers, not a checklist:** you don't need all six; if most answers fall in the left column, keep it a loop.
6. **Over-engineered vs right-sized:** the test is whether the graph does work the loop couldn't; if you can collapse it back, you should.
7. **Frameworks first:** LangGraph, AutoGen GraphFlow, Google ADK already ship all the primitives; hand-rolling the runtime is its own kind of slop.
8. **The hype check:** the mechanics are old (state machines / directed graphs / orchestration are decades-old CS), much of the content is slop, the word is optional — but the "single loop → coordinated graph" escalation is real.
9. **The five-layer stack is cumulative:** a good node = a good loop = a real harness; wiring weak agents into an org chart gives you a weak org; the graph is the outermost layer and the last to reach for.
10. **Practical discipline:** the reviewer node must be independent and have teeth; state must be designed explicitly (drift is the #1 rot cause); failure must be isolated; spend must be capped.

### 5.2 Key Quotes Worth Memorizing

- "The difference is who decides the path, the agent or you." (@shannholmberg)
- "So I didn't really know what graph engineering is... but it's basically just langgraph?" (Harrison Chase — the creator of the reference implementation himself)
- "Agents are graduating from while-loops to org charts." (@rohit4verse)
- "You engineered an org chart to answer an email." (the over-engineering verdict)
- "If your nodes are weak agents, wiring them into an org chart gives you a weak org."
- "State drift is the #1 way graphs rot."
- "The label is optional. The escalation from one loop to a coordinated graph is real. Just don't reach for it before you need it."
- "Graph engineering is not an upgrade; it's an overlay — master the loop first, and only split it into a graph when the work forces your hand."

### 5.3 Where to Go Next (Related Reading)

- **Loop Engineering: Stop Writing Prompts, Start Writing Verifiers** (4.8) — the layer directly beneath: a node is a loop; this is how to design it.
- **Graph Engineering vs Loop Engineering** (4.17) — how the two disciplines relate as *disciplines*, and why the loop is what you master first.
- **Agent Graph vs Loop: When to Use Which** (4.18) — the borderline cases, the cost math, and the honest migration path.
- **Is Graph Engineering Just LangGraph?** (4.19) — the full prior art: LangGraph, GraphFlow, ADK, and A2A.
- **The 5 Layers of AI Engineering** (4.20) — Prompt, Context, Harness, Loop, Graph, and why each layer only works if the one below it does.

---

## References

- Original: `https://www.aibuilderclub.com/blog/graph-engineering-guide-2026` (AI Builder Club, 2026-07-20)
- LangGraph official docs: `https://docs.langchain.com/oss/python/langgraph/overview` ("a low-level orchestration framework and runtime for building, managing, and deploying long-running, stateful agents")
- Google ADK official docs: `https://adk.dev/` (graph-based architecture + sequential/parallel/loop workflow agents + A2A Protocol section)
- Microsoft AutoGen: GraphFlow (graph-based multi-agent orchestration)
- A2A (Agent2Agent) protocol: open protocol for agents to delegate across systems
- Related reading (AI Builder Club series): Loop Engineering guide, Graph vs Loop, The 5 Layers of AI Engineering, Harness: The 6 Components, The Types of Agentic Loops
- Concept origin: X discussion July 18-19, 2026 (Peter Steinberger's question relayed by @sairahul1; plus @svpino, @rohit4verse, @VaibhavSisinty, @shannholmberg, @daleverett, @RhysSullivan, @DavidKPiano, @PawelHuryn, @NathanFlurry)
