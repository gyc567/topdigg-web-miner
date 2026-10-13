---
title: "RSIAgent：无需训练即可让AI在陌生环境中实现递归自我进化"
description: "深入了解RSIAgent：一个免训练的递归自我改进框架，让开源模型在陌生数字环境中自主探索并超越GPT-6 Astra"
date: "2026-10-13"
author: "瑞哥观势"
source:
  original:
    name: "瑞哥观势"
    url: ""
tags: ["AI Agent", "递归自我改进", "开源AI", "机器学习", "自主探索"]
categories: ["AI前沿", "技术研究"]
---

当AI模型进入一个从未见过的数字环境——比如一台没有文档的服务器、一个全新的软件界面——它通常会表现得像个无助的新手。需要人类反复指导，需要大量示例数据，更别提什么"自我进化"了。

但今天要介绍的这个项目，彻底打破了这一刻板印象。

**RSIAgent** 是一个无需训练的递归自我改进框架，让开源模型在陌生数字环境中自主探索，最终超越GPT-6 Astra等多个挑战性基准测试。它登顶了Hugging Face日榜第6名，并被机器之心专题报道。

<!--more-->

## 一、项目概述

### 1.1 RSIAgent是什么

RSIAgent（Recursive Self-Improvement Agent）是一个**免训练的递归自我改进框架**，专为全新数字环境设计。它让AI模型能够：

- **自主发现**环境如何工作
- **验证**所学知识是否正确
- **保留**可复用的知识到持久记忆
- 在整个过程中**模型参数保持不变**

简单来说：**你不需要对模型做额外训练，它自己学会适应新环境。**

### 1.2 核心创新点

| 创新 | 说明 |
|------|------|
| 三智能体协作 | Curriculum Agent（课程规划）、Actor Agent（执行探索）、Verifier Agent（独立验证） |
| 广度优先→深度探索 | 先广泛获取多样经验，再针对硬案例深入研究 |
| 持久记忆系统 | 将探索成果保存为可复用知识，用于下游任务执行 |
| 无需模型训练 | 模型参数固定，仅通过记忆积累实现能力提升 |

### 1.3 性能表现

RSIAgent在两个权威基准测试上的表现：

| 基准测试 | RSIAgent（无RSI） | RSIAgent（开启RSI） |
|------|:---:|:---:|
| OSWorld 2.0（82任务） | 71.97% | **78.98%** |
| Agents' Last Exam（67任务） | 83.75% | **84.82%** |

OSWorld提升约7个百分点，这是一个非常显著改进。

## 二、核心原理：三个智能体如何协作

### 2.1 三角色分工

RSIAgent的核心是三个各司其职的智能体：

**Actor Agent（执行智能体）**
- 通过可执行的Python或Bash程序与软件交互
- 通过视觉观察理解环境状态
- 验证通过后，将经验提炼并与现有记忆协调

**Verifier Agent（验证智能体）**
- 独立检查任务要求和最终环境状态
- 给出PASS、FAIL或未解决的判定
- 无法读取Actor Agent的私有推理或记忆

**Curriculum Agent（课程智能体）**
- 利用先验结果和积累知识选择信息丰富的探索任务
- 决定是否需要进一步练习
- 不参与评分或撰写Actor Agent的记忆

### 2.2 三阶段探索流程

**Phase 1: Broad Recursive Self-exploration (BRS)**
- Curriculum Agent 提出多样化项目建议
- 多个Actor Agent并行执行，Verifier Agent并行检查
- 全部完成后，按顺序整理经验，更新记忆

**Phase 2: Deep Recursive Self-exploration (DRS)**
- 目标尝试暴露差距和脆弱的成功案例
- Curriculum Agent选择针对性练习
- 每次验证的经验在下一步练习前更新记忆

**Phase 3: Test-time Memory Reuse**
- Actor Agent使用冻结的记忆快照执行任务
- 与Verifier Agent交互（复用RSI期间的相同循环）
- Curriculum Agent和记忆更新均禁用

### 2.3 记忆系统

记忆是跨任务的持久学习状态。它包含：
- **程序和脚本**：如何完成特定操作
- **失败教训**：什么方法行不通，为什么
- **边界条件**：在什么情况下行为会变化

## 三、安装与使用教程

### 3.1 环境要求

- **Python 3.12**
- **uv** 包管理器
- **Linux 主机**，已安装 Docker 并能访问 `/dev/kvm`
- **OPENROUTER_API_KEY**

### 3.2 快速安装

```bash
git clone https://github.com/AetherLabsAI/RSIAgent.git
cd RSIAgent
cp .env.example .env
# 编辑.env填入OPENROUTER_API_KEY

uv venv .venv --python 3.12
uv pip install --python .venv/bin/python -r requirements.txt
```

### 3.3 OSWorld基准测试设置

```bash
git clone --branch v2026.08.08 https://github.com/xlang-ai/OSWorld-V2.git ../OSWorld-V2
cd ../OSWorld-V2
uv sync --frozen
uv pip install --python .venv/bin/python -r ../RSIAgent/requirements.txt
source .venv/bin/activate
cd ../RSIAgent

python tools/prepare_osworld_v2_release.py
python tools/build_p2_corpus.py
python tools/exam_fence.py build
python tools/smoke_osworld.py --output results/smoke/osworld
```

### 3.4 运行实验

```bash
# 检查计划（不实际执行）
python run_osworld.py --arm both --name osworld_run_01 --dry-run

# 实际运行
python run_osworld.py --arm both --name osworld_run_01 --concurrency 1
```

参数说明：
- `--arm baseline`：无RSI的任务执行
- `--arm rsi`：RSI学习后冻结记忆评估
- `--arm both`：两种都运行

## 四、设计哲学深度解析

### 4.1 "免训练"的深层含义

传统AI系统在新环境中需要"微调"——用新数据更新模型参数。这存在几个问题：

1. **数据成本高**：需要大量标注数据
2. **泛化差**：微调后的模型可能过拟合特定环境
3. **不灵活**：换了环境就要重新训练
4. **遗忘风险**：新训练可能损害已有能力

RSIAgent的"免训练"策略：**模型参数完全固定，仅通过积累外部知识（记忆）来适应环境。**

这就好比一个经验丰富的工程师进入一个新项目，他不需要重新学习编程语言，而是凭借多年经验快速理解项目结构、工作流程、常见坑点。

### 4.2 广度优先→深度探索策略

论文的核心策略是**先广后深**：

**广度阶段（BRS）**：同时探索多个不同方向，发现环境的整体能力和边界，避免过早陷入局部最优

**深度阶段（DRS）**：针对已发现的弱点集中练习，深入研究边界条件和隐藏约束

### 4.3 验证即学习

RSIAgent的一个重要洞察是：**验证本身就是学习机会。**

- 成功的验证确认了正确的方法
- 失败的验证揭示了方法的边界
- 无论哪种结果，都能更新记忆

Verifier Agent的独立设计确保了验证的客观性——它不能读取Actor的私有推理，避免了"自我欺骗"式的学习。

### 4.4 三智能体的权力制衡

三个Agent形成了一个相互制约的体系：

- Curriculum Agent决定"学什么"，但不能评分或写记忆
- Actor Agent执行操作并写记忆，但验证由别人做
- Verifier Agent独立验证，但看不到Actor的内部推理

## 五、观点与结论

### 5.1 RSIAgent代表了什么趋势

RSIAgent的崛起反映了一个重要趋势：**AI系统正在从"一次性训练"向"持续适应"转变。**

传统范式：训练 → 部署 → 固定能力 → 逐渐过时

新范式：部署 → 自主探索 → 记忆积累 → 持续进化

### 5.2 与传统RAG/微调的区别

| 维度 | RAG | 微调 | RSIAgent |
|------|-----|------|----------|
| 知识形式 | 外部检索 | 参数权重 | 持久记忆 |
| 环境适应 | 无 | 无 | 有 |
| 探索能力 | 无 | 无 | 有 |
| 验证机制 | 无 | 无 | 有 |
| 无需训练 | 是 | 否 | 是 |

### 5.3 失败分析与局限性

论文坦诚指出了三个改进上限：

1. **实践可能错过相关弱点**：选择的练习任务可能没有针对真正的薄弱环节
2. **验证可能接受不完整工作**：Verifier Agent的严格程度影响学习质量
3. **记忆可能保留错误规则**：错误知识一旦进入记忆会污染后续决策

这说明**探索质量、验证质量和记忆整合质量**与实践量同样重要。

### 5.4 展望

RSIAgent展示了一条不需要额外训练的AI能力提升路径。随着更多环境适配和记忆复用机制的发展，这类系统可能成为AI在专业领域落地的关键技术。

未来的方向可能包括：
- 跨环境的通用记忆表示
- 更高效的记忆压缩与检索
- 与物理世界的更深集成
- 多Agent系统的协同自我改进

---

**相关资源**：

- GitHub：https://github.com/AetherLabsAI/RSIAgent
- 论文：https://arxiv.org/abs/2609.15364
- 官网：https://aetherlabsai.github.io/RSIAgent/
- Hugging Face：https://huggingface.co/papers/2609.15364
- 配套项目RSIGame：https://github.com/WenyiWU0111/RSIGame
