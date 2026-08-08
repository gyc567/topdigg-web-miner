---
title: "open·kritt Deep Analysis: Orchestrating AI Agents to Discover Real Code Vulnerabilities"
description: "A comprehensive analysis of open·kritt, an open-source AI security research platform that breaks down complex security audits into small, focused tasks executed by multiple AI agents in parallel, producing deduplicated, ranked, and verifiable security findings. The platform's core ideas come from real bug bounty hunting experience with over $1.5 million in earnings. This article covers: core philosophy, project architecture, installation guide, detailed tutorial, design philosophy, security model, and key insights."
date: "2026-08-08"
author: "TopDigg Research Team"
tags: ["open-kritt", "AI Security", "Vulnerability Detection", "Bug Bounty", "AI Agent", "Security Research", "Code Analysis"]
categories: ["Deep Dive"]
keywords: ["open-kritt", "AI Security", "Vulnerability Detection", "Bug Bounty", "AI Agent", "Security Research", "Code Analysis", "Workflow Orchestration", "Fuzzing"]
---

# open·kritt Deep Analysis: Orchestrating AI Agents to Discover Real Code Vulnerabilities

> Core Philosophy: **open·kritt is an open-source AI security research platform whose core idea is to break complex security audits into small, focused tasks, run multiple AI agents in parallel, and output deduplicated, ranked, and verifiable security findings through structured workflows.** Unlike the brute-force approach of throwing an entire codebase at an AI model and asking it to "find vulnerabilities," open·kritt emphasizes task decomposition and focused analysis — giving an agent a small, well-defined task (like "analyze function X in file Y") is far more effective than scanning the entire codebase. This philosophy comes from real-world security research: the Kritt team has earned over **$1.5 million** in bug bounties under the researcher name **Blockian**, and open·kritt is the open-source distillation of their internal tooling.

---

## 1. Project Overview

### 1.1 What Is It?

**open·kritt** is an **open-source, self-hosted AI security research platform** that orchestrates AI agents to find real code vulnerabilities. Its core approach: instead of pointing a large model at an entire codebase hoping to find bugs, break the research into **small, well-defined tasks**, run multiple AI agents in parallel, and combine their results into verifiable, ranked findings.

The platform is developed and jointly owned by Harel Rom (@harel-coffee) and Gabriel Balko (@GabiCtrlZ). It uses the **AGPL-3.0** open-source license.

### 1.2 Key Data

- GitHub: `https://github.com/Kritt-ai/open-kritt`
- Website: `https://kritt.ai`
- Documentation: `https://docs.kritt.ai`
- License: **AGPL-3.0**
- Tech Stack: Frontend (React/Vite) + Backend (Express/Prisma/PostgreSQL) + Engine (Python/Codex or Claude Code) + Docker
- CLI: `./kritt` (repository-local, no install step)

### 1.3 Project Structure

```
open-kritt/
├── backend/           # Express + Prisma REST API
├── frontend/          # React/Vite UI
├── engine/            # Scan execution engine (Python)
├── docs-site/         # Mintlify documentation site
├── database/          # PostgreSQL initialization
├── scripts/           # CLI scripts
├── kritt              # Repository-local CLI tool
└── docs/              # Security threat model and other docs
```

---

## 2. Core Features

### 2.1 Workflows

Workflows are **reusable blueprints** — tree-structured prompt steps that the engine runs in depth order, feeding each step's output into the next.

**Key Characteristics:**
- **Steps**: Each step is a prompt + expected JSON output format
- **Depth**: Steps organized by depth; depth 0 is the entry point, deeper steps are more specific
- **Multi-output**: A step can produce multiple results feeding parallel tasks at the next depth
- **Structured Output**: Each step declares output format (string/number/boolean/array/object), all keys globally unique

### 2.2 Scans

A scan ties a workflow to a target codebase:
- Supports **remote repositories** (GitHub owner/repo + commit_sha) and **local repositories**
- Supports dependency repository configuration
- Supports configurable `repo_scope` to limit scan scope
- Supports repeat runs (`repeat_runs`) for cumulative analysis

### 2.3 Post-scripts

Post-scripts are **per-finding follow-up steps** that run after workflow completion, deduplication, and ranking:
- Validate findings
- Build proofs of concept (PoC)
- Write reports
- Add severity ratings, tags, and other metadata

### 2.4 Severity Rankers

Severity rankers are **Markdown rules** that tell the model how to prioritize findings. They are customizable and can be adapted to the target project's vulnerability classification standards.

---

## 3. Core Philosophy and Design Principles

### 3.1 Task Decomposition Philosophy: Small, Focused Tasks > Large, Vague Tasks

open·kritt's core insight: **"If you point an AI at an entire codebase and ask it to 'find vulnerabilities,' it usually won't. But if you point it at one function in one file and ask a focused question, it often will."**

This philosophy underlies all of open·kritt's architectural decisions:

1. **Workflow Decomposition**: Breaking complex security audits into depth-ordered step trees
2. **Parallel Execution**: Each depth can run multiple tasks in parallel, fully utilizing context windows
3. **Context Efficiency**: Agent context windows are used for actual analysis work, not navigating massive codebases

### 3.2 Built-in Workflows

open·kritt comes with two practical workflows pre-installed:

#### External Flow Analysis

This is a workflow the team has used in actual research, not a tutorial example. It follows externally controlled input from production entry points to concrete security-sensitive behavior:

1. **Enumerate Entrypoints**: Scan the codebase to identify externally reachable entry points and handlers that process attacker-controlled input
2. **Trace Reachable Flows**: For each entry point, enumerate materially different production paths including validation outcomes, authorization boundaries, state changes, external calls, and sensitive sinks
3. **Investigate Each Flow**: Give each downstream agent one reachable flow to verify. It returns only concrete vulnerabilities with a supported attacker path, or a no-finding stub

> This decomposition saves context: entry points and flows are mapped once, while each final agent spends its context window on one concrete path.

#### Cosmos ABCI Panic Halt Review

Targets Go-based Cosmos applications where a panic in a production ABCI path could halt consensus:
1. **Enumerate ABCI Methods**: Prove which ABCI methods and phase handlers are wired into the production application
2. **Investigate Panic Classes**: Fan out four focused reviews for each reachable method — explicit panics, arithmetic panics, nil pointer panics, and bounds/type panics

### 3.3 Mandatory Finding Schema

The deepest step (terminal step) must emit the fixed **finding schema**, ensuring every finding is consistent and comparable:
- `explanation`, `file_path`, `line`, `malicious_input_example`, `summary`
- `trigger_flow`, `vulnerability_type`, `malicious_actor`
- Optional `exploitable`

This mandatory constraint ensures all findings can be uniformly processed, deduplicated, and ranked.

### 3.4 Self-Hosted First

open·kritt explicitly chooses **self-hosted** as the default and recommended deployment:
- Users own their infrastructure, data, and credentials
- Supports Codex login (recommended), OpenAI API Key, Anthropic API Key, or OpenRouter
- Backend has no application-level authentication by default — users must add their own at the network layer

---

## 4. Detailed Installation and Configuration Tutorial

### 4.1 Prerequisites

- Git
- Docker Desktop or Docker Engine + Docker Compose plugin
- Node.js 20+ (only for CLI)
- Model access credentials (Codex login recommended, or API Key)

### 4.2 Quick Installation

```bash
# 1. Clone the repository
git clone https://github.com/Kritt-ai/open-kritt && cd open-kritt

# 2. Run interactive CLI setup
./kritt

# 3. Start the full stack
./kritt start
```

After startup, access http://localhost:5173 to open the frontend UI.

### 4.3 Model Access Configuration

| Option | Description |
|--------|-------------|
| **Codex Login** (recommended) | Use eligible ChatGPT/Codex subscription access through guided device flow |
| `OPENAI_API_KEY` | Use OpenAI Platform API Key + Codex harness |
| `ANTHROPIC_API_KEY` | Use Claude Code + Anthropic API billing |
| `OPENROUTER_API_KEY` | Route compatible models through OpenRouter |

`GITHUB_TOKEN` is optional and only needed when cloning private GitHub repositories or their dependencies.

### 4.4 Manual Docker Configuration

```bash
# Copy environment template
cp .env.example .env
chmod 600 .env

# Set one Provider credential in .env:
# OPENAI_API_KEY, CODEX_API_KEY, ANTHROPIC_API_KEY, or OPENROUTER_API_KEY

# Create necessary directories
mkdir -p .data/codex
chmod 700 .data/codex

# Start
docker compose up --build
```

### 4.5 Load Sample Data

```bash
docker compose exec backend npm run seed
```

Sample data is additive and idempotent, preserving existing data.

---

## 5. Complete First Scan Tutorial

### 5.1 Create a Workflow

1. Open **Workflows → New workflow**
2. Choose **Blank workflow**, name it and add a description
3. Add steps:

**Depth 0 - Enumerate (Entry Point)**
- Name: `Enumerate Entrypoints`
- Content: Identify all externally reachable entry points in this codebase (HTTP routes, API endpoints, user input handling functions)
- Output format: `endpoints` (array)
- Check **Multi-output**

**Depth 1 - Analyze (Analysis)**
- Name: `Analyze Endpoint`
- Content: Analyze entry point `{{endpoint}}`, identifying possible injection points, data flows, and security-sensitive operations
- Output format: `findings` (array), each containing `vulnerability_type`, `file_path`, `line`, etc.
- Reference depth 0 keys: `{{endpoint}}`

**Depth 2 - Terminal**
- Name: `Document Finding`
- Content: Document the discovered vulnerability in detail, providing attack path and proof of concept
- Output format: Must include all required finding schema keys

### 5.2 Create a Post-script

1. Open **Post-scripts → New post-script**
2. Choose **Blank post-script**
3. Example content:

```
Evaluate finding "{{summary}}" - a {{vulnerability_type}} at {{file_path}}:{{line}}.

Return:
- severity (string): CRITICAL, HIGH, MEDIUM, or LOW
- confidence (string): HIGH, MEDIUM, or LOW
- recommendation (string): Fix recommendation
```

### 5.3 Create a Severity Ranker

1. Open **Severity Rankers → New ranker**
2. Write Markdown rules defining how vulnerability types and context map to severity levels

### 5.4 Run the Scan

1. Open **Scans → New scan**
2. Select a workflow
3. Set target: remote (GitHub owner/repo) or local
4. Select model, provider, and harness
5. Attach post-scripts and rankers
6. Submit and start

### 5.5 View Results

After the scan completes, open any finding to view the full report, proof of concept, and post-script output.

---

## 6. Security Model and Threat Analysis

### 6.1 Trust Boundaries

| Component | Role | Trust Level |
|-----------|------|-------------|
| Frontend | UI (React/Vite) | Operator-facing |
| Backend | REST API + Postgres (Express/Prisma) | Operator-facing, **unauthenticated by default** |
| Database | PostgreSQL — workflows, scans, findings | Trusted store |
| Engine | Claims scans, checks out repos, runs harnesses | **Analyzes untrusted code and prompts** |
| executor-view | Read-only view | Operator-facing |

### 6.2 Key Threats and Mitigations

#### 1. Untrusted Code and Prompt Injection

The engine analyzes attacker-controlled code; repositories may contain content designed to manipulate agents (prompt injection).

**Mitigations:**
- Each tool-enabled job runs in a disposable container
- Containers have writable per-job checkout directories and copied job homes
- Jobs don't mount Docker socket, database, project `.env`, or other jobs
- Harness output is schema-constrained JSON
- Draft generation calls disable model tools, user rules/settings, and session persistence

#### 2. Secret Exfiltration

Compromised/injected agents may attempt to read credentials or send data.

**Mitigations:**
- Secrets kept in `.env` and provider login/credential stores (both gitignored)
- Prefer **narrowly scoped, short-lived** `GITHUB_TOKEN`s (read-only, only needed repos)
- Rotate provider keys periodically
- Scan runners have **direct outbound internet access by default** (for agents to research, install tools, fetch dependencies)

#### 3. Data Egress to Model Providers

Scanning sends code to external endpoints by default.

**Mitigations:**
- Understand where your data goes before scanning sensitive code
- Choose model endpoints whose data handling matches your code's sensitivity
- Review provider data retention terms

#### 4. Unauthenticated API Exposure

`/api/*` has **no authentication by default**.

**Mitigations:**
- Don't bind to public interfaces
- Put your own authentication/authorization proxy in front of the backend API and UI
- Apply authentication, network controls, and rate limits at the proxy layer

### 6.3 Secure Deployment Checklist

- [ ] Run the complete stack on a **dedicated VM or Docker host**
- [ ] Add host-level egress controls if direct internet access doesn't fit your policy
- [ ] Put **authentication in front of** the backend API and UI
- [ ] Use a **minimal, short-lived** `GITHUB_TOKEN`; rotate provider keys
- [ ] Choose model endpoints whose **data handling** matches your code's sensitivity
- [ ] Keep `.env` and `.data/` credential stores private; never commit them

---

## 7. Key Insights and Conclusions

### 7.1 Core Insights

**Insight 1: Task Decomposition is Key to AI Security Research**

open·kritt's most important insight is that breaking complex security audits into small, focused tasks is far more effective than trying to solve the whole problem with one large model. This matches how human security researchers actually work — experts don't审视 entire codebases simultaneously; they focus on specific entry points, data flows, and functions.

**Insight 2: Structured Output Enforces Finding Quality**

Requiring every terminal step to emit a fixed finding schema (with required keys) ensures all findings can be uniformly processed, deduplicated, and ranked. This is an important practice for AI output quality control.

**Insight 3: Self-Hosting is the Foundation of Trust**

open·kritt's choice of self-hosting as the default deployment reflects a deep understanding of code security — users need control over their data, credentials, and infrastructure. This isn't a missing feature; it's a deliberate design decision.

**Insight 4: Real Bug Bounty Experience Drives Product Design**

open·kritt isn't a theoretical project. It comes from actual security research, with team members having earned over $1.5 million in bug bounties under Blockian. Built-in workflows reflect real security research practices, not tutorial examples.

**Insight 5: Balancing Security and Functionality**

open·kritt's design balances security and functionality — agents need internet access to install tools and research targets, but the platform provides isolation and monitoring mechanisms. This is a practical necessity for handling untrusted code.

### 7.2 Use Cases

- **Security Researchers**: Integrate AI into your research process without giving up control over prompts, data, or models
- **Security-Minded Developers**: Get AI help writing and auditing secure code
- **Bug Bounty Hunters**: Systematize vulnerability discovery workflows for greater efficiency
- **Security Teams**: Conduct continuous security audits on internal codebases

### 7.3 Limitations

- No application-level authentication by default; users must add their own
- Depends on external model providers; data egress risk exists
- Requires Docker infrastructure; may add complexity for some users
- Scanning untrusted code requires dedicated isolation environment

### 7.4 Conclusion

open·kritt is a mature platform applying AI agent orchestration to security research. Its core value lies in:

1. **Task Decomposition Methodology**: Turning complex audits into manageable, focused tasks
2. **Real-World Validation**: Coming from actual bug bounty experience
3. **Self-Hosted Control**: Users own their data and infrastructure
4. **Structured Finding Output**: Verifiable, rankable, actionable results

For teams and individuals serious about code security, open·kritt provides a both practical and principled solution. Its design philosophy — focused task decomposition, structured output, and self-hosted control — represents best practices for AI-assisted security research.

---

## 8. References

- Project Repository: https://github.com/Kritt-ai/open-kritt
- Official Documentation: https://docs.kritt.ai
- Website: https://kritt.ai
- Research Paper: https://kritt.ai/open-kritt-launch
- Discord Community: https://discord.gg/kritt
- X (Twitter): https://x.com/Kritt_AI
- Threat Model: https://github.com/Kritt-ai/open-kritt/blob/main/docs/threat-model.md
- Bug Bounty Profile (Blockian): https://immunefi.com/profile/Blockian/
