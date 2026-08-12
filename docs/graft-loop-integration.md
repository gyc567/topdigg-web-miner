# Graft × Loop Engineering 集成指南

> ** graft 0.10.0 | NanoNets | MIT | https://github.com/NanoNets/Graft **

---

## 背景

Graft 是一个代码库上下文图谱工具：tree-sitter 解析每个源文件 → LLM 生成每个子系统的 prose 说明 → 以 linked markdown 图谱的形式写入 `graft/`。Claude Code 每次提问时，从图谱中读取（≈500 tokens）而非重新探索代码库（≈15,000 tokens）。

**核心数据**（162-run 基准测试 + SWE-bench Verified）：
- 工具调用减少 **46%**
- Token 节省 **42%**
- 时间节省 **60%**
- SWE-bench 正确率：Cold 54% → **66%**（+12 pts）

Graft 解决的是 Loop Engineering **Observe 步骤**的核心瓶颈：**每次任务从零重新探索代码库**。Graft 把"理解代码库"这件事做一次，写入 `graft/`，所有后续 loop 迭代复用。

---

## 已安装内容

```
# 全局安装
npm install -g @nanonets/graft

# 仓库初始化（Claude Code only, 无全局写入）
graft init --agents claude --no-global

# 当前图谱：186 nodes, 443 edges, 60 cards
# 深构建（需要 GRAFT_API_KEY）：
graft build --deep
```

### 写入的文件

| 文件 | 作用 |
|------|------|
| `.claude/settings.json` | graft statusline + prompt hooks |
| `.claude/helpers/graft-statusline.cjs` | statusline shim |
| `.claude/helpers/graft-hooks.cjs` | prompt 拦截 + retrieve |
| `.claude/skills/graft/SKILL.md` | SKILL.md（每次 prompt 前注入图谱指针）|
| `.mcp.json` | MCP server 注册（graft_find_code 等工具）|

### 关键约束

- `graft/` 已在 `.gitignore` 中（本地可再生缓存，不提交）
- `.claude/` 是 Git 追踪的——`git add .claude && git commit` 后，队友各自运行 `graft build` 生成自己的本地图谱
- 无外部服务器，无遥测，纯本地文件

---

## Graft × Loop Engineering 工作流

Graft 替换每个 loop 迭代的 **Observe 步骤**：

```
┌──────────────────────────────────────────────────────┐
│  Loop Iteration (Observe → Measure → Decide → Act)  │
│                                                      │
│  BEFORE (blind re-exploration):                       │
│    grep "auth"  →  open file  →  grep again  →  … │
│    每次迭代重新花掉 8-15 tool calls                 │
│    每次迭代重新消耗 ~15,000 tokens                  │
│                                                      │
│  AFTER (graft-informed):                            │
│    graft ask "where is auth handled"                 │
│    → 3 hits, exact file:line, inlined code        │
│    → ~500 tokens total                              │
│    → proceed to Measure/Decide/Act                   │
│    每次迭代工具调用: 1                              │
└──────────────────────────────────────────────────────┘
```

---

## 工具对照表

| 场景 | 旧方式 | Graft 方式 |
|------|--------|-----------|
| 理解一个流程怎么工作 | grep → open → grep → open | `graft ask "how does X work" --source` |
| 找修改位置 | grep → grep → open → find | `graft ask "where is behavior X" --source` |
| 找一个 symbol 的所有调用点 | `grep -rn` 全库扫描 | `graft grep "<symbol>"` |
| 理解一个文件的 API | open 整个文件 | `graft skeleton <file>` |
| 改一个 symbol 前评估影响 | `grep -rn` + 人工分析 | `graft callers <sym> --depth 2` |
| 重构前全面评估 | 手动翻多个文件 | `graft callers <sym> --depth all` |
| 新人 onboarding | 边翻边问 | `graft map` + 阅读 hub cards |
| 评估 diff 风险 | 不知道会影响到哪 | `graft callers <changed_sym> --depth 2` |

---

## 使用示例

### 每次任务开始前（Observe）

```bash
# 最常用：概念/位置查询
graft ask "how does blog post routing work" --source

# 精确搜索（已知 symbol）
graft grep "useDebouncedValue"

# 调用链分析（改之前必做）
graft callers "BlogSearch" --depth 2

# 文件 API 概览
graft skeleton src/pages/BlogPost.tsx

# 全局 orientation（新人 onboarding）
graft map
```

### Loop Engineering 中的具体用法

根据 `docs/loop-engineering-record.md` 的循环结构：

**Observe（测量当前状态）**：
```bash
# 旧：grep/read 重新探索
grep -rn "categories" src/

# 新：直接问
graft ask "where is the BlogPost type defined and what fields does it have" --source
```

**Before editing（改前影响评估）**：
```bash
# 改一个共享 symbol 前
graft callers "useSupportedLocale" --depth 2
# 知道会影响到哪些文件
```

**Before a refactor（重构前）**：
```bash
# 全链路影响分析
graft callers "buildBlogData" --depth all
```

---

## 配置与密钥

### 深构建（可选，需要 API key）

```bash
# OpenAI
export GRAFT_API_KEY=sk-...
export GRAFT_PROVIDER=openai
export GRAFT_MODEL=gpt-4o

# Anthropic（原生支持）
export GRAFT_API_KEY=sk-ant-...
export GRAFT_PROVIDER=anthropic

# OpenRouter / 其他 OpenAI-compatible
export GRAFT_API_KEY=<key>
export GRAFT_BASE_URL=https://openrouter.ai/api/v1
export GRAFT_MODEL=<model>

# 然后重新构建
graft build --deep
```

深构建添加：每个文件 3-5 行的 prose 说明 + 子系统级别概念节点。

### MCP Server（Claude Code 工具）

`.mcp.json` 已注册 graft MCP server。重启 Claude Code 后，工具面板中会显示 `graft_find_code` 等工具。

---

## 刷新策略

- 每个查询命令（`ask`/`grep`/`callers` 等）**自动在回答前刷新图谱**——不需要手动运行 `graft build`，除非图谱完全缺失
- 编辑文件后，对话中下次 `graft ask` 会先增量刷新（只重解析改过的文件）
- 长时间运行的任务开始前：`graft check` 确认图谱新鲜度
- CI 场景：`graft check` 在图谱过期时返回非零退出码

---

## 已知限制

1. **需要 API key 才能深构建**：`--deep` 默认降级到纯结构图谱（无 prose 说明）。结构图谱已含 186 nodes 443 edges，足够大多数场景使用。
2. **Graft 不会读取的内容**：`.gitignore` 忽略的文件、新建未提交的 brand-new 文件（用 `grep -rn` 备用）。
3. **span 被截断时**（"+N more lines"）：直接 `read` 该文件的精确行范围，不重跑 `ask`。
4. **Graft 不是银弹**：对于精确的文本搜索（所有 occurrences）、完全未建图的 brand-new 文件，仍使用标准 grep/read。

---

## 附录：Graft SKILL.md 速查

```
graft ask "<question>" --source   # ranked retrieval + inlined code (默认)
graft grep "<pattern>"            # exhaustive find, 按 enclosing symbol 分组
graft skeleton <file>            # 文件 API（signatures only, ~200 tokens）
graft callers <symbol> --depth N  # 调用/引用链，N=1/2/all
graft map                         # 全局 orientation tour
graft build [--deep]              # 构建/深构建图谱
graft check                       # 新鲜度检查（CI 用）
```

详见 `.claude/skills/graft/SKILL.md`（由 graft 维护，勿手动编辑）。
