---
title: "From Tauri to Electron: A Founder's Painful Migration Retrospective"
date: "2026-08-20"
description: "On May 28, 2026, Paseo founder Mo Boudra wrote 'I was wrong about Electron' — a candid retrospective on migrating Paseo from Tauri to Electron. This article dives deep into Paseo, its architecture, the migration pitfalls, and the engineering philosophy behind the decision."
tags:
  - Tech Selection
  - Electron
  - Tauri
  - Desktop Apps
  - Open Source
  - Paseo
categories:
  - Technical Deep Dive
source:
  aggregator: "比特财商"
  aggregator_url: "https://mp.weixin.qq.com/s/Q-SOuDzIX69B_KE4pIAwWlofqxUaRF4H7CkCksIl3VD0gyRIeDsQkZPPl3Ms0hV1"
  original:
    name: "比特财商"
    url: "https://mp.weixin.qq.com/s/Q-SOuDzIX69B_KE4pIAwWlofqxUaRF4H7CkCksIl3VD0gyRIeDsQkZPPl3Ms0hV1"
---

## Opening: A Founder Admits He Was Wrong

On May 28, 2026, Paseo founder **Mo Boudra** published a blog post with a surprising title: **"I was wrong about Electron."**

This wasn't a casual self-criticism. In the post, Boudra gave a detailed retrospective on a complete "heart transplant" for Paseo's desktop application — migrating the underlying framework from Tauri to Electron.

For an open-source project that had just gained **14.4k GitHub Stars** and widespread community attention, such candid reflection was rare. What made it even more valuable was that he didn't stop at admitting fault — he laid out the entire migration decision chain, all the pitfalls encountered, and his thought process for everyone to see.

**This article is a masterclass in technology selection.**

---

## 1. What Is Paseo?

Before diving into the technical details, let's answer a fundamental question: **What exactly is Paseo?**

Paseo is a **desktop-grade AI agent orchestration platform**. Its core mission is to let you call AI coding assistants from different vendors — including **Claude Code, Copilot, Codex, OpenCode, and Pi** — all from a **single interface**.

In other words, it's not just another AI coding tool. It's a **unified orchestration layer**. No matter which Agent you prefer, you can manage, switch between, and collaborate with all of them through Paseo's unified interface and workflow.

### Key Features at a Glance

| Feature | Description |
|---|---|
| **Unified Multi-Agent Entry Point** | Integrates Claude Code, Copilot, Codex, OpenCode, Pi |
| **Local-First Execution** | Agents run on your local machine with full access to your dev environment |
| **Cross-Device Sync** | Unified experience across iOS, Android, desktop, web, and CLI |
| **Voice Control** | Voice input support — just speak your tasks |
| **Zero-Compromise Privacy** | No telemetry, no tracking, no forced login |
| **End-to-End Encryption** | Cross-device pairing uses encrypted transmission |
| **Open Source AGPL-3.0** | Code is open, community-driven |

### Paseo's Architectural Philosophy

Paseo's architecture reflects a core principle: **your code and data always stay with you.**

It orchestrates agent processes through a **Node.js daemon** running on local port `6767`. All clients (desktop, mobile, web, CLI) communicate with this daemon via **WebSocket**. Cross-device pairing is handled through an **end-to-end encrypted relay service**.

This architecture delivers key advantages:

1. **Natural privacy**: Code never passes through any third-party server
2. **Excellent performance**: Daemon interacts directly with the local dev environment — no network latency
3. **High extensibility**: The TypeScript SDK lets anyone build custom integrations on top of Paseo

---

## 2. Technical Architecture: One Daemon, Multiple Clients

### 2.1 Monorepo Structure

Paseo uses a monorepo with these core packages:

```
packages/
├── server/    # Node.js daemon: agent process orchestration, WebSocket API, MCP server
├── app/       # Expo client (iOS, Android, Web)
├── cli/       # paseo CLI tool
├── desktop/   # Electron desktop app
├── relay/     # Relay transport layer & encryption module
└── website/   # Official site & documentation
```

### 2.2 How Daemon Mode Works

The Paseo daemon is the central nervous system of the entire platform. It handles:

- **Agent lifecycle management**: Starting, stopping, and monitoring programming agent processes
- **WebSocket API**: Real-time communication interface for all clients
- **MCP (Model Context Protocol) server**: Standard protocol implementation for AI model provider integration
- **Cross-process coordination**: Context passing and task distribution between multiple agents

Starting the daemon is a single command:

```bash
# Docker deployment
docker run -d --name paseo \
  -p 6767:6767 \
  -e PASEO_PASSWORD=change-me \
  -v "$PWD/paseo-home:/home/paseo" \
  -v "$PWD:/workspace" \
  ghcr.io/getpaseo/paseo:latest

# CLI startup (local development)
paseo daemon start
```

### 2.3 WebSocket Real-Time Communication

All clients connect to `localhost:6767` via WebSocket, enabling:

- Desktop clients to see agent output streams in real time
- Mobile clients to remotely monitor task progress
- CLI tools to be embedded into any terminal workflow

```bash
# Connect to daemon via CLI
paseo connect --agent claude-code

# View currently active agents
paseo status
```

### 2.4 TypeScript SDK: Seamless Integration

To build tools or platforms on top of Paseo, use the official `@getpaseo/client` SDK:

```typescript
import { createClient } from '@getpaseo/client';

const client = createClient({
  password: process.env.PASEO_PASSWORD,
  host: 'localhost',
  port: 6767,
});

// Connect to daemon and list active agents
const agents = await client.listAgents();
console.log('Active agents:', agents);

// Send a task to a specific agent
await client.sendTask({
  agentId: 'claude-code',
  prompt: 'Optimize the current project\'s build speed',
});
```

---

## 3. Migrating from Tauri to Electron: Full Technical Retrospective

### 3.1 The Initial Choice: Why Tauri?

Early in the project, Mo Boudra — like many developers — held biases against Electron: **bloated size, high memory usage, slow startup**. They chose Tauri for seemingly good reasons:

- **Rust backend**: Excellent performance, low memory footprint
- **Small binary size**: Tauri packages are much smaller than Electron
- **Native webview**: Expected "native-level" performance across platforms

These are genuine Tauri advantages. But the problem is: **between theoretical superiority and real-world deployment lies the entire engineering reality.**

### 3.2 Problem 1: The Linux WebKitGTK Nightmare

Tauri on Linux depends on the system's built-in WebKitGTK engine, rather than bundling its own browser runtime.

This creates three layers of problems:

**1. Version Fragmentation**
Different Linux distributions ship wildly different WebKitGTK versions. Ubuntu 22.04 might use WebKitGTK 4.1, while Fedora 40 might still be on 4.0. Subtle API differences are enough to make the same feature behave completely differently on two distributions.

**2. Wayland Compatibility Issues**
Modern Linux desktops are transitioning to Wayland, but WebKitGTK still has known issues with IME support and hardware acceleration under Wayland.

**3. Real Layout Inconsistencies**
The same CSS flexbox layout may render differently on macOS WKWebView, Windows WebView2, and Linux WebKitGTK. Boudra put it bluntly: "You spend two days debugging a centering issue, only to discover it only happens on Ubuntu."

### 3.3 Problem 2: Notification System — Deceptively Complex

Desktop notifications seem trivial but are actually a feature that severely tests platform adaptation capability.

Paseo needs to support: **click notification → focus app window → jump to related task**.

This requires precise handling of:

- Notification click event capture
- Application window activation and focus management
- Cross-platform behavior consistency

Tauri's notification plugin provides basic capabilities, but **doesn't support click handling on desktop notifications**. Boudra tried multiple Rust crates — none could reliably provide complete notification interaction across all target platforms.

Eventually, he was forced to write **platform-specific native notification handling code** for each platform. For a project pursuing cross-platform consistency, this was a bitter irony — solving cross-platform problems by introducing more cross-platform problems.

### 3.4 Problem 3: Daemon Complexity — The True Cost of Tauri Sidecar

Paseo's core is a Node.js daemon. In the Electron ecosystem, this is a natural fit — Node.js comes pre-bundled with Electron, no extra configuration needed.

But Tauri uses a **Sidecar** pattern:

- A Sidecar is an **independently compiled binary**, built for a specific platform and target triple
- Requires handling: cross-platform packaging, file path resolution, process startup arguments, permission configuration, version upgrades
- Every new target platform means the sidecar compilation matrix doubles

Boudra's assessment was pointed: **"I realized I was essentially 're-implementing an Electron environment in Rust' — and doing it less maturely than Electron itself."**

### 3.5 Migration Process: Painful but Faster Than Expected

After deciding to migrate, the team completed the switch from Tauri to Electron in one week.

Boudra noted that while the process required extensive rewriting, **it was much faster than expected**, because:

1. **Application logic required no changes**: All business code lives in the JavaScript/TypeScript layer
2. **Electron tooling is more mature**: Debugging tools, hot reload, and ecosystem plugins are far richer than Tauri
3. **Cross-platform consistency dramatically reduced QA costs**: No longer debugging per-distribution

Post-migration improvements were全方位的:

- **Cross-platform UI is now consistent** — no more "that button is crooked on Ubuntu"
- **Notification features work properly**, including click handling
- **Daemon management is vastly simplified** — Node.js runtime managed directly by Electron process
- **Everything feels lighter** — perhaps the most surprising discovery

### 3.6 Post-Migration Reflection: Tauri Isn't Bad, Just Not the Right Fit

Boudra emphasized at the end of his post: Tauri itself isn't a poor choice — it genuinely excels in certain scenarios. His mistake was **failing to objectively assess the actual requirements**, choosing Tauri based on "vibes" instead.

> "I made this choice because I like Rust, or because Tauri had a lot of hype on HN. But I never really asked myself: What are my actual use cases?"

This reflection is more valuable than any technical detail.

---

## 4. Design Philosophy: Engineering Methodology from Paseo

### 4.1 Three Questions Technology Selection Must Answer

Paseo's migration experience teaches us that technology selection shouldn't just ask "Is this technology good?" but rather:

**① What are my actual use cases?**
Paseo is a multi-agent orchestration platform requiring:
- Stable cross-platform webview rendering (perfectly consistent across all three platforms)
- Node.js runtime (the daemon is fundamentally a Node.js application)
- Complex notification and window management

These are Electron's **core capabilities**, not add-ons. For these requirements, Electron isn't "making do" — it's a **natural fit**.

**② Where are my constraint boundaries?**
If binary size is a hard constraint (e.g., must be under 10MB), Tauri might be mandatory. But if you just "want it a bit smaller," you need to weigh the engineering complexity cost.

**③ What maintenance cost am I willing to accept?**
Tauri's sidecar pattern, ecosystem immaturity, and inconsistent plugin quality — these are hidden maintenance costs. Boudra eventually realized that the extra effort he was spending on Tauri was essentially "reinventing the wheel" to compensate for Tauri ecosystem gaps.

### 4.2 Local-First Doesn't Mean Simple

Paseo chose a local daemon architecture, which means handling on its own:

- Process lifecycle management
- WebSocket long-connection maintenance
- Cross-platform path and permission handling

This is clearly more complex than "throwing code at a third-party API." But Boudra chose this harder path because **privacy and data sovereignty are non-negotiable**.

This reflects an engineering philosophy: **Sometimes, more complex technical implementation is the守护 of more important values.**

### 4.3 Cross-Platform Consistency Is a Core Competency, Not a Gimmick

Many frameworks claim "cross-platform," but few can truly deliver consistent UI, consistent functionality, and consistent experience. Paseo spending significant time resolving WebKitGTK differences during migration demonstrates: **cross-platform consistency doesn't happen naturally — it requires deliberate investment.**

Desktop application developers choosing a framework should list "target platform webview differences" as a mandatory evaluation item, rather than assuming "write once, run anywhere."

---

## 5. Paseo Practical Tutorial

### 5.1 Installing Paseo

#### Method 1: Desktop App (Recommended for Beginners)

Visit [paseo.sh/download](https://paseo.sh/download) and download the installer for your platform.

#### Method 2: CLI Tool

```bash
# Install CLI globally
npm install -g @getpaseo/cli

# Verify installation
paseo --version

# Start daemon
paseo daemon start

# Connect your first agent
paseo connect --agent claude-code
```

#### Method 3: Docker Deployment (For Servers or Headless Environments)

```bash
docker run -d --name paseo \
  --restart unless-stopped \
  -p 6767:6767 \
  -e PASEO_PASSWORD=your-secure-password \
  -v "$PWD/paseo-home:/home/paseo" \
  -v "$PWD:/workspace" \
  ghcr.io/getpaseo/paseo:latest
```

> ⚠️ **Security Tip**: Be sure to change `PASEO_PASSWORD` — the default password is extremely insecure in production.

### 5.2 Desktop Usage Guide

After installation:

1. Open the Paseo desktop app
2. On first use, set the daemon connection password
3. Connect your first agent provider (Claude Code / Copilot / Codex, etc.)
4. Create tasks, monitor progress, and switch agents from the unified interface

Paseo supports **voice input mode** — click the microphone icon to describe tasks by voice, perfect for commuting or when your hands are busy.

### 5.3 Mobile Usage

Paseo supports both iOS and Android, built with Expo. Download the app, scan the pairing QR code from the desktop app, and you can remotely connect to the local daemon for cross-device task management.

### 5.4 Advanced: Using Paseo Skills

Paseo has three powerful built-in Skills for multi-agent collaboration:

#### `/paseo-handoff` — Agent Handoff

When one agent completes part of the work, hand off the full context to another agent to continue:

```
/paseo-handoff --from claude-code --to opencode --reason "Need stronger code refactoring capabilities"
```

#### `/paseo-advisor` — Advisor Agent

Introduce an advisor agent focused on "review and suggestions," providing real-time feedback without disrupting the main agent workflow:

```
/paseo-advisor enable --mode realtime
```

#### `/paseo-committee` — Multi-Agent Committee

Form a committee of multiple agents making decisions through voting or consensus:

```
/paseo-committee create --agents claude-code,copilot,opencode --task "Architecture review"
```

### 5.5 TypeScript SDK Advanced Example

Building an automated code review pipeline:

```typescript
import { createClient } from '@getpaseo/client';

async function automatedCodeReview() {
  const client = createClient({
    password: process.env.PASEO_PASSWORD!,
    host: process.env.PASEO_HOST || 'localhost',
    port: 6767,
  });

  // Listen to agent output streams
  client.on('agent:output', (event) => {
    console.log(`[${event.agentId}] ${event.type}: ${event.content}`);
  });

  // Launch code review task
  const task = await client.sendTask({
    agentId: 'claude-code',
    prompt: `
      Please review all TypeScript files in /workspace:
      1. Check type safety
      2. Identify potential null pointer exceptions
      3. Suggest refactoring improvements
      Output format: JSON
    `,
    options: {
      timeout: 300000, // 5-minute timeout
      stream: true,
    },
  });

  console.log(`Task submitted, ID: ${task.id}`);
}

automatedCodeReview().catch(console.error);
```

---

## 6. Conclusion: No Framework Is Best — Only Most Suitable

What makes Paseo story compelling isn't the technology itself, but a founder's **willingness to admit mistakes and share a public retrospective**.

Boudra didn't blame Tauri, nor did he engage in hindsight analysis saying "I knew Electron was better." He honestly admitted: **He was drawn by the appeal of the technology itself (Rust, performance, small size) rather than driven by actual requirements.**

This is precisely the most common pitfall in technology selection: **We don't choose a framework because it's "better," but because it makes us *feel* "better."**

Regarding the Tauri vs Electron debate, Paseo offers a compelling answer:

- **Tauri suits**: Applications with strict binary size constraints, simple UI interactions, and no need for complex native integration — utility-type applications
- **Electron suits**: Applications requiring stable cross-platform UI consistency, relying on Node.js ecosystem, and needing complex native system integration

A great engineer answers this question based on **business requirements**, not **technical preferences**.

---

**Related Links**

- Paseo Website: [https://paseo.sh](https://paseo.sh)
- GitHub: [https://github.com/getpaseo/paseo](https://github.com/getpaseo/paseo)
- Official Docs: [https://docs.paseo.sh](https://docs.paseo.sh)
- Mo Boudra's Original Post: [https://moboudra.com](https://moboudra.com)

---

*首发于微信公众号「比特财商」。*
