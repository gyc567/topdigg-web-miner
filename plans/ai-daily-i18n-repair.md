# Plan: AI Daily 模块国际化补全（5 语言）

## Context
`topdigg.com/ai-daily` 模块只有中文版，其他 4 个语言版本（zh-Hant / en / ja / vi）缺失。

**现状评估：**
- ✅ i18n key 已就绪（5 语言 `translation.json` 中的 `aiDaily.*` 节点全部存在）
- ✅ 组件层支持 5 语言（`AIDailyIndex.tsx` + `ai-daily-data.ts` 无需改动）
- ❌ 内容数据缺失（`content/ai-daily/zh-Hant|en|ja|vi/` 目录不存在）
- ❌ 构建产物是中文占位（`ai-daily-meta-{zh-Hant,en,ja,vi}.json`）

**结论**：纯内容缺口，无需改任何 `*.tsx` / `*.ts` / i18n key / 抓取流程。

## Goals
- [ ] 创建 4 个语言版本 md（zh-Hant / en / ja / vi）
- [ ] `npm run build` 全绿（无类型错误、无 lint 错误、vitest/i18n-keys 通过）
- [ ] 浏览器实测 5 语言页面可正常访问，截图交付 review

## 范围（已确认）

| 项目 | 决策 |
|------|------|
| 翻译范围 | 全部 4 语言（zh-Hant / en / ja / vi） |
| 翻译方式 | AI 翻译 + 人工 review（浏览器截图确认） |
| HN 标题 | **翻译**（保留 URL，去掉 `来源：HN` 行） |
| frontmatter 风格 | 与 blog 一致：每语言 1 份独立 md |

### 专有名词（不译）
Hugging Face · Hacker News · Claude Code · GPT-5 · Replit · FastMetal · GLM-5 · Liquid AI · OpenAI · Anthropic · Google Blog · OpenRouter · Stripe · GitHub Releases

## Tasks

### A. 生成 4 个语言版本 md

以 `content/ai-daily/zh-Hans/2026-08-20-ai-daily.md` 为源，生成：

```
content/ai-daily/zh-Hant/2026-08-20-ai-daily.md
content/ai-daily/en/2026-08-20-ai-daily.md
content/ai-daily/ja/2026-08-20-ai-daily.md
content/ai-daily/vi/2026-08-20-ai-daily.md
```

**每份 md 结构：**
```yaml
---
title: <本地化标题>
description: <本地化描述>
date: 2026-08-20
author: TopDigg
tags: [<本地化标签>]
categories: [<本地化分类>]
source:
  aggregator: AI HOT
  original:
    name: <翻译：原文来源>
hn_count: 5
hn_keywords: AI OR GPT OR LLM OR ...  # 不变
---
```

**Body 翻译规则：**
| 内容类型 | 处理方式 |
|---------|---------|
| 章节标题 | 翻译（【模型发布】→ 【Model Releases】） |
| 新闻标题 + 描述 | 翻译，保留链接 |
| 来源标注 | 翻译或删除（如「来源：机器之心」） |
| HN 区块 | 标题翻译，URL/关键词/分类不变 |
| 专有名词 | 按上方列表保留英文 |

### B. 重跑构建
```bash
node scripts/build-ai-daily.js
```
验证 4 个非中文 meta json 中 `title/description` 已本地化。

### C. 验证

1. **本地验证**
```bash
npm run build
```
确认无错误。

2. **浏览器实测**（截图交付）
| 语言 | URL |
|------|-----|
| zh-Hans | `/?lang=zh-Hans` + `/ai-daily/2026-08-20-ai-daily` |
| zh-Hant | `/?lang=zh-Hant` |
| en | `/?lang=en` |
| ja | `/?lang=ja` |
| vi | `/?lang=vi` |

截图 5 张（每语言 1 张列表页），交付用户 review。

### D. 更新工作流文档
在 `docs/blog-frontmatter-guide.md` 末尾追加：
> **AI Daily 多语言发布 SOP**：
> 1. zh-Hans md 完成后，执行本计划 Tasks A-C
> 2. 4 语言版本随同主版本一起提交 PR
> 3. 用户 review 通过后合并

## Verification
- [ ] `npm run build` 零错误
- [ ] `vitest run` 52/52 通过
- [ ] `i18n-keys.test.ts` 中 `aiDaily.*` 5 语言节齐备
- [ ] 5 语言浏览器页面截图可访问

## 风险与缓解
| 风险 | 缓解 |
|------|------|
| AI 翻译质量 | 人工 review 兜底 |
| HN 标题翻译失真 | 优先保留英文新闻核心词 |
| slug 一致性 | 4 语言必须用同一 slug |

## 不在范围内
- `*.tsx` / `*.ts` 组件改动
- `src/locales/*/translation.json` 改动
- `scripts/build-ai-daily.js` 改动
- 抓取流程改造
