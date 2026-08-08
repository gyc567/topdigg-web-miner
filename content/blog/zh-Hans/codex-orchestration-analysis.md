---
title: "Codex-Orchestration 深度解析：如何用一套插件把 Fable 5、Opus 5、Kimi K3 嵌进 Codex，让每個 AI 扮演不同角色協作開發"
description: "全面解析 Cjbuilds/Codex-Orchestration（580+ stars）。這個開源插件如何在 Codex 任務中引入 Planner、Advisor、Designer、Executor 四大角色，讓 Claude Fable 5 規劃、Opus 5 審查、Kimi K3 設計、GPT-5.6 Luna 實現，並解決「誰來當 architect」、「同提供商不同號模型如何路由」、「外部模型憑證如何安全存取」的三大核心問題。內容包含詳細安裝教學、工作流程圖、設計哲學，以及從 production-readiness audit 總結出的安全邊界與工程榮譽。"
date: "2026-08-08"
author: "TopDigg Research Team"
tags: ["Codex-Orchestration", "Codex", "OpenAI", "Multi-Agent", "Claude Fable 5", "Claude Opus 5", "Kimi K3", "OpenRouter", "MCP", "Model Routing", "AI Agent", "TypeScript", "Python", "Role-Based Agent"]
categories: ["深度解析"]
keywords: ["Codex-Orchestration", "Codex 多模型協作", "Claude Fable 5", "Claude Opus 5", "Kimi K3", "OpenRouter", "MCP 插件", "模型路由", "Planner Advisor Designer Executor", "外部模型", "Gate 0", "安全憑證", "多代理協作", "AI 編程助手", "OpenAI Codex"]
---

# Codex-Orchestration 深度解析：用一套插件把多個模型塞進 Codex，讓每個 AI 扮演不同角色協作開發

> **核心理念：** "你不需要更強大的單一模型，你需要更好的協作框架。" Codex-Orchestration 把「不同 AI 扮演不同角色」這件事做到了極致 — Planner 用 Fable 5 來規劃，Advisor 用 Opus 5 來審查，Designer 用 Kimi K3 來設計，Executor 用 GPT-5.6 Luna 來實現。Codex 仍是老大，但現在輪到合適的人（模型）做合適的事。

---

## 一、這是什麼？（小學生都能懂版）

想象一下，你有一個寫程式的團隊合作項目。但你的團隊不是人，而是 AI 助理。

一般情況下，你只請了一個 AI 助理 — 它得同時當專案經理、設計師、程式設計師，還要當自己項目的 QA。結果呢？專案經理可能沒想太多就開始寫程式，設計師畫的東西可能不太美觀，QA 可能被邊做邊改到忘記檢查。

Codex-Orchestration 就是一個「聰明的團隊管理插件」。它不是取代你的 AI 助理，而是幫你**請來更多不同擅長的 AI 助理**，每個人只負責自己的一份工作：

- **Planner**（規劃者） — 負責把你的需求寫成詳細的執行計劃。想像它就像專案經理，會先畫出 roadmap。
- **Advisor**（顧問） — 負責審查計劃，找出漏洞，確保沒漏項。就像品質經理，在程式碼動手之前把問題攔下來。
- **Designer**（設計師） — 負責畫 UI/UX 設計，確保產物好看又好用。
- **Executor**（執行者） — 負責實際實現計劃，寫程式碼。

**最厲害的是，你請的每個「AI 助理」可以是不同廠商的不同模型。** 比如：
- Planner 請 **Claude Fable 5**（擅長規劃）
- Advisor 請 **Claude Opus 5**（擅長審查）
- Designer 請 **Kimi K3**（104 萬 tokens 上下文）
- Executor 請 **GPT-5.6 Luna**（快速實現）

而你原本在 Codex 中的 AI 助理則保持為**最高指揮官** — 它決定什麼時候該讓哪個「副手」上場，最後再親自把關成果。

---

## 二、專案說明

### 2.1 基本資訊

- **專案名稱**：Codex-Orchestration
- **作者/維護者**：Cjbuilds (GitHub 組織)
- **開源地點**：[https://github.com/Cjbuilds/Codex-Orchestration](https://github.com/Cjbuilds/Codex-Orchestration)
- **Stars**：582+（2026 年 7 月）
- **Forks**：59+
- **語言**：Python 3.11+
- **開發者协议**：MIT
- **建立日期**：2026 年 7 月 10 日
- **目前版本**：0.9.3（Unreleased）

### 2.2 它想解決什麼問題？

#### 問題 1：單一模型做不到所有事

當你在 Codex（OpenAI 的 AI 編程助手）中要求它完成一個複雜的任務時，它需要同時擔負多個角色：

1. **理解需求** → 2. **規劃方案** → 3. **審查潛在問題** → 4. **撰寫程式碼** → 5. **測試驗證**

單一模型在每個階段都只能「及格完成」。比如 GPT-5.6 Sol 可能在規劃上有天賦，但在審查細節時可能會漏掉邊界情況；又或者 Fable 5 擅長審查，但實現速度可能不是最快。

#### 問題 2：模型選擇受限

Codex 的原生介面只能選擇目前註冊在 ChatGPT/OpenAI 平台上的模型。想要使用 Anthropic 的 Claude，或是 OpenRouter 上的 Kimi K3 — 這些「外部模型」無法直接嵌入到 Codex 的工作流程中。

#### 問題 3：沒有「獨立審查」的機制

在多模型協作中，最危險的事情是「自己審自己」。如果規劃者同時也是審查者，潛在的缺陷會永遠被掩蓋。Codex-Orchestration 強制要求 **Planner 和 Advisor 必須使用不同的模型**，確保獨立審查。

#### 問題 4：憑證安全問題

把外部模型的 API Key 拼在聊天裡面，或者存到設定檔中，都是非常危險的。Codex-Orchestration 設計了一個「門禁系統」 — 讓憑證永遠不出現在 Codex 的聊天記錄或代碼存儲庫中。

### 2.3 核心功能

| 功能 | 說明 |
|------|------|
| **角色路由** | 把 Planner、Advisor、Designer、Executor 映射到不同模型 |
| **外部模型支援** | 透過 OpenRouter 把 Kimi K3 等外部模型加入 Codex |
| **Claude 集成** | 把 Claude Fable 5 / Opus 5 接入作為 Planner 或 Advisor |
| **安全憑證管理** | 使用作業系統的 credential store，不把 Key 放在聊天或程式碼中 |
| **預覽優先** | 所有操作都先預覽，再套用，避免誤操作 |
| **路由修復** | 當路由設定搖擺時，可只修復受影響的部分 |
| **插件自更新** | `$codex-orchestration:codex-orchestration --update` |

---

## 三、核心思想

### 3.1 四大角色制

Codex-Orchestration 在 Codex 任務中引入了四種角色，讓不同模型專心於自己的擅長領域：

#### 🎯 Planner（規劃者）
- **職責**：將用戶的需求轉化為詳細的執行計劃
- **流程**：收到需求 → 制定計劃 → 收到 Advisor 反饋 → 改進計劃
- **可選性**：如果省略，當前 Codex 模型會擔任 Planner
- **範例模型**：Claude Fable 5、GPT-5.6 Sol

#### 🔍 Advisor（顧問/審查者）
- **職責**：審查計劃，找出遺漏的需求、潛在風險、技術陷阱
- **流程**：收到計劲 → 找出問題 → 回傳 `PLAN_APPROVED` 或 `PLAN_REVISE`
- **可選性**：如果省略，沒有審查環節
- **範例模型**：Claude Fable 5、Claude Opus 5、GPT-5.6 Sol
- **限制**：最多 8 次審查rounds，否則停止執行

#### 🎨 Designer（設計師）
- **職責**：將審核通過的需求轉化為設計稿（UI/UX、互動設計、資訊架構等）
- **流程**：收到計劃 → 產出設計文件 → 傳給 Executor
- **可選性**：如果省略，沒有設計階段
- **範例模型**：GPT-5.6 Terra、Kimi K3（外部模型）

#### ⚙️ Executor（執行者）
- **職責**：實現經過審核認可的計劃，撰寫程式碼
- **流程**：收到計劃 + 設計稿 → 實現 → 完成
- **必選性**：必須指定
- **範例模型**：GPT-5.6 Luna

### 3.2 工作流程

```text
                         用戶下達任務
                             |
                             v
                  Codex 負責協調整體工作
                             |
                             v
               Planner 制定第一個計劃
               (Fable 5 或其他模型)
                             |
                             v
                    Advisor 審查計劃
                  (找出潛在問題)
                             |
                   需要修改? -- 是 --+
                             |            |
                            否            v
                             |      Planner 改進計劃
                             |            |
                             +<-----------+
                             |
                       計劃通過審核
                             |
                             v
                Designer 製作設計稿
                (可選，獨立角色)
                             |
                             v
                  Executor 實現計劃
                (實現程式碼)
                             |
                             v
                   Codex 測試與交付
```

> **關鍵規則**：Planner 和 Designer 可以在多個模型之間來回修改，但 **Advisor 必須使用與 Planner 不同的模型**。這確保了「獨立審查」的原則。

### 3.3 設計哲學

#### 哲學 1：Codex 始終是老大

> "The model selected for the Codex task remains in charge."

Codex-Orchestration **從不取代** Codex 本身。它只是在 Codex 的工作流程中引入更多模型作為「副手」。Codex 仍然是：

- 決定如何分解任務
- 決定什麼時候該讓哪個副手上場
- 收集合所有副手的結果
- 做最終的驗證與交付

#### 哲學 2：預覽優先，失敗閉合

所有操作都遵循「預覽 → 確認 → 套用」的流程：

```bash
# 預覽（不會修改任何設定）
python3 configure_native_routing.py --codex-bin <path> --status

# 套用
python3 configure_native_routing.py --codex-bin <path> --status --require-effective
```

如果任何檢查失敗，系統會**立即停止**，而不是繼續嘗試。這種「失敗閉合」(fail-closed) 的設計確保安全邊界不會被意外突破。

#### 哲學 3：憑證零存留

> "Never paste an API key into Codex chat. The repository, provider TOML, registry, journal, logs, and tests store no key."

這個專案有一個非常嚴格的安全原則：**在任何人可見的地方，都不能存著 API Key**。憑證的存取方式如下：

1. **準備階段**：在 trusted terminal 中執行隱藏式的本地提示
2. **憑證儲存**：OS credential store（macOS Keychain、Linux Secret Service、Windows Credential Manager）
3. **呼叫時機**：只在需要發送 API 呼叫時，從 credential store 讀取
4. **絕不存取**：聊天記錄、設定檔、程式碼、Git、日誌、測試、註冊檔 — 通通不能存 Key

#### 哲學 4：路由不是執行器選擇器

> "Same-provider routing could be mistaken for an engine-enforced executor selector."

Codex-Orchestration 的路由是 **政策引導** (policy-guided)，而不是引擎強制 (engine-enforced)。這意味著：

- Codex 仍然可以選擇不委派工作
- `model` 參數只是「建議」路由，不是強制
- 路由失敗時，Codex 會退回到根模型執行

#### 哲學 5：最小權力原則

每個角色都有明確的權限邊界：

- **Planner**：只能規劃，不能編輯程式碼
- **Advisor**：只能審查計劃，不能執行或編輯
- **Designer**：只能編輯設計文件，不能修改實現程式碼
- **Executor**：只能實現計劃，不干涉其他角色
- **Claude 子process**：no-tools, no-persistence, minimal environment

---

## 四、關鍵觀點與結論

### 4.1 從 production-readiness audit 學到的 5 件事

Codex-Orchestration 在 2026 年 7 月 12 日經過一次正式的「生產就緒稽核」(production-readiness audit)。稽核發現並修復了多個問題：

| 等級 | 原始問題 | 解決方式 |
|------|----------|----------|
| **高** | README 一開頭就丟內部 routing 細節，普通用戶看不懂 | 改用「什麼是它」、「為什麼需要它」、「如何安裝」的普通語言結構 |
| **高** | Fable 5 是獨立開發的，不能保證 advisor workflow 可以用 | 整合選用的根-directed Fable bridge，加上登入檢查與 fail-closed |
| **高** | `main` 分支可變動，沒 PR 審查機制 | 要求 PR、required checks、admin enforcement、禁止 force-push |
| **高** | 同_provider 路由可能被誤解為 engine-enforced executor selector | 明確描述為 policy-guided routing，區分 config / effective / accepted / confirmed 四種狀態 |
| **中** | 還原狀態持久化失敗時忽略 rollback 錯誤 | 驗證 rollback 狀態，報告 managed fields 可能遺留 |

**結論**：這個專案在設計初期就面臨「怎麼讓複雜的 routing 技術變得安全易用」的挑戰，並通過嚴格的稽核與迭代來解決。

### 4.2 三種路由方式

Codex-Orchestration 支援三種不同的模型路由方式：

| 方式 | 適用情況 | 範例 | 安全等級 |
|------|----------|------|----------|
| **同_provider 直送** | 同一個 provider 內切換模型 | GPT-5.6 Sol → Luna | 標準（透過 App Server config） |
| **Claude 子subscription** | 希望用 Claude Fable 5 / Opus 5 作為 Planner 或 Advisor | Fable 5 High 作為 Planner | 高（seal bridge） |
| **外部模型 (External Models)** | 使用 OpenRouter 等外部 provider 的模型 | Kimi K3 via OpenRouter | 高（Gate 0 + OS credential store） |

**結論**：專案提供了完整的「模型接入金字塔」：從最簡單的同 provider 直送，到需要完整安全審計的外部模型接入。

### 4.3 Kimi K3 的憑證安全架構

Kimi K3 透過 OpenRouter 接入，是這個專案中最具代表性的「外部模型」案例。它展示了整套安全架構：

1. **Provider 準備**：只添加 `[model_providers.openrouter]` 和 command-backed `auth` table
2. **身份驗證**：OS credential store + hidden local prompt（絕不在聊天中貼 Key）
3. **Gate 0 探針**：一個帶成本的隔離探測，用於驗證模型是否真的能用
4. **角色建立**：建立 provider-pinned personal agent variants
5. **封裝執行**：使用 `codex exec` 直接 CLI 呼叫，工具全數禁用

> **重要**：每次安裝都是「unqualified」直到通過一次明確授權的 billable Gate 0。這意味著你不能「偷用」沒付費的模型。

### 4.4 版本演進史

從 CHANGELOG 可以看出這個專案的演進脈絡：

- **0.1.0~0.3.0**（2026-07-09）：建立基礎架構，加入 advisor workflow，加入安全的外部模型角色
- **0.4.0**（2026-07-10）：將 config-first routing 變為主要工作流程，支援 v2 spawn metadata
- **0.5.1**（2026-07-16）：加入 Planner 角色，Fable 5 開始支援作為 Planner 和 Advisor
- **0.6.0**（2026-07-18）：加入外部模型角色 (Kimi K3)，OS credential store，Gate 0 探針
- **0.7.0~0.7.2**（2026-07-18）：加入 `--update`、Designer 角色、簡潔的 activation confirmation
- **0.8.0**：用封裝的 direct CLI transport 取代 Desktop native agents 執行 READY 外部模型
- **0.9.0**（2026-07-25）：加入 Claude Opus 5 作為 Planner/Advisor，提升安全強度

**結論**：專案在短短 1 個月內完成了從 v0.1 到 v0.9 的快速迭代，每次版本都在解決特定的安全或可用性問題。

### 4.5 工程榮譽與設計決策

從 production-readiness audit 的「Deliberate boundaries that remain」章節，我們可以看出設計者們非常謹慎地處理每一個攻擊面：

1. **External Model READY roles 使用封裝 direct CLI transport**，而非 Desktop native spawn-agent — 這防止 model-facing tools 被濫用
2. **沒有 engine-level executor selector** — routing 始終是 policy-guided，Codex 保留最終決定權
3. **Direct model overrides 繼承 root provider** — 跨 provider 需要額外配置，防止意外使用外部 provider
4. **Claude Fable 5 是狹義的 built-in exception** — 只能作為 Planner/Advisor，不能作為 Designer/Executor
5. **「Any model」 有明確範圍** — 只能是 Codex provider、已配置 compatible custom provider、或 deliberately bundled bridge。插件不會創建 accounts/credentials/協定

**結論**：設計者們在每一個決策點都選擇「失敗閉合」（fail-closed）而非「便利優先」（convenience-first）。

---

## 五、詳細教學

### 5.1 安裝

首先，你需要安裝 Codex-Orchestration 插件到 Codex：

```bash
# 從 marketplace 安裝
codex plugin marketplace add Cjbuilds/Codex-Orchestration

# 添加插件到 Codex
codex plugin add codex-orchestration@codex-orchestration
```

> ⚠️ **注意**：安裝完成後，必須**重新啟動 Codex 並開啟一個新任務**，才能讓插件生效。

### 5.2 基本操作語法

所有操作都是透過 Codex 的 prompt 來完成，**不是終端機命令**。你需要在 Codex 聊天中輸入以下格式：

```text
$codex-orchestration:codex-orchestration <操作指令>
```

例如查看當前狀態：

```text
$codex-orchestration:codex-orchestration status
```

### 5.3 配置角色（setup）

`setup` 是最重要的操作，它會為你配置四大角色對應的模型。語法格式如下：

```text
$codex-orchestration:codex-orchestration setup \
  planner: <模型 與 effort>, \
  advisor: <模型 與 effort>, \
  designer: <模型 與 effort>, \
  executor: <模型 與 effort>
```

#### 範例 1：使用 Fable 5 規劃、Sol 審查、Luna 實現

```text
$codex-orchestration:codex-orchestration setup planner: Claude Fable 5 High, advisor: GPT-5.6 Sol High, executor: GPT-5.6 Luna Extra High
```

解釋：
- **Planner** = Claude Fable 5 (effort: High) — 負責規劃
- **Advisor** = GPT-5.6 Sol (effort: High) — 負責審查
- **Executor** = GPT-5.6 Luna (effort: Extra High) — 負責執行
- **Designer** = 省略（不配置）

#### 範例 2：完整四人組 + Kimi K3 設計

```text
$codex-orchestration:codex-orchestration setup planner: Claude Fable 5 High, advisor: GPT-5.6 Sol High, designer: GPT-5.6 Terra High, executor: GPT-5.6 Luna Extra High
```

#### 範例 3：讓當前 Codex 模型當 Planner，Fable 5 僅當 Advisor

```text
$codex-orchestration:codex-orchestration setup advisor: Claude Fable 5 High, executor: GPT-5.6 Luna Extra High
```

### 5.4 配置規則

- **`executor` 必填** — 決定誰來實現計劃
- **`planner` 可省略** — 省略表示當前 Codex 模型當 Planner
- **`advisor` 可省略** — 省略表示沒有審查環節
- **`designer` 可省略** — 省略表示沒有設計階段
- **Planner 和 Advisor 不能用同一模型** — 確保「獨立審查」

### 5.5 Claude Fable 5 和 Opus 5 的 Effort 選項

| 模型 | 支援的 Effort | 預設值 | 特殊注意事項 |
|------|---------------|--------|-------------|
| **Claude Fable 5** | Low, Medium, High, XHigh, Max | High | `Ultra` 當作 `Max` 的別名 |
| **Claude Opus 5** | Low, Medium, High, XHigh, Max | High | 不接受 `Ultra` 別名；需要 Claude Code 2.1.219+ |

> **Claude Fable 5 和 Opus 5 只能用於 Planner 或 Advisor**，不能用作 Designer 或 Executor。

### 5.6 查詢外部模型可用性

你可以使用自然語言來查詢外部模型（如 Kimi K3）是否可用：

```text
is Kimi available to use as Designer?
```

插件會檢查 External Model registry，並向你報告四種不同的狀態：

1. **supported**：Kimi K3 被 plugin 支援
2. **configured**：Kimi K3 已經在本機配置
3. **locally ready**：Kimi K3 在當前工作區可以使用
4. **callable now**：Kimi K3 已經被驗證可以呼叫

### 5.7 設定外部模型（以 Kimi K3 為例）

如果你希望使用 Kimi K3 這樣的外部模型，需要經過一個「階梯式」的設定流程：

#### 步驟 1：準備 Provider

```text
$codex-orchestration:codex-orchestration configure external role researcher with OpenRouter model moonshotai/kimi-k3 at max; job: gather evidence and cite sources
```

#### 步驟 2：身份驗證

插件會在 terminal 中顯示一個隱藏式的本地提示，引導你將 API Key 存入作業系統的 credential store。**絕對不要把 API Key 貼在 Codex 聊天中！**

#### 步驟 3：Gate 0 探針

你需要**明確授權**一次可能產生費用的隔離探測：

```bash
python3 <skill-dir>/scripts/external_configurator.py \
  --codex-bin <codex-binary-path> \
  gate0 --provider openrouter --model moonshotai/kimi-k3 --effort max --acknowledge-billing
```

> 這一步會產生實際的 API 費用。必須等到你明確確認後才能執行。

#### 步驟 4：建立角色

```bash
python3 <skill-dir>/scripts/external_configurator.py connect \
  --role researcher \
  --purpose "Gather evidence from the bounded packet and cite sources." \
  --provider openrouter \
  --model moonshotai/kimi-k3 \
  --effort max --apply
```

#### 步驟 5：重新啟動

完成後必須**重新啟動 Codex 並開啟新任務**，才能讓角色載入。

#### 步驟 6：呼叫角色

```text
$codex-orchestration:codex-orchestration call researcher at max — review this bounded research packet
```

### 5.8 狀態與維護

| 指令 | 功能 |
|------|------|
| `status` | 查看當前路由配置狀態 |
| `status --require-effective` | 檢查配置是否真正生效 (適合 CI/CD) |
| `repair` | 修復 routing hints 發生搖擺時的配置 |
| `--update` | 更新插件到最新版本 |
| `disable` | 還原設定為安裝前的狀態 |

### 5.9 Designer: Kimi K3 的便捷用法

如果 Kimi K3 角色已經就緒，你可以使用便捷的 seat label 語法：

```text
$codex-orchestration:codex-orchestration Planner: Claude Fable 5 High, Designer: Kimi K3
```

`Designer: Kimi K3` 會自動對應到 role=designer, provider=openrouter, model=moonshotai/kimi-k3, effort=max。**但需要注意**：

- Kimi K3 只支援 `max` reasoning，其他 effort 值會被拒絕
- 此 shorthand 不會把 Kimi 加入 Codex Desktop 的模型選擇器
- 它不會取代任何 GPT 路由
- **不能**在聊天中貼 API Key，不能授權 Gate 0 付費探測

### 5.10 與 Codex Goals 配合使用

你可以正常建立一個 Codex Goal，然後告訴 Codex 使用已保存的工作流程：

```text
請使用已保存的 codex-orchestration 工作流程直到這個 Goal 完成。
```

Codex 仍然管理 Goal 的狀態、權限、整合和驗證；插件只引導每個角色使用哪個模型。

### 5.11 安全操作

#### 如何把憑證安全地存進去？

1. **絕對不要**在 Codex 聊天中貼 API Key
2. **絕對不要**把 Key 寫進設定檔、程式碼、Git、或日誌
3. **正確方式**：透過 OS credential store（macOS Keychain / Linux Secret Service / Windows Credential Manager）

#### 如果 Key 洩露了怎麼辦？

插件會在 `disconnect` 和 `remove provider` 時只刪除確切的 managed 角色文件和 provider 配置，**不會觸碰**：
- chats 或 sessions
- OpenAI 驗證
- 用戶自行配置的角色

---

## 六、安裝與開發

### 6.1 開發環境準備

```bash
# Clone 專案
git clone https://github.com/Cjbuilds/Codex-Orchestration.git
cd Codex-Orchestration

# 安裝開發依賴
python3 -m pip install -r requirements-dev.txt

# 編譯與檢查
python3 -m compileall -q plugins tests scripts
python3 -m ruff check plugins tests scripts

# 執行測試
python3 -m unittest discover -s tests -v
python3 tests/plugin_lifecycle_smoke.py
python3 scripts/release_check.py
```

### 6.2 版本要求

- **Python**：3.11+
- **Codex Desktop**：0.144.0-alpha.4+（用於 v2 spawn metadata）
- **Claude Code**：2.1.219+（用於 Opus 5）

---

## 七、總結

Codex-Orchestration 是一個極具創新性的「AI 團隊管理插件」。它不僅解決了「單一模型能力有限」的問題，更通過以下幾個關鍵設計，把「AI 多模型協作」這件事做到了安全且可控：

### 七、1 三大突破

1. **角色化路由**：把不同模型分配到 Planner / Advisor / Designer / Executor，發揮各家所長
2. **安全的外部模型接入**：透過 OpenRouter + OS credential store + Gate 0 探針，把 Kimi K3 這類外部模型安全地接入 Codex
3. **政策引導而非引擎強制**：Codex 始終是老大，路由只是「建議」，不是強制

### 七、2 三大價值

1. **更強的規劃能力**：Fable 5 擅長規劃，把規劃工作交給它
2. **更嚴的品質管控**：Opus 5 擅長審查，獨立審查防止自己審自己
3. **更快速的實現**：Luna 擅長快語，把實現交給它；支持平行執行

### 七、3 設計者的智慧

從 production-readiness audit 可以看出，設計者們在每一個攻擊面都選擇「失敗閉合」而非「便利優先」。比如：

- **憑證安全**：從來不在聊天/程式碼/設定檔中存 Key，全部走 OS credential store
- **路由安全**：Cross-provider 需要額外配置，防止意外使用未經授權的 provider
- **審查安全**：Planner 和 Advisor 必須不同模型，防止「自己審自己」
- **更新安全**：插件自更新經過 canonical source 驗證，不會被惡意節點替換

這個專案展示了一個非常成熟的思考方式：**不是問「可以做什麼」，而是問「不可以做什麼」**。在 AI 代理越來越強大、越來越自主的時代，這種「信任但驗證」、「便利但安全」的設計哲學，可能才是多模型協作未來的標準。

---

## 八、觀點總結

| 觀點 | 來源 | 結論 |
|------|------|------|
| **多模型 ≠ 單一更強** | README | 把不同模型放到不同角色，比提升單一模型性能更有效 |
| **規劃前先審查** | 工作流程圖 | Advisor review 是一個「planning gate」，不是 implementation guarantee |
| **外部模型需要嚴格審計** | production-readiness audit | 不能「任意 URL 當 provider」，必須是 reviewed bundled manifest |
| **憑證零存留是底線** | CHANGELOG 0.6.0 | API Key 絕不存於聊天/程式碼/Git/設定檔/日誌 |
| **Codex 始終是老大** | SKILL.md | 插件不會取代 Codex，只能引導模型路由 |
| **失敗閉合勝過便利優先** | Auditor | 所有安全邊界都是 fail-closed，不是 best-effort |
| **版本演進以安全為主** | CHANGELOG | 0.5→0.6:加入憑證安全；0.7→0.8:加入 sealed CLI transport；0.9:加入 Opus 5 |
| **可觀察性勝過承諾** | providers-and-models.md | 路由有 precise 狀態（installed/effective/accepted/confirmed），絕不模糊稱讚 |
