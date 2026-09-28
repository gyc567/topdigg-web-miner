# Plan: 公众号「瑞哥观势」→「瑞哥观势」重塑品牌（含 QR 图替换）

## Context
用户更新公众号名称 + 提供新 QR 图 (`public/eric_OT.jpg`)。
按用户回复的 Q1-Q6 决策，全面替换。

## Tasks

### QR 图基础设施
- [ ] T1: 转 `public/eric_OT.jpg` → `src/assets/qr-scan-follow.webp`（webp 主）
- [ ] T2: 复制 `public/eric_OT.jpg` → `src/assets/qr-scan-follow.jpg`（jpg fallback）
- [ ] T3: `src/assets/qr.ts` 导出 `qrImageUrlWebp` + `qrImageUrlJpg`
- [ ] T4: 删旧 `public/eric_OT.jpg`（已被 src/assets/ 替代）

### 字符串全量替换
- [ ] T5: content/ 全部 .md 中 "瑞哥观势" → "瑞哥观势"、"瑞哥觀勢" → "瑞哥觀勢"（含 body + author + frontmatter）
- [ ] T6: MEMORY.md 同源替换（公众号名 + 文末固定结尾 + 关于瑞哥观势整段）
- [ ] T7: md-template.md 里可能出现的"瑞哥观势"也换

### 组件层
- [ ] T8: AIDailyPost.tsx：用 qrImageUrlWebp + qrImageUrlJpg（修复现有 src/src 同源 bug）
- [ ] T9: FinanceDailyPost.tsx：加 `<picture>` QR 渲染（mirrors AIDailyPost）
- [ ] T10: FinanceDailyIndex.tsx：可选 - source 信息无需渲染图，但需确认

### Verification
- [ ] T11: 跑 `grep -rn "瑞哥观势\|瑞哥觀勢"` 应 0 hits
- [ ] T12: tsc 0 errors
- [ ] T13: 138 tests 仍 pass
- [ ] T14: build:dev + npm run build 绿
- [ ] T15: 验证 dist/assets/qr-scan-follow.webp + jpg 都在
- [ ] T16: prerender 的 finance-daily/2026-09-28 HTML 里有新 QR 图引用

## 风险
- MEMORY.md 的"永久 / 永不解锁"标注：用户已确认 Q3=是，同意覆盖
- md 文件量大（1318 处）：用脚本批量 replace，统一验证后再 grep 一次
- qr.ts 名字 webp/jpg 双导出：原 AIDailyPost 用单 qrImageUrl，要改成 picture 完整版
