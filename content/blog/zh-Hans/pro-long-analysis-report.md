---
title: "PRO-LONG 深度解析：程序化记忆赋能长程推理"
description: "全面解析 PRO-LONG — 为 LLM Agent 提供程序化记忆的极简框架。深度探讨其设计哲学、单文件日志架构、代码检索机制、ARC-AGI-3 上的突破性表现以及它为何代表了 Agent 记忆系统的未来范式。"
date: "2026-08-08"
author: "TopDigg Research Team"
tags: ["PRO-LONG", "LLM Agent", "程序化记忆", "长程推理", "ARC-AGI-3", "上下文管理", "开源", "AI", "Fable", "Agent记忆"]
categories: ["深度解析"]
keywords: ["PRO-LONG", "程序化记忆", "LLM Agent", "长程推理", "ARC-AGI-3", "上下文管理", "Agent记忆系统", "代码检索"]
---

> **PRO-LONG** 是一个为 LLM Agent 设计的极简程序化记忆框架，它通过单文件日志和代码检索实现了长程推理能力。本全面分析涵盖项目的架构、设计哲学、实用教程以及 Agent 记忆系统的核心洞察。

---

## 1. 项目说明

### 1.1 什么是 PRO-LONG?

PRO-LONG 是一个为长程任务设计的极简上下文管理框架。它的核心理念极其简单：

1. **将所有观察、动作和结果追加到一个结构化的 `log.txt` 文件**
2. **Agent 通过代码（grep、Python）检索和推理这个历史记录**
3. **没有子代理、没有专门的检索机制、系统提示仅约 30 行**

这不是另一个复杂的记忆系统。PRO-LONG 的设计哲学是**极简主义**——用最少的代码实现最有效的记忆管理。

### 1.2 核心特性

| 特性 | 详情 |
|------|------|
| **单文件日志** | 所有历史记录存储在一个 `log.txt` 文件中 |
| **代码检索** | Agent 使用 grep、Python 等工具程序化检索历史 |
| **极简提示** | 系统提示仅约 30 行，不包含复杂指令 |
| **双后端支持** | 支持 OpenAI Codex 和 Claude Code 两种后端 |
| **Docker 沙箱** | 在隔离的容器环境中执行，确保安全 |
| **ARC-AGI-3 突破** | 在 ARC-AGI-3 上达到 97.4% best@2 |

### 1.3 关键概念

#### 程序化记忆——让 Agent 学会"查资料"

传统的 Agent 记忆系统通常采用两种策略：

1. **上下文注入**：将所有历史信息直接放入提示中（导致 token 爆炸）
2. **向量检索**：使用 embedding 模型检索相关历史（增加复杂性和延迟）

PRO-LONG 提出了第三种策略：**程序化记忆**。Agent 可以像程序员一样，使用 grep、Python 脚本等工具来搜索和分析历史记录。

这种方式的优势在于：
- **完整性**：保留完整的历史记录，不丢失任何信息
- **精确性**：代码检索比语义检索更精确
- **可解释性**：Agent 的检索过程是透明的、可调试的
- **零额外开销**：不需要 embedding 模型或向量数据库

#### 单文件日志——最简单就是最有效

PRO-LONG 将所有信息存储在一个 `log.txt` 文件中，包括：
- 初始棋盘状态
- 每次动作后的棋盘状态
- Agent 的分析和推理
- 动作执行结果

这种设计看似"愚蠢"，但实际上非常聪明：
- **无信息丢失**：完整保留所有历史
- **简单可靠**：没有复杂的同步或索引机制
- **高效检索**：grep 在大文件上的性能极佳

#### 30 行提示——信任 Agent 的能力

PRO-LONG 的系统提示仅约 30 行，不包含：
- 复杂的推理指令
- 详细的策略指导
- 特定的任务格式要求

它只告诉 Agent：
1. 你的目标是什么（解谜）
2. 历史记录在哪里（`log.txt`）
3. 如何检索历史（用代码）
4. 如何输出动作（写 `actions.json`）

这种极简设计体现了对 Agent 能力的信任——让 Agent 自己决定如何检索和推理。

---

## 2. 设计哲学

### 2.1 极简主义——少即是多

PRO-LONG 的核心设计哲学是**极简主义**。在其他记忆系统不断增加复杂性的同时，PRO-LONG 选择了最简单的方案：

- 一个文件存储所有历史
- 一个提示告诉 Agent 如何使用
- 一套工具让 Agent 自己检索

这种设计的优点：
- **易于理解**：任何人都能看懂系统如何工作
- **易于调试**：问题出现时，只需检查日志文件
- **易于扩展**：添加新功能只需修改日志格式

### 2.2 信任 Agent——让代码说话

PRO-LONG 不试图"教"Agent 如何推理。它信任 Agent 的能力，只提供：
- 访问历史的途径（文件系统）
- 检索工具（grep、Python）
- 输出格式（JSON）

Agent 可以：
- 使用任何检索策略
- 编写任何分析脚本
- 采用任何推理方法

这种设计体现了对现代 LLM 编码能力的信心。

### 2.3 程序化优于语义——精确胜过模糊

传统的记忆系统使用语义检索（embedding 相似度），但 PRO-LONG 选择程序化检索（grep、Python）。

原因：
- **精确匹配**：grep 可以精确找到包含特定模式的行
- **结构化查询**：Python 可以解析日志格式，执行复杂查询
- **零延迟**：不需要 embedding 计算和向量搜索
- **可解释**：Agent 的检索过程完全透明

---

## 3. 详细教程

### 3.1 安装与设置

#### 环境要求

- Python 3.12（推荐）
- Docker

#### 安装步骤

```bash
# 克隆仓库
git clone git@github.com:alexisfox7/PRO-LONG.git
cd PRO-LONG

# 创建虚拟环境
python -m venv .venv
source .venv/bin/activate

# 安装依赖
pip install -e .
```

#### 构建 Docker 镜像

```bash
# Codex 后端
docker build -t rgb-agent/codex-sandbox:latest docker/codex-sandbox
docker build -t rgb-openai-proxy docker/openai-proxy

# Claude Code 后端
docker build -t rgb-agent/claude-sandbox:latest docker/claude-sandbox
docker build -t rgb-anthropic-proxy docker/anthropic-proxy
```

#### 配置环境变量

创建 `.env` 文件：

```
ARC_API_KEY=...
ANTHROPIC_API_KEY=...   # claude-code 后端
OPENAI_API_KEY=...      # codex 后端
```

### 3.2 基本使用

#### 运行评估

```bash
# 使用 Codex 后端运行所有游戏
prolong-swarm --suite all -m gpt-5.5 --max-actions 500

# 使用 Claude Code 后端运行所有游戏
prolong-swarm --suite all --backend claude-code -m claude-opus-4-6

# 运行特定游戏
prolong-swarm --game ls20,ft09 -m gpt-5.5
```

#### 关键参数

| 参数 | 默认值 | 说明 |
|------|--------|------|
| `--backend` | `codex` | 后端：`codex` 或 `claude-code` |
| `--suite` | — | 游戏套件：`ls20`、`vc33`、`ft09` 或 `all` |
| `--game` | — | 逗号分隔的游戏名称或 ID |
| `--max-actions` | 500 | 每个游戏的最大动作数 |
| `--model`, `-m` | `claude-opus-4-6` | 基础模型 |
| `--effort` | `high` | 努力级别（claude-code 后端） |
| `--reasoning-effort` | `none` | 推理努力（codex 后端） |
| `--operation-mode` | `online` | `online` / `offline` / `normal` |

### 3.3 内存条件

Agent 对游戏历史的访问由 `--log-window` 和 `--workspace` 控制：

| 条件 | 参数 | 可用历史 |
|------|------|----------|
| **prolong** | （默认） | 完整游戏日志 |
| **lw25** | `--log-window 25` | 日志的最后 25 个动作部分 |
| **no-log (in-prompt)** | `--log-window -1` | 无日志文件；当前棋盘添加到提示中 |
| **stateless** | `--workspace stateless` | 完整日志，但每次调用时工作区被清除 |

### 3.4 理解系统提示

PRO-LONG 的系统提示非常简洁，核心内容：

```python
SYSTEM_PROMPT = """
You are a coding agent playing a grid-based puzzle game by writing Python action plans.

Your primary objective is to solve all levels in the game. Your secondary objective is to minimize total cumulative actions used.

`/workspace/logs.txt` is the game log: action headers, tool calls, board states, and your own prior analyses. Parse it **programmatically**, as reading full 64x64 board states from prompt can introduce precision errors.

**Tools**: Read, Write, Edit, Bash, Grep, Glob.

**Workspace**: `/workspace/` persists across calls. `actions.json` is cleared each call; other files accumulate.

**Response format**: a strategic briefing, then
[PLAN]
<2-3 sentence action plan>

**Write `/workspace/actions.json`** with a JSON object `{"actions": ["ACTION6(30,40)", "ACTION1", "RESET"]}` — a list of 1–{action_cap} actions to execute in order.
"""
```

这个提示的关键点：
1. **明确目标**：解谜 + 最小化动作数
2. **指定记忆位置**：`/workspace/logs.txt`
3. **指定检索方式**：程序化（grep、Python）
4. **指定输出格式**：`actions.json`

### 3.5 动作系统

PRO-LONG 支持以下动作：

| 动作 | 说明 |
|------|------|
| `ACTION1` | 向上 |
| `ACTION2` | 向下 |
| `ACTION3` | 向左 |
| `ACTION4` | 向右 |
| `ACTION5` | 空格/交互 |
| `ACTION6(x,y)` | 点击列 x（0-63），行 y（0-63） |
| `ACTION7` | 撤销 |
| `RESET` | 重置关卡（动作仍计入） |

### 3.6 输出结果

评估结果写入 `evaluation_results/` 目录。`scorecards/` 目录包含官方在线记分卡。

---

## 4. 核心架构深度解析

### 4.1 项目结构

```
prolong_agent/
├── agent/
│   ├── base.py               # 基础架构
│   ├── codex_agent.py        # Codex CLI 后端
│   ├── claude_code_agent.py  # Claude Code 后端
│   ├── swarm.py              # CLI 入口点
│   ├── action_queue.py       # 动作执行
│   ├── game_state.py         # 棋盘/日志格式化
│   └── prompts.py            # 提示模板（~30 行）
├── environment/
│   ├── arcagi3.py            # ARC-AGI-3 API 封装
│   ├── runner.py             # 单游戏循环
│   └── config.py
├── metrics/
└── utils/
```

### 4.2 核心组件

#### Agent 基础架构

```python
class BaseAgent:
    """Agent 基础类，定义标准接口"""
    
    def __init__(self, model: str, workspace: str):
        self.model = model
        self.workspace = workspace
        self.log_path = f"{workspace}/logs.txt"
    
    def act(self, observation: dict) -> list[str]:
        """根据观察返回动作列表"""
        # 1. 将观察追加到日志
        # 2. 读取日志
        # 3. 使用模型生成动作
        # 4. 写入 actions.json
        pass
```

#### 日志格式

```log
[INITIAL BOARD STATE]
<64x64 棋盘状态>

[ACTION1]
Tool call: bash("python3 -c '...'")

[POST-ACTION BOARD STATE]
<更新后的棋盘状态>

[ACTION2]
Tool call: grep("pattern", "/workspace/logs.txt")
...
```

#### 动作执行

```python
class ActionQueue:
    """动作队列，按顺序执行动作"""
    
    def execute(self, actions: list[str]) -> dict:
        results = []
        for action in actions:
            result = self._run_action(action)
            results.append(result)
        return {"results": results, "total": len(results)}
```

### 4.3 检索机制

PRO-LONG 的检索完全依赖 Agent 的代码能力：

```python
# Agent 可以使用的检索方式

# 1. grep 搜索特定模式
grep -n "INITIAL BOARD STATE" /workspace/logs.txt

# 2. Python 解析日志
python3 -c "
import re
with open('/workspace/logs.txt') as f:
    content = f.read()
boards = re.findall(r'\[POST-ACTION BOARD STATE\](.*?)\[', content, re.DOTALL)
print(f'Found {len(boards)} board states')
"

# 3. 统计分析
python3 -c "
with open('/workspace/logs.txt') as f:
    lines = f.readlines()
actions = [l for l in lines if l.startswith('[ACTION')]
print(f'Total actions: {len(actions)}')
"
```

### 4.4 性能数据

根据论文和官方评估：

| 指标 | 数据 |
|------|------|
| **ARC-AGI-3 best@2** | 97.4%（Fable 5） |
| **平均提升** | 比基础 Agent 提升 18.0 个百分点 |
| **Token 效率** | 比专业框架少 4.2-5.8 倍 |
| **总成本** | $1,750（25 次 Fable 5 运行） |
| **最高 pass@1** | 76.1% |

---

## 5. 归纳总结

### 5.1 为什么 PRO-LONG 重要?

PRO-LONG 代表了 Agent 记忆系统的重要范式转变。在其他系统不断增加复杂性的同时，PRO-LONG 证明了**极简主义的力量**。

**三个核心洞察**：

1. **程序化记忆优于语义检索**：让 Agent 用代码搜索历史，比 embedding 检索更精确、更高效
2. **单文件日志足够**：一个 `log.txt` 文件可以存储所有需要的信息
3. **信任 Agent 的能力**：30 行提示足以让 Agent 自主完成复杂任务

### 5.2 与其他工具的比较

| 特性 | PRO-LONG | LangChain Memory | AutoGPT | BabyAGI |
|------|----------|------------------|---------|---------|
| **记忆方式** | 单文件日志 | 向量数据库 | 多文件 | 任务队列 |
| **检索方式** | 代码（grep/Python） | 语义搜索 | 文件读取 | 优先级排序 |
| **提示长度** | ~30 行 | 复杂 | 复杂 | 中等 |
| **Token 效率** | 极高 | 中等 | 低 | 中等 |
| **ARC-AGI-3** | 97.4% | 未测试 | 未测试 | 未测试 |
| **开源** | ✅ | ✅ | ✅ | ✅ |

### 5.3 适用场景

**最适合**：
- 需要长期记忆的 Agent 任务
- 需要精确检索的历史查询
- 复杂的推理和规划任务
- 成本敏感的应用场景

**不太适合**：
- 简单的单轮对话
- 不需要历史记忆的任务
- 非编码 Agent（需要代码能力）

### 5.4 设计哲学总结

PRO-LONG 的设计哲学可以概括为：

1. **极简主义**：最少的代码，最有效的记忆
2. **信任 Agent**：让 Agent 自己决定如何检索和推理
3. **程序化优于语义**：精确匹配胜过模糊相似
4. **完整保留**：不丢失任何历史信息
5. **零额外开销**：不需要 embedding 模型或向量数据库

---

## 6. 路线图

基于项目的发展趋势和 Agent 记忆系统的演进：

### 短期（3-6 个月）
- 支持更多 LLM 后端
- 改进日志格式和检索效率
- 添加更多评估基准

### 中期（6-12 个月）
- 多 Agent 协作记忆
- 增量日志压缩
- 跨会话记忆持久化

### 长期（1-2 年）
- 自主记忆管理 Agent
- 跨组织记忆共享
- 通用长程推理框架

---

## 7. 总结

PRO-LONG 是一个开创性的 Agent 记忆框架，它通过极简的设计实现了突破性的性能。单文件日志、代码检索、30 行提示——这些看似"简陋"的设计，在 ARC-AGI-3 上达到了 97.4% 的准确率。

**核心价值**：
- **极简主义**：最少的代码，最有效的记忆
- **程序化检索**：精确、高效、可解释
- **完整保留**：不丢失任何历史信息
- **零额外开销**：不需要 embedding 模型

**为什么选择 PRO-LONG?**
- 开源透明（MIT 许可证）
- 极简设计，易于理解和调试
- 代码检索，精确高效
- 在 ARC-AGI-3 上验证的突破性性能

**立即开始**：
```bash
# 克隆仓库
git clone git@github.com:alexisfox7/PRO-LONG.git
cd PRO-LONG

# 安装
python -m venv .venv
source .venv/bin/activate
pip install -e .

# 运行评估
prolong-swarm --suite all -m gpt-5.5 --max-actions 500
```

---

> **声明**：本文基于 PRO-LONG 公开文档、论文和技术分析撰写，旨在提供全面的技术解析和实践指南。论文引用：arXiv:2607.20064。
