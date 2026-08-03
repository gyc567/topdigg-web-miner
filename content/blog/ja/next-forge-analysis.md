---
title: "next-forge 徹底解説：Vercel が公開した本番グレードの Next.js Monorepo テンプレート"
description: "Vercel 公式がオープンソースで公開する next-forge —— Turborepo ベースの本番グレード Next.js アプリテンプレートを徹底分析。SaaS を素早く立ち上げるために設計されており、「Fast・Cheap・Opinionated・Modern・Safe」の五大設計原則から、apps/ + packages/ の monorepo アーキテクチャ、Clerk 認証・Stripe 決済・Prisma データベースから AI 統合まで 18+ の共有パッケージ、さらに初期化からデプロイまでの完全チュートリアルまで、7.5k stars を集めるテンプレートが「次の SaaS の最良の出発点」と呼ばれる理由を 1 記事で解説します。"
date: "2026-08-03"
author: "TopDigg Research Team"
tags: ["next-forge", "Vercel", "Turborepo", "Next.js", "Monorepo", "SaaS", "テンプレート", "Clerk", "Stripe", "Prisma", "Tailwind CSS", "shadcn/ui", "TypeScript"]
categories: ["徹底解説"]
keywords: ["next-forge", "Vercel", "Turborepo", "Next.js テンプレート", "Monorepo", "SaaS テンプレート", "本番グレード", "Clerk", "Stripe", "Prisma", "shadcn/ui", "Tailwind CSS 4", "React", "TypeScript", "開発体験"]
---

# next-forge 徹底解説：Vercel が公開した本番グレードの Next.js Monorepo テンプレート

> 核心理念：**「すぐ使える本番グレードの SaaS 基盤」は、一つずつ組み立てるパーツの寄せ集めであってはならない。Opinionated（考え方が明確）で、各パーツが自然に連携する完全なシステムであるべきだ。** next-forge は「10 年の Web アプリ開発経験」を **Fast・Cheap・Opinionated・Modern・Safe** の五大原則に凝縮し、開発者が認証・決済・データベースといったインフラを何度も組み直すのではなく、ビジネスロジックに集中できるようにした。

---

## 一、プロジェクト概要

### 1.1 これは何か？

**next-forge** は Vercel 公式がメンテナンスするオープンソースプロジェクトで、自らを「**Production-grade Turborepo template for Next.js apps**」（Next.js アプリ向けの本番グレード Turborepo テンプレート）と位置づけています。その目的はただ一つ：**SaaS プロジェクトの「ゼロからのインフラ構築」フェーズをスキップし、完全でデプロイ可能なフルスタックの骨格の上で、いきなりビジネスコードを書き始めること。**

重要な事実：

- リポジトリ：`https://github.com/vercel/next-forge`
- 組織：**Vercel** 公式
- Stars：**7.5k+**、Forks 686
- 言語：TypeScript
- ライセンス：MIT
- バージョン：v6.0.2（2026 年 3 月）
- 作成：2023 年 1 月

これは create-t3-app のような「対話型 CLI ウィザード」ではなく、**そのまま clone できるテンプレートリポジトリ**です。clone して、依存関係をインストールし、環境変数を埋めれば、マーケティングサイト・メインアプリ・API・ドキュメント・メール・コンポーネントライブラリを含む完全な SaaS の骨格が手に入ります。

### 1.2 何を解決しようとしているのか？

SaaS を作ったことがある人なら誰でも知っているリストがあります：**認証、データベース、決済、メール、分析、監視、レート制限、Webhook、SEO、国際化……** これらはどれも「どのプロダクトにも必要」なものですが、それぞれを単独でまともに組み上げるには数日かかり、しかも中途半端になりがちです。

next-forge の答え：**これらをすべて統合し、エンドツーエンドで動作することを検証し、テンプレートとして届けること。** 6 つのアプリ（Apps）と 18+ の共有パッケージ（Packages）を同梱し、現代の SaaS が必要とするインフラのほぼ全てをカバーしています。

### 1.3 公式デモ

- **Web**（マーケティングサイト）：https://demo.next-forge.com
- **App**（メインアプリ）：https://app.demo.next-forge.com
- **Storybook**（コンポーネントライブラリ）：https://storybook.demo.next-forge.com
- **API**（ヘルスチェック）：https://api.demo.next-forge.com/health

---

## 二、核心理念：五大設計原則

next-forge のすべての設計判断は、この五つの原則を軸に展開します。この五つを理解すれば、プロジェクト全体を理解したことになります。

### 2.1 Fast —— 速さ

「速く構築、速く実行、速くデプロイ、速くイテレーション」が全体を貫きます：

- **Turborepo** でタスクをオーケストレーションし、ビルド結果をキャッシュ；
- **Bun** をデフォルトのパッケージマネージャーに採用（npm/yarn よりはるかに高速）；
- 各アプリは独立してデプロイ可能で、互いにブロックし合わない。

### 2.2 Cheap —— 安さ

「無料でスタート、必要に応じて拡張」：

- 立ち上げ期はほぼ全て無料枠で賄える：Neon データベース無料枠、Clerk 無料枠、Vercel Hobby プラン；
- アーキテクチャ上「まず無料のものを使い、規模が大きくなってからアップグレード」する設計で、最初から大きな出費を強要しない。

### 2.3 Opinionated —— 明確な考え方

これが最も重要です：**next-forge は「中立」を装わず、明確にあなたの代わりに選択を行います。** 認証は Clerk、データベースは Prisma + Neon、決済は Stripe、UI は Tailwind + shadcn/ui——**選ばれた部品は自然に連携するよう設計されており**、選択肢の羅列に頭を悩ませる必要はありません。

### 2.4 Modern —— 最新

**最新の安定版**のみを使用：

- Next.js App Router（旧 Pages Router ではなく）；
- Tailwind CSS 4；
- React 19；
- TypeScript によるエンドツーエンドの型安全性。

### 2.5 Safe —— 安全性

デフォルトで安全な姿勢：

- **エンドツーエンドの型安全性**（スタック全体で TypeScript）；
- Arcjet WAF によるアプリケーションセキュリティ；
- Nosecone によるセキュリティレスポンスヘッダー；
- レート制限（Upstash Redis）。

> 一言でまとめると：**この五原則はスローガンではなく「選定フィルター」**——「速く・安く・明確に・現代的で・安全」に反する技術は、テンプレートには入りません。

---

## 三、技術アーキテクチャ：apps/ + packages/ の Monorepo

next-forge は Turborepo 管理の monorepo 構造を採用し、「デプロイ可能なアプリ」と「共有パッケージ」の二層に分かれています。

### 3.1 Apps（デプロイ可能なアプリ）

- **web**（ポート 3001）——マーケティングサイト：Tailwind CSS + shadcn/ui + ドキュメント
- **app**（ポート 3000）——メインアプリ：Next.js App Router、Clerk 認証、Prisma データベース、コラボレーション機能
- **api**（ポート 3002）——REST API：Stripe Webhook、ヘルスチェック、監視
- **docs**（ポート 3003）——ドキュメントサイト：Fumadocs（MDX）、AI チャット、RSS
- **email**（ポート 3004）——メールテンプレート：React Email + Resend
- **storybook**（ポート 3005）——コンポーネント開発環境：Storybook + shadcn/ui

各アプリは**独立・自己完結・個別デプロイ可能**——これが monorepo の核心理念です：コードは共有するが、デプロイは互いに干渉しない。

### 3.2 Packages（共有パッケージ）

- **@repo/auth** —— 認証：Clerk
- **@repo/database** —— データベース：Prisma + Neon + Zod
- **@repo/design-system** —— デザインシステム：Radix UI + Tailwind CSS 4 + shadcn/ui（new-york スタイル）
- **@repo/payments** —— 決済：Stripe サブスクリプション管理
- **@repo/email** —— トランザクションメール：Resend + React Email
- **@repo/analytics** —— 分析：Vercel Analytics + PostHog
- **@repo/observability** —— 可観測性：Sentry + Logtail（BetterStack）
- **@repo/security** —— セキュリティ：Arcjet + Nosecone
- **@repo/rate-limit** —— レート制限：Upstash Redis + Ratelimit
- **@repo/feature-flags** —— フィーチャーフラグ：Vercel Toolbar + Flags SDK
- **@repo/webhooks** —— Webhook：Svix（インバウンド/アウトバウンド）
- **@repo/ai** —— AI 統合：AI SDK + OpenAI
- **@repo/cms** —— コンテンツ管理：BaseHub（型安全）
- **@repo/seo** —— SEO：Metadata + JSON-LD + Sitemap
- **@repo/storage** —— ストレージ：ファイルアップロード管理
- **@repo/notifications** —— 通知：アプリ内通知
- **@repo/collaboration** —— コラボレーション：ライブカーソル + アバター
- **@repo/internationalization** —— 国際化：Languine
- **@repo/next-config** —— 共有 Next.js 設定
- **@repo/typescript-config** —— 共有 TS 設定

### 3.3 パッケージ間の依存関係

- `@repo/design-system` は `@repo/auth`、`@repo/observability` に依存；
- `@repo/feature-flags` は `@repo/analytics`、`@repo/auth`、`@repo/design-system` に依存；
- `@repo/database` は Prisma、Neon、Zod に依存。

この「パッケージがパッケージを参照する」設計により、共有コードは**一度書けばどこでも使え**、各アプリの独立性は保たれます。

### 3.4 ツールチェーン一覧

- **パッケージマネージャー**：Bun（エンジン要件 bun@1.3.10）
- **Monorepo**：Turborepo 2.8
- **バンドラー**：tsup
- **コード品質**：Biome + Ultracite
- **テスト**：Vitest
- **スタイリング**：Tailwind CSS 4 + PostCSS

---

## 四、設計哲学：なぜこの選択なのか？

### 4.1 なぜ Turborepo なのか？

なぜなら **Turborepo は Vercel 自社製品**だからです——これは「身内びいき」ではなく、本物のネイティブ統合です：

- Remote Caching が Vercel とシームレスに連携；
- タスクパイプライン（`^build` の依存関係を自動オーケストレーション）；
- インクリメンタルビルド——1 つのパッケージを変更しても、影響を受けるアプリだけ再ビルド。

### 4.2 なぜ npm/yarn/pnpm ではなく Bun なのか？

- Bun は**現在最速クラスの JS ランタイム/パッケージマネージャー**で、コールドスタートとインストール速度が npm を大きく上回ります；
- ルートの `package.json` に `packageManager: "bun@1.3.10"` と宣言され、dev スクリプトはデフォルトで Bun を使用；
- もちろん npm/pnpm も互換ですが、「デフォルトで速い」がその姿勢です。

### 4.3 なぜ NextAuth ではなく Clerk なのか？

- **マルチテナント（組織）機能がすぐに使える**——SaaS 製品にとって組織管理は必須要件；
- Webhook ベースのユーザー同期（`packages/auth/keys.ts` の `CLERK_WEBHOOK_SECRET`）；
- セルフホスト型 NextAuth に比べ、「すぐ使える」SaaS には Clerk の方が手間がかかりません。

### 4.4 なぜ tRPC ではなく REST なのか？

これは興味深い選択です：**next-forge は tRPC を明確に採用せず、REST を使います。** 理由：

- **より広いエコシステム互換性**——REST は普遍的な標準であり、あらゆるクライアントが利用可能；
- `@repo/payments`、`@repo/webhooks` も REST スタイル；
- 「テンプレート」にとっては、REST の普遍性は tRPC の型便利さに勝ります。

### 4.5 デプロイ哲学：単一プロジェクトか複数か？

next-forge は両方をサポートします：

- **単一の Vercel プロジェクト**：素早く始めるのに最適；
- **複数の Vercel プロジェクト**：各 `apps/*` を独立デプロイ——これこそ monorepo の真の価値です。

---

## 五、完全チュートリアル：next-forge をゼロから始める

### 5.1 ステップ 1：プロジェクトの初期化

```bash
# 方法 A：公式 init コマンド
npx next-forge@latest init

# 方法 B：直接 clone
git clone https://github.com/vercel/next-forge.git my-saas
cd my-saas
bun install
```

前提条件：

- Node.js 20+
- Bun（または npm/yarn/pnpm）
- Stripe CLI（ローカルで Webhook をテストする場合）

### 5.2 ステップ 2：環境変数の設定

各パッケージに `.env.example` が同梱されているので、それに従って埋めるだけです：

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

登録が必要なサービス：Clerk、Stripe、Resend、Neon、Upstash、Sentry、PostHog、Arcjet など（実際に使うモジュールに応じて）。

### 5.3 ステップ 3：データベースの初期化

```bash
# フォーマット + 生成 + 開発 DB へのマイグレーション
bun run migrate

# またはマイグレーションを飛ばして schema を直接 push
bun run db:push
```

### 5.4 ステップ 4：日常の開発コマンド

```bash
bun run dev                    # turbo で全アプリを実行
bun run dev --filter=web       # マーケティングサイトのみ実行
bun run build                  # プロダクションビルド
bun run test                   # 全テストを実行
bun run check                  # Ultracite コードチェック
```

### 5.5 ステップ 5：Vercel へのデプロイ

各アプリは独立した Vercel プロジェクトです：

```bash
vercel --prod --token=xxx apps/web
vercel --prod --token=xxx apps/app
vercel --prod --token=xxx apps/api
```

または Vercel の monorepo 自動検出を利用し、ダッシュボードで順に接続します。

### 5.6 ステップ 6：新しいパッケージの追加

```bash
cd packages
mkdir my-package && cd my-package
bun init -y
```

- `packages/my-package/package.json` で `@repo/my-package` と命名；
- ルート `package.json` の workspaces に登録；
- 必要なアプリで `import { x } from "@repo/my-package"` するだけ。

---

## 六、機能リスト：すぐに使える

- **認証**：Clerk 完全認証 + マルチテナント組織管理
- **決済**：Stripe サブスクリプション全ライフサイクル（作成・更新・解約・Webhook）
- **データベース**：Prisma ORM + Neon Serverless PostgreSQL + マイグレーション
- **UI**：shadcn/ui（new-york）+ Radix + ダークモード + Geist フォント
- **メール**：React Email テンプレート + Resend 送信
- **分析**：Vercel Analytics + PostHog（Web とプロダクトの両分析）
- **可観測性**：Sentry エラートラッキング + Logtail ログ + BetterStack 監視
- **セキュリティ**：Arcjet WAF + Nosecone セキュリティヘッダー + レート制限
- **フィーチャーフラグ**：Vercel Toolbar + Flags SDK（ユーザーベース評価）
- **Webhook**：Svix インバウンド/アウトバウンド管理
- **AI**：AI SDK ストリーミング + OpenAI 統合
- **CMS**：BaseHub 型安全コンテンツ管理
- **SEO**：Metadata + JSON-LD + Sitemap
- **国際化**：Languine 多言語辞書
- **コラボレーション**：ライブカーソル + オンラインアバター
- **ストレージ**：ファイルアップロード管理
- **通知**：アプリ内通知システム
- **スケジュールジョブ**：Vercel Cron（Sentry 監視付き）

---

## 七、まとめ：見解と結論

### 7.1 核心的見解

1. **「本番グレードのテンプレート」の価値は、暗黙知を形式知にすることにある。** next-forge の最大の貢献は特定の機能ではなく、「10 年の Web アプリ開発経験」で培った選定ノウハウ、ディレクトリ構造、エンジニアリング規約を後続者に一括で届けること——**これはコードの再利用ではなく、知識の再利用です。**
2. **「Opinionated」こそテンプレートの中核的競争力。** 中立的なテンプレートはテンプレートではない（結局選定で悩むことになります）。next-forge はあなたの代わりに決めるので、「clone してすぐ動く」——**選択肢が減ることは、意思決定コストの消滅を意味します。**
3. **Monorepo は SaaS の正しい開き方。** コード共有 + 独立デプロイにより、マーケティングサイト・メインアプリ・API・ドキュメント・メールが一つのコードベースで進化しつつ、互いにブロックしません——**これは Turborepo が次世代のスキャフォールドに伝える最も重要な教訓です。**
4. **型安全性は「Safe」原則の第一層。** データベース（Prisma + Zod）から UI（shadcn/ui）から設定（共有 tsconfig）まで、エンドツーエンドの TypeScript は「一箇所変えると全部壊れる」という従来の恐怖を大幅に軽減します。

### 7.2 誰に向いていないか？（正直な境界線）

- **ミニマリスト**：19+ のパッケージはシンプルなプロジェクトには過剰設計；
- **全ての選定を自分で支配したい人**：next-forge の「Opinionated」はあなたにとっては束縛；
- **SaaS マルチテナンシーが不要な小さなツール**：Clerk + Stripe + Neon の組み合わせは重すぎます。

### 7.3 開発者への示唆

- SaaS を始める前に next-forge を見ておくべき——**直接使わなくても、そのパッケージ分割は優れたアーキテクチャの参考になります**；
- 「まず無料、後に拡張」というアーキテクチャ思考は学ぶ価値があります——**すべてが最初からエンタープライズ構成である必要はありません**；
- エンドツーエンドの型安全性がもたらす自信は、イテレーション速度を確実に一段階引き上げます。

### 7.4 結び

「Next.js スキャフォールド」という混雑した領域で、next-forge の差別化ポイントは**「hello world テンプレート」ではなく、完全でデプロイ可能な本番思考の SaaS 骨格**であることです。それは「どのプロダクトにも必要だが誰も作りたがらないこと」をすべて代わりにやってくれ、あなたは初日から本当のビジネスコードを書くことができます。

次の SaaS を立ち上げようとしているチームへの最も正確な評価は、この言葉でしょう：**「これはテンプレートではない。検証済みの出発点だ。」**

---

## 参考資料

- next-forge 公式リポジトリ：https://github.com/vercel/next-forge
- 公式ドキュメント：https://www.next-forge.com/docs
- 公式デモ（Web）：https://demo.next-forge.com
- 公式デモ（App）：https://app.demo.next-forge.com
- Turborepo 公式サイト：https://turborepo.com
- Clerk 公式サイト：https://clerk.com
- Stripe 公式サイト：https://stripe.com
