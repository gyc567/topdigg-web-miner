---
title: "Loop Engineering 深度解析（Cobus Greyling 原文）：別再提示詞 AI——設計一個會自己發現工作、派發任務、做循環的系統"
description: "以 Cobus Greyling 在 Substack 發表的原論文《Loop Engineering》為藍本，完整解析這一 AI 代理範式的核心。核心思想：從「你逐回合提示編碼代理」轉向「你設計一個循環（the loop）」，讓它按調度或直到目標達成為止，自動發現工作、把任務交給子代理、驗證結果、持久化狀態、決定下一步。文章脈絡：概念演進（Context Engineering→Harness Engineering→Loop Engineering）、harness 與 loop 的分工、五大構建塊（自動化/調度、工作樹、技能、插件/連接器、子代理）+ 記憶、Anthropic Boris Cherny / Peter Steinberger / Addy Osmani 的觀點、Grok/Codex/Claude Code 三工具對拍，以及市場的現實代價。"
date: "2026-08-06"
author: "TopDigg Research Team"
tags: ["Loop Engineering", "Cobus Greyling", "AI Agent", "Substack", "Harness Engineering", "Context Engineering", "Claude Code", "Grok", "Codex", "MCP", "Worktrees", "Skills", "Automation"]
categories: ["Deep Dive"]
keywords: ["Loop Engineering", "Cobus Greyling", "循環工程", "AI 代理", "Harness", "Context Engineering", "Claude Code", "Grok", "Codex", "工作樹", "技能", "子代理", "記憶", "認知投降"]
---

# Loop Engineering 深度解析（Cobus Greyling 原著）：別再提示 AI——設計一個會自己發現、調度、循環的系統

> 核心思想：**從「你逐回合提示編碼 Agent」轉向「你設計一個循環（the loop）」**，它會自動發現工作、把任務交給代理（往往是子代理）、驗證結果、持久化狀態、並決定下一步——按調度跑或直到目標達成。Cobus Greyling 在 Substack 原文章（2026-06-09）中引述 Anthropic Boris Cherny（Anthropic Claude Code 負責人）："我不再提示 Claude 了。我有正在運行的循環在提示 Claude。**我的工作是寫循環。**" 一線人物的觀點殊途同歸：**你的工作是寫循環，而不是寫提示詞。**

---

## 一、項目說明

### 1.1 它是什麼？（這是誰的文章？）

**本文要解析的是 Cobus Greyling 在 Substack 發表的《Loop Engineering》**（`cobusgreyling.substack.com/p/loop-engineering`，2026-06-09）。它不只是一篇博文，而是 AI 原生開發的一次"宣言"級別闡述。Cobus 把 Loop Engineering 定義為：

> **從「你逐回合提示編碼代理」轉變為「你設計一個系統（the loop）自動發現工作、把任務交給代理、驗證結果、持久化狀態、決定下一個動作」**——按計劃運行或直到達成目標為止。

這套系統不是「更大的提示」，而是一個「只有你能定義目的，AI 不斷迭代直到完成」的**遞歸目標**。

### 1.2 關鍵信息

- 作者：Cobus Greyling，**Kore.ai 首席布道官（Chief Evangelist）**
- 發布平台：Substack（`cobusgreyling.substack.com`）
- 發布日期：2026-06-09
- 概念脈絡：Context Engineering → Harness Engineering → **Loop Engineering**（AI 概念的層層演進）
- 關聯開源：`github.com/cobusgreyling/loop-engineering`
- 生態關聯：Anthropic《Effective harnesses for long-running agents》、《When AI builds itself》、Addy Osmani 的 X 帖、Peter Steinberger（OpenClaw 創作者）

### 1.3 它解決什麼問題？

傳統 AI 編碼工作流：**寫 prompt → 讀輸出 → 寫下一個 prompt**。人「一回合又一回合地握著工具」。問題：無法同時給所有並行代理逐條提示，而且世上沒有那麼多「提示者專」的人力。

答案（Loop Engineering）：**建構小型自主控制系統來使用代理**。你不必再逐回合驅動，你設計讓它在無界的時間裡自己調度的系統——這是它與單次對話的本質差異。

---

## 二、核心思想

### 2.1 三層的演進（先厘清位置）

文章開篇就厘清整個業界的演進脈絡，正是理解 Loop Engineering 的階梯：

> **"（AI 的術語換得太快）：還記著當 Context Engineering 是新的時候，然後是 Harness Engineering…現在我們有了 Loop Engineering。"**

由此"想想它是三個層級，每層解的問題都不同"。而 **harness** 與 **loop** 的分工是：

- **Harness**：一個單次 agent 運行的腳手架。
- **Loop**：讓代理按調度被「戳」、派生子代理、並自我循環「餵食」的那一層。

### 2.2 一句話定義（Addy Osmani 的框架）

> **Addy Osmani 的話："Loop engineering 就是用你自己設計的系統作『去代替你作為 prompts agent 的那個人』。這裡的 loop 可以想成一個遞歸目標——你定義一個目的，AI 不斷迭代直到完成。"**

### 2.3 兩個標誌性引語

- **Peter Steinberger（OpenClaw 創造者）**："你不該再提示編碼代理了。**你應該設計循環來提示它們。**"
- **Boris Cherny（Claude Code 負責人）**："我不再提示 Claude 了。我有正在運行的循環在提示 Claude 並決定該怎麼做。**我的工作是寫循環。**"

> 工具融合趨勢：Claude Code 與 OpenAI Codex 都落在非常相近的原語上，所以 **loop 的形狀正變得與工具無關**。

---

## 三、詳細教程：五大構建塊 + 記憶（核心六件套）

最重要的一節：**真正無人看管的 loop 絕不是一條長提示詞，而是一個有六部分的小系統。** 前五個是能力，第六個是貫穿狀態的脊樑。

### 3.1 一、自動化/調度（The Heartbeat，心跳）

> **循環的心跳。**

- 沒有調度 → 只是個一次性 Agent 會話；有調度 → 你能按節奏做發現 + 分診。
- 把「我每天該查 CI」變成**一種不管你有沒有開終端機都會發生的事**。
- **Claude Code**：`/loop`、`/schedule`、`/goal`（執行直到可驗證條件成立；用**獨立模型**檢查「完成」，不讓 **"工人給自己的作業打分"**）；Hooks 與 GitHub Actions 把同一概念帶出聊天範圍、推進持久化。
- **Grok**：`/loop [interval] <prompt>` + 底層 scheduler 工具（`scheduler_create` / `scheduler_list` / `scheduler_delete`）。

> **心跳不一定要更聰明，但要可靠。**

### 3.2 二、工作樹（Worktrees）——安全的並行

- 兩個代理同時編輯同一批文件 = **合併事故的前奏**。
- 用隔離的 git 工作樹（或等效 checkout）：每個代理有自己的工作目錄，同時共享 git 歷史。
- 兩大主流工具都有了內建支援。

> 在 Grok：產生子代理時傳 `isolation: "worktree"`。**清理很關鍵**。一個留下大量孤立工作樹的 loop，是你會後悔的 loop。

### 3.3 三、技能（Skills）——持久化項目知識

> 每個 Session，代理都是冷啟動。

- 慣例、構建指令、審查標準、踩過的坑（"we don't do it that way"）都必須被外部化。
- **技能是你在償還"intention debt（意圖負債）"。**
- 一個 `SKILL.md`（+ 可選腳本與引用）承載應跨 run 存活的知識。
- Claude Code 用 CLAUDE.md 與 Skills，打包成 plugin 方便分享；Grok 用相同模式。

> 沒有 Skills，**每個 loop run 都是第一天**。

### 3.4 四、插件 / 連接器（Plugins & Connectors MCP）——連接真實工具

- **一個只能讀文件系統的 loop，只是一個只會建議的 loop。**
- 用 **MCP-based connectors** 讓 loop 能行動：開 PR、更新 Linear ticket、發 Slack、查 DB、觸發 runbook——loop 從「評論員」變成「操作員」。
- MCP 已是公共基座，為一個工具寫的 connector，常常能平移到另一個。

### 3.5 五、子代理 | 製作者/檢查者分離（Maker / Checker）

> **寫代碼的代理，常常對自己寫的東西評判偏弱。**

- 這不是「模型能力」問題，而**是結構性的**（structural）。
- 一個代理（團隊）實現，**另一個**（有時是更強模型、但總是用不同的指令）按 specs、skills、tests 去核對。
- 在無人看管的 loop 裡，**驗證者是你敢放心走開的那個理由**。
- `/goal` 在好幾個工具用同一個思考：**另外一個 fresh model 去判斷「是否已達到停止條件」。**

### 3.6 六、記憶（Memory）——持久的脊樑

> **上面全部過不了 session 邊界。**

- loop 必須對**外部**某處讀寫：`STATE.md`、`LOOP-STATE.json`、Linear 的一欄、GitHub Project 一個視圖。
- 好狀態要能回答三個問題：
  1. 我們現在在做什麼？
  2. 上次我們試了什麼、結果如何？
  3. 什麼正在等人類處理？

> 跨日 / 多輪的 loop，這是**不可協商**的。**狀態文件（State file）通常是 loop 的最重要產物。**

---

## 四、設計哲學

### 4.1 自我驅動，而不是更大提示

**循環不是把單次 prompt 參數調得更長，而是一個會自我調度的系統。** 你的角色從提示者變成系統設計者。總的杠杆點已移動。

### 4.2 工具無關的「循環形狀」

工具融合趨勢是明確的：Claude Code / Codex / Grok 都落到類似原語。這暗示**行業正在收斂到標準的 Agent 編排腳本**——項目工程師不必再為特定 CLI 逐一畫書。

### 4.3 「驗證者獨立於製作者」

多數關鍵引語都繞不開這個哲學：最穩妥的 Agent 系統必有一條獨立的驗證軌；**寫代碼的代理自己不做考官**。這是面向你其實並不在場（unattended）時的最低信任。

### 4.4 「是槓桿，也是陷阱」

文末的清醒收尾：「**認知的屈服，是舒服的陷阱（Cognitive surrender is the comfortable trap）。**」同一個 loop 設計可以加速一個 stay-the-engineer 的人，也完全能讓一個人放棄判斷。

> 要以「打算留在 Engineer 位置上的人」的心態去建 loop，而非只按「go」的人。

---

## 五、歸納總結（觀點與結論）

1. **范式的遷移方向明確**：從「人寫 prompt → 代理執行」變成「人設計 loop → loop 自動提示代理」。
2. **階層**：Loop Engineering 是 harness-engineering 之上的一階。
3. **循環形狀**：正變工具無關化（tool-agnostic）。
4. **定義**：遞歸目標（recursive goal）你定義目的，AI 迭代到完成。
5. **結構**：任何真正 unattended 的 loop 都是「五能力 + 一記憶」的六件套。
6. **驗證器是信任的理由**：讓你能脫手並信任無監督的部分。
7. **（原文引語）兩大標誌性引語**：Peter Steinberger 與 Boris Cherny 都有「我的工作是寫 loop」的一致性。
8. **要有清醒的調尾**：token 成本、理解債、認知投降是該被說破的現實。

### 金句摘錄

- Boris Cherny："我的工作是寫循環。"
- Peter Steinberger："你應該設計循環來提示你的代理。"
- "心跳不一定要更聰明，但要可靠。"
- "技能是償還意圖債務的方式。"
- "為打算留在工程師位置上的人設計 loop —— 不是為只按 go 的人。"

---

## 參考資料

- 原文：`https://cobusgreyling.substack.com/p/loop-engineering`
- 開源倉庫：`https://github.com/cobusgreyling/loop-engineering`
- Anthropic 工程文章：`https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents`
- Anthropic 遞歸自改內容：`https://www.anthropic.com/institute/recursive-self-improvement`
- 作者：Cobus Greyling（Kore.ai 首席布道官）`https://cobusgreyling.me/`