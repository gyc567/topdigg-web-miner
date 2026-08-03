---
title: "AirLLM 深度解析：讓 70B 大模型在 4GB 顯示卡上跑起來的分層推理革命"
description: "全面分析開源專案 AirLLM —— 不量化、不蒸餾、不剪枝，透過逐層載入技術讓 70B 參數大模型在單張 4GB 顯示卡上完成推理。從安裝教學到 API 使用，從工作原理到設計哲學，一文講透這個 2.6 萬星專案的核心思想。"
date: "2026-08-03"
author: "TopDigg Research Team"
tags: ["AirLLM", "LLM推理", "大模型", "GPU顯存優化", "分層推理", "開源專案", "Gavin Li", "深度學習", "模型推理", "低階硬體"]
categories: ["深度解析"]
keywords: ["AirLLM", "LLM推理", "70B模型", "4GB顯示卡", "分層推理", "Layer-wise Inference", "Gavin Li", "Anima AI", "開源", "GPU顯存", "AutoModel", "模型壓縮"]
---

# AirLLM 深度解析：讓 70B 大模型在 4GB 顯示卡上跑起來的分層推理革命

> 核心理念：**我們為什麼必須把整個模型裝進顯存？** 如果推理時每一層都是順序執行的，那麼只需要把「正在執行的那一層」放進 GPU，算完就釋放。AirLLM 用這個看似簡單的反問，讓 70B 參數的大模型在單張 4GB 顯示卡上完成推理 —— 不量化、不蒸餾、不剪枝。

---

## 一、專案說明

### 1.1 這個專案是什麼？

**AirLLM** 是一個開源的大語言模型推理框架，由 **Gavin Li**（Anima AI 創辦人、前 Airbnb / 阿里巴巴 AI 高階負責人）創建。它的核心能力是**大幅降低 LLM 推理的顯存佔用**，讓 70B 參數模型在**單張 4GB 顯示卡**上運行 —— 全程不需要量化、蒸餾或剪枝。

> GitHub 原文：*"AirLLM optimizes inference memory usage, letting 70B large language models run inference on a single 4GB GPU card — without quantization, distillation, or pruning."*

### 1.2 專案數據一覽

- **GitHub Stars**：26,230+（截至 2026 年 8 月）
- **授權**：Apache License 2.0
- **活躍狀態**：持續開發中（最近提交 2026 年 7 月 29 日）
- **發布平台**：PyPI（`pip install airllm`）
- **官方倉庫**：https://github.com/lyogavin/airllm

### 1.3 它能做到什麼？（官方實測顯存數據）

- **Qwen3 / Mistral / Phi（約 8B）** → 僅需 **約 1–2 GB** 顯存
- **Qwen3-30B / Mixtral（MoE，30–47B）** → **約 1–3 GB**
- **Qwen3-235B（MoE）** → **約 3 GB**
- **Llama 3.x 70B** → **約 4 GB**
- **Llama 3.1 405B** → **約 8 GB**
- **DeepSeek-V3（671B）** → **約 12 GB**
- **Kimi K3（2.8T）** → **約 3.72 GB**

> 注意：以上為官方實測數據。傳統方式下 70B 模型全量載入需要約 140GB 顯存，AirLLM 將其壓縮到 4GB —— 顯存需求降低了 30 倍以上。

---

## 二、核心思想：為什麼整個模型必須常駐顯存？

### 2.1 一個被忽略的常識

大模型推理時，Transformer 的每一層是**順序執行**的：前一層的輸出是後一層的輸入，同一時刻只有**一層**在計算。

作者 Gavin Li 在 Medium 上如此解釋：

> "During inference, layers are executed sequentially. The output of the previous layer is the input to the next. Only one layer executes at a time. Therefore, it is completely unnecessary to keep all layers in GPU memory. We can load whichever layer is needed from disk when executing that layer, do all the calculations, and then completely free the memory after."

翻譯過來就是：**既然同一時刻只有一層在算，為什麼要把所有層都塞進顯存？** 把「正在執行的那一層」從磁碟載入到 GPU，算完立刻釋放，再載入下一層 —— 這就是 AirLLM 的全部秘密。

### 2.2 與主流思路的根本區別

業界主流做法是「讓模型變小去適配顯存」：

- **量化**：把權重從 FP16 壓到 INT8/INT4，犧牲精度換體積
- **蒸餾**：用大模型教小模型，重新訓練一個小的
- **剪枝**：刪掉不重要的參數

而 AirLLM 的思路完全不同 —— **不改變模型，而是改變模型的存放位置**：把 GPU 顯存當作「快取」，把磁碟當作「主存」。用速度換容量，讓普通人用自己已有的硬體跑起大模型。

---

## 三、詳細教學：從安裝到跑通

### 3.1 安裝

一條指令即可安裝：

```bash
pip install airllm
```

如需支援 Kimi K3（MoE 逐專家流式載入），額外安裝：

```bash
pip install airllm compressed-tensors flash-attn
```

### 3.2 快速上手：AutoModel 自動載入

AirLLM 提供與 HuggingFace 無縫相容的 `AutoModel` API，支援自動識別模型架構：

```python
from airllm import AutoModel

MAX_LENGTH = 128
model = AutoModel.from_pretrained("Qwen/Qwen3-32B")

input_text = ['What is the capital of United States?']
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

> 用法與 HuggingFace `transformers` 幾乎一致：`from_pretrained` 載入、`tokenizer` 編碼、`generate` 生成 —— 上手成本極低。

### 3.3 使用壓縮模式進一步提速

如果希望推理速度更快，可以開啟 4-bit / 8-bit 量化（權重量化，精度損失幾乎可忽略）：

```python
model = AutoModel.from_pretrained(
    "garage-bAInd/Platypus2-70B-instruct",
    compression='4bit'   # 或 '8bit'
)
```

### 3.4 載入超大模型（405B / 671B）

AirLLM 對 HuggingFace 生態的超大模型開箱即用：

```python
# Llama 3.1 405B
model = AutoModel.from_pretrained("unsloth/Meta-Llama-3.1-405B-Instruct-bnb-4bit")
```

### 3.5 支援的模型架構

AirLLM 幾乎覆蓋了所有主流開源模型：

- **Llama 系列**：Llama 2 / 3 / 3.1 / 3.3 / 4，包括 405B
- **Qwen 系列**：Qwen 1 / 2 / 2.5 / 3，含 MoE 與 FP8 變體
- **DeepSeek 系列**：V2 / V3 / R1，包括 671B DeepSeek-V3
- **Mistral / Mixtral**：Mistral-7B、Mixtral MoE
- **Phi、Gemma**：微軟與谷歌系列
- **ChatGLM、Baichuan、InternLM、Yi**：國產模型家族

### 3.6 首次執行注意事項

- **首次分片**：第一次執行需要將模型逐層分片到磁碟，耗時約 **10–30 分鐘**（視模型大小與磁碟速度）
- **磁碟空間**：首次執行需要原始模型 + 分片副本，約佔模型體積 **2 倍**；可用 `delete_original=True` 刪除原始檔案釋放空間
- **建議使用 NVMe SSD**：磁碟 I/O 是主要瓶頸，機械硬碟上速度會降到 0.1 token/s 以下
- **常見報錯**：遇到 `MetadataIncompleteBuffer` 錯誤，**大概率是磁碟空間不足**

---

## 四、工作原理：AirLLM 的四大技術支柱

### 4.1 逐層分片（Layer-wise Sharding）

模型被按層切分成獨立的磁碟檔案（基於 safetensors 記憶體映射）。推理時按需載入，而非一次性全部載入。

### 4.2 元裝置初始化（Meta Device Initialization）

使用 `accelerate.init_empty_weights()` 搭建模型結構 —— **只建立張量結構，不分配任何顯存**。

### 4.3 前向鉤子（Forward Hooks）

這是整套機制的核心。每個 Transformer 層掛載兩個鉤子：

- **Pre-hook（前鉤子）**：把該層權重從磁碟載入到 GPU
- **Post-hook（後鉤子）**：計算完畢，把權重移回元裝置並呼叫 `clean_memory()` 釋放顯存

```python
def _pre_hook(self, module, args):
    idx = module._airllm_idx
    if self.prefetching and self._prefetch_future is not None and self._prefetched_idx == idx:
        state_dict = self._prefetch_future.result()
    else:
        state_dict = self._load_streamed_layer(idx)
    module._airllm_moved = self.move_layer_to_device(state_dict)
    # 預取下一層
    if self.prefetching:
        nxt = self._next_streamed_idx(idx)
        if nxt is not None:
            self._prefetch_future = self._executor.submit(self._load_streamed_layer, nxt)
```

### 4.4 三項關鍵優化

- **預取（Prefetching，v2.5+）**：在第 N 層 GPU 計算的同時，預先把第 N+1 層從磁碟讀入 —— 約 **10% 的速度提升**
- **MoE 逐專家流式載入（Per-Expert Streaming，v3.1+）**：MoE 模型不再整層載入，只載入路由器為當前 token 選中的專家
- **MXFP4 打包傳輸（Kimi K3）**：權重在 PCIe 傳輸全程保持 4-bit 壓縮，只在 GPU 上解壓 —— 傳輸資料量減少 **4 倍**

---

## 五、設計哲學

### 5.1 作者的原點問題

Gavin Li 的出發點是一個樸素的問題：

> "Large language models require huge amounts of GPU memory. Is it possible to run inference on a single GPU? If so, what is the minimum GPU memory required?"

**大模型需要海量顯存 —— 能不能用單張顯示卡跑？如果能，最低需要多少顯存？**

### 5.2 反轉傳統架構

AirLLM 的設計哲學可以概括為一句話：**與其壓縮模型去適配顯存，不如重新思考「為什麼整個模型必須常駐顯存」。** 它把 GPU 顯存當作快取、磁碟當作主存，反轉了傳統推理架構 —— 用可接受的降速，換取在**你已經擁有的硬體**上運行。

### 5.3 四條核心設計決策

1. **預設不壓縮模型**：保留完整模型品質，壓縮只是可選項 —— 量化永遠伴隨精度損失，AirLLM 的選擇是「能用才量化」
2. **瞄準 I/O 瓶頸而非算力**：AirLLM 的瓶頸在磁碟載入，所以它最佳化的是資料傳輸，而不是矩陣計算
3. **HuggingFace 原生相容**：使用標準 `AutoModel` API，讓所有 HF 模型開箱即用
4. **鉤子式架構**：透過 forward hook 與模型架構解耦，無需為每種注意力/旋轉編碼/快取實現重寫

### 5.4 作者對量化的精闢論述

> "Quantization normally needs to quantize both weights and activations to really speed things up. While in our case the bottleneck is mainly at the disk loading, we only need to make the model loading size smaller. So, we get to only quantize the weights' part, which is easier to ensure the accuracy."

**翻譯**：常規量化需要同時量化權重和激活值才能顯著提速；但 AirLLM 的瓶頸在磁碟載入，只需要把模型載入體積變小 —— 因此**只量化權重部分**，精度更容易保證。

> 這是一個非常聰明的洞察：**最佳化的目標決定了最佳化的手段。** 既然瓶頸是 I/O 而不是計算，就不需要付出激活量化的代價。

---

## 六、效能表現：用速度換容量

### 6.1 用速度換容量

**顯存佔用（70B 模型）**
- 傳統全量載入：約 **140 GB**
- AirLLM 逐層載入：約 **4 GB**

**推理速度**
- 傳統 A100：10–20 token/s
- AirLLM（4GB 顯示卡）：約 0.5–2 token/s

**瓶頸**
- 傳統方案：顯存
- AirLLM：磁碟 I/O

**硬體門檻**
- 傳統方案：多卡 A100 / H100
- AirLLM：普通 4GB 消費級顯示卡

- 開啟 4-bit / 8-bit 塊級量化後，推理速度最高可提升 **3 倍**，精度損失「幾乎可忽略」
- 與 llama.cpp 社群討論中的評價一致：*"AirLLM uses a patent-pending layer decomposition engine... you only get GPU speeds whilst the layer is executing, and it stops when waiting for the next layer to be loaded."*

---

## 七、與主流方案的對比

- **AirLLM**：逐層磁碟流式載入。**慢，但保真、顯存極小** —— 適合離線批次處理
- **llama.cpp / GGUF**：權重量化 + CPU/GPU 混合推理。有精度損失，但速度更快
- **HuggingFace Accelerate**：多裝置卸載（offload）。**需要多張顯示卡**
- **vLLM / TGI**：批次排程 + KV 快取最佳化。**需要大顯存**

> 定位差異：AirLLM 解決的是「**我沒有大顯存**」的問題，其他方案解決的是「**我有很多 token 要高效處理**」的問題。

---

## 八、限制與注意事項

1. **速度慢**：推理速度比全量載入慢 10–50 倍，適合離線批次任務，不適合互動式即時對話
2. **磁碟佔用翻倍**：首次執行需要原始模型 + 分片副本，記得用 `delete_original=True` 清理
3. **首次分片耗時**：10–30 分鐘，取決於模型大小和磁碟效能
4. **I/O 敏感**：強烈推薦 NVMe SSD，機械硬碟基本不可用
5. **Kimi K3 有硬性要求**：需要 CUDA 12（不是 CUDA 13）、`transformers==4.56.x`（5.x 不相容）、必須安裝 `flash-attn`

---

## 九、歸納總結：觀點與結論

### 9.1 核心觀點

- **顯存不是模型推理的必要條件，只是快取**：AirLLM 證明了「把顯存當快取、磁碟當主存」的架構可行性，這是對「大模型必須大顯存」這個預設假設的正面挑戰
- **最佳化目標決定最佳化手段**：因為瓶頸在 I/O，AirLLM 只做權重量化即可，避免了激活量化的精度風險 —— 這是一個可複用的工程思維
- **「能跑」比「跑得快」優先**：當硬體被鎖死時，先解決 0→1 的問題，再解決 1→N 的速度問題
- **MoE 是超大規模模型的關鍵**：逐專家流式載入讓 2.8T 參數的 Kimi K3 只需 3.72GB 顯存，驗證了 MoE 稀疏激活特性與分層推理的天作之合

### 9.2 對普通開發者的啟示

- 沒有大顯存也能玩轉 70B 級模型，**消費級顯示卡 + AirLLM 就是一個低成本實驗平台**
- 與 HuggingFace 生態無縫相容，**遷移成本幾乎為零**
- 適合離線批次處理、研究實驗、教學演示等對即時性要求不高的場景

### 9.3 結語

AirLLM 的意義不止於一個技術方案，更是一種**思維範式的示範**：當所有人都預設「模型太大，必須壓縮模型」時，它選擇反問「**為什麼模型必須全部在顯存裡？**」—— 這種對預設假設的質疑，往往能開啟全新的可能性空間。

**一句話總結：AirLLM = 用磁碟換顯存，用速度換門檻，讓大模型回歸普通人的硬體。**

---

## 參考資料

- 官方倉庫：https://github.com/lyogavin/airllm
- PyPI 頁面：https://pypi.org/project/airllm/
- 作者 Medium 文章：https://medium.com/@lyo.gavin/unbelievable-run-70b-llm-inference-on-a-single-4gb-gpu-with-this-new-technique-93e2057c7eeb
- 引用格式：

```bibtex
@software{airllm2023,
  author = {Gavin Li},
  title = {AirLLM: scaling large language models on low-end commodity computers},
  url = {https://github.com/lyogavin/airllm/},
  version = {0.0},
  year = {2023},
}
```