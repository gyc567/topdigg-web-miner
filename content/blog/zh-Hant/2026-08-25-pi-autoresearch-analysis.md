---
title: "pi-autoresearch实战指南：让AI成为你的自动化优化引擎"
date: "2026-08-25"
description: "详解pi-autoresearch项目，一个让AI Agent自主进行自动化优化的扩展，支持测试速度、Bundle大小、LLM训练等任意优化目标"
tags:
  - AI Agent
  - pi-autoresearch
  - 自动化优化
  - Karpathy
  - 实验循环
categories:
  - AI工具使用
  - 自动化优化
---

---

## 一、项目介绍：从Karpathy的灵感出发

2026年初，Andrej Karpathy 开源了 [karpathy/autoresearch](https://github.com/karpathy/autoresearch)，提出了一个极简但强大的理念：**让AI代理自主进行真实的LLM研究，取代人类手动调参。** 核心机制极为克制：单GPU + 单文件train.py + 5分钟硬预算 + 只有一个指标（val_bpb）。

这个思路迅速在AI社区引发共鸣——与其让人调参，不如让AI自己调参，睡觉的时候也在跑实验。

**pi-autoresearch** 正是这一理念的继承者与扩展者。它是 [pi](https://pi.dev/)（一个运行在终端的AI编码Agent）的扩展，为其赋予自动化优化循环的能力。但与原版不同，pi-autoresearch 将这个框架**泛化到了任意优化目标**——不再局限于LLM训练，而是可以优化测试速度、Bundle大小、构建时间、Lighthouse评分等任何可量化的指标。

项目目前已在GitHub获得约7K星，由 Earendil 主导维护，社区活跃、版本迭代频繁。

---

## 二、核心功能详解：三个工具、一个Skill、一套命令

### 2.1 Extension提供的三个核心工具

pi-autoresearch 作为一个 Extension（扩展），全局安装后为pi Agent提供三个底层工具：

| 工具 | 职责 |
|------|------|
| `init_experiment` | 一次性会话配置——定义实验名称、指标、单位和方向（越高越好还是越低越好） |
| `run_experiment` | 执行任意命令，计时（wall-clock），捕获输出 |
| `log_experiment` | 记录结果，自动执行git commit，更新widget和dashboard |

这三个工具是领域无关的通用基础设施，它们只负责"跑命令-记录结果"，而不关心你在优化什么。

### 2.2 Skill：autoresearch-create

Extension 提供了底座，但真正启动一个优化会话需要靠 **Skill**——也就是 `/skill:autoresearch-create`。

这个Skill会向你询问（或从上下文推断）几个关键问题：

- **优化目标是什么？**（如：单元测试运行时间）
- **用哪个命令测量？**（如：`pnpm test`）
- **指标是什么，单位是什么，方向是什么？**（如：秒数，越低越好）
- **哪些文件在优化范围内？**

确认后，它会自动创建两个核心文件并立即启动循环：

```
autoresearch.md      ← 会话文档：目标、已尝试、死亡路径、关键突破
autoresearch.sh      ← 基准测试脚本：预检→跑工作负载→输出 METRIC name=number
```

### 2.3 /autoresearch 命令

| 子命令 | 说明 |
|--------|------|
| `/autoresearch <text>` | 进入autoresearch模式。若会话已存在则恢复循环；否则初始化新会话 |
| `/autoresearch off` | 退出autoresearch模式，停止自动恢复但保留历史记录 |
| `/autoresearch clear` | 清空所有状态，重新开始 |
| `/autoresearch export` | 在浏览器打开实时dashboard，支持图表和分享卡片 |

### 2.4 快捷操作

| 快捷键 | 功能 |
|--------|------|
| `Ctrl+Shift+T` | 切换dashboard展开/折叠（inline widget ↔ 完整结果表格） |
| `Ctrl+Shift+F` | 全屏滚动dashboard overlay，支持 vim 风格导航（j/k/PageUp/PageDown/g/G） |

---

## 三、工作流程解析：自动循环的秘密

这是整个系统最精彩的部分。一旦 `/autoresearch` 启动，Agent 会进入一个**完全自主的无限循环**：

```
┌─────────────────────────────────────────────────────────┐
│                    自动化优化循环                         │
│                                                         │
│   ┌──────────┐    ┌──────────────┐    ┌─────────────┐  │
│   │   edit   │───▶│   commit     │───▶│run_experiment│  │
│   │ (改代码)  │    │ (提交变更)    │    │ (跑实验)     │  │
│   └──────────┘    └──────────────┘    └──────┬──────┘  │
│                                              │         │
│   ┌──────────┐    ┌──────────────┐    ┌──────▼──────┐  │
│   │   keep   │◀───│log_experiment│◀───│   测量结果    │  │
│   │ (保留)    │    │ (记录+决策)   │    │             │  │
│   └────┬─────┘    └──────────────┘    └─────────────┘  │
│        │                                               │
│        │ regress                                        │
│        ↓                                               │
│   ┌──────────┐                                        │
│   │  revert  │                                        │
│   │ (回退)   │─────────────────────────────────────────┘
│   └──────────┘
└─────────────────────────────────────────────────────────┘
```

### 每一步的详细逻辑

**Step 1: edit**
Agent 根据上下文和 `.auto/prompt.md` 中的历史记录，想出一个优化想法，然后编辑代码。

**Step 2: commit**
将变更提交到git，commit message 描述这次改动的内容。

**Step 3: run_experiment**
执行 `autoresearch.sh`（或 `.auto/measure.sh`），计时并捕获输出，提取 `METRIC name=number` 格式的指标值。

**Step 4: log_experiment**
- 如果指标**改善** → 自动 commit → 标记为 `kept`
- 如果指标**退化** → revert 这次 commit → 标记为 `discarded`
- 如果运行**崩溃** → revert → 标记为 `crashed`

**Step 5: 循环**
回到 Step 1，Agent 读取更新后的 `.auto/prompt.md`（记录了所有已尝试的方案）和 `.auto/log.jsonl`（所有实验结果），规划下一步。

### 持久化设计：不怕Context重置

这个循环最厉害的地方在于**完全不怕 Context Window 重置或 Agent 重启**。因为所有状态都存在两个文件里：

| 文件 | 作用 |
|------|------|
| `.auto/log.jsonl` | 追加日志，每行一次实验（指标、状态、commit、描述） |
| `.auto/prompt.md` | 活的会话文档：目标、已尝试什么、哪些路走不通、关键突破 |

一个新启动的 Agent，只要能读这两个文件，就能**完全恢复现场**，从上次中断的地方继续——不需要任何人类介入。

当 pi 的 auto-compaction（自动压缩）机制对会话历史进行摘要时，autoresearch 会检测到随后的空闲状态，自动重新读取 `.auto/prompt.md`、`.auto/log.jsonl` 的尾部、`git log` 等持久化数据，重新获得上下文继续运行。这整个过程**无需任何配置**。

---

## 四、设计哲学：Extension与Skill的优雅分离

pi-autoresearch 有一个非常精妙的设计理念：**extension是领域无关的基础设施，skill是领域知识的载体。**

```
┌──────────────────────────┐    ┌──────────────────────────────────┐
│   Extension（全局通用）     │    │      Skill（每个领域一个）        │
│                          │    │                                  │
│  run_experiment          │◄───│  command: pnpm test              │
│  log_experiment          │    │  metric: seconds (lower)         │
│  widget + dashboard      │    │  scope: vitest configs, src/     │
│  init_experiment         │    │  ideas: pool, parallel, cache…   │
└──────────────────────────┘    └──────────────────────────────────┘
```

这样做的好处是：**一个Extension服务无限个领域。** 你可以用它优化前端性能，换个Skill配置，又能拿来优化LLM训练流程。基础设施只需要装一次。

### 其他设计原则

**1. .auto 文件夹归一化**
所有会话文件统一放在项目根目录的 `.auto/` 子目录下——一个文件夹搞定保留、回退、gitignore和清理。遗产的 `autoresearch.*` 文件仍然被兼容读取。

**2. keep/revert 的语义一致性**
所有 `autoresearch.*` 相关文件（包括 hooks 和 checks）都会随 git revert 一起保留——因为这些文件是会话的一部分，不属于被优化的代码本身。

**3. 成本控制**
自动化循环可能消耗大量token。两种控制手段：
- **API Key限制**：在 provider 后台设置 per-key 预算
- **maxIterations**：在 `.auto/config.json` 中设置每会话最大实验次数

```json
{
  "maxIterations": 30
}
```

---

## 五、详细安装配置教程

### 前置要求

- 安装 [pi](https://pi.dev/)（在终端运行的AI编码Agent）
- 一个已配置好的 LLM Provider API Key（pi 支持多种模型）

### 方式一：自动安装（推荐）

```bash
pi install npm:pi-autoresearch
```

### 方式二：手动安装

```bash
# 1. 克隆或复制 extension 和 skills 到 pi 的配置目录
cp -r extensions/pi-autoresearch ~/.pi/agent/extensions/
cp -r skills/autoresearch-create ~/.pi/agent/skills/

# 2. 在 pi 中重载以加载新扩展
/reload
```

### 初始化第一个优化会话

```bash
# 启动 autoresearch-create skill，Agent会引导你完成配置
/skill:autoresearch-create
```

你也可以直接用命令启动：

```
/autoresearch optimize unit test runtime, monitor correctness
```

Agent 会自动推断你的目标、命令、指标和文件范围，创建必要的文件并立即开始运行。

### 可选配置文件

在会话目录创建 `.auto/config.json`（或 `autoresearch.config.json`，旧版兼容）来定制行为：

```json
{
  "workingDir": "/path/to/project",   // 优化目标项目路径（绝对或相对）
  "maxIterations": 50                  // 单会话最大实验次数
}
```

---

## 六、使用场景示例

pi-autoresearch 是**领域无关的**，任何可量化的优化目标都可以用它来自动化。以下是官方文档给出的参考场景：

### 场景1：测试速度优化

```
目标：缩短单元测试运行时间
指标：秒数（越低越好）
命令：pnpm test
```

适用于CI流水线优化、开发者本地TDD循环加速。

### 场景2：Bundle大小优化

```
目标：减少前端产物体积
指标：KB（越低越好）
命令：pnpm build && du -sb dist
```

可以配合代码分割、Tree-shaking、依赖替换等策略自动探索。

### 场景3：LLM训练优化

```
目标：降低验证集bits per byte
指标：val_bpb（越低越好）
命令：uv run train.py
```

这是 karpathy/autoresearch 的原始场景，pi-autoresearch 完全兼容这一流程。

### 场景4：构建速度优化

```
目标：加快生产构建时间
指标：秒数（越低越好）
命令：pnpm build
```

Webpack/Vite构建时间优化、CI缓存策略探索。

### 场景5：Lighthouse性能评分优化

```
目标：提升网页性能评分
指标：performance score（越高越好）
命令：lighthouse http://localhost:3000 --output=json
```

自动探索前端性能优化策略，从渲染阻塞到资源加载顺序。

---

## 七、置信度评分机制：基于MAD的噪声估计

在真实项目中，benchmark数据往往带有噪声——同一段代码跑两次，时间可能差个±5%。如果仅凭一次实验结果就决定keep还是revert，很可能做出错误判断。

pi-autoresearch 从**第3次实验开始**自动计算一个**置信度评分**，帮助Agent区分真实改进和噪声波动。

### 计算原理：Median Absolute Deviation (MAD)

1. 收集当前会话中**所有**指标值
2. 计算其中位数
3. 计算每个值与中位数的绝对偏差，再取这些偏差的中位数 → 得到 MAD（Median Absolute Deviation）
4. 置信度 = |最佳改进量| / MAD
5. 置信度 ≥ 2.0× 意味着最佳改进幅度是噪声水平的2倍以上

### 评分等级

| 置信度 | 颜色 | 含义 |
|--------|------|------|
| ≥ 2.0× | 🟢 绿色 | 改进很可能是真实的 |
| 1.0×–2.0× | 🟡 黄色 | 高于噪声，但属于边缘改进 |
| < 1.0× | 🔴 红色 | 在噪声范围内，建议重新运行确认 |

### 重要说明

- 置信度评分**仅作为参考**，永远**不会自动丢弃**实验
- Agent 会在低置信度时被引导**重新运行实验**以确认结果
- 置信度值会持久化到 `.auto/log.jsonl`，供后续分析

---

## 八、扩展能力：Backpressure Checks 与 Hooks

### 8.1 Backpressure Checks（反向压力检查）

创建 `.auto/checks.sh`（或 `autoresearch.checks.sh`），在每次 benchmark 通过后自动运行测试、类型检查、lint：

```bash
#!/bin/bash
set -euo pipefail
pnpm test --run
pnpm typecheck
pnpm lint
```

**工作逻辑：**
- 如果文件不存在 → 行为和之前完全一样
- 如果 benchmark 退出码为0 → 自动运行 checks.sh
- 如果 checks 失败 → 实验标记为 `checks_failed`，**不执行commit，回退变更**
- checks 的执行时间**不计入**主指标
- checks 有独立超时（默认300秒，可在 `run_experiment` 中配置）

这样确保了：**你优化的速度，但不会牺牲正确性。**

### 8.2 Hooks（生命周期钩子）

在 `.auto/hooks/` 目录下放置可执行脚本，让你在每次迭代的边界时刻注入自定义逻辑：

| 钩子 | 触发时机 | 用途建议 |
|------|----------|----------|
| `before.sh` | 每次迭代开始时（包括首次激活） | 获取外部研究、预加载上下文 |
| `after.sh` | 每次 `log_experiment` 完成后 | 记录学习、发送通知、git tagging |

**协议规范：**
- stdin 接收一个 JSON 行，包含 event 类型、会话状态、上一轮结果
- stdout 最多 8KB，会被作为 steer message 传递给 Agent（Agent看不到hook的存在，stdout只是一种隐式信号）
- 非零退出或 >30秒超时 → 向 Agent 发送错误提示
- 每次触发都会在 `.auto/log.jsonl` 中追加一条 `{"type":"hook", …}` 记录

**before.sh 示例输入：**

```json
{
  "event": "before",
  "cwd": "/path/to/workdir",
  "next_run": 6,
  "last_run": {
    "run": 5, "status": "discard", "metric": 42.1,
    "description": "尝试了缓存预热，但无效果",
    "asi": { "hypothesis": "缓存可能不适合这个场景", "next_focus": "算法层面" }
  },
  "session": {
    "metric_name": "total_ms", "metric_unit": "ms", "direction": "lower",
    "baseline_metric": 40.7, "best_metric": 33.5,
    "run_count": 5, "goal": "优化排序速度"
  }
}
```

**项目内置了10个参考钩子脚本**，涵盖：外部搜索、学习日志、Native通知、Git tagging、抗震荡、想法轮换、假设反思、上下文轮换等场景。

---

## 九、进阶操作：autoresearch-finalize

当你在一个分支上跑了大量实验（很多kept，很多discarded），这个分支可能很乱——多次提交、混在一起的变化。`/skill:autoresearch-finalize` 就是来解决这个问题的。

它会：
1. 读取 `.auto/log.jsonl`
2. 将所有 kept 实验按逻辑分组
3. 征求你的同意后，从 merge-base 创建**独立分支**
4. 每个分支只包含一个逻辑变更，commit message 包含指标改进

这样每个分支都可以独立review、独立merge，代码审查变得清晰可控。

---

## 十、一句话总结

> **pi-autoresearch = 让AI用实验驱动的方式，替你完成所有"试错-测量-决策"循环。**

以前：人调参 → AI训练 → 人判断
现在：AI调参 → AI训练 → AI判断改进还是回退 → 重复，直到人类满意

你只需要定义目标，剩下的——交给循环。

---

**配置示例速查表**

```json
// .auto/config.json
{
  "workingDir": "~/my-project",
  "maxIterations": 50
}
```

```bash
# .auto/checks.sh 示例
#!/bin/bash
set -euo pipefail
pnpm test --run
pnpm typecheck

# .auto/measure.sh 示例（benchmark脚本必须输出 METRIC name=number）
#!/bin/bash
pnpm test --run --reporter=json > /tmp/test-output.json
METRIC total_ms=$(cat /tmp/test-output.json | jq '.testDuration')
echo "METRIC total_ms=$METRIC total_ms"
```

---

以上，既然看到这里了，如果觉得不错，随手点个赞、在看、转发三连吧，如果想第一时间收到推送，也可以给我个星标，谢谢你看我的文章，我们，下次再见。

**首发于微信公众号「比特财商」。**
作者名：比特财商
