---
title: "Aera Browser 徹底分析：ブラウザの中の自動従業員 — $20/月で雑務を売る方法"
description: "Aera Browser は 2025 年 12 月にローンチしたローカルファーストな Chromium 自動ブラウザ。自然言語で雑務を記述し、ログイン済みの実ブラウザで定時実行する。Stripe 検証 MRR $343 / 9 契約 / ~1700 ユーザー。本レポートは収益化、料金体系、設計思想、ユーザーごとの月次価値を分解する。"
date: "2026-08-26"
author: "ERIC"
tags: ["AIプロダクト", "ブラウザ自動化", "MCP", "マネタイズ", "SaaS", "Aera Browser", "Chromium", "ローカルファースト"]
categories: ["AIプロダクト分析"]
keywords: ["Aera Browser", "getaera.app", "ブラウザ自動化", "MCP", "Chromium", "TrustMRR", "サブスクリプション"]
product:
  name: "Aera Browser"
  url: "https://trustmrr.com/startup/aera-browser?ref=eric-kwok-b654e8"
  category: "AIブラウザ自動化ツール"
  launch_date: "2025-12"
  revenue: "$343 MRR（2026-08、Stripe 検証）· 累計 $3,635"
  users: "~1,700 ユーザー · 9 有料契約"
  pricing_model: "Free（セルフホスト）+ Pro $20/月 + Ultra $200/月"
  logo: "https://files.stripe.com/links/MDB8YWNjdF8xU2ZScTlMaGhtZ1p0d1NofGZsX2xpdmVfSFRRMUwxYVFBOEtkRjBZT0c0czRCd3FN00eG4pLTYa"
pricing:
  - plan: "Free"
    price: 0
    currency: "USD"
    period: null
  - plan: "Pro"
    price: 20
    currency: "USD"
    period: "month"
  - plan: "Ultra"
    price: 200
    currency: "USD"
    period: "month"
metrics:
  - name: "MRR"
    value: "$343（2026-08）"
  - name: "直近 30 日収益"
    value: "$140"
  - name: "累計収益"
    value: "$3,635"
  - name: "有効契約数"
    value: "9"
  - name: "総ユーザー数"
    value: "~1,700"
  - name: "有料転換率"
    value: "~0.5%（9/1700 推定）"
  - name: "混合 ARPU"
    value: "~$38/月"
  - name: "Domain Rating"
    value: "9/100"
  - name: "TrustMRR 順位"
    value: "#2108"
  - name: "設立"
    value: "2025-12"
  - name: "創業者"
    value: "Andrew Rivers（米国）"
  - name: "技術スタック"
    value: "Chromium + Node.js + PostgreSQL + Stripe + OpenRouter"
sources:
  - label: "TrustMRR 公開アーカイブ（ref 付き）"
    url: "https://trustmrr.com/startup/aera-browser?ref=eric-kwok-b654e8"
  - label: "TrustMRR AI-readable Markdown"
    url: "https://trustmrr.com/startup/aera-browser.md"
  - label: "Aera 公式サイト"
    url: "https://getaera.app"
  - label: "Aera 料金ページ"
    url: "https://getaera.app/pricing"
  - label: "Aera 機能ページ"
    url: "https://getaera.app/features"
  - label: "Aera ユースケース"
    url: "https://getaera.app/use-cases"
  - label: "Aera セキュリティ"
    url: "https://getaera.app/security"
  - label: "Aera FAQ"
    url: "https://getaera.app/faq"
---

> **製品リンク**：[https://trustmrr.com/startup/aera-browser?ref=eric-kwok-b654e8](https://trustmrr.com/startup/aera-browser?ref=eric-kwok-b654e8)（紹介トラッキング付き — 末尾にも掲載）

# Aera Browser 徹底分析：ブラウザの中の自動従業員 — $20/月で雑務を売る方法

## 1. はじめに：ブラウザは最後の堀

AI 自動化は混雑している：ChatGPT Scheduled Tasks、Claude Computer Use、BrowserBase ヘッドレス。2025 年 12 月ローンチの **Aera Browser** は最も愚直で正しい道を選んだ — **クラウドヘッドレスでもプラグインでもなく、定時で働く Chromium ブラウザそのもの**。

> **Aera is a browser that executes.** 雑務を自然言語で記述すると、ログイン済みの実ブラウザで定時に実行される：ページを読む、数値を抜く、フォームを埋める、要約を届ける。朝起きれば仕事は終わっている。

2026-08-26 TrustMRR スナップショット：**MRR $343、9 契約、~1,700 ユーザー、累計 $3,635、Domain Rating 9**。小さい数字だがサンプルは純粋：米国インディー、Stripe 検証、Chromium、MCP、ローカルファースト。教科書的な初期マイクロ SaaS。

---

## 2. プロジェクト概要

**Aera = 実ブラウザ Chromium + 自然言語スケジューラ + MCP コネクタ + ローカルファースト保存**。タグライン *The browser that does the work.* 対象：Developers, AI enthusiasts, workflow power-users。

### 主要機能

| 機能 | 説明 |
|---|---|
| **自然言語自動化** | 指示を書けば Agent が実ページをクリック・入力・遷移 |
| **スケジューリング** | 任意リクエストを定時ワークフロー化、履歴と通知付き |
| **MCP 連携** | Cursor / Claude Desktop / Gemini CLI に接続 |
| **サブエージェント並列** | 複雑な多段階タスクを並列実行 |
| **Vision** | 有料層で複雑な視覚ページを理解 |
| **Chrome 拡張インポート** | パスワードマネージャー等をワンクリック移行 |
| **ローカルファースト** | 履歴・ブックマーク・設定は端末に保存 |

### 得意・不得意

- **得意**：読む、変化を監視、ダッシュボードから数値を抜く、受信箱トリアージ、通常フォームの定時反復。
- **不得意**：リッチテキスト/コードエディタ — テストで内容を破損したため非推奨。
- **自律決済なし** — 意図的に実装していない。

---

## 3. 設計思想：5 原則

**1. ローカルファーストだが推論は外部** — データは端末に残るが、推論は OpenRouter 経由で外部へ。Free は Ollama で真にオフライン。

**2. あなたのブラウザ、ボットファームではない** — 実 Profile で動作、ヘッドレス指紋なし、BAN リスク低。

**3. 一文 > セレクタ束** — 毎回ページを意味的に再読込、リデザインに強い。代償は非決定性。

**4. スケジューリングが第一級** — Describe → Schedule → History → Notify。

**5. オープン標準、ロックインなし** — Chromium + MCP + OpenAI 互換。Free はセルフホスト強制でアップグレードを促す。

---

## 4. 詳細チュートリアル：7 ステップで最初の自動従業員を

### Step 0 — 準備

Chrome が動く OS、4GB 以上。Free は Ollama を先にインストール。

### Step 1 — ダウンロードとインポート

`getaera.app/download` → Import from Chrome → アカウント登録。

### Step 2 — モデル設定

- Free: Settings → Models → `http://localhost:11434`
- Pro/Ultra: ホスト済みモデルを選択

### Step 3 — 最初のタスクを 60 秒で

サイドバーで「毎朝 9 時に Stripe の昨日収益をシートへ」→ Run → 定期実行化。

### Step 4 — スケジュール化

頻度・通知・リトライを設定、Run History でログ確認。

### Step 5 — MCP 接続

MCP Server を有効化 → Cursor 等に Aera を追加 → IDE からブラウザ自動化を起動。

### Step 6 — スキルマーケット

コミュニティ Skill をインストール、または自作 Skill を公開。

### Step 7 — 運用

失敗時は即停止、ログを読む、機密ページはローカルモデル、数日ごとに自動更新。

---

## 5. マネタイズ分解

| プラン | 価格 | 年払い | 売るもの | 意図 |
|---|---|---|---|---|
| **Free** | $0 | — | セルフホストモデル | 獲得ファネル |
| **Pro** | $20/月 | $220/年 | ホスト済み最先端 + Vision + 並列 | 主力 |
| **Ultra** | $200/月 | $2200/年 | Pro + 11 倍上限 | ホエール層 |

**再現可能な 5 手**：セルフホストで誘導、$20+$200 階層、従量課金、ブラウザ無料・知能有料、MCP エコシステムの将来手数料。

---

## 6. コアユーザー分析：ユーザー 1 人あたり月いくら？

| 区分 | 人数 | 月額/人 | 合計 | 寄与 |
|---|---|---|---|---|
| **Free** | ~1691 | $0 | $0 | 0% |
| **Pro $20** | 8 | $20 | ~$160 | ~47% |
| **Ultra $200** | 1 | $200 | ~$183 | **~53%** |

**推定根拠**：$343/9 = ARPU $38。8 Pro + 1 Ultra ≈ $360 で実績に近い。全員 Pro なら $180 にしかならず、**少なくとも 1 ホエール**がいる。

**LTV（24 ヶ月）**：Pro $480 / Ultra $4,800。転換率 0.5% がボトルネック — 2% で MRR $1,360（4 倍）。

---

## 7. 洞察 7 選

1. ブラウザが最後の堀 2. サブスクはブラウザではなくモデルを売る 3. 正直さが GTM 4. 0.5% は機会と警鐘 5. MCP は成長レバー 6. Ultra $200 はフィルター 7. $15M は感情価格

---

## 8. 再現可能な 6 教訓

1. ブラウザ無料・知能有料 2. Free はセルフホスト必須 3. $20 アンカー + $200 ホエール 4. 最初のタスクは 60 秒で成功 5. ログがプロダクト 6. MCP を広告より先に

---

## 9. リスク

転換停滞、モデルコスト変動、非決定性、コンプライアンス空白、単独創業者リスク、巨頭の圧迫。

---

## 10. 結論

Aera は初期だが論理がクリーンなサンプル：Chromium 1 + スケジューラ 1 + 3 料金 + $343 MRR。真似すべきは **コンテナ無料・知能有料、ログ監査可能、スケジューリング第一級**。

---

> **製品リンク**：[https://trustmrr.com/startup/aera-browser?ref=eric-kwok-b654e8](https://trustmrr.com/startup/aera-browser?ref=eric-kwok-b654e8)
>
> 出典：TrustMRR（Stripe 検証）+ getaera.app。推定は明記。

*2026-08-26 スナップショット。分析は筆者見解。*
