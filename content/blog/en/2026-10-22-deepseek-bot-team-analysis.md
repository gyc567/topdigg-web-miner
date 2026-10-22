---
title: "DeepSeek-Bot Deep Dive: Turning DeepSeek Harness into an AI Team with Long-Term Memory"
date: "2026-10-22"
description: "A deep dive into the open-source DeepSeek-Bot project: a long-running AI Bot team built on DeepSeek Harness. Covers the project overview, context steward, handoff tree, three-tier permission model, memory architecture, and a full install and deployment tutorial."
author: "瑞哥观势"
tags:
  - DeepSeek
  - Multi-Agent
  - AI Agent
  - Open Source
  - Context Management
  - Long-Term Memory
categories:
  - Open Source Project Analysis
  - AI Agent
---

# DeepSeek-Bot Deep Dive: Turning DeepSeek Harness into an AI Team with Long-Term Memory

## Introduction: A Question Nobody Stops Asking

Almost everyone who uses AI coding tools has hit the same scenario:

You ask it to write a feature. It gets halfway there, you say "wait, this part is wrong," and it fixes it. You say "still a problem," and it fixes it again. By the seventh round, you notice it has forgotten your very first requirement, and the whole line of thinking starts to drift.

So we invented a pile of patches: write longer system prompts, paste context manually every round, start a new session every so often, let the model summarize for itself... every patch is itself a patch on top of a patch.

The DeepSeek-Bot project is essentially doing the same thing, but its answer isn't "patch an Agent." It's to **change the level of abstraction**: stop treating the AI as a session that talks continuously, and start treating it as a **team member with an identity, a memory, and coworkers**.

That's the most worth studying part of this project.

---

## 1. Project Overview: What It Actually Is

**DeepSeek-Bot (short for DS Bot)** is a plugin and desktop application built on top of [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) (DSH). Its official definition says it in one line:

> A long-running team of Bots.

### 1.1 Two Forms

| Form | Description |
|---|---|
| `ds-bot` plugin | A standard DSH plugin that runs in DSH Desktop and DSH Web. All Bot capabilities live here |
| DS Bot desktop app | Open it and you're in DS Bot. It ships with a locked DSH version, its own profile and data directory, imports the team you already have in DSH, and installs DSH-compatible plugins, forming its own plugin ecosystem |

Both forms run **the same** `ds-bot` plugin code. The point of the desktop app is that DS Bot owns its profile, its interface, and the DSH version, so it is no longer bound by DSH's generic UI and global settings.

### 1.2 Ten Core Requirements (the Official Vision)

The project lists ten core requirements in `docs/vision.md`, which basically amount to its design constitution:

1. **Built on DSH, independent of each other.** Every Bot is based on DSH, and Bots do not interfere with one another.
2. **Reliable.** A Bot stays aligned with the goal, acts on evidence, does not overstep, and produces checkable results.
3. **Memory and persistence.** Bots have long-term memory. A Bot can read other Bots' memory but not modify it (only the Main Bot can), and a group chat shares a single memory.
4. **Tiered permissions.** The Main Bot has the highest permissions (create and modify other Bots); other Bots do not have them. Only the user can delete a Bot.
5. **Group chat.** Group chat is the primary form of Bot collaboration. It can have an admin Bot, and by default the admin answers user messages.
6. **Working folder.** Each Bot has its own working directory; a group chat can set one for all members.
7. **Browser.** Each Bot has its own browser, unaffected by the others.
8. **Interface and motion.** A polished interface and smooth animation.
9. **Standalone app.** DS Bot should become a standalone app and not concede too much to DSH.
10. **Local agents.** A local agent CLI can be plugged in and used as a Bot (planned).

### 1.3 Project Scale

| Metric | Value |
|---|---|
| License | Apache 2.0 |
| Current version | v0.2.0 (released 2026-10-21) |
| Depends on DSH | 0.2.1-rc.2 |
| host-side code | 106 files, about 12,500 lines |
| client-side code | about 14,400 lines |
| Unit tests | 93 test files |
| Design docs | 11 Chinese design drafts (`docs/plans/`) |
| Known issues | 3 (`docs/known-issues.md`) |

**Pay attention to this ratio: 900-plus lines of design docs, 27,000 lines of code.** The ratio itself is a signal — the complexity of this project isn't in writing code, it's in working out exactly how Bots should collaborate.

---

## 2. Design Philosophy: Six Ideas I Think Are Genuinely Great

This section is the core of the article. Many of the designs in the project docs made me want to applaud after reading them.

### Idea One: The Context Steward — Not "Compression" and Not "Cutting Off," but "Judgment"

**The problem**: Bots are long-lived. A user chats with a Bot for weeks or months, and the context will fill up. Two common approaches are both wrong:

- **Compressing the same session over and over**: the summary of the summary gets vaguer and vaguer, and details are lost for good.
- **Hard-cutting a new session at the line**: work in progress gets severed, and the Bot looks amnesiac.

**DS Bot's approach**: a Bot is **one long-lived, unchanging identity**, and its conversation is composed of multiple DSH Sessions. As it approaches the limit, it wakes a lightweight **context steward** (context steward) to read the recent messages and judge one thing:

> Has the work come to a close, or is it still in progress?

- **Still in progress** → compact in place into a **checkpoint**: a handoff summary plus the verbatim text of the user's recent messages. Work continues, uninterrupted.
- **Wrapped up** → the Bot writes its own handoff note and switches to a new segment to continue.

**Where is this design brilliant?**

The steward doesn't judge by token count; it judges by **semantics**. It is explicitly required to "check item by item what the user asked for against what the Bot actually did, and whether the Bot asked the user something that hasn't been answered yet." Even if the Bot itself says "I'm done," as long as one sub-item is unfinished, the verdict is "still in progress."

There's also one counterintuitive but particularly correct rule:

> **The more times you've compacted, the more you should treat a reasonable pause as the end of a stretch.** Because a summary of a summary loses more.

This is a quantified understanding of "compaction loss," and it is far smarter than the intuitive "each compaction loses a little."

**How it feels to the user**: completely invisible. There's no "context is 80% used" notice and no "switch session" tool. What you see is one continuous conversation.

**Engineering details** (these details are what prove this isn't a slide-deck project):

| Item | Value |
|---|---|
| Window W | the model's declared `contextWindow`; 500,000 if undeclared |
| Usable U | W minus the reply reserve (`maxTokens`), no less than W/2 |
| Hard line H | 0.95 × U |
| Check line C | `checkRatio` × U (default 0.8), not exceeding H |
| Messages the steward sees | roughly the most recent 6,000 tokens, max 1,500 characters per message |
| Steward output | one line of JSON: `{"action":"switch"|"compact","reason":"…"}` |

**No token count is hardcoded anywhere in the code** — everything follows the model. That's an extreme form of the principle "never hardcode numbers for a particular model."

**One safety detail**: if the steward fails or can't answer, it just switches segments. No guessing.

### Idea Two: The Handoff Tree — Turning a "Message Chain" into a "Work Tree"

This is, in my view, **the single most valuable design in the entire project**.

**The problem**: early on, handing off work between Bots was blocked by counts. And the result was?

- **Bots couldn't see what the other side was doing.** `list_bots` gives only names, roles, models, and folders. Send five messages and you get five "delivered" and zero replies.
- **The other side refuses messages it hasn't read.** When the recipient has 10 unread messages, it refuses outright — and the sender has no idea why.
- **Count-based blocking can't tell normal traffic from spinning.** The message chain was cut at 6 hops, the whole team could send at most 40 messages after the user's last turn, and a Bot could start at most 3 rounds in one group. The result: long handoff chains where every step changes hands and yields a result got severed at the 7th hand, while an A→B→A loop had to run the full 6 hands before stopping.

**DS Bot's solution: model the "work" as a tree.**

> If the work handed down hasn't come back yet, the reply above doesn't get handed up; once everything below has come back, the upper level continues, and when it's done it hands up together with the results below.

**Results climb on their own.** A Bot doesn't need to send a follow-up message upstream, so **there's no need to defend against loops via hop counts or message counts.** Hence:

> **The 6-hop message chain, the recipient's 10-message unread cap, the 3-round cap per Bot per group, and the 40-message team-wide cap after the user's last turn — all removed, with no fallback left in place.**

This is the most aggressive and also the most correct decision in the entire design doc, in my view. **Upper bounds were never a solution; they were a band-aid that hid the problem.** Once the structure is right, many limits simply cease to be necessary.

Two more things were done to go with this design:

**1. State is a first-class citizen.** Each Bot's state is one of five: waiting for user approval / switching to a new session / working / waiting on another Bot / idle. `list_bots` returns them all at once, along with unread message counts and question-card status.

**2. Only one kind of message is blocked.** The only message rejected is "sending to a Bot that is waiting for the result of this very work" — because the result will be handed back automatically, so sending it is both a loop and redundant. Everything else is allowed, and it's fine for the same Bot to appear several times in one piece of work (the relay chain of design, review, rework, and acceptance).

**Unread messages are merged into one**: when X sends Y a message that Y hasn't read and X sends another one (for the same work), the two are merged. That way **each sender has at most one unread message in the recipient's inbox**, the root cause of pile-up is eliminated, and therefore the cap becomes unnecessary too.

### Idea Three: Three-Tier Permissions — Role Permissions and Sandbox Permissions Thoroughly Separated

This is where many multi-agent projects get muddy; DS Bot keeps it clean.

**Two mutually independent layers of permission**:

- **Role permissions**: who can manage Bots, groups, and team memory. **Checked by DS Bot itself.**
- **Sandbox permissions**: what a Bot's tools can touch (read files, modify files, run commands). **Enforced by DSH using the permission presets DSH provides.**

| Who | Scope | What they can do |
|---|---|---|
| User | Everything | Every operation, including setting/unsetting the Main Bot and setting sandbox permissions |
| Main Bot | The whole team | Create Bots, modify any Bot, stop another Bot's turns; create, modify and delete groups; write team memory; read and write other Bots' memory; attach the summarize capability |
| Group admin | The groups it manages | Modify its own group; speak in the group; write team memory. Cannot delete a group, cannot change a group's working folder |
| Ordinary Bot | Itself | Change its own name, role, color, model, working folder, instructions; attach the summarize capability to itself; speak in groups and `@` mention; in private chat use `message_bot` to message any Bot |

**Three extremely critical design details**:

1. **Only the user can set sandbox permissions.** Any modification initiated by a Bot is rejected outright, and neither `update_bot` nor `update_group` has such a parameter. A Bot cannot escalate its own privileges.
2. **When a Bot oversteps, tell it what to do** instead of simply erroring. The tool returns "only the Main Bot can create Bots, please have the Main Bot do it" — so the Bot can reroute itself instead of deadlocking.
3. **"Full permissions" is always shown in red in the UI**, and it takes one more confirmation to set.

### Idea Four: Three Layers of Memory — Context Governs "What We're Doing This Turn," Memory Governs "What Should Be Remembered Across Conversations"

These two lines are kept very distinct:

| | Context | Memory |
|---|---|---|
| Governs | what this conversation is doing | what should be remembered across all conversations |
| Maintained by | the context steward (decides compact/switch) | model curation (after each conversation goes idle) |

**The key design of memory**:

**Three scopes**:
- each Bot has its own memory
- each group chat has a group memory, **read only inside that group**
- team memory, read by all Bots

**"What was said in the group stays in the group"**: group memory only enters the group sessions of that group's members, never their private chats, never other groups, and never Bots outside the group. Once a member is removed from the group, it immediately can neither read nor write.

**Memory can't rely on the Bot happening to remember to call it.** After each conversation goes idle there is one automatic "memory curation" pass: the model reads what was added during that conversation and, like a person after a conversation, keeps, modifies, or deletes entries. Private chats are curated by the Bot's own model and written into its own memory; group chats are **curated once per group** (not once per member), using the admin's model, and written only into the group memory.

**Extremely simple format**: it reuses Agent MemoryRepo's Markdown format, one entry per line, with a trailing `[source: …; added: …]`.

**Fixed size caps** (in characters): 300 per entry, 4,000 for `MEMORY.md`, 16,000 per topic, 40 topics per scope. Exceeding a cap fails outright and tells you how to make room.

**Safety**: memory is data, not instructions. Entries that look like keys are rejected; Bots are explicitly told not to save web pages, files, or tool results that "ask them to remember it."

**Cache friendliness** (this detail is very professional): on the first render of each Session the memory section is frozen, after which the prompt stays **byte-for-byte identical**, so the provider's prefix cache can hit. It's re-frozen only on a segment switch or a checkpoint (a checkpoint breaks the cache anyway). The cost is that "entries saved after a conversation has begun don't appear in that conversation's prompt" — so the prompt explicitly requires the Bot to **call `recall` before answering "I don't know."**

**Memory isn't managed with git**: files are modified in place, and `journal.jsonl` records what each change replaced.

### Idea Five: The Security Model — The Web Is Untrusted, Keys Must Not Leak

> **The browser is operated by the user; the Bot can only read. Key values are entered only by the user and exist only on this machine. The Bot only ever gets the environment variable name; the value is replaced with a placeholder before it ever leaves the machine.**

Concretely, in the implementation:

**The Bot browser (DSH Desktop only)**:
- One storage partition per Bot (`bot:<id>`); login states don't leak between Bots
- `read_browser` reads the **DOM, not a screenshot**, converts it to Markdown, and marks links and controls as `[#n]`
- **Only visible content is read**: `display:none`, `visibility:hidden`, zero-height, and collapsed `<details>` content are all skipped
- **Never reads** passwords, credit cards (`autocomplete="cc-*"`), or one-time-code fields
- Hard caps: 400,000 characters, 150,000 nodes, 5,000 rows per table, 3,000 links, 1.5 seconds
- **Cannot click, cannot type, cannot scroll, cannot open URLs**
- Page content is **always treated as data, never as instructions**
- Cloud host metadata addresses (`169.254.x.x`) are forbidden — they issue account credentials

**Secrets**:
- The Bot calls `request_secret`, the user types the value into a card in their own chat, and **the Bot never sees the value**
- Values are stored in `secrets.json`, permission 600, written atomically, and never enter `state.json` or the logs
- Injected via the `$DSH_SECRET_<NAME>` environment variable
- Before tool results are saved and before every request is sent to the model, the value is replaced with `[secret:<NAME>]`
- Short values under 8 characters (PINs) are only replaced when they "stand alone," so ordinary text isn't collaterally damaged
- An explicit, honest warning: **only exact copies are masked; a Bot that encodes, splits, or reverses the value can still print it. Don't hand important secrets to a Bot you don't trust.**

**Web search**:
- Never borrows another route's key (every key is billed to its own account)
- When native search is unavailable, it falls back to a keyless method (scraping Bing / DuckDuckGo public result pages and parsing them)
- Every result begins with `Search backend: …` saying which path was used
- If everything fails, it tells the model **not to guess URLs**

### Idea Six: View Cards — Vetoing "The Model Writes HTML"

This is a design that took two rejections from external reviewers to settle, worth its own paragraph, because it represents a **modern way of thinking about safe design**.

**First version**: the model writes HTML, rendered in an iframe. **Rejected**. Reasons:

- Arbitrary HTML has no compressed serialization strategy: the context steward and the handoff package either overflow or lose everything
- An iframe loses its internal state the moment it's unmounted in the chat's virtual scrolling
- **Model-generated scripts can auto-submit, causing a turn-hijack infinite loop**
- Opening a GET route for widget content and configuring CSP depend on undocumented DSH capabilities, so the plugin bears the risk

**Second version (current)**: **model-generated code is never executed.**

> The model only picks components from a fixed catalog and fills in data; rendering uses DS Bot's own components. **Security comes from "there is no code execution," not from a sandbox.**

The first version's component catalog has 8 entries: `stack` (vertical container), `text` (Markdown text), `metric` (metric), `table` (read-only table), `options` (options), `confirm` (confirmation), `form` (short form), `progress` (progress snapshot).

Hard caps: 8 KiB serialized, component tree depth 8, 64 nodes, tables of 50 rows × 8 columns, forms with 6 fields, options with 8 choices.

**One submit settles the whole card**, and uncommitted input in other components is discarded. **Views do not enter group chat** (same caveat as `ask_user`).

> **The essential shift in safe design**: from "caging untrusted code" to "not providing a cage at all."

---

## 3. Other Details Worth Mentioning

### 3.1 Group Chat: Only One Person Speaks at a Time

Early on, members wrote in parallel and were checked for new messages before sending, and **even the vote counting went wrong**: the model would reuse the garbled numbers and send them anyway. Letting the model handle ordering doesn't work.

Conclusion: **only one person speaks at a time in a group**, and every member reads the latest group state before speaking.

Two answering modes:
- **The admin answers first** (default for new groups): ordinary messages without an `@` go only to the admin, and the admin uses `@name` to call on someone. **This is a cost consideration** — every member called on means running the model once with that member's entire conversation context, so cost grows roughly linearly with the number of speakers. Hence the default of calling on as few people as possible.
- **Everyone takes turns**: each member answers in order, admin first.

Progress visibility is done well: if a member is still working 15 seconds after its first tool call, the round continues without waiting for it; but the first thing it says while working, and anything with an `@`, **goes to the group immediately** (a few sentences less than 30 seconds apart are merged into one). The result is picked up by the Bot that assigned the work.

### 3.2 Long Messages: The Hot File Only Holds Bounded Data

Originally, messages between Bots were stored in full in `state.json`, and every save of `state.json` rewrote the entire file. A single 5-million-character `message_bot` grew it to 6.5 MB, and after that **changing a color meant rewriting all of that**.

Now:
- `state.json` stores only the first 2,000 characters + the total length + where the full text lives
- Messages over 20,000 characters are **stored as DSH attachments verbatim** (content-addressed, so identical content is stored once)
- The message keeps only a one-line description, the first 1,000 characters, and a file block
- Long lines in group history go to `bot/group-lines/<group>/<seq>.txt`; when a line is pushed out of the most recent 60, or the group is deleted, the file goes with it

### 3.3 The DSH Concessions Ledger: A Rarely Honest Ledger

`docs/plans/2026-10-13-dsh-concessions.md` records 14 "compromises made because of limitations in DSH itself." Each entry states: the date, the related Issue/PR, **DSH's limitation**, **what we do now**, **the cost**, and **how it will be handled after the desktop app**.

A few examples:

| # | DSH's limitation | What we do now | Cost |
|---|---|---|---|
| C1 | Under the PTC preset the model can only call `run_code` directly, and a single program run lasts about 10 minutes at most | Both the tool display and the server traverse sub-calls | Every tool-related feature must handle top-level and sub-calls at once |
| C2 | Commands are registered globally and can't be filtered per session | Bot sessions never support goal | `/goal` still appears in the command menu, but can't be used |
| C5 | Patch has no conditional syntax; the web search selector doesn't fall back when the id isn't registered | Documentation only | Turning off `web-search-auto` requires changing `web.searchProvider` at the same time, otherwise **`web_search` breaks for all sessions** |
| C7 | Other plugins' CSS can override ds-bot; ds-bot depends on DSH's private class names | `!important` on a few layout properties | Any DSH structural change or reskin may break the layout |
| C11 | There's no watchdog when a model's stream hangs, so the turn never ends | Unread requests are merged into one, state is visible | A hung Bot has to be stopped manually by the user |

**When deciding whether an Issue is a DS Bot bug or a DSH limitation, look at this table first.** Documentation like this is extremely rare in open-source projects, and it's one of the strongest proofs of this project's quality.

### 3.4 Hard Rules: Five

The `AGENTS.md` in the project root sets five hard rules for AI coding agents. I'll excerpt them (already translated):

1. **Built on DSH; never patch.** Never modify DeepSeek Harness, and never rely on files inside the DSH installation directory. **If a capability is missing from DSH, stop and explain; don't work around it with a patch.**
2. **No secrets.** Never write, print, or commit API keys, tokens, cookies, or the contents of `DSH_HOME`.
3. **Only original material.** Don't copy code, text, icons, logos, or graphics from other products or websites.
4. **`client.js` is a build artifact.** Change `src/client/`, then run `npm run build`; never hand-edit it.
5. **Don't touch the user's own DSH data.** Imports read `~/.dsh`; never write there.

Rules 1 and 3 are especially resonant. **"If a capability is missing from DSH, stop and explain"** — behind that sentence is restraint.

### 3.5 The Project's Own Design-Doc Review Process

Design drafts under `docs/plans/` have very explicit format requirements: **why / decided behavior / what we won't do / known limits / changes**.

The "**what we won't do**" section is the thing most projects' design docs are missing. For example:

- Group chat: **won't** do parallel speaking followed by conflict checking; **won't** do "keep going around until nobody speaks" multi-round discussions; **won't let** members hold the speaking slot with a long task
- Handoff: **won't write** state into the system prompt (for caching); **won't proactively notify** the assigning Bot that "the other side is stuck" (every notification makes the assigning Bot run the model again); **won't set** fallback caps on totals, chain length, or round count
- Memory: **won't tell** the Bot or the user how much context is used; **won't give** the Bot a tool to switch segments; **won't use** git to manage memory
- View cards: **won't render** model-generated HTML/JS; **won't introduce** iframes; **won't build** our own MCP Apps host

And design drafts go through **multiple rounds of external review with sign-off**. The change log of the widget-views draft reads:

> 2026-10-20: first draft (declarative catalog, second version). Review: Antigravity vetoed the first iframe version; Codex first review (ship with changes)…… second review (ship with changes)…… third review signed off (ship, no further changes).

**Having different AIs review the same design draft and recording each round's comments.** In the open-source projects I've seen, this is the first time.

---

## 4. Summary: My Six Judgments

### Judgment One: This Is the Mindset of "Productizing Agents," Not "Orchestrating Agents"

The vast majority of multi-agent frameworks on the market (AutoGen, CrewAI, LangGraph, and so on) care about **how to split tasks up, run them in parallel, and aggregate the results**. Their implicit assumptions are: tasks are one-off, context is short, results are to be delivered.

DS Bot cares about **how to get a group of long-lived colleagues to work together**. Every one of its designs points at that goal:

- A long-lived identity (not a task)
- Long-term memory (not one-off context)
- A handoff tree (not a task DAG)
- Group chat (not parallel workers)
- Tiered permissions (not everyone being equal)

**This is a shift from "orchestrating a process" to "running a team."** The former optimizes throughput; the latter optimizes continuity.

### Judgment Two: The Most Important Design Decision Is "Deleting Limits," Not "Adding More Rules"

Let me count the limits DS Bot **deleted** as it evolved:

- 6-hop message chain cut → deleted
- Recipient's 10-unread cap → deleted
- Bot starting at most 3 rounds in one group → deleted
- 40 messages team-wide after the user's last turn → deleted

Meanwhile the only constraint it **added** is: **don't send a message to a Bot that's waiting for the result of this work.**

**The net effect is far fewer constraints and higher reliability.** The reason is simple: what it deleted were "symptom-level" limits (counters), and what it kept was a "structure-level" constraint (the waiting relationship).

That's the flavor of good system design — **constraints should come from the structure of the system, not from counters.**

### Judgment Three: The "Context Steward" Is New Design Space Created by Better Model Capability

In traditional long-context solutions, "when to compact" is an **engineering problem** solved with token thresholds.

But when the model is smart enough, it can **read the semantic structure of a conversation** — "is this thing done?" is a semantic question, not a counting question.

So a qualitative shift appears in the design: DS Bot no longer asks "how much context is left?" It asks "**has this thing come to a close?**"

This is the most forward-looking part of the whole project, in my view. **It hands a formerly deterministic engineering problem to a nondeterministic model judgment, and designs an entire fallback suite for that judgment (on failure, switch segments).**

The same idea is used in memory curation: instead of letting the Bot decide whether to remember, **each conversation is curated once automatically at the end.** Agent behavior no longer depends on it "remembering to" do something.

### Judgment Four: The Security Thinking Is "Refusing Capability," Not "Tightening Control"

Compare the two approaches:

| Approach | Examples |
|---|---|
| Tightening control | Run the model more safely in the sandbox; add stricter CSP to HTML; add finer-grained origin checks to the iframe |
| **Refusing capability** | **Never offer the model the ability to write HTML at all**; the Bot **reads** the browser and never writes to it; **secret values never enter the model context** |

The latter is more thorough and also less work. **DS Bot chose the latter in both places**, and gave clear reasons in both cases ("security comes from the absence of code execution, not from a sandbox").

Worth noting is that it doesn't pretend to be infallible. The honest warning in the secrets section — "a Bot that encodes, splits, or reverses the value can still print it" — says plainly what the known limits are, and that is more trustworthy than any disclaimer.

### Judgment Five: Readability Is Itself Part of Architectural Quality

Look at a few of its designs:

- **`state.json` stores only the first 2,000 characters.** Because every save rewrites the whole file. This constraint comes directly from "the hot file only holds bounded data."
- **Long messages are stored as attachments.** Because DSH has `ctx.attachments`, content-addressed, with identical content stored once.
- **State isn't written into the system prompt.** Because the system prompt has to be byte-stable in order to reuse the provider's prefix cache.

These three look like three isolated technical decisions, but behind them is one principle: **put data where it belongs.** Big objects go to the filesystem, hot spots go to memory, short high-frequency items go into the prompt.

**The DSH concessions ledger, known-issues, and the "what we won't do" sections** are the same thing: **writing down the reasons for design decisions next to the code, so the people who come later don't have to re-derive them.**

### Judgment Six: It's a Hybrid of "Open-Source Project" and "Product," and It's Worth Being Cautiously Optimistic About

First, the reasons for optimism:

- Apache 2.0, complete code, 93 test files, CI runs the tests on every PR
- 11 design docs, each with a "why" and a "what we won't do"
- Three forms ship: desktop app, plugin, and Docker image
- Fast progress: from 0.1.7 to 0.2.0 took only 5 days, but the changes were enormous

Things to be careful about:

- **v0.2.0 is still a preview.** The project itself writes "Early release (v0.1). Features, tools and the saved data format can still change."
- **The desktop app is unsigned.** Windows SmartScreen will warn, and macOS requires the admin password to allow it on first launch.
- **The known issues include basics like "plugin fails to load,"** and the troubleshooting steps run long like a separate article (look at `cordis.patch.yml`, run `--dump-config`, delete the profile directory).
- **Docker deployment has only one permission preset: full permissions.** Because DSH's own kernel sandbox (bubblewrap / Landlock) can't run under Docker's default seccomp. In NAS scenarios this means **you must manually control which directories get mounted.**
- **Group chat in PTC preset sessions has a max round length of about 10 minutes**, after which it is aborted.
- **If a working folder is deleted or renamed, messages get swallowed** (DSH 0.2.1-alpha).

**Conclusion**: this is a project whose **architectural maturity far exceeds its version number**. It's safe to study and try out, but treat it as an early product, not stable infrastructure.

---

## 5. Complete Tutorial: Deploying a DS Bot Team From Scratch

### 5.1 Requirements

| Item | Requirement |
|---|---|
| Desktop app | Windows x64 or macOS (Apple silicon / Intel) |
| DSH Web | Node.js **22.19+**, pnpm |
| Docker | Docker 24+, Compose v2.24+, Linux x86-64 |
| Model | DeepSeek API key, or another Anthropic-Messages-compatible endpoint |

### 5.2 Route A: Desktop App (Simplest)

**Windows (x64)**:
1. Go to [Releases](https://github.com/Fei2411/DeepSeek-Bot/releases) and download `DeepSeek-Bot-<version>-win-x64.exe`
2. Run the installer. **Install for the current user only; no administrator rights needed**
3. If Windows shows "Windows protected your PC," click **More info** → **Run anyway**

**macOS**:
1. Download `DeepSeek-Bot-<version>-mac-arm64.zip` for Apple silicon or `mac-x64.zip` for Intel
2. Safari unzips it automatically; drag **DeepSeek Bot** into "Applications" and open it
3. When macOS says "cannot verify app": **System Settings** → **Privacy & Security** → **Open Anyway** (admin password required)

**First launch**:
1. It asks you two things: **where the data goes** (default `~/.ds-bot`) and **where the Bot's files go** (default `~/DeepSeek Bot`)
   - The two locations must not be nested inside one another, and must not be inside your DSH data
2. If it detects an existing team in your DSH, it asks whether to import. **It asks only once; the import reads your DSH and changes not a single byte**
3. Configure a model in settings
4. What opens is a Main Bot named **Chief**. Talk to it and it walks you through setup

> **Advice for first-timers**: don't rush to build ten Bots. Start by talking only to Chief, let it understand how you work, and then let it build the first specialist Bot.

### 5.3 Route B: As a DSH Plugin

Install DSH first and configure at least one model inside it. **DS Bot uses DSH's models directly.**

**DSH Desktop (Windows / macOS)**:
1. In the sidebar select **Plugins** → **Add plugin**
2. In **Package name or address** enter `ds-bot`
3. **Mainland China users**: set **Registry** to **Mainland China mirror**
4. Click **Install**, then **Enable now**
5. If it says it takes effect on next launch, **fully quit** DSH and reopen it

**DSH Web (Windows / macOS / Linux)**:
```sh
npx @deepseek-ai/dsh@0.2.1-rc.2 plugin --profile web add ds-bot
npx @deepseek-ai/dsh@0.2.1-rc.2 web
```

**Fallback when npm doesn't work** (for step 2):
- Enter the full path of the `ds-bot-0.2.0.tgz` you downloaded from Releases
- Or `github:Fei2411/DeepSeek-Bot#v0.2.0&path:/ds-bot` (requires Git)

**Checking out from source for development** (add the plugin as a linked dependency in the profile):
```json
{
  "dependencies": { "ds-bot": "link:/path/to/ds-bot" },
  "dsh": { "profile": { "bundles": ["@deepseek-ai/dsh-base", "@deepseek-ai/dsh-web-app", "ds-bot"] } }
}
```
Then run `pnpm install` in the profile directory, and launch from the deepseek-harness repository:
```sh
pnpm -s dsh --profile web --no-open
```

### 5.4 Route C: Docker Deployment (NAS / Always-On Server)

**Method 1: the compose file in the root directory (recommended)**

Edit the root `docker-compose.yml`:
- Fill in `DEEPSEEK_API_KEY`
- Add the NAS's IP to `DSH_TRUSTED_HOST`
- Set `PUID` / `PGID` to the IDs of the owners of the shared directory

```sh
docker compose up -d --build
docker compose logs ds-bot
```

The log will print a line:
```
dsh web: http://127.0.0.1:3080/?token=*** (LAN: http://172.x.x.x:3080/?token=***
```

**Mind the port**: what's printed is the **in-container** port; you need the **host port** mapped in `ports:` (the root compose defaults to **13080**). On first open, use `http://<NAS IP>:13080/?token=***`; the token will be set as a signed cookie (valid for 30 days), after which you can just visit `http://<NAS IP>:13080/`.

**Method 2: the .env approach under docker/**
```sh
cd docker
cp .env.example .env
# Edit .env: DEEPSEEK_API_KEY, DSH_TRUSTED_HOST, PUID/PGID
docker compose up -d --build
```
This method publishes **host port 3080** by default. **Pick one of the two methods; don't run both against the same data directory.**

**Prebuilt image (GHCR)**:
```yaml
services:
  ds-bot:
    image: ghcr.io/fei2411/deepseek-bot:dev
    ports:
      - "13080:3080"
    environment:
      DEEPSEEK_API_KEY: ""
      PUID: "1000"
      PGID: "1000"
      DSH_TRUSTED_HOST: "localhost,127.0.0.1"
    volumes:
      - ./data:/data
      - ./workspace:/workspace
    extra_hosts:
      - "host.docker.internal:host-gateway"
    restart: unless-stopped
    stop_grace_period: 15s
```

**⚠️ Security warning for Docker deployment (must read)**:

> DSH's own kernel sandbox (bubblewrap / Landlock) **can't run under Docker's default seccomp profile or on most NAS kernels**. So the image ships with **only one permission preset: full permissions** — every Bot command executes directly, without asking.
>
> **So: only mount into `/workspace` the directories Bots need to modify. Anything else the container can see, Bots can also modify.**

**HTTPS is strongly recommended but not enforced**: the UI runs fine over plain HTTP, but that page **is not a secure context** — the API keys and secret values you type will **cross the LAN in plaintext**. Put a reverse proxy in front for daily use.

### 5.5 Configuration Details

Plugin options live under the `bot` entry in the profile's `cordis.patch.yml`, and **all are optional**:

```yaml
- id: bot
  name: ds-bot
  config:
    workspace: /path/to/workspace   # Where Bots work; default <home>/workspace
    home: /path/to/bot-data         # Where team data lives; default $DSH_HOME/bot
    checkRatio: 0.8                 # Context ratio the steward judges against
    browser: true                   # Force the Bot browser on; default is Desktop only
    memory: true                    # false turns memory off: no memory tools, sections, or panels
    memoryReview: true              # false hands memory entirely to the Bot's own remember calls
    diagnosticsFile: false          # Error logs stay in memory only; default <home>/logs/diagnostics.jsonl
    updateCheck: true               # Check for new versions when the window opens; default true
    updateRegistry: https://registry.example/   # Only check for updates against this npm registry
    github: false                   # Hide the GitHub connector; default is to show it in Connectors
```

**About `contextWindow`**: be sure to fill in `contextWindow` for every model.

> Usable window = window − reply reserve (`maxTokens`)
> Hard line = usable window × 0.95
> Check line = usable window × `checkRatio` (default 0.8)
>
> A model with no `contextWindow` filled in gets the adapter's default value (`llm-pi-ai` is 262,144), and **that value may be wrong for the model**. A model that declares no window at all is treated as 500,000.

**Custom model endpoints** (OpenAI-compatible relays, etc.) — create `DATA_DIR/cordis.patch.yml` before first launch:
```yaml
- id: llm-pi-ai
  config:
    providers:
      relay:
        apiKeyEnv: RELAY_API_KEY
        api: openai-completions          # or openai-responses / anthropic-messages
        baseURL: http://host.docker.internal:3425/v1
        models:
          - id: my-model
            contextWindow: 131072
            maxTokens: 8192
- id: agent-default-model
  config:
    provider: relay
    model: my-model
```
Then add `RELAY_API_KEY` to the compose `environment`.

### 5.6 Developing From Source

You need Node 24, pnpm, and a deepseek-harness checkout with dependencies installed, placed next to this repository (`../deepseek-harness`, or set `DSH_HARNESS`). The Desktop test bench also needs `xvfb-run` and `ffmpeg`.

```sh
npm ci                                   # esbuild, client build only
npm run harness                          # Once only: install the DSH packages used by tests and the linter
npm run build                            # src/client → client.js
npm test                                 # Unit tests
npm run lint                             # oxlint
```

**Test benches**:
```sh
dev/bench.sh dev 3100 8800 start         # Web test bench: mock model + dsh Web
dev/desktop-linux/desktop.sh dev start   # Desktop test bench (Xvfb)
dev/check.sh                             # All checks
```

**Full check list**: `unit`, `build`, `lint`, `smoke`, `web` (screenshots of sidebar, chat, groups, Bot settings, etc.), `desktop`. About 3 minutes after the first download.

**Ports**: every script accepts `SLOT=n` (0-9, default 0); the Web bench uses `31n0` and the mock uses `88n0`, avoiding collisions when several people share a machine.

**After changing `src/client/` you must run `npm run build`** (`client.js` is a build artifact committed to the repository, and `npm test` checks whether it's stale). After changing `index.js` or `src/host/`, restart dsh.

### 5.7 Typical Usage Flow

```
1. Open DS Bot → Chief (Main Bot) appears
2. Explain how you work to Chief
3. Ask Chief to build a specialist Bot:
   "Build a Bot called Reviewer, role is proofreading,
    responsible for checking whether my document's logic is self-consistent"
4. Create a group chat so multiple Bots can collaborate:
   "Create a group called WritingGroup, members are Chief, Writer, Reviewer"
5. @-mention people in the group, or just tell the Main Bot and let it dispatch
6. When a secret is needed, the Bot shows a card; you fill it in, and it never sees it
7. Use Settings → Usage to check token consumption
```

### 5.8 Data and Backups

Data lives in `config.home`, or `$DSH_HOME/bot` if unset, and finally defaults to `~/.dsh/bot/` (on Windows, `C:\Users\<user>\.dsh\bot\`).

| File | Contents |
|---|---|
| `state.json` | The team: Bots, groups, inter-Bot messages, preferences, pending questions |
| `group-lines/` | Long group lines, one file per line |
| `chat-index.sqlite` | Full-text index of old chats (`read_own_chat`); deleted, it gets rebuilt |
| `usage.sqlite` | Usage statistics; deleted, it's rebuilt from the logs |
| `memory/` | Memory: `bots/<id>/`, `groups/<id>/`, `team/`, `journal.jsonl`, `archive/` |
| `secrets.json` | Secrets. **Treat it as a password** |
| `logs/diagnostics.jsonl` | Recent errors and warnings (already redacted) |

**The chats themselves are not in `bot/`**; they're in `~/.dsh/sessions/`.

**Backup steps**:
1. **Fully quit DSH** (both the Web service and Desktop must be closed) to make sure `state.json` is current
2. Copy the entire `~/.dsh/` (at minimum `bot/`, `sessions/`, `storages/`)
3. **Copying only `bot/` loses the chats**
4. Restore: quit DSH, put the folders back in place, then start it again

**Moving to another computer**: if the paths are the same, just copy them. If the paths differ (e.g. the username changed), whether **DSH can find the old Sessions is untested**.

**Running Web and Desktop at the same time**: by default they share the same `~/.dsh`. Whichever DSH loads the team first takes the `bot/state.lock`, and the other becomes **read-only** — it can see the team and follow file changes, but refuses modifications (reporting `bot/read-only`). To let both modify, give one of them a different `DSH_HOME`.

---

## 6. FAQ and Troubleshooting

### Q1: DS Bot won't load; the log says `disabling profile plugin row "bot"`

```
dsh: disabling profile plugin row "bot": its declared peer dependencies cannot be validated: Cannot read properties of undefined (reading 'startsWith')
```

**Cause**: DSH checks every row of the profile before loading plugins. This message means there's a row with id `bot` but no package name. The row DS Bot adds has name `ds-bot`, so **it's likely that some file in the profile directory has left behind a `- id: bot` with no name** (for example a `cordis.patch.yml` override that no longer matches).

**Fix**:
1. Quit DSH
2. Open the profile directory's `cordis.patch.yml` (`~/.dsh/profiles/web/`, on Windows `C:\Users\<user>\.dsh\profiles\web\`; Desktop uses `profiles/desktop/`)
3. Find the `- id: bot` row that has no `name: ds-bot` and delete it. **Back up the file first**
4. Check whether `package.json` in the same directory has `ds-bot` in `dependencies`; if not, add it again:
   ```sh
   npx @deepseek-ai/dsh@0.2.1-rc.2 plugin --profile web add ds-bot
   ```
5. Restart DSH

**Troubleshooting command**:
```sh
npx @deepseek-ai/dsh@0.2.1-rc.2 --profile web --dump-config
```
It prints every plugin row and the file it came from.

> Deleting the whole profile directory also fixes it, but that takes your other plugins and settings (such as model configuration) with it. The Bot team lives in `~/.dsh/bot/` and is unaffected.

### Q2: After turning off "web-search-auto", search breaks in all sessions

```
Error: configured web provider "auto" is not registered
```
Error code `WEB_PROVIDER_CONFIGURED_MISSING`.

**Cause**: DS Bot's `cordis.patch.yml` sets the `web` row's `searchProvider` to `auto` regardless of whether `web-search-auto` is on, and DSH **does not fall back** when the specified provider isn't registered.

**Fix**: add a `web` row to the profile's `cordis.patch.yml` (**this row replaces the entire config of the `web` row, so `fetchProvider` must be preserved**):
```yaml
- id: web-search-auto
  name: ds-bot/web-search
  disabled: true
- id: web
  name: '@deepseek-ai/dsh-web'
  config:
    searchProvider: deepseek-official
    fetchProvider: http
```

### Q3: `@Name` shows up as a file icon before the message is sent

**Cause**: DeepSeek Harness draws these waiting lines itself, and reads `@` up to the next space. The plugin currently can't change how it renders them.

**It doesn't affect who answers**: DS Bot reads `@Name` using its own rules, and a mentioned Bot gets called. Once the message is sent, it displays normally.

**Workaround**: add a space after the name (`@Anvil could you look at this`).

### Q4: Upgrading from the old `dsh-bot` package

Early builds used the package name `dsh-bot`. **Remove `dsh-bot` from the profile first, then add `ds-bot`** — both packages use the plugin id `bot`.

The team, chats, and secrets stay where they are; saved browser settings, themes, and Bot colors are migrated the first time DS Bot opens.

---

## 7. Conclusion: What This Project Reminds Us Of

After reading this project, my strongest feeling isn't "this project is great," it's:

**The hard part of multi-agent systems has never been "how do you make them run in parallel." It's "how do you keep them consistent over a long period of time."**

Consistency has three enemies:

1. **Context drift** — after chatting a long time you forget the goal
2. **Inconsistent state** — you don't know what the others are doing
3. **Disordered collaboration** — duplicated work, loops, lost results

DS Bot has a clear countermeasure for each: the **context steward** cures drift, **state as a first-class citizen** cures inconsistency, and the **handoff tree** cures disorder.

And behind all of these countermeasures is one design philosophy:

> **Don't limit behavior with counters; constrain behavior with structure.**

Delete the 6-hop cut, the 10-unread cap, the 3-round cap, and the 40-message cap; the only new constraint is "don't send to a Bot that's waiting for a result." **Net constraints down, reliability up.** That's a decision only someone who has truly thought through the system structure can make.

And one more thing:

> **"If a capability is missing from DSH, stop and explain; don't work around it with a patch."**

In an open-source ecosystem that generally leans toward "if it runs, ship it, work around it later," writing this sentence into the hard rules and carrying it through to the desktop app's architectural decisions takes some backbone.

**Project URL**: <https://github.com/Fei2411/DeepSeek-Bot>
(The repository analyzed in this article was originally `FeiZhuLulu/DeepSeek-Bot` and now redirects to `Fei2411/DeepSeek-Bot`)

---

**The complete Chinese translations of this project's English documentation have also been organized, four documents in total:**

| Document | Chinese translation |
|---|---|
| `ds-bot/README.md` (full plugin feature documentation) | `ds-bot-README.zh.md` |
| `docker/README.md` (Docker deployment) | `docker-README.zh.md` |
| `AGENTS.md` (AI coding agent collaboration rules) | `AGENTS.zh.md` |
| `app/README.md` (desktop app) | `app-README.zh.md` |

The project's own Chinese documentation: `README.zh.md`, `CONTRIBUTING.zh.md`, `docs/vision.zh.md`, `docs/known-issues.zh.md`, plus all 11 design drafts under `docs/plans/` (which were written in Chinese to begin with).

---

If you've read this far and liked it, a quick like, a "looking good," and a share would be great. If you want to get push notifications as soon as possible, give me a star too. Thanks for reading my article — see you next time.

First published on the WeChat official account 「瑞哥观势」.
