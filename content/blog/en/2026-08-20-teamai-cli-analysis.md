---
title: "TeamAI CLI Deep Analysis: Tencent's Git-Native Architecture for Unified Multi-Agent Team Collaboration"
date: "2026-08-20"
description: "TeamAI is Tencent's open-source Agent Harness tool that manages skills, rules, and knowledge through a Git-native approach, enabling cross-Agent (Claude Code/Codex/CodeBuddy/etc.) team collaboration. This article comprehensively analyzes its design philosophy, architecture, core commands, and provides detailed tutorials."
tags:
  - TeamAI
  - Agent Harness
  - AI Agent
  - Git
  - Claude Code
  - Tencent
  - Multi-Agent Collaboration
  - Team Knowledge Management
  - MCP
categories:
  - Deep Analysis
  - AI Agent
  - Developer Tools
---

# TeamAI CLI Deep Analysis: Tencent's Git-Native Architecture for Unified Multi-Agent Team Collaboration

If you have used Claude Code, Codex, or CodeBuddy, you have likely encountered the same pain point: every Agent has its own private configuration, its own "skills" library, and its own rule files. When a team wants to share best practices — "this Prompt works for refactoring", "this MCP server is essential", "this rule prevents the model from making this kind of mistake" — there is no shared channel. Each person either copies a chat message manually, or pins a Notion document that nobody reads.

Tencent's open-source **teamai-cli** (TeamAI) proposes a clean answer: **treat all team knowledge as Git repository content**. A `team push` propagates skills, rules, and knowledge; a `team pull` synchronizes them; a `team recall` searches across the entire team's collective memory — and everything rides on Git, with no extra infrastructure.

This article is a comprehensive analysis of TeamAI: from its philosophical positioning, through its module architecture, to every command in the toolbox, and finally to a hands-on tutorial.

## 1. Project Overview: What is an Agent Harness?

### 1.1 The Concept of Agent Harness

In 2025–2026 the AI Agent ecosystem exploded. Claude Code, OpenAI Codex CLI, Google Gemini CLI, Tencent's own CodeBuddy, Cursor, Windsurf, Cline, Roo Code, and dozens of other tools all share a common pattern:

- The model itself is interchangeable (Claude Sonnet / GPT / Gemini / DeepSeek / Hunyuan)
- The "harness" — the part that wraps the model with system prompts, tool definitions, MCP integrations, permission rules, hooks, and skill libraries — is **not** interchangeable
- The competitive moat of every Agent tool is its harness design, not the underlying model

`teamai-cli` positions itself as a **meta-layer above the harness**: instead of replacing Claude Code or Codex, it sits beside them and gives teams a unified way to manage the harness itself.

### 1.2 TeamAI's Positioning

TeamAI's README states its goal plainly:

> **Manage your team's AI Agent skills, rules, and knowledge across Claude Code, Codex, CodeBuddy, and any Git-based Agent. Treat team knowledge as code. No database, no server — just Git.**

Three core positioning points:

1. **Agent-agnostic**: works with Claude Code, Codex, CodeBuddy, Cursor, and any tool that reads files from a known directory
2. **Git-native**: skills, rules, and knowledge live in a Git repository; push, pull, branch, review — all standard Git workflows
4. **Zero-server**: no SaaS backend, no database, no daemon — your Git remote IS the team's source of truth

This is a deliberately conservative architecture. Where tools like Continue.dev and various "Agent Cloud" SaaS products require hosted backends, TeamAI chooses to bet on the durability and universality of Git itself.

### 1.3 Why Tencent Built This

Tencent has thousands of internal engineers using multiple Agent products simultaneously — CodeBuddy (Tencent's own) for some tasks, Claude Code for others, Cursor for IDE-integrated work. The team-knowledge sharing problem was acute. Rather than build a closed product, Tencent open-sourced the solution so the broader community can adopt it. The repository lives at `tencent/teamai-cli`.

## 2. Core Design Philosophy

TeamAI's design rests on four philosophical pillars. Each is a deliberate bet against the prevailing "build a SaaS" trend.

### 2.1 Git as the Knowledge Carrier

The single most consequential design choice is treating **Git as the database**. Skills, rules, knowledge files, member directories, role definitions, MCP templates — all of it lives in a Git repo.

Benefits:

- **Diffable**: you can review exactly what a teammate added to a shared prompt
- **Brancheable**: try a new skill in a branch, merge when it works
- **Reviewable**: pull-request-based peer review of team knowledge
- **Auditable**: full git log shows when each rule was added and by whom
- **Backupable**: every team member has a full clone

The trade-off: Git is not a vector database. TeamAI compensates with **BM25 + knowledge-graph hybrid search** (see §3.2), but fundamentally, Git is a text-store, not a semantic store. TeamAI accepts this limitation and optimizes around it.

### 2.2 Zero-Infrastructure

TeamAI requires:

- A Git remote (GitHub, GitLab, Gitee, or any plain SSH/HTTPS endpoint)
- A local `team` binary
- Nothing else

There is no API key to register, no server to deploy, no SaaS subscription. This is the same architectural pattern that made `git` itself win — the protocol IS the product, and there is nothing to install on the server side.

```bash
# That's it. No daemon. No service. No cloud account.
team init
team push
```

### 2.3 Friction-Driven Learning

Unlike systems that hide complexity behind a UI, TeamAI is designed to **make the right thing the default** but to **stay out of your way** otherwise.

- First-time setup takes 30 seconds (`team init`)
- The most common operations are one-liners (`team push`, `team pull`)
- Advanced features (hooks, MCP, custom roles) are layered on top — you don't pay for what you don't use

The philosophy: every additional second of friction in the developer workflow reduces adoption. TeamAI optimizes for the median engineer who wants to "just share a prompt" — not for the power user configuring ten-team federations.

### 2.4 Privacy-First Sharing

Because everything lives in a Git repo you control, you choose:

- Whether to host it on public GitHub, private GitLab, or a self-hosted Gitea
- Whether each team's knowledge is private to that team or shared org-wide
- Whether to commit secrets (you shouldn't — TeamAI will warn you)
- Whether to use Git LFS for large prompt bundles

There is no telemetry by default. The CLI makes no network calls except to your configured Git remote.

## 3. Architecture Analysis

### 3.1 High-Level Module Structure

TeamAI is written primarily in Go (with some TypeScript for the optional dashboard), and ships as a single static binary. The code is organized into clearly separated modules:

```
teamai-cli/
├── cmd/                    # CLI entry points (cobra commands)
│   ├── init.go
│   ├── push.go
│   ├── pull.go
│   ├── recall.go
│   ├── import.go
│   ├── members.go
│   ├── roles.go
│   ├── hooks.go
│   ├── mcp.go
│   ├── dashboard.go
│   └── doctor.go
├── internal/
│   ├── git/                # Git Provider abstraction (GitHub/GitLab/Gitee/local)
│   ├── store/              # Local content store (.teamai/)
│   ├── search/             # BM25 + graph indexer
│   ├── manifest/           # team.toml parser
│   ├── adapter/            # Per-Agent adapters (Claude/Codex/CodeBuddy)
│   ├── hooks/              # Lifecycle hooks engine
│   ├── mcp/                # MCP server registration
│   ├── auth/               # Identity and signing
│   └── ui/                 # Terminal UI (bubbletea/lipgloss)
├── pkg/                # reusable libraries
├── schemas/                # JSON schemas for manifest and rules
├── docs/                   # User documentation
└── testdata/               # Fixtures
```

### 3.2 The BM25 + Graph Hybrid Search

When you run `team recall "how do we handle JWT refresh in our Go services?"`, the search module does the following:

1. **Tokenization**: splits the query and indexed documents into normalized tokens (lowercased, stemmed, stop-words removed)
2. **BM25 scoring**: ranks documents by the classic Okapi BM25 formula — a battle-tested probabilistic relevance model
3. **Graph expansion**: walks an internal knowledge graph built from explicit cross-references in knowledge files (e.g., `[related: jwt-patterns.md]`) to surface connected context
4. **Re-ranking**: combines BM25 score with graph proximity and recency

Why not embeddings? Three reasons:

- **Cost**: embedding APIs charge per token; a private team repo should not phone home for every query
- **Determinism**: BM25 + graph results are reproducible; semantic results shift when models are upgraded
- **Operability**: BM25 indexes are tiny, fast to rebuild, and inspectable with `grep`

For teams that want semantic search, TeamAI supports an optional embedding backend (configurable in `team.toml`) — but the default is BM25 + graph, and it works surprisingly well for code-adjacent knowledge.

### 3.3 The Git Provider Abstraction

The `internal/git` module is the architectural keystone. It defines a single `Provider` interface:

```go
type Provider interface {
    Clone(url, dest string) error
    Push(repoPath, remote string) error
    Pull(repoPath, remote string) error
    CreatePR(repoPath, title, body string) (string, error)
    ListMembers(org string) ([]Member, error)
    ValidateRemote(url string) error
}
```

Concrete implementations:

| Provider | Use Case | Auth |
|----------|----------|------|
| `github` | github.com | OAuth or PAT |
| `gitlab` | gitlab.com / self-hosted | OAuth or PAT |
| `gitee` | gitee.com | OAuth or PAT |
| `local` | Bare git on a shared filesystem | SSH keys |
| `ssh` | Any SSH-accessible bare repo | SSH keys |

This abstraction means TeamAI is **never** tied to one Git host. The same `team push` works whether your remote is on GitHub Enterprise, an internal Gitea, or a USB drive with a bare repo.

### 3.4 Per-Agent Adapters

The `internal/adapter` module maps TeamAI's canonical content layout to each Agent's expected format:

```
.teamai/
├── skills/              # TeamAI canonical
│   ├── code-review/
│   │   └── SKILL.md
│   └── refactor-go/
│       └── SKILL.md
├── rules/               # TeamAI canonical
│   └── security.md
├── knowledge/
│   ├── jwt-patterns.md
│   └── deploy-runbook.md
├── hooks/               # TeamAI canonical
│   ├── pre-commit.sh
│   └── post-merge.sh
└── mcp.json             # MCP server registry
```

When you run `team pull`, the adapter layer writes these into each Agent's expected locations:

| Agent | Skills Target | Rules Target | MCP Target |
|-------|--------------|--------------|------------|
| Claude Code | `~/.claude/skills/` | `~/.claude/CLAUDE.md` | `~/.claude/mcp.json` |
| Codex | `~/.codex/skills/` | `~/.codex/AGENTS.md` | `~/.codex/config.toml` |
| CodeBuddy | `~/.codebuddy/skills/` | `~/.codebuddy/rules/` | `~/.codebuddy/mcp.json` |
| Cursor | `.cursor/rules/` | `.cursorrules` | `.cursor/mcp.json` |

The adapter pattern keeps TeamAI loosely coupled — adding support for a new Agent means writing one new adapter, not changing the core.

## 4. Detailed Command Reference

TeamAI ships a coherent set of subcommands. Each one is small and focused. Below is the full reference.

### 4.1 `team init` — Bootstrap a Team Repo

Creates a new `.teamai/` directory and writes a starter `team.toml`:

```bash
# In a fresh or existing project
team init

# Interactive prompts:
#   Team name: acme-platform
#   Default Agent: claude-code
#   Git remote: git@github.com:acme/ai-team-knowledge.git
#   Visibility: private
```

Generated `team.toml`:

```toml
[team]
name = "acme-platform"
default_agent = "claude-code"
visibility = "private"

[remote]
provider = "github"
url = "git@github.com:acme/ai-team-knowledge.git"
branch = "main"

[members]
# Populated by `team members add`

[search]
backend = "bm25-graph"   # or "embedding"
embedding_model = ""      # only if backend = embedding

[agents.claude-code]
enabled = true
skills_target = "~/.claude/skills/"
rules_target = "~/.claude/CLAUDE.md"

[agents.codex]
enabled = true
skills_target = "~/.codex/skills/"
```

### 4.2 `team push` — Share Knowledge Upstream

Stages and commits all local changes in `.teamai/` and pushes to the configured remote:

```bash
team push
# Equivalent to:
#   git -C .teamai add -A
#   git -C .teamai commit -m "team push: $(date -Iseconds)"
#   git -C .teamai push origin main
```

With explicit message:

```bash
team push -m "feat(skills): add go-error-handling skill"
```

Dry-run:

```bash
team push --dry-run
# Shows what WOULD be committed without committing
```

### 4.3 `team pull` — Sync Knowledge from Upstream

Pulls the latest from the remote and applies it to your local Agents:

```bash
team pull
# Steps performed:
#   1. git fetch + merge (or rebase, configurable)
#   2. Re-index the local search corpus
#   3. For each enabled agent in team.toml:
#      - Sync .teamai/skills/ → Agent skills dir
#      - Sync .teamai/rules/  → Agent rules file
#      - Update MCP config if changed
```

Conflict handling:

```bash
team pull --strategy=ours    # Prefer local on conflict
team pull --strategy=theirs  # Prefer remote on conflict
team pull --strategy=manual  # Open conflicts in $EDITOR
```

### 4.4 `team recall` — Search Team Knowledge

The killer feature. Searches across all skills, rules, and knowledge files:

```bash
team recall "how do we rotate API keys"
# Output:
#   knowledge/api-key-rotation.md (score: 8.4)
#     "Service tokens are rotated quarterly via the platform-cli ..."
#
#   skills/incident-response/SKILL.md (score: 4.1)
#     "... if rotation fails, page on-call via ..."

team recall --agent=claude-code "JWT refresh pattern"
# Limits results to content flagged for Claude Code
```

Interactive mode:

```bash
team recall --interactive
# Opens a TUI (built on bubbletea) with:
#   - Live results as you type
#   - Enter to copy result to clipboard
#   - `o` to open in $EDITOR
#   - `s` to save as a new knowledge file
```

### 4.5 `team import` — Bring Existing Content In

Imports skills, rules, or knowledge from another source:

```bash
# Import from another team repo
team import --from=git@github.com:acme/legacy-knowledge.git

# Import a single Anthropic Skills-compatible directory
team import --from=https://github.com/anthropics/skills/tree/main/pdf

# Import from a local directory
team import --from=./my-existing-prompts/

# Import a single file
team import --from=./runbook.md --kind=knowledge
```

During import, TeamAI normalizes frontmatter, validates against the JSON schemas in `schemas/`, and prompts for a category and tags.

### 4.6 `team members` — Manage Team Membership

```bash
# List current members
team members list

# Add a member
team members add --name="Alice" --role=maintainer --github=alice

# Remove a member
team members remove alice

# Show details for one member
team members show alice
#   Name:  Alice Chen
#   Role:  maintainer
#   Joined: 2026-03-15
#   Contributions: 47 commits, 9 PRs
#   Last active: 2 hours ago
```

Members are stored in `team.toml` under `[members]` and committed to Git — so membership changes are reviewable like code.

### 4.7 `team roles` — Define Team Roles

Roles bundle default permissions and starter content:

```bash
# List built-in roles
team roles list
#   backend-engineer
#   frontend-engineer
#   data-engineer
#   security-reviewer
#   oncall

# Apply a role to yourself
team roles apply backend-engineer
# Adds backend-specific skills, rules, and MCP servers to your local config

# Create a custom role
team roles create mobile-ios \
    --skills=swift-style,swift-testing \
    --rules=ios-security.md \
    --mcp=xcode-mcp

# Show what a role provides
team roles show backend-engineer
```

### 4.8 `team hooks` — Lifecycle Automation

Hooks are scripts that run at well-defined points in TeamAI's lifecycle:

```bash
team hooks list
team hooks add --event=pre-push --script=./scripts/scan-secrets.sh
team hooks add --event=post-merge --script=./scripts/refresh-index.sh
team hooks remove pre-push
```

Supported events: `pre-push`, `post-push`, `pre-pull`, `post-pull`, `pre-commit`, `post-merge`. See §6 for details.

### 4.9 `team mcp` — Manage MCP Servers

```bash
# List MCP servers known to the team
team mcp list

# Add a shared MCP server to the team manifest
team mcp add github \
    --command=npx \
    --args="-y,@modelcontextprotocol/server-github" \
    --env=GITHUB_TOKEN=\${env:GITHUB_TOKEN}

# Install a team's MCP servers locally
team mcp install

# Validate that all required MCP servers are reachable
team mcp doctor
```

### 4.10 `team dashboard` — Web UI

Launches a local web UI on `http://localhost:7474`:

```bash
team dashboard --port=7474
```

The dashboard provides:

- Browseable view of all skills, rules, knowledge
- Full-text search with snippets
- Member activity feed
- PR / merge timeline
- "Adoption stats" — how often each skill is being loaded by Agents

Useful for non-CLI users (managers, PMs) to see what's happening.

### 4.11 `team doctor` — Diagnostic Checks

Runs a battery of self-checks:

```bash
team doctor
#   ✓ Git remote reachable
#   ✓ Local index up to date (last built 12 minutes ago)
#   ✓ All enabled agents' target dirs exist
#   ✓ Claude Code skills dir writable
#   ✓ Codex skills dir missing — `team pull` will create it
#   ⚠  Hook script .teamai/hooks/pre-push.sh not executable (chmod +x?)
#   ✗ MCP server "github" unreachable — check GITHUB_TOKEN
```

Exit code is non-zero if any check fails, making it CI-friendly.

### 4.12 Less Common but Useful Commands

| Command | Purpose |
|---------|---------|
| `team new skill <name>` | Scaffold a new skill from a template |
| `team new rule <name>` | Scaffold a new rule file |
| `team validate` | Validate `team.toml` and all content against schemas |
| `team index` | Rebuild the local search index without pulling |
| `team config get/set` | Read or write config values |
| `team completion zsh/bash/fish` | Generate shell completions |
| `team version` | Show version and build info |

## 5. Cross-Team Skill Subscription

### 5.1 The Subscription Model

Beyond "one team's private repo", TeamAI supports **subscriptions**: a team can declare that it consumes skills from another team's repo.

In `team.toml`:

```toml
[subscriptions]
  [subscriptions."github.com/anthropics/skills"]
    ref = "main"
    include = ["pdf", "docx"]   # only these subdirs
    exclude = ["experimental/*"]
```

After `team pull`:

```
.teamai/
├── _local/                 # This team's own content
│   ├── skills/
│   ├── rules/
│   └── knowledge/
└── _subscriptions/
    └── github.com/anthropics/skills/
        ├── pdf/SKILL.md
        └── docx/SKILL.md
```

The adapter layer merges `_local` and `_subscriptions` into each Agent's target directory, with `_local` taking precedence on name collision.

### 5.2 Why This Matters

This is the part that turns TeamAI from "a team wiki" into "an ecosystem":

- **Anthropic** could publish an official skills repo that any team can subscribe to
- **A consulting firm** could publish a "compliance-pack" subscription
- **An open-source project** could publish curated rules for working on its codebase
- **Tencent** could publish internal best practices as a subscription

The model is intentionally close to npm or apt — a registry of packages you can subscribe to, with version pinning via Git refs.

### 5.3 Resolution Order

When the same skill name exists in `_local` and a subscription:

1. Local wins
2. Earlier subscription in `team.toml` wins
3. Later subscriptions are shadowed

This makes overrides explicit and predictable.

## 6. Hook and MCP Extension System

### 6.1 Hook System in Detail

Hooks are executable scripts in `.teamai/hooks/` triggered at lifecycle events. Each hook is a regular file with a shebang and is invoked with a JSON payload on stdin:

```bash
#!/usr/bin/env bash
# .teamai/hooks/pre-push.sh
# Receives: {"event":"pre-push","files":["skills/foo/SKILL.md",...],"author":"alice"}
set -euo pipefail

echo "Scanning $(echo "$1" | jq '.files | length') files for secrets..."
echo "$1" | jq -r '.files[]' | while read -r f; do
    if grep -qE '(AKIA[0-9A-Z]{16}|ghp_[a-zA-Z0-9]{36})' "$f"; then
        echo "::error file=$f::Secret pattern detected"
        exit 1
    fi
done
```

Hook configuration in `team.toml`:

```toml
[hooks]
  [hooks.pre-push]
    script = ".teamai/hooks/pre-push.sh"
    timeout_seconds = 30
    fail_strategy = "block"   # or "warn"

  [hooks.post-merge]
    script = ".teamai/hooks/post-merge.sh"
    run_async = true
```

Hooks are deliberately simple — they are shell scripts, not a DSL. This is on purpose: any team can write them, debug them with standard tooling, and version them in Git.

### 6.2 MCP Integration

TeamAI treats MCP servers as **first-class shared resources**. A team's `.teamai/mcp.json` is the canonical registry:

```json
{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_TOKEN": "${env:GITHUB_TOKEN}"
      }
    },
    "postgres-readonly": {
      "command": "uvx",
      "args": ["mcp-server-postgres", "--readonly"],
      "env": {
        "DATABASE_URL": "${env:TEAM_PG_URL}"
      }
    },
    "internal-jira": {
      "command": "/opt/teamai/mcp/jira-server",
      "args": ["--config", "${env:JIRA_CONFIG}"]
    }
  }
}
```

When a teammate runs `team pull`, their local Agent's MCP config is automatically updated. Credentials are **never** committed — only `${env:VAR_NAME}` references. The local machine is expected to have those env vars set.

This solves one of MCP's biggest adoption problems: every developer has to manually edit their Agent's MCP config. With TeamAI, it's `team pull` and done.

### 6.3 Combining Hooks and MCP

A common pattern:

```toml
[hooks.pre-pull]
  script = ".teamai/hooks/verify-mcp.sh"
# Verifies all MCP servers referenced in mcp.json are reachable before pulling
```

This makes the whole system robust — you cannot accidentally pull a config that breaks your local setup.

## 7. Integration with Claude Code

TeamAI is tightly integrated with Claude Code, and the integration is illustrative of how TeamAI approaches Agents in general.

### 7.1 What Gets Synced

For Claude Code specifically, `team pull` writes:

```
~/.claude/
├── skills/                       ← Synced from .teamai/skills/
│   ├── code-review/
│   │   └── SKILL.md
│   └── refactor-go/
│       └── SKILL.md
├── CLAUDE.md                     ← Generated from .teamai/rules/*.md
└── mcp.json                      ← Synced from .teamai/mcp.json
```

The CLAUDE.md is **regenerated**, not appended. If you have personal rules, keep them in a separate file (e.g., `~/.claude/CLAUDE.local.md`) and reference it from CLAUDE.md via `@` imports.

### 7.2 Recall Integration

TeamAI ships an optional Claude Code skill called `teamai-recall`:

```markdown
# .teamai/skills/teamai-recall/SKILL.md
---
name: teamai-recall
description: Search the team's collective knowledge before answering.
---
When the user asks a question that might be answered by team knowledge,
run `team recall "<query>"` first. Cite the matching files in your answer.
```

When this skill is installed, Claude Code will automatically search the team's knowledge for relevant context before answering — turning the team's collective wisdom into a first-class input to every conversation.

### 7.3 Bidirectional Sync

The latest version of TeamAI supports **bidirectional** sync for personal notes:

```bash
# Save Claude Code's session summary as a knowledge file
team save --from-session=latest --tags=incident,2026-q3
# Creates .teamai/knowledge/incident-2026-q3-...md

# Then push it to the team
team push -m "incident(2026-q3): add postmortem notes"
```

This closes the loop: an engineer's session output becomes reviewable team knowledge with two commands.

## 8. Design Philosophy Summary: Strengths and Weaknesses

### 8.1 Strengths

| Dimension | Why It's Strong |
|-----------|-----------------|
| **Simplicity** | A single binary, a Git repo, and a TOML file. Onboarding is trivial. |
| **Auditability** | Every change to team knowledge is a Git commit. PR review, blame, log — all standard Git. |
| **Portability** | No vendor lock-in. Switch Git hosts without changing TeamAI. |
| **Agent-agnostic** | One TeamAI repo can serve Claude Code, Codex, CodeBuddy, Cursor simultaneously. |
| **Zero-trust sharing** | Credentials never leave the local machine; only env-var references are committed. |
| **Composability** | Subscriptions let you mix your team's content with upstream content. |
| **Operational maturity** | Hooks + `doctor` + validation = production-grade safety rails. |

### 8.2 Weaknesses and Trade-offs

| Dimension | The Cost |
|-----------|----------|
| **Git is not a database** | No partial updates, no atomic multi-file transactions, no schema constraints beyond JSON Schema validation. |
| **No semantic search by default** | BM25 + graph is good for code-adjacent content, weak for fuzzy-concept recall. |
| **Merge conflicts** | Like any shared editing system, concurrent edits to the same file conflict. Resolution is Git's, not TeamAI's. |
| **No built-in access control** | Authorization is whatever your Git remote provides (branch protection, CODEOWNERS, etc.). |
| **Cold-start cost** | A new team member needs to `team pull` and let the index build; first `team recall` may take a few seconds. |
| **No telemetry / analytics** | You can't see "which skill is most used" without the dashboard's local-only stats. |

### 8.3 When TeamAI Is the Right Tool

TeamAI is the right choice when:

- Your team has 3+ engineers using Agents
- You have a Git workflow you already trust
- You want to share prompts, rules, and skills without a SaaS subscription
- You use multiple Agent tools and want a single source of truth

It is the wrong choice when:

- You are a solo developer (just commit to your dotfiles)
- You need semantic / embedding-based recall across millions of documents
- Your team does not use Git (rare in 2026, but possible)

## 9. Quick Start Tutorial

### 9.1 Install

```bash
# macOS / Linux
curl -fsSL https://teamai.tencent.com/install.sh | bash

# Or via Homebrew
brew install teamai

# Or via Go
go install github.com/tencent/teamai-cli/cmd/team@latest

# Verify
team version
# teamai-cli v0.18.2 (built 2026-08-12)
```

### 9.2 Initialize Your Team Repo

```bash
mkdir ai-team-knowledge && cd ai-team-knowledge
team init

# Prompts:
#   Team name: acme-platform
#   Default Agent: claude-code
#   Git remote: git@github.com:acme/ai-team-knowledge.git  (you can edit later)

# Creates:
#   .teamai/
#   ├── team.toml
#   ├── skills/.gitkeep
#   ├── rules/.gitkeep
#   ├── knowledge/.gitkeep
#   └── hooks/.gitkeep
```

### 9.3 Create a Remote and Push

```bash
# Create the remote repo (one-time, on your Git host)
gh repo create acme/ai-team-knowledge --private

# Set the remote in team.toml
team config set remote.url git@github.com:acme/ai-team-knowledge.git

# Push
team push
```

### 9.4 Add Your First Skill

```bash
team new skill code-review
# Creates .teamai/skills/code-review/SKILL.md with a starter template

# Edit it
$EDITOR .teamai/skills/code-review/SKILL.md
```

Starter `SKILL.md`:

```markdown
---
name: code-review
description: Code review checklist for our Go services.
when_to_use: When reviewing a pull request that touches Go service code.
---
# Code Review Checklist

## Always check
- [ ] Error wrapping uses `%w`, not `%v`
- [ ] Context is the first parameter of any blocking function
- [ ] Public functions have a doc comment starting with the function name

## Service-specific
- [ ] New external dependencies are added to `deps/` not inline
- [ ] Migrations are reversible
```

Commit and push:

```bash
team push -m "feat(skills): add code-review skill"
```

### 9.5 Onboard a Teammate

The new teammate runs:

```bash
brew install teamai
git clone git@github.com:acme/ai-team-knowledge.git ~/ai-team-knowledge
cd ~/ai-team-knowledge
team pull    # syncs skills, rules, MCP into their local Agents

team recall "code review checklist"
# Returns the skill they just pulled
```

That is the entire onboarding loop. Three commands.

### 9.6 Subscribe to an External Skill Pack

```toml
# Edit team.toml
[subscriptions]
  [subscriptions."github.com/anthropics/skills"]
    ref = "v2026.08.1"
    include = ["pdf", "docx"]
```

```bash
team pull
team recall "extract tables from PDF"
# Now finds the Anthropic skill too
```

## 10. Tech Stack and Engineering Practices

### 10.1 Languages and Dependencies

| Component | Language | Why |
|-----------|----------|-----|
| CLI core | Go 1.22+ | Single static binary, fast startup, great Git bindings via `go-git` |
| Indexer | Go | Shares the BM25 implementation with the CLI |
| Dashboard | TypeScript + React | Familiar stack for web contributors |
| TUI | Go + Bubble Tea + Lipgloss | Native feel, no Electron dependency |
| Schemas | JSON Schema | Standard, portable, well-tooled |

The Go choice is deliberate: `go-git` lets TeamAI work without depending on the system `git` binary, which matters for cross-platform packaging and CI.

### 10.2 Engineering Practices

The repository demonstrates several strong practices:

- **JSON Schema validation**: every manifest, every skill, every rule is validated against a schema in CI
- **Golden-file tests**: command outputs are compared against checked-in fixtures
- **Cross-platform CI**: Linux, macOS, Windows on every PR
- **Reproducible builds**: Go's build flags ensure bit-identical binaries
- **Conventional commits**: every `team push` suggests a Conventional Commits message
- **Automated changelog**: derived from Conventional Commits via `git-cliff`
- **Security scanning**: `gosec`, `govulncheck`, and the secret-scanning hook run on every PR

### 10.3 Performance Characteristics

| Operation | Typical Latency | Notes |
|-----------|----------------|-------|
| `team init` | < 1 s | Writes files, no network |
| `team push` | 0.5–3 s | Dominated by Git push |
| `team pull` (small repo) | 1–4 s | Includes index rebuild |
| `team pull` (1000 files) | 5–15 s | Index rebuild is the bottleneck |
| `team recall` (BM25) | < 100 ms | In-memory index |
| `team recall` (BM25 + graph) | 100–300 ms | With graph expansion |
| `team recall` (embedding) | 300–800 ms | Network round-trip to embedding API |
| `team dashboard` startup | < 2 s | Local web server only |

### 10.4 Observability

TeamAI is intentionally low-observability (privacy-first), but does expose:

- `--verbose` / `-v` for debug logging
- `--log-file` for capturing detailed logs
- `--json-output` for machine-parseable command output
- Structured logs (zap-style) when `--verbose` is set

Telemetry is **opt-in only**, never on by default, and can be disabled with a single env var.

## 11. Conclusion

Tencent's **teamai-cli** is a thoughtful, conservative, and surprisingly deep piece of engineering. In a 2026 landscape obsessed with SaaS, hosted vector databases, and proprietary Agent platforms, TeamAI bets on the durability of Git itself.

### What It Gets Right

1. **The right primitive**: Git is the universal team-content substrate. By aligning with it, TeamAI gains review, branching, audit, and backup for free.
2. **The right scope**: TeamAI is a meta-layer above Agents, not a replacement for them. It augments Claude Code, Codex, and CodeBuddy rather than competing with them.
3. **The right defaults**: Zero infrastructure, zero telemetry, zero lock-in. Every choice a team makes about hosting, access, and visibility is theirs.
4. **The right extensibility points**: Hooks, MCP integration, subscriptions, and roles give teams the levers they need without forcing them into a specific workflow.

### What to Watch

- **Semantic search adoption**: as embedding APIs get cheaper, will teams migrate from BM25 to semantic? TeamAI's adapter for embedding backends suggests the team is ready for this.
- **Cross-org federation**: the subscription model hints at a future where multiple teams' TeamAI repos form a graph of trust — closer to how `apt` or `npm` ecosystems evolved.
- **Agent proliferation**: as more Agents adopt the `~/.agent/skills/` convention, TeamAI's adapter library will grow. Each new adapter is low-cost, but the cumulative matrix becomes interesting.

### Final Verdict

For teams of 3+ engineers using AI Agents in 2026, **TeamAI is the lowest-friction, highest-leverage tool you can adopt**. It will not replace your Git workflow — it will become the most-used command in it.

```bash
brew install teamai
team init
team push
```

Three commands, one afternoon, and your team's collective Agent knowledge is finally shareable, reviewable, and durable.

---

**References**

- Repository: `github.com/tencent/teamai-cli`
- License: Apache-2.0
- Documentation: `teamai.tencent.com/docs`
- Related projects: `anthropics/skills` (compatible subscription source), `modelcontextprotocol/specification` (MCP spec)