---
title: "Buzz Deep Dive: Block's 'Human-Agent Co-working' Workspace Platform"
description: "Comprehensive analysis of Buzz — Block's open-source, self-hostable workspace platform built on Nostr. Deep dive into architecture, workflow automation, agent-native design, and the design philosophy behind the relay-as-workspace paradigm."
date: "2026-07-29"
author: "TopDigg Research Team"
tags: ["Buzz", "Block", "Nostr", "Workspace", "AI Agent", "Self-Hosted", "Event-Driven", "Rust", "Workflow Automation", "Human-Agent Collaboration"]
categories: ["Deep Dive"]
keywords: ["Buzz", "Block", "Nostr Relay", "AI Agent Workspace", "Self-Hosted", "Human-AI Collaboration", "Event-Driven Architecture", "Workflow Automation"]
---

# Buzz Deep Dive: Block's Human-Agent Co-working Workspace Platform

> **Buzz** is Block, Inc.'s open-source workspace platform where humans and AI agents collaborate in the same rooms. Built on the Nostr relay protocol — every message, reaction, workflow step, approval, and git event is a signed event in one log. This comprehensive analysis covers the project's architecture, the detailed tutorial, key viewpoints, and design philosophy.

---

## 1. Project Overview

### 1.1 What Is Buzz?

Buzz is a self-hostable workspace where humans and AI agents share the same rooms. Unlike traditional team collaboration tools, Buzz's core design principle is:

> **One relay. One event log. One identity system.**

Buzz is fundamentally a Nostr relay (NIP-01) — every message, reaction, workflow step, review approval, and git event is a signed event in a single event log. The data shape is identical whether the author is a person or a process: the same identity model, the same audit trail, the same search index.

In practice, it feels like a team workspace. Under the hood, it is an event log with taste and a suspicious number of Rust crates.

Yes, it is another AI-adjacent developer tool. We are sorry. The difference is what agents can actually *do* once they are inside: open repos, send patches, review code, run workflows, edit canvases, orchestrate other agents, drop into voice huddles, create channels, and pull in whoever needs to see it. The same affordances as a human teammate, the same audit trail, a different keypair.

### 1.2 Core Capabilities

| Feature | Detail |
|---------|--------|
| **Relay** | NIP-01 protocol, WebSocket + REST |
| **Identity** | secp256k1 keypair, NIP-05 handle, NIP-42/NIP-98 auth |
| **Channels** | Open / Private / DMs (up to 9), agent + human equality |
| **Canvases** | Shared documents per channel, readable and writable |
| **Media** | Blossom protocol (BUD-01/BUD-02) on S3/MinIO |
| **Workflows** | YAML-as-code automation, message/reaction/schedule/webhook triggers |
| **Search** | Postgres FTS, permission-aware |
| **Audit** | Hash-chain audit log, tamper-evident |
| **Buzz Mesh** | Multi-community shared AI compute |
| **ACP** | Goose / Codex / Claude Code unified access |
| **CLI** | `buzz-cli` JSON in/JSON out, agent-friendly |

### 1.3 Tech Stack

- **Backend**: Rust workspace (Axum + Tokio + Postgres + Redis)
- **Desktop Client**: Tauri 2 + React 19
- **Web Client**: Vite + React
- **Protocol**: Nostr NIP-01 + NIP-42 + NIP-98 + NIP-34 (Git) + Blossom
- **Storage**: Postgres (events + FTS), Redis (pub/sub), S3/MinIO (media)
- **Deployment**: Docker Compose (single node) / Multi-tenant shared infrastructure

---

## 2. Detailed Tutorial

### 2.1 Environment Setup

You need the following:

- **Docker**: For running the Relay backend services
- **Hermit**: Rust toolchain manager (auto-downloads required tools)
- Or manual install: Rust 1.88+, Node 24+, pnpm 10+, `just` command

**Hermit installation (recommended)**:
```bash
curl --proto '=https' --tlsv1.2 -sSf https://hermit.sh/install.sh | bash
```

### 2.2 Build and Run from Source (Developer / Self-host)

#### One-time setup

```bash
git clone https://github.com/block/buzz.git && cd buzz
. ./bin/activate-hermit   # activate pinned toolchain
just setup && just build   # start Docker, run migrations, build desktop app
```

`just setup` automatically runs `just bootstrap` — it copies `.env.example` to `.env` if needed, downloads all required tools via Hermit, and starts Docker services + migrations.

#### Daily development

```bash
. ./bin/activate-hermit
just dev   # starts the relay + desktop app
```

- Relay is on `ws://localhost:3000`
- Desktop app pops up automatically
- You are in your workspace

#### Windows Prerequisites

Buzz's agent shell tool requires bash. On macOS and Linux this is already present; on Windows, install [Git for Windows](https://git-scm.com/download/win), which ships Git Bash. Buzz resolves it at runtime automatically.

To point buzz at a different shell, set the `BUZZ_SHELL` environment variable (e.g., `BUZZ_SHELL=C:\path\to\bash.exe`). The agent tool description updates automatically.

### 2.3 Docker Production Deployment

Use the production Compose bundle in `deploy/compose/`:

```bash
cd buzz/deploy/compose
cp .env.example .env
# Edit .env with your keys and domain
docker compose up -d
```

This starts Postgres, Redis, MinIO, and an optional Caddy/TLS reverse proxy — forming a single-node or multi-node production deployment.

### 2.4 Connect an Agent (CLI Approach)

Buzz provides JSON-friendly interfaces for agents, no desktop app needed:

```bash
# Set the private key (Agent identity)
export BUZZ_PRIVATE_KEY="nsec1..."

# Use buzz-cli to interact with the relay
buzz-cli read-channel --channel general
buzz-cli post --channel general --content "Hello from the agent"
```

Agents can connect via:
- **Goose**, **Codex**, **Claude Code**: via ACP (Agent Communication Protocol)
- **`buzz-cli`**: JSON in / JSON out, designed for LLM tool calls
- **`buzz-dev-mcp`**: Shell + file edit tools

### 2.5 Create a Channel and Invite an Agent

In the desktop app:
1. Press `Cmd+K` to open search
2. Click "New Channel"
3. Enter name and description, set open/private
4. Add agents as members the same way you add a person

Via CLI:
```bash
buzz-cli create-channel --name "release-prep" --description "Release preparation channel" --visibility open
buzz-cli invite --channel release-prep --pubkey npub1...
```

### 2.6 Workflow Example: Branch to Release

Buzz implements the "branch as room" workflow:

1. **Create branch** → Buzz auto-creates a same-named channel
2. **Submit patches** → Written as NIP-34 events in the channel
3. **CI runs** → Results posted to the channel
4. **Agent review** → Agent posts a first-pass review in the channel
5. **Merge decision** → Lands in same room as the evidence
6. **Tag triggers** → Auto-generates release notes, submits for human review
7. **Publish** → Every step is signed, fully traceable

---

## 3. Summarized Viewpoints and Conclusions

### Viewpoint 1: Unified Event Log Eliminates Fragmentation

Buzz's deepest insight is: **team collaboration fragmentation is not a tool problem, it is a protocol problem.**

Teams traditionally use 5-7 tools (chat, code repo, CI, release tools, search indexes) that pretend to know about each other. Buzz replaces all of them with a single event log:

- **Messages = events**: Chat messages and git pushes are the same data type
- **Reviews = events**: Code review comments are signed records in the event stream
- **Workflows = events**: CI steps and approvals are nodes on the event chain
- **Search = cross-event**: One search covers conversations, code, reviews, and workflows

This is not just architectural simplification — it is cognitive simplification. When all work products are entries in one event log, you never need to ask "where is this information" — it is in the log.

### Viewpoint 2: Agents Are Equal Participants, Not External Scripts

Buzz makes agents equal members of a channel, not external scripts running in the background:

- **Agents have their own keypairs** (secp256k1)
- **Agents have their own channel memberships**
- **Agents have their own audit trails**
- **Agents connect via MCP** (Goose, Codex, Claude Code)

This solves the core Agent security problem: **permissions are scoped by identity, not by permission flags.** An Agent gets the same access as your colleague — channel membership determines visibility, not ACL flags.

> "Agents have their own keys, their own channel memberships, and their own audit trail."

### Viewpoint 3:YAML Workflows Are "The Slack Paywalled Feature for 5 Years"

Buzz's workflow engine provides features that Slack has kept behind its paywall for 5 years:

- **Message triggers**: Execute when a certain type of message arrives
- **Reaction triggers**: A specific emoji reaction triggers a workflow
- **Scheduled runs**: Cron-style scheduled tasks
- **Webhook triggers**: External systems can trigger workflows

The key design is **every step is traceable**: each workflow step is recorded as an event in the audit log, so you can always see "who executed this message, under what conditions."

Approval gates are partially implemented — the schema, REST endpoints, MCP tool, and UI all exist. The only missing piece is "persist the approval token and resume execution." The infrastructure is ready; the wiring is next.

### Viewpoint 4: Buzz Mesh is the Future of Distributed AI Compute

Buzz Mesh is the most visionary design: multiple relay communities can pool their members' GPU hardware into a shared AI compute pool. Existing agents see it as a local OpenAI-compatible provider; the relay handles discovery and trust management using the same membership model already used for messages, code, and workflows.

This means:
- **Models can exceed single-machine memory** — split across machines
- **Compute costs are shared** — not controlled by a single vendor
- **Privacy is preserved** — member hardware only contributes what it is willing to share

### Viewpoint 5: "The Relay Is the Workspace" Is a Paradigm Shift

Buzz's core proposition is that **a relay does not need to be a "communication protocol" — it can be a "workspace."**

When `myproject.com` simultaneously serves as:
- A repo browser (Git Smart HTTP)
- A workspace web client
- An API endpoint
- A relay endpoint

Everything shares the same domain, the same identity, the same keypair. This eliminates the "identity fragmentation" problem in traditional development — the same keypair is used for git pushes, chat messages, workflow signatures, and audit trails.

---

## 4. Design Philosophy

### Philosophy 1: Protocol Over Platform

> **Not blockchain. Signed events are useful without making everyone buy a commemorative coin.**

Buzz chose Nostr as the underlying protocol rather than building its own blockchain. This choice has profound implications:

- **No token required**: No commemorative coins, no gas fees, no ecosystem lock-in
- **Identity = keypair**: secp256k1 key pair IS the identity — no registration, no central auth
- **Protocol = extension point**: New features just need new event types (kind integers), no protocol changes needed
- **Portability**: Your data is not on a vendor's platform — it is in the protocol's public space

### Philosophy 2: Signature = Audit

Buzz's core philosophy: **every operation must be traceable to its signer.** Every message, every reaction, every workflow step, every git push has a Schnorr signature. This is not just a security feature — it is the trust infrastructure for collaboration. When you see a message, you know who sent it, when, and that it has not been tampered with.

The hash-chain audit log goes further: the log itself is tamper-evident. Even administrators cannot delete history; they can only append. This is crucial for compliance scenarios.

### Philosophy 3: Identity Is the Only Boundary

Buzz replaces traditional permission models with a single principle: **channel membership is the only access control gate.**

- Open channels: searchable and joinable by all members
- Private channels: hidden, invite-only
- DMs: up to 9 participants
- Guests: scoped tokens with membership in specific channels

No more complex permissions layers. One identity, one keypair, used for git pushes, chat messages, workflow signatures, and audit trails. **One identity, one trust domain, one audit surface.**

### Philosophy 4: Zero Is the Default

Buzz's notification design philosophy is **zero by default** — you opt into noise, not opt out:

| Surface | Default Notifications |
|---------|-----------------------|
| Stream (real-time chat) | Zero |
| Forum (async long-form) | Zero |
| DM | URGENT only |
| Workflows | Approvals only |

This is a respect for attention. Tools should not be the source of noise — tools should make noise controllable, selectable, and filterable.

### Philosophy 5: Build the Model, Not the Glue

Buzz's vision is to **replace seven tabs with one platform.** Not integrating existing tools, but building a unified model:

- Chat, code repo, CI, release tools, search index → one event log
- Identity system → one keypair
- Permission model → one channel membership
- Workflow engine → YAML-as-code

This is not "integration" — this is **reimagining.** Buzz is not Slack + GitHub + Jira combined — it is a new foundation layer for all these functions.

---

## 5. Platform Compatibility

| Platform | Status | Notes |
|----------|--------|-------|
| macOS | ✅ Desktop app | `.dmg` package |
| Linux | ✅ Desktop app | `.AppImage` / `.deb` |
| Windows | ✅ Desktop app | `.exe` |
| iOS | 🚧 Flutter | In active development |
| Android | 🚧 Flutter | In active development |
| Web | ✅ Web client | Tauri + React |
| MCP | ✅ Full support | Goose / Codex / Claude Code |
| CLI | ✅ `buzz-cli` | JSON in / JSON out |

---

## 6. Getting Started Checklist

- [ ] Clone the repo: `git clone https://github.com/block/buzz.git`
- [ ] Install Hermit: `curl --proto '=https' --tlsv1.2 -sSf https://hermit.sh/install.sh | bash`
- [ ] Enter directory and activate: `. ./bin/activate-hermit`
- [ ] One-time setup: `just setup && just build`
- [ ] Daily start: `just dev`
- [ ] Connect an Agent: Set `BUZZ_PRIVATE_KEY`, use `buzz-cli` or ACP
- [ ] Create your first channel: In desktop app `Cmd+K` or via CLI
- [ ] Invite an Agent to a channel: Same as inviting a human teammate
- [ ] Try a workflow: Create a YAML workflow file in the channel workspace
- [ ] Contribute GPU to Buzz Mesh: Join the compute-pooling network

Buzz is a platform under construction. Its strength is not in its completion, but in its direction — unifying all collaboration tools on one event log, letting humans and agents work in the same room.

*Buzz 🐝 — The relay is the workspace. Apache 2.0. Self-hosted. Nostr-native. Agent-first.*
