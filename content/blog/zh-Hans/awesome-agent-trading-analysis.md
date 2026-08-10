---
title: "AI Agent 交易生态全景解析：awesome-agent-trading 精选清单深度指南"
description: "深度解析 GitHub 精选清单 awesome-agent-trading：从 17 个 Agent 框架、20 个 OpenClaw 交易技能、8 个 MCP 服务器到 Agent 身份与支付协议，一文讲透 AI Agent 交易生态全景。含核心思想、项目说明、从零到一的详细教程、关键观点归纳与设计哲学。"
date: "2026-08-10"
author: "TopDigg Research Team"
tags: ["AI Agent", "Agent Trading", "自动交易", "量化交易", "DeFi", "MCP", "TradingAgents", "FinGPT", "OpenClaw", "Agent 经济"]
categories: ["AI 分析"]
keywords: ["awesome-agent-trading", "AI Agent 交易", "交易 Agent", "多智能体交易", "TradingAgents", "FinGPT", "Vibe-Trading", "OpenClaw", "MCP 服务器", "Hyperliquid", "Polymarket", "Agent 经济", "ERC-8004", "x402"]
---

# AI Agent 交易生态全景解析：awesome-agent-trading 精选清单深度指南

> **核心思想**：Agent 经济已经到来 —— AI Agent 正在自主管理钱包、执行交易、提供流动性并在链上赚取收益。这份清单不是一份普通的「awesome 列表」，而是一张 Agent 交易时代的**基础设施地图**：从推理大脑（框架）到手脚（交易技能与交易所接入）、从感官（数据源）到身份与支付（信任与结算），它完整刻画了「AI 交易 Agent」这条新兴产业链的每一个环节。

---

## 一、核心思想：Agent 经济已来

> 「The agent economy is here. AI agents are autonomously managing wallets, executing trades, providing liquidity, and earning yield on-chain.」—— 这是 awesome-agent-trading 仓库的开篇宣言。

过去几年，AI 在金融领域的角色经历了三次跃迁：

- **第一代：信号生成器（RAG）**—— AI 只是帮人读财报、看新闻、给建议，人来做所有交易决策
- **第二代：辅助决策者**—— AI 给出买卖信号，人来审批和执行
- **第三代：自主交易 Agent**—— AI 自己读数据、自己推理、自己下单、自己管理仓位，甚至自己给其他 Agent 付费

这份清单聚焦的正是第三代。它回答一个关键问题：**当 Agent 开始替我们管钱、交易、赚钱时，整个技术栈长什么样？**

答案是一个十三层的完整生态：

1. 思考的大脑 —— Agent 框架
2. 熟练的手脚 —— 交易技能（Skills）
3. 交易场所 —— DEX / CEX / 预测市场
4. 神经连接 —— MCP 服务器
5. 感官 —— 数据与市场情报
6. 身份与信任 —— 链上 Agent 身份标准
7. 结算 —— 支付协议

下面我们逐一拆解。

---

## 二、项目说明：awesome-agent-trading 是什么

### 2.1 仓库速览

- **仓库地址**：https://github.com/gyc567/awesome-agent-trading
- **许可证**：CC0-1.0（公有领域，可自由使用与转载）
- **定位**：AI Agent 交易（加密货币 + 传统金融）的工具、框架、技能、API 与资源精选清单
- **内容规模**：13 大板块，收录 17 个 Agent 框架、20 个 OpenClaw 交易技能、8 个 MCP 服务器、10 个数据源、10 个交易平台、5 个身份与信任协议、3 个支付协议，以及研究论文、教程与社区资源

它不是一个软件项目，而是一份**持续维护的生态索引**。作者把散落在 GitHub、ClawHub、AgentSkills 等平台上的 Agent 交易资源按功能分层组织，让新人能按图索骥，让从业者能快速找到需要的工具。

### 2.2 13 大板块一览

- **Agent Frameworks（Agent 框架）**—— 交易 Agent 的「大脑」：TradingAgents、FinGPT、Vibe-Trading、AI-Trader、FinRL 等
- **OpenClaw Trading Skills（OpenClaw 交易技能）**—— 即插即用的「技能包」：下单、预言市场、链上数据、策略回测
- **DEX & On-Chain Trading（DEX 与链上交易）**—— Hyperliquid、Jupiter、GMX、Uniswap 等去中心化交易场所
- **CEX & Off-Chain Trading（CEX 与链下交易）**—— Binance、Bybit、OKX、Coinbase、Deribit
- **Prediction Markets（预测市场）**—— Polymarket、Azuro、Kalshi、TurbineFi
- **MCP Servers for Trading（交易 MCP 服务器）**—— 把交易能力接入任意 Agent 的标准协议
- **Data & Market Intelligence（数据与市场情报）**—— CoinGecko、CoinGlass、Glassnode、DeFiLlama 等
- **Agent Identity & Trust（Agent 身份与信任）**—— ERC-8004、ERC-6551、SIWA 等链上身份标准
- **Payment Protocols（支付协议）**—— x402、MPP、Google AP2
- **Risk Management（风险管理）**—— 仓位、杠杆、止损、熔断等铁律
- **Research & Papers（研究论文）**—— AI-Trader、TradingAgents、Agent-Fi 等
- **Tutorials & Guides（教程与指南）**—— 从零搭建交易 Agent 的实战教程
- **Communities（社区）**—— OpenClaw Discord、r/algotrading 等

这份分层本身就是一种**架构哲学**：把「思考」与「执行」分离、把「数据」与「交易」分离、把「能力」与「身份」分离，每一层都可以独立替换、独立演进。

---

## 三、生态全景：13 大板块详解

### 3.1 Agent 框架层：交易 Agent 的大脑

框架是整份清单的核心。17 个框架覆盖了从「多智能体投行」到「个人交易助手」的全部形态：

- **TradingAgents**（TauricResearch，Python）—— 模仿真实交易公司架构的多智能体 LLM 交易框架，是目前开源界星标最高的 AI 交易项目之一
- **AI-Trader**（HKUDS，Python）—— 号称「100% 全自动」的 Agent 原生交易系统
- **Vibe-Trading**（HKUDS，Python）—— 带持久记忆、自进化技能的个人交易 Agent
- **FinGPT**（AI4Finance）—— 开源金融大模型，LoRA 微调成本低于 300 美元
- **FinRL**（AI4Finance，Python）—— 深度强化学习自动交易框架
- **OpenClaw**（Node.js）—— 开源 AI Agent 平台，技能系统 + 定时任务 + 多渠道输出，是众多交易技能的基础
- **ElizaOS**（TypeScript）—— 面向自主 AI 角色的多智能体框架，带交易能力
- **Hummingbot / Freqtrade / Jesse**（Python）—— 传统的开源交易机器人框架，经过 Agent 化改造后支持 AI 策略

### 3.2 OpenClaw 交易技能层：即插即用的手脚

这 20 个技能是「开箱即用」的交易能力，覆盖了从现货到 50 倍杠杆的完整谱系：

- **Bankr** —— 全能加密交易套件：现货、DeFi、50 倍杠杆（经 Avantis）、Polymarket、NFT，横跨 5 条链
- **Hyperclaw** —— Hyperliquid 数据技能：资金费率、未平仓量、订单簿、K 线、市场扫描
- **Binance / Public** —— 中心化交易所交易技能，含安全校验
- **Polyclaw** —— Polymarket 预测市场交易，带策略回测
- **Signals** —— 链上验证的交易信号（Base 网络，带 TX hash 证明）
- **Quant Trader** —— 基于 CCXT/Binance 的量化回测交易
- **Hyperliquid Trading / Smart Trading** —— 亚秒级 Hyperliquid 执行，内置硬性风控护栏

技能层体现了「**框架与技能分离**」的设计：框架负责推理，技能负责执行，两者通过标准接口组合，用户可以像拼乐高一样搭建自己的交易 Agent。

### 3.3 DEX 与链上交易：无许可的交易场所

- **Hyperliquid** —— 永续合约 DEX（L1 链），完整 API、钱包直连、无需 KYC，是 Agent 交易最活跃的链上场所
- **Jupiter** —— Solana 生态聚合器 + 永续合约
- **GMX / dYdX / Drift / Vertex** —— 各具特色的永续与现货协议
- **Uniswap / 1inch** —— 多链现货与聚合器
- **Avantis** —— Base 链上最高 50 倍杠杆交易

链上交易场所对 Agent 极其友好：**开放 API、无需 KYC、合约可编程** —— 这正是 Agent 经济能在加密世界率先爆发的原因。

### 3.4 CEX 与链下交易：传统交易所的 Agent 化

- **Binance** —— 流动性最好，文档最全，提供测试网
- **Bybit** —— 跟单交易 API、子账户
- **OKX** —— 全功能 API + DEX 聚合器
- **Coinbase** —— 推出 AgentKit 专门服务 Agent，面向机构
- **Deribit** —— 期权 + 期货，测试网完善

### 3.5 预测市场：Agent 的情报与战场

- **Polymarket** —— 最大的预测市场（Polygon 链，CLOB API），还有现成的 Polyclaw 技能
- **Azuro** —— 多链去中心化预测市场协议
- **Kalshi** —— 受监管的美国预测市场
- **TurbineFi** —— 为 Kalshi 和 Polymarket 构建、回测、部署自动策略

预测市场在 Agent 交易中的独特价值：**既是交易标的，又是众包的情报源** —— Agent 可以从中读取「市场共识」来辅助决策。

### 3.6 MCP 服务器：Agent 的通用神经连接

Model Context Protocol（MCP）已经成为 Agent 连接外部能力的标准协议。清单收录了 8 个交易 MCP 服务器：

- **hyperliquid-mcp** —— 完整的 Hyperliquid 交易：下单、持仓、行情、括号订单、Agent 模式
- **perp-cli** —— 多 DEX 永续合约 CLI + MCP（Hyperliquid、Pacifica、Lighter），18 个 MCP 工具
- **CoinGecko MCP**（官方 + 社区版）—— 价格与市场数据
- **Binance MCP** —— 非官方 Binance 交易服务器
- **financekit-mcp** —— 17 个金融市场情报工具

MCP 的意义在于**互操作性**：同一个 Agent 可以无缝接入 Hyperliquid、CoinGecko、Binance，而不需要为每个平台写一套专用集成。

### 3.7 数据与市场情报：Agent 的感官

- **CoinGecko** —— 价格、市值、成交量（免费层 30 次/分钟）
- **CoinGlass** —— 资金费率、未平仓量、爆仓数据
- **Hyperliquid API** —— 永续数据、订单簿、资金费率（免费）
- **DeFiLlama** —— TVL、协议收入、收益率
- **Glassnode** —— MVRV、SOPR 等链上指标
- **Dune Analytics** —— 自定义链上 SQL 查询
- **Arkham** —— 钱包追踪与实体标注
- **Alternative.me** —— 恐惧与贪婪指数
- **The Graph** —— 索引化的区块链数据
- **AgentServices** —— 54 个数据服务，支持 x402 微支付按次付费

### 3.8 Agent 身份与信任：自主交易的信任基座

Agent 要自主交易，第一步是**建立身份与声誉**：

- **ERC-8004** —— 链上 Agent 身份（NFT）+ 可验证声誉，覆盖以太坊、Base、BNB、Solana、Polygon
- **ERC-6551** —— Token 绑定账户：Agent NFT 直接拥有钱包
- **SIWA（ERC-8128）** —— Sign-In With Agent 认证
- **Helixa** —— Base 链上的 Agent 身份与 Cred Score
- **TWZRD Agent Intel** —— Solana Agent 钱包的链上行为信任评分

### 3.9 支付协议：Agent 经济的结算层

- **x402** —— HTTP 402 微支付协议（Base/Ethereum），按次付费的数据 API
- **MPP（Tempo/Stripe）** —— 法币 + 加密的 Agent 支付处理
- **AP2（Google）** —— 2026 年公布的 Agent 间支付标准

当 Agent 能自己付费购买数据、自己向其他 Agent 支付服务费时，「Agent 经济」才算真正闭环。

### 3.10 风险管理：必须遵守的铁律

清单把风险管理列为独立板块，并给出硬性建议：

- **仓位管理** —— 单笔交易不超过账户的 5-20%
- **杠杆上限** —— 每策略硬顶 3-5 倍
- **强制止损** —— 每笔交易入场前必须设置止损
- **熔断机制** —— 回撤超阈值自动暂停交易
- **冷静期** —— 亏损交易后强制休息
- **资产白名单** —— 只交易预先批准的资产
- **并发仓位限制** —— 防止过度暴露

### 3.11 研究论文：理论与实证

- **AI-Trader**（HKU，2026）—— 100% 全自动 Agent 原生交易
- **TradingAgents**（Tauric Research，2026）—— 多智能体 LLM 金融交易
- **Agent-Fi**（arXiv 2502.02564）—— Agent 与 DeFi 交叉领域的综述
- **Senpi**（2026）—— 52 个真金白银运行的 Agent 舰队，基于 Hyperfeed 数据层
- **Nunchi**（2026）—— 14 个策略、风险治理、MCP 支持

### 3.12 教程与指南：上手指南

- OpenClaw AI 交易技能 2026 完整指南（含真实数字）
- 用 Python 构建自主交易 Agent（Dev.to，2026）
- 用 CoinGecko API 构建加密 AI Agent（CoinGecko 官方教程）
- 构建 OpenClaw 加密交易 Agent（含 4 种策略 + 回测）

### 3.13 社区：生态的氧气

- **OpenClaw Discord** —— 官方社区
- **BankrBot Discord** —— 交易技能社区
- **r/algotrading** —— Reddit 算法交易社区
- **ERC-8004 Discord** —— Agent 身份标准社区

---

## 四、核心框架深度解读

### 4.1 TradingAgents：把一家投行装进多智能体系统

TradingAgents 是这份清单里最引人注目的项目 —— 它把**真实交易公司的组织架构**直接映射成多智能体系统：

- **分析师团队（Analyst Team）**：基本面分析师、情绪分析师、新闻分析师、技术分析师
- **研究员团队（Researcher Team）**：看多研究员与看空研究员，针对分析师报告进行**结构化辩论**
- **交易团队（Trading Team）**：交易员 Agent + 风险管理团队 + 投资组合经理

它基于 LangGraph 构建，支持 10+ 家 LLM 提供商（OpenAI、Anthropic、Google、DeepSeek、Qwen 等）。其公开回测数据很有参考价值：**30 天约 7% 收益 vs 标普 500 的 4.5%，但伴随 22% 的回撤** —— 这正是「Agent 交易能赚钱，但波动剧烈」的典型证据。

### 4.2 FinGPT：不到 300 美元的金融大模型

FinGPT 是 AI4Finance 基金会的开创性项目（2023 年 6 月发布），五层架构：

1. 数据源
2. 数据工程
3. LLM
4. FinRL（深度强化学习交易）
5. 应用层

它的核心创新是**用 LoRA 轻量微调**：单次微调成本不到 300 美元，而 BloombergGPT 的成本是 300 万美元 —— 差了一万倍。这让金融 AI 从巨头垄断走向人人可用，支持情感分析、预测、机器人投顾等能力。

### 4.3 Vibe-Trading：你的个人交易 Agent

Vibe-Trading 定位是「个人交易助手」，强调**长期记忆与自我进化**：

- 跨会话的持久记忆
- 自进化技能（self-evolving skills）
- 5 层上下文压缩
- MCP 服务器支持
- 12 个券商连接器
- 460+ 阿尔法因子
- 支持印度股市（NSE/BSE）

### 4.4 AI-Trader 与 FinRL：全自动与强化学习

- **AI-Trader**（HKUDS）宣称「100% 全自动、Agent 原生」—— 代表了 Agent 交易的终极形态：完全无人值守
- **FinRL** 是深度强化学习交易的代表框架，支持加密与传统金融，生产层（FinRL-X）已接入 Alpaca 实盘，回测显式建模交易成本

### 4.5 传统量化的 Agent 化：Hummingbot / Freqtrade / Jesse

这三者是经典的开源交易机器人框架，如今都长出了 AI 策略能力：Hummingbot 擅长做市，Freqtrade 以策略优化著称，Jesse 强调「AI 策略支持 + 高级回测」。它们说明 Agent 交易不是凭空出现，而是**传统量化的自然演进**。

---

## 五、详细教程：从零搭建你的第一个交易 Agent

下面的教程基于清单中的资源，带你走完「从零到小资金实盘」的全过程。**请记住：这是教育内容，不是投资建议；先用模拟盘，永远只投入你能承受全部损失的钱。**

### 5.1 第一步：明确目标与风险承受力

动手之前先回答三个问题：

- 我要交易什么？—— 加密现货 / 永续合约 / 预测市场 / 股票
- 我能承受多大回撤？—— 这决定了杠杆与仓位参数
- 我打算投入多少时间维护？—— 全自动 Agent 也需要监控

### 5.2 第二步：准备环境与密钥

- 安装 Python 3.10+（大多数框架基于 Python）
- 注册数据源 API：CoinGecko 免费账号（30 次/分钟足够起步）
- 注册交易所 API：Binance / OKX / Bybit 测试网（Testnet）—— **永远先开 API Key 的「仅提现禁用」模式**
- 把密钥写入 `.env` 文件，**绝不上传到 GitHub**

### 5.3 第三步：选择一个框架（三条路径）

**路径 A：想最快跑通 —— 用 MCP + 通用 Agent**

- 安装 OpenClaw，添加 Hyperclaw 或 Binance 技能
- 在自然语言里描述你的策略，让 Agent 执行
- 适合：想先体验「Agent 交易」是什么感觉的人

**路径 B：想做多智能体研究 —— 用 TradingAgents**

- `git clone` TradingAgents，配置 LLM API Key
- 运行它的演示脚本，观察分析师 → 研究员 → 交易团队的完整流程
- 适合：对「投行式多智能体」架构感兴趣的研究者

**路径 C：想长期自主运行 —— 用 Freqtrade / Hummingbot + AI 策略**

- 这是最「量产化」的路径：框架成熟、社区庞大、文档齐全
- 适合：真正打算长期运行策略的人

### 5.4 第四步：接入数据源

- 起步用 CoinGecko MCP 或免费 API 获取价格与市值
- 交易加密永续合约：接入 CoinGlass 看资金费率与未平仓量
- 想要更专业的链上指标：Glassnode（MVRV、SOPR）或 Dune Analytics
- **建议**：先只用一个数据源跑通，再逐步叠加

### 5.5 第五步：写你的第一个策略

从最简单的「趋势跟随」开始，例如：

- 读取 BTC 的 20 日移动平均线与当前价格
- 价格上穿均线 → 生成买入信号
- 价格下穿均线 → 生成卖出信号

用 LLM 写策略的好处是：你可以用自然语言描述策略逻辑，让框架翻译成可回测的代码，而不是手写一堆 `if-else` 规则。

### 5.6 第六步：回测先行（最重要的步骤）

- 用框架自带回测引擎（Freqtrade 的 backtesting、Polyclaw 的 Polymarket 回测）
- **必须显式建模交易成本**：手续费、滑点、资金费率
- 记录三组数字：总收益率、最大回撤、夏普比率
- 一个策略只有跑赢「买入并持有」且回撤可接受，才值得进入下一步

### 5.7 第七步：配置风险管理（照抄这份清单）

- 单笔仓位：账户的 5-20%
- 杠杆：硬顶 3-5 倍（新手建议 1 倍起步）
- 止损：每笔交易入场前强制设置
- 熔断：账户回撤达 10-20% 自动停止交易
- 资产白名单：只交易你研究过的资产

### 5.8 第八步：纸上交易 → 小资金实盘

1. **先跑模拟盘**：Binance Testnet、Polymarket Paper Trader，至少跑 2-4 周
2. **再上小资金**：投入你「亏光了也不影响生活」的资金
3. **逐步放大**：只有连续多周跑赢基准，才考虑增加资金与杠杆

### 5.9 新手避坑清单

- **不要**把 API Key 提交到代码仓库（很多人栽在这里）
- **不要**一上来就上高杠杆（清单建议硬顶 3-5 倍）
- **不要**在回测未通过时就上实盘
- **不要**无止损交易
- **不要**一次部署多个未经验证的策略
- **要**保留完整日志，便于事后复盘

---

## 六、归纳总结：关键观点与结论

综合清单内容与其中项目的实践数据，可以归纳出七个关键观点：

### 6.1 观点一：LLM 取代硬编码规则是必然趋势

传统量化写的是「RSI < 30 就买入」这样的硬规则；Agent 交易让 LLM 直接读财报、新闻、社交媒体和价格数据，用自然语言推理市场方向。**规则是死的，推理是活的** —— 这是质的飞跃，也是 Agent 交易的核心价值。

### 6.2 观点二：多智能体「投行化」成为主流架构

TradingAgents、AI-Trader、Senpi（52 个 Agent 舰队）等头部项目不约而同采用**专业化分工 + 结构化辩论**的架构：分析师负责研究、研究员负责辩论、风控负责把关、组合经理负责拍板。**一个人（或一个 Agent）的全能判断正在让位于一个团队的协作判断。**

### 6.3 观点三：回测与实盘之间存在巨大鸿沟

TradingAgents 的 30 天实测是最诚实的样本：7% 收益跑赢标普的 4.5%，但 22% 的回撤意味着任何中间时刻都可能让你心态崩溃。**交易成本、滑点、市场状态切换，会让回测里的完美策略在实盘中大打折扣。** 回测通过只是入场券，不是成功保证。

### 6.4 观点四：风险控制是入场券，不是可选项

清单把风险管理列为独立板块并给出硬性参数（仓位 5-20%、杠杆 3-5 倍、强制止损、熔断机制），这不是保守，而是**无数真金白银教训的总结**。一个没有风控的 Agent 不是交易系统，而是一台失控的印钞机 —— 方向相反的那种。

### 6.5 观点五：MCP 正在成为 Agent 交易的连接标准

8 个交易 MCP 服务器、CoinGecko 官方 MCP、各大交易所的 MCP 化 —— 生态正在以 MCP 为「通用插座」统一接线。**未来，接入一个新交易平台的成本将趋近于零**，Agent 的互操作性是整个生态的乘数效应。

### 6.6 观点六：Agent 身份与信任是新兴基础设施

ERC-8004、ERC-6551、SIWA、TWZRD 信任评分 —— 这些标准解决一个根本问题：**我们凭什么相信一个陌生 Agent 来管理资金？** 链上身份 + 可验证声誉 + 行为评分，正在为 Agent 经济搭建信任基座。没有这一层，Agent 交易只能停留在「个人工具」层面。

### 6.7 观点七：2026 是 Agent 支付协议元年

x402（HTTP 402 微支付）、Stripe 的 MPP、Google 的 AP2 —— 三大支付体系在同一年落地。当 Agent 能自主付费买数据、自主结算服务费，**「Agent 经济」才真正闭环**。这比交易本身更深远：它意味着 AI 之间开始有商业关系。

---

## 七、设计哲学：这份清单背后的世界观

### 7.1 LLM-as-Agent：从「规则」到「推理」

整份清单的第一性假设是：**交易决策的本质是推理，而不是匹配规则**。因此框架层的核心工作不是写更多策略函数，而是给 LLM 提供「读数据 → 推理 → 行动 → 复盘」的完整回路。

### 7.2 投行隐喻：专业化分工产生信任

头部项目不约而同地复制真实投行的组织结构（分析师 / 研究员 / 交易员 / 风控 / 组合经理）。背后逻辑是：**分工产生专业，辩论产生质量，制衡产生信任** —— 一个 Agent 单打独斗再强，也不如一支有制衡的 Agent 团队稳健。

### 7.3 自主与治理的平衡

「100% 全自动」（AI-Trader）与「审批优先」（信号生成、人工确认）两种模式并存。设计哲学不是「全自动或全人工」，而是**按风险等级匹配自主程度**：信号级自主 + 执行级治理，小仓位自主 + 大仓位审批。

### 7.4 回测优先、实盘谨慎

几乎所有项目都强调回测、显式建模交易成本、并声明「不鼓励用真钱」。这是对「AI 万能」叙事的冷静校正：**在 Agent 交易里，敬畏市场是唯一正确的态度。**

### 7.5 开源与标准驱动

从框架、技能到身份标准、支付协议，整份清单几乎全部是开源或开放标准。它的潜台词是：**Agent 交易的基础设施应该是公共的、可审计的、可互操作的** —— 这既是安全需求，也是生态繁荣的前提。

---

## 八、风险提示

- 加密市场波动剧烈，永续合约含高杠杆风险，可能损失全部本金
- 回测表现不代表未来实盘表现；市场状态切换（牛市/熊市/震荡）会让策略失效
- 交易 Agent 存在技术风险：API 故障、网络延迟、智能合约漏洞、恶意技能
- 部分平台与协议处于早期阶段，可能随时变更或停止服务
- 请只投入你能承受全部损失的资金；本文不构成任何投资建议

---

## 九、结语

awesome-agent-trading 是一份「正在进行时」的生态地图。它告诉我们：AI Agent 交易不再是实验室里的玩具，而是一个**分层清晰、标准初成、真金白银在流动**的新兴产业。

从 TradingAgents 的多智能体投行，到 FinGPT 的千倍成本压缩，再到 ERC-8004 与 x402 铺就的信任与结算层 —— 每一个环节都在回答同一个问题：**当 AI 开始替我们交易时，我们需要怎样的基础设施来保证它聪明、安全、可信？**

而答案，就藏在这份清单的 13 个板块里。无论你是想研究、想实践、还是想观察这场变革，这份清单都是最好的起点。

> 引用仓库的开篇宣言作结：**「The agent economy is here.」** —— Agent 经济已来，而你正在见证它的地图。
