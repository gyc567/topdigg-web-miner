---
title: "OpenClaude: The Open-Source Cross-Model Coding-Agent CLI - Full Analysis"
date: "2026-09-01"
description: "Deep dive into Gitlawb/openclaude: an open-source coding-agent CLI supporting 20+ model providers including Claude, GPT, Gemini, DeepSeek, and local Ollama"
tags: ["OpenClaude", "AI Agent", "Coding Agent", "CLI", "Ollama", "Claude"]
categories: ["AI", "Developer Tools", "Open Source"]
---

# OpenClaude: The Open-Source Cross-Model Coding-Agent CLI - Full Analysis

## Introduction

While Claude Code has become the go-to tool for many developers, an open-source project is quietly changing the game: **OpenClaude** (Gitlawb/openclaude).

It's an open-source coding-agent CLI with one core philosophy: **runs anywhere, uses anything**. Not locked to any model provider—one CLI connects to both cloud APIs and local models, supporting 20+ backends including OpenAI-compatible interfaces, Gemini, GitHub Models, Codex, Ollama, and more, while maintaining a terminal-first workflow.

---

## 1. Project Overview

### 1.1 What is OpenClaude

OpenClaude is an open-source coding-agent command-line tool developed and maintained by the GitLawb team. Its core positioning:

> **One CLI across cloud APIs and local model backends — no per-provider tooling.**

Key features:
- One CLI for all supported models (20+ Providers)
- Guided provider setup + saved profiles
- Complete coding-agent workflow: Bash, file tools, grep, glob, agents, tasks, MCP, slash commands
- Bundled VS Code extension
- Pixel-art companion system (Buddy) with signature moves

### 1.2 Core Data

| Metric | Data |
|--------|------|
| GitHub | Gitlawb/openclaude |
| npm Weekly Downloads | Actively growing |
| Supported Providers | 20+ |
| Core Dependency | Node.js >=22.0.0 |
| Build Tool | Bun (source builds only) |
| License | MIT |

### 1.3 Supported Model Providers

| Category | Providers |
|----------|-----------|
| OpenAI Compatible | OpenAI, OpenRouter, DeepSeek, Groq, Mistral, LM Studio |
| Dedicated APIs | Gemini, GitHub Models, Codex OAuth, Codex |
| Local Inference | Ollama, Atomic Chat, LM Studio |
| Aggregation Gateways | AI/ML API, Concentrate, LLMTR, ApiSmart, Fireworks AI |
| China-Specific | Z.AI GLM Coding Plan, Xiaomi MiMo, LongCat (Meituan), NEAR AI |
| Cloud Providers | AWS Bedrock, Vertex AI, Cloudflare Workers AI, Microsoft Foundry |
| Others | Hicap, ClinePass, OpenCode Zen/Go, Gitlawb Opengateway |

---

## 2. Core Technical Architecture

### 2.1 Design Philosophy: Provider Abstraction Layer

OpenClaude's core architecture is a **Provider Abstraction Layer**:

```
┌─────────────────────────────────────────────┐
│              OpenClaude CLI                  │
│                                             │
│  ┌─────────┐ ┌─────────┐ ┌─────────────┐  │
│  │ Slash   │ │ Agent   │ │ Tool System │  │
│  │Commands │ │ System  │ │ (Bash/File) │  │
│  └────┬────┘ └────┬────┘ └──────┬──────┘  │
│       └────────────┴────────────┘          │
│                    │                        │
│         ┌─────────▼─────────┐               │
│         │  Provider Layer   │               │
│         └─────────┬─────────┘               │
│    ┌──────────────┼──────────────┐          │
│    ▼              ▼              ▼          │
│ OpenAI        Anthropic      Ollama         │
│ Compatible    Native         Local          │
└─────────────────────────────────────────────┘
```

**Key Design Principles:**

1. **Provider Pluggable**: Any service with OpenAI-compatible API or Anthropic native API integrates seamlessly
2. **Environment Variables First**: All configuration via env vars, no code changes
3. **Profile Persistence**: `/provider` command saves profiles to `~/.openclaude-profile.json`, persistent across sessions

### 2.2 Repo Map: Codebase Intelligence

OpenClaude introduces a unique feature—**Repo Map**—giving the AI model structural awareness of your codebase at session start.

**How It Works (5 Steps):**

1. **File Enumeration**: Lists tracked + untracked, unignored files via `git ls-files`
2. **Symbol Extraction**: Parses source files with tree-sitter, extracting function/class/type/interface definitions
3. **Reference Graph**: Builds directed graph weighted by reference count × IDF
4. **PageRank**: Ranks files by structural importance
5. **Rendering**: Top-down walk of ranked files, outputting paths and signatures until token budget exhausted

**Enabling:**

```bash
# Env var (auto-injected at session start, 1024 tokens)
REPO_MAP=1 openclaude

# Slash command (2048 tokens default)
/repomap
/repomap --tokens 4096
/repomap --focus src/tools/
```

### 2.3 Agent Routing & Step Limits

OpenClaude supports **routing agents by type to different models**, useful for cost optimization.

**Config in `~/.openclaude/settings.json`:**

```json
{
  "agentModels": {
    "deepseek-v4-flash": {
      "base_url": "https://api.deepseek.com/v1",
      "api_key": "sk-your-key"
    }
  },
  "agentRouting": {
    "Explore": "deepseek-v4-flash",
    "Plan": "gpt-4o",
    "default": "gpt-4o"
  }
}
```

**Step Limits (maxSteps):**

```markdown
---
name: bounded-researcher
maxSteps: 8
---

You are a focused research agent.
```

### 2.4 Buddy Pixel Companion System

The most fun design—**a truecolor pixel-art companion** beside your prompt, firing signature moves on every Enter.

```
/buddy                  hatch or pet
/buddy set robinhood    green archer - arrow shot on Enter
/buddy set kaio         gold-haired warrior - energy wave
/buddy set ember        dragon fire with heat gradient
```

---

## 3. Quick Start Tutorial

### 3.1 Installation

```bash
# npm (recommended)
npm install -g @gitlawb/openclaude@latest

# Arch Linux
paru -S openclaude

# From source
git clone https://github.com/Gitlawb/openclaude.git
cd openclaude
bun install && bun run build && npm link
```

### 3.2 Quick Start with OpenAI

```bash
export CLAUDE_CODE_USE_OPENAI=1
export OPENAI_API_KEY=sk-your-key-here
export OPENAI_MODEL=gpt-4o
openclaude
```

### 3.3 Quick Start with Local Ollama

```bash
ollama pull qwen2.5-coder:7b

export CLAUDE_CODE_USE_OPENAI=1
export OPENAI_BASE_URL=http://localhost:11434/v1
export OPENAI_MODEL=qwen2.5-coder:7b
openclaude
```

### 3.4 Session Management

```bash
openclaude --resume <session-id>
openclaude --continue
openclaude --bg "fix failing tests"
openclaude ps && openclaude logs auth-refactor
```

---

## 4. Design Philosophy Summary

### 4.1 Provider Agnosticism
Not locked to any model vendor. 20+ providers through OpenAI-compatible + Anthropic-native dual abstraction.

### 4.2 Terminal-First
All features delivered via CLI. Developers are already in the terminal—the tool should come to them.

### 4.3 Progressive Complexity
Start with zero config. One `openclaude` command works. Add complexity progressively via `/provider`, `settings.json`, MCP.

### 4.4 Local-First, But Not Local-Only
Ollama/Atomic Chat/LM Studio for zero-cost, offline, private coding. Cloud APIs for when local compute isn't enough.

### 4.5 Buddy is Function, Not Gimmick
Visual progress feedback + emotional connection to long-term tools. Respects `prefersReducedMotion`.

---

## 5. Feature Matrix

| Feature | Description |
|---------|-------------|
| Multi-Provider | 20+ cloud and local model backends |
| Provider Profiles | Guided setup + persistent config |
| Coding Workflow | Bash, file tools, grep, glob, agents, tasks, MCP |
| Streaming | Real-time token output and tool progress |
| Tool Calling | Multi-step tool loops |
| Images | URL and base64 for vision-capable providers |
| Repo Map | PageRank-driven codebase structure |
| Agent Routing | Route agents by type to different models |
| Step Limits | Cap sub-agent tool calls |
| Background Tasks | Child process background runs, no daemon |
| Buddy System | Pixel-art companion with signature moves |
| VS Code Extension | Launch integration and theme support |
| gRPC Server | Headless integration mode |

---

## 6. Conclusion

OpenClaude represents a different philosophy: not building a better Claude Code, but an **agent CLI that doesn't discriminate against any model**.

Its core value proposition: **Freedom**. No provider lock-in, no ecosystem binding, no need to maintain separate toolchains for each model.

Whether you're a cost-conscious individual developer or an enterprise team needing multi-model combinations, OpenClaude is worth trying.

**Resources:**
- GitHub: https://github.com/Gitlawb/openclaude
- npm: https://www.npmjs.com/package/@gitlawb/openclaude
- Discord: https://discord.gg/k68zFR6AcB
