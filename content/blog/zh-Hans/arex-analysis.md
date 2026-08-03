---
title: "AREX 深度解析：BAAI 开源的可递归自我改进深度研究 Agent"
description: "全面分析 BAAI（北京智源人工智能研究院）开源的 AREX —— 一个可递归自我改进的深度研究 Agent。从 arXiv 2607.21461 论文核心思想「发现-验证不对称」到双循环框架，从 AREX-Turbo / AREX-Base 模型到完整使用教程，一文讲透这个 Apache 2.0 开源研究模型的设计哲学。"
date: "2026-08-03"
author: "TopDigg Research Team"
tags: ["AREX", "BAAI", "智源", "深度研究", "Agent", "递归自我改进", "arXiv", "开源模型", "Deep Research", "MoE", "Qwen3.5"]
categories: ["深度解析"]
keywords: ["AREX", "BAAI", "智源人工智能研究院", "深度研究Agent", "递归自我改进", "Deep Research", "arXiv 2607.21461", "开源模型", "Apache 2.0", "Qwen3.5", "AREX-Turbo", "AREX-Base", "发现验证不对称"]
---

# AREX 深度解析：BAAI 开源的可递归自我改进深度研究 Agent

> 核心理念：**发现一个答案很贵，验证一个答案很便宜。** 深度研究需要找到同时满足多个约束的答案，而「发现」的搜索空间巨大；但「验证」一个候选答案，往往可以拆解成逐约束的简单检查。AREX 抓住这个不对称性，让 Agent 不是简单地搜得更久，而是**递归地自我改进** —— 用部分验证的状态指导后续的迭代。

---

## 一、项目说明

### 1.1 这是什么？

**AREX（Recursively Self-Improving Agent for Deep Research）** 是北京智源人工智能研究院（BAAI）于 2026 年 7 月发布的**可递归自我改进的深度研究 Agent**。它不只是又一个大模型 —— 而是一套完整的「研究 Agent 方法论 + 训练好的模型」。

- **论文**：arXiv:2607.21461（cs.AI，2026 年 7 月 23-24 日投稿）
- **论文标题**：*AREX: Towards a Recursively Self-Improving Agent for Deep Research*
- **作者**：陆姝琦、李超凡、罗坤等 24 位研究者（BAAI）
- **主页**：https://vectorspacelab.github.io/arex-model/
- **在线演示**：https://arex-research.com/
- **模型集合**：https://huggingface.co/collections/BAAI/arex

### 1.2 开源模型一览

- **AREX-Turbo**：4B 稠密模型，基于 Qwen3.5-4B，Apache 2.0 许可证，**256K 上下文**
- **AREX-Base**：122B 总参数 / 10B 激活（MoE），基于 Qwen3.5-122B-A10B，Apache 2.0 许可证，**256K 上下文**

> 两个模型均采用 **Apache 2.0** 开源许可，可免费用于研究与商业场景。这是 BAAI 继 BGE、BGE-M3 等开源模型之后的又一重要开源贡献。

---

## 二、核心思想：发现-验证不对称（Discovery-Verification Asymmetry）

### 2.1 问题：深度研究为什么这么贵？

深度研究要求 Agent 找到**同时满足多个约束**的答案。难点在于：

- **发现（Discovering）**一个同时满足所有约束的答案 —— 搜索空间巨大，成本极高
- **验证（Verifying）**一个候选答案 —— 往往可以拆解成**逐约束的简单检查**，成本低得多

> 打个比方：让你从北京找一个同时「离地铁近、价格低于 5000、朝南、有电梯」的房子很难；但给你一个具体房源，验证这四条约束每一条都很快。**发现难，验证易 —— 这就是不对称。**

### 2.2 AREX 的解法：不搜得更久，而是递归改进

AREX 的关键洞察是：**用「部分验证过的中间状态」指导后续的迭代**，而不是盲目扩大搜索。

- 每次迭代验证中间结果
- 保留已验证的发现
- 针对未解决的约束继续研究
- 形成**递归的自我改进循环**

---

## 三、技术架构：双循环框架

### 3.1 内部研究循环（Inner Research Loop）

- 收集证据、评估候选、构建临时答案
- 通过累积的轨迹维护研究状态
- 产出带**支持证据**和**置信度分数（0-100）**的答案

### 3.2 外部自我改进循环（Outer Self-Improvement Loop）

逐约束审计临时答案，按决策规则处理：

- **接受（Accept）**：置信度 ≥ 阈值
- **细化（Refine）**：置信度 < 阈值 且 轨迹可恢复 —— 保留有用发现，针对未解决的约束继续研究
- **重启（Restart）**：置信度 < 阈值 且 轨迹过于混乱/误导 —— 重新开始

### 3.3 自主上下文更新工具（update_context）

AREX 学会自主调用 `update_context`，把不断增长的交互历史压缩成紧凑的**改进状态（improvement state）**：

- 保留已验证的发现与来源标识
- 记录约束满足状态
- 标出未解决的信息缺口
- 明确下一步研究计划

> 这不是通用摘要！**Agent 自己**围绕当前研究目标组织更新，让压缩后的状态与不断演化的信念保持一致。

### 3.4 可用工具

- **search**：批量网页搜索（每个查询返回前 10 条结果）
- **visit**：访问网页并返回内容摘要
- **google_scholar**：学术论文搜索
- **update_context**：压缩记忆/研究状态
- **finish**：返回带证据的最终答案

---

## 四、训练管线：多阶段训练

### 4.1 Agent 化中期训练（Agentic Mid-training）

渐进式能力构建：

- **浏览密集型研究任务**：基础工具使用、证据获取
- **专家推理任务**：长程思考、多步演绎
- **混合能力整合**：带关键步骤聚焦回放

### 4.2 步骤感知强化学习（Step-Aware RL）

- 步骤级策略优化 + 分层归一化
- **关键步骤奖励塑形**：对关键决策点给予辅助奖励
- **最终答案正确性**仍然是主要优化目标

### 4.3 关键步骤聚焦监督（Key-Step Focused Supervision）

识别关键步骤，例如：

- 获取**关键证据**的步骤
- **拒绝错误假设**的步骤
- 上下文更新**保留已验证证据**的步骤

> 这解决了长期任务的**信用分配（credit assignment）**难题：在几十上百步的轨迹中，哪些步骤真正决定了最终答案的质量？

---

## 五、详细教程：如何用 AREX

### 5.1 方式一：vLLM 部署

```bash
# 安装 vLLM
pip install vllm

# 部署模型
vllm serve BAAI/AREX-Turbo \
  --served-model-name AREX-Turbo \
  --tensor-parallel-size 1 \
  --max-model-len 262144 \
  --reasoning-parser qwen3 \
  --language-model-only
```

### 5.2 方式二：SGLang 部署

```bash
pip install sglang

python3 -m sglang.launch_server \
    --model-path "BAAI/AREX-Turbo" \
    --host 0.0.0.0 \
    --port 30000
```

### 5.3 方式三：Transformers 本地加载

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

### 5.4 Agent 循环：XML 工具调用

```python
from openai import OpenAI

client = OpenAI(
    base_url="http://127.0.0.1:8000/v1",
    api_key="EMPTY",
    timeout=600.0,
)

question = "你的研究问题"
messages = [
    {"role": "system", "content": SYSTEM_PROMPT},  # 包含工具描述
    {"role": "user", "content": f"Question: {question}"}
]

# 循环：生成 → 执行工具 → 追加结果 → 重复
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

    # 如果调用 finish，提取答案并退出
    if "<function=finish>" in assistant_output:
        break

    # 执行工具并追加结果
    tool_result = execute_tool(assistant_output)
    messages.append({"role": "tool", "content": f"<tool_response>{tool_result}</tool_response>"})
```

### 5.5 工具清单（来自 prompts.py）

- `search(query: list[str])` — 批量网页搜索
- `visit(url: str|list[str], goal: str)` — 访问网页
- `google_scholar(query: list[str])` — 学术搜索
- `update_context(context: str)` — 压缩研究状态
- `finish(answer: str, evidences: list[{evidence, url}])` — 提交最终答案

---

## 六、基准表现

### 6.1 AREX 系列成绩

- **BrowseComp**：AREX-Base **82.5** / AREX-Turbo 70.7
- **GAIA**：AREX-Base **85.4** / AREX-Turbo 81.6
- **xbench-2510**：AREX-Base **71.0** / AREX-Turbo 57.0
- **DeepSearchQA**：AREX-Base **89.9** / AREX-Turbo 78.5
- **WideSearch-en**：AREX-Base **82.0** / AREX-Turbo 68.5
- **HLE w/tools**：AREX-Base **52.4** / AREX-Turbo 40.6

### 6.2 与同级及更大模型的对比（部分基准）

- **Qwen3.5-122B**：BrowseComp 63.8 / GAIA 81.6 / WideSearch-en 60.5
- **Qwen3.5-397B**：BrowseComp 78.6 / GAIA 83.5 / WideSearch-en 74.0
- **Kimi-K2.6（1T）**：BrowseComp 83.2 / GAIA 80.6 / WideSearch-en 80.8
- **DeepSeek-Pro（1.6T）**：BrowseComp 83.4 / WideSearch-en 78.0
- **GPT-5.4**：BrowseComp 82.7 / WideSearch-en 88.5
- **Gemini-3.1-Pro**：BrowseComp 85.9 / GAIA 80.6 / WideSearch-en 66.4

> 关键结论：**AREX-Base（122B MoE，仅 10B 激活）** 大幅超越同规模基线，并在多个基准上保持与激活参数多得多的模型相当的水平 —— 验证了「递归自我改进带来的收益 > 单纯扩大参数规模」。

---

## 七、设计哲学

### 7.1 五条核心设计原则

1. **验证是主动控制信号**：验证不是最终过滤器，而是定义研究轮次之间的转换 —— 接受 / 细化 / 重启由它驱动
2. **跨迭代保留进展**：已验证的发现存活下来，只有未解决的约束被重新研究
3. **自主上下文管理**：Agent 自己决定何时压缩上下文，并围绕自己的研究目标组织 —— 而非外部通用摘要
4. **关键步骤信用分配**：关键研究决策（找到证据、拒绝错误假设）获得聚焦的训练信号
5. **效率优先于规模**：递归自我改进比单纯扩大参数提供更好的收益

### 7.2 与相关工作定位

- **vs MiroThinker**：它靠扩大上下文和模型规模；AREX 专注递归改进
- **vs WebResearcher**：它采用迭代范式；AREX 增加验证引导的转换
- **vs DeepSeek / 查询聚合**：AREX 的逐约束验证在根本上不同

### 7.3 为什么独特

1. 发现-验证不对称作为设计原则
2. 递归双循环框架（内循环 + 外循环）
3. 学习到的自主上下文更新工具
4. 关键步骤聚焦训练解决信用分配
5. 带置信度分数的证据支撑答案结构

---

## 八、局限性与开放问题

1. **HLE（Humanity's Last Exam）仍有提升空间**：AREX-Base 52.4%，距离顶尖还有距离
2. **长期信用分配仍具挑战**：几十上百步轨迹中如何精准归因，仍是开放问题
3. **轨迹可恢复性评估偶尔误判**：Refine/Restart 的决策边界不总是完美

---

## 九、归纳总结：观点与结论

### 9.1 核心观点

- **发现-验证不对称是一个可复用的设计原则**：任何「搜索空间大、验证便宜」的问题（研究、调试、决策），都可以借鉴「先验证、后扩展」的递归策略
- **验证驱动迭代，比搜索驱动迭代更高效**：把资源花在验证和精细化上，而不是盲目扩大搜索
- **上下文管理应该是 Agent 的能力，而不是外部工具**：AREX 证明了让模型学会自主压缩上下文，能让长程任务保持连贯的信念状态
- **关键步骤监督是长程 RL 的钥匙**：解决信用分配问题，才能让几十上百步的研究轨迹真正可训练
- **开源 + Apache 2.0 是 BAAI 的生态承诺**：122B 模型（10B 激活）达到接近 1T 模型的水平，让高质量深度研究 Agent 不再是大厂专属

### 9.2 对开发者的启示

- 两个模型都是 Apache 2.0，**可以直接商用**
- AREX-Turbo（4B）可以在消费级硬件上部署，适合轻量研究任务
- AREX-Base（122B MoE，10B 激活）在 vLLM/SGLang 上即可服务，无需千亿级显存
- 256K 上下文 + 工具调用范式（XML）与主流推理框架兼容

### 9.3 结语

> AREX 的启示在于：**深度研究的瓶颈不是「想得久」，而是「改得对」。** 当模型学会验证自己的发现、保留有效进展、聚焦未解决约束时，一个 122B 的 MoE 模型也能在多个基准上逼近 1T 级别的闭源模型 —— 递归自我改进，是比参数堆砌更优雅的进化路径。

**一句话总结：AREX = 验证驱动的递归自我改进，让深度研究 Agent 用更少的算力，逼近更强的模型。**

---

## 参考资料

- 论文：https://arxiv.org/abs/2607.21461
- HuggingFace 论文页：https://huggingface.co/papers/2607.21461
- 模型集合：https://huggingface.co/collections/BAAI/arex
- 项目主页：https://vectorspacelab.github.io/arex-model/
- 在线演示：https://arex-research.com/
- 引用格式：

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