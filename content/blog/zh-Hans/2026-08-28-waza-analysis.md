---
title: 'Waza 深度解析：把工程习惯变成 AI Agent 的肌肉记忆'
date: "2026-08-28"
description: "深入解析 tw93/Waza：8个Slash命令将工程习惯转化为AI Agent可执行的技能。涵盖/think决策验证、/hunt根因排查、/check代码审查、/ui界面设计、/learn研究流程、/read文档读取、/write文本润色、/health健康审计。设计哲学：约束即自由、结构化即效率。三部曲之作：Kaku写代码、Waza练习惯、Kami出文档。"
tags:
  - Waza
  - Claude Code
  - Codex
  - AI Agent
  - 工程习惯
  - Slash命令
  - Agent技能
  - tw93
  - Skills
  - Cursor
categories:
  - 深度解析
  - AI工具
  - 开源项目
  - Agent技能
---

# Waza 深度解析：把工程习惯变成 AI Agent 的肌肉记忆

做过多年工程的人都有这样的肌肉记忆：动手之前先想清楚，出了问题先追根因，提交之前自己review一遍。这些习惯靠的不是天赋，而是反复练习形成的条件反射。

问题是：AI Agent 时代，这些习惯谁来练？

**Waza** 回答了这个问题。它是一个 AI Agent 技能集，由开发者 **tw93**（也就是知名开源项目 Pake 的作者）创建。Waza 将工程师真正需要的8个工程习惯，做成了8个可以随时调用的 Slash 命令，让 AI Agent 在执行任务时也能遵循那些人类工程师花了多年才内化的行为准则。

这个名字来自日语"技"（わざ/Waza），意为：反复练习直到变成本能的动作。

---

## 1. 背景：AI Agent 为什么需要工程习惯？

当你第一次用 Claude Code 或者类似的 AI 编程工具时，体验往往是惊艳的——它能写代码、跑测试、读文档、提交 PR。但用过一段时间后会发现一个尴尬的现象：**工具越来越强，但输出质量却开始下降**。

这不是模型的问题，而是约束的问题。

### 1.1 失控的输出

典型的失控场景是这样的：

- 任务是一个简单的 API 修改，结果 Agent 改了 8 个文件，其中 5 个跟原需求完全无关
- 遇到了一个 bug，Agent 连换了 4 种"可能有效"的修复方式，每种都没跑通就换下一种
- 要发布一个新功能，代码写完了才发现项目文档根本没更新，测试覆盖率反而下降了

这些问题不是"AI 能力不够"，而是 **AI 缺乏人类工程师在多年实践中形成的结构性约束**。人类工程师在动手前会先想清楚"这个问题是什么"、"有没有官方的解决方案"、"如果改错了回滚代价是什么"——这些行为在人类看来是常识，但在 AI Agent 的执行循环里，如果不显式注入，它们就是会缺席。

### 1.2 Waza 出现之前的解法

在 Waza 出现之前，社区尝试过几种方向：

- **增加更多的 Tools 和 MCP**：让 Agent 有更多可以调用的能力，但工具越多选择噪音越大
- **写更长的 CLAUDE.md**：塞入大量项目规则和上下文，但上下文窗口是有限的，规则越多互相冲突的可能性越高
- **使用 Subagent 做并行研究**：提升了效率，但子 Agent 的质量无法保证

这些方向都不是错的，但它们都忽略了关键的一点：**工程习惯不是工具，也不是规则，而是一套经过验证的工作流程**。

Waza 的思路是：不要给 AI 更多能力，而是给 AI 更清晰的结构。

---

## 2. 设计哲学：约束即自由

Waza 的设计哲学浓缩在一句话里：**一个好的工程师做的不仅仅是写代码。他们会质疑需求、追根溯源、review 自己的 diff、读一手资料。AI 有执行所有这些任务的原始能力，但没有结构，这些输出就会流于泛泛、精度不够。**

理解这个哲学，需要从三个维度来看 Waza 的设计选择：

### 维度一：少即是多（Less is More）

市面上有很多"AI 全套工具箱"类的项目——Superpowers、gstack、skurg 等——功能强大但太重。Waza 的选择是：**只做 8 个技能，而且每个技能只有一个触发场景**。

这 8 个技能对应了工程师最高频的 8 个行为时刻：
- 写代码之前 → /think
- 写前端界面时 → /ui
- 提交代码之前 → /check
- 排查 bug 时 → /hunt
- 写文章时 → /write
- 调研新领域时 → /learn
- 读文档/网页时 → /read
- 审计 Agent 健康时 → /health

不多不少，刚刚好。

### 维度二：结构即效率（Structure is Efficiency）

每个技能都是一个完整的执行包，包含：
- **触发场景描述**（when_to_use）：告诉 AI 什么时候该调用这个技能
- **结果契约**（Outcome Contract）：明确技能执行完毕后"完成"意味着什么
- **操作步骤**：清晰的执行流程
- **红线**（Hard Rules）：绝对不能做的事
- **Gotchas**：来自真实失败案例的经验教训

以 /hunt（根因排查）为例，它的核心红线是：**在能用一句话描述根因之前，不允许修改任何代码**。这条约束直接针对的是 AI Agent 最常见的坏习惯——看到错误就开始尝试各种修复，而不是先搞清楚"问题到底是什么"。

### 维度三：项目感知（Project-Aware）

Waza 不仅仅是一套通用的工程习惯模板。它在运行时通过读取目标仓库的公开上下文（README、package manifests、Makefile、CI workflow 等），自动将通用技能适配到具体项目中。这种"通用 + 项目感知"的组合，让 Waza 既能跨项目使用，又不会产生项目规则冲突。

---

## 3. 八大技能详解

### 3.1 /think —— 设计验证先于编码

**触发时机**：任何需要出方案、做架构设计、可行性分析、价值判断的场景

**核心原则**：在写第一行代码之前，先把计划变成可执行的决策完整方案。

这是 Waza 中最复杂的技能，因为它要处理的场景跨度最大：既支持快速方案评估（Lightweight Mode），也支持复杂的产品价值判断（Evaluation Mode），还支持需求优先级分类（Triage Mode）。

**关键约束**：
- 计划中没有 placeholder。每个步骤必须是具体的，不允许"TBD"、"后续实现"这类承诺
- 每个阶段必须可以独立合并。如果 Phase 1 需要等 Phase 2 才能有用，那这不是分阶段，而是伪分阶段
- 列出最脆弱的假设。如果这个假设不成立，需要说明后果

**典型工作流**：
```
/think → 审核方案 → "implement X" → /check → merge
```

### 3.2 /hunt —— 根因确认先于修复

**触发时机**：任何 bug、回归、异常行为

**核心原则**：A patch applied to a symptom creates a new bug somewhere else.（对症状打补丁会在别处制造新的 bug。）

**关键约束**：
- 在能用一句话描述根因之前，不允许修改代码
- 同一个症状，修复后又出现 → 立即停止，重新从执行路径推导
- 三个假设都被推翻 → 停止，整理已知信息，用 Handoff 格式交接
- 调了三次魔数（spacing/size/threshold）仍然不对 → 问题结构不是数值问题，是缺少约束

**Runtime Evidence Ladder**（运行时证据阶梯）：
1. 源码追溯：精确到函数名、文件名、行号
2. 确定性复现：最小可复现命令
3. 日志/状态/缓存：证明路径被触达的运行时证据
4. 构建/测试：验证修复
5. 真实运行时检查：对于 UI/原生应用，必须截图验证

### 3.3 /check —— 审查先于发布

**触发时机**：代码审查、合并前检查、发布决策、issue/PR 分类

**核心原则**：Review is report-only（审查只提供报告，不主动修改，除非当前轮次明确授权）。

**工作树安全检查**（Worktree Safety Preflight）：
- 在做任何审查之前，先运行 `git status --short --branch -uall`
- 不做这些操作作为默认审查步骤：`git switch`、`git checkout`、`git reset --hard`、`git clean`、`git stash -u`
- 不把用户的 WIP 文件移动到 /tmp 或其他暂存目录

**Scope Blast Mode**（范围爆破模式）：
修复了一个根因模式之后、宣布完成之前，要主动检查"同样的问题是否还藏在其他地方"。提取 pattern signature，用 grep -rn 在全仓库搜索同类 bug。

### 3.4 /ui —— 界面设计而非界面实现

**触发时机**：构建前端界面

**核心原则**：不是生成一个"能用"的界面，而是生成一个"有辨识度"的界面。包含截图驱动的美学迭代，以及一个明确的审美方向，而不是泛泛的默认值。

### 3.5 /learn —— 六阶段研究工作流

**触发时机**：进入一个陌生领域

**六阶段流程**：
1. **Collect**：收集相关资料
2. **Digest**：消化理解
3. **Outline**：构建大纲
4. **Fill in**：填入细节
5. **Refine**：精炼打磨
6. **Self-review and publish**：自我审查后发布

典型工作流：
```
/read（抓取资料）→ /learn（综合分析）→ /write（润色发布）
```

### 3.6 /read —— 平台感知的文档读取

**触发时机**：任何 URL 或 PDF

**核心原则**：根据不同的平台自动路由。普通读取返回简洁摘要；如果是要求转换、引用、引用、保存或供下游工作时使用，则输出 Markdown 格式。

### 3.7 /write —— 自然写作而非公式写作

**触发时机**：写作或修改文本内容

**核心原则**：重写文本，使其在中文和英文中都听起来自然。去掉生硬的、公式化的措辞。**不生成你觉得好，而是生成读者觉得好。**

### 3.8 /health —— Agent 健康审计

**触发时机**：审计 Agent 健康状态

这个技能源自 tw93 在 2026 年 3 月发布的另一篇文章《You Don't Know Claude Code》，其中提出了一个六层 Agent 框架：

| 层级 | 职责 |
|------|------|
| CLAUDE.md / rules / memory | 长期上下文，定义"这是什么" |
| Tools / MCP | 行动能力，定义"我能做什么" |
| Skills | 按需加载的方法论，定义"怎么做" |
| Hooks | 不依赖模型判断的强制行为 |
| Subagents | 上下文隔离的worker，用于可控的自主性 |
| Verifiers | 验证循环，使输出可测试、可回滚、可审计 |

/health 技能检查这六层的完整性，在深度检查之前先做一个预算感知的总结性通过。

---

## 4. 安装与使用教程

### 4.1 快速安装（一条命令装完所有8个技能）

```bash
npx skills add tw93/Waza -a claude-code codex cursor antigravity-cli -g -y
```

这条命令做了三件事：
1. 在 `~/.agents/skills` 目录安装 Waza（跨 Agent 共享）
2. 在 Claude Code 中创建符号链接
3. 自动安装适用于 Codex、Cursor、Kimi Code CLI、Amp、Cline、Antigravity CLI 等 Agent

### 4.2 更新

```bash
npx skills update -g -y
```

### 4.3 原生插件方式安装

**Claude Code**：
```bash
/plugin marketplace add tw93/Waza
/plugin install waza@waza
# 之后用这个命令更新
claude plugin update waza
```

**Codex**：
```bash
codex plugin marketplace add tw93/Waza
codex plugin add waza@waza
```

**Claude Desktop**：下载 [waza.zip](https://github.com/tw93/Waza/releases/latest/download/waza.zip)，然后 Customize > Skills > "+" > Create skill，上传 ZIP。

**Pi**：
```bash
pi install npm:@tw93/waza
# 更新
pi update npm:@tw93/waza
```

### 4.4 卸载

```bash
npx skills remove tw93/Waza -g
rm -f ~/.claude/statusline.sh
rm -f ~/.claude/rules/english.md
rm -f ~/.claude/rules/anti-patterns.md
rm -f ~/.claude/rules/waza-routing.md
```

### 4.5 技能链接示例

```
功能规划: /think → 审核方案 → say "implement X" → /check → merge
修复发布: /hunt → 修复 → /check → release/publish/push/issue 跟进
研究写作: /read（抓取资料）→ /learn（综合分析）→ /write（润色发布）
调试验证: /hunt（找根因）→ 修复 → /check（review 变更）
```

### 4.6 增强组件：状态栏

安装一个极简的状态栏，显示上下文窗口、5小时配额和7天配额，颜色编码，无进度条无噪音：

```bash
(
  set -e
  WAZA_STATUSLINE_SCRIPT="$(mktemp -t waza-statusline.XXXXXX)"
  trap 'rm -f "$WAZA_STATUSLINE_SCRIPT"' EXIT
  curl -fL https://github.com/tw93/Waza/releases/latest/download/setup-statusline.sh -o "$WAZA_STATUSLINE_SCRIPT"
  # 先 review: less "$WAZA_STATUSLINE_SCRIPT"
  bash "$WAZA_STATUSLINE_SCRIPT"
)
```

### 4.7 可选规则（三个独立开关）

```bash
(
  set -e
  WAZA_RULE_SCRIPT="$(mktemp -t waza-rule.XXXXXX)"
  trap 'rm -f "$WAZA_RULE_SCRIPT"' EXIT
  curl -fL https://github.com/tw93/Waza/releases/latest/download/setup-rule.sh -o "$WAZA_RULE_SCRIPT"
  # review first
  bash "$WAZA_RULE_SCRIPT"

  # 英文纠错：当你的 prompt 有英文错误时追加一个修正提示
  bash "$WAZA_RULE_SCRIPT" english claude-code

  # 反模式：跨技能 guardrails（行动前先读、不做范围蔓延、不主动摘要）
  bash "$WAZA_RULE_SCRIPT" anti-patterns claude-code

  # 路由提示：告诉非 Claude 宿主在请求匹配时优先使用 Waza 技能
  bash "$WAZA_RULE_SCRIPT" waza-routing claude-code
)
```

---

## 5. 三部曲：Kaku、Waza、Kami

tw93 实际上做的是一个完整的产品家族：

| 项目 | 读音 | 含义 | 职责 |
|------|------|------|------|
| **Kaku**（書く） | 书写 | 写代码 | 父亲 |
| **Waza**（技） | 技术 | 练习惯 | 姐姐 |
| **Kami**（紙） | 纸张 | 出文档 | 妹妹 |

**Kaku** 解决"让 AI 写出代码"的问题。
**Waza** 解决"让 AI 写出符合工程标准的代码"的问题。
**Kami** 解决"让 AI 输出专业级可发布文档"的问题。

三者协同构成了一个 AI 辅助工程工作流的完整闭环：从代码实现，到工程规范，到文档发布。

---

## 6. 核心观点与总结

### 观点一：AI Agent 缺的不是能力，是结构

当前 AI 编程工具最大的问题不是"它做不到"，而是"它不知道该做到什么程度"。Waza 的本质是一套结构化约束，让 AI 的输出从"能跑就行"变成"可以发布"。

### 观点二：工程习惯是最好的 Prompt Engineering

与其不断调试 Prompt，不如把经过验证的工程习惯固化到技能模板里。/hunt 的"根因先于修复"、/check 的"代码未审不发布"——这些都是人类工程师花多年才形成的专业判断，Waza 把它们变成了 AI 可以直接复用的决策框架。

### 观点三：少即是多是 Agent 技能设计的黄金法则

8 个技能覆盖了工程中最关键的 8 个行为时刻。每个技能边界清晰，没有功能重叠。对比那些塞了几十个技能的"全能工具箱"，Waza 的克制反而带来了更高的可靠性和可维护性。

### 观点四：真实失败案例是最好的约束来源

Waza 里每一条"红线"（Hard Rule）和 Gotcha，都对应着一个真实发生过的失败案例。这种约束不是理论推导，而是血泪教训的结晶。这也是为什么 Waza 的规则读起来格外有分量——每一个"不要这样做"背后，都有一个"曾经这样做导致翻车"的故事。

### 观点五：工具和人是同一套哲学

tw93 在 Claude Code 六层框架里指出了一个关键洞察：过载任何一个层级都会让系统失衡——CLAUDE.md 写太长会污染上下文；工具太多选择噪音增大；Subagent 太多状态漂移更难控制。**最好的工具设计，是让人和 AI 都遵循同一套经过验证的工作流。**

---

## 7. 结语

Waza 看似是一个简单的"8个 Slash 命令"，但它背后是一套完整的工程哲学：**好的工具不是给你更多能力，而是给你更好的结构**。

它不教 AI 写代码——那是 Kaku 的工作。它也不教 AI 输出漂亮文档——那是 Kami 的工作。它做的是一件更根本的事：**让 AI 在执行每一个工程任务时，都像经验丰富的工程师那样思考。**

在 AI 编程工具越来越强大的今天，这种"工程习惯的结构化注入"，可能是 AI 编程从"能用"走向"专业"最关键的一步。

---

**相关资源**：

- GitHub：https://github.com/tw93/Waza
- 作者博客：https://tw93.fun
- 相关文章：["You Don't Know Claude Code"](https://tw93.fun/en/2026-03-12/claude.html)（tw93 的 Claude Code 六层框架）
- Waza 三部曲：Kaku（書く/写代码）、Waza（技/练习惯）、Kami（紙/出文档）

---

*作者：蓝小鲸 | 来源：比特财商（微信公众号）*
*首发于微信公众号「比特财商」。
