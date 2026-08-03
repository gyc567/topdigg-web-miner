---
title: "AREX Deep Dive: BAAI's Open-Source Recursively Self-Improving Deep Research Agent"
description: "A comprehensive analysis of BAAI's open-source AREX — a recursively self-improving deep research agent. From the core 'discovery-verification asymmetry' insight in arXiv 2607.21461 to the dual-loop framework, from AREX-Turbo / AREX-Base models to a complete usage tutorial, this article explains the design philosophy of this Apache 2.0 open research model."
date: "2026-08-03"
author: "TopDigg Research Team"
tags: ["AREX", "BAAI", "Deep Research", "Agent", "Recursive Self-Improvement", "arXiv", "Open Source Model", "Deep Research", "MoE", "Qwen3.5"]
categories: ["Deep Dive"]
keywords: ["AREX", "BAAI", "Deep Research agent", "Recursive self-improvement", "arXiv 2607.21461", "Open Source", "Apache 2.0", "Qwen3.5", "AREX-Turbo", "AREX-Base", "Discovery-verification asymmetry"]
---

# AREX Deep Dive: BAAI's Open-Source Recursively Self-Improving Deep Research Agent

> Core idea: **Discovering an answer is expensive; verifying an answer is cheap.** Deep research demands answers that satisfy multiple constraints at once — "discovery" spans a huge search space, but "verification" of a candidate often decomposes into simple per-constraint checks. AREX seizes this asymmetry so the agent doesn't simply search longer — it **recursively self-improves**, using partially verified state to guide later iteration.

---

## 1. Project Overview

### 1.1 What Is This?

**AREX (Recursively Self-Improving Agent for Deep Research)** is a deep research agent released by BAAI (Beijing Academy of Artificial Intelligence) in July 2026. It's not just another big model — it's a complete "research-agent methodology + trained models."

- **Paper**: arXiv:2607.21461 (cs.AI, submitted July 23-24, 2026)
- **Title**: *AREX: Towards a Recursively Self-Improving Agent for Deep Research*
- **Authors**: Lu Shuqi, Li Chaofan, Luo Kun, and 21 others (24 total, BAAI)
- **Homepage**: https://vectorspacelab.github.io/arex-model/
- **Live demo**: https://arex-research.com/
- **Model collection**: https://huggingface.co/collections/BAAI/arex

### 1.2 Open-Source Models

- **AREX-Turbo**: 4B dense, based on Qwen3.5-4B, Apache 2.0, **256K context**
- **AREX-Base**: 122B total / 10B active (MoE), based on Qwen3.5-122B-A10B, Apache 2.0, **256K context**

> Both models are Apache 2.0 licensed — free for research and commercial use. This is another significant contribution from BAAI after BGE, BGE-M3, and other open models.

---

## 2. Core Idea: Discovery-Verification Asymmetry

### 2.1 Why Is Deep Research So Expensive?

Deep research requires agents to find answers satisfying **multiple constraints simultaneously**. The difficulty:

- **Discovering** an answer that satisfies all constraints — huge search space, high cost
- **Verifying** a candidate — often decomposes into **simple per-constraint checks**, much cheaper

> Analogy: it's hard to find a Beijing apartment that's *near the subway, below ¥5000, south-facing, and has an elevator*; but given a specific listing, verifying each constraint is fast. **Discovery is hard, verification is easy — that's the asymmetry.**

### 2.2 AREX's Answer: Don't Search Longer — Improve Recursively

AREX's key insight: use **partially verified intermediate state** to guide iteration, rather than blindly expanding the search.

- Each iteration verifies intermediate results
- Verified findings are preserved
- Unresolved constraints are re-researched
- This becomes a **recursive self-improvement loop**

---

## 3. Technical Architecture: The Double-Loop Framework

### 3.1 Inner Research Loop

- Gathers evidence, evaluates candidates, constructs provisional answers
- Maintains research state through the accumulated trajectory
- Produces answers with **supporting evidence** and **confidence scores (0-100)**

### 3.2 Outer Self-Improvement Loop

Audits the provisional answer constraint-by-constraint, then applies decision rules:

- **Accept**: confidence ≥ threshold
- **Refine**: confidence < threshold AND recoverable trajectory — preserve useful findings, target unresolved constraints
- **Restart**: confidence < threshold AND trajectory too noisy/confusing

### 3.3 Autonomous Context-Update Tool (update_context)

AREX learns to invoke `update_context` to compress a growing interaction history into a compact **improvement state**:

- Preserves verified findings with source identifiers
- Records constraint-satisfaction status
- Highlights unresolved information gaps
- Specifies the next research plan

> This is not generic summarization! **The agent itself** organizes the update around its current objective, keeping the compressed state aligned with its evolving beliefs.

### 3.4 Available Tools

- **search**: batched web search (top 10 results per query)
- **visit**: visit webpages and return content summaries
- **google_scholar**: academic publication search
- **update_context**: compress memory/research state
- **finish**: return final answer with evidence

---

## 4. Training Pipeline: Multi-Stage Training

### 4.1 Agentic Mid-Training

Progressive capability building:

- **Browse-intensive research tasks**: fundamental tool use, evidence acquisition
- **Expert reasoning tasks**: long-form thinking, multi-step deduction
- **Mixed-capability consolidation**: with key-step focused replay

### 4.2 Step-Aware Reinforcement Learning

- Step-level policy optimization with hierarchical normalization
- **Key-step reward shaping**: auxiliary bonuses for critical decision points
- **Final-answer correctness** remains the primary optimization objective

### 4.3 Key-Step Focused Supervision

Identify critical steps, e.g.:

- Steps that acquire **key evidence**
- Steps that **reject incorrect hypotheses**
- Context updates **preserving verified evidence**

> This solves the long-horizon **credit assignment** problem: among trajectories spanning dozens of steps, which steps truly determine final-answer quality?

---

## 5. Detailed Tutorial: How to Use AREX

### 5.1 Option 1: vLLM

```bash
pip install vllm

vllm serve BAAI/AREX-Turbo \
  --served-model-name AREX-Turbo \
  --tensor-parallel-size 1 \
  --max-model-len 262144 \
  --reasoning-parser qwen3 \
  --language-model-only
```

### 5.2 Option 2: SGLang

```bash
pip install sglang

python3 -m sglang.launch_server \
    --model-path "BAAI/AREX-Turbo" \
    --host 0.0.0.0 \
    --port 30000
```

### 5.3 Option 3: Transformers (local)

```python
from transformers import AutoProcessor, AutoModelForMultimodalLM

processor = AutoProcessor.from_pretrained("BAAI/AREX-Turbo")
model = AutoModelForMultimodalLM.from_pretrained(
    "BAAI/AREX-Turbo",
    device_map="auto"
)

messages = [
    {
        "role": "user",
        "content": [
            {"type": "image", "url": "https://example.com/image.jpg"},
            {"type": "text", "text": "Describe this image"}
        ]
    },
]

inputs = processor.apply_chat_template(
    messages,
    add_generation_prompt=True,
    tokenize=True,
    return_dict=True,
    return_tensors="pt",
).to(model.device)

outputs = model.generate(**inputs, max_new_tokens=40)
print(processor.decode(outputs[0][inputs["input_ids"].shape[-1]:]))
```

### 5.4 Agent Loop: XML Tool Calls

```python
from openai import OpenAI

client = OpenAI(
    base_url="http://127.0.0.1:8000/v1",
    api_key="EMPTY",
    timeout=600.0,
)

question = "Your research question"
messages = [
    {"role": "system", "content": SYSTEM_PROMPT},  # contains tool descriptions
    {"role": "user", "content": f"Question: {question}"}
]

# Loop: generate → execute tool → append result → repeat
while True:
    response = client.chat.completions.create(
        model="AREX-Turbo",
        messages=messages,
        max_tokens=8192,
        temperature=1.0,
        top_p=0.95,
        presence_penalty=1.5,
        extra_body={"top_k": 20},
    )

    assistant_output = response.choices[0].message.content
    messages.append({"role": "assistant", "content": assistant_output})

    # If finish is called, extract the answer and break
    if "<function=finish>" in assistant_output:
        break

    # Execute tool and append the result
    tool_result = execute_tool(assistant_output)
    messages.append({"role": "tool", "content": f"<tool_response>{tool_result}</tool_response>"})
```

### 5.5 Tool Set (from prompts.py)

- `search(query: list[str])` — batched web search
- `visit(url: str|list[str], goal: str)` — webpage visits
- `google_scholar(query: list[str])` — academic search
- `update_context(context: str)` — compress research state
- `finish(answer: str, evidences: list[{evidence, url}])` — submit final answer

---

## 6. Benchmark Results

### 6.1 AREX Series Scores

- **BrowseComp**: AREX-Base **82.5** / AREX-Turbo 70.7
- **GAIA**: AREX-Base **85.4** / AREX-Turbo 81.6
- **xbench-2510**: AREX-Base **71.0** / AREX-Turbo 57.0
- **DeepSearchQA**: AREX-Base **89.9** / AREX-Turbo 78.5
- **WideSearch-en**: AREX-Base **82.0** / AREX-Turbo 68.5
- **HLE with tools**: AREX-Base **52.4** / AREX-Turbo 40.6

### 6.2 vs. Same-Scale, Much Larger & Closed Models (selected benchmarks)

- **Qwen3.5-122B**: BrowseComp 63.8 / GAIA 81.6 / WideSearch-en 60.5
- **Qwen3.5-397B**: BrowseComp 78.6 / GAIA 83.5 / WideSearch-en 74.0
- **Kimi-K2.6 (1T)**: BrowseComp 83.2 / GAIA 80.6 / WideSearch-en 80.8
- **DeepSeek-Pro (1.6T)**: BrowseComp 83.4 / WideSearch-en 78.0
- **GPT-5.4**: BrowseComp 82.7 / WideSearch-en 88.5
- **Gemini-3.1-Pro**: BrowseComp 85.9 / GAIA 80.6 / WideSearch-en 66.4

> Key conclusion: **AREX-Base (122B MoE, only 10B active)** substantially outperforms same-scale baselines and stays competitive with models using far more active parameters — validating that "recursive self-improvement gains > simply scaling parameters."

---

## 7. Design Philosophy

### 7.1 Five Core Design Principles

1. **Verification as an active control signal**: verification is not a final filter — it drives them Accept / Refine / Pause-react
2. **Preserve progress across iterations**: verified findings survive; only unresolved constraints are re-researched
3. **Autonomous context management**: the agent itself decides when to compress and organizes it around its own objective — not via external generic summarization
4. **Key-step credit assignment**: critical research decisions (finding evidence, rejecting wrong hypotheses) receive focused training signal
5. **Efficiency over scale**: recursive self-improvement yields better gains than simply scaling parameters

### 7.2 Positioning vs. Related Work

- **unclear Mirorecursive**: scales context and model size; AREX focuses on recursive improvement
- **else WebResearcher**: iterative paradigm; macro adds verification-guided transitions
- **else DeepSeek/Aggregation**: AREX's constraint-wise verification is fundamentally different

### 7.3 Why It's Unique

1. Discovery-verification asymmetry as a design principle
2. Recursive double-loop framework (inner + outer)
3. Learned autonomous context-update tool
4. Key-step focused training for credit assignment
5. Evidence-grounded answer structure with confidence scores

---

## 8. Limitations & Open Questions

1. **Humanity's Last Exam (HLE) still has room to grow**: AREX-Base 52.4% — still behind the frontier
2. **Long-horizon credit assignment remains challenging**: precisely attributing outcomes across tens-to-hundreds-of-steps trajectories remains open
3. **Recovery assessment occasionally misjudges**: the boundary between Refine/Restart decisions is not always perfect

---

## 9. Summary: Viewpoints & Conclusions

### 9.1 Core Viewpoints

- **Discovery-verification asymmetry is a reusable design principle**: for any problem where "search is big and verification is cheap" (research, debugging, decisions), you can borrow the "verify first, then expand" recursive strategy
- **Verification-driven iteration beats search-driven iteration**: spend resources on verification and refinement, not on blindly expanding search
- **Context management should be agent capability, not an external tool**: AREX proves that a model that learns to compress context autonomously keeps a coherent belief state across long tasks
- **Key-step supervision is the key to long-horizon RL**: solving credit assignment is what makes research trajectories of dozens/hundreds of steps realistically trainable
- **Open source + Apache 2.0 is BAAI's ecosystem commitment**: near-frontier results with 122B (10B active) make high-quality deep-research agents no longer exclusive to industry giants

### 9.2 Takeaways for Developers

- Both models are Apache 2.0 — **directly usable commercially**
- AREX-Turbo (4B) deploys on consumer hardware; great for lightweight research tasks
- AREX-Base (122B MoE, 10B active) serves on vLLM/SGLang without billion-scale VRAM
- 256K context + XML tool-calling paradigm is compatible with mainstream inference frameworks

### 9.3 Conclusion

> AREX's insight: **the bottleneck of deep research is not "thinking long" but "improving right."** When a model learns to verify its findings, preserve progress, and focus on unresolved constraints, a 122B MoE model can approach closed 1T-level models on multiple benchmarks — recursive self-improvement is a more elegant hand than parameter-hoarding.

**One-sentence summary: AREX = verification-driven recursive self-improvement, letting deep-research agents reach stronger models with less compute.**

---

## References

- Paper: https://arxiv.org/abs/2607.21461
- HuggingFace paper page: https://huggingface.co/papers/2607.21461
- Model collection: https://huggingface.co/collections/BAAI/arex
- Homepage: https://vectorspacelab.github.io/arex-model/
- Live demo: https://arex-research.com/
- Citation:

```bibtex
@misc{baai2026arex,
  title={AREX: Towards a Recursively Self-Improving Agent for Deep Research},
  author={Shuqi Lu and Chaofan Li and Kun Luo et al.},
  year={2026},
  eprint={2607.21461},
  archivePrefix={arXiv},
  primaryClass={cs.AI},
  url={https://arxiv.org/abs/2607.21461},
}
```