---
title: "AirLLM 徹底解説：層ごとの推論で70B大規模言語モデルを4GB GPUで動かす革命"
description: "オープンソースプロジェクト AirLLM を包括的に分析 —— 量子化も蒸留も枝刈りもせず、レイヤーごとのロード技術で70Bパラメータの大規模言語モデルを単一の4GB GPUで推論。インストールからAPIの使い方、動作原理から設計哲学まで、26,000スター超のプロジェクトの核となる考え方を解説。"
date: "2026-08-03"
author: "TopDigg Research Team"
tags: ["AirLLM", "LLM推論", "大規模言語モデル", "GPUメモリ最適化", "層別推論", "オープンソース", "Gavin Li", "ディープラーニング", "モデル推論", "低スペックハードウェア"]
categories: ["徹底解説"]
keywords: ["AirLLM", "LLM推論", "70Bモデル", "4GB GPU", "層別推論", "Layer-wise Inference", "Gavin Li", "Anima AI", "オープンソース", "GPU VRAM", "AutoModel", "モデル圧縮"]
---

# AirLLM 徹底解説：層ごとの推論で70B大規模言語モデルを4GB GPUで動かす革命

> 核となる考え方：**なぜモデル全体を一度にGPUメモリに載せる必要があるのか？** Transformer の各層は順番に実行されるのだから、「今実行中の層」だけをGPUに置き、計算し終わったら解放すればいい。AirLLM はこの一見シンプルな問いを、70BパラメータのLLMを単一の4GB GPUで動かす実用的なシステムに変えた —— 量子化も蒸留も枝刈りもなしで。

---

## 1. プロジェクト概要

### 1.1 このプロジェクトとは？

**AirLLM** は、**Gavin Li**（Anima AI 創業者、元 Airbnb / Alibaba AI シニアリーダー）が開発したオープンソースの大規模言語モデル推論フレームワークです。その核となる能力は、**LLM推論時のGPUメモリ使用量を劇的に削減**し、70Bパラメータのモデルを**単一の4GB GPU**で実行できるようにすること —— 量子化・蒸留・枝刈りは一切不要です。

> README より：*"AirLLM optimizes inference memory usage, letting 70B large language models run inference on a single 4GB GPU card — without quantization, distillation, or pruning."*

### 1.2 プロジェクト概要データ

- **GitHub スター**：26,230+（2026年8月時点）
- **ライセンス**：Apache License 2.0
- **開発状況**：活発に開発中（直近コミット 2026年7月29日）
- **配布**：PyPI（`pip install airllm`）
- **リポジトリ**：https://github.com/lyogavin/airllm

### 1.3 何ができるか？（公式ベンチマークのVRAM使用量）

- **Qwen3 / Mistral / Phi（約8B）** → わずか **約1〜2 GB**
- **Qwen3-30B / Mixtral（MoE、30〜47B）** → **約1〜3 GB**
- **Qwen3-235B（MoE）** → **約3 GB**
- **Llama 3.x 70B** → **約4 GB**
- **Llama 3.1 405B** → **約8 GB**
- **DeepSeek-V3（671B）** → **約12 GB**
- **Kimi K3（2.8T）** → **約3.72 GB**

> 注：数字は公式ベンチマークによるもの。従来方式では70Bモデルのフルロードに約140GBのVRAMが必要。AirLLMはそれを4GBに削減 —— **30倍以上の削減**です。

---

## 2. 核となる考え方：なぜモデル全体をVRAMに常駐させる必要があるのか？

### 2.1 見落とされがちな当たり前の事実

LLM推論中、Transformer の各層は**順番に**実行されます。前の層の出力が次の層の入力となり、任意の瞬間に計算しているのは**1つの層だけ**です。著者のGavin Liは Medium でこう説明しています：

> "During inference, layers are executed sequentially. The output of the previous layer is the input to the next. Only one layer executes at a time. Therefore, it is completely unnecessary to keep all layers in GPU memory. We can load whichever layer is needed from disk when executing that layer, do all the calculations, and then completely free the memory after."

つまり、**同時に計算するのは1層だけなのだから、なぜ全層をメモリに詰め込む必要があるのか？** 「今実行中の層」をディスクからGPUにロードし、計算し終わったら即座に解放して次の層をロードする —— これがAirLLMの全秘密です。

### 2.2 主流のアプローチとの根本的な違い

主流のアプローチは「モデルを小さくしてVRAMに収める」というものです：

- **量子化**：重みをFP16からINT8/INT4に圧縮し、精度とサイズをトレードオフ
- **蒸留**：大きなモデルで小さなモデルを教え、コンパクト版を再学習
- **枝刈り**：重要でないパラメータを削除

AirLLM の考え方はまったく異なります —— **モデルを変えるのではなく、モデルが置かれる場所を変える**：GPU VRAMを「キャッシュ」として、ディスクを「メインメモリ」として扱う。速度と引き換えに容量を手に入れ、すでに所有しているハードウェアで大規模モデルを動かせるようにするのです。

---

## 3. 詳細チュートリアル：インストールから実行まで

### 3.1 インストール

```bash
pip install airllm
```

Kimi K3（エキスパート単位ストリーミング）をサポートするには追加で：

```bash
pip install airllm compressed-tensors flash-attn
```

### 3.2 クイックスタート：AutoModel

AirLLM は HuggingFace 互換の `AutoModel` API を提供し、モデルアーキテクチャを自動検出します：

```python
from airllm import AutoModel

MAX_LENGTH = 128
model = AutoModel.from_pretrained("Qwen/Qwen3-32B")

input_text = ['What is the capital of the United States?']
input_tokens = model.tokenizer(
    input_text,
    return_tensors="pt",
    return_attention_mask=False,
    truncation=True,
    max_length=MAX_LENGTH,
    padding=False
)

generation_output = model.generate(
    input_tokens['input_ids'].cuda(),
    max_new_tokens=20,
    use_cache=True,
    return_dict_in_generate=True
)

output = model.tokenizer.decode(generation_output.sequences[0])
print(output)
```

> HuggingFace `transformers` と同じ使い方です：`from_pretrained` でロード、`tokenizer` でエンコード、`generate` で生成 —— 導入コストはほぼゼロ。

### 3.3 圧縮モードでさらに高速化

推論速度をさらに上げたい場合は、4-bit / 8-bit の重み量子化を有効化（精度劣化はほぼ無視できる程度）：

```python
model = AutoModel.from_pretrained(
    "garage-bAInd/Platypus2-70B-instruct",
    compression='4bit'   # または '8bit'
)
```

### 3.4 超大規模モデルのロード（405B / 671B）

HuggingFace エコシステムの最大級モデルにもそのまま対応：

```python
# Llama 3.1 405B
model = AutoModel.from_pretrained("unsloth/Meta-Llama-3.1-405B-Instruct-bnb-4bit")
```

### 3.5 対応アーキテクチャ

人気のオープンモデルをほぼ全てサポート：

- **Llama 系**：2 / 3 / 3.1 / 3.3 / 4（405B含む）
- **Qwen 系**：1 / 2 / 2.5 / 3（MoE・FP8変種含む）
- **DeepSeek 系**：V2 / V3 / R1（671B V3含む）
- **Mistral / Mixtral**：Mistral-7B、Mixtral MoE
- **Phi、Gemma**：マイクロソフト、Google系
- **ChatGLM、Baichuan、InternLM、Yi**：中国製モデル系

### 3.6 初回実行の注意点

- **初回シャーディング**：初回実行時にモデルを層ごとにディスクへ分割。**10〜30分**かかります（モデルサイズとディスク速度による）
- **ディスク容量**：初回は元モデル＋分割コピーで**約2倍**の容量が必要。`delete_original=True` で元ファイルを削除して容量を解放できます
- **NVMe SSD推奨**：ディスクI/Oがボトルネック。HDDでは0.1トークン/秒以下に低下
- **よくあるエラー**：`MetadataIncompleteBuffer` エラーは**ほぼ確実にディスク容量不足が原因**

---

## 4. 動作原理：AirLLMの4つの技術的柱

### 4.1 層別シャーディング（Layer-wise Sharding）

モデルは層ごとのディスクファイルに分割されます（safetensorsのメモリマッピング）。推論時は一括ロードではなく、必要な層だけをオンデマンドでロードします。

### 4.2 メタデバイス初期化（Meta Device Initialization）

`accelerate.init_empty_weights()` でモデル構造を構築 —— **テンソルの形状だけを作成し、VRAMは一切確保しません**。

### 4.3 フォワードフック（Forward Hooks）

この仕組みが中核です。各Transformer層に2つのフックを掛けます：

- **Pre-hook（前フック）**：その層の重みをディスクからGPUへロード
- **Post-hook（後フック）**：計算後、重みをメタデバイスへ戻し `clean_memory()` でメモリ解放

```python
def _pre_hook(self, module, args):
    idx = module._airllm_idx
    if self.prefetching and self._prefetch_future is not None and self._prefetched_idx == idx:
        state_dict = self._prefetch_future.result()
    else:
        state_dict = self._load_streamed_layer(idx)
    module._airllm_moved = self.move_layer_to_device(state_dict)
    # 次の層をプリフェッチ
    if self.prefetching:
        nxt = self._next_streamed_idx(idx)
        if nxt is not None:
            self._prefetch_future = self._executor.submit(self._load_streamed_layer, nxt)
```

### 4.4 3つの重要な最適化

- **プリフェッチ（v2.5+）**：層NのGPU計算中に、層N+1をディスクから先行ロード —— **約10%の高速化**
- **エキスパート単位ストリーミング（v3.1+）**：MoEモデルで層全体をロードせず、ルーターが現在のトークン用に選んだエキスパートだけをロード
- **MXFP4パック転送（Kimi K3）**：重みをPCIe転送中も4-bit圧縮のまま維持し、GPU上でのみ展開 —— **データ転送量が4分の1**

---

## 5. 設計哲学

### 5.1 著者の原点の問い

Gavin Li は素朴な問いから始めました：

> "Large language models require huge amounts of GPU memory. Is it possible to run inference on a single GPU? If so, what is the minimum GPU memory required?"

**LLMには膨大なGPUメモリが必要。単一GPUで推論できるのか？ できるなら、最低限必要なGPUメモリはいくらか？**

### 5.2 従来アーキテクチャの反転

AirLLM の設計哲学は一言で言えばこうです：**モデルを圧縮してVRAMに収めるのではなく、「なぜモデル全体がメモリに常駐する必要があるのか」を問い直す。** GPU VRAMをキャッシュ、ディスクをプライマリストレージとして扱い、従来の推論アーキテクチャを反転。多少の速度低下と引き換えに、**すでに所有しているハードウェア**での実行を可能にします。

### 5.3 4つの核となる設計判断

1. **デフォルトで圧縮しない**：完全なモデル品質を維持。圧縮はあくまで任意 —— 量子化には常に精度コストが伴うため、「必要なときだけ量子化する」という答え
2. **計算ではなくI/Oボトルネックを狙う**：AirLLMのボトルネックはディスクロード。だから最適化するのは行列計算ではなくデータ転送
3. **HuggingFaceネイティブ**：標準の `AutoModel` APIを使い、すべてのHFモデルをそのまま動作させる
4. **フックベースのアーキテクチャ**：フォワードフックにより、アーキテクチャごとのattention/rotary/cache実装から切り離す

### 5.4 量子化に関する著者の鋭い洞察

> "Quantization normally needs to quantize both weights and activations to really speed things up. While in our case the bottleneck is mainly at the disk loading, we only need to make the model loading size smaller. So, we get to only quantize the weights' part, which is easier to ensure the accuracy."

**要約**：通常の量子化は重みとアクティベーションの両方を量子化して初めて効果が出ます。しかしAirLLMのボトルネックはディスクロードなので、ロードサイズを小さくするだけで十分 —— だから**重みだけを量子化**し、精度も維持しやすいのです。

> これは鋭い洞察です：**最適化の対象が、最適化の手段を決める。** ボトルネックが計算ではなくI/Oなら、アクティベーション量子化の精度コストを払う必要はないのです。

---

## 6. パフォーマンス：速度と容量のトレードオフ

### 6.1 速度と引き換えに容量を獲得

**VRAM使用量（70Bモデル）**
- 従来のフルロード：約 **140 GB**
- AirLLMの層別ロード：約 **4 GB**

**推論速度**
- 従来（A100）：10〜20トークン/秒
- AirLLM（4GB GPU）：約0.5〜2トークン/秒

**ボトルネック**
- 従来：ビデオメモリ
- AirLLM：ディスクI/O

**ハードウェア要件**
- 従来：マルチGPUのA100/H100
- AirLLM：一般的な4GBコンシューマーGPU

- 4-bit / 8-bit ブロック量子化で推論速度は最大 **3倍** 向上、精度劣化は「ほぼ無視できる」
- llama.cpp コミュニティの議論でも言及される通り：*"AirLLM only gets GPU-speed inference whilst the layer is executing, and it stops when waiting for the next layer to be loaded."*

---

## 7. 主流アプローチとの比較

- **AirLLM**：層ごとのディスクストリーミング。**遅いが忠実、VRAM最小** —— オフラインのバッチ処理に最適
- **llama.cpp / GGUF**：重み量子化＋CPU/GPUハイブリッド。精度劣化はあるが高速
- **HuggingFace Accelerate**：複数デバイスへのオフロード。**複数GPUが必要**
- **vLLM / TGI**：バッチ処理＋KVキャッシュ最適化。**大きなVRAMが必要**

> ポジショニング：AirLLMは「**大きなVRAMを持っていない**」という問題を解決。他は「**大量のトークンを効率的に処理したい**」という問題を解決します。

---

## 8. 制限と注意点

1. **遅い**：フルロードより10〜50倍遅い。オフラインのバッチ処理向けで、対話型のリアルタイムチャットには不向き
2. **ディスク容量が2倍に**：初回は元モデル＋分割コピーが必要。`delete_original=True` で整理を
3. **初回シャーディングに時間**：サイズとディスク性能により10〜30分
4. **I/O依存**：NVMe SSDを強く推奨。HDDは事実上使い物にならない
5. **Kimi K3のハード要件**：CUDA 12（13不可）、`transformers==4.56.x`（5.xは非互換）、`flash-attn`必須

---

## 9. まとめ：視点と結論

### 9.1 核となる視点

- **VRAMは推論の要件ではなくキャッシュ**：AirLLMは「VRAMをキャッシュ、ディスクをメインメモリ」とするアーキテクチャの実現可能性を証明。「大規模モデルには大きなVRAMが必要」という暗黙の前提に正面から挑戦した
- **最適化の対象が手段を決める**：ボトルネックがI/Oだからこそ重み量子化だけで済み、アクティベーション量子化の精度リスクを回避 —— 再利用可能なエンジニアリング的洞察
- **「動くこと」は「速いこと」に優先する**：ハードウェアが固定されているとき、まず0→1の問題を解決し、その後に1→Nの速度問題を解決する
- **MoEこそ超巨大モデルの鍵**：エキスパート単位ストリーミングにより2.8TのKimi K3がわずか3.72GBで動作。MoEのスパース性と層別推論は理想的な組み合わせ

### 9.2 開発者への示唆

- 大きなVRAMがなくても70B級モデルを扱える：**コンシューマーGPU＋AirLLMは低コストの実験プラットフォーム**
- HuggingFaceとのシームレスな互換性で**移行コストはほぼゼロ**
- オフラインのバッチ処理、研究実験、教育デモなど、レイテンシーを気にしない用途に最適

### 9.3 結論

AirLLM の意義は技術的なソリューションを超えて、**異なる思考様式のデモンストレーション**にあります。誰もが「モデルが大きすぎるから圧縮すべきだ」と前提するとき、AirLLMは逆の問いを投げかけます：「**なぜモデル全体がVRAMにある必要があるのか？**」—— 暗黙の前提への問い直しが、しばしばまったく新しい可能性の空間を切り開くのです。

**一言でまとめると**：AirLLM = ディスクとVRAMを交換し、速度と引き換えに参入障壁を下げる —— 大規模モデルを一般のハードウェアに取り戻す。

---

## 参考資料

- リポジトリ：https://github.com/lyogavin/airllm
- PyPI：https://pypi.org/project/airllm/
- 著者 Medium：https://medium.com/@lyo.gavin/unbelievable-run-70b-llm-inference-on-a-single-4gb-gpu-with-this-new-technique-93e2057c7eeb
- 引用形式：

```bibtex
@software{airllm2023,
  author = {Gavin Li},
  title = {AirLLM: scaling large language models on low-end commodity computers},
  url = {https://github.com/lyogavin/airllm/},
  version = {0.0},
  year = {2023},
}
```