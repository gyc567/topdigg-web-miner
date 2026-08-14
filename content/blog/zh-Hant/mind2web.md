---
title: 'Mind2Web：全球首個真實Web代理基準數據集，讓AI學會在任意網站上完成複雜任務'
date: "2026-08-14"
description: "深度解析OSU-NLP-Group發布的Mind2Web項目——全球首個基於真實網站的LLM網頁代理基準數據集，包含2000+任務、137個網站、31個領域，支持跨任務、跨網站、跨域三大泛化能力評估"
tags:
  - Mind2Web
  - Web代理
  - LLM
  - 大語言模型
  - 網頁導航
  - AI代理
  - NeurIPS
  - 數據集
  - 人工智能
categories:
  - AI數據集
  - 大語言模型
  - Web代理
  - AI研究
  - 人工智能代理
---

# Mind2Web：全球首個真實Web代理基準數據集，讓AI學會在任意網站上完成複雜任務

## 項目背景與核心問題

### 為什麼需要Web代理？

在當今互聯網時代，用戶每天需要在無數個網站上完成各種複雜任務——訂機票、查信息、填表單、管理社交媒體等。這些看似簡單的操作，對於人類來說需要花費大量時間學習和適應每一個新網站。

**關鍵問題來了**：能否訓練一個AI代理，讓它像人類一樣，能夠理解自然語言指令，在任意網站上自主導航和操作，完成複雜的長時序任務？

這正是Mind2Web要解決的核心問題。

### 現有數據集的局限性

在Mind2Web出現之前，Web代理研究面臨兩大困境：

| 數據集類型 | 問題 | 代表性數據集 |
|-----------|------|------------|
| 模擬環境 | 過於簡化，無法反映真實網站的複雜性 | MiniWoB, WebShop |
| 有限網站覆蓋 | 泛化能力無法評估，模型可能「死記硬背」 | ALFWorld, WebArena |

這些數據集要么使用人工構建的簡化環境，要么只覆蓋少量網站和任務，無法真正評估AI代理在真實網絡世界中的泛化能力。

### Mind2Web的誕生

> **「我們推出Mind2Web，這是首個用於構建和評估通用Web代理的數據集——能夠遵循語言指令在任何網站上完成複雜任務。」**
> — Mind2Web論文

Mind2Web由俄亥俄州立大學NLP研究組（OSU-NLP-Group）開發，並在NeurIPS 2023大會上獲得Spotlight榮譽，成為Web代理研究領域的重要里程碑。

---

## 項目概述與核心統計

### Mind2Web是什麼？

Mind2Web是**全球首個基於真實網站的LLM網頁代理基準數據集**，它具有以下核心特點：

- 🌍 **真實網站環境**：使用真實的互聯網網站，而非模擬環境
- 📊 **大規模多樣本**：超過2,000個開放式任務
- 🌐 **廣泛領域覆蓋**：137個真實網站，覆蓋31個領域
- 🎯 **三大泛化評估**：支持跨任務、跨網站、跨域泛化能力測試

### 核心數據統計

| 指標 | 數值 |
|------|------|
| 任務總數 | 2,350個 |
| 覆蓋網站 | 137個 |
| 覆蓋領域 | 31個 |
| 平均任務長度 | 7.3個操作步驟 |
| 平均頁面元素 | 1,135個DOM元素 |
| 訓練集規模 | 1,009個實例 |
| 測試集規模 | 1,341個實例 |

---

## 數據集設計哲學

### 核心理念：真實、開放、實用

Mind2Web的設計哲學建立在三個核心原則之上：

#### 1. 真實世界優先

> **「現有Web代理數據集要么使用模擬網站，要么只覆蓋有限的網站和任務，因此不適合評估通用Web代理。」**

Mind2Web堅持使用真實網站，這帶來了：
- **真實性**：反映真實網站的複雜性（包括各種佈局、廣告、彈窗等）
- **多樣性**：不同網站有完全不同的設計語言和交互模式
- **挑戰性**：真實網站的不規範性和動態性是模擬環境無法複製的

#### 2. 開放域任務設計

任務不是預設的固定模板，而是由眾包工作者**實際提議並完成**的：

```
數據收集三階段：
┌─────────────────────────────────────────────────────┐
│  第一階段：任務提議 (Task Proposal)                   │
│ 工作者為給定網站提出可行的任務                         │
└─────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────┐
│  第二階段：任務演示 (Task Demonstration)              │
│ 工作者使用Playwright演示任務完成過程                   │
└─────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────┐
│  第三階段：任務驗證 (Task Verification)               │
│  作者驗證所有動作的清潔性和準確性                     │
└─────────────────────────────────────────────────────┘
```

#### 3. 泛化能力分級評估

為了全面評估代理的泛化能力，Mind2Web設計了**三個難度遞增的測試分割**：

| 分割類型 | 訓練數據 | 測試數據 | 難度 | 評估重點 |
|---------|---------|---------|------|---------|
| **Cross Task** | 同網站任務 | 同網站新任務 | ⭐⭐ | 任務層面的泛化 |
| **Cross Website** | 同域網站 | 同域新網站 | ⭐⭐⭐ | 網站層面的泛化 |
| **Cross Domain** | 特定域任務 | 全新技術域 | ⭐⭐⭐⭐⭐ | 領域層面的泛化 |

---

## 技術架構詳解

### 兩階段Pipeline設計

Mind2Web的技術方案採用**兩階段Pipeline**，這是其核心創新點：

```
                    ┌─────────────────────────────────────┐
                    │         用戶自然語言指令              │
                    │   「幫我查找從紐約到洛杉磯的單程機票」   │
                    └─────────────────────────────────────┘
                                    ↓
                    ┌─────────────────────────────────────┐
                    │    第一階段：候選元素生成 (Candidate)   │
                    │         DeBERTa-v3-base 編碼器         │
                    │    評分查詢-候選元素對，召回Top-50     │
                    │         Recall@50 ≈ 85%             │
                    └─────────────────────────────────────┘
                                    ↓
                    ┌─────────────────────────────────────┐
                    │    第二階段：動作預測 (Action Prediction)│
                    │         Flan-T5 序列到序列模型          │
                    │   結合任務描述 + HTML上下文 + 候選元素   │
                    │         輸出：CLICK / TYPE / SELECT    │
                    └─────────────────────────────────────┘
                                    ↓
                    ┌─────────────────────────────────────┐
                    │            執行動作序列               │
                    │      完成用戶指定的複雜任務             │
                    └─────────────────────────────────────┘
```

### 第一階段：候選元素生成

#### 為什麼需要候選生成？

真實網頁的HTML往往包含大量元素（Mind2Web平均每個頁面有1,135個DOM元素），直接將這些全部輸入LLM既**效率低下**也**成本高昂**。

#### 解決方案

使用**DeBERTa-v3-base編碼器模型**對候選元素進行評分和篩選：

```python
# 候選元素生成示意
model = AutoModel.from_pretrained("osunlp/MindAct_CandidateGeneration_deberta-v3-base")

# 輸入：查詢-候選元素對
scores = model.score(query, candidate_elements)

# 輸出：Top-50候選元素
top_candidates = select_top_k(scores, k=50)
```

**性能指標**：Recall@50 ≈ 85%，即在Top-50候選中能夠覆蓋85%的正確元素。

### 第二階段：動作預測

#### 模型選擇

Mind2Web支持多種動作預測模型：

| 模型類型 | 模型規模 | 特點 |
|---------|---------|------|
| Flan-T5 | Base / Large / XL | 開源，可本地部署 |
| GPT-3.5/GPT-4 | API調用 | 性能更強，成本更高 |

#### 多選擇QA格式

對於LLM（如GPT系列），Mind2Web採用**多選擇QA格式化**：

```python
# 動作預測的QA格式化
prompt = f"""
任務：{task_description}

當前頁面包含以下可交互元素：
{formatted_candidates}

請問應該對哪個元素執行什麼操作？

A) 點擊元素 [button: "Search flights"]
B) 在 [input: "From"] 中輸入 "New York"
C) 在 [select: "Trip type"] 中選擇 "One-way"
...
"""
```

#### 動作類型

Mind2Web定義了三種基本動作類型：

| 動作 | 描述 | 示例 |
|------|------|------|
| **CLICK** | 點擊元素 | 點擊按鈕、連結 |
| **TYPE** | 輸入文本 | 在輸入框中填寫文字 |
| **SELECT** | 選擇選項 | 從下拉菜單選擇 |

---

## 任務類型與示例

### 多樣化的真實任務

Mind2Web包含豐富多樣的任務類型，覆蓋用戶日常網絡生活的方方面面：

#### 1. 旅行與交通
```
任務：在Expedia上查找從紐約到洛杉磯的單程航班
- 操作：輸入出發城市 → 輸入目的地 → 選擇日期 → 點擊搜索
- 難度：涉及多步驟表單填寫和動態內容加載
```

#### 2. 醫療健康
```
任務：查找某種藥物與其他藥物的交互作用
- 操作：進入藥品網站 → 搜索藥品名 → 查看交互信息
- 難度：需要理解和處理專業領域的術語和內容
```

#### 3. 金融服務
```
任務：申請一部帶運營商套餐的手機
- 操作：選擇手機型號 → 選擇套餐 → 填寫個人信息 → 提交申請
- 難度：涉及多頁面流轉和複雜表單邏輯
```

#### 4. 社交媒體
```
任務：在Twitter上查找並關注某位技術博主
- 操作：搜索用戶名 → 進入主頁 → 點擊關注
- 難度：需要理解社交媒體的交互模式
```

#### 5. 內容發現
```
任務：在Netflix上找到2020年上映的懸疑電影
- 操作：進入Netflix → 選擇類別 → 按年份篩選 → 瀏覽結果
- 難度：涉及多維度篩選和內容發現
```

---

## 評估指標與實驗結果

### 評估指標體系

Mind2Web提供多維度的評估指標：

#### 1. 準確率指標

| 指標 | 計算方式 | 適用場景 |
|------|---------|---------|
| **Macro平均準確率** | 所有任務等權重計算 | 論文對比推薦 |
| **Micro平均準確率** | 按任務實例數量加權 | 可能偏向任務多的網站 |

#### 2. 候選召回率

- **Recall@K**：正確元素出現在Top-K候選中的比例
- 評估候選生成階段的質量

### 基線模型性能

| 模型 | Cross Task | Cross Website | Cross Domain |
|------|-----------|--------------|--------------|
| MindAct (Flan-T5-base) | 40.2% | 28.1% | 16.4% |
| MindAct (Flan-T5-large) | 47.5% | 32.7% | 19.5% |
| MindAct (Flan-T5-xl) | 52.1% | 38.9% | 24.3% |
| GPT-3.5 (3-shot) | 48.2% | 33.5% | 20.8% |
| GPT-4 (3-shot) | 57.6% | 42.3% | 28.9% |

### 關鍵發現

#### 發現一：LLM展現了初步的泛化能力

> **「我們的方案展現了相當水平的性能，即使在模型從未見過的網站或整個領域上也有不錯表現。」**

這證明了基於LLM的Web代理具有初步的跨域泛化能力。

#### 發現二：候選過濾至關重要

將原始HTML直接輸入LLM效果很差，但通過**小型LM（DeBERTa）先過濾候選元素**，可以顯著提升LLM的效果和效率。

#### 發現三：仍有巨大提升空間

> **「但仍有巨大的改進空間，才能實現真正可泛化的代理。」**

即使是最先進的GPT-4，在Cross Domain設置下也僅有28.9%的準確率，說明當前技術距離真正通用的Web代理還有很長的路要走。

---

## MindAct模型實現

### 項目結構

```
Mind2Web/
├── data/
│   ├── train/           # 訓練數據 (1,009 instances)
│   ├── test/
│   │   ├── cross_task/  # 跨任務測試集 (252)
│   │   ├── cross_website/  # 跨網站測試集 (177)
│   │   └── cross_domain/   # 跨域測試集 (912)
│   └── annotation/      # 標注數據
├── src/
│   ├── candidate_generation/   # 候選生成模型
│   ├── action_prediction/       # 動作預測模型
│   └── utils/                  # 工具函數
├── scripts/
│   ├── evaluation.py           # 評估腳本
│   └── inference.py            # 推理腳本
└── README.md
```

### 快速開始

#### 環境安裝

```bash
# 克隆倉庫
git clone https://github.com/OSU-NLP-Group/Mind2Web.git
cd Mind2Web

# 創建虛擬環境
python -m venv mind2web-env
source mind2web-env/bin/activate  # Linux/Mac
# mind2web-env\Scripts\activate  # Windows

# 安裝依賴
pip install -r requirements.txt
```

#### 依賴包

```txt
# requirements.txt 關鍵依賴
torch>=2.0.0
transformers>=4.28.0
deepspeed>=0.9.0
beautifulsoup4>=4.12.0
playwright>=1.40.0
```

#### 數據下載

```python
# 使用HuggingFace下載數據集
from datasets import load_dataset

# 加載完整數據集
dataset = load_dataset("osunlp/Mind2Web")

# 加載特定分割
train_data = load_dataset("osunlp/Mind2Web", split="train")
test_cross_task = load_dataset("osunlp/Mind2Web", split="test_cross_task")
test_cross_website = load_dataset("osunlp/Mind2Web", split="test_cross_website")
test_cross_domain = load_dataset("osunlp/Mind2Web", split="test_cross_domain")
```

#### 模型下載

```python
# 加載候選生成模型
from transformers import AutoModel, AutoTokenizer

model_name = "osunlp/MindAct_CandidateGeneration_deberta-v3-base"
tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModel.from_pretrained(model_name)
```

#### 推理示例

```python
import json
from mindact import MindActPipeline

# 初始化pipeline
pipeline = MindActPipeline(
    candidate_model="osunlp/MindAct_CandidateGeneration_deberta-v3-base",
    action_model="flan-t5-large",
    device="cuda"
)

# 加載任務
task = {
    "instruction": "Find one-way flights from New York to Los Angeles",
    "html": "<html>...</html>",  # 頁面HTML
    "dom_trace": [...]  # DOM元素列表
}

# 執行推理
result = pipeline.predict(task)
print(f"Predicted actions: {result['actions']}")
```

#### 評估模型

```bash
# 使用評估腳本
python scripts/evaluation.py \
    --model flan-t5-large \
    --split test_cross_domain \
    --output results.json

# 查看結果
python scripts/analysis.py --results results.json
```

---

## 配套工具與擴展

### SeeAct：增強的Web代理框架

[SeeAct](https://osu-nlp-group.github.io/SeeAct/)是Mind2Web團隊的後續工作，進一步增強了Web代理的能力：

- 🔍 **更精細的視覺定位**：結合視覺信息理解頁面佈局
- 🎯 **更準確的元素識別**：減少誤點擊和誤操作
- 📈 **更好的泛化性能**：在Mind2Web上取得顯著提升

### Online-Mind2Web：在線學習擴展

[Online-Mind2Web](https://github.com/OSU-NLP-Group/Online-Mind2Web)探索了在線學習範式：

- 🌐 **動態環境交互**：在真實網站上進行交互式學習
- 🔄 **持續能力提升**：通過與環境交互不斷改進策略
- 🎮 **更接近人類學習方式**：模擬人類探索學習新網站

### Multimodal-Mind2Web：多模態擴展

[Multimodal-Mind2Web](https://huggingface.co/datasets/osunlp/Multimodal-Mind2Web)增加了視覺模態：

- 🖼️ **配對截圖數據**：每個DOM快照配有對應的頁面截圖
- 👁️ **視覺-語言對齊**：支持多模態Web代理研究
- 📸 **更豐富的上下文**：結合視覺和文本信息理解頁面

---

## 設計哲學總結

### 1. 真實優先原則

Mind2Web最重要的設計決策是**堅持使用真實網站**。這使得數據集能夠反映真實網絡的複雜性，但也帶來了挑戰（如網站可能變化、內容可能失效等）。團隊通過提供DOM快照和MHTML格式來確保數據的持久可用性。

### 2. 任務導向評估

不同於傳統的輸入-輸出匹配評估，Mind2Web採用**任務完成度**作為核心評估標準。這意味著代理需要在多個操作步驟後依然保持正確的方向，最終完成整個任務。

### 3. 泛化能力分級

通過Cross Task、Cross Website、Cross Domain三個難度的測試分割，Mind2Web建立了一個**層次化的泛化評估體系**，幫助研究者精確定位模型的泛化瓶頸。

### 4. 小模型輔助大模型

兩階段Pipeline的設計體現了**分工協作**的哲學：小型高效模型（DeBERTa）負責信息篩選，大型模型（Flan-T5/GPT）負責複雜推理。這種設計顯著降低了計算成本，同時保持了性能。

### 5. 開源開放

Mind2Web堅持**開源數據集、代碼和模型**，為社區提供了：
- 完整的數據集（HuggingFace）
- 訓練好的模型（HuggingFace）
- 完整的評估框架
- 詳細的文檔和示例

---

## 核心觀點與結論總結

### 核心觀點

#### 觀點一：真實環境測試是Web代理研究的關鍵

當前大多數Web代理研究在模擬環境中進行，雖然便於評估，但無法真正反映代理在複雜多變的真實網絡中的表現。Mind2Web填補了這一空白，提供了首個基於真實網站的大規模基準。

#### 觀點二：候選過濾是LLM處理長HTML的關鍵

真實網頁的DOM元素數量龐大，直接輸入LLM既不現實也不高效。Mind2Web證明了通過小型LM先進行候選元素過濾，可以顯著提升效率和效果。這一範式被後續研究廣泛採用。

#### 觀點三：跨域泛化是核心挑戰

實驗結果顯示，即使是最先進的GPT-4，在Cross Domain設置下的準確率也僅有28.9%。這說明**領域泛化**是當前Web代理技術的核心瓶頸，需要更多研究關注。

#### 觀點四：兩階段Pipeline是有效架構

候選生成+動作預測的兩階段設計，在性能和效率之間取得了良好的平衡。這一架構設計被後續多個Web代理工作所借鑒和擴展。

#### 觀點五：多模態是未來方向

Mind2Web團隊的後續工作（SeeAct、Multimodal-Mind2Web）表明，結合視覺信息可以進一步提升Web代理的性能，多模態是Web代理研究的重要發展方向。

### 方法論貢獻

| 貢獻類型 | 具體內容 |
|---------|---------|
| **數據集貢獻** | 首個真實Web代理基準，137網站/31領域/2350任務 |
| **評估框架貢獻** | 三級泛化評估體系，多維度評估指標 |
| **模型貢獻** | 完整的MindAct模型和訓練/推理代碼 |
| **實踐貢獻** | 兩階段Pipeline設計，提供可重現的基線 |

### 局限性

1. **網站動態性**：真實網站會不斷變化，可能影響數據的時效性
2. **離線評估局限**：當前的評估是離線的，無法反映在線交互的複雜性
3. **單一操作模態**：主要支持CLICK/TYPE/SELECT，對更複雜交互的支持有限
4. **成本考量**：使用GPT-4等大模型進行評估成本較高

### 未來展望

| 方向 | 描述 |
|------|------|
| **在線學習** | Online-Mind2Web探索的交互式學習範式 |
| **多模態融合** | SeeAct等工作中結合視覺信息的方法 |
| **更複雜的任務** | 長時序推理、多輪對話等更複雜的交互模式 |
| **實際應用** | 將Web代理技術應用到實際產品中 |
| **安全性** | 在真實環境中確保代理行為的安全性和可靠性 |

---

## 參考資源

| 資源 | 連結 |
|------|------|
| 論文 (arXiv) | [arxiv.org/abs/2306.06070](https://arxiv.org/abs/2306.06070) |
| 項目網站 | [osu-nlp-group.github.io/Mind2Web/](https://osu-nlp-group.github.io/Mind2Web/) |
| GitHub倉庫 | [github.com/OSU-NLP-Group/Mind2Web](https://github.com/OSU-NLP-Group/Mind2Web) |
| 數據集 (HuggingFace) | [huggingface.co/datasets/osunlp/Mind2Web](https://huggingface.co/datasets/osunlp/Mind2Web) |
| 候選生成模型 | [huggingface.co/osunlp/MindAct_CandidateGeneration_deberta-v3-base](https://huggingface.co/osunlp/MindAct_CandidateGeneration_deberta-v3-base) |
| SeeAct擴展 | [osu-nlp-group.github.io/SeeAct/](https://osu-nlp-group.github.io/SeeAct/) |
| Online-Mind2Web | [github.com/OSU-NLP-Group/Online-Mind2Web](https://github.com/OSU-NLP-Group/Online-Mind2Web) |

---

## 結語

Mind2Web是Web代理研究領域的重要里程碑，它不僅提供了首個基於真實網站的大規模基準數據集，還建立了一套完整的評估框架和技術方案。其兩階段Pipeline設計和三級泛化評估體系，為後續研究提供了重要的參考。

然而，實驗結果也清晰地表明，當前的Web代理技術距離真正通用的、能夠在任意網站上自主工作的AI助手還有很長的路要走。28.9%的Cross Domain準確率提醒我們，**領域泛化**仍是AI代理面臨的核心挑戰。

隨著多模態技術、在線學習方法和更強大的基礎模型的不斷發展，我們有理由相信，真正通用的Web代理在不遠的將來將成為可能。Mind2Web為這一目標奠定了重要的研究基礎。

---

**引用方式**：
```
@misc{deng2023mind2web,
  title={Mind2Web: Towards a Generalist Agent for the Web},
  author={Xiang Deng and Yu Gu and Boyuan Zheng et al.},
  year={2023},
  eprint={2306.06070},
  archivePrefix={arXiv},
  primaryClass={cs.CL}
}
```
