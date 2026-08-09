---
title: Herdr — 編程智慧體的「棲息地」，讓 AI 代理永不掉線
description: 深度解析 Herdr 專案：一款讓 AI 編程代理永不掉線的終端工作區管理器，支援 Claude Code、Codex、Cursor 等主流代理，Rust 編寫、零 Electron、开源免费。
author: topdigg-web-miner
date: 2026-08-09
tags:
  - AI Agent
  - 終端工具
  - 開發環境
  - Rust
  - Herdr
categories:
  - AI工具
  - 開發效率
---

# Herdr — 編程智慧體的「棲息地」，讓 AI 代理永不掉線

> **一行說明**：Herdr 是一個後台終端伺服器，它能讓 Claude Code、Codex、Cursor 等 AI 編程代理在後台持續運行，即使你合上筆電、斷網、重啟電腦，代理依然在幹活，你隨時可以切回去繼續。

---

## 📌 專案速覽

| 專案資訊 | 內容 |
|---------|------|
| **專案名稱** | Herdr |
| **GitHub** | [herdrdev/herdr](https://github.com/herdrdev/herdr) |
| **Star 數** | 26,000+ ⭐ |
| **程式語言** | Rust（無 Electron，純二進制） |
| **支援平台** | macOS、Linux、Windows Beta |
| **開源協議** | Apache 2.0 |
| **安裝量** | 363,000+ 次 |

---

## 🎯 它解決了什麼問題？

想像一下這個場景：

你讓一個 AI 編程代理（ 比如 Claude Code）幫你寫一個星巴克點單程式。程式很大，需要 3 個小時才能寫完。

**沒有 Herdr 的時候：**
- 你必須开着電腦，不能合上屏幕
- 斷網了？程式停了
- 代理卡住了要問你問題，但你正好在外面？完蛋了
- 重啟電腦？一切重來

**有 Herdr 的時候：**
- 代理在你的「數位牧場」裡跑，你在不在都行
- 合上筆電 → 代理繼續跑
- 斷網 → 代理繼續跑
- 重啟電腦 → Herdr 自動恢復，代理接著幹
- 代理卡住了需要你 → Herdr 告訴你「哪個代理在等你」

---

## 🏗️ 核心概念（小學生都能懂）

Herdr 有幾個基本概念，用現實世界打比方：

### 1. 工作區（Workspace）= 一個大辦公室

一個工作區就是一個專案。比如你同時在做一個「星巴克點單系統」和「外賣配送系統」，可以開兩個工作區，互不干擾。

### 2. 標籤頁（Tab）= 辦公室裡的不同白板

一個工作區可以有多個標籤頁，比如：
- `agents` 標籤頁 → 放 AI 代理
- `logs` 標籤頁 → 放日誌
- `review` 標籤頁 → 放程式碼審查

### 3. 窗格（Pane）= 每個代理的「工位」

每個窗格就是一個真正的終端，裡面跑着一個 AI 代理。可以左右分屏，也可以上下分屏。

### 4. 代理（Agent）= 你僱的程式設計師

Herdr 能自動識別以下 AI 編程代理：

| 代理名稱 | 說明 |
|---------|------|
| Claude Code | Anthropic 官方出品 |
| Codex | OpenAI 出品 |
| Cursor Agent | Cursor IDE 的 AI 模式 |
| Pi / OMP | 編程代理 |
| OpenCode | 開源代理 |
| Grok CLI | xAI 出品 |
| GitHub Copilot CLI | GitHub 出品 |
| Kimi Code CLI | 月之暗面出品 |
| …… | 还有很多 |

### 5. 代理狀態 — 它在幹嘛？

Herdr 能自動判斷每個代理在做什麼：

| 狀態 | 意思 |
|------|------|
| `working` 🔵 | 正在努力寫程式碼 |
| `blocked` 🟡 | 遇到問題，需要你來回答 |
| `done` ✅ | 幹完了，等你看結果 |
| `idle` ⚪ | 閒著，或者在等什麼 |
| `unknown` ❓ | 看不出來在幹嘛 |

> 💡 **這就是 Herdr 最聰明的地方**：你不用一個個窗口去找哪個代理卡住了，側邊欄直接告訴你「專案 A 的代理在等你回答問題」。

---

## 🚀 詳細安裝教程

### 方法一：一鍵安裝（最簡單）

**macOS / Linux：**
```bash
curl -fsSL https://herdr.dev/install.sh | sh
```

**Windows（測試版）：**
```powershell
powershell -ExecutionPolicy Bypass -c "irm https://herdr.dev/install.ps1 | iex"
```

### 方法二：用 Homebrew 安裝

```bash
brew install herdr
```

### 方法三：用 mise 安裝

```bash
mise use -g herdr
```

### 方法四：用 Nix 安裝

```bash
nix run github:herdrdev/herdr/v0.x.y
```

### 方法五：手動下載

去 [GitHub Releases](https://github.com/herdrdev/herdr/releases) 頁面下載對應平台的二進制文件：

| 系統 | 下載文件 |
|------|---------|
| Linux x86_64 | `herdr-linux-x86_64` |
| Linux ARM64 | `herdr-linux-aarch64` |
| macOS Intel | `herdr-macos-x86_64` |
| macOS Apple Silicon | `herdr-macos-aarch64` |

下載後執行：
```bash
chmod +x herdr-linux-x86_64
mv herdr-linux-x86_64 ~/.local/bin/herdr
```

### ✅ 驗證安裝成功

```bash
herdr
```

看到 Herdr 介面就說明安裝成功了！

---

## 📖 快速上手教程

### 第一步：啟動 Herdr

在任意目錄運行：
```bash
herdr
```

Herdr 會自動啟動或連接到你之前的後台工作階段。

### 第二步：建立一個工作區

Herdr 第一次啟動會自動建立一個工作區。你也可以按 `ctrl+b c` 建立新標籤頁。

### 第三步：啟動一個 AI 代理

在窗格裡輸入你喜歡的代理命令，比如：

```bash
claude
```

或者：
```bash
codex
```

或者：
```bash
pi
```

Herdr 會自動識別它是一個 AI 代理，並在側邊欄顯示它的狀態。

### 第四步：滑鼠操作（完全可選）

Herdr 原生支援滑鼠：
- **點擊** 窗格/標籤頁/工作區來切換
- **拖曳** 分割線來調整大小
- **右鍵** 建立新窗格或標籤頁
- **選取文字** 直接複製（不需要按 Ctrl+C）

### 第五步：鍵盤操作

| 操作 | 按鍵 |
|------|------|
| 進入命令模式 | `ctrl+b` |
| 新建標籤頁 | `ctrl+b c` |
| 左右分屏 | `ctrl+b v` |
| 上下分屏 | `ctrl+b -` |
| 切換窗格 | `ctrl+b h/j/k/l` 或方向鍵 |
| 下一個/上一個標籤頁 | `ctrl+b n` / `ctrl+b p` |
| 工作區導航 | `ctrl+b w` |
| 斷開連接（代理繼續跑） | `ctrl+b q` |

> 💡 按 `ctrl+b ?` 可以查看所有快捷鍵。

### 第六步：斷開與恢復

**斷開連接**（代理繼續跑）：
- 按 `ctrl+b q`
- 或者直接關閉終端窗口

**恢復連接**：
```bash
herdr
```

Herdr 會自動恢復你之前的工作階段，所有代理都在原來的狀態。

### 完全停止

```bash
herdr server stop
```

這會停止所有代理和窗格。

---

## 🧠 設計哲學（Design Philosophy）

Herdr 的設計哲學非常清晰，可以總結為以下幾點：

### 1. 「代理原生」（Agent-Native）

Herdr 不只是「終端多路復用器」，它是**為 AI 代理設計的**。

- Herdr 的 CLI 和 Socket API 是同一個介面，代理可以通過它建立窗格、啟動其他代理、等待其他代理blocked
- 這不是 tmux 能做到的事情——tmux 只是終端復用器，不懂 AI 代理是什麼

> 簡單說：Herdr 是專門給 AI 代理住的「房子」，而 tmux 只是普通的「公寓」。

### 2. 「不搶風頭」（Non-Invasive）

Herdr **不包裝、不替換**你已經在用的代理工具：

- Claude Code 還是 Claude Code，原封不動
- Codex 還是 Codex，原封不動
- Herdr 只是「擁有」它們的終端，讓它們可以一直跑

這叫做 **「Ownership without Replacement」**（擁有但不替代）。

### 3. 「真終端」（Real Terminals）

Herdr 裡的每個窗格都是**真正的終端**：

- 不是模擬的，不是假的
- 代理在里面看到的和直接跑終端一模一樣
- 支援所有終端功能：ANSI 顏色，光標控制、OSC 序列等

### 4. 「零 Electron」（No Electron）

Herdr 使用 Rust 編寫，編譯成單一二進制文件：

- 沒有 Electron，沒有 Node.js 依賴
- 體積小、啟動快、記憶體佔用低
- 跑在你已經用的終端裡（iTerm2、Kitty、Alacritty、Windows Terminal……）

### 5. 「永遠在線」（Always Running）

Herdr 是一個**後台伺服器**：

- 客戶端可以隨時斷開、重新連接
- 伺服器和代理一直運行
- 筆電合蓋不斷網 → 代理繼續跑
- 這叫做 **「Sessions Survive」**（工作階段永生）

### 6. 「狀態聚合」（State Rollup）

Herdr 會把狀態向上聚合：

- 一個 `blocked` 的代理會讓它的窗格、標籤頁、工作區都顯示為 `blocked`
- 你不需要一個個窗口去找哪個代理卡住了
- 側邊欄一眼告訴你「專案 A 需要你回答問題」

### 7. 「遠程優先」（Remote-First）

Herdr 支援遠程連接：

- 通過 SSH 連接到遠程機器的 Herdr
- 在手機上通過 SSH 也能查看代理狀態
- `herdr --remote user@host` 一條命令搞定

### 8. 「開源且免費」（Open Source & Free）

- 代碼完全開源（Apache 2.0）
- 永遠免費（沒有付費牆）
- 社區插件生態：[herdr.dev/plugins](https://herdr.dev/plugins/)

---

## 📊 核心功能總結

### 功能對比表

| 功能 | tmux | screen | Herdr |
|------|------|--------|-------|
| 終端持久化 | ✅ | ✅ | ✅ |
| 多路復用 | ✅ | ✅ | ✅ |
| AI 代理識別 | ❌ | ❌ | ✅ |
| 代理狀態顯示 | ❌ | ❌ | ✅ |
| 狀態聚合 | ❌ | ❌ | ✅ |
| Socket API（代理驅動） | ❌ | ❌ | ✅ |
| 滑鼠原生支援 | 有限 | 有限 | ✅ |
| 零配置開箱即用 | ❌ | ❌ | ✅ |

---

## 🔌 高級功能

### 1. Socket API（給代理用的介面）

Herdr 提供了一個 Socket API，代理可以通過它：
- 建立新窗格
- 向其他窗格發送輸入
- 等待某個窗格真正 blocked（而不是盲目等待）
- 查詢代理狀態

這是 Herdr 獨有的能力，其他終端復用器都沒有。

### 2. 插件系統

Herdr 支援插件擴展：
- 可以安裝社區插件
- 可以自訂窗格和工作流程
- 插件市場：[herdr.dev/plugins](https://herdr.dev/plugins/)

### 3. Git 工作樹集成

Herdr 和 Git 工作樹深度集成：
- 可以直接從側邊欄建立 Git 工作樹
- 工作樹作為獨立工作區管理
- 不需要手動切換目錄

### 4. 遠程工作流程

**方式一：SSH 遠程連接**
```bash
herdr --remote user@your-server.com
```

**方式二：先 SSH 到伺服器，再運行 Herdr**
```bash
ssh user@your-server.com
herdr
```

**方式三：手機通過 SSH 查看狀態**（只能看，不能操作複雜任務）

### 5. 配置管理

Herdr 設定檔案在：
- **Linux/macOS**：`~/.config/herdr/config.toml`
- **Windows**：`%APPDATA%\herdr\config.toml`

可以配置：
- 快捷鍵（prefix 鍵、窗格切換等）
- 主題顏色
- 通知設置
- SSH 連接參數
- 插件設置

查看預設配置：
```bash
herdr --default-config
```

---

## 🗺️ 適用場景

### ✅ 非常適合的場景

1. **長時間運行的代碼任務**
   - 訓練大模型、數據處理、批量重構
   - 讓代理在後台跑，你去做別的事

2. **多代理並行工作**
   - 同時跑 3 個代理分別開發 3 個功能
   - 側邊欄一眼看出哪個在等你

3. **遠程伺服器開發**
   - 在伺服器上跑代理，本地通過 SSH 查看
   - 公司電腦跑代理，回家用筆電接著看

4. **需要中斷/恢復的工作**
   - 代理遇到問題需要你，但你正好要出門
   - 合上筆電，代理繼續思考，你回來繼續

### ❌ 不太適合的場景

1. **需要圖形介面的工作**（代理需要瀏覽器操作 UI）
2. **極短的任务**（幾秒鐘就能完成的任務不需要 Herdr）
3. **Windows 用戶**（Windows 版還是 Beta，可能不穩定）

---

## 💡 關鍵觀點和結論

### 觀點一：Herdr 是 AI 編程代理的「操作系統」

如果把 AI 代理比作「打工仔」，那麼 Herdr 就是「工位管理系統」：
- 打工仔（代理）可以在工位（窗格）裡工作
- 工位管理系統（Herdr）確保打工仔不會因為老闆（你）不在就停工
- 打工仔遇到問題，工位管理系統會通知你

### 觀點二：Herdr 不是 tmux 的替代品，而是進化

tmux 解決的是「終端持久化」的問題，Herdr 在這個基礎上增加了「AI 代理管理」的能力。

如果你只用 tmux 做終端復用，Herdr 也可以做，而且更好用。
如果你跑 AI 編程代理，Herdr 是唯一的選擇。

### 觀點三：狀態可見性是 Herdr 的核心價值

在一個有 5 個代理同時跑的專案裡，最煩人的事情是「我不知道哪個代理卡住了」。

Herdr 通過狀態聚合（blocked → pane → tab → workspace）徹底解決了這個問題。

### 觀點四：「Agent-Native」是關鍵差異化

Herdr 的 Socket API 讓代理可以互相通信、互相等待。這是其他工具都沒有的能力。

未來，當多代理協作成為主流時，Herdr 的價值會更加明顯。

### 觀點五：Rust 是正確的選擇

- 沒有 Electron 依賴 → 體積小、啟動快
- 單一二進制文件 → 安裝簡單
- 效能好 → 可以處理大量終端輸出

這是為伺服器端工具選擇的最務實的語言。

---

## 📝 小結

Herdr 是一個專門為 AI 編程代理設計的終端工作區管理器。它的核心價值是：

1. **讓代理永不掉線** — 即使你不在，代理也在跑
2. **讓代理狀態一目了然** — 側邊欄直接告訴你誰在幹嘛
3. **讓多代理協作成為可能** — Socket API 支援代理間通信
4. **零學習成本** — 不改變你已有的工作流程

> **如果你用 Claude Code、Codex、Cursor 等 AI 編程代理，Herdr 是你值得擁有的工具。** 它讓 AI 代理從「需要你盯著」變成「可以託管」。

---

## 🔗 相關連結

- **官網**：[https://herdr.dev](https://herdr.dev)
- **文檔**：[https://herdr.dev/docs/](https://herdr.dev/docs/)
- **GitHub**：[https://github.com/herdrdev/herdr](https://github.com/herdrdev/herdr)
- **插件市場**：[https://herdr.dev/plugins/](https://herdr.dev/plugins/)
- **安裝命令**：`curl -fsSL https://herdr.dev/install.sh | sh`
