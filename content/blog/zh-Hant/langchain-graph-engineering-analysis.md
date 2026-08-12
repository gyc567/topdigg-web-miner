---
slug: langchain-graph-engineering-analysis
title: "LangGraph 深度解析：三年圖工程實踐總結——用圖構建可靠 Agent 的完整指南（核心思想 + 專案說明 + 詳細教學 + 設計哲學）"
description: "以 LangChain 官方部落格《3 Years of Graph Engineering with LangGraph》（Harrison Chase 與 Sydney Runkle，2026-07-22）為藍本，完整解析「圖工程（graph engineering）」典範與 LangGraph 框架。核心思想：把 agentic 系統表示為圖，讓您（建構者）把對系統應該如何運作的預判（preconceptions）強加進更受限的路徑，而不是僅僅依賴 LLM 的判斷——在您想讓 agent 走特定路徑時更緊密地控制行為。專案說明：LangGraph 是 LangChain 團隊三年前建構的 agent 編排框架，如今月下載量 65M+，被新創公司與大企業共同使用，其流行源於在「確定性路徑」與「agentic 步驟」之間取得的平衡。詳細教學：圖建模三要素（節點做事/邊定義下一步/狀態機視角）、何時用圖（支援 agent 分類再回應、編碼 agent 檢查儲存庫再提議、合規流程審批再行動）與何時不用（深度研究類天然 agentic 任務用 agent harness/Deep Agents）、map-reduce 與 Send API 動態轉換、「節點裡裝一個完整 agent」的新模式與 docs agent 案例（Slack 請求 → PR，節點分布在確定性到 agentic 光譜的不同位置）。設計哲學：圖即認知架構——像 prompt 攜帶領域知識一樣，圖編碼您關於系統應如何工作的世界知識；模型只在它增值的地方推理，其餘交給程式碼，於是 agent 更便宜、更快、更可預測。三年實踐經驗：agent 圖通常不是 DAG（需要循環：重試、請求缺失資訊、驗證後修訂、暫停等待人工輸入）；循環是簡單的圖（loop engineering 是 graph engineering 的簡化版，LangChain 本身建構在 LangGraph 之上）；動態轉換很重要（執行時期才知道要派生多少工作，用 Send 動態路由）。"
date: "2026-08-12"
author: "TopDigg"
tags: ["LangGraph", "Graph Engineering", "AI Agent", "Agent Architecture", "LangChain", "Loop Engineering", "Multi-Agent", "Orchestration", "State Machine", "Cognitive Architecture", "Harness", "Agentic Systems"]
categories: ["Deep Dive"]
keywords: ["LangGraph", "圖工程", "Graph Engineering", "AI Agent", "Agent 架構", "LangChain", "循環工程", "Loop Engineering", "多智慧體", "Multi-Agent", "編排", "狀態機", "State Machine", "認知架構", "Cognitive Architecture", "Send API", "Map-Reduce", "Harrison Chase", "確定性", "Agentic"]
---

# LangGraph 深度解析：三年圖工程實踐總結——用圖構建可靠 Agent 的完整指南

> 核心思想：**把 agentic 系統表示為圖（graph），讓您作為建構者把對系統應如何運作的預判強加進更受限的路徑，而不是僅僅依賴 LLM 的判斷。** 圖工程（graph engineering）是繼 prompt engineering、context engineering、harness engineering、loop engineering 之後，來自 X 的 AI 內容工廠的最新術語。術語雖多，但背後的原因很實在：**讓 LLM 幹活很難**——它們是一種新型的、非魯棒的、非確定性的軟體，我們不斷嘗試新策略讓它們工作，於是新策略催生新術語。LangGraph 正是基於這一直覺在三年前建構的框架，如今**月下載量 65M+**，被新創公司與大企業共同使用。它流行的原因是找到了一個平衡：**確定性路徑與 agentic 步驟之間的平衡**。用圖表示系統，本質是在編碼您的世界知識——就像 prompt 攜帶的領域知識讓您的 agent 區別於通用 ChatGPT 一樣，圖這種「認知架構」同樣攜帶領域知識。結果就是程式碼與模型推理協同工作：**模型在它增值的地方推理，程式碼處理其餘部分，於是 agent 更便宜、更快、更可預測。**

---

## 一、背景：圖工程這個術語從哪來

### 1.1 術語的誕生

「圖工程（graph engineering）」是 2026 年 7 月那個週末浮出水面的，由 Peter Steinberger 的一條推文引爆。它是 X 的 AI 內容工廠產出的最新術語，接在 prompt engineering（提示工程）、context engineering（上下文工程）、harness engineering（框架工程）、loop engineering（循環工程）之後。

雖然把這些術語稱為「流行詞（buzzwords）」既誘人又準確，但它們存在並且湧現是有原因的：**它們確實描述了建構者面對的真實挑戰與設計決策**。

### 1.2 為什麼有這麼多術語

歸根結底，目標是駕馭 LLM 的力量為我們做有用的事。無論您用 prompt、agent、loop 還是 graph，那些都只是實現細節。之所以存在這麼多術語，是因為**讓 LLM 幹活很難**：

- 它們是一種新型的**非魯棒（non-robust）、非確定性（non-deterministic）**軟體
- 我們不斷嘗試新策略讓它們可靠地工作
- 新策略 → 新術語

### 1.3 流行詞之外：圖為什麼是合理的

拋開流行詞不談，**把 agentic 系統表示為圖是一個非常合理的駕馭 LLM 的方式**。具體來說：

> 圖允許您（建構者）把對系統應如何運作的**預判（preconceptions）**強加進更受限的路徑，而不是僅僅依賴 LLM 的判斷。更具體地說，它讓您在希望 agent 走特定路徑時更緊密地控制行為。

正是這個直覺，驅動 LangChain 團隊在三年前建構了 LangGraph，作為一個幫助建構這類 agentic 系統的框架。

### 1.4 關鍵資料

| 指標 | 資料 |
|------|------|
| 發布時間 | 約三年前（2023 年左右） |
| 目前月下載量 | 65M+ 次/月 |
| 使用者 | 新創公司與大企業 |
| 核心賣點 | 確定性路徑與 agentic 步驟的平衡 |
| 建構者 | LangChain 團隊（Harrison Chase 等） |

---

## 二、專案說明：LangGraph 是什麼

### 2.1 一句話定位

LangGraph 是一個**用圖（graph）來建構、管理和部署長期執行、有狀態（stateful）agent 的底層編排框架與執行時期**。

### 2.2 與其它 agent 框架的區別

市面上有無數 agent 框架，LangGraph 之所以流行，是因為它**在確定性路徑（deterministic paths）與 agentic 步驟（agentic steps）之間取得了平衡**：

- 太自由的框架（純 agent 循環）：模型自己決定一切，行為不可預測
- 太僵硬的框架（純流水線）：無法處理開放性任務，模型能力被浪費
- LangGraph：**把結構編碼成圖，把自由留給節點內部**——該確定的地方確定，該 agentic 的地方 agentic

### 2.3 三年實踐總結的定位

這篇文章是 LangChain 團隊（Harrison Chase 與 Sydney Runkle）在 2026 年 7 月 22 日發布的官方總結，標題《3 Years of Graph Engineering with LangGraph》——一句話概括：**三年來我們一直在用圖建構 agentic 系統，以下是學到的經驗。**

---

## 三、詳細教學：如何把 Agent 建模成圖

### 3.1 圖的三要素

把 agent 建模成圖，本質上是定義一個**狀態機（state machine）**：

| 要素 | 作用 | 內容 |
|------|------|------|
| **節點（Nodes）** | 做事 | 確定性程式碼、單個 LLM 呼叫、工具呼叫，或一個帶內部循環的完整 agent |
| **邊（Edges）** | 定義下一步發生什麼 | 確定性邊（固定流轉）；條件邊（基於節點結果、目前狀態或外部訊號） |
| **狀態（State）** | 在圖裡流動的資料 | 在圖定義的流程中穿行，連接各步驟 |

您可以這樣理解：**圖定義工作流，狀態在工作流中流動，邊定義步驟之間的轉換。**

### 3.2 最小範例：一個帶分類的知識庫 agent

這是原文給出的核心案例：一個知識庫 agent，使用三個子 agent 搜尋：

- **GitHub agent**：搜尋程式碼、issue、pull request
- **Notion agent**：搜尋內部文件與 wiki
- **Slack agent**：搜尋相關執行緒

工作流有三個固定階段：**分類（classify）→ 搜尋（search）→ 綜合（synthesize）**。

用 LangGraph 的 Python API 建模大致如下：

```python
from langgraph.graph import StateGraph, END
from typing import TypedDict, Literal

class AgentState(TypedDict):
    query: str
    source: Literal["github", "notion", "slack"]
    results: list

def classify(query: str) -> str:
    """分類節點：決定問題屬於哪個知識源（模型單次呼叫，無工具）"""
    # 用 LLM 判斷：程式碼問題 → github；內部文件 → notion；討論 → slack
    return "github"  # 範例回傳值

def search_github(state: AgentState) -> AgentState:
    """搜尋節點：GitHub agent 在程式碼/issue/PR 中搜尋"""
    return {**state, "results": search_code(state["query"])}

def search_notion(state: AgentState) -> AgentState:
    """搜尋節點：Notion agent 在內部文件/wiki 中搜尋"""
    return {**state, "results": search_docs(state["query"])}

def search_slack(state: AgentState) -> AgentState:
    """搜尋節點：Slack agent 在相關執行緒中搜尋"""
    return {**state, "results": search_threads(state["query"])}

def synthesize(state: AgentState) -> AgentState:
    """綜合節點：把搜尋結果合成最終答案（模型單次呼叫）"""
    return state

# 建構圖
graph = StateGraph(AgentState)
graph.add_node("classify", classify)
graph.add_node("github", search_github)
graph.add_node("notion", search_notion)
graph.add_node("slack", search_slack)
graph.add_node("synthesize", synthesize)

graph.add_edge("classify", "github")   # 確定性邊範例（也可改為條件邊）
graph.add_edge("classify", "notion")
graph.add_edge("classify", "slack")
graph.add_edge("github", "synthesize")
graph.add_edge("notion", "synthesize")
graph.add_edge("slack", "synthesize")
graph.add_edge("synthesize", END)

app = graph.compile()
```

這個流程是**扇出再綜合（fan-out and synthesize）**：一個輸入分發給多個並行搜尋者，再把所有結果匯聚到綜合步驟。

### 3.3 什麼時候應該用圖

真實世界的 agent 工作流通常有**可預測的結構**：

- **支援 agent**：先分類問題，再回答或升級
- **編碼 agent**：先檢查儲存庫，再提議改動
- **合規工作流**：先獲得審批，再採取外部行動

圖讓您**直接把這種結構編碼進去**：哪些路徑合法、哪裡讓模型選擇、哪裡應該由系統強制執行確定性行為而不是指望模型每次做對。

> **關鍵洞察**：透過把系統表示為圖，您在編碼自己對系統應如何運作的**世界知識（world knowledge）**。就像 prompt 攜帶領域知識讓 agent 區別於通用 ChatGPT，圖這種「認知架構（cognitive architecture）」同樣攜帶領域知識。

**用圖的收益**：程式碼與模型推理協同工作——模型在它增值的地方推理，程式碼處理其餘部分，於是 agent **更便宜、更快、更可預測**。

### 3.4 什麼時候不應該用圖

有些任務天然更 agentic，強行塞進確定性路徑是錯誤的選擇。這時您不想把系統表示為圖，而是直接用 **agent harness（agent 框架/容器）**，比如 LangChain 的 **Deep Agents**。

**典型例子：通用深度研究（deep research）**。研究 agent 需要規劃、委派、搜尋、閱讀、綜合，這些方式很難提前固定下來。原文透露：

- LangChain 早期用**預定義的 LangGraph 工作流**建構深度研究
- 後來遷移到**更 agentic 的核心循環（core loop）**
- 知名開源實作 **GPT Researcher** 也做了同樣的遷移：把圖狀的多 agent 流水線換成了 Deep Agents，讓規劃、委派、上下文管理**在 harness 中湧現（emerge）**，而不是硬編碼在圖中

> **決策法則**：工作流結構可預測 → 用圖，把結構顯式化；工作流本質是開放式探索 → 用 agent harness，讓結構湧現。

### 3.5 進階：動態轉換與 map-reduce

您並不總是想在建構時就定義每一條邊。有時一個節點需要在執行時期決定要產生多少工作。**Map-reduce 是經典場景**：

> 把輸入拆成若干片段，每個片段發給一個 worker，再把結果合併。worker 的數量取決於輸入，您事先並不知道這個數量。

LangGraph 用 **`Send` API** 處理這種情況——它讓一個節點動態地把工作路由到一個或多個下游節點，**無需靜態定義每條轉換**：

```python
from langgraph.types import Send

def continue_to_sources(state):
    """動態分發：根據輸入決定產生多少搜尋任務"""
    return [
        Send("search", {"query": q})
        for q in split_into_queries(state["input"])
    ]

# 圖中：source_router 節點用 Send 把工作扇出到多個 search 節點，
# search 完成後匯聚到 synthesize 節點
```

這很重要，因為**有用的 agent 系統混合了已知結構與執行時期可變性**：

- 您可能知道研究應該扇出再綜合，但不知道會有多少個來源
- 您可能知道 supervisor 應該委派給 workers，但不知道具體委派給誰，直到任務開始
- **圖在執行時期仍然需要靈活性**

---

## 四、什麼才是真正的新東西

### 4.1 不是圖本身，而是節點裡能裝什麼

把 agentic 系統表示為圖並不是新事——LangChain 已經做了三年！那麼這波「圖工程」浪潮裡，真正改變的是什麼？

一種寬厚的解釋：**改變的是節點裡能放什麼**。

- **早期**：節點是確定性程式碼或單個 LLM 呼叫
- **現在**：agent 本身已經足夠可靠，可以託付真實工作——**一個節點可以是一次完整的 agent 執行（agent run）**。您在編排 agent，而不只是編排 LLM 呼叫

### 4.2 編碼 agent 作為節點：新近實用的模式

**編碼 agent（coding agents）**是當今生產環境中最高效、最有影響力的 agent 之一。把一個編碼 agent 作為節點嵌入更大的圖，是一個**新近才變得實用的模式**。

**案例：docs agent（文件 agent）**。它把一個 Slack 請求：

> 比如：「請為我們的自訂工具新增文件」

變成一份**可以評審的 pull request**。這個圖中每個節點都位於**確定性到 agentic 的光譜**上不同的位置：

| 步驟類型 | 內容 | 例子 |
|---------|------|------|
| **固定步驟（Fixed steps）** | 設定程式碼與 API 呼叫 | Slack 與 Linear 操作 |
| **模型步驟（Model steps）** | 單個 LLM 呼叫，無工具 | 分類器、綜合步驟 |
| **Agent 步驟（Agent steps）** | 更開放的工作 | reference docs agent、conceptual docs agent 在各自程式碼庫中完成開放工作 |

> **核心洞察**：這裡確定性與自主性的混合，正是這個 docs agent **可預測、強大、高效**的原因。

---

## 五、設計哲學：LangGraph 與圖工程的世界觀

### 5.1 圖是認知架構

LangGraph 背後的設計哲學，核心主張是：

> **透過把系統表示為圖，您是在編碼自己關於系統應如何運作的世界知識。** 就像 prompt 攜帶領域知識讓您的 agent 區別於通用 ChatGPT 一樣，圖這種「認知架構」同樣攜帶領域知識。

**推論**：一個精心設計的圖，本身就是領域知識的一種可執行形態——它把「系統應該如何運作」從模型的黑箱判斷中解放出來，變成建構者可以審視、調整、驗證的顯式結構。

### 5.2 確定性路徑與 agentic 步驟的平衡

LangGraph 存在的理由，就是**在確定性路徑與 agentic 步驟之間找到平衡**：

- 不是「全自動」——某些路徑必須強制，不能讓模型自由發揮
- 不是「全流水線」——節點內部允許 agentic 自由
- **原則：該確定的地方確定，該自主的地方自主，自由度收在節點內部**

### 5.3 循環是簡單的圖

LangGraph 團隊三年的第一手經驗是：**loop engineering 不是 graph engineering 的替代品，而是它的簡化版**。正如 XState 作者 David Khourshid 所說：「循環就是一個有向的、循環的圖（a loop is just a directed, cyclic graph）。」

最有力的證據：**LangChain 框架本身（基於一個簡單的 agentic 循環）就是建構在 LangGraph 之上的。**

### 5.4 模型在它增值的地方推理

圖工程的最終哲學目標是**成本與可預測性的最佳化**：

> 程式碼與模型推理協同工作：模型在它增值的地方推理，程式碼處理其餘部分，於是 agent 更便宜、更快、更可預測。

**不要**讓模型做它不擅長的固定邏輯；**要**讓模型在判斷、綜合、開放式理解上發揮。圖是把這兩種能力精確分層的工具。

---

## 六、三年實踐經驗總結：學到的三件事

### 6.1 第一，agent 圖通常不是 DAG

生產級 agent 需要**循環（cycles）**：

- 重試失敗的工具呼叫
- 向使用者詢問缺失的資訊
- 驗證後修訂答案
- 反覆呼叫工具直到擁有足夠上下文
- 暫停等待人工輸入後再繼續

**循環是 agentic 系統的核心組成部分**，所以 agent 圖大概率不是 DAG（有向無環圖）。

### 6.2 第二，循環是簡單的圖

- loop engineering 不是 graph engineering 的替代品，而是它的**簡單版本**
- 一個循環 = 一個有向、循環的圖
- LangChain（基於簡單 agentic 循環的框架）建構在 LangGraph 之上——**最簡單的圖就是 LangGraph 能表達的**，兩者不是對立關係，而是包含關係

### 6.3 第三，動態轉換很重要

- 您不需要在建構時定義每一條邊
- 有時節點在執行時期決定要建立多少工作（map-reduce）
- **Send API** 讓節點動態路由工作，無需靜態定義每條轉換
- 有用的 agent 系統 = **已知結構 + 執行時期可變性**的混合

---

## 七、歸納總結：核心觀點與結論

### 7.1 核心觀點清單

1. **術語多 ≠ 炒作**：graph engineering 等術語描述了建構者真實面對的設計決策；它們存在是因為讓 LLM 幹活很難
2. **圖是合理的典範**：圖讓您把預判強加進受限路徑，在需要控制時更緊密地控制行為——這是 LangGraph 存在的理由
3. **平衡是 LangGraph 流行的原因**：確定性路徑與 agentic 步驟之間的平衡，讓它區別於其它 agent 框架
4. **圖編碼世界知識**：圖是認知架構，與 prompt 一樣攜帶領域知識，是可執行的領域知識形態
5. **有結構的任務用圖**：支援分類、編碼檢查、合規審批——這些有可預測結構的工作流，直接用圖編碼
6. **開放任務用 harness**：深度研究這類天然 agentic 的任務，用 agent harness（Deep Agents），讓規劃/委派/上下文管理湧現
7. **agent 圖不是 DAG**：循環（重試、詢問、修訂、暫停）是 agentic 系統的核心
8. **循環是簡單的圖**：LangChain 建構在 LangGraph 之上，兩者是包含而非對立關係
9. **動態轉換是剛需**：執行時期才知道工作量（map-reduce），需要 Send API 這樣的動態路由
10. **真正的變化在節點內部**：現在節點可以是完整 agent 執行——您在編排 agent，不只是 LLM 呼叫
11. **編碼 agent 是新的實用節點**：docs agent 案例展示了確定性到 agentic 光譜上的節點混合
12. **模型在它增值的地方推理**：最終目標是更便宜、更快、更可預測的 agent

### 7.2 決策速查表

| 場景 | 選擇 | 理由 |
|------|------|------|
| 工作流結構可預測（分類→回應/升級） | 圖（LangGraph） | 直接編碼合法路徑 |
| 需要確定性控制（合規審批） | 圖（LangGraph） | 系統強制執行而非指望模型 |
| 需要執行時期扇出（map-reduce） | 圖 + Send API | 動態路由不靜態預定義 |
| 開放式探索（深度研究） | agent harness（Deep Agents） | 規劃/委派/上下文管理湧現 |
| 單 agent 循環 | 圖的最簡形式 | 循環就是有向循環圖 |
| 節點內部要自由度 | 節點內放 agent | 編排 agent 而非僅 LLM 呼叫 |

### 7.3 對建構者的啟示

1. **先想結構，再寫程式碼**：開工前問自己——這個工作流哪裡是可預測的？哪裡必須讓模型自由？把可預測的部分顯式化成圖
2. **不要迷信圖**：如果任務是開放式探索，圖不是答案，harness 才是
3. **擁抱循環**：重試、詢問、修訂不是異常，是 agentic 系統的常態，圖必須支援它們
4. **把自由度放在正確層級**：該確定的路徑強制，該自主的步驟留在節點內部

---

## 八、延伸閱讀

- [LangGraph 文件](https://docs.langchain.com/oss/python/langgraph/overview)
- [什麼是認知架構（Cognitive Architectures）](https://www.langchain.com/blog/what-is-a-cognitive-architecture)
- [循環工程的藝術（The Art of Loop Engineering）](https://www.langchain.com/blog/the-art-of-loop-engineering)
- [agent harness 解剖（The Anatomy of an Agent Harness）](https://www.langchain.com/blog/the-anatomy-of-an-agent-harness)
- [如何建構自訂 agent harness](https://www.langchain.com/blog/how-to-build-a-custom-agent-harness)
- [Deep Agents vs LangChain vs LangGraph](https://www.langchain.com/blog/deep-agents-vs-langchain-vs-langgraph)

---

*本文基於 LangChain 官方部落格《3 Years of Graph Engineering with LangGraph》（Sydney Runkle & Harrison Chase，2026-07-22）深度解析與二次創作。*
