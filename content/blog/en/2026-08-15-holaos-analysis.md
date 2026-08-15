---
title: 'holaOS Deep Dive: The Computer for You and Your Agent — an Open-Source All-in-One AI Agent Workspace'
date: "2026-08-15"
description: "An in-depth analysis of holaboss-ai/holaOS (7.4k-star open source project, Electron + TypeScript): an open-source all-in-one AI agent workspace — run any agent (Claude Code, Codex, or the built-in holaOS agent) in one local-first workspace, over your tools, your files, and one shared memory. Core idea: 'The Computer for You and Your Agent' — the protagonist of the agent era is not a chat window but a computer you share with your agents; what actually captures value is not the model itself (models are commoditized) but the workspace layer above agents: shared memory, real application surfaces (HolaApps), and a full workstation agents can operate. Project overview: local-first Electron desktop app + in-process runtime (runtime/{harnesses,harness-host,api-server,state-store}), bun + turbo monorepo; six core features — run any agent, one memory shared by every agent, models built-in or BYOK, HolaApps real application surfaces, Skills/Integrations/MCP teach-once-reuse-everywhere, an entire workstation operable by agents (real browser / frontier generation / real deliverables / any chat entry / automation); three delivery forms (desktop app / open-source self-host / enterprise SSO). Detailed tutorial: one-line install (install.sh), full manual install flow (desktop:install → .env → prepare-runtime:local → typecheck → dev), runtime bundling (self-contained runtime: API + bundled Node/npm + bundled Python), debugging the pi brain with the hola CLI, packaging & release (dist:mac/dist:win, CI signing & notarization, YYYY.MDD.R versioning), security model (contextIsolation/nodeIntegration/webviewTag). Design philosophy: local-first & data ownership, agent-agnostic (no lock-in), shared context over agent silos, real surfaces not chat, teach once reuse everywhere, zero-setup default + BYOK flexibility, self-contained runtime, security-first, human-in-the-loop. Key viewpoints: Agent OS is the next platform layer; memory is the moat; the workspace layer captures value once models are commoditized; the open-source + hosted dual path; self-contained runtime as the pragmatic choice for AI workspaces."
tags:
  - holaOS
  - Holaboss
  - AI Agent
  - Agent Workspace
  - Agent OS
  - Electron
  - TypeScript
  - Claude Code
  - Codex
  - MCP
  - Skills
  - Shared Memory
  - Local-First
  - BYOK
  - HolaApps
  - Design Philosophy
categories:
  - Deep Dive
  - AI Agent
  - Open Source
---

# holaOS Deep Dive: The Computer for You and Your Agent — an Open-Source All-in-One AI Agent Workspace

> Core idea: **"The Computer for You and Your Agent."** The holaOS founders believe the true protagonist of the agent era is not a stack of chat windows but a **computer you can use together with your agents**. They turned that vision into an open-source all-in-one AI agent workspace: run **any** agent — Claude Code, Codex, or the built-in holaOS agent — in one local-first workspace, sharing the same memory, the same tools, the same browser, and the same app ecosystem. "Use the best agent for the job without rebuilding your setup every time." The deeper judgment: **models are rapidly commoditizing (their value is trending to zero), and the layer that actually captures value is the "workspace layer" above agents** — shared memory, real application surfaces, and a full workstation agents can operate.

## Background & Project Introduction

By 2026, the AI agent landscape had become fiercely competitive: Claude Code, OpenAI Codex, Cursor, Windsurf… every agent is trying to become the developer's single entry point. But the holaOS team (holaboss-ai) offers a different perspective: **why should we choose between agents at all?**

holaOS's answer — don't bet on any single agent; bet on **the "computer" that hosts them all**. Just as you don't lose your files, bookmarks, and history when you switch browsers, you shouldn't lose your memory, tools, and skills when you switch agents. holaOS is this "operating system of the agent era": open source, local-first, and agnostic to any specific agent — a **workspace layer**.

### Project Metadata

| Field | Value |
|-------|-------|
| Repository | https://github.com/holaboss-ai/holaOS |
| Stars | 7.4k |
| Forks | 642 |
| Watchers | 172 |
| License | Modified Apache 2.0 (additional commercial-distribution and branding conditions) |
| Language | TypeScript (Electron desktop app + in-process runtime) |
| Package Manager | bun 1.3.6 + turbo (monorepo) |
| Platforms | macOS (Apple Silicon + Intel), Windows, Linux |
| Form | Electron desktop app + self-contained runtime bundle |
| Commits | 73 |
| Website | https://www.holaos.ai |
| Security Contact | admin@holaboss.ai (private reporting) |

### One-Sentence Positioning

holaOS is an **open-source, local-first, all-in-one AI agent workspace**: run any agent — Claude Code, Codex, or the built-in holaOS agent — in one workspace, sharing the same memory, tools, and app ecosystem, with models built in or bring-your-own-key (BYOK).

## Core Idea: Why "a Computer," Not "a Chat Box"

The soul of the entire holaOS project can be broken into four progressive judgments:

### 1. The protagonist of the agent era is the "computer," not the "chat"

Most AI products design interaction as a chat box: you send a message, the AI replies with text. The holaOS founders believe this is the wrong metaphor. The real paradigm is a **computer** — you and your agents share one machine, one set of files, one browser, one set of apps. Agents don't produce "conversation transcripts"; they produce **real, landed deliverables**: real `.xlsx` reports, real `.pptx` slides, real `.docx` documents, real application surfaces they operated.

### 2. Models are commoditized; value lives in the workspace layer

With Kimi K3 and GLM 5.2 built in (cost-efficient for everyday volume), plus GPT 5.6, Claude Opus 5, and Fable 5 (top-tier for hard problems), and BYOK for OpenAI/Anthropic or any compatible endpoint — the judgment behind this is: **the model itself is no longer a source of differentiation**. Differentiation lives in the layer above the model: the **orchestration and sharing** of memory, tools, skills, apps, and workflows.

### 3. No lock-in: agents are pluggable, the workspace is durable

holaOS explicitly promises "No lock-in" — bring the agent you already trust. Switch agents, close the app, come back next week: it already knows where you left off. **Shared everything** (one context, one set of tools, one workspace) + **consistent results** (the same skills and integrations, whatever's driving).

### 4. Teach once, reuse everywhere

In holaOS, the Skills, Integrations, MCP servers, and Combos you configure for one agent are **automatically inherited by every agent**. This pushes the migration cost of "switching agents" to zero — which is precisely the technical foundation that makes the no-lock-in promise credible.

## Project Overview: What holaOS Is

### Six Core Features

#### 🔀 Run any agent, one workspace

Claude Code, Codex, and the built-in holaOS agent — side by side, no switching. Whichever you run, it shares the same memory, tools, skills, and apps.

#### 🧠 One memory, every agent

Context, preferences, and project history live in a **single shared memory** — stored **locally, as plain files you can read and edit**. Switch agents, close the app, come back next week: it already knows where you left off.

- **Never start from zero** — durable memory across sessions *and* agents
- **Local-first & yours** — on your machine, visible and editable, not locked in someone else's cloud
- **Actually recallable** — structured and embedded, so the right context returns when it's needed

#### 💸 Models your way — built in, or bring your own

One account, every model — no keys, no setup, no switching between providers. Frontier models are **built in**: cost-efficient **Kimi K3** and **GLM 5.2** for everyday volume, plus top-tier **GPT 5.6**, **Claude Opus 5**, and **Fable 5** for the hard problems. Prefer your own provider? **Bring your own keys** for OpenAI, Anthropic, or any OpenAI- or Anthropic-compatible endpoint — those run on *your* account, not your holaOS plan.

#### 🪟 HolaApps — apps and agent, side by side

Install apps from the in-workspace marketplace and they open as **real, interactive surfaces right beside your agent**. Watch it work inside the app, step in whenever you want, and the result lands in place — not a wall of chat text, but the actual app, driven by the agent, next to the agent.

- **Real surfaces, not chat** — every app is a live UI (Notion, a browser, your own app)
- **Side-by-side by design** — app and agent share the screen
- **One click to install** — browse the in-workspace marketplace and open any app instantly
- **Bring your own** — point a HolaApp at any URL and MCP server

#### 🧩 Skills, Integrations & MCP — teach it once, reuse everywhere

- **Integrations** — connect Gmail, Notion, Slack, GitHub, Linear and 50+ more with one-click OAuth; agents read and act across your tools, no glue code
- **MCP** — plug in any Model Context Protocol server, or install community MCP servers in one click
- **Skills** — package a workflow once; any agent runs it on demand
- **Combos** — bundle skills and integrations into a single one-click install

#### 🛠️ Your entire workstation, agent-operable

- **🌐 A real browser, driven by agents** — signed-in browsers your agents drive to browse, click, and extract — under your control
- **🎨 Frontier generation built in** — the latest image, video, and audio models inside every agent
- **📄 Real deliverables** — reports, spreadsheets, and slides saved as real `.xlsx`, `.pptx`, and `.docx` files
- **💬 Reach it from anywhere you chat** — Feishu, WeChat, Slack, Telegram
- **⏰ Automation** — run on a schedule or a trigger

### Three Delivery Forms

| Form | Description |
|------|-------------|
| 🖥️ Desktop app | Download and go; frontier models built in, free to start |
| 🔓 Open source | Self-host it; Modified Apache 2.0, bring your own keys, run entirely on your machine |
| 🏢 Enterprise | SSO with per-role permissions for every agent, skill, and app; audit logs on every action; on-prem or your own cloud |

### Technical Architecture: Electron Desktop + In-Process Runtime

holaOS uses a bun + turbo monorepo, with the core split between the **desktop app** and the **in-process runtime**:

```text
holaOS/
├── apps/                     # Applications
│   ├── desktop/              # Electron desktop app (Vite renderer + electron main/preload)
│   └── docs/                 # Documentation site
├── runtime/                  # In-process runtime (core)
│   ├── api-server/           # Runtime API server
│   ├── channel-gateway/      # Channel gateway
│   ├── harness-host/         # Runtime host (pi/Hola brain runs here)
│   ├── harnesses/            # Harnesses (incl. the pi brain)
│   └── state-store/          # State store (better-sqlite3)
├── packages/                 # Shared packages (e.g. @holaboss/app-sdk)
├── shared/                   # Shared code
├── scripts/                  # install.sh, hola.mts, etc.
└── patches/                  # Dependency patches
```

The desktop is Electron + React 19 + TypeScript + Vite + Tailwind CSS with a three-pane layout (file explorer / in-app browser panel / AI chat assistant), accessing the local filesystem and embedded browser through a secure preload bridge (`contextIsolation: true`, `nodeIntegration: false`, `webviewTag: true`).

The runtime is a **self-contained bundle**: it packages the runtime API, a bundled Node/npm, and a bundled Python. The desktop app stages the runtime under `apps/desktop/out/runtime-<platform>`, guaranteeing environmental determinism and portability.

### Built-in Skills (Default Skill Library)

audience-analyst, content-planner, content-writer, data-analyst, email-writer, idea-generator, image-generator, meeting-notes, performance-reporter, prd-writer, proposal-writer, summarizer, tone-adapter, translator, trend-spotter, video-generator, web-researcher — the default example of "teach once, reuse everywhere."

## Detailed Tutorial: Installing holaOS from Scratch

### Method 1: One-Line Install (Recommended)

On a fresh macOS, Linux, or WSL machine:

```bash
curl -fsSL https://raw.githubusercontent.com/holaboss-ai/holaOS/refs/heads/main/scripts/install.sh | bash -s -- --launch
```

By default, that script:
1. Installs `git` if it is missing
2. Installs Node.js 24 plus npm if they are missing
3. Clones the repo into `~/holaboss-ai`
4. Creates `apps/desktop/.env` from `apps/desktop/.env.example` if needed
5. Runs `npm run desktop:install`
6. Runs `npm run desktop:prepare-runtime:local`
7. Runs `npm run desktop:typecheck`
8. Stops before launching Electron (unless you pass `--launch`)

Optional flags:
- `--dir <path>` to choose a different checkout directory
- `--ref <git-ref>` / `--branch <git-ref>` to install from a branch or tag other than `main`
- `--launch` to continue into `npm run desktop:dev`

If you're already inside a local checkout and want to reuse the same wrapper directly:

```bash
bash scripts/install.sh --dir "$PWD"
```

### Method 2: Manual Install (Control Every Step)

First verify the prerequisites:

```bash
git --version
node --version    # must be >= 24
npm --version
```

Then run in order:

```bash
# 1. Clone the repository
git clone https://github.com/holaboss-ai/holaOS.git holaboss-ai
cd holaboss-ai

# 2. Install desktop dependencies
npm run desktop:install

# 3. Create the local environment file
cp apps/desktop/.env.example apps/desktop/.env

# 4. Prepare the local runtime bundle
npm run desktop:prepare-runtime:local

# 5. Quick non-interactive verification before launching
npm run desktop:typecheck

# 6. Start development mode
npm run desktop:dev
```

The `predev` hook of `npm run desktop:dev` automatically validates the environment, rebuilds native modules, and ensures the runtime bundle is staged — so the normal dev path needs no manual prepare step.

### Two Sources for the Runtime Bundle

```bash
# Build the runtime from local source and stage it
npm run desktop:prepare-runtime:local

# Fetch the latest published runtime for the current platform from GitHub Releases
npm run desktop:prepare-runtime
```

Use the local-source path when you're actively changing runtime code; use the published bundle to verify the desktop against a known release artifact.

### Runtime Validation (Optional, for Fresh Clones)

```bash
npm run runtime:state-store:install
npm run runtime:state-store:build
npm run runtime:harness-host:install
npm run runtime:harness-host:build
npm run runtime:api-server:install
npm run runtime:test
```

### Advanced: Debug the pi Brain with the hola CLI

`scripts/hola.mts` lets you run the **pi (Hola) brain** in-process from source for debugging **without opening the desktop UI**: set breakpoints in `runtime/harness-host/src/pi.ts`, edit-and-rerun with no build/stage loop, and spin up multiple instances.

```bash
# Close the desktop for THIS checkout first (to avoid write contention), then:
npm --prefix runtime/api-server run hola -- -p "list the files in this repo and summarize it"
```

It calls the runtime's real `executeTsRunnerRequest` pipeline and overrides only the `runHarnessHost` dep to run `runPi()` in-process instead of spawning `harness-host run-pi`. So every build stage (MCP, sidecar, skills, tools, `model_client`, injected context) is **faithful to a desktop run**; only the harness subprocess is swapped. Events stream through the real relay (so `harness_session_id` is persisted → resume works).

Common flags: `-p/--prompt`, `--cwd`, `-m/--model`, `-s/--session <path>` (resume a specific session), `--fresh` (new session), `--no-runtime` (skip HTTP-backed tools), `--keep` (leave the launched runtime up), `--force` (open a root a live desktop is using), `--print-request` (build + print, no model call), `--debug` (raw events), `--port`.

### Packaging & Release (Advanced)

```bash
# macOS (local ad-hoc signing)
npm run dist:mac
npm run dist:mac:dmg

# Windows (NSIS installer)
npm run dist:win
```

- `dist:mac` produces an unsigned local `.app` (with `runtime-macos` embedded in `Contents/Resources/`)
- `dist:mac:dmg` produces a local-use `.dmg` installer
- Production signing and notarization happen in GitHub Actions (once Apple secrets are configured)
- Desktop release versioning uses stable semver in `YYYY.MDD.R` format (e.g. `2026.410.1`, `2026.1113.1`); GitHub release tags are `holaOS-YYYY.MDD.R`

### Security Model

- Renderer: `contextIsolation: true`, `nodeIntegration: false`, `webviewTag: true` (intentionally enabled for the embedded browser pane)
- The preload bridge exposes only runtime info and a constrained filesystem API
- Security issues (credential exposure, RCE, sandbox escape, auth bypass, unsafe default configs) should be reported **privately** to `admin@holaboss.ai`, not as public issues

## Design Philosophy: holaOS's Nine Principles

### 1. Local-first & data ownership

Memory is plain files on your machine — visible, editable, migratable. "Not locked in someone else's cloud" is a direct response to the "memory black box" of SaaS AI products. User data sovereignty is the foundation of product trust.

### 2. Agent-agnostic

Don't bet on a single agent; decouple the workspace layer from agents. Claude Code, Codex, and the built-in agent are **pluggable executors**; the workspace (memory/tools/skills/apps) is a **durable asset**. This is both a promise to users (no lock-in) and a positioning choice (don't pick a side).

### 3. Shared context over agent silos

Each agent maintaining its own memory and tools is enormous waste and fragmentation. holaOS's core claim: **context, preferences, and project history should be a single shared asset**, no matter which agent is driving. This is also the source of the "Consistent results" promise.

### 4. Real surfaces, not chat

An agent's output should be **real application surfaces and real files**, not a wall of chat transcripts. HolaApps places apps and the agent side by side — "app and agent share the screen, so you always see what's happening and can take over." **Human-in-the-loop** is built into the design, not patched on afterward.

### 5. Teach once, reuse everywhere

Skills, integrations, MCP, and Combos are **agent-agnostic assets**. This elevates the unit of knowledge reuse from "a single agent" to "the entire workspace," and pushes the migration cost of switching agents toward zero — making the no-lock-in promise credible.

### 6. Zero-setup default + BYOK flexibility

Built-in models mean a zero-setup default: one account, every SOTA model, no API keys to manage. BYOK means your keys, your providers, your rates. This satisfies both ease-of-use and autonomy — the default path is frictionless, the advanced path isn't locked down.

### 7. Self-contained runtime

Bundle the runtime API, Node/npm, and Python into the runtime bundle, which the desktop app stages before running. This guarantees **environmental determinism** (independent of the host's Node/Python versions), portability, and reproducibility — an AI workspace cannot rest on the assumption that the user's machine environment happens to be correct.

### 8. Security-first

`contextIsolation` + a constrained preload bridge + an explicit private vulnerability-reporting process + enterprise audit logs. Agents can operate your browser and files, so security must be a first-class citizen. The security policy explicitly lists five classes of sensitive issues (credential exposure, RCE, sandbox escape/privilege escalation, auth bypass, unsafe default configs exposing the local runtime), showing how seriously the team treats "agent permissions."

### 9. Deterministic docs for agents

INSTALL.md is explicitly written as "a deterministic setup runbook for an agent working from a fresh machine" — it even provides a one-sentence handoff letting Codex/Claude Code execute the install directly. AGENTS.md mandates that icons go through the `@/components/ui/icons` wrapper layer and that commits use detailed Conventional Commits format. **This repository itself is a demonstration of an "agent-friendly codebase"** — documentation written not just for humans to read, but for agents to execute.

## Key Viewpoints

### Viewpoint 1: Agent OS is the next platform layer

The model layer is commoditizing (SOTA gaps are narrowing and everyone is chasing everyone), and the application layer is already controlled by giants. The real white space is **the operating-system layer hosting agents** — the orchestration layer of memory, tools, skills, and apps. That's exactly the position holaOS is betting on. "The Computer for You and Your Agent" is not a marketing slogan; it's a platform judgment.

### Viewpoint 2: Memory is the moat

Durable shared memory across sessions and agents is holaOS's deepest differentiation. When every agent can call models and tools, **"remembering" is what's scarce**. And the choice to store memory "as plain files you can read and edit" is extremely clever: it honors the local-first promise while making the memory auditable, migratable, and trustworthy.

### Viewpoint 3: Once models commoditize, the workspace layer captures value

The posture of built-in frontier models + BYOK says: holaOS doesn't make money on models (that's the commoditized layer) — it makes money on **orchestration, memory, the app ecosystem, and enterprise security**. This is an explicit rebuttal of the "model-as-moat" narrative: the moat lives above the model.

### Viewpoint 4: The open-source + hosted + enterprise triple path

Desktop app (free to start) → open-source self-host (BYOK) → enterprise (SSO/audit/private deployment). This is both a growth funnel (open source drives adoption, enterprise monetizes) and a trust strategy (the self-host option removes the "my data is in your cloud" objection).

### Viewpoint 5: Agents need "visible, takable-over" operating surfaces

HolaApps's side-by-side design answers a key question of agent safety: **how do you make users trust an agent operating real applications?** The answer — make the operation fully visible (side-by-side) and make takeover always possible (step in whenever). Trust is not piled up by permission systems; it's piled up by **transparency**.

### Viewpoint 6: A self-contained runtime is the pragmatic choice for AI workspaces

Bundling Node/npm/Python into the runtime bundle sacrifices size for determinism and portability. For an AI workspace, **reproducibility matters more than lightness** — the toolchains agents execute must be stable. This choice is directly instructive for similar products.

### Viewpoint 7: The paradigm shift from "conversational AI" to "workspace AI"

holaOS represents a consensus taking shape: **the ultimate AI interaction is not a dialog box but a shared working environment**. Agents work in your browser, in your apps, in your filesystem, produce real deliverables, reach you from any chat entry point, and run automatically on schedules — "chat" is just one human interface among several, no longer the whole product.

## Conclusion

holaOS is one of the most representative "workspace school" projects in the 2026 agent-infrastructure race. It doesn't bet on which agent wins; it bets on a more fundamental layer: **the computer of the agent era**. 7.4k stars and 642 forks show this judgment resonates widely.

Its core lesson can be condensed into one sentence: **when models are no longer scarce, the "durable workspace shared with your agents" is what's scarce.** Whether it's the local-first shared-memory design, the HolaApps real-surfaces-not-chat paradigm, the teach-once-reuse-everywhere skill system, or the deterministic docs written for agents, holaOS is answering the same question: **how to make "use any agent to do any work" as natural, reliable, and take-over-able as using a computer.**

For people building AI products, holaOS is worth dissecting on many fronts: its monorepo structure, its self-contained runtime approach, the HolaApps side-by-side interaction paradigm, and the "memory-as-moat" product judgment. For end users, it offers a rare promise: **switching agents no longer means starting from zero.**