# dsh-superagent 官方文档中文译本

本目录收录 DeepSeek 开源项目 **dsh-superagent** 的官方文档中文译本，方便中文读者在不依赖浏览器翻译插件的情况下阅读与检索。

> 上游仓库：<https://github.com/deepseek-ai/dsh-superagent-prototype>
> 许可：MIT（原仓库 LICENSE）
> 译文基准 commit：`main` 分支 2026-11-01 快照

## 文件清单

| 中文文件 | 对应上游文件 | 内容 |
|---|---|---|
| `README.zh.md` | `README.md` | 项目总览：定位、核心原则、安装入口、文档索引、开发与许可 |
| `SETUP.zh.md` | `SETUP.md` | 面向智能体的安装配置流程：探针、九个问题、计划、执行、验证交接 |
| `000-philosophy.zh.md` | `docs/000-philosophy.md` | 设计哲学：注意力预算、对智能体与对设计的约束、运维者责任 |
| `001-domain.zh.md` | `docs/001-domain.md` | 领域模型：Source、Trigger、Thread、Eval、Mandate、Ticket、Assignment、Subscription，含被拒绝概念与术语表 |
| `002-authorization.zh.md` | `docs/002-authorization.md` | 授权：Eval 与订阅两条路径、强度分级、准入表、机器人与自动化评审 |
| `003-execution.zh.md` | `docs/003-execution.md` | 执行：工单阶段、执行者、后台工作与并发槽位、执行环境变量、合并、工单终结、失败与恢复 |
| `004-prompts.zh.md` | `docs/004-prompts.md` | 提示词：团队可编辑的三个段落、内置部分、技能、版本与冲突处理 |
| `005-panel.zh.md` | `docs/005-panel.md` | 面板：三个问题、六个标签页、记录解读、设置分组、搜索、七条设计原则 |
| `006-deployment.zh.md` | `docs/006-deployment.md` | 部署：账号、权限隔离、安装、机器配置、启停、每小时自检、设置、管理 API、检查、升级、故障排查 |
| `007-architecture.zh.md` | `docs/007-architecture.md` | 架构：Engine、Store、Effects、Sources、DshExecutor、模块表、测试表、持久化、模型侧接口、配置重载 |
| `008-cookbook.zh.md` | `docs/008-cookbook.md` | 扩展手册：以 webhook Source 为例的十一步配方与检查清单 |

## 术语约定

| 英文 | 中文 |
|---|---|
| Agent | 智能体 |
| Main Session / orchestrator | 主 Session / 编排器 |
| Executor Session / worker | 执行器 Session / 执行者 |
| Source | 来源 |
| Trigger | 触发器 |
| Thread | 会话线程 |
| Eval | 评估 |
| Gate | 准入 |
| Assessment | 研判 |
| Decision | 决定 |
| Mandate | 授权 |
| Ticket | 工单 |
| Assignment | 派工 |
| Subscription | 订阅 |
| Channel | 渠道 |
| Policy | 策略 |
| Panel | 面板 |
| Deployment | 部署 |
| Admission table | 准入表 |
| Report | 报告 |
| Attention | 待人工决定 |

代码标识符（`orchestrator_route`、`DSH_SUPERAGENT_GITHUB_REPOSITORY`、`src/core/engine.ts` 等）、CLI 参数、路径、配置键一律保留原文，不作翻译。

## 重要提示

1. 上游 README 明确声明这是**仅供参考的研究原型，并非 DeepSeek 官方产品**，可能仍存在缺陷，不应直接视为生产就绪软件。
2. 上游配套论文《探索超级智能体设计：迈向更自主的智能体系统》中讨论的**部分设计属于未来发展方向，在本原型中并未实现**。阅读译文时请勿将"未来设计方向"误读为已实现功能。
3. 译文与上游可能存在细微差异，遇到歧义请以上游英文原文为准。
