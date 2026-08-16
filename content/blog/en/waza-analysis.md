---
title: "Waza: Microsoft's Open-Source AI Agent Skills Evaluation Framework — From Beginner to Master"
date: "2026-08-16"
description: "Deep dive into Microsoft Waza — a Go-based CLI tool for evaluating AI agent skills, featuring multi-model comparison, adversarial testing, and MCP mock servers"
tags:
  - Waza
  - AI Agent
  - Skills Evaluation
  - Microsoft
  - Go
  - CLI Tool
  - Benchmarking
  - Open Source
categories:
  - AI Agent
  - Evaluation Framework
  - Microsoft Open Source
  - Go Tools
  - Skills Assessment
---

# Waza: Microsoft's Open-Source AI Agent Skills Evaluation Framework — From Beginner to Master

## Project Background and Core Problems

### The AI Agent Skills Evaluation Dilemma

In the AI Agent development process, how to **systematically evaluate and verify the quality of Agent skills** has been a core challenge for developers:

| Pain Point | Traditional Method Issues | Waza's Solution |
|------------|--------------------------|-----------------|
| **Lack of Standardization** | Teams build custom evaluation systems, hard to reuse | Unified Eval Spec specification |
| **Non-reproducible Results** | Randomness causes result fluctuations | Snapshot & Replay mechanism |
| **Difficult Multi-model Comparison** | Manual comparison, inefficient | Built-in compare command |
| **Lack of Adversarial Testing** | Hard to discover security issues | Built-in adversarial fault injection |
| **Complex CI/CD Integration** | No standardized interfaces | Standardized Exit Codes and Reporters |

### Birth of Waza

Waza is a **Go-based CLI tool launched by Microsoft** specifically for evaluating AI Agent skill quality. Its core philosophy is:

> **"Provide a standardized, reproducible, quantifiable evaluation framework for AI Agent skills."**

```
┌─────────────────────────────────────────────────────────────────┐
│                      Waza Core Metrics                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ⭐ GitHub Stars:     1,200+                                    │
│  🍴 Forks:            75+                                        │
│  📊 Commits:          850+                                       │
│  🏢 Developer:        Microsoft                                  │
│  📦 Language:         Go                                         │
│  📜 License:          MIT                                        │
│  🛠️ Grader Types:     9 built-in graders                         │
│  🔌 MCP Support:      Built-in mock servers                      │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Project Overview

### What is Waza?

Waza is a **command-line tool for evaluating AI Agent skills**, helping developers:

- **Scaffold evaluation suites**: Auto-generate evaluation tasks from SKILL.md
- **Run benchmarks**: Run and compare results across different models
- **Quality scoring**: Multi-dimensional evaluation using LLM-as-Judge
- **Adversarial testing**: Inject faults to discover potential security issues
- **Token management**: Analyze and optimize skill document size

### Key Features at a Glance

| Feature | Description |
|---------|-------------|
| 🎯 **Skill Lifecycle Management** | Complete flow: init, create, run, check |
| 📊 **Multi-model Comparison** | Run benchmarks across different models and compare |
| 🏅 **LLM-as-Judge** | Built-in scorers: groundedness, helpfulness, etc. |
| 🔢 **Token Management** | Count, compare, analyze, and suggest optimizations |
| 🛡️ **Adversarial Testing** | Offline fault injection: prompt injection, scope-bypass |
| 📸 **Snapshot & Replay** | Capture runs for reproducible replays |
| 🔌 **MCP Mock Servers** | Network-free isolated testing |
| ☁️ **Cloud Storage Integration** | Auto-upload results to Azure Blob Storage |
| 📈 **Visualization Dashboard** | View results via HTTP or JSON-RPC |

---

## Deep Dive: Architecture Design

### Overall Architecture

Waza employs a modular architecture design:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                            Waza Architecture                             │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│   ┌─────────────────────────────────────────────────────────────────┐   │
│   │                         CLI Entry (cmd/waza)                     │   │
│   │                    init | run | check | compare | serve         │   │
│   └─────────────────────────────────────────────────────────────────┘   │
│                                    │                                     │
│   ┌─────────────────────────────────────────────────────────────────┐   │
│   │                       Core Modules (internal/)                   │   │
│   │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐        │   │
│   │  │ graders  │  │  models  │  │orchestra │  │  metrics │        │   │
│   │  └──────────┘  └──────────┘  └──────────┘  └──────────┘        │   │
│   │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐        │   │
│   │  │ execution│  │ reporting│  │transcript│  │  config  │        │   │
│   │  └──────────┘  └──────────┘  └──────────┘  └──────────┘        │   │
│   └─────────────────────────────────────────────────────────────────┘   │
│                                    │                                     │
│   ┌─────────────────────────────────────────────────────────────────┐   │
│   │                        Executor Backends                         │   │
│   │              mock (CI-friendly)  │  copilot-sdk (default)         │   │
│   └─────────────────────────────────────────────────────────────────┘   │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### Project Structure

```
waza/
├── cmd/waza/               # CLI entry point
│   └── tokens/             # Token counting subcommand
├── internal/
│   ├── config/             # Configuration with functional options
│   ├── execution/          # AgentEngine interface (mock, copilot)
│   ├── graders/            # Validator registry and built-in graders
│   ├── metrics/            # Scoring metrics
│   ├── models/             # Data structures (EvalSpec, TestCase, etc.)
│   ├── orchestration/      # EvalRunner for coordinating execution
│   ├── reporting/          # Result formatting and output
│   ├── transcript/         # Per-task transcript capture
│   └── wizard/             # Interactive init wizard
├── examples/               # Example eval suites
├── skills/                 # Example skills
└── registry.json           # Shared graders registry
```

### Eval Spec Format (Schema 1.2)

Waza uses a standardized YAML configuration format for evaluations:

```yaml
name: my-skill-eval
skill: my-skill
schemaVersion: "1.2"
version: "1.0.0"

config:
  trials: 3                    # Number of trials per task
  max_attempts: 2              # Max attempts per task
  timeout: 300                 # Timeout in seconds
  parallel: 4                  # Parallel tasks
  executor: mock               # Executor: mock / copilot-sdk
  model: gpt-4                 # Model selection

inputs:
  language: "en"               # Custom variables

hooks:
  before:
    - run: "echo 'Starting evaluation'"
  after:
    - run: "echo 'Evaluation complete'"

mcp_mocks:                     # MCP mock servers
  - name: filesystem
    command: ["npx", "mcp-server-fs", "/tmp/test"]

adversarial:                   # Adversarial testing
  - pack: prompt-injection
  - pack: scope-bypass

graders:
  - type: text                 # Text matching evaluation
    config:
      contains: "success"

tasks:
  - task: hello-world
    assert:
      - grading: text
        config:
          contains: "Hello"
```

---

## Design Philosophy

### Core Principles

Waza's design philosophy centers on several core principles:

#### 1. Schema-driven

> **"Version management is explicit; readers are lenient on same major version, strict on different major version."**

Waza uses `schemaVersion` field for explicit versioning and provides `waza migrate` for automatic migration.

#### 2. Snapshot-based Determinism

Each evaluation run captures a complete context snapshot, ensuring reproducible results:

```
┌─────────────────────────────────────────────────────────────┐
│                    Snapshot & Replay Mechanism                │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│   waza run → Capture Snapshot → Save as JSON                 │
│                    ↓                                         │
│   waza replay snapshot.json → Precisely reproduce results    │
│                                                              │
│   Contains:                                                  │
│   • Complete environment state                               │
│   • Agent response history                                   │
│   • Tool call records                                        │
│   • Evaluation results                                       │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

#### 3. CI-First Design

Waza was designed with CI/CD integration from the start:

| CI Feature | Implementation |
|------------|----------------|
| **Exit Codes** | 0=Success, 1=Test failure, 2=Config error |
| **Reporters** | JSON, JUnit XML format support |
| **Threshold Checks** | `waza tokens compare` for CI gating |
| **Automated Workflows** | `waza-eval.yml` reusable template |

#### 4. Separation of Execution and Grading

Waza allows running evaluations first and grading later:

```bash
# Step 1: Run evaluation (skip grading)
waza run eval.yaml --skip-graders --output results.json

# Step 2: Grade later
waza grade results.json
```

#### 5. Merge-safe

> **"--apply operations never overwrite existing files without --force."**

---

## Quick Start Tutorial

### Installing Waza

#### Method 1: Binary Install (Recommended)

```bash
# Linux/macOS
curl -fsSL https://raw.githubusercontent.com/microsoft/waza/main/install.sh | bash

# Windows (PowerShell)
irm https://raw.githubusercontent.com/microsoft/waza/main/install.ps1 | iex
```

#### Method 2: From Source

```bash
# Prerequisites: Go 1.26+ and Git LFS
git clone https://github.com/microsoft/waza.git
cd waza
git lfs install && git lfs pull
go build -o waza ./cmd/waza

# Add to PATH
export PATH=$PATH:$(pwd)
```

#### Method 3: Azure Developer CLI Extension

```bash
azd ext source add -n waza -t url -l https://raw.githubusercontent.com/microsoft/waza/main/registry.json
azd ext install microsoft.azd.waza
```

### Quick Start Flow

```bash
# 1. Initialize project
waza init my-agent-project && cd my-agent-project

# 2. Create new skill
waza new skill my-skill

# 3. Define skill (edit skills/my-skill/SKILL.md)
# 4. Write evaluation tasks (edit evals/my-skill/tasks/*.yaml)
# 5. Run evaluation
waza run my-skill

# 6. Check skill readiness
waza check my-skill

# 7. View quality scores
waza quality my-skill
```

---

## Hands-On Tutorial: Building a Skills Evaluation Suite

### Step 1: Initialize Project

```bash
waza init waza-demo && cd waza-demo
```

Creates the standard directory structure:

```
waza-demo/
├── skills/                  # Skills directory
│   └── .gitkeep
├── evals/                   # Evaluations directory
│   └── .gitkeep
└── .waza.yaml              # Project configuration
```

### Step 2: Create Skill

```bash
waza new skill calculator
```

Generates:

```
skills/calculator/
├── SKILL.md                 # Skill definition
└── prompts/
    └── default.md

evals/calculator/
├── eval.yaml                # Evaluation config
└── tasks/
    └── tasks.csv            # Task list
```

### Step 3: Write SKILL.md

```markdown
---
name: calculator
description: A calculator skill that performs basic arithmetic operations
triggers:
  - "calculate {{expression}}"
  - "what is {{a}} plus {{b}}"
  - "compute {{expression}}"
version: 1.0.0
---

# Calculator Skill

This skill provides basic arithmetic calculation capabilities.

## Supported Operations

- Addition: `a + b`
- Subtraction: `a - b`
- Multiplication: `a * b`
- Division: `a / b`
```

### Step 4: Write Evaluation Tasks

```yaml
# evals/calculator/tasks/basic-operations.yaml
- task: addition_test
  description: Test basic addition
  prompt: "Calculate 15 + 27"
  assert:
    - grading: text
      config:
        contains: "42"
```

### Step 5: Configure Evaluation

```yaml
# evals/calculator/eval.yaml
name: calculator-eval
skill: calculator
schemaVersion: "1.2"
version: "1.0.0"

config:
  trials: 3
  max_attempts: 2
  timeout: 60
  executor: mock
  model: gpt-4

tasks:
  - task: basic-operations
```

### Step 6: Run Evaluation

```bash
# Run evaluation
waza run calculator

# Output
# ========================================
# Waza Eval Results
# ========================================
# Skill: calculator
# Total: 3 tests, 3 passed, 0 failed
# Success Rate: 100%
# ========================================
```

### Step 7: Check Skill Readiness

```bash
waza check calculator
```

---

## Advanced Features

### 1. LLM-as-Judge Scoring

```yaml
graders:
  - type: prompt
    model: gpt-4
    dimensions:
      - groundedness
      - helpfulness
      - instruction_following
      - refusal_correctness
      - tool_use_appropriateness
```

### 2. MCP Mock Servers

```yaml
mcp_mocks:
  - name: filesystem
    command: ["npx", "mcp-server-fs", "/tmp/test"]
    matches:
      - method: "filesystem/readFile"
        response:
          content: "mock file content"
```

### 3. Adversarial Testing

```yaml
adversarial:
  - pack: prompt-injection
  - pack: scope-bypass
```

```bash
waza adversarial --pack prompt-injection
```

### 4. Multi-model Comparison

```bash
waza run eval.yaml --model gpt-4 --output gpt4-results.json
waza run eval.yaml --model claude-3 --output claude-results.json
waza compare gpt4-results.json claude-results.json
```

### 5. Token Management

```bash
waza tokens count skills/my-skill/SKILL.md
waza tokens compare main...feature-branch --threshold 1000
waza tokens profile skills/my-skill/SKILL.md
waza tokens suggest skills/my-skill/SKILL.md
```

### 6. Visualization Dashboard

```bash
waza serve
# Visit http://localhost:8080
```

---

## CI/CD Integration

### GitHub Actions Workflow

```yaml
# .github/workflows/waza-eval.yml
name: Waza Evaluation

on:
  pull_request:
    branches: [main]

jobs:
  evaluate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Install Waza
        run: |
          curl -fsSL https://raw.githubusercontent.com/microsoft/waza/main/install.sh | bash

      - name: Run Evaluation
        run: waza run evals/my-skill/eval.yaml --output results.json --executor mock

      - name: Upload Results
        uses: actions/upload-artifact@v4
        with:
          name: waza-results
          path: results.json
```

---

## Grader Types

| Type | Purpose | Config Example |
|------|---------|----------------|
| **code** | Python/JS assertions | `assert: "result == 42"` |
| **text** | Text matching | `contains: "success"` |
| **file** | File verification | `path: "/tmp/out.txt"` |
| **diff** | Workspace comparison | `snapshot_path: "./snapshots/"` |
| **behavior** | Behavior constraints | `max_tokens: 1000` |
| **action_sequence** | Tool call sequence | `expected: ["read", "write"]` |
| **skill_invocation** | Skill orchestration | `skill: "sub-skill"` |
| **prompt** | LLM-as-Judge | `dimensions: ["groundedness"]` |
| **trigger_tests** | Trigger accuracy | `threshold: 0.8` |

---

## Summary and Conclusions

### Core Insights

#### 1. Standardization of AI Agent Evaluation

Waza's most important contribution is **establishing a standardized framework for AI Agent skills evaluation**:

> **"Evaluating AI agents shouldn't depend on ad-hoc, one-time tests. Like code testing, it should have standardized specifications, reproducible results, and automated processes."**

#### 2. Importance of Reproducibility

In AI Agent evaluation, **reproducibility is a core challenge**. Waza addresses this through:

- Snapshot & Replay captures complete context
- Multiple trials reduce randomness impact
- Mock executors eliminate network dependency

#### 3. CI-First is Not Just a Gimmick

Waza's CI-First design means:

| Practice | Value |
|----------|-------|
| Exit Codes | Build systems can directly judge success/failure |
| Standard Reporters | Seamless integration with existing CI tools |
| Threshold Checks | Automatic gating, preventing quality degradation |
| Automated Workflows | Reduce manual intervention, lower error rate |

#### 4. Separation of Execution and Grading

Benefits of this design:

- **Flexibility**: Run first, grade later, or skip grading
- **Efficiency**: Same evaluation results can be graded with different graders
- **Debugging**: Can separately analyze execution or grading issues

### Use Cases

✅ **Highly Recommended for Waza**:

- AI Agent development teams needing systematic evaluation
- Scenarios requiring multi-model comparison
- Adversarial testing needs (security-sensitive applications)
- Teams needing CI/CD automation
- Enterprises needing standardized skills evaluation

---

## Resource Links

### Official Resources

| Resource | Link |
|----------|------|
| 🌐 Official Website | https://microsoft.github.io/waza/ |
| 💻 GitHub Repository | https://github.com/microsoft/waza |
| 📚 Documentation | https://microsoft.github.io/waza/docs/ |

### Installation

| Platform | Command |
|----------|---------|
| Linux/macOS | `curl -fsSL https://raw.githubusercontent.com/microsoft/waza/main/install.sh \| bash` |
| Windows | `irm https://raw.githubusercontent.com/microsoft/waza/main/install.ps1 \| iex` |
| Source Build | Go 1.26+ + `git lfs install && go build` |
| Azure Developer CLI | `azd ext install microsoft.azd.waza` |

---

## Conclusion

Waza represents **an important milestone in the AI Agent skills evaluation field**—it transforms what were scattered, non-standard evaluation practices into a complete, standardized, automated workflow.

Its design philosophy reminds us: **AI Agent quality assurance needs to be built on standardization, quantification, and reproducibility, just like traditional software engineering**.

> **"Don't trust your AI agent without proper evaluation. Use Waza."**

---

*This article is based on the Microsoft Waza open-source project (MIT License).*

**Sources:**
- [GitHub - microsoft/waza](https://github.com/microsoft/waza)
- [Waza Documentation](https://microsoft.github.io/waza/)
