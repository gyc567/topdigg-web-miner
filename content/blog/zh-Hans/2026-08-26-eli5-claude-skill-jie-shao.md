---
title: '让 AI 给任何人解释任何事：ELI5 开源项目深度解析'
date: "2026-08-26"
description: "一个 Claude Code Skill，能自动识别受众并调整解释风格——5岁孩子、经理、工程师、父母。它的评分从 baseline 的 33% 提升到了 91.7%。设计哲学和工程实现同样精彩。"
tags:
  - Claude Code
  - AI Skill
  - Prompt Engineering
  - ELI5
  - 开源项目
  - 评测系统
  - Anthropic
  - LLM 应用
categories:
  - AI工具
  - 开源项目
  - 评测系统
---

> 作者：比特财商
> 本文首发于微信公众号「比特财商」

## 引言：一个困扰所有 AI 用户的问题

你有没有遇到过这种情况？

你问 AI 解释一个技术概念，它给出的回答要么太技术、让你的非技术老板一脸懵；要么太简单，让你这个工程师觉得在侮辱智商。

这就是 DreambigOu 开发 **ELI5** 的起因——**一个让 AI 自动匹配受众解释风格的 Claude Code Skill**。

你只需要说"ELI5 什么是数据库索引"，它就知道是给5岁孩子解释，会用玩具、游乐场的类比；说"向经理解释这个代码库"，它就会用商业影响、风险、时间线来组织语言。

这个项目本身的设计哲学和评测方法，和它的功能一样值得研究。

---

## 一、项目概述

### 1.1 基本信息

| 项目 | 信息 |
|------|------|
| 名称 | ELI5（Explain Like I Am 5） |
| 作者 | DreambigOu |
| 平台 | Claude Code（Anthropic） |
| 协议 | MIT |
| GitHub | github.com/dreambigou/eli5 |
| 核心功能 | 根据受众自动调整解释风格 |

### 1.2 核心功能

ELI5 解决的问题非常具体：**让 AI 能够面向任何人解释任何事**。

它的触发词非常自然：
- "ELI5 什么是区块链"
- "向我经理解释这段代码"
- "用五年级学生能懂的方式讲清楚 git 合并冲突"
- "向我妈解释这个报错"

而它会自动识别受众类型，并调整：
- **词汇**——对小孩不用术语，对工程师用专业术语
- **类比**——对5岁用玩具和游乐场，对经理用商业影响
- **语气**——对孩子活泼，对总监专业，对家人温暖
- **深度**——对简单受众短平快，对研究生深入细节
- **框架**——对经理讲影响/风险，对设计师讲 UX，对工程师讲架构

### 1.3 支持的受众类型

**按年龄：**
- 5岁、10岁、15岁、20-30岁、40+

**按学历：**
- 5年级、初中、高中、大学生、研究生

**按职业：**
- 经理、工程师、设计师、总监、产品经理、同事

**按关系：**
- 妻子/丈夫/伴侣、父母、孩子、朋友

---

## 二、技术架构：Skill 的本质是什么

### 2.1 Claude Code Skills 是什么

在深入 ELI5 之前，需要先理解 **Claude Code Skills** 是什么。

Skills 是 Claude Code 中的**可复用指令集**，打包成 `SKILL.md` 文件。你写一次，之后每次对话 Claude 都会自动遵循这些指令。

这解决了什么问题？

> Instead of re-explaining your preferences every conversation, you write them down once and Claude follows them whenever the skill gets triggered.

不需要每次都重复说明你的偏好，写一次，让 AI 每次都记住。

ELI5 的 SKILL.md 文件就是这种理念的完美体现——它本质上是一套**受众适配规则引擎**，用自然语言描述但结构非常清晰。

### 2.2 ELI5 的 Skill 文件结构

SKILL.md 的核心分为三个步骤：

**Step 1: Identify the Audience（识别受众）**

用表格定义了四类受众的详细风格指南：
- 年龄段 → 对应的语言风格和类比来源
- 学历水平 → 可接受的术语密度
- 职业角色 → 他们关心什么、用什么框架
- 关系类型 → 语气和类比风格

**Step 2: Read the Source Material（阅读源材料）**

在解释之前先充分理解要解释的内容——代码、概念、错误信息、技术文档。

**Step 3: Craft the Explanation（组织解释）**

结构化的写作框架：
1. 先说"是什么"——一句话抓住本质
2. 用类比——连接到受众已知的事物
3. 填充细节——根据受众水平逐步深入
4. 结尾"所以呢"——为什么这对他们重要

### 2.3 为什么 Skill 只是一个 Markdown 文件

这是一个被严重低估的设计决策：

> Skills are just markdown files. There's no special format or schema — it's a SKILL.md with instructions. This makes them easy to version, share, and iterate on.

这带来的好处是：
- **易于版本控制**：可以 git 管理每一次修改
- **易于分享**：直接复制文件即可
- **易于迭代**：改文本比改代码简单得多
- **无锁定**：不依赖任何专有格式或工具

---

## 三、核心设计哲学

### 3.1 受众适配不是"降级"，是"翻译"

ELI5 最核心的设计哲学，也是作者在博客中反复强调的一点：

> Never talk down to anyone. A 5-year-old explanation should feel delightful, not dumbing-down.

给5岁孩子的解释应该是"愉快的"，而不是"降智的"。给经理的解释应该是"赋能的"，而不是"轻视他们的"。

这意味着：
- **面向5岁**：用他们熟悉的事物类比，但保持概念的准确性核心
- **面向经理**：尊重他们的商业智慧，只是不用技术术语
- **面向工程师**：用专业术语，因为他们会觉得没有术语是一种侮辱

**受众适配是一种翻译，不是降级。** 把"法语"翻译成"中文"，不是把内容变简单了，而是换了表达方式。

### 3.2 类比是核心认知桥梁

ELI5 的设计中，类比占据了核心位置：

| 受众 | 类比来源 |
|------|----------|
| 5岁 | 玩具、动物、糖果、游乐场 |
| 10-15岁 | 学校、运动、电子游戏、社交媒体 |
| 20-30岁 | 职场、金钱、租房、日常消费 |
| 40+ | 房产、职业发展、家庭管理 |
| 经理 | 商业影响、时间线、风险、成本 |
| 工程师 | 架构、权衡、性能、可维护性 |
| 设计师 | 用户体验、交互流程、可访问性 |

类比不是装饰品，它是**认知桥梁**——把陌生概念映射到熟悉事物上。

### 3.3 目的优先于机制

Skill 中有一条非常重要的原则：

> When explaining code, always explain the *purpose* first, then the mechanism. Nobody cares about syntax until they know why it exists.

解释代码时，永远先说目的，再说机制。在知道"为什么存在"之前，没人在乎语法。

这条原则贯穿整个 Skill：
- 对5岁：先说"这个东西是干嘛的"
- 对经理：先说"这对我们意味着什么决策"
- 对工程师：先说"解决什么问题，再看实现"

### 3.4 80% 准确率 > 100% 准确率但受众听不懂

这条可能是整个 Skill 中最反直觉的设计哲学：

> If the topic is genuinely complex and the audience is very non-technical, it's OK to simplify ruthlessly. Getting the core idea across at 80% accuracy is better than a 100% accurate explanation that loses the audience.

如果主题确实复杂，而受众完全不懂技术，可以无情简化。让核心概念以 80% 准确率传达给受众，好过给出 100% 准确但受众完全跟不上的解释。

这本质上是一个**保真度 vs. 可理解性**的权衡，ELI5 的立场是：可理解性优先。

### 3.5 默认到最广泛的受众

> If the audience isn't explicitly stated, default to "Age 5" (classic ELI5).

如果受众没有明确说明，默认使用"5岁"——经典的 ELI5 风格。

这是一个聪明的设计选择：
- 最广泛的受众需要最简单直接的解释
- 默认到最简单，可以确保不会有受众被排除
- 用户如果不满意5岁版本，可以明确指定受众

---

## 四、评测系统：如何量化"解释质量"

### 4.1 为什么需要评测

Skill 的评测是一个经常被忽视的环节。作者 DreambigOu 在博客中提到：

> Test before you ship. The skill-creator's evaluation step is useful. It's similar to what I mentioned about staying in design mode — having test cases and baselines before you commit to an implementation catches problems early.

在发布之前测试，有测试用例和 baseline 再投入实现，能在早期发现问题。

ELI5 的评测系统解决了三个问题：
1. **客观量化**：不是"感觉好"，而是有具体指标
2. **对比基准**：有 skill 和没有 skill 的差异有多大
3. **可重复**：每次修改后可以重新跑，看趋势变化

### 4.2 评测方法论

**测试用例设计**

每个测试用例包含：
- `prompt`：用户会说的话
- `name`：目录友好的标识符
- `audience`：目标受众类型
- `assertions`：4条具体的、可验证的评判标准

例如，数据库索引面向5岁的测试用例：
```json
{
  "id": 1,
  "name": "explain-db-index-age5",
  "prompt": "ELI5 what a database index is",
  "audience": "Age 5",
  "assertions": [
    "No technical jargon present",
    "Uses book/page analogy or toy/messy room analogy",
    "Sentences are short and conversational",
    "Warm, enthusiastic tone"
  ]
}
```

**断言的设计原则**

断言必须满足：
- **具体**：可以明确判断对错，不是"感觉不错"
- **可验证**：LLM 评分时能给出证据
- **每条独立**：一条失败不影响其他条
- **4条最佳**：太少没区分度，太多不实际

### 4.3 自动评测脚本

作者让 Claude 生成了一个 Python 脚本 `run-evals.py`，它的工作流程是：

```
┌─────────────────────────────────────┐
│  1. 运行每个 prompt 两次             │
│     - 一次 with skill                │
│     - 一次 without skill (baseline)  │
├─────────────────────────────────────┤
│  2. 对每个输出进行自动评分            │
│     - 用 Claude 对照 assertions 判断  │
│     - 输出 pass/fail + 证据          │
├─────────────────────────────────────┤
│  3. 输出汇总对比                     │
│     - With Skill vs Without Skill    │
│     - Delta 百分比                   │
└─────────────────────────────────────┘
```

运行命令：
```bash
# 运行全部测试 + 自动评分
python eli5-workspace/run-evals.py

# 运行单个测试
python eli5-workspace/run-evals.py --test=1

# 只测试 skill，跳过 baseline
python eli5-workspace/run-evals.py --with-skill-only

# 只评分，不重新运行测试
python eli5-workspace/run-evals.py --grade-only
```

### 4.4 评测结果

| 指标 | With Skill | Without Skill | 提升 |
|------|-----------|---------------|------|
| 通过率 | **91.7%** | 33.3% | **+58.4%** |
| 平均耗时 | 33.0s | 47.4s | -14.4s |
| 平均 Token | 12,430 | 10,076 | +2,354 |

**分项结果：**

Test 1（数据库索引，面向5岁）：
- With Skill：4/4 通过
- Without Skill：1/4 通过
- 差距：无技术术语、语气热情度

Test 2（代码库，面向经理）：
- With Skill：3/4 通过
- Without Skill：0/4 通过
- 差距：商业框架、简洁度、可操作性

Test 3（Git 合并，面向5年级）：
- With Skill：4/4 通过
- Without Skill：3/4 通过
- 差距：术语解释

**最关键的发现：**
> The biggest impact: Manager audience. The skill turned a 0/4 baseline into 3/4. Without guidance, Claude defaults to technical explanations with code blocks — the skill successfully reframes for business context.

对经理受众的影响最大——baseline 是 0/4，有了 skill 变成 3/4。没有 Skill 时，Claude 默认输出技术解释和代码块；有了 Skill，它成功转向商业语境。

### 4.5 自动评分的局限性

作者也坦诚指出了自动评分的问题：

> Auto-grading isn't deterministic. The LLM-based grader gave different scores than the manual grading session. If you're relying on this for quality checks, run multiple iterations and look at the trend rather than any single result.

自动评分不是确定性的。每次评分调用是独立的 LLM 判断，存在一定方差。如果依赖这个做质量检查，应该跑多轮看趋势，而不是看单次结果。

这是一个非常重要的工程认知：**用 LLM 评估 LLM 输出天然有方差**，需要用统计思维处理结果，而不是单点数据。

---

## 五、安装与使用教程

### 5.1 前置要求

- Claude Code CLI 已安装
- 熟悉的命令行环境

### 5.2 安装步骤

**Step 1：克隆仓库**

```bash
git clone https://github.com/DreambigOu/ELI5.git
```

**Step 2：复制 Skill 到 Claude Code 目录**

```bash
cp -r ELI5/skills/eli5 ~/.claude/skills/eli5
```

**Step 3：验证安装**

在 Claude Code 中输入：
```
ELI5 什么是数据库索引
```

你应该会看到一个面向5岁孩子的解释，用玩具和游乐场的类比。

### 5.3 使用示例

**面向5岁孩子解释概念：**
```
ELI5 什么是区块链
```

Claude 会用积木、乐高、分享玩具的类比来解释。

**向经理解释技术问题：**
```
Explain this error to my manager
（附带错误信息）
```

Claude 会用商业影响、时间线、风险来组织回答，不会出现代码块。

**面向5年级学生解释 Git：**
```
Break down how git merge conflicts work for a 5th grader
```

Claude 会用学校小组项目、海报制作的类比，配合适合10-11岁儿童的词汇。

**面向设计师解释架构：**
```
Explain this system architecture to a designer
```

Claude 会用用户体验、交互流程、用户影响来组织，避开底层实现细节。

### 5.4 如何添加新的测试用例

**Step 1：编辑 evals.json**

在 `eli5-workspace/evals.json` 的 `evals` 数组中添加新条目：

```json
{
  "id": 4,
  "name": "explain-recursion-teenager",
  "prompt": "Explain recursion like I'm 15",
  "audience": "Age 15",
  "assertions": [
    "Uses social media, gaming, or phone references as analogies",
    "Tone is casual but not cringey — no 'fellow kids' energy",
    "Correctly explains the concept of a function calling itself",
    "Mentions a base case or stopping condition"
  ]
}
```

**Step 2：运行测试**

```bash
python eli5-workspace/run-evals.py --test=4
```

**Step 3：查看结果**

结果保存在 `eli5-workspace/iteration-N/` 目录下，每个测试用例有独立的 `grading.txt` 文件，包含详细的评分证据。

---

## 六、项目设计亮点总结

### 6.1 产品层面

**精准解决真实痛点**

每个人都会遇到"向不同人解释同一个概念"的场景，但没有人认真解决过这个问题。ELI5 找到了这个高频需求并产品化。

**触发词设计自然**

不需要学新语法，用人类自然语言就能触发——"ELI5"、"向我妈解释"、"告诉老板"。

**受众分类体系完整**

四维受众体系（年龄/学历/职业/关系）覆盖了绝大多数日常解释场景，每个维度都有明确的风格指南。

### 6.2 工程层面

**Skill 文件即产品**

不需要复杂的代码架构，一个 Markdown 文件就承载了完整的逻辑。这让迭代成本极低，任何人都能修改和贡献。

**评测驱动开发**

从一开始就用量化指标指导迭代，而不是"我觉得更好"。这让 Skill 的优化有据可依。

**Baseline 对比设计**

始终对比"有 Skill"和"无 Skill"的表现，这让改进效果透明可见，而不是自说自话。

### 6.3 设计哲学层面

**翻译而非降级**

受众适配的核心哲学是翻译，不是降低内容质量。这确保了每种受众得到的都是高质量、精准适配的解释。

**目的优先原则**

永远先说"为什么存在"，再说"怎么实现的"。这个原则让解释从受众的需求出发，而不是从技术的内部逻辑出发。

**简洁优先**

对复杂技术概念在非专业受众面前，允许"80%准确率但能理解"的设计选择。这避免了"100%准确但完全听不懂"的陷阱。

---

## 七、延伸思考：LLM 应用开发的方法论启示

### 7.1 从"试了再说"到"先测后做"

ELI5 展示了一个重要的范式转变：传统的 Prompt 工程往往是"写一个 Prompt，试了再说"。ELI5 的方法是：

1. **定义 assertions**（具体可测的评判标准）
2. **建立 baseline**（没有 Skill 时 AI 怎么回答）
3. **量化 delta**（Skill 带来了多少提升）
4. **迭代优化**（看数据指导修改方向）

这个方法论可以迁移到任何 LLM 应用开发场景。

### 7.2 Skill 作为 LLM 应用的"设计模式"

Skill 模式本质上是一种**可组合的 Prompt 模板**。它解决的是：
- 不需要在每次对话中重复描述你的偏好
- 一次编写，多次生效
- 可以版本控制、分享、协作

这种模式比"写一个超级 Prompt"更优雅，因为它支持**细粒度的职责分离**——受众识别规则是一层，写作风格是一层，具体解释是另一层。

### 7.3 自动评测的不确定性需要被正视

作者坦诚指出了 LLM 评测的方差问题。这提醒我们：

- 不要用单次评测结果做重大决策
- 看趋势，多轮迭代后的方向比单次分数更有意义
- 自动评测是辅助工具，不是终审法官

---

## 八、给开发者的行动建议

### 8.1 如果你想构建自己的 Skill

1. **从真实痛点出发**：找到你反复遇到的同类 Prompt 问题
2. **先定义成功标准**：在写 Skill 之前就想好怎么评测
3. **建好 baseline**：确保你知道没有 Skill 时 AI 的默认表现
4. **从小处迭代**：先覆盖最常见场景，再逐步扩展
5. **保持 Skill 简洁**：Skill 越长，遵循度越低

### 8.2 如果你想贡献 ELI5 项目

作者在 README 中列出了几个改进方向：
- 添加更多受众类型（如 CEO、实习生、记者）
- 添加非英语语言支持
- 增加更多测试用例提高评测覆盖率

### 8.3 如果你想在自己的产品中实现类似功能

核心 API 设计思路：
```python
def adapt_explanation(content, audience):
    # 1. 识别受众类型
    audience_type = detect_audience(audience)
    
    # 2. 加载对应风格指南
    style_guide = LOAD_STYLE_GUIDE(audience_type)
    
    # 3. 按照风格指南重组内容
    adapted = restructure(content, style_guide)
    
    return adapted
```

关键是**受众分类体系**和**风格指南库**的设计——这是 ELI5 最可复用的部分。

---

## 总结：翻译而非降级，连接而非灌输

ELI5 项目的核心价值，不只是一个"面向不同受众的解释器"，而是一套**让 AI 真正服务人类多样性的方法论**。

它证明了几个重要观点：

1. **LLM 的输出质量高度依赖提示词设计**——同一个 AI，有无 Skill 通过率差 58%
2. **好的工程是让复杂变简单**——Skill 文件只有几百行，但它解决的是真问题
3. **评测驱动迭代**——没有量化就没有优化方向
4. **受众适配是翻译，不是降级**——这是整个项目的核心哲学

> The discoveries are out there, waiting to be made. Why not by you?

原文如此说。而 ELI5 告诉我们另一个角度：**有些伟大发现不只是新知识，而是用更好的方式把旧知识传递给需要它的人**。

---

**相关资源**

- GitHub：https://github.com/dreambigou/eli5
- 博客文章：https://andrewou.pages.dev/posts/building-an-eli5-skill-for-claude/
- 评测方法：https://andrewou.pages.dev/posts/how-to-evaluate-a-claude-code-skill/

---

> 以上，既然看到这里了，如果觉得不错，随手点个赞、在看、转发三连吧，如果想第一时间收到推送，也可以给我个星标，谢谢你看我的文章，我们，下次再见。

*首发于微信公众号「比特财商」。*
