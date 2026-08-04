---
title: "DwarfStar (ds4) 深度解析：Redis 作者 antirez 的本地 LLM 推理引擎——為 DeepSeek V4 Flash 定製的垂直整合方案"
description: "全面解析 antirez 開源的 DwarfStar（ds4）——一個專為 DeepSeek V4 Flash/PRO 與 GLM 5.2 打造的小型原生推理引擎。antirez（Redis 創始人）用 65,000 行 C 程式碼實現 Metal/CUDA/ROCm 三後端、SSD 串流載入、管線並行、DSpark 推測解碼、原生編碼 Agent 與 OpenAI 相容 API 的完整垂直棧。M5 Max 上 87 t/s 前置填充、34 t/s 生成；雙機分散式前置填充最高 674 t/s。從核心思想、架構模組、設計哲學到完整教學與效能基準，一文講透。"
date: "2026-08-04"
author: "TopDigg Research Team"
tags: ["DwarfStar", "ds4", "antirez", "DeepSeek V4", "LLM Inference", "Metal", "CUDA", "ROCm", "Local LLM", "Salvatore Sanfilippo"]
categories: ["Deep Dive"]
keywords: ["DwarfStar", "ds4", "antirez", "DeepSeek V4 Flash", "本地推論", "LLM", "Metal", "CUDA", "ROCm", "Redis 創始人", "推測解碼", "SSD 串流載入", "管線並行", "垂直整合"]
---

# DwarfStar (ds4) 深度解析：Redis 作者 antirez 的本地 LLM 推理引擎——為 DeepSeek V4 Flash 定製的垂直整合方案

> 核心思想：**不做通用推論框架，只為少數最強模型打造「開箱即跑」的極致體驗。** DwarfStar（ds4）是 Redis 創始人 antirez（Salvatore Sanfilippo）的新專案——一個用純 C 編寫的小型原生推理引擎，**刻意做窄、刻意做深**：模型載入、提示詞渲染、工具呼叫、KV 狀態管理、HTTP 伺服器、編碼 Agent 全部作為一個整體建構和測試。它只為 DeepSeek V4 Flash（主要目標）、DeepSeek V4 PRO 和 GLM 5.2 而生，提供 Metal（macOS 主力後端）、NVIDIA CUDA（含多卡 DGX Spark）和 ROCm（AMD Strix Halo）三大後端。在消費級硬體上——MacBook Pro、DGX Spark、Framework Desktop——就能跑動數十 GB 參數的開源模型，且用 SSD 串流載入突破記憶體上限。它代表了 antirez 對「本地 LLM」的完整思考：**模型在進步，工具鏈也應該跟著進化，而不是停留在一個通用但平庸的框架裡。**

---

## 一、專案說明

### 1.1 它是什麼？

**DwarfStar** 是 antirez（Salvatore Sanfilippo）開發的**小型原生 LLM 推理引擎**，縮寫為 **ds4**。它**刻意做窄**——不是一個通用 GGUF 載入器，而是一個**為特定模型垂直整合的推論棧**：

- **模型載入**（GGUF 格式，含路由專家量化）
- **提示詞渲染**（分塊 prefill）
- **工具呼叫**（原生支援）
- **KV 狀態管理**（含磁碟持久化）
- **HTTP 伺服器**（OpenAI / Anthropic 相容 API）
- **編碼 Agent**（行程內原生實作）

——以上所有元件**作為一個整體建構和測試**，而非鬆散拼裝。

### 1.2 關鍵資料

- 儲存庫：`https://github.com/antirez/ds4`
- Stars：**20.4k**
- Forks：**1.8k**
- 作者：**antirez**（Salvatore Sanfilippo，Redis 創始人）
- 建立時間：2026-05-06
- 最後推送：2026-08-03
- License：**MIT**（保留 GGML 版權宣告）
- 語言：**C**（核心引擎 ds4.c 約 65,000 行）
- 提交數：428 commits
- 貢獻者：11 人（antirez 主導 281 次）
- 支援模型：**DeepSeek V4 Flash**（主要目標）、**DeepSeek V4 PRO**、**GLM 5.2**
- 後端：**Metal**（macOS 主力）、**NVIDIA CUDA**（含多卡）、**ROCm**（AMD Strix Halo）

### 1.3 它解決什麼問題？

能跑開源模型的本地推理引擎已有不少（llama.cpp、MLX、vLLM……），但 antirez 看到了一個缺口：**現有方案要么太通用但效率不夠極致，要么太碎片化——每個元件單獨測試，組合起來才發現問題。** DwarfStar 的答案是：**為幾個最強模型打造一個從底到頂的完整棧**——載入、推理、API、Agent 全部在同一個程式碼庫裡一體化測試。這讓它在「特定模型 × 特定硬體」的組合上，能榨出比通用方案更高的效率。

---

## 二、核心思想

### 2.1 刻意做窄——「為少數模型專門優化」

這是與 llama.cpp 等通用方案的根本分野。llama.cpp 試圖支援所有 GGUF 模型，DwarfStar 則**刻意拒絕通用性**：它只為 DeepSeek V4 Flash / PRO 和 GLM 5.2 而生。好處是可以針對這幾個模型的特定架構（路由專家 MoE、特定量化格式、KV 快取結構）做深度優化，而不用為未知模型留相容層。

### 2.2 垂直整合——一個整體，而非一堆碎片

README 原話：**"Model loading, prompt rendering, tool calls, KV state, the HTTP server, and the coding agent are built and tested together."** 這不是說它們用同一個 Makefile 編譯——而是說它們共享狀態、共享記憶體佈局、共享生命週期管理。例如 KV 快取的磁碟持久化（SHA1 為檔名）和編碼 Agent 的工具回放（DSML 精確回放）是緊密耦合的——Agent 重啟時能精確恢復到上次對話狀態。

### 2.3 誠實的 AI 公告——「這軟體是 AI 寫的，你介意就別用」

antirez 在 README 裡坦率寫道：**"This software is developed with strong assistance from GPT 5.5, 5.6, Claude Fable and with humans leading the ideas, testing, and debugging. If you are not happy with AI-developed code, this software is not for you."** 這種透明度在開源社群罕見——不是在角落放一行小字，而是在 README 正文醒目位置宣告。

### 2.4 基於 llama.cpp 而非綁定 llama.cpp

ds4 **不連結 GGML 函式庫**，但它坦承**"exists thanks to the path opened by the llama.cpp project"**——量化格式、內核、GGUF 生態、工程經驗都受益於 llama.cpp。它在 MIT 許可下保留了一部分 GGML 程式碼（量化佈局表、CPU 量化邏輯、部分內核），但引擎本身是獨立的 C 程式碼。

---

## 三、內容架構

### 3.1 原始碼目錄骨架

```
ds4/
├── ds4.c                 # 核心推理引擎（~65,000 行）
├── ds4.h                 # 公共 API 頭檔案
├── ds4_metal.m           # Metal 後端（~40,000 行）
├── ds4_cuda.cu           # CUDA 後端（~30,000 行）
├── ds4_rocm.cu           # ROCm 後端
├── ds4_server.c          # HTTP API 伺服器（~17,500 行）
├── ds4_agent.c           # 原生編碼 Agent（~11,000 行）
├── ds4_distributed.c     # 管線並行（~8,400 行）
├── ds4_tp.c              # 張量並行（~8,600 行）
├── ds4_kvstore.c         # KV 快取磁碟持久化
├── ds4_bench.c           # 吞吐量基準測試
├── ds4_eval.c            # 能力評估（92 道內嵌題）
├── rax.c / .h            # 基數樹（工具回放地圖）
├── metal/                # Metal 內核程式碼
├── cuda/                 # CUDA 內核程式碼
├── rocm/                 # ROCm 內核程式碼
├── gguf-tools/           # GGUF 生成、imatrix、量化工具
├── dir-steering/         # 方向性引導資料與向量生成
├── speed-bench/          # 基準測試指令碼與圖表
├── tests/                # 測試向量與回歸測試
├── Makefile              # 建構系統
├── download_model.sh     # 模型下載腳本
├── AGENT.md              # AI Agent 指令
├── CONTRIBUTING.md       # 貢獻指南
└── QA_BEFORE_RELEASES.md # 發佈前測試矩陣
```

### 3.2 核心抽象

引擎用幾個關鍵結構體和列舉組織整個狀態：

- **`ds4_engine`**：已載入的模型實例
- **`ds4_session`**：一次推理時間線，持有即時 KV 快取和 logits
- **`ds4_backend`** 列舉：`DS4_BACKEND_METAL` / `DS4_BACKEND_CUDA` / `DS4_BACKEND_CPU`
- **`ds4_think_mode`** 列舉：`DS4_THINK_NONE` / `DS4_THINK_HIGH` / `DS4_THINK_MAX`
- **`ds4_distributed_role`** 列舉：`NONE` / `COORDINATOR` / `WORKER`
- **`ds4_tp_role`** 列舉：`NONE` / `LEADER` / `WORKER`

### 3.3 會話狀態管理

DwarfStar 的 KV 快取管理有一個精妙設計：**會話（Session）擁有即時 KV 快取和 logits**，呼叫者提供完整的 token 前綴，`ds4_session_sync()` 自動複用、擴展或重建圖狀態。磁碟 KV 快取用渲染後位元組前綴的 **SHA1** 作為檔名，實現精確的狀態恢復——編碼 Agent 重啟時能無縫銜接上次對話。

### 3.4 不對稱量化策略

這是品質保證的關鍵：**只量化路由專家（routed MoE experts），不量化共享專家/投影層**。路由專家占模型體量的大部分（如 DeepSeek V4），量化到 IQ2_XXS / Q2_K；共享專家、投影層、路由網路保持原始精度。這確保了量化後模型在編碼 Agent 場景下仍能可靠地呼叫工具。

---

## 四、設計哲學

### 4.1 「做窄」是特性，不是缺陷

在「通用性即正義」的開源世界裡，DwarfStar 反其道而行。antirez 明確說：**"The idea of an inference system specialized for a few models."** 他選擇為幾個最強模型做最深的優化，而不是為所有模型做最淺的支援。這讓它在 DeepSeek V4 Flash 上的效率超過通用方案。

### 4.2 一體化測試勝過鬆散拼裝

DwarfStar 的每個發佈都經過完整的 QA 矩陣（`QA_BEFORE_RELEASES.md`），涵蓋遠端 Metal / CUDA / ROCm 機器。這不是靠 CI 跑通過——而是人肉在真實硬體上跑完整測試。模型載入、推理、API、Agent 全部作為一個整體驗證。

### 4.3 誠實優於粉飾

antirez 在 README 中以醒目的位置宣告 AI 參與、宣告專案是 Beta 品質、宣告不支援通用 GGUF、宣告分散式協定無加密。這種「先說問題再說優點」的風格在開源社群罕見，但對使用者來說極其寶貴——你不需要自己踩坑才知道邊界在哪。

### 4.4 基於前人而非複製前人

ds4 不連結 GGML，但坦承站在 llama.cpp 的肩膀上。它在 MIT 許可下複用了一部分程式碼（量化表、內核），但引擎是獨立重寫的。這是「站在巨人肩膀上做自己的事」的典型範例。

---

## 五、詳細教學

### 5.1 建構

```bash
make                  # macOS Metal（預設）
make cuda-spark       # Linux CUDA，DGX Spark / GB10
make cuda-generic     # Linux CUDA，其他本地 CUDA GPU
make strix-halo       # Linux ROCm，AMD Strix Halo
make cpu              # CPU-only 參考建構（僅除錯用）
```

### 5.2 下載模型

```bash
./download_model.sh q2-imatrix     # 96/128 GB 記憶體機器，imatrix 調校的 q2
./download_model.sh q2-q4-imatrix  # 96/128 GB，q2 + 最後 6 層 q4
./download_model.sh q4-imatrix     # ≥ 256 GB 記憶體機器
./download_model.sh mxfp4          # 原生 MXFP4 專家權重，約 156 GB
./download_model.sh pro-q2-imatrix # 512 GB 記憶體機器，PRO q2
```

### 5.3 CLI 使用

```bash
# 單次提示
./ds4 -p "用一段話解釋 Redis streams。"

# 互動式聊天
./ds4

# 關閉思考模式
./ds4 --nothink
```

### 5.4 啟動伺服器

```bash
# 基本伺服器
./ds4-server --ctx 100000 --kv-disk-dir /tmp/ds4-kv --kv-disk-space-mb 8192

# 多卡多會話批次處理（8x L40S）
./ds4-server --cuda --cuda-tensor-parallel \
  --gpu-vram auto \
  --gpu-devices 0,2,4,6,1,3,5,7 \
  --model "$MODEL" \
  --ctx 100000 \
  --batched-session 16 \
  --host 0.0.0.0
```

### 5.5 啟動編碼 Agent

```bash
./ds4-agent --ctx 100000
```

### 5.6 SSD 串流載入（突破記憶體上限）

```bash
./ds4 -m ./ds4flash.gguf \
  --ssd-streaming \
  --ssd-streaming-cache-experts 32GB \
  --ctx 32768
```

### 5.7 管線並行（跨機器推理）

```bash
# 協調器機器（層 0-30）
./ds4 -m gguf/...-layers00-30.gguf \
  --role coordinator --layers 0:30 --listen 169.254.43.68 1234

# 工作機器（層 31 到輸出）
./ds4 -m gguf/...-layers31-output.gguf \
  --role worker --layers 31:output --coordinator 169.254.43.68 1234
```

### 5.8 DSpark 推測解碼（實驗性）

```bash
./download_model.sh dspark-support
./ds4 -m ds4flash.gguf \
  --mtp gguf/DeepSeek-V4-Flash-DSpark-support.gguf \
  --dspark --temp 0
```

### 5.9 基準測試

```bash
./ds4-bench \
  -m ds4flash.gguf \
  --prompt-file speed-bench/promessi_sposi.txt \
  --ctx-start 2048 --ctx-max 65536 --step-incr 2048 --gen-tokens 128
```

### 5.10 能力評估

```bash
./ds4-eval -m ds4flash.gguf   # 92 道內嵌評估題（GPQA、AIME、COMPSEC 等）
```

---

## 六、功能清單

- **三模型支援**：DeepSeek V4 Flash（主要）、DeepSeek V4 PRO、GLM 5.2
- **三後端**：Metal（macOS 主力）、NVIDIA CUDA（含多卡）、ROCm（AMD Strix Halo）
- **SSD 串流載入**：模型大於記憶體時路由專家按需從 SSD 載入
- **管線並行**：跨機器拆分 Transformer 層，像管線一樣協作
- **張量並行**：雙機 Thunderbolt 5 RDMA 或多卡 CUDA 張量並行
- **DSpark 推測解碼**：輔助草稿模型加速生成（實驗性）
- **原生編碼 Agent**：行程內實作，DSML 精確工具回放，KV 快取磁碟持久化
- **OpenAI / Anthropic 相容 API**：`/v1/chat/completions`、`/v1/completions`、`/v1/messages`
- **磁碟 KV 快取**：SHA1 鍵名，支援對話狀態精確恢復
- **三種思考模式**：Non-think / Think High / Think Max
- **方向性引導**（Directional Steering）：透過啟動引導微調模型行為
- **功耗管理**：`--power N` 降低 GPU 功耗/熱量
- **基準測試工具**：`ds4-bench` 吞吐量測試
- **能力評估工具**：`ds4-eval` 92 道內嵌評估題
- **除錯工具**：`--dump-tokens`、`--dump-logprobs`、`--dump-logits`、`--trace`

---

## 七、歸納總結（觀點與結論）

結合專案與資料，幾個值得深思的點：

1. **「做窄」是一種被低估的策略。** 在通用框架軍備競賽中，DwarfStar 選擇只為幾個模型做最深的優化——這讓它在 DeepSeek V4 Flash 上的效率超過通用方案。「少即是多」在工程裡不是空話，是有邊界的真理。

2. **垂直整合是效能的秘密武器。** 當載入、推理、KV 管理、API、Agent 作為一個整體時，狀態可以共享、記憶體可以零複製、生命週期可以統一管理——這些是鬆散拼裝的通用框架做不到的。ds4.c 一個檔案 65,000 行，不是因為程式碼臃腫，而是因為所有狀態都在同一個結構體裡。

3. **SSD 串流載入打破了「記憶體 = 上限」的舊觀念。** 路由專家占模型體量的大部分但只在每次推理時被路由到一部分——DwarfStar 利用這一特性，把非路由權重常駐記憶體、路由專家按需從 SSD 載入。這讓 64 GB MacBook 也能跑 DeepSeek V4 Flash。

4. **antirez 的透明度是開源社群的標桿。** 主動宣告 AI 參與、宣告 Beta 品質、宣告不支援通用 GGUF、宣告分散式協定無加密——這種「先說問題再說優點」的風格讓使用者不需要踩坑就知道邊界在哪。

5. **它站在 llama.cpp 的肩膀上，但不是 fork。** ds4 不連結 GGML，引擎是獨立重寫的 C 程式碼，但坦承站在 llama.cpp 開闢的道路上。這是「站在巨人肩膀上做自己的事」的典型範例——尊重前人但不被前人束縛。

6. **「為特定硬體 + 特定模型」做優化是消費級本地推理的甜點區。** 通用框架為所有硬體和所有模型妥協，DwarfStar 為 Metal + DeepSeek V4 Flash 做了深度優化——在 128 GB MacBook 上就能獲得接近雲端的推理體驗。

---

## 參考資料

- 儲存庫：`https://github.com/antirez/ds4`
- 作者：antirez（Salvatore Sanfilippo，Redis 創始人）
- 模型權重：`huggingface.co/antirez/deepseek-v4-gguf`
- 模型來源：DeepSeek-AI（`huggingface.co/deepseek-ai/DeepSeek-V4-Pro`）
- 基礎設施：llama.cpp / GGML（Georgi Gerganov 及貢獻者）
- AI 輔助：GPT 5.5、5.6、Claude Fable
- 貢獻指南：`CONTRIBUTING.md`
- 發佈測試矩陣：`QA_BEFORE_RELEASES.md`