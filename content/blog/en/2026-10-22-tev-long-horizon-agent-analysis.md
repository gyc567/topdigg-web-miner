---
title: "Tev Deep Dive: Manufacturing Data with a latent world, Training Long-Horizon Agents with Dense Rewards"
date: "2026-10-22"
description: "A deep analysis of the Tev paper jointly published by Adobe Research and UCLA: from latent-world-first environment synthesis, to a breakdown of 1,170 verifiable long-horizon task environments, Progress-Potential Reward Shaping (PPRS), and how Tev-27B matches GPT-6 Astra and Claude Opus 5 on ALE-CM. Includes a complete method reproduction tutorial and an analysis of its design philosophy."
author: "瑞哥观势"
tags:
  - Tev
  - AI Agent
  - Reinforcement Learning
  - Long-Horizon Tasks
  - Dense Rewards
  - Paper Analysis
  - Agentic RL
categories:
  - Deep Paper Analysis
  - AI Agent
---

# Tev Deep Dive: Manufacturing Data with a latent world, Training Long-Horizon Agents with Dense Rewards

> Paper: *Tev: Scaling Long-Horizon Agentic Environments with Dense Progress Rewards*
> Authors: Wenbo Hu, Shraman Pramanick, Krishna Kumar Singh, Nanyun Peng, Kai-Wei Chang, Yong Jae Lee (Adobe Research + UCLA)
> Paper home: https://arxiv.org/abs/2610.18868 ｜ HTML version: https://arxiv.org/html/2610.18868v1
> Project home: https://tev-agent.github.io/
> Model weights: https://huggingface.co/gordonhu/Tev-27B ｜ https://huggingface.co/gordonhu/Tev-320B

## Prelude: A Field Stuck on Data

Over the past two years, the capability curve of AI agents has been almost entirely determined by "how long the task is."

Short and medium tasks are the sweet spot. SWE-Smith has 50,000 environments, TMAX-15K has 14,600, and CLI-Gym, SETA, and Endless Terminals each have anywhere from a few thousand to over ten thousand. These datasets are large enough, the training pipelines mature enough, and models really are improving.

But once you stretch the task timescale to "hours to days" — genuinely open-ended math problems, automated machine learning research, production incident root-cause analysis — the whole field slams into a wall.

That wall is made of two gaps.

**The first gap is data.** Long-horizon tasks exist only as hand-written evaluation sets. Every instance in Agents' Last Exam (ALE) and Terminal-Bench (TB) takes experts weeks of effort. The full ALE-CM split has only a few dozen to a few hundred problems, and they can only be used for evaluation, not for training. This creates an extremely awkward structural contradiction:

> There is plenty of agent training corpus, but it is all short; long tasks do exist, but only as a small set of hand-made evaluation sets.

The middle piece — "large-scale long-horizon training data" — is completely blank.

**The second gap is reward.** Even if you wanted to manufacture data, rewards on long tasks are sparse. Terminal reward only appears when the task is completed, and on long tasks the model's pass rate is often 5% or lower. That means in group-relative RL algorithms like GRPO, the vast majority of sampled groups fail entirely, advantages are zero everywhere, and the contribution to the gradient is exactly zero.

The paper makes this concrete with a very specific number: if the task pass probability is $p=0.05$ with $G=8$ rollouts per group, then **66% of sampled groups are entirely wasted**; when $p=0.01$, the waste rate reaches **92%**. And this is precisely the early-training phase, when the policy is weakest and the signal is most needed.

What the Tev paper does can be summarized in one sentence:

> **Work backwards from "a world whose correct answers are already known" to manufacture tasks, then use that world's ground truth to score every step of training.**

Below we take apart its core idea, method structure, experimental conclusions, and a reproducible tutorial in full.

---

## 1. Core Idea: Latent-World-First

### 1.1 The fundamental divergence from traditional pipelines

The mainstream synthetic-data pipeline today roughly works like this: have a language model generate a task description, then generate the corresponding input files, then generate a verifier or test cases. Nowhere along the chain does a "correct answer" exist — only things that look plausible.

This approach has three well-known problems:

1. **Verifiers are unreliable.** The generated test cases may themselves be wrong.
2. **The task and the verifier may not match.** This is the most fatal one. The paper calls it **artifact drift**: the environment, the task, and the verifier are generated separately, each is valid on its own, yet together they describe two different problems.
3. **There is no intermediate state.** Only the end state is black-or-white; you have no idea which step the agent got right or how far it is from the goal.

Tev turns the entire chain around.

**First, construct a latent world $W$**: the complete and correct state of the task domain. For example, the customers, products, and transaction records of a retail warehouse; the tensor shards and topology of a distributed checkpoint; the resource manifest of a Kubernetes cluster.

In that world, **the correct answer exists naturally**. Because the world itself is "what everything looks like when it is fine."

Then, **render** that world into the input files the agent will actually see, and apply **controlled, reversible corruption**, yielding the agent's initial workspace $s_0$.

The key point: **the latent world $W$ simultaneously serves as the common source of the task prompt, the input files, the verifier, and the progress scorer.**

The paper writes this relationship as a compact expression:

$$E=(x,\;s_{0},\;\operatorname{ver}_{W},\;\Phi_{W}),\tag{1}$$

All four components of an environment $E$ are functions of the same $W$:

- $x$: the task prompt (the only description the agent can see)
- $s_0$: the input directory tree (the agent's initial workspace)
- $\operatorname{ver}_{W}$: a strict pass/fail verifier that checks the agent's output files against $W$
- $\Phi_{W}$: progress potential, detailed in Section 3

This single anchor eliminates artifact drift at the root. Because ground truth is correct by construction, because rendering can round-trip, and because corruption is declared and reversible, **the agent's initial workspace $s_0$ fully determines $W$** — the correct answer can be computed from what the agent actually sees, without running a solver.

### 1.2 Three corollaries

The beauty of this design is that it incidentally solves three problems that other approaches need extra machinery to solve.

**Corollary one: difficulty is a controllable knob, not a matter of luck.**

Because $W$ is built first, "make it a bit bigger" is a pure code operation — there is no need to have a model regenerate anything. The scale tier (default unit / small / full) controls $|W|$, and the dependency depth of the workflow DAG controls "how many stages must be completed to obtain the correct output." The two knobs are independent.

**Corollary two: intermediate states are free.**

Because every correct intermediate state is a rendering of $W$, scoring requires no manual step annotation, no training a process reward model, and no language model as judge. $\Phi$ is deterministic, reproducible, and involves zero model calls.

**Corollary three: marginal cost is extremely low.**

Generating one environment (including running two reference solvers, sealing the hidden test suite, and previewing the progress potential) takes a median of just **30 seconds of CPU time** (90th percentile: 82 seconds), with **zero model calls**. That is an order-of-magnitude difference versus hand-written expert labor (hours per problem). And the one-time cost of writing a generator is amortized across all of its seeds and scale tiers.

Even better: the paper notes that Tev-Gym can be scaled further — have a coding agent write the generators, and the generators produce new environments in bulk across seeds and scale tiers, **without calling any model at all along the way**.

---

## 2. Method Breakdown: A Six-Stage Environment Synthesis Pipeline

Section 2.1 breaks environment synthesis into six stages. The entire pipeline has **no language model involved**.

### Stage 0: Task Sources

For the seven computational and mathematical subdomains of ALE-CM (corresponding to Tev-Gym's seven domains), a pool of **real task specifications** is first built for each domain:

| Subdomain | Name | Coverage |
|------|------|----------|
| 9.1 | Software Engineering | Feature implementation, debugging, refactoring, test writing |
| 9.2 | Data & Analytics Engineering | ETL/ELT pipelines, recommendation ranking systems, feature engineering |
| 9.3 | AI Engineering, Safety & CS Research | Model training and evaluation pipelines, paper reproduction, checkpoint management, alignment experiments |
| 9.4 | Mathematical & Operations Research | Combinatorial optimization, game equilibria, applied math and number theory, probability estimation and filtering |
| 9.5 | Cybersecurity & Digital Forensics | Reverse engineering, malware configuration extraction, network packet analysis, incident forensics |
| 9.6 | Infrastructure Engineering & Cloud Operations | K8s migration and configuration, production incident root-cause analysis, OS hardening, IaC |
| 9.7 | Quantum Computing | Quantum circuit construction and simulation, error-correcting code analysis, noise simulation |

Sources for the specification pool include: specifications mined from the internet, the 82 Kaggle competitions from MLE-bench, and — for the quantum computing domain, which no benchmark covers — public reference material (the MQT Bench circuit suite, the Qiskit Experiments handbook, TeNPy's DMRG examples).

Specifications are sampled at random from the pool, and then **a generator is written for each specification individually**. Note the boundary here: the generator references the structure and difficulty of the specification and **never copies** its prompt, inputs, answers, or scoring text.

Three filters:
- **Feasibility filter**: only keep specifications where "ground truth is knowable by construction" and that are "batch-executable on pure CPU," excluding anything relying on live services, audio/video, heavy toolchains, GPU kernels, or open-ended "optimize this" tasks.
- **Similarity gate**: compare a new generator's code, specifications, and generated data against all registered generators; reject near-duplicates.
- **Adversarial review**: attack every specification that passed the first two filters, looking for hidden shortcuts, too-short horizons, and disguised provenance.

### Stage 1: World Construction

Every generator is a **seeded program**. Given `(seed, scale_tier)`, it programmatically generates the latent world $W$ and does two things:

1. **Validates invariants**: unique identifiers, legal connections, finite measures.
2. **Extracts a defect plan**: precisely specifying which records, shards, and fields in $W$ will be corrupted, and by which declared operator.

The defect plan is "seed-derived," so the same generator under two different seeds necessarily produces two provably different worlds.

### Stage 2: Workflow Graph

The environment's workflow is compiled into a **directed acyclic graph (DAG)** with explicit dependencies, permitted parallelism, and per-stage semantic workload estimates. For example, a retail-warehouse ETL scenario:

```
profile-sources → reconcile-facts / normalize-dimensions → load-facts
                → aggregate-validate → package-sidecars
```

**This DAG is generated by code from the size of $W$, with no model involved in the process.**

Two key properties of the DAG:

- The **critical path** (the longest chain of dependent stages) defines the task's **horizon**.
- The **stages constitute the skeleton of the progress potential** (Section 3).

Note one methodological choice in the paper: **the horizon is measured by the DAG critical path rather than by the actual rollout length $T$**, because $T$ becomes inflated as the agent detours. DAG depth is structural and controllable.

### Stage 3: Artifact Rendering

$W$ is projected onto the environment's declared public interfaces, materialized into target line formats:

- CSV / TSV partitions
- JSON records
- SQLite databases
- safetensors shards
- stripped binaries
- infrastructure manifests

**Rendering is a pure function of $W$.** And before proceeding, the pipeline **asserts that it can round-trip** — that is, $W$ can be exactly recovered from the rendered files.

### Stage 4: Controlled Corruption

The defect plan from Stage 1 is applied to the rendered files, injecting schema drift, duplicate and missing records, category drift, shuffled shard indices, stale caches, and so on.

The corrupted tree $s_0$ is the task the agent receives; the unmodified $W$ is the ground truth.

### Stages 5 and 6: Public Specification and Hidden Test Suite

**Stage 5** emits the public contract $x$: input roles, required output artifacts and their schemas, ordered requirements, authoritative precedence rules, and the permitted toolchain. This is the **only** description the agent can see.

**Stage 6** seals a hidden suite, outside the agent's view, for the verification stage:
- **metamorphic transform**: semantics-preserving rewrites, which **must not** change the score.
- **stale-output counterfactual**: plausible-but-wrong states, which **must** be judged as failures.

This layer prevents an overly narrow verifier, and prevents "submit a stale but plausible-looking result" from slipping through.

### 2.2 Coverage, Calibration, and Eight Admission Gates

**Diversity.** Each environment is tagged along **19 coverage axes**: subdomain, scale, four horizon axes, workflow stage, tool capability, artifact role, relation type, corruption category, and more.

The paper particularly emphasizes the value of the "behavioral axes": changing the value of an axis changes what the agent **must repair** (corruption category), **how it must repair it** (workflow stage, tool capability), and **through which files** (artifact role, relation type).

**Controllable difficulty.** Two control knobs: the scale tier (unit / small / full) stretches the operational span; DAG dependency depth plus the number of corruption categories determines "how many stages must be completed, and in what order."

A concrete feel for the numbers: for generators instantiated at all three scale tiers, the median input tree grows from **17 files / 51 KB (unit)** to **20 files / 168 KB (small)**, to **28 files / 586 KB (full)**, while the **workflow DAG stays unchanged**.

**Eight admission gates.** A synthetic environment is admitted only after passing all eight benchmark-independent gates, each checked automatically at generation time and each mapped to a named failure category:

| Gate | Mandatory requirement | Failure category targeted |
|------|----------|--------------|
| Reward causality | Every reward component must drop in score when its cause is mutated | Rewarding the wrong outcome |
| Anti-gaming | All **14 gaming probes** must score 0 | Verifier loopholes, shortcuts accepted |
| Role independence | Reference solver / alternative solver / strict verifier / progress scorer **code closures must be disjoint** | Solver and scorer sharing a bias |
| Solver agreement | Two independently written solvers must produce exactly the same output tree on every seed | Only the verifier passes; the spec is unresolved |
| Progress validity | On partially correct states $0<\Phi<1$; monotonically rising to 1 along the reference trajectory; negative increments on regression | Invalid process signal |
| Metamorphic invariance | Semantics-preserving rewrites do not change the score; stale outputs must fail | Overly narrow verifier, stale states accepted |
| Six-seed diversity | At least 6 seeds produce distinct world identities / public tree hashes / task IDs | Degenerate environments, template repetition |
| Public contract hygiene | No private authority, reference answers, or verifier code may appear in the prompt or the public tree | Answer leakage |

Regarding **gaming probes**, the paper lists 14 cheating strategies, including: empty output, minimal-but-schema-valid output, copied input, single-seed hardcoding, path traversal, and private lookups. Every one of them must score 0 under both the strict verifier and the progress scorer.

Regarding **role independence**, this one deserves separate emphasis. It requires:

$$\operatorname{ver}_W(\pi^{\mathrm{ref}}(s_0))=\Phi_W(\pi^{\mathrm{ref}}(s_0))=1,\quad \pi^{\mathrm{ref}}(s_0)=\pi^{\mathrm{alt}}(s_0)$$

The reference solver $\pi^{\mathrm{ref}}$ (scoring exactly 1.0) and the **independently written** alternative solver $\pi^{\mathrm{alt}}$ must produce exactly the same output tree on every seed. **As soon as they disagree, the specification is deemed unresolved and the environment is rejected outright.**

The paper explains why this design matters: solver auditing is independent of the verifier — neither solver imports verifier code, so their agreement is evidence about **the specification itself**, not about **the scorer**.

---

## 3. Dense Rewards: From Progress Potential to PPRS

### 3.1 Why terminal rewards "starve" group-relative RL

Start with GRPO's group-relative advantage:

$$\hat{A}_i=\frac{R_i-\operatorname{mean}(R_{1:G})}{\operatorname{std}(R_{1:G})+\epsilon}\tag{2}$$

where $R_i=\mathds{1}[\tau_i\ \text{passes}]$, i.e. it is 1 only when a rollout submits and the strict verifier $\operatorname{ver}_W$ accepts.

**The core problem**: if all $G$ rollouts in a group fail, then $R_1=\cdots=R_G=0$, so all $\hat{A}_i=0$. This task contributes zero to the gradient, and all $G$ rollouts are wasted.

The waste fraction is $(1-p)^G$:

| Pass rate $p$ | Fraction of groups wasted at $G=8$ |
|------------|---------------------|
| 0.05 | 66% |
| 0.01 | 92% |

The paper also points out a subtler problem: **even if only one rollout in a group succeeds, it is not much better.** That single positive sample faces $G-1$ negative samples, all of which receive the same negative advantage, so the gradient **cannot distinguish "almost there" from "no progress at all."**

On long-horizon tasks, the $p$ of untrained open models is around one tenth or lower. So approaches like "drop fully-failed groups" or "resample" simply throw away most of the batch on long tasks.

### 3.2 Progress Potential: A Deterministic Scale Derived from the latent world

Every Tev-Gym environment provides a **progress contract**: a set of nodes $V$, each node being a checkable state of the output workspace, derived from the workflow DAG in Stage 2. Nodes carry weights $w_v>0$ with $\sum_v w_v=1$, plus a prerequisite set $\mathrm{pre}(v)$.

The partial scorers $c_v(s)\in[0,1]$ score the agent's current workspace $s$ directly against the latent world.

**Credit is prerequisite-gated**: $\tilde{c}_v(s)$ takes the minimum partial score among $v$ and all of its direct and indirect prerequisites.

The progress potential is then:

$$\Phi(s)=\sum_{v\in V}w_v\,\tilde{c}_v(s)\in[0,1]\tag{3}$$

This design brings three properties, all enforced by the gates:

- **Anchored (anti-gaming)**: the unmodified public tree and every gaming probe score strictly $\Phi=0$; strict verifier acceptance gives strictly $\Phi=1$.
- **Monotonic (progress validity)**: it rises as nodes are completed and falls when completed work is broken.
- **Independent (role independence)**: the scorer's code closure is **disjoint** from the verifier and the reference solver, so one scorer's flaw is not inherited by another. And this scoring code **is not released alongside the public tree**.

The paper specifically emphasizes "scalable reward design": because the latent world is defined before task generation, every correct intermediate state can be rendered directly and evaluated by $c_v$. This provides **precise, deterministic** progress feedback **without** manual step labels, without training a reward model, and without a language model judge.

This is the most fundamental divide from mainstream approaches.

### 3.3 PPRS: Progress-Potential Reward Shaping

Let the workspace states of a rollout be $s_0,\dots,s_T$, where $s_0$ is the unmodified public tree, so $\Phi(s_0)=0$.

Following potential-based reward shaping (PBRS, Ng et al. 1999), the shaped reward per step is the change in potential:

$$r_t=\Phi(s_t)-\Phi(s_{t-1})$$

The total rollout reward is:

$$R(\tau)=\mathds{1}[\tau\ \text{passes}]+\lambda\sum_{t=1}^{T}r_t=\mathds{1}[\tau\ \text{passes}]+\lambda\,\Phi(s_T),\tag{4}$$

where **$\lambda=0.25$, used in all experimental runs**.

There are four design details here, each worth pulling out on its own.

**Detail one: PPRS deliberately does not preserve optimal-policy invariance.**

Standard PBRS zeroes out the terminal potential, thereby guaranteeing optimal-policy invariance. PPRS keeps $\lambda\Phi(s_T)$ and **deliberately changes the optimization objective**. This is an explicit, risk-bearing deviation, and the paper candidly discusses "what is preserved and what is not" in the appendix.

**Detail two: submission is an action, not a state.**

$\Phi$ scores the workspace; the terminal term scores the workspace the policy **submits**. A rollout that exhausts its turn or token budget without submitting **is not terminally scored** and only receives $\lambda\Phi(s_T)$. This is exactly why the "fully built but not submitted" rollout in Figure 4 can reach $\Phi=1$ while its terminal reward is 0.

**Detail three: the reward depends only on the final state.**

Because $\Phi$ is merely a function of the workspace, $R(\tau)$ depends on the rollout only through the final state $s_T$. This means **two rollouts that follow different paths, in different step orders, with different implementations, but end at the same final workspace, receive exactly the same reward**. That eliminates any accidental preference of the reward for "process style."

**Detail four: the terminal reward still sorts to the top.**

Because $\Phi\le 1$, any passing rollout receives $1+\lambda=1.25$, strictly higher than any failing rollout. So no rollout ever benefits from "trading completeness for partial progress." Appendix B gives a bound on when preferences might invert under random policies.

**Substituted into GRPO, the starvation problem is repaired.**

When no rollout in a group passes, the reward becomes $R_i=\lambda\Phi(s_T^{(i)})$. As long as different rollouts reach different depths of progress, these rewards differ, the within-group advantages are non-zero, and **rollouts are ranked by depth of progress**.

Figure 4 of the paper illustrates this effect: the same warehouse environment, a group of $G=8$ rollouts, scored in real time each round.

- **Terminal reward only (red)**: all rollouts score 0.
- **Progressive reward**: 2 submitted an incomplete warehouse (circles), 5 exhausted the 65k token context (crosses), 1 built the complete warehouse.

The within-group rewards finally differ, and the gradient finally has something to learn from.

### 3.4 Comparison with existing approaches

| Approach | Progress granularity | Extra model needed | Main flaw |
|------|---------|------------|---------|
| Terminal reward (sparse) | Terminal | No | Fully-failed groups have zero advantage, wasting 66%–92% |
| Filter identical rewards / pick tasks of similar difficulty / add expert prefixes | Terminal | Expert prefixes needed | Only sidesteps the problem, and discards batches |
| Learned judge | Intermediate | Requires training a judge | Introduces extra bias and training cost |
| Proxy signals such as test pass rate | Coarse | No | Captures only the end state |
| **PPRS (this paper)** | **Every workflow stage** | **No** | Requires the latent world to be correctly constructed |

---

## 4. Experiments: How Strong Is Tev-27B Really?

### 4.1 Training Configuration

| Item | Configuration |
|------|------|
| Algorithm | DPPO (Qi et al., 2026), reward from Equation (4) |
| Base models | Qwen3.5-9B (using a 264-task subset of the Tev-Gym unit tier), Qwen3.8-27B (using the full corpus) |
| Large-base validation | GLM-5.3-Flash → Tev-320B |
| Sampling per step | 8 tasks × 24 rollouts ($G=24$) |
| Response budget | 65,536 tokens per rollout (16,384 per turn) |
| Tool call limit | 64 |
| Sandbox | Exactly one bash tool exposed |
| Compute | 27B: 4-node B200 or 8-node A100, about 4 days |

### 4.2 Main ALE-CM Results

ALE-CM is the computational and mathematical split of Agents' Last Exam. The metrics are **mean scored fraction (S@k)** and **fully solved fraction (P@k)**, with 5 rollouts per task.

| Model | S@1 | S@5 | P@1 | P@5 |
|------|-----|-----|-----|-----|
| GPT-6 Astra (Codex) | 0.58 | 0.58 | 0.38 | 0.38 |
| Claude Opus 5 (Claude Code) | 0.51 | 0.53 | 0.38 | 0.38 |
| Claude Fable 5 (Claude Code) | 0.47 | 0.51 | 0.38 | **0.33** |
| Gemini 3.7 Flash (Gemini CLI) | 0.48 | 0.50 | 0.38 | 0.38 |
| Qwen3.8-27B (base) | 0.33 | 0.43 | 0.12 | 0.17 |
| **Tev-27B (ours)** | **0.40** | **0.54** | **0.16** | **0.28** |
| Δ vs base | +0.07 | +0.11 | +0.04 | **+0.11 (↑65%)** |
| Qwen3.5-9B (base) | 0.25 | 0.33 | 0.06 | 0.06 |
| **Tev-9B (ours)** | **0.29** | **0.40** | 0.07 | **0.11** |

Key readings:

- **Tev-27B's P@5 = 0.28 matches GPT-6 Astra (0.28) and Claude Opus 5 (0.28)**, catching up with frontier closed models.
- Relative to Qwen3.8-27B under the same harness, Pass@5 **improves 65%** (0.17 → 0.28).
- It reaches 85% of Claude Fable 5's 0.33, **closing more than two thirds of the original gap**.
- Under the same harness, Tev-27B surpasses Qwen3.8-2.4T-A95B (a 2.4T-parameter MoE).
- Tev-9B's Pass@5 **improves 83%** over Qwen3.5-9B (0.06 → 0.11).

One caveat: the table above is **data reported by the paper's authors**. The claim of parity on P@5 rests on each system's own harness (Codex / Claude Code / Vanillux2) and evaluation setup, so strict cross-harness comparability is left for the reader to judge.

### 4.3 Zero-Shot Cross-Horizon Generalization

**No Terminal-Bench task was used at all during training**, yet:

| Model | TB 3.0-CM (22 tasks) P@1 | TB 4.0-CM (18 tasks) P@1 | TB 2.1 P@1 |
|------|--------------------------|--------------------------|-------------|
| Qwen3.8-27B (base) | 0.09 | 0.04 | 0.764 |
| **Tev-27B** | **0.14 (↑56%)** | **0.10 (↑150%)** | **0.794** |
| GLM 5.2 | 0.04 | 0.03* | — |
| Gemini 3.7 Flash | 0.07 | 0.09* | — |
| Claude Opus 4.8 | 0.19 | 0.27 | 0.789 |

(Results marked with * were evaluated by the paper's authors, not from the official leaderboard.)

**This is the most persuasive result in the paper.** Training on ALE-CM, zero-shot transfer to the longer Terminal-Bench 4.0-CM improves P@1 by 150% and surpasses GLM 5.2 and Gemini 3.7 Flash. Meanwhile, the medium-horizon TB 2.1 **does not regress** — it actually edges up from 0.764 to 0.794, reaching Claude Opus 4.8 level (0.789) — showing the training did not damage general coding ability.

The paper also validates subset representativeness: they used Claude to judge whether each TB task belongs to the computational and mathematical domain (even if only marginally) to construct the "CM" subset, then compared the subset's leaderboard performance against the full set. The Pearson correlation is **r=0.96** for TB 3.0 P@1 and **r=0.97** for TB 4.0 P@1. The subset is representative.

### 4.4 A Larger Base: Tev-320B

Applying the same recipe to GLM-5.3-Flash yields Tev-320B:

- TB 3.0-CM P@1 improves 35%
- TB 4.0-CM P@1 improves 28%
- On TB 4.0-CM, it trails only Claude Opus 5, Claude Fable 5, and GPT-5.6 (sol)

This shows that **the recipe itself is not bound to a particular base model**.

### 4.5 Ablations

Ablations are run in the 9B setting.

**Ablation on how the data is constructed:**

| Method | World | DAG | Hidden ground truth | Signal | S@1 | S@5 | P@1 | P@5 | GPU-h/step |
|------|-------|-----|---------|------|-----|-----|-----|-----|------------|
| Qwen3.5-9B (base) | – | – | – | No RL | 0.25 | 0.33 | 0.06 | 0.06 | – |
| **Tev-9B (ours)** | ✓ | ✓ | ✓ | ΔΦ + terminal | **0.29** | **0.40** | **0.07** | **0.11** | 9.0 |
| Public-view verifier | ✓ | ✓ | LLM | Terminal | 0.24 | 0.35 | 0.04 | 0.06 | 22.3 |
| Prompt-first | LLM | LLM | LLM | Terminal | 0.23 | 0.32 | 0.06 | 0.06 | 11.8 |
| Sparse (terminal only) | ✓ | ✓ | ✓ | Terminal | 0.25 | 0.32 | 0.06 | 0.06 | 16.7 |
| PPRS, pooled norm. | ✓ | ✓ | ✓ | ΔΦ + terminal | 0.28 | 0.35 | 0.06 | 0.06 | 10.9 |
| Direct reward (additive) | ✓ | ✓ | ✓ | Φ + terminal | 0.29 | 0.35 | 0.06 | 0.06 | 9.7 |

Three readings:

**Reading one: both variants that "degenerate into LLM generation" fail, and they are more expensive.**

- **Public-view verifier**: the model writes the verifier from the agent's perspective (abandoning hidden ground truth). **88% of sampled groups are discarded during training**, and GPU time is 22.3 GPU-h/step, 2.5× the full method.
- **Prompt-first** (the standard self-instruct baseline): the entire pipeline becomes "first the prompt, then the inputs, verifier, and solution" — no latent world and no DAG.

The two variants score S@1 of 0.24 and 0.23 respectively, **neither exceeding the base's 0.25**; the full method leads them by 0.05–0.06 (S@1) and 0.05 (P@5).

**Reading two: dense rewards must be "shaped," not merely "added."**

- **Sparse (terminal only)**: S@1 = 0.25, with the highest GPU time (16.7).
- **PPRS, pooled norm.** (normalized per rollout): S@1 = 0.28, an improvement, but P@1/P@5 don't move.
- **Direct reward (additive)** ($\gamma=0$, directly summing $\Phi(s_t)$): S@1 = 0.29, but P@1 is still 0.06.

Full PPRS improves **S@1 by 0.04** over sparse reward, and is **the only scheme that lifts P@1 from 0.06 to 0.07 and P@5 from 0.06 to 0.11**.

The paper's explanation for why additive fails is crucial: **direct summation repeatedly rewards high-potential states without propagating credit forward**, causing more rollouts to exhaust their context window before submitting and thus producing longer trajectories. Full PPRS instead uses return-to-go ($\gamma=1$) to propagate progress credit forward, and **normalizes advantages per turn index** to preserve credit for late turns (avoiding comparing a smaller late return against the mean of the entire rollout).

**Reading three: the gap widens further at 27B scale.**

The paper states explicitly: at 27B, shaped rewards can be trained to completion, whereas **the groups produced by terminal reward alone are almost all zero-advantage — a full optimizer step cannot get out of them**.

### 4.6 Qualitative Case: Root-Cause Analysis of a k8s Payment API

The paper gives a concrete case from the Coding & System domain on ALE-CM (the model produces a JSON root-cause report with verbatim evidence strings and a rollback conclusion, from a single kubectl dump, Deployment/HPA YAML, and the logs of a crashing pod):

| Model | Score | Trajectory highlights |
|------|------|---------|
| Claude Fable 5 | **0.97** | At t14 cites the probe cause `initialDelaySeconds: 5` and cache warm-up `duration=6.67s`, judging rollback unsafe; at t18–21 verbatim-verifies 41 citations before submitting |
| GPT-6 Astra | 0.75 | At t6 dumps cluster state and YAML in one shot; at t8 confirms the OOM kill and HPA conflict, but **rollback safety is unverified** (no citation of the warm-up measurement), so that component gets no credit |
| Qwen3.8-27B base | 0.70 | At t12–16 checks dashes and column spacing byte by byte, writes `build_rca.py` to extract precisely; concludes `safe_to_rollback: false` |
| **Tev-27B** | **0.97** | At t20 cites the probe cause and **verbatim-confirms the citations in the plan**; at t30 **reconsiders the rollback decision**, concluding `safe_to_rollback: true` |

The most interesting part of this case is Tev-27B's t30: "'started flapping after a routine chart-value change'… roll back first" → `safe_to_rollback: true`. **It overturns one of its own earlier judgments.** Under dense reward, the agent gets continuous feedback about "step by step approaching the correct state in the workspace," and so is more capable of making "go back and correct yourself" decisions — rather than, as with models trained on pure terminal reward, becoming unable to backtrack once it goes off course.

---

## 5. The Tev-Gym Dataset in Profile

### 5.1 Comparison with existing corpora

| Dataset | Size | # Domains | Median agent time (min) | Oracle | Scoring | Progressive reward | P@1 | P@8 |
|--------|------|------|----------------------|--------|----------|---------|-----|-----|
| SWE-Smith | 50.1k | 1 | 2.0 | Unit tests | Pass/fail | ✗ | 47% | 52% |
| Terminal-Universe | 32.0k | 3 | NA | pytest | Pass/fail | ✗ | NA | NA |
| TMAX-15K | 14.6k | 3 | 1.3 | Unit tests | Pass/fail | ✗ | 74% | 80% |
| SETA | 4.5k | 4 | 1.2 | Unit tests | Test pass fraction | ✗ | 80% | 88% |
| Endless Terminals | 3.3k | 2 | 0.5 | Unit tests | Pass/fail | ✗ | 83% | 89% |
| CLI-Gym | 1.7k | 4 | 1.9 | Unit tests | Pass/fail | ✗ | 69% | 74% |
| **Tev-Gym (ours)** | **1,170** | **7** | **12.4** | **latent world** | **Staged Φ + pass/fail** | **✓** | **29%** | **40%** |

The median agent time in Tev-Gym is 12.4 minutes, **about 6× that of the previously most time-consuming corpus (SWE-Smith)**. It is smaller in scale, but each task is far more complex — and the lowest pass rate (29% versus 47%–83% for other corpora) is direct evidence of that complexity.

### 5.2 Composition Statistics

| Capability category | # Task environments | # Stages (median) | # Input files (median) | # Corruptions (median) | # Line formats | Base 27B P@1 | Frontier P@1 |
|---------|-----------|-------------|--------------|------------|---------|-------------|----------|
| Math & Science | 264 | 6 | 8 | 1 | 7 | 0.04 | 0.31 |
| ML | 242 | 6 | 12 | 1 | 11 | 0.03 | 0.24 |
| Coding & System | 664 | 6 | 14 | 3 | 19 | 0.03 | 0.30 |
| **Tev-Gym (total)** | **1,170** | **6** | **12** | **2** | **15** | **0.03** | **0.29** |

Other key numbers:

- **Balance**: the normalized entropy score $\mathrm{Balance}=\exp(H)/K$ reaches **0.89** across the three capability categories and **0.91** across the seven domains (1 means perfectly uniform).
- **Horizon**: the median environment horizon is 6 workflow stages (range 3–12), 8 progress nodes, 6 reward components, and 2 injected corruptions (range 1–7). The agent-facing input has a median of 12 files (up to 501), 51 KB in total (up to 6.1 MB), spanning 23 line formats (32 extensions), and the task prompt has a median of 583 tokens (Qwen tokenizer, max 944).
- **Base model behavior**: under the training harness, an untrained Qwen3.8-27B uses a median of 19 tool calls per rollout and generates 30k tokens, and **52% of rollouts exhaust the 65,536-token context before submitting**.
- **Difficulty**: under a single-rollout probe, **only 3.2% of environments are fully solved** (mean scored fraction 0.06). This shows that pure terminal reward is near zero on the vast majority of the corpus — exactly the regime Section 3 targets.
- **Frontier reachability**: on a subsample of 92 environments, Gemini 3.6 Flash reaches pass@1 of 29% and pass@8 of 40%. But on 26 of those environments (plus 52 additional environments probed at the small/full tiers), **it solves none of them**, and submits an answer in at most 29% of rollouts. **A substantial portion of Tev-Gym as currently written is beyond the reach of frontier models.**

### 5.3 Decontamination

- **No environment** in Tev-Gym shares any 13-gram or 8-gram with any task in ALE-CM, TB 3.0, TB 4.0, or TB 2.1.
- The median nearest-neighbor prompt Jaccard similarity from evaluation tasks to the dataset: **0.13** for TB 3.0/4.0 and **0.22** for ALE-CM, versus 0.24–0.25 and 0.28 when comparing tasks within the same benchmark.
- More fundamentally, there is **structural decontamination**: because the latent world is generated programmatically with a seed, any two environments have different public trees, and none of them is shared with an evaluation instance.

---

## 6. Detailed Tutorial: How to Reproduce the Tev-Gym Method

The paper **has not released the Tev-Gym code or data** (the Code and Data buttons on the project home page are still marked "soon"); **only the model weights have been released**. So the tutorial below is a **method reproduction guide** — implement an equivalent pipeline yourself following the paper's description — rather than an out-of-the-box script.

### Step 0: Prepare the Environment

```bash
# Python 3.10+，建议用 uv 或 venv
python3 -m venv .venv && source .venv/bin/activate
pip install numpy pandas scipy pytest

# 确认你的环境是「纯 CPU 可执行」的，这是可行性过滤的要求
python3 -c "import pandas, numpy; print(pandas.__version__, numpy.__version__)"
```

The toolchain must be declared in each environment's public contract (for example `python3`, `sqlite3`), and the agent's workspace initially contains only the public tree.

### Step 1: Write the Generator (the core of Stages 1–4)

A generator is a **seeded pure function**: `make_world(seed, scale_tier) -> World`. It must do the following:

```python
import random, hashlib

def make_world(seed: int, tier: str = "unit"):
    """生成潜在世界 W。必须是 seed 的纯函数，无副作用，无模型调用。"""
    rng = random.Random(seed)

    # 规模档位决定 |W|
    n_customers = {"unit": 30, "small": 240, "full": 480}[tier]
    n_tx_per_month = {"unit": 48, "small": 480, "full": 960}[tier]

    world = {
        "customers": [
            {"id": f"C{i:05d}", "name": f"cust_{i}"}
            for i in range(n_customers)
        ],
        "products": [
            {"id": f"P{i:05d}", "sku": f"sku-{i:04d}", "price": round(rng.uniform(1, 500), 2)}
            for i in range(n_tx_per_month)
        ],
        "transactions": [],
    }

    # ---- 不变量校验（阶段 1）----
    assert len({c["id"] for c in world["customers"]}) == n_customers, "ID 必须唯一"
    assert all(t["qty"] > 0 for t in world["transactions"]), "度量必须有限"

    # ---- 缺陷计划（阶段 1）：精确指明要损坏什么 ----
    defect_plan = {
        "operators": ["duplicate_records", "missing_records", "schema_drift"],
        "targets": rng.sample(range(len(world["transactions"])), k=2),
    }
    world["_defect_plan"] = defect_plan
    return world
```

**Three hard disciplines**:

1. **Pure function.** Do not read time, do not read environment variables, do not call the network, do not call models. The same `(seed, tier)` must produce exactly the same world.
2. **The defect plan lives inside the world.** Corruption happens after rendering, and the plan is seed-derived — so "what was corrupted" is itself part of the world and can be independently reconstructed.
3. **Do not import verifier code.** This is a requirement of the role-independence gate; the scoring stage will later check that the code closures are disjoint.

### Step 2: Define the Workflow DAG (Stage 2)

The DAG determines the horizon, and it also forms the skeleton of the progress potential.

```python
from dataclasses import dataclass

@dataclass(frozen=True)
class Stage:
    name: str
    depends_on: tuple[str, ...]      # 显式依赖
    weight: float                     # 进度节点权重
    parallel_with: tuple[str, ...] = ()  # 允许并行

WORKFLOW = (
    Stage("profile-sources",   (),                    0.15),
    Stage("reconcile-facts",   ("profile-sources",),   0.25),
    Stage("normalize-dimensions", ("profile-sources",), 0.15),
    Stage("load-facts",        ("reconcile-facts", "normalize-dimensions"), 0.20),
    Stage("aggregate-validate",("load-facts",),        0.15),
    Stage("package-sidecars",  ("aggregate-validate",), 0.10),
)

def critical_path():
    """最长依赖链 = 任务跨度。这是结构性的度量，不受 agent 绕路影响。"""
    memo = {}
    def depth(s):
        if s.name in memo: return memo[s.name]
        memo[s.name] = 1 + max([depth(d) for d in s.depends_on], default=0)
        return memo[s.name]
    return max(depth(s) for s in WORKFLOW)
```

The weights must sum to 1 (corresponding to $\sum_v w_v=1$ in Equation (3)).

### Step 3: Rendering and the Round-Trip Assertion (Stage 3)

```python
import csv, io, json, sqlite3, os, tempfile

def render(world, out_dir: str):
    """把 W 投影到公共接口。必须是 W 的纯函数，且能往返还原。"""
    os.makedirs(out_dir, exist_ok=True)
    with open(os.path.join(out_dir, "customers.csv"), "w", newline="") as f:
        w = csv.DictWriter(f, fieldnames=["id", "name"])
        w.writeheader()
        w.writerows(world["customers"])
    with open(os.path.join(out_dir, "products.csv"), "w", newline="") as f:
        w = csv.DictWriter(f, fieldnames=["id", "sku", "price"])
        w.writeheader()
        w.writerows(world["products"])
    # ... 其余格式：JSON / SQLite / safetensors / 基础设施清单 ...

def assert_roundtrip(world, out_dir):
    """从渲染出的文件精确恢复 W。这是整个方法的地基。"""
    with open(os.path.join(out_dir, "customers.csv")) as f:
        rows = list(csv.DictReader(f))
    recovered = {"customers": [{"id": r["id"], "name": r["name"]} for r in rows]}
    assert recovered["customers"] == world["customers"], "往返还原失败"
    # ... 逐个制品重复上述检查 ...
```

**This step is the bedrock of the whole method and must be asserted unconditionally at generation time.** If the round-trip does not hold, every downstream claim that "$s_0$ fully determines $W$" collapses.

### Step 4: Apply Reversible Corruption (Stage 4)

```python
def corrupt(world, out_dir):
    """按缺陷计划施加损坏。必须声明式、可逆。"""
    plan = world["_defect_plan"]
    for idx in plan["targets"]:
        op = plan["operators"][idx % len(plan["operators"])]
        if op == "duplicate_records":
            # 复制一条交易记录
            path = os.path.join(out_dir, "transactions.csv")
            with open(path) as f:
                lines = f.readlines()
            lines.append(lines[1])
            with open(path, "w") as f:
                f.writelines(lines)
        elif op == "missing_records":
            path = os.path.join(out_dir, "transactions.csv")
            with open(path) as f:
                lines = f.readlines()
            del lines[1]
            with open(path, "w") as f:
                f.writelines(lines)
        elif op == "schema_drift":
            path = os.path.join(out_dir, "customers.csv")
            with open(path) as f:
                lines = f.readlines()
            lines[0] = lines[0].replace("name", "full_name")  # 列名漂移
            with open(path, "w") as f:
                f.writelines(lines)
```

**The key point**: corruption must be **declared and reversible**. Only then does $s_0$ fully determine $W$, and only then can the correct answer be computed from what the agent sees.

### Step 5: Write the Strict Verifier and the Progress Scorer (Stages 5–6)

The two **must be two disjoint pieces of code**.

```python
# verifier.py —— 严格通过/不通过，只看最终产出
def verify(world, output_dir) -> bool:
    """对照 W 检查 agent 的输出文件。严格、确定性、无副作用。"""
    for path, checker in world["_verifiers"]:
        if not checker(world, os.path.join(output_dir, path)):
            return False
    return True

# progress.py —— 进度打分器，独立代码闭包
def partial_score(world, output_dir) -> dict:
    """对每个进度节点给出 [0,1] 的部分分数。"""
    return {v: checker(world, output_dir) for v, checker in world["_partial_scorers"].items()}

def progress_potential(world, output_dir) -> float:
    """式 (3)：前置依赖门控的加权求和。"""
    scores = partial_score(world, output_dir)
    gated = {}
    for v, s in scores.items():
        pre = world["_prereqs"][v]
        gated[v] = min([scores[v]] + [gated[p] for p in pre]) if pre else scores[v]
    return sum(world["_weights"][v] * gated[v] for v in scores)
```

The key implementation detail of prerequisite gating: **it must be computed in topological order**, because $\tilde{c}_v$ depends on the $\tilde{c}$ of its prerequisites, not merely on the raw scores.

### Step 6: Run the Eight Admission Gates

This is the step most easily skipped, and **the one that should least be skipped**.

```python
GAMING_PROBES = [
    "empty_output", "minimal_schema_valid", "copied_input",
    "single_seed_hardcode", "path_traversal", "private_lookup",
    # ... 补齐 14 种
]

def qualify(world, out_dir, reference_solver, alternative_solver):
    # 1. 奖励因果性：变异原因后，对应分量必须掉分
    # 2. 抗利用性：14 个作弊探针在 verifier 和 scorer 下都得 0
    for probe in build_gaming_probes(world, out_dir):
        assert not verify(world, probe)
        assert progress_potential(world, probe) == 0.0, f"{probe} 探针得分非零"
    # 3. 角色独立性：检查 import 闭包互不相交
    assert code_closures_disjoint(world)
    # 4. 求解器一致性：两个独立求解器必须产出相同输出树
    assert reference_solver(world) == alternative_solver(world), "规格未解决"
    # 5. 进度有效性
    assert 0.0 < progress_potential(world, partial_state) < 1.0
    # 6. 变形不变性
    # 7. 六种子多样性：>=6 个种子产出不同的世界身份/公共树哈希/任务 ID
    # 8. 公开契约卫生：prompt 与公共树中不含私有权威
    return True
```

**The solver-agreement gate is the most valuable of the eight.** When two independently written solvers give different answers for the same specification, the specification itself is ambiguous — in that case the environment should be rejected rather than left for the model to guess.

### Step 7: Implement the PPRS Reward

```python
import numpy as np

LAMBDA = 0.25  # 论文中所有运行均为 0.25

def rollout_reward(workspace_states, passed: bool) -> float:
    """
    式 (4)：R(τ) = 1[passes] + λ * Φ(s_T)

    注意 telescoping：Σ ΔΦ = Φ(s_T) - Φ(s_0) = Φ(s_T)，因为 Φ(s_0)=0。
    """
    phi_final = workspace_states[-1]
    return (1.0 if passed else 0.0) + LAMBDA * phi_final

def grpo_advantages(rewards):
    """式 (2)：组内相对优势值。"""
    r = np.asarray(rewards)
    return (r - r.mean()) / (r.std() + 1e-6)
```

**Three configuration points for training** (these are given explicitly in the paper, and they are the easiest to get wrong):

1. **Normalize advantages per turn index** (per turn), not per whole rollout (pooled). The former preserves credit for late turns.
2. **return-to-go with $\gamma=1$**, propagating progress credit back to earlier actions.
3. **$\lambda=0.25$**.

For contrast, here is the anti-pattern:

```python
# ❌ 反面：直接相加的奖励（论文消融里 S@1=0.29 但 P@1=0.06）
def bad_reward(workspace_states, passed):
    return (1.0 if passed else 0.0) + LAMBDA * sum(workspace_states)

# ❌ 反面：仅终止奖励（论文消融里 S@1=0.25，27B 上一个完整优化器 step 都走不出去）
def bad_reward2(workspace_states, passed):
    return 1.0 if passed else 0.0
```

**These two approaches look about the same on S@1, but the fully-solved rate P@1 stays pinned at the baseline level.** The paper's ablation table reveals the substantive difference between "shaping" and "adding" precisely through this gap.

### Step 8: Build the Corpus and Scale It

```bash
# 跨种子、跨规模档位批量生成，全程零模型调用
for seed in $(seq 1 1000); do
  for tier in unit small full; do
    python3 build_env.py --seed $seed --tier $tier --out data/envs/
  done
done

# 每个环境的中位生成成本：30 秒 CPU，无模型调用
```

**This is the engineering lever most worth borrowing from this paper**: the one-time cost of writing a generator is amortized across all of its seeds and scale tiers. And as the paper points out — moving toward having coding agents write the generators — this pipeline can be automated further.

### Step 9: Validate Generalization and Decontamination

```python
def decontamination_check(train_prompts, eval_prompts, n=13):
    """Tev-Gym 无任何环境与评测集共享 13-gram 或 8-gram。"""
    for name, ngram_n in [("13-gram", 13), ("8-gram", 8)]:
        eval_ngrams = set()
        for p in eval_prompts:
            eval_ngrams |= {tuple(p[i:i+ngram_n]) for i in range(len(p)-ngram_n+1)}
        for p in train_prompts:
            overlap = {tuple(p[i:i+ngram_n]) for i in range(len(p)-ngram_n+1)} & eval_ngrams
            assert not overlap, f"{name} 泄漏"
```

Also check **structural decontamination**: the public tree hashes of any two environments must differ, and none may be shared with an evaluation instance.

### Step 10: Evaluation

The paper's evaluation protocol is more rigorous than most papers' and is worth copying:

- **Agent time is measured, not estimated**: record the wall-clock time from the agent's first action to its last, including all model calls, retries, and intermediate command executions.
- **Budgets for comparison corpora must be loosened**: 28% of Tev-Gym rollouts use more than 60 tool calls, so for Tev-Gym the budget must be raised until it is no longer binding (the paper used 300 tool calls / 2 hours of wall-clock time).
- **Sampling should be stratified**: the paper draws a 100-environment subsample stratified across the seven domains from all 1,170 environments (seed 20260915).
- **Validate subset representativeness**: use Pearson correlation to check consistency between the CM subset and the full-set leaderboard performance (the paper reaches r=0.96 / r=0.97).

---

## 7. Summary: The Paper's Main Points and Conclusions

### Point One: The bottleneck for long-horizon agents is not the algorithm, it is data and reward

The paper's entire framework rests on one observation: **open models fail on long-horizon tasks mainly not because the optimization algorithm is not good enough, but because there is neither training data nor a workable recipe.**

The two bottlenecks are entangled: long tasks are hard to construct and verify, and the reward is extremely sparse. Solving them separately does not work — manufacturing data alone yields models that cannot be trained under sparse rewards, and designing dense rewards alone, without a world where "the correct answer is known," makes the potential score itself untrustworthy.

### Point Two: The right direction for synthesis is "working backwards from the answer"

This claim is more general than the paper's particular implementation.

> "Unlike pipelines that have a language model generate tasks, inputs, and checkers without real answers, our latent world serves as an exact answer book for reliable verification."

The paper places this in a mature family — constructing tasks backwards from known solutions: denoising, controlled error injection, code mutation, environment backtracking, instruction back-translation, and programmatic puzzle generation. But the difference is this: **those methods corrupt the ground truth of a single artifact, whereas Tev corrupts a rendering of the entire latent world.**

That difference yields a difference in atomicity: the task, the verifier, and the progress signal are all functions of the same world, so they cannot drift apart.

### Point Three: Progress rewards should be "provable" rather than "learned"

The mainstream dense-reward approach either trains a process reward model, or uses a learned judge, or uses a language model as judge. All of these introduce an extra model, extra bias, and extra training cost.

Tev's approach is: **because the latent world is defined before the task is generated, every correct intermediate state can be rendered directly and evaluated deterministically.** No critic, no judge, no manual step labels.

This is the most valuable methodological point in the paper: **it turns the question "where does the reward come from" from "how do we learn a reward model" into "how do we guarantee that ground truth is known."**

### Point Four: Reward shaping must deliberately deviate from "optimal-policy invariance"

Standard PBRS zeroes the terminal potential to guarantee optimal-policy invariance. PPRS keeps $\lambda\Phi(s_T)$ and **deliberately changes the optimization objective**.

This is an explicit acceptance of risk. The paper does not evade it; it discusses "what is preserved and what is not" in the appendix, and gives a bound on when preferences might invert under random policies.

**Many papers would hide such a deviation or pretend it does not exist; Tev puts it on the table.** That is a matter of research integrity.

### Point Five: In this field, data quality and data scale run in opposite directions

Table 1 reads in a very counterintuitive way:

| | SWE-Smith | Tev-Gym |
|---|---|---|
| Size | 50.1k | 1,170 |
| # Domains | 1 | 7 |
| Median agent time | 2.0 min | 12.4 min |
| Progressive reward | ✗ | ✓ |
| P@1 | 47% | 29% |

**Tev-Gym is only 1/40 the size of existing corpora, yet it supports the strongest results.** Because on long-horizon tasks, "the number of environments" stopped being the bottleneck long ago — **what matters is whether the environment contains verifiable intermediate states.**

This also explains why 1,170 environments can train a model that matches GPT-6 Astra, while 50,000 cannot.

### Point Six: Actionable lessons from the ablations

Three conclusions you can take away directly:

1. **Letting models write their own verifiers = 88% of groups discarded + 2.5× the compute + worse performance.** The time you save by using LLMs to generate checkers is paid back during training, at a higher price.
2. **The "shape" of a dense reward matters more than its "density."** Directly summing $\Phi(s_t)$ looks fine on S@1 (0.29), but P@1 does not move at all (0.06) — it repeatedly rewards high-potential states without propagating credit, so the agent circles around until it exhausts its context.
3. **The larger the scale, the more complete the collapse of pure terminal reward.** At 27B, the groups produced by terminal reward alone are almost all zero-advantage — **a full optimizer step cannot get out of them.**

### Conclusion

The paper's own conclusion paragraph is notably restrained:

> We present a latent-world-first approach to scaling verifiable long-horizon agent training. Each task is built backwards from a known-correct latent world, rendered into interrelated files, perturbed through controlled corruption, and reused for both exact verification and dense progress reward. We instantiate this method as Tev-Gym — 1,170 verified environments spanning seven domains — and show that training improves both 9B and 27B open models on ALE-CM, with gains transferring to Terminal-Bench tasks of differing horizons as well as to a 320B base model.

It also explicitly acknowledges its limitations:

> A limitation of the current work is its focus on synthetic terminal environments, and a remaining gap between our models and frontier agents on the hardest benchmarks. Supporting new workflows requires writing and validating additional environment components.

---

## 8. Decomposing the Design Philosophy

Abstracting the paper's approach to the philosophical level, I see five mutually supporting principles.

### Principle One: The Single Anchor Principle

An environment has exactly one source of ground truth. All artifacts — task, inputs, verifier, progress signal — are functions of it.

**This is what fights the entropy of "distributed generation."** When four components are produced by different processes, their joint distribution drifts; with a single common anchor, drift becomes structurally impossible.

**Corollary**: whenever you find yourself doing alignment work between "generate the task" and "generate the answer," consider doing it the other way around.

### Principle Two: Ground Truth Precedes Task

A task is not "generated"; it is "derived."

Before the agent era, that sounds flat. In the era of LLM-generated content, it becomes radical: **you are asking a model to produce a problem that requires an answer, in a place where the model itself does not know the answer.** In some sense, the whole Tev paper is a systematic critique of that practice.

### Principle Three: Determinism Over Learning

When a quantity can be computed deterministically, do not train a model to estimate it.

| Need | Common approach | Tev's approach |
|------|---------|---------|
| Judge whether a step is right | Train a PRM / learned judge | Render the correct intermediate state and score it deterministically |
| Judge whether the final result is right | Generate test cases | Check strictly against $W$ |
| Judge difficulty | Let the model try and score | Define structural quantities at generation time |

**The cost is that you must get the world right first.** That is why Tev invests heavily in six-seed diversity, dual-solver agreement, and role-independence auditing — **because once the potential is untrustworthy, the entire training chain is poisoned.**

### Principle Four: Gates Before Scale

Block out unqualified environments at generation time rather than relying on downstream RL to soft-filter them.

The paper explicitly contrasts this choice: "Unlike pipelines that skip verification and rely on downstream RL to soft-filter unsolvable tasks, we gate at generation time, because dense progress signals are only useful when they are strongly causal and resistant to gaming."

**This sentence is the most practically useful engineering advice in the paper.** Laziness on the data-generation side comes back on the training side as wasted compute and polluted signal — the Public-view verifier's 22.3 GPU-h/step in the ablations is the bill.

### Principle Five: Process as Artifact

The progress potential is defined as an explicit data structure of **node set + prerequisites + weights**, not as a black-box score.

The benefits go beyond interpretability:

- The DAG's critical path is directly the structural measure of the horizon
- Prerequisite gating naturally implements "if upstream isn't right, downstream gets no credit"
- Ablations can precisely control whether "the data changed" or "the reward changed"

**Only when a reward is explicitly modeled as a structure can it be audited, questioned, and decomposed.**

### A Hidden Philosophical Thread: From "Generating Content" to "Generating Worlds"

I think this is the deepest layer of the paper.

Over the past two years, the paradigm of AI content generation has been: **given a prompt, sample an output.** Every quality problem — hallucination, inconsistency, unverifiability — stems from one fundamental limitation: **there is no source of knowledge independent of the model.**

Tev's approach flips the paradigm: **given a complete and correct world, derive all artifacts.** The model steps back from "source of knowledge" to "solver of problems."

Under this framework:

- The hallucination problem becomes an engineering problem of "does the render round-trip?"
- Unreliable verifiers become a static-check problem of "do the code closures intersect?"
- Sparse rewards become a formal property of "is the potential function monotonic?"
- Difficulty control becomes two knobs: "scale tier × dependency depth"

**Every formerly vague AI problem gets converted into an engineering problem that can be proven, tested, and audited.** That is where "latent-world-first" is genuinely valuable — it is not just a more efficient data-manufacturing trick, it is a way of engineering AI system problems.

This also explains why Tev-Gym can win with only 1,170 environments: because **once a problem is correctly formalized, the importance of the "amount" dimension of data drops sharply.**

---

## 9. Limitations, Objections, and What to Watch

This is my own assessment, not the paper's self-description.

### Limitations the Paper Admits

1. **Focus on synthetic terminal environments.** It does not cover GUI, real live services, multi-agent collaboration, and similar scenarios.
2. **A gap remains on the hardest benchmarks.** Tev-27B's 0.10 on TB 4.0-CM versus Claude Opus 5's 0.52 is an order of magnitude apart.
3. **Supporting new workflows requires extra investment.** Every added domain means writing a generator, a verifier, and a scorer, and passing the eight gates. This is real human labor, and the paper does not quantify it.
4. **Code and data are not yet released.** The Code and Data buttons on the project home page are still marked "soon," and only the model weights are available. **This means the dataset quality currently cannot be independently verified, nor directly reused.**

### My Own Objections

**Objection one: Does $s_0$ really fully determine $W$?**

The paper's argument is: rendering round-trips + corruption is declared and reversible ⟹ $s_0$ fully determines $W$. But this derivation depends on "the set of corruption operators is closed, and the inverse of each operator is computable." If some operator (for example "category drift") is irreversible on certain data (two different original values mapping to the same drifted value), then strictly speaking $s_0$ determines only an **equivalence class** of $W$, not $W$ itself.

The paper mentions that "metamorphic transform" and "counterfactual" in the hidden suite are exactly meant to handle such ambiguities, but I think the determinism argument at the public-tree level still has boundaries.

**Objection two: Is a base P@1 of 0.03 too low?**

An untrained Qwen3.8-27B fully solves only 3.2% of Tev-Gym environments, with a mean scored fraction of 0.06. This is consistent with the reality that "long-horizon tasks are hard," but it also means: **most of the training signal comes from $\Phi$, not from "actually getting it right."** The model may be optimizing "the climbing path of the potential function" rather than "the task's correct solution."

The paper's metamorphic-invariance gate and stale-output counterfactual gate partly mitigate this (they directly target "shortcuts"), but the gap between "optimizing along the shortest climbing path of the potential function" and "genuinely understanding the task" is not directly measured.

**Objection three: The TB generalization result needs careful reading.**

The "CM" subsets of TB 3.0/4.0 are constructed **by having Claude judge whether each task belongs to the computational and mathematical domain**. Although the paper validates a high correlation between the subset and the full set (r=0.96 / r=0.97), this means the subset partitioning itself carries a frontier model's judgment. Evaluating a model against Claude using a subset constructed by Claude is somewhat circular — not fatal, but worth knowing.

**Objection four: The claim of matching frontier models on P@5 needs qualification.**

Tev-27B's P@5 = 0.28 matches GPT-6 Astra's and Claude Opus 5's 0.28, which is a very striking number. But:

- Tev-27B uses the Vanillux2 harness while frontier models use Codex / Claude Code, and **the harness itself hugely affects agent behavior**
- Frontier models have clearly higher S@5 on ALE-CM (0.58 vs Tev-27B's 0.54, and GPT-6 Astra's S@5/S@1 are both 0.58), showing that **frontier models are "more thorough on tasks they already get right"**
- The "saturated" shape of P@5 = S@5 = 0.28 means something different from Tev-27B's 0.16/0.28 (S@1/P@5) shape

**My judgment: this is a genuine and reproducible step forward, but the phrase "matches frontier models" should be read with a discount under cross-harness comparison.**

**Objection five: The scalability bottleneck will shift to "writing generators."**

The paper notes that Tev-Gym can be scaled further by having coding agents write the generators, with **no more model calls required**. But the generator code itself must pass the eight gates, and dual-solver agreement requires "two independently written solvers produce identical results" — **writing one generator by hand is easy; writing two independent solvers for it and guaranteeing they agree is much harder.**

When scale is pushed from 1,170 toward 10,000, the human capacity to review generators becomes the real bottleneck. The paper does not discuss this.

### What to Watch

1. **When code and data are released** — this is the most important window to watch. If released, the community can independently verify the real quality of the 1,170 environments.
2. **Whether it extends to non-terminal environments** (browser, GUI, real toolchains) — this determines whether "latent-world-first" is a trick specific to terminal tasks or a general paradigm.
3. **The cost curve** — how many person-hours does each new domain require? That number determines the method's scalable ceiling.
4. **The correlation between $\Phi$ and genuine problem-solving ability** — if one could directly measure "are trajectories with higher potential more likely to actually solve the task," that would answer my Objection two.
5. **The full evaluation of Tev-320B** — the paper only evaluated the 320B version on TB subsets; its performance on ALE-CM is unknown.

---

## 10. One-Sentence Summary

> **Let the model write its own exam, and it will get the answers wrong too.**
>
> Tev reverses the order: first have a complete and correct world, then derive the task, inputs, verifier, and progress scale from it. Because the answer is known by construction, verification is exact, intermediate states are free, and the training signal can be as dense as every single step.
>
> 1,170 environments, one 27B open model, Pass@5 of 0.28 on the computational and mathematical split of Agents' Last Exam, matching GPT-6 Astra and Claude Opus 5; and at the same time, zero-shot transfer to the never-before-seen Terminal-Bench 4.0 subset, with P@1 up 150%.
>
> Quantity was never the main contradiction in this field. **"Where does the answer come from" is.**

---

**Reference Links**

- Paper abstract: https://arxiv.org/abs/2610.18868
- Paper full text (HTML): https://arxiv.org/html/2610.18868v1
- Paper PDF: https://arxiv.org/pdf/2610.18868
- Project home: https://tev-agent.github.io/
- Project home repository: https://github.com/tev-agent/tev-agent.github.io
- Model weights Tev-27B: https://huggingface.co/gordonhu/Tev-27B
- Model weights Tev-320B: https://huggingface.co/gordonhu/Tev-320B
- Hugging Face paper page: https://huggingface.co/papers/2610.18868

**Further Reading**

- Agents' Last Exam (ALE): https://arxiv.org/abs/2509.04142
- Terminal-Bench: https://www.tbench.ai/
- Group Relative Policy Optimization (Shao et al., 2024): https://arxiv.org/abs/2402.12516
- Ng et al., 1999, Potential-based Reward Shaping: https://arxiv.org/abs/9901011
- DPPO (Qi et al., 2026): see the paper's references
- SWE-Smith (Yang et al., 2025): https://arxiv.org/abs/2504.21798

以上，既然看到这里了，如果觉得不错，随手点个赞、在看、转发三连吧，如果想第一时间收到推送，也可以给我个星标，谢谢你看我的文章，我们，下次再见。

首发于微信公众号「瑞哥观势」。
