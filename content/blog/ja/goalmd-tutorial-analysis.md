---
title: 'GOAL.md 深度解説：AI による自律的コード改善のミニマルフレームワーク — 数字ひとつで可能にする'
description: "GOAL.md を完全解析 — AutoHarness プロジェクトが提案した、AI エージェントが自律的にコードを改善するためのファイル形式。核心思想は驚くほどシンプル：数字を出力するスコアリングスクリプト（Fitness Function）を書き、目標とアクションカタログを定義する GOAL.md ファイルを作成し、エージェントにスコアを上げる方法を考えさせる。コア概念（適応度関数、アクションカタログ、改善ループ、動作モード）、設計哲学、完全チュートリアル、実践例を網羅。"
date: "2026-08-04"
author: "TopDigg Research Team"
tags: ["GOAL.md", "AutoHarness", "AI Agent", "Fitness Function", "Code Quality", "Autonomous Improvement", "Rust", "LLM"]
categories: ["Deep Dive"]
keywords: ["GOAL.md", "AutoHarness", "適応度関数", "Fitness Function", "AI エージェント", "自律的改善", "コード品質", "アクションカタログ", "改善ループ", "スコアリングスクリプト"]
---

# GOAL.md 深度解説：AI による自律的コード改善のミニマルフレームワーク — 数字ひとつで可能にする

> コアイデア：**従来のアプローチ — 人がコードを分析し、TODO リストを作り、一つずつ実行し、手動で検証する — は遅く持続不可能。GOAL.md の答え：AI に「どう改善するか」を教える必要はない、「何が『より良い』か」を教えるだけでいい。** 数字を出力するスコアリングスクリプト（Fitness Function）を書き、目標とアクションカタログを定義する GOAL.md ファイルを作成し、エージェントにスコアを上げる方法を考えさせる。エージェントは現在のスコアを測定し、最大インパクトのアクションを選択し、変更を実行し、スコアの向上を検証し、ログに記録する — 自己駆動の改善ループを形成する。これは AutoHarness プロジェクトが提案した「ミニマル自律改善フレームワーク」— AI にコードを「書かせる」のではなく、コードを「改善させる」。

---

## 1. プロジェクト概要

### 1.1 これは何か？

**GOAL.md** は AutoHarness プロジェクトが提案した**ファイル形式**で、AI エージェントが自律的にプロジェクトを改善できるようにする。解決する核心的問題：

> **「このプロジェクトをより良くしたいが、どうすればいいかわからない」**

従来のアプローチ：人がコードを分析 → TODO リストを作成 → 一つずつ実行 → 手動で検証。GOAL.md のアプローチ：スコアリングスクリプトを書き → GOAL.md を書き → エージェントに任せる → エージェントが各変更とスコア差分を記録。

### 1.2 コア概念

GOAL.md の核心は 4 つのコンポーネントで構成：

- **Fitness Function（適応度関数）**：「プロジェクトがどれほど良いか」を測る数字を出力するスクリプト
- **Action Catalog（アクションカタログ）**：可能なすべての改善アクションとその期待されるインパクトをリスト化
- **Improvement Loop（改善ループ）**：測定 → 選択 → 実行 → 検証 → 記録 → 繰り返し
- **Operating Mode（動作モード）**：Converge / Continuous / Supervised

### 1.3 何の問題を解決するか？

AI エージェントはコードを速く書けるが、「より良いコードとは何か」を知らない。フィードバックループがなければ、エージェントは温度計のないサーモモーターのように — 自分の変更がコードを良くしたのか悪くしたのかを判断できない。GOAL.md はシンプルな数字でこの問題を解決：**スコアが高い = プロジェクトが良い**。エージェントの目標はその数字を上げること。

---

## 2. コアイデア

### 2.1 Fitness Function — 数字ひとつで「良い」を定義

Fitness Function はプロジェクトの品質を測る数字を出力するスクリプト：

```bash
./scripts/score.sh
# 出力: 85 / 100
```

設計原則：

- **決定性**：同じ入力は必ず同じ出力を生成
- **高速**：理想的には 60 秒以内に完了
- **独立性**：外部状態に依存しない
- **合成可能性**：スコア = 各コンポーネントのスコアの合計

一般的なコンポーネント：

- **format（フォーマット）**：20 点 — `cargo fmt -- --check`
- **clippy（Lint）**：20 点 — `cargo clippy` の警告数
- **tests（テスト）**：25 点 — `cargo test` の合格
- **docs（ドキュメント）**：15 点 — ファイルチェック
- **maintenance（メンテナンス）**：10 点 — プロジェクトのメンテナンス状態
- **safety（セキュリティ）**：10 点 — `unsafe` コードチェック

### 2.2 Action Catalog — エージェントに「何ができるか」を教える

アクションカタログは可能なすべての改善アクションとその期待インパクトを列挙するテーブル：

- **cargo fmt を実行** — インパクト +20、`cargo fmt` を実行
- **clippy 警告を修正** — インパクト +10、`cargo clippy --fix` を実行
- **単体テストを追加** — インパクト +10、パブリック関数ごとにテスト追加

エージェントは「最大インパクト」のアクションを優先的に実行する。

### 2.3 Improvement Loop — 自己駆動の改善

```
1. 現在のスコアを測定
2. 最大インパクトのアクションを選択
3. 変更を実行
4. スコアの向上を検証
5. ログに記録
6. 繰り返し
```

このループは自己駆動 — エージェントは次のステップについて人間の指示を必要とせず、スコアの変化に基づいて自分で判断する。

### 2.4 Operating Mode — 3 つの戦略

- **Converge**：目標スコアに達したら停止（明確な目標がある改善向け）
- **Continuous**：中断されるまで継続実行（継続的最適化向け）
- **Supervised**：重要ポイントで一時停止して確認を待つ（敏感なコードレビュー向け）

---

## 3. 設計哲学

### 3.1 「AI にどうするかを教える必要はない、何が『より良い』かを教えればいい」

これは GOAL.md の最も深い設計哲学。従来のアプローチは AI にすべてのステップを详细に指示する — しかしこれは AI の創造力を制限する。GOAL.md は「目標」（スコア）と「境界」（制約）だけを定義し、AI に最適なパスを探させる。これは賢い従業員にマニュアルではなく KPI を渡すのと同じ。

### 3.2 「フィードバックループはすべての自律システムの基盤」

GOAL.md の改善ループは本質的にフィードバックループ：測定 → 行動 → 再測定。フィードバックループがなければ自律システムは機能できない — 自分の行動が有効かどうかを知らない。GOAL.md は可能な限りシンプルなメカニズム（数字）でこのループを構築する。

### 3.3 「決定性は信頼の基盤」

Fitness Function は決定的でなければならない — 同じ入力、同じ出力。スコアリングスクリプトが毎回異なる結果を出したら、エージェントはそのフィードバックを信頼できず、システム全体が崩壊する。決定性は技術要件であると同時に信頼要件でもある。

### 3.4 「制約は指示よりも効果的」

GOAL.md はエージェントに具体的なやり方を教えるのではなく、制約を定義する（既存機能を壊さない、フォーマットを先に、1 コミット = 1 変更）。制約は AI に自由度を与えながら安全性を保証する。これは人間の管理の知恵と一致：良い管理者は邊界を定義し、ミクロ管理はしない。

---

## 4. ステップバイステップチュートリアル

### 4.1 5 分間クイックスタート

**Step 1：スコアリングスクリプトを作成**

```bash
mkdir -p scripts
cat > scripts/score.sh << 'EOF'
#!/bin/bash
set -uo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")/.." || exit 1

FORMAT_SCORE=0; CLIPPY_SCORE=0; TEST_SCORE=0

# フォーマットチェック (20点)
cargo fmt -- --check 2>/dev/null && FORMAT_SCORE=20

# Clippy チェック (20点)
WARN_COUNT=$(cargo clippy 2>&1 | grep -c "warning:" || true)
[[ "$WARN_COUNT" -eq 0 ]] && CLIPPY_SCORE=20

# テストチェック (20点)
cargo test 2>&1 | grep -q "test result: ok" && TEST_SCORE=20

TOTAL=$((FORMAT_SCORE + CLIPPY_SCORE + TEST_SCORE))
echo "Score: $TOTAL / 60"
EOF
chmod +x scripts/score.sh
```

**Step 2：GOAL.md を作成**

```markdown
# Goal: My Project - コード品質の改善

## Fitness Function

./scripts/score.sh

## Operating Mode

- [x] **Converge** — 目標に達したら停止

Stop when:
- Score reaches 60/60
- 10 回の改善なしイテレーション

## Action Catalog

| Action | Impact | How |
|--------|--------|-----|
| cargo fmt | +20 | `cargo fmt` |
| Fix clippy warnings | +20 | `cargo clippy --fix` |
| Add unit tests | +20 | パブリック関数にテスト追加 |

## Constraints

1. 既存機能を壊さない
2. フォーマットを先に
3. 1 コミット = 1 変更

## Iteration Log

File: `iterations.jsonl`
```

**Step 3：実行**

```bash
./scripts/score.sh
# Score: 20 / 60

# エージェントが自動的に改善を実行
cargo fmt
./scripts/score.sh
# Score: 40 / 60

cargo clippy --fix
cargo fmt
./scripts/score.sh
# Score: 60 / 60
```

### 4.2 完全プロジェクト例

ファイル構造：

```
my-cli/
├── GOAL.md           # 目標定義
├── AGENTS.md         # エージェントガイド
├── iterations.jsonl  # イテレーションログ
├── scripts/
│   └── score.sh      # スコアリングスクリプト
├── src/
│   └── ...
└── Cargo.toml
```

### 4.3 イテレーションログ形式

各改善後、`iterations.jsonl` に記録：

```json
{"iteration":1,"component":"format","before":20,"after":40,"action":"cargo fmt"}
{"iteration":2,"component":"clippy","before":40,"after":60,"action":"cargo clippy --fix"}
```

### 4.4 JSON 出力形式

スコアリングスクリプトは `--json` をサポート：

```bash
./scripts/score.sh --json
# {"total":60,"max":60,"components":{"format":20,"clippy":20,"tests":20}}
```

### 4.5 エージェント自動認識

`GOAL.md` と `CLAUDE.md` をプロジェクトルートに配置 — エージェントが自動的に認識し改善ループを開始する。

---

## 5. 上級パターン

### 5.1 マルチエージェント協調

複数のエージェントが同じプロジェクトを同時に改善でき、`iterations.jsonl` で状態を共有する。

### 5.2 カスタムコンポーネント

任意のスコアリングコンポーネントを追加可能：

```bash
# セキュリティチェック (10点)
UNSAFE_COUNT=$(grep -r "unsafe" src/ | wc -l)
[[ "$UNSAFE_COUNT" -eq 0 ]] && SAFETY_SCORE=10

# ドキュメントチェック (10点)
[[ -f "README.md" ]] && DOC_SCORE=$((DOC_SCORE + 5))
[[ -f "AGENTS.md" ]] && DOC_SCORE=$((DOC_SCORE + 5))
```

### 5.3 タイムアウト処理

```bash
# スクリプトのハングを防止
TEST_OUTPUT=$(timeout 120 cargo test 2>&1 || true)
```

### 5.4 ツール存在チェック

```bash
if command -v cargo-tarpaulin &>/dev/null; then
    COVERAGE=$(cargo tarpaulin --out json | jq '.line_percent')
else
    COVERAGE=0
fi
```

---

## 6. 使用場面

- **コード品質改善** — 推奨モード Converge、例 Clippy 警告のクリーンアップ
- **パフォーマンス最適化** — 推奨モード Continuous、例 ベンチマーク継続最適化
- **セキュリティ監査** — 推奨モード Supervised、例 敏感なコードレビュー
- **ドキュメント改善** — 推奨モード Converge、例 README の作成
- **テストカバレッジ** — 推奨モード Converge、例 単体テストの追加
- **フォーマット統一** — 推奨モード Converge、例 コードフォーマッティング

---

## 7. まとめ（観点と結論）

GOAL.md の設計と実装から、いくつか考察すべき点がある：

1. **「AI に数字を渡す」は「AI にチェックリストを渡す」よりも効果的。** 従来のアプローチは AI にすべての TODO を列挙して一つずつ実行させる — しかしこれは AI の創造力を制限し、自律的な優先度判断を妨げる。GOAL.md は数字（スコア）で「何が良いか」を定義し、AI に最適なパスを探させる。これは賢い従業員にマニュアルではなく KPI を渡すのと同じ。

2. **フィードバックループはすべての自律システムの礎。** それがなければ自律システムは機能できない — 自分の行動が有効かどうかを知らない。GOAL.md の改善ループ（測定 → 行動 → 再測定）は可能な限りシンプルにこのループを構築。コンパイラは構文レベルで、テストスイートは動作レベルでフィードバックループを閉じたが、GOAL.md は**アーキテクチャ品質レベル**で閉じる。

3. **決定性は人間と AI の信頼の基盤。** スコアリングスクリプトが毎回異なる結果を出したら、エージェントはそのフィードバックを信頼できない。GOAL.md は決定的な Fitness Function を要求する — これは技術要件であると同時に信頼要件。人間は AI が何を見ているかを予測できれば、AI の意思決定を信頼できる。

4. **制約は指示よりも効果的。** GOAL.md はエージェントに具体的なやり方を教えるのではなく、制約を定義（既存機能を壊さない、フォーマットを先に）。制約は AI に自由度を与えながら安全性を保証する。これは人間の管理の知恵と一致：良い管理者は境界を定義し、ミクロ管理はしない。

5. **ミニマリズムの力。** GOAL.md の核心は 4 つのコンポーネントだけ：スコアリングスクリプト、目標ファイル、アクションカタログ、イテレーションログ。複雑な設定も巨大なフレームワークもない — 必要最小限のみ。このミニマリズムにより、GOAL.md はすべてのプロジェクトですぐに使える。

6. **「コードを書く」から「コードを改善する」へのパラダイムシフト。** 従来の AI 補助プログラミングは「どうすれば AI がより良いコードを書けるか」に焦点；GOAL.md は「どうすれば AI が既存のコードを改善できるか」に焦点。これは微妙だが深い転換 — コードベースはゼロから始まるものではなく、AI の価値は新しいコードを生成することだけでなく、既存のコードを継続的に改善することにある。

---

## 参考資料

- AutoHarness リポジトリ：`https://github.com/gyc567/AutoHarness`
- AutoHarness 論文：`https://arxiv.org/abs/2603.03329`
- GOAL.md チュートリアル：`https://github.com/gyc567/AutoHarness/tree/main/docs/goal-md/tutorial-cn`
- GOAL.md テンプレート：`https://github.com/gyc567/AutoHarness/blob/main/template/GOAL.md`