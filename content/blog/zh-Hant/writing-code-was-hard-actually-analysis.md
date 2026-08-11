---
title: 'Promptless《Writing code was hard, actually》深度解析：當「程式碼從來不是難題」成為流行敘事，是時候把帳算清楚——市場、機器與工程師'
description: '以 Promptless 工程部落格《Writing code was hard, actually》為主線，深度解析這篇短文如何反駁「寫程式碼從來不是難題」這一輪流行敘事。一文講透：①專案說明——Promptless 是什麼、為什麼這篇短文值得一讀；②詳細教學——三條主要證據線（時機、機器、市場）+ 一個正面觀察（「這技能正在變便宜 ≠ 這技能從來不行」）+ 一個工程警示（「工程師造了叫他們平凡的工具」）；③觀點歸納——文章把「AI 讓程式碼變便宜」和「程式碼從來容易」分開；④設計哲學——對稀缺性敘事、對歷史尊重、對工程師身分的三層姿態。核心主張：不要把「技能變便宜」改寫成「技能從來平凡」——前者是誠實的市場評估，後者是改寫歷史。這篇短文給工程敘事裡「AI 取代/不取代誰」提供了最乾淨的論證模板。'
date: "2026-08-10"
author: "TopDigg Research Team"
tags: ["Promptless", "writing-code", "AI Engineering", "Software Engineering", "AI Agents", "Engineering Culture", "AI Hype", "Code Generation", "Engineering Identity", "Career"]
categories: ["Deep Dive"]
keywords: ["Promptless", "writing code was hard", "AI 取代程式設計師", "寫程式碼從來不是難題", "工程敘事", "AI 炒作", "LLM 訓練成本", "軟體工程師薪資", "工程師身分", "AI 時代職業", "AI 工具", "工程文化"]
---

# Promptless《Writing code was hard, actually》深度解析：當「程式碼從來不是難題」成為流行敘事，是時候把帳算清楚——市場、機器與工程師

> 核心思想：**「寫程式碼從來不是難題」是一種便利的修正主義（revisionism），它恰好在 AI 讓程式碼變得幾乎免費時被發明出來。Promptless 工程部落格的《Writing code was hard, actually》用四條證據線拆穿它——時機（2018 年沒人這麼寫，那時需求問題同樣存在）、機器（數百億美元 + 千兆瓦 + 專門超級電腦只為部分自動化一件「容易」的事）、市場（三十年來軟體工程師薪資穩步上升，要麼市場三十年集體非理性，要麼寫程式碼就是難）、工程師（寫 LLM 的人本身就是軟體工程師——他們用這項技能部分自動化這項技能）。** 但文章最清醒的地方不是「反駁」，而是承認裡面有一句真話：「這技能正在變稀缺」——只是請別把它改寫成「這技能從來平凡」。一個是誠實的市場評估；另一個是改寫歷史。**它給所有「AI 取代 / 不取代誰」的討論提供了一個乾淨的論證模板：先問「機器貴不貴」，再問「市場判了多少年」，最後問「誰造了這台機器」——三個問題合起來，敘事就立不住。**

---

## 一、專案說明

### 1.1 它是什麼？

本文解析的是 **Promptless**（promptless.ai）工程部落格上的一篇短文 **《Writing code was hard, actually》**。

Promptless 自己做什麼：自動隨你的產品迭代而更新客戶文件的 AI 工具（「automatically updates your customer-facing docs as you ship features and support customers」）。它家技術部落格以「工程敘事 + 文件工程」為主調，短小、立場鮮明、不繞彎子——這篇就是典型樣本。

文章長度約 900 字（中文翻譯後約 1300 字），但結構極乾淨：

1. **現象**：每隔幾天就有人發「寫程式碼從來不是難題」的帖子
2. **揭穿**：這種敘事是「便利的修正主義」
3. **四條證據**：時機 / 機器 / 市場 / 工程師
4. **承認裡面有一句真話**：技能正在變稀缺（不是「從來平凡」）
5. **尾聲**：工程師造了這台機器——他們不是被取代的人，而是最有可能回答「接下來該怎麼辦」的人

### 1.2 一句話定位

> **這是一篇 900 字的工程文化短文，反駁「寫程式碼從來不是難題」的流行敘事，論證基礎是三條證據線（機器、市場、工程師）加一個對「技能變便宜」和「技能從來平凡」的區分。**

### 1.3 關鍵事實

- **來源**：Promptless 工程部落格（[promptless.ai/blog/technical/writing-code-was-hard-actually](https://promptless.ai/blog/technical/writing-code-was-hard-actually)）
- **類別**：工程文化 / Technical
- **作者**：Promptless 團隊（短文未署名個人）
- **格式**：單頁短文，無圖表、無程式碼、無產品推介——**純觀點**
- **核心動作**：反駁（rebuttal）「寫程式碼從來不是難題」這一輪流行敘事
- **配套文章**（同站）：[Docs Site Search Optimization](https://promptless.ai/blog/technical/docs-site-search-optimization)、[Developer Relations Docs](https://promptless.ai/blog/technical/developer-relations-docs)、[Developer Relations Docs Have a New Primary Reader](https://promptless.ai/blog/technical/developer-relations-docs-agent-primary-reader)
- **關聯產品**：Promptless 主產品是自動文件更新工具；本文與產品功能無直接關係——屬於工程文化評論

### 1.4 它解決的問題

2025–2026 年，X / LinkedIn / 各種行業自媒體上反覆出現這類帖子：

> "工程師用自然語言描述改動，Claude Code 自動寫程式碼。"
> "非技術人員從零開始做產品，再也不需要碰一行程式碼。"
> "寫程式碼從來不是難題——理解需求、設計系統、跟利害關係人溝通才是。"

**這種敘事正在做一件很具體的事：把一項被部分自動化的技能，從「曾經很難但被解決了」重新包裝成「從來就不難」——從而讓「AI 取代程式設計師」這件事看起來是必然的、早就該發生的、不是任何人的錯。**

Promptless 這篇短文做的事是：**別接受這個改寫。** 用證據把它頂回去。

---

## 二、詳細教學：四條證據線 + 一個正面觀察 + 一個工程警示

文章沒有給「程式碼」——它給「論證」。本節把它的論證結構拆開，每條都給可識別的證據、可複用的反駁模板、可類比的實際場景。

### 2.1 證據 1：時機把「敘事」暴露出來

**原文論證**：

> "If writing code was never the hard part, someone should have been saying this in 2018. The requirements problem existed then. System design existed then. But nobody was writing blog posts about how coding was a trivial formality, because it obviously wasn't."

**這條證據的結構**：

- **如果 X 是真的，X 應該在 X 之前就被說出來**（時間反證）
- 2018 年，需求問題、系統設計、跟利害關係人溝通——這些問題早就存在
- 但**當時沒人寫「寫程式碼從來不是難題」**——因為它明顯不是
- 敘事出現在 AI 讓程式碼變便宜的同一刻——**說明它是 AI 時代的產物，不是工程真相**

**可複用的反駁模板**：

> "如果你聲稱的「X 一直如此」在 2018 年沒人說，那它不是「一直如此」，它是「最近才被發明出來支持一個新立場」。"

**類比**：

- 2010 年沒人說「開飛機從來不是難題」——那時確實不是。AI 自動駕駛出現後才有人開始說「開飛機本來就只是規則匹配」
- 2015 年沒人說「翻譯從來不是難題」——神經機器翻譯品質上來後（2016-2017）才出現「翻譯本來就只是語言轉換」的論調

### 2.2 證據 2：機器是證明

**原文論證**：

> "If writing code were easy, you would not need the machine. You don't spend billions of dollars training a model on purpose-built supercomputers to automate something trivial."

**這條證據的結構**：

- **工具的存在就是任務難度的反證**——人類造工具是為了解決自己做不好或做不到的事
- LLM 訓練：數十億美元 / 專門超算 / 千兆瓦電力 / 數十年的演算法研究——只為「部分自動化」程式碼生成
- 投入如此規模資源的，**不會是「從來就不是難題」的任務**

**文章用了一個很狠的反問**：

> "Can you describe the chip architecture, power delivery, and network topology required to run the coding tool you're using to declare that coding was never hard?"

——你用的讓「寫程式碼看起來容易」的工具，本身就是一個地球上幾乎沒人能完全理解的工程奇蹟。讓「容易」發生的那台機器，恰恰證明了「不容易」。

**可複用的反駁模板**：

> "如果這件事真的容易，你不需要造這麼貴的機器來部分自動化它。"

**類比**：

- 機器人焊接汽車車身——**我們不說「焊接從來不是難題」**；我們說焊接工程師解決了一個難題
- 寫作輔助 AI——我們不說「寫作從來不是難題」；我們說作者解決了一個難題
- 選擇性使用「從來不是難題」這個修辭——**取決於被自動化的是不是你**

### 2.3 證據 3：市場不是被騙了三十年

**原文論證**：

> "For thirty years, companies fought over software engineers. Salaries climbed steadily. Entire recruiting industries existed just to find people who could do the job. Was the market wrong this entire time? The 'never the hard part' crowd has to pick one: either the labor market was wildly irrational for three decades, or writing software was in fact hard."

**這條證據的結構**：

- 市場是資訊的最終聚合器——**它不撒謊三十年**
- 軟體工程師薪資三十年來穩步上升、專門獵人頭行業、簽證政策向技術工人傾斜——所有這些都說明「寫程式碼的人在做的事很值錢」
- 「從來不是難題」派必須二選一：**市場錯了三十年，或者寫程式碼確實難**
- 顯然市場沒錯

**可複用的反駁模板**：

> "在 30 年的薪資資料面前，你的「從來不是難題」必須解釋一下為什麼獵人頭公司、簽證政策、薪酬曲線都按相反方向走。"

**類比**：

- 外科醫師收入高 / 律師合夥人收入高 / 資深交易員收入高——市場對「難做的事」給出的價格是一致的
- **如果「寫程式碼從來不是難題」成立，那這三十年裡所有給軟體工程師溢價的人——董事會、HR、獵人頭、移民官——都錯了**

### 2.4 證據 4：工程師自己造了「取代」他們的工具

**原文論證**：

> "It's not like a bunch of outsiders looked over at software engineers and thought, 'those lazy bastards soaking up all that pay for easy work—let's build AI to expose them.' Coal miners did not do this. Management consultants did not do this. The people who built LLMs are software engineers. Researchers who write code. Infrastructure teams who write code. ML engineers who write code. They spent their careers mastering the skill, and then used that mastery to partially automate it."

**這條證據的結構**：

- 寫 LLM 的人**就是軟體工程師**——他們用了三十年來掌握「寫程式碼」這項技能，再用這項技能**部分自動化**它
- 不是「外行看到內行賺錢不爽」——**是內行用了自己的技能造了一個新工具**
- 這跟機器人工程師造焊接機器人是一回事——**沒有人會說「焊接從來不是難題」**

**可複用的反駁模板**：

> "把工具造出來的人就是那些被認為在做「容易事」的人——你要麼承認造工具需要掌握「容易事」，要麼承認這事兒從來不容易。"

**類比**：

- 焊接工程師造焊接機器人——**不被解釋為「焊接從來平凡」**
- 翻譯家造翻譯工具——**不被解釋為「翻譯從來平凡」**
- 唯一的不同是工程師**沒有工會**和**沒有顯眼的職業保護傘**——所以「從來平凡」這種修辭能暢通無阻

### 2.5 正面觀察：裡面有一句真話

文章在反駁後，主動**承認真相的一部分**：

> "The economic value of writing code, in isolation, is declining. AI tools are making it cheaper and faster to produce working software. The mix of skills that makes an engineer valuable is shifting. Those are true, defensible claims."

**承認了什麼**：

- **單看「寫程式碼」這一項技能的經濟價值在下降**
- AI 讓「產生可工作的軟體」變得更便宜、更快
- **工程師的「什麼讓你值錢」組合在變**——編碼能力占的比例在變，別的能力在變

**這是誠實的部分**。

但文章立刻把這條誠實**和另一件事切開**：

> "But that's not what people are saying. They're reaching backward in time to retroactively trivialize the skill. There's an enormous difference between 'this skill is becoming less scarce' and 'this skill was never impressive.' One is an honest market assessment. The other is rewriting history."

**這是文章最鋒利的一刀**：

- "這項技能正在變稀缺"——**誠實的市場評估** ✓
- "這項技能從來就不令人印象深刻"——**改寫歷史** ✗

**這兩件事**完全不同**——把後者包進前者就是修正主義**。

**可複用的認知框架**：

> "趨勢 ≠ 改寫"。「AI 讓 X 變便宜了」是趨勢；「X 一直很容易」是改寫。

### 2.6 工程警示：工程師造了這台機器

**文章結尾**：

> "But as we adapt, it's worth remembering who made the machine. Not the executives. Not the thought leaders. Engineers made it. The same people now being called trivial built the tool being used to call them trivial. That should give everyone pause."

> "The engineers who built the modern digital world aren't suddenly less capable because their hardest problem got automated. If anything, they're the ones best positioned to tackle what comes next. They've already proven they can do hard things. Now they have better tools."

**這一段的姿態**：

- 不煽情；不「工程師被低估了」
- 是陳述事實 + 給出可驗證的預測
- **事實**：寫 LLM 的人、寫超算的人、寫分散式訓練程式碼的人——都是軟體工程師
- **預測**：這群人最有能力回答「AI 時代接下來怎麼走」
- **不是安撫，是歸位**

### 2.7 一句話總結

> **「一項技能變便宜」≠ 「一項技能從來平凡」。** Promptless 用 900 字把這個區分講透了。區分方法很簡單：問三個問題——機器貴不貴？市場判了多少年？誰造了這台機器？——三問之後，「從來平凡」站不住。

---

## 三、觀點歸納：把 900 字拆成 5 條核心判斷

把短文的核心論證彙總，得到 5 條對工程敘事的判斷。

### 3.1 觀點 1：便利的修正主義是最難對付的敘事，因為它不是錯的，是「部分對的」

**核心**：

> "It is convenient revisionism, because it arrives at exactly the moment that AI tools are making code free to produce, and it flatters exactly the people who never wrote any."

**展開**：

- 「寫程式碼從來不是難題」不是完全錯的——裡面混著「AI 讓程式碼變便宜」這一句真話
- 但**它把「現在變便宜」改寫成「從來平凡」**——這是修辭動作
- 這種修辭最難反駁，因為反駁者要先承認其中一部分真話，然後才能說「但不是你想的那種」——**心理門檻很高**

**結論**：

- 反駁這類敘事不要從「完全錯」開始——**從「部分對」開始**：「你前面那段對的，但最後那句不是」
- 修正主義之所以「便利」，**是因為它的「對的部分」給讀者打了預防針**——讓你不好意思反駁「對的部分」，於是連「錯的部分」也吞了

### 3.2 觀點 2：工具的存在本身就是任務難度的反證

**核心**：

> "If writing code were easy, you would not need the machine."

**展開**：

- 人類造工具 = 人類做不到或做不好那件事
- LLM 不是「魔術」——是**數十億美元 / 專門超算 / 千兆瓦電力 / 幾十年演算法研究** 堆出來的
- 這麼大規模的資源**只為了部分自動化**——因為「完全自動化」做不到
- 讓「寫程式碼看起來容易」的工具，**本身就是工程奇蹟**——讓「容易」發生的那台機器證明了「不容易」

**結論**：

- 評估一項技能是否「從來平凡」——**先看為此投入了多少資源**
- 投入越多 → 任務越難
- 反過來看：AI 自動化的「輕」 ≠ 原任務的「輕」——自動化只是讓「輕」看起來容易了

### 3.3 觀點 3：三十年的薪資資料比任何部落格帖子都有說服力

**核心**：

> "Was the market wrong this entire time?"

**展開**：

- 市場聚合所有資訊——**它不撒謊三十年**
- 軟體工程師薪資三十年來穩步上升——這件事**橫跨多個經濟週期、橫跨多國、橫跨多個細分領域**
- 「從來不是難題」派必須解釋：**為什麼市場連續三十年都判錯了？**
- 唯一一致的解釋是「寫程式碼就是難」

**結論**：

- 當一個敘事跟三十年的市場資料矛盾——**先懷疑敘事**
- 修正主義的特點是「快速而合理」——但它需要「市場是傻子」這種**反事實假設**才能成立
- 評估任何「X 從來平凡」的論斷——**查三十年的薪資曲線**

### 3.4 觀點 4：「技能正在變稀缺」和「技能從來平凡」是完全不同的兩件事

**核心**：

> "There's an enormous difference between 'this skill is becoming less scarce' and 'this skill was never impressive.' One is an honest market assessment. The other is rewriting history."

**展開**：

- 趨勢判斷 vs 歷史改寫——**兩件完全不同的事**
- 「AI 讓寫程式碼變便宜」——**是 2023 年開始的現象**（GPT-4 之後）
- 「寫程式碼從來不是難題」——**是 2018 年不存在的立場**
- **把「現在變稀缺」偽裝成「從來平凡」是時間維度的偷換**

**結論**：

- 區分「對未來的判斷」和「對過去的判斷」——**別讓對未來的判斷改寫過去**
- 修正主義的標準操作：用「X 現在 X」的話術，讓人以為「X 一直 X」——但前者是觀察，後者是斷言
- 任何「X 變便宜」的誠實話術，**都不需要「X 一直平凡」這個尾巴**——加上尾巴就是修正主義

### 3.5 觀點 5：誰造了機器，誰就有能力回答「接下來怎麼走」

**核心**：

> "The engineers who built the modern digital world aren't suddenly less capable because their hardest problem got automated. If anything, they're the ones best positioned to tackle what comes next."

**展開**：

- 不是安撫，是歸位
- 寫 LLM 的人**本身**就是軟體工程師
- 這群人有**三十年的工程經驗**——只是「編碼」這一項被部分自動化，其他能力（系統設計、需求理解、跨團隊溝通、對機器的理解）**沒有自動化**
- 這群人最有能力**判斷「AI 時代哪些事值得做」**——因為他們懂機器

**結論**：

- 評估「AI 時代誰被取代」——**別看技能清單，看技能持有人**
- 軟體工程師**不會**因為「編碼被部分自動化」就被取代——因為他們**整個職業身分**從來不是「編碼」，是「用工程方法解決難題」
- 真正被取代的是**單一技能工種**（只會編碼而不懂系統的人），**不是工程師職業**

### 3.6 5 條觀點的關聯結構

```
觀點 1：便利的修正主義（用「部分對」包裝「部分錯」）
   ↓ (修辭手法)
觀點 2：工具存在就是任務難度的反證
觀點 3：市場三十年不撒謊
   ↓ (歷史事實)
觀點 4：趨勢 ≠ 改寫
觀點 5：工程師不會被取代，被取代的是單一技能工種
```

觀點 1 是修辭層（「為什麼這種敘事難對付」），觀點 2/3 是事實層（「反駁它需要什麼證據」），觀點 4 是區分層（「真話和假話怎麼切」），觀點 5 是預測層（「那工程師的未來是什麼」）。**這 5 條合起來構成一個完整的「AI 時代工程敘事」論證模板。**

---

## 四、設計哲學：從這篇 900 字看 Promptless 的工程姿態

Promptless 這篇短文（以及同站的幾篇技術部落格）展示了一種**罕見的工程姿態**——**給「AI 取代 / 不取代誰」這類話題立了一個乾淨、可複用、不煽情的論證模板**。把這種姿態抽出來，得到 4 條設計哲學。

### 4.1 哲學 1：誠實承認「部分對」，再切開「部分錯」

**姿態**：

文章不否認「AI 讓程式碼變便宜」——**這是真的**。它做的是**承認真的部分，然後切開假的部分**：

> "Those are true, defensible claims. But that's not what people are saying."

**為什麼這是好的工程姿態**：

- 拒絕「全對或全錯」二元論——**真實世界的判斷都是部分的**
- 把「對的部分」留給讀者——**不羞辱那些已經接受這種敘事的人**
- 把「錯的部分」清晰切開——**讓讀者能選擇跟哪一半走**

**可複用模板**：

> "你說的是真的——但只到這一句。從這一句開始，你說的不是真的。"

**反例（不該怎麼寫）**：

- 完全否認「AI 讓程式碼變便宜」——**這是另一邊的修正主義**
- 把反駁變成吐槽——**情緒化讓論證失效**
- 用「工程師是弱勢群體」的姿態——**沒人需要被保護**

### 4.2 哲學 2：用證據反駁敘事，不用情緒反駁敘事

**姿態**：

文章的全部 4 條證據——時機、機器、市場、工程師——**都是可查的事實**。沒有任何情緒、抱怨、立場化。

**為什麼這是好的工程姿態**：

- 工程師讀者**只看證據**
- 證據型反駁可以**被引用、被複製、被檢驗**
- 情緒型反駁只能**被感受、被遺忘**

**可複用的反駁結構**：

> "你說 X。X 在 Y 時間被說出過嗎？X 需要 Z 資源的投入嗎？X 的市場資料是 W 嗎？X 的工具是誰造的？——如果四個問題都站不住，X 是敘事，不是事實。"

**反例（不該怎麼寫）**：

- "我作為工程師很心痛"——**情緒無法反駁敘事**
- "那些 AI 炒作的人不懂"——**人身攻擊讓工程讀者關掉**
- "未來五年會證明你是錯的"——**未來派不是論證**

### 4.3 哲學 3：把「AI 時代」的判斷放回時間維度

**姿態**：

文章反覆回到**時間維度**：

- "If writing code was never the hard part, someone should have been saying this in 2018."
- "三十年來，薪資穩步上升"
- "The 'never the hard part' crowd has to pick one"

**為什麼這是好的工程姿態**：

- 任何「X 一直如何」的判斷都需要**時間維度的證據**
- 沒有時間維度的判斷都是**當下敘事**——而敘事會隨 AI 能力一起變
- 工程師讀者**對歷史敏感**——他們讀過 LLM 之前的工程史

**可複用的判斷框架**：

> 任何「X 從來如此」的論斷——問「那 2018 年、2010 年、2000 年為什麼沒人這麼說？」
> 任何「X 現在如此」的論斷——問「從什麼時候開始？觸發事件是什麼？」

### 4.4 哲學 4：讓「做這事的人」出場，讓敘事回到人

**姿態**：

文章最鋒利的一刀不是機器 / 不是市場——是**「造這台機器的人就是被認為做『容易事』的人」**。

> "The people who built LLMs are software engineers. Researchers who write code. Infrastructure teams who write code. ML engineers who write code. They spent their careers mastering the skill, and then used that mastery to partially automate it."

**為什麼這是好的工程姿態**：

- 修辭性敘事常常**把「做事的人」抽空**——只剩「事」和「抽象能力」
- 把「做事的人」放回中心——**敘事立刻失去它的修辭力量**
- 「造機器人的人」=「被認為是做容易事的人」——**這種自我指涉沒法被繞開**

**可複用的寫作動作**：

> 任何「X 正在被 AI 取代」——問「造這個 AI 的人，是不是之前被認為在做 X 的人？」
> 如果是——**敘事站不住**。
> 如果不是——**這是新的工種轉移**（值得討論）。
> 但大部分情況都是前者。

### 4.5 哲學小結：4 條哲學構成 Promptless 短文的姿態

| 哲學 | 一句話 | 文章裡的動作 |
|---|---|---|
| 1. 承認部分對，切開部分錯 | 拒絕二元論 | 承認「技能變稀缺」，切開「從來平凡」 |
| 2. 證據反駁敘事 | 工程師只看證據 | 時機 / 機器 / 市場 / 工程師 4 條證據 |
| 3. 放回時間維度 | 修辭怕歷史 | 2018 / 1990 / 30 年薪資曲線 |
| 4. 把「做事的人」放回中心 | 敘事怕自我指涉 | 寫 LLM 的人 = 軟體工程師 |

**4 條不是獨立的——它們組成一個反駁工具箱**：

- 想反駁一個 AI 時代敘事——**先用哲學 3 把它放回時間**（「那以前呢？」）
- 時間撐不住——**用哲學 2 找證據**（市場、機器、人）
- 證據還是撐不住——**用哲學 1 切開「對的部分和錯的部分」**
- 最後——**用哲學 4 讓人出場**（造 AI 的人就是被認為「做平凡事」的人）

**Promptless 這篇 900 字短文不是評論——它是一份「AI 時代工程敘事反駁」的可複用方法論。**

---

## 五、核心思想總結

Promptless《Writing code was hard, actually》給 AI 時代工程敘事留下的最重要遺產是**一份「反駁便利修正主義」的 4 步方法論**：

1. **承認部分對**——「AI 讓程式碼變便宜」是真的
2. **切開部分錯**——但「寫程式碼從來平凡」是改寫
3. **用證據反駁**——市場三十年、機器百億、工程師造
4. **把「做事的人」放回中心**——造 AI 的人就是被認為做「平凡事」的人

**給所有「AI 取代 / 不取代誰」的討論一個乾淨的論證模板**——三個問題把任何「X 從來平凡」敘事頂回去：

- 這台機器貴不貴？（貴 → 不平凡）
- 市場判了多少年？（多年 → 不平凡）
- 誰造了這台機器？（做這事的人 → 不平凡）

**記住它的一句話**：

> **「一項技能正在變稀缺」≠ 「一項技能從來平凡」。** 前者是誠實的市場評估；後者是改寫歷史。Promptless 用 900 字把這個區分講透了——並且沒有否認 AI 時代的任何真實變化，只是拒絕讓「變化」變成「改寫」。
>
> 工程師不會被「程式碼從來平凡」這種修辭說服——但他們會被「市場三十年不撒謊」、「造這台機器的人就是被認為做平凡事的人」這種論證說服。**這是反駁，不是抱怨**。**這是 Promptless 這篇短文給整個 AI 時代工程敘事留下的最乾淨的禮物**。

---

## 附錄 A：參考連結

- [Promptless《Writing code was hard, actually》](https://promptless.ai/blog/technical/writing-code-was-hard-actually)
- [Promptless 完整文件索引（llms.txt）](https://promptless.ai/llms.txt)
- [Promptless 主頁（Markdown）](https://promptless.ai/index.md)
- 同站相關工程文化文章：
  - [Docs Site Search Optimization: Why Content Accuracy Comes First](https://promptless.ai/blog/technical/docs-site-search-optimization)
  - [Developer Relations Docs: Why They Go Stale and Who Should Own Them](https://promptless.ai/blog/technical/developer-relations-docs)
  - [Developer Relations Docs Have a New Primary Reader](https://promptless.ai/blog/technical/developer-relations-docs-agent-primary-reader)
- Promptless 主產品（[promptless.ai](https://promptless.ai/)）：自動隨產品迭代更新客戶文件的 AI 工具
