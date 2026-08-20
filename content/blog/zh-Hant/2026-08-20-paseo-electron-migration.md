---
title: "從 Tauri 到 Electron：Paseo 創辦人的血淚踩坑復盤"
date: "2026-08-20"
description: "2026年5月28日，Paseo創辦人Mo Boudra在部落格寫下了「我錯怪Electron了」。這篇博文詳細復盤了Paseo從Tauri遷移到Electron的全過程，揭示了技術選型中「憑感覺」決策的危害。本文深度解析Paseo項目、技術架構、遷移教訓和工程哲學。"
tags:
  - 技術選型
  - Electron
  - Tauri
  - 桌面應用
  - 開源
  - Paseo
categories:
  - 技術深度
source:
  aggregator: "比特財商"
  aggregator_url: "https://mp.weixin.qq.com/s/Q-SOuDzIX69B_KE4pIAwWlofqxUaRF4H7CkCksIl3VD0gyRIeDsQkZPPl3Ms0hV1"
  original:
    name: "比特財商"
    url: "https://mp.weixin.qq.com/s/Q-SOuDzIX69B_KE4pIAwWlofqxUaRF4H7CkCksIl3VD0gyRIeDsQkZPPl3Ms0hV1"
---

## 開篇：一位創辦人承認自己錯了

2026 年 5 月 28 日，Paseo 創辦人 **Mo Boudra** 在部落格裡寫下了一個讓技術圈頗感意外的文章標題：**"I was wrong about Electron"**（我錯怪 Electron 了）。

這並不是一句輕描淡寫的自我檢討。在那篇博文裡，Boudra 詳細復盤了 Paseo 桌面應用在技術選型上經歷的一次「換心手術」——將底層框架從 Tauri 遷移到 Electron 的全過程。

對於一個剛獲得 **14.4k GitHub Stars**、被社群廣泛關注的開源項目而言，這樣的坦誠反思極其難得。更難得的是，他沒有止步於「認錯」，而是把整個遷移決策鏈條、踩坑細節和心路歷程完整地攤開在了所有人面前。

**這篇文章，是一堂關於技術選型的公開課。**

---

## 一、Paseo 是什麼？

在深入技術細節之前，我們先回答一個基礎問題：**Paseo 究竟是什麼？**

Paseo 是一個**桌面級程式智慧體編排平台**，它的核心使命是讓你在**同一個介面**裡，調用來自不同廠商的 AI 程式助手——包括 **Claude Code、Copilot、Codex、OpenCode 和 Pi**。

換句話說，它不是又一個 AI 程式工具，而是一個**統一編排層**。無論你習慣用哪家的 Agent，都可以通過 Paseo 的同一套介面、同一套工作流來進行管理、切換和協作。

### 核心特性一覽

| 特性 | 說明 |
|---|---|
| **多智慧體統一入口** | 接入 Claude Code、Copilot、Codex、OpenCode、Pi |
| **本地優先運行** | 智慧體在你的本地機器上運行，完整訪問你的開發環境 |
| **跨設備同步** | iOS、Android、桌面端、Web、CLI 五端統一體驗 |
| **語音控制** | 支援語音輸入，直接「說話」下達任務 |
| **隱私零妥協** | 無遙測、無追蹤、無強制登入 |
| **端對端加密** | 跨設備配對使用加密傳輸 |
| **開源 AGPL-3.0** | 程式碼開放，社群驅動 |

### Paseo 的架構哲學

Paseo 的架構設計清晰地體現了一個核心理念：**你的程式碼和資料永遠留在你這裡**。

它通過一個運行在本地埠 `6767` 上的 **Node.js daemon** 來編排各個智慧體程序。所有客戶端（桌面端、移動端、Web、CLI）均通過 **WebSocket** 與這個 daemon 通訊。跨設備配對則通過一個**端對端加密的 relay 服務**實現。

這種架構帶來了幾個關鍵優勢：

1. **隱私天然保障**：程式碼不經過任何第三方伺服器
2. **效能出色**：daemon 與本地開發環境直接互動，無網路延遲
3. **擴展性強**：TypeScript SDK 允許任何人基於 Paseo 建構自己的整合

---

## 二、技術架構詳解：一個 daemon + 多個客戶端

### 2.1 Monorepo 結構

Paseo 採用 monorepo 管理，核心包如下：

```
packages/
├── server/    # Node.js daemon，智慧體程序編排、WebSocket API、MCP 伺服器
├── app/       # Expo 客戶端（iOS、Android、Web）
├── cli/       # paseo CLI 工具
├── desktop/   # Electron 桌面應用
├── relay/     # relay 傳輸層與加密模組
└── website/   # 官網與文件站點
```

### 2.2 Daemon 模式的工作原理

Paseo daemon 是整個系統的中樞神經。它負責：

- **智慧體生命週期管理**：啟動、停止、監控各個程式智慧體程序
- **WebSocket API**：為所有客戶端提供即時通訊介面
- **MCP（Model Context Protocol）伺服器**：與各大 AI 模型供應商的標準對接協定實現
- **跨程序協調**：在多個智慧體之間進行上下文傳遞和任務分發

啟動 daemon 只需要一行命令：

```bash
# Docker 部署
docker run -d --name paseo \
  -p 6767:6767 \
  -e PASEO_PASSWORD=change-me \
  -v "$PWD/paseo-home:/home/paseo" \
  -v "$PWD:/workspace" \
  ghcr.io/getpaseo/paseo:latest

# CLI 啟動（本地開發）
paseo daemon start
```

### 2.3 WebSocket 即時通訊

所有客戶端通過 WebSocket 連接到 `localhost:6767`，這意味著：

- 桌面客戶端可以即時看到智慧體的輸出流
- 移動端可以遠端監控任務進度
- CLI 工具可以嵌入到任何終端工作流中

```bash
# 通過 CLI 連接 daemon
paseo connect --agent claude-code

# 查看當前活躍的智慧體
paseo status
```

### 2.4 TypeScript SDK：無縫整合到你的項目

如果你想基於 Paseo 建構自己的工具或平台，可以使用官方提供的 `@getpaseo/client` SDK：

```typescript
import { createClient } from '@getpaseo/client';

const client = createClient({
  password: process.env.PASEO_PASSWORD,
  host: 'localhost',
  port: 6767,
});

// 連接到 daemon 並獲取活躍智慧體列表
const agents = await client.listAgents();
console.log('活躍智慧體:', agents);

// 向指定智慧體發送任務
await client.sendTask({
  agentId: 'claude-code',
  prompt: '優化當前項目的構建速度',
});
```

---

## 三、從 Tauri 遷移到 Electron：完整技術復盤

### 3.1 最初的選擇：為什麼是 Tauri？

在項目初期，Mo Boudra 和很多開發者一樣，對 Electron 持有偏見——**體積大、記憶體占用高、啟動慢**。他們選擇了 Tauri，理由聽起來非常合理：

- **Rust 後端**：效能優秀，記憶體占用低
- **小巧的二進制包**：Tauri 打包出來的應用體積遠小於 Electron
- **原生 webview**：以為能在各平台獲得「原生級」的效能表現

這些確實是 Tauri 的真實優勢。但問題在於，**理論優勢和實際落地之間，隔著整個工程現實。**

### 3.2 問題一：Linux 上的 WebKitGTK 噩夢

Tauri 在 Linux 上依賴系統自帶的 WebKitGTK 引擎，而非捆綁自己的瀏覽器運行時。

這帶來了三個層面的問題：

**（1）版本碎片化**
不同 Linux 發行版自帶的 WebKitGTK 版本差異巨大。Ubuntu 22.04 可能用著 WebKitGTK 4.1，而 Fedora 40 可能還在用 4.0。API 細微的差異足以讓同一個功能在兩個發行版上表現截然不同。

**（2）Wayland 相容性問題**
現代 Linux 桌面正在向 Wayland 過渡，但 WebKitGTK 在 Wayland 下的輸入法支援、硬體加速等仍存在已知問題。

**（3）真實存在的佈局差異**
同一個 CSS flexbox 佈局，在 macOS 的 WKWebView、Windows 的 WebView2 和 Linux 的 WebKitGTK 下渲染結果可能不一致。Boudra 坦言：「你花了兩天調試一個置中問題，結果發現它只在 Ubuntu 上出現。」

### 3.3 問題二：通知系統：看似簡單，實則坑深

桌面通知是一個看似微不足道、卻極其考驗平台適配能力的功能。

Paseo 需要支援：**點擊通知 → 聚焦應用窗口 → 跳轉到相關任務**。

這要求精確處理：

- 通知的點擊事件捕獲
- 應用窗口的啟動與焦點管理
- 跨平台行為一致性

Tauri 的通知插件提供了基礎能力，但**不支援桌面通知的點擊處理**。Boudra 嘗試了多個 Rust crates——沒有任何一個能可靠地在所有目標平台上提供完整的通知互動能力。

最終，他被迫為每個平台寫**平台特定的原生通知處理程式碼**。這對於一個追求跨平台一致性的項目來說，是一個巨大的諷刺——為了解決跨平台問題，引入了更多跨平台問題。

### 3.4 問題三：Daemon 複雜度：Tauri Sidecar 的真實代價

Paseo 的核心是一個 Node.js daemon。這在 Electron 生態裡幾乎是天然的選擇——Node.js 隨 Electron 預裝，無需額外配置。

但 Tauri 的方案是 **Sidecar**（邊車）模式：

- Sidecar 是一個**獨立編譯的二進制檔案**，針對特定平台和目標三元組（target triple）編譯
- 需要處理：跨平台打包、檔案路徑解析、程序啟動參數、許可權配置、版本升級
- 每次新增一個目標平台，都意味著 sidecar 的編譯矩陣擴大一倍

Boudra 的評價一針見血：**「我發現自己其實是在『用 Rust 重新實現一個 Electron 環境』——而且還不如 Electron 成熟。」**

### 3.5 遷移過程：痛苦但出乎意料地快

決定遷移之後，團隊用了一週時間完成了從 Tauri 到 Electron 的切換。

Boudra 特別提到，這個過程雖然需要大量重寫，但**比預期快得多**，原因在於：

1. **應用邏輯完全不需要改變**：所有的業務程式碼都在 JavaScript/TypeScript 層，遷移不影響這些
2. **Electron 工具鏈更成熟**：調試工具、熱重載、生態插件都比 Tauri 豐富很多
3. **跨平台一致性讓 QA 成本驟降**：不需要再為每個發行版單獨調試

遷移完成後的體驗改善是全方位的：

- **跨平台 UI 表現一致**，不再有「Ubuntu 上那個按鈕歪了」的問題
- **通知功能正常工作**，包括點擊處理
- **daemon 管理大幅簡化**，Node.js 運行時直接由 Electron 程序管理
- **整體感覺更輕快**，這可能是最令人意外的發現

### 3.6 遷移後的反思：Tauri 並不差，只是不適合

Boudra 在博文結尾特別強調：Tauri 本身並不是一個糟糕的選擇——它對於某些場景確實非常出色。他的失誤在於**沒有客觀評估場景需求**，而是憑「感覺」選擇了 Tauri。

> 「我做這個選擇，是因為我喜歡 Rust，或者是因為 Tauri 在 HN 上有很多熱度。但我沒有真正問自己：我的應用場景到底是什麼？」

這個反思比任何技術細節都更有價值。

---

## 四、設計哲學：從 Paseo 提煉出的工程方法論

### 4.1 技術選型要回答的三個問題

Paseo 的遷移經歷告訴我們，技術選型不能只問「這個技術好不好」，而要問：

**① 我的實際場景是什麼？**
Paseo 是一個多智慧體編排平台，需要：
- 穩定的跨平台 webview 渲染（三個平台都要完美一致）
- Node.js runtime（daemon 本質是 Node.js 應用）
- 複雜的通知和窗口管理

這些都是 Electron 的**核心能力**，而不是附加功能。對於這些需求，Electron 不是「湊合用」，而是「天生適配」。

**② 我的約束邊界在哪裡？**
如果應用二進制體積是硬性約束（比如必須小於 10MB），Tauri 可能是必選項。但如果只是「希望體積小一點」，就需要權衡為此付出的工程複雜度。

**③ 我能接受的維護成本是多少？**
Tauri 的 sidecar 模式、生態不成熟度、plugin 品質參差不齊——這些都是隱形的維護成本。Boudra 最終意識到，他在 Tauri 上花的額外精力，本質上是在「自己造輪子」來彌補 Tauri 的生態缺口。

### 4.2 本地優先不等於簡單

Paseo 選擇了本地 daemon 架構，這意味著必須自己處理：

- 程序生命週期管理
- WebSocket 長連接維護
- 跨平台路徑和許可權處理

這顯然比「把程式碼扔給第三方 API」複雜得多。但 Boudra 選擇了這條更難的路，因為**隱私和資料主權是不可妥協的**。

這體現了一種工程哲學：**有時候，更複雜的技術實現，是對更重要價值的守護。**

### 4.3 跨平台一致性是核心競爭力，而非裝飾品

很多框架都宣稱「跨平台」，但真正能做到 UI 一致、功能一致、體驗一致的少之又少。Paseo 在遷移過程中花大量時間解決 WebKitGTK 差異問題，恰恰說明了——**跨平台的一致性不是自然而然發生的，而是需要刻意投入的**。

桌面應用開發者在選擇框架時，應該把「目標平台的 webview 差異」列為必考項，而不是想當然地以為「寫一次，到處跑」。

---

## 五、Paseo 實戰教程

### 5.1 安裝 Paseo

#### 方式一：桌面應用（推薦新手）

訪問 [paseo.sh/download](https://paseo.sh/download)，下載對應平台的安裝包。

#### 方式二：CLI 工具

```bash
# 全域安裝 CLI
npm install -g @getpaseo/cli

# 驗證安裝
paseo --version

# 啟動 daemon
paseo daemon start

# 連接第一個智慧體
paseo connect --agent claude-code
```

#### 方式三：Docker 部署（適合伺服器或無頭環境）

```bash
docker run -d --name paseo \
  --restart unless-stopped \
  -p 6767:6767 \
  -e PASEO_PASSWORD=your-secure-password \
  -v "$PWD/paseo-home:/home/paseo" \
  -v "$PWD:/workspace" \
  ghcr.io/getpaseo/paseo:latest
```

> ⚠️ **安全提示**：務必修改 `PASEO_PASSWORD`，預設密碼在生產環境中極不安全。

### 5.2 桌面端使用指南

安裝完成後：

1. 打開 Paseo 桌面應用
2. 首次使用需要設定 daemon 連接密碼
3. 連接你的第一個智慧體 Provider（Claude Code / Copilot / Codex 等）
4. 在統一的介面中建立任務、監控進度、切換智慧體

Paseo 支援**語音輸入模式**，點擊介面中的麥克風圖標，可以直接用語音描述任務，特別適合在通勤或雙手不便時使用。

### 5.3 移動端使用

Paseo 同時支援 iOS 和 Android，通過 Expo 建構。下載對應 App，掃描桌面端的配對二維碼，即可遠端連接本地 daemon，實現跨設備任務管理。

### 5.4 進階：使用 Paseo Skills

Paseo 內置了三個強大的內建 Skill，用於多智慧體協作：

#### `/paseo-handoff` — 智慧體交接

當一個智慧體完成部分工作後，將上下文完整移交給另一個智慧體繼續處理：

```
/paseo-handoff --from claude-code --to opencode --reason "需要更強的程式碼重構能力"
```

#### `/paseo-advisor` — 顧問智慧體

引入一個專注於「審查和建議」的 advisor 智慧體，在不干擾主智慧體工作流的情況下，提供即時回饋：

```
/paseo-advisor enable --mode realtime
```

#### `/paseo-committee` — 多智慧體委員會

將多個智慧體組成委員會，通過投票或共識機制作決策：

```
/paseo-committee create --agents claude-code,copilot,opencode --task "架構評審"
```

### 5.5 TypeScript SDK 進階示例

建構一個自動化程式碼審查流水線：

```typescript
import { createClient } from '@getpaseo/client';

async function automatedCodeReview() {
  const client = createClient({
    password: process.env.PASEO_PASSWORD!,
    host: process.env.PASEO_HOST || 'localhost',
    port: 6767,
  });

  // 監聽智慧體輸出流
  client.on('agent:output', (event) => {
    console.log(`[${event.agentId}] ${event.type}: ${event.content}`);
  });

  // 啟動程式碼審查任務
  const task = await client.sendTask({
    agentId: 'claude-code',
    prompt: `
      請對 /workspace 目錄下的所有 TypeScript 檔案進行程式碼審查：
      1. 檢查類型安全性
      2. 識別潛在的空指標異常
      3. 提出重構建議
      輸出格式：JSON
    `,
    options: {
      timeout: 300000, // 5分鐘超時
      stream: true,
    },
  });

  console.log(`任務已提交，ID: ${task.id}`);
}

automatedCodeReview().catch(console.error);
```

---

## 六、總結：框架沒有最好，只有最合適

Paseo 的故事，最打動人心的不是技術本身，而是一個創辦人**敢於承認錯誤、公開復盤**的坦誠態度。

Boudra 沒有把鍋甩給 Tauri，也沒有事後諸葛亮地說「我早知道 Electron 更好」。他誠實地承認：**他是被技術本身的魅力（Rust、效能、小體積）所吸引，而不是被實際需求所驅動。**

這恰恰是技術選型中最常見的陷阱——**我們不是因為某個框架「更好」而選擇它，而是因為它讓我們感覺「更好」而選擇它。**

關於 Tauri vs Electron 的爭論，Paseo 給出了一個相當有說服力的答案：

- **Tauri 適合**：對包體積有嚴格限制、UI 互動簡單、不需要複雜原生整合的工具類應用
- **Electron 適合**：需要穩定跨平台 UI 表現、依賴 Node.js 生態、有複雜原生系統整合需求的應用

而一個優秀的工程師，應該根據**業務需求**而非**技術偏好**來回答這個問題。

---

**相關連結**

- Paseo 官網：[https://paseo.sh](https://paseo.sh)
- GitHub：[https://github.com/getpaseo/paseo](https://github.com/getpaseo/paseo)
- 官方文件：[https://docs.paseo.sh](https://docs.paseo.sh)
- Mo Boudra 部落格原文：[https://moboudra.com](https://moboudra.com)

---

*首發於微信公眾號「比特財商」。*
