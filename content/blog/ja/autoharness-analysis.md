---
title: 'AutoHarness 徹底解説：「小モデル + Harness」が「大モデル」を上回る仕組み——LLM エージェント向けコードハーネスを自動合成するオープンソース Rust ライブラリ'
description: "gyc567 が公開した AutoHarness を徹底解説——Rust 製のライブラリ兼 CLI ツールで、LLM エージェント向けのコードハーネスを自動的に「合成・最適化」します。AutoHarness 論文（arXiv:2603.03329）の手法を再現し、木探索 + Thompson サンプリングでハーネスコードを反復改良。145 の TextArena ゲームで平均 14.5 イテレーションで 100% の合法アクション率に到達し、「小モデル + Harness > 大モデル」という主張を実証しています。コア思想、アーキテクチャ、設計哲学から、チュートリアル、機能一覧、結論までを 1 記事で網羅。"
date: "2026-08-04"
author: "TopDigg Research Team"
tags: ["AutoHarness", "LLM Agents", "Code Harness", "Tree Search", "Thompson Sampling", "Rust", "AI Safety", "TextArena", "LLM", "Sandbox"]
categories: ["Deep Dive"]
keywords: ["AutoHarness", "LLM エージェント", "コードハーネス", "木探索", "Thompson サンプリング", "Rust", "AI 安全性", "TextArena", "コード合成", "サンドボックス実行", "LLM Agent"]
---

# AutoHarness 徹底解説：「小モデル + Harness」が「大モデル」を上回る仕組み——LLM エージェント向けコードハーネスを自動合成するオープンソース Rust ライブラリ

> コア思想：**LLM の外側に「コードのガードレール」を被せる方が、より大きなモデルに乗り換えるよりお得です。** AutoHarness は論文のアイデアを実行可能な Rust ライブラリ兼 CLI にしたものです。**木探索（Tree Search）+ Thompson サンプリング** で「ハーネスコード」——フィルタリング（Filter）・検証（Verifier）・提案（Propose）・ポリシー整合（Policy）を担うコード——を自動生成し、反復最適化。エージェントのアクション空間を制約し、「合法なアクション」だけを取らせます。論文の中核的発見 **"Small model + harness > Large model without harness"（ハーネス付き小モデルは、ハーネスなしの大モデルに勝る）** を再現し、145 の TextArena ゲームで平均わずか **14.5 イテレーション**で **100% の合法アクション率**に収束します。LLM を置き換えるのではなく、説明可能で検証可能なコードの層でモデルの能力を最大限に引き出します。

---

## 1. プロジェクト概要

### 1.1 それは何か？

**AutoHarness** は Rust 製の**ライブラリ + CLI ツール**で、**LLM エージェント向けのコードハーネスを自動的に合成（synthesize）し、最適化（optimize）** します。[AutoHarness 論文（arXiv:2603.03329）](https://arxiv.org/abs/2603.03329)（Xinghua Lou ら）が述べた手法——**木探索 + Thompson サンプリングによるハーネスコードの反復改良**——を実装しています。

一言で言えば：**Automatically synthesize code harnesses for LLM agents**（LLM エージェント向けコードハーネスを自動合成する）。

### 1.2 基本データ

- リポジトリ：`https://github.com/gyc567/AutoHarness`
- Stars：**8**（初期段階のプロジェクト、主に単独メンテナー）
- Forks：1
- 言語：**Rust**（Tokio 非同期、Serde シリアライズ、Clap CLI）
- 作成日：2026-03-21
- 最終プッシュ：2026-03-29
- ライセンス：**MIT**
- コミット数：18
- バージョン：`autoharness = "0.1.0"`
- 二面性：インストール可能な CLI（`autoharness synthesize/evaluate/run/benchmark/config`）と、自前プロジェクトに組み込める Cargo 依存関係

### 1.3 何を解決するのか？

LLM エージェントが実環境でタスクを実行する際、最大の痛点の一つは**「自由すぎる」こと**です。モデルの出力アクションが、非合法・範囲外・非効率・ビジネスポリシー逸脱になる可能性があります。従来の対処——プロンプトで繰り返し「言い聞かせる」、またはより大きなモデルに総当たりで乗り換える——はコストが高く信頼性に欠けます。

AutoHarness の答えは、**エージェントのために強く制約するハーネスコードを生成すること**。まるで細やかな「監督者」のように、モデルのアクションが実行される前に**フィルタリング・検証・提案・ポリシー整合**を行います。そして肝心なのは、この工程が**自動**であること——人間が手書きするのではなく、アルゴリズムが自分で探索し、磨き上げ、最適化し尽くします。

---

## 2. コア思想

### 2.1 驚くべき実証的結論

> **Small model + harness > Large model without harness（ハーネス付き小モデル > ハーネスなしの大モデル）。**

これは AutoHarness が証明しようとし、145 の TextArena ゲームで検証した中核的主張です。「**より強いエージェント＝より大きなモデル**」という素朴な直感を真っ向から覆し、**ガードレール（ハーネス）はしばしば素のパラメータ数よりも価値がある**ことを示します。

### 2.2 三本柱

設計全体は三本の柱に支えられています：

- **木探索（Tree Search）**：「より良いハーネスの探索」をコード変異の木を登る登山としてモデル化——ルートから出発し、候補ノードを次々に生み出し、LLM が合法アクションを取れるノードへ収束。評価が悪ければバックトラックして分岐し、別の枝へ。
- **Thompson サンプリング（Thompson Sampling）**：多数のハーネス変異の中から「**探索と活用（exploration vs. exploitation）」の知的なバランス**を取る——効いている案に集中しつつ、より強い変異を見逃さない。ベイズ的思考で各枝の期待成功率を不確実性込みで狙います。
- **サンドボックス実行（Sandboxed Execution）**：すべての候補ハーネスは隔離環境で実行され、メモリ / 時間 / ファイルディスクリプタ / 出力サイズ / ネットワークのオンオフなど、設定可能なリソース制限付き——探索は大胆に試行錯誤できても、悪意あるコードや暴走コードがホストを傷つけることはありません。

### 2.3 マインドセットの転換

ここから浮かび上がる全体像：**LLM は「意図」を提供し、ハーネスは「ガードレール」を提供する**。意図は自由奔放でよく、ハーネスがそれを合法・安全・実行可能なアクションに翻訳します。この組み合わせは、単独の大きなモデルに頼るより優れています。

---

## 3. アーキテクチャ（モジュールとデータ構造）

### 3.1 ソースツリー

```
AutoHarness/
├── src/lib.rs         # core、engine、memory、sandbox、templates をエクスポート
├── benches/            # ベンチマーク
├── examples/           # サンプルコード
├── install/            # install.sh とプラットフォーム別バイナリ（darwin-x86_64、linux-x86_64）
├── memory/             # ハーネスを永続化する MemoryStore
├── tests/              # 統合テスト
├── Cargo.toml
├── autoharness.toml    # デフォルト設定
├── README.md / README_zh-CN.md
└── TUTORIAL.md / TUTORIAL_zh-CN.md
```

### 3.2 コアモジュール

- **`core`**：`State`・`Action`・`Harness` の 3 trait と `HarnessType` 列挙型を定義
- **`engine`**：`CodeSynthesisEngine`、`SynthesisConfig`、`Evaluator` trait、木探索
- **`sandbox`**：`SandboxExecutor`、`SandboxConfig`、リソース制限
- **`memory`**：`MemoryStore`、`MemoryConfig`（永続ストレージ）
- **`templates`**：`FilterTemplate`、`VerifierTemplate`、`PolicyTemplate`、`EnsembleTemplate`

### 3.3 三つのコア trait

```rust
pub trait State: Serialize + Clone + Send + Sync {
    fn to_prompt(&self) -> String;   // 状態を LLM 用プロンプトに変換
    fn validate(&self) -> Result<()>;  // 状態が合法かどうかを検証
}

pub trait Action: Serialize + Clone + Send + Sync + PartialEq {
    fn to_string(&self) -> String;         // アクションの文字列表現
    fn from_string(s: &str) -> Result<Self>; // 文字列からアクションを解析
}

pub trait Harness<S: State, A: Action>: Send + Sync {
    fn harness_type(&self) -> HarnessType;   // Filter / Verifier / Policy のいずれか
    fn evaluate(&self, state: &S, action: &A) -> Result<bool>; // アクションは合法か？
    fn propose_actions(&self, state: &S) -> Result<Vec<A>>;      // 候補アクションを提案
}
```

### 3.4 合成エンジン設定（デフォルト値）

`SynthesisConfig` は探索アルゴリズムの操作盤。デフォルト値が収束目標を物語っています：

- `max_iterations: 50`（最大イテレーション数）
- `convergence_threshold: 0.95`（合法率 95% で停止）
- `max_depth: 10`（木探索の最大深さ）
- `mutations_per_node: 3`（ノードあたり最大 3 変異）
- `exploration_constant: 1.414`（Thompson サンプリングの探索定数）
- `adaptive_sampling: true`（サンプリングを適応的に調整）
- `target_iterations: 20`（目標イテレーション数）
- `min_improvement: 0.01`（許容する最小改善量）
- `max_nodes: 1000`（最大ノード数）

### 3.5 サンドボックス設定（デフォルト値）

`SandboxConfig` は候補コードの試行実行における安全境界を定義します：

- `memory_limit_mb: 256`（メモリ上限 256 MB）
- `time_limit_ms: 5000`（1 回の実行タイムアウト 5 秒）
- `max_file_descriptors: 64`（最大オープンファイルディスクリプタ数）
- `max_output_size: 10MB`（最大出力）
- `enable_network: false`（デフォルトでネットワーク OFF）

---

## 4. 設計哲学

### 4.1 規模よりガードレール優先

「より大きなモデルに乗り換える」軍拡競争はせず、ガードレールを第一級の市民として扱います。ハーネスは**読みやすく・検証可能で・監査可能なコード**であり、「モデルの挙動が期待通りか」を**決定的**な検査に変え、LLM ブラックボックスへの盲信を減らします。

### 4.2 一本の草ではなく、一本の木を育てる

グリッドサーチでもランダムパッチでもありません。**木探索 + サンプリング**が**変異空間を方向性のある山登り**で進みます——手書きの粗さも、無作為試行の指数関数的な無駄も避け、複雑さを有界で調整可能な探索空間（`max_nodes=1000`、`max_depth=10`）に圧縮します。

### 4.3 檻の中で試行錯誤する

ハーネスの合成は未検証コードの試行実行を繰り返すことを意味し、そのコードは**信頼できない**可能性があります。そこで「大胆な最適化」と「サンドボックス制限」を一体化します：**リソース制限 / 強制タイムアウト / システムコールフィルタリング / 入力検証**により、自動化された探索は機械に任せて自己反復しても安全になります。

### 4.4 ツールファーストの哲学

論文の再現であるだけでなく、**AI コーディングエージェント（OpenCode/CloudCode）に組み込めるツール**です。README には「ワンセンテンス・クイックスタート」があり、AI コーディングエージェントにプロンプトを 1 文渡すだけでハーネス合成の流れ全体が始まります。これは純粋な研究ではなく、**開発者ツールとしての製品指向**です。

---

## 5. ステップバイステップ・チュートリアル

### 5.1 CLI のインストール（1 コマンド）

```bash
curl -fsSL https://raw.githubusercontent.com/gyc567/AutoHarness/main/install/install.sh | bash
```

または jsDelivr CDN 経由：

```bash
curl -fsSL https://cdn.jsdelivr.net/gh/gyc567/AutoHarness@main/install/install.sh | bash
```

`~/.local/bin/autoharness` にインストールされ、確認：

```bash
autoharness --version
# autoharness 0.1.0
```

> 対応プラットフォーム：macOS Intel ✅、macOS Apple Silicon（x86_64 バイナリを実行）、Linux x86_64（ソースからビルド）、Windows x86_64（ソースからビルド）。

### 5.2 Cargo ライブラリとして使う

`Cargo.toml` に追記：

```toml
[dependencies]
autoharness = "0.1.0"
```

### 5.3 CLI の 3 ステップ・ワークフロー

```bash
# 1) 合成（Synthesize）：木探索でハーネスを自動合成・最適化
autoharness synthesize --file my_harness.py --max-iterations 20 --stats

# 2) 評価（Evaluate）：ハーネスの良さを採点
autoharness evaluate --file my_harness.py --detailed

# 3) サンドボックス実行（Run）
autoharness run --file my_harness.py --input "test_state"
```

### 5.4 Rust で最小ハーネスを書く

状態とアクションを定義し、`Harness` trait を実装して、`CodeSynthesisEngine` で合成を駆動します：

```rust
use autoharness::{core::{State, Action, Harness, HarnessType}, engine::CodeSynthesisEngine};

// 1. ゲーム状態を定義
#[derive(Serialize, Clone)]
struct GameState {
    board: Vec<char>,  // 盤面
    turn: usize,       // 手番
}
impl State for GameState {
    fn to_prompt(&self) -> String { format!("board={:?} turn={}", self.board, self.turn) }
    fn validate(&self) -> Result<()> { Ok(()) }
}

// 2. アクションを定義
#[derive(Clone, PartialEq, Deserialize)]
struct Move { cell: usize }
impl Action for Move {
    fn to_string(&self) -> String { format!("move {}", self.cell) }
    fn from_string(s: &str) -> Result<Self> {
        Ok(Move { cell: s.trim_start_matches("move ").parse()? })
    }
}

// 3. ハーネスの良さを判定する評価器
struct GameEvaluator;   // アクション / 局面が合法かどうかを判定

// 4. 合成エンジンに、より良いハーネスを見つけさせる
let engine = CodeSynthesisEngine::new(Default::default());
// engine.synthesize::<GameState, Move>(&game, &harness) → より良いハーネスを返す
```

### 5.5 ワンセンテンス・キックオフ

（README の「ワンセンテンス・クイックスタート」：OpenCode / CloudCode などの AI コーディングエージェントにプロンプトを 1 文渡すだけで、全体の流れが始まります。）

### 5.6 テストを実行

```bash
cargo test
# test_synthesis / test_sandbox などの統合テストを含む
```

---

## 6. 機能一覧

- **3 つのハーネスモード**：Filter（アクションのフィルタリング）/ Verifier（条件の検証）/ Policy（ポリシー整合）
- **木探索 + Thompson サンプリング**：コード変異空間の効率的な探索
- **サンドボックス実行**：リソース境界（メモリ / 時間 / 出力 / ネットワーク）を設定可能
- **適応的最適化**：探索と活用のバランスを動的に調整
- **高性能**：平均 **14.5 イテレーション**で収束
- **CLI 5 コマンド**：`synthesize` / `evaluate` / `run` / `benchmark` / `config`
- **Cargo ライブラリ API**：`autoharness = "0.1.0"`
- **クロスプラットフォーム・インストーラ**：macOS/Linux に `curl | bash` 一発
- **設定ファイル**：`autoharness.toml`
- **メモリシステム**：`MemoryStore` でハーネスを永続化
- **ハーネステンプレート**：`FilterTemplate` / `VerifierTemplate` / `PolicyTemplate` / `EnsembleTemplate`
- **セキュリティ強化**：システムコールフィルタリング / タイムアウト強制 / 入力検証

---

## 7. 要点まとめ（所見と結論）

プロジェクトと論文を合わせて見ると、考える価値のあるポイントがあります：

1. **「ガードレールが規模に勝る」は、少なくとも制御可能な状況では成立**。AutoHarness の実測（145 の TextArena ゲーム、100% 合法アクション率）は、アクション空間が有限なタスクでは、信頼できるハーネスがあれば小モデルが大モデルのレベルに届き、費用対効果が非常に高いことを示しています。
2. **木探索はハーネス工学の「アップグレード近道」**。手書き（粗く、エッジケースを見逃しがち）ではなく、木探索に列挙させ、Thompson サンプリングに選ばせ、サンドボックスに失敗を吸収させる——これは「コードを書くこと」自体を最適化対象にする発想です。
3. **セキュリティと自動化は両立できる**。探索は信頼できないコードを試行実行する必要があるため、試行錯誤を隔離する必要があります。AutoHarness はこれをデフォルトの姿勢（`enable_network:false`、5 秒タイムアウト）として一体化しており、学ぶ価値のあるエンジニアリング感覚です。
4. **それは「パターン」であり、「終着点」ではありません**。モデルの基盤は移り変わりが速いですが、「ガードレールに制約され、コードで検証され、サンドボックスで保護される」という考え方は緩変数であり、どのモデルよりも長く生き残ります。
5. **ハーネスにもコストがあることを思い出させてくれます**。ハーネス自体に合成と継続的なメンテナンスが必要で、`max_nodes=1000` や適応的サンプリングの背後にある計算コストはタスクの複雑さに応じて増えます——つまり、アクション空間が小さく、制約が明確なタスクこそ「スイートスポット」です。

---

## 参考資料

- リポジトリ：`https://github.com/gyc567/AutoHarness`
- 論文：arXiv:2603.03329（Xinghua Lou et al., AutoHarness）
- TextArena ベンチマーク：google-deepmind/arena（145 のゲーム環境）
- Thompson サンプリング：探索と活用の古典的手法
- インストールスクリプト：`https://raw.githubusercontent.com/gyc567/AutoHarness/main/install/install.sh`
- デフォルト設定：`autoharness.toml`
- Cargo 依存関係：`autoharness = "0.1.0"`