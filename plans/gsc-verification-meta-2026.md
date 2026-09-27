# Plan: GSC verification meta tag

## Context
Google Search Console 验证 token：
`<meta name="google-site-verification" content="0zGewtyC1t6tk9BeWk3lM_afRapeAgX_O3oTjbeWzGk" />`

Google 推荐做法是直接 paste 到首页 `<head>`。本项目 `src/components/Analytics.tsx` 已支持通过 `VITE_GSC_VERIFICATION_ID` env var 注入，但：
1. default 静态方式 GSC 验证更稳定（即使 React 挂载失败）
2. 测试中 Analytics useEffect 路径后才执行，不在 SSR HTML 中
3. 用户给出的 token 适合作为 fallback 默认值

## Tasks
- [ ] T1: 把 token 加进 `index.html` `<head>`，放 theme-color 之前
- [ ] T2: 更新 `docs/analytics-setup.md`，说明 GSC meta tag 现状（已 static 配置，env 路径仍保留）
- [ ] T3: 验证 build
- [ ] T4: commit + push

## Verification
- `npm run build:dev` exit 0
- `dist/index.html` 含 verification meta
- 验证后用户去 Search Console 点 "Verify" 即可

