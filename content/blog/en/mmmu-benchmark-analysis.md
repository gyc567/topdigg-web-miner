---
title: "MMMU: The Ultimate Multimodal Understanding Challenge for LLMs — Deep Analysis of 11.5K College-Level Benchmark"
date: "2026-08-14"
description: "In-depth analysis of MMMU Benchmark — evaluating large models' multimodal understanding and reasoning on college-level multi-disciplinary tasks, covering 11.5K questions, 30 subjects, and 32 image types, revealing the true capabilities of current top multimodal models"
tags:
  - MMMU
  - Multimodal Large Models
  - LMM
  - LLM Evaluation
  - Vision Language Models
  - AGI
  - CVPR
  - Dataset
  - Artificial Intelligence
  - Multimodal Understanding
categories:
  - AI Datasets
  - Large Language Models
  - Multimodal Learning
  - AI Research
  - LLM Evaluation
---

# MMMU: The Ultimate Multimodal Understanding Challenge for LLMs — Deep Analysis of 11.5K College-Level Benchmark

## Background and Core Problem

### Why Do We Need MMMU?

In the field of artificial intelligence, Large Multimodal Models (LMMs) are advancing at an unprecedented pace. From GPT-4V to Gemini, from LLaVA to Qwen-VL, these models claim to "see" images, "understand" charts, and "reason" about complex information. However, a critical question has always haunted researchers and practitioners: **Do these models truly possess expert-level multimodal understanding capabilities?**

Existing benchmarks have obvious limitations:

| Benchmark Type | Coverage | Knowledge Depth | Image Diversity | Core Problem |
|---------------|----------|----------------|-----------------|-------------|
| Daily Scene Benchmarks | Daily life | Common sense | Photos, simple charts | Cannot evaluate professional knowledge |
| Academic Benchmarks | Limited subjects | Shallow knowledge | Single type | Insufficient depth |
| Visual QA Benchmarks | Scattered domains | Surface understanding | Limited formats | Lacks systematic approach |

**The emergence of MMMU is precisely to fill this gap** — it is the first benchmark specifically designed to evaluate large models' multimodal understanding and reasoning capabilities on **college-level multi-disciplinary tasks**.

### Core Objectives of MMMU

> **"We introduce MMMU, a new benchmark designed to evaluate multimodal models on massive multi-discipline tasks demanding college-level subject knowledge and deliberate reasoning."**
> — MMMU Paper

MMMU's design objectives are clear and ambitious:

1. **Evaluate comprehensive capabilities of perception, knowledge, and reasoning**: Not just testing what models "see," but evaluating whether they can combine professional knowledge for correct reasoning
2. **Cover real college exam scenarios**: Questions come from real college exams, quizzes, and textbooks, not artificially synthesized
3. **Test heterogeneous image understanding**: Covering 30+ different image types, requiring models to have broad visual understanding capabilities
4. **Drive towards expert-level AGI**: Use high-difficulty benchmarks to drive the development of next-generation multimodal foundation models

---

## Project Overview and Core Statistics

### What is MMMU?

MMMU (Massive Multi-discipline Multimodal Understanding and Reasoning Benchmark) is a novel large-scale multi-disciplinary multimodal understanding and reasoning benchmark, designed to evaluate AI models' **expert-level multimodal understanding capabilities**.

### Core Statistics

| Metric | Value | Description |
|--------|-------|-------------|
| Total Questions | **11,500+** | Real questions from college exams, quizzes, textbooks |
| Covered Subjects | **30** | Spanning six core domains |
| Subfields | **183** | Detailed professional directions |
| Image Types | **32** | Highly heterogeneous visual content |
| Development Set | 150 samples | For few-shot learning |
| Validation Set | 900 samples | For debugging and quick evaluation |
| Test Set | 10,500 samples | Official evaluation standard |

### Six Core Domains

MMMU covers questions across six major domains:

| Domain | Subject Examples | Difficulty Focus |
|--------|----------------|-----------------|
| **Art & Design** | Art history, Design principles, Visual communication | Creativity + Aesthetics + Professional knowledge |
| **Business** | Finance, Accounting, Marketing, Management | Business logic + Data analysis |
| **Science** | Physics, Chemistry, Biology, Geography | Natural science + Experimental reasoning |
| **Health & Medicine** | Clinical medicine, Pharmacology, Nursing | Medical knowledge + Clinical judgment |
| **Humanities & Social Science** | History, Philosophy, Economics, Sociology | Humanistic understanding + Critical thinking |
| **Tech & Engineering** | Computer science, Electronic engineering, Mechanical engineering | Technical principles + Engineering practice |

---

## Dataset Design Philosophy

### Core Philosophy: Expert-Level Challenge

MMMU's design philosophy centers on one core proposition: **What capabilities does a true multimodal expert need?**

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│              Expert Multimodal Capability Triangle           │
│                                                             │
│                        ▲ Reasoning                           │
│                       /│\                                  │
│                      / │ \                                 │
│                     /  │  \                                │
│                    /   │   \                               │
│                   /    │    \                              │
│                  /──────│──────\                           │
│                 /  Perception │ Knowledge \                 │
│                /─────────────┴─────────────\               │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

MMMU requires models to simultaneously possess:

- **Perception**: Recognizing and understanding visual information in various images
- **Knowledge**: Mastering college-level professional subject knowledge
- **Reasoning**: Logical deduction combining perception and knowledge

### Design Principle 1: Authenticity First

All questions come from **real sources**:

```
Data Collection Process:
┌─────────────────────────────────────────────────────┐
│                                                     │
│   Step 1: Source Collection                          │
│   Collect materials from university websites,       │
│   textbook publishers, online course platforms       │
│                                                     │
└─────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────┐
│                                                     │
│   Step 2: Manual Selection and Adaptation           │
│   Cross-disciplinary student team screens and        │
│   adapts questions to ensure appropriate            │
│   difficulty, clear presentation, complete images   │
│                                                     │
└─────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────┐
│                                                     │
│   Step 3: Quality Review                            │
│   Expert team performs final quality review         │
│   Verifying answer correctness and question validity │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### Design Principle 2: Heterogeneous Image Challenge

MMMU includes **32 highly heterogeneous image types**, which is its unique challenge:

| Image Type | Subject Examples | Understanding Difficulty |
|-----------|-----------------|------------------------|
| Diagrams | Biology, Chemistry | Requires understanding structural relationships |
| Tables | Business, Statistics | Requires parsing row/column information |
| Maps | Geography, History | Requires spatial reasoning |
| Music Sheets | Music | Requires professional notation knowledge |
| Chemical Structures | Chemistry | Requires molecular formula understanding |
| Mathematical Notations | Math, Physics | Requires LaTeX parsing |
| Circuit Diagrams | Electronic engineering | Requires engineering drawing reading |
| Medical Images | Clinical medicine | Requires medical imaging knowledge |
| Paintings | Art history | Requires aesthetic analysis |
| Photos | News, Science | Requires scene understanding |

**Key Insight**: Many image types are rare in conventional training data, making it difficult for models to acquire sufficient domain-specific visual knowledge.

### Design Principle 3: Interleaved Text and Images

Unlike many benchmarks that treat images as independent inputs, MMMU adopts **interleaved text and image design**:

```
Typical MMMU Question Structure:
┌─────────────────────────────────────────────────────┐
│                                                     │
│   [Text Paragraph 1]                                │
│   "Based on the experimental data of the           │
│   following chemical reaction..."                    │
│                                                     │
│   [Chemical Structure Image]                        │
│   [Reaction Equation Image]                        │
│                                                     │
│   [Text Paragraph 2]                                │
│   "Please analyze the reaction type and           │
│   answer questions 1-3"                            │
│                                                     │
│   [Data Table]                                      │
│                                                     │
│   [Question]                                        │
│   1. The reaction type is?                          │
│   A. Oxidation  B. Reduction  C. Decomposition     │
│                                                     │
└─────────────────────────────────────────────────────┘
```

This design **authentically replicates college exam scenarios**, requiring models to:
- Switch context between text and images
- Integrate information from multiple sources
- Handle cross-modal dependencies

### Comparison with Existing Benchmarks

| Dimension | MMMU | Existing Benchmarks |
|-----------|------|-------------------|
| **Knowledge Depth** | College-level professional knowledge | Common sense / daily knowledge |
| **Image Diversity** | 32 heterogeneous images | 2-5 common image types |
| **Subject Breadth** | 6 major domains, 30 subjects | Single domain or limited coverage |
| **Reasoning Complexity** | Requires deliberate professional reasoning | Simple direct reasoning |
| **Real Sources** | Real college exam questions | Artificial synthesis or simple Q&A |

---

## MMMU-Pro: A More Robust Evaluation Version

### Why MMMU-Pro?

In September 2024, the MMMU team launched **MMMU-Pro**, a more rigorous and realistic evaluation version.

### MMMU-Pro's Three-Step Evaluation

```
MMMU-Pro Evaluation Process:

Step 1: Filter Text-Only Answerable Questions
         ↓
    Ensure questions must rely on visual information
         ↓
Step 2: Augment Candidate Options
         ↓
    Increase from 4 options to 10 options
    Reduce random guessing accuracy
         ↓
Step 3: Vision-Only Input Setting
         ↓
    Embed question text within images
    Require models to "see" and "read" simultaneously
```

### Key Findings

MMMU-Pro's evaluation results reveal stunning findings:

| Model | MMMU Accuracy | MMMU-Pro Accuracy | Decline |
|-------|---------------|-------------------|---------|
| GPT-4V | ~56% | ~26.9% | -52% |
| Other top models | ~40-50% | ~16.8-20% | -50%+ |

**Conclusion**: When truly requiring visual understanding rather than textual reasoning, all models show dramatic performance drops.

---

## Technical Architecture

### Evaluation Pipeline

MMMU provides a complete evaluation pipeline:

```
                    ┌─────────────────────────────────────┐
                    │         Model Under Evaluation      │
                    │   (Open-source LMM or API Model)     │
                    └─────────────────────────────────────┘
                                    ↓
                    ┌─────────────────────────────────────┐
                    │      Question Formatting            │
                    │   (Prompt Template)                 │
                    │   - Format MCQ as QA format         │
                    │   - Keep open Q in original format   │
                    │   - Optional Chain-of-Thought        │
                    └─────────────────────────────────────┘
                                    ↓
                    ┌─────────────────────────────────────┐
                    │           Model Inference           │
                    │   - Image encoding                  │
                    │   - Text understanding             │
                    │   - Cross-modal fusion              │
                    │   - Answer generation               │
                    └─────────────────────────────────────┘
                                    ↓
                    ┌─────────────────────────────────────┐
                    │           Answer Parsing            │
                    │   - Extract model output answer     │
                    │   - Compare with ground truth        │
                    │   - Calculate accuracy              │
                    └─────────────────────────────────────┘
```

### Supported Model Types

MMMU evaluation suite supports various models:

| Model Type | Representative Models | Deployment |
|-----------|---------------------|-----------|
| Closed API Models | GPT-4V, Claude, Gemini | API calls |
| Open-source LMM | LLaVA, Qwen-VL, InternVL | Local deployment |
| Open LLM + Visual Encoder | BLIP-2, InstructBLIP | Local deployment |

### Chain-of-Thought (CoT) Support

MMMU supports Chain-of-Thought reasoning with optional modes:

```python
# Standard Mode (Direct)
prompt = """
Question: {question}
Options: {options}
Please select the correct answer directly.
"""

# CoT Mode (Chain-of-Thought)
prompt = """
Question: {question}
Options: {options}
Please analyze the question first, reason step by step, then give the final answer.
"""
```

**Finding**: CoT generally improves model performance, especially on complex reasoning tasks.

---

## Evaluation Metrics and Experimental Results

### Overall Performance Comparison

Major model performance on MMMU:

| Model | Parameters | MMMU Overall Accuracy | Notes |
|-------|-----------|---------------------|-------|
| **Human Expert** | - | 87.0% | Upper baseline |
| GPT-4V | - | 56.0% | Best closed-source |
| GPT-4o | - | 65.0% | Upgraded version |
| Qwen-VL-7B | 7B | ~35% | Open-source leader |
| LLaVA-1.6-34B | 34B | ~43% | Large open-source |
| InternVL-Chat-V1.2 | - | ~40% | Chinese representative |
| Yi-VL-34B | 34B | ~38% | |

### Performance by Domain

| Domain | GPT-4V | Best Open-source | Gap |
|--------|--------|-----------------|-----|
| Art & Design | ~50% | ~30% | 20% |
| Business | ~55% | ~35% | 20% |
| Science | ~50% | ~30% | 20% |
| Health & Medicine | ~48% | ~28% | 20% |
| Humanities & Social Science | ~55% | ~35% | 20% |
| Tech & Engineering | ~52% | ~32% | 20% |

### Performance by Image Type

This is one of MMMU's most critical insights:

| Image Type | Frequency | GPT-4V | Best Open-source | Random |
|-----------|----------|--------|-----------------|--------|
| Photos | High | High | Relatively high | 25% |
| Paintings | Medium | Medium-high | Medium | 25% |
| Diagrams | High | Medium | Low | 25% |
| Tables | High | Medium | Low | 25% |
| Geometric Shapes | Low | Extremely low | Extremely low | 25% |
| Music Sheets | Low | Extremely low | Extremely low | 25% |
| Chemical Structures | Low | Extremely low | Extremely low | 25% |
| Medical Images | Low | Low | Extremely low | 25% |

**Key Findings**:
1. **Severe frequency bias**: Models perform well on common image types but near random on rare types
2. **Insufficient knowledge coverage**: Even GPT-4V has extremely low accuracy on chemical structures, music sheets, etc.
3. **Questionable generalization**: Current models struggle with visual formats rare in training sets

### Performance by Difficulty Level

| Difficulty | GPT-4V | Best Open-source | Analysis |
|-----------|--------|-----------------|----------|
| Easy | 76.1% | ~50% | Significant gap |
| Medium | 55.6% | ~35% | Gap narrowing |
| Hard | ~30% | ~25% | Gap disappears |

**Startling Finding**: As task difficulty increases, the gap between advanced and ordinary models gradually disappears. This shows that **even GPT-4V faces enormous challenges on truly expert-level tasks**.

### Single Image vs Multi-Image Tasks

| Task Type | GPT-4V | Best Open-source | Description |
|-----------|--------|-----------------|-------------|
| Single-image | ~58% | ~40% | Standard visual QA |
| Multi-image | ~45% | ~28% | Requires multi-source integration |

**Conclusion**: Multi-image tasks are more challenging for all models, requiring stronger information integration capabilities.

---

## Error Analysis: GPT-4V Failure Cases

### Error Type Distribution

MMMU team conducted in-depth analysis on 150 GPT-4V error cases:

| Error Type | Percentage | Description |
|-----------|-----------|-------------|
| **Perception Errors** | ~30% | Image understanding inadequate, missing key visual information |
| **Knowledge Errors** | ~25% | Lack of relevant subject knowledge or improper knowledge application |
| **Reasoning Errors** | ~25% | Problems in logical deduction process |
| **Domain Understanding Errors** | ~15% | Misunderstanding professional terminology or domain-specific concepts |
| **Other Errors** | ~5% | Format misunderstanding, carelessness, etc. |

### Typical Error Case Analysis

#### Case 1: Chemical Structure Misjudgment

```
Question: Identify the functional group of the following organic compound
Image: [Complex chemical structure]

GPT-4V Answer: Aldehyde group (Wrong)
Correct Answer: Ketone group

Analysis: Model failed to correctly identify the C=O position characteristic of ketone group
```

#### Case 2: Chart Information Omission

```
Question: Calculate the current based on the following circuit diagram
Image: [Circuit diagram with multiple resistors]

GPT-4V Answer: [Correct calculation process, but]
Error cause: Misread the connection method of a certain resistor

Correct Answer: A
```

#### Case 3: Music Notation Misunderstanding

```
Question: Identify the key of the following music notation excerpt
Image: [Staff notation]

GPT-4V Answer: C major (Wrong)
Correct Answer: G major

Analysis: Failed to correctly identify the meaning of sharp (♯) symbol
```

---

## Core Insights and Conclusions

### Insight 1: Multimodal Models' "Hallucination" is More Severe Than LLMs

When GPT-4V achieved 56% accuracy on MMMU, many considered this "not bad." However:

> **Fact**: Among 32 image types, more than 10 have accuracy **lower than or close to 25% random guessing level**.

This means models are almost "blind" in many professional domains — they can handle common photos and simple charts, but once it comes to professional image formats, they retreat to "random guessing" mode.

### Insight 2: Knowledge Depth is More Important Than Perception Breadth

Current development direction of multimodal models has biases:

- **Over-focus on perception**: Pursuing larger vision encoders, more image training data
- **Neglecting knowledge depth**: Severe lack of mastery of college-level professional knowledge

**True expert-level multimodal understanding requires**:
1. **Perception**: Recognizing visual elements in images
2. **Knowledge**: Understanding the meaning of these elements in specific disciplines
3. **Reasoning**: Correct judgment combining perception and knowledge

Current models perform acceptably on step 3 (reasoning), but the lack of step 2 (knowledge) is a fatal weakness.

### Insight 3: MMMU-Pro Reveals a More Brutal Truth

MMMU-Pro pushes the vision-only setting to the extreme, revealing alarming results:

> **GPT-4V's accuracy on MMMU-Pro plummeted from 56% to 26.9%.**

This shows current models' "multimodal understanding" largely relies on **powerful OCR capabilities and text understanding**, not true visual understanding. Once forced to "only look at images," performance immediately collapses.

### Insight 4: Gap Between Open-source and Closed-source Models is Narrowing

| Comparison Dimension | 2023 Gap | 2024 Gap |
|---------------------|----------|-----------|
| MMMU Overall | ~30% | ~20% |
| Easy tasks | ~35% | ~25% |
| Difficult tasks | ~15% | ~5% |

**Trend**: On difficult tasks, the gap between open-source and closed-source models has become minimal, showing the entire field is moving toward higher expert-level capabilities.

### Insight 5: Multimodal AGI Requires Interdisciplinary Innovation

MMMU's success reveals a fundamental challenge: **True multimodal expert AI needs breakthroughs across multiple domains**:

```
Multimodal AGI Technology Stack:

┌─────────────────────────────────────────────────┐
│              Expert Application Layer             │
│         (Medical diagnosis, Engineering design,   │
│          Legal analysis)                         │
├─────────────────────────────────────────────────┤
│              Cross-disciplinary Reasoning       │
│      (Knowledge graphs, Domain-adaptive推理)     │
├─────────────────────────────────────────────────┤
│              Multimodal Fusion Layer             │
│    (Multi-granularity fusion of vision,          │
│     language, professional knowledge)            │
├─────────────────────────────────────────────────┤
│              Perception Foundation Layer         │
│       (Image understanding, Chart parsing,       │
│        Professional vision)                      │
└─────────────────────────────────────────────────┘
```

---

## Tutorial: How to Evaluate Your Model on MMMU

### Environment Setup

```bash
# Clone MMMU repository
git clone https://github.com/MMMU-Benchmark/MMMU.git
cd MMMU

# Install dependencies
pip install -r requirements.txt
```

### Dataset Access

MMMU dataset is hosted on HuggingFace:

```python
from datasets import load_dataset

# Load complete MMMU dataset
mmmu = load_dataset("MMMU/MMMU")

# View dataset structure
print(mmmu)
# DatasetDict({
#     test: Dataset({
#         features: ['id', 'question', 'options', 'answer', 'subject', ...],
#         num_rows: 10500
#     })
#     val: Dataset({
#         features: ['id', 'question', 'options', 'answer', 'subject', ...],
#         num_rows: 900
#     })
# })
```

### Evaluating API Models (GPT-4V, etc.)

```python
# mmmu/evaluate.py example
import json
from mmmu.evaluator import Evaluator

# Initialize evaluator
evaluator = Evaluator(
    model_name="gpt-4v",
    api_key="your-api-key"
)

# Load validation set
val_data = load_dataset("MMMU/MMMU", split="val")

# Run evaluation
results = evaluator.evaluate(val_data)

# Output results
print(f"Overall accuracy: {results['overall_accuracy']:.2%}")
print(f"Accuracy by subject: {results['by_subject']}")
```

### Evaluating Open-source Models (LLaVA, etc.)

```python
# Using transformers to evaluate LLaVA
from transformers import AutoProcessor, AutoModelForVision2Seq
import torch

# Load model
model_name = "llava-hf/llava-1.5-13b-hf"
processor = AutoProcessor.from_pretrained(model_name)
model = AutoModelForVision2Seq.from_pretrained(
    model_name, 
    torch_dtype=torch.float16,
    device_map="auto"
)

# Evaluation function
def evaluate_llava(dataset):
    correct = 0
    total = len(dataset)
    
    for item in dataset:
        # Build input
        inputs = processor(
            text=item["question"],
            images=item["image"],
            return_tensors="pt"
        ).to("cuda")
        
        # Generate answer
        outputs = model.generate(**inputs, max_new_tokens=256)
        answer = processor.decode(outputs[0], skip_special_tokens=True)
        
        # Calculate accuracy
        if answer == item["answer"]:
            correct += 1
    
    return correct / total

# Run evaluation
accuracy = evaluate_llava(val_data)
print(f"LLaVA-1.5-13B accuracy: {accuracy:.2%}")
```

### Local Test Set Evaluation

```bash
# Download test set answers
cd mmmu
wget https://huggingface.co/datasets/MMMU/MMMU/raw/main/answer_dict_test.json

# Run local evaluation
python evaluate.py \
    --model gpt-4v \
    --split test \
    --answer_file answer_dict_test.json
```

### Submitting to Official Leaderboard

```bash
# Generate prediction file
python generate_predictions.py \
    --model gpt-4v \
    --split test \
    --output predictions.jsonl

# Submit via script
python submit.py \
    --predictions predictions.jsonl \
    --model-name "GPT-4V"
```

---

## Summary and Outlook

### MMMU's Core Contributions

1. **Filling Evaluation Gap**: First benchmark systematically evaluating college-level multimodal understanding
2. **Revealing Capability Boundaries**: Clarifying current models' strengths and fatal weaknesses
3. **Pointing Development Direction**: Providing R&D direction for next-generation multimodal models
4. **Promoting Field Progress**: Open-sourcing evaluation code, facilitating community collaboration

### Future Outlook

| Direction | Current Status | Improvement Goal |
|-----------|--------------|-----------------|
| Professional Knowledge Acquisition | Severely insufficient | Deep mastery of 30+ subjects |
| Heterogeneous Image Understanding | Most types <30% | Full coverage of 32 image types |
| Multi-image Integration | 45% accuracy | Near single-image level |
| Complex Reasoning | Medium performance | Expert-level |

### Recommendations for Researchers

1. **Don't be misled by aggregate numbers**: Focus on model performance on specific subjects and image types
2. **Take MMMU-Pro seriously**: It better reflects true visual understanding capabilities
3. **Focus on difficult samples**: Analyze model failure cases on Hard difficulty
4. **Explore knowledge enhancement**: Consider introducing external knowledge bases into multimodal reasoning

### Recommendations for Practitioners

1. **Be cautious in professional scenarios**: Current models are far from expert-level
2. **Maintain human review**: Keep human oversight in high-risk applications
3. **Choose appropriate models**: Select the most suitable model based on your image types
4. **Continuously monitor performance**: Regularly re-evaluate model capabilities on MMMU

---

## References

```bibtex
@inproceedings{yue2023mmmu,
  title={MMMU: A Massive Multi-discipline Multimodal Understanding and Reasoning Benchmark for Expert AGI},
  author={Xiang Yue and Yuansheng Ni and Kai Zhang and Tianyu Zheng and Ruoqi Liu and Ge Zhang and Samuel Stevens and Dongfu Jiang and Weiming Ren and Yuxuan Sun and Cong Wei and Botao Yu and Ruibin Yuan and Renliang Sun and Ming Yin and Boyuan Zheng and Zhenzhu Yang and Yibo Liu and Wenhao Huang and Huan Sun and Yu Su and Wenhu Chen},
  booktitle={Proceedings of CVPR},
  year={2024},
}

@inproceedings{yue2025mmmu-pro,
  title={MMMU-Pro: A More Robust Multi-discipline Multimodal Understanding Benchmark},
  author={Xiang Yue and Tianyu Zheng and Yuansheng Ni and Yubo Wang and Kai Zhang and Shengbang Tong and Yuxuan Sun and Botao Yu and Ge Zhang and Huan Sun and Yu Su and Wenhu Chen and Graham Neubig},
  booktitle={Proceedings of ACL},
  year={2025}
}
```

---

> **Related Information**
> - Project Website: https://mmmu-benchmark.github.io/
> - GitHub Repository: https://github.com/MMMU-Benchmark/MMMU
> - HuggingFace Datasets: [MMMU](https://huggingface.co/datasets/MMMU/MMMU) | [MMMU-Pro](https://huggingface.co/datasets/MMMU/MMMU_Pro)
> - Paper Links: [MMMU arXiv](https://arxiv.org/abs/2311.16502) | [MMMU-Pro arXiv](https://arxiv.org/abs/2409.02813)
