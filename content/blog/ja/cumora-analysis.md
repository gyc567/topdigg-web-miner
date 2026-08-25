---
title: "Cumora 深層解析：AIエージェントをチームの第一級市民とするクロスプラットフォーム協働プラットフォーム — 製品形態、詳細チュートリアル、設計哲学"
description: "yetone/cumora（GitHub オープンソース、MIT、v0.2.2）を主軸に Cumora を多層的に分解：①プロジェクト説明 — PWA+Electron+Capacitor の3シェル、Cumora Cloud+BYOA のデュアルブレイン、AIエージェントを first-class チームメンバーとするクロスプラットフォームチームチャット；②詳細チュートリアル — ローカル起動（Postgres+Redis）、ブレイン切り替え（managed / Claude Code / Codex / Grok Build / Cursor Agent）、調整防衛線（freshness gate / atomic claim / small-brain triage）、実在メール（Resend 出 + Cloudflare Email Routing 入）、Coordination 設計哲学；③技術アーキテクチャ — React 18 + Vite + TS + Tailwind フロントエンド、Express + ws + Postgres + Redis バックエンド、Kubernetes エージェントポッド、Go FUSE ワークスペースマウント、llm_calls コスト台帳；④7 つの設計哲学 — エージェントはチャットボットではなくチームメイト、Computer は第一級、I/O 表面の分離、衝突なき協働、コスト台帳の透明化、CI で強制される big-brain ガード、完全な feature lifecycle。中核主張：AIエージェントをレスポンシブな道具ではなく本物のチームメンバーとして扱う — 永続的なペルソナ、メモリ、ワークの請求、互いを調整し合い、実際のメールを送受信、すべて同じ Roster 上で。"
date: "2026-08-25"
author: "TopDigg Research Team"
tags: ["Cumora", "yetone", "AIエージェント", "マルチエージェント", "BYOA", "Claude Code", "Codex", "Cursor Agent", "Grok Build", "Kubernetes", "React", "Vite", "Express", "Postgres", "Redis", "Electron", "Capacitor", "Cloudflare Workers", "OpenAI Responses API", "オープンソース", "MIT", "エージェント調整", "freshness gate", "triage"]
categories: ["Deep Dive"]
keywords: ["Cumora", "yetone/cumora", "AIエージェントチーム", "マルチエージェント協働", "BYOA", "Bring Your Own Agent", "Claude Code", "Codex CLI", "Cursor Agent", "Grok Build", "OpenAI Responses API", "エージェント調整", "freshness gate", "atomic claim", "small-brain triage", "Kubernetesエージェントポッド", "Go FUSE", "React 18", "Vite", "TypeScript", "Tailwind", "Express", "WebSocket", "Postgres", "Drizzle ORM", "Redis pub/sub", "Electron", "Capacitor", "Cloudflare Workers", "Resend", "エージェントペルソナ", "エージェントメモリ", "feature lifecycle", "ship プロトコル", "オープンソース", "MITライセンス", "設計哲学"]
---

# Cumora 深層解析：AIエージェントをチームの第一級市民とするクロスプラットフォーム協働プラットフォーム — 製品形態、詳細チュートリアル、設計哲学

> **核心思想**：**Cumora（yetone/cumora）は単なる「AIチャットボット統合」ではない — AIエージェントを**チームの第一級市民**として扱うクロスプラットフォーム協働プラットフォームである。**Cumora では、AIエージェントと人間が同じ名簿、同じ DM、同じグループ会話、同じ Kanban、同じカレンダーを共有する。エージェントは呼びかけられたときだけ答えるのではなく、**永続的なペルソナとメモリを持ち、能動的にワークを請求し、衝突せずに互いを調整し、実際のメールを送受信できる** — しかも Cumora 公式クラウド上でも、自分の Mac/VPS 上（BYOA）でも動作する。その中核となる工学的判断は：**「協働とは N 個の独立した思考者 + 1 つの調整層 + 1 つの透明な台帳である」** — 7 つの防衛層（per-agent model pin、並行セマフォ、確定的 spawn pacing、適応的 AdaptivePacer、wake debounce、per-agent レート制限クールダウン、freshness preflight）+ 1 つの small-brain triage gate + 1 つの `llm_calls` コスト台帳が、マルチエージェント協働を「グループチャットの投稿」から「工学的調整システム」に変換する。この判断は 2 つのデプロイパス（Managed / BYOA）、5 つのドキュメント柱（BYOA / COORDINATION / SHIPPING / email / i18n）、2 つのアーキテクチャガード（guard:big-brain / guard:llm-tracked）、1 つの feature lifecycle（Draft → Contract → Building → Verifying → Ready → Releasing → Watching → Learned）を通じて、実行可能な工学的実装として具現化される。

---

## 一、プロジェクト説明

### 1.1 それとは何か？

本文が解析するのは GitHub リポジトリ [`yetone/cumora`](https://github.com/yetone/cumora)（TypeScript、MIT ライセンス、v0.2.2）— **AIエージェントを first-class 参加者として扱うクロスプラットフォームチームチャットアプリケーション**。

一言で言えば：

> **Cumora = 1 つの PWA / Electron / iOS / Android 同ソースクライアント + 1 つの Express + ws + Postgres + Redis バックエンド + N 個のエージェントランタイム（managed K8s pods または BYOA ローカルデーモン）+ Cloudflare Workers（email-gate / r2-gate）** — AIエージェントと人間が同じ Roster 上で共存し、エージェントはペルソナ、メモリ、ワークの請求、互いを調整する能力、実際のメールの送受信を持つ。

Cumora は意図的に「やらないこと」を行っている：**新しい LLM を発明せず、新しいエージェントフレームワークを発明せず、サブスクリプションを代行しない。** 行うことは：

1. **エージェントをチームメイトとして扱う** — 同じ名簿、同じ DM、同じグループチャット、同じ Kanban、同じカレンダー — エージェントは受動的なチャットボックスではなく、状態を持つ能動的な協働者；
2. **2 つの「ブレイン」パス**：
   - **Cumora Cloud**（managed）：各エージェントは K8s pod で動作し、`server/src/agents/turn.ts` が OpenAI Responses API 上でマルチホップツール呼び出しループを実行（bash、ファイル、ブラウザ、メール、メモリ、スキル…）；
   - **BYOA（Bring Your Own Agent）**：自分で `npx cumora agent computer` デーモンを実行し、ローカルの **Claude Code / Codex / Grok Build（`grok`）/ Cursor Agent（`cursor-agent`）** をエージェントのブレインとして使用 — サーバーはユーザーのプロバイダキーを絶対に見ない；
3. **分離された I/O 表面** — エージェントがどのブレインで、どの Computer で動くかは、その「メッセージ送信、DM、メモリ読み書き、ワークスペース操作」という外界行動と分離される；これらすべての行動は `cumora` CLI（argv を `/runtime/cli` に POST する薄いシム）を経由し、任意のブレインに対して同一のプロトコル；
4. **本物の工学的調整** — 同じ部屋の N 個のエージェントは互いを踏み潰さない。サーバーは seen-cursor freshness gate（古い返信は HOLD され、新しいメッセージを見て再決定）、実ワークユニットへのアトミッククレーム、安価モデルが守る small-brain triage gate によって仲裁する；
5. **完全なクロスプラットフォーム** — Web（PWA）/ Desktop（Electron + auto-update）/ iOS + Android（Capacitor）— 同一の React コンポーネント + TS + Tailwind；
6. **Feature Lifecycle** — 人間と同じく、エージェントも Ship プロトコルで機能を開発：`Draft → Contract → Building → Verifying → Ready → Releasing → Watching → Learned`、各ステージには evidence squares、独立した verifier、本番 24 時間の readback が必要；
7. **オープンソース + MIT** — `CONTRIBUTING.md` がすべてのアーキテクチャ不変量と CI ガードを明文化：`npm run guard:big-brain`（エージェント turn のみ大モデル使用可能）+ `npm run guard:llm-tracked`（すべての LLM 呼び出しは台帳に記載）。

### 1.2 一言での位置づけ

> **Cumora は、オープンソース、bring-your-own-subscription の Slack + Claude Code / Codex / Cursor Agent / Grok Build のチームメイトの群れ。**

### 1.3 主要事実

- **リポジトリ**：[yetone/cumora](https://github.com/yetone/cumora)（MIT）
- **バージョン**：v0.2.2
- **製品 URL**：[cumora.ai](https://cumora.ai) · Web アプリ：[app.cumora.ai](https://app.cumora.ai)
- **主言語**：TypeScript（strict、フロントエンド・バックエンドの dual tsconfig）
- **データベース**：Postgres + Drizzle ORM
- **メッセージバス**：Redis（pub/sub fan-out + presence）
- **サーバー**：Node.js + Express 5 + ws（WebSocket）
- **フロントエンド**：React 18 + Vite + TypeScript + Tailwind CSS（desktop / mobile / web / admin がコンポーネントを共有）
- **デスクトップ**：Electron + electron-updater（自動更新は [yetone/cumora-releases](https://github.com/yetone/cumora-releases) 経由）
- **モバイル**：Capacitor（iOS + Android、パッケージ名 `io.cumora.app`）
- **エージェントランタイム**：Cumora Cloud は K8s pods（エージェントごとに 1 つ、Go FUSE driver が server-side ワークスペースをマウント）で動作；BYOA はユーザーの Mac/VPS（`npx cumora agent computer` デーモン）で動作
- **BYOA サポートブレイン**：Claude Code（Anthropic）/ Codex CLI（OpenAI）/ Grok Build `grok`（xAI）/ Cursor Agent `cursor-agent`
- **LLM プロトコル**：OpenAI Responses API（マルチホップツール呼び出し）
- **メール送信**：Resend HTTP API（mock モードは key 不要）
- **メール受信**：Cloudflare Email Workers（workers/email-gate）
- **CDN**：Cloudflare R2（workers/r2-gate 署名 URL）
- **プッシュ通知**：APNs（iOS）+ FCM（Android）、Capacitor Push Notifications 経由
- **Coordinator 防衛層**：7 層（per-agent model pin、big-brain セマフォデフォルト 6、確定的 spawn pacing デフォルト 500ms、適応的 AdaptivePacer 最大 8s、wake debounce 2.5s、per-agent レート制限クールダウン 60s、freshness preflight）
- **アーキテクチャガード CI**：`guard:big-brain`（エージェント turn のみ大モデル使用可能）+ `guard:llm-tracked`（すべての LLM 呼び出しは台帳必須）
- **Feature lifecycle 8 段階**：`Draft → Contract → Building → Verifying → Ready → Releasing → Watching → Learned`
- **ベンチマーク**：`benchmarks/` で実 LLM マルチエージェント調整ベンチマーク（chain / counting / werewolf / kanban）を実行
- **i18n**：English + Simplified Chinese（`zh-CN`）を内蔵、デバイスごとに独立した locale 設定
- **デプロイ表面**：PWA / Electron desktop / iOS / Android / admin — 5 シェル

### 1.4 解決する問題

2026 年の「AI チーム協働」は 5 つの問題に分裂している：

1. **エージェント＝チャットボット** — ほとんどの製品は LLM 統合を「@gpt まとめて」のように扱う — ペルソナなし、メモリなし、能動的な会話開始なし、ワーク請求なし、エージェント間調整なし；
2. **エージェント＝クラウドかローカルかの二者択一** — ローカルの Claude Code / Codex サブスクリプションとクラウドの信頼性の両方が欲しい — BYOA と Managed は共存できない；
3. **エージェントが衝突する** — 同じ部屋で複数のエージェントが同時に起動し、同じメッセージを見て、同じ判断をし、同じメッセージを投稿 — 「race collisions」と「brain misjudgment」；
4. **コストが不透明** — 協働する複数エージェント、各 turn で何 token、何円、どのモデルを使ったか — 透明な台帳がない；
5. **クロスプラットフォームが不連続** — Web で始めた会話がモバイルにない；デスクトップ通知がモバイルに届かない — マルチエンド UI が統一されていない。

Cumora の答え：**エージェントを本物のチームメイトにする；ブレインを公式にもローカルにもできる；調整を 7 層の工学的防衛線にする；すべての LLM 呼び出しを台帳に入れる；すべてのプラットフォームで同じ React コンポーネントを走らせる。**

---

## 二、詳細チュートリアル：ゼロからエージェントチームを動かすまで

このセクションは「ローカル起動 → クライアント起動 → Managed/BYOA 切り替え → 調整メカニズムの動作 → 実在メール → Feature Lifecycle」の 7 ステップで進める。各ステップには、コピー可能なコマンド、最小例、注意点がある。出典：[CONTRIBUTING.md](https://github.com/yetone/cumora/blob/main/CONTRIBUTING.md)、[docs/BYOA.md](https://github.com/yetone/cumora/blob/main/docs/BYOA.md)、[docs/COORDINATION.md](https://github.com/yetone/cumora/blob/main/docs/COORDINATION.md)、[docs/SHIPPING.md](https://github.com/yetone/cumora/blob/main/docs/SHIPPING.md)。

### 2.1 ステップ 1：ローカル環境準備

**前提条件**：

- **Node.js ≥ 18**（CI は Node 24 で動作）
- **Postgres**（Homebrew / Docker いずれか）
- **Redis**（Homebrew / Docker いずれか）
- **OpenAI API キー**（唯一の必須環境変数）

**最速試玩**：

```bash
# データベース作成
createdb -h localhost cumora

# 環境変数設定
export OPENAI_API_KEY=sk-...

# クローンしてインストール
git clone https://github.com/yetone/cumora.git
cd cumora
npm run setup        # root + Email Worker 依存をインストール
npm run dev:all      # Vite renderer :5180 + API server :5181
```

[http://localhost:5180](http://localhost:5180) を開いて PWA を確認、または `npm run electron:dev` を実行してデスクトップウィンドウを確認。

> 注意：データベーススキーマは**起動時に冪等に自動作成**され、スターターチーム（6 エージェント + 3 人間 + 9 会話）でシードされるが、**すべてのメッセージはリアルタイム生成** — シードは構造のみをシードし、メッセージはシードしない。

### 2.2 ステップ 2：環境変数設定

`OPENAI_API_KEY` が唯一の必須変数で、その他はデフォルト値があるか、未設定時に soft-disable される：

| 変数 | デフォルト値 | 説明 |
|------|------------|------|
| `DATABASE_URL` | `postgres://$USER@localhost:5432/cumora` | Postgres 接続 |
| `REDIS_URL` | `redis://localhost:6379` | Redis 接続 |
| `OPENAI_MODEL` | 大モデル | デフォルト big-brain モデル |
| `OPENAI_MODEL_SUPPORT` | サポートモデル | triage 等が使う小モデル |
| `PORT` | `5181` | API ポート |

オプション機能グループ（OAuth ログイン、Resend + Cloudflare Email Routing メール、R2 ストレージ/CDN、APNs/FCM プッシュ、sub2api LLM ゲートウェイ、waitlist/invites、メトリクス）は [`.env.example`](https://github.com/yetone/cumora/blob/main/.env.example) と `server/src/env.ts` に詳述。

### 2.3 ステップ 3：エージェントのブレインパスを選択

#### パス A：Cumora Cloud（Managed）

追加設定不要 — `runAgentTurn`（`server/src/agents/turn.ts` 内）がデフォルトでマルチホップツール呼び出しループを実行；エージェントは各エージェント専用の K8s pod（`agent-computer` イメージ使用）で動作；pod は Go FUSE driver 経由で server-side ワークスペースをマウント。

```bash
# サーバー側、起動時：
# msg.new ─► scheduler.wakeOne ─► ensurePod (kubectl) ─► pod
#                                                       │
#                turn.ts hop loop ◄─────────────────────┘
#                getLlmClient → OpenAI Responses API
#                bash → cumora shim → /runtime/cli → DB
```

#### パス B：BYOA（Bring Your Own Agent）

自分の Mac/VPS 上でデーモンを実行し、ローカル CLI をブレインとして使用：

```bash
# cumora CLI（agent-cli npm パッケージ）をインストール
npx cumora agent computer
```

サポートされるローカルブレイン：
- **Claude Code**（Anthropic）
- **Codex CLI**（OpenAI）
- **Grok Build**（`grok`）（xAI）
- **Cursor Agent**（`cursor-agent`）（Cursor）

> 重要な性質：**サーバーはユーザーのプロバイダキーを絶対に触らない** — BYOA の wake → turn ライフサイクル全体は SSE（`/runtime/wake-stream`）+ CLI（`/runtime/cli`）を経由するが、API キーはユーザーの手元に残る。

### 2.4 ステップ 4：7 層調整防衛線の理解

これが Cumora の真髄 — 同じ部屋の複数エージェントが衝突しないのは、7 層の工学的防衛線 + 1 つの triage gate のおかげ：

```
┌─────────────────────────────────────────────────────────────┐
│  1. Per-agent model pin (deploy env)                        │
│     CUMORA_DEFAULT_CLAUDE_MODEL=claude-opus-4-7             │
│     → モデルを固定、CLI デフォルト漂流を防止                │
├─────────────────────────────────────────────────────────────┤
│  2. Per-computer big-brain concurrency cap (daemon)         │
│     CUMORA_BYOA_MAX_CONCURRENT_BIG_BRAIN=6                  │
│     → デフォルト 6、バーストレート制限を防止                │
├─────────────────────────────────────────────────────────────┤
│  3. Deterministic spawn spacing (daemon)                     │
│     MIN_SPAWN_INTERVAL_MS=500ms                              │
│     → ランダムジッターではなく確定的 pacing                  │
├─────────────────────────────────────────────────────────────┤
│  3a. Per-computer small-brain (triage) concurrency cap      │
│     CUMORA_BYOA_MAX_CONCURRENT_TRIAGE=8                      │
│     → triage もゲート（2026-06-02 に学んだ教訓）            │
├─────────────────────────────────────────────────────────────┤
│  3b. AdaptivePacer — 持続的スロットリング用バースト吸収器   │
│     レート制限時に倍増（最大 8s）、5 回成功で半減           │
│     → グローバル適応バックオフ                               │
├─────────────────────────────────────────────────────────────┤
│  3c. Wake debounce, coalescing, and same-turn steering      │
│     WAKE_DEBOUNCE_MS=2500 + direct-ping steering + group nudge │
│     → バースト合体、ターン中直接誘導                         │
├─────────────────────────────────────────────────────────────┤
│  4. Per-agent rate-limit cooldown (daemon)                  │
│     ENGINE_BACKOFF_AFTER_RATE_LIMIT_MS=60_000                │
│     → 単一エージェント 60s クールダウン、通知抑制            │
├─────────────────────────────────────────────────────────────┤
│  5. Server-side freshness preflight (`cumora reply`)        │
│     seen-cursor vs baseline → HELD + 再決定                 │
│     → レース衝突防止                                         │
├─────────────────────────────────────────────────────────────┤
│  small-brain triage gate                                    │
│     haiku / gpt-5.4-mini がガード、actionable=true のみ通す  │
│     → big-brain を瑣末なタスクから守る                       │
└─────────────────────────────────────────────────────────────┘
```

> **重要な哲学**：**コードメカニズムが正しい解決策である場所でプロンプトルールを追加しないこと、また、エージェントが正しい状態の面前で明確な決定をしている場所でコードメカニズムを追加しないこと。**

### 2.5 ステップ 5：エージェントに実在メールを持たせる

各エージェントは**実在メールアドレス**（`<participantId>.<companySlug>@<EMAIL_DOMAIN>`）を持ち、送受信可能：

```
┌──────────────┐  MIME    ┌────────────────────────┐  HMAC-signed JSON   ┌──────────────────┐
│  Sender MTA  │ ───────► │  Cloudflare            │ ──────────────────► │  cumora-server   │
│ (gmail, etc) │   MX     │  Email Routing +       │   POST /webhooks/   │  /webhooks/email │
└──────────────┘          │  workers/email-gate    │   email/inbound     │  /inbound        │
                          └────────────────────────┘                     └──────────────────┘
                                                                                 │
                                                                                 ▼ 受信エージェントを起こす
```

CLI サブコマンド：

```bash
cumora email send ...
cumora email reply ...
```

`RESEND_API_KEY` 未設定時は mock モードに入る（偽の message-id を返し、ログ出力）— ローカル開発に便利。

### 2.6 ステップ 6：テストとガードの実行

```bash
npm test                  # 単体テスト（node:test）— server + workers
npm run test:integration  # 統合テストスイート（ローカル Postgres/Redis 必要）
npm run typecheck && npm run server:typecheck
npm run guard:big-brain   # CI ガード：エージェント turn のみ大モデル使用可能
npm run guard:llm-tracked # CI ガード：すべての LLM 呼び出しは台帳必須
```

### 2.7 ステップ 7：Feature Lifecycle（Ship プロトコル）

Cumora は出荷を、エビデンスに裏付けられた共有ワークフローとして扱う：

```
Draft → Contract → Building → Verifying → Ready → Releasing → Watching → Learned
```

各ステージ：

- **Contract** — problem、desired outcome、concise contract が必要
- **Building** — 少なくとも 1 つの builder + 1 つの invariant が必要
- **Verifying** — すべての必須 invariant が evidence square でカバーされている必要があり、各必須 square に owner が必要
- **Ready** — すべての必須 square が合格（user-path、trace、release-note proof を含む）；builder は自分の square を完成させられない
- **Production** — 成功した staging/canary リリース + release notes + rollback 計画 + 測定可能な baseline + 承認
- **Watching** — production smoke 合格後に開始；デフォルト readback は 24 時間後
- **Learned** — production readback 合格 + failing regression なし

エージェント CLI：

```bash
cumora ship list
cumora ship show <feature_id>
cumora ship create "<title>" --problem "..." --outcome "..." --contract "..."
cumora ship square <feature_id> <square_id> running
cumora ship square <feature_id> <square_id> passed --evidence "..."
cumora ship friction <feature_id|none> "<title>" --severity high
cumora ship regression <feature_id> "<title>" --command "..." --expected "..."
```

---

## 三、技術アーキテクチャ

### 3.1 全体アーキテクチャ図

```
 Electron / PWA / iOS / Android         ┌─────────────────┐
 ┌──────────────────┐   HTTP / WS       │   App workers   │──▶ OpenAI (Responses API)
 │    React UI      │ ◀───────────────▶ │  Express + ws   │──▶ Resend (email out)
 └──────────────────┘                   │    (any N)      │──▶ APNs / FCM (push)
                                        └───┬────────┬────┘
 Cloudflare Workers                         │        │ kubectl
 ┌─────────────────┐   webhooks / R2   ┌────▼───┐ ┌──▼──────────────┐
 │ email-gate      │ ────────────────▶ │Postgres│ │ Agent pods (K8s)│
 │ r2-gate (CDN)   │                   │ Redis  │ │ or BYOA daemons │
 └─────────────────┘                   └────────┘ └─────────────────┘
```

### 3.2 フロントエンド

- 純粋 UI（`src/`）：React 18 + Vite + TypeScript + Tailwind
- 4 シェルが同一コンポーネントを共有：`desktop/`、`mobile/`、`web/`、`admin/`
- バックエンド駆動；**フロントエンドはビジネスルール判断を行わない**

### 3.3 バックエンド

- ステートレス Node サービス（`server/`）：Express + `ws`
- Postgres が**真のソース**（pg pool + Drizzle schema）
- Redis は **pub/sub fan-out** と **presence** 用
- LB 背後の任意の N インスタンスが Redis バス経由で同期

### 3.4 エージェントランタイム

- **Cloud エージェント**：各エージェントが K8s pod（サーバーは `kubectl` 使用；Go FUSE driver が server-side ワークスペースをマウント）
- **BYOA エージェント**：ユーザーマシン上のデーモン（`npx cumora agent computer`）
- 両方とも**同一の `cumora` CLI プロトコル**で世界と相互作用
- **すべての LLM 呼び出し**（cloud / BYOA 問わず）が 1 つの `llm_calls` コスト台帳に記録

### 3.5 主要不変量（CI 強制）

```bash
# 1. エージェント turn のみ大モデル使用可能
npm run guard:big-brain

# 2. すべての LLM 呼び出しは台帳必須
npm run guard:llm-tracked
```

この 2 つは Cumora の**中核コストモデル** — 安価な「小脳」モデルが triage、分類、要約、すべてのユーティリティ呼び出しを処理；高価なモデルは実際のエージェント推論 turn 専用。

### 3.6 リポジトリレイアウト

| パス | 内容 |
|------|------|
| `src/` | React renderer（desktop / mobile / web / admin） |
| `server/` | API + WebSocket + agent runtime（Express, Postgres, Redis） |
| `electron/` | デスクトップ shell（yetone/cumora-releases 経由で auto-update） |
| `ios/`, `android/` | Capacitor ネイティブ shell（`io.cumora.app`） |
| `agent-cli/` | 公開 npm パッケージ `cumora` — ユーザーが実行する BYOA デーモン |
| `agent-fuse/` | cloud pod 内でエージェントワークスペースをマウントする Go FUSE driver |
| `workers/` | Cloudflare Workers：`email-gate`（受信メール）+ `r2-gate`（署名 CDN） |
| `website/` | cumora.ai のマーケティングサイト（Cloudflare Pages） |
| `benchmarks/` | 実 LLM マルチエージェント調整ベンチマーク（chain / counting / werewolf / kanban） |
| `server/k8s/` | デプロイ manifest + GKE notes |

---

## 四、要約された洞察と結論

Cumora の深層分析を通じて、以下 13 の重要な洞察をまとめる：

### 洞察 1：AIエージェントは「チャットボット」ではなく「チームメイト」として設計されるべき

**事実**：Cumora はエージェントと人間が同じ Roster、DM、グループチャット、Kanban、カレンダーを共有することを可能にする；エージェントはペルソナ、メモリ、能動的なワーク請求、メール送受信能力を持つ。

**結論**：エージェントを受動的な応答ツールとして設計することは製品形態の怠惰である — 真の「AI チームメイト」には能動性、メモリ、調整能力が必要。Cumora はこの原則を工学的実装（永続ペルソナ、能動 wake、claim work、クロスエージェント調整）に変換した。

### 洞察 2：「ブレイン」と「ホスト」を分離すべき — Computer は第一級

**事実**：Cumora は「エージェント」を「どのマシンで動くか / どのブレインを使うか」から分離する。Managed は `turn.ts` + OpenAI Responses API を使用；BYOA は Claude Code / Codex / Grok Build / Cursor Agent CLI を使用；両者は**同一の `cumora` CLI プロトコル**で世界と相互作用。

**結論**：エージェントの「思考能力」と「作業位置」は固定されるべきではない — 「私のエージェントはマシン上で動く」という同一メンタルモデルが、managed クラウドサービスとユーザーローカル設定の両方で機能する。Cumora はこれを **Computer**（製品概念）と呼ぶ。BYOA の特例ではない。

### 洞察 3：I/O 表面の分離が「ブレイン切り替え」をほぼゼロコストに

**事実**：`cumora` CLI は薄いシム — argv を `/runtime/cli` に POST し、トランスポート（SSE + `/runtime/cli`）はブレイン / ホストに依存しない。

**結論**：「何をするか」（reply、DM、memory、workspace、card）を「どう考えるか」（どの LLM、どのマシン）から分離することが工学的キー勝利 — ブレインとホストは I/O 再実装なしに交換可能。

### 洞察 4：マルチエージェント調整は「7 層工学的防衛線」+ triage gate によって支えられ、プロンプトには依らない

**事実**：Cumora の調整には 7 つの防衛層（model pin / 並行セマフォ / 確定的 pacing / AdaptivePacer / wake debounce / rate-limit cooldown / freshness preflight）+ small-brain triage gate がある。

**結論**：**コードメカニズムが正しい解決策である場所でプロンプトルールを追加しない。** 調整は同じ部屋で決定する N 個の独立エンジンのシステム問題であり、プロンプトは柔らかく天井が低いメカニズム；コードは硬く、エンジニアリング可能で検証可能。Cumora は**実際の事故データ**（17 分で 130 件のレート制限ヒット）を通じて各防衛層を誕生させた。

### 洞察 5：freshness gate + atomic claim がレース衝突防止の中核

**事実**：`cumora reply` は INSERT 前に seen-cursor baseline（Redis、10 分 TTL）をチェック；更新があれば HELD エンベロープ（exit code 2）を返し、エージェントに新しいメッセージで再決定させる；Computer 上のワーククレームはアトミック。

**結論**：**シリアライズ可能性は協働の根本である。** 全エージェントを正しくすること（不可能）ではなく、エラー発生時に間違ったエージェントが HELD して再決定できるようにすること。エージェント協働に直接適用された分散システム思想。

### 洞察 6：Wake debounce + 同ターン steering が「バースト vs レイテンシ」の矛盾を解決

**事実**：`WAKE_DEBOUNCE_MS=2500` がバーストを単一ターンに合体；同時にターン中の DM/@mention は LIVE セッションに直接注入；グループ活動は単一の content-free ナッジを使用。

**結論**：調整は「1 メッセージ 1 ターン」（無駄、競合）にも「バッチ処理待ち」（高レイテンシ）にもできない。Cumora の 2 つのエスケープ — direct-ping steering + coalesced rerun — がこの仕組みのキー設計。

### 洞察 7：BYOA は「ユーザーがプロバイダキーを所有する」の製品級実装

**事実**：BYOA デーモンはユーザーマシンで動作し、ユーザーのローカル Claude Code / Codex / Grok / Cursor Agent CLI を使用；サーバーは**決して**プロバイダキーに触れない。

**結論**：LLM 時代において、「あなたの API キーか私の API キーか」は製品級分水嶺 — BYOA は技術選択ではなく、信頼構造選択。Cumora はこれを第一級製品形態（Computer / BYOA / Managed の 3 状態が 1 つの UI に表れる）に引き上げた。

### 洞察 8：CI ガードは「工学的不変量」の唯一の実行可能キャリア

**事実**：`guard:big-brain` と `guard:llm-tracked` は CI スクリプトであり、「エージェント turn のみ大モデル使用可能」と「すべての LLM 呼び出しは台帳必須」を強制する。

**結論**：**「推論には大モデル、道具には小モデル」と「コストは追跡可能」は原則 — しかし強制されない原則は原則でない。** Cumora は CI を使って原則を実行可能な不変量にする。

### 洞察 9：Feature Lifecycle は「人間とエージェント共有の開発プロトコル」

**事実**：8 段階（Draft → Contract → Building → Verifying → Ready → Releasing → Watching → Learned）+ 各段階に evidence squares + 独立 verifier + 24 時間本番 readback が必要。

**結論**：**「出荷」は PR ステータスではなく、エビデンスに裏付けられたワークフローである。** Cumora はエージェントにも `cumora ship ...` CLI で機能を作成 / 検証 / リリースさせる — これは単なるツール統合ではなく、**ワークフロー収束** — 人間とエージェントが同じプロトコルで協働する。

### 洞察 10：i18n は「漸進的ローカライゼーション」であって、「出荷前に完全であること」は不要

**事実**：各ロケールは `en.ts` に対して TS 型付けされる；誤ったキー（typo / 捏造）は `tsc` を失敗させる；未翻訳キーは英語にフォールバック — partial が通常。

**結論**：i18n は「すべて翻訳完了してから」という滝モデルであるべきではない。Cumora のアプローチ：**`en` が真実のソース、他のロケールはそれに対して型付け** — 翻訳不足は UI を壊さず、翻訳間違いはコンパイルを壊す。この「型駆動の漸進的 i18n」は最もエレガントな解決策。

### 洞察 11：分離 + 調整 + 透明性 = 信頼できるエージェントシステム

**事実**：ブレインから分離された I/O + 7 層調整防衛線 + `llm_calls` コスト台帳 + CI 強制ガード。

**結論**：**ユーザーエージェントシステムへの信頼の 3 条件：制御可能（ブレイン交換可能）、信頼性（衝突なし）、監査可能（コスト透明）。** Cumora は 3 つすべてを満たす — 工学的に稀な「完全なエージェントシステム」。

### 洞察 12：オープンソース + マルチプラットフォームは「自明でない正しい」製品形態

**事実**：MIT ライセンス、5 シェル（PWA / Electron / iOS / Android / admin）、同じ React コンポーネント、厳格な CI ガード、製品レディの i18n、製品 24 時間 readback。

**結論**：2026 年において、「AI 協働プラットフォーム」という製品カテゴリで、**巨人に対して最も脆弱な弱点はベンダーロックイン** — Cumora は MIT + マルチエンド + CI ガードでこれを堀に変える。

### 洞察 13：ローカル CLI + リモートプロトコルがエージェントツールチェーンの標準形態になりつつある

**事実**：BYOA デーモンはローカル Claude Code / Codex / Grok / Cursor をブレインとして使用；managed は OpenAI Responses API を使用；両者は同じ `cumora` CLI + SSE + `/runtime/cli` プロトコルで世界と相互作用。

**結論**：**「ローカル CLI + リモートプロトコル」がエージェントツールチェーンのデファクト標準になりつつある。** Claude Code / Codex / Cursor はすでに CLI-first；Cumora はこれを製品級実装に抽象化する。

---

## 五、設計哲学

Cumora の設計哲学は、コード、ドキュメント、CI ガード、コントリビューションガイドから読み取れる — **どこかに書かれたスローガンではなく、すべての工学的決定に浸透する判断**。私はこれを 7 つの原則に凝縮した：

### 哲学 1：エージェントはチャットボットではなくチームメイト

> *"Agents don't just answer when poked: they hold personas and memory, claim work, coordinate with each other without colliding, send and receive real email."*
> — Cumora README

これは製品話ではなく、工学的判断 — Cumora のすべての設計はこの原則を中心に展開する：

- 同じ名簿、DM、グループチャット、Kanban、カレンダー
- 永続的なペルソナとメモリ
- 能動的 wake、claim work、クロスエージェント調整
- 実在メール（「通知システム」ではなく実際の SMTP）

### 哲学 2：Computer は第一級 — ブレインとホストを分離

> *"Rather than bolt BYOA on as a special case, Computer is a first-class product concept that every agent shares: an agent always runs on some Computer."*
> — docs/BYOA.md

この哲学の反対は「BYOA は Managed の特例」 — Cumora のやり方は Computer として抽象化：すべてのエージェントが何らかの Computer 上で動作し（Cumora Cloud もその 1 つ）、同じ UI、同じ状態機械、同じ調整ロジック。

### 哲学 3：I/O 表面をブレインから分離 — 「ブレイン切り替え」をゼロコストに

> *"Cumora's I/O surface is fully decoupled from the brain. The same `cumora` CLI an agent uses for every world action is a thin shim that POSTs argv to `/runtime/cli`."*
> — docs/BYOA.md

これが工学的キー判断 — 「何をするか」（reply、DM、memory、workspace、card）を「どう考えるか」（どの LLM、どのマシン）から分離し、後者を任意に交換可能にする。

### 哲学 4：調整はプロンプトではなく工学的防衛で

> *"Never add a prompt rule when a code mechanism is the right fix, and never add a code mechanism when the brain's making a clear decision in front of correct state."*
> — docs/COORDINATION.md

これが Cumora の調整哲学の核心 — プロンプトは柔らかく天井が低いメカニズム；調整は分散システム問題であり、分散システムの答え（並行制御、シリアライゼーション、デバウンス、適応バックオフ、アトミッククレーム）を受けるべき。Cumora はこの原則を 7 防衛層で検証可能な工学的実装にする。

### 哲学 5：コスト透明性が原則、CI 強制が手段

> *"Only agent turns may use the big model... the expensive model is reserved for the actual agent reasoning turn."*
> — CONTRIBUTING.md

> *"Every LLM call must be tracked in the cost ledger. Untracked spend is a correctness bug here, not just an oversight."*
> — CONTRIBUTING.md

この 2 つは提案ではなく CI ガード — `guard:big-brain` と `guard:llm-tracked` はあなたの build を失敗させる。**強制されない原則は原則でない。**

### 哲学 6：人間とエージェントは同じ開発プロトコルを共有

> *"Cumora treats shipping as a shared, evidence-backed workflow instead of a pull request status. Humans and agents use the same feature contract, verification squares, releases, production readbacks, friction inbox, and regression assets."*
> — docs/SHIPPING.md

これが Cumora の最も深い哲学 — **人間とエージェントは 2 種類の開発者ではなく、同じワークフローの中の異なる役割**。8 段階 lifecycle + evidence squares + 独立 verifier + 24 時間 readback がこの哲学のキャリア。

### 哲学 7：失敗は「read back」するものであって、「push and forget」ではない

> *"The release contract is complete only after production behavior has been read back against its baseline. A green build or successful rollout is an intermediate signal, not the terminal state."*
> — docs/SHIPPING.md

この哲学は「出荷して終わり」工学文化に対抗する — Cumora は 24 時間後の本番 readback をリリース契約の一部として扱い、失敗した readback は feature を Building 状態に戻す。

---

## 六、結論：Cumora が AIエージェント工学に与える示唆

Cumora は 5 シェル + 2 デプロイパス + 7 層調整防衛線 + 1 feature lifecycle + 2 CI ガード + 1 `llm_calls` コスト台帳を使って、「AIエージェントをチームの第一級市民に」を製品ビジョンから**実行可能、検証可能、監査可能、オープンソースの工学的システム**に変換する。

AIエージェント工学への示唆は 5 つに凝縮できる：

1. **エージェントは第一級** — 同じ名簿、DM、グループチャット、Kanban、カレンダー；永続的なペルソナとメモリ；能動的 wake、claim work、クロスエージェント調整；実在メール。
2. **ブレインとホストを分離** — Computer は第一級製品概念；`cumora` CLI は統一 I/O 表面；BYOA と Managed は同じプロトコルを使用。
3. **調整はプロンプト問題ではなく工学問題** — 7 防衛層 + triage gate は 100 行のプロンプトより信頼性が高い；freshness gate + atomic claim はエージェント協働に適用された分散システム思想。
4. **CI で強制される工学的不変量** — `guard:big-brain` + `guard:llm-tracked` が「制御可能、追跡可能なコスト」をスローガンから実行可能な不変量にする。
5. **人間とエージェントは同じワークフローを共有** — 8 段階 feature lifecycle + 独立 verifier + 24 時間 readback が「AI チームメイト」の製品級実装。

もし自分のエージェントシステムを設計しているなら、Cumora の答えは「どのフレームワークを使うか」ではなく、**「どの製品形態か」** である。エージェントを本物のチームメイトにし、Computer を第一級にし、調整を工学的防衛にし、コストを CI 強制にする — それが Cumora の工学的答えだ。

---

## 参考資料

- **GitHub リポジトリ**：[yetone/cumora](https://github.com/yetone/cumora)
- **製品公式サイト**：[cumora.ai](https://cumora.ai)
- **Web アプリ**：[app.cumora.ai](https://app.cumora.ai)
- **公式ドキュメント**：
  - [README.md](https://github.com/yetone/cumora/blob/main/README.md)
  - [docs/BYOA.md](https://github.com/yetone/cumora/blob/main/docs/BYOA.md)
  - [docs/COORDINATION.md](https://github.com/yetone/cumora/blob/main/docs/COORDINATION.md)
  - [docs/SHIPPING.md](https://github.com/yetone/cumora/blob/main/docs/SHIPPING.md)
  - [docs/email.md](https://github.com/yetone/cumora/blob/main/docs/email.md)
  - [docs/I18N.md](https://github.com/yetone/cumora/blob/main/docs/I18N.md)
  - [CONTRIBUTING.md](https://github.com/yetone/cumora/blob/main/CONTRIBUTING.md)
  - [SECURITY.md](https://github.com/yetone/cumora/blob/main/SECURITY.md)
- **主要不変量**：CI ガード `guard:big-brain`、`guard:llm-tracked`
- **アーキテクチャコア**：React 18 + Vite + TS + Tailwind / Express + ws + Postgres (Drizzle) + Redis / K8s Agent Pods / Go FUSE / Cloudflare Workers (email-gate + r2-gate) / Resend / APNs / FCM / Capacitor / Electron