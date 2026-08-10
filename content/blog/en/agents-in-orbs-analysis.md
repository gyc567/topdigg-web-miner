---
title: "Agents in Orbs Deep Dive: When the Agent Learns to Run Code While You're Not at Your Computer — Amp's Remote Orb Hands-On Tutorial, Design Philosophy, and Five Core Insights"
description: "Based on Amp's official 2026-06-30 announcement Agents in Orbs, the 2026-02-19 editorial The Coding Agent Is Dead, the Orbs User Manual, and the 2026-08-07 price-table post Size the Orbs of Production, this article dissects the product shape, technical details, and design philosophy of Amp's Orb. It covers: (1) what an Orb is — a Debian 12 remote machine that runs Amp agents, billed by the minute, auto-paused after 5 minutes of inactivity; (2) a full hands-on tutorial — the four entry points (Web / CLI `amp -ox` / TUI command palette / plugin `agent.createThread()`), `amp sync <thread>` for two-way sync, `--orb-size` for per-thread sizing, `.agents/setup` and `.agents/resume` lifecycle hooks, OIDC federation, webhooks and portals; (3) the a1 five-tier price grid (a1.tiny/small/medium/large/xxlarge at $0.08/$0.17/$0.33/$0.66/$1.32 per hour); (4) design philosophy — 'unshackle agents from the editor sidebar', 'capability is not authority', 'bill in results not in seats', 'wake on demand, sleep when done', 'let fan-out stop being limited by local resources'; (5) five core insights: a vanished threshold unlocks parallel potential, unattended becomes the default, agents decouple from the editor, self-driven delivery accelerates, billing moves from seats to minutes. Core claim: the stronger the model, the less you should lock it onto a single machine; Orbs is Amp's engineering answer to the agent era."
date: "2026-08-10"
author: "TopDigg Research Team"
tags: ["Amp", "Agents in Orbs", "Coding Agent", "AI Agent", "Remote Agent", "Orb", "amp CLI", "amp -ox", "amp sync", "CLI Agent", "Debian 12", "OIDC", "Webhook", "Plugin", "TUI", "SaaS", "Ampcode", "DevOps"]
categories: ["Deep Dive"]
keywords: ["Agents in Orbs", "Amp Orb", "remote agent", "unattended agent", "amp -ox", "amp sync", "Orb sizes", "a1.tiny", "a1.small", "a1.medium", "a1.large", "a1.xxlarge", "billed by the minute", "Amp CLI", "ampcode", "agent paradigm", "design philosophy", "Coding Agent Is Dead", "OIDC federation", "amp webhooks", "Orbs Manual"]
---

# Agents in Orbs Deep Dive: When the Agent Learns to Run Code While You're Not at Your Computer — Amp's Remote Orb Hands-On Tutorial, Design Philosophy, and Five Core Insights

> Core idea: **Agents in Orbs is Amp's engineering answer to "agents are no longer locked in the editor sidebar" — a remote machine (Debian 12) that runs Amp agents, billed by the minute, auto-paused after 5 minutes of inactivity, woken on demand from any of four entry points (Web / CLI / TUI / plugin), mirrored to your laptop with `amp sync`, freeing fan-out parallel scheduling from "this laptop" to "a fleet of on-demand cloud VMs".** The 2026-06-30 release isn't Amp shipping a new feature — it is the concrete product realization of the 2026-02 editorial The Coding Agent Is Dead: turning "models want to write code and run even when you're not sitting in front of your editor" into a clickable, billable, pausable, observable product. Its design philosophy compresses into five lines — **unshackle the agent from the editor sidebar; capability is not authority; bill in results not seats; wake on demand and sleep when idle; stop letting your laptop throttle fan-out.**

---

## 1. Project Overview

### 1.1 What Is It?

This article dissects Amp's 2026-06-30 announcement [Agents in Orbs](https://ampcode.com/news/agents-in-orbs) — a product shape that moves the Amp agent out of the editor, out of the local laptop, and into on-demand remote machines.

It isn't "Amp adds a new feature"; it is the concrete fulfillment of the promise Amp made in the 2026-02-19 editorial [The Coding Agent Is Dead](https://ampcode.com/news/the-coding-agent-is-dead):

> "These models no longer need the hand-holding and really want to kick off their training wheels. They want to write code and run even when you're not sitting in front of your editor. It's time to see what they can do without supervision."

—turning that slogan into product shape is Agents in Orbs.

### 1.2 The Shape in One Sentence

**An Orb is a remote machine that runs an Amp agent**: a Debian 12 system with `gh`, `amp`, git, SSH, tmux, Bun, Node.js, Python, ripgrep and friends pre-installed; each Amp thread starts by cloning your project repository and pre-loading your secrets and environment variables, so the agent runs 24×7 unsupervised; billed by the minute, paused automatically after 5 minutes idle, stopped immediately on thread archive.

Four properties distinguish it from "an agent on your laptop":

1. **Not on your machine**: the agent runs in a cloud Debian 12 sandbox, fully isolated from your laptop — your CPU and memory are untouched.
2. **Same interface as local**: control it from Web UI, CLI, TUI, or plugin; review diffs, browse files, open a tmux-shared terminal.
3. **Wake on demand, sleep when done**: auto-pause 5 minutes after the last activity; thread archive pauses it immediately; billed by the minute, paused is free.
4. **Arbitrary fan-out**: one laptop can't run 8 parallel agents without trashing performance; a fleet of cloud orbs can — and this is the "paradigm shift when the threshold disappears" Amp wants you to notice.

### 1.3 Key Facts

- **Release date**: 2026-06-30 (announcement Agents in Orbs); the editorial prequel 2026-02-19 (The Coding Agent Is Dead); the Orbs User Manual at [ampcode.com/manual/orbs](https://ampcode.com/manual/orbs).
- **Base OS**: Orb runs Debian 12, pre-installed with `gh` (authenticated), `amp` (authenticated), git, SSH, tmux, ffmpeg, ImageMagick, vim, jq, fzf, unzip, zstd, lsof, websocat, ripgrep, Bun, Node.js, npm, pnpm, Yarn, Python, pip, agent-browser.
- **Billing unit**: per minute (billed by the minute); paused is free.
- **Auto-pause**: 5 minutes of inactivity (down from 15 minutes, effective 2026-08-07); thread archive pauses immediately; no manual pause needed.
- **Startup optimization**: warm-start is significantly faster when another team member has recently created an orb in the same project.
- **Price tiers** ([Size the Orbs of Production, 2026-08-07](https://ampcode.com/news/size-the-orbs-of-production)):
  - `a1.tiny`: 1 CPU · 2 GB memory · **$0.08/hour**
  - `a1.small`: 2 CPUs · 4 GB memory · **$0.17/hour**
  - `a1.medium`: 4 CPUs · 8 GB memory · **$0.33/hour** (new on 2026-08-07, 50% cheaper than the old `a0.medium`)
  - `a1.large`: 8 CPUs · 16 GB memory · **$0.66/hour**
  - `a1.xxlarge`: 16 CPUs · 32 GB memory · **$1.32/hour**
  - Enterprise workspace prices are +50%; Megawatt subscribers get `a1.small` as the default for personal projects.
- **Storage**: doubled from 20 GB to 40 GB on 2026-07-03, no price increase ([More Orb Sizes](https://ampcode.com/news/more-orb-sizes)).
- **Entry points**: Web ([ampcode.com](https://ampcode.com/)) → Create New Thread; CLI `amp -ox`; TUI command palette `thread: new in orb`; plugin `agent.createThread()`.
- **Sync command**: `amp sync <thread>` mirrors the orb's changes to your local checkout while the agent keeps working remotely.
- **Lifecycle hooks**: `.agents/setup` (preparation phase) and `.agents/resume` (resume phase, blocks at most 10 seconds); service declaration `.amp/services.yaml`; portal descriptions under `.amp/portals/*.json`.
- **Security/integration**: can mint short-lived OIDC tokens to federate with Google Cloud / Tailscale / AWS; plugins can register webhooks (external events wake paused orbs), handler timeout 30 seconds, at-least-once delivery, 10/min rate limit, max 100 events queued per endpoint; any Git host supported (private repos on other hosts inject credentials via `GIT_CONFIG_*` env vars).
- **Git signing**: enable "Sign Git commits in orbs" in personal settings; the project must use Thread Creator as Orb Commit Author.

### 1.4 The Problem It Solves

"Agents in Orbs" doesn't solve "how do agents run" — it solves "how do agents finish the work while you are away from your computer". Three local-agent limits are removed at once by the Orb:

1. **Local resource contention**: running 8 parallel agents locally murders your fans, drains your battery, and freezes your IDE. Amp calls this out directly — "launch a group of agents to investigate eight different bugs independently when there are no local resource clashes to worry about". Orb moves that contention from your laptop to the cloud.
2. **Time-of-day limitations**: local agents follow your workday — leave the computer, the agent stops; time-zone shifts, cross-region collaboration, overnight builds are all gated by "you not being there". Orbs run 24×7, billed by the minute, no waste when you're away (5 minutes idle and they sleep).
3. **Treat the agent as a ticket, not a tool**: Amp hammers on this — "Why not turn a bug report into an agent and an investigation instead of a ticket? Why not manage the agent and its results instead of the ticket?" Orbs let the agent escape the ticket into a persistent operating state — a webhook, a portal, an OIDC-federated agent is now "alive" indefinitely.

---

## 2. Detailed Tutorial: From Zero to Your First Orb Agent

This section walks Prepare → Launch → Control → Sync → Advanced, with copy-pasteable commands, minimum reproducible examples, and caveats. Source: [ampcode.com/manual/orbs](https://ampcode.com/manual/orbs).

### 2.1 Step 1: Pick an Entry Point and Launch an Orb Thread

Four entry points — pick the one that fits your workflow.

**Entry A: Web Console**

Open [ampcode.com](https://ampcode.com/), click **Create New Thread**, choose a Project, type a prompt, submit. Amp automatically spawns a new orb, clones the repo, runs `.agents/setup`, and starts the agent.

**Entry B: CLI (the canonical shape)**

```bash
# from your project directory:
amp -ox "Investigate why the latest CI run on 'main' failed"
```

This is the shape Amp keeps showing in the announcement — almost identical to using `amp -x` to launch a local agent, except `-x` becomes `-ox` (orb execute). Uses the project's default orb size; to override:

```bash
amp -ox "your prompt" --orb-size a1.small
```

**Entry C: Amp TUI Command Palette**

In the TUI, open the command palette, search `thread: new in orb`, hit enter; choose the project, type the prompt, hit enter. Advantage: you stay in your normal terminal workflow.

**Entry D: Plugin**

```ts
await amp.createThread({
  prompt: 'Investigate flaky tests',
  orb: true,
})
```

Use cases: a CI failure automatically spawns an orb agent to investigate; a webhook handler starts an agent; a batch script fans out agents.

### 2.2 Step 2: Review Changes and Browse Files (No Sync Required)

Two key panels inside an Orb thread:

1. **Review panel**: see the agent's diff; check file by file; reject or accept; no need to mirror to local first.
2. **File Browser panel**: browse the entire repo on the orb — files the agent changed, files it didn't, temp files, build artifacts.

This means your PR-review workflow can completely skip "first git clone to local" — you review on the orb while the agent keeps iterating.

### 2.3 Step 3: Collaborate in a Terminal (Shared tmux)

Open the orb thread's Terminal panel and you enter a **tmux session shared with the agent**:

- Same filesystem (the orb's working copy); a file you edit in the terminal is instantly visible to the agent.
- You can install deps, run tests, inspect processes, write scripts, change local config — indistinguishable from local dev.
- The agent also sees your terminal output — so "I open a terminal in the orb, kick off a build, and watch logs with the agent" is a natural collaboration shape.

This is Orb's most under-appreciated design: **it doesn't force the agent and the human to work in separate machines on separate shells — it gives them a shared shell session as the collaboration surface.**

### 2.4 Step 4: Mirror Changes Back to Local (`amp sync`)

When you want to continue work locally:

```bash
amp sync <thread>
```

`<thread>` can be a thread URL or a thread ID. `amp sync` mirrors every change in the orb's working copy **into your local checkout**, while the agent keeps working in the cloud. The data flow is bidirectional, but mind:

- Don't edit the same file in both local and orb simultaneously — last write wins.
- Want to push local changes back to the orb? Edit, commit, and push directly in the Terminal panel (tmux session shares the filesystem).

### 2.5 Step 5: Advanced

#### 2.5.1 Repository Lifecycle Hooks

Create two shell scripts at the repo root; Amp runs them on the schedule below:

| File | When | Block strategy | Log |
|---|---|---|---|
| `.agents/setup` | Preparing the orb state, run from repo root | Synchronously blocks | `/home/user/.cache/amp/logs/setup.log` |
| `.agents/resume` | When a paused orb resumes, before the agent continues | Blocks at most 10 seconds; continues after | `/home/user/.cache/amp/logs/resume.log` |

Minimum `.agents/setup`:

```bash
#!/usr/bin/env bash
set -euo pipefail

corepack enable
pnpm install --frozen-lockfile
[ -f .env.local ] || cp -- .env.example .env.local
```

Minimum `.agents/resume` (**fast idempotent repair only** — do NOT install dependencies here):

```bash
#!/usr/bin/env bash
set -euo pipefail

# Fast, idempotent repair work only. Do not install dependencies here.
mkdir -p .amp
date > .amp/resume-last-ran.txt
```

Both scripts need `chmod +x` and must be committed.

> **Key rule**: `.agents/resume` must stay lightweight — the design intent is "finishes in 10 seconds, doesn't block the agent". If you need "after restart, run a full migration again", put that in `.agents/setup` and keep `.agents/resume` to a "where did we leave off, can we continue?" check.

#### 2.5.2 Long-Lived Services and Portals

Declare services in the repo so orbs start them up and expose portal URLs:

`.amp/services.yaml`:

```yaml
services:
  dev:
    command: pnpm dev
    ports: [5173]
```

`.amp/portals/dev.json`:

```json
{
  "title": "Dev Server",
  "links": [
    { "url": "http://localhost:5173", "note": "Local dev server" }
  ]
}
```

Once the portal is up, Amp renders a tab link in the thread UI so you can open the dev server in the browser — no local run, no SSH tunnel.

#### 2.5.3 OIDC Federation (Short-Lived Tokens Instead of Long-Lived Credentials)

Don't put Google Cloud / AWS / Tailscale service-account keys directly into project secrets — use OIDC instead:

```bash
amp orb id-token --audience my-service
```

The token carries workspace / project / user / thread identity; the remote service federates on that identity. Complete recipes for Google Cloud, Tailscale, and AWS at [OIDC from Orbs](https://ampcode.com/manual/orbs/oidc).

#### 2.5.4 Webhooks: Let External Events Wake a Paused Orb

Register a webhook in a plugin so external services (e.g. GitHub) can wake a paused orb:

```ts
const { url } = await amp.createWebhook({
  key: 'github-events',
  headers: ['x-hub-signature-256'],
  handler: async (event, ctx) => {
    await verifyAndApply(
      event.id,
      event.body,
      event.headers['x-hub-signature-256'],
      ctx.signal,
    )
  },
})
```

Key points:

- **HTTP 202 = queued, not processed**.
- **At-least-once delivery** — use `event.id` as an idempotency key.
- Handler timeout 30 seconds; pass `ctx.signal` to cancellable network calls before timeout.
- Rate limit: burst 10, refill 10/min, 100 queued, 429 above.
- Request body max 1 MB.
- **Treat the webhook URL like a password** — don't commit it, don't paste it into a thread message.
- **Amp does not verify signatures for you** — every signature check belongs in the handler.

#### 2.5.5 Private Repos / Self-Hosted Git

- **GitHub private repos**: use the [GitHub connection](https://ampcode.com/settings/integrations); no extra config.
- **Other Git hosts (GitLab / Bitbucket / self-hosted)**: inject credentials via secrets. Git reads `GIT_CONFIG_*` env vars, so a URL rewrite completes auth:

```
GIT_CONFIG_COUNT=1
GIT_CONFIG_KEY_0=url.https://USERNAME:TOKEN@gitlab.com/.insteadOf
GIT_CONFIG_VALUE_0=https://gitlab.com/
```

Store the line containing TOKEN as a secret — never commit it.

#### 2.5.6 Signed Git Commits

Need signed commits from the orb? Two steps:

1. Enable "[Sign Git commits in orbs](https://ampcode.com/settings/keys#signing-keys)" in personal settings.
2. Set the project's Orb Commit Author to Thread Creator.

Otherwise commits in the orb are signed by the orb's ephemeral identity, and your local git will refuse them as "unknown signer".

#### 2.5.7 Picking an Orb Size in Practice

Not spelled out in the announcement, but combining [Size the Orbs of Production](https://ampcode.com/news/size-the-orbs-of-production) with typical workloads:

| Scenario | Recommended size | Why |
|---|---|---|
| Simple scaffolding / single-file edits | `a1.tiny` | 1 CPU is enough, cheapest |
| Typical project fan-out (default) | `a1.small` | Megawatt default; 4 GB handles most Node/Python projects |
| Run test suites + compile front-end | `a1.medium` | 4 CPUs for parallel tests; 8 GB for webpack/vite |
| Heavy ML / Rust compilation | `a1.large` | 16 GB to avoid OOM |
| Full monorepo CI / complex builds | `a1.xxlarge` | 32 GB to absorb monorepo pressure |

Advanced usage:

```bash
# let the agent pick a size — say so in the prompt
amp -ox "Run full E2E suite. Use a1.large if available — tests are memory-heavy."

# per-thread explicit size
amp -ox "Quick lint check" --orb-size a1.tiny
```

Amp also supports letting the agent self-provision — say "use a smaller orb for this" to the main agent and the sub-agent will downgrade accordingly.

### 2.6 Step 6: Archive and Decommission

- Want to stop the orb? **Archive the thread** — the orb pauses immediately.
- Want to resume? Click Resume in the thread list; `.agents/resume` runs (max 10 s), then the agent continues.
- Want to delete? Delete the thread; bound webhook URLs return 404.

### 2.7 The 5-Minute Idle Auto-Pause

Orbs auto-pause after 5 minutes of inactivity (the same week Amp cut prices 20% on 2026-07-27, they also shortened the idle timeout from 15 minutes to 5 on 2026-08-07). **Paused = no charge**. Resume is nearly instant; especially when a teammate has recently opened an orb in the same project, the warm-start gets faster.

---

## 3. Synthesized Insights: 5 Conclusions Drawn from Amp's Announcement

### 3.1 Insight 1: Unshackling the Agent from the Editor Sidebar Is the Most Worthwhile Move in 2026

The 2026-02-19 editorial was already explicit: "the agent is no longer the limiting factor"; "These new models barely need to be told how to act like coding agents anymore". The bottleneck moved from "agent capability" to "are you willing to let go and let it run". Orbs turn that willingness into a product: your agent no longer stops because you're not at the editor.

**Conclusion**: if you're still using an IDE-sidebar agent for serious work, you should immediately migrate at least one workflow to Orbs — not because it's faster, but because it **lets the agent work while you're not there**.

### 3.2 Insight 2: Capability Is Not Authority — but the Larger the Capability, the More the Billing Unit Must Move from Seats to Results

The announcement and the editorial both hammer on this: once the model outgrows the scaffolding, growing the scaffolding (more agents) is what pays off. The bottleneck on more agents is not AI — it is **how much you're willing to pay for parallel agents**. Orbs' per-minute billing (with 5-minute idle = free) is Amp's answer: turn "how much am I willing to pay for agents" from "how many subscriptions have I bought" into "how many agents ran for how many minutes". The former is a seat; the latter is a result.

**Conclusion**: per-minute billing will become the standard for agent platforms in the next few years — because only per-minute makes fan-out a casual action ("fire it off, watch the bill, decide") rather than an upfront ROI calculation.

### 3.3 Insight 3: Let Fan-Out Stop Being Limited by Local Resources — Turning 8 Parallel Agents from Demo into Daily Practice

The most explicit paragraph in the announcement:

> "Why not launch a group of agents to investigate eight different bugs independently when there are no local resource clashes to worry about? Why not turn a bug report into an agent and an investigation instead of a ticket? Why not manage the agent and its results instead of the ticket?"

"Why not turn a bug report directly into an agent?" used to be impossible locally (CPU/memory contention, IDE freeze, battery anxiety). Orbs turn this from "an occasional demo" into "daily practice".

**Conclusion**: when "fire 8 parallel agents to investigate 8 independent bugs" becomes daily practice, ticket-first workflows get replaced by agent-first workflows. The thing you manage changes from "human-written tickets" to "agent-produced results".

### 3.4 Insight 4: Unattended Is the New Default — Agents No Longer Need You to Watch Them

The announcement, in its own words:

> "Never mind the editor, now we can let our agents run even when we're not sitting at our computer."

Read it together with The Coding Agent Is Dead: Amp killed "the agent in the editor" on 2026-02 (self-destruct of the VS Code / Cursor extensions) and put the agent in the Orb on 2026-06 — together these two steps delete the assumption that "the agent must have an editor to work".

**Conclusion**: treating agents like archivable / wakeable tickets (webhook, OIDC, portal) is the shape every agent platform will copy in late 2026. Your ops mental model shifts from "8 IDE tabs watching 8 agents" to "an inbox of 8 agents' output, checked when I'm back from dinner".

### 3.5 Insight 5: Billing Moves from Subscription to Minute, from Per-Month to Per-Use — The Next SaaS Revolution

The hybrid shape — "monthly subscription + per-minute Orb billing" — is intentional: LLM usage is still subscription (billed by token), but Orb (compute) is per-minute. Megawatt covers "almost everyone's whole month of Orb usage", but when usage crosses that line, per-minute billing means it **doesn't become capped-and-throttled** — it scales on demand.

**Conclusion**: agent platform pricing will continue tilting toward "pay for what you use" — but it won't fully replace subscriptions. The shape is "subscription floor + usage ceiling". Amp Orbs is an early template of this trend.

### 3.6 How the Five Insights Connect

```
Insight 1: unshackle the agent from the editor
       ↓ (implementation path)
Insight 4: unattended is the new default
       ↓ (economic foundation)
Insights 2 & 5: billing moves from seats to minutes / from subscriptions to results
       ↓ (unlocked application shape)
Insight 3: fan-out stops being limited by local resources
```

Insight 1 is the philosophical premise, Insight 4 is the product shape, Insights 2/5 are the economic infrastructure, Insight 3 is the unlocked new application. Read the announcement and editorial in this order and you see the complete Amp narrative.

---

## 4. Design Philosophy: Reading the Amp Announcement and Editorial as a Design Manifesto

### 4.1 Philosophy 1: From "An Assistant in the Editor" to "An Independent Machine in the Cloud" — Redefining Where the Agent Lives

A: The Coding Agent Is Dead says:

> "They're now much more than mere assistants. They no longer need the hand-holding and really want to kick off their training wheels."

B: Agents in Orbs says:

> "Orbs are machines where agents can run without supervision."

A moves the agent from "assistant" to "independent entity"; B makes "independent" concrete as Orb (independent machine). The substance of this philosophy: **the agent no longer lives as a parasite on your toolchain — it has its own OS, its own filesystem, its own pause/wake rhythm.**

Concrete manifestations:

- The Orb runs its own Debian 12 with its own filesystem and process space.
- The agent works in its own tmux session; you are a "visitor invited into" that session, not the "owner of the machine".
- Webhook / OIDC let external services treat the Orb as a **long-lived identity** to invoke, not a one-off "let me run an agent for a sec" action.

### 4.2 Philosophy 2: Capability Is Not Authority — The Stronger the Model, the Smaller the Authority Boundary

One detail in the Orb shape is easy to miss: **the agent isn't root**. It can run `apt install`, run builds, edit files — but the OIDC token still needs explicit acceptance by the remote service; the webhook URL still needs the plugin's signature verification; sensitive operations still go through the secrets you've reviewed.

This is the same family of thinking as the FDE Guide's 12 Factors (see *FDE Guide Deep Dive* on this site): **Tokens are an input, autonomy is a design choice, accepted outcomes are the product** — capability is capability, authority is authority, the two must be designed separately.

Concrete manifestations:

- **Can run ≠ can mutate your production environment**: OIDC federation replaces long-lived service-account keys.
- **Can edit files ≠ can push to main**: you review the diff and accept as needed; the agent doesn't bypass your review by default.
- **Can spin up a webhook ≠ can spoof events**: Amp doesn't verify signatures for you; the handler must verify.

**This philosophy is the precondition for "running unattended"** — you only let the agent go because the authority boundary is clearly drawn.

### 4.3 Philosophy 3: Bill in Results, Not Seats — Turning the Agent from a Subscription Product into a Metered Service

The Orb's billing unit is the minute, paused is free, archive stops the clock. Behind this billing shape is Amp's judgment: **the agent is a service you pay for as you use it, not a product you subscribe to monthly.**

Why does this matter? Only "pay for what you use" makes you willing to do all of the following:

- Let the agent run long tasks (overnight builds, full-night test runs) — because it really only bills while it's running.
- Fan out the agent in parallel (8 agents investigating 8 bugs) — because you pay only for the 8 actually running.
- Treat the agent as a ticket (a bug report → an agent) — because archive stops the clock, and there's no subscription cost for "keeping this ticket alive".

**This philosophy moves Amp's entire business model from "how many developers subscribe to Amp" to "how many agents did I let run on Amp for how many minutes".**

### 4.4 Philosophy 4: Wake on Demand, Sleep When Done — Porting "Elasticity" from a Cloud Concept to an Agent Experience

Cloud computing spent 20 years teaching everyone "allocate on demand, release when done"; Amp ports the same elasticity to agents:

- 5-minute idle auto-pause (down from 15 minutes, effective 2026-08-07).
- Paused is free.
- Webhook wake-up is nearly instant (and warm-start gets faster when a teammate has recently opened an orb).

The substance of this philosophy: **agent platforms should have a "cold/hot" duality, not just "on/off"**. Cold costs nothing and wakes on demand; hot runs at full power. This is the shape Orb offers as reference.

### 4.5 Philosophy 5: Let Fan-Out Stop Being Limited by Local Resources — Moving "Parallelism" from a Per-Machine Capability to a Platform Capability

The most explicit paragraph of the announcement:

> "Why not launch a group of agents to investigate eight different bugs independently when there are no local resource clashes to worry about? Why not turn a bug report into an agent and an investigation instead of a ticket?"

This philosophy moves "parallelism" from "how many cores does your machine have" to "how many Orbs is the platform willing to spawn for you" — and the latter is effectively infinite on the cloud.

Concrete manifestations:

- Megawatt covers "almost everyone's whole month of Orb usage" — encouraging you to use more.
- Per-thread size selection (`--orb-size` or letting the agent decide) — `a1.tiny` for trivial tasks, `a1.xxlarge` for heavy ones.
- Combined with webhooks — external events trigger new orbs; parallel fan-out happens entirely in the background.

### 4.6 Philosophy 6: Interface Parity with Local — Lowering Migration Cost Is the Real Moat for Platform Adoption

The most unassuming but most important detail in Orb's design: **every interface the agent exposes on the Orb (reviewing diffs, opening a terminal, `amp sync`, starting from TUI) is identical to the local one**.

The substance of this philosophy: **"going to the cloud" cannot come at the cost of "learning a new way to use it"**. If moving your workflow to Orb required learning a new command set, the migration cost would kill adoption. Amp reduces this to "`amp -x` becomes `amp -ox`, that's it" — so migration cost is close to zero.

Concrete manifestations:

- `amp -x` and `amp -ox` share the same mental model.
- tmux sessions on the Orb behave exactly like local shells.
- The UI for reviewing diffs, browsing files, and running commands shares components with the local agent.

**This philosophy is why Orbs gets adopted fast — not because it's "powerful", but because it "doesn't interrupt your existing workflow".**

### 4.7 Philosophy Summary: Six Philosophies Form Orb's Design Manifesto

| Philosophy | One-liner | Concrete form |
|---|---|---|
| 1. Independent machine | agent doesn't live on your tool | Orb = Debian 12 sandbox |
| 2. Capability ≠ authority | the stronger the model, the clearer the authority boundary | OIDC, webhook signing, mandatory review |
| 3. Per-result billing | agent is a service, not a subscription | billed by the minute |
| 4. On-demand elasticity | agent should have cold/hot states | 5-minute idle auto-pause |
| 5. Platform-level parallelism | fan-out should not be throttled by the laptop | per-thread sizing, on-demand fan-out |
| 6. Interface parity | going to the cloud shouldn't change how you work | `amp -x` ↔ `amp -ox`, shared UI |

These six aren't independent — they form a chain: **interface parity makes you willing to migrate; the independent machine makes migration actually possible; capability ≠ authority makes migration safe; per-result billing makes migration economic; on-demand elasticity makes migration cheap; platform-level parallelism unlocks new uses.** Remove any one and the shape doesn't hold.

---

## 5. Core Takeaway

The most important judgment Agents in Orbs delivers: **in late 2026, the form-factor battle for agent platforms has moved from "whose model is better" to "who can let the agent finish the work while the user isn't there".**

- **It redefines where the agent lives**: from the IDE sidebar to a cloud Orb, with its own machine, its own pause/wake rhythm, its own billing unit.
- **It turns "running unattended" into a product**: shared tmux, webhook wake-ups, OIDC federation, per-minute billing, 5-minute idle auto-pause — all six are required.
- **It moves fan-out from demo to daily**: running 8 parallel agents locally is a "can I" question; running 8 in the cloud is a "do I want to pay this much" question — and Orb compresses the latter to "per-minute".
- **It inverts the relationship between agent and ticket**: you used to open a ticket for an agent; now you open an agent for a ticket — the agent is the ticket's executor; the ticket degrades to a notification and archive container.
- **It draws the safety guardrails for "unattended agents"**: capability is not authority, OIDC federation + webhook signing + mandatory review + shared tmux keep the "letting go" bounded.

The sentence to remember: **the stronger the model, the less you should lock it onto a single machine. Orbs is Amp's engineering answer to the agent era — a remote machine that runs an Amp agent, billed by the minute, woken on demand, paused after 5 minutes idle, so you can keep working (or stop working) while the agent keeps going.**

---

## Appendix: References

- [Agents in Orbs (2026-06-30 announcement)](https://ampcode.com/news/agents-in-orbs)
- [The Coding Agent Is Dead (2026-02-19 editorial)](https://ampcode.com/news/the-coding-agent-is-dead)
- [Orbs User Manual](https://ampcode.com/manual/orbs)
- [Size the Orbs of Production (2026-08-07 price table)](https://ampcode.com/news/size-the-orbs-of-production)
- [More Orb Sizes (2026-07-03 storage doubling)](https://ampcode.com/news/more-orb-sizes)
- [OIDC from Orbs](https://ampcode.com/manual/orbs/oidc)
- [Amp Pricing](https://ampcode.com/pricing)
