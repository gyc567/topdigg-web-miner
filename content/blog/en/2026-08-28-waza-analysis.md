---
title: "tw93/Waza: Turning Engineering Habits into AI Agent Executable Skills"
description: "A comprehensive analysis of tw93/Waza — the AI Agent skills framework that distills years of engineering discipline into 8 executable slash commands (/think, /hunt, /check, /ui, /learn, /read, /write, /health). Waza's core philosophy: constraints enable freedom. Covers design philosophy, all 8 skills in depth, installation tutorial for Claude Code/Codex/Claude Desktop/Pi, the Kaku/Waza/Kami trilogy, and 5 core insights on why engineering habits are the best prompt engineering. Part of the open-source Waza ecosystem that turns passive AI tools into disciplined engineering partners."
date: "2026-08-28"
author: "TopDigg Research Team"
tags: ["Waza", "tw93", "AI Agent", "Slash Commands", "Claude Code", "Codex", "Engineering Habits", "Prompt Engineering", "Agent Skills", "Open Source"]
categories: ["Deep Analysis", "AI Tools", "Open Source", "Agent Skills"]
keywords: ["Waza", "tw93", "AI agent", "slash commands", "engineering habits", "prompt engineering", "Claude Code", "Codex", "agent skills", "AI workflow", "constraints enable freedom", "Kaku", "Kami", "open source AI"]
---

# tw93/Waza: Turning Engineering Habits into AI Agent Executable Skills

> Core idea: **The best AI agents are not the most capable ones — they are the most disciplined ones.** tw93/Waza is a skills framework that doesn't add more capabilities to AI agents; it adds more structure. Built on the conviction that engineering habits are the best prompt engineering, Waza distills years of engineering discipline into 8 executable slash commands, each representing a hard-won lesson from real production failures. The framework's north star: "less is more" — 8 skills, each with exactly one trigger, each enforcing a constraint that prevents a class of real mistakes. Waza is the drilling ground in the Kaku/Waza/Kami trilogy: Kaku writes the code, Waza drills the habits, and Kami ships the documents.

---

## 1. Project Overview

### 1.1 What Is It?

**Waza** (stylized as Waza, from the Japanese concept of technique mastered through discipline) is an open-source AI Agent skills framework developed by **tw93** — the same developer behind the well-known Pikachu and Kami ecosystems. It is not a model, not a prompt library, and not a generic agent scaffold. Waza is a **discipline layer** that transforms how AI agents behave: from free-form output machines into structured engineering partners that follow established professional habits.

The framework provides **8 executable slash commands** that wrap engineering best practices into AI-executable skills. Each skill enforces a specific workflow constraint — design before code, root cause before fix, review before ship — that prevents a class of real production failures. The 8 skills are:

1. `/think` — Design validation before coding
2. `/hunt` — Root cause analysis before fixing
3. `/check` — Code review before shipping
4. `/ui` — Distinctive UI generation with screenshot-driven iteration
5. `/learn` — Six-phase research workflow
6. `/read` — Platform-aware document reading with routing
7. `/write` — Natural writing in Chinese and English
8. `/health` — Six-layer agent health audit framework

### 1.2 Key Facts

- **Repository**: `https://github.com/tw93/Waza`
- **Developer**: tw93 (known for Pikachu, Kami, and the broader Waza ecosystem)
- **License**: MIT
- **Framework Type**: AI Agent Skills / Engineering Discipline Layer
- **Supported Platforms**: Claude Code, Codex, Claude Desktop, Pi (native plugins)
- **Core Philosophy**: "Less is More" — 8 skills, each with one trigger

### 1.3 Ecosystem Context

Waza exists within a broader **three-part ecosystem** from tw93:

| Component | Role | Focus |
|-----------|------|-------|
| **Kaku** | Code Writer | Writes code following engineering standards |
| **Waza** | Habit Driller | Turns engineering habits into executable skills |
| **Kami** | Document Shipper | Produces structured, platform-aware documents |

Kaku produces output. Waza ensures the output follows discipline. Kami packages it for delivery. The three are designed to work together, each filling a distinct role in a professional AI-augmented engineering workflow.

---

## 2. Background: Why AI Agents Need Engineering Habits

### 2.1 The Problem of Uncontrolled Output

Modern AI coding tools — Claude Code, Codex, Copilot, and their descendants — are extraordinarily capable. They can write thousands of lines of production code, refactor entire codebases, and reason through complex architectural decisions. Yet for all their capability, they share a fundamental pathology: **they optimize for plausible output, not correct output.** Given a vague instruction, they produce a vague result. Given no structural constraints, they produce structurally unsound results.

This is not a failure of the models. It is a structural problem. Large language models are trained to predict the next plausible token given a context. They have no built-in concept of:

- **What a correct solution looks like** beyond pattern matching against training data
- **What the project actually needs** beyond what was mentioned in the prompt
- **What a real failure costs** beyond abstract token prediction

The result is a class of problems that engineers have taken to calling **"uncontrolled output"** — AI-generated code that looks right, passes a cursory review, and then fails in production in ways that are expensive to diagnose and fix.

### 2.2 The "More Capability" Trap

The instinctive response to AI agents producing low-quality output is to reach for more capability: better models, longer context windows, more sophisticated prompting, retrieval-augmented generation pipelines, multi-agent orchestration. Each of these adds genuine capability. None of them addresses the structural problem.

More capability without structure produces more capable bad behavior. A more powerful model generates more plausible-looking bugs. A longer context window lets the model maintain consistency across a larger volume of incorrect reasoning. More sophisticated prompting that isn't grounded in engineering discipline produces more elaborate-sounding but equally incorrect solutions.

The fundamental issue is not capability. It is **habit**. Engineering quality comes not from knowing more, but from following established discipline — validating before coding, investigating before fixing, reviewing before shipping, understanding the problem space before generating output.

### 2.3 Engineering Habits as Prompt Engineering

The insight behind Waza is that **the best prompt engineering is not a better prompt — it is an engineering habit encoded as a workflow constraint.**

Consider a senior engineer's workflow when debugging a production incident:

1. They do not immediately propose a fix. They investigate the root cause.
2. They gather runtime evidence before forming hypotheses.
3. They form multiple hypotheses and eliminate them systematically.
4. They stop after three failed hypotheses and reassess the approach.
5. They validate the fix against the evidence before shipping.

This is not a prompt. It is a habit — a discipline ingrained through years of failure. Waza's `/hunt` skill encodes exactly this discipline as an executable workflow that an AI agent can follow.

The key insight is that **engineering habits are compressed problem-solving patterns that have already been validated against real failure.** When you encode a habit into an AI workflow, you are not just adding a constraint — you are importing the collective engineering experience that produced that habit.

### 2.4 Why Waza Exists

Waza exists because **someone had to lose badly enough to write the rules.**

Every skill in Waza's framework is derived from a real failure — a production incident, a shipped bug, a design decision that seemed reasonable and was catastrophically wrong. The hard rules, the gotchas, the "stop after three failed hypotheses" thresholds are not theoretical best practices. They are empirical constraints that someone paid for in production.

This is what makes Waza different from a generic prompt library. Every constraint has a story. Every "do not do X" is backed by "we did X and it cost us Y."

---

## 3. Design Philosophy

Waza's design philosophy is organized around three core principles that govern everything from how skills are structured to how they are triggered.

### 3.1 "Less is More": Eight Skills, Each with One Trigger

The most immediately visible design decision in Waza is its minimalism: **8 skills, each with exactly one trigger**. No skill menus, no multi-trigger macros, no configuration complexity. Type the slash command and the discipline runs.

This minimalism is not a limitation — it is a design conviction. The AI tools landscape is full of frameworks that add more features, more options, more configuration surface. Waza goes the opposite direction. Each skill represents a **complete, self-contained discipline** that covers a specific engineering scenario from entry to exit.

The constraint of "one trigger per skill" forces a clarifying question: **is this skill doing one thing, or is it doing one thing well?** If a skill needs multiple triggers, it is probably two skills pretending to be one. If a skill cannot be triggered by a single slash command, it is probably too complex to be reliable.

This philosophy also makes Waza **low-friction to adopt**. Engineers remember 8 commands. They do not remember 40 commands with 12 configuration options each. The smaller the surface area, the more reliably it gets used.

### 3.2 "Structure is Efficiency": Outcome Contracts, Hard Rules, and Real-Failure Gotchas

The second design principle is that **structure is efficiency**. The more upfront structure you enforce, the less downstream correction you need.

Waza encodes structure through three mechanisms:

**Outcome Contracts**: Each skill defines what a successful outcome looks like before execution begins. `/think` requires a validated design before code is written. `/hunt` requires a confirmed root cause before a fix is proposed. `/check` requires a complete safety review before code is shipped. The outcome contract prevents the common AI agent failure mode of "produce output, then retroactively justify it."

**Hard Rules**: Each skill contains non-negotiable rules that cannot be bypassed by prompting. `/hunt` enforces "stop after three failed hypotheses." `/check` enforces "worktree safety — never operate on the main branch." `/think` enforces "no placeholders in phase output." Hard rules are not preferences — they are constraints that, if violated, invalidate the skill's output.

**Gotchas from Real Failures**: Every non-obvious constraint in Waza is annotated with the failure that produced it. This is not documentation for its own sake — it is **experience transfer**. When an engineer understands why a rule exists, they can make informed exceptions and recognize when the rule needs to be adapted for a new context.

### 3.3 "Project-Aware": Runtime Reads Public Repository Context

The third design principle is that **AI agents need to understand the project they are operating in, not just the task they have been given.**

Waza skills are designed to read project context at runtime — repository structure, existing code patterns, dependency graphs, build configuration, and other public repository artifacts. This is distinct from providing context through a prompt, because it means the agent is **actively investigating the project** rather than passively receiving a description of it.

This project-aware design serves two purposes. First, it reduces the burden on the human to manually provide context — the agent finds what it needs by examining the actual codebase. Second, it ensures that the agent's reasoning is grounded in **what the project actually is**, not what the human thinks the project is. This prevents a class of failures where the agent follows a reasonable-sounding plan that is inconsistent with how the project is actually structured.

---

## 4. The Eight Skills in Detail

### 4.1 /think — Design Validation Before Coding

**Purpose**: Ensure that design is validated before any code is written. The goal is to catch bad architecture at the design stage, where fixing it is cheap, rather than in the code stage, where fixing it is expensive.

**The Core Problem /think Solves**: AI agents are eager to code. Given a feature request, they immediately start writing implementation. This eagerness produces working code that solves the wrong problem — code that is well-implemented but architecturally unsound, or that addresses a surface-level interpretation of the request rather than the underlying need.

**How /think Works**: `/think` operates in three modes that correspond to the evaluation complexity of the task:

- **Lightweight Mode**: Quick design review for straightforward tasks. The agent produces a brief design note, validates it against requirements, and proceeds to implementation. Use when the task is low-risk and the architecture is well-established.
- **Evaluation Mode**: Full design review with alternatives considered. The agent produces a design document that explicitly considers multiple approaches, evaluates trade-offs, and selects the best option with documented reasoning. Use when the task involves non-trivial architectural decisions.
- **Triage Mode**: Design review for ambiguous or complex tasks where the problem definition itself is unclear. The agent spends additional time in problem definition and scope clarification before producing any design. Use when the feature request is vague, contradictory, or appears to be solving a symptom rather than a root cause.

**Key Constraints**:

- **No placeholders**: Phase output must be complete. No "TBD" sections, no "we will fill in later" blocks. If a section is incomplete, the phase is not complete.
- **Phase independence**: Each phase (requirements, design, validation) must be independently valid before proceeding to the next. The requirements phase cannot be considered complete if the design phase would reveal ambiguities that should have been resolved in requirements.
- **Outcome contract**: The design must satisfy the stated requirements, be implementable with available resources, and be maintainable over the expected lifespan of the system.

**When to Use**: Before writing any non-trivial code. Even for experienced engineers, `/think` serves as a forcing function to write down the design rather than proceeding on intuition.

### 4.2 /hunt — Root Cause Before Fix

**Purpose**: Ensure that problems are fixed at their root cause, not their symptoms. The goal is to prevent the common pattern of shipping fixes that appear to work and then regress in production.

**The Core Problem /hunt Solves**: AI agents, like humans, prefer the first plausible explanation for a problem. Given a bug report, they propose a fix that addresses the most obvious cause. This produces fast-looking turnaround on bug reports but leads to the "fix, deploy, regress" cycle that consumes engineering teams.

**How /hunt Works**: `/hunt` is structured around an **evidence ladder** — a systematic progression from runtime evidence to root cause:

1. **Reproduce**: Confirm the problem exists with actual runtime evidence, not just a description of the reported behavior.
2. **Hypothesize**: Form multiple possible causes. A good hunt produces at least two plausible hypotheses before evaluating any of them.
3. **Evaluate**: Test hypotheses against evidence, eliminating those that are inconsistent with what is observed in the runtime environment.
4. **Confirm**: Verify the root cause against the actual codebase, not just against the most likely explanation.
5. **Fix**: Propose a fix that addresses the confirmed root cause, not the observed symptom.

**Bisect Mode**: When the problem's location is unknown, `/hunt` includes a bisect mode that systematically narrows the search space. The agent divides the problem domain in half, determines which half contains the failure, and repeats until the exact location is identified. This is analogous to `git bisect` but applied to runtime behavior.

**Scope Blast Mode**: When a problem spans multiple systems or modules, scope blast mode expands the investigation to cover the full affected surface area. The agent treats the symptom as a boundary marker and investigates everything that could influence behavior in that region.

**The "Three Failed Hypotheses" Rule**: `/hunt` enforces a hard stop after three failed hypotheses. This is a non-negotiable constraint derived from real debugging experience. If three plausible hypotheses have been investigated and eliminated without finding the root cause, the agent must stop hypothesis generation and reassess: is the problem definition correct? Is the evidence being interpreted correctly? Is the search space defined correctly? This rule prevents the "infinite debugging loop" failure mode where an agent keeps proposing and testing the same category of hypothesis indefinitely.

**Evidence Requirements**: All root cause conclusions must be backed by runtime evidence — actual log output, actual variable state, actual behavior observed in a reproduced environment. Conclusions based on code inspection alone are flagged as unconfirmed.

### 4.3 /check — Review Before Ship

**Purpose**: Ensure that code is reviewed for safety, correctness, and project consistency before it is shipped. The goal is to catch what the implementation missed, what the design review couldn't catch, and what the human reviewer is likely to miss.

**The Core Problem /check Solves**: Human code review is valuable but limited by attention and context. Reviewers tire, get distracted, and miss things — especially in large pull requests where the cognitive load is high. AI-assisted review can maintain consistent attention across the entire surface area of a change, but only if it has a structured framework to follow.

**How /check Works**: `/check` operates across multiple review surfaces:

- **Worktree Safety**: Enforces that the review operates on a dedicated worktree, never on the main branch. This is a hard structural constraint that prevents accidental main-branch modifications. The worktree isolation is verified before any review begins.
- **Scope Blast**: Expands the review surface beyond the immediate diff to include the surrounding context — caller/callee relationships, configuration dependencies, integration points, and side effects. A change that looks correct in isolation may be incorrect in the context of how it is used.
- **CLI/Skill/Plugin Surface Review**: Reviews the external interface that the change exposes — command-line interfaces, skill triggers, plugin APIs, and configuration schemas. Many bugs escape detection because they are in the interface layer that reviewers assume is stable.
- **Consistency Review**: Verifies that the change is consistent with existing patterns in the codebase — naming conventions, error handling approaches, logging levels, test coverage patterns. Inconsistency is not just a style issue; it is a correctness issue, because future maintainers will assume patterns are consistent and will be misled.

**Key Constraints**:

- **No auto-approve**: The review must explicitly cover each review surface. Skipping a surface is flagged.
- **Worktree verification**: The agent must confirm the worktree status before review begins. Any operation on the main branch is a hard stop.
- **Evidence-based findings**: All findings must be backed by specific evidence — line numbers, actual output, or runtime behavior. "This looks wrong" is not a valid finding; "this line produces X output when it should produce Y" is.

### 4.4 /ui — Distinctive UI Generation with Screenshot-Driven Iteration

**Purpose**: Generate distinctive, non-generic user interfaces with a screenshot-driven iteration loop that grounds the AI in what the output actually looks like, not what the prompt describes.

**The Core Problem /ui Solves**: AI-generated UI has a recognizable aesthetic — clean, generic, and indistinguishable from every other AI-generated interface. This is not because AI cannot produce good design, but because **generative models optimize for "looks like a well-designed interface" based on training data patterns**, not for distinctive, contextually appropriate design. `/ui` breaks this pattern by enforcing a screenshot-driven feedback loop.

**How /ui Works**:

1. **Generate**: Produce an initial UI based on the design brief.
2. **Screenshot**: Capture a screenshot of the generated output. This is not optional — it is the core mechanism that grounds the iteration.
3. **Evaluate**: Evaluate the screenshot against the design brief and against established UI quality criteria (hierarchy, contrast, spacing, typography).
4. **Refine**: Produce an updated version that addresses the evaluation findings.
5. **Repeat**: Continue the screenshot-evaluate-refine loop until the output meets the design brief.

**Why Screenshots Change Everything**: When an AI agent evaluates its own UI output based on a text description, it is operating entirely within the generative model's pattern-matching space — it is predicting what "good UI" looks like based on training data. When the agent must evaluate a screenshot, it is forced to compare the **actual pixel output** against the design brief. This grounds the evaluation in reality and breaks the self-referential loop of "generating and evaluating in the same modality."

**Distinctiveness Criteria**: `/ui` includes explicit criteria for evaluating whether the generated UI is distinctive, not just technically correct. Generic UI passes a basic review but is flagged for lack of character, unexpected visual choices, or failure to match the intended mood or brand.

### 4.5 /learn — Six-Phase Research Workflow

**Purpose**: Conduct thorough, multi-phase research that produces well-structured, substantiated output rather than surface-level summaries. The goal is to move from "read a bunch of things" to "understand a topic deeply enough to write about it."

**The Core Problem /learn Solves**: AI agents produce excellent first-pass summaries and poor deep research. Given a list of sources, they can synthesize a coherent overview in seconds. But that overview is typically surface-level — it covers what the sources say without understanding why they say it, what evidence backs their claims, or where the disagreements between sources are. `/learn` enforces a deep research discipline that cannot be skipped.

**How /learn Works — The Six Phases**:

1. **Collect**: Gather source material — papers, documentation, blog posts, discussions, code. The collection phase is not just "find relevant things" — it includes evaluating source quality, relevance, and perspective. The output of this phase is a **source matrix** that categorizes sources by topic, credibility, and relationship to the research question.
2. **Digest**: Read each source deeply enough to understand its core claims, evidence, methodology, and limitations. The output is a set of **source summaries** that go beyond the abstract — capturing the actual argument structure and the weaknesses as well as the strengths.
3. **Outline**: Produce a research outline that organizes the digested material into a coherent structure. The outline defines the narrative arc of the research output — what question is being answered, what evidence is relevant, what counterarguments need to be addressed.
4. **Fill In**: Execute the outline by writing each section. This is not just expanding bullet points — it requires connecting sources, identifying gaps in the evidence, and restructuring the outline when the evidence does not support the planned structure.
5. **Refine**: Review the filled-in draft against the original research question and against the source material. Are the claims supported by evidence? Are counterarguments fairly represented? Is the structure logical? Refinement may reveal that the outline needs to be revised, which may require returning to earlier phases.
6. **Publish**: Produce the final output — formatted, cited, and ready for delivery. The publish phase includes final quality checks: citation accuracy, internal consistency, and readability.

**Key Constraints**:

- **No shortcuts**: Each phase must be completed before the next begins. The "fill in" phase cannot begin before the outline is complete. The outline cannot be complete if the digest phase revealed gaps that require additional collection.
- **Source matrix requirement**: The collection phase must produce a source matrix, not just a list of URLs. The matrix is the evidence that the collection was systematic, not random.
- **Evidence standard**: All claims in the final output must be traceable to specific sources with specific evidence. "Most experts believe X" is not acceptable if the sources say "Expert A believes X, Expert B believes Y, and Expert C is non-committal."

### 4.6 /read — Platform-Aware Document Reading with Routing

**Purpose**: Read and process documents with an understanding of the target platform — not just extracting content, but understanding how that content should be formatted, presented, and structured for its destination.

**The Core Problem /read Solves**: AI agents can extract text from documents, but they often fail to understand **what to do with the text after extracting it**. A document that is well-structured for a blog post is poorly structured for a presentation. A technical specification that is readable in isolation requires additional context when embedded in a larger document. `/read` routes documents to the right processing path based on their target platform.

**How /read Works**:

The skill operates through a **routing engine** that examines the document and determines the appropriate processing path:

- **Technical Documentation**: When the target platform is technical documentation, `/read` extracts structured content — API references, configuration schemas, code samples — and formats them according to the target documentation standard.
- **Blog/Article**: When the target is a blog or article, `/read` extracts the narrative content and evaluates it for readability, pacing, and structural clarity. It flags sections that would benefit from restructuring for a reading audience.
- **Knowledge Base**: When the target is a knowledge base or wiki, `/read` extracts factual content and structures it for discoverability — adding cross-references, tagging for searchability, and identifying prerequisite knowledge.
- **Presentation**: When the target is a presentation, `/read` identifies the key points that translate to slides and flags content that requires visual explanation or live demonstration rather than text.

**Platform Awareness**: The routing is not just about output format — it is about **what content is relevant**. A technical document read for a knowledge base extraction treats "implementation details" differently from a document read for a presentation preparation. `/read` uses the target platform to filter and prioritize content appropriately.

### 4.7 /write — Natural Writing in Chinese and English

**Purpose**: Produce natural, contextually appropriate written content in Chinese and English — not AI-generated-sounding text, but writing that reads as if written by a skilled human who understands the topic and the audience.

**The Core Problem /write Solves**: AI-generated text is recognizable. It has specific tells — over-qualified sentence structures, overuse of passive voice, predictable paragraph organization, and a consistent "authoritative but empty" tone. These tells are not fatal flaws, but they undermine the credibility of the content and signal to readers that they are consuming AI output. `/write` enforces natural writing patterns that avoid these tells.

**How /write Works**:

The skill focuses on **voice and audience fit**:

- **Voice Consistency**: The written output maintains a consistent voice throughout — not just consistent tense and point of view, but consistent register, rhythm, and level of technical detail appropriate to the expected audience.
- **Audience Fit**: The writing is calibrated to the target audience's expertise level, not the author's. Technical content for a general audience is written differently from technical content for specialists. `/write` enforces appropriate simplification without condescension and appropriate precision without jargon without explanation.
- **Structural Clarity**: The writing is organized for readability — not just logical organization, but visual hierarchy, paragraph rhythm, and transition quality. A well-structured document can be skimmed and still communicate its key points.
- **Bilingual Capability**: `/write` handles both Chinese and English with native-quality output in each language. This is not just translation — it is understanding the rhetorical conventions of each language and producing content that feels natural to readers accustomed to each.

**Key Constraints**:

- **No filler phrases**: The output does not contain filler phrases that pad length without adding meaning ("It is worth noting that...", "It is important to understand that...").
- **Active voice default**: Passive voice is used only when the actor is genuinely unknown or irrelevant.
- **Evidence-based claims**: All factual claims are backed by evidence, and the writing distinguishes clearly between established facts, reasoned arguments, and speculative projections.

### 4.8 /health — Six-Layer Agent Health Audit Framework

**Purpose**: Conduct a systematic audit of an AI agent's health across six layers — from the model's reasoning to the integration with its environment — to identify degradation, misconfiguration, or capability drift before it causes production problems.

**The Core Problem /health Solves**: AI agents can degrade over time without obvious symptoms. A model update that improves performance on benchmarks may degrade performance on specific edge cases relevant to a production system. A configuration change that improves throughput may introduce subtle correctness regressions. Without a systematic audit framework, these degradations are discovered in production, not in testing.

**How /health Works — The Six Layers**:

1. **Reasoning Layer**: Evaluates the agent's logical reasoning — does it follow valid chains of inference, or does it skip steps? Does it recognize when it is uncertain, or does it confidently assert incorrect conclusions? Testing: structured reasoning problems with known answers.
2. **Context Layer**: Evaluates the agent's context management — does it maintain relevant context across a session, or does it lose track of earlier parts of the conversation? Does it appropriately prioritize recent context over older context? Testing: multi-turn problems that require recalling and building on earlier results.
3. **Tool Layer**: Evaluates the agent's tool use — does it correctly invoke tools with the right parameters? Does it handle tool errors gracefully? Does it verify tool output rather than blindly trusting it? Testing: tool interaction scenarios with injected errors and edge cases.
4. **Integration Layer**: Evaluates the agent's integration with its environment — does it correctly read and write files in the expected locations? Does it respect project structure and conventions? Does it handle concurrent access safely? Testing: integration tests against the actual project environment.
5. **Output Layer**: Evaluates the agent's output quality — is the output format correct? Is it complete (no truncated responses)? Does it match the expected structure for downstream consumers? Testing: output validation against known-good schemas.
6. **Safety Layer**: Evaluates the agent's safety posture — does it appropriately refuse dangerous requests? Does it maintain data confidentiality? Does it produce outputs that could cause harm if misinterpreted? Testing: adversarial scenarios designed to probe safety boundaries.

**Key Constraints**:

- **Complete coverage**: All six layers must be evaluated. Skipping a layer is flagged.
- **Evidence-based scoring**: Each layer's health score must be backed by test results, not impressions.
- **Trend tracking**: Health scores are tracked over time to detect degradation trends before they become critical.

---

## 5. Installation Tutorial

Waza supports multiple AI agent platforms through native plugin integrations. This section covers the installation process for each supported platform.

### 5.1 Quick Start with NPX

The fastest way to use Waza is through the NPX command, which downloads and executes the framework without requiring a full installation:

```bash
npx waza [command]
```

This is useful for trying Waza or for one-off usage where a full installation is not warranted. For regular use, a native plugin installation is recommended.

### 5.2 Claude Code Integration

Claude Code is Anthropic's official CLI tool for running Claude in a terminal environment. Waza integrates with Claude Code through the native plugin system.

**Installation**:

```bash
claude plugin install tw93/waza
```

**Activation**: After installation, Waza skills are available as slash commands within any Claude Code session. Type `/` followed by the skill name to invoke it.

**Configuration** (optional): Create a `~/.waza/rules` file to customize default behaviors:

```bash
# ~/.waza/rules
export WAZA_STRICT_MODE=true
export WAZA_LOG_LEVEL=info
```

**Verification**:

```bash
claude plugin list | grep waza
```

### 5.3 Codex Integration

OpenAI's Codex CLI supports Waza through its plugin interface.

**Installation**:

```bash
codex plugin install https://github.com/tw93/Waza
```

**Activation**: Waza slash commands become available in Codex sessions after installation.

**Configuration** (optional):

```bash
# ~/.codex/config
waza.strict=true
waza.logLevel=info
```

### 5.4 Claude Desktop Integration

For desktop usage through the Claude desktop application, Waza installs as a native application plugin.

**Installation**: Open Claude Desktop settings, navigate to Plugins, and search for "Waza." Click Install.

**Activation**: Restart Claude Desktop after installation. Waza skills appear in the slash command menu.

### 5.5 Pi Integration

Pi (the personal intelligence agent from Anthropic) supports Waza through its skill extension system.

**Installation**:

```bash
pi install waza
```

**Activation**: Skills are automatically registered and available through Pi's command interface.

### 5.6 Statusline Integration

Waza includes a statusline component that provides real-time feedback on active skill state, execution progress, and constraint violations. To enable the statusline:

```bash
# Add to your shell rc file (~/.bashrc, ~/.zshrc, etc.)
export WAZA_STATUSLINE=true
```

The statusline appears automatically when a Waza skill is active and displays:

- Current skill and phase
- Execution progress (phases completed / total phases)
- Active constraint count
- Any hard rule violations

### 5.7 Optional Rules

Waza supports optional rules that can be enabled to enforce stricter behavior. These are available in the `~/.waza/rules` configuration file:

```bash
# Optional strict rules
export WAZA_STRICT_THINK=1        # Enforce complete phase output in /think
export WAZA_STRICT_HUNT=1         # Enforce 3-hypothesis hard stop in /hunt
export WAZA_STRICT_CHECK=1        # Require all review surfaces in /check
export WAZA_STRICT_HEALTH=1       # Require all six layers in /health audit
export WAZA_LOG_EVIDENCE=1        # Log all evidence used in conclusions
```

These rules are disabled by default because they may slow down execution in low-risk scenarios. Enable them as your confidence in the workflow grows.

---

## 6. The Trilogy: Kaku, Waza, and Kami

Waza exists as part of a three-part ecosystem developed by tw93. The trilogy — Kaku, Waza, and Kami — represents a complete AI-augmented engineering workflow, with each component serving a distinct role.

### 6.1 Kaku — The Code Writer

**Kaku** (Japanese for "write" or "draw") is the code production component of the trilogy. It is responsible for writing code that follows engineering standards — correct syntax, proper structure, appropriate error handling, and consistency with the project's existing patterns.

Kaku is the component that most AI coding assistants resemble. Given a specification, it produces implementation. The critical difference is that Kaku is designed to work **within the discipline enforced by Waza** — it receives design validation from `/think` before writing, it receives root cause analysis from `/hunt` before fixing, and it receives review from `/check` before shipping.

### 6.2 Waza — The Habit Driller

**Waza** (Japanese for "technique" or "art") is the discipline layer. Its role is not to produce output, but to ensure that output is produced correctly. It is the forcing function that prevents Kaku from taking shortcuts and the framework that prevents engineers from relying on AI's capability without its own structural discipline.

The "habit driller" role is distinct from both code production and document writing. It is the bridge between having the ability to produce output and having the discipline to produce good output consistently.

### 6.3 Kami — The Document Shipper

**Kami** (Japanese for "paper" or "god") is the document production and delivery component. It is responsible for producing structured, platform-aware documents — not just writing content, but understanding where that content will live and how it will be consumed.

Kami works with `/learn` (research), `/read` (document processing), and `/write` (content production) to produce documents that are well-researched, properly formatted, and appropriate for their target platform. It is the final stage of the trilogy — the component that takes disciplined engineering work and packages it for delivery.

### 6.4 How the Trilogy Works Together

The trilogy's value is greater than the sum of its parts because each component constrains the others:

- **Kaku** writes code, but only after **Waza's** `/think` has validated the design.
- **Kaku** fixes bugs, but only after **Waza's** `/hunt` has identified the root cause.
- **Kaku** ships code, but only after **Waza's** `/check` has reviewed it.
- **Kami** produces documents, but only after **Waza's** `/learn` has researched the topic.
- **Kami** reads documents, but only through **Waza's** `/read` with appropriate platform routing.
- **Kami** writes content, but only through **Waza's** `/write` with natural voice and audience fit.

The trilogy is not three separate tools that happen to be installed together. It is a **workflow architecture** where each component is designed to be used within the discipline framework provided by Waza.

---

## 7. Five Core Insights

### 7.1 AI Needs Structure, Not More Capability

The most important insight behind Waza is that **the primary bottleneck for AI agent effectiveness is not capability — it is structure.** AI agents are already extraordinarily capable. What they lack is a framework that ensures they use that capability in ways that produce correct, maintainable, production-ready output.

Adding more capability to an AI agent without adding structure is like giving a talented but undisciplined engineer more time — they produce more output, but not necessarily better output. The framework that produces better output is not "be more talented" — it is "follow the discipline that has been validated by years of engineering experience."

Waza's approach is to **encode engineering discipline as structural constraints** that cannot be bypassed through prompting. This is a fundamentally different philosophy from the "better prompts = better output" approach that has dominated the AI tooling landscape.

### 7.2 Engineering Habits Are the Best Prompt Engineering

**Engineering habits are compressed problem-solving patterns that have been validated against real failure.** They represent the distilled experience of thousands of engineers who have made mistakes, diagnosed them, and incorporated the lessons into their workflow.

When you encode a habit into an AI workflow, you are not just adding a constraint — you are importing the collective engineering experience that produced that habit. `/think` does not just say "validate design before coding." It encodes the specific discipline that senior engineers follow when they approach a design problem: define requirements, consider alternatives, evaluate trade-offs, document decisions, validate against constraints.

This is why Waza's habits are more effective than hand-crafted prompts for equivalent scenarios. A prompt is written by someone trying to think through what good behavior looks like. A habit is extracted from someone who has already failed and learned.

### 7.3 Less Is More

Waza's "8 skills, each with one trigger" design is not a limitation — it is a **scalability strategy.** The smaller the surface area of a framework, the more reliably it gets used. Engineers who install complex agent frameworks with dozens of skills, hundreds of configuration options, and intricate integration requirements often end up using none of them because the friction of engagement outweighs the benefit.

8 skills that are actually used produce more engineering value than 80 skills that are installed but never invoked. The constraint of one trigger per skill forces the design to be clean enough that the engineer always knows which skill applies to the current situation.

This principle extends beyond Waza's design to its operational philosophy: **the most effective AI agent discipline is the one that is actually followed.** A simple framework that is used consistently beats a comprehensive framework that is abandoned after a week of configuration frustration.

### 7.4 Real Failures Make the Best Rules

Every hard constraint in Waza is backed by a real failure. The "stop after three failed hypotheses" rule in `/hunt` exists because someone spent three days proposing and testing hypotheses that were all wrong, and the lesson was "when you have eliminated all the hypotheses that are consistent with the evidence, the problem is probably in the evidence, not the hypotheses."

This empirical grounding is what distinguishes Waza's rules from theoretical best practices. Theoretical best practices are valuable, but they are often violated in ways that "don't count" — the engineer convinces themselves that this case is an exception. Real-failure rules are harder to violate because the person who wrote the rule has already tried the exception and paid for it.

Waza's documentation philosophy is to **always explain why a rule exists**, not just what the rule is. When engineers understand the failure that produced a rule, they can make informed judgments about when the rule applies and when it does not — which is exactly the kind of judgment that produces good engineering outcomes.

### 7.5 Tools and Humans Share the Same Philosophy

The final insight is a philosophical one: **the discipline that makes humans better engineers is the same discipline that makes AI agents better engineering partners.**

Humans become better engineers not by learning more, but by developing habits that prevent known classes of mistakes. They validate design before coding not because they lack the ability to code, but because they have learned (usually through failure) that coding without validated design produces expensive rework. They investigate root cause before fixing not because they lack the ability to propose fixes, but because they have learned that symptom-directed fixes produce the fix-deploy-regress cycle.

Waza applies exactly the same philosophy to AI agents. The AI agent that follows validated engineering discipline is not less capable than the AI agent that generates freely — it is more effective, because it avoids the classes of failures that discipline is designed to prevent.

This is why Waza's framework is not about "making AI agents smarter." It is about "making AI agents more disciplined." And the interesting implication is that the discipline that works for AI agents is the same discipline that works for humans — because the underlying structure of good engineering is independent of whether the engineer is made of carbon or silicon.

---

## 8. Resources

### 8.1 Official Resources

- **Waza Repository**: `https://github.com/tw93/Waza`
- **Kaku Repository**: `https://github.com/tw93/Kaku`
- **Kami Repository**: `https://github.com/tw93/Kami`
- **Waza Ecosystem Documentation**: Available in respective repositories

### 8.2 Related Frameworks and Projects

- **Loop Engineering** (Cobus Greyling): Loop engineering framework for autonomous AI agent workflows — foundational to understanding the discipline-layer philosophy that Waza builds upon. `https://github.com/cobusgreyling/loop-engineering`
- **Claude Code**: Anthropic's official CLI for Claude — Waza's primary supported platform. `https://docs.anthropic.com/en/docs/claude-code`
- **Open Interpreter**: Open-source AI coding agent with extensible architecture — useful for understanding the broader AI coding tool landscape.
- **Graph Engineering Guide** (AI Builder Club): Guide on multi-agent graph architectures — relevant for understanding how discipline frameworks like Waza fit into larger agent orchestration systems.

### 8.3 Concepts Referenced in This Article

- **Agent Skills**: Executable workflow units that encode professional discipline as AI-operable commands
- **Hard Constraints**: Non-negotiable rules that, if violated, invalidate the skill's output
- **Outcome Contracts**: Pre-defined criteria for successful completion of a skill phase
- **Worktree Safety**: The practice of operating on isolated branches, never on the main line
- **Evidence Ladder**: Systematic progression from runtime observation to root cause identification
- **Scope Blast**: The practice of expanding investigation beyond the immediate failure to cover the full affected surface area
- **Bisect Mode**: Systematic narrowing of a search space by dividing it in half and determining which half contains the failure

---

*This article is part of the TopDigg Research Team's ongoing analysis of AI agent frameworks, engineering productivity tools, and the evolving landscape of AI-augmented software development. For related analyses, see our deep dives on Loop Engineering and Graph Engineering.*
