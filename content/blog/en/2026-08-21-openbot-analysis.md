---
title: "OpenBot Deep Dive: Giving Every AI Agent Its Own Computer"
date: "2026-08-21"
description: "Deep dive into CopilotKit/OpenBot: an AI agent platform where each Bot gets its own computer with a real browser, filesystem and tools. Every action is decided before it happens and recorded after. Core idea: trustworthy AI coworker. Supports any AG-UI agent, CEL policy engine, full audit trail, Docker one-click deployment."
tags:
  - OpenBot
  - CopilotKit
  - AI Agent
  - AG-UI
  - Agent Platform
  - LangGraph
  - CrewAI
  - Autonomy
  - Security Governance
  - MCP
categories:
  - Deep Dive
  - AI Agent
  - Open Source
---

# OpenBot Deep Dive: Giving Every AI Agent Its Own Computer

> Core idea: **"AI coworkers you can hand real work to, and actually trust with the access"** — The founders of OpenBot believe that what AI Agents lack today is not "capability" but "trustworthy operational boundaries." An Agent can drive a real browser, read and write files, and call MCP services — but what it's doing, why it's doing it, and whether you can take control at any moment — these are what determine whether an Agent can truly become your coworker. OpenBot's answer: **Give every Agent its own computer, with a gateway that observes but doesn't interfere, plus a complete operational audit trail.**

## 1. Project Background and Core Positioning

The CopilotKit team has two well-known products in the AI Agent space: **CopilotKit** (frontend Agent integration framework) and **Copilot Runtime**. OpenBot is their latest exploration in this direction — an **open-source AI Agent platform** aimed at evolving AI Agents from "capable of calling tools" to "safe to delegate real work to."

The core tension in most current Agent products is:

- You want it to do real things (log into websites, read/write files, call external services)
- But doing real things means risk (what if it makes a mistake? What if data leaks?)

OpenBot's solution isn't to limit what Agents can do — it's to **restructure the authorization model**. Instead of asking "what can this Agent do?", you ask: "who approved what in what situation, and is there a record after it happened?"

### Project Metadata

| Field | Value |
|-------|-------|
| Repository | https://github.com/CopilotKit/openbot |
| Status | Alpha (active development) |
| License | MIT |
| Languages | TypeScript/React + Bun + Hono |
| Deployment | Docker Compose / single-container Docker |
| Database | PostgreSQL + pgvector |
| Agent Protocol | AG-UI (open protocol) |
| Dependencies | CopilotKit Intelligence (threads & memory) |

### One-Line Positioning

OpenBot is a **local-first, auditable, governance-enabled AI Agent collaboration platform**: every Bot has its own independent computer (container + browser + filesystem), all operations pass through a CEL policy gateway for approval, complete audit logs are maintained, and users can take control at any time.

## 2. Core Philosophy: From "What Can It Do" to "By What Authority"

### 2.1 The Trust Dilemma of Traditional Agents

The common problem with mainstream Agent products today (Claude Code, Cursor Agent, OpenAI Operator) is: **there is massive information asymmetry between what the Agent actually does and what the user perceives.**

Users only know "I asked the Agent to do X," but they don't know:

- What specific tools the Agent called
- What the tool parameters and targets were
- Whether the result matched expectations
- Whether any dangerous operations were quietly rejected

OpenBot's core judgment is: **trust is not built by restricting capabilities — it's built through transparency and controllability.** You don't protect yourself by telling the Agent "you can't do this." Instead, you build real trust by ensuring **every operation passes through an approval gateway, leaves a record, and can be taken over at any time.**

### 2.2 The "Approve Before Acting" Governance Model

The core of OpenBot's design philosophy is **Gateway as the sole entry point**:

```
User Action → Server Gateway → Policy Check → Audit Log → Allow/Deny → Bot Computer Executes
```

The key point of this flow: **there is never an action without a record.** Every operation is:

1. **resolve** - Resolve the target from a server-held snapshot
2. **evaluate** - Evaluate whether it's allowed under CEL policy
3. **audit** - Write an audit row, recording the decision and reason
4. **act** - Only execute if allowed

### 2.3 Every Bot Gets Its Own Computer

OpenBot's most unique idea is that **every Bot owns an independent computer**:

- An independent Chromium browser (with its own login state)
- An independent `/workspace` filesystem volume
- An independent browser profile
- Optional gVisor sandbox isolation

This means data is completely isolated between Agents — one Agent being compromised doesn't mean all Agents are compromised.

## 3. Project Architecture: Components and Structure

### 3.1 System Architecture Diagram

OpenBot consists of multiple collaborating services, orchestrated via Docker Compose:

```
┌─────────────────────────────────────────────────────┐
│                     React/Vite UI                   │
│                    (app :3010)                       │
└──────────────────────┬──────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────┐
│              Hono API Server (server :3001)          │
│  Auth / Policy / Audit / Credentials / Plugins       │
│  Components / Coworkers / Channels                   │
│  CopilotKit Runtime                                  │
└──────┬────────────────┬──────────────────┬───────────┘
       │                │                  │
┌──────▼──────┐  ┌──────▼──────┐  ┌────────▼────────┐
│agent-computer│  │ agent-bot   │  │agent-langgraph  │
│  (:4100)    │  │  (:4200)    │  │    (:4201)      │
│ Chromium    │  │ PoC AG-UI   │  │  LangGraph Bot  │
│ + workspace │  │  Bot        │  │                 │
└─────────────┘  └─────────────┘  └──────────────────┘
                       │
              ┌────────▼────────┐
              │   Supervisor     │
              │ (:4500 host /    │
              │  :4300 container)│
              │ Per-Bot container │
              └─────────────────┘
                       │
              ┌────────▼────────┐
              │   PostgreSQL    │
              │ + pgvector (:5432)│
              │ Data/Audit/Policy │
              └─────────────────┘
```

### 3.2 Core Components in Detail

#### Gateway (Policy Gateway)

The Gateway is the core of OpenBot's security model. It is the sole entry point for all Bot operations:

- Resolves operation targets (URLs, file paths, MCP calls)
- Evaluates whether to allow operations under CEL policy
- Writes audit rows
- Calls the Bot computer to execute only after approval

Key design: **there is no path to bypass the gateway and operate directly.** Even low-level token-protected service ports cannot be used to circumvent the gateway.

#### Supervisor (Oversight Manager)

The Supervisor is responsible for creating and managing independent computer containers for each Bot:

- One Docker container per Bot
- Independent workspace volume per container
- Independent browser profile per container
- Supports gVisor (`runsc`) isolation runtime

#### Agent Computer (Bot's Computer)

The Agent Computer is the component that lets a Bot operate a real browser:

- Real Chromium browser (can control any website)
- Filesystem tools (read/write the Bot's workspace)
- Shell execution (also routed through the same gateway for approval)
- Screenshot and DOM snapshot capture

#### Bot Endpoints

OpenBot supports two types of Bots:

1. **Built-in Bots**: Created by configuring system prompts
2. **Remote AG-UI Bots**: Connect to any AG-UI protocol endpoint

Supported frameworks: LangGraph, Mastra, CrewAI, Pydantic AI, Google ADK, or hand-written AG-UI endpoints.

### 3.3 Three Built-in Coworkers

The OpenBot sample package includes three Bots (configured, not coded):

| Bot | Role | Capabilities |
|-----|------|-------------|
| **General Assistant** | Everyday assistant | Browser operations, file processing, information queries |
| **Knowledge** | Enterprise knowledge base | Connects to Google Drive/OneDrive knowledge sources |
| **Risk Analyst** | Risk and compliance | Reviews operational risk, provides compliance opinions |

## 4. Detailed Tutorial: Building OpenBot from Scratch

### 4.1 Prerequisites

- **Docker** + Docker Compose (for PostgreSQL and Bot services)
- **Bun 1.3+** (for App and API services)
- **CopilotKit Intelligence project and license** (free plan available, self-hostable)
- **Model API Key** (OpenAI / Anthropic / Google)

### 4.2 Quick Start (5 Steps)

**Step 1: Copy environment variables**

```bash
cp .env.example .env
```

**Step 2: Get CopilotKit Intelligence credentials**

```bash
npx --yes copilotkit@latest login
npx --yes copilotkit@latest project select
npx --yes copilotkit@latest license --write
```

- `license --write` writes `COPILOTKIT_LICENSE_TOKEN` to `.env`
- The `cpk-...` runtime key from `project select` becomes `INTELLIGENCE_API_KEY`

**Step 3: Fill in remaining configuration**

```bash
# Required
OPENAI_API_KEY=sk-...

# Generate encryption key (for local development)
openssl rand -base64 32
# Fill into KEY_ENCRYPTION_KEY
```

**Step 4: Install dependencies and start**

```bash
bun install
bash scripts/start.sh
```

The `start.sh` startup sequence:
1. Docker Compose starts PostgreSQL and Bot services
2. Database migrations are run
3. API Server starts (:3001)
4. React App starts (:3010)
5. Health checks confirm all services are ready

**Step 5: Open your browser**

Visit http://localhost:3010

### 4.3 Quick Exploration Paths

After startup, you can immediately try these scenarios:

**Path 1: Direct Bot Conversation**
- Visit `/bot`
- Input: `Open news.ycombinator.com and tell me the top story.`
- Observe how the Bot opens a browser, searches autonomously, and reports back the results

**Path 2: Audit Log Verification**
- Ask the Bot to fill out https://httpbin.org/forms/post
- Visit `/admin/audit` to view the complete operation record
- See that every step has a timestamp, tool name, target address, and result

**Path 3: Policy Interception**
- Visit `/admin/boundaries`
- Add a deny rule (e.g., block access to a specific domain)
- Retry the same operation and observe the Bot being denied with the rule name displayed

**Path 4: Create a Custom Coworker**
- Visit `/agents`
- Create a new Bot: fill in name, job title, and role description
- Choose an AG-UI endpoint or built-in mode
- Launch a dedicated channel

### 4.4 Single-Container Docker Deployment (Production Recommended)

```bash
# Build image
docker build -t openbot .

# Start (with embedded PostgreSQL)
docker run -p 3001:3001 --env-file .env \
  -e EMBEDDED_POSTGRES=on \
  -v openbot-data:/var/lib/postgresql/data \
  openbot

# Or connect to an external PostgreSQL
docker run -p 3001:3001 --env-file .env \
  -e DATABASE_URL="postgresql://user:pass@host:5432/openbot" \
  openbot
```

### 4.5 Google OAuth Authentication Setup (Optional)

In local development, `OPENBOT_DEV_NO_AUTH` is enabled by default (skip login; all requests run as administrator).

To configure real authentication:

```bash
# Generate a secret
openssl rand -base64 32

# Set in .env
BETTER_AUTH_URL=http://localhost:3001
BETTER_AUTH_SECRET=<secret from above (at least 32 characters)>
GOOGLE_OAUTH_CLIENT_ID=<your Google OAuth Client ID>
GOOGLE_OAUTH_CLIENT_SECRET=<your Google OAuth Client Secret>

# Trusted origin (for local development)
TRUSTED_ORIGINS=http://localhost:3010

# Initial admin email
INITIAL_ADMIN_EMAILS=your@email.com

# Remove OPENBOT_DEV_NO_AUTH
```

## 5. CEL Policy Engine Deep Dive

### 5.1 Policy Rule Format

Policies are stored in JSON format in the `AGENT_COMPUTER_POLICY` environment variable or in admin-saved configuration:

```json
{
  "deny": [
    {
      "description": "Block access to cloud metadata addresses",
      "expression": "page.host.matches('.*\\.google\\.com.*')"
    }
  ],
  "allow": [
    {
      "description": "Allow browsing and searching",
      "expression": "tool.name in ['browser.navigate', 'browser.search']"
    }
  ]
}
```

### 5.2 Inspectable Fields

CEL rules can inspect the following fields:

| Field Type | Available Fields |
|-----------|------------------|
| Tool | `tool.name` |
| Intent | `intent` |
| Bot | `bot.id` |
| User | `actor.id` |
| Page | `page.url`, `page.host` |
| Element | `element.ref`, `element.role`, `element.name`, `element.type` |
| Keyboard | `key` |
| File | `file.path`, `file.name`, `file.extension` |
| MCP | `mcp.server`, `mcp.tool`, `mcp.effect` |

### 5.3 Fail-Closed Principle

OpenBot's policy engine **strictly follows the fail-closed principle**:

- Deny rules are evaluated before allow rules
- **No policy configured = deny everything**
- A malformed deny rule = deny
- A malformed allow rule = do not allow

This means that in the default state, a Bot cannot do anything until the administrator explicitly configures allow rules.

### 5.4 Policy Management Interface

Administrators can use the `/admin/boundaries` interface to:

- View current policies
- Add/edit/delete rules
- Select preset policy templates
- See the interception effects after rules take effect

## 6. Key Features Deep Dive

### 6.1 "Take the Wheel" Mechanism

When a Bot encounters the following situations, it requests human assistance:

- Login walls (credentials needed)
- 2FA prompts
- Uncertain dangerous operations

Control handoffs are logged as three audit events:

- `computer.help_requested` — Bot requests help
- `computer.control_taken` — User takes control
- `computer.control_released` — User releases control

**Key design**: During the period a user has taken control, all of the Bot's operation requests are **directly rejected**, not queued. This ensures the user always has final say.

### 6.2 Credential Vault

Sensitive credentials (API Keys, OAuth Tokens, database passwords) should never appear in conversation logs.

OpenBot's solution:

- Store encrypted credentials via the `/admin/credentials` interface
- Credentials are stored encrypted and **never returned in API responses**
- Audit logs record "credential was requested" and "request duration," but not the credential content itself

### 6.3 MCP Governance

OpenBot integrates MCP (Model Context Protocol) support with a built-in governance layer:

**Built-in MCP integrations**:

- Atlassian (Jira, Confluence)
- Box
- Slack
- Salesforce
- ServiceNow

**Governance rules**:

- Custom MCP servers must pass URL inspection
- Tools that cannot be clearly classified as "read" operations are **treated as write operations by default**
- Every MCP call goes through both grant checking and policy evaluation

### 6.4 React Components as Tools

Unlike most Agents that respond with plain text, OpenBot Bots can return **React components**:

- Compiled components are stored in `app/src/components/gallery/`
- Sandboxed components are authored and published in `/admin/playground`
- Every component invocation is verified by the server (does it exist? Is it published? Is this Bot allowed to use it?)
- Built-in data functions: `botActivity` (Bot activity) and `recentRefusals` (recent denials)

### 6.5 Persistent Threads and Memory

OpenBot implements this via CopilotKit Intelligence:

- Conversations persist across service restarts (no context loss)
- Each deployed thread has a unique identifier (`DEPLOYMENT_ID`)
- Supports cross-session memory reuse

## 7. Design Philosophy: Six Core Principles

### 7.1 Record Before Act

This is OpenBot's most important design principle: **no operation can execute before its audit log entry is written.** Even if an operation is ultimately allowed, the audit row must be written before the action. This ensures that even if the system is compromised, the attacker's actions are still recorded.

### 7.2 Fail Closed

The CEL policy engine's fail-closed behavior means:

- The default state is the safest state
- Security holes come from configuration errors, not design flaws
- Administrators must explicitly grant every permission

### 7.3 Isolate, Don't Restrict

Each Bot has an independent container, an independent browser profile, and an independent workspace — **isolation is the default**, not a security measure achieved through restriction. This directly maps to the logic of a rock climbing safety harness: safety comes from separating you from the fall, not from preventing you from climbing high.

### 7.4 Transparency is Trust

OpenBot doesn't build trust by hiding capabilities — it builds trust through **complete transparency**:

- Every operation is logged
- Every denial has a reason
- Users can take control at any time
- Credentials never enter conversation logs

### 7.5 Protocol, Not Platform

OpenBot is built on the AG-UI protocol and doesn't lock into any specific framework. This ensures:

- LangGraph, Mastra, CrewAI, and Pydantic AI can connect seamlessly
- Governance logic follows the protocol, not the framework
- Users are not locked into the CopilotKit ecosystem

### 7.6 Local-First

OpenBot is designed to run on **your own infrastructure**:

- Data lives in PostgreSQL (a database you control)
- Models are your choice (API keys you provide)
- Browser binds to loopback (local only)
- No need to send sensitive data to third-party services

## 8. Key Viewpoints and Conclusions

### Viewpoint 1: The Next Evolution of Agents is "Auditability," Not "Capability"

Current AI Agent competition focuses on "what can be done" — more tools, stronger reasoning, longer contexts. OpenBot points out an overlooked direction: **auditability**. As Agents can do more and more, the root of the trust problem isn't "too much capability" — it's "unclear boundaries." The next evolutionary focus will be making every operation traceable, intervenable, and explainable.

### Viewpoint 2: "Approve Before Acting" is the Inevitable Path for Enterprise Agents

For enterprise scenarios, AI Agents must meet compliance requirements (SOX, GDPR, SEC). The technical path to compliance isn't "restricting Agent capabilities" — it's **establishing a decision point before every operation.** OpenBot's CEL policy engine + audit log is a technical reference implementation for this direction.

### Viewpoint 3: Isolated Architecture is More Fundamental than Permission Systems

Traditional security thinking is RBAC (Role-Based Access Control): assign a role to an Agent, the role determines permissions. This doesn't work well in Agent scenarios because an Agent's behavior is dynamic and context-dependent. OpenBot's "one container per Bot" architecture provides a more fundamental isolation — even if one Bot is compromised, the attack surface is contained within its independent container.

### Viewpoint 4: Credential Management is Infrastructure, Not a Feature

Most Agent products treat "credential management" as an add-on feature. OpenBot makes it a first-class citizen: credential vault, encrypted storage, never returning in API responses, audit logging without recording content. This is the infrastructure leap Agents need to go from "experimental toys" to "production systems."

### Viewpoint 5: The Value of the AG-UI Protocol is That "Governance Follows the Protocol"

OpenBot's choice of AG-UI over building a proprietary protocol is driven by a core logic: **governance rules should follow the protocol, not the framework.** If governance logic is embedded in LangGraph or CrewAI, every time you switch frameworks, you'd have to reimplement governance. AG-UI as an open protocol provides the possibility of unified cross-framework governance.

### Viewpoint 6: "Human in the Loop" Doesn't Reduce Efficiency — It Increases Trust

Some question whether "users can take over at any time" reduces Agent efficiency. OpenBot's design practice shows: **once trust is established, the frequency of user intervention drops dramatically.** What truly reduces efficiency is "not knowing what the Agent is doing, so you're afraid to let it work autonomously." Transparency and controllability are the root of increasing trust and reducing intervention.

### Viewpoint 7: Open-Source Agent Platforms are Closing the Gap with Commercial Products

The CopilotKit team has fully open-sourced OpenBot (MIT), including architecture diagrams (regeneratable with `bun run diagram`), the policy engine, and MCP governance. This marks the open-source community's rapid maturity catching up with commercial products at the AI Agent infrastructure level.

## 9. Technical Specs at a Glance

| Dimension | Spec |
|-----------|------|
| Deployment form | Docker Compose / single-container Docker |
| Database | PostgreSQL + pgvector |
| App port | 3010 |
| API port | 3001 |
| Bot browser port | 4100 |
| Bot endpoint ports | 4200/4201 |
| Supervisor port | 4500 (host) / 4300 (container) |
| Policy engine | CEL expressions + fail-closed |
| Isolation runtime | gVisor (optional) |
| Credential encryption | AES-256, key derived from KEY_ENCRYPTION_KEY |
| Agent protocol | AG-UI |
| Supported frameworks | LangGraph, Mastra, CrewAI, Pydantic AI, Google ADK |
| Built-in MCP | Atlassian, Box, Slack, Salesforce, ServiceNow |

## 10. Closing Thoughts

OpenBot's core contribution isn't "another Agent framework" — it's **redefining the trust model for Agents.**

Most Agent products try to build trust by restricting capabilities ("this Agent can only do these things"). OpenBot's path is: **don't restrict capabilities — make every action transparent, auditable, and intervenable.** Trust isn't built by "doing less," it's built by "having a record for everything you do."

It also brings a more fundamental reminder: **the problem with AI Agents isn't just "is the model strong enough," it's "are the Agent's behavioral boundaries clear in a real environment."** When an Agent needs to operate a real browser, read and write real files, and call real services, "capability" and "governance" must evolve together.

OpenBot is currently in Alpha (the documentation explicitly says "Expect rough edges and bugs"), but its direction is correct — it's solving not the Agent's capability problem, but the Agent's trust problem. This is the必经之路 for AI Agents to move from "demo toys" to "production systems."

---

*Project: https://github.com/CopilotKit/openbot*
*Website: https://copilotkit.ai/openbot*
*Protocol: AG-UI (open protocol, https://github.com/ag-ui-protocol/ag-ui)*
