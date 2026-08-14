---
title: "Macro: Unified Team Workspace — Deep Analysis of the All-in-One Work Platform"
date: "2026-08-14"
description: "In-depth analysis of Macro — a unified team workspace combining email, chat, docs, tasks, AI agents, and CRM with bidirectional @linking and team-level memory, built with SolidJS + Rust"
tags:
  - Macro
  - Team Collaboration
  - All-in-One Workspace
  - SolidJS
  - Rust
  - MCP
  - CRM
  - AI Agents
  - Workflow Redesign
categories:
  - Team Collaboration Tools
  - AI Tools
  - Workflow
  - Product Analysis
  - Open Source Projects
---

# Macro: Unified Team Workspace — All-in-One Work Platform

## Project Background and Core Problem

### The Tool Fragmentation Dilemma

Modern teams struggle with tool fragmentation:

| Tool Type | Common Software | Problem |
|-----------|----------------|---------|
| Email | Gmail, Outlook | Disconnected from chat/docs |
| Messaging | Slack, Discord | Hard to search history |
| Docs | Notion, Confluence | No links to tasks/emails |
| Task Management | Linear, Jira | Separated from context |
| CRM | Salesforce, HubSpot | Disconnected from daily work |
| AI Assistants | ChatGPT, Claude | Lacks team context |

**Core contradiction**: Each tool excels individually, but together they form information silos.

### The Birth of Macro

After years of tool fragmentation pain, Macro's team made a bold decision:

> **"Let's redesign work software from the ground up as a single unified system."**

---

## Project Overview

### What is Macro?

Macro is an **All-in-One team workspace** with these core characteristics:

```
┌─────────────────────────────────────────────────────────────────┐
│                         Macro Workspace                          │
├─────────────────────────────────────────────────────────────────┤
│    📧 Email     💬 Chat     📝 Docs     📋 Tasks              │
│       │              │             │              │              │
│       └──────────────┴─────────────┴──────────────┘              │
│                         │                                        │
│                 ┌───────┴───────┐                               │
│                 │  Bidirectional │                               │
│                 │   @linking    │                               │
│                 │     Graph     │                               │
│                 └───────┬───────┘                               │
│                         │                                        │
│         ┌───────────────┼───────────────┐                       │
│         ▼               ▼               ▼                       │
│     🤖 AI Agents    📊 CRM        📞 Calls                     │
└─────────────────────────────────────────────────────────────────┘
```

### Key Features

| Feature | Core Capabilities |
|---------|------------------|
| 📧 **Email** | Multi-account inbox, keyboard shortcuts, shared inboxes, Gmail integration, AI assist |
| 💬 **Team Chat** | Thread collapsing, focused for technical discussions, bidirectional graph |
| 📋 **Tasks** | Tightly coupled to channels/DMs, created from anywhere |
| 📝 **Docs** | Real-time CRDT collaboration, offline editing, version history |
| 🎨 **Canvas** | 2D board with embedded @links |
| 🤖 **AI Agents** | Team-level memory (nightly updates), MCP integration |
| 📊 **CRM** | Native contacts/companies, Kanban boards |
| 📞 **Calls** | Recorded & transcribed, auto-logged to team memory |

---

## Technical Architecture

### Tech Stack

Macro uses **SolidJS + Rust** — unconventional but optimized for performance:

```
Macro Architecture:

Frontend (SolidJS)                    Backend (Rust)
┌────────────────────────┐           ┌────────────────────────┐
│ apps/web (Browser)     │◄─────────►│ 42 Microservices       │
│ apps/web (Tauri)       │   HTTP    │ - email, chat, docs    │
│ apps/web (Mobile)      │   gRPC    │ - tasks, AI, CRM       │
│ apps/docs              │           │ - calls, workers       │
└────────────────────────┘           └────────────────────────┘
                                                 │
                            ┌────────────────────┴────────────────────┐
                            │         167 Rust Crates                 │
                            │  Domain logic │ DB clients │ Shared libs│
                            └─────────────────────────────────────────┘
```

### Repository Structure

```
macro/
├── apps/              # SolidJS applications
│   ├── web/          # Main web app
│   └── docs/         # Documentation site
├── services/          # 42 deployable microservices
├── crates/           # 167 Rust libraries
├── packages/         # Shared TypeScript (CRDT, collaboration)
├── infra/            # Pulumi infrastructure
└── docker/           # Local dev Compose stack
```

### Hexagonal Architecture

Each service follows ports-and-adapters pattern:

```
Service Internal Architecture:

┌─────────────────────────────────────────────────────────┐
│                 Inbound Adapters                          │
│    HTTP Handler │ gRPC Handler │ Events Handler         │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│                    Domain Core                           │
│              Ports (Interfaces)                          │
│              Business Logic                              │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│                Outbound Adapters                          │
│    Database Client │ External APIs │ Cache Client         │
└─────────────────────────────────────────────────────────┘
```

---

## Core Features

### 1. Email: Unified, Not Fragmented

Macro's email system integrates deeply with workflows:

```javascript
// Macro keyboard shortcuts (Superhuman-style)
const shortcuts = {
  'j': 'next email',
  'k': 'previous email',
  'o': 'open email',
  'r': 'reply',
  'a': 'reply all',
  'f': 'forward',
  'c': 'compose',
  'c t': 'create task from email',  // Key shortcut!
  'c c': 'create contact from email',
  '/': 'global search',
};
```

#### Task from Email Workflow

```
1. Read email from client@company.com
   Subject: "Need login page changes"

2. Press 'c t' to create task
   ┌─────────────────────────────┐
   │  📋 New Task               │
   │  Title: Fix login page      │
   │  Description: [auto-filled]│
   │  Priority: High            │
   └─────────────────────────────┘

3. Task auto-links back to email
   📧 ←→ 📋 Bidirectional link!
```

### 2. Team Chat: Focused, Not Noisy

```
Slack Problems:                    Macro Solutions:
─────────────                    ────────────────
Infinite threads                  Collapsed, show first reply
Miss important discussions         Channel = topic, first reply = summary
Fragmented cross-channel          Unified search + @link
```

### 3. Docs: Real-time CRDT Collaboration

```
CRDT vs OT (Operational Transform):

Traditional OT:
  User A ──→ ops ──→ Server ──→ transform ──→ User B
              conflict! complex transform algorithm

CRDT:
  User A ──→ local ops ──→ broadcast ──→ User B
  User B ──→ local ops ──→ broadcast ──→ User A
              conflict-free! eventual consistency

Benefits: No server arbitration, offline editing, lower latency
```

### 4. Tasks: Creation from Anywhere

```
Task Creation Entry Points:

┌─────────────┬──────────────────────────────────────┐
│  Source     │              Method                   │
├─────────────┼──────────────────────────────────────┤
│  Email      │  'c t' hotkey or button click        │
│  Chat       │  @mention or /task command           │
│  Docs       │  /task command or right-click         │
│  AI Agent   │  Natural language in conversation     │
│  Keyboard   │  Global 'c t' shortcut               │
│  API/MCP    │  External tool calls                 │
└─────────────┴──────────────────────────────────────┘
```

### 5. AI Agents: Team-Level Memory

This is Macro's most differentiating feature — **AI agents with team memory**:

```
AI Agent Architecture:

                    ┌─────────────────┐
                    │   Team Memory   │
                    │  (Nightly Sync) │
                    └────────┬────────┘
                             │ read
                             ▼
┌─────────────────────────────────────────────────────────┐
│                    AI Agent Layer                         │
│      OpenAI GPT-4 │ Google Gemini │ Anthropic Claude    │
└─────────────────────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────┐
│                    MCP Tools Interface                    │
│   Email │ Chat │ Tasks │ Docs │ Contacts │ Team Memory  │
└─────────────────────────────────────────────────────────┘
```

### 6. CRM: Native, Not Bolted-On

```
CRM Bidirectional Links:

                    ┌─────────────┐
                    │    CRM      │
                    │ Contacts    │
                    └──────┬──────┘
                           │
          ┌────────────────┼────────────────┐
          │                │                │
          ▼                ▼                ▼
    ┌──────────┐    ┌──────────┐    ┌──────────┐
    │  Email   │◄──►│   Chat   │◄──►│  Tasks   │
    └──────────┘    └──────────┘    └──────────┘
```

---

## Design Philosophy

### Philosophy 1: Bidirectional @linking = Bidirectional Reachability

```
Traditional tools:
  Notion: Page A references Page B
  → But Page B doesn't know it's referenced
  → One-way links only

Macro:
  📧 Email ←──── @link ────→ 📋 Task
       │                           │
       │    Bidirectional          │
       └────────── @link ─────────┘

Benefits:
1. Click task from email → jump to task
2. Click email from task → jump to context
3. Never lose context!
```

### Philosophy 2: Channel = Permission

```
Traditional:
  Create doc → set permissions
  Send email → select recipients
  Create task → assign owner
  Problem: Must think about "who can see" every time

Macro:
  Share in channel → members auto-get access
  Permission follows content naturally
```

### Philosophy 3: Unified Inbox = No Missed Signals

```
Macro Inbox Philosophy:

┌────────────────────────────────────────────────────┐
│                   Unified Inbox                     │
├─────────────────────┬──────────────────────────────┤
│       📢 Signal     │          🔔 Noise           │
├─────────────────────┼──────────────────────────────┤
│  • @mentioned you   │  • Newsletters               │
│  • Direct messages  │  • System notifications     │
│  • Task assigned    │  • Channel activity          │
│  • Important emails │  • Group messages           │
└─────────────────────┴──────────────────────────────┘
```

### Philosophy 4: AI Is Team Memory, Not a Tool

```
Personal AI Problem:
  What did I ask ChatGPT yesterday?
  → New conversation each time, no memory

Macro AI:
  What did our team discuss last week?
  → Memory is team-wide, traceable
```

### Philosophy 5: Open Source ≠ Open Core

```
Licensing Comparison:

            Open Source    Commercial      Difference
            ──────────     ──────────      ─────────
Notion      Proprietary    Full           Not open
Confluence  Proprietary    Full           Not open
Linear      Proprietary    Full           Not open

Macro       AGPLv3         Same code      Just a license
```

---

## Getting Started Tutorial

### Option 1: Hosted Version (Recommended)

**Step 1: Sign up**

1. Visit [macro.com/app](https://macro.com/app)
2. Sign in with Google or email
3. Connect Gmail or Google Workspace

**Step 2: Connect Gmail**

```
Connect Gmail Account:

1. Click Settings in left sidebar
2. Select Email Accounts
3. Click Add Account
4. Choose Gmail or Google Workspace
5. Authorize Macro access
6. Select labels/folders to sync

Complete! ~15 minutes to get started.
```

**Step 3: Invite Team Members**

```
Invite Team:

1. Click Team in left sidebar
2. Click Invite Members
3. Enter email addresses
4. Choose roles (Admin/Member/Guest)
5. Members receive invite email
```

### Option 2: Local Development

**Prerequisites**

```bash
# Required
- Docker & Docker Compose
- Node.js 20+
- Rust 1.75+
- Pulumi CLI
- 16GB+ RAM
- 50GB+ disk space
```

**Clone and Run**

```bash
git clone https://github.com/macro-inc/macro
cd macro

# Copy env template
cp .env.example .env
# Edit .env with your API keys

# Start infrastructure
docker compose up -d

# Install frontend dependencies
cd apps/web && npm install

# Start dev server
npm run dev
```

**Access:**
- Frontend: http://localhost:3000
- API: http://localhost:4000

### Option 3: Self-Hosting (Enterprise)

```bash
# Configure AWS credentials
export AWS_PROFILE=your-profile
cd infra

# Initialize Pulumi stack
pulumi stack init production
pulumi config set --secret db_password "your-password"

# Deploy
pulumi up
```

---

## MCP Integration Tutorial

### What is MCP?

MCP (Model Context Protocol) enables AI models to interact with external tools. Macro provides **~100% API coverage** via MCP.

### Use with Cursor

**Step 1: Install Macro MCP Server**

```bash
npm install -g @macro/mcp-server
```

**Step 2: Configure Cursor**

```json
// ~/.cursor/config.json
{
  "mcpServers": {
    "macro": {
      "command": "macro-mcp",
      "args": ["--api-key", "your-api-key"]
    }
  }
}
```

**Step 3: Use in Cursor**

```
@macro search "client X feedback"
@macro create_task "reply to client X"
@macro get_team_memory "what did we discuss last week"
```

---

## Comparison with Alternatives

| Feature | Macro | Notion | Slack | Linear | Superhuman |
|---------|-------|--------|-------|--------|------------|
| Email Integration | ✅ | ❌ | ❌ | ❌ | ✅ |
| Real-time Collaboration | ✅ | ✅ | ✅ | ✅ | ❌ |
| Bidirectional Links | ✅ | ⚠️ weak | ❌ | ⚠️ weak | ❌ |
| AI Team Memory | ✅ | ❌ | ❌ | ❌ | ❌ |
| MCP Support | ✅ | ❌ | ❌ | ❌ | ❌ |
| Fully Open Source | ✅ | ❌ | ❌ | ❌ | ❌ |
| Self-hosting | ✅ | ❌ | ❌ | ❌ | ❌ |
| Offline Editing | ✅ | ❌ | ❌ | ❌ | ❌ |

---

## Core Insights

### Insight 1: All-in-One Tools Are the Future

Fragmented tools mean fragmented attention. Macro's design solves this: **one unified system where all data is inherently connected**.

### Insight 2: Bidirectional Links Are the Lifeblood of Information

One-way links (like Notion page references) are superficial. True links should be bidirectional — traceable from anywhere to its original context. Macro's @ linking achieves this.

### Insight 3: AI Should Be Team Memory

Personal AI assistants require re-explaining context each conversation. Macro's team memory enables AI to remember all team work across time — true AI assistance.

### Insight 4: Open Source Is the Best Moat

Macro's AGPLv3 means anyone can inspect, modify, and self-host. This builds trust rather than limiting commercial value.

---

## Design Philosophy Summary

### 1. Unity Over Integration

```
Integration Mode (Slack + Notion + Linear + Gmail):
  Slack ──✗── Notion
    │         │
    └────┬────┘
         ▼
      Need Zapier/Make
      → Latency
      → Maintenance cost
      → Data inconsistency

Unity Mode (Macro):
  All modules ──→ Shared DB ──→ Inherently consistent
```

### 2. Context Over Features

```
Traditional Priority:          Macro Priority:
1. Is feature complete?        1. Can we trace context?
2. Is it performant?           2. Is information connected?
3. Is UI beautiful?            3. Do features serve context?
```

### 3. AI Is Memory, Not Tool

```
Personal AI:
  What did I ask ChatGPT today?
  → New conversation each time

Team AI (Macro):
  What did our team discuss?
  → Memory is team-wide, traceable
```

### 4. Permission Flows with Content

```
Traditional: Create content → set permissions → distribute
Macro: Share in channel → members auto-get access
```

### 5. Open Source Is Trust

```
Proprietary problems:       Open source (AGPLv3):
- Can't verify security     - Code is transparent
- Vendor lock-in fear       - Can self-host
- Can't fix bugs           - Community-driven
```

---

## Conclusion

Macro represents a significant direction in work tools: **from collections of tools to unified systems**. Its bidirectional @ linking, team-level AI memory, and unified workspace point to one goal — **keeping team work contextually connected**.

In an era of tool explosion, Macro reminds us: **maybe we don't need more and better tools, but one system that unifies all tools**.

AGPLv3 licensing means Macro won't become a vendor lock-in tool — it's truly owned by teams. This may be its most important value proposition.

---

## References

| Resource | Link |
|----------|------|
| Website | [macro.com](https://macro.com) |
| GitHub | [github.com/macro-inc/macro](https://github.com/macro-inc/macro) |
| App | [macro.com/app](https://macro.com/app) |
| Docs | [docs.macro.com](https://docs.macro.com) |
| License | AGPLv3 |

---

*This article is based on Macro's GitHub repository and official documentation.*
