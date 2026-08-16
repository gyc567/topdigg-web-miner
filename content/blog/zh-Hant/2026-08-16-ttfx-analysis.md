---
title: 'ttfx：把終端文字特效編譯成 3.3MB 單一靜態二進位的 Rust 移植'
date: "2026-08-16"
description: "深入解析 omacom-io/ttfx：一個逐位元組復刻 TerminalTextEffects 的 Rust 移植專案。探索它如何把 37 種終端特效塞進一個零依賴的靜態二進位、如何用確定性測試證明『像素級一致』，以及 27.5 倍中位加速背後的設計哲學與完整教學"
tags:
  - ttfx
  - TerminalTextEffects
  - Rust
  - CLI
  - Terminal
  - 終端特效
  - 命令列工具
  - 效能最佳化
categories:
  - 開發工具
  - 命令列工具
  - Rust
  - 終端
  - 開源專案
---

# ttfx：把終端文字特效編譯成 3.3MB 單一靜態二進位的 Rust 移植

## 文章背景與專案簡介

如果你在終端機裡跑過 `fortune`、`cowsay`，或者用 `neofetch` 展示系統資訊，你一定感受過命令列世界對「一點點魔法」的渴望。而 [TerminalTextEffects](https://github.com/ChrisBuilds/terminaltexteffects)（簡稱 TTE）把這種魔法推向了極致——它能讓你的文字像電影裡的黑客介面一樣**解密、燃燒、爆炸、化作流星雨**，37 種特效全部開源。

但 TTE 有一個「幸福的煩惱」：它是一個 Python 套件。作為函式庫這完全正確，可作為天天待在 shell 管道裡的玩具，Python 意味著直譯器、安裝步驟，以及**首幀前約 65 毫秒的 import 延遲**。

**ttfx** 就是對這個問題的回答：一個 Rust 移植版，把 TTE 的全部 37 種特效、動畫引擎和命令列介面，編譯進**一個零執行時期依賴的靜態二進位**——啟動只需 **0.5 毫秒**，體積約 **3.3MB**。

> ttfx：Terminal text effects as a single static binary. Pipe text in, pick an effect:
>
> ```sh
> ls -la | ttfx decrypt
> cat banner.txt | ttfx beams
> fortune | ttfx --random-effect
> git log --oneline -10 | ttfx matrix
> ```

這不是一個「用 Rust 重寫一遍」的普通移植。ttfx 的野心是**逐位元組一致（parity-exact）**：給定相同的輸入、設定和隨機數序列，它產出的每一幀都和 Python 原版**位元組級相同**，而且這種一致性不是靠肉眼比對，而是靠 CI 裡的機械化驗證。這個專案的存在本身就是一份關於「如何認真移植一個專案」的教科書。

## 專案速覽

| 面向 | 詳情 |
|------|------|
| **專案名稱** | ttfx（`ttx` 已被 fonttools 佔用，故命名 `ttfx`） |
| **作者/組織** | omacom-io（為 Omarchy 發行版而生） |
| **定位** | TerminalTextEffects 的 parity-exact Rust 移植 |
| **語言** | Rust（edition 2021），約 22k 行 Python 的等價規模 |
| **依賴** | 僅 3 個：clap / clap_complete / terminal_size |
| **產物** | 單一靜態二進位（musl 靜態連結，~3.3MB），零執行時期依賴 |
| **特效數量** | 37 種，全部對齊上游 |
| **授權** | MIT（同時保留原 TTE 版權聲明） |
| **目標平台** | Linux 與 macOS（最初只針對 Omarchy/Arch） |
| **上游版本** | 固定到 TTE v0.15.0（commit `7a91dd9`） |
| **驗證方式** | CI 機械化逐位元組比對 + 行為測試 + 單元金標 |

## 核心設計哲學

### 榮譽歸原作者：移植不加戲

專案 README 的第一句話就是 "Credit where it's due"：

> **這是 ChrisBuilds 的 TerminalTextEffects 的移植版。** 每一個特效、動畫引擎和命令列介面都是他們的設計——這個專案只是把工作翻譯成 Rust，**沒有為這門藝術添加任何自己的東西**。如果你喜歡這裡看到的東西，去給原版點個星。

這種謙遜不是客套，而是一條硬性原則。甚至特效創意都被明確引導到上游去提："Please file *effect* ideas upstream, where they belong."——移植專案不做產品經理，只做翻譯官。

### Parity Port：逐位元組一致，而非「神似」

大多數移植專案的驗收標準是「功能差不多、介面看著像」。ttfx 的標準要苛刻一個數量級：

> 這是一個 *parity port*（等價移植），不是 reimplementation-in-spirit（精神重寫）。給定相同的輸入、設定和隨機數，ttfx 產出與 Python 原版**位元組級相同的幀**——在 CI 裡對著固定的上游 checkout（v0.15.0）機械化驗證，而不是靠肉眼。

這套驗證體系由 6 個測試套件組成：

| 套件 | 檢查數 | 證明什麼 |
|------|--------|---------|
| `tools/parity/run_suite.sh` | 354 | 每個特效的幀流，跨設定和種子，逐位元組一致 |
| `tools/parity/tty_compare.sh` | 41 | 完整終端位元組流——畫布準備、游標移動、收尾 |
| `tools/tests/cli_corpus.sh` | 19 | 退出碼與 stdout/stderr 路由 |
| `tools/tests/*_behavior.py` | pty | 只有真實終端才顯現的行為：resize 重啟、訊號收尾 |
| `cargo test` | goldens + traces | 緩動/幾何/漸變數值與引擎狀態機 |

`./bin/test` 一鍵跑完所有套件——而這**就是** CI 做的全部事情。

### 刻意復刻怪癖，而不是「修復」它們

這是整個專案最反直覺也最深刻的設計決策。為了讓輸出逐位元組一致，ttfx 必須**故意保留** Python 原版的一系列「bug」：

- **Python 的銀行家捨入**（round-half-even）：Rust 的 `f64::round` 是遠離零捨入，兩者在 `.5` 邊界上行為不同，必須復刻；
- **漸變用整數地板除法而非浮點插值**：`(end - start) // steps`，負增量時 Python 的 `//` 向下取整，Rust 的 `/` 向零截斷——必須復刻；
- **貝茲曲線弧長近似丟失最後一段**：上游的 10 取樣迴圈 bug 導致路徑長度系統性偏短，`max_steps` 依賴它——**連 bug 一起復刻**；
- **迴圈場景每 tick 都報告自己完成**：特效依賴這個怪癖才能正常收尾。

這些坑全部記錄在 `plan.md` 的「保真度陷阱」清單裡（共 20 條），而 Python 無序迭代需要被釘死的地方則記錄在 `docs/ordering-inventory.md`。

**只有兩處被接受的刻意差異**：一是隨機數產生器（ttfx 用 xoshiro256++，與 CPython 的梅森旋轉演算法不相容，`--seed` 在 ttfx 內部可重現但與 Python 不互通）；二是不支援 Python 外掛特效（因為根本沒有直譯器去載入它們）。

### 轉寫而非重新想像（Transcription, not reimagination）

移植策略本身也是一種哲學：

> 每個 Python 檔案對應一個 Rust 檔案；函式保留原名和內部結構；任何微妙之處的註解都引用上游行號。兩份調研文件（引擎架構 + 特效目錄）是地圖，固定的上游 checkout 是原文。

翻譯而非改編、逐行對應而非「順手最佳化」——這樣做的直接回報是：**只要轉寫保真，隨機數呼叫順序就天然一致**，而這正是逐位元組比對的前提。任何「我覺得這裡可以寫得更好」的念頭都會破壞等價性。

### 單一靜態二進位哲學

為什麼為一個終端玩具做到這種程度？因為「在管道裡」和「作為函式庫」是兩個完全不同的世界：

```
Python TTE（作為函式庫）:     ttfx（作為管道玩具）:
  python3 直譯器         →   一個二進位檔案
  pip install           →   下載即用
  ~65ms import          →   0.5ms 啟動
  執行時期依賴一堆       →   零執行時期依賴
```

「TTE 是 Python 套件。作為函式庫這是正確的選擇，但對於一個住在 shell 管道裡的玩具，它意味著直譯器、安裝步驟、以及首幀前約 65ms 的匯入時間。ttfx 是一個零依賴的二進位，啟動只需半毫秒。**這個差異就是它存在的全部理由。**」

### 確定性驗證：讓「像素級一致」可以檢驗

特效是隨機的，所以「逐幀 diff」天然失敗。ttfx 的解法是把隨機性變成**可注入的共享依賴**：

1. **確定性 RNG shim**：在 Rust（`rng.rs`）和 Python（`tools/parity/shim.py`）裡實現同一個 xoshiro256++，測試時兩邊抽取完全相同的隨機序列——前提是移植版與 Python 以相同順序呼叫 RNG，而這恰恰是忠實轉寫所保證的；
2. **確定性補丁**：把所有無序迭代（set 遍歷、dict 順序依賴）釘到同一個規範順序；
3. **時鐘補丁**：matrix 和 thunderstorm 讀取真實時鐘，測試時換成虛擬時鐘（每幀推進 `1/frame_rate`），使它們確定化。

這套「共享隨機源 + 釘死順序 + 虛擬時鐘」的方法論，值得任何一個做確定性測試的專案借鏡。

## 技術架構深度解析

### Arena + ID 取代 Python 物件圖

Python TTE 內部是一張互相引用的物件網：字元 ⇄ 動畫/運動/事件處理器，事件持有 Scene/Path/Waypoint 物件，字元之間還有 `links`/`neighbors`……在 Rust 裡這會被借用檢查器折磨死。ttfx 的答案是經典的 **arena 架構**：

- 所有 `EffectCharacter` 存在 `Vec` arena 裡，用 `CharacterId(u32)` 定址；
- Scenes/Paths 存在按字元劃分的 map 裡，用 `SceneId`/`PathId` 定址；
- `neighbors`/`links` 只存 ID；
- 事件表退化為純資料：`HashMap<(Event, CallerId), Vec<(Action, Target)>>`。

**全程零 `Rc<RefCell>`**。這不只是 Rust 的生存之道，也順帶讓狀態變得可快照、可比對——對測試是意外之喜。

### 同步事件分發（無延遲佇列）

Python 的語意很微妙：事件回呼**在發出點立即執行**，而且可以發生在 `Path.step` 的*中間*——比如 segment 事件在座標計算之前觸發，`SET_COORDINATE` 動作隨後會被 move 自己的賦值覆蓋。如果 Rust 版用一個「延遲佇列」（tick 結束後統一 drain），即使隨機數完全相同也會產生不同的幀。

結論：**不要延遲佇列。** 所有引擎步進函式都是 `EngineCtx` 上的方法，透過 ID 操作，在原始碼的精確發出點內聯呼叫 `handle_event`，像 Python 呼叫堆疊一樣深度遞迴。這是一個「為了逐位元組一致而把架構逼到最簡」的絕佳案例。

### 一個 Terminal 與確定性排序

Python 每次執行構造**兩個** Terminal（一個擁有 tty，一個擁有模擬）。ttfx 合併為一個 `Terminal` + 一個薄的 `TtyWriter`（畫布準備、幀率控制、游標恢復），RAII 的 `Drop` 取代 Python 的 `@contextmanager`。

**「順序就是行為。」** Python 在多個行為相關的場合迭代無序集合——不只是引擎內部，特效內部也有（middleout、unstable 直接迭代集合）。ttfx 的規則：

- 任何 Python 迭代 dict 的地方，Rust 用 `Vec` + id 查找或插入有序 map；
- 渲染時按 `(layer, character_id)` 排序可見字元；
- tick 時對 `active_characters` 快照並按 `CharacterId` 排序。

### Effect trait + 靜態註冊表

```rust
pub trait Effect {
    fn build(&mut self, ctx: &mut EngineCtx);          // Python __init__/build()
    fn next_frame(&mut self, ctx: &mut EngineCtx) -> Option<String>;  // __next__
}
```

`effects/mod.rs` 持有一個靜態註冊表（name → clap `Command` + 建構函式），取代 Python 的 `pkgutil` 動態發現。`--random-effect` / `--include-effects` / `--exclude-effects` / `--seed` 全部按上游行為工作，包括那個怪癖：隨機選中的特效以**純預設設定**執行。

### Python 形狀的 RNG

`rng.rs` 用 xoshiro256++ 實作了一組 Python 形狀的方法，逐一對應 TTE 的全部呼叫點（統計自調研）：

| 方法 | 呼叫次數 | 語意（被精確釘死） |
|------|---------|-------------------|
| `randint(a, b)` | 61 | 閉區間整數 |
| `choice(&[T])` | 54 | `seq[randbelow(len)]` |
| `shuffle` | 13 | Fisher-Yates，Python 的順序 |
| `randrange` | 13 | 半開區間 |
| `uniform(a, b)` | 12 | `a + (b-a)*random()` |
| `random()` | 12 | [0, 1) |

RNG 掛在 `EngineCtx` 上顯式傳遞——**沒有全域狀態**，這正是 parity 測試工具能成立的原因。

### 時鐘注入

matrix（讀 `time.time()`）和 thunderstorm（讀 `time.monotonic()`）直接依賴真實時鐘。真實時鐘會讓 parity 依賴執行速度：`frame_rate=0` 時，更快的實作會產出更多幀、在截止時間前消耗更多隨機數。解法是 `EngineCtx` 攜帶一個 `Clock` trait：生產實作讀真實時間，parity 實作是虛擬的（每幀推進固定 `1/frame_rate`），Python shim 用同樣的虛擬時鐘 monkeypatch `time.time`/`time.monotonic`。

### pycompat：保真度陷阱的收容所

所有「自然翻譯會靜默偏離 Python」的地方都集中在 `pycompat.rs`，每個 helper 都有釘死 Python 生成金標的測試：

- `round_half_even`：銀行家捨入，用於所有座標量化、`Path.max_steps`、動畫幀索引；
- `floor_div`：地板除法，用於漸變通道增量；
- `trunc`：截斷，用於 `shift_color_towards`。

再加上 `geometry.rs` 裡被原樣復刻的「雙倍行距」約定（cell 寬高比）、`hexterm.rs` 裡原樣照搬的 256 色最近比對表、`input.rs` 裡那個「迷你終端模擬器」（CSI-only ANSI 解析器）……這些細節堆在一起，才構成「逐位元組一致」的底氣。

## 效能數據：為什麼值得移植

在 200×50 的終端畫布上，關閉節流（測吞吐而非 `sleep()`），完整渲染一次動畫：

| 200×50 單元 | 幀數 | ttfx | Python TTE | ttfx fps |
|-------------|------|------|-----------|----------|
| slide | 375 | 76 ms | 2,203 ms | 4,930 |
| beams | 732 | 181 ms | 5,564 ms | 4,050 |
| rings | 1,566 | 521 ms | 10,439 ms | 3,004 |
| waves | 633 | 374 ms | 8,745 ms | 1,693 |
| 啟動 | — | 0.5 ms | 64 ms | — |

**結論**：35 個不受牆鐘時間約束的特效，中位加速 **27.5×**（區間 17.1×–47.4×）。只有兩個受時間門控的特效例外——`matrix` 和 `thunderstorm` 的大部分執行時間花在固定的動畫時長上，任何實作都無法縮短，所以它們只有 1.9× 和 1.3×；ttfx 在視窗內買到的是**高得多的幀率**，而不是更短的時間。

有趣的是效能哲學的克制：plan.md 裡明確寫 "Performance target: not a goal beyond 'never the bottleneck'"。O(n²) 的上游演算法（outside-in 排序、分組掃描）**為了保真度被原樣保留**，因為在終端尺度下毫無壓力。效能是正確架構的自然結果，而不是目標本身。

## 37 種特效全景

所有特效都作用於同一個輸入（Omarchy logo），每一幀都來自 Rust 二進位，且與 Python 原版逐位元組相同：

| 特效 | 一句話描述 |
|------|-----------|
| **beams** | 光束掃過畫布，照亮背後的字元 |
| **binarypath** | 每個字元的二進位表示移向它的歸位座標 |
| **blackhole** | 字元被黑洞吞噬後向外爆炸 |
| **bouncyballs** | 字元變成彈跳球從畫布頂部落下 |
| **bubbles** | 字元組成泡泡飄落並破裂 |
| **burn** | 在畫布上垂直燃燒 |
| **colorshift** | 漸變在終端上移動變色 |
| **crumble** | 字元失色、碎成塵土、被吸走再重組 |
| **decrypt** | 電影式解密特效 |
| **errorcorrect** | 部分字元初始位置錯誤，按序糾正 |
| **expand** | 文字從單點展開 |
| **fireworks** | 字元如煙火發射爆炸後落位 |
| **highlight** | 高光掃過文字 |
| **laseretch** | 雷射在終端上蝕刻字元 |
| **matrix** | 駭客任務數字雨 |
| **middleout** | 文字從畫布中央的一行/一列向外展開 |
| **orbittingvolley** | 四個發射器環繞畫布，向中心齊射字元構建文字 |
| **overflow** | 輸入文字隨機順序溢出滾動，最終歸於有序 |
| **pour** | 從指定方向把字元倒入位置 |
| **print** | 列印頭逐行列印，執行換行與回車 |
| **rain** | 字元如雨落下 |
| **randomsequence** | 以隨機序列列印輸入 |
| **rings** | 字元散開並組成旋轉圓環 |
| **scattered** | 文字散落畫布後移入位置 |
| **slice** | 把輸入切成兩半，從相對方向滑入 |
| **slide** | 字元從終端外滑入視野 |
| **smoke** | 煙霧淹沒畫布，為經過的字元上色 |
| **spotlights** | 探照燈搜尋文字區，照亮字元，最終匯聚中心展開 |
| **spray** | 字元以不同速率從單點噴出 |
| **swarm** | 字元組成蜂群遊走，最終落位 |
| **sweep** | 橫掃畫布揭示無色文字，反向橫掃上色 |
| **synthgrid** | 網格填滿字元，溶解成最終文字 |
| **thunderstorm** | 在終端裡製造一場雷暴 |
| **unstable** | 亂序字元爆炸到畫布邊緣，再重組為正確佈局 |
| **vhstape** | 字元行左右抖動、細節丟失，像老式 VHS 錄影帶 |
| **waves** | 波浪穿過終端，留下字元 |
| **wipe** | 擦除文字揭示字元 |

每個特效都有自己的選項——`ttfx <effect> --help` 查看。README 裡少數 GIF 縮短了計時階段以保證迴圈可看（如 `matrix --rain-time 3`），其餘全部是預設設定。

## 詳細入門教學

### 1. 建構

ttfx 的建構極其簡單，只需要 Rust 工具鏈：

```sh
# 一般發佈建構（連結系統 libc/libm/libgcc）
cargo build --release

# 完全靜態的 musl 建構（約 3.3MB，零動態依賴）
cargo build --release --target x86_64-unknown-linux-musl
```

跑完整測試套件：

```sh
./bin/test        # 全部 6 個套件（需要 python3）
```

parity 套件需要一份上游程式碼，首次執行自動複製到固定 commit（`./tools/parity/fetch_reference.sh` 可手動執行）。上游**不會**被 vendored 進倉庫——「因為那是他們的程式碼」。

### 2. 基本用法

```
<生產者> | ttfx [終端選項] <特效> [特效選項]
```

四個開箱即用的例子：

```sh
ls -la | ttfx decrypt            # 目錄列表上演解密
cat banner.txt | ttfx beams      # 橫幅被光束照亮
fortune | ttfx --random-effect   # 隨機驚喜（可 --include-effects/--exclude-effects 過濾）
git log --oneline -10 | ttfx matrix   # git 日誌來一場數字雨
```

### 3. 終端選項 vs 特效選項

這是一個容易踩的坑，規則很簡單：

- **終端選項在特效名前**：畫布尺寸與錨點、顏色處理、幀率、文字換行；
- **特效選項在特效名後**：每個特效專屬參數。

```sh
ttfx --help                 # 全部 37 個特效 + 終端選項
ttfx <effect> --help        # 單個特效的選項
ttfx --print-completion bash|zsh   # 產生 shell 補全
```

**選項名稱和預設值與 `tte` 完全一致**——所以現有的 `tte` 呼叫（如 `ls | tte decrypt --typing-speed 2`）只需要把二進位名稱換掉就能運作。這是 CLI 相容性目標的直接紅利。

### 4. 終端選項示例

```sh
# 固定畫布尺寸並忽略終端真實尺寸（腳本/測試常用）
ttfx --canvas-width 80 --canvas-height 24 --ignore-terminal-dimensions beams

# 調整幀率
ttfx --frame-rate 30 slide

# 重用畫布（不滾動預留空間）
ttfx --reuse-canvas decrypt
```

### 5. 行為細節

- **輸入**：stdin（tty 下為空時）、`--input-file`；空/空白輸入 → stdout 輸出 `NO INPUT.`，退出碼 1；
- **退出碼**：0 成功；1 執行時期錯誤（無輸入、特效不存在、檔案錯誤——訊息走 *stdout*；不支援的 ANSI 序列——訊息走 *stderr*，是的，真的這麼不對稱）；2 用法錯誤（參數解析，argparse/clap 慣例）；
- **訊號**：SIGINT 透過 flag/self-pipe 記錄並把控制權還給主迴圈，正常展開讓 RAII 收尾執行（`Drop` 單獨在訊號下不觸發），退出碼 1，無訊息（與 KeyboardInterrupt 一致）；
- **解碼**：嚴格 UTF-8，不損失性解碼；
- **作用域**：Linux 與 macOS。逐位元組 parity 套件釘在 Linux/glibc——Apple 的 libm 會把少數超越函式最後一位 ulp 捨入得不同，量化能掩蓋，但位元級比對會暴露。

## 保真度驗證體系：一份可檢驗的「逐位元組一致」

這套體系是專案最值得學習的方法論，總結為三層：

**第一層：共享隨機源。** 一個可移植的 xoshiro256++ 在 Rust 和 Python shim 中各實作一份。shim 在匯入 TTE 之前 monkeypatch 掉 `random.randint/choice/shuffle/randrange/uniform/random`。兩邊現在抽取完全相同的隨機序列——前提是 RNG 呼叫順序一致，而這正是忠實轉寫保證的、也正是 harness 驗證的。

**第二層：釘死順序。** shim 同時給 plan.md §4.3 清單裡的每個無序迭代站點打補丁（`BaseEffectIterator.update`、渲染層平局、middleout/unstable 的特效級集合迭代、`BreadthFirst` 的 links 集合遍歷），釘到與 Rust 版相同的規範順序。

**第三層：對抗「用修改過的 TTE 證明 parity」。** 因為 shim 修改了參考實作，專案單獨設了審計：所有確定性（無隨機、無時鐘）特效和整個 M0 預處理矩陣，**還要**與完全未修改的固定 CPython 執行逐位元組比對；shim 的補丁從構造上限定為順序/RNG/時鐘替換（diff 很小、被審查、隨 harness 提交）。

**幀捕獲**：Python 側用 `frame_rate=0` + 固定畫布迭代特效，每幀寫入長度前綴的 dump；Rust 側用隱藏的 `--parity-dump <seed>` 旗標做同樣的事；一個 differ 比較兩個流並報告第一個分歧的幀/行/列（帶解碼後的轉義檢視）。

**測試矩陣**：每個特效 2–3 種輸入文字（ASCII 多行、帶色 ANSI 輸入、參差短輸入）× 預設設定 × 1–2 個非預設設定；外加 M0 預處理的選項矩陣套件。PTY 位元組流測試則繞過幀 dump，直接比較兩端在偽終端下的**完整輸出流**：畫布準備、DEC 儲存/恢復、收尾——包括 `--reuse-canvas`/`--no-eol`/`--no-restore-cursor` 變體和 SIGINT 路徑。

萬一某個特效的 RNG 交錯順序實在無法比對（目前零個），還有 tier-2 兜底：結構幀比較 + 人工對照錄影簽字。目標：**零個 tier-2 特效**。

## 歸納總結：關鍵觀點

### 觀點一：語言選型要看「生活場景」，而不是「函式庫的身份」

TTE 是 Python 寫的，作為函式庫完全正確；但同一個工具住在 shell 管道裡時，65ms 的 import 和直譯器依賴就成了硬傷。**同一個軟體，在不同宿主場景下需要不同的交付形態。** ttfx 沒有「重寫以改進演算法」，只是換了一個更適合宿主環境的載體，就換來了 27.5× 的中位加速和 0.5ms 啟動。

### 觀點二：「像素級一致」是可以被機械化證明的

大多數移植專案靠人眼驗收。ttfx 證明：只要把**隨機性變成注入依賴**（共享 PRNG）、把**順序釘成規範**（排序/插入序）、把**時間虛擬化**（虛擬時鐘），「逐位元組一致」就從口號變成了 CI 裡 354 項自動化檢查。確定性是測試的基石。

### 觀點三：移植的最高境界是克制

面對上游 20 處「bug」，ttfx 的選擇是**復刻而不是修復**——因為修復會破壞等價性，而等價性是這個專案的全部價值。它甚至把「允許的差異清單」（§5 deliberate divergences）當成唯一合法的改動範圍，「範圍蔓延進『改進 TTE』」被列為風險項並配有緩解措施。**在移植場景裡，忠實比聰明更稀缺。**

### 觀點四：效能是正確架構的結果，不是目標

plan.md 裡「效能不是目標，只要不成為瓶頸」的表述反直覺但深刻：arena 架構、同步事件、顯式 RNG 傳遞——這些為**等價性**而做的設計，順帶產生了 27.5× 的加速。O(n²) 演算法原樣保留因為終端尺度下無壓力。**先正確，再快；快是正確性的副產品。**

### 觀點五：單一二進位是對「管道玩具」生態位的尊重

`<producer> | ttfx <effect>` 這種用法要求極低的啟動成本和零摩擦安裝。3.3MB 靜態二進位、零執行時期依賴、`--print-completion` 產生補全——每一個決策都在服務「活在管道裡」這個生態位。它還順帶解決了分發問題：下載即用，沒有 Python 版本地獄。

### 觀點六：開源生態的禮儀

「特效創意請提到上游」、上游程式碼不 vendored（「因為那是他們的程式碼」）、MIT 授權同時保留原作者版權、NOTICE 全文致謝——**移植專案如何與上游共處**，ttfx 給出了教科書式的答案。

## 適用場景分析

### 適合使用 ttfx 的場景

✅ **強烈推薦：**

- **Omarchy 使用者**：專案就是為 Omarchy 打造的，開箱即用；
- **shell 重度使用者**：把 `git log`、`ls`、`fortune` 的輸出變成視覺演出，成本為零；
- **示範與錄影**：終端示範需要「電影感」，37 種特效即插即用；
- **CI/腳本環境**：0.5ms 啟動 + 靜態二進位，容器裡也能跑；
- **追求確定性的開發者**：`--seed` 讓特效可重現，適合測試與教學截圖；
- **Rust 學習者**：`plan.md` 本身是一份極好的「如何做 parity 移植」的工程文件。

⚠️ **需要考慮：**

- **需要 Python 外掛特效的使用者**：ttfx 不支援 TTE 的 Python 外掛機制（沒有直譯器）；
- **需要與 Python 版本 `--seed` 互通的使用者**：隨機數演算法不同，跨實作不可重現；
- **非 Linux/macOS 平台**：Windows 不在支援範圍。

### 它不試圖解決的問題

- 不是 TTE 的替代品（函式庫場景請繼續用 Python 版）；
- 不追求「改進」特效（特效創意請提給上游）；
- 不處理寬字元（一個碼點 = 一個儲存格，與 TTE 一致，作為已知限制記錄在案）。

## 與 Omarchy 的淵源

ttfx 最初**只**為 Omarchy 而生——plan.md 裡寫著 "Linux only, targeted exclusively at Omarchy (Arch)"。它和 Omarchy 是一對：Omarchy 提供固執己見、美麗現代的 Linux 桌面，ttfx 為這個桌面提供同樣固執己見的終端演出。後來支援範圍放寬到 macOS，但血統清晰：這是一個從「為特定發行版打磨到極致」的生態位長出來的工具，而不是一個試圖討好所有人的通用專案。這種「為特定使用者群做到最好」的態度，和 Omarchy 的哲學一脈相承。

## 結語

ttfx 表面上是個終端玩具，實際上是份**移植工程的宣言**。它示範了三件罕見的事：

1. **什麼叫認真**——不是「功能對齊」，而是「逐位元組對齊」，並且用機械化測試證明；
2. **什麼叫克制**——復刻 20 處上游怪癖、把「改進」列為風險、明確「移植不加戲」；
3. **什麼叫正確的效能觀**——為等價性而設計的架構順帶帶來 27.5× 加速，而效能本身從不被當作目標。

如果你在終端裡工作、喜歡一點視覺魔法、或者正在思考「如何把一個大專案從一門語言移植到另一門」，ttfx 的 README、plan.md 和 37 個特效 GIF 都值得你花一個下午。跑起來的那一刻，`ls -la | ttfx decrypt` 會告訴你：**0.5 毫秒的啟動延遲，換來的是每一幀都值得等待的演出。**

---

**參考資源：**

- [ttfx GitHub 倉庫](https://github.com/omacom-io/ttfx)
- [TerminalTextEffects（上游原版，ChrisBuilds）](https://github.com/ChrisBuilds/terminaltexteffects)
- [Omarchy（ttfx 的誕生地）](https://omarchy.org)