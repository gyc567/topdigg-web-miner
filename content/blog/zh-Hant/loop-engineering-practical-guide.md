---
title: "Loop Engineering 實戰指南：如何構建能自我改進的 AI Agent 循環系統"
description: "基於 @elune0x 的 X 熱文（373K 閱讀）深度解析 Loop Engineering——2026 年 AI Agent 開發的範式轉移。核心思想：你不需要再手動提示 AI，你需要設計一個自動提示 AI 的系統。包含四種循環類型（Heartbeat/Cron/Hook/Goal）、五大核心組件（Worktrees/Skills/Connectors/Subagents/State）、模型路由成本優化（60-80% 降幅）、常見失敗模式與防護，以及完整的實戰教程。從設計哲學到代碼示例，一文講透。"
date: "2026-08-04"
author: "TopDigg Research Team"
tags: ["Loop Engineering", "AI Agent", "Automation", "Claude Code", "Codex", "MCP", "Subagents", "DevTools", "Prompt Engineering"]
categories: ["Deep Dive"]
keywords: ["Loop Engineering", "AI Agent", "循環工程", "自動化", "Claude Code", "Codex", "MCP", "子代理", "Heartbeat", "Cron", "Hook", "Goal", "Worktrees", "Skills"]
---

# Loop Engineering 實戰指南：如何構建能自我改進的 AI Agent 循環系統

> 核心思想：**你不需要再手動提示 AI——你需要設計一個自動提示 AI 的系統。** @elune0x 的這篇 X 熱文（373K 閱讀、318 收藏）揭示了 2026 年 AI Agent 開發的範式轉移：從「人寫提示詞 → AI 執行」到「人設計循環 → 循環自動提示 AI → AI 自主執行 → 循環自動驗證」。Loop Engineering 的核心是**四種循環類型**（Heartbeat/Cron/Hook/Goal）+ **五大核心組件**（Worktrees/Skills/Connectors/Subagents/State），配合模型路由將成本降低 60-80%，讓 AI 代理從「需要人提示」變成「自主運行並自我改進的系統」。

---

## 一、專案說明

### 1.1 這篇 X 熱文說了什麼？

2026 年 7 月 22 日，@elune0x 發布了一篇題為「Loop Engineering: How to Build Agents That Improve Their Own Work」的 X 文章，獲得 **373K 閱讀、318 收藏**。這不是一個新工具的發布，而是一種**新工作範式**的定義——Loop Engineering（循環工程）。

### 1.2 關鍵數據

- 作者：**@elune0x**（elune，growth @kollectivexyz）
- 發布時間：2026-07-22
- 閱讀量：**373K**
- 收藏數：**318**
- 點讚數：**117**
- 引用數：**22**
- 轉推數：**11**

### 1.3 它解決什麼問題？

2026 年 AI Agent 開發的最大轉變不是新模型，而是**使用模型的新方式**。傳統做法：人寫提示詞 → AI 執行 → 人檢查 → 人再寫提示詞。這個循環需要人類持續參與，效率低下。Loop Engineering 的答案：**設計一個循環系統**——定義排程頻率、停止條件、狀態持久化、隔離執行，讓 AI 代理按照你設計的循環自主運行，並在運行中不斷自我改進。

---

## 二、核心思想

### 2.1 從「提示詞工程」到「循環工程」

傳統做法：人寫提示詞 → AI 執行 → 人檢查 → 人再寫提示詞。Loop Engineering 的做法：人設計循環 → 循環自動提示 AI → AI 自主執行 → 循環自動驗證 → 循環自動記錄。**人從「提示者」變成「系統設計者」**。

### 2.2 為什麼現在才可行？

三個能力在 2026 年匯聚，使循環工程變得實用：

- **模型能處理長任務**：METR 基準顯示 Claude Opus 4.6 能完成 50% 需要 12 小時的任務。一年前，Opus 4 的上限是 1 小時 40 分鐘。天花板提升了 6 倍。
- **循環已內建**：Claude Code 交付了 `/loop`、cron 排程和動態工作流。Codex 交付了 Automations 標籤頁，支援循環排程和子代理生成。你不再需要自建基礎設施。
- **子代理防止退化**：主循環在隔離的子代理中生成具有新鮮上下文視窗的子代理。每個子代理做專注的工作並回報。主循環控制器永遠不會填滿自己的上下文。

### 2.3 四種循環類型

- **Heartbeat 循環（心跳循環）**：短間隔持續運行（秒到分鐘）。用於監控：查看日誌、檢查服務健康、掃描漂移。
- **Cron 循環（定時循環）**：在特定時間排程。用於批量工作：每日代碼審查、每週依賴審計、晨會摘要。
- **Hook 循環（鉤子循環）**：由外部事件觸發。PR 被推送、CI 失敗、Slack 消息到達。每次觸發運行一次。
- **Goal 循環（目標循環）**：迭代直到滿足成功條件，然後停止。用於重構、bug 獵捕或範圍未知的遷移任務。

### 2.4 五大核心組件

- **Worktrees（工作樹）**：每次迭代在隔離的 git 工作樹中運行。如果代理搞壞了，搞壞的是副本，不是你的主分支。
- **Skills（技能）**：可複用的指令集，循環可以調用。而不是把一大段指令粘貼到排程中。
- **Connectors（連接器/MCP）**：Model Context Protocol 讓循環訪問外部工具：資料庫、問題追蹤器、部署系統、監控儀表板。
- **Subagents（子代理）**：循環控制器分解工作並委派給專門的子代理。安全審查子代理使用強模型，文件掃描器使用快速便宜的模型。
- **State Tracking（狀態跟蹤）**：循環需要知道它做了什麼。基於文件的狀態（JSON 檢查點）、git 歷史或外部資料庫防止跨迭代的重複工作。

---

## 三、設計哲學

### 3.1 「設計系統，而不是寫提示詞」

你不需要成為提示詞專家——你需要成為系統設計師。循環是可複用、可版本化、可審計的——而提示詞是一次性的。

### 3.2 「子代理是信任的邊界」

主循環不直接執行工作，而是委派給子代理。每個子代理有獨立的上下文視窗和工具權限。這意味著即使子代理出錯，主循環仍然健康。這是安全自治的基礎。

### 3.3 「成本是真實的約束」

Agent 循環的 API 調用量是聊天機器人的 10-100 倍。不優化成本，循環就會燒錢。模型路由可以將成本降低 60-80%。

### 3.4 「停止條件比啟動條件更重要」

沒有停止條件的循環會無限運行，燒掉預算。Goal 循環必須有明確的成功條件。Heartbeat 循環需要 `max_iterations` 上限。**啟動一個循環很容易，安全地停止它才是工程。**

### 3.5 「狀態是記憶的脊柱」

沒有狀態跟蹤的循環每次迭代都從零開始。基於文件的狀態（JSON 檢查點、git 歷史）讓循環擁有跨迭代的持久化記憶。

---

## 四、詳細教程

### 4.1 四種循環的 YAML 配置

**Heartbeat 循環**：
```yaml
schedule: "*/5 * * * *"  # 每 5 分鐘
prompt: "檢查暫存環境錯誤日誌。如果錯誤率 > 1%，打開一個 issue。"
stop_condition: never  # 無限運行
```

**Cron 循環**：
```yaml
schedule: "0 10 * * 1-5"  # 工作日 10am
prompt: "審查所有超過 3 天的 PR。對每個 PR，總結阻塞點並 ping 作者。"
model: gpt-5.5
subagents: true
```

**Hook 循環**：
```yaml
trigger: "post-push"
prompt: "運行測試套件。如果有測試失敗，嘗試修復。如果修復通過，提交。如果沒有，打開一個 issue 並附上失敗詳情。"
```

**Goal 循環**：
```yaml
prompt: "找到下一個使用舊 API 模式的文件。將其遷移到新模式。運行測試。"
stop_condition: "沒有文件匹配舊模式"
max_iterations: 200
```

### 4.2 實戰：構建每日 PR 審查器

**Claude Code 版**：
```bash
claude code --schedule "15 10 * * 1-5" \
  --skill pr-review \
  --prompt "找到此倉庫中所有超過 3 天的 open PR。對每個 PR，生成一個子代理來審查 diff 並編寫阻塞點摘要。將摘要發布為 PR 評論並標記作者。"
```

### 4.3 模型路由：成本降低 60-80%

- **文件掃描和分類**：Nano → $0.10-$0.30/1M tokens
- **摘要和起草**：Mid-tier → $1-$3/1M tokens
- **最終審查和決策**：Frontier → $10-$15/1M tokens

配合 prompt caching，原本 $50/天的循環可以降到 $8-$12/天。

### 4.4 常見失敗模式與防護

- **Token 逃逸**：沒有 `max_iterations` 的 Goal 循環可能一小時燒掉 $500。始終設置上限。
- **上下文腐爛**：長期運行的循環在同一上下文視窗中不斷追加，質量退化。解決方案：每次迭代使用新鮮上下文的子代理。
- **過度自信終止**：代理在只檢查了一半代碼庫時就宣布"完成"。添加驗證步驟。
- **狀態失憶**：循環忘記它已經處理了什麼。每次迭代後將狀態寫入文件或資料庫。

---

## 五、歸納總結（觀點與結論）

1. **「設計循環」比「寫提示詞」更有槓桿效應。** 提示詞是一次性的，循環是可複用、可版本化、可審計的系統。

2. **四種循環類型覆蓋所有場景。** Heartbeat 用於監控，Cron 用於批量工作，Hook 用於事件驅動，Goal 用於開放性任務。

3. **子代理是防止上下文退化的關鍵。** 主循環委派給具有新鮮上下文的子代理，這是防止上下文腐爛的唯一可靠方法。

4. **模型路由是成本優化的核心。** 不是所有步驟都需要最強模型。配合 prompt caching，成本可以降低 60-80%。

5. **停止條件比啟動條件更重要。** 始終設置 `max_iterations` 和明確的成功條件。

6. **網關層是可靠性的基石。** 故障轉移、成本追蹤、緩存、速率限制——這些都需要網關層來處理。

---

## 參考資料

- 原文：`https://x.com/elune0x/status/2079923329633313196`
- Requesty 詳解：`https://www.requesty.ai/blog/loop-engineering-how-to-build-ai-agent-loops-that-run-themselves`
- Appscale 完整指南：`https://appscale.blog/en/blog/loop-engineering-ai-agents-complete-guide-2026`
- Agent Patterns：`https://www.agentpatterns.ai/loop-engineering/`
- Pragmatic Engineer 解讀：`https://newsletter.pragmaticengineer.com/p/what-is-loop-engineering`