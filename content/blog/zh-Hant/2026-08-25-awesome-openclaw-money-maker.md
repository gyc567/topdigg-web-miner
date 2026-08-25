---
title: "AI Agent搞錢指南：OpenClaw Money Maker全景解析"
date: "2026-08-25"
description: "深度解析awesome-OpenClaw-Money-Maker項目，涵蓋Franklin、ClawRouter、x402協議等核心工具，以及AI Agent賺錢的完整工具鏈與設計哲學"
tags:
  - AI Agent, OpenClaw, Franklin, ClawRouter, x402, 加密貨幣
categories:
  - AI工具解析, 加密貨幣, 技術架構
---

# ---
title: "AI Agent Money Maker Guide: OpenClaw Money Maker Complete Analysis"
date: "2026-08-25"
description: "Deep analysis of awesome-OpenClaw-Money-Maker project, covering Franklin, ClawRouter, x402 protocol and complete AI Agent money-making toolchain"
tags:
  - AI Agent
  - OpenClaw
  - Franklin
  - ClawRouter
  - x402
  - cryptocurrency
categories:
  - AI Tools
  - Cryptocurrency
  - Tech Architecture

# AI Agent搞钱指南：OpenClaw Money Maker全景解析

**作者：比特财商**

---

## 一、项目介绍与背景

在人工智能浪潮席卷全球的今天，一个根本性问题正在被重新审视：AI Agent究竟能否真正参与经济活动？传统意义上，AI Agent是执行任务的工具——你调用API，它返回结果，一切都在预设的边界内运行。但BlockRunAI推出的awesome-OpenClaw-Money-Maker项目，正在将这一认知彻底颠覆。

BlockRunAI/awesome-OpenClaw-Money-Maker是GitHub上的精选列表（awesome list），专门收录用AI Agent（尤其是OpenClaw）赚钱的工具和项目。由BlockRunAI维护，采用CC0协议完全开源，这意味着所有内容都可以自由使用、修改和商业化，无需任何授权限制。

这个项目并非凭空而生。它诞生于一个核心观察：AI Agent赚钱的本质，是一个完整的经济闭环。资金从USDC钱包流出，经过Franklin（AI经济主体）的智能决策，借助ClawRouter（智能路由）的模型选择，通过LLM执行具体任务，产生利润后再回流形成循环。这个闭环的每一个环节，都代表了AI Agent从“工具”向“经济参与者”跃迁的关键一步。

让我们将这个闭环展开来看：

```
USDC钱包 → Franklin（AI经济主体）→ ClawRouter（智能路由）
→ LLM执行任务 → 利润 → 循环reinvest
```

这不只是一个技术架构图，它代表了一种全新的范式：AI Agent第一次能够真实地持有资产、自主决策、执行交易、管理预算。在传统SaaS模式中，你为访问权付月费、为API调用次数付钱；但在这个新范式里，AI Agent以你的名义从事经济活动，而你只为实际交付的工作成果付费。

这就是awesome-OpenClaw-Money-Maker想要系统性地展示给世界的：一个由AI Agent主导的赚钱工具生态，正在从概念走向现实。

---

## 二、三大核心项目深度解析

### 2.1 Franklin：首个AI经济主体

Franklin是整个生态中最具开创性的项目。它的定位不是又一个AI助手，而是一个真正意义上持有资产、进行经济决策的主体。

**核心特点**

Franklin能够持有USDC钱包，这意味着它可以自主决定何时花钱、花多少钱。在传统AI助手的框架下，费用由用户预先支付给API提供商；而Franklin的逻辑截然不同——它持有资金，自主判断在哪些环节支出，以何种金额支出。这是一种根本性的角色反转。

它采用YOPO（You Only Pay Outcome）计费模式：提供商成本加上5%的服务费，没有订阅费，没有API Key，没有月费。用户只为实际使用的工作成果付账。这种模式对于希望用AI Agent赚钱的用户来说意义重大——你不是在为“尝试”付费，而是在为“成功”付费。

Franklin内置三大垂直能力，分别针对三个最常见的变现场景：

- **Marketing Agent（营销代理）**：自动执行营销任务，包括社交媒体运营、客户 outreach、广告投放优化等
- **Trading Agent（交易代理）**：自主进行加密货币交易决策，但所有交易计划必须经过用户审批才能执行，且有硬预算限制
- **Content Agent（内容生成代理）**：自动生成营销内容、博客文章、社交媒体文案等

这里有一个关键的安全设计：交易计划必须用户审批才能执行。Franklin不会绕过用户进行未经授权的交易。同时，它有硬预算限制——钱包余额就是真实的支出上限，Agent永远不会超支。这两点设计确保了系统的可控性和安全性。

Franklin还内置了钱包绑定的交易日志，具备跨session记忆交易逻辑的能力。这意味着它能够从历史交易中学习，持续优化决策。同时，它支持Telegram远程控制，用户可以通过Telegram随时随地与自己的AI经济主体交互。

**Token成本对比**

Franklin官方提供了一份令人印象深刻的成本对照表，展示了每1美元USDC能够购买的各平台token数量：

- $1 USDC ≈ 400,000 GPT-4o输入token
- $1 USDC ≈ 7,000,000 DeepSeek token
- $1 USDC ≈ 13,000,000 Gemini Flash token
- $1 USDC ≈ 20张DALL-E 3图片

这些数字揭示了一个重要趋势：当AI Agent能够自主管理资金、自行选择模型时，成本优化的空间是巨大的。同样的资金，通过智能路由和模型选择，可以获得数十倍于传统使用方式的算力。

### 2.2 ClawRouter：Agent原生LLM智能路由器

ClawRouter解决了一个看似简单但实际上极为关键的问题：AI Agent如何选择使用哪个LLM？

在传统架构中，模型选择是人类的决策——开发者或用户根据任务类型、预算、质量要求，手动指定使用哪个模型。但在AI Agent的语境下，这种方式遇到了根本性的障碍：Agent需要调用工具、执行多步骤任务、7x24不间断运行，它不可能在每个环节都停下来等待人类选择模型。

ClawRouter的设计正是为了解决这个问题。它的核心使命是：将模型选择这件决策工作，从人类手中彻底接管过来，交给系统自动完成。

**技术架构深度解析**

ClawRouter的智能路由建立在15维度的本地评分系统上。这15个维度包括：延迟、吞吐量、成本、上下文窗口、推理能力、函数调用支持、视觉能力、多语言能力、工具使用兼容性等。评分在本地完成，延迟控制在1毫秒以内，确保不会对Agent的响应速度造成明显影响。

基于评分结果，请求被分为四个复杂程度层级：

- **SIMPLE**：简单任务，如文本改写、基础问答
- **MEDIUM**：中等复杂度，如内容创作、数据分析
- **COMPLEX**：高复杂度，如多步骤推理、复杂代码生成
- **REASONING**：需要深度思考的推理任务

这个分层的直接价值是：ClawRouter能够为不同复杂度的任务匹配最合适的模型。简单任务不会被路由到昂贵的旗舰模型，复杂任务也不会因为贪图便宜而被分配到能力不足的模型。

ClawRouter将71个不同的LLM汇聚在单一端点。对于开发者来说，这意味着无需对接数十个不同的API，只需配置ClawRouter一个端点，系统会自动为每次请求选择最优模型。

**四种路由策略**

ClawRouter提供四种路由策略，用户可以根据需求灵活切换：

- **free（免费优先）**：100%使用免费模型，适合预算敏感的场景
- **eco（经济优先）**：在保证质量的前提下最大化成本节省，可达98%
- **auto（自动平衡）**：默认模式，在成本和质量之间取得平衡，节省88%
- **premium（质量优先）**：选择最高质量的模型，适合对输出质量有严苛要求的场景

**响应缓存与Session持久化**

ClawRouter内置了智能响应缓存机制。对于相同的请求（通过SHA-256哈希识别），系统在10分钟TTL内直接返回缓存结果，无需重复调用模型。缓存容量为200条LRU（最近最少使用），在缓存命中时几乎零成本。

Session持久化是另一个关键功能。ClawRouter支持1小时的模型固定，这意味着在一次多轮对话中，系统会尽量使用同一个模型，保证对话上下文的一致性。这是传统API调用无法提供的保障——每次请求独立路由固然灵活，但面对需要上下文连贯性的任务时，固定模型的体验远胜于每次随机分配。

**智能降级链与三击升级**

当某个模型提供商出现错误时，ClawRouter会自动切换到下一个最佳模型，这条降级链是预先配置好的，确保系统的高可用性。用户不会因为某个模型的临时故障而遭遇请求失败。

“三击升级”是一个特别巧妙的设计：当同一个请求哈希连续出现3次时，系统会自动将其从SIMPLE级别升级到REASONING级别。这个功能专门为Agentic循环设计——当一个Agent反复尝试解决某个问题但一直失败时，系统会智能地为其匹配更强的推理模型。这是传统路由系统完全无法想到的解决方案。

### 2.3 x402协议：HTTP原生的微支付协议

x402协议是整个生态的支付基础设施。它的设计理念源于一个深刻洞察：AI Agent无法持有传统支付凭证（信用卡、API Key等），但它们天然能够使用加密钱包。

HTTP 402（Payment Required）是一个1991年就存在的HTTP状态码，但从未被广泛采用。x402协议将它重新定义为现代化、可实用的微支付协议。每个API调用对应一个支付事务，无需账单、无需API Key、无需订阅——钱包即身份。

这个设计的颠覆性在于：它将身份认证和支付授权合二为一。私钥签名既是证明“我是谁”的身份凭证，也是“我授权这笔支付”的支付凭证。对AI Agent来说，这是最自然的交互方式——它们可以签署交易、转移资产、执行支付，而不需要人类的信用卡或账户体系。

---

## 三、赚钱工具全景图（按类别）

awesome-OpenClaw-Money-Maker收录的工具涵盖了AI Agent赚钱的多个垂直领域。以下是按类别整理的完整工具图谱。

### 3.1 加密货币交易机器人

加密货币交易是AI Agent最直接的应用场景之一。这个类别下既有传统的高频量化交易框架，也有专门为AI Agent设计的交易主体。

**高频/量化交易框架**

Freqtrade是当前最成熟的开源方案，拥有46,500颗GitHub星标。它不仅支持主流交易所，还支持机器学习策略优化。开发者可以用Freqtrade构建和回测各种交易策略，包括均值回归、趋势跟踪、做市等。对于希望将AI Agent与量化交易结合的用户来说，Freqtrade是最佳起点。

Hummingbot专注于做市和流动性挖掘，支持40多家交易所，拥有15,900颗星标。它的设计理念是让任何人都能成为做市商，通过提供流动性获得收益。对AI Agent而言，Hummingbot的自动化程度使其成为完美的执行层。

Jesse是一个Python优先的量化交易框架，拥有7,400颗星标。它强调回测与实盘的一致性，提供完整的策略开发环境。相较于Freqtrade，Jesse的学习曲线更陡，但灵活性和扩展性也更高。

Artemis由Paradigm出品，是一个Rust原生的MEV（最大可提取价值）框架。对于专业级用户，Artemis提供了对MEV机会的底层访问能力。

**AI交易主体**

Dexter是当前最活跃的AI金融研究Agent，拥有16,100颗星标。它能够进行深度金融研究、自主分析市场数据、生成交易信号。

GOAT SDK是一个DeFi协议连接SDK，简化了AI Agent与各种DeFi协议的交互。它让Agent能够执行swap、流动性提供、借贷等链上操作。

nof1.ai和OpenNof1是自主AI交易Agent的代表，它们能够根据市场条件自主调整交易策略。

EVClaw是OpenClaw原生的AI交易Agent，基于EVPlus.AI的数据构建，为OpenClaw用户提供开箱即用的交易能力。

**Solana生态工具**

Solana链的低费用和高速度使其成为交易机器人的热门平台。Solana Trading Bot提供Token狙击、Swap和自动交易功能；open-sol-bot则专注于复制交易和自动化策略执行。

### 3.2 预测市场工具

预测市场是AI Agent最具潜力的垂直领域之一。Polymarket是目前最活跃的预测市场平台，用户可以对未来事件的结果进行投注。

**Polymarket官方与生态工具**

Polymarket Agents是官方推出的AI Agent，支持自主交易。用户可以让Agent自主分析市场、制定策略、执行交易。

poly-maker是一个做市机器人，通过Google Sheets配置即可运行，大幅降低了做市的技术门槛。

Polymarket Copy Trading Bot复制成功交易者的策略，适合不想深入研究的用户。

Cross-Market State Fusion是一个强化学习Agent，它将Binance合约数据融合到预测市场中，寻找跨市场套利机会。

Kalshi-Polymarket AI Bot则专注于跨平台套利，在Kalshi和Polymarket之间寻找价格差异。

预测市场的核心机会在于信息不对称。AI Agent可以7x24不间断地监控新闻、社交媒体、链上数据，第一时间发现影响价格的事件并做出反应。这是人类无法做到的——但AI Agent可以。

### 3.3 内容创作变现

内容创作是另一个成熟的AI变现领域。Franklin内置的Content Agent提供了开箱即用的内容生成能力，支持社交媒体帖子、博客文章、营销文案等。

通过MCP（Model Context Protocol）工具集成，Agent的内容能力可以得到进一步扩展——它可以连接各种内容平台、SEO工具、数据分析服务，构建完整的内容生产线。

### 3.4 DeFi与Yield Farming

DeFi领域充满了收益率差异和信息不对称，这正好是AI Agent擅长的事情。

DeFi-Yield-AutoFarming自动执行复投和池子优化，用户只需配置策略，Agent会自动在各个池子之间调配资金，寻找最优收益。

yield-farmers-almanac是一个社区驱动的收益策略数据库，用户可以分享和学习他人的收益策略。

GOAT SDK则让Agent能够直接连接DeFi协议，执行流动性提供、借贷、收益聚合等操作。

### 3.5 Airdrop Farming

Airdrop（空投）是加密货币生态中的独特现象——项目方为了激励早期用户，会免费发放代币。AI Agent可以批量操作多个钱包、完成任务、领取空投，将这一过程系统化和规模化。

需要注意的是，Airdrop Farming可能涉及链上行为规范问题，用户在操作前应了解相关项目的规则和当地法规。

### 3.6 获客与销售

在传统商业领域，AI Agent同样有用武之地。AI驱动的销售线索生成、自动化 outreach、CRM集成，可以显著提升获客效率。对于B2B企业，这意味着用AI Agent替代部分销售开发代表（SDR）的工作。

---

## 四、设计哲学归纳

awesome-OpenClaw-Money-Maker不只是工具的简单罗列，它背后有一以贯之的设计哲学。这些哲学正在重新定义AI Agent的能力边界。

### 4.1 Agent as Economic Actor（经济主体）

Franklin重新定义了AI Agent的边界：它不只是执行任务的工具，而是持有资产、进行经济决策的主体。这个理念的核心在于：AI Agent第一次能真实地花钱、赚钱、管理预算。

传统的AI助手是“成本中心”——它消耗资源，但不产生收入。Franklin将AI Agent转变为“利润中心”——它持有资金，自主决策，主动创造收益。这是从工具到经济参与者的根本跃迁。

### 4.2 Wallet is Identity（钱包即身份）

x402协议最深刻的洞察是：用加密钱包取代API Key和账户体系。对Agent来说，钱包是最自然的身份凭证。私钥签名同时完成身份认证和支付授权，二合一。

这个设计解决了AI Agent无法持有传统支付凭证的根本性障碍。在传统架构中，Agent无法申请信用卡、无法注册账户、无法持有API Key；但它们天然能够使用加密钱包。x402协议正是利用这一点，将“Agent无法解决的问题”转化为“Agent天然擅长的方式”。

### 4.3 Pay for Outcome, Not Access（为结果付费）

YOPO模式的颠覆性在于：不是买订阅（为访问权付月费），不是买每次调用（为尝试付钱），而是买实际交付的工作成果。

这个模式对Agent经济尤其关键。Agent会自主决定调用哪些工具、在哪些环节花钱——最终只为你实际使用的结果付账。用户不再为“能力”付固定费用，而是为“实际产出的价值”付动态费用。这是从工业时代“按工时计费”到信息时代“按价值付费”的又一次跃迁。

### 4.4 Smart Router Eliminates Decision Fatigue（智能路由消除决策疲劳）

ClawRouter的15维度评分让Agent无需手动选模型。系统自动在正确的时间为正确的任务选正确的模型，并把成本纳入决策闭环。

这是Agent原生基础设施的标志性设计。在传统架构中，模型选择是人类的工作——你需要了解每个模型的能力边界、成本结构、适用场景，然后手动为每次任务选择合适的模型。ClawRouter将这一决策完全自动化，让Agent可以专注于任务本身，而不是技术细节。

### 4.5 Hard Budget as Safety（硬预算即安全）

钱包余额等于真实上限。Agent永远不会超支，不会收到意外账单，不会因为凌晨3点的API超额收费被惊醒。

这是加密原生安全的核心理念，也是传统SaaS无法提供的保障。在传统订阅模式下，超额使用会产生额外费用，用户往往在收到账单时才发现超支；而在x402协议下，每一笔支出都有明确的授权，余额耗尽即停止服务，没有意外，没有透支，没有隐藏费用。

---

## 五、实战教程：从零开始部署

### 教程一：安装ClawRouter

ClawRouter提供三种安装方式，适应不同的使用场景。

**方式A（推荐，一条命令安装）**

```bash
curl -fsSL https://blockrun.ai/ClawRouter-update | bash
openclaw gateway restart
```

这是最简单的方式，一条命令完成安装和配置。适合大多数OpenClaw用户。

**方式B（npm安装）**

```bash
npm install -g @blockrun/clawrouter@0.12.200
clawrouter setup
openclaw gateway restart
```

这种方式适合希望手动控制安装过程的用户。

**方式C（独立代理模式）**

```bash
npx @blockrun/clawrouter
```

然后配置客户端指向 http://localhost:8402。这种方式适合需要独立运行ClawRouter、不想让OpenClaw管理路由器的用户。

### 教程二：安装Franklin Agent

Franklin的安装需要Node.js 20.19或更高版本。

**安装命令**

```bash
npm install -g @blockrun/franklin
```

**启动（免费模式，无需钱包）**

```bash
franklin
```

免费模式下，Franklin使用免费模型，无需配置钱包即可体验基础功能。

**配置Base链钱包（解锁所有付费模型）**

```bash
franklin setup base
franklin balance  # 查看钱包地址
```

配置钱包后，Franklin可以使用所有付费模型，YOPO计费模式正式生效。

### 教程三：配置ClawRouter路由策略

ClawRouter提供了直观的路由策略切换命令：

```bash
/model free      # 100%免费模型（NVIDIA Nemotron等）
/model auto      # 平衡模式，默认节省88%
/model eco       # 最大节省（98%）
/model premium   # 最高质量
/model free      # 指定免费模型
```

**调试命令**

```bash
/debug           # 查看路由诊断（零API成本）
clawrouter doctor    # AI驱动的故障排查
clawrouter report    # 使用报告（日/周/月）
```

这些命令帮助用户理解路由决策、排查问题和跟踪使用情况。

### 教程四：OpenClaw插件安装ClawRouter

如果你是OpenClaw插件生态的用户，可以这样安装：

```bash
openclaw plugins install @blockrun/clawrouter
openclaw gateway restart
```

重启后，ClawRouter作为OpenClaw插件运行，所有配置自动生效。

### 教程五：VS Code中使用Franklin

Franklin提供了VS Code扩展，在VS Code Extensions中搜索"Franklin"安装即可。免费模型立即可用，充值USDC后解锁所有付费功能。

对于经常在VS Code中工作的开发者，这是一个无缝的集成——你可以在熟悉的编辑器中直接调用AI经济主体，无需切换应用。

---

## 六、观点与总结

### 核心观点

**1. AI Agent赚钱的本质是"数字员工"**

AI Agent不只是工具，而是能自主决策、主动执行、持续优化的数字劳动力。Franklin展示了这一愿景的最完整实现。它持有钱包、自主决策、接受监督——这些特征与传统“工具”相去甚远，反而更接近一个尽职的员工。

**2. x402协议是Agent经济的支付层基础设施**

就像HTTP/TCP是互联网的传输层，x402将成为AI Agent经济的支付层。它解决了Agent无法持有传统支付凭证的核心矛盾，为Agent经济的规模化奠定了基础。

**3. 智能路由是成本优化的关键**

88%的成本节省不是来自于使用更便宜的模型，而是来自于“在正确的环节用正确的模型”。ClawRouter证明了：模型选择本身可以成为一个价值创造的环节，而不是人类开发者的负担。

**4. 预测市场是AI Agent最具潜力的垂直领域**

Polymarket上有大量信息不对称机会，AI Agent可以7x24不间断地监控、分析、执行——这是人类无法做到的。随着预测市场的持续发展，这个领域的AI Agent应用前景广阔。

**5. 自主经济主体将重新定义"自动化"**

从"自动化工作流"到"自动化经济决策"，这是本质跃迁。传统自动化是让人去适应机器的逻辑；经济主体范式是让AI Agent以人的名义从事经济活动。这将重新定义我们对"AI能做什么"的认知。

### 风险提示

所有工具均为潜在收益，非保证收益。使用前需充分了解：

- API/Token成本可能随使用量增加而上升
- 交易类工具存在真实亏损风险，加密货币市场波动剧烈
- Airdrop Farming可能涉及链上行为规范问题
- 内容创作需遵守各平台的使用条款
- 预测市场投注存在损失本金的可能

建议从小额测试开始，逐步积累经验后再扩大规模。

---

## 七、相关资源

以下是本文涉及的核心项目链接，供进一步研究和实践：

**Franklin**

https://github.com/BlockRunAI/franklin

首个AI经济主体项目，持有USDC钱包，支持Marketing、Trading、Content三大垂直能力。

**ClawRouter**

https://github.com/BlockRunAI/ClawRouter

Agent原生LLM智能路由器，71个模型汇聚，15维度评分，4种路由策略。

**BlockRun.ai平台**

https://blockrun.ai

维护awesome-OpenClaw-Money-Maker项目的组织，提供完整的AI Agent赚钱工具生态。

**x402协议**

https://x402.org

HTTP原生的微支付协议，为AI Agent经济提供支付层基础设施。

---

**结语**

awesome-OpenClaw-Money-Maker项目揭示了一个正在成形的新范式：AI Agent不再只是执行人类指令的工具，而是能够持有资产、自主决策、创造收益的经济参与者。这个转变的意义，远超出技术本身——它将重新定义我们对“工作”、“收入”、“自动化”的理解。

Franklin、ClawRouter、x402协议，这三个项目构成了AI Agent赚钱生态的基础设施层：经济主体负责决策，智能路由负责优化，协议负责支付。它们共同编织了一个让AI Agent能够真实参与经济活动的底层架构。

对于开发者、投资者、创业者而言，这个领域充满了机会。工具在成熟，基础设施在完善，模式在验证。如果你对AI Agent经济的未来感兴趣，现在正是深入研究的最佳时机。

---

*作者：比特财商*

*本文首发于微信公众号，如需转载，请联系作者授权。*
