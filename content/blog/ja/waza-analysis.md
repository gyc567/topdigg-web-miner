---
title: "Waza：Microsoft製AIエージェントスキル評価フレームワーク——入門から上級まで"
date: "2026-08-16"
description: "Microsoft Wazaプロジェクトの深的分析——Go言語で書かれたAIエージェントスキル評価CLIツール"
tags:
  - Waza
  - AIエージェント
  - スキル評価
  - Microsoft
  - Go
  - CLIツール
  - ベンチマーキング
  - オープンソース
categories:
  - AIエージェント
  - 評価フレームワーク
  - Microsoftオープンソース
  - Goツール
  - スキル評価
---

# Waza：Microsoft製AIエージェントスキル評価フレームワーク——入門から上級まで

## プロジェクト背景とコア問題

### AIエージェントスキル評価の困境

AIエージェント開発プロセスにおいて、**エージェントのスキル品質を体系的に評価・検証する方法**は開発者が直面するコアな課題でした：

| 的痛苦 | 従来の方法の問い题 | Wazaの解決策 |
|------|------------------|-------------|
| **標準化の欠如** | 各チームが独自の評価体を構築、再利用困難 | 統一されたEval Spec仕様 |
| **結果の再現性なし** | ランダム性により結果が波动 | Snapshot & Replayメカニズム |
| **多モデル比較の困難** | 手動比較、非効率 | 組み込みcompareコマンド |
| **対抗テストの欠如** | セキュリティ問題を발견困難 | 組み込みのadversarial fault injection |
| **CI/CD統合が複雑** | 標準化インターフェースがない | 標準化されたExit CodesとReporters |

### Wazaの誕生

WazaはMicrosoftが立ち上げた**AIエージェントのスキル品質を評価するためのGo言語CLIツール**です。そのコアPhilosophyは：

> **"AIエージェントスキル評価に標準化、再現可能、定量化可能なフレームワークを提供する。"**

---

## プロジェクト概要

### Wazaとは？

Wazaは**AIエージェントスキルを評価するためのコマンドラインツール**で、開発者を支援します：

- **評価スイートのスキャフォールド**: SKILL.mdから評価タスクを自動生成
- **ベンチマーク実行**: 異なるモデルで実行し結果を比較
- **品質スコアリング**: LLM-as-Judgeによる多次元評価
- **対抗テスト**: 故障を注入して潜在的なセキュリティ問題を발견
- **トークン管理**: スキルドキュメントサイズの分析与最適化

### 主要機能

| 機能 | 説明 |
|------|------|
| 🎯 **スキルライフサイクル管理** | init、create、run、checkの完全フロー |
| 📊 **多モデル比較** | 異なるモデルでベンチマークを実行し比較 |
| 🏅 **LLM-as-Judge** | 組み込みスコアリング：groundedness、helpfulnessなど |
| 🔢 **トークン管理** | カウント、比較、分析、最適化の提案 |
| 🛡️ **対抗テスト** | オフライン故障注入：prompt injection、scope-bypass |
| 📸 **スナップショット＆リプレイ** | 再現可能なリプレイのために実行をキャプチャ |
| 🔌 **MCPモックサーバー** | ネットワークなしの分離テスト |
| ☁️ **クラウドストレージ統合** | Azure Blob Storageへの自動アップロード |
| 📈 **可視化ダッシュボード** | HTTPまたはJSON-RPCで結果を表示 |

---

## アーキテクチャ設計の深的分析

### 全体アーキテクチャ

Wazaはモジュラーアーキテクチャを採用：

```
┌─────────────────────────────────────────────────────────────────────────┐
│                            Waza アーキテクチャ                            │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│   ┌─────────────────────────────────────────────────────────────────┐   │
│   │                         CLI エントリー (cmd/waza)                  │   │
│   └─────────────────────────────────────────────────────────────────┘   │
│                                    │                                     │
│   ┌─────────────────────────────────────────────────────────────────┐   │
│   │                       コアモジュール (internal/)                   │   │
│   │  graders │ models │ orchestration │ metrics                      │   │
│   │  execution │ reporting │ transcript │ config                      │   │
│   └─────────────────────────────────────────────────────────────────┘   │
│                                    │                                     │
│   ┌─────────────────────────────────────────────────────────────────┐   │
│   │                        実行バックエンド                            │   │
│   │              mock (CI向け)  │  copilot-sdk (デフォルト)             │   │
│   └─────────────────────────────────────────────────────────────────┘   │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### Eval Spec形式（Schema 1.2）

```yaml
name: my-skill-eval
skill: my-skill
schemaVersion: "1.2"

config:
  trials: 3
  max_attempts: 2
  timeout: 300
  executor: mock

tasks:
  - task: hello-world
    assert:
      - grading: text
        config:
          contains: "Hello"
```

---

## 設計Philosophy

### コア原則

#### 1. Schema駆動

> **"バージョンは明示的、同じメジャーバージョンでは寛容、異なるメジャーバージョンでは厳格。"**

#### 2. スナップショットベースの再現性

各評価実行が完全なコンテキストスナップショットをキャプチャ：

```
waza run → スナップショットをキャプチャ → JSONとして保存
                  ↓
waza replay snapshot.json → 以前の結果を正確に再現
```

#### 3. CI-First設計

| CI機能 | 実装 |
|--------|------|
| **Exit Codes** | 0=成功、1=テスト失敗、2=設定エラー |
| **Reporters** | JSON、JUnit XML形式サポート |
| **しきい値チェック** | `waza tokens compare` for CI gating |

#### 4. 実行とスコアリングの分離

```bash
# ステップ1：評価を実行（スコアリングをスキップ）
waza run eval.yaml --skip-graders --output results.json

# ステップ2：後でスコアリング
waza grade results.json
```

---

## クイックスタート教程

### Wazaのインストール

#### 方法1：バイナリインストール（推奨）

```bash
# Linux/macOS
curl -fsSL https://raw.githubusercontent.com/microsoft/waza/main/install.sh | bash

# Windows (PowerShell)
irm https://raw.githubusercontent.com/microsoft/waza/main/install.ps1 | iex
```

#### 方法2：ソースから

```bash
git clone https://github.com/microsoft/waza.git
cd waza
git lfs install && git lfs pull
go build -o waza ./cmd/waza
```

### クイックスタートフロー

```bash
# 1. プロジェクトを初期化
waza init my-agent-project && cd my-agent-project

# 2. 新規スキルを作成
waza new skill my-skill

# 3. スキルを定義
waza run my-skill
waza check my-skill
```

---

## ハンズオン教程：スキル評価スイートの構築

### ステップ1：プロジェクトを初期化

```bash
waza init waza-demo && cd waza-demo
```

### ステップ2：スキルを作成

```bash
waza new skill calculator
```

### ステップ3：SKILL.mdを作成

```markdown
---
name: calculator
description: A calculator skill that performs basic arithmetic operations
triggers:
  - "calculate {{expression}}"
version: 1.0.0
---

# Calculator Skill

This skill provides basic arithmetic calculation capabilities.
```

### ステップ4：評価タスクを作成

```yaml
# evals/calculator/tasks/basic-operations.yaml
- task: addition_test
  description: Test basic addition
  prompt: "Calculate 15 + 27"
  assert:
    - grading: text
      config:
        contains: "42"
```

### ステップ5：評価を設定

```yaml
# evals/calculator/eval.yaml
name: calculator-eval
skill: calculator
schemaVersion: "1.2"
version: "1.0.0"

config:
  trials: 3
  executor: mock

tasks:
  - task: basic-operations
```

### ステップ6：評価を実行

```bash
waza run calculator
```

---

## 上級機能

### 1. LLM-as-Judgeスコアリング

```yaml
graders:
  - type: prompt
    model: gpt-4
    dimensions:
      - groundedness
      - helpfulness
      - instruction_following
```

### 2. MCPモックサーバー

```yaml
mcp_mocks:
  - name: filesystem
    command: ["npx", "mcp-server-fs", "/tmp/test"]
```

### 3. 対抗テスト

```bash
waza adversarial --pack prompt-injection
waza adversarial --pack scope-bypass
```

### 4. 多モデル比較

```bash
waza run eval.yaml --model gpt-4 --output gpt4-results.json
waza run eval.yaml --model claude-3 --output claude-results.json
waza compare gpt4-results.json claude-results.json
```

### 5. トークン管理

```bash
waza tokens count skills/my-skill/SKILL.md
waza tokens compare main...feature-branch --threshold 1000
waza tokens suggest skills/my-skill/SKILL.md
```

---

## CI/CD統合

### GitHub Actionsワークフロー

```yaml
# .github/workflows/waza-eval.yml
name: Waza Evaluation

on:
  pull_request:
    branches: [main]

jobs:
  evaluate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Install Waza
        run: |
          curl -fsSL https://raw.githubusercontent.com/microsoft/waza/main/install.sh | bash

      - name: Run Evaluation
        run: waza run evals/my-skill/eval.yaml --output results.json --executor mock
```

---

## グラーダータイプ

| タイプ | 用途 | 設定例 |
|--------|------|--------|
| **code** | Python/JSアサーション | `assert: "result == 42"` |
| **text** | テキストマッチング | `contains: "success"` |
| **file** | ファイル検証 | `path: "/tmp/out.txt"` |
| **diff** | ワークスペース比較 | `snapshot_path: "./snapshots/"` |
| **behavior** | 動作制約 | `max_tokens: 1000` |
| **action_sequence** | ツールコールシーケンス | `expected: ["read", "write"]` |
| **prompt** | LLM-as-Judge | `dimensions: ["groundedness"]` |

---

## まとめと結論

### コアインサイト

#### 1. AIエージェント評価の標準化

Wazaの最も重要な貢献は**AIエージェントスキル評価のための標準化フレームワークを確立したこと**です：

> **"AIエージェントの評価は、その場限りのテストに頼るのではなく、標準化された仕様、再現可能な結果、自動化プロセスを必要とします。"**

#### 2. 再現性の重要性

AIエージェント評価において、**再現性はコアな課題です**。Wazaは以下のメカニズムで解決します：
- Snapshot & Replayが完全なコンテキストをキャプチャ
- 複数回の試行がランダム性の影響を軽減
- モック実行자가ネットワーク依存を排除

#### 3. CI-Firstは単なるキャッチフレーズではない

WazaのCI-First設計の価値：
- Exit Codes：ビルドシステムが直接成功/失敗を判断可能
- 標準Reporters：既存のCIツールとシームレス統合
- しきい値チェック：自動門番、品質低下防止

### ユースケース

✅ **Wazaを強く推奨**：
- 体系的な評価が必要なAIエージェント開発チーム
- 多モデル比較が必要なシナリオ
- 対抗テストニーズ（セキュリティ敏感性アプリケーション）
- CI/CD自動化が必要なチーム
- 標準化されたスキル評価が必要な企業

---

## リソースリンク

### 公式サイト

| リソース | リンク |
|---------|--------|
| 🌐 公式サイト | https://microsoft.github.io/waza/ |
| 💻 GitHubリポジトリ | https://github.com/microsoft/waza |
| 📚 ドキュメント | https://microsoft.github.io/waza/docs/ |

---

## 結論

Wazaは**AIエージェントスキル評価分野における重要なマイルストーン**的代表——散在し非標準的な評価実践を、完整的で標準化され、自動化されたワークフローに変換しました。

> **"適切な評価なしにはAIエージェントを信用しないでください。Wazaを使用してください。"**

---

*この記事はMicrosoft Wazaオープンソースプロジェクト（MIT License）に基づいています。*

**Sources:**
- [GitHub - microsoft/waza](https://github.com/microsoft/waza)
- [Waza Documentation](https://microsoft.github.io/waza/)
