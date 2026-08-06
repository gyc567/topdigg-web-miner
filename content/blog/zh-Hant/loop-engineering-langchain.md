---
title: "The Art of Loop Engineering 深度解析（LangChain 官方）：四層循環堆疊——從 Agent 循環到驗證循環、事件驅動循環與爬山改進循環，以及每層對應的 LangChain 原語"
description: "以 LangChain 官方部落格《The Art of Loop Engineering》（作者 Sydney Runkle，2026-06-16，7 分鐘閱讀）為藍本，完整解析 LangChain 眼中的「循環堆疊」（loopcraft）世界觀。核心思想：核心 agent 演算法本身就是一個循環——給 LLM 上下文，讓它循環呼叫工具直到完成。但這只是最基礎的循環，遠非唯一。借鑒 swyx 的 loopcraft 思想，LangChain 提出四層循環：① Agent loop（模型循環呼叫工具直到任務完成，對應 create_agent）；② Verification loop（驗證循環：grader 對照 rubric 檢查輸出，不合格則帶回饋重試，對應 RubricMiddleware/after_agent hook，LLM-as-judge 是經典實作）；③ Event driven loop（事件驅動循環：事件觸發 agent 執行——新文件落地、cron 排程、webhook 到達，agent 成為常駐元件，對應 LangSmith Deployment 的 cron/webhooks、Fleet 的 channels/schedules、OpenClaw 的 heartbeats）；④ Hill climbing loop（爬山循環：每個 agent 執行產生 trace，分析 agent 閱讀 trace 並用發現重寫 harness 設定——提示詞/工具/grader 調整，對應 LangSmith Engine；還可外推至 RL 微調與記憶/技能最佳化）。文章強調：第四層（也許最重要）自動化的是「改進本身」，關鍵在於返回箭頭不是回到頂部，而是直接伸進內部更新 agent 循環——外層循環的每一輪都讓內層循環更有效。同時堅持「自動化不等於移除人類」：每一層都有天然的人類監督點，敏感動作（金融交易、資料庫操作）需要即時人工審查。結尾引用 Satya Nadella：儘早建立學習循環的公司，人類判斷與 token 資本複利，將構建難以複製的優勢。"
date: "2026-08-06"
author: "TopDigg Research Team"
tags: ["Loop Engineering", "LangChain", "LangSmith", "AI Agent", "loopcraft", "swyx", "create_agent", "RubricMiddleware", "LLM-as-Judge", "Deep Agents", "LangGraph", "Fleet", "Satya Nadella"]
categories: ["Deep Dive"]
keywords: ["Loop Engineering", "LangChain", "LangSmith", "循環工程", "AI 代理", "loopcraft", "swyx", "驗證循環", "事件驅動", "爬山循環", "create_agent", "RubricMiddleware", "Engine", "Fleet", "人類監督", "Satya Nadella"]
---

# The Art of Loop Engineering 深度解析（LangChain 原文）：四層循環堆疊——從 Agent 循環到驗證循環、事件驅動循環與爬山改進循環

> 核心思想：**Agent 的核心演算法就是一個循環——給 LLM 上下文，讓它循環呼叫工具直到完成。但這只是最基礎的循環，遠非唯一。** LangChain 官方部落格（作者 Sydney Runkle，2026-06-16）借鑒 swyx 的「loopcraft: the art of stacking loops」（堆疊循環的藝術）思想，提出四層循環堆疊的世界觀：**① Agent loop**（模型呼叫工具直到任務完成，`create_agent` 原語）；**② Verification loop**（驗證循環——grader 對照 rubric 檢查輸出，不合格就帶回饋重試，`RubricMiddleware` / `after_agent` hook，LLM-as-judge 是經典實作）；**③ Event driven loop**（事件驅動循環——事件觸發 agent 執行：新文件落地、cron 排程、webhook 到達，agent 成為整個系統中常駐執行的元件，LangSmith Deployment 的 cron/webhooks、Fleet 的 channels/schedules、OpenClaw 的 heartbeats）；**④ Hill climbing loop**（爬山改進循環——每個 agent 執行產生 trace，分析 agent 閱讀 trace 並用發現重寫 harness 設定，LangSmith Engine 實作；還能外推為 RL 微調訊號與記憶/技能最佳化）。關鍵動作：**第四層的返回箭頭不是回到頂部，而是伸進內部直接更新 agent 循環**——外層循環的每一輪讓內層循環更有效。但自動化不等於移除人類：每一層都有天然的人類監督點，敏感動作（金融交易、資料庫操作）需要即時人工審查。結尾引用 Satya Nadella：**儘早建立學習循環的公司，人類判斷與 token 資本複利，將構建難以複製的優勢。**

---

## 一、項目說明

### 1.1 它是什麼？

本文要解析的是 **LangChain 官方部落格發表的文章《The Art of Loop Engineering》**，作者 **Sydney Runkle（LangChain）**，發布於 **2026-06-16**，閱讀時長約 7 分鐘。它不是純概念文，而是一篇**產品化的工程世界觀**：LangChain/LangSmith 平台（Observability、Evaluation、Deployment、Sandboxes、LLM Gateway、Fleet、Engine、deepagents、langgraph）幾乎每個能力都能在這套「循環堆疊」框架裡找到位置。

文章立場一句話：**Agent 有用，是因為它們透過在現實世界中採取行動來自動化工作。但要讓 agent 可靠地做有價值的工作，需要的不僅僅是一個好模型——它需要一個精心設計的、適配一組任務的 harness（腳手架）。** 核心 agent 演算法很簡單：給 LLM 上下文，讓它在一個循環裡呼叫工具直到完成——這是最基礎的循環。**但它遠非唯一驅動 agent 的循環。**

文章引用了 swyx（Shawn Wang）最近寫的一篇關於 **「loopcraft: the art of stacking loops」** 的文章——核心思想是：**你可以堆疊和擴展循環，來構建更有效的 agent。** LangChain 這篇文章就是回答：「這是我們如何看待這個堆疊結構，以及如何用 LangChain 原語為每一層插樁（instrument）。」

### 1.2 關鍵資料與資訊

- 作者：**Sydney Runkle（LangChain）**，致謝 Vivek、Mason、Harrison、Hunter
- 發布管道：LangChain 官方部落格 `langchain.com/blog`
- 發布時間：**2026-06-16**，閱讀時長 7 分鐘
- 核心靈感來源：swyx 的《loopcraft: the art of stacking loops》
- 貫穿全文的動機示例：**LangChain 內部文件 agent（docs agent）**——收到文件改進請求 → 模型規劃並起草修改 → 用工具 clone 倉庫、讀檔案、寫文件、開 PR
- 平台上下文：LangSmith（Observability / Evaluation / Deployment / Sandboxes / LLM Gateway / Fleet / Engine）+ 開源框架（deepagents / langgraph / langchain）
- 結尾觀點來源：Satya Nadella（微軟 CEO）關於組織學習循環的論述
- 同行結論：Steipete（Peter Steinberger）、Boris（Cherny）、Andrej（Karpathy）「都得出了同樣的結論」

### 1.3 它解決什麼問題？

文章解決的是一系列嵌套的問題：

1. **單層問題**：agent 循環能幹活，但**第一次跑不一定產生正確、一致的輸出**——需要驗證層兜底。
2. **整合問題**：agent 不該是被你手動呼叫的東西，而應該是**在更大系統裡持續執行的元件**——需要事件驅動層。
3. **改進問題**（也許最重要）：前三層自動化的是「工作」，第四層自動化的是「**改進本身**」——透過閱讀 trace 反向最佳化 harness。

它的回答是四層循環堆疊 + 每層的 LangChain 原語 + 每層的人類監督點。

---

## 二、核心思想

### 2.1 一句話世界觀

> **「Agent 的核心演算法是簡單的：給 LLM 上下文，讓它在一個循環裡呼叫工具直到完成。這是最基礎的循環。但它遠非唯一驅動 agent 的循環。」**

所有更高級的能力，都是在這個基礎循環之上**堆疊**出來的。文章的核心框架是四層：

| 層級 | 循環 | 作用 | LangChain 原語 |
|------|------|------|----------------|
| 1 | **Agent loop** | 模型反覆呼叫工具直到任務完成 | `create_agent`、任何 LangChain 支援的模型 |
| 2 | **Verification loop** | agent 執行後，輸出對照 rubric 打分，不合格就帶回饋重試 | `RubricMiddleware` |
| 3 | **Event driven loop** | 事件觸發 agent 執行，更新真實系統 | LangSmith Deployment（cron 觸發 / webhooks）或 Fleet channels |
| 4 | **Hill climbing loop** | 生產執行產生的 trace 餵給分析 agent，改進 harness 設定 | LangSmith Engine |

### 2.2 循環堆疊的本質：返回箭頭伸進內部

LangChain 強調第四層的關鍵動作：

> **「The key move here is that the return arrow doesn't just loop back to the top — it reaches inside and updates the agent loop directly. Each cycle of the outer loop makes the inner loops more effective.」**
> （這裡的關鍵動作是：返回箭頭不只是回到頂部——它直接伸進內部，更新 agent 循環本身。外層循環的每一輪循環，都讓內層循環更有效。）

這正是「堆疊循環」與「串行執行多個任務」的本質區別：**循環套循環，外層的輸出反過來最佳化內層的設定。**

### 2.3 自動化 ≠ 移除人類

文章專門用一節強調：

> **「Automation doesn't mean removing humans from the loop.」**（自動化不意味著把人類從循環中移除。）

每一層都有**天然的人類監督點（natural points where human oversight adds value）**：

- 在 **agent loop**：敏感動作/工具呼叫前要求人工輸入
- 在 **verification loop**：敏感工作流中人類可以作為 grader
- 在 **application loop**：輸出返回給終端使用者前，人類可以審批
- 在 **hill climbing loop**：harness 改進在部署前可經過人工審查

LangChain 的立場：**所有開源框架都把「human in the loop」作為一等公民原語。** 一個例子：「自動化 grader 能檢查連結是否解析；但要發現框架對目標受眾來說不對，需要人類——那種從上下文、經驗和品味中獲得的判斷，正是人類審查的價值所在。」

---

## 三、詳細教學：四層循環逐層拆解

### 3.1 Loop 1：The Agent（Agent 循環）——自動化工作的基礎

**在最核心處，agent 就是一個「在一個循環裡呼叫工具直到任務完成」的模型。** 這就是 LangChain 的 `create_agent` 給你的東西：**選任意模型、插上工具，你就有了一個可工作的 agent 循環。**

- **工具是 agent 獲得「在現實世界採取行動」能力的來源。** 沒有工具，agent 只是生成文字；有了工具，agent 可以寫檔案、跑程式碼、呼叫 API。
- **貫穿全文的動機示例（docs agent）**：在第一個循環層級，它收到一個文件改進請求，模型規劃和起草修改，並使用工具**clone 倉庫、讀檔案、寫文件、開 pull request** 等。

這一層自動化的是「**做事**」（getting work done）。

### 3.2 Loop 2：The Verification Loop（驗證循環）——保證品質與正確性

**Agent 循環能幹活，但它不總是第一次就跑出正確、一致的輸出。當一致性重要時，用一個驗證循環把它包起來：檢查輸出，不達標就把回饋送回給模型。**

驗證循環增加一個 **grader（評分器）**：

> 檢查 agent 的輸出是否對照 **rubric（評分標準）** 達標；不達標就把結果連同回饋一起送回。

- **Grader 可以是確定性的（deterministic），也可以是 agentic 的（LLM-as-judge 是經典例子）。**
- **LangChain 實作**：`RubricMiddleware` 直接處理這個模式；或者用 `create_agent` 上的 `after_agent` hook 自己接。

**docs agent 示例**：grader 在每次嘗試後執行測試——**檢查所有連結能否解析、所有 CI 檢查是否通過、diff 是否限定在實際請求的範圍內**。這類錯誤無需人工審查即可捕獲。

**權衡**：增加驗證會增加**每次執行的延遲和成本**。當品質比速度重要時（大多數生產用例正是如此），它值得。

這一層自動化的是「**驗證**」（verifying）。

### 3.3 Loop 3：The Event Driven Loop（事件驅動循環）——規模化地自動化工作

**agent 開發最重要的部分之一是整合層：把 agent 連接到你的生態系統中，讓它能在後台執行。**

事件驅動循環就是這樣做的：**一個事件觸發——新文件落地、一個排程觸發、一個 webhook 到達——然後 agent 執行。**

> **「The agent isn't something you invoke manually; it's a component running continuously inside a larger system.」**
> （agent 不是你手動呼叫的東西；它是更大系統內部持續執行的一個元件。）

**LangChain 實作**：

- **LangSmith Deployment** 支援觸發基礎設施，包括 **cron 排程和 webhooks**。
- **cron 的熱門應用案例：「heartbeats」（心跳）**——來自 **OpenClaw** 專案，把 agent 變成**永遠在線、主動的助手**。
- **docs agent 由 Fleet（LangChain 的無程式碼 agent 建構器）驅動**：Fleet 的 **channels 和 schedules** 處理事件驅動與 cron 式觸發。例如用 channel 在有人於 `#docs-plz` Slack 頻道發訊息時觸發 docs agent。

這一層自動化的是「**規模化的工作**」（work at scale）——agent 從「你叫它才來」變成「系統的一部分，事件來了就幹活」。

### 3.4 Loop 4：The Hill Climbing Loop（爬山改進循環）——自動化改進本身

**前三層自動化的是工作；第四層（也許是最重要的）自動化的是改進！**

- **每個 agent 執行都會產生一個 trace（軌跡）**：模型做了什麼、呼叫了哪些工具、grader 回饋等等的記錄。
- 這些 trace 包含關於「**什麼有效、什麼無效**」的高價值訊號。
- **爬山循環在 trace 上執行一個分析 agent，並用發現來重寫 harness 的改進設定**——包括**提示詞/工具的調整，或 grader 的調整**。
- **LangChain 實作**：**LangSmith Engine**（trace 分析 agent）用於給這個第四循環插樁。

**docs agent 示例**：他們在 docs agent 的 trace 上執行 Engine 來偵測問題。**當多個 trace 指向一個潛在問題時，就會提交一個 issue，要求修改有問題的提示詞或工具。**

**外推方向**（文章明確列出）：

> 「展望未來：提示詞和工具設定是最容易改進的東西，但它們不是唯一選項。對於執行開放權重模型的團隊，爬山循環可以餵給 **RL 微調（reinforcement fine-tuning）**，用 trace 或 eval 結果作為訓練訊號來改進模型本身。**輔助上下文（auxiliary context）**——如記憶和檢索到的技能——也可以用同樣的方式改進。**循環是模式；它最佳化什麼取決於你。**」

（"The loop is the pattern; what it optimizes is up to you."）

這一層自動化的是「**改進**」（improvement）——而且是**持續、自主的改進**。

### 3.5 完整對照表

| 循環 | 做什麼 | 影響 | LangChain 原語 |
|------|--------|------|----------------|
| 1. Agent loop | 模型反覆呼叫工具直到任務完成 | 自動化工作 | `create_agent`、任何 LangChain 支援的模型 |
| 2. Verification loop | agent 執行後輸出對照 rubric 打分，失敗則帶回饋重試 | 保證工作的品質與正確性 | `RubricMiddleware` |
| 3. Event driven loop | 事件觸發 agent 執行，更新真實系統 | 規模化自動化工作 | LangSmith Deployment 的 cron 觸發 / webhooks，或 Fleet channels |
| 4. Hill climbing loop | 生產執行的 trace 餵給分析 agent，改進 harness 設定 | 改進 harness 本身 | LangSmith Engine |

---

## 四、設計哲學

### 4.1 「循環是模式；它最佳化什麼取決於你」

LangChain 把 loop 抽象成一個**元模式**：同一個「分析-調整-重試」循環，可以用來最佳化提示詞、工具、grader、RL 訓練訊號、乃至記憶與技能。**工具不同，模式相同。** 這是從「做一個 agent」到「做一個會自己變好的 agent 系統」的哲學跳躍。

### 4.2 從工具之爭到堆疊結構

文章的潛台詞呼應了 swyx 的 loopcraft 與 Addy Osmani 的觀察：**一旦你把注意力從「哪個 agent 工具」轉移到「循環如何堆疊」，爭論就結束了。** 價值不在任何一個單獨的循環裡，而在循環之間的**層級關係**裡——特別是第四層「外層循環最佳化內層循環」的遞迴結構。

### 4.3 人類監督是分層設計的一部分，不是補丁

每層都有天然的介入點，且 LangChain 明確把 human-in-the-loop 作為**一等公民原語**而非事後補救。判斷（judgment）——「從上下文、經驗和品味中獲得」的能力——是自動化 grader 無法替代的。**敏感動作（金融交易、資料庫操作）需要即時人工審查。**

### 4.4 組織視角：學習循環是護城河

文章結尾引用 Satya Nadella（微軟 CEO）框定組織層面的利害：

> **「companies that build learning loops early, where human judgment and token capital compound together, will build an advantage that's hard to replicate.」**
> （**儘早建立學習循環的公司——人類判斷與 token 資本在其中共同複利——將構建一個難以複製的優勢。**）

同時文章指出行業共識已經形成：

> **「AI leaders like Steipete, Boris, and Andrej have all arrived at the same conclusion: the potential in agents is in the loops you build around them.」**
> （Steipete、Boris、Andrej 等 AI 領袖都得出了同樣的結論：**agent 的潛力在於你圍繞它們構建的循環。**）

### 4.5 重心轉移：從 Loop 1/2 到 Loop 3/4

> **「We've been thinking about loops 1 and 2 for a while. But focus should pivot to loops 3 and 4 where value compounds by embedding agents into your ecosystem that continuously improve in response to your criteria.」**
> （我們一直在思考循環 1 和 2。但重心應該轉向循環 3 和 4——價值透過把 agent 嵌入你的生態系統、讓它們按你的標準持續改進而複利增長。）

---

## 五、歸納總結

### 5.1 核心觀點清單

1. **Agent 的核心是一個循環**：給 LLM 上下文，循環呼叫工具直到完成——這是所有 agent 工作的基礎（Loop 1，`create_agent`）。
2. **可靠性需要驗證循環**：grader 對照 rubric 檢查輸出，不合格帶回饋重試；grader 可以是確定性邏輯或 LLM-as-judge（Loop 2，`RubricMiddleware` / `after_agent` hook）。代價是延遲與成本，品質優先時值得。
3. **規模化需要事件驅動**：agent 從「被手動呼叫」變成「系統裡持續執行的元件」——事件（新文件、cron、webhook）觸發執行（Loop 3，LangSmith Deployment cron/webhooks、Fleet channels、OpenClaw heartbeats）。
4. **改進可以自動化**：trace 是改進訊號，分析 agent 閱讀 trace 並重寫 harness 設定——提示詞、工具、grader（Loop 4，LangSmith Engine）。
5. **關鍵動作是「伸進內部」**：第四層的返回箭頭不是回到頂部，而是直接更新 agent 循環——外層循環讓內層循環更有效。這是 loopcraft 的本質。
6. **外推空間巨大**：同樣的循環模式可最佳化 RL 微調訊號、記憶、檢索技能——「循環是模式，它最佳化什麼取決於你」。
7. **自動化不意味著移除人類**：每層都有天然監督點；判斷力來自上下文、經驗與品味，是自動化 grader 無法替代的；敏感動作（金融交易、DB 操作）需要即時人工審查。
8. **學習循環是組織護城河**（Satya Nadella）：人類判斷與 token 資本複利 → 難以複製的優勢；行業共識（Steipete/Boris/Andrej）已形成。

### 5.2 一句話總結

> **Agent 的價值不在單個循環裡，而在循環的堆疊結構裡：Agent 循環做事，驗證循環兜底，事件驅動循環規模化，爬山循環讓系統自己變好——而人類判斷是貫穿每一層、讓 token 資本複利的那個常數。** 從「構建 agent」到「構建會自己改進 agent 的系統」，這就是 loop engineering 的落地方案。

---

## 參考資料

- 原文：LangChain，《The Art of Loop Engineering》（Sydney Runkle，2026-06-16）—— `https://www.langchain.com/blog/the-art-of-loop-engineering`
- swyx，《loopcraft: the art of stacking loops》
- LangChain 相關文件：`create_agent`、`RubricMiddleware`、`after_agent` hook、LangSmith Deployment（cron jobs / webhooks）、LangSmith Engine、Fleet channels、deepagents quickstart、langgraph
- 關聯專案：OpenClaw（heartbeats，Peter Steinberger）
- 關聯人物觀點：Steipete（Peter Steinberger）、Boris Cherny（Anthropic Claude Code）、Andrej Karpathy、Satya Nadella（微軟 CEO）
- 本站相關：《Loop Engineering 深度解析（Addy Osmani 原著）》（`loop-engineering-addy-osmani`）、《Loop Engineering 深度解析（Cobus Greyling 原著）》（`loop-engineering-substack-analysis`）
