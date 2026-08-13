---
slug: swarmforge-analysis
title: "SwarmForge：基於tmux的多AI Agent編排平台"
description: "深入解析 SwarmForge（基於tmux的AI Agent編排平台）—— 透過工作流配置（two-pack/four-pack/six-pack）、Worktree隔離、Handoff協議和憲法結構，實現多個AI代理協同開發軟體專案。詳細涵蓋：專案架構、三種預設工作流、工作機制、配置驅動設計理念和使用範例。"
date: "2026-08-13"
author: "TopDigg"
tags: ["SwarmForge", "Multi-Agent", "tmux", "AI Agent", "Orchestration", "Worktree", "Handoff", "Developer Tools", "AI Agents"]
categories: ["Deep Dive"]
keywords: ["SwarmForge", "多智慧體", "tmux", "AI Agent編排", "Worktree隔離", "Handoff協議", "軟體工程", "自動化", "開發者工具", "AI協作", "four-pack", "six-pack"]
---

# SwarmForge：基於tmux的多AI Agent編排平台

> 核心思想：**讓多個AI代理像一支開發團隊一樣協同工作。** SwarmForge 是一個輕量級的多AI Agent編排平台，執行在本地tmux環境中，透過配置驅動的方式協調多個AI代理共同開發軟體專案。它不追求複雜的雲端服務或花俏的介面，而是專注於讓AI Agent在隔離的git worktree中高效協作，透過結構化的Handoff協議傳遞任務和上下文。這是一份完整解析 SwarmForge 專案架構、核心機制、三種預設工作流和使用指南。

## 一、專案介紹與概述

### 1.1 一句話定位

**SwarmForge 是一個基於tmux的多AI Agent編排平台，透過配置驅動的工作流讓多個AI代理在獨立的git worktree中協同開發軟體專案。**

它的核心設計理念是「配置即程式碼」——不依賴硬編碼的工作流程，而是透過 `swarmforge.conf` 設定檔和角色提示詞定義整個團隊的協作方式。每個角色（Agent）在自己的隔離環境中工作，透過結構化的Handoff檔案傳遞任務和上下文。

### 1.2 專案元資訊

| 欄位 | 值 |
|------|-----|
| GitHub | [unclebob/swarm-forge](https://github.com/unclebob/swarm-forge) |
| Stars | 待確認 |
| 授權 | 待確認 |
| 語言 | Shell + 設定檔 |
| 作者 | unclebob（fork by gyc567）|
| 依賴 | tmux, git |

### 1.3 核心價值主張

SwarmForge 的核心價值可以用三個詞概括：

- **輕量化執行**：執行在本地tmux環境中，無需複雜的雲端基礎設施
- **配置驅動**：所有工作流透過設定檔定義，而非硬編碼
- **隔離協作**：每個角色在獨立的git worktree中工作，避免相互干擾

### 1.4 與其他多Agent系統的區別

SwarmForge 與其他多Agent系統（如 CrewAI、AutoGen、LangChain Agents）的最大區別在於：

```
┌─────────────────────────────────────────────┐
│  其他多Agent系統                              │
│  - 複雜的訊息傳遞機制                         │
│  - 集中式協調器                              │
│  - 需要API金鑰和雲端服務                        │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│  SwarmForge                                  │
│  - 輕量級tmux會話                            │
│  - 分散式協作（透過Handoff檔案）              │
│  - 本地執行，無需外部依賴                     │
└─────────────────────────────────────────────┘
```

## 二、核心設計哲學

### 2.1 配置即程式碼

SwarmForge 最重要的設計原則是**配置驅動**。這體現在：

**宣言式工作流**
- 不需要編寫複雜的協調程式碼
- 在 `swarmforge.conf` 中宣言工作流和角色
- 系統根據設定自動建立tmux視窗和會話

**角色提示詞外部化**
- 每個角色的行為由 `roles/` 目錄下的提示詞定義
- 可以隨時修改角色行為，無需改動核心程式碼
- 支援為不同專案定制專屬角色

**憲法約束**
- 透過 `constitution.prompt` 定義團隊行為準則
- 包含工程規範（engineering.prompt）
- 定義Handoff協議（handoffs.prompt）
- 明確工作流規則（workflow.prompt）

### 2.2 隔離優先

**Worktree隔離**
- 每個角色在獨立的git worktree中工作
- 避免多個Agent同時修改同一程式碼庫
- 可以平行處理不同的任務分支

**會話隔離**
- 每個角色擁有獨立的tmux視窗
- 可以即時觀察每個Agent的狀態
- 不會因為一個Agent的問題影響其他Agent

### 2.3 Handoff協議

**結構化任務傳遞**
- Agent之間透過Handoff檔案傳遞任務
- 包含目前狀態、已完成工作和下一步計畫
- 確保任務在Agent之間平滑傳遞

**上下文保留**
- 每個Handoff包含足夠的上下文資訊
- 接收方可以立即接手工作
- 減少重複工作和狀態丟失

## 三、三種預設工作流詳解

### 3.1 two-pack：快速後端任務

**適用場景**：簡單到中等複雜度的後端任務

**角色配置**：
| 角色 | 功能 |
|------|------|
| coder | 負責程式碼編寫和實現 |
| cleaner | 負責程式碼清理和優化 |

**工作流程**：
```
使用者啟動 two-pack
    ↓
coder 在獨立worktree中編寫程式碼
    ↓
coder 完成，生成 Handoff 檔案
    ↓
cleaner 讀取 Handoff，清理程式碼
    ↓
cleaner 完成，輸出最終程式碼
```

**特點**：
- 最小配置，適合快速任務
- 兩個Agent專注於各自職責
- 適合小型專案或單一功能開發

### 3.2 four-pack：中等複雜度專案

**適用場景**：中等複雜度的全端專案

**角色配置**：
| 角色 | 功能 |
|------|------|
| specifier | 負責需求分析和規格定義 |
| coder | 負責程式碼編寫和實現 |
| refactorer | 負責程式碼重構和優化 |
| architect | 負責架構設計和決策 |

**工作流程**：
```
使用者啟動 four-pack
    ↓
specifier 分析需求，生成規格文檔
    ↓
architect 根據規格設計架構
    ↓
coder 根據架構編寫程式碼
    ↓
refactorer 重構和優化程式碼
    ↓
輸出最終程式碼庫
```

**特點**：
- 四種角色，覆蓋完整的開發週期
- 從需求到架構再到實現和優化
- 適合需要一定規劃的中小型專案

### 3.3 six-pack：大型專案

**適用場景**：大型複雜專案，需要嚴格的品質保證

**角色配置**：
| 角色 | 功能 |
|------|------|
| specifier | 負責需求分析和規格定義 |
| coder | 負責程式碼編寫和實現 |
| cleaner | 負責程式碼清理和優化 |
| architect | 負責架構設計和決策 |
| hardener | 負責安全加固和效能優化 |
| QA | 負責品質保證和測試 |

**工作流程**：
```
使用者啟動 six-pack
    ↓
specifier 分析需求，生成詳細規格
    ↓
architect 設計系統架構
    ↓
coder 實現功能程式碼
    ↓
cleaner 清理程式碼風格
    ↓
hardener 進行安全和效能加固
    ↓
QA 進行全面測試和品質檢查
    ↓
輸出生產級程式碼庫
```

**特點**：
- 六種角色，覆蓋完整的開發週期和品質保證
- 包含安全和效能加固環節
- 適合大型專案或需要高可靠性的場景

## 四、工作機制詳解

### 4.1 Worktree隔離

**Git Worktree 基礎**

Git Worktree 允許同一倉庫有多個工作目錄。SwarmForge 利用這個特性為每個角色建立獨立的工作目錄：

```bash
# 檢視目前worktree列表
git worktree list

# 為新角色建立worktree
git worktree add ../worktree-coder coder-branch
```

**Worktree 在 SwarmForge 中的應用**

```
主倉庫 (main)
├── worktree-specifier/  (specifier 的工作目錄)
├── worktree-coder/      (coder 的工作目錄)
├── worktree-architect/  (architect 的工作目錄)
└── ...
```

每個worktree對應不同的分支，確保：
- Agent可以在不影響主分支的情況下工作
- 可以同時在多個分支上進行不同任務
- 透過合併或PR將工作整合到主分支

### 4.2 tmux會話管理

**tmux 會話結構**

SwarmForge 使用tmux的層次結構來組織Agent會話：

```
tmux session: swarmforge
├── window: specifier
├── window: coder
├── window: refactorer
├── window: architect
├── window: cleaner
└── window: QA
```

**視窗管理**
- 每個Agent在獨立視窗中執行
- 可以隨時切換視窗觀察Agent狀態
- 支援分割畫面檢視多個Agent輸出

**會話控制**
```bash
# 列出所有會話
tmux list-sessions

# 連接到指定會話
tmux attach -t swarmforge

# 在視窗間切換
Ctrl+b w  # 列出所有視窗
Ctrl+b n  # 下一個視窗
Ctrl+b p  # 上一個視窗
```

### 4.3 Handoff協議

**Handoff 檔案結構**

Handoff檔案是一個結構化的文字檔案，包含：

```
=== HANDOFF ===
FROM: coder
TO: refactorer
TASK: 完成使用者認證模組
STATUS: in_progress

已完成:
- 使用者登入API
- 密碼加密儲存
- JWT Token產生

進行中:
- 使用者註冊API（完成80%）

待完成:
- 信箱驗證功能
- 密碼重設功能

上下文:
- 使用Express框架
- 資料庫使用PostgreSQL
- API前綴: /api/v1/auth
===
```

**Handoff 流程**

```
Agent A 工作
    ↓
Agent A 產生 Handoff 檔案
    ↓
Agent B 讀取 Handoff 檔案
    ↓
Agent B 繼續工作
```

**關鍵設計原則**
- **原子性**：每次Handoff包含完整的任務上下文
- **可追溯性**：記錄所有已完成和待完成的工作
- **獨立性**：接收方可以獨立於傳送方繼續工作

## 五、憲法結構

### 5.1 憲法入口：constitution.prompt

`constitution.prompt` 是整個憲法系統的入口檔案：

```
這是 SwarmForge 團隊的憲法。

團隊成員必須遵守以下條款：
1. 工程規範 (engineering.prompt)
2. Handoff協議 (handoffs.prompt)
3. 工作流規則 (workflow.prompt)

在執行任何任務之前，請先閱讀並理解憲法條款。
```

### 5.2 工程規範：constitution/articles/engineering.prompt

定義程式碼品質和工程標準：
- 程式碼風格規範
- 提交資訊格式
- PR/MR建立規範
- 程式碼審查標準

### 5.3 Handoff協議：constitution/articles/handoffs.prompt

定義Agent之間的任務傳遞規則：
- Handoff檔案格式
- 狀態轉換規則
- 錯誤處理機制

### 5.4 工作流規則：constitution/articles/workflow.prompt

定義工作流的執行規則：
- 各角色的職責定義
- 任務分配規則
- 完成標準

### 5.5 角色定義：roles/

`roles/` 目錄包含各角色的提示詞：

```
roles/
├── specifier.prompt      # 需求分析師
├── coder.prompt          # 程式設計師
├── cleaner.prompt         # 程式碼清理員
├── architect.prompt       # 架構師
├── hardener.prompt        # 安全加固專家
└── QA.prompt             # 品質保證工程師
```

每個角色提示詞包含：
- 角色職責描述
- 與其他角色的協作方式
- 憲法條款的具體應用

## 六、多後端支援

### 6.1 支援的後端

SwarmForge 支援多種AI後端：

| 後端 | 說明 |
|------|------|
| claude | Anthropic Claude |
| codex | OpenAI Codex |
| copilot | GitHub Copilot |
| grok | x.ai Grok |

### 6.2 配置方式

在 `swarmforge.conf` 中指定後端：

```ini
[backend]
default = claude

[backend.claude]
model = claude-sonnet-4
api_key = ${ANTHROPIC_API_KEY}

[backend.codex]
model = gpt-4
api_key = ${OPENAI_API_KEY}
```

### 6.3 後端切換

可以根據任務類型切換不同後端：

```bash
# 使用 claude 後端
SWARM_BACKEND=claude ./swarm

# 使用 codex 後端
SWARM_BACKEND=codex ./swarm
```

## 七、使用範例和最佳實踐

### 7.1 快速啟動

**選擇工作流並啟動**：

```bash
# 使用 four-pack 工作流
BRANCH=four-pack
curl -L "https://github.com/unclebob/swarm-forge/archive/refs/heads/${BRANCH}.tar.gz" | tar -xz --strip-components=1
./swarm
```

**完整啟動流程**：

```bash
# 1. 克隆或下載 SwarmForge
BRANCH=four-pack
curl -L "https://github.com/unclebob/swarm-forge/archive/refs/heads/${BRANCH}.tar.gz" | tar -xz --strip-components=1

# 2. 設定AI後端
export ANTHROPIC_API_KEY="your-api-key"

# 3. 設定檔（可選）
# 編輯 swarmforge.conf 設定工作流和角色

# 4. 啟動 swarm
./swarm
```

### 7.2 專案配置範例

建立一個新專案的設定：

```ini
# swarmforge.conf
[project]
name = my-awesome-project
description = 一個使用SwarmForge開發的專案

[workflow]
type = four-pack

[backend]
default = claude

[backend.claude]
model = claude-sonnet-4
max_tokens = 8192

[roles.specifier]
system_prompt = 你是一個需求分析師，專注於使用者友善的設計

[roles.coder]
system_prompt = 你是一個全端工程師，擅長TypeScript和Python
```

### 7.3 最佳實踐

**1. 選擇合適的工作流**
- 簡單任務用 two-pack
- 中等複雜度用 four-pack
- 大型專案用 six-pack

**2. 善用即時監控**
- 使用 `tmux attach` 連線會話
- 使用 `Ctrl+b w` 切換視窗
- 即時觀察每個Agent的輸出

**3. 正確使用Handoff**
- 確保每次Handoff包含足夠的上下文
- 在Handoff檔案中明確標注完成和待完成的工作
- 及時更新狀態，避免重複工作

**4. 定期同步程式碼**
- 定期將Agent的工作合併到主分支
- 使用PR/MR進行程式碼審查
- 保持worktree和主分支的同步

**5. 自訂角色**
- 根據專案需求修改角色提示詞
- 在 `roles/` 目錄建立新的角色定義
- 確保新角色遵循憲法條款

### 7.4 故障排除

**常見問題**：

1. **tmux會話無法啟動**
   - 檢查tmux是否已安裝：`tmux -V`
   - 檢查會話是否已存在：`tmux list-sessions`

2. **AI後端連線失敗**
   - 檢查API金鑰是否正確設定
   - 檢查網路連線
   - 驗證後端設定

3. **Handoff檔案未生效**
   - 檢查Handoff檔案路徑
   - 確保檔案格式正確
   - 驗證Agent是否正確讀取了Handoff

## 八、關鍵觀點總結

### 8.1 SwarmForge 的優勢

1. **輕量化設計**
   - 執行在本地tmux環境中
   - 無需複雜的雲端基礎設施
   - 資源消耗極低

2. **配置驅動**
   - 所有工作流可設定
   - 易於定制和擴展
   - 符合「設定即程式碼」原則

3. **隔離協作**
   - 每個角色獨立工作
   - 避免相互干擾
   - 支援平行工作

4. **結構化Handoff**
   - 任務傳遞清晰
   - 上下文保留完整
   - 可追溯性強

### 8.2 適用場景

- **小型團隊**：快速原型開發
- **個人開發者**：提升開發效率
- **大型專案**：複雜任務的分解協作
- **學習和實驗**：理解多Agent系統

### 8.3 局限性

- **本地執行限制**：不適合需要遠端協作的場景
- **tmux依賴**：需要一定的tmux使用經驗
- **AI後端限制**：需要有效的API金鑰

### 8.4 未來展望

SwarmForge 代表了多Agent系統的一種新思路——輕量、設定驅動、本地優先。隨著AI Agent技術的成熟，這種簡單而有效的編排方式可能會越來越受歡迎。

## 九、參考資源

- [SwarmForge GitHub 倉庫](https://github.com/unclebob/swarm-forge)
- [tmux 官方文檔](https://github.com/tmux/tmux)
- [Git Worktree 文檔](https://git-scm.com/docs/git-worktree)

---

*本文由 TopDigg 自動分析整理，關注 AI Agent 和開發者工具最新動態。*
