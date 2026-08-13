---
slug: oh-my-claudecode-analysis
title: "oh-my-claudecode 深掘り：Claude Code マルチエージェントオーケストレーションツール（核心思想 + プロジェクト説明 + 詳細チュートリアル + 設計哲学）"
description: "Yeachan-Heo/oh-my-claudecode（38.5k stars，MIT，TypeScript，v4.15.7）を深掘り解析。核心思想：19 の專門 Agent（4レーン）+ 3層モデルルーティング（haiku/sonnet/opus）+ 31 Skills + 5段階 Team pipeline + Magic Keywords。設計哲学：ゼロ学習曲線、Teams-first オーケストレーション、スマートルーティング、合成可能な Skills システム。"
date: "2026-08-12"
author: "TopDigg"
tags: ["oh-my-claudecode", "Claude Code", "Multi-Agent", "Orchestration", "TypeScript", "AI Agents", "Developer Tools", "SWE-bench"]
categories: ["Deep Dive"]
keywords: ["oh-my-claudecode", "Claude Code マルチエージェントオーケストレーション", "マルチエージェント", "オーケストレーション", "TypeScript", "AI Agent", "開発者ツール", "SWE-bench", "autopilot", "ralph", "ultrawork", "team orchestration", "Claude Code プラグイン"]
---

# oh-my-claudecode 深掘り：Claude Code マルチエージェントオーケストレーションツール

> 核心思想：**Claude Code を学ばないで、OMC を使おう。** oh-my-claudecode（OMC）は Claude Code の上に乗るマルチエージェントオーケストレーションレイヤー。19 の專門 Agent、3 層モデルルーティング、31 の Skills、5 段階 Team Pipeline を使い、自然言語で AI チームを駆動する。Claude Code を置換するのではなく、その上にゼロ学習曲線でシームレスに積み上げる。

## 一、プロジェクト説明：oh-my-claudecode とは

### 1.1 一文での位置づけ

**oh-my-claudecode（OMC）は Claude Code の上に走るマルチエージェントオーケストレーションシステムで、手動設定やプロンプトエンジニアリングの代わりに Skills と專門 Agent を使う。** スローガン「Don't learn Claude Code. Just use OMC.」——精心に構築されたプロンプトを必要とする単一 Agent ツールから、自然言語でマルチ Agent チームを駆動できる開発環境への転換を意味する。

### 1.2 プロジェクトメタ情報

| 項目 | 値 |
|------|------|
| GitHub | [Yeachan-Heo/oh-my-claudecode](https://github.com/Yeachan-Heo/oh-my-claudecode) |
| Stars | 38,530 |
| Forks | 3,462 |
| ライセンス | MIT |
| 言語 | TypeScript |
| 最新バージョン | 4.15.7（npm: oh-my-claude-sisyphus）|
| npm パッケージ | `oh-my-claude-sisyphus` |
| 創業者 | Yeachan Heo（[@Yeachan-Heo](https://github.com/Yeachan-Heo)）|
| 公式サイト | https://yeachan-heo.github.io/oh-my-claudecode-website |
| Discord | https://discord.gg/jq6jnSGABY |

### 1.3 オーケストレーションモード

| モード | 説明 | 用途 |
|------|------|------|
| **Team（推奨）** | 5 段階パイプライン：`team-plan → team-prd → team-exec → team-verify → team-fix` | 共有タスクリスト上の調整 Claude Agent |
| **omc team（CLI）** | tmux CLI workers：実際の `claude`/`codex`/`gemini` 分屏プロセス | Codex/Gemini/Grok/Cursor CLI タスク |
| **Autopilot** | 自律実行（単一リード Agent）| 最小儀式でのエンドツーエンド機能開発 |
| **Ultrawork** | 最大並列度（非 Team）| バースト並列修復/リファクタリング |
| **Ralph** | verify/fix ループ付き永続モード | 完全に完了する必要があるタスク |
| **UltraQA** | テスト/ビルド/lint/typecheck が通るまで QA サイクル | 繰り返しの diagnose/fix サイクルが必要な品質ゲート |

### 1.4 4つの連動システム

```
ユーザー入力 → Hooks（ライフサイクルイベント検出）→ Skills（行動注入）
           → Agents（專門タスク実行）→ State（進捗追跡）
```

1. **Hooks**：Claude Code ライフサイクルイベントを検出し、対応 Skills をトリガー
2. **Skills**：行動を注入し、オーケストレータの動作を変更
3. **Agents**：專門タスクを実行（19 Agent、4 レーン）
4. **State**：コンテキストリセットをまたいで進捗を追跡（`.omc/` ディレクトリ）

## 二、核心思想：Agent システム、モデルルーティング、Skills 合成

### 2.1 19 の專門 Agent（4レーン）

**構築/分析レーン**：

| Agent | デフォルトモデル | 役割 |
|-------|--------------|------|
| `explore` | haiku | コードベース発見、ファイル/symbol マッピング |
| `analyst` | opus | 要件分析、隠れた制約の発見 |
| `planner` | opus | タスク順序付け、実行計画作成 |
| `architect` | opus | システム設計、インターフェース定義、トレードオフ分析 |
| `debugger` | sonnet | 根本原因分析、ビルドエラー解決 |
| `executor` | sonnet | コード実装、リファクタリング |
| `verifier` | sonnet | 完了検証、テスト十分性確認 |
| `tracer` | sonnet | 証拠駆動の因果追跡 |

**レビューレーン**：

| Agent | デフォルトモデル | 役割 |
|-------|--------------|------|
| `security-reviewer` | sonnet | セキュリティ脆弱性、信任境界、authn/authz レビュー |
| `code-reviewer` | opus | 包括的コードレビュー、API コントラクト、後方互換性 |

**ドメインレーン**：

| Agent | デフォルトモデル | 役割 |
|-------|--------------|------|
| `test-engineer` | sonnet | テスト戦略、カバレッジ、flaky テスト対策 |
| `designer` | sonnet | UI/UX アーキテクチャ、インタラクションデザイン |
| `writer` | haiku | ドキュメント、移行メモ |
| `qa-tester` | sonnet | tmux による対話的 CLI/サービスランタイム検証 |
| `scientist` | sonnet | データ分析、統計研究 |
| `git-master` | sonnet | Git 操作、コミット、リベース、履歴管理 |
| `document-specialist` | sonnet | 外部ドキュメント、API/SDK 参照検索 |
| `code-simplifier` | opus | コード明確化、簡略化、保守性改善 |

**調整レーン**：

| Agent | デフォルトモデル | 役割 |
|-------|--------------|------|
| `critic` | opus | 計画/設計のギャップ分析、多角的レビュー |

### 2.2 3層モデルルーティング

| 層 | モデル | 特徴 | コスト |
|------|------|------|------|
| LOW | haiku | 高速、安い | 低 |
| MEDIUM | sonnet | 性能とコストのバランス | 中 |
| HIGH | opus | 最高推理品質 | 高 |

### 2.3 Skills システム：階層的行動注入

**核心式**：

```
[実行層 Skill] + [0-N 強化層] + [オプション保証層]
```

**Skills 三層アーキテクチャ**：

```
┌─────────────────────────────────────────────┐
│  GUARANTEE LAYER（オプション）              │
│  ralph：「検証完了まで停止しない」           │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│  ENHANCEMENT LAYER（0-N スキル）           │
│  ultrawork（並列）/ git-master（コミット）/ frontend-ui-ux │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│  EXECUTION LAYER（主要スキル）              │
│  default（構築）/ orchestrate（調整）/ planner（計画）│
└─────────────────────────────────────────────┘
```

### 2.4 Magic Keywords：自然言語 Skills トリガー

| Keyword | トリガー | 効果 |
|---------|---------|------|
| `ralph`/`don't stop`/`must complete` | `$ralph` | 永続ループ、verifier が完了確認后才退出 |
| `autopilot`/`build me`/`I want a` | `$autopilot` | 自律実行パイプライン |
| `ultrawork`/`ulw`/`parallel` | `$ultrawork` | 最大並列 Agent オーケストレーション |
| `ralplan`/`consensus plan` | `$ralplan` | RALPLAN-DR 反復コンセンサス計画 |

### 2.5 Team モード：推奨マルチ Agent オーケストレーションパターン

**v4.1.7 より、Team が規範のオーケストレーション表面に**：

```bash
/team 3:executor "fix all TypeScript errors"
```

**5段階パイプライン**：

```
team-plan → team-prd → team-exec → team-verify → team-fix（ループ）
```

## 三、詳細チュートリアル：ゼロから首个タスクまで

### 3.1 インストール（2つの方法）

**方法1：マーケットプレイス/プラグイン（推奨）**

**重要：1行ずつ貼り付けてください（両行同時に貼り付けないでください）**：

```bash
# 1行目：マーケットプレイスを追加
/plugin marketplace add https://github.com/Yeachan-Heo/oh-my-claudecode

# 2行目：プラグインをインストール
/plugin install oh-my-claudecode
```

**方法2：npm グローバルインストール**

```bash
npm i -g oh-my-claude-sisyphus@latest
```

### 3.2 セットアップ

```bash
# Claude Code / OMC セッション内
/setup
/omc-setup

# ターミナルから
omc setup
```

### 3.3 基本使用

**Autopilot（自律実行）**：

```bash
/autopilot "build a REST API for managing tasks"
```

**Team（推奨）**：

```bash
/team 3:executor "fix all TypeScript errors"
```

**Ralph（永続モード）**：

```bash
/ralph "refactor the authentication module"
```

**Ultrawork（最大並列）**：

```bash
/ultrawork "fix all TypeScript errors"
```

### 3.4 Deep Interview（Socratic 要件明確化）

```bash
/deep-interview "I want to build a task management app"
```

Deep Interview は Socratic 追问を使って思考を明確化し、コードを書く前に隠れた仮定を露出する。

### 3.5 SWE-bench ベンチマーク

```bash
export ANTHROPIC_API_KEY=your_key_here
./setup.sh
./quick_test.sh
./run_full_comparison.sh
```

## 四、归纳まとめ：OMC の核心的見解と結論

### 4.1 核心的見解

**見解1：Claude Code 自体制不是终点、オーケストレーショレイヤーが生産性のてこ。** OMC の核心的洞察：Claude Code を手動で最適化すべき単一 Agent ではなく、プログラム可能なランタイムとして扱う。

**見解2：Skills 合成 > 固定 Agent ワークフロー。** `[Execution] + [0-N Enhancements] + [Optional Guarantee]` 式は動的合成を可能にし、同じタスクで ultrawork + default + git-master または ralph + default + test-engineer をactivate 可能。

**見解3：Magic Keywords は「学習曲線」を「表現力」に変換する。** 自然言語の意図（"build me a REST API" → Autopilot トリガー）をツールが自動解釈。

**見解4：Team パイプラインは現時点で最も信頼性の高いマルチ Agent 協業パターン。** 5段階パイプラインは構造化と柔軟性のバランスを最適に達成。`team-fix` ループは検証失敗時に Agent が実行段階に戻って再処理することを保証。

**見解5：モデルルーティングはコスト制御の鍵。** haiku/sonnet/opus 三層ルーティングで同じ API 予算により多くのタスクを処理可能。

**見解6：永続化（Persistence）は品質保証の前提条件。** `ralph` の設計哲学：Agent は最初のパスで完了を主張すべきではなく、verifier の検証を通る必要がある。

**見解7：ゼロ学習曲線は能力の低下ではなく、検索性の向上。** Magic Keywords（検索性）+ Skills 階層（合成性）= ゼロ学習曲線ながら全能力を維持。

### 4.2 技術的結論

**結論1**：マルチ Agent オーケストレーションの核心的問題は「Agent がいくつあるか」ではなく「誰がどの Agent を使うか決めるか」。三層ルーティング（モデル + Agent + Skill）が体系的に解決。

**結論2**：Skills システムは Agent オーケストレーションの最適抽象化レベル。

**結論3**：Team Pipeline の verify 段階は全体のパイプラインの品質錯。`team-verify → team-fix → team-exec` ループが OMC 品質保証の核心的メカニズム。

## 五、設計哲学：OMC のエンジニアリング哲学

### 5.1 ゼロ学習曲線

「Claude Code を学ばないで、OMC を使おう」はデザイン制約でありマーケティングスローガンではない。ユーザーの自然言語の意図を инструмент が正しい実行経路を見つけることが目標。

### 5.2 Teams-First

**v4.1.7 より、Team が規範のオーケストレーション表面に**。構造化 > 自由衝突、明確 > 暗黙、検証可能 > 検証不能。

### 5.3 スマートルーティング

三層ルーティング：
1. **モデルルーティング**：タスク複雑度に応じて haiku/sonnet/opus を選択
2. **Agent ルーティング**：タスクタイプに応じて 19 の專門 Agent を選択
3. **Skill ルーティング**：Magic Keywords + 明示的呼び出しで行動注入を決定

---

**OMC の核心的洞察：Claude Code を最適化すべき単一 Agent ではなく、プログラム可能なランタイムとして扱うとき、マルチエージェントオーケストレーションの可能性が広がる。**
