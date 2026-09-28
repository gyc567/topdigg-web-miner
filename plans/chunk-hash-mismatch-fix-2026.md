# Plan: 修 chunk hash mismatch (chunk-import 404 错)

## Context
用户反馈生产环境报错：
```
MoneyLabIndex--hd-xccw.js:1 Failed to load resource: 404
vendor-misc-DycOrJuZ.js:40 TypeError: Failed to fetch dynamically imported module
```

根因：Vite 用 content hash 命名 chunk（`MoneyLabIndex-<hash>.js`）。新 deploy 后 hash 变，但用户浏览器可能加载了缓存的旧 `index.html`（引用旧 hash），导致 dynamic import 找不到旧 chunk。

## Tasks
- [ ] T1: `src/main.tsx` 加 `vite:preloadError` 监听：失败时强制 reload
- [ ] T2: 加 unhandledrejection handler 兜底其他 chunk 错
- [ ] T3: `vercel.json` 给 `/index.html` 加 `must-revalidate` 确保浏览器重新验证
- [ ] T4: 单元测试：`src/main.tsx` 的 chunk 错处理
- [ ] T5: 端到端 build + i18n + test 验证
- [ ] T6: commit + push

## Verification
- npm test 126/126 + 新增测试通过
- tsc 干净
- vite build 绿

