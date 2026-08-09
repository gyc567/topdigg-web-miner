---
title: "Claude Code 增強全家桶深度解析：gstack · Superpowers · Compound Engineering · ECC — 把 AI 助手變成你的 20 人虛擬工程團隊"
description: "全面解析 eric-claude-code-dev 專案集成的四大 Claude Code 增強工具：gstack（YC CEO Garry Tan 的軟體工廠，15 個專業角色）、Superpowers（GitHub 前 CTO Jesse Vincent 的自動觸發開發工作流）、Compound Engineering（Every 公司的複利工程，每次工作讓下次更容易）與 Everything Claude Code（Anthropic Hackathon 獲獎的 Token 優化系統）。本文用小學生也能懂的比喻講透『把 AI 變成虛擬工程團隊』的核心思想，提供完整的安裝教學、核心指令詳解（/office-hours、/ce:brainstorm、/tdd 等）、組合使用四情境指南，歸納四大設計哲學（技能即軟體、自動觸發、複利思維、子 Agent 編排），並總結『寫程式碼只是最後一步』『知識要沉澱而不是跟著人走』等核心觀點。"
date: "2026-08-09"
author: "TopDigg Research Team"
tags: ["Claude Code", "AI Agent", "gstack", "Superpowers", "Compound Engineering", "ECC", "Garry Tan", "Jesse Vincent", "Developer Tools", "AI Workflow", "TDD", "Open Source"]
categories: ["深度解析"]
keywords: ["Claude Code 增強", "gstack", "Superpowers", "Compound Engineering", "Everything Claude Code", "AI 開發工作流", "虛擬工程團隊", "複利工程", "子 Agent", "TDD", "程式碼審查", "Git worktree", "技能系統", "Token 優化", "開源工具"]
---

# Claude Code 增強全家桶深度解析：gstack · Superpowers · Compound Engineering · ECC —— 把 AI 變成你的 20 人虛擬工程團隊

> **核心思想：** 寫程式碼只是最後一步。真正的開發工作 80% 花在「想清楚要做什麼、怎麼拆、怎麼驗證」上。eric-claude-code-dev 把四個免費開源的 Claude Code 增強工具打包成一個「虛擬工程團隊」：gstack 給你 15 個專業角色（從 CEO 到 QA 工程師）、Superpowers 讓技能像流水線一樣自動觸發（從構思到發布不用每次手動指揮）、Compound Engineering 讓每次工作都「滾雪球」（知識沉澱，下次更輕鬆）、ECC 幫你省 Token 還記住一切。裝上它們，一個普通開發者也能像 20 人團隊一樣一天寫 10,000+ 行生產程式碼。

---

## 一、這是什麼？（小學生也能懂版）

想像你是一個「光桿司令」，想開一家軟體公司做一個 App。你心裡想得很好，但發現一個人幹不了所有事：要有人想產品（CEO）、有人畫圖紙（設計師）、有人記帳規劃（工程經理）、有人寫程式碼（程式設計師）、有人檢查 bug（QA）、還有人負責發布（發布工程師）……

**雇 20 個人太貴了。怎麼辦？讓 AI 來當你的整個團隊！**

Claude Code 本來是一個「很會寫程式碼的 AI 助手」。而這個儲存庫裡的四套工具，就是給這個助手裝的四個「超級外掛」，讓它一個人扮演整個團隊：

- **gstack = 「公司組織架構圖」**：裝上一整套「角色」，每個角色都有一本《職務說明書》（技能）。想產品時呼叫「CEO」，想寫程式碼時呼叫「程式設計師」，想發布時呼叫「發布工程師」——AI 會按不同角色做不同的事。
- **Superpowers = 「自動流水線」**：它教 AI 一套「開工流程」：先想（構思）→ 再規劃（計畫）→ 然後寫（實作）→ 檢查（審查）→ 測試（測試）→ 發布（發布）。**厲害的是這套流程會自動接力**：你說完需求，它自動知道下一步該做什麼，像流水線上的老師傅盯著每一步，不用你事無鉅細地指揮。
- **Compound Engineering = 「複利存錢罐」**：每次幹完活，它都幫你把「這次學到了什麼」記錄下來、存進知識庫。下次遇到類似問題，直接拿出來用。像存錢一樣：每次存一點，利息越滾越多，**你越用越輕鬆**。
- **ECC（Everything Claude Code）= 「聰明的省錢助手」**：它幫 AI 用最少的錢（Token）幹活，還幫你記住工作做到哪了——就算你關掉電腦，下次打開「它還記得」。

**一句話總結：這四個東西合起來，就是把一個厲害但孤獨的 AI 程式設計師，變成一個有條理、有分工、會復盤、記得住事的一整個團隊。**

---

## 二、專案說明

### 2.1 基本資訊

- **專案名稱**：eric-claude-code-dev（一個整合指南儲存庫，收錄了四套 Claude Code 增強方案）
- **開源網址**：[https://github.com/gyc567/eric-claude-code-dev](https://github.com/gyc567/eric-claude-code-dev)
- **四大組成**：
  - **gstack** — [Garry 的軟體工廠](https://github.com/garrytan/gstack)，作者是 Y Combinator 總裁 Garry Tan
  - **Superpowers** — [GitHub 前 CTO Jesse Vincent 的完整工作流](https://github.com/obra/superpowers)
  - **Compound Engineering** — [Every 公司的複利工程](https://github.com/EveryInc/compound-engineering-plugin)
  - **Everything Claude Code (ECC)** — [Anthropic Hackathon 獲獎的優化系統](https://github.com/affaan-m/everything-claude-code)
- **授權**：全部免費開源（MIT License）
- **前置需求**：Claude Code + Git + Bun（用於輔助安裝/腳本）
- **定位**：把 Claude Code 從「AI 助手」升級成「完整的虛擬工程團隊」

### 2.2 它要解決什麼問題？

現代軟體開發有一個尷尲：**AI 很會寫程式碼，但工程不只是寫程式碼。**

真實團隊裡，寫程式碼只佔到 20%，剩下 80% 是需求討論、方案評審、測試、排查 bug、發布、復盤。一個人用 AI 時，這些環節要嘛被跳過（做出沒人要的功能），要嘛全靠自己手動指揮 AI（累死）。

三位作者分別從不同角度回答了「到底怎麼用 AI」這個問題：

- **Garry（YC 總裁）**：把 AI 當成一個可以扮演任何角色的「演員」，關鍵是給它寫好《角色說明書》——於是有了 gstack 的 15 個角色。
- **Jesse**（GitHub 前 CTO）：把整個開發流程**標準化**成一條自動觸發的技能鏈——於是有了 Superpowers。
- **Every 公司**：重點不是「這一次做得多快」，而是「下次怎麼做更快」——於是有了複利工程。
- **ECC 作者**：AI 越用越貴、越用越忘，那就**省 Token + 記住一切**——於是有了 Everything Claude Code。

### 2.3 三大核心概念（全部用白話）

- **技能（Skill / Command）= 角色說明書**：一段特殊的說明文字，裝在一個叫 SKILL.md 的檔案裡。告訴 AI 在什麼情況觸發、該怎麼做。gstack 有 15 個角色技能，Superpowers 有一整條技能鏈，Compound 有 /ce: 系列指令。
- **自動觸發（Auto-trigger）= 會讀心的流水線**：Superpowers 不用你記指令——AI 自己判斷「現在該構思了」就觸發 brainstorming，該寫計畫了就觸發 writing-plans，一環接一環。
- **複利 = 越幹越輕鬆的祕訣**：每完成一次工作，把經驗、踩過的坑、寫過的模式記進文件和知識庫。下次這些知識自動被呼叫（Compound Engineering 的核心）。
- **工作樹隔離 = 一人多工的辦公室**：用 git worktree 給每個功能開一個獨立的工作目錄，互不干擾，可以並行開工好幾個任務。
- **子 Agent = 你派出去幹活的手下**：主 AI 把任務拆給好幾個子 Agent 並行執行，再用專門的審查 Agent 檢查，兩階段保證品質。

---

## 三、詳細教學（手把手版）

### 4.1 安裝（10 分鐘裝完）

**前置設備**：一台裝了 Claude Code 的電腦 + Git + Bun（bun.sh 一鍵安裝）。

**裝 gstack（全域技能包）**：開啟終端機，在 Claude Code 裡輸入：

```bash
git clone https://github.com/garrytan/gstack.git ~/.claude/skills/gstack && cd ~/.claude/skills/gstack && ./setup
```

**裝 Superpowers（官方市集）**：在 Claude Code 裡輸入：

```bash
/plugin install superpowers@claude-plugins-official
```

如果市集找不到，先新增市集再安裝：

```bash
/plugin marketplace add obra/superpowers-marketplace
/plugin install superpowers@superpowers-marketplace
```

**裝 Compound Engineering**：

```bash
/plugin marketplace add EveryInc/compound-engineering-plugin
/plugin install compound-engineering
```

**裝 ECC（選用，兩種方式都行）**

```bash
# 方式一：官方安裝腳本
git clone https://github.com/affaan-m/everything-claude-code.git
cd everything-claude-code && ./install.sh

# 方式二：手動複製到技能目錄
cp -r . ~/.claude/skills/everything-claude-code
```

**驗證安裝成功**

新開一個 Claude Code 對話，分別輸入：

```
/office-hours      # gstack - 應該彈「給新想法提建議」
/brainstorm        # Superpowers - 應該讓你描述需求
/ce:brainstorm     # Compound - 應該開始細問你想做什麼
```

看到 AI 有反應，就表示裝好了！如果沒反應，檢查技能目錄裡的檔案是否齊全。

### 4.2 第一個完整案例：幫部落格加留言功能（全流程演練）

這是一條完整的「虛擬團隊流水線」——**強烈建議依序跟著敲一遍**。

**第一步：開需求會（gstack 的 /office-hours + /plan-ceo-review）**

在 Claude Code 裡輸入：

```
/office-hours
```

AI 會扮演「YC 創業顧問」，用六問問你：給誰用？解決什麼痛點？和現有方案比有什麼不同？怎麼算成功？……

你回答完，再輸入：

```
/plan-ceo-review
```

它變成「CEO」，從「能不能做出 10 星產品」的角度檢視你的方案，挑戰你的假設。此時你會拿到一份**設計文件**。

**第二步：上計畫（/plan-eng-review）**

輸入：

```
/plan-eng-review
```

AI 變成「工程經理」，把設計文件拆成技術方案：用什麼資料庫、介面怎麼設計、資料結構長什麼樣、邊界情況有哪些。**從這一步開始，你其實已經知道功能「長什麼樣」了。**

**第三步：細化需求（Superpowers 的 brainstorming）**

在新的對話輸入：

```
/brainstorm
```

Superpowers 會繼續問問題把需求細化（「留言怎麼排序？要不要審核？」），你用幾句話回答後，它把最終設計展示給你確認。

**第四步：寫實作計畫（/ce:plan）**

輸入：

```
/ce:plan
```

它能讀取前面的需求文件，自動產生一份**可以執行的任務清單**。例如：

```markdown
## 任務 1: 建立留言資料庫模型
- 檔案: src/models/comment.ts
- 驗證: bun test models/comment.test.ts

## 任務 2: 實作留言 API 端點
- 檔案: src/routes/comments.ts
- 驗證: curl localhost:3000/api/comments
```

每個任務都有精確的檔案路徑、程式碼和驗證方式，清楚到可以交給子 Agent 直接執行。

**第五步：開工（/ce:work + Superpowers 子 Agent）**

輸入：

```
/ce:work
```

它建立隔離的 git worktree、拆任務、派出子 Agent 並行執行，每個任務完成後自動原子提交。實作出錯會暫停等你確認。

**第六步：強制測試（TDD）**

Superpowers 強制走 RED-GREEN-REFACTOR 三步：

1. **先寫一個會失敗的測試**（RED）
2. **寫最少的程式碼讓測試通過**（GREEN）
3. **重構優化，再提交**（REFACTOR）

如果你先寫程式碼再寫測試，它會「生氣」地刪掉你的程式碼讓你重寫——**TDD 是強制的**。

**第七步：程式碼審查 + QA + 發布**

走一遍品質關：

```
/review        # gstack：自動修 bug，標出關鍵問題
/ce:review     # Compound：4 個審查 Agent 從正確性/安全/效能/測試四視角挑毛病
/qa            # gstack：用真實瀏覽器跑回歸測試
/ship          # 同步主分支、跑測試、推送、自動開 PR
```

**第八步：復盤，讓下次更容易（/ce:compound）**

```
/ce:compound
```

AI 問你三句話：這次學到了什麼？什麼情況會出問題？給未來的自己什麼建議？——然後把這些寫進文件、知識庫。**這就是讓「下次更快」的複利動作。**

### 4.3 四個工具的常用指令表

**gstack（15 個角色技能）**

- **/office-hours** — YC 顧問：六問重構你的想法，挑戰假設
- **/plan-ceo-review** — CEO：挑「10 星產品」視角
- **/plan-eng-review** — 工程經理：鎖定架構、資料流、邊界情況
- **/plan-design-review** — 資深設計師：設計評審、掃垃圾
- **/review** — 資深工程師：自動修 bug、找出生產問題
- **/qa** — QA 負責人：真實瀏覽器測試 + 回歸測試
- **/investigate** — 系統化除錯：根因排查
- **/ship** — 發布工程師：同步、測試、推送、開 PR
- **/browse** — 瀏覽器手：端到端測試

**Superpowers 技能鏈**（自動觸發，不用記）

- **brainstorming** — 你說「I want……」時觸發：蘇格拉底式細化設計
- **using-git-worktrees** — 設計核准後觸發：隔離環境
- **writing-plans** — 有設計文件後觸發：拆成 2-5 分鐘任務
- **subagent-driven-development** — 有計畫後觸發：子 Agent 執行 + 兩階段審查
- **test-driven-development** — 實作中觸發：強制 RED-GREEN-REFACTOR
- **systematic-debugging** — 有 bug 時觸發：四階段根因分析
- **requesting-code-review** — 任務之間觸發：依嚴重程度回報問題
- **finishing-a-development-branch** — 任務完成觸發：決定合併/PR/保留/丟棄

**Compound Engineering 指令**

- **/ce:ideate** — 發散找改進點，對抗式過濾
- **/ce:brainstorm** — 需求探索（問答）+ 產生需求文件
- **/ce:plan** — 技術計畫轉成可執行任務
- **/ce:work** — 工作樹執行 + 原子提交
- **/ce:review** — 4 個審查 Agent 多視角挑毛病
- **/ce:compound** — 復盤 + 記錄知識（複利）

**ECC 指令**

- **/tdd** — 強制走 TDD 三步循環
- **/plan** — 需求分析 + 任務拆解
- **/e2e** — 產生並執行端到端測試
- **/code-review** — 品質審查（Critical/High/Medium）
- **/build-fix** — 修復建置錯誤
- **/learn** — 從對話中提取可重複使用的模式產生技能
- **/worktree** — 並行工作樹

### 4.4 組合使用的高級玩法

**情境 1：啟動新功能**

```bash
/office-hours   → /plan-ceo-review   → /plan-eng-review   → /ce:plan
```

先用 gstack 定方向，再用 Superpowers brainstorming 細化，最後 CE 出可執行計畫。**三套工具各管一段，串成「從靈感到任務清單」的完整鏈條。**

**情境 2：實作功能**

```
/ce:work → subagent-driven-development → test-driven-development → 寫程式碼
```

**情境 3：審查 + 除錯**

```
/review → /ce:review → /qa → /investigate（若發現 bug）
```

**情境 4：發布 + 復盤**

```
/ship → /document-release → /ce:compound
```

---

## 四、設計哲學（這套系統為什麼這樣設計？）

### 4.1 技能即產品：把「經驗」變成可安裝的程式碼

gstack 的每個角色（CEO、QA、發布工程師）、Superpowers 的每個流程，都是一個個寫著詳細說明的 Markdown 檔案（技能）。**你看過的教學、踩過的坑、團隊的小規矩，都可以被編成技能讓 AI 嚴格執行**。這是「專家經驗的原始碼化」——不寫程式，一樣能「寫」出有用的工程能力。

### 4.2 自動化優於指揮：讓流程自己走

Superpowers 最大的突破是**自動觸發（auto-trigger）**：你不需要記指令，AI 會根據對話狀態自動進入下一階段。這接近真正的人類團隊工作方式——leader 不需要指揮每一步，團隊成員自己知道「設計完了該寫計畫了」。

### 4.3 複利思維：讓每一次工作都產生複利

「複利工程」的精髓：**傳統開發是「每次加功能程式碼更難維護」，複合工程是「每次工作都留下知識讓下次更容易」**。技術債 vs 知識資產，選後者。

### 4.4 子 Agent 編排：兩階段審查保證品質

Superpowers 和 CE 都採用同一個模式：**主 Agent 拆任務 → 子 Agent 執行 → 獨立審查 Agent 複查**。執行和審查分離，像真實公司讓 code review 的人不寫功能程式碼——避免「自己檢查自己」的盲區。

### 4.5 並行是超越單人的祕密

gstack 是「過程」不只是工具：支援 10-15 個並行 sprint（一個聊想法、一個改 PR、一個寫新功能、一個做 QA）。這也是「一天寫 10,000+ 行程式碼」的答案——不是寫得快，是**同時做多件事**。

### 4.6 一切免費開源

gstack / Superpowers / Compound / ECC 全部 MIT License。核心結論：**最強的 AI 開發工具不是那些付費的商業產品，而是社群開放迭代出來的技能體系**。

---

## 五、歸納總結：核心觀點與結論

如果你只記住這幾條，就抓住了整個專案的精髓：

1. **「寫程式碼」只是最後一道工序**——真正的工程 80% 時間是思考、計畫、審查。這套工具鏈把「動手前」和「動手後」的環節全包了，反而讓你花的時間大幅縮水。
2. **設計先行，計畫比程式碼貴**。有了詳細計畫和驗收標準，寫程式碼變成「照著填表」，AI 的錯誤率正好下降了。
3. **強制 TDD（測試先行）是提高品質的捷徑**——先寫失敗的測試，再讓程式碼通過，最後重構。這一套老方法讓 AI 程式碼也能達到線上品質。
4. **知識要沉澱，不能跟著人走**。技術債會「腐爛」，複利會累積：你每次做完，都問自己「下次怎麼做更快」。
5. **自動觸發 > 手動指揮**。人唯一的任務就是「說出需求 + 做決策」，剩下 AI 自動接力，效率最高。
6. **一人 + AI = 一個 20 人團隊**。不是誇張：gstack 一個對話推進一個新功能，另外幾個並行 QA/發布，利用 git worktree 隔離，完全合理。
7. **聖杯不在功能多少，在於流程是否閉環**。構思→計畫→開發→審查→測試→發布→復盤，這個循環走通，你才真正「會了」用 AI。

---

## 六、參考資源（繼續學習）

- eric-claude-code-dev（本指南）：https://github.com/gyc567/eric-claude-code-dev
- gstack（Garry 軟體工廠）：https://github.com/garrytan/gstack
- Superpowers（Jesse Vincent 工作流）：https://github.com/obra/superpowers
- Superpowers 官方部落格：https://blog.fsck.com/2025/10/09/superpowers
- Compound Engineering（複利工程）：https://github.com/EveryInc/compound-engineering-plugin
- Everything Claude Code（ECC 優化系統）：https://github.com/affaan-m/everything-claude-code

> **下一步行動清單（30 分鐘即可完成）：**
>
> 1. 安裝 gstack + Superpowers（約 10 分鐘）
> 2. 跑一個 /office-hours 測試你的產品想法（約 5 分鐘）
> 3. 允許 /ce:plan 產生任務清單（約 5 分鐘）
> 4. 完成開發後跑 /review 和 /ship（約 10 分鐘）
> 5. 最後別忘了 /ce:compound —— 讓下次更快！

**一起 ride the wave!** 🚀