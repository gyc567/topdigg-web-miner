---
slug: swarmforge-analysis
title: "SwarmForge：基于tmux的多AI Agent编排平台"
description: "深入解析 SwarmForge（基于tmux的AI Agent编排平台）—— 通过工作流配置（two-pack/four-pack/six-pack）、Worktree隔离、Handoff协议和宪法结构，实现多个AI代理协同开发软件项目。详细涵盖：项目架构、三种预设工作流、工作机制、配置驱动设计理念和使用示例。"
date: "2026-08-13"
author: "TopDigg"
tags: ["SwarmForge", "Multi-Agent", "tmux", "AI Agent", "Orchestration", "Worktree", "Handoff", "Developer Tools", "AI Agents"]
categories: ["Deep Dive"]
keywords: ["SwarmForge", "多智能体", "tmux", "AI Agent编排", "Worktree隔离", "Handoff协议", "软件工程", "自动化", "开发者工具", "AI协作", "four-pack", "six-pack"]
---

# SwarmForge：基于tmux的多AI Agent编排平台

> 核心思想：**让多个AI代理像一支开发团队一样协同工作。** SwarmForge 是一个轻量级的多AI Agent编排平台，运行在本地tmux环境中，通过配置驱动的方式协调多个AI代理共同开发软件项目。它不追求复杂的云服务或花哨的界面，而是专注于让AI Agent在隔离的git worktree中高效协作，通过结构化的Handoff协议传递任务和上下文。这是一份完整解析 SwarmForge 项目架构、核心机制、三种预设工作流和使用指南。

## 一、项目介绍与概述

### 1.1 一句话定位

**SwarmForge 是一个基于tmux的多AI Agent编排平台，通过配置驱动的工作流让多个AI代理在独立的git worktree中协同开发软件项目。**

它的核心理念是"配置即代码"——不依赖硬编码的工作流程，而是通过 `swarmforge.conf` 配置文件和角色提示词定义整个团队的协作方式。每个角色（Agent）在自己的隔离环境中工作，通过结构化的Handoff文件传递任务和上下文。

### 1.2 项目元信息

| 字段 | 值 |
|------|-----|
| GitHub | [unclebob/swarm-forge](https://github.com/unclebob/swarm-forge) |
| Stars | 待确认 |
| 许可证 | 待确认 |
| 语言 | Shell + 配置文件 |
| 作者 | unclebob（fork by gyc567）|
| 依赖 | tmux, git |

### 1.3 核心价值主张

SwarmForge 的核心价值可以用三个词概括：

- **轻量化运行**：运行在本地tmux环境中，无需复杂的云基础设施
- **配置驱动**：所有工作流通过配置文件定义，而非硬编码
- **隔离协作**：每个角色在独立的git worktree中工作，避免相互干扰

### 1.4 与其他多Agent系统的区别

SwarmForge 与其他多Agent系统（如 CrewAI、AutoGen、LangChain Agents）的最大区别在于：

```
┌─────────────────────────────────────────────┐
│  其他多Agent系统                              │
│  - 复杂的消息传递机制                         │
│  - 集中式协调器                              │
│  - 需要API密钥和云服务                        │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│  SwarmForge                                  │
│  - 轻量级tmux会话                            │
│  - 分布式协作（通过Handoff文件）              │
│  - 本地运行，无需外部依赖                     │
└─────────────────────────────────────────────┘
```

## 二、核心设计哲学

### 2.1 配置即代码

SwarmForge 最重要的设计原则是**配置驱动**。这体现在：

**声明式工作流**
- 不需要编写复杂的协调代码
- 在 `swarmforge.conf` 中声明工作流和角色
- 系统根据配置自动创建tmux窗口和会话

**角色提示词外部化**
- 每个角色的行为由 `roles/` 目录下的提示词定义
- 可以随时修改角色行为，无需改动核心代码
- 支持为不同项目定制专属角色

**宪法约束**
- 通过 `constitution.prompt` 定义团队行为准则
- 包含工程规范（engineering.prompt）
- 定义Handoff协议（handoffs.prompt）
- 明确工作流规则（workflow.prompt）

### 2.2 隔离优先

**Worktree隔离**
- 每个角色在独立的git worktree中工作
- 避免多个Agent同时修改同一代码库
- 可以并行处理不同的任务分支

**会话隔离**
- 每个角色拥有独立的tmux窗口
- 可以实时观察每个Agent的状态
- 不会因为一个Agent的问题影响其他Agent

### 2.3 Handoff协议

**结构化任务传递**
- Agent之间通过Handoff文件传递任务
- 包含当前状态、已完成工作和下一步计划
- 确保任务在Agent之间平滑传递

**上下文保留**
- 每个Handoff包含足够的上下文信息
- 接收方可以立即接手工作
- 减少重复工作和状态丢失

## 三、三种预设工作流详解

### 3.1 two-pack：快速后端任务

**适用场景**：简单到中等复杂度的后端任务

**角色配置**：
| 角色 | 功能 |
|------|------|
| coder | 负责代码编写和实现 |
| cleaner | 负责代码清理和优化 |

**工作流程**：
```
用户启动 two-pack
    ↓
coder 在独立worktree中编写代码
    ↓
coder 完成，生成 Handoff 文件
    ↓
cleaner 读取 Handoff，清理代码
    ↓
cleaner 完成，输出最终代码
```

**特点**：
- 最小配置，适合快速任务
- 两个Agent专注于各自职责
- 适合小型项目或单一功能开发

### 3.2 four-pack：中等复杂度项目

**适用场景**：中等复杂度的全栈项目

**角色配置**：
| 角色 | 功能 |
|------|------|
| specifier | 负责需求分析和规格定义 |
| coder | 负责代码编写和实现 |
| refactorer | 负责代码重构和优化 |
| architect | 负责架构设计和决策 |

**工作流程**：
```
用户启动 four-pack
    ↓
specifier 分析需求，生成规格文档
    ↓
architect 根据规格设计架构
    ↓
coder 根据架构编写代码
    ↓
refactorer 重构和优化代码
    ↓
输出最终代码库
```

**特点**：
- 四种角色，覆盖完整的开发周期
- 从需求到架构再到实现和优化
- 适合需要一定规划的中小型项目

### 3.3 six-pack：大型项目

**适用场景**：大型复杂项目，需要严格的质量保证

**角色配置**：
| 角色 | 功能 |
|------|------|
| specifier | 负责需求分析和规格定义 |
| coder | 负责代码编写和实现 |
| cleaner | 负责代码清理和优化 |
| architect | 负责架构设计和决策 |
| hardener | 负责安全加固和性能优化 |
| QA | 负责质量保证和测试 |

**工作流程**：
```
用户启动 six-pack
    ↓
specifier 分析需求，生成详细规格
    ↓
architect 设计系统架构
    ↓
coder 实现功能代码
    ↓
cleaner 清理代码风格
    ↓
hardener 进行安全和性能加固
    ↓
QA 进行全面测试和质量检查
    ↓
输出生产级代码库
```

**特点**：
- 六种角色，覆盖完整的开发周期和质量保证
- 包含安全和性能加固环节
- 适合大型项目或需要高可靠性的场景

## 四、工作机制详解

### 4.1 Worktree隔离

**Git Worktree 基础**

Git Worktree 允许同一仓库有多个工作目录。SwarmForge 利用这个特性为每个角色创建独立的工作目录：

```bash
# 查看当前worktree列表
git worktree list

# 为新角色创建worktree
git worktree add ../worktree-coder coder-branch
```

**Worktree 在 SwarmForge 中的应用**

```
主仓库 (main)
├── worktree-specifier/  (specifier 的工作目录)
├── worktree-coder/      (coder 的工作目录)
├── worktree-architect/  (architect 的工作目录)
└── ...
```

每个worktree对应不同的分支，确保：
- Agent可以在不影响主分支的情况下工作
- 可以同时在多个分支上进行不同任务
- 通过合并或PR将工作集成到主分支

### 4.2 tmux会话管理

**tmux 会话结构**

SwarmForge 使用tmux的层次结构来组织Agent会话：

```
tmux session: swarmforge
├── window: specifier
├── window: coder
├── window: refactorer
├── window: architect
├── window: cleaner
└── window: QA
```

**窗口管理**
- 每个Agent在独立窗口中运行
- 可以随时切换窗口观察Agent状态
- 支持分屏查看多个Agent输出

**会话控制**
```bash
# 列出所有会话
tmux list-sessions

# 连接到指定会话
tmux attach -t swarmforge

# 在窗口间切换
Ctrl+b w  # 列出所有窗口
Ctrl+b n  # 下一个窗口
Ctrl+b p  # 上一个窗口
```

### 4.3 Handoff协议

**Handoff 文件结构**

Handoff文件是一个结构化的文本文件，包含：

```
=== HANDOFF ===
FROM: coder
TO: refactorer
TASK: 完成用户认证模块
STATUS: in_progress

已完成:
- 用户登录API
- 密码加密存储
- JWT Token生成

进行中:
- 用户注册API（完成80%）

待完成:
- 邮箱验证功能
- 密码重置功能

上下文:
- 使用Express框架
- 数据库使用PostgreSQL
- API前缀: /api/v1/auth
===
```

**Handoff 流程**

```
Agent A 工作
    ↓
Agent A 生成 Handoff 文件
    ↓
Agent B 读取 Handoff 文件
    ↓
Agent B 继续工作
```

**关键设计原则**
- **原子性**：每次Handoff包含完整的任务上下文
- **可追溯性**：记录所有已完成和待完成的工作
- **独立性**：接收方可以独立于发送方继续工作

## 五、宪法结构

### 5.1 宪法入口：constitution.prompt

`constitution.prompt` 是整个宪法系统的入口文件：

```
这是 SwarmForge 团队的宪法。

团队成员必须遵守以下条款：
1. 工程规范 (engineering.prompt)
2. Handoff协议 (handoffs.prompt)
3. 工作流规则 (workflow.prompt)

在执行任何任务之前，请先阅读并理解宪法条款。
```

### 5.2 工程规范：constitution/articles/engineering.prompt

定义代码质量和工程标准：
- 代码风格规范
- 提交信息格式
- PR/MR创建规范
- 代码审查标准

### 5.3 Handoff协议：constitution/articles/handoffs.prompt

定义Agent之间的任务传递规则：
- Handoff文件格式
- 状态转换规则
- 错误处理机制

### 5.4 工作流规则：constitution/articles/workflow.prompt

定义工作流的执行规则：
- 各角色的职责定义
- 任务分配规则
- 完成标准

### 5.5 角色定义：roles/

`roles/` 目录包含各角色的提示词：

```
roles/
├── specifier.prompt      # 需求分析师
├── coder.prompt          # 程序员
├── cleaner.prompt         # 代码清理员
├── architect.prompt       # 架构师
├── hardener.prompt        # 安全加固专家
└── QA.prompt             # 质量保证工程师
```

每个角色提示词包含：
- 角色职责描述
- 与其他角色的协作方式
- 宪法条款的具体应用

## 六、多后端支持

### 6.1 支持的后端

SwarmForge 支持多种AI后端：

| 后端 | 说明 |
|------|------|
| claude | Anthropic Claude |
| codex | OpenAI Codex |
| copilot | GitHub Copilot |
| grok | x.ai Grok |

### 6.2 配置方式

在 `swarmforge.conf` 中指定后端：

```ini
[backend]
default = claude

[backend.claude]
model = claude-sonnet-4
api_key = ${ANTHROPIC_API_KEY}

[backend.codex]
model = gpt-4
api_key = ${OPENAI_API_KEY}
```

### 6.3 后端切换

可以根据任务类型切换不同后端：

```bash
# 使用 claude 后端
SWARM_BACKEND=claude ./swarm

# 使用 codex 后端
SWARM_BACKEND=codex ./swarm
```

## 七、使用示例和最佳实践

### 7.1 快速启动

**选择工作流并启动**：

```bash
# 使用 four-pack 工作流
BRANCH=four-pack
curl -L "https://github.com/unclebob/swarm-forge/archive/refs/heads/${BRANCH}.tar.gz" | tar -xz --strip-components=1
./swarm
```

**完整启动流程**：

```bash
# 1. 克隆或下载 SwarmForge
BRANCH=four-pack
curl -L "https://github.com/unclebob/swarm-forge/archive/refs/heads/${BRANCH}.tar.gz" | tar -xz --strip-components=1

# 2. 配置AI后端
export ANTHROPIC_API_KEY="your-api-key"

# 3. 配置文件（可选）
# 编辑 swarmforge.conf 配置工作流和角色

# 4. 启动 swarm
./swarm
```

### 7.2 项目配置示例

创建一个新项目的配置：

```ini
# swarmforge.conf
[project]
name = my-awesome-project
description = 一个使用SwarmForge开发的项目

[workflow]
type = four-pack

[backend]
default = claude

[backend.claude]
model = claude-sonnet-4
max_tokens = 8192

[roles.specifier]
system_prompt = 你是一个需求分析师，专注于用户友好的设计

[roles.coder]
system_prompt = 你是一个全栈工程师，擅长TypeScript和Python
```

### 7.3 最佳实践

**1. 选择合适的工作流**
- 简单任务用 two-pack
- 中等复杂度用 four-pack
- 大型项目用 six-pack

**2. 善用实时监控**
- 使用 `tmux attach` 连接会话
- 使用 `Ctrl+b w` 切换窗口
- 实时观察每个Agent的输出

**3. 正确使用Handoff**
- 确保每次Handoff包含足够的上下文
- 在Handoff文件中明确标注完成和待完成的工作
- 及时更新状态，避免重复工作

**4. 定期同步代码**
- 定期将Agent的工作合并到主分支
- 使用PR/MR进行代码审查
- 保持worktree和主分支的同步

**5. 自定义角色**
- 根据项目需求修改角色提示词
- 在 `roles/` 目录创建新的角色定义
- 确保新角色遵循宪法条款

### 7.4 故障排除

**常见问题**：

1. **tmux会话无法启动**
   - 检查tmux是否已安装：`tmux -V`
   - 检查会话是否已存在：`tmux list-sessions`

2. **AI后端连接失败**
   - 检查API密钥是否正确设置
   - 检查网络连接
   - 验证后端配置

3. **Handoff文件未生效**
   - 检查Handoff文件路径
   - 确保文件格式正确
   - 验证Agent是否正确读取了Handoff

## 八、关键观点总结

### 8.1 SwarmForge 的优势

1. **轻量化设计**
   - 运行在本地tmux环境中
   - 无需复杂的云基础设施
   - 资源消耗极低

2. **配置驱动**
   - 所有工作流可配置
   - 易于定制和扩展
   - 符合"配置即代码"原则

3. **隔离协作**
   - 每个角色独立工作
   - 避免相互干扰
   - 支持并行工作

4. **结构化Handoff**
   - 任务传递清晰
   - 上下文保留完整
   - 可追溯性强

### 8.2 适用场景

- **小型团队**：快速原型开发
- **个人开发者**：提升开发效率
- **大型项目**：复杂任务的分解协作
- **学习和实验**：理解多Agent系统

### 8.3 局限性

- **本地运行限制**：不适合需要远程协作的场景
- **tmux依赖**：需要一定的tmux使用经验
- **AI后端限制**：需要有效的API密钥

### 8.4 未来展望

SwarmForge 代表了多Agent系统的一种新思路——轻量、配置驱动、本地优先。随着AI Agent技术的成熟，这种简单而有效的编排方式可能会越来越受欢迎。

## 九、参考资源

- [SwarmForge GitHub 仓库](https://github.com/unclebob/swarm-forge)
- [tmux 官方文档](https://github.com/tmux/tmux)
- [Git Worktree 文档](https://git-scm.com/docs/git-worktree)

---

*本文由 TopDigg 自动分析整理，关注 AI Agent 和开发者工具最新动态。*
