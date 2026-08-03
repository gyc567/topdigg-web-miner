---
title: "Kimi K3 × AMD MI355X 深度解析：記憶體是護城河嗎？"
description: "全面分析 Wafer AI 在 AMD MI355X 上以 952 tok/s/節點 服務 2.8T 開源模型 Kimi K3 的第一手工程紀錄。從「記憶體是護城河」的核心論點出發，到投機解碼與 AITER Prefill 優化、再到 MI355X 以 48 tok/s/$ 全面碾壓 B200 的效能價格比，一文講透為什麼記憶體容量在 2.8T 模型體量上首次轉化為對 NVIDIA 的可量化優勢，以及 CUDA 護城河是否真的走到了盡頭。"
date: "2026-08-03"
author: "TopDigg Research Team"
tags: ["Kimi K3", "AMD", "MI355X", "Moonshot", "月之暗面", "GPU 推論", "MoE", "投機解碼", "ROCm", "Wafer AI", "開源大模型", "效能價格比"]
categories: ["深度解析"]
keywords: ["Kimi K3", "MI355X", "AMD", "月之暗面", "Wafer AI", "記憶體是護城河", "效能價格比", "投機解碼", "AITER Prefill", "ROCm", "B200", "B300", "開源大模型", "GPU 推論", "MoE"]
---

# Kimi K3 × AMD MI355X 深度解析：記憶體是護城河嗎？

> 核心理念：**記憶體是護城河。** 當開源模型一路膨脹——從 GLM-5.2 的 753B、DeepSeek V4-Pro 的 1.6T，一路漲到 Kimi K3 的 2.8T 參數——推論的臨界瓶頸不再是算力，而是誰能把「模型權重 + KV 快取」塞進記憶體。AMD MI355X 以 288GB 的 HBM 容量和約 2.4 倍便宜於 B300 的價格，第一次在一個 2.8T 模型上，把對 NVIDIA 的優勢變成了**可測、可用、可量化**的現實。

---

## 一、專案說明

### 1.1 這是一篇什麼文章？

這是 Wafer AI（YC S25 出身的 AI 推論優化公司）發布的技術部落格《Is memory the moat?》（記憶體是護城河嗎？），作者 Ian Ye，發布於 2026 年 7 月 31 日。文章記錄了團隊如何在 **8 張 AMD MI355X 上以 952 token/s/節點 的吞吐**服務開源模型 **Kimi K3（2.8T 參數）**，並把它與 NVIDIA B200、B300 做了一組硬核的吞吐與成本對比。

這不僅僅是一篇「跑通了模型」的證明文，更是三股力量的交會：

1. **月之暗面（Moonshot AI）**——發布了一個體量大到超乎尋常的開源模型；
2. **AMD**——證明了在繞開 CUDA 生態的前提下，ROCm 已經能把前沿模型服務到生產級；
3. **Wafer AI**——用自研的 agent 優化能力，把 MI355X 的效能價格比榨到了極致。

### 1.2 三個主角：模型、顯示卡、平台

**主角一：Kimi K3（2.8T 參數的稀疏 MoE 開源模型）**

Kimi K3 是月之暗面發布的稀疏混合專家（MoE）模型：總參數 2.8 兆，但每個 token 只啟動約 1040 億參數。它宣稱開源模型的**新紀元開局**——不只因為能力接近頂尖閉源模型，更因為它把「開源模型可以多大」的天花板拉到了 3T 級。

- 總參數：**2.8T**
- 啟動參數：**約 104B（1040 億）每個 token**
- 上下文長度：**1M token**（1,048,576）
- 架構：MoE + 長上下文注意力優化
- 開源形式：完整權重公開

**主角二：AMD MI355X（288GB 記憶體的 CDNA 卡）**

MI355X 是 AMD Instinct 系列加速卡，基於 CDNA 4 架構（GFX 9），單卡 **288GB HBM3**、約 **8 TB/s** 記憶體頻寬。對「記憶體不夠」的超大模型而言，它的容量是最核心的賣點。

- 記憶體：**288GB HBM3**
- 發布：2025 年 6 月
- 定位：NVIDIA Blackwell（B200/B300）的**非獨家替代**

**主角三：Wafer AI（推論優化新創公司）**

Wafer AI 是 Y Combinator S25 批次新創公司，主打「用 AI agent 自動優化 GPU 推論 kernel」的 serverless 推論服務。他們對 Qwen、GLM、DeepSeek、Kimi 等開源模型提供 OpenAI 相容的推論 API，哲學是「最大化每一瓦特的智慧」（Maximize intelligence per watt）。這篇文章就是它的證明性部落格。

### 1.3 為什麼這篇文章值得關注

在一個被 CUDA/NVIDIA 壟斷了十多年的領域裡，一次「中國開源 2.8T 模型 + AMD 顯示卡 + 推論優化新創公司」的組合，構成了對「CUDA 護城河不可撼動」這一共識最尖銳的一次挑戰。更難得的是，這篇部落格**不是空洞的行銷論調，而是有數字、有底層、有修復程式碼的第一手工程紀錄**。

---

## 二、核心思想：記憶體是護城河

### 2.1 被忽視的變數：模型正在變得更「胖」

文章開頭就點出一個正在發生的趨勢：**模型的能力在漲，但體量漲得更快。**

- GLM-5.2 擁有 **753B**（0.75T）參數；
- DeepSeek V4-Pro 達到 **1.6T** 參數；
- Kimi K3 直接來到 **2.8T** 參數。

參數越大，部署越貴、越難。而要服務 Kimi K3，你需要超過 **1.5TB 的記憶體**——這還沒算上 1M token 上下文的 KV 快取。

### 2.2 服務 Kimi K3 的幾條路

要讓 Kimi K3 跑在資料中心裡，部署者只有三個現實選擇：

- **一台 8 卡 B300 節點**：每卡 288GB，裝得下，但價格極高；
- **兩台 8 卡（共 16 卡）B200 節點**：拆成 TP16，但要多扛一層跨節點通訊；
- **一台 8 卡 MI355X 節點**：也是每卡 288GB，裝得下且便宜得多。

請注意：除了 B300，**唯一一個非 NVIDIA、且同樣有 288GB 記憶體的，就是 AMD MI355X**。這正是文章標題的點題之處——**當一個模型大到「必須跨節點」時，記憶體容量本身就成為了壁壘。**

在這條邏輯下，MI355X 不是「效能王」，而是「**承載能力王**」。

### 2.3 MI355X 對 B200 的「容量碾壓」

- 單台 **8×MI355X** 提供約 **2.3TB** 記憶體，可在 TP8 下單節點容納 Kimi K3（權重 + 1M token KV 快取）；
- 單台 **8×B200** 只有約 **1.5TB**，裝不下，被迫擴到 **TP16 雙節點**。

這個「放不下的局部」引出了 B200 的硬傷：**跨節點通訊開銷**。B200 需要在 decode 關鍵路徑上做跨節點 all-reduce（RoCE v2 約 195 Gb/s），而 MI355X 單節點就能搞定。

> Wafer 的措辭很犀利：「這（跨節點）是 B200 唯一的配置硬傷——但**這恰恰正是重點**：MI355X 的記憶體容量優勢，在 Kimi K3 這個體量上，第一次轉化為可測量、可落地的實際收益。」

### 2.4 數據說話：MI355X vs B200 vs B300

在 1,024 token 輸入 / 400 token 輸出的基準下，按「每節點」測得的對比（價格按公開 GPU 市場計價）如下：

- **單流解碼吞吐**：MI355X **118 tok/s**，B200 90 tok/s，B300 172 tok/s
- **峰值聚合吞吐 / 節點**：MI355X **952 tok/s**，B200 約 249 tok/s（16 卡總值 498 分攤到 2 節點），B300 1,568 tok/s
- **峰值聚合吞吐 / 單 GPU**：MI355X **119 tok/s**，B200 31 tok/s，B300 196 tok/s
- **峰值 / 每 $/GPU-hr（效能價格比）**：MI355X **48 tok/s/$**，B200 7 tok/s/$，B300 33 tok/s/$

> **結論：** 論「聚合吞吐」，B300 依然領先 MI355X 約 1.65 倍；但論「每一美元買到的吞吐」，MI355X（48）把 B300（33）甩開約 1.45 倍，把 B200（7）甩開約 **7 倍**。效能價格比之王是毫無疑問的 MI355X。

參考公開價格：MI355X 約 **$2.50/GPU-hr**，B300 約 **$6.00**，B200 約 **$4.25**。

---

## 三、技術架構與實戰：如何把 Kimi K3 跑在 MI355X 上

### 3.1 好消息：Day-0 支援的開局

Wafer 提到一個被很多人忽略的前提：Kimi K3 在 AMD 上是 **Day-0 支援**——權重發布當天就能在 ROCm 上跑。這背後是 AMD 與月之暗面早已建立的深度合作（在 Kimi 2.6 時代就共同設計了 UMBP、KV 快取調度、AITER 長上下文加速等元件）。所以 Wafer 要做的工作不是「能不能跑通」，而是「如何把吞吐榨乾」。

### 3.2 投機解碼（Speculative Decoding）

- Kimi K3 出廠**不帶任何草稿張量**（無 MTP、無 EAGLE）；
- 唯一可行路徑是**外部投機解碼草稿**：RadixArk 的 **Kimi-K3-DSpark**；
- 在 CUDA 上開箱即用，但在 ROCm 上遇到第一個 bug：

```text
NameError: name 'top_k_renorm_prob' is not defined.
```

### 3.3 修 Bug：不是缺 kernel，而是缺定義

這是全篇最精彩的工程復盤。Wafer 的排查過程：

- sglang 的 accept-sampling 驗證器有兩條構建目標分布的方式：
  - **dense 路徑**：呼叫 `top_k_renorm_prob`；
  - **sparse 快速路徑**：直接走 `torch.topk`。
- CUDA 版從 `sgl_kernel` 匯入 `top_k_renorm_prob`；但 **ROCm 版只給 top-p kernel 起了別名，把 `top_k_renorm_prob` 留成了未定義**——因為 gfx950 上沒有可別名的 top-k renorm kernel。
- 於是，一旦請求落到 dense 路徑，驗證器就拋出 `NameError`，連帶整個 scheduler 一起崩。

**修復**：top-k renorm 只是個很小的算子——把模型機率向量裡最高的 k 個保留、其餘清零、再重新縮放到總和為 1。一個 `sort`、一個 `masked_fill`、一個除法就夠。Wafer 只把它補進 sglang 的 ROCm 採樣分支即可，完全不需要寫自訂 kernel。

> 關鍵經驗：**在 ROCm 上遇到報錯，第一反應往往是以為缺 kernel，但很多時候只是「缺一個定義」。** 這次就是一個未定義的函式名——問題不是「沒 kernel」，而是「某處沒被匯出」。

**優化收益**：修復並加固投機解碼後：

- 單流吞吐提升 **約 2.2 倍**；
- 中負載下每流提升 **約 1.7 倍**；
- 峰值聚合吞吐 **+18%**；
- 更重要的是，峰值聚合吞吐落在了**更高的並發度**（c64 而非無投機時的 c24），更貼近真實生產。

### 3.4 Prefill 優化：decode tok/s 是「傻瓜的金礦」

這是文章最有見解的一句話：**decode tok/s 常常是「傻瓜的金礦」（fool's gold）——被過度神化，而用戶真正等待的到首 token 時間（TTFT）卻被低估了。**

**前置數據**：同樣的 172k token 冷啟動 prefill，在 MI355X 上要 **約 51 秒**，在 B300 上只要 **約 23 秒**。對大上下文模型來說，prefill 往往是巨大且可能冷啟動的，兩三分鐘的 prefill 會讓整片節點空轉。

**根源只在一個 kernel**：Kimi K3 在 ROCm 上回退到了慢速的通用 Triton attention，因為**快速的 AITER MLA prefill kernel 沒有載入成功**。原因是**形狀不匹配**，而不是缺 kernel：

- K3 在 TP8 下每個 rank 上有 **12 個注意力頭**；
- AITER 的 MLA 路徑只支援 4、8 或 16 的倍數。

**修復**：把注意力頭數從 **12 零填充到 16**，用快速 kernel 運算，再從輸出裡取出真正的 12 個頭即可。

**效果**：同一個 172k 冷 prefill，AITER MLA prefill 穩定跑到 **約 13k tok/s**（Triton 回退僅約 4–7k tok/s），prefill 提速 **約 2–3 倍**。它不會改變聚合吞吐（decode 不變），但它直接改變**用戶等第一個 token 的時間**。

---

## 四、詳細教學：在 AMD MI355X 上部署並優化 Kimi K3

下面把 Wafer 的做法整理成可複製的步驟（環境：8×MI355X、TP8、ROCm、sglang）。

### 4.1 第一步：準備環境

```bash
# 安裝 ROCm 與 sglang
pip install --upgrade sglang[rocm]

# 拉取 Kimi K3 權重
huggingface-cli download MoonshotAI/Kimi-K3 --local-dir ./backend
```

確認 ROCm 版本與顯示卡識別正確（CDNA 4 / gfx950）。

### 4.2 第二步：啟動服務（TP8）

```bash
python3 -m sglang.launch_server \
  --model-path ./backend \
  --served-model-name kimi-k3 \
  --tensor-parallel-size 8 \
  --max-model-len 1000000 \
  --reasoning-parser kimi-k3
```

### 4.3 第三步：開啟投機解碼

```bash
# Kimi K3 需要外部草稿模型，所以加入：
  --speculative-algorithm block \
  --draft-model RadixArk/Kimi-K3-DSpark
```

（前提：先修好 3.3 提到的 `top_k_renorm_prob` 定義。）

### 4.4 第四步：驗證與壓測

```bash
# 用 curl 測 TTFT 和生成速度
curl -X POST http://localhost:8119/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{"model":"kimi-k3","messages":[{"role":"user","content":"用一句話介紹 MoE 架構"}],"max_tokens":200}'
```

觀察首 token 時間與總 tok/s，確認命中 AITER 快速 prefill（否則調整 12→16 頭填充）。

---

## 五、基準表現：數字說話

### 5.1 Wafer 實測：MI355X vs B200 vs B300（服務 Kimi K3）

完整數據見 2.4。這裡提煉**一句話結論**：

- **效能價格比**：MI355X **48 tok/s/$**，是 B200（7）的約 **7 倍**，是 B300（33）的約 **1.45 倍**；
- **聚合吞吐**：B300（1,568）仍是第一，但 MI355X（952）足以覆蓋絕大多數生產場景；
- **單流體驗**：MI355X 118 tok/s（比 B200 好約 31%），在 B300 的 172 tok/s 之下。

### 5.2 關鍵洞察：為什麼記憶體容量在這裡變成了「勝負手」

- B200 為了塞下 Kimi K3 被迫 **TP16 雙節點**，decode 關鍵路徑背著跨節點 all-reduce，效能被拖累；
- MI355X 單節點 **TP8** 就裝下「權重 + 1M 上下文 KV」，沒有跨節點代價；
- 於是：**容量優勢（288GB）直接換算成了可比、可測的效能與成本優勢。**

---

## 六、設計哲學：為什麼「記憶體是護城河」成為 2026 真命題

### 6.1 模型體量軍備競賽，反向利好「大記憶體」

Kimi K3 的 2.8T，是「越大越強、越強越大」的**軍備競賽**。模型越大，越是只有大記憶體卡能承載，而這恰恰是 AMD 切入的絕佳位置——**把「能否承載 + 每 token 成本」作為戰場，而不是盲目比拼峰值算力。**

### 6.2 AMD：不逐效能，而逐「容量 + 成本」

AMD 在軟體生態上常年落後於 CUDA，但這次它換了個打法：

- **不拼單卡算力**，而是提供 **288GB 大記憶體 + 2.4 倍便宜**；
- **全力投入 ROCm，並做 Day-0 支援**——讓熟悉的模型第一天就能用上；
- 用「容量 × 成本」重新定義「有沒有資格服務前沿模型」。

### 6.3 出口管制反向利好 AMD

有一個大背景呼之欲出：**NVIDIA 高階晶片對中國出口受限**（H100/B200 等高階產品被「預設拒絕」）。這讓中國 AI 團隊不得不找替代路徑：

- **AMD** 成為「性價比合法」的替代選項——它價格低、遊說壓力小、且未落在最嚴厲的禁售檔位；
- 於是「**中國大模型 + AMD 卡 + 成本敏感新創公司**」形成**正循環**：模型越大越需要大記憶體 → AMD 便宜大容量正好 → 越多團隊用 AMD → 越多廠商投入 ROCm 優化 → 軟體差距被更快填平。

### 6.4 Wafer 的終極觀點：agent 優化正在終結「CUDA 壟斷」

- Wafer 的信念：與其等 CUDA kernel 白送，不如**用 AI agent 自動優化 kernel**；
- 在這篇文章的結論裡它給出一個強烈論斷：**「AMD 上的 SOTA 迫在眉睫」（SOTA on AMD is imminent）**；
- 結尾以一個拷問收束：**「Is the CUDA moat dead?」（CUDA 護城河死了嗎？）**

---

## 七、歸納總結：觀點與結論

### 7.1 核心觀點

1. **記憶體容量是下一代模型的硬門檻**。當模型大到單節點裝不下，誰能同時塞下「權重 + KV 快取」，誰就贏在部署起跑線。
2. **用「效能每美元」選硬體**。MI355X 的 48 tok/s/$ 是 B200 的 7 倍、B300 的 1.45 倍，「效能價格比之王」當之無愧。
3. **AMD 的軟體差距正在被（尤其被 agent）快速填平**。Wafer 用兩個「缺定義 / 形狀」小 bug 就恢復了生產級效能，全程無自訂 kernel。
4. **TTFT 才是用戶感知的體驗**。decode tok/s 被神化，首 token 時間才是真；所以優化 prefill（12→16 頭、AITER）不是炫技，而是直接省用戶等待。

### 7.2 對開發者的啟示

- 部署前先問：**這張卡記憶體夠不夠裝下「權重 + 上下文」？** 這比一味追求「GPU 張數 / 算力」更重要。
- 別被 decode tok/s 沖昏頭——**先看你的首 token 延遲**。
- 遇到 ROCm 報錯先冷靜排查：**很多是「未定義、形狀不匹配」而非「缺 kernel」**，改一行就好（`top_k_renorm_prob`、12→16 頭都是活例子）。

### 7.3 結語

最後回到標題那個問題：**CUDA 護城河死了嗎？**

如果「護城河」指的是峰值效能分數，顯然還沒有。但如果你把它定義為「**用錢能買到多少智慧**」——那這篇文章給了一個不能再直白的答案：**記憶體，已經成為新的護城河；而 AMD + 中國開源模型的組合，正在掘開這條溝。**

未來值得看的信號：當開源模型體量持續衝高、當 AMD 的 Day-0 支援越來越普遍、當推論框架對 ROCm 的優化越來越深——**「是否還非用 N 卡不可」的答案，正在從「當然」變成「不一定」。**

---

## 參考資料

- Wafer AI 部落格《Is memory the moat?》：https://www.wafer.ai/blog/kimi-k3-mi355x
- Kimi K3 官方發布：https://www.kimi.com/blog/kimi-k3
- AMD MI355X 官方頁：https://www.amd.com/en/products/accelerators/instinct/mi350/mi355x.html
- AMD 官方 Kimi K3 Day-0 技術文章：https://www.amd.com/en/developer/resources/technical-articles/2026/kimi-k3-on-amd-instinct-gpus.html
- DeepLearning.AI《The Batch》解析：https://www.deeplearning.ai/the-batch/kimi-k3-reveals-how-a-giant-frontier-ai-model-works
- VentureBeat 報導：https://venturebeat.com/technology/chinas-moonshot-ai-releases-kimi-k3-the-largest-open-source-model-ever-rivaling-top-u-s-systems
- vLLM K3 支援：https://vllm.ai/blog/2026-07-27-k3
