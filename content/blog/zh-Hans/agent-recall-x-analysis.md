---
title: "AgentRecall-X 深度解析：会从纠正中学习的 Agent 记忆，与诚实测量革命"
description: "全面分析 Goldentrii 开源的 AgentRecall-X —— 一个「从纠正中学习」的 Claude Code 记忆系统，也是唯一把「agent 是否真的不再重复犯错」量化出来的开源项目。从「受治理的纠正账本」与「缺失的测量仪器」双核心定位，到基于认知心理学的五层记忆模型，从 35.3% 的真实捕获率与 0/3 的诚实数据，到 /arstart /arsave /arrecall /arreflect 四步会话循环，再到完整的 MCP 安装教程与「自动化原则」设计哲学，一文讲透这个 312 stars 却搅动整个 agent 记忆赛道的项目。"
date: "2026-08-03"
author: "TopDigg Research Team"
tags: ["AgentRecall", "Agent Memory", "Claude Code", "MCP", "Corrections Ledger", "RAG", "Mem0", "Turborepo", "Retrieval", "AI Agent", "Memory Layers", "TypeScript"]
categories: ["深度解析"]
keywords: ["AgentRecall-X", "Agent 记忆", "Claude Code 记忆", "MCP Server", "纠正账本", "测量仪器", "五层记忆", "会话循环", "自动化原则", "诚实测量", "RAG", "检索增强", "Mem0 对比", "AI Agent 记忆"]
---

# AgentRecall-X 深度解析：会从纠正中学习的 Agent 记忆，与诚实测量革命

> 核心理念：**「记忆工具的价值不在于存了多少，而在于纠正是否真的改变了 agent 的下一次行为。」** AgentRecall-X 用一句话定义了它与所有竞品的分野——它不只是一个记忆引擎，而是 **(a) 一个受治理的纠正账本** 和 **(b) 一台测量「纠正→行为改变」的仪器**。当整个行业都在自报高分的检索 benchmark 时，它选择公布自己 35.3% 的捕获率和 0/3 的遵从数据——**「Measured, not promised.」（被测量的，而非被承诺的）**。

---

## 一、项目说明

### 1.1 这是什么？

**AgentRecall-X**（原仓库名 AgentRecall-MCP）是 Goldentrii 开源的一个 Claude Code 记忆系统，官方自我定位是：

- **「从纠正中学习的 Claude Code 记忆」**——不是被动地记住对话，而是主动从你的每一次纠正中学习规则；
- **「唯一衡量 agent 是否真正不再重复犯错的学习闭环」**——它不承诺「永不重复错误」，而是用数据告诉你它到底有没有做到；
- 形态覆盖 **MCP · SDK · CLI · Skill** 四种集成方式。

关键事实：

- 仓库：`https://github.com/Goldentrii/AgentRecall-X`
- Stars：**312**，Forks：53
- 协议：MIT
- 语言：TypeScript / JavaScript（monorepo）
- 最新版本：v3.4.40（2026 年 7 月 27 日）
- npm 周下载：约 2,759 次

### 1.2 它想解决什么问题？

用过 AI 编程助手的人都有这个体验：**你纠正了 agent 一百遍「先问再改」「别动这个文件」，它下一轮还是会犯同样的错。** 市面上主流的记忆工具（Mem0 ~60K stars、Graphiti/Zep ~28K、Supermemory ~28K、Letta ~24K）都在做「记住更多」，但没有人回答一个更基本的问题：

> **记住的纠正，到底有没有改变行为？**

AgentRecall-X 指出这个领域的两大缺陷：

- **测检索，不测行为**：LongMemEval、LoCoMo、MemoryAgentBench、Letta Leaderboard——所有公开 benchmark 都在测「能不能检索到」，没有一个是测「检索到之后，agent 是否真的照做了」；
- **自报高分，无法复现**：大多数记忆工具的 benchmark 数字是自我报告、同一套检索测试、难以独立复现。

AgentRecall-X 的答案：**先造测量仪器，再谈记忆。** 它把「纠正账本」和「测量工具」作为第一公民，而检索只是其中的一个零件。

---

## 二、核心思想：Measured, not promised

### 2.1 受治理的纠正账本（Governed Corrections Ledger）

每次你纠正 agent（*「不对，不是那个版本」*、*「这段放前面」*、*「假设之前先问我」*），它都会被存成一条结构化记录，带严重度、证据与结果追踪：

- `rule` —— 规则内容（agent 必须遵循的行为准则）
- `why` —— 这条规则为什么存在
- `project` —— 属于哪个项目
- `date` —— 记录日期
- `severity` —— **P0**（never/always/don't）或 P1（一般偏好）
- `active` —— 是否激活
- `holder` —— 规则所有者
- `heeded_count` —— 被遵从的次数
- `recurred_count` —— 错误复发的次数
- `proof_confidence` —— 证据置信度

它持久化在**跨会话、跨项目、跨 agent 重启**的存储中——纠正一次，终身有效，直到被显式撤回。

### 2.2 缺失的测量仪器（The Missing Measurement Instrument）

这是 AgentRecall-X 最独特的贡献：**每一条纠正都会累积 `retrieved_count`（被检索次数），而每当 agent 再次遇到相同情境，结果都会被记录为 `heeded`（遵从）或 `recurred`（复发）。**

作者的原话：

> **「这个领域里的每个 benchmark 都在测检索；没有一个测试跨会话的行为变化。我们先把测量工具造出来——并且公布我们发现的一切，包括那些不好看的数字。」**

### 2.3 它自己公布的真实数据（2026-07-03）

- **纠正捕获召回率**（双重盲审，n=59）：**35.3%** [17.3–58.7 置信区间]——只捕获了约 1/3 的真实纠正；
- **遵从率（证据支撑，重置后）**：**0/3** 事件——不是 92.5% 的「乐观估计」，而是诚实的 0；
- **纠正迁移召回率**（离线基准，可实现水平）：**0/4** [Wilson 0–49%]——在自己的语料上得分 0；
- **session_start 注入中位数**：**1,489 tokens**（优化前 2,010；Mem0 锚点约 7K）；
- **p95 session_start 延迟（热）**：**363 ms**（优化前 1,132）。

作者的解释（诚实且精准）：

- 35.3% 的捕获率说明**纠正捕获本身是最大的瓶颈**；
- 0/3 不是「回归」，而是**把默认值从「假设遵从」改为「未知」后的正确起点**；
- 迁移召回 0/4 是**数据密度问题**（19 个项目仅 32 条活跃纠正，太稀疏无法前置错误），**不是检索架构问题**（内部实验已确认 5 次）。

> 这一点极其罕见：**一个开源项目主动公布让自己难看的数字，并且每个数字都能通过 `npm run bench` 从固定、哈希锁定的语料库一键复现。**

---

## 三、技术架构：五层记忆模型

### 3.1 基于认知心理学的五层记忆

AgentRecall-X 把认知心理学的记忆分类法映射到 agent 的文件系统：

- **第 1 层 · 情景记忆（Episodic）**——按时间顺序记录每次会话发生了什么，路径 `journal/`，工作中自动写入；
- **第 2 层 · 语义记忆（Semantic）**——按主题聚类的事实，带 `[[wikilinks]]` 双向链接，路径 `palace/rooms/`（Architecture、Goals、Blockers）；
- **第 3 层 · 程序记忆（Procedural）**——IF-THEN 产生式规则，可复用的 how-to，路径 `palace/skills/`；
- **第 4 层 · 叙事记忆（Narrative）**——项目阶段：目标 → 难点 → 如何解决 → 提炼，路径 `palace/pipeline/`；
- **第 5 层 · 纠正记忆（Correction）**——行为校准规则，带严重度与结果追踪，路径 `corrections/`；
- **+ 感知层（Awareness）**——从 N 次确认的纠正中提升出的跨项目洞察，路径 `palace/awareness`，是「复利」的一层。

所有层共享同一套命名语法，任何 agent 都能从意图组合出检索路径；已有文件通过 `legacy_path` 视图继续工作，**无需迁移**。

### 3.2 本地文件结构

所有记忆默认存本地 Markdown，零云端：

```
~/.agent-recall/
├── awareness.md                  # 全局复合文档（约 200 行）
├── awareness-state.json          # 结构化 awareness 数据
├── insights-index.json           # 跨项目 insight 匹配
├── feedback-log.json             # 检索质量评分
└── projects/<name>/
    ├── journal/YYYY-MM-DD--arsave--NL--slug.md
    ├── palace/
    │   ├── rooms/<room>/         # 持久知识房间
    │   ├── skills/               # 程序规则
    │   ├── pipeline/             # 叙事阶段
    │   ├── awareness/            # 跨项目洞察
    │   ├── identity.md           # 项目意图 + 目标
    │   └── graph.json            # 记忆连接边
    └── corrections/
        └── alignment-log.json    # 纠正历史
```

### 3.3 技术栈与检索

- **核心**：TypeScript monorepo，4 个发布包（`core` 存储+工具逻辑、`mcp-server` 薄 MCP 包装、`sdk` 编程接口、`cli` 的 `ar` 命令）；
- **默认检索**：关键词/子串匹配（词干还原 + 同义词扩展 + 轻量 IDF + 按来源排序），通过 **RRF（Reciprocal Rank Fusion，Cormack 2009）** 融合——注意：**不是 BM25**，作者明确说没有倒排索引，真实 BM25 是「未来可能」的升级；
- **可选语义检索**：设置 `OPENAI_API_KEY` 后启用向量搜索；可选 Supabase 镜像（pgvector）；
- **衰减算法**：FSRS-lite（Ebbinghaus → SuperMemo → FSRS-6 谱系）；
- **重排序**：Modern Hopfield re-rank primitive（Ramsauer 2020）存在于代码中，但**未接入默认路径**——「现在跑什么就是什么」；
- **用户反馈**：检索结果可评分，通过 Bayesian Beta 模型更新排名。

---

## 四、设计哲学

### 4.1 自动化原则（The Automaticity Principle）

> **「记忆只有在自动触发时才会复合，而不是按需调用。」**

实证依据：对 44 个项目、221 个 journals、81 个纠正的长期观察（2026-06-12）发现——**所有「拉取式」工具（recall、memory_query）的有机调用次数为零**，包括构建它们的那台 agent 自己也不用。而「推送式」通道（session_start、session_end、纠正 hooks、ambient recall）持续产生行为改变。

结论：默认只发布 **5 个工具**；「双动词模型」——`session_start`（吸气）和 `session_end`（呼气）——承载了全部复利价值，其余全部 opt-in（`--full`）。

### 4.2 诚实测量优先于营销叙事

- 删除了「Every correction saved is a mistake never repeated」（无法证伪的营销话术）；
- 删除了竞品对比表（属性会漂移，无法持续追踪）；
- 建立了可复现测量框架：每个数字都可以用一条命令重新生成，「包括那些让我们难看的数字」。

### 4.3 本地优先，零云默认（Zero Cloud by Default）

默认路径纯本地 Markdown，不依赖任何云服务；Supabase 镜像和 OpenAI 向量是**可选项**。这也是「Cheap + Private」的体现——你的纠正账本属于你。

### 4.4 有主见的选择

- **用 Markdown 而非向量库做默认存储**——可读、可 diff、可 grep、可 git 版本控制；
- **用 RRF 而非 BM25**——够用且诚实，不假装比实际更复杂；
- **用 MCP 而非专有协议**——一套接口接入所有 agent 客户端。

---

## 五、详细教程：从零开始用 AgentRecall-X

### 5.1 安装 MCP Server

**Claude Code（一键安装）：**

```bash
claude mcp add --scope user agent-recall -- npx -y agent-recall-mcp
```

**Cursor（`.cursor/mcp.json`）：**

```json
{ "mcpServers": { "agent-recall": { "command": "npx", "args": ["-y", "agent-recall-mcp"] } } }
```

**VS Code（`.vscode/mcp.json`）：**

```json
{ "servers": { "agent-recall": { "command": "npx", "args": ["-y", "agent-recall-mcp"] } } }
```

**Windsurf（`~/.codeium/windsurf/mcp_config.json`）：**

```json
{ "mcpServers": { "agent-recall": { "command": "npx", "args": ["-y", "agent-recall-mcp"] } } }
```

**Codex：**

```bash
codex mcp add agent-recall -- npx -y agent-recall-mcp
```

### 5.2 安装 Skill（Claude Code 专用）

```bash
mkdir -p ~/.claude/skills/agent-recall
curl -o ~/.claude/skills/agent-recall/SKILL.md \
  https://raw.githubusercontent.com/Goldentrii/AgentRecall-X/main/SKILL.md
```

### 5.3 安装 SDK 与 CLI

```bash
npm install agent-recall-sdk            # JS/TS 应用
npx agent-recall-cli recall "topic"     # 终端 & CI
```

### 5.4 四步会话循环（The Session Loop）

这是 AgentRecall-X 的核心用法——**「没有 /arstart，全新 agent 零定向；没有 /arsave，一切不会复利。」**

- **`/arstart`**（每次会话**第一个**动作）——打开状态板：列出所有项目的待办与阻塞项，按编号选择后加载该项目的深度上下文（palace 房间、纠正、任务召回）；`/arstart <slug>` 直接加载；`/arstart bootstrap` 扫描整台机器导入已有项目；
- **`/arsave`**（每次会话**最后一个**动作）——写入 journal + palace 整合 + awareness 复合；`/arsave all` 批量保存当天所有并行会话（扫描、合并、去重）；
- **`/arrecall`**（会话中途按需）——搜索过去的知识：文档化修复、历史决策、既有模式；
- **`/arreflect`**（每 K 个会话）——周期性整合：确认复发/幽灵匹配、聚类新错误类、提议规则再抽象（**规则修改始终由所有者把关**）。

### 5.5 核心 MCP 工具速查

**session_start（会话开始时）：**

```json
{ "project": "my-app" }
```

返回：项目身份、前 5 条 awareness insights、显著度最高的 palace 房间、来自过去纠正模式的预测警告（`watch_for`）、最多 10 条 P0 行为规则、续接简报。

**remember（学到新知识时）：**

```json
{
  "content": "We decided to use GraphQL instead of REST",
  "context": "architecture decision"
}
```

返回：自动路由目标（`routed_to`）、内容分类、自动生成的语义 slug。

**recall（搜索过去知识时）：**

```json
{ "query": "authentication design", "limit": 5 }
```

可附带反馈评分，驱动 Bayesian 排名更新。

**session_end（会话结束时）：**

```json
{
  "summary": "Built auth module with JWT refresh rotation. Fixed CORS bug.",
  "insights": [{
    "title": "JWT refresh tokens need httpOnly cookies",
    "evidence": "XSS attack vector discovered during security review",
    "applies_when": ["auth", "jwt", "security", "cookies"],
    "severity": "critical"
  }],
  "trajectory": "Next: add rate limiting to API endpoints"
}
```

**check（重大决策前验证理解）：**

```json
{
  "goal": "Build REST API for user management",
  "confidence": "medium",
  "assumptions": ["User wants REST, not GraphQL", "CRUD endpoints"]
}
```

### 5.6 SDK 使用示例

```typescript
import { AgentRecall } from "agent-recall-sdk";

const memory = new AgentRecall({ project: "my-app" });

// 捕获知识
await memory.capture("What stack?", "Next.js + Postgres");

// 搜索记忆
const ctx = await memory.recall("rate limiting");
```

### 5.7 实验性工具包（Recurrence & Reflection Harness Kit）

- `ar-scoreboard.py`（SessionStart hook）——每次会话的健康摘要：纠正流、洞察提升率、循环健康度、幽灵计数、反思节奏；
- `ar-recurrence-check.py`——基于错误类分类法的机械幽灵检测（规则之后仍发生违规 = phantom gradient step，写入了成本但行为从未改变）；
- `ar-nudge.py`（UserPromptSubmit hook）——会话中主动浮出逾期反思；
- `dispatch-model-guard.py`（PreToolUse hook，可选）——显式模型调度策略的警告守卫。

首次验证运行（2026-07-14，单台重度用户）：**109 条纠正中发现 8 个错误类、18 个确认的幽灵梯度步，当天重抽象 6 条规则。**

### 5.8 War Room 可视化仪表盘

1. 从 [最新 Release](https://github.com/Goldentrii/AgentRecall-X/releases/latest) 下载 `ar-warroom-v3.4.40.zip`；
2. 解压并本地启动：

```bash
cd warroom
python3 -m http.server 8080
```

3. 打开 **http://localhost:8080/AgentRecall.html** —— 活动日历、各项目状态、纠正、洞察，全部从本地 `~/.agent-recall/` 数据渲染，**完全离线，无需 Node 与构建步骤**。

---

## 六、功能清单：开箱即用

- **受治理纠正账本**：严重度（P0/P1）+ 证据 + 撤回 + 结果追踪
- **行为测量**：`retrieved_count` / `heeded` / `recurred` 三指标
- **五层记忆**：情景 / 语义 / 程序 / 叙事 / 纠正 + Awareness 复合层
- **双动词会话模型**：`session_start` / `session_end`，其余 opt-in
- **检索**：关键词 + 同义词 + 轻量 IDF + RRF 融合（可选 OpenAI 向量）
- **反馈学习**：检索结果 Bayesian Beta 评分
- **梦境模式（可选）**：夜间自动整合，Ebbinghaus 衰减、journal 汇总、awareness 毕业、Telegram 日报
- **平台覆盖**：Claude Code（主）、Cursor、Windsurf、VS Code/Copilot、Codex、Hermes、Roo Code、任意 JS/TS 应用、终端/CI
- **War Room**：离线可视化仪表盘
- **可复现基准**：`npm run bench` 一键复现全部数字
- **本地优先**：默认零云端，Markdown 可读可 git 管理

---

## 七、归纳总结：观点与结论

### 7.1 核心观点

1. **「记忆引擎」是个被误用的标签——AgentRecall-X 本质是纠正账本 + 测量仪器。** 作者在内部研究文档里直接断言：「AgentRecall 不是记忆引擎。它是（a）一个受治理的纠正账本和（b）纠正学习的缺失测量仪器——目前被误标为记忆工具。」**这是定位的诚实，也是差异化的起点。**
2. **「测检索不测行为」是整个 agent 记忆赛道的系统性盲区。** LongMemEval、LoCoMo、MemoryAgentBench 全在测检索；AgentRecall-X 是唯一公开测量「跨会话行为改变」的开源系统。**当别人都在比「存得多」，它选择比「改得真」。**
3. **诚实的数据是稀缺资产。** 公布 35.3% 的捕获率和 0/3 的遵从率，短期看是「不好看的数字」，长期看是**信任的护城河**——因为每个数字都可以从哈希锁定的语料库复现，「包括那些让我们难看的数字」。
4. **自动化原则：记忆的复利来自推送，不来自拉取。** 44 个项目、数周真实使用中，所有拉取式工具零调用——**默认只发布 5 个工具、用双动词承载全部价值，是数据驱动的最优解，而不是设计者的偏好。**
5. **当前瓶颈是数据密度，不是检索架构。** 19 个项目仅 32 条活跃纠正（75% 已被撤回）——纠正样本太稀疏，无法前置错误。**先解决「捕获」，再优化「检索」，顺序不能反。**

### 7.2 它在赛道中的位置（与竞品对比）

- **Mem0**（~60K stars）——向量 + BM25 + 实体，纠正层低，编码 agent 聚焦高；
- **Graphiti/Zep**（~28K）——时序知识图谱（Neo4j），纠正层低；
- **Supermemory**（~28K）——fact + profiles + KG + RAG，编码 agent 聚焦**最高**；
- **Letta**（~24K）——agent 可编辑记忆块，纠正层中；
- **AgentRecall-X**（312 stars）——Markdown 纠正账本 + 五层记忆，**纠正层原生**，编码 agent 聚焦高，**默认本地零云**。

**以 312 stars 对抗 60K stars 的巨头，它的策略不是「做得更多」，而是「测得更真」。**

### 7.3 对开发者的启示

- **纠正捕获是最被低估的环节**——35.3% 的捕获率意味着再强的检索也救不回没被记住的错误；
- **测量先行**：任何记忆系统都该先回答「它改变行为了吗」，再谈存储与检索；
- **默认值决定产品性格**：把「未验证=遵从」改成「未验证=未知」，0/3 才是诚实起点；
- **本地优先是可复制的产品策略**：Markdown 记忆可读、可 diff、可 git，胜过任何黑盒向量库。

### 7.4 结语

在 agent 记忆赛道拥挤到「人人自报 90%+ 检索分」的 2026 年，AgentRecall-X 用一组「难看但真实」的数字，划出了一条完全不同的起跑线。它可能没有最多的 stars，但它拥有这个领域最稀缺的东西——**一个可以证伪自己的测量仪器，和一份愿意公布坏消息的诚实**。

> **当整个行业都在展示检索的辉煌时，AgentRecall-X 选择测量行为的真相。这或许才是 agent 记忆真正该走的路。**

---

## 参考资料

- AgentRecall-X 官方仓库：https://github.com/Goldentrii/AgentRecall-X
- 官方完整文档：https://github.com/Goldentrii/AgentRecall-X/blob/main/README.full.md
- 更新日志（设计推理）：https://github.com/Goldentrii/AgentRecall-X/blob/main/UPDATE-LOG.md
- 竞品研究报告：https://github.com/Goldentrii/AgentRecall-X/blob/main/docs/research/agent-memory-landscape-2026-07.md
- 基准复现指南：https://github.com/Goldentrii/AgentRecall-X/blob/main/docs/eval/REPRODUCE.md
- npm 包：https://www.npmjs.com/package/agent-recall-mcp
