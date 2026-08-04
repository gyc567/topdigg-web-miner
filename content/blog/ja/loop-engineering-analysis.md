---
title: "Loop Engineering まとめ：プロンプティングをやめ、AI エージェントを自律稼働させるループを設計せよ"
description: "Loop Engineering——Cobus Greyling が提唱する AI エージェント ループエンジニアリング フレームワークの完全解析。核心思想：もう AI にプロンプトする必要はない。AI に自動でプロンプトするシステムを設計すべきだ。5 つのビルドブロック（自動化/スケジュール、ワークツリー、スキル、プラグイン/コネクタ、サブエージェント）+ メモリ/ステート、7 つの本番パターン（デイリートリエージュ、PR ベビーシッター、CI スイーパー、依存関係スイーパー、チェンジログドラフター、マージ後クリーンアップ、Issue トリエージュ）、L1 レポートから L2 補助修正から L3 無人運用への段階的自律、そしてフルツールエコシステム。核心思想、設計哲学、フルチュートリアル、機能一覧を網羅。"
date: "2026-08-04"
author: "TopDigg Research Team"
tags: ["Loop Engineering", "AI Agent", "Automation", "Grok", "Claude Code", "Codex", "MCP", "DevTools", "Prompt Engineering"]
categories: ["Deep Dive"]
keywords: ["Loop Engineering", "AI エージェント", "ループエンジニアリング", "自動化", "Grok", "Claude Code", "Codex", "MCP", "スキル", "ワークツリー", "トリエージュ", "自律性"]
---

# Loop Engineering まとめ：プロンプティングをやめ、AI エージェントを自律稼働させるループを設計せよ

> 核心思想：**もう AI にプロンプトする必要はない。AI に自動でプロンプトするシステムを設計すべきだ。** Peter Steinberger：「コーディングエージェントにもうプロンプトすべきではない。エージェントにプロンプトするループをエンジニアリングすべきだ。」Boris Cherny（Anthropic Claude Code 負責者）：「もう Claude にプロンプトしない。ループが回って Claude にプロンプトし、何をすべきかを判断している。僕の仕事はループを書くことだ。」Loop Engineering は Cobus Greyling が提唱する AI エージェント ループエンジニアリング フレームワーク——核心は**5 つのビルドブロック**（自動化/スケジュール、ワークツリー、スキル、プラグイン/コネクタ、サブエージェント）+ **メモリ/ステート**、7 つの本番パターンと L1 から L3 への段階的自律を組み合わせ、AI エージェントを「人間がプロンプトが必要」から「自律稼働するシステム」に変換する。

---

## 1. プロジェクト概要

### 1.1 これは何か？

**Loop Engineering** は**AI エージェント ループエンジニアリング フレームワーク**——より良いプロンプトの書き方ではなく、AI エージェントを自律稼働させるシステムの設計方法を教你に教える。コアポジショニング：**「プロンプトエンジニアリング」から「ループエンジニアリング」へのパラダイムシフト**。

### 1.2 主要データ

- リポジトリ：`https://github.com/cobusgreyling/loop-engineering`
- 公式サイト：`https://cobusgreyling.github.io/loop-engineering/`
- Stars：**9,838**
- Forks：**1,335**
- License：**MIT**
- 言語：**JavaScript**
- 著者：**Cobus Greyling**
- 作成日：2026-06-09
- エコシステム：memory-engineering → loop-engineering → harness-foundry → outerloop → fleet-engineering

### 1.3 何を解決するか？

従来の AI ヘルパ開発の痛点：毎回プロンプトを手書きし、AI が前回何をしたかを覚えていない、品質フィードバックループがなく、AI にコードを自律的に変更させるのが安全でない。Loop Engineering の答え：**ループシステムを設計する**——cadence、トリエージュロジック、ステート永続化、分離実行、検証ゲートを定義し、AI エージェントが設計したループに沿って自律稼働する。

---

## 2. 核心思想

### 2.1 「プロンプトエンジニアリング」から「ループエンジニアリング」へ

従来：人間がプロンプト → AI が実行 → 人間が確認 → 人間が再びプロンプト。Loop Engineering：人間がループを設計 → ループが自動でプロンプト → AI が自律実行 → ループが自動検証 → ループが自動記録。**人間は「プロンプター」から「システムデザイナー」に変化する。**

### 2.2 5 つのビルドブロック + メモリ

- **自動化/スケジュール**：cadence に沿って発見・トリエージュ
- **ワークツリー**：安全な並列実行
- **スキル**：永続的なプロジェクト知識
- **プラグイン/コネクタ**：実際のツール（MCP）に接続
- **サブエージェント**：メーカー/チェッカー分離
- **+ メモリ/ステート**：対話を超える永続的な脊柱

### 2.3 7 つの本番パターン

- **Daily Triage**：1日-2時間 cadence、L1 レポートのみ、低 token コスト
- **PR Babysitter**：5-15分 cadence、L1 監視、高 token コスト
- **CI Sweeper**：5-15分 cadence、L2 謹慎修正、極高 token コスト
- **Dependency Sweeper**：6時間-1日 cadence、L2 パッチのみ、中 token コスト
- **Changelog Drafter**：1日またはタグ cadence、L1 草稿、低 token コスト
- **Post-Merge Cleanup**：1日-6時間 cadence、L1 オフピーク、低 token コスト
- **Issue Triage**：2時間-1日 cadence、L1 提案のみ、低 token コスト

### 2.4 段階的自律：L1 → L2 → L3

- **L1 レポートのみ**：AI は発見のみを報告し、自動修正しない（最初の1週間ルール）
- **L2 補助修正**：AI が分離されたワークツリーで修正を試み、チェッカーの確認が必要
- **L3 無人運用**：AI が自律修正し、自動マージする。予算とゲーティングが必要

---

## 3. 設計哲学

### 3.1 「システムを設計し、プロンプトを書くな」

Boris Cherny：「僕の仕事はループを書くことだ。」AI エンジニアの価値はより良いプロンプトを書くことではなく、より良い制御システムを設計すること。ループは再利用可能、バージョン管理可能、監査可能——プロンプトは使い捨てだ。

### 3.2 「最初の1週間は報告のみ、修正するな」

新システムの最初の1週間、AI は発見の報告のみ、自動修正は不可。これにより人間はループの動作を理解し、信頼を構築し、段階的に権限を緩める時間を得る。

### 3.3 「メモリは対話を超える脊柱だ」

メモリのない AI エージェントは毎回の会話でゼロから始まる。Loop Engineering は STATE.md、loop-budget.md 等のファイルを通じて、AI エージェントにセッションをまたぐ永続的なメモリを与える。

### 3.4 「検証は生成よりも重要だ」

すべてのループにはチェッカーサブエージェントがいる——メーカーの出力を信頼せず、独立して検証する。このメーカー/チェッカー分離は安全な自律の基盤だ。

### 3.5 「段階的信頼」

L1 → L2 → L3 は技術的アップグレードではなく、信頼のアップグレード。各ステップで人間がシステムにより多くの自律を許す価値があるか確認する必要がある。

---

## 4. フルチュートリアル

### 4.1 5分クイックスタート

**Step 1：pain point を選ぶ**

どのパターンを使うか迷う場合は、インタラクティブセレクターを利用：`https://cobusgreyling.github.io/loop-engineering/#interactive`

あるいは Daily Triage から開始——低リスク、ループディシプリンを学ぶ。

**Step 2：リポジトリをスキャフォールド**

```bash
# 統一 CLI（推奨）
npx @cobusgreyling/loop init . --pattern daily-triage --tool grok

# 一発ヘルスチェック
npx @cobusgreyling/loop doctor .
```

対応ツール：`grok`（デフォルト）、`claude`、`codex`、`opencode`。`cursor`、`windsurf`、`openclaw` は手動コピーが必要。

**Step 3：コストを確認**

```bash
npx @cobusgreyling/loop cost --pattern daily-triage --level L1 --cadence 1d
```

**Step 4：審計レディネス**

```bash
npx @cobusgreyling/loop doctor .
```

スコア 0-100、具体的な改善提案付き。スコア ≥ 80 → harness-foundry へのバージョニングを推奨。

**Step 5：最初のループを実行——報告のみ**

Grok：
```bash
/loop 1d Run loop-triage. Update STATE.md. No auto-fix in week one.
```

Claude Code：
```bash
/loop 1d Run $loop-triage. Read STATE.md. Merge findings into High Priority and Watch List. Update Last run. Do not edit code.
```

**Step 6：出力を読み、ステートをコミット**

`STATE.md` を開く。ループが真の優先度を捉えたか？間違った部分を編集——あなたがまだエンジニアだ。

### 4.2 L2：分離修正試行

```bash
# 修正試行用の分離ワークツリーを作成
npx @cobusgreyling/loop-worktree create --run-id pr-217-fix-1 --pattern pr-babysitter

# チェッカーが拒否——クリーンアップ用にマーク
npx @cobusgreyling/loop-worktree mark --run-id pr-217-fix-1 --status rejected

# 24時間以上の拒否/アップグレード済みワークツリーをクリーンアップ
npx @cobusgreyling/loop-worktree cleanup --older-than 24h
```

### 4.3 サーキットブレーカー（L2+）

```bash
npx @cobusgreyling/loop context --check --ledger loop-ledger.json
# 終了 0 = 継続 · 終了 2 = 人間へエスカレーション
```

トリガー：最大反復回数、同じエラー N 回、連続失敗過多、トークン予算上限。

### 4.4 ゲート設定

リポジトリルートに `gate.yaml` を作成：

```yaml
version: 1
denylist:
  - "src/auth/**"
  - "**/*.env"
autoMergeAllowlist:
  - "docs/**"
  - "**/*.md"
```

```bash
npx @cobusgreyling/loop gate check --action auto-merge --paths <f1,f2,...>
# 終了 0 = 許可 · 終了 2 = 人間へエスカレーション
```

---

## 5. ツールエコシステム

- **loop**：統一 CLI エントリポイント（init/doctor/status/audit/cost）
- **loop-audit**：ループレディネススコア CLI（0-100）
- **loop-init**：スキャフォールド + 予算/実行ログ + 制約
- **loop-cost**：トークン消費推定ツール
- **loop-sync**：STATE.md ↔ LOOP.md ドリフト検出
- **loop-context**：ステートフルメモリマネージャー + サーキットブレーカー
- **loop-mcp-server**：MCP ランタイム検索（パターン/スキル/ステート）
- **loop-worktree**：修正試行ごとの分離 git ワークツリー
- **loop-gate**：パス deny-list + 自動マージ allow-list の強制
- **loop-sandbox**：一時ワークツリー隔離 + パッチキャプチャ
- **loop-action**：CI でループを実行する GitHub Composite Action
- **loop-swarm**：マルチエージェントコンセンサスサンドボックス（N 回順次実行、多数派が通過）

---

## 6. まとめ（考察と結論）

1. **「ループを書く」は「プロンプトを書く」よりもレバレッジが大きい。** プロンプトは使い捨て——ループは再利用可能、バージョン管理可能、監査可能なシステムだ。Boris Cherny は「僕の仕事はループを書くこと」と述べ、プロンプターからシステムデザイナーへの転換を示唆する。

2. **段階的信頼が自律への唯一の安全な道だ。** L1 → L2 → L3 は技術的アップグレードではなく、信頼のアップグレード。最初の1週間は報告のみ、2週目は修正試行、3週目は無人運用を検討。この段階的アプローチで、人間は各ステップでシステムを検証する機会を得る。

3. **メモリは AI エージェントの「脊柱」だ。** メモリのない AI エージェントは毎回の会話でゼロから始まる。Loop Engineering は STATE.md、loop-budget.md 等のファイルを通じて、セッションをまたぐ永続的なメモリを与える。

4. **チェッカーは信頼の基盤だ。** すべてのループにはメーカーとチェッカーサブエージェントがいる——チェッカーはメーカーの出力を信頼せず、独立して検証する。このメーカー/チェッカー分離は安全な自律の基盤だ。

5. **トークンコストは現実的な制約だ。** 高頻度ループ（CI Sweeper の5分ごとなど）はトークンを急速に消費する。Loop Engineering はループコスト推定ツールとループ予算ファイルで、トークンコストを可視化し、管理可能にする。

6. **エコシステム思考。** Loop Engineering は単独のツールではない——memory → loop → foundry → outerloop → fleet エコシステムの一部。各レイヤーが異なる次元の問題を解決する：メモリ、パターン、ランタイム、ガバナンス、スウォーム。

---

## 参考資料

- リポジトリ：`https://github.com/cobusgreyling/loop-engineering`
- 公式サイト：`https://cobusgreyling.github.io/loop-engineering/`
- 原文：`https://cobusgreyling.substack.com/p/loop-engineering`
- Addy Osmani コメンタリー：`https://addyosmani.com/blog/loop-engineering/`
- クイックスタート：`https://github.com/cobusgreyling/loop-engineering/blob/main/docs/QUICKSTART.md`
- パターンレジストリ：`https://github.com/cobusgreyling/loop-engineering/blob/main/patterns/registry.yaml`