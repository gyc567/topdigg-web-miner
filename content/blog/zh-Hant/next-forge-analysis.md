---
title: "next-forge 深度解析：Vercel 出品的生產級 Next.js Monorepo 模板"
description: "全面分析 Vercel 官方開源的 next-forge —— 一個基於 Turborepo 的生產級 Next.js 應用模板，專為快速建構 SaaS 而設計。從「快速、便宜、有主見、現代、安全」五大設計原則，到 apps/ + packages/ 的 monorepo 架構，從 Clerk 認證、Stripe 支付、Prisma 資料庫到 AI 整合等 18+ 共享套件，再到完整的初始化與部署教學，一文講透這個 7.5k stars 的模板為何被稱為「下一個 SaaS 的最佳起點」。"
date: "2026-08-03"
author: "TopDigg Research Team"
tags: ["next-forge", "Vercel", "Turborepo", "Next.js", "Monorepo", "SaaS", "模板", "Clerk", "Stripe", "Prisma", "Tailwind CSS", "shadcn/ui", "TypeScript"]
categories: ["深度解析"]
keywords: ["next-forge", "Vercel", "Turborepo", "Next.js 模板", "Monorepo", "SaaS 模板", "生產級", "Clerk", "Stripe", "Prisma", "shadcn/ui", "Tailwind CSS 4", "React", "TypeScript", "開發體驗"]
---

# next-forge 深度解析：Vercel 出品的生產級 Next.js Monorepo 模板

> 核心理念：**「開箱即用的生產級 SaaS 底座」** 不該是一堆需要逐個拼裝的碎片，而應該是一個有主見（Opinionated）、各部件天然協同的完整體系。next-forge 用「十年 Web 應用開發經驗」濃縮出五大原則——**快速、便宜、有主見、現代、安全**——讓開發者把精力放在業務上，而不是反覆搭建認證、支付、資料庫這些基礎設施。

---

## 一、專案說明

### 1.1 這是什麼？

**next-forge** 是 Vercel 官方維護的一個開源專案，自我定位是「**Production-grade Turborepo template for Next.js apps**」（面向 Next.js 應用的生產級 Turborepo 模板）。它的核心用途只有一個：**讓你跳過 SaaS 專案「從零搭基建」的階段，直接在一個完整、可部署、前後端齊全的骨架上開始寫業務程式碼。**

關鍵事實：

- 倉庫：`https://github.com/vercel/next-forge`
- 組織：**Vercel** 官方
- Stars：**7.5k+**，Forks 686
- 語言：TypeScript
- 協議：MIT
- 版本：v6.0.2（2026 年 3 月）
- 創建於：2023 年 1 月

它不是 create-t3-app 那樣的「互動式 CLI 嚮導」，而是一個**可以直接複製的模板倉庫**——複製下來，裝上依賴，填好環境變數，一個包含行銷站、主應用、API、文件、郵件、元件庫的完整 SaaS 骨架就在你手裡了。

### 1.2 它想解決什麼問題？

做過 SaaS 的人都知道：**認證、資料庫、支付、郵件、分析、監控、限流、Webhook、SEO、國際化……** 這些「每個產品都要有」的東西，單獨搭起來每一項都要花好幾天，而且很容易搭得半吊子。

next-forge 的答案：**把這些全部整合好、驗證過、能跑通，作為模板交付。** 它自帶 6 個應用（Apps）和 18+ 個共享套件（Packages），幾乎涵蓋了一個現代 SaaS 需要的全部基礎設施。

### 1.3 官方 Demo

- **Web**（行銷站）：https://demo.next-forge.com
- **App**（主應用）：https://app.demo.next-forge.com
- **Storybook**（元件庫）：https://storybook.demo.next-forge.com
- **API**（健康檢查）：https://api.demo.next-forge.com/health

---

## 二、核心思想：五大設計原則

next-forge 的全部設計決策，都圍繞五條原則展開。理解這五條，就理解了整個專案。

### 2.1 Fast —— 快速

「快速建構、快速執行、快速部署、快速迭代」貫穿始終：

- 用 **Turborepo** 做任務編排，快取建構結果；
- 用 **Bun** 作為預設套件管理器（比 npm/yarn 快得多）；
- 每個 app 獨立可部署，互不阻塞。

### 2.2 Cheap —— 便宜

「免費起步，按需付費擴展」：

- 起步階段幾乎全是免費額度：Neon 資料庫免費層、Clerk 免費層、Vercel Hobby 方案；
- 架構上讓你「先用免費的，等規模大了再升級」，不逼你一開始就花大錢。

### 2.3 Opinionated —— 有主見

這是最關鍵的一條：**next-forge 不假裝「中立」，而是明確地替你做選擇。** 認證就用 Clerk、資料庫就用 Prisma + Neon、支付就用 Stripe、UI 就用 Tailwind + shadcn/ui——**選好的部件被設計成天然協同工作**，而不是給你一堆選項讓你自己糾結。

### 2.4 Modern —— 現代

只用**最新穩定**的技術：

- Next.js App Router（而非舊的 Pages Router）；
- Tailwind CSS 4；
- React 19；
- TypeScript 端到端型別安全。

### 2.5 Safe —— 安全

預設安全姿態：

- **端到端型別安全**（TypeScript 全鏈路）；
- Arcjet WAF 應用安全防護；
- Nosecone 安全回應頭；
- 限流（Upstash Redis）。

> 一句話總結：**這五條原則不是口號，而是「選型過濾網」**——凡是違背「快、省、有主見、現代、安全」的技術，就不會出現在模板裡。

---

## 三、技術架構：apps/ + packages/ 的 Monorepo

next-forge 採用 Turborepo 管理的 monorepo 結構，分為「可部署應用」和「共享套件」兩層。

### 3.1 Apps（可部署的應用）

- **web**（連接埠 3001）——行銷網站：Tailwind CSS + shadcn/ui + 文件站
- **app**（連接埠 3000）——主應用：Next.js App Router、Clerk 認證、Prisma 資料庫、協作功能
- **api**（連接埠 3002）——REST API：Stripe Webhook、健康檢查、監控
- **docs**（連接埠 3003）——文件站：Fumadocs（MDX）、AI 聊天、RSS
- **email**（連接埠 3004）——郵件模板：React Email + Resend
- **storybook**（連接埠 3005）——元件開發環境：Storybook + shadcn/ui

每個 app **獨立、自包含、可單獨部署**——這是 monorepo 的核心理念：共享程式碼，但部署互不干擾。

### 3.2 Packages（共享套件）

- **@repo/auth** —— 認證：Clerk
- **@repo/database** —— 資料庫：Prisma + Neon + Zod
- **@repo/design-system** —— 設計系統：Radix UI + Tailwind CSS 4 + shadcn/ui（new-york 風格）
- **@repo/payments** —— 支付：Stripe 訂閱管理
- **@repo/email** —— 交易郵件：Resend + React Email
- **@repo/analytics** —— 分析：Vercel Analytics + PostHog
- **@repo/observability** —— 可觀測：Sentry + Logtail（BetterStack）
- **@repo/security** —— 安全：Arcjet + Nosecone
- **@repo/rate-limit** —— 限流：Upstash Redis + Ratelimit
- **@repo/feature-flags** —— 功能旗標：Vercel Toolbar + Flags SDK
- **@repo/webhooks** —— Webhook：Svix（入站/出站）
- **@repo/ai** —— AI 整合：AI SDK + OpenAI
- **@repo/cms** —— 內容管理：BaseHub（型別安全）
- **@repo/seo** —— SEO：Metadata + JSON-LD + Sitemap
- **@repo/storage** —— 儲存：檔案上傳與管理
- **@repo/notifications** —— 通知：應用內通知
- **@repo/collaboration** —— 協作：即時游標 + 頭像
- **@repo/internationalization** —— 國際化：Languine
- **@repo/next-config** —— 共享 Next.js 設定
- **@repo/typescript-config** —— 共享 TS 設定

### 3.3 套件之間的依賴關係

- `@repo/design-system` 依賴 `@repo/auth`、`@repo/observability`；
- `@repo/feature-flags` 依賴 `@repo/analytics`、`@repo/auth`、`@repo/design-system`；
- `@repo/database` 依賴 Prisma、Neon、Zod。

這種「套件引用套件」的設計，讓共享程式碼**只寫一次、處處可用**，同時保持各 app 的獨立性。

### 3.4 工具鏈一覽

- **套件管理器**：Bun（引擎要求 bun@1.3.10）
- **Monorepo**：Turborepo 2.8
- **打包**：tsup
- **程式碼品質**：Biome + Ultracite
- **測試**：Vitest
- **樣式**：Tailwind CSS 4 + PostCSS

---

## 四、設計哲學：為什麼是這些選擇？

### 4.1 為什麼用 Turborepo？

因為 **Turborepo 是 Vercel 自家的產品**——這不是「自家人偏愛」，而是實打實的原生整合：

- 遠端快取（Remote Caching）與 Vercel 無縫配合；
- 任務管道（`^build` 依賴關係自動編排）；
- 增量建構，改一個套件只重建構相關的 app。

### 4.2 為什麼用 Bun 而不用 npm/yarn/pnpm？

- Bun 是**目前最快的 JS 執行時/套件管理器**之一，冷啟動和安裝速度遠超 npm；
- 根 `package.json` 宣告 `packageManager: "bun@1.3.10"`，所有 dev 腳本預設走 Bun；
- 當然 npm/pnpm 也相容，但「預設快」是它的姿態。

### 4.3 為什麼用 Clerk 而不是 NextAuth？

- **多租戶（Org）支援開箱即用**——SaaS 產品的組織管理是剛需；
- 基於 Webhook 的使用者同步（`packages/auth/keys.ts` 中的 `CLERK_WEBHOOK_SECRET`）；
- 相比自託管 NextAuth，Clerk 對「開箱即用」的 SaaS 更省心。

### 4.4 為什麼用 REST 而不是 tRPC？

這是個有意思的選擇：**next-forge 明確不採用 tRPC，而是用 REST**。原因：

- **更廣的生態相容性**——REST 是通用標準，任何客戶端都能消費；
- `@repo/payments`、`@repo/webhooks` 都是 REST 風格；
- 對「模板」而言，REST 的普適性 > tRPC 的型別便利。

### 4.5 部署哲學：單專案還是多專案？

next-forge 兩種都支援：

- **單個 Vercel 專案**：適合快速起步；
- **多個 Vercel 專案**：每個 `apps/*` 獨立部署，互不干擾——這是 monorepo 的真正價值。

---

## 五、詳細教學：從零開始用 next-forge

### 5.1 第一步：初始化專案

```bash
# 方式一：官方 init 命令
npx next-forge@latest init

# 方式二：直接複製
git clone https://github.com/vercel/next-forge.git my-saas
cd my-saas
bun install
```

前置要求：

- Node.js 20+
- Bun（或 npm/yarn/pnpm）
- Stripe CLI（本地測試 Webhook 用）

### 5.2 第二步：設定環境變數

每個套件都帶 `.env.example`，照著填即可：

```bash
# packages/auth/.env.example
CLERK_SECRET_KEY=sk_...
CLERK_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...

# packages/database/.env.example
DATABASE_URL=postgresql://...

# packages/rate-limit/.env.example
UPSTASH_REDIS_REST_URL=...
UPSTASH_REDIS_REST_TOKEN=...

# packages/payments/.env.example
STRIPE_SECRET_KEY=sk_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

需要註冊的服務帳號：Clerk、Stripe、Resend、Neon、Upstash、Sentry、PostHog、Arcjet 等（按你實際用到的模組）。

### 5.3 第三步：資料庫初始化

```bash
# 格式化 + 生成 + 遷移開發庫
bun run migrate

# 或者不建遷移，直接推 schema
bun run db:push
```

### 5.4 第四步：日常開發命令

```bash
bun run dev                    # 透過 turbo 跑所有 app
bun run dev --filter=web       # 只跑行銷站
bun run build                  # 生產建構
bun run test                   # 跑全部測試
bun run check                  # Ultracite 程式碼檢查
```

### 5.5 第五步：部署到 Vercel

每個 app 是一個獨立的 Vercel 專案：

```bash
vercel --prod --token=xxx apps/web
vercel --prod --token=xxx apps/app
vercel --prod --token=xxx apps/api
```

或者利用 Vercel 的 monorepo 自動偵測，在儀表板裡逐個連接。

### 5.6 第六步：新增套件

```bash
cd packages
mkdir my-package && cd my-package
bun init -y
```

- 在 `packages/my-package/package.json` 裡命名為 `@repo/my-package`；
- 在根 `package.json` 的 workspaces 裡登記；
- 在需要的 app 裡 `import { x } from "@repo/my-package"` 即可。

---

## 六、功能清單：開箱即用

- **認證**：Clerk 完整認證 + 多租戶組織管理
- **支付**：Stripe 訂閱全生命週期（建立、更新、取消、Webhook）
- **資料庫**：Prisma ORM + Neon Serverless PostgreSQL + 遷移
- **UI**：shadcn/ui（new-york）+ Radix + 暗色模式 + Geist 字型
- **郵件**：React Email 模板 + Resend 發送
- **分析**：Vercel Analytics + PostHog（Web 與產品雙分析）
- **可觀測**：Sentry 錯誤追蹤 + Logtail 日誌 + BetterStack 監控
- **安全**：Arcjet WAF + Nosecone 安全頭 + 限流
- **功能旗標**：Vercel Toolbar + Flags SDK（按使用者評估）
- **Webhook**：Svix 入站/出站管理
- **AI**：AI SDK 串流輸出 + OpenAI 整合
- **CMS**：BaseHub 型別安全內容管理
- **SEO**：Metadata + JSON-LD + Sitemap
- **國際化**：Languine 多語言字典
- **協作**：即時游標 + 線上頭像
- **儲存**：檔案上傳管理
- **通知**：應用內通知系統
- **排程任務**：Vercel Cron（配 Sentry 監控）

---

## 七、歸納總結：觀點與結論

### 7.1 核心觀點

1. **「生產級模板」的價值在於把隱性知識顯性化**。next-forge 最大的貢獻不是某個具體功能，而是把「十年做 Web 應用」沉澱的選型經驗、目錄結構、工程規範，一次性交付給後來者——**這是知識的複用，而不僅是程式碼的複用**。
2. **「有主見」是模板的核心競爭力**。一個中立的模板等於沒有模板（你還是要自己糾結選型）；next-forge 替你做決定，讓你「拿到就能跑」——**選擇權的減少，換來的是決策成本的消失**。
3. **Monorepo 是 SaaS 的正確打開方式**。共享程式碼 + 獨立部署，讓行銷站、主應用、API、文件、郵件在同一程式碼庫演進，又不互相阻塞——**這是 Turborepo 交給下一代脚手架的最重要一課**。
4. **型別安全是「安全原則」的第一層**。從資料庫（Prisma + Zod）到 UI（shadcn/ui）到設定（共享 tsconfig），全鏈路 TypeScript 讓「改一處壞一片」的傳統恐懼大大降低。

### 7.2 它不適合誰？（誠實的邊界）

- **追求極簡的開發者**：19+ 個套件對簡單專案是「過度工程」；
- **想自己掌控一切選型的人**：next-forge 的「有主見」對你反而是束縛；
- **不需要 SaaS 多租戶的小工具**：Clerk + Stripe + Neon 這套組合對你太重。

### 7.3 對開發者的啟示

- 搭 SaaS 前先看看 next-forge，**哪怕不直接用，它的套件劃分方式也是極好的架構參考**；
- 「先免費後擴展」的架構思維值得學習——**不是所有東西一開始都要上企業級設定**；
- 端到端型別安全帶來的信心，會讓你的迭代速度上一個台階。

### 7.4 結語

在「Next.js 脚手架」這個擁擠的賽道上，next-forge 的差異化在於**它不是又一個「hello world 模板」，而是一套完整的、可部署的、有生產思維的 SaaS 骨架**。它替你做完了所有「每個產品都要做但沒人愛做」的事，讓你從第一天就在寫真正的業務程式碼。

對打算啟動下一個 SaaS 的團隊，這句話可能是最準確的評價：**「這不是一個模板，而是一個被驗證過的起點。」**

---

## 參考資料

- next-forge 官方倉庫：https://github.com/vercel/next-forge
- 官方文件：https://www.next-forge.com/docs
- 官方 Demo（Web）：https://demo.next-forge.com
- 官方 Demo（App）：https://app.demo.next-forge.com
- Turborepo 官網：https://turborepo.com
- Clerk 官網：https://clerk.com
- Stripe 官網：https://stripe.com
