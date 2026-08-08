---
title: "GOAL.md 深度解析：让 AI Agent 自主改进代码的极简框架——只需给它一个数字"
description: "全面解析 GOAL.md——AutoHarness 项目提出的让 AI Agent 自主改进代码的文件格式。核心思想极其简单：写一个输出数字的评分脚本（Fitness Function），写一个 GOAL.md 文件定义目标和行动目录，让 Agent 自己想办法让分数变高。本文从核心概念（适应度函数、行动目录、改进循环、运行模式）、设计哲学、完整教程到实战示例，一文讲透如何用 GOAL.md 让 AI 代理成为自主的代码质量工程师。"
date: "2026-08-04"
author: "TopDigg Research Team"
tags: ["GOAL.md", "AutoHarness", "AI Agent", "Fitness Function", "Code Quality", "Autonomous Improvement", "Rust", "LLM"]
categories: ["Deep Dive"]
keywords: ["GOAL.md", "AutoHarness", "适应度函数", "Fitness Function", "AI Agent", "自主改进", "代码质量", "行动目录", "改进循环", "评分脚本"]
---

# GOAL.md 深度解析：让 AI Agent 自主改进代码的极简框架——只需给它一个数字

> 核心思想：**传统做法是人分析代码、列待办、逐个执行、手动验证——效率低且不可持续。GOAL.md 的答案是：你不需要告诉 AI 具体怎么做，你只需要告诉它「什么更好」。** 写一个输出数字的评分脚本（Fitness Function），写一个 GOAL.md 文件定义目标和行动目录，然后让 Agent 自己想办法让分数变高。Agent 会测量当前分数、选择最高影响的行动、执行改动、验证分数提高、记录到日志——形成一个自我驱动的改进循环。这是 AutoHarness 项目提出的「极简自主改进框架」——不是让 AI 写代码，而是让 AI **改进**代码。

---

## 一、项目说明

### 1.1 它是什么？

**GOAL.md** 是 AutoHarness 项目提出的一种**文件格式**，用于让 AI Agent 能够自主改进项目。它解决了一个核心问题：

> **"我想要这个项目变得更好，但我不确定该怎么做"**

传统做法：人分析代码 → 列待办 → 逐个执行 → 手动验证。GOAL.md 的做法：写评分脚本 → 写 GOAL.md → 让 Agent 自己想办法 → Agent 记录每次改动和分数变化。

### 1.2 关键概念

GOAL.md 的核心由四个组件构成：

- **Fitness Function（适应度函数）**：一个输出数字的脚本，衡量「项目有多好」
- **Action Catalog（行动目录）**：列出所有可能的改进行动及其预期影响
- **Improvement Loop（改进循环）**：测量 → 选择 → 执行 → 验证 → 记录 → 重复
- **Operating Mode（运行模式）**：Converge / Continuous / Supervised

### 1.3 它解决什么问题？

AI Agent 写代码很快，但它不知道「什么是更好的代码」。没有反馈回路，Agent 就像没有温度计的恒温器——它无法判断自己的改动是让代码变好了还是变差了。GOAL.md 用一个简单的数字解决了这个问题：**分数越高，项目越好**。Agent 的目标就是让这个数字变大。

---

## 二、核心思想

### 2.1 Fitness Function——用一个数字定义「好」

Fitness Function 是一个脚本，输出一个数字来衡量项目质量：

```bash
./scripts/score.sh
# 输出: 85 / 100
```

设计原则：

- **确定性**：相同输入必须产生相同输出
- **快速**：最好在 60 秒内完成
- **独立**：不依赖外部状态
- **可组合**：分数 = 各组件分数之和

常见组件：

- **format（格式）**：20 分 — `cargo fmt -- --check`
- **clippy（Lint）**：20 分 — `cargo clippy` 警告数
- **tests（测试）**：25 分 — `cargo test` 通过
- **docs（文档）**：15 分 — 文件检查
- **maintenance（维护）**：10 分 — 项目维护状态
- **safety（安全）**：10 分 — `unsafe` 代码检查

### 2.2 Action Catalog——告诉 Agent「你能做什么」

行动目录是一个表格，列出所有可能的改进行动及其预期影响：

- **运行 cargo fmt** — 影响 +20，执行 `cargo fmt`
- **修复 clippy 警告** — 影响 +10，执行 `cargo clippy --fix`
- **添加单元测试** — 影响 +10，为每个公共函数添加测试

Agent 会根据这个目录选择「影响最大」的行动优先执行。

### 2.3 Improvement Loop——自我驱动的改进

```
1. 测量当前分数
2. 选择最高影响的行动
3. 执行改动
4. 验证分数提高
5. 记录到日志
6. 重复
```

这个循环是自我驱动的——Agent 不需要人告诉它下一步做什么，它自己根据分数变化决定。

### 2.4 Operating Mode——三种运行策略

- **Converge**：达到目标分数后停止（适合有明确目标的改进）
- **Continuous**：持续运行直到中断（适合持续优化）
- **Supervised**：在关键点暂停等待确认（适合敏感代码审查）

---

## 三、设计哲学

### 3.1 「你不需要告诉 AI 怎么做，你只需要告诉它什么更好」

这是 GOAL.md 最深刻的设计哲学。传统做法是写详细的指令告诉 AI 每一步怎么做——但这限制了 AI 的创造力。GOAL.md 只定义「目标」（分数）和「边界」（约束），让 AI 自己探索最优路径。这就像给一个聪明的员工一个 KPI，而不是一份操作手册。

### 3.2 「反馈回路是一切自主系统的基础」

GOAL.md 的改进循环本质是一个反馈回路：测量 → 行动 → 再测量。没有反馈回路，自主系统就无法运作——它不知道自己的行动是否有效。GOAL.md 用一个简单的数字构建了这个反馈回路。

### 3.3 「确定性是信任的基础」

Fitness Function 必须是确定性的——相同输入产生相同输出。如果评分脚本每次运行结果不同，Agent 就无法信任它的反馈，整个系统就会崩溃。确定性是人与 AI 之间信任的基础。

### 3.4 「约束比指令更有效」

GOAL.md 不告诉 Agent 具体怎么做，而是定义约束（不要破坏现有功能、先格式后 lint、一个提交一个改动）。约束比指令更有效，因为它给了 AI 自由度，同时保证了安全性。

---

## 四、详细教程

### 4.1 五分钟快速开始

**Step 1：创建评分脚本**

```bash
mkdir -p scripts
cat > scripts/score.sh << 'EOF'
#!/bin/bash
set -uo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")/.." || exit 1

FORMAT_SCORE=0; CLIPPY_SCORE=0; TEST_SCORE=0

# 格式检查 (20分)
cargo fmt -- --check 2>/dev/null && FORMAT_SCORE=20

# Clippy 检查 (20分)
WARN_COUNT=$(cargo clippy 2>&1 | grep -c "warning:" || true)
[[ "$WARN_COUNT" -eq 0 ]] && CLIPPY_SCORE=20

# 测试检查 (20分)
cargo test 2>&1 | grep -q "test result: ok" && TEST_SCORE=20

TOTAL=$((FORMAT_SCORE + CLIPPY_SCORE + TEST_SCORE))
echo "Score: $TOTAL / 60"
EOF
chmod +x scripts/score.sh
```

**Step 2：创建 GOAL.md**

```markdown
# Goal: My Project - 提升代码质量

## Fitness Function

./scripts/score.sh

## Operating Mode

- [x] **Converge** — 达到目标时停止

Stop when:
- Score reaches 60/60
- 10 次迭代无改进

## Action Catalog

| Action | Impact | How |
|--------|--------|-----|
| cargo fmt | +20 | `cargo fmt` |
| Fix clippy warnings | +20 | `cargo clippy --fix` |
| Add unit tests | +20 | 为公共函数添加测试 |

## Constraints

1. 不要破坏现有功能
2. 先格式后 lint
3. 一个提交一个改动

## Iteration Log

File: `iterations.jsonl`
```

**Step 3：运行**

```bash
./scripts/score.sh
# Score: 20 / 60

# Agent 会自动执行改进
cargo fmt
./scripts/score.sh
# Score: 40 / 60

cargo clippy --fix
cargo fmt
./scripts/score.sh
# Score: 60 / 60
```

### 4.2 完整项目示例

假设你有一个 Rust CLI 工具，当前状态：

- 代码格式混乱
- 有一些 clippy 警告
- 缺少测试
- README 很简单

创建文件结构：

```
my-cli/
├── GOAL.md           # 目标定义
├── AGENTS.md         # Agent 指南
├── iterations.jsonl  # 迭代日志
├── scripts/
│   └── score.sh      # 评分脚本
├── src/
│   └── ...
└── Cargo.toml
```

### 4.3 迭代日志格式

每次改进后，记录到 `iterations.jsonl`：

```json
{"iteration":1,"component":"format","before":20,"after":40,"action":"cargo fmt"}
{"iteration":2,"component":"clippy","before":40,"after":60,"action":"cargo clippy --fix"}
```

### 4.4 JSON 输出格式

评分脚本支持 `--json` 参数：

```bash
./scripts/score.sh --json
# {"total":60,"max":60,"components":{"format":20,"clippy":20,"tests":20}}
```

### 4.5 Agent 自动识别

将 `GOAL.md` 和 `CLAUDE.md` 放到项目根目录，Agent 会自动识别并开始改进循环。

---

## 五、进阶模式

### 5.1 多 Agent 协作

多个 Agent 可以同时改进同一个项目，通过 `iterations.jsonl` 共享状态。

### 5.2 自定义组件

你可以添加任何评分组件：

```bash
# 安全检查 (10分)
UNSAFE_COUNT=$(grep -r "unsafe" src/ | wc -l)
[[ "$UNSAFE_COUNT" -eq 0 ]] && SAFETY_SCORE=10

# 文档检查 (10分)
[[ -f "README.md" ]] && DOC_SCORE=$((DOC_SCORE + 5))
[[ -f "AGENTS.md" ]] && DOC_SCORE=$((DOC_SCORE + 5))
```

### 5.3 超时处理

```bash
# 防止脚本卡住
TEST_OUTPUT=$(timeout 120 cargo test 2>&1 || true)
```

### 5.4 工具存在性检查

```bash
if command -v cargo-tarpaulin &>/dev/null; then
    COVERAGE=$(cargo tarpaulin --out json | jq '.line_percent')
else
    COVERAGE=0
fi
```

---

## 六、适用场景

- **代码质量改进** — 推荐模式 Converge，示例 Clippy 警告清理
- **性能优化** — 推荐模式 Continuous，示例 Benchmark 持续优化
- **安全审计** — 推荐模式 Supervised，示例敏感代码审查
- **文档完善** — 推荐模式 Converge，示例 README 编写
- **测试覆盖** — 推荐模式 Converge，示例添加单元测试
- **格式统一** — 推荐模式 Converge，示例代码格式化

---

## 七、归纳总结（观点与结论）

结合 GOAL.md 的设计与实现，几个值得思考的点：

1. **「给 AI 一个数字」比「给 AI 一份清单」更有效。** 传统做法是列出所有待办事项让 AI 逐个执行——但这限制了 AI 的创造力，也让 AI 无法自主判断优先级。GOAL.md 用一个数字（分数）定义了「什么是更好」，让 AI 自己探索最优路径。这就像给一个聪明的员工一个 KPI，而不是一份操作手册。

2. **反馈回路是自主系统的基石。** 没有反馈回路，自主系统就无法运作——它不知道自己的行动是否有效。GOAL.md 的改进循环（测量 → 行动 → 再测量）用最简单的方式构建了这个反馈回路。编译器在语法层关闭了反馈，测试套件在行为层关闭了，GOAL.md 在**架构质量层**关闭了。

3. **确定性是人与 AI 信任的基础。** 如果评分脚本每次运行结果不同，Agent 就无法信任它的反馈。GOAL.md 要求 Fitness Function 是确定性的——这不只是技术要求，更是信任要求。人必须能预测 AI 看到的反馈，才能信任 AI 的决策。

4. **约束比指令更有效。** GOAL.md 不告诉 Agent 具体怎么做，而是定义约束（不要破坏现有功能、先格式后 lint）。约束给了 AI 自由度，同时保证了安全性。这与人类管理的智慧一致：好的管理者定义边界，而不是 micromanage。

5. **极简主义的力量。** GOAL.md 的核心只有四个组件：一个评分脚本、一个目标文件、一个行动目录、一个迭代日志。没有复杂的配置，没有庞大的框架——只有最必要的部分。这种极简主义让 GOAL.md 可以在任何项目中立即使用。

6. **从「写代码」到「改进代码」的范式转移。** 传统 AI 辅助编程关注「如何让 AI 写出更好的代码」；GOAL.md 关注「如何让 AI 改进已有的代码」。这是一个微妙但深刻的转变——代码库不是从零开始的，AI 的价值不只是生成新代码，更是持续改进现有代码。

---

## 参考资料

- AutoHarness 仓库：`https://github.com/gyc567/AutoHarness`
- AutoHarness 论文：`https://arxiv.org/abs/2603.03329`
- GOAL.md 教程：`https://github.com/gyc567/AutoHarness/tree/main/docs/goal-md/tutorial-cn`
- GOAL.md 模板：`https://github.com/gyc567/AutoHarness/blob/main/template/GOAL.md`