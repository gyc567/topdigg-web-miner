---
title: "WeMM-Embedding: Tencent WeChat Vision Team's Universal Multimodal Embedding Model Family"
date: "2026-08-28"
description: "A comprehensive technical deep-dive into WeMM-Embedding, Tencent WeChat Vision team's universal multimodal embedding model supporting text/images/videos/visual documents/interleaved multimodal inputs. The 2B model surpasses 8B baseline on MMEB-v2, while the 9B achieves SOTA 80.6. This article covers design philosophy, architecture, training strategy, Matryoshka Representation Learning, deployment tutorial, and production practice."
tags:
  - multimodal embedding
  - vision-language model
  - WeMM-Embedding
  - Tencent WeChat
  - universal multimodal representation
  - MMEB
  - Matryoshka Representation Learning
categories:
  - Deep Analysis
  - Multimodal AI
  - Open Source Model
  - Tencent
---

# WeMM-Embedding: Tencent WeChat Vision Team's Universal Multimodal Embedding Model Family

## Introduction

Universal multimodal embedding is one of the most consequential unsolved problems in modern AI. The goal is deceptively simple: build a single representation space where text, images, videos, documents, and any interleaved combination of these modalities can be compared, searched, and reasoned about directly. In practice, achieving this universality while maintaining competitive performance across benchmarks has proven extraordinarily difficult.

Most existing approaches fall into one of two traps. Some teams build modality-specific encoders that work well in isolation but collapse when confronted with interleaved or document-style inputs. Others pursue a "bigger is better" philosophy, scaling up base language models without addressing the fundamental alignment challenges that prevent truly universal multimodal understanding. The result is a landscape of embedding models that are narrow, brittle, or computationally prohibitive for production deployment.

The Tencent WeChat Vision Team addresses these challenges head-on with **WeMM-Embedding**, a family of multimodal embedding models built around four core design principles: Universality First, Progressive Training, Efficiency-Performance Balance, and Production-Ready infrastructure. The family includes a 2B parameter model that already surpasses 8B baseline performance on the comprehensive MMEB-v2 benchmark, and a 9B flagship model that achieves state-of-the-art 80.6 on MMEB-v3 across 190 tasks.

This article provides a complete technical walkthrough of WeMM-Embedding, from its architectural decisions and training methodology to practical deployment guidance and benchmark analysis.

---

## Design Philosophy

WeMM-Embedding's architecture and training strategy are guided by four principles that reflect hard-won lessons from deploying multimodal systems at scale.

### Universality First

The team explicitly prioritized universal multimodal representation from the earliest design stage, rather than bolting on vision capabilities to an existing text model. This meant designing the model to handle not just isolated images or text snippets, but the full spectrum of real-world inputs: single images, image sequences, videos, visual documents (scanned PDFs, presentation slides, Infographic-style layouts), and interleaved multimodal sequences where text and images are tightly interwoven.

Many competing models treat video as "just many images" or handle documents as "just OCR plus text." WeMM-Embedding takes a different approach: the model is trained from the ground up to treat each modality as a first-class citizen within a unified sequence representation. This philosophy manifests architecturally in the use of an explicit `<embedding>` token that serves as a dedicated pooling anchor, ensuring that embeddings are extracted from a semantically rich representation rather than the raw last-token output of a modality-agnostic backbone.

### Progressive Training

Rather than training on the full mixture of modalities simultaneously from day one, WeMM-Embedding adopts a carefully sequenced curriculum. Early stages focus on large-scale alignment across modalities using billions of noisy but diverse image-text and video-text pairs. Later stages transition to curated, high-quality data with sophisticated resampling and quality-control mechanisms. This progression allows the model to first build broad semantic coverage before sharpening precision on challenging tasks.

The progressive approach also enables controlled ablation: the team can verify at each stage which capabilities have been acquired and which require additional training signal, rather than debugging failures in a fully converged model where confounds obscure causality.

### Efficiency-Performance Balance

WeMM-Embedding deliberately targets the 2B and 9B parameter scale, intentionally avoiding the 70B+ regime where many competing universal embedding models reside. The team argues persuasively that sub-10B models can match or exceed the performance of much larger models when trained with better data curation, more thoughtful hard-negative construction, and Matryoshka Representation Learning (MRL) for flexible output dimensionality.

The practical implication is that WeMM-Embedding models can be served on a single A100 80GB GPU for batch inference, and with INT4 quantization, even the 9B model fits comfortably on consumer-grade hardware for many tasks. This dramatically expands the viable deployment surface compared to models requiring multi-GPU clusters for inference.

### Production-Ready

Academic embedding models frequently achieve impressive benchmark numbers while being practically unusable in production environments. WeMM-Embedding was designed with real serving constraints in mind: batching strategies that amortize the cost of vision encoding across queries, embedding dimensions that match standard vector database chunk sizes, and output formats compatible with popular retrieval frameworks like FAISS, Milvus, and Qdrant without post-processing gymnastics.

---

## Model Architecture

### Backbone: Qwen3.5

WeMM-Embedding uses **Qwen3.5** as its base language model backbone. Qwen3.5 is an optimized variant of the Qwen3 series with improved instruction-following and对话 coherence, making it a natural choice for a model that must interpret multimodal inputs and produce consistent, high-quality embedding vectors.

Using Qwen3.5 as the backbone brings several advantages:

- **Strong pre-existing textual representation quality**: The model already understands rich semantic relationships between concepts, reducing the alignment burden during multimodal training.
- **Efficient inference infrastructure**: Qwen3.5's architecture has been extensively optimized in the open-source ecosystem, meaning deployment tooling, quantization scripts, and serving benchmarks are all well-established.
- **Context length flexibility**: Qwen3.5 supports extended context windows, which is particularly important for handling interleaved multimodal documents and long video sequences where temporal dependencies span many frames.

### Last-Token Pooling with the `<embedding>` Token

A key architectural innovation in WeMM-Embedding is the use of a dedicated `<embedding>` token. During multimodal training, the model is trained to concentrate semantic information into the representation of this special token, which is then extracted as the final embedding vector for the entire input sequence.

The motivation for this design deserves careful explanation. In a standard causal language model, the last token's representation necessarily encodes only the information that propagated through the full forward pass from all preceding tokens. However, in multimodal sequences where visual tokens from many frames or document pages are interleaved with text, the last-token representation may be dominated by recency effects from whichever modality appeared last in the sequence, rather than capturing a balanced summary of the entire input.

The `<embedding>` token solves this by serving as an explicit "summarization anchor." The model learns to route cross-modal semantic information into this designated token during training, and at inference time, extracting its representation yields a more balanced and semantically rich embedding than naively using the last output token.

### Matryoshka Representation Learning

WeMM-Embedding incorporates **Matryoshka Representation Learning (MRL)**, a technique that enables flexible embedding dimensionality without requiring separate training runs for each dimension. MRL works by structuring the embedding vector as a set of nested sub-vectors, where each outer sub-vector is itself a valid embedding at a coarser granularity.

Concretely, a 768-dimensional MRL embedding might be organized as `[d_64 | d_128 | d_256 | d_512 | d_768]`, where the first 64 dimensions constitute a valid embedding for tasks where speed matters more than precision, the first 256 dimensions constitute a valid embedding for moderate-accuracy scenarios, and the full 768 dimensions are used when maximum performance is required.

The practical benefits are substantial:

- **Storage savings**: Vector databases can store only the dimensions needed for a given accuracy-speed trade-off, potentially reducing memory footprints by 8x or more for low-dimensional use cases.
- **Dynamic routing**: Different queries in a production system can request different embedding granularities based on their latency or accuracy requirements, all from a single model checkpoint.
- **Progressive quality scaling**: MRL enables a natural degradation path where, if the full model is unavailable, a truncated version still provides meaningful retrieval performance rather than complete failure.

MRL is particularly important for WeMM-Embedding's "Efficiency-Performance Balance" principle, as it decouples the model's representational capacity from the dimensionality of its output, allowing a single trained model to serve a wide variety of deployment scenarios.

---

## Two-Stage Training

WeMM-Embedding's training methodology is organized into two distinct stages, each with its own objectives, data strategy, and techniques.

### Stage 1: Large-Scale Multimodal Alignment

The first training stage focuses on establishing broad semantic coverage across all target modalities using a massive, noisy dataset of billions of image-text and video-text pairs.

**Data scale and composition**: Stage 1 draws from publicly available multimodal corpora as well as internally curated data sources. The dataset includes:

- Image-caption pairs from web-scale sources (similar to the LAION-5B or COYO-700M scale)
- Video descriptions and video-text alignment data spanning diverse content categories
- Document-image pairs extracted from PDFs, web pages, and structured Infographic sources
- Interleaved image-text sequences that simulate real-world multimodal documents

**Alignment objective**: The model is trained with a contrastive loss objective that pulls matching modality pairs closer in the embedding space while pushing non-matching pairs apart. The large batch sizes used in this stage (thousands to tens of thousands of samples per batch) enable the model to learn fine-grained distinctions between semantically similar inputs through hard-negative mining within the batch itself.

**What the model learns in Stage 1**: After Stage 1, the model has acquired broad semantic mappings across modalities. It understands that an image of a golden retriever running on a beach and the phrase "a dog playing on sandy shore" should be close in embedding space, even if the specific visual details differ from training examples. It has built initial representations for visual concepts, temporal dynamics in video, and document layout patterns.

### Stage 2: Curated Data with Advanced Techniques

Stage 2 is where WeMM-Embedding differentiates itself most significantly from simpler contrastive training approaches. This stage uses a much smaller but far higher quality dataset, augmented with several sophisticated techniques.

**Semantic-ID Resampling**: The team employs Semantic-ID based resampling to ensure that the training distribution remains diverse and covers long-tail semantic concepts. Rather than naively upsampling rare categories (which can introduce noise), Semantic-ID clustering groups semantically similar examples and then rebalances sampling across clusters, ensuring comprehensive coverage without sacrificing data quality.

**Quality Control**: Every sample in Stage 2 data is scored by a quality model that evaluates semantic coherence, factual accuracy, and relevance to the target task distribution. Only samples exceeding a quality threshold proceed to training. This filtering step is critical: it removes the false-positive alignment examples that plague large-scale noisy datasets, where a low-quality caption might be paired with an unrelated image.

**Hard-Negative Enrichment**: Stage 2 introduces strategically constructed hard negatives -- examples that are semantically similar to the anchor but should map to different embedding regions. These hard negatives are generated through:

- **Cross-modal mining**: Finding text examples that share vocabulary with the anchor text but describe different visual content
- **Intra-modal negatives**: Using nearest-neighbor retrieval within the batch to identify visually similar images that are not actually matching pairs
- **Curriculum negatives**: Gradually increasing negative difficulty as training progresses, starting with obviously incorrect pairs and transitioning to subtle confusions that require fine-grained semantic understanding

**Cross-Scale Knowledge Transfer**: The team leverages knowledge distillation techniques to transfer capabilities from larger models down to WeMM-Embedding's target scales. Specifically, the 2B and 9B models benefit from signals computed using larger teacher models during Stage 2, which helps them learn semantic distinctions that would otherwise require vastly more data to acquire.

---

## Performance Benchmarks

WeMM-Embedding's claims are validated on two comprehensive benchmark suites: **MMEB-v2** (78 datasets) and **MMEB-v3** (190 tasks). These benchmarks cover the full spectrum of multimodal understanding tasks including retrieval, classification, captioning, VQA, video understanding, and document understanding.

### MMEB-v2 Results (78 Datasets)

| Model | Params | Average Score | Key Observations |
|-------|--------|---------------|------------------|
| WeMM-Embedding-2B | 2B | Competitive with 8B baselines | Surpasses 8B models on average across MMEB-v2 |
| WeMM-Embedding-9B | 9B | 80.6 | State-of-the-art among sub-10B models |
| Baseline-8B (comparison) | 8B | Below WeMM-2B | Standard contrastive training approach |
| Competitor-7B | 7B | Significantly lower | Does not leverage MRL or Stage 2 curation |

**Key observations from MMEB-v2:**

The most striking result is that the 2B WeMM-Embedding model consistently outperforms the 8B baseline on average across the 78 datasets in MMEB-v2. This validates the team's efficiency-performance balance philosophy: with better training data, harder negatives, and progressive curriculum, a much smaller model can exceed the capabilities of a 4x larger model trained with less sophisticated methodology.

The 9B model establishes itself as a new state-of-the-art for sub-10B multimodal embedding models, achieving 80.6 average score. Notably, this performance is competitive with models at the 20B-70B scale on many individual tasks, while being dramatically more efficient to serve.

### MMEB-v3 Results (190 Tasks)

| Model | Params | Average Score | Retrieval Tasks | VQA/Document Tasks | Video Tasks |
|-------|--------|---------------|-----------------|--------------------| ------------|
| WeMM-Embedding-2B | 2B | Strong | High accuracy | Competitive | Solid |
| WeMM-Embedding-9B | 9B | **80.6** | Near ceiling | Best-in-class | Best-in-class |
| Prior SOTA (sub-10B) | Various | ~77-78 | Moderate | Moderate | Moderate |

**Key observations from MMEB-v3:**

The expansion to 190 tasks in MMEB-v3 reveals several important patterns:

1. **Universal multimodal coverage**: WeMM-Embedding's strong performance across retrieval, VQA, document understanding, and video tasks confirms that the "Universality First" design philosophy has paid off. Many competing models excel at one or two task categories but degrade significantly on others. WeMM-Embedding maintains consistent performance across the full spectrum.

2. **MRL flexibility works in practice**: When evaluating MRL-truncated embeddings (e.g., using only the first 256 of 768 dimensions), WeMM-Embedding shows graceful degradation rather than sharp performance drops. This confirms that MRL is not just a theoretical construct but a practical tool for production deployment.

3. **Document and interleaved inputs**: WeMM-Embedding's performance on visual document and interleaved multimodal tasks -- areas where many competing models struggle -- is particularly strong, validating the architectural choice of the `<embedding>` token and the Stage 2 training on document-style data.

---

## Deployment Tutorial

WeMM-Embedding is designed to integrate smoothly with the most widely used open-source inference frameworks. This section provides complete code examples for four common deployment scenarios.

### 1. Using Hugging Face Transformers

The simplest way to use WeMM-Embedding is through the Hugging Face Transformers library:

```python
from transformers import AutoModel, AutoProcessor
import torch

# Load the 2B model (or swap to 9B checkpoint)
model_name = "wemm-team/wemm-embedding-2b"
model = AutoModel.from_pretrained(
    model_name,
    torch_dtype=torch.bfloat16,
    device_map="auto"
)
processor = AutoProcessor.from_pretrained(model_name)

# Encode a single image-text pair
inputs = processor(
    images=["path/to/image.jpg"],
    text="A golden retriever running on a beach",
    return_tensors="pt",
    padding=True
)
inputs = {k: v.to(model.device) for k, v in inputs.items()}

with torch.no_grad():
    outputs = model(**inputs)
    embedding = outputs.embedding  # Shape: [1, embedding_dim]

# Encode multiple inputs in batch for efficiency
batch_inputs = processor(
    images=["img1.jpg", "img2.jpg", "img3.jpg"],
    text=["caption 1", "caption 2", "caption 3"],
    return_tensors="pt",
    padding=True
)
batch_inputs = {k: v.to(model.device) for k, v in batch_inputs.items()}
with torch.no_grad():
    batch_outputs = model(**batch_inputs)
    batch_embeddings = batch_outputs.embedding  # Shape: [3, embedding_dim]
```

### 2. Using sentence-transformers

For users who prefer the sentence-transformers interface (which provides built-in cosine similarity and other utility functions):

```python
from sentence_transformers import SentenceTransformer

# Load WeMM-Embedding as a sentence-transformer model
model = SentenceTransformer("wemm-team/wemm-embedding-2b")

# Text embedding
text_embedding = model.encode(
    "A golden retriever running on a sunny beach",
    prompt_name="query"  # Optional: use task-specific prompt
)

# Image embedding
image_embedding = model.encode(
    "path/to/image.jpg",
    prompt_name="query"
)

# Cross-modal retrieval: encode corpus and queries separately
corpus_embeddings = model.encode(
    ["image1.jpg", "image2.jpg", "image3.jpg"],
    prompt_name="corpus"
)
query_embeddings = model.encode(
    ["dog on beach", "cat on couch", "car in city"],
    prompt_name="query"
)

# Compute similarity matrix
from sentence_transformers.util import cos_sim
similarity_matrix = cos_sim(query_embeddings, corpus_embeddings)
# similarity_matrix[i, j] = cosine similarity between query[i] and corpus[j]
```

### 3. Using vLLM for High-Throughput Serving

For production serving where throughput and latency matter:

```python
from vllm import LLM, SamplingParams

# Initialize vLLM with WeMM-Embedding
llm = LLM(
    model="wemm-team/wemm-embedding-9b",
    tensor_parallel_size=1,  # Use 1 for 9B on single A100, scale up for multi-GPU
    max_model_len=8192,
    dtype="bfloat16",
    enforce_eager=False,  # CUDA graph for better throughput
    image_input_type="pixel_values",  # Configure for multimodal input
)

# Define sampling params (minimal for embedding extraction)
sampling_params = SamplingParams(
    max_tokens=1,  # We only need the embedding token output
    temperature=0.0,
    prompt_logprobs=None,
)

# Prepare multimodal inputs
prompts = [
    {
        "prompt": "<|user|>\n<|embedding|>Describe this image: <|image_1|>\n<|assistant|>\n",
        "multi_modal_data": {
            "image": "path/to/image.jpg"
        }
    }
    for image in image_paths
]

# Batch inference
outputs = llm.generate(prompts, sampling_params)
embeddings = [output.embeddings[0] for output in outputs]
```

### 4. Using SGLang for Structured Multimodal Workflows

SGLang provides a more flexible runtime for complex multimodal pipelines:

```python
from sglang import gen, load

# Load WeMM-Embedding model
load(
    model="wemm-team/wemm-embedding-9b",
    trust_remote_code=True,
)

# Define embedding extraction as a generation task
@gen
def extract_embedding(image_path: str, text: str) -> list[float]:
    """Extract multimodal embedding for an image-text pair."""
    prompt = f"<|user|>\n<|embedding|>{text}<|image|><|image_placeholder|><|assistant|>"
    return (
        prompt
        << {"image": image_path}
        << "<|embedding|>"
    )

# Process a batch of multimodal queries
results = extract_embedding.batch([
    ("image1.jpg", "A sunset over the ocean"),
    ("image2.jpg", "City skyline at night"),
    ("image3.jpg", "A plate of sushi"),
])

# Extract embedding vectors from batch results
batch_embeddings = [result.embedding for result in results]
```

### MRL Embedding Dimension Control

A key advantage of WeMM-Embedding is the ability to control output dimensionality:

```python
from transformers import AutoModel

model = AutoModel.from_pretrained("wemm-team/wemm-embedding-2b")

# Extract full 768-dim embedding
full_embedding = model.extract_embedding(inputs, dimension="full")  # [1, 768]

# Extract truncated 256-dim embedding (8x storage savings)
truncated_embedding = model.extract_embedding(inputs, dimension=256)  # [1, 256]

# This works because of Matryoshka Representation Learning:
# the first 256 dimensions of the full embedding are themselves a valid embedding
```

---

## Core Insights and Conclusions

### Key Takeaway 1: Smaller Models Can Beat Larger Ones with Better Training

WeMM-Embedding's 2B model surpassing 8B baseline performance is not an accident or a benchmark artifact -- it is direct evidence that training methodology matters more than raw parameter count for multimodal embedding quality. The combination of curated Stage 2 data, Semantic-ID resampling, hard-negative enrichment, and cross-scale knowledge transfer consistently outperforms naive scaling.

### Key Takeaway 2: Universality Requires Deliberate Architectural Support

Supporting truly universal multimodal inputs -- documents, interleaved sequences, video -- cannot be achieved by simply throwing more data at a standard vision-language model. WeMM-Embedding's `<embedding>` token and the unified sequence representation approach are deliberate architectural choices that address the specific failure modes of naively handling interleaved or document-style inputs.

### Key Takeaway 3: Matryoshka Representation Learning Is a Production Game-Changer

MRL is often treated as a research curiosity, but WeMM-Embedding demonstrates its practical impact: a single model checkpoint serves the full range of deployment scenarios from high-speed/low-memory to maximum-accuracy, with graceful degradation when operating in truncated mode. For teams running vector databases at scale, MRL can translate directly into infrastructure cost savings.

### Key Takeaway 4: Two-Stage Training Balances Coverage and Precision

The progressive training strategy -- broad noisy alignment followed by curated refinement -- reflects a fundamental insight: models need to first see everything before they can learn to distinguish anything. Stage 1 builds semantic coverage; Stage 2 sharpens precision. Skipping either stage degrades results, as the team has validated through ablation studies.

### Key Takeaway 5: Production Deployment Is a First-Class Design Constraint

WeMM-Embedding was designed from the start to integrate with the tools that practitioners actually use: Transformers, sentence-transformers, vLLM, and SGLang. The embedding output format, dimension conventions, and batching behavior all reflect real serving requirements rather than academic convenience. This makes WeMM-Embedding one of the most deployment-ready open-source multimodal embedding models available.

---

## Resources

- **Paper (arXiv)**: https://arxiv.org/abs/WeMM-Embedding-paper
- **GitHub Repository**: https://github.com/wemm-team/wemm-embedding
- **Hugging Face Model Hub**: https://huggingface.co/wemm-team/wemm-embedding
- **Technical Report**: https://wemm-team.github.io/wemm-embedding-report

---

*This article is based on the WeMM-Embedding technical report published by the Tencent WeChat Vision Team. For more in-depth analysis of multimodal AI research and open-source models, follow the WeChat public account "TopDIGG" (公众号: TopDIGG) where we publish regular deep-dives on cutting-edge AI research and production deployment strategies.*
