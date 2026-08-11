---
slug: bb-ide-analysis
title: "bb 徹底解説：自己構築するエージェント IDE——すべてのプログラミング Agent をオーケストレーションするプログラマブル・ワークスペース（プロジェクト解説 + クイックスタート・チュートリアル + システムアーキテクチャ + 設計哲学）"
description: "get-bb/bb（GitHub のオープンソースプロジェクト、MIT ライセンス、1.6k stars）を題材に、『自己構築するエージェント IDE（The agent IDE that builds itself）』を徹底解説。核心理念：bb はコーディング Agent のためのプログラマブル・ワークスペース（programmable workspace for coding agents）である——ユーザーも Agent も第一級の操作主体（first-class operator）であり、デスクトップ App・Web App・CLI・HTTP API の4つのサーフェスすべてが第一級の地位を持つ。作業はスレッド（thread）の中で実行され、リアルタイム追従・随時の方向転換・別の Agent への引き継ぎができる。Agent はオーケストレーションされるだけでなく、SDK/CLI/HTTP API を通じて bb をプログラム的に利用でき、『オーケストレーターのオーケストレーション』と自己ブートストラップを実現する。プロジェクト解説：新しい Agent を発明するのではなく、既存の Claude Code・Codex・Cursor（ACP）・Pi・OpenCode・Grok Build・Hermes などの provider CLI（認証済みの資格情報を再利用）をオーケストレーションする。クイックスタート・チュートリアル：npx bb-app@latest → http://localhost:38886。CLI（bb skill list / config / env / ssh-target）。Node SDK（BBSdk：スレッドを spawn → wait idle → output）。システムアーキテクチャ：Server（SQLite が真実の源 + HTTP API + WebSocket イベントプッシュ、自身はステートレス）→ Host daemon（各実行マシンに常駐し、workspace を供給し、provider プロセスを実行）→ App → CLI。データモデルには Project/Source、Thread（standard/manager/child 委任）、Environment（managed/unmanaged）と Host が含まれる。2つの契約パッケージ @bb/server-contract と @bb/host-daemon-contract がコンポーネント間の境界を厳密に定義する。設計哲学の6原則：ユーザーと Agent の二重の第一級市民、拡張可能（ユーザーのインフラに適応し、フォークを強要しない）、柔軟で硬直的でない（強力なデフォルト + 再利用可能なプリミティブ）、どこでも作業できる（単一マシンからリモート/クラウドへ進化）、高速かつ理解しやすい、信頼と採用が容易（ローカルファースト）。帰納的見解：オーケストレーションは発明に勝る、スレッドこそ作業単位、契約駆動アーキテクチャ、SQLite 真実の源 + ステートレス Server、ローカルファースト + マネージドは段階的な拡張、匿名テレメトリはオフにできる。"
date: "2026-08-11"
author: "TopDigg"
tags: ["bb", "Agent IDE", "AI Agent", "Agent Orchestration", "Claude Code", "Codex", "IDE", "DevTools", "Programmable Workspace", "Threads", "Agentic Development", "Monorepo", "Electron"]
categories: ["Deep Dive"]
keywords: ["bb", "エージェント IDE", "Agent IDE", "Agent オーケストレーション", "Agent Orchestration", "プログラマブル・ワークスペース", "Programmable Workspace", "スレッド", "Threads", "Claude Code", "Codex", "BBSdk", "ステートレス Server", "SQLite", "設計哲学", "get-bb"]
---

# bb 徹底解説：自己構築するエージェント IDE——すべてのプログラミング Agent をオーケストレーションするプログラマブル・ワークスペース

> 核心理念：**bb は『自己構築するエージェント IDE（The agent IDE that builds itself）』**——コーディング Agent のためのプログラマブル・ワークスペースである。新しい Agent を発明するのではなく、**あなたがすでに持っている** Claude Code、Codex、Cursor、Pi、OpenCode、Grok Build、Hermes などのプログラミング Agent をオーケストレーションし、それらが逆に**bb をプログラム的に利用できる**ようにする。4つのサーフェス（デスクトップ App、Web App、CLI、HTTP API）すべてが第一級の地位を持つ。すべての作業は**スレッド（thread）**の中で実行され、リアルタイム追従・随時の方向転換・別の Agent への引き継ぎができる。スレッドはサブスレッドを生成してネイティブな委任も実現する。「自己構築」とは、bb 自身もこの仕組みを使って開発・反復している（dogfooding）ことを意味する。その背後には契約駆動のアーキテクチャがある。ステートレス Server + SQLite 真実の源 + WebSocket イベントプッシュ、Host daemon が各実行マシン上で provider プロセスを実行する。設計哲学の6原則：**ユーザーと Agent がともに第一級の操作主体、拡張可能（あなたのインフラに適応し、フォークを強要しない）、柔軟で硬直的でない（強力なデフォルト + 再利用可能なプリミティブ）、どこでも作業できる（単一マシンからリモート/クラウドへ進化）、高速かつ理解しやすい、信頼と採用が容易（ローカルファースト）。**

---

## 一、プロジェクト解説

### 1.1 それは何か？

本稿で解説するのは **GitHub のオープンソースリポジトリ `get-bb/bb`**——副題は *"The agent IDE that builds itself"*（自己構築するエージェント IDE）。npm では `bb-app` として公開されており（latest / nightly の2チャネル）、MIT ライセンス。執筆時点で約 **1.6k stars、155 forks、4500+ commits** と、活発に開発が進んでいる。コアアーキテクチャは安定しているが、ワークフローとサーフェスはまだ進化中である。

一言で位置づけるなら、**bb はプログラマブルなコーディング Agent ワークスペース**である——好きなプログラミング Agent をすべてシームレスにオーケストレーションし、それらに bb をプログラム的に使わせることができる。単なる「また一つ目の AI エディタ」ではなく、**Agent 向けの OS のようなコントロールプレーン**である。人間は UI で Agent を駆動でき、Agent もインターフェース経由で Agent を駆動できる。

これは「もう一つの Agent を作る」という路線とは正反対である。**bb はあなたのマシンにすでにインストールされ認証済みの provider CLI**（Codex、Claude Code、Cursor など）を再利用し、自らモデルを持たず、Agent を再発明せず、**「オーケストレーター + ワークスペース + リアルタイムコントロールプレーン」**として機能する。`npx bb-app@latest` の1コマンドで起動できる。`bb-app` パッケージをダウンロードし、Server とローカル Host daemon を起動して Web App を配信し、その後ブラウザで `http://localhost:38886` を開けば使用できる。

### 1.2 主要データと情報

- リポジトリ：`https://github.com/get-bb/bb`（MIT ライセンス、約 1.6k stars / 155 forks / 4585 commits）
- リリース：npm パッケージ `bb-app`、安定チャネル `npx bb-app@latest`、デイリービルドチャネル `npx bb-app@nightly`
- 実行要件：Node.js 22.19 / 24 / 26 + Git + 認証済みの Agent provider が少なくとも1つ
- 対応プラットフォーム：macOS（デスクトップ版は Apple Silicon arm64）、Linux。Windows は WSL2 内でのみ実行可（ネイティブの PowerShell/CMD は未対応）
- デフォルトポート：`http://localhost:38886`。データディレクトリ `~/.bb/`（開発インスタンス `~/.bb-dev/<checkout-instance>/`）
- テレメトリ：本番実行では匿名の利用テレメトリを送信（アプリ起動、スレッド作成数、ユーザーメッセージ数）。識別子はランダムなインストール ID で、ユーザー/ホスト/プロジェクト/ワークスペース/メッセージ内容は付帯しない。`BB_TELEMETRY=false` でオフにできる。ソースからの開発実行では決して送信しない
- 状態ストレージ：**SQLite データベースが真実の源（source of truth）**。Server 自身はステートレス
- オーケストレーション対象：Codex、Claude Code、Cursor（ACP 経由）、Pi、OpenCode、Grok Build、Hermes Agent、および任意のカスタム ACP 互換 Agent（`customAcpAgents`）
- 四大サーフェス：デスクトップ App（Electron、macOS arm64）、Web App、CLI（`bb`）、HTTP API。さらに Node SDK（`BBSdk`）
- ネイティブスキル（skills）インデックス：Codex / Claude Code / Pi / Cursor / OpenCode / omp / Grok Build / Hermes の skill ルートディレクトリを自動読み込み、各 provider の `/` コマンドメニューに統合
- ビジネス形態：`getbb.app` がマーケティングサイト + bb connect 認証/ダッシュボード（TanStack Start on Cloudflare Workers）を提供

### 1.3 それは何を解決するのか？

1. **マルチ Agent のオーケストレーション空白**：チームは多くの場合 Codex、Claude Code、Cursor など複数のコーディング Agent を同時に抱え、それぞれが別々に動き、コンテキストが断絶している。bb は統一されたワークスペースとスレッドモデルを提供し、「スレッドを開く、タスクを投げる、進捗を見る、引き継ぐ」を cross-provider な一連の操作にする。

2. **Agent のプログラマビリティ問題**：ほとんどの agent ツールは「人間がコマンドを打つ」ことだけを想定しており、他のプログラムや Agent から呼び出すのが難しい。bb は CLI・SDK・HTTP API をすべて一流のインターフェースにする——**Agent が 1 つのスレッドを開いて別の Agent に仕事をさせられる**、つまり「オーケストレーターのオーケストレーション」が成立する。

3. **ワークフローの可視性と制御性**：Agent が長時間ブラックボックスで動き続けるのは痛点である。bb のスレッドはライフサイクル状態と append-only のイベントストリーム（メッセージ、ツール呼び出し、ファイル変更）を持ち、**リアルタイム追従・随時の方向転換・途中からのバトンタッチ**ができる。サブスレッドを生成して委任もできる（manager / child スレッド）。

4. **環境とマルチマシン問題**：Project はリポジトリにマッピングされ、特定の Host にバインドされる。Environment は managed（bb がライフサイクルを管理し、参照がなくなれば自動クリーンアップ）と unmanaged（既存のディレクトリを指す）に分かれる。Server は複数のリモート Host を登録できる。単一マシンでも動くが、リモートオーケストレーションも閉ざされていない。

---

## 二、核心理念

### 2.1 一言で言う世界観

> **"The agent IDE that builds itself."**（自己構築するエージェント IDE。）
> **"bb is a programmable workspace for coding agents."**（bb はコーディング Agent のためのプログラマブル・ワークスペース。）

これはプロジェクトのモットーであり、従来の IDE や従来の agent ツールとの分水嶺でもある。**IDE の進化の方向は「より賢い補完」ではなく、「人間が Agent の作業をプログラム的に制御できるインターフェース」**である。Agent の価値は単独で戦うことではなく、**オーケストレーションされ、引き継がれ、プログラム的に呼び出されること**にある。

### 2.2 「ユーザーと Agent はともに第一級の操作主体」

**Users and agents are both first-class operators**——bb は人間にも Agent にも使われる。4つのサーフェス（デスクトップ App、Web App、CLI、HTTP API）は同じ一連のコア機能を公開し、CLI は**決して sidecar や後付けのパッチではない**。スクリプトと Agent は `BB_SERVER_URL` / `BB_THREAD_ID` 環境変数によって、自分がどの Server のどのスレッドで動いているかを認識し、さらにスレッドを開き、状態を確認し、出力を取得できる。

### 2.3 スレッドこそ作業単位

各スレッド（thread）は**Agent provider との対話 + ライフサイクル状態 + append-only のイベントストリーム**（メッセージ、ツール呼び出し、ファイル変更など）である。スレッドには2種類ある：

- **standard（標準スレッド）**：直接作業をこなす；
- **manager（管理スレッド）**：他のスレッドを調整し、**子スレッド（child threads）**を持って委任できる。

「リアルタイム追従、随時の方向転換、別の Agent への引き継ぎ」はこのイベントストリーム + 状態モデルの上で実装されている——**作業は投げっぱなしではなく、常に観察・介入・引き渡しが可能**なのだ。

### 2.4 プログラマブル、拡張可能、信頼できる

- **プログラマブル**：CLI、SDK（`BBSdk`）、HTTP API がすべて第一級の地位を持ち、Agent が bb をプログラム的に駆動できる；
- **拡張可能**：カスタム provider、環境、LLM-backed サービス、CLI 統合、UI サーフェスなどの拡張ポイントをサポート。システムがあなたのインフラとワークフローに適応するのであって、フォークを強要されることはない；
- **信頼できる**：ローカルファースト——評価と採用にクラウドは不要。マネージド機能は将来拡張できるが、**コア製品を置き換えるものではない**。テレメトリは匿名でオフにできる。

---

## 三、詳細チュートリアル

### 3.1 クイックスタート（インストールと実行）

**前提条件：**

- Node.js 22.19 / 24 / 26；
- Git；
- 対応する Agent provider が少なくとも1つ：Claude Code、Codex、Cursor（ACP 経由）、Pi、OpenCode、Grok Build、Hermes、またはその他の ACP 互換 Agent。

**ステップ1：起動。** デスクトップ App を推奨（現在は macOS Apple Silicon のみ）。[desktop-latest release](https://github.com/get-bb/bb/releases/tag/desktop-latest) からダウンロードする。Intel Mac と Linux は npx を使う：

```bash
npx bb-app@latest
```

そして開く：`http://localhost:38886`

デイリーの自動ビルド（不安定なことがある）を使う場合：

```bash
npx bb-app@nightly
```

`npx bb-app@latest` は `bb-app` パッケージをダウンロードし、同じプロセスのツリー内で Server とローカル Host daemon を起動し（いずれかの子プロセスが異常終了した場合、ランチャーはその子プロセスのみを再起動する）、Web App を配信する。状態はデフォルトで `~/.bb/` に保存される。ターミナルで `Ctrl+C` すると両プロセスが同時に停止し、ステータスコード 0 で終了する。

他のターミナルやバックグラウンドで実行中の bb を停止する場合：

```bash
npx bb-app stop
```

`stop` はデータディレクトリ内の `bb-app-runtime.json` を読み取り、記録されたプロセスが確かにこのランチャーのものであることを確認してから停止する。デフォルト以外のデータディレクトリを使う場合は `--data-dir` を渡す。

**ステップ2：Provider の資格情報を準備する。** bb は認証済みの provider CLI をそのまま再利用する：

| Provider | 設定 |
|----------|------|
| `codex` | [Codex CLI](https://developers.openai.com/codex/cli) をインストールし `codex login` を実行 |
| `claude-code` | [Claude Code](https://docs.anthropic.com/en/docs/claude-code) をインストールし、ドキュメントに従って認証 |
| `cursor` | Cursor の agent CLI（`cursor-agent`）をインストールして認証 |
| `pi` | bb が Pi ランタイムを内蔵・固定しているため、Pi 実行ファイルのインストールは不要。Pi extensions でモデルとツールを追加できる |
| `opencode` | [opencode](https://opencode.ai/) をインストールして認証 |
| `grok` | [Grok Build](https://docs.x.ai/build/overview) をインストールし、`grok login` か `XAI_API_KEY` の設定 |
| `hermes-agent` | [Hermes Agent](https://hermes-agent.nousresearch.com/docs/getting-started/installation) をインストールし、`hermes model` で資格情報を設定、`hermes acp --check` で検証 |

**ステップ3：作業を始める。** App でプロジェクト（project）を追加/開き、スレッド（thread）を起動し、そのスレッドで使う provider を選択して対話を始める。本番実行では匿名テレメトリを送信するが、`BB_TELEMETRY=false` でオフにできる。

### 3.2 CLI の使い方チュートリアル

CLI は**実行中の bb Server** を対象とする：

```bash
npx --package bb-app bb --help
```

CLI と SDK は同じ `BB_SERVER_URL` と bb の設定解析を共有する。未設定の場合、デフォルトでローカルのパッケージングされた Server `http://127.0.0.1:38886` を指す。

よく使うコマンド：

```bash
# スキルリストの表示（ネイティブ + プラグイン）
bb skill list

# パッケージレベルの非機密設定（~/.bb/config.json）
npx bb-app config set BB_APP_URL https://<machine>.<tailnet>.ts.net
npx bb-app config set BB_INFERENCE codex/gpt-5.6-luna
npx bb-app config set BB_TRANSCRIPTION codex/gpt-transcribe
npx bb-app config list
npx bb-app config refresh

# リモート bb Server のローカルエディタで開くマッピング（~/.bb/client.json）
npx bb-app client ssh-target set https://bb.example.test devbox
npx bb-app client ssh-target list

# Provider の資格情報（~/.bb/env.json、list はすべての値をマスクする）
npx bb-app env set OPENAI_API_KEY <key>
npx bb-app env list
npx bb-app env unset OPENAI_API_KEY
```

`config`/`env` の書き込みは、実行中のローカル bb Server にホットリロードを要求する。bb が実行中でない場合、次回起動時に反映される。

### 3.3 SDK プログラミングチュートリアル（Agent に bb をプログラム的に使わせる）

`bb-app` はさらに Node SDK をエクスポートしており、スクリプトから実行中の bb Server を駆動できる：

```ts
import { BBSdk } from "bb-app";

const bb = new BBSdk();
const thread = await bb.threads.spawn({
  projectId: "proj_personal",
  environment: { type: "host", workspace: { type: "personal" } },
  prompt: "Summarize my active bb work.",
});
await bb.threads.wait({ threadId: String(thread.id), status: "idle" });
console.log(await bb.threads.output({ threadId: String(thread.id) }));
```

手順は3ステップ：**spawn（スレッドを開く）→ wait idle（スレッドがアイドルになるのを待つ）→ output（出力を取得）**——これこそ「Agent が Agent をオーケストレーションする」最小のプリミティブである。`new BBSdk()` は CLI と同じ `BB_SERVER_URL` と設定解析を引き継ぐ。リモート/テスト対象には `new BBSdk({ baseUrl: "http://host:38886" })` を渡せる。**bb によって起動されたスクリプトは自動的に `BB_SERVER_URL` と `BB_THREAD_ID` 環境変数を受け取り**、自分がどの Server のどのスレッドで動いているかを把握できる。

### 3.4 システムアーキテクチャ（ランタイムの分解）

4つのランタイムコンポーネント：

| コンポーネント | 役割 |
|------|------|
| **Server** | 中央ハブ。すべての状態を SQLite に保存し、HTTP API を公開し、WebSocket で変更通知をプッシュ。自身はステートレスで、DB が真実の源。アクティブな daemon の WebSocket 経由で作業を各 Host にルーティングする |
| **Host daemon** | 登録済み（enrolled）の各実行マシンに常駐。Server に接続し、host RPC を処理し、workspace を供給し、agent provider プロセスを実行し、イベントを送り戻す。同機の App/CLI 向けにローカル HTTP API を公開（エディタを開く、フォルダを選ぶ、daemon の状態を確認する） |
| **App** | Web UI：プロジェクトとスレッドの閲覧、進捗の追従、作業の方向転換 |
| **CLI（`bb`）** | ユーザーと Agent 双方のための第一級インターフェース。App と同じ能力を持ち、スクリプト化可能 |

**データモデル：**

- **Project（プロジェクト）**：トップレベルのコンテナで、通常は1つのリポジトリに対応。1つのプロジェクトには1つ以上の **Source**（コードがどこにあるか）がある。ローカルパスの Source は登録済みの Host に属するため、1つのプロジェクトを複数マシンの複数パスにマッピングできる。
- **Thread（スレッド）**：作業単位。Agent provider との対話を追跡し、ライフサイクル状態を持ち、append-only のイベントストリーム（メッセージ、ツール呼び出し、ファイル変更など）を生み出す。standard（直接作業）と manager（他のスレッドを調整）の2種類に分かれ、スレッドは子スレッドを持って委任できる。
- **Environment（環境）**：スレッドの実行コンテキストで、workspace（ディスク上のディレクトリ）を Host にバインドする。**unmanaged**（既存のディレクトリを指す）か **managed**（bb がライフサイクルを管理し、参照する未アーカイブのスレッドがなければ自動クリーンアップ）にできる。複数のスレッドが1つの環境を共有できる。
- **Host（ホスト）**：実行マシン上の常駐 daemon のアイデンティティ。Server には primary host があり、追加のリモート host を登録できる。project sources と environments はどちらも host の境界を保持する。
- **Commands & Events**：Server はアクティブな daemon の WebSocket 経由で host RPC を下す。環境の供給、スレッドの起動/停止などのライフサイクル処理は API 呼び出し側の視点では非同期で、daemon が RPC 結果を返した後に Server がコマンドの副作用を決済する。daemon はさらにイベントのバッチとして provider とスレッドの進捗を送り戻す。

**契約と境界：**

2つの契約パッケージがコンポーネント間の境界を定義する：`@bb/server-contract`（app/CLI ↔ Server の HTTP + WebSocket API：ルートのスキーマ、リクエスト/レスポンス型、WS 通知タイプ）と `@bb/host-daemon-contract`（Server ↔ host daemon のプロトコル：コマンドタイプ、イベントタイプ、セッションのライフサイクル、app/CLI 向けのローカル API）。**実装パッケージは決してこれらの境界をまたいで import しない**——Server は workspace の供給方法を知らず、daemon はスレッド/プロジェクトの詳細を知らない（コマンドで教えられたもの以外は）。

### 3.5 Monorepo 構造（リポジトリマップ）

monorepo（pnpm workspaces + turbo + vitest）には、パッケージ化された App とそれにバンドルされたランタイムサービスが含まれる：

| パッケージ / アプリ | 役割 |
|-----------|------|
| `packages/bb-app` | 公開される npm パッケージ：`npx bb-app@latest` ランチャー、バンドルされた `bb` CLI エントリポイント、公開 SDK のエクスポート |
| `apps/desktop` | macOS 用 Electron シェル：パッケージ化されたランタイムを統括し、bb Web UI を読み込む |
| `apps/app` | Web UI：プロジェクト、スレッド、環境、実行中の作業を表示 |
| `apps/server` | HTTP API、WebSocket 通知、状態管理、Server 独自のプロダクトポリシー |
| `apps/host-daemon` | Host のローカルランタイム：workspace の供給、provider プロセスの実行 |
| `apps/cli` | スクリプト化可能な `bb` CLI（ユーザーと Agent の両用） |
| `apps/web` | getbb.app サイト：マーケティングページ + bb connect 認証/ダッシュボード（TanStack Start on Cloudflare Workers） |
| `packages/sdk` | TypeScript SDK：CLI、パッケージ SDK のエクスポート、プログラム的なクライアント向け |
| `packages/agent-runtime` | provider ランタイムのアダプターとブリッジ：Codex、Claude Code、Pi、ACP agents |
| `packages/config` | 設定解析、デフォルト値、managed パッケージ設定のスキーマ、環境変数の定義 |
| `packages/db` | SQLite スキーマ、マイグレーション、データアクセスヘルパー |
| `packages/server-contract` | クライアント ↔ Server の HTTP/WS 契约定義 |
| `packages/host-daemon-contract` | Server ↔ host daemon のコマンド/イベント契約 |

**ピン留めされた依存関係（package.json だけでは理由が分からず、注目に値する）：**

- `@opentelemetry/api@1.9.1`（apps/server）：Pi AI と Drizzle が両方とも `@opentelemetry/api` を取り込む。正確なバージョンにピン留めしないと、pnpm が2つのコピーを解決し、TypeScript が2つの異なる型のアイデンティティを認識して server の typecheck が失敗する。
- Pi パッケージ（0.84.0）：Pi bridge と `bb-app` 内の Pi extensions はホストマシンの Pi モジュールを import する。バンドルされた bridge がディスク上にこの正確なパッケージツリーを保持するため、extensions は互換性のある1つのランタイムを共有できる。

### 3.6 開発モード（bb 自身をビルドする）

```bash
pnpm dev                # Vite App を起動し、API/WS を独立した dev server にプロキシ。ランチャーが実際のポートを表示
pnpm dev:desktop        # Electron デスクトップシェルで同じソースの dev server を実行
pnpm dev:restart        # まずバックグラウンドで再ビルドし、その後ステートフルなサービスだけを再起動
pnpm dev:restart-server
pnpm dev:restart-host-daemon
pnpm start              # プロダクションモードビルド（app + server + host-daemon）を直接 launcher で実行
pnpm bb --help          # ビルド後の CLI。デフォルト/プロダクションインスタンスを指す
pnpm reset              # プロダクション状態をクリア
pnpm bb:dev --help      # ソースの CLI。この checkout の dev インスタンスを指す
pnpm reset:dev          # この checkout の dev 状態をクリア
pnpm reset:all          # プロダクションと dev の状態をクリア
```

設計のポイント：各 checkout には独立したデータディレクトリ `~/.bb-dev/<checkout-instance>/` と、checkout のパスから導出される決定論的な上位ポートがある。複数の worktree を、パッケージ化された `npx bb-app@latest` インスタンスと並行して実行できる。ホットリロードの挙動は**意図的に分割**されている：App はセルフホットリロード、Server はホットリロードしない、host daemon もホットリロードしない——ステートフルなサービスは明示的な再起動が必要。リモートアクセスには `tailscale serve --bg --https=443 http://127.0.0.1:<app-port>` で loopback リスナーを公開できる。`pnpm storybook`（Ladle）はすべてのインターフェースにバインドするため、信頼できないネットワークでは実行しないこと。

### 3.7 Provider とスキル（skills）の統合

- **ネイティブな skill ルートディレクトリのインデックス**：bb は Codex、Claude Code、Pi、Cursor、OpenCode、omp、Grok Build、Hermes の文書化されたネイティブ skill ルート（user ルート、project ルート、`.agents/skills` などの互換ルート）をインデックスし、これらのスキルは選択した provider の `/` コマンドメニューに表示される。Skills ページと `bb skill list` は Claude Code / Codex / Cursor のネイティブスキルを表示する。
- **Pi のトラストポリシー**：bb は Pi のグローバル `~/.pi/agent` ファイルと各 workspace の `.pi` ファイル（settings、credentials、models、packages、extensions、skills、prompts、themes、context）を読み取る。Pi が保存済み、またはグローバルトラストポリシーがその workspace を承認した場合にのみ、bb はプロジェクトの資源を読み込む。未解決の `ask` の決定は不信任のまま維持される。
- **カスタム ACP Agent**：`~/.bb/config.json` の `customAcpAgents` で設定。任意で `modelCli` / `reasoningCli` または `nativeReasoning` の推論設定を指定。`logo` フィールドは provider セレクタのアイコンを提供。`nativeSkillRoots`（user/project パス）は composer に provider のネイティブスキルを追加する。`sharedSkillRoots` は、1セットの物理的なスキル群を bb と独立した provider CLI の両方で共有できるようにする（bb はそれらを読み取り専用スキルとしてリストし、Codex / Claude / Pi / ACP のスレッドに注入する）。

### 3.8 設定とリモートアクセス

- 永続設定 `~/.bb/config.json`（`bb-app config set/list/refresh`）。資格情報は独立して `~/.bb/env.json` に保存（`bb-app env set/list/unset`、`list` はマスクされる）。
- リモート利用：**bb connect**（getbb.app の認証/ダッシュボード経由）または Tailscale Serve による loopback リスナーの公開。tailnet/LAN 経由で `38886` ポートに直接アクセスするには、明示的かつセキュリティに敏感な互換オプション `--server-bind-host 0.0.0.0` が必要。
- リモート Server のローカルエディタで開くマッピング：`bb-app client ssh-target set https://bb.example.test devbox`。

---

## 四、設計哲学

### 4.1 ユーザーと Agent はともに第一級の操作主体

VISION.md の第一原則。**bb は「人が使うツールがついでに API を開いた」のではなく、初日から「プログラムから呼び出されること」を第一級の要件としてきた**。Web App、CLI、managers、そして将来のサーフェスが同じコア機能を公開し、CLI は sidecar ではない。これは SDK、`BB_SERVER_URL`/`BB_THREAD_ID` の注入、スレッドモデルなど、一連の設計全体を直接決定づけている。

### 4.2 拡張可能、フォークではない

**"The system should adapt to a user's infrastructure and workflows, not force them to fork bb."**（システムはユーザーのインフラとワークフローに適応すべきであり、ユーザーにフォークを強要すべきではない。）カスタム providers、環境、LLM-backed サービス、CLI 統合、UI サーフェス、将来の拡張ポイントはすべて公式にサポートされる形態である。bb は単一の agent エコシステムに賭けるのではなく、「すべての agent の共通平面」になる。

### 4.3 柔軟、しかし硬直的でない

**"strong defaults and built-in flows without forcing users into one blessed way of working."**（強力なデフォルトと組み込みのフローを提供するが、ユーザーに唯一の正しい働き方を強要しない。）managed と unmanaged の両フローが自然に滑らかであるべき。システムは再利用可能なプリミティブ（primitives）で構成され、ハードコードされた特例の寄せ集めではない。スレッド、環境、契約がすべてプリミティブであり、ビジネス形態はそれらを組み合わせて作られる。

### 4.4 どこでも作業できる

単一マシンが今日きちんと動くことは必須だが、リモートオーケストレーション、クラウド実行、ピアバック型（peer-backed）環境、将来のモバイルも閉ざさない。**ローカル loopback 優先 + Tailscale/bb connect での公開 + 明示的な `--server-bind-host`** がこの哲学の実装である：デフォルトは安全（loopback のみバインド）で、リモートは明示的かつ監査可能な選択肢になる。

### 4.5 高速かつ理解しやすい

パフォーマンス、運用の単純さ、低い認知的負荷は製品の一部（part of the product）であり、後付けの最適化ではない。ホットリロードの分割（App はホット、Server/daemon は非ホット）、ステートレス Server + SQLite 真実の源、契約パッケージの分離は、すべて「理解しやすさ」のアーキテクチャ上の投影である——**各コンポーネントは知るべきことだけを知り、過不足がない**。

### 4.6 信頼と採用が容易

**ローカルモードは常に評価と採用が容易**であり、特にセキュリティと信頼に制約のあるチームにとって重要。マネージド機能は bb を拡張できるが、**コア製品を置き換えるものではない**。テレメトリは匿名（ランダムなインストール ID、内容なし）、ワンタッチでオフにできる（`BB_TELEMETRY=false`）、開発ビルドからは決して送信しない——信頼は設計のインプットであって、マーケティングのレトリックではない。

---

## 五、帰納的まとめ：見解と結論

### 5.1 核心となる見解リスト

1. **オーケストレーションは発明に勝る**：N 番目のコーディング agent を再発明するより、既存の Codex/Claude Code/Cursor/Pi などをプログラマブルなワークスペースにオーケストレーションする方がよい——認証済みの資格情報を再利用でき、移行コストを下げられる。
2. **IDE の新しいパラダイム**：IDE は「人がコードを書くためのインターフェース」から「人が Agent の作業をプログラム的に制御できるインターフェース」へ進化する。bb はこのパラダイムの具体化である。
3. **第一級のサーフェス**：デスクトップ/Web/CLI/HTTP API すべてが第一級であり、CLI は二流のインターフェースではない——スクリプト化可能性は Agent 時代の IDE の標準装備であって、ボーナスではない。
4. **スレッドこそ作業単位**：対話 + ライフサイクル状態 + append-only のイベントストリームにより、「リアルタイム追従、随時の方向転換、別の Agent への引き継ぎ」が第一級の能力になる。
5. **ネイティブな委任プリミティブ**：manager スレッド + child スレッドが、Agent 間のタスク委任を一時的な寄せ集めではなく第一級の操作にする。
6. **自己ブートストラップ（dogfooding）**：「builds itself」はスローガンではない——bb は CLI/SDK/スレッドの仕組みを使って bb を開発しており、開発者＝ユーザー、ユーザー＝開発者である。
7. **ステートレス Server + 真実の源 DB**：Server はルーティングとプロトコルのみを行い、SQLite が全状態を担う——状態は集中し、コンポーネントはステートレスで、自然に再起動可能かつ観察可能。
8. **契約駆動の境界**：`@bb/server-contract` と `@bb/host-daemon-contract` により、実装パッケージは互いに越境せず、Provider エコシステムは独立して進化できる。
9. **ローカルファースト、クラウドは段階的拡張**：デフォルトで loopback にバインドし、匿名でオフにできるテレメトリ、managed/unmanaged 環境の併存——まず単一マシンで信頼でき使えるようにしてから、マネージドとクラウドを検討する。
10. **環境ライフサイクルの管理**：managed 環境は自動クリーンアップされ、複数スレッドで環境を共有し、Project は Host をまたぐ——実行環境は手作業の雑務ではなく、オーケストレーション可能なリソースになる。

### 5.2 重要な金言（メモしておく価値のあるもの）

- "The agent IDE that builds itself."（自己構築するエージェント IDE。）
- "bb is a programmable workspace for coding agents."（bb はコーディング Agent のためのプログラマブル・ワークスペース。）
- "Every surface — the desktop app, web app, CLI, and HTTP API — is a first-class way to drive bb."（すべてのサーフェス——デスクトップ App、Web App、CLI、HTTP API——は bb を駆動する第一級の方法である。）
- "Work runs in threads you can follow live, steer at any point, or hand off to another agent."（作業はスレッドの中で実行され、ライブで追従し、任意の時点で方向転換し、別のエージェントに引き継ぐことができる。）
- "Users and agents are both first-class operators."（ユーザーと Agent はともに第一級の操作主体である。）
- "The system should adapt to a user's infrastructure and workflows, not force them to fork bb."（システムはユーザーのインフラとワークフローに適応すべきであり、ユーザーにフォークを強要すべきではない。）
- "Flexible, not rigid."（柔軟であり、硬直的ではない。）

### 5.3 当サイトの他の深掘り解析とのつながり（読者の次のステップ）

- **Herdr / Harbor Framework / Codex Orchestration（Agent オーケストレーション系ツール）**：これらのプロジェクトは「複数の Agent をどう協調させるか」を解決する。bb はさらに一歩進み、オーケストレーションを**完全な IDE ワークスペース + スレッドモデル + プログラマブルなインターフェース**に昇華し、オーケストレーター自身がオーケストレーションされる（ネストしたオーケストレーション）こともサポートする。
- **Loop Engineering シリーズ（ループエンジニアリング）**：ループ/グラフは Agent の実行形態である。bb はそれらの形態を載せるための**ランタイムと作業サーフェス**を提供する——スレッドは観察・注入・引き継ぎが可能なコンテナである。
- **base 系の agent IDE ツール**：単一 provider への深い依存と比べ、bb は provider 中立（7+ の provider + カスタム ACP）+ 全サーフェス第一級を売りにしており、「ブランドよりもプロトコル」の路線の代表格である。

---

## 参考資料

- プロジェクトホーム：`https://github.com/get-bb/bb`（MIT、get-bb 組織）
- README：`README.md`——位置づけ、四大サーフェス、デスクトップ版のダウンロード、npx 起動、テレメトリ、開発ループ、トラブルシューティング
- Vision：`docs/VISION.md`——目標と6つの設計原則（本稿第4章の根拠）
- System Overview：`docs/system-overview.md`——ランタイムコンポーネント、データモデル、契約と境界（本稿 3.4 の根拠）
- Repository Overview：`docs/repository-overview.md`——monorepo 13パッケージのマップとピン留め依存の説明（本稿 3.5 の根拠）
- パッケージ文書：`packages/bb-app/README.md`——クイックスタート、CLI、SDK スクリプト、provider 資格情報表、設定コマンド（本稿第3章の根拠）
- その他の文書：`docs/configuration.md`、`docs/platform-support.md`、`docs/multiple-devices.md`、`docs/worktrees.md`
- 関連読み物（当サイト）：Herdr / Harbor Framework / Codex Orchestration の深掘り解析、Loop Engineering シリーズの深掘り解析