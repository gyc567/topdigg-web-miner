---
title: "WeMM-Embedding：騰訊微信視覺團隊的多模態 Embedding 模型家族解析"
date: "2026-08-28"
description: "騰訊微信視覺團隊開源的 WeMM-Embedding，支援文本、圖像、視頻、視覺文件和交錯多模態輸入，在 MMEB-v2 榜單上 2B 模型超越 8B 基線，9B 模型達到 SOTA。涵蓋設計哲學、架構解析、訓練策略、MRL 維度壓縮、部署教程和行業實踐。"
tags:
  - 多模態 Embedding
  - WeMM-Embedding
  - 微信視覺團隊
  - Matryoshka 表示學習
  - MRL 維度壓縮
  - MMEB benchmark
  - 開源模型
  - Qwen3.5
categories:
  - 深度解析
  - 多模態AI
  - 開源模型
  - 騰訊
---

# WeMM-Embedding：騰訊微信視覺團隊的多模態 Embedding 模型家族解析

## 背景：為什麼需要通用多模態 Embedding

在多模態人工智慧快速發展的今天，檢索增強生成（RAG）已成為企業知識庫問答、文件和影像搜尋等場景的核心技術。然而，現有的 Embedding 模型往往只能處理單一模態——純文本或純圖像——無法有效支援真實世界複雜的交錯多模態輸入。

騰訊微信視覺團隊注意到了這一痛點。他們發現，企業級應用場景中存在大量需要同時理解文本、圖像、視頻和視覺文件的查詢，例如：

- 使用者上傳一張產品截圖，並附帶文字描述「這款手機的散熱表現如何」
- 醫療報告同時包含文字診斷結論和超聲影像截圖
- 法律文件摻雜掃描圖像、文字段落和表格

這些場景要求 Embedding 模型具備真正的多模態理解能力，而不僅僅是簡單的「先 OCR 再向量化」。WeMM-Embedding（WeChat Multimodal Multilingual Embedding）正是為了解決這個問題而生。

微信視覺團隊提出的核心問題是：能否用一個統一的模型，同時支援文本、圖像、視頻、視覺文件和交錯多模態輸入，並在多個 benchmark 上達到甚至超越專業模型的表現？答案是肯定的，WeMM-Embedding 家族就是他們給出的答案。

## 設計哲學：4 個核心原則

WeMM-Embedding 的設計並非一蹴而就，而是基於團隊對多模態 Embedding 實際應用場景的深度反思。在論文與官方技術文件中，團隊詳細闡述了四個核心設計原則：

### 原則一：回歸統一化（Back to Unified）

團隊認為，多模態 Embedding 的終極目標不是訓練多個專用模型，而是用一個統一模型處理所有輸入類型。這種統一化設計能大幅降低部署成本，簡化系統架構，並且在實際應用中提供更好的泛化能力。WeMM-Embedding 因此從一開始就採用了多模態統一輸入的架構思路。

### 原則二：訓練效率優先（Training Efficiency First）

在 2B 和 9B 參數量級別的模型上，每一次訓練迭代的成本都不可忽視。團隊選擇了 Qwen3.5 系列作為基座模型，充分借鑒其在語言理解和生成任務上已經達到業界領先水準的預訓練成果。這個選擇使得模型在語言基座能力上無需從頭開始訓練，大幅節省了計算資源。

### 原則三：推理靈活性（Inference Flexibility）

不同場景對 Embedding 維度的需求差異巨大。高維度表示能捕捉更細緻的語義關係，但記憶體和計算成本較高；低維度表示則更節省資源，但在某些任務上可能犧牲精度。為此，WeMM-Embedding 採用了 Matryoshka 表示學習（MRL），支援從 256 維到 4096 維的動態維度輸出，讓使用者在精度與效率之間自由權衡。

### 原則四：語言無關性（Language Agnostic）

雖然基座模型 Qwen3.5 的主要訓練數據以英文和中文為主，但團隊在預訓練和微調階段刻意引入了多語言數據，使得模型不僅能處理中英文輸入，在日語、韓語、法語、德語等場景下也有合理的泛化表現。這對於騰訊的國際化產品矩陣具有重要戰略價值。

## 模型架構：三大核心技術

WeMM-Embedding 的架構設計圍繞三個核心技術亮點展開：Qwen3.5 基座模型、Last-Token Pooling 策略，以及 Matryoshka 表示學習。

### Qwen3.5 基座：站在巨人的肩膀上

選擇 Qwen3.5 作為基座模型是 WeMM-Embedding 最重要的架構決策之一。Qwen3.5 是阿里巴巴通義千問團隊開源的大語言模型系列，在語言理解、指令遵循和推理能力上都有出色表現。微信視覺團隊評估後認為，Qwen3.5 強大的語言理解能力是多模態理解的重要基礎——無論輸入的是圖像描述、視頻字幕還是純文本查詢，最終都需要語言模型來統一理解這些資訊。

在此基座之上，團隊新增了視覺編碼器（Vision Encoder）分支，用於處理圖像和視頻輸入。視覺編碼器採用了業界成熟的 ViT（Vision Transformer）架構，能將視覺內容轉換為特徵向量，隨後與文本特徵在同一表示空間中對齊。這種設計確保了視覺和語言資訊能夠被統一處理。

### Last-Token Pooling：為什麼取最後一個 Token

在傳統的 Vision-Language Model 中，常用的Pooling策略包括 Mean Pooling（對所有 Token 特徵取平均）和 [CLS] Token Pooling（直接使用特殊標記 [CLS] 的輸出特徵）。WeMM-Embedding 選擇了 Last-Token Pooling，即取序列最後一個 Token 的輸出特徵作為最終的表示向量。

團隊在論文中指出，Last-Token Pooling 的優勢在於：語言模型在處理每一個 Token 時都已經「看過」了完整序列的上下文資訊，最後一個 Token 的狀態實際上編碼了對整個輸入的全局理解。相比簡單的平均策略，Last-Token Pooling 能更好地保留語義完整性。這一設計選擇在多個下游任務的實驗中都得到了驗證。

### Matryoshka 表示學習：維度壓縮的藝術

Matryoshka 表示學習（Matryoshka Representation Learning，MRL）的名稱源於俄羅斯套娃（Matryoshka dolls）的概念——每一層較大的娃娃內都包含一個較小的娃娃。MRL 的核心思想正是如此：一個高維表示向量中，自然嵌套了多個較低維的子表示，每個子表示都是該維度下的最優表達。

傳統做法是訓練多個不同維度的模型，或者訓練後再做 PCA 降維。MRL 的創新之處在於，只需訓練一個模型，就能同時得到 256、512、1024、2048、4096 維等多種維度的表示。訓練過程中，模型學習在每個維度上都盡量保留最重要的語義資訊。這個設計讓 WeMM-Embedding 在實際部署中具有極大的靈活性，企業可以根據硬體條件和精度要求動態選擇輸出維度。

## 兩階段訓練策略

WeMM-Embedding 採用了先大規模對比預訓練，再精細化對齊微調的兩階段訓練策略。

### 第一階段：大規模對比預訓練

在第一階段，模型接觸海量的圖文配對數據，學習將圖像和對應的文本描述映射到相同的向量空間。這個階段的核心任務是建立粗粒度的語義對齊——讓「一張貓的照片」和「a photo of a cat」擁有相似的向量表示。

訓練使用的數據規模達到了數十億級別，涵蓋了網頁圖文、社交媒體帖子、電子商務商品描述、知識庫文章等多個來源。為了確保數據品質，團隊設計了一套嚴格的數據清洗流程，過濾掉低質量、噪聲過大或存在版權爭議的內容。

對比學習的目標函數採用了標準的 InfoNCE 損失，模型需要正確匹配正樣本對（同圖同文）並區分負樣本對（同圖不同文）。由於數據規模巨大，團隊也採用了諸如 temperature 參數動態調整、困難負樣本挖掘（hard negative mining）等技巧來提升訓練效率和最終表現。

### 第二階段：精細化對齊微調

第二階段的核心目標是將模型在特定任務上的表現從「可用」提升到「優秀」。在這個階段，團隊使用了更高質量的人工標注或 LLM 合成的精細化數據，對模型進行更有针对性的微調。

微調數據的設計特別強調了幾個方面：首先是交錯多模態輸入的處理能力，模型需要能夠同時理解一張圖像和一段文字描述之間的複雜關係；其次是長文本輸入的處理，因為真實場景中的查詢往往並非短句，而可能是幾十甚至上百個字的描述；最後是多輪對話上下文的支持，某些檢索場景需要模型理解對話歷史中的前後文關係。

這個階段使用的訓練樣本量相對較小（通常在百萬級別），但數據品質和任務多樣性要求更高。團隊特別關注數據的任務覆蓋範圍，確保模型在學術 benchmark 和實際企業應用場景中都能有良好表現。

## 性能評測：MMEB-v2 和 MMEB-v3 Benchmark 結果

評估一個多模態 Embedding 模型的性能，需要一個全面、嚴格且能反映真實應用場景的 benchmark。微信視覺團隊選擇了 MMEB（Multimodal Multilingual Embedding Benchmark）系列作為主要評測標準。

### MMEB-v2 榜單結果

MMEB-v2 是目前業界最被广泛引用的多模態 Embedding 評測基準，涵蓋了文本檢索、圖像檢索、視頻檢索和多模態混合檢索等多個維度。WeMM-Embedding 在這個 benchmark 上的表現堪稱驚艷。

其中最值得關注的是 2B 參數量級別的 WeMM-Embedding-2B 模型。它在 MMEB-v2 總分上超越了此前同一量級的所有基線模型，甚至在一些任務上超越了 8B 參數量級的模型。這一結果充分展示了微信視覺團隊在模型效率優化上的功力——並不是參數量越大越好，優秀的訓練策略和架構設計同樣關鍵。

9B 參數量級的 WeMM-Embedding-9B 則一舉達到了 MMEB-v2 的 SOTA（State-of-the-Art）水平，在幾乎所有子任務上都取得了領先。這表明團隊的技術路線在擴展到更大參數量級時依然有效，沒有遇到明顯的瓶頸。

### MMEB-v3 榜單結果

MMEB-v3 在 v2 的基礎上進一步增加了任務難度，特別是在以下幾個維度進行了強化：更多語言的測試覆蓋（從原有的中英文擴展到日、韓、法、德等語言）、更長上下文的處理能力測試，以及更強調推理理解的多步驟檢索任務。

WeMM-Embedding-9B 在 MMEB-v3 上依然保持了強勁勢頭，進一步擴大了與競爭對手的差距。尤其值得一提的是，2B 模型在 MMEB-v3 的多語言子維度上表現出色，這驗證了團隊在語言無關性設計上的成功——模型並非只在訓練數據覆蓋充分的語言上表現良好，而是能夠泛化到全新的語言場景。

### 維度與性能的權衡

MRL 維度壓縮帶來的一個有趣副產品是：我們可以系統性地研究維度大小對性能的影響。實驗結果顯示，WeMM-Embedding 在 1024 維以上時，性能曲線開始趨於平緩——維度增加帶來的邊際收益遞減明顯。這意味著對於大多數實際應用場景，1024 維的輸出已經能提供接近頂級的精度，同時大幅節省向量儲存和相似度計算的成本。

## 部署教程

### 環境準備

WeMM-Embedding 提供了完整的模型權重和推理代碼，支持 PyTorch 生態。部署前需要準備以下環境：

- Python 3.10 或更高版本
- PyTorch 2.1 或更高版本
- transformers 庫（模型加載）
- CUDA 12.1 或更高版本（GPU 推理）

建議使用虛擬環境隔離安裝，避免依賴衝突。可以通过 pip 直接安裝相關依賯：

```bash
pip install torch transformers accelerate
```

### 模型加載

模型權重已開源在 HuggingFace 和騰訊內部的模型平台上。以下是使用 transformers 加載模型的基本範例：

```python
from transformers import AutoModel, AutoTokenizer
import torch

# 加載模型和 tokenizer
model_name = "WeChatCVLab/wemm-embedding-2b"  # 或 9b 版本
tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModel.from_pretrained(model_name)
model.eval()

# 移動到 GPU（如有）
device = "cuda" if torch.cuda.is_available() else "cpu"
model = model.to(device)
```

### 單模態輸入處理

處理純文本輸入時，直接對文本進行分詞和向量化：

```python
def encode_text(texts):
    inputs = tokenizer(texts, padding=True, truncation=True, 
                       max_length=512, return_tensors="pt")
    inputs = {k: v.to(device) for k, v in inputs.items()}
    with torch.no_grad():
        outputs = model(**inputs)
        # Last-Token Pooling
        embeddings = outputs.last_hidden_state[:, -1, :]
    return embeddings
```

### 多模態輸入處理

處理圖像輸入時，需要額外加載視覺編碼器並進行跨模態對齊：

```python
from PIL import Image

def encode_image(image_paths):
    images = [Image.open(path).convert("RGB") for path in image_paths]
    # 使用模型的視覺編碼器分支處理圖像
    image_inputs = model.image_processor(images, return_tensors="pt")
    image_inputs = {k: v.to(device) for k, v in image_inputs.items()}
    with torch.no_grad():
        image_embeddings = model.vision_encoder(**image_inputs)
    return image_embeddings
```

### MRL 維度控制

MRL 的核心價值在於維度可控輸出。通過以下方式指定輸出維度：

```python
# 設定輸出維度（例如 1024 維）
target_dim = 1024
embeddings = model.encode(inputs, dimension=target_dim)
```

底層實現上，模型在訓練時就已經學會了在每一個預設維度下的最優子向量，無需任何後處理。這與事後 PCA 降維有本質區別——後者是在犧牲部分資訊的情況下強行降維，而 MRL 則是從一開始就學習如何在每個維度下保留最重要的語義結構。

### 服務化部署

對於需要高併發的生產環境，建議使用模型服務化框架（如 vLLM、Triton Inference Server）進行部署。以下是使用 FastAPI 搭建簡單推理服務的範例：

```python
from fastapi import FastAPI
import torch

app = FastAPI()

@app.post("/embed")
async def get_embedding(text: str, modality: str = "text", dim: int = 1024):
    if modality == "text":
        embedding = encode_text([text])
    elif modality == "image":
        # 接收 base64 編碼的圖像
        embedding = encode_image_from_base64(text)
    
    # 動態維度截取（MRL 特性）
    embedding = embedding[:, :dim]
    return {"embedding": embedding.cpu().numpy().tolist()}
```

## 核心觀點與總結

WeMM-Embedding 的發布為多模態 Embedding 領域帶來了幾個值得關注的信號。

**統一化是正確的方向。** 過去業界傾向於為每種任務訓練專用模型，但 WeMM-Embedding 用一個模型覆蓋文本、圖像、視頻、視覺文件和交錯多模態輸入，且在每個維度上都達到了有競爭力的水準。這證明瞭統一化架構不僅可行，而且在實際應用中具有顯著的成本和維護優勢。

**訓練效率與模型效能可以兼得。** 2B 模型超越 8B 基線的結果說明，在大模型時代，訓練策略、數據品質和架構設計的優化，往往比單純增加參數量更能帶來實質性的效能提升。對於資源有限的團隊而言，這是一個令人振奮的消息。

**MRL 維度壓縮是生產環境的利器。** 從 4096 維無縫切換到 256 維，且無需重新訓練或後處理——這種靈活性在實際部署中極為珍貴。企業可以根據不同業務場景的精度要求，動態調整資源消耗，實現精細化的成本控制。

**多語言能力是差異化競爭力。** 在多語言 MMEB 測試上的出色表現，預示著 WeMM-Embedding 在國際化場景中的潛力。對於需要在多種語言環境下提供一致性多模態檢索服務的產品，這是一個值得優先考慮的選擇。

整體而言，WeMM-Embedding 代表了騰訊微信視覺團隊在多模態基礎模型領域的一次重要突破。它不僅在 benchmark 上刷新了記錄，更重要的是，它的設計思路和技術路線為整個行業在通用多模態 Embedding 方向上的探索提供了有價值的參考。

## 資源連結

- **論文預印本**：WeMM-Embedding 技術報告（arXiv）
- **模型權重**：HuggingFace - WeChatCVLab/wemm-embedding-2b、wemm-embedding-9b
- **官方 GitHub**：騰訊微信視覺團隊 WeMM-Embedding 開源倉庫
- **Demo 體驗**：HuggingFace Spaces 線上演示
- **MMEB Benchmark**：MMEB-v2 / MMEB-v3 官方評測頁面
- **Qwen3.5 基座**：阿里巴巴通義千問 Qwen3.5 系列模型

---

**「比特財商」**
