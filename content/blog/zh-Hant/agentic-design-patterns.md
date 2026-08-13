---
title: "Agentic Design Patterns：建構智慧系統的AI Agent設計模式完整指南"
date: "2026-08-13"
description: "深入探索 Agentic Design Patterns 專案，了解 AI Agent 的核心設計模式，包括提示鏈、路由、反思、工具使用、規劃、多智慧體協作等關鍵概念。"
tags: ["AI Agent", "Agentic Design Patterns", "人工智慧", "設計模式", "LangChain", "AutoGPT", "AutoGen", "CrewAI"]
categories: ["AI", "Machine Learning", "Agent Systems"]
author: "evoiz"
authorUrl: "https://github.com/evoiz"
source: "https://github.com/evoiz/Agentic-Design-Patterns"
sourceName: "Agentic Design Patterns GitHub Repository"
stars: 2400
forks: 405
---

# Agentic Design Patterns：建構智慧系統的AI Agent設計模式完整指南

## 專案介紹與概述

[Agentic Design Patterns](https://github.com/evoiz/Agentic-Design-Patterns) 是一個基於 Antonio Gulli 所著《Agentic Design Patterns: A Hands-On Guide to Building Intelligent Systems》的開源學習倉庫。該專案由 **evoiz** 建立並維護，目前已在 GitHub 上獲得 **2.4k Stars** 和 **405 Forks**，成為 AI Agent 設計與實現領域的重要學習資源。

### 專案規模

全書共 **424 頁**，涵蓋 **21 個章節** 和 **7 個附錄**，形成了一套完整的 AI Agent 設計知識體系。無論是初學者還是資深開發者，都能從中獲得系統性的指導和實踐啟發。

### 核心特色

- **慈善公益**：作者將所有版稅捐給 Save the Children，展現了技術人的社會責任感
- **漸進式學習路徑**：從基礎概念到進階應用，循序漸進
- **實戰導向**：程式碼與理論緊密結合，支援 Jupyter Notebook 互動式學習
- **框架覆蓋廣泛**：涵蓋 LangChain、AutoGPT、AutoGen、CrewAI 等主流框架

## 核心設計哲學

### 什麼是 Agentic Design Patterns？

Agentic Design Patterns（智慧體設計模式）是建構 AI Agent 系統的核心方法論。它不僅僅關注單一模型的能力，而是探討如何設計多個元件、工具和決策流程的協同工作方式，使 AI 系統能夠：

- **自主執行複雜任務**：將複雜任務分解為可管理的步驟
- **動態選擇最優策略**：根據上下文智慧路由和決策
- **反思與改進**：評估自身輸出並持續優化
- **協作解決問題**：多個智慧體協同工作

### 為什麼 Agentic Design Patterns 重要？

隨著大語言模型（LLM）能力的不斷增強，單一模型的局限性日益明顯。Agentic Design Patterns 提供了一套系統化的方法，幫助開發者：

1. **突破單一模型瓶頸**：透過組合多個專業能力建構更強大的系統
2. **實現複雜任務自動化**：將人類專家級別的推理能力融入自動化流程
3. **提高系統可靠性**：透過反思和驗證機制減少錯誤輸出
4. **支援企業級應用**：提供生產環境所需的安全性和可觀測性

## 詳細學習路徑：四類模式體系

Agentic Design Patterns 將內容組織為四大類別，形成從入門到專家的完整學習路徑：

| 類別 | 章節 | 核心理念 |
|------|------|----------|
| **核心模式** | 第1-7章 | 建構基礎能力：鏈式處理、路由選擇、平行執行 |
| **進階模式** | 第8-11章 | 增強智慧：記憶、學習、協議、監控 |
| **生產模式** | 第12-14章 | 保障可靠性：異常處理、人機協作、知識檢索 |
| **企業模式** | 第15-21章 | 規模化部署：通訊、優化、推理、安全 |

---

## 各模式詳解

### 第一部分：核心模式（第1-7章）

#### 1. 提示鏈（Prompt Chaining）

提示鏈是最基礎的 Agentic 模式之一。它將複雜任務分解為多個簡單步驟，每個步驟由一個專門的提示詞驅動。

**工作原理：**
```
輸入 → 步驟1（提示A）→ 步驟2（提示B）→ 步驟3（提示C）→ 最終輸出
```

**應用場景：**
- 內容審核：先分類，再提取關鍵詞，最後生成報告
- 文件處理：先解析結構，再提取實體，最後進行情感分析
- 複雜問答：先理解問題，再檢索資訊，最後生成答案

**程式碼範例：**

```python
from langchain.chains import LLMChain
from langchain.prompts import PromptTemplate

# 第一步：理解使用者意圖
intent_chain = LLMChain(
    llm=llm,
    prompt=PromptTemplate(
        template="分析以下使用者查詢的意圖：{query}",
        input_variables=["query"]
    )
)

# 第二步：生成回應
response_chain = LLMChain(
    llm=llm,
    prompt=PromptTemplate(
        template="基於意圖 '{intent}'，回答使用者問題：{query}",
        input_variables=["intent", "query"]
    )
)

# 組合鏈式呼叫
intent = intent_chain.run(query)
final_response = response_chain.run(intent=intent, query=query)
```

#### 2. 路由（Routing）

路由模式根據輸入特徵將請求分發到不同的處理路徑。這是實現專業化處理和效率優化的關鍵模式。

**核心價值：**
- **專業化處理**：不同類型的問題交給最擅長的處理單元
- **資源優化**：簡單問題快速處理，複雜問題深入分析
- **負載均衡**：分散請求壓力，提高系統吞吐量

**路由策略：**
1. **基於規則的路由**：關鍵詞匹配、問題類型分類
2. **基於模型的路由**：使用分類模型判斷輸入類型
3. **基於 Embedding 的路由**：計算語義相似度進行匹配

#### 3. 平行化（Parallelization）

平行化模式透過同時執行多個任務來提高效率和吞吐量。這在處理獨立子任務時特別有效。

**兩種模式：**

**a) 發散平行（Divergent Parallelization）：**
```
單一輸入 → 多個平行處理 → 結果聚合
例如：一篇文章同時進行摘要、情感分析、關鍵詞提取
```

**b) 收斂平行（Convergent Parallelization）：**
```
多個輸入 → 單一處理 → 聚合結果
例如：多源資訊綜合判斷、多角度分析整合
```

```python
from langchain.chains import ParallelChain

# 平行執行多個獨立任務
parallel_result = ParallelChain(
    chains=[summary_chain, sentiment_chain, keyword_chain],
    verbose=True
).run(input_document)
```

#### 4. 反思（Reflection）

反思模式使 Agent 能夠評估自身的輸出，識別錯誤，並進行自我改進。這是實現高品質輸出的關鍵機制。

**反思機制：**
1. **自檢輸出**：檢查輸出的一致性和準確性
2. **多角度驗證**：從不同維度驗證結果
3. **迭代改進**：基於回饋不斷優化輸出

**程式碼框架：**

```python
class ReflectiveAgent:
    def __init__(self, llm):
        self.llm = llm
        self.max_iterations = 3

    def generate_with_reflection(self, task):
        # 初始生成
        output = self.generate(task)

        # 反思循環
        for iteration in range(self.max_iterations):
            # 評估輸出品質
            evaluation = self.evaluate(task, output)

            if evaluation["passed"]:
                return output

            # 基於回饋改進
            output = self.improve(task, output, evaluation["feedback"])

        return output
```

#### 5. 工具使用（Tool Use）

工具使用模式使 Agent 能夠呼叫外部工具和 API，擴展其能力邊界。這是實現真正智慧行為的關鍵。

**常見工具類型：**
- **搜尋工具**：Google 搜尋、Bing 搜尋、Wikipedia 查詢
- **程式碼執行**：Python 解譯器、程式碼沙箱
- **資料庫查詢**：SQL 查詢、向量資料庫檢索
- **檔案操作**：讀取、寫入、編輯文件
- **API 呼叫**：天氣查詢、地圖服務、支付介面

```python
from langchain.agents import initialize_agent, Tool

# 定義工具
tools = [
    Tool(
        name="web_search",
        func=search_api.run,
        description="用於搜尋最新資訊的工具"
    ),
    Tool(
        name="calculator",
        func=calculate,
        description="用於數學計算的工具"
    ),
    Tool(
        name="knowledge_base",
        func=query_kb.run,
        description="用於查詢內部知識庫的工具"
    )
]

# 初始化 Agent
agent = initialize_agent(
    tools,
    llm,
    agent="zero-shot-react-description",
    verbose=True
)
```

#### 6. 規劃（Planning）

規劃模式使 Agent 能夠將複雜任務分解為可執行的步驟序列，並按計劃執行。這是實現自主行為的核心能力。

**規劃流程：**
1. **目標理解**：明確最終目標
2. **任務分解**：將目標分解為子任務
3. **依賴分析**：確定任務間的依賴關係
4. **執行調度**：按計劃執行任務
5. **動態調整**：根據執行結果調整計劃

```python
class PlanningAgent:
    def create_plan(self, goal):
        # 使用 LLM 生成任務計劃
        prompt = f"""
        目標：{goal}

        請將這個目標分解為具體的執行步驟，
        並說明每個步驟的輸入、輸出和依賴關係。
        """

        plan = self.llm.generate(prompt)

        # 解析計劃並建構執行圖
        return self.build_execution_graph(plan)

    def execute_plan(self, plan):
        for step in plan.steps:
            if self.can_execute(step):
                self.execute(step)
            else:
                # 處理依賴未滿足的情況
                self.wait_for_dependencies(step)
```

#### 7. 多智慧體（Multi-Agent）

多智慧體模式是最高級的核心模式，它允許多個專業智慧體協同工作，共同解決複雜問題。

**協作模式：**

1. **層次結構**：一個主 Agent 協調多個子 Agent
2. **平等協作**：多個 Agent 平等分工，協作解決問題
3. **競爭機制**：多個 Agent 競爭資源或提出最佳方案

**框架範例：**

```python
# 使用 CrewAI 的多智慧體協作
from crewai import Agent, Task, Crew

# 定義專業 Agent
researcher = Agent(
    role="研究員",
    goal="提供準確、全面的研究資訊",
    backstory="專業的市場研究員，擅長資料收集和分析"
)

analyst = Agent(
    role="分析師",
    goal="基於研究資料提供策略建議",
    backstory="資深策略分析師，具有豐富的行業經驗"
)

writer = Agent(
    role="撰稿人",
    goal="將分析結果轉化為清晰的報告",
    backstory="專業商業撰稿人，擅長資料視覺化表達"
)

# 建立任務
research_task = Task(description="研究市場趨勢", agent=researcher)
analysis_task = Task(description="分析競爭格局", agent=analyst)
writing_task = Task(description="撰寫報告", agent=writer)

# 組建團隊並執行
crew = Crew(
    agents=[researcher, analyst, writer],
    tasks=[research_task, analysis_task, writing_task],
    process="hierarchical"  # 層次化流程
)

result = crew.kickoff()
```

---

### 第二部分：進階模式（第8-11章）

#### 8. 記憶管理（Memory Management）

記憶管理使 Agent 能夠跨對話保持上下文，記住重要資訊，並有效利用歷史資料。

**記憶類型：**
- **短期記憶**：目前對話上下文
- **長期記憶**：持久化儲存的知識點
- **情景記憶**：特定經歷和事件的記錄
- **語義記憶**：結構化和知識

#### 9. 學習適應（Learning Adaptation）

學習適應模式使 Agent 能夠從經驗中學習，持續改進自身效能。

**適應機制：**
- **少樣本學習**：從少量範例中快速學習
- **強化學習**：透過獎勵信號優化行為
- **主動學習**：選擇性標註和學習

#### 10. MCP 協議（Model Context Protocol）

MCP 是一種標準化的協議，用於 Agent 與外部系統之間的上下文交換和功能呼叫。

**核心概念：**
- **上下文注入**：將外部資訊注入模型上下文
- **工具註冊**：標準化工具的發現和呼叫機制
- **結果回傳**：將執行結果回饋給 Agent

#### 11. 目標監控（Goal Monitoring）

目標監控使 Agent 能夠追蹤任務進度，識別偏差，並在偏離目標時進行糾正。

**監控維度：**
- **進度追蹤**：任務完成度監控
- **品質監控**：輸出品質評估
- **風險預警**：識別潛在問題和風險

---

### 第三部分：生產模式（第12-14章）

#### 12. 異常處理（Exception Handling）

生產環境中的異常處理確保系統的穩定性和可靠性。

**異常分類：**
- **輸入異常**：格式錯誤、無效輸入
- **處理異常**：超時、資源耗盡
- **輸出異常**：結果不符合預期
- **系統異常**：服務不可用、權限問題

#### 13. 人機協作（Human-Agent Collaboration）

人機協作模式在自動化和人為干預之間找到最佳平衡點。

**協作模式：**
1. **人類在環（Human-in-the-loop）**：關鍵決策由人類確認
2. **人類在控制（Human-on-the-loop）**：人類監控系統執行
3. **人類在終點（Human-at-the-end）**：結果由人類最終審核

#### 14. RAG 知識檢索（Retrieval-Augmented Generation）

RAG 結合了檢索和生成的優勢，使 Agent 能夠利用外部知識庫。

**RAG 流程：**
```
使用者查詢 → 檢索相關文件 → 將文件加入上下文 → 生成回應
```

---

### 第四部分：企業模式（第15-21章）

企業模式涵蓋大規模部署所需的高級功能：

- **智慧體通訊**：Agent 間的高效通訊協議
- **資源優化**：計算資源和成本的優化策略
- **推理技術**：高效推理和模型優化技術
- **安全護欄**：防止濫用和有害輸出
- **評估監控**：系統效能的持續監控和評估

---

## 框架與工具

### LangChain

LangChain 是最流行的 Agent 建構框架之一，提供了豐富的元件和工具。

**核心優勢：**
- 模組化設計，靈活組合
- 豐富的工具整合
- 強大的鏈式呼叫能力
- 活躍的社群支援

**適用場景：**
- 快速原型開發
- 複雜鏈式處理
- RAG 應用建構

### AutoGPT

AutoGPT 是自主 Agent 的代表，展示了 AI Agent 自主完成複雜任務的能力。

**核心特點：**
- 目標驅動的自主執行
- 自動子任務分解
- 內省機制
- 持久化記憶

### AutoGen

AutoGen 是微軟開發的多智慧體協作框架。

**核心優勢：**
- 原生多智慧體支援
- 靈活的對話模式
- 程式碼執行能力
- 人類互動支援

### CrewAI

CrewAI 專注於多智慧體協作，特別適合任務分解和平行執行。

**核心特點：**
- 角色基礎的 Agent 設計
- 任務分配和依賴管理
- 層次化和平行處理
- 易於使用的 API

---

## 關鍵觀點總結

### 核心要點

1. **設計模式的價值**：Agentic Design Patterns 提供了一套經過驗證的解決方案，幫助開發者避免重複造輪子。

2. **漸進式複雜度**：從簡單的提示鏈到複雜的多智慧體系統，學習路徑設計合理，層層遞進。

3. **理論與實踐結合**：每個模式都有對應的程式碼實現和 Jupyter Notebook，支援邊學邊做。

4. **框架無關性**：雖然專案使用了多個框架來示範，但核心概念適用於任何 Agent 框架。

5. **社群驅動**：開源特性使得全球開發者能夠貢獻程式碼、分享經驗。

### 實踐建議

- **從小開始**：先理解核心模式，再逐步嘗試進階模式
- **動手實踐**：使用 Jupyter Notebook 執行範例程式碼
- **選擇合適框架**：根據專案需求選擇最適合的框架
- **關注安全性**：在生產環境中始終考慮安全護欄
- **持續學習**：AI 領域發展迅速，保持學習更新

---

## 快速開始

### 環境準備

```bash
# 複製倉庫
git clone https://github.com/evoiz/Agentic-Design-Patterns.git
cd Agentic-Design-Patterns

# 建立虛擬環境
python -m venv venv
source venv/bin/activate  # Linux/Mac
# 或
.\venv\Scripts\activate  # Windows

# 安裝依賴
pip install jupyter notebook pandas numpy openai langchain
```

### 啟動 Jupyter Notebook

```bash
jupyter notebook
```

然後在瀏覽器中開啟 Notebook，按照教學一步步學習和實踐。

---

## 結語

Agentic Design Patterns 專案為 AI Agent 開發提供了一份全面的學習指南。透過系統性地介紹從基礎到進階的設計模式，它幫助開發者建構更智慧、更可靠的 AI 系統。無論你是 AI 領域的新人還是資深開發者，這個專案都值得深入探索。

專案的慈善性質更增添了社會價值——學習知識的同時，也在為全球兒童福祉做出貢獻。

**專案連結**：[https://github.com/evoiz/Agentic-Design-Patterns](https://github.com/evoiz/Agentic-Design-Patterns)

**參考書籍**：《Agentic Design Patterns: A Hands-On Guide to Building Intelligent Systems》 by Antonio Gulli
