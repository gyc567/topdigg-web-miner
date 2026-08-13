---
title: "AI Knowledge Graph：將非結構化文件轉化為互動式知識圖譜"
date: "2026-08-13"
description: "深入解析 AI Knowledge Graph Generator 專案，了解如何將非結構化文字文件轉換為互動式知識圖譜"
tags: ["AI", "知識圖譜", "NLP", "Python", "視覺化"]
categories: ["AI & ML"]
author: "robert-mcdermott"
image: "/assets/blog/ai-knowledge-graph/overview.png"
---

# AI Knowledge Graph：將非結構化文件轉化為互動式知識圖譜

在資訊爆炸的時代，我們每天都在與海量非結構化文字打交道。研究論文、技術文件、企業報告、海量書籍——這些內容蘊含著寶貴的知識，卻如同散落的拼圖碎片，難以直接窺見全貌。如何從這些非結構化文字中提取有價值的資訊，並以直觀的方式呈現它們之間的關聯？**AI Knowledge Graph Generator** 專案為我們提供了一個優雅的解決方案。

## 專案概述

**AI Knowledge Graph Generator** 是由開發者 [robert-mcdermott](https://github.com/robert-mcdermott) 建立的開源專案，目前在 GitHub 上已獲得 **2.8k Stars** 和 **388 Forks**，採用 **Apache-2.0** 開源授權。

這個專案的核心功能是將任意非結構化文字文件轉換為**互動式知識圖譜**，讓使用者能夠以視覺化方式探索文件中的實體、概念以及它們之間的關係。

### 主要特色

- **廣泛相容性**：支援任何 OpenAI 相容 API 端點，包括 Ollama、LM Studio、OpenAI、vLLM 和 LiteLLM
- **智慧文字分塊**：自動將大文件分割成適合 LLM 上下文處理的重疊區塊
- **SPO 三元組提取**：從每個文字區塊中提取主語-謂語-受語三元組
- **實體標準化**：確保跨文件區塊的實體命名一致性
- **關係推理**：自動發現斷開部分之間的傳遞關係
- **互動式視覺化**：使用 PyVis 庫產生美觀的互動式 HTML 視覺化

## 核心設計哲學

### 為什麼需要知識圖譜？

傳統的文字閱讀面臨著幾個核心挑戰：

1. **資訊碎片化**：長文件中的關鍵資訊散布在各處，難以快速掌握全局
2. **關係隱晦**：文字中實體間的關係往往隱含在語句中，不易直觀發現
3. **知識孤島**：不同文件之間的關聯通常被人忽視

知識圖譜透過將文字分解為**實體（Entity）**和**關係（Relation）**，並以圖結構儲存，讓我們能夠：

- 一目了然地看到文件的核心內容
- 快速識別不同概念之間的關聯
- 透過圖的遍歷發現隱藏的聯繫

### SPO 三元組：知識的原子表示

SPO（Subject-Predicate-Object）三元組是知識表示的基石。任何知識都可以分解為一個主體、一個謂詞和一個受體。

例如，從文字"*Python 是由 Guido van Rossum 創建的程式語言*"中，我們可以提取：

- **主體（Subject）**：Python
- **謂詞（Predicate）**：由...創建
- **受體（Object）**：Guido van Rossum

這種表示形式既簡潔又強大，它將自然語言的豐富表達轉化為機器可處理的知識單元，為後續的推理和查詢奠定了基礎。

## 工作流程詳解

AI Knowledge Graph Generator 的處理流程分為五個核心階段：

### 第一階段：文件分塊（Text Chunking）

長文件會被分割成適合 LLM 上下文視窗大小的重疊區塊（Chunk）。

```
原始文件 → 重疊區塊 1 → 重疊區塊 2 → 重疊區塊 3 → ...
```

分塊策略的關鍵參數：
- **區塊大小**：每個區塊包含的 token 數量
- **重疊度**：相鄰區塊之間的重疊比例

這種重疊設計確保了邊界處的實體和關係不會被切斷，保證了知識提取的完整性。

### 第二階段：SPO 三元組提取

對於每個文字區塊，系統呼叫 LLM 來識別並提取其中的 SPO 三元組。

```
輸入："Apple 發布了 iPhone 15，採用 A16 晶片"

輸出：
- (Apple, 發布了, iPhone 15)
- (iPhone 15, 採用, A16 晶片)
```

這一階段是整個流程的核心，LLM 的提示詞設計直接影響提取品質。

### 第三階段：實體標準化（Entity Canonicalization）

由於分塊處理，同一實體可能在不同區塊中出現不同的表述形式。

例如：
- "Python" vs "Python 程式語言"
- "Guido van Rossum" vs "Guido"

實體標準化階段使用 LLM 輔助進行**實體對齊和解析**，確保相同實體使用統一的命名，避免知識圖譜中的冗餘和歧義。

### 第四階段：關係推理（Relation Inference）

基於已提取的三元組，系統自動推斷斷開組件之間的傳遞關係。

例如：
- 已知：(A, 位於, B) 和 (B, 位於, C) → 推斷：(A, 位於, C)
- 已知：(X, 是, Y) 和 (Y, 包含, Z) → 推斷：(X, 包含, Z)

這種傳遞推理大大增強了知識圖譜的連通性，讓隱含的知識浮出水面。

### 第五階段：互動式視覺化

最終的知識圖譜使用 **PyVis** 庫產生互動式 HTML 視覺化。

PyVis 是一個基於 vis.js 的 Python 庫，專門用於建立網路圖視覺化。它生成的 HTML 檔案可以在任何現代瀏覽器中開啟，支援豐富的互動功能。

## 視覺化特色

生成的互動式知識圖譜具有以下視覺特色：

### 社區檢測與顏色編碼

採用 **Louvain 方法**進行社區檢測，具有緊密關聯的節點會被歸類到同一個社區，並使用相同的顏色標識。

這讓你能夠一眼識別出知識圖譜中的主要主題聚類。

### 節點大小與重要性

節點的大小基於多個重要性指標：
- **度中心性（Degree Centrality）**：與該節點直接相連的邊數越多，節點越大
- **介數中心性（Betweenness Centrality）**：該節點作為橋樑連接其他節點的頻率
- **特徵向量中心性（Eigenvector Centrality）**：考慮鄰居節點重要性的綜合指標

### 邊的視覺區分

- **實線**：表示從原文直接提取的原始關係
- **虛線**：表示系統自動推斷的傳遞關係

這種區分幫助使用者區分「確鑿事實」和「推理結論」。

### 互動控制

視覺化介面支援完整的互動操作：

| 操作 | 功能 |
|------|------|
| 縮放 | 滑鼠滾輪或觸控板縮放視圖 |
| 平移 | 拖曳畫布移動視圖 |
| 懸停 | 滑鼠懸停顯示節點/邊的詳細資訊 |
| 過濾 | 按類型、權重等條件過濾顯示 |
| 物理控制 | 調整節點間的引力和排斥力 |

### 主題支援

提供**淺色**和**深色**兩種主題，適配不同使用環境和個人偏好。

## 詳細安裝設定教學

### 環境要求

- Python 3.8+
- OpenAI 相容 API（本機或雲端）

### 安裝步驟

```bash
# 1. 複製倉庫
git clone https://github.com/robert-mcdermott/ai-knowledge-graph
cd ai-knowledge-graph

# 2. 安裝依賴
pip install -r requirements.txt

# 3. 設定 API 端點
export OPENAI_API_BASE="http://localhost:11434/v1"  # Ollama 範例
export OPENAI_API_KEY="your-api-key"  # 本機 Ollama 可設為任意值
```

### Ollama 本機模型設定（推薦）

如果你想在本地執行，推薦使用 Ollama：

```bash
# 安裝 Ollama
# macOS/Linux: https://ollama.ai
# Windows: 透過 WSL 或 Docker

# 下載模型
ollama pull llama3.2

# 啟動 Ollama 服務（預設連接埠 11434）
ollama serve

# 設定環境變數
export OPENAI_API_BASE="http://localhost:11434/v1"
export OPENAI_API_KEY="ollama"  # Ollama 不需要真實 key
```

### 快速開始

```bash
# 基本用法
python generate-graph.py --input your_text_file.txt --output knowledge_graph.html

# 使用本機模型
python generate-graph.py \
    --input research_paper.txt \
    --output knowledge_graph.html \
    --api-base http://localhost:11434/v1 \
    --model llama3.2

# 指定分塊參數
python generate-graph.py \
    --input large_document.txt \
    --output knowledge_graph.html \
    --chunk-size 1000 \
    --overlap 200
```

## 使用範例與最佳實踐

### 範例一：研究論文分析

```bash
# 下載一篇 arXiv 論文並提取知識圖譜
curl -s https://arxiv.org/pdf/2301.XXXXX.pdf | pdftotext - | \
python generate-graph.py \
    --input /dev/stdin \
    --output paper_graph.html \
    --chunk-size 800
```

### 範例二：技術文件分析

```bash
# 分析專案 README
python generate-graph.py \
    --input /path/to/project/README.md \
    --output readme_graph.html

# 分析多個文件（透過合併）
cat doc1.md doc2.md doc3.md > combined.txt
python generate-graph.py \
    --input combined.txt \
    --output combined_graph.html
```

### 最佳實踐

1. **選擇合適的模型**
   - 本地部署：Llama 3.2、Qwen 2.5（平衡速度和效果）
   - 雲端 API：GPT-4o、Claude 3.5（更高精度）

2. **調整分塊大小**
   - 學術論文：600-1000 tokens（保持完整句子）
   - 技術文件：800-1200 tokens
   - 對話記錄：200-400 tokens

3. **後處理最佳化**
   - 使用圖形資料庫（如 Neo4j）匯入生成的 JSON
   - 使用 Gephi 進行更高階的圖分析

4. **迭代改進**
   - 先用小樣本測試，查看提取品質
   - 根據結果調整提示詞或分塊參數

## 關鍵觀點總結

### 知識圖譜的核心價值

1. **結構化**：將非結構化文字轉化為可查詢的圖資料
2. **關聯性**：揭示隱含的概念間關係
3. **可探索性**：透過互動式介面深入挖掘知識

### 技術亮點

- **LLM 驅動的提取**：利用大語言模型理解自然語言
- **靈活相容**：支援任意 OpenAI 相容端點
- **自動化推理**：從已知知識推斷未知關係
- **美觀視覺化**：PyVis 驅動的互動式圖表

### 適用場景

- 學術文獻綜述與知識管理
- 企業內部知識庫構建
- 程式碼倉庫結構分析
- 法律文件關係梳理
- 市場競爭情報分析

## 結語

AI Knowledge Graph Generator 展示了一種將非結構化文字轉化為結構化知識的優雅路徑。它結合了 LLM 的語言理解能力和圖結構的資料表示優勢，為知識管理提供了全新的可能性。

無論你是研究者希望梳理文獻關係，還是工程師希望理解程式碼架構，抑或是分析師希望從文件中挖掘洞察，這個工具都值得一試。

**專案地址**：[https://github.com/robert-mcdermott/ai-knowledge-graph](https://github.com/robert-mcdermott/ai-knowledge-graph)

**Stars**: 2.8k | **Forks**: 388 | **License**: Apache-2.0

---

*如果你覺得這個專案有幫助，歡迎在 GitHub 上給作者一個 Star！*
