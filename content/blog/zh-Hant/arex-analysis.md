---
title: "AREX 深度解析：BAAI 開源的可遞迴自我改進深度研究 Agent"
description: "全面分析 BAAI（北京智源人工智慧研究院）開源的 AREX —— 一個可遞迴自我改進的深度研究 Agent。從 arXiv 2607.21461 論文核心思想「發現-驗證不對稱」到雙迴圈框架，從 AREX-Turbo / AREX-Base 模型到完整使用教學，一文講透這個 Apache 2.0 開源研究模型的設計哲學。"
date: "2026-08-03"
author: "TopDigg Research Team"
tags: ["AREX", "BAAI", "智源", "深度研究", "Agent", "遞迴自我改進", "arXiv", "開源模型", "Deep Research", "MoE", "Qwen3.5"]
categories: ["深度解析"]
keywords: ["AREX", "BAAI", "智源人工智慧研究院", "深度研究Agent", "遞迴自我改進", "Deep Research", "arXiv 2607.21461", "開源模型", "Apache 2.0", "Qwen3.5", "AREX-Turbo", "AREX-Base", "發現驗證不對稱"]
---

# AREX 深度解析：BAAI 開源的可遞迴自我改進深度研究 Agent

> 核心理念：**發現一個答案很貴，驗證一個答案很便宜。** 深度研究需要找到同時滿足多個約束的答案，而「發現」的搜尋空間巨大；但「驗證」一個候選答案，往往可以拆解成逐約束的簡單檢查。AREX 抓住這個不對稱性，讓 Agent 不是簡單地搜得更久，而是**遞迴地自我改進** —— 用部分驗證的狀態指導後續的迭代。

---

## 一、專案說明

### 1.1 這是什麼？

**AREX（Recursively Self-Improving Agent for Deep Research）** 是北京智源人工智慧研究院（BAAI）於 2026 年 7 月發布的**可遞迴自我改進的深度研究 Agent**。它不只是又一個大模型 —— 而是一套完整的「研究 Agent 方法論 + 訓練好的模型」。

- **論文**：arXiv:2607.21461（cs.AI，2026 年 7 月 23-24 日投稿）
- **論文標題**：*AREX: Towards a Recursively Self-Improving Agent for Deep Research*
- **作者**：陸姝琦、李超凡、羅坤等 24 位研究者（BAAI）
- **主頁**：https://vectorspacelab.github.io/arex-model/
- **線上演示**：https://arex-research.com/
- **模型集合**：https://huggingface.co/collections/BAAI/arex

### 1.2 開源模型一覽

- **AREX-Turbo**：4B 稠密模型，基於 Qwen3.5-4B，Apache 2.0 授權，**256K 上下文**
- **AREX-Base**：122B 總參數 / 10B 激活（MoE），基於 Qwen3.5-122B-A10B，Apache 2.0 授權，**256K 上下文**

> 兩個模型均採用 **Apache 2.0** 開源授權，可免費用於研究與商業場景。這是 BAAI 繼 BGE、BGE-M3 等開源模型之後的又一重要開源貢獻。

---

## 二、核心思想：發現-驗證不對稱（Discovery-Verification Asymmetry）

### 2.1 問題：深度研究為什麼這麼貴？

深度研究要求 Agent 找到**同時滿足多個約束**的答案。難點在於：

- **發現（Discovering）**一個同時滿足所有約束的答案 —— 搜尋空間巨大，成本極高
- **驗證（Verifying）**一個候選答案 —— 往往可以拆解成**逐約束的簡單檢查**，成本低得多

> 打個比方：讓你從北京找一個同時「離捷運近、價格低於 5000、朝南、有電梯」的房子很難；但給你一個具體房源，驗證這四條約束每一條都很快。**發現難，驗證易 —— 這就是不對稱。**

### 2.2 AREX 的解法：不搜得更久，而是遞迴改進

AREX 的關鍵洞察是：**用「部分驗證過的中間狀態」指導後續的迭代**，而不是盲目擴大搜尋。

- 每次迭代驗證中間結果
- 保留已驗證的發現
- 針對未解決的約束繼續研究
- 形成**遞迴的自我改進迴圈**

---

## 三、技術架構：雙迴圈框架

### 3.1 內部研究迴圈（Inner Research Loop）

- 收集證據、評估候選、構建臨時答案
- 透過累積的軌跡維護研究狀態
- 產出帶**支援證據**和**置信度分數（0-100）**的答案

### 3.2 外部自我改進迴圈（Outer Self-Improvement Loop）

逐約束審計臨時答案，按決策規則處理：

- **接受（Accept）**：置信度 ≥ 閾值
- **細化（Refine）**：置信度 < 閾值 且 軌跡可恢復 —— 保留有用發現，針對未解決的約束繼續研究
- **重啟（Restart）**：置信度 < 閾值 且 軌跡過於混亂/誤導 —— 重新開始

### 3.3 自主上下文更新工具（update_context）

AREX 學會自主呼叫 `update_context`，把不斷增長的互動歷史壓縮成緊湊的**改進狀態（improvement state）**：

- 保留已驗證的發現與來源標識
- 記錄約束滿足狀態
- 標出未解決的資訊缺口
- 明確下一步研究計畫

> 這不是通用摘要！**Agent 自己**圍繞當前研究目標組織更新，讓壓縮後的狀態與不斷演化的信念保持一致。

### 3.4 可用工具

- **search**：批次網頁搜尋（每個查詢返回前 10 條結果）
- **visit**：存取網頁並返回內容摘要
- **google_scholar**：學術論文搜尋
- **update_context**：壓縮記憶/研究狀態
- **finish**：返回帶證據的最終答案

---

## 四、訓練管線：多階段訓練

### 4.1 Agent 化中期訓練（Agentic Mid-training）

漸進式能力構建：

- **瀏覽密集型研究任務**：基礎工具使用、證據獲取
- **專家推理任務**：長程思考、多步演繹
- **混合能力整合**：帶關鍵步驟聚焦回放

### 4.2 步驟感知強化學習（Step-Aware RL）

- 步驟級策略最佳化 + 分層歸一化
- **關鍵步驟獎勵塑形**：對關鍵決策點給予輔助獎勵
- **最終答案正確性**仍然是主要最佳化目標

### 4.3 關鍵步驟聚焦監督（Key-Step Focused Supervision）

識別關鍵步驟，例如：

- 獲取**關鍵證據**的步驟
- **拒絕錯誤假設**的步驟
- 上下文更新**保留已驗證證據**的步驟

> 這解決了長期任務的**信用分配（credit assignment）**難題：在幾十上百步的軌跡中，哪些步驟真正決定了最終答案的品質？

---

## 五、詳細教學：如何使用 AREX

### 5.1 方式一：vLLM 部署

```bash
# 安裝 vLLM
pip install vllm

# 部署模型
vllm serve BAAI/AREX-Turbo \
  --served-model-name AREX-Turbo \
  --tensor-parallel-size 1 \
  --max-model-len 262144 \
  --reasoning-parser qwen3 \
  --language-model-only
```

### 5.2 方式二：SGLang 部署

```bash
pip install sglang

python3 -m sglang.launch_server \
    --model-path "BAAI/AREX-Turbo" \
    --host 0.0.0.0 \
    --port 30000
```

### 5.3 方式三：Transformers 本地載入

```python
from transformers import AutoProcessor, AutoModelForMultimodalLM

processor = AutoProcessor.from_pretrained("BAAI/AREX-Turbo")
model = AutoModelForMultimodalLM.from_pretrained(
    "BAAI/AREX-Turbo",
    device_map="auto"
)

messages = [
    {
        "role": "user",
        "content": [
            {"type": "image", "url": "https://example.com/image.jpg"},
            {"type": "text", "text": "Describe this image"}
        ]
    },
]

inputs = processor.apply_chat_template(
    messages,
    add_generation_prompt=True,
    tokenize=True,
    return_dict=True,
    return_tensors="pt",
).to(model.device)

outputs = model.generate(**inputs, max_new_tokens=40)
print(processor.decode(outputs[0][inputs["input_ids"].shape[-1]:]))
```

### 5.4 Agent 迴圈：XML 工具呼叫

```python
from openai import OpenAI

client = OpenAI(
    base_url="http://127.0.0.1:8000/v1",
    api_key="EMPTY",
    timeout=600.0,
)

question = "你的研究問題"
messages = [
    {"role": "system", "content": SYSTEM_PROMPT},  # 包含工具描述
    {"role": "user", "content": f"Question: {question}"}
]

# 迴圈：生成 → 執行工具 → 追加結果 → 重複
while True:
    response = client.chat.completions.create(
        model="AREX-Turbo",
        messages=messages,
        max_tokens=8192,
        temperature=1.0,
        top_p=0.95,
        presence_penalty=1.5,
        extra_body={"top_k": 20},
    )

    assistant_output = response.choices[0].message.content
    messages.append({"role": "assistant", "content": assistant_output})

    # 如果呼叫 finish，提取答案並退出
    if "<function=finish>" in assistant_output:
        break

    # 執行工具並追加結果
    tool_result = execute_tool(assistant_output)
    messages.append({"role": "tool", "content": f"<tool_response>{tool_result}</tool_response>"})
```

### 5.5 工具清單（來自 prompts.py）

- `search(query: list[str])` — 批次網頁搜尋
- `visit(url: str|list[str], goal: str)` — 存取網頁
- `google_scholar(query: list[str])` — 學術搜尋
- `update_context(context: str)` — 壓縮研究狀態
- `finish(answer: str, evidences: list[{evidence, url}])` — 提交最終答案

---

## 六、基準表現

### 6.1 AREX 系列成績

- **BrowseComp**：AREX-Base **82.5** / AREX-Turbo 70.7
- **GAIA**：AREX-Base **85.4** / AREX-Turbo 81.6
- **xbench-2510**：AREX-Base **71.0** / AREX-Turbo 57.0
- **DeepSearchQA**：AREX-Base **89.9** / AREX-Turbo 78.5
- **WideSearch-en**：AREX-Base **82.0** / AREX-Turbo 68.5
- **HLE w/tools**：AREX-Base **52.4** / AREX-Turbo 40.6

### 6.2 與同級及更大模型的對比（部分基準）

- **Qwen3.5-122B**：BrowseComp 63.8 / GAIA 81.6 / WideSearch-en 60.5
- **Qwen3.5-397B**：BrowseComp 78.6 / GAIA 83.5 / WideSearch-en 74.0
- **Kimi-K2.6（1T）**：BrowseComp 83.2 / GAIA 80.6 / WideSearch-en 80.8
- **DeepSeek-Pro（1.6T）**：BrowseComp 83.4 / WideSearch-en 78.0
- **GPT-5.4**：BrowseComp 82.7 / WideSearch-en 88.5
- **Gemini-3.1-Pro**：BrowseComp 85.9 / GAIA 80.6 / WideSearch-en 66.4

> 關鍵結論：**AREX-Base（122B MoE，僅 10B 激活）** 大幅超越同規模基線，並在多個基準上保持與激活參數多得多的模型相當的水平 —— 驗證了「遞迴自我改進帶來的收益 > 單純擴大參數規模」。

---

## 七、設計哲學

### 7.1 五條核心設計原則

1. **驗證是主動控制訊號**：驗證不是最終過濾器，而是定義研究輪次之間的轉換 —— 接受 / 細化 / 重啟由它驅動
2. **跨迭代保留進展**：已驗證的發現存活下來，只有未解決的約束被重新研究
3. **自主上下文管理**：Agent 自己決定何時壓縮上下文，並圍繞自己的研究目標組織 —— 而非外部通用摘要
4. **關鍵步驟信用分配**：關鍵研究決策（找到證據、拒絕錯誤假設）獲得聚焦的訓練訊號
5. **效率優先於規模**：遞迴自我改進比單純擴大參數提供更好的收益

### 7.2 與相關工作定位

- **vs MiroThinker**：它靠擴大上下文和模型規模；AREX 專注遞迴改進
- **vs WebResearcher**：它採用迭代範式；AREX 增加驗證引導的轉換
- **vs DeepSeek / 查詢聚合**：AREX 的逐約束驗證在根本上不同

### 7.3 為什麼獨特

1. 發現-驗證不對稱作為設計原則
2. 遞迴雙迴圈框架（內迴圈 + 外迴圈）
3. 學習到的自主上下文更新工具
4. 關鍵步驟聚焦訓練解決信用分配
5. 帶置信度分數的證據支撐答案結構

---

## 八、局限性與開放問題

1. **HLE（Humanity's Last Exam）仍有提升空間**：AREX-Base 52.4%，距離頂尖還有距離
2. **長期信用分配仍具挑戰**：幾十上百步軌跡中如何精準歸因，仍是開放問題
3. **軌跡可恢復性評估偶爾誤判**：Refine/Restart 的決策邊界不總是完美

---

## 九、歸納總結：觀點與結論

### 9.1 核心觀點

- **發現-驗證不對稱是一個可複用的設計原則**：任何「搜尋空間大、驗證便宜」的問題（研究、除錯、決策），都可以借鑑「先驗證、後擴展」的遞迴策略
- **驗證驅動迭代，比搜尋驅動迭代更高效**：把資源花在驗證和精細化上，而不是盲目擴大搜尋
- **上下文管理應該是 Agent 的能力，而不是外部工具**：AREX 證明了讓模型學會自主壓縮上下文，能讓長程任務保持連貫的信念狀態
- **關鍵步驟監督是長程 RL 的鑰匙**：解決信用分配問題，才能讓幾十上百步的研究軌跡真正可訓練
- **開源 + Apache 2.0 是 BAAI 的生態承諾**：122B 模型（10B 激活）達到接近 1T 模型的水平，讓高品質深度研究 Agent 不再是大廠專屬

### 9.2 對開發者的啟示

- 兩個模型都是 Apache 2.0，**可以直接商用**
- AREX-Turbo（4B）可以在消費級硬體上部署，適合輕量研究任務
- AREX-Base（122B MoE，10B 激活）在 vLLM/SGLang 上即可服務，無需千億級顯存
- 256K 上下文 + 工具呼叫範式（XML）與主流推理框架相容

### 9.3 結語

> AREX 的啟示在於：**深度研究的瓶頸不是「想得久」，而是「改得對」。** 當模型學會驗證自己的發現、保留有效進展、聚焦未解決約束時，一個 122B 的 MoE 模型也能在多個基準上逼近 1T 級別的閉源模型 —— 遞迴自我改進，是比參數堆砌更優雅的進化路徑。

**一句話總結：AREX = 驗證驅動的遞迴自我改進，讓深度研究 Agent 用更少的算力，逼近更強的模型。**

---

## 參考資料

- 論文：https://arxiv.org/abs/2607.21461
- HuggingFace 論文頁：https://huggingface.co/papers/2607.21461
- 模型集合：https://huggingface.co/collections/BAAI/arex
- 專案主頁：https://vectorspacelab.github.io/arex-model/
- 線上演示：https://arex-research.com/
- 引用格式：

```bibtex
@misc{baai2026arex,
  title={AREX: Towards a Recursively Self-Improving Agent for Deep Research},
  author={Shuqi Lu and Chaofan Li and Kun Luo et al.},
  year={2026},
  eprint={2607.21461},
  archivePrefix={arXiv},
  primaryClass={cs.AI},
  url={https://arxiv.org/abs/2607.21461},
}
```