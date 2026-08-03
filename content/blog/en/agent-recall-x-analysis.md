---
title: "AgentRecall-X Deep Dive: An Agent That Learns From Corrections — and the Honest-Measurement Revolution"
description: "A complete analysis of AgentRecall-X, open-sourced by Goldentrii — a Claude Code memory system that learns from corrections, and the only open-source project that actually quantifies whether an agent stops repeating a mistake. From the dual core — a governed corrections ledger plus the missing measurement instrument — to the five-layer memory model grounded in cognitive psychology, from the honest 35.3% capture rate and 0/3 heed data, to the /arstart /arsave /arrecall /arreflect session loop, to a full MCP setup tutorial and the Automaticity Principle design philosophy, this article explains why a 312-star project is shaking up the entire agent-memory field."
date: "2026-08-03"
author: "TopDigg Research Team"
tags: ["AgentRecall", "Agent Memory", "Claude Code", "MCP", "Corrections Ledger", "RAG", "Mem0", "Retrieval", "AI Agent", "Memory Layers", "TypeScript"]
categories: ["Deep Dive"]
keywords: ["AgentRecall-X", "Agent memory", "Claude Code memory", "MCP Server", "corrections ledger", "measurement instrument", "five-layer memory", "session loop", "automaticity principle", "honest measurement", "RAG", "retrieval augmented", "Mem0 comparison", "AI agent memory"]
---

# AgentRecall-X Deep Dive: An Agent That Learns From Corrections — and the Honest-Measurement Revolution

> Core idea: **"The value of a memory tool is not how much it stores, but whether a correction actually changes the agent's next behavior."** In one sentence AgentRecall-X draws the line between itself and every competitor — it is not merely a memory engine, but **(a) a governed corrections ledger** and **(b) a measurement instrument for "correction → behavior change."** While the whole industry self-reports high retrieval scores, it chose to publish its own 35.3% capture rate and 0/3 heed data — **"Measured, not promised."**

---

## 1. Project Overview

### 1.1 What Is It?

**AgentRecall-X** (originally AgentRecall-MCP) is a Claude Code memory system open-sourced by Goldentrii. Its official self-positioning:

- **"Claude Code memory that learns from corrections"** — not passively remembering conversations, but actively learning rules from every correction you make;
- **"The only learning loop that measures whether your agent actually stops repeating a mistake"** — it does not promise "never repeat," but uses data to tell you whether it actually did;
- Offered as **MCP · SDK · CLI · Skill** — four integration forms.

Key facts:

- Repository: `https://github.com/Goldentrii/AgentRecall-X`
- Stars: **312**, Forks: 53
- License: MIT
- Language: TypeScript / JavaScript (monorepo)
- Latest version: v3.4.40 (July 27, 2026)
- npm weekly downloads: ~2,759

### 1.2 What Problem Does It Solve?

Anyone who uses AI coding assistants knows the feeling: **you correct the agent a hundred times — "ask before you change," "don't touch this file" — and next round it makes the same mistake.** The mainstream memory tools (Mem0 ~60K stars, Graphiti/Zep ~28K, Supermemory ~28K, Letta ~24K) are all about "remembering more," but nobody answers a more fundamental question:

> Does a remembered correction actually change behavior?

AgentRecall-X points out two flaws in the field:

- **It tests retrieval, not behavior**: LongMemEval, LoCoMo, MemoryAgentBench, Letta Leaderboard — every public benchmark tests "can it retrieve," none tests "after retrieval, did the agent actually obey";
- **Self-reported scores are unreproducible**: most tools' benchmark numbers are self-reported, from the same retrieval tests, hard to independently reproduce.

AgentRecall-X's answer: **build the measurement instrument first, then talk about memory.** It makes the corrections ledger and the measurement harness first-class citizens — retrieval is just one component.

---

## 2. Core Philosophy: Measured, not promised

### 2.1 The Governed Corrections Ledger

Every correction you make — *"no, not that version"*, *"put this section first"*, *"ask me before you assume"* — is stored as a structured record with severity, evidence, and outcome tracking:

- `rule` — the rule content (the behavioral standard the agent must follow)
- `why` — why this rule exists
- `project` — which project it belongs to
- `date` — record date
- `severity` — **P0** (never/always/don't) or P1 (general preference)
- `active` — whether enabled
- `holder` — rule owner
- `heeded_count` — times obeyed
- `recurred_count` — times the mistake came back
- `proof_confidence` — evidence confidence

It persists in storage that spans **sessions, projects, and agent restarts** — correct once, effective indefinitely, until explicitly retracted.

### 2.2 The Missing Measurement Instrument

This is AgentRecall-X's most distinctive contribution: **every correction accumulates a `retrieved_count`, and every time the agent meets the same situation again, the outcome is recorded as `heeded` (obeyed) or `recurred` (repeated).**

The author's own words:

> "Every benchmark in this field tests retrieval; none tests behavioral change across sessions. We built the measurement harness first — and we publish what we found, including the unflattering numbers."

### 2.3 The Real Data It Publishes (2026-07-03)

- **Correction capture recall** (dual-blind audit, n=59): **35.3%** [17.3–58.7 CI] — only about 1/3 of real corrections captured;
- **Heed rate** (evidence-grounded, post-reset): **0/3** events — not the 92.5% "optimistic estimate," but an honest 0;
- **Correction transfer recall** (offline bench, achievable): **0/4** [Wilson 0–49%] — scores 0 on its own corpus;
- **Median session_start injection**: **1,489 tokens** (was 2,010; Mem0 anchor ~7K);
- **p95 session_start latency (warm)**: **363 ms** (was 1,132).

The author's explanation (honest and precise):

- The 35.3% capture rate shows **correction capture itself is the biggest bottleneck**;
- 0/3 is not a "regression" — it is **the correct starting point after changing the default from "assume obeyed" to "unknown"**;
- The 0/4 transfer recall is a **data-density problem** (19 projects carry only 32 active corrections — too sparse to front-run mistakes), **not a retrieval architecture problem** (confirmed 5× by internal experiments).

> This is extraordinary: **an open-source project that voluntarily publishes unflattering numbers — and every one of them can be regenerated with one command (`npm run bench`) from a fixed, hash-locked corpus.**

---

## 3. Technical Architecture: The Five-Layer Memory Model

### 3.1 Five Memory Layers Grounded in Cognitive Psychology

AgentRecall-X maps the cognitive-psychology memory taxonomy onto the agent's filesystem:

- **Layer 1 · Episodic**: chronologically records what happened each session, path `journal/`, auto-written during work;
- **Layer 2 · Semantic**: topic-clustered facts with `[[wikilinks]]`, path `palace/rooms/` (Architecture, Goals, Blockers);
- **Layer 3 · Procedural**: IF-THEN production rules, reusable how-tos, path `palace/skills/`;
- **Layer 4 · Narrative**: project phases: Goal → What was hard → How solved → Synthesis, path `palace/pipeline/`;
- **Layer 5 · Correction**: behavioral calibration rules with severity and outcome tracking, path `corrections/`;
- **+ Awareness layer**: cross-project insights promoted from N-confirmed corrections, path `palace/awareness` — the compounding layer.

All layers share one canonical naming grammar, so any agent can compose retrieval paths from intent; existing files keep working through a `legacy_path` view — **no migration needed**.

### 3.2 Local File Structure

All memory defaults to local Markdown, zero cloud:

```
~/.agent-recall/
├── awareness.md                  # global compound document (~200 lines)
├── awareness-state.json          # structured awareness data
├── insights-index.json           # cross-project insight matching
├── feedback-log.json             # retrieval quality scores
└── projects/<name>/
    ├── journal/YYYY-MM-DD--arsave--NL--slug.md
    ├── palace/
    │   ├── rooms/<room>/         # persistent knowledge rooms
    │   ├── skills/               # procedural rules
    │   ├── pipeline/             # narrative phases
    │   ├── awareness/            # cross-project insights
    │   ├── identity.md           # project intent + goals
    │   └── graph.json            # memory connection edges
    └── corrections/
        └── alignment-log.json    # correction history
```

### 3.3 Tech Stack and Retrieval

- **Core**: TypeScript monorepo, 4 published packages (`core` storage + tool logic, `mcp-server` thin MCP wrappers, `sdk` programmatic API, `cli` the `ar` command);
- **Default retrieval**: keyword/substring matching (stemming + synonym expansion + lightweight IDF + per-source ranking) merged via **RRF (Reciprocal Rank Fusion, Cormack 2009)** — note: **not BM25**; the author is explicit that there is no inverted index, and a real BM25 is a "possible future" upgrade;
- **Optional semantic retrieval**: vector search enabled when `OPENAI_API_KEY` is set; optional Supabase mirror (pgvector);
- **Decay algorithm**: FSRS-lite (Ebbinghaus → SuperMemo → FSRS-6 lineage);
- **Re-ranking**: a Modern Hopfield re-rank primitive (Ramsauer 2020) exists in the code but **is not wired into the default path** — "whatever runs today is what you get";
- **User feedback**: retrieval results can be rated, updating rankings through a Bayesian Beta model.

---

## 4. Design Philosophy

### 4.1 The Automaticity Principle

> "Memory only compounds if it fires automatically, not on demand."

The evidence: a long observation across 44 projects, 221 journals, and 81 corrections (2026-06-12) found that **all "pull-channel" tools (recall, memory_query) saw zero organic calls** — including the agent that built them. In contrast, the "push channels" (session_start, session_end, correction hooks, ambient recall) consistently produced behavioral change.

Conclusion: only **5 tools** ship by default; the "two-verb model" — `session_start` (inhale) and `session_end` (exhale) — carries all the compounding value; everything else is opt-in (`--full`).

### 4.2 Honest Reporting over Marketing Narratives

- Deleted "Every correction saved is a mistake never repeated" (an unfalsifiable marketing claim);
- Deleted the competitor comparison table (attributes drift and can't be tracked persistently);
- Built a reproducible measurement framework: every number can be regenerated with one command, "including the ones that make us look bad."

### 4.3 Local-First, Zero Cloud by Default

The default path is purely local Markdown, depending on no cloud service; the Supabase mirror and OpenAI vectors are **optional**. This embodies "Cheap + Private" — your corrections ledger belongs to you.

### 4.4 Deliberate Choices

- **Markdown over vector databases for default storage** — readable, diff-able, grep-able, git-versionable;
- **RRF over BM25** — good enough and honest, no fake complexity;
- **MCP over proprietary protocols** — one interface connects every agent client.

---

## 5. Full Tutorial: Getting Started with AgentRecall-X

### 5.1 Install the MCP Server

**Claude Code (one-command install):**

```bash
claude mcp add --scope user agent-recall -- npx -y agent-recall-mcp
```

**Cursor (`.cursor/mcp.json`):**

```json
{ "mcpServers": { "agent-recall": { "command": "npx", "args": ["-y", "agent-recall-mcp"] } } }
```

**VS Code (`.vscode/mcp.json`):**

```json
{ "servers": { "agent-recall": { "command": "npx", "args": ["-y", "agent-recall-mcp"] } } }
```

**Windsurf (`~/.codeium/windsurf/mcp_config.json`):**

```json
{ "mcpServers": { "agent-recall": { "command": "npx", "args": ["-y", "agent-recall-mcp"] } } }
```

**Codex:**

```bash
codex mcp add agent-recall -- npx -y agent-recall-mcp
```

### 5.2 Install the Skill (Claude Code only)

```bash
mkdir -p ~/.claude/skills/agent-recall
curl -o ~/.claude/skills/agent-recall/SKILL.md \
  https://raw.githubusercontent.com/Goldentrii/AgentRecall-X/main/SKILL.md
```

### 5.3 Install the SDK and CLI

```bash
npm install agent-recall-sdk            # JS/TS apps
npx agent-recall-cli recall "topic"     # terminal & CI
```

### 5.4 The Four-Verb Session Loop

This is AgentRecall-X's core usage — **"Without /arstart, a fresh agent has zero orientation; without /arsave, nothing compounds."**

- **`/arstart`** (the **first** action of every session) — open the status board: list pending work and blockers across all projects, pick by number, then load that project's deep context (palace rooms, corrections, task recall); `/arstart <slug>` loads directly; `/arstart bootstrap` scans the machine and imports existing projects;
- **`/arsave`** (the **last** action of every session) — write journal + palace consolidation + awareness compounding; `/arsave all` batch-saves every parallel session of the day (scan, merge, deduplicate);
- **`/arrecall`** (mid-session, on demand) — search past knowledge: documented fixes, past decisions, established patterns;
- **`/arreflect`** (every K sessions) — periodic consolidation: confirm recurrence/phantom matches, cluster new error classes, propose rule re-abstraction (**rule edits stay owner-gated**).

### 5.5 Core MCP Tools Cheat Sheet

**session_start (at session start):**

```json
{ "project": "my-app" }
```

Returns: project identity, top-5 awareness insights, most salient palace rooms, predictive warnings from past correction patterns (`watch_for`), up to 10 P0 behavior rules, resume brief.

**remember (when you learn something new):**

```json
{
  "content": "We decided to use GraphQL instead of REST",
  "context": "architecture decision"
}
```

Returns: routing target (`routed_to`), content classification, auto-generated semantic slug.

**recall (search past knowledge):**

```json
{ "query": "authentication design", "limit": 5 }
```

Can carry feedback scoring that drives the Bayesian ranking update.

**session_end (session over):**

```json
{
  "summary": "Built auth module with JWT refresh rotation. Fixed CORS bug.",
  "insights": [{
    "title": "JWT refresh tokens need httpOnly cookies",
    "evidence": "XSS attack vector discovered during security review",
    "applies_when": ["auth", "jwt", "security", "cookies"],
    "severity": "critical"
  }],
  "trajectory": "Next: add rate limiting to API endpoints"
}
```

**check (validate understanding before big decisions):**

```json
{
  "goal": "Build REST API for user management",
  "confidence": "medium",
  "assumptions": ["User wants REST, not GraphQL", "CRUD endpoints"]
}
```

### 5.6 SDK Usage Example

```typescript
import { AgentRecall } from "agent-recall-sdk";

const memory = new AgentRecall({ project: "my-app" });

// Capture knowledge
await memory.capture("What stack?", "Next.js + Postgres");

// Recall memory
const ctx = await memory.recall("rate limiting");
```

### 5.7 The Experimental Recurrence & Reflection Harness Kit

- `ar-scoreboard.py` (SessionStart hook) — health digest every session: correction flow, insight promotion rate, loop health, phantom counts, reflection cadence;
- `ar-recurrence-check.py` — mechanical phantom detection over your corrections via an error-class taxonomy (a violation dated after its rule = a phantom gradient step, where the write cost was paid but behavior never changed);
- `ar-nudge.py` (UserPromptSubmit hook) — surfaces overdue reflection mid-session;
- `dispatch-model-guard.py` (PreToolUse hook, optional) — warn-only guard for an explicit-model dispatch policy.

First validation run (2026-07-14, one power-user harness): found 8 error classes and 18 confirmed phantom gradient steps in 109 corrections; re-abstracted 6 rules the same day.

### 5.8 War Room Visual Dashboard

1. Download `ar-warroom-v3.4.40.zip` from the [latest Release](https://github.com/Goldentrii/AgentRecall-X/releases/latest);
2. Unzip and serve locally:

```bash
cd warroom
python3 -m http.server 8080
```

3. Open **http://localhost:8080/AgentRecall.html** — activity calendar, per-project status, corrections, insights — all rendered from local `~/.agent-recall/` data, **fully offline, no Node, no build step**.

---

## 6. Feature Checklist: Out of the Box

- **Governed corrections ledger**: severity (P0/P1) + evidence + retraction + outcome tracking
- **Behavior measurement**: `retrieved_count` / `heeded` / `recurred` three metrics
- **Five-layer memory**: episodic / semantic / procedural / narrative / correction + awareness compounding layer
- **Two-verb session model**: `session_start` / `session_end`, rest opt-in
- **Retrieval**: keyword + synonyms + lightweight IDF + RRF fusion (optional OpenAI vectors)
- **Feedback learning**: Bayesian Beta scoring of retrieval results
- **Dream mode (optional)**: overnight automatic consolidation, Ebbinghaus decay, journal rollups, awareness graduation, Telegram daily report
- **Platform coverage**: Claude Code (primary), Cursor, Windsurf, VS Code / Copilot, Codex, Hermes, Roo Code, any JS/TS app, terminal/CI
- **War Room**: offline visual dashboard
- **Reproducible benchmark**: `npm run bench` regenerates every number
- **Local-first**: zero cloud by default, readable and git-versionable Markdown

---

## 7. Summary: Viewpoints and Conclusions

### 7.1 Core Viewpoints

1. **"Memory engine" is a misused label — AgentRecall-X is really a corrections ledger + measurement instrument.** The author asserts directly in the internal research doc: "AgentRecall is not a memory engine. It is (a) a governed corrections ledger and (b) the missing measurement instrument for correction learning — currently mislabeled as a memory tool." **This is honesty of positioning, and the starting point of differentiation.**
2. **"Testing retrieval, not behavior" is the systematic blind spot of the entire agent-memory market.** LongMemEval, LoCoMo, MemoryAgentBench all test retrieval; AgentRecall-X is the only open system publicly measuring cross-session behavioral change. **While others compete on "how much is stored," it competes on "how real the change is."**
3. **Honest data is a scarce asset.** Publishing a 35.3% capture rate and 0/3 heed rate looks like an "unflattering number" in the short term, but is a **trust moat** in the long term — because every number can be reproduced from a hash-locked corpus, "including the ones that make us look bad."
4. **The Automaticity Principle: compounding comes from push, not pull.** Across 44 projects and weeks of real use, all pull-channel tools got zero calls — **shipping only 5 tools by default and letting the two-verb model carry all value is a data-driven optimum, not the designer's preference.**
5. **The current bottleneck is data density, not retrieval architecture.** 19 projects carry only 32 active corrections (75% already retracted) — too sparse to front-run mistakes. **Fix "capture" first, then optimize "retrieval." The order must not be flipped.**

### 7.2 Where It Stands in the Field (Versus Competitors)

- **Mem0** (~60K stars) — vector + BM25 + entity, low correction layer, high coding-agent focus;
- **Graphiti/Zep** (~28K) — temporal knowledge graph (Neo4j), low correction layer;
- **Supermemory** (~28K) — facts + profiles + KG + RAG, **highest** coding-agent focus;
- **Letta** (~24K) — agent-editable memory blocks, medium correction layer;
- **AgentRecall-X** (312 stars) — Markdown corrections ledger + five-layer memory, **native correction layer**, high coding-agent focus, **local-only, zero cloud by default**.

Facing 60K-star giants with 312 stars, its strategy is not "do more," but **"measure truer."**

### 7.3 Takeaways for Developers

- **Correction capture is the most undervalued bottleneck** — a 35.3% capture rate means no matter how strong the retrieval, errors that were never remembered can't be prevented;
- **Measure first**: any memory system should first answer "did it change behavior?", then talk about storage and retrieval;
- **Defaults define product character**: changing "unverified = obeyed" to "unverified = unknown" makes 0/3 an honest starting point;
- **Local-first is a replicable product strategy**: Markdown memory is readable, diff-able, and git-versionable — better than any black-box vector store.

### 7.4 Conclusion

In the 2026 agent-memory race — crowded with "everyone self-reports 90%+ retrieval scores" — AgentRecall-X draws a completely different starting line with a set of "ugly but true" numbers. It may not have the most stars, but it owns what this field most lacks: **a measurement instrument that can falsify itself, and a culture willing to publish bad news.**

> While the whole industry shows off the glory of retrieval, AgentRecall-X chooses to measure the truth of behavior. Perhaps that is where agent memory really needs to go.

---

## References

- AgentRecall-X official repository: https://github.com/Goldentrii/AgentRecall-X
- Official full docs: https://github.com/Goldentrii/AgentRecall-X/blob/main/README.full.md
- Changelog (design reasoning): https://github.com/Goldentrii/AgentRecall-X/blob/main/UPDATE-LOG.md
- Landscape research report: https://github.com/Goldentrii/AgentRecall-X/blob/main/docs/research/agent-memory-landscape-2026-07.md
- Benchmark reproduction guide: https://github.com/Goldentrii/AgentRecall-X/blob/main/docs/eval/REPRODUCE.md
- npm package: https://www.npmjs.com/package/agent-recall-mcp
