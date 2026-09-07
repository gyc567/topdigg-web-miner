---
slug: autohedge-analysis
title: "AutoHedge：多智慧體自治對沖基金架構解析與實踐教程"
description: "深入解析 AutoHedge —— 基於 swarms 框架的多智慧體自治對沖基金。涵蓋：Director/Quant/Risk/Execution/Sentiment 五類專職 Agent 的流水線架構、風險優先設計哲學、Solana 實盤執行鏈路（Jupiter Ultra API）、詳細安裝配置教程、Python API 與 CLI 用法，以及對專案亮點、侷限與適用場景的歸納總結。"
date: "2026-09-07"
author: "TopDigg"
tags: ["AutoHedge", "Multi-Agent", "AI Agent", "Hedge Fund", "Trading", "Swarms", "Solana", "Risk Management", "Quantitative Trading", "LLM"]
categories: ["Deep Dive"]
keywords: ["AutoHedge", "多智慧體", "對沖基金", "AI Agent", "自治交易", "Swarms框架", "風險管理", "Solana", "Jupiter", "量化交易", "設計哲學", "交易流水線"]
---

# AutoHedge：多智慧體自治對沖基金架構解析與實踐教程

> 核心思想：**用一組專職 AI Agent 復刻對沖基金公司的組織架構。** AutoHedge 把基金經理、量化分析師、風控經理、交易員、情緒分析師五個角色對映為五個 LLM Agent，透過結構化的交接（handoff）機制串成一條交易流水線：Director 生成交易論點，Quant 做數值驗證，Risk 定倉位與風險敞口，Execution 生成訂單引數，全流程最少人工干預。程式碼約 1600 行，核心邏輯清晰，是研究"LLM 組織化"的樣本專案。

**風險提示：本專案為實驗性開源軟體，處於 Beta 階段。本文僅作技術解析，不構成任何投資建議。用真實資金執行任何自動化交易系統之前，請自行完成風險評估與合規審查。**

## 一、專案說明

### 1.1 一句話定位

**AutoHedge 是一個企業級自治 Agent 對沖基金：以 swarm intelligence（群體智慧）排程多個專職 AI Agent，完成端到端的市場分析、風險管理與交易執行。**

### 1.2 專案元資訊

| 欄位 | 值 |
|------|-----|
| GitHub | [The-Swarm-Corporation/AutoHedge](https://github.com/The-Swarm-Corporation/AutoHedge) |
| 開發方 | The Swarm Corporation（作者 Kye Gomez） |
| 許可證 | MIT |
| 語言 | Python 3.10+ |
| 當前版本 | 0.1.5（Beta） |
| 核心依賴 | swarms、swarm-models、pydantic、loguru、httpx、solders、yfinance、rich |
| 交易場所 | Solana（完整支援）；Coinbase（開發中）；其他 CEX（路線圖） |
| 底層框架 | [Swarms](https://github.com/The-Swarm-Corporation/swarms)（同廠多智慧體框架） |

### 1.3 專案能力邊界

- 支援的能力：多 Agent 交易論點生成、量化/情緒分析、倉位與風險評估、訂單引數生成、Solana 鏈上代幣查詢與兌換（Jupiter Ultra API）、互動式 REPL 控制檯。
- 不支援的能力：回測引擎、賬戶級硬性風控限額、生產級訂單管理系統（OMS）、多賬戶組合管理。

專案處於早期階段。`logs/` 目錄中的成交記錄來自 `experimental/` 下的做市實驗指令碼，不是主系統的實盤輸出。

## 二、架構解析

### 2.1 五類專職 Agent

`autohedge/workers.py` 定義了全部 Agent。每個 Agent 由三部分組成：系統提示詞（`prompts.py`）、模型、工具集。

| Agent | 模型 | 職責 | 對應人類角色 |
|-------|------|------|--------------|
| Trading-Director | gpt-4.1 | 生成市場論點（thesis），從任務中自行發現標的，排程下游 Agent | 基金經理 / PM |
| Quant-Analyst | gpt-4.1 | 技術指標、統計模式、VaR/ES 等風險指標、交易成功機率 | 量化研究員 |
| Risk-Manager | gpt-4.1 | 倉位規模建議、最大回撤、市場風險敞口、綜合風險評分 | 風控經理 |
| Execution-Agent | gpt-4.1 | 訂單型別、數量、入場價、止損、止盈、有效時間 | 交易員 |
| Sentiment-Agent | gpt-4o-mini | 新聞/社交媒體情緒打分（0-1）、主題識別、反向指標判斷 | 情緒分析師 |

### 2.2 流水線：Director 的 handoff 機制

主入口 `AutoHedge.run(task)` 只做一件事：把使用者任務交給 Director。Director 透過 swarms 框架的 `handoffs` 引數持有全部下游 Agent：

```
使用者任務（自然語言）
  │
  ▼
Trading-Director ──handoff──▶ Quant-Analyst ──handoff──▶ Risk-Manager ──handoff──▶ Execution-Agent
  │ 生成交易論點                  │ 數值驗證與機率打分            │ 倉位規模與風險評分           │ 結構化訂單引數
  ▼
輸出：完整對話記錄（Conversation）
```

關鍵實現細節：

1. **無預定義標的列表**。Director 從自然語言任務中解析需要分析的 ticker（程式碼中有專門的 `DIRECTOR_TICKER_DISCOVERY_PROMPT`，要求模型只返回 JSON 陣列）。任務可以是"分析 NVDA 並給出 5 萬美元配置方案"，也可以是"分析原油市場情緒"。
2. **每個 Agent `max_loops=1`**。每個環節只呼叫一次模型，不做自我迭代。流水線是單向的，沒有反饋迴路。
3. **交接內容有明確契約**。例如 Risk-Manager 收到的訊息固定包含"Stock, Thesis, Quant Analysis"三段；Execution-Agent 收到的訊息固定包含"Stock, Thesis, Risk Assessment"。每個環節被明確要求輸出結構化欄位：Quant 輸出 `technical_score / volume_score / trend_strength / volatility / probability_score / key_levels(support, resistance, pivot)`；Risk 輸出倉位規模、最大回撤、敞口、風險總分；Execution 輸出訂單型別、數量、入場價、止損、止盈、time-in-force。
4. **時間感知提示詞**。啟動時把當前日期時間注入每個 Agent 的系統提示詞尾部（"Current date and time (use this as now)"），避免模型用過期資訊做判斷。
5. **全過程留痕**。`Conversation` 物件記錄每個角色的輸出，`output_type` 支援 `list / dict / str` 三種返回格式，便於接入下游審計系統。

### 2.3 工具層

`autohedge/tools/` 提供資料與執行工具，透過 `tools_registry.py` 統一註冊：

| 工具 | 功能 | 依賴 |
|------|------|------|
| `search_tokens` | Solana 代幣搜尋 | Jupiter API |
| `get_token_price` | 按 mint 地址查詢 USD 價格 | Jupiter Price API V3 |
| `execute_trade` | 簽名並提交鏈上兌換交易 | Jupiter Ultra API + solders |
| `get_holdings` | 查詢錢包持倉 | Jupiter Ultra API |
| `get_order` | 查詢訂單狀態 | Jupiter Ultra API |
| `exa_search` | 聯網新聞/情緒檢索（掛給 Sentiment-Agent） | Exa |
| `yahoo_api` / `polygon_api` | 美股行情資料（yfinance、Polygon） | yfinance、httpx |

Solana 執行鏈路是完整的：`WALLET_PRIVATE_KEY` 由 `solders` 載入為 Keypair，`execute_trade` 走 Jupiter Ultra `/ultra/v1` 的"報價-簽名-提交"流程。需要說明：當前版本中這些交易工具未接入主 Agent 的工具列表，主 Agent 輸出的是訂單引數文字，實盤的最後一步需要人工或二次開發接通。

## 三、設計哲學

從程式碼與文件中可歸納出六條設計原則。

### 3.1 組織架構即程式碼

人類對沖基金公司按職能分工：PM 定方向、量化出訊號、風控卡規模、交易員執行。AutoHedge 把這套組織直接對映為 Agent 拓撲——角色由提示詞定義，流程由 handoff 定義，彙報關係由 `max_loops=1` 的單向流水線定義。組織設計變成了提示詞工程。

### 3.2 風險優先（Risk-First）

風控 Agent 位於量化和執行之間，是流水線的必經節點。任何訂單在生成之前必須經過倉位規模、最大回撤、敞口評估。README 原文："Risk-First Design: Built-in risk management and position sizing before any execution."這與多數"先訊號後風控"的業餘量化專案相反——風險關口前置，而不是事後補丁。

### 3.3 單一職責與結構化交接

每個 Agent 只做一件事，輸入輸出格式寫入提示詞。交接內容用固定欄位（倉位規模、止損、機率分等），下游 Agent 的提示詞裡明確寫"你將收到 Stock, Thesis, Quant Analysis"。這把"Agent 間通訊"從自由對話降級為受限協議，降低幻覺擴散的機率。

### 3.4 任務驅動，無預定義股票池

系統沒有內建標的白名單。Director 根據任務自行發現 ticker。同一套系統，任務是"分析原油市場"時走宏觀路徑，任務是"分析 NVDA"時走個股路徑。靈活性來自提示詞，不來自配置。

### 3.5 可擴充套件的模組化

提示詞集中在 `prompts.py`（202 行），Agent 定義集中在 `workers.py`（93 行），工具透過 registry 註冊。新增一個交易所 = 新增一組工具函式；新增一個角色 = 新增一個 Agent 定義並加入 handoffs 列表。模組邊界與檔案邊界一致。

### 3.6 機構級可審計性

全流程用 loguru 記錄，對話用 Conversation 物件留存，可匯出三種格式。設計目標指向"機構可靠性"——每一步決策有據可查，出錯可回放定位。

## 四、詳細教程

### 4.1 安裝

```bash
pip install -U autohedge
```

要求 Python 3.10+。也可以從原始碼安裝：

```bash
git clone https://github.com/The-Swarm-Corporation/AutoHedge.git
cd AutoHedge
pip install -r requirements.txt
```

### 4.2 配置環境變數

在專案根目錄建立 `.env`（可參考 `.env.example`）：

```bash
# Jupiter API：代幣價格與搜尋工具，去 https://portal.jup.ag 申請
JUPITER_API_KEY=你的Jupiter金鑰

# 大模型（swarms 框架要求 OpenAI 相容介面）
OPENAI_API_KEY=你的OpenAI金鑰
ANTHROPIC_API_KEY=你的Anthropic金鑰

# Agent 工作目錄
WORKSPACE_DIR="agent_workspace"

# Solana 交易：僅在你需要真實下單時填寫
WALLET_PRIVATE_KEY=你的Solana錢包私鑰
```

說明：主 Agent 使用 gpt-4.1 與 gpt-4o-mini。CLI 啟動時若未檢測到 `OPENAI_API_KEY` 會列印警告。Jupiter key 用於價格/搜尋工具；沒有它部分工具會以未認證模式請求或失敗。

### 4.3 方式一：CLI 互動模式

```bash
autohedge
```

啟動後進入 REPL（基於 rich 渲染），介面顯示版本、工作目錄、使用提示和最近 5 條任務歷史（存於 `~/.autohedge/recent_tasks.txt`）。

互動示例：

```
> Analyze NVDA for a 50k allocation
```

輸入任意任務即觸發一個完整交易週期。結果以面板形式展示（截斷至 2000 字元）。命令：

- `help` / `?` / `h`：顯示提示
- `quit` / `exit` / `q`：退出

其他引數：`autohedge --version` 檢視版本；`autohedge help` 顯示幫助。

### 4.4 方式二：Python API

```python
from autohedge import AutoHedge

trading_system = AutoHedge(
    name="my-fund",
    description="Private Hedge Fund",
)

task = "Analyze the sentiment of oil market and provide a thesis on the overall market position and expected trends."
result = trading_system.run(task=task)
print(result)
```

`AutoHedge` 的引數：

| 引數 | 預設值 | 作用 |
|------|--------|------|
| `name` | "autohedge" | 系統名稱 |
| `description` | "fully autonomous hedgefund" | 系統描述 |
| `output_dir` | "outputs" | 輸出目錄 |
| `output_type` | "list" | 返回格式：`list` / `dict` / `str` |

### 4.5 最小自定義：換模型、加工具、改提示詞

改動全部集中在一處——`workers.py`：

```python
# 換模型：把 gpt-4.1 換成任意 OpenAI 相容模型名
risk_agent = Agent(
    agent_name="Risk-Manager",
    system_prompt=RISK_PROMPT,
    model_name="gpt-4o",        # ← 改這裡
    max_loops=1,
)
```

新增工具：在 `tools/` 下寫函式，在 `tools_registry.py` 的 `get_tools()` 中註冊，然後把函式名掛到對應 Agent 的 `tools=[...]` 引數。

改提示詞：直接編輯 `prompts.py` 中的對應常量。例如讓 Quant 額外輸出夏普比率，在 `QUANT_PROMPT` 補充一行要求即可。

### 4.6 執行一個完整週期的預期輸出

以任務 "Analyze NVDA for a 50k allocation" 為例，Director 先發現標的 NVDA，產出市場論點；Quant 產出技術指標分與支撐/阻力位；Risk 產出建議倉位與風險評分；Execution 產出帶止損止盈的訂單引數。`Conversation` 中儲存每個角色的完整輸出，可透過 `output_type="dict"` 按角色名取用。

## 五、觀點與結論

### 5.1 這個專案的真正價值

AutoHedge 的價值不在"賺錢"，而在提供了一個可讀的答案：**多智慧體系統如何組織一個完整業務流程。** 1600 行程式碼裡能看到：角色定義、通訊協議、流程編排、審計日誌，四件事各有落點。對研究 Agent 編排、設計自己的多 Agent 系統的人來說，這是比論文直觀的教材。

### 5.2 架構上的三個亮點

1. **風控前置**。風險 Agent 是流水線的必經節點，這條設計原則直接、正確，且被寫進了每個環節的提示詞契約裡。
2. **交接契約明確**。每個 Agent 知道自己會收到什麼、要輸出什麼。這比"一群 Agent 自由討論"的群體智慧做法穩定得多。
3. **時間感知**。給每個提示詞注入當前時間，成本一行程式碼，避免了模型用訓練截止日期的舊資訊做交易判斷——這是金融場景特有的細節。

### 5.3 侷限與風險（必須正視）

1. **實驗性質**。版本 0.1.5，Beta 標籤。主 Agent 未接入真實交易工具，`WALLET_PRIVATE_KEY` 僅在 experimental 指令碼中使用。README 聲稱 Pydantic 結構化輸出，實際實現為字串輸出。
2. **無回測框架**。任何交易策略上線前需要歷史資料驗證，專案沒有提供。
3. **風控是"建議"不是"約束"**。倉位規模、止損全部由 LLM 生成，程式碼層面沒有賬戶級硬限額（如最大單日虧損熔斷）。LLM 可以被提示詞注入攻擊誘導放大倉位。
4. **無反饋迴路**。流水線單向執行，Quant 的結果不會回傳 Director 修正論點，錯了不會自我糾正。
5. **單框架依賴**。深度繫結 swarms 框架的 Agent/Conversation 抽象，遷移成本高。
6. **成本**。一個週期呼叫 4-5 次 gpt-4.1 級別模型，高頻執行成本不低。

### 5.4 適用場景

- 學習多智慧體架構與提示詞工程的教學樣本
- 自治交易系統的原型起點（在此基礎上補回測、硬風控、執行對接）
- 研究 LLM 在金融決策鏈路中的誤差傳播

不適用場景：直接接入真實資金實盤執行。

### 5.5 結論

AutoHedge 把一個對沖基金公司裝進了一個 Python 包裡：五個角色、一條流水線、一套交接協議。它的設計哲學——風險優先、職責單一、結構化交接、任務驅動、可審計——值得任何構建多 Agent 系統的人借鑑。它的實現完成度提醒所有人：從"架構正確"到"系統可信"，中間隔著回測、硬約束、監控和大量的工程。前者 AutoHedge 已經示範，後者仍需你自己補齊。

## 六、參考連結

- 專案倉庫：https://github.com/The-Swarm-Corporation/AutoHedge
- Swarms 框架：https://github.com/The-Swarm-Corporation/swarms
- Jupiter API 文件：https://dev.jup.ag
- Jupiter 金鑰申請：https://portal.jup.ag
