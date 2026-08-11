---
title: "T3 Code 徹底解説：5 つのコーディングエージェントを制御するオープンソース「agent harness control surface」——製品形態、実戦ハンズオン、設計思想"
description: "pingdotgg/t3code（GitHub 18k+ stars、MIT、オープンソース）を主軸に、T3 Code を層ごとに分解する：①プロジェクト概要——Web + デスクトップ + モバイルの 3 表面で Codex/Claude/Cursor/Grok/OpenCode の 5 プロバイダを制御するオープンソース「agent harness control surface」；②ハンズオン——`npx t3@latest` 起動、デスクトップインストール、5 プロバイダのインストールとログイン、4 つの権限モード（Supervised / Auto-accept edits / Auto / Full access）、リモートアクセス（LAN / Tailscale / T3 Connect / SSH）、4 つのソースコントロール（GitHub/GitLab/Bitbucket/Azure DevOps）、WebSocket + OAuth + DPoP 認証、キーバインド、スレッドピン；③技術アーキテクチャ——Effect RPC WebSocket、イベントソーシング・オーケストレーション（command→decider→event→projector）、5 つのプロバイダドライバ、チェックポイント（隠し git ref）、3 つの queue-backed worker、Rust リソース監視サイドカー；④6 つの設計思想——Open at the core、Performance without compromise、Remote ready、Multi-surface、Complexity at the adapter boundary、Event-sourced truth。核心主張：agent harness はフレームワークではなく control surface を必要とする製品形態であり、T3 Code はその判断の工学的実現である。"
date: "2026-08-10"
author: "TopDigg Research Team"
tags: ["T3 Code", "t3code", "pingdotgg", "Agent Harness", "AI Agent", "Coding Agent", "Codex", "Claude Code", "Cursor", "Grok", "OpenCode", "Effect RPC", "Event Sourcing", "Remote Access", "Tailscale", "T3 Connect", "WebSocket", "OAuth", "Clerk", "Electron", "React Native", "Open Source", "MIT"]
categories: ["Deep Dive"]
keywords: ["T3 Code", "t3code", "pingdotgg", "agent harness", "control surface", "multi-provider", "Codex CLI", "Claude Code", "Cursor CLI", "Grok Build CLI", "OpenCode", "Effect RPC", "WebSocket", "event-sourced", "checkpoint", "Tailscale", "T3 Connect", "Clerk OAuth", "DPoP", "Electron", "React Native", "Expo", "設計思想", "AGENTS.md"]
---

# T3 Code 徹底解説：5 つのコーディングエージェントを制御するオープンソース「agent harness control surface」——製品形態、実戦ハンズオン、設計思想

> 核心となるアイデア：**T3 Code（pingdotgg/t3code）は別の agent フレームワークではない——これは「agent harness control surface」である：Codex / Claude / Cursor / Grok / OpenCode の 5 つのプロバイダ CLI をまとめて、遠隔制御可能な一つの実行環境にする Node WebSocket サーバ、そしてそれを Web + デスクトップ（Electron）+ モバイル（React Native）の 3 つのクライアントで任意の機器から制御する。** この製品に込められた中核的な工学的判断は、モデルの能力はすでに agent フレームワークを超えており、**真のボトルネックは「一台のマシンで 5 種類の agent を同時に管理し、どこからでも接続するにはどうするか」** だということだ。T3 Code は Effect RPC WebSocket、イベントソーシング・オーケストレーション、隠し git ref 形式のチェックポイント、独立した Rust リソース監視サイドカー、Clerk OAuth + DPoP 認証、Tailscale / T3 Connect / SSH の 3 つのリモート経路を使い、**「agent harness」を完全な製品形態にまとめ**、MIT ライセンスで公開している。設計思想（AGENTS.md に直接記録されている）は 6 文に圧縮できる——**Open at the core；Performance without compromise；Remote ready；Multi-surface；Complexity belongs at the adapter boundary；Event-sourced truth**。

---

## 一、プロジェクト概要

### 1.1 これは何か？

本記事が分析するのは GitHub リポジトリ [`pingdotgg/t3code`](https://github.com/pingdotgg/t3code)（**18k+ stars / 4k+ forks / 1.5k+ issues**、TypeScript、**MIT ライセンス**）—— 5 つのコーディングエージェントプロバイダにまたがるオープンソースの「agent harness control surface」だ。

一文で要約する：

> **T3 Code = ローカルの Node WebSocket サーバ + React Web UI + Electron デスクトップシェル + React Native モバイルアプリ。任意機器（スマホ、タブレット、別のコンピュータ）から、自分のマシンで動く Codex / Claude Code / Cursor / Grok Build / OpenCode agent を制御できる。**

T3 Code 自身は**モデルの訓練も agent フレームワーク作成も、サブスクリプションの代替もしない**。T3 Code がやることは 5 つ：

1. **provider CLI をラップする**——5 つの異なるプロトコル（Codex app-server、Claude SDK、Cursor agent、Grok CLI、OpenCode SDK）を単一の「provider driver + adapter」インタフェースに統一する
2. **ローカルサーバを動かす**——`npx t3@latest` で起動する Node プロセス（パッケージ名は `t3`）は**すべての provider プロセス、terminal、git、ファイルシステム操作の実行境界**（クライアントは provider を直接呼ばない）
3. **リモート化**——同一の Effect RPC WebSocket プロトコルを 4 つの経路（同一ネットワーク、Tailscale、T3 Connect（Cloudflare トンネル）、デスクトップ管理 SSH）のいずれかで接続できる
4. **多表面 UI**——Web、デスクトップ（Electron が Web バンドルをラップ）、モバイル（Expo / React Native、ネイティブ iOS + Android）
5. **オープンソース + MIT**——AGENTS.md は「if we ever go the wrong direction, you have everything you need to fork」と明言

### 1.2 一行でのポジショニング

> **T3 Code は、オープンソースで、bring-your-own-subscription な、Claude Desktop / Codex App / Cursor Glass / Conductor の代替品である。**

### 1.3 主要事実

- **データ**：GitHub 18,104 stars · 4,083 forks · 1,510 open issues（README + GitHub API）
- **ライセンス**：MIT
- **主言語**：TypeScript（pnpm workspace + Vite+）
- **サーバ Node 要件**：`^22.16 || ^23.11 || >=24.10`
- **対応 5 プロバイダ**：Codex（OpenAI）、Claude Code（Anthropic）、Cursor（Cursor）、Grok Build（xAI）、OpenCode（SST）
- **3 クライアント表面**：Web（`app.t3.codes` ホスティング + `npx t3` ローカル）、デスクトップ（Electron シェル）、モバイル（React Native、iOS App Store / Google Play）
- **4 リモート経路**：直接 WebSocket、Tailscale Serve、T3 Connect（Cloudflare トンネル）、デスクトップ管理 SSH
- **4 権限モード**：`approval-required`（Supervised）/ `auto-accept-edits` / `auto` / `full-access`
- **3 レイヤー（オーケストレーション）**：`apps/server`（実行 runtime）/ `apps/web`、`apps/desktop`、`apps/mobile`（クライアント）/ `packages/*`（共有 contracts、client runtime、telemetry、SSH、Tailscale）
- **アーキテクチャの核心**：サーバはイベントソーシング・オーケストレーション（command → decider → event → projector）、各 turn は隠し git ref でチェックポイント、リソース監視は独立 Rust サイドカー（Node native addon 不使用）、認証は Clerk OAuth + DPoP proof-of-possession
- **コントリビュート方針**：「We are (mostly) not accepting contributions yet. Small fixes may be considered. Big features will not be.」—— 高基準の、Theo（`-bPingdotgg`）個人が率いる初期プロジェクト
- **ユーザー規模**：AGENTS.md は「over 100,000 users」と記述
- **リポジトリ名**：`pingdotgg/t3code`（GitHub 名は `t3code`、アプリは "T3 Code"）

### 1.4 解決する問題

2026 年の「agent 開発体験」は 5 つに分断されている：

1. **5 プロバイダそれぞれ別物**——Codex は独自アプリ、Claude Code は独自 CLI、Cursor は独自デスクトップ、Grok Build はまだベータ、OpenCode は SDK。これらを切り替えるのは不連続
2. **作業機の前でしか使えない**——スマホを見ている時、ローカルで動く agent は止まる
3. **機器間同期が弱い**——デスクトップで始めたスレッドをスマホで見られない
4. **リモート + セキュリティ + 性能**——Tailscale や SSH ポートフォワードは機能するが、プロジェクトごとに再実装；マネージドトンネルは性能劣化を招く
5. **権限粒度が粗い**——モデルにメインブランチで `rm -rf` を無監督で走らせたくない

T3 Code の答え：**オープンソースの実行ランタイム 1 つ、リモートプロトコル 1 つ、4 モード権限システム 1 セット、ネイティブクライアント 3 つ、プロバイダ対応 5 つ。**「agent harness」を 5 製品から 1 製品に統合する。

---

## 二、詳細ハンズオン：ゼロから 5 つの agent を遠隔制御する

このセクションは「インストール → プロバイダ設定 → 4 権限モード → リモートアクセス → ソースコントロール → 応用」の 6 ステップで進む。各ステップにコピー可能なコマンド、最小例、注意点がある。出典：[docs/user/](https://github.com/pingdotgg/t3code/tree/main/docs/user)。

### 2.1 ステップ 1：T3 Code のインストール

**前提条件**：

- Node.js `^22.16 || ^23.11 || >=24.10`（**T3 サーバを動かすマシンに**）
- 少なくとも 1 つの provider CLI をインストールしログイン済み（下のステップ 2）

**最速のお試し（何もインストールしない）**：

```bash
npx t3@latest
```

ローカルで T3 サーバが起動し、自動的にローカル Web アプリが開く。`npx t3@latest --help` で CLI 全リファレンスを表示。

**デスクトップアプリ**（多くの人はここから）：

| プラットフォーム | コマンド |
|---|---|
| Windows | `winget install T3Tools.T3Code` |
| macOS | `brew install --cask t3-code` |
| Arch Linux | `yay -S t3code-bin` |
| 任意 | [GitHub Releases](https://github.com/pingdotgg/t3code/releases) からダウンロード |

> 重要：デスクトップアプリには `t3` バックエンドが付属。デスクトップアプリをサーバとして、スマホや別の PC から接続することもできる。

### 2.2 ステップ 2：provider のインストールとログイン

T3 Code は provider CLI を**同梱しない**——使うものを自分で入れる。**T3 サーバを動かすマシン**で（スマホでも閲覧デバイスでもなく）ログインする：

| Provider | CLI インストール | ログインコマンド | デフォルトバイナリ |
|---|---|---|---|
| **Codex** | [Codex CLI](https://developers.openai.com/codex/cli) | `codex login` | `codex` |
| **Claude** | [Claude Code](https://claude.com/product/claude-code) | `claude auth login` | `claude` |
| **Cursor** | [Cursor CLI](https://cursor.com/cli) | `agent login` | `cursor-agent` |
| **Grok Build** | [Grok Build CLI](https://x.ai/cli) | `grok login` | `grok` |
| **OpenCode** | [OpenCode](https://opencode.ai) | `opencode auth login` | `opencode` |

> **Cursor 注意点**：`cursor-agent` バイナリをインストールするが、**ログインは `agent login`（`cursor-agent login` ではない）**。Cursor のドキュメントには書かれていないが、T3 Code ドキュメントは明示的に警告している。

**CLI が見つからない？** Settings → provider instance → **Binary path** で絶対パスを指定する（Volta / asdf / fnm などのバージョンマネージャ使用時によく必要）。

**いつログインが必要？** その provider でセッションを開始する**前**——T3 Code 起動時には不要。先にインストール・起動して、後でログインを追加することもできる。

### 2.3 ステップ 3：権限モードを選ぶ（4 種類）

権限モードは message composer の mode control で**スレッドごとに独立**設定する。AGENTS.md と docs/user/permission-modes.md の対照：

| モード | 動作 | 使いどころ |
|---|---|---|
| **Supervised**（モバイルでは "Approve actions"） | コマンドとファイル変更の前に毎回確認 | 初めてのタスク；価値の高いリポジトリ |
| **Auto-accept edits** | ファイル変更は自動承認；コマンドは確認 | リファクタリング中心のタスク |
| **Auto** | ルーチン操作は確認不要；危険なものは確認 | 通常開発。Codex は AI reviewer、Claude は独自の auto mode、相当機能のない provider（OpenCode 等）は Supervised にフォールバック |
| **Full access**（デフォルト） | コマンドも編集も確認なし | 捨てられる worktree / sandbox |

あるスレッドから派生したスレッドは親スレッドのモードを**継承**。それ以外はデフォルトで Full access。

各モードは provider 自身が承認/sandbox 設定にマッピングする：Codex は `approval-policy` + `sandbox` レベルに変換、Claude は `auto-permission-mode` を使う。**モバイルも 4 種類すべてサポート**、「Supervised」を「Approve actions」と表示する。

### 2.4 ステップ 4：リモートアクセス

「remote ready」は T3 Code の核となる約束の一つ。ドキュメントは 4 つのアクセス方法を明確に区別している。

#### 2.4.1 直接 WebSocket（同一ネットワーク、最もシンプル）

T3 サーバが `192.168.x.y:3773` で動いていれば、同じ LAN 内のスマホ/PC から `http://192.168.x.y:3773` に pairing token 付きで直接接続できる。**注意：HTTPS ページのブラウザはプレーン HTTP エンドポイントを使えない**（mixed-content rule）—— HTTPS を使うか、デスクトップアプリか CLI で直接接続する。

#### 2.4.2 Tailscale（推奨）

Tailscale を使っている場合、デスクトップアプリは tailnet を自動検出し、tailnet IP（`100.x.y.z`）、MagicDNS、Tailscale Serve HTTPS を Settings → Connections に並べる。

```bash
# Tailscale HTTPS を有効化
npx t3 serve --tailscale-serve
# https://machine.tailnet.ts.net/ で backend を公開
```

またはデスクトップ Settings → Tailscale HTTPS のスイッチをオンにする（**デフォルト off**）。デスクトップアプリが自動的に `tailscale serve --https=443` を設定する。

**推奨理由**：安定したアドレス + トランスポート層暗号化 + 公開ネットに晒さない。

#### 2.4.3 T3 Connect（Cloudflare トンネル、ゼロネットワーク設定）

T3 Connect は T3 Code 専用のマネージド Cloudflare トンネルソリューション——マシンが NAT 配下にある、入力ポートが利用できない、モバイルがデスクトップホストの env に到達する必要がある時に使う。認証は Clerk OAuth。

```bash
# T3 サーバマシンで
npx t3 connect link
# pinned managed cloudflared をインストール、認可、intent を永続化
npx t3 serve
# relay link を reconcile し managed tunnel を起動
```

仕組み：relay Worker は**資格情報とマネージドエンドポイントの中継だけ**。アプリケーショントラフィックはプロビジョニングされた Cloudflare トンネルのホスト名を通り、**relay Worker 自身は通らない**。

**デスクトップアプリ + T3 Connect**：
1. Settings → T3 Connect → Clerk でログイン
2. Settings → T3 Connect → "Link this environment"
3. モバイル：Connections → Add Environment → 同じアカウントでログイン → 自動発見

#### 2.4.4 デスクトップ管理 SSH 起動

デスクトップアプリは**SSH でリモートマシンに接続し、T3 サーバを起動/再利用、ポートフォワードして戻す**ことができる。Settings → Connections → Add environment → SSH launch flow → `user@example.com` を入力 → 確認。デスクトップが：

1. ホストをプローブ
2. リモート T3 サーバを起動または再利用
3. ローカルポートフォワードを開く
4. 環境を保存（再接続時に再利用）

> **SSH launch トラブルシューティング**：リモートには互換 Node（`^22.16 || ^23.11 || >=24.10`）が必要。nvm ユーザーは `nvm alias default 24` を実行。ランチャーは `~/.t3/ssh-launch/<host-key>/` に書き込み、stale プロセスを kill して fresh サーバを起動——通常は手動クリーンアップ不要。

#### 2.4.5 Pairing プロトコル（全経路共通）

どの経路でも pairing フローは同じ：

1. `t3 serve` が一時 owner pairing token を発行
2. リモート機器がトークンをサーバと交換しセッションを作成
3. 以降はセッションベースでアクセス（新規デバイス追加時のみ元のトークンを再使用）

**ホスティング pairing URL の形式**：

```text
https://app.t3.codes/pair?host=https://backend.example.com:3773#token=PAIRCODE
```

- トークンは URL ハッシュ内（**ホスティングアプリには送信されない**）
- ホスティングアプリは**トラフィックをプロキシしない**——ブラウザが直接 backend に接続
- backend がブラウザから HTTPS/WSS で到達可能である必要がある。プレーン HTTP LAN エンドポイントはデスクトップ/CLI の直接 pairing を使う

#### 2.4.6 Pairing 後の管理

`npx t3 auth`：
- 追加の pairing 資格情報を発行
- アクティブセッションを確認
- 古い pairing リンクやセッションを revoke

### 2.5 ステップ 5：ソースコントロール統合

T3 Code は 4 つの Git プラットフォームと直接統合する。認証は**T3 サーバマシンで行う**（ブラウザではない）。

#### 2.5.1 GitHub

```bash
brew install gh
gh auth login
# T3 Code → Settings → Source Control を開き、GitHub が認証済みであることを確認
```

できること：clone、publish、PR 作成（コミットからタイトル/説明を提案）、PR レビュー（チームメイトのブランチを right-panel タブで開く）。

#### 2.5.2 GitLab

```bash
brew install glab
glab auth login
```

Merge Request、リポジトリ公開、ホスティング clone をサポート。

#### 2.5.3 Bitbucket

CLI なし、**環境変数**を使用（access token 推奨）：

```bash
export T3CODE_BITBUCKET_ACCESS_TOKEN="your-access-token"
# または
export T3CODE_BITBUCKET_EMAIL="you@example.com"
export T3CODE_BITBUCKET_API_TOKEN="your-token"
# 設定後 T3 Code を再起動
```

両方設定された場合 access token が優先。

#### 2.5.4 Azure DevOps

```bash
brew install azure-cli
az extension add --name azure-devops
az login
```

#### 2.5.5 汎用

**任意の Git URL** を Custom Git URL で clone できる。コミットのないローカルリポジトリは **Publish Repository** アクションで、GitHub / GitLab / Bitbucket / Azure DevOps に新規リポジトリ作成 + origin 追加 + push まで一気通貫。

### 2.6 ステップ 6：キーバインドとスレッド管理

#### 2.6.1 キーバインド

`~/.t3/userdata/keybindings.json`（T3 サーバマシン上）に保存。T3 Code は初回起動時にビルトインデフォルトを書き出し、以降の起動では新しいデフォルトを**追加するだけ**——ただしユーザールールがコマンドまたはショートカットを既に主張している場合は上書きしない。無効なルールは無視、無効なファイルはファイル全体を無視し、サーバログに警告。

形式：

```json
[
  { "key": "mod+g", "command": "terminal.toggle" },
  { "key": "mod+shift+g", "command": "terminal.new", "when": "terminalFocus" }
]
```

`key` は `mod`（macOS=cmd、他=ctrl）、`cmd`/`meta`、`ctrl`/`control`、`shift`、`alt`/`option` をサポート。`when` は `!`、`&&`、`||`、括弧をサポート。現在のコンテキストキー：`terminalFocus`、`terminalOpen`、`previewFocus`、`previewOpen`、`modelPickerOpen`（実行時に増える、固定ではない）。

評価：**配列順で反復、`key` と `when` が両方マッチする最後のルールが勝つ**。同一コマンド内だけでなく、コマンド横断で優先順位が評価される。

#### 2.6.2 スレッドピンとクロスデバイス並び

- スレッドをコンテキストメニューからピン → アクティブな仕事の上にピンセクションとして表示
- 並び順は**サーバに保存**され、**接続中の全デバイス間で同期**
- Web/デスクトップ：ドラッグで並び替え。モバイル：Move up / Move down
- 古いサーバは同期並びを理解しない——アップグレードが必要

#### 2.6.3 プロジェクトアイコンのカスタマイズ

Settings → Projects → プロジェクト選択 → Appearance → Choose a project file。SVG / PNG / ICO / JPEG / GIF / AVIF / WebP をサポート。デフォルト自動検出は `t3.json`、一般的な favicon / アプリアイコンパス、HTML ファイルの `<link rel="icon">` を確認。

### 2.7 ステップ 7：アプリとサーバの同期を保つ

`npm run build` でビルドしたクライアントはサーバと同一バージョンを期待する——**バージョン不一致は警告を出す**：

- 現在の会話（message box の上）
- Settings → Connections、影響を受ける接続の横

サーバの起動方法によって適切な対処が異なる：

| 起動方法 | 対処 |
|---|---|
| **Linux バックグラウンドサービス** | **Update server** ボタンをクリック。T3 Code が準備、テスト、再起動、再接続を自分で実行 |
| **デスクトップアプリ起動** | **サーバを動かしているデスクトップアプリ**でアプリ更新 |
| **CLI 起動** | **Copy update command** → サーバマシンで `npx t3@<client-version>` を実行 |

バックグラウンドサービスの詳細：`npx t3@latest service install/update/status/uninstall`。systemd ユニットは**安定 launcher**（不変）を実行し、各正確なバージョンは `versions/<version>` に独立配置——失敗した trial は**ユニット書き換えなしで前バージョンにロールバック**可能。launcher は旧サーバ停止後かつ trial 開始前に**SQLite（WAL と SHM を含む）全体をスナップショット**——データベースマイグレーションはバージョンと共にロールバック、**ダウンマイグレーション不要**。trial は 120 秒以内に `prepared` を報告する必要あり；それを超えると launcher は trial を停止 → スナップショット復元 → ロールバック記録 → A を起動。

### 2.8 ステップ 8：Linux バックグラウンドサービス

```sh
npx t3@latest service install   # インストール
npx t3@latest service status    # 状態確認
npx t3@latest service update    # アップグレード/修復
npx t3@latest service uninstall # 削除
```

現在は **Linux + systemd** 必須。T3 Connect からサインアウトしても**サービスはアンインストールされない**。

---

## 三、要約：8 つの核心的インサイト

T3 Code の設計文書、AGENTS.md、アーキテクチャページを読み終えると、agent 時代の製品形態について 8 つの判断が浮かび上がる。

### 3.1 インサイト 1：agent harness は新形態の製品であり、もう一つの agent フレームワークではない

AGENTS.md は「T3 Code is a minimal GUI for coding agents.」で始まる——が、直ちに道具化される：5 プロバイダの CLI プロセスをラップし、すべての実行を所有する 1 つの Node サーバを動かし、3 つのクライアントから遠隔制御する。

含意：**モデル能力が十分強くなると、agent フレームワーク層は均質化する——差別化は「agent をどう長時間動かし、どこからでも接続し、見やすくするか」になる。** T3 Code はこの判断を「agent harness control surface」という**新形態製品**として具体化した。

**結論**：coding agent ツールを作るなら、**agent フレームワークで競わない**——実行環境、リモート経路、多表面体験、可観測性で競う。

### 3.2 インサイト 2：実行境界はサーバにあり、クライアントにはない

アーキテクチャドキュメントより：

> "every provider process, terminal, git operation, and filesystem read happens there, never in the client."

具体化：
- クライアントは provider を**直接呼ばない**——すべての provider 操作は `orchestration.dispatchCommand` RPC 経由
- クライアントは RPC client / retry loop / raw orchestration command を**構築しない**（`client-runtime` パッケージが一元管理）
- terminal、git、fs はすべてサーバ上

この引き方により、T3 Code は**クライアント形態を自由に切り替えられる**——4 つ目 5 つ目のクライアントを追加しても、サーバの実行意味論は変わらない。

**結論**：多表面 agent 製品を作るなら、**実行境界をサーバに置く**——クライアントで provider プロセスを走らせると、新しいクライアントごとにランタイムを書き直す羽目になる。

### 3.3 インサイト 3：event sourcing は agent オーケストレーションの正しい構造

サーバのオーケストレーションは event-sourced：

```
command → decideOrchestrationCommand（純粋関数）→ events
events → projector → 読みモデル（messages、threads、checkpoints、session status）
events は同時に event store へ append
append + project は 1 つの SQL トランザクション内
```

**利点**：
- **読みモデルはイベントログと永続的に矛盾しない**——同じトランザクション内だから
- **失敗時リプレイが容易**——dispatch 失敗時、starting sequence 以降のイベントを再読込して reconcile
- **「turn 完了」に権威ある定義がある**：session が `running` を離れた時点（checkpoint/diff 完了ではない）
- **idempotency が自然**——`processEnvelope` が最初に durable command receipt を確認するため、同じ command のリトライは冪等

**結論**：agent の「会話 + 仕事」の二重構造（ユーザメッセージ + ツール呼び出し + ファイル差分 + agent テキスト）は event sourcing に自然に適合する。CRUD ステートマシンとして記述しようとしてはならない。

### 3.4 インサイト 4：provider 抽象化は adapter 層で行い、オーケストレーションは純粋に保つ

5 つの provider driver + 5 つの adapter は**二段構成**：

- **driver** は `driverKind` + `configSchema` + `create`（adapter を構築）を宣言
- **adapter** は `ProviderAdapter` インタフェースを実装

`ProviderService` が最上位に座る——**thread の背後にどの agent があるか知らず、thread があることだけ知っている**。`thread.turn.start` と `thread.approval.respond` はクライアント呼び出し可能なプリミティブ全体；`thread.message.assistant.delta` と `thread.session.set` は server 側 reactor が発生する内部イベント。

**新 provider 追加 = driver 1 つ + adapter 1 つ + `BUILT_IN_DRIVERS` への追加**——orchestration、contract、client に変更不要。

**結論**：**complexity belongs at the adapter boundary**（AGENTS.md 原文）——多様性を adapter に閉じ込め、本幹を純粋に保つ。

### 3.5 インサイト 5：リモート = 1 つのプロトコル + 複数のアクセス方法、ランタイムを分断しない

ドキュメントより：「Remoteness is expressed at the connection layer, never by splitting the runtime.」

具体化：
- LAN、Tailscale、T3 Connect、デスクトップ SSH のいずれでも、**T3 サーバは同じプロセス**、同じイベントログ、同じ SQLite
- 4 つの access method（直接 / Tailscale / T3 Connect / デスクトップ SSH）は**単なる接続層の違い**
- 3 つの launch method（既存 / デスクトップ SSH 起動 / クライアント管理 publish）も**サーバがどう生まれたかの違い**

**結論**：リモート agent 製品を作るなら、**プロトコルを安定させ、接続層を多様化**する——経路ごとに独立ランタイムを書くな。

### 3.6 インサイト 6：capability-based OAuth は多表面 agent にこそ最適

T3 Code は `admin`/`user` ロールモデルを使わない。OAuth スタイルのスコープ文字列を使う：

```
orchestration:read / orchestration:operate / terminal:operate /
review:write / access:read / access:write / relay:read / relay:write
```

通常の pairing は 4 つの client-operation スコープ + `relay:read` を付与；bootstrap credential はさらに `access:read/write` + `relay:write` を付与。**各 RPC メソッドは自身の required scope を宣言**——`RPC_REQUIRED_SCOPE` マップで。

認証フローは RFC 6750（Bearer）+ RFC 8693（Token Exchange）+ RFC 6749（Scopes）に準拠：
- `POST /oauth/token`（`grant_type=urn:ietf:params:oauth:grant-type:token-exchange`）
- `POST /api/auth/websocket-ticket` で 5 分間の短い ticket を取得、**長寿命トークンを WebSocket URL に含めない**
- **DPoP-bound アクセストークン**（proof-of-possession）は relay 仲介クライアント用、1 時間 TTL——漏洩したトークンは対応する鍵なしにリプレイできない

**結論**：agent プラットフォームは「admin / 一般ユーザー」の二分モデルを使うべきではない——capability スコープを使い、各 RPC メソッドが必要な能力を宣言させる。

### 3.7 インサイト 7：独立した Rust リソース監視サイドカーは Node native addon より安全

なぜ Node native addon で process counter を読まないのか？ドキュメントの答え：

> "The cost is one persistent child process and NDJSON serialization. That is a better failure boundary than repeatedly spawning shell utilities or loading native code into Node."

具体化：
- `native/resource-monitor` は**独立した Rust 実行ファイル**（`sysinfo` クレート使用）、stdin/stdout 上で NDJSON 通信
- N-API / `ffi-rs` / dynamic library ではない
- monitor がクラッシュしても **Node ランタイムを汚染しない**——サーバは通常の子プロセスとして supervisor、restart、version-check、計測できる
- **同じプロトコル**が desktop / web / headless server で使える
- **パッケージングが単純**——単一プラットフォームバイナリ、**N-API × Node × Electron ABI マトリックスなし**

デスクトップアプリは Electron ホストテレメトリ（powerMonitor、`app.getAppMetrics`、ホスト電源状態）を継承 fd 4 と 5 経由で追加——**renderer WebSocket 経由ではない**。

**結論**：OS レベルのデータが必要な時、**独立サイドカー + NDJSON は Node native addon より安全**——失敗境界、version 制御、パッケージングすべてで優位。

### 3.8 インサイト 8：設計思想は AGENTS.md に書く、口伝ではなく

T3 Code は設計思想を `AGENTS.md`（リポジトリルート）に書いている——これは模倣する価値が最も高い点の一つ。4 つの番号付き原則：

```
1. Open at the core
2. Performance without compromise
3. Remote ready
4. Multi-surface
   - Web (2 surfaces: app.t3.codes + npx t3)
   - Desktop (Electron shell)
   - Mobile (React Native)
```

Theo の「a note from Theo」段落は全文引用する価値がある：

> "I like ambitious ideas, simple systems, and software that feels obvious. Do not preserve complexity just because it already exists. Do not introduce machinery because it looks architecturally impressive. Understand the real constraint, then fight for the smallest model that makes the correct behavior unsurprising."

> "Channel both 'measure twice, cut once' and 'yagni'. Fight scope creep."

**結論**：「やらないこと」と「なぜそうするのか」を AGENTS.md に明示する——高基準プロジェクトがスケールする唯一の方法。

### 3.9 8 つのインサイトの関係

```
インサイト 1：agent harness は新形態の製品
   ↓ (製品ポジショニング)
インサイト 2：実行境界はサーバ
   ↓ (アーキテクチャ基盤)
インサイト 3：event sourcing はオーケストレーションの正しい構造
インサイト 4：provider 抽象は adapter 層
   ↓ (拡張性)
インサイト 5：リモート = 1 プロトコル + 多接続層
インサイト 6：capability-based OAuth がロールモデルより最適
   ↓ (運用品質)
インサイト 7：独立 Rust サイドカーが Node native addon より安全
インサイト 8：設計思想は AGENTS.md に書く
```

インサイト 1 は製品判断、2/3/4 は工学的基盤、5/6 は拡張性と運用性、7/8 は工学的規律。どれか 1 つでも欠けると製品形態は崩壊する。

---

## 四、設計思想：AGENTS.md をデザインマニフェストとして読む

T3 Code の設計思想は単一の「manifesto」ではない——`AGENTS.md`、`docs/internals/*.md`、`.plans/` のアーキテクチャ決定記録に散らばっている。それらを集約すると、意思決定を独立に評価できる 6 つの哲学が得られる。

### 4.1 哲学 1：Open at the core

**原文**：「T3 Code is truly open. We share our roadmap, we share how we think about things, and of course we share all our code.」

**実践**：
- MIT ライセンス
- ロードマップは GitHub 上
- 内部 `.plans/` ディレクトリに**すべての重要な決定**を記録（`01-shared-model-normalization.md` → `19-remote-endpoints-hosted-static.md` まで完全公開）
- agent 向け `AGENTS.md` もオープンソース——**fork すればそのまま新 agent に使える**
- 「We work in the open, and should strive to stay that way.」

**判断根拠**：設計過程を公開しなければ、「オープンソース」は殻に過ぎない。T3 Code は「open」を**監査可能な工学的実践**にしている——`.plans/` が監査証跡、`AGENTS.md` がアクションマニュアル。

### 4.2 哲学 2：Performance without compromise

**原文**：「Lots of apps have gotten bogged down with bad tech decisions and 'slop'. We have not, and we're proud of the performance of T3 Code. We regularly audit for performance regressions, often caused by sending too much data over websockets, css animations causing gpu spikes, lists being hard to render, and more.」

**実践**：
- WebSocket トラフィック監査——**過剰データを流さない**
- CSS アニメーション監査——**継続的再描画なし**
- 大きなリストの描画監査
- 「No continuously repainting animations; they peg the GPU on high-refresh displays.」（AGENTS.md 原文）
- T3 Code ユーザーは**一日中 agent を操作**する——「a dropped frame, a lying spinner, and a stale label」が気づかれる

**判断根拠**：agent のチャット UI は**長時間開いたまま**——小さなパフォーマンス問題が持続的な摩擦に蓄積する。性能は nice-to-have ではなく、ユーザー維持そのもの。

### 4.3 哲学 3：Remote ready

**原文**：「The architecture of T3 Code's websocket layer (npx t3) enables a lot of awesome remote features. These have become core to the product.」

**実践**：
- 4 つの access method（直接 / Tailscale / T3 Connect / デスクトップ SSH）が 1 本の Effect RPC WebSocket を共有
- 4 つの launch method（既存 / デスクトップ SSH 起動 / クライアント管理 publish）は単なる「サーバがどう生まれたか」の違い
- Tailscale は**エンドポイントプロバイダのアドオン**で、独立したランタイム概念ではない
- WebSocket は**5 分の短い ticket**で認証（長寿命トークンを URL に入れない）
- すべての新機能について「リモートで動くか」を検討

**判断根拠**：agent は 24×7 動く——ユーザーはエディタの前にいるとは限らない。**リモートは追加機能ではなく中核機能**。アーキテクチャの初期段階で正しくやる方が後付けより安価。

### 4.4 哲学 4：Multi-surface

**原文**：「T3 Code has 3 key app surfaces: web, desktop, and mobile.」

**実践**：
- **Web は実際には 2 つの表面**：`app.t3.codes` ホスティング + `npx t3` ローカル——**両方をサポート**
- デスクトップは Electron シェルで、**`t3code://` プロトコル経由で Web バンドルを読み込む**
- モバイルは React Native（**同じ `packages/client-runtime`** を使用）
- `apps/web/src/connection/runtime.ts` と `apps/mobile/src/connection/runtime.ts` は**1 行ずつ一致**（プラットフォーム固有のバックグラウンド活動層を除く）

**判断根拠**：ユーザーは**1 種類の機器だけ使わない**——デスクトップで作業、スマホで進捗確認、タブレットで PR レビュー。**多表面は現実の分布**であり、「ネイティブアプリ追加」程度の話ではない。

### 4.5 哲学 5：Complexity belongs at the adapter boundary

**原文**：「Complexity belongs at the adapter boundary. Orchestration stays pure, UI stays dumb.」

**実践**：
- オーケストレーション層の `decider.ts` は**純粋関数**——`(command, state) => events`、副作用なし
- 5 つの provider adapter が 5 つの CLI プロトコルの差異を**それぞれのファイル内に閉じ込める**
- Effect はサーバで多用、**React コンポーネントは transport、retry loop、RPC client を構築しない**（`client-runtime` パッケージが所有）
- UI コンポーネントはダム——**ドメイン状態は Atom factory**（`createProjectEnvironmentAtoms`、`createThreadEnvironmentAtoms`）

**判断根拠**：**純粋関数のコア + 副作用のエッジ**はソフトウェア工学の銀の弾丸——テスト可能、推論可能、進化可能な部分を最大化し、混沌を境界に圧縮する。

### 4.6 哲学 6：Event-sourced truth

**文書**：「Orchestration is event-sourced. The server does not mutate app state directly. Clients dispatch typed commands; the engine turns them into persisted events; projections derive the read model.」

**実践**：
- **読みモデルとイベントログが同じ SQL トランザクション**——永続的な一貫性は自動
- `processEnvelope` は最初に**durable command receipt**を確認——リトライは冪等
- **「turn 完了」に権威ある定義**がある：session が `running` を離れた時点（checkpoint/diff 完了ではない）
- 3 つの queue-backed worker（`ProviderRuntimeIngestion` / `ProviderCommandReactor` / `CheckpointReactor`）は `DrainableWorker` 上に構築——**enqueue アトミック + カウンタアトミック**
- **runtime receipts はテスト専用**——`RuntimeReceiptBusLive` は本番で no-op、テスト層だけが PubSub ベース

**判断根拠**：agent システムは本質的に**長フロー + 多ステップ + リトライ容易 + ツール副作用**を持つ——event sourcing はこの形の**最も自然な骨格**。用語集の表現：「requested」= 意図が記録された、「completed」= 結果が適用された、「receipt」= テスト専用の非同期マイルストーン。

### 4.7 哲学まとめ：6 つの哲学が T3 Code の設計宣言を成す

| 哲学 | 一行 | 実践 |
|---|---|---|
| 1. Open at the core | 設計過程も公開 | MIT + `.plans/` 決定公開 + AGENTS.md オープンソース |
| 2. Performance without compromise | 性能はユーザー維持そのもの | WebSocket トラフィック監査 + アニメーション監査 + リスト描画監査 |
| 3. Remote ready | リモートは追加機能ではない | 4 access 共有 1 プロトコル + 5 分短 ticket |
| 4. Multi-surface | 多機器利用は現実 | Web (2) + Desktop + Mobile が client-runtime を共有 |
| 5. Complexity at adapter boundary | 純粋関数コア + エッジ副作用 | decider 純粋 + 5 provider adapter + UI ダム |
| 6. Event-sourced truth | 読みモデルはイベントログと矛盾不能 | command → event → projection（同一トランザクション）+ 冪等リトライ |

**6 つは独立ではない——鎖を成す**：open で fork 容易 → performance でユーザー維持 → remote で agent 持続 → multi-surface で多機器利用 → adapter 隔離で provider 増加 → event-sourcing で非同期整然。**どれか 1 つでも欠ければ製品形態は不完全**。

### 4.8 「a note from Theo」

AGENTS.md の一節を単独で引用する価値がある：

> "I like ambitious ideas, simple systems, and software that feels obvious. Do not preserve complexity just because it already exists. Do not introduce machinery because it looks architecturally impressive. Understand the real constraint, then fight for the smallest model that makes the correct behavior unsurprising."

> "Channel both 'measure twice, cut once' and 'yagni'. Fight scope creep. Try to honor the dev's intent in both a minimal and realistic fashion."

> "The rest of this document is meant to help you navigate the codebase and make changes effectively. Think of these instructions less as 'hard rules', more as 'good defaults'. The developer's preferences should be able to override anything here."

**これは技術哲学ではなく、仕事の哲学だ。** T3 Code が**5 つの provider を包むが 6 つ目を作らない**、**CRUD ではなく event sourcing を書く**、**Node native addon ではなく Rust サイドカーを使う**理由を説明する——常に**最小のモデル**だからだ。

---

## 五、核心の要約

T3 Code が示す最も重要な判断：**2026 年、agent 時代の次の製品形態は「もう一つの agent フレームワーク」ではなく「agent harness control surface」だ——5 つのプロバイダを、3 つのクライアントを、4 つのリモート経路を自由に切り替えられるローカル実行ランタイム。**

- **agent harness を再定義**——フレームワークではなく control surface、単一プロバイダではなく 5 互換、デスクトップ限定ではなく web + desktop + mobile、ローカル限定ではなく 4 つのリモート経路
- **実行境界をサーバに置く**——全 provider プロセス、terminal、git、fs はサーバに；クライアントは provider を直接呼ばない
- **event sourcing で agent の非同期を解決**——command → decider → event → projector（同一 SQL トランザクション）、リトライは構造的に冪等、turn 完了に権威ある定義
- **provider の差異を adapter に閉じ込め**——5 driver + 5 adapter、orchestration 本幹は純粋、6 つ目の provider 追加は本幹に触らない
- **リモートを 4 access × 3 launch の行列に**——同一プロトコル + 多接続層、ランタイム分断なし
- **capability スコープで認証**——OAuth 2.0 スタイル（RFC 6750/8693/6749）+ 5 分 WebSocket ticket + DPoP proof-of-possession
- **Rust サイドカーで OS レベルリソース監視**——Node ランタイム非汚染、全プラットフォーム同一プロトコル
- **「やらないこと」を AGENTS.md に書く**——設計思想、`.plans/` 決定、hit-every-surface チェックリストを公開

覚えるべき一文：**T3 Code は agent を作らず、モデルを作らず、サブスクリプションを作らない——T3 Code を作るのは「agent harness control surface」、Codex/Claude/Cursor/Grok/OpenCode の 5 つの agent を 1 台のローカルサーバで動かし、web/デスクトップ/モバイルの 3 表面からどこからでも、ユーザの権限ポリシーの元で制御する。**

---

## 付録 A：参考リンク

- [T3 Code GitHub リポジトリ](https://github.com/pingdotgg/t3code)
- [T3 Code README](https://github.com/pingdotgg/t3code/blob/main/README.md)
- [T3 Code AGENTS.md](https://github.com/pingdotgg/t3code/blob/main/AGENTS.md)
- [docs/README](https://github.com/pingdotgg/t3code/blob/main/docs/README.md)
- ユーザードキュメント：
  - [Install](https://github.com/pingdotgg/t3code/blob/main/docs/user/install.md)
  - [Permission modes](https://github.com/pingdotgg/t3code/blob/main/docs/user/permission-modes.md)
  - [Remote access](https://github.com/pingdotgg/t3code/blob/main/docs/user/remote-access.md)
  - [Source control](https://github.com/pingdotgg/t3code/blob/main/docs/user/source-control.md)
  - [Keybindings](https://github.com/pingdotgg/t3code/blob/main/docs/user/keybindings.md)
  - [Thread sidebar](https://github.com/pingdotgg/t3code/blob/main/docs/user/thread-sidebar.md)
  - [Project settings](https://github.com/pingdotgg/t3code/blob/main/docs/user/project-settings.md)
  - [Updating](https://github.com/pingdotgg/t3code/blob/main/docs/user/updating.md)
  - [Background service](https://github.com/pingdotgg/t3code/blob/main/docs/user/background-service.md)
- 内部アーキテクチャ：
  - [Architecture overview](https://github.com/pingdotgg/t3code/blob/main/docs/internals/overview.md)
  - [Workspace layout](https://github.com/pingdotgg/t3code/blob/main/docs/internals/workspace-layout.md)
  - [Providers](https://github.com/pingdotgg/t3code/blob/main/docs/internals/providers.md)
  - [Connection runtime](https://github.com/pingdotgg/t3code/blob/main/docs/internals/connection-runtime.md)
  - [Remote architecture](https://github.com/pingdotgg/t3code/blob/main/docs/internals/remote.md)
  - [T3 Connect](https://github.com/pingdotgg/t3code/blob/main/docs/internals/t3-connect.md)
  - [Environment auth](https://github.com/pingdotgg/t3code/blob/main/docs/internals/environment-auth.md)
  - [Server updates](https://github.com/pingdotgg/t3code/blob/main/docs/internals/server-updates.md)
  - [Resource telemetry](https://github.com/pingdotgg/t3code/blob/main/docs/internals/resource-telemetry.md)
  - [Glossary](https://github.com/pingdotgg/t3code/blob/main/docs/internals/glossary.md)
  - [CI gates](https://github.com/pingdotgg/t3code/blob/main/docs/internals/ci.md)
- [Mobile README](https://github.com/pingdotgg/t3code/blob/main/apps/mobile/README.md)
- ダウンロード：[GitHub Releases](https://github.com/pingdotgg/t3code/releases) · `winget install T3Tools.T3Code` · `brew install --cask t3-code` · `yay -S t3code-bin`
- オンライン：[app.t3.codes](https://app.t3.codes) · iOS App Store · Google Play
- コミュニティ：[Discord](https://discord.gg/jn4EGJjrvv)
