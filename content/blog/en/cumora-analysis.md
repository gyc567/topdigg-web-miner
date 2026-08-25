---
title: "Cumora Deep Dive: A Cross-Platform Collaboration Platform Where AI Agents Are First-Class Teammates — Product Shape, Hands-On Tutorial, and Design Philosophy"
description: "An in-depth look at yetone/cumora (GitHub open-source, MIT, v0.2.2). It walks through: ① project overview — a PWA+Electron+Capacitor tri-shell, Cumora Cloud+BYOA dual-brain cross-platform team chat where AI agents are first-class teammates; ② detailed tutorial — local setup (Postgres+Redis), brain switching (managed / Claude Code / Codex / Grok Build / Cursor Agent), coordination defenses (freshness gate / atomic claim / small-brain triage), real email (Resend out + Cloudflare Email Routing in), and Coordination design philosophy; ③ technical architecture — React 18 + Vite + TS + Tailwind frontend, Express + ws + Postgres + Redis backend, Kubernetes agent pods, Go FUSE-mounted workspaces, llm_calls cost ledger; ④ 7 design philosophies — Agent is a teammate not a chatbot, Computer is first-class, decoupled I/O surface, coordination without collision, transparent cost ledger, CI-enforced big-brain guard, complete feature lifecycle. Core claim: treat AI agents as genuine team members, not responsive tools — they hold persistent personas, memory, claim work, coordinate with each other, send/receive real email, all on the same roster."
date: "2026-08-25"
author: "TopDigg Research Team"
tags: ["Cumora", "yetone", "AI Agent", "Multi-Agent", "BYOA", "Claude Code", "Codex", "Cursor Agent", "Grok Build", "Kubernetes", "React", "Vite", "Express", "Postgres", "Redis", "Electron", "Capacitor", "Cloudflare Workers", "OpenAI Responses API", "Open Source", "MIT", "Agent Coordination", "freshness gate", "triage"]
categories: ["Deep Dive"]
keywords: ["Cumora", "yetone/cumora", "AI agent team", "multi-agent collaboration", "BYOA", "Bring Your Own Agent", "Claude Code", "Codex CLI", "Cursor Agent", "Grok Build", "OpenAI Responses API", "agent coordination", "freshness gate", "atomic claim", "small-brain triage", "Kubernetes agent pods", "Go FUSE", "React 18", "Vite", "TypeScript", "Tailwind", "Express", "WebSocket", "Postgres", "Drizzle ORM", "Redis pub/sub", "Electron", "Capacitor", "Cloudflare Workers", "Resend", "agent persona", "agent memory", "feature lifecycle", "ship protocol", "open source", "MIT license", "design philosophy"]
---

# Cumora Deep Dive: A Cross-Platform Collaboration Platform Where AI Agents Are First-Class Teammates — Product Shape, Hands-On Tutorial, and Design Philosophy

> **Core idea**: **Cumora (yetone/cumora) is not yet another "AI chatbot integration" — it is a cross-platform collaboration platform that treats AI agents as first-class teammates.** In Cumora, AI agents and humans share the same roster, the same DMs, the same group conversations, the same Kanban board, and the same calendar. Agents don't just answer when poked — they hold **persistent personas, memory, claim work proactively, coordinate without colliding, and send/receive real email** — and they can run on either Cumora's official cloud or on your own Mac/VPS (BYOA). Its core engineering judgment is: **"Collaboration is N independent thinkers + one coordination layer + one transparent ledger"** — 7 defense layers (per-agent model pin, concurrency semaphore, deterministic spawn pacing, adaptive AdaptivePacer, wake debounce, per-agent rate-limit cooldown, freshness preflight) + one small-brain triage gate + one `llm_calls` cost ledger transform multi-agent collaboration from "group chat posting" into "an engineered coordination system." This judgment is realized as runnable engineering through 2 deployment paths (Managed / BYOA), 5 doc pillars (BYOA / COORDINATION / SHIPPING / email / i18n), 2 architecture guards (guard:big-brain / guard:llm-tracked), and 1 feature lifecycle (Draft → Contract → Building → Verifying → Ready → Releasing → Watching → Learned).

---

## 1. Project Overview

### 1.1 What is it?

This article analyzes the GitHub repository [`yetone/cumora`](https://github.com/yetone/cumora) (TypeScript, MIT license, v0.2.2) — **a cross-platform team chat application that treats AI agents as first-class participants**.

In one sentence:

> **Cumora = one PWA / Electron / iOS / Android same-source client + an Express + ws + Postgres + Redis backend + N agent runtimes (managed K8s pods or BYOA local daemons) + Cloudflare Workers (email-gate / r2-gate)** — AI agents and humans coexist on the same Roster; agents have personas, memory, can claim work, coordinate with each other, and send/receive real email.

Cumora does something deliberately *not* done: **it doesn't invent a new LLM, doesn't invent a new agent framework, doesn't replace your subscription.** What it does:

1. **Treats agents as teammates** — same roster, same DMs, same group chats, same Kanban, same calendar — agents aren't passive chatboxes, they're stateful, proactive collaborators;
2. **Two "brain" paths**:
   - **Cumora Cloud** (managed): each agent runs in a K8s pod; `server/src/agents/turn.ts` runs a multi-hop tool-calling loop on the OpenAI Responses API (bash, files, browser, email, memory, skills…);
   - **BYOA (Bring Your Own Agent)**: you run `npx cumora agent computer` daemon and use your local **Claude Code / Codex / Grok Build (`grok`) / Cursor Agent (`cursor-agent`)** as the agent's brain — the server never sees your provider keys;
3. **Decoupled I/O surface** — what brain the agent uses and which Computer it runs on are decoupled from its world actions (reply, DM, memory, workspace, card); all of these go through the `cumora` CLI (a thin shim that POSTs argv to `/runtime/cli`), one protocol for any brain;
4. **Real engineered coordination** — N agents in the same room don't trample each other. The server arbitrates with a seen-cursor freshness gate (a stale reply is HELD and shown newer messages to re-decide), atomic claims on real units of work, and a small-brain triage gate that shields the big model;
5. **Full cross-platform** — Web (PWA) / Desktop (Electron + auto-update) / iOS + Android (Capacitor) — same React components + TS + Tailwind;
6. **Feature Lifecycle** — agents use the same Ship protocol as humans: `Draft → Contract → Building → Verifying → Ready → Releasing → Watching → Learned` — each stage needs evidence squares, independent verifier, and 24h production readback;
7. **Open-source + MIT** — `CONTRIBUTING.md` spells out the architecture invariants and CI guards: `npm run guard:big-brain` (only agent turns may use the big model) + `npm run guard:llm-tracked` (every LLM call must be tracked).

### 1.2 One-line positioning

> **Cumora is the open-source, bring-your-own-subscription Slack + a roster of Claude Code / Codex / Cursor Agent / Grok Build teammates.**

### 1.3 Key facts

- **Repo**: [yetone/cumora](https://github.com/yetone/cumora) (MIT)
- **Version**: v0.2.2
- **Product**: [cumora.ai](https://cumora.ai) · Web app: [app.cumora.ai](https://app.cumora.ai)
- **Main language**: TypeScript (strict, dual tsconfigs)
- **Database**: Postgres + Drizzle ORM
- **Message bus**: Redis (pub/sub fan-out + presence)
- **Server**: Node.js + Express 5 + ws (WebSocket)
- **Frontend**: React 18 + Vite + TypeScript + Tailwind CSS (desktop / mobile / web / admin share components)
- **Desktop**: Electron + electron-updater (auto-update via [yetone/cumora-releases](https://github.com/yetone/cumora-releases))
- **Mobile**: Capacitor (iOS + Android, package `io.cumora.app`)
- **Agent runtime**: Cumora Cloud runs in K8s pods (one per agent, Go FUSE driver mounts server-side workspace); BYOA runs on user's own Mac/VPS (`npx cumora agent computer` daemon)
- **BYOA-supported brains**: Claude Code (Anthropic) / Codex CLI (OpenAI) / Grok Build `grok` (xAI) / Cursor Agent `cursor-agent`
- **LLM protocol**: OpenAI Responses API (multi-hop tool calling)
- **Email out**: Resend HTTP API (mock mode requires no key)
- **Email in**: Cloudflare Email Workers (workers/email-gate)
- **CDN**: Cloudflare R2 (workers/r2-gate signed URLs)
- **Push**: APNs (iOS) + FCM (Android) via Capacitor Push Notifications
- **Coordinator defense layers**: 7 layers (per-agent model pin, big-brain semaphore default 6, deterministic spawn pacing default 500ms, adaptive AdaptivePacer max 8s, wake debounce 2.5s, per-agent rate-limit cooldown 60s, freshness preflight)
- **CI architecture guards**: `guard:big-brain` (only agent turns may use the big model) + `guard:llm-tracked` (every LLM call must be tracked)
- **Feature lifecycle 8 stages**: `Draft → Contract → Building → Verifying → Ready → Releasing → Watching → Learned`
- **Benchmarks**: `benchmarks/` runs real-LLM multi-agent coordination benchmarks — chain / counting / werewolf / kanban
- **i18n**: ships English + Simplified Chinese (`zh-CN`), per-device locale preference
- **Deployment surface**: PWA / Electron desktop / iOS / Android / admin — 5 shells

### 1.4 What problem it solves

2026's "AI team collaboration" is fragmented into 5 problems:

1. **Agent = chatbot** — most products integrate LLM as "@gpt summarize this" — no persona, no memory, no proactive conversation, no work claim, no cross-agent coordination;
2. **Agent = cloud or local, not both** — you want your local Claude Code / Codex subscription AND cloud reliability — BYOA and Managed can't coexist;
3. **Agents collide** — multiple agents wake at the same instant, see the same messages, make the same decision, post the same message — "race collisions" and "brain misjudgment";
4. **Cost is opaque** — multiple agents collaborating, every turn uses how many tokens, how much money, which model — no transparent ledger;
5. **Cross-platform is discontinuous** — conversations started on web aren't on mobile; desktop notifications don't reach mobile — no unified multi-end UI.

Cumora's answer: **make agents real teammates; let brains be official or local; turn coordination into 7 engineering defense layers; put every LLM call into a ledger; run the same React components on every platform.**

---

## 2. Detailed Tutorial: From Zero to a Running Agent Team

This section walks through 7 steps: "local setup → launch clients → Managed/BYOA switching → how coordination works → real email → Feature Lifecycle." Each step has copyable commands, minimal examples, and notes. Sources: [CONTRIBUTING.md](https://github.com/yetone/cumora/blob/main/CONTRIBUTING.md), [docs/BYOA.md](https://github.com/yetone/cumora/blob/main/docs/BYOA.md), [docs/COORDINATION.md](https://github.com/yetone/cumora/blob/main/docs/COORDINATION.md), [docs/SHIPPING.md](https://github.com/yetone/cumora/blob/main/docs/SHIPPING.md).

### 2.1 Step 1: Local environment

**Prerequisites**:

- **Node.js ≥ 18** (CI runs on Node 24)
- **Postgres** (Homebrew / Docker)
- **Redis** (Homebrew / Docker)
- **OpenAI API key** (the only hard-required env var)

**Fastest try**:

```bash
# Create database
createdb -h localhost cumora

# Set env var
export OPENAI_API_KEY=sk-...

# Clone and install
git clone https://github.com/yetone/cumora.git
cd cumora
npm run setup        # install root + Email Worker dependencies
npm run dev:all      # Vite renderer :5180 + API server :5181
```

Open [http://localhost:5180](http://localhost:5180) for the PWA, or run `npm run electron:dev` for the desktop window.

> Note: The database schema is **created idempotently on boot**, and seeded with a starter team (6 agents + 3 humans + 9 conversations), but **all messages are produced live** — seed seeds structure only, not messages.

### 2.2 Step 2: Environment variables

`OPENAI_API_KEY` is the only hard-required variable; everything else has a sane local default or soft-disables when unset:

| var | default |
|-----|---------|
| `DATABASE_URL` | `postgres://$USER@localhost:5432/cumora` |
| `REDIS_URL` | `redis://localhost:6379` |
| `OPENAI_MODEL` | big-brain model |
| `OPENAI_MODEL_SUPPORT` | support model |
| `PORT` | `5181` |

Optional feature groups (OAuth login, Resend + Cloudflare Email Routing, R2 storage/CDN, APNs/FCM push, sub2api LLM gateway, waitlist/invites, metrics) are documented in [`.env.example`](https://github.com/yetone/cumora/blob/main/.env.example) and `server/src/env.ts`.

### 2.3 Step 3: Choose the agent's brain path

#### Path A: Cumora Cloud (Managed)

No extra setup — `runAgentTurn` (in `server/src/agents/turn.ts`) runs a multi-hop tool-calling loop by default; the agent lives in its own K8s pod (using the `agent-computer` image); the pod mounts a server-side workspace via a Go FUSE driver.

```bash
# On the server side, on boot:
# msg.new ─► scheduler.wakeOne ─► ensurePod (kubectl) ─► pod
#                                                       │
#                turn.ts hop loop ◄─────────────────────┘
#                getLlmClient → OpenAI Responses API
#                bash → cumora shim → /runtime/cli → DB
```

#### Path B: BYOA (Bring Your Own Agent)

Run the daemon on your own Mac/VPS, use a local CLI as the brain:

```bash
# Install the cumora CLI (agent-cli npm package)
npx cumora agent computer
```

Supported local brains:
- **Claude Code** (Anthropic)
- **Codex CLI** (OpenAI)
- **Grok Build** (`grok`) (xAI)
- **Cursor Agent** (`cursor-agent`) (Cursor)

> Key property: **The server never touches your provider keys** — BYOA's entire wake → turn lifecycle goes through SSE (`/runtime/wake-stream`) + CLI (`/runtime/cli`), but API keys stay on your machine.

### 2.4 Step 4: Understand the 7-layer coordination defense

This is Cumora's essence — multiple agents in the same room don't collide, thanks to 7 engineering defense layers + one triage gate:

```
┌─────────────────────────────────────────────────────────────┐
│  1. Per-agent model pin (deploy env)                        │
│     CUMORA_DEFAULT_CLAUDE_MODEL=claude-opus-4-7             │
│     → pin model, prevent CLI default drift                  │
├─────────────────────────────────────────────────────────────┤
│  2. Per-computer big-brain concurrency cap (daemon)         │
│     CUMORA_BYOA_MAX_CONCURRENT_BIG_BRAIN=6                  │
│     → default 6, prevent burst rate limit                   │
├─────────────────────────────────────────────────────────────┤
│  3. Deterministic spawn spacing (daemon)                     │
│     MIN_SPAWN_INTERVAL_MS=500ms                              │
│     → deterministic pacing instead of random jitter         │
├─────────────────────────────────────────────────────────────┤
│  3a. Per-computer small-brain (triage) concurrency cap      │
│     CUMORA_BYOA_MAX_CONCURRENT_TRIAGE=8                      │
│     → triage also gated (lesson learned 2026-06-02)         │
├─────────────────────────────────────────────────────────────┤
│  3b. AdaptivePacer — burst absorber for sustained throttling │
│     double on rate limit (max 8s), halve after 5 successes   │
│     → global adaptive backoff                                │
├─────────────────────────────────────────────────────────────┤
│  3c. Wake debounce, coalescing, and same-turn steering      │
│     WAKE_DEBOUNCE_MS=2500 + direct-ping steering + group nudge │
│     → burst coalescing, direct mid-turn steering            │
├─────────────────────────────────────────────────────────────┤
│  4. Per-agent rate-limit cooldown (daemon)                  │
│     ENGINE_BACKOFF_AFTER_RATE_LIMIT_MS=60_000                │
│     → single-agent 60s cooldown, suppress notifications      │
├─────────────────────────────────────────────────────────────┤
│  5. Server-side freshness preflight (`cumora reply`)        │
│     seen-cursor vs baseline → HELD + re-decide              │
│     → prevent race collisions                                │
├─────────────────────────────────────────────────────────────┤
│  small-brain triage gate                                    │
│     haiku / gpt-5.4-mini guards, actionable=true only       │
│     → protect big-brain from trivial tasks                  │
└─────────────────────────────────────────────────────────────┘
```

> **Key philosophy**: **Never add a prompt rule where a code mechanism is the right fix, and never add a code mechanism where the brain is making a clear decision in front of correct state.**

### 2.5 Step 5: Give agents real email

Every agent has a **real email address** (`<participantId>.<companySlug>@<EMAIL_DOMAIN>`), capable of both sending and receiving:

```
┌──────────────┐  MIME    ┌────────────────────────┐  HMAC-signed JSON   ┌──────────────────┐
│  Sender MTA  │ ───────► │  Cloudflare            │ ──────────────────► │  cumora-server   │
│ (gmail, etc) │   MX     │  Email Routing +       │   POST /webhooks/   │  /webhooks/email │
└──────────────┘          │  workers/email-gate    │   email/inbound     │  /inbound        │
                          └────────────────────────┘                     └──────────────────┘
                                                                                 │
                                                                                 ▼ wakes the recipient agent
```

CLI subcommands:

```bash
cumora email send ...
cumora email reply ...
```

When `RESEND_API_KEY` is unset, mock mode kicks in (returns fake message-id and logs) — convenient for local dev.

### 2.6 Step 6: Run tests and guards

```bash
npm test                  # unit tests (node:test) — server + workers
npm run test:integration  # integration suite (needs local Postgres/Redis)
npm run typecheck && npm run server:typecheck
npm run guard:big-brain   # CI guard: only agent turns may use the big model
npm run guard:llm-tracked # CI guard: every LLM call must be tracked
```

### 2.7 Step 7: Feature Lifecycle (Ship protocol)

Cumora treats shipping as a shared, evidence-backed workflow:

```
Draft → Contract → Building → Verifying → Ready → Releasing → Watching → Learned
```

Each stage:

- **Contract** — requires problem, desired outcome, concise contract
- **Building** — requires at least one builder + one invariant
- **Verifying** — every required invariant must be covered by an evidence square; each required square must have an owner
- **Ready** — all required squares pass, including user-path, trace, and release-note proof; a builder cannot complete their own square
- **Production** — successful staging/canary release + release notes + rollback plan + measurable baseline + approval
- **Watching** — begins after production smoke passes; default readback is due 24 hours later
- **Learned** — passed production readback + no failing regression

Agent CLI:

```bash
cumora ship list
cumora ship show <feature_id>
cumora ship create "<title>" --problem "..." --outcome "..." --contract "..."
cumora ship square <feature_id> <square_id> running
cumora ship square <feature_id> <square_id> passed --evidence "..."
cumora ship friction <feature_id|none> "<title>" --severity high
cumora ship regression <feature_id> "<title>" --command "..." --expected "..."
```

---

## 3. Technical Architecture

### 3.1 Architecture diagram

```
 Electron / PWA / iOS / Android         ┌─────────────────┐
 ┌──────────────────┐   HTTP / WS       │   App workers   │──▶ OpenAI (Responses API)
 │    React UI      │ ◀───────────────▶ │  Express + ws   │──▶ Resend (email out)
 └──────────────────┘                   │    (any N)      │──▶ APNs / FCM (push)
                                        └───┬────────┬────┘
 Cloudflare Workers                         │        │ kubectl
 ┌─────────────────┐   webhooks / R2   ┌────▼───┐ ┌──▼──────────────┐
 │ email-gate      │ ────────────────▶ │Postgres│ │ Agent pods (K8s)│
 │ r2-gate (CDN)   │                   │ Redis  │ │ or BYOA daemons │
 └─────────────────┘                   └────────┘ └─────────────────┘
```

### 3.2 Frontend

- Pure UI (`src/`): React 18 + Vite + TypeScript + Tailwind
- 4 shells share the same components: `desktop/`, `mobile/`, `web/`, `admin/`
- Backend-driven; **frontend does not make business-rule decisions**

### 3.3 Backend

- Stateless Node service (`server/`): Express + `ws`
- Postgres is **source of truth** (pg pool + Drizzle schema)
- Redis for **pub/sub fan-out** and **presence**
- Any N instances behind LB stay in sync via Redis bus

### 3.4 Agent runtime

- **Cloud agents**: each agent a K8s pod (server uses `kubectl`; Go FUSE driver mounts server-side workspace)
- **BYOA agents**: daemon on user's machine (`npx cumora agent computer`)
- Both interact with the world through the **same `cumora` CLI protocol**
- **Every LLM call** (cloud or BYOA) lands in one `llm_calls` cost ledger

### 3.5 Key invariants (CI-enforced)

```bash
# 1. Only agent turns may use the big model
npm run guard:big-brain

# 2. Every LLM call must be tracked
npm run guard:llm-tracked
```

These two are Cumora's **core cost model** — the cheap "cerebellum" model handles triage, classification, summaries, every utility call; the expensive model is reserved for actual agent reasoning turns.

### 3.6 Repository layout

| path | what it is |
|---|---|
| `src/` | React renderer (desktop / mobile / web / admin) |
| `server/` | API + WebSocket + agent runtime (Express, Postgres, Redis) |
| `electron/` | desktop shell (auto-update via yetone/cumora-releases) |
| `ios/`, `android/` | Capacitor native shells (`io.cumora.app`) |
| `agent-cli/` | the published npm package `cumora` — the BYOA daemon users run |
| `agent-fuse/` | Go FUSE driver mounting the agent workspace inside cloud pods |
| `workers/` | Cloudflare Workers: `email-gate` (inbound mail) and `r2-gate` (signed CDN) |
| `website/` | marketing site for cumora.ai (Cloudflare Pages) |
| `benchmarks/` | real-LLM multi-agent coordination benchmarks (chain / counting / werewolf / kanban) |
| `server/k8s/` | deployment manifests + GKE notes |

---

## 4. Synthesized Insights and Conclusions

Through deep analysis of Cumora, here are 13 key insights:

### Insight 1: AI agents should be designed as "teammates," not "chatbots"

**Fact**: Cumora lets agents and humans share the same Roster, DMs, group chats, Kanban, calendar; agents have persona, memory, claim work proactively, and send/receive email.

**Conclusion**: Designing agents as passive response tools is product-form laziness — real "AI teammates" need proactivity, memory, and coordination. Cumora turns this principle into engineering (persistent persona, proactive wake, claim work, cross-agent coordination).

### Insight 2: "Brain" and "host" should be decoupled — Computer is first-class

**Fact**: Cumora decouples "agent" from "which machine runs it / which brain it uses." Managed uses `turn.ts` + OpenAI Responses API; BYOA uses Claude Code / Codex / Grok Build / Cursor Agent CLI; both interact with the world through **the same `cumora` CLI protocol**.

**Conclusion**: An agent's "thinking" and "working location" shouldn't be locked together — the same "my agents live on machines" mental model works for both managed cloud and user-local setups. Cumora calls this **Computer** (a product concept), not a BYOA special case.

### Insight 3: Decoupling I/O surface makes "brain switching" near-zero cost

**Fact**: The `cumora` CLI is a thin shim — POSTs argv to `/runtime/cli`, transport (SSE + `/runtime/cli`) is brain/host-agnostic.

**Conclusion**: Decoupling "what to do" (reply, DM, memory, workspace, card) from "how to think" (which LLM, which machine) is the engineering key victory — brain and host can be swapped without reimplementing I/O.

### Insight 4: Multi-agent coordination relies on "7-layer engineering defense" + triage gate, not prompts

**Fact**: Cumora's coordination has 7 defense layers (model pin / concurrency semaphore / deterministic pacing / AdaptivePacer / wake debounce / rate-limit cooldown / freshness preflight) + small-brain triage gate.

**Conclusion**: **Never add a prompt rule where a code mechanism is the right fix.** Coordination is a system problem for N independent engines deciding in the same room; prompts are soft mechanisms with low ceilings; code is hard mechanism, engineerable, verifiable. Cumora uses **real incident data** (130 rate-limit hits in 17 minutes) to drive every defense layer.

### Insight 5: Freshness gate + atomic claim are the core of preventing race collisions

**Fact**: `cumora reply` checks the seen-cursor baseline (Redis, 10-min TTL) before INSERT; if there's an update, returns a HELD envelope (exit code 2) so the agent re-decides with new messages; work claims on a Computer are atomic.

**Conclusion**: **Serializable is fundamental to collaboration.** It's not about making every agent right (impossible) — it's about letting wrong agents HELD and re-decide when errors occur. Distributed systems thinking applied directly to agent collaboration.

### Insight 6: Wake debounce + same-turn steering resolves the "burst vs latency" contradiction

**Fact**: `WAKE_DEBOUNCE_MS=2500` coalesces bursts into a single turn; meanwhile mid-turn DM/@mention directly injects into the LIVE session; group activity uses single content-free nudges.

**Conclusion**: Coordination can't be "one message per turn" (wasteful, race-y) or "wait for batch processing" (high latency). Cumora's two escapes — direct-ping steering + coalesced rerun — are the key design.

### Insight 7: BYOA is a product-grade implementation of "users own provider keys"

**Fact**: BYOA daemon runs on user's machine, using user's local Claude Code / Codex / Grok / Cursor Agent CLI; the server **never** touches provider keys.

**Conclusion**: In the LLM era, "your API key or mine" is a product-grade watershed — BYOA is not a technical choice, it's a trust-structure choice. Cumora elevates this to a first-class product form (Computer / BYOA / Managed three states in one UI).

### Insight 8: CI guards are the only executable carriers of "engineering invariants"

**Fact**: `guard:big-brain` and `guard:llm-tracked` are CI scripts that enforce "only agent turns may use the big model" and "every LLM call must be tracked."

**Conclusion**: **"Big models for reasoning, small models for tools" and "cost must be traceable" are principles — but unenforced principles are no principles.** Cumora uses CI to turn principles into executable invariants.

### Insight 9: Feature Lifecycle is a "shared development protocol for humans and agents"

**Fact**: 8 stages (Draft → Contract → Building → Verifying → Ready → Releasing → Watching → Learned) + each stage needs evidence squares + independent verifier + 24h production readback.

**Conclusion**: **"Shipping" is not a PR status — it's an evidence-backed workflow.** Cumora lets agents use `cumora ship ...` CLI to create / verify / release features — this isn't just tool integration, it's **workflow convergence** — humans and agents collaborate in the same protocol.

### Insight 10: i18n is "progressive localization," not "must be complete before shipping"

**Fact**: Each locale is TS-typed against `en.ts`; mistyped keys (typo / invented) fail `tsc`; untranslated keys fall back to English — partial is normal.

**Conclusion**: i18n shouldn't be a waterfall model that requires "everything translated before launch." Cumora's approach: **`en` is source of truth, other locales typed against it** — fewer translations don't break UI, wrong translations break compilation. This "type-driven progressive i18n" is the most elegant solution.

### Insight 11: Decoupling + coordination + transparency = a trustworthy agent system

**Fact**: I/O decoupled from brain + 7-layer coordination defense + `llm_calls` cost ledger + CI-enforced guards.

**Conclusion**: **The three conditions for user trust in agent systems: controllable (brain-swappable), reliable (non-colliding), auditable (cost-transparent).** Cumora satisfies all three — an engineering-rare "complete agent system."

### Insight 12: Open-source + multi-platform is a "non-obviously correct" product form

**Fact**: MIT license, 5 shells (PWA / Electron / iOS / Android / admin), same React components, strict CI guards, production-ready i18n, production 24h readback.

**Conclusion**: In 2026, as an "AI collaboration platform" product category, **the most vulnerable weakness to giants is vendor lock-in** — Cumora uses MIT + multi-end + CI guards to turn this into a moat.

### Insight 13: Local CLI + remote protocol is becoming the standard form of agent tooling

**Fact**: BYOA daemon uses local Claude Code / Codex / Grok / Cursor as brain; managed uses OpenAI Responses API; both interact with the world through the same `cumora` CLI + SSE + `/runtime/cli` protocol.

**Conclusion**: **"Local CLI + remote protocol" is becoming the de facto standard for agent tooling.** Claude Code / Codex / Cursor are already CLI-first; Cumora abstracts this into a product-grade implementation.

---

## 5. Design Philosophy

Cumora's design philosophy can be read from its code, docs, CI guards, contribution guides — **it's not slogans written somewhere, it's judgments soaked into every engineering decision.** I've condensed it into 7 principles:

### Philosophy 1: Agent is a teammate, not a chatbot

> *"Agents don't just answer when poked: they hold personas and memory, claim work, coordinate with each other without colliding, send and receive real email."*
> — Cumora README

This is not product-speak, it's engineering judgment — all of Cumora's design revolves around this principle:

- Same roster, DMs, group chats, Kanban, calendar
- Persistent persona and memory
- Proactive wake, claim work, cross-agent coordination
- Real email (not "notification system" — actual SMTP)

### Philosophy 2: Computer is first-class — brain and host decoupled

> *"Rather than bolt BYOA on as a special case, Computer is a first-class product concept that every agent shares: an agent always runs on some Computer."*
> — docs/BYOA.md

The opposite of this philosophy is "BYOA is a Managed special case" — Cumora abstracts it as Computer: all agents run on some Computer (Cumora Cloud is one of them), with the same UI, state machine, and coordination logic.

### Philosophy 3: I/O surface decoupled from brain — make "brain switching" zero cost

> *"Cumora's I/O surface is fully decoupled from the brain. The same `cumora` CLI an agent uses for every world action is a thin shim that POSTs argv to `/runtime/cli`."*
> — docs/BYOA.md

This is the key engineering judgment — decoupling "what to do" (reply, DM, memory, workspace, card) from "how to think" (which LLM, which machine), so the latter can be swapped arbitrarily.

### Philosophy 4: Coordination via engineering defense, not prompt

> *"Never add a prompt rule when a code mechanism is the right fix, and never add a code mechanism when the brain's making a clear decision in front of correct state."*
> — docs/COORDINATION.md

This is Cumora's coordination philosophy core — prompts are soft mechanisms with low ceilings; coordination is a distributed systems problem and deserves distributed systems answers (concurrency control, serialization, debounce, adaptive backoff, atomic claims). Cumora turns this principle into a verifiable engineering implementation through 7 defense layers.

### Philosophy 5: Cost transparency is the principle, CI enforcement is the means

> *"Only agent turns may use the big model... the expensive model is reserved for the actual agent reasoning turn."*
> — CONTRIBUTING.md

> *"Every LLM call must be tracked in the cost ledger. Untracked spend is a correctness bug here, not just an oversight."*
> — CONTRIBUTING.md

These two aren't suggestions, they're CI guards — `guard:big-brain` and `guard:llm-tracked` fail your build. **Principles unenforced are no principles.**

### Philosophy 6: Humans and agents share the same development protocol

> *"Cumora treats shipping as a shared, evidence-backed workflow instead of a pull request status. Humans and agents use the same feature contract, verification squares, releases, production readbacks, friction inbox, and regression assets."*
> — docs/SHIPPING.md

This is Cumora's deepest philosophy — **humans and agents aren't two kinds of developers, they're different roles in the same workflow.** 8-stage lifecycle + evidence squares + independent verifier + 24h readback are the carriers of this philosophy.

### Philosophy 7: Failures are "read back," not "push and forget"

> *"The release contract is complete only after production behavior has been read back against its baseline. A green build or successful rollout is an intermediate signal, not the terminal state."*
> — docs/SHIPPING.md

This philosophy counters the "ship and done" engineering culture — Cumora treats the 24-hour-later production readback as part of the release contract; failed readback sends the feature back to Building.

---

## 6. Conclusion: Cumora's Lessons for AI Agent Engineering

Cumora uses 5 shells + 2 deployment paths + 7-layer coordination defense + 1 feature lifecycle + 2 CI guards + 1 `llm_calls` cost ledger to transform "AI agents as first-class teammates" from a product vision into **a runnable, verifiable, auditable, open-source engineering system.**

Its lessons for AI agent engineering can be condensed into 5:

1. **Agents are first-class** — same roster, DMs, group chats, Kanban, calendar; persistent persona and memory; proactive wake, claim work, cross-agent coordination; real email.
2. **Brain and host decoupled** — Computer is a first-class product concept; `cumora` CLI is the unified I/O surface; BYOA and Managed use the same protocol.
3. **Coordination is an engineering problem, not a prompt problem** — 7 defense layers + triage gate are more reliable than 100 prompt lines; freshness gate + atomic claim is distributed systems thinking applied to agent collaboration.
4. **CI-enforced engineering invariants** — `guard:big-brain` + `guard:llm-tracked` turn "controllable, traceable cost" from a slogan into an executable invariant.
5. **Humans and agents share the same workflow** — 8-stage feature lifecycle + independent verifier + 24h readback is a product-grade implementation of "AI teammate."

If you're designing your own agent system, Cumora's answer is not "which framework to use" — **it's "which product form."** Make agents real teammates, make Computer first-class, make coordination engineering defense, make cost CI-enforced — that's Cumora's engineering answer.

---

## References

- **GitHub**: [yetone/cumora](https://github.com/yetone/cumora)
- **Product**: [cumora.ai](https://cumora.ai)
- **Web App**: [app.cumora.ai](https://app.cumora.ai)
- **Docs**:
  - [README.md](https://github.com/yetone/cumora/blob/main/README.md)
  - [docs/BYOA.md](https://github.com/yetone/cumora/blob/main/docs/BYOA.md)
  - [docs/COORDINATION.md](https://github.com/yetone/cumora/blob/main/docs/COORDINATION.md)
  - [docs/SHIPPING.md](https://github.com/yetone/cumora/blob/main/docs/SHIPPING.md)
  - [docs/email.md](https://github.com/yetone/cumora/blob/main/docs/email.md)
  - [docs/I18N.md](https://github.com/yetone/cumora/blob/main/docs/I18N.md)
  - [CONTRIBUTING.md](https://github.com/yetone/cumora/blob/main/CONTRIBUTING.md)
  - [SECURITY.md](https://github.com/yetone/cumora/blob/main/SECURITY.md)
- **Key invariants**: CI guards `guard:big-brain`, `guard:llm-tracked`
- **Architecture core**: React 18 + Vite + TS + Tailwind / Express + ws + Postgres (Drizzle) + Redis / K8s Agent Pods / Go FUSE / Cloudflare Workers (email-gate + r2-gate) / Resend / APNs / FCM / Capacitor / Electron