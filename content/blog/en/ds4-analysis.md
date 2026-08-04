---
title: 'DwarfStar (ds4) Deep Dive: How antirez (Redis Creator) Built a Native LLM Inference Engine — a Vertically Integrated Solution for DeepSeek V4 Flash'
description: "A complete analysis of DwarfStar (ds4) by antirez (Salvatore Sanfilippo, Redis creator) — a small native inference engine purpose-built for DeepSeek V4 Flash/PRO and GLM 5.2. In ~65,000 lines of C it delivers Metal/CUDA/ROCm backends, SSD streaming, pipeline parallelism, DSpark speculative decoding, a native coding agent, and an OpenAI-compatible API as a single vertically integrated stack. 87 t/s prefill and 34 t/s generation on M5 Max; distributed prefill up to 674 t/s across two machines. From core ideas and architecture to design philosophy, full tutorial, feature list, and key takeaways."
date: "2026-08-04"
author: "TopDigg Research Team"
tags: ["DwarfStar", "ds4", "antirez", "DeepSeek V4", "LLM Inference", "Metal", "CUDA", "ROCm", "Local LLM", "Salvatore Sanfilippo"]
categories: ["Deep Dive"]
keywords: ["DwarfStar", "ds4", "antirez", "DeepSeek V4 Flash", "local inference", "LLM", "Metal", "CUDA", "ROCm", "Redis creator", "speculative decoding", "SSD streaming", "pipeline parallelism", "vertical integration"]
---

# DwarfStar (ds4) Deep Dive: How antirez (Redis Creator) Built a Native LLM Inference Engine — a Vertically Integrated Solution for DeepSeek V4 Flash

> Core idea: **Don't build a general-purpose inference framework — build the ultimate out-of-the-box experience for a handful of the strongest models.** DwarfStar (ds4) is antirez's (Salvatore Sanfilippo, Redis creator) new project: a small native inference engine written in pure C that is **deliberately narrow, deliberately deep** — model loading, prompt rendering, tool calls, KV state management, HTTP server, and coding agent are all built and tested as one unified stack. It exists solely for DeepSeek V4 Flash (primary target), DeepSeek V4 PRO, and GLM 5.2, providing three backends: Metal (the primary macOS target), NVIDIA CUDA (including multi-GPU DGX Spark), and ROCm (AMD Strix Halo). On consumer hardware — MacBooks, DGX Spark, Framework Desktop — it runs multi-billion-parameter open-source models with SSD streaming to break the memory ceiling. It represents antirez's complete thinking on local LLMs: **as models evolve, the toolchain should evolve too, rather than staying stuck in a generic but mediocre framework.**

---

## 1. Project Overview

### 1.1 What Is It?

**DwarfStar** is a **small native LLM inference engine** by antirez (Salvatore Sanfilippo), abbreviated **ds4**. It is **deliberately narrow** — not a general GGUF loader, but a **vertically integrated inference stack for specific models**:

- **Model loading** (GGUF format with routed-expert quantization)
- **Prompt rendering** (chunked prefill)
- **Tool calling** (native support)
- **KV state management** (with disk persistence)
- **HTTP server** (OpenAI / Anthropic compatible API)
- **Coding agent** (native in-process implementation)

— all of these are **built and tested as one unit**, not bolted together.

### 1.2 Key Facts

- Repository: `https://github.com/antirez/ds4`
- Stars: **20.4k**
- Forks: **1.8k**
- Author: **antirez** (Salvatore Sanfilippo, Redis creator)
- Created: 2026-05-06
- Last push: 2026-08-03
- License: **MIT** (retains GGML copyright notice)
- Language: **C** (core engine ds4.c is ~65,000 lines)
- Commits: 428
- Contributors: 11 (antirez leads with 281 commits)
- Supported models: **DeepSeek V4 Flash** (primary), **DeepSeek V4 PRO**, **GLM 5.2**
- Backends: **Metal** (macOS primary), **NVIDIA CUDA** (including multi-GPU), **ROCm** (AMD Strix Halo)

### 1.3 What Problem Does It Solve?

Plenty of local inference engines already exist (llama.cpp, MLX, vLLM...), but antirez saw a gap: **existing solutions are either too generic and not efficient enough, or too fragmented — each component tested in isolation, issues found only when assembled.** DwarfStar's answer: **build a complete bottom-to-top stack for a few of the strongest models** — loading, inference, API, agent all tested together in one codebase. This lets it squeeze higher efficiency on specific model × hardware combinations than generic frameworks can.

---

## 2. Core Ideas

### 2.1 Deliberately Narrow — "Specialized for a Few Models"

This is the fundamental divergence from llama.cpp and other general-purpose engines. llama.cpp tries to support all GGUF models; DwarfStar **deliberately rejects generality**: it exists solely for DeepSeek V4 Flash / PRO and GLM 5.2. The benefit is deep optimization for these models' specific architectures (routed MoE experts, particular quantization formats, KV cache structures) without maintaining compatibility layers for unknown models.

### 2.2 Vertical Integration — One Unit, Not Loose Fragments

The README states it plainly: **"Model loading, prompt rendering, tool calls, KV state, the HTTP server, and the coding agent are built and tested together."** This isn't about sharing a Makefile — it's about sharing state, memory layouts, and lifecycle management. For example, disk KV cache persistence (SHA1-keyed filenames) and the coding agent's tool replay (exact DSML replay) are tightly coupled — the agent can precisely resume a previous conversation state on restart.

### 2.3 Honest AI Disclosure — "This Software Was Built With AI; If That Bothers You, Don't Use It"

antirez writes in the README with rare candor: **"This software is developed with strong assistance from GPT 5.5, 5.6, Claude Fable and with humans leading the ideas, testing, and debugging. If you are not happy with AI-developed code, this software is not for you."** This transparency — placed prominently in the README body, not buried in a footnote — is uncommon in open source.

### 2.4 Built on llama.cpp's Shoulders, Not Forked From It

ds4 **does not link against GGML**, but it openly acknowledges it "exists thanks to the path opened by the llama.cpp project." It retains some GGML code (quantization layout tables, CPU quant/dot logic, certain kernels) under the MIT license, but the engine itself is independently written C code. This is the classic "stand on the shoulders of giants and do your own thing."

---

## 3. Architecture

### 3.1 Source Tree

```
ds4/
├── ds4.c                 # Core inference engine (~65,000 lines)
├── ds4.h                 # Public API header
├── ds4_metal.m           # Metal backend (~40,000 lines)
├── ds4_cuda.cu           # CUDA backend (~30,000 lines)
├── ds4_rocm.cu           # ROCm backend
├── ds4_server.c          # HTTP API server (~17,500 lines)
├── ds4_agent.c           # Native coding agent (~11,000 lines)
├── ds4_distributed.c     # Pipeline parallelism (~8,400 lines)
├── ds4_tp.c              # Tensor parallelism (~8,600 lines)
├── ds4_kvstore.c         # KV cache disk persistence
├── ds4_bench.c           # Throughput benchmark
├── ds4_eval.c            # Capability evaluation (92 embedded questions)
├── rax.c / .h            # Radix tree (tool replay map)
├── metal/                # Metal kernel code
├── cuda/                 # CUDA kernel code
├── rocm/                 # ROCm kernel code
├── gguf-tools/           # GGUF generation, imatrix, quantization tools
├── dir-steering/         # Directional steering data and vectors
├── speed-bench/          # Benchmark scripts and charts
├── tests/                # Test vectors and regression tests
├── Makefile              # Build system
├── download_model.sh     # Model download script
├── AGENT.md              # AI Agent instructions
├── CONTRIBUTING.md       # Contribution guide
└── QA_BEFORE_RELEASES.md # Release test matrix
```

### 3.2 Core Abstractions

- **`ds4_engine`**: a loaded model instance
- **`ds4_session`**: one inference timeline with live KV cache and logits
- **`ds4_backend`** enum: `DS4_BACKEND_METAL` / `DS4_BACKEND_CUDA` / `DS4_BACKEND_CPU`
- **`ds4_think_mode`** enum: `DS4_THINK_NONE` / `DS4_THINK_HIGH` / `DS4_THINK_MAX`
- **`ds4_distributed_role`** enum: `NONE` / `COORDINATOR` / `WORKER`
- **`ds4_tp_role`** enum: `NONE` / `LEADER` / `WORKER`

### 3.3 Session State Management

A key design choice: **the Session owns the live KV cache and logits**. Callers provide full token prefixes, and `ds4_session_sync()` reuses, extends, or rebuilds the graph state. Disk KV cache uses the **SHA1** of the rendered byte prefix as filename, enabling precise state recovery — the coding agent can seamlessly resume a conversation after restart.

### 3.4 Asymmetric Quantization

The quality guarantee: **only routed MoE experts are quantized** (to IQ2_XXS / Q2_K); shared experts, projection layers, and routing networks remain at original precision. Since routed experts dominate model size but are only partially activated per inference, this keeps quality high enough for reliable tool calling under coding agents.

---

## 4. Design Philosophy

### 4.1 "Narrow" Is a Feature, Not a Defect

In a world where "generality is virtue," DwarfStar goes the other way. antirez states explicitly: **"The idea of an inference system specialized for a few models."** He chose to optimize deeply for a few strong models rather than broadly for all models — this is why it outperforms general frameworks on DeepSeek V4 Flash.

### 4.2 Unified Testing Beats Loose Assembly

Every DwarfStar release goes through a complete QA matrix (`QA_BEFORE_RELEASES.md`), covering remote Metal / CUDA / ROCm machines. This isn't CI running checks — it's a human running the full test suite on real hardware. Model loading, inference, API, agent are all validated as one unit.

### 4.3 Honesty Over Polish

antirez prominently discloses AI involvement, marks the project as beta quality, admits it doesn't support general GGUF, and declares the distributed protocol has no encryption. This "state problems first, advantages second" style is uncommon in open source but invaluable for users — you know the boundaries without having to hit them yourself.

### 4.4 Standing on Shoulders Without Cloning

ds4 doesn't link GGML but openly stands on llama.cpp's shoulders. It reuses some code under MIT (quantization tables, kernels), but the engine is independently written. Classic "stand on giants and do your own thing."

---

## 5. Step-by-Step Tutorial

### 5.1 Build

```bash
make                  # macOS Metal (default)
make cuda-spark       # Linux CUDA, DGX Spark / GB10
make cuda-generic     # Linux CUDA, other local CUDA GPUs
make strix-halo       # Linux ROCm, AMD Strix Halo
make cpu              # CPU-only reference build (debug only)
```

### 5.2 Download a Model

```bash
./download_model.sh q2-imatrix     # 96/128 GB RAM machines, imatrix-tuned q2
./download_model.sh q2-q4-imatrix  # 96/128 GB, q2 + last 6 layers q4
./download_model.sh q4-imatrix     # >= 256 GB RAM machines
./download_model.sh mxfp4          # Native MXFP4 expert weights, ~156 GB
./download_model.sh pro-q2-imatrix # 512 GB RAM machines, PRO q2
```

### 5.3 CLI Usage

```bash
# One-shot prompt
./ds4 -p "Explain Redis streams in one paragraph."

# Interactive chat
./ds4

# Disable thinking
./ds4 --nothink
```

### 5.4 Start the Server

```bash
# Basic server
./ds4-server --ctx 100000 --kv-disk-dir /tmp/ds4-kv --kv-disk-space-mb 8192

# Multi-GPU multi-session batching (8x L40S)
./ds4-server --cuda --cuda-tensor-parallel \
  --gpu-vram auto \
  --gpu-devices 0,2,4,6,1,3,5,7 \
  --model "$MODEL" \
  --ctx 100000 \
  --batched-session 16 \
  --host 0.0.0.0
```

### 5.5 Start the Coding Agent

```bash
./ds4-agent --ctx 100000
```

### 5.6 SSD Streaming (Break the Memory Ceiling)

```bash
./ds4 -m ./ds4flash.gguf \
  --ssd-streaming \
  --ssd-streaming-cache-experts 32GB \
  --ctx 32768
```

### 5.7 Pipeline Parallelism (Cross-Machine Inference)

```bash
# Coordinator machine (layers 0-30)
./ds4 -m gguf/...-layers00-30.gguf \
  --role coordinator --layers 0:30 --listen 169.254.43.68 1234

# Worker machine (layers 31 to output)
./ds4 -m gguf/...-layers31-output.gguf \
  --role worker --layers 31:output --coordinator 169.254.43.68 1234
```

### 5.8 DSpark Speculative Decoding (Experimental)

```bash
./download_model.sh dspark-support
./ds4 -m ds4flash.gguf \
  --mtp gguf/DeepSeek-V4-Flash-DSpark-support.gguf \
  --dspark --temp 0
```

### 5.9 Benchmark

```bash
./ds4-bench \
  -m ds4flash.gguf \
  --prompt-file speed-bench/promessi_sposi.txt \
  --ctx-start 2048 --ctx-max 65536 --step-incr 2048 --gen-tokens 128
```

### 5.10 Capability Evaluation

```bash
./ds4-eval -m ds4flash.gguf   # 92 embedded evaluation questions (GPQA, AIME, COMPSEC)
```

---

## 6. Feature List

- **Three-model support**: DeepSeek V4 Flash (primary), DeepSeek V4 PRO, GLM 5.2
- **Three backends**: Metal (macOS primary), NVIDIA CUDA (multi-GPU), ROCm (AMD Strix Halo)
- **SSD streaming**: routed experts loaded on demand from SSD when model exceeds RAM
- **Pipeline parallelism**: split transformer layers across machines like an assembly line
- **Tensor parallelism**: dual-Mac Thunderbolt 5 RDMA or multi-GPU CUDA tensor parallelism
- **DSpark speculative decoding**: auxiliary draft model accelerates generation (experimental)
- **Native coding agent**: in-process, exact DSML tool replay, disk-persistent KV cache
- **OpenAI / Anthropic compatible API**: `/v1/chat/completions`, `/v1/completions`, `/v1/messages`
- **Disk KV cache**: SHA1-keyed, precise conversation state recovery
- **Three thinking modes**: Non-think / Think High / Think Max
- **Directional steering**: activation-level model behavior fine-tuning
- **Power management**: `--power N` reduces GPU power/heat
- **Benchmark tool**: `ds4-bench` throughput testing
- **Evaluation tool**: `ds4-eval` 92 embedded questions
- **Debug tools**: `--dump-tokens`, `--dump-logprobs`, `--dump-logits`, `--trace`

---

## 7. Key Takeaways

1. **"Narrow" is an underrated strategy.** In the arms race of general frameworks, DwarfStar chose to optimize deeply for a few models — and that's why it outperforms general frameworks on DeepSeek V4 Flash. "Less is more" in engineering isn't a platitude; it's a truth with boundaries.

2. **Vertical integration is the secret weapon for performance.** When loading, inference, KV management, API, and agent share a single state space, you get zero-copy memory, unified lifecycle management, and tight coupling that loose assemblies can't match. ds4.c at 65,000 lines isn't bloat — it's all state in one struct.

3. **SSD streaming breaks the "memory = ceiling" old assumption.** Routed experts dominate model size but are only partially activated per inference. DwarfStar exploits this: non-routed weights stay resident, routed experts load on demand from SSD. A 64 GB MacBook can run DeepSeek V4 Flash.

4. **antirez's transparency is a benchmark for open source.** Proactively disclosing AI involvement, beta quality, no general GGUF support, unencrypted distributed protocol — this "state problems first" style lets users know boundaries without hitting them.

5. **It stands on llama.cpp's shoulders without forking it.** ds4 doesn't link GGML, the engine is independently written, but it openly acknowledges standing on llama.cpp's path. Classic: respect predecessors without being constrained by them.

6. **Optimizing for specific hardware + specific models is the sweet spot for consumer local inference.** General frameworks compromise for all hardware and all models. DwarfStar optimized deeply for Metal + DeepSeek V4 Flash — delivering near-cloud inference on a 128 GB MacBook.

---

## References

- Repository: `https://github.com/antirez/ds4`
- Author: antirez (Salvatore Sanfilippo, Redis creator)
- Model weights: `huggingface.co/antirez/deepseek-v4-gguf`
- Model source: DeepSeek-AI (`huggingface.co/deepseek-ai/DeepSeek-V4-Pro`)
- Infrastructure: llama.cpp / GGML (Georgi Gerganov and contributors)
- AI assistance: GPT 5.5, 5.6, Claude Fable
- Contribution guide: `CONTRIBUTING.md`
- Release test matrix: `QA_BEFORE_RELEASES.md`