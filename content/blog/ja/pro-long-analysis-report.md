---
title: "PRO-LONG 深層解説：プログラマブルメモリが長期推論を実現"
description: "PRO-LONG — LLMエージェント向けの最小プログラマブルメモリフレームワークの包括的分析。設計思想、単一ファイルログアーキテクチャ、コード取得メカニズム、ARC-AGI-3における画期的成果、そしてエージェントメモリシステムの将来パラダイムについての深い洞察。"
date: "2026-08-08"
author: "TopDigg Research Team"
tags: ["PRO-LONG", "LLMエージェント", "プログラマブルメモリ", "長期推論", "ARC-AGI-3", "コンテキスト管理", "オープンソース", "AI", "Fable", "エージェントメモリ"]
categories: ["深層解説"]
keywords: ["PRO-LONG", "プログラマブルメモリ", "LLMエージェント", "長期推論", "ARC-AGI-3", "コンテキスト管理", "エージェントメモリシステム", "コード取得"]
---

> **PRO-LONG** は、単一ファイルログとコード取得を通じて長期推論を実現する、LLMエージェント向けの最小プログラマブルメモリフレームワークです。この包括的分析では、プロジェクトのアーキテクチャ、設計思想、実践的チュートリアル、そしてエージェントメモリシステムの核心的洞察を詳細に解説します。

---

## 1. プロジェクト概要

### 1.1 PRO-LONGとは？

PRO-LONGは、長期ワークロード向けに設計された最小コンテキスト管理フレームワークです。その核心アイデアは、優雅なまでにシンプルです：

1. **すべての観察・アクション・結果を単一の構造化された `log.txt` ファイルに追記**
2. **エージェントがコード（grep、Python）を通じて履歴をプログラム的に取得・推論**
3. **サブエージェントなし、専用取得メカニズムなし、システムプロンプトはわずか約30行**

これは別の複雑なメモリシステムではありません。PRO-LONGの設計思想は**ミニマリズム**です — 最小のコードで最も効果的なメモリ管理を実現します。

### 1.2 主な特長

| 特長 | 詳細 |
|------|------|
| **単一ファイルログ** | すべての履歴を1つの `log.txt` ファイルに保存 |
| **コード取得** | grep、Pythonなどのツールで履歴をプログラム的に検索 |
| **最小プロンプト** | システムプロンプトはわずか約30行、複雑な指示なし |
| **デュアルバックエンド** | OpenAI CodexとClaude Codeの両バックエンドをサポート |
| **Dockerサンドボックス** | 隔離されたコンテナ環境で実行し、安全性を確保 |
| **ARC-AGI-3画期的成果** | ARC-AGI-3で97.4%のbest@2を達成 |

### 1.3 重要な概念

#### プログラマブルメモリ — エージェントに「調べ方」を教える

従来のエージェントメモリシステムは、主に2つの戦略を採用しています：

1. **コンテキスト注入**：すべての履歴情報をプロンプトに直接配置（トークン爆発を引き起こす）
2. **ベクトル検索**：埋め込みモデルを使用して関連履歴を取得（複雑さとレイテンシを増大）

PRO-LONGは第3の戦略を提案します：**プログラマブルメモリ**。エージェントはgrepやPythonスクリプトなどのツールを使用して履歴を検索・分析できます。

このアプローチの利点：
- **完全性**：情報損失なしに完全な履歴を保持
- **正確性**：コード取得は意味的取得よりも正確
- **解釈可能性**：エージェントの取得プロセスは透明でデバッグ可能
- **ゼロオーバーヘッド**：埋め込みモデルやベクトルデータベース不要

#### 単一ファイルログ — シンプルが最も有効

PRO-LONGはすべての情報を単一の `log.txt` ファイルに保存します：
- 初期ボード状態
- 各アクション後のボード状態
- エージェントの分析と推論
- アクション実行結果

この設計は「単純」に見えますが、実際には非常に賢いです：
- **情報損失なし**：すべての履歴を完全に保持
- **シンプルで信頼性**：複雑な同期やインデックスメカニズムが不要
- **効率的な取得**：grepは大規模ファイルで極めて高い性能を発揮

#### 30行プロンプト — エージェントの能力を信頼

PRO-LONGのシステムプロンプトはわずか約30行で、以下は含まれません：
- 複雑な推論指示
- 詳細な戦略ガイド
- 特定のタスクフォーマット要件

エージェントに伝えるのは：
1. 目標は何であるか（パズルを解くこと）
2. 履歴がどこにあるか（`log.txt`）
3. 履歴をどう取得するか（コードを使用）
4. アクションをどう出力するか（`actions.json` を書き込む）

この最小限の設計は、エージェントの能力への信頼を反映しています — エージェント自身に取得と推論の方法を決めさせます。

---

## 2. 設計思想

### 2.1 ミニマリズム — 少なければ多いほど良い

PRO-LONGの核心設計思想は**ミニマリズム**です。他のメモリシステムが複雑さを増していく中、PRO-LONGは最もシンプルな解決策を選択しました：

- 1つのファイルがすべての履歴を保存
- 1つのプロンプトが使い方を教える
- 一連のツールがエージェントに取得を委ねる

この設計の利点：
- **理解しやすい**：誰もがシステムの動作を理解できる
- **デバッグしやすい**：問題が発生したら、ログファイルを確認するだけ
- **拡張しやすい**：新機能の追加はログフォーマットの変更のみで対応可能

### 2.2 エージェントを信頼 — コードに語らせる

PRO-LONGはエージェントに推論の「教え方」をしようとしません。エージェントの能力を信頼し、以下のみを提供します：
- 履歴へのアクセス（ファイルシステム）
- 取得ツール（grep、Python）
- 出力フォーマット（JSON）

エージェントは以下が可能です：
- 任意の取得戦略を使用
- 任意の分析スクリプトを作成
- 任意の推論方法を採用

この設計は、現代のLLMコーディング能力への確信を反映しています。

### 2.3 プログラマブル > 意味的 — 正確性が曖昧さに勝る

従来のメモリシステムは意味的取得（埋め込み類似性）を使用しますが、PRO-LONGはプログラム的取得（grep、Python）を選びました。

理由：
- **完全一致**：grepは特定のパターンを含む行を正確に見つけることができる
- **構造化クエリ**：Pythonはログフォーマットを解析し、複雑なクエリを実行可能
- **ゼロレイテンシ**：埋め込み計算やベクトル検索が不要
- **解釈可能**：エージェントの取得プロセスは完全に透明

---

## 3. 実践的チュートリアル

### 3.1 インストールとセットアップ

#### 応要条件

- Python 3.12（推奨）
- Docker

#### インストール手順

```bash
# リポジトリをクローン
git clone git@github.com:alexisfox7/PRO-LONG.git
cd PRO-LONG

# 仮想環境を作成
python -m venv .venv
source .venv/bin/activate

# 依存関係をインストール
pip install -e .
```

#### Dockerイメージのビルド

```bash
# Codexバックエンド
docker build -t rgb-agent/codex-sandbox:latest docker/codex-sandbox
docker build -t rgb-openai-proxy docker/openai-proxy

# Claude Codeバックエンド
docker build -t rgb-agent/claude-sandbox:latest docker/claude-sandbox
docker build -t rgb-anthropic-proxy docker/anthropic-proxy
```

#### 環境変数の設定

`.env` ファイルを作成：

```
ARC_API_KEY=...
ANTHROPIC_API_KEY=...   # claude-codeバックエンド
OPENAI_API_KEY=...      # codexバックエンド
```

### 3.2 基本的な使い方

#### 評価の実行

```bash
# Codexバックエンドですべてのゲームを実行
prolong-swarm --suite all -m gpt-5.5 --max-actions 500

# Claude Codeバックエンドですべてのゲームを実行
prolong-swarm --suite all --backend claude-code -m claude-opus-4-6

# 特定のゲームを実行
prolong-swarm --game ls20,ft09 -m gpt-5.5
```

#### 主要パラメータ

| パラメータ | デフォルト | 説明 |
|-----------|------------|------|
| `--backend` | `codex` | バックエンド：`codex` または `claude-code` |
| `--suite` | — | ゲームスイート：`ls20`、`vc33`、`ft09`、または `all` |
| `--game` | — | カンマ区切りのゲーム名またはID |
| `--max-actions` | 500 | ゲームあたりの最大アクション数 |
| `--model`, `-m` | `claude-opus-4-6` | ベースモデル |
| `--effort` | `high` | 努力レベル（claude-codeバックエンド） |
| `--reasoning-effort` | `none` | 推論努力（codexバックエンド） |
| `--operation-mode` | `online` | `online` / `offline` / `normal` |

### 3.3 メモリ条件

エージェントのゲーム履歴へのアクセスは `--log-window` と `--workspace` で制御されます：

| 条件 | フラグ | 利用可能な履歴 |
|------|--------|----------------|
| **prolong** | （デフォルト） | 完全なゲームログ |
| **lw25** | `--log-window 25` | ログの最後の25個のアクションセクション |
| **no-log (in-prompt)** | `--log-window -1` | ログファイルなし；現在のボードがプロンプトに追加 |
| **stateless** | `--workspace stateless` | 完全なログだが、各呼び出し時にワークスペースがクリア |

### 3.4 システムプロンプトの理解

PRO-LONGのシステムプロンプトは非常に簡潔で、核心は以下の通りです：

```python
SYSTEM_PROMPT = """
You are a coding agent playing a grid-based puzzle game by writing Python action plans.

Your primary objective is to solve all levels in the game. Your secondary objective is to minimize total cumulative actions used.

`/workspace/logs.txt` is the game log: action headers, tool calls, board states, and your own prior analyses. Parse it **programmatically**, as reading full 64x64 board states from prompt can introduce precision errors.

**Tools**: Read, Write, Edit, Bash, Grep, Glob.

**Workspace**: `/workspace/` persists across calls. `actions.json` is cleared each call; other files accumulate.

**Response format**: a strategic briefing, then
[PLAN]
<2-3 sentence action plan>

**Write `/workspace/actions.json`** with a JSON object `{"actions": ["ACTION6(30,40)", "ACTION1", "RESET"]}` — a list of 1–{action_cap} actions to execute in order.
"""
```

このプロンプトの重要なポイント：
1. **明確な目標**：パズルを解く + アクション数を最小化
2. **指定されたメモリ場所**：`/workspace/logs.txt`
3. **指定された取得方法**：プログラム的（grep、Python）
4. **指定された出力フォーマット**：`actions.json`

### 3.5 アクションシステム

PRO-LONGは以下のアクションをサポートしています：

| アクション | 説明 |
|-----------|------|
| `ACTION1` | 上 |
| `ACTION2` | 下 |
| `ACTION3` | 左 |
| `ACTION4` | 右 |
| `ACTION5` | スペースキー / インタラクト |
| `ACTION6(x,y)` | 列x（0-63）、行y（0-63）をクリック |
| `ACTION7` | 元に戻す |
| `RESET` | レベルリセット（アクション数はカウントされる） |

### 3.6 出力結果

評価結果は `evaluation_results/` ディレクトリに書き込まれます。`scorecards/` ディレクトリには公式のオンラインスコアカードが含まれます。

---

## 4. コアアーキテクチャの深層分析

### 4.1 プロジェクト構成

```
prolong_agent/
├── agent/
│   ├── base.py               # ベースアーキテクチャ
│   ├── codex_agent.py        # Codex CLIバックエンド
│   ├── claude_code_agent.py  # Claude Codeバックエンド
│   ├── swarm.py              # CLIエントリポイント
│   ├── action_queue.py       # アクション実行
│   ├── game_state.py         # ボード/ログフォーマット
│   └── prompts.py            # プロンプトテンプレート（~30行）
├── environment/
│   ├── arcagi3.py            # ARC-AGI-3 APIラッパー
│   ├── runner.py             # ゲームループ
│   └── config.py
├── metrics/
└── utils/
```

### 4.2 コアコンポーネント

#### エージェントベースアーキテクチャ

```python
class BaseAgent:
    """ベースエージェントクラス：標準インターフェースを定義"""
    
    def __init__(self, model: str, workspace: str):
        self.model = model
        self.workspace = workspace
        self.log_path = f"{workspace}/logs.txt"
    
    def act(self, observation: dict) -> list[str]:
        """観察に基づいてアクションリストを返す"""
        # 1. 観察をログに追記
        # 2. ログを読む
        # 3. モデルを使用してアクションを生成
        # 4. actions.jsonに書き込む
        pass
```

#### ログフォーマット

```log
[INITIAL BOARD STATE]
<64x64 ボード状態>

[ACTION1]
Tool call: bash("python3 -c '...'")

[POST-ACTION BOARD STATE]
<更新されたボード状態>

[ACTION2]
Tool call: grep("pattern", "/workspace/logs.txt")
...
```

#### アクション実行

```python
class ActionQueue:
    """アクションキュー：アクションを順番に実行"""
    
    def execute(self, actions: list[str]) -> dict:
        results = []
        for action in actions:
            result = self._run_action(action)
            results.append(result)
        return {"results": results, "total": len(results)}
```

### 4.3 取得メカニズム

PRO-LONGの取得は、エージェントのコーディング能力に完全に依存します：

```python
# エージェントが利用可能な取得方法

# 1. 特定パターンをgrepで検索
grep -n "INITIAL BOARD STATE" /workspace/logs.txt

# 2. Pythonでログを解析
python3 -c "
import re
with open('/workspace/logs.txt') as f:
    content = f.read()
boards = re.findall(r'\[POST-ACTION BOARD STATE\](.*?)\[', content, re.DOTALL)
print(f'Found {len(boards)} board states')
"

# 3. 統計分析
python3 -c "
with open('/workspace/logs.txt') as f:
    lines = f.readlines()
actions = [l for l in lines if l.startswith('[ACTION')]
print(f'Total actions: {len(actions)}')
"
```

### 4.4 性能データ

論文および公式評価によると：

| 指標 | データ |
|------|--------|
| **ARC-AGI-3 best@2** | 97.4%（Fable 5） |
| **平均改善** | ベースエージェント比 +18.0 パーセンテージポイント |
| **トークン効率** | 専用フレームワーク比 4.2〜5.8倍少ない |
| **総コスト** | $1,750（25回のFable 5実行） |
| **最高pass@1** | 76.1% |

---

## 5. 洞察のまとめ

### 5.1 PRO-LONGが重要な理由

PRO-LONGは、エージェントメモリシステムにおける重要なパラダイム転換を体現しています。他のシステムが複雑さを増していく中、PRO-LONGは**ミニマリズムの力**を証明しました。

**3つの核心的洞察**：

1. **プログラマブルメモリが意味的取得に勝る**：コードで履歴を検索させることは、埋め込みベースの取得よりも正確で効率的
2. **単一ファイルログで十分**：1つの `log.txt` ファイルに必要なすべての情報を保存可能
3. **エージェントの能力を信頼**：30行のプロンプトで、エージェントは複雑なタスクを自律的に完了可能

### 5.2 他のツールとの比較

| 特長 | PRO-LONG | LangChain Memory | AutoGPT | BabyAGI |
|------|----------|------------------|---------|---------|
| **メモリ方式** | 単一ファイルログ | ベクトルデータベース | 複数ファイル | タスクキュー |
| **取得方式** | コード（grep/Python） | 意味的検索 | ファイル読み込み | 優先度ソート |
| **プロンプト長** | ~30行 | 複雑 | 複雑 | 中程度 |
| **トークン効率** | 極めて高い | 中程度 | 低い | 中程度 |
| **ARC-AGI-3** | 97.4% | 未テスト | 未テスト | 未テスト |
| **オープンソース** | ✅ | ✅ | ✅ | ✅ |

### 5.3 ユースケース

**最適**：
- 長期メモリが必要なエージェントタスク
- 正確な取得が必要な履歴クエリ
- 複雑な推論と計画タスク
- コスト感度の高いアプリケーションシナリオ

**あまり適さない**：
- シンプルな単一ターン会話
- 履歴メモリが不要なタスク
- 非コーディングエージェント（コーディング能力が必要）

### 5.4 設計思想のまとめ

PRO-LONGの設計思想は以下のように要約できます：

1. **ミニマリズム**：最小のコード、最も効果的なメモリ
2. **エージェントを信頼**：エージェント自身に取得と推論の方法を決めさせる
3. **プログラマブル > 意味的**：完全一致が曖昧な類似性に勝る
4. **完全保持**：履歴情報を一切失わない
5. **ゼロオーバーヘッド**：埋め込みモデルやベクトルデータベースが不要

---

## 6. ロードマップ

プロジェクトのトレンドとエージェントメモリシステムの進化に基づいて：

### 短期（3〜6ヶ月）
- より多くのLLMバックエンドのサポート
- ログフォーマットと取得効率の改善
- より多くの評価ベンチマークの追加

### 中期（6〜12ヶ月）
- マルチエージェント協調メモリ
- インクリメンタルログ圧縮
- クロスセッションメモリ永続化

### 長期（1〜2年）
- 自律メモリ管理エージェント
- 組織横断メモリ共有
- 汎用長期推論フレームワーク

---

## 7. まとめ

PRO-LONGは、ミニマリズムな設計を通じて画期的な性能を達成した、革新的なエージェントメモリフレームワークです。単一ファイルログ、コード取得、30行プロンプト — これら一見「素朴」なデザインが、ARC-AGI-3で97.4%の精度を達成しました。

**コアバリュー**：
- **ミニマリズム**：最小のコード、最も効果的なメモリ
- **プログラム的取得**：正確、効率的、解釈可能
- **完全保持**：履歴情報を一切失わない
- **ゼロオーバーヘッド**：埋め込みモデルが不要

**PRO-LONGを選ぶ理由**：
- オープンで透明（MITライセンス）
- ミニマリズムなデザイン、理解とデバッグが容易
- コード取得、正確で効率的
- ARC-AGI-3で検証された画期的な性能

**今すぐ始めましょう**：
```bash
# リポジトリをクローン
git clone git@github.com:alexisfox7/PRO-LONG.git
cd PRO-LONG

# インストール
python -m venv .venv
source .venv/bin/activate
pip install -e .

# 評価を実行
prolong-swarm --suite all -m gpt-5.5 --max-actions 500
```

---

> **免責事項**：本記事はPRO-LONGの公開ドキュメント、論文、技術分析に基づいており、包括的な技術的洞察と実践的ガイドを提供することを目的としています。論文引用：arXiv:2607.20064。
