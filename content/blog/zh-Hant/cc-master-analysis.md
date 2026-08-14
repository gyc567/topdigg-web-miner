---
slug: cc-master-analysis
title: "cc-master 深度解析：把任意編碼 Agent 會話變成長期專案負責人（專案說明 + 快速上手教程 + 系統架構 + 設計哲學）"
description: "以 nemori-ai/cc-master（開源專案，TypeScript，PolyForm Noncommercial 1.0.0 協議）為藍本，完整解析'把編碼 Agent 會話變成長期專案負責人（a project lead for long-running work）'。核心思想：cc-master 把 Claude Code、Codex、Cursor、kimi-code 中任何一個受支援的編碼 Agent 會話變成'專案負責人'——你帶想法、做少數真正需要你的決策；它負責拆解大目標、並行排程獨立子任務、追蹤進度與配額，並對照顯式目標驗收結果。Board（看板）能跨上下文重置與會話交接存活，工作不依賴某一次對話的記憶。安裝：curl 一行命令安裝 ccm 引擎 + 外掛；外掛為每個 harness 生成原生介面卡（Claude Code 斜槓命令 /cc-master:as-master-orchestrator、Codex $cc-master-as-master-orchestrator、Cursor /as-master-orchestrator、kimi-code cc-master:as-master-orchestrator）。系統架構：三層產品模型（per-harness 外掛適配層 → ccm CLI + @ccm/engine 引擎 → ccm web-viewer 只讀檢視）；Board v2 JSON 資料模型（窄腰設計）；8 個分散式 Skill（master-orchestrator-guide / authoring-workflows / using-ccm / slicing-goals-into-dags / dev-as-ml-loop / engineering-with-craft / pacing-and-estimation / distilling-lessons-into-assets）；O/T1/T2/T3 統一模型分配；7 類 dormant-until-armed Hooks；配額姿態 + 蒙特卡洛交付預測；跨 harness 的 worker 派發與 Agent Registry。設計哲學：'指揮家從不親自演奏'（協調者不親自做單元工作）、注意力再分配（把注意力重新分配到真正值得花的地方）、六個憲章目標、ship-anywhere（hooks 只用 bash + node/JS）、窄腰原則（只有少量固定 board 欄位被 hooks 依賴）、雙版本線解耦（外掛 vX.Y.Z 與 ccm ccm-vX.Y.Z 獨立發版）。明確邊界：這不是'許個願 AI 全包'——品味、設計、方向等只有你能做的決策仍然屬於你；十分鐘能改完的一兩行修復也不值得請'專案負責人'。"
date: "2026-08-11"
author: "TopDigg"
tags: ["cc-master", "Claude Code", "Codex", "Cursor", "kimi-code", "Agent Orchestration", "AI Agent", "Long-horizon", "Task DAG", "Monte Carlo", "Project Lead", "DevTools", "Agent Plugin"]
categories: ["Deep Dive"]
keywords: ["cc-master", "Claude Code", "Codex", "Cursor", "kimi-code", "Agent 編排", "Orchestration", "長期任務", "Long-running", "Board", "DAG", "O/T1/T2/T3", "模型分配", "設計哲學", "nemori-ai", "配額", "蒙特卡洛", "Worker", "Agent Registry"]
---

# cc-master 深度解析：把任意編碼 Agent 會話變成長期專案負責人

> 核心思想：**cc-master 把 Claude Code、Codex、Cursor、kimi-code 中任何一個受支援的編碼 Agent 會話，變成一個"長期專案負責人"（a project lead for long-running work）**。你帶來想法，做那少數幾個真正需要你的決策；它幫你拆解工作、並行執行獨立部分、追蹤進度與配額，並對照顯式目標驗收結果。**Board 能跨上下文重置與會話交接存活**，工作不依賴某一次對話的記憶——這是它與"單次對話裡的 Agent"最本質的區別。

## 一、專案說明

### 1.1 它是什麼？

cc-master 是 nemori-ai 開源的 **Agent 編排框架**（TypeScript 編寫），目標是把"單個編碼 Agent 會話"升級成"能扛住幾天、多執行緒並行、跨會話存活"的**專案負責人**。

官方一句話定位：

> cc-master turns a supported coding-agent session into a project lead for long-running work. You bring the idea and make the handful of calls that truly need you; it helps break the work down, run independent pieces in parallel, track progress and quota, and verify the result against an explicit goal. The board survives context resets and session handoffs, so the work can continue without relying on one conversation's memory.

（cc-master 把受支援的編碼 Agent 會話變成長期工作的專案負責人。你帶來想法，做少數幾個真正需要你的決策；它幫你拆解工作、並行執行獨立部分、追蹤進度與配額，並對照顯式目標驗收結果。看板能跨上下文重置與會話交接存活，工作可以繼續，而不依賴某一次對話的記憶。）

**一句話總結**：cc-master 在 AI 輔助編碼時代，把人類注意力重新分配到真正值得花的地方——拆解、排程、進度與配額記賬這些髒活交給"專案負責人"，你只做方向與重大決策。

### 1.2 專案元資訊

| 欄位 | 值 |
|------|-----|
| 倉庫 | https://github.com/nemori-ai/cc-master |
| Stars | 8 |
| License | PolyForm Noncommercial 1.0.0（原始碼可用，僅限非商業使用） |
| 語言 | TypeScript |
| 最近推送 | 2026-08-07 |
| Topics | `agent-plugin` `agent-skill` `claude-code` `claude-plugin` `dynamic-workflow` `orchestration` |
| 中文文件 | README_zh.md（自帶中文 README） |

### 1.3 它不是什麼（重要邊界）

> 但請別誤會——這**不是**"許個願，AI 全都包了"。品味、設計、方向——只有你能做的決策**仍然屬於你**；它從你盤子裡拿走的，只是那些本該把你埋掉的拆解、排程、進度與記賬。

**什麼時候不該用 cc-master**：

> 一兩行、十分鐘就能改完的修復？直接改就行——別請"專案負責人"，那是殺雞用牛刀，只會更慢。**它是為那種一個人盯不過來、要跑好幾天、同時開很多執行緒的目標準備的。工作越大、越亂、越長，越值得用。**

### 1.4 為誰而做（三種目標使用者）

| 使用者畫像 | 痛點 | cc-master 提供的價值 |
|----------|------|---------------------|
| 🚀 有想法但不懂工程的你 | 能說清想要什麼，缺一個**可靠的專案負責人** | 幫你把想法拆成可執行任務、盯進度、驗收 |
| 🔧 不想當"經理"的工程師 | 管理事務佔用了寫程式碼的時間 | 把管理拿下來，讓你留在手藝裡 |
| 🧭 帶團隊的負責人 | 想當"十個自己" | 它扛起繁瑣排程，你定方向、做重大決策 |

## 二、核心思想

### 2.1 注意力再分配（Attention Reallocation）

> At bottom it does one thing: in the age of AI-assisted coding, it **reallocates your attention to where it's actually worth spending**.

歸根結底它只做一件事：在 AI 輔助編碼的時代，**把你的注意力重新分配到真正值得花的地方**。人類注意力是稀缺資源；與其盯著每個 Agent 的輸出、維護每一條進度，不如把注意力集中在"只有你能做的判斷"上。

### 2.2 指揮家從不親自演奏

> The conductor never plays an instrument.

這是 cc-master 最核心的設計紅線：**協調者負責協調，絕不親自下場做單元工作**。任何把主線推向"親自實現"或"親自審查"的改動，方向都是錯的。這一原則貫穿 skill 設計、hook 設計與 board 狀態機。

### 2.3 六個憲章目標（Charter Goals）

專案憲章列出的六個目標（部分仍在演進中）：

1. **非同步並行多執行緒推進**，目標完整交付
2. **控制 token 消耗節奏**（配額感知）
3. **掌握自主決策與人機協同的邊界**（哪些決策該問人）
4. **目標拆解、管理、更新、規劃**
5. **在合理資源消耗內最大化效率的排程編排**
6. **根據複雜度 / 難度 / 時長選擇合適的模型**（O/T1/T2/T3）

### 2.4 與"全自動 Agent"的本質區別

- **不是**"一個 prompt 全自動跑完"——它引入**顯式 Goal Contract（目標契約）**與**驗收門**，結果必須對照目標逐條驗證。
- **不是**單次對話——**Board 持久化到磁碟**（`~/.cc_master/boards/*.board.json`），上下文重置、會話交接後依然存活。
- **不是**所有工作都該用——它有明確的"何時不該用"邊界（小修復直接做，別請專案負責人）。

## 三、詳細教程

### 3.1 硬性前置條件

| 依賴 | 要求 |
|------|------|
| Node.js | **22+**（所有模式必需，包括離線/鎖版本） |
| unzip | 解壓外掛與引擎 |
| SHA256 工具 | `sha256sum` / `shasum` / `openssl` 任一 |
| 網路工具 | `curl` 或 `wget`（線上安裝需要） |

### 3.2 一鍵安裝（引擎 ccm + 外掛一起裝）

```bash
# 安裝 ccm 引擎 + 外掛（預設自動探測 harness）
curl -fsSL https://raw.githubusercontent.com/nemori-ai/cc-master/main/install.sh | bash
```

### 3.3 安裝選項（鎖版本 / 指定 harness）

```bash
# 同時鎖定引擎與外掛版本（兩個 flag 相互獨立、均可選）
curl -fsSL https://raw.githubusercontent.com/nemori-ai/cc-master/main/install.sh | bash -s -- \
  --ccm-version ccm-v0.23.0 --plugin-version v0.22.0

# 只鎖引擎版本，外掛用最新
curl -fsSL https://raw.githubusercontent.com/nemori-ai/cc-master/main/install.sh | bash -s -- --ccm-version ccm-v0.23.0

# 指定目標 harness
curl -fsSL https://raw.githubusercontent.com/nemori-ai/cc-master/main/install.sh | bash -s -- --harness claude-code
curl -fsSL https://raw.githubusercontent.com/nemori-ai/cc-master/main/install.sh | bash -s -- --harness cursor
curl -fsSL https://raw.githubusercontent.com/nemori-ai/cc-master/main/install.sh | bash -s -- --harness kimi-code

# 全部 harness 都裝
curl -fsSL https://raw.githubusercontent.com/nemori-ai/cc-master/main/install.sh | bash -s -- --all-harnesses
```

### 3.4 關鍵環境變數

| 變數 | 預設值 | 用途 |
|------|--------|------|
| `CC_MASTER_HOME` | `$HOME/.cc_master` | 執行時狀態根目錄（boards、Goal Briefs、賬戶註冊、配額 sidecar） |
| `PREFIX` | `$HOME/.local/bin` | `ccm` 二進位制安裝位置 |
| `CC_MASTER_PLUGIN_DIR` | `$HOME/.local/share/cc-master` | 外掛暫存根目錄 |
| `CC_MASTER_INSTALL_LOCAL` | _空_ | 設為本地目錄路徑 → 從本地資產離線安裝 |
| `CC_MASTER_NO_AUTOINSTALL` | _空_ | 設為 `1` → 關閉 Claude Code 上的自動狀態列安裝 |

### 3.5 在各 harness 裡啟動編排

安裝完成後，用對應 harness 的原生入口啟動：

```bash
# Claude Code（斜槓命令）
/cc-master:as-master-orchestrator <你的目標>

# Codex（子命令）
$cc-master-as-master-orchestrator <你的目標>

# Cursor（Agent chat 斜槓命令）
/as-master-orchestrator <你的目標>

# kimi-code（名稱空間外掛命令）
cc-master:as-master-orchestrator <你的目標>
```

### 3.6 日常命令速查表

| 命令 | 用途 |
|------|------|
| `/cc-master:as-master-orchestrator <goal>` | 開始一次全新編排 |
| `/cc-master:as-master-orchestrator --resume` | 恢復已有 board |
| `ccm harness list --machine-wide --json` | 發現機器級 harness 表面 |
| `ccm quota status --machine-wide --json` | 讀取快取配額姿態 |
| `ccm model-policy show --task <taxonomy> --json` | 檢視 O/T1/T2/T3 模型角色候選 |
| `ccm worker help --harness <target>` | 讀取目標 CLI 真實的 agent 命令幫助 |
| `ccm worker run` | 原始 worker 傳輸（無 board 副作用） |
| `ccm worker dispatch --board … --task … --idempotency-key …` | 帶記賬的派發（Agent Registry 記錄） |
| `ccm agent list --json` | 檢視執行時名單與生命週期證據 |
| `ccm status-report show` | 生成 board 狀態報告 |
| `ccm web-viewer open` | 在瀏覽器開啟只讀即時計劃圖 |
| `/cc-master:discuss <decision>` | 把決策拋給人類 |
| `/cc-master:bulk-discuss` | 一次性走完所有待定決策 |
| `/cc-master:stop` | 收尾並歸檔 board |
| `/cc-master:handoff-to-new-session` | 為會話交接做準備 |
| `/cc-master:retro` | 只讀覆盤 → 經驗教訓文件 |
| `/cc-master:distill <retro-path...>` | 把經驗提煉為專案資產（discipline-doc / skill / workflow / subagent） |
| `ccm account add\|list\|switch <email>` | 管理 Claude Code 賬戶池 |

### 3.7 一次完整工作流的形狀

```text
1. 你: /cc-master:as-master-orchestrator "把部落格站遷移到新的 i18n 架構"
2. cc-master: 建立 Goal Contract → 把目標切片成 DAG（T0 調研 → T1/T2 並行實現 → T3 驗收）
3. cc-master: 按 O/T1/T2/T3 給每個任務分配模型角色，worker 派發到 Claude Code/Codex 等
4. 遇到真正需要你的決策 → /cc-master:discuss 或 /cc-master:bulk-discuss
5. 上下文快滿 → /cc-master:handoff-to-new-session → 新會話 --resume，board 原樣恢復
6. 全部任務 done → verify-board 門逐條對照 Goal Contract 驗收 → /cc-master:stop 歸檔
7. 可選: /cc-master:retro → /cc-master:distill 把教訓變成團隊資產
```

## 四、系統架構

### 4.1 三層產品模型

```text
┌─────────────────────────────────────────────────────────┐
│  cc-master plugin（per-harness 介面卡）                  │
│  命令 / skills / rules / hooks                          │
│  → Claude Code · Codex · Cursor · kimi-code            │
├─────────────────────────────────────────────────────────┤
│  ccm CLI + @ccm/engine（獨立產品）                       │
│  board / Goal Contract / worker / agent registry /      │
│  quota / model policy / runtime / monitor / viewer      │
├─────────────────────────────────────────────────────────┤
│  ccm web-viewer（只讀，內嵌於 ccm 二進位制）               │
│  Graph / Board / List / Timeline / DecisionCard         │
└─────────────────────────────────────────────────────────┘
```

- **第一層**：per-harness 外掛介面卡——把同一套命令/skill/hook 翻譯成各 harness 的原生形態。
- **第二層**：`ccm` CLI 與 `@ccm/engine`——與 harness 解耦的獨立引擎產品，負責 board、worker、配額、模型策略。
- **第三層**：`ccm web-viewer`——只讀瀏覽器檢視（Graph / Board / List / Timeline / DecisionCard）。

### 4.2 原始碼到介面卡的投影模型（paragoge 風格）

```text
plugin/src/                      ← 規範原始碼（SSOT）
  skills/                        ← SAP: <skill>/canonical/ + adapters/<host>/strategy.yaml
  hooks/                         ← PHIP: _manifest/ + _hosts/<host>/ + implementations/<host>/
  commands/                      ← 命令體原始碼
  adapters/                      ← 跨表面 host 原生呼叫對映
plugin/dist/<host>/              ← 生成的介面卡產物（提交進倉庫）
  cc-master-plugin-claude-code-<version>.zip
  cc-master-plugin-codex-<version>.zip
  cc-master-plugin-cursor-<version>.zip
  cc-master-plugin-kimi-code-<version>.zip
```

### 4.3 Board v2 資料模型（窄腰設計）

Board 是 `~/.cc_master/boards/<UTC時間戳>-<pid>.board.json` 的 JSON 檔案：

```json
{
  "schema": "cc-master/v1",
  "goal": "...",
  "owner": { "active": true, "session_id": "abc123", "heartbeat": "..." },
  "git": { "worktree": "/.../.claude/worktrees/i18n", "branch": "feat/i18n-rollout" },
  "wip_limit": 4,
  "tasks": [
    { "id": "T0", "status": "done", "deps": [], "artifact": "commit a1b2c3", "verified": true },
    { "id": "T1", "status": "in_flight", "deps": ["T0"], "mechanism": "sub-agent", "handle": "bg-7a" },
    { "id": "D1", "status": "blocked", "blocked_on": "user", "title": "PR 要不要拆成兩個？" }
  ],
  "log": []
}
```

**任務狀態列舉**：`ready / in_flight / blocked(blocked_on:"user"|"<taskid>") / done / escalated / failed / stale / uncertain`

**窄腰原則**：只有一小撮固定欄位被 hooks 依賴——`schema / goal / owner.session_id / git / tasks[{id,status,deps}]` + 狀態列舉；其餘全是"給 Agent 的自由形態"。要改動窄腰，必須同一個 PR 裡同步更新所有 hooks + 測試。

### 4.4 8 個分散式 Skill（所有 harness 共享）

| Skill | 職責 |
|-------|------|
| `master-orchestrator-guide` | 專案負責人身份、主線決策、切片 DAG 排程、派發/恢復/驗收/賬戶切換邊界 |
| `authoring-workflows` | 在可用主機上確定性編寫 workflow；不支援的主機顯式降級 |
| `using-ccm` | ccm CLI 全操作手冊、board 模型、狀態機、Agent Registry 與引擎校驗規則 |
| `slicing-goals-into-dags` | 把目標切片成可早交付、可並行、可驗證的 DAG |
| `dev-as-ml-loop` | 把單個開發任務當"提出 → 測量 → 調整 → 收斂"的最佳化迴圈 |
| `engineering-with-craft` | DDD / SDD / TDD / OOP 工程手藝與實現紅線 |
| `pacing-and-estimation` | 消費 ccm 只讀建議（usage / estimate / baseline）做節奏與估算 |
| `distilling-lessons-into-assets` | 把覆盤證據路由到 discipline-doc / skill / workflow / subagent 資產 |

### 4.5 O / T1 / T2 / T3 統一模型分配

| 角色 | 用途 |
|------|------|
| **O**（orchestrator） | 系統/架構/設計、對抗性審查 |
| **T1** | 規格完成後的主要實現 |
| **T2** | 常規審查、測試、倉庫調研、結構化總結 |
| **T3** | 機械性、低風險、高可驗證性的批次工作 |

### 4.6 Hooks：dormant-until-armed（沉睡直到被武裝）

每個 hook 在會話被 `as-master-orchestrator` 接管並啟用 board 之前完全沉睡；只有 `bootstrap-board.sh` 例外（它本身就是武裝動作）。7 類能力：

| Hook | 能力 |
|------|------|
| `bootstrap` / `resume` | 建 board / 接管舊 board |
| `reinject` / orchestrator context | 壓縮後恢復身份、Goal Contract、任務、機器級事實 |
| `verify-board` | 停止門：檢查未完成目標、後臺 Agent、真實完成證據 |
| `board-guard` / `board-lint` | 阻止手動改 board；寫後結構校驗 |
| `usage-pacing` | 消費 ccm 快取的配額/建議 |
| `coordination inbox` | 跨會話的決策級通知 |
| `identity` / `critical-path nudge` | 長會話中恢復角色 + 關鍵路徑注意力 |

### 4.7 配額姿態與蒙特卡洛預測

- **Quota posture**：按 provider 快取的機器級配額訊號——Claude Code 5h/7d、Codex 7d 硬限制、Cursor 計費週期、kimi-code 滾動 5h/7d。
- **Monte Carlo 預測**：對排程計劃做上千次模擬，給出交付機率估計——不再拍腦袋承諾"明天能好"，而是給分佈。

### 4.8 雙版本線（ADR-022）

| 產品 | 版本 tag 模式 | 釋出軌道 |
|------|--------------|----------|
| cc-master 外掛 | `v0.22.0`（裸版本） | 外掛釋出 |
| `ccm` 引擎 | `ccm-v0.23.0` | ccm 釋出 |

外掛與引擎是兩條獨立版本線，可分別鎖定——這保證了"引擎升級不炸外掛、外掛更新不必等引擎"。

## 五、設計哲學

### 5.1 指揮家從不親自演奏

協調者負責協調，絕不親自做單元工作。任何把主線推向"親自實現/親自審查"的改動方向都是錯的——這是整個系統最重要的一條紅線。

### 5.2 注意力再分配

系統的終極目標不是"自動化一切"，而是**把人類注意力重新分配到真正值得花的地方**。拆解、排程、進度、記賬這類確定性髒活自動化；品味、設計、方向這類不可外包的判斷留給人。

### 5.3 ship-anywhere（隨處可執行）

hooks 只用 **bash + node/JS**（Claude Code 宿主保證的執行時），不用 `jq` / `python` / 原生 TS；不依賴 `agent-teams` 或定時例行（不可靠）；定時原語（CronCreate）只用於看門狗，不用於常規排程。

### 5.4 dormant-until-armed（沉睡直到被武裝）

不啟用就不存在：所有 hook 在會話接管並啟用 board 之前完全沉睡，把"未使用時的副作用"降到零。

### 5.5 窄腰（Narrow Waist）

hooks 只依賴極小固定欄位集，其餘全部是 Agent 可自由發揮的空間；改動窄腰必須同 PR 更新所有 hooks + 測試。這讓系統在"確定性核心"與"Agent 自由度"之間取得平衡。

### 5.6 雙版本線解耦

外掛與引擎獨立發版、可分別鎖定版本，架構決策落在 ADR 裡（已有 39 條 ADR）。這是"長線架構決策"的體現：選型按三年維度做，不搞臨時方案。

### 5.7 明確的使用邊界

設計哲學裡最反直覺的一點是**主動劃出"不該用"的邊界**：十分鐘能改完的小修復，直接做，別請專案負責人。系統為"太大、太亂、太長"的目標而生——工作越大越值得。

## 六、歸納總結：觀點與結論

1. **單次對話的記憶不該是唯一的工作狀態**：把 Board 持久化到磁碟、跨上下文重置與會話交接存活，是長期 Agent 工作從"demo"走向"可生產"的關鍵一步。

2. **編排優於發明**：cc-master 不發明新的 Agent，而是把 Claude Code / Codex / Cursor / kimi-code 編排到一起——複用已有的認證與能力，價值在"指揮"，不在"樂器"。

3. **人類注意力是稀缺資源，應被再分配**：自動化確定性髒活（拆解/排程/記賬），保留不可外包的判斷（品味/設計/方向），是 AI 輔助編碼時代的正確分工。

4. **"許願式全自動"是偽需求**：顯式 Goal Contract + 驗收門 + discuss 機制證明，真正可用的編排必須把人類放回決策環，而不是繞過人類。

5. **配額意識是長期任務的地基**：蒙特卡洛交付預測 + 按 provider 的配額姿態，把"能不能按時交付"從拍腦袋變成機率分佈。

6. **確定性核心與 Agent 自由度可以共存**：窄腰 board + dormant hooks + ship-anywhere 執行時，讓系統既有可驗證的確定性，又保留 Agent 的靈活性。

7. **跨 harness 適配是系統工程**：同一套 skill/hook/命令投影到 4 個 harness 的原生形態（SAP/PHIP 模型），比"為每個 harness 各寫一套"更可持續。

8. **邊界意識是成熟的標誌**：明確"什麼時候不該用"，比堆功能更能體現一個工具對自身定位的清醒。

## 參考資料

- 倉庫主頁：https://github.com/nemori-ai/cc-master
- 中文 README：`README_zh.md`
- 功能手冊：`design_docs/feature-manual.md`
- 能力模型：`design_docs/cross-harness-orchestration-capability-model.md`
- 完整規格：`design_docs/spec.md`
- 詞彙表：`design_docs/glossary.md`
- 架構決策記錄：`adrs/ADR-001…ADR-039`
- 命令目錄：`plugin/src/skills/using-ccm/canonical/references/command-catalog.md`
