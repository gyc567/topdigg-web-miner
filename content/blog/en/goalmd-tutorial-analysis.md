---
title: 'GOAL.md Deep Dive: A Minimal Framework for Autonomous AI Code Improvement — Just Give It a Number'
description: "A complete analysis of GOAL.md — a file format from AutoHarness that lets AI agents autonomously improve code. The core idea is deceptively simple: write a scoring script that outputs a number (Fitness Function), write a GOAL.md file defining goals and an action catalog, then let the agent figure out how to make the score go up. This article covers core concepts (Fitness Function, Action Catalog, Improvement Loop, Operating Modes), design philosophy, complete tutorial, and practical examples — showing how GOAL.md turns AI agents into autonomous code quality engineers."
date: "2026-08-04"
author: "TopDigg Research Team"
tags: ["GOAL.md", "AutoHarness", "AI Agent", "Fitness Function", "Code Quality", "Autonomous Improvement", "Rust", "LLM"]
categories: ["Deep Dive"]
keywords: ["GOAL.md", "AutoHarness", "fitness function", "AI agent", "autonomous improvement", "code quality", "action catalog", "improvement loop", "scoring script"]
---

# GOAL.md Deep Dive: A Minimal Framework for Autonomous AI Code Improvement — Just Give It a Number

> Core idea: **The traditional approach — human analyzes code, lists todos, executes one by one, manually verifies — is slow and unsustainable. GOAL.md's answer: you don't need to tell AI *how* to improve, you just need to tell it *what "better" looks like.** Write a scoring script that outputs a number (Fitness Function), write a GOAL.md file defining goals and an action catalog, then let the agent figure out how to make the score go up. The agent measures the current score, picks the highest-impact action, executes the change, verifies the score improved, records it to a log — forming a self-driven improvement loop. This is the "minimal autonomous improvement framework" from AutoHarness — not about letting AI *write* code, but letting AI *improve* code.

---

## 1. Project Overview

### 1.1 What Is It?

**GOAL.md** is a **file format** from AutoHarness that enables AI agents to autonomously improve projects. It solves one core problem:

> **"I want this project to get better, but I'm not sure how"**

Traditional approach: human analyzes code → lists todos → executes one by one → manually verifies. GOAL.md approach: write a scoring script → write GOAL.md → let the agent figure it out → agent records each change and score delta.

### 1.2 Key Concepts

GOAL.md's core consists of four components:

- **Fitness Function**: A script that outputs a number measuring "how good the project is"
- **Action Catalog**: Lists all possible improvement actions and their expected impact
- **Improvement Loop**: Measure → Select → Execute → Verify → Record → Repeat
- **Operating Mode**: Converge / Continuous / Supervised

### 1.3 What Problem Does It Solve?

AI agents write code fast, but they don't know what "better code" looks like. Without a feedback loop, the agent is like a thermostat without a temperature sensor — it can't tell if its changes made things better or worse. GOAL.md solves this with one simple number: **higher score = better project**. The agent's goal is to make that number go up.

---

## 2. Core Ideas

### 2.1 Fitness Function — Define "Good" With a Single Number

A Fitness Function is a script that outputs a number measuring project quality:

```bash
./scripts/score.sh
# Output: 85 / 100
```

Design principles:

- **Deterministic**: Same input must produce same output
- **Fast**: Ideally completes in under 60 seconds
- **Independent**: No external state dependencies
- **Composable**: Score = sum of component scores

Common components:

- **format**: 20 points — `cargo fmt -- --check`
- **clippy**: 20 points — `cargo clippy` warning count
- **tests**: 25 points — `cargo test` pass
- **docs**: 15 points — file checks
- **maintenance**: 10 points — project maintenance status
- **safety**: 10 points — `unsafe` code checks

### 2.2 Action Catalog — Tell the Agent "What You Can Do"

The action catalog is a table listing all possible improvement actions and their expected impact:

- **Run cargo fmt** — Impact +20, execute `cargo fmt`
- **Fix clippy warnings** — Impact +10, execute `cargo clippy --fix`
- **Add unit tests** — Impact +10, add tests for public functions

The agent picks the "highest impact" action to execute first.

### 2.3 Improvement Loop — Self-Driven Improvement

```
1. Measure current score
2. Select highest-impact action
3. Execute change
4. Verify score improved
5. Record to log
6. Repeat
```

This loop is self-driven — the agent doesn't need human instruction for the next step; it decides based on score changes.

### 2.4 Operating Mode — Three Strategies

- **Converge**: Stop when target score is reached (for goal-oriented improvements)
- **Continuous**: Run until interrupted (for ongoing optimization)
- **Supervised**: Pause at critical points for confirmation (for sensitive code reviews)

---

## 3. Design Philosophy

### 3.1 "You Don't Need to Tell AI How — Just What 'Better' Looks Like"

This is GOAL.md's deepest design philosophy. Traditional approaches write detailed instructions telling AI every step — but this limits AI's creativity. GOAL.md only defines "goals" (score) and "boundaries" (constraints), letting AI explore the optimal path. It's like giving a smart employee a KPI, not an operations manual.

### 3.2 "Feedback Loops Are the Foundation of All Autonomous Systems"

GOAL.md's improvement loop is essentially a feedback loop: measure → act → re-measure. Without feedback loops, autonomous systems can't function — they don't know if their actions are effective. GOAL.md builds this loop with the simplest possible mechanism: a number.

### 3.3 "Determinism Is the Foundation of Trust"

The Fitness Function must be deterministic — same input, same output. If the scoring script gives different results each run, the agent can't trust its feedback, and the whole system collapses. Determinism isn't just a technical requirement — it's a trust requirement. Humans must be able to predict what the AI sees to trust its decisions.

### 3.4 "Constraints Are More Effective Than Instructions"

GOAL.md doesn't tell the agent exactly how to do things — it defines constraints (don't break existing functionality, format before lint, one commit per change). Constraints are more effective than instructions because they give AI freedom while ensuring safety. This aligns with human management wisdom: good managers define boundaries, not micromanage.

---

## 4. Step-by-Step Tutorial

### 4.1 Five-Minute Quick Start

**Step 1: Create the scoring script**

```bash
mkdir -p scripts
cat > scripts/score.sh << 'EOF'
#!/bin/bash
set -uo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")/.." || exit 1

FORMAT_SCORE=0; CLIPPY_SCORE=0; TEST_SCORE=0

# Format check (20 pts)
cargo fmt -- --check 2>/dev/null && FORMAT_SCORE=20

# Clippy check (20 pts)
WARN_COUNT=$(cargo clippy 2>&1 | grep -c "warning:" || true)
[[ "$WARN_COUNT" -eq 0 ]] && CLIPPY_SCORE=20

# Test check (20 pts)
cargo test 2>&1 | grep -q "test result: ok" && TEST_SCORE=20

TOTAL=$((FORMAT_SCORE + CLIPPY_SCORE + TEST_SCORE))
echo "Score: $TOTAL / 60"
EOF
chmod +x scripts/score.sh
```

**Step 2: Create GOAL.md**

```markdown
# Goal: My Project - Improve Code Quality

## Fitness Function

./scripts/score.sh

## Operating Mode

- [x] **Converge** — Stop when target reached

Stop when:
- Score reaches 60/60
- 10 iterations with no improvement

## Action Catalog

| Action | Impact | How |
|--------|--------|-----|
| cargo fmt | +20 | `cargo fmt` |
| Fix clippy warnings | +20 | `cargo clippy --fix` |
| Add unit tests | +20 | Add tests for public functions |

## Constraints

1. Don't break existing functionality
2. Format before lint
3. One commit per change

## Iteration Log

File: `iterations.jsonl`
```

**Step 3: Run**

```bash
./scripts/score.sh
# Score: 20 / 60

# Agent automatically executes improvements
cargo fmt
./scripts/score.sh
# Score: 40 / 60

cargo clippy --fix
cargo fmt
./scripts/score.sh
# Score: 60 / 60
```

### 4.2 Complete Project Example

File structure:

```
my-cli/
├── GOAL.md           # Goal definition
├── AGENTS.md         # Agent guide
├── iterations.jsonl  # Iteration log
├── scripts/
│   └── score.sh      # Scoring script
├── src/
│   └── ...
└── Cargo.toml
```

### 4.3 Iteration Log Format

After each improvement, record to `iterations.jsonl`:

```json
{"iteration":1,"component":"format","before":20,"after":40,"action":"cargo fmt"}
{"iteration":2,"component":"clippy","before":40,"after":60,"action":"cargo clippy --fix"}
```

### 4.4 JSON Output Format

The scoring script supports `--json`:

```bash
./scripts/score.sh --json
# {"total":60,"max":60,"components":{"format":20,"clippy":20,"tests":20}}
```

### 4.5 Agent Auto-Recognition

Place `GOAL.md` and `CLAUDE.md` in the project root — the agent will automatically recognize and start the improvement loop.

---

## 5. Advanced Patterns

### 5.1 Multi-Agent Collaboration

Multiple agents can improve the same project simultaneously, sharing state via `iterations.jsonl`.

### 5.2 Custom Components

Add any scoring component:

```bash
# Safety check (10 pts)
UNSAFE_COUNT=$(grep -r "unsafe" src/ | wc -l)
[[ "$UNSAFE_COUNT" -eq 0 ]] && SAFETY_SCORE=10

# Documentation check (10 pts)
[[ -f "README.md" ]] && DOC_SCORE=$((DOC_SCORE + 5))
[[ -f "AGENTS.md" ]] && DOC_SCORE=$((DOC_SCORE + 5))
```

### 5.3 Timeout Handling

```bash
# Prevent script hangs
TEST_OUTPUT=$(timeout 120 cargo test 2>&1 || true)
```

### 5.4 Tool Existence Check

```bash
if command -v cargo-tarpaulin &>/dev/null; then
    COVERAGE=$(cargo tarpaulin --out json | jq '.line_percent')
else
    COVERAGE=0
fi
```

---

## 6. Use Cases

- **Code quality improvement** — Recommended mode Converge, example Clippy warning cleanup
- **Performance optimization** — Recommended mode Continuous, example Benchmark continuous optimization
- **Security audit** — Recommended mode Supervised, example Sensitive code review
- **Documentation improvement** — Recommended mode Converge, example README writing
- **Test coverage** — Recommended mode Converge, example Adding unit tests
- **Format standardization** — Recommended mode Converge, example Code formatting

---

## 7. Key Takeaways

1. **"Give AI a number" beats "give AI a checklist."** Traditional approaches list all todos for AI to execute one by one — limiting AI's creativity and preventing autonomous priority judgment. GOAL.md defines "what's better" with a number (score), letting AI explore the optimal path. It's like giving a smart employee a KPI, not an operations manual.

2. **Feedback loops are the foundation of all autonomous systems.** Without them, autonomous systems can't function — they don't know if their actions are effective. GOAL.md's improvement loop (measure → act → re-measure) builds this loop in the simplest possible way. Compilers closed the feedback loop on syntax, test suites on behavior, GOAL.md closes it on **architecture quality**.

3. **Determinism is the foundation of human-AI trust.** If the scoring script gives different results each run, the agent can't trust its feedback. GOAL.md requires deterministic Fitness Functions — not just a technical requirement, but a trust requirement. Humans must be able to predict what the AI sees to trust its decisions.

4. **Constraints are more effective than instructions.** GOAL.md doesn't tell the agent exactly how to do things — it defines constraints (don't break existing functionality, format before lint). Constraints give AI freedom while ensuring safety. This aligns with human management wisdom: good managers define boundaries, not micromanage.

5. **The power of minimalism.** GOAL.md's core is just four components: a scoring script, a goal file, an action catalog, and an iteration log. No complex configurations, no massive frameworks — just the essentials. This minimalism lets GOAL.md be used immediately in any project.

6. **The paradigm shift from "writing code" to "improving code."** Traditional AI-assisted programming focuses on "how to make AI write better code"; GOAL.md focuses on "how to make AI improve existing code." This is a subtle but profound shift — codebases don't start from zero; AI's value isn't just generating new code, but continuously improving what already exists.

---

## References

- AutoHarness Repository: `https://github.com/gyc567/AutoHarness`
- AutoHarness Paper: `https://arxiv.org/abs/2603.03329`
- GOAL.md Tutorial: `https://github.com/gyc567/AutoHarness/tree/main/docs/goal-md/tutorial-cn`
- GOAL.md Template: `https://github.com/gyc567/AutoHarness/blob/main/template/GOAL.md`