---
title: "Codex-Orchestration 深度解析：如何用一套插件把 Fable 5、Opus 5、Kimi K3 嵌进 Codex，让每个 AI 扮演不同角色协作开发"
description: "全面解析 Cjbuilds/Codex-Orchestration（580+ stars）。这个开源插件如何在 Codex 任务中引入 Planner、Advisor、Designer、Executor 四大角色，让 Claude Fable 5 规划、Opus 5 审查、Kimi K3 设计、GPT-5.6 Luna 实现，并解决「谁来当 architect」、「同提供商不同号模型如何路由」、「外部模型凭证如何安全存取」的三大核心问题。内容包含详细安装教学、工作流程图、设计哲学，以及从 production-readiness audit 总结出的安全边界与工程荣誉。"
date: "2026-08-08"
author: "TopDigg Research Team"
tags: ["Codex-Orchestration", "Codex", "OpenAI", "Multi-Agent", "Claude Fable 5", "Claude Opus 5", "Kimi K3", "OpenRouter", "MCP", "Model Routing", "AI Agent", "TypeScript", "Python", "Role-Based Agent"]
categories: ["深度解析"]
keywords: ["Codex-Orchestration", "Codex 多模型协作", "Claude Fable 5", "Claude Opus 5", "Kimi K3", "OpenRouter", "MCP 插件", "模型路由", "Planner Advisor Designer Executor", "外部模型", "Gate 0", "安全凭证", "多代理协作", "AI 编程助手", "OpenAI Codex"]
---

# Codex-Orchestration 深度解析：用一套插件把多个模型塞进 Codex，让每个 AI 扮演不同角色协作开发

> **核心理念：** "你不需要更强大的单一模型，你需要更好的协作框架。" Codex-Orchestration 把「不同 AI 扮演不同角色」这件事做到了极致 — Planner 用 Fable 5 来规划，Advisor 用 Opus 5 来审查，Designer 用 Kimi K3 来设计，Executor 用 GPT-5.6 Luna 来实现。Codex 仍是老大，但现在轮到合适的人（模型）做合适的事。

---

## 一、这是什么？（小学生都能懂版）

想象一下，你有一个写程式的团队合作项目。但你的团队不是人，而是 AI 助理。

一般情况下，你只请了一个 AI 助理 — 它得同时当专案经理、设计师、程式设计师，还要当自己项目的 QA。结果呢？专案经理可能没想太多就开始写程式，设计师画的东西可能不太美观，QA 可能被边做边改到忘记检查。

Codex-Orchestration 就是一个「聪明的团队管理插件」。它不是取代你的 AI 助理，而是帮你**请来更多不同擅长的 AI 助理**，每个人只负责自己的一份工作：

- **Planner**（规划者） — 负责把你的需求写成详细的执行计划。想像它就像专案经理，会先画出 roadmap。
- **Advisor**（顾问） — 负责审查计划，找出漏洞，确保没漏项。就像品质经理，在程式码动手之前把问题拦下来。
- **Designer**（设计师） — 负责画 UI/UX 设计，确保产物好看又好用。
- **Executor**（执行者） — 负责实际实现计划，写程式码。

**最厉害的是，你请的每个「AI 助理」可以是不同厂商的不同模型。** 比如：
- Planner 请 **Claude Fable 5**（擅长规划）
- Advisor 请 **Claude Opus 5**（擅长审查）
- Designer 请 **Kimi K3**（104 万 tokens 上下文）
- Executor 请 **GPT-5.6 Luna**（快速实现）

而你原本在 Codex 中的 AI 助理则保持为**最高指挥官** — 它决定什么时候该让哪个「副手」上场，最后再亲自把关成果。

---

## 二、专案说明

### 2.1 基本资讯

- **专案名称**：Codex-Orchestration
- **作者/维护者**：Cjbuilds (GitHub 组织)
- **开源地点**：[https://github.com/Cjbuilds/Codex-Orchestration](https://github.com/Cjbuilds/Codex-Orchestration)
- **Stars**：582+（2026 年 7 月）
- **Forks**：59+
- **语言**：Python 3.11+
- **开发者协议**：MIT
- **建立日期**：2026 年 7 月 10 日
- **目前版本**：0.9.3（Unreleased）

### 2.2 它想解决什么问题？

#### 问题 1：单一模型做不到所有事

当你在 Codex（OpenAI 的 AI 编程助手）中要求它完成一个复杂的任务时，它需要同时担负多个角色：

1. **理解需求** → 2. **规划方案** → 3. **审查潜在问题** → 4. **撰写程式码** → 5. **测试验证**

单一模型在每个阶段都只能「及格完成」。比如 GPT-5.6 Sol 可能在规划上有天赋，但在审查细节时可能会漏掉边界情况；又或者 Fable 5 擅长审查，但实现速度可能不是最快。

#### 问题 2：模型选择受限

Codex 的原生介面只能选择目前注册在 ChatGPT/OpenAI 平台上的模型。想要使用 Anthropic 的 Claude，或是 OpenRouter 上的 Kimi K3 — 这些「外部模型」无法直接嵌入到 Codex 的工作流程中。

#### 问题 3：没有「独立审查」的机制

在多模型协作中，最危险的事情是「自己审自己」。如果规划者同时也是审查者，潜在的缺陷会永远被掩盖。Codex-Orchestration 强制要求 **Planner 和 Advisor 必须使用不同的模型**，确保独立审查。

#### 问题 4：凭证安全问题

把外部模型的 API Key 拼在聊天里面，或者存到设定档中，都是非常危险的。Codex-Orchestration 设计了一个「门禁系统」 — 让凭证永远不出现在 Codex 的聊天记录或代码存储库中。

### 2.3 核心功能

| 功能 | 说明 |
|------|------|
| **角色路由** | 把 Planner、Advisor、Designer、Executor 映射到不同模型 |
| **外部模型支援** | 透过 OpenRouter 把 Kimi K3 等外部模型加入 Codex |
| **Claude 集成** | 把 Claude Fable 5 / Opus 5 接入作为 Planner 或 Advisor |
| **安全凭证管理** | 使用作业系统的 credential store，不把 Key 放在聊天或程式码中 |
| **预览优先** | 所有操作都先预览，再套用，避免误操作 |
| **路由修复** | 当路由设定摇摆时，可只修复受影响的部分 |
| **插件自更新** | `$codex-orchestration:codex-orchestration --update` |

---

## 三、核心思想

### 3.1 四大角色制

Codex-Orchestration 在 Codex 任务中引入了四种角色，让不同模型专心于自己的擅长领域：

#### 🎯 Planner（规划者）
- **职责**：将用户的需求转化为详细的执行计划
- **流程**：收到需求 → 制定计划 → 收到 Advisor 反馈 → 改进计划
- **可选性**：如果省略，当前 Codex 模型会担任 Planner
- **范例模型**：Claude Fable 5、GPT-5.6 Sol

#### 🔍 Advisor（顾问/审查者）
- **职责**：审查计划，找出遗漏的需求、潜在风险、技术陷阱
- **流程**：收到计劲 → 找出问题 → 回传 `PLAN_APPROVED` 或 `PLAN_REVISE`
- **可选性**：如果省略，没有审查环节
- **范例模型**：Claude Fable 5、Claude Opus 5、GPT-5.6 Sol
- **限制**：最多 8 次审查rounds，否则停止执行

#### 🎨 Designer（设计师）
- **职责**：将审核通过的需求转化为设计稿（UI/UX、互动设计、资讯架构等）
- **流程**：收到计划 → 产出设计文件 → 传给 Executor
- **可选性**：如果省略，没有设计阶段
- **范例模型**：GPT-5.6 Terra、Kimi K3（外部模型）

#### ⚙️ Executor（执行者）
- **职责**：实现经过审核认可的计划，撰写程式码
- **流程**：收到计划 + 设计稿 → 实现 → 完成
- **必选性**：必须指定
- **范例模型**：GPT-5.6 Luna

### 3.2 工作流程

```text
                         用户下达任务
                             |
                             v
                  Codex 负责协调整体工作
                             |
                             v
               Planner 制定第一个计划
               (Fable 5 或其他模型)
                             |
                             v
                    Advisor 审查计划
                  (找出潜在问题)
                             |
                   需要修改? -- 是 --+
                             |            |
                            否            v
                             |      Planner 改进计划
                             |            |
                             +<-----------+
                             |
                       计划通过审核
                             |
                             v
                Designer 制作设计稿
                (可选，独立角色)
                             |
                             v
                  Executor 实现计划
                (实现程式码)
                             |
                             v
                   Codex 测试与交付
```

> **关键规则**：Planner 和 Designer 可以在多个模型之间来回修改，但 **Advisor 必须使用与 Planner 不同的模型**。这确保了「独立审查」的原则。

### 3.3 设计哲学

#### 哲学 1：Codex 始终是老大

> "The model selected for the Codex task remains in charge."

Codex-Orchestration **从不取代** Codex 本身。它只是在 Codex 的工作流程中引入更多模型作为「副手」。Codex 仍然是：

- 决定如何分解任务
- 决定什么时候该让哪个副手上场
- 收集合所有副手的结果
- 做最终的验证与交付

#### 哲学 2：预览优先，失败闭合

所有操作都遵循「预览 → 确认 → 套用」的流程：

```bash
# 预览（不会修改任何设定）
python3 configure_native_routing.py --codex-bin <path> --status

# 套用
python3 configure_native_routing.py --codex-bin <path> --status --require-effective
```

如果任何检查失败，系统会**立即停止**，而不是继续尝试。这种「失败闭合」(fail-closed) 的设计确保安全边界不会被意外突破。

#### 哲学 3：凭证零存留

> "Never paste an API key into Codex chat. The repository, provider TOML, registry, journal, logs, and tests store no key."

这个专案有一个非常严格的安全原则：**在任何人可见的地方，都不能存著 API Key**。凭证的存取方式如下：

1. **准备阶段**：在 trusted terminal 中执行隐藏式的本地提示
2. **凭证储存**：OS credential store（macOS Keychain、Linux Secret Service、Windows Credential Manager）
3. **呼叫时机**：只在需要发送 API 呼叫时，从 credential store 读取
4. **绝不存取**：聊天记录、设定档、程式码、Git、日志、测试、注册档 — 通通不能存 Key

#### 哲学 4：路由不是执行器选择器

> "Same-provider routing could be mistaken for an engine-enforced executor selector."

Codex-Orchestration 的路由是 **政策引导** (policy-guided)，而不是引擎强制 (engine-enforced)。这意味著：

- Codex 仍然可以选择不委派工作
- `model` 参数只是「建议」路由，不是强制
- 路由失败时，Codex 会退回到根模型执行

#### 哲学 5：最小权力原则

每个角色都有明确的权限边界：

- **Planner**：只能规划，不能编辑程式码
- **Advisor**：只能审查计划，不能执行或编辑
- **Designer**：只能编辑设计文件，不能修改实现程式码
- **Executor**：只能实现计划，不干涉其他角色
- **Claude 子process**：no-tools, no-persistence, minimal environment

---

## 四、关键观点与结论

### 4.1 从 production-readiness audit 学到的 5 件事

Codex-Orchestration 在 2026 年 7 月 12 日经过一次正式的「生产就绪稽核」(production-readiness audit)。稽核发现并修复了多个问题：

| 等级 | 原始问题 | 解决方式 |
|------|----------|----------|
| **高** | README 一开头就丢内部 routing 细节，普通用户看不懂 | 改用「什么是它」、「为什么需要它」、「如何安装」的普通语言结构 |
| **高** | Fable 5 是独立开发的，不能保证 advisor workflow 可以用 | 整合选用的根-directed Fable bridge，加上登入检查与 fail-closed |
| **高** | `main` 分支可变动，没 PR 审查机制 | 要求 PR、required checks、admin enforcement、禁止 force-push |
| **高** | 同_provider 路由可能被误解为 engine-enforced executor selector | 明确描述为 policy-guided routing，区分 config / effective / accepted / confirmed 四种状态 |
| **中** | 还原状态持久化失败时忽略 rollback 错误 | 验证 rollback 状态，报告 managed fields 可能遗留 |

**结论**：这个专案在设计初期就面临「怎么让复杂的 routing 技术变得安全易用」的挑战，并通过严格的稽核与迭代来解决。

### 4.2 三种路由方式

Codex-Orchestration 支援三种不同的模型路由方式：

| 方式 | 适用情况 | 范例 | 安全等级 |
|------|----------|------|----------|
| **同_provider 直送** | 同一个 provider 内切换模型 | GPT-5.6 Sol → Luna | 标准（透过 App Server config） |
| **Claude 子subscription** | 希望用 Claude Fable 5 / Opus 5 作为 Planner 或 Advisor | Fable 5 High 作为 Planner | 高（seal bridge） |
| **外部模型 (External Models)** | 使用 OpenRouter 等外部 provider 的模型 | Kimi K3 via OpenRouter | 高（Gate 0 + OS credential store） |

**结论**：专案提供了完整的「模型接入金字塔」：从最简单的同 provider 直送，到需要完整安全审计的外部模型接入。

### 4.3 Kimi K3 的凭证安全架构

Kimi K3 透过 OpenRouter 接入，是这个专案中最具代表性的「外部模型」案例。它展示了整套安全架构：

1. **Provider 准备**：只添加 `[model_providers.openrouter]` 和 command-backed `auth` table
2. **身份验证**：OS credential store + hidden local prompt（绝不在聊天中贴 Key）
3. **Gate 0 探针**：一个带成本的隔离探测，用于验证模型是否真的能用
4. **角色建立**：建立 provider-pinned personal agent variants
5. **封装执行**：使用 `codex exec` 直接 CLI 呼叫，工具全数禁用

> **重要**：每次安装都是「unqualified」直到通过一次明确授权的 billable Gate 0。这意味著你不能「偷用」没付费的模型。

### 4.4 版本演进史

从 CHANGELOG 可以看出这个专案的演进脉络：

- **0.1.0~0.3.0**（2026-07-09）：建立基础架构，加入 advisor workflow，加入安全的外部模型角色
- **0.4.0**（2026-07-10）：将 config-first routing 变为主要工作流程，支援 v2 spawn metadata
- **0.5.1**（2026-07-16）：加入 Planner 角色，Fable 5 开始支援作为 Planner 和 Advisor
- **0.6.0**（2026-07-18）：加入外部模型角色 (Kimi K3)，OS credential store，Gate 0 探针
- **0.7.0~0.7.2**（2026-07-18）：加入 `--update`、Designer 角色、简洁的 activation confirmation
- **0.8.0**：用封装的 direct CLI transport 取代 Desktop native agents 执行 READY 外部模型
- **0.9.0**（2026-07-25）：加入 Claude Opus 5 作为 Planner/Advisor，提升安全强度

**结论**：专案在短短 1 个月内完成了从 v0.1 到 v0.9 的快速迭代，每次版本都在解决特定的安全或可用性问题。

### 4.5 工程荣誉与设计决策

从 production-readiness audit 的「Deliberate boundaries that remain」章节，我们可以看出设计者们非常谨慎地处理每一个攻击面：

1. **External Model READY roles 使用封装 direct CLI transport**，而非 Desktop native spawn-agent — 这防止 model-facing tools 被滥用
2. **没有 engine-level executor selector** — routing 始终是 policy-guided，Codex 保留最终决定权
3. **Direct model overrides 继承 root provider** — 跨 provider 需要额外配置，防止意外使用外部 provider
4. **Claude Fable 5 是狭义的 built-in exception** — 只能作为 Planner/Advisor，不能作为 Designer/Executor
5. **「Any model」 有明确范围** — 只能是 Codex provider、已配置 compatible custom provider、或 deliberately bundled bridge。插件不会创建 accounts/credentials/协定

**结论**：设计者们在每一个决策点都选择「失败闭合」（fail-closed）而非「便利优先」（convenience-first）。

---

## 五、详细教学

### 5.1 安装

首先，你需要安装 Codex-Orchestration 插件到 Codex：

```bash
# 从 marketplace 安装
codex plugin marketplace add Cjbuilds/Codex-Orchestration

# 添加插件到 Codex
codex plugin add codex-orchestration@codex-orchestration
```

> ⚠️ **注意**：安装完成后，必须**重新启动 Codex 并开启一个新任务**，才能让插件生效。

### 5.2 基本操作语法

所有操作都是透过 Codex 的 prompt 来完成，**不是终端机命令**。你需要在 Codex 聊天中输入以下格式：

```text
$codex-orchestration:codex-orchestration <操作指令>
```

例如查看当前状态：

```text
$codex-orchestration:codex-orchestration status
```

### 5.3 配置角色（setup）

`setup` 是最重要的操作，它会为你配置四大角色对应的模型。语法格式如下：

```text
$codex-orchestration:codex-orchestration setup \
  planner: <模型 与 effort>, \
  advisor: <模型 与 effort>, \
  designer: <模型 与 effort>, \
  executor: <模型 与 effort>
```

#### 范例 1：使用 Fable 5 规划、Sol 审查、Luna 实现

```text
$codex-orchestration:codex-orchestration setup planner: Claude Fable 5 High, advisor: GPT-5.6 Sol High, executor: GPT-5.6 Luna Extra High
```

解释：
- **Planner** = Claude Fable 5 (effort: High) — 负责规划
- **Advisor** = GPT-5.6 Sol (effort: High) — 负责审查
- **Executor** = GPT-5.6 Luna (effort: Extra High) — 负责执行
- **Designer** = 省略（不配置）

#### 范例 2：完整四人组 + Kimi K3 设计

```text
$codex-orchestration:codex-orchestration setup planner: Claude Fable 5 High, advisor: GPT-5.6 Sol High, designer: GPT-5.6 Terra High, executor: GPT-5.6 Luna Extra High
```

#### 范例 3：让当前 Codex 模型当 Planner，Fable 5 仅当 Advisor

```text
$codex-orchestration:codex-orchestration setup advisor: Claude Fable 5 High, executor: GPT-5.6 Luna Extra High
```

### 5.4 配置规则

- **`executor` 必填** — 决定谁来实现计划
- **`planner` 可省略** — 省略表示当前 Codex 模型当 Planner
- **`advisor` 可省略** — 省略表示没有审查环节
- **`designer` 可省略** — 省略表示没有设计阶段
- **Planner 和 Advisor 不能用同一模型** — 确保「独立审查」

### 5.5 Claude Fable 5 和 Opus 5 的 Effort 选项

| 模型 | 支援的 Effort | 预设值 | 特殊注意事项 |
|------|---------------|--------|-------------|
| **Claude Fable 5** | Low, Medium, High, XHigh, Max | High | `Ultra` 当作 `Max` 的别名 |
| **Claude Opus 5** | Low, Medium, High, XHigh, Max | High | 不接受 `Ultra` 别名；需要 Claude Code 2.1.219+ |

> **Claude Fable 5 和 Opus 5 只能用于 Planner 或 Advisor**，不能用作 Designer 或 Executor。

### 5.6 查询外部模型可用性

你可以使用自然语言来查询外部模型（如 Kimi K3）是否可用：

```text
is Kimi available to use as Designer?
```

插件会检查 External Model registry，并向你报告四种不同的状态：

1. **supported**：Kimi K3 被 plugin 支援
2. **configured**：Kimi K3 已经在本机配置
3. **locally ready**：Kimi K3 在当前工作区可以使用
4. **callable now**：Kimi K3 已经被验证可以呼叫

### 5.7 设定外部模型（以 Kimi K3 为例）

如果你希望使用 Kimi K3 这样的外部模型，需要经过一个「阶梯式」的设定流程：

#### 步骤 1：准备 Provider

```text
$codex-orchestration:codex-orchestration configure external role researcher with OpenRouter model moonshotai/kimi-k3 at max; job: gather evidence and cite sources
```

#### 步骤 2：身份验证

插件会在 terminal 中显示一个隐藏式的本地提示，引导你将 API Key 存入作业系统的 credential store。**绝对不要把 API Key 贴在 Codex 聊天中！**

#### 步骤 3：Gate 0 探针

你需要**明确授权**一次可能产生费用的隔离探测：

```bash
python3 <skill-dir>/scripts/external_configurator.py \
  --codex-bin <codex-binary-path> \
  gate0 --provider openrouter --model moonshotai/kimi-k3 --effort max --acknowledge-billing
```

> 这一步会产生实际的 API 费用。必须等到你明确确认后才能执行。

#### 步骤 4：建立角色

```bash
python3 <skill-dir>/scripts/external_configurator.py connect \
  --role researcher \
  --purpose "Gather evidence from the bounded packet and cite sources." \
  --provider openrouter \
  --model moonshotai/kimi-k3 \
  --effort max --apply
```

#### 步骤 5：重新启动

完成后必须**重新启动 Codex 并开启新任务**，才能让角色载入。

#### 步骤 6：呼叫角色

```text
$codex-orchestration:codex-orchestration call researcher at max — review this bounded research packet
```

### 5.8 状态与维护

| 指令 | 功能 |
|------|------|
| `status` | 查看当前路由配置状态 |
| `status --require-effective` | 检查配置是否真正生效 (适合 CI/CD) |
| `repair` | 修复 routing hints 发生摇摆时的配置 |
| `--update` | 更新插件到最新版本 |
| `disable` | 还原设定为安装前的状态 |

### 5.9 Designer: Kimi K3 的便捷用法

如果 Kimi K3 角色已经就绪，你可以使用便捷的 seat label 语法：

```text
$codex-orchestration:codex-orchestration Planner: Claude Fable 5 High, Designer: Kimi K3
```

`Designer: Kimi K3` 会自动对应到 role=designer, provider=openrouter, model=moonshotai/kimi-k3, effort=max。**但需要注意**：

- Kimi K3 只支援 `max` reasoning，其他 effort 值会被拒绝
- 此 shorthand 不会把 Kimi 加入 Codex Desktop 的模型选择器
- 它不会取代任何 GPT 路由
- **不能**在聊天中贴 API Key，不能授权 Gate 0 付费探测

### 5.10 与 Codex Goals 配合使用

你可以正常建立一个 Codex Goal，然后告诉 Codex 使用已保存的工作流程：

```text
请使用已保存的 codex-orchestration 工作流程直到这个 Goal 完成。
```

Codex 仍然管理 Goal 的状态、权限、整合和验证；插件只引导每个角色使用哪个模型。

### 5.11 安全操作

#### 如何把凭证安全地存进去？

1. **绝对不要**在 Codex 聊天中贴 API Key
2. **绝对不要**把 Key 写进设定档、程式码、Git、或日志
3. **正确方式**：透过 OS credential store（macOS Keychain / Linux Secret Service / Windows Credential Manager）

#### 如果 Key 泄露了怎么办？

插件会在 `disconnect` 和 `remove provider` 时只删除确切的 managed 角色文件和 provider 配置，**不会触碰**：
- chats 或 sessions
- OpenAI 验证
- 用户自行配置的角色

---

## 六、安装与开发

### 6.1 开发环境准备

```bash
# Clone 专案
git clone https://github.com/Cjbuilds/Codex-Orchestration.git
cd Codex-Orchestration

# 安装开发依赖
python3 -m pip install -r requirements-dev.txt

# 编译与检查
python3 -m compileall -q plugins tests scripts
python3 -m ruff check plugins tests scripts

# 执行测试
python3 -m unittest discover -s tests -v
python3 tests/plugin_lifecycle_smoke.py
python3 scripts/release_check.py
```

### 6.2 版本要求

- **Python**：3.11+
- **Codex Desktop**：0.144.0-alpha.4+（用于 v2 spawn metadata）
- **Claude Code**：2.1.219+（用于 Opus 5）

---

## 七、总结

Codex-Orchestration 是一个极具创新性的「AI 团队管理插件」。它不仅解决了「单一模型能力有限」的问题，更通过以下几个关键设计，把「AI 多模型协作」这件事做到了安全且可控：

### 七、1 三大突破

1. **角色化路由**：把不同模型分配到 Planner / Advisor / Designer / Executor，发挥各家所长
2. **安全的外部模型接入**：透过 OpenRouter + OS credential store + Gate 0 探针，把 Kimi K3 这类外部模型安全地接入 Codex
3. **政策引导而非引擎强制**：Codex 始终是老大，路由只是「建议」，不是强制

### 七、2 三大价值

1. **更强的规划能力**：Fable 5 擅长规划，把规划工作交给它
2. **更严的品质管控**：Opus 5 擅长审查，独立审查防止自己审自己
3. **更快速的实现**：Luna 擅长快语，把实现交给它；支持平行执行

### 七、3 设计者的智慧

从 production-readiness audit 可以看出，设计者们在每一个攻击面都选择「失败闭合」而非「便利优先」。比如：

- **凭证安全**：从来不在聊天/程式码/设定档中存 Key，全部走 OS credential store
- **路由安全**：Cross-provider 需要额外配置，防止意外使用未经授权的 provider
- **审查安全**：Planner 和 Advisor 必须不同模型，防止「自己审自己」
- **更新安全**：插件自更新经过 canonical source 验证，不会被恶意节点替换

这个专案展示了一个非常成熟的思考方式：**不是问「可以做什么」，而是问「不可以做什么」**。在 AI 代理越来越强大、越来越自主的时代，这种「信任但验证」、「便利但安全」的设计哲学，可能才是多模型协作未来的标准。

---

## 八、观点总结

| 观点 | 来源 | 结论 |
|------|------|------|
| **多模型 ≠ 单一更强** | README | 把不同模型放到不同角色，比提升单一模型性能更有效 |
| **规划前先审查** | 工作流程图 | Advisor review 是一个「planning gate」，不是 implementation guarantee |
| **外部模型需要严格审计** | production-readiness audit | 不能「任意 URL 当 provider」，必须是 reviewed bundled manifest |
| **凭证零存留是底线** | CHANGELOG 0.6.0 | API Key 绝不存于聊天/程式码/Git/设定档/日志 |
| **Codex 始终是老大** | SKILL.md | 插件不会取代 Codex，只能引导模型路由 |
| **失败闭合胜过便利优先** | Auditor | 所有安全边界都是 fail-closed，不是 best-effort |
| **版本演进以安全为主** | CHANGELOG | 0.5→0.6:加入凭证安全；0.7→0.8:加入 sealed CLI transport；0.9:加入 Opus 5 |
| **可观察性胜过承诺** | providers-and-models.md | 路由有 precise 状态（installed/effective/accepted/confirmed），绝不模糊称赞 |
