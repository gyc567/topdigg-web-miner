---
title: "RTK（Rust Token Killer）徹底解説：単一 Rust バイナリの CLI プロキシが、エージェントが読む bash 出力を最大 90% 削減する——4つの圧縮戦略、Auto-Rewrite Hook から 64 モジュール構成まで"
description: "GitHub で爆発的に人気のオープンソースプロジェクト rtk-ai/rtk（75k+ stars、Rust、Apache-2.0、default branch develop）を徹底解説する「LLM コンテキスト向け CLI プロキシ」技術解説。核心思想：RTK はシェルコマンドをインターセプトし、出力が LLM コンテキストに届く前にフィルタリング・グループ化・トランケーション・重複排除を行う——「削るのは bash 出力であって、あなたの請求書ではない」。単一 Rust バイナリ、100+ 対応コマンド、1 コマンドあたり約 5〜15ms のオーバーヘッド、約 4.1MB。プロキシパターン（Claude → RTK → git の出力リダイレクト）、4つの圧縮戦略、Auto-Rewrite と Suggest の 2 つの Hook 戦略（100% vs 約 70〜85% の採用率）、5つの設計原則（Single Responsibility / Minimal Overhead / Exit Code Preservation / Fail-Safe / Transparent）、6 フェーズのコマンドライフサイクル（PARSE→ROUTE→EXECUTE→FILTER→PRINT→TRACK）、12 戦略のフィルタリング分類法、SQLite トークントラッキングと rtk gain 分析、-v/-vv/-vvv と -u のグローバルフラグ、config.toml と失敗時 tee フォールバック、15 の AI ツール統合（Claude Code/Gemini/Copilot/OpenCode など）、デフォルト無効のテレメトリ設計、そして 75k stars の背後にあるエンジニアリング哲学とアーキテクチャ決定記録（なぜ Rust/SQLite/anyhow/Clap なのか）までを 1 本の記事にまとめる。"
date: "2026-08-06"
author: "TopDigg Research Team"
tags: ["RTK", "Rust", "Token Optimization", "LLM", "CLI", "AI Agent", "Claude Code", "Token Killer", "Developer Tools", "SQLite", "Proxy", "Open Source"]
categories: ["Deep Dive"]
keywords: ["RTK", "Rust Token Killer", "rtk-ai", "トークン最適化", "CLI プロキシ", "bash 出力圧縮", "LLM コンテキスト", "Claude Code", "Auto-Rewrite Hook", "rtk gain", "SQLite", "トークン節約", "オープンソース", "Patrick Szymkowiak"]
---

# RTK（Rust Token Killer）徹底解説：単一 Rust バイナリの CLI プロキシが、エージェントが読む bash 出力を最大 90% 削減する

> 核心思想：**RTK はハイパフォーマンスな CLI プロキシであり、あなたの AI コーディングエージェントとシェルの間に立ち、コマンド出力を「圧縮」してから LLM コンテキストに送り込む——bash 出力を最大 90% 削減する。** 表現に注意：削るのは「エージェントが読む bash 出力」であって、**あなたの請求書ではない**。bash 出力は入力トークンへの寄与要因の 1 つにすぎず、入力トークンもまた請求書の一部にすぎない——節約は各層で薄まっていく。このプロジェクト（`rtk-ai/rtk`、75k+ stars、Rust 製、Apache-2.0）はこの発想を徹底している：**単一の Rust バイナリ（約 4.1MB）、100+ 対応コマンド、1 コマンドあたりわずか約 5〜15ms のオーバーヘッド、64 モジュール、15 の AI ツール統合**。プロキシパターンで `git status` → `rtk git status` を透過的に書き換え、4つの圧縮戦略（スマートフィルタリング / グループ化 / トランケーション / 重複排除）で 15 行の `git push` 出力を `ok main` の 1 行に、200 行超の `cargo test` 失敗出力を約 20 行に圧縮する。そして最も称賛に値するのはそのエンジニアリング哲学、5つの設計原則だ：**単一責任、最小オーバーヘッド、終了コード保持、フェイルセーフ（失敗時は原文にフォールバック）、完全な透明性（`-v` で常に生の出力を見られる）**——情報損失が最大の失敗モードであり、CI/CD の終了コードは決して飲み込まれない。

---

## 1. プロジェクト概要

### 1.1 それは何か？

**RTK（Rust Token Killer）** はオープンソースの **ハイパフォーマンス CLI プロキシ**であり、唯一の使命は：**コマンド出力が LLM コンテキストに届く前にフィルタリングして圧縮すること**。プロジェクトは `https://github.com/rtk-ai/rtk` にあり、README の最初の行が明確に定義している：

> **High-performance CLI proxy that cuts up to 90% of the bash output your agent reads**（エージェントが読む bash 出力を最大 90% 削減するハイパフォーマンス CLI プロキシ）

これは「AI ツール」ではなく、**AI ツールのためのシム（shim）**だ：既存のシェルコマンド（`ls`、`git status`、`cargo test`、`ruff check`、`docker ps`……）をラップし、中間層で出力を書き換える。あなたはいつも通り `git status` と打つ。hook がそれを `rtk git status` に書き換え、エージェントは圧縮後のバージョンを受け取る——**ゼロ認知、ゼロ追加プロンプトオーバーヘッド**。

### 1.2 主要データと情報

- リポジトリ：`github.com/rtk-ai/rtk`、**75k+ stars、4.7k+ forks**（本稿執筆時点）
- 言語：**Rust**（単一バイナリ、実行時依存なし）；ライセンス：**Apache-2.0**
- デフォルトブランチ：`develop`（開発本線）；2026-01-22 に作成、高頻度でイテレーション継続中
- 創業者：**Patrick Szymkowiak**；コアコントリビューター：Florian Bruniaux、Adrien Eppling、Nicolas Le Cam、Takayuki Maeda
- 成果物：**単一の約 4.1MB（strip 後）Rust バイナリ**、コールドスタート約 5〜10ms、常駐メモリ約 2〜5MB
- カバレッジ：**100+ 対応コマンド、64 モジュール（42 のコマンドモジュール + 22 のインフラモジュール）、15 の AI コーディングツール統合**
- パフォーマンス保証：コマンドあたりプロキシオーバーヘッド **約 5〜15ms**（「Minimal Overhead」設計目標）
- 圧縮効果：**bash 出力を最大 90% 削減**；エコシステム別：Git 85-99%、JS/TS 70-99%、Python 70-90%、Go 75-90%、Ruby 60-90%、Cloud 60-80%、System 50-90%、Rust 60-99%
- ローカル実測：本稿執筆環境では **rtk 0.44.2** を Homebrew でインストール済み（README 例の 0.28.2 は旧バージョン番号）

### 1.3 それは何の問題を解決するのか？

大規模モデルコーディングエージェント（Claude Code、Gemini CLI、Cursor、Copilot など）の本質的な働き方は：**コマンド出力を読む → 考える → またコマンドを実行する**。しかしシェルコマンドの出力はしばしば「人間向け」に書かれている：数百行のファイル一覧、プログレスバー、ANSI カラー、成功メッセージ、繰り返しのログ……。これらのコンテンツが LLM コンテキストに入ると**トークン単位で課金**される——それらは入力トークンの構成要素であり、入力トークンはさらに請求書の一部なのだ。

RTK の答えは：**出力がコンテキストに入る前に、まず人間向けノイズを取り除く**こと。プロンプトやシステムプロンプト、会話履歴は制御できないが、bash 出力というスライスは制御できる——それが「最大 90%」という主張の境界線だ。

ここで概念的なレッドラインを引いておく（README は「How Savings Work」という節を丸ごと割いている）：

> **bash 出力の削減 ≠ 請求書の 90% 削減。** bash 出力は入力トークンへの寄与要因の 1 つ（他にプロンプト、システムプロンプト、会話履歴）にすぎず、入力トークンもまた請求書の一部（出力トークンも数える）にすぎない。削減は各層で薄まっていく。

RTK が報告するトークン数は `バイト数 / 4` の**推定値**——RTK はトークナイザーを内蔵しないため、**パーセンテージは信頼できるが、絶対トークン数は近似値**である。

---

## 2. 核心思想

### 2.1 一言で言うと

> **RTK はシェルコマンドをインターセプトし、出力を圧縮してからエージェントに読ませる。** 単一 Rust バイナリ、100+ コマンド、<10ms オーバーヘッド。

「より速い git」でも「より良い linter」でもない——**出力パイプライン上のリライター**だ。その知性のすべては「**どの情報が LLM の意思決定に役立ち、どれが単なるノイズか**」を知ることにある。

### 2.2 プロキシパターン：出力フローのリダイレクト

README は ASCII 図でメカニズムを説明している：

```
  Without rtk:                                    With rtk:

  Claude  --git status-->  shell  -->  git         Claude  --git status-->  RTK  -->  git
    ^                                   |            ^                      |          |
    |         full raw output           |            |  compact output      | filter   |
    +-----------------------------------+            +------- (filtered) ---+----------+
```

- **RTK なし**：Claude は git の完全な生出力（数百行）を直接受け取る。
- **RTK あり**：hook がコマンドを `rtk git status` に書き換え；RTK が本物のコマンドを実行し、stdout をフィルタリングして圧縮し、**圧縮版**を Claude に渡す。Claude はまったく気づかない——読んだものが全てだと信じている。

### 2.3 4つの圧縮戦略

RTK はコマンドタイプごとに 4 つの戦略の組み合わせを適用する：

1. **スマートフィルタリング（Smart Filtering）**：ノイズを除去——コメント、空行、定型文（例：bundle install の "Using..." 行）。
2. **グループ化（Grouping）**：類似項目を集約——ファイルをディレクトリ別、エラーをルール別（`no-unused-vars: 23`、`semi: 45`）。
3. **トランケーション（Truncation）**：関連コンテキストを保持し、冗長性をカット（長い行の切り詰め、重複コンテンツの折りたたみ）。
4. **重複排除（Deduplication）**：繰り返しのログ行を「N 回出現」（`[ERROR] ... (×5)`）に折りたたむ。

コマンドごとの具体的効果（README の対応表）：

| 操作 | RTK が出力に行うこと |
|------|---------------------|
| `ls` / `tree` | ツリー形式 + ファイル数（`src/ (8 files)`）、1 行 1 エントリではなく |
| `cat` / `read` | スマートファイル読み取り：全文よりシグネチャと構造を優先 |
| `grep` / `rg` | 長い行を切り詰め、ファイルごとにマッチをグループ化 |
| `git status` | コンパクトな統計形式、状態別にグループ化 |
| `git diff` | コンテキスト削減、ヘッダー除去 |
| `git log` | hash・作者・件名のみ |
| `git add/commit/push` | 完全なプログレス出力の代わりに 1 行の確認 |
| `cargo test` / `npm test` | 失敗のみ、成功はカウントに折りたたみ |
| `pytest` / `go test` | 失敗のみ、traceback トリミング / NDJSON 解析 |
| `docker ps` | 必須フィールドのみ |

### 2.4 2つの Hook 戦略：Auto-Rewrite vs Suggest

RTK の最も効果的な使い方は **Auto-Rewrite Hook**——hook が bash コマンドを透過的にインターセプトし、実行前に rtk 相当物へ書き換える。結果：**100% の rtk 採用率、コマンドごとのコンテキストオーバーヘッドはゼロ**。アーキテクチャドキュメントは 2 つの戦略を比較している：

```
Auto-Rewrite（デフォルト）               Suggest（非侵襲）
─────────────────────                   ────────────────────────
Hook がコマンドをインターセプト           Hook が systemMessage ヒントを発行
実行前に書き換え                           Claude が自律的に決定
100% 採用率                              約 70〜85% 採用率
コンテキストオーバーヘッドゼロ            最小限のコンテキストオーバーヘッド
最適：本番環境                            最適：学習 / 監査
```

- **Auto-Rewrite**：コマンドは静かに書き換えられ、エージェントは気づかない——最大の節約を追求する本番環境向け。
- **Suggest**：hook は「このコマンドは rtk が使える」というシステムメッセージを 1 つ発するだけで、Claude が自分で決める——まず効果を観察したいユーザー向け。

**境界に注意**：hook は **Bash ツール呼び出し**にのみ作用する。Claude Code 内蔵の `Read`、`Grep`、`Glob` などのツールは Bash hook を通らず、書き換えられない——これらのワークフローを圧縮したいなら、シェルコマンドを使うか、`rtk read`、`rtk grep`、`rtk find` を明示的に呼ぶ。

### 2.5 「90% 削減」の境界と推定方法

RTK の「節約」に対する態度は極めて抑制的だ——これがマーケティングトークとの違いである：

- 節約の対象は **bash 出力**であり、請求書ではない（1.3 参照）。
- トークン推定は `bytes / 4` のヒューリスティック（約 4 文字 ≈ 1 トークン、GPT 風）を使用し、**トークナイザーは内蔵しない**。
- したがって：**パーセンテージ（savings_pct）は信頼できる相対値であり、絶対トークン数は近似値**——横断比較とトレンド観察には十分、正確な会計には不十分。

---

## 3. 詳細チュートリアル

### 3.1 インストール

4 つの方法から選ぶ：

```bash
# Homebrew（macOS 推奨）
brew install rtk

# クイックインストールスクリプト（Linux/macOS、~/.local/bin にインストール）
curl -fsSL https://raw.githubusercontent.com/rtk-ai/rtk/refs/heads/master/install.sh | sh

# Cargo
cargo install --git https://github.com/rtk-ai/rtk

# プリビルドバイナリ：GitHub Releases からダウンロード
# macOS: rtk-aarch64-apple-darwin.tar.gz / Linux: rtk-x86_64-unknown-linux-musl.tar.gz / Windows: rtk-x86_64-pc-windows-msvc.zip
```

インストール確認：

```bash
rtk --version   # "rtk X.Y.Z" と表示されるべき（本稿環境では 0.44.2）
rtk gain        # 節約分析ダッシュボードが表示されるべき
```

> ⚠️ **同名衝突の警告**：crates.io には同じく rtk という別のプロジェクト（Rust Type Kit）が存在する。`rtk gain` がエラーになるなら、間違ったパッケージを入れている——上記の `cargo install --git` を使うこと。

### 3.2 クイックスタート：エージェントに RTK を自動で使わせる

```bash
# 1. AI ツール用にインストール（-g = グローバル）
rtk init -g                     # Claude Code / Copilot（デフォルト）
rtk init -g --gemini            # Gemini CLI
rtk init -g --codex             # Codex（OpenAI）
rtk init -g --agent cursor      # Cursor
rtk init -g --agent windsurf    # Windsurf
rtk init --agent cline          # Cline / Roo Code
rtk init -g --opencode          # OpenCode（プラグイン）
rtk init -g --auto-patch        # 非対話（CI/CD）
rtk init --show                 # インストール確認

# 2. AI ツールを再起動してテスト
git status                      # 自動的に rtk git status へ書き換え
```

インストール後、hook が Bash 呼び出しを透過的に書き換え（`git status` → `rtk git status`）、エージェントは**明示的に rtk を呼ばずに**圧縮出力を受け取る。対応ツール（15 個）：Claude Code、GitHub Copilot (VS Code)、Copilot CLI、Cursor、Gemini CLI、Codex、Windsurf、Cline/Roo Code、OpenCode、OpenClaw、Pi、Hermes、Kilo Code、Google Antigravity、Kimi AI、Factory Droid——統合方法はそれぞれ異なる（PreToolUse hook / プラグイン / AGENTS.md の指示 / プロジェクトスコープの rules）。詳細は公式の Supported Agents ガイド参照。

### 3.3 コマンドリファレンス（カテゴリ別）

**ファイル操作**：
```bash
rtk ls .                        # コンパクトなディレクトリツリー
rtk read file.rs                # スマートファイル読み取り（シグネチャ+構造優先）
rtk read file.rs -l aggressive  # シグネチャのみ（関数本体を除去）
rtk smart file.rs               # 2 行のヒューリスティックコード要約
rtk find "*.rs" .               # コンパクトな find 結果
rtk grep "pattern" .            # グループ化された検索結果
rtk diff file1 file2            # 圧縮 diff（ファイルが異なれば exit 1）
```

**Git**：
```bash
rtk git status                  # コンパクトなステータス
rtk git log -n 10               # 1 コマンド 1 行
rtk git diff                    # 圧縮 diff
rtk git add                     # → "ok"
rtk git commit -m "msg"         # → "ok abc1234"
rtk git push                    # → "ok main"
rtk git pull                    # → "ok 3 files +10 -2"
```

**GitHub CLI**：
```bash
rtk gh pr list                  # コンパクトな PR 一覧
rtk gh pr view 42               # PR 詳細 + checks
rtk gh issue list               # コンパクトな issue 一覧
rtk gh run list                 # ワークフロー実行ステータス
```

**テストランナー**（コア価値ゾーン、失敗フォーカス）：
```bash
rtk jest                        # Jest コンパクト（失敗のみ）
rtk vitest                      # Vitest コンパクト（失敗のみ）
rtk playwright test             # E2E 結果（失敗のみ）
rtk pytest                      # Python テスト（-90%）
rtk go test                     # Go テスト（NDJSON、-90%）
rtk cargo test                  # Cargo テスト（-90%）
rtk rake test                   # Ruby minitest（-90%）
rtk rspec                       # RSpec（JSON、-60%+）
rtk err <cmd>                   # 任意コマンドからエラーのみ抽出
rtk test <cmd>                  # 汎用テストラッパー - 失敗のみ（-90%）
```

**ビルド & Lint**：
```bash
rtk lint                        # ESLint をルール/ファイル別にグループ化
rtk tsc                         # TypeScript エラーをファイル別にグループ化
rtk next build                  # Next.js ビルドコンパクト
rtk cargo build                 # Cargo ビルド（-80%）
rtk cargo clippy                # Cargo clippy（-80%）
rtk ruff check                  # Python lint（JSON、-80%）
rtk golangci-lint run           # Go lint（JSON、-85%）
rtk rubocop                     # Ruby lint（JSON、-60%+）
```

**クラウド & コンテナ**：
```bash
rtk aws sts get-caller-identity # 1 行のアイデンティティ
rtk aws lambda list-functions   # 名前/ランタイム/メモリ（シークレット除去）
rtk docker ps                   # コンパクトなコンテナ一覧
rtk docker logs <container>     # 重複排除ログ
rtk kubectl pods                # コンパクトな pod 一覧
rtk kubectl logs <pod>          # 重複排除ログ
```

**データ & メタコマンド**：
```bash
rtk json config.json            # 値なしの構造
rtk deps                        # 依存関係サマリー
rtk env -f AWS                  # フィルタリングされた環境変数
rtk log app.log                 # 重複排除ログ
rtk curl <url>                  # 切り詰め + 完全出力を保存
rtk summary <long command>      # ヒューリスティック要約
rtk proxy <command>             # 生のパススルー + トラッキング（デバッグ用）
```

### 3.4 グローバルフラグ

```bash
-u, --ultra-compact    # ASCII アイコン、インライン形式（さらなる出力削減）
-v, --verbose          # 詳細度を上げる：-v / -vv / -vvv
```

詳細度レベル（全コマンドに適用）：
- フラグなし：圧縮結果のみ
- `-v`：+ デバッグメッセージ（`eprintln!` デバッグ文）
- `-vv`：+ 実行中のコマンド
- `-vvv`：+ フィルタリング前の生出力（**透明性の最終防衛線**——いつでも原文が見たいなら `-vvv` がある）

### 3.5 分析メタコマンド：トークン節約ダッシュボード

```bash
rtk gain                        # サマリー統計（90 日）
rtk gain --graph                # ASCII グラフ（直近 30 日）
rtk gain --history              # 最近のコマンド履歴
rtk gain --daily                # 日別内訳
rtk gain --all --format json    # JSON エクスポート（ダッシュボード用）

rtk discover                    # 見逃した節約機会を発見
rtk discover --all --since 7    # 全プロジェクト、直近 7 日

rtk session                     # 最近のセッションでの RTK 採用状況
```

メカニズム：コマンド実行のたびに、RTK は **SQLite データベース**（`~/.local/share/rtk/history.db`）へレコードを挿入する：`input_tokens`（生出力バイト/4）、`output_tokens`（圧縮後/4）、`saved_tokens`、`savings_pct`、`exec_time_ms`、タイムスタンプ。90 日で自動クリーンアップ。`rtk gain` は次のようなレポートを生成する：

```
Token Savings Report (90 days)
──────────────────────────────
Commands executed:  1,234
Average savings:    78.5%
Total tokens saved: 45,678
Total exec time:    8m50s (573ms)

Top commands:
  • rtk git status    (234 uses)
  • rtk lint          (156 uses)
  • rtk test          (89 uses)
```

### 3.6 設定と失敗時フォールバック

設定ファイル（`~/.config/rtk/config.toml`、macOS では `~/Library/Application Support/rtk/config.toml`）：

```toml
[hooks]
exclude_commands = ["curl", "playwright"]  # これらのコマンドは書き換えをスキップ

[tee]
enabled = true          # 失敗時に生出力を保存（デフォルト: true）
mode = "failures"       # "failures" / "always" / "never"
```

**tee フォールバックメカニズム**（Fail-Safe 原則の具現化）：コマンドが失敗したとき、RTK は完全な未フィルタ出力をディスクに保存するので、LLM は再実行せずに原文を読める：

```
FAILED: 2/15 tests
[full output: ~/.local/share/rtk/tee/1707753600_cargo_test.log]
```

アンインストール：`rtk init -g --uninstall`（hook/RTK.md/settings エントリを削除）+ `cargo uninstall rtk` または `brew uninstall rtk`。

### 3.7 プライバシーとテレメトリ

- テレメトリは**デフォルトで無効**であり、**明示的な同意**が必要（`rtk init` 時または `rtk telemetry enable`）。
- 収集されるのは**匿名・集約データ**：ソルト付きデバイスハッシュ（SHA-256、不可逆）、コマンド数、推定節約トークン数、トップコマンドのツール名（「git」「cargo」など最初の 3 単語の**ツール名のみ**、引数は記録しない）、カテゴリ分布など。
- **絶対に収集しない**：ソースコード、ファイルパス、コマンド引数、シークレット、環境変数、個人データ、リポジトリの内容。
- 管理：`rtk telemetry status / enable / disable / forget`；環境変数 `RTK_TELEMETRY_DISABLED=1` で同意に関係なくハードブロック。

---

## 4. 設計哲学

### 4.1 5つの設計原則（アーキテクチャドキュメントの冒頭に明記）

1. **単一責任（Single Responsibility）**：各モジュールは 1 つのコマンドタイプのみ処理——`git.rs` は git だけ、`pytest_cmd.rs` は pytest だけ。関心の分離をモジュールレベルまで徹底。
2. **最小オーバーヘッド（Minimal Overhead）**：コマンドあたりのプロキシオーバーヘッドを **約 5〜15ms** に抑制——ユーザー体験上は無視できるが、これはハードな設計目標（ソース内の各フィルタ戦略はオーバーヘッド予算を持つ：Clap 解析 2-3ms、フィルタリング 2-8ms、SQLite トラッキング 1-3ms）。
3. **終了コード保持（Exit Code Preservation）**：**CI/CD の信頼性を最優先**——基盤ツールの終了コードをそのまま透過（git が 128 を返せば 128 を返す）、失敗シグナルを絶対に飲み込まない。0 = 成功；1 = rtk 内部エラー；N = 基盤ツールの終了コード。
4. **フェイルセーフ（Fail-Safe）**：**フィルタリングに失敗したら元の出力にフォールバック**——RTK は決して情報損失の発生源になってはならない。tee メカニズム（3.6）はこの原則の拡張：失敗時は完全な原文を LLM 用に保存。
5. **透明性（Transparent）**：ユーザーは `-v`/`-vv`/`-vvv` で**いつでも**デバッグメッセージ、実行中コマンド、さらにはフィルタ前の生出力を見られる。

### 4.2 6 フェーズのコマンドライフサイクル

アーキテクチャドキュメントは `rtk git log --oneline -5 -v` で全チェーンを解説している：

```
Phase 1 PARSE   → Clap が Commands::Git、引数、verbose=1 を解析
Phase 2 ROUTE   → main.rs が git::run(args, verbose) へルーティング
Phase 3 EXECUTE → std::process::Command が本物の git を実行、stdout/stderr/exit_code を取得
Phase 4 FILTER  → format_git_output() が戦略を適用："5 commits, +142/-89"（96% 圧縮）
Phase 5 PRINT   → verbose>0 ならデバッグメッセージ + 圧縮結果を表示
Phase 6 TRACK   → tracking::track() が SQLite に書き込み（input 500 文字 → output 20 文字）
```

**フェーズ 6 の深い意味**：RTK は出力を圧縮するだけでなく、**圧縮そのものを記録する**。すべてのコマンドの節約が定量化され、`rtk gain` ダッシュボードのデータソースになる。**計測は最適化の前提である**——これが「スクリプト化された sed パイプライン」との根本的な違いだ。

### 4.3 12 戦略のフィルタリング分類法（Strategy Taxonomy）

アーキテクチャドキュメントは 100+ コマンドのフィルタロジックを 12 の再利用可能な戦略に一般化している：

| # | 戦略 | テクニック | 削減率 | 代表モジュール |
|---|------|-----------|--------|----------------|
| 1 | **統計抽出**（Stats Extraction） | カウント/集約、詳細を破棄 | 90-99% | git status/log/diff, pnpm list |
| 2 | **エラーのみ**（Error Only） | stdout を破棄し stderr のみ | 60-80% | runner err モード |
| 3 | **パターンによるグループ化**（Grouping） | ルール/ファイル/エラーコード別に集約 | 80-90% | lint, tsc, grep |
| 4 | **重複排除**（Deduplication） | ユニーク行 + カウント | 70-85% | log |
| 5 | **構造のみ**（Structure Only） | キー + 型を保持、値を除去 | 80-95% | json |
| 6 | **コードフィルタリング**（Code Filtering） | 3 レベル：none/minimal(コメント除去)/aggressive(本体除去) | 0-90% | read, smart |
| 7 | **失敗フォーカス**（Failure Focus） | 成功を隠し、失敗のみ表示 | 94-99% | vitest, playwright |
| 8 | **ツリー圧縮**（Tree Compression） | フラットリスト → ツリー + ディレクトリ数 | 50-70% | ls |
| 9 | **プログレスフィルタリング**（Progress Filtering） | プログレスバー/ANSI シーケンスを除去 | 85-95% | wget, pnpm install |
| 10 | **JSON/テキストデュアルモード**（Dual Mode） | JSON があれば JSON、なければテキストフォールバック | 80%+ | ruff, pip |
| 11 | **ステートマシン解析**（State Machine） | テスト状態を追跡し、失敗詳細を抽出 | 90%+ | pytest |
| 12 | **NDJSON ストリーミング**（NDJSON Streaming） | JSON 行を 1 行ずつ解析して集約 | 90%+ | go test |

**設計決定木**（新モジュールの戦略選び）：ツールが JSON フラグを提供し構造化データが必要 → JSON API を使用；ストリーミングイベント → NDJSON の行単位解析；プレーンテキスト → ステートフルならステートマシン、単純ならテキストフィルタ。

### 4.4 技術選定とアーキテクチャ決定記録（ADRs）

- **なぜ Rust か？** パフォーマンス（約 5〜15ms オーバーヘッド）、安全性（ヌルポインタ/データ競合の実行時エラーなし）、単一バイナリ（実行時依存なしで配布）、クロスプラットフォーム（macOS/Linux/Windows で無修正）。
- **なぜトラッキングに SQLite か？** ゼロ設定（サーバー不要）、軽量（90 日履歴で約 100KB）、ACID で信頼性、クエリ可能（`rtk gain` が直接 SQL 集約を実行）。
- **なぜエラーハンドリングに anyhow か？** `.context()` が呼び出しチェーン全体に意味のあるエラーメッセージを追加、`?` 演算子で簡潔な伝播、エラー表示が完全なコンテキストチェーンを示す。
- **なぜ CLI 解析に Clap か？** Derive マクロでボイラープレート削減、`--help` 自動生成、型安全性（引数を型付き struct に直接解析）、グローバルフラグ（`-v`/`-u`）が全コマンドで有効。
- **リリースプロファイル**：`opt-level = 3`、`lto = true`、`codegen-units = 1`、`strip = true`、`panic = "abort"`——バイナリを約 4.1MB まで絞り込む。

### 4.5 モジュール構成とエコシステムカバレッジ

64 モジュールをエコシステム別に整理すると、リターン曲線が一目で分かる：

```
GIT (cmds/git/)          85-99%    status, diff, log, gh, gt
JS/TS (cmds/js/)         70-99%    lint, tsc, next, prettier, playwright, prisma, vitest, pnpm
PYTHON (cmds/python/)    70-90%    ruff, pytest, mypy, pip
GO (cmds/go/)            75-90%    go test/build/vet, golangci-lint
RUBY (cmds/ruby/)        60-90%    rake, rspec, rubocop
DOTNET (cmds/dotnet/)    70-85%    dotnet build/test, binlog
CLOUD (cmds/cloud/)      60-80%    aws, docker/kubectl, curl, wget, psql
SYSTEM (cmds/system/)    50-90%    ls, tree, read, grep, find, json, log, env, deps
RUST (cmds/rust/)        60-99%    cargo test/build/clippy, err
```

注目すべき 2 つのアーキテクチャパターン：
- **Python モジュールはスタンドアロンコマンドパターン**（`Commands::Ruff` / `Pytest` / `Pip`）、**Go モジュールはサブ列挙パターン**（`Commands::Go { Test | Build | Vet }`）——go test/build/vet は 1 つのツールチェーンの意味的近縁であり、ruff/pytest/pip は独立ツールだからだ。
- **パッケージマネージャー検出**（JS/TS スタックのコア基盤）：`pnpm-lock.yaml` → `pnpm exec --`；`yarn.lock` → `yarn exec --`；それ以外 → `npx --no-install --`。モノレポのネストが正しく、プロジェクトローカルの依存のみを使用し、CI/CD 環境間で一貫する。

---

## 5. まとめ

### 5.1 コアな見解リスト

1. **RTK は「LLM コンテキスト向けの出力リライター」**：圧縮するのは bash 出力であって請求書ではない——節約は「bash 出力 → 入力トークン → 請求書」の各層で薄まり、パーセンテージは信頼でき、絶対数は近似値。
2. **プロキシパターンがその魂**：RTK はエージェントとシェルの間に立ち、コマンドを透過的に書き換え、出力を圧縮する——エージェントはゼロ認知、追加プロンプトオーバーヘッドもゼロ。
3. **4つの圧縮戦略 + 12 戦略の分類法**：スマートフィルタリング / グループ化 / トランケーション / 重複排除が 4 大手段；統計抽出、失敗フォーカス、ステートマシン、NDJSON ストリーミングなど 12 戦略をエコシステム横断で再利用——**フィルタロジックは高度に一般化可能なパターンライブラリであり、コマンドごとの手書きではない**。
4. **2つの Hook 戦略**：Auto-Rewrite（100% 採用、ゼロオーバーヘッド）と Suggest（非侵襲、約 70〜85% 採用）——攻めと緩やか、2 つの製品哲学を併存提供。
5. **5つの設計原則がエンジニアリングの基盤**：単一責任、最小オーバーヘッド（5-15ms）、終了コード保持（CI/CD のレッドライン）、フェイルセーフ（フィルタ失敗 → 原文）、透明性（`-vvv` で常に生出力）。**情報損失が最大の失敗モード**。
6. **計測は最適化の前提**：SQLite トラッキング + `rtk gain` が「節約」を定量化・監査可能にする——「速くなった気がする」では満足せず、全コマンドの入出力トークンと節約率を記録する。
7. **単一バイナリ、ゼロ依存、クロスプラットフォーム**：4.1MB、Rust、100+ コマンド、15 の AI ツール統合——インストールと配布コストを最小化。これが爆発的な成功（75k stars）の物理的基盤。
8. **プライバシーへの抑制**：テレメトリはデフォルト無効、匿名・集約のみ、コマンド引数とソースコードを絶対に収集しない——オープンソースツールの信頼への配慮は、持続的成長のための目に見えない資産。

### 5.2 一言まとめ

> **RTK は「省略」ではなく「圧縮」でトークン最適化を行う：フェイルセーフフォールバック、終了コード保持、`-v` で原文確認——あらゆる情報損失に逃げ道を残しつつ、「人間向けノイズ」を LLM の入力パイプラインから絞り出すことに集中する。** AI コーディングエージェントにとって、これは「トークンコスト」と「コンテキスト品質」の対立の中で最もエンジニアリングしやすい部分を解決する：**モデルに「より少なく読ませる」のではなく、「より価値ある読み方をさせる」**ことだ。

---

## 参考資料

- プロジェクトリポジトリ：RTK（Rust Token Killer）—— `https://github.com/rtk-ai/rtk`（README.md、README_zh.md、docs/contributing/ARCHITECTURE.md、docs/TELEMETRY.md、hooks/README.md）
- 公式ドキュメントサイト：`https://www.rtk-ai.app/guide`（インストール、対応エージェント、設定、トラブルシューティング）
- アーキテクチャドキュメント：`docs/contributing/ARCHITECTURE.md`（システム設計、12 戦略のフィルタリング分類法、ADRs、v3.1）
- 節約の仕組みの解説：《How RTK Savings Work》—— `docs/guide/resources/savings-explained.md`
- ローカル参照：`~/.claude/RTK.md`（ローカルインストール済み rtk 0.44.2 の使い方メモ）
- 当サイト関連：《Loop Engineering 徹底解説》シリーズ（`loop-engineering-orange-book` / `loop-engineering-substack-analysis` / `loop-engineering-addy-osmani` / `loop-engineering-langchain`）
