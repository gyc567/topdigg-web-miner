---
title: "What Is an AI Agent? Notes on 'Understanding AI Agent' That Even an Elementary Schooler Can Understand"
description: "A plain-language walkthrough of the open-source GitHub book 'Understanding AI Agent: Design Principles and Engineering Practice' (34.5k stars). Explains the core formula Agent = brain + eyes + hands in one article, with the highlights of all 10 chapters, 95 hands-on experiment tutorials, and the book's key viewpoints and design philosophy."
date: "2026-08-08"
author: "TopDigg Research Team"
tags: ["AI Agent", "LLM", "Context Engineering", "MCP", "RAG", "Coding Agent", "Reinforcement Learning", "Multi-Agent Collaboration", "Open Source Book", "Bo Jie Li"]
categories: ["Deep Dive"]
keywords: ["AI Agent", "Understanding AI Agent", "ai-agent-book", "Agent = LLM + Context + Tools", "Context Engineering", "MCP Protocol", "Coding Agent", "Multi-Agent Collaboration", "Agent Evaluation", "Model Post-training", "Bo Jie Li", "Pine AI", "Open Source Book"]
---

# 🤖 What Is an AI Agent? — Explaining "Understanding AI Agent" in Words Even an Elementary Schooler Can Get

> The whole book in one sentence: **Agent = brain + eyes + hands**
>
> Or put another way: **Agent = a smart mind + information it can see + tools that get things done**

---

## 🚀 Opening: Let's Start with a Little Story

Imagine you have a super smart robot friend named Xiao Zhi.

Xiao Zhi has an **amazingly powerful brain** that can figure out any problem; Xiao Zhi also has **eyes that can see the world** and know what's happening around it; and Xiao Zhi has two **nimble little hands** that can do homework, look things up online, send emails for you, and even call customer service to haggle on your behalf.

With a brain, eyes, and hands, Xiao Zhi is no longer just a "robot that chats" — it becomes an **agent that can complete tasks on its own**. This "agent" is called an **Agent** in English.

And the book we're talking about today — *Understanding AI Agent: Design Principles and Engineering Practice* — is a martial-arts manual for "building a Xiao Zhi of your own." It tells you: how should the brain be configured? What should the eyes look at? What should the hands do? How do you assemble the three parts so the Agent can actually help people get work done?

The book is open source on GitHub with **34.5k stars** (about 35,000 likes and bookmarks), making it one of the hottest AI technical books of 2026. Today, we'll walk you through the whole book from cover to cover in plain language.

---

## 📖 Part 1: Project Overview — What Kind of Book Is This?

### 1.1 Basic Info

- 📚 **Title**: *Understanding AI Agent: Design Principles and Engineering Practice*
- ✍️ **Author**: Bo Jie Li (GitHub handle: bojieli), Chief Scientist at the AI company **Pine AI**
- ⭐ **Open-source stats**: 34.5k stars, 3.7k forks, 1,400+ commits
- 📄 **License**: Apache-2.0 (completely free and open source — read it and learn from it freely)
- 🌐 **Languages**: available in 13 languages (Chinese / English / Spanish / Indonesian / Arabic / Traditional Chinese / Russian / Tamil / Vietnamese / Japanese / Turkish / Korean / Hungarian)
- 📁 **Repository**: https://github.com/bojieli/ai-agent-book
- 🌍 **Read online**: https://bojieli.github.io/ai-agent-book/

### 1.2 What "Treasures" Does This Book Pack?

Open up the repository and you'll find it stuffed with treasures:

- 📖 **10 full chapters**: from the most basic concepts all the way to advanced production techniques
- 🧪 **95 accompanying experiments**: every experiment comes with complete code you can run yourself
- 🎨 **Illustrations throughout**: all figures are crisp, beautiful SVG vector graphics
- 📥 **PDF / EPUB ebooks**: beautifully typeset offline versions, free to download
- 🗂️ **Code directories organized by chapter**: chapter1 through chapter10, matching chapter by chapter

### 1.3 A Remarkable Writing Story: This Book Was "Spoken" Into Existence

The book also has a fascinating behind-the-scenes story: the author, Bo Jie Li, says it was written using a method called **whisper coding (dictation-style collaboration)** — and his own company's voice Agent did much of the heavy lifting!

Every time he prepared content, instead of typing, he **dictated** it to a voice Agent: he would first speak an outline and let the Agent research and draft; after teaching a class, he'd dictate student feedback to the Agent to make revisions. This loop of "dictate → research → discuss → revise" repeated many times before the book was finally written.

Why speak instead of type? Because **talking is 4 times faster than typing**. And the story itself is a perfect proof point: Agents aren't just theory in a book — they really can help people pull off complex tasks like "writing a book"!

> 💡 In other words: **this book teaches about Agents and is itself a work created with the help of an Agent.** Teaching about Agents with an Agent — pretty cool, right?

### 1.4 Why Did the Author Write This Book?

The author has spent years working in the AI field, and he noticed something:

> Many people working in AI can only "get a demo running," but don't understand why things are designed that way or how to make trade-offs when problems arise. The purpose of this book is to shift AI Agent design from "gut-feeling-driven" to "principle-driven" — **it doesn't just teach you how to do it, but why you do it**.

And he chose to release it **free and open source**, collecting no royalties, hoping the knowledge would spread to more practitioners. This "making the martial-arts manual public" move is quite rare in the business world and deserves a big thumbs up 👍.

---

## 🧠 Part 2: The Core Idea — The Whole Book in One Sentence

The whole book spans 10 chapters and hundreds of thousands of words, but the core idea condenses into one sentence:

> **Agent = LLM + Context + Tools**

Translated into elementary-school language:

> **Agent = brain + eyes + hands**

### 2.1 Three Parts, Each with Its Own Job

- 🧠 **LLM (Large Language Model) = the brain**
  - Understands problems, thinks, reasons, and makes decisions
  - Like you: think it through first, then act

- 👀 **Context = the eyes**
  - Determines what the Agent "sees": system instructions, conversation history, results returned by tools moments ago...
  - You can only decide what to do based on what you see. If the eyes can't see it, even the smartest brain can't use it

- 👐 **Tools = the hands**
  - Determines what the Agent "can do": search the web, call APIs, work with databases, write files...
  - Without hands, an Agent can only talk, not do

### 2.2 All Three Parts Are Indispensable

- Brain only, no hands → it can only chat, not get things done (that's your ordinary chatbot)
- Brain and hands, but no eyes → doesn't know what's going on, works blindly
- Eyes and hands, but no brain → no ability to think, just a puppet on strings

So a true Agent that can "complete tasks on its own" needs **every single one** of the three parts.

### 2.3 The More Academic Version (for the Bigger Kids)

If you've studied reinforcement learning, you can translate the three parts into academic language:

- LLM (brain) → **Policy**: how to make decisions
- Context (eyes) → **Observation Space**: what can be seen
- Tools (hands) → **Action Space**: what can be done

Same thing, three ways of saying it — just different levels of understanding.

---

## 📚 Part 3: The Detailed Tutorial — Highlights from All 10 Chapters, One by One

The ten chapters build on each other like blocks, one layer at a time. Let's go through them one by one:

### Chapter 1 🚀 Agent Basics: Getting to Know Agents

- **What it covers**: starts from real Agent products to understand what an Agent actually is; breaks down the core formula; dissects the **ReAct loop** (the endless "think → act → observe" cycle that is the basic working pattern of nearly all Agents)
- **For kids**: when Xiao Zhi gets a task, it doesn't finish it all in one go; it goes "think one step, do one step, check the result, think the next step" — just like when you solve a math problem: "read the problem → set up the equation → check your work"
- **Key takeaway**: a large model alone isn't enough — **the Harness (the "cockpit" engineering that wraps the model) is where the real competitive edge lies**

### Chapter 2 🎯 Context Engineering: Fitting the Agent with Eyes

- **What it covers**: this is the **most crucial chapter** in the book. It covers the KV Cache, Prompt Engineering, prompt injection attacks and defenses, Agent Skills (skills loaded on demand), and context compression
- **For kids**: there's a limit to how much Xiao Zhi's eyes can take in at once (the context window), so you need to make sure the information it sees is complete but not wasteful — remember what matters, compress the rest
- **Key takeaway**: **context determines the ceiling of capability**. No matter how good the model is, if the information fed to it is wrong, it can't do a good job. That's why "how well you write your Prompt" matters so much

### Chapter 3 📚 User Memory and Knowledge Bases: Helping the Agent Remember Old Friends

- **What it covers**: remembering users across sessions; the full **RAG (retrieval-augmented generation)** tech stack; knowledge graphs
- **For kids**: Xiao Zhi needs a "memory" so it remembers what you like next time you meet; Xiao Zhi also needs a "library" — when it doesn't understand something, it looks it up (RAG means "look up the material first, then answer the question")
- **Key takeaway**: **there are two kinds of memory** — remembering this particular user (user memory), and knowing everything about the world (external knowledge base). You need both

### Chapter 4 🛠️ Tools: Giving the Agent a Pair of Hands

- **What it covers**: the **MCP protocol** (a standard protocol that lets different Agents share tools); three kinds of tools — perception, execution, and collaboration; event-driven asynchronous Agents
- **For kids**: Xiao Zhi's "hands" can't just grab at anything — there needs to be a standard (MCP) so all Agents can use the same set of tools; and there needs to be a safety mechanism to stop Xiao Zhi from causing trouble
- **Key takeaway**: **tools should be designed generically** — one general-purpose tool that "can execute code" is more useful than a hundred special-purpose tools that "can only do 1+1"

### Chapter 5 💻 Coding Agents and Code Generation: Agents That Can Write Code

- **What it covers**: the full picture of production-grade Coding Agents; the broad value of code generation beyond programming itself
- **For kids**: code is "a tool that can create new tools." Once Xiao Zhi learns to write code, it can build new tools for itself — even new Agents!
- **Key takeaway**: **Coding Agent + file system is the most core technical foundation for all general-purpose Agents**. Code = meta-capability (the ability to create abilities)

### Chapter 6 🎯 Agent Evaluation: Giving Agents Exams and Grades

- **What it covers**: evaluation environments, dataset design, LLM-as-a-Judge (having a model play examiner), and evaluation-driven model selection
- **For kids**: how do you know Xiao Zhi is improving? Give it a test! Set the same questions, grade it, and watch the scores change. Scores don't lie
- **Key takeaway**: **without evaluation, there is no progress.** This is a line the author repeats again and again. If you can't tell "it genuinely got better" from "we got lucky," your iterations are just stumbling in the dark

### Chapter 7 🧠 Model Post-training: Putting the Brain Through School

- **What it covers**: the three stages of pretraining / SFT (supervised fine-tuning) / RL (reinforcement learning); reward signal design; sample efficiency
- **For kids**: the brain that ships from the factory already knows a lot, but it still needs "schooling": **SFT is memorizing the textbook** (learning from standard answers), **RL is doing practice problems** (checking your answers and reflecting on them). Memorizing makes it stick; doing problems teaches you to apply what you've learned
- **Key takeaway**: **"SFT for memory, RL for generalization"** — plus an even more counterintuitive one: **"data and environment matter more than algorithms"**

### Chapter 8 🔄 Continuous Agent Evolution: Smarter with Every Use

- **What it covers**: drawing learning signals from runtime traces; four carriers for updates — knowledge, instructions, programs, and parameters; canary releases and rollbacks
- **For kids**: every time Xiao Zhi works, it "gains experience," jotting down the potholes it stepped in so it doesn't step in them again. That's how it goes from "used once" to "better every time"
- **Key takeaway**: **experience can live in four places** — knowledge documents, instructions/skills, programs, and model parameters. Where you store it depends on how the capability is expressed and verified

### Chapter 9 🎙️ Multimodality and Real-time Interaction: Hearing, Seeing, and Acting

- **What it covers**: voice Agents (three paradigms), Computer Use (letting Agents operate a computer interface like a human), and robots (VLA models + Sim2Real transfer)
- **For kids**: Xiao Zhi can do more than type and chat — it can **hear you speak, see your screen, even operate robots with its own hands**. It steps from the "text world" into the "real world"
- **Key takeaway**: multimodality and real-time interaction bring a shared architectural challenge: **separating fast and slow** (a fast model chatting on the front line, a slow model deep-thinking in the background)

### Chapter 10 🤝 Multi-Agent Collaboration: A Team of Agents

- **What it covers**: a framework for classifying multi-Agent collaboration (shared/independent context × peer/manager/decentralized); Agent societies and Agent economies
- **For kids**: when one person can't finish the job, call in a team: some Agents research, some Agents write reports, and one Agent acts as the team leader assigning tasks
- **Key takeaway**: **collective intelligence beats the individual**. Multiple Agents working together can complete tasks a single Agent can't; and every design decision in a multi-Agent system maps back to the single Agent's three elements (brain/eyes/hands)

---

## 🛠️ Part 4: Hands-on Tutorial — How to Run All 95 Experiments Yourself

Reading the book without doing experiments is like reading a cookbook without cooking. The most honest part of this book: **all 95 experiments are open source**, and every single one can be run by hand.

### 4.1 Preparation

- 🐍 **Python 3.10+**: all experiments are built on Python
- 🔑 **A model API key**: it's recommended to apply for keys from platforms like DeepSeek, Kimi (Moonshot AI), Zhipu GLM, Siliconflow, etc.
- 📦 **uv or pip**: the Python package manager, used to install dependencies

### 4.2 Installing Dependencies (Three Steps)

**Step 1**: clone the repository to your local machine

```bash
git clone https://github.com/bojieli/ai-agent-book.git
cd ai-agent-book
```

**Step 2**: install the dependencies for the chapter you want (e.g., Chapter 1)

```bash
# Recommended: use uv (locks versions for reproducible results)
uv sync --locked --extra ch1

# Or use pip
python -m pip install -e ".[ch1]"
```

Replace `ch1` with `ch2` through `ch10` to install the dependencies for any chapter.

**Step 3**: configure your API key

- Copy `.env.example` in the project root to `.env`
- Fill in at least one model provider's key
- After that, your experiments can call the large model

### 4.3 Running an Experiment

```bash
uv run python chapter1/context/main.py
```

That's it! Once it runs, you'll watch firsthand how the Agent's "think → act → observe" loop works step by step.

### 4.4 Difficulty Levels (from Easy to Hard)

- 🟢 **Beginner (Chapters 1–2)**: for newcomers, understanding basic concepts
- 🔵 **Intermediate (Chapters 3–4)**: needs a little programming background, involves system integration
- 🟣 **Advanced (Chapters 5–6)**: needs solid programming skills, involves complex system design
- 🔴 **Expert (Chapters 7–8)**: needs deep learning and training experience
- 🟠 **Application (Chapters 9–10)**: combines everything learned so far to build real applications

> 💡 The author's special reminder: **running it once with your own hands is worth more than reading it ten times.** Much of your design intuition can only truly develop while debugging code.

---

## 💡 Part 5: Key Takeaways — The Book's Most Memorable Points

After chewing on the 10 chapters, the introduction, and the epilogue, we've distilled the book's 10 core viewpoints:

### Point 1: Practice Comes First, Naming Follows

The industry loves new terms like Skill, harness, and loop engineering. Many people assume big companies like Anthropic invented these concepts first, and everyone else followed. **In fact, it's the opposite**: lots of Agent teams were already doing these things long before; the big companies just summarized them into principles. **Practice comes first, naming follows.**

> What this means for you: don't wait until a term becomes trendy before acting. By the time it's trendy, the leading companies have already stumbled through every pitfall.

### Point 2: Without Evaluation, There Is No Progress

This is the most emphasized line in the whole book. Without evaluation, you can't tell whether a change "genuinely improved things" or "was just luck."

### Point 3: Context Determines the Ceiling of Capability

The same model fed different contexts performs completely differently. **What often decides how smart an Agent can be isn't the model — it's what the Agent "sees."**

### Point 4: Code Is the "Meta-capability"

Code is "a tool that can create new tools." An Agent that can write code can build tools for itself — even new Agents. This is the key to an Agent's self-evolution.

### Point 5: SFT for Memory, RL for Generalization

Memorizing the textbook (SFT) makes things stick; doing practice problems (RL) teaches you to apply what you've learned. The two training approaches serve different purposes — **which one to pick depends on whether you want "memory" or "generalization."**

### Point 6: Data and Environment Matter More Than Algorithms

This one is a bit counterintuitive: many people think algorithms matter most when training a model, but the author stresses that **high-quality data and real-world environments are worth more than fancy algorithms**.

### Point 7: Good Design Principles Outlive Model Iteration Cycles

Models get upgraded every few months, but the three questions — "what it sees, what it can do, and how you verify whether it did it right" — never go out of date. **Mastering "why it's designed this way" matters far more than memorizing some API's usage.**

### Point 8: Model and Harness Are a Co-evolving "Flywheel"

What the model can't do, the Harness (cockpit engineering) catches first; the experience of the Harness catching things then becomes data for the next round of model training. **The faster it spins, the more each feeds the other.** This flywheel is the deepest moat of this era.

### Point 9: Two "Clouds" Loom Over the Agent Sky

Borrowing the 1900 physics metaphor of "two clouds," the author points out two big challenges for Agents:

- 🌩️ **Cloud one**: how to interact with the real world in real time, streaming (instead of chatting back and forth, question by question)
- 🌩️ **Cloud two**: how to keep learning from experience like humans do (instead of learning and then forgetting)

### Point 10: Collective Intelligence Beats the Individual

Multiple Agents dividing up work and collaborating can complete tasks that a single Agent can't. In the future, Agents will form "societies" and even an "Agent economy."

---

## 🏛️ Part 6: Design Philosophy — The "Soul" of This Book

Good books don't just give conclusions — they give **methodology**. This book's design philosophy can be distilled into five principles:

### Principle 1: Principle-Driven, Not Gut-Feeling-Driven

The author's original intent in writing this book was to move Agent design from "gut-feeling-driven" to "principle-driven." **Behind every architectural decision, you should be able to explain the trade-offs** — why you chose this, what it costs, and when you should switch.

### Principle 2: Do Engineering the Scientific Way

"We advocate doing engineering and building Agents with a scientific methodology, and evaluation is the foundation of that methodology." **Intuition is welcome, but intuition must be verified with data.**

### Principle 3: Harness Engineering Is the Competitive Edge

Models are "something you can buy" (every vendor's API is pretty similar), but the engineering layer wrapped around the model — context management, tool orchestration, safety nets, error recovery — is what **nobody can copy away from you**. This is exactly the deep insight that "models keep eating Harness layer by layer, yet Harness keeps migrating to new frontiers."

### Principle 4: Let Real Business Forge Capability

The author says that to lead in the Agent field, you need **a real business that demands an extremely high ceiling of capability**. Pine calls carriers and handles refunds on users' behalf — often dozens of rounds of negotiation, where a single misstep causes real financial loss. It's exactly this unforgiving reliability requirement that "forced out" one architectural principle after another.

### Principle 5: Good Design Outlasts Time

"Good design principles are meant to outlast model iteration cycles, because they describe not how to use some particular model, but the basic patterns by which intelligent systems interact with the world." **You learn the "why," not just the "what."**

---

## 🎯 Part 7: Summary — The Whole Book in Three Sentences

Let's compress the whole book into three sentences:

1. **What is an Agent?** — brain + eyes + hands (model + context + tools)
2. **How do you build an Agent?** — fit the eyes first (context engineering), then attach the hands (tools), and finally use code to let it grow new abilities on its own
3. **How do you make it better?** — take exams (evaluation) to find gaps, go to school (SFT/RL) to fill weaknesses, and work (continuous evolution) to gain experience

Then compress it into one sentence:

> **Let a smart model see the right information, use the right tools, and keep evolving in real tasks.**

That's the whole secret of *Understanding AI Agent*.

---

## 🔗 Part 8: Related Links

- 📦 GitHub repository: https://github.com/bojieli/ai-agent-book
- 🌍 Read online (13 languages): https://bojieli.github.io/ai-agent-book/
- 📥 Free Chinese PDF / EPUB downloads: in the `latest` release on the repository's Releases page
- 📚 Learning guide document: `docs/zh-CN/LEARNING.md` in the repository

---

## 👋 Closing Words

This book tells you: an AI Agent is no mysterious magic — it's simply a combination of **a smart model + the right information + tools that get things done**. The real challenge isn't how powerful some model is, but **how to scientifically assemble these three parts so the Agent reliably completes tasks in the real world**.

Now you know the formula, and the experiment code is open source. So go ahead — **build an Agent of your own with your own hands**. After all, between understanding it and building it lies a river only your two hands can carry you across. 🌊

---

*This article was compiled from the README, introduction, epilogue, and learning guide of the open-source GitHub repository bojieli/ai-agent-book (Apache-2.0), translated and summarized by the TopDigg Research Team.*
