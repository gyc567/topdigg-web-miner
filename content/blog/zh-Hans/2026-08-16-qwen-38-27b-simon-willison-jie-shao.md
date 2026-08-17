---
title: "Qwen 3.8 27B 深度体验：Simon Willison 眼中的开源多模态大模型"
date: "2026-08-16"
description: "深度解析 Qwen 3.8 27B：Simon Willison 的实测报告，Apache 2 许可证的 27B 视觉语言模型，默认推理强度过高的问题，以及在 MacBook Pro 和 NVIDIA DGX Spark 上的本地运行体验。"
author: "ERIC"
tags:
  - Qwen
  - 大语言模型
  - 开源
  - 多模态
  - Alibaba
  - Simon Willison
  - 本地运行
  - LM Studio
  - 视觉模型
categories:
  - 模型评测
keywords:
  - Qwen 3.8 27B
  - 开源 LLM
  - 多模态模型
  - Apache 2
  - 本地部署
  - LM Studio
---

# Qwen 3.8 27B 深度体验：Simon Willison 眼中的开源多模态大模型

## 引言

> *"Qwen 3.8 27B is excellent, but it defaults to wildly overthinking things."*
> — Simon Willison

2026 年 8 月 16 日（周五），阿里巴巴 Qwen 研究团队发布了 **Qwen 3.8 27B**，一款采用 Apache 2 许可证的 27B 参数视觉语言模型。这是继 Qwen 3.6 27B 之后的又一力作，刷新了 Qwen 自研基准测试的多项记录。

著名 AI 研究者、DataLens 创始人 Simon Willison 在第一时间进行了深度体验。他的评价一针见血：**"这模型很优秀，但它默认推理强度过高，会导致过度思考。"**

本文将基于 Simon Willison 的实测报告，全面解析这款模型的特性、优势、问题以及使用方法。

---

## 一、项目概述

### 1.1 Qwen 3.8 27B 是什么？

Qwen 3.8 27B 是阿里巴巴 Qwen 研究团队发布的**视觉语言模型**（Vision Language Model），具有以下核心特点：

| 特性 | 说明 |
|------|------|
| **参数规模** | 270 亿（27B） |
| **许可证** | Apache 2.0（完全开源） |
| **多模态** | 支持视觉理解 |
| **上下文长度** | 最大 262,144 tokens |
| **前代模型** | Qwen 3.6 27B |

### 1.2 为什么 27B 是一个黄金尺寸？

Simon Willison 在评测中指出：

> *"27B is an excellent size for running a model on a reasonably specced laptop."*

27B 参数是一个**黄金尺寸**，因为：

1. **本地运行友好**：17GB 的 Q4_K_M 量化版本可以在配置合理的笔记本电脑上运行
2. **性能足够强大**：benchmark 表现优于 Qwen 3.7-Plus（曾是今年 5 月最强模型之一）
3. **成本可控**：比超大规模模型（如 Qwen 3.8 2.4T）更易于部署

### 1.3 Qwen 官方基准测试亮点

根据 Qwen 团队的自测报告，Qwen 3.8 27B 在多项基准上实现了对前代产品的超越：

- 相比 **Qwen 3.6 27B** 有显著提升
- 超越闭源模型 **Qwen 3.7-Plus**（今年 5 月最强模型之一）

独立第三方基准测试结果尚待发布。

---

## 二、运行平台与工具

### 2.1 Simon 的测试环境

Simon Willison 在两台不同的机器上进行了测试：

| 机器 | 配置 | 用途 |
|------|------|------|
| **MacBook Pro** | 128GB M5 Max | 日常开发 |
| **NVIDIA DGX Spark** | 专业 GPU | 性能压测 |

### 2.2 运行工具

| 工具 | 说明 |
|------|------|
| **LM Studio** | 17GB Q4_K_M 量化版本 |
| **llama-server** | 直接在 DGX Spark 上运行 |

Simon 特别推荐 **LM Studio**，因为它提供了开箱即用的 GGUF 模型支持。

### 2.3 量化版本

Q4_K_M 量化是一个**高效的量化方案**，在保持模型质量的同时大幅减少内存占用：

- **原始大小**：27B × 4bytes ≈ 108GB（全精度 FP32）
- **量化大小**：约 17GB（Q4_K_M）
- **内存需求**：可以在 128GB 内存的设备上流畅运行

---

## 三、核心发现：推理强度问题

### 3.1 默认设置的问题

Simon Willison 最重要发现是：**Qwen 3.8 27B 的默认推理强度（reasoning effort）设置为 `xhigh`，这会导致模型"过度思考"**。

Qwen 文档描述的推理强度档位：

| 档位 | 说明 | 适用场景 |
|------|------|----------|
| **`xhigh`（默认）** | 复杂任务的深度分析 | 需要彻底分析的问题 |
| **`medium`** | 平衡准确性和速度 | 日常使用 |
| **`low`** | 高效推理 | 优化速度和成本 |

**Simon 的评价**：

> *"This is a hilarious default. It's absolutely not a good way to run the model, especially on consumer hardware."*

### 3.2 具体案例：鹈鹕骑自行车 SVG

Simon 用一个生成"鹈鹕骑自行车 SVG"的例子完美说明了这个问题。

**实验设置**：要求模型生成一张鹈鹕骑自行车的 SVG 图片

**实验一：默认 `xhigh` 推理强度**
- **耗时**：21 分钟
- **推理 token**：22,276 tokens
- **输出 token**：3,223 tokens
- **结果质量**：**迄今最佳**——自行车框架形状正确、每侧都有腿、鹈鹕喙清晰、翅膀延伸触碰车把手、运动线条位置正确、有精致的背景

**实验二：关闭推理（无 reasoning）**
- **耗时**：137 秒（约 2 分钟）
- **输出 token**：3,715 tokens
- **结果质量**：明显低于 xhigh 版本

**Simon 的结论**：xhigh 版本的结果当然值得 21 分钟等待吗？**绝对不是。**

### 3.3 更极端的案例：画一个圆

Simon 还测试了一个更简单的请求："draw an svg of a circle"（画一个圆的 SVG）

模型在 `xhigh` 模式下的推理过程让人哭笑不得：

> *"The user is asking for an SVG drawing of a circle. Simple request — but I want it to be a carefully crafted piece. Let me make something that goes beyond just `<circle>` : a single self-contained SVG file with character — maybe a geometric 'circle study,' with subtle animation, layered rings, and a distinctive palette..."*

**几分钟后**，模型生成了一个**完全符合要求的精美动画圆**——但**完全不是用户要求的基本圆形**。

### 3.4 Simon 的建议

> *"My strong recommendation: ignore that default. Run Qwen 3.8 27B on low or even no reasoning levels first."*

**建议**：忽略默认设置，先用 `low` 或完全关闭推理模式。

---

## 四、视觉能力测试：边界框标注

### 4.1 测试方法

Simon 用一种有趣的方式测试视觉模型的能力：**要求模型返回照片中鹈鹕的边界框**。

**使用的 prompt**：

```bash
llm -a https://static.inaturalist.org/photos/714731804/large.jpg \
  -m lmstudio/qwen/qwen3.8-27b \
  'Return JSON bounding boxes for the pelicans in this photo, 0-1000 scale for each dimension'
```

### 4.2 测试结果

**推理追踪**：模型生成了详细的推理过程

**输出结果**：

```json
[
  {
    "bbox_2d": [195, 290, 370, 780],
    "label": "pelicans"
  },
  {
    "bbox_2d": [445, 320, 675, 850],
    "label": "pelicans"
  }
]
```

**实际效果**：边界框与照片中的鹈鹕**高度匹配**。

### 4.3 可视化工具

Simon 用来可视化边界框的工具是 **Qwen 3.8 27B 自己在本地运行构建的**。

这是一个非常有趣的元循环：用 Qwen 构建工具，然后用这个工具来分析 Qwen 的输出。

---

## 五、性能与资源消耗

### 5.1 上下文长度的影响

Simon 遇到的另一个问题是 **LM Studio 默认的上下文限制只有 8,192 tokens**。

在这个限制下，Qwen 会把 8,192 tokens 全部用完去"思考"最简单的问题。

**解决方案**：将上下文长度设置为最大 262,144 tokens。

### 5.2 性能对比

| 配置 | 推理强度 | 耗时 | 输出质量 |
|------|----------|------|----------|
| LM Studio 17GB | xhigh | 21 分钟 | 优秀 |
| LM Studio 17GB | 关闭 | 2 分钟 | 一般 |
| OpenRouter Qwen 3.8 2.4T-A95B | - | 更短 | 精美动画 |

### 5.3 内存需求

- **全精度 FP32**：约 108GB
- **Q4_K_M 量化**：约 17GB
- **推荐内存**：128GB+（考虑上下文扩展）

---

## 六、核心观点总结

### 6.1 观点一：默认设置往往是错误的选择

> *"This is a hilarious default. It's absolutely not a good way to run the model, especially on consumer hardware."*

模型的默认设置不一定是最优的。对于本地运行的场景，`xhigh` 推理强度会导致不必要的等待时间和资源消耗。**先用 low 或关闭推理**，再根据需要逐步调高。

### 6.2 观点二：27B 是本地运行的最佳平衡点

27B 参数模型在**模型能力**和**硬件需求**之间达到了最佳平衡：
- 足够强大，可以完成复杂的视觉和推理任务
- 足够小巧，可以在消费级硬件上运行
- Apache 2.0 许可证，完全开源可定制

### 6.3 观点三：视觉能力的实际应用价值

Qwen 3.8 27B 的边界框标注能力非常精准，这意味着它在以下场景有巨大价值：
- **图像标注**：自动化数据标注
- **目标检测**：工业检测、质量控制
- **文档理解**：图表分析、信息提取

### 6.4 观点四：开源模型正在快速追赶闭源模型

Qwen 3.8 27B 在多项基准测试中超越了此前的闭源旗舰模型 Qwen 3.7-Plus，这表明：

> *"It will be interesting to hear what independent benchmarks have to say about the model."*

开源模型的能力正在快速逼近甚至超越闭源模型。

---

## 七、使用建议

### 7.1 安装与配置

**使用 LM Studio（推荐）**：

1. 下载安装 [LM Studio](https://lmstudio.ai/)
2. 下载 Qwen 3.8 27B Q4_K_M 量化版本
3. 将上下文长度设置为 262,144（最大）
4. **重要**：将推理强度改为 `low` 或 `medium`

**使用 llama-server**：

```bash
llama-server -m qwen3.8-27b-q4_k_m.gguf --ctx-size 262144
```

### 7.2 命令行使用示例

**使用 LLM CLI**：

```bash
# 安装插件
llm install llm-gpt4all

# 运行模型
llm -m lmstudio/qwen/qwen3.8-27b '你的问题'

# 视觉任务
llm -a image.jpg -m lmstudio/qwen/qwen3.8-27b '描述这张图片'
```

### 7.3 推理强度选择指南

| 任务类型 | 推荐推理强度 | 原因 |
|----------|-------------|------|
| 简单问答 | 无/low | 快速响应，避免过度思考 |
| 代码生成 | medium | 平衡速度和质量 |
| 复杂推理 | xhigh | 深度分析（耐心等待） |
| 视觉标注 | medium/low | 精准但高效 |

---

## 八、总结与展望

### 8.1 Qwen 3.8 27B 的优势

| 优势 | 说明 |
|------|------|
| **完全开源** | Apache 2.0 许可证 |
| **性能强大** | 超越 Qwen 3.7-Plus 闭源模型 |
| **本地运行** | 17GB 量化版可在笔记本运行 |
| **视觉能力** | 精准的边界框标注 |
| **长上下文** | 最大 262,144 tokens |

### 8.2 需要注意的问题

| 问题 | 解决方案 |
|------|----------|
| 默认推理强度过高 | 改为 low/medium |
| LM Studio 默认上下文太小 | 改为 262,144 |
| 长任务耗时长 | 权衡质量与时间 |

### 8.3 适用场景

**非常适合**：
- 本地隐私敏感的 AI 应用
- 需要视觉理解能力的任务
- 资源有限但需要强大模型的场景
- 快速原型开发

**不太适合**：
- 需要极致速度的实时应用
- 完全没有 GPU 的环境
- 超长文档的深度分析

---

## 九、资源链接

| 资源 | 链接 |
|------|------|
| Qwen 3.8 27B 模型 | https://huggingface.co/Qwen/Qwen2.5-72B-Instruct（类似） |
| LM Studio | https://lmstudio.ai/ |
| Simon Willison 原文 | https://simonwillison.net/2026/Aug/16/qwen-38-27b/ |
| LLM CLI | https://llm.datasette.io/ |
| Qwen 官方博客 | https://qwenlm.github.io/ |

---

## 结语

Qwen 3.8 27B 是一个令人印象深刻的模型。它证明了**开源模型完全可以在性能上与闭源模型竞争**，同时提供更好的透明度和可定制性。

Simon Willison 的体验报告给了我们一个重要的教训：**不要盲目使用默认设置**。对于本地运行的场景，合理的配置可以显著提升效率和体验。

如果你有合适的硬件条件，Qwen 3.8 27B 绝对是一个值得尝试的选择。

> *"It's a great model, but wow that default setting is a bad place to start."*

---

## 关于作者

**ERIC** — 《区块链核心技术与应用》作者之一，前火币机构事业部/矿池技术主管，比特财商/Nxt Venture Capital 创始人

---

## 分享到社交媒体

<div style="text-align: center; margin: 30px 0; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 15px;">
  <p style="color: white; margin-bottom: 15px; font-size: 16px;">📱 分享这篇文章到 X (Twitter)</p>
  <a href="https://x.com/intent/tweet?text=Qwen 3.8 27B深度体验：Simon Willison的实测报告 - Apache 2开源视觉语言模型，27B黄金尺寸&url=https://topdigg.com&hashtags=Qwen,大语言模型,开源,视觉模型,LMStudio,SimonWillison" target="_blank" style="display: inline-block; background: rgba(255,255,255,0.2); color: white; padding: 12px 30px; border-radius: 25px; text-decoration: none; font-weight: bold; border: 2px solid rgba(255,255,255,0.3); transition: all 0.3s ease;">
    🐦 一键分享到 X.com →
  </a>
</div>
