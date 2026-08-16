---
title: "Waza：微软开源 AI Agent 技能评估框架——从入门到精通"
date: "2026-08-16"
description: "深度解析微软 Waza 项目——Go 语言实现的 AI Agent 技能评估 CLI 工具，支持多模型对比、对抗性测试、MCP 模拟服务器"
tags:
  - Waza
  - AI Agent
  - 技能评估
  - 微软
  - Go
  - CLI工具
  - 基准测试
  - 开源
categories:
  - AI Agent
  - 评估框架
  - 微软开源
  - Go工具
  - 技能评估
---

# Waza：微软开源 AI Agent 技能评估框架——从入门到精通

## 项目背景与核心问题

### AI Agent 技能评估的困境

在 AI Agent 开发过程中，如何**系统性地评估和验证 Agent 的技能质量**一直是开发者面临的核心挑战：

| 痛点 | 传统方法的问题 | Waza 的解决方案 |
|------|---------------|----------------|
| **缺乏标准化** | 各团队自建评估体系，难以复用 | 统一的 Eval Spec 规范 |
| **结果不可复现** | 随机性导致结果波动 | Snapshot & Replay 机制 |
| **多模型对比困难** | 手动对比，效率低下 | 内置 compare 命令 |
| **对抗性测试缺失** | 难以发现安全隐患 | 内置 adversarial 故障注入 |
| **CI/CD 集成复杂** | 缺乏标准化接口 | 标准化 Exit Codes 和 Reporters |

### Waza 的诞生

Waza 是微软推出的一款 **Go 语言编写的 CLI 工具**，专门用于评估 AI Agent 的技能质量。它的核心理念是：

> **"为 AI Agent 技能评估提供标准化、可复现、可量化的评估框架。"**

```
┌─────────────────────────────────────────────────────────────────┐
│                      Waza 核心指标                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ⭐ GitHub Stars:     1,200+                                    │
│  🍴 Forks:            75+                                        │
│  📊 提交次数:         850+                                       │
│  🏢 开发者:           Microsoft                                  │
│  📦 编程语言:         Go                                         │
│  📜 开源协议:         MIT                                        │
│  🛠️ 评估器类型:       9 种内置 graders                           │
│  🔌 MCP 支持:         内置模拟服务器                              │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 项目概述

### 什么是 Waza？

Waza 是一个**用于评估 AI Agent 技能的命令行工具**，它可以帮助开发者：

- **脚手架评估套件**：从 SKILL.md 自动生成评估任务
- **运行基准测试**：跨不同模型运行并比较结果
- **质量评分**：使用 LLM-as-Judge 进行多维度评估
- **对抗性测试**：注入故障以发现潜在安全问题
- **Token 管理**：分析和优化技能文档大小

### 核心特性一览

| 特性 | 描述 |
|------|------|
| 🎯 **技能生命周期管理** | init、create、run、check 完整流程 |
| 📊 **多模型对比** | 跨不同模型运行基准测试并比较结果 |
| 🏅 **LLM-as-Judge** | 内置多种评分器：groundedness、helpfulness 等 |
| 🔢 **Token 管理** | 计数、对比、分析和建议优化 |
| 🛡️ **对抗性测试** | 离线故障注入：prompt injection、scope-bypass |
| 📸 **快照与回放** | 捕获运行以确保可复现性 |
| 🔌 **MCP 模拟服务器** | 无网络依赖的隔离测试 |
| ☁️ **云存储集成** | 自动上传结果到 Azure Blob Storage |
| 📈 **可视化仪表板** | 通过 HTTP 或 JSON-RPC 查看结果 |

---

## 架构设计深度解析

### 整体架构

Waza 采用模块化架构设计，主要分为以下几个核心部分：

```
┌─────────────────────────────────────────────────────────────────────────┐
│                            Waza 架构概览                                  │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│   ┌─────────────────────────────────────────────────────────────────┐   │
│   │                         CLI 入口 (cmd/waza)                      │   │
│   │                    init | run | check | compare | serve         │   │
│   └─────────────────────────────────────────────────────────────────┘   │
│                                    │                                     │
│   ┌─────────────────────────────────────────────────────────────────┐   │
│   │                       核心模块 (internal/)                       │   │
│   │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐        │   │
│   │  │ graders  │  │  models  │  │orchestra │  │  metrics │        │   │
│   │  │ 评估器   │  │ 数据结构 │  │   协调   │  │   评分   │        │   │
│   │  └──────────┘  └──────────┘  └──────────┘  └──────────┘        │   │
│   │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐        │   │
│   │  │ execution│  │ reporting│  │transcript│  │  config  │        │   │
│   │  │   执行   │  │   报告   │  │  录制   │  │   配置   │        │   │
│   │  └──────────┘  └──────────┘  └──────────┘  └──────────┘        │   │
│   └─────────────────────────────────────────────────────────────────┘   │
│                                    │                                     │
│   ┌─────────────────────────────────────────────────────────────────┐   │
│   │                        执行后端 (execution/)                      │   │
│   │              mock (CI友好)  │  copilot-sdk (默认)                 │   │
│   └─────────────────────────────────────────────────────────────────┘   │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### 项目结构详解

```
waza/
├── cmd/waza/               # CLI 入口点和命令定义
│   └── tokens/             # Token 计数子命令
├── internal/
│   ├── config/             # 配置管理（函数式选项）
│   ├── execution/          # AgentEngine 接口 (mock, copilot)
│   ├── graders/            # 评估器注册表和内置 graders
│   ├── metrics/            # 评分指标
│   ├── models/             # 数据结构 (EvalSpec, TestCase, etc.)
│   ├── orchestration/      # EvalRunner 协调执行
│   ├── reporting/          # 结果格式化和输出
│   ├── transcript/         # 每个任务的录制捕获
│   └── wizard/             # 交互式初始化向导
├── examples/               # 示例评估套件
├── skills/                 # 示例技能
└── registry.json           # 共享 graders 注册表
```

### 评估规范格式（Eval Spec Schema 1.2）

Waza 使用标准化的 YAML 配置格式来定义评估：

```yaml
name: my-skill-eval
skill: my-skill
schemaVersion: "1.2"
version: "1.0.0"

config:
  trials: 3                    # 每个任务的试验次数
  max_attempts: 2              # 最大尝试次数
  timeout: 300                 # 超时时间（秒）
  parallel: 4                  # 并行任务数
  executor: mock               # 执行器: mock / copilot-sdk
  model: gpt-4                 # 模型选择

inputs:
  language: "zh-CN"            # 自定义变量

hooks:
  before:
    - run: "echo '开始评估'"
  after:
    - run: "echo '评估完成'"

mcp_mocks:                     # MCP 模拟服务器
  - name: filesystem
    command: ["npx", "mcp-server-fs", "/tmp/test"]

adversarial:                   # 对抗性测试
  - pack: prompt-injection
  - pack: scope-bypass

graders:
  - type: text                 # 文本匹配评估
    config:
      contains: "success"

tasks:
  - task: hello-world
    assert:
      - grading: text
        config:
          contains: "Hello"

  - task: file-operations
    assert:
      - grading: file
        config:
          path: "/tmp/output.txt"
          contains: "result"
```

---

## 设计哲学

### 核心理念

Waza 的设计哲学围绕以下几个核心原则：

#### 1. Schema 驱动（Schema-driven）

> **"版本管理显式化，读取时对相同主版本兼容，对不同主版本严格。"**

Waza 使用 `schemaVersion` 字段来明确版本，并提供 `waza migrate` 命令来自动迁移：

```yaml
# Schema 版本说明
schemaVersion: "1.2"
# 1.1 新增：per-turn checkpoints 和 normalized tool_events
# 1.2 新增：snapshot_path 和 adversarial block
```

#### 2. 快照式可复现性（Snapshot-based Determinism）

每个评估运行都会捕获完整的上下文快照，确保结果可以精确复现：

```
┌─────────────────────────────────────────────────────────────┐
│                    Snapshot & Replay 机制                      │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│   waza run → 捕获 Snapshot → 保存为 JSON                     │
│                    ↓                                         │
│   waza replay snapshot.json → 精确重现之前的运行结果           │
│                                                              │
│   包含：                                                      │
│   • 完整的环境状态                                            │
│   • Agent 响应历史                                            │
│   • 工具调用记录                                              │
│   • 评估结果                                                  │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

#### 3. CI-First 设计

Waza 从设计之初就考虑了 CI/CD 集成：

| CI 特性 | 实现 |
|--------|------|
| **Exit Codes** | 0=成功, 1=测试失败, 2=配置错误 |
| **Reporters** | JSON、JUnit XML 格式支持 |
| **阈值检查** | `waza tokens compare` 支持 CI 门控 |
| **自动化工作流** | `waza-eval.yml` 可复用模板 |

#### 4. 执行与评分分离

Waza 允许先运行评估，稍后再进行评分：

```bash
# 步骤 1：运行评估（跳过评分）
waza run eval.yaml --skip-graders --output results.json

# 步骤 2：稍后评分
waza grade results.json
```

#### 5. 合并安全（Merge-safe）

> **"--apply 操作永远不会在没有 --force 的情况下覆盖现有文件。"**

### 与传统测试框架的区别

| 维度 | Waza | 传统测试框架 |
|------|------|-------------|
| **测试对象** | AI Agent 技能 | 代码/函数 |
| **评估方式** | LLM-as-Judge + 多种 graders | 断言 |
| **不确定性** | 内置重试和快照机制 | 随机性难以控制 |
| **多模型对比** | 内置支持 | 需要手动实现 |
| **对抗性测试** | 内置故障注入 | 需额外工具 |
| **CI 集成** | 标准化 Exit Codes | 需适配 |

---

## 快速入门教程

### 安装 Waza

#### 方法一：二进制安装（推荐）

```bash
# Linux/macOS
curl -fsSL https://raw.githubusercontent.com/microsoft/waza/main/install.sh | bash

# Windows (PowerShell)
irm https://raw.githubusercontent.com/microsoft/waza/main/install.ps1 | iex
```

#### 方法二：从源码安装

```bash
# 前提条件：Go 1.26+ 和 Git LFS
git clone https://github.com/microsoft/waza.git
cd waza
git lfs install && git lfs pull
go build -o waza ./cmd/waza

# 添加到 PATH
export PATH=$PATH:$(pwd)
```

#### 方法三：Azure Developer CLI 扩展

```bash
azd ext source add -n waza -t url -l https://raw.githubusercontent.com/microsoft/waza/main/registry.json
azd ext install microsoft.azd.waza
```

### 快速开始流程

```bash
# 1. 初始化项目
waza init my-agent-project && cd my-agent-project

# 2. 创建新技能
waza new skill my-skill

# 3. 定义技能（编辑 skills/my-skill/SKILL.md）
# 4. 编写评估任务（编辑 evals/my-skill/tasks/*.yaml）
# 5. 运行评估
waza run my-skill

# 6. 检查技能就绪状态
waza check my-skill

# 7. 查看质量评分
waza quality my-skill
```

---

## 实战教程：构建技能评估套件

### 第一步：初始化项目

```bash
waza init waza-demo && cd waza-demo
```

这会创建标准目录结构：

```
waza-demo/
├── skills/                  # 技能定义目录
│   └── .gitkeep
├── evals/                   # 评估套件目录
│   └── .gitkeep
└── .waza.yaml              # 项目配置
```

### 第二步：创建技能

```bash
waza new skill calculator
```

生成的目录结构：

```
skills/calculator/
├── SKILL.md                 # 技能定义文件
└── prompts/
    └── default.md

evals/calculator/
├── eval.yaml                # 评估配置
└── tasks/
    └── tasks.csv            # 任务列表
```

### 第三步：编写 SKILL.md

```markdown
---
name: calculator
description: A calculator skill that performs basic arithmetic operations
triggers:
  - "calculate {{expression}}"
  - "what is {{a}} plus {{b}}"
  - "compute {{expression}}"
version: 1.0.0
---

# Calculator Skill

This skill provides basic arithmetic calculation capabilities.

## Supported Operations

- Addition: `a + b`
- Subtraction: `a - b`
- Multiplication: `a * b`
- Division: `a / b`

## Usage Examples

```
calculate 2 + 2  →  4
what is 10 minus 3  →  7
compute 5 * 6  →  30
```
```

### 第四步：编写评估任务

```yaml
# evals/calculator/tasks/basic-operations.yaml
- task: addition_test
  description: Test basic addition
  prompt: "Calculate 15 + 27"
  assert:
    - grading: text
      config:
        contains: "42"

- task: subtraction_test
  description: Test basic subtraction
  prompt: "What is 100 minus 37?"
  assert:
    - grading: text
      config:
        contains: "63"

- task: multiplication_test
  description: Test basic multiplication
  prompt: "Compute 8 times 9"
  assert:
    - grading: text
      config:
        contains: "72"
```

### 第五步：配置评估

```yaml
# evals/calculator/eval.yaml
name: calculator-eval
skill: calculator
schemaVersion: "1.2"
version: "1.0.0"

config:
  trials: 3
  max_attempts: 2
  timeout: 60
  executor: mock          # CI 环境使用 mock
  model: gpt-4            # 生产环境可换成 copilot-sdk

graders:
  - type: text
    config:
      contains: "{{expected}}"

tasks:
  - task: basic-operations
```

### 第六步：运行评估

```bash
# 运行评估
waza run calculator

# 输出结果
# ========================================
# Waza Eval Results
# ========================================
# Skill: calculator
# Total: 3 tests, 3 passed, 0 failed
# Success Rate: 100%
# ========================================

# 查看详细报告
cat results.json
```

### 第七步：检查技能就绪状态

```bash
waza check calculator
```

检查项目：
- ✅ SKILL.md 格式正确
- ✅ 触发器定义完整
- ✅ 评估覆盖充分
- ✅ Token 使用量合理

---

## 高级特性详解

### 1. LLM-as-Judge 评分

Waza 内置多种 LLM 评分维度：

```yaml
graders:
  - type: prompt
    model: gpt-4
    dimensions:
      - groundedness      # 答案是否基于上下文
      - helpfulness       # 答案是否有帮助
      - instruction_following  # 是否遵循指令
      - refusal_correctness   # 拒绝是否正确
      - tool_use_appropriateness  # 工具使用是否恰当
```

### 2. MCP 模拟服务器

实现无需网络依赖的隔离测试：

```yaml
mcp_mocks:
  - name: filesystem
    command: ["npx", "mcp-server-fs", "/tmp/test"]
    matches:
      - method: "filesystem/readFile"
        response:
          content: "mock file content"
```

### 3. 对抗性测试

内置故障注入包：

```yaml
adversarial:
  - pack: prompt-injection
    # 测试 prompt injection 攻击防护

  - pack: scope-bypass
    # 测试范围绕过攻击防护
```

运行对抗性测试：

```bash
waza adversarial --pack prompt-injection
```

### 4. 多模型对比

```bash
# 运行不同模型的评估
waza run eval.yaml --model gpt-4 --output gpt4-results.json
waza run eval.yaml --model claude-3 --output claude-results.json

# 对比结果
waza compare gpt4-results.json claude-results.json
```

### 5. Token 管理

```bash
# 计数 Token
waza tokens count skills/my-skill/SKILL.md

# 对比两个版本的 Token 使用
waza tokens compare main...feature-branch --threshold 1000

# 分析 Token 分布
waza tokens profile skills/my-skill/SKILL.md

# 获取优化建议
waza tokens suggest skills/my-skill/SKILL.md
```

### 6. 可视化仪表板

```bash
# 启动仪表板
waza serve

# 访问 http://localhost:8080 查看可视化结果
```

---

## CI/CD 集成详解

### GitHub Actions 工作流

#### 基础评估工作流

```yaml
# .github/workflows/waza-eval.yml
name: Waza Evaluation

on:
  pull_request:
    branches: [main]

jobs:
  evaluate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Install Waza
        run: |
          curl -fsSL https://raw.githubusercontent.com/microsoft/waza/main/install.sh | bash

      - name: Run Evaluation
        run: waza run evals/my-skill/eval.yaml --output results.json --executor mock

      - name: Upload Results
        uses: actions/upload-artifact@v4
        with:
          name: waza-results
          path: results.json

      - name: Gate on Failure
        if: failure()
        run: echo "Evaluation failed, blocking merge"
```

#### 自动合并门控

```yaml
# .github/workflows/auto-merge.yml
name: Auto Merge Gate

on:
  pull_request:
    types: [labeled]

jobs:
  gate:
    runs-on: ubuntu-latest
    if: contains(github.event.pull_request.labels.*.name, 'agent-merge')
    steps:
      - uses: actions/checkout@v4

      - name: Install Waza
        run: curl -fsSL https://raw.githubusercontent.com/microsoft/waza/main/install.sh | bash

      - name: Run Full Evaluation
        run: |
          waza run evals/ --executor copilot-sdk \
            --output full-results.json \
            --reporter json,junit

      - name: Check Success Rate
        run: |
          if (( $(cat full-results.json | jq '.summary.pass_rate') < 0.95 )); then
            echo "Pass rate below threshold"
            exit 1
          fi
```

---

## 评估器类型详解

### 内置 Graders

| 类型 | 用途 | 配置示例 |
|------|------|---------|
| **code** | Python/JS 断言 | `assert: "result == 42"` |
| **text** | 文本匹配 | `contains: "success"` |
| **file** | 文件验证 | `path: "/tmp/out.txt"` |
| **diff** | 工作区对比 | `snapshot_path: "./snapshots/"` |
| **behavior** | 行为约束 | `max_tokens: 1000` |
| **action_sequence** | 工具调用序列 | `expected: ["read", "write"]` |
| **skill_invocation** | 技能编排验证 | `skill: "sub-skill"` |
| **prompt** | LLM-as-Judge | `dimensions: ["groundedness"]` |
| **trigger_tests** | 触发器准确性 | `threshold: 0.8` |

### 远程 Grader 引用

```yaml
graders:
  - type: text
    ref: github.com/microsoft/waza/graders/text@v1.2.0
    config:
      contains: "{{expected}}"
```

---

## 归纳与总结

### 核心观点总结

#### 1. AI Agent 评估的标准化

Waza 最重要的贡献是**为 AI Agent 技能评估建立了标准化框架**：

> **"评估 AI Agent 不应该依赖于临时的、一次性的测试，而应该像代码测试一样，有标准化的规范、可复现的结果、和自动化的流程。"**

#### 2. 可复现性的重要性

在 AI Agent 评估中，**可复现性是一个核心挑战**。Waza 通过以下机制解决：

- Snapshot & Replay 捕获完整上下文
- 多次试验（trials）减少随机性影响
- Mock 执行器消除网络依赖

#### 3. CI-First 不仅是噱头

Waza 的 CI-First 设计意味着：

| 实践 | 价值 |
|------|------|
| Exit Codes | 构建系统可以直接判断成功/失败 |
| 标准 Reporters | 与现有 CI 工具无缝集成 |
| 阈值检查 | 自动门控，避免质量退化 |
| 自动化工作流 | 减少人工干预，降低出错概率 |

#### 4. 分离执行与评分

这种设计的优势：

- **灵活性**：可以先运行后评分，或跳过评分
- **效率**：同一套评估结果可用不同 graders 评分
- **调试**：可以单独分析执行或评分问题

### 适用场景

✅ **强烈推荐使用 Waza**：

- AI Agent 开发团队需要系统性评估
- 需要多模型对比的场景
- 对抗性测试需求（安全敏感应用）
- 需要 CI/CD 自动化的团队
- 需要标准化技能评估的企业

⚠️ **需要评估**：

- 简单的单 Agent 项目（可能过度设计）
- 非标准化评估需求（需要扩展 graders）
- 实时交互式应用（需要额外适配）

❌ **不太适合**：

- 纯理论研究（缺乏标准化定义）
- 一次性验证（维护成本不划算）

### 未来展望

Waza 作为一个活跃的开源项目，未来发展值得关注：

1. **更多 Graders**：社区贡献的新评估器类型
2. **云原生集成**：更深入的云平台支持
3. **可视化编辑器**：降低使用门槛的 GUI 工具
4. **ML 驱动的评分**：基于历史数据的学习型评分器

---

## 资源链接

### 官方资源

| 资源 | 链接 |
|------|------|
| 🌐 官方网站 | https://microsoft.github.io/waza/ |
| 💻 GitHub 仓库 | https://github.com/microsoft/waza |
| 📚 文档中心 | https://microsoft.github.io/waza/docs/ |
| 🐛 问题反馈 | https://github.com/microsoft/waza/issues |

### 安装资源

| 平台 | 安装命令 |
|------|---------|
| Linux/macOS | `curl -fsSL https://raw.githubusercontent.com/microsoft/waza/main/install.sh \| bash` |
| Windows | `irm https://raw.githubusercontent.com/microsoft/waza/main/install.ps1 \| iex` |
| 源码编译 | Go 1.26+ + `git lfs install && go build` |
| Azure Developer CLI | `azd ext install microsoft.azd.waza` |

### 学习资源

| 教程 | 说明 |
|------|------|
| Getting Started | 从 init 到 run 的完整演练 |
| Demo Guide | 7 个实战演示场景 |
| Grader Reference | 完整的 graders 类型和配置 |
| CI Integration | GitHub Actions 工作流集成 |

---

## 结语

Waza 代表了 **AI Agent 技能评估领域的一个重要里程碑**——它将原本零散、非标准的评估实践，转化为一个完整的、有标准的、可自动化的工作流程。

它的设计哲学提醒我们：**AI Agent 的质量保证需要像传统软件工程一样，建立在标准化、可量化、可复现的基础上**。

> **"Don't trust your AI agent without proper evaluation. Use Waza."**

---

*本文基于 Microsoft Waza 开源项目（MIT License）编写，相关信息来源于 GitHub 仓库和官方文档。*

**Sources:**
- [GitHub - microsoft/waza](https://github.com/microsoft/waza)
- [Waza Documentation](https://microsoft.github.io/waza/)
