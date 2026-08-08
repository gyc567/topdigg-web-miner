---
title: "PRO-LONG 深度解析：程式化記憶體實現長期推理"
description: "對 PRO-LONG 的全面分析 — 一個為 LLM 代理設計的最小程式化記憶體框架。深入探討其設計理念、單一檔案日誌架構、基於代碼的檢索機制、在 ARC-AGI-3 上的突破性表現，以及為什麼它代表了代理記憶體系統的未來典範。"
date: "2026-08-08"
author: "TopDigg Research Team"
tags: ["PRO-LONG", "LLM 代理", "程式化記憶體", "長期推理", "ARC-AGI-3", "上下文管理", "開源", "AI", "Fable", "代理記憶體"]
categories: ["深度解析"]
keywords: ["PRO-LONG", "程式化記憶體", "LLM 代理", "長期推理", "ARC-AGI-3", "上下文管理", "代理記憶體系統", "基於代碼的檢索"]
---

> **PRO-LONG** 是一個為 LLM 代理設計的最小程式化記憶體框架，透過單一檔案日誌和基於代碼的檢索實現長期推理。這篇全面分析涵蓋了該專案的架構、設計理念、實用教程，以及代理記憶體系統的核心洞察。

---

## 1. 專案概述

### 1.1 什麼是 PRO-LONG？

PRO-LONG 是一個為長期任務設計的最小上下文管理框架。其核心理念優雅而簡單：

1. **將每個觀察、動作和結果追加到單一結構化的 `log.txt` 檔案中**
2. **代理透過程式化方式（grep、Python）檢索和推理這些歷史記錄**
3. **無子代理、無專用檢索機制、系統提示僅約 30 行**

這不是另一個複雜的記憶體系統。PRO-LONG 的設計理念是**簡約主義** — 以最少的程式碼實現最有效的記憶體管理。

### 1.2 核心功能

| 功能 | 詳情 |
|------|------|
| **單一檔案日誌** | 所有歷史記錄儲存在一個 `log.txt` 檔案中 |
| **基於代碼的檢索** | 代理使用 grep、Python 等工具程式化地搜尋歷史記錄 |
| **最小化提示** | 系統提示僅約 30 行，無複雜指令 |
| **雙後端支援** | 同時支援 OpenAI Codex 和 Claude Code 後端 |
| **Docker 沙箱** | 在隔離的容器環境中執行，確保安全性 |
| **ARC-AGI-3 突破** | 在 ARC-AGI-3 上達到 97.4% 的 best@2 |

### 1.3 核心概念

#### 程式化記憶體 — 教會代理「如何查詢」

傳統代理記憶體系統通常採用兩種策略：

1. **上下文注入**：將所有歷史資訊直接放入提示中（導致令牌爆炸）
2. **向量檢索**：使用嵌入模型檢索相關歷史記錄（增加複雜度和延遲）

PRO-LONG 提出了第三種策略：**程式化記憶體**。代理可以使用 grep 和 Python 腳本等工具搜尋和分析歷史記錄，就像程式設計師一樣。

這種方法的優勢：
- **完整性**：無資訊損失地保留完整歷史記錄
- **精確性**：基於代碼的檢索比語義檢索更精確
- **可解釋性**：代理的檢索過程透明且可調試
- **零額外開銷**：無需嵌入模型或向量資料庫

#### 單一檔案日誌 — 簡單即是最有效

PRO-LONG 將所有資訊儲存在單一的 `log.txt` 檔案中，包括：
- 初始棋盤狀態
- 每個動作後的棋盤狀態
- 代理的分析和推理
- 動作執行結果

這種設計看似「簡單」，實際上非常巧妙：
- **無資訊損失**：完整保留所有歷史記錄
- **簡單可靠**：無需複雜的同步或索引機制
- **高效檢索**：grep 在大型檔案上表現出色

#### 30 行提示 — 信任代理能力

PRO-LONG 的系統提示僅約 30 行，不包括：
- 複雜的推理指令
- 詳細的策略指南
- 特定的任務格式要求

它只告訴代理：
1. 你的目標是什麼（解謎題）
2. 歷史記錄儲存在哪裡（`log.txt`）
3. 如何檢索歷史記錄（使用代碼）
4. 如何輸出動作（寫入 `actions.json`）

這種簡約設計體現了對代理能力的信任 — 讓代理自行決定如何檢索和推理。

---

## 2. 設計理念

### 2.1 簡約主義 — 少即是多

PRO-LONG 的核心設計理念是**簡約主義**。當其他記憶體系統不斷增加複雜度時，PRO-LONG 選擇了最簡單的解決方案：

- 一個檔案儲存所有歷史記錄
- 一個提示告訴代理如何使用它
- 一組工具讓代理自行檢索

這種設計的優勢：
- **易於理解**：任何人都能看到系統如何運作
- **易於調試**：出現問題時，只需檢查日誌檔案
- **易於擴展**：新增功能只需修改日誌格式

### 2.2 信任代理 — 讓代碼說話

PRO-LONG 不試圖「教導」代理如何推理。它信任代理的能力，只提供：
- 歷史記錄的存取權限（檔案系統）
- 檢索工具（grep、Python）
- 輸出格式（JSON）

代理可以：
- 使用任何檢索策略
- 編寫任何分析腳本
- 採用任何推理方法

這種設計反映了對現代 LLM 編碼能力的信心。

### 2.3 程式化優於語義 — 精確性勝過模糊性

傳統記憶體系統使用語義檢索（嵌入相似性），但 PRO-LONG 選擇了程式化檢索（grep、Python）。

原因：
- **完全匹配**：grep 可以精確找到包含特定模式的行
- **結構化查詢**：Python 可以解析日誌格式並執行複雜查詢
- **零延遲**：無需嵌入計算或向量搜尋
- **可解釋**：代理的檢索過程完全透明

---

## 3. 詳細教程

### 3.1 安裝與設定

#### 環境要求

- Python 3.12（建議）
- Docker

#### 安裝步驟

```bash
# 克隆倉庫
git clone git@github.com:alexisfox7/PRO-LONG.git
cd PRO-LONG

# 建立虛擬環境
python -m venv .venv
source .venv/bin/activate

# 安裝依賴
pip install -e .
```

#### 建構 Docker 映像

```bash
# Codex 後端
docker build -t rgb-agent/codex-sandbox:latest docker/codex-sandbox
docker build -t rgb-openai-proxy docker/openai-proxy

# Claude Code 後端
docker build -t rgb-agent/claude-sandbox:latest docker/claude-sandbox
docker build -t rgb-anthropic-proxy docker/anthropic-proxy
```

#### 設定環境變數

建立 `.env` 檔案：

```
ARC_API_KEY=...
ANTHROPIC_API_KEY=...   # claude-code 後端
OPENAI_API_KEY=...      # codex 後端
```

### 3.2 基本使用

#### 執行評估

```bash
# 使用 Codex 後端執行所有遊戲
prolong-swarm --suite all -m gpt-5.5 --max-actions 500

# 使用 Claude Code 後端執行所有遊戲
prolong-swarm --suite all --backend claude-code -m claude-opus-4-6

# 執行特定遊戲
prolong-swarm --game ls20,ft09 -m gpt-5.5
```

#### 主要參數

| 參數 | 預設值 | 說明 |
|------|--------|------|
| `--backend` | `codex` | 後端：`codex` 或 `claude-code` |
| `--suite` | — | 遊戲套件：`ls20`、`vc33`、`ft09` 或 `all` |
| `--game` | — | 逗號分隔的遊戲名稱或 ID |
| `--max-actions` | 500 | 每個遊戲的最大動作數 |
| `--model`, `-m` | `claude-opus-4-6` | 基礎模型 |
| `--effort` | `high` | 努力等級（claude-code 後端） |
| `--reasoning-effort` | `none` | 推理努力（codex 後端） |
| `--operation-mode` | `online` | `online` / `offline` / `normal` |

### 3.3 記憶體條件

代理對遊戲歷史記錄的存取由 `--log-window` 和 `--workspace` 控制：

| 條件 | 參數 | 可用歷史記錄 |
|------|------|-------------|
| **prolong** | （預設） | 完整遊戲日誌 |
| **lw25** | `--log-window 25` | 日誌的最後 25 個動作區段 |
| **no-log (in-prompt)** | `--log-window -1` | 無日誌檔案；當前棋盤加入提示 |
| **stateless** | `--workspace stateless` | 完整日誌，但每次呼叫時工作區被清除 |

### 3.4 理解系統提示

PRO-LONG 的系統提示非常簡潔，核心內容如下：

```python
SYSTEM_PROMPT = """
You are a coding agent playing a grid-based puzzle game by writing Python action plans.

Your primary objective is to solve all levels in the game. Your secondary objective is to minimize total cumulative actions used.

`/workspace/logs.txt` is the game log: action headers, tool calls, board states, and your own prior analyses. Parse it **programmatically**, as reading full 64x64 board states from prompt can introduce precision errors.

**Tools**: Read, Write, Edit, Bash, Grep, Glob.

**Workspace**: `/workspace/` persists across calls. `actions.json` is cleared each call; other files accumulate.

**Response format**: a strategic briefing, then
[PLAN]
<2-3 sentence action plan>

**Write `/workspace/actions.json`** with a JSON object `{"actions": ["ACTION6(30,40)", "ACTION1", "RESET"]}` — a list of 1–{action_cap} actions to execute in order.
"""
```

此提示的關鍵要點：
1. **明確目標**：解謎題 + 最小化動作數
2. **指定記憶體位置**：`/workspace/logs.txt`
3. **指定檢索方式**：程式化（grep、Python）
4. **指定輸出格式**：`actions.json`

### 3.5 動作系統

PRO-LONG 支援以下動作：

| 動作 | 說明 |
|------|------|
| `ACTION1` | 上 |
| `ACTION2` | 下 |
| `ACTION3` | 左 |
| `ACTION4` | 右 |
| `ACTION5` | 空格鍵 / 互動 |
| `ACTION6(x,y)` | 點擊列 x（0-63）、行 y（0-63） |
| `ACTION7` | 撤銷 |
| `RESET` | 重置關卡（動作數仍計入） |

### 3.6 輸出結果

評估結果寫入 `evaluation_results/` 目錄。`scorecards/` 目錄包含官方線上成績單。

---

## 4. 核心架構深度分析

### 4.1 專案結構

```
prolong_agent/
├── agent/
│   ├── base.py               # 基礎架構
│   ├── codex_agent.py        # Codex CLI 後端
│   ├── claude_code_agent.py  # Claude Code 後端
│   ├── swarm.py              # CLI 入口點
│   ├── action_queue.py       # 動作執行
│   ├── game_state.py         # 棋盤/日誌格式化
│   └── prompts.py            # 提示模板（~30 行）
├── environment/
│   ├── arcagi3.py            # ARC-AGI-3 API 包裝器
│   ├── runner.py             # 遊戲迴圈
│   └── config.py
├── metrics/
└── utils/
```

### 4.2 核心元件

#### 代理基礎架構

```python
class BaseAgent:
    """基礎代理類別：定義標準介面"""
    
    def __init__(self, model: str, workspace: str):
        self.model = model
        self.workspace = workspace
        self.log_path = f"{workspace}/logs.txt"
    
    def act(self, observation: dict) -> list[str]:
        """根據觀察返回動作列表"""
        # 1. 將觀察追加到日誌
        # 2. 讀取日誌
        # 3. 使用模型生成動作
        # 4. 寫入 actions.json
        pass
```

#### 日誌格式

```log
[INITIAL BOARD STATE]
<64x64 棋盤狀態>

[ACTION1]
Tool call: bash("python3 -c '...'")

[POST-ACTION BOARD STATE]
<更新後的棋盤狀態>

[ACTION2]
Tool call: grep("pattern", "/workspace/logs.txt")
...
```

#### 動作執行

```python
class ActionQueue:
    """動作佇列：依序執行動作"""
    
    def execute(self, actions: list[str]) -> dict:
        results = []
        for action in actions:
            result = self._run_action(action)
            results.append(result)
        return {"results": results, "total": len(results)}
```

### 4.3 檢索機制

PRO-LONG 的檢索完全依賴代理的編碼能力：

```python
# 代理可用的檢索方法

# 1. 使用 grep 搜尋特定模式
grep -n "INITIAL BOARD STATE" /workspace/logs.txt

# 2. 使用 Python 解析日誌
python3 -c "
import re
with open('/workspace/logs.txt') as f:
    content = f.read()
boards = re.findall(r'\[POST-ACTION BOARD STATE\](.*?)\[', content, re.DOTALL)
print(f'Found {len(boards)} board states')
"

# 3. 統計分析
python3 -c "
with open('/workspace/logs.txt') as f:
    lines = f.readlines()
actions = [l for l in lines if l.startswith('[ACTION')]
print(f'Total actions: {len(actions)}')
"
```

### 4.4 性能資料

根據論文和官方評估：

| 指標 | 資料 |
|------|------|
| **ARC-AGI-3 best@2** | 97.4%（Fable 5） |
| **平均改善** | 較基礎代理提升 +18.0 個百分點 |
| **令牌效率** | 較專用框架減少 4.2-5.8 倍 |
| **總成本** | $1,750（25 次 Fable 5 運行） |
| **最高 pass@1** | 76.1% |

---

## 5. 洞察總結

### 5.1 為什麼 PRO-LONG 很重要

PRO-LONG 代表了代理記憶體系統的重要典範轉移。當其他系統不斷增加複雜度時，PRO-LONG 證明了**簡約主義的力量**。

**三個核心洞察**：

1. **程式化記憶體優於語義檢索**：讓代理使用代碼搜尋歷史記錄比嵌入式檢索更精確、更高效
2. **單一檔案日誌足夠**：一個 `log.txt` 檔案可以儲存所有需要的資訊
3. **信任代理能力**：30 行提示足以讓代理自主完成複雜任務

### 5.2 與其他工具的比較

| 功能 | PRO-LONG | LangChain Memory | AutoGPT | BabyAGI |
|------|----------|------------------|---------|---------|
| **記憶體方式** | 單一檔案日誌 | 向量資料庫 | 多檔案 | 任務佇列 |
| **檢索方式** | 代碼（grep/Python） | 語義搜尋 | 檔案讀取 | 優先級排序 |
| **提示長度** | ~30 行 | 複雜 | 複雜 | 中等 |
| **令牌效率** | 極高 | 中等 | 低 | 中等 |
| **ARC-AGI-3** | 97.4% | 未測試 | 未測試 | 未測試 |
| **開源** | ✅ | ✅ | ✅ | ✅ |

### 5.3 使用場景

**最適合**：
- 需要長期記憶的代理任務
- 需要精確檢索的歷史查詢
- 複雜的推理和規劃任務
- 對成本敏感的應用場景

**較不適合**：
- 簡單的單輪對話
- 不需要歷史記憶的任務
- 非編碼代理（需要編碼能力）

### 5.4 設計理念總結

PRO-LONG 的設計理念可以總結為：

1. **簡約主義**：最少的程式碼，最有效的記憶體
2. **信任代理**：讓代理自行決定如何檢索和推理
3. **程式化優於語義**：完全匹配勝過模糊相似性
4. **完整保留**：不遺失任何歷史資訊
5. **零額外開銷**：無需嵌入模型或向量資料庫

---

## 6. 路線圖

基於專案趨勢和代理記憶體系統的發展：

### 短期（3-6 個月）
- 支援更多 LLM 後端
- 改進日誌格式和檢索效率
- 新增更多評估基準

### 中期（6-12 個月）
- 多代理協作記憶體
- 增量日誌壓縮
- 跨會話記憶體持久化

### 長期（1-2 年）
- 自主記憶體管理代理
- 跨組織記憶體共享
- 通用長期推理框架

---

## 7. 結論

PRO-LONG 是一個突破性的代理記憶體框架，透過簡約設計實現了突破性表現。單一檔案日誌、基於代碼的檢索、30 行提示 — 這些看似「簡單」的設計在 ARC-AGI-3 上達到了 97.4% 的準確率。

**核心價值**：
- **簡約主義**：最少的程式碼，最有效的記憶體
- **程式化檢索**：精確、高效、可解釋
- **完整保留**：不遺失任何歷史資訊
- **零額外開銷**：無需嵌入模型

**為什麼選擇 PRO-LONG？**
- 開放透明（MIT 許可證）
- 簡約設計，易於理解和調試
- 基於代碼的檢索，精確且高效
- 在 ARC-AGI-3 上驗證的突破性表現

**立即開始**：
```bash
# 克隆倉庫
git clone git@github.com:alexisfox7/PRO-LONG.git
cd PRO-LONG

# 安裝
python -m venv .venv
source .venv/bin/activate
pip install -e .

# 執行評估
prolong-swarm --suite all -m gpt-5.5 --max-actions 500
```

---

> **免責聲明**：本文基於 PRO-LONG 的公開文件、論文和技術分析，旨在提供全面的技術洞察和實用指南。論文引用：arXiv:2607.20064。
