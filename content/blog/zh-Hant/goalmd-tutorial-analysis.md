---
title: "GOAL.md 深度解析：讓 AI Agent 自主改進代碼的極簡框架——只需給它一個數字"
description: "全面解析 GOAL.md——AutoHarness 專案提出的讓 AI Agent 自主改進代碼的文件格式。核心思想極其簡單：寫一個輸出數字的評分腳本（Fitness Function），寫一個 GOAL.md 文件定義目標和行動目錄，讓 Agent 自己想辦法讓分數變高。本文從核心概念（適應度函數、行動目錄、改進迴圈、運行模式）、設計哲學、完整教程到實戰示例，一文講透如何用 GOAL.md 讓 AI 代理成為自主的代碼質量工程師。"
date: "2026-08-04"
author: "TopDigg Research Team"
tags: ["GOAL.md", "AutoHarness", "AI Agent", "Fitness Function", "Code Quality", "Autonomous Improvement", "Rust", "LLM"]
categories: ["Deep Dive"]
keywords: ["GOAL.md", "AutoHarness", "適應度函數", "Fitness Function", "AI Agent", "自主改進", "代碼質量", "行動目錄", "改進迴圈", "評分腳本"]
---

# GOAL.md 深度解析：讓 AI Agent 自主改進代碼的極簡框架——只需給它一個數字

> 核心思想：**傳統做法是人分析代碼、列待辦、逐個執行、手動驗證——效率低且不可持續。GOAL.md 的答案是：你不需要告訴 AI 具體怎麼做，你只需要告訴它「什麼更好」。** 寫一個輸出數字的評分腳本（Fitness Function），寫一個 GOAL.md 文件定義目標和行動目錄，然後讓 Agent 自己想辦法讓分數變高。Agent 會測量當前分數、選擇最高影響的行動、執行改動、驗證分數提高、記錄到日誌——形成一個自我驅動的改進迴圈。這是 AutoHarness 專案提出的「極簡自主改進框架」——不是讓 AI 寫代碼，而是讓 AI **改進**代碼。

---

## 一、專案說明

### 1.1 它是什麼？

**GOAL.md** 是 AutoHarness 專案提出的一種**文件格式**，用於讓 AI Agent 能夠自主改進專案。它解決了一個核心問題：

> **「我想要這個專案變得更好，但我不確定該怎麼做」**

傳統做法：人分析代碼 → 列待辦 → 逐個執行 → 手動驗證。GOAL.md 的做法：寫評分腳本 → 寫 GOAL.md → 讓 Agent 自己想辦法 → Agent 記錄每次改動和分數變化。

### 1.2 關鍵概念

GOAL.md 的核心由四個組件構成：

- **Fitness Function（適應度函數）**：一個輸出數字的腳本，衡量「專案有多好」
- **Action Catalog（行動目錄）**：列出所有可能的改進行動及其預期影響
- **Improvement Loop（改進迴圈）**：測量 → 選擇 → 執行 → 驗證 → 記錄 → 重複
- **Operating Mode（運行模式）**：Converge / Continuous / Supervised

### 1.3 它解決什麼問題？

AI Agent 寫代碼很快，但它不知道「什麼是更好的代碼」。沒有反饋迴路，Agent 就像沒有溫度計的恆溫器——它無法判斷自己的改動是讓代碼變好了還是變差了。GOAL.md 用一個簡單的數字解決了這個問題：**分數越高，專案越好**。Agent 的目標就是讓這個數字變大。

---

## 二、核心思想

### 2.1 Fitness Function——用一個數字定義「好」

Fitness Function 是一個腳本，輸出一個數字來衡量專案質量：

```bash
./scripts/score.sh
# 輸出: 85 / 100
```

設計原則：

- **確定性**：相同輸入必須產生相同輸出
- **快速**：最好在 60 秒內完成
- **獨立**：不依賴外部狀態
- **可組合**：分數 = 各組件分數之和

常見組件：

- **format（格式）**：20 分 — `cargo fmt -- --check`
- **clippy（Lint）**：20 分 — `cargo clippy` 警告數
- **tests（測試）**：25 分 — `cargo test` 通過
- **docs（文檔）**：15 分 — 文件檢查
- **maintenance（維護）**：10 分 — 專案維護狀態
- **safety（安全）**：10 分 — `unsafe` 代碼檢查

### 2.2 Action Catalog——告訴 Agent「你能做什麼」

行動目錄是一個表格，列出所有可能的改進行動及其預期影響：

- **運行 cargo fmt** — 影響 +20，執行 `cargo fmt`
- **修復 clippy 警告** — 影響 +10，執行 `cargo clippy --fix`
- **添加單元測試** — 影響 +10，為每個公共函數添加測試

Agent 會根據這個目錄選擇「影響最大」的行動優先執行。

### 2.3 Improvement Loop——自我驅動的改進

```
1. 測量當前分數
2. 選擇最高影響的行動
3. 執行改動
4. 驗證分數提高
5. 記錄到日誌
6. 重複
```

這個迴圈是自我驅動的——Agent 不需要人告訴它下一步做什麼，它自己根據分數變化決定。

### 2.4 Operating Mode——三種運行策略

- **Converge**：達到目標分數後停止（適合有明確目標的改進）
- **Continuous**：持續運行直到中斷（適合持續優化）
- **Supervised**：在關鍵點暫停等待確認（適合敏感代碼審查）

---

## 三、設計哲學

### 3.1 「你不需要告訴 AI 怎麼做，你只需要告訴它什麼更好」

這是 GOAL.md 最深刻的設計哲學。傳統做法是寫詳細的指令告訴 AI 每一步怎麼做——但這限制了 AI 的創造力。GOAL.md 只定義「目標」（分數）和「邊界」（約束），讓 AI 自己探索最優路徑。這就像給一個聰明的員工一個 KPI，而不是一份操作手冊。

### 3.2 「反饋迴路是一切自主系統的基礎」

GOAL.md 的改進迴圈本質是一個反饋迴路：測量 → 行動 → 再測量。沒有反饋迴路，自主系統就無法運作——它不知道自己的行動是否有效。GOAL.md 用一個簡單的數字構建了這個反饋迴路。

### 3.3 「確定性是信任的基礎」

Fitness Function 必須是確定性的——相同輸入產生相同輸出。如果評分腳本每次運行結果不同，Agent 就無法信任它的反饋，整個系統就會崩潰。確定性是人與 AI 之間信任的基礎。

### 3.4 「約束比指令更有效」

GOAL.md 不告訴 Agent 具體怎麼做，而是定義約束（不要破壞現有功能、先格式後 lint、一個提交一個改動）。約束比指令更有效，因為它給了 AI 自由度，同時保證了安全性。

---

## 四、詳細教程

### 4.1 五分鐘快速開始

**Step 1：建立評分腳本**

```bash
mkdir -p scripts
cat > scripts/score.sh << 'EOF'
#!/bin/bash
set -uo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")/.." || exit 1

FORMAT_SCORE=0; CLIPPY_SCORE=0; TEST_SCORE=0

# 格式檢查 (20分)
cargo fmt -- --check 2>/dev/null && FORMAT_SCORE=20

# Clippy 檢查 (20分)
WARN_COUNT=$(cargo clippy 2>&1 | grep -c "warning:" || true)
[[ "$WARN_COUNT" -eq 0 ]] && CLIPPY_SCORE=20

# 測試檢查 (20分)
cargo test 2>&1 | grep -q "test result: ok" && TEST_SCORE=20

TOTAL=$((FORMAT_SCORE + CLIPPY_SCORE + TEST_SCORE))
echo "Score: $TOTAL / 60"
EOF
chmod +x scripts/score.sh
```

**Step 2：建立 GOAL.md**

```markdown
# Goal: My Project - 提升代碼質量

## Fitness Function

./scripts/score.sh

## Operating Mode

- [x] **Converge** — 達到目標時停止

Stop when:
- Score reaches 60/60
- 10 次迭代無改進

## Action Catalog

| Action | Impact | How |
|--------|--------|-----|
| cargo fmt | +20 | `cargo fmt` |
| Fix clippy warnings | +20 | `cargo clippy --fix` |
| Add unit tests | +20 | 為公共函數添加測試 |

## Constraints

1. 不要破壞現有功能
2. 先格式後 lint
3. 一個提交一個改動

## Iteration Log

File: `iterations.jsonl`
```

**Step 3：運行**

```bash
./scripts/score.sh
# Score: 20 / 60

# Agent 會自動執行改進
cargo fmt
./scripts/score.sh
# Score: 40 / 60

cargo clippy --fix
cargo fmt
./scripts/score.sh
# Score: 60 / 60
```

### 4.2 完整專案示例

建立文件結構：

```
my-cli/
├── GOAL.md           # 目標定義
├── AGENTS.md         # Agent 指南
├── iterations.jsonl  # 迭代日誌
├── scripts/
│   └── score.sh      # 評分腳本
├── src/
│   └── ...
└── Cargo.toml
```

### 4.3 迭代日誌格式

每次改進後，記錄到 `iterations.jsonl`：

```json
{"iteration":1,"component":"format","before":20,"after":40,"action":"cargo fmt"}
{"iteration":2,"component":"clippy","before":40,"after":60,"action":"cargo clippy --fix"}
```

### 4.4 JSON 輸出格式

評分腳本支援 `--json` 參數：

```bash
./scripts/score.sh --json
# {"total":60,"max":60,"components":{"format":20,"clippy":20,"tests":20}}
```

### 4.5 Agent 自動識別

將 `GOAL.md` 和 `CLAUDE.md` 放到專案根目錄，Agent 會自動識別並開始改進迴圈。

---

## 五、進階模式

### 5.1 多 Agent 協作

多個 Agent 可以同時改進同一個專案，通過 `iterations.jsonl` 共享狀態。

### 5.2 自定義組件

你可以添加任何評分組件：

```bash
# 安全檢查 (10分)
UNSAFE_COUNT=$(grep -r "unsafe" src/ | wc -l)
[[ "$UNSAFE_COUNT" -eq 0 ]] && SAFETY_SCORE=10

# 文檔檢查 (10分)
[[ -f "README.md" ]] && DOC_SCORE=$((DOC_SCORE + 5))
[[ -f "AGENTS.md" ]] && DOC_SCORE=$((DOC_SCORE + 5))
```

### 5.3 超時處理

```bash
# 防止腳本卡住
TEST_OUTPUT=$(timeout 120 cargo test 2>&1 || true)
```

### 5.4 工具存在性檢查

```bash
if command -v cargo-tarpaulin &>/dev/null; then
    COVERAGE=$(cargo tarpaulin --out json | jq '.line_percent')
else
    COVERAGE=0
fi
```

---

## 六、適用場景

- **代碼質量改進** — 推薦模式 Converge，示例 Clippy 警告清理
- **性能優化** — 推薦模式 Continuous，示例 Benchmark 持續優化
- **安全審計** — 推薦模式 Supervised，示例敏感代碼審查
- **文檔完善** — 推薦模式 Converge，示例 README 編寫
- **測試覆蓋** — 推薦模式 Converge，示例添加單元測試
- **格式統一** — 推薦模式 Converge，示例代碼格式化

---

## 七、歸納總結（觀點與結論）

結合 GOAL.md 的設計與實現，幾個值得思考的點：

1. **「給 AI 一個數字」比「給 AI 一份清單」更有效。** 傳統做法是列出所有待辦事項讓 AI 逐個執行——但這限制了 AI 的創造力，也让 AI 無法自主判斷優先級。GOAL.md 用一個數字（分數）定義了「什麼是更好」，讓 AI 自己探索最優路徑。這就像給一個聰明的員工一個 KPI，而不是一份操作手冊。

2. **反饋迴路是自主系統的基石。** 沒有反饋迴路，自主系統就無法運作——它不知道自己的行動是否有效。GOAL.md 的改進迴圈（測量 → 行動 → 再測量）用最簡單的方式構建了這個反饋迴路。編譯器在語法層關閉了反饋，測試套件在行為層關閉了，GOAL.md 在**架構質量層**關閉了。

3. **確定性是人與 AI 信任的基礎。** 如果評分腳本每次運行結果不同，Agent 就無法信任它的反饋。GOAL.md 要求 Fitness Function 是確定性的——這不只是技術要求，更是信任要求。人必須能預測 AI 看到的反饋，才能信任 AI 的決策。

4. **約束比指令更有效。** GOAL.md 不告訴 Agent 具體怎麼做，而是定義約束（不要破壞現有功能、先格式後 lint）。約束給了 AI 自由度，同時保證了安全性。這與人類管理的智慧一致：好的管理者定義邊界，而不是 micromanage。

5. **極簡主義的力量。** GOAL.md 的核心只有四個組件：一個評分腳本、一個目標文件、一個行動目錄、一個迭代日誌。沒有複雜的配置，沒有龐大的框架——只有最必要的部分。這種極簡主義讓 GOAL.md 可以在任何專案中立即使用。

6. **從「寫代碼」到「改進代碼」的範式轉移。** 傳統 AI 輔助編程關注「如何讓 AI 寫出更好的代碼」；GOAL.md 關注「如何讓 AI 改進已有的代碼」。這是一個微妙但深刻的轉變——代碼庫不是從零開始的，AI 的價值不只是生成新代碼，更是持續改進現有代碼。

---

## 參考資料

- AutoHarness 儲存庫：`https://github.com/gyc567/AutoHarness`
- AutoHarness 論文：`https://arxiv.org/abs/2603.03329`
- GOAL.md 教程：`https://github.com/gyc567/AutoHarness/tree/main/docs/goal-md/tutorial-cn`
- GOAL.md 模板：`https://github.com/gyc567/AutoHarness/blob/main/template/GOAL.md`