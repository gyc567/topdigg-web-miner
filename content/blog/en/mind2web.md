---
title: "Mind2Web: The World's First Real-World Web Agent Benchmark Dataset — Teaching AI to Complete Complex Tasks on Any Website"
date: "2026-08-14"
description: "In-depth analysis of Mind2Web by OSU-NLP-Group — the first LLM-based web agent benchmark using real websites, featuring 2,000+ tasks across 137 websites and 31 domains, with three-tier generalization evaluation"
tags:
  - Mind2Web
  - Web Agent
  - LLM
  - Large Language Models
  - Web Navigation
  - AI Agent
  - NeurIPS
  - Dataset
  - Artificial Intelligence
categories:
  - AI Datasets
  - Large Language Models
  - Web Agents
  - AI Research
  - Artificial Intelligence Agents
---

# Mind2Web: The World's First Real-World Web Agent Benchmark Dataset — Teaching AI to Complete Complex Tasks on Any Website

## Background and Core Problem

### Why Do We Need Web Agents?

In today's internet era, users need to complete various complex tasks on countless websites every day — booking flights, searching for information, filling forms, managing social media, and more. These seemingly simple operations require humans to spend significant time learning and adapting to each new website.

**The key question**: Can we train an AI agent that, like a human, can understand natural language instructions, autonomously navigate and operate on any website, and complete complex long-horizon tasks?

This is precisely the core problem Mind2Web aims to solve.

### Limitations of Existing Datasets

Before Mind2Web, Web agent research faced two major challenges:

| Dataset Type | Problem | Representative Datasets |
|-------------|---------|------------------------|
| Simulated Environments | Too simplified, cannot reflect real website complexity | MiniWoB, WebShop |
| Limited Website Coverage | Cannot evaluate generalization, models may "rote learn" | ALFWorld, WebArena |

These datasets either use artificially constructed simplified environments or cover only a small number of websites and tasks, making it impossible to truly evaluate an AI agent's generalization ability in the real web world.

### The Birth of Mind2Web

> **"We introduce Mind2Web, the first dataset for developing and evaluating generalist agents for the web that can follow language instructions to complete complex tasks on any website."**
> — Mind2Web Paper

Mind2Web was developed by the Ohio State University NLP Research Group (OSU-NLP-Group) and received Spotlight recognition at NeurIPS 2023, becoming an important milestone in Web agent research.

---

## Project Overview and Core Statistics

### What is Mind2Web?

Mind2Web is the **world's first LLM-based web agent benchmark dataset using real websites**, with the following core characteristics:

- 🌍 **Real Website Environment**: Uses real internet websites, not simulated environments
- 📊 **Large-Scale Dataset**: Over 2,000 open-ended tasks
- 🌐 **Broad Domain Coverage**: 137 real websites across 31 domains
- 🎯 **Three-Tier Generalization Evaluation**: Supports cross-task, cross-website, and cross-domain generalization testing

### Core Statistics

| Metric | Value |
|--------|-------|
| Total Tasks | 2,350 |
| Websites Covered | 137 |
| Domains Covered | 31 |
| Average Task Length | 7.3 action steps |
| Average Page Elements | 1,135 DOM elements per page |
| Training Set Size | 1,009 instances |
| Test Set Size | 1,341 instances |

---

## Dataset Design Philosophy

### Core Principles: Real, Open, Practical

Mind2Web's design philosophy is built on three core principles:

#### 1. Real-World First

> **"Existing datasets for web agents either use simulated websites or only cover a limited set of websites and tasks, thus not suitable for generalist web agents."**

Mind2Web坚持使用真实网站，这带来了：
- **Authenticity**: Reflects the complexity of real websites (including various layouts, ads, popups, etc.)
- **Diversity**: Different websites have completely different design languages and interaction patterns
- **Challenge**: The irregularity and dynamism of real websites cannot be replicated in simulated environments

#### 2. Open-Domain Task Design

Tasks are not preset fixed templates but are **actually proposed and completed by crowdsourced workers**:

```
Three-Phase Data Collection:
┌─────────────────────────────────────────────────────┐
│  Phase 1: Task Proposal                             │
│  Workers propose feasible tasks for given websites   │
└─────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────┐
│  Phase 2: Task Demonstration                        │
│  Workers demonstrate task completion using Playwright│
└─────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────┐
│  Phase 3: Task Verification                         │
│  Authors verify all actions are clean and accurate   │
└─────────────────────────────────────────────────────┘
```

#### 3. Tiered Generalization Evaluation

To comprehensively evaluate an agent's generalization ability, Mind2Web设计了**三个难度递增的测试分割**：

| Split Type | Training Data | Test Data | Difficulty | Evaluation Focus |
|-----------|--------------|-----------|------------|-----------------|
| **Cross Task** | Same-website tasks | New tasks on same website | ⭐⭐ | Task-level generalization |
| **Cross Website** | Same-domain websites | New websites in same domain | ⭐⭐⭐ | Website-level generalization |
| **Cross Domain** | Specific domain tasks | Entirely new technical domains | ⭐⭐⭐⭐⭐ | Domain-level generalization |

---

## Technical Architecture Deep Dive

### Two-Stage Pipeline Design

Mind2Web's technical solution adopts a **two-stage pipeline**, which is its core innovation:

```
                    ┌─────────────────────────────────────┐
                    │         User Natural Language Task    │
                    │   "Find one-way flights from NYC to LA"│
                    └─────────────────────────────────────┘
                                    ↓
                    ┌─────────────────────────────────────┐
                    │    Stage 1: Candidate Generation      │
                    │         DeBERTa-v3-base Encoder       │
                    │    Score query-candidate pairs         │
                    │         Recall@50 ≈ 85%              │
                    └─────────────────────────────────────┘
                                    ↓
                    ┌─────────────────────────────────────┐
                    │    Stage 2: Action Prediction        │
                    │         Flan-T5 Seq2seq Model         │
                    │   Task description + HTML context    │
                    │         Output: CLICK/TYPE/SELECT     │
                    └─────────────────────────────────────┘
                                    ↓
                    ┌─────────────────────────────────────┐
                    │            Execute Action Sequence    │
                    │      Complete user's complex task     │
                    └─────────────────────────────────────┘
```

### Stage 1: Candidate Generation

#### Why is Candidate Generation Needed?

Real web pages contain a large number of elements (Mind2Web averages 1,135 DOM elements per page), directly inputting all of them to an LLM is both **inefficient** and **costly**.

#### Solution

Use a **DeBERTa-v3-base encoder model** to score and filter candidate elements:

```python
# Candidate generation example
model = AutoModel.from_pretrained("osunlp/MindAct_CandidateGeneration_deberta-v3-base")

# Input: query-candidate element pairs
scores = model.score(query, candidate_elements)

# Output: Top-50 candidate elements
top_candidates = select_top_k(scores, k=50)
```

**Performance**: Recall@50 ≈ 85%, meaning 85% of correct elements appear in the Top-50 candidates.

### Stage 2: Action Prediction

#### Model Options

Mind2Web supports multiple action prediction models:

| Model Type | Model Size | Characteristics |
|-----------|-----------|----------------|
| Flan-T5 | Base / Large / XL | Open source, can be deployed locally |
| GPT-3.5/GPT-4 | API calls | Better performance, higher cost |

#### Multi-Choice QA Format

For LLMs (like GPT series), Mind2Web adopts **multi-choice QA formatting**:

```python
# QA formatting for action prediction
prompt = f"""
Task: {task_description}

Current page contains the following interactive elements:
{formatted_candidates}

Which element should be operated on and how?

A) Click element [button: "Search flights"]
B) Type "New York" into [input: "From"]
C) Select "One-way" from [select: "Trip type"]
...
"""
```

#### Action Types

Mind2Web defines three basic action types:

| Action | Description | Example |
|--------|-------------|---------|
| **CLICK** | Click an element | Click buttons, links |
| **TYPE** | Input text | Fill text in input fields |
| **SELECT** | Select options | Choose from dropdown menus |

---

## Task Types and Examples

### Diverse Real-World Tasks

Mind2Web contains rich and diverse task types, covering all aspects of users' daily online lives:

#### 1. Travel and Transportation
```
Task: Find one-way flights from New York to Los Angeles on Expedia
- Actions: Input origin city → Input destination → Select date → Click search
- Difficulty: Involves multi-step form filling and dynamic content loading
```

#### 2. Healthcare
```
Task: Find interactions between a drug and other medications
- Actions: Go to drug website → Search drug name → View interaction info
- Difficulty: Requires understanding professional domain terminology
```

#### 3. Financial Services
```
Task: Apply for a phone with a carrier plan
- Actions: Select phone model → Select plan → Fill personal info → Submit application
- Difficulty: Involves multi-page flow and complex form logic
```

#### 4. Social Media
```
Task: Find and follow a tech blogger on Twitter
- Actions: Search username → Go to profile → Click follow
- Difficulty: Requires understanding social media interaction patterns
```

#### 5. Content Discovery
```
Task: Find suspense movies released in 2020 on Netflix
- Actions: Go to Netflix → Select category → Filter by year → Browse results
- Difficulty: Involves multi-dimensional filtering and content discovery
```

---

## Evaluation Metrics and Experimental Results

### Evaluation Metrics System

Mind2Web provides multi-dimensional evaluation metrics:

#### 1. Accuracy Metrics

| Metric | Calculation | Best Use Case |
|--------|-------------|---------------|
| **Macro Average Accuracy** | Equal weight for all tasks | Paper comparison (recommended) |
| **Micro Average Accuracy** | Weighted by task instance count | May bias toward websites with more tasks |

#### 2. Candidate Recall

- **Recall@K**: Proportion of correct elements appearing in Top-K candidates
- Evaluates the quality of the candidate generation stage

### Baseline Model Performance

| Model | Cross Task | Cross Website | Cross Domain |
|-------|-----------|--------------|--------------|
| MindAct (Flan-T5-base) | 40.2% | 28.1% | 16.4% |
| MindAct (Flan-T5-large) | 47.5% | 32.7% | 19.5% |
| MindAct (Flan-T5-xl) | 52.1% | 38.9% | 24.3% |
| GPT-3.5 (3-shot) | 48.2% | 33.5% | 20.8% |
| GPT-4 (3-shot) | 57.6% | 42.3% | 28.9% |

### Key Findings

#### Finding 1: LLMs Show Initial Generalization Ability

> **"Our solution demonstrates a decent level of performance, even on websites or entire domains the model has never seen before."**

This proves that LLM-based web agents have initial cross-domain generalization capability.

#### Finding 2: Candidate Filtering is Crucial

Directly inputting raw HTML to LLMs performs poorly, but **first filtering candidate elements with a small LM (DeBERTa)** significantly improves LLM effectiveness and efficiency.

#### Finding 3: Still Enormous Room for Improvement

> **"But there is still a substantial room to improve towards truly generalizable agents."**

Even the most advanced GPT-4 achieves only 28.9% accuracy in the Cross Domain setting, indicating that current technology is still far from truly general-purpose web agents.

---

## MindAct Model Implementation

### Project Structure

```
Mind2Web/
├── data/
│   ├── train/                  # Training data (1,009 instances)
│   ├── test/
│   │   ├── cross_task/         # Cross-task test set (252)
│   │   ├── cross_website/      # Cross-website test set (177)
│   │   └── cross_domain/       # Cross-domain test set (912)
│   └── annotation/             # Annotation data
├── src/
│   ├── candidate_generation/  # Candidate generation model
│   ├── action_prediction/      # Action prediction model
│   └── utils/                 # Utility functions
├── scripts/
│   ├── evaluation.py           # Evaluation script
│   └── inference.py           # Inference script
└── README.md
```

### Quick Start

#### Environment Setup

```bash
# Clone the repository
git clone https://github.com/OSU-NLP-Group/Mind2Web.git
cd Mind2Web

# Create virtual environment
python -m venv mind2web-env
source mind2web-env/bin/activate  # Linux/Mac
# mind2web-env\Scripts\activate  # Windows

# Install dependencies
pip install -r requirements.txt
```

#### Key Dependencies

```txt
# requirements.txt key dependencies
torch>=2.0.0
transformers>=4.28.0
deepspeed>=0.9.0
beautifulsoup4>=4.12.0
playwright>=1.40.0
```

#### Data Download

```python
# Download dataset from HuggingFace
from datasets import load_dataset

# Load complete dataset
dataset = load_dataset("osunlp/Mind2Web")

# Load specific splits
train_data = load_dataset("osunlp/Mind2Web", split="train")
test_cross_task = load_dataset("osunlp/Mind2Web", split="test_cross_task")
test_cross_website = load_dataset("osunlp/Mind2Web", split="test_cross_website")
test_cross_domain = load_dataset("osunlp/Mind2Web", split="test_cross_domain")
```

#### Model Download

```python
# Load candidate generation model
from transformers import AutoModel, AutoTokenizer

model_name = "osunlp/MindAct_CandidateGeneration_deberta-v3-base"
tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModel.from_pretrained(model_name)
```

#### Inference Example

```python
import json
from mindact import MindActPipeline

# Initialize pipeline
pipeline = MindActPipeline(
    candidate_model="osunlp/MindAct_CandidateGeneration_deberta-v3-base",
    action_model="flan-t5-large",
    device="cuda"
)

# Load task
task = {
    "instruction": "Find one-way flights from New York to Los Angeles",
    "html": "<html>...</html>",  # Page HTML
    "dom_trace": [...]  # DOM element list
}

# Run inference
result = pipeline.predict(task)
print(f"Predicted actions: {result['actions']}")
```

#### Model Evaluation

```bash
# Use evaluation script
python scripts/evaluation.py \
    --model flan-t5-large \
    --split test_cross_domain \
    --output results.json

# View results
python scripts/analysis.py --results results.json
```

---

## Extensions and Related Tools

### SeeAct: Enhanced Web Agent Framework

[SeeAct](https://osu-nlp-group.github.io/SeeAct/) is the Mind2Web team's follow-up work, further enhancing web agent capabilities:

- 🔍 **Finer Visual Grounding**: Understand page layout with visual information
- 🎯 **More Accurate Element Recognition**: Reduce misclicks and misoperations
- 📈 **Better Generalization Performance**: Significant improvements on Mind2Web

### Online-Mind2Web: Online Learning Extension

[Online-Mind2Web](https://github.com/OSU-NLP-Group/Online-Mind2Web) explores the online learning paradigm:

- 🌐 **Dynamic Environment Interaction**: Interactive learning on real websites
- 🔄 **Continuous Capability Improvement**: Continuously improve strategies through environment interaction
- 🎮 **Closer to Human Learning**: Simulates how humans explore and learn new websites

### Multimodal-Mind2Web: Multimodal Extension

[Multimodal-Mind2Web](https://huggingface.co/datasets/osunlp/Multimodal-Mind2Web) adds visual modality:

- 🖼️ **Paired Screenshots**: Each DOM snapshot paired with corresponding page screenshot
- 👁️ **Vision-Language Alignment**: Supports multimodal web agent research
- 📸 **Richer Context**: Combine visual and text information to understand pages

---

## Design Philosophy Summary

### 1. Real-World First Principle

Mind2Web's most important design decision is **insisting on using real websites**. This makes the dataset reflect the complexity of the real internet but also brings challenges (such as websites changing, content becoming invalid, etc.). The team ensured data longevity by providing DOM snapshots and MHTML formats.

### 2. Task-Oriented Evaluation

Unlike traditional input-output matching evaluation, Mind2Web adopts **task completion rate** as the core evaluation metric. This means agents need to maintain correct direction across multiple action steps and ultimately complete the entire task.

### 3. Tiered Generalization

Through three increasingly difficult test splits (Cross Task, Cross Website, Cross Domain), Mind2Web establishes a **hierarchical generalization evaluation system** that helps researchers precisely identify generalization bottlenecks.

### 4. Small Model Assists Large Model

The two-stage pipeline design embodies the philosophy of **division of labor and collaboration**: small efficient models (DeBERTa) handle information filtering, large models (Flan-T5/GPT) handle complex reasoning. This design significantly reduces computational costs while maintaining performance.

### 5. Open Source and Openness

Mind2Web adheres to **open-sourcing datasets, code, and models**, providing the community with:
- Complete datasets (HuggingFace)
- Trained models (HuggingFace)
- Complete evaluation framework
- Detailed documentation and examples

---

## Core Insights and Conclusion Summary

### Core Insights

#### Insight 1: Real Environment Testing is Key to Web Agent Research

Most current web agent research is conducted in simulated environments, which is convenient for evaluation but cannot truly reflect agent performance in the complex and changing real internet. Mind2Web fills this gap by providing the first large-scale benchmark based on real websites.

#### Insight 2: Candidate Filtering is Key for LLMs Processing Long HTML

Real web pages have a large number of DOM elements, and directly inputting them to LLMs is neither practical nor efficient. Mind2Web proves that **first filtering candidate elements with a small LM** can significantly improve efficiency and effectiveness. This paradigm has been widely adopted by subsequent research.

#### Insight 3: Cross-Domain Generalization is the Core Challenge

Experimental results show that even the most advanced GPT-4 achieves only 28.9% accuracy in the Cross Domain setting. This indicates that **domain generalization** remains the core bottleneck of current web agent technology, requiring more research attention.

#### Insight 4: Two-Stage Pipeline is an Effective Architecture

The two-stage design of candidate generation + action prediction achieves a good balance between performance and efficiency. This architecture design has been referenced and extended by multiple subsequent web agent works.

#### Insight 5: Multimodal is the Future Direction

The Mind2Web team's follow-up work (SeeAct, Multimodal-Mind2Web) shows that **combining visual information** can further improve web agent performance, making multimodal the important development direction for web agent research.

### Methodological Contributions

| Contribution Type | Specific Content |
|------------------|-----------------|
| **Dataset Contribution** | First real web agent benchmark, 137 websites/31 domains/2,350 tasks |
| **Evaluation Framework Contribution** | Three-tier generalization evaluation system, multi-dimensional evaluation metrics |
| **Model Contribution** | Complete MindAct model with training/inference code |
| **Practical Contribution** | Two-stage pipeline design, reproducible baselines |

### Limitations

1. **Website Dynamics**: Real websites constantly change, which may affect data timeliness
2. **Offline Evaluation Limitation**: Current evaluation is offline and cannot reflect the complexity of online interaction
3. **Single Interaction Modality**: Mainly supports CLICK/TYPE/SELECT, limited support for more complex interactions
4. **Cost Considerations**: Using large models like GPT-4 for evaluation is expensive

### Future Outlook

| Direction | Description |
|----------|------------|
| **Online Learning** | Interactive learning paradigm explored by Online-Mind2Web |
| **Multimodal Fusion** | Methods combining visual information in SeeAct and other works |
| **More Complex Tasks** | Longer-horizon reasoning, multi-turn dialogue, and more complex interaction patterns |
| **Practical Applications** | Applying web agent technology to real products |
| **Safety** | Ensuring agent behavior safety and reliability in real environments |

---

## References

| Resource | Link |
|---------|------|
| Paper (arXiv) | [arxiv.org/abs/2306.06070](https://arxiv.org/abs/2306.06070) |
| Project Website | [osu-nlp-group.github.io/Mind2Web/](https://osu-nlp-group.github.io/Mind2Web/) |
| GitHub Repository | [github.com/OSU-NLP-Group/Mind2Web](https://github.com/OSU-NLP-Group/Mind2Web) |
| Dataset (HuggingFace) | [huggingface.co/datasets/osunlp/Mind2Web](https://huggingface.co/datasets/osunlp/Mind2Web) |
| Candidate Generation Model | [huggingface.co/osunlp/MindAct_CandidateGeneration_deberta-v3-base](https://huggingface.co/osunlp/MindAct_CandidateGeneration_deberta-v3-base) |
| SeeAct Extension | [osu-nlp-group.github.io/SeeAct/](https://osu-nlp-group.github.io/SeeAct/) |
| Online-Mind2Web | [github.com/OSU-NLP-Group/Online-Mind2Web](https://github.com/OSU-NLP-Group/Online-Mind2Web) |

---

## Conclusion

Mind2Web is an important milestone in web agent research. It not only provides the first large-scale benchmark based on real websites but also establishes a complete evaluation framework and technical solution. Its two-stage pipeline design and three-tier generalization evaluation system provide important reference for subsequent research.

However, experimental results also clearly show that current web agent technology still has a long way to go before truly general-purpose AI assistants that can autonomously work on any website. The 28.9% Cross Domain accuracy reminds us that **domain generalization** remains the core challenge facing AI agents.

With the continuous development of multimodal technology, online learning methods, and more powerful foundation models, we have reason to believe that truly general-purpose web agents will become possible in the near future. Mind2Web has laid an important research foundation for this goal.

---

**Citation**:
```
@misc{deng2023mind2web,
  title={Mind2Web: Towards a Generalist Agent for the Web},
  author={Xiang Deng and Yu Gu and Boyuan Zheng et al.},
  year={2023},
  eprint={2306.06070},
  archivePrefix={arXiv},
  primaryClass={cs.CL}
}
```
