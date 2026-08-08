---
title: "Oh My Hermes 深度解析：把「多個 AI 吵架」變成工程紀律的多智慧體編排框架"
description: "全面解析 GitHub 專案 witt3rd/oh-my-hermes（OMH）——為 Nous Research 的 Hermes Agent 打造的多智慧體編排技能集，靈感來自 oh-my-claudecode，但基於 Hermes 原語徹底重寫。核心思想：單個 AI 一口氣給答案容易有盲區，OMH 讓規劃者、架構師、批評者三個角色互相辯論到達成共識，再讓執行者寫程式碼、驗證者查證據、架構師做終審。全文覆蓋：十個技能（omh-ralplan / omh-ralph / omh-deep-research / omh-deep-interview / omh-autopilot 及各自的 driver 劇本）、角色注入鉤子機制、原子狀態管理、三振出局熔斷、證據高於斷言的鐵律、檔案所有權隔離、.omh 目錄的「選擇性共享」約定，以及十四條明確寫進倉庫的設計哲學。從核心思想、專案說明、設計哲學到零基礎詳細教程（安裝 → 第一次規劃 → 執行迴圈 → 全自動流水線）和歸納觀點，一文講透。"
date: "2026-08-08"
author: "TopDigg Research Team"
tags: ["Oh My Hermes", "OMH", "Hermes Agent", "AI Agent", "Multi-Agent", "多智能体", "Agent Skills", "Nous Research", "oh-my-claudecode", "Orchestration", "Consensus Planning"]
categories: ["Deep Dive"]
keywords: ["Oh My Hermes", "OMH", "Hermes Agent", "多智慧體編排", "共識規劃", "omh-ralplan", "omh-ralph", "AI 代理技能", "delegate_task", "角色注入", "三振出局", "證據驗證", "Nous Research"]
---

# Oh My Hermes 深度解析：把「多個 AI 吵架」變成工程紀律的多智慧體編排框架

> 核心思想：**一個 AI 單獨幹活，會有它自己都看不見的盲區；讓幾個 AI 分別扮演不同角色，互相挑刺、吵到達成一致，產出的方案會強得多。** Oh My Hermes（簡稱 OMH）就是把這件事做成了一套可複用的「技能包」。它給 Nous Research 的 Hermes Agent 提供了十個技能：規劃的時候讓**規劃者**先出方案、**架構師**審結構、**批評者**專門砸場子，三個人全部點頭才算透過；執行的時候讓**執行者**寫程式碼、**驗證者**只看真實測試輸出（不看嘴上說的），**架構師**最後再做一次終審。整個框架有兩條壓艙石般的鐵律——「**證據高於斷言**」（沒看到測試輸出就不算透過）和「**同一個錯誤犯三次就停下來**」（三振出局熔斷器）。更妙的是：OMH 是**用自己造出來的**——第一個做出來的技能是共識規劃器 `omh-ralplan`，然後它用這個技能，透過多智慧體辯論，設計出了剩下所有技能。

---

## 目錄

- [一、先用大白話講清楚：這個專案到底在幹嘛](#一先用大白話講清楚這個專案到底在幹嘛)
- [二、專案說明](#二專案說明)
- [三、核心思想：五個關鍵概念](#三核心思想五個關鍵概念)
- [四、十個技能逐一拆解](#四十個技能逐一拆解)
- [五、外掛層：角色注入與原子狀態](#五外掛層角色注入與原子狀態)
- [六、設計哲學（十四條）](#六設計哲學十四條)
- [七、詳細教程：從零上手](#七詳細教程從零上手)
- [八、歸納總結的觀點與結論](#八歸納總結的觀點與結論)
- [九、參考資料](#九參考資料)

---

## 一、先用大白話講清楚：這個專案到底在幹嘛

### 1.1 一個小學生也能懂的比喻

想象你要蓋一座樂高城堡。

**普通做法**（一個 AI 單幹）：你叫來一個特別聰明的同學，說「幫我設計一座城堡」。他想了三分鐘，畫了張圖，說「好了」。你按圖搭，搭到一半發現——大門開在了護城河正中間，沒法進去。

**Oh My Hermes 的做法**（多個 AI 分工）：你叫來三個同學。

- **第一個同學叫「規劃者」**：他負責畫圖紙，把「蓋城堡」拆成一步步的小任務——先打地基、再砌牆、然後裝大門、最後插旗子。
- **第二個同學叫「架構師」**：他不畫圖，他只負責看圖紙結不結實。「地基只有兩塊磚，上面壓二十層？塌了怎麼辦？」
- **第三個同學叫「批評者」**：他的任務就是**專門挑刺、專門抬槓**。他會問：「你確定要蓋城堡嗎？題目說的是'一個能住人的地方'，帳篷是不是更快？」——注意，他連**題目本身**都敢質疑。

三個人吵一輪，規劃者根據意見改圖；再吵第二輪。**只有三個人全部說「我同意」，圖紙才算定稿。**

圖紙定了之後，換另外三個同學上場：

- **「執行者」**：真正動手搭積木的人。規矩很嚴——**只准碰分配給你的那幾塊積木**，別人負責的部分你可以看，但不許動。
- **「驗證者」**：搭完了他來檢查。但他有一條鐵律：**他不聽執行者說「我搭好了」，他只看照片。** 沒有實拍照片（真實的測試輸出），一律判不透過。
- **「架構師」**：全部任務做完後，他再整體看一遍，點頭才算真的完工。

這就是 Oh My Hermes。它不是一個軟體工具，而是**一套教 AI 怎麼分工、怎麼吵架、怎麼驗收的規矩**。

### 1.2 為什麼需要這套規矩

AI 有個眾所周知的毛病：**它很自信**。

你讓它寫程式碼，它寫完會告訴你「已完成，測試透過」。但很多時候它根本沒跑測試，或者跑了但沒看結果。這不是撒謊，而是大語言模型的生成特性——它在「補全一個聽起來對的句子」。

OMH 的解法很樸素也很工程化：**別信它說的，只看它做的。**

- 驗證者是**只讀**的，它不能改程式碼，只能判斷"過"或"不過"。
- 跑測試這件事，**不交給驗證者，也不交給執行者，而是由總指揮（編排者）親自跑**，然後把跑出來的真實輸出塞給驗證者看。這樣驗證者手裡有「地面真相」，不會被執行者的報告牽著走。
- 五條驗收標準過了四條？**判不透過。** 不是「基本透過」，是「FAIL」。

---

## 二、專案說明

### 2.1 它是什麼

**Oh My Hermes（OMH）** 是給 [Hermes Agent](https://github.com/NousResearch/hermes-agent)（Nous Research 出品的開源 AI 代理）寫的一套**多智慧體編排技能集**。

倉庫地址：`https://github.com/witt3rd/oh-my-hermes`

README 裡的一句話定位：

> "OMH provides composable skills for consensus planning, requirements interviewing, and verified execution — plus an optional plugin that adds hook-based role injection, atomic state management, and evidence gathering. **Skills work standalone with zero dependencies.**"
>
> （OMH 提供可組合的技能，用於共識規劃、需求訪談和已驗證的執行——外加一個可選外掛，提供基於鉤子的角色注入、原子狀態管理和證據收集。**技能可以獨立工作，零依賴。**）

注意最後那句 **"Skills work standalone with zero dependencies"（技能獨立可用，零依賴）**——這是理解 OMH 架構的第一把鑰匙，後面會詳細講。

### 2.2 關鍵資料

| 專案 | 資料 |
| --- | --- |
| 倉庫 | `witt3rd/oh-my-hermes` |
| Star 數 | 243（截至分析時） |
| Fork 數 | 22 |
| 提交數 | 76 commits |
| 許可證 | MIT |
| 語言 | Python（外掛）+ Markdown（技能定義） |
| 依賴要求 | Hermes Agent v0.7.0+；外掛另需 Python 3.10+ 和 `pyyaml` |
| 靈感來源 | [oh-my-claudecode](https://github.com/Yeachan-Heo/oh-my-claudecode)（簡稱 OMC） |

### 2.3 十個技能一覽

| 技能 | 它做什麼 |
| --- | --- |
| **omh-deep-research** | 多階段網路研究：拆解 → 並行搜尋 → 綜合 → 校驗引用真偽 |
| **omh-ralplan** | 共識規劃：規劃者 → 架構師 → 批評者，辯論到達成一致 |
| **omh-ralplan-driver** | 驅動 ralplan 的**總指揮劇本**——上下文包撰寫（質量誕生的地方）、輪次排程、蒸餾、終審 |
| **omh-deep-interview** | 蘇格拉底式需求訪談，帶覆蓋度追蹤 |
| **omh-ralph** | 已驗證的執行：實現 → 驗證 → 迭代直到完成 |
| **omh-ralph-driver** | 驅動 ralph 的**總指揮劇本**——計劃形態、並行批次、證據收集、驗證者紀律、三振分類、第 7 步架構師終審、提交規範 |
| **omh-ralph-task** | 單個任務執行者的紀律——任務信封契約、檔案範圍剛性、對 HEAD 的 stash 驗證（隔離兄弟任務干擾）、提交作者覆蓋、結構化回報格式 |
| **omh-triage**（v0.1） | 多角色共識式 issue 分診——維護者（程式碼錨定）+ 懷疑者（剪枝） |
| **omh-triage-driver**（v0.1） | 驅動 triage 的總指揮劇本——預飛行 backlog 審計、角色輪排程、蒸餾、使用者簽字關卡 |
| **omh-autopilot** | 全流水線，端到端串起以上所有技能 |

### 2.4 推薦的組合流水線

面對一個**陌生領域**的需求，官方推薦的完整鏈路是：

```
omh-deep-research  →  omh-deep-interview  →  omh-ralplan  →  omh-ralph
   （先搞懂領域）        （問清楚需求）        （吵出方案）      （幹活+驗收）
```

如果領域你很熟，就從訪談開始，跳過研究階段。

### 2.5 版本路線圖（ROADMAP.md）

```
v1.0：           只有技能——囉嗦但能用，零依賴
v2.0（當前）：    Hermes 外掛——基礎設施層，帶基於鉤子的角色注入
v3.0（未來）：    向上遊 NousResearch/hermes-agent 的 optional-skills/ 提 PR
```

這個路線圖本身就體現了一種務實：**先用最笨但零依賴的方式跑通，再上基礎設施最佳化，最後才考慮進主幹。**

---

## 三、核心思想：五個關鍵概念

### 3.1 共識規劃：讓批評者去砸場子

`omh-ralplan` 的流程是這樣的：

```
規劃者起草方案
    → 架構師審查結構是否穩固
    → 批評者用對抗性思路挑戰假設
    → 如果不是三人全部 APPROVE：規劃者修訂，回到上一步（最多 3 輪）
    → 達成共識：方案寫入 .omh/plans/
```

文件裡的原話點破了批評者的價值：

> "**The Critic's job is to break the plan — if it survives, it's stronger for it.**"
>
> （批評者的工作就是把方案搞垮——如果方案挺住了，它就因此變得更強。）

**輪次策略也有講究**：

- **第 1 輪：序列**。規劃者 → 架構師 → 批評者，一個接一個，因為後面的人要看前面的產出。
- **第 2 輪及以後：並行**。規劃者改完稿，架構師和批評者**同時**複審（用批次 `delegate_task`），省時間。

**停止條件**：最多 3 輪。到第 3 輪還沒共識，就帶著「保留意見」輸出方案，讓人類來定奪。任何一個角色投 REJECT，就把顧慮直接拋給使用者。

### 3.2 META 問題：批評者必須被授權質疑「題目本身」

這是整個 OMH 裡**最有洞察力的一條設計**，出自 `omh-ralplan-driver` 的第 4 號陷阱（P4）：

> "**P4 — Critic must be licensed to contest framing:** If the context package lists only 'things to push on inside the current frame,' the Critic will stay inside the frame. Add the META question explicitly. [...] **Without licensing, the Critic catches details. With licensing, the Critic catches the frame.**"
>
> （P4——批評者必須被授權質疑框架本身：如果上下文包裡只列了"在當前框架內可以質疑的點"，批評者就會老老實實待在框架裡。必須顯式加入 META 問題。……**沒有授權，批評者只能抓到細節；有了授權，批評者能抓到框架本身的錯誤。**）

用樂高城堡的比喻講：如果你只告訴批評者「請檢查圖紙有沒有問題」，他會說「護城河寬度不夠」；但如果你告訴他「你也可以質疑我們到底該不該蓋城堡」，他可能會說「其實使用者只是想要個能住的地方，帳篷十分鐘就搭好了」。

**後者才是真正值錢的意見。**

文件還給了一個真實案例佐證這條規則：

> "The Critic's simplicity test can change architecture — don't dismiss it. In the ralph consensus, the Critic proposed one-task-per-invocation (instead of an in-session loop) which both reviewers then approved as fundamentally better."
>
> （批評者的"簡單性測試"能改變架構，別輕視它。在 ralph 的共識過程中，批評者提出了"每次呼叫只做一個任務"（而不是會話內迴圈），另外兩位評審都認為這在根本上更好。）

**OMH 最核心的執行架構，是批評者砸出來的。**

### 3.3 反溯性順從測試（Counterfactual Deference Test）

這是 P7 號陷阱，一條非常精妙的「防止 AI 假裝被說服」的檢查：

> "**P7 — Counterfactual deference test:** Would this defense have adopted a *different* alternative if a counterfactual Critic had proposed it? If all the Planner's grounds also justify a counterfactual alternative, the adoption is deferential — pattern-matching, not principled."
>
> （P7——反溯性順從測試：如果換一個批評者提出**另一個不同的**替代方案，規劃者的這套辯護詞是不是也會照單全收？如果規劃者給出的所有理由，對那個假想的替代方案同樣成立，那這次採納就是"順從"——是模式匹配，不是有原則的判斷。）

翻譯成人話：**AI 有個壞習慣，就是「誰說話它聽誰的」。** 批評者說「用四個維度」，規劃者立刻說「你說得對，我改成四個維度，理由是 A、B、C」。但如果批評者當初說的是「用六個維度」，規劃者是不是也會用 A、B、C 這套理由同意？如果是，那說明規劃者根本沒思考，只是在順從。

OMH 把這個心理學層面的失敗模式**寫成了可執行的檢查項**。這是很少見的工程成熟度。

### 3.4 證據高於斷言：ralph 的鐵律

執行階段（`omh-ralph`）的核心機制：

> "The iron law of ralph verification: **evidence, not assertion.** Verifiers must see actual test output; executor claims without evidence are rejected."
>
> （ralph 驗證的鐵律：**要證據，不要斷言。** 驗證者必須看到真實的測試輸出；執行者沒有證據的宣告一律駁回。）

`role-verifier.md` 裡的定義更狠：

> "No approval without fresh evidence. If you don't see test output, it didn't pass."
>
> （沒有新鮮證據就不批准。你沒看到測試輸出，那就是沒透過。）

而且，**驗收是二元的，不打折**：

> "Binary per criterion: VERIFIED / PARTIAL / MISSING. **4 of 5 criteria = FAIL, not PASS.**"
>
> （每條標準只有三態：已驗證 / 部分 / 缺失。**五條過四條 = 失敗，不是透過。**）

**最關鍵的一條紀律**（`omh-ralph-driver` 第 4 步和 P6）：

> "**Critical: the verifier does NOT run evidence themselves. Gathering happens at the orchestrator level** so you can verify executor claims match reality before the verifier reads them."
>
> "Always run `omh_gather_evidence` before dispatching verifiers. [...] If you skip evidence-gathering, the verifier reads only the executor's report and has no ground truth to grade against."
>
> （關鍵：驗證者**不自己跑**證據。收集證據發生在編排者層面，這樣你可以在驗證者讀到之前，先核對執行者的宣告是否符合現實。）
> （派發驗證者之前，永遠先執行 `omh_gather_evidence`。……如果你跳過證據收集，驗證者就只能讀執行者的報告，手上沒有任何地面真相可作評分依據。）

這是個非常聰明的**三方制衡**設計：

```
執行者  ——寫程式碼，聲稱"我做完了"
   ↓
編排者  ——親自跑測試，拿到真實輸出（地面真相）
   ↓
驗證者  ——拿著「執行者的宣告」+「編排者的真實輸出」做對比判決
```

執行者沒法偽造證據，因為證據不是他給的；驗證者也沒法偷懶，因為真相就擺在他面前。

### 3.5 三振出局熔斷器

AI 修 bug 的一個典型失敗模式是：改一版沒成功 → 換個寫法再試 → 還是不行 → 再換……無限迴圈燒錢。

OMH 的解法是**按錯誤指紋計數**：

> "Construct error fingerprint `{task_id, category, error_key}`. Add to `task.error_fingerprints`. If 3 fingerprints share the same `category + error_key`: mark task blocked, log the error, continue to next eligible task on next invocation."
>
> （構造錯誤指紋 `{任務ID, 類別, 錯誤鍵}`，加入 `task.error_fingerprints`。如果有 3 個指紋的 `類別 + 錯誤鍵` 相同：把該任務標記為阻塞，記錄錯誤，下次呼叫時繼續處理下一個符合條件的任務。）

**注意「類別」這個欄位**（P5 號陷阱）：

> "Tag the strike category in the error fingerprint. The 3-strike circuit breaker fires when the same `(category, error_key)` repeats. **Tagging by category prevents test-infra strikes from masking real bugs.**"
>
> （在錯誤指紋裡標註三振的類別。三振熔斷器在同一個 `(類別, 錯誤鍵)` 重複時觸發。**按類別標註，可以防止"測試基礎設施問題"造成的三振把真正的 bug 掩蓋掉。**）

三個類別：

| 類別 | 含義 | 舉例 |
| --- | --- | --- |
| `test-infra` | 測試環境本身有毛病 | CI 裡少裝了個依賴 |
| `spec-misread` | 執行者理解錯了需求 | 把「按時間排序」讀成「按名字排序」 |
| `implementation-bug` | 真的程式碼寫錯了 | 陣列越界 |

如果不分類別，三次不同性質的失敗會被誤判成「同一個死迴圈」，從而錯誤地熔斷；分了類別後，只有**同性質的失敗重複三次**才熔斷——這才是真正的死迴圈。

---

## 四、十個技能逐一拆解

### 4.1 omh-ralplan（共識規劃）

**角色**：規劃者 / 架構師 / 批評者

**階段**：

| 階段 | 內容 |
| --- | --- |
| Phase 0 | 上下文收集——讀檔案，總結約 500 字 |
| Phase 1 | 規劃迴圈，最多 3 輪。第 1 輪序列，第 2 輪起並行複審 |
| Phase 2 | 輸出共識方案到 `.omh/plans/ralplan-{slug}.md` |

**判定**：三人全部 APPROVE 才算共識。任一 REQUEST_CHANGES 進入下一輪。任一 REJECT 立即上拋給使用者。

### 4.2 omh-ralph（已驗證的執行）

**依賴**：**必須**裝 OMH 外掛（v2），無法獨立執行。

**架構**：**每次呼叫只幹一個任務**，然後退出；呼叫方再次呼叫才做下一個。

這個設計是批評者逼出來的，理由在 `docs/omc-comparison.md` 裡說得很清楚：

> "Hermes can't prevent exit mechanically. **State-based resume is more robust and eliminates context exhaustion.**"
>
> （Hermes 沒法從機制上阻止退出。**基於狀態的恢復更健壯，而且消除了上下文耗盡的問題。**）

對比 OMC 的做法：OMC 用了一個 1144 行的 `persistent-mode.cjs` 來阻止 AI 退出會話，硬撐著把迴圈跑完。OMH 反其道而行——**既然攔不住退出，那就讓每次退出都是安全的存檔點。**

**八步狀態機**：

| 步驟 | 名稱 | 做什麼 |
| --- | --- | --- |
| 0 | 解析例項 + 獲取鎖 | 按例項隔離狀態；諮詢鎖防止同一方案被併發跑 |
| 1 | 讀狀態 | 判斷是全新/需要規劃關卡/續跑/已完成/阻塞/已取消 |
| 2 | 規劃關卡 | 解析 `.omh/plans/ralplan-*.md`；**沒有帶驗收標準的計劃就拒絕執行** |
| 3 | 挑下一個任務 | 所有 `passes=false` 且依賴已滿足的任務，按優先順序挑；可組成 2–3 個並行安全批次 |
| 4 | 執行 | `delegate_task` 帶 `[omh-role:executor]`；解析 COMPLETE/PARTIAL/BLOCKED |
| 5 | 驗證 | 編排者先跑 `omh_gather_evidence`，再派 `[omh-role:verifier]` |
| 6 | 錯誤處理 | 按 `(類別 + 錯誤鍵)` 指紋做三振熔斷 |
| 7 | 終審 | 所有任務透過後，架構師整體複審。APPROVE = 完成；REQUEST_CHANGES = 生成新發現的任務 |

**其他機制**：

- **取消訊號**：`.omh/state/ralph-cancel.json`，30 秒 TTL，實現乾淨中止。
- **學習前傳**：已完成任務裡的發現，會被餵給後續執行者的上下文。
- **並行優先**：獨立任務最多 3 個併發子代理（Hermes 的 `MAX_CONCURRENT_CHILDREN` 預設值）。

### 4.3 omh-ralph-task（單任務執行者的紀律）

這是執行者在**一次 `delegate_task` 呼叫內部**必須遵守的窄契約。

**任務信封（Task Envelope）契約欄位**：

- 專案根目錄 + 分支
- 提交作者（用 `-c user.name -c user.email` 覆蓋）
- **本任務擁有的檔案**（只有這些檔案你能 `git add`）
- **禁止修改的檔案**（兄弟任務擁有，你只讀）
- 驗收標準
- TDD 指令
- 提交後設資料（精確的 `git add` 命令 + 提交資訊）
- 期望的輸出格式

**檔案範圍剛性**（這是並行執行不打架的關鍵）：

> "**Stay in your file scope.** When implementing, you may need to *read* sibling-owned files for context. You may not *modify* them."
>
> （**待在你的檔案範圍內。** 實現時你可能需要**讀**兄弟任務擁有的檔案來獲取上下文，但你**不能改**它們。）

對應到編排者側的 P3 號陷阱：

> "When dispatching parallel executors, **only ONE task owns each shared file.** The other executors must import (read-only) but not modify it. Encode this explicitly in each executor's dispatch context."
>
> （派發並行執行者時，**每個共享檔案只能由一個任務擁有。** 其他執行者只能引用（只讀），不能修改。必須在每個執行者的派發上下文裡顯式寫明這一點。）

**stash 驗證法**（判斷測試掛了到底是不是你的鍋）：

```bash
# 1. 把你的工作暫存起來
git stash
# 2. 在乾淨的 HEAD 上跑那個失敗的測試
uv run pytest <failing-test-path> -q
# 3a. 如果幹淨狀態下【透過】了 → 失敗是你造成的。pop 出來，修，重試。
# 3b. 如果幹淨狀態下也【失敗】 → 是既有問題或兄弟任務造成的。pop 出來，繼續幹你的。
git stash pop
```

這一招非常實用：**它把「這個測試掛了」這個模糊訊號，變成了「這是不是我的責任」這個明確答案。** 沒有這一步，執行者會浪費大量輪次去修一個根本不是自己造成的失敗。

**TDD 不能糊弄**：

> "Going green-first (writing the implementation before the test) defeats the orchestrator's audit signal — they wanted to see real test-driven evidence in the commit, not after-the-fact tests rationalized to pass."
>
> （先寫實現再補測試（"綠燈優先"）會摧毀編排者的審計訊號——他們想在提交裡看到真正測試驅動的證據，而不是事後編出來的、為了讓它過而寫的測試。）

### 4.4 omh-deep-research（深度研究）

**依賴**：`web` 工具集 + `omh_state` 工具

**五個階段，任意兩個階段之間都可以安全退出**：

| 階段 | 名稱 | 子代理 | 關鍵行為 |
| --- | --- | --- | --- |
| 0 | 哨兵檢查 | 無 | 檢查已有的已確認報告；主題匹配則續跑 |
| 1 | 拆解 | 無 | 生成 slug、寫計劃、初始化狀態、退出 |
| 2 | 搜尋（批次） | 1–3 個 `researcher` 並行 | **每次呼叫只跑一批**；可重入 |
| 3 | 缺口檢查 | 0 或 1 個 `researcher` | 只有兩個分支：0 個缺口 → 綜合；≥1 個缺口 → 追查 |
| 4 | 綜合 | 1 個 `research-synthesist` | 父代理內聯所有發現；**父代理寫報告** |
| 5 | 校驗 | 1 個 `research-verifier` | 三振關卡；有序確認 |

**哨兵（Sentinel）機制**：`.omh/research/{slug}-report.md` 帶 `status: confirmed` 標記，這就是「這份研究已定稿」的耐久介面，下游技能直接消費它。

**校驗透過時的順序不可顛倒**：

1. 先寫入帶 `status: confirmed` 的報告（原子、冪等的哨兵）
2. 再往事件日誌追加 `REPORT_CONFIRMED`
3. 最後清理狀態

順序反了就可能出現「狀態清了但報告沒落盤」的不一致。

**成本包絡**（README 明確給出，這一點很良心）：

> "A typical happy-path session is roughly **5-8 `delegate_task` calls** [...] With one synthesis retry, expect **up to ~10-12 calls**. The 3-strike retry cap bounds worst-case at ~14-16 calls before BLOCKED is surfaced."
>
> （典型順利路徑大約 **5–8 次 `delegate_task` 呼叫**……如果綜合環節重試一次，預計**最多約 10–12 次**。三振重試上限把最壞情況限定在約 14–16 次呼叫，之後就會上報 BLOCKED。）

**把成本上界寫進 README，是對使用者錢包的尊重。** 很多 AI 框架從不敢公開這個數字。

**研究員的誠實協議**：

> "**Empty-result protocol:** Return block with `SYNTHESIS: (insufficient sources for this subtopic)` — honest, not a failure."
>
> （空結果協議：返回 `SYNTHESIS:（此子話題來源不足）` 的結構塊——這是誠實，不是失敗。）

校驗者那邊也認這個：`(insufficient sources for this subtopic)` 是**誠實訊號，不判 FAIL**。但**編造內容 = FAIL，這是不可饒恕的原罪**。

### 4.5 omh-deep-interview（深度需求訪談）

**架構**：蘇格拉底式對話，**由使用者控制何時結束**。

**覆蓋維度**：目標（Goal）、約束（Constraints）、成功標準（Success Criteria）、既有上下文（Existing Context，僅棕地專案）

**評分方式**：粗粒度分檔（HIGH / MEDIUM / LOW / CLEAR），**永不自動終止**。

這是 OMH 與 OMC 的一個刻意分歧：

> "**LLM self-assessment lacks decimal precision. The user is the authority on readiness.**"
>
> （**大模型的自我評估沒有小數位級的精度。使用者才是"準備好了沒有"的權威。**）

OMC 用 0.0–1.0 的浮點數打分，到閾值自動退出訪談。OMH 認為這是偽精度——AI 說「歧義度 0.23」和說「0.31」之間沒有真實差別，而且**讓 AI 自己決定「我問夠了」本身就是個壞主意**。

**其他刻意分歧**：

| OMC 的做法 | OMH 的做法 | 理由（原文） |
| --- | --- | --- |
| 自動檢測棕地專案 | **問使用者** | "Checking for `package.json` etc. is unreliable and presumptuous."（檢查 package.json 之類的檔案不可靠且自作主張） |
| 規格里放完整訪談記錄 | **只放綜合摘要** | "Keeps specs readable and focused. Full transcript is ephemeral."（保持規格可讀、聚焦。完整記錄是易逝的） |
| 3 種具名挑戰模式 | **單條自適應指令** | "Same effect, less ceremony. **Consensus review called the modes 'cargo cult.'**"（效果一樣，儀式感更少。共識評審把這些模式稱為"貨物崇拜"） |

最後那句「貨物崇拜（cargo cult）」的評價相當辛辣——指的是照搬形式卻不理解實質的行為。

**自適應提問**：如果同一個維度連續追問 2 輪以上都沒進展，就換個提問角度。

**哨兵**：`.omh/specs/{name}-spec.md` 帶 `status: confirmed`——只有已確認的規格對下游技能有效。

### 4.6 omh-autopilot（全自動流水線）

**架構**：**每次呼叫只推進一個階段步驟**，在階段邊界處上下文全新。

| 階段 | 名稱 | 關鍵行為 |
| --- | --- | --- |
| 0 | 需求 | 檢查是否有已確認規格；需求模糊 → 載入 deep-interview（互動式） |
| 1 | 規劃 | 檢查是否有共識方案；沒有 → 載入 ralplan |
| 2 | 執行 | 每次呼叫跑一次 ralph 迭代；重複直到 `phase="complete"` |
| 3 | QA 迴圈 | 每次呼叫跑一個 QA 週期；收集證據、診斷、修復；對 `qa_error_history` 三振 |
| 4 | 多評審驗證 | 3 個並行評審（架構師 + 安全評審 + 程式碼評審）——**正好佔滿 3 個併發槽位** |
| 5 | 清理 | 刪除狀態檔案；**保留**日誌、方案、規格 |

**智慧跳過**：全新啟動時，會檢測已有產物來跳過已完成的階段。你昨天已經做完訪談了，今天跑 autopilot 不會再問你一遍。

**上下文檢查點**：每個階段完成後設定 `context_checkpoint: true` 並退出會話。下次呼叫讀狀態、清標誌、繼續。

這個設計的妙處在於：**上下文視窗在每個階段邊界被重置，所以再長的專案也不會撐爆上下文。** 狀態全在磁碟上，不在對話歷史裡。

### 4.7 兩個 driver：編排者的劇本

OMH 有一個很獨特的做法：**把「工人的紀律」和「工頭的劇本」拆成兩個技能。**

- `omh-ralplan` / `omh-ralph` = **工人側紀律**（在 `delegate_task` 內部、帶角色標記時使用）
- `omh-ralplan-driver` / `omh-ralph-driver` = **工頭劇本**（在兩次派發**之間**使用）

`omh-ralplan-driver` 有 **26 條編號陷阱（P1–P26）**，`omh-ralph-driver` 有 **10 條（P1–P10）**。這些不是拍腦袋想的，是從真實執行中學到的失敗模式。

**幾條特別值得記的**：

> "**P6 — Specific counter-proposals beat flagged concerns:** A strong Critic proposes a concrete alternative ('use four dimensions: X / Y / Z / W'), not just 'consider a different decomposition.'"
>
> （P6——具體的反提案勝過標記出來的顧慮：強批評者會提出具體替代方案（"用四個維度：X / Y / Z / W"），而不只是"考慮一下別的拆解方式"。）

> "**P10 — Iterate context package with user before dispatching:** Drafting from reading alone misses dimensions only the user can name."
>
> （P10——派發前先和使用者一起迭代上下文包：光靠閱讀起草，會漏掉只有使用者才叫得出名字的維度。）

> "**P2 — Identify parallel-safe batches before dispatching, not during:** If you wait until after dispatching one task to consider whether others could have run in parallel, you've forfeited the wall-clock savings."
>
> （P2——在派發**之前**就識別出並行安全的批次，而不是派發過程中：如果你派發完一個任務才開始考慮其他任務能不能並行，你已經把省下來的牆鍾時間白白丟掉了。）

### 4.8 高度契約：brief 與 deep review

`omh-ralplan-driver` 的 P26 號陷阱，講的是**交付物的形態**：

> "Two artifacts at the orchestrator-review step, not one. Deep review for the archive (preserves provenance and your honest self-assessment). Brief for delivery."

- **`brief.md`** —— 使用者讀的那份。**決策優先，1–2 頁。** "The user must be able to **give judgment from this alone**."（使用者必須能僅憑這份就作出判斷。）
- **`<orchestrator>-review-deep.md`** —— 存檔用。內部推理、完整論證、順從測試、執行方法觀察。**預設不讀。**

而 P26 最狠的一句是：

> "**The brief is the test of altitude: if you cannot reduce the deep review to a clean decisions-first brief, you do not have the altitude you think you have.**"
>
> （**簡報是"高度"的檢驗：如果你沒法把深度評審壓縮成一份乾淨的、決策優先的簡報，說明你並沒有自己以為的那個高度。**）

還有更本質的一句：

> "An executive presented with the deep review cannot give judgment from it; an executive presented with a brief can."
>
> （拿到深度評審的高管沒法據此作判斷；拿到簡報的高管可以。）

**這句話適用於所有 AI 輸出。** 你的 AI 助手交給你一坨 3000 字的分析，看起來很努力，但你其實沒法據此做決定——這就是「高度不夠」。

### 4.9 omh-triage（issue 分診，v0.1）

**狀態**：v0.1，**故意做得很小**——只有 2 個角色，先在真實場景裡打磨過再擴。

- **Triage Maintainer（維護者）** —— 程式碼錨定的地面真相：「這個 issue 的前提還成立嗎？」
- **Triage Skeptic（懷疑者）** —— 剪枝：「它配佔一個槽位嗎？」

計劃中的 v0.2+ 角色：Operator、Architect、Member-advocate。

**判決組合矩陣**（權威表）：

| 維護者 | 懷疑者 | 結論 |
| --- | --- | --- |
| stale（過期） | （不執行） | 關閉 |
| out-of-scope（超範圍） | （不執行） | 關閉 |
| recast/partial-stale | keep | 重寫正文，保留 |
| recast/partial-stale | drop/wait | 關閉 |
| live（有效） | keep | 保留為 live |
| live | drop/wait | 關閉 |
| live | dedup | 關閉 + 留言 |
| live | refile-smaller | 關閉 + 重開一個更小的 |

**預飛行紀律**（`omh-triage-driver`）：

- issue 數 < 10 → 手工處理，別上 AI
- issue 數 > 100 → 先人工粗篩一遍
- 距上次梳理 < 2 周且無大重構 → **低槓桿，別跑**
- 最關鍵的檢查：**「自 issue 提交以來，哪些程式碼面已經移動了？」**

以及一條反過度使用的告誡：

> "**T6:** Running too often — If you find yourself dispatching `omh-triage` weekly, the fix is upstream."
>
> （T6：跑得太頻繁——如果你發現自己每週都在派發 omh-triage，那問題出在上游。）

**一個框架敢在自己的文件裡寫「別老用我」，這是罕見的誠實。**

---

## 五、外掛層：角色注入與原子狀態

### 5.1 角色注入：v1 到 v2 的關鍵最佳化

**v1（囉嗦版）**：把角色的完整描述文字內聯在 `delegate_task` 的 `context` 欄位裡。

**v2（精簡版）**：只在 goal 字串裡放一個 `[omh-role:NAME]` 標記，由鉤子自動注入。

```python
delegate_task(
    goal="[omh-role:executor] Implement the following task:\n\n<task>...",
    context="<只放專案上下文>"
)
```

**機制**（`docs/plugin.md`）：

> "The key architectural insight for role injection: `delegate_task` passes `goal` as `user_message` to the subagent's `run_conversation()`. The `pre_llm_call` hook receives this as `user_message` on `is_first_turn=True`, making it the natural injection point — **no new Hermes primitives required.**"
>
> （角色注入的關鍵架構洞察：`delegate_task` 把 `goal` 作為 `user_message` 傳給子代理的 `run_conversation()`。`pre_llm_call` 鉤子在 `is_first_turn=True` 時接收到它，這就是天然的注入點——**不需要任何新的 Hermes 原語。**）

帶來的直接收益：

> "**Parent context never loads role text — zero token overhead.**"
>
> （父代理的上下文裡從不載入角色文字——**零 token 開銷。**）

這是個很聰明的槓桿：**在不改上游框架一行程式碼的前提下，找到了一個現成的注入縫隙。**

### 5.2 角色目錄（15 個角色檔案）

| 角色 | 職責 | 使用者 |
| --- | --- | --- |
| Planner（規劃者） | 任務拆解、排序、風險標記 | ralplan |
| Architect（架構師） | 結構評審、邊界清晰度、長期可維護性 | ralplan、ralph 終審 |
| Critic（批評者） | 對抗性挑戰、假設檢驗、壓力測試 | ralplan |
| Executor（執行者） | 程式碼實現、測試優先、最小改動 | ralph |
| Verifier（驗證者） | 基於證據的完成度檢查、**只讀**、透過/失敗 | ralph |
| Analyst（分析師） | 需求提取、隱藏約束、驗收標準 | deep-interview、autopilot |
| Security Reviewer（安全評審） | 漏洞、信任邊界、注入向量 | autopilot 驗證階段 |
| Test Engineer（測試工程師） | 測試策略、覆蓋率、邊界情況、抗抖動 | autopilot QA 階段 |
| Code Reviewer（程式碼評審） | diff 評審、規範、整體質量 | autopilot 驗證階段 |
| Debugger（除錯者） | 根因分析、假設檢驗、最小定向修復 | ralph 錯誤診斷 |
| Researcher（研究員） | 單子話題研究、結構化發現塊 | deep-research |
| Research Synthesist（研究綜合者） | 綜合多份發現 | deep-research |
| Research Verifier（研究校驗者） | **只讀**校驗引用完整性 | deep-research |
| Triage Maintainer / Skeptic | 分診雙角色 | triage |

### 5.3 三個鉤子

| 鉤子 | 作用 |
| --- | --- |
| `pre_llm_call` | 檢測子代理 `user_message` 裡的 `[omh-role:NAME]`，把角色提示注入系統上下文；同時注入「模式感知」（當前階段/迭代） |
| `pre_tool_call` | 在子代理啟動前校驗角色標記；遇到未知角色名**只警告不阻塞**（快速發現拼寫錯誤） |
| `on_session_end` | 意外退出時，往活躍模式的狀態檔案寫入 `_interrupted_at` 時間戳 |

### 5.4 omh_state 工具：原子狀態引擎

**原子寫入模式**：

```
寫入 .tmp.{uuid} → fsync → os.replace
```

這是標準的原子檔案替換套路——`os.replace` 在 POSIX 上是原子的，所以狀態檔案**永遠不會處於半寫狀態**。程式在任何一刻崩潰，磁碟上要麼是舊版本，要麼是新版本，不會是殘缺版本。

**每次寫入都帶 `_meta` 信封**：

```python
{
  "_meta": {
    "written_at": "ISO8601 時間戳",
    "mode": "...",
    "schema_version": 1,
    "written_by": "omh-plugin"
  },
  ...實際資料
}
```

**諮詢鎖（advisory lock）**：

- `.lock` 檔案，內含 JSON：`{pid, session_id, started_at, lock_key, holder_note?}`
- **陳舊鎖檢測**：用 `os.kill(pid, 0)` 檢查持鎖程序是否還活著
- 重試時自動釋放陳舊鎖

這解決了一個真實問題：AI 會話崩了，鎖檔案留在磁碟上，下次啟動被自己的屍體鎖死。用 PID 存活檢測就繞過去了。

### 5.5 omh_gather_evidence 工具：證據收集的安全模型

這個工具要執行 shell 命令（跑測試、跑構建），是整個系統攻擊面最大的地方。它的防護是分層的：

| 防護 | 說明 |
| --- | --- |
| **拒絕 shell 元字元** | 命令裡出現 `;` `&` `\|` `` ` `` `<` `>` 等一律拒絕——防注入 |
| **Token 字首白名單** | `npm test` 匹配 `npm test --verbose`，但**不**匹配 `npm testing-malicious` |
| **`shell=False`** | subprocess 不經 shell，杜絕變數展開 |
| **工作目錄限定** | 綁死在專案根目錄，不能透過工具引數逃逸 |
| **單命令超時** | 預設 120 秒，最大 300 秒 |
| **輸出截斷** | 預設 2000 字元，**保留尾部**（錯誤資訊通常在末尾） |

注意「token 字首白名單」這個細節——如果用樸素的 `startswith("npm test")`，`npm testing-malicious` 會被放行。按空格分詞後比對字首 token，才是正確做法。**這是一個真正懂安全的人寫的程式碼。**

### 5.6 omh-delegate：加固的派發包裝器

`docs/omh-delegate.md` 裡有一段極其剋制、極其誠實的表述：

> "omh_delegate mitigates an **intentional architectural property** of Hermes's `delegate_task`, not a bug. By design, `delegate_task` returns *only the subagent's final summary* to the parent [...] **There is no upstream fix to wait for: the contract is the feature.**"
>
> （omh_delegate 緩解的是 Hermes `delegate_task` 的一個**有意為之的架構屬性**，不是 bug。按設計，`delegate_task` 只把子代理的最終摘要返回給父代理……**沒有什麼上游修復可等：這個契約本身就是特性。**）

**「不要把別人的設計取捨當 bug 報」**——這是成熟工程師和抱怨型工程師的分水嶺。

**解法：純子代理持久化（subagent-persists）**

給子代理一個確定的輸出路徑，用「殘酷的散文契約塊」附加在 goal 後面，告訴它：**你的最後一個動作必須是在這個精確路徑上 `write_file`。** 然後包裝器去檢查檔案在不在。

**沒有救援分支**：

> "There is **no rescue branch in v0**. If the subagent ignores the contract, the wrapper returns `ok=False` with the raw return preserved [...] — **loud failure, not silent rescue.** This is deliberate: it preserves the feedback signal that teaches us whether the contract prose works in practice."
>
> （v0 裡**沒有救援分支**。如果子代理無視契約，包裝器返回 `ok=False`，同時保留原始返回……——**響亮地失敗，而不是悄悄地補救。** 這是刻意的：它保留了那個能告訴我們"契約文案在實踐中到底管不管用"的反饋訊號。）

**這條哲學值得所有人抄走。** 我們太習慣寫兜底邏輯了：「如果 AI 沒按格式返回，我就用正則搶救一下」。結果是——你永遠不知道你的提示詞到底有多爛，因為兜底邏輯把爛的訊號吃掉了。

**麵包屑（breadcrumb）只追加不修改**：

```
.omh/state/dispatched/{id}.dispatched.json   ← prepare() 寫
.omh/state/dispatched/{id}.completed.json    ← finalize() 寫（獨立檔案）
```

> "Both breadcrumbs are **append-only**. The wrapper never mutates a breadcrumb after writing it; completion data lives in a sibling file. **This eliminates a class of read-modify-write race conditions.**"
>
> （兩種麵包屑都是**只追加**的。包裝器寫完後從不修改；完成資料存在同級的另一個檔案裡。**這消除了一整類"讀-改-寫"競態條件。**）

**前向相容的深謀遠慮（AC-1）**：

> "In v0 the `ok` field is a plain bool. v1.B may reintroduce a rescue branch and make `ok` tri-state (`True | False | "degraded"`). **Python truthiness will treat the string `"degraded"` as truthy**, so naïve callers writing `if result["ok"]:` would silently treat a degraded result as success. To stay correct across that future change, callers needing a hard pass/fail check should use `ok_strict`."

作者**在 v0 就預見到了 v1 的三態改造會靜默破壞呼叫方**，所以現在就提供了 `ok_strict`。這種「為三年後的自己留門」的意識，正好呼應了本倉庫工程原則裡的「架構決策往長了做」。

### 5.7 `.omh/` 目錄：選擇性共享

| 子目錄 | 進 git？ | 生命週期 | 內容 |
| --- | --- | --- | --- |
| `state/` | **否** | 單次會話 | 活躍模式狀態 JSON + `.lock` 檔案 |
| `logs/` | **否** | 單次會話 | 只追加事件日誌——只記決策/狀態轉移，不記內容 |
| `progress/` | **否** | 單次會話 | ralph 執行進度日誌 |
| `specs/` | **是** | 耐久 | 已確認的訪談規格 |
| `plans/` | **是** | 耐久 | 共識方案（ADR 形態） |
| `research/` | **是** | 耐久 | deep-research 產出的研究報告 |

這個劃分背後的哲學，文件寫得很到位：

> "A spec or a consensus plan is a **decision artifact** — the canonical record of 'what we agreed to build.' It belongs in the repo for the same reason an ADR belongs in the repo. Treating these as user-private throws that away. State and logs are **per-session runtime.**"
>
> （規格和共識方案是**決策產物**——是"我們商定要造什麼"的權威記錄。它屬於倉庫，理由和 ADR 屬於倉庫一樣。把它們當成使用者私有的東西，就把這份價值扔掉了。狀態和日誌則是**單次會話的執行時。**）

> "State and logs [...] reflect what one developer was doing at one moment, and they're cleared on completion. **Sharing them adds noise without value.**"
>
> （狀態和日誌……反映的是某個開發者在某一刻在幹什麼，完成後就清掉了。**共享它們只增加噪音，沒有價值。**）

**這條邊界畫得極準**：AI 產出的東西里，「結論」值得進版本庫，「過程」不值得。很多團隊把 AI 會話日誌一股腦提交，最後沒人看，只是把倉庫撐肥了。

---

## 六、設計哲學（十四條）

以下每條都在倉庫裡有明確出處，不是我的解讀。

### 6.1 技能獨立可用，外掛只增強不設卡

> "Skills work standalone with zero dependencies."（README）
>
> "Keep skills standalone-capable; plugin features should enhance, not gate."（CONTRIBUTING）
>
> （保持技能獨立可用；外掛功能應該是**增強**，而不是**設卡**。）

意思是：你不裝外掛，技能照樣能用，只是囉嗦一點（角色文字要內聯）。裝了外掛，體驗更好。**沒有「裝了外掛才能開始」這種綁架。**

（唯一例外是 `omh-ralph`，它確實需要外掛——因為它依賴原子狀態和鎖。）

### 6.2 共識辯論優於單次輸出

> "This catches blind spots that a single agent misses. The Critic's job is to break the plan — if it survives, it's stronger for it."

### 6.3 證據高於斷言

> "The iron law of ralph verification: evidence, not assertion."
>
> "No approval without fresh evidence. If you don't see test output, it didn't pass."

### 6.4 檔案所有權剛性

> "When dispatching parallel executors, only ONE task owns each shared file."
>
> "Stay in your file scope."

### 6.5 編排者跑證據，驗證者不跑

> "Critical: the verifier does NOT run evidence themselves. Gathering happens at the orchestrator level."

### 6.6 三振熔斷按類別計數

> "Tagging by category prevents test-infra strikes from masking real bugs."

### 6.7 編排者要保持高度，不要下場幹活

> "The orchestrator role exists for one reason: **to stay above the work** so you can dispatch with one altitude and review with another."
>
> "The orchestrator's discipline: **skepticism, not deference.** Trust given to you (by the user installing you as orchestrator) is meant to be **USED**, not held in reserve."
>
> （編排者這個角色存在的唯一理由：**待在工作之上**，這樣你才能用一種高度派發、用另一種高度評審。）
> （編排者的紀律：**懷疑，而非順從。** 使用者把你安置成編排者所賦予的信任，是讓你**用掉**的，不是讓你留著不動的。）

最後這句極妙——**AI 最常見的失職不是做錯事，而是過度客氣、不敢下判斷。**

### 6.8 高度契約：簡報 vs 深度評審

> "The brief is the test of altitude: if you cannot reduce the deep review to a clean decisions-first brief, you do not have the altitude you think you have."

### 6.9 META 問題：批評者必須能質疑框架

> "The single most load-bearing move: the Critic must be licensed to contest the framing itself."

### 6.10 使用者永遠掌握退出權

> "The user always decides when they're done — scoring never auto-terminates."
>
> "Coarse bins are advisory heuristics for question targeting. The user always decides when they're done. **Never auto-terminate based on coverage scores.**"

### 6.11 響亮地失敗，而非悄悄地補救

> "Loud failure, not silent rescue. This is deliberate: it preserves the feedback signal."

### 6.12 上下文包是質量誕生的地方

> "**The context package is where quality is born.** Verify ground truth, surface adjacent mechanisms, verify external premises, settle filesystem layout, walk it with the user, kill phantom contests on reframe. **Most pitfalls in this skill are pre-dispatch failures.** Treat the package as the load-bearing artifact it is."
>
> （上下文包是質量誕生的地方。核實地面真相、浮現相鄰機制、驗證外部前提、敲定檔案系統佈局、與使用者走一遍、在重構框架時殺掉幽靈爭論。**這個技能裡的大多數陷阱都是"派發前"的失敗。** 把上下文包當成它本來就是的那個承重產物來對待。）

**這一條可能是最實用的一條。** 大多數人以為 AI 輸出質量取決於模型強不強，實際上取決於你喂進去的上下文有多準。26 條陷阱裡絕大多數是派發前的失敗——**問題出在你按下回車之前。**

### 6.13 立場文件 ≠ 需求文件

> "A 'design stance' and a 'requirements document' are different artifacts."
>
> "Requirements need: **needs not features; every item has inline citations; prefer missing to fabricating; forbid feature-by-analogy.**"
>
> （需求文件需要的是：**說需要而不是說功能；每一條都要有內聯引用；寧可缺失也不要編造；禁止"類比出來的功能"。**）

「禁止類比出來的功能」（forbid feature-by-analogy）是個好詞——指的是「別的產品有這個功能，所以我們也該有」這種偽需求。

### 6.14 自舉：用自己造自己

> "OMH was built using its own tools. The first skill implemented was `omh-ralplan` (consensus planning), which was then used to design the remaining skills through multi-agent debate."
>
> "Each consensus process produced a plan that was then reviewed against the actual OMC source code and LobeHub marketplace implementations."

**自舉是最強的可信度證明。** 一個多智慧體編排框架，如果它的作者自己都不用它來設計，那就是個玩具。

---

## 七、詳細教程：從零上手

> 下面的教程假設你已經裝好了 [Hermes Agent](https://github.com/NousResearch/hermes-agent) v0.7.0 或更高版本。

### 7.1 第一步：安裝

**方式 A：透過 skills tap（推薦）**

```bash
# 1. 新增技能源
hermes skills tap add witt3rd/oh-my-hermes

# 2. 安裝你需要的技能
hermes skills install \
  omh-deep-research \
  omh-ralplan \
  omh-ralplan-driver \
  omh-deep-interview \
  omh-ralph \
  omh-ralph-driver \
  omh-ralph-task \
  omh-autopilot
```

**方式 B：手動複製**

把 `skills/<name>/` 目錄複製到 `~/.hermes/skills/omh/` 即可。

**安裝可選外掛**（強烈推薦，`omh-ralph` 必需）：

```bash
# 要求 Python 3.10+ 和 pyyaml
pip install pyyaml

# 把 plugins/omh/ 安裝到 ~/.hermes/plugins/omh/
cp -r plugins/omh ~/.hermes/plugins/omh
```

### 7.2 第二步：初始化 `.omh/` 目錄

OMH 會在首次使用時自動在專案裡播種 `.omh/` 目錄（需裝外掛）。想提前搭好骨架：

```
omh_state(action="init")
```

生成的結構：

```
.omh/
├── .gitignore        ← 預配置好「選擇性共享」
├── README.md         ← 解釋這套約定
├── state/            ← 不進 git
├── logs/             ← 不進 git
├── progress/         ← 不進 git
├── specs/            ← 進 git（決策產物）
├── plans/            ← 進 git（決策產物）
└── research/         ← 進 git（決策產物）
```

生成的 `.gitignore` 長這樣：

```gitignore
# 易逝的執行時——不用於共享
state/
logs/
progress/

# 耐久的決策產物——納入 git 追蹤
# specs/      已確認的訪談規格
# plans/      共識方案（ADR 形態）
# research/   研究報告
```

### 7.3 第三步：需求還很模糊？先做訪談

```
載入 omh-deep-interview 技能，開始需求訪談：我想做一個 XXX
```

它會：

1. **開場問兩個問題**：專案描述 + 這是全新專案（greenfield）還是既有專案（brownfield）？
2. **進入訪談迴圈**（≤5 輪，可延長到 10 輪）：每輪針對**最弱的那個維度**問一個問題。
3. **生成規格**：綜合成 `.omh/specs/{name}-spec.md`
4. **等你確認**：確認 / 要求修改 / 放棄

**關鍵**：它**永遠不會自己決定「我問夠了」**。粗粒度評分（HIGH/MEDIUM/LOW/CLEAR）只用來決定「下一個問題問哪個維度」，不用來決定何時結束。

**產物**：`.omh/specs/{name}-spec.md`，帶 `status: confirmed`。只有這個狀態的規格才對下游有效。

### 7.4 第四步：跑一次共識規劃

```
載入 omh-ralplan 和 omh-ralplan-driver 技能，
基於 .omh/specs/my-feature-spec.md 做一次共識規劃
```

**如果你自己當總指揮，務必同時載入 driver 技能。**

**Phase 0：撰寫上下文包** —— 這是最重要的一步。按 P10 的要求，**先和使用者過一遍再派發**：

```markdown
## 上下文包

### 我們要解決什麼
（把規格里的核心需求提煉出來）

### 相關現有程式碼
（列出關鍵檔案路徑 + 一句話說明）

### 已知約束
（技術棧、效能要求、不能動的部分）

### 需要在當前框架內質疑的點
1. ...
2. ...

### META 問題（必須有！）
以上框架本身是否正確？我們是否在解決正確的問題？
有沒有一種根本不同的拆解方式？
```

**最後那個 META 問題不能省。** 沒有它，批評者只會抓細節。

**Phase 1：跑輪次**

- 第 1 輪序列：規劃者 → 架構師 → 批評者
- 第 2 輪起並行：規劃者改稿後，架構師和批評者同時複審

**Phase 2：蒸餾成兩份產物**

- `brief.md` —— 給使用者看，1–2 頁，決策優先
- `<orchestrator>-review-deep.md` —— 存檔，預設不讀

**產物**：`.omh/plans/ralplan-{slug}.md`

### 7.5 第五步：執行

```
載入 omh-ralph 和 omh-ralph-driver 技能，
按 .omh/plans/ralplan-my-feature.md 開始執行
```

**規劃關卡會先卡你一道**：沒有帶**可測試驗收標準**的編號任務列表，ralph 拒絕執行。這是刻意的——防止「先幹起來再說」。

一個合格的 ralph-shaped 計劃長這樣：

```markdown
## 任務列表

### Task 1: 新增使用者模型
- **擁有的檔案**: `src/models/user.py`, `tests/test_user.py`
- **禁止修改**: `src/models/__init__.py`（Task 3 擁有）
- **依賴**: 無
- **驗收標準**:
  - [ ] `User` 類有 `id` / `email` / `created_at` 欄位
  - [ ] `pytest tests/test_user.py` 全綠
  - [ ] email 欄位有格式校驗，非法輸入拋 `ValidationError`

### Task 2: 新增使用者倉儲
- **擁有的檔案**: `src/repos/user_repo.py`, `tests/test_user_repo.py`
- **依賴**: Task 1
- **驗收標準**:
  - [ ] `save()` / `find_by_id()` / `find_by_email()` 三個方法
  - [ ] `pytest tests/test_user_repo.py` 全綠
```

**每次呼叫只跑一個任務（或一批 2–3 個並行安全的任務），然後退出。** 你需要反覆呼叫，直到狀態變成 `complete`。

**編排者在每次迭代之間要做的四件事**：

1. **挑對批次** —— 2–4 個獨立任務，觸及的檔案互不重疊
2. **給執行者寫足上下文** —— TDD 指令、「禁止修改」清單、提交後設資料、前面任務的學習
3. **派驗證者之前先自己跑證據** —— `omh_gather_evidence`
4. **並行派發驗證者**

**想中途停下來**：

```
omh_state(action="cancel", mode="ralph", instance_id="{instance_id}", reason="user request")
```

30 秒 TTL，乾淨中止。

### 7.6 第六步（可選）：全自動流水線

```
載入 omh-autopilot 技能，端到端完成：我想做一個 XXX
```

它會自動串起 6 個階段。**每次呼叫推進一個階段步驟**，所以你還是要反覆呼叫，但每次上下文都是新鮮的，不會撐爆。

它還會**智慧跳過已完成的階段**：你昨天已經做了訪談，今天就直接從規劃開始。

### 7.7 第七步：面對陌生領域，先做研究

```
載入 omh-deep-research 技能，研究一下：XXX 技術的現狀與最佳實踐
```

五階段流程，**每次呼叫只推進一批**（最多 3 個並行研究員）。

**產物**：`.omh/research/{slug}-report.md`，帶 `status: confirmed`。

**成本預期**：順利路徑 5–8 次子代理呼叫；最壞情況 14–16 次。

### 7.8 完整流水線示例

```bash
# 場景：給一個陌生的領域做新功能

# 1. 先搞懂領域（多次呼叫直到 status: confirmed）
> 載入 omh-deep-research，研究 WebRTC 的 SFU 架構

# 2. 問清楚需求（互動式，你要回答問題）
> 載入 omh-deep-interview，基於上面的研究報告，訪談我的需求

# 3. 吵出方案（最多 3 輪）
> 載入 omh-ralplan + omh-ralplan-driver，基於規格做共識規劃

# 4. 幹活（反覆呼叫直到 complete）
> 載入 omh-ralph + omh-ralph-driver，按方案執行
> 繼續
> 繼續
> ...

# 5. 檢查產物
$ ls .omh/plans/     # 共識方案（進 git）
$ ls .omh/specs/     # 需求規格（進 git）
$ ls .omh/research/  # 研究報告（進 git）
$ git log --oneline  # 每個任務一個提交
```

### 7.9 常見坑與排查

| 症狀 | 原因 | 解法 |
| --- | --- | --- |
| ralph 拒絕執行 | 計劃裡沒有帶驗收標準的編號任務 | 補齊任務列表，每條都要有可測試的驗收標準 |
| 並行任務改同一個檔案衝突 | 派發時沒寫「禁止修改」清單 | 每個共享檔案只能有一個任務擁有（P3） |
| 驗證者總是透過，但程式碼其實是壞的 | 你沒在派發驗證者前跑證據 | 先跑 `omh_gather_evidence`，把輸出塞給驗證者（P6） |
| 批評者只挑小毛病 | 上下文包裡沒有 META 問題 | 顯式加入「框架本身對不對」的授權（P4） |
| 會話崩了以後被鎖死 | 陳舊的 `.lock` 檔案 | 外掛會用 `os.kill(pid, 0)` 檢測並自動釋放 |
| 上下文視窗撐爆 | 試圖在一個會話裡跑完所有任務 | 這正是「每次呼叫一個任務」要解決的——讓它退出，再調一次 |
| 執行者在修不是自己造成的測試失敗 | 兄弟任務的干擾 | 用 `git stash` 對 HEAD 驗證法確認責任歸屬 |

---

## 八、歸納總結的觀點與結論

### 觀點 1：多智慧體的價值不在「更多算力」，而在「結構化異議」

很多人以為多智慧體就是「跑三遍取最好的」。OMH 的做法完全不同：**三個角色的任務目標是互相沖突的。**

- 規劃者的目標是**產出方案**
- 批評者的目標是**摧毀方案**
- 架構師的目標是**評估結構**

這種**內建對抗性**是價值來源。如果三個角色都是「幫我想想還有什麼問題」，那就退化成了三次同質化取樣，除了燒錢沒有別的作用。

**結論**：設計多智慧體系統時，先問一句——「這些角色的目標是否真的衝突？」如果不衝突，你只是在浪費 token。

### 觀點 2：最大的洞察是「批評者必須被授權質疑題目本身」

P4 號陷阱是整個倉庫裡資訊密度最高的一條：

> "Without licensing, the Critic catches details. With licensing, the Critic catches the frame."

這條規則揭示了一個更普遍的現象：**AI 預設在你給的框架內思考。** 你問「怎麼最佳化這個 for 迴圈」，它絕不會說「這個迴圈壓根不該存在」。你必須顯式給它「你可以推翻我的前提」的許可。

而佐證也在倉庫裡：OMH 最核心的執行架構（每次呼叫一個任務）**就是批評者在被授權後砸出來的**。

**結論**：在任何一次重要的 AI 諮詢裡，都顯式加一句——「你也可以質疑我這個問題本身問得對不對」。這一句話的期望收益，可能超過換一個更貴的模型。

### 觀點 3：「證據高於斷言」應該成為所有 AI 工程的預設設定

AI 說「已完成」的可信度，接近於零。不是因為它壞，是因為它的生成機制就是「補全一個聽起來對的句子」。

OMH 的三層防禦值得抄：

1. **驗證者只讀** —— 它不能改程式碼，所以不會「順手修一下然後說透過了」
2. **編排者跑證據** —— 證據的來源不是被審查者，從源頭切斷偽造可能
3. **二元判定不打折** —— 五條過四條判 FAIL

**結論**：任何 AI 自動化流程裡，「誰跑測試」這個問題的答案不能是「被驗收的那一方」。這是審計學裡最古老的原則，在 AI 時代同樣成立。

### 觀點 4：「響亮地失敗」比「悄悄地補救」更有長期價值

> "Loud failure, not silent rescue. This is deliberate: it preserves the feedback signal."

這條哲學反直覺但極其正確。我們本能地想給 AI 輸出加兜底：格式不對就正則搶救、返回缺欄位就填預設值。結果是——**你的提示詞永遠得不到改進，因為它有多爛被兜底邏輯吃掉了。**

OMH 明確選擇在 v0 不做救援分支，就是為了收集「契約文案到底管不管用」的真實訊號。

**結論**：在系統還在演化的階段，**別急著加兜底**。兜底應該在你已經充分理解失敗分佈之後再加，否則它就是一副止痛藥，掩蓋病情。

### 觀點 5：把「工人紀律」和「工頭劇本」拆開，是一個被低估的架構決策

OMH 把每個工作流拆成兩個技能：

- `omh-ralph` = 工人在 `delegate_task` 內部的紀律
- `omh-ralph-driver` = 工頭在兩次派發**之間**的劇本

這解決了一個真實痛點：**這兩類知識的載入時機和消費者完全不同。** 工人不需要知道怎麼分批次，工頭不需要知道怎麼寫單元測試。混在一起，兩邊都要讀一堆無關內容，白燒上下文。

**結論**：寫 AI 技能/提示詞時，按「誰在什麼時候讀」來拆分，而不是按「主題相關性」來拆分。

### 觀點 6：36 條編號陷阱是這個專案最有價值的資產

兩個 driver 加起來 36 條陷阱（P1–P26 + P1–P10），每一條都是從真實執行裡踩出來的。這些不是「最佳實踐清單」那種空話，而是具體到「如果你不寫 META 問題，批評者就會停在框架內」這種可執行的因果判斷。

尤其是 P26 那句：

> "The brief is the test of altitude: if you cannot reduce the deep review to a clean decisions-first brief, you do not have the altitude you think you have."

**這句話是給所有 AI 使用者的鏡子。** 你的 AI 給了你 3000 字，你看完還是不知道該怎麼辦——不是 AI 不努力，是「高度」出了問題。

**結論**：判斷一個 AI 框架成不成熟，看它有沒有「陷阱清單」。有原理沒陷阱的，八成沒在真實場景跑過。

### 觀點 7：「不要把別人的設計取捨當 bug 報」

`omh-delegate.md` 那句 "There is no upstream fix to wait for: the contract is the feature" 展現了一種少見的剋制。

Hermes 的 `delegate_task` 只返回最終摘要——這讓父代理拿不到中間過程。很容易把它當 bug 抱怨，然後等上游修。OMH 的判斷是：**這是隔離性的必然代價，是特性不是缺陷。** 於是它設計了「子代理持久化」來繞過，而不是等。

**結論**：面對第三方框架的限制，先問「這是不是有意為之」。如果是，就在自己這一側設計適配，別賭上游會改。

### 觀點 8：成本透明是一種職業道德

README 明確寫出：順利路徑 5–8 次呼叫，最壞 14–16 次。

**絕大多數 AI 框架不敢寫這個數字。** 因為寫出來就要為它負責，而且看起來「不夠神奇」。OMH 寫了，還給出了三振上限來做硬約束。

**結論**：評估任何 AI 工具時，先找它的成本包絡。找不到的，預設它沒有上界。

### 觀點 9：`.omh/` 的選擇性共享，是 AI 時代的新版本控制禮儀

> "A spec or a consensus plan is a decision artifact [...] State and logs are per-session runtime. Sharing them adds noise without value."

**決策進倉庫，過程不進倉庫。** 這條邊界畫得極準。共識方案是 ADR，值得永久儲存；某次會話的狀態 JSON，除了讓 `git log` 變髒沒有任何用處。

**結論**：給你的專案定一個「AI 產物入庫規則」。規格、方案、研究報告 → 進；狀態、日誌、進度 → 不進。

### 觀點 10：自舉是最強的可信度證明

> "OMH was built using its own tools. The first skill implemented was `omh-ralplan`, which was then used to design the remaining skills through multi-agent debate."

先做出共識規劃器，然後用它來設計剩下所有技能。而且每次共識產出的方案，都會**對照 OMC 真實原始碼複核**，確保不是憑空想象。

**結論**：看一個開發者工具靠不靠譜，看它的作者用不用它。不自用的工具，本質上是 demo。

### 總結：OMH 真正在傳遞的是什麼

拋開所有技術細節，Oh My Hermes 在傳遞一個觀念：

**AI 不可靠不是問題，問題是你沒有為「AI 不可靠」這件事設計流程。**

- AI 會有盲區 → 那就讓另一個 AI 專門找盲區（批評者）
- AI 會自說自話 → 那就不聽它說，只看證據（驗證者 + 編排者跑測試）
- AI 會陷入死迴圈 → 那就數錯誤指紋，三次就熔斷
- AI 會撐爆上下文 → 那就每次只做一件事，狀態存磁碟
- AI 會在框架內思考 → 那就顯式授權它推翻框架（META 問題）
- AI 會過度客氣 → 那就明確告訴它「信任是拿來用的，不是留著的」

**每一條不可靠，都對應一條工程紀律。** 這就是 OMH 的全部秘密——它不試圖讓 AI 變得更聰明，它試圖讓**不那麼聰明的 AI，在一套好規矩下，產出可靠的結果。**

這也是為什麼它值得學：**這些規矩，和你用的是哪個模型、哪個框架，幾乎無關。**

---

## 九、參考資料

- 專案倉庫：`https://github.com/witt3rd/oh-my-hermes`
- Hermes Agent：`https://github.com/NousResearch/hermes-agent`
- 靈感來源 oh-my-claudecode：`https://github.com/Yeachan-Heo/oh-my-claudecode`
- 概念文件：`https://github.com/witt3rd/oh-my-hermes/blob/master/docs/concepts.md`
- 外掛文件：`https://github.com/witt3rd/oh-my-hermes/blob/master/docs/plugin.md`
- 派發包裝器：`https://github.com/witt3rd/oh-my-hermes/blob/master/docs/omh-delegate.md`
- 與 OMC 的對比：`https://github.com/witt3rd/oh-my-hermes/blob/master/docs/omc-comparison.md`
- Hermes 約束說明：`https://github.com/witt3rd/oh-my-hermes/blob/master/docs/hermes-constraints.md`
- 未建成的部分：`https://github.com/witt3rd/oh-my-hermes/blob/master/docs/gaps.md`
- 路線圖：`https://github.com/witt3rd/oh-my-hermes/blob/master/ROADMAP.md`
- 貢獻指南：`https://github.com/witt3rd/oh-my-hermes/blob/master/CONTRIBUTING.md`
- triage 技能討論：`https://github.com/witt3rd/oh-my-hermes/issues/9`
