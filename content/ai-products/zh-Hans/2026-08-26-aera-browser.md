---
title: "Aera Browser 深度分析：浏览器里的自动员工，$20/月如何卖掉你的重复劳动"
description: "Aera Browser 是 2025 年 12 月上线的 Chromium 本地优先自动浏览器，用一句话 + 定时任务 + MCP 把浏览器变成自动员工。Stripe 验证 MRR $343 / 9 订阅 / ~1700 用户，本报告逐层拆解其变现路径、定价阶梯、设计哲学与每用户月度价值，给出可复制的变现与增长打法。"
date: "2026-08-26"
author: "ERIC"
tags: ["AI产品", "浏览器自动化", "MCP", "变现", "SaaS", "Aera Browser", "Chromium", "本地优先"]
categories: ["AI产品分析"]
keywords: ["Aera Browser", "getaera.app", "浏览器自动化", "MCP", "Chromium", "TrustMRR", "订阅变现", "本地优先"]
product:
  name: "Aera Browser"
  url: "https://trustmrr.com/startup/aera-browser?ref=eric-kwok-b654e8"
  category: "AI浏览器自动化工具"
  launch_date: "2025-12"
  revenue: "$343 MRR（2026-08，Stripe API 验证）· $3,635 累计营收"
  users: "~1,700 用户 · 9 付费订阅"
  pricing_model: "Free 自托管模型 + Pro $20/月 + Ultra $200/月"
  logo: "https://files.stripe.com/links/MDB8YWNjdF8xU2ZScTlMaGhtZ1p0d1NofGZsX2xpdmVfSFRRMUwxYVFBOEtkRjBZT0c0czRCd3FN00eG4pLTYa"
pricing:
  - plan: "Free"
    price: 0
    currency: "USD"
    period: null
  - plan: "Pro"
    price: 20
    currency: "USD"
    period: "month"
  - plan: "Ultra"
    price: 200
    currency: "USD"
    period: "month"
metrics:
  - name: "MRR"
    value: "$343（2026-08）"
  - name: "近 30 天营收"
    value: "$140"
  - name: "累计营收"
    value: "$3,635"
  - name: "活跃订阅数"
    value: "9"
  - name: "总用户数"
    value: "~1,700"
  - name: "付费转化率"
    value: "~0.5%（9/1700 估算）"
  - name: "混合 ARPU"
    value: "~$38/月（MRR/付费订阅）"
  - name: "Domain Rating"
    value: "9/100"
  - name: "TrustMRR 排名"
    value: "#2108"
  - name: "成立时间"
    value: "2025-12"
  - name: "创始人"
    value: "Andrew Rivers（美国）"
  - name: "技术栈"
    value: "Chromium + Node.js + PostgreSQL + Stripe + OpenRouter"
sources:
  - label: "TrustMRR 公开档案（含 ref 链接）"
    url: "https://trustmrr.com/startup/aera-browser?ref=eric-kwok-b654e8"
  - label: "TrustMRR AI-readable Markdown 快照"
    url: "https://trustmrr.com/startup/aera-browser.md"
  - label: "Aera 官方站点"
    url: "https://getaera.app"
  - label: "Aera 定价页"
    url: "https://getaera.app/pricing"
  - label: "Aera 功能页"
    url: "https://getaera.app/features"
  - label: "Aera 用例页"
    url: "https://getaera.app/use-cases"
  - label: "Aera 安全与隐私页"
    url: "https://getaera.app/security"
  - label: "Aera FAQ"
    url: "https://getaera.app/faq"
  - label: "Aera llms.txt"
    url: "https://getaera.app/llms.txt"
---

> **产品链接**：[https://trustmrr.com/startup/aera-browser?ref=eric-kwok-b654e8](https://trustmrr.com/startup/aera-browser?ref=eric-kwok-b654e8) （含推荐追踪，本文头尾均附）

# Aera Browser 深度分析：浏览器里的自动员工，$20/月如何卖掉你的重复劳动

## 一、引言：浏览器是最后的护城河

AI 自动化赛道这两年挤满了人：ChatGPT Scheduled Tasks、Claude Computer Use、BrowserBase 云端无头、Puppeteer 脚本农场。但 2025 年 12 月才上线的 **Aera Browser** 选了一条最"笨"也最对的路——**不做云端无头，不做插件，直接给你一个能定时干活的 Chromium 浏览器**。

一句话版本：
> **Aera is a browser that executes.（Aera 是会执行的浏览器）** 你用自然语言描述一个重复任务，Aera 在你已登录的真实浏览器里定时执行：读页、提数、填表、汇总、通知。每天早上醒来，活已经干完了。

截至 2026-08-26 TrustMRR 快照：**MRR $343、9 个付费订阅、~1,700 总用户、累计 $3,635、Domain Rating 9**。数字很小，但**样本极纯**：1 个美国独立开发者、Stripe 直连验证、Chromium 开源底座、MCP 集成、本地优先。这是一个教科书级的**早期微型 SaaS 变现切片**——正因为小，才能看清它的赚钱逻辑是怎么从 0 长出来的。

本报告回答 4 个问题：
1. Aera 到底是什么？为什么不是"又一个 AI 浏览器插件"？
2. 它的设计哲学为什么能让开发者买单？
3. 它怎么赚钱？Free / Pro / Ultra 三档定价如何分层收割？
4. 每个用户每月贡献多少美金？你该抄什么、避什么坑？

---

## 二、项目说明：Aera 是什么、不是什么

### 2.1 一句话定位

**Aera = Chromium 真实浏览器 + 自然语言调度器 + MCP 连接器 + 本地优先存储**。官网首页原话是 *The browser that does the work.*（会干活的浏览器）。TrustMRR 标签：AI / Productivity / Utilities，目标用户：Developers, AI enthusiasts, workflow power-users。

### 2.2 核心能力（来自官网 Features 页翻译）

| 能力 | 说明 | 为什么重要 |
|---|---|---|
| **自然语言自动化** | 描述任务，Agent 点、输、跳真实页面 | 无需写脚本/选择器，抗网站改版 |
| **定时与常驻任务** | 任意请求一键转为定时工作流，带执行历史与通知 | 浏览器版 Cron，睡觉时也能跑 |
| **MCP 集成** | 直连 Cursor、Claude Desktop、Gemini CLI 等 MCP 工具 | 成为开发者工具链的"浏览器执行层" |
| **子代理并行** | 多 Agent 协同并行处理多步任务 | 长流程不卡单线程 |
| **Vision 视觉理解** | 付费层对复杂视觉页面的理解 | 处理排版诡异的管理后台 |
| **Chrome 扩展与数据导入** | 一键导入密码管理器、广告拦截、书签、密码 | 0 迁移成本，直接替换 Chrome |
| **本地优先存储** | 历史、书签、自动化配置全在本地 | 隐私卖点，订阅而非监控 |

### 2.3 可靠区与不可靠区（官方罕见的诚实）

Aera 在首页就写明了 **What it is dependable at, and what it is not**：

- **可靠**：读页、盯变化、从仪表盘提数、扫收件箱、填普通表单、按日程重复。
- **不可靠**：富文本编辑器与代码编辑器——官方自测中 Agent 会**破坏内容**，所以**不适合写文档/改代码**。
- **单任务闭环 > 跨站长链**：一个聚焦的小流程远比跨 10 个陌生站点的长链成功率高。
- **不做自动结账**：Aera **不帮你买东西**，故意不做支付，避免法律与风控坑。

> **一句话判断**：如果你每天在 5 个后台之间复制粘贴数字、扫提及、填单子，Aera 可靠；如果你想让它帮你写 Notion 文档或提交代码，别用。

### 2.4 与同类产品的分水岭

| 对手 | 形态 | 致命短板 | Aera 的打法 |
|---|---|---|---|
| **ChatGPT Scheduled Tasks** | 云端浏览器，只跑公开页 | **过不了登录墙** | 跑在**你的已登录 Profile**，能进内网后台 |
| **Puppeteer / Playwright** | 代码脚本，需维护选择器 | 网站一改版就挂 | 每次重读页面语义，**无 selector 依赖** |
| **BrowserBase 等云无头** | 云端无头农场 | 与你日常浏览器割裂 | **就是你的日常浏览器**，无上下文切换 |
| **Chrome 插件式 AI** | 覆盖层/侧边栏 | 受限于插件权限 | **完整 Chromium**，可看网络流量与日志 |

---

## 三、设计哲学：5 条让开发者愿意付费的原则

### 哲学 1 — 本地优先，但诚实告知"推理出境"

> "Your data stays local. Inference does not.（你的数据在本地，推理不在——除非你自托管）"

这是 Aera 安全页的标题，也是最强的信任资产：
- 历史/书签/聊天/任务/运行日志全在本地 SQLite，**官方无服务器接收**，卸载即删。
- 但**模型推理必出境**：付费层走 OpenRouter → Anthropic/OpenAI/Google/xAI；Free 层走你本地的 Ollama/LM Studio/vLLM，才真正不出境。
- 官网把"什么在本地、什么出境、谁收到、什么还没本地"逐条列出，甚至写"我们无 SOC2、无 ISO27001"——**把丑话说在前面，比完美承诺更可信**。

### 哲学 2 — 你的浏览器，不是机器人农场

> "Your own browser profile, not a bot harness.（你的浏览器身份，不是机器人马甲）"

Aera 驱动的是**你机器上的 Chromium Profile**，就是你平时已登录的那个，不搞无头指纹、不把密码交到云端 runner。这带来两个变现后果：**降低封号风险**（像真人一样操作），**降低用户迁移成本**（导入 Chrome 扩展即用）。

### 哲学 3 — 一句人话，大于一套选择器

Puppeteer 需要你写 `page.waitForSelector('.btn')`，Aera 让你说"每天早上把仪表盘的 3 个数填进表格"。**每次运行重读页面语义，而非重放 selector**，所以站点改版、div 更名不会直接致死。代价是**非确定性**——官网直言"我们不会告诉你它从不失败"。

### 哲学 4 — 定时是第一公民

Aera 的核心交互不是"聊天"，是 **"Describe → Schedule → History → Notify"**。任何一次对话都可一键转为定时任务，带**分步执行日志**可审计。失败即停、发通知、留日志，让用户**读日志而非读堆栈**。

### 哲学 5 — 开放标准，不锁模型

Chromium 底座 + MCP 标准 + OpenAI 兼容端点。**Free 层强制自托管模型**，倒逼你体验"无托管有多难用"，Pro/Ultra 才给你托管的前沿模型。卖的是**模型托管与用量**，不是浏览器本身——这正是 Cursor 卖 IDE 同款逻辑。

---

## 四、详细教程：从 0 到第一个自动员工（7 步）

> 注：基于官网 Docs/FAQ/Use Cases 的公开信息编译，非内部手册。UI 文案可能随版本迭代微调。

### Step 0 — 准备工作

- 系统：Windows / macOS / Linux 均可，4GB 内存起步（重度自动化建议 8GB）
- 模型：Free 用户先装 **Ollama**（`ollama run llama3.1`）或 LM Studio；Pro/Ultra 用户无需本地模型
- 账号：所有套餐均需注册 Aera 账号（下载无需账号，但 Agent 不登录不运行）

### Step 1 — 下载与导入

1. 访问 [getaera.app/download](https://getaera.app/download) 下载对应平台安装包
2. 首次启动选择 **Import from Chrome**：一键导入书签、密码、扩展（1Password、uBlock 等）
3. 登录 Aera 账号，完成设备指纹绑定（用于防刷与引荐追踪）

### Step 2 — 配置模型（关键分水岭）

- **Free**：Settings → Models → 填入 `http://localhost:11434`（Ollama 默认）→ 测试连接
- **Pro/Ultra**：Settings → Models → 选择 Aera 托管模型（GPT-4o / Claude 3.5 / Gemini 等）→ 无需本地
- **小技巧**：文本任务用本地 7B 足够；视觉复杂页切到云端 Vision 模型

### Step 3 — 跑通第一个任务（建议 60 秒内）

打开侧边栏，对 Agent 说一句你**每天都做**且**可快速验证**的话：

- 例 1："每天早上 9 点把 Stripe 仪表盘的昨日营收、MRR、新增订阅填进 Google Sheet 第一行"
- 例 2："每小时扫一次 X 与 LinkedIn 的 @提及，草拟回复但不发送，给我一个摘要"
- 例 3："每周一把 GA4 + 广告后台的 4 个数汇总成周报邮件发给团队"

点击 Run 观察执行，点击 **"Make it recurring / Schedule"** 转为定时任务。

### Step 4 — 设为定时任务

- 选择频率：hourly / daily / weekly / custom cron
- 配置通知：成功/失败是否推送、失败重试次数
- 查看 Run History：每步截图 + 文本 + 耗时，失败步标红

### Step 5 — 连接你的工具（MCP）

1. 在 Aera 中开启 MCP Server
2. 到 Cursor / Claude Desktop / Gemini CLI 的 MCP 配置中添加 Aera
3. 效果：你在 IDE 里说"让 Aera 去把测试环境的订单同步到 CRM"，Aera 即执行并回传结果

> MCP 是 Aera 的增长杠杆：它把 Aera 从"浏览器"升级为"工具链的执行层"。

### Step 6 — 安装/发布技能（Skills Marketplace）

- 市场：浏览社区技能（如"每日竞品监控""周报生成"），一键安装
- 自制：把你的定时任务存为 Skill，本地留存或发布到市场（发布即公开计数）
- 计费：安装技能仅增计数，不上传你的浏览数据

### Step 7 — 运维与排错

- **失败自停**：Agent 遇错即停，不会狂点破坏数据
- **读日志而非猜**：侧边栏 Run Log 是第一排查工具
- **敏感页**：处理客户数据时切本地模型，否则页内容会经 OpenRouter 到第三方模型商
- **更新**：Aera 数天一更，Bugfix 当日发，邮件 `support@getaera.app` 直达创始人

---

## 五、变现模式拆解：Aera 如何赚钱

### 5.1 三档定价的现金流设计

| 套餐 | 价格 | 年付 | 卖什么 | 变现意图 |
|---|---|---|---|---|
| **Free** | $0 | — | 自托管模型 + 全功能（无托管 Vision/子代理） | **获客漏斗 + 过滤器**：让你体验"本地模型有多难用" |
| **Pro** | $20/月 | $220/年（$18.33/月，省 8.3%） | 托管前沿模型 + Vision + 子代理 + MCP 全能力 + "不训练承诺" | **主力现金牛**：锚定开发者 $20 心理价位 |
| **Ultra** | $200/月 | $2200/年（$183/月，省 8.3%） | Pro 全量 + **11x 用量** + 长研究/多例并发 | **鲸鱼层**：10 倍定价筛重度用户，单价 10 个 Pro |

**年付折扣**是**现金流工具**：让用户预付 12 个月，锁定留存 + 降低月流失波动。对早期 SaaS，这比涨价更重要。

### 5.2 5 个可复制的变现玩法

#### 玩法 1 — Free 自托管 = 倒逼升级的过滤器

Free 不给托管模型，**故意让体验打折**：文本模型读页是文本而非截图，版式一乱就挂；速度与质量取决于你本机。这种"刚好不够好"的 Free，比"阉割功能"的 Free 更能**让用户自我说服升级**。

#### 玩法 2 — $20 锚定 + $200 鲸鱼分层

Pro $20 对标 Cursor Pro $20，开发者心智中"便宜工具"阈值；Ultra $200 直接 10 倍，**不是让大多数人买，而是让 10% 重度用户自我筛选**，避免 Pro 被长任务滥用拖垮毛利。

#### 玩法 3 — 卖用量，不卖席位

Ultra 卖 **11x 用量**而非"团队版席位"，这是**用量货币化**：跑得越多越贵，边际成本与模型调用直接挂钩，避免"买一个 Pro 跑全公司"的薅羊毛。

#### 玩法 4 — 订阅卖模型，浏览器白送

浏览器本身免费，**收费点在模型托管与推理**。这是 AI 时代的标准答案：Cursor 卖 IDE 里的模型，Aera 卖浏览器里的模型，用户为**智能**付费，不是为**容器**付费。

#### 玩法 5 — MCP 生态 + Skills 市场 = 未来抽成

官网已埋 **Skills Marketplace**（安装计数、发布上传），未来可**对热门 Skill 抽成或卖企业私有市场**。MCP 则让 Aera 嵌入开发者工作流，**成为标准而非产品**。

### 5.3 成本与毛利推算

- **主要成本**：OpenRouter 模型调用（按 token）+ 账单对账（仅收金额，不收内容）
- **Free 成本为 0**：推理在用户本机，Aera 只支出账号与更新服务
- **毛利**：未披露，但参考同类（Cursor ~70%），Aera 因本地优先 + 自托管分流，**毛利应高于纯云端 Agent**

---

## 六、核心用户分析：每个用户每月贡献多少美金？

### 6.1 用户分层全景（基于 TrustMRR 2026-08-26 快照）

| 层级 | 画像 | 人数 | 月贡献/人 | 月贡献合计 | 占比 | 典型任务 |
|---|---|---|---|---|---|---|
| **Free 自托管** | 好奇者/学生/试用者 | ~1,691 | **$0** | $0 | 99.5% 总用户 | 跑通第一个 demo 后流失或观望 |
| **Pro $20** | 个人开发者 / 增长工程师 / 独立创始人 | 8（推算） | **$20**（年付 $18.33） | ~$160 | ~47% MRR | 每日报表、社媒草拟、研究聚合 |
| **Ultra $200** | 重度自动化用户 / 小团队自动化中枢 | 1（推算） | **$200**（年付 $183） | ~$183 | **~53% MRR** | 常驻后台报表 + 多例并行 + 长研究 |

> **推算逻辑**：MRR $343 / 9 订阅 = 混合 ARPU $38。若 8 Pro + 1 Ultra = $160 + $200 = $360，接近 $343（考虑年付折扣与汇率），故此分布最合理。若全为 Pro 则 MRR 仅 $180，显著低于实际，故**至少 1 个 Ultra 鲸鱼**。

### 6.2 单用户月度价值金字塔（按对 Aera 的现金贡献）

| 排名 | 用户类型 | 单用户月营收 | 单用户年营收 | 对 MRR 贡献 | 时间价值 ROI |
|---|---|---|---|---|---|
| 🥇 | Ultra $200 | **$200** | $2,200（年付） | **58%** | 省 2h/天 × $50/h = $3,000/月，ROI 15x |
| 🥈 | Pro $20 | $20 | $220（年付） | 6% /人 | 省 1h/天 × $50/h = $1,500/月，ROI 75x |
| — | Free | $0 | $0 | 0% | 获客池，未来转化 |

**洞察**：**1 个 Ultra 的现金贡献 = 10 个 Pro**，但时间 ROI 反而更低——说明 Ultra 买的是**并发与时长**，不是"更划算"。这正是**鲸鱼定价的精髓：让重度用户为稀缺的并发买单**。

### 6.3 LTV 与付费转化

假设留存 24 个月（SaaS 典型）：

- **Pro 用户 LTV** = $20 × 24 = **$480**（年付 $440）
- **Ultra 用户 LTV** = $200 × 24 = **$4,800**（年付 $4,400）
- **Free 用户 LTV** = $0，但 **获客成本也近 0**（产品自传播），真实价值在**转化期权**

**付费转化率 0.5%** 是当前最大瓶颈：1,700 用户仅 9 付费，说明**要么免费层太够用，要么价值传达不清**。这是早期 SaaS 的常态，也是**增长空间**——提升到 2% 即 MRR $1,360（4 倍）。

### 6.4 四类核心画像的付费意愿

| 画像 | 痛点 | 愿意为 Aera 付多少 | 为什么 |
|---|---|---|---|
| **独立创始人** | 一人干 5 人的活，社媒/报表/客服占满时间 | $20/月 爽快付 | 省 30h/月，时间最贵 |
| **增长工程师** | 跨 12 个后台拉数做周报 | $20-200 | 报表自动化直接可量化 |
| **自由开发者** | 多客户上下文切换，计费按小时 | $20/月 | 多项目并行，省上下文成本 |
| **AI 自动化极客** | 已用 Puppeteer/Playwright，想摆脱脚本维护 | $200/月 | 为"不再维护选择器"付费 |

---

## 七、观点与结论：7 个核心洞察

### 洞察 1 — 浏览器是最后的护城河

当云端无头被风控、插件被权限收紧，**能跑在真实登录态的 Chromium** 是唯一稳定过墙的形态。Aera 不发明浏览器，只给 Chromium 加调度器——**复用护城河，而非自建**。

### 洞察 2 — 订阅卖模型，不是卖浏览器

这是 Cursor 卖 IDE 同款逻辑：**容器免费，智能收费**。Free 自托管让浏览器 0 成本分发，Pro/Ultra 卖托管与用量，边际成本清晰。

### 洞察 3 — 诚实是最好的 GTM

安全页直言"prompt injection 是真的""无 SOC2""推理必出境"，**把风险写在定价页前面**。对开发者客群，这种**工程师诚实**比华丽承诺更能促成付费。

### 洞察 4 — 0.5% 转化率是机会也是警报

1700 用户 9 付费，**漏斗太宽**。解法不是降价，而是**收窄免费视觉能力 + 强化首个定时任务的成功体验**（首任务成功率决定付费）。

### 洞察 5 — MCP 是增长杠杆，不是功能

MCP 让 Aera 从"浏览器"升级为"工具链执行层"，Cursor 用户在 IDE 里一句指令即可触发浏览器自动化——**嵌入工作流比买流量更便宜**。

### 洞察 6 — Ultra $200 是过滤器，不是升级包

$200 定 11x 用量，**让穷用户不敢买，让富用户觉得划算**。这是用价格筛人，把 SaaS 当咨询生意做——付不起 $200 的不是目标客户。

### 洞察 7 — $15M 要价是情绪价，非估值

创始人留言"低于 $15M 不卖"，对应 ARR $4,116 是 **3644x 估值**，远超 SaaS 常规 3-5x。这不是估值，而是**非卖品信号 + TrustMRR 曝光手段**，别当真，别用它算倍数。

---

## 八、可复制的 6 条实战建议（给想抄作业的你）

1. **浏览器免费，模型收费**：任何"容器 + 智能"产品都可复制（IDE/浏览器/表格皆可）
2. **Free 必绑自托管**：让免费用户承担推理成本，自然筛选付费
3. **$20 锚点 + $200 鲸鱼**：中间不设 $50，避免不上不下的尴尬定价
4. **首任务 60 秒成功**：第一个定时任务必须在 1 分钟内跑通并可验证，否则流失
5. **日志即产品**：失败可审计比分步成功更重要，Run Log 是第二产品
6. **MCP 优先于广告**：先接 Cursor/Claude Desktop，再考虑投放——开发者渠道 CAC 近 0

---

## 九、风险与局限

- **转化率风险**：0.5% 付费转化若 6 个月内不提升至 2%，MRR 爬坡会停滞
- **模型成本波动**：OpenRouter 上游涨价直接吞毛利，需用量计费对冲
- **非确定性**：自然语言自动化永远非 100% 可靠，长链任务失败率随步骤指数上升
- **合规真空**：无 SOC2/ISO27001，进金融/医疗等强合规行业受阻
- **单人团队风险**：创始人即全栈，health/兴趣变化即产品风险（TrustMRR 常见）
- **竞品挤压**：OpenAI/Anthropic 若把调度器做进官方浏览器，Aera 差异化收窄

---

## 十、结语

Aera Browser 是一个**极早期但极清晰的 AI 浏览器自动化样本**：

- 1 个 Chromium 浏览器
- 1 个自然语言调度器
- 3 档定价（$0 / $20 / $200）
- $343 MRR / 9 订阅 / 1700 用户
- 本地优先 + MCP + 诚实安全页

它的成功不在技术（Chromium + LLM 已是标配），而在**定位选择 + 定价分层 + 诚实叙事 + 生态嵌入**。对想做 AI 原生工具的独立开发者，最值得抄的不是"再做一个浏览器"，而是三句话：

1. **容器免费，智能收费**
2. **Free 自托管，Pro 托管模型**
3. **日志可审计，定时是第一公民**

Aera 已在 TrustMRR 挂牌展示。感兴趣的可以去看看真实数据与创始人留言——数字很小，但逻辑很干净。

---

> **产品链接**：[https://trustmrr.com/startup/aera-browser?ref=eric-kwok-b654e8](https://trustmrr.com/startup/aera-browser?ref=eric-kwok-b654e8)
>
> 数据来源：TrustMRR 公开档案（Stripe API 验证）+ getaera.app 官网（Pricing/Features/Use-Cases/Security/FAQ）。所有营收 / MRR / 用户数以 TrustMRR 显示口径为准；带"推算"标记的为基于定价模型的合理估算（如用户分层、ARPU、LTV）。

---

*本报告基于 2026-08-26 快照。分析判断仅代表作者立场，不构成投资建议。*

