---
title: "T3 Code Deep Dive: An Open-Source 'Agent Harness Control Surface' That Drives Five Coding Agents — Product Shape, Hands-On Tutorial, and Design Philosophy"
description: "Using pingdotgg/t3code (GitHub 18k+ stars, MIT, open source) as the spine, this article peels back T3 Code layer by layer: (1) project overview — an open-source 'agent harness control surface' that drives Codex / Claude / Cursor / Grok / OpenCode from web + desktop + mobile; (2) hands-on tutorial — `npx t3@latest` startup, desktop install, 5 providers with their login commands, 4 permission modes (Supervised / Auto-accept edits / Auto / Full access), remote access (LAN / Tailscale / T3 Connect / SSH), 4 source-control providers (GitHub / GitLab / Bitbucket / Azure DevOps), WebSocket + OAuth + DPoP authentication, keybindings, and thread pin; (3) technical architecture — Effect RPC WebSocket, event-sourced orchestration (command→decider→event→projector), 5 provider drivers, checkpoint (hidden git ref), 3 queue-backed workers, Rust resource-monitor sidecar; (4) 6 design philosophies — Open at the core, Performance without compromise, Remote ready, Multi-surface, Complexity at the adapter boundary, Event-sourced truth. Core claim: the agent harness is a product shape that needs a control surface, not another agent framework; T3 Code is the engineering realization of that judgment."
date: "2026-08-10"
author: "TopDigg Research Team"
tags: ["T3 Code", "t3code", "pingdotgg", "Agent Harness", "AI Agent", "Coding Agent", "Codex", "Claude Code", "Cursor", "Grok", "OpenCode", "Effect RPC", "Event Sourcing", "Remote Access", "Tailscale", "T3 Connect", "WebSocket", "OAuth", "Clerk", "Electron", "React Native", "Open Source", "MIT"]
categories: ["Deep Dive"]
keywords: ["T3 Code", "t3code", "pingdotgg", "agent harness", "control surface", "multi-provider", "Codex CLI", "Claude Code", "Cursor CLI", "Grok Build CLI", "OpenCode", "Effect RPC", "WebSocket", "event-sourced", "checkpoint", "Tailscale", "T3 Connect", "Clerk OAuth", "DPoP", "Electron", "React Native", "Expo", "design philosophy", "AGENTS.md"]
---

# T3 Code Deep Dive: An Open-Source "Agent Harness Control Surface" That Drives Five Coding Agents — Product Shape, Hands-On Tutorial, and Design Philosophy

> Core idea: **T3 Code (pingdotgg/t3code) is not another agent framework — it is an "agent harness control surface": a Node WebSocket server that wraps the Codex / Claude / Cursor / Grok / OpenCode provider CLIs into one remotely controllable execution environment, then exposes it through web + desktop (Electron) + mobile (React Native).** The judgment baked into the product is that model capability has already outgrown the agent framework, so **the real bottleneck is "how to manage 5 different agents on one machine and reach them from anywhere."** T3 Code uses Effect RPC over WebSocket, event-sourced orchestration, hidden git refs for checkpoints, an independent Rust resource-monitor sidecar, Clerk OAuth with DPoP proof-of-possession, and three remote transports (Tailscale / T3 Connect / SSH) to make "agent harness" a complete product shape — and it ships MIT-licensed. Its design philosophy (captured first-hand in AGENTS.md) compresses to six lines: **Open at the core; Performance without compromise; Remote ready; Multi-surface; Complexity belongs at the adapter boundary; Event-sourced truth**.

---

## 1. Project Overview

### 1.1 What Is It?

This article analyzes the GitHub repository [`pingdotgg/t3code`](https://github.com/pingdotgg/t3code) (**18k+ stars / 4k+ forks / 1.5k+ issues**, TypeScript, **MIT license**) — an open-source "agent harness control surface" that bridges five coding-agent providers.

A one-sentence summary:

> **T3 Code = a local Node WebSocket server + a React web UI + an Electron desktop shell + a React Native mobile app that lets you drive the Codex / Claude Code / Cursor / Grok Build / OpenCode agents on your machine from any device (phone, tablet, another computer).**

T3 Code itself does not train models, build an agent framework, or replace your subscription. It does five things:

1. **Wraps the provider CLIs** — folds five different protocols (Codex app-server, Claude SDK, Cursor agent, Grok CLI, OpenCode SDK) into a single "provider driver + adapter" interface.
2. **Runs a local server** — the `npx t3@latest` Node process (the package is literally called `t3`) is the **execution boundary** for every provider process, terminal, git operation, and filesystem read; the client never calls a provider directly.
3. **Goes remote** — the same Effect RPC WebSocket protocol can be reached through four transports: same-network, Tailscale, T3 Connect (Cloudflare tunnel), or desktop-managed SSH.
4. **Multi-surface UI** — web, desktop (Electron wrapping the web bundle), and mobile (Expo / React Native, native iOS + Android).
5. **Open source + MIT** — AGENTS.md says it plainly: "if we ever go the wrong direction, you have everything you need to fork."

### 1.2 One-Line Positioning

> **T3 Code is the open-source, bring-your-own-subscription alternative to Claude Desktop, the Codex App, Cursor Glass, and Conductor.**

### 1.3 Key Facts

- **Data**: GitHub 18,104 stars · 4,083 forks · 1,510 open issues (README + GitHub API)
- **License**: MIT
- **Primary language**: TypeScript (pnpm workspace + Vite+)
- **Server Node requirement**: `^22.16 || ^23.11 || >=24.10`
- **5 supported providers**: Codex (OpenAI), Claude Code (Anthropic), Cursor (Cursor), Grok Build (xAI), OpenCode (SST)
- **3 client surfaces**: Web (`app.t3.codes` hosted + `npx t3` local), Desktop (Electron shell), Mobile (React Native, iOS App Store / Google Play)
- **4 remote transports**: direct WebSocket, Tailscale Serve, T3 Connect (Cloudflare tunnel), desktop-managed SSH
- **4 permission modes**: `approval-required` (Supervised) / `auto-accept-edits` / `auto` / `full-access`
- **3 layers**: `apps/server` (execution runtime) / `apps/web`, `apps/desktop`, `apps/mobile` (clients) / `packages/*` (shared contracts, client runtime, telemetry, SSH, Tailscale)
- **Architectural core facts**: the server uses event-sourced orchestration (command → decider → event → projector), per-turn checkpointing via hidden git refs, an independent Rust sidecar for resource telemetry (no Node native addon), and Clerk OAuth + DPoP proof-of-possession for auth
- **Contribution policy**: "We are (mostly) not accepting contributions yet. Small fixes may be considered. Big features will not be." — a high-bar, Theo (`-bPingdotgg`) personally run early-stage project
- **User base**: AGENTS.md cites "over 100,000 users"
- **Repo name**: `pingdotgg/t3code` (the GitHub name is `t3code`, the app is "T3 Code")

### 1.4 The Problem It Solves

The "agent development experience" in 2026 is fragmented into five pieces:

1. **5 providers, 5 different products** — Codex has its own app, Claude Code has its own CLI, Cursor has its own desktop, Grok Build is still in beta, OpenCode is an SDK. Switching between them is discontinuous.
2. **Local-only** — when you walk away with your phone, the agent on your laptop stops being useful.
3. **Weak cross-device sync** — open a thread on desktop, you can't see it on mobile.
4. **Remote + security + performance** — Tailscale or SSH port-forwarding works, but every project re-implements it; managed tunnels usually kill performance.
5. **Permission granularity** — you don't want a model to `rm -rf` on your main branch unattended.

T3 Code's answer: **one open-source execution runtime, one remote protocol, one 4-mode permission system, three native clients, five provider integrations** — collapsing "agent harness" from 5 products to 1.

---

## 2. Detailed Tutorial: From Zero to Remotely Driving 5 Agents

This section walks Install → Providers → 4 Permission Modes → Remote Access → Source Control → Advanced, with copy-pasteable commands, minimal examples, and caveats. Source: [docs/user/](https://github.com/pingdotgg/t3code/tree/main/docs/user).

### 2.1 Step 1: Install T3 Code

**Prerequisites**:

- Node.js `^22.16 || ^23.11 || >=24.10` on the **machine that runs the T3 server**
- At least one provider CLI installed and authenticated (Step 2 below)

**Fastest test drive (no install)**:

```bash
npx t3@latest
```

This launches the T3 server on your machine and opens the local web app. `npx t3@latest --help` shows the full CLI reference.

**Desktop app** (where most people start):

| Platform | Command |
|---|---|
| Windows | `winget install T3Tools.T3Code` |
| macOS | `brew install --cask t3-code` |
| Arch Linux | `yay -S t3code-bin` |
| Any | Download from [GitHub Releases](https://github.com/pingdotgg/t3code/releases) |

> Key point: the desktop app ships its own `t3` backend; you can also let the desktop app be the server, then connect to it from a phone or another computer.

### 2.2 Step 2: Install and Authenticate Providers

T3 Code does **not** bundle the provider CLIs — install which ones you use. Authenticate on **the machine that runs the T3 server** (not your phone, not the device you browse from):

| Provider | Install CLI | Login | Default binary |
|---|---|---|---|
| **Codex** | [Codex CLI](https://developers.openai.com/codex/cli) | `codex login` | `codex` |
| **Claude** | [Claude Code](https://claude.com/product/claude-code) | `claude auth login` | `claude` |
| **Cursor** | [Cursor CLI](https://cursor.com/cli) | `agent login` | `cursor-agent` |
| **Grok Build** | [Grok Build CLI](https://x.ai/cli) | `grok login` | `grok` |
| **OpenCode** | [OpenCode](https://opencode.ai) | `opencode auth login` | `opencode` |

> **Cursor gotcha**: install the `cursor-agent` binary, but **log in with `agent login`, not `cursor-agent login`**. The Cursor docs don't say this; the T3 Code docs warn about it explicitly.

**Can't find the CLI?** Use Settings → provider instance → **Binary path** to set an absolute path (common when using Volta / asdf / fnm version managers that keep the CLI off the launching shell's PATH).

**When does auth need to happen?** Before you start a session with that provider, not before you start T3 Code. Install T3 Code, open it, add providers later. An unauthenticated provider shows its status in Settings and fails at session start with the login command to run.

### 2.3 Step 3: Pick a Permission Mode (4 Options)

The permission mode is set per thread from the mode control in the message composer. AGENTS.md and `docs/user/permission-modes.md` map the four:

| Mode | Behavior | When to use it |
|---|---|---|
| **Supervised** (Supervised / "Approve actions" on mobile) | Ask before commands and file changes | Unfamiliar tasks; expensive repos |
| **Auto-accept edits** | Edits go through; commands still ask | Refactors where edits are the point |
| **Auto** | Routine actions proceed; risky ones still ask | Day-to-day dev; Codex delegates routine approvals to an AI reviewer, Claude uses its own auto mode, providers without an equivalent (e.g. OpenCode) fall back to asking |
| **Full access** (default) | Allow commands and edits without prompts | Worktrees or sandboxes you can throw away |

A thread created from another thread inherits that thread's mode; otherwise new threads start in **Full access** unless you pick something else.

Each mode is mapped by the provider to its own approval / sandbox settings. Codex, for example, translates the mode into its `approval-policy` and `sandbox` level. Mobile offers the same four modes; it labels the first one "Approve actions" rather than "Supervised."

### 2.4 Step 4: Remote Access

Remote-ready is a core promise. The docs cleanly separate four access methods.

#### 2.4.1 Direct WebSocket (same network, simplest)

If the T3 server runs on `192.168.x.y:3773`, phones/computers on the same LAN connect straight to `http://192.168.x.y:3773` with a pairing token. **Note**: a browser in an HTTPS page cannot use a plain-HTTP endpoint (mixed-content rule) — use HTTPS, or use the desktop app / CLI to connect directly.

#### 2.4.2 Tailscale (recommended)

If you run Tailscale, the desktop app auto-discovers the tailnet and lists tailnet IP (`100.x.y.z`), MagicDNS, and Tailscale Serve HTTPS as endpoints in Settings → Connections.

```bash
# Enable Tailscale HTTPS
npx t3 serve --tailscale-serve
# This exposes the backend at https://machine.tailnet.ts.net/
```

Or flip the **Tailscale HTTPS** switch in desktop Settings (off by default); the desktop app then runs `tailscale serve --https=443` to set up the mapping.

**Why it's the recommended path**: stable address + transport encryption + no public exposure.

#### 2.4.3 T3 Connect (Cloudflare tunnel, zero network config)

T3 Connect is T3 Code's own managed Cloudflare-tunnel solution — for when your machine is behind NAT, inbound ports are unavailable, or mobile must reach a desktop-hosted environment. Authentication goes through Clerk OAuth.

```bash
# On the T3 server machine
npx t3 connect link
# installs the pinned managed cloudflared, authorizes, persists intent
npx t3 serve
# reconciles the relay link and launches the managed tunnel
```

How it works: the relay Worker **only brokers credentials and a managed endpoint**; application traffic then flows over the provisioned Cloudflare-tunnel hostname for the life of the connection, **not through the relay Worker itself**.

**Desktop app + T3 Connect**:
1. Settings → T3 Connect → sign in (Clerk)
2. Settings → T3 Connect → "Link this environment"
3. On mobile: Connections → Add Environment → sign in with the same account; auto-discovery

#### 2.4.4 Desktop-Managed SSH Launch

The desktop app can **SSH to a remote machine, start or reuse a T3 server, and port-forward back**. Settings → Connections → Add environment → SSH launch flow → enter `user@example.com` → confirm. The desktop:

1. Probes the host
2. Starts or reuses the remote T3 server
3. Opens a local port forward
4. Saves the environment (reconnect reuses it)

> **SSH launch troubleshooting**: the remote host must have a compatible Node (`^22.16 || ^23.11 || >=24.10`); nvm users run `nvm alias default 24`; the launcher writes `~/.t3/ssh-launch/<host-key>/`, kills stale processes, and starts a fresh server — usually no manual cleanup needed.

#### 2.4.5 Pairing Protocol (shared by all transports)

Regardless of transport, pairing is:

1. `t3 serve` issues a one-time owner pairing token.
2. The remote device exchanges that token with the server.
3. The server creates a session for the device.

After pairing, access is session-based — you do not need to keep reusing the original token unless pairing a new device.

**A hosted pairing URL looks like**:

```text
https://app.t3.codes/pair?host=https://backend.example.com:3773#token=PAIRCODE
```

- The token sits in the URL hash (**not sent to the hosted app origin**).
- The hosted app **does not proxy traffic** — the browser connects directly to the backend URL.
- It works only when the backend is reachable from the browser over HTTPS/WSS. For plain HTTP LAN endpoints, use the direct desktop/CLI pairing URL.

#### 2.4.6 Managing Access After Pairing

`npx t3 auth`:
- Issue additional pairing credentials
- Inspect active sessions
- Revoke old pairing links or sessions

### 2.5 Step 5: Source Control Integrations

T3 Code integrates with four Git platforms. Authentication happens on the **T3 server machine**, not in the browser.

#### 2.5.1 GitHub

```bash
brew install gh
gh auth login
# Open T3 Code → Settings → Source Control; verify GitHub is authenticated
```

What you can do: clone, publish, create PRs (T3 Code can suggest titles/descriptions based on your commits), review PRs (open team branches in right-panel tabs).

#### 2.5.2 GitLab

```bash
brew install glab
glab auth login
```

Merge Requests, repository publishing, hosted clones.

#### 2.5.3 Bitbucket

No CLI — use **environment variables** (a Bitbucket access token is recommended):

```bash
export T3CODE_BITBUCKET_ACCESS_TOKEN="your-access-token"
# Or
export T3CODE_BITBUCKET_EMAIL="you@example.com"
export T3CODE_BITBUCKET_API_TOKEN="your-token"
# Restart T3 Code after setting them
```

If both are set, the access token wins.

#### 2.5.4 Azure DevOps

```bash
brew install azure-cli
az extension add --name azure-devops
az login
```

#### 2.5.5 Generic

**Any Git URL** can be cloned via Custom Git URL. A local repo with no commits can use **Publish Repository** to create a hosted repo (GitHub / GitLab / Bitbucket / Azure DevOps), add it as origin, and push — all in one flow.

### 2.6 Step 6: Keybindings & Thread Management

#### 2.6.1 Keybindings

Stored in `~/.t3/userdata/keybindings.json` (on the T3 server machine). T3 Code writes built-in defaults on first run, then adds new defaults on later startups — **unless a rule of yours already claims the command or shortcut**. Invalid rules are ignored; an invalid file is ignored entirely with a server-log warning.

Format:

```json
[
  { "key": "mod+g", "command": "terminal.toggle" },
  { "key": "mod+shift+g", "command": "terminal.new", "when": "terminalFocus" }
]
```

`key` supports `mod` (cmd on macOS, ctrl elsewhere), `cmd`/`meta`, `ctrl`/`control`, `shift`, `alt`/`option`. `when` supports `!`, `&&`, `||`, parentheses. Current context keys: `terminalFocus`, `terminalOpen`, `previewFocus`, `previewOpen`, `modelPickerOpen` (treated as growing, not fixed).

Evaluation: **iterate in array order; the last rule whose `key` matches and `when` evaluates to true wins**. Precedence is across commands, not only within one command.

#### 2.6.2 Thread Pin & Cross-Device Order

- Pin a thread from its context menu — it appears above your active work, in the pinned section, across all connected devices.
- Web/Desktop: drag to reorder. Mobile: Move up / Move down in the thread menu.
- **Order is stored by the server** and synced to all your connected devices.
- Older servers can pin and unpin but don't understand synced ordering; upgrade them.

#### 2.6.3 Custom Project Icon

Settings → Projects → choose project → Appearance → Choose a project file. Supports SVG, PNG, ICO, JPEG, GIF, AVIF, WebP. Default detection looks at `t3.json`, common favicon/app icon paths, and `<link rel="icon">` in HTML files.

### 2.7 Step 7: Keep the App and Server in Sync

The client built by `npm run build` expects the server to be the same version — **a mismatch surfaces a warning** in:

- The current conversation (above the message box)
- Settings → Connections, next to the affected connection

The right action depends on how the server was launched:

| How it was launched | What to do |
|---|---|
| **Linux background service** | Click **Update server**; T3 Code prepares, tests, restarts, and reconnects itself |
| **Desktop app** | Update the desktop app on the **machine that runs the server** |
| **CLI (`npx t3`)** | Click **Copy update command**, then run `npx t3@<client-version>` on the server machine |

Background service internals: `npx t3@latest service install/update/status/uninstall`. The systemd unit runs a **stable launcher** (immutable); exact versions live under `versions/<version>` independently — a failed trial **rolls back** to the previous version without rewriting the unit. The launcher **snapshots SQLite** (WAL and SHM included) after stopping the old server and before the trial starts, so database migrations roll back with the version — **no down migrations needed**. The trial must report `prepared` within 120 seconds; otherwise the launcher stops the trial, restores the snapshot, records rollback, and starts A.

### 2.8 Step 8: Linux Background Service

```sh
npx t3@latest service install   # install
npx t3@latest service status    # check
npx t3@latest service update    # upgrade / repair
npx t3@latest service uninstall # remove
```

Requires **Linux + systemd** today. Signing out of T3 Connect does **not** uninstall the service.

---

## 3. Synthesized Insights: 8 Core Takeaways

After reading the design docs, AGENTS.md, and the architecture pages, eight judgments about the agent era's product shape emerge.

### 3.1 Insight 1: The Agent Harness Is a New Product Shape, Not Another Agent Framework

AGENTS.md opens with: "T3 Code is a minimal GUI for coding agents." — but it immediately becomes a tool: wrapping 5 provider CLIs, running one Node server to own all execution, exposing 3 clients to drive them remotely.

The implication: **once model capability is strong enough, the agent framework layer homogenizes — the differentiator becomes "how do I keep the agent running, reachable, and observable."** T3 Code turns that judgment into a product shape called "agent harness control surface."

**Conclusion**: if you're building a coding-agent tool, **stop competing on the agent framework** — compete on the execution environment, remote transport, multi-surface experience, and observability.

### 3.2 Insight 2: The Execution Boundary Lives on the Server, Not the Client

From the architecture docs:

> "every provider process, terminal, git operation, and filesystem read happens there, never in the client."

What that means in practice:
- Clients **never call a provider directly** — every provider operation goes through `orchestration.dispatchCommand` RPC.
- Clients **never construct RPC clients, retry loops, or raw orchestration commands** (the `client-runtime` package owns all of it).
- Terminals, git, filesystem all live on the server.

This drawing of the line lets T3 Code **swap client shapes at will** — adding a fourth or fifth client doesn't change the server's execution semantics.

**Conclusion**: when building a multi-surface agent product, **put the execution boundary on the server** — don't let the client run provider processes, or every new client will re-implement the runtime.

### 3.3 Insight 3: Event Sourcing Is the Right Shape for Agent Orchestration

The server's orchestration is event-sourced:

```
command → decideOrchestrationCommand (pure function) → events
events → projector → read model (messages, threads, checkpoints, session status)
events also appended to the event store
append + project in one SQL transaction
```

**What that buys you**:
- **Read model can't durably disagree with the event log** — same transaction.
- **Replay-on-failure is trivial** — on dispatch failure, re-read events past the starting sequence and reconcile.
- **"Turn done" has an authoritative definition** — the session leaves `running` (not "checkpoint/diff done").
- **Idempotency is natural** — `processEnvelope` checks the durable command receipt first, so retrying the same command is idempotent.

**Conclusion**: an agent's "conversation + work" double layer (user messages + tool calls + file diffs + agent text) is a natural fit for event sourcing. Don't try to describe it as a CRUD state machine.

### 3.4 Insight 4: Provider Abstraction Belongs at the Adapter Boundary, Orchestration Stays Pure

5 provider drivers + 5 adapters are two pieces:

- **driver** declares `driverKind` + `configSchema` + `create` (builds the adapter).
- **adapter** implements the `ProviderAdapter` interface.

`ProviderService` sits on top — **it doesn't know which agent is behind a thread, only that there is a thread**. `thread.turn.start` and `thread.approval.respond` are the only client-dispatchable primitives; `thread.message.assistant.delta` and `thread.session.set` are internal events emitted by server-side reactors.

**Adding a provider means writing one driver + one adapter and adding to `BUILT_IN_DRIVERS`** — no changes to orchestration, contracts, or clients.

**Conclusion**: **complexity belongs at the adapter boundary** (AGENTS.md verbatim) — quarantine diversity in adapters, keep the trunk pure.

### 3.5 Insight 5: Remote = One Protocol + Many Access Methods, Not a Split Runtime

From the docs: "Remoteness is expressed at the connection layer, never by splitting the runtime."

In practice:
- Whether LAN, Tailscale, T3 Connect, or desktop SSH, **the T3 server is the same process** with the same event log and the same SQLite.
- The 4 access methods (direct / Tailscale / T3 Connect / desktop SSH) are **just different connection layers**.
- The 3 launch methods (pre-existing / desktop SSH launch / client-managed publish) are just **how the server came to exist**.

**Conclusion**: when building remote agent products, **keep the protocol stable, vary the connection layer** — don't write a separate runtime per transport.

### 3.6 Insight 6: Capability-Based OAuth Beats Role-Based Auth for Multi-Surface Agents

T3 Code doesn't use an `admin`/`user` role model. It uses OAuth-style scope strings:

```
orchestration:read / orchestration:operate / terminal:operate /
review:write / access:read / access:write / relay:read / relay:write
```

An ordinary pairing gets the four client-operation scopes plus `relay:read`; the bootstrap credential additionally grants `access:read/write` and `relay:write`. **Each RPC method declares its own required scope** via the `RPC_REQUIRED_SCOPE` map.

The auth flow profiles RFC 6750 (Bearer) + RFC 8693 (Token Exchange) + RFC 6749 (Scopes):
- `POST /oauth/token` with `grant_type=urn:ietf:params:oauth:grant-type:token-exchange`
- `POST /api/auth/websocket-ticket` returns a 5-minute short ticket, **keeping long-lived tokens out of WebSocket URLs**
- **DPoP-bound access tokens** (proof-of-possession) for relay-brokered clients, 1-hour TTL — a leaked token can't be replayed without the corresponding key

**Conclusion**: agent platforms should not use a "admin / regular user" binary model — use capability scopes, and let every RPC method declare what it needs.

### 3.7 Insight 7: An Independent Rust Resource-Monitor Sidecar Is Safer Than a Node Native Addon

Why not just use a Node native addon to read process counters? The docs answer:

> "The cost is one persistent child process and NDJSON serialization. That is a better failure boundary than repeatedly spawning shell utilities or loading native code into Node."

In practice:
- `native/resource-monitor` is a **standalone Rust executable** (using the `sysinfo` crate), talking NDJSON over stdin/stdout
- **Not** N-API / `ffi-rs` / dynamic library
- A monitor crash **cannot corrupt the Node runtime** — the server can supervise, restart, version-check, and measure the monitor as a normal child process
- **Same protocol** works across desktop / web / headless server
- **Packaging is simple** — single platform binary, **no N-API × Node × Electron ABI matrix**

The desktop app layers Electron host telemetry (powerMonitor, `app.getAppMetrics`, host power state) on top via inherited fds 4 and 5 — **not** over the renderer WebSocket.

**Conclusion**: when you need OS-level data, **an independent sidecar + NDJSON is safer than a Node native addon** — better failure boundary, version control, and packaging.

### 3.8 Insight 8: Design Philosophy Belongs in AGENTS.md, Not in Tribal Knowledge

T3 Code writes its design philosophy into `AGENTS.md` at the repo root — one of the most copyable things about the project. The four numbered principles:

```
1. Open at the core
2. Performance without compromise
3. Remote ready
4. Multi-surface
   - Web (2 surfaces: app.t3.codes + npx t3)
   - Desktop (Electron shell)
   - Mobile (React Native)
```

Theo's "a note from Theo" paragraph is worth quoting in full:

> "I like ambitious ideas, simple systems, and software that feels obvious. Do not preserve complexity just because it already exists. Do not introduce machinery because it looks architecturally impressive. Understand the real constraint, then fight for the smallest model that makes the correct behavior unsurprising."

> "Channel both 'measure twice, cut once' and 'yagni'. Fight scope creep."

**Conclusion**: explicitly write down "what we don't do" and "why we do it this way" in AGENTS.md — that's the only way a high-bar project scales.

### 3.9 How the 8 Insights Connect

```
Insight 1: the agent harness is a new product shape
   ↓ (product positioning)
Insight 2: execution boundary on server, not client
   ↓ (architectural foundation)
Insight 3: event sourcing is the right shape for orchestration
Insight 4: provider abstraction at the adapter boundary
   ↓ (extensibility)
Insight 5: remote = one protocol + many connection layers
Insight 6: capability-based OAuth beats role models
   ↓ (operational quality)
Insight 7: independent Rust sidecar beats Node native addon
Insight 8: design philosophy lives in AGENTS.md
```

Insight 1 is the product judgment; 2/3/4 are engineering foundations; 5/6 are extensibility and operability; 7/8 are engineering discipline. Remove any one, and the product shape collapses.

---

## 4. Design Philosophy: Reading AGENTS.md as a Design Manifesto

T3 Code's design philosophy is not a single "manifesto" — it is scattered across `AGENTS.md`, `docs/internals/*.md`, and the architecture decision records in `.plans/`. Pulling them together gives six philosophies you can use to evaluate decisions.

### 4.1 Philosophy 1: Open at the Core

**Original**: "T3 Code is truly open. We share our roadmap, we share how we think about things, and of course we share all our code."

**In practice**:
- MIT license
- Roadmap is on GitHub
- The internal `.plans/` directory records **every major decision** (`01-shared-model-normalization.md` → `19-remote-endpoints-hosted-static.md`, all public)
- The `AGENTS.md` written for the agent is also open source — **fork it and it works for your own agent**
- "We work in the open, and should strive to stay that way."

**Why it matters**: if you don't publish the design process, "open source" is just a shell. T3 Code turns "open" into an **auditable engineering practice** — `.plans/` is the audit trail, `AGENTS.md` is the action manual.

### 4.2 Philosophy 2: Performance Without Compromise

**Original**: "Lots of apps have gotten bogged down with bad tech decisions and 'slop'. We have not, and we're proud of the performance of T3 Code. We regularly audit for performance regressions, often caused by sending too much data over websockets, css animations causing gpu spikes, lists being hard to render, and more."

**In practice**:
- WebSocket traffic audits — **don't shovel too much data over the wire**
- CSS animation audits — **no continuously repainting animations**
- Large-list rendering audits
- "No continuously repainting animations; they peg the GPU on high-refresh displays." (AGENTS.md verbatim)
- T3 Code users **drive agents all day long** — "a dropped frame, a lying spinner, and a stale label" get noticed

**Why it matters**: agent chat UIs are typically **left open for long sessions** — small performance issues compound into sustained friction. Performance is not a nice-to-have; it is user retention.

### 4.3 Philosophy 3: Remote Ready

**Original**: "The architecture of T3 Code's websocket layer (npx t3) enables a lot of awesome remote features. These have become core to the product."

**In practice**:
- 4 access methods (direct / Tailscale / T3 Connect / desktop SSH) share one Effect RPC WebSocket
- 4 launch methods (pre-existing / desktop SSH launch / client-managed publish) are just differences in how the server came to exist
- Tailscale is an **endpoint provider add-on**, not a separate runtime concept
- WebSockets use **5-minute short tickets** for auth (long-lived tokens never appear in URLs)
- Every new feature must consider: "does it work in the remote case?"

**Why it matters**: agents run 24×7 — users don't sit in front of the editor. **Remote is not an add-on; it is a core capability**. Doing it right in the architecture is cheaper than bolting it on later.

### 4.4 Philosophy 4: Multi-Surface

**Original**: "T3 Code has 3 key app surfaces: web, desktop, and mobile."

**In practice**:
- **Web is actually two surfaces**: `app.t3.codes` hosted + `npx t3` local — **both must be supported**
- Desktop is an Electron shell that **loads the web bundle over the `t3code://` protocol**
- Mobile is React Native using the **same `packages/client-runtime`**
- `apps/web/src/connection/runtime.ts` and `apps/mobile/src/connection/runtime.ts` **mirror each other line by line** (except for platform-specific background-activity layers)

**Why it matters**: users **don't use only one device** — desktop for work, phone to check progress, tablet for PR review. **Multi-surface is real-world distribution**, not "just add a native app."

### 4.5 Philosophy 5: Complexity Belongs at the Adapter Boundary

**Original**: "Complexity belongs at the adapter boundary. Orchestration stays pure, UI stays dumb."

**In practice**:
- The orchestration layer's `decider.ts` is **a pure function** — `(command, state) => events`, no side effects
- The 5 provider adapters confine the differences among 5 CLI protocols **inside their own files**
- Effect is used heavily on the server; **React components never construct transports, retry loops, or RPC clients** (the `client-runtime` package owns all of that)
- UI components are dumb — **domain state lives in Atom factories** (`createProjectEnvironmentAtoms`, `createThreadEnvironmentAtoms`)

**Why it matters**: **pure-function core + side-effect edge** is a software-engineering silver bullet — the testable, reason-about-able, evolvable part is maximized; the chaos is compressed to the boundary.

### 4.6 Philosophy 6: Event-Sourced Truth

**Original**: "Orchestration is event-sourced. The server does not mutate app state directly. Clients dispatch typed commands; the engine turns them into persisted events; projections derive the read model."

**In practice**:
- **The read model and the event log share one SQL transaction** — durable consistency is automatic
- `processEnvelope` first checks the **durable command receipt** — retries are idempotent
- **"Turn done" has an authoritative definition**: the session leaves `running` (not "checkpoint/diff done")
- 3 queue-backed workers (`ProviderRuntimeIngestion` / `ProviderCommandReactor` / `CheckpointReactor`) are built on `DrainableWorker` — **enqueue is atomic, counter is atomic**
- **Runtime receipts are test-only** — `RuntimeReceiptBusLive` is a no-op in production; only the test layer is PubSub-backed

**Why it matters**: agent systems naturally have **long flows + many steps + easy retries + tool side effects** — event sourcing is the **most natural skeleton** for that shape. As the glossary says: "requested" = intent recorded; "completed" = result applied; "receipt" = test-only async milestone.

### 4.7 Philosophy Summary: 6 Philosophies = T3 Code's Design Manifesto

| Philosophy | One-liner | In practice |
|---|---|---|
| 1. Open at the core | The design process is also public | MIT + `.plans/` decisions public + AGENTS.md open |
| 2. Performance without compromise | Performance is retention | WebSocket traffic audits + animation audits + list-render audits |
| 3. Remote ready | Remote is not an add-on | 4 access methods share 1 protocol + 5-minute short ticket |
| 4. Multi-surface | Multi-device is real distribution | Web (2) + Desktop + Mobile share client-runtime |
| 5. Complexity at adapter boundary | Pure-function core + side-effect edge | decider is pure + 5 provider adapters + UI is dumb |
| 6. Event-sourced truth | Read model can't disagree with event log | command → event → projection (same transaction) + idempotent retries |

**These six are not independent — they form a chain**: open makes forking easy → performance makes users stay → remote lets agents keep running → multi-surface lets users use multiple devices → adapter isolation lets providers proliferate → event sourcing keeps async from going haywire. **Remove any one and the product shape is incomplete.**

### 4.8 A Note from Theo

One passage from AGENTS.md is worth quoting on its own:

> "I like ambitious ideas, simple systems, and software that feels obvious. Do not preserve complexity just because it already exists. Do not introduce machinery because it looks architecturally impressive. Understand the real constraint, then fight for the smallest model that makes the correct behavior unsurprising."

> "Channel both 'measure twice, cut once' and 'yagni'. Fight scope creep. Try to honor the dev's intent in both a minimal and realistic fashion."

> "The rest of this document is meant to help you navigate the codebase and make changes effectively. Think of these instructions less as 'hard rules', more as 'good defaults'. The developer's preferences should be able to override anything here."

**This is not a technical philosophy — it's a working philosophy.** It explains why T3 Code chose to **wrap 5 providers rather than build a 6th**, **event sourcing rather than CRUD**, **a Rust sidecar rather than a Node native addon** — always **the smallest model**.

---

## 5. Core Takeaway

The most important judgment T3 Code delivers: **in 2026, the next product shape in the agent era is not "another agent framework" — it is the "agent harness control surface": a local execution runtime that lets you freely switch between 5 providers, freely switch between 3 client surfaces, and freely switch between 4 remote transports.**

- **It redefines the agent harness** — not a framework, a control surface; not one provider, 5 compatible ones; not desktop-only, web + desktop + mobile; not local-only, 4 remote transports
- **It puts the execution boundary on the server** — every provider process, terminal, git operation, filesystem read happens there; the client never calls a provider directly
- **It uses event sourcing to solve agent async** — command → decider → event → projector (same SQL transaction), retries are idempotent by construction, "turn done" has an authoritative definition
- **It quarantines provider differences in adapters** — 5 drivers + 5 adapters; orchestration stays pure; adding a 6th provider doesn't touch the trunk
- **It makes remote a 4 access × 3 launch matrix** — same protocol, multiple connection layers, no runtime split
- **It uses capability-based OAuth for auth** — OAuth 2.0 (RFC 6750/8693/6749) + 5-minute WebSocket ticket + DPoP proof-of-possession
- **It uses a Rust sidecar for OS-level resource monitoring** — never pollutes the Node runtime; one protocol across all platforms
- **It writes "what we don't do" into AGENTS.md** — design philosophy, `.plans/` decisions, hit-every-surface checklist all public

The sentence to remember: **T3 Code doesn't make agents, doesn't make models, doesn't make subscriptions — it makes the "agent harness control surface": one local server that runs Codex / Claude / Cursor / Grok / OpenCode, controllable from web / desktop / mobile, from anywhere, under your permission policy.**

---

## Appendix A: References

- [T3 Code GitHub repo](https://github.com/pingdotgg/t3code)
- [T3 Code README](https://github.com/pingdotgg/t3code/blob/main/README.md)
- [T3 Code AGENTS.md](https://github.com/pingdotgg/t3code/blob/main/AGENTS.md)
- [docs/README](https://github.com/pingdotgg/t3code/blob/main/docs/README.md)
- User docs:
  - [Install](https://github.com/pingdotgg/t3code/blob/main/docs/user/install.md)
  - [Permission modes](https://github.com/pingdotgg/t3code/blob/main/docs/user/permission-modes.md)
  - [Remote access](https://github.com/pingdotgg/t3code/blob/main/docs/user/remote-access.md)
  - [Source control](https://github.com/pingdotgg/t3code/blob/main/docs/user/source-control.md)
  - [Keybindings](https://github.com/pingdotgg/t3code/blob/main/docs/user/keybindings.md)
  - [Thread sidebar](https://github.com/pingdotgg/t3code/blob/main/docs/user/thread-sidebar.md)
  - [Project settings](https://github.com/pingdotgg/t3code/blob/main/docs/user/project-settings.md)
  - [Updating](https://github.com/pingdotgg/t3code/blob/main/docs/user/updating.md)
  - [Background service](https://github.com/pingdotgg/t3code/blob/main/docs/user/background-service.md)
- Internals:
  - [Architecture overview](https://github.com/pingdotgg/t3code/blob/main/docs/internals/overview.md)
  - [Workspace layout](https://github.com/pingdotgg/t3code/blob/main/docs/internals/workspace-layout.md)
  - [Providers](https://github.com/pingdotgg/t3code/blob/main/docs/internals/providers.md)
  - [Connection runtime](https://github.com/pingdotgg/t3code/blob/main/docs/internals/connection-runtime.md)
  - [Remote architecture](https://github.com/pingdotgg/t3code/blob/main/docs/internals/remote.md)
  - [T3 Connect](https://github.com/pingdotgg/t3code/blob/main/docs/internals/t3-connect.md)
  - [Environment auth](https://github.com/pingdotgg/t3code/blob/main/docs/internals/environment-auth.md)
  - [Server updates](https://github.com/pingdotgg/t3code/blob/main/docs/internals/server-updates.md)
  - [Resource telemetry](https://github.com/pingdotgg/t3code/blob/main/docs/internals/resource-telemetry.md)
  - [Glossary](https://github.com/pingdotgg/t3code/blob/main/docs/internals/glossary.md)
  - [CI gates](https://github.com/pingdotgg/t3code/blob/main/docs/internals/ci.md)
- [Mobile README](https://github.com/pingdotgg/t3code/blob/main/apps/mobile/README.md)
- Downloads: [GitHub Releases](https://github.com/pingdotgg/t3code/releases) · `winget install T3Tools.T3Code` · `brew install --cask t3-code` · `yay -S t3code-bin`
- Online: [app.t3.codes](https://app.t3.codes) · iOS App Store · Google Play
- Community: [Discord](https://discord.gg/jn4EGJjrvv)
