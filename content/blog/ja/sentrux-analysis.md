---
title: 'sentrux 深度解説：AI エージェントのアーキテクチャセンサー — フィードバックループを閉じ、コード品質を再帰的に自己改善する純 Rust ツール'
description: "sentrux を完全解析 — AI エージェントがフィードバックループを閉じ、コード品質の再帰的な自己改善を可能にするリアルタイムアーキテクチャセンサー。純 Rust シングルバイナリ、ランタイム依存ゼロ、tree-sitter プラグインで 52 言語をサポート。ライブ依存性ツーマップ可視化、5 つの根本原因指標（モジュール性・非巡回性・深さ・平等性・冗長性）の統合品質スコア、MCP サーバー統合（Claude Code/Cursor/Windsurf/OpenCode）、TOML ベースのルールエンジン、CI 品質ゲートを提供。コア問題、設計哲学、アーキテクチャ、完全インストールチュートリアルから機能一覧まで。"
date: "2026-08-04"
author: "TopDigg Research Team"
tags: ["sentrux", "AI Agent", "Code Quality", "Architecture", "Rust", "Static Analysis", "MCP", "Tree-sitter", "DevTools"]
categories: ["Deep Dive"]
keywords: ["sentrux", "AI エージェント", "コード品質", "アーキテクチャセンサー", "フィードバックループ", "静的解析", "Rust", "MCP", "tree-sitter", "依存性分析", "コード可視化", "品質ゲート"]
---

# sentrux 深度解説：AI エージェントのアーキテクチャセンサー — フィードバックループを閉じ、コード品質を再帰的に自己改善する純 Rust ツール

> コアイデア：**AI エージェントはかつてない速度でコードを書くが、センサーがなければ何を改善すべきかわからない — 温度計のないサーモモーターのように、永遠に調節できない。** sentrux は純 Rust で実装されたリアルタイムアーキテクチャセンサーで、核心使命は **AI エージェントがフィードバックループを閉じるのを助けること** — コードベースの実際の構造をスキャンし（diff やターミナル出力ではなく、すべてのファイル、すべての依存性、すべてのアーキテクチャ関係）、5 つの根本原因指標から統合品質スコア（0-10000）を算出し、AI エージェントがコードを書くと同時にアーキテクチャが退化しているかどうかを感知できるようにする。MCP プロトコル through Claude Code、Cursor、Windsurf、OpenCode などの主要 AI プログラミングツールと統合、ライブ treemap 可視化、TOML ベースのルールエンジン、CI 品質ゲート、セッションレベル品質追跡を提供。一言で：**あなたに必要なのはより良い計画ではなく、より良いセンサーだ。**

---

## 1. プロジェクト概要

### 1.1 これは何か？

**sentrux** は、AI 補助プログラミング向けに設計された**リアルタイムアーキテクチャセンサー**。核心的ポジショニング：**AI エージェントとコードベースの間にフィードバックループを構築する** — AI エージェントがコードを変更するたびに、sentrux が構造変化をリアルタイムにスキャンし、品質スコアを算出し、エージェントに「この変更はコードを良くしたのか、悪くしたのか」を伝える。

### 1.2 主要データ

- リポジトリ：`https://github.com/sentrux/sentrux`
- ウェブサイト：`https://sentrux.dev`
- Stars：**2,600+**
- Forks：**237**
- ライセンス：**MIT**
- 言語：**Rust**（純 Rust シングルバイナリ、ランタイム依存ゼロ）
- コミット数：**318**
- サポート言語：**52**（tree-sitter プラグイン経由）
- プラットフォーム：**macOS / Linux / Windows**
- MCP 対応：Claude Code、Cursor、Windsurf、OpenCode、OpenClaw、すべての MCP クライアント

### 1.3 何の問題を解決するか？

AI 補助開発の「汚い秘密」：**AI がコードを書くほど、コードベースは制御不能になる。**

IDE を使っていた頃、ファイルツリーが見え、ファイルを開いてアーキテクチャを理解できた — あなたは「管理者」だった。しかし AI エージェントはターミナルに移行した。エージェントはセッションごとに数十のファイルを変更し、`Modified src/foo.rs` の流れしか見えない — 依存グラフの中でのファイルの位置、循環依存の生成、本来内部であるべきファイルに依存する 3 つのモジュール、これら全ての空間的認識を失う。

従来の「まずアーキテクチャを計画し、AI に実装させる」アプローチは本質的に**ウォーターフォールの再発明**：大量の Markdown 文書を生成するが、実際に生成されるコードへの可視性がゼロ。フィードバックループがなく、仕様からの逸脱を検出できない。

**sentrux の答え：あなたに必要なのはより良い計画ではなく、より良いセンサーだ。**

---

## 2. コアイデア

### 2.1 フィードバックループ — 制御論の古典的モデル

sentrux の設計は制御論に根ざす：すべての有効なシステムには**センサー**（現実を観察）、「良い」を定義する**仕様**、偏差を修正する**アクチュエータ**が必要。コンパイラは構文レベルで、テストスイートは動作レベルで、リンタはスタイルレベルでループを閉じた。しかし**アーキテクチャレベル** — この変更はシステムに適しているか？この抽象化はコードベースの成長に問題を引き起こすか？ — にはセンサーもアクチュエータもなかった。

sentrux はアーキテクチャレベルでループを閉じる。

### 2.2 5 つの根本原因指標 — 統合スコア

sentrux は単に行数を数えたりサーキット複雑度を計算したりするのではなく、5 つのアーキテクチャ根本原因次元からコードベースを評価：

- **モジュール性（Modularity）**：モジュール間の責任分担は明確か？
- **非巡回性（Acyclicity）**：依存関係に循環はあるか？
- **深さ（Depth）**：呼び出しチェーンは深すぎないか？
- **平等性（Equality）**：モジュール間の依存が均等すぎないか（階層性の欠如）？
- **冗長性（Redundancy）**：重複するコード構造はあるか？

5 つの指標が 0-10000 の連続スコアに収束 — ミリ秒単位で計算、リアルタイム更新。

### 2.3 セッションレベル品質追跡

sentrux は AI エージェントがコードを書き始める前にベースラインを保存し、セッション終了後に比較 — 「このセッションでコード品質が上がったか下がったか」を正確に捉える。これは**セッションレベルのアーキテクチャガードレール**。

### 2.4 プラグイン型言語サポート — tree-sitter の力

sentrux のバイナリは**汎用プラットフォーム** — すべての言語知識は `plugin.toml` + `tags.scm` クエリファイルにある。新しい言語を追加するのに Rust コードは 1 行も不要 — tree-sitter プラグインにより、52 言語がすぐに使える。

---

## 3. アーキテクチャ

### 3.1 コアコンポーネント

- **sentrux-core**：コア分析エンジン（スキャニング、スコアリング、ルールチェック）
- **sentrux-bin**：CLI と GUI エントリポイント
- **MCP サーバー**：Model Context Protocol 経由で AI エージェントにリアルタイム構造健全性データを提供
- **ルールエンジン**：TOML 設定のアーキテクチャ制約適用
- **プラグインシステム**：tree-sitter 言語プラグイン管理

### 3.2 ワークフロー

```
スキャン → スコアリング → エージェント改善 → 再スキャン → より高いスコア → 繰り返し
```

1. エージェントが `scan()` を呼び出し、現在の品質スコアとボトルネック指標を取得
2. エージェントが `session_start()` を呼び出しベースラインを保存
3. エージェントがコードを書く
4. エージェントが `session_end()` を呼び出しベースラインと比較 — 品質が向上したか退化したかを判定
5. 退化した場合、エージェントがフィードバックに基づいて調整

### 3.3 MCP ツールセット

9 つの MCP ツール：`scan` · `health` · `session_start` · `session_end` · `rescan` · `check_rules` · `evolution` · `dsm` · `test_gaps`

---

## 4. 設計哲学

### 4.1 「ループ内の人間」は交渉の余地がない

AI エージェントは強力だが限定的 — 全体像と細部を同時に把握できない。人間はいつでもエージェントが全体に何をしているかを見られる必要がある — どのファイルを変更したかだけでなく、そのファイルがアーキテクチャにとって何を意味するか。sentrux それを可能にする。

### 4.2 検証は生成よりも価値がある

正しい解決策を生成するのは検証するよりも難しい（P vs NP の直感）。機械に負けない必要はない — 機械を上回る**評価力**が必要。sentrux はアーキテクチャ判断を機械が読めるグレードと制約に変換する。

### 4.3 良いシステムは良い結果を不可避にする

適切に設計されたシステムは行動を制約し、正しいことが容易なことになる：退化をリリース前にブロックする品質ゲート、アーキテクチャ決定を符号化するルールエンジン、構造の腐敗を見逃せない可視化マップ。

### 4.4 「再発明しない」実務的姿勢

sentrux は自前で言語パーサーを書かず — tree-sitter を使用。GUI フレームワークを自作せず — WGPU でレンダリング。プロトコルを自作せず — MCP を使用。この実務的態度により、sentrux はコア価値（アーキテクチャ分析とフィードバックループ）に集中できる。

---

## 5. ステップバイステップチュートリアル

### 5.1 インストール

**macOS (Homebrew)**
```bash
brew install sentrux/tap/sentrux
```

**Linux**
```bash
curl -fsSL https://raw.githubusercontent.com/sentrux/sentrux/main/install.sh | sh
```

**Windows**
```bash
curl -L -o sentrux.exe https://github.com/sentrux/sentrux/releases/latest/download/sentrux-windows-x86_64.exe
```

**ソースからビルド**
```bash
git clone https://github.com/sentrux/sentrux.git
cd sentrux && cargo build --release
```

### 5.2 基本使用

```bash
sentrux                    # GUI を開く — リアルタイム treemap
sentrux /path/to/project   # 特定ディレクトリをスキャン
sentrux check .            # ルールチェック（CI フレンドリー、終了コード 0 または 1）
sentrux gate --save .      # ベースライン保存（エージェントセッション前）
sentrux gate .             # ベースライン比較（退化を検出）
```

### 5.3 AI エージェント統合 (MCP)

**Claude Code**
```
/plugin marketplace add sentrux/sentrux
/plugin install sentrux
```

**Cursor / Windsurf / OpenCode / すべての MCP クライアント**
```json
{
  "mcpServers": {
    "sentrux": {
      "command": "sentrux",
      "args": ["--mcp"]
    }
  }
}
```

### 5.4 エージェントワークフロー例

```
Agent: scan("/Users/me/myproject")
  → { quality_signal: 7342, files: 139, bottleneck: "modularity" }

Agent: session_start()
  → { status: "Baseline saved", quality_signal: 7342 }

  ... エージェントが 500 行のコードを書く ...

Agent: session_end()
  → { pass: false, signal_before: 7342, signal_after: 6891,
      summary: "Quality degraded during this session" }
```

### 5.5 ルールエンジン設定

プロジェクトルートに `.sentrux/rules.toml` を作成：

```toml
[constraints]
max_cycles = 0
max_coupling = "B"
max_cc = 25
no_god_files = true

[[layers]]
name = "core"
paths = ["src/core/*"]
order = 0

[[layers]]
name = "app"
paths = ["src/app/*"]
order = 2

[[boundaries]]
from = "src/app/*"
to = "src/core/internal/*"
reason = "App must not depend on core internals"
```

```bash
sentrux check .
# ✓ All rules pass — Quality: 7342
```

### 5.6 言語プラグイン

```bash
sentrux plugin list              # インストール済みプラグイン一覧
sentrux plugin add <name>        # レジストリからインストール
sentrux plugin add-standard      # 52 言語すべてをインストール
sentrux plugin init my-lang      # 新しい言語プラグインのスキャフォールド
```

### 5.7 Linux GPU トラブルシューティング

```bash
WGPU_BACKEND=vulkan sentrux    # Vulkan を強制
WGPU_BACKEND=gl sentrux        # OpenGL を強制
```

---

## 6. 機能一覧

- **リアルタイムアーキテクチャ可視化**：インタラクティブ treemap、エージェントが変更するとファイルが光る
- **5 つの根本原因指標**：モジュール性、非巡回性、深さ、平等性、冗長性
- **統合品質スコア**：0-10000 連続スコア、ミリ秒単位計算
- **MCP サーバー**：9 ツール（scan/health/session_start/session_end/rescan/check_rules/evolution/dsm/test_gaps）
- **セッションレベル品質追跡**：ベースライン保存 + セッション比較
- **ルールエンジン**：TOML 設定、制約・レイヤー・境界をサポート
- **CI 品質ゲート**：`sentrux check .` 終了コード 0/1
- **52 言語**：Bash、C、C++、C#、Go、Java、JavaScript、Python、Rust、TypeScript など
- **プラグインシステム**：tree-sitter 駆動、新しい言語追加に Rust コードゼロ
- **クロスプラットフォーム**：macOS / Linux / Windows
- **純 Rust**：シングルバイナリ、ランタイム依存ゼロ
- **GUI**：WGPU レンダリング、リアルタイム treemap 可視化
- **Claude Code プラグイン**：ワンクリックインストール統合

---

## 7. まとめ（観点と結論）

sentrux の設計と実装から、いくつか考察すべき点がある：

1. **AI 補助開発の真のボトルネックはコード生成能力ではなく、アーキテクチャガバナンス能力にある。** sentrux の README は冒頭で「誰も語らない問題」を指摘：AI がコードを書くほど、コードベースは退化する。AI が馬鹿になったのではなく、アーキテクチャへの認識を失ったのだ。IDE にいた頃、あなたはアーキテクチャの番人だった。ターミナルに移行すると空間的認識を失う。sentrux はリアルタイム treemap と品質スコアリングでそれを回復する。

2. **「より良い計画」ではなく「より良いセンサー」が答えだ。** 従来のアプローチはより詳細な仕様書で AI を拘束しようとする — しかし仕様書は静的で、コードは動的。フィードバックループのない仕様書は温度計のないサーモモーター — 調節できない。sentrux の核心的革新：コードを書く前に計画するのではなく、コードを書きながら検証する。

3. **P vs NP の直感は工学にも適用される。** 正しいアーキテクチャを生成するのは検証するよりもはるかに難しい。AI に負ける必要はない — **評価力**で勝てばいい。sentrux は「アーキテクチャ判断」という曖昧な人間能力を、機械が読めるグレードと制約に変換する。

4. **tree-sitter は「車輪の再発明をしない」模範。** sentrux は 52 言語のパーサーを自作せず — tree-sitter のクエリ言語を使用。これによりコア価値（アーキテクチャ分析とフィードバックループ）に集中できる。

5. **MCP は AI ツールチェーンの「USB ポート」。** sentrux は各 AI ツール用のアダプターを書かず — MCP プロトコルを実装。一度の統合ですべての MCP クライアントが使える。これはプロトコル優先の設計思考。

6. **「ループ内の人間」は保守的ではなく実務的。** sentrux の 3 つの信念の一つ：「Human-in-the-loop is non-negotiable」— AI は強力だが限定的、全体像と細部を同時に把握できない。人間の役割は「コードを書くこと」から「コードをガバナンスすること」へと変化しつつある — sentrux その変化を可能にする。

---

## 参考資料

- リポジトリ：`https://github.com/sentrux/sentrux`
- ウェブサイト：`https://sentrux.dev`
- ライセンス：MIT
- Claude Code プラグイン：`/plugin marketplace add sentrux/sentrux`
- MCP プロトコル：`https://modelcontextprotocol.io`
- tree-sitter：`https://tree-sitter.github.io/`