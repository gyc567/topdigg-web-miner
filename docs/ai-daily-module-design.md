# AI日报模块设计方案

> 版本：v2.0
> 日期：2026-08-20
> 状态：新增 HN Top5 来源，方案升级

---

## v2.0 版本说明

本次升级在 v1.1 基础上新增 **Hacker News Top5** 作为第二个并行内容来源，与 AI HOT 并列合并进同一篇日报 MD，实现双源聚合。同步提出 8 项额外优化建议。

---

## 一、项目背景与目标（不变）

### 1.1 背景

TopDigg（topdigg.com）是一个AI/科技内容聚合站，现有内容模块：
- **博客**（/blog）— 深度解析文章
- **Twitter分析**（/twitter）— 账号分析报告
- **专栏**（/columns/*）— Reddit/YouTube/Twitter 社区导航

缺乏每日自动化的行业资讯聚合能力。

### 1.2 目标

在首页导航栏新增 **AI日报** 模块（与博客平级），实现：
1. 每日北京时间 8 点自动抓取优质 AI 资讯来源，生成日报文章
2. 用户访问 `/ai-daily` 可浏览每日日报时间线
3. 点击日报进入详情页阅读完整内容
4. 支持多语言（zh-Hans / zh-Hant / en / ja / vi）
5. 支持未来扩展更多来源（多源聚合）

---

## 二、内容来源架构（v2.0 新增 HN）

### 2.1 双源并行结构

| 来源 | 内容定位 | 获取方式 | 注入位置 |
|------|----------|----------|----------|
| **AI HOT**（主） | 模型发布、产品更新、行业动态、学术进展 | `https://aihot.virxact.com/api/v1/dailies/latest` | MD 正文前半部 |
| **Hacker News**（辅） | AI/ML 相关社区热帖，真实开发者讨论 | `https://hnrss.org/newest?q=<关键词>` | MD 正文末尾 `## 【Hacker News 热帖】` |

两源内容合并进**同一篇日报 MD**，保持"每日期刊"的阅读节奏。用户读一篇，知天下 AI 事。

### 2.2 HN 数据获取策略

**关键词搜索 Feed**（主）：
```
https://hnrss.org/newest?q=AI+OR+GPT+OR+LLM+OR+Claude+OR+OpenAI+OR+%22machine+learning%22+OR+%22large+language+model%22+OR+AGI+OR+%22generative+AI%22+OR+AI+agent+OR+RAG+OR+diffusion+OR+transformer+OR+Nvidia+OR+GPU+OR+Sora
```

**降级链路（Strategy A）**：
```
Step 1: 关键词搜索 feed → 取最新 20 条
Step 2: 若返回 < 5 条 → 追加 frontpage feed 最新 10 条做补充
Step 3: 合并去重后取前 5 条
```

**HN 数据限制**：hnrss RSS **不包含 points 和 comments 数量**，只含标题 + 链接 + 摘要 + 发布时间。按时间倒序取最新条目，保证内容新鲜度。

### 2.3 去重策略

如果某条 AI HOT 内容已经在 HN 上有对应帖子（标题相似度 > 70%），在 HN 区块中标注 `（已见上文）` 而非重复展示。相似度判断逻辑：
- 提取标题中的关键名词（去停用词）
- 交集 / 并集 > 0.7 则认为重复

---

## 三、Markdown 内容结构（v2.0 更新）

### 3.1 完整 MD 结构

```markdown
---
title:
  zh-Hans: "Sentence Transformers v6.0、Mojo开源、Claude支持Gmail"
  en: "Sentence Transformers v6.0, Mojo Open-Sourced, Claude Gains Gmail Support"
date: "2026-08-20"
description:
  zh-Hans: "每日AI行业资讯精选，涵盖模型发布、具身智能、学术进展、行业动态。"
  en: "Daily AI industry news highlights..."
tags:
  - AI日报
categories:
  - AI日报
source:
  aggregator: "AI HOT"
  aggregator_url: "https://aihot.virxact.com"
  original:
    name: "比特财商"
    url: "https://mp.weixin.qq.com/s/xxxxx"
hn_count: 5
---

## 【产品发布/更新】

...（AI HOT 内容，同现有结构）...

---

## 【Hacker News 热帖】

> 关键词：AI OR GPT OR LLM OR Claude OR OpenAI OR "machine learning"...
> 数据来源：hnrss.org | 筛选自 Hacker News

### 1. [HN 帖子标题](https://news.ycombinator.com/item?id=12345678)
HN 帖子摘要内容...
- [HN 原文 →](https://news.ycombinator.com/item?id=12345678)

### 2. ...

---

*首发于微信公众号「比特财商」。*
```

### 3.2 frontmatter 新增字段

| 字段 | 类型 | 说明 |
|------|------|------|
| `hn_count` | number | 本日报包含的 HN 条目数量（0 表示 HN 抓取失败） |
| `hn_keywords` | string | 本次使用的关键词字符串（用于调试和追溯） |

---

## 四、数据层扩展（v2.0 新增 HN 类型）

### 4.1 新增 HN Item 类型

```typescript
// src/lib/ai-daily-data.ts

export type HNItem = {
  title: string;
  url: string;          // 指向 news.ycombinator.com/item?id=xxx
  description: string;   // HN 帖子正文摘要
  pubDate: string;      // RFC 2822 格式
};

export type AIDailyMeta = {
  slug: string;
  title: string | Record<string, string>;
  description: string | Record<string, string>;
  date: string;           // ISO date: "2026-08-20"
  author: string;
  tags: string[];
  categories: string[];
  source: AIDailySource;
  hn_count: number;        // v2.0 新增
  hn_keywords: string;    // v2.0 新增
};

export type AIDailyPost = AIDailyMeta & {
  content: string | Record<string, string>;
};
```

### 4.2 JSON 产出更新

`ai-daily-meta.json` 新增 `hn_count` 和 `hn_keywords` 字段。`ai-daily-data.json` 的 content 字段中已包含 HN 区块的完整 Markdown 内容（直接渲染即可）。

---

## 五、Cron 执行流程（v2.0 更新）

### 5.1 完整执行流程

```
T=08:00  cron 触发
  │
  ▼
[Step 1] 抓取 AI HOT
  - GET https://aihot.virxact.com/api/v1/dailies/latest
  - 解析 JSON → 构建 MD 前半部分
  │
  ▼
[Step 2] 抓取 HN Top5（关键词搜索）
  - GET https://hnrss.org/newest?q=<encoded_keywords>
  - 解析 RSS XML → 取最新 20 条
  - 若 < 5 条 → 追加 GET https://hnrss.org/frontpage → 取最新补充
  - 按发布时间降序 → 取 Top 5
  - 生成 Markdown HN 区块
  │
  ▼
[Step 3] 组装完整 MD
  - frontmatter（含 hn_count）
  - AI HOT 内容
  - HN 热帖区块
  - 检查当日文件是否已存在（幂等）
  - 写入 content/ai-daily/zh-Hans/YYYY-MM-DD-ai-daily.md
  │
  ▼
[Step 4] Git 提交
  - git add content/ai-daily/
  - git commit -m "feat: AI日报 $(date +%Y-%m-%d) + HN Top5"
  - git push
  │
  ▼
[Step 5] Vercel 自动构建
  - 触发 GitHub webhook
  - scripts/build-ai-daily.js 执行 JSON 生成
  - 静态站点更新（约 1-2 分钟）
  │
  ▼
[Step 6] 飞书通知（发送今日日报链接）
```

### 5.2 错误处理策略

| 错误场景 | 处理方式 |
|----------|----------|
| AI HOT API 失败 | Cron 整体失败，发送 failureAlert，不生成日报 |
| HN RSS 失败 | 降级：hn_count=0，HN 区块留空，日报主体正常生成，发送 warning 通知 |
| HN < 5 条 | 用 frontpage 补充；仍不足 5 条时记录实际条数，继续生成 |
| Git push 失败 | 重试 1 次；仍失败则发送 failureAlert |

### 5.3 幂等保证

```bash
FILE="content/ai-daily/zh-Hans/$(date +%Y-%m-%d)-ai-daily.md"
if [ -f "$FILE" ]; then
  echo "今日日报已存在，跳过生成"
  exit 0
fi
```

---

## 六、国际化更新（v2.0 新增 HN i18n）

### 6.1 新增 i18n 字段

```json
// zh-Hans.json — 新增字段
"hnTop5": {
  "sectionTitle": "Hacker News 热帖",
  "source": "数据来源",
  "hnrss": "hnrss.org",
  "filteredFrom": "筛选自 Hacker News",
  "keywords": "关键词",
  "viewOnHN": "HN 原文",
  "fetchFailed": "HN 数据获取失败，该部分暂时空缺",
  "fallbackNote": "（已见上文）",
  "itemsCount": "{{count}} 条"
}
```

其他语言（en / zh-Hant / ja / vi）同理翻译。

---

## 七、SEO 方案（v2.0 微调）

详情页 Article schema 的 `keywords` 字段增加 HN 相关标注：

```typescript
const jsonLd = makeArticleSchema({
  // ... 现有字段
  keywords: [...post.tags, "Hacker News", "AI Hot"].join(", "),
});
```

由于 HN 内容直接内嵌在 Markdown content 中渲染，无需额外 structured data。

---

## 八、Build 脚本更新（v2.0）

### 8.1 需要更新的逻辑

`scripts/build-ai-daily.js` 需更新：
1. frontmatter 新增 `hn_count` 和 `hn_keywords` 字段的读取
2. 这两个字段直接透传到 JSON 输出，不做额外处理

其余逻辑（扫描、合并多语言、per-locale 生成）**不变**。

### 8.2 HN 内容不过滤

HN 区块内容作为 Markdown 字符串直接存储在 `content` 字段中，不单独提取 HN item 结构。原因是：
- HN 内容重要性低于 AI HOT，不值得为此修改 build 脚本的复杂逻辑
- 未来如需单独展示 HN 列表，再做独立模块

---

## 九、更多优化建议（v2.0 新增）

以下 8 项优化非 HN 集成必需，但可显著提升系统质量，供你决策优先级：

### 优化 1：日报 title 自动生成（高价值）

当前 title 靠 cron agent 人工写，容易不一致。建议：
- frontmatter 中 `title` 格式固定为 `[当日最重要 AI HOT 条目标题]`
- AI HOT API 返回的 items 本身有标题，直接取第一条
- 避免 title 质量波动

### 优化 2：HN item 去重标注（中价值）

当前设计的"标题相似度 > 70%"逻辑实现成本较高（需要 NLP 库）。建议：
- 简化为"字符串包含匹配"：HN 标题包含 AI HOT 标题中的 ≥5 个连续字符
- 使用 `string-similarity` 或手工滑动窗口即可实现
- 降低实现复杂度

### 优化 3：HN Item 结构化存储（低价值）

当前 HN 内容是纯 Markdown。升级方案：
- frontmatter 中增加 `hn_items: HNItem[]` 数组
- 详情页单独渲染 HN 列表（带 points/comments 数量，需额外 API 调用 `https://hnrss.org/item?id=xxx` 获取详情，不推荐）
- 建议保持现状（Markdown 渲染），性价比最高

### 优化 4：日报摘要自动生成（中价值）

description 当前由 cron agent 手工写，容易敷衍。建议：
- 取 AI HOT 的第一条内容的标题作为 description
- 保证描述始终与内容高度相关

### 优化 5：tags 自动补充（中价值）

AI HOT 返回的 items 本身带分类标签。当前 MD 中的 tags 是静态写的。建议：
- frontmatter 的 tags 直接从 AI HOT API 返回的 items categories 合并去重
- HN 区块对应 tag 固定为 `Hacker News`

### 优化 6：历史日报归档页（低价值，v1.1 已标注待做）

`AIDailyArchive.tsx`：按月翻页浏览历史日报。当前 `/ai-daily` 列表页已支持加载更多（每次10条），基本够用。归档页作为 v2.x 未来项。

### 优化 7：日报预览机制（高价值）

cron 完成后不直接 push，而是：
1. 生成 MD 后先 commit 到 feature branch
2. 自动触发 Vercel preview deploy
3. 将 preview URL 发送到飞书给 Eric 确认
4. Eric 确认后才 merge 到 main

防止错误内容上线。

### 优化 8：多语言标题/描述机器翻译（低价值，v1.1 已标注待做）

当前 zh-Hans 以外的语言都 fallback 到 zh-Hans。translate.mjs 工具（v1.1 已规划）待实现，作为 v2.x 未来项。

---

## 十、文件变更清单（v2.0 增量）

| 操作 | 文件路径 | 说明 |
|------|----------|------|
| 修改 | `content/ai-daily/zh-Hans/YYYY-MM-DD-ai-daily.md` | 新增 HN 热帖区块、hn_count frontmatter |
| 修改 | `scripts/build-ai-daily.js` | 新增 hn_count/hn_keywords 字段透传 |
| 修改 | `src/lib/ai-daily-data.ts` | 新增 hn_count/hn_keywords 类型字段 |
| 修改 | `src/locales/{locale}/translation.json` | 新增 hnTop5.* i18n 命名空间 |
| 修改 | OpenClaw cron | 更新 prompt 指令，增加 HN 抓取逻辑 |
| 新增（建议） | `scripts/utils/hn-fetch.js` | 独立 HN RSS 抓取工具函数（可测试） |

---

## 十一、依赖与约束（更新）

| 依赖 | 用途 |
|------|------|
| `https://hnrss.org/newest?q=<keywords>` | HN 关键词搜索 RSS（无 API key，免费） |
| `https://hnrss.org/frontpage` | HN 首页 RSS（降级用） |
| `https://aihot.virxact.com/api/v1/dailies/latest` | AI HOT 日报（现有依赖） |
| OpenClaw cron | 每日 8 点自动化触发（现有依赖） |

**新增约束**：HN RSS 请求可能受网络环境限制（如防火墙）。需在 cron 执行环境验证 hnrss.org 可达性。若不可达，整个 HN 模块降级。

---

## 十二、风险与备选方案（v2.0 更新）

| 风险 | 概率 | 影响 | 备选方案 |
|------|------|------|----------|
| HN RSS 被墙/超时 | 中 | 低 | hn_count=0，正常生成日报，warning 通知 |
| HN 关键词匹配过多噪音 | 中 | 中 | 人工审核关键词列表，每季度更新一次 |
| AI HOT + HN 内容重复 | 低 | 低 | 已在设计中标注优化方向，实现优先级低 |
| cron 执行超时 | 低 | 高 | timeoutSeconds 从 300 提升到 480（8 分钟） |
| HN items < 5 条 | 中 | 低 | 降级到 frontpage 补充，仍不足时记录实际条数 |

---

## 里程碑（v2.0 更新）

| 阶段 | 内容 | 状态 |
|------|------|------|
| Phase 0 | 审计方案（v1.1） | ✅ 完成 |
| Phase 1 | 基础设施（路由/导航/i18n/数据层） | ✅ 完成 |
| Phase 2 | 前端页面（AIDailyIndex + AIDailyPost） | ✅ 完成 |
| Phase 3 | Build 脚本（build-ai-daily.js） | ✅ 完成 |
| Phase 4 | AI HOT Cron（现有依赖） | ✅ 完成 |
| Phase 5 | **HN Top5 集成** | ⏳ 待实现 |
| Phase 6 | **HN Cron 更新** + 回归测试 | ⏳ 待 Eric 确认后执行 |
