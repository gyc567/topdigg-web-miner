# Analytics & Search Console Setup

> TopDigg — `src/components/Analytics.tsx`

3 项全局 site-tag，env 驱动：

| Service | Env var | 格式 | 验证方式 |
|---|---|---|---|
| Google Analytics 4 | `VITE_GA4_MEASUREMENT_ID` | `G-XXXXXXXXXX` | 自动 |
| Microsoft Clarity | `VITE_CLARITY_PROJECT_ID` | 字母数字串（来自 Clarity dashboard）| 自动 |
| Google Search Console | `VITE_GSC_VERIFICATION_ID` | 长 token（GSC HTML-tag 的 `content` 值） | meta tag |

## 设置步骤

### 1. 拿 ID

- **GA4**：<https://analytics.google.com/> → Admin → Data Streams → Web → 复制 `Measurement ID`（形如 `G-ABCDE12345`）。
- **Clarity**：<https://clarity.microsoft.com/> → 项目 → Settings → Get tracking code，复制 `clarity("script","<projectId>")` 中的 ID。
- **GSC**：<https://search.google.com/search-console/> → Add property → URL prefix → 选 **HTML tag**（非 DNS、非 GA 关联）。GSC 给的 `<meta name="google-site-verification" content="<token>">` 中 `<token>` 部分。

### 2. 写入 Vercel

Vercel → Project → Settings → Environment Variables，3 个变量都加进 **Production**（必要时复用到 Preview）：

```
VITE_GA4_MEASUREMENT_ID    = G-ABCDE12345
VITE_CLARITY_PROJECT_ID    = abc123def4
VITE_GSC_VERIFICATION_ID   = 5a8f2...（长 token）
```

Vite 在 `npm run build` 时把 `import.meta.env.VITE_*` 静态内联进 `dist/`，所以只在 rebuild 后生效。

### 3. dev / local

复制 `.env.example` 到 `.env.local`，填真实 ID。`.env.local` 已在 `.gitignore` 里，不会入仓。

### 4. 验证 deploy

- **GA4**：开 `https://www.topdigg.com/` 后，过 ~30s 在 GA4 → Realtime 应看到 1 个 active user。
- **Clarity**：Clarity Dashboard → Recordings，过几分钟刷一次，新访客 session 应出现。
- **GSC**：Search Console → URL Inspection → 粘贴 home URL → "Test Live URL"。验证 meta tag 命中 → "Ownership confirmed"。

## 为什么 meta tag 验证而不是 HTML 文件？

- HTML 文件验证要 `public/google<hash>.html`，每个环境一份，commit 噪音
- meta tag 由 React Helmet 注入，能跨 sub-domains（pay.topdigg.com / www.topdigg.com）共享
- 不可逆：改 HTML 文件后旧 token 文件永久落在 `dist/` 里

## 已上线的对应 PR

- 组件：`src/components/Analytics.tsx` (PR#X)
- 文档：本文件
