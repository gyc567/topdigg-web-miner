---
title: "Eve: Vercel's Open-Source Agent Framework — Managing AI Agents via Directory Structure"
date: "2026-08-16"
description: "Deep dive into Vercel Eve open-source Agent framework — 'Next.js for Agents', directory-based agent management with subagent, workflow, and MCP support"
tags:
  - Eve
  - Vercel
  - AI Agent
  - Agent Framework
  - Open Source
  - Workflow
  - MCP
  - TypeScript
categories:
  - AI Agent
  - Agent Framework
  - Vercel Open Source
  - TypeScript
  - Workflow Engine
---

# Eve: Vercel's Open-Source Agent Framework — Managing AI Agents via Directory Structure

## Project Background and Core Problems

### The Infrastructure Challenge in AI Agent Development

In the field of AI Agent development, developers face a common problem: **After building an agent loop, how do you handle the infrastructure challenges?**

| Pain Point | Description | Gap in Existing Solutions |
|------------|-------------|---------------------------|
| **Messy Code Organization** | Agent code, config, and instructions scattered everywhere | No unified project structure |
| **Complex Deployment** | State management, persistence, error recovery hard to handle | Requires heavy custom development |
| **Difficult Multi-channel Integration** | Slack, Discord, Telegram integration complex | Each channel needs separate adaptation |
| **Inflexible Model Switching** | Dependent on single provider, concentrated risk | Lacks flexible model switching mechanism |
| **Subagent Management** | Complex tasks hard to decompose and delegate | Lacks standardized architecture |

### Birth of Eve

> **"Eve — The Next.js Experience for Agents"**

Eve is an **open-source Agent building framework released by Vercel in June 2025**, bringing a decade of web development best practices to AI Agent development:

```
┌─────────────────────────────────────────────────────────────────┐
│                      Eve Core Positioning                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  🎯 Position:      "Next.js for Agents"                          │
│  🏢 Developer:     Vercel                                        │
│  📅 Released:      June 2025                                     │
│  📦 Language:      TypeScript                                    │
│  🛠️ Architecture:  Directory Structure as Agent                 │
│  🔌 Integration:   MCP, Slack, Discord, Multi-channel Support    │
│  ⚙️ Engine:        Based on Vercel Workflow SDK                  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Project Overview

### What is Eve?

Eve is a **production-grade framework for building and deploying AI Agents**, with its core philosophy being treating each Agent as an independent directory where all related code, config, and instructions are centrally managed.

### Key Features at a Glance

| Feature | Description |
|---------|-------------|
| 🗂️ **Directory as Agent** | Each Agent is an independent directory with complete definition |
| 📝 **Markdown Instructions** | System prompts written in Markdown, intuitive and maintainable |
| 🔧 **Tools as Files** | Each tool is an independent TypeScript file, auto-registered |
| 🔄 **Automatic Model Switching** | AI Gateway auto-handles provider failover |
| 💬 **Multi-channel Support** | Built-in Slack, Discord, Teams, Telegram support |
| ⚡ **Workflow-driven** | Based on persistent workflows, supports pause/resume/schedule |
| 🔌 **MCP Integration** | Connect external tools via MCP servers |
| 🏗️ **Subagent Support** | Support building Agent Teams, decompose complex tasks |

---

## Deep Dive: Architecture Design

### Core Philosophy: Directory as Agent

Eve's most important design decision is using **directory structure as the core way to organize agents**:

```
my-agent/
├── package.json           # Project dependencies
├── tsconfig.json          # TypeScript config
├── .env.example           # Environment variables template
└── agent/
    ├── agent.ts           # Agent core logic
    ├── instructions.md    # System instructions (Markdown)
    ├── model.ts           # Model configuration
    ├── channels/          # Channel configurations
    │   ├── eve.ts         # Eve built-in channel
    │   ├── slack.ts       # Slack integration
    │   └── discord.ts     # Discord integration
    └── tools/             # Tool definitions
        ├── search.ts      # Search tool
        └── send.ts        # Send message tool
```

**Why Directory Structure?**

| Advantage | Description |
|-----------|-------------|
| **Self-contained** | All agent-related files in one directory, easy to move and reuse |
| **Intuitive** | Clear file structure, new developers can understand quickly |
| **Version-control friendly** | Entire Agent can be versioned as an independent module |
| **Simple deployment** | Directory is deployment unit, Vercel platform naturally supports |

### Workflow Engine

Eve's underlying layer is based on **Vercel's open-source Workflow SDK**, bringing the following capabilities:

```
┌─────────────────────────────────────────────────────────────┐
│                    Workflow Architecture                      │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│   User Session                                               │
│       │                                                      │
│       ▼                                                      │
│   ┌─────────────────────────────────────────────────────┐   │
│   │              Persistent Workflow                     │   │
│   │                                                      │   │
│   │   ┌──────────┐    ┌──────────┐    ┌──────────┐     │   │
│   │   │  Step 1  │───▶│  Step 2  │───▶│  Step 3  │     │   │
│   │   └──────────┘    └──────────┘    └──────────┘     │   │
│   │        │               │               │            │   │
│   │        ▼               ▼               ▼            │   │
│   │   ┌─────────────────────────────────────────────┐   │   │
│   │   │              State Persistence               │   │   │
│   │   │         (Pause, Resume, Schedule)            │   │   │
│   │   └─────────────────────────────────────────────┘   │   │
│   └─────────────────────────────────────────────────────┘   │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

**Workflow Core Advantages:**

- **Persistent State**: Sessions can pause and resume at any step
- **Error Recovery**: Failed workflows retry from checkpoint
- **Scheduled Execution**: Support timed tasks and delayed execution
- **Concurrency Control**: Built-in concurrency limits, prevent resource exhaustion

### Model and AI Gateway

Eve achieves unified model management and automatic failover through **AI Gateway**:

```typescript
// agent/model.ts
export default defineModel({
  // Auto-fetch credentials from EVE_API_KEY env var
  // Auto-handle model provider failover
  provider: "openai",
  model: "gpt-4o",
});
```

**AI Gateway Capabilities:**

| Capability | Description |
|------------|-------------|
| **Provider Abstraction** | Unified interface, shields provider differences |
| **Automatic Failover** | Auto-switch to backup when primary fails |
| **Load Balancing** | Request distribution across providers |
| **Usage Monitoring** | Track usage and cost per provider |
| **Custom Provider** | Configure custom endpoint via `EVE_MODEL_BASE_URL` |

### Tool System

Eve's tool system is simple yet powerful:

```typescript
// agent/tools/search.ts
export const search = defineTool({
  name: "search",
  description: "Search the web for information",

  parameters: z.object({
    query: z.string().describe("The search query"),
    limit: z.number().optional().describe("Max results"),
  }),

  execute: async ({ query, limit = 10 }) => {
    const results = await webSearch({ query, limit });
    return results;
  },
});
```

**Tool System Features:**

- **File as Definition**: Each tool is an independent `.ts` file
- **Auto-registration**: Filename auto-becomes tool name, no extra registration
- **Type Safety**: Complete TypeScript type inference
- **Schema Validation**: Zod-based parameter validation

---

## Design Philosophy

### Core Principles

Eve's design philosophy can be summarized in these core principles:

#### 1. Convention over Configuration

> **"Like Next.js, use conventions to reduce decision fatigue, let developers focus on business logic."**

Eve sets clear conventions for project structure, file naming, tool registration, etc., so developers just follow conventions without extra configuration.

#### 2. Directory as Boundary

> **"One directory defines an Agent's complete boundary, including code, config, instructions, and channels."**

This design enables:
- Agents can be completely moved, copied, versioned
- Teams can independently develop and test individual agents
- Deployment becomes simple and reliable

#### 3. Workflow First

> **"All sessions are persistent workflows, meaning reliability and recoverability are built-in."**

#### 4. Channel Abstraction

> **"Agent core logic is decoupled from channels; the same agent can connect to any channel."**

#### 5. Developer Experience First

- **Immediate Feedback**: `eve dev` supports hot reload development
- **Type Safety**: Complete TypeScript support
- **Clear Errors**: Friendly error messages and debugging suggestions

### Comparison with Other Frameworks

| Dimension | Eve | LangChain | CrewAI |
|-----------|-----|-----------|--------|
| **Organization** | Directory structure | Code-first | Role/Agent definition |
| **State Management** | Built-in workflow | DIY | Limited support |
| **Channel Integration** | Built-in multi-channel | DIY | DIY |
| **Model Switching** | AI Gateway | Multi-provider support | Multi-provider support |
| **Deployment Experience** | Vercel-like experience | DIY | DIY |
| **Learning Curve** | Low | High | Medium |

---

## Quick Start Tutorial

### Environment Requirements

| Requirement | Description |
|-------------|-------------|
| **Node.js** | 24.0.0 or higher |
| **Package Manager** | npm, pnpm, or bun |
| **API Key** | Vercel AI Gateway API Key |

### Install Eve CLI

```bash
# Using npm
npm install -g eve-cli

# Using pnpm
pnpm add -g eve-cli

# Verify installation
eve --version
```

### Create Your First Agent

#### Step 1: Initialize Project

```bash
# Create new project
eve init my-first-agent

# Enter project directory
cd my-first-agent

# Install dependencies
npm install
```

#### Step 2: Configure Environment Variables

```bash
# Copy env template
cp .env.example .env

# Edit .env file, add your API Key
# EVE_API_KEY=your_api_key_here
```

#### Step 3: Write System Instructions

```markdown
<!-- agent/instructions.md -->
# My First Agent

You are a friendly AI assistant, specifically helping users answer questions.

## Capabilities
- Answer common questions
- Provide information lookup
- Help solve problems

## Behavior Guidelines
- Use friendly tone
- Answer concisely and clearly
- Be honest when unsure
```

#### Step 4: Define Model

```typescript
// agent/model.ts
import { defineModel } from "eve";

export default defineModel({
  provider: "openai",
  model: "gpt-4o",
});
```

#### Step 5: Implement Tools

```typescript
// agent/tools/search.ts
import { defineTool } from "eve";
import { z } from "zod";

export const search = defineTool({
  name: "search",
  description: "Search the web for information",
  parameters: z.object({
    query: z.string().describe("The search query"),
  }),
  execute: async ({ query }) => {
    const results = await performSearch(query);
    return results;
  },
});
```

#### Step 6: Configure Channel

```typescript
// agent/channels/eve.ts
import { defineChannel } from "eve";

export default defineChannel({
  type: "eve",
  // Eve built-in channel, no extra config needed
});
```

#### Step 7: Run Agent

```bash
# Development mode (with hot reload)
eve dev

# Or build production version
eve build

# Deploy to Vercel
eve deploy
```

---

## Hands-On Tutorial: Building Multi-channel Customer Service Agent

### Project Structure

```
customer-service-agent/
├── package.json
├── tsconfig.json
├── .env.example
└── agent/
    ├── agent.ts
    ├── instructions.md
    ├── model.ts
    ├── channels/
    │   ├── slack.ts
    │   ├── discord.ts
    │   └── telegram.ts
    └── tools/
        ├── lookup-order.ts
        ├── faq.ts
        └── escalate.ts
```

### Complete Implementation

#### 1. System Instructions

```markdown
<!-- agent/instructions.md -->
# Customer Service Agent

You are a professional customer service representative, helping customers solve order issues and common questions.

## Available Tools
- `lookup_order`: Check order status
- `faq`: Answer frequently asked questions
- `escalate`: Transfer to human support

## Processing Flow
1. First try to answer customer questions using FAQ
2. If unable to answer, try querying order information
3. If issue can't be resolved, use escalate to transfer to human

## Notes
- Maintain professional and friendly tone
- Don't leak customer's sensitive information
- Stay calm when handling complaints
```

#### 2. Order Lookup Tool

```typescript
// agent/tools/lookup-order.ts
import { defineTool } from "eve";
import { z } from "zod";

export const lookupOrder = defineTool({
  name: "lookup_order",
  description: "Look up order status by order ID",
  parameters: z.object({
    orderId: z.string().describe("The order ID to look up"),
  }),
  execute: async ({ orderId }) => {
    const order = await fetchOrder(orderId);
    return {
      orderId: order.id,
      status: order.status,
      items: order.items,
      total: order.total,
      estimatedDelivery: order.estimatedDelivery,
    };
  },
});
```

#### 3. FAQ Tool

```typescript
// agent/tools/faq.ts
import { defineTool } from "eve";
import { z } from "zod";

const FAQ_DATA = {
  shipping: "Our standard delivery time is 3-5 business days.",
  returns: "We offer 30-day no-reason return service.",
  payment: "We support credit card, PayPal and Apple Pay.",
};

export const faq = defineTool({
  name: "faq",
  description: "Answer frequently asked questions",
  parameters: z.object({
    topic: z.enum(["shipping", "returns", "payment"]).describe("The FAQ topic"),
  }),
  execute: async ({ topic }) => {
    return FAQ_DATA[topic] || "Sorry, I couldn't find an answer to your question.";
  },
});
```

#### 4. Agent Core Logic

```typescript
// agent/agent.ts
import { EveAgent } from "eve";
import { lookupOrder } from "./tools/lookup-order";
import { faq } from "./tools/faq";
import { escalate } from "./tools/escalate";

export default new EveAgent({
  name: "customer-service",
  tools: [lookupOrder, faq, escalate],
});
```

### Run and Test

```bash
# Start development server
eve dev

# Test Eve channel
eve chat

# Test Slack channel (requires SLACK_BOT_TOKEN)
eve dev --channel slack
```

---

## Multi-Agent and Subagents

### Building Agent Teams

Eve supports decomposing complex tasks into multiple subagents:

```
┌─────────────────────────────────────────────────────────────┐
│                    Agent Team Architecture                   │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│                    Main Agent (Manager)                      │
│                         │                                    │
│          ┌──────────────┼──────────────┐                    │
│          ▼              ▼              ▼                    │
│    ┌──────────┐   ┌──────────┐   ┌──────────┐             │
│    │Subagent A│   │Subagent B│   │Subagent C│             │
│    │(Research)│   │(Analysis)│   │(Reporting)│             │
│    └──────────┘   └──────────┘   └──────────┘             │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Subagent Example

```typescript
// agents/researcher/agent.ts
export default new EveAgent({
  name: "researcher",
  description: "Research agent for gathering information",
  tools: [search, scrape],
});

// main-agent/agent.ts
import { researcher } from "./agents/researcher";
import { analyst } from "./agents/analyst";

export default new EveAgent({
  name: "manager",
  tools: [],
  subagents: {
    researcher,
    analyst,
  },
});
```

---

## Channel Integration Details

### Supported Channels

| Channel | Description | Config Requirements |
|---------|-------------|-------------------|
| **Eve** | Built-in CLI chat interface | No extra config |
| **Slack** | Enterprise team collaboration | Bot Token, Signing Secret |
| **Discord** | Community and gaming platform | Bot Token |
| **Teams** | Microsoft collaboration platform | App ID, App Password |
| **Telegram** | Instant messaging | Bot Token |
| **Twilio** | SMS and voice | Account SID, Auth Token |
| **GitHub** | Code and DevOps | App ID, Private Key |
| **Linear** | Project management | API Key |

---

## MCP Integration

### What is MCP?

MCP (Model Context Protocol) is a standard protocol allowing AI systems to connect to external tools and data sources. Eve natively supports MCP servers.

### Configure MCP Server

```typescript
// agent/mcp.ts
import { McpServer } from "eve";

export const filesystem = new McpServer({
  name: "filesystem",
  command: "npx",
  args: ["-y", "@modelcontextprotocol/server-filesystem", "/tmp"],
});
```

---

## Summary and Conclusions

### Core Insights

#### 1. Framework Essence is Convention

Eve's most important contribution isn't code, but a **clear convention system**:

> **"Conventions reduce decision fatigue, let developers focus on truly important business logic."**

#### 2. Directory Structure is a Tool for Organizing Complexity

Using "directory" as the agent's boundary is a simple but powerful design decision:

- **Consistency**: All developers know where to find what
- **Composability**: Directories can nest, agents can compose
- **Versionable**: Entire agent can be version-controlled and published

#### 3. Workflow is the Foundation of Reliability

Persistent workflows aren't just "state saving," they mean:

| Capability | Value |
|------------|-------|
| **Error Recovery** | Retry from checkpoint after failure, not from scratch |
| **Pause/Resume** | Time-consuming tasks can execute in steps |
| **Scheduled Execution** | Can schedule to execute at specific times |
| **Concurrency Control** | Prevent resource exhaustion, ensure system stability |

#### 4. Channel Abstraction Unlocks Flexibility

Same agent connecting to different channels means:

- **Develop Once, Deploy Everywhere**: Agent logic written once
- **Channel-specific Optimization**: Each channel can have custom behavior
- **Independent Evolution**: Channels and agents can iterate independently

### Use Cases

✅ **Highly Recommended for Eve**:

- Teams needing to quickly build production-grade Agents
- Enterprise applications needing multi-channel integration
- Complex conversation scenarios needing reliable state management
- Developers familiar with Next.js/Vercel ecosystem

⚠️ **Needs Evaluation**:

- Simple single-turn Q&A scenarios (may be overly complex)
- Scenarios needing extreme customization (constrained by conventions)
- Scenarios extremely sensitive to latency (workflow has extra overhead)

❌ **Not Ideal For**:

- Pure research-purpose agent experiments
- Edge deployment with extremely limited resources
- Scenarios needing complete control over underlying implementation

---

## Resource Links

### Official Resources

| Resource | Link |
|----------|------|
| 🌐 Official Website | https://vercel.com/ |
| 💻 GitHub Repository | https://github.com/vercel/eve |
| 🐦 Twitter | @vercel |

### Installation

| Platform | Command |
|----------|---------|
| npm | `npm install -g eve-cli` |
| pnpm | `pnpm add -g eve-cli` |
| Source | `git clone && npm install && npm run build` |

### Environment Requirements

| Requirement | Minimum Version |
|-------------|----------------|
| Node.js | 24.0.0+ |
| npm/pnpm/bun | Latest version |

---

## Conclusion

Eve represents **an important direction in AI Agent development frameworks—bringing the best practices accumulated in web development to Agent development**.

Its design philosophy reminds us: **A good framework doesn't just provide tools, it provides conventions; it doesn't just solve current problems, it leaves space for the future**.

> **"Next.js changed how we build the web, Eve is changing how we build agents."**

---

*This article is based on the Vercel Eve open-source project.*

**Sources:**
- [GitHub - vercel/eve](https://github.com/vercel/eve)
- [Vercel Agentic Infrastructure](https://vercel.com/)
