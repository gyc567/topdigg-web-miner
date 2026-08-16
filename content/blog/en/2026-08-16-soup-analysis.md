---
title: 'Soup: Fine-Tune an 8B LLM on a 4 GB Laptop GPU with This One-Command CLI'
date: "2026-08-16"
description: "An in-depth look at MakazhanAlpamys/Soup — a CLI-first LLM fine-tuning tool. Explore how Layer Streaming fine-tunes Llama-3.1-8B at 119.6 tok/s on a 4 GB GPU, how bit-exact testing proves correctness, why it chooses to refuse rather than warn, and the measurement-driven design philosophy behind it, complete with a full tutorial"
tags:
  - Soup
  - LLM
  - Fine-tuning
  - LoRA
  - QLoRA
  - Layer Streaming
  - Machine Learning
  - CLI
categories:
  - AI Tools
  - LLM Fine-tuning
  - Open Source
  - CLI Tools
  - Machine Learning
---

# Soup: Fine-Tune an 8B LLM on a 4 GB Laptop GPU with This One-Command CLI

## Background and Project Introduction

Training LLMs is still painful. Even experienced teams spend 30–50% of their time fighting infrastructure — SSHing into a broken GPU box, tuning batch sizes, installing drivers, trying quantization formats — instead of improving their models. **Soup** ([github.com/MakazhanAlpamys/Soup](https://github.com/MakazhanAlpamys/Soup)) is aimed squarely at that pain: a CLI-first LLM fine-tuning tool with a one-line pitch:

> **Fine-tune and post-train LLMs in one command. No SSH, no config hell.**

What actually put Soup on the map is its flagship feature, **Layer Streaming**: **fine-tuning an 8B model on a 4 GB laptop GPU** — measured at **119.6 tok/s with a 3.32 GB peak** for Llama-3.1-8B-Instruct + NF4 on an RTX 3050 Laptop 4 GB, **bit-exact** against a normal resident run. The result was independently reproduced on an H100 at 113.00 tok/s in the same 3.32 GB.

Soup is Apache-2.0 open source, Python 3.10–3.12, current version v0.73.2, distributed as the PyPI package `soup-cli`. It is built and maintained on a single 4 GB laptop — which is, the author says, **why every performance number in the docs is measured rather than claimed**. That measurement culture runs through Soup's docs, benchmark records, and paper alike.

## Project Overview

| Dimension | Detail |
|---|---|
| Positioning | CLI-first LLM fine-tuning / post-training tool (`soup-cli`) |
| Core pitch | One-command fine-tuning: `soup init --template chat` → `soup train` |
| Flagship feature | Layer Streaming: 8B fine-tune on a 4 GB GPU (NF4 + streaming, bit-exact) |
| Stack | Python 3.10–3.12, Typer CLI, Pydantic v2 config, Rich output |
| Core deps | 6 light deps (typer/rich/pydantic/pyyaml/huggingface-hub/plotext); training stack via `[train]` extra |
| License | Apache-2.0 |
| Current version | v0.73.2 |
| Hardware | CUDA (recommended), Apple Silicon MPS, CPU (experimental, very slow) |
| Models | Any HuggingFace text-generation model (`AutoModelForCausalLM`) + 100+ ready recipes |
| Paper | "Exact Layer Streaming: LoRA Fine-Tuning of an 8B Model on a 4 GB Laptop GPU" (Zenodo, v3) |

**Design premise:** the time, money, and skill required to fine-tune is holding back AI adoption. Soup's answer — automate everything, so "fine-tune a model" degrades into a routine operation any developer can run.

## Core Design Philosophy

### 1. "Every performance number is measured, not claimed"

Soup's most visible principle. Every performance claim has a corresponding **gate record** in `benchmarks/`, published **as written** — including failures, assumptions that turned out wrong, and numbers that were measured and then discarded. The benchmarks README puts it plainly:

> "These are not a report assembled after the fact. They are the working records kept while each item was built and verified, so they contain the failures, the assumptions that turned out wrong, and the numbers that were measured and then discarded — in the order those things happened."

This philosophy directly shapes the project's credibility structure: **no measurement, no claim.**

### 2. "Bit-exact is always two claims, never one"

When verifying streaming correctness, Soup insists on measuring and declaring the **forward** pass (logits, `torch.equal`) and the **backward** pass (every LoRA gradient tensor) separately. The reason is practical: in the H100 validation, the forward was bit-exact at every size up to 72B while the backward, pre-repair, was wrong above ~165 MiB per NF4 layer — the forward looked normal, the loss curve looked healthy, and the gradients were quietly wrong. Declaring just "bit-exact at 72B" would hide half the story. So its records mark, per row: which direction, which quantization, how many MiB per layer — and anything unmeasured is labeled "not tested" rather than left blank.

### 3. Refuse, don't warn

The training pre-flight refuses to run a configuration it predicts won't fit, rather than warning. This came from a brutal Windows lesson: on Linux, an over-budget step is a hard OOM; on Windows, WDDM **silently spills VRAM to host memory** and the run merely becomes an order of magnitude slower — measured at a 9.27 GB peak on a 4.29 GB card with **no exception raised at all**. Read as "streaming is slow," that would be exactly the wrong conclusion.

### 4. Print the cost, don't absorb it silently

When a 3B bf16 base can't be page-locked, Soup automatically falls back to a pageable store — but **explicitly prints the cost of that fallback** (GPU utilization dropping from 96.8% to 79.3%) instead of absorbing it silently. Likewise, when it detects Windows ignoring `expandable_segments:True`, it doesn't pretend the optimization is active.

### 5. Retraction culture: admit when a published explanation was wrong

Paper v3 **withdraws an explanation Soup itself had published** — "layer streaming is bound by host-to-device transfer, not by the GPU." That was an *inference* from the H100 replication and had never been measured. Measured on 11 August 2026, it is false at the published configuration: deleting every host-to-device byte buys **1.4%**, the compute stream waits on a copy for **0.20%** of the step, and the step runs at **71.3%** of that card's same-session GEMM ceiling. v1 and v2 remain citable and unedited — **the retraction is a new version precisely so that the record of what was claimed, and when, stays intact.**

### 6. The config schema is the single source of truth

`config/schema.py` (Pydantic v2, ~256 KB) is the single source of truth for every config field — CLI, pre-flight, and trainers all derive from it. Combined with the rule that heavy deps (torch/transformers/peft/trl) are lazy-imported inside functions, never at module top, `pip install soup-cli` stays a usable light core (no PyTorch) while the training stack loads on demand.

## Technical Architecture Deep Dive

### Source layout

```
src/soup_cli/
├── cli.py               # Main CLI entry (Typer, ~26 KB)
├── config/schema.py     # Pydantic v2 config schema (single source of truth)
├── commands/            # Subcommand implementations (adapters/train/eval/data/ship/...)
├── trainer/             # Trainer wrappers (SFT/DPO/GRPO/PPO/KTO/ORPO/SimPO/...)
├── data/                # Data format parsers, loaders, collators, validation
├── eval/                # Evaluation, soup ship gate, calibration, Elo arena
├── recipes/catalog.py   # 100+ model recipes (~89 KB)
├── registry/            # Model registry, hashing, storage
├── cans/                # "Soup Cans": reproducible experiment packing/running
├── autopilot/           # Zero-config auto fine-tuning
├── mcp_server/          # MCP server
├── monitoring/          # Training callbacks, progress display, HF push
├── plugins/             # Plugin system
├── migrate/             # axolotl / llamafactory / unsloth migration
└── cloud/               # Modal cloud GPU training
```

### How Layer Streaming works

This is the soul of Soup. The mechanism breaks down into four layers:

**Layer 1: what stays in VRAM, what streams out.** LoRA adapters + their gradients + optimizer state stay resident in VRAM (they're small). The **frozen base model lives in CPU RAM** (page-locked when the machine allows), streamed layer by layer: each decoder layer is copied into one of **two pre-allocated VRAM buffers** (double-buffering) on a dedicated CUDA stream, so the load **overlaps** the compute of the previous layer.

**Layer 2: why streaming costs time.** Each layer is read **twice** per step — once in the forward pass, once when the backward pass recomputes it, because `dL/dx = Wᵀ · dL/dy` needs the weights to reach the layers below. "That is physics, not an implementation detail." Measured cost: **1.43× slower than resident training** (at 0.5B, the only apples-to-apples comparison on the reference box, because 1.5B and above cannot run resident there at all).

**Layer 3: what NF4 quantization solves.** Quantizing the streamed base to NF4 shrinks the RAM store ~4× — an 8B base becomes ~3.6 GB of NF4 instead of ~16 GB of bf16. Two benefits: (1) bigger models fit in host RAM at all; (2) **the store fits under the machine's page-locked memory ceiling** (the reference box tops out at ~7.1 GB) — pinned host memory is what lets `copy_(non_blocking=True)` actually overlap with compute. The 3B bf16 base (5.55 GB) fell back to pageable and utilization dropped from 100% to 79.3%; at 1.43 GB NF4 it pins and utilization returns to 100%. The base is quantized **once, offline**, tensor by tensor, and cached; the shard cache is keyed to quantization/dtype/device/checkpoint fingerprint, so switching `none` ⇄ `4bit` re-shards rather than silently streaming the wrong bytes.

**Layer 4: correctness is not a tradeoff.** A streamed NF4 run is **bit-exact** against a *resident NF4* run (the same quantized bytes through the same bitsandbytes kernels) — and that's a **regression test**, not a one-off measurement.

### VRAM pre-flight and the refusal

Streaming bounds the **weights**. It does nothing for activations or the logits tensor, both of which scale with `batch × seq`. On a large-vocabulary model the second term dominates everything: on Qwen2.5-0.5B (vocab 151,936) at batch 8, S=512, the logits alone are **8.71 GB — 146× the entire layer-buffer pool (0.060 GB)**. So `soup train` predicts peak VRAM before building the model and **refuses a run it expects not to fit**:

```
peak VRAM    ~0.48 GB at batch 2 x seq 256 (logits 0.35 GB)
free VRAM    3.46 GB
forecast     5685-8361 tok/s — a compute-bound bound, not a promise
```

The predictor was fitted to ten real runs across two models, a 3.1× vocabulary contrast, batch 1–8 and two sequence lengths: **worst error 0.85%, and it never under-predicts** — the only safe direction for a number allowed to stop a run. The refusal names the two knobs that actually scale it (`training.batch_size`, `data.max_length`).

### Batch size vs gradient accumulation

Both work, and they are not interchangeable. Measured (Qwen2.5-0.5B bf16, S=256, pinned store, 50 steps):

| batch | accum | effective batch | throughput | peak VRAM |
|---|---|---|---|---|
| 1 | 1 | 1 | 556.6 tok/s | 0.842 GB |
| 1 | 4 | 4 | 540.1 tok/s | 0.846 GB |
| 4 | 1 | 4 | **1378.0 tok/s** | 2.28 GB |

Accumulation is **per-token I/O-neutral** — layer reads per 1000 tokens stay constant because `accum=N` re-reads the base N times *and* processes N times the tokens. What it buys is effective batch at **constant VRAM** (0.842 → 0.846 GB). At the same effective batch of 4, raising `batch_size` instead was **2.52× faster**. So the rule is: **raise `batch_size` until the VRAM pre-flight refuses, then accumulate for the rest** — Soup prints this advice when it sees you accumulating.

### The config-level rejection list

Under streaming, a long list of config combinations is **rejected at config load**, each naming the release that lifts it:

- `grpo`/`ppo` are refused **permanently**: generation rollouts re-read every layer once per generated token, which destroys the amortization streaming depends on
- `kto` with `batch_size: 1`: TRL's KL term is degenerate at batch 1
- `lora.use_dora`/`use_vera`/non-random init strategies: these initialize from the real base weight, which is on the meta device under streaming
- `packing`/`multipack`/`unfrozen_parameters`/`lisa_enabled`/`use_fsdp2_compile` etc.: each independently rewrites or re-freezes the same layers
- `stream_source`/`stream_buffers`/`stream_vram_override` set while `stream_layers: false`: a footgun, refused

### Preference losses over streaming: a free reference model

v0.72.4 opened streaming to DPO/ORPO/SimPO/KTO. The risk was one thing: DPO needs a reference model, and a second copy would double memory and defeat the point. Soup uses **the same streamed base with its adapters switched off** as the reference — measured at **0.914×** the SFT peak, where forcing a real second instance cost **+730 MB, exactly one copy of the weights**. Bit-exact against a normal non-streamed run for all four. Honest cost: free in *memory*, not in *time* — DPO reads the layer stack **1.52×** as often per step.

### The pre-Ampere fp16 fix

Until v0.72.3, the streaming store dtype was hardcoded to bf16 on **every** CUDA device — the entire free-notebook tier (T4/P100/V100/GTX 16xx/RTX 20xx) was streaming a dtype its GPUs have no compute units for, and nothing said so (it couldn't fail on the Ampere card every number was measured on). The critical detail: `torch.cuda.is_bf16_supported(including_emulation=False)` — the `including_emulation=False` keyword is **load-bearing**, because the bare call defaults to including emulation, and a T4 answers True. The first version of the fix asked the bare question and was therefore a no-op on exactly the hardware it targeted — found by running the proof notebook on a real T4, not by reasoning.

## Performance Data

### Streamed training measured (RTX 3050 Laptop 4 GB, Windows 11, LoRA, batch 1, 50 steps)

| Model | Quant | Seq | Throughput | GPU Util | Peak VRAM | RAM store |
|---|---|---|---|---|---|---|
| **Llama-3.1-8B-Instruct** | **NF4** | 512 | **119.6 tok/s** | 100% | **3.32 GB** | 3.60 GB pinned |
| Qwen2.5-3B | NF4 | 512 | 264.2 tok/s | 100% | 1.76 GB | 1.43 GB pinned |
| Qwen2.5-3B | bf16 | 512 | 143.1 tok/s | 79.3% | 2.15 GB | 5.55 GB pageable |
| Qwen2.5-1.5B | bf16 | 512 | 525.0 tok/s | 96.8% | 1.82 GB | pinned |
| Qwen2.5-1.5B | bf16 | 1024 | 487.6 tok/s | 96.7% | 2.96 GB | pinned |
| Qwen2.5-0.5B | bf16 | 512 | 978.6 tok/s | 91.4% | 1.47 GB | pinned |

**Headline: an 8B model fine-tunes on a 4 GB card at 119.6 tok/s in 3.32 GB.** At that rate, 1M training tokens is ~2.3 h (arithmetic from the measured rate, not a separate measurement).

### What bounds the streamed step (probe v0.73.0, H100 same-session)

- The streamed step runs at **71.3%** of the card's same-session GEMM ceiling
- Deleting every host-to-device byte buys **1.4%**; the compute stream waits on a copy for **0.20%** of the step
- The largest streaming-specific cost is per-layer NF4 dequantization, at **9.8%**
- Cut Cross-Entropy (CCE) triples the usable microbatch for **+9.6%**

### DeepSpeed comparison (H100, 8 cards)

- Streaming is **2.93× faster** than DeepSpeed ZeRO-3 offload in **9.7× less** VRAM
- One result that doesn't flatter them: **eight cards of ZeRO-3 are slower than one card training resident** — published anyway

## Feature Panorama

### Training tasks & methods

SFT, DPO/GRPO/PPO/KTO/ORPO/SimPO/IPO/BCO, tool-calling, PRM, pre-training, distillation, classification, vision/audio/TTS, unlearning, RAFT/RA-DIT — switched with one `task:` field. The PEFT family (LoRA/DoRA/LoRA+/rsLoRA/VeRA/OLoRA/NEFTune/PiSSA/ReLoRA/LLaMA Pro/GaLore/YaRN/LongLoRA) lives in `docs/peft-and-efficiency.md`.

### Data engineering

Alpaca, ShareGPT, ChatML, preference pairs (DPO/ORPO/SimPO/IPO/KTO), vision, audio, ASR, plaintext, embedding, RAFT — **auto-detected** from JSONL/JSON/CSV/Parquet/TXT, so in most cases you point `data.train` at a file and nothing else changes. Synthetic generation (forge), quality scorecards, remote datasets, mixing, and recipe DAGs are in `docs/data.md`.

### Serving & export

OpenAI-compatible server, Anthropic Messages endpoint, batch inference, GGUF/ONNX/TensorRT/AWQ/GPTQ/BitNet export, **speculative decoding** (train and measure your own draft model), deploy autopilot, Web UI, Agent Forge. `soup serve --model ./output` starts a server in one command.

### Governance & compliance

Adapter lifecycle management, model registry, **Soup Cans** (pack/run/publish reproducible experiments), the data flywheel `soup loop`, knowledge editing, steering, supply-chain controls (scan/sign/BOM/attest/audit/airgap). Compliance side: HIPAA/SOC2/EU-AI-Act/SR-11-7 `init` templates, provenance (BOM/attest/repro-receipt), audit log, air-gap, auto-generated model cards (`soup card`), CI gate (`soup ci init`).

### Backends & ecosystem

Default transformers, **Unsloth** via `[fast]` (2–5× faster), **MLX** for Apple Silicon via `[mlx]`, **Modal** cloud GPU training via `[modal]` (`soup train --cloud modal`), `soup mcp serve` MCP server, `soup autopilot` zero-config fine-tuning, experiment tracking (mlflow/swanlab/trackio), plugin system. It even offers **config migration** from axolotl / llamafactory / unsloth.

## The Release Gate: soup ship

`soup ship` answers one question: **did this model get better, or did I break it?** Two legs:

- **Leg 1 (task eval)**: run a task eval on your own data
- **Leg 2 (regression gate)**: a fixed, extraction-based scorer over seven bundled, offline suites (MCQ · arithmetic · tool-calling · JSON validity · safety/refusal) — **zero new deps**

```
soup ship --base ./base --adapter ./my-lora --task-eval my_task.jsonl
#   exit 0 = SHIP · 2 = DON'T SHIP · 3 = bad flags · 1 = runtime error
```

A tune that wins your task but quietly breaks tool-calling now gets a **DON'T SHIP**.

v0.73.2's fixes exposed the scorers' own traps:

- **`mini_tool_call` was ranking *brace hygiene***: the model emitted one closing brace short, the parse fell back to the inner object, and the scorer rejected it for lacking the outer key — a model that got it right 40/40 scored 0.225
- **`mini_mmlu` scored Llama-3.1-8B at 0.423 — below a 0.5B** — because the extractor did not know `\boxed{C}` and the prompt never asked for a letter. Fixed: 0.423 → 0.731
- **New: a benign-prompt axis.** Leg 2 only flagged a *drop* in refusal rate, so a tune that refuses everything read as a monotone safety improvement — two models with byte-identical scores on all seven suites, one refusing every benign request, were indistinguishable to the gate. `mini_over_refusal` is its mirror; paired with the safety suite, neither can be gamed alone
- **`--noise-floor N`**: re-runs the base model N times and refuses to call any delta smaller than the measured spread significant. Greedy decoding is not deterministic on GPU — same model, no adapter, five runs spread 0.015–0.020 against a 0.05 threshold, and four of six paired deltas sat inside the floor
- **A caller error was indistinguishable from a regression**: a non-callable generator scored 0.0 on three suites and raised on the others — and a 0.0 reads as "failed every item", i.e. it failed in the direction that looks like a finding

## Detailed Tutorial

### 1. Install

```bash
# Light core: CLI + config + data tools, no PyTorch
pip install soup-cli

# Add the training stack (torch, transformers, peft, trl, datasets, ...)
pip install "soup-cli[train]"

# Everything (train + serve + ui + data) in one shot
pip install "soup-cli[all]"

# Or from GitHub (latest dev)
pip install git+https://github.com/MakazhanAlpamys/Soup.git
```

> **Double quotes, not single.** `"soup-cli[train]"` is the only spelling that works in every shell — cmd.exe, PowerShell, bash and zsh. If you copied `'soup-cli[train]'` from an older tutorial and pip rejected it, that is the reason.

`soup init`, `soup data …`, and the data/inspection commands work on the light install. Fine-tuning (`soup train`) needs the `[train]` extra.

### 2. Create a config

```bash
soup init                       # interactive wizard
soup init --template chat       # or start from a template
```

Templates: `chat`, `code`, `tool-calling`, `medical`, `reasoning`, `vision`, `kto`, `orpo`, `simpo`, `ipo`, `bco`, `rlhf`, `pretrain`, `moe`, `longcontext`, `embedding`, `audio`.

### 3. Train, test, ship

```bash
soup train --config soup.yaml                 # LoRA, quantization, batching — all handled
soup chat  --model ./output                    # talk to your model
soup push  --model ./output --repo you/my-model

soup merge  --adapter ./output                              # merge LoRA into the base
soup export --model ./output --format gguf --quant q4_k_m   # GGUF for Ollama / llama.cpp
```

### 4. A complete soup.yaml

```yaml
base: meta-llama/Llama-3.1-8B-Instruct
task: sft
# backend: unsloth  # 2-5x faster, pip install "soup-cli[fast]"

data:
  train: ./data/train.jsonl
  format: alpaca
  val_split: 0.1

training:
  epochs: 3
  lr: 2e-5
  batch_size: auto
  lora:
    r: 64
    alpha: 16
  quantization: 4bit

output: ./output
```

`config/schema.py` is the single source of truth for every field.

### 5. Streamed 8B fine-tuning config for a 4 GB card

```yaml
base: meta-llama/Llama-3.1-8B-Instruct
task: sft
backend: transformers

data:
  train: ./data.jsonl
  format: alpaca
  max_length: 512
  val_split: 0.1

training:
  epochs: 3
  lr: 2e-5
  batch_size: 1           # explicit sizes required; "auto" rejected under streaming
  quantization: 4bit      # NF4 — ~4x smaller RAM store than bf16
  gradient_checkpointing: true     # handled per-layer by the streamer
  stream_layers: true     # Enable Layer Streaming
  stream_source: auto     # RAM with auto-fallback to NVMe disk
  stream_buffers: 2       # double-buffering
  lora:
    r: 64
    alpha: 16

output: ./output
```

### 6. Common commands

```bash
soup train  --config soup.yaml        # train (SFT/DPO/GRPO/PPO/KTO/ORPO/SimPO/...)
soup infer  --model ./output --input prompts.jsonl   # batch inference
soup chat   --model ./output          # interactive chat
soup serve  --model ./output          # OpenAI-compatible API server
soup merge  --adapter ./output        # merge LoRA into the base
soup export --model ./output --format gguf           # export for deployment
soup eval   benchmark --model ./output               # evaluate
soup data   inspect ./data/train.jsonl               # dataset stats
soup recipes list                     # 100+ ready-made model recipes
soup autopilot --model <id> --data d.jsonl --goal chat  # zero-config
soup doctor                           # check GPU / deps / environment
```

### 7. Troubleshooting

```bash
soup doctor    # GPU, system resources, dependencies, and version in one place
```

- **`ImportError: DLL load failed while importing _C` (Windows)** — reinstall PyTorch for your CUDA version: `pip install torch --index-url https://download.pytorch.org/whl/cu121`
- **`soup version` ≠ `pip show soup-cli`** — multiple Python installs; use a virtualenv

### 8. Use Docker

Run Soup without installing CUDA or PyTorch locally:

```bash
docker pull ghcr.io/makazhanalpamys/soup:latest
docker run --gpus all -v $(pwd):/workspace ghcr.io/makazhanalpamys/soup train --config soup.yaml
```

## The Fidelity Verification System

Soup's correctness verification is a full publication-grade protocol:

1. **Measurement records published as written**: every gate record in `benchmarks/` includes failures, disproven assumptions, and discarded numbers. `gate-v0.73.1` even carries **three readings withdrawn during the work** — two of which looked like the headline result
2. **The correctness reference always matches the numerics under test**: a streamed NF4 run is compared against a *resident NF4* run, never against resident bf16, which would hide a real defect inside quantization error
3. **Throughput is quoted with the SM clock it was taken at**: this card's boost clock varies ~13% between sessions, so a fraction-of-ceiling without its clock is meaningless; GEMM ceilings are measured same-session
4. **Derived figures are labeled as arithmetic**: "1M tokens = 2.3 h" is division, not a measured wall-clock run
5. **The correctness protocol runs in CI**: bit-exactness regressions fail CI rather than reaching a user
6. **Independent H100 validation** (gate-h100-validation.md): forward bit-exact to 72B; backward re-gated after the fix at 32B (256/256) and at 72B (320/320) — the size where the defect was worst. Carries three dated 2026-08-13 corrections, original lines left standing beside them
7. **The free Colab T4 as the weakest evidence**: one run, no repeats, no correctness comparison — "filed here because it is the only evidence the streaming path executes on a pre-Ampere card, not because it gates anything"

## Key Takeaways

1. **The hardware barrier is the biggest bottleneck to LLM fine-tuning adoption, and engineering can break it.** Soup proves "fine-tuning 8B needs 24 GB+" is an assumption software architecture can overturn — by replacing the resident base with layer-by-layer streaming, a 4 GB laptop becomes a legitimate training device. Not magic: 1.43× time cost buys the space.

2. **In LLM engineering, "bit-exact" must be two independent claims.** Forward exactness doesn't imply backward exactness — above ~165 MiB per NF4 layer the gradients silently went wrong while the loss curve looked healthy. Treating "correct" as one monolithic concept is how silent defects get a back door.

3. **The measurement culture is the infrastructure of credibility.** Publishing failed measurements, retracting your own explanations, and publicizing the awkward "8 cards slower than 1 card" result — these aren't posturing, they're the mechanism that lets a community reproduce and trust. Every number in the docs is traceable and re-measurable.

4. **Refusal is safer than warning.** On platforms that spill silently (Windows WDDM), a warning is a lie. The never-under-predicting pre-flight (worst error 0.85%) turns "can it run?" from a runtime accident into a load-time decision.

5. **The boundary of automation is honesty.** Soup auto-detects GPU, batch size, and quantization — but "auto" is rejected under streaming (it would OOM-probe a resident model streaming never loads), unusable features name the release that lifts them, and grpo/ppo are permanently refused with reasons. Automation is not unconditional trust in the config.

6. **A release gate must defend against regressions that *look like* improvements.** The scorers themselves were fooled by brace hygiene, `\boxed{C}`, and a safety model that refuses everything — the gate's enemy isn't bad models, it's **scorers that can't tell them apart from good ones**. The noise floor admits GPU greedy decoding itself spreads 0.015–0.020.

7. **Where hardware is limited, honesty beats ambition.** The author states plainly that the project is maintained on a 4 GB laptop and multi-GPU / Apple Silicon validation is hardware-blocked — so the work ships behind honest "requires \<hardware\>" gates, with help-wanted issues that say exactly what is blocked. Limitation isn't an excuse; it's the sorter for the roadmap.

## Use-Case Analysis

| Scenario | Fit | Notes |
|---|---|---|
| Students / individual devs | ★★★★★ | Streamed 8B on a 4 GB laptop or free Colab T4; zero SSH, no config hell |
| Vertical-domain rapid fine-tuning | ★★★★★ | One-command SFT + 100+ recipe templates (medical/code/tool-calling/compliance) |
| Preference alignment experiments | ★★★★☆ | Full DPO/ORPO/SimPO/KTO/IPO/BCO coverage; streaming reference model is free |
| Enterprise compliance fine-tuning | ★★★★☆ | HIPAA/SOC2/EU-AI-Act templates, BOM/attest/audit log/air-gap |
| Production deployment chain | ★★★★☆ | Serving/export/speculative decoding/registry/Cans packing, CI gate |
| Multi-GPU distributed training | ★★☆☆☆ | DeepSpeed/FSDP supported, but the author states multi-GPU validation is hardware-blocked |
| Pre-training from scratch | ★★☆☆☆ | Supported but not the main line; streaming covers SFT + four preference losses |

## Conclusion

Soup is a rare "small hardware, big idea" project: its pitch is "fine-tune an LLM in one command," but what really drives it is a full design philosophy about **credibility** — the measurement culture, the two-claims bit-exact protocol, refusal over warning, and retraction-style paper management. Layer Streaming itself is a beautiful piece of engineering accounting: it turns 8B training from a 24 GB GPU privilege into a 4 GB laptop routine, at a cost of only 1.43× time, with correctness nailed down by regression tests.

For the average developer, Soup's greatest value is probably this: **it turns "fine-tune a model" from a black box that takes a day of infrastructure wrestling into three commands.** For engineering practitioners, its `benchmarks/` directory and paper retraction record are themselves a template for "how to make an AI project worth trusting."

## References

- [Soup repository](https://github.com/MakazhanAlpamys/Soup)
- [Official site trysoup.dev](https://trysoup.dev)
- [PyPI: soup-cli](https://pypi.org/project/soup-cli/)
- [Paper: Exact Layer Streaming (Zenodo v3)](https://doi.org/10.5281/zenodo.21918325)
- [Measurement records benchmarks/](https://github.com/MakazhanAlpamys/Soup/tree/main/benchmarks)
- [4 GB proof notebook (free Colab T4)](https://github.com/MakazhanAlpamys/Soup/blob/main/notebooks/proof-4gb.ipynb)
- [Layer Streaming demo video (90s)](https://youtu.be/T1LCErE943E)
- [Soup Discord](https://discord.gg/8RgVbFA6Zq)