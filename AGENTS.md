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
| 博客内容完整性 | 每篇博客 5 语言齐全（zh-Hans/zh-Hant/en/ja/vi）且 frontmatter 一致 | 内容站核心价值 |
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

## 工程原则（Engineering Principles）

以下 8 条是**硬性约束**，所有 AI 代理在做架构、选型、实现决策时必须遵守。违反任何一条的改动不得合入。

1. **不保留向后兼容。** 过时的直接删，别加兼容层、别写 migration、别留 fallback。删除比维护便宜。

2. **选能满足当前需求的最简单实现。** 不要预防性抽象，不要多此一举的配置层。YAGNI 原则：You Ain't Gonna Need It。

3. **系统分层长，先跑通最小端到端。** 先跑通一个最小的端到端版本，再往上加东西。绝不为了未完成的复杂度拆掉能跑的东西。

4. **组件保持模块化，关注点分离。** 每个模块只做一件事，模块间通过接口通信，不依赖实现细节。

5. **优先用成熟的、有人维护的库。** 没有明确理由别自己重写。选库看维护频率、issue 响应速度、社区活跃度。

6. **先翻项目里已有的依赖能做什么。** 再考虑加新包或自己写。别上来就假设库里没有——先查文档、看源码、跑 demo。

7. **架构决策往长了做。** 不接受"先这样以后再换"的临时方案。每次选型都假设要用 3 年。

8. **先看成熟产品怎么解决同一个问题。** 用已验证的模式，别从零发明。参考 React/Next.js/Vercel 等一线产品的做法。

---

## 编码规范（Coding Standards）

所有代码改动**必须**遵循以下原则。违反任何一条的 PR/commit 不得合入。

### 1. KISS（Keep It Stupid Simple）

- 优先最简实现，拒绝过度设计
- 每个函数/模块只做一件事
- 代码可读性 > 性能优化（除非性能是明确需求）
- 命名清晰，注释解释「为什么」而非「做了什么」

### 2. 高内聚、低耦合 + 精简设计模式

- 相关逻辑聚合在同一模块，无关逻辑分离到不同文件
- 模块间通过接口/类型通信，避免直接依赖实现细节
- 只用必要的设计模式——不用模式也是合理选择
- 新增依赖前评估：这个依赖解决的问题，是否值得引入的成本？

### 3. 100% 测试覆盖（新增功能代码）

- **所有新增功能代码必须有对应测试**，目标测试覆盖率 100%
- 测试必须覆盖：正常路径、边界条件、异常处理
- 测试文件与源码同目录或对应 `__tests__/` 目录
- 不得跳过测试、不得注释掉测试、不得删除失败测试来「通过」

### 4. 不影响无关功能

- 改动前先确认影响范围（`lsp_find_references` / grep）
- 重构时只改目标代码，不动无关模块
- 新增功能不得修改已有功能的行为（除非明确要求）
- 无法确认影响范围时，必须先询问

### 5. 保留测试用例 + 输出测试报告

- 所有测试用例代码**保留不删**（即使测试通过后也不清理）
- 完成开发后输出测试报告，包含：
  - 测试总数 / 通过数 / 失败数
  - 覆盖率（行覆盖、分支覆盖）
  - 被测功能的简要说明
- 测试报告记录在**计划文档**的 Verification 章节中

---

## 与既有文档的关系

- `CLAUDE.md`：CLI 使用基础指引（命令、架构、内容管理）
- `STEERING.md`：项目架构与开发工作流全解
- `AGENTS.md`（本文件）：**代理行为约定**——计划/文档/规范/北极星指标工作流

---

## Graft：每次任务的第一个 Context 层

> 详见 [`docs/graft-loop-integration.md`](docs/graft-loop-integration.md)

### 为什么 Graft 属于 Loop Engineering 的 Observe

每个 Loop Engineering 迭代的第一步是 **Observe（测量当前状态）** — Agent 需要在修改任何代码之前，先了解代码库的当前状态。Graft 把这个步骤从"盲目重新探索"升级为"图谱查询"：

| 旧方式 | Graft 方式 |
|--------|-----------|
| `grep` → open → `grep` → open（每次任务从零探索）| `graft ask "where is X handled" --source` |
| 每次任务消耗 8-15 个 tool calls 重新读代码 | 1 个 tool call，返回精确 file:line + 内联代码 |
| 每次任务消耗 ~15,000 tokens 重新读代码 | ~500 tokens（61% 节省，实测）|

### 使用规则

**每次任务的第一个 Context 步骤，必须先通过 Graft 获取上下文。**

1. **概念/位置问题** → `graft ask "<what>" --source`
2. **精确 symbol 搜索** → `graft grep "<symbol>"`
3. **改前影响评估** → `graft callers <sym> --depth 2`
4. **重构前全链路分析** → `graft callers <sym> --depth all`
5. **文件 API 概览** → `graft skeleton <file>`
6. **新人 onboarding** → `graft map`

**禁止**：在 Graft 能给出答案的情况下，直接用 `grep -rn` / `read` 重新遍历代码库。

**例外**：Graft 不覆盖的场景 — brand-new 未建图文件、全库穷举搜索、精确行级文本搜索。

### 工具返回格式

每个 Graft 工具的输出开头有 `[graft] tokens saved ≈ N` 行。**每次回复末尾必须报告本次节省量**：

```
🌱 graft saved ~X tokens this turn (N calls)
```

### 配置

```bash
# 深构建（可选，需要 API key）
export GRAFT_API_KEY=sk-...
export GRAFT_PROVIDER=openai  # 或 anthropic / openrouter 等
graft build --deep
```

- Graft 图谱在 `.gitignore` 中（本地缓存，不提交）
- `.claude/` 由 Git 追踪（`git add .claude && git commit` 后，队友各自运行 `graft build`）
- 详细配置与原理见 `docs/graft-loop-integration.md`

<!-- rtk-instructions v2 -->
# RTK (Rust Token Killer) - Token-Optimized Commands

## Golden Rule

**Always prefix commands with `rtk`**. If RTK has a dedicated filter, it uses it. If not, it passes through unchanged. This means RTK is always safe to use.

**Important**: Even in command chains with `&&`, use `rtk`:
```bash
# ❌ Wrong
git add . && git commit -m "msg" && git push

# ✅ Correct
rtk git add . && rtk git commit -m "msg" && rtk git push
```

## RTK Commands by Workflow

### Build & Compile (80-90% savings)
```bash
rtk cargo build         # Cargo build output
rtk cargo check         # Cargo check output
rtk cargo clippy        # Clippy warnings grouped by file (80%)
rtk tsc                 # TypeScript errors grouped by file/code (83%)
rtk lint                # ESLint/Biome violations grouped (84%)
rtk prettier --check    # Files needing format only (70%)
rtk next build          # Next.js build with route metrics (87%)
```

### Test (60-99% savings)
```bash
rtk cargo test          # Cargo test failures only (90%)
rtk go test             # Go test failures only (90%)
rtk jest                # Jest failures only (99.5%)
rtk vitest              # Vitest failures only (99.5%)
rtk playwright test     # Playwright failures only (94%)
rtk pytest              # Python test failures only (90%)
rtk rake test           # Ruby test failures only (90%)
rtk rspec               # RSpec test failures only (60%)
rtk test <cmd>          # Generic test wrapper - failures only
```

### Git (59-80% savings)
```bash
rtk git status          # Compact status
rtk git log             # Compact log (works with all git flags)
rtk git diff            # Compact diff (80%)
rtk git show            # Compact show (80%)
rtk git add             # Ultra-compact confirmations (59%)
rtk git commit          # Ultra-compact confirmations (59%)
rtk git push            # Ultra-compact confirmations
rtk git pull            # Ultra-compact confirmations
rtk git branch          # Compact branch list
rtk git fetch           # Compact fetch
rtk git stash           # Compact stash
rtk git worktree        # Compact worktree
```

Note: Git passthrough works for ALL subcommands, even those not explicitly listed.

### GitHub (26-87% savings)
```bash
rtk gh pr view <num>    # Compact PR view (87%)
rtk gh pr checks        # Compact PR checks (79%)
rtk gh run list         # Compact workflow runs (82%)
rtk gh issue list       # Compact issue list (80%)
rtk gh api              # Compact API responses (26%)
```

### JavaScript/TypeScript Tooling (70-90% savings)
```bash
rtk pnpm list           # Compact dependency tree (70%)
rtk pnpm outdated       # Compact outdated packages (80%)
rtk pnpm install        # Compact install output (90%)
rtk npm run <script>    # Compact npm script output
rtk npx <cmd>           # Compact npx command output
rtk prisma              # Prisma without ASCII art (88%)
rtk uv run <cmd>        # Compact uv project command output
```

### Files & Search (60-75% savings)
```bash
rtk ls <path>           # Tree format, compact (65%)
rtk read <file>         # Code reading with filtering (60%)
rtk grep <pattern>      # Search grouped by file (75%). Format flags (-c, -l, -L, -o, -Z) run raw.
rtk find <pattern>      # Find grouped by directory (70%)
```

### Analysis & Debug (70-90% savings)
```bash
rtk err <cmd>           # Filter errors only from any command
rtk log <file>          # Deduplicated logs with counts
rtk json <file>         # JSON structure without values
rtk deps                # Dependency overview
rtk env                 # Environment variables compact
rtk summary <cmd>       # Smart summary of command output
rtk diff                # Ultra-compact diffs
```

### Infrastructure (85% savings)
```bash
rtk docker ps           # Compact container list
rtk docker images       # Compact image list
rtk docker logs <c>     # Deduplicated logs
rtk kubectl get         # Compact resource list
rtk kubectl logs        # Deduplicated pod logs
```

### Network (65-70% savings)
```bash
rtk curl <url>          # Compact HTTP responses (70%)
rtk wget <url>          # Compact download output (65%)
```

### Meta Commands
```bash
rtk gain                # View token savings statistics
rtk gain --history      # View command history with savings
rtk discover            # Analyze Claude Code sessions for missed RTK usage
rtk proxy <cmd>         # Run command without filtering (for debugging)
rtk init                # Add RTK instructions to CLAUDE.md
rtk init --global       # Add RTK to ~/.claude/CLAUDE.md
```

## Token Savings Overview

| Category | Commands | Typical Savings |
|----------|----------|-----------------|
| Tests | vitest, playwright, cargo test | 90-99% |
| Build | next, tsc, lint, prettier | 70-87% |
| Git | status, log, diff, add, commit | 59-80% |
| GitHub | gh pr, gh run, gh issue | 26-87% |
| Package Managers | pnpm, npm, npx | 70-90% |
| Files | ls, read, grep, find | 60-75% |
| Infrastructure | docker, kubectl | 85% |
| Network | curl, wget | 65-70% |

Overall average: **60-90% token reduction** on common development operations.
<!-- /rtk-instructions -->