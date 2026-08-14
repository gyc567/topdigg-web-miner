---
title: "Needle 2: The Ultra-Lightweight Local AI Model for Tool Calling — 45M Parameters Powering Edge Intelligence"
date: "2026-08-14"
description: "In-depth analysis of Needle 2 open-source project — 45M parameter local AI model in a 14MB binary with ~28MB RAM, designed for tool calling and structured data extraction on edge devices"
tags:
  - Needle
  - AI Model
  - Edge Computing
  - Tool Calling
  - Local Deployment
  - Cactus Quants
  - Structured Extraction
  - On-Device AI
categories:
  - AI Models
  - Edge Computing
  - Local AI
  - Tool Calling
  - Model Compression
---

# Needle 2: The Ultra-Lightweight Local AI Model for Tool Calling — 45M Parameters Powering Edge Intelligence

## Project Background and Core Problem

### The Edge Device AI Dilemma

In the AI era, we face a growing contradiction: **the conflict between powerful AI capabilities and device resource constraints**.

| Device Type | Resource Limits | AI Needs |
|-------------|----------------|----------|
| Smartphones | Limited RAM and compute | Real-time response, privacy |
| Wearables | Ultra-low power | Always-on, fast response |
| Smart Home | Cost-sensitive, offline | Local control, low latency |
| Robots | Real-time perception | Fast response, environment interaction |

**Traditional Solution Dilemmas**:
- **Cloud APIs**: Network required, privacy risks, latency issues
- **Large model local deployment**: Massive parameters, high memory, power-hungry
- **Small models**: Insufficient capability, poor tool calling accuracy

### The Birth of Needle 2

The Needle 2 team chose a different path after deep research:

> **"Not making a small model pretend to be a large one, but making a small model excel in what it does best."**

This is Needle 2 — an open-source **45M parameter AI model** specialized for:
- **Tool Calling**
- **Device Use**
- **Structured Data Extraction**

A state-of-the-art ultra-small language model that can compete with models **70x larger** on specific tasks.

---

## Project Overview

### What is Needle 2?

Needle 2 is an **open-source 45M parameter AI model** specialized for tool calling, device use, and structured data extraction.

```
┌─────────────────────────────────────────────────────────────────┐
│                      Needle 2 Core Metrics                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ⚡ Parameters:        45M (vs GPT-4's ~1T)                      │
│  📦 Model Size:       14MB (single file deployment)               │
│  💾 Memory:          ~28MB (256-token sliding window)             │
│  🔄 Inference:       Fully local, no network dependency           │
│  🎯 Specialization:   Tool calling, structured extraction          │
│  📊 Performance:      Competes with 70x larger models             │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Key Features

| Feature | Description |
|---------|-------------|
| 🖥️ **Self-contained deployment** | Weights baked into single file, no network during inference |
| 📝 **Simple API** | Text input, structured JSON output based on tool schemas |
| 🎯 **Confidence gating** | Calibrated confidence scores for act/escalate decisions |
| 🔍 **Tool retrieval** | Built-in retrieval surfaces top-5 relevant tools per turn |
| 💾 **Bounded memory** | 256-token sliding window, ~28MB total RAM regardless of conversation |
| 🧩 **Modular tools** | Decorator-based tool definition, easy Python function integration |
| 📊 **Structured extraction** | Pydantic model support for structured data output |
| ⚡ **Acceleration** | GPU (`cactus-needle[gpu]`), Apple Silicon (`cactus-needle[metal]`) |

---

## Technical Architecture Deep Dive

### Architecture: Simple Attention Networks

Needle 2 is based on an innovative architecture — **Simple Attention Networks (SAN)**:

```
┌─────────────────────────────────────────────────────────────┐
│                  Simple Attention Networks Architecture         │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │                   Core Components                       │   │
│  ├──────────────────────────────────────────────────────┤   │
│  │                                                              │
│  │   1. Hadamard MLP (replaces FFN)                        │   │
│  │      └── More efficient parameter utilization via         │   │
│  │          Hadamard transforms                            │   │
│  │                                                              │
│  │   2. Grouped Query Attention (GQA)                      │   │
│  │      └── Reduced KV cache for memory efficiency           │   │
│  │                                                              │
│  │   3. Engram Key-Value Memory                            │   │
│  │      └── Optimized memory for long-range context         │   │
│  │                                                              │
│  │   4. Multi-Lane Hyper-Connections                       │   │
│  │      └── Enhanced information flow                       │   │
│  │                                                              │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### Key Technology: Cactus Quants (CQ2-bit Compression)

Needle 2 uses revolutionary quantization technology **Cactus Quants** for **2-bit compression**:

```
Quantization Comparison:

┌───────────────┬───────────────┬─────────────────────────────┐
│    Precision   │  Parameter    │        Memory               │
├───────────────┼───────────────┼─────────────────────────────┤
│  FP32 (32-bit) │   180MB      │         High                │
│  FP16 (16-bit) │   90MB       │         Medium             │
│  INT8 (8-bit)  │   45MB       │         Low                │
│  CQ2 (2-bit)   │   ~14MB      │      Extremely Low ✓       │
└───────────────┴───────────────┴─────────────────────────────┘
```

### Byte-Level Grammar Constraint

Needle 2 uses a **byte-level grammar compiler** generated from user schemas:

```python
# Grammar compiled from Pydantic model
class Weather(BaseModel):
    city: str
    temp_c: float
    sky: str

# Needle automatically compiles to grammar
# Token generation constrained to valid set
# Result: 100% valid JSON output
```

---

## Core Features Deep Dive

### 1. Tool Calling System

Needle 2's tool calling system is elegantly designed:

```python
import needle

# Define tools with decorators
@needle.tool
def get_weather(city: str) -> dict:
    "Get the current weather for a city."
    return {"city": city, "temp_c": 27, "sky": "clear"}

@needle.tool
def get_time(timezone: str) -> dict:
    "Get the current time for a timezone."
    return {"timezone": timezone, "time": "2024-01-15 10:30:00"}

# Create agent
agent = needle.Needle(tools=[get_weather, get_time])

# Run
result = agent.run("what's it like in Lagos right now?")
print(result["results"])
```

#### Tool Calling Workflow

```
┌─────────────────────────────────────────────────────────────┐
│                 Tool Calling Workflow                          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. User Input                                              │
│     "what's it like in Lagos right now?"                    │
│                    │                                         │
│                    ▼                                         │
│  2. Intent + Tool Selection                                  │
│     ├── Retrieve top-5 relevant tools                       │
│     ├── Confidence evaluation                               │
│     └── Select best tool                                   │
│                    │                                         │
│                    ▼                                         │
│  3. Parameter Extraction                                    │
│     └── Extract function arguments from user input            │
│                    │                                         │
│                    ▼                                         │
│  4. Tool Execution                                          │
│     └── Call Python function                                │
│                    │                                         │
│                    ▼                                         │
│  5. Response Generation                                     │
│     └── Generate natural language from tool return           │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 2. Confidence Gating

Needle 2 provides **calibrated confidence scores** — a critical safety feature:

```python
result = agent.run("what's it like in Lagos?")

# Check confidence
if result["confidence"] > 0.8:
    # High confidence: use result directly
    print(result["results"])
else:
    # Low confidence: escalate to larger model or human
    print("Not sure, let me confirm...")
```

**Confidence Score Usage**:

| Confidence Range | Recommended Action |
|-----------------|-------------------|
| > 0.9 | Use directly, high confidence |
| 0.7 - 0.9 | Usable, watch for edge cases |
| 0.5 - 0.7 | Verify or augment |
| < 0.5 | Escalate to larger model |

### 3. Tool Retrieval System

For large tool catalogs, Needle 2 has a built-in **semantic retrieval system**:

```python
# Define many tools
tools = [
    get_weather, get_time, search_web, send_email,
    create_calendar_event,  # ... 100+ tools
]

agent = needle.Needle(tools=tools)

# Even with 100+ tools, Needle intelligently selects
result = agent.run("I need to schedule a meeting with John tomorrow")
```

### 4. Structured Data Extraction

Beyond tool calling, Needle 2 supports **structured data extraction**:

```python
from pydantic import BaseModel
import needle

class UserProfile(BaseModel):
    name: str
    email: str
    age: int
    interests: list[str]

extractor = needle.Needle()
profile = extractor.extract(
    "John is 28, his email is john@example.com. He likes AI, hiking, and cooking.",
    schema=UserProfile
)
```

---

## Getting Started Tutorial

### Installation

```bash
# Basic installation
pip install cactus-needle

# GPU acceleration (CUDA)
pip install "cactus-needle[gpu]"

# Apple Silicon acceleration
pip install "cactus-needle[metal]"
```

### Method 1: Basic Tool Calling

```python
import needle

# Step 1: Define tools
@needle.tool
def get_weather(city: str) -> dict:
    """Get the current weather for a city."""
    return {
        "city": city,
        "temp_c": 22,
        "condition": "sunny"
    }

@needle.tool
def get_news(category: str = "technology") -> dict:
    """Get the latest news for a category."""
    return {
        "category": category,
        "headlines": ["AI breakthrough", "New phone release"]
    }

# Step 2: Create agent
agent = needle.Needle(
    tools=[get_weather, get_news],
    confidence_threshold=0.7
)

# Step 3: Run
response = agent.run("What's the weather in Tokyo?")
print(response["results"])
```

### Method 2: Structured Extraction

```python
from pydantic import BaseModel
import needle

class Recipe(BaseModel):
    title: str
    cooking_time_minutes: int
    ingredients: list[str]
    instructions: list[str]

extractor = needle.Needle()

recipe_text = """
Chocolate Chip Cookies

Prep time: 15 minutes
Bake time: 12 minutes

Ingredients:
- 2 cups flour
- 1 cup butter
- 1 cup chocolate chips

Instructions:
1. Preheat oven to 350°F
2. Mix ingredients
3. Bake for 12 minutes
"""

recipe = extractor.extract(recipe_text, schema=Recipe)
print(recipe)
```

### Method 3: Playground

```bash
# Start browser playground
needle playground
```

---

## Fine-Tuning Tutorial

Needle 2 supports **LoRA fine-tuning** for custom behavior.

### Fine-Tuning Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    LoRA Fine-Tuning Flow                      │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. Prepare Data                                            │
│     └── Format as tool-calling conversations                │
│                    │                                         │
│                    ▼                                         │
│  2. Optional: Synthesize Data                               │
│     └── Use OpenRouter to generate more training data       │
│                    │                                         │
│                    ▼                                         │
│  3. Run LoRA Fine-Tuning                                    │
│     └── Train adapter on frozen base weights                │
│                    │                                         │
│                    ▼                                         │
│  4. Merge for Deployment                                     │
│     └── Merge adapter into single .cact file                 │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Step 1: Prepare Training Data

```json
// training_data.jsonl
{"messages": [
    {"role": "user", "content": "What's the weather in Paris?"},
    {"role": "assistant", "content": "", "tool_calls": [
        {"name": "get_weather", "arguments": {"city": "Paris"}}
    ]},
    {"role": "tool", "name": "get_weather", "content": "{\"temp_c\": 18, \"condition\": \"cloudy\"}"},
    {"role": "assistant", "content": "It's cloudy in Paris with 18°C."}
]}
```

### Step 2: Run Fine-Tuning

```bash
# Basic fine-tuning
needle finetune \
    --data training_data.jsonl \
    --output_dir ./output \
    --epochs 3 \
    --batch_size 8

# With data synthesis
needle finetune \
    --data training_data.jsonl \
    --synthesize \
    --synthesize_provider openrouter \
    --output_dir ./output
```

### Step 3: Merge for Deployment

```bash
# Merge checkpoint into .cact file
needle merge \
    --checkpoint_dir ./output/checkpoint-1000 \
    --output ./needle-custom.cact
```

---

## Design Philosophy Deep Dive

### Philosophy 1: Specialized Over General

The Needle 2 team made a key strategic decision:

> **Not making a small model pretend to be a large one, but making a small model excel in what it does best.**

```
Traditional Approach:                  Needle 2 Approach:
────────────────                     ────────────────
Small model does everything           Small model specializes
↓                                   ↓
Mediocre at everything               Best at tool calling
                                     ↓
                                   Competes with 70x larger models

Core insight:
Extreme optimization on specific tasks > average performance on all tasks
```

### Philosophy 2: Local First, Not Cloud

> **"No network dependency during inference"**

This is a conscious design choice:

| Approach | Advantages | Disadvantages |
|----------|-----------|---------------|
| Cloud API | Powerful compute | Latency, privacy, dependency |
| Large local model | Capable | Resource intensive |
| Needle 2 | Lightweight local, private | Capability ceiling |

### Philosophy 3: Bounded Resources, Not Unlimited

256-token sliding window is bounded resources embodied:

```
Traditional LLM:                      Needle 2:
────────────────                     ────────────────
Longer context = more memory         Fixed 256-token window
↓                                   ↓
Unlimited conversation,               Limited conversation,
memory explosion                     constant 28MB RAM
```

### Philosophy 4: Confidence as Safety Boundary

> **"Calibrated confidence scores to decide when to act or escalate"**

```
Confidence Gating:

High confidence (> 0.8):
  └── Execute directly, no confirmation

Medium confidence (0.5-0.8):
  └── Execute but prompt user confirmation

Low confidence (< 0.5):
  └── Refuse execution, suggest escalation
```

### Philosophy 5: Simplicity Is Ultimate Complexity

```python
# Traditional: Complex tool calling setup
from some_library import Agent, Tool, Memory
tools = [Tool("weather", get_weather), ...]
agent = Agent(tools=tools, memory=memory, ...)

# Needle 2: Minimal API
@needle.tool
def get_weather(city: str):
    return {...}

agent = needle.Needle(tools=[get_weather])
```

---

## Core Insights

### Insight 1: The Future of Edge AI Is Specialized Models

> **"Compete with 70x larger models"** — This is the reward for specialization.

The view that large models dominate everything is being challenged. Needle 2 proves: **a specially optimized model on specific tasks can outperform general large models**.

### Insight 2: Local AI Is the Privacy Shield

When AI processes sensitive data, local inference advantages:

```
Cloud API:                            Edge Deployment:
─────────────────                      ────────────────
Data sent to third-party servers      Data never leaves device
Privacy policy dependent              Complete data control
Transfer risk exists                  Zero transfer risk
```

### Insight 3: Resource Constraints Spur Innovation

> **Cactus Quants (2-bit compression)** — Maintaining model quality under extreme compression.

This shows: resource constraints aren't limitations — they're catalysts for innovation.

### Insight 4: Confidence Is Core to AI Safety

An AI system without confidence is like a car without seatbelts:
- Doesn't know when to trust
- Doesn't know when to refuse
- Users can't make informed decisions

### Insight 5: Simplicity Is the Ultimate Complexity

Needle 2's API philosophy: **leave simplicity to users, keep complexity to ourselves**.

---

## Use Cases

| Scenario | Why Recommended |
|----------|-----------------|
| 📱 Mobile app AI | 28MB RAM, no network |
| ⌚ Wearables | Ultra-low power, real-time |
| 🏠 Smart home control | Local processing, private |
| 🤖 Robot real-time decisions | Fast response, no cloud |
| 📊 Structured extraction | Byte-level grammar, 100% valid JSON |
| 🔧 Tool calling automation | Native tool calling optimization |

---

## Conclusion

Needle 2 represents a significant direction: **not making AI more powerful, but making AI more deployable**.

In the process of AI landing on actual products, **not the model itself, but deployment convenience and reliability** often becomes the deciding factor. Through ultra-small size, no network dependency, built-in confidence and other features, Needle 2 provides a viable solution for AI on edge devices.

Its emergence reminds us: **in the AI field, sometimes less is more, specialization is strength**.

If you're looking for a tool-calling model that can run on edge devices, Needle 2 is worth trying.

---

## References

| Resource | Link |
|----------|------|
| GitHub | [github.com/cactus-compute/needle](https://github.com/cactus-compute/needle) |
| PyPI | `pip install cactus-needle` |
| Documentation | `doc/apis.md`, `doc/finetuning.md` |
| Playground | `needle playground` |

---

*This article is organized from the Needle 2 project's GitHub repository.*
