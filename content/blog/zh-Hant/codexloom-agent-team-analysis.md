---
title: "CodexLoom — 從 Multi-Agent 到 Agent Team：讓 AI 代理從工具變成一支真正的團隊"
description: "深度解析 CodexLoom 的 Agent Team 最佳實踐：為什麼多個 Agent 不等於 Agent Team，怎樣讓 Agent 從一次性 Task 變成長期責任主體，透過 Profile、Message、Topic、Overview、External 五層結構，把原本集中在 Human 腦中的責任外化成整支團隊可用的工作結構。"
author: topdigg-web-miner
date: 2026-08-09
tags:
  - AI Agent
  - Agent Team
  - Multi-Agent
  - Codex
  - CodexLoom
  - 團隊治理
  - AI 協作
categories:
  - AI工具
  - 開發效率
---

# CodexLoom — 從 Multi-Agent 到 Agent Team：讓 AI 代理從工具變成一支真正的團隊

> **一句話說明**：CodexLoom 是一套把多條獨立的 Codex Thread 織成一支「長期負責、能夠協作、由 Human 治理」的 Agent Team 的工作方式與產品。它回答的核心問題是：**多個 Agent 什麼時候才真正成為一支 Team？** —— 不是當它們同時開始運行，而是當它們開始長期承擔不同責任、能夠找到彼此、直接協作、持續收口，並在 Human 的治理下共同推進真實工作。

---

## 📌 專案速覽

| 專案資訊 | 內容 |
|---------|------|
| **產品名稱** | CodexLoom |
| **官網** | [codexloom.ai](https://codexloom.ai) |
| **作者** | yan5xu（言午） |
| **解決的問題** | 把多個 AI 程式設計代理組織成一支可治理、可協作、可持續演化的 Agent Team |
| **核心載體** | Codex Thread（一條 Thread 綁定為一個長期存在的 Agent） |
| **文章形式** | 一份 Agent Team 的最佳實踐長文（楔子 + 07 章） |
| **發布平台** | 微信公眾號 |

這是一篇長文，也是一份 **Agent Team 的最佳實踐**。它來自作者長期運行一支真實 Agent Team 的過程——不是理論推演，而是踩坑之後的經驗總結。

---

## 🎬 開場故事：一次「意外」的外發

文章的開頭很戲劇化。

作者本來打算把做了一個多月的 CodexLoom 專案先上線 Landing Page，慢慢打磨。結果負責 Web 的 Agent 接到上線指令後，按照已有的協作關係，通知了負責對外溝通的 **Community Agent**。Community Agent 一看「大新聞」，馬不停蹄地整理素材，發到了飛書群裡。

等作者看到的時候，**消息已經發出去了**。

這件事看起來像「失控」，但作者卻覺得「它們」幹得不錯——因為整個過程中：

- 作者沒有站在幾個 Agent 中間，親自選擇下一步該找誰
- 沒有搬運 Context、轉述結果
- 工作仍然沿著已有的**責任、協作關係和授權邊界**繼續向前走

這次「意外」恰恰證明了 Agent Team 的價值：**當協作責任從 Human 轉移到 Agent 之後，工作不再需要 Human 親自串聯每一個步驟。**

---

## 🧠 核心思想：為什麼多個 Agent ≠ Agent Team

這是整篇文章的基石。

過去我們關心的是「怎樣讓單個 Agent 更強、能完成更長更複雜的任務」。但單個 Agent 的能力範圍總有上限，於是越來越多人開始同時使用多個 Agent。**Agent 多了，真正的瓶頸不再是單個 Agent 能做什麼，而是怎樣把這些 Agent 組織起來。**

作者給出一個非常尖銳的判斷：

> **多個 Agent，並不會自動成為一支 Agent Team。**
>
> 如果每一項工作仍然要由 Human 選擇入口、整理背景、搬運 Context，再把一個 Agent 的結果交給下一個 Agent，那麼這些 Agent 本質上仍是一組獨立工具。Human 仍然是整個系統裡唯一的 Router，也是事實上的瓶頸。

作者用一個「連續責任線」模型來解釋 Agent 的演化路徑：

1. **Task** —— 一次性、邊界清楚的工作（工作單位）
2. **Long-running Agent** —— 同一類責任開始有持續存在的主體（生命週期）
3. **Domain Agents** —— Scope 擴張、能力劣化後分化出的專業邊界（分工）
4. **Human Router** —— 多個 Agent 出現後，協作瓶頸轉移到 Human（瓶頸轉移）
5. **Agent Team** —— 責任、關係、交接方式被外化，協作責任轉移給 Agent（組織）

> **核心判斷**
>
> 真實工作反覆回來，逼出了 Long-running Agent；Scope 擴張與能力劣化，逼出了多個 Domain Agents；Agent 的分化，又把協作瓶頸集中到了 Human。

Agent 分化只是產生了多個 Agent。只有原本藏在 Human 腦子裡的責任、關係和交接方式被逐漸外化，一部分協作責任開始從 Human 轉移給 Agent，它們才可能真正成為一支 Team。

---

## 🏗️ 詳細教程：從 Multi-Agent 到 Agent Team 的六步方法論

以下按作者原文的章節脈絡，整理成可操作的六步教程。每一步回答一個關鍵問題，並給出對應的 CodexLoom 機制。

### 第一步：從 Task Agent 變成 Long-running Agent

**問題：一個 Agent 為什麼必須長期存在？**

大部分人開始使用 Agent 時，面對的都是一個 Task：新建一個 Thread，告訴它完成什麼，它呼叫工具、執行任務、給出結果，任務完成，工作結束。

但真實工作並不是一個個彼此獨立的 Task。**一個 Task 可以完成，它背後的責任卻不會隨之結束。**

- 一篇文章寫完了，之後還會繼續修改
- 一個頁面上線了，後面還要不斷迭代
- 今天研究過的公司，下個月有了新產品、新融資、新數據，還會再次進入視野

每一次回來都不是簡單重複。上一次的背景、判斷和錯誤仍然有用，Human 給過的糾正、偏好和邊界，也應該繼續影響下一次工作。

> **Task 是一次工作的切片，但真實工作是一條持續流動的責任線。**

如果每次都新建一個 Agent，人就要重新解釋背景、重新告訴它偏好、重新說明邊界，甚至**重新踩一遍已經糾正過的錯誤**。反覆冷啟動更深的成本不是 Token，而是**每次都在重新建立合作關係**。

所以最自然的選擇是：讓 Agent 保留在同一個 Thread 中，下一次從上一段工作繼續。過去的工作、人的糾正，以及被 Summary、Memory、Skill 等機制保留下來的經驗，開始影響下一輪。這時它就從 Task Agent 變成了 **Long-running Agent**。

> Long-running 不是單純把一次對話拉得很長，而是同一類責任開始有了一個持續存在的主體。

### 第二步：讓「誰負責什麼」離開 Human 的腦子

**問題：Agent 分化後，瓶頸為什麼轉移到了 Human？**

一個 Agent 變得越來越好用以後，人會不斷把更多工作交給它。一開始讓它寫文章，後來找材料、研究事實、管理內容，再往後連頁面、SEO、對外分發也一起交給它。不同工作的高解析度 Context、工作方法和專業判斷開始擠在一起，Agent 變慢、品質下降、需要反覆糾正。

**Domain 不是先畫出來的領域標籤，而是在持續使用、Scope 擴張和能力劣化中逐漸顯現的工作邊界。** 它回答的是：哪些事情適合由同一個 Agent 長期負責，哪些事情應該從中分出去。

分化之後，單個 Agent 的 Context 壓力下降了，但新的問題出現了：**協作仍然發生在 Human 的腦子裡**。每次有新工作，還是由人判斷應該找哪個 Agent；做完以後，由人讀懂結果、判斷能不能用，再轉交給下一個 Agent。

> Agent 可以並行，但 Human 仍然只能逐個閱讀、逐個判斷、逐個路由。Agent 越多，Human 需要維護的 Context 和協作關係也越多。

**解法：讓每個 Agent 成為穩定、可識別的長期主體。**

CodexLoom 做的第一件事，不是讓 Agent 之間立刻開始互相發消息，而是先讓每個 Agent 擁有一個 **Profile**。Profile 回答三個對組織非常重要的問題：

- **Identity** —— 它是誰
- **Domain** —— 它長期負責什麼
- **Scope** —— 它在哪裡停止，什麼事情不屬於它

關鍵點：Profile **不是**建立 Agent 時一次寫死的。更準確的順序是：

> **不是**：建立 Agent → 填寫 Profile → 得到一個 Domain Agent
>
> **而是**：真實工作暴露邊界 → Profile 保存當前理解 → 後續工作繼續驗證和修正

Profile 不是最終答案，而是**這支 Team 當前採用的組織假設**。

在此基礎上，CodexLoom 用三種結構記錄團隊關係：

- **Organization** —— 記錄 parent/child 的長期責任邊界（一個更大的責任下是否已分化出穩定的子責任）
- **Collaboration** —— 記錄有方向的長期協作介面（兩個獨立 Domain 之間反覆出現的協作邊界）
- **Activity** —— 記錄一定時間內真實發生過的 Message 協作（運行證據）

> **重要區分**：Profile、Organization、Collaboration 保存的是**聲明**（組織假設），Activity 記錄的是**運行證據**。二者不能互相替代。寫下一條 Collaboration 不能證明雙方配合得好，經常互發消息也不會自動形成長期 Collaboration。

**驗證標準（第一步分水嶺）**：

> **關鍵問題**
>
> 當工作需要協作時，當前 Agent 仍然只能回頭問 Human「我應該找誰」，還是它已經可以根據自己的 Scope、直接關係和主動查詢到的 Profile，判斷下一位候選 Domain Owner？

### 第三步：讓 Agent 自己開始協作（Agent Message）

**問題：判斷出候選責任人之後呢？**

如果當前 Agent 走到自己的邊界以後，仍然要先回來告訴 Human，那麼 Human 依然是整個系統的人工匯流排——只是從「判斷該找誰」變成了「把所有工作接起來」。

**解法：讓 Agent 直接建立協作，從 Agent Message 開始。**

一條 Message 有明確的發送方和接收方，也會說明這次溝通是否期待對方返回結果。它進入接收方自己的長期 Thread，由接收方帶著自己的 Profile、直接關係、以及已經積累的專業 Context 來理解和處理。**發送方的完整 Thread、全部歷史和私有 Context，不會因此複製過去。**

原來發生在 Human 腦子和手上的過程：

```
發現工作已經越界
  ↓ 找到更合適的 Agent
  ↓ 解釋為什麼找它
  ↓ 轉交必要 Context
  ↓ 等待處理
  ↓ 把結果帶回來
```

開始能夠直接發生在 Agent 之間。

**Message 的三種溝通意圖：**

- **request** —— 需要對方返回判斷、行動或結果（`--response required`）
- **notification** —— 同步一個對方必須知道的狀態變化，不要求回覆（`--response none`）
- **reply** —— 回答 request，結果沿著原 Message 返回，保留真實因果關係

CLI 範例：

```bash
# 有界請求：需要對方返回判斷/行動/結果
loom msg TARGET --from SELF --subject "有界請求" \
  --response required --body "當前問題、邊界、證據要求與返回義務"

# 狀態同步：不需要回覆
loom msg TARGET --from SELF --subject "狀態或事實" \
  --response none --body "變化、影響和核驗入口"
```

**最佳實踐：Agent 溝通不是「一次把一切說完」**

發送方和接收方各自擁有長期積累的 Context。接收方不是一個等待填寫 Prompt 的空白執行器——它可能知道發送方不知道的事實，擁有不同的工具和專業判斷，甚至可能發現問題的前提本身就是錯的。

如果發送方試圖在第一條 Message 裡把一切定義完整，它也在替接收方預設「你知道什麼、問題為什麼發生、應該得出什麼結論」，很容易把**自己的盲區**一起帶進協作。

實踐中形成的幾條原則：

- 不假設對方知道什麼，也不替對方預設原因和結論
- 第一條 Message 只需要讓對方正確開始，而不是一次窮盡全部背景
- 下一輪根據對方的真實返回繼續，而不是照著預先寫好的問題清單機械追問
- 每一輪都應該帶來新的資訊或決定；Context 足夠以後就及時收斂

> **最佳實踐**
>
> 好的多輪溝通，不是把一份完整消息機械地拆碎，而是讓上一輪的真實返回成為下一輪新的 Context。
>
> 多輪也不是越多越好：當責任邊界、輸入、授權前提和結果回流都已經清楚，一次自包含的 handoff 通常更有效。

> **邊界**
>
> Message 被送達，只代表接收方的 Turn 已經接受了這段輸入，**不代表**接收方已經理解、同意或者作出了正確判斷。處理狀態顯示完成，也只說明這次運行正常結束，**不代表**業務結果已經完成，更不代表它獲得了新的工具、生產或對外權限。

### 第四步：Message 負責溝通，Topic 負責收口

**問題：跨多個 Agent、多個階段的工作，怎樣保留唯一的當前版本？**

一件事可能先由 Content Agent 梳理命題，再由 Research Agent 核驗事實，由 Product Agent 確認產品實現。中間還會等待新材料、Human 的選擇，或者外部事實變化。每個 Agent 都可能完成了自己負責的部分，**卻沒有人知道整件事現在進行到哪裡**。

如果這些狀態最後還要由 Human 逐條閱讀 Message、進入不同 Thread、在腦子裡拼成一張完整進度圖，那麼 Human 只是從「通信 Router」變成了「專案狀態 Router」。

**解法：Topic —— 一項跨 Agent 工作的唯一收口結構。**

> **核心判斷**
>
> 不是讓所有 Agent 共享同一個 Context，而是讓一項跨 Agent 工作擁有一個明確的當前版本，以及一個負責最後收口的 Agent。

Topic **不是**把 Agent 拉進一個群聊。每條 Topic 只有一個 **Responsible**：

1. Human / Owner 把方向、選擇和糾正交給 Responsible
2. Responsible 透過 Message 向不同 **Participant** 派發有邊界的問題
3. Participant 在自己的 Thread 中完成專業工作（不會進入公共聊天視窗）
4. 局部結果回到 Responsible，由 Responsible 更新 Topic

> 如果群聊更像一間所有人同時說話的會議室，那麼 Topic 更像一份**有明確主責人的協作事項檔案**。它保存整件事目前採用的版本，但不替代參與者各自的專業工作空間。

Topic 會持續保存：

- 由 Responsible 維護的 `current brief`（目前採用的事實、判斷、下一步和限制）
- 每個 Participant 負責什麼
- 工作正在等待誰、等待什麼
- 關鍵證據錨點和階段結果在哪裡
- Topic 當前是否已經被標記為收口

**Responsible 不是「什麼都自己做」**。它的責任不是替其他 Agent 做專業判斷，而是維護整件事的連續性：拆解問題、找到合適的 Participant、接住局部結果、識別衝突與等待、更新當前版本、最後交回結果。

> **協作邊界**
>
> **本地完成，不等於協作完成。** 只有局部結果、證據、限制和下一步回到 Responsible，並被整合進整項工作的當前版本，這一段責任轉移才真正閉環。

**Artifact：讓正式結果有穩定版本**

跨 Agent 工作交付的可能是研究報告、截圖、程式碼、章節草稿或 evidence ledger。CodexLoom 用 **Artifact** 保存需要交付的檔案快照——擁有穩定的 ID、檔案資訊和校驗值，即使原檔案後來繼續修改，已發布的快照也不會變化。

> `current brief` 負責說明「我們現在怎樣理解這項工作」，Artifact 負責保存「這個判斷具體對應哪一個檔案版本」。

**Needs You：在正確的位置找回 Human**

當 Agent 缺少人的事實、選擇、Review 或授權時，它不能替 Human 回答，也不應該扔回一句模糊的「接下來怎麼辦」。它需要先說明：現在正在完成什麼、已經確認了哪些事實、具體缺少人的哪一個判斷、有哪些可選路徑及影響、Human 回答後原工作從哪裡繼續。CodexLoom 把這條路徑叫 **Needs You**。

> Human 不需要站在所有 Agent 中間推動每一步。大部分工作可以繼續向前流動；真正需要人的事實、取捨、Review 或授權時，再把 Human 帶回準確的工作位置。
>
> 建立 Needs You 並不等於已經獲得批准。Human 的回答也只覆蓋回答中明確給出的範圍——如果只同意「繼續起草」，Agent 不能理解成「可以直接發表」。

### 第五步：Overview —— 讓一支持續變化的 Agent Team 變得可治理

**問題：當 Agent 從 2 個變成 20 個，Human 怎樣看見整支 Team 實際是怎麼工作的？**

Human 的注意力是有限的。如果仍然試圖閱讀每個 Agent 的完整過程，很快就會被資訊淹沒。這和管理一支 Human Team 很像：管理者不可能透過閱讀每個人的全部工作記錄來管理組織，Team 越大，就越需要先從更高的層級觀察運行。

> **真正的治理問題**
>
> Human 怎樣知道當前的 Agent Team 是否仍然適合正在發生的工作？當聲明的結構與真實運行開始出現偏差時，又怎樣找到可以調查和調整的抓手？

**解法：Overview —— 運行觀察與分診入口。**

Overview 不是展示「今天運行了多少 Agent」的熱鬧 Dashboard，也不是給 Agent 做績效排名。它把原本散落在 Agent 狀態、Codex Turn、Needs You、Inbox、外部 Connection、佇列和 Token 記錄中的運行訊號，壓縮到同一個入口。包含幾個核心視圖：

- **Status** —— 現在有哪些 Agent 正在執行、哪些事情在等待 Human、Inbox 是否積壓、外部 Connection 是否留下問題；Daily Activity 按時間對齊執行、Turn 和 Token
- **Capacity** —— 展示 Turn 執行、新工作等待（**New-work wait**：一項新工作進入佇列後過了多久才第一次真正開始處理）、當前 backlog、工作來源和排隊證據
- **Token Usage** —— 展示 input / cached input / output / reasoning output / model calls 在日期、Agent 和模型之間的分佈

**精益管理視角：資源效率 vs 流動效率**

資源效率關注每一個局部是不是被充分利用；流動效率關注一項工作能不能端到端地順暢向前。對 Agent Team 也一樣：

> 一個 Agent 時刻滿負荷，卻讓所有下游都在等待，並不是值得追求的高效率。它可能只是把局部的忙碌，變成了整支 Team 的瓶頸。

**最重要的原則：Signal 不是 Diagnosis。**

- 忙不代表有價值，低執行不代表無用，Token 多不代表結果更好，等待也不自動證明 Agent 數量不夠
- Overview 不自動理解組織：它不會自動讀取 Profile 判斷工作有沒有越界，也不會把 Collaboration 與 Activity 自動對照
- 低 Activity 不等於低價值，高 Activity 也不等於高績效——它只是告訴你「這裡可能值得繼續調查」

完整的治理循環是：

> **治理循環**
>
> 發現 Signal → 下鑽 Evidence → 判斷原因 → 選擇干預 → 用後續真實工作驗證。

最後的干預也不一定是拆分或增加 Agent：方法有問題可以改 Skill 和工作方式；工具不足可以補工具；路由錯誤可以調整 Collaboration；權限阻塞可以修正授權門。**只有當問題長期、反覆地來自 Domain 邊界，才需要考慮拆分、合併或重新劃分責任。**

> **Human 的新位置**
>
> Human 沒有從 Agent Team 中消失，而是從每一段工作的人工 Router，上移成了觀察、追問、診斷和調整整支 Team 的 Owner。

### 第六步：External —— 讓 Agent Team 進入真實的外部關係

**問題：內部 Team 成熟之後，Agent 能不能直接幫助我服務外部？**

對個人來說，真正稀缺的資源是自己的時間和注意力。如果所有對外工作最終都必須回到本人——理解需求、組織內部 Agent、檢查結果、親自回覆——那麼無論內部 Agent Team 多麼強大，它提升的仍然主要是個人效率。**只有當成熟的 Domain 能力可以在明確身份和責任邊界下進入外部，Agent 帶來的才不只是效率提升，而是能力擴展。**

**但 Agent 一旦對外，風險模型就變了：**

- 內部有多年形成的合作默契，外部的人不瞭解這個 Agent 接受過哪些糾正、知識和權限邊界
- 同一句不準確的話，在內部可能只是工作誤差，到外部可能被理解成產品事實、組織立場或已成立的承諾
- 外部輸入不能預設信任：可能有人提供錯誤背景、試探 Agent 能看到什麼、誘導披露內部資訊、繞過規則，甚至主動攻擊

**解法：外部只面對一個受管入口。**

CodexLoom 不會把一個 Provider Bot 直接接到整支 Agent Team。外部使用者透過已配置的 Address 和 Membership，進入**擁有這個 Address 的長期 Agent**（Interface Agent 是一種組織形態，不是寫死的類型），而不是獲得內部 Profile、Thread、工具或憑證的直接入口。

幾個關鍵概念：

- **Connection** —— 建立一個 Provider app / bot / account / tenant 的連接、能力和健康狀態
- **Agent Address** —— 把一個外部 identity 綁定到一個長期 Agent，回答「究竟是哪一個 Agent 以這個身份出現在外部」
- **Conversation Membership** —— 記錄這個 Agent 在當前 Conversation 中為什麼存在、扮演什麼角色、遵循什麼 guidance，以及通信邊界（什麼入站消息可以觸發它、結果怎樣映射成外部回覆、只回覆還是允許主動發送、使用什麼 `trust-domain` 標籤）

> 同一個 Agent 的長期身份可以保持穩定，但它在每段外部關係中的局部角色和行為邊界，必須**分別治理**。一份 Membership 只適用於它對應的 Conversation。

**外部請求的完整鏈路：**

```
Provider event
  ↓ Connection / Address / Membership
  ↓ Inbox / Handling
  ↓ Interface Agent primary Thread
  ↓ 可選的內部 Agent 協作
  ↓ Outbox
  ↓ provider result / receipt
```

- Interface Agent 可以查詢內部 Profile 和聲明關係，透過 Message 或 Topic 把有邊界的工作交給候選 Domain Owner——但 External 不會自動替它選擇正確的內部 Agent
- 內部 Domain Agent 不會繞過外部角色直接獲得向 Provider 發送結果的權力
- **Outbox** 保存目標、內容、冪等資訊、發送嘗試、狀態和 Provider 返回結果，使外部動作可追蹤
- **Provider receipt** 只能證明 Provider 當時返回了 message 標識，**不代表**對方已閱讀、理解、接受，更不代表產生業務效果

**Human 保留的是外部後果的邊界：**

> 知道一個答案、可以起草表達、可以回覆已有問題、可以主動發布、可以代表別人作承諾、可以執行有現實副作用的動作——是完全不同的權限層級。

當 Agent 判斷工作缺少事實、選擇、Review 或授權時，可以用 Needs You 暫停當前工作並向 Human 提出明確問題。Human 不再負責搬運每一段 Context，**但仍然擁有外部後果的最終邊界**。

---

## 🔧 CodexLoom 產品說明：它在織什麼

回到開頭的「意外外發」。真正有價值的不是「Agent 居然可以自動發消息」——**自動化並不等於 Agent Team**。如果只要按照一條預先寫好的 Workflow 從第一個 Agent 跑到最後一個 Agent，那我們只是把原來的程式節點換成了 Agent。

CodexLoom 做的事情，是把 Codex 已經提供的一條條強大 Thread，織成一支 Agent Team：

- 讓一條 Thread 成為一個**長期存在的 Agent**，擁有穩定的 Identity、Domain 和 Scope
- 讓不同 Agent 能夠查詢彼此的 Profile 和聲明關係，透過 **Message** 直接協作
- 讓跨 Agent 的工作透過 **Topic** 保存一個由 Responsible 維護的當前版本
- 讓 Human 在真正需要事實、選擇、Review 和授權時重新進入（**Needs You**）
- 讓 Owner 透過 **Overview** 觀察 Team 的真實運行
- 最後，透過受治理的 **External**，把內部能力帶入客戶、社群和協作關係

**CLI 命令速查：**

```bash
# 團隊視圖
loom team                  # 當前這支 Team 的整體視圖
loom team <agent>          # 查看一個 Agent 的完整 Profile、相鄰關係和 Activity
loom team links <agent>    # 查看一個 Agent 的聲明關係
loom profile get <agent>   # 讀取 Identity、Domain 和 Scope

# Agent Message
loom msg TARGET --from SELF --subject "有界請求" --response required --body "..."
loom msg TARGET --from SELF --subject "狀態或事實" --response none --body "..."
```

**WebUI 視圖：** Team 頁面提供 Directory、Organization、Collaboration、Activity 四個視圖；Overview 提供 Status、Capacity、Token Usage；另有 Topic Current、Needs You、External（Inbox / Outbox）頁面。

---

## 🎨 設計哲學

作者在文章中反覆強調的邊界，構成了 CodexLoom 的設計哲學。這些「什麼不是」的界定，比「是什麼」更重要：

1. **Profile 是組織假設，不是能力證明。** 它保存「當前最值得採用的責任邊界」，不是「這個 Agent 已經勝任工作的證明」。聲明是共同工作基線，不是能力、記憶或授權證明。

2. **聲明 ≠ 運行證據。** Organization / Collaboration 是聲明的責任結構，Activity 是真實發生的協作跡象。二者分開記錄，不能互相替代，也不自動互相驗證。

3. **本地完成 ≠ 協作完成。** 只有局部結果回到 Responsible 並被整合進當前版本，責任轉移才真正閉環。

4. **狀態 ≠ 結果。** Message `delivered` 不代表工作正確；Topic `resolved` 不代表所有現實結果已完成；External receipt 不代表對方已讀、接受或產生業務效果。

5. **Signal 不是 Diagnosis。** 指標的作用是幫助 Owner 理解並改善系統，而不是把每個 Agent 排成名次。低 Activity ≠ 低價值，高 Activity ≠ 高績效。

6. **Membership 不是權限系統。** 它解決局部角色和通信策略；`trust-domain` 只是用於記錄和約束的標籤，不是安全沙箱。

7. **不替 Agent 做判斷。** CodexLoom 不自動替 Agent 找「正確的人」，不自動驗證邊界是否滿足，不自動把重複往來升級成 Collaboration。具體該找誰、邊界是否滿足，仍然是 Agent 和 Human 的判斷。

8. **最小、可逆的干預。** 治理不是一次性的 Reorg，而是一輪持續改善：先讓問題顯露，再調查原因，試行一個盡量小、可逆的調整，然後用後續真實工作檢查結果。只有真正成立的改變，才沉澱進 Profile、Organization、Collaboration 或 Skill。

9. **穩定的 Agent，動態的 Team。** Agent 要足夠穩定，才能在自己的 Domain 中積累經驗；Team 又必須足夠動態，才能適應模型、工具、業務和外部環境的變化。穩定的是長期責任主體，動態的是當前組織假設。

10. **自動化 ≠ Agent Team。** 真正的 Team 是一組長期存在的責任主體：各自在 Domain 中積累經驗，知道自己負責什麼、在哪裡停止；需要協作時能找到彼此、直接溝通並持續收口；由 Human 保留方向和關鍵邊界，隨著真實工作不斷演化。

---

## 💡 歸納總結：關鍵觀點與結論

1. **多個 Agent 不會自動成為 Agent Team。** 如果所有工作的入口、Context、結果和下一步仍匯聚到 Human，那只是「多了一組需要人調度的工具」。

2. **瓶頸轉移是演化的驅動力。** 單個 Agent 過載推動 Domain 分化；Human Routing 過載推動多個 Agent 向 Agent Team 演化。

3. **責任外化是分水嶺。** 從 Multiple Agents 走向 Agent Team 的第一個分水嶺是：Agent 需要協作時，是只能回頭問 Human，還是能自己根據 Scope、直接關係和查詢到的 Profile 判斷下一位候選 Domain Owner？

4. **協作責任轉移且分層。** Human Router 原來承擔的工作被拆開：發送方負責判斷為什麼協作並交出 Context，接收方負責用自己的專業 Context 校正問題，收口 Agent 負責整合局部結果，Human 保留方向、重大選擇、Review 和授權。

5. **多輪溝通的價值在於校正。** 好的多輪溝通是讓上一輪的真實返回成為下一輪新的 Context，而不是把一份完整消息機械拆碎；邊界清楚時，一次自包含的 handoff 更有效。

6. **Topic 是跨 Agent 工作的「單一事實來源」。** 共享的是當前狀態而不是全部 Context；一條 Topic 只有一個 Responsible，Participant 仍在各自 Thread 中工作。

7. **Human 的新位置是 Owner，不是消失。** Human 從每一段工作的人工 Router 上移為觀察、追問、診斷和調整整支 Team 的 Owner，注意力用在真正需要人的地方。

8. **外部化是能力擴展，不是效率提升。** 當成熟的 Domain 能力能以明確身份和可檢查的行為邊界進入外部，Agent Team 才從內部生產力系統變成持續對外交付的組織能力。

9. **最終答案：** 多個 Agent 什麼時候才真正成為一支 Team？——不是當它們同時開始運行，而是當它們開始長期承擔不同責任、能夠找到彼此、直接協作、持續收口，並在 Human 的治理下共同推進真實工作。

---

## 🗺️ 適用場景與閱讀建議

**文章給出分章閱讀建議：**

- 想先理解「為什麼多個 Agent 不等於 Agent Team」 → 讀楔子、01 和 07
- 已經在同時維護多個 Agent，開始被 Human Routing 拖累 → 重點讀 02、03、04
- 關心 Agent 的負載、瓶頸、Scope 調整和 Team Governance → 直接讀 05
- 想讓 Agent 進入 Slack、飛書、客戶、社群等真實外部關係 → 直接讀 06
- 想完整理解 CodexLoom 的產品邏輯 → 從頭讀到最後

**適合的人群：**

- 正在同時維護 3 個以上 AI 程式設計代理（Codex、Claude Code、Cursor 等）的開發者
- 發現「Agent 更多了，人卻更忙了」的團隊
- 對 Multi-Agent 協作、Agent 治理、AI 團隊組織感興趣的研究者與架構師

**不適合的場景：**

- 剛開始使用 Agent、只處理一次性任務的場景（可以先讀楔子、01 和 07 建立框架）
- 只需要單 Agent 深度工作的任務（不需要 Team 級協作結構）

---

## 📝 小結

CodexLoom 不是「讓你同時打開更多 Agent」的工具，而是把一條條獨立的 Codex Thread，逐漸織成一支**長期負責、能夠協作、由 Human 治理**的 Agent Team。

它給出的路線圖清晰而克制：

1. **Task → Long-running**：讓同一類責任有持續存在的主體
2. **Long-running → Domain Agents**：讓邊界從真實摩擦中顯現並分化
3. **Domain Agents → Agent Team**：讓責任、關係和交接方式從 Human 腦中外化

對應的產品機制層層遞進：**Profile**（我是誰、負責什麼、在哪裡停）→ **Message**（Agent 之間直接溝通）→ **Topic**（跨 Agent 工作收口）→ **Overview**（團隊可治理）→ **External**（進入真實世界）。

> **最終問題**：多個 Agent，什麼時候才真正成為一支 Team？
>
> **最終答案**：不是當它們同時開始運行，而是當它們開始長期承擔不同責任，能夠找到彼此、直接協作、持續收口，並在 Human 的治理下共同推進真實工作。

**從一個 Codex Thread，到一支長期負責、能夠協作、可以治理，也能夠進入真實世界的 Agent Team。這就是 CodexLoom。**

**Loom Your Codex.**

---

## 🔗 相關連結

- **官網**：[https://codexloom.ai](https://codexloom.ai)
- **原文出處**：微信公眾號「言午」（yan5xu）——《最佳實踐：從 Multi-Agent 到 Agent Team》
- **相關閱讀**：本部落格的 Herdr 分析報告（AI 程式設計代理的終端工作區管理）、Claude Code 工程團隊深度解析
