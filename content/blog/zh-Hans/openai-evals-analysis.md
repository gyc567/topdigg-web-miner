---
title: "OpenAI Evals 深度解析：19K Star 的 LLM 评估框架——不写代码也能构建高质量评测"
description: "全面解析 OpenAI Evals——OpenAI 官方出品的 LLM 评估框架，19,105 Star，3,047 Fork。核心思想：在 LLM 应用开发中，构建高质量评估是你能做的最有影响力的事。支持两种评估范式：基础评估（Match/Includes/FuzzyMatch/JsonMatch）和模型评分评估（fact/closedqa/battle），通过 YAML 配置即可运行，无需编写评估代码。包含完整的评测注册表、数据格式规范、从零构建评估的端到端教程，以及 Greg Brockman 关于评估重要性的核心观点。"
date: "2026-08-05"
author: "TopDigg Research Team"
tags: ["OpenAI", "Evals", "LLM", "Evaluation", "Benchmark", "Python", "GPT", "Testing", "AI"]
categories: ["Deep Dive"]
keywords: ["OpenAI Evals", "LLM 评估", "模型评测", "benchmark", "评测框架", "GPT", "模型评分", "评测注册表", "AI 测试", "评估模板"]
---

# OpenAI Evals 深度解析：19K Star 的 LLM 评估框架——不写代码也能构建高质量评测

> 核心思想：**在 LLM 应用开发中，构建高质量评估是你能做的最有影响力的事。** 没有评估，你很难理解不同模型版本如何影响你的用例。OpenAI 总裁 Greg Brockman 说："没有评估，你就是在盲飞。" OpenAI Evals 是 OpenAI 官方出品的 LLM 评估框架——19,105 Star，3,047 Fork——支持两种评估范式：**基础评估**（Match/Includes/FuzzyMatch/JsonMatch）和**模型评分评估**（fact/closedqa/battle），通过 YAML 配置即可运行，无需编写评估代码。核心哲学：**评估即产品，评测数据即资产。**

---

## 一、项目说明

### 1.1 它是什么？

**OpenAI Evals** 是一个**LLM 评估框架**——它不教你如何训练模型，而是教你如何评估模型。核心定位：**从「我觉得模型不错」到「我用数据证明模型不错」的范式转移**。

### 1.2 关键数据

- 储存库：`https://github.com/openai/evals`
- Stars：**19,105**
- Forks：**3,047**
- 语言：**Python**
- License：**NOASSERTION**（MIT + 贡献条款）
- 创建时间：2023-01-23
- 作者：**OpenAI**
- 最低 Python 版本：**3.9**
- 支持的模型：GPT-3.5-Turbo、GPT-4、GPT-4o 等所有 OpenAI 模型

### 1.3 它解决什么问题？

LLM 应用开发的核心痛点：你怎么知道新模型版本是更好还是更差？手动测试 100 个 prompt 不够全面，自动化测试又不知道从何下手。OpenAI Evals 的答案：**提供一个标准化的评估框架**——定义数据格式、评估模板、评分逻辑，让你用 YAML 配置就能运行评测，无需编写评估代码。

---

## 二、核心思想

### 2.1 「评估即产品」

Greg Brockman 说："没有评估，你就是在盲飞。" 这意味着评估不是开发的附属品，而是产品的核心组件。一个好的评估系统能告诉你：模型升级后，你的用例是变好了还是变差了。

### 2.2 两种评估范式

**基础评估（Basic Eval Templates）**：适用于模型输出变化很小的场景，如选择题或简单问答。

- **Match**：精确匹配——模型输出是否以正确答案开头？
- **Includes**：包含匹配——模型输出是否包含正确答案？
- **FuzzyMatch**：模糊匹配——模型输出和正确答案是否互相包含？
- **JsonMatch**：JSON 匹配——模型输出的 JSON 是否与参考 JSON 一致？

**模型评分评估（Model-Graded Eval Templates）**：适用于模型输出变化较大的场景，如开放式问题。

- **fact**：事实一致性——模型输出是正确答案的子集、超集、等价集，还是有分歧？
- **closedqa**：问答质量——模型回答是否相关、简洁、正确？
- **battle**：头对头比较——两个模型的输出，哪个更好？

### 2.3 「不写代码也能构建评估」

这是 OpenAI Evals 最核心的设计哲学。通过 YAML 配置 + JSONL 数据文件，你可以构建大多数评估，无需编写任何 Python 代码。只有当你需要完全自定义的评估逻辑时，才需要写代码。

### 2.4 评估注册表（Eval Registry）

所有评估都注册在一个中心化的注册表中。每个评估有一个唯一 ID（格式：`<eval_name>.<split>.<version>`），包含评估类、参数、数据路径。这让评估可复现、可版本化、可共享。

### 2.5 模型评分的「元评估」（Meta-Eval）

模型评分评估本身也需要验证——它是否真的在评估正确的东西？OpenAI Evals 引入了「元评估」概念：为每个模型评分评估添加「选择标签」（human-provided labels），然后运行元评估来验证评估质量。好的模型评分评估，元评估分数应该接近 1.0。

---

## 三、设计哲学

### 3.1 「评估是盲飞的反义词」

没有评估的 LLM 开发就像没有仪表盘的飞行——你不知道自己在哪里，要去哪里。OpenAI Evals 通过标准化的评估框架，让 LLM 应用开发从「我觉得」变成「数据证明」。

### 3.2 「模板化降低门槛」

不是每个评估都需要写代码。通过 Match/Includes/FuzzyMatch/JsonMatch 等基础模板，以及 fact/closedqa/battle 等模型评分模板，大多数评估只需要 YAML 配置 + JSONL 数据。

### 3.3 「可复现性是评估的生命线」

同一个评估名 + 同一个模型 = 应该得到相似的结果。OpenAI Evals 通过注册表、版本号、数据路径规范化，确保评估的可复现性。

### 3.4 「元评估验证评估本身」

模型评分评估引入了一个新问题：评估本身是否可靠？OpenAI Evals 的答案是「元评估」——用人工标签验证评估逻辑，确保评估在评估正确的东西。

### 3.5 「开放但有标准」

任何人都可以提交评估，但 OpenAI 有明确的评审标准：主题一致性、挑战性、方向清晰性、精心设计。不是所有评估都会被接受。

---

## 四、详细教程

### 4.1 安装与配置

**Step 1：安装**
```bash
pip install evals
# 或者（如果你想贡献评估）
pip install -e .
```

**Step 2：配置 API Key**
```bash
export OPENAI_API_KEY="your-api-key"
```

**Step 3：下载评测数据**
```bash
cd evals
git lfs fetch --all
git lfs pull
```

### 4.2 运行现有评估

```bash
oaieval gpt-3.5-turbo <eval_name>
```

例如：
```bash
oaieval gpt-3.5-turbo coqa-match
oaieval gpt-4 fact
```

### 4.3 构建自己的评估（不写代码）

**Step 1：准备数据（JSONL 格式）**

基础评估（Match/Includes/FuzzyMatch）需要 `input` 和 `ideal` 两个字段：
```json
{"input": [{"role": "user", "content": "What is the capital of France?"}], "ideal": ["Paris"]}
{"input": [{"role": "user", "content": "What is 2+2?"}], "ideal": ["4"]}
```

模型评分评估（fact/closedqa）需要更多字段，取决于评估模板。

**Step 2：注册评估**

在 `evals/registry/evals/` 目录创建 YAML 文件：
```yaml
my-eval:
  id: my-eval.dev.v0
  description: 我的第一个评估
  metrics: [accuracy]

my-eval.dev.v0:
  class: evals.elsuite.basic.match:Match
  args:
    samples_jsonl: my-eval/samples.jsonl
```

**Step 3：放置数据**

将 JSONL 文件放在 `evals/registry/data/my-eval/samples.jsonl`。

**Step 4：运行**
```bash
oaieval gpt-3.5-turbo my-eval
```

### 4.4 构建模型评分评估

**Step 1：选择或创建评估模板**

可以在 `evals/registry/modelgraded/` 中选择现有模板（如 `fact.yaml`、`closedqa.yaml`），或创建新的 YAML 文件。

**Step 2：配置评估参数**

```yaml
fact:
  prompt: |-
    以下是一个问题和一个答案。请判断答案是否与参考答案一致。
    问题：{input}
    模型答案：{completion}
    参考答案：{ideal}
    
    请选择：
    A. 模型答案是参考答案的子集
    B. 模型答案是参考答案的超集
    C. 模型答案与参考答案等价
    D. 模型答案与参考答案有分歧
    E. 答案不同但不影响事实性
  choice_strings: ["A", "B", "C", "D", "E"]
  choice_scores:
    A: 1
    B: 1
    C: 1
    D: 0
    E: 1
  eval_type: cot_classify
```

**Step 3：注册并运行**

```bash
oaieval gpt-4 my-model-graded-eval
```

### 4.5 评估最佳实践

- **主题一致性**：一组 prompt 应该围绕同一个用例、主题域或失败模式
- **挑战性**：如果 GPT-4 在所有 prompt 上都表现很好，这个评估就不够有趣
- **方向清晰性**：数据应该包含正确行为的明确信号
- **精心设计**：提交前检查 prompt 设计、评估模板选择、结果抽检

---

## 五、归纳总结（观点与结论）

1. **「评估是 LLM 应用开发中最有影响力的事。」** 没有评估，你无法量化模型升级带来的影响。OpenAI Evals 通过标准化框架，让评估从「可选」变成「必须」。

2. **「不写代码也能构建评估。」** 通过 YAML 配置 + JSONL 数据，大多数评估无需编写 Python 代码。这降低了评估门槛，让更多人能参与评估建设。

3. **「模型评分是自动化评估的未来。」** 对于开放式输出，人工评估不可扩展。模型评分评估（用模型评估模型）提供了可扩展的自动化方案，但需要元评估来验证可靠性。

4. **「可复现性是评估的生命线。** 同一个评估名 + 同一个模型 = 应该得到相似的结果。注册表、版本号、数据路径规范化确保了这一点。

5. **「评估需要精心设计。」** 好的评估需要主题一致性、挑战性、方向清晰性。不是所有评估都值得提交——质量比数量更重要。

6. **「开放但有标准。」** 任何人都可以提交评估，但 OpenAI 有明确的评审标准。这确保了评估注册表的质量，避免了垃圾评估的涌入。

---

## 参考资料

- 储存库：`https://github.com/openai/evals`
- 构建评估指南：`https://github.com/openai/evals/blob/main/docs/build-eval.md`
- 评估模板：`https://github.com/openai/evals/blob/main/docs/eval-templates.md`
- 运行评估指南：`https://github.com/openai/evals/blob/main/docs/run-evals.md`
- 自定义评估逻辑：`https://github.com/openai/evals/blob/main/docs/custom-eval.md`
- OpenAI Cookbook 入门教程：`https://cookbook.openai.com/examples/evaluation/getting_started_with_openai_evals`