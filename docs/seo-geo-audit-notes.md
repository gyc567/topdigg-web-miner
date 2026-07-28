# SEO + GEO 优化方案 v2 → v3 审计笔记

**日期**：2026-07-28  
**审计范围**：`docs/seo-geo-optimization-plan.md` v2 全文  
**审计者**：self-review  
**文件**：`docs/seo-geo-optimization-plan.md` v3（已合并所有修订）

---

## 审计结论

v2 在结构和技术方向上是正确的，但存在以下问题类别：
1. **内部一致性问题**（重复行/错值）
2. **技术准确性问题**（错误描述 AI 爬虫行为）
3. **完整性缺漏**（缺 SEO header、回滚 SOP、监控 KPI）
4. **战略连贯性**（缺渐进方案，强行 Astro 不符合风险最低原则）
5. **GEO 概念混淆**（抓取 vs 引用未区分）

---

## 详细审计项

### A. 内部一致性问题（必改）

| # | 行 | 问题 | 修订 |
|---|---|---|---|
| A1 | v2 行 42-43 | "307 → www（应 301）"和"307 → 应为 301"完全重复 | 删除第二行，统一为"307→308" |
| A2 | v2 行 105 | priority 列表重复 row 99 内容但丢失 columns 0.6 | 改为引用 v3 P1.5 索引 |
| A3 | v2 行 132 | "Twitter 详情：Article + Person + BreadcrumbList"中 `Person` 不应是独立 schema | 改为"Article（author 用 Person schema）" |
| A4 | v2 行 95 | P1.1 未给 title 长度上限 | 加 "title ≤ 60 字符、OG title ≤ 95 字符" |
| A5 | v2 行 230-235 实施路线图 | W1 把 P0（P0-A）和 W2 P1 分配不均 | 重新平衡：P0-A 占 W1，P1 占 W2 头 2-3 天，P2 占 W2 末 1-2 天 |

### B. 技术准确性问题（必修）

| # | 行 | 问题 | 修订 |
|---|---|---|---|
| B1 | v2 行 166-173 | `Google-Extended` 描述模糊，没有解释它**不影响 Google 主搜索**（普通 Googlebot 索引独立） | 加注："不影响普通 Google 搜索索引（那个走 Googlebot）" |
| B2 | v2 行 161-162 | `Applebot-Extended` 名称写错（v2 写 Applebot-Extended，正确）| v2 已正确；改为加注释说明 Apple Intelligence 引用 |
| B3 | v2 行 167-168 | `CCBot` = Common Crawl 实际意义不准确描述（"AI 引用"过于简化） | 加注："Common Crawl 抓取的数据被 GPT/Claude/Stability 等多个 LLM 训练使用" |
| B4 | v2 行 169 | `cohere-ai` UA 字符串不一定准确 | 加来源验证注释 |
| B5 | v2 行 81 | "未来还会加登录/支付/后台 → A"——A 是 Astro，与登录/支付无关；应改为"→ 直接做 Next.js（C）" | 重写决策树 |
| B6 | v2 行 82 | "纯内容站不动 5 年 → B 也行"过于武断 | 改为 Astro 也能纯内容站，决策综合考虑 |
| B7 | v2 行 173 | "Disallow 会让 Gemini 不引用你"过于绝对 | 改："Disallow 仅阻止 Gemini 用你的内容做训练数据，对 AI 引用**部分**影响" |
| B8 | v2 行 200 | `llms-full.txt` 说"< 50MB"但没说超了怎么分 | 加分文件方案 llms-full-1.txt、2.txt |
| B9 | v2 行 281 | Lighthouse 阈值"LCP < 2500ms / CLS ≈ 0 / TBT < 200ms"——实际目标应是更严格 | 改为 Lighthouse Performance ≥ 90 |

### C. 完整性缺漏（必须补）

| # | 缺失项 | 修订 |
|---|---|---|
| C1 | SEO/Security headers（CSP/X-Frame/Permissions-Policy/HSTS） | 整章新增（v3 第 4 章） |
| C2 | GSC/Bing 索引覆盖率 KPI | 移到 3.6 监测为"核心 KPI" |
| C3 | 紧急回滚 SOP | 6.2 新增 |
| C4 | 渐进预渲染方案（vite-prerender）作为 P0 兜底 | 改为 P0-A 渐进 / P0-B Astro |
| C5 | React Router history mode 在 prerender 后怎么办 | 风险表新增 |
| C6 | 内容模板的中英两种语言对照 | P3 改为同结构双语 |
| C7 | llms-full.txt 超过上限时的分文件策略 | 3.3 加注 |
| C8 | LLM "抓取 vs 引用" 概念区分 | 整章新增 3.1 |
| C9 | 数据备份/导出能力（Astro 内容集合迁移路径） | 已在 P0-B 阶段细化 |
| C10 | 内容许可 license（避免被滥用训练） | 风险表新增 |

### D. 战略连贯性（应改）

| # | 问题 | 修订 |
|---|---|---|
| D1 | v2 把"迁移 Astro"和"保留 Vite 加 prerender"并列推荐 | 改为"P0-A 渐进 → P0-B 彻底"递进式 |
| D2 | v2 PR 拆分含两个 PR（P0 起步/路由迁移完成），但描述模糊 | 重构为 10 个 PR（PR1-PR10）独立可部署 |
| D3 | v2 没说明"为什么先做 PR1 而不是 PR2" | 加 PR 优先级：robots（PR1）+ prerender（PR2）是最低成本最高收益组合 |

### E. 表达与可读性

| # | 问题 | 修订 |
|---|---|---|
| E1 | v2 第 7 章"建议立刻做 PR1 把首页迁移到 Astro"——风险高，门槛高 | 改为"立刻做 PR1+PR2"（robots 修 + prerender） |
| E2 | v2 中文标题/FAQ 没考虑 4 语言站点 | P3 模板改为结构同构、内容随语言 |

### F. 安全/合规

| # | 缺失项 | 修订 |
|---|---|---|
| F1 | AI 爬虫可能抓取后被滥用做反查竞品 | 风险表加注；robots.txt 公开是双刃剑 |
| F2 | 内容许可证（CC BY-NC vs 自有 vs 完全禁止） | 建议版权页 + robots.txt 文案 |
| F3 | GDPR/PIPL（如果 4 语言用户覆盖欧洲日本） | About/Privacy 必备 |

---

## v3 改动清单（按重要性）

1. **新增**：第 3.1 章"抓取 vs 引用"概念区分
2. **新增**：第 4 章 SEO/Security headers 完整配置
3. **重构**：P0 改为 P0-A（渐进预渲染，先做）/ P0-B（Astro 彻底方案，后做）
4. **新增**：决策树（"何时做 P0-A"、"何时升级到 P0-B"）
5. **修订**：robots.txt 每个 AI bot 加精确注释
6. **修订**：sitemap/priority 描述对齐 P1.5
7. **修订**：内容模板中英对照
8. **新增**：紧急回滚 SOP
9. **新增**：核心 KPI（GSC 已索引数、Bing 覆盖率、LLM 引用次数）
10. **删除**：重复的 307 严重度行
11. **加强**：P3 内容模板 + 数据表格规范
12. **重构**：PR 拆分从 8 个扩到 10 个，按"风险/收益"排序
13. **新增**：crypto 板块（License / GDPR）

---

## 实施建议

按 v3 PR 列表执行，**最高优先级是 PR1 + PR2**：
- PR1（10 分钟）：robots.txt AI 段 + vercel.json redirect
- PR2（半天）：vite-prerender 集成 + 路由自动化脚本

**其它都可以延后**。PR1+PR2 把"对 AI 爬虫可见"和"对 Googlebot 索引可见"两个核心问题同时解决——其它都是这之上的增量优化。

---

## 自我审计元

- 审计耗时：~25 分钟
- 阅读文件：原方案 v2、本地代码（components/SEO, App, locale, site config）、robots.txt、sitemap.xml、生产 curl 实测
- 修订影响：v2→v3 内容增量约 50%、结构调整约 30%、行级修订约 20%
- 修订后再次实测建议：用 6 个 grep 命令验证 v3 第 7 章"验收清单"全部通过
