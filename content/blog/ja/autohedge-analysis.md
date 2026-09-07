---
slug: autohedge-analysis
title: "AutoHedge：マルチエージェント自律型ヘッジファンドのアーキテクチャ解説と実践チュートリアル"
description: "swarms フレームワークベースのマルチエージェント自律型ヘッジファンド AutoHedge を深掘り解析。Director／Quant／Risk／Execution／Sentiment の5つの専任エージェントによるパイプライン構造、リスク優先の設計哲学、Solana 実行経路（Jupiter Ultra API）、インストール・設定チュートリアル、Python API と CLI の使い方、プロジェクトの強み・限界・適用場面のまとめを網羅。"
date: "2026-09-07"
author: "TopDigg"
tags: ["AutoHedge", "Multi-Agent", "AI Agent", "Hedge Fund", "Trading", "Swarms", "Solana", "Risk Management", "Quantitative Trading", "LLM"]
categories: ["Deep Dive"]
keywords: ["AutoHedge", "マルチエージェント", "ヘッジファンド", "AIエージェント", "自律型トレーディング", "Swarmsフレームワーク", "リスク管理", "Solana", "Jupiter", "量化トレード", "設計哲学", "トレーディングパイプライン"]
---

# AutoHedge：マルチエージェント自律型ヘッジファンドのアーキテクチャ解説と実践チュートリアル

> 核心思想：**ヘッジファンドの組織構造を専任 AI エージェントの集まりで再現する。** AutoHedge は、ファンドマネージャー、クオンツリサーチャー、リスクマネージャー、執行トレーダー、センチメントアナリストという5つの役割を5つの LLM エージェントにマッピングし、構造化されたハンドオフで1本のトレーディングパイプラインに接続する。Director が投資テーゼを生成し、Quant が数値検証を行い、Risk がポジションサイズを決め、Execution が注文パラメータを生成する。コードは約1,600行で、「LLM の組織化」を研究する好例となっている。

**リスク注意：本プロジェクトはベータ段階の実験的オープンソースソフトウェアです。本稿は技術解説であり、投資助言ではありません。実資金で自動売買システムを動かす前に、リスク評価とコンプライアンス確認を自身で行ってください。**

## 1. プロジェクト概要

### 1.1 一言でいうと

**AutoHedge はエンタープライズ級の自律型エージェント・ヘッジファンドである。スウォーム・インテリジェンスで複数の専任 AI エージェントを調整し、市場分析、リスク管理、執行までを人間の介入を最小限にしてエンドツーエンドで実行する。**

### 1.2 プロジェクト情報

| 項目 | 値 |
|------|-----|
| GitHub | [The-Swarm-Corporation/AutoHedge](https://github.com/The-Swarm-Corporation/AutoHedge) |
| 開発元 | The Swarm Corporation（作者：Kye Gomez） |
| ライセンス | MIT |
| 言語 | Python 3.10+ |
| バージョン | 0.1.5（Beta） |
| 主要依存 | swarms、swarm-models、pydantic、loguru、httpx、solders、yfinance、rich |
| 取引所 | Solana（完全対応）、Coinbase（開発中）、その他 CEX（ロードマップ） |
| 基盤フレームワーク | [Swarms](https://github.com/The-Swarm-Corporation/swarms) |

### 1.3 能力の境界

- 対応：マルチエージェントによるテーゼ生成、クオンツ／センチメント分析、ポジションサイジングとリスク評価、注文パラメータ生成、Solana オンチェーンのトークン照会とスワップ（Jupiter Ultra API）、対話式 REPL コンソール。
- 非対応：バックテストエンジン、口座レベルのハードリミット、本番向け OMS（注文管理システム）、マルチアカウントのポートフォリオ管理。

プロジェクトは初期段階にある。`logs/` 内の約定ログは `experimental/` 配下のマーケットメイキング実験スクリプト由来で、本システムの実運用出力ではない。

## 2. アーキテクチャ

### 2.1 5つの専任エージェント

`autohedge/workers.py` が全エージェントを定義する。各エージェントはシステムプロンプト（`prompts.py`）、モデル、ツールセットの3要素で構成される。

| エージェント | モデル | 役割 | 人間の対応役割 |
|------------|--------|------|----------------|
| Trading-Director | gpt-4.1 | 市場テーゼの生成、タスクから銘柄を発見、下流エージェントの調整 | ファンドマネージャー |
| Quant-Analyst | gpt-4.1 | テクニカル指標、統計パターン、VaR／ES などのリスク指標、成功確率 | クオンツリサーチャー |
| Risk-Manager | gpt-4.1 | ポジションサイズ、最大ドローダウン、市場リスクエクスポージャー、総合リスクスコア | リスクマネージャー |
| Execution-Agent | gpt-4.1 | 注文タイプ、数量、エントリー価格、ストップロス、テイクプロフィット、有効期限 | 執行トレーダー |
| Sentiment-Agent | gpt-4o-mini | ニュース／SNS のセンチメントスコア（0-1）、テーマ抽出、逆張りシグナル | センチメントアナリスト |

### 2.2 パイプライン：Director のハンドオフ機構

エントリーポイント `AutoHedge.run(task)` が行うことは1つだけ：ユーザータスクを Director に渡す。Director は swarms フレームワークの `handoffs` パラメータ経由で下流エージェントを保持する。

```
ユーザータスク（自然言語）
  │
  ▼
Trading-Director ──handoff──▶ Quant-Analyst ──handoff──▶ Risk-Manager ──handoff──▶ Execution-Agent
  │ テーゼ生成                    │ 数値検証                    │ サイジング＆リスク評価      │ 構造化注文
  ▼
出力：会話ログ全体（Conversation）
```

実装上の要点：

1. **銘柄リストは事前定義しない。** Director は自然言語タスクから銘柄コードを抽出する（専用の `DIRECTOR_TICKER_DISCOVERY_PROMPT` が「JSON 配列のみを返す」と指示）。タスクは「Analyze NVDA for a 50k allocation」でも「原油市場のセンチメントを分析して」でもよい。
2. **各エージェントは `max_loops=1`。** 各ステージはモデルを1回だけ呼び、自己反復を行わない。パイプラインは一方向で、フィードバックループは存在しない。
3. **ハンドオフ内容には明示的な契約がある。** Risk-Manager は「Stock, Thesis, Quant Analysis」の3セクションを受け取り、Execution-Agent は「Stock, Thesis, Risk Assessment」を受け取る。各ステージは構造化フィールドを出力するよう指示される：Quant は `technical_score / volume_score / trend_strength / volatility / probability_score / key_levels(support, resistance, pivot)`、Risk はポジションサイズ・最大ドローダウン・エクスポージャー・リスクスコア、Execution は注文タイプ・数量・エントリー価格・ストップロス・テイクプロフィット・time-in-force。
4. **時間認識プロンプト。** 起動時に現在日時を全システムプロンプト末尾へ注入する（"Current date and time (use this as now)"）。モデルが古い情報で判断するのを防ぐ。
5. **全工程の記録。** `Conversation` オブジェクトが各ロールの出力を記録し、`output_type` の `list / dict / str` で監査用に取り出せる。

### 2.3 ツール層

`autohedge/tools/` がデータ・執行ツールを提供し、`tools_registry.py` で一括登録する。

| ツール | 機能 | 依存 |
|--------|------|------|
| `search_tokens` | Solana トークン検索 | Jupiter API |
| `get_token_price` | mint アドレスから USD 価格を取得 | Jupiter Price API V3 |
| `execute_trade` | 署名済みトランザクションのオンチェーン送信 | Jupiter Ultra API + solders |
| `get_holdings` | ウォレット保有資産の照会 | Jupiter Ultra API |
| `get_order` | 注文ステータス照会 | Jupiter Ultra API |
| `exa_search` | ウェブ上のニュース／センチメント検索（Sentiment-Agent に接続） | Exa |
| `yahoo_api` / `polygon_api` | 米株式市場データ（yfinance、Polygon） | yfinance、httpx |

Solana の執行経路は完全なものになっている：`WALLET_PRIVATE_KEY` は `solders` 経由で Keypair として読み込まれ、`execute_trade` は Jupiter Ultra の「見積もり→署名→送信」フロー（`/ultra/v1`）を実行する。注意点：現バージョンではこれらの執行ツールは本エージェントのツールリストに接続されておらず、本エージェントの出力は注文パラメータのテキストに留まる。実執行の最終段階は手動または追加開発での接続が必要である。

## 3. 設計哲学

コードとドキュメントから6つの原則を抽出できる。

### 3.1 組織そのものをコードにする

人間のヘッジファンドは職能別に分業する。PM が方向を決め、クオンツがシグナルを出し、リスクが上限をかけ、トレーダーが執行する。AutoHedge はこの組織をエージェントトポロジーへ直接マッピングする。役割はプロンプトで、プロセスはハンドオフで、報告関係は一方向パイプライン（`max_loops=1`）で定義される。組織設計がプロンプトエンジニアリングになる。

### 3.2 リスク優先（Risk-First）

リスクエージェントはクオンツと執行の間に位置し、パイプラインの必須ノードである。注文が生成される前に、ポジションサイジング、ドローダウン見積もり、エクスポージャー評価を必ず通過する。README の原文：「Risk-First Design: Built-in risk management and position sizing before any execution.」。「シグナル先行・リスク事後」の素人パターンとは逆で、リスクの関所は執行の前に配置されている。

### 3.3 単一責任と構造化ハンドオフ

各エージェントは1つのことだけを行い、入出力フォーマットはプロンプトに明記される。ハンドオフは固定フィールド（ポジションサイズ、ストップロス、確率スコアなど）で行われ、下流のプロンプトには「何を受け取るか」が明示される。エージェント間通信を自由な対話から制約されたプロトコルへ降格させ、ハルシネーションの波及を抑える設計である。

### 3.4 タスク駆動・銘柄プールの事前定義なし

銘柄のホワイトリストは存在しない。Director がタスクから銘柄を発見する。タスクが「原油市場の分析」ならマクロ経路へ、「NVDA の分析」なら個別銘柄経路へ進む。柔軟性は設定ではなくプロンプトから生まれる。

### 3.5 モジュラーな拡張性

プロンプトは `prompts.py`（202行）、エージェント定義は `workers.py`（93行）に集約され、ツールはレジストリ経由で登録される。取引所の追加＝ツール関数の追加、役割の追加＝エージェント定義の追加と handoffs リストへの追記。モジュール境界はファイル境界と一致する。

### 3.6 機関レベルの監査可能性

全工程が loguru で記録され、会話は Conversation オブジェクトに保持され3形式でエクスポートできる。「機関の信頼性」が設計目標であり、全判断が追跡可能で、障害の再生が可能である。

## 4. 実践チュートリアル

### 4.1 インストール

```bash
pip install -U autohedge
```

Python 3.10+ が必要。ソースからのインストールも可能：

```bash
git clone https://github.com/The-Swarm-Corporation/AutoHedge.git
cd AutoHedge
pip install -r requirements.txt
```

### 4.2 環境変数の設定

プロジェクトルートに `.env` を作成する（`.env.example` 参照）：

```bash
# Jupiter API：トークン価格・検索ツール用。https://portal.jup.ag でキーを取得
JUPITER_API_KEY=あなたのJupiterキー

# LLM（swarms フレームワークは OpenAI 互換インターフェースを要求）
OPENAI_API_KEY=あなたのOpenAIキー
ANTHROPIC_API_KEY=あなたのAnthropicキー

# エージェント作業ディレクトリ
WORKSPACE_DIR="agent_workspace"

# Solana 取引：実際に注文を出す場合のみ入力
WALLET_PRIVATE_KEY=あなたのSolana秘密鍵
```

補足：本エージェントは gpt-4.1 と gpt-4o-mini を使用する。CLI 起動時に `OPENAI_API_KEY` が未設定だと警告が表示される。Jupiter キーは価格・検索ツールが使用する。キーがないと未認証リクエストになるか失敗する。

### 4.3 方法1：CLI 対話モード

```bash
autohedge
```

REPL（rich レンダリング）が起動し、バージョン・作業ディレクトリ・使い方・直近5件のタスク履歴（`~/.autohedge/recent_tasks.txt` に保存）が表示される。

使用例：

```
> Analyze NVDA for a 50k allocation
```

任意のタスクを入力すると1サイクルのトレード分析が実行される。結果はパネル表示される（2,000文字に切り詰め）。コマンド：

- `help` / `?` / `h`：ヒント表示
- `quit` / `exit` / `q`：終了

その他：`autohedge --version`、`autohedge help`。

### 4.4 方法2：Python API

```python
from autohedge import AutoHedge

trading_system = AutoHedge(
    name="my-fund",
    description="Private Hedge Fund",
)

task = "Analyze the sentiment of oil market and provide a thesis on the overall market position and expected trends."
result = trading_system.run(task=task)
print(result)
```

`AutoHedge` のパラメータ：

| パラメータ | デフォルト | 用途 |
|-----------|-----------|------|
| `name` | "autohedge" | システム名 |
| `description` | "fully autonomous hedgefund" | システム説明 |
| `output_dir` | "outputs" | 出力ディレクトリ |
| `output_type` | "list" | 戻り値形式：`list` / `dict` / `str` |

### 4.5 最小限のカスタマイズ：モデル変更・ツール追加・プロンプト編集

変更はすべて `workers.py` に集中する：

```python
# モデル変更：gpt-4.1 を任意の OpenAI 互換モデル名に置き換える
risk_agent = Agent(
    agent_name="Risk-Manager",
    system_prompt=RISK_PROMPT,
    model_name="gpt-4o",        # ← ここを変更
    max_loops=1,
)
```

ツール追加：`tools/` 配下に関数を書き、`tools_registry.py` の `get_tools()` に登録し、対象エージェントの `tools=[...]` に関数名を追加する。

プロンプト編集：`prompts.py` の対応する定数を直接編集する。Quant にシャープレシオの追加出力を求める場合は `QUANT_PROMPT` に1行追記すればよい。

### 4.6 1サイクルの実行結果

タスク「Analyze NVDA for a 50k allocation」の場合：Director が銘柄 NVDA を発見し市場テーゼを生成、Quant が指標スコアとサポート／レジスタンスを出力、Risk が推奨ポジションサイズとリスクスコアを出力、Execution がストップロスとテイクプロフィット付きの注文パラメータを出力する。`Conversation` には各ロールの完全な出力が保持され、`output_type="dict"` でロール名ごとに取り出せる。

## 5. 考察と結論

### 5.1 本プロジェクトの真の価値

AutoHedge の価値は「儲かること」ではない。**マルチエージェントシステムが完全な業務プロセスをどう組織化するか**への読みやすい回答である。1,600行のコードの中に、役割定義、通信プロトコル、プロセスオーケストレーション、監査ログがそれぞれ所定の位置にある。エージェントオーケストレーションを研究する人、独自のマルチエージェントシステムを設計する人にとって、論文より具体的な教材である。

### 5.2 アーキテクチャ上の3つの強み

1. **リスク関所の前置。** リスクエージェントはパイプラインの必須ノードであり、この原則は全ステージのプロンプト契約に書き込まれており、正しい。
2. **明示的なハンドオフ契約。** 各エージェントが「何を受け取り、何を出力するか」を把握している。「エージェントの自由な議論」よりはるかに安定する。
3. **時間認識。** 全プロンプトへの現在時刻注入は1行のコストで、モデルが訓練データの知識の古さで判断するのを防ぐ金融特有の工夫である。

### 5.3 限界とリスク（直視すべき事実）

1. **実験的性質。** バージョン 0.1.5、Beta ラベル。本エージェントは実執行ツールに接続されておらず、`WALLET_PRIVATE_KEY` は experimental スクリプトでのみ使用される。README は Pydantic 構造化出力を謳うが、実装は文字列出力である。
2. **バックテスト枠組みの不在。** どの戦略も運用前に履歴検証が必要だが、プロジェクトは提供していない。
3. **リスクは「助言」であって「制約」ではない。** ポジションサイズもストップロスも LLM が生成し、コード上に口座レベルのハードリミット（例：1日の最大損失による遮断）はない。LLM はプロンプトインジェクションでポジションを拡大させられる可能性がある。
4. **フィードバックループの欠如。** パイプラインは一方向で、Quant の結果が Director に戻りテーゼを修正することはない。誤りは自己修正されない。
5. **単一フレームワーク依存。** swarms の Agent／Conversation 抽象に深く結合しており、移行コストが高い。
6. **コスト。** 1サイクルで gpt-4.1 級モデルを4〜5回呼ぶ。高頻度実行はコストがかさむ。

### 5.4 適用場面

- マルチエージェントアーキテクチャとプロンプトエンジニアリングの教材
- 自律型トレーディングシステムのプロトタイプ起点（バックテスト・ハードリミット・執行接続を上に載せる）
- 金融意思決定プロセスにおける LLM の誤差伝播の研究用プラットフォーム

非適用場面：そのまま実資金で実運用すること。

### 5.5 結論

AutoHedge はヘッジファンドを1つの Python パッケージに詰め込んだ。5つの役割、1本のパイプライン、1つのハンドオフプロトコル。リスク優先、単一責任、構造化ハンドオフ、タスク駆動、監査可能性という設計哲学は、どのマルチエージェントシステムにも応用できる。実装の完成度は同時に全員に教える。「アーキテクチャが正しいこと」と「システムが信頼できること」の間には、バックテスト、ハード制約、監視、そして大量のエンジニアリングがある。前者は AutoHedge が示した。後者は自分で埋める必要がある。

## 6. 参考リンク

- リポジトリ：https://github.com/The-Swarm-Corporation/AutoHedge
- Swarms フレームワーク：https://github.com/The-Swarm-Corporation/swarms
- Jupiter API ドキュメント：https://dev.jup.ag
- Jupiter キー申込：https://portal.jup.ag
