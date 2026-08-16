---
name: repo-blog-5lang
description: 把一个 GitHub 仓库/项目/文章深度解析成 5 语言博客（zh-Hans 主稿 + en/zh-Hant/ja/vi），
  经双重验证、本地 build 零错误后 commit + push 到 topdigg-web-miner 远程仓库。
  Trigger: 用户丢来一个仓库链接并要求"分析这个项目/内容""翻译成中文""归纳观点和结论"
  "生成详细易懂的文章 md 格式""要有详细教程/项目说明/设计哲学""中文版放 content/blog/zh-Hans，
  其他语言版本放相应目录""push 之前先本地 build 不要有任何错误"——即"深度解析博客（5 语言）"类任务。
  也适用于书籍/文章/框架（Traction、agent-mythical-man-month、Waza 等非纯仓库输入）。
---

# repo-blog-5lang — 5 语言深度解析博客工作流

把任意 GitHub 仓库/项目/书籍/文章分析成一篇详细、X 兼容的 Markdown 深度解析文章，
发布为 5 语言版本（zh-Hans 主稿，en/zh-Hant/ja/vi 翻译），构建零错误后推送远程。
本项目已用此流程产出 115+ 篇博客（×5 语言 = 575 文件），是仓库最高频重复劳动。

## 触发条件（全部满足才使用本 skill）

- 用户提供仓库/项目/书籍/文章链接，要求"分析 + 写文章"。
- 明确要求中文版放 `content/blog/zh-Hans`、其他语言放对应目录。
- 要求 build 零错误、push 远程。
- 内容要求包含：详细教程 / 项目说明 / 归纳总结的观点 / 设计哲学 / 核心思想。

## 输入

- 目标 URL（GitHub 仓库、raw 文件、书籍、文章）
- 用户的具体要求（翻译成中文、观点归纳、教程、设计哲学等）

## 有序步骤

### 1. 分析阶段（双重验证，禁止臆测）

1. 派 **librarian 代理**（`run_in_background=true`、`load_skills=[]`）用 GitHub API 抓取：
   - 仓库元数据（stars、license、author、created/updated 日期）
   - README（所有语言版本）与目录结构
   - 关键章节/文件内容
   - 要求输出：核心事实、关键引文、章节结构
2. **直接 webfetch 原始文件逐字核对**关键内容（README + 序章/核心章节）：
   - `https://raw.githubusercontent.com/<owner>/<repo>/main/<path>`
   - 中文路径必须 URL 编码（如 `agent-时代的人月神话/` → `agent-%E6%97%B6%E4%BB%A3%E7%9A%84%E4%BA%BA%E6%9C%88%E7%A5%9E%E8%AF%9D/`）
3. 交叉验证 librarian 报告与原文；**引文必须与原文一致**。
4. 文档中声明"双重验证说明"章节，列出验证过的关键事实。

> Pitfall：librarian 报告可能被截断——用 webfetch 补齐缺失章节细节。
> Pitfall：`explore` 代理会因 `ProviderModelNotFoundError: Model not found: opencode/gpt-5.4-nano` 失败——**不要重试 explore**，用 librarian 或直接工具。

### 2. 计划生命周期（AGENTS.md 强制）

1. 创建 `plans/<name>-blog.md`（模板：Context / Goals / Tasks / Verification）。
2. 在 `PLANS.md` Active Plans 添加条目：`- [<name>（<owner>/<repo>）深度解析博客（5 语言）](plans/<name>-blog.md) — 进行中`。
3. 创建 todo list（8 项：分析/计划/zh-Hans 主稿/四语言翻译/build 验证/清理计划/commit push/最终报告）。

### 3. 撰写 zh-Hans 主稿（约 400+ 行）

文件：`content/blog/zh-Hans/<YYYY-MM-DD>-<name>-analysis.md`（**dated slug 约定**，如 `2026-08-16-agent-mythical-man-month-analysis`）

frontmatter（中文）：
```yaml
---
title: '<犀利的主标题>'
date: "YYYY-MM-DD"
description: "一句话概括项目 + 文章覆盖范围"
tags: [关键词 x 6-8]
categories: [书籍解读/项目分析/AI/软件工程/...]
---
```

固定章节结构（X 兼容、自然过渡、人类风格、避免过多比喻）：
1. 文章背景与项目简介
2. 双重验证说明
3. 一句话抓住这个项目（引用 README 原话 + 一句总结）
4. 项目说明：这是什么（表格：仓库/性质/规模/授权/创作方式）
5. 核心思想总览（老命题的新形态）
6-11. 核心命题/核心思想各章节（每章一个主题，含表格/引用）
12. 设计哲学（外科手术队伍/乘法效应/审计权 vs 修正权/文档即源码等）
13. 详细教程：怎么读/怎么用（阅读路线 + 导览表 + 可落地实践）
14. 归纳总结：核心观点清单（编号列表）
15. 我的几个独立观点（有态度的点评，不是复述）
16. 综合评价：价值 + 局限
17. 适用人群
18. 结语
19. 参考资源（GitHub 链接、README、原书等）

### 4. 四语言翻译（主 agent 直接写，不委托）

同一 slug 写入：`content/blog/{en,zh-Hant,ja,vi}/<same-slug>.md`

- **逐字翻译，不省略章节**，结构与主稿一致。
- frontmatter 完全本地化：title/description/tags/categories 用目标语言。
- 保持所有链接、表格、编号一致。
- 长度与主稿相当（±10% 内）。

> Pitfall：翻译**不要委托 subagent**（曾多次超时无输出）——主 agent 直接写 4 份。

### 5. 构建 + 验证（用户强制门禁：build 零错误）

```bash
export CI=true DEBIAN_FRONTEND=noninteractive GIT_TERMINAL_PROMPT=0 GCM_INTERACTIVE=never HOMEBREW_NO_AUTO_UPDATE=1 GIT_EDITOR=: EDITOR=: VISUAL='' GIT_SEQUENCE_EDITOR=: GIT_MERGE_AUTOEDIT=no GIT_PAGER=cat PAGER=cat npm_config_yes=true PIP_NO_INPUT=1 YARN_ENABLE_IMMUTABLE_INSTALLS=false
rtk npm run build
```

- **exit 0 才算通过**。`[prerender] WARN: chromium launch failed ... prerender skipped` 是环境性问题（属预期），不算错误。
- 验证 5-locale slug 分组：
```bash
node -e "
const data = require('./src/lib/blog-data.json');
const posts = Array.isArray(data) ? data : (data.posts || []);
const m = posts.find(p => p.slug === '<slug>');
console.log(Object.keys(m.title).sort().join(', '));
"
```
- 期望输出恰好 5 个 locale：`en, ja, vi, zh-Hans, zh-Hant`（title 和 description 都要有）。

### 6. 清理计划（AGENTS.md 强制）

1. 删除 `plans/<name>-blog.md`。
2. 从 `PLANS.md` Active Plans **移除该条目**（不写入 Completed 长驻，仅靠 git commit log 留档）。

### 7. 提交 + 推送

```bash
rtk git add <5 篇博客文件> <9 个产物文件>
rtk git commit -m "feat: add <name> analysis blog — 5 languages"
rtk git push origin main
```

**必须一起提交的 14 个文件**：
- 5 篇博客：`content/blog/{en,ja,vi,zh-Hans,zh-Hant}/<slug>.md`
- 9 个重建产物：`public/llms.txt`、`public/sitemap.xml`、`src/lib/blog-data.json`、
  `src/lib/blog-meta.json`、`src/lib/blog-meta-{en,ja,vi,zh-Hans,zh-Hant}.json`

> Pitfall：产物与博客**必须同 commit**，否则远程 artifact 与 HEAD 不一致（如 waza 提交只加了 5 博客漏了 9 产物，工作树遗留脏产物）。
> 提交前 `git status` 确认没有无关文件。

### 8. 最终报告

输出：交付内容（5 语言文件 + slug）、验证结果（build exit 0 + 5-locale 确认）、仓库卫生（计划已删/PLANS.md 恢复）、commit hash + push 范围。

## 成功标准（全部满足才算完成）

- [ ] 5 个语言文件存在且同 slug，frontmatter 各自本地化
- [ ] 关键引文与仓库原文逐字一致（双重验证）
- [ ] `npm run build` exit 0
- [ ] blog-data.json 该 slug 的 title/description 各含 5 个 locale
- [ ] `plans/<name>-blog.md` 已删除，PLANS.md 已恢复（仅剩其他进行中条目）
- [ ] commit 恰好 14 个文件（5 博客 + 9 产物），push 成功，`git status` 干净
- [ ] 未提交无关改动（`src/locales/*/translation.json`、`src/pages/BlogIndex.tsx`、`.codex/`、`.loopx/`）

## 约束 / Pitfalls 清单

- **双重验证**：librarian 报告 + 直接 webfetch 逐字核对，禁止凭报告转述关键引文。
- **dated slug**：`YYYY-MM-DD-<name>-analysis.md`（不要学 waza 的无日期 slug）。
- **翻译不委托**：主 agent 直接写 4 语言。
- **explore 代理不可用**（模型错误），用 librarian。
- **产物与博客同 commit**，14 文件一起。
- **prerender 跳过属正常**，exit 0 即通过。
- **AGENTS.md 计划生命周期**：开工前建计划，完工删除。
- **bash 命令一律带 env 前缀 + rtk**。

## 与仓库其他规范的配合

- 北极星指标：每篇博客 5 语言齐全 + frontmatter 一致 + 构建健康全绿。
- 文档规则：博客是永久资产，不删除；计划文件完工即删。
- 本 skill 是仓库级（topdigg-web-miner 专属），不入用户全局 skills。