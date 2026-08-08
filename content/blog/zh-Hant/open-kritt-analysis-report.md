---
title: "open·kritt 深度解析：用 AI 智能體編排引擎發現真實程式碼漏洞"
description: "深度解析 open·kritt：一個開源的 AI 安全研究平台，通過工作流編排將複雜的安全審計分解為小而專注的任務，並行運行多個 AI 智能體，最終輸出可去重、可排序、可驗證的安全發現。平台核心思想來自真實漏洞賞金獵人經驗，已累計獲得超過 150 萬美元漏洞賞金。全文覆蓋：核心思想、專案架構、安裝配置、詳細教程、設計哲學、安全模型、觀點總結。"
date: "2026-08-08"
author: "TopDigg Research Team"
tags: ["open-kritt", "AI Security", "Vulnerability Detection", "Bug Bounty", "AI Agent", "Security Research", "Code Analysis"]
categories: ["Deep Dive"]
keywords: ["open-kritt", "AI 安全", "漏洞檢測", "漏洞賞金", "AI 智能體", "安全研究", "程式碼分析", "工作流編排", "模糊測試"]
---

# open·kritt 深度解析：用 AI 智能體編排引擎發現真實程式碼漏洞

> 核心思想：**open·kritt 是一個開源的 AI 安全研究平台，其核心理念是將複雜的安全審計分解為小而專注的任務，並行運行多個 AI 智能體，通過結構化工作流輸出可去重、可排序、可驗證的安全發現。** 不同於將整個程式碼庫丟給 AI 模型讓其「找漏洞」的粗放方式，open·kritt 強調任務分解與專注分析——給一個智能體分配一個小而明確的任務（如「分析某個檔案中的某個函數」），比讓它掃描整個程式碼庫更有效。這個理念來自真實的安全研究實踐：Kritt 團隊在漏洞賞金獵人名號 **Blockian** 下已累計獲得超過 **150 萬美元**的漏洞賞金，open·kritt 是他們內部工具的開源版本。

---

## 一、專案說明

### 1.1 它是什麼？

**open·kritt** 是一個**開源、自託管的 AI 安全研究平台**，用於編排 AI 智能體來發現真實程式碼漏洞。它的核心思路是：與其把整個程式碼庫丟給一個大模型「找漏洞」，不如將研究分解為**小的、定義明確的任務**，並行運行多個 AI 智能體，然後將結果合併為可驗證、可排序的發現。

該平台由 Kritt 團隊開發，團隊成員 Harel Rom（@harel-coffee）和 Gabriel Balko（@GabiCtrlZ）聯合所有並維護。平台採用 **AGPL-3.0** 開源許可證。

### 1.2 關鍵數據

- GitHub 倉庫：`https://github.com/Kritt-ai/open-kritt`
- 官網：`https://kritt.ai`
- 文件：`https://docs.kritt.ai`
- 許可證：**AGPL-3.0**
- 技術棧：前端（React/Vite）+ 後端（Express/Prisma/PostgreSQL）+ 引擎（Python/Codex 或 Claude Code）+ Docker
- CLI 工具：`./kritt`（倉庫內置，無需安裝）

### 1.3 專案結構

```
open-kritt/
├── backend/           # Express + Prisma REST API
├── frontend/          # React/Vite UI
├── engine/            # 掃描執行引擎（Python）
├── docs-site/         # Mintlify 文件站點
├── database/          # PostgreSQL 初始化
├── scripts/           # CLI 腳本
├── kritt              # 倉庫內置 CLI 工具
└── docs/              # 安全威脅模型等文件
```

---

## 二、核心功能

### 2.1 工作流（Workflows）

工作流是**可複用的藍圖**——由 prompt 步驟組成的樹形結構，引擎按深度順序運行每個步驟，並將輸出傳遞給下一步。

**關鍵特性：**
- **步驟（Steps）**：每個步驟是一個 prompt + 期望的 JSON 輸出格式
- **深度（Depth）**：步驟按深度組織，深度 0 是入口，深度越深任務越具體
- **多輸出（Multi-output）**：一個步驟可以產生多個結果，饋入下一深度的並行任務
- **結構化輸出**：每個步驟宣告輸出格式（string/number/boolean/array/object），所有鍵全局唯一

### 2.2 掃描（Scans）

掃描是將工作流作用於目標程式碼庫的執行單元：
- 支持**遠程倉庫**（GitHub owner/repo + commit_sha）和**本地倉庫**
- 支持依賴倉庫配置
- 支持可配置的 `repo_scope` 限定掃描範圍
- 支持重複運行（`repeat_runs`）進行累積分析

### 2.3 後腳本（Post-scripts）

後腳本是**每個發現專屬的後處理步驟**，在工作流完成、去重和排序後運行：
- 驗證發現
- 構建概念驗證（PoC）
- 撰寫報告
- 添加分級、標籤等元數據

### 2.4 嚴重性排序器（Severity Rankers）

嚴重性排序器是 **Markdown 規則**，指導模型如何對發現進行優先級排序。它們是可自定義的，可根據目標項目的漏洞分類標準進行調整。

---

## 三、核心思想與設計哲學

### 3.1 任務分解哲學：小的、專注的任務 > 大的、模糊的任務

open·kritt 的核心理念來自於一個關鍵洞察：**「如果你把 AI 指向整個程式碼庫讓它『找漏洞』，它通常做不到。但如果你把 AI 指向某個檔案中的某個函數並問一個專注的問題，它往往能行。」**

這個理念是 open·kritt 所有架構決策的基礎。它體現為：

1. **工作流分解**：將複雜的安全審計分解為深度遞增的步驟樹
2. **並行執行**：每個深度可以並行運行多個任務，充分利用上下文窗口
3. **上下文效率**：智能體的上下文窗口被用於真正的分析工作，而不是在龐大的程式碼庫中導航

### 3.2 內建工作流

open·kritt 預裝了兩個實用工作流：

#### 外部流分析（External Flow Analysis）

這是團隊在實際研究中使用過的工作流，而非教程示例。它遵循從生產入口點到具體安全敏感行為的外部控制輸入追蹤：

1. **枚舉入口點**：掃描程式碼庫，識別外部可達的入口點及其處理攻擊者控制輸入的處理器
2. **追蹤可達流**：對每個入口點，枚舉不同的生產路徑，包括驗證結果、授權邊界、狀態變更、外部調用和敏感接收器
3. **調查每個流**：將每個可達流交給下游智能體驗證。它只返回有支援的攻擊者路徑的具體漏洞，或無發現存根

> 這個分解策略節省上下文：入口點和流只映射一次，而每個最終智能體將上下文窗口花在一個具體路徑上。

#### Cosmos ABCI Panic Halt Review

針對基於 Go 的 Cosmos 應用，其中生產 ABCI 路徑中的 panic 可能導致共識停止：
1. **枚舉 ABCI 方法**：證明哪些 ABCI 方法和階段處理器被接入生產應用
2. **調查 panic 類型**：對每個可達方法展開四個專注審查——顯式 panic、算術 panic、nil 指針 panic、越界或類型 panic

### 3.3 發現 schema 的強制性

最深步驟（終端步驟）必須發出固定的**發現 schema**，確保每個發現一致且可比較：
- `explanation`、`file_path`、`line`、`malicious_input_example`、`summary`
- `trigger_flow`、`vulnerability_type`、`malicious_actor`
- 可選的 `exploitable`

這個強制約束確保所有發現可以被統一處理、去重和排序。

### 3.4 自託管優先

open·kritt 明確選擇**自託管**作為默認和推薦部署方式：
- 用戶擁有自己的基礎設施、數據和憑證
- 支持 Codex 登錄（推薦）、OpenAI API Key、Anthropic API Key 或 OpenRouter
- 後端默認不包含應用層認證，需要用戶自行在網絡層添加認證

---

## 四、詳細安裝配置教程

### 4.1 前置要求

- Git
- Docker Desktop 或 Docker Engine + Docker Compose 插件
- Node.js 20 或更高版本（僅用於 CLI）
- 模型訪問憑證（Codex 登錄推薦，或 API Key）

### 4.2 快速安裝

```bash
# 1. 克隆倉庫
git clone https://github.com/Kritt-ai/open-kritt && cd open-kritt

# 2. 運行互動式 CLI 配置
./kritt

# 3. 啟動完整堆疊
./kritt start
```

安裝後存取 http://localhost:5173 打開前端介面。

### 4.3 模型訪問配置

| 選項 | 說明 |
|------|------|
| **Codex 登錄**（推薦） | 使用符合條件的 ChatGPT/Codex 訂閱的引導式設備流存取 |
| `OPENAI_API_KEY` | 使用 OpenAI Platform API Key + Codex harness |
| `ANTHROPIC_API_KEY` | 使用 Claude Code + Anthropic API 計費 |
| `OPENROUTER_API_KEY` | 通過 OpenRouter 路由相容模型 |

`GITHUB_TOKEN` 是可選的，僅在需要克隆私有 GitHub 倉庫或其依賴時需要。

### 4.4 手動 Docker 配置

```bash
# 複製環境變量模板
cp .env.example .env
chmod 600 .env

# 在 .env 中設置一個 Provider 憑證：
# OPENAI_API_KEY, CODEX_API_KEY, ANTHROPIC_API_KEY, 或 OPENROUTER_API_KEY

# 創建必要目錄
mkdir -p .data/codex
chmod 700 .data/codex

# 啟動
docker compose up --build
```

### 4.5 載入示例數據

```bash
docker compose exec backend npm run seed
```

示例數據是附加的、冪等的，會保留現有數據。

---

## 五、第一次掃描完整教程

### 5.1 建立工作流

1. 打開 **Workflows → New workflow**
2. 選擇 **Blank workflow**，命名並添加描述
3. 添加步驟：

**深度 0 - 枚舉（Entry Point）**
- 名稱：`Enumerate Entrypoints`
- 內容：識別這個程式碼庫中所有外部可達的入口點（HTTP 路由、API 端點、用戶輸入處理函數）
- 輸出格式：`endpoints` (array)
- 勾選 **Multi-output**

**深度 1 - 分析（Analysis）**
- 名稱：`Analyze Endpoint`
- 內容：分析入口點 `{{endpoint}}`，識別可能的注入點、數據流和安全敏感操作
- 輸出格式：`findings` (array)，每個發現包含 `vulnerability_type`、`file_path`、`line` 等
- 引用深度 0 的鍵：`{{endpoint}}`

**深度 2 - 終端（Terminal）**
- 名稱：`Document Finding`
- 內容：詳細記錄發現的漏洞，提供攻擊路徑和概念驗證
- 輸出格式：必須包含發現 schema 的所有必需鍵

### 5.2 建立後腳本

1. 打開 **Post-scripts → New post-script**
2. 選擇 **Blank post-script**
3. 內容示例：

```
評估發現 "{{summary}}" - 一個位於 {{file_path}}:{{line}} 的 {{vulnerability_type}} 漏洞。

返回：
- severity (string): CRITICAL, HIGH, MEDIUM, 或 LOW
- confidence (string): HIGH, MEDIUM, 或 LOW
- recommendation (string): 修復建議
```

### 5.3 建立嚴重性排序器

1. 打開 **Severity Rankers → New ranker**
2. 編寫 Markdown 規則，定義漏洞類型和上下文如何映射到嚴重性等級

### 5.4 運行掃描

1. 打開 **Scans → New scan**
2. 選擇工作流
3. 設置目標：遠程（GitHub owner/repo）或本地
4. 選擇模型、提供者和 harness
5. 附加後腳本和排序器
6. 提交啟動

### 5.5 查看結果

掃描完成後，打開任何發現查看完整報告、概念驗證和後腳本輸出。

---

## 六、安全模型與威脅分析

### 6.1 信任邊界

| 組件 | 角色 | 信任級別 |
|------|------|---------|
| 前端 | UI（React/Vite） | 操作員面向 |
| 後端 | REST API + Postgres（Express/Prisma） | 操作員面向，**默認無認證** |
| 資料庫 | PostgreSQL — 工作流、掃描、發現 | 信任存儲 |
| 引擎 | 認領掃描、檢出倉庫、運行 harness | **分析不受信任的代碼和 prompt** |
| executor-view | 唯讀視圖 | 操作員面向 |

### 6.2 關鍵威脅與環緩

#### 1. 不受信任的代碼和 Prompt 注入

引擎分析攻擊者控制的代碼，倉庫可能包含旨在操縱智能體的內容（prompt 注入）。

**環緩措施：**
- 每個啟用工具的作業在一次性容器中運行
- 容器有可寫的每次作業檢出目錄和複製的作業主目錄
- 作業不掛載 Docker socket、資料庫、專案 `.env` 或其他作業
- Harness 輸出是模式約束的 JSON
- 草稿生成調用停用模型工具、用戶規則/設置和會話持久化

#### 2. 秘鑰洩露

被入侵/注入的智能體可能嘗試讀取憑證或發送數據。

**環緩措施：**
- 秘鑰保存在 `.env` 和 provider 登錄/憑證存儲中（均 gitignored）
- 優先使用**範圍窄、長期**的 `GITHUB_TOKEN`（唯讀，僅需掃描的倉庫）
- 定期輪換 provider 密鑰
- 掃描運行器**默認有直接出站互聯網存取**（用於智能體研究、安裝工具和獲取依賴）

#### 3. 數據外流到模型提供商

掃描默認將代碼發送到外部端點。

**環緩措施：**
- 掃描敏感代碼前了解數據去向
- 選擇數據處理方式與代碼敏感性相匹配的模型端點
- 審查供應商的數據保留條款

#### 4. API 無認證暴露

`/api/*` **默認無認證**。

**環緩措施：**
- 不要綁定到公共介面
- 在後端 API 和 UI 前放置自己的認證/授權代理
- 在代理層應用認證、網絡控制和速率限制

### 6.3 安全部署檢查清單

- [ ] 在**專用 VM 或 Docker 主機**上運行完整堆疊
- [ ] 如果直接互聯網存取不符合策略，添加主機級出口控制
- [ ] 在後端 API 和 UI 前**放置認證**
- [ ] 使用**最小、短期**的 `GITHUB_TOKEN`；輪換 provider 密鑰
- [ ] 選擇**數據處理**與代碼敏感性相匹配的模型端點
- [ ] 保持 `.env` 和 `.data/` 憑證存儲私有；永遠不要提交它們

---

## 七、觀點與結論總結

### 7.1 核心觀點

**觀點一：任務分解是 AI 安全研究的關鍵**

open·kritt 最重要的洞察是，將複雜的安全審計分解為小的、專注的任務，比嘗試用一個大模型解決整個問題要有效得多。這與人類安全研究員的實際工作方式一致——專家不會同時審視整個程式碼庫，他們會關注特定的入口點、數據流和函數。

**觀點二：結構化輸出強制發現質量**

要求每個終端步驟發出固定的發現 schema（包含必需鍵），確保所有發現可以被統一處理、去重和排序。這是 AI 輸出品質控制的一個重要實踐。

**觀點三：自託管是信任的基礎**

open·kritt 選擇自託管作為默認部署方式，反映了對程式碼安全的深刻理解——用戶需要控制他們的數據、憑證和基礎設施。這不是功能缺失，而是有意識的設計決策。

**觀點四：真實漏洞賞金經驗驅動產品設計**

open·kritt 不是理論專案。它來自實際的安全研究，團隊成員在 Blockian 名下已獲得超過 150 萬美元的漏洞賞金。內建的工作流反映了真實的安全研究實踐，而非教程示例。

**觀點五：安全與功能的平衡**

open·kritt 的設計在安全性和功能性之間取得平衡——智能體需要互聯網存取來安裝工具和研究目標，但平台提供了隔離和監控機制。這是處理不受信任代碼的實際必要。

### 7.2 適用場景

- **安全研究人員**：將 AI 整合到研究流程中，而不放棄對 prompt、數據或模型的控制
- **安全意識開發者**：獲取 AI 幫助編寫和審計安全代碼
- **漏洞賞金獵人**：系統化漏洞發現流程，提高效率
- **安全團隊**：對內部程式碼庫進行持續安全審計

### 7.3 局限性

- 默認無應用層認證，需要用戶自行添加
- 依賴於外部模型提供商，存在數據外流風險
- 需要 Docker 基礎設施，對某些用戶可能增加複雜度
- 掃描不受信任的代碼需要專用隔離環境

### 7.4 總結

open·kritt 是一個將 AI 智能體編排應用於安全研究的成熟平台。它的核心價值在於：
1. **任務分解方法論**：將複雜審計變為可管理的專注任務
2. **真實世界驗證**：來自實際漏洞賞金經驗
3. **自託管控制**：用戶擁有數據和基礎設施
4. **結構化發現輸出**：可驗證、可排序、可操作的結果

對於認真對待程式碼安全的團隊和個人，open·kritt 提供了一個既實用又有原則的解決方案。它的設計哲學——專注的任務分解、結構化的輸出和自託管控制——代表了 AI 輔助安全研究的最佳實踐。

---

## 八、參考資料

- 專案倉庫：https://github.com/Kritt-ai/open-kritt
- 官方文件：https://docs.kritt.ai
- 官網：https://kritt.ai
- 研究論文：https://kritt.ai/open-kritt-launch
- Discord 社區：https://discord.gg/kritt
- X (Twitter)：https://x.com/Kritt_AI
- 威脅模型文件：https://github.com/Kritt-ai/open-kritt/blob/main/docs/threat-model.md
- 漏洞賞金主頁（Blockian）：https://immunefi.com/profile/Blockian/
