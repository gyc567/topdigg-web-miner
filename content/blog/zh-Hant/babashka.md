---
title: 'Babashka：Clojure腳本神器——用優雅的函數式語言替代Bash，讓腳本編寫煥然一新'
date: "2026-08-14"
description: "深度解析Babashka項目——基於GraalVM native-image和SCI解釋器的極速啟動Clojure運行時，無需JVM即可在命令列享受完整的Clojure scripting體驗，支持Pods擴展、任務運行器和豐富的內置庫"
tags:
  - Babashka
  - Clojure
  - 腳本語言
  - GraalVM
  - 函數式編程
  - SCI
  - 命令列工具
  - Java互操作
categories:
  - 編程語言
  - 函數式編程
  - 腳本工具
  - 命令列工具
  - Clojure生態
---

# Babashka：Clojure腳本神器——用優雅的函數式語言替代Bash

## 項目背景與核心問題

### Bash的困境

作為Linux和macOS開發者的日常工具，Bash伴隨我們走過了无数個加班夜晚。然而，隨著項目規模的增長，Bash腳本的局限性日益凸顯：

| 問題 | 描述 | 示例 |
|------|------|------|
| **可讀性差** | 複雜的字串處理和條件邏輯 | `if [[ $foo =~ ^bar* && ! -z $baz ]]; then` |
| **調試困難** | 缺乏完善的錯誤處理和調試工具 | 變量作用域陷阱，set -x輸出混亂 |
| **缺乏抽象** | 沒有模組系統和代碼複用機制 | 複製粘貼成為唯一的「複用」方式 |
| **數據類型貧乏** | 僅有字串和陣列 | JSON解析需要調用外部工具 |
| **跨平台問題** | Linux/macOS命令差異 | GNU vs BSD `sed`、`date`行為不同 |

> **「生活太短，不值得花時間去記住怎麼寫Bash代碼。我感覺自己解放了。」**
> — @laheadle on Clojurians Slack

### Clojure的力量

Clojure是一門運行在JVM上的現代Lisp方言，以其簡潔的語法、強大的數據字面量和不可變數據結構著稱。然而，傳統JVM Clojure的啟動速度（幾秒甚至幾十秒）使其無法勝任快速腳本任務。

**核心矛盾**：能否兼得Clojure的表達力和腳本的便捷性？

### Babashka的誕生

Babashka正是為解決這一矛盾而生——它是一個**極速啟動的原生Clojure腳本運行時**，讓你在命令列中享受完整的Clojure scripting體驗，同時擁有毫秒級的啟動速度。

---

## 項目概述

### 什麼是Babashka？

Babashka是一個用**GraalVM native-image**編譯的**原生Clojure腳本環境**。它的核心設計目標是：**在你原本會使用Bash的地方，用Clojure來替代**。

### 核心特性一覽

| 特性 | 描述 |
|------|------|
| ⚡ **極速啟動** | 毫秒級啟動時間（~20-50ms），比JVM Clojure快100倍以上 |
| 🖥️ **原生二進制** | 無需安裝JVM，自包含的原生可執行檔 |
| 🏠 **跨平台** | 支持Linux、macOS、Windows |
| 🔋 **內置電池** | 包含常用庫：CLI、JSON、檔案系統、HTTP客戶端等 |
| 🧩 **Pods擴展** | 通過外部程式擴展功能，支持任意語言編寫 |
| 🎯 **任務運行器** | 內置類似make/just的任務系統 |
| ☕ **Java互操作** | 支持System、File、java.time.*、java.nio.* |
| 🧵 **多線程** | 支持pmap、future等並行機制 |

### 非目標

了解Babashka不是什麼同樣重要：

| 非目標 | 說明 |
|--------|------|
| ❌ 不是Bash DSL | Babashka是純Clojure，不是混合格式 |
| ❌ 不替代Shell | Babashka不打算成為全面的Shell替代品 |

---

## 技術架構解析

### 核心技術棧

Babashka的技術選擇體現了精妙的工程權衡：

```
┌─────────────────────────────────────────────────────┐
│                    Babashka                          │
│              (原生Clojure腳本運行時)                    │
└─────────────────────────────────────────────────────┘
                          ↑
┌─────────────────────────────────────────────────────┐
│                 GraalVM native-image                  │
│             (AOT編譯為原生可執行檔)                    │
└─────────────────────────────────────────────────────┘
                          ↑
┌─────────────────────────────────────────────────────┐
│              SCI (Small Clojure Interpreter)          │
│          (解釋執行Clojure代碼的位元組碼解釋器)           │
└─────────────────────────────────────────────────────┘
```

### SCI：輕量級Clojure解釋器

SCI是Babashka的核心，它是一個**可嵌入式的小型Clojure解釋器**。與JVM Clojure編譯成Java位元組碼不同，SCI解釋執行Clojure的AST。

**SCI的設計哲學**：
- **小巧**：核心解釋器僅幾千行代碼
- **可嵌入**：可以集成到任何Java程式中
- **兼容**：盡可能兼容JVM Clojure的語義

### GraalVM native-image

GraalVM native-image將Java/GraalVM應用AOT編譯為原生可執行檔：

**優勢**：
- 🚀 **極速啟動**：無需JVMwarmup
- 💾 **低記憶體**：記憶體佔用遠小於JVM
- 📦 **自包含**：靜態連結，無外部依賴

### 數據類型一致性

Babashka使用與JVM Clojure完全相同的數據類型：

```clojure
;; 數字
bb -e '(type 42)'  ;=> java.lang.Long
bb -e '(type 3.14)' ;=> java.lang.Double

;; 字串
bb -e '(type "hello")' ;=> java.lang.String

;; 集合
bb -e '(type [1 2 3])' ;=> clojure.lang.PersistentVector
bb -e '(type {:a 1 :b 2})' ;=> clojure.lang.PersistentArrayMap
```

---

## 快速上手

### 安裝

#### macOS / Linux (Homebrew)

```bash
brew install borkdude/brew/babashka
```

#### Windows (Scoop)

```powershell
scoop install babashka
```

#### Linux (腳本安裝)

```bash
curl -sLO https://raw.githubusercontent.com/babashka/babashka/master/install
chmod +x install
./install
```

#### Nix

```bash
nix-env -iA nixpkgs-unstable.babashka
```

#### 手動安裝

從 [GitHub Releases](https://github.com/babashka/babashka/releases) 下載對應平台的二進制檔案即可。

### 驗證安裝

```bash
bb --version
#=> babashka v1.3.181

bb -e '(println "Hello, Babashka!")'
#=> Hello, Babashka!
```

### 基礎用法

#### 1. 單行表達式

```bash
# 直接計算
bb -e '(+ 1 2 3)'
#=> 6

# 字串操作
bb -e '(clojure.string/upper-case "hello")'
#=> "HELLO"

# 檔案系統
bb -e '(->> (fs/list-dir ".") (filter fs/directory?) count)'
#=> 統計當前目錄子目錄數量
```

#### 2. 腳本檔案

創建 `hello.clj`：

```clojure
#!/usr/bin/env bb

;; 導入命名空間
(require '[clojure.string :as str])
(require '[babashka.fs :as fs])

;; 主邏輯
(defn greet [name]
  (println (str "Hello, " name "!")))

;; 執行
(greet "World")

;; 檔案操作示例
(doseq [f (fs/list-dir ".")]
  (println (fs/file-name f)))
```

執行：

```bash
chmod +x hello.clj
./hello.clj
```

#### 3. 使用bb.edn配置項目

創建 `bb.edn`：

```clojure
{:paths ["src" "test"]
 :deps {org.clojure/data.json {:mvn/version "2.4.0"}}

 :tasks
 {:requires ([babashka.fs :as fs]
            [babashka.process :as process])

  clean
  {:task (fs/delete-tree "target")}

  build
  {:depends [clean]
   :task (println "Building...")}

  test
  {:depends [build]
   :task (println "Running tests...")

  repl
  {:task (println "Starting REPL...")}}}
```

運行任務：

```bash
bb tasks      # 列出所有任務
bb clean      # 清理
bb build      # 構建
bb run build  # 顯式運行build任務
```

---

## 內置庫詳解

Babashka自帶「電池」，包含常用的Clojure庫：

### 1. babashka.cli - 命令列參數解析

```clojure
(require '[babashka.cli :as cli])

(def spec {:port {:coerce {:val  :parse-long
                          :env  "PORT"}
                :default 3000}
          :host {:default "localhost"}
          :verbose {:alias :v
                    :default false}})

(let [opts (cli/parse-opts *command-line-args* spec)]
  (println "Starting server on" (:host opts) ":" (:port opts)))
```

使用：

```bash
bb myscript.clj --port 8080 -v
```

### 2. babashka.http-client - HTTP客戶端

```clojure
(require '[babashka.http-client :as http])

;; GET請求
(let [resp (http/get "https://api.github.com/repos/babashka/babashka")]
  (println "Stars:" (get-in resp [:body :stargazers_count])))

;; POST請求
(http/post "https://httpbin.org/post"
           {:headers {"Content-Type" "application/json"}
            :body (json/encode {:name "test"})})
```

### 3. babashka.process - 進程管理

```clojure
(require '[babashka.process :as process])

;; 執行外部命令
(-> (process/shell "git status")
    :out
    println)

;; 並行執行
(let [results (process/pmap-shell
               ["ls -la" "pwd" "echo hello"])]
  (doseq [r results]
    (println (:out r))))

;; 管線
(-> (process/pipeline ["grep -r 'TODO'" "."])
    :out
    println)
```

### 4. babashka.fs - 檔案系統

```clojure
(require '[babashka.fs :as fs])

;; 路徑操作
(fs/file-name "/path/to/file.txt")  ;=> "file.txt"
(fs/parent "/path/to/file.txt")      ;=> "/path/to"
(fs/extension "/path/to/file.txt")   ;=> ".txt"

;; 目錄操作
(fs/create-dir "tmp")
(fs/list-dir ".")  ;=> 返回檔案序列
(fs/walkglob "." "*.clj")  ;=> 遞歸查找.clj檔案

;; 檔案操作
(fs/copy "src.txt" "dst.txt")
(fs/move "old.txt" "new.txt")
(fs/delete "file.txt")

;; 判斷
(fs/directory? "/path")     ;=> true/false
(fs/exists? "/path/file")   ;=> true/false
```

### 5. cheshire - JSON處理

```clojure
(require '[cheshire.core :as json])

;; 解析JSON
(json/parse-string "{\"name\": \"Alice\", \"age\": 30}" true)
;;=> {:name "Alice" :age 30}

;; 生成JSON
(json/generate-string {:name "Bob" :scores [90 85 92]})
;;=> "{\"name\":\"Bob\",\"scores\":[90,85,92]}"
```

### 6. clj-yaml - YAML處理

```clojure
(require '[clj-yaml.core :as yaml])

;; 解析YAML
(yaml/parse-string "
name: Alice
age: 30
languages:
  - Clojure
  - Python
")
;;=> {:name "Alice" :age 30 :languages ["Clojure" "Python"]}

;; 生成YAML
(yaml/generate-string {:name "Bob" :active true})
;;=> "active: true\nname: Bob\n"
```

---

## Pod系統：無限擴展

### 什麼是Pod？

Pod是Babashka的殺手級特性——**允許外部程式作為Clojure庫來調用**。這意味著你可以用任何語言編寫原生二進制程式，然後在Babashka中像Clojure函數一樣調用它。

### 工作原理

```
┌─────────────────┐     STDIN/STDERR     ┌─────────────────┐
│    Babashka     │ ◄──────────────────► │      Pod        │
│   (Pod Client)  │    Bencode編碼消息    │  (外部程式)      │
└─────────────────┘                      └─────────────────┘
        │
        │ invoke操作
        │ 加載命名空間
        │ 調用函數
        ▼
   調用方式：
   (require '[pod.babashka.sqlite :as sql])
   (sql/execute! db ["SELECT * FROM users"])
```

### 協議操作

| 操作 | 描述 |
|------|------|
| `describe` | Pod聲明其支持的命名空間和變量 |
| `invoke` | 調用Pod中的函數 |
| `shutdown` | 優雅關閉Pod |
| `out/err` | Pod輸出到stdout/stderr |
| `load-ns` | 延遲加載命名空間 |

### 使用Pod

#### 內置Pod聲明

在 `bb.edn` 中聲明：

```clojure
{:pods {org.babashka/go-sqlite3 {:version "0.2.3"}}}
```

#### 動態加載

```clojure
(require '[babashka.pods :as pods])

;; 加載Pod
(pods/load-pod "pod-babashka-hsqldb")

;; 使用Pod命名空間
(require '[pod.babashka.hsqldb :as sql])

;; 執行SQL
(sql/execute! db-spec ["CREATE TABLE foo (foo int)"])
```

### 常用Pod

| Pod | 描述 | 實現語言 |
|-----|------|---------|
| `pod-babashka-hsqldb` | HSQLDB資料庫 | Java |
| `pod-babashka-sqlite` | SQLite資料庫 | Go |
| `pod-lispyclouds-sqlite` | SQLite資料庫 | Python |

---

## 任務運行器

Babashka內置了類似make/just/npm scripts的任務系統，無需額外工具即可管理項目。

### 基本用法

```clojure
;; bb.edn
{:tasks
 {:requires ([babashka.fs :as fs]
            [babashka.process :as process])

  ;; 簡單任務
  hello
  {:task (println "Hello!")}

  ;; 帶依賴的任務
  build
  {:depends [clean]
   :task (println "Building...")}

  clean
  {:task (fs/delete-tree "target")}}
```

### 高級特性

#### 並行執行

```clojure
{:tasks
 {build-all
  {:task (process/pmap-shell ["lein uberjar" "npm run build"])
   :parallel? true}}}
```

#### 任務鏈

```clojure
{:tasks
 {setup {:task (println "Setting up...")}
  compile {:depends [setup] :task (println "Compiling...")}
  test {:depends [compile] :task (println "Testing...")}
  deploy {:depends [test] :task (println "Deploying...")}}}
```

運行整個鏈：

```bash
bb deploy  # 自動按依賴順序執行
```

---

## 與JVM Clojure的差異

Babashka使用SCI解釋器，與JVM Clojure存在一些差異：

### 支持的特性

| 特性 | 狀態 |
|------|------|
| 基礎數據類型 | ✅ 完整支持 |
| Persistent Data Structures | ✅ 完整支持 |
| 函數定義 | ✅ `defn`, `def`, `fn` |
| 宏 | ✅ 完整支持 |
| 多線程 | ✅ `future`, `pmap`, `thread-local` |
| REPL | ✅ 內置支持 |

### 不支持的特性

| 特性 | 原因 |
|------|------|
| `deftype` | 解釋器限制 |
| `defprotocol` | 使用multimethod替代 |
| `defrecord` | 使用普通map替代 |
| 無 boxed 數學運算 | 解釋器限制 |

---

## 實戰教程：自動化腳本

### 場景1：Git倉庫批量操作

```clojure
#!/usr/bin/env bb

(require '[babashka.fs :as fs]
         '[babashka.process :as process])

(def repos ["/path/to/project1"
            "/path/to/project2"])

(defn git-cmd [repo cmd]
  (-> (process/shell :dir repo :cmd (str "git " cmd))
      :out
      str/trim))

(defn pull-all []
  (doseq [repo repos]
    (println "Pulling:" repo)
    (try
      (println (git-cmd repo "pull"))
      (catch Exception e
        (println "Failed:" (ex-message e))))))

(pull-all)
```

### 場景2：HTTP API監控

```clojure
#!/usr/bin/env bb

(require '[babashka.http-client :as http]
         '[cheshire.core :as json])

(def endpoints [{:name "用戶服務"
                :url "https://api.example.com/users/health"}])

(defn check-endpoint [{:keys [name url]}]
  (try
    (let [resp (http/get url {:timeout 5000})]
      {:name name :status "OK"})
    (catch Exception e
      {:name name :status "FAIL" :error (ex-message e)})))

(defn -main [& args]
  (doseq [r (map check-endpoint endpoints)]
    (println (:name r) ": " (:status r))))

(-main)
```

---

## 設計哲學總結

### 1. 務實主義哲學

Babashka不是追求完美兼容JVM Clojure，而是**務實地選擇最合適的實現**：

| 權衡 | 選擇 | 原因 |
|------|------|------|
| 啟動速度 vs 運行速度 | 解釋執行 | 腳本場景下啟動更重要 |
| 兼容性 vs 簡潔性 | SCI解釋器 | 輕量嵌入，無需JVM |

### 2. Batteries Included原則

Babashka遵循「內置電池」哲學，**80%場景的常用工具**直接打包：

- 無需`pip install` / `npm install`
- 無需網絡下載依賴
- 真正的「下載即用」

### 3. Pod模式：語言擴展的正確姿勢

Pod通過進程邊界隔離外部程式，**既保證了安全性，又提供了真正的語言無關擴展能力**。

---

## 核心觀點與結論

### 核心觀點

1. **腳本語言的選擇影響開發體驗** — 現代腳本語言配合極速啟動運行時可顯著提升體驗
2. **啟動速度是腳本語言的關鍵指標** — 毫秒級啟動比每秒執行數百萬次操作更重要
3. **Pod模式是語言擴展的正確姿勢** — 進程邊界隔離兼顧安全性和擴展性
4. **內置電池 vs 依賴管理** — 腳本場景下「開箱即用」往往更實用

### 使用場景推薦

| 場景 | 推薦工具 |
|------|---------|
| 系統運維腳本 | Babashka ✅ |
| CI/CD腳本 | Babashka ✅ |
| 快速原型 | Babashka ✅ |
| Web服務 | JVM Clojure |

---

## 參考資源

| 資源 | 連結 |
|------|------|
| 官網 | [babashka.org](https://babashka.org/) |
| GitHub | [github.com/babashka/babashka](https://github.com/babashka/babashka) |
| 官方文檔 | [book.babashka.org](https://book.babashka.org/) |
| Pods倉庫 | [github.com/babashka/pods](https://github.com/babashka/pods) |
| 許可證 | EPL-1.0 |

---

## 結語

Babashka代表了腳本語言發展的一個重要方向：**在保持語言優雅性的同時，極致優化用戶體驗**。通過SCI解釋器和GraalVM native-image的精妙組合，它實現了「魚和熊掌兼得」——既有Clojure的表達力，又有腳本的便捷性。

> **「生活太短，不值得花時間去記住怎麼寫Bash代碼。」**

也許，是時候給你的腳本換一種更優雅的寫法了。
