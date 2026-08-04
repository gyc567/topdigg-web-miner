---
title: 'sentrux Deep Dive: The AI Agent Architecture Sensor — Closing the Feedback Loop for Recursive Self-Improvement of Code Quality'
description: "A complete analysis of sentrux — a real-time architectural sensor that helps AI agents close the feedback loop, enabling recursive self-improvement of code quality. Pure Rust single binary with zero runtime dependencies, supporting 52 languages via tree-sitter plugins. Features live dependency treemap visualization, 5 root cause metrics (modularity/acyclicity/depth/equality/redundancy) unified into a single quality score, MCP server integration (Claude Code/Cursor/Windsurf/OpenCode), TOML-based rules engine, and CI quality gates. From core problem and design philosophy to architecture, full installation tutorial, and feature list."
date: "2026-08-04"
author: "TopDigg Research Team"
tags: ["sentrux", "AI Agent", "Code Quality", "Architecture", "Rust", "Static Analysis", "MCP", "Tree-sitter", "DevTools"]
categories: ["Deep Dive"]
keywords: ["sentrux", "AI agent", "code quality", "architecture sensor", "feedback loop", "static analysis", "Rust", "MCP", "tree-sitter", "dependency analysis", "code visualization", "quality gate"]
---

# sentrux Deep Dive: The AI Agent Architecture Sensor — Closing the Feedback Loop for Recursive Self-Improvement of Code Quality

> Core idea: **AI agents write code faster than ever, but without a sensor, they don't know what needs improving — like a thermostat without a temperature sensor, it can never regulate.** sentrux is a pure-Rust real-time architectural sensor whose core mission is **helping AI agents close the feedback loop** — scanning the actual structure of a codebase (not diffs, not terminal output, but every file, every dependency, every architectural relationship), computing 5 root cause metrics into a unified quality score (0-10000), so AI agents can sense architectural degradation the instant they write code. It integrates with Claude Code, Cursor, Windsurf, OpenCode and all MCP clients via the Model Context Protocol, providing live treemap visualization, a TOML-based rules engine, CI quality gates, and session-level quality tracking. In one sentence: **You don't need a better plan. You need a better sensor.**

---

## 1. Project Overview

### 1.1 What Is It?

**sentrux** is a **real-time architectural sensor** designed for AI-assisted programming. Its core proposition: **build a feedback loop between the AI agent and the codebase** — every time the agent modifies code, sentrux scans the structural change in real time, computes a quality score, and lets the agent know whether this change made the code better or worse.

### 1.2 Key Facts

- Repository: `https://github.com/sentrux/sentrux`
- Website: `https://sentrux.dev`
- Stars: **2,600+**
- Forks: **237**
- License: **MIT**
- Language: **Rust** (pure Rust single binary, zero runtime dependencies)
- Commits: **318**
- Supported languages: **52** (via tree-sitter plugins)
- Platforms: **macOS / Linux / Windows**
- MCP support: Claude Code, Cursor, Windsurf, OpenCode, OpenClaw, all MCP clients

### 1.3 What Problem Does It Solve?

This is the dirty secret of AI-assisted development: **the better the AI generates code, the faster your codebase becomes ungovernable.**

When you used an IDE, you saw the file tree, opened files, built a mental model of the architecture — you were the governor. But AI agents moved us to the terminal. The agent modifies dozens of files per session; you see a stream of `Modified src/foo.rs` but lose spatial awareness: you don't see where that file sits in the dependency graph, that it just created a cycle, that three modules now depend on a file that was supposed to be internal.

Every AI session silently degrades your architecture. The traditional answer — "plan your architecture first, then let AI implement" — reinvents waterfall: producing seas of markdown documents with zero visibility into actual code output. No feedback loop. No way to detect when implementation drifts from spec.

**sentrux's answer: You don't need a better plan. You need a better sensor.**

---

## 2. Core Ideas

### 2.1 The Feedback Loop — A Classical Control Theory Model

sentrux's design is rooted in control theory: every effective system needs a **sensor** (observe reality), a **spec** (define "good"), and an **actuator** (correct drift). Compilers close the loop on syntax, test suites on behavior, linters on style. But architecture — does this change fit the system? — had no sensor. sentrux closes the loop at the architecture level.

### 2.2 Five Root Cause Metrics — One Unified Score

sentrux evaluates codebases across 5 architectural dimensions:

- **Modularity**: Are responsibilities clearly divided between modules?
- **Acyclicity**: Are there cycles in the dependency graph?
- **Depth**: Are call chains too deep?
- **Equality**: Are inter-module dependencies too uniform (lacking hierarchy)?
- **Redundancy**: Are there duplicate code structures?

These 5 metrics converge into a single 0-10000 score — computed in milliseconds, updated in real time.

### 2.3 Session-Level Quality Tracking

sentrux saves a baseline before the AI agent starts coding, compares after the session ends — precisely capturing whether the session improved or degraded code quality. This is **session-level architectural guardrails**.

### 2.4 Plugin-Based Language Support — The Power of tree-sitter

The sentrux binary is a **generic platform** — all language knowledge lives in `plugin.toml` + `tags.scm` query files. Adding a new language requires zero Rust code. 52 languages work out of the box via tree-sitter plugins.

---

## 3. Architecture

### 3.1 Core Components

- **sentrux-core**: Core analysis engine (scanning, scoring, rule checking)
- **sentrux-bin**: CLI and GUI entry point
- **MCP Server**: Provides real-time structural health data to AI agents via Model Context Protocol
- **Rules Engine**: TOML-configured architectural constraint enforcement
- **Plugin System**: tree-sitter language plugin management

### 3.2 Workflow

```
scan → score → agent improves → rescan → better score → repeat
```

1. Agent calls `scan()` to get current quality score and bottleneck metrics
2. Agent calls `session_start()` to save baseline
3. Agent writes code
4. Agent calls `session_end()` to compare baseline — determines if quality improved or degraded
5. If degraded, agent adjusts based on feedback

### 3.3 MCP Toolset

9 MCP tools: `scan` · `health` · `session_start` · `session_end` · `rescan` · `check_rules` · `evolution` · `dsm` · `test_gaps`

---

## 4. Design Philosophy

### 4.1 "Human-in-the-Loop" Is Non-Negotiable

AI agents are powerful but limited — they cannot hold the big picture and small details simultaneously. Humans must be able to see at any moment what the agent is doing to the whole. sentrux makes that possible.

### 4.2 Verification Is More Valuable Than Generation

Generating a correct solution is harder than verifying one (the P vs NP intuition). You don't need to out-code the machine — you need to out-evaluate it. sentrux turns architectural judgment into machine-readable grades and constraints.

### 4.3 Good Systems Make Good Outcomes Inevitable

A well-designed system constrains behavior so the right thing is the easy thing: a quality gate that blocks degradation before it ships, a rules engine encoding your architectural decisions, a visual map making structural rot impossible to ignore.

### 4.4 "Don't Reinvent" — A Pragmatic Stance

sentrux didn't write its own language parsers — it uses tree-sitter. Didn't build its own GUI framework — it uses WGPU. Didn't create its own protocol — it uses MCP. This pragmatism lets sentrux focus on its core value: architectural analysis and feedback loops.

---

## 5. Step-by-Step Tutorial

### 5.1 Installation

**macOS (Homebrew)**
```bash
brew install sentrux/tap/sentrux
```

**Linux**
```bash
curl -fsSL https://raw.githubusercontent.com/sentrux/sentrux/main/install.sh | sh
```

**Windows**
```bash
curl -L -o sentrux.exe https://github.com/sentrux/sentrux/releases/latest/download/sentrux-windows-x86_64.exe
```

**Build from source**
```bash
git clone https://github.com/sentrux/sentrux.git
cd sentrux && cargo build --release
```

### 5.2 Basic Usage

```bash
sentrux                    # Open GUI — live treemap
sentrux /path/to/project   # Scan specific directory
sentrux check .            # Check rules (CI-friendly, exit 0 or 1)
sentrux gate --save .      # Save baseline (before agent session)
sentrux gate .             # Compare baseline (catch degradation)
```

### 5.3 AI Agent Integration (MCP)

**Claude Code**
```
/plugin marketplace add sentrux/sentrux
/plugin install sentrux
```

**Cursor / Windsurf / OpenCode / Any MCP Client**
```json
{
  "mcpServers": {
    "sentrux": {
      "command": "sentrux",
      "args": ["--mcp"]
    }
  }
}
```

### 5.4 Agent Workflow Example

```
Agent: scan("/Users/me/myproject")
  → { quality_signal: 7342, files: 139, bottleneck: "modularity" }

Agent: session_start()
  → { status: "Baseline saved", quality_signal: 7342 }

  ... agent writes 500 lines of code ...

Agent: session_end()
  → { pass: false, signal_before: 7342, signal_after: 6891,
      summary: "Quality degraded during this session" }
```

### 5.5 Rules Engine Configuration

Create `.sentrux/rules.toml` in project root:

```toml
[constraints]
max_cycles = 0
max_coupling = "B"
max_cc = 25
no_god_files = true

[[layers]]
name = "core"
paths = ["src/core/*"]
order = 0

[[layers]]
name = "app"
paths = ["src/app/*"]
order = 2

[[boundaries]]
from = "src/app/*"
to = "src/core/internal/*"
reason = "App must not depend on core internals"
```

```bash
sentrux check .
# ✓ All rules pass — Quality: 7342
```

### 5.6 Language Plugins

```bash
sentrux plugin list              # List installed plugins
sentrux plugin add <name>        # Install from registry
sentrux plugin add-standard      # Install all 52 languages
sentrux plugin init my-lang      # Scaffold new language plugin
```

### 5.7 Linux GPU Troubleshooting

```bash
WGPU_BACKEND=vulkan sentrux    # Force Vulkan
WGPU_BACKEND=gl sentrux        # Force OpenGL
```

---

## 6. Feature List

- **Live architecture visualization**: interactive treemap, files glow on agent modification
- **5 root cause metrics**: modularity, acyclicity, depth, equality, redundancy
- **Unified quality score**: 0-10000 continuous score, millisecond computation
- **MCP server**: 9 tools (scan/health/session_start/session_end/rescan/check_rules/evolution/dsm/test_gaps)
- **Session-level quality tracking**: baseline save + session comparison
- **Rules engine**: TOML config with constraints, layers, boundaries
- **CI quality gate**: `sentrux check .` exit code 0/1
- **52 languages**: Bash, C, C++, C#, Go, Java, JavaScript, Python, Rust, TypeScript, and more
- **Plugin system**: tree-sitter powered, zero Rust code for new languages
- **Cross-platform**: macOS / Linux / Windows
- **Pure Rust**: single binary, zero runtime dependencies
- **GUI**: WGPU rendering, live treemap visualization
- **Claude Code plugin**: one-click install integration

---

## 7. Key Takeaways

1. **The real bottleneck of AI-assisted development isn't code generation — it's architectural governance.** sentrux's README opens by naming the "problem nobody talks about": the better AI writes code, the faster codebases decay. This isn't AI getting dumber — it's you losing architectural awareness. When you were in IDE, you were the gatekeeper; move to terminal, you lose spatial awareness. sentrux restores it with live treemap and quality scoring.

2. **"A better plan" isn't the answer — "a better sensor" is.** Traditional approaches try to constrain AI with more detailed specs — but specs are static, code is dynamic. A spec without a feedback loop is a thermostat without a thermometer. sentrux's core innovation: it doesn't plan before coding — it verifies while coding.

3. **The P vs NP intuition applies in engineering.** Generating a correct architecture is much harder than verifying one. You don't need to out-code AI — you need to out-evaluate it. sentrux turns the fuzzy human capability of "architectural judgment" into machine-readable grades and constraints.

4. **tree-sitter exemplifies "don't reinvent the wheel."** sentrux didn't write parsers for 52 languages — it uses tree-sitter's query language. This lets it focus on core value (architecture analysis and feedback loops) rather than reinventing parsers.

5. **MCP is the "USB port" of the AI toolchain.** sentrux didn't write adapters for each AI tool — it implements the MCP protocol. One integration, all MCP clients work. This is protocol-first design thinking.

6. **"Human-in-the-loop" isn't conservative — it's pragmatic.** One of sentrux's three beliefs: AI is powerful but limited — it can't hold the big picture and details simultaneously. The human role is shifting from "writing code" to "governing code" — sentrux makes that shift possible.

---

## References

- Repository: `https://github.com/sentrux/sentrux`
- Website: `https://sentrux.dev`
- License: MIT
- Claude Code plugin: `/plugin marketplace add sentrux/sentrux`
- MCP Protocol: `https://modelcontextprotocol.io`
- tree-sitter: `https://tree-sitter.github.io/`