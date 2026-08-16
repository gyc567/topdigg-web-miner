---
title: 'Soup：在 4GB 筆電 GPU 上微調 8B 模型的 LLM 微調 CLI'
date: "2026-08-16"
description: "深入解析 MakazhanAlpamys/Soup：一個『一條命令完成 LLM 微調』的 CLI 工具。探索它如何透過 Layer Streaming 在 4GB 顯示卡上以 119.6 tok/s 微調 Llama-3.1-8B、如何用位元級精確測試證明正確性、為什麼它選擇『拒絕而非警告』，以及測量文化驅動的設計哲學與完整教學"
tags:
  - Soup
  - LLM
  - Fine-tuning
  - LoRA
  - QLoRA
  - Layer Streaming
  - 機器學習
  - 命令列工具
categories:
  - AI 工具
  - LLM 微調
  - 開源專案
  - 命令列工具
  - 機器學習
---

# Soup：在 4GB 筆電 GPU 上微調 8B 模型的 LLM 微調 CLI

## 文章背景與專案簡介

訓練 LLM 至今仍然痛苦。哪怕是有經驗的團隊，也有 30%–50% 的時間花在跟基礎設施搏鬥上——SSH 進一台壞掉的 GPU 機器、調 batch size、裝驅動、試量化格式——而不是花在改進模型上。**Soup**（[github.com/MakazhanAlpamys/Soup](https://github.com/MakazhanAlpamys/Soup)）就是衝著這個痛點來的：一個 CLI 優先的 LLM 微調工具，宣傳語只有一句話：

> **Fine-tune and post-train LLMs in one command. No SSH, no config hell.**
> （一條命令完成 LLM 的微調與後訓練。沒有 SSH，沒有設定地獄。）

但真正讓 Soup 出圈的，是它的旗艦功能 **Layer Streaming（層流式訓練）**：**在 4GB 顯示記憶體的筆電 GPU 上微調 8B 模型**——實測 Llama-3.1-8B-Instruct + NF4 量化，在 RTX 3050 Laptop 4GB 上達到 **119.6 tok/s、峰值顯示記憶體 3.32 GB**，並且與常駐式訓練**位元級精確（bit-exact）**。這個結果還在 H100 上被獨立複現（113.00 tok/s，同樣的 3.32 GB 峰值）。

Soup 是 Apache-2.0 協議的開源專案，Python 3.10–3.12，目前版本 v0.73.2，打包為 PyPI 套件 `soup-cli`。它維護在一台 4GB 筆電上，作者自己說這是**為什麼文件裡每一個效能數字都是測出來的而不是宣稱出來的**——這份「測量文化」貫穿了 Soup 的文件、基準記錄和論文。

## 專案速覽

| 面向 | 內容 |
|---|---|
| 專案定位 | CLI 優先的 LLM 微調 / 後訓練工具（soup-cli） |
| 核心賣點 | 一條命令微調：`soup init --template chat` → `soup train` |
| 旗艦功能 | Layer Streaming：4GB 顯示卡微調 8B 模型（NF4 + 流式，位元級精確） |
| 技術棧 | Python 3.10–3.12、Typer CLI、Pydantic v2 設定、Rich 輸出 |
| 核心依賴 | 輕量核心 6 個（typer/rich/pydantic/pyyaml/huggingface-hub/plotext）；訓練棧按需 `[train]` extra |
| 協議 | Apache-2.0 |
| 目前版本 | v0.73.2 |
| 支援硬體 | CUDA（推薦）、Apple Silicon MPS、CPU（實驗性，很慢） |
| 支援模型 | 任意 HuggingFace 文字生成模型（`AutoModelForCausalLM`）+ 100+ 現成配方 |
| 論文 | "Exact Layer Streaming: LoRA Fine-Tuning of an 8B Model on a 4 GB Laptop GPU"（Zenodo，v3） |

**設計前提：** 微調需要的時間/金錢/技能門檻正在阻礙 AI 普及。Soup 的選擇是——把一切自動化，讓「微調一個模型」退化成一個普通開發者也能執行的日常操作。

## 核心設計哲學

### 1. 「每個效能數字都是測出來的，不是宣稱的」

Soup 最醒目的一條原則。它的所有效能聲明都有對應的**測量記錄（gate records）**，存放在 `benchmarks/` 目錄，並且**按原樣發布**——包括失敗、被推翻的假設、測完又丟棄的數字。benchmarks/README 裡寫得很直白：

> 「這些不是事後整理的報告。它們是構建和驗證每項功能時保留的工作記錄，所以它們包含失敗、後來被證明是錯誤的假設、以及測完又被丟棄的數字——按事情發生的順序。」

這條哲學直接決定了專案的可信度結構：**沒有測量就沒有聲明。**

### 2. 「Bit-exact 永遠是兩個聲明，不是一個」

在驗證流式訓練的正確性時，Soup 堅持把**前向**（logits，`torch.equal`）和**後向**（每一個 LoRA 梯度張量）分開測量、分開聲明。原因很實際：在 H100 驗證中，前向在 72B 規模下全部位元級精確，而後向在 NF4 每層超過 ~165 MiB 時是**錯的**——前向看起來正常、loss 曲線也健康，梯度卻悄悄錯了。如果只聲明「bit-exact at 72B」，就會掩蓋掉一半的事實。所以它的記錄檔案會為每一行標註：哪個方向、哪種量化、每層多少 MiB，沒測的寫 "not tested" 而不是留空。

### 3. 拒絕而非警告（Refuse, don't warn）

訓練前的顯示記憶體預檢（pre-flight）如果預測設定放不下，Soup 會**直接拒絕執行**，而不是警告。這是從 Windows 的殘酷教訓裡學來的：在 Linux 上，超預算的 step 是硬 OOM；在 Windows 上，WDDM 會**靜默地把顯示記憶體溢位到宿主記憶體**，執行只是慢了一個數量級——實測在 4.29 GB 的卡上跑出 9.27 GB 峰值，**一個例外都不拋**。如果這是「警告」，使用者讀到的會是「流式訓練很慢」——恰好是錯的結論。

### 4. 把代價印出來，而不是默默吸收

當 3B bf16 基座無法頁鎖定（page-lock）時，Soup 自動回退到 pageable 儲存——但**會明確印出這次回退的代價**（GPU 使用率從 96.8% 掉到 79.3%），而不是靜默吞掉。同理，它偵測到 Windows 忽略 `expandable_segments:True` 時也不會假裝這個最佳化在生效。

### 5. 撤回文化：承認發布過的解釋是錯的

論文 v3 版本**撤回了一個自己曾發布的解釋**——「layer streaming 的瓶頸是 host-to-device 傳輸而不是 GPU」。這個說法只是從 H100 複現中做的**推斷**，從未被測量過。2026 年 8 月 11 日實測後證明它在發布的設定下是假的：刪掉所有 host-to-device 位元組只換來 **1.4%**，計算流只有 **0.20%** 的時間在等複製，step 跑到了該卡同會話 GEMM 天花板的 **71.3%**。v1/v2 保持原樣可引用、不被修改——**撤回的方式就是發布新版本**，讓「當時聲稱了什麼、什麼時候聲稱的」完整留檔。

### 6. 設定模式是唯一的真相來源

`config/schema.py`（Pydantic v2，約 256KB）是每一個設定欄位的單一真相來源。CLI、預檢、訓練器都從它派生。配合「重依賴全部惰性匯入」（torch/transformers/peft/trl 絕不出現在模組頂層 import），讓 `pip install soup-cli` 的輕量核心（不含 PyTorch）保持可用的同時，訓練棧按需載入。

## 技術架構深度解析

### 原始碼布局

```
src/soup_cli/
├── cli.py               # 主 CLI 入口（Typer，約 26KB）
├── config/schema.py     # Pydantic v2 設定模式（單一真相來源）
├── commands/            # 各子命令實作（adapters/train/eval/data/ship/...）
├── trainer/             # 訓練器封裝（SFT/DPO/GRPO/PPO/KTO/ORPO/SimPO/...）
├── data/                # 資料格式解析、載入器、collator、驗證
├── eval/                # 評估、soup ship 門禁、校準、Elo arena
├── recipes/catalog.py   # 100+ 模型配方（約 89KB）
├── registry/            # 模型註冊表、雜湊、儲存
├── cans/                # "Soup Cans"：可重現實驗打包/執行
├── autopilot/           # 零設定自動微調
├── mcp_server/          # MCP 伺服器
├── monitoring/          # 訓練回呼、進度顯示、HF 推送
├── plugins/             # 外掛系統
├── migrate/             # axolotl / llamafactory / unsloth 遷移
└── cloud/               # Modal 雲 GPU 訓練
```

### Layer Streaming 的核心機制

這是 Soup 的靈魂。原理可以拆成四層：

**第一層：什麼留在顯示記憶體，什麼流出去了。** LoRA 適配器 + 它們的梯度 + 最佳化器狀態留在顯示記憶體（它們很小）。**凍結的基座模型放在 CPU 記憶體**（條件允許時頁鎖定），逐層流式餵給 GPU：每個 decoder 層被複製進**兩個預分配的顯示記憶體緩衝區**之一（雙緩衝），在專用 CUDA 流上載入，與上一層仍在進行的計算**重疊**。

**第二層：為什麼流式要花時間。** 每一層每個 step 要被讀**兩次**——前向一次，後向重計算一次，因為 `dL/dx = Wᵀ · dL/dy` 需要權重傳給下面的層。「這是物理定律，不是實作細節。」實測代價：比常駐訓練慢 **1.43×**（在 0.5B 上測得的唯一公平對比，因為 1.5B 以上在這台參考機上根本無法常駐）。

**第三層：NF4 量化解決了什麼。** 把流式基座量化成 NF4，RAM 儲存縮小約 4 倍——8B 基座從 ~16GB bf16 變成 ~3.6GB NF4。這有兩個好處：(1) 更大的模型放得進宿主記憶體；(2) **儲存能放進機器的頁鎖定記憶體上限**（參考機約 7.1GB）——頁鎖定正是 `copy_(non_blocking=True)` 能真正與計算重疊的前提。3B bf16 因 5.55GB 放不進頁鎖定而回退 pageable，使用率從 100% 掉到 79.3%；NF4 後 1.43GB 可以釘住，使用率回到 100%。基座只量化一次（離線、逐張量、快取），分片快取以量化方式/dtype/量化裝置/檢查點指紋為鍵，切換 `none`⇄`4bit` 會重新分片而不是悄悄流式錯誤的位元組。

**第四層：正確性不是交易籌碼。** 流式 NF4 執行與**常駐 NF4** 執行位元級精確（同樣的量化位元組、同樣的 bitsandbytes 核心），並且這是**回歸測試**，不是一次性測量。

### 顯示記憶體預檢與「拒絕」

流式只約束**權重**，對啟用值和 logits 張量無能為力——它們都隨 `batch × seq` 增長。在大詞表模型上第二項壓倒一切：Qwen2.5-0.5B（詞表 151,936）在 batch 8、S=512 時，光 logits 就是 **8.71 GB——是整個層緩衝區池（0.060 GB）的 146 倍**。所以 `soup train` 在建構模型前先預測峰值顯示記憶體，預測不準就**拒絕執行**：

```
peak VRAM    ~0.48 GB at batch 2 x seq 256 (logits 0.35 GB)
free VRAM    3.46 GB
forecast     5685-8361 tok/s — a compute-bound bound, not a promise
```

預檢器在十次真實執行、兩個模型、3.1 倍詞表差異、batch 1–8、兩種序列長度上擬合：**最壞誤差 0.85%，而且從不低估**——對於一個被允許叫停執行的數字，這是唯一安全的方向。拒絕時它會點名真正影響規模的兩個旋鈕（`training.batch_size`、`data.max_length`）。

### batch size vs 梯度累積

兩者都支援，但**不可互換**。實測（Qwen2.5-0.5B bf16，S=256，pinned store，50 step）：

| batch | accum | 有效 batch | 吞吐 | 峰值顯示記憶體 |
|---|---|---|---|---|
| 1 | 1 | 1 | 556.6 tok/s | 0.842 GB |
| 1 | 4 | 4 | 540.1 tok/s | 0.846 GB |
| 4 | 1 | 4 | **1378.0 tok/s** | 2.28 GB |

累積在**每 token 的 I/O 上是中性的**（layer 讀取次數不變），它買的是**恆定顯示記憶體下的有效 batch**（0.842→0.846 GB）。而同等有效 batch 下直接加大 batch_size 快 **2.52×**。所以規則是：**先把 batch_size 加到預檢拒絕為止，剩下的用累積補齊**——Soup 看到你在累積時會印出這條建議。

### 設定層的顯式拒絕清單

流式模式下有一長串設定組合在**設定載入時就被拒絕**，每條都點名由哪個版本解禁：

- `grpo`/`ppo` 被**永久拒絕**：生成 rollout 每生成一個 token 就重讀一次每一層，會摧毀流式依賴的攤銷
- `kto` + `batch_size: 1`：TRL 的 KL 項在 batch 1 下退化
- `lora.use_dora`/`use_vera`/非 random 初始化：這些需要真實基座權重，而基座在流式下位於 meta device
- `packing`/`multipack`/`unfrozen_parameters`/`lisa_enabled`/`use_fsdp2_compile` 等：各自會重寫或重新凍結同一批層
- 未設定 `stream_layers` 卻配了 `stream_source`/`stream_buffers` 等：腳槍，拒絕

### 偏好損失的流式：參考模型零成本

v0.72.4 把流式擴充到 DPO/ORPO/SimPO/KTO。風險只有一個：DPO 需要參考模型，第二份複製會讓記憶體翻倍、失去意義。Soup 的做法是**用同一個流式基座、關掉它的適配器**當參考模型——實測峰值只有 SFT 的 **0.914×**，而強制真實第二實例要多花 **+730 MB，正好一份權重的複製**。四種損失全部與常駐執行位元級精確。誠實的代價：記憶體在時間上是免費的、記憶體不免費——DPO 每個 step 讀層棧 **1.52×** 次。

### 預 Ampere 卡的 fp16 修復

直到 v0.72.3，流式儲存在**所有** CUDA 裝置上硬編碼 bf16——整個免費 notebook 層（T4/P100/V100/GTX16xx/RTX20xx）都在流式一種它們 GPU 沒有計算單元的 dtype，而且沒人吭聲（在 Ampere 上測的每個數字都正常，所以測不出來）。修復的關鍵細節：`torch.cuda.is_bf16_supported(including_emulation=False)` 的 `including_emulation=False` 是**承重關鍵字**——裸呼叫預設包含軟體模擬，T4 會回答 True，第一版「修復」因此在它要修的那批硬體上是個空操作。最終是在真實 T4 上跑 proof notebook 才發現的，不是靠推理。

## 效能數據

### 流式訓練實測（RTX 3050 Laptop 4GB，Windows 11，LoRA，batch 1，50 step）

| 模型 | 量化 | Seq | 吞吐 | GPU 使用率 | 峰值顯示記憶體 | RAM 儲存 |
|---|---|---|---|---|---|---|
| **Llama-3.1-8B-Instruct** | **NF4** | 512 | **119.6 tok/s** | 100% | **3.32 GB** | 3.60 GB pinned |
| Qwen2.5-3B | NF4 | 512 | 264.2 tok/s | 100% | 1.76 GB | 1.43 GB pinned |
| Qwen2.5-3B | bf16 | 512 | 143.1 tok/s | 79.3% | 2.15 GB | 5.55 GB pageable |
| Qwen2.5-1.5B | bf16 | 512 | 525.0 tok/s | 96.8% | 1.82 GB | pinned |
| Qwen2.5-1.5B | bf16 | 1024 | 487.6 tok/s | 96.7% | 2.96 GB | pinned |
| Qwen2.5-0.5B | bf16 | 512 | 978.6 tok/s | 91.4% | 1.47 GB | pinned |

**頭條：8B 模型在 4GB 卡上以 119.6 tok/s、3.32GB 峰值完成微調。** 按此速率換算，1M 訓練 token 約 2.3 小時（除法算術，不是單獨測量）。

### 瓶頸探針（v0.73.0，H100 同會話）

- 流式 step 跑到該卡**同會話 GEMM 天花板**的 71.3%
- 刪掉所有 host-to-device 位元組只買 **1.4%**；計算流等複製只佔 step 的 **0.20%**
- 最大的流式專屬成本是**逐層 NF4 反量化**，佔 9.8%
- Cut Cross-Entropy（CCE）把可用 microbatch 翻三倍，代價 +9.6%

### DeepSpeed 對比（H100，8 卡）

- 流式比 DeepSpeed ZeRO-3 offload 快 **2.93×**，顯示記憶體少用 **9.7×**
- 一個不給自己貼金的結果：**8 卡 ZeRO-3 比 1 卡常駐訓練還慢**——也照實發布了

## 功能全景

### 訓練任務與方法

SFT、DPO/GRPO/PPO/KTO/ORPO/SimPO/IPO/BCO、tool-calling、PRM、預訓練、蒸餾、分類、vision/audio/TTS、unlearning、RAFT/RA-DIT——`task:` 一個欄位切換。LoRA/DoRA/LoRA+/rsLoRA/VeRA/OLoRA/NEFTune/PiSSA/ReLoRA/LLaMA Pro/GaLore/YaRN/LongLoRA 等 PEFT 全家桶都在 `docs/peft-and-efficiency.md`。

### 資料工程

Alpaca、ShareGPT、ChatML、偏好對（DPO/ORPO/SimPO/IPO/KTO）、vision、audio、ASR、純文字、embedding、RAFT——從 JSONL/JSON/CSV/Parquet/TXT **自動偵測**格式，多數情況下 `data.train` 指向檔案就完事。合成資料生成（forge）、品質計分卡、遠端資料集、混合、配方 DAG 都在 `docs/data.md`。

### 服務與匯出

OpenAI 相容伺服器、Anthropic Messages 端點、批次推論、GGUF/ONNX/TensorRT/AWQ/GPTQ/BitNet 匯出、**推測解碼**（訓練並測量你自己的 draft 模型）、部署 autopilot、Web UI、Agent Forge。`soup serve --model ./output` 一條命令起伺服器。

### 治理與合規

適配器生命週期管理、模型註冊表、**Soup Cans**（可重現實驗的打包/執行/發布）、資料飛輪 `soup loop`、知識編輯、steering、供應鏈控制（scan/sign/BOM/attest/audit/airgap）。合規方面有 HIPAA/SOC2/EU-AI-Act/SR-11-7 的 `init` 模板、出處追蹤（BOM/attest/repro-receipt）、稽核日誌、空氣隔離、模型卡自動生成 `soup card`、CI 門禁 `soup ci init`。

### 後端與生態

預設 transformers、`[fast]` 的 **Unsloth（2-5× 更快）**、`[mlx]` 的 Apple Silicon 支援、`[modal]` 的雲 GPU 訓練（`soup train --cloud modal`）、`soup mcp serve` MCP 伺服器、`soup autopilot` 零設定自動微調、實驗追蹤（mlflow/swanlab/trackio）、外掛系統。還提供 axolotl / llamafactory / unsloth 的**設定遷移**。

## 發布門禁：soup ship

`soup ship` 回答一個問題：**這個模型變好了，還是被我改壞了？** 兩條腿：

- **Leg 1（任務評估）**：用你自己的資料跑 task eval
- **Leg 2（回歸門禁）**：固定的、基於提取的評分器，跑 7 個內建離線套件（MCQ · 算術 · tool-calling · JSON 有效性 · safety/refusal）——**零新增依賴**

```
soup ship --base ./base --adapter ./my-lora --task-eval my_task.jsonl
#   exit 0 = SHIP · 2 = DON'T SHIP · 3 = bad flags · 1 = runtime error
```

一個贏了你的任務卻悄悄弄壞 tool-calling 的微調，會得到 **DON'T SHIP**。

v0.73.2 的修復暴露了評分器本身的坑：

- **`mini_tool_call` 曾在給「括號衛生」打分**：模型少打一個右括號，解析回退到內部物件，評分器因為沒有外層鍵而拒絕——一個 40/40 全對的模型只拿了 0.225
- **`mini_mmlu` 給 Llama-3.1-8B 打了 0.423——比 0.5B 還低**：提取器不認識 `\boxed{C}`，提示詞也從沒要求輸出字母。修復後 0.423 → 0.731
- **新增良意提示軸**：原來只標記拒絕率的下降，一個拒絕一切的微調會讀起來像「單調的安全改進」——兩個在 7 個套件上位元組級同分的模型（一個拒絕所有良意請求）在門禁面前無法區分。`mini_over_refusal` 是它的鏡像，與安全套件配對後**任何一方都無法單獨被鑽空子**
- **`--noise-floor N`**：把基座模型重跑 N 次，任何小於實測離散度的 delta 都不算顯著。GPU 上的貪心解碼不是確定性的——同一模型、無適配器、五次執行離散 0.015–0.020（閾值 0.05），六對配對 delta 裡有四對落在雜訊層內
- **呼叫者錯誤 vs 回歸**：一個不可呼叫的生成器在三個套件上得 0.0 並在其餘套件拋例外——而 0.0 讀起來像「每一項都失敗」，恰好是看起來像發現的失敗方向

## 詳細入門教學

### 1. 安裝

```bash
# 輕量核心：CLI + 設定 + 資料工具，不含 PyTorch
pip install soup-cli

# 加上訓練棧（torch, transformers, peft, trl, datasets, ...）
pip install "soup-cli[train]"

# 全家桶（train + serve + ui + data）
pip install "soup-cli[all]"

# 或從 GitHub 裝最新開發版
pip install git+https://github.com/MakazhanAlpamys/Soup.git
```

> **必須用雙引號。** `"soup-cli[train]"` 是唯一在 cmd.exe、PowerShell、bash、zsh 全都能用的寫法。如果從舊教學抄了 `'soup-cli[train]'` 被 pip 拒絕，原因就是這個。

`soup init`、`soup data …` 等資料/檢查命令在輕量安裝下就能用；微調（`soup train`）需要 `[train]` extra。

### 2. 初始化設定

```bash
soup init                       # 互動式精靈
soup init --template chat       # 或從模板開始
```

模板：`chat`、`code`、`tool-calling`、`medical`、`reasoning`、`vision`、`kto`、`orpo`、`simpo`、`ipo`、`bco`、`rlhf`、`pretrain`、`moe`、`longcontext`、`embedding`、`audio`。

### 3. 訓練、測試、發布

```bash
soup train --config soup.yaml                 # LoRA、量化、batch —— 全部自動處理
soup chat  --model ./output                    # 和你的模型對話
soup push  --model ./output --repo you/my-model

soup merge  --adapter ./output                              # 把 LoRA 合併進基座
soup export --model ./output --format gguf --quant q4_k_m   # GGUF，給 Ollama / llama.cpp
```

### 4. 一份完整的 soup.yaml

```yaml
base: meta-llama/Llama-3.1-8B-Instruct
task: sft
# backend: unsloth  # 2-5x 更快，pip install "soup-cli[fast]"

data:
  train: ./data/train.jsonl
  format: alpaca
  val_split: 0.1

training:
  epochs: 3
  lr: 2e-5
  batch_size: auto
  lora:
    r: 64
    alpha: 16
  quantization: 4bit

output: ./output
```

`config/schema.py` 是每個欄位的單一真相來源。

### 5. 在 4GB 卡上流式微調 8B 的設定

```yaml
base: meta-llama/Llama-3.1-8B-Instruct
task: sft
backend: transformers

data:
  train: ./data.jsonl
  format: alpaca
  max_length: 512
  val_split: 0.1

training:
  epochs: 3
  lr: 2e-5
  batch_size: 1           # 流式下顯式 batch；"auto" 被拒絕
  quantization: 4bit      # NF4 —— RAM 儲存比 bf16 小約 4 倍
  gradient_checkpointing: true     # 由流式器逐層處理
  stream_layers: true     # 啟用 Layer Streaming
  stream_source: auto     # RAM，放不下自動回退 NVMe 磁碟
  stream_buffers: 2       # 雙緩衝
  lora:
    r: 64
    alpha: 16

output: ./output
```

### 6. 常用命令一覽

```bash
soup train  --config soup.yaml        # 訓練（SFT/DPO/GRPO/PPO/KTO/ORPO/SimPO/...）
soup infer  --model ./output --input prompts.jsonl   # 批次推論
soup chat   --model ./output          # 互動式對話
soup serve  --model ./output          # OpenAI 相容 API 服務
soup merge  --adapter ./output        # LoRA 合併
soup export --model ./output --format gguf           # 匯出部署
soup eval   benchmark --model ./output               # 評估
soup data   inspect ./data/train.jsonl               # 資料集統計
soup recipes list                     # 100+ 現成模型配方
soup autopilot --model <id> --data d.jsonl --goal chat  # 零設定
soup doctor                           # 檢查 GPU / 依賴 / 環境
```

### 7. 常見問題排查

```bash
soup doctor    # GPU、系統資源、依賴、版本，一次查清
```

- **Windows 報 `ImportError: DLL load failed while importing _C`** —— 按你的 CUDA 版本重裝 PyTorch：`pip install torch --index-url https://download.pytorch.org/whl/cu121`
- **`soup version` ≠ `pip show soup-cli`** —— 裝了多個 Python；用 virtualenv

### 8. 用 Docker

不想本機裝 CUDA/PyTorch：

```bash
docker pull ghcr.io/makazhanalpamys/soup:latest
docker run --gpus all -v $(pwd):/workspace ghcr.io/makazhanalpamys/soup train --config soup.yaml
```

## 保真度驗證體系

Soup 的正確性驗證是一整套**出版級協議**：

1. **測量記錄按原樣發布**：`benchmarks/` 裡的每一份 gate record 都包含失敗、被推翻的假設、被丟棄的數字。`gate-v0.73.1` 甚至帶著**工作中撤回的三次讀數**（其中兩次看起來像頭條結果）
2. **正確性參考必須匹配被測數值**：流式 NF4 執行對比的是*常駐 NF4* 執行，絕不對比常駐 bf16——那會把真實缺陷藏進量化誤差
3. **吞吐量帶 SM 時鐘一起引用**：這張卡的 boost 時鐘會話間波動約 13%，不帶時鐘的「天花板佔比」沒有意義；GEMM 天花板在同會話內測量
4. **派生數字標註為算術**：寫 "1M tokens = 2.3h" 就是除法結果，不是牆鐘測量
5. **正確性協議跑在 CI 裡**：位元級精確的回歸在測試套件裡，回歸會紅 CI 而不是到達使用者
6. **H100 獨立驗證**（gate-h100-validation.md）：前向位元級精確到 72B，後向修復後在 32B（256/256）和 72B（320/320）重新過門——72B 正是缺陷最嚴重的規模。記錄裡帶著三處標註日期的修正（2026-08-13），原行保留、修正並列
7. **免費 Colab T4 作為最弱證據**：一次執行、無重複、無正確性對比——「歸檔它是因為它是流式路徑在 pre-Ampere 卡上執行的唯一證據，不是因為它能門禁任何東西」

## 歸納總結：關鍵觀點

1. **硬體門檻是 LLM 微調普及的最大瓶頸，而它可以用工程手段擊穿。** Soup 證明「8B 微調需要 24GB+ 顯示卡」是一個可以被軟體架構推翻的假設——透過把常駐基座換成逐層流式，4GB 筆電成了合格的訓練裝置。這不是魔法，是 1.43× 時間代價換來的空間解放。

2. **在 LLM 工程裡，「bit-exact」必須拆成兩個獨立聲明。** 前向精確不代表後向精確——NF4 每層超 165 MiB 時梯度靜默變錯、loss 曲線卻健康。把「正確」當成一個整體概念，就是給這類靜默缺陷留後門。

3. **測量文化是可信度的基礎設施。** 發布失敗的測量、撤回自己的解釋、公開「8 卡比 1 卡慢」的尷尬結果——這些不是姿態，是讓社群能夠複現和信任的機制。文件裡每一個數字可追溯、可重測。

4. **拒絕比警告安全。** 在會靜默溢出的平台上（Windows WDDM），警告等於誤導。「從不低估」的預檢器和顯示記憶體擬合（最壞誤差 0.85%）把「能不能跑」從執行時事故變成載入期決定。

5. **自動化的邊界是誠實。** Soup 自動偵測 GPU、batch size、量化——但「auto」在流式下被拒絕（它會對一個流式從不載入的常駐模型做 OOM 探測），不可用的功能點名「由哪個版本解禁」，grpo/ppo 被永久拒絕並說明原因。自動化不意味著無條件信任設定。

6. **發布門禁要防的是「看起來像改進」的回歸。** 評分器本身會被括號衛生、`\boxed{C}`、拒絕一切的安全模型騙過——門禁的敵人不是差模型，是**無法與差模型區分的評分器**。雜訊地板（noise-floor）承認 GPU 貪心解碼本身有 0.015–0.020 的離散。

7. **在硬體受限的地方，誠實比雄心更有效。** 作者明確說專案在 4GB 筆電上維護、多 GPU 和 Apple Silicon 驗證被硬體卡住，於是用 "requires \<hardware\>" 門禁 + help-wanted 問題把驗證任務交給有硬體的人。受限不是藉口，而是路線圖的排序器。

## 適用場景分析

| 場景 | 適配度 | 說明 |
|---|---|---|
| 學生/個人開發者 | ★★★★★ | 4GB 筆電 + 免費 Colab T4 就能流式微調 8B；零 SSH 零設定地獄 |
| 垂直領域快速微調 | ★★★★★ | 一條命令 SFT + 100+ 配方模板（醫療/程式碼/tool-calling/法律合規） |
| 偏好對齊實驗 | ★★★★☆ | DPO/ORPO/SimPO/KTO/IPO/BCO 全覆蓋，流式參考模型零成本 |
| 企業合規微調 | ★★★★☆ | HIPAA/SOC2/EU-AI-Act 模板、BOM/attest/稽核日誌/空氣隔離 |
| 生產部署鏈路 | ★★★★☆ | 服務/匯出/推測解碼/註冊表/Cans 打包，CI 門禁 |
| 多卡分散式訓練 | ★★☆☆☆ | 支援 DeepSpeed/FSDP，但作者明說多 GPU 驗證是硬體受限項 |
| 從零預訓練 | ★★☆☆☆ | 支援但非主線；流式只覆蓋 SFT + 四種偏好損失 |

## 結語

Soup 是一個罕見的「小硬體、大想法」專案：它的宣傳語是「一條命令微調 LLM」，但真正驅動它的是一整套關於**可信度**的設計哲學——測量文化、位元級精確的雙聲明協議、拒絕而非警告、撤回文化的論文管理。Layer Streaming 本身是一筆漂亮的工程帳：把 8B 模型的訓練從 24GB 顯示卡的專屬特權，變成 4GB 筆電的日常操作，代價只有 1.43× 的時間，而且正確性用回歸測試釘死。

對普通開發者來說，Soup 最大的價值可能是：**它把「微調一個模型」從需要一整天折騰基礎設施的黑盒，變成了三條命令**。對工程實踐者來說，它的 benchmarks/ 目錄和論文撤回記錄，本身就是一份關於「如何讓 AI 專案值得信任」的範本。

## 參考資源

- [Soup 倉庫](https://github.com/MakazhanAlpamys/Soup)
- [官方網站 trysoup.dev](https://trysoup.dev)
- [PyPI: soup-cli](https://pypi.org/project/soup-cli/)
- [論文：Exact Layer Streaming（Zenodo v3）](https://doi.org/10.5281/zenodo.21918325)
- [測量記錄 benchmarks/](https://github.com/MakazhanAlpamys/Soup/tree/main/benchmarks)
- [4GB 驗證 Notebook（免費 Colab T4）](https://github.com/MakazhanAlpamys/Soup/blob/main/notebooks/proof-4gb.ipynb)
- [Layer Streaming 示範影片（90s）](https://youtu.be/T1LCErE943E)
- [Soup Discord](https://discord.gg/8RgVbFA6Zq)