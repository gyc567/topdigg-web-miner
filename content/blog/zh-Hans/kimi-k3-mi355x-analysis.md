---
title: "Kimi K3 × AMD MI355X 深度解析：内存是护城河吗？"
description: "全面分析 Wafer AI 在 AMD MI355X 上以 952 tok/s/节点 服务 2.8T 开源模型 Kimi K3 的一手工程记录。从「内存是护城河」的核心论点出发，到投机解码与 AITER Prefill 优化、再到 MI355X 以 48 tok/s/$ 全面碾压 B200 的性能价格比，一文讲透为什么内存容量在 2.8T 模型体量上首次转化为对英伟达的可量化优势，以及 CUDA 护城河是否真的走到了尽头。"
date: "2026-08-03"
author: "TopDigg Research Team"
tags: ["Kimi K3", "AMD", "MI355X", "Moonshot", "月之暗面", "GPU 推理", "MoE", "投机解码", "ROCm", "Wafer AI", "开源大模型", "性能价格比"]
categories: ["深度解析"]
keywords: ["Kimi K3", "MI355X", "AMD", "月之暗面", "Wafer AI", "内存是护城河", "性能价格比", "投机解码", "AITER Prefill", "ROCm", "B200", "B300", "开源大模型", "GPU 推理", "MoE"]
---

# Kimi K3 × AMD MI355X 深度解析：内存是护城河吗？

> 核心理念：**内存是护城河。** 当开源模型一路膨胀——从 GLM-5.2 的 753B、DeepSeek V4-Pro 的 1.6T，一路涨到 Kimi K3 的 2.8T 参数——推理的临界瓶颈不再是算力，而是谁能把「模型权重 + KV 缓存」塞进显存。AMD MI355X 以 288GB 的 HBM 容量和约 2.4 倍便宜于 B300 的价格，第一次在一个 2.8T 模型上，把对英伟达的优势变成了**可测、可用、可量化**的现实。

---

## 一、项目说明

### 1.1 这是一篇什么文章？

这是 Wafer AI（YC S25 出身的 AI 推理优化公司）发布的技术博客《Is memory the moat?》（内存是护城河吗？），作者 Ian Ye，发布于 2026 年 7 月 31 日。文章记录了团队如何在 **8 张 AMD MI355X 上以 952 token/s/节点 的吞吐**服务开源模型 **Kimi K3（2.8T 参数）**，并把它与英伟达 B200、B300 做了一组硬核的吞吐与成本对比。

这不仅仅是一篇「跑通了模型」的证明文，更是三股力量的交汇：

1. **月之暗面（Moonshot AI）**——发布了一个体量大到超乎寻常的开源模型；
2. **AMD**——证明了在绕开 CUDA 生态的前提下，ROCm 已经能把前沿模型服务到生产级；
3. **Wafer AI**——用自研的 agent 优化能力，把 MI355X 的性价比榨到了极致。

### 1.2 三个主角：模型、显卡、平台

**主角一：Kimi K3（2.8T 参数的稀疏 MoE 开源模型）**

Kimi K3 是月之暗面发布的稀疏混合专家（MoE）模型：总参数 2.8 万亿，但每个 token 只激活约 1040 亿参数。它宣称为开源模型的**新纪元开局**——不仅因为能力接近顶尖闭源模型，更因为它把「开源模型要多大」的天花板拉到了 3T 级。

- 总参数：**2.8T**
- 激活参数：**约 104B（1040 亿）每个 token**
- 上下文长度：**1M token**（1,048,576）
- 架构：MoE + 长上下文注意力优化
- 开源形式：完整权重公开

**主角二：AMD MI355X（288GB 显存的 CDNA 卡）**

MI355X 是 AMD Instinct 系列加速卡，基于 CDNA 4 架构（GFX 95），单卡 **288GB HBM3**、约 **8 TB/s** 显存带宽。对「显存不够」的超大模型而言，它的容量是最核心的卖点。

- 显存：**288GB HBM3**
- 发布：2025 年 6 月
- 定位：英伟达 Blackwell（B200/B300）的**非独家替代**

**主角三：Wafer AI（推理优化创业公司）**

Wafer AI 是 Y Combinator S25 批次创业公司，主打「用 AI agent 自动优化 GPU 推理 kernel」的 serverless 推理服务。他们对 Qwen、GLM、DeepSeek、Kimi 等开源模型提供 OpenAI 兼容的推理 API，哲学是「最大化每一瓦特的智能」（Maximize intelligence per watt）。这篇文章就是它的证明性博客。

### 1.3 为什么这篇文章值得关注

在一个被 CUDA/英伟达垄断了十多年的领域里，一次「中国开源 2.8T 模型 + AMD 显卡 + 推理优化创业公司」的组合，构成了对「CUDA 护城河不可撼动」这一共识最尖锐的一次挑战。更难得的是，这篇博客**不是空洞的营销论调，而是有数字、有底层、有修复代码的一手工程记录**。

---

## 二、核心思想：内存是护城河

### 2.1 被忽视的变量：模型正在变得更「胖」

文章开头就点出一个正在发生的趋势：**模型的能力在涨，但体量涨得更快。**

- GLM-5.2 拥有 **753B**（0.75T）参数；
- DeepSeek V4-Pro 达到 **1.6T** 参数；
- Kimi K3 直接来到 **2.8T** 参数。

参数越大，部署越贵、越难。而要服务 Kimi K3，你需要超过 **1.5TB 的显存**——这还没算上 1M token 上下文的 KV 缓存。

### 2.2 服务 Kimi K3 的几条路

要让 Kimi K3 跑在数据中心里，部署者只有三个现实选择：

- **一台 8 卡 B300 节点**：每卡 288GB，装得下，但价格极高；
- **两台 8 卡（共 16 卡）B200 节点**：拆成 TP16，但要多扛一层跨节点通信；
- **一台 8 卡 MI355X 节点**：也是每卡 288GB，装得下且便宜得多。

请注意：除了 B300，**唯一一个非英伟达、且同样有 288GB 显存的，就是 AMD MI355X**。这正是文章标题的点题之处——**当一个模型大到「必须跨节点」时，内存容量本身就成了壁垒。**

在这条逻辑下，MI355X 不是「性能王」，而是「**承载能力王**」。

### 2.3 MI355X 对 B200 的「容量碾压」

- 单台 **8×MI355X** 提供约 **2.3TB** 显存，可在 TP8 下单节点容纳 Kimi K3（权重 + 1M token KV 缓存）；
- 单台 **8×B200** 只有约 **1.5TB**，装不下，被迫扩到 **TP16 双节点**。

这个「放不下的局部」引出了 B200 的硬伤：**跨节点通信开销**。B200 需要在 decode 关键路径上做跨节点 all-reduce（RoCE v2 约 195 Gb/s），而 MI355X 单节点就能搞定。

> Wafer 的措辞很犀利：「这（跨节点）是 B200 唯一的配置硬伤——但**这恰恰正是重点**：MI355X 的显存容量优势，在 Kimi K3 这个体量上，第一次转化为可测量、可落地的实际收益。」

### 2.4 数据说话：MI355X vs B200 vs B300

在 1,024 token 输入 / 400 token 输出的基准下，按「每节点」测得的对比（价格按公开 GPU 市场计价）如下：

- **单流解码吞吐**：MI355X **118 tok/s**，B200 90 tok/s，B300 172 tok/s
- **峰值聚合吞吐 / 节点**：MI355X **952 tok/s**，B200 约 249 tok/s（16 卡总值 498 分摊到 2 节点），B300 1,568 tok/s
- **峰值聚合吞吐 / 单 GPU**：MI355X **119 tok/s**，B200 31 tok/s，B300 196 tok/s
- **峰值 / 每 $/GPU-hr（性价比）**：MI355X **48 tok/s/$**，B200 7 tok/s/$，B300 33 tok/s/$

> **结论：** 论「聚合吞吐」，B300 依然领先 MI355X 约 1.65 倍；但论「每一美元买到的吞吐」，MI355X（48）把 B300（33）甩开约 1.45 倍，把 B200（7）甩开约 **7 倍**。性价比之王是毫无疑问的 MI355X。

参考公开价格：MI355X 约 **$2.50/GPU-hr**，B300 约 **$6.00**，B200 约 **$4.25**。

---

## 三、技术架构与实战：如何把 Kimi K3 跑在 MI355X 上

### 3.1 好消息：Day-0 支持的开局

Wafer 提到一个被很多人忽略的前提：Kimi K3 在 AMD 上是 **Day-0 支持**——权重发布当天就能在 ROCm 上跑。这背后是 AMD 与月之暗面早已建立的深度合作（在 Kimi 2.6 时代就共同设计了 UMBP、KV 缓存调度、AITER 长上下文加速等组件）。所以 Wafer 要做的工作不是「能不能跑通」，而是「如何把吞吐榨干」。

### 3.2 投机解码（Speculative Decoding）

- Kimi K3 出厂**不带任何草稿张量**（无 MTP、无 EAGLE）；
- 唯一可行路径是**外部投机解码草稿**：RadixArk 的 **Kimi-K3-DSpark**；
- 在 CUDA 上开箱即用，但在 ROCm 上遇到第一个 bug：

```text
NameError: name 'top_k_renorm_prob' is not defined.
```

### 3.3 修 Bug：不是缺 kernel，而是缺定义

这是全篇最精彩的工程复盘。Wafer 的排查过程：

- sglang 的 accept-sampling 校验器有两条构建目标分布的方式：
  - **dense 路径**：调用 `top_k_renorm_prob`；
  - **sparse 快速路径**：直接走 `torch.topk`。
- CUDA 版从 `sgl_kernel` 导入 `top_k_renorm_prob`；但 **ROCm 版只给 top-p kernel 起了别名，把 `top_k_renorm_prob` 留成了未定义**——因为 gfx950 上没有可别名的 top-k renorm kernel。
- 于是，一旦请求落到 dense 路径，校验器就抛 `NameError`，连带整个 scheduler 一起崩。

**修复**：top-k renorm 只是个很小的算子——把模型概率向量里最高的 k 个保留、其余清零、再重新缩放到和为 1。一个 `sort`、一个 `masked_fill`、一个除法就够。Wafer 只把它补进 sglang 的 ROCm 采样分支即可，完全不需要写自定义 kernel。

> 关键经验：**在 ROCm 上遇到报错，第一反应往往是以为缺 kernel，但很多时候只是「缺一个定义」。** 这次就是一个未定义的函数名——问题不是「没 kernel」，而是「某处没被导出」。

**优化收益**：修复并加固投机解码后：

- 单流吞吐提升 **约 2.2 倍**；
- 中负载下每流提升 **约 1.7 倍**；
- 峰值聚合吞吐 **+18%**；
- 更重要的是，峰值聚合吞吐落在了**更高的并发度**（c64 而非无投机时的 c24），更贴近真实生产。

### 3.4 Prefill 优化：decode tok/s 是「傻瓜的金矿」

这是文章最有见解的一句话：**decode tok/s 常常是「傻瓜的金矿」（fool's gold）——被过度神化，而用户真正等待的到首 token 时间（TTFT）却被低估了。**

**前置数据**：同样的 172k token 冷启动 prefill，在 MI355X 上要 **约 51 秒**，在 B300 上只要 **约 23 秒**。对大上下文模型来说，prefill 往往是巨大且可能冷启动的，两三分钟的 prefill 会让整片节点空转。

**根源只在一个 kernel**：Kimi K3 在 ROCm 上回退到了慢速的通用 Triton attention，因为**快速 AITER MLA prefill kernel 没有加载成功**。原因是**形状不匹配**，而不是缺 kernel：

- K3 在 TP8 下每个 rank 上有 **12 个注意力头**；
- AITER 的 MLA 路径只支持 4、8 或 16 的倍数。

**修复**：把注意力头数从 **12 零填充到 16**，用快速 kernel 运算，再从输出里取出真正的 12 个头即可。

**效果**：同一 172k 冷 prefill，AITER MLA prefill 稳态跑到 **约 13k tok/s**（Triton 回退仅约 4–7k tok/s），prefill 提速 **约 2–3 倍**。它不会改变聚合吞吐（decode 不变），但它直接改变**用户等第一个 token 的时间**。

---

## 四、详细教程：在 AMD MI355X 上部署并优化 Kimi K3

下面把 Wafer 的做法整理成可复刻的步骤（环境：8×MI355X、TP8、ROCm、sglang）。

### 4.1 第一步：准备环境

```bash
# 安装 ROCm 与 sglang
pip install --upgrade sglang[rocm]

# 拉取 Kimi K3 权重
huggingface-cli download MoonshotAI/Kimi-K3 --local-dir ./backend
```

确认 ROCm 版本与显卡识别正确（CDNA 4 / gfx950）。

### 4.2 第二步：启动服务（TP8）

```bash
python3 -m sglang.launch_server \
  --model-path ./backend \
  --served-model-name kimi-k3 \
  --tensor-parallel-size 8 \
  --max-model-len 1000000 \
  --reasoning-parser kimi-k3
```

### 4.3 第三步：开启投机解码

```bash
# Kimi K3 需要外部草稿模型，所以加入：
  --speculative-algorithm block \
  --draft-model RadixArk/Kimi-K3-DSpark
```

（前提：先修好 3.3 提到的 `top_k_renorm_prob` 定义。）

### 4.4 第四步：验证与压测

```bash
# 用 curl 测 TTFT 和生成速度
curl -X POST http://localhost:8119/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{"model":"kimi-k3","messages":[{"role":"user","content":"用一句话介绍 MoE 架构"}],"max_tokens":200}'
```

观察首 token 时间与总 tok/s，确认命中 AITER 快速 prefill（否则调整 12→16 头填充）。

---

## 五、基准表现：数字说话

### 5.1 Wafer 实测：MI355X vs B200 vs B300（服务 Kimi K3）

完整数据见 2.4。这里提炼**一句话结论**：

- **性能价格比**：MI355X **48 tok/s/$**，是 B200（7）的约 **7 倍**，是 B300（33）的约 **1.45 倍**；
- **聚合吞吐**：B300（1,568）仍是第一，但 MI355X（952）足以覆盖绝大多数生产场景；
- **单流体验**：MI355X 118 tok/s（比 B200 好约 31%），在 B300 的 172 tok/s 之下。

### 5.2 关键洞察：为什么显存容量在这里变成了「胜负手」

- B200 为了塞下 Kimi K3 被迫 **TP16 双节点**，decode 关键路径背着跨节点 all-reduce，性能被拖累；
- MI355X 单节点 **TP8** 就装下「权重 + 1M 上下文 KV」，没有跨节点代价；
- 于是：**容量优势（288GB）直接换算成了可比、可测的性能与成本优势。**

---

## 六、设计哲学：为什么「内存是护城河」成为 2026 真命题

### 6.1 模型体量军备竞赛，反向利好「大显存」

Kimi K3 的 2.8T，是「越大越强、越强越大」的**军备竞赛**。模型越大，越是只有大显存卡能承载，而这恰恰是 AMD 切入的绝佳位置——**把「能否承载 + 每 token 成本」作为战场，而不是盲目比拼峰值算力。**

### 6.2 AMD：不逐性能，而逐「容量 + 成本」

AMD 在软件生态上常年落后于 CUDA，但这次它换了个打法：

- **不拼单卡算力**，而是提供 **288GB 大显存 + 2.4 倍便宜**；
- **全力投入 ROCm，并做 Day-0 支持**——让熟悉的模型第一天就能用上；
- 用「容量 × 成本」重新定义「有没有资格服务前沿模型」。

### 6.3 出口管制反向利好 AMD

有一个大背景呼之欲出：**英伟达高端芯片对中国出口受限**（H100/B200 等高端产品被「预设拒绝」）。这让中国 AI 团队不得不找替代路径：

- **AMD** 成为「性价比合法」的替代选项——它价格低、游说压力小、且未落在最严厉的禁售档位；
- 于是「**中国大模型 + AMD 卡 + 成本敏感创业公司**」形成**正循环**：模型越大越需要大显存 → AMD 便宜大容量正好 → 越多团队用 AMD → 越多厂商投入 ROCm 优化 → 软件差距被更快填平。

### 6.4 Wafer 的终极观点：agent 优化正在终结「CUDA 垄断」

- Wafer 的信念：与其等 CUDA kernel 白送，不如**用 AI agent 自动优化 kernel**；
- 在这篇文章的结论里它给出一个强烈论断：**「AMD 上的 SOTA 迫在眉睫」（SOTA on AMD is imminent）**；
- 结尾以一个拷问收束：**「Is the CUDA moat dead?」（CUDA 护城河死了吗？）**

---

## 七、归纳总结：观点与结论

### 7.1 核心观点

1. **内存容量是下一代模型的硬门槛**。当模型大到单节点装不下，谁能同时塞下「权重 + KV 缓存」，谁就赢在部署起跑线。
2. **用「性能每美元」选硬件**。MI355X 的 48 tok/s/$ 是 B200 的 7 倍、B300 的 1.45 倍，「性价比之王」当之无愧。
3. **AMD 的软件差距正在被（尤其被 agent）快速填平**。Wafer 用两个「缺定义 / 形状」小 bug 就恢复了生产级性能，全程无自定义 kernel。
4. **TTFT 才是用户感知的体验**。decode tok/s 被神化，首 token 时间才是真；所以优化 prefill（12→16 头、AITER）不是炫技，而是直接省用户等待。

### 7.2 对开发者的启示

- 部署前先问：**这张卡显存够不够装下「权重 + 上下文」？** 这比一味追求「GPU 张数 / 算力」更重要。
- 别被 decode tok/s 冲昏头——**先看你的首 token 延迟**。
- 遇到 ROCm 报错先冷静排查：**很多是「未定义、形状不匹配」而非「缺 kernel」**，改一行就好（`top_k_renorm_prob`、12→16 头都是活例子）。

### 7.3 结语

最后回到标题那个问题：**CUDA 护城河死了吗？**

如果「护城河」指的是峰值性能分数，显然还没有。但如果你把它定义为「**用钱能买到多少智能**」——那这篇文章给了一个不能再直白的答案：**内存，已经成为新的护城河；而 AMD + 中国开源模型的组合，正在掘开这条沟。**

未来值得看的信号：当开源模型体量持续冲高、当 AMD 的 Day-0 支持越来越普遍、当推理框架对 ROCm 的优化越来越深——**「是否还非用 N 卡不可」的答案，正在从「当然」变成「不一定」。**

---

## 参考资料

- Wafer AI 博客《Is memory the moat?》：https://www.wafer.ai/blog/kimi-k3-mi355x
- Kimi K3 官方发布：https://www.kimi.com/blog/kimi-k3
- AMD MI355X 官方页：https://www.amd.com/en/products/accelerators/instinct/mi350/mi355x.html
- AMD 官方 Kimi K3 Day-0 技术文章：https://www.amd.com/en/developer/resources/technical-articles/2026/kimi-k3-on-amd-instinct-gpus.html
- DeepLearning.AI《The Batch》解析：https://www.deeplearning.ai/the-batch/kimi-k3-reveals-how-a-giant-frontier-ai-model-works
- VentureBeat 报道：https://venturebeat.com/technology/chinas-moonshot-ai-releases-kimi-k3-the-largest-open-source-model-ever-rivaling-top-u-s-systems
- vLLM K3 支持：https://vllm.ai/blog/2026-07-27-k3
