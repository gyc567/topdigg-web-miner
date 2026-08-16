---
title: 'Soup：4GB ノートPC GPU で 8B LLM をファインチューニングする CLI ツール'
date: "2026-08-16"
description: "MakazhanAlpamys/Soup を徹底解説：LLM ファインチューニングを「ワンコマンド」で行う CLI ツール。Layer Streaming が 4GB GPU で Llama-3.1-8B を 119.6 tok/s でファインチューニングする仕組み、bit-exact テストによる正確性の証明、なぜ「警告ではなく拒否」を選ぶのか、測定文化に基づく設計哲学と完全チュートリアル"
tags:
  - Soup
  - LLM
  - ファインチューニング
  - LoRA
  - QLoRA
  - Layer Streaming
  - 機械学習
  - CLI
categories:
  - AI ツール
  - LLM ファインチューニング
  - オープンソース
  - CLI ツール
  - 機械学習
---

# Soup：4GB ノートPC GPU で 8B LLM をファインチューニングする CLI ツール

## 背景とプロジェクト紹介

LLM のトレーニングは今でも苦痛です。経験豊富なチームでさえ、時間の 30〜50% をインフラとの戦いに費やしています——壊れた GPU マシンへの SSH、バッチサイズの調整、ドライバのインストール、量子化フォーマットの試行——本来モデルを改善するために使うべき時間を。**Soup**（[github.com/MakazhanAlpamys/Soup](https://github.com/MakazhanAlpamys/Soup)）は、まさにその痛点を狙った CLI ファーストの LLM ファインチューニングツールです。キャッチコピーはたった一言：

> **Fine-tune and post-train LLMs in one command. No SSH, no config hell.**
> （ワンコマンドで LLM のファインチューニングとポストトレーニング。SSH 不要、設定地獄なし。）

Soup が注目を集めたのは、フラッグシップ機能 **Layer Streaming（レイヤー・ストリーミング）** のおかげです：**4GB のノートPC GPU で 8B モデルをファインチューニング**——Llama-3.1-8B-Instruct + NF4 を RTX 3050 Laptop 4GB で実測 **119.6 tok/s、ピーク VRAM 3.32 GB**、通常の常駐トレーニングと**ビット単位で完全一致（bit-exact）**。この結果は H100 でも独立に再現されました（113.00 tok/s、同じ 3.32 GB）。

Soup は Apache-2.0 のオープンソース、Python 3.10–3.12、現行バージョン v0.73.2、PyPI パッケージ `soup-cli` として配布されています。開発は 4GB ノートPC 一台で行われており、作者自身がこう言っています：**だからこそ、ドキュメントのすべての性能数値は「主張」ではなく「測定」なのだと。** この測定文化は Soup のドキュメント、ベンチマーク記録、論文のすべてに貫かれています。

## プロジェクト概要

| 項目 | 内容 |
|---|---|
| 位置づけ | CLI ファーストの LLM ファインチューニング / ポストトレーニングツール（soup-cli） |
| コア訴求 | ワンコマンドファインチューニング：`soup init --template chat` → `soup train` |
| フラッグシップ機能 | Layer Streaming：4GB GPU で 8B モデルをファインチューニング（NF4 + ストリーミング、bit-exact） |
| 技術スタック | Python 3.10–3.12、Typer CLI、Pydantic v2 設定、Rich 出力 |
| コア依存 | 軽量コア 6 個（typer/rich/pydantic/pyyaml/huggingface-hub/plotext）；トレーニングスタックは `[train]` extra |
| ライセンス | Apache-2.0 |
| 現行バージョン | v0.73.2 |
| 対応ハードウェア | CUDA（推奨）、Apple Silicon MPS、CPU（実験的・非常に遅い） |
| 対応モデル | 任意の HuggingFace テキスト生成モデル（`AutoModelForCausalLM`）+ 100 以上の既製レシピ |
| 論文 | "Exact Layer Streaming: LoRA Fine-Tuning of an 8B Model on a 4 GB Laptop GPU"（Zenodo、v3） |

**設計の前提：** ファインチューニングに必要な時間・金銭・スキルの壁が AI の普及を阻んでいる。Soup の答えは——すべてを自動化し、「モデルをファインチューニングする」を、どんな開発者でも実行できる日常操作にまで落とし込むこと。

## コア設計哲学

### 1. 「すべての性能数値は測定であり、主張ではない」

Soup で最も目立つ原則です。すべての性能主張には対応する**測定記録（gate records）**があり、`benchmarks/` ディレクトリに**あるがまま公開**されています——失敗、間違いだった仮定、測定して捨てた数値まで含めて。benchmarks/README にはこう明記されています：

> 「これらは後からまとめたレポートではない。各機能を構築・検証している間に残した作業記録であり、だからこそ失敗、間違いだったと判明した仮定、測定してから捨てた数値が、実際に起こった順序で含まれている。」

この哲学がプロジェクトの信頼性の構造を直接決定しています：**測定がなければ主張もない。**

### 2. 「Bit-exact は常に 2 つの主張であり、1 つではない」

ストリーミングの正しさを検証するとき、Soup は**フォワード**パス（logits、`torch.equal`）と**バックワード**パス（すべての LoRA 勾配テンソル）を分けて測定し、分けて宣言します。理由は実践的なものです：H100 検証では、フォワードは 72B まで全規模で bit-exact だった一方、バックワードは NF4 のレイヤーあたり約 165 MiB を超えると**間違っていた**——フォワードは正常に見え、loss 曲線も健全に見え、勾配だけが静かに間違っていました。「bit-exact at 72B」とだけ宣言すれば、物語の半分が隠れてしまう。だから記録は行ごとに、どの方向か、どの量子化か、レイヤーあたり何 MiB かを明記し、未測定のものは空欄にするのではなく "not tested" と書きます。

### 3. 警告ではなく拒否（Refuse, don't warn）

トレーニング前の VRAM プリフライトは、収まらないと予測した設定を**警告ではなく拒否**します。これは Windows での痛烈な教訓から来ています：Linux では予算超過のステップはハード OOM ですが、Windows では WDDM が**VRAM をホストメモリへ静かにあふれさせ**、実行は単に一桁遅くなるだけ——4.29 GB のカードで 9.27 GB のピークを実測し、**例外は 1 つも発生しませんでした**。これを「警告」として出せば、ユーザーは「ストリーミングは遅い」と読むでしょう——それはまったく逆の結論です。

### 4. コストを印刷する、静かに吸収しない

3B bf16 のベースがページロックできないとき、Soup は自動的にページ可能ストアへフォールバックしますが、**そのフォールバックのコストを明示的に印刷します**（GPU 使用率が 96.8% から 79.3% へ低下）——静かに飲み込むのではなく。同様に、Windows が `expandable_segments:True` を無視していることを検出したとき、最適化が有効であるふりはしません。

### 5. 撤回文化：公開済みの説明が間違いだったと認める

論文 v3 は、**Soup 自身が公開した説明を撤回**します——「レイヤー・ストリーミングのボトルネックはホスト→デバイス転送であり、GPU ではない」。これは H100 再現からの*推論*であり、一度も測定されていませんでした。2026 年 8 月 11 日に測定した結果、公開設定では誤りであると判明：すべてのホスト→デバイスバイトを削除しても **1.4%** しか改善せず、計算ストリームがコピーを待つ時間はステップの **0.20%**、ステップはそのカードの同セッション GEMM 上限の **71.3%** で実行されていました。v1/v2 は改変せず引用可能なまま残されます——**撤回は新バージョンを公開することで行う**、つまり「何をいつ主張したか」の記録を完全に残すためです。

### 6. 設定スキーマが唯一の真実の源

`config/schema.py`（Pydantic v2、約 256KB）は、すべての設定フィールドの単一の真実の源（single source of truth）です。CLI、プリフライト、トレーナーはすべてここから派生します。重い依存（torch/transformers/peft/trl）はモジュールトップでなく関数内で遅延インポートするというルールと組み合わせることで、`pip install soup-cli` の軽量コア（PyTorch なし）を実用に耐えるものに保ちながら、トレーニングスタックは必要時に読み込まれます。

## 技術アーキテクチャ深掘り

### ソースレイアウト

```
src/soup_cli/
├── cli.py               # メイン CLI エントリ（Typer、約 26KB）
├── config/schema.py     # Pydantic v2 設定スキーマ（唯一の真実の源）
├── commands/            # 各サブコマンド実装（adapters/train/eval/data/ship/...）
├── trainer/             # トレーナーラッパー（SFT/DPO/GRPO/PPO/KTO/ORPO/SimPO/...）
├── data/                # データ形式パーサ、ローダー、コレーター、検証
├── eval/                # 評価、soup ship ゲート、キャリブレーション、Elo アリーナ
├── recipes/catalog.py   # 100 以上のモデルレシピ（約 89KB）
├── registry/            # モデルレジストリ、ハッシュ、ストレージ
├── cans/                # "Soup Cans"：再現可能な実験のパッケージング/実行
├── autopilot/           # ゼロ設定の自動ファインチューニング
├── mcp_server/          # MCP サーバー
├── monitoring/          # トレーニングコールバック、進捗表示、HF プッシュ
├── plugins/             # プラグインシステム
├── migrate/             # axolotl / llamafactory / unsloth からの移行
└── cloud/               # Modal クラウド GPU トレーニング
```

### Layer Streaming の仕組み

これが Soup の魂です。メカニズムは 4 層に分解できます：

**第 1 層：何が VRAM に残り、何が流れ出るか。** LoRA アダプタ + その勾配 + オプティマイザ状態は VRAM に常駐します（小さいから）。**凍結されたベースモデルは CPU メモリ**に置かれ（可能ならページロック）、レイヤーごとにストリーミングされます：各デコーダーレイヤーは**事前割り当てされた 2 つの VRAM バッファ**のいずれかに（ダブルバッファリング）、専用 CUDA ストリーム上でコピーされ、前のレイヤーの計算と**オーバーラップ**します。

**第 2 層：なぜストリーミングは時間がかかるのか。** 各レイヤーはステップごとに**2 回**読まれます——フォワードで 1 回、バックワードが再計算するときにもう 1 回。`dL/dx = Wᵀ · dL/dy` が重みを下のレイヤーに伝える必要があるからです。「これは物理であり、実装の詳細ではない。」実測コスト：常駐トレーニングより **1.43 倍**遅い（参照機で唯一の公平な比較である 0.5B での測定。1.5B 以上はこの機体で常駐実行すらできないため）。

**第 3 層：NF4 量子化が解決すること。** ストリーミングされるベースを NF4 に量子化すると、RAM ストアが約 4 倍小さくなります——8B ベースは bf16 の約 16 GB ではなく、NF4 の約 3.6 GB になります。利点は 2 つ：(1) より大きなモデルがホスト RAM に収まるようになる。(2) **ストアがマシンのページロックメモリ上限に収まる**（参照機では約 7.1 GB が上限）——ページロックこそが `copy_(non_blocking=True)` を実際に計算とオーバーラップさせる前提条件です。3B bf16 ベース（5.55 GB）はページロックに入らずページ可能にフォールバックし、使用率は 100% から 79.3% に低下しました。NF4 なら 1.43 GB でピン留めでき、使用率は 100% に戻ります。ベースの量子化は**一度だけ、オフラインで、テンソル単位で**行われ、キャッシュされます。シャードキャッシュは量子化方式/dtype/デバイス/チェックポイント指紋をキーにしており、`none`⇄`4bit` の切り替えでは再シャードされ、間違ったバイトが静かにストリーミングされることはありません。

**第 4 層：正確性はトレードオフではない。** ストリーミング NF4 実行は*常駐 NF4* 実行と bit-exact です（同じ量子化バイト、同じ bitsandbytes カーネル）——しかもこれは**回帰テスト**であり、一度きりの測定ではありません。

### VRAM プリフライトと拒否

ストリーミングは**重み**を制約します。アクティベーションや logits テンソルには何もできません——どちらも `batch × seq` でスケールします。大語彙モデルでは後者がすべてを支配します：Qwen2.5-0.5B（語彙 151,936）で batch 8、S=512 のとき、logits だけで **8.71 GB——レイヤーバッファプール全体（0.060 GB）の 146 倍**。そこで `soup train` はモデルを構築する前にピーク VRAM を予測し、収まらないと予測した実行を**拒否**します：

```
peak VRAM    ~0.48 GB at batch 2 x seq 256 (logits 0.35 GB)
free VRAM    3.46 GB
forecast     5685-8361 tok/s — a compute-bound bound, not a promise
```

予測器は 10 回の実実行、2 モデル、3.1 倍の語彙差、batch 1–8、2 種類の系列長でフィッティングされました：**最悪誤差 0.85%、そして過小予測は決してしない**——実行を止めることを許された数値にとって、これだけが安全な方向です。拒否は実際にスケールする 2 つのノブ（`training.batch_size`、`data.max_length`）を名指しします。

### バッチサイズ vs 勾配蓄積

両方とも機能しますが、**交換可能ではありません**。実測（Qwen2.5-0.5B bf16、S=256、pinned store、50 ステップ）：

| batch | accum | 実効バッチ | スループット | ピーク VRAM |
|---|---|---|---|---|
| 1 | 1 | 1 | 556.6 tok/s | 0.842 GB |
| 1 | 4 | 4 | 540.1 tok/s | 0.846 GB |
| 4 | 1 | 4 | **1378.0 tok/s** | 2.28 GB |

蓄積は**トークンあたりの I/O に対して中立**です（`accum=N` はベースを N 回再読し、かつ N 倍のトークンを処理するため）。蓄積が買うのは**一定 VRAM での実効バッチ**（0.842→0.846 GB）です。同じ実効バッチ 4 で `batch_size` を上げるほうが **2.52 倍**速い。だからルールは：**VRAM プリフライトが拒否するまで `batch_size` を上げ、残りは蓄積で補う**——Soup は蓄積を検出するとこのアドバイスを印刷します。

### 設定レベルの拒否リスト

ストリーミングでは、多くの設定組み合わせが**設定読み込み時に拒否**され、それぞれが解除するリリースを名指しします：

- `grpo`/`ppo` は**恒久的に拒否**：生成ロールアウトは生成トークンごとに全レイヤーを再読するため、ストリーミングが依存する償却を破壊する
- `kto` + `batch_size: 1`：TRL の KL 項が batch 1 で退化する
- `lora.use_dora`/`use_vera`/非 random 初期化戦略：これらは実際のベース重みから初期化する必要があるが、ストリーミング下ではベースはメタデバイス上にある
- `packing`/`multipack`/`unfrozen_parameters`/`lisa_enabled`/`use_fsdp2_compile` など：それぞれが同じレイヤー群を独立に書き換えたり再凍結したりする
- `stream_layers: false` のまま `stream_source`/`stream_buffers` 等を設定：footgun、拒否

### 選好損失のストリーミング：無料の参照モデル

v0.72.4 で DPO/ORPO/SimPO/KTO にストリーミングが拡張されました。懸念は 1 つ：DPO には参照モデルが必要で、2 つ目のコピーはメモリを倍増させ、意味を失わせる。Soup は**同じストリーミングベースでアダプタをオフにしたもの**を参照として使います——実測 SFT ピークの **0.914 倍**、一方で実際の 2 つ目のインスタンスを強制すると **+730 MB、ちょうど重み 1 コピー分**。4 つの損失すべてが通常の非ストリーミング実行と bit-exact。正直なコスト：*メモリ*では無料、*時間*では無料ではない——DPO はステップごとにレイヤースタックを **1.52 倍**読む。

### プレ-Ampere GPU の fp16 修正

v0.72.3 まで、ストリーミングストアの dtype は**すべての** CUDA デバイスで bf16 にハードコードされていました——無料ノートブック層全体（T4/P100/V100/GTX 16xx/RTX 20xx）が、自分の GPU に計算ユニットのない dtype をストリーミングしていたのに、誰もそれを言いませんでした（すべての数値が測定された Ampere カードでは失敗しないため）。重要な詳細：`torch.cuda.is_bf16_supported(including_emulation=False)` の `including_emulation=False` が**荷重を支えるキーワード**——裸の呼び出しはデフォルトでエミュレーションを含み、T4 は True と答えます。修正の最初のバージョンは裸の質問をしたため、対象のハードウェア上でまさに何もしませんでした——推論ではなく、実際の T4 で proof notebook を実行して発見されたのです。

## 性能データ

### ストリーミングトレーニング実測（RTX 3050 Laptop 4GB、Windows 11、LoRA、batch 1、50 ステップ）

| モデル | 量子化 | Seq | スループット | GPU 使用率 | ピーク VRAM | RAM ストア |
|---|---|---|---|---|---|---|
| **Llama-3.1-8B-Instruct** | **NF4** | 512 | **119.6 tok/s** | 100% | **3.32 GB** | 3.60 GB pinned |
| Qwen2.5-3B | NF4 | 512 | 264.2 tok/s | 100% | 1.76 GB | 1.43 GB pinned |
| Qwen2.5-3B | bf16 | 512 | 143.1 tok/s | 79.3% | 2.15 GB | 5.55 GB pageable |
| Qwen2.5-1.5B | bf16 | 512 | 525.0 tok/s | 96.8% | 1.82 GB | pinned |
| Qwen2.5-1.5B | bf16 | 1024 | 487.6 tok/s | 96.7% | 2.96 GB | pinned |
| Qwen2.5-0.5B | bf16 | 512 | 978.6 tok/s | 91.4% | 1.47 GB | pinned |

**ヘッドライン：8B モデルが 4GB カードで 119.6 tok/s・3.32 GB でファインチューニング可能。** この速度なら 100 万トークンのトレーニングは約 2.3 時間（実測レートからの除算であり、別個の測定ではない）。

### ストリーミングステップのボトルネック（プローブ v0.73.0、H100 同セッション）

- ストリーミングステップはカードの同セッション GEMM 上限の **71.3%** で実行される
- すべてのホスト→デバイスバイトを削除しても **1.4%** しか改善しない；計算ストリームがコピーを待つのはステップの **0.20%**
- ストリーミング固有の最大コストはレイヤーごとの NF4 逆量子化で **9.8%**
- Cut Cross-Entropy（CCE）は利用可能なマイクロバッチを 3 倍にし、**+9.6%**

### DeepSpeed 比較（H100、8 カード）

- ストリーミングは DeepSpeed ZeRO-3 offload より **2.93 倍**速く、VRAM は **9.7 倍**少ない
- 自分に都合の悪い結果も 1 つ：**8 カードの ZeRO-3 は 1 カード常駐より遅い**——それも公開している

## 機能の全体像

### トレーニングタスクと手法

SFT、DPO/GRPO/PPO/KTO/ORPO/SimPO/IPO/BCO、tool-calling、PRM、事前学習、蒸留、分類、vision/audio/TTS、unlearning、RAFT/RA-DIT——`task:` フィールド 1 つで切り替え。LoRA/DoRA/LoRA+/rsLoRA/VeRA/OLoRA/NEFTune/PiSSA/ReLoRA/LLaMA Pro/GaLore/YaRN/LongLoRA などの PEFT ファミリーは `docs/peft-and-efficiency.md` に。

### データエンジニアリング

Alpaca、ShareGPT、ChatML、選好ペア（DPO/ORPO/SimPO/IPO/KTO）、vision、audio、ASR、プレーンテキスト、embedding、RAFT——JSONL/JSON/CSV/Parquet/TXT から**自動検出**されるので、ほとんどの場合 `data.train` をファイルに指すだけで完了です。合成データ生成（forge）、品質スコアカード、リモートデータセット、ミキシング、レシピ DAG は `docs/data.md` に。

### サービングとエクスポート

OpenAI 互換サーバー、Anthropic Messages エンドポイント、バッチ推論、GGUF/ONNX/TensorRT/AWQ/GPTQ/BitNet エクスポート、**投機的デコーディング**（自分でドラフトモデルを訓練・測定）、デプロイ autopilot、Web UI、Agent Forge。`soup serve --model ./output` でワンコマンド起動。

### ガバナンスとコンプライアンス

アダプタライフサイクル管理、モデルレジストリ、**Soup Cans**（再現可能な実験のパッケージ/実行/公開）、データフライホイール `soup loop`、知識編集、steering、サプライチェーン管理（scan/sign/BOM/attest/audit/airgap）。コンプライアンス面：HIPAA/SOC2/EU-AI-Act/SR-11-7 の `init` テンプレート、出所追跡（BOM/attest/repro-receipt）、監査ログ、エアギャップ、モデルカード自動生成 `soup card`、CI ゲート `soup ci init`。

### バックエンドとエコシステム

デフォルト transformers、`[fast]` の **Unsloth（2–5 倍高速）**、`[mlx]` の Apple Silicon 対応、`[modal]` のクラウド GPU トレーニング（`soup train --cloud modal`）、`soup mcp serve` MCP サーバー、`soup autopilot` ゼロ設定ファインチューニング、実験追跡（mlflow/swanlab/trackio）、プラグインシステム。さらに axolotl / llamafactory / unsloth からの**設定マイグレーション**も提供。

## リリースゲート：soup ship

`soup ship` は 1 つの問いに答えます：**このモデルは良くなったのか、それとも壊したのか？** 2 つの脚：

- **脚 1（タスク評価）**：自分のデータでタスク評価を実行
- **脚 2（回帰ゲート）**：固定の抽出ベースのスコアラで、7 つのバンドル済みオフラインスイート（MCQ・算術・tool-calling・JSON 妥当性・safety/refusal）を実行——**追加依存ゼロ**

```
soup ship --base ./base --adapter ./my-lora --task-eval my_task.jsonl
#   exit 0 = SHIP・2 = DON'T SHIP・3 = bad flags・1 = runtime error
```

タスクで勝っても tool-calling を静かに壊すチューンは **DON'T SHIP** になります。

v0.73.2 の修正は、スコアラ自身の罠を暴露しました：

- **`mini_tool_call` は「ブレースの衛生状態」を採点していた**：モデルが閉じ括弧を 1 つ省略し、パースが内側のオブジェクトにフォールバック、スコアラは外側キーがないため拒否——40/40 正解のモデルが 0.225 を取った
- **`mini_mmlu` は Llama-3.1-8B を 0.423 と採点——0.5B よりも低い**：抽出器が `\boxed{C}` を認識せず、プロンプトもアルファベットを要求していなかった。修正後 0.423 → 0.731
- **新設：無害プロンプト軸。** 脚 2 は拒否率の*低下*だけをフラグしていたため、すべてを拒否するチューンが単調な安全性向上に見えてしまう——7 スイートすべてでバイト単位同一スコアの 2 モデル（片方は無害な要求をすべて拒否）がゲートで区別不能だった。`mini_over_refusal` がその鏡像で、安全スイートとペアにすることで**どちらか一方だけでは不正できない**
- **`--noise-floor N`**：ベースモデルを N 回再実行し、測定したばらつきより小さいデルタは有意とみなさない。GPU のグリーディーデコードは決定的ではない——同一モデル、アダプタなし、5 回の実行で 0.015–0.020 のばらつき（閾値 0.05）、6 組のペアデルタのうち 4 組がノイズフロア内に収まった
- **呼び出し側エラーと回帰が区別不能**：呼び出し不能なジェネレータは 3 スイートで 0.0、残りでは例外——そして 0.0 は「全項目失敗」、つまり発見に見える方向の失敗として読まれる

## 詳細チュートリアル

### 1. インストール

```bash
# 軽量コア：CLI + 設定 + データツール、PyTorch なし
pip install soup-cli

# トレーニングスタックを追加（torch, transformers, peft, trl, datasets, ...）
pip install "soup-cli[train]"

# 全部入り（train + serve + ui + data）
pip install "soup-cli[all]"

# または GitHub から最新開発版
pip install git+https://github.com/MakazhanAlpamys/Soup.git
```

> **ダブルクォート必須。** `"soup-cli[train]"` だけが cmd.exe、PowerShell、bash、zsh のすべてで動く表記です。古いチュートリアルから `'soup-cli[train]'` をコピーして pip に拒否されたなら、それが原因です。

`soup init`、`soup data …`、データ/検査コマンドは軽量インストールで使えます。ファインチューニング（`soup train`）には `[train]` extra が必要です。

### 2. 設定を作成

```bash
soup init                       # 対話式ウィザード
soup init --template chat       # またはテンプレートから開始
```

テンプレート：`chat`、`code`、`tool-calling`、`medical`、`reasoning`、`vision`、`kto`、`orpo`、`simpo`、`ipo`、`bco`、`rlhf`、`pretrain`、`moe`、`longcontext`、`embedding`、`audio`。

### 3. トレーニング、テスト、公開

```bash
soup train --config soup.yaml                 # LoRA、量子化、バッチング——すべて自動処理
soup chat  --model ./output                    # モデルと対話
soup push  --model ./output --repo you/my-model

soup merge  --adapter ./output                              # LoRA をベースにマージ
soup export --model ./output --format gguf --quant q4_k_m   # GGUF、Ollama / llama.cpp 用
```

### 4. 完全な soup.yaml

```yaml
base: meta-llama/Llama-3.1-8B-Instruct
task: sft
# backend: unsloth  # 2-5 倍高速、pip install "soup-cli[fast]"

data:
  train: ./data/train.jsonl
  format: alpaca
  val_split: 0.1

training:
  epochs: 3
  lr: 2e-5
  batch_size: auto
  lora:
    r: 64
    alpha: 16
  quantization: 4bit

output: ./output
```

`config/schema.py` がすべてのフィールドの唯一の真実の源です。

### 5. 4GB カードで 8B をストリーミングファインチューニングする設定

```yaml
base: meta-llama/Llama-3.1-8B-Instruct
task: sft
backend: transformers

data:
  train: ./data.jsonl
  format: alpaca
  max_length: 512
  val_split: 0.1

training:
  epochs: 3
  lr: 2e-5
  batch_size: 1           # ストリーミングでは明示サイズ必須；"auto" は拒否
  quantization: 4bit      # NF4——bf16 より約 4 倍小さい RAM ストア
  gradient_checkpointing: true     # ストリーマがレイヤー単位で処理
  stream_layers: true     # Layer Streaming を有効化
  stream_source: auto     # RAM、収まらなければ自動で NVMe ディスクへ
  stream_buffers: 2       # ダブルバッファリング
  lora:
    r: 64
    alpha: 16

output: ./output
```

### 6. よく使うコマンド

```bash
soup train  --config soup.yaml        # トレーニング（SFT/DPO/GRPO/PPO/KTO/ORPO/SimPO/...）
soup infer  --model ./output --input prompts.jsonl   # バッチ推論
soup chat   --model ./output          # 対話型チャット
soup serve  --model ./output          # OpenAI 互換 API サーバー
soup merge  --adapter ./output        # LoRA をベースにマージ
soup export --model ./output --format gguf           # デプロイ用にエクスポート
soup eval   benchmark --model ./output               # 評価
soup data   inspect ./data/train.jsonl               # データセット統計
soup recipes list                     # 100 以上の既製モデルレシピ
soup autopilot --model <id> --data d.jsonl --goal chat  # ゼロ設定
soup doctor                           # GPU / 依存関係 / 環境を確認
```

### 7. トラブルシューティング

```bash
soup doctor    # GPU、システムリソース、依存関係、バージョンを一括確認
```

- **Windows で `ImportError: DLL load failed while importing _C`** —— CUDA バージョンに合わせて PyTorch を再インストール：`pip install torch --index-url https://download.pytorch.org/whl/cu121`
- **`soup version` ≠ `pip show soup-cli`** —— Python が複数インストールされている；virtualenv を使う

### 8. Docker を使う

CUDA や PyTorch をローカルにインストールせずに実行：

```bash
docker pull ghcr.io/makazhanalpamys/soup:latest
docker run --gpus all -v $(pwd):/workspace ghcr.io/makazhanalpamys/soup train --config soup.yaml
```

## 忠実度検証システム

Soup の正しさの検証は、完全な**出版品質プロトコル**です：

1. **測定記録をそのまま公開**：`benchmarks/` の各ゲート記録には失敗、否定された仮定、捨てた数値が含まれる。`gate-v0.73.1` は作業中に**撤回された 3 つの読み取り値**まで持っている（うち 2 つはヘッドライン結果に見えた）
2. **正しさの参照はテスト対象の数値と常に一致させる**：ストリーミング NF4 実行は*常駐 NF4* 実行と比較され、常駐 bf16 とは決して比較しない——本当の欠陥が量子化誤差の中に隠れてしまうから
3. **スループットは SM クロックと一緒に引用**：このカードのブーストクロックはセッション間で約 13% 変動するため、クロックなしの「上限の何割」は無意味；GEMM 上限は同セッションで測定
4. **派生数値は算術であると明記**：「100 万トークン = 2.3 時間」は割り算であり、壁時計での測定ではない
5. **正しさプロトコルは CI で実行**：bit-exact の回帰は CI を失敗させ、ユーザーに届かない
6. **H100 独立検証**（gate-h100-validation.md）：フォワードは 72B まで bit-exact、バックワードは修正後 32B（256/256）と 72B（320/320）で再ゲート——72B は欠陥が最悪だった規模。2026-08-13 付の修正 3 件を記載し、元の行は隣に残す
7. **無料 Colab T4 は最も弱い証拠**：実行 1 回、反復なし、正しさ比較なし——「ストリーミングパスがプレ-Ampere カードで実行される唯一の証拠としてここに保管するものであり、何かをゲートするためのものではない」

## まとめ：重要な見解

1. **ハードウェアの壁こそ LLM ファインチューニング普及の最大のボトルネックであり、エンジニアリングで打ち破れる。** Soup は「8B のファインチューニングには 24GB+ が必要」がソフトウェアアーキテクチャで覆せる仮定であることを証明しました——常駐ベースをレイヤー単位のストリーミングに置き換えることで、4GB ノートPC が正当なトレーニングデバイスになります。魔法ではなく、1.43 倍の時間コストで空間を得るのです。

2. **LLM エンジニアリングでは「bit-exact」は 2 つの独立した主張でなければならない。** フォワードの正確性はバックワードの正確性を意味しない——NF4 でレイヤーあたり約 165 MiB を超えると、loss 曲線が健全に見えるまま勾配が静かに間違っていました。「正しい」を 1 つの塊として扱うことは、静かな欠陥に裏口を残すことです。

3. **測定文化は信頼性のインフラである。** 失敗した測定を公開し、自分の説明を撤回し、「8 カードが 1 カードより遅い」という気まずい結果を公開する——これらはポーズではなく、コミュニティが再現し信頼できるようにするための仕組みです。ドキュメントのすべての数値は追跡可能で再測定可能です。

4. **拒否は警告より安全。** 静かにあふれるプラットフォーム（Windows WDDM）では、警告は嘘になります。「過小予測しない」プリフライト（最悪誤差 0.85%）は、「動くかどうか」を実行時の事故から読み込み時の決定に変えます。

5. **自動化の境界は正直さである。** Soup は GPU、バッチサイズ、量子化を自動検出します——しかし「auto」はストリーミング下で拒否され（ストリーミングが決して読み込まない常駐モデルに対して OOM プローブをするから）、使えない機能は解除するリリースを名指しし、grpo/ppo は理由つきで恒久拒否。自動化は設定への無条件の信頼ではないのです。

6. **リリースゲートは「改善に見える回帰」を防がなければならない。** スコアラ自身がブレース衛生、`\boxed{C}`、すべてを拒否する安全モデルに騙されました——ゲートの敵は悪いモデルではなく、**悪いモデルと区別できないスコアラ**です。ノイズフロアは、GPU のグリーディーデコード自体が 0.015–0.020 のばらつきを持つことを認めています。

7. **ハードウェアが制約される場所では、野心より正直さが有効。** 作者はプロジェクトが 4GB ノートPC でメンテナンスされ、マルチ GPU と Apple Silicon の検証がハードウェアでブロックされていると明確に述べ、その検証を「requires \<hardware\>」ゲート + 正確に何がブロックされているかを書いた help-wanted イシューで外に委ねています。制約は言い訳ではなく、ロードマップの仕分け装置なのです。

## 利用シーン分析

| シーン | 適合度 | 説明 |
|---|---|---|
| 学生 / 個人開発者 | ★★★★★ | 4GB ノートPC + 無料 Colab T4 で 8B をストリーミングファインチューニング；SSH ゼロ、設定地獄なし |
| 垂直領域の高速ファインチューニング | ★★★★★ | ワンコマンド SFT + 100 以上のレシピテンプレート（医療/コード/tool-calling/コンプライアンス） |
| 選好アライメント実験 | ★★★★☆ | DPO/ORPO/SimPO/KTO/IPO/BCO を完全カバー、ストリーミング参照モデルは無料 |
| 企業コンプライアンスファインチューニング | ★★★★☆ | HIPAA/SOC2/EU-AI-Act テンプレート、BOM/attest/監査ログ/エアギャップ |
| 本番デプロイチェーン | ★★★★☆ | サービング/エクスポート/投機的デコード/レジストリ/Cans パッケージング、CI ゲート |
| マルチ GPU 分散トレーニング | ★★☆☆☆ | DeepSpeed/FSDP 対応、ただしマルチ GPU 検証はハードウェア制約と作者が明言 |
| ゼロからの事前学習 | ★★☆☆☆ | 対応するが主戦線ではない；ストリーミングは SFT + 4 種の選好損失をカバー |

## 結論

Soup は希少な「小さなハードウェア、大きなアイデア」プロジェクトです：キャッチコピーは「ワンコマンドで LLM をファインチューニング」ですが、実際にそれを駆動しているのは**信頼性**に関する完全な設計哲学——測定文化、2 つの主張からなる bit-exact プロトコル、警告より拒否、撤回文化の論文管理。Layer Streaming 自体が美しいエンジニアリングの会計です：8B トレーニングを 24GB GPU の特権から 4GB ノートPC の日常操作に変え、コストは 1.43 倍の時間だけ、正しさは回帰テストで固定されています。

一般の開発者にとって、Soup の最大の価値はおそらくこれです：**「モデルのファインチューニング」を、一日かけてインフラと格闘するブラックボックスから、3 つのコマンドに変えたこと。** エンジニアリング実践者にとって、その benchmarks/ ディレクトリと論文の撤回記録は、それ自体が「AI プロジェクトを信頼に値するものにする方法」のテンプレートです。

## 参考リソース

- [Soup リポジトリ](https://github.com/MakazhanAlpamys/Soup)
- [公式サイト trysoup.dev](https://trysoup.dev)
- [PyPI: soup-cli](https://pypi.org/project/soup-cli/)
- [論文：Exact Layer Streaming（Zenodo v3）](https://doi.org/10.5281/zenodo.21918325)
- [測定記録 benchmarks/](https://github.com/MakazhanAlpamys/Soup/tree/main/benchmarks)
- [4GB 検証ノートブック（無料 Colab T4）](https://github.com/MakazhanAlpamys/Soup/blob/main/notebooks/proof-4gb.ipynb)
- [Layer Streaming デモ動画（90 秒）](https://youtu.be/T1LCErE943E)
- [Soup Discord](https://discord.gg/8RgVbFA6Zq)