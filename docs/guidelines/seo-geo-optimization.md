# SEO/GEO 优化规范（SEO/GEO Optimization Guideline）

> 适用范围：任何以提升搜索引擎收录 / 排名 / 有机流量 / AI 引用（GEO）为目标的改动。
> 核心要求：**以收录/流量/KPI 数据为反馈**，方案落盘后按数据迭代，不能"改完即忘"。

## 流程

1. **方案落盘**：改动前先写方案到 `docs/`（如 `docs/seo-geo-optimization-plan.md`），在 `DOCS.md` 建索引
2. **检查现有规范**：遵循项目既有的 SEO 约定（见 `docs/blog-frontmatter-guide.md`、`docs/static-resources-guide.md` 等）
3. **实施**：改 sitemap、meta、JSON-LD、多语言 URL、内容 frontmatter 等
4. **本地验证**：
   - `npm run build:sitemap`（检查 sitemap URL 数）
   - `npm run build:blog`、`npm run build:llms`
   - 浏览器实测页面 title/description 正确
5. **数据反馈（关键）**：上线后以 GSC / Bing Webmaster / LLM 抓取表现作为反馈
   - 记录收录 URL 数（如 `收录页从 41 → 54`）
   - 记录流量/印象数/点击变化
6. **迭代**：根据数据决定保留、调整或回滚；把结果与量化数据沉淀回文档

## 验收标准

- [ ] 方案已落盘并在 DOCS.md 建索引
- [ ] 构建产物（sitemap/llms）正确生成
- [ ] 浏览器实测 meta 无误
- [ ] 有明确的数据反馈链路（收录/流量变化可追踪）