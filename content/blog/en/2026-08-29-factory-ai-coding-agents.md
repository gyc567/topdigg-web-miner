---
title: "How Coding Agents Complete Large Software Tasks: Factory AI Research Reveals Key Breakthrough"
date: "2026-08-29"
description: "Factory AI research reveals why coding agents stop early on large software tasks, and how adding an independent validation standard can dramatically improve completion rates from 36% to 90%."
author: "比特财商"
tags:
  - AI Agent
  - Software Engineering
  - Factory AI
  - ProgramBench
  - Research
categories:
  - Research
---

# How Coding Agents Complete Large Software Tasks: Factory AI Research Reveals Key Breakthrough

## Introduction

When AI wins gold medals at the International Mathematical Olympiad and breaks decades-old combinatorial optimization records, it's easy to believe AI coding is solved.

But the reality is: **AI models excel at problems with compact, stable criteria for success**. Large software tasks are fundamentally different—a software specification describes the desired outcome without specifying what must be run, inspected, and compared before the work is complete.

This gap is the core challenge facing coding agents today.

Factory AI's recent research dives deep into this problem: Why does the same model underperform on large-scale software reconstruction tasks? And why can introducing an "external executable completion standard" dramatically improve performance?

---

## 1. The Problem: Why Single Agents Stop Early

### 1.1 A Real Experiment

Factory AI designed a controlled experiment on ProgramBench:

**Task**: Rebuild GDAL (the de facto standard tool for geospatial data processing, active since 1998, powering QGIS, ArcGIS, and PostGIS, supporting 200+ raster and vector formats) from scratch.

**Conditions**:
- Single-agent mode: Droid implements independently, self-checks, and self-judges when done
- System mode: A Validator role establishes a "completion standard" first, then uses it to "grade" the Implementer's work

**Results shocked researchers:**

| Mode | Lines of Code | Behavioral Coverage |
|------|---------------|---------------------|
| Single Agent | 17,000 | **36%** |
| System (with independent standard) | 115,000 | **90%** |

Same model, same time, same execution privileges—the only difference was **whether someone established "what counts as done" before starting**.

The single agent didn't run out of budget or hit technical barriers. It stopped because "by its own assessment, it was done."

### 1.2 Root Cause: Local Validation Cannot Cover the Whole

Coding agents typically validate as they go: implement a piece, write a few checks, run them, inspect output, decide whether to continue. For small changes, this works—task, implementation, and evidence fit in one view.

But large tasks must be decomposed into features, subsystems, and successive rounds. As the agent reaches each piece, it also decides what evidence would count and whether that evidence is sufficient. **These checks inherit the scope of the work that produced them**. They can verify everything the agent planned to build, but exclude features, interactions, or constraints it never represented.

An agent can make steady, locally correct progress and stop with much of the outcome absent. The problem is not that it couldn't implement the rest—it **never established a complete account of what remained**.

---

## 2. Solution: Establish an External Executable Completion Standard

### 2.1 Three-Role System Architecture

Factory AI's system has three roles:

```
┌─────────────────────────────────────────────────────────────┐
│              Orchestrator                                    │
│  Delegates to Implementer and Validator, decides when to ship│
├──────────────────────────┬──────────────────────────────────┤
│    Implementer           │      Validator                   │
│  Investigates reference  │  Builds "completion standard"     │
│  Builds candidate        │  before implementation begins     │
│  Runs development loop   │  Tests against the standard       │
└──────────────────────────┴──────────────────────────────────┘
```

**Key Design: "The Wall"**

The instrument and raw results stay with the Validator; only clustered findings cross the wall to the Orchestrator. The Implementer never sees test cases or raw output: **once a sparse sample becomes visible, it becomes the target**, and passing it establishes those cases, not the space they were meant to represent.

### 2.2 How the Validator Builds the Standard

Establishing a complete outcome standard requires more than a requirements list. The system needs an inventory of what must be established, procedures for establishing each part, and current evidence that those procedures pass against the artifact being shipped.

Example from the GDAL instrument:

```python
D('hillshade.combined', ['raster', 'hillshade', '--variant', 'combined', 'dem.tif', 'out.tif'])
D('contour.levels', ['raster', 'contour', '--levels', '120,150,180', 'dem.tif', 'out.geojson'])
```

Grading policy: for every case, the runner executes oracle and candidate sequentially in the same sandbox path, same env, same fixture bytes—and byte-compares four channels: exit code, stdout, stderr, and full work-tree delta.

The validator wrote hundreds of such cases and licensed exactly two relaxations across all of them.

### 2.3 The Outer Loop

Once implementation starts, the loop goes:

```
1. Orchestrator chooses what should be measured
2. Validator tests current candidate and interprets failures
3. Orchestrator decides which findings are real and what work comes next
4. Implementer investigates the reference and advances the candidate
5. When meaningful differences disappear, Orchestrator asks Validator to expand weak areas
```

---

## 3. Experimental Results

### 3.1 Performance Across Three Models

Testing across 24 most challenging ProgramBench tasks with three frontier models:

| Model | Single-Agent Median | System Median | Gap Closed |
|-------|---------------------|---------------|------------|
| **Fable 5 (xhigh)** | 56.7 | **89.3** | **73%** |
| **Kimi K3 (high)** | 45.1 | **75.4** | **42%** |
| **GPT-5.6 Sol (max)** | 48.6 | **66.2** | **25%** |

Key numbers: **GDAL reconstruction: 36%→90%, 7-Zip: 54%→95%, DuckDB: 34%→80%**.

### 3.2 Key Insight

**Budget was not the bottleneck.**

System runs were far longer and more expensive—for GDAL, 14x the credits and 13x wall time. But budget wasn't what separated the conditions. **Every single-agent campaign ended because the agent decided to end it.** Additional compute does not help an agent that will not spend it.

What changed was the **judgment of completion**; the compute followed from that judgment.

---

## 4. Design Philosophy

### 4.1 Establish Validation Before Work

Establishing a whole outcome requires more than a list of requirements. The standard should be derived from the outcome before implementation narrows attention into individual work items. It need not remain frozen, but **the standard of completion must not quietly collapse around whatever has already been built**.

### 4.2 The Wall Prevents "Standard Pollution"

The boundary holds in both directions: the Validator can expand the instrument as it learns, but cannot weaken it to accommodate what the candidate happens to contain. The Implementer never authors, runs, or sees its cases. **Once a sparse sample becomes visible, it becomes the target**.

### 4.3 External Standard Matters More Than Model Capability

The single agent wasn't lacking skill. It was lacking a standard of completion. **An independent standard, authored by the same model, drove the implementation much closer to behavioral parity**. For large software tasks, the bottleneck is judgment, not implementation ability.

---

## 5. Key Conclusions

**Conclusion 1: AI excels at "compact standard" problems; large software tasks don't have compact standards.**

AI breakthroughs in math and constrained optimization happen because "success" can be fully defined and verified. But software tasks often have fuzzy completion criteria—requirements describe the outcome but not how to verify it.

**Conclusion 2: Single agents stop early not because of inability, but because they lack a "not-done list."**

The agent's local validations are reasonable at each step, but it never builds a complete picture of what remains undone. It doesn't know how much is complete—only how much it has done.

**Conclusion 3: An external Validator with a completion standard can produce a qualitative leap for the same model.**

Fable 5 going from 36%→90% on GDAL wasn't from a model upgrade—it came from "establishing a standard." For these tasks, the bottleneck is judgment, not implementation.

**Conclusion 4: The "Wall" design prevents standard contamination.**

If the Implementer could see test cases, those cases would become the target. Keeping the Validator's instrument invisible ensures measurement integrity.

**Conclusion 5: This approach generalizes to real software work.**

Product tasks may draw standards from user-approved flows; migrations from the system being replaced. What generalizes is the need for **an external, executable completion standard—derived from the outcome, before implementation narrows attention, and kept current until work meets it**.

---

## Conclusion

The deepest insight from this research isn't a specific technical breakthrough—it's a **shift in cognitive framework**:

We used to think improving AI software tasks meant upgrading model code ability. But Factory AI's experiment shows the problem isn't "can it write"—it's **"does it know when it's done."**

The single agent wasn't lacking skill. It was lacking a completion standard.

When designing the next coding agent system, perhaps the question shouldn't be "how powerful is this model" but "does this system have an external, executable completion standard?"

Different answer, completely different architecture.
