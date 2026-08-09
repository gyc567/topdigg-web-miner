---
title: "Harbor Framework Deep Dive: Building an 'Exam Hall' for AI — From Terminal-Bench to Agent Evaluation"
description: "A comprehensive analysis of Harbor Framework (by laude-institute): an open-source framework that lets AI Agents be fairly evaluated inside 'containerized exam rooms' — explained so clearly that even a beginner can follow along. Using plain-language analogies, this article walks through the core concepts of Harbor, the official evaluation tool for Terminal-Bench 2.0 (Task/Dataset/Agent/Trial/Job), provides a detailed installation and running tutorial (including local Docker + Daytona cloud with 32-way concurrency), distills six design philosophies (modular interfaces, cloud sandbox horizontal scaling, integrated evaluation data pipeline, Linux by default, anti-cheating, RewardKit lightweight verification), and summarizes key takeaways such as 'evaluation as infrastructure' and 'get the smallest end-to-end path working first', plus the essentials of two real tutorials: LLM-as-a-Judge and MCP sidecar tasks."
date: "2026-08-09"
author: "TopDigg Research Team"
tags: ["Harbor", "Terminal-Bench", "AI Agent", "Benchmark", "LLM", "Evaluation", "Agent Framework", "Terminal-Bench 2.0", "Claude Code", "Daytona", "RewardKit", "MCP", "Docker", "Machine Learning"]
categories: ["Analysis"]
keywords: ["Harbor Framework", "Terminal-Bench 2.0", "AI Agent evaluation", "benchmark", "LLM eval", "containerized tasks", "Daytona cloud sandbox", "RewardKit", "LLM-as-a-Judge", "Agent training", "SFT", "RL", "prompt optimization", "Turing Bench", "Claude Code evaluation"]
---

# Harbor Framework Deep Dive: Building an "Exam Hall" for AI — The Complete Road from Terminal-Bench to Agent Evaluation

> **Core idea:** AI gets a "graduation exam" too. Harbor is the "exam hall" built for AI Agents — it turns every task into a test paper (container environment + instruction + automated grading), so AI Agents from different vendors (Claude Code, Codex, Gemini CLI…) can compete for scores fairly in the same exam room, and the scores decide who is closer to "someone who can actually get work done." It also turned Terminal-Bench 2.0 (the terminal operation benchmark) into an official exam venue, giving "can AI use a terminal?" its first scientific, reproducible, and horizontally scalable yardstick.

---

## 1. What Is This? (The Version Even a Kid Can Understand)

Imagine you have a group of AI kids, and they all want to be "programmer assistants."

- Some can type away on a keyboard;
- Some can read tutorials;
- Some can open a file, edit it, and save it.

But here's the problem: **how do you know who can actually get work done?**

If you just ask them, "Can you do it?" — every AI will pound its chest and say "Yes!" It's like asking kids before an exam whether they've studied: everyone says "I've studied."

**Harbor is the teacher who writes the test papers.**

It does three things:

1. **Writes the paper:** It takes a real work instruction (like "find the bug in this folder and fix it") and puts it inside an isolated "little room" (a container), stocked with a computer, tools, and materials.
2. **Proctors the exam:** It lets the AI Agent enter the room and work, while it watches from the side, recording every step the AI takes (this is the "trajectory" — the exam trail).
3. **Grades the paper:** A dedicated "grading teacher" (verifier) checks the results in the room — if the AI fixed the file correctly, installed the right software, and wrote the right tests, it gets 1 point; otherwise 0. It can also give fine-grained scores (like "humor: 0.75 points").

After one AI finishes its exam, the next one takes it. Whoever scores higher is the better "intern."

This system doesn't just "grade exams" — it can do three big things:

- **Hire talent**: compare several AIs to see which is stronger (benchmark leaderboard);
- **Train talent**: collect the high-scoring exam trajectories and use them to train AIs to become stronger (SFT / RL reinforcement learning);
- **Catch flaws**: your AI keeps making mistakes at a certain step? Use evaluation to find exactly which step it's weak at, then optimize its prompts with the data (prompt optimization).

So Harbor's name is very fitting: **a harbor** — all the "intellectual ships" of AI come here to dock, get serviced, and set sail again.

---

## 2. Project Overview

### 2.1 Basic Information

- **Project name**: Harbor
- **Author / maintainer**: laude-institute (Anthropic's research institute, and one of the original teams behind Terminal-Bench)
- **Open-source repo**: [https://github.com/laude-institute/harbor](https://github.com/laude-institute/harbor)
- **Official docs**: https://www.harborframework.com
- **License**: MIT
- **Installation**: one-command install via pip / uv, zero configuration to run your first evaluation
- **Tech stack**: Python (CLI + interfaces), Docker (local container environments), cloud sandboxes (Daytona / Modal / E2B / Runloop, etc.)
- **Positioning**: a unified framework for AI Agent evaluation, post-training, and prompt optimization

### 2.2 What Problem Does It Solve?

Harbor's official docs make it very clear in the *Motivation* section: **after Terminal-Bench was released in May 2025, the authors discovered people were using it for far more than expected** — some used it for custom evaluations, some for prompt optimization, some were running RL (reinforcement learning), some were generating SFT (supervised fine-tuning) training trajectories, and others were wiring it into CI/CD for Agent regression testing.

At the same time, the authors also painfully discovered: **"defining and managing containerized tasks" is hard at scale.** So they simply took the evaluation engine behind Terminal-Bench, refactored it, and turned it into a general-purpose "evaluation framework" — that's Harbor.

So Harbor is not a new "task set" — it's a **methodology for building exam halls**: you can use it to run existing leaderboards (Terminal-Bench, SWE-Bench Verified), or define your own tasks, your own environments, and your own Agents.

### 2.3 Six Core Concepts (All in Plain Language)

Using one "exam hall" analogy to explain all of Harbor's concepts:

- **Task = one test paper**: an instruction + a dedicated little room (container environment) + an automated grading question (test script)
- **Dataset = a stack of test papers**: the sum of many Tasks, usually equal to one benchmark (e.g., Terminal-Bench 2.0)
- **Agent = the examinee**: a resumable AI program. Harbor ships with 99 mainstream examinees out of the box — Claude Code, Codex CLI, Copilot CLI, Gemini CLI, Grok Build, OpenHands, and more
- **Container environment (Environment) = the exam room**: the "state" of the computer (which OS, what software is installed, whether it has internet access)
- **Trial = one attempt at answering**: one complete answer by one Agent to one test paper, producing one score (reward) at the end
- **Job = a big exam session**: a batch of Trials running in parallel (can span multiple datasets, multiple Agents, multiple models)

---

## 3. Detailed Tutorial: Running Terminal-Bench 2.0 from Scratch

### Step 1: Install Harbor (One Command)

We recommend `uv` (Python's fast package manager):

```bash
uv tool install harbor
```

Verify the installation:

```bash
harbor --help
```

### Step 2: Install Docker and Start It

Local evaluations use Docker as the "little room" by default. Install Docker and make sure it's running. Then you can run the first "verification paper" of Terminal-Bench 2.0 — running the official reference solution (Oracle):

```bash
harbor run -d terminal-bench/terminal-bench-2 -a oracle
```

> **What this step means:** if you can run the oracle (the reference solution), it means Harbor is installed correctly and the container environment is ready. Oracle is the perfect-score paper — running it successfully is like passing the exam hall's self-check.

### Step 3: Run with a Real Agent (Local)

Try using Claude Code as the examinee, with the model `anthropic/claude-haiku-4-5` (fast and cheap):

```bash
harbor run \
  -d terminal-bench/terminal-bench-2 \
  -m anthropic/claude-haiku-4-5 \
  -a claude-code
```

This command automatically downloads the dataset, starts the container, lets Claude Code enter the exam room and answer, runs the grading, and finally outputs a score report.

### Step 4: Run Your Own Dataset (Local Task Folder)

Don't want to use the official dataset? Just pass a folder of your own Task directories to `-p`:

```bash
harbor run -p "/path/to/dataset" -m "model" -a "agent"
```

### Step 5: Horizontal Scaling in the Cloud (Important!)

The official docs give an important practical tip: **sandboxed Agent evaluation is usually slow** (one evaluation involves dozens of rounds of conversation, and every command takes time). To speed up experiments, the only way is to open more "exam rooms" in parallel — using cloud sandbox providers (like Daytona):

```bash
export DAYTONA_API_KEY="<your-daytona-api-key>"
export ANTHROPIC_API_KEY="<your-anthropic-api-key>"
harbor run \
  -d terminal-bench/terminal-bench-2 \
  -m anthropic/claude-haiku-4-5 \
  -a claude-code \
  --env daytona \
  -n 32
```

`-n 32` means opening 32 exam rooms in parallel. Once you run API models on cloud sandboxes, the bottleneck shifts from CPU to network I/O, so the parallelism can far exceed your local core count — this is the approach the official docs strongly recommend.

### Step 6: View the Leaderboard & Submit Your Results

- **View the leaderboard**: https://tbench.ai/leaderboard
- **Submit your results**: the official leaderboard logs are stored in the [HuggingFace dataset repo](https://huggingface.co/datasets/alexgshaw/terminal-bench-2-leaderboard); follow the instructions in its README to open a PR and submit.

---

## 4. Advanced Tutorials (For Deeper Dives)

### 4.1 Writing Your Own Task (Test Paper)

A task is a directory, and you can initialize the skeleton with one command:

```bash
harbor init --task "org/name"
```

The generated structure looks like a well-formed test paper:

    task.toml             # the paper's "personal info" + examinee configuration
    instruction.md        # the question (the instruction given to the AI)
    environment/          # the exam room: the Dockerfile defines the system
    solution/             # the reference answer (optional, used by Oracle)
    tests/                # the grading script (test.sh → produces the reward)

During grading, the script runs inside the container and writes the score to `/logs/verifier/reward.txt` (writing `1` means success, `0` means failure) or `reward.json` (which can hold multiple metrics at once, e.g., `{"runtime_sec": 1.23, "accuracy": 0.95}`).

**One piece of grading advice** (in the spirit of the official docs): use **absolute paths** in your test scripts as much as possible, to avoid relative-path errors.

### 4.2 Want Linux / Windows / Multiple Containers?

- **OS**: set `[environment].os = "linux"` (default) or `"windows"` in `task.toml`;
- **Multiple containers** (e.g., a sidecar MCP Server or database): put a `docker-compose.yaml` in `environment/`, and Harbor will merge it automatically. Currently multi-container is only supported in the local Docker environment; cloud sandbox providers are in development.

### 4.3 Plugging Your Own Agent Into the Exam

Two types:

**External Agent (runs on your computer, remotely commands the container via exec):**

```python
from harbor.agents.base import BaseAgent

class MyExternalAgent(BaseAgent):
    @staticmethod
    def name() -> str:
        return "my-agent"

    async def setup(self, environment):
        # install your agent and tools
        pass

    async def run(self, instruction, environment, context):
        # execute the task in the container
        pass
```

**Installed Agent (installed directly into the container and run headlessly, like Claude Code):**

```python
from harbor.agents.installed.base import BaseInstalledAgent

class MyInstalledAgent(BaseInstalledAgent):
    async def install(self, environment):
        await self.exec_as_root(environment, command="apt-get install -y curl")
        await self.exec_as_agent(environment, command="pip install my-agent")

    async def run(self, instruction, environment, context):
        await self.exec_as_agent(environment, command=f"my-agent run '{instruction}'")
```

Start an exam with your Agent:

```bash
harbor run -d "dataset@version" --agent path.to.agent:MyAgent
```

### 4.4 Letting an AI Be the Grader (LLM-as-a-Judge Tutorial)

Some papers can't be graded by "is the file correct" (e.g., "write a funny poem"). Harbor's official tutorial shows you how to swap the judge for an LLM:

- In `tests/llm_judge.py`, use the Anthropic API (with structured output) to read the first-party card and return a score;
- The API key is injected via `[verifier.env]` in `task.toml`, so no key ever lives in the source code;
- Output `/logs/verifier/reward.json`, e.g. `{ "funny": 0.75 }`, and you can even grade multiple dimensions: `{ "creativity": 0.9, "humor": 0.7, "grammar": 1.0 }`.

A complete example lives in `examples/tasks/llm-judge-example` — just copy it and adapt.

### 4.5 Letting an MCP Server Be the Exam Room's Little Assistant (MCP Server Task Tutorial)

Want to simulate the real-world scenario of "an Agent interacting with an external service"? Use Docker Compose to add a "sidecar" container running a FastMCP Server:

```yaml
services:
  main:
    depends_on:
      mcp-server:
        condition: service_healthy
  mcp-server:
    build: { context: ./mcp-server }
    expose: ["8000"]
    healthcheck:
      test: ["CMD", "python", "-c", "import socket; s=socket.create_connection(('localhost',8000),timeout=2); s.close()"]
```

Declare `[[environment.mcp_servers]]` in `task.toml`, and compatible Agents like Claude Code and Codex will automatically register and connect to it. The full chain (connect to the service → call tools → write results → grade with pytest) lives in `examples/tasks/hello-mcp`.

### 4.6 RewardKit: A Lightweight Verifier (Grading Toolkit)

The official companion is a **zero-dependency** standalone package, `harbor-rewardkit`, designed specifically for "grading" with a UI:

```bash
uv tool install harbor-rewardkit
```

- **Programmatic**: `rk.file_exists("output.txt")`, `rk.command_succeeds("python main.py")`, and 20+ built-in grading criteria;
- **Judgment-based (LLM-judge)**: write a TOML file to have Claude / GPT score (binary or Likert 5-point);
- **Isolation**: worried one grading criterion might interfere with another? Use `isolated=True` (overlayfs read-only mount);
- **Multi-dimensional rewards**: `correctness`, `structure`, and `quality` each produce a score, then aggregate into a total.

---

## 5. Design Philosophy (Why the Authors Built It This Way)

Reading through the official docs, you can distill 6 clear "design beliefs":

**1. Modular interfaces, single responsibility.**
Environment / Agent / Task are three independent interfaces that don't assume anything about each other's implementation complexity. Whether it's a container environment or the cloud, as long as it implements `BaseEnvironment`, it can be plugged in as a "new room."

**2. "Pre-bundle the mainstream by default," refuse to reinvent the wheel.** "99% of tasks in the world have already been run by existing Agents," so Harbor ships Claude Code, Copilot CLI, Codex CLI, Gemini CLI, Grok, OpenHands, and other mainstream CLI Agents directly in the package — users get them out of the box.

**3. Horizontal scaling beats throwing more hardware at it.** The official docs stress repeatedly: evaluation takes a long time, and the only way to speed it up is to spread horizontally across **cloud sandboxes (Daytona / Modal / E2B / Runloop / EC2 / Beam…)**, because when running API models the bottleneck is I/O, not CPU.

**4. Evaluation data = training assets ("the exam paper becomes the textbook for future teaching").** Harbor connects to RL frameworks like SkyRL and GEPA, directly converting evaluation score trajectories into SFT fine-tuning data. The exam isn't to stamp a seal of approval on an AI — it's to help the AI learn better.

**5. Security and anti-cheating are built into the defaults.** During grading, the "examinee environment" and the "proctor environment" are kept separate (verifier separate), so the grading code can't see the container the Agent is in, preventing the Agent from peeking at the answers; secrets are also injected via `${VAR}`, never entering the task source code.

**6. The simplest structure carries the most rigorous judgment.** The official docs repeatedly stress that "a good task = a simple structure (instruction.md / task.toml / container / solution / tests) + a clear grading file": use absolute paths, version your tasks, and support multi-stage step-by-step grading. Complex judgment shouldn't rely on fancy formats, but on clear conventions — this is the engineering aesthetic of "minimal implementation + maximum verifiability."

---

## 6. Summary: Our Core Takeaways

Distilling the docs and practice, here are 6 concluding takeaways:

### Takeaway 1: AI Evaluation Is Becoming "Infrastructure," Not Just a "Research Tool"

Harbor's birth marks a trend: when Terminal-Bench is used as a source for training data, prompt optimization, CI/CD, and RL, **evaluation becomes the hub of the entire AI Agent development loop (training → eval → improve)**. Whoever controls a good evaluation framework controls the accelerator for the next round of Agent capability gains.

### Takeaway 2: Containerization Is the "Safety Net" of Agent Evaluation, Not an "Optional Extra"

For an Agent to actually modify its environment (installing packages, writing files, starting services), running inside a container is the only way to: isolate risk, reproduce environments, and give each trial its own isolated little room. Harbor makes "one container per task" the default — this is the prerequisite for a **true measure of Agent capability**.

### Takeaway 3: Cloud Sandboxes + Parallelization Are the Only Realistic Way to Speed Up

A single Agent evaluation being "unacceptably slow" is the norm, and horizontal scaling like `-n 32` (I/O-bound) is the officially endorsed speed-up. "Not enough machines" is not an excuse — the budget-driven answer is to run in the cloud.

### Takeaway 4: Evaluation Grading Can Be "Multi-Dimensional," and the Grader Can Be an AI

From the binary score in `reward.txt` to the multi-dimensional scores in `reward.json`, to LLM-as-a-Judge and RewardKit's forgiving TOML-based grading — **Harbor upgrades "grading" from a yes/no question into a composable capability**: code quality, humor, and usability can all be quantified.

### Takeaway 5: "Bring Your Own Agent" and "Bring Your Own Task" Are Two Levels of Openness

Three levels of openness: run existing leaderboards with existing Agents (zero code); plug in your own Agent through the interfaces (a little code); define your own tasks and environments from scratch (full control). **The highest value of openness is that anyone can become an educator of evaluation.**

### Takeaway 6: The Terminal Is the First Exam Room for Measuring Whether an AI Can Get Work Done

Terminal-Bench 2.0 doesn't test "can it chat" — it tests "behavior in a real terminal": installing packages, debugging, editing code, looking up docs. Harbor's significance is turning "can an AI actually get down to work" — something that used to be vague — into a measurable, comparable, and transferable yardstick. That is the greatest value of this framework.

---

## 7. A Word to the Reader

> **Don't just teach AI to chat — learn to grade AI.** Harbor's entire design philosophy boils down to one sentence: **make evaluation as much like development as possible — modular, reproducible, and scalable.** When you need to pick a model, optimize a prompt, or train your own Agent, build a small "exam room" first and let the data speak — not your gut.

---

## References

- Harbor official docs — Getting Started: https://www.harborframework.com/docs/getting-started
- Core Concepts: https://www.harborframework.com/docs/core-concepts
- Motivation: https://www.harborframework.com/docs
- Running Terminal-Bench official tutorial: https://www.harborframework.com/docs/tutorials/running-terminal-bench
- LLM-as-a-Judge tutorial: https://www.harborframework.com/docs/tutorials/llm-as-a-judge
- MCP Server Task tutorial: https://www.harborframework.com/docs/tutorials/mcp-server-task
- RewardKit docs: https://www.harborframework.com/docs/rewardkit
- Migrating from Terminal-Bench: https://www.harborframework.com/docs/migration
- Terminal-Bench official site: https://tbench.ai
- Repository: https://github.com/laude-institute/harbor