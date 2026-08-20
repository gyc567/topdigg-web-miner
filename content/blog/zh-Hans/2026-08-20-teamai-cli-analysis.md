---
title: "TeamAI CLI 深度解析：腾讯如何用Git原生架构统一多Agent团队协作"
date: "2026-08-20"
description: "TeamAI是腾讯开源的Agent Harness工具，通过Git原生方式管理技能库、规则和知识，实现跨Agent（Claude Code/Codex/CodeBuddy等）的团队协作。本文全面解析其设计哲学、架构、核心命令和详细教程。"
tags:
  - TeamAI
  - Agent Harness
  - AI Agent
  - Git
  - Claude Code
  - 腾讯
  - 多Agent协作
  - 团队知识管理
  - MCP
categories:
  - 深度解析
---

## 一、项目概述：让每个AI Agent都用上同一套"驾驭系统"

### 1.1 什么是Agent Harness？

在AI Agent的语境下，"Harness"（驾驭系统）指的是**围绕大模型的运行时中间层**，负责将一个"只会说话"的LLM转变为一个"能真正做事"的可信赖Agent。

传统的LLM交互是**请求-响应**模式——你问，它答，答完结束。但真正的AI Agent需要：

- **规划（Plan）**：将复杂任务分解为可执行步骤
- **行动（Act）**：调用工具、执行代码、读写文件
- **观察（Observe）**：获取工具执行结果，形成反馈循环

Harness就是连接这三者的运行时骨架。不同AI Agent产品（Claude Code、Codex、CodeBuddy、WorkBuddy等）各自封装了自己的Harness，但它们的内部技能、规则和团队知识往往散落在各处，无法复用。

### 1.2 TeamAI的定位

**TeamAI的核心理念**：Make every AI coding agent work by the same harness.

也就是说，不管团队用哪款Agent产品，都应该共享同一套：
- **技能（Skills）**：Agent的专业能力包
- **规则（Rules）**：团队编码规范和流程约束
- **文档（Docs）**：共享知识库
- **环境变量（Env）**：密钥和配置

而连接这一切的纽带，正是每个技术团队都已经熟悉的——**Git**。

---

## 二、核心设计哲学

### 2.1 Git是团队知识管理的最佳载体

这是TeamAI最核心的设计哲学：**用Git管理AI Agent的团队知识，而不是新建一套系统。**

为什么选择Git？因为Git天然解决了团队协作中的核心问题：

| Git概念 | 对应TeamAI能力 |
|---------|---------------|
| 远程仓库（Remote） | 团队共享的知识库 |
| 分支（Branch） | 个人实验或专项技能 |
| Merge Request（MR） | 团队评审机制 |
| Pull/Push | 知识同步 |
| Commit历史 | 知识演进轨迹 |
| Rollback | 错误知识快速回滚 |

这意味着：引入TeamAI**不需要改变团队现有的Git工作流**，不需要额外的数据库或服务，不需要额外部署。

### 2.2 无基础设施思维（Zero-Infrastructure）

真正的知识管理应该零成本维护。TeamAI不依赖任何额外服务：

- **存储**：直接用Git仓库
- **搜索索引**：本地 `search-index.json`，按需构建
- **认证**：复用的Git平台认证（GitHub gh CLI / TGit / CNB）

这与传统方案有本质区别：

- **对比向量数据库方案**：不需要部署向量数据库服务，不需要管理embedding pipeline
- **对比规则引擎方案**：规则直接存储为YAML文件，可以在MR中review，可以git blame
- **对比集中式知识库**：不需要维护一个中心化的文档系统，每个团队可以fork并定制

### 2.3 知识来源于摩擦（Friction-Driven Learning）

TeamAI认为：**最有价值的知识来源于摩擦时刻**。

当Agent在执行过程中遇到以下情况时，往往蕴含着团队最宝贵的经验：

- 工具调用被拒绝（Denied tool calls）
- 执行失败后重试（Failing tools retried）
- 人工纠正（Corrections）
- 执行中断（Interrupts）

TeamAI的Stop Hook会记录每次Session的"摩擦得分"，高分Session自动触发 `/teamai-share-learnings`，将经验分享到团队知识库。这种设计让知识积累自然融入日常工作，无需额外流程。

### 2.4 隐私优先的共享文化

团队知识共享不能以牺牲个人隐私为代价。TeamAI的Session分享默认只包含：

- 工具调用次数和类型（不含具体prompt内容）
- 聚合的统计数据

如需分享详细prompt内容，必须显式使用 `--include-prompt` 参数，系统会自动执行Secret清理（如 `ghp_xxxx` → `<REDACTED:token>`）。

---

## 三、架构解析

### 3.1 整体架构

TeamAI CLI由以下核心模块组成：

```
src/
├── providers/          # Git平台抽象层
│   ├── github/         # GitHub（gh CLI 或 GITHUB_TOKEN）
│   ├── tgit/           # 腾讯TGit（gf CLI）
│   └── cnb/            # CNB（cnb.cool）
├── resources/          # 资源类型处理器
│   ├── skills/         # 技能包
│   ├── rules/          # 规则
│   ├── docs/           # 文档
│   └── env/            # 环境变量
├── utils/              # 工具函数
└── *.ts                # 命令入口
```

**关键特点**：
- 所有Git操作使用**隔离的Git Worktree**——工作目录和当前分支永远不受影响
- 使用 `simple-git` 库操作Git，不直接操作git命令
- 所有配置存储在 `teamai.yaml` 中

### 3.2 知识检索：BM25 + 知识图谱双驱动

TeamAI的搜索系统采用混合策略：

**BM25（稀疏检索）**：
- 使用 `Intl.Segmenter` 进行中英文混合分词
- 对中文复合词（如"超时"、"排查"）使用二元分词（bigram）
- 评分公式：`title×3 + tags×2 + body×1 + vote×0.5（上限+5）`

**知识图谱（稠密检索）**：
- 通过 `teamai import` 命令从代码库导入结构化知识
- 在 `teamwiki/` 目录下构建代码库图谱
- 支持增量导入（`--incremental`）

**Recall工作流**：
1. 用户输入查询
2. `teamai-recall` 子代理先做相关性预检（`teamai recall --check`）
3. 预检通过才执行实际检索
4. 检索结果中，项目知识得分高于用户个人知识（当项目活跃时）

### 3.3 Git Provider抽象

TeamAI定义了统一的 `GitProvider` 接口，支持三种Git平台：

| Provider | 适用场景 | 认证方式 |
|----------|---------|---------|
| `github` | 开源项目 / 外部团队 | gh CLI 或 `GITHUB_TOKEN` |
| `tgit` | 腾讯内部团队 | gf CLI + iOA SSO / Device Code |
| `cnb` | CNB用户 | `cnb login` 或 `CNB_TOKEN` |

新增Provider只需实现 `GitProvider` 接口的6个方法：`parseRepoInput` / `authenticate` / `cloneRepo` / `createRepo` / `createPullRequest` / `getDefaultEmailDomain`，然后在 `registry.ts` 中注册即可。

---

## 四、核心命令详解

### 4.1 初始化（init）

```bash
# 方式一：使用已有的团队仓库
teamai init https://github.com/your-org/teamai-repo

# 方式二：当前仓库作为团队仓库（单仓库模式）
teamai init .

# 方式三：HTTP只读模式（用于无git访问权的Agent）
teamai init --http https://api.example.com --token <key>

# 参数说明
--scope project    # 将 .teamai/ 放在项目目录（默认）
--scope user       # 将 .teamai/ 放在用户主目录
--inherit-user-scope  # 项目scope继承用户scope的安全资源
```

初始化会完成：
1. Git平台OAuth登录
2. Clone团队仓库到本地
3. 注册为团队成员
4. 注入SessionStart/Stop Hooks到Agent配置

### 4.2 推送知识（push）

```bash
# 推送本地资源到团队仓库
teamai push

# 推送指定角色关联的资源
teamai push --role developer

# 静默模式（不打开MR）
teamai push --silent

# 推送统计信息
teamai push --stats

# 推送Session记录
teamai push --sessions
```

Push的工作流程：本地资源 → 创建功能分支 → Commit → 打开MR → 等待团队Review。

### 4.3 拉取知识（pull）

```bash
# 拉取团队最新资源
teamai pull

# 预览模式（查看将要拉取的内容）
teamai pull --dry-run

# 强制覆盖本地
teamai pull --force
```

Pull会自动同步到Agent工具（Claude Code等），由SessionStart Hook自动触发。

### 4.4 知识召回（recall）

```bash
# 搜索团队知识库
teamai recall "如何处理超时问题"

# 启用/禁用自动recall
teamai recall enable
teamai recall disable

# 查看recall状态
teamai recall status

# 预检模式（不执行实际检索）
teamai recall --check "查询内容"
```

### 4.5 构建代码库知识图谱（import）

```bash
# 从本地目录导入
teamai import --dir ./src

# 从其他仓库导入
teamai import --from-repo owner/repo

# 从组织批量导入
teamai import --from-org tencent

# 从MR导入
teamai import --from-mr https://github.com/owner/repo/pull/123

# 增量导入
teamai import --incremental

# 跳过enrich阶段（加速）
teamai import --skip-enrich
```

### 4.6 团队成员管理（members）

```bash
# 查看成员列表
teamai members list

# 添加成员
teamai members add <username>
```

### 4.7 角色管理（roles）

```bash
# 初始化角色配置
teamai roles init

# 添加角色
teamai roles add developer --description "开发角色"

# 设置成员角色
teamai roles set @username developer

# 查看角色列表
teamai roles list
```

### 4.8 其他常用命令

```bash
# 查看本地与团队仓库差异
teamai status

# 分享本次会话经验
teamai contribute --file ./session.md

# 查看技能目录
teamai skill list

# 查看技能详情
teamai skill show <skill-name>

# 管理MCP服务器
teamai mcp list
teamai mcp inject

# 管理团队环境变量
teamai env add API_KEY=xxx
teamai env list
teamai env --reveal

# 使用仪表盘（Web界面）
teamai dashboard --port 3721

# 诊断配置问题
teamai doctor

# 交互式分享体验
teamai contribute
```

---

## 五、跨团队技能订阅

### 5.1 添加外部技能源

```bash
# 添加GitHub仓库作为技能源
teamai source add https://github.com/other-team/teamai-skills --name other-skills

# 添加HTTP端点（只读）
teamai source add-http https://api.example.com/teamai --name external

# 浏览可用技能
teamai source browse

# 列出已配置的技能源
teamai source list
```

### 5.2 订阅机制说明

跨团队订阅允许团队复用其他团队的技能库，类似于npm的包管理理念。订阅后，可以像使用本地技能一样使用外部技能：

```bash
# 查看所有可用技能（含订阅源）
teamai skill list --source all

# 查看指定源
teamai skill list --source other-skills
```

---

## 六、Hook与MCP扩展机制

### 6.1 Hook系统

TeamAI通过 `hooks/hooks.yaml` 定义生命周期钩子，支持Agent行为的自定义扩展：

```yaml
# hooks/hooks.yaml 示例
PostToolUse:
  - name: teamai-recall
    script: ${TEAMAI_CLI}/dist/teamai-recall.js
    trigger: recall
```

支持的Hook类型：
- `SessionStart`：会话启动时（自动执行pull）
- `Stop`：会话结束时（评分 + 触发learnings分享）
- `PostToolUse`：工具调用后（recall预检）

### 6.2 MCP服务器管理

通过 `mcp/mcp.yaml` 配置MCP服务器：

```yaml
mcpServers:
  filesystem:
    command: npx
    args: ["-y", "@modelcontextprotocol/server-filesystem", "./workspace"]
  slack:
    command: npx
    args: ["-y", "@modelcontextprotocol/server-slack"]
    env:
      SLACK_BOT_TOKEN: ${SLACK_BOT_TOKEN}  # Secret引用
```

环境变量使用 `${VAR}` 语法，TeamAI会在写入磁盘前解析为实际值。

---

## 七、与Claude Code的集成

### 7.1 集成原理

TeamAI通过Agent的Hook机制与具体Agent产品解耦。以Claude Code为例：

1. **SessionStart Hook** → 自动执行 `teamai pull`
2. **Stop Hook** → 评分Session，将高分Session的经验推送到团队仓库
3. **Recall** → Agent执行任务前搜索团队知识

### 7.2 支持的Agent列表（28个）

通过 `teamai list --agent <id>` 可以查看所有已注册的Agent，包括：claude、codex、codebuddy、workbuddy、copilot等。

---

## 八、设计哲学总结

### 8.1 核心理念回顾

1. **Git是团队知识的最佳载体**：不需要引入新的基础设施，不改变现有的Git工作流，完美融入已有的代码协作流程。

2. **零基础设施（Zero-Infrastructure）**：不需要部署数据库，不需要管理embedding服务，不需要额外部署文档系统。

3. **知识来源于摩擦（Friction-Driven）**：最有价值的经验来自错误和困难时刻，系统主动捕捉这些时刻并转化为团队知识。

4. **隐私优先的共享文化**：默认只分享聚合统计数据，敏感信息自动清理，分享无需顾虑。

5. **版本控制一切（Version Control Everything）**：技能、规则、文档、环境变量都可以版本化管理、回滚和review。

### 8.2 局限性

- 默认推送目标分支为 `master`（而非 `main`），存在遗留问题
- Git操作隔离依赖worktree，复杂度全部由CLI承担
- Recall质量依赖知识库维护程度，不维护则无价值
- 多语言站点（中文/英文/日文等）内容需要手动同步

### 8.3 适用场景

✅ **强烈推荐使用**：
- 多Agent团队协作（不同Agent产品，不同成员）
- 需要统一编码规范和最佳实践的团队
- 有Git仓库基础的技术团队

⚠️ **不太适合**：
- 个人用户（引入复杂度大于收益）
- 非技术团队（Git工作流门槛较高）
- 需要实时协作知识的场景（Git的异步模型有延迟）

---

## 九、快速入门教程

### 9.1 安装

```bash
# 通过npm安装（推荐）
npm install -g teamai-cli

# 验证安装
teamai --version
```

### 9.2 初始化团队仓库

```bash
# 方式1：使用已有的团队仓库
teamai init https://github.com/your-org/teamai-knowledge

# 方式2：当前项目作为团队仓库
teamai init .
```

### 9.3 推送第一条经验

```bash
# 在Claude Code中完成一次任务后
teamai contribute

# 或者直接指定文件
teamai contribute --file ./session-summary.md
```

### 9.4 团队成员拉取

```bash
# 拉取团队最新知识
teamai pull

# 搜索相关知识
teamai recall "我们团队如何处理API超时"
```

### 9.5 查看状态

```bash
# 查看本地与团队的差异
teamai status

# 打开Web仪表盘
teamai dashboard --port 3721
```

---

## 十、技术栈与工程实践

### 10.1 技术选型

| 类别 | 技术 |
|------|------|
| 语言 | TypeScript（严格模式） |
| 模块系统 | ESM（`"type": "module"`） |
| CLI框架 | Commander.js |
| Git操作 | simple-git |
| 构建工具 | tsup |
| 测试框架 | Vitest |
| 配置格式 | YAML + TOML |
| 运行时校验 | Zod |
| 前端 | 无（纯CLI） |

### 10.2 开发规范

- 使用 [conventional commits](https://www.conventionalcommits.org/)：`feat:`、`fix:`、`docs:`、`test:`、`refactor:`
- 测试覆盖率目标 ≥ 80%
- 单元测试放在 `src/__tests__/`，文件名镜像（如 `init.test.ts`）
- 外部I/O在模块边界mock，网络测试由环境变量（如 `TEAMAI_TEST_TOKEN`）保护

---

## 十一、总结与展望

TeamAI代表了AI Agent团队协作的一种重要方向：**用成熟工具（Git）解决新问题（Agent知识管理）**，而不是发明新的基础设施或协议。

它的核心价值在于：

- **降低团队协作成本**：不需要改变工作流，不需要学习新工具
- **提升Agent一致性**：不同Agent、不同成员共享同一套知识底座
- **积累团队智慧**：将个人经验转化为团队资产，让后来的成员受益

如果你正在构建多Agent系统或管理AI Agent团队，TeamAI提供了一个经过大规模实践验证的参考架构。即使你不使用TeamAI本身，它的**Git原生知识管理**理念也值得深入思考和借鉴。

**项目地址**：https://github.com/Tencent/teamai-cli
**npm包**：`teamai-cli`
**当前版本**：0.19.0

---

*本文基于2026年8月的项目最新状态编写，v0.19.0版本为未发布版本（Unreleased），部分功能细节可能随版本更新发生变化。*
