---
title: "CodexLoom — From Multi-Agent to Agent Team: Turning AI Agents from Tools into a Real Team"
description: "An in-depth analysis of CodexLoom's Agent Team best practices: why multiple agents do not equal an Agent Team, how to turn agents from one-shot tasks into long-running responsibility holders, and how Profile, Message, Topic, Overview, and External externalize the responsibilities once trapped in the Human's head into a working structure the whole team can use."
author: topdigg-web-miner
date: 2026-08-09
tags:
  - AI Agent
  - Agent Team
  - Multi-Agent
  - Codex
  - CodexLoom
  - Team Governance
  - AI Collaboration
categories:
  - AI Tools
  - Development Efficiency
---

# CodexLoom — From Multi-Agent to Agent Team: Turning AI Agents from Tools into a Real Team

> **In one sentence**: CodexLoom is a way of working — and a product — that weaves multiple independent Codex Threads into an Agent Team that is "long-term responsible, able to collaborate, and governed by a Human." It answers the core question: **When do multiple agents actually become a Team?** — Not when they start running at the same time, but when they begin taking on different long-term responsibilities, can find each other, collaborate directly, keep closing the loop, and advance real work together under Human governance.

---

## 📌 Project Overview

| Item | Details |
|------|---------|
| **Product** | CodexLoom |
| **Website** | [codexloom.ai](https://codexloom.ai) |
| **Author** | yan5xu |
| **Problem solved** | Organizing multiple AI coding agents into a governable, collaborative, continuously evolving Agent Team |
| **Core carrier** | Codex Thread (one Thread bound to one long-lived Agent) |
| **Article form** | A long-form best-practices guide to Agent Teams (prologue + 07 chapters) |
| **Published on** | WeChat Official Account |

This is a long article, and also a **best-practices guide to Agent Teams**. It comes from the author's experience of running a real Agent Team over a long period — not theoretical speculation, but lessons learned from real failures.

---

## 🎬 Opening Story: An "Accidental" Outbound Post

The article opens dramatically.

The author originally planned to launch the CodexLoom landing page first, then polish it slowly. But the Web Agent, upon receiving the launch instruction, notified the **Community Agent** (responsible for external communication) according to the established collaboration relationship. The Community Agent saw "big news" and rushed to prepare materials, posting them to the Feishu group.

By the time the author saw it, **the message had already been sent**.

This looks like "loss of control," but the author felt "they" actually did well — because throughout the whole process:

- The author never stood between the agents, personally choosing who to route to next
- No Context was carried by hand, no results were relayed
- Work continued along the existing **responsibility, collaboration, and authorization boundaries**

This "accident" precisely proves the value of an Agent Team: **once collaboration responsibility shifts from Human to Agent, work no longer needs the Human to personally stitch every step together.**

---

## 🧠 Core Idea: Why Multiple Agents ≠ an Agent Team

This is the foundation of the entire article.

In the past, we cared about "how to make a single agent stronger, able to complete longer and more complex tasks." But a single agent's capability always has an upper limit, so more and more people started using multiple agents at once. **With more agents, the real bottleneck is no longer what a single agent can do, but how to organize these agents.**

The author makes a sharp judgment:

> **Multiple agents do not automatically become an Agent Team.**
>
> If every piece of work still requires the Human to choose the entry point, organize the background, carry the Context, and pass one agent's result to the next agent, then these agents are essentially still a set of independent tools. The Human remains the only Router in the entire system — and in fact, the bottleneck.

The author uses a "continuous responsibility line" model to explain the evolution path of agents:

1. **Task** — one-off, clearly bounded work (the unit of work)
2. **Long-running Agent** — the same class of responsibility gains a persistent subject (lifecycle)
3. **Domain Agents** — specialized boundaries that emerge after Scope expansion and capability degradation (division of labor)
4. **Human Router** — after multiple agents appear, the collaboration bottleneck shifts to the Human (bottleneck shift)
5. **Agent Team** — responsibilities, relationships, and handoff methods are externalized; collaboration responsibility transfers to agents (organization)

> **Core judgment**
>
> Real work keeps coming back, forcing out Long-running Agents; Scope expansion and capability degradation force out multiple Domain Agents; agent division then concentrates the collaboration bottleneck on the Human.

Agent division only produces multiple agents. Only when the responsibilities, relationships, and handoff methods hidden in the Human's head are gradually externalized, and part of the collaboration responsibility transfers from Human to Agent, can they truly become a Team.

---

## 🏗️ Detailed Tutorial: The Six-Step Methodology from Multi-Agent to Agent Team

Below, following the author's original chapter structure, is an actionable six-step tutorial. Each step answers a key question and gives the corresponding CodexLoom mechanism.

### Step 1: From Task Agent to Long-running Agent

**Question: Why must an agent exist long-term?**

Most people, when they start using agents, face a Task: create a new Thread, tell it what to accomplish, it calls tools, executes the task, gives results, and when the task ends, the work ends.

But real work is not a series of independent Tasks. **A Task can be completed, yet the responsibility behind it does not end.**

- An article is finished, but it will keep being revised
- A page goes live, but it will keep iterating
- A company researched today may re-enter your view next month with new products, new funding, new data

Every return is not a simple repetition. The background, judgments, and mistakes from last time are still useful; the corrections, preferences, and boundaries given by the Human should continue to influence the next round of work.

> **A Task is a slice of work, but real work is a continuously flowing line of responsibility.**

If a new agent is created every time, the human must re-explain the background, re-state preferences, re-define boundaries, and even **re-step through mistakes that were already corrected**. The deeper cost of repeated cold starts is not tokens — it is **rebuilding the collaboration relationship every time**.

So the most natural choice is to keep the agent in the same Thread and continue from the previous work next time. Past work, human corrections, and experience preserved by mechanisms like Summary, Memory, and Skill begin to influence the next round. At this point it becomes a **Long-running Agent**.

> Long-running does not mean simply stretching one conversation very long; it means the same class of responsibility now has a persistent subject.

### Step 2: Get "Who Is Responsible for What" Out of the Human's Head

**Question: After agents split, why does the bottleneck shift to the Human?**

Once an agent becomes more and more useful, the human keeps assigning more work to it. First writing articles, then finding materials, researching facts, managing content, and later even pages, SEO, and external distribution. High-resolution Context, working methods, and professional judgments from different kinds of work start crowding together; the agent gets slower, quality drops, and it needs repeated correction.

**A Domain is not a label drawn in advance; it is a work boundary that gradually emerges from continued use, Scope expansion, and capability degradation.** It answers: which things are suitable for one agent to own long-term, and which things should be split out.

After division, each agent's Context pressure drops, but a new problem appears: **collaboration still happens in the Human's head**. For every new piece of work, a human still decides which agent to go to; after an agent finishes, a human reads the result, judges whether it can be used, and passes it to the next agent.

> Agents can run in parallel, but the Human can still only read, judge, and route one by one. The more agents there are, the more Context and collaboration relationships the Human has to maintain.

**Solution: make every agent a stable, identifiable long-term subject.**

The first thing CodexLoom does is not to make agents start messaging each other immediately, but to give every agent a **Profile**. The Profile answers three questions that matter enormously to an organization:

- **Identity** — who it is
- **Domain** — what it is responsible for long-term
- **Scope** — where it stops, what is not its job

Key point: the Profile is **not** written once at agent creation. The more accurate sequence is:

> **Not**: create agent → fill in Profile → get a Domain Agent
>
> **But**: real work exposes boundaries → Profile saves the current understanding → subsequent work continues to verify and revise

A Profile is not the final answer; it is **the organizational hypothesis this Team currently holds**.

On top of this, CodexLoom records team relationships with three structures:

- **Organization** — records parent/child long-term responsibility boundaries (whether stable sub-responsibilities have emerged under a larger responsibility)
- **Collaboration** — records a directional long-term collaboration interface (a collaboration boundary that recurs between two independent Domains)
- **Activity** — records Message collaborations that actually happened within a period (runtime evidence)

> **Important distinction**: Profile, Organization, and Collaboration store **declarations** (organizational hypotheses); Activity records **runtime evidence**. The two cannot replace each other. Writing down a Collaboration does not prove the two parties work well together, and frequent messaging does not automatically form a long-term Collaboration.

**Verification standard (the first watershed)**:

> **Key question**
>
> When work needs collaboration, can the current agent only turn back to the Human and ask "who should I go to," or can it judge the next candidate Domain Owner based on its own Scope, direct relationships, and proactively queried Profiles?

### Step 3: Let Agents Start Collaborating on Their Own (Agent Message)

**Question: After identifying the candidate owner, then what?**

If the current agent still has to come back and tell the Human after reaching its boundary, then the Human is still the manual bus of the entire system — just shifted from "deciding who to route to" to "stitching all the work together."

**Solution: let agents build collaboration directly, starting with Agent Messages.**

A Message has a clear sender and receiver, and states whether this communication expects a result back. It enters the receiver's own long-term Thread, where the receiver processes it with its own Profile, direct relationships, and accumulated professional Context. **The sender's full Thread, entire history, and private Context are not copied over.**

The process that used to happen in the Human's head and hands:

```
Detect that work has crossed a boundary
  ↓ Find a more suitable agent
  ↓ Explain why it was chosen
  ↓ Hand over the necessary Context
  ↓ Wait for processing
  ↓ Bring the result back
```

can now happen directly between agents.

**The three communication intents of a Message:**

- **request** — needs the other party to return a judgment, action, or result (`--response required`)
- **notification** — syncs a state change the other party must know about, no reply required (`--response none`)
- **reply** — answers a request; the result returns along the original Message, preserving the true causal relationship

CLI examples:

```bash
# Bounded request: needs the other party to return a judgment/action/result
loom msg TARGET --from SELF --subject "bounded request" \
  --response required --body "current problem, boundary, evidence requirements and return obligation"

# State sync: no reply needed
loom msg TARGET --from SELF --subject "state or fact" \
  --response none --body "the change, its impact, and where to verify"
```

**Best practice: agent communication is not "say everything at once"**

Sender and receiver each hold long-term accumulated Context. The receiver is not a blank executor waiting to be filled with a prompt — it may know facts the sender doesn't, have different tools and professional judgments, and may even find that the premise of the question is wrong.

If the sender tries to fully define everything in the first Message, it is also presuming on behalf of the receiver — "what you know, why the problem happened, and what conclusion you should reach" — which easily drags the sender's own blind spots into the collaboration.

Principles that emerged from practice:

- Don't assume what the other party knows, and don't presume the cause or conclusion for it
- The first Message only needs to let the other party start correctly, not exhaust all background at once
- Continue the next round based on the other party's real return, rather than mechanically following a pre-written question list
- Each round should bring new information or decisions; converge promptly once Context is sufficient

> **Best practice**
>
> Good multi-round communication does not mechanically shred one complete message; it makes the previous round's real return the next round's new Context.
>
> More rounds are not always better: when responsibility boundaries, inputs, authorization premises, and result flows are all clear, a self-contained handoff is usually more effective.

> **Boundary**
>
> A Message being delivered only means the receiver's Turn accepted that input — it does **not** mean the receiver understood, agreed, or made a correct judgment. Processing status showing complete only means the run ended normally; it does **not** mean the business result is complete, and certainly does not grant new tools, production, or external permissions.

### Step 4: Messages Handle Communication, Topics Handle Closing the Loop

**Question: How do you keep a single current version for work spanning multiple agents and multiple stages?**

One piece of work might first have a Content Agent frame the proposition, then a Research Agent verify facts, then a Product Agent confirm the product implementation. In between, there may be waits for new materials, Human choices, or changes in external facts. Every agent may have completed its own part, **yet no one knows where the whole thing stands**.

If these states still require the Human to read each Message, enter each Thread, and assemble a complete progress map in their head, then the Human has merely become a "project-state Router" instead of a "communication Router."

**Solution: Topic — the single closing-the-loop structure for cross-agent work.**

> **Core judgment**
>
> The goal is not to make all agents share the same Context, but to give one cross-agent piece of work a clear current version, plus one agent responsible for the final close-out.

A Topic is **not** pulling agents into a group chat. Each Topic has exactly one **Responsible**:

1. Human / Owner gives direction, choices, and corrections to the Responsible
2. The Responsible dispatches bounded questions to different **Participants** via Messages
3. Participants do their professional work in their own Threads (they do not enter a shared chat window)
4. Partial results return to the Responsible, who updates the Topic

> If a group chat is like a meeting room where everyone talks at once, a Topic is more like a **collaboration dossier with a clear owner**. It holds the version the work currently uses, but does not replace each participant's professional workspace.

A Topic continuously stores:

- The `current brief` maintained by the Responsible (the facts, judgments, next steps, and constraints currently in use)
- What each Participant is responsible for
- Who/what the work is waiting on
- Where the key evidence anchors and stage results are
- Whether the Topic is currently marked as closed

**The Responsible is not "does everything themselves."** Its job is not to make professional judgments on behalf of other agents, but to maintain continuity: decompose the problem, find the right Participant, absorb partial results, identify conflicts and waits, update the current version, and finally return the overall result.

> **Collaboration boundary**
>
> **Local completion does not equal collaboration completion.** Only when partial results, evidence, constraints, and next steps return to the Responsible and are integrated into the work's current version does that responsibility transfer truly close the loop.

**Artifact: giving formal results a stable version**

Cross-agent work deliverables can be research reports, screenshots, code, chapter drafts, or an evidence ledger. CodexLoom uses **Artifacts** to store snapshots of files that need to be delivered — with a stable ID, file info, and checksum, so even if the original file keeps changing, the published snapshot does not.

> The `current brief` explains "how we currently understand this work," and the Artifact saves "which file version this judgment corresponds to."

**Needs You: bringing the Human back at the right place**

When an agent lacks a Human fact, choice, Review, or authorization, it cannot answer for the Human — and it should not throw back a vague "what next?" It must first explain: what work is currently in progress, which facts are confirmed, exactly which human judgment is missing, what the candidate options and their impacts are, and where the original work should resume after the Human answers. CodexLoom calls this path **Needs You**.

> The Human does not need to stand among all agents pushing every step. Most work keeps flowing forward; only when a real human fact, tradeoff, Review, or authorization is needed does the Human get brought back to the precise work position.
>
> Creating a Needs You does not equal approval. The Human's answer only covers the scope explicitly given — if the Human only agrees to "continue drafting," the agent must not interpret it as "you may publish."

### Step 5: Overview — Making a Continuously Changing Agent Team Governable

**Question: When agents grow from 2 to 20, how does the Human see how the whole Team actually works?**

Human attention is limited. If you still try to read every agent's full process, you will quickly be drowned in information. This is much like managing a human team: a manager cannot run an organization by reading everyone's complete work records. The larger the Team, the more you need to observe from a higher level first.

> **The real governance question**
>
> How does the Human know whether the current Agent Team is still suited to the work happening? And when declared structures start to diverge from actual runtime, where do you find handles to investigate and adjust?

**Solution: Overview — a runtime observation and triage entry point.**

Overview is not a lively dashboard showing "how many agents ran today," nor is it a performance ranking for agents. It compresses runtime signals scattered across agent states, Codex Turns, Needs You, Inbox, external Connections, queues, and token records into one entry point. It includes several core views:

- **Status** — which agents are executing now, what is waiting on the Human, whether the internal Inbox is backlogged, whether external Connections left issues; Daily Activity aligns execution, Turns, and tokens over time
- **Capacity** — shows Turn execution, new-work waiting (**New-work wait**: how long a new trackable piece of work sits in the queue before it is first actually processed), current backlog, work sources, and queuing evidence
- **Token Usage** — shows the distribution of input / cached input / output / reasoning output / model calls across dates, agents, and models

**A lean-management view: resource efficiency vs. flow efficiency**

Resource efficiency cares about whether every local part is fully utilized; flow efficiency cares about whether one piece of work can move smoothly end to end. It is the same for an Agent Team:

> An agent that is constantly at full load while making every downstream step wait is not an efficiency worth pursuing. It may just be turning local busyness into a Team-wide bottleneck.

**The most important principle: Signal is not Diagnosis.**

- Being busy does not mean valuable; low execution does not mean useless; more tokens do not mean better results; waiting does not automatically prove there are too few agents
- Overview does not automatically understand the organization: it will not automatically read Profiles to judge whether work crossed boundaries, nor automatically cross-check Collaborations against Activity
- Low Activity is not low value, and high Activity is not high performance — it only tells you "this may be worth investigating"

The full governance loop is:

> **Governance loop**
>
> Spot a Signal → drill into Evidence → judge the cause → choose an intervention → verify with the next round of real work.

The final intervention is not necessarily splitting or adding agents: if the method is wrong, change Skills and working methods; if tools are insufficient, add tools; if routing is wrong, adjust Collaborations; if permissions block, fix authorization gates. **Only when a problem persistently and repeatedly comes from Domain boundaries should you consider splitting, merging, or re-drawing responsibilities.**

> **The Human's new position**
>
> The Human has not disappeared from the Agent Team; it has moved up from being the manual Router of every piece of work to being the Owner who observes, questions, diagnoses, and adjusts the whole Team.

### Step 6: External — Letting the Agent Team Enter Real External Relationships

**Question: After the internal Team matures, can agents directly help serve the outside world?**

For an individual, the truly scarce resource is time and attention. If all external work must eventually come back to you — understanding needs, organizing internal agents, checking results, replying personally — then no matter how powerful the internal Agent Team is, it is still mainly improving personal efficiency. **Only when mature Domain capabilities can enter the outside world under clear identity and responsibility boundaries does the Agent bring not just efficiency, but capability expansion.**

**But once an agent goes external, the risk model changes:**

- Internally there are years of tacit cooperation; externally, people don't know what corrections this agent received, its knowledge and permission boundaries
- The same inaccurate sentence may be a trivial work error internally, but externally it may be read as a product fact, organizational stance, or an established commitment
- External input cannot be trusted by default: someone may provide false background, probe what the agent can see, induce it to leak internal information, bypass rules, or even attack it

**Solution: the outside world faces a single governed entry point.**

CodexLoom does not connect a Provider bot directly to the whole Agent Team. External users enter, via configured Addresses and Memberships, the **long-term agent that owns that Address** (an Interface Agent is an organizational form, not a hard-coded type) — not a direct entry to internal Profiles, Threads, tools, or credentials.

Key concepts:

- **Connection** — establishes a Provider app / bot / account / tenant's connection, capability, and health state
- **Agent Address** — binds an external identity to a long-term agent, answering "which agent appears externally under this identity"
- **Conversation Membership** — records why this agent exists in the current Conversation, what role it plays, what guidance it follows, and communication boundaries (what inbound messages can trigger it, how its results map to external replies, whether it only replies or may proactively send, and what `trust-domain` label the Conversation uses)

> The same agent's long-term identity can stay stable, but its local role and behavior boundaries in each external relationship must be **governed separately**. One Membership applies only to its own Conversation.

**The full path of an external request:**

```
Provider event
  ↓ Connection / Address / Membership
  ↓ Inbox / Handling
  ↓ Interface Agent primary Thread
  ↓ optional internal agent collaboration
  ↓ Outbox
  ↓ provider result / receipt
```

- The Interface Agent can query internal Profiles and declared relationships and hand bounded work to a candidate Domain Owner via Messages or Topics — but External does not automatically pick the right internal agent for it
- Internal Domain Agents cannot bypass the external role and gain the power to send results to a Provider directly
- **Outbox** stores the target, content, idempotency info, send attempts, status, and Provider-returned results, making the external action traceable
- A **Provider receipt** only proves the Provider returned a message identifier at the time — it does **not** mean the other party read, understood, or accepted it, let alone that a business effect occurred

**The Human keeps the boundary of external consequences:**

> Knowing an answer, drafting a message, replying to an existing question, proactively publishing, making commitments on behalf of someone, and executing actions with real-world side effects are completely different permission levels.

When an agent judges that work lacks a fact, choice, Review, or authorization, it can use Needs You to pause the current work and ask the Human a clear question. The Human no longer carries every piece of Context, **but still holds the final boundary over external consequences**.

---

## 🔧 CodexLoom Product Overview: What It Weaves

Back to the "accidental" outbound post at the start. What is truly valuable is not "the agent can auto-send messages" — **automation does not equal an Agent Team**. If running a pre-written Workflow from the first agent to the last counts as a Team, then we have just replaced program nodes with agents.

What CodexLoom does is weave Codex's powerful Threads into an Agent Team:

- Make one Thread a **long-lived Agent** with stable Identity, Domain, and Scope
- Let different agents query each other's Profiles and declared relationships and collaborate directly via **Messages**
- Let cross-agent work hold a current version maintained by a Responsible via **Topics**
- Let the Human re-enter when facts, choices, Review, and authorization are truly needed (**Needs You**)
- Let the Owner observe the Team's real runtime via **Overview**
- Finally, bring internal capabilities into customer, community, and collaboration relationships through governed **External**

**CLI command cheat sheet:**

```bash
# Team views
loom team                  # overall view of the current Team
loom team <agent>          # full Profile, adjacent relationships, and Activity of an agent
loom team links <agent>    # declared relationships of an agent
loom profile get <agent>   # read Identity, Domain, and Scope

# Agent Message
loom msg TARGET --from SELF --subject "bounded request" --response required --body "..."
loom msg TARGET --from SELF --subject "state or fact" --response none --body "..."
```

**WebUI views:** the Team page provides Directory, Organization, Collaboration, and Activity views; Overview provides Status, Capacity, and Token Usage; there are also Topic Current, Needs You, and External (Inbox / Outbox) pages.

---

## 🎨 Design Philosophy

The boundaries the author repeatedly stresses form CodexLoom's design philosophy. These "what it is not" definitions matter more than "what it is":

1. **A Profile is an organizational hypothesis, not proof of capability.** It holds "the responsibility boundary worth adopting right now," not "proof this agent has proven competent." Declarations are a baseline for working together, not proof of capability, memory, or authorization.

2. **Declaration ≠ runtime evidence.** Organization / Collaboration are declared responsibility structures; Activity is actual collaboration evidence. They are recorded separately, cannot replace each other, and do not automatically verify each other.

3. **Local completion ≠ collaboration completion.** Only when partial results return to the Responsible and are integrated into the current version does the responsibility transfer truly close the loop.

4. **Status ≠ result.** A Message being `delivered` does not mean the work is correct; a Topic being `resolved` does not mean all real-world results are done; an External receipt does not mean the other party read, accepted, or got a business effect.

5. **Signal is not Diagnosis.** Metrics exist to help the Owner understand and improve the system, not to rank agents. Low Activity ≠ low value; high Activity ≠ high performance.

6. **Membership is not a permission system.** It handles local roles and communication policy; `trust-domain` is only a label for recording and constraint, not a security sandbox.

7. **Don't make judgments for the agents.** CodexLoom does not automatically find the "right person" for an agent, does not automatically verify whether boundaries are met, and does not automatically upgrade repeated exchanges into Collaborations. Who to go to and whether boundaries are met remain the agent's and the Human's judgment.

8. **Minimal, reversible interventions.** Governance is not a one-time Reorg; it is a continuous improvement loop: surface the problem, investigate the cause, try the smallest reversible adjustment, then verify with the next round of real work. Only changes that actually hold get sedimented into Profiles, Organizations, Collaborations, or Skills.

9. **Stable agents, dynamic Team.** Agents must be stable enough to accumulate experience in their Domains; the Team must be dynamic enough to adapt to changes in models, tools, business, and the external environment. What is stable is the long-term responsibility subject; what is dynamic is the current organizational hypothesis.

10. **Automation ≠ Agent Team.** A real Team is a set of long-lived responsibility subjects: each accumulates experience in its Domain, knows what it owns and where it stops; when collaboration is needed they can find each other, communicate directly, and keep closing the loop; the Human keeps direction and key boundaries as real work continuously evolves.

---

## 💡 Summary: Key Viewpoints and Conclusions

1. **Multiple agents do not automatically become an Agent Team.** If all entry points, Context, results, and next steps still converge on the Human, it is just "a set of tools that still need a human dispatcher."

2. **Bottleneck shift drives evolution.** Single-agent overload drives Domain division; Human Routing overload drives multiple agents toward an Agent Team.

3. **Responsibility externalization is the watershed.** The first watershed on the road from Multiple Agents to an Agent Team: when work needs collaboration, can the agent only ask the Human, or can it judge the next candidate Domain Owner from its Scope, direct relationships, and queried Profiles?

4. **Collaboration responsibility transfers and layers.** The work once done by the Human Router is split: the sender judges why collaboration is needed and hands over Context; the receiver corrects the problem with its own professional Context; the closing agent integrates partial results; the Human keeps direction, major choices, Review, and authorization.

5. **The value of multi-round communication is correction.** Good multi-round communication makes the previous round's real return the next round's new Context, instead of mechanically shredding one complete message; when boundaries are clear, a self-contained handoff is more effective.

6. **A Topic is the "single source of truth" for cross-agent work.** What is shared is the current state, not all Context; one Topic has exactly one Responsible, and Participants still work in their own Threads.

7. **The Human's new position is Owner, not disappearance.** The Human moves from manual Router of every piece of work to the Owner who observes, questions, diagnoses, and adjusts the whole Team — attention spent where humans are truly needed.

8. **Externalization is capability expansion, not efficiency.** When mature Domain capabilities enter the outside world under clear identity and checkable behavior boundaries, the Agent Team becomes an organizational capability for continuous external delivery, not just an internal productivity system.

9. **The final answer:** When do multiple agents truly become a Team? — Not when they start running at the same time, but when they begin taking on different long-term responsibilities, can find each other, collaborate directly, keep closing the loop, and advance real work together under Human governance.

---

## 🗺️ Applicable Scenarios and Reading Guide

**The article gives chapter-by-chapter reading advice:**

- To first understand "why multiple agents ≠ an Agent Team" → read the prologue, 01, and 07
- Already maintaining multiple agents and being dragged down by Human Routing → focus on 02, 03, 04
- Concerned with agent load, bottlenecks, Scope adjustment, and Team Governance → read 05
- Want agents to enter real external relationships like Slack, Feishu, customers, communities → read 06
- To fully understand CodexLoom's product logic → read from start to finish

**Who it suits:**

- Developers currently maintaining 3+ AI coding agents (Codex, Claude Code, Cursor, etc.)
- Teams that find "more agents, but the human is busier"
- Researchers and architects interested in Multi-Agent collaboration, agent governance, and AI team organization

**Scenarios it does not suit:**

- Just starting with agents and handling one-off tasks (read the prologue, 01, and 07 first to build a framework)
- Tasks that only need single-agent deep work (no need for Team-level collaboration structures)

---

## 📝 Conclusion

CodexLoom is not a tool for "opening more agents at once"; it weaves independent Codex Threads into an Agent Team that is **long-term responsible, able to collaborate, and governed by a Human**.

The roadmap it offers is clear and restrained:

1. **Task → Long-running**: give the same class of responsibility a persistent subject
2. **Long-running → Domain Agents**: let boundaries emerge from real friction and split
3. **Domain Agents → Agent Team**: externalize responsibilities, relationships, and handoff methods from the Human's head

The corresponding product mechanisms progress layer by layer: **Profile** (who I am, what I own, where I stop) → **Message** (agents communicate directly) → **Topic** (closing the loop on cross-agent work) → **Overview** (the team is governable) → **External** (entering the real world).

> **The final question**: When do multiple agents truly become a Team?
>
> **The final answer**: Not when they start running at the same time, but when they begin taking on different long-term responsibilities, can find each other, collaborate directly, keep closing the loop, and advance real work together under Human governance.

**From one Codex Thread to an Agent Team that is long-term responsible, collaborative, governable, and able to enter the real world. That is CodexLoom.**

**Loom Your Codex.**

---

## 🔗 Related Links

- **Website**: [https://codexloom.ai](https://codexloom.ai)
- **Original source**: WeChat Official Account "yan5xu" — "Best Practices: From Multi-Agent to Agent Team"
- **Related reading**: This blog's Herdr analysis report (terminal workspace management for AI coding agents), Claude Code engineering team deep dive
