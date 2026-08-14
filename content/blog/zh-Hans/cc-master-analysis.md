---
slug: cc-master-analysis
title: "cc-master 深度解析：把任意编码 Agent 会话变成长期项目负责人（项目说明 + 快速上手教程 + 系统架构 + 设计哲学）"
description: "以 nemori-ai/cc-master（开源项目，TypeScript，PolyForm Noncommercial 1.0.0 协议）为蓝本，完整解析'把编码 Agent 会话变成长期项目负责人（a project lead for long-running work）'。核心思想：cc-master 把 Claude Code、Codex、Cursor、kimi-code 中任何一个受支持的编码 Agent 会话变成'项目负责人'——你带想法、做少数真正需要你的决策；它负责拆解大目标、并行调度独立子任务、追踪进度与配额，并对照显式目标验收结果。Board（看板）能跨上下文重置与会话交接存活，工作不依赖某一次对话的记忆。安装：curl 一行命令安装 ccm 引擎 + 插件；插件为每个 harness 生成原生适配器（Claude Code 斜杠命令 /cc-master:as-master-orchestrator、Codex $cc-master-as-master-orchestrator、Cursor /as-master-orchestrator、kimi-code cc-master:as-master-orchestrator）。系统架构：三层产品模型（per-harness 插件适配层 → ccm CLI + @ccm/engine 引擎 → ccm web-viewer 只读视图）；Board v2 JSON 数据模型（窄腰设计）；8 个分布式 Skill（master-orchestrator-guide / authoring-workflows / using-ccm / slicing-goals-into-dags / dev-as-ml-loop / engineering-with-craft / pacing-and-estimation / distilling-lessons-into-assets）；O/T1/T2/T3 统一模型分配；7 类 dormant-until-armed Hooks；配额姿态 + 蒙特卡洛交付预测；跨 harness 的 worker 派发与 Agent Registry。设计哲学：'指挥家从不亲自演奏'（协调者不亲自做单元工作）、注意力再分配（把注意力重新分配到真正值得花的地方）、六个宪章目标、ship-anywhere（hooks 只用 bash + node/JS）、窄腰原则（只有少量固定 board 字段被 hooks 依赖）、双版本线解耦（插件 vX.Y.Z 与 ccm ccm-vX.Y.Z 独立发版）。明确边界：这不是'许个愿 AI 全包'——品味、设计、方向等只有你能做的决策仍然属于你；十分钟能改完的一两行修复也不值得请'项目负责人'。"
date: "2026-08-11"
author: "TopDigg"
tags: ["cc-master", "Claude Code", "Codex", "Cursor", "kimi-code", "Agent Orchestration", "AI Agent", "Long-horizon", "Task DAG", "Monte Carlo", "Project Lead", "DevTools", "Agent Plugin"]
categories: ["Deep Dive"]
keywords: ["cc-master", "Claude Code", "Codex", "Cursor", "kimi-code", "Agent 编排", "Orchestration", "长期任务", "Long-running", "Board", "DAG", "O/T1/T2/T3", "模型分配", "设计哲学", "nemori-ai", "配额", "蒙特卡洛", "Worker", "Agent Registry"]
---

# cc-master 深度解析：把任意编码 Agent 会话变成长期项目负责人

> 核心思想：**cc-master 把 Claude Code、Codex、Cursor、kimi-code 中任何一个受支持的编码 Agent 会话，变成一个"长期项目负责人"（a project lead for long-running work）**。你带来想法，做那少数几个真正需要你的决策；它帮你拆解工作、并行运行独立部分、追踪进度与配额，并对照显式目标验收结果。**Board 能跨上下文重置与会话交接存活**，工作不依赖某一次对话的记忆——这是它与"单次对话里的 Agent"最本质的区别。

## 一、项目说明

### 1.1 它是什么？

cc-master 是 nemori-ai 开源的 **Agent 编排框架**（TypeScript 编写），目标是把"单个编码 Agent 会话"升级成"能扛住几天、多线程并行、跨会话存活"的**项目负责人**。

官方一句话定位：

> cc-master turns a supported coding-agent session into a project lead for long-running work. You bring the idea and make the handful of calls that truly need you; it helps break the work down, run independent pieces in parallel, track progress and quota, and verify the result against an explicit goal. The board survives context resets and session handoffs, so the work can continue without relying on one conversation's memory.

（cc-master 把受支持的编码 Agent 会话变成长期工作的项目负责人。你带来想法，做少数几个真正需要你的决策；它帮你拆解工作、并行运行独立部分、追踪进度与配额，并对照显式目标验收结果。看板能跨上下文重置与会话交接存活，工作可以继续，而不依赖某一次对话的记忆。）

**一句话总结**：cc-master 在 AI 辅助编码时代，把人类注意力重新分配到真正值得花的地方——拆解、调度、进度与配额记账这些脏活交给"项目负责人"，你只做方向与重大决策。

### 1.2 项目元信息

| 字段 | 值 |
|------|-----|
| 仓库 | https://github.com/nemori-ai/cc-master |
| Stars | 8 |
| License | PolyForm Noncommercial 1.0.0（源码可用，仅限非商业使用） |
| 语言 | TypeScript |
| 最近推送 | 2026-08-07 |
| Topics | `agent-plugin` `agent-skill` `claude-code` `claude-plugin` `dynamic-workflow` `orchestration` |
| 中文文档 | README_zh.md（自带中文 README） |

### 1.3 它不是什么（重要边界）

> 但请别误会——这**不是**"许个愿，AI 全都包了"。品味、设计、方向——只有你能做的决策**仍然属于你**；它从你盘子里拿走的，只是那些本该把你埋掉的拆解、调度、进度与记账。

**什么时候不该用 cc-master**：

> 一两行、十分钟就能改完的修复？直接改就行——别请"项目负责人"，那是杀鸡用牛刀，只会更慢。**它是为那种一个人盯不过来、要跑好几天、同时开很多线程的目标准备的。工作越大、越乱、越长，越值得用。**

### 1.4 为谁而做（三种目标用户）

| 用户画像 | 痛点 | cc-master 提供的价值 |
|----------|------|---------------------|
| 🚀 有想法但不懂工程的你 | 能说清想要什么，缺一个**可靠的项目负责人** | 帮你把想法拆成可执行任务、盯进度、验收 |
| 🔧 不想当"经理"的工程师 | 管理事务占用了写代码的时间 | 把管理拿下来，让你留在手艺里 |
| 🧭 带团队的负责人 | 想当"十个自己" | 它扛起繁琐调度，你定方向、做重大决策 |

## 二、核心思想

### 2.1 注意力再分配（Attention Reallocation）

> At bottom it does one thing: in the age of AI-assisted coding, it **reallocates your attention to where it's actually worth spending**.

归根结底它只做一件事：在 AI 辅助编码的时代，**把你的注意力重新分配到真正值得花的地方**。人类注意力是稀缺资源；与其盯着每个 Agent 的输出、维护每一条进度，不如把注意力集中在"只有你能做的判断"上。

### 2.2 指挥家从不亲自演奏

> The conductor never plays an instrument.

这是 cc-master 最核心的设计红线：**协调者负责协调，绝不亲自下场做单元工作**。任何把主线推向"亲自实现"或"亲自审查"的改动，方向都是错的。这一原则贯穿 skill 设计、hook 设计与 board 状态机。

### 2.3 六个宪章目标（Charter Goals）

项目宪章列出的六个目标（部分仍在演进中）：

1. **异步并行多线程推进**，目标完整交付
2. **控制 token 消耗节奏**（配额感知）
3. **掌握自主决策与人机协同的边界**（哪些决策该问人）
4. **目标拆解、管理、更新、规划**
5. **在合理资源消耗内最大化效率的调度编排**
6. **根据复杂度 / 难度 / 时长选择合适的模型**（O/T1/T2/T3）

### 2.4 与"全自动 Agent"的本质区别

- **不是**"一个 prompt 全自动跑完"——它引入**显式 Goal Contract（目标契约）**与**验收门**，结果必须对照目标逐条验证。
- **不是**单次对话——**Board 持久化到磁盘**（`~/.cc_master/boards/*.board.json`），上下文重置、会话交接后依然存活。
- **不是**所有工作都该用——它有明确的"何时不该用"边界（小修复直接做，别请项目负责人）。

## 三、详细教程

### 3.1 硬性前置条件

| 依赖 | 要求 |
|------|------|
| Node.js | **22+**（所有模式必需，包括离线/锁版本） |
| unzip | 解压插件与引擎 |
| SHA256 工具 | `sha256sum` / `shasum` / `openssl` 任一 |
| 网络工具 | `curl` 或 `wget`（在线安装需要） |

### 3.2 一键安装（引擎 ccm + 插件一起装）

```bash
# 安装 ccm 引擎 + 插件（默认自动探测 harness）
curl -fsSL https://raw.githubusercontent.com/nemori-ai/cc-master/main/install.sh | bash
```

### 3.3 安装选项（锁版本 / 指定 harness）

```bash
# 同时锁定引擎与插件版本（两个 flag 相互独立、均可选）
curl -fsSL https://raw.githubusercontent.com/nemori-ai/cc-master/main/install.sh | bash -s -- \
  --ccm-version ccm-v0.23.0 --plugin-version v0.22.0

# 只锁引擎版本，插件用最新
curl -fsSL https://raw.githubusercontent.com/nemori-ai/cc-master/main/install.sh | bash -s -- --ccm-version ccm-v0.23.0

# 指定目标 harness
curl -fsSL https://raw.githubusercontent.com/nemori-ai/cc-master/main/install.sh | bash -s -- --harness claude-code
curl -fsSL https://raw.githubusercontent.com/nemori-ai/cc-master/main/install.sh | bash -s -- --harness cursor
curl -fsSL https://raw.githubusercontent.com/nemori-ai/cc-master/main/install.sh | bash -s -- --harness kimi-code

# 全部 harness 都装
curl -fsSL https://raw.githubusercontent.com/nemori-ai/cc-master/main/install.sh | bash -s -- --all-harnesses
```

### 3.4 关键环境变量

| 变量 | 默认值 | 用途 |
|------|--------|------|
| `CC_MASTER_HOME` | `$HOME/.cc_master` | 运行时状态根目录（boards、Goal Briefs、账户注册、配额 sidecar） |
| `PREFIX` | `$HOME/.local/bin` | `ccm` 二进制安装位置 |
| `CC_MASTER_PLUGIN_DIR` | `$HOME/.local/share/cc-master` | 插件暂存根目录 |
| `CC_MASTER_INSTALL_LOCAL` | _空_ | 设为本地目录路径 → 从本地资产离线安装 |
| `CC_MASTER_NO_AUTOINSTALL` | _空_ | 设为 `1` → 关闭 Claude Code 上的自动状态栏安装 |

### 3.5 在各 harness 里启动编排

安装完成后，用对应 harness 的原生入口启动：

```bash
# Claude Code（斜杠命令）
/cc-master:as-master-orchestrator <你的目标>

# Codex（子命令）
$cc-master-as-master-orchestrator <你的目标>

# Cursor（Agent chat 斜杠命令）
/as-master-orchestrator <你的目标>

# kimi-code（命名空间插件命令）
cc-master:as-master-orchestrator <你的目标>
```

### 3.6 日常命令速查表

| 命令 | 用途 |
|------|------|
| `/cc-master:as-master-orchestrator <goal>` | 开始一次全新编排 |
| `/cc-master:as-master-orchestrator --resume` | 恢复已有 board |
| `ccm harness list --machine-wide --json` | 发现机器级 harness 表面 |
| `ccm quota status --machine-wide --json` | 读取缓存配额姿态 |
| `ccm model-policy show --task <taxonomy> --json` | 查看 O/T1/T2/T3 模型角色候选 |
| `ccm worker help --harness <target>` | 读取目标 CLI 真实的 agent 命令帮助 |
| `ccm worker run` | 原始 worker 传输（无 board 副作用） |
| `ccm worker dispatch --board … --task … --idempotency-key …` | 带记账的派发（Agent Registry 记录） |
| `ccm agent list --json` | 查看运行时名单与生命周期证据 |
| `ccm status-report show` | 生成 board 状态报告 |
| `ccm web-viewer open` | 在浏览器打开只读实时计划图 |
| `/cc-master:discuss <decision>` | 把决策抛给人类 |
| `/cc-master:bulk-discuss` | 一次性走完所有待定决策 |
| `/cc-master:stop` | 收尾并归档 board |
| `/cc-master:handoff-to-new-session` | 为会话交接做准备 |
| `/cc-master:retro` | 只读复盘 → 经验教训文档 |
| `/cc-master:distill <retro-path...>` | 把经验提炼为项目资产（discipline-doc / skill / workflow / subagent） |
| `ccm account add\|list\|switch <email>` | 管理 Claude Code 账户池 |

### 3.7 一次完整工作流的形状

```text
1. 你: /cc-master:as-master-orchestrator "把博客站迁移到新的 i18n 架构"
2. cc-master: 创建 Goal Contract → 把目标切片成 DAG（T0 调研 → T1/T2 并行实现 → T3 验收）
3. cc-master: 按 O/T1/T2/T3 给每个任务分配模型角色，worker 派发到 Claude Code/Codex 等
4. 遇到真正需要你的决策 → /cc-master:discuss 或 /cc-master:bulk-discuss
5. 上下文快满 → /cc-master:handoff-to-new-session → 新会话 --resume，board 原样恢复
6. 全部任务 done → verify-board 门逐条对照 Goal Contract 验收 → /cc-master:stop 归档
7. 可选: /cc-master:retro → /cc-master:distill 把教训变成团队资产
```

## 四、系统架构

### 4.1 三层产品模型

```text
┌─────────────────────────────────────────────────────────┐
│  cc-master plugin（per-harness 适配器）                  │
│  命令 / skills / rules / hooks                          │
│  → Claude Code · Codex · Cursor · kimi-code            │
├─────────────────────────────────────────────────────────┤
│  ccm CLI + @ccm/engine（独立产品）                       │
│  board / Goal Contract / worker / agent registry /      │
│  quota / model policy / runtime / monitor / viewer      │
├─────────────────────────────────────────────────────────┤
│  ccm web-viewer（只读，内嵌于 ccm 二进制）               │
│  Graph / Board / List / Timeline / DecisionCard         │
└─────────────────────────────────────────────────────────┘
```

- **第一层**：per-harness 插件适配器——把同一套命令/skill/hook 翻译成各 harness 的原生形态。
- **第二层**：`ccm` CLI 与 `@ccm/engine`——与 harness 解耦的独立引擎产品，负责 board、worker、配额、模型策略。
- **第三层**：`ccm web-viewer`——只读浏览器视图（Graph / Board / List / Timeline / DecisionCard）。

### 4.2 源码到适配器的投影模型（paragoge 风格）

```text
plugin/src/                      ← 规范源码（SSOT）
  skills/                        ← SAP: <skill>/canonical/ + adapters/<host>/strategy.yaml
  hooks/                         ← PHIP: _manifest/ + _hosts/<host>/ + implementations/<host>/
  commands/                      ← 命令体源码
  adapters/                      ← 跨表面 host 原生调用映射
plugin/dist/<host>/              ← 生成的适配器产物（提交进仓库）
  cc-master-plugin-claude-code-<version>.zip
  cc-master-plugin-codex-<version>.zip
  cc-master-plugin-cursor-<version>.zip
  cc-master-plugin-kimi-code-<version>.zip
```

### 4.3 Board v2 数据模型（窄腰设计）

Board 是 `~/.cc_master/boards/<UTC时间戳>-<pid>.board.json` 的 JSON 文件：

```json
{
  "schema": "cc-master/v1",
  "goal": "...",
  "owner": { "active": true, "session_id": "abc123", "heartbeat": "..." },
  "git": { "worktree": "/.../.claude/worktrees/i18n", "branch": "feat/i18n-rollout" },
  "wip_limit": 4,
  "tasks": [
    { "id": "T0", "status": "done", "deps": [], "artifact": "commit a1b2c3", "verified": true },
    { "id": "T1", "status": "in_flight", "deps": ["T0"], "mechanism": "sub-agent", "handle": "bg-7a" },
    { "id": "D1", "status": "blocked", "blocked_on": "user", "title": "PR 要不要拆成两个？" }
  ],
  "log": []
}
```

**任务状态枚举**：`ready / in_flight / blocked(blocked_on:"user"|"<taskid>") / done / escalated / failed / stale / uncertain`

**窄腰原则**：只有一小撮固定字段被 hooks 依赖——`schema / goal / owner.session_id / git / tasks[{id,status,deps}]` + 状态枚举；其余全是"给 Agent 的自由形态"。要改动窄腰，必须同一个 PR 里同步更新所有 hooks + 测试。

### 4.4 8 个分布式 Skill（所有 harness 共享）

| Skill | 职责 |
|-------|------|
| `master-orchestrator-guide` | 项目负责人身份、主线决策、切片 DAG 调度、派发/恢复/验收/账户切换边界 |
| `authoring-workflows` | 在可用主机上确定性编写 workflow；不支持的主机显式降级 |
| `using-ccm` | ccm CLI 全操作手册、board 模型、状态机、Agent Registry 与引擎校验规则 |
| `slicing-goals-into-dags` | 把目标切片成可早交付、可并行、可验证的 DAG |
| `dev-as-ml-loop` | 把单个开发任务当"提出 → 测量 → 调整 → 收敛"的优化循环 |
| `engineering-with-craft` | DDD / SDD / TDD / OOP 工程手艺与实现红线 |
| `pacing-and-estimation` | 消费 ccm 只读建议（usage / estimate / baseline）做节奏与估算 |
| `distilling-lessons-into-assets` | 把复盘证据路由到 discipline-doc / skill / workflow / subagent 资产 |

### 4.5 O / T1 / T2 / T3 统一模型分配

| 角色 | 用途 |
|------|------|
| **O**（orchestrator） | 系统/架构/设计、对抗性审查 |
| **T1** | 规格完成后的主要实现 |
| **T2** | 常规审查、测试、仓库调研、结构化总结 |
| **T3** | 机械性、低风险、高可验证性的批量工作 |

### 4.6 Hooks：dormant-until-armed（沉睡直到被武装）

每个 hook 在会话被 `as-master-orchestrator` 接管并激活 board 之前完全沉睡；只有 `bootstrap-board.sh` 例外（它本身就是武装动作）。7 类能力：

| Hook | 能力 |
|------|------|
| `bootstrap` / `resume` | 建 board / 接管旧 board |
| `reinject` / orchestrator context | 压缩后恢复身份、Goal Contract、任务、机器级事实 |
| `verify-board` | 停止门：检查未完成目标、后台 Agent、真实完成证据 |
| `board-guard` / `board-lint` | 阻止手动改 board；写后结构校验 |
| `usage-pacing` | 消费 ccm 缓存的配额/建议 |
| `coordination inbox` | 跨会话的决策级通知 |
| `identity` / `critical-path nudge` | 长会话中恢复角色 + 关键路径注意力 |

### 4.7 配额姿态与蒙特卡洛预测

- **Quota posture**：按 provider 缓存的机器级配额信号——Claude Code 5h/7d、Codex 7d 硬限制、Cursor 计费周期、kimi-code 滚动 5h/7d。
- **Monte Carlo 预测**：对调度计划做上千次模拟，给出交付概率估计——不再拍脑袋承诺"明天能好"，而是给分布。

### 4.8 双版本线（ADR-022）

| 产品 | 版本 tag 模式 | 发布轨道 |
|------|--------------|----------|
| cc-master 插件 | `v0.22.0`（裸版本） | 插件发布 |
| `ccm` 引擎 | `ccm-v0.23.0` | ccm 发布 |

插件与引擎是两条独立版本线，可分别锁定——这保证了"引擎升级不炸插件、插件更新不必等引擎"。

## 五、设计哲学

### 5.1 指挥家从不亲自演奏

协调者负责协调，绝不亲自做单元工作。任何把主线推向"亲自实现/亲自审查"的改动方向都是错的——这是整个系统最重要的一条红线。

### 5.2 注意力再分配

系统的终极目标不是"自动化一切"，而是**把人类注意力重新分配到真正值得花的地方**。拆解、调度、进度、记账这类确定性脏活自动化；品味、设计、方向这类不可外包的判断留给人。

### 5.3 ship-anywhere（随处可运行）

hooks 只用 **bash + node/JS**（Claude Code 宿主保证的运行时），不用 `jq` / `python` / 原生 TS；不依赖 `agent-teams` 或定时例行（不可靠）；定时原语（CronCreate）只用于看门狗，不用于常规调度。

### 5.4 dormant-until-armed（沉睡直到被武装）

不激活就不存在：所有 hook 在会话接管并激活 board 之前完全沉睡，把"未使用时的副作用"降到零。

### 5.5 窄腰（Narrow Waist）

hooks 只依赖极小固定字段集，其余全部是 Agent 可自由发挥的空间；改动窄腰必须同 PR 更新所有 hooks + 测试。这让系统在"确定性核心"与"Agent 自由度"之间取得平衡。

### 5.6 双版本线解耦

插件与引擎独立发版、可分别锁定版本，架构决策落在 ADR 里（已有 39 条 ADR）。这是"长线架构决策"的体现：选型按三年维度做，不搞临时方案。

### 5.7 明确的使用边界

设计哲学里最反直觉的一点是**主动划出"不该用"的边界**：十分钟能改完的小修复，直接做，别请项目负责人。系统为"太大、太乱、太长"的目标而生——工作越大越值得。

## 六、归纳总结：观点与结论

1. **单次对话的记忆不该是唯一的工作状态**：把 Board 持久化到磁盘、跨上下文重置与会话交接存活，是长期 Agent 工作从"demo"走向"可生产"的关键一步。

2. **编排优于发明**：cc-master 不发明新的 Agent，而是把 Claude Code / Codex / Cursor / kimi-code 编排到一起——复用已有的认证与能力，价值在"指挥"，不在"乐器"。

3. **人类注意力是稀缺资源，应被再分配**：自动化确定性脏活（拆解/调度/记账），保留不可外包的判断（品味/设计/方向），是 AI 辅助编码时代的正确分工。

4. **"许愿式全自动"是伪需求**：显式 Goal Contract + 验收门 + discuss 机制证明，真正可用的编排必须把人类放回决策环，而不是绕过人类。

5. **配额意识是长期任务的地基**：蒙特卡洛交付预测 + 按 provider 的配额姿态，把"能不能按时交付"从拍脑袋变成概率分布。

6. **确定性核心与 Agent 自由度可以共存**：窄腰 board + dormant hooks + ship-anywhere 运行时，让系统既有可验证的确定性，又保留 Agent 的灵活性。

7. **跨 harness 适配是系统工程**：同一套 skill/hook/命令投影到 4 个 harness 的原生形态（SAP/PHIP 模型），比"为每个 harness 各写一套"更可持续。

8. **边界意识是成熟的标志**：明确"什么时候不该用"，比堆功能更能体现一个工具对自身定位的清醒。

## 参考资料

- 仓库主页：https://github.com/nemori-ai/cc-master
- 中文 README：`README_zh.md`
- 功能手册：`design_docs/feature-manual.md`
- 能力模型：`design_docs/cross-harness-orchestration-capability-model.md`
- 完整规格：`design_docs/spec.md`
- 词汇表：`design_docs/glossary.md`
- 架构决策记录：`adrs/ADR-001…ADR-039`
- 命令目录：`plugin/src/skills/using-ccm/canonical/references/command-catalog.md`
