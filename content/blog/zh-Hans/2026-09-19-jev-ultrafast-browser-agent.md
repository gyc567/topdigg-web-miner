---
title: "Jev Ultrafast：浏览器Agent的速度革命，7秒完成航班搜索"
date: "2026-09-19"
description: "Jev Ultrafast 是 Browser Use 团队推出的浏览器 Agent 项目，通过动态索引动作空间架构，将苏黎世到伦敦的航班搜索压缩到 7.1 秒。"
tags: ["AI Agent", "浏览器自动化", "Browser Use", "TypeSafe", "LLM", "性能优化"]
categories: ["AI工具", "开源项目", "浏览器Agent"]
---

# Jev Ultrafast：浏览器Agent的速度革命，7秒完成航班搜索

**【导读】** 当大多数浏览器Agent还在用截图+视觉模型慢慢"看懂"网页时，一个叫Jev Ultrafast的项目把苏黎世到伦敦的航班搜索压缩到了7.1秒——而且不靠视觉模型，靠的是一种叫"动态索引动作空间"的架构思路。Browser Use和TypeSafe的这次联手，可能是浏览器Agent从"能用"走向"实用"的关键一步。

---

## 一、项目介绍：谁在做这件事

[Jev Ultrafast](https://github.com/browser-use/jev-ultrafast) 是由 [Browser Use](https://github.com/browser-use/browser-use) 团队推出的浏览器Agent项目，与 [TypeSafe](https://docs.typesafe.ai/introduction) 的Jev模型深度集成。

Browser Use是一个开源的浏览器Agent框架，让AI能够控制浏览器完成各种任务。TypeSafe则是一家做AI推理优化的公司，他们的Jev模型专门针对"动作选择"这个任务做了定制优化。

这个项目的核心理念很直接：**用一个好模型做动作决策，用一个小模型写文字，只在真正需要打字时才调大模型。**

---

## 二、核心技术解析

### 2.1 动态索引动作空间（Dynamic Indexed Action Space）

这是Jev Ultrafast最核心的设计思想。

传统浏览器Agent的做法是：每次决策都让模型从整个网页的所有可能动作中选择——可能对应几十个按钮、下拉框、输入框。这种"扁平"的动作空间有两个问题：一是模型需要在大量无关选项中做筛选，消耗大量token和推理时间；二是容易选错目标。

Jev Ultrafast的方案是**动态生成索引化的元素表格**，每次观察网页后，只把当前页面可见的控件列出来，每个控件带编号：

```
[1] button    Change ticket type · Round trip
[2] combobox  Where from?        · San Francisco
[3] combobox  Where to?          · empty
[4] textbox   Departure          · empty
```

模型只需要从这些编号中选择目标，而不是理解整个DOM树。

### 2.2 操作类型极简化

系统只支持8种操作：

| 操作 | 含义 |
|------|------|
| `CLICK` | 点击目标元素 |
| `TYPE_TEXT` | 向目标输入文字 |
| `SELECT` | 下拉选择 |
| `SCROLL_UP` | 向上滚动 |
| `SCROLL_DOWN` | 向下滚动 |
| `WAIT` | 等待 |
| `DONE` | 任务完成 |
| `BLOCKED` | 任务受阻 |

没有复杂的悬停、右键、拖拽等操作。这种约束让模型的任务变得简单——不需要理解五花八门的网页交互模式。

### 2.3 一次请求完成两个决策

Jev Ultrafast的关键架构在于：**一次TypeSafe请求同时输出操作类型和目标元素**，而不是先决定"点什么"再决定"点哪里"。

```
page → element table → operation + click_target + type_text_target + select_target
                         (一次网络往返)
```

如果操作是`CLICK`，只有`click_target`会真正执行；如果是`TYPE_TEXT`，只有`type_text_target`会执行。每个target head只包含兼容的元素——比如下拉框不会出现在`click_target`中。

**两次决策，一次网络往返，这是速度提升的核心。**

### 2.4 小模型专职写文字

当操作是`TYPE_TEXT`时，系统会调用一个小型的专用LLM来生成要输入的文字（比如城市名"Zurich"）。这个小模型只需要理解"我需要在某个输入框里填什么"，不需要理解整个网页状态。

目前默认使用`inception/mercury-2.5`作为文字生成模型，关闭了推理模式（reasoning disabled），因为这个任务不需要复杂的思考过程。

### 2.5 无截图的默认模式

这里有一个反直觉的设计：**默认Agent循环中不截图**。

传统浏览器Agent大多依赖视觉模型（看图理解网页），但截图非常慢，而且消耗大量token。Jev消费的是结构化的DOM状态，而不是像素级的视觉信息。截图只是给人工检查用的（inspector模式），不参与决策。

---

## 三、性能数据：为什么说这是"极速"

### 3.1 Google Flights实测

项目给出的演示视频显示：苏黎世→伦敦单程航班搜索，在**7.073秒**内完成。计时包含了：
- 模型调用
- 生成的文字（Zurich生成581ms，London生成346ms）
- 浏览器操作
- 加载等待
- 状态判断

视频以1倍速播放，无快进。

### 3.2 与原版的速度对比

团队做了6组对照实验（各3次运行），结果如下：

| 指标 | 原始版本 | 优化版本 | 提升 |
|------|---------|---------|------|
| 任务时间（中位数） | 9.450秒 | 7.092秒 | **25%** |
| TypeSafe请求数 | 22次 | 17次 | 减少23% |
| 浏览器协议调用 | 1,092次 | 101次 | **减少91%** |

浏览器协议调用减少91%这个数字特别有意义——原来的版本每次DOM变化都会触发重新决策，现在只在关键状态变化时才决策。

### 3.3 其他任务

- 维基百科文章打开：**2.798秒**
- 本地酒店搜索+筛选：**1.896秒**

### 3.4 成本数据

在一次完整的航班搜索任务中：
- TypeSafe输入token：90,558
- TypeSafe输出token：6,325
- 文字生成费用：约 **$0.00006272**

整体模式是非常经济的——大模型只做动作决策，文字生成用小模型，而且只在需要时才调用。

---

## 四、设计哲学归纳

### 4.1 约束即性能

系统只支持8种操作，每个操作都有明确的执行条件。这种强约束不是功能缺失，而是性能来源——当模型只需要在有限选项中做选择时，速度和准确率都会提升。

这和Unix的设计哲学有异曲同工之处：**做一件事并做到最好，而不是做所有事但都很平庸。**

### 4.2 等待的艺术

很多浏览器Agent在交互后立即读取页面状态，但Jev Ultrafast做了精确的等待策略：

- 在下拉框输入后，等待可见的建议列表，最多**200ms**
- 其他交互最多等待**两个动画帧或50ms**

这个设计承认了一个现实：网页是有动画和异步加载的，快速读取往往会读到不完整的状态。等待200ms比反复重试要高效得多。

### 4.3 验证而不是信任

模型输出的任何操作目标都从观察到的DOM节点解析而来，**模型输出永远不会是选择器、坐标、shell命令或可执行的JavaScript**。执行前还会重新检查页面新鲜度和点击遮挡。

系统不相信模型的输出，而是将模型输出作为索引，在真实DOM中查找对应的节点再执行。

### 4.4 可见文本才发送

离屏的文章主体和页脚不会填入模型上下文。这避免了大量无关内容干扰模型判断，同时也减少了token消耗。

### 4.5 一次只做一件大事

每个决策周期只做一件事：观察→决策→执行。不是批量读取DOM，不是预填充所有可能的选择，只在需要时才做一次精确的快照。

---

## 五、当前局限与未来方向

### 5.1 已知的局限

根据项目文档，以下场景暂不支持：

- Shadow DOM 和 iframe 穿透
- Canvas 交互
- 文件上传
- 弹出标签页（pop-up tabs）
- 嵌套滚动
- 复杂的自定义键盘组件

这些是MVP阶段的正常取舍。系统只是降低出错的概率，而不是保证100%正确。

### 5.2 未来的方向

从技术演进角度看，这个方向有几个值得期待的方向：

1. **云端部署**：Browser Use Cloud已经在waitlist阶段，意味着未来可以不用本地运行，在云端获得极速的浏览器Agent能力
2. **更多模型支持**：目前除了TypeSafe Jev外，还支持Gemini、GLM、DeepSeek的OpenAI兼容接口
3. **更丰富的交互**：随着DOM reader支持更多HTML和ARIA控件，可以处理更复杂的Web应用

---

## 六、快速上手教程

### 6.1 环境准备

首先确保你安装了以下工具：

- **Chrome浏览器**（需要开启远程调试模式）
- **uv**（Python包管理器）
- **Git**

### 6.2 安装步骤

```bash
# 1. 克隆项目
git clone https://github.com/browser-use/jev-ultrafast.git
cd jev-ultrafast

# 2. 安装依赖
uv sync

# 3. 配置环境变量
cp .env.example .env
```

然后编辑`.env`文件，添加你的API密钥：

```env
TYPESAFE_API_KEY=your_typesafe_api_key
TEXT_MODEL_API_KEY=your_openrouter_key
```

> **获取API密钥**：
> - TYPESAFE_API_KEY 需要去 [TypeSafe官网](https://docs.typesafe.ai/introduction) 申请
> - TEXT_MODEL_API_KEY 可以使用OpenRouter的密钥，默认demo使用 `inception/mercury-2.5`

### 6.3 启动Inspector界面

```bash
uv run jev
```

然后打开浏览器访问：**http://127.0.0.1:8766**

界面中有两个模式：
- **Run automatically**：自动运行演示
- **Choose next**：手动单步执行，可以观察每个决策细节

### 6.4 使用Python库

```python
from jev_ultrafast import Agent

with Agent(
    "https://www.google.com/travel/flights?hl=en",
    "Find one-way flights from Zurich to London on September 20, 2026, "
    "for one adult in economy. Stop when matching flight options are visible.",
) as agent:
    for state in agent.run():
        print(state["elapsed_ms"], state["status"])
```

### 6.5 运行示例

```bash
# 运行维基百科示例
uv run --env-file .env python examples/run.py \
  --url https://en.wikipedia.org/wiki/Main_Page \
  --goal 'Find and open the Wikipedia article about Gödel's incompleteness theorems.'

# 运行航班搜索示例
uv run --env-file .env python examples/flights.py --keep-open
```

### 6.6 开发测试

```bash
# 代码检查
uv run ruff check .

# 运行测试
uv run pytest

# TypeScript类型检查
node --check jev_ultrafast/static/app.js
node --check jev_ultrafast/snapshot.js

# 构建
uv build
```

---

## 七、项目架构解析

Jev Ultrafast的代码结构非常精简，核心只有6个文件：

| 文件 | 职责 |
|------|------|
| `agent.py` | 完整Agent循环和文字助手交接 |
| `snapshot.js` | 原子级DOM快照、索引控件、新鲜度守卫 |
| `browser.py` | 浏览器连接、当前几何位置、执行操作 |
| `model.py` | 动态操作/目标头和文字生成 |
| `questions.py` | 模型指令 |
| `demo.py` | 本地Inspector界面 |

这种"小到可以读完"的设计是项目刻意为之——每个文件都可以在几十分钟内完全理解，方便开发者审查和定制。

---

## 八、为什么这个方向值得关注

### 8.1 从"能用"到"实用"的跨越

浏览器Agent喊了几年，但大多数方案有两个致命问题：**太慢**和**太贵**。截图模型的token消耗是出了名的，而每次DOM变化都重新决策的方案延迟又太高。

Jev Ultrafast通过架构创新（动态索引+两决策合一+小模型写文字）把单次任务成本和时间都降了一个数量级，这才是从玩具走向实用的前提。

### 8.2 约束哲学的胜利

AI领域普遍存在"功能膨胀"的倾向——模型越来越强，能做的事越来越多，但每件事都做得不精。Jev Ultrafast反其道而行：强约束、窄聚焦、把一件事做到极致。

### 8.3 浏览器Agent的新范式

传统浏览器Agent的思路是"模型理解网页→决定动作"，Jev Ultrafast的思路是"网页生成索引→模型选编号→执行"。后者把网页状态变成了模型的输入格式，而不是让模型去解析网页。

这是一个很重要的范式转换：**不是让模型适应网页，而是让网页适应模型。**

---

## 九、总结

Jev Ultrafast是浏览器Agent领域的一次重要的工程优化尝试。它的核心贡献不是某个算法的突破，而是一种**系统性的架构思路**：

1. **动态索引动作空间**：把网页控件变成模型的简单选项表
2. **两决策合一**：一次请求同时输出操作类型和目标
3. **小模型专职文字生成**：降低文字输入的成本
4. **精确等待策略**：承认网页异步特性，不盲目追求速度
5. **验证优于信任**：模型输出只是索引，真实执行基于DOM节点

7秒完成一次航班搜索，听起来不算惊人——但如果你考虑到这是纯语义理解（"Zurich"和"London"是AI生成的，不是预设的），而且在浏览器中实际执行，这个速度就有了不一样的意义。

Browser Use Cloud已经在路上，浏览器Agent的极速时代，或许才刚刚开始。

---

**参考资料：**
- [Jev Ultrafast GitHub仓库](https://github.com/browser-use/jev-ultrafast)
- [TypeSafe Jev文档](https://docs.typesafe.ai/introduction)
- [Browser Use官网](https://browser-use.com)
- [Browser Harness项目](https://github.com/browser-use/browser-harness)
