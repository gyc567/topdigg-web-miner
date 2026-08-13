---
slug: oh-my-claudecode-analysis
title: "oh-my-claudecode 深度解析：Claude Code 多 Agent 編排神器（核心思想 + 項目說明 + 詳細教程 + 設計哲學）"
description: "深度解析 Yeachan-Heo/oh-my-claudecode（38.5k stars，MIT，TypeScript，v4.15.7）—— Claude Code 多 Agent 編排系統。核心思想：19 個專業 Agent（4 車道）+ 3 檔模型路由（haiku/sonnet/opus）+ 31 個 Skills + 5 階段 Team pipeline + Magic Keywords。設計哲學：零學習曲線、Teams-first 編排、智能路由、用完即走的 Skills 組合。"
date: "2026-08-12"
author: "TopDigg"
tags: ["oh-my-claudecode", "Claude Code", "Multi-Agent", "Orchestration", "TypeScript", "AI Agents", "Developer Tools", "SWE-bench"]
categories: ["Deep Dive"]
keywords: ["oh-my-claudecode", "Claude Code 多 Agent 編排", "多智能體", "編排系統", "TypeScript", "AI Agent", "開發者工具", "SWE-bench", "autopilot", "ralph", "ultrawork", "team orchestration", "Claude Code 插件"]
---

# oh-my-claudecode 深度解析：Claude Code 多 Agent 編排神器

> 核心思想：**別學 Claude Code，直接用 OMC。** oh-my-claudecode（簡稱 OMC）是一個為 Claude Code 打造的多 Agent 編排層，通過 19 個專業 Agent、3 檔模型路由、31 個 Skills 和 5 階段 Team Pipeline，讓人類工程師用自然語言驅動一支 AI 團隊。它不替換 Claude Code，而是疊加在其上——零學習曲線，現有工作流無縫接入。

## 一、項目說明：oh-my-claudecode 是什麼

### 1.1 一句話定位

**oh-my-claudecode（OMC）是一個多 Agent 編排系統，運行在 Claude Code 之上，用 Skills 和專業 Agent 替代手動配置和提示工程。** 口號是"Don't learn Claude Code. Just use OMC."——它把 Claude Code 從一個需要精心構造提示的單 Agent 工具，變成一個可以用自然語言驅動多 Agent 團隊的開發環境。

### 1.2 項目元資訊

| 欄位 | 值 |
|------|------|
| GitHub | [Yeachan-Heo/oh-my-claudecode](https://github.com/Yeachan-Heo/oh-my-claudecode) |
| Stars | 38,530 |
| Forks | 3,462 |
| 許可證 | MIT |
| 語言 | TypeScript |
| 最新版本 | 4.15.7（npm: oh-my-claude-sisyphus）|
| npm 包 | `oh-my-claude-sisyphus` |
| 創始人 | Yeachan Heo（[@Yeachan-Heo](https://github.com/Yeachan-Heo)）|
| 官網 | https://yeachan-heo.github.io/oh-my-claudecode-website |
| Discord | https://discord.gg/jq6jnSGABY |

### 1.3 核心功能總覽

**編排模式**（多種策略，覆蓋不同場景）：

| 模式 | 描述 | 適用場景 |
|------|------|----------|
| **Team（推薦）** | 5 階段流水線：`team-plan → team-prd → team-exec → team-verify → team-fix` | 共享任務列表的協調 Claude Agent |
| **omc team（CLI）** | tmux CLI workers：真實 `claude`/`codex`/`gemini` 分屏進程 | Codex/Gemini/Grok/Cursor CLI 任務 |
| **ccg** | 三模型顧問：`/ask codex` + `/ask antigravity`，Claude 綜合 | 需要 Codex + Antigravity 的後端+前端混合工作 |
| **Autopilot** | 自主執行（單一主導 Agent）| 最小儀式的端到端功能開發 |
| **Ultrawork** | 最大並行度（非 Team）| 突發並行修復/重構，Team 不需要時 |
| **Ralph** | 持久模式帶 verify/fix 循環 | 必須完整完成的任務（無靜默部分）|
| **UltraQA** | QA 循環直到測試/構建/lint/typecheck 通過 | 需要重複 diagnose/fix 循環的質量門 |

### 1.4 四大系統架構

OMC 建立在四個 interlocking 系統之上：

```
用戶輸入 → Hooks（生命週期事件檢測）→ Skills（行為注入）
       → Agents（專業任務執行）→ State（跨上下文重置的進度追蹤）
```

1. **Hooks**：檢測 Claude Code 生命週期事件，觸發對應 Skills
2. **Skills**：注入行為，修改編排器的工作方式
3. **Agents**：執行專業任務（19 個專職 Agent，4 車道）
4. **State**：跨上下文重置追蹤進度（`.omc/` 目錄存儲運行時狀態）

## 二、核心思想：Agent 體系、模型路由與 Skills 組合

### 2.1 19 個專業 Agent（四車道）

**建構/分析車道**：

| Agent | 預設模型 | 職責 |
|-------|---------|------|
| `explore` | haiku | 程式碼庫發現，檔案/symbol 映射 |
| `analyst` | opus | 需求分析，隱含約束發現 |
| `planner` | opus | 任務排序，執行計劃創建 |
| `architect` | opus | 系統設計，介面定義，權衡分析 |
| `debugger` | sonnet | 根因分析，構建錯誤修復 |
| `executor` | sonnet | 程式碼實現，重構 |
| `verifier` | sonnet | 完工驗證，測試充分性確認 |
| `tracer` | sonnet | 證據驅動的因果追蹤 |

**審查車道**：

| Agent | 預設模型 | 職責 |
|-------|---------|------|
| `security-reviewer` | sonnet | 安全漏洞，信任邊界，authn/authz 審查 |
| `code-reviewer` | opus | 全程式碼審查，API 合約，向後兼容性 |

**領域車道**：

| Agent | 預設模型 | 職責 |
|-------|---------|------|
| `test-engineer` | sonnet | 測試策略，覆蓋率，防 flaky 測試 |
| `designer` | sonnet | UI/UX 架構，交互設計 |
| `writer` | haiku | 文檔，遷移說明 |
| `qa-tester` | sonnet | 通過 tmux 的互動式 CLI/服務運行時驗證 |
| `scientist` | sonnet | 數據分析，統計研究 |
| `git-master` | sonnet | Git 操作，提交，變基，歷史管理 |
| `document-specialist` | sonnet | 外部文檔，API/SDK 參考查找 |
| `code-simplifier` | opus | 程式碼清晰化，簡化，可維護性改進 |

**協調車道**：

| Agent | 預設模型 | 職責 |
|-------|---------|------|
| `critic` | opus | 計劃/設計的差距分析，多角度審查 |

### 2.2 三檔模型路由

| 檔位 | 模型 | 特點 | 成本 |
|------|------|------|------|
| LOW | haiku | 快速、便宜 | 低 |
| MEDIUM | sonnet | 性能與成本平衡 | 中 |
| HIGH | opus | 最高推理質量 | 高 |

### 2.3 Skills 系統：行為注入的層次組合

**核心公式**：

```
[執行層 Skill] + [0-N 增強層] + [可選保證層]
```

**Skills 三層架構**：

```
GUARANTEE LAYER（可選）—— ralph：「驗證未完成前不能停止」
                    ↓
ENHANCEMENT LAYER（0-N 個）—— ultrawork（並行）/ git-master（提交）/ frontend-ui-ux
                    ↓
EXECUTION LAYER（主要 Skill）—— default（構建）/ orchestrate（協調）/ planner（規劃）
```

### 2.4 Magic Keywords：自然語言觸發 Skills

| Keyword | 觸發的 Skill | 效果 |
|---------|-------------|------|
| `ralph`/`don't stop`/`must complete` | `$ralph` | 持久循環，verifier 確認完成後才退出 |
| `autopilot`/`build me`/`I want a` | `$autopilot` | 自主執行流水線 |
| `ultrawork`/`ulw`/`parallel` | `$ultrawork` | 最大並行 Agent 編排 |
| `ralplan`/`consensus plan` | `$ralplan` | RALPLAN-DR 迭代共識規劃 |
| `ecomode`/`eco`/`budget` | `$ecomode` | 代幣高效模式 |

### 2.5 Team 模式：推薦的多 Agent 編排方案

**v4.1.7 起，Team 是規範的編排表面**：

```bash
/team 3:executor "fix all TypeScript errors"
```

**5 階段流水線**：

```
team-plan → team-prd → team-exec → team-verify → team-fix（循環）
```

## 三、詳細教程：從零安裝到首個任務

### 3.1 安裝（兩種方式）

**方式一：Marketplace/Plugin 安裝（推薦）**

注意：**逐行粘貼，不要同時粘貼兩行**：

```bash
# 第一步：添加 marketplace
/plugin marketplace add https://github.com/Yeachan-Heo/oh-my-claudecode

# 第二步：安裝插件
/plugin install oh-my-claudecode
```

**方式二：npm 全域安裝**

```bash
npm i -g oh-my-claude-sisyphus@latest
```

### 3.2 初始化設置

```bash
# 在 Claude Code / OMC 會話內
/setup
/omc-setup

# 或從終端
omc setup
```

### 3.3 基礎使用

**Autopilot（自主執行）**：

```bash
/autopilot "build a REST API for managing tasks"
```

**Team（推薦）**：

```bash
/team 3:executor "fix all TypeScript errors"
```

**Ralph（持久模式）**：

```bash
/ralph "refactor the authentication module"
```

**Ultrawork（最大並行）**：

```bash
/ultrawork "fix all TypeScript errors"
```

### 3.4 Deep Interview（Socratic 需求澄清）

```bash
/deep-interview "I want to build a task management app"
```

Deep Interview 使用 Socratic 追問來澄清思路，在寫任何代碼之前暴露隱含假設。

### 3.5 SWE-bench 基準測試

```bash
export ANTHROPIC_API_KEY=your_key_here
./setup.sh
./quick_test.sh
./run_full_comparison.sh
```

## 四、歸納總結：OMC 的核心觀點與結論

### 4.1 核心觀點

**觀點一：Claude Code 本身不是終點，編排層才是生產力槓桿。** OMC 的核心洞察是：把 Claude Code 看作一個可以編排的運行時，而不是一個需要手動優化的單一 Agent。

**觀點二：Skills 組合 > 固定 Agent 工作流。** `[Execution] + [0-N Enhancements] + [Optional Guarantee]` 公式動態組合，按需疊加，無需預定義。

**觀點三：Magic Keywords 把「學習曲線」變成「表達力」。** 用自然語言表達意圖（"build me a REST API" 觸發 Autopilot），工具自動推斷應該激活什麼 Skill。

**觀點四：Team 流水線是到目前為止最可靠的多 Agent 協作模式。** 5 階段流水線在結構化與靈活性之間取得最佳平衡。`team-fix` 循環確保驗證失敗後 Agent 能回到執行階段重新處理。

**觀點五：模型路由是成本控制的關鍵。** haiku/sonnet/opus 三層體系讓同樣 API 預算下可以處理更多任務。

**觀點六：持久化（Persistence）是質量保證的前提。** `ralph` 的設計哲學：Agent 不應該在第一次 pass 就宣稱完成，必須通過 verifier 的驗證。

**觀點七：零學習曲線不是降低能力，而是提升可發現性。** Magic Keywords（可發現性）+ Skills 層級（可組合性）= 零學習曲線的同時保留全部能力。

### 4.2 技術結論

**結論一**：多 Agent 編排系統的核心問題不是「有多少 Agent」，而是「誰決定用哪個 Agent」。三層路由（模型 + Agent + Skill）解決了這個問題。

**結論二**：Skills 系統是 Agent 編排的最佳抽象層次。比 Skill 更細則組合爆炸，比 Skill 更粗則失去靈活性。

**結論三**：Team Pipeline 的 verify 階段是整個流水線的質量錨點。`team-verify → team-fix → team-exec` 的循環是 OMC 質量保證的核心機制。

## 五、設計哲學：OMC 的工程哲學

### 5.1 零學習曲線（Zero Learning Curve）

「別學 Claude Code，直接用 OMC」——所有設計決策都服務於一個目標：**讓用戶用自然語言表達意圖，工具負責找到正確的執行路徑**。

### 5.2 Teams-First（團隊優先）

**v4.1.7 起，Team 是規範的編排表面**。這個決策背後的哲學是：結構化 > 自由碰撞，明確 > 隱含，可驗證 > 不可驗證。

### 5.3 智能路由（Intelligent Routing）

OMC 的路由發生在三個層次：
1. **模型路由**：haiku/sonnet/opus 根據任務複雜度選擇
2. **Agent 路由**：19 個專業 Agent 根據任務類型選擇
3. **Skill 路由**：Magic Keywords + 顯式調用決定行為注入

### 5.4 狀態持久化與可恢復性

OMC 將運行時狀態寫入 `.omc/` 目錄：`.omc/plans/`（規劃文檔）、`.omc/state/`（會話狀態）、`.omc/artifacts/`（生成的工件）。

`.omc/skills/` 下的 Skill 檔案可以被 commit 到 Git 用於團隊共享；其他 `.omc/` 內容在 `.gitignore` 中。

### 5.5 可觀測性（Observability）

- **HUD 狀態欄**：實時顯示編排指標
- **會話摘要**：`.omc/sessions/*.json`
- **重放日誌**：`.omc/state/agent-replay-*.jsonl`
- **摩擦報告**：`omc session friction report --since 24h`

---

**oh-my-claudecode 的核心洞察：當你把 Claude Code 看作一個可編程的運行時，而不是一個需要優化的單一 Agent 工具時，多 Agent 編排的可能性就打開了。**
