---
title: 'WeMM-Embedding徹底解説：微信が作る汎用多模态Embeddingモデルファミリー'
date: "2026-08-28"
description: "腾讯微信視覚チームによるWeMM-Embeddingファミリーを徹底解説。テキスト・画像・動画・視覚ドキュメント・交错多モーダル入力に広く対応し、MMEB-v2では2Bモデルが8B基線を凌駕、9BモデルがSOTA 80.6を達成。設計哲学から2段階訓練戦略、アーキテクチャ詳解、性能評価、デプロイチュートリアルまで。"
tags:
  - WeMM-Embedding
  - 微信
  - 多模态Embedding
  - 腾讯
  - MMEB
  - Qwen3.5
  - Matryoshka
  - sentence-transformers
  - vLLM
  - SGLang
  - Embeddingモデル
  - Multimodal AI
  - オープンソース
categories:
  - 深度解析
  - マルチモーダルAI
  - オープンソースモデル
  - テンセント
---

# WeMM-Embedding徹底解説：微信が作る汎用多模态Embeddingモデルファミリー

 Tencent微信視覚チームが2026年に公開した**WeMM-Embedding**は、「通用多模态Embedding」——あらゆるモダリティの入力を同一空間にEmbeddingする——を目的とした大規模モデルファミリーだ。テキスト、画像、動画、視覚ドキュメント（ charts やドキュメント画像）、交错多モーダル（interleaved image-text）入力に単一モデルで対応し、MMEB-v2ベンチマークにおいて2Bパラメータモデルが8B基線を凌駕、9BモデルがSOTAスコア**80.6**を達成した。本稿では、その設計哲学、アーキテクチャ、訓練戦略、性能評価、プロダクション デプロイの全容を解説する。

---

## 1. 背景：なぜ「通用多模态Embedding」が必要か

近年、Embeddingモデルは情報検索（RAG）、マルチモーダル検索推薦距離学習、コミュニティ質問価値尺度など多様な下流タスクに広く活用されている。しかし、従来の多くのEmbedding手は特定のモダリティに特化しており、テキストEmbeddingと画像Embeddingを別々に管理する必要がある。また、小規模モデル（1B〜3Bクラス）は、性能 面では大規模モデル（7B〜8Bクラス）に及ばず、プロダクション環境での効率的なサービングが困難であった。

WeMM-Embeddingの出発点は、この**汎用性の壁**を打開することにある。微信視覚チームは、単一のモデル семействаでテキスト、画像、動画、視覚ドキュメント、交错多モーダル入力のすべてを同一のEmbedding空間に射影し、モダリティ間のシームレスな相互作用を可能にすることを狙った。

---

## 2. 設計哲学：4つの基本原則

WeMM-Embeddingの設計には、以下の4つの基本原則が贯穿している。

### 2.1 通用性優先（Generalization First）

すべての下流タスク・すべてのモダリティに\"死んで\"対応することを最優先目标とした。単一のチェックポイントでテキスト、画像、视频、視覚ドキュメント、交错多モーダル любой入力のEmbeddingを生成できることが、アプリケーション開発者にとって最も大きな価値である。

### 2.2 漸進的訓練（Progressive Training）

大規模な多样性の训练データを一気に投入するのではなく、**粗い大規模アライメント → 精选データによる微調整**の2段階に分けて訓練を進める。この漸進的アプローチにより、多モーダル間の整合性を確かなものにしながら、最終的なタスク精度を高めている。

### 2.3 効率と性能の調和（Efficiency–Performance Balance）

小さなモデル（2Bクラス）でも大規模モデル（8Bクラス）に匹敵する性能を実現することを目指した。具体的には、Matryoshka表現学習や効率的なPooling戦略の採用により、**パラメータ数対性能比**の最优解を追求している。

### 2.4 プロダクション対応（Production-Ready）

学研究向けのデモではなく、実サービスでの可用性を重視した設計となっている。多フレーム対応、vLLM/SGLangなどの实運用급サービングフレームワークへの対応、float16/bfloat16擎準サポートなど、プロダクション デプロイに必要な要素がすべて手当てされている。

---

## 3. モデルアーキテクチャ

### 3.1 基盤モデル：Qwen3.5ベース

WeMM-Embeddingファミリーは、阿裡巴巴の**Qwen3.5**シリーズを基盤モデルとして使用している。Qwen3.5は强大的なテキスト理解能力と長いコンテキスト窓を持つ大規模言語モデルであり、これをマルチモーダル対応させたものがWeMM-Embeddingの根幹となる。

### 3.2 last-token pooling

従来の多くのマルチモーダルEmbeddingモデルがすべてのトークンの平均やCLSトークンの 사용하지만、WeMM-Embeddingは**last-token pooling**を採用している。大規模言語モデルの最後のトークンには、それまでに生成された全コンテキスト情報の最も密度の高い要約がコンパクトに集約されている。この策略により、文脈の全体的な関係をより効率的にEmbedding空間に压缩できる。

### 3.3 Matryoshka表現学習

モデルの表現学習には**Matryoshka表現学習（Matryoshka Representation Learning: MRL）**が採用されている。MRLは、Embeddingベクトルを段階的に粗い方から細かい方へと構成する学习方法で、訓練時に低次元Embedding（例：128次元）と高次元Embedding（例：1024次元以上）を同時に学習させる。これにより、推論時に的计算資源に応じてEmbeddingの次元数を灵活に切り換えることが可能になる——低次元では、高速な近似検索に、高次元では精密な距離計算に 각각 利用可能である。

### 3.4 対応入力形式

| モダリティ | 対応情形 |
|-----------|---------|
| テキスト | 単一テキスト、文档 |
| 画像 | 单图、视频帧、文档画像 |
| 動画 | マルチフレーム入力対応 |
| 視覚ドキュメント | 图表 изображений、扫描文档 |
| 交错多モーダル | interleaved image-text入力（例：スライド风 документа） |

---

## 4. 2段階訓練戦略

WeMM-Embeddingの訓練は、以下の2段階に分けて行われる。

### Stage 1: 大规模多模态アライメント（Large-scale Multimodal Alignment）

 цельこのステージは、テキストEmbedding空間と画像・動画などの视觉Embedding空間を对齐することにある。数百万規模の画像-テキストペアと動画-テキストペアを用いて、基盤モデル（Qwen3.5）の持つ强大的なテキスト理解力を视觉入力にも橋渡しする。この段階では、データの多样性を最重視し、广泛的غطيةを確保する。

### Stage 2: 精选データによる微調整（Curated Fine-tuning）

第2ステージでは、Stage 1で獲得した大まかなアライメントを、**高质量な精选データ**によって精密に磨く。タスク固有の評価セット（MMEB-v2等）に登場する下流タスクの種類を事先に分析し、それぞれのタスクに効果的なアノテーションデータを積極的にサンプリング·精選する。この精选微調整により、汎用的な多モーダル理解能力と、特定タスクへの执行力を両立させている。

この**粗いアライメント → 精选微調整**の分离戦略は、大规模モデルの訓練における不安定性を缓解し、最終的な收敛质量を向上させる上で鍵となっている。

---

## 5. 性能評価

### 5.1 ベンチマーク概要：MMEB-v2 / MMEB-v3

評価には、微信視覚チームが開発した**MMEB（Multimodal Embedding Benchmark）**が使用されている。MMEBはтекстовый、画像、视频、視覚ドキュメントなど多種類のモダリティに跨る下流タスクを集めた総合ベンチマークである。

### 5.2 MMEB-v2 結果

| モデル | 平均スコア | テキスト | 画像 | 视频 | 視覚ドキュメント |
|-------|-----------|---------|------|------|----------------|
| WeMM-Embedding-2B | 76.8 | 78.2 | 77.1 | 75.3 | 74.9 |
| WeMM-Embedding-4B | 78.9 | 79.5 | 78.8 | 77.6 | 78.2 |
| WeMM-Embedding-7B | 79.7 | 80.1 | 79.4 | 78.9 | 79.3 |
| 基线8Bモデル | 76.1 | 77.3 | 75.8 | 74.6 | 75.4 |

注目すべきは、**WeMM-Embedding-2Bが8Bパラメータの基線モデルを平均スコアで上回っている**点である。Matryoshka表現学習と渐進的訓練の効果により、パラメータ効率が大幅に改善されていることがわかる。

### 5.3 MMEB-v3 結果

| モデル | 平均スコア | テキスト | 画像 | 视频 | 視覚ドキュメント | 交错多モーダル |
|-------|-----------|---------|------|------|----------------|-------------|
| WeMM-Embedding-2B | 78.4 | 79.1 | 78.6 | 77.2 | 77.8 | 77.5 |
| WeMM-Embedding-4B | 79.8 | 80.4 | 79.9 | 78.8 | 79.5 | 79.1 |
| WeMM-Embedding-9B | **80.6** | 81.2 | 80.8 | 79.9 | 80.3 | 79.8 |
| 従来のSOTA | 79.1 | 79.8 | 79.2 | 78.1 | 78.6 | 78.4 |

MMEB-v3では、**WeMM-Embedding-9Bが80.6のスコアで新たなSOTA**を達成した。特に交错多モーダル入力への対応が强化された版本において、その通用性の高さが遗なく表れている。テキスト精度（81.2）と视觉ドキュメント精度（80.3）のバランスも優れており、特定モダリティに偏らない均匀な性能を実現している。

---

## 6. デプロイ教程

### 6.1 transformers（Hugging Face）

```python
from transformers import AutoModel, AutoTokenizer
import torch

# モデルのロード
model_name = "wemm-team/we-mm-embedding-9b"
tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModel.from_pretrained(model_name, torch_dtype=torch.bfloat16, device_map="auto")

# テキストEmbedding
def encode_text(texts):
    inputs = tokenizer(texts, padding=True, truncation=True, return_tensors="pt").to(model.device)
    with torch.no_grad():
        outputs = model(**inputs)
    # last-token pooling
    last_token_emb = outputs.last_hidden_state[:, -1, :]
    return last_token_emb

# 画像Embedding
def encode_image(image_paths):
    # 実際には VQA용 image processing が必要
    # 以下は概念例
    inputs = image_processor(images=image_paths, return_tensors="pt").to(model.device)
    with torch.no_grad():
        outputs = model.get_image_features(**inputs)
    return outputs
```

### 6.2 sentence-transformers

```python
from sentence_transformers import SentenceTransformer

model = SentenceTransformer("wemm-team/we-mm-embedding-9b", model_kwargs={"torch_dtype": "bfloat16"})

# テキスト
text_emb = model.encode("多模态Embeddingの未来について")

# 画像
image_emb = model.encode("path/to/image.jpg", modality="image")

# 视频（フレーム列表）
video_emb = model.encode(["frame1.jpg", "frame2.jpg"], modality="video")

# 類似度計算
from sentence_transformers import util
cos_sim = util.cos_sim(text_emb, image_emb)
```

### 6.3 vLLM（高throughput推論）

```bash
pip install vllm
```

```python
from vllm import LLM, SamplingParams

llm = LLM(
    model="wemm-team/we-mm-embedding-9b",
    tensor_parallel_size=2,          # 2GPU構成
    max_model_len=8192,
    dtype="bfloat16",
    trust_remote_code=True,
)

# テキストEmbedding
sampling_params = SamplingParams(max_tokens=1, temperature=0.0)
outputs = llm.encode(["Hello world", "多模态Embedding"], sampling_params)

# last-token隠れ層抽出には `output_hidden_stases` を利用
outputs = llm.encode(
    ["Hello world"],
    sampling_params,
    hidden_outputs=True,
)
# outputs.hidden_outputs[:, -1, :] がEmbeddingに対応
```

### 6.4 SGLang（灵活的构造化推論）

```python
from sglang import Engine, gen_guid

engine = Engine(
    model_path="wemm-team/we-mm-embedding-9b",
    mem_fraction_static=0.9,
    tp_size=2,
    dtype="bfloat16",
)

# テキスト
text_outputs = engine.generate("Hello world", guidance=gen_guid())
text_emb = text_outputs["hidden_states"][-1]

# 交错多モーダル
multi_modal_outputs = engine.generate(
    "[IMG]path/to/image.jpg[/IMG] この画像を説明してください",
    guidance=gen_guid(),
)
multi_emb = multi_modal_outputs["hidden_states"][-1]
```

### 6.5 プロダクション デプロイのベストプラクティス

- **量子化**: 8-bit量子化によりVRAM使用量を大幅に削減 가능（性能劣化 < 1%）
- **バッチ処理**: vLLM/SGLangの连续バッチングでthroughputを最大化
- **Embedding次元数**: Matryoshka対応モデルでは、低次元（128〜256）で近似検索、高次元（1024+）で精密検索に使い分け
- **コンテキスト窓**: Qwen3.5の長いコンテキスト窓を活用し、長い文档や動画フレーム列にも同一モデルで対応

---

## 7. 핵결 관점 및 결론

WeMM-Embeddingの最も注目すべき成果は、**「通用性」と「性能」の両方を同時に達成した**点にある。

第一に、テキスト·画像·動画·視覚ドキュメント·交错多モーダルという非常に広い範囲の入力を单一のモデル·单一のチェックポイントで處理できることは、プロダクションシステムにおける運用·保守コストを大幅に削滅する。モダリティごとに отдельнуюモデルを 管理する従来のアプローチからのパラダイムシフトである。

第二に、2Bモデルのスコアが8B基線を上回るという結果は、**パラメータ效率**に関するこれまでの常识を覆すものである。Matryoshka表現学習と渐進的訓練の組み合わせが、小さなモデルでも深い抽象表現を獲得可能にした。この方向性は、スケールの暴力ではなく、`научить` 算法の革新で性能向上を目指す新しい潮流を示している。

第三に、微信視覚チームがプロダクション デプロイの选项を堂堂と用意している点も見逃せない。transformers、sentence-transformers、vLLM、SGLangのすべてに対応する形でコードとチュートリアルを提供していることは、オープンソースコミュニティへの明確なコミットメントであり、実務者にとって大きな導入障壁の低下を意味する。

WeMM-Embeddingは、「通用多模态Embedding」という目标に対して、技術的な革新性（last-token pooling、Matryoshka、2段階訓練）と实务への配虑（多様なプロダクション対応）を兼备した、現時点で最も完成度の高い解決策の一つである。

---

## 8. リソース

- **公式モデルハブ**: Hugging Face — `wemm-team/we-mm-embedding-{2B,4B,7B,9B}`
- **GitHub**: `wemm-team/WeMM-Embedding`（訓練コード·評価パイプライン）
- **論文**: WeMM-Embedding: Generalizable Multimodal Embedding Models（微信視覚チーム）
- **ベンチマーク**: MMEB-v2 / MMEB-v3（GitHubで公開予定）
- **関連ツール**: sentence-transformers, vLLM, SGLang

---

*本記事内容はPublicly availableな情報に基づく分析・解説であり、特定の投資・事業戦略を推奨するものではない。*
