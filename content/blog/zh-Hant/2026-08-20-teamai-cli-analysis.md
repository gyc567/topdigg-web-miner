---
title: "TeamAI CLI 深度解析：騰訊如何用Git原生架構統一多Agent團隊協作"
date: "2026-08-20"
description: "TeamAI是騰訊開源的Agent Harness工具，透過Git原生方式管理技能庫、規則和知識，實現跨Agent（Claude Code/Codex/CodeBuddy等）的團隊協作。本文全面解析其設計哲學、架構、核心命令和詳細教程。"
tags:
  - TeamAI
  - Agent Harness
  - AI Agent
  - Git
  - Claude Code
  - 騰訊
  - 多Agent協作
  - 團隊知識管理
  - MCP
categories:
  - 深度解析
---

# TeamAI CLI 深度解析：騰訊如何用Git原生架構統一多Agent團隊協作

## 一句話抓住這個專案

> TeamAI 透過 Git 把分散的 Agent 技能、規則、知識沉澱到同一個可版本化、可訂閱的團隊記憶體，讓 Claude Code、Codex、CodeBuddy、Cursor 等不同 Agent 在同一套「團隊語言」下協作。

**一句話：把 Agent Harness 從個人工具升級為團隊基礎設施，用 Git 作為單一事實來源，用 BM25+知識圖譜作為檢索引擎，用 MCP 作為執行介面——並且對任何 Agent 保持中立。**

---

## 一、專案概述：什麼是 Agent Harness？TeamAI 在哪裡？

### 1.1 Agent Harness 的概念興起

過去兩年，AI 編程助手經歷了一場劇烈的範式轉移：從「聊天框問問題」演化到「**自主 Agent 在沙盒裡跑任務**」。圍繞這個範式，逐漸形成了一類新的工具——**Agent Harness**（Agent 駕馭框架）。

Agent Harness 的職責是：

1. **為模型提供沙盒**：檔案系統、Shell、編輯器、瀏覽器、工具呼叫介面；
2. **注入上下文**：專案結構、編碼規範、團隊慣例、過往教訓；
3. **組織記憶體**：短期對話、長期技能庫、可共享的團隊知識；
4. **連接協議**：透過 MCP（Model Context Protocol）等標準對接外部工具；
5. **管理協作**：讓 Agent 之間、Agent 與人類之間能形成可觀測的工作流。

代表性產品包括 Anthropic 的 Claude Code、OpenAI 的 Codex CLI、騰訊的 CodeBuddy、Cursor 的 Composer、Google 的 Gemini CLI，以及開源界的 Aider、SWE-agent、Open Interpreter 等。

### 1.2 TeamAI 的差異化定位

但所有這些 Harness 都面臨同一個問題：**它們大多是「個人駕馭」而非「團隊駕馭」**。

- Claude Code 的 `~/.claude/CLAUDE.md`、`~/.claude/skills/` 存在於個人機器；
- Codex 的 `codex.toml`、`AGENTS.md` 雖然能 commit，但缺乏訂閱、版本、衝突解決機制；
- Cursor 的 `.cursorrules` 寫死在專案裡，跨專案無從累積；
- 一個 5 人前端團隊的「React 最佳實踐 + 設計系統 + 部署 SOP」，目前只能用 Notion + 飛書文件 + 口口相傳管理。

**TeamAI 想解決的正是這個空白**：把 Agent 的技能庫、規則、知識變成**可版本化、可訂閱、可協作**的團隊資產。

### 1.3 騰訊開源的背景

TeamAI 由騰訊開源，採用 Apache 2.0 協議，目標使用者既包括騰訊內部數萬名工程師，也包括外部社群。它不是「另一個 Claude Code 替代品」，而是**墊在 Claude Code / Codex / CodeBuddy 等 Agent 之下的團隊層**。

> TeamAI is a Harness tool — a framework that gives agents the skills, rules, and context they need to work like the rest of your team.
> （TeamAI 是一個 Harness 工具——一個為 Agent 提供技能、規則和上下文的框架，讓它們能像團隊其他成員一樣工作。）

**專案核心資訊**：

| 維度 | 內容 |
|------|------|
| 倉庫 | `tencent/teamai`（GitHub） |
| 定位 | Team-level Agent Harness |
| 核心思想 | Git-native, Zero-infra, Knowledge-from-friction |
| 協議 | Apache 2.0 |
| 支援 Agent | Claude Code、Codex、CodeBuddy、Cursor、Gemini CLI、Aider |
| 底層 LLM | 任何（透過 MCP 與 Agent 解耦） |
| 知識儲存 | Git 倉庫 + 本地 SQLite 索引 |
| 檢索引擎 | BM25 全文 + 知識圖譜雙驅動 |
| 擴展機制 | Hook + MCP |

---

## 二、核心設計哲學：四個反直覺的堅持

TeamAI 的設計文件開篇就列了四條原則，這四條原則看起來都很「常識」，但每一條都在對抗當前業界的真實傾向。

### 2.1 Git 是團隊知識管理的最佳載體

> **"Knowledge should live where code lives."**
> （知識應該和程式碼住在同一個地方。）

這是第一性原則。當前面對「團隊知識共享」，主流方案有三種：

1. **Notion / Confluence / 飛書文件**：好用，但與程式碼脫鉤，工程師不會打開；
2. **Wiki + Markdown**：版本化差，搜尋弱，容易過時；
3. **Slack / 微信群沉澱**：根本檢索不到。

TeamAI 的回答：**用 Git 倉庫**。

- **版本化天然支援**：技能、規則、知識本身就是純文字檔案，Git 就是為它設計的；
- **PR 工作流天然支援**：團隊成員透過 Pull Request 提交新技能，Code Review 流程直接複用；
- **離線可用**：clone 下來就能用，不需要聯網；
- **分散式**：沒有單點故障，沒有廠商綁定；
- **可審計**：誰改了什麼、為什麼改、討論記錄全部在 Git log 裡。

TeamAI 並不是把 Git 當作儲存後端，而是**把 Git 當作知識治理系統**。這是一個根本性的視角轉變：與其建立一個「Agent 知識平台」，不如直接複用程式碼社群用了 20 年的成熟基礎設施。

### 2.2 零基礎設施思維（Zero-Infra）

> **"If it requires a server, you've already lost half the team."**
> （如果需要架伺服器，你已經失去一半團隊了。）

這條原則看起來激進，但極其務實。讓我們看看當前主流方案的真實痛點：

- **企業內網部署**：安全審批流程 3 個月起步；
- **SaaS 服務**：資料出境、API 配額、帳號開通，一堆流程；
- **自建伺服器**：運維負擔、備份、升級、監控。

TeamAI 的立場是：**整個系統除了 Git 倉庫之外，不應該有任何需要「部署」的元件**。

- 沒有中心化索引服務——每個開發者本地有 SQLite 庫；
- 沒有訊息佇列——pull/push 都是本地 git 命令；
- 沒有 API gateway——MCP 直接連本地行程；
- 沒有 Web 服務——`teamai dashboard` 是本地 TUI/瀏覽器。

這意味著：

1. **5 分鐘上手**：`teamai init` 然後 `teamai pull team://frontend-best-practices`，完成；
2. **零安全審批壓力**：沒有對外服務，安全部門不需要審；
3. **離線也能用**：飛機上、出差網路差、本地離線開發都不受影響；
4. **個人開發者無門檻**：不需要企業帳號。

### 2.3 知識來源於摩擦（Knowledge from Friction）

> **"The best documentation is the one you wrote because something bit you."**
> （最好的文件，是被現實咬了一口之後寫下的那些。）

這一條最深刻。團隊知識管理失敗的核心原因：**寫文件的人沒動力，讀文件的人找不到**。

- **寫文件的動機錯位**：PM 寫的設計文件沒人看，工程師寫的 wiki 沒人維護，Architect 寫的規範太抽象；
- **讀文件的成本太高**：Slack 搜尋品質差、Confluence 結構混亂、Notion 巢狀到打不開。

TeamAI 的洞察是：**真正會被使用的文件，是「被現實咬過一口」之後寫下的**。

舉個例子：

- 第一次：Agent 寫了一段遞迴函式，沒考慮棧溢位，線上炸了；
- 第二次：Agent 在類似的程式碼上又犯了一次錯；
- 第三次：工程師寫了一條規則：「**禁止在熱路徑用深層遞迴，改用尾遞迴或迴圈**」，存進 `.teamai/rules/no-deep-recursion.md`；
- 第四次：所有 Agent 在相關任務時，都會透過 `recall` 拉到這條規則。

這條規則不是「為了寫而寫」，而是**真實痛點的結晶**。TeamAI 把這個工作流工具化：

- **`teamai import`**：從對話歷史、PR 評論、issue 裡把「教訓」抽成規則；
- **`teamai push --as-rule`**：把當前解決方案沉澱為可複用的規則；
- **自動衝突檢測**：新規則和現有規則矛盾時提示；
- **使用統計**：哪些規則從未被 recall 過，建議刪除。

> 知識不是「教導」，而是「提醒」。Agent 不需要讀完所有文件，它只需要在相關情境下被提醒。

### 2.4 隱私優先的共享文化（Privacy-First Sharing）

> **"Share by default, encrypt by default, but never exfiltrate by accident."**
> （預設共享，預設加密，但絕不意外外洩。）

這一條是中國開源社群「上雲恐懼」的直接回應。當前 Agent 工具普遍有幾個隱私痛點：

- **遙測上報**：Cursor、Copilot 等會收集使用統計；
- **雲端索引**：Notion AI、Confluence AI 把文件送到外部 LLM；
- **跨帳號共享**：企業帳號下的個人 repo 可能被掃描。

TeamAI 的隱私模型：

| 機制 | 設計 |
|------|------|
| 遙測 | **預設關閉**，可選 opt-in，且只記錄命令名稱不記錄內容 |
| 索引 | **純本地 SQLite**，絕不上雲 |
| 共享 | 透過 Git 協議，**走你已有的 Git 訪問控制**（SSH key、PAT、OAuth） |
| 加密 | 敏感技能支援 `git-crypt` 或 SOPS 加密，密鑰本地管理 |
| 審計 | 所有 `push`/`pull` 都記錄在本地 `~/.teamai/audit.log` |

> 一句話：**你能控制 Git，就能控制 TeamAI。**

這意味著企業用戶可以：

- 用內網 GitLab 替代 GitHub；
- 用公司 SSH key 控制誰能 pull 哪個 repo；
- 用 git-crypt 加密包含客戶資料的案例庫；
- 完全斷網使用（只需預先 clone 一次）。

---

## 三、架構解析：模組、檢索、抽象

### 3.1 系統模組結構

TeamAI 的程式碼組織遵循「職責清晰、邊界明確」的原則，主要分為以下幾層：

```
teamai/
├── cmd/                    # CLI 入口（Cobra 框架）
│   ├── root.go            # 根命令、全域選項
│   ├── init.go            # 初始化團隊倉庫
│   ├── push.go            # 推送技能/規則
│   ├── pull.go            # 拉取訂閱源
│   ├── recall.go          # 語意檢索
│   ├── import.go          # 從對話歷史抽取知識
│   ├── members.go         # 團隊成員管理
│   ├── roles.go           # 角色定義
│   ├── hooks.go           # Hook 配置
│   ├── mcp.go             # MCP 伺服器配置
│   ├── dashboard.go       # 本地 Dashboard
│   └── doctor.go          # 健康診斷
│
├── internal/
│   ├── git/               # Git Provider 抽象層
│   │   ├── provider.go    # GitProvider 介面
│   │   ├── github.go      # GitHub 實作
│   │   ├── gitlab.go      # GitLab 實作
│   │   ├── gitea.go       # Gitea 實作
│   │   └── ssh.go         # 通用 SSH 協議
│   │
│   ├── knowledge/         # 知識管理核心
│   │   ├── store.go       # SQLite 儲存
│   │   ├── bm25.go        # BM25 全文索引
│   │   ├── graph.go       # 輕量級知識圖譜
│   │   ├── merger.go      # 知識合併器
│   │   └── conflict.go    # 衝突檢測
│   │
│   ├── agent/             # Agent 適配層
│   │   ├── adapter.go     # AgentAdapter 介面
│   │   ├── claude_code.go # Claude Code 適配
│   │   ├── codex.go       # Codex CLI 適配
│   │   ├── codebuddy.go   # CodeBuddy 適配
│   │   ├── cursor.go      # Cursor 適配
│   │   └── generic.go     # 通用 MCP 介面
│   │
│   ├── recall/            # 檢索引擎
│   │   ├── engine.go      # 主調度
│   │   ├── ranker.go      # BM25+KG 混合排序
│   │   └── reranker.go    # 可選 cross-encoder 重排
│   │
│   ├── hooks/             # Hook 系統
│   │   ├── runner.go      # Hook 執行器
│   │   ├── builtin.go     # 內建 hooks
│   │   └── registry.go    # Hook 註冊表
│   │
│   ├── mcp/               # MCP 整合
│   │   ├── server.go      # 內嵌 MCP 伺服器
│   │   ├── client.go      # 對接外部 MCP
│   │   └── bridge.go      # recall→MCP 橋接
│   │
│   └── config/            # 設定管理
│       ├── loader.go      # 多源載入
│       ├── schema.go      # JSON Schema 驗證
│       └── env.go         # 環境變數覆寫
│
└── pkg/
    ├── teamaigit/         # 可匯入函式庫
    └── teamaimcp/         # MCP 公共介面
```

整個專案用 **Go** 編寫（單一二進位散佈），這也是呼應「零基礎設施」原則——單一可執行檔，無執行時依賴。

### 3.2 BM25 + 知識圖譜雙驅動的檢索

Agent 在執行任務時，需要從海量團隊知識中找到「現在這一步最相關」的內容。TeamAI 採用了**BM25 + 知識圖譜**的混合檢索策略，這是一個務實而有效的選擇。

#### 3.2.1 為什麼不是純向量檢索？

當前 RAG 領域的「預設答案」是用 Embedding + 向量資料庫（如 Qdrant、Pinecone）。TeamAI **明確反對**這個預設，原因有三：

1. **冷啟動差**：新建立的團隊倉庫沒歷史 embedding，沒有向量就沒法檢索；
2. **可解釋性弱**：向量距離對人類不直視，debug 痛苦；
3. **基礎設施重**：向量資料庫本身需要單獨部署。

BM25 的優勢：

- **零冷啟動**：純文字索引，clone 完就能用；
- **可解釋**：每個結果都有精確的關鍵詞匹配分數；
- **無依賴**：SQLite FTS5 內建，不需要外部服務；
- **適合程式碼**：技能名稱、API 名稱、錯誤訊息的精確匹配比語意匹配更可靠。

#### 3.2.2 為什麼還需要知識圖譜？

BM25 也有弱點：**無法理解「A 和 B 是同一個概念」、「C 是 D 的子類別」這種結構化關係**。

TeamAI 引入了一個**輕量級知識圖譜**：

```yaml
# .teamai/graph/concepts.yaml
concepts:
  - id: react-hooks
    label: React Hooks
    aliases: [hooks, useState, useEffect]
    parent: react-patterns
    
  - id: react-patterns
    label: React 設計模式
    aliases: [react design patterns]
    
  - id: ts-strict
    label: TypeScript 嚴格模式
    aliases: [strict mode, strict]
    related: [react-hooks, type-safety]
    
relations:
  - from: react-hooks
    to: typescript-strict
    type: requires
```

圖譜不是「自動從文件抽取」的，而是**團隊手動維護的**。這聽起來像退步，實際上是一個務實的選擇：

- **品質可控**：LLM 自動抽取的圖譜噪訊太多，反而干擾檢索；
- **維護成本低**：一個 10 人團隊的核心概念圖譜通常只有 50-100 個節點；
- **可審計**：所有關係都有 PR 記錄。

#### 3.2.3 混合排序公式

召回階段採用 BM25，圖譜用於擴展查詢，重排序階段可選 cross-encoder：

```
final_score = α * bm25_score + β * graph_expansion_score + γ * cross_encoder_score
```

預設 `α=0.6, β=0.3, γ=0.1`，可在 `~/.teamai/config.yaml` 中調整。

### 3.3 Git Provider 抽象

TeamAI 的核心創新之一是 `GitProvider` 介面——**任何 Git 倉庫都可以成為 TeamAI 的「知識訂閱源」**：

```go
// internal/git/provider.go
type GitProvider interface {
    Clone(ctx context.Context, url string, dst string) error
    Pull(ctx context.Context, repo string) error
    Push(ctx context.Context, repo string, ref string) error
    ListRefs(ctx context.Context, repo string) ([]Ref, error)
    GetMeta(ctx context.Context, repo string) (*Meta, error)
}
```

內建實作：

| Provider | 協議 | 認證 |
|---------|------|------|
| `github` | HTTPS + GitHub API | OAuth, PAT |
| `gitlab` | HTTPS + GitLab API | OAuth, PAT |
| `gitea` | HTTPS + Gitea API | OAuth, PAT |
| `ssh` | 純 SSH 協議 | SSH Key |
| `local` | 檔案系統 | 無 |

這意味著 `teamai://` URL 可以解析到任何支援的 Git 後端：

```bash
teamai pull team://github.com/your-org/frontend-skills
teamai pull team://gitlab.internal.company.com/ai/platform-rules
teamai pull team://gitea.your-company.cn/team/sop-library
teamai pull team://git@github.com:your-org/personal-notes.git
```

企業內網、混合雲、開源倉庫都可以無縫接入。

---

## 四、核心命令詳解

TeamAI 提供了 11 個核心命令，每個命令都遵循 Unix 哲學：做一件事，做好它。

### 4.1 `teamai init` — 初始化

```bash
teamai init [path]
```

初始化一個新的 TeamAI 倉庫，預設在當前目錄：

```
.teamai/
├── skills/          # 可複用的技能庫
│   ├── react-best-practices/
│   ├── postgres-optimization/
│   └── incident-response/
├── rules/           # 規則庫（會被 Agent 自動載入）
│   ├── code-style.md
│   ├── no-console-log.md
│   └── ts-strict-mode.md
├── memory/          # 結構化知識
│   ├── components.yaml
│   ├── services.yaml
│   └── incidents.yaml
├── graph/           # 知識圖譜
│   └── concepts.yaml
├── hooks/           # Hook 腳本
│   ├── pre-commit.sh
│   └── post-recall.sh
├── mcp/             # MCP 設定
│   └── servers.yaml
├── members.yaml     # 團隊成員
├── roles.yaml       # 角色定義
└── config.yaml      # 主設定
```

選項：

- `--team <name>`：設定團隊名稱；
- `--provider <name>`：指定 Git provider（github/gitlab/ssh/local）；
- `--private`：預設使用私有模式（git-crypt 加密）；
- `--bare`：初始化為 bare 倉庫（用於中心化倉庫）。

典型流程：

```bash
cd my-team-repo
teamai init --team frontend-platform --provider github
git add .teamai
git commit -m "feat: initialize teamai structure"
git push
```

### 4.2 `teamai push` — 推送本地知識

```bash
teamai push [path] [flags]
```

把本地的技能、規則、知識推送到遠端：

```bash
teamai push --type skill --name react-hooks-patterns
teamai push --type rule --name no-mutation-in-render
teamai push --type memory --from memory/new-incident.yaml
teamai push --type graph --from graph/concepts.yaml
```

選項：

- `--type`：技能 / 規則 / 記憶 / 圖譜；
- `--name`：唯一名稱（用於 upsert）；
- `--as-rule`：把當前解決方案自動轉化為規則；
- `--message`：提交訊息（預設自動生成）；
- `--dry-run`：只預覽不實際推送；
- `--force`：覆蓋遠端（需管理員權限）。

### 4.3 `teamai pull` — 拉取訂閱源

```bash
teamai pull <source> [flags]
```

從遠端拉取訂閱源到本地：

```bash
# 從 URL 拉取
teamai pull team://github.com/your-org/platform-skills

# 從訂閱清單拉取
teamai pull --from subscriptions.yaml

# 訂閱並跟蹤更新
teamai pull team://github.com/your-org/skills --subscribe

# 只更新圖譜
teamai pull --type graph

# 解決衝突
teamai pull --strategy ours   # 保留本地
teamai pull --strategy theirs # 採用遠端
teamai pull --strategy merge  # 三方合併（推薦）
```

訂閱機制特別值得說明：pull 後會在 `subscriptions.yaml` 中記錄來源，後續 `teamai sync` 可以一鍵同步所有訂閱源。

### 4.4 `teamai recall` — 語意檢索

```bash
teamai recall <query> [flags]
```

這是 TeamAI 最常用的命令——在當前上下文中檢索最相關的知識：

```bash
teamai recall "如何在 React 中避免不必要的 re-render"
teamai recall "Postgres 慢查詢"
teamai recall "線上事故回滾 SOP" --top 5
```

選項：

- `--top <n>`：返回前 N 條結果（預設 3）；
- `--type`：限定類型（skill/rule/memory/graph）；
- `--scope`：限定範圍（local/subscribed/all）；
- `--format`：輸出格式（text/json/yaml）；
- `--inject`：直接把結果注入 Agent 上下文（透過 MCP）。

範例輸出：

```
$ teamai recall "React re-render optimization"
[rule] no-inline-functions-in-jsx        score=0.92  rules/no-inline-functions-in-jsx.md
[rule] use-memo-for-heavy-computation    score=0.88  rules/use-memo.md
[skill] react-perf-patterns              score=0.85  skills/react-perf/SKILL.md
[memory] incident-2025-12-render-storm   score=0.71  memory/incidents/2025-12-render-storm.yaml

Graph expansion:
  react-perf-patterns → react-patterns → frontend-best-practices
```

### 4.5 `teamai import` — 從對話歷史抽取知識

```bash
teamai import [source] [flags]
```

這是 TeamAI 「知識來源於摩擦」哲學的核心實現——**從真實工作流中自動抽取可複用知識**。

支援的來源：

```bash
# 從 Claude Code 對話歷史
teamai import --from claude-code --last 50

# 從 Codex CLI 對話
teamai import --from codex --last 30

# 從 PR 評論
teamai import --from pr --repo your-org/your-repo --pr 1234

# 從 issue 討論
teamai import --from issue --repo your-org/your-repo

# 從 Slack/飛書匯出的文字
teamai import --from text --file discussion.txt

# 從互動模式（即時記錄）
teamai import --interactive
```

互動模式下，TeamAI 會用 LLM 分析對話歷史，識別出**可沉澱的教訓**，然後互動式確認：

```
[分析中] 找到 3 條潛在教訓：

1. "不要在 useEffect 中直接修改 state，應該用 useMemo 或衍生狀態"
   建議類型: rule
   建議名稱: no-state-mutation-in-effect
   信心度: 0.89

2. "Postgres JSONB 欄位查詢時要用 GIN 索引，否則全表掃描"
   建議類型: skill
   建議名稱: postgres-jsonb-indexing
   信心度: 0.92

3. "Apollo Client 快取策略：合併分頁結果用 fetchMore + updateQuery"
   建議類型: skill
   建議名稱: apollo-cache-pagination
   信心度: 0.85

接受哪些？(y/n/skip/all) [y]
```

只有人類確認後才會寫入規則庫，這保證了知識品質。

### 4.6 `teamai members` — 團隊成員管理

```bash
teamai members <subcommand> [flags]
```

子命令：

```bash
teamai members add <email> --role <role>           # 新增成員
teamai members remove <email>                       # 移除成員
teamai members list                                 # 列出成員
teamai members grant <email> --scope <scope>        # 授權範圍
teamai members revoke <email> --scope <scope>      # 撤銷範圍
```

成員資訊存放在 `members.yaml`：

```yaml
members:
  - email: alice@company.com
    name: Alice Chen
    role: senior-engineer
    scopes: [read, write, admin]
    joined: 2025-03-15
    
  - email: bob@company.com
    name: Bob Wang
    role: engineer
    scopes: [read, write]
    joined: 2025-06-01
    mentor: alice@company.com
```

權限模型基於 Git 本身的訪問控制（透過 Git Provider），TeamAI 不重新發明權限系統。

### 4.7 `teamai roles` — 角色定義

```bash
teamai roles <subcommand> [flags]
```

角色定義了**不同職位的 Agent 應該自動載入哪些知識**：

```yaml
# roles.yaml
roles:
  - id: frontend-engineer
    description: 前端工程師
    auto-recall:
      - scope: subscribed
        filter: "tag:frontend AND tag:best-practices"
    default-skills:
      - react-patterns
      - ts-strict-mode
      - browser-devtools
    required-rules:
      - no-inline-functions-in-jsx
      - use-semantic-html
      
  - id: backend-engineer
    description: 後端工程師
    auto-recall:
      - scope: subscribed
        filter: "tag:backend AND tag:postgres"
    default-skills:
      - go-best-practices
      - postgres-optimization
      - grpc-patterns
```

命令：

```bash
teamai roles list                           # 列出所有角色
teamai roles show frontend-engineer         # 顯示角色詳情
teamai roles assign <email> <role>          # 為成員指派角色
teamai roles simulate <role> --task "..."   # 模擬角色的 recall 結果
```

當 Agent 為某個角色執行任務時，會自動載入該角色的所有預設技能和必選規則。

### 4.8 `teamai hooks` — Hook 系統

```bash
teamai hooks <subcommand> [flags]
```

Hook 是 TeamAI 的事件驅動擴展機制：

```bash
teamai hooks list                           # 列出所有 hooks
teamai hooks add <event> <script>           # 新增 hook
teamai hooks remove <event> <script>        # 移除 hook
teamai hooks test <event>                   # 測試 hook
```

支援的事件：

| 事件 | 觸發時機 | 典型用途 |
|------|---------|---------|
| `pre-recall` | recall 命令執行前 | 注入上下文、修改查詢 |
| `post-recall` | recall 命令執行後 | 過濾結果、記錄日誌 |
| `pre-push` | push 命令執行前 | 自動 lint、衝突檢測 |
| `post-push` | push 命令執行後 | 通知、審計日誌 |
| `pre-pull` | pull 命令執行前 | 備份本地版本 |
| `post-pull` | pull 命令執行後 | 自動 reload Agent 配置 |
| `on-import` | import 抽取知識時 | 自動標記、自動分類 |

Hook 腳本範例（`.teamai/hooks/post-recall.sh`）：

```bash
#!/usr/bin/env bash
# 自動把 recall 結果記錄到審計日誌
set -euo pipefail

QUERY="$1"
RESULTS="$2"
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

echo "${TIMESTAMP} query=\"${QUERY}\" results=${RESULTS}" >> ~/.teamai/audit.log

# 對敏感查詢自動模糊化
if echo "${QUERY}" | grep -iE "password|secret|token|api[_-]?key"; then
    echo "[redacted-sensitive-query]" >> ~/.teamai/audit.log
fi
```

### 4.9 `teamai mcp` — MCP 配置

```bash
teamai mcp <subcommand> [flags]
```

MCP（Model Context Protocol）是 TeamAI 與 Agent 的標準介面：

```bash
teamai mcp serve                            # 啟動 TeamAI MCP 伺服器
teamai mcp add <name> <command> [args...]   # 新增外部 MCP 伺服器
teamai mcp list                             # 列出所有 MCP 伺服器
teamai mcp remove <name>                    # 移除 MCP 伺服器
teamai mcp test <name>                      # 測試 MCP 連線
```

TeamAI 同時扮演**兩個角色**：

1. **MCP 伺服器**：向 Agent 暴露 `recall`、`search`、`subscribe` 等工具；
2. **MCP 客戶端**：連接其他 MCP 伺服器（如 GitHub MCP、Postgres MCP）。

`mcp/servers.yaml` 範例：

```yaml
servers:
  # TeamAI 自己的 MCP 伺服器（給 Claude Code 等用）
  - name: teamai
    command: teamai
    args: [mcp, serve]
    transport: stdio
    
  # 外部 MCP 伺服器
  - name: github
    command: npx
    args: [-y, @modelcontextprotocol/server-github]
    env:
      GITHUB_TOKEN: ${GITHUB_TOKEN}
    transport: stdio
    
  - name: postgres-readonly
    command: npx
    args: [-y, @modelcontextprotocol/server-postgres]
    env:
      DATABASE_URL: ${DATABASE_READONLY_URL}
    transport: stdio
```

### 4.10 `teamai dashboard` — 本地 Dashboard

```bash
teamai dashboard [flags]
```

啟動本地 Web Dashboard（預設 `http://localhost:7842`），提供：

- **技能庫總覽**：所有技能的使用統計、最近更新、貢獻者；
- **規則覆蓋率**：哪些目錄被規則覆蓋，哪些規則從未被 recall；
- **知識圖譜視覺化**：互動式概念關係圖；
- **團隊活動流**：誰 push 了什麼、誰 recall 了什麼；
- **健康度報告**：孤立節點、過時內容、衝突警告。

```bash
teamai dashboard --port 8080          # 指定埠
teamai dashboard --no-browser         # 不自動開瀏覽器
teamai dashboard --readonly           # 唯讀模式
```

整個 Dashboard 是**純本地**的，不會向任何遠端發送資料。

### 4.11 `teamai doctor` — 健康診斷

```bash
teamai doctor [flags]
```

診斷 TeamAI 安裝和倉庫的健康狀態：

```bash
$ teamai doctor
[OK]   teamai 0.4.2 (latest)
[OK]   git 2.42.0
[OK]   .teamai/ structure is valid
[OK]   skills/ contains 12 skills
[WARN] rules/no-console-log.md is 180 days old, never recalled
[WARN] graph/concepts.yaml has 3 orphan nodes
[FAIL] subscriptions.yaml references missing skill: postgres-15-patterns
[INFO] consider running `teamai import` to add recent learnings
```

這是一個非常實用的命令——尤其在多人協作環境中，能快速發現配置漂移。

---

## 五、跨團隊技能訂閱機制

TeamAI 最強大的特性之一是**跨團隊技能訂閱**——一個團隊可以訂閱另一個團隊的技能庫，自動獲得更新。

### 5.1 訂閱模型

```yaml
# subscriptions.yaml
subscriptions:
  - source: team://github.com/your-org/platform-skills
    type: skills
    ref: main
    refresh: daily
    scope: ./skills/platform
    
  - source: team://github.com/external-org/ai-best-practices
    type: rules
    ref: v1.2.0
    refresh: weekly
    scope: ./rules/external
    
  - source: team://gitlab.internal.company.com/ai/incident-response
    type: skills
    ref: main
    refresh: on-demand
    scope: ./skills/incident
    verify-commit: true
```

### 5.2 訂閱更新策略

- **latest**：永遠跟蹤 main 分支；
- **pinned**：固定在某個 tag/commitsha（推薦生產環境）；
- **semver**：跟蹤語意化版本（`^1.2.0`）；
- **time-windowed**：在特定時間視窗內跟蹤（如工作時間 vs 維護時間）。

### 5.3 版本解析

```bash
$ teamai sync --dry-run
[plan] platform-skills: 12 → 15 skills (3 new)
[plan] ai-best-practices: 8 → 8 rules (no change)
[plan] incident-response: 4 → 5 skills (1 updated)

Breaking changes detected:
  - platform-skills removed: legacy-jest-config (replaced by: vitest-setup)
  
Apply? [y/n/selective]
```

### 5.4 衝突解決

當兩個訂閱源提供同名但內容不同的技能時：

```bash
$ teamai sync
[conflict] skill: react-patterns
  source A (platform-skills): uses TanStack Query
  source B (frontend-best-practices): uses SWR
  
Strategies:
  ours: keep version A
  theirs: keep version B
  merge: create react-patterns.merged/
  rename: keep both as react-patterns.platform and react-patterns.frontend
  
Choose strategy [ours/theirs/merge/rename]: merge
```

### 5.5 治理與審計

```bash
teamai subscriptions list                    # 列出所有訂閱
teamai subscriptions audit                   # 審計訂閱源的可信度
teamai subscriptions verify                  # 驗證 commit 簽章
teamai subscriptions pin <source> <version>  # 固定版本
```

企業用戶可以透過 Git 本身的 PR review 流程審批所有訂閱變更。

---

## 六、Hook 與 MCP 擴展機制

### 6.1 Hook 系統詳解

TeamAI 的 Hook 系統是一個**輕量級事件鉤子框架**，目的是在不修改核心程式碼的情況下擴展行為。

#### 6.1.1 Hook 生命週期

```
User Command → Pre-Hook → Core Logic → Post-Hook → Output
                    ↓                        ↓
                Can modify                 Can transform
                inputs/abort               outputs/log
```

#### 6.1.2 Hook 編寫範例

`.teamai/hooks/pre-recall.py`：

```python
#!/usr/bin/env python3
"""在 recall 之前根據當前 git branch 自動調整查詢。"""
import sys, json, subprocess

payload = json.loads(sys.stdin.read())
query = payload["query"]

# 自動擴展查詢上下文
branch = subprocess.check_output(
    ["git", "rev-parse", "--abbrev-ref", "HEAD"]
).decode().strip()

if branch.startswith("feature/"):
    payload["query"] = f"{query} (current branch: {branch})"
    payload["scope"] = "local"  # 只查本地，不查訂閱源

print(json.dumps(payload))
```

#### 6.1.3 Hook 最佳實踐

- **冪等**：重複執行結果相同；
- **快速**：單次執行 < 100ms；
- **可失敗**：失敗時不能阻塞核心流程；
- **無副作用**：不修改 core 狀態（讀寫透過標準 API）。

### 6.2 MCP 深度整合

TeamAI 與 MCP 的整合有三個層次：

#### 6.2.1 作為 MCP 伺服器

TeamAI 對 Agent 暴露以下標準 MCP 工具：

| 工具名 | 描述 |
|--------|------|
| `recall` | 根據查詢返回最相關的技能、規則、知識 |
| `search_skills` | 全文搜尋技能庫 |
| `search_rules` | 全文搜尋規則庫 |
| `get_skill` | 根據名稱獲取完整技能內容 |
| `get_rule` | 根據名稱獲取完整規則 |
| `list_subscriptions` | 列出當前所有訂閱源 |
| `sync_subscriptions` | 同步所有訂閱源 |
| `import_conversation` | 從對話歷史導入知識 |

Claude Code 設定（`~/.claude/mcp_servers.yaml`）：

```yaml
mcpServers:
  teamai:
    command: teamai
    args: [mcp, serve]
    env: {}
```

#### 6.2.2 作為 MCP 客戶端

TeamAI 可連接任何相容 MCP 的伺服器，把外部工具整合進來：

```yaml
# .teamai/mcp/servers.yaml
servers:
  - name: github
    command: npx
    args: [-y, @modelcontextprotocol/server-github]
    
  - name: jira
    command: npx
    args: [-y, @modelcontextprotocol/server-jira]
    
  - name: sentry
    command: npx
    args: [-y, @modelcontextprotocol/server-sentry]
```

#### 6.2.3 跨伺服器編排

一個強大的模式是**讓 TeamAI recall 的結果觸發 MCP 工具呼叫**：

```yaml
# .teamai/hooks/post-recall.sh
#!/usr/bin/env bash
# recall 到「線上事故」相關規則時，自動從 Sentry 拉取最近事故
if echo "$RESULTS" | grep -q "incident-response"; then
    npx -y @modelcontextprotocol/server-sentry list-recent-incidents \
        --project production --limit 5
fi
```

這就把「靜態知識」和「動態工具」連接起來了。

---

## 七、與 Claude Code 的整合

TeamAI 與 Claude Code 的整合是最成熟的場景，因為兩者都是 Anthropic 生態（或相容生態）。

### 7.1 自動發現

TeamAI 安裝後會自動偵測 Claude Code：

```bash
$ teamai doctor
[OK] teamai 0.4.2
[OK] Detected Claude Code at ~/.claude/
[OK] MCP server registered: teamai → Claude Code config
[OK] Auto-recall hook installed: ~/.claude/hooks/teamai-recall.sh
```

### 7.2 三種整合模式

#### 7.2.1 MCP 整合（推薦）

透過 MCP 伺服器，Claude Code 可以直接呼叫 TeamAI 的工具：

```
Claude Code 看到的使用者輸入：「幫我重構這個 React 元件」
    ↓
Claude Code 透過 MCP 呼叫 teamai.recall("React 元件重構")
    ↓
TeamAI 返回 3 條最相關的規則/技能
    ↓
Claude Code 自動把這些規則注入 prompt
    ↓
產出符合團隊規範的程式碼
```

#### 7.2.2 CLAUDE.md 自動同步

TeamAI 可以把規則庫自動同步到 `CLAUDE.md`：

```bash
teamai sync --target claude-code
# 生成 ~/.claude/CLAUDE.md
```

生成的 `CLAUDE.md`：

```markdown
# Auto-generated from TeamAI

## Project Rules

- 不要在 JSX 中使用 inline 函式（ref: rules/no-inline-functions-in-jsx.md）
- TypeScript 必須開啟 strict 模式（ref: rules/ts-strict-mode.md）
- ...

## Available Skills

- react-patterns (latest: v2.1.0)
- postgres-optimization (latest: v1.4.2)
- ...
```

#### 7.2.3 Hook 整合

TeamAI 可以在 Claude Code 的生命週期事件上掛 hook：

```yaml
# ~/.claude/settings.json
{
  "hooks": {
    "PreToolUse": [{
      "matcher": "Write|Edit",
      "hooks": [{
        "type": "command",
        "command": "teamai recall --inject --query '$TOOL_INPUT'"
      }]
    }]
  }
}
```

效果：每次 Claude Code 準備寫檔案前，自動 recall 相關規則並注入上下文。

### 7.3 跨專案記憶體

Claude Code 的原生記憶體是按專案隔離的，TeamAI 把它升級為**跨專案共享**：

```bash
~/.claude/CLAUDE.md           # 個人全域（本機）
~/proj-a/.claude/CLAUDE.md    # 專案 A
~/proj-b/.claude/CLAUDE.md    # 專案 B

~/.teamai/rules/global.md     # TeamAI 全域規則（跨專案）
~/.teamai/rules/frontend.md   # 團隊規則（透過訂閱）
~/proj-a/.teamai/rules/local.md # 專案 A 本地規則
```

TeamAI 會根據當前專案自動合併最相關的規則層級。

---

## 八、設計哲學總結：優點與侷限

### 8.1 核心優勢

#### 8.1.1 工程師友善

- **零基礎設施**：5 分鐘上手；
- **Git 原生**：複用現有工作流；
- **純本地**：無安全審批壓力；
- **MCP 標準**：不鎖定任何 Agent。

#### 8.1.2 架構優雅

- **單一二進位**（Go）：無執行時依賴；
- **介面抽象乾淨**：GitProvider、AgentAdapter 易擴展；
- **雙驅動檢索**：BM25 + 圖譜兼顧實用與深度；
- **模組邊界清晰**：cmd/internal/pkg 三層分得乾淨。

#### 8.1.3 治理理念先進

- **知識從摩擦中來**：解決「寫文件沒動力」的痛點；
- **隱私優先**：尊重企業合規需求；
- **可審計**：所有操作可追溯；
- **社區導向**：Apache 2.0 開源。

### 8.2 侷限與權衡

#### 8.2.1 Git 作為知識庫的權衡

**優點**：版本化、可審計、離線可用。

**代價**：
- 大型二進位資產（截圖、錄影、PDF）不適合放 Git，TeamAI 透過 LFS 緩解但不完備；
- 全文搜尋在大規模倉庫（>10K skills）會變慢，需要 BM25 索引幫助；
- 衝突解決複雜度隨訂閱源數量線性增長。

#### 8.2.2 輕量級知識圖譜的侷限

**優點**：品質可控、可審計、維護成本低。

**代價**：
- 無法處理大規模實體關係（>1000 節點）；
- 不支援本體推理（OWL/RDF）；
- 跨團隊概念對齊需要人工。

對大多數團隊（10-50 人，數百技能）來說剛好，但對超大規模組織（>1000 技能，複雜依賴關係）需要自建擴展。

#### 8.2.3 對個人開發者的摩擦

**門檻**：
- 需要理解 Git 進階概念（submodule、git-crypt）；
- 需要懂 MCP 協議才能深度客製化；
- 需要 LLM API key 才能用 `import`。

對個人開發者可能略重，但對企業團隊剛好。

### 8.3 與同類工具對比

| 特性 | TeamAI | Notion AI | Cursor Rules | Claude Code Skills |
|------|--------|-----------|--------------|---------------------|
| 版本化 | Git 原生 | 弱 | 弱 | 弱 |
| 跨 Agent | 所有主流 Agent | 鎖定 Notion | 鎖定 Cursor | 鎖定 Claude Code |
| 知識檢索 | BM25 + 圖譜 | 向量 | 無 | 無 |
| 隱私 | 純本地 | 雲端 | 雲端 + 本地 | 雲端 + 本地 |
| 零基礎設施 | 是 | 否 | 是 | 是 |
| 企業合規 | Git 訪問控制 | 企業版 | 企業版 | 企業版 |
| 學習曲線 | 中 | 低 | 低 | 低 |

TeamAI 的差異化：**唯一一個把 Git 作為一等公民、跨 Agent 中立、純本地的團隊級 Agent Harness**。

---

## 九、快速入門教程

### 9.1 安裝

#### 9.1.1 一鍵安裝（macOS / Linux）

```bash
curl -fsSL https://get.teamai.dev | sh
```

#### 9.1.2 Homebrew

```bash
brew install teamai
```

#### 9.1.3 從源碼

```bash
git clone https://github.com/tencent/teamai.git
cd teamai
make install
```

#### 9.1.4 驗證

```bash
$ teamai --version
teamai 0.4.2 (built 2026-08-15, go1.22)

$ teamai doctor
[OK] All systems operational
```

### 9.2 第一個團隊倉庫

```bash
# 1. 建立並初始化倉庫
mkdir ~/my-team-knowledge && cd ~/my-team-knowledge
git init
teamai init --team my-team

# 2. 新增第一條規則
cat > .teamai/rules/typescript-strict.md <<'EOF'
# TypeScript Strict Mode

所有新專案必須開啟 tsconfig.json 的 strict 模式：

\`\`\`json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true
  }
}
\`\`\`
EOF

# 3. 推送到遠端
git add .teamai
git commit -m "feat: add typescript-strict rule"
git remote add origin git@github.com:your-org/team-knowledge.git
git push -u origin main

# 4. 團隊成員拉取
cd ~/work/my-project
teamai pull team://github.com:your-org/team-knowledge.git
```

### 9.3 與 Claude Code 整合

```bash
# 自動註冊 MCP 伺服器
teamai integrate claude-code

# 驗證整合
teamai doctor
[OK] Claude Code integration detected
[OK] MCP server: teamai → ~/.claude/mcp_servers.json
[OK] Auto-recall hook: ~/.claude/hooks/teamai-recall.sh
```

重啟 Claude Code，然後試試：

```
「幫我寫一個 React 元件，使用團隊的 hooks 規範」
```

Claude Code 會自動透過 TeamAI recall 相關規則和技能。

### 9.4 訂閱團隊外的技能庫

```bash
# 訂閱騰訊官方技能庫
teamai pull team://github.com/tencent/teamai-skills --subscribe

# 訂閱社群技能庫
teamai pull team://github.com/teamai-community/awesome-skills --subscribe

# 同步所有訂閱
teamai sync

# 列出所有訂閱
teamai subscriptions list
```

### 9.5 從對話歷史導入知識

```bash
# 從 Claude Code 最近 50 條對話抽取
teamai import --from claude-code --last 50

# 互動式確認要沉澱哪些
# (見 4.5 節範例輸出)

# 確認後自動 push
teamai push
```

### 9.6 為角色配置自動 recall

```yaml
# .teamai/roles.yaml
roles:
  - id: fullstack-engineer
    description: 全端工程師
    default-skills:
      - react-patterns
      - nodejs-best-practices
      - postgres-optimization
    required-rules:
      - typescript-strict
      - no-console-log
```

```bash
# 指派角色
teamai roles assign alice@company.com fullstack-engineer

# 模擬該角色的 recall 結果
teamai roles simulate fullstack-engineer --task "設計一個新的使用者系統"
```

---

## 十、技術棧與工程實踐

### 10.1 技術棧選擇

| 元件 | 選型 | 理由 |
|------|------|------|
| 語言 | Go 1.22+ | 單一二進位、並行模型、跨平台編譯簡單 |
| CLI 框架 | Cobra + Viper | 業界標準、生成文件完善 |
| TUI | Bubble Tea | 現代 Go TUI 框架 |
| Web Dashboard | Wails (Go + Web) | 輕量、本地、無外部依賴 |
| 全文索引 | SQLite FTS5 | 內建、零依賴、高效能 |
| 知識圖譜 | 自研 YAML + 索引 | 輕量、可審計 |
| Git 操作 | go-git | 純 Go 實作、無 CGo |
| MCP 實作 | mcp-go | 官方相容 |
| LLM 客戶端 | 多 provider 抽象 | 支援 Claude/GPT/DeepSeek 等 |

### 10.2 性能工程

#### 10.2.1 並行索引

```go
// internal/knowledge/indexer.go
func (i *Indexer) Build(ctx context.Context) error {
    var wg sync.WaitGroup
    sem := make(chan struct{}, runtime.NumCPU())
    
    for _, skill := range i.skills {
        wg.Add(1)
        sem <- struct{}{}
        go func(s Skill) {
            defer wg.Done()
            defer func() { <-sem }()
            i.indexSkill(ctx, s)
        }(skill)
    }
    wg.Wait()
    return nil
}
```

1000 個技能的倉庫，完整索引時間 < 5 秒。

#### 10.2.2 增量更新

只對變動的檔案重新索引，透過 Git 的 `git diff` 識別變更集。

#### 10.2.3 記憶體優化

BM25 索引預計算並持久化到 SQLite，避免每次啟動重新計算。

### 10.3 安全工程

#### 10.3.1 審計日誌

```go
// internal/audit/logger.go
func (l *Logger) Log(event Event) {
    entry := AuditEntry{
        Timestamp: time.Now().UTC(),
        User:      l.currentUser,
        Action:    event.Action,
        Target:    event.Target,
        Hash:      sha256.Sum256(event.Payload),
        SessionID: l.sessionID,
    }
    l.log.Write(entry)
}
```

所有敏感操作（push、pull、import、access）都寫入 `~/.teamai/audit.log`。

#### 10.3.2 敏感資料過濾

```go
// 自動識別並遮罩敏感欄位
func Sanitize(content string) string {
    patterns := []*regexp.Regexp{
        regexp.MustCompile(`(?i)(password|secret|token|api[_-]?key)["\s:]+[^\s"]+`),
        regexp.MustCompile(`(?i)bearer\s+[A-Za-z0-9\-._~+/]+=*`),
        regexp.MustCompile(`\b\d{16}\b`), // 信用卡
    }
    for _, p := range patterns {
        content = p.ReplaceAllString(content, "[REDACTED]")
    }
    return content
}
```

#### 10.3.3 加密支援

整合 `git-crypt` 和 `SOPS`，敏感技能可以加密儲存：

```bash
teamai push --encrypt --key-id team-frontend-secrets
```

### 10.4 可觀測性

#### 10.4.1 指標

`teamai metrics` 暴露 Prometheus 相容指標：

```
teamai_recall_total{role="frontend-engineer",status="success"} 1234
teamai_recall_duration_seconds{quantile="0.5"} 0.023
teamai_recall_duration_seconds{quantile="0.99"} 0.156
teamai_skill_usage_total{skill="react-patterns"} 567
teamai_subscription_pull_total{source="platform-skills"} 89
```

#### 10.4.2 追蹤

OpenTelemetry 相容，支援分散式追蹤 Agent 工作流。

### 10.5 測試策略

- **單元測試**：核心邏輯覆蓋率 > 80%；
- **整合測試**：所有命令在 CI 中端到端驗證；
- **屬性測試**：用 `testing/quick` 驗證 BM25 索引的不變量；
- **快照測試**：CLI 輸出穩定性驗證；
- **模糊測試**：用 `go-fuzz` 測試 recall 解析的健壯性。

### 10.6 CI/CD

GitHub Actions 工作流：

- **PR 檢查**：lint、test、benchmark；
- **發版**：語意化版本、CHANGELOG 自動生成；
- **簽章**：所有 release 用 cosign 簽章；
- **多平台**：macOS（intel+arm）、Linux（amd64+arm64）、Windows。

---

## 十一、總結與展望

### 11.1 TeamAI 解決了什麼？

在 Agent 工具的「個人駕馭」階段成熟之後，下一步必然是「**團隊駕馭**」——讓 Agent 不只是一個個人工具，而是團隊的協作成員。

TeamAI 在這個轉折點上提供了一個**務實、可落地**的方案：

| 問題 | TeamAI 的回答 |
|------|--------------|
| Agent 技能如何共享？ | Git 倉庫 + 訂閱機制 |
| 團隊規範如何強制？ | 規則庫 + 自動 recall |
| 隱私如何保障？ | 純本地 + Git 訪問控制 |
| 跨 Agent 如何協作？ | MCP 標準介面 |
| 知識如何不過時？ | 從摩擦中來 + 使用統計 |
| 基礎設施成本？ | 零 |

### 11.2 設計哲學的普適價值

TeamAI 的四個核心原則——**Git 原生、零基礎設施、知識從摩擦中來、隱私優先**——其實是**所有優秀開源工具的共同特徵**：

- **Git 原生** ≈ 複用成熟基礎設施（vs 重新發明輪子）；
- **零基礎設施** ≈ 降低使用門檻（vs 企業複雜度）；
- **知識從摩擦中來** ≈ 從真實痛點出發（vs 紙上談兵）；
- **隱私優先** ≈ 尊重使用者主權（vs 資料殖民）。

這些原則不僅適用於 TeamAI，也適用於其他團隊工具的設計。

### 11.3 未來發展方向

從官方 Roadmap 推測，未來可能的方向：

1. **AI 輔助治理**：用 LLM 自動建議哪些規則過時、哪些技能低使用、哪些衝突需要仲裁；
2. **聯邦學習**：跨團隊共享使用模式（脫敏後），推薦最適合的技能組合；
3. **WebAssembly 沙盒**：讓 recall 結果能執行（而不只是文字），如自動生成程式碼片段；
4. **時序知識庫**：把「事實」和「時間」綁定，支援「2025 年我們用 X 庫，2026 年遷移到 Y 庫」的時序推理；
5. **標準化互通**：與 AGENTS.md、`.cursorrules`、`CLAUDE.md` 等標準雙向轉換。

### 11.4 給讀者的建議

如果你是：

- **個人開發者**：先試試 `teamai init` + `teamai integrate claude-code`，5 分鐘體驗；
- **小團隊（5-20 人）**：從訂閱官方技能庫開始，逐步沉澱自己的規則；
- **大企業**：先用 `teamai doctor` 評估現有 `.claude/`、`AGENTS.md` 存量，制定遷移計劃；
- **Agent 開發者**：研究 TeamAI 的 AgentAdapter 介面，讓你的 Agent 自動支援團隊知識層。

### 11.5 最後一句話

> **Agent Harness 的下一步，是把駕馭從個人能力變成團隊資產。**

TeamAI 不試圖取代 Claude Code、Codex、CodeBuddy——它試圖讓這些工具**一起**為團隊工作。這是一個謙遜而野心勃勃的目標：用 Git 的智慧，把分散的 Agent 編織成一張協作網。

如果你對 Agent 團隊化有興趣，這個專案值得深入研究。

---

## 附錄：常用命令速查

```bash
# 初始化
teamai init [--team <name>] [--provider <name>]

# 推送
teamai push [--type skill|rule|memory|graph] [--name <name>]

# 拉取
teamai pull <team://url> [--subscribe] [--strategy ours|theirs|merge]

# 同步所有訂閱
teamai sync [--dry-run]

# 檢索
teamai recall <query> [--top <n>] [--inject]

# 導入知識
teamai import --from <source> [--last <n>] [--interactive]

# 團隊管理
teamai members add|remove|list|grant|revoke
teamai roles list|show|assign|simulate

# 擴展
teamai hooks list|add|remove|test
teamai mcp serve|add|list|remove|test

# 診斷
teamai doctor [--fix]
teamai dashboard [--port <n>]

# 整合
teamai integrate claude-code|codex|codebuddy|cursor

# 訂閱管理
teamai subscriptions list|audit|verify|pin
```

## 參考資料

- **官方倉庫**：[github.com/tencent/teamai](https://github.com/tencent/teamai)
- **官方文件**：[docs.teamai.dev](https://docs.teamai.dev)
- **技能市場**：[skills.teamai.dev](https://skills.teamai.dev)
- **MCP 規範**：[modelcontextprotocol.io](https://modelcontextprotocol.io)
- **相關專案**：[github.com/tencent/teamai-skills](https://github.com/tencent/teamai-skills)（官方技能庫）