---
title: "AutoHarness 深度解析：用樹狀搜尋讓「小模型 + Harness」勝過「大模型」——為 LLM Agent 自動合成程式碼護欄的開源 Rust 函式庫"
description: "全面解析 gyc567 開源的 AutoHarness——一個用 Rust 撰寫的函式庫與 CLI 工具，它自動為 LLM Agent「合成並最佳化程式碼 Harness」，重現 AutoHarness 論文（arXiv:2603.03329）的核心方法。用樹狀搜尋 + Thompson 取樣迭代精化 Harness 程式碼，在 145 個 TextArena 遊戲上平均 14.5 次迭代達到 100% 合法動作率，實證並落實「小模型 + Harness > 大模型」的觀點。從核心思想、架構模組、設計哲學到完整教學、功能清單與歸納結論，一文講透。"
date: "2026-08-04"
author: "TopDigg Research Team"
tags: ["AutoHarness", "LLM Agents", "Code Harness", "Tree Search", "Thompson Sampling", "Rust", "AI Safety", "TextArena", "LLM", "Sandbox"]
categories: ["Deep Dive"]
keywords: ["AutoHarness", "LLM Agent", "程式碼 Harness", "樹狀搜尋", "Thompson 取樣", "Rust", "AI 安全", "TextArena", "程式碼合成", "沙箱執行", "LLM Agent"]
---

# AutoHarness 深度解析：用樹狀搜尋讓「小模型 + Harness」勝過「大模型」——為 LLM Agent 自動合成程式碼護欄的開源 Rust 函式庫

> 核心思想：**把「程式碼工具」蓋在 LLM 外面，比換一個更大的模型更划算。** AutoHarness 把論文的想法變成一套可執行的 Rust 函式庫與 CLI：用**樹狀搜尋（Tree Search）+ Thompson 取樣（Thompson Sampling）**自動生成並迭代最佳化一段「Harness 程式碼」——這段程式碼負責過濾（Filter）、驗證（Verifier）、提議（Propose）或對齊策略（Policy）——約束 Agent 的動作空間，讓它只做「合法動作」。它重現了論文的核心發現：**"Small model + harness > Large model without harness"（小模型 + Harness 勝過沒有 Harness 的大模型）**，在 145 個 TextArena 遊戲上平均 **14.5 次迭代**便收斂到 **100% 合法動作率**。它不是要取代 LLM，而是用一層可解釋、可驗證的程式碼工具，把模型能力「榨」到極致。

---

## 一、專案說明

### 1.1 它是什麼？

**AutoHarness** 是一個基於 Rust 撰寫的**函式庫 + CLI 工具**，它**自動為 LLM Agent 合成（synthesize）並最佳化（optimize）程式碼 Harness**。它實作了 [AutoHarness 論文（arXiv:2603.03329）](https://arxiv.org/abs/2603.03329)（作者 Xinghua Lou 等人）所述的方法：用**樹狀搜尋 + Thompson 取樣**迭代精化 Harness 程式碼。

一句話認識它：**Automatically synthesize code harnesses for LLM agents**（自動為 LLM Agent 合成程式碼 Harness）。

### 1.2 關鍵數據

- 儲存庫：`https://github.com/gyc567/AutoHarness`
- Stars：**8**（早期專案，以單一維護者為主）
- Forks：1
- 語言：**Rust**（使用 Tokio 非同步、Serde 序列化、Clap CLI）
- 建立時間：2026-03-21
- 最後推送：2026-03-29
- License：**MIT**
- 提交數：18 commits
- 版本：`autoharness = "0.1.0"`
- 型態：既是可安裝的 CLI（`autoharness synthesize/evaluate/run/benchmark/config`），也可作為 Cargo 依賴嵌入自有專案

### 1.3 它解決什麼問題？

LLM Agent 在真實環境中執行任務，最大的痛點之一就是**「自由過頭」**：模型的輸出動作可能非法、越界、低效，或不符合業務策略。傳統做法要麽靠 prompt 反覆「叮囑」，要麽換更大的模型當「窮舉」：代價高且不可靠。

AutoHarness 的答案是：**為 Agent 生成一段強約束的 Harness 程式碼**——它像一個細心的「監督者」，在模型動作落地之前先做**過濾（filter）、驗證（verifier）、提議（propose）、策略對齊（policy）**。而且這一步是**自動**的：不是程式設計師手工寫 Harness，而是讓演算法自己搜出來、磨出來、最佳化到汰。

---

## 二、核心思想

### 2.1 一個令人驚豔的實證結論

> **Small model + harness > Large model without harness（小模型 + Harness 勝過沒有 Harness 的大模型）。**

這是 AutoHarness 想要證明、且在 145 個 TextArena 遊戲中驗證的核心觀點。它正好推翻了「**想要更強的 Agent，就換更大的模型**」這個直覺，指出：**護欄（Harness）往往比「裸奔」的參數規模更值錢**。

### 2.2 三大支柱

AutoHarness 的整個設計可以拆成三大支柱：

- **樹狀搜尋（Tree Search）**：把「搜尋更好的 Harness 程式碼」建模成在一棵程式碼變體樹上爬山——從根出發，不斷派生出候選節點，向「能讓模型做出合法動作」的節點收斂；評估不理想就回溯分叉、轉向其他分支。
- **Thompson 取樣（Thompson Sampling）**：在眾多候選 Harness 變體裡做「**exploration vs exploitation（探索 vs 利用）」的動態、平衡**——既能集中火力打磨已有效的方案，又不會因為死守一匹而錯過可能更強的變異，用貝氏思想瞄準各分支的期望成功率。
- **沙箱執行（Sandboxed Execution）**：所有候選 Harness 程式碼都在隔離環境中執行，配有記憶體 / 時間 / 檔描述元 / 輸出大小 / 網路開關等資源限制——讓搜尋可以大膽試錯，做出不能讓惡意或失控的程式碼傷到宿主。

### 2.3 心智模式的轉變

由此得到的整體思考框架：**LLM 提供「意圖」，Harness 提供「護欄」**。意圖負責天馬行空，工具負責把想法翻譯成合法、安全、可落地的動作。兩者疊加的效果 > 單靠一個更大腦模型的效果。

---

## 三、內容架構（模組與資料結構）

### **3.1 原始碼目錄骨架**

```
AutoHarness/
├── src/lib.rs         # 匯出 core、engine、memory、sandbox、templates
├── benches/            # 基準測試
├── examples/           # 示例程式碼
├── install/            # install.sh 與平台二進位檔（darwin-x86_64、linux-x86_64）
├── memory/             # MemoryStore 持久化 Harness 儲存
├── tests/              # 整合測試
├── Cargo.toml
├── autoharness.toml    # 預設設定
├── README.md / README_zh-CN.md
└── TUTORIAL.md / TUTORIAL_zh-CN.md
```

### 3.2 核心模組

- **`core`**：定義 `State`、`Action`、`Harness` 三個 trait + `HarnessType` 列舉
- **`engine`**：`CodeSynthesisEngine`、`SynthesisConfig`、`Evaluator` trait、樹狀搜尋
- **`sandbox`**：`SandboxExecutor`、`SandboxConfig`、資源限制
- **`memory`**：`MemoryStore`、`MemoryConfig`（持久化儲存）
- **`templates`**：`FilterTemplate`、`VerifierTemplate`、`PolicyTemplate`、`EnsembleTemplate`

### 3.3 三個核心 trait

```rust
pub trait State: Serialize + Clone + Send + Sync {
    fn to_prompt(&self) -> String;   // 把狀態轉成給 LLM 的提示
    fn validate(&self) -> Result<()>;  // 驗證狀態是否合法
}

pub trait Action: Serialize + Clone + Send + Sync + PartialEq {
    fn to_string(&self) -> String;         // 動作的字串表達
    fn from_string(s: &str) -> Result<Self>;  // 從字串解析動作
}

pub trait Harness<S: State, A: Action>: Send + Sync {
    fn harness_type(&self) -> HarnessType;   // 是 Filter / Verifier / Policy 之一
    fn evaluate(&self, state: &S, action: &A) -> Result<bool>; // 判斷動作是否合法
    fn propose_actions(&self, state: &S) -> Result<Vec<A>>;      // 提議候選動作
}
```

### 3.4 合成引擎設定（預設值）

`SynthesisConfig` 是搜尋列的「參數台」，其預設參數詮釋了它的收斂目標：

- `max_iterations: 50`（最大迭代次數）
- `convergence_threshold: 0.95`（收斂門檻——達到 95% 合法率即可停）
- `max_depth: 10`（樹狀搜尋最大深度）
- `mutations_per_node: 3`（每節點最多變異 3 個）
- `exploration_constant: 1.414`（Thompson 取樣的探索常數）
- `adaptive_sampling: true`（是否自適應調整取樣策略）
- `target_iterations: 20`（目標迭代次數）
- `min_improvement: 0.01`（最大容忍提升量）
- `max_nodes: 1000`（最大節點數）

### **3.5 沙箱設定（預設）**

- `memory_limit_mb: 256`（記憶體上限 256 MB）
- `time_limit_ms: 5000`（單次執行超時 5 秒）
- `max_file_descriptors: 64`（最大檔案描述元數目）
- `max_output_size: 10MB`（最大輸出）
- `enable_network: false`（預設關閉網路）

---

## 四、設計哲學

### 4.1 護欄優先於尺度

不做「換更大模型」的軍備競賽，而是把「護欄」當作第一公民。Harness 是**可讀、可驗證、可審計**的程式碼，它把「模型行為是否符合預期」變成一個**確定性**的檢查問題，降低對「黑盒 LLM」的盲目信任。

### 4.2 種一棵樹，而不是長一株草

不用網格搜尋或隨機打補丁，而是用**樹狀搜尋 + 取樣**在**變體空間裡定向爬坡**。既避免手寫的粗糙，也避免盲目試錯的指數級浪費——把複雜度壓縮在有界、可調參的搜尋空間裡（`max_nodes=1000`、`max_depth=10`）。

### 4.3 在籠子裡試錯

生成 Harness 必然要反覆試跑程式碼，而這段程式碼可能是**未經信任的**。於是「大膽最佳化」與「沙箱限制」綁定：**資源限制 / 超時強制 / 系統呼叫過濾 / 輸入驗證**，讓自動化搜尋安全到可以交給機器自行迭代。

### 4.4 開箱即用的「工具化」哲學

它不只是論文復現，更是**能嵌進 AI 編碼 Agent（OpenCode/CloudCode）的工具**——官方 README 提供「一句話快速開始」：把一句 prompt 交給 Agent，即可觸發整個 Harness 合成流程。它就是**把它型塑為開發者工具**的產品取向，而非純研究。

---

## 五、詳細教學

### 5.1 安裝 CLI（一條指令）

```bash
curl -fsSL https://raw.githubusercontent.com/gyc567/AutoHarness/main/install/install.sh | bash
```

或用 jsDelivr CDN：

```bash
curl -fsSL https://cdn.jsdelivr.net/gh/gyc567/AutoHarness@main/install/install.sh | bash
```

安裝至 `~/.local/bin/autoharness`，確認：

```bash
autoharness --version
# autoharness 0.1.0
```

> 平台支援：macOS Intel ✅、macOS Apple Silicon（執行 x86_64 二進位）、Linux x86_64（原始碼建置）、Windows x86_64（原始碼建置）。

### 5.2 作為 Cargo 函式庫使用

在 `Cargo.toml` 中加入：

```toml
[dependencies]
autoharness = "0.1.0"
```

### 5.3 CLI 工作流三步驟

```bash
# 1) 合成（Synthesize）：用樹狀搜尋自動合成並最佳化 Harness
autoharness synthesize --file my_harness.py --max-iterations 20 --stats

# 2) 評估（Evaluate）：為 Harness 打分
autoharness evaluate --file my_harness.py --detailed

# 3) 沙箱執行（Run）：在沙箱裡跑起來
autoharness run --file my_harness.py --input "test_state"
```

### 5.4 用 Rust 撰寫一個最小 Harness

定義狀態與動作、實作 `Harness` trait，再用 `CodeSynthesisEngine` 驅動合成：

```rust
use autoharness::{core::{State, Action, Harness, HarnessType}, engine::CodeSynthesisEngine};

// 1. 定義遊戲狀態
#[derive(Serialize, Clone)]
struct GameState {
    board: Vec<char>,  // 棋盤
    turn: usize,       // 誰走
}
impl State for GameState {
    fn to_prompt(&self) -> String { format!("board={:?} turn={}", self.board, self.turn) }
    fn validate(&self) -> Result<()> { Ok(()) }
}

// 2. 定義動作
#[derive(Clone, PartialEq, Deserialize)]
struct Move { cell: usize }
impl Action for Move {
    fn to_string(&self) -> String { format!("move {}", self.cell) }
    fn from_string(s: &str) -> Result<Self> {
        Ok(Move { cell: s.trim_start_matches("move ").parse()? })
    }
}

// 3. 定義 Harness 好壞的評估
struct GameEvaluator;   // 判斷「某動作是否合法 / 棋局是否合法」

// 4. 用合成引擎讓它自己找更好的 Harness
let engine = CodeSynthesisEngine::new(Default::default());
// engine.synthesize::<GameState, Move>(&game, &harness) → 回傳更優的 Harness
```

### 5.5 一句話啟動

（README 提供「一句話快速開始」——把單一 prompt 交給 OpenCode / CloudCode 這類 AI 編碼 Agent，即可觸發整個流程。）

### 5.6 跑測試

```bash
cargo test
# 包含 test_synthesis / test_sandbox 等整合測試
```

---

## 六、功能清單

- **三大 Harness 模式**：Filter（過濾動作）/ Verifier（驗證條件）/ Policy（對齊策略）
- **樹狀搜尋 + Thompson 取樣**：高效探索程式碼變體空間
- **沙箱執行**：執行與資源邊界（記憶體 / 時間 / 輸出 / 網路）均可組態
- **自適應最佳化**：動態平衡探索與利用
- **高效能**：平均 **14.5 次迭代**即可收斂
- **CLI 五件套**：`synthesize` / `evaluate` / `run` / `benchmark` / `config`
- **Cargo 函式庫 API**：`autoharness = "0.1.0"`
- **跨平台安裝器**：`curl | bash` 一鍵安裝 macOS/Linux
- **設定檔**：`autoharness.toml`
- **記憶體系統**：`MemoryStore` 持久化 Harness
- **Harness 範本**：`FilterTemplate` / `VerifierTemplate` / `PolicyTemplate` / `EnsembleTemplate`
- **安全加固**：系統呼叫過濾 / 超時強制 / 輸入驗證

---

## 七、歸納總結（觀點與結論）

結合專案與論文，我點出幾個值得思考的方向：

1. **「護欄比尺寸更划算」至少在可控情境成立**。AutoHarness 的實測（145 場 TextArena、100% 合法率）表明：對動作空間有限的任務，一個可靠的 Harness 可以讓小模型「搆得著」大模型，價值 / 成本比極高。
2. **樹狀搜尋是 Harness 工程的「升級捷徑」**。與其手工撰寫（容易粗糙、遺漏邊界），不如讓樹狀搜尋幫你列舉 + Thompson 取樣幫你挑選 + 沙箱做安保，這正是把「寫程式碼」本身變成可最佳化的目標。
3. **安全性與自動化可以兼得**。搜尋要反覆試跑未經信任的程式碼，就要隔離試錯——AutoHarness 把它們綁定成預設姿態（`enable_network:false`、超時 5s），是值得學習的工程品味。
4. **它更像一種「模式」，而不是終點**。模型底座換得很快，但「被工具約束、被程式碼驗證、被沙箱保護」的思路是慢變數，會與 LLM 一起長期存在。
5. **也提醒我們「護欄」的開銷**。Harness 本身需要合成與持續維護，`max_nodes=1000` 與自適應取樣背後的運算開銷會隨任務複雜度上升——所以它是「空間小 / 約束明確」任務的甜蜜區。

---

## 參考資料

- 儲存庫：`https://github.com/gyc567/AutoHarness`
- 論文：arXiv:2603.03329（Xinghua Lou et al., AutoHarness）
- TextArena 基準：google-deepmind/arena（145 個遊戲環境）
- Thompson 取樣：探索與利用的經典方法
- 安裝腳本：`https://raw.githubusercontent.com/gyc567/AutoHarness/main/install/install.sh`
- 預設設定：`autoharness.toml`
- Cargo 依賴：`autoharness = "0.1.0"`