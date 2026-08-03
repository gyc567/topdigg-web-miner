---
title: "Kimi K3 × AMD MI355X Deep Dive: Is Memory the Moat?"
description: "A comprehensive analysis of Wafer AI's engineering blog on serving the 2.8T open-source model Kimi K3 on AMD MI355X at 952 tok/s/node. From the core 'memory is the moat' thesis, to speculative decoding and AITER prefill optimization, to the MI355X crushing B200 with 48 tok/s/$, this article explains why memory capacity gave AMD a measurable edge over NVIDIA at the 2.8T model scale — and whether the CUDA moat is really dying."
date: "2026-08-03"
author: "TopDigg Research Team"
tags: ["Kimi K3", "AMD", "MI355X", "Moonshot", "GPU Inference", "MoE", "Speculative Decoding", "ROCm", "Wafer AI", "Open Source Model", "Performance per Dollar"]
categories: ["Deep Dive"]
keywords: ["Kimi K3", "MI355X", "AMD", "Moonshot AI", "Wafer AI", "Memory is the moat", "Performance per dollar", "Speculative decoding", "AITER prefill", "ROCm", "B200", "B300", "Open source LLM", "GPU inference", "MoE"]
---

# Kimi K3 × AMD MI355X Deep Dive: Is Memory the Moat?

> Core insight: **Memory is the moat.** As open-source models balloon — from GLM-5.2's 753B, DeepSeek V4-Pro's 1.6T, all the way to Kimi K3's 2.8T parameters — the critical bottleneck for inference is no longer raw compute, but who can fit "model weights + KV cache" into VRAM. AMD's MI355X, with 288GB of HBM and a price roughly 2.4× cheaper than the B300, turns its advantage over NVIDIA into something **measurable, practical, and quantifiable** — for the first time, on a 2.8T model.

---

## 1. Project Overview

### 1.1 What Is This Article About?

This is a technical blog post titled *"Is memory the moat?"* by **Wafer AI** (a YC S25 AI inference-optimization startup), written by Ian Ye, published on July 31, 2026. It documents how the team served the open-source model **Kimi K3 (2.8T parameters)** on **8 AMD MI355X GPUs at 952 token/s/node**, and compares it against NVIDIA's B200 and B300 in a rigorous throughput-and-cost benchmark.

This is more than a "we ran the model" proof — it's the convergence of three forces:

1. **Moonshot AI** — releasing an open-source model of unprecedented size;
2. **AMD** — proving that ROCm can serve frontier models at production level without the CUDA ecosystem;
3. **Wafer AI** — using its in-house agent-based optimization to squeeze maximum value-per-dollar out of the MI355X.

### 1.2 The Three Protagonists: Model, GPU, Platform

**Protagonist 1: Kimi K3 (a 2.8T-parameter sparse MoE open-source model)**

Kimi K3 is Moonshot AI's sparse Mixture-of-Experts model: 2.8 trillion total parameters, but only ~104 billion activated per token. It claims to open a **new era for open source** — not just because its intelligence approaches top closed models, but because it pushes the ceiling of "how big can an open model be" to the 3T level.

- Total parameters: **2.8T**
- Activated parameters: **~104B per token**
- Context length: **1M tokens** (1,048,576)
- Architecture: MoE + long-context attention optimizations
- Open-sourced: full weights released

**Protagonist 2: AMD MI355X (a 288GB CDNA accelerator)**

The MI355X is AMD's Instinct-series accelerator built on the CDNA 4 architecture (GFX 9). Each card packs **288GB of HBM3** with ~**8 TB/s** memory bandwidth. For ultra-large models that "don't fit," its capacity is the killer feature.

- Memory: **288GB HBM3**
- Released: June 2025
- Positioning: the **non-NVIDIA alternative** to Blackwell (B200/B300)

**Protagonist 3: Wafer AI (inference optimization startup)**

Wafer AI is a Y Combinator S25 startup offering serverless inference with "AI agents that automatically optimize GPU kernels." It provides OpenAI-compatible inference APIs for open models like Qwen, GLM, DeepSeek, and Kimi, with the philosophy "Maximize intelligence per watt." This article is its proof-point blog post.

### 1.3 Why This Article Matters

In a field dominated by CUDA/NVIDIA for over a decade, the combination of "a Chinese open-source 2.8T model + AMD GPUs + an inference optimization startup" is one of the sharpest challenges yet to the consensus that the CUDA moat is unbreakable. What's rare: this post is **not empty marketing — it's a first-hand engineering record with numbers, root-cause analysis, and fix code**.

---

## 2. Core Idea: Memory Is the Moat

### 2.1 The Overlooked Variable: Models Are Getting "Fatter"

The article opens with a trend in progress: **model capability is rising, but model size is rising faster.**

- GLM-5.2 has **753B** (0.75T) parameters;
- DeepSeek V4-Pro reaches **1.6T** parameters;
- Kimi K3 jumps straight to **2.8T** parameters.

Bigger parameters mean more expensive, harder deployment. Serving Kimi K3 requires over **1.5TB of VRAM** — before even allocating the KV cache for a 1M-token context.

### 2.2 The Few Paths to Serve Kimi K3

To run Kimi K3 in a datacenter, operators have only three realistic options:

- **One 8-GPU B300 node**: 288GB per GPU, fits — but extremely expensive;
- **Two 8-GPU B200 nodes (16 GPUs total)**: split as TP16, but pays a cross-node communication penalty;
- **One 8-GPU MI355X node**: also 288GB per GPU, fits, and far cheaper.

Note: besides the B300, the **only non-NVIDIA GPU with 288GB is AMD's MI355X**. That's the punchline of the article's title — **when a model gets big enough that it "must span nodes," memory capacity itself becomes the barrier.**

Under this logic, the MI355X is not the "performance king" — it's the "**capacity king**."

### 2.3 MI355X's "Capacity Crush" Over the B200

- A single **8×MI355X node** provides ~**2.3TB** VRAM, fitting Kimi K3 (weights + 1M-token KV cache) at TP8 on one node;
- A single **8×B200 node** provides only ~**1.5TB**, which can't fit — forcing an expansion to **TP16 across two nodes**.

This "doesn't fit" wrinkle exposes the B200's weakness: **cross-node communication overhead**. The B200 must run cross-node all-reduce (RoCE v2 at ~195 Gb/s) on the decode critical path, while the MI355X handles it on a single node.

> Wafer's phrasing is pointed: "The cross-node penalty is the B200's only config disadvantage — but **that's exactly the point**: the MI355X's VRAM capacity advantage translates into measurable, practical gains for the first time at Kimi K3's scale."

### 2.4 The Numbers: MI355X vs B200 vs B300

On a 1,024-token input / 400-token output benchmark, measured per node (prices per public GPU market rates):

- **Single-stream decode**: MI355X **118 tok/s**, B200 90 tok/s, B300 172 tok/s
- **Peak aggregate throughput / node**: MI355X **952 tok/s**, B200 ~249 tok/s (498 total over 16 GPUs split across 2 nodes), B300 1,568 tok/s
- **Peak aggregate / single GPU**: MI355X **119 tok/s**, B200 31 tok/s, B300 196 tok/s
- **Peak per $/GPU-hr (performance per dollar)**: MI355X **48 tok/s/$**, B200 7 tok/s/$, B300 33 tok/s/$

> **Conclusion:** On "aggregate throughput," the B300 still leads the MI355X by ~1.65×; but on "throughput per dollar," the MI355X (48) beats the B300 (33) by ~1.45× and crushes the B200 (7) by ~**7×**. The performance-per-dollar king is unquestionably the MI355X.

Reference public prices: MI355X ~**$2.50/GPU-hr**, B300 ~**$6.00**, B200 ~**$4.25**.

---

## 3. Technical Architecture & Practice: Running Kimi K3 on the MI355X

### 3.1 The Good News: Day-0 Support

Wafer notes a premise many overlook: Kimi K3 has **Day-0 support on AMD** — it runs on ROCm the day the weights dropped. This stems from a deep AMD × Moonshot partnership (in the Kimi 2.6 era they co-designed UMBP, KV-cache scheduling, and the AITER long-context accelerator). So Wafer's work wasn't "can we run it," but "how do we squeeze out the throughput."

### 3.2 Speculative Decoding

- Kimi K3 ships **without any draft tensors** (no MTP, no EAGLE);
- The only viable path is an **external block-diffusion draft**: RadixArk's **Kimi-K3-DSpark**;
- On CUDA it works out of the box — but on ROCm it hits its first bug:

```text
NameError: name 'top_k_renorm_prob' is not defined.
```

### 3.3 Fixing the Bug: Not a Missing Kernel, a Missing Definition

This is the best engineering post-mortem in the article. Wafer's investigation:

- sglang's accept-sampling verifier has two ways to build the target distribution:
  - **dense path**: calls `top_k_renorm_prob`;
  - **sparse fast path**: routes straight through `torch.topk`.
- The CUDA build imports `top_k_renorm_prob` from `sgl_kernel`; but the **ROCm build only aliases a top-p kernel, leaving `top_k_renorm_prob` undefined** — because there's no top-k renorm kernel on gfx950 to alias.
- So the moment a request hits the dense path, the verifier throws `NameError` and takes the whole scheduler down with it.

**The fix**: top-k renorm is a tiny operation — keep the k highest entries of the model's probability vector, zero the rest, rescale to sum to 1. A `sort`, a `masked_fill`, a divide — that's it. Wafer just dropped it into sglang's ROCm sampling branch, replicating what the CUDA build gets from `sgl_kernel`. No custom kernel needed.

> Key lesson: **when you hit an error on ROCm, your first instinct is "we need a custom kernel" — but often it's just "a missing definition."** This was an undefined function name — the problem wasn't "no kernel," it was "something wasn't exported."

**Optimization gains** after fixing and hardening speculative decoding:

- ~**2.2×** single-stream throughput;
- ~**1.7×** per-stream at moderate load;
- **+18%** peak aggregate throughput;
- More importantly, peak aggregate throughput landed at **higher concurrency** (c64 vs c24 without speculation) — closer to real production.

### 3.4 Prefill Optimization: decode tok/s Is "Fool's Gold"

The article's sharpest observation: **decode tok/s is often "fool's gold" — glorified, while the time-to-first-token (TTFT), what users actually feel, gets overlooked.**

**The baseline**: an identical 172k-token cold prefill takes ~**51s** on the MI355X vs ~**23s** on the B300. For 1M-context models, many workloads have huge (sometimes cold) prefills — a few minutes of prefill can idle entire fleets of nodes.

**Root cause: one kernel.** Kimi K3 on ROCm fell back to slow generic Triton attention because the **fast AITER MLA prefill kernel failed to load**. The cause was a **shape mismatch**, not a missing kernel:

- K3 at TP8 gives **12 attention heads** per rank;
- AITER's MLA path only supports multiples of 4, 8, or 16.

**The fix**: zero-pad the head count from **12 to 16**, run the fast kernel, then extract the real 12 heads from the output.

**Result**: on the same 172k cold prefill, the AITER MLA prefill runs at ~**13k tok/s** steady-state (vs Triton fallback's ~4–7k tok/s) — a **~2–3× prefill speedup**. It doesn't change aggregate throughput (decode is unchanged); it changes **how long users wait for the first token**.

---

## 4. Tutorial: Deploying and Optimizing Kimi K3 on AMD MI355X

Here's Wafer's approach as reproducible steps (environment: 8×MI355X, TP8, ROCm, sglang).

### 4.1 Step 1: Prepare the Environment

```bash
# Install ROCm and sglang
pip install --upgrade sglang[rocm]

# Pull Kimi K3 weights
huggingface-cli download MoonshotAI/Kimi-K3 --local-dir ./backend
```

Confirm your ROCm version and GPU are detected correctly (CDNA 4 / gfx950).

### 4.2 Step 2: Launch the Server (TP8)

```bash
python3 -m sglang.launch_server \
  --model-path ./backend \
  --served-model-name kimi-k3 \
  --tensor-parallel-size 8 \
  --max-model-len 1000000 \
  --reasoning-parser kimi-k3
```

### 4.3 Step 3: Enable Speculative Decoding

```bash
# Kimi K3 needs an external draft model, so add:
  --speculative-algorithm block \
  --draft-model RadixArk/Kimi-K3-DSpark
```

(Prerequisite: fix the `top_k_renorm_prob` definition from 3.3 first.)

### 4.4 Step 4: Validate and Benchmark

```bash
# Test TTFT and generation speed with curl
curl -X POST http://localhost:8119/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{"model":"kimi-k3","messages":[{"role":"user","content":"Explain MoE architecture in one sentence"}],"max_tokens":200}'
```

Watch the time-to-first-token and total tok/s to confirm you're hitting the fast AITER prefill (otherwise apply the 12→16 head padding).

---

## 5. Benchmark Results: Let the Numbers Speak

### 5.1 Wafer's Measurements: MI355X vs B200 vs B300 (serving Kimi K3)

Full data in 2.4. Here's the **one-sentence takeaway**:

- **Performance per dollar**: MI355X **48 tok/s/$** — ~**7×** the B200 (7) and ~**1.45×** the B300 (33);
- **Aggregate throughput**: the B300 (1,568) is still #1, but the MI355X (952) covers the vast majority of production scenarios;
- **Single-stream experience**: MI355X 118 tok/s (about 31% better than B200), below B300's 172 tok/s.

### 5.2 Key Insight: Why Memory Capacity Became the Decisive Factor

- The B200 is forced to **TP16 across two nodes** to fit Kimi K3, dragging cross-node all-reduce onto the decode critical path;
- The MI355X fits "weights + 1M-context KV" at **TP8 on one node** with no cross-node penalty;
- Therefore: **the capacity advantage (288GB) directly converts into comparable, measurable performance and cost advantages.**

---

## 6. Design Philosophy: Why "Memory Is the Moat" Is True in 2026

### 6.1 The Model-Size Arms Race Favors "Big Memory"

Kimi K3's 2.8T is an **arms race** of "bigger is stronger, stronger is bigger." The bigger the model, the more it demands cards with large memory — which is exactly where AMD steps in: **fighting on "can you fit it + cost per token" rather than peak FLOPs.**

### 6.2 AMD: Not Chasing Performance, but "Capacity + Cost"

AMD has lagged CUDA on software for years, but this time it changed the game:

- **Not competing on single-card compute**, but offering **288GB of memory + 2.4× cheaper**;
- **Doubling down on ROCm with Day-0 support** — familiar models work from day one;
- Redefining "who gets to serve frontier models" with "capacity × cost."

### 6.3 Export Controls Favor AMD — Ironically

There's a big backdrop: **high-end NVIDIA chips are export-restricted to China** (H100/B200-class products fall under "presumption of denial"). This forces Chinese AI teams to find alternatives:

- **AMD** becomes the "cost-effective, legal" option — cheaper, less regulatory scrutiny, not in the harshest denial tier;
- So "**Chinese frontier models + AMD cards + cost-sensitive startups**" forms a **virtuous cycle**: bigger models need bigger memory → AMD offers cheap large capacity → more teams adopt AMD → more vendors invest in ROCm optimization → the software gap closes faster.

### 6.4 Wafer's Ultimate Claim: Agent Optimization Is Ending the "CUDA Monopoly"

- Wafer's belief: instead of waiting for CUDA kernels to be handed to you, **use AI agents to automatically optimize kernels**;
- Its conclusion makes a bold assertion: **"SOTA on AMD is imminent"**;
- The article ends with a provocative question: **"Is the CUDA moat dead?"**

---

## 7. Summary: Viewpoints and Conclusions

### 7.1 Core Viewpoints

1. **Memory capacity is the hard gate for next-gen models**. When a model gets too big for a single node, whoever can fit "weights + KV cache" wins the deployment race.
2. **Choose hardware by "performance per dollar."** The MI355X's 48 tok/s/$ is 7× the B200 and 1.45× the B300 — the undisputed value king.
3. **AMD's software gap is closing fast (especially via agents)**. Wafer restored production-grade performance with two "missing definition / shape" bugs — zero custom kernels.
4. **TTFT is the experience users actually feel**. decode tok/s is glorified; first-token latency is real — so optimizing prefill (12→16 heads, AITER) isn't showing off, it's saving users' time.

### 7.2 Takeaways for Developers

- Before deploying, ask: **does this GPU's memory fit "weights + context"?** — more important than chasing "GPU count / FLOPs."
- Don't be dazzled by decode tok/s — **look at your first-token latency first**.
- When ROCm errors appear, debug calmly: **many are "undefined / shape mismatch" rather than "missing kernel"** — a one-line fix often suffices (`top_k_renorm_prob`, 12→16 heads are live examples).

### 7.3 Closing

Back to the title question: **is the CUDA moat dead?**

If "moat" means peak performance scores — obviously not yet. But if you define it as "**how much intelligence can you buy with money**" — this article gives an answer that couldn't be plainer: **memory has become the new moat, and the AMD + Chinese open-source combination is digging that trench wider.**

Signals worth watching: as open-model sizes keep climbing, as AMD's Day-0 support becomes routine, as inference frameworks optimize deeper for ROCm — the answer to "must it be an N-card?" is shifting from "of course" to "not necessarily."

---

## References

- Wafer AI Blog *"Is memory the moat?"*: https://www.wafer.ai/blog/kimi-k3-mi355x
- Kimi K3 official release: https://www.kimi.com/blog/kimi-k3
- AMD MI355X official page: https://www.amd.com/en/products/accelerators/instinct/mi350/mi355x.html
- AMD official Kimi K3 Day-0 technical article: https://www.amd.com/en/developer/resources/technical-articles/2026/kimi-k3-on-amd-instinct-gpus.html
- DeepLearning.AI *The Batch* analysis: https://www.deeplearning.ai/the-batch/kimi-k3-reveals-how-a-giant-frontier-ai-model-works
- VentureBeat coverage: https://venturebeat.com/technology/chinas-moonshot-ai-releases-kimi-k3-the-largest-open-source-model-ever-rivaling-top-u-s-systems
- vLLM K3 support: https://vllm.ai/blog/2026-07-27-k3
