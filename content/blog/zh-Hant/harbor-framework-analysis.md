---
title: "Harbor Framework 深度解析：給 AI 造一座「考試院」— 從 Turing-Bench 到 Harbor 的進化之路"
description: "全面解析 Harbor Framework（laude-institute 出品）：一套讓 AI Agent 在『容器考場』裡被公平評測、深度閱讀原文你都能聽懂的开源框架。本文用最簡單的比喻講清 Terminal-Bench 2.0 官方評測工具 Harbor 的核心概念（任務/資料集/Agent/Trial/Job）、提供了詳細安裝與執行教學（含 Docker 本機跑 + Daytona 雲端 32 並發）、歸納六大設計哲學（模組化介面、雲沙箱橫向擴展、評測資料管道一體化、預設 Linux、防作弊、RewardKit 輕量驗證），並總結『評測即基礎設施』『先跑通最小端到端』等核心觀點，附帶 LLM-as-a-Judge 與 MCP 側車任務兩個真實教學的亮點。"
date: "2026-08-09"
author: "TopDigg Research Team"
tags: ["Harbor", "Terminal-Bench", "AI Agent", "Benchmark", "LLM", "Evaluation", "Agent Framework", "Terminal-Bench 2.0", "Claude Code", "Daytona", "RewardKit", "MCP", "Docker", "Machine Learning"]
categories: ["深度解析"]
keywords: ["Harbor Framework", "Terminal-Bench 2.0", "AI Agent 評測", "基準測試", "LLM eval", "容器化任務", "Daytona 雲沙盒", "RewardKit", "LLM-as-a-Judge", "Agent 訓練", "SFT", "RL", "提示詞優化", "Turing Bench", "Claude Code 評測"]
---

# Harbor Framework 深度解析：給 AI 造一座「考試院」—— 從 Terminal-Bench 到 Agent 評測的完整之路

> **核心思想：** AI 也會有「畢業考試」。Harbor 就是給 AI Agent 造的一間「考試院」——把每個任務變成一份考卷（容器環境 + 指令 + 自動判卷），讓不同廠商的 AI Agent（Claude Code、Codex、Gemini CLI……）在同一考場裡公平比分數，用分數決定誰更像「真會幹活的人」。它還把 Terminal-Bench 2.0（終端操作基準）變成了官方考場，讓「AI 會不會用終端」第一次有了科學的、可重現的、可橫向擴展的度量衡。

---

## 一、這是什麼？（小學生都能懂版）

想像你有一群 AI 小朋友，他們都想當「程式設計師助理」。

- 有的會用電腦鍵盤刷刷打字；
- 有的會看教學；
- 有的會把檔案打開、改一改、再儲存。

但問題來了：**你怎麼知道誰真的會幹活？**

如果你只是問他們：「你會不會？」——每個 AI 都會拍胸脯說「會！」。就像考試前問小朋友「你複習好了嗎」，誰都會說「複習好了」。

**Harbor 就是那個「出考卷的老師」。**

它做三件事：

1. **出卷子**：把一條真實工作指令（比如「在這個資料夾裡找到 bug 並修復它」）裝進一個獨立的「小房間」（容器）裡，房間裡配好電腦、工具、資料。
2. **監考**：讓 AI Agent 進房間幹活，它在旁邊看著，把 AI 每一步操作都記錄下來（這就是「trajectory」，考試軌跡）。
3. **判分**：有專門的「評分老師」（verifier）檢查房間裡的結果 — AI 改對檔案、裝對軟體、寫對了測試，就記 1 分，否則 0 分；還可以打出細膩的分數（比如「幽默感 0.75 分」）。

考完一個 AI，再考下一個，誰分高誰就是更棒的「實習生」。

這套系統不但能「考試打分」，還能做三件大事：

- **挑人才**：比較好幾個 AI 誰強（benchmark 排行榜）；
- **練人才**：把高分的考試軌跡收集起來，訓練 AI 變得更強（SFT / RL 強化學習）；
- **抓毛病**：你的 AI 老在某個環節犯錯？用評測找到它到底在哪個步驟弱，再用數據優化它的提示詞（prompt optimization）。

所以 Harbor 的名字很貼切：**海港（harbor）** — 所有 AI 的「智力輪船」都到這裡來靠岸、檢修、再出發。

---

## 二、專案說明

### 2.1 基本資訊

- **專案名稱**：Harbor
- **作者/維護者**：laude-institute（Anthropic 的研究機構，也是 Terminal-Bench 的原版團隊之一）
- **開源地址**：[https://github.com/laude-institute/harbor](https://github.com/laude-institute/harbor)
- **官方文件**：https://www.harborframework.com
- **授權條款**：MIT
- **安裝方式**：pip / uv 一鍵安裝，零設定跑第一個評測
- **技術棧**：Python（CLI + 介面）、Docker（本機容器環境）、cloud sandbox（Daytona / Modal / E2B / Runloop 等）
- **定位**：AI Agent 的評測、後訓練（post-training）與提示詞優化的統一框架

### 2.2 它要解決什麼問題？

Harbor 的官方文件在 *Motivation* 部分說得很明白：**2025 年 5 月 Terminal-Bench 發佈後，作者發現大家用它做的事超出了想像**——有人拿它做自訂評測、有人用它優化提示詞、有人在跑 RL（強化學習）、有人在生成 SFT（監督微調）訓練軌跡，還有人把它接進 CI/CD 做 Agent 回歸測試。

與此同時，作者也痛苦地發現：**「定義和管理容器化的任務」在規模上很難。** 於是他們乾脆把 Terminal-Bench 背後那套評測引擎拿出來，重構成一個通用的「評測框架」——這就是 Harbor。

所以 Harbor 不是一個新的「任務集」，而是**造考場的方法論**：你可以用它跑現成榜單（Terminal-Bench、SWE-Bench Verified），也可以定義自己的任務、自己的環境、自己的 Agent。

### 2.3 六個核心概念（全部用大白話）

用一個「考試院」比喻講透 Harbor 的全部概念：

- **任務（Task）= 一張考卷**：一段指令 + 一個專屬小房間（容器環境）+ 一道自動判分題（測試腳本）
- **資料集（Dataset）= 一疊考卷**：一堆 Task 的總和，通常等於一個基準（比如 Terminal-Bench 2.0）
- **Agent = 考生**：一個會復活的 AI 程式。Harbor 開箱內建 99 個主流考生——Claude Code、Codex CLI、Copilot CLI、Gemini CLI、Grok Build、OpenHands 等
- **容器環境（Environment）= 考場房間**：裝著電腦的「狀態」（哪個 OS、裝了什麼軟體、能不能上網）
- **單次嘗試（Trial）= 一次答題**：一個 Agent 對一張考卷的一次完整作答，出來一個分數（reward）
- **任務批次（Job）= 一場大考**：一堆 Trial 並行開考（可跨多個資料集、多個 Agent、多個模型）

---

## 三、詳細教學：從零開始跑 Terminal-Bench 2.0

### 第一步：安裝 Harbor（一條命令）

推薦用 `uv`（Python 的快速套件管理器）：

```bash
uv tool install harbor
```

裝完檢查一下：

```bash
harbor --help
```

### 第二步：裝 Docker 並啟動

本機評測預設用 Docker 當「小房間」。裝好 Docker 並確保它在執行。然後就可以跑 Terminal-Bench 2.0 的第一道「驗證卷」——跑一遍官方標準答案（Oracle）：

```bash
harbor run -d terminal-bench/terminal-bench-2 -a oracle
```

> **這一步的意義：** 你能跑動 oracle（標準答案解法），就說明 Harbor 安裝正確、容器環境就緒。Oracle 是滿分卷，跑通它等於考場自檢合格。

### 第三步：用真 Agent 跑（本機）

試試用 Claude Code 作為考生，模型選 `anthropic/claude-haiku-4-5`（快且省錢）：

```bash
harbor run \
  -d terminal-bench/terminal-bench-2 \
  -m anthropic/claude-haiku-4-5 \
  -a claude-code
```

這條命令會自動下載資料集、啟動容器、讓 Claude Code 進考場作答、跑判分，最後輸出分數報告。

### 第四步：跑自己的資料集（本地任務資料夾）

不想用官方資料集？把一堆自己的 Task 目錄傳給 `-p` 就可以：

```bash
harbor run -p "/path/to/dataset" -m "model" -a "agent"
```

### 第五步：雲上橫向擴展（重要！）

官方給出重要實戰建議：**沙盒 Agent 評測通常很慢**（一次評測要幾十輪對話，每輪命令都要花時間）。要加速實驗，唯一的辦法就是橫向開更多「考場」。 ——用雲端沙箱提供商（比如 Daytona）：

```bash
export DAYTONA_API_KEY="<your-daytona-api-key>"
export ANTHROPIC_API_KEY="<your-anthropic-api-key>"
harbor run \
  -d terminal-bench/terminal-bench-2 \
  -m anthropic/claude-haiku-4-5 \
  -a claude-code \
  --env daytona \
  -n 32
```

`-n 32` 表示同時開 32 個考場並行考試。用 API 模型跑雲端沙箱後，限速瓶頸從 CPU 變成網路 I/O，所以並行數可以遠超你本機核心數——這是官方強烈推薦的做法。

### 第六步：看排行榜 & 提交成績

- **看排行榜**：https://tbench.ai/leaderboard
- **提交你的成績**：官方把排行榜日誌存放在 [HuggingFace 資料倉庫](https://huggingface.co/datasets/alexgshaw/terminal-bench-2-leaderboard)，按它 README 裡的說明開一個 PR 提交即可。

---

## 四、進階教學（深度看的都在這）

### 4.1 自己寫「任務」（考卷）

一條任務就是一個目錄，用一條命令初始化骨架：

```bash
harbor init --task "org/name"
```

生成的結構像一份規範的卷子：

    task.toml             # 卷子的「個人資訊」+ 考生配置
    instruction.md        # 題目（給 AI 的指令）
    environment/          # 考場：Dockerfile 定義系統
    solution/             # 標準答案（可選，Oracle 用）
    tests/                # 判分腳本（test.sh → 產生 reward）

判分時腳本在容器裡跑，並把分數寫進 `/logs/verifier/reward.txt`（寫 `1` 就成功，寫 `0` 失敗）或 `reward.json`（可同時多個指標，如 `{"runtime_sec": 1.23, "accuracy": 0.95}`）。

**一條對判分的建議**（官方原文精神）：測試腳本裡盡量用**絕對路徑**，避免相對路徑出錯。

### 4.2 想考 Linux / Windows / 多容器？

- **系統**：`task.toml` 裡 `[environment].os = "linux"`（預設）或 `"windows"`；
- **多容器**（比如旁邊掛一個 MCP Server、資料庫）：在 `environment/` 放 `docker-compose.yaml`，Harbor 會自動合併。目前多容器只在本地 Docker 環境支援，雲端沙箱提供商正在開發中。

### 4.3 把你自己的 Agent 塞進來考

兩種型別：

**外部 Agent（跑在電腦上，透過 exec 遠端指揮容器）：**

```python
from harbor.agents.base import BaseAgent

class MyExternalAgent(BaseAgent):
    @staticmethod
    def name() -> str:
        return "my-agent"

    async def setup(self, environment):
        # 安裝你的 agent 和工具
        pass

    async def run(self, instruction, environment, context):
        # 在容器裡執行任務
        pass
```

**已安裝 Agent（像 Claude Code 一樣直接裝進容器裡無頭執行）：**

```python
from harbor.agents.installed.base import BaseInstalledAgent

class MyInstalledAgent(BaseInstalledAgent):
    async def install(self, environment):
        await self.exec_as_root(environment, command="apt-get install -y curl")
        await self.exec_as_agent(environment, command="pip install my-agent")

    async def run(self, instruction, environment, context):
        await self.exec_as_agent(environment, command=f"my-agent run '{instruction}'")
```

用你的 Agent 開考：

```bash
harbor run -d "dataset@version" --agent path.to.agent:MyAgent
```

### 4.4 讓 AI 當考官（LLM-as-a-Judge 教學）

有的卷子不能靠「檔案對不對」判分（比如「寫一首搞笑詩」）。Harbor 官方教學教你把法官也換成 LLM：

- 在 `tests/llm_judge.py` 用 Anthropic API（結構化輸出）讀一手卡片，回傳分數；
- 金鑰透過 `task.toml` 的 `[verifier.env]` 注入，原始碼裡不留 key；
- 輸出 `/logs/verifier/reward.json`，例如 `{ "funny": 0.75 }`，還能多個維度：`{ "creativity": 0.9, "humor": 0.7, "grammar": 1.0 }`。

完整範例在 `examples/tasks/llm-judge-example`，直接複製改就行。

### 4.5 讓 MCP Server 當考場旁邊的小助手（MCP Server Task 教學）

想模擬「Agent 要跟外部服務互動」的真實業務？用 Docker Compose 加一個「側車」容器跑 FastMCP Server：

```yaml
services:
  main:
    depends_on:
      mcp-server:
        condition: service_healthy
  mcp-server:
    build: { context: ./mcp-server }
    expose: ["8000"]
    healthcheck:
      test: ["CMD", "python", "-c", "import socket; s=socket.create_connection(('localhost',8000),timeout=2); s.close()"]
```

在 `task.toml` 裡宣告 `[[environment.mcp_servers]]`，Claude Code、Codex 這類相容 Agent 會自動註冊並連接它。整條鏈路（連服務 → 調工具 → 寫結果 → pytest 判分）在 `examples/tasks/hello-mcp` 裡。

### 4.6 RewardingKit：輕量驗證器（判卷工具包）

官方配套了一個**零依賴**的獨立套件 `harbor-rewardkit`，專門給「判卷」設計 UI：

```bash
uv tool install harbor-rewardkit
```

- **程式式**：`rk.file_exists("output.txt")`、`rk.command_succeeds("python main.py")` 等 20+ 內建判分標準；
- **判定式（LLM-judge）**：寫 TOML 檔案讓 Claude / GPT 打分（binary / Likert 5 分）；
- **隔離**：擔心一個判分標準干擾另一個？用 `isolated=True`（overlayfs 唯讀掛載）；
- **多維獎勵**：`correctness`、`structure`、`quality` 分別出分，再聚合一個總分。

---

## 五、設計哲學（作者為什麼把它做成這樣）

通讀官方文件，可以提煉出 6 條明確的「設計信仰」：

**1. 模組化介面，職責單一。**
Environment / Agent / Task 是三個獨立介面，互不假設彼此的實作細節。容器環境也好、雲端也好，只要實作 `BaseEnvironment`，就能插進去當「新房間」。

**2. 「預設預置主流」，拒絕從零造輪子。** 「這世界上已經有 99% 的任務被現成 Agent 跑過」，Harbor 直接把 Claude Code、Copilot CLI、Codex CLI、Gemini CLI、Grok Build、OpenHands 等主流 CLI Agent 全裝進套件裡，使用者開箱即用。

**3. 橫向擴展勝於硬體堆料。** 官方反覆強調：評測耗時長，唯一能加速的方案是橫向鋪開 **雲沙箱（Daytona / Modal / E2B / Runloop / EC2 / Beam……）**，因為跑 API 模型時瓶頸是 I/O 而不是 CPU。

**4. 評測資料=訓練資產（「考卷就是課本來後教學」）。** Harbor 連接 SkyRL、GEPA 等強化學習框架，直接把評測的得分軌跡（trajectories）轉成 SFT 微調資料。考試不是為了給 AI 蓋個章，而是為了讓 AI 學得更好。

**5. 安全與防作弊設進預設。** 判分時借助不同的「考生環境」與「監考環境」（verifier separate），判分程式碼看不到 agent 所在容器，防 Agent 偷看答案；金鑰還用 `${VAR}` 注入，絕不進任務原始碼。

**6. 用最簡結構承載最嚴謹的評判。** 官網文件反覆強調「好任務=簡潔結構（instruction.md / task.toml / 容器 / solution / tests）+ 明確判分檔案」：建議用絕對路徑、給任務版本號、支援多階段逐步判分。複雜評判不應依賴花俏格式，而應依賴清晰約定——這是「最小實作 + 最大可驗證性」的工程美學。

---

## 六、歸納總結：我們的核心觀點

彙整文件與實務，給出 6 條結論性的觀點：

### 觀點 1：AI 評測正在變成「基礎設施」，不再是「研究工具」

Harbor 的誕生標誌著一個趨勢：當 Terminal-Bench 被當作訓練資料、提示詞優化、CI/CD 和 RL 的來源時，**評測變成了整個 AI Agent 開發循環（training → eval → improve）的中樞**。誰掌握了好用的評測框架，誰就掌握了下一次 Agent 能力提升的加速器。

### 觀點 2：容器化是 Agent 評測的「安全網」，不是「可選項」

Agent 要真的動手改環境（裝套件、寫檔案、起服務），跑在容器裡才能：隔離風險、可重現環境、給每個試打獨立小房間。Harbor 把「每個任務一個小容器」設為預設，這是**對 Agent 能力的真實測度**的前提。

### 觀點 3：雲沙箱+並行化是唯一現實加速路線

單個 Agent 評測慢到「不可接受」是常態，而 `-n 32` 這類橫向擴展（I/O bound）是官方認證的加速方式。「機器不夠」不是藉口，預算導向的答案就是雲端跑步。

### 觀點 4：評測判分可以是「多元」的，打分的也可以是 AI

從 `reward.txt` 二進制成績到 `reward.json` 多維分數，再到 LLM-as-a-Judge、RewardKit 的寬容 TOML 判分——**Harbor 把「判分」從一道 yes/no 升級為一種可組合的能力**：程式碼品質、幽默、可用性都能量化。

### 觀點 5：「自帶 Agent」與「自帶任務」是兩個層級的開放

三層開放：用現成的 Agent 跑現成評分集（零程式碼）；用介面接自己的 Agent（少許程式碼）；從頭定義自己的任務+環境（完全掌控）。**開放的最高價值在於：任何人都能變成評測的教育者。**

### 觀點 6：終端（Terminal）是衡量「AI 能不能幹活」的第一考場

Terminal-Bench 2.0 考的不是「會聊天」，而是「在真實終端裡的行為」：裝套件、Debug、改程式碼、查文件。Harbor 的意義在於把「AI 能不能下地幹活」這件原本模糊的事，變成可測量、可比較、可傳承的度量衡——這是這個框架存在的最大價值。

---

## 七、給讀者的一句話

> **別只會讓 AI 聊天，要學會給 AI 打分。** Harbor 的整套設計哲學就是一句話：**把評價變得像開發一樣 —— 模組化、可重現、可擴展。** 當你需要挑選模型、優化提示詞、訓練自己的 Agent 時，先建一個「小考場」，讓數據說話，而不是讓感覺說話。

---

## 參考資料

- Harbor 官方文件 Getting Started：https://www.harborframework.com/docs/getting-started
- Core Concepts：https://www.harborframework.com/docs/core-concepts
- Motivation：https://www.harborframework.com/docs
- Running Terminal-Bench 官方教學：https://www.harborframework.com/docs/tutorials/running-terminal-bench
- LLM-as-a-Judge 教學：https://www.harborframework.com/docs/tutorials/llm-as-a-judge
- MCP Server Task 教學：https://www.harborframework.com/docs/tutorials/mcp-server-task
- RewardKit 文件：https://www.harborframework.com/docs/rewardkit
- Migrating from Terminal-Bench：https://www.harborframework.com/docs/migration
- Terminal-Bench 官方網站：https://tbench.ai
- Repository：https://github.com/laude-institute/harbor