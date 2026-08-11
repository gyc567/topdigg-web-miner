---
slug: bb-ide-analysis
title: "bb Deep Dive: The Agent IDE That Builds Itself — a Programmable Workspace for Orchestrating Every Coding Agent (Project Overview + Quick-Start Tutorial + System Architecture + Design Philosophy)"
description: "Using get-bb/bb (an MIT-licensed open-source GitHub project, ~1.6k stars) as the subject, this is a complete analysis of 'The agent IDE that builds itself'. Core idea: bb is a programmable workspace for coding agents — users and agents are both first-class operators, and all four surfaces (desktop app, web app, CLI, and HTTP API) are first-class citizens; work runs in threads that you can follow live, steer at any point, or hand off to another agent; agents aren't just orchestrated — they can programmatically drive bb via the SDK/CLI/HTTP API, enabling 'orchestration of orchestrators' and bootstrapping. Project overview: rather than inventing new agents, bb orchestrates the provider CLIs you already have — Claude Code, Codex, Cursor (ACP), Pi, OpenCode, Grok Build, Hermes, etc. (reusing already-authenticated credentials). Quick-start tutorial: npx bb-app@latest → http://localhost:38886; CLI (bb skill list / config / env / ssh-target); Node SDK (BBSdk: spawn a thread → wait idle → output). System architecture: Server (SQLite source of truth + HTTP API + WebSocket event push, itself stateless) → Host daemon (resident on each execution machine, provisions workspaces, runs provider processes) → App → CLI; the data model includes Project/Source, Thread (standard/manager/child delegation), Environment (managed/unmanaged), and Host; two contract packages — @bb/server-contract and @bb/host-daemon-contract — strictly delineate component boundaries. Design philosophy, six principles: users and agents as dual first-class operators, extensible (adapts to your infrastructure rather than forcing you to fork), flexible not rigid (strong defaults + reusable primitives), work anywhere (from single machine to remote/cloud evolution), fast and understandable, easy to trust and adopt (local-first). Takeaways: orchestration over invention, threads as the unit of work, contract-driven architecture, SQLite source of truth + stateless Server, local-first with hosting as incremental extension, anonymous telemetry that can be turned off."
date: "2026-08-11"
author: "TopDigg"
tags: ["bb", "Agent IDE", "AI Agent", "Agent Orchestration", "Claude Code", "Codex", "IDE", "DevTools", "Programmable Workspace", "Threads", "Agentic Development", "Monorepo", "Electron"]
categories: ["Deep Dive"]
keywords: ["bb", "agent IDE", "Agent IDE", "agent orchestration", "Agent Orchestration", "programmable workspace", "Programmable Workspace", "threads", "Threads", "Claude Code", "Codex", "BBSdk", "stateless server", "SQLite", "design philosophy", "get-bb"]
---

# bb Deep Dive: The Agent IDE That Builds Itself — a Programmable Workspace for Orchestrating Every Coding Agent

> Core idea: **bb is "The agent IDE that builds itself"** — a programmable workspace for coding agents. Rather than inventing a new agent, it orchestrates the coding agents **you already have** — Claude Code, Codex, Cursor, Pi, OpenCode, Grok Build, Hermes, and others — and lets them **programmatically drive bb** in turn. All four surfaces (desktop app, web app, CLI, HTTP API) are first-class citizens; all work runs in **threads**, which you can follow live, steer at any point, or hand off to another agent; threads can also spawn child threads for native delegation. "Builds itself" means bb itself is developed and iterated on using these same mechanisms (dogfooding). Under the hood is a contract-driven architecture: a stateless Server + SQLite source of truth + WebSocket event push, with Host daemons running provider processes on each execution machine. Design philosophy, six principles: **users and agents are both first-class operators, extensible (adapts to your infrastructure rather than forcing you to fork), flexible not rigid (strong defaults + reusable primitives), work anywhere (from single machine to remote/cloud evolution), fast and understandable, easy to trust and adopt (local-first).**

---

## 1. Project Overview

### 1.1 What Is It?

This article analyzes the **GitHub open-source repository `get-bb/bb`**, whose subtitle is *"The agent IDE that builds itself"*. It is published on npm as `bb-app` (with `latest` / `nightly` channels), licensed under MIT, and sits at roughly **1.6k stars, 155 forks, and 4500+ commits** as of writing — under active development: the core architecture is stable, but the workflows and surfaces are still evolving.

A one-line positioning: **bb is a programmable workspace for coding agents** — you can seamlessly orchestrate all your favorite coding agents together and let them programmatically drive bb. It's not just "another AI editor"; it's an **OS-like control plane for agents**: humans can drive agents through an interface, and agents can drive agents through interfaces too.

It is the exact opposite of the "build another agent from scratch" route: **bb reuses the provider CLIs already installed and authenticated on your machine** (Codex, Claude Code, Cursor, etc.). It doesn't hold models itself, doesn't reinvent agents — instead it plays "orchestrator + workspace + real-time control plane". A single `npx bb-app@latest` command is all it takes to start: it downloads the `bb-app` package, starts the Server and the local Host daemon, serves the web app, and then you open `http://localhost:38886` in your browser to start using it.

### 1.2 Key Data and Facts

- Repository: `https://github.com/get-bb/bb` (MIT license, ~1.6k stars / 155 forks / 4585 commits)
- Release: npm package `bb-app`, stable channel `npx bb-app@latest`, nightly build channel `npx bb-app@nightly`
- Runtime prerequisites: Node.js 22.19 / 24 / 26 + Git + at least one authenticated agent provider
- Supported platforms: macOS (desktop version for Apple Silicon arm64), Linux; Windows must run inside WSL2 (native PowerShell/CMD is not supported)
- Default port: `http://localhost:38886`; data directory `~/.bb/` (dev instances `~/.bb-dev/<checkout-instance>/`)
- Telemetry: production runs send anonymous usage telemetry (app launches, number of threads created, number of user messages), identified by a random install ID, with no user/host/project/workspace/message content; `BB_TELEMETRY=false` disables it; source-tree dev runs never send any
- State storage: **the SQLite database is the source of truth**, and the Server itself is stateless
- Orchestrated objects: Codex, Claude Code, Cursor (via ACP), Pi, OpenCode, Grok Build, Hermes Agent, plus any custom ACP-compatible agent (`customAcpAgents`)
- Four surfaces: desktop app (Electron, macOS arm64), web app, CLI (`bb`), HTTP API; plus the Node SDK (`BBSdk`)
- Native skills index: automatically reads the skill root directories of Codex / Claude Code / Pi / Cursor / OpenCode / omp / Grok Build / Hermes and surfaces them into each provider's `/` command menu
- Business form: `getbb.app` provides the marketing site plus bb connect authentication/dashboard (TanStack Start on Cloudflare Workers)

### 1.3 What Problem Does It Solve?

1. **The orchestration gap for multiple agents**: teams often run several coding agents at once — Codex, Claude Code, Cursor, and so on — each working in its own silo with fragmented context. bb provides a unified workspace and thread model, turning "open a thread, assign a task, watch progress, hand off" into a single cross-provider operation.

2. **Agent programmability**: most agent tools are built only for "a human typing commands" and are hard to invoke from other programs or agents. bb makes the CLI, SDK, and HTTP API first-class interfaces — **an agent can open a thread to have another agent do work**, producing "orchestration of orchestrators".

3. **Workflow visibility and controllability**: long-running black-box agents are a pain point. bb's threads carry lifecycle state plus an append-only event stream (messages, tool calls, file changes), so you can **follow live, steer at any point, and take over mid-flight**, and you can spawn child threads for delegation (manager / child threads).

4. **Environment and multi-machine issues**: a Project maps to a repository and binds to a specific Host; an Environment is either managed (bb owns the lifecycle and auto-cleans once no longer referenced) or unmanaged (points at an existing directory); the Server can register multiple remote Hosts. It runs fine on a single machine, but remote orchestration isn't locked out either.

---

## 2. Core Ideas

### 2.1 A One-Sentence Worldview

> **"The agent IDE that builds itself."**
> **"bb is a programmable workspace for coding agents."**

These are the project's mottos, and they draw the line between bb and traditional IDEs or conventional agent tools: **the evolution of the IDE is not "smarter autocomplete" but "an interface through which humans can programmatically control how agents work"**; the value of an agent lies not in going solo but in **being orchestratable, handoff-able, and programmatically invocable**.

### 2.2 "Users and Agents Are Both First-Class Operators"

**Users and agents are both first-class operators** — bb is for humans and for agents alike. The four surfaces (desktop app, web app, CLI, HTTP API) expose the same core functionality, and the CLI is **absolutely not a sidecar or an afterthought patch**. Scripts and agents learn which Server and which thread they are running in via the `BB_SERVER_URL` / `BB_THREAD_ID` environment variables, and can open new threads, check status, and fetch output.

### 2.3 Threads Are the Unit of Work

Each thread is a **conversation with an agent provider + lifecycle state + an append-only event stream** (messages, tool calls, file changes, etc.). Threads come in two kinds:

- **standard thread**: does the work directly;
- **manager thread**: coordinates other threads and can own **child threads** for delegation.

"Follow live, steer at any point, or hand off to another agent" is realized on top of this event stream + state model — **work isn't thrown over the wall; it stays observable, intervenable, and transferable at all times**.

### 2.4 Programmable, Extensible, Trustworthy

- **Programmable**: the CLI, SDK (`BBSdk`), and HTTP API are all first-class citizens, so agents can drive bb programmatically;
- **Extensible**: extension points are supported for custom providers, environments, LLM-backed services, CLI integrations, UI surfaces, and more — the system adapts to your infrastructure and workflows rather than forcing you to fork;
- **Trustworthy**: local-first — evaluation and adoption don't require going to the cloud; hosted features can be extended later but **don't replace the core product**; telemetry is anonymous and can be turned off.

---

## 3. Detailed Tutorial

### 3.1 Quick Start (Installation and Running)

**Prerequisites:**

- Node.js 22.19 / 24 / 26;
- Git;
- at least one supported agent provider: Claude Code, Codex, Cursor (via ACP), Pi, OpenCode, Grok Build, Hermes, or another ACP-compatible agent.

**Step one: start.** The desktop app is recommended (currently macOS Apple Silicon only): download it from the [desktop-latest release](https://github.com/get-bb/bb/releases/tag/desktop-latest); Intel Macs and Linux use npx:

```bash
npx bb-app@latest
```

Then open: `http://localhost:38886`

To use the nightly automatic builds (which may be unstable):

```bash
npx bb-app@nightly
```

`npx bb-app@latest` downloads the `bb-app` package, starts the Server and the local Host daemon in the same process tree (if any child process exits abnormally, the launcher restarts only that child), serves the web app, and stores state in `~/.bb/` by default. `Ctrl+C` in the terminal stops both processes and exits with status code 0.

To stop bb running in another terminal or in the background:

```bash
npx bb-app stop
```

`stop` reads `bb-app-runtime.json` in the data directory and only stops the process after confirming it was actually started by this launcher; pass `--data-dir` for a non-default data directory.

**Step two: prepare provider credentials.** bb directly reuses your authenticated provider CLIs:

| Provider | Setup |
|----------|------|
| `codex` | Install the [Codex CLI](https://developers.openai.com/codex/cli) and run `codex login` |
| `claude-code` | Install [Claude Code](https://docs.anthropic.com/en/docs/claude-code) and authenticate as per the docs |
| `cursor` | Install Cursor's agent CLI (`cursor-agent`) and authenticate |
| `pi` | bb ships with a pinned Pi runtime built in; no Pi executable needs to be installed; Pi extensions can add models and tools |
| `opencode` | Install [opencode](https://opencode.ai/) and authenticate |
| `grok` | Install [Grok Build](https://docs.x.ai/build/overview), run `grok login` or set `XAI_API_KEY` |
| `hermes-agent` | Install [Hermes Agent](https://hermes-agent.nousresearch.com/docs/getting-started/installation), configure credentials with `hermes model`, verify with `hermes acp --check` |

**Step three: start working.** In the app, add/open a project, start a thread, pick the provider that thread will use, and start the conversation. Production runs send anonymous telemetry, which can be disabled with `BB_TELEMETRY=false`.

### 3.2 CLI Tutorial

The CLI targets an **already-running bb Server**:

```bash
npx --package bb-app bb --help
```

The CLI and SDK share the same `BB_SERVER_URL` and bb config resolution; when unset, they default to the locally bundled Server at `http://127.0.0.1:38886`.

Common commands:

```bash
# View the skills list (native + plugin)
bb skill list

# Package-level non-sensitive configuration (~/.bb/config.json)
npx bb-app config set BB_APP_URL https://<machine>.<tailnet>.ts.net
npx bb-app config set BB_INFERENCE codex/gpt-5.6-luna
npx bb-app config set BB_TRANSCRIPTION codex/gpt-transcribe
npx bb-app config list
npx bb-app config refresh

# Local-editor open mapping for a remote bb Server (~/.bb/client.json)
npx bb-app client ssh-target set https://bb.example.test devbox
npx bb-app client ssh-target list

# Provider credentials (~/.bb/env.json, list masks all values)
npx bb-app env set OPENAI_API_KEY <key>
npx bb-app env list
npx bb-app env unset OPENAI_API_KEY
```

Writes to `config`/`env` request a hot reload from the running local bb Server; if bb isn't running, they take effect on the next start.

### 3.3 SDK Programming Tutorial (Making Agents Use bb Programmatically)

`bb-app` also exports a Node SDK, so scripts can drive an already-running bb Server:

```ts
import { BBSdk } from "bb-app";

const bb = new BBSdk();
const thread = await bb.threads.spawn({
  projectId: "proj_personal",
  environment: { type: "host", workspace: { type: "personal" } },
  prompt: "Summarize my active bb work.",
});
await bb.threads.wait({ threadId: String(thread.id), status: "idle" });
console.log(await bb.threads.output({ threadId: String(thread.id) }));
```

The flow has three steps: **spawn (open a thread) → wait idle (wait for the thread to become idle) → output (fetch the output)** — precisely the minimal primitive for "agents orchestrating agents". `new BBSdk()` uses the same `BB_SERVER_URL` and config resolution as the CLI; for remote/test targets you can pass `new BBSdk({ baseUrl: "http://host:38886" })`. **Scripts launched by bb automatically receive the `BB_SERVER_URL` and `BB_THREAD_ID` environment variables**, letting them know which Server and which thread they are running in.

### 3.4 System Architecture (Runtime Breakdown)

Four runtime components:

| Component | Responsibility |
|------|------|
| **Server** | The central hub. All state lives in SQLite, it exposes the HTTP API and pushes change notifications over WebSocket; it is itself stateless — the DB is the source of truth; it routes work to each Host over an active daemon WebSocket |
| **Host daemon** | Runs on every enrolled execution machine. Connects to the Server, handles host RPCs, provisions workspaces, runs agent provider processes, and pushes events back; exposes a local HTTP API for the on-machine App/CLI (open editor, pick folder, check daemon status) |
| **App** | Web UI: view projects and threads, follow progress, steer work |
| **CLI (`bb`)** | A first-class interface for both users and agents, with parity with the App and scriptable |

**Data model:**

- **Project**: the top-level container, usually corresponding to a repository; a project has one or more **Source**s (where the code is). A local-path Source belongs to an enrolled Host, so a single project can map to multiple paths across multiple machines.
- **Thread**: the unit of work. Tracks a conversation with an agent provider, has lifecycle state, and produces an append-only event stream (messages, tool calls, file changes, etc.); there are standard threads (do the work directly) and manager threads (coordinate other threads); threads can own child threads for delegation.
- **Environment**: a thread's execution context, binding a workspace (a disk directory) to a Host. It can be **unmanaged** (pointing at an existing directory) or **managed** (bb owns the lifecycle, auto-cleaning when no unarchived thread is using it); multiple threads can share one environment.
- **Host**: the identity of a long-running daemon on an execution machine. The Server has one primary host and can enroll additional remote hosts; project sources and environments both preserve the host boundary.
- **Commands & Events**: the Server dispatches host RPCs over active daemon WebSockets; lifecycle work such as provisioning environments and starting/stopping threads is asynchronous from the API caller's perspective — after the daemon returns the RPC result, the Server settles the command's side effects; the daemon additionally pushes back provider and thread progress in event batches.

**Contracts and boundaries:**

Two contract packages define the boundaries between components: `@bb/server-contract` (the HTTP + WebSocket API from app/CLI ↔ Server: route schema, request/response types, WS notification types) and `@bb/host-daemon-contract` (the protocol from Server ↔ host daemon: command types, event types, session lifecycle, plus the local API for app/CLI). **Implementation packages never import across these boundaries** — the Server doesn't know how workspaces are provisioned, and the daemon doesn't know thread/project details (beyond what commands tell it).

### 3.5 Monorepo Structure (Repository Map)

The monorepo (pnpm workspaces + turbo + vitest) contains the packaged App and its bundled runtime services:

| Package / App | Role |
|-----------|------|
| `packages/bb-app` | The published npm package: the `npx bb-app@latest` launcher, the bundled `bb` CLI entry point, and the public SDK exports |
| `apps/desktop` | The macOS Electron shell: supervises the packaged runtime and loads the bb web UI |
| `apps/app` | Web UI: view projects, threads, environments, and running work |
| `apps/server` | HTTP API, WebSocket notifications, state management, Server-specific product policy |
| `apps/host-daemon` | The Host's local runtime: provisions workspaces, runs provider processes |
| `apps/cli` | The scriptable `bb` CLI (for both users and agents) |
| `apps/web` | The getbb.app site: marketing pages + bb connect auth/dashboard (TanStack Start on Cloudflare Workers) |
| `packages/sdk` | TypeScript SDK: for the CLI, package SDK exports, and programmatic clients |
| `packages/agent-runtime` | Provider runtime adapters and bridges: Codex, Claude Code, Pi, ACP agents |
| `packages/config` | Config parsing, defaults, managed package config schemas, environment variable definitions |
| `packages/db` | SQLite schema, migrations, and data-access helpers |
| `packages/server-contract` | Client ↔ Server HTTP/WS contract types |
| `packages/host-daemon-contract` | Server ↔ host daemon command/event contract |

**Pinned dependencies (the reason isn't obvious from package.json — worth noting):**

- `@opentelemetry/api@1.9.1` (apps/server): both Pi AI and Drizzle pull in `@opentelemetry/api`; without pinning to an exact version, pnpm resolves two copies and TypeScript sees two distinct type identities, causing the server typecheck to fail.
- Pi packages (0.84.0): the Pi bridge and Pi extensions inside `bb-app` import the host machine's Pi modules; the packaged bridge keeps this exact package tree on disk so extensions share one compatible runtime.

### 3.6 Development Mode (Building bb Itself)

```bash
pnpm dev                # Start the Vite App, proxying API/WS to a separate dev server; the launcher prints the actual port
pnpm dev:desktop        # Run the same source dev server inside the Electron desktop shell
pnpm dev:restart        # Rebuild in the background first, then restart only the stateful services
pnpm dev:restart-server
pnpm dev:restart-host-daemon
pnpm start              # Production-mode build (app + server + host-daemon), run straight through the launcher
pnpm bb --help          # The built CLI, pointed at the default/production instance
pnpm reset              # Clear production state
pnpm bb:dev --help      # The source CLI, pointed at this checkout's dev instance
pnpm reset:dev          # Clear this checkout's dev state
pnpm reset:all          # Clear both production and dev state
```

Design points: each checkout has its own data directory `~/.bb-dev/<checkout-instance>/` and a deterministic high-numbered port derived from the checkout path; multiple worktrees can run in parallel with a packaged `npx bb-app@latest` instance. Hot reload behavior is **deliberately split**: the App hot-reloads itself, the Server doesn't hot-reload, and the host daemon doesn't hot-reload — stateful services require an explicit restart. For remote access, `tailscale serve --bg --https=443 http://127.0.0.1:<app-port>` can publish a loopback listener; `pnpm storybook` (Ladle) binds all interfaces, so don't run it on an untrusted network.

### 3.7 Provider and Skills Integration

- **Native skill root index**: bb indexes the documented native skill roots of Codex, Claude Code, Pi, Cursor, OpenCode, omp, Grok Build, and Hermes (user roots, project roots, and compatible roots like `.agents/skills`); these skills show up in the selected provider's `/` command menu; the Skills page and `bb skill list` display the native skills for Claude Code / Codex / Cursor.
- **Pi trust policy**: bb reads Pi's global `~/.pi/agent` file and each workspace's `.pi` files (settings, credentials, models, packages, extensions, skills, prompts, themes, context); bb only loads project resources when Pi has already saved or a global trust policy has approved the workspace; unresolved `ask` decisions remain untrusted.
- **Custom ACP agents**: configured via `customAcpAgents` in `~/.bb/config.json`; optional `modelCli` / `reasoningCli` or `nativeReasoning` inference settings; the `logo` field provides a provider-selector icon; `nativeSkillRoots` (user/project paths) add provider-native skills to the composer; `sharedSkillRoots` let a single physical skill set serve both bb and standalone provider CLIs (bb lists them as read-only skills and injects them into Codex / Claude / Pi / ACP threads).

### 3.8 Configuration and Remote Access

- Persistent config `~/.bb/config.json` (`bb-app config set/list/refresh`); credentials stored separately in `~/.bb/env.json` (`bb-app env set/list/unset`, with `list` masking values).
- Remote use: **bb connect** (auth/dashboard via getbb.app) or Tailscale Serve to publish lockback listeners; directly exposing port `38886` over tailnet/LAN requires the explicit, security-sensitive compatibility option `--server-bind-host 0.0.0.0`.
- Local-editor open mapping for a remote Server: `bb-app client ssh-target set https://bb.example.test devbox`.

---

## 4. Design Philosophy

### 4.1 Users and Agents Are Both First-Class Operators

The first principle in VISION.md. **bb is not "a tool for humans that happens to have an API" — it treats "being programmatically invoked" as a first-class requirement from day one**: the web app, CLI, managers, and future surfaces expose the same core functionality, and the CLI is not a sidecar. This directly shapes the whole design — the SDK, the `BB_SERVER_URL`/`BB_THREAD_ID` injection, the thread model, and so on.

### 4.2 Extensible, Not Forked

**"The system should adapt to a user's infrastructure and workflows, not force them to fork bb."** Custom providers, environments, LLM-backed services, CLI integrations, UI surfaces, and future extension points are all officially supported forms. bb doesn't bet on a single agent ecosystem; it aims to be "the common plane for all agents".

### 4.3 Flexible, Not Rigid

**"strong defaults and built-in flows without forcing users into one blessed way of working."** Both managed and unmanaged flows should feel natural and smooth; the system is built from reusable primitives rather than a pile of hard-coded special cases. Threads, environments, and contracts are all primitives, and product features emerge from composing them.

### 4.4 Work Anywhere

Single-machine use must be great today, but remote orchestration, cloud execution, peer-backed environments, and future mobile aren't locked out. **Local loopback first + Tailscale/bb connect publishing + the explicit `--server-bind-host`** is this philosophy made concrete: secure by default (loopback-only binding), with remote access as an explicit, auditable choice.

### 4.5 Fast and Understandable

Performance, operational simplicity, and low cognitive load **are part of the product**, not after-the-fact optimizations. The split hot-reload (app hot, Server/daemon not), the stateless Server + SQLite source of truth, and the separated contract packages are all "understandability" projected onto the architecture — **each piece knows what it should know, no more, no less**.

### 4.6 Easy to Trust and Adopt

**Local mode remains easy to evaluate and adopt at all times**, especially for teams constrained on security and trust; hosted features can extend bb but **don't replace the core product**. Telemetry is anonymous (random install ID, no content), can be switched off with one click (`BB_TELEMETRY=false`), and dev builds never send anything — trust is a design input, not marketing talk.

---

## 5. Summary: Viewpoints and Conclusions

### 5.1 Core Viewpoint Checklist

1. **Orchestration over invention**: rather than building the Nth coding agent from scratch, orchestrate the Codex/Claude Code/Cursor/Pi agents you already have into a programmable workspace — reusing authenticated credentials and lowering migration costs.
2. **A new paradigm for the IDE**: the IDE evolves from "an interface where humans write code" into "an interface where humans can programmatically control how agents work"; bb is that paradigm made concrete.
3. **First-class surfaces**: desktop/web/CLI/HTTP API are all first-class citizens, and the CLI is not a second-class interface — scriptability is a given in the agent era of IDEs, not a bonus feature.
4. **Threads as the unit of work**: a conversation + lifecycle state + an append-only event stream make "follow live, steer at any point, or hand off to another agent" a first-class capability.
5. **Native delegation primitive**: manager threads + child threads make task delegation between agents a first-class operation rather than ad-hoc kludging.
6. **Bootstrapping (dogfooding)**: "builds itself" isn't just a slogan — bb develops bb using its CLI/SDK/thread mechanisms; developers are users, and users are developers.
7. **Stateless Server + source-of-truth DB**: the Server only does routing and protocol, and SQLite holds all state — state is centralized and components are stateless, which makes restarts and observability natural.
8. **Contract-driven boundaries**: `@bb/server-contract` and `@bb/host-daemon-contract` keep implementation packages from crossing each other's boundaries, letting the provider ecosystem evolve independently.
9. **Local-first, cloud as increment**: loopback binding by default, anonymous telemetry you can disable, and managed/unmanaged environments coexisting — make the single machine trustworthy and usable first, then talk about hosting and cloud.
10. **Environment lifecycle management**: managed environments auto-clean, multiple threads share environments, and projects span hosts — execution environments become an orchestratable resource rather than manual housekeeping.

### 5.2 Key Quotes (Worth Memoing)

- "The agent IDE that builds itself."
- "bb is a programmable workspace for coding agents."
- "Every surface — the desktop app, web app, CLI, and HTTP API — is a first-class way to drive bb."
- "Work runs in threads you can follow live, steer at any point, or hand off to another agent."
- "Users and agents are both first-class operators."
- "The system should adapt to a user's infrastructure and workflows, not force them to fork bb."
- "Flexible, not rigid."

### 5.3 Connections to Other Deep Dives on This Site (What to Read Next)

- **Herdr / Harbor Framework / Codex Orchestration (agent-orchestration tools)**: those projects solve "how multiple agents cooperate"; bb goes further, upgrading orchestration into a **complete IDE workspace + thread model + programmable interfaces**, and even supports orchestrators being orchestrated (nested orchestration).
- **The Loop Engineering series (loop engineering)**: loops/graphs are the runtime shape of agents; bb provides the **runtime and work surface** that carries those shapes — threads as observable, injectable, handoff-able containers.
- **base-like agent IDE tools**: compared to deep binding to a single provider, bb is all about provider neutrality (7+ providers + custom ACP) and all surfaces being first-class citizens — a representative of the "protocol over brand" approach.

---

## References

- Project homepage: `https://github.com/get-bb/bb` (MIT, get-bb organization)
- README: `README.md` — positioning, the four surfaces, desktop download, npx startup, telemetry, dev loop, troubleshooting
- Vision: `docs/VISION.md` — goals and the six design principles (basis for Section 4 of this article)
- System Overview: `docs/system-overview.md` — runtime components, data model, contracts and boundaries (basis for Section 3.4 of this article)
- Repository Overview: `docs/repository-overview.md` — the monorepo's 13-package map and pinned-dependency notes (basis for Section 3.5 of this article)
- Package docs: `packages/bb-app/README.md` — quick start, CLI, SDK scripting, provider credential table, config commands (basis for Section 3 of this article)
- Other docs: `docs/configuration.md`, `docs/platform-support.md`, `docs/multiple-devices.md`, `docs/worktrees.md`
- Related reading (this site): deep dives on Herdr / Harbor Framework / Codex Orchestration, and the deep dives in the Loop Engineering series