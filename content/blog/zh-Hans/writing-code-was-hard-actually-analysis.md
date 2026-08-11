---
title: 'Promptless《Writing code was hard, actually》深度解析：当"代码从来不是难题"成为流行叙事，是时候把账算清楚了——市场、机器与工程师'
description: '以 Promptless 工程博客《Writing code was hard, actually》为主线，深度解析这篇短文如何反驳"写代码从来不是难题"这一轮流行叙事。一文讲透：①项目说明——Promptless 是什么、为什么这篇短文值得一读；②详细教程——三条主要证据线（时机、机器、市场）+ 一个正面观察（"这技能正在变便宜 ≠ 这技能从来不行"）+ 一个工程警示（"工程师造了叫他们平凡的工具"）；③观点归纳——文章把"AI 让代码变便宜"和"代码从来容易"分开；④设计哲学——对稀缺性叙事、对历史尊重、对工程师身份的三层姿态。核心主张：不要把"技能变便宜"改写成"技能从来平凡"——前者是诚实的市场评估，后者是改写历史。这篇短文给工程叙事里"AI 取代/不取代谁"提供了最干净的论证模板。'
date: "2026-08-10"
author: "TopDigg Research Team"
tags: ["Promptless", "writing-code", "AI Engineering", "Software Engineering", "AI Agents", "Engineering Culture", "AI Hype", "Code Generation", "Engineering Identity", "Career"]
categories: ["Deep Dive"]
keywords: ["Promptless", "writing code was hard", "AI 取代程序员", "写代码从来不是难题", "工程叙事", "AI 炒作", "LLM 训练成本", "软件工程师薪资", "工程身份", "AI 时代职业", "AI 工具", "工程文化"]
---

# Promptless《Writing code was hard, actually》深度解析：当"代码从来不是难题"成为流行叙事，是时候把账算清楚了——市场、机器与工程师

> 核心思想：**"写代码从来不是难题"是一种便利的修正主义（revisionism），它恰好在 AI 让代码变得几乎免费时被发明出来。Promptless 工程博客的《Writing code was hard, actually》用四条证据线拆穿它——时机（2018 年没人这么写，那时要求问题同样存在）、机器（数百亿美元 + 千兆瓦 + 专门超级计算机只为部分自动化一件"容易"的事）、市场（三十年来软件工程师薪资稳步上升，要么市场三十年集体非理性，要么写代码就是难）、工程师（写 LLM 的人本身就是软件工程师——他们用这项技能部分自动化这项技能）。** 但文章最清醒的地方不是"反驳"，而是承认里面有一句真话："这技能正在变稀缺"——只是请别把它改写成"这技能从来平凡"。一个是诚实的市场评估；另一个是改写历史。**它给所有"AI 取代 / 不取代谁"的讨论提供了一个干净的论证模板：先问"机器贵不贵"，再问"市场判了多少年"，最后问"谁造了这台机器"——三个问题合起来，叙事就立不住。**

---

## 一、项目说明

### 1.1 它是什么？

本文解析的是 **Promptless**（promptless.ai）工程博客上的一篇短文 **《Writing code was hard, actually》**。

Promptless 自己做什么：自动随你的产品迭代而更新客户文档的 AI 工具（"automatically updates your customer-facing docs as you ship features and support customers"）。它家技术博客以"工程叙事 + 文档工程"为主调，短小、立场鲜明、不绕弯子——这篇就是典型样本。

文章长度 ~900 字（中文翻译后约 1300 字），但结构极干净：

1. **现象**：每隔几天就有人发"写代码从来不是难题"的帖子
2. **揭穿**：这种叙事是"便利的修正主义"
3. **四条证据**：时机 / 机器 / 市场 / 工程师
4. **承认里面有一句真话**：技能正在变稀缺（不是"从来平凡"）
5. **尾声**：工程师造了这台机器——他们不是被取代的人，而是最有可能回答"接下来该怎么办"的人

### 1.2 一句话定位

> **这是一篇 900 字的工程文化短文，反驳"写代码从来不是难题"的流行叙事，论证基础是三条证据线（机器、市场、工程师）加一个对"技能变便宜"和"技能从来平凡"的区分。**

### 1.3 关键事实

- **来源**：Promptless 工程博客（[promptless.ai/blog/technical/writing-code-was-hard-actually](https://promptless.ai/blog/technical/writing-code-was-hard-actually)）
- **类别**：工程文化 / Technical
- **作者**：Promptless 团队（短文未署名个人）
- **格式**：单页短文，无图表、无代码、无产品推介——**纯观点**
- **核心动作**：反驳（rebuttal）"写代码从来不是难题"这一轮流行叙事
- **配套文章**（同站）：[Docs Site Search Optimization](https://promptless.ai/blog/technical/docs-site-search-optimization)、[Developer Relations Docs](https://promptless.ai/blog/technical/developer-relations-docs)、[Developer Relations Docs Have a New Primary Reader](https://promptless.ai/blog/technical/developer-relations-docs-agent-primary-reader)
- **关联产品**：Promptless 主产品是自动文档更新工具；本文与产品功能无直接关系——属于工程文化评论

### 1.4 它解决的问题

2025–2026 年，X / LinkedIn / 各种行业自媒体上反复出现这类帖子：

> "工程师用自然语言描述改动，Claude Code 自动写代码。"
> "非技术人员从零开始做产品，再也不需要碰一行代码。"
> "写代码从来不是难题——理解需求、设计系统、跟利益相关者沟通才是。"

**这种叙事正在做一件很具体的事：把一项被部分自动化的技能，从"曾经很难但被解决了"重新包装成"从来就不难"——从而让"AI 取代程序员"这件事看起来是必然的、早就该发生的、不是任何人的错。**

Promptless 这篇短文做的事是：**别接受这个改写。** 用证据把它顶回去。

---

## 二、详细教程：四条证据线 + 一个正面观察 + 一个工程警示

文章没有给"代码"——它给"论证"。本节把它的论证结构拆开，每条都给可识别的证据、可复用的反驳模板、可类比的实际场景。

### 2.1 证据 1：时机把"叙事"暴露出来

**原文论证**：

> "If writing code was never the hard part, someone should have been saying this in 2018. The requirements problem existed then. System design existed then. But nobody was writing blog posts about how coding was a trivial formality, because it obviously wasn't."

**这条证据的结构**：

- **如果 X 是真的，X 应该在 X 之前就被说出来**（时间反证）
- 2018 年，需求问题、系统设计、跟利益相关者沟通——这些问题早就存在
- 但**当时没人写"写代码从来不是难题"**——因为它明显不是
- 叙事出现在 AI 让代码变便宜的同一刻——**说明它是 AI 时代的产物，不是工程真相**

**可复用的反驳模板**：

> "如果你声称的"X 一直如此"在 2018 年没人说，那它不是"一直如此"，它是"最近才被发明出来支持一个新立场"。

**类比**：

- 2010 年没人说"开飞机从来不是难题"——那时确实不是。AI 自动驾驶出现后才有人开始说"开飞机本来就只是规则匹配"
- 2015 年没人说"翻译从来不是难题"——神经机器翻译质量上来后（2016-2017）才出现"翻译本来就只是语言转换"的论调

### 2.2 证据 2：机器是证明

**原文论证**：

> "If writing code were easy, you would not need the machine. You don't spend billions of dollars training a model on purpose-built supercomputers to automate something trivial."

**这条证据的结构**：

- **工具的存在就是任务难度的反证**——人类造工具是为了做自己做不到或做得差的事
- LLM 训练：数十亿美元 / 专门超算 / 千兆瓦电力 / 数十年的算法研究——只为"部分自动化"代码生成
- 投入如此规模资源的，**不会是"从来就不是难题"的任务**

**文章用了一个很狠的反问**：

> "Can you describe the chip architecture, power delivery, and network topology required to run the coding tool you're using to declare that coding was never hard?"

——你用的让"写代码看起来容易"的工具，本身就是一个地球上几乎没人能完全理解的工程奇迹。让"容易"发生的那台机器，恰恰证明了"不容易"。

**可复用的反驳模板**：

> "如果这件事真的容易，你不需要造这么贵的机器来部分自动化它。"

**类比**：

- 机器人焊接汽车车身——**我们不说"焊接从来不是难题"**；我们说焊接工程师解决了一个难题
- 写作辅助 AI——我们不说"写作从来不是难题"；我们说作者解决了一个难题
- 选择性使用"从来不是难题"这个修辞——**取决于被自动化的是不是你**

### 2.3 证据 3：市场不是被骗了三十年

**原文论证**：

> "For thirty years, companies fought over software engineers. Salaries climbed steadily. Entire recruiting industries existed just to find people who could do the job. Was the market wrong this entire time? The 'never the hard part' crowd has to pick one: either the labor market was wildly irrational for three decades, or writing software was in fact hard."

**这条证据的结构**：

- 市场是信息的最终聚合器——**它不撒谎三十年**
- 软件工程师薪资三十年来稳步上升、专门猎头行业、签证政策向技术工人倾斜——所有这些都说明"写代码的人在做的事很值钱"
- "从来不是难题"派必须二选一：**市场错了三十年，或者写代码确实难**
- 显然市场没错

**可复用的反驳模板**：

> "在 30 年的薪资数据面前，你的"从来不是难题"必须解释一下为什么猎头公司、签证政策、薪酬曲线都按相反方向走。"

**类比**：

- 外科医生收入高 / 律师合伙人收入高 / 资深交易员收入高——市场对"难做的事"给出的价格是一致的
- **如果"写代码从来不是难题"成立，那这三十年里所有给软件工程师溢价的人——董事会、HR、猎头、移民官——都错了**

### 2.4 证据 4：工程师自己造了"取代"他们的工具

**原文论证**：

> "It's not like a bunch of outsiders looked over at software engineers and thought, 'those lazy bastards soaking up all that pay for easy work—let's build AI to expose them.' Coal miners did not do this. Management consultants did not do this. The people who built LLMs are software engineers. Researchers who write code. Infrastructure teams who write code. ML engineers who write code. They spent their careers mastering the skill, and then used that mastery to partially automate it."

**这条证据的结构**：

- 写 LLM 的人**就是软件工程师**——他们用了三十年来掌握"写代码"这项技能，再用这项技能**部分自动化**它
- 不是"外行看到内行赚钱不爽"——**是内行用了自己的技能造了一个新工具**
- 这跟机器人工程师造焊接机器人是一回事——**没人会说"焊接从来不是难题"**

**可复用的反驳模板**：

> "把工具造出来的人就是那些被认为在做"容易事"的人——你要么承认造工具需要掌握"容易事"，要么承认这事儿从来不容易。"

**类比**：

- 焊接工程师造焊接机器人——**不被解释为"焊接从来平凡"**
- 翻译家造翻译工具——**不被解释为"翻译从来平凡"**
- 唯一的不同是工程师**没有工会**和**没有显眼的职业保护伞**——所以"从来平凡"这种修辞能畅通无阻

### 2.5 正面观察：里面有一句真话

文章在反驳后，主动**承认真相的一部分**：

> "The economic value of writing code, in isolation, is declining. AI tools are making it cheaper and faster to produce working software. The mix of skills that makes an engineer valuable is shifting. Those are true, defensible claims."

**承认了什么**：

- **单看"写代码"这一项技能的经济价值在下降**
- AI 让"产生可工作的软件"变得更便宜、更快
- **工程师的"什么让你值钱"组合在变**——编码能力占的比例在变，别的能力在变

**这是诚实的部分**。

但文章立刻把这条诚实**和另一件事切开**：

> "But that's not what people are saying. They're reaching backward in time to retroactively trivialize the skill. There's an enormous difference between 'this skill is becoming less scarce' and 'this skill was never impressive.' One is an honest market assessment. The other is rewriting history."

**这是文章最锋利的一刀**：

- "这项技能正在变稀缺"——**诚实的市场评估** ✓
- "这项技能从来就不令人印象深刻"——**改写历史** ✗

**这两件事**完全不同**——把后者包进前者就是修正主义**。

**可复用的认知框架**：

> "趋势 ≠ 改写"。"AI 让 X 变便宜了" 是趋势；"X 一直很容易" 是改写。

### 2.6 工程警示：工程师造了这台机器

**文章结尾**：

> "But as we adapt, it's worth remembering who made the machine. Not the executives. Not the thought leaders. Engineers made it. The same people now being called trivial built the tool being used to call them trivial. That should give everyone pause."

> "The engineers who built the modern digital world aren't suddenly less capable because their hardest problem got automated. If anything, they're the ones best positioned to tackle what comes next. They've already proven they can do hard things. Now they have better tools."

**这一段的姿态**：

- 不煽情；不"工程师被低估了"
- 是陈述事实 + 给出可验证的预测
- **事实**：写 LLM 的人、写超算的人、写分布式训练代码的人——都是软件工程师
- **预测**：这群人最有能力回答"AI 时代接下来怎么走"
- **不是安抚，是归位**

### 2.7 一句话总结

> **"一项技能变便宜"≠ "一项技能从来平凡"。** Promptless 用 900 字把这个区分讲透了。区分方法很简单：问三个问题——机器贵不贵？市场判了多少年？谁造了这台机器？——三问之后，"从来平凡"站不住。

---

## 三、观点归纳：把 900 字拆成 5 条核心判断

把短文的核心论证汇总，得到 5 条对工程叙事的判断。

### 3.1 观点 1：便利的修正主义是最难对付的叙事，因为它不是错的，是"部分对的"

**核心**：

> "It is convenient revisionism, because it arrives at exactly the moment that AI tools are making code free to produce, and it flatters exactly the people who never wrote any."

**展开**：

- "写代码从来不是难题"不是完全错的——里面混着"AI 让代码变便宜"这一句真话
- 但**它把"现在变便宜"改写成"从来平凡"**——这是修辞动作
- 这种修辞最难反驳，因为反驳者要先承认其中一部分真话，然后才能说"但不是你想的那种"——**心理门槛很高**

**结论**：

- 反驳这类叙事不要从"完全错"开始——**从"部分对"开始**："你前面那段对的，但最后那句不是"
- 修正主义之所以"便利"，**是因为它的"对的部分"给读者打了预防针**——让你不好意思反驳"对的部分"，于是连"错的部分"也吞了

### 3.2 观点 2：工具的存在本身就是任务难度的反证

**核心**：

> "If writing code were easy, you would not need the machine."

**展开**：

- 人类造工具 = 人类做不到或做不好那件事
- LLM 不是"魔术"——是**数十亿美元 / 专门超算 / 千兆瓦电力 / 几十年算法研究** 堆出来的
- 这么大规模的资源**只为了部分自动化**——因为"完全自动化"做不到
- 让"写代码看起来容易"的工具，**本身就是工程奇迹**——让"容易"发生的那台机器证明了"不容易"

**结论**：

- 评估一项技能是否"从来平凡"——**先看为此投入了多少资源**
- 投入越多 → 任务越难
- 反过来看：AI 自动化的"轻" ≠ 原任务的"轻"——自动化只是让"轻"看起来容易了

### 3.3 观点 3：三十年的薪资数据比任何博客帖子都有说服力

**核心**：

> "Was the market wrong this entire time?"

**展开**：

- 市场聚合所有信息——**它不撒谎三十年**
- 软件工程师薪资三十年来稳步上升——这件事**横跨多个经济周期、横跨多国、横跨多个细分领域**
- "从来不是难题"派必须解释：**为什么市场连续三十年都判错了？**
- 唯一一致的解释是"写代码就是难"

**结论**：

- 当一个叙事跟三十年的市场数据矛盾——**先怀疑叙事**
- 修正主义的特点是"快速而合理"——但它需要"市场是傻子"这种**反事实假设**才能成立
- 评估任何"X 从来平凡"的论断——**查三十年的薪资曲线**

### 3.4 观点 4："技能正在变稀缺"和"技能从来平凡"是完全不同的两件事

**核心**：

> "There's an enormous difference between 'this skill is becoming less scarce' and 'this skill was never impressive.' One is an honest market assessment. The other is rewriting history."

**展开**：

- 趋势判断 vs 历史改写——**两件完全不同的事**
- "AI 让写代码变便宜"——**是 2023 年开始的现象**（GPT-4 之后）
- "写代码从来不是难题"——**是 2018 年不存在的立场**
- **把"现在变稀缺"伪装成"从来平凡"是时间维度的偷换**

**结论**：

- 区分"对未来的判断"和"对过去的判断"——**别让对未来的判断改写过去**
- 修正主义的标准操作：用"X 现在 X"的话术，让人以为"X 一直 X"——但前者是观察，后者是断言
- 任何"X 变便宜"的诚实话术，**都不需要"X 一直平凡"这个尾巴**——加上尾巴就是修正主义

### 3.5 观点 5：谁造了机器，谁就有能力回答"接下来怎么走"

**核心**：

> "The engineers who built the modern digital world aren't suddenly less capable because their hardest problem got automated. If anything, they're the ones best positioned to tackle what comes next."

**展开**：

- 不是安抚，是归位
- 写 LLM 的人**本身**就是软件工程师
- 这群人有**三十年的工程经验**——只是"编码"这一项被部分自动化了，其他能力（系统设计、需求理解、跨团队沟通、对机器的理解）**没有自动化**
- 这群人最有能力**判断"AI 时代哪些事值得做"**——因为他们懂机器

**结论**：

- 评估"AI 时代谁被取代"——**别看技能清单，看技能持有人**
- 软件工程师**不会**因为"编码被部分自动化"就被取代——因为他们**整个职业身份**从来不是"编码"，是"用工程方法解决难题"
- 真正被取代的是**单一技能工种**（只会编码而不懂系统的人），**不是工程师职业**

### 3.6 5 条观点的关联结构

```
观点 1：便利的修正主义（用"部分对"包装"部分错"）
   ↓ (修辞手法)
观点 2：工具存在就是任务难度的反证
观点 3：市场三十年不撒谎
   ↓ (历史事实)
观点 4：趋势 ≠ 改写
观点 5：工程师不会被取代，被取代的是单一技能工种
```

观点 1 是修辞层（"为什么这种叙事难对付"），观点 2/3 是事实层（"反驳它需要什么证据"），观点 4 是区分层（"真话和假话怎么切"），观点 5 是预测层（"那工程师的未来是什么"）。**这 5 条合起来构成一个完整的"AI 时代工程叙事"论证模板。**

---

## 四、设计哲学：从这篇 900 字看 Promptless 的工程姿态

Promptless 这篇短文（以及同站的几篇技术博客）展示了一种**罕见的工程姿态**——**给"AI 取代 / 不取代谁"这类话题立了一个干净、可复用、不煽情的论证模板**。把这种姿态抽出来，得到 4 条设计哲学。

### 4.1 哲学 1：诚实承认"部分对"，再切开"部分错"

**姿态**：

文章不否认"AI 让代码变便宜"——**这是真的**。它做的是**承认真的部分，然后切开假的部分**：

> "Those are true, defensible claims. But that's not what people are saying."

**为什么这是好的工程姿态**：

- 拒绝"全对或全错"二元论——**真实世界的判断都是部分的**
- 把"对的部分"留给读者——**不羞辱那些已经接受这种叙事的人**
- 把"错的部分"清晰切开——**让读者能选择跟哪一半走**

**可复用模板**：

> "你说的是真的——但只到这一句。从这一句开始，你说的不是真的。"

**反例（不该怎么写）**：

- 完全否认"AI 让代码变便宜"——**这是另一边的修正主义**
- 把反驳变成吐槽——**情绪化让论证失效**
- 用"工程师是弱势群体"的姿态——**没人需要被保护**

### 4.2 哲学 2：用证据反驳叙事，不用情绪反驳叙事

**姿态**：

文章的全部 4 条证据——时机、机器、市场、工程师——**都是可查的事实**。没有任何情绪、抱怨、立场化。

**为什么这是好的工程姿态**：

- 工程师读者**只看证据**
- 证据型反驳可以**被引用、被复现、被检验**
- 情绪型反驳只能**被感受、被遗忘**

**可复用的反驳结构**：

> "你说 X。X 在 Y 时间被说出过吗？X 需要 Z 资源的投入吗？X 的市场数据是 W 吗？X 的工具是谁造的？——如果四个问题都站不住，X 是叙事，不是事实。"

**反例（不该怎么写）**：

- "我作为工程师很心痛"——**情绪无法反驳叙事**
- "那些 AI 炒作的人不懂"——**人身攻击让工程读者关掉**
- "未来五年会证明你是错的"——**未来派不是论证**

### 4.3 哲学 3：把"AI 时代"的判断放回时间维度

**姿态**：

文章反复回到**时间维度**：

- "If writing code was never the hard part, someone should have been saying this in 2018."
- "三十年来，薪资稳步上升"
- "The 'never the hard part' crowd has to pick one"

**为什么这是好的工程姿态**：

- 任何"X 一直如何"的判断都需要**时间维度的证据**
- 没有时间维度的判断都是**当下叙事**——而叙事会随 AI 能力一起变
- 工程读者**对历史敏感**——他们读过 LLM 之前的工程史

**可复用的判断框架**：

> 任何"X 从来如此"的论断——问"那 2018 年、2010 年、2000 年为什么没人这么说？"
> 任何"X 现在如此"的论断——问"从什么时候开始？触发事件是什么？"

### 4.4 哲学 4：让"做这事的人"出场，让叙事回到人

**姿态**：

文章最锋利的一刀不是机器 / 不是市场——是**"造这台机器的人就是被认为做"容易事"的人"**。

> "The people who built LLMs are software engineers. Researchers who write code. Infrastructure teams who write code. ML engineers who write code. They spent their careers mastering the skill, and then used that mastery to partially automate it."

**为什么这是好的工程姿态**：

- 修辞性叙事常常**把"做事的人"抽空**——只剩"事"和"抽象能力"
- 把"做事的人"放回中心——**叙事立刻失去它的修辞力量**
- "造机器人的人"= "被认为是做容易事的人"——**这种自我指涉没法被绕开**

**可复用的写作动作**：

> 任何"X 正在被 AI 取代"——问"造这个 AI 的人，是不是之前被认为在做 X 的人？"
> 如果是——**叙事站不住**。
> 如果不是——**这是新的工种转移**（值得讨论）。
> 但大部分情况都是前者。

### 4.5 哲学小结：4 条哲学构成 Promptless 短文的姿态

| 哲学 | 一句话 | 文章里的动作 |
|---|---|---|
| 1. 承认部分对，切开部分错 | 拒绝二元论 | 承认"技能变稀缺"，切开"从来平凡" |
| 2. 证据反驳叙事 | 工程师只看证据 | 时机 / 机器 / 市场 / 工程师 4 条证据 |
| 3. 放回时间维度 | 修辞怕历史 | 2018 / 1990 / 30 年薪资曲线 |
| 4. 把"做事的人"放回中心 | 叙事怕自我指涉 | 写 LLM 的人 = 软件工程师 |

**4 条不是独立的——它们组成一个反驳工具箱**：
- 想反驳一个 AI 时代叙事——**先用哲学 3 把它放回时间**（"那以前呢？"）
- 时间撑不住——**用哲学 2 找证据**（市场、机器、人）
- 证据还是撑不住——**用哲学 1 切开"对的部分和错的部分"**
- 最后——**用哲学 4 让人出场**（造 AI 的人就是被认为"做平凡事"的人）

**Promptless 这篇 900 字短文不是评论——它是一份"AI 时代工程叙事反驳"的可复用方法论。**

---

## 五、核心思想总结

Promptless《Writing code was hard, actually》给 AI 时代工程叙事留下的最重要遗产是**一份"反驳便利修正主义"的 4 步方法论**：

1. **承认部分对**——"AI 让代码变便宜"是真的
2. **切开部分错**——但"写代码从来平凡"是改写
3. **用证据反驳**——市场三十年、机器百亿、工程师造
4. **把"做事的人"放回中心**——造 AI 的人就是被认为做"平凡事"的人

**给所有"AI 取代 / 不取代谁"的讨论一个干净的论证模板**——三个问题把任何"X 从来平凡"叙事顶回去：

- 这台机器贵不贵？（贵 → 不平凡）
- 市场判了多少年？（多年 → 不平凡）
- 谁造了这台机器？（做这事的人 → 不平凡）

**记住它的一句话**：

> **"一项技能正在变稀缺"≠ "一项技能从来平凡"。** 前者是诚实的市场评估；后者是改写历史。Promptless 用 900 字把这个区分讲透了——并且没有否认 AI 时代的任何真实变化，只是拒绝让"变化"变成"改写"。
>
> 工程师不会被"代码从来平凡"这种修辞说服——但他们会被"市场三十年不撒谎"、"造这台机器的人就是被认为做平凡事的人"这种论证说服。**这是反驳，不是抱怨**。**这是 Promptless 这篇短文给整个 AI 时代工程叙事留下的最干净的礼物**。

---

## 附录 A：参考链接

- [Promptless《Writing code was hard, actually》](https://promptless.ai/blog/technical/writing-code-was-hard-actually)
- [Promptless 完整文档索引（llms.txt）](https://promptless.ai/llms.txt)
- [Promptless 主页（Markdown）](https://promptless.ai/index.md)
- 同站相关工程文化文章：
  - [Docs Site Search Optimization: Why Content Accuracy Comes First](https://promptless.ai/blog/technical/docs-site-search-optimization)
  - [Developer Relations Docs: Why They Go Stale and Who Should Own Them](https://promptless.ai/blog/technical/developer-relations-docs)
  - [Developer Relations Docs Have a New Primary Reader](https://promptless.ai/blog/technical/developer-relations-docs-agent-primary-reader)
- Promptless 主产品（[promptless.ai](https://promptless.ai/)）：自动随产品迭代更新客户文档的 AI 工具
