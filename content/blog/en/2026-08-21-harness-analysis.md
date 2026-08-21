---
title: "Deep Dive into Harness: AI Agent's Climbing Rope - From Climbing Metaphor to Open Source Autonomy"
date: "2026-08-21"
description: "A deep dive into Earendil's blog post What is a Harness (featuring the open source Pi project): using the climbing harness as a metaphor, systematically explaining the four core components of Agent Harness - System Prompt, Tools, Agentic Loop, and Translation Layer - while exploring its open source philosophy and the proposition of user autonomy. Core idea: Agent equals Model plus Harness. Users should own and control their own Agent workspace, rather than being locked into AI labs applications. Design philosophy: tool agnosticism, user sovereignty, open source, human in the loop."
tags:
  - Harness
  - AI Agent
  - Pi
  - OpenClaw
  - Agentic Loop
  - System Prompt
  - Translation Layer
  - Open Source
  - User Sovereignty
  - Earendil
  - Lefos
  - Design Philosophy
categories:
  - Deep Dive
  - AI Agent
  - Open Source Philosophy
---

# Deep Dive into Harness: AI Agent's "Climbing Rope" — From Climbing Metaphor to Open Source Autonomy

> Core idea: **"Agent = Model + Harness"** — The AI model is the engine; the Harness is the shell that allows the engine to run safely and serve you. The Harness is not a subordinate to the model, but the layer that users should truly own and control. It determines how AI behaves, what tools it uses, at what pace it works — and most importantly, whether the user retains ultimate control.

## Introduction: The Misunderstood "Harness"

If you've been immersed in the AI news feed for any length of time, you've probably heard the word "Agent" countless times. But "Agent Harness"?

Most people's first reaction is probably: just another industry buzzword.

The Earendil team wrote an unusually clear article, [What is a Harness?](https://earendil.com/posts/what-is-a-harness/), with the explicit purpose of demystifying this concept. Their approach is clever — **starting from the climbing harness**. This metaphor is not only easy to understand but also precise: because the core logic of a harness — "connecting, protecting, enabling you to do more dangerous things" — is exactly what an Agent Harness does in the AI world.

This article systematically analyzes Earendil's original article, explaining what an Agent Harness is, how it works, why it matters, and how the open source community is turning it into a tool for users to combat the concentration of power in AI labs.

## 1. Background: Who Wrote This Article

Earendil is an AI infrastructure team with several open source projects related to Agents and Harnesses:

- **Pi** (`pi.dev`): A minimalist open source Agent Harness for individual users, running entirely on a local laptop
- **Lefos**: An Agent Harness for email scenarios, with Email as the core interaction medium
- **OpenClaw**: Another popular open source Agent Harness supporting multiple interfaces including iMessage and Email

This article serves as a philosophical exposition of the Pi product by the Earendil team, while also functioning as a general-purpose AI Agent explainer — it assumes the reader knows nothing about Agent Harnesses, explaining the concept in the most straightforward language possible.

## 2. Core Metaphor: The Climbing Harness

### 2.1 The Harness in the Physical World

Cambridge Dictionary defines Harness as:

> **Noun.** a piece of equipment with straps and belts, used to control or hold in place a person, animal, or object
> **Verb.** to control something, usually in order to use its power

When we talk about a climbing harness, its actual functions are:

1. **Support and Protection** — By connecting to carabiners and ropes, it protects climbers from falling, moderates descent speed, and governs climbing route
2. **Tool Attachment** — Chalk bags, nut tools, and quickdraws can all be attached to the harness
3. **Portability** — When switching mountains or climbing styles, the harness itself can come along; you only need to adjust what gear hangs from it
4. **Customizability** — Acrobats and arborists use different harnesses; the same harness can be configured for entirely different purposes

### 2.2 From the Physical World to the AI World

Earendil points out the structural and functional correspondence between the two types of Harnesses:

| Climbing Harness | Agent Harness |
|------------------|----------------|
| Connects body to ropes | Connects AI model to tools and environment |
| Protects climber from falls | Protects users from AI's bad decisions |
| Carries chalk bags and tools | Carries tool sets (search, code, email, etc.) |
| Portable and customizable | Cross-model, cross-task, customizable |
| Determines climbing pace and route | Determines Agent behavior pace and execution path |

The core insight of this metaphor: **The harness is not the climber, but it is the prerequisite that allows the climber to safely explore higher ground.** Similarly, the Harness is not the AI model itself, but it is the prerequisite that allows the AI model to reliably serve the user.

## 3. What Is an Agent Harness (Core Definition)

### 3.1 Basic Definition

> **An Agent Harness is a piece of software that provides an environment for an AI model to operate within.**

Unlike most AI models (where you can't really "own" an AI model), **you can own your own Agent Harness**. This is the most fundamental characteristic that distinguishes a Harness from the model itself.

Users interact with Harnesses in various ways:
- Software engineers can use Pi directly in the terminal
- OpenClaw can interact with users through iMessage, chat apps, or Email
- Lefos runs primarily through Email

Regardless of the interface, Harnesses generally do four things:

```
┌─────────────────────────────────────────────────────┐
│                  Agent Harness                      │
│                                                     │
│  ┌─────────────┐  ┌─────────────┐                   │
│  │ System      │  │   Tools     │                   │
│  │ Prompt      │  │             │                   │
│  └─────────────┘  └─────────────┘                   │
│                                                     │
│  ┌─────────────┐  ┌─────────────┐                   │
│  │ Agentic     │  │ Translation │                   │
│  │ Loop        │  │ Layer       │                   │
│  └─────────────┘  └─────────────┘                   │
└─────────────────────────────────────────────────────┘
```

## 4. The Four Core Components in Detail

### 4.1 System Prompt

**Analogy**: The operations manual a new employee receives on their first day.

Most AI models come with an embedded set of rules and guidelines refined during the training process — the most famous example being Claude Opus 4.5's widely publicized "[Soul Document](https://gist.github.com/Richard-Weiss/efe157692991535403bd7e7fb20b6695)", which explained to the AI model what it was and how it should act.

The System Prompt in an Agent Harness is similar, but with two key differences:

1. **It is not internal to the model** — it is an external instruction injected into every conversation
2. **It is more like an operations manual than instinct** — the model knows it should follow these instructions, but they are not something the model "naturally knows"

The role of the System Prompt is to **ensure the AI model behaves appropriately within the context of a specific Harness**. Different Harnesses can use completely different System Prompts to make the same model exhibit vastly different "personalities" and capability focuses.

**Examples**: OpenClaw's System Prompt might be "You are a friendly, helpful home assistant"; Pi's System Prompt is more minimalist — a clean canvas for users to shape themselves.

### 4.2 Tools

**Definition**: Tools are a set of code capabilities that the Harness provides for the model to "call."

The Harness not only describes what tools do, but also provides the code implementation of those tools. Common tools include:

| Tool Type | Function Description |
|-----------|----------------------|
| WebSearch | Allows the model to search the web for the latest information |
| WriteCode | Allows the model to write and execute code |
| ComposeEmail | Allows the model to compose and send emails |
| FileSystem | Allows the model to read and write local files |
| Browser | Allows the model to control a browser to perform actions |

**Key Design Principle**: The Harness usually does **not** dictate when and how the model uses tools. It simply:
1. Clearly describes what the tools are
2. Provides callable interfaces for the tools
3. Completely delegates the decision of "when to call, which one to call" to the AI model itself

This is a subtle but important design choice — it makes the Harness an **environment provider**, not a **decision-maker**.

### 4.3 Agentic Loop

This is the most core concept of the Harness, and the key to understanding how AI Agents truly "work."

#### 4.3.1 What Is an Agentic Loop

The Agentic Loop is the framework through which the AI model **autonomously makes decisions and循环执行 (cycles through execution)** within the Harness environment. The model does not simply provide an answer in one shot and finish. Instead:

1. **Understand the Request** (comprehend the user's prompt)
2. **Plan the Action** (decide which tools to call)
3. **Execute the Tool** (actually invoke the tool)
4. **Evaluate the Result** (check whether the tool's return satisfies the requirement)
5. **Decide Whether to Continue** (if the result is insufficient, continue calling tools or switch tools)
6. **Produce the Final Result** (once satisfied, call the final delivery tool)

#### 4.3.2 Concrete Example: School Ranking Research

Earendil provides a highly illustrative example — asking an Agent to compare local primary school rankings and test scores and provide recommendations.

Assuming the Harness has three built-in tools: WebSearch, WriteCode, ComposeEmail, and the interaction medium is Email. The user sends an email: "Help me compare the rankings and test scores of experimental primary schools in District A and District B, and give me school selection advice."

The Agent's workflow:

```
Step 1: Understand the Request
────────────────────────────────
The model comprehends concepts like "experimental primary school,"
"District A/District B," "rankings and test scores"

Step 2: Search for Information
────────────────────────────────
The model constructs search queries
Scrapes the latest school rankings and test data from the web
   ↓
Step 3: Evaluate Search Results
────────────────────────────────
The model reviews the search results in the Harness environment
Finds the data incomplete or irrelevant
→ Autonomously decides to search again

Step 4: Data Analysis
────────────────────────────────
The model calls the WriteCode tool
Generates a spreadsheet, processes data, formats results
   ↓
Step 5: Evaluate Intermediate Results
────────────────────────────────
Compares the spreadsheet against the original request
If data still doesn't satisfy, continues searching or revises analysis
→ Loops back to Step 2 when necessary

Step 6: Draft the Report
────────────────────────────────
The model calls ComposeEmail
Writes recommendations into the email body, attaches the spreadsheet
   ↓
Step 7: Final Review
────────────────────────────────
The model reviews the composed email and attachment
Confirms everything is correct, then sends

Step 8: User Receives the Email
────────────────────────────────
Within seconds, the user receives an email with a summary of recommendations
The body contains analysis conclusions; the attachment is a detailed spreadsheet
```

This is a complete Agentic Loop — the model **autonomously loops within the Harness environment until it self-judges the task as complete.**

#### 4.3.3 The Significance of the Loop

The existence of the Agentic Loop means: **An AI Agent is not a "Q&A machine," but a "task executor."** It will:
- Autonomously determine whether more information is needed
- Autonomously choose which tool to use
- Autonomously decide when to iterate and when to conclude

This is fundamentally different from traditional AI conversations (you ask one question, I give one answer). The Agentic Loop enables AI to complete complex multi-step tasks, not just answer questions.

### 4.4 Translation Layer

#### 4.4.1 What Is the Translation Layer

The Translation Layer is the key component that allows a Harness to work with **different AI models**.

It is responsible for:
1. Translating the Harness's standard interfaces into the API format of a specific model
2. Translating the specific model's output back into the Harness's standard format
3. Allowing **dynamic switching between different models** within the same Agentic Loop based on task requirements

#### 4.4.2 Why the Translation Layer Is So Important

**Power Transfer**: The Translation Layer is the key mechanism that shifts power from AI labs to end users.

Without the Translation Layer:
- If you use Anthropic's app, you can only use Claude
- If you use OpenAI's app, you can only use GPT
- You are a "user" of the AI lab, not the real master

With the Translation Layer:
- You can connect your own Harness to Anthropic, OpenAI, or any open source model
- You can have Claude handle reasoning, GPT handle generation, and open source models handle simple tasks — all within the same task
- You can compare cost and quality across different models' results

**The Path to User Sovereignty**: The Translation Layer means users can choose "which model to use," rather than being locked into an AI lab's application. The Harness is what the user owns; the model is called from outside. This principal-subordinate relationship is the core of the Harness philosophy.

#### 4.4.3 A Concrete Scenario

Returning to the school research example. A user can have the same Harness:
- Send the same request to an OpenAI model, an Anthropic model, and an open source model simultaneously
- Receive three different responses
- Compare the three versions' results, costs, and quality in the same email inbox
- Rather than opening three separate apps, logging in separately, and saving records separately

This is precisely the freedom the Harness brings: **The tools and data belong to you; the choice belongs to you.**

## 5. Open Source and User Autonomy: The Politics of Harness

### 5.1 Why Harnesses Must Be Open Source

Earendil points out a key contradiction in AI infrastructure:

> The first popular Agent Harness was Claude Code, but it was not designed to provide a "model-agnostic translation layer" — it was built as an application to enable coding with Claude models on your local computer.

The problem with Claude Code: It locks users into the Claude model and Anthropic's ecosystem. You can't easily switch models, and you can't easily migrate your work to other Harnesses.

The prerequisite for Harnesses to truly deliver "user autonomy" is: **Open Source + Neutrality**.

### 5.2 Pi's Practice: Letting Users Truly "Own" Their Harness

Earendil describes Pi's design philosophy in detail:

- **Minimalism**: Pi's System Prompt is very short, its tool set is very lean, works out of the box, and gets out of the way as much as possible
- **Extensibility**: Users can modify the System Prompt, design Extensions, and adjust the tool set
- **Community Collaboration**: Pi users have shared more than **5,000 extensions** with each other
- **Fully Local**: Pi runs on your own laptop, with no dependency on any cloud service
- **Open Source**: Users can review code, modify code, and redistribute code

This means:
- Pi is a tool users **own**, not a service users **rent**
- A user's "AI capability" does not depend on any company's business decisions
- All conversation history is stored locally, not on the AI lab's servers

### 5.3 The Bigger Picture: A Tool Against AI Power

Earendil articulates a deeper vision at the end of the article:

> Many people right now are concerned about the power and influence of bigger and bigger AI companies. Some of those people may choose to avoid AI completely.
>
> We at Earendil believe we can strengthen human agency by crafting software and open protocols that bridge division and ignorance and cultivate lasting joy and understanding.
>
> We won't do that by ignoring the technologies that exist today, but by **harnessing them with clear eyes and a firm grip; ensuring that we wield the hammer, the hammer does not wield us**.

The subtext of this passage: **Rather than abandoning AI, let's master its reins.** The Harness is those reins.

## 6. Design Philosophy: Harness as a Vehicle for User Autonomy

Synthesizing Earendil's original article and the Pi project's practice, the design philosophy of Harnesses can be summarized around several core principles:

### 6.1 Tool Agnosticism

A good Harness should remain neutral about models. Choosing which model to use is the user's right; the Harness should provide that choice, not make the decision for the user. Pi's support for OpenAI, Anthropic, and various open source models is an embodiment of this principle.

### 6.2 User Sovereignty

Users should own and control their own Harnesses, not rent services provided by AI labs. This means:
- Run locally; data does not leave the user's device
- Open source code; users can review and modify
- Conversation history is stored locally, not in the cloud

### 6.3 Open Extensibility

The tool set and System Prompt of a Harness should be freely extensible by users. Pi's 5,000+ extensions prove: when users are allowed to extend tools, the ecosystem's richness far exceeds what the platform provider would expect.

### 6.4 Human in the Loop

Although the Agentic Loop allows models to autonomously loop, Harness design should always preserve **human in the loop**:
- All tool calls by the model occur within a context visible to the user
- Users can intervene, modify, or terminate the Agent's behavior at any time
- Final deliverables (emails, files, code) are decided by the user on whether to use

### 6.5 Minimal Default

Pi's System Prompt is very short, and its tool set is very lean. This is a **conscious restraint**: the fewer default configurations, the more space for users to reshape. "Less is more" in Harness design is not an aesthetic choice, but a philosophical one.

## 7. Key Takeaways and Insights

### Insight 1: Harness Is the "Operating System Layer" of AI Agents

The model is the computing resource; the Harness is the operating-system-like component that schedules and uses those resources. Just as Linux doesn't care what application you run (as long as you follow the interface), a good Harness doesn't care which model you use (as long as it's connected through the Translation Layer).

### Insight 2: Users Should Own a "Workbench," Not a "Tool"

Most current AI products (Claude App, ChatGPT, Cursor) are essentially **applications** — users are using products built by AI labs. The Harness philosophy is: users should own their own **workbench**, and which model runs on it is optional. Applications become obsolete; the workbench is always yours.

### Insight 3: Open Protocols > Closed Platforms

If every AI lab only provides its own closed Agent, users become locked in. Open, neutral, interoperable Harness protocols are the technical foundation for preventing the concentration of AI power. Projects like Earendil, OpenClaw, and OpenCode are building this open protocol infrastructure.

### Insight 4: Agentic Loop Is the Watershed Between AI "Answering Questions" and "Completing Tasks"

The limitation of traditional AI conversations is "you ask one question, I give one answer." The Agentic Loop enables AI to autonomously plan, autonomously iterate, and autonomously deliver — this is the core leap of AI from an "intelligent Q&A engine" to an "autonomous agent."

### Insight 5: Local-First Is the Only Reliable Guarantee of User Data Sovereignty

AI conversation records stored in the cloud are commercially unsustainable (AI labs can access, delete, or monetize them at any time) and politically unreliable (dependent on company policies and national regulations). Local storage as plain text files is the only technical foundation for users to have complete sovereignty over their AI conversations.

### Insight 6: The Competition for the Translation Layer Will Determine the Power Landscape of the AI Ecosystem

Whoever controls the Translation Layer controls users' choice. If the Translation Layer is open source and neutral, power is in users' hands; if it's closed source and commercial, power is in the platform's hands. This is a strategic high ground not yet widely recognized.

### Insight 7: The Open Source Community Is the Hope for AI Democratization

Claude Code opened the era of Agent Harnesses, but it chose closure and lock-in. Open source projects like Pi, OpenClaw, and OpenCode are returning this power to users. The ecosystem of 5,000+ shared extensions proves: **when users are given real control, they can do things far beyond what platform providers imagined.**

## 8. Project Spotlight: Pi

| Field | Value |
|-------|-------|
| Name | Pi |
| URL | pi.dev |
| Type | Open Source Agent Harness |
| Interaction Interface | Terminal |
| Model Support | OpenAI / Anthropic / Open Source Models (via Translation Layer) |
| Storage | Local Plain Text Files |
| License | Open Source (Free and Open Source) |
| Extension Ecosystem | 5,000+ User-Shared Extensions |
| Philosophy | Minimalist, User-Owned, Local-First |

Pi's core design philosophy: **Give you a clean, blank canvas, and let you shape AI's behavior according to your own will.** By default it does nothing, but you can shape it into anything you want.

## 9. Conclusion: Grip the Reins

Earendil writes at the end of the article:

> We won't do that by ignoring the technologies that exist today, but by **harnessing them with clear eyes and a firm grip; ensuring that we wield the hammer, the hammer does not wield us.**

This sentence deserves serious contemplation from every participant in the AI era.

We are rapidly entering a world where AI is everywhere. In this world, there are two choices:

1. **Become a user of AI** — renting your "AI capability" within applications built by AI labs, accepting lock-in, data collection, and the deprivation of choice
2. **Become a driver of AI** — owning your own Harness, controlling your own tools and data, using AI with clear eyes and decided agency

The Harness is those reins. It is not AI itself, but it determines who can control AI, how to control AI, and who it serves.

Grip them.

---

*Original: What is a Harness? — Earendil (https://earendil.com/posts/what-is-a-harness/)*
