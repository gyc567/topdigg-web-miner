---
slug: cc-master-analysis
title: "cc-master 徹底解説：任意のコーディング Agent セッションを長期プロジェクトのプロジェクトリードにする（プロジェクト解説 + クイックスタート・チュートリアル + システムアーキテクチャ + 設計哲学）"
description: "nemori-ai/cc-master（GitHub のオープンソースプロジェクト、TypeScript、PolyForm Noncommercial 1.0.0 ライセンス）を題材に、『コーディング Agent セッションを長期プロジェクトのプロジェクトリード（a project lead for long-running work）にする』を徹底解説。核心理念：cc-master は Claude Code、Codex、Cursor、kimi-code のいずれかのサポート対象コーディング Agent セッションを『プロジェクトリード』にする——あなたはアイデアを持ち込み、本当にあなたが必要とする少数の判断を下す；それは大目標の分解、独立したサブタスクの並列スケジューリング、進捗とクォータの追跡、そして明示的な目標に対する成果の検証を担う。Board（かんばん）はコンテキストリセットやセッションの引き継ぎをまたいで存続し、作業は単一の会話の記憶に依存しない。インストール：curl の一行コマンドで ccm エンジン + プラグインをインストール；プラグインは各 harness 向けにネイティブアダプターを生成する（Claude Code スラッシュコマンド /cc-master:as-master-orchestrator、Codex $cc-master-as-master-orchestrator、Cursor /as-master-orchestrator、kimi-code cc-master:as-master-orchestrator）。システムアーキテクチャ：3層プロダクトモデル（per-harness プラグインアダプター層 → ccm CLI + @ccm/engine エンジン → ccm web-viewer 読み取り専用ビュー）；Board v2 JSON データモデル（ナローワエスト設計）；8つの分散 Skill（master-orchestrator-guide / authoring-workflows / using-ccm / slicing-goals-into-dags / dev-as-ml-loop / engineering-with-craft / pacing-and-estimation / distilling-lessons-into-assets）；O/T1/T2/T3 統一モデル割り当て；7種類の dormant-until-armed Hooks；クォータ姿勢 + モンテカルロ納期予測；cross-harness の worker ディスパッチと Agent Registry。設計哲学：『指揮者は決して楽器を演奏しない』（コーディネーターは単元作業を自分でやらない）、注意力の再配分（注意力を本当に注ぐ価値のある場所へ再配分する）、六つの憲章目標、ship-anywhere（hooks は bash + node/JS のみ使用）、ナローワエスト原則（ごく少数の固定 board フィールドだけが hooks に依存される）、二重バージョン線の分離（プラグイン vX.Y.Z と ccm ccm-vX.Y.Z を独立してリリース）。明確な境界：これは『お願いすれば AI が全部やってくれる』ではない——センス、デザイン、方向性などあなたにしかできない判断は依然としてあなたのもの；10分で直せる 1〜2 行の修正に『プロジェクトリード』を呼ぶ価値もない。"
date: "2026-08-11"
author: "TopDigg"
tags: ["cc-master", "Claude Code", "Codex", "Cursor", "kimi-code", "Agent Orchestration", "AI Agent", "Long-horizon", "Task DAG", "Monte Carlo", "Project Lead", "DevTools", "Agent Plugin"]
categories: ["Deep Dive"]
keywords: ["cc-master", "Claude Code", "Codex", "Cursor", "kimi-code", "Agent オーケストレーション", "Orchestration", "長期タスク", "Long-running", "Board", "DAG", "O/T1/T2/T3", "モデル割り当て", "設計哲学", "nemori-ai", "クォータ", "モンテカルロ", "Worker", "Agent Registry"]
---

# cc-master 徹底解説：任意のコーディング Agent セッションを長期プロジェクトのプロジェクトリードにする

> 核心理念：**cc-master は Claude Code、Codex、Cursor、kimi-code のいずれかのサポート対象コーディング Agent セッションを、『長期プロジェクトのプロジェクトリード（a project lead for long-running work）』に変える**。あなたはアイデアを持ち込み、本当にあなたが必要とする少数の判断を下す；それは作業の分解を手伝い、独立した部分を並列実行し、進捗とクォータを追跡し、明示的な目標に対して成果を検証する。**Board はコンテキストリセットやセッションの引き継ぎをまたいで生き残り**、作業は単一の会話の記憶に依存しない——これが『単一の会話の中の Agent』との最も本質的な違いである。

## 一、プロジェクト解説

### 1.1 それは何か？

cc-master は nemori-ai がオープンソース化した **Agent オーケストレーションフレームワーク**（TypeScript で書かれた）で、『単一のコーディング Agent セッション』を『数日間持ちこたえ、マルチスレッドで並列し、セッションをまたいで生き残る』**プロジェクトリード**にアップグレードすることを目指す。

公式の一言での位置づけ：

> cc-master turns a supported coding-agent session into a project lead for long-running work. You bring the idea and make the handful of calls that truly need you; it helps break the work down, run independent pieces in parallel, track progress and quota, and verify the result against an explicit goal. The board survives context resets and session handoffs, so the work can continue without relying on one conversation's memory.

（cc-master はサポート対象のコーディング Agent セッションを長期作業のプロジェクトリードに変える。あなたはアイデアを持ち込み、本当にあなたが必要とする少数の判断を下す；それは作業の分解を手伝い、独立した部分を並列実行し、進捗とクォータを追跡し、明示的な目標に対して成果を検証する。かんばんはコンテキストリセットやセッションの引き継ぎをまたいで生き残り、作業は単一の会話の記憶に依存せずに継続できる。）

**一言でまとめると**：cc-master は AI 支援コーディングの時代に、人間の注意力を本当に注ぐ価値のある場所へ再配分する——分解、スケジューリング、進捗とクォータの記帳といった面倒な作業は『プロジェクトリード』に任せ、あなたは方向性と重大な判断だけを行う。

### 1.2 プロジェクト基本情報

| 項目 | 値 |
|------|-----|
| リポジトリ | https://github.com/nemori-ai/cc-master |
| Stars | 8 |
| ライセンス | PolyForm Noncommercial 1.0.0（ソースコード利用可、非商用限定） |
| 言語 | TypeScript |
| 最終プッシュ | 2026-08-07 |
| Topics | `agent-plugin` `agent-skill` `claude-code` `claude-plugin` `dynamic-workflow` `orchestration` |
| 中国語ドキュメント | README_zh.md（中国語 README 付属） |

### 1.3 それは何でないのか（重要な境界）

> ただし誤解しないでほしい——これは**『お願いすれば、AI が全部やってくれる』ではない**。センス、デザイン、方向性——あなたにしかできない判断は**依然としてあなたのもの**；それがあなたの皿から取り除くのは、本来あなたを埋め尽くすはずだった分解、スケジューリング、進捗、記帳だけだ。

**いつ cc-master を使うべきでないか**：

> 1〜2 行、10分で直せる修正？そのまま直せばいい——『プロジェクトリード』を呼ぶな。牛刀を以て鶏を割くようなもので、遅くなるだけだ。**それは一人で見切れず、数日間走り、多くのスレッドを同時に開く目標のために用意されている。仕事が大きければ大きいほど、乱れていればいるほど、長ければ長いほど、使う価値がある。**

### 1.4 誰のためのものか（3種類のターゲットユーザー）

| ユーザー像 | 課題 | cc-master が提供する価値 |
|----------|------|---------------------|
| 🚀 アイデアはあるがエンジニアリングを知らないあなた | 欲しいものを説明できるが、**頼れるプロジェクトリード**がいない | アイデアを実行可能なタスクに分解し、進捗を見守り、検証するのを手伝う |
| 🔧 『マネージャー』になりたくないエンジニア | 管理の雑務がコードを書く時間を奪う | 管理を引き受けて、あなたを職人仕事に留まらせる |
| 🧭 チームを率いるリーダー | 『自分を10人に増やしたい』 | 面倒なスケジューリングを担い、あなたは方向性と重大な判断を決める |

## 二、核心理念

### 2.1 注意力の再配分（Attention Reallocation）

> At bottom it does one thing: in the age of AI-assisted coding, it **reallocates your attention to where it's actually worth spending**.

結局のところ、それがするのはたった一つのこと：AI 支援コーディングの時代に、**あなたの注意力を本当に注ぐ価値のある場所へ再配分する**ことだ。人間の注意力は希少資源である；すべての Agent の出力を注視し、すべての進捗を管理するよりも、注意力を『あなたにしかできない判断』に集中させる方がよい。

### 2.2 指揮者は決して楽器を演奏しない

> The conductor never plays an instrument.

これは cc-master で最も中核となる設計上のレッドラインである：**コーディネーターは調整を担い、決して自ら単元作業を行わない**。メインラインを『自ら実装』や『自らレビュー』へと推すあらゆる変更は、方向が間違っている。この原則は skill 設計、hook 設計、board 状態機械の全体に貫かれている。

### 2.3 六つの憲章目標（Charter Goals）

プロジェクト憲章が列挙する六つの目標（一部はまだ進化中）：

1. **非同期・並列・マルチスレッドで前進**し、目標を完全に納品する
2. **token 消費のペースを制御する**（クォータ認識）
3. **自律的な意思決定と人機協働の境界を把握する**（どの判断を人間に聞くべきか）
4. **目標の分解、管理、更新、計画**
5. **妥当なリソース消費の範囲内で効率を最大化するスケジューリングとオーケストレーション**
6. **複雑度 / 難易度 / 所要時間に応じて適切なモデルを選ぶ**（O/T1/T2/T3）

### 2.4 『全自動 Agent』との本質的な違い

- **ではない**『1 つのプロンプトで全自動で走り切る』——それは**明示的な Goal Contract（目標契約）**と**検収ゲート**を導入し、結果は目標に対して項目ごとに検証しなければならない。
- **ではない**単一の会話——**Board はディスクに永続化**され（`~/.cc_master/boards/*.board.json`）、コンテキストのリセット、セッションの引き継ぎ後も生き残る。
- **ではない**すべての仕事に使うべき——『いつ使うべきでないか』の明確な境界を持つ（小さな修正はそのまま行い、プロジェクトリードを呼ばない）。

## 三、詳細チュートリアル

### 3.1 必須の前提条件

| 依存 | 要件 |
|------|------|
| Node.js | **22+**（すべてのモードで必須。オフライン/バージョン固定を含む） |
| unzip | プラグインとエンジンの解凍用 |
| SHA256 ツール | `sha256sum` / `shasum` / `openssl` のいずれか |
| ネットワークツール | `curl` または `wget`（オンラインインストールに必要） |

### 3.2 ワンクリックインストール（エンジン ccm + プラグインをまとめて）

```bash
# ccm エンジン + プラグインをインストール（デフォルトで harness を自動検出）
curl -fsSL https://raw.githubusercontent.com/nemori-ai/cc-master/main/install.sh | bash
```

### 3.3 インストールオプション（バージョン固定 / harness 指定）

```bash
# エンジンとプラグインの両方のバージョンを固定（2つのフラグは相互に独立、どちらも任意）
curl -fsSL https://raw.githubusercontent.com/nemori-ai/cc-master/main/install.sh | bash -s -- \
  --ccm-version ccm-v0.23.0 --plugin-version v0.22.0

# エンジンのバージョンのみ固定、プラグインは最新を使用
curl -fsSL https://raw.githubusercontent.com/nemori-ai/cc-master/main/install.sh | bash -s -- --ccm-version ccm-v0.23.0

# 対象 harness を指定
curl -fsSL https://raw.githubusercontent.com/nemori-ai/cc-master/main/install.sh | bash -s -- --harness claude-code
curl -fsSL https://raw.githubusercontent.com/nemori-ai/cc-master/main/install.sh | bash -s -- --harness cursor
curl -fsSL https://raw.githubusercontent.com/nemori-ai/cc-master/main/install.sh | bash -s -- --harness kimi-code

# すべての harness をインストール
curl -fsSL https://raw.githubusercontent.com/nemori-ai/cc-master/main/install.sh | bash -s -- --all-harnesses
```

### 3.4 重要な環境変数

| 変数 | デフォルト値 | 用途 |
|------|--------|------|
| `CC_MASTER_HOME` | `$HOME/.cc_master` | ランタイム状態のルートディレクトリ（boards、Goal Briefs、アカウント登録、クォータ sidecar） |
| `PREFIX` | `$HOME/.local/bin` | `ccm` バイナリのインストール先 |
| `CC_MASTER_PLUGIN_DIR` | `$HOME/.local/share/cc-master` | プラグインのステージングルートディレクトリ |
| `CC_MASTER_INSTALL_LOCAL` | _空_ | ローカルディレクトリのパスを設定 → ローカルアセットからオフラインインストール |
| `CC_MASTER_NO_AUTOINSTALL` | _空_ | `1` に設定 → Claude Code での自動ステータスバーインストールを無効化 |

### 3.5 各 harness でオーケストレーションを起動する

インストール完了後、対応する harness のネイティブエントリで起動する：

```bash
# Claude Code（スラッシュコマンド）
/cc-master:as-master-orchestrator <あなたの目標>

# Codex（サブコマンド）
$cc-master-as-master-orchestrator <あなたの目標>

# Cursor（Agent chat スラッシュコマンド）
/as-master-orchestrator <あなたの目標>

# kimi-code（名前空間プラグインコマンド）
cc-master:as-master-orchestrator <あなたの目標>
```

### 3.6 日常コマンド早見表

| コマンド | 用途 |
|------|------|
| `/cc-master:as-master-orchestrator <goal>` | 新しいオーケストレーションを開始 |
| `/cc-master:as-master-orchestrator --resume` | 既存の board を復元 |
| `ccm harness list --machine-wide --json` | マシンレベルの harness サーフェスを発見 |
| `ccm quota status --machine-wide --json` | キャッシュされたクォータ姿勢を読み取り |
| `ccm model-policy show --task <taxonomy> --json` | O/T1/T2/T3 モデルロールの候補を表示 |
| `ccm worker help --harness <target>` | 対象 CLI の実際の agent コマンドヘルプを読み取り |
| `ccm worker run` | 生の worker 転送（board の副作用なし） |
| `ccm worker dispatch --board … --task … --idempotency-key …` | 記帳付きのディスパッチ（Agent Registry に記録） |
| `ccm agent list --json` | ランタイムの名簿とライフサイクル証拠を表示 |
| `ccm status-report show` | board の状態レポートを生成 |
| `ccm web-viewer open` | ブラウザで読み取り専用のリアルタイム計画図を開く |
| `/cc-master:discuss <decision>` | 判断を人間に投げる |
| `/cc-master:bulk-discuss` | 未定の判断を一括で処理 |
| `/cc-master:stop` | 締めくくり、board をアーカイブ |
| `/cc-master:handoff-to-new-session` | セッション引き継ぎの準備 |
| `/cc-master:retro` | 読み取り専用の振り返り → 教訓ドキュメント |
| `/cc-master:distill <retro-path...>` | 経験をプロジェクト資産に蒸留（discipline-doc / skill / workflow / subagent） |
| `ccm account add\|list\|switch <email>` | Claude Code アカウントプールを管理 |

### 3.7 一度の完全なワークフローの形

```text
1. あなた: /cc-master:as-master-orchestrator "ブログサイトを新しい i18n アーキテクチャに移行する"
2. cc-master: Goal Contract を作成 → 目標を DAG にスライス（T0 調査 → T1/T2 並列実装 → T3 検収）
3. cc-master: O/T1/T2/T3 に従って各タスクにモデルロールを割り当て、worker を Claude Code/Codex などにディスパッチ
4. 本当にあなたが必要とする判断に出会ったら → /cc-master:discuss または /cc-master:bulk-discuss
5. コンテキストがもうすぐ満杯 → /cc-master:handoff-to-new-session → 新しいセッションで --resume、board はそのまま復元
6. すべてのタスクが done → verify-board ゲートが Goal Contract に照らして項目ごとに検収 → /cc-master:stop でアーカイブ
7. 任意: /cc-master:retro → /cc-master:distill で教訓をチーム資産に
```

## 四、システムアーキテクチャ

### 4.1 三層プロダクトモデル

```text
┌─────────────────────────────────────────────────────────┐
│  cc-master plugin（per-harness アダプター）              │
│  コマンド / skills / rules / hooks                       │
│  → Claude Code · Codex · Cursor · kimi-code             │
├─────────────────────────────────────────────────────────┤
│  ccm CLI + @ccm/engine（独立プロダクト）                  │
│  board / Goal Contract / worker / agent registry /       │
│  quota / model policy / runtime / monitor / viewer       │
├─────────────────────────────────────────────────────────┤
│  ccm web-viewer（読み取り専用、ccm バイナリに内蔵）       │
│  Graph / Board / List / Timeline / DecisionCard          │
└─────────────────────────────────────────────────────────┘
```

- **第一層**：per-harness プラグインアダプター——同一のコマンド/skill/hook を各 harness のネイティブ形態に翻訳する。
- **第二層**：`ccm` CLI と `@ccm/engine`——harness から分離された独立エンジンプロダクトで、board、worker、クォータ、モデルポリシーを担う。
- **第三層**：`ccm web-viewer`——読み取り専用のブラウザビュー（Graph / Board / List / Timeline / DecisionCard）。

### 4.2 ソースからアダプターへの投影モデル（paragoge スタイル）

```text
plugin/src/                      ← 正規ソースコード（SSOT）
  skills/                        ← SAP: <skill>/canonical/ + adapters/<host>/strategy.yaml
  hooks/                         ← PHIP: _manifest/ + _hosts/<host>/ + implementations/<host>/
  commands/                      ← コマンド本体のソースコード
  adapters/                      ← サーフェス横断の host ネイティブ呼び出しマッピング
plugin/dist/<host>/              ← 生成されたアダプター成果物（リポジトリにコミット）
  cc-master-plugin-claude-code-<version>.zip
  cc-master-plugin-codex-<version>.zip
  cc-master-plugin-cursor-<version>.zip
  cc-master-plugin-kimi-code-<version>.zip
```

### 4.3 Board v2 データモデル（ナローワエスト設計）

Board は `~/.cc_master/boards/<UTCタイムスタンプ>-<pid>.board.json` の JSON ファイルである：

```json
{
  "schema": "cc-master/v1",
  "goal": "...",
  "owner": { "active": true, "session_id": "abc123", "heartbeat": "..." },
  "git": { "worktree": "/.../.claude/worktrees/i18n", "branch": "feat/i18n-rollout" },
  "wip_limit": 4,
  "tasks": [
    { "id": "T0", "status": "done", "deps": [], "artifact": "commit a1b2c3", "verified": true },
    { "id": "T1", "status": "in_flight", "deps": ["T0"], "mechanism": "sub-agent", "handle": "bg-7a" },
    { "id": "D1", "status": "blocked", "blocked_on": "user", "title": "PR は2つに分けたほうがいい？" }
  ],
  "log": []
}
```

**タスク状態の列挙**：`ready / in_flight / blocked(blocked_on:"user"|"<taskid>") / done / escalated / failed / stale / uncertain`

**ナローワエスト原則**：ごく少数の固定フィールドだけが hooks に依存される——`schema / goal / owner.session_id / git / tasks[{id,status,deps}]` + 状態の列挙；それ以外はすべて『Agent に与える自由形式』。ナローワエストを変更するには、同じ PR 内で全 hooks + テストを同期更新しなければならない。

### 4.4 8つの分散 Skill（すべての harness で共有）

| Skill | 役割 |
|-------|------|
| `master-orchestrator-guide` | プロジェクトリードのアイデンティティ、メインラインの判断、DAG へのスライススケジューリング、ディスパッチ/復元/検収/アカウント切り替えの境界 |
| `authoring-workflows` | 利用可能なホスト上で決定的に workflow を作成；未対応ホストでは明示的にダウングレード |
| `using-ccm` | ccm CLI 全操作マニュアル、board モデル、状態機械、Agent Registry とエンジン検証ルール |
| `slicing-goals-into-dags` | 目標を早期納品可能・並列可能・検証可能な DAG にスライス |
| `dev-as-ml-loop` | 単一の開発タスクを『提案 → 測定 → 調整 → 収束』の最適化ループとして扱う |
| `engineering-with-craft` | DDD / SDD / TDD / OOP エンジニアリングの職人技と実装レッドライン |
| `pacing-and-estimation` | ccm の読み取り専用アドバイス（usage / estimate / baseline）を消費してペースと見積もりを行う |
| `distilling-lessons-into-assets` | 振り返りの証拠を discipline-doc / skill / workflow / subagent 資産にルーティング |

### 4.5 O / T1 / T2 / T3 統一モデル割り当て

| ロール | 用途 |
|------|------|
| **O**（orchestrator） | システム/アーキテクチャ/設計、敵対的レビュー |
| **T1** | 仕様完成後の主要実装 |
| **T2** | 通常レビュー、テスト、リポジトリ調査、構造化サマリー |
| **T3** | 機械的・低リスク・高検証性のバッチ作業 |

### 4.6 Hooks：dormant-until-armed（武装されるまで眠る）

各 hook は、セッションが `as-master-orchestrator` に引き継がれて board がアクティブになるまで完全に眠っている；例外は `bootstrap-board.sh` だけ（それ自体が武装アクションである）。7種類の能力：

| Hook | 能力 |
|------|------|
| `bootstrap` / `resume` | board を作成 / 旧 board を引き継ぐ |
| `reinject` / orchestrator context | 圧縮後にアイデンティティ、Goal Contract、タスク、マシンレベルの事実を復元 |
| `verify-board` | 停止ゲート：未完了の目標、バックグラウンド Agent、実際の完了証拠をチェック |
| `board-guard` / `board-lint` | 手動での board 変更を阻止；書き込み後の構造検証 |
| `usage-pacing` | ccm がキャッシュしたクォータ/アドバイスを消費 |
| `coordination inbox` | セッション横断の決定レベルの通知 |
| `identity` / `critical-path nudge` | 長いセッションでロールを復元 + クリティカルパスへの注意 |

### 4.7 クォータ姿勢とモンテカルロ予測

- **Quota posture（クォータ姿勢）**：provider ごとにキャッシュされたマシンレベルのクォータ信号——Claude Code 5h/7d、Codex 7d のハードリミット、Cursor の課金サイクル、kimi-code のローリング 5h/7d。
- **Monte Carlo 予測**：スケジュール計画を何千回もシミュレーションし、納品確率の推定を与える——『明日にはできる』とノリで約束するのではなく、分布を与える。

### 4.8 二重バージョン線（ADR-022）

| プロダクト | バージョン tag パターン | リリーストラック |
|------|--------------|----------|
| cc-master プラグイン | `v0.22.0`（裸バージョン） | プラグインリリース |
| `ccm` エンジン | `ccm-v0.23.0` | ccm リリース |

プラグインとエンジンは2本の独立したバージョン線であり、それぞれ固定できる——これにより『エンジンをアップグレードしてもプラグインが壊れず、プラグインを更新してもエンジンを待つ必要がない』ことが保証される。

## 五、設計哲学

### 5.1 指揮者は決して楽器を演奏しない

コーディネーターは調整を担い、決して自ら単元作業を行わない。メインラインを『自ら実装/自らレビュー』へ推すあらゆる変更の方向は間違っている——これはシステム全体で最も重要な一本のレッドラインである。

### 5.2 注意力の再配分

システムの究極の目標は『すべてを自動化する』ことではなく、**人間の注意力を本当に注ぐ価値のある場所へ再配分すること**だ。分解、スケジューリング、進捗、記帳といった決定的な面倒な作業は自動化する；センス、デザイン、方向性といった外部委託できない判断は人に残す。

### 5.3 ship-anywhere（どこでも実行できる）

hooks は **bash + node/JS** のみを使用（Claude Code ホストが保証するランタイム）し、`jq` / `python` / ネイティブ TS は使わない；`agent-teams` や定時ルーチンには依存しない（信頼できない）；定時プリミティブ（CronCreate）はウォッチドッグのみに使用し、通常のスケジューリングには使わない。

### 5.4 dormant-until-armed（武装されるまで眠る）

アクティブにしなければ存在しない：すべての hook はセッションが引き継いで board をアクティブにするまで完全に眠っており、『未使用時の副作用』をゼロに抑える。

### 5.5 ナローワエスト（Narrow Waist）

hooks は極小の固定フィールド集合にのみ依存し、それ以外はすべて Agent が自由に振る舞える空間である；ナローワエストを変更するには同じ PR で全 hooks + テストを更新しなければならない。これによりシステムは『決定的なコア』と『Agent の自由度』の間でバランスを取る。

### 5.6 二重バージョン線の分離

プラグインとエンジンは独立してリリースされ、それぞれバージョンを固定できる。アーキテクチャ上の決定は ADR に落とし込まれる（既に 39 件の ADR）。これは『長期目線のアーキテクチャ決定』の現れである：選定は3年スパンで行い、一時しのぎの対策はしない。

### 5.7 明確な使用境界

設計哲学の中で最も直感に反するのは、**『使うべきでない』境界を能動的に引いている**ことだ：10分で直せる小さな修正はそのまま行い、プロジェクトリードを呼ぶな。システムは『大きすぎる、乱れすぎる、長すぎる』目標のために生まれた——仕事が大きければ大きいほど価値がある。

## 六、帰納的まとめ：見解と結論

1. **単一の会話の記憶は唯一の作業状態であるべきではない**：Board をディスクに永続化し、コンテキストリセットやセッションの引き継ぎをまたいで生き残らせることは、長期 Agent 作業が『demo』から『本番利用可能』へ向かう重要な一歩である。

2. **オーケストレーションは発明に勝る**：cc-master は新しい Agent を発明せず、Claude Code / Codex / Cursor / kimi-code をオーケストレーションする——既存の認証と能力を再利用し、価値は『指揮』にあり『楽器』にはない。

3. **人間の注意力は希少資源であり、再配分されるべきである**：決定的な面倒な作業（分解/スケジューリング/記帳）を自動化し、外部委託できない判断（センス/デザイン/方向性）を残すことは、AI 支援コーディング時代の正しい役割分担である。

4. **『お願い式の全自動』は偽のニーズである**：明示的な Goal Contract + 検収ゲート + discuss の仕組みは、本当に使えるオーケストレーションは人間を意思決定ループに戻さなければならず、人間を迂回してはならないことを証明している。

5. **クォータ意識は長期タスクの土台である**：モンテカルロ納期予測 + provider ごとのクォータ姿勢が、『期日通りに納品できるか』をノリから確率分布へと変える。

6. **決定的なコアと Agent の自由度は共存できる**：ナローワエストな board + dormant hooks + ship-anywhere ランタイムにより、システムは検証可能な決定性を持ちながら、Agent の柔軟性も保持する。

7. **cross-harness アダプテーションはシステム工学である**：同一の skill/hook/コマンドを 4 つの harness のネイティブ形態に投影する（SAP/PHIP モデル）ことは、『harness ごとにそれぞれ別のセットを書く』より持続可能である。

8. **境界の意識こそ成熟の印である**：『いつ使うべきでないか』を明確にすることは、機能を積むことよりも、ツールが自身の位置づけに対してどれほど清醒かを示す。

## 参考資料

- リポジトリホーム：https://github.com/nemori-ai/cc-master
- 中国語 README：`README_zh.md`
- 機能マニュアル：`design_docs/feature-manual.md`
- 能力モデル：`design_docs/cross-harness-orchestration-capability-model.md`
- 完全仕様：`design_docs/spec.md`
- 用語集：`design_docs/glossary.md`
- アーキテクチャ決定記録：`adrs/ADR-001…ADR-039`
- コマンドカタログ：`plugin/src/skills/using-ccm/canonical/references/command-catalog.md`
