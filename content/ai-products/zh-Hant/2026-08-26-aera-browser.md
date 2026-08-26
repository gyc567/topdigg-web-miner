---
title: "Aera Browser 深度分析：瀏覽器裡的自動員工，$20/月如何賣掉你的重複勞動"
description: "Aera Browser 是 2025 年 12 月上線的 Chromium 本地優先自動瀏覽器，用一句話 + 排程任務 + MCP 把瀏覽器變成自動員工。Stripe 驗證 MRR $343 / 9 訂閱 / ~1700 用戶，本報告逐層拆解其變現路徑、定價階梯、設計哲學與每用戶月度價值，給出可複製的變現與增長打法。"
date: "2026-08-26"
author: "ERIC"
tags: ["AI產品", "瀏覽器自動化", "MCP", "變現", "SaaS", "Aera Browser", "Chromium", "本地優先"]
categories: ["AI產品分析"]
keywords: ["Aera Browser", "getaera.app", "瀏覽器自動化", "MCP", "Chromium", "TrustMRR", "訂閱變現", "本地優先"]
product:
  name: "Aera Browser"
  url: "https://trustmrr.com/startup/aera-browser?ref=eric-kwok-b654e8"
  category: "AI瀏覽器自動化工具"
  launch_date: "2025-12"
  revenue: "$343 MRR（2026-08，Stripe API 驗證）· $3,635 累計營收"
  users: "~1,700 用戶 · 9 付費訂閱"
  pricing_model: "Free 自託管模型 + Pro $20/月 + Ultra $200/月"
  logo: "https://files.stripe.com/links/MDB8YWNjdF8xU2ZScTlMaGhtZ1p0d1NofGZsX2xpdmVfSFRRMUwxYVFBOEtkRjBZT0c0czRCd3FN00eG4pLTYa"
pricing:
  - plan: "Free"
    price: 0
    currency: "USD"
    period: null
  - plan: "Pro"
    price: 20
    currency: "USD"
    period: "month"
  - plan: "Ultra"
    price: 200
    currency: "USD"
    period: "month"
metrics:
  - name: "MRR"
    value: "$343（2026-08）"
  - name: "近 30 天營收"
    value: "$140"
  - name: "累計營收"
    value: "$3,635"
  - name: "活躍訂閱數"
    value: "9"
  - name: "總用戶數"
    value: "~1,700"
  - name: "付費轉化率"
    value: "~0.5%（9/1700 估算）"
  - name: "混合 ARPU"
    value: "~$38/月（MRR/付費訂閱）"
  - name: "Domain Rating"
    value: "9/100"
  - name: "TrustMRR 排名"
    value: "#2108"
  - name: "成立時間"
    value: "2025-12"
  - name: "創辦人"
    value: "Andrew Rivers（美國）"
  - name: "技術棧"
    value: "Chromium + Node.js + PostgreSQL + Stripe + OpenRouter"
sources:
  - label: "TrustMRR 公開檔案（含 ref 連結）"
    url: "https://trustmrr.com/startup/aera-browser?ref=eric-kwok-b654e8"
  - label: "TrustMRR AI-readable Markdown 快照"
    url: "https://trustmrr.com/startup/aera-browser.md"
  - label: "Aera 官方站點"
    url: "https://getaera.app"
  - label: "Aera 定價頁"
    url: "https://getaera.app/pricing"
  - label: "Aera 功能頁"
    url: "https://getaera.app/features"
  - label: "Aera 用例頁"
    url: "https://getaera.app/use-cases"
  - label: "Aera 安全與隱私頁"
    url: "https://getaera.app/security"
  - label: "Aera FAQ"
    url: "https://getaera.app/faq"
---

> **產品連結**：[https://trustmrr.com/startup/aera-browser?ref=eric-kwok-b654e8](https://trustmrr.com/startup/aera-browser?ref=eric-kwok-b654e8)（含推薦追蹤，本文頭尾均附）

# Aera Browser 深度分析：瀏覽器裡的自動員工，$20/月如何賣掉你的重複勞動

## 一、引言：瀏覽器是最後的護城河

AI 自動化賽道這兩年擠滿了人：ChatGPT Scheduled Tasks、Claude Computer Use、BrowserBase 雲端無頭、Puppeteer 腳本農場。但 2025 年 12 月才上線的 **Aera Browser** 選了一條最「笨」也最對的路——**不做雲端無頭，不做插件，直接給你一個能定時幹活的 Chromium 瀏覽器**。

一句話版本：
> **Aera is a browser that executes.** 你用自然語言描述一個重複任務，Aera 在你已登入的真實瀏覽器裡定時執行：讀頁、提數、填表、彙總、通知。每天早上醒來，活已經幹完了。

截至 2026-08-26 TrustMRR 快照：**MRR $343、9 個付費訂閱、~1,700 總用戶、累計 $3,635、Domain Rating 9**。數字很小，但樣本極純：美國獨立開發者、Stripe 直連驗證、Chromium 開源底座、MCP 整合、本地優先。這是一個教科書級的早期微型 SaaS 變現切片。

---

## 二、項目說明

**Aera = Chromium 真實瀏覽器 + 自然語言排程器 + MCP 連接器 + 本地優先存儲**。官網原話 *The browser that does the work.* 目標用戶：Developers, AI enthusiasts, workflow power-users。

### 核心能力

| 能力 | 說明 |
|---|---|
| **自然語言自動化** | 描述任務，Agent 點、輸、跳真實頁面 |
| **排程與常駐任務** | 任意請求一鍵轉為排程工作流，帶歷史與通知 |
| **MCP 整合** | 直連 Cursor、Claude Desktop、Gemini CLI |
| **子代理並行** | 多 Agent 協同並行處理多步任務 |
| **Vision** | 付費層對複雜視覺頁面的理解 |
| **Chrome 擴充與數據匯入** | 一鍵匯入密碼管理器、廣告攔截、書籤 |
| **本地優先** | 歷史、書籤、自動化配置全在本地 |

### 可靠區與不可靠區

- **可靠**：讀頁、盯變化、從儀表板提數、掃收件匣、填普通表單、按日程重複。
- **不可靠**：富文本與程式碼編輯器——官方自測會破壞內容，不適合寫文檔/改程式碼。
- **不做自動結帳**：故意不做支付，避免法律與風控坑。

---

## 三、設計哲學：5 條原則

### 哲學 1 — 本地優先，但誠實告知「推理出境」

歷史/書籤/任務全在本地 SQLite，但模型推理必出境：付費層走 OpenRouter → 第三方模型商；Free 層走本地 Ollama 才真正不出境。官網把「什麼在本地、什麼出境」逐條列出，甚至寫「無 SOC2、無 ISO27001」——把醜話說在前面。

### 哲學 2 — 你的瀏覽器，不是機器人農場

驅動的是你機器上的真實 Profile，不搞無頭指紋，不把密碼交到雲端 runner，降低封號風險。

### 哲學 3 — 一句人話，大於一套選擇器

每次運行重讀頁面語義，而非重放 selector，抗網站改版。代價是非確定性——官網直言「不會告訴你它從不失敗」。

### 哲學 4 — 排程是第一公民

核心交互是 Describe → Schedule → History → Notify，失敗即停、發通知、留日誌。

### 哲學 5 — 開放標準，不鎖模型

Chromium + MCP + OpenAI 相容端點。Free 強制自託管，倒逼升級；賣的是模型託管與用量。

---

## 四、詳細教程：7 步跑通首個自動員工

### Step 0 — 準備

Windows/macOS/Linux、4GB 起步；Free 先裝 Ollama，Pro/Ultra 無需本地模型；所有套餐需註冊帳號。

### Step 1 — 下載與匯入

`getaera.app/download` 下載 → Import from Chrome → 登入帳號完成設備綁定。

### Step 2 — 配置模型

- Free：Settings → Models → `http://localhost:11434`
- Pro/Ultra：選擇託管模型（GPT-4o / Claude 3.5 等）

### Step 3 — 跑通首任務（60 秒內）

側邊欄說一句每天都做且可驗證的話：「每天 9 點把 Stripe 昨日的 3 個數填進 Google Sheet」→ Run → 轉為排程。

### Step 4 — 設為排程

選頻率、通知、重試次數，查看 Run History 分步日誌。

### Step 5 — 連接 MCP

開啟 MCP Server → 到 Cursor/Claude Desktop 配置中加入 Aera → IDE 內可觸發瀏覽器自動化。

### Step 6 — 技能市場

安裝社群 Skill 或將自己的任務存為 Skill 發布。

### Step 7 — 運維排錯

失敗自停、讀日誌、敏感頁切本地模型、數天一更。

---

## 五、變現模式拆解

| 套餐 | 價格 | 年付 | 變現意圖 |
|---|---|---|---|
| **Free** | $0 | — | 獲客漏斗，讓你體驗「本地模型有多難用」 |
| **Pro** | $20/月 | $220/年 | 主力現金牛，錨定 $20 心理價位 |
| **Ultra** | $200/月 | $2200/年 | 鯨魚層，10 倍定價篩重度用戶 |

**5 個可複製玩法**：Free 自託管倒逼升級、$20+$200 分層、賣用量不賣席位、訂閱賣模型、MCP 生態未來抽成。

---

## 六、核心用戶分析：每用戶每月貢獻多少美金？

| 層級 | 人數 | 月貢獻/人 | 合計 | ROI |
|---|---|---|---|---|
| **Free** | ~1691 | $0 | $0 | 獲客池 |
| **Pro $20** | 8 | $20 | ~$160 | 省 1h/天 × $50 = $1500/月，ROI 75x |
| **Ultra $200** | 1 | $200 | ~$183 | 省 2h/天，ROI 15x，佔 58% MRR |

**推算**：MRR $343 / 9 = ARPU $38，8 Pro + 1 Ultra ≈ $360 吻合。若全 Pro 僅 $180，顯著偏低，故至少 1 鯨魚。

**LTV（24 個月）**：Pro $480 / Ultra $4,800；轉化率 0.5% 是最大瓶頸，提升至 2% 即 MRR $1,360。

---

## 七、觀點與結論：7 個洞察

1. 瀏覽器是最後護城河——真實登入態 Chromium 才能穩定過牆
2. 訂閱賣模型不賣瀏覽器——容器免費，智能收費
3. 誠實是最好的 GTM——把風險寫在定價前
4. 0.5% 轉化率是機會也是警報——需收窄免費視覺能力
5. MCP 是增長槓桿——嵌入工作流比買流量便宜
6. Ultra $200 是過濾器——用價格篩人
7. $15M 要價是情緒價——3644x ARR，非賣品信號

---

## 八、可複製的 6 條建議

1. 瀏覽器免費，模型收費 2. Free 必綁自託管 3. $20 錨點 + $200 鯨魚 4. 首任務 60 秒成功 5. 日誌即產品 6. MCP 優先於廣告

---

## 九、風險

轉化率停滯、模型成本波動、非確定性、無合規認證、單人風險、巨頭擠壓。

---

## 十、結語

Aera 是極早期但邏輯乾淨的樣本：1 個 Chromium + 1 個排程器 + 3 檔定價 + $343 MRR。值得抄的是：**容器免費、智能收費；Free 自託管；日誌可審計**。

---

> **產品連結**：[https://trustmrr.com/startup/aera-browser?ref=eric-kwok-b654e8](https://trustmrr.com/startup/aera-browser?ref=eric-kwok-b654e8)
>
> 數據來源：TrustMRR（Stripe 驗證）+ getaera.app 官網。推算項已標註。

*本報告基於 2026-08-26 快照，分析僅代表作者立場。*
