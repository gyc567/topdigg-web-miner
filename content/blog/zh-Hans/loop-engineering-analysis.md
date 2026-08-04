---
title: "Loop Engineering 深度解析：停止提示词工程，设计让 AI 代理自主运行的循环系统"
description: "全面解析 Loop Engineering——Cobus Greyling 提出的 AI 代理循环工程框架。核心思想：你不需要再手动提示 AI，你需要设计一个自动提示 AI 的系统。包含五大构建块（自动化/调度、工作树、技能、插件/连接器、子代理）+ 记忆/状态，7 个生产级模式（每日分诊、PR 看护、CI 清扫、依赖清扫、变更日志起草、合并后清理、Issue 分诊），从 L1 报告到 L2 辅助修复到 L3 无人值守的渐进自治，以及完整的工具生态（loop-audit/loop-init/loop-cost/loop-sync/loop-context/loop-worktree/loop-gate/loop-sandbox/loop-swarm）。从核心思想、设计哲学、完整教程到功能清单，一文讲透。"
date: "2026-08-04"
author: "TopDigg Research Team"
tags: ["Loop Engineering", "AI Agent", "Automation", "Grok", "Claude Code", "Codex", "MCP", "DevTools", "Prompt Engineering"]
categories: ["Deep Dive"]
keywords: ["Loop Engineering", "AI 代理", "循环工程", "自动化", "Grok", "Claude Code", "Codex", "MCP", "技能", "工作树", "分诊", "自治"]
---

# Loop Engineering 深度解析：停止提示词工程，设计让 AI 代理自主运行的循环系统

> 核心思想：**你不需要再手动提示 AI——你需要设计一个自动提示 AI 的系统。** Peter Steinberger 说："你不应该再提示编码代理了。你应该设计循环来提示你的代理。" Boris Cherny（Anthropic Claude Code 负责人）说："我不再提示 Claude 了。我有运行中的循环在提示 Claude 并 figuring out 该做什么。我的工作是写循环。" Loop Engineering 是 Cobus Greyling 提出的 AI 代理循环工程框架，核心是**五大构建块**（自动化/调度、工作树、技能、插件/连接器、子代理）+ **记忆/状态**，配合 7 个生产级模式和从 L1 到 L3 的渐进自治，让 AI 代理从「需要人提示」变成「自主运行的系统」。

---

## 一、项目说明

### 1.1 它是什么？

**Loop Engineering** 是一个**AI 代理循环工程框架**——它不教你如何写更好的提示词，而是教你如何设计一个系统，让 AI 代理自主运行。核心定位：**从「提示词工程」到「循环工程」的范式转移**。

### 1.2 关键数据

- 储存库：`https://github.com/cobusgreyling/loop-engineering`
- 官网：`https://cobusgreyling.github.io/loop-engineering/`
- Stars：**9,838**
- Forks：**1,335**
- License：**MIT**
- 语言：**JavaScript**
- 作者：**Cobus Greyling**
- 创建时间：2026-06-09
- 生态系统：memory-engineering → loop-engineering → harness-foundry → outerloop → fleet-engineering

### 1.3 它解决什么问题？

传统 AI 辅助开发的痛点：每次都要手动写提示词，AI 不记得上次做了什么，没有质量反馈回路，无法安全地让 AI 自主修改代码。Loop Engineering 的答案：**设计一个循环系统**——定义调度频率、分诊逻辑、状态持久化、隔离执行、验证网关，让 AI 代理按照你设计的循环自主运行。

---

## 二、核心思想

### 2.1 从「提示词工程」到「循环工程」

传统做法：人写提示词 → AI 执行 → 人检查 → 人再写提示词。Loop Engineering 的做法：人设计循环 → 循环自动提示 AI → AI 自主执行 → 循环自动验证 → 循环自动记录。**人从「提示者」变成「系统设计者」**。

### 2.2 五大构建块 + 记忆

| 构建块 | 在循环中的职责 |
|--------|--------------|
| **自动化/调度** | 按节奏发现和分诊 |
| **工作树** | 安全的并行执行 |
| **技能** | 持久化的项目知识 |
| **插件/连接器** | 连接真实工具（MCP） |
| **子代理** | 制作/检查分离 |
| **+ 记忆/状态** | 超越对话的持久化脊柱 |

### 2.3 七个生产级模式

- **Daily Triage（每日分诊）**：1天-2小时节奏，L1 报告，低 token 成本
- **PR Babysitter（PR 看护）**：5-15分钟节奏，L1 监控，高 token 成本
- **CI Sweeper（CI 清扫）**：5-15分钟节奏，L2 谨慎修复，极高 token 成本
- **Dependency Sweeper（依赖清扫）**：6小时-1天节奏，L2 仅补丁，中等 token 成本
- **Changelog Drafter（变更日志起草）**：1天或 tag 节奏，L1 草稿，低 token 成本
- **Post-Merge Cleanup（合并后清理）**：1天-6小时节奏，L1 低峰期，低 token 成本
- **Issue Triage（Issue 分诊）**：2小时-1天节奏，L1 仅提议，低 token 成本

### 2.4 渐进自治：L1 → L2 → L3

- **L1 报告**：AI 只报告发现，不自动修复（第一周规则）
- **L2 辅助修复**：AI 在隔离工作树中尝试修复，需要验证器确认
- **L3 无人值守**：AI 自主修复并自动合并，需要预算和门控

### 2.5 Loop Ready 评分

`loop-audit` 给你的循环系统打分 0-100，告诉你哪里还需要改进。分数 ≥ 80 时，建议将循环版本化为 harness-foundry 运行时栈。

---

## 三、设计哲学

### 3.1 「设计系统，而不是写提示词」

这是 Loop Engineering 最深刻的设计哲学。Boris Cherny 说："我的工作是写循环。" 这意味着 AI 工程师的价值不再是写更好的提示词，而是设计更好的控制系统。循环是可复用、可版本化、可审计的——而提示词是一次性的。

### 3.2 「第一周只报告，不修复」

这是 Loop Engineering 的安全哲学。新系统上线第一周，AI 只能报告发现，不能自动修复。这给了人类足够的时间理解循环的行为，建立信任，然后再逐步放开权限。

### 3.3 「记忆是超越对话的脊柱」

没有记忆的 AI 代理每次对话都从零开始。Loop Engineering 通过 STATE.md、loop-budget.md、loop-run-log.md 等文件，让 AI 代理拥有跨会话的持久化记忆——它记得上次做了什么、预算是多少、哪些文件被锁定了。

### 3.4 「验证比生成更重要」

每个循环都有验证器子代理——它不信任制作器子代理的输出，而是独立验证。这与 sentrux 的理念一致：验证比生成更有价值。

### 3.5 「渐进式信任」

L1 → L2 → L3 不是技术升级，而是信任升级。每一步都需要人类确认系统值得更多自治。这不是保守，而是务实。

---

## 四、详细教程

### 4.1 五分钟快速开始

**Step 1：选择你的痛点**

不确定选哪个模式？用交互式模式选择器：`https://cobusgreyling.github.io/loop-engineering/#interactive`

或者从 Daily Triage 开始——低风险，学习循环纪律。

**Step 2：在你的仓库中脚手架**

```bash
# 统一 CLI（推荐）
npx @cobusgreyling/loop init . --pattern daily-triage --tool grok

# 一次健康检查（审计 + 同步 + 前 3 个行动）
npx @cobusgreyling/loop doctor .

# 旧版 CLI（仍然完全支持）
npx @cobusgreyling/loop-init . --pattern daily-triage --tool grok
```

支持的工具：`grok`（默认）、`claude`、`codex`、`opencode`。`cursor`、`windsurf`、`openclaw` 需要手动复制。

**Step 3：检查成本**

```bash
npx @cobusgreyling/loop cost --pattern daily-triage --level L1 --cadence 1d
```

高频循环（如 CI Sweeper 每 5 分钟）会快速消耗 token——降低频率或先要求早期退出分诊。

**Step 4：审计就绪度**

```bash
npx @cobusgreyling/loop doctor .
# 或单独审计
npx @cobusgreyling/loop audit . --suggest
```

分数 0-100，附带具体改进建议。分数 ≥ 80 时建议版本化为 harness-foundry。

**Step 5：运行你的第一个循环——只报告**

Grok：
```bash
/loop 1d Run loop-triage. Update STATE.md. No auto-fix in week one.
```

Claude Code：
```bash
/loop 1d Run $loop-triage. Read STATE.md. Merge findings into High Priority and Watch List. Update Last run. Do not edit code.
```

**Step 6：读取输出，提交状态**

打开 `STATE.md`。循环是否捕获了真实的优先级？编辑错误的部分——你仍然是工程师。

### 4.2 循环的完整生命周期

```
调度 → 分诊技能 → 读写状态 → 隔离工作树 → 制作器子代理 → 验证器子代理 → MCP/Git/Tickets → 人类门控
```

### 4.3 L2：隔离修复尝试

```bash
# 为一次修复尝试创建隔离工作树
npx @cobusgreyling/loop-worktree create --run-id pr-217-fix-1 --pattern pr-babysitter

# 验证器拒绝——标记为清理
npx @cobusgreyling/loop-worktree mark --run-id pr-217-fix-1 --status rejected

# 清理超过 24 小时的已拒绝/已升级工作树
npx @cobusgreyling/loop-worktree cleanup --older-than 24h
```

### 4.4 断路器（L2+ 循环）

```bash
npx @cobusgreyling/loop context --check --ledger loop-ledger.json
# 退出 0 = 继续 · 退出 2 = 升级给人类
```

断路器在最大迭代数、相同错误重复 N 次、连续失败过多或 token 预算上限时触发。

### 4.5 门控配置

在仓库根目录创建 `gate.yaml`：

```yaml
version: 1
denylist:
  - "src/auth/**"
  - "**/*.env"
autoMergeAllowlist:
  - "docs/**"
  - "**/*.md"
```

```bash
npx @cobusgreyling/loop gate check --action auto-merge --paths <f1,f2,...>
# 退出 0 = 允许 · 退出 2 = 升级给人类
```

---

## 五、工具生态

- **loop**：统一 CLI 入口（init/doctor/status/audit/cost）
- **loop-audit**：循环就绪度评分 CLI（0-100）
- **loop-init**：脚手架 + 预算/运行日志 + 约束
- **loop-cost**：token 消耗估算器
- **loop-sync**：STATE.md 和 LOOP.md 之间的漂移检测
- **loop-context**：有状态记忆管理器 + 断路器
- **loop-mcp-server**：MCP 运行时查找（模式/技能/状态）
- **loop-worktree**：每个修复尝试的隔离 git 工作树
- **loop-gate**：路径拒绝列表 + 自动合并允许列表的机械化执行
- **loop-sandbox**：临时 git 工作树隔离 + 补丁捕获
- **loop-action**：GitHub Composite Action，用于在 CI 中运行循环
- **loop-swarm**：多代理共识沙箱（N 次顺序运行，多数一致才通过）

---

## 六、归纳总结（观点与结论）

1. **「写循环」比「写提示词」更有杠杆效应。** 提示词是一次性的——用完就扔。循环是可复用、可版本化、可审计的系统。Boris Cherny 说"我的工作是写循环"，这标志着 AI 工程师的价值从「提示者」转向「系统设计者」。

2. **渐进式信任是唯一安全的自治路径。** L1 → L2 → L3 不是技术升级，而是信任升级。第一周只报告，第二周尝试修复，第三周才考虑无人值守。这种渐进式方法让人类在每一步都有机会验证系统的行为。

3. **记忆是 AI 代理的「脊柱」。** 没有记忆的 AI 代理每次对话都从零开始——它不记得上次做了什么、预算是多少。Loop Engineering 通过 STATE.md、loop-budget.md 等文件，让 AI 代理拥有跨会话的持久化记忆。

4. **验证器是信任的基石。** 每个循环都有制作器和验证器两个子代理——验证器不信任制作器的输出，而是独立验证。这种「制作/检查分离」是安全自治的基础。

5. **token 成本是真实的约束。** 高频循环（如 CI Sweeper 每 5 分钟）会快速消耗 token。Loop Engineering 通过 loop-cost 估算器和 loop-budget 预算文件，让 token 成本变得可见和可控。

6. **生态系统思维。** Loop Engineering 不是一个孤立的工具——它是 memory-engineering → loop-engineering → harness-foundry → outerloop → fleet-engineering 生态系统的一部分。每一层解决一个不同维度的问题：记忆、模式、运行时、治理、群体。

---

## 参考资料

- 储存库：`https://github.com/cobusgreyling/loop-engineering`
- 官网：`https://cobusgreyling.github.io/loop-engineering/`
- 原文：`https://cobusgreyling.substack.com/p/loop-engineering`
- Addy Osmani 评论：`https://addyosmani.com/blog/loop-engineering/`
- 快速开始：`https://github.com/cobusgreyling/loop-engineering/blob/main/docs/QUICKSTART.md`
- 模式注册表：`https://github.com/cobusgreyling/loop-engineering/blob/main/patterns/registry.yaml`