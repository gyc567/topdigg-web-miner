---
title: 'DwarfStar (ds4) 徹底解説：Redis 作者 antirez が作ったローカル LLM 推論エンジン——DeepSeek V4 Flash に特化した垂直統合ソリューション'
description: "antirez（Redis 創設者 Salvatore Sanfilippo）が公開した DwarfStar（ds4）を徹底解説——DeepSeek V4 Flash/PRO と GLM 5.2 に特化した小型ネイティブ推論エンジン。約 65,000 行の C コードで Metal/CUDA/ROCm 3 バックエンド、SSD ストリーミング、パイプライン並列、DSpark 推測デコーディング、ネイティブコーディングエージェント、OpenAI 互換 API を一つの垂直統合スタックとして実現。M5 Max で 87 t/s プリフィル、34 t/s 生成；分散プリフィルは最大 674 t/s。コア思想、アーキテクチャ、設計哲学からチュートリアル、機能一覧、要点まとめまでを網羅。"
date: "2026-08-04"
author: "TopDigg Research Team"
tags: ["DwarfStar", "ds4", "antirez", "DeepSeek V4", "LLM Inference", "Metal", "CUDA", "ROCm", "Local LLM", "Salvatore Sanfilippo"]
categories: ["Deep Dive"]
keywords: ["DwarfStar", "ds4", "antirez", "DeepSeek V4 Flash", "ローカル推論", "LLM", "Metal", "CUDA", "ROCm", "Redis 作者", "推測デコーディング", "SSD ストリーミング", "パイプライン並列", "垂直統合"]
---

# DwarfStar (ds4) 徹底解説：Redis 作者 antirez が作ったローカル LLM 推論エンジン——DeepSeek V4 Flash に特化した垂直統合ソリューション

> コア思想：**汎用推論フレームワークなど作らない。最強のモデル数個だけに、最高の「すぐに使える」体験を。** DwarfStar（ds4）は Redis の創設者 antirez（Salvatore Sanfilippo）の新プロジェクト——純粋な C で書かれた小型ネイティブ推論エンジンで、**意図的に狭く、意図的に深く**設計されています。モデルのロード、プロンプトレンダリング、ツール呼び出し、KV 状態管理、HTTP サーバー、コーディングエージェントが、**一つの統合スタックとして構築・テスト**されているのです。DeepSeek V4 Flash（プライマリターゲット）、DeepSeek V4 PRO、GLM 5.2 のみをサポートし、Metal（macOS プライマリ）、NVIDIA CUDA（マルチ GPU DGX Spark 含む）、ROCm（AMD Strix Halo）の 3 バックエンドを提供します。MacBook Pro、DGX Spark、Framework Desktop などのコンシューマハードウェアで、数十 GB パラメータのオープンソースモデルを実行でき、SSD ストリーミングでメモリ上限を突破します。これは antirez の「ローカル LLM」に関する完全な思考を体現しています：**モデルが進歩するなら、ツールチェーンも進歩すべき。汎用的だけれど平凡なフレームワークに留まるべきではない。**

---

## 1. プロジェクト概要

### 1.1 それは何か？

**DwarfStar** は antirez（Salvatore Sanfilippo）が開発した**小型ネイティブ LLM 推論エンジン**で、略称 **ds4**。**意図的に狭く**設計されています——汎用 GGUF ローダーではなく、**特定モデル向けに垂直統合された推論スタック**です：

- **モデルロード**（GGUF 形式、ルーテッドエキスパート量子化付き）
- **プロンプトレンダリング**（チャンク付き prefill）
- **ツール呼び出し**（ネイティブサポート）
- **KV 状態管理**（ディスク永続化付き）
- **HTTP サーバー**（OpenAI / Anthropic 互換 API）
- **コーディングエージェント**（プロセス内ネイティブ実装）

——これらすべてが**一つの単位として構築・テスト**されており、ばらばらに組み合わされたものではありません。

### 1.2 基本データ

- リポジトリ：`https://github.com/antirez/ds4`
- Stars：**20.4k**
- Forks：**1.8k**
- 作者：**antirez**（Salvatore Sanfilippo、Redis 創設者）
- 作成日：2026-05-06
- 最終プッシュ：2026-08-03
- ライセンス：**MIT**（GGML 著作権表示を保持）
- 言語：**C**（コアエンジン ds4.c 約 65,000 行）
- コミット数：428
- コントリビューター：11 人（antirez が 281 コミットで主導）
- サポートモデル：**DeepSeek V4 Flash**（プライマリ）、**DeepSeek V4 PRO**、**GLM 5.2**
- バックエンド：**Metal**（macOS プライマリ）、**NVIDIA CUDA**（マルチ GPU 含む）、**ROCm**（AMD Strix Halo）

### 1.3 何を解決するのか？

ローカル推論エンジンは既に多数存在します（llama.cpp、MLX、vLLM…）が、antirez はギャップを看到了しました：**既存のソリューションは、汎用すぎて効率が不十分か、あるいは過度にフラグメント化されている**——個別コンポーネントだけテストし、組み合わせてから問題に気づく。DwarfStar の答えは、**最強のモデル数個のために、底から頂まで完全なスタックを構築すること**——ロード、推論、API、エージェントがすべて一つのコードベースで統合テストされています。これにより、「特定モデル × 特定ハードウェア」の組み合わせで、汎用フレームワーク以上の効率を搾り出せます。

---

## 2. コア思想

### 2.1 意図的に狭く——「少数のモデルに特化」

これは llama.cpp などの汎用エンジンとの根本的な分歧です。llama.cpp はすべての GGUF モデルをサポートしようとするのに対し、DwarfStar は**意図的に汎用性を拒否**：DeepSeek V4 Flash / PRO と GLM 5.2 のみのために存在します。その利点は、これらのモデルの特定のアーキテクチャ（ルーテッド MoE エキスパート、特定の量子化形式、KV キャッシュ構造）に対して深く最適化でき、未知のモデル向けの互換性レイヤーを維持する必要がないことです。

### 2.2 垂直統合——一体であり、ばらばらの断片ではない

README にそのまま書かれています：**"Model loading, prompt rendering, tool calls, KV state, the HTTP server, and the coding agent are built and tested together."** これは同じ Makefile でコンパイルされるということではなく、**状態、メモリレイアウト、ライフサイクル管理を共有**するということです。例えば、ディスク KV キャッシュの永続化（SHA1 をファイル名に）とコーディングエージェントのツールリプレイ（DSML 精確リプレイ）は密接に連携しています——エージェントは再起動時に正確に前回の会話状態を復元できます。

### 2.3 誠実な AI 公開——「このソフトは AI が書いた。気にするなら使わないで」

antirez は README に、珍しい率直さで書きました：**"This software is developed with strong assistance from GPT 5.5, 5.6, Claude Fable and with humans leading the ideas, testing, and debugging. If you are not happy with AI-developed code, this software is not for you."** この透明性——README の本文の目立つ位置に配置し、脚注に埋めない——はオープンソースでは稀です。

### 2.4 llama.cpp の上に立つが、fork ではない

ds4 は **GGML をリンクしません**が、**"exists thanks to the path opened by the llama.cpp project"** と openly 認めています。量子化レイアウトテーブル、CPU 量子化ロジック、特定のカーネルなど、MIT ライセンスの下で GGML コードの一部を保持していますが、エンジン自体は独立して書かれた C コードです。これは「巨人の肩の上に立ち、自分のことをする」典型的な例です。

---

## 3. アーキテクチャ

### 3.1 ソースツリー

```
ds4/
├── ds4.c                 # コア推論エンジン（~65,000 行）
├── ds4.h                 # パブリック API ヘッダー
├── ds4_metal.m           # Metal バックエンド（~40,000 行）
├── ds4_cuda.cu           # CUDA バックエンド（~30,000 行）
├── ds4_rocm.cu           # ROCm バックエンド
├── ds4_server.c          # HTTP API サーバー（~17,500 行）
├── ds4_agent.c           # ネイティブコーディングエージェント（~11,000 行）
├── ds4_distributed.c     # パイプライン並列（~8,400 行）
├── ds4_tp.c              # テンソル並列（~8,600 行）
├── ds4_kvstore.c         # KV キャッシュディスク永続化
├── ds4_bench.c           # スループットベンチマーク
├── ds4_eval.c            # 能力評価（92 問組み込み）
├── rax.c / .h            # 基数木（ツールリプレイマップ）
├── metal/                # Metal カーネルコード
├── cuda/                 # CUDA カーネルコード
├── rocm/                 # ROCm カーネルコード
├── gguf-tools/           # GGUF 生成、imatrix、量子化ツール
├── dir-steering/         # 方向性ステアリングデータとベクトル生成
├── speed-bench/          # ベンチマークスクリプトとチャート
├── tests/                # テストベクターとリグレッションテスト
├── Makefile              # ビルドシステム
├── download_model.sh     # モデルダウンロードスクリプト
├── AGENT.md              # AI エージェント指示
├── CONTRIBUTING.md       # コントリビューションガイド
└── QA_BEFORE_RELEASES.md # リリース前テストマトリクス
```

### 3.2 コア抽象化

- **`ds4_engine`**：ロードされたモデルインスタンス
- **`ds4_session`**：1 回の推論タイムライン。ライブ KV キャッシュと logits を保持
- **`ds4_backend`** 列挙型：`DS4_BACKEND_METAL` / `DS4_BACKEND_CUDA` / `DS4_BACKEND_CPU`
- **`ds4_think_mode`** 列挙型：`DS4_THINK_NONE` / `DS4_THINK_HIGH` / `DS4_THINK_MAX`
- **`ds4_distributed_role`** 列挙型：`NONE` / `COORDINATOR` / `WORKER`
- **`ds4_tp_role`** 列挙型：`NONE` / `LEADER` / `WORKER`

### 3.3 セッション状態管理

巧妙な設計：**セッションがライブ KV キャッシュと logits を所有**します。呼び出し元は完全なトークンプレフィックスを提供し、`ds4_session_sync()` がグラフ状態を自動的に再利用・拡張・再構築します。ディスク KV キャッシュはレンダリングされたバイトプレフィックスの **SHA1** をファイル名として使用し、正確な状態復元を実現——コーディングエージェントは再起動時に前の会話をシームレスに再開できます。

### 3.4 非対称量子化

品質保証の鍵：**ルーテッド MoE エキスパートのみを量子化**（IQ2_XXS / Q2_K へ）；共有エキスパート、投影層、ルーティングネットワークは元の精度を維持。ルーテッドエキスパートはモデルサイズの大部分を占めるが、推論ごとに部分的にしか活性化されないため、コーディングエージェント下でも信頼できるツール呼び出しが可能な品質を維持します。

---

## 4. 設計哲学

### 4.1 「狭い」ことは欠点ではなく特徴

「汎用性が美徳」のオープンソースの世界で、DwarfStar は逆の道を歩きます。antirez は明確に言っています：**"The idea of an inference system specialized for a few models."** すべてのモデルに浅く対応するより、数個の最強モデルに深く最適化する選択——これが DeepSeek V4 Flash で汎用フレームワークを上回る理由です。

### 4.2 統合テストはばらばらの組み合わせに勝る

DwarfStar の各リリースは完全な QA マトリクス（`QA_BEFORE_RELEASES.md`）を通過し、リモートの Metal / CUDA / ROCm マシンをカバーします。CI でチェックを通すのではなく、**人間が実際のハードウェアで完全なテストスイートを実行**します。モデルロード、推論、API、エージェントがすべて一つの単位として検証されます。

### 4.3 誠実さは磨きより大切

antirez は README の目立つ場所に AI の関与を開示し、ベータ品質であることを明記し、汎用 GGUF をサポートしないことを認め、分散プロトコルに暗号化がないことを宣言します。この「まず問題を述べ、利点は後」のスタイルはオープンソースでは稀ですが、ユーザーにとって極めて貴重です——坑を踏まなくても境界がわかるからです。

### 4.4 前人の肩の上に立つが、クローンではない

ds4 は GGML をリンクしませんが、llama.cpp の肩の上に立っていることを openly 認めています。MIT の下でコードの一部（量子化テーブル、カーネル）を再利用していますが、エンジンは独立して書かれています。典型的な「巨人の肩の上に立ち、自分のことをする」です。

---

## 5. チュートリアル

### 5.1 ビルド

```bash
make                  # macOS Metal（デフォルト）
make cuda-spark       # Linux CUDA、DGX Spark / GB10
make cuda-generic     # Linux CUDA、その他のローカル CUDA GPU
make strix-halo       # Linux ROCm、AMD Strix Halo
make cpu              # CPU のみリファレンスビルド（デバッグのみ）
```

### 5.2 モデルダウンロード

```bash
./download_model.sh q2-imatrix     # 96/128 GB RAM マシン、imatrix 調整 q2
./download_model.sh q2-q4-imatrix  # 96/128 GB、q2 + 最後 6 層 q4
./download_model.sh q4-imatrix     # ≥ 256 GB RAM マシン
./download_model.sh mxfp4          # ネイティブ MXFP4 エキスパート重み、約 156 GB
./download_model.sh pro-q2-imatrix # 512 GB RAM マシン、PRO q2
```

### 5.3 CLI の使い方

```bash
# 単発プロンプト
./ds4 -p "Redis streams を一文で説明して。"

# インタラクティブチャット
./ds4

# 思考を無効化
./ds4 --nothink
```

### 5.4 サーバー起動

```bash
# 基本サーバー
./ds4-server --ctx 100000 --kv-disk-dir /tmp/ds4-kv --kv-disk-space-mb 8192

# マルチ GPU マルチセッションバッチ処理（8x L40S）
./ds4-server --cuda --cuda-tensor-parallel \
  --gpu-vram auto \
  --gpu-devices 0,2,4,6,1,3,5,7 \
  --model "$MODEL" \
  --ctx 100000 \
  --batched-session 16 \
  --host 0.0.0.0
```

### 5.5 コーディングエージェント起動

```bash
./ds4-agent --ctx 100000
```

### 5.6 SSD ストリーミング（メモリ上限の突破）

```bash
./ds4 -m ./ds4flash.gguf \
  --ssd-streaming \
  --ssd-streaming-cache-experts 32GB \
  --ctx 32768
```

### 5.7 パイプライン並列（マシン間推論）

```bash
# コーディネーターマシン（レイヤー 0-30）
./ds4 -m gguf/...-layers00-30.gguf \
  --role coordinator --layers 0:30 --listen 169.254.43.68 1234

# ワーカーマシン（レイヤー 31 から出力）
./ds4 -m gguf/...-layers31-output.gguf \
  --role worker --layers 31:output --coordinator 169.254.43.68 1234
```

### 5.8 DSpark 推測デコーディング（実験的）

```bash
./download_model.sh dspark-support
./ds4 -m ds4flash.gguf \
  --mtp gguf/DeepSeek-V4-Flash-DSpark-support.gguf \
  --dspark --temp 0
```

### 5.9 ベンチマーク

```bash
./ds4-bench \
  -m ds4flash.gguf \
  --prompt-file speed-bench/promessi_sposi.txt \
  --ctx-start 2048 --ctx-max 65536 --step-incr 2048 --gen-tokens 128
```

### 5.10 能力評価

```bash
./ds4-eval -m ds4flash.gguf   # 92 問の組み込み評価（GPQA、AIME、COMPSEC）
```

---

## 6. 機能一覧

- **3 モデルサポート**：DeepSeek V4 Flash（プライマリ）、DeepSeek V4 PRO、GLM 5.2
- **3 バックエンド**：Metal（macOS プライマリ）、NVIDIA CUDA（マルチ GPU）、ROCm（AMD Strix Halo）
- **SSD ストリーミング**：モデルが RAM を超える場合、ルーテッドエキスパートを SSD からオンデマンドロード
- **パイプライン並列**：マシン間でトランスフォーマーレイヤーを分割し、アセンブリラインのように協調
- **テンソル並列**：Thunderbolt 5 RDMA 双 Mac またはマルチ GPU CUDA テンソル並列
- **DSpark 推測デコーディング**：補助ドラフトモデルで生成を高速化（実験的）
- **ネイティブコーディングエージェント**：プロセス内、DSML 精確ツールリプレイ、ディスク永続 KV キャッシュ
- **OpenAI / Anthropic 互換 API**：`/v1/chat/completions`、`/v1/completions`、`/v1/messages`
- **ディスク KV キャッシュ**：SHA1 キー、会話状態の正確な復元
- **3 つの思考モード**：Non-think / Think High / Think Max
- **方向性ステアリング**：活性化レベルのモデル動作微調整
- **電力管理**：`--power N` で GPU 電力/熱を削減
- **ベンチマークツール**：`ds4-bench` スループットテスト
- **評価ツール**：`ds4-eval` 組み込み 92 問
- **デバッグツール**：`--dump-tokens`、`--dump-logprobs`、`--dump-logits`、`--trace`

---

## 7. 要点まとめ

1. **「狭い」ことは過小評価された戦略。** 汎用フレームワークの軍拡競争の中で、DwarfStar は数個のモデルに深く最適化する選択をしました——これが DeepSeek V4 Flash で汎用フレームワークを上回る理由です。「少なければ良い」は工学における空事ではなく、境界のある真理です。

2. **垂直統合は性能の秘密兵器。** ロード、推論、KV 管理、API、エージェントが一つの状態空間を共有するとき、ゼロコピー、統一ライフサイクル管理、密接な連携が可能になります——ばらばらに組み合わされた汎用フレームワークには做不到のことです。ds4.c が 65,000 行なのはコードが肥大化しているからではなく、すべての状態が一つの構造体にあるからです。

3. **SSD ストリーミングは「メモリ＝上限」の古い仮定を打ち破ります。** ルーテッドエキスパートはモデルサイズの大部分を占めるが、推論ごとに部分的にしか活性化されない。DwarfStar はこの特性を活用：非ルーテッド重みは常駐、ルーテッドエキスパートは SSD からオンデマンドロード。64 GB MacBook でも DeepSeek V4 Flash を実行できます。

4. **antirez の透明性はオープンソースの模範。** AI の関与、ベータ品質、汎用 GGUF 非サポート、分散プロトコルの非暗号化を積極的に開示——この「まず問題を述べる」スタイルは、ユーザーが坑を踏まずに境界を知ることができます。

5. **llama.cpp の肩の上に立つが、fork ではない。** ds4 は GGML をリンクせず、エンジンは独立して書かれていますが、llama.cpp の開いた道の上に立っていることを openly 認めています。典型的な「前人を尊重しつつ、自分たちのことをする」です。

6. **特定ハードウェア + 特定モデルの最適化が、コンシューマーローカル推論のスイートスポット。** 汎用フレームワークはすべてのハードウェアとモデルに妥協します。DwarfStar は Metal + DeepSeek V4 Flash に深く最適化——128 GB MacBook でクラウドに近い推論体験を提供します。

---

## 参考資料

- リポジトリ：`https://github.com/antirez/ds4`
- 作者：antirez（Salvatore Sanfilippo、Redis 創設者）
- モデル重み：`huggingface.co/antirez/deepseek-v4-gguf`
- モデルソース：DeepSeek-AI（`huggingface.co/deepseek-ai/DeepSeek-V4-Pro`）
- インフラ：llama.cpp / GGML（Georgi Gerganov 及びコントリビューター）
- AI アシスト：GPT 5.5、5.6、Claude Fable
- コントリビューションガイド：`CONTRIBUTING.md`
- リリース前テストマトリクス：`QA_BEFORE_RELEASES.md`