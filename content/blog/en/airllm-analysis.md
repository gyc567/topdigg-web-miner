---
title: "AirLLM Deep Dive: The Layer-Wise Inference Revolution That Runs 70B LLMs on a 4GB GPU"
description: "A comprehensive analysis of the open-source AirLLM project — no quantization, no distillation, no pruning. Through layer-by-layer loading, it runs 70B-parameter LLMs on a single 4GB GPU. From installation to API usage, from how it works to its design philosophy, this article covers the core ideas behind a 26k-star project."
date: "2026-08-03"
author: "TopDigg Research Team"
tags: ["AirLLM", "LLM Inference", "Large Language Models", "GPU Memory Optimization", "Layer-wise Inference", "Open Source", "Gavin Li", "Deep Learning", "Model Inference", "Low-end Hardware"]
categories: ["Deep Dive"]
keywords: ["AirLLM", "LLM Inference", "70B model", "4GB GPU", "Layer-wise Inference", "Gavin Li", "Anima AI", "Open Source", "GPU VRAM", "AutoModel", "Model Compression"]
---

# AirLLM Deep Dive: The Layer-Wise Inference Revolution That Runs 70B LLMs on a 4GB GPU

> Core idea: **Why must we hold the entire model in GPU memory at once?** Since transformer layers execute sequentially, we only need the layer *currently running* in the GPU — compute it, free it, load the next. AirLLM turns this seemingly simple question into a working system that runs 70B-parameter LLMs on a single 4GB GPU — no quantization, no distillation, no pruning.

---

## 1. Project Overview

### 1.1 What Is This Project?

**AirLLM** is an open-source large language model inference framework created by **Gavin Li** (founder of Anima AI, former senior AI leader at Airbnb and Alibaba). Its core capability is to **dramatically reduce GPU memory usage during LLM inference**, letting 70B-parameter models run on a **single 4GB GPU** — without quantization, distillation, or pruning.

> From the README: *"AirLLM optimizes inference memory usage, letting 70B large language models run inference on a single 4GB GPU card — without quantization, distillation, or pruning."*

### 1.2 Project At a Glance

- **GitHub Stars**: 26,230+ (as of Aug 2026)
- **License**: Apache License 2.0
- **Activity**: Actively developed (latest commit July 29, 2026)
- **Distribution**: PyPI (`pip install airllm`)
- **Repo**: https://github.com/lyogavin/airllm

### 1.3 What Can It Do? (Verified VRAM Benchmarks)

- **Qwen3 / Mistral / Phi (~8B)** → needs only **~1–2 GB**
- **Qwen3-30B / Mixtral (MoE, 30–47B)** → **~1–3 GB**
- **Qwen3-235B (MoE)** → **~3 GB**
- **Llama 3.x 70B** → **~4 GB**
- **Llama 3.1 405B** → **~8 GB**
- **DeepSeek-V3 (671B)** → **~12 GB**
- **Kimi K3 (2.8T)** → **~3.72 GB**

> Note: figures are from official benchmarks. Traditionally, a 70B model needs ~140GB VRAM for full loading; AirLLM compresses that to 4GB — more than a 30x reduction.

---

## 2. Core Idea: Why Must the Whole Model Live in VRAM?

### 2.1 An Ignored Obvious Fact

During LLM inference, the transformer's layers execute **sequentially**: the previous layer's output is the next layer's input, and only **one** layer computes at any instant. Author Gavin Li put it this way on Medium:

> "During inference, layers are executed sequentially. The output of the previous layer is the input to the next. Only one layer executes at any given time. Therefore, it is completely unnecessary to keep all layers in GPU memory. We can load whichever layer is needed from disk when executing that layer, do all the calculations, and then completely free the memory after."

Translation: **Since only one layer computes at a time, why pack all of them into video memory?** Load the *currently running* layer from disk into the GPU, free it immediately after computing, then load the next — that is AirLLM's whole secret.

### 2.2 The Fundamental Difference from Mainstream Approaches

The mainstream approach is "make the model smaller to fit the VRAM":

- **Quantization**: squeeze weights from FP16 to INT8/INT4, trading precision for size
- **Distillation**: teach a smaller model with a big one, retrain a compact version
- **Pruning**: drop unimportant parameters

AirLLM's approach is entirely different — **don't change the model; change where it lives**: treat GPU VRAM as a *cache*, and disk as *main memory*. Trade speed for capacity, so ordinary people can run large models on hardware they already own.

---

## 3. Detailed Tutorial: From Installation to Running

### 3.1 Installation

```bash
pip install airllm
```

To support Kimi K3 (per-expert streaming), install the extra dependencies:

```bash
pip install airllm compressed-tensors flash-attn
```

### 3.2 Quick Start: AutoModel

AirLLM provides a HuggingFace-compatible `AutoModel` API that auto-detects model architecture:

```python
from airllm import AutoModel

MAX_LENGTH = 128
model = AutoModel.from_pretrained("Qwen/Qwen3-32B")

input_text = ['What is the capital of the United States?']
input_tokens = model.tokenizer(
    input_text,
    return_tensors="pt",
    return_attention_mask=False,
    truncation=True,
    max_length=MAX_LENGTH,
    padding=False
)

generation_output = model.generate(
    input_tokens['input_ids'].cuda(),
    max_new_tokens=20,
    use_cache=True,
    return_dict_in_generate=True
)

output = model.tokenizer.decode(generation_output.sequences[0])
print(output)
```

> Usage mirrors HuggingFace `transformers`: load with `from_pretrained`, encode with `tokenizer`, generate with `generate` — the on-ramp cost is minimal.

### 3.3 Compression Mode for Extra Speed

To gain more speed, enable 4-bit / 8-bit weight quantization (negligible accuracy loss):

```python
model = AutoModel.from_pretrained(
    "garage-bAInd/Platypus2-70B-instruct",
    compression='4bit'   # or '8bit'
)
```

### 3.4 Loading Very Large Models (405B / 671B)

AirLLM works out of the box with HuggingFace's biggest models:

```python
# Llama 3.1 405B
model = AutoModel.from_pretrained("unsloth/Meta-Llama-3.1-405B-Instruct-bnb-4bit")
```

### 3.5 Supported Architectures

AirLLM supports virtually every popular open model:

- **Llama**: 2 / 3 / 3.1 / 3.3 / 4, including 405B
- **Qwen**: 1 / 2 / 2.5 / 3, including MoE and FP8 variants
- **DeepSeek**: V2 / V3 / R1, including the 671B V3
- **Mistral / Mixtral**: Mistral-7B and Mixtral MoE
- **Phi, Gemma**: Microsoft and Google families
- **ChatGLM, Baichuan, InternLM, Yi**: Chinese model families

### 3.6 First-Run Notes

- **First sharding**: first run splits the model into per-layer files on disk, taking about **10–30 minutes** (depends on size and disk speed)
- **Disk space**: first run needs the original model + sharded copy (~2x model size); use `delete_original=True` to reclaim space
- **NVMe SSD recommended**: disk I/O is the bottleneck; HDDs drop to 0.1 tokens/s or less
- **Common error**: a `MetadataIncompleteBuffer` error **usually means you ran out of disk space**

---

## 4. How It Works: Four Technical Pillars

### 4.1 Layer-wise Sharding

The model is split into per-layer disk files (safetensors with memory-mapping). During inference, layers load on demand rather than all at once.

### 4.2 Meta Device Initialization

Uses `accelerate.init_empty_weights()` to build the model structure — **creating tensor shapes only, allocating zero VRAM**.

### 4.3 Forward Hooks

This is the core mechanic. Each transformer layer has two hooks:

- **Pre-hook**: loads that layer's weights from disk to GPU
- **Post-hook**: after computing, moves weights back to the meta device and calls `clean_memory()` to free memory

```python
def _pre_hook(self, module, args):
    idx = module._airllm_idx
    if self.prefetching and self._prefetch_future is not None and self._prefetched_idx == idx:
        state_dict = self._prefetch_future.result()
    else:
        state_dict = self._load_streamed_layer(idx)
    module._airllm_moved = self.move_layer_to_device(state_dict)
    # Prefetch the next layer
    if self.prefetching:
        nxt = self._next_streamed_idx(idx)
        if nxt is not None:
            self._prefetch_future = self._executor.submit(self._load_streamed_layer, nxt)
```

### 4.4 Three Key Optimizations

- **Prefetching (v2.5+)**: while layer N computes on GPU, prefetch layer N+1 from disk — about **10% faster**
- **Per-Expert Streaming (v3.1+)**: for MoE models, load only the router-selected experts for the current token, not the whole layer
- **MXFP4 Packed Transfer (Kimi K3)**: weights stay 4-bit compressed across PCIe and only expand on the GPU — **4x less data transfer**

---

## 5. Design Philosophy

### 5.1 The Author's Origin Question

Gavin Li started from a simple question:

> "Large language models require huge amounts of GPU memory. Is it possible to run inference on a single GPU? If so, what is the minimum GPU memory required?"

**LLMs need lots of VRAM — can they run on a single GPU? If so, what is the minimum VRAM required?**

### 5.2 Inverting the Traditional Architecture

AirLLM's philosophy boils down to: **instead of compressing the model to fit in VRAM, it asks why the entire model needs to be in memory at all.** It treats GPU as a cache and disk as primary storage, inverting the traditional inference architecture — giving up some speed in exchange for running on **hardware you already own**.

### 5.3 Four Core Design Decisions

1. **No compression by default**: preserves full model quality; compression is entirely optional — quantization always costs accuracy, AirLLM's answer is "quantize only when you must"
2. **Target the I/O bottleneck, not compute**: AirLLM's bottleneck is disk loading, so it optimizes data transfer rather than matrix math
3. **HuggingFace-native**: uses the standard `AutoModel` API so every HF model works out of the box
4. **Hook-based architecture**: decouples from per-architecture attention / rotary / cache details via forward hooks

### 5.4 The Author's Sharp Take on Quantization

> "Quantization normally needs to quantize both weights and activations to really speed things up. While in our case the bottleneck is mainly at the disk loading, we only need to make the model loading size smaller. So, we get to only quantize the weights' part, which is easier to ensure the accuracy."

**In short**: normal quantization must quantize both weights and activations to meaningfully speed things up; but since AirLLM's bottleneck is disk loading, it only needs a smaller model-loading size — so it quantizes only the weights, which is easier to keep accurate.

> This is a sharp insight: **the optimization target determines the optimization method.** If the bottleneck is I/O rather than compute, you don't pay the accuracy cost of activation quantization.

---

## 6. Performance: Trading Speed for Capacity

### 6.1 Trade Speed for Capacity

**VRAM (70B model)**
- Traditional full loading: ~**140 GB**
- AirLLM layer-wise: ~**4 GB**

**Inference speed**
- Traditional (A100): 10–20 tokens/s
- AirLLM (4GB GPU): ~0.5–2 tokens/s

**Bottleneck**
- Traditional: video memory
- AirLLM: disk I/O

**Hardware bar**
- Traditional: multi-GPU A100/H100
- AirLLM: ordinary 4GB consumer GPU

- With 4-bit / 8-bit block-wise quantization, inference speed rises up to **3x** with "almost negligible" accuracy loss
- As echoed in llama.cpp community discussions: *"AirLLM only gets GPU-speed inference whilst the layer is executing, and it stops when waiting for the next layer to be loaded."*

---

## 7. Comparison with Mainstream Approaches

- **AirLLM**: layer-by-layer disk streaming. **Slow but faithful, minimal VRAM** — ideal for offline batch processing
- **llama.cpp / GGUF**: weight quantization + CPU/GPU hybrid. Quality loss, but faster
- **HuggingFace Accelerate**: offload across devices. **Requires multiple GPUs**
- **vLLM / TGI**: batching + KV cache optimization. **Requires large VRAM**

> Positioning: AirLLM solves "**I don't have big VRAM**"; the others solve "**I have many tokens to process efficiently**".

---

## 8. Limitations & Notes

1. **Slow**: 10–50x slower than full loading; suited to offline batch tasks, not interactive real-time chat
2. **Disk space boosts**: first run needs original + sharded copy; use `delete_original=True` to clean up
3. **First sharding time**: 10–30 minutes depending on size and disk speed
4. **I/O sensitive**: an NVMe SSD is strongly recommended; HDDs are effectively unusable
5. **Kimi K3 hard requirements**: CUDA 12 (not 13), `transformers==4.56.x` (5.x incompatible), requires `flash-attn`

---

## 9. Summary: Viewpoints & Conclusions

### 9.1 Core Takeaways

- **VRAM is not a requirement of inference, it's a cache**: AirLLM proves the "VRAM as cache, disk as main memory" architecture, directly challenging the default assumption that "large models need big VRAM"
- **The optimization target determines the method**: since the bottleneck is I/O, AirLLM needs only weight quantization, escaping the accuracy risk of activation quantization — a reusable engineering insight
- **"It can run" beats "it runs fast"**: when hardware is locked, solve 0→1 first, then 1→N speed
- **MoE is the key to extreme scale**: per-expert streaming lets a 2.8T Kimi K3 use just 3.72GB — MoE sparsity and layer-wise inference are a perfect match

### 9.2 Takeaways for Dev SS

- No big VRAM? You can still play with 70B-class models: **consumer GPU + AirLLM is a low-cost experimentation platform**
- Seamless HuggingFace compatibility means **near-zero migration** effort
- Best for offline batch processing, research experiments, teaching demos — anything not sensitive to latency

### 9.3 Conclusion

AirLLM's significance goes beyond a technical solution; it's a **demonstration of a different way of thinking**. When everyone assumes "the model is too big, must compress it", AirLLM asks the reverse question: "**why does the whole model have to be in VRAM?**" — doubting the default assumption often unlocks entirely new possibilities.

**One sentence summary**: AirLLM = trade disk for VRAM, trade speed for access — bringing large models back to ordinary hardware.

---

## References

- Repo: https://github.com/lyogavin/airllm
- PyPI: https://pypi.org/project/airllm/
- Author's Medium: https://medium.com/@lyo.gavin/unbelievable-run-70b-llm-inference-on-a-single-4gb-gpu-with-this-new-technique-93e2057c7eeb
- Citation:

```bibtex
@software{airllm2023,
  author = {Gavin Li},
  title = {AirLLM: scaling large language models on low-end commodity computers},
  url = {https://github.com/lyogavin/airllm/},
  version = {0.0},
  year = {2023},
}
```