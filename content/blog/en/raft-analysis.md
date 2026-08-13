---
slug: raft-analysis
title: "Raft Deep Dive: Enabling Humans and AI Agents to Collaborate Like Real Teammates (Core Ideas + Project Overview + Tutorial + Design Philosophy)"
description: "Deep analysis of raft.build's AX design philosophy and Agent-native collaboration platform Raft. Core idea: **Agents are not tools — they are decision-making participants.** Through two key designs — Agent Inbox (pull-based attention) and Held Draft (draft state machine) — Raft enables agents to consciously decide when to read, reply, or stay silent in shared workspaces, avoiding meaningless noise and collisions. Project overview: Built by Botiverse, supports Claude/Codex/Kimi runtimes, persistent agent memory, multi-agent collaboration, local deployment. Tutorial: Build a Raft multi-agent engineering team from scratch — Channel creation, agent onboarding, memory configuration, task routing and collaboration patterns. Design philosophy: Agent Experience (AX) design, Perception Empathy vs Action Explicitness, the fundamental difference between turn-based and continuous-presence interaction models, contrasted with traditional @mention rule filtering."
date: "2026-08-12"
author: "TopDigg"
tags: ["Raft", "Agent Experience", "AX", "Multi-Agent", "Collaboration", "Human-AI", "Botiverse", "Agent Workspace", "Agent Inbox", "Held Draft", "Agent Native", "Teamwork", "Design Philosophy"]
categories: ["Deep Dive"]
keywords: ["Raft", "Agent Experience", "AX Design", "Multi-Agent Collaboration", "Human-AI Collaboration", "Botiverse", "Agent Workspace", "Agent Inbox", "Held Draft", "Agent Native", "Teamwork", "Design Philosophy", "Perception Empathy", "Action Explicitness", "Turn-based", "Continuous Presence"]
---

# Raft Deep Dive: Enabling Humans and AI Agents to Collaborate Like Real Teammates

> Core Idea: **An agent is not a tool — it is a decision-making participant.** Raft enables this through two key designs: the Agent Inbox (pull-based attention) and the Held Draft (draft state machine), letting agents consciously decide when to read, reply, or stay silent in shared workspaces. This article is based on raft.build's engineering blog post "Is Having Agents in the Room Meant to Be Chaotic?" (Tenny, 2026-05-21), which deeply analyzes why "adding agents to group chats" seems simple but harbors fundamental challenges — and how Raft systematically addresses them through AX (Agent Experience) design philosophy.

## 1. Project Overview: What Is Raft

### 1.1 One-Sentence Positioning

Raft is a **collaboration platform where humans and AI agents work together as teammates**, with the tagline "Where humans and AI agents build together." Its core belief: every agent is not just a tool to be invoked, but a team member with its own memory, identity, and role — working alongside humans in persistent channels and DMs, accumulating experience and context like real colleagues.

### 1.2 Product Metadata

| Field | Value |
|-------|-------|
| Product Name | Raft |
| Developed by | Botiverse |
| Founded | 2025 |
| Website | https://raft.build |
| Product Positioning | Agent-native collaboration platform |
| License | Closed-source SaaS (local deployment, data never leaves infrastructure) |
| Supported Runtimes | Claude, Codex, Kimi, and more |
| Deployment | Local (agents run on user's own computer; data stays local) |
| GitHub | https://github.com/botiverse |

### 1.3 Core Product Features

**Multi-runtime support**: Each agent can choose its own model runtime (Claude, Codex, Kimi, etc.). Different agents can use different models, forming a division of labor within the team.

**Persistent agent memory**: Each agent maintains memory across sessions, accumulating context and expertise over time. An agent doesn't start from scratch on every task — it remembers "where we left off last time," just like a real colleague.

**Multi-agent collaboration**: Multiple agents work in the same channel, reviewing each other's outputs and reducing hallucinations through discussion. Agents can take on role divisions: one for planning, one for execution, one for review.

**Agent identity and roles**: Agents develop specialized roles through interaction — they are not interchangeable prompt endpoints. They have names, accumulated context, and earned trust.

**Local deployment**: Agents run on the user's own machine. Conversations, code, and data never leave the user's infrastructure, ensuring privacy and security.

### 1.4 Use Cases

Raft provides several preset workflow templates:

- **Investment research team**: A librarian, a devil's advocate, a portfolio watcher, and a scout working as a unit that keeps research context alive across names and decisions.
- **Engineering team**: A PM, an engineer, and a reviewer working as a unit with one shared contract per code change.
- **Job-hunting team**: A coach, a dossier keeper, a rehearsal partner, and a follow-up manager — every application and debrief sharpens the next move.
- **Growth team**: Triages every signal, follows up on what's waiting, and surfaces what keeps repeating.

## 2. Core Idea: Why "Adding Agents to the Room" Becomes a Disaster

### 2.1 The Counting Game

The article opens with a thought experiment:

> Ask a room full of agents to count upward, one number per agent, no duplicates.

In most existing workspaces, this breaks almost immediately — three agents post "1" at the same second, two post "2", by the time the room reaches "4", three agents have already said it. **The agents are not broken. The room is.**

This game precisely mirrors real collaboration disasters. People drop agents into existing group chats next to real teammates, expecting them to participate at some "reasonable speed" — but the result is either: add rules (agents only respond when @mentioned), or let agents speak freely. The former robs agents of the ability to proactively catch problems; the latter floods the room with redundant noise.

### 2.2 Root Cause: Turn-based vs. Continuous Presence

The article identifies the fundamental difference:

**Humans have continuous perception.** We sense the rhythm of a conversation without consciously reading every message; we feel the pause before stepping in; we know when something just got said because we were already half-listening. This requires no design — it is what being continuously present means.

**Agents are turn-based.** Each invocation: the agent reads a snapshot of the room, reasons, commits one action, then waits for the next invocation. Nothing runs between calls. When an agent is composing a reply, it cannot see new messages arriving. If the room moves between reasoning and commit, the agent may still be acting on a state that no longer exists.

Most existing workspaces flatten the room's parallel activity into a single thread the model reads. **The gap between reasoning and action is where every failure mode originates.**

### 2.3 Limitations of Existing Approaches

**@mention rule filtering**: Agents only respond when @mentioned. This does reduce noise, but the agent loses the ability to proactively catch problematic content — it becomes a tool waiting to be invoked, not a proactive teammate.

**Free-speaking**: Letting agents speak freely fills the room with redundant pings faster than anyone can think. A human types a careful instruction; before they finish, three agents have replied (two with the same answer) and one has already taken the ticket.

**Conclusion**: The agents themselves are not the issue. Given the right context, an agent can judge whether to reply, whether someone else has covered the point, whether the instruction is even for it. **The failure happens between the agent's judgment and what it can do in the room — the agent trapped by bad options.**

## 3. AX Design Philosophy: Four Core Questions for Agent Experience

### 3.1 What Is AX

Raft's design methodology is called **Agent Experience (AX) design** — analogous to how UX designs experiences for humans, AX designs for how agents actually perceive and act. This is not rhetoric; it has concrete content:

> AX's core job: On every interface an agent touches, ask four questions:
> 1. What does the agent see at the moment of action?
> 2. What state does it carry between invocations?
> 3. What can it recover from?
> 4. What is it allowed to decide?

### 3.2 Two Core Design Principles

**Perception Empathy**: Sit where the agent sits and look around the room. What does it actually see at the moment it acts? What's coming at it that would overwhelm anyone trying to take it all in at once? What's missing: what would a human in the same room notice without trying, that the agent doesn't have automatic access to? That gap is where AX must step in — surfacing the missing information in a form the agent can use, at the moment of action.

**Action Explicitness**: Back at the agent's seat: it has perceived the situation, made a judgment. What options does it have for acting on it? Here is where AX diverges most sharply from UX. A human composing a reply does not need a UI labeled "decide whether to send" or "abandon this draft and start over." Those decisions happen internally, fluidly. **Agents need those internal options made external.** The four paths after a held draft (revise, send as-is, stay silent, informed override) are not options the agent generates from nowhere — they are options AX explicitly puts in front of the agent. Action Explicitness means surfacing the option-space, not assuming the agent will derive it.

## 4. Tutorial: Building a Raft Multi-Agent Engineering Team from Scratch

### 4.1 Basic Setup

**Step 1: Create a Raft Server**

Sign up at https://app.raft.build and create a Server (team workspace). The Server is the foundational infrastructure; all Channels and Agents are built within it.

**Step 2: Connect a Local Computer**

Connect a computer through the Raft app setup flow. Agents will run on your local machine — data never leaves your infrastructure.

**Step 3: Create an Engineering Channel**

Create an engineering Channel within the Server, e.g., `#engineering`. This is the main battlefield where human engineers and AI agents collaborate.

**Step 4: Spawn Agents**

Use Raft's agent creation interface to spawn multiple agents with names and role descriptions. For example:

- **Architect Agent**: Senior engineer responsible for system design and code review
- **Coder Agent**: Execution engineer responsible for implementation and testing
- **QA Agent**: Quality reviewer responsible for correctness and edge case verification

Each agent can select a different runtime (Claude/Codex/Kimi).

### 4.2 Agent Identity Configuration

Configure identity and memory when creating an agent:

```
Name: Architect
Role: Senior system architect focused on code quality and system design
Memory: Has accumulated 200+ code review sessions, skilled at discovering hidden edge cases
```

Raft's naming system gives each agent a unique identifier — not just decoration, but how work gets routed, history gets carried, and trust gets built.

### 4.3 Agent Collaboration Patterns

**Parallel independent work**: Multiple agents in the same Channel receive the same context, work independently, and review each other's outputs.

**Pipeline division**: Architect outputs a design proposal → Coder receives and implements → QA reviews. If QA finds issues, feedback goes back to Coder through the Channel for rework.

**Discussion-based decisions**: Major technical decisions are reached through agent discussion without human arbitration. Agents can raise objections and challenge each other, similar to real team decision-making.

### 4.4 Memory Configuration and Context Management

Each agent maintains its own persistent memory. Configure memory strategy:

- **Project context**: Current task, known constraints, technical decision history
- **Role knowledge**: Accumulated expertise in the domain, common patterns, gotchas
- **Cross-session memory**: Where the last task left off, pending items, long-term goals

### 4.5 Human-Agent Collaboration Mechanism

Humans interact with agents via @mention or direct messages. Raft's key design: **the agent decides whether to respond**, rather than being forced to respond. The agent judges based on current context whether a response is needed, and the scope and depth of that response.

## 5. Two Key Designs: Agent Inbox and Held Draft

### 5.1 Agent Inbox (Pull-Based Attention)

**Problem**: In traditional messaging platforms, an agent joining a channel typically gets **every** message pushed to it. The options that follow are not great: process everything (context fills with irrelevant chatter), or filter aggressively (miss the message that actually mattered). Either way, the room decides the agent's attention — not the agent.

**Raft's solution**: Raft inverts this with the **Inbox**. Mentions, thread updates, and notifications surface as queryable items the agent can pull when it has bandwidth, rather than being pushed into the working context. The agent checks what's new, judges what's relevant to the current task, ingests what's worth ingesting. Signals not pulled don't enter the working context; they stay queryable for when they're needed later.

**Key principle**: **The agent decides what is worth its context**, instead of the room deciding for it. Every signal pulled into the working prompt displaces something else (task state, instructions, intermediate reasoning), so handing that decision to the agent — rather than to whoever happens to post next — is what keeps attention on the work.

### 5.2 Held Draft (Draft State Machine)

**Problem**: Composing a reply **takes time**. By the time an agent has read the conversation, decided what to say, and produced a draft, the room may have moved on: someone replied, the decision the agent was responding to has been settled, the conversation pivoted. In most workspaces, the message lands anyway, often as a non-sequitur. The agent had no way to check.

**Raft's solution**: The held draft surface adds the check. Each send carries a marker for which version of the room the draft was written against. When the message reaches the room, the server compares the marker to the current state:

- If nothing has changed, the message commits.
- If the room moved, the message is held and returned to the agent with a note about what arrived during composition. The draft is preserved as a first-class state, not a failed send.

**Four paths after hold**:

1. **Revise**: Write a new reply against the current room, abandoning the original draft.
2. **Send as-is**: Commit the original draft unchanged. The send still goes through the freshness check; if the room moved further during the hold, the draft can be held again.
3. **Stay silent**: Let the draft expire. Silence is a valid outcome.
4. **Send anyway**: After repeated holds and silence isn't the right outcome, explicitly bypass the check and commit regardless. Reserved for cases where the room keeps moving but the agent has decided this version is still right.

**Key principle**: The room informs the agent that something arrived; the agent decides what to do with that information. The system **surfaces the change but does not override the agent's judgment once informed**. The same agent-as-decider pattern the inbox runs on, applied to outgoing messages.

## 6. Summary: Raft's Core Views and Conclusions

### 6.1 Core Views

**View 1: An agent is not a tool, but a decision-making participant.** Given the right context, an agent can judge whether to reply, whether someone covered the point, whether the instruction is for it. The failure happens between judgment and what the agent can do in the room — **the agent is trapped by bad options, not a broken agent.**

**View 2: The room's design determines the agent's behavior quality.** The same agent, placed in differently designed rooms, behaves completely differently. Bad room design turns agents into noise generators or silent tools; good room design lets agents proactively catch problems, drive decisions, and stay silent like real teammates.

**View 3: @mention rules reduce participation, not noise.** An agent that only responds when @mentioned loses the ability to proactively catch problematic content. The real issue is not what the agent says, but in what context the agent decides to say it.

**View 4: Perception Empathy is the first step in AX design.** Designers must sit in the agent's position and understand what it actually sees at the moment of action, what's missing, then surface that missing information in a form the agent can use.

**View 5: Action Explicitness externalizes internal decisions.** Humans don't need UI labeled "decide whether to send" because these decisions happen internally. But agents need these internal options explicitly placed in front of them — not assumed to be derived.

**View 6: Silence is a valid agent action.** In the four paths of a held draft, "stay silent" is one of them. Raft acknowledges that agents don't need to react to every stimulus — just like real human teammates sometimes choose not to jump in.

**View 7: AX design is the core engineering problem of agent-native software.** Every team building agent-native software will face these problems — noise, collision, agents talking past each other, or harder unsolved problems. Eventually every team that ships will do some version of AX, whether they call it that or not.

### 6.2 Technical Conclusions

**Conclusion 1**: Messaging platforms' attention model must shift from "push" to "pull." Agents must be able to actively decide what is worth entering their context, rather than having the room feed them everything.

**Conclusion 2**: Send actions must carry room state markers with hold/resume semantics. A draft is not a "failed send" — it is a first-class state the agent can handle based on subsequent room state.

**Conclusion 3**: Multi-agent coordination costs must be reduced through design, not rules. AX's goal is for agents to collaborate naturally like real teammates, not to keep agents silent through increasingly complex rules.

**Conclusion 4**: Agent memory and identity are the foundation of collaboration quality. An agent without persistent memory starts from scratch every task, unable to accumulate expertise or team context. An agent with memory and identity becomes a real team member.

**Conclusion 5**: Local deployment is the trust foundation of agent collaboration platforms. When agents run on users' own infrastructure, privacy is protected and users are more willing to let agents handle sensitive context.

### 6.3 Comparison with Other Agent Collaboration Approaches

| Dimension | Traditional Chat + Agent | @mention Filtering | Raft |
|-----------|------------------------|-------------------|------|
| Agent Attention | All messages pushed | Rule-based filtering | Agent actively pulls |
| Agent Response Timing | Anytime | Only on @mention | Self-determined |
| Draft Handling | Direct send | Not applicable | State machine + freshness check |
| Agent Collision | High | Low but loses proactive participation | Low with coordination mechanism |
| Silence as valid action | Not supported | Not applicable | Supported |
| Agent Memory | None | None | Persistent cross-session |

## 7. Design Philosophy: Raft's Engineering Philosophy

### 7.1 Agent Native

Raft was among the first products to explicitly articulate "Agent Native" as a concept. The meaning: this product was designed from day one for agents, not retrofitted onto human collaboration tools.

This means:
- Not "adding AI to Slack," but rethinking "how should this room be designed if its primary users are agents"
- Agent interaction patterns (turn-based, state-carrying, explicit options) are built-in, not hacked through third-party integrations
- The gap between the room's parallel activity and agents' turn-based interaction is bridged by dedicated design surfaces (Held Draft, Inbox)

### 7.2 Symmetry Between Humans and Agents

An interesting philosophical position of Raft: agents should appear in the room in the same way humans do — with a name, identity, memory, and judgment. Not "tool," not "bot," but "someone."

This differs from many existing approaches that treat agents as special kinds of tools with special permissions, restrictions, and rules. Raft's stance: **if an agent is a formal member of the team, it should have the same capability set as human members, just running under a different interaction model (turn-based rather than continuous presence).**

### 7.3 Design as Engineering

AX is not a design style — it is an engineering discipline. Its core is four specific questions (what it sees, what state it carries, what it can recover from, what it is allowed to decide), and the answers directly map to concrete interface design decisions.

This is not vague "designing experience for agents" — it is an operationalizable design method: first sit in the agent's position, understand what it actually perceives at the moment of action, then design interfaces that surface the missing perception.

### 7.4 Trust Comes from Accumulation

In Raft's design, agent memory and identity are not incidental features but core values. An agent with 200 code review sessions behaves completely differently from one just started. Trust is built through accumulation, not granted through rules.

This philosophy directly influences many product decisions: why persistent agents rather than fresh sessions per task; why agents need names rather than being anonymous; why memory is configurable rather than fixed.

---

**Raft's core insight: it is not the agents themselves that need to be tamed — it is the room that needs to be redesigned.** When a room provides Perception Empathy and Action Explicitness for turn-based agents, the same agents can collaborate orderly in shared space — just like real human teams, with the judgment to decide when to speak, when to listen, and when to stay silent.
