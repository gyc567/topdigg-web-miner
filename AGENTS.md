# AGENTS.md

仓库级 AI 代理指令（适用于 jcode、Claude Code、Cursor、Copilot、Aider 等所有触及本仓库的编码代理）。当某个行为适用于**每一个**代理时，编辑本文件；只适用于单一工具的行为不要写在这里。

> 配套文档：项目架构详见 [`STEERING.md`](STEERING.md)；施工计划与文档工作流遵循以下章节。

---

## 项目施工计划（PLANS.md + plans/）

**所有进行中的施工计划必须先沉淀在 `plans/` 目录，并在 `PLANS.md` 建立索引。**

### 计划生命周期

1. **创建**：开工前，先将计划写入 `plans/xxx.md`
2. **建索引**：在 `PLANS.md` 添加对应条目
3. **开工检查**：**动手实现任何代码之前，必须先检查 `PLANS.md` / `plans/`，确认当前计划存在且与任务一致**；计划缺失时不得直接开工
4. **执行**：严格按计划推进，完成一步勾选一步
5. **完工删除**：施工完成后，**删除 `plans/xxx.md` 并从 `PLANS.md` 移除对应条目**
6. **留档**：计划文件删除后，仅靠 **git commit log 留档**（不要将已完工的计划挪入 `docs/` 常驻，避免文档膨胀）

### 计划模板

```markdown
# Plan: [我们要做什么]

## Context
为什么需要做这件事。

## Goals
- [ ] 目标 1
- [ ] 目标 2

## Tasks
- [ ] 任务 1
- [ ] 任务 2

## Verification
如何确认成功（构建命令 / 验收标准）。
```

---

## 项目文档（DOCS.md + docs/）

**在推进开发的过程中，自动将文档沉淀到 `docs/` 目录，并在 `DOCS.md` 建立索引。**

### 文档规则

- 文档是**永久资产**——施工完成后**不得删除**（与计划文件不同）
- 采用**多级索引**（二级、三级），防止单个文件无限膨胀
- 相关文档在 `DOCS.md` 中互相交叉链接
- 文档新增/修改时，同步更新 `DOCS.md`

### 文档索引结构（多级）

```markdown
# 文档索引

## 指南
- [博客 Frontmatter 规范](docs/blog-frontmatter-guide.md)

## 优化方案
- [SEO + GEO 优化方案 v3](docs/seo-geo-optimization-plan.md)

## 规范（有明确反馈的改进）
- [前端优化规范](docs/guidelines/frontend-optimization.md)
```

### 文件膨胀红线

- 单个 `docs/*.md` 超过约 200 行时，必须拆分为子文档并在 `DOCS.md` 建立二级/三级索引
- 目录超过 8 个文件时，归入子目录（如 `docs/guidelines/`、`docs/reports/`）

---

## 反馈驱动的改进规范（有明确反馈的改进必须遵循）

对于**有明确反馈回路**的改进（前端优化、回测评估、性能调优、SEO/GEO 优化等），代理**必须**遵循对应的专门规范，规范文档本身沉淀在 `docs/guidelines/` 并在 `DOCS.md` / `PLANS.md` 建立索引。

| 领域 | 核心要求 | 规范文档 |
|------|---------|---------|
| 前端优化 | **改前端要看着浏览器**——可视化验证，不能只做代码审查 | [docs/guidelines/frontend-optimization.md](docs/guidelines/frontend-optimization.md) |
| 性能调优 | 先测量后优化，before/after 基准对比 | [docs/guidelines/performance-tuning.md](docs/guidelines/performance-tuning.md) |
| 回测评估 | 量化指标（胜率/夏普/回撤），历史数据验证 | [docs/guidelines/backtest-evaluation.md](docs/guidelines/backtest-evaluation.md) |
| SEO/GEO 优化 | 以收录/流量/KPI 数据为反馈，方案落盘后按数据迭代 | [docs/guidelines/seo-geo-optimization.md](docs/guidelines/seo-geo-optimization.md) |

> 新增改进领域时：先写规范文档 → 在 `DOCS.md` 建索引 → 在本文表格补一行。

---

## 北极星指标（North Star Metrics）

**所有 AI 工作都应推进以下指标。** 做决策时，优先选择能提升这些分数的方案；推理与方案取舍必须围绕北极星指标对齐。

### 主要指标

| 指标 | 目标 | 为什么 |
|------|------|--------|
| 博客内容完整性 | 每篇博客 4 语言齐全（zh-Hans/zh-Hant/en/ja）且 frontmatter 一致 | 内容站核心价值 |
| SEO 收录覆盖 | sitemap 全部 URL 被收录（GSC/Bing KPI 达成） | 流量来源 |
| 页面性能 | Core Web Vitals 达标（LCP < 2.5s、CLS < 0.1、INP < 200ms） | 用户体验与排名 |
| 构建健康 | `npm run build`（含 build:blog/sitemap/llms/vite）全绿 | 工程质量底线 |
| 前端交互质量 | 页面渲染与交互经浏览器实测无误（无 404、无控制台报错） | 用户体验 |

### 决策框架

不确定时，依次自问：

1. 这个改动是否**提升**某个北极星指标？
2. 是否在**维持**现有指标的同时增加价值？
3. 两者皆非——这个任务是否应该独立出去？

### 指标追踪

- 指标变化记录在**计划文档**和 **PR 描述**中
- 改进必须**量化**（如 "LCP 从 3.1s → 2.2s"、"收录页从 41 → 54"），不能只定性描述
- 无法量化的改进需说明与北极星指标的关联路径

---

## 与既有文档的关系

- `CLAUDE.md`：CLI 使用基础指引（命令、架构、内容管理）
- `STEERING.md`：项目架构与开发工作流全解
- `AGENTS.md`（本文件）：**代理行为约定**——计划/文档/规范/北极星指标工作流
