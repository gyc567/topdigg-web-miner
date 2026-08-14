---
title: 'Babashka：Clojure脚本神器——用优雅的函数式语言替代Bash，让脚本编写焕然一新'
date: "2026-08-14"
description: "深度解析Babashka项目——基于GraalVM native-image和SCI解释器的极速启动Clojure运行时，无需JVM即可在命令行享受完整的Clojure scripting体验，支持Pods扩展、任务运行器和丰富的内置库"
tags:
  - Babashka
  - Clojure
  - 脚本语言
  - GraalVM
  - 函数式编程
  - SCI
  - 命令行工具
  - Java互操作
categories:
  - 编程语言
  - 函数式编程
  - 脚本工具
  - 命令行工具
  - Clojure生态
---

# Babashka：Clojure脚本神器——用优雅的函数式语言替代Bash

## 项目背景与核心问题

### Bash的困境

作为Linux和macOS开发者的日常工具，Bash伴随我们走过了无数个加班夜晚。然而，随着项目规模的增长，Bash脚本的局限性日益凸显：

| 问题 | 描述 | 示例 |
|------|------|------|
| **可读性差** | 复杂的字符串处理和条件逻辑 | `if [[ $foo =~ ^bar* && ! -z $baz ]]; then` |
| **调试困难** | 缺乏完善的错误处理和调试工具 | 变量作用域陷阱，set -x输出混乱 |
| **缺乏抽象** | 没有模块系统和代码复用机制 | 复制粘贴成为唯一的"复用"方式 |
| **数据类型贫乏** | 仅有字符串和数组 | JSON解析需要调用外部工具 |
| **跨平台问题** | Linux/macOS命令差异 | GNU vs BSD `sed`、`date`行为不同 |

> **"生活太短，不值得花时间去记住怎么写Bash代码。我感觉自己解放了。"**
> — @laheadle on Clojurians Slack

### Clojure的力量

Clojure是一门运行在JVM上的现代Lisp方言，以其简洁的语法、强大的数据字面量和不可变数据结构著称。然而，传统JVM Clojure的启动速度（几秒甚至几十秒）使其无法胜任快速脚本任务。

**核心矛盾**：能否兼得Clojure的表达力和脚本的便捷性？

### Babashka的诞生

Babashka正是为解决这一矛盾而生——它是一个**极速启动的原生Clojure脚本运行时**，让你在命令行中享受完整的Clojure scripting体验，同时拥有毫秒级的启动速度。

---

## 项目概述

### 什么是Babashka？

Babashka是一个用**GraalVM native-image**编译的**原生Clojure脚本环境**。它的核心设计目标是：**在你原本会使用Bash的地方，用Clojure来替代**。

### 核心特性一览

| 特性 | 描述 |
|------|------|
| ⚡ **极速启动** | 毫秒级启动时间（~20-50ms），比JVM Clojure快100倍以上 |
| 🖥️ **原生二进制** | 无需安装JVM，自包含的原生可执行文件 |
| 🏠 **跨平台** | 支持Linux、macOS、Windows |
| 🔋 **内置电池** | 包含常用库：CLI、JSON、文件系统、HTTP客户端等 |
| 🧩 **Pods扩展** | 通过外部程序扩展功能，支持任意语言编写 |
| 🎯 **任务运行器** | 内置类似make/just的任务系统 |
| ☕ **Java互操作** | 支持System、File、java.time.*、java.nio.* |
| 🧵 **多线程** | 支持pmap、future等并行机制 |

### 非目标

了解Babashka不是什么同样重要：

| 非目标 | 说明 |
|--------|------|
| ❌ 不是Bash DSL | Babashka是纯Clojure，不是混合格式 |
| ❌ 不替代Shell | Babashka不打算成为全面的Shell替代品 |

---

## 技术架构解析

### 核心技术栈

Babashka的技术选择体现了精妙的工程权衡：

```
┌─────────────────────────────────────────────────────┐
│                    Babashka                          │
│              (原生Clojure脚本运行时)                  │
└─────────────────────────────────────────────────────┘
                          ↑
┌─────────────────────────────────────────────────────┐
│                 GraalVM native-image                │
│             (AOT编译为原生可执行文件)                   │
└─────────────────────────────────────────────────────┘
                          ↑
┌─────────────────────────────────────────────────────┐
│              SCI (Small Clojure Interpreter)          │
│          (解释执行Clojure代码的字节码解释器)            │
└─────────────────────────────────────────────────────┘
```

### SCI：轻量级Clojure解释器

SCI是Babashka的核心，它是一个**可嵌入式的小型Clojure解释器**。与JVM Clojure编译成Java字节码不同，SCI解释执行Clojure的AST。

**SCI的设计哲学**：
- **小巧**：核心解释器仅几千行代码
- **可嵌入**：可以集成到任何Java程序中
- **兼容**：尽可能兼容JVM Clojure的语义

### GraalVM native-image

GraalVM native-image将Java/GraalVM应用AOT编译为原生可执行文件：

**优势**：
- 🚀 **极速启动**：无需JVMwarmup
- 💾 **低内存**：内存占用远小于JVM
- 📦 **自包含**：静态链接，无外部依赖

### 数据类型一致性

Babashka使用与JVM Clojure完全相同的数据类型：

```clojure
;; 数字
bb -e '(type 42)'  ;=> java.lang.Long
bb -e '(type 3.14)' ;=> java.lang.Double

;; 字符串
bb -e '(type "hello")' ;=> java.lang.String

;; 集合
bb -e '(type [1 2 3])' ;=> clojure.lang.PersistentVector
bb -e '(type {:a 1 :b 2})' ;=> clojure.lang.PersistentArrayMap
```

---

## 快速上手

### 安装

#### macOS / Linux (Homebrew)

```bash
brew install borkdude/brew/babashka
```

#### Windows (Scoop)

```powershell
scoop install babashka
```

#### Linux (脚本安装)

```bash
curl -sLO https://raw.githubusercontent.com/babashka/babashka/master/install
chmod +x install
./install
```

#### Nix

```bash
nix-env -iA nixpkgs-unstable.babashka
```

#### 手动安装

从 [GitHub Releases](https://github.com/babashka/babashka/releases) 下载对应平台的二进制文件即可。

### 验证安装

```bash
bb --version
#=> babashka v1.3.181

bb -e '(println "Hello, Babashka!")'
#=> Hello, Babashka!
```

### 基础用法

#### 1. 单行表达式

```bash
# 直接计算
bb -e '(+ 1 2 3)'
#=> 6

# 字符串操作
bb -e '(clojure.string/upper-case "hello")'
#=> "HELLO"

# 文件系统
bb -e '(->> (fs/list-dir ".") (filter fs/directory?) count)'
#=> 统计当前目录子目录数量
```

#### 2. 脚本文件

创建 `hello.clj`：

```clojure
#!/usr/bin/env bb

;; 导入命名空间
(require '[clojure.string :as str])
(require '[babashka.fs :as fs])

;; 主逻辑
(defn greet [name]
  (println (str "Hello, " name "!")))

;; 执行
(greet "World")

;; 文件操作示例
(doseq [f (fs/list-dir ".")]
  (println (fs/file-name f)))
```

执行：

```bash
chmod +x hello.clj
./hello.clj
```

#### 3. 使用bb.edn配置项目

创建 `bb.edn`：

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

运行任务：

```bash
bb tasks      # 列出所有任务
bb clean      # 清理
bb build      # 构建
bb run build  # 显式运行build任务
```

---

## 内置库详解

Babashka自带"电池"，包含常用的Clojure库：

### 1. babashka.cli - 命令行参数解析

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

### 2. babashka.http-client - HTTP客户端

```clojure
(require '[babashka.http-client :as http])

;; GET请求
(let [resp (http/get "https://api.github.com/repos/babashka/babashka")]
  (println "Stars:" (get-in resp [:body :stargazers_count])))

;; POST请求
(http/post "https://httpbin.org/post"
           {:headers {"Content-Type" "application/json"}
            :body (json/encode {:name "test"})})
```

### 3. babashka.process - 进程管理

```clojure
(require '[babashka.process :as process])

;; 执行外部命令
(-> (process/shell "git status")
    :out
    println)

;; 并行执行
(let [results (process/pmap-shell
               ["ls -la" "pwd" "echo hello"])]
  (doseq [r results]
    (println (:out r))))

;; 管道
(-> (process/pipeline ["grep -r 'TODO'" "."])
    :out
    println)
```

### 4. babashka.fs - 文件系统

```clojure
(require '[babashka.fs :as fs])

;; 路径操作
(fs/file-name "/path/to/file.txt")  ;=> "file.txt"
(fs/parent "/path/to/file.txt")      ;=> "/path/to"
(fs/extension "/path/to/file.txt")   ;=> ".txt"

;; 目录操作
(fs/create-dir "tmp")
(fs/list-dir ".")  ;=> 返回文件序列
(fs/walkglob "." "*.clj")  ;=> 递归查找.clj文件

;; 文件操作
(fs/copy "src.txt" "dst.txt")
(fs/move "old.txt" "new.txt")
(fs/delete "file.txt")

;; 判断
(fs/directory? "/path")     ;=> true/false
(fs/exists? "/path/file")   ;=> true/false
```

### 5. cheshire - JSON处理

```clojure
(require '[cheshire.core :as json])

;; 解析JSON
(json/parse-string "{\"name\": \"Alice\", \"age\": 30}" true)
;;=> {:name "Alice" :age 30}

;; 生成JSON
(json/generate-string {:name "Bob" :scores [90 85 92]})
;;=> "{\"name\":\"Bob\",\"scores\":[90,85,92]}"

;; 流式解析大文件
(with-open [rdr (io/reader "large.json")]
  (json/parse-stream rdr true))
```

### 6. clojure.tools.cli - 高级CLI

```clojure
(require '[clojure.tools.cli :refer [parse-opts]])

(def cli-options
  [["-p" "--port PORT" "Port number"
    :default 80
    :parse-fn #(Integer/parseInt %)]
   ["-h" "--help"]])

(let [opts (parse-opts *command-line-args* cli-options)]
  (when (:help (:options opts))
    (println (:summary opts))
    (System/exit 0)))
```

### 7. clj-yaml - YAML处理

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

## Pod系统：无限扩展

### 什么是Pod？

Pod是Babashka的杀手级特性——**允许外部程序作为Clojure库来调用**。这意味着你可以用任何语言编写原生二进制程序，然后在Babashka中像Clojure函数一样调用它。

### 工作原理

```
┌─────────────────┐     STDIN/STDERR     ┌─────────────────┐
│    Babashka     │ ◄──────────────────► │      Pod        │
│   (Pod Client)   │    Bencode编码消息    │  (外部程序)      │
└─────────────────┘                      └─────────────────┘
        │
        │ invoke操作
        │ 加载命名空间
        │ 调用函数
        ▼
   调用方式：
   (require '[pod.babashka.sqlite :as sql])
   (sql/execute! db ["SELECT * FROM users"])
```

### 协议操作

| 操作 | 描述 |
|------|------|
| `describe` | Pod声明其支持的命名空间和变量 |
| `invoke` | 调用Pod中的函数 |
| `shutdown` | 优雅关闭Pod |
| `out/err` | Pod输出到stdout/stderr |
| `load-ns` | 延迟加载命名空间 |

### 使用Pod

#### 内置Pod声明

在 `bb.edn` 中声明：

```clojure
{:pods {org.babashka/go-sqlite3 {:version "0.2.3"}}}
```

#### 动态加载

```clojure
(require '[babashka.pods :as pods])

;; 加载Pod
(pods/load-pod "pod-babashka-hsqldb")

;; 使用Pod命名空间
(require '[pod.babashka.hsqldb :as sql])

;; 执行SQL
(def db-spec {:dbtype "hsql"
             :dbname "testdb"})

(sql/execute! db-spec ["CREATE TABLE foo (foo int)"])
(sql/execute! db-spec ["INSERT INTO foo VALUES (1), (2), (3)"])
(sql/query db-spec ["SELECT * FROM foo"])
```

### 常用Pod

| Pod | 描述 | 实现语言 |
|-----|------|---------|
| `pod-babashka-hsqldb` | HSQLDB数据库 | Java |
| `pod-babashka-sqlite` | SQLite数据库 | Go |
| `pod-lispyclouds-sqlite` | SQLite数据库 | Python |

---

## 任务运行器

Babashka内置了类似make/just/npm scripts的任务系统，无需额外工具即可管理项目。

### 基本用法

```clojure
;; bb.edn
{:tasks
 {:requires ([babashka.fs :as fs]
            [babashka.process :as process])

  ;; 简单任务
  hello
  {:task (println "Hello!")}

  ;; 带依赖的任务
  build
  {:depends [clean]
   :task (println "Building...")}

  clean
  {:task (fs/delete-tree "target")}

  ;; 带参数的任務
  greet
  {:params [{:name "world" :desc "Name to greet"}]
   :task (println (str "Hello, " name "!"))}}}
```

### 高级特性

#### 并行执行

```clojure
{:tasks
 {build-all
  {:task (let [args ["lein uberjar"
                     "npm run build"
                     "cargo build --release"]]
             (process/pmap-shell args))
   :parallel? true}}}
```

#### 钩子(Hooks)

```clojure
{:tasks
 {:init (println "Initializing...")
  :enter (println "Entering task:" *task*)
  :leave (println "Leaving task:" *task*)

  mytask {:task (println "Doing work...")}}
```

#### 任务链

```clojure
{:tasks
 {setup
  {:task (println "Setting up...")}

  compile
  {:depends [setup]
   :task (println "Compiling...")}

  test
  {:depends [compile]
   :task (println "Testing...")}

  deploy
  {:depends [test]
   :task (println "Deploying...")}}}
```

运行整个链：

```bash
bb deploy  # 自动按依赖顺序执行setup → compile → test → deploy
```

---

## 与JVM Clojure的差异

Babashka使用SCI解释器，与JVM Clojure存在一些差异：

### 支持的特性

| 特性 | 状态 |
|------|------|
| 基础数据类型 | ✅ 完整支持 |
| Persistent Data Structures | ✅ 完整支持 |
| 函数定义 | ✅ `defn`, `def`, `fn` |
| 宏 | ✅ 完整支持 |
| 多线程 | ✅ `future`, `pmap`, `thread-local` |
| core.async | ✅ 完整支持 |
| REPL | ✅ 内置支持 |

### 不支持的特性

| 特性 | 原因 |
|------|------|
| `deftype` | 解释器限制 |
| `definterface` | 解释器限制 |
| `defprotocol` | 使用multimethod替代 |
| `defrecord` | 使用普通map替代 |
| 无boxed数学运算 | 解释器限制 |
| 无限循环 | 解释器开销 |

### 性能差异

```clojure
;; JVM Clojure: 循环快，但启动慢
;; Babashka: 启动极快，但解释执行有开销

;; 示例：排序
(time (sort [1000000个随机数...]))
;; JVM Clojure: 排序快，但JVM启动就要500ms+
;; Babashka: 启动只需20ms，但排序稍慢
```

### 互操作差异

```clojure
;; Java互操作
(import '[java.time Instant Duration])

;; Babashka支持的Java类
java.lang.*          ; ✅
java.io.*            ; ✅
java.math.*          ; ✅
java.time.*          ; ✅ (部分)
java.nio.*           ; ✅ (部分)
java.net.*           ; ✅
;; 其他java.*: 仅预选择的类可用
```

---

## 实战教程：构建自动化脚本

### 场景1：Git仓库批量操作

```clojure
#!/usr/bin/env bb

(require '[babashka.fs :as fs]
         '[babashka.process :as process])

;; 配置
(def repos ["/path/to/project1"
            "/path/to/project2"
            "/path/to/project3"])

(defn git-cmd [repo cmd]
  (-> (process/shell :dir repo :cmd (str "git " cmd))
      :out
      str/trim))

;; 批量拉取更新
(defn pull-all []
  (doseq [repo repos]
    (println "Pulling:" repo)
    (try
      (println (git-cmd repo "pull"))
      (catch Exception e
        (println "Failed:" (ex-message e))))))

;; 批量状态检查
(defn status-all []
  (doseq [repo repos]
    (let [status (git-cmd repo "status --porcelain")]
      (when (not (str/blank? status))
        (println repo ":")
        (println status)))))

;; 主程序
(defn -main [& args]
  (let [cmd (first args)]
    (case cmd
      "pull" (pull-all)
      "status" (status-all)
      (println "Usage: git-batch.clj {pull|status}"))))

(-main (first *command-line-args*))
```

### 场景2：HTTP API监控

```clojure
#!/usr/bin/env bb

(require '[babashka.http-client :as http]
         '[cheshire.core :as json]
         '[clojure.string :as str])

(def endpoints [{:name "用户服务"
                :url "https://api.example.com/users/health"}
               {:name "订单服务"
                :url "https://api.example.com/orders/health"}
               {:name "支付服务"
                :url "https://api.example.com/pay/health"}])

(defn check-endpoint [{:keys [name url]}]
  (try
    (let [resp (http/get url {:timeout 5000})
          body (json/parse-string (:body resp) true)
          status (:status body)]
      {:name name :status "OK" :latency 0})
    (catch Exception e
      {:name name :status "FAIL" :error (ex-message e)})))

(defn -main [& args]
  (println "=== API Health Check ===")
  (let [results (mapv check-endpoint endpoints)
        all-ok (every? #(= "OK" (:status %)) results)]
    (doseq [r results]
      (println (:name r) ": " (:status r)
               (when (:error r) (str "(" (:error r) ")"))))
    (println "===================")
    (System/exit (if all-ok 0 1))))

(-main)
```

### 场景3：日志分析

```clojure
#!/usr/bin/env bb

(require '[clojure.string :as str]
         '[clojure.edn :as edn])

;; 统计错误日志
(defn analyze-log [log-file]
  (let [lines (str/split-lines (slurp log-file))
        errors (filter #(str/includes? % "ERROR") lines)
        warnings (filter #(str/includes? % "WARN") lines)]
    {:total (count lines)
     :errors (count errors)
     :warnings (count warnings)
     :error-lines errors}))

;; 提取错误模式
(defn extract-patterns [errors]
  (->> errors
       (map #(re-find #"\d{4}-\d{2}-\d{2}.*?(?=ERROR)" %))
       (filter some?)
       frequencies
       (sort-by val >)
       (take 10)))

(defn -main [& args]
  (let [log-file (first args)
        analysis (analyze-log log-file)]
    (println "=== Log Analysis ===")
    (println "Total lines:" (:total analysis))
    (println "Errors:" (:errors analysis))
    (println "Warnings:" (:warnings analysis))
    (println "\nTop error patterns:")
    (doseq [[pattern count] (extract-patterns (:error-lines analysis))]
      (println (str count "x " pattern)))))

(-main (first *command-line-args*))
```

---

## 构建与开发

### 从源码构建

#### 前置要求

- Leiningen
- GraalVM 25 (设置 `$GRAALVM_HOME`)
- Windows: Visual Studio 2019 with C++ workload

#### 构建步骤

```bash
# 克隆仓库（含子模块）
git clone https://github.com/babashka/babashka --recursive
cd babashka

# 构建 uberjar
script/uberjar

# 编译原生镜像
script/compile
```

#### 编译选项

```bash
# 静态编译
BABASHKA_STATIC=true script/compile

# 精简模式（禁用所有特性）
BABASHKA_LEAN=true script/compile

# 设置最大堆大小
export BABASHKA_XMX="-J-Xmx6500m"
```

### 特性标志

Babashka支持22个特性标志：

**默认启用**：
- CSV, java.net.http, java.nio, java.time
- Transit, XML, YAML
- httpkit client/server
- core.match, hiccup, test.check
- logging, priority-map

**可选（默认禁用）**：
- spec.alpha
- JDBC (PostgreSQL, SQLite, HSQLDB, OracleDB)
- datascript

启用可选特性：

```bash
BABASHKA_FEATURE_JDBC=true script/compile
```

---

## 设计哲学总结

### 1. 务实主义哲学

Babashka不是追求完美兼容JVM Clojure，而是**务实地选择最合适的实现**：

| 权衡 | 选择 | 原因 |
|------|------|------|
| 启动速度 vs 运行速度 | 解释执行 | 脚本场景下启动更重要 |
| 兼容性 vs 简洁性 | SCI解释器 | 轻量嵌入，无需JVM |
| 功能完整 vs 可维护性 | 预选Java类 | 平衡功能与编译时间 |

### 2.  Batteries Included原则

Babashka遵循"内置电池"哲学，将**80%场景的常用工具**直接打包：

- 无需`pip install` / `npm install`
- 无需网络下载依赖
- 真正的"下载即用"

### 3. 渐进式扩展

通过Pod系统，Babashka支持**按需扩展**：

```
内核（精简） + Pod（按需） = 灵活可扩展
```

### 4. 跨平台优先

Babashka的跨平台支持不是事后的补丁，而是**从设计之初就考虑**：

- 统一的API抽象文件系统差异
- 使用POSIX兼容的进程管理
- 提供一致的JSON/YAML处理

### 5. 社区驱动

Babashka的很多特性来自社区需求：

> "Life's too short to remember how to write Bash code."

用户的痛点就是开发的动力。

---

## 核心观点与结论

### 核心观点

#### 观点一：脚本语言的选择影响开发体验

Bash虽然无处不在，但其设计诞生于1970年代，早已无法满足现代开发需求。选择更现代的脚本语言（如Clojure）配合极速启动的运行时，可以显著提升脚本开发体验。

#### 观点二：启动速度是脚本语言的关键指标

对于一次性脚本和CI/CD场景，**毫秒级启动比每秒执行数百万次操作更重要**。Babashka的架构选择完美契合了这一需求。

#### 观点三：解释型语言在脚本场景的优势

虽然解释执行有性能开销，但在脚本场景下，**快速启动和低内存占用往往比纯计算性能更重要**。

#### 观点四：Pod模式是语言扩展的正确姿势

Pod通过进程边界隔离外部程序，**既保证了安全性，又提供了真正的语言无关扩展能力**。

#### 观点五：内置电池 vs 依赖管理

在快速脚本场景，"开箱即用"的内置库往往比"功能丰富但需要等待下载"的依赖管理更实用。

### 使用场景推荐

| 场景 | 推荐工具 |
|------|---------|
| 系统运维脚本 | Babashka ✅ |
| CI/CD脚本 | Babashka ✅ |
| 快速原型 | Babashka ✅ |
| 数据处理脚本 | Babashka + JVM Clojure |
| Web服务 | JVM Clojure |
| 复杂并发应用 | JVM Clojure |

### 局限性

1. **计算密集型任务**：解释执行开销不适合高性能计算
2. **完整JVM生态**：需要完整Java库时仍需JVM Clojure
3. **复杂调试**：解释型语言调试工具链不如JVM完善

---

## 参考资源

| 资源 | 链接 |
|------|------|
| 官网 | [babashka.org](https://babashka.org/) |
| GitHub | [github.com/babashka/babashka](https://github.com/babashka/babashka) |
| 官方文档 | [book.babashka.org](https://book.babashka.org/) |
| Pods仓库 | [github.com/babashka/pods](https://github.com/babashka/pods) |
| SCI项目 | [github.com/babashka/sci](https://github.com/babashka/sci) |
| 许可证 | EPL-1.0 |

---

## 结语

Babashka代表了脚本语言发展的一个重要方向：**在保持语言优雅性的同时，极致优化用户体验**。通过SCI解释器和GraalVM native-image的精妙组合，它实现了"鱼和熊掌兼得"——既有Clojure的表达力，又有脚本的便捷性。

对于每天与Shell脚本打交道的开发者来说，Babashka是一个值得尝试的替代方案。它不仅能提升代码的可读性和可维护性，更重要的是——

> **"生活太短，不值得花时间去记住怎么写Bash代码。"**

也许，是时候给你的脚本换一种更优雅的写法了。
