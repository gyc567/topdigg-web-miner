---
title: 'MetaRSI/RSI-Harness 深層解析：自分でツールを作れるAIツール'
date: "2026-09-09"
description: "CosmosMind-ai/RSI-Harnessの深層解析：Meta-Recursive Self-Improving System。GenomeはAIのharness設定をバージョン化管理・共有・自動生成可能なディレクトリに変換する。harness-rsiは自らの能力で構築された、ユーザーの履歴を読んでパーソナライズされたGenomeを生成するメタツール。"
tags:
  - RSI-Harness
  - MetaRSI
  - Genome
  - 再帰的自己改善
  - Pi Coding Agent
  - AI Agent
  - プロンプトエンジニアリング
  - オープンソース
categories:
  - 深層解析
  - AIツール
  - オープンソース
  - 再帰的自己改善
---

# MetaRSI/RSI-Harness 深層解析：自分でツールを作れるAIツール

「AI agentのチューニングは今日、settings.json、CLIフラグ、貼り付けたプロンプト、'あのプロンプトが良かった気がする'といった風にデータが散らばっている——どれもバージョン化管理できず、diff也不能、再現性もなければ、他人への受け渡しもできない。」

これはRSI-Harness開発者の開場白だ。このプロジェクトは根本的な問いに答えようとする：**AIが自らの重みを編集できるなら、なぜ自らのharnessを編集できないのか——手で書くのと同じ方法で。**

その答えがRSI-Harnessだ。

---

## 一、作品背景とコアポジショニング

### 名前の意味

**RSI-Harness** = Recursive Self-Improving Harness。二つの再帰レベルを含む：

- **第一レベル**：Pi coding agentをベースに使用、その上にGenomeという設定レイヤーを追加
- **第二レベル**：harness-rsiはGenome内の特殊な存在で、その出力は他のGenome——自らの能力で構築され、ユーザーの履歴を読んでパーソナライズされたharnessを自動生成するメタツール

**MetaRSI**は論文タイトル内の名前で、「メタ再帰的自己改善システム」を指す。モデルの重みを編集するのではなく、harnessが自らの設定を編集すること——手で書くのと同じ方法で。

### 解決する問題

今日のAI agentチューニングのジレンマ：

| 現状 | 問題 |
|------|------|
| settings.json | 部分的なフィールドのみ |
| CLIフラグ | 毎度打ち込みが必要 |
| 貼り付けたプロンプト | バージョン管理不可 |
| 「覚えてる」 | 完全再現不可 |

RSI-Harnessの解決策：すべてのharness設定（システムプロンプト、ツールセット、スキル、MCPサーバー、拡張、ランタイムポリシー、メモリ、キーボードショートカット、テーマ）を1つのディレクトリに収束させ、それを**Genome**と呼ぶ。コンテキスト切り替えはGenome切り替え。

### コアアーキテクチャ

```
Pi coding-agent ← 不変Core、forkなし
     ↓
Genome adapter ← RSI-Harnessプロジェクト自体
     ↓
harness-rsi ← Genomeで、その出力は他のGenome
```

RSI-Harnessは**Piの公開設定表面上へのGenome設定レイヤーを追加することだけ**を行う。

---

## 二、コアコンセプト：Genomeとは

### 2.1 定義

Genomeは完全で、獨立して配布可能なharness設定ディレクトリ。

```
my-genome/
  genome.json              # manifest + コンポーネントリスト
  components/              # 12個のコンポーネント設定
  contracts/               # 各コンポーネントのコントラクト
  skills/                  # バンドルスキル
  extension/               # バンドル拡張
```

12のコンポーネント、フィールド所有権は相互排他的。境界外の書き込みはロード時に失敗する。

### 2.2 マージセマンティクス：置換而非継承

Genome設定は**patch、置換ではない**：

- フィールド欠落 → baseを継承（最終的にはPiデフォルト）
- フィールドが`null` → 明示的に削除、Piに返す
- フィールドに値あり → 上書き；オブジェクトは再帰マージ、配列は全体置換

`model`コンポーネントだけを宣言するGenomeも、Piの完全なシステムプロンプトとツールセットを得る。**1つのフィールドを変えるためにharness全体を書き直す必要はない。**

### 2.3 2つの組み込みGenome

| Genome | 役割 |
|--------|------|
| `coding` | コード書きharnessの例示設定 |
| `harness-rsi` | 他のGenomeを生成、GEEコマンド`gee`で起動 |

---

## 三、harness-rsi：自らの手段で自分を構築

### 3.1 なぜGenomeだけで実現可能か

harness-rsiに必要なものはすべて、Genomeの既存コンポーネントが提供：

| 必要物 | 使用コンポーネント |
|--------|-------------------|
| 位置づけと強制フロー | `instructions` `append_system_prompt` |
| 方法論ドキュメント | `skills`、ファイルベースPiスキル |
| session読取ツール | `tools`（Piはデフォルトで3つ無効） |
| 3つの対話ツール | `integrations.extensions`、Genome自有`.ts` |
| 下書きと長会话 | `policies` scratchpadとcompaction |
| 無関係グローバルスキル遮断 | `resources.isolate: true` |

**`src/`にharness-rsi専用のコードは1行もない。** これは「Genomeはすべてを構成できる」という不変量の証明。

### 3.2 `resources.isolate: true`の効果

実測：隔離なしでは`~/.agents/skills`の58個のスキルがすべてsystem promptに入り、36 KB；隔離後は`genome-authoring`のみ、7 KB。厳密に定義されたワークフローのagentにとって、無関係な57個のスキルはノイズであり干渉源。

### 3.3 GEE：Genome Expression Engine

GEEはharness-rsiのフロントエンドコマンド：

```bash
gee  # rsih :harness-rsi と同等
```

GEEのアプローチ：**何のシステムプロンプトが欲しいか聞かない、実際に何をしたかを読み取る。**

対話フロー：

1. **まずシナリオを聞く**：このGenomeは何をするためのもの？自分の言葉で詳しく
2. **session範囲を聞く**：どのharnessの履歴をスキャンするか
3. **作業ディレクトリでsessionをグループ化**
4. **ユーザーがワークスペースを選択**
5. **agentが自ら分析**：まずbashで集計（ツール呼び出しヒストグラム、高頻コマンド、頻出パス）
6. **書く前に計画を見せる**：Genome全体を正文形で説明
7. **確認後にのみファイルを書き込み**

### 3.4 設計原則

> **agent自体が本当に手にできないものだけをコードで書く。**

拡張機能は3つのツールだけ、なぜなら本当にagentにできないことは3つだけだから。**戦略を変えるのにコードを変える必要はない。**

---

## 四、12コンポーネント詳解

| コンポーネント | 所有フィールド |
|----------------|---------------|
| instructions | `system_prompt`, `append_system_prompt` |
| tools | 組み込みツールon/off、 引数 narrowing、生成ツール |
| skills | インラインスキルとPiスキルファイル |
| commands | インラインスラッシュコマンド |
| model | デフォルトprovider/model |
| runtime | ツール実行、steering、maxターン |
| policies | ツールポリシー、scratchpad、compaction |
| integrations | Pi拡張とstdio MCPサーバー |
| appearance | テーマアセット、テーマ選択 |
| settings | Pi settings.jsonのすべてのフィールド |
| keybindings | Pi keybindings.jsonのすべてのバインディング |
| resources | 自動リソース発見の範囲（isolate） |

---

## 五、安装と使用チュートリアル

### 5.1 要件

- Node 22.19+
- bun推奨（単一ファイルバイナリにコンパイル）

### 5.2 安装

```bash
git clone https://github.com/CosmosMind-ai/RSI-Harness.git
cd RSI-Harness
./install.sh
```

### 5.3 基本的な使用法

```bash
rsih                           # 起動、piと同等
rsih --resume                  # 最後のセッション再開
rsih -p "Review the workspace" # 単発コマンド
```

### 5.4 Genome起動

```bash
rsih :coding                   # コロン略式
rsih +coding                   # プラス
```

### 5.5 GEEで新Genome生成

```bash
gee  # rsih :harness-rsi と同等
```

### 5.6 Genome管理

```bash
rsih genome list               # インストール済みGenome一覧
rsih genome validate ./my-genome  # Genome検証
rsih genome install coding     # ファクトリーバージョンに戻す
```

---

## 六、設計哲学

### 6.1 設定は第一級市民

Genomeはすべての設定をバージョン化管理・diff・共有可能なディレクトリに収束させ、harness設定を真のエンジニアリング資産にする。

### 6.2 不変Core、設定がすべて

PiのCoreは不変。RSI-Harnessはforkせず、公開設定表面のみを使用。PiのたびにアップグレードRSI-Harnessも自動新能力獲得。

### 6.3 自己参照メタツール

harness-rsiはGenome自らのコンポーネントで構築され、**専用コードは1行もない**。これが「RSI」の厳密な実践：ツールは自らの手段で自らのを構築する。

### 6.4 証拠は自己叙述に優先

GEEは「何のharnessが欲しいか」聞かず、代わりに「実際に何をしたか」を読む。証拠は「これは本当か」に答え、「これが望みだったか」には答えない。打架将自己动手是中国是中国中国的，是中国，是中国，是中国，是中国，是中国是中国是中国是中国是中国是中国是中国是中国是中国是中国。

### 6.5 シードは更新するが、上書きしない

ユーザーが編集なければ → 自動更新。編集あれば → 警告のみ。别人的同名Genome → 上書きしない（genome_id異なるため）。

### 6.6 制約は安定性を生む

12コンポーネント、境界外書き込みはロード時失敗。コンポーネントは自分のものしか管理できない。

---

## 七、コア观点と結論

### 观点1：Harness設定はバージョン化されたエンジニアリングオブジェクトであるべき

コードはcode reviewできるが、「あのいいプロンプト」はdiffできない。Genomeはこれを可能にした。**これが真のAI agentエンジニアリングの始まり。**

### 观点2：Meta-RSIの正しい形は重み編集ではなく設定編集

再帰的自己改善はモデルが自らの重みを編集するのではなく（危険で予測不能）、harnessが自らの設定を編集すること（安全で監査可能でロールバック可能）。RSI-Harnessはこれを証明した。

### 观点3：Evidenceからのパーソナライゼーションが次世代AI設定の方向

GEEのアプローチは実際の行動からパターンを抽出——何を言ったかより、何をしたかの方が信頼できる。証拠のない設定フィールドは空のまま——空はPiデフォルトを継承し、デフォルトは常に安全な答え。

### 观点4：自らの手段で自らのを構築することは可能

harness-rsiはこれを証明：拡張機能は3つのツールだけ（`scan_workspaces`、`choose_workspaces`、`ask_user_question`）。それ以外はすべてスキルとsystem promptのテキストで駆動。**戦略を変えるのにコードを変える必要はない。**

### 观点5：隔離はプロフェッショナルagentの必要条件

58個の無関係スキルがpromptを満たすと信号が埋もれる。`resources.isolate: true`でpromptはGenomeが宣言したものだけを含む。厳密に定義されたワークフローのagentにとって、無関係な入力はノイズではなく安定性の敵。

---

## 八、現在の状態と制限

### 実装済み

- 端的に使用可能なGenome構築（12コンポーネントがPiの全設定表面をカバー）
- inherit-by-defaultマージセマンティクス
- settingsコンパイルレイヤー
- ディレクトリバンドルと配布
- シード更新メカニズム
- harness-rsiが複数のsession storeから対話的にGenome生成

### 未実装

- 一言リモートインストール（現在はいずれかのみ）
- 公開前編集gate
- Codex session store統合（1341ファイル / 2.9 GB）

---

## 九、まとめ

RSI-Harnessは根本的な問いに答えた：AI agentのharness設定をコードのようにエンジニアリング資産として扱うには？

答え：**ディレクトリ、Genomeにする。**

- バージョン化管理・diff・再現・共有可能
- 12コンポーネント全設定表面カバー、inherit-by-defaultマージ
- harness-rsi自らの手段で自らのを構築、ユーザーの実際の行動からパーソナライズされたGenomeを生成
- Pi Coreをforkせず、公開設定表面のみ使用

**ツールは自らの手段で自らのを構築し、証拠而非自述で自らを知り、設定而非重みで再帰的改善を実現する。** これがMeta-RSIのあるべき姿。

プロジェクト：https://github.com/CosmosMind-ai/RSI-Harness
論文：https://www.cosmosmind.ai/research/metarsi-v1.pdf
HuggingFace：https://huggingface.co/CosmosMind/RSI-Harness

---

以上、最後まで読んだなら、ぜひ「いいね」「在看」「シェア」ってくれると嬉しい。プッシュ通知をすぐに受け取るには、フォローもお願い。良い文章，下次再见。

微信公眾號「比特财商」首发。
