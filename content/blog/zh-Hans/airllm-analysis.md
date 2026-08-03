---
title: "AirLLM 深度解析：让 70B 大模型在 4GB 显卡上跑起来的分层推理革命"
description: "全面分析开源项目 AirLLM —— 不量化、不蒸馏、不剪枝，通过逐层加载技术让 70B 参数大模型在单张 4GB 显卡上完成推理。从安装教程到 API 使用，从工作原理到设计哲学，一文讲透这个 2.6 万星项目的核心思想。"
date: "2026-08-03"
author: "TopDigg Research Team"
tags: ["AirLLM", "LLM推理", "大模型", "GPU显存优化", "分层推理", "开源项目", "Gavin Li", "深度学习", "模型推理", "低端硬件"]
categories: ["深度解析"]
keywords: ["AirLLM", "LLM推理", "70B模型", "4GB显卡", "分层推理", "Layer-wise Inference", "Gavin Li", "Anima AI", "开源", "GPU显存", "AutoModel", "模型压缩"]
---

# AirLLM 深度解析：让 70B 大模型在 4GB 显卡上跑起来的分层推理革命

> 核心理念：**我们为什么必须把整个模型装进显存？** 如果推理时每一层都是顺序执行的，那么只需要把「正在执行的那一层」放进 GPU，算完就释放。AirLLM 用这个看似简单的反问，让 70B 参数的大模型在单张 4GB 显卡上完成推理 —— 不量化、不蒸馏、不剪枝。

---

## 一、项目说明

### 1.1 这个项目是什么？

**AirLLM** 是一个开源的大语言模型推理框架，由 **Gavin Li**（Anima AI 创始人、前 Airbnb / 阿里巴巴 AI 高级负责人）创建。它的核心能力是**大幅降低 LLM 推理的显存占用**，让 70B 参数模型在**单张 4GB 显卡**上运行 —— 全程不需要量化、蒸馏或剪枝。

> GitHub 原文：*"AirLLM optimizes inference memory usage, letting 70B large language models run inference on a single 4GB GPU card — without quantization, distillation, or pruning."*

### 1.2 项目数据一览

- **GitHub Stars**：26,230+（截至 2026 年 8 月）
- **许可证**：Apache License 2.0
- **活跃状态**：持续开发中（最近提交 2026 年 7 月 29 日）
- **发布平台**：PyPI（`pip install airllm`）
- **官方仓库**：https://github.com/lyogavin/airllm

### 1.3 它能做到什么？（官方实测显存数据）

- **Qwen3 / Mistral / Phi（约 8B）** → 仅需 **约 1–2 GB** 显存
- **Qwen3-30B / Mixtral（MoE，30–47B）** → **约 1–3 GB**
- **Qwen3-235B（MoE）** → **约 3 GB**
- **Llama 3.x 70B** → **约 4 GB**
- **Llama 3.1 405B** → **约 8 GB**
- **DeepSeek-V3（671B）** → **约 12 GB**
- **Kimi K3（2.8T）** → **约 3.72 GB**

> 注意：以上为官方实测数据。传统方式下 70B 模型全量加载需要约 140GB 显存，AirLLM 将其压缩到 4GB —— 显存需求降低了 30 倍以上。

---

## 二、核心思想：为什么整个模型必须常驻显存？

### 2.1 一个被忽略的常识

大模型推理时，Transformer 的每一层是**顺序执行**的：前一层的输出是后一层的输入，同一时刻只有**一层**在计算。

作者 Gavin Li 在 Medium 上如此解释：

> "During inference, layers are executed sequentially. The output of the previous layer is the input to the next. Only one layer executes at a time. Therefore, it is completely unnecessary to keep all layers in GPU memory. We can load whichever layer is needed from disk when executing that layer, do all the calculations, and then completely free the memory after."

翻译过来就是：**既然同一时刻只有一层在算，为什么要把所有层都塞进显存？** 把「正在执行的那一层」从磁盘加载到 GPU，算完立刻释放，再加载下一层 —— 这就是 AirLLM 的全部秘密。

### 2.2 与主流思路的根本区别

业界主流做法是「让模型变小去适配显存」：

- **量化**：把权重从 FP16 压到 INT8/INT4，牺牲精度换体积
- **蒸馏**：用大模型教小模型，重新训练一个小的
- **剪枝**：删掉不重要的参数

而 AirLLM 的思路完全不同 —— **不改变模型，而是改变模型的存放位置**：把 GPU 显存当作「缓存」，把磁盘当作「主存」。用速度换容量，让普通人用自己已有的硬件跑起大模型。

---

## 三、详细教程：从安装到跑通

### 3.1 安装

一条命令即可安装：

```bash
pip install airllm
```

如需支持 Kimi K3（MoE 逐专家流式加载），额外安装：

```bash
pip install airllm compressed-tensors flash-attn
```

### 3.2 快速上手：AutoModel 自动加载

AirLLM 提供与 HuggingFace 无缝兼容的 `AutoModel` API，支持自动识别模型架构：

```python
from airllm import AutoModel

MAX_LENGTH = 128
model = AutoModel.from_pretrained("Qwen/Qwen3-32B")

input_text = ['What is the capital of United States?']
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

> 用法与 HuggingFace `transformers` 几乎一致：`from_pretrained` 加载、`tokenizer` 编码、`generate` 生成 —— 上手成本极低。

### 3.3 使用压缩模式进一步提速

如果希望推理速度更快，可以开启 4-bit / 8-bit 量化（权重量化，精度损失几乎可忽略）：

```python
model = AutoModel.from_pretrained(
    "garage-bAInd/Platypus2-70B-instruct",
    compression='4bit'   # 或 '8bit'
)
```

### 3.4 加载超大模型（405B / 671B）

AirLLM 对 HuggingFace 生态的超大模型开箱即用：

```python
# Llama 3.1 405B
model = AutoModel.from_pretrained("unsloth/Meta-Llama-3.1-405B-Instruct-bnb-4bit")
```

### 3.5 支持的模型架构

AirLLM 几乎覆盖了所有主流开源模型：

- **Llama 系列**：Llama 2 / 3 / 3.1 / 3.3 / 4，包括 405B
- **Qwen 系列**：Qwen 1 / 2 / 2.5 / 3，含 MoE 与 FP8 变体
- **DeepSeek 系列**：V2 / V3 / R1，包括 671B DeepSeek-V3
- **Mistral / Mixtral**：Mistral-7B、Mixtral MoE
- **Phi、Gemma**：微软与谷歌系列
- **ChatGLM、Baichuan、InternLM、Yi**：国产模型家族

### 3.6 首次运行注意事项

- **首次分片**：第一次运行需要将模型逐层分片到磁盘，耗时约 **10–30 分钟**（视模型大小与磁盘速度）
- **磁盘空间**：首次运行需要原始模型 + 分片副本，约占模型体积 **2 倍**；可用 `delete_original=True` 删除原始文件释放空间
- **推荐 NVMe SSD**：磁盘 I/O 是主要瓶颈，机械硬盘上速度会降到 0.1 token/s 以下
- **常见报错**：遇到 `MetadataIncompleteBuffer` 错误，**大概率是磁盘空间不足**

---

## 四、工作原理：AirLLM 的四大技术支柱

### 4.1 逐层分片（Layer-wise Sharding）

模型被按层切分成独立的磁盘文件（基于 safetensors 内存映射）。推理时按需加载，而非一次性全部载入。

### 4.2 元设备初始化（Meta Device Initialization）

使用 `accelerate.init_empty_weights()` 搭建模型结构 —— **只创建张量结构，不分配任何显存**。

### 4.3 前向钩子（Forward Hooks）

这是整套机制的核心。每个 Transformer 层挂载两个钩子：

- **Pre-hook（前钩子）**：把该层权重从磁盘加载到 GPU
- **Post-hook（后钩子）**：计算完毕，把权重移回元设备并调用 `clean_memory()` 释放显存

```python
def _pre_hook(self, module, args):
    idx = module._airllm_idx
    if self.prefetching and self._prefetch_future is not None and self._prefetched_idx == idx:
        state_dict = self._prefetch_future.result()
    else:
        state_dict = self._load_streamed_layer(idx)
    module._airllm_moved = self.move_layer_to_device(state_dict)
    # 预取下一层
    if self.prefetching:
        nxt = self._next_streamed_idx(idx)
        if nxt is not None:
            self._prefetch_future = self._executor.submit(self._load_streamed_layer, nxt)
```

### 4.4 三项关键优化

- **预取（Prefetching，v2.5+）**：在第 N 层 GPU 计算的同时，预先把第 N+1 层从磁盘读入 —— 约 **10% 的速度提升**
- **MoE 逐专家流式加载（Per-Expert Streaming，v3.1+）**：MoE 模型不再整层加载，只加载路由器为当前 token 选中的专家
- **MXFP4 打包传输（Kimi K3）**：权重在 PCIe 传输全程保持 4-bit 压缩，只在 GPU 上解压 —— 传输数据量减少 **4 倍**

---

## 五、设计哲学

### 5.1 作者的原点问题

Gavin Li 的出发点是一个朴素的问题：

> "Large language models require huge amounts of GPU memory. Is it possible to run inference on a single GPU? If so, what is the minimum GPU memory required?"

**大模型需要海量显存 —— 能不能用单张显卡跑？如果能，最低需要多少显存？**

### 5.2 反转传统架构

AirLLM 的设计哲学可以概括为一句话：**与其压缩模型去适配显存，不如重新思考「为什么整个模型必须常驻显存」。** 它把 GPU 显存当作缓存、磁盘当作主存，反转了传统推理架构 —— 用可接受的降速，换取在**你已经拥有的硬件**上运行。

### 5.3 四条核心设计决策

1. **默认不压缩模型**：保留完整模型质量，压缩只是可选项 —— 量化永远伴随精度损失，AirLLM 的选择是「能用才量化」
2. **瞄准 I/O 瓶颈而非算力**：AirLLM 的瓶颈在磁盘加载，所以它优化的是数据传输，而不是矩阵计算
3. **HuggingFace 原生兼容**：使用标准 `AutoModel` API，让所有 HF 模型开箱即用
4. **钩子式架构**：通过 forward hook 与模型架构解耦，无需为每种注意力/旋转编码/缓存实现重写

### 5.4 作者对量化的精辟论述

> "Quantization normally needs to quantize both weights and activations to really speed things up. While in our case the bottleneck is mainly at the disk loading, we only need to make the model loading size smaller. So, we get to only quantize the weights' part, which is easier to ensure the accuracy."

**翻译**：常规量化需要同时量化权重和激活值才能显著提速；但 AirLLM 的瓶颈在磁盘加载，只需要把模型加载体积变小 —— 因此**只量化权重部分**，精度更容易保证。

> 这是一个非常聪明的洞察：**优化的目标决定了优化的手段。** 既然瓶颈是 I/O 而不是计算，就不需要付出激活量化的代价。

---

## 六、性能表现：用速度换容量

### 6.1 用速度换容量

**显存占用（70B 模型）**
- 传统全量加载：约 **140 GB**
- AirLLM 逐层加载：约 **4 GB**

**推理速度**
- 传统 A100：10–20 token/s
- AirLLM（4GB 显卡）：约 0.5–2 token/s

**瓶颈**
- 传统方案：显存
- AirLLM：磁盘 I/O

**硬件门槛**
- 传统方案：多卡 A100 / H100
- AirLLM：普通 4GB 消费级显卡

- 开启 4-bit / 8-bit 块级量化后，推理速度最高可提升 **3 倍**，精度损失「几乎可忽略」
- 与 llama.cpp 社区讨论中的评价一致：*"AirLLM uses a patent-pending layer decomposition engine... you only get GPU speeds whilst the layer is executing, and it stops when waiting for the next layer to be loaded."*

---

## 七、与主流方案的对比

- **AirLLM**：逐层磁盘流式加载。**慢，但保真、显存极小** —— 适合离线批量处理
- **llama.cpp / GGUF**：权重量化 + CPU/GPU 混合推理。有精度损失，但速度更快
- **HuggingFace Accelerate**：多设备卸载（offload）。**需要多张显卡**
- **vLLM / TGI**：批量调度 + KV 缓存优化。**需要大显存**

> 定位差异：AirLLM 解决的是「**我没有大显存**」的问题，其他方案解决的是「**我有很多 token 要高效处理**」的问题。

---

## 八、局限性与注意事项

1. **速度慢**：推理速度比全量加载慢 10–50 倍，适合离线批量任务，不适合交互式实时对话
2. **磁盘占用翻倍**：首次运行需要原始模型 + 分片副本，记得用 `delete_original=True` 清理
3. **首次分片耗时**：10–30 分钟，取决于模型大小和磁盘性能
4. **I/O 敏感**：强烈推荐 NVMe SSD，机械硬盘基本不可用
5. **Kimi K3 有硬性要求**：需要 CUDA 12（不是 CUDA 13）、`transformers==4.56.x`（5.x 不兼容）、必须安装 `flash-attn`

---

## 九、归纳总结：观点与结论

### 9.1 核心观点

- **显存不是模型推理的必要条件，只是缓存**：AirLLM 证明了「把显存当缓存、磁盘当主存」的架构可行性，这是对「大模型必须大显存」这一默认假设的正面挑战
- **优化目标决定优化手段**：因为瓶颈在 I/O，AirLLM 只做权重量化即可，避免了激活量化的精度风险 —— 这是一个可复用的工程思维
- **「能跑」比「跑得快」优先**：当硬件被锁死时，先解决 0→1 的问题，再解决 1→N 的速度问题
- **MoE 是超大规模模型的关键**：逐专家流式加载让 2.8T 参数的 Kimi K3 只需 3.72GB 显存，验证了 MoE 稀疏激活特性与分层推理的天作之合

### 9.2 对普通开发者的启示

- 没有大显存也能玩转 70B 级模型，**消费级显卡 + AirLLM 就是一个低成本实验平台**
- 与 HuggingFace 生态无缝兼容，**迁移成本几乎为零**
- 适合离线批处理、研究实验、教学演示等对实时性要求不高的场景

### 9.3 结语

AirLLM 的意义不止于一个技术方案，更是一种**思维范式的示范**：当所有人都默认「模型太大，必须压缩模型」时，它选择反问「**为什么模型必须全部在显存里？**」—— 这种对默认假设的质疑，往往能打开全新的可能性空间。

**一句话总结：AirLLM = 用磁盘换显存，用速度换门槛，让大模型回归普通人的硬件。**

---

## 参考资料

- 官方仓库：https://github.com/lyogavin/airllm
- PyPI 页面：https://pypi.org/project/airllm/
- 作者 Medium 文章：https://medium.com/@lyo.gavin/unbelievable-run-70b-llm-inference-on-a-single-4gb-gpu-with-this-new-technique-93e2057c7eeb
- 引用格式：

```bibtex
@software{airllm2023,
  author = {Gavin Li},
  title = {AirLLM: scaling large language models on low-end commodity computers},
  url = {https://github.com/lyogavin/airllm/},
  version = {0.0},
  year = {2023},
}
```
