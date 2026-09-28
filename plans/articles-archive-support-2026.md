# Plan: articles/ 目录根治支持（build-blog.js 自动扫描）

## Context
审计发现 `articles/` 目录下文章不在 build pipeline 扫描范围（每次新增都是 dead content）：
- `articles/blinken-ai-science/` + `articles/scientific-agent-skills/` 已整合到 `content/blog/`（C2 A）
- `articles/howtolivebetter/` 又新增 → 同一问题再次出现

上游 commit `e18d160`（614 条循证生活建议）走的又是 `articles/` 路径 → dead content。

## Tasks
- [x] T1: `scripts/build-blog.js` 加 `scanArticles()` 函数 + 合并到 generateBlogData
- [x] T2: 给 howtolivebetter 加 frontmatter
- [x] T3: 验证 build:blog 输出 185 posts
- [x] T4: tsc + vitest 138/138
- [x] T5: 完整 build + prerender，howtolivebetter 进入 dist
- [x] T6: commit + push

## Verification
- 184 → 185 posts
- dist/blog/howtolivebetter/index.html 存在
- chunk error handler 仍然在主 bundle（regression check）
