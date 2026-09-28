# Plan: 审计修复 + 端到端测试

## Context
审计 4 个上游 commit + 我的 SEO 系列工作，发现 2 个 critical dead feature + 3 个 minor unused import。

## Tasks
- [x] T1: 清理 BlogPost.tsx unused `makeArticleSchema` import
- [x] T2: 清理 AIDailyPost.tsx unused `makeArticleSchema` import
- [x] T3: 清理 AIProductsPost.tsx unused `makeArticleSchema` import + 修正行内注释
- [x] T4: 端到端 build + prerender + i18n parity + 端到端测试
- [x] T5: commit + push

## Verification
- npm test 126/126
- npx tsc --noEmit clean
- npm run build:dev 绿
- npm run build:full prerender 绿
- dist/ 路由 prerender 完整
- i18n-keys.test 5 语言对齐

## C1/C2 Decision
critical 问题（财经简报 dead feature + articles/ orphan）走决策路径，不在本 PR。
