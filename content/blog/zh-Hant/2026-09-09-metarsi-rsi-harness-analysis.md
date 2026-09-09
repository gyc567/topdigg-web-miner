---
title: 'MetaRSI/RSI-Harness 深度解析：一個能自己造工具的 AI 工具'
date: "2026-09-09"
description: "深度解析 CosmosMind-ai/RSI-Harness：Meta-Recursive Self-Improving System。Genome 把 AI 的 harness 組態變成可版本化、可分享、可自動生成的目錄；harness-rsi 是一個用自身能力建構出來的、能讀你歷史記錄生成個性化 Genome 的元工具。"
tags:
  - RSI-Harness
  - MetaRSI
  - Genome
  - 遞迴自我改進
  - Pi Coding Agent
  - AI Agent
  - 提示詞工程
  - 開源專案
categories:
  - 深度解析
  - AI工具
  - 開源專案
  - 遞迴自我改進
---

# MetaRSI/RSI-Harness 深度解析：一個能自己造工具的 AI 工具

「調 AI agent 這件事，今天的做法是把組態散落在 settings.json、CLI 參數、貼上的提示詞和'我記得上次那個提示詞挺好用'之間——沒有任何一樣東西是可版本化、可 diff、可復現、可交給別人的。」

這是 RSI-Harness 開發者寫下的開場白。這個專案試圖回答一個根本問題：**如果一個 AI 能修改自己的權重，為什麼不能修改自己的 harness——用和你手動寫它一樣的方式？**

答案就是 RSI-Harness。

---

## 一、專案背景與核心定位

### 名字的含義

**RSI-Harness** = Recursive Self-Improving Harness。名字裡有兩層遞迴：

- **第一層**：用 Pi coding agent 作為底層，在它上面加了一個組態層叫 Genome
- **第二層**：harness-rsi 是 Genome 裡的一個特殊存在，它的輸出是其他 Genome——一個用自身能力建構出來的、能讀你歷史記錄自動生成個人化 harness 的元工具

**MetaRSI** 是論文標題裡的名字，指的是「元遞迴自我改進系統」——不是模型自己改自己的權重，而是 harness 自己改自己的組態，用的正是你平時用來寫 harness 的那些手段。

### 它解決什麼問題

今天調 AI agent 的困境：

| 現況 | 問題 |
|------|------|
| settings.json | 只能改部分欄位，不完整 |
| CLI 參數 | 每次都要敲，不能固化 |
| 提示詞貼上 | 無法版本管理 |
| 「我記得」 | 完全不可復現 |

RSI-Harness 的解法：把 harness 的所有組態收斂到一個目錄裡，叫 **Genome**。切換場景就是切換 Genome。

### 核心架構

```
Pi coding-agent ← 不可變 Core，不 fork
     ↓
Genome adapter ← RSI-Harness 專案本身
     ↓
harness-rsi ← 一個 Genome，輸出是其他 Genome
```

整個 RSI-Harness 只做一件事：**在 Pi 的公開組態表面上，加一層 Genome 組態層**。

---

## 二、核心概念：Genome 是什麼

### 2.1 定義

Genome 是一個完整的、可獨立交付的 harness 組態目錄，包含系統提示詞、工具集、技能、MCP 伺服器、擴充、執行時策略、記憶、快捷鍵、主題——全部在一個目錄裡。

12 個元件，欄位所有權互斥。越界寫入在載入時就失敗。

### 2.2 合併語義：繼承而非替換

Genome 的組態是 **patch，不是 replacement**：

- 欄位缺省 → 繼承 base（最終繼承 Pi 預設值）
- 欄位為 `null` → 刪除該欄位，顯式交還 Pi
- 欄位有值 → 覆寫；物件遞迴合併，陣列整體取代

這意味著一個只宣告 `model` 元件的 Genome，仍然擁有 Pi 的完整系統提示詞、完整工具集。**不需要為了改一個欄位而重寫整個 harness。**

### 2.3 兩個內建 Genome

| Genome | 作用 |
|--------|------|
| `coding`（或 `paperlab`） | 程式碼編寫 harness 的範例組態 |
| `harness-rsi` | 生成其他 Genome 的工具，用 GEE 命令 `gee` 啟動 |

---

## 三、harness-rsi：如何用自身能力建構自身

### 3.1 為什麼它能只是一個 Genome

harness-rsi 需要的每一樣東西，都是 Genome 已有元件提供的：

| 需要什麼 | 用哪個元件 |
|----------|------------|
| 定位與強制流程 | `instructions` 的 `append_system_prompt` |
| 方法論文檔，按需載入 | `skills`，檔案型 Pi skill |
| 讀 session 用的工具 | `tools`（Pi 預設關掉這三個） |
| 三個互動工具 | `integrations.extensions`，Genome 自帶的 `.ts` |
| 草稿與長會話 | `policies` 的 scratchpad 和 compaction |
| 屏蔽無關的全域 skill | `resources.isolate: true` |

**`src/` 裡沒有任何一行**為 harness-rsi 特設的程式碼。它是「Genome 能配一切」這條不變量的證明。

### 3.2 `resources.isolate: true` 的作用

實測：不隔離時用戶 58 個 skill 全部進入 system prompt，prompt 36 KB；隔離後只剩 `genome-authoring` 一個，prompt 7 KB。對一個流程被嚴格規定的 agent 來說，那 57 個無關 skill 既是雜訊也是干擾源。

### 3.3 GEE：Genome Expression Engine

GEE 是 harness-rsi 的前端命令：

```bash
gee  # 等價於 rsih :harness-rsi
```

GEE 的工作方式獨特：**不問你要什麼系統提示詞，而是讀你實際上做過什麼**。

互動流程：

1. **先問場景**：這個 Genome 是幹什麼的？用你自己的話說細一點
2. **問 session 範圍**：掃描哪些 harness 的歷史記錄
3. **按工作目錄歸並 session**：返回路徑、來源、session 數、位元組數、時間跨度
4. **用戶選擇工作區**
5. **agent 自己分析**：先用 bash 做彙整，再選擇性讀原文
6. **落筆前先給方案**：把整個 Genome 以正文形式講出來
7. **確認後才寫檔案**：寫到 `~/.rsih/genomes/<name>/`，跑 `rsih genome validate`

### 3.4 一條設計原則

> **除了 agent 自己確實拿不到的東西，什麼都不寫成程式碼。**

extension 裡只有三個工具，因為只有三件事 agent 做不到。**改策略不需要改程式碼。**

---

## 四、12 個元件詳解

| 元件 | 擁有欄位 |
|------|----------|
| instructions | `system_prompt`, `append_system_prompt` |
| tools | 內建工具開關、參數收窄、生成工具 |
| skills | 內聯技能和 Pi skill 檔案 |
| commands | 內聯斜槓命令和 Pi prompt 模板檔案 |
| model | 預設 provider/model、模型輪換列表 |
| runtime | 工具執行、steering、follow-up、最大輪次 |
| policies | 工具策略、scratchpad、壓縮、記憶 |
| integrations | Pi 擴充和 stdio MCP 伺服器 |
| appearance | 主題資產、主題選擇 |
| settings | Pi settings.json 的每個欄位 |
| keybindings | Pi keybindings.json 的每個綁定 |
| resources | 自動資源發現的範圍（isolate） |

---

## 五、安裝與使用教學

### 5.1 環境需求

- Node 22.19+
- 建議安裝 bun（可編譯成單檔案二進制）

### 5.2 安裝

```bash
git clone https://github.com/CosmosMind-ai/RSI-Harness.git
cd RSI-Harness
./install.sh
```

### 5.3 基本用法

```bash
rsih                           # 啟動，等價於 pi
rsih --resume                  # 恢復上一個會話
rsih -p "Review the workspace" # 單次命令
```

### 5.4 啟動 Genome

```bash
rsih :coding                   # 冒號簡寫
rsih +coding                   # 加號
```

### 5.5 GEE 生成新 Genome

```bash
gee  # 等價於 rsih :harness-rsi
```

### 5.6 管理 Genome

```bash
rsih genome list               # 列出已安裝的 Genome
rsih genome validate ./my-genome  # 驗證 Genome
rsih genome install coding     # 恢復出廠版本
```

---

## 六、設計哲學

### 6.1 組態是第一等的

Genome 把所有組態收斂到一個可版本化、可 diff、可分享的目錄裡，讓 harness 組態真正成為工程資產。

### 6.2 不可變 Core，組態即一切

Pi 的 Core 是不可變的。RSI-Harness 沒有 fork 它，只用了它的公開組態表面。Pi 的每次升級，RSI-Harness 自動獲得新能力。

### 6.3 自指的元工具

harness-rsi 是用 Genome 自身的元件建構的，**沒有任何一行特設程式碼**。這是對「RSI」這個詞的嚴格實踐。

### 6.4 證據優於自述

GEE 不問「你想要什麼 harness」，而是讀你實際上做過什麼。工具呼叫直方圖、高頻命令、hot files——這些是證據。場景描述是尺子：證據必須回答「這件事是真的」，而不是「這件事是他想的」。

### 6.5 種子會更新，但不會覆蓋你

種子更新時：用戶沒改過 → 自動刷新；用戶改過 → 只警告，不覆寫；別人的同名 Genome → 不覆寫。

### 6.6 約束產生穩定性

12 個元件，欄位所有權互斥，越界寫入在載入時就失敗。一個元件只能管自己該管的東西，不允許越界。

---

## 七、核心觀點與結論

### 觀點一：Harness 的組態應該是一個版本化的工程物件

今天我們能给程式碼做 code review，但沒辦法給「那個好用的提示詞」做 diff。Genome 把這件事做成了。**這才是 AI agent 工程化的起點。**

### 觀點二：Meta-RSI 的正確形式不是改權重，而是改組態

遞迴自我改進不應該是模型改自己的權重（危險且不可預測），而應該是 harness 改自己的組態（安全、可稽核、可回滾）。RSI-Harness 證明了這件事。

### 觀點三：Personalization from evidence 是下一代 AI 組態的方向

GEE 的方法從實際行為中提煉模式——你做了什麼比你說了什麼更可靠。沒有證據支撐的組態項保持空狀態，空意味著繼承 Pi 預設值，而預設值永遠是安全答案。

### 觀點四：工具用它自己的手段建造自身是可行的

extension 裡只有三個工具，因為只有三件事 agent 真的做不到。其他一切——分析 session、制定方案、寫組態——都由 agent 在 skill 和 system prompt 裡的文字驅動完成。**改策略不需要改程式碼。**

### 觀點五：隔離是專業 agent 的必要條件

58 個無關 skill 進入 prompt 會把訊號淹沒。`resources.isolate: true` 讓 prompt 只包含 Genome 自己宣告的內容。對流程被嚴格規定的 agent，無關的干擾源不只是雜訊，也是穩定性的敵人。

---

## 八、當前狀態與限制

### 已實現

- 建構端到端可用的 Genome（12 個元件覆蓋 Pi 全部組態表面）
- inherit-by-default 合併語義
- settings 編譯層
- 目錄打包與分發
- 種子更新機制
- harness-rsi 從多個 session store 互動式生成 Genome

### 尚未實現

- 一句話遠端安裝（目前只接受內建名稱和本機路徑）
- 發布前編輯 gate（Genome 從私人 transcript 提煉，分享前需要能標記絕對路徑）
- Codex session store 集成（1341 個檔案 / 2.9 GB）

---

## 九、總結

RSI-Harness 回答了一個根本問題：AI agent 的 harness 組態如何才能像程式碼一樣工程化？

答案是：**把它做成一個目錄，一個 Genome。**

- 可版本化、可 diff、可復現、可分享
- 12 個元件覆蓋全部組態表面，inherit-by-default 合併
- harness-rsi 用自身手段建構自身，讀用戶實際行為生成個人化 Genome
- 不 fork Pi Core，只用公開組態表面

**工具用它自己的手段建造自身，用證據而非自述來認識自己，用組態而非權重來實現遞迴改進。** 這才是 Meta-RSI 該有的樣子。

專案位址：https://github.com/CosmosMind-ai/RSI-Harness
論文：https://www.cosmosmind.ai/research/metarsi-v1.pdf
HuggingFace：https://huggingface.co/CosmosMind/RSI-Harness

---

以上，既然看到這裡了，如果覺得不錯，隨手點個讚、在看、轉發三連吧，如果想第一時間收到推送，也可以給我個星標，謝謝你看我的文章，我們，下次再見。

首發於微信公眾號「比特財商」。
