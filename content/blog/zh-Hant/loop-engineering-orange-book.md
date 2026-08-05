---
title: "Loop Engineering 橙皮書深度解析：別再問我什麼是 Loop Engineering——從「提示者」到「系統設計者」"
description: "全面解析花叔（HuaShu）開源的《Loop Engineering 橙皮書》——一本用大白話講透 Loop Engineering 的免費 PDF 書籍（v260615，MIT 協議）。核心思想：別再當那個手動提示 AI 的人，去設計一個替你提示 AI 的系統。涵蓋 prompt→context→harness→loop 四層棧、一個循環的五個動作（自動化/工作樹/技能/插件/子代理）+ 記憶、為什麼 AI 不能給自己的程式碼打分、三個真實循環案例（Addy 早晨分診 / Stripe Minions / 調度的現實）、四種代價（驗證債/理解腐化/token 爆炸/認知投降），以及從 §01 到 §09 的完整章節教程與「今天構建第一個循環」的實作指南。專案說明、核心思想、設計哲學、觀點歸納一文講透。"
date: "2026-08-06"
author: "TopDigg Research Team"
tags: ["Loop Engineering", "Orange Book", "AI Agent", "Harness", "Claude Code", "Codex", "MCP", "花叔", "自動化"]
categories: ["Deep Dive"]
keywords: ["Loop Engineering", "橙皮書", "循環工程", "AI 代理", "Harness", "Claude Code", "Codex", "工作樹", "技能", "子代理", "驗證債", "認知投降"]
---

# Loop Engineering 橙皮書深度解析：別再問我什麼是 Loop Engineering——從「提示者」到「系統設計者」

> 核心思想：**別再當那個手動提示 AI 的人——去設計一個替你提示 AI 的系統。** 2026 年 6 月，Peter Steinberger、Anthropic Claude Code 負責人 Boris Cherny、Google 的 Addy Osmani 三位行業人物幾乎在同一週獨立喊出了同一個轉變。花叔（HuaShu）把它寫成了一本免費開源的《Loop Engineering 橙皮書》：不教你寫更好的提示詞，而是教你設計一個循環系統——它自動發現工作、分配工作、檢查工作、記錄工作、決定下一步。**你的工作不再是「提示代理」，而是「設計循環」。**

---

## 一、專案說明

### 1.1 它是什麼？

**Loop Engineering 橙皮書**（`別再問我什麼是 Loop Engineering` / *Stop Asking Me What It Is*）是花叔橙皮書系列的 Loop Engineering 卷——一本以**大白話**講透 AI 代理循環工程的開源書籍。它以 PDF 形式發布，中文完整版 4.3MB，英文版 859KB，完全免費、MIT 開源。

它回答一個問題：當「寫提示詞」這個時代結束時，程式設計師的價值在哪裡？答案寫在書名裡——**別再問我什麼是 Loop Engineering，去讀這本書，然後去構建你的循環。**

### 1.2 關鍵數據

- 儲存庫：`https://github.com/alchaincyf/loop-engineering-orange-book`
- 版本：**v260615**（2026 年 6 月首版）
- License：**MIT**（c）2026
- 作者：**花叔（HuaShu）**——AI Native Coder、獨立開發者
- 作者平台：全平台 **50 萬+ 粉絲**；用 AI 獨立做出了 App Store 付費榜 #1 的 iOS 應用，全程沒有手寫程式碼
- 作者主頁：X @AlchainHust · YouTube @Alchain · 網站 `huasheng.ai`
- 內容形態：中文 PDF（4.3MB，完整版）+ 英文 PDF（859KB）+ 微信讀書免費上架

### 1.3 橙皮書系列

這是**橙皮書系列**中的 Loop Engineering 卷。該系列已出版 **12 本**、合計 **994 頁**、全部免費，可在 `huasheng.ai/orange-books` 獲取：

| 卷 | 書名 | 頁數 |
|----|------|------|
| 01 | Claude Code 從入門到精通 | 102 |
| 02 | Claude Code 原始碼解析 | 72 |
| 03 | Harness Engineering（前置知識） | 102 |
| 04 | Agent Skills | 80 |
| 05 | OpenClaw | 120 |
| 06 | Hermes Agent | 63 |
| 07 | Cursor 從入門到精通 | 50 |
| 08 | Gemma 4 完全指南 | 42 |
| 09 | Polymarket 指南 | — |
| 10 | Claude Opus 4.7 System Card 中文版 | 232 |
| 11 | OpenAI Codex 從入門到精通 | 95 |
| 12 | 創始人行動手冊 | 36 |

### 1.4 它解決什麼問題？

過去兩年，從編碼代理獲取價值的方式是：寫一個好的提示詞 → 分享上下文 → 讀回覆 → 再寫下一個提示詞。**人類一回合又一回合地握著工具。** Loop Engineering 斷言這個時代正在結束：現在你構建一個系統，讓它去找工作、發工作、檢查工作、記錄工作、決定下一步——**是系統在戳代理，而不是你在戳代理。** 這本書就是教你如何構建這個系統的落地手冊。

---

## 二、核心思想

### 2.1 範式轉移：從「提示者」到「系統設計者」

- 傳統做法：人寫提示詞 → AI 執行 → 人檢查 → 人再寫提示詞。
- Loop Engineering 的做法：人設計循環 → 循環自動提示 AI → AI 自主執行 → 循環自動驗證 → 循環自動記錄。
- **人從「操作員」變成「架構師」**——你的價值不再是寫出更好的提示詞，而是設計出更好的控制系統。

> "I don't prompt Claude anymore. I have loops running that prompt Claude and figuring out what to do. My job is to write loops."（我不再提示 Claude 了。我有正在運行的循環在提示 Claude 並決定該做什麼。我的工作是寫循環。）——Boris Cherny，Anthropic Claude Code 負責人

> "You shouldn't be prompting coding agents anymore. You should be designing loops that prompt your agents."（你不應該再提示編碼代理了。你應該設計循環來提示你的代理。）——Peter Steinberger

### 2.2 四層棧：prompt → context → harness → loop

```
prompt（提示詞）→ context（上下文）→ harness（腳手架）→ loop（循環）
```

- **Prompt**：單條指令。
- **Context**：你給代理的工作素材。
- **Harness**：單次代理運行的腳手架——工具、完成標準、回饋迴路。
- **Loop**：外層系統——按定時器運行、派生子代理、驗證結果、記住狀態、決定下一步。

Loop Engineering **比 Harness Engineering 高一層**：harness 是武裝單次運行，loop 是武裝整個系統。

### 2.3 一個循環的五個動作 + 記憶

| 動作 | 在循環中的職責 |
|------|--------------|
| **自動化（Automations）** | 按調度自主出去做發現 + 分診 |
| **工作樹（Worktrees）** | 讓並行工作的兩個代理互不踩腳 |
| **技能（Skills）** | 把代理本來只能靠猜的專案知識寫下來 |
| **插件/連接器（Plugins/Connectors）** | 把代理插進你已經在用的工具（MCP） |
| **子代理（Sub-agents）** | 一個負責產出想法，另一個負責檢查 |
| **+ 記憶/狀態（Memory）** | 一個 markdown 檔案、Linear 看板——任何存在於單次對話之外、記錄「做了什麼、下一步做什麼」的東西 |

### 2.4 製作/檢查分離：為什麼 AI 不能給自己的程式碼打分

書的第五章專門論證：**寫程式碼的 AI 不能給自己寫的程式碼打分。** 生成與評估必須分離到不同的代理（或不同的模型實例）中——作者稱之為 **"GANs for prose"**（散文版生成對抗網路）。`/goal` 命令就是這一原則的體現：它持續工作直到一個可驗證的停止條件成立，而**由另一個獨立的⼩模型檢查你是否完成**——寫程式碼的代理不是打分的那一個。

---

## 三、詳細教程：9 個章節帶你走完整個循環

書分 **4 大部分、9 個章節**，下面按章節梳理。

### 3.1 §01–§02 它是什麼：定義與「一週起源故事」

- **§01 定義**：Loop Engineering 的正確定義與邊界——它不是提示詞的升級，而是提示詞之外的系統層。
- **§02 起源**：2026 年 6 月那個病毒式傳播的一週，三位行業人物（Peter Steinberger、Boris Cherny、Addy Osmani）獨立命名了同一個轉變；並給出 **prompt → context → harness → loop** 四層棧。

### 3.2 §03 一個循環的五個動作

第五章（§03）詳細展開每個動作如何在真實循環中工作：調度負責發現與分診、工作樹負責隔離並行、技能負責持久化知識、連接器負責接真實工具、子代理負責製作/檢查分離，外加記憶作為「第六件事」。

### 3.3 §04 構建循環的六個部件

- 把五個動作映射到你的工具上，就有了六大部件：**調度器、工作樹、技能檔案、插件/連接器、子代理定義、狀態儲存**。
- 關鍵原語在兩大工具間幾乎是**一一對應**的：

| 原語 | 在循環中的職責 | Codex App | Claude Code |
|------|--------------|-----------|-------------|
| **自動化** | 按調度發現 + 分診 | Automations 標籤頁、`/goal` | 定時任務、`/loop`、`/goal`、hooks、GitHub Actions |
| **工作樹** | 隔離並行特性 | 每執行緒內建工作樹 | `git worktree`、`--worktree`、`isolation: worktree` |
| **技能** | 固化專案知識 | `SKILL.md`，用 `$name` 呼叫 | `SKILL.md`（同一格式） |
| **插件/連接器** | 連接你的工具 | MCP 連接器 + 插件 | MCP 伺服器 + 插件 |
| **子代理** | 產出與驗證 | `.codex/agents/` 裡的 TOML | `.claude/agents/` 裡的任務子代理 |
| **狀態** | 追蹤進度 | markdown 或 Linear | markdown（`AGENTS.md`）或經 MCP 接 Linear |

### 3.4 §05 為什麼 AI 不能給自己的程式碼打分

- **驗證原則**：寫程式碼的代理不能給程式碼打分——「製作器」與「檢查器」必須分離。
- 這也是 `/goal` 命令的設計根源：一個獨立的⼩模型負責檢查「是否已完成」（例如「test/auth 下所有測試通過且 lint 乾淨」）。

### 3.5 §06 三個真實的循環

1. **Addy 的早晨分診循環**：每天早上定時跑一個自動化 → 呼叫分診技能讀取昨天的 CI 失敗、打開的 issue、最近的 commit → 把發現寫進 markdown 檔案或 Linear 看板 → 對每個值得做的事，開一個隔離工作樹 → 派一個子代理起草修復 → 派第二個子代理按專案技能和既有測試審查 → 連接器開 PR、更新 ticket。
2. **Stripe 的 Minions**：Stripe 的自主編碼系統，**每週處理約 1,300 個 PR**——流水線式的循環工程在生產規模上的活例子。
3. **調度的現實**：定時驅動帶來它自己的工程挑戰——狀態管理、失敗恢復、人類監督，「按定時器跑」並不是免費的。

### 3.6 §07 四種代價（越自治越尖銳）

1. **驗證債（Verification Debt）**：無人值守的循環也在無人值守地犯錯。「製作/檢查分離」讓「做完了」變得有意義，但它仍然是一個聲明，而不是一個證明。
2. **理解腐化（Comprehension Rot）**：循環越快產出你沒寫過的程式碼，已存在的東西與你真正理解的東西之間的鴻溝就越大。順滑的循環會讓理解債長得更快——除非你讀循環產出的東西。
3. **Token 爆炸（Token Blowout）**：不加約束的循環可能吞噬巨量 token。你是「token 富有」還是「token 貧窮」決定用法天差地別，精心設計停止條件至關重要。
4. **認知投降（Cognitive Surrender）**：當循環自己跑起來時，你會忍不住放棄自己的判斷，它給什麼就收什麼。**設計循環是解藥——但當它被用來逃避思考時，它就是助燃劑。同樣的動作，相反的結果。**

### 3.7 §08 留在工程師的位置上

- 循環改變了工作，但它**不會把你從工作中刪除**。
- 兩個完全相同的循環，兩個人可以跑出相反的結果——一個人用它來加速自己深刻理解的工作；另一個人用它來逃避理解工作本身。

> "The loop doesn't know the difference. You do."（循環不知道區別。你知道。）

### 3.8 §09 今天就開始：構建你的第一個循環（手把手）

**Step 1：選一件小事**
選一個重複性的、你有明確驗收標準的小雜活（例如每日 issue 分診、每日 CI 清掃報告）。

**Step 2：定調度**
決定頻率與觸發方式。用 Claude Code 的定時任務/`/loop`，或 GitHub Actions cron，或 Codex 的 Automations 標籤頁。

**Step 3：寫技能**
把「這個專案怎麼跑、為什麼不能這麼做」寫進 `SKILL.md`——循環的每一輪都會從冷啟動開始，技能就是你的「外化意圖」。

**Step 4：搭狀態**
建一個 `STATE.md`（或 Linear 看板），記錄「做了什麼、下一步做什麼」——這是記憶，是第六件事。

**Step 5：製作/檢查分離**
在 `.claude/agents/` 或 `.codex/agents/` 裡定義兩個子代理：一個起草，一個按技能與測試審查。**寫程式碼的不打分。**

**Step 6：第一週只報告，不修復**
讓循環只輸出發現，不自動改程式碼。讀它的輸出，糾正錯誤的部分——**你仍然是工程師。**

**Step 7：逐步放開**
第一週只報告 → 第二週在隔離工作樹裡嘗試修復 → 確認無誤後再考慮自動合併。每一條 `AGENTS.md` 或技能裡的規則，都應能追溯到一個具體的過去失敗——**每一行都要掙來。**

### 3.9 工具與命令速查

- Claude Code：`/goal`（跑到可驗證停止條件）、`/loop`（按節奏重跑）、定時任務/cron、hooks、GitHub Actions、`git worktree`/`--worktree`、`isolation: worktree`、`.claude/agents/`
- Codex App：Automations 標籤頁（選專案/提示詞/節奏/環境）、分診收件箱、每執行緒內建工作樹、`.codex/agents/` TOML
- 兩者通用：`SKILL.md` 技能格式、MCP 連接器、插件分發

---

## 四、設計哲學

### 4.1 「構建系統，而不是當提示者」

中心哲學：**你停止一回合又一回合地驅動代理，而是設計一個外層系統讓它自己驅動。** 你的工作從操作員變成架構師。循環是可複用、可版本化、可審計的——提示詞是一次性的。

### 4.2 循環在 Harness 之上

Loop Engineering **比 Harness Engineering 高一整層**。harness = 武裝一次代理運行；loop = 外層外殼——按定時器跑、派生子代理、驗證工作、記住狀態、決定下一步。

### 4.3 棘輪原理：每一次錯誤都變成一條規則

**"Every mistake becomes a rule."** 代理犯錯，你就加一條約束讓它永不再犯。`AGENTS.md` 或技能裡的每一行都應能追溯到一次具體的失敗——**掙來每一行**（Earn each line）。循環是複合的：錯誤被規則吸收，規則讓系統下次更強。

### 4.4 工作樹即並行紀律

兩個代理寫同一個檔案 = 兩個工程師提交同一行程式碼的頭痛。Git worktree 修復了它：獨立工作目錄、獨立分支、共享倉庫歷史——**編輯在物理上不可能互相碰到。**

### 4.5 技能是外化的意圖

代理每一輪都是冷啟動。技能就是「寫在外部的⼤腦」——約定、構建步驟、「我們為什麼不這樣做」。沒有技能，循環每輪都從零重新推導專案上下文；有了技能，循環開始**複利**。

### 4.6 產品在趨同，不在發散

Claude Code、Cursor、Codex、Aider、Cline——**它們長得比它們的底層模型更像彼此。** 模型各不相同，但 harness 模式在收斂。這標誌著行業正在找到把生成式模型變成「能交付的東西」的那些承重腳手架。

> "A decent model with a great harness beats a great model with a bad harness."（不錯的模型 + 優秀的 harness，勝過優秀的模型 + 糟糕的 harness。）

---

## 五、歸納總結：觀點與結論

1. **提示詞工程的時代在結束，循環工程的時代在開始。** 三位行業領袖同一週獨立說出同一件事，說明這不是炒作，而是行業共識在成形。人從「提示者」變成「系統設計者」。

2. **循環的價值在於複合，不在於單次。** 提示詞是一次性的，循環是可複用、可版本化、可審計的資產。錯誤被棘輪原理吸收成規則，規則讓系統每輪更強。

3. **製作/檢查分離是安全的基石。** AI 不能給自己的程式碼打分——這是書裡最硬的技術論點。生成與評估必須分離（"GANs for prose"），獨立⼩模型檢查「是否完成」。

4. **自治不是免費的，四種代價會隨自治加深而尖銳。** 驗證債、理解腐化、token 爆炸、認知投降——`/goal` 的停止條件、隔離工作樹、人類門控，都是為了給這四種代價裝上煞車。

5. **同樣的循環，不同的人，相反的結果。** "The loop doesn't know the difference. You do." 循環是放大器：加速深刻理解的人，也加速逃避理解的人。**留在工程師的位置上（Stay the engineer）是唯一正確的使用姿勢。**

6. **第一週只報告，不修復。** 新系統上線第一週只輸出發現、不自動改程式碼——先建立對系統行為的理解與信任，再逐步放開權限。這是 Loop Engineering 的安全哲學。

7. **工具在趨同，說明行業找到了承重牆。** 各大編碼代理的 harness 模式收斂，意味著「把模型變成能交付的東西」的腳手架已被驗證——這是整個行業的範式訊號。

> "Build the loop. But build it like someone who intends to stay the engineer, not just the person who presses go."（構建循環。但要像打算一直當工程師的人那樣構建，而不是像只負責按開始鍵的人那樣。）

---

## 參考資料

- 儲存庫：`https://github.com/alchaincyf/loop-engineering-orange-book`
- 中文 PDF：`https://github.com/alchaincyf/loop-engineering-orange-book/raw/main/Loop-Engineering橙皮書-v260615.pdf`
- 英文 PDF：`https://github.com/alchaincyf/loop-engineering-orange-book/raw/main/Loop-Engineering-The-Complete-Guide-v260615.pdf`
- 橙皮書系列：`https://huasheng.ai/orange-books`（12 本全免費）
- 作者主頁：`https://huasheng.ai` · X：@AlchainHust
- 來源基礎：Addy Osmani《Loop Engineering》奠基文（2026-06-07）、Anthropic harness-design 工程部落格、Stripe Minions 公開案例、Claude Code / Codex 官方文件
