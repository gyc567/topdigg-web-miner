---
title: 'WeMM-Embedding 深度解析：腾讯微信多模态 Embedding 模型家族'
date: "2026-08-28"
description: "深入解析腾讯微信视觉团队开源的 WeMM-Embedding：通用多模态 Embedding 模型家族。支持文本、图像、视频、视觉文档和交错多模态输入，在 MMEB-v2 榜单上 2B 模型超越 8B 基线，9B 模型达到 SOTA。涵盖设计哲学、架构解析、训练策略、MRL 维度压缩、部署教程和行业实践。"
tags:
  - WeMM-Embedding
  - 多模态
  - Embedding
  - 腾讯
  - 微信
  - 向量表示
  - MMEB
  - Qwen3.5
  - Matryoshka
  - 检索
  - 推荐系统
categories:
  - 深度解析
  - 多模态AI
  - 开源模型
  - 腾讯
---

# WeMM-Embedding 深度解析：腾讯微信多模态 Embedding 模型家族

2026年8月25日，腾讯微信视觉团队（WeChat Vision）在 arXiv 上发布了一份重磅技术报告，推出了 **WeMM-Embedding** ——一个通用多模态 Embedding 模型家族。这不是又一篇"刷榜然后沉寂"的论文：WeMM-Embedding 已经在微信看一看、公众号、视频号、朋友圈和电商搜索等核心场景大规模部署，并在14场在线 A/B 测试中持续带来显著提升。

它的核心自信来自一个数字：**2B 参数的模型，在 MMEB-v2 榜单上超越了此前最强的 8B 开源模型**。而 9B 版本更是将总分推到了 80.6——新的 SOTA。

这篇文章将完整解析 WeMM-Embedding 的设计哲学、模型架构、训练策略、性能评测、部署教程，以及它背后的核心思想。无论你是 AI 研究者、工程开发者还是产品从业者，都能找到有价值的内容。

---

## 1. 背景：为什么需要通用多模态 Embedding？

在讨论 WeMM-Embedding 之前，有必要理解它解决的问题有多重要。

多模态 Embedding 模型已经成为现代 AI 系统的基础组件。它的核心能力是：将文本、图像、视频等异构内容，映射到一个共享的稠密向量空间。在这个空间里，语义相似的内容彼此接近，从而支持**任意模态到任意模态**的检索、分类、推荐和 Agent 系统。

### 1.1 传统方案的局限

早期方案以 CLIP 为代表，通过双编码器（dual encoder）架构实现跨模态对齐。这种方案在图文匹配上效果不错，但存在根本性缺陷：

- **模态隔离**：图像编码器和文本编码器各自独立，无法自然表达"图像+文本"交错的复合输入
- **不支持组合查询**：无法处理"找一张包含 X 物体但背景是 Y 的图片"这类组合式查询
- **视频能力弱**：视频被简单抽帧后当作独立图像处理，时序信息大量丢失

后续的Encoder-Follower方案将视觉编码器接入LLM进行指令微调，在一定程度上扩展了多模态能力，但仍不够通用。

### 1.2 MLLM 时代的转折

Multimodal Large Language Model（MLLM）的出现改变了一切。以 Qwen2.5-VL 为代表的原生多模态大模型，从预训练阶段就天然支持任意文本-图像-视频的交错组合，加上 LLM 本身积累的世界知识和推理能力，为构建通用多模态 Embedding 提供了理想基座。

**WeMM-Embedding 的核心思路**：基于 Qwen3.5 原生多模态基座，构建统一的多模态表示学习框架。

---

## 2. 设计哲学：四个核心原则

阅读 WeMM-Embedding 的技术报告后，我将其设计哲学归纳为四个核心原则：

### 原则一：通用性优先（Universality First）

微信团队没有针对单一任务优化模型，而是追求"一模型多任务"：同一组模型权重同时处理文本检索、图像分类、视频定位、视觉文档理解和交错多模态查询。这要求模型在架构层面原生支持任意模态组合，而不是事后拼接。

### 原则二：渐进式训练（Progressive Training）

不同于一次性在大规模数据上端到端训练，WeMM-Embedding 采用两阶段策略：

- **第一阶段（大规模多模态对齐）**：在数亿级异构数据对上建立广泛的多模态覆盖和初始表示空间
- **第二阶段（精细化提升）**：在精筛数据上进行微调，引入更丰富的相关性监督和跨尺度知识迁移

这种"先博后精"的策略，让模型既保持了广泛的能力覆盖，又持续提升了细粒度匹配能力。

### 原则三：效率与性能并重（Efficiency-Performance Balance）

2B 模型即超越 8B 开源基线，参数效率的背后是 MRL（Matryoshka Representation Learning）支持和高效推理方案的精心打磨。团队选择 Qwen3.5 作为基座，正是看中了其高效率的视觉处理管线。

### 原则四：工业级验证（Production-Ready）

从论文标题的"Technical Report"而非"Paper"就能看出，这是一份工程导向的总结：不仅有公开 benchmark 的评测，还有内部 26 项任务评测和 14 场 A/B 测试，模型已经跑在微信的生产环境中。开源权重和代码，底气来自实打实的大规模验证。

---

## 3. 模型架构解析

### 3.1 基座选择：Qwen3.5 Natively Multimodal

WeMM-Embedding 家族包含三个规模的模型：

| 模型 | 参数量 | MRL 维度支持 | Hugging Face |
|------|--------|-------------|--------------|
| WeMM-Embedding-2B | 2B | 64, 128, 256, 512, 1024, 2048 | [Link](https://huggingface.co/tencent/WeMM-Embedding-2B) |
| WeMM-Embedding-4B | 4B | 64, 128, 256, 512, 1024, 2560 | [Link](https://huggingface.co/tencent/WeMM-Embedding-4B) |
| WeMM-Embedding-9B | 9B | 64, 128, 256, 512, 1024, 2048, 4096 | [Link](https://huggingface.co/tencent/WeMM-Embedding-9B) |

三个模型均基于 **Qwen3.5** 原生多模态基座，选择理由是：
- 原生支持异构和交错多模态输入
- 高效的视觉处理管线
- 良好的开源生态（Hugging Face、vLLM、SGLang 均已支持）

### 3.2 表示提取：Last-Token Pooling

在输入序列末尾添加一个专用的 `<embedding>` token，将其最后一层的 hidden state 作为输出表示：

```
输入序列: [文本tokens | 视觉tokens | <embedding>]
          ↓
LLM 基座处理
          ↓
输出表示: h_emb (最后一层hidden state) → L2归一化 → e_D
```

这种设计有两个优势：

1. **位置灵活**：`<embedding>` token 默认放在序列末尾（因果注意力自然汇聚全部信息），但也支持插入到任意位置（如视频tokens之后），从而在单次前向传播中同时提取"仅视频"和"视频+文本"的表示
2. **统一接口**：不同模态的输入（文本、图像、视频及其交错组合）都通过同一个 `<embedding>` token 提取表示，输出维度完全一致

### 3.3 Matryoshka 表示学习（MRL）

MRL 的核心思想是"嵌套维度"：让一个向量同时支持多种输出维度，高维包含低维的信息。给定维度 D 的 hidden state，截取前 d 个维度并重新归一化即可得到 d 维 embedding：

```python
embedding = torch.nn.functional.normalize(embedding[..., :d], dim=-1)
```

这有什么用？在 MMEB-v2 上，2B 模型在 **256 维**时仍保留了完整维度图像与视频性能的 **98.7%**。这意味着你可以用 8 倍小的向量换取几乎无损的效果，在存储和检索速度上带来实质性提升。

---

## 4. 训练策略：两阶段详解

### 4.1 第一阶段：大规模多模态对齐

训练数据规模达到**数亿级**，来自以下来源：

| 数据类型 | 说明 |
|---------|------|
| 弱监督图文/视频对 | 来自公开数据集和网络大规模来源，通过自然共现关系关联 |
| Caption 对 | 图像/视频配以显式描述（从简短摘要到详细场景描述） |
| 检索对 | 跨文本、图像、视频及交错多模态输入的查询-候选匹配 |
| 分类对 | 将分类任务重构为源-标签对，支持 zero-shot 分类 |
| QA 对 | 视觉感知、关系理解、OCR、知识推理、文档理解等多能力覆盖 |
| 分级相关对 | 手动标注的相关性等级，支持排序导向训练 |

**统一格式**：所有异构数据被表示为统一的对格式 `z_i = (I_i, q_i, c_i, N_i, y_i)`，其中：
- `I_i`: 可选的任务指令
- `q_i`: 源实例
- `c_i`: 配对目标
- `N_i`: 可选的硬负样本
- `y_i`: 可选的分级相关性分数

这种统一格式让不同任务在同一训练框架下进行多任务学习成为可能。

### 4.2 第二阶段：精细化提升

第二阶段的数据约为第一阶段的十分之一，但质量更高，包括三项关键改进：

**（1）Semantic-ID 引导的重采样**

用模型中间 checkpoint 将源-目标对编码后，通过残差量化 k-means（RQ-KMeans）得到一个 3 级语义 ID。高密度语义簇降低采样率，低密度语义簇提升采样率——既保持覆盖广度，又改善了长尾分布。

**（2）质量控制**

用多模态大模型评估每个源-目标对是否真正反映了预期的匹配关系，过滤掉不匹配样本。同时修正弱监督数据中的文本噪声（如 alt-text 中的事实错误），但保留原始风格和细节粒度。

**（3）硬负样本构建**

对部分精筛数据补充显式硬负样本：
- 文本目标：用 MLLM 基于源和正样本生成"似是而非"的候选
- 图像/视频目标：用中间 checkpoint 从任务候选池中检索语义相似候选

### 4.3 跨尺度知识迁移

在多尺度模型（2B/4B/9B）之间，微信团队引入了跨尺度的知识迁移机制。这意味着大模型学到的表示知识会传递到小模型中，帮助小模型以更少参数达到接近大模型的效果——这是 2B 模型能超越 8B 基线的关键原因之一。

---

## 5. 性能评测

### 5.1 MMEB-v2 基准（78 数据集）

| 模型 | 规模 | AVG | 图像 | 视频 | 视觉文档 |
|------|------|-----|------|------|---------|
| VLM2Vec | 2B | 47.8 | 59.7 | 29.0 | 44.0 |
| GME | 2B | 55.4 | 51.9 | 33.9 | 76.8 |
| VLM2Vec-V2 | 2B | 59.3 | 64.9 | 34.9 | 69.2 |
| Qwen3-VL-Embedding | 2B | 73.2 | 75.0 | 61.9 | 79.2 |
| DME-Small | 2B | 74.8 | 75.9 | 65.6 | 79.9 |
| **WeMM-Embedding** | **2B** | **77.9** | **79.6** | **70.8** | **80.7** |
| **WeMM-Embedding** | **4B** | **79.2** | **80.8** | **72.1** | **82.0** |
| Qwen3-VL-Embedding | 8B | 77.8 | 80.1 | 67.1 | 82.4 |
| **WeMM-Embedding** | **9B** | **80.6** | **81.9** | **74.3** | **83.3** |

关键观察：
- 2B 模型以 3 倍小的参数量，超越了此前最强的 8B 开源基线（Qwen3-VL-Embedding 8B: 77.8 vs WeMM-Embedding 2B: 77.9）
- 9B 模型以 80.6 的总分刷新 MMEB-v2 榜单纪录，位居第一

### 5.2 MMEB-v3 基准（190 任务）

MMEB-v3 包含更多任务类型：78 个 MMEB-v2 任务 + 53 个文本任务 + 47 个 Agent 任务 + 11 个音频任务 + MCMR。

| 模型 | 规模 | 全部 | 文本 | Agent | MCMR | 音频 |
|------|------|------|------|-------|------|------|
| Qwen3-VL-Embedding | 2B | 50.9 | 39.2 | 39.3 | 42.0 | 0.0 |
| **WeMM-Embedding** | **2B** | **56.0** | **45.3** | **45.1** | **42.5** | **0.0** |
| **WeMM-Embedding** | **4B** | **58.2** | **47.9** | **49.0** | **41.9** | **0.0** |
| Tianmu-Emb-Uni | 8B | 53.3 | 43.6 | 39.4 | 38.8 | 38.9 |
| Qwen3-VL-Embedding | 8B | 53.5 | 42.5 | 38.4 | 38.0 | 0.0 |
| **WeMM-Embedding** | **9B** | **59.5** | **48.8** | **51.0** | **49.3** | **0.0** |

值得注意的是，WeMM-Embedding 在 **Agent 任务**上表现尤为突出（9B 版本达到 51.0），这与其细粒度相关性建模能力密切相关。

---

## 6. 部署教程

### 6.1 环境安装

```bash
pip install -r requirements.txt
```

推荐使用 `transformers==5.2.0` 以确保推理行为可复现。

### 6.2 Transformers 推理

```python
# 安装依赖
# pip install transformers torch

# 推理脚本示例
python examples/transformers_inference.py \
  --model /path/to/WeMM-Embedding-2B \
  --image /path/to/image.jpg \
  --video /path/to/video.mp4 \
  --dimension 2048
```

省略 `--dimension` 则使用完整 embedding 维度。

### 6.3 SentenceTransformers 推理

```python
# pip install sentence-transformers

python examples/sentence_transformers_inference.py \
  --model /path/to/WeMM-Embedding-2B \
  --image /path/to/image.jpg \
  --video /path/to/video.mp4 \
  --dimension 2048
```

也支持直接用 Hugging Face model id：
```python
from sentence_transformers import SentenceTransformer
model = SentenceTransformer("tencent/WeMM-Embedding-2B")
```

### 6.4 vLLM 部署

```bash
# 推荐版本: vLLM 0.27.0
MODEL_PATH=/path/to/WeMM-Embedding-2B
vllm serve "$MODEL_PATH" \
  --runner pooling \
  --chat-template "$MODEL_PATH/embedding_chat_template.jinja"
```

### 6.5 SGLang 部署

```bash
# 推荐版本: SGLang 0.5.9
MODEL_PATH=/path/to/WeMM-Embedding-2B
python scripts/patch_sglang_video.py
python -m sglang.launch_server \
  --model-path "$MODEL_PATH" \
  --is-embedding \
  --enable-precise-embedding-interpolation
```

一键脚本：`scripts/serve_vllm.sh` 和 `scripts/serve_sglang.sh`。

### 6.6 MRL 维度切换

只需截取前 d 维并重新归一化：

```python
embedding = torch.nn.functional.normalize(embedding[..., :d], dim=-1)
```

---

## 7. 核心观点与总结

### 观点一：MLLM 正在统一多模态表示学习

WeMM-Embedding 证明了基于 MLLM 的 Embedding 路线是可行的且高效的。当模型原生支持任意模态组合时，"为每种模态设计专门的编码器"的传统范式正在被颠覆。

### 观点二：小模型可以打败大模型

2B 超越 8B 的结果，打破了"参数量=性能"的惯性思维。训练策略、数据质量和知识迁移的重要性，不亚于模型规模。

### 观点三：工业场景是真正的试金石

微信团队没有止步于公开榜单，而是在 14 场 A/B 测试中验证了模型在推荐、搜索等核心场景的实用价值。论文背后的工程严谨度值得尊敬。

### 观点四：Embedding 的灵活性正在重新定义应用架构

MRL 支持灵活的 embedding 维度，开发者可以根据实际需求在精度和效率之间做取舍。这种弹性让向量数据库的选型和优化变得更加多样化。

### 观点五：开源正在加速多模态 AI 的普及

腾讯微信视觉团队选择开源模型权重和代码，让更多开发者和研究者能够在他们的基础上进行二次创新。这种开放态度正在加速整个领域的发展。

---

## 8. 结语

WeMM-Embedding 的出现，标志着一个重要趋势：**多模态 Embedding 模型正在从"专用"走向"通用"，从"刷榜"走向"落地"**。

它的成功不是来自某个算法的突破，而是来自系统性的工程思考：从基座选择到两阶段训练，从 MRL 维度压缩到生产环境部署，每一步都经过了严格的验证和优化。

如果你正在构建多模态检索、推荐系统或 Agent 应用，WeMM-Embedding 值得关注。如果你关注多模态 AI 的前沿发展，这份技术报告也是近年来少见的兼具深度和实用价值的文档。

---

**相关资源**：

- 论文：https://arxiv.org/abs/2608.24053
- GitHub：https://github.com/Tencent/WeMM-Embedding
- Hugging Face：https://huggingface.co/collections/tencent/wemm-embedding

---

*作者：蓝小鲸 | 来源：比特财商（微信公众号）*
*首发于微信公众号「比特财商」。
