---
title: "Loop Engineering 深度解析（Addy Osmani 原著）：別再逐輪提示 AI——設計一個能自己發現工作、分配任務、驗證結果的循環系統，然後留在工程師的位置"
description: "以 Addy Osmani（Google 前高階主管、Director of Engineering at Google Cloud AI）在個人部落格發表的原版文章《Loop Engineering》（2026-06-07）為藍本，完整解析這套 AI 編碼新範式的核心。核心思想：loop engineering 是「用你設計的系統取代『提示 agent 的那個人』」——loop 是一個遞迴目標，你定義目的，AI 迭代直到完成。文章開篇引用 Peter Steinberger（「別再提示編碼代理了，你應該設計會提示代理的循環」）與 Anthropic Claude Code 負責人 Boris Cherny（「我不再提示 Claude 了，我有正在運行的循環替我提示 Claude；我的工作是寫循環」）。一文講透：概念定位（loop 站在 harness 之上、按計時器運行、派生子代理、自我餵食）、五大建構塊 + 記憶（Automations/Worktrees/Skills/Plugins & Connectors/Sub-agents + Memory）、Codex app 與 Claude Code 原語逐項對拍、一個完整循環長什麼樣（早晨自動化 → triage 技能 → worktree 隔離 → 子代理起草/審查 → 連接器開 PR）、以及循環不替你做的三件事（驗證仍是你的責任、理解腐化、認知投降）。結尾金句：Build the loop. Stay the engineer.（建造循環，但留在工程師的位置）。"
date: "2026-08-06"
author: "TopDigg Research Team"
tags: ["Loop Engineering", "Addy Osmani", "AI Agent", "Claude Code", "Codex", "Automations", "Worktrees", "Skills", "Sub-agents", "MCP", "Harness Engineering", "認知投降"]
categories: ["Deep Dive"]
keywords: ["Loop Engineering", "Addy Osmani", "循環工程", "AI 代理", "Claude Code", "Codex", "自動化", "工作樹", "技能", "子代理", "MCP", "Harness", "記憶", "認知投降", "Stay the Engineer"]
---

# Loop Engineering 深度解析（Addy Osmani 原文）：別再逐輪提示 AI——設計一個能自己找活、派活、驗活的循環系統，然後留在工程師的位置

> 核心思想：**Loop engineering 是「用你設計的系統取代『提示 agent 的那個人』」。** Addy Osmani（Google 前高階主管，Director of Engineering at Google Cloud AI）在個人部落格原文章（2026-06-07）中定義：一個 loop 可以被理解成**遞迴目標（a recursive goal）**——你定義一個目的，AI 不斷迭代直到完成。他斷言這可能就是我們與編碼代理協作方式的未來，但**「現在還為時過早，我持懷疑態度」**，而且必須警惕 token 成本。文中引用兩句圈內名言定調：Peter Steinberger（OpenClaw 作者）說「**你（作為使用者）不該再提示編碼代理了，你應該設計會提示代理的循環**」；Anthropic Claude Code 負責人 Boris Cherny 說「**我不再提示 Claude 了，我有正在運行的循環在替我提示 Claude 並決定該做什麼，我的工作是寫循環**」。你不再一回合接一回合地握著工具，而是建造一個小的控制系統去「戳」那些代理。但文章最鋒利的提醒在結尾：**Build the loop. Stay the engineer.**——循環不會替你驗證、不會阻止你理解腐化、不會阻止你認知投降。設計循環時帶著判斷力，它就是解藥；用它逃避思考，它就是加速器。

---

## 一、項目說明

### 1.1 它是什麼？

本文要解析的是 **Addy Osmani 在他的個人部落格（addyosmani.com）上發表的原版文章《Loop Engineering》**，發布於 **2026-06-07**。它不是一篇教學，而是關於「我們如何與編碼代理協作」的一次典範宣言 + 落地拆解。

Addy Osmani 的身份值得注意：**Google 前高階主管、現任 Director of Engineering at Google Cloud AI，在 Google 工作了 14 年**，長期在 Web 效能與前端工程領域有巨大影響力（《Learning JavaScript Design Patterns》作者、Chrome 團隊出身）。他在 2026 年密集寫作了一批關於 AI 編碼協作的文章——agent harness engineering、the factory model、orchestration tax、intent debt、comprehension debt、cognitive surrender、adversarial code review、code agent orchestra、long-running agents——而《Loop Engineering》正是這一系列思想的**收束之作**。

文章把 Loop Engineering 定義為：

> **Loop engineering is replacing yourself as the person who prompts the agent. You design the system that does it instead.**（Loop engineering 是取代「提示 agent 的那個人」——你設計系統來替代自己做這件事。）

一個 loop = **遞迴目標**：你定義目的，AI 迭代直到完成。它是建立在人類工程師角色遷移之上的工程紀律：**你不再是每天敲提示詞的人，而是設計「誰去敲、什麼時候敲、怎麼驗證」這套系統的人。**

### 1.2 關鍵數據與資訊

- 作者：**Addy Osmani**，Google 前高階主管、Google Cloud AI 工程總監、全球知名前端工程師與開發者佈道者
- 發布管道：個人部落格 `addyosmani.com`
- 發布時間：**2026-06-07**
- 文章立場：**「它可能成為未來，但現在還早，我持懷疑態度，你必須警惕 token 成本」**（原話："I believe this may be the future of how we work with coding agents. However, its still early, I'm skeptical and you absolutely have to be careful about token costs"）
- 核心引語來源：Peter Steinberger（OpenClaw 創造者）、Boris Cherny（Anthropic Claude Code 負責人）
- 概念譜系：agent harness engineering（單次運行的環境）→ factory model（構建軟體的系統）→ **loop engineering（站在 harness 之上：按計時器運行、派生子代理、自我餵食）**
- 關聯文章系列：orchestration tax、intent debt、comprehension debt、cognitive surrender、adversarial code review、code agent orchestra、long-running agents

### 1.3 它解決什麼問題？

過去兩年，我們從編碼代理那裡拿到產出的方式是：**寫一個好提示詞、分享足夠多的上下文、輸入一句、讀返回、再輸入下一句**——「agent 是一個工具，你全程握著它，一回合接著一回合」。Addy 說：**「那部分基本結束了」**（"That part is kind of over, or at least some think it's going to be."）。

新範式的回答是：**你建造一個小型系統來替代你與代理的直接對話。** 這個系統負責：發現工作（finds the work）、把工作派發出去（hands it out）、檢查結果（checks it）、寫下已完成的事項（writes down what is done）、然後決定下一步（decides the next thing）。然後你讓這套系統去「戳」那些代理，而不是你親自戳。

關鍵轉變：這**已經不是工具層面的問題了**。Addy 原話：一年前你想要一個 loop，得自己寫一堆 bash 腳本並且永遠維護它；**現在這些構件直接內建在（Codex、Claude Code 這類）產品裡**。Steinberger 列出的清單幾乎可以一一映射到 Codex app，也能幾乎原樣映射到 Claude Code——一旦你發現形狀是相同的，就停止爭論「用哪個工具」，轉而設計一個「無論你坐在哪個工具裡都能工作」的循環。

---

## 二、核心思想

### 2.1 一句話定義與兩句圈內名言

Addy 開篇兩句話把典範講透。第一句是 Peter Steinberger（OpenClaw 作者，2026 年最火的個人 AI 助理開源專案）：

> "You shouldn't be prompting coding agents anymore. You should be designing loops that prompt your agents."（你（作為使用者）不該再提示編碼代理了，你應該設計會提示代理的循環。）

第二句來自 Anthropic Claude Code 負責人 Boris Cherny：

> "I don't prompt Claude anymore. I have loops running that prompt Claude and figuring out what to do. My job is to write loops."（我不再提示 Claude 了，我有正在運行的循環替我提示 Claude 並決定該做什麼。我的工作是寫循環。）

### 2.2 loop 站在 harness 之上：分層世界觀

Addy 之前在《agent harness engineering》和《the factory model》裡分別寫過「單次 agent 運行的環境」和「構建軟體的系統」。Loop engineering 的位置是：

> **Loop engineering sits one floor above the harness.**（Loop engineering 坐在 harness 的上一層。）

- **Harness**：單次 agent 運行所在的腳手架（工具、驗收標準、回饋循環）
- **Loop**：**「the harness but it runs on a timer, it spawns little helpers, and it feeds itself」**——同一個 harness，但它在計時器上運行、派生出小助手（子代理）、並且自我餵食（self-feeding）

也就是說：harness 武裝的是**一次** agent run；loop 是那個**持續調度 agent、派生子代理、自我加料**的層。

### 2.3 形狀相同 → 停止爭論工具

Addy 強調了一個讓他驚訝的觀察：**「This is not really a tool thing anymore.」**（這已經不再是工具層面的問題了。）

一年前，想要一個 loop 意味著自己寫一坨 bash 並永遠維護它；而現在，**構件直接內建在產品裡**。Steinberger 的清單幾乎一一映射到 Codex app，也幾乎原樣映射到 Claude Code。結論：

> 一旦你注意到形狀是相同的，你就停止爭論「用哪個工具」，轉而設計一個**無論你恰好坐在哪個工具裡都有效的循環**。

這意味著 loop 設計是一門**工具無關（tool-agnostic）**的技藝——這是本文最重要的認知之一。

---

## 三、詳細教學：一個 loop 需要的五件東西 + 一處記憶

Addy 明確給出清單：**「A loop needs five things and then one place to remember stuff.」**（一個循環需要五樣東西，外加一個記住事情的地方。）

| # | 構件 | 在循環中的作用 |
|---|------|--------------|
| 1 | **Automations（自動化）** | 按計畫自動觸發，自己完成發現與分類（discovery and triage） |
| 2 | **Worktrees（工作樹）** | 讓兩個並行 agent 不互相踩腳 |
| 3 | **Skills（技能）** | 寫下 agent 否則只能靠猜的專案知識 |
| 4 | **Plugins & Connectors（外掛與連接器）** | 把 agent 接入你已經在用的工具 |
| 5 | **Sub-agents（子代理）** | 一個出主意，另一個檢查 |
| 6 | **Memory（記憶）** | 一個存在於單次對話之外、記錄「做了什麼/接下來做什麼」的地方 |

### 3.1 工具原語對拍表（Codex app vs Claude Code）

Addy 給了一張關鍵對照表——同樣五種能力，兩個主流產品的原語幾乎一一對應：

| 原語（Primitive） | 在循環中的職責 | Codex app | Claude Code |
|---|---|---|---|
| **Automations** | 按計畫自動發現 + 分類 | Automations 標籤頁：選專案、提示詞、節奏、環境；發現內容的運行結果進入 Triage 收件匣；`/goal` 用於「跑到完成為止」 | 定時任務與 cron、`/loop`、`/goal`、hooks、GitHub Actions |
| **Worktrees** | 隔離並行功能開發 | 每個執行緒內建 worktree | `git worktree`、`--worktree`、子代理上的 `isolation: worktree` |
| **Skills** | 沉澱專案知識 | Agent Skills（`SKILL.md`），用 `$名稱` 或隱式呼叫 | Agent Skills（`SKILL.md`） |
| **Plugins / Connectors** | 連接你的工具 | Connectors（基於 MCP）+ 用於分發的 plugins | MCP servers + plugins |
| **Sub-agents** | 出主意 + 驗證 | 以 TOML 定義在 `.codex/agents/` | Task 子代理在 `.claude/agents/`，agent teams |
| **State（記憶）** | 追蹤已完成與待辦 | 透過 connector 寫入 Markdown 或 Linear | Markdown（`AGENTS.md`、progress 檔案）或透過 MCP 寫 Linear |

> 「名字在這裡那裡有點不同，但能力是同一個東西。」（"The names are a bit different here and there but the capability is the same thing."）

### 3.2 逐個拆解：Automations——循環的心跳

**Automations 是讓 loop 成為真正的「循環」、而不是「你手動跑過一次」的東西。**

- **Codex app**：在 Automations 標籤頁建立一個自動化，選擇**專案、提示詞、運行頻率、運行環境**（本地 checkout 還是後台 worktree）。發現內容的運行結果進入 **Triage 收件匣**；什麼都沒找到的運行會自己歸檔（「which is nice」）。OpenAI 內部用它做無聊的日常事務：**每日 issue 分類、彙總 CI 失敗、寫 commit 簡報、追查上週有人引入的 bug**。一個自動化可以呼叫一個 skill——這樣可重複事務保持可維護，你觸發 `$skill-name` 而不是把一堵巨大的指令牆貼進永遠不會更新的排程裡。
- **Claude Code**：透過排程與 hooks 達到同一效果。`/loop` 按間隔重跑一個提示或命令；`cron` 排程定時任務；hooks 在 agent 生命週期某些節點觸發 shell 命令；或者把整個東西推到 **GitHub Actions** 讓它在你闔上筆電後繼續跑。

還有一個值得知道的**會話內原語**（in-session primitive），它更貼近本文主題：

- **`/loop`**：按節奏（cadence）重跑。
- **`/goal`**：持續運行直到你寫下的條件為真。**每輪之後，由另一個獨立的小模型檢查你是否完成**——寫程式碼的 agent 不給自己打分。你給它類似「`all tests in test/auth pass and lint is clean`」這樣的條件，然後走開。Codex 也有同名的 `/goal`：跨輪次持續工作直到一個**可驗證的停止條件**成立，支援 pause / resume / clear。

> 「同一個原語，兩個工具都有——這差不多就是整篇文章的主題模式。」（"Same primitive, both tools, which is kind of the pattern for this whole article."）

**Automations 的角色定位**：它是「把工作浮出水面」的那一層（「the part that surfaces the work」），循環的其餘部分是「對工作採取行動」的那一層。

### 3.3 逐個拆解：Worktrees——讓並行不變成混亂

**一旦你同時運行多個 agent，檔案碰撞就會發生，而那就是失敗點。** 兩個 agent 寫同一個檔案，和兩個工程師沒打招呼就提交到同一行，是同一個頭痛。

- **git worktree** 解決它：一個**獨立的工作目錄 + 自己的分支**，共享同一個 repo 歷史——所以一個 agent 的編輯**物理上不可能**碰到另一個的 checkout。
- **Codex**：把 worktree 支援內建，多個執行緒同時打同一個 repo 而互不干擾。
- **Claude Code**：用 `git worktree`、`--worktree` 旗標（在自己的 checkout 裡開啟會話）、以及放在子代理上的 `isolation: worktree` 設定（每個助手拿到一個全新的、用後自清的 checkout）。

Addy 的補充觀點（呼應他自己的《orchestration tax》一文）：**worktrees 消除了機械碰撞，但你仍然是天花板**——你的 review 頻寬決定了你實際能並行跑多少個 agent，而不是工具決定的。

### 3.4 逐個拆解：Skills——停止每次都重新解釋你的專案

**Skill 是讓你停止「像金魚一樣每個會話都重新解釋同一套專案上下文」的東西。**

- 兩個工具使用**相同的格式**：一個包含 `SKILL.md` 的資料夾（裡面是指令和中繼資料），外加可選的 scripts / references / assets。
- **Codex**：當你用 `$` 或 `/skills` 呼叫技能時運行它；或者當你的任務符合技能描述時**自動**運行——這就是「一個緊湊無聊的描述勝過花俏描述」的原因。
- **Claude Code**：同樣機制。

Skills 是 **intent debt**（意圖債）的解藥。Addy 在《intent debt》中論證過：**agent 每次會話都是冷啟動，它會把你的意圖裡的任何空洞用「自信的猜測」填上**。一個 skill 就是把意圖寫在外部：約定、構建步驟、「我們之所以不這麼做是因為那起事故」——寫一次，agent 每次運行都讀。

> 沒有 skills，loop 每個週期都從零重新推導你的整個專案；有了 skills，它就會**複利增長**（compounds）。

一個重要區分：**skill 是「創作格式」，plugin 是「分發方式」**。跨倉庫共享 skill、或打包多個 skill 時，你把它打包成 plugin——Codex 和 Claude Code 都如此。

### 3.5 逐個拆解：Plugins & Connectors——循環觸達你的真實工具

**一個只能看到檔案系統的循環，是一個很小的循環。**

- **Connectors**（構建在 **MCP** 之上）讓 agent 讀你的 issue tracker、查資料庫、打 staging API、往 Slack 丟訊息。
- Codex 和 Claude Code 都講 MCP，所以**你為一個寫的 connector 通常直接能用在另一個**。
- **Plugins** 把 connectors 和 skills 打包在一起，讓隊友一次性安裝你的整套配置，而不是憑記憶重建一切。

這是「agent 說『這是修復方案』」與「**loop 在 CI 變綠後自己開 PR、關聯 Linear ticket、ping 頻道**」之間的區別。**Connectors 是 loop 能真正在你實際環境裡行動、而不是只告訴你「如果可以它會怎麼做」的原因。**

### 3.6 逐個拆解：Sub-agents——讓「製造者」遠離「檢查者」

**一個循環裡最有用的結構性東西，是把「寫的人」和「查的人」分開。**

> 「寫程式碼的那個模型給自己改的作業打分時太客氣了（way too nice grading its own homework）。」一個帶著不同指令、有時是不同模型的第二個 agent，能抓住第一個 agent 自己說服自己的那些問題。

- **Codex**：只有當你要求時才派生子代理，並行運行，然後把結果摺疊進一個答案。你在 `.codex/agents/` 裡以 TOML 定義自己的 agent（name、description、instructions、可選 model 與 reasoning effort）——所以你的**安全審查員可以是高 effort 的強模型**，而你的**探索者可以是快速唯讀的小東西**。
- **Claude Code**：`.claude/agents/` 裡的 task 子代理，以及能互相傳活的 **agent teams**。
- 常見分工（兩個工具都是）：**一個探索（explores）、一個實作（implements）、一個對照規格驗證（verifies）**。

為什麼這在 loop 裡特別重要：**loop 在你沒盯著的時候運行**，所以一個你真正信任的驗證者，是你敢於走開的唯一理由。代價：子代理各自做模型和工具工作，**更燒 token**——把錢花在「值得為第二種意見買單」的地方。

Addy 還點破一層：**Claude Code 的 `/goal` 底層就是這個模式**——由一個新模型決定循環是否完成，而不是由幹活的模型決定——「製造者/檢查者分離」被應用到了**停止條件本身**。

### 3.7 一個完整循環長什麼樣（Addy 常用的形狀）

把上面拼起來，單條執行緒就變成一個小控制面板。Addy 給出一個他反覆使用的形態：

> 1. **每天早上，一個自動化在這個 repo 上運行**。它的提示詞呼叫一個 **triage skill**——讀取昨天的 CI 失敗、開啟的問題、最近的提交，把發現寫進一個 Markdown 檔案或 Linear board。
> 2. 對每條**值得做的發現**，執行緒開啟一個隔離的 **worktree**，派一個**子代理去起草修復**。
> 3. **第二個子代理**對照專案 skills 和既有測試審查那份草稿。
> 4. **Connectors** 讓 loop 自己開啟 PR、更新 ticket。
> 5. 任何 loop 處理不了的東西，落到 **triage 收件匣**等你處理。
> 6. **狀態檔案是整件事的脊柱**——它記住什麼試過了、什麼通過了、什麼還開著，所以第二天早上的運行**從今天結束的地方繼續**。

然後 Addy 用一句話點出本質：

> 「看看你實際上做了什麼：**你只設計了一次。你沒有提示過其中任何一步。** 這就是 Steinberger 的整點真義——而且它在 Codex 或 Claude Code 裡是同一個循環，因為構件是同樣的構件。」

---

## 四、設計哲學：循環不替你做的三件事

Addy 全篇最重要的警告：**「The loop changes the work, it does not delete you from it.」**（循環改變了工作，但它不會把你從工作中刪除。）而且有三個問題**隨著循環變好而變得更尖銳，而不是更容易**。

### 4.1 驗證仍然是你的責任（Verification is still on you）

> 「一個無人值守的循環，也是一個無人值守地犯錯的循環。」

你把驗證子代理從製造者那裡拆出來，是為了讓循環的「完成了」有意義；但即便那樣，**「完成了」是一個主張（a claim），不是證明（a proof）**。Addy 反覆引用他在《code review in the age of AI》裡的同一句話：**你的工作是發布「你確認過它確實能跑」的程式碼。**

### 4.2 你的理解仍然會腐化（Your understanding still rots if you allow it）

> 循環越快交付你沒寫過的程式碼，**「存在的東西」與「你實際理解的東西」之間的差距就越大**。這就是**理解債（comprehension debt）**——一個順暢的循環只會讓它增長得更快，**除非你閱讀循環產出的東西**。

### 4.3 舒適的姿態是危險的姿態：認知投降（Cognitive surrender）

> 當循環自己運行得很好時，人很容易停止持有意見，直接收下它給你的任何東西。Addy 稱之為**認知投降（cognitive surrender）**。

最有哲學分量的句子在這：

> **「Designing the loop is the cure when you do it with judgement and the accelerant when you do it to avoid thinking, same action, opposite result.」**（當你帶著判斷力設計循環時，它是解藥；當你用他來逃避思考時，它是加速器。同樣的動作，相反的結果。）

### 4.4 結語金句：Build the loop. Stay the engineer.

Addy 的完整收官論證：

1. **這是工作如何演化的預覽**：「I think this is a preview of how our work is going to evolve.」
2. **但他不放棄人工審查**：「如果我不親自審查程式碼、或者完全依賴自動化循環去修它，我的產品品質會下降。我可能會陷入一個向下的螺旋，不斷把自己挖進更深的坑。」
3. **保持平衡**：「儘管去搭你的循環，但別忘了直接提示你的代理也同樣有效。關鍵在於找到平衡。」
4. **循環因你而異**：「兩個人可以搭出完全相同的循環，卻得到完全相反的結果。一個用它來加速理解深刻的工作；另一個用它來逃避理解工作。**循環不知道其中的區別。你知道。** 這就是為什麼循環設計比提示詞工程更難，而不是更容易。」
5. **槓桿點移動了**：「Cherny 的觀點不是工作變容易了，而是**槓桿點移動了（the leverage point moved）**。」
6. **最終句**：「**Build the loop. But build it like someone who intends to stay the engineer, not just the person who presses go.**」（建造循環。但要像一個「打算繼續做工程師的人」那樣建造，而不是像一個「只負責按下開始按鈕的人」。）

---

## 五、歸納總結

### 5.1 核心觀點清單

1. **Loop engineering 的定義**：用你設計的系統取代「提示 agent 的那個人」；loop = 遞迴目標，你定義目的，AI 迭代直到完成。
2. **典範遷移**：「agent 是工具、你全程握著它、一回合接一回合」的時代基本結束——現在你建造小型系統去「戳」代理。
3. **層級定位**：loop 坐在 harness 之上一層——同一個 harness，但它在計時器上運行、派生子代理、自我餵食。
4. **工具無關性**：構件已經內建進產品（Codex / Claude Code），形狀相同 → 停止爭論工具，設計一個無論坐在哪個工具裡都能工作的循環。
5. **五大建構塊 + 記憶**：Automations（心跳）、Worktrees（並行隔離）、Skills（專案知識複利）、Plugins/Connectors（觸達真實工具）、Sub-agents（製造者/檢查者分離）+ Memory（狀態檔案是脊柱）。
6. **驗證仍是你的責任**：「done」是主張不是證明；無人值守的循環也在無人值守地犯錯。
7. **理解債與認知投降**：循環越快交付你沒寫的程式碼，理解差距越大；舒適的「直接收下結果」姿態是危險的。
8. **循環設計比提示詞工程更難**：循環不知道你在加速還是在逃避，區別只有你知道——所以槓桿點移動了，但責任沒有消失。

### 5.2 一句話總結

> **循環改變的是「誰來提示」這個問題，不是「誰該負責」這個問題。** 建造你的循環，讓它替你發現工作、派發任務、驗證結果；但閱讀它產出的東西、保持你對程式碼的理解、帶著判斷力設計它——**Build the loop. Stay the engineer.**

---

## 參考資料

- 原文：Addy Osmani，《Loop Engineering》（2026-06-07）—— `https://addyosmani.com/blog/loop-engineering/`
- Addy Osmani 關聯系列：《Agent Harness Engineering》《The Factory Model》《Orchestration Tax》《Intent Debt》《Comprehension Debt》《Cognitive Surrender》《Adversarial Code Review》《Code Agent Orchestra》《Long-Running Agents》《Code Review in the Age of AI》—— 均可在 `addyosmani.com/blog/` 檢索
- Peter Steinberger（OpenClaw 作者）關於「designing loops that prompt your agents」的公開言論
- Boris Cherny（Anthropic Claude Code 負責人）關於「my job is to write loops」的公開言論
- 本站相關：《Loop Engineering 深度解析（Cobus Greyling 原著）》（`loop-engineering-substack-analysis`）、《Loop Engineering 橙皮書深度解析》（`loop-engineering-orange-book`）
