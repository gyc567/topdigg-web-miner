---
title: "Agents in Orbs 徹底解説：エージェントがあなたがコンピュータの前にいない間も自分でコードを書く時代——Amp のリモート Orb ハンズオン、設計思想、5 つの核心インサイト"
description: "Amp 公式 2026-06-30 発表「Agents in Orbs」、2026-02-19 エディトリアル「The Coding Agent Is Dead」、Orbs ユーザーマニュアル、そして 2026-08-07「Size the Orbs of Production」価格表を基に、Amp「Orb」形態の製品像・技術詳細・設計思想を徹底解説する。記事で扱う内容：① Orb とは何か——Amp エージェントを動かす Debian 12 リモートマシン、分単位課金、5 分アイドルで自動停止；② 完全ハンズオン——Web/CLI `amp -ox`/TUI コマンドパレット/プラグイン `agent.createThread()` の 4 つの入口、`amp sync <thread>` 双方向同期、`--orb-size` によるスレッド単位サイジング、`.agents/setup` と `.agents/resume` のリポジトリライフサイクルフック、OIDC フェデレーション、Webhook と Portal；③ a1 5 段階価格表（a1.tiny/small/medium/large/xxlarge、$0.08/$0.17/$0.33/$0.66/$1.32 /時間）；④ 設計思想——「エージェントをエディタサイドバーから解き放つ」「能力は権限ではない」「結果単位で課金」「オンデマンドで起動し終われば眠る」「fan-out をローカルリソースの制約から解放する」；⑤ 5 つの核心インサイト——閾値の消失が並列潜能を解放する、無人運転が新しいデフォルトになる、エージェントとエディタが分離する、自己駆動のデリバリーが加速する、課金が席から分へ移行する。核心的主張：モデルが強ければ強いほど、単一マシンに閉じ込めてはならない。Orbs は Amp がエージェント時代に提示する工学的回答である。"
date: "2026-08-10"
author: "TopDigg Research Team"
tags: ["Amp", "Agents in Orbs", "Coding Agent", "AI Agent", "Remote Agent", "Orb", "amp CLI", "amp -ox", "amp sync", "CLI Agent", "Debian 12", "OIDC", "Webhook", "Plugin", "TUI", "SaaS", "Ampcode", "DevOps"]
categories: ["Deep Dive"]
keywords: ["Agents in Orbs", "Amp Orb", "リモートエージェント", "無人運転エージェント", "amp -ox", "amp sync", "Orb サイズ", "a1.tiny", "a1.small", "a1.medium", "a1.large", "a1.xxlarge", "分単位課金", "Amp CLI", "ampcode", "エージェントパラダイム", "設計思想", "Coding Agent Is Dead", "OIDC フェデレーション", "amp webhooks", "Orbs Manual"]
---

# Agents in Orbs 徹底解説：エージェントがあなたがコンピュータの前にいない間も自分でコードを書く時代——Amp のリモート Orb ハンズオン、設計思想、5 つの核心インサイト

> 核心となるアイデア：**Agents in Orbs は Amp が「エージェントはエディタサイドバーに閉じ込めておくべきではない」というスローガンに対して出した工学的回答である——Amp エージェントを動かすリモートマシン（Debian 12）、分単位課金、5 分アイドルで自動停止、Web/CLI/TUI/プラグインの 4 つの入口からオンデマンドで起動、`amp sync` でラップトップと双方向に同期し、fan-out の並列スケジューリングを「このラップトップ」から「オンデマンドのクラウド VM 群」へと解放する。** 2026-06-30 に発表されたこの製品形態は Amp の新機能追加ではない。Amp が 2026-02 エディトリアル「The Coding Agent Is Dead」で掲げた「モデルはあなたがエディタの前に座っていない時もコードを書きたいし走らせたい」という判断を、クリック可能・課金可能・停止可能・観測可能な製品形態として具体化したものだ。その設計思想は 5 文に圧縮できる——**エージェントをエディタサイドバーから解き放つ；能力は権限ではない；結果で課金し席では課金しない；オンデマンドで起動し終われば眠る；fan-out をローカルリソースの制約から解放する。**

---

## 一、プロジェクト概要

### 1.1 これは何か？

本記事が分析するのは Amp チームが 2026-06-30 に発表した[「Agents in Orbs」](https://ampcode.com/news/agents-in-orbs)——Amp エージェントをエディタの外、ローカルラップトップの外へ出し、オンデマンドなリモートマシンの中へ移すという製品形態だ。

これは「Amp に新しい機能を追加した」のではなく、Amp が 2026-02-19 エディトリアル[「The Coding Agent Is Dead」](https://ampcode.com/news/the-coding-agent-is-dead)で立てた約束の具現化である：

> "These models no longer need the hand-holding and really want to kick off their training wheels. They want to write code and run even when you're not sitting in front of your editor. It's time to see what they can do without supervision."

——このスローガンを製品形態に変えたのが Agents in Orbs である。

### 1.2 一行で形態を表現すると

**Orb は Amp エージェントを動かすリモートマシン**である。Debian 12 システムに `gh`、`amp`、git、SSH、tmux、Bun、Node.js、Python、ripgrep などのツールをプリインストール済み。Amp スレッド起動時にプロジェクトリポジトリを clone し、設定済みの secrets と環境変数をロードし、エージェントを 24×7 無人運転で走らせる。分単位課金で、5 分アイドルで自動停止し、スレッドをアーカイブすれば即座に停止する。

「あなたのラップトップで動くエージェント」と区別する 4 つの特性：

1. **あなたのマシン上で動かない**：エージェントはクラウドの Debian 12 サンドボックスで動作し、あなたのラップトップから完全分離。CPU/メモリを一切消費しない。
2. **ローカルと完全に同じインターフェース**：Web UI、CLI、TUI、プラグインどれでもリモート制御可能。diff レビュー、ファイル閲覧、tmux 共有ターミナルが使える。
3. **オンデマンドで起動し終われば眠る**：最終アクティビティから 5 分後に自動停止。スレッドアーカイブで即停止。分単位で課金し、停止中は課金されない。
4. **任意の fan-out**：1 台のラップトップで 8 個のエージェントを並列に走らせることはできないが、クラウドの Orb 艦隊なら可能。これが Amp が読者に意識させたい「閾値消失がもたらすパラダイムシフト」だ。

### 1.3 主要事実

- **発表日**：2026-06-30（Agents in Orbs 発表）；同じ源流のエディトリアルは 2026-02-19（The Coding Agent Is Dead）；Orbs ユーザーマニュアルは [ampcode.com/manual/orbs](https://ampcode.com/manual/orbs)。
- **ベース OS**：Orb は Debian 12 を実行。`gh`（認証済）、`amp`（認証済）、git、SSH、tmux、ffmpeg、ImageMagick、vim、jq、fzf、unzip、zstd、lsof、websocat、ripgrep、Bun、Node.js、npm、pnpm、Yarn、Python、pip、agent-browser などをプリインストール。
- **課金単位**：分単位（billed by the minute）；停止中は課金されない。
- **自動停止**：5 分アイドルで自動停止（従来 15 分、2026-08-07 に 5 分に短縮）；スレッドアーカイブで即停止；手動停止不要。
- **起動最適化**：同じプロジェクトの他のメンバーが直近で Orb を起動していた場合、新規 Orb の起動が顕著に高速化。
- **価格ティア**（[2026-08-07 Size the Orbs of Production](https://ampcode.com/news/size-the-orbs-of-production)）：
  - `a1.tiny`：1 CPU · 2 GB メモリ · **$0.08/時間**
  - `a1.small`：2 CPU · 4 GB メモリ · **$0.17/時間**
  - `a1.medium`：4 CPU · 8 GB メモリ · **$0.33/時間**（2026-08-07 追加、舊 `a0.medium` より 50% 安い）
  - `a1.large`：8 CPU · 16 GB メモリ · **$0.66/時間**
  - `a1.xxlarge`：16 CPU · 32 GB メモリ · **$1.32/時間**
  - Enterprise workspace は +50%；Megawatt 購読者の個人プロジェクトは `a1.small` がデフォルト。
- **ストレージ**：2026-07-03「More Orb Sizes」でストレージを 20 GB から 40 GB に倍増、値上げなし（[ampcode.com/news/more-orb-sizes](https://ampcode.com/news/more-orb-sizes)）。
- **エントリーポイント**：Web（[ampcode.com](https://ampcode.com/)）→ Create New Thread；CLI `amp -ox`；TUI コマンドパレット `thread: new in orb`；プラグイン `agent.createThread()`。
- **同期コマンド**：`amp sync <thread>` で Orb の変更をローカルチェックアウトへ反映、エージェントはクラウド側で作業を続ける。
- **ライフサイクルフック**：リポジトリ内 `.agents/setup`（準備段階）、`.agents/resume`（再開段階、最大 10 秒ブロック）；サービス宣言 `.amp/services.yaml`；portal 記述 `.amp/portals/*.json`。
- **セキュリティ/連携**：短時間 OIDC トークンを発行し Google Cloud / Tailscale / AWS と連携可能；プラグインは webhook を登録でき（外部イベントで paused Orb を起こす）、ハンドラタイムアウト 30 秒、少なくとも 1 回配信、10/分のレートリミット、エンドポイントあたり最大 100 イベントキュー；あらゆる Git ホストをサポート（他ホストのプライベートリポジトリは `GIT_CONFIG_*` 環境変数で認証情報を注入）。
- **Git 署名**：個人設定で「Sign Git commits in orbs」を有効化、プロジェクトは Thread Creator を Orb Commit Author に設定する必要あり。

### 1.4 解決する問題

「Agents in Orbs」が解決するのは「エージェントをどう走らせるか」ではなく「あなたがコンピュータの前にいない時にエージェントにどうやって仕事を終わらせるか」だ。ローカルエージェントの 3 つの限界が Orb によって一掃される：

1. **ローカルリソース競合**：8 個並列エージェントをローカルで走らせると、ファンは唸り、バッテリーは切れ、IDE は固まる。Amp は発表内でこれを直接指摘している——"launch a group of agents to investigate eight different bugs independently when there are no local resource clashes to worry about"。Orb はこの競合をラップトップからクラウドに移した。
2. **時間帯の制約**：ローカルエージェントはあなたの労働時間に縛られる——離席すれば止まる。タイムゾーンシフト、多地域協業、深夜ビルドは、すべて「あなたがそこにいない」ことに阻まれる。Orb は 24×7 走り、分単位で課金され、あなたが離れていても浪費しない（5 分アイドルで眠る）。
3. **エージェントをツールではなくチケットとして扱う**：Amp チームはこの点を発表内で繰り返し強調する——"Why not turn a bug report into an agent and an investigation instead of a ticket? Why not manage the agent and its results instead of the ticket?"。Orb により、エージェントはチケットから離脱して持続的な運用状態に入れる——webhook、portal、OIDC 連携されたエージェントは今後ずっと「生きている」。

---

## 二、詳細チュートリアル：ゼロから最初の Orb エージェントを起動する

このセクションは「準備 → 起動 → 制御 → 同期 → 応用」の 5 ステップで進める。コピー可能なコマンド、最小実行例、注意点を含む。出典：[ampcode.com/manual/orbs](https://ampcode.com/manual/orbs)。

### 2.1 ステップ 1：エントリーポイントを選び Orb スレッドを起動する

Orb は 4 つのエントリーポイントをサポートし、ワークフローに合ったものを選べる。

**エントリ A：Web コンソール**

[ampcode.com](https://ampcode.com/)を開き、**Create New Thread** をクリックし、Project を選び、prompt を入力して送信。Amp は自動で新しい Orb を spawn し、リポジトリを clone し、`.agents/setup` を実行し、エージェントを起動する。

**エントリ B：CLI（最も標準的な形態）**

```bash
# プロジェクトディレクトリで：
amp -ox "Investigate why the latest CI run on 'main' failed"
```

発表内で Amp が繰り返しデモする形態——元々 `amp -x` でローカルエージェントを起動するのとほぼ同じで、`-x` を `-ox`（orb execute）に置き換えるだけ。プロジェクトのデフォルト Orb サイズを使用。サイズを指定する場合：

```bash
amp -ox "your prompt" --orb-size a1.small
```

**エントリ C：Amp TUI コマンドパレット**

TUI 内でコマンドパレットを開き、`thread: new in orb` を検索して Enter。プロジェクトを選び、prompt を入力して Enter。利点：普段の terminal ワークフロー内に留まれる。

**エントリ D：プラグイン**

```ts
await amp.createThread({
  prompt: 'Investigate flaky tests',
  orb: true,
})
```

ユースケース：CI 失敗が自動で Orb エージェントを起こして調査；webhook ハンドラ内でエージェントを起動；バッチスクリプトで fan-out。

### 2.2 ステップ 2：変更をレビューしファイルを閲覧する（同期不要）

Orb スレッドには 2 つの主要パネルがある：

1. **Review パネル**：エージェントが変更した diff を表示。ファイルごとにチェック。却下も承認も可。最初にローカルへミラーする必要はない。
2. **File Browser パネル**：Orb 上のリポジトリ全体を直接閲覧——エージェントが変更したファイル、変更していないファイル、一時ファイル、ビルド成果物も含む。

つまり、PR レビューのワークフローを「最初にローカルへ git clone する」ステップから完全に切り離せる——Orb 上でレビューしつつ、エージェントは Orb 内で次のサイクルを走らせ続ける。

### 2.3 ステップ 3：ターミナルで協働する（共有 tmux）

Orb スレッドの Terminal パネルを開くと、**エージェントと共有する tmux セッション**に入る：

- ファイルシステムは同一（Orb の作業コピー）。ターミナルで編集したファイルは即座にエージェントからも見える。
- 依存関係インストール、テスト実行、プロセス確認、スクリプト作成、ローカル設定変更——ローカル開発と一切区別がつかない。
- エージェントもあなたのターミナル出力を参照できる——「Orb 内でターミナルを開き、ビルドを走らせ、エージェントと log を一緒に見る」という協働形態が自然に成立する。

Orb 形態で最も過小評価されている設計：**エージェントと人間が別マシン別シェルで個別に作業することを強制しない——共有シェルセッションを協働面として提供する**。

### 2.4 ステップ 4：変更をローカルへ取り込む（`amp sync`）

ローカルで作業を続けたい時：

```bash
amp sync <thread>
```

`<thread>` は thread URL でも thread ID でも可。`amp sync` は Orb 作業コピーのすべての変更をあなたのローカルチェックアウトへ**ミラーし**、エージェントはクラウド側で作業を続ける。データフローは双方向だが、注意点あり：

- 同じファイルをローカルと Orb の両方で同時に編集しないこと——後勝ち。
- ローカルの変更を Orb に push したい？Terminal パネル内で直接編集、commit、push で OK（tmux セッションがファイルシステムを共有）。

### 2.5 ステップ 5：応用

#### 2.5.1 リポジトリライフサイクルフック

リポジトリルートに 2 つのシェルスクリプトを作成。Amp は以下のタイミングで自動実行する：

| ファイル | タイミング | ブロック戦略 | ログ |
|---|---|---|---|
| `.agents/setup` | Orb 状態準備時、repo root から実行 | 同期的にブロック | `/home/user/.cache/amp/logs/setup.log` |
| `.agents/resume` | 既存 Orb 再開後、エージェントが作業を続ける前 | 最大 10 秒ブロック；タイムアウト後続行 | `/home/user/.cache/amp/logs/resume.log` |

最小の `.agents/setup`：

```bash
#!/usr/bin/env bash
set -euo pipefail

corepack enable
pnpm install --frozen-lockfile
[ -f .env.local ] || cp -- .env.example .env.local
```

最小の `.agents/resume`（**高速冪等な修復処理のみ**——依存関係インストールはここに書かない）：

```bash
#!/usr/bin/env bash
set -euo pipefail

# Fast, idempotent repair work only. Do not install dependencies here.
mkdir -p .amp
date > .amp/resume-last-ran.txt
```

両方とも `chmod +x` し、commit が必要。

> **重要なルール**：`.agents/resume` は軽量に保つ——設計意図は「10 秒以内に完了し、エージェントをブロックしない」こと。「再起動後にフルマイグレーションを再実行」したい場合は `.agents/setup` に置き、`.agents/resume` には「どこまで進んだか、続行可能か」のチェックだけを残す。

#### 2.5.2 長時間稼働サービスと Portal

リポジトリでサービスを宣言し、Orb 起動時に立ち上げて portal URL を公開させる：

`.amp/services.yaml`：

```yaml
services:
  dev:
    command: pnpm dev
    ports: [5173]
```

`.amp/portals/dev.json`：

```json
{
  "title": "Dev Server",
  "links": [
    { "url": "http://localhost:5173", "note": "Local dev server" }
  ]
}
```

portal が起動すると、Amp は thread UI にタブリンクを表示し、ブラウザで直接 dev server を開けるようにする——ローカル実行も SSH トンネルも不要。

#### 2.5.3 OIDC フェデレーション（短時間トークンで長寿命認証情報を置換）

Google Cloud / AWS / Tailscale の service account key を直接プロジェクト secrets に入れない——代わりに OIDC を使う：

```bash
amp orb id-token --audience my-service
```

トークンには workspace / project / user / thread 識別情報が含まれ、相手側サービスがこの識別情報で連携する。Google Cloud、Tailscale、AWS の完全なレシピは [OIDC from Orbs](https://ampcode.com/manual/orbs/oidc) に。

#### 2.5.4 Webhook：外部イベントで paused Orb を起こす

プラグインで webhook を登録し、外部サービス（例：GitHub）が paused Orb を起こせるようにする：

```ts
const { url } = await amp.createWebhook({
  key: 'github-events',
  headers: ['x-hub-signature-256'],
  handler: async (event, ctx) => {
    await verifyAndApply(
      event.id,
      event.body,
      event.headers['x-hub-signature-256'],
      ctx.signal,
    )
  },
})
```

要点：

- **HTTP 202 = キュー追加成功、処理完了ではない**。
- **少なくとも 1 回配信**——`event.id` を冪等キーとして使用。
- ハンドラタイムアウト 30 秒；タイムアウト前に `ctx.signal` をキャンセル可能なネットワーク呼び出しへ渡す。
- レートリミット：バースト 10、10/分補充、超過時 429。
- リクエストボディ上限 1 MB。
- **webhook URL はパスワード扱い**——commit しない、thread メッセージに貼らない。
- **Amp は署名を検証しない**——すべての署名検証はハンドラ内で行う。

#### 2.5.5 プライベートリポジトリ / 自前ホスト Git

- **GitHub プライベートリポジトリ**：[GitHub connection](https://ampcode.com/settings/integrations) 経由、追加設定不要。
- **他の Git ホスト（GitLab / Bitbucket / 自前ホスト）**：secrets から認証情報を注入。Git は `GIT_CONFIG_*` 環境変数を読むので、URL 書き換えで認証完了：

```
GIT_CONFIG_COUNT=1
GIT_CONFIG_KEY_0=url.https://USERNAME:TOKEN@gitlab.com/.insteadOf
GIT_CONFIG_VALUE_0=https://gitlab.com/
```

TOKEN を含む行は secret として保存、commit しない。

#### 2.5.6 署名付き Git コミット

Orb で署名付きコミットが必要？2 ステップ：

1. 個人設定で「[Sign Git commits in orbs](https://ampcode.com/settings/keys#signing-keys)」を有効化。
2. プロジェクトの Orb Commit Author を Thread Creator に設定。

さもないと Orb 内 commit は Orb 自身の一時的な ID で署名され、ローカル git が "unknown signer" で拒否する。

#### 2.5.7 Orb サイズの実務的選び方

発表内では明言されていないが、[Size the Orbs of Production](https://ampcode.com/news/size-the-orbs-of-production) と典型的なワークロードを組み合わせると：

| シナリオ | 推奨サイズ | 理由 |
|---|---|---|
| 単純なスキャフォールド / 単一ファイル編集 | `a1.tiny` | 1 CPU で十分、最安 |
| 通常のプロジェクト fan-out（デフォルト） | `a1.small` | Megawatt デフォルト；4 GB でほとんどの Node/Python プロジェクトを動かせる |
| テストスイート実行 + フロントエンドコンパイル | `a1.medium` | 4 CPU でテスト並列化、8 GB を webpack/vite に割り当て |
| 重い ML / Rust コンパイル | `a1.large` | 16 GB で OOM 回避 |
| 大規模 monorepo のフル CI / 複雑なビルド | `a1.xxlarge` | 32 GB で monorepo 圧を吸収 |

応用的な使い方：

```bash
# エージェント自身にサイズを選ばせる（prompt で明示）
amp -ox "Run full E2E suite. Use a1.large if available — tests are memory-heavy."

# スレッド単位でサイズを明示
amp -ox "Quick lint check" --orb-size a1.tiny
```

Amp はまた、エージェント自身が「より小さい/大きい Orb を使う」よう依頼することもサポート——メインエージェントに「use a smaller orb for this」と伝えると、sub-agent は必要に応じてサイズを下げる。

### 2.6 ステップ 6：アーカイブと廃止

- Orb を止めたい？**スレッドをアーカイブ**——Orb は即座に停止。
- 再開したい？スレッド一覧で Resume をクリック；`.agents/resume` が走り（最大 10 秒）、エージェントが作業を続ける。
- 完全に削除したい？スレッドを削除；紐づいた webhook URL は 404 を返す。

### 2.7 5 分アイドル自動停止メカニズム

Orb は 5 分の非活動で自動停止する（2026-07-27 に全員向け 20% 値下げを行った同じ週に、2026-08-07 にアイドルタイムアウトを 15 分から 5 分に短縮）。**停止 = 課金なし**。再開はほぼ即時。特に同じプロジェクトの他のメンバーが直近 Orb を起動していた場合、ウォームスタートでさらに高速化される。

---

## 三、観点の要約：Amp 発表の核心判断を 5 つの結論に翻訳する

### 3.1 観点 1：エージェントをエディタサイドバーから解き放つことは 2026 年最もやる価値のある一手である

2026-02-19「The Coding Agent Is Dead」はすでに明確だった——"the agent is no longer the limiting factor"；"These new models barely need to be told how to act like coding agents anymore"。制限は「エージェント能力」から「あなたが手放して走らせる意志があるか」へ移った。Orbs はこの「手放し」を製品にした：あなたのエージェントは「あなたがエディタの前にいない」から止まらなくなる。

**結論**：もしあなたがまだ IDE サイドバーのエージェントで本格的な仕事をしていれば、少なくとも 1 つのワークフローを直ちに Orb へ移行すべきだ——速くなるからではなく、**あなたが不在の間もエージェントが仕事を進められる**からだ。

### 3.2 観点 2：能力は権限ではない——だが、能力が大きければ大きいほど、課金単位は「席」から「結果」へ移す必要がある

発表と「Coding Agent Is Dead」はともにこの点を繰り返す：モデル能力が足場を超えたら、足場を大きくする（より多くのエージェント）ことが効く。だがエージェント数を増やすボトルネックは AI ではなく、**いくつの並列エージェントに対していくら払う意思があるか**だ。Orbs の分単位課金（5 分アイドル = 無料停止）は Amp の答え：「エージェントにいくら払うか」を「いくつのサブスクリプションを買ったか」から「いくつのエージェントを何分走らせたか」へ。 前者は席、後者は結果。

**結論**：今後数年、分単位課金はエージェントプラットフォームの標準となる——fan-out を「まず ROI を計算してから起動する」贅沢品ではなく「まず起動、請求書を見て続けるか決める」随意行為にできるのは分単位課金だけだからだ。

### 3.3 観点 3：fan-out をローカルリソースの制約から解放し、8 並列エージェントをデモから日常へ

発表の中で最も直截的な段落：

> "Why not launch a group of agents to investigate eight different bugs independently when there are no local resource clashes to worry about? Why not turn a bug report into an agent and an investigation instead of a ticket? Why not manage the agent and its results instead of the ticket?"

「なぜ bug report を直接エージェントにしない？」——これはローカルでは不可能だった（CPU/メモリ競合、IDE フリーズ、バッテリー不安）。Orbs はこれを「たまにやるデモ」から「毎日できる日常」へ変える。

**結論**：「8 並列エージェントで 8 つの独立バグを調査する」が日常になった時、ticket-first のワークフローは agent-first へ置換される。あなたが管理する対象は「人間が書いたチケット」から「エージェントが生み出した結果」へ変わる。

### 3.4 観点 4：無人運転が新しいデフォルトになる——エージェントはもはやあなたの「監視」を必要としない

発表原文：

> "Never mind the editor, now we can let our agents run even when we're not sitting at our computer."

「Coding Agent Is Dead」と並べて読む：Amp は 2026-02 に「エディタ内のエージェント」を殺した（VS Code / Cursor 拡張の自爆）、2026-06 にエージェントを Orb へ入れた——この 2 ステップで「エージェントはエディタがなければ仕事ができない」という前提を完全に削除した。

**結論**：エージェントをチケットのようにアーカイブ/起動する（webhook、OIDC、portal）ことは、2026 年下半期にすべてのエージェントプラットフォームが模倣する形態だ。あなたの運用メンタルモデルは「8 個の IDE タブで 8 エージェントを監視」から「8 エージェントの成果物が入った inbox、夕食/起床後に確認」へ切り替わる。

### 3.5 観点 5：課金はサブスクリプションから分へ、月単位から利用単位へ——これは SaaS の次の革命

「月額サブスクリプション + 分単位 Orb 課金」というハイブリッド形態は意図的：LLM 利用は依然サブスクリプション（トークン単位で課金）だが、Orb（計算資源）は分単位。Megawatt は「ほぼすべての人の 1 か月分の Orb 利用」をカバーするが、利用量がそのラインを超えた時、分単位課金により**上限到達によるスロットルにはならない**——オンデマンドでスケールする。

**結論**：エージェントプラットフォームの価格は今後も「使った分だけ払う」方向へ傾くだろう——ただし、サブスクリプションを完全に置き換えることはない。形は「サブスクリプションで底を支え + 利用量で天井を広げる」の二層構造。Amp Orbs はこのトレンドの初期テンプレートだ。

### 3.6 5 つの観点の関連構造

```
観点 1：エージェントをエディタから解き放つ
       ↓（実装パス）
観点 4：無人運転が新しいデフォルト
       ↓（経済基盤）
観点 2 & 5：課金は席から分へ、サブスクリプションから結果へ
       ↓（解放された応用形態）
観点 3：fan-out がローカルリソースの制約から解放される
```

観点 1 は哲学的前提、観点 4 は製品形態、観点 2/5 は経済インフラ、観点 3 は解放された新応用。この順序で発表とエディトリアルを読むと、Amp チームの完全なナラティブが見える。

---

## 四、設計思想：Amp 発表とエディトリアルをデザインマニフェストとして読む

### 4.1 思想 1：「エディタ内のアシスタント」から「クラウド内の独立マシン」へ——エージェントの存在場所を再定義する

A：「Coding Agent Is Dead」は言う：

> "They're now much more than mere assistants. They no longer need the hand-holding and really want to kick off their training wheels."

B：「Agents in Orbs」は言う：

> "Orbs are machines where agents can run without supervision."

A はエージェントを「アシスタント」から「独立した存在」に引き上げる。B は「独立」を Orb（独立マシン）として具象化する。この思想の本質は：**エージェントはもはやあなたのツールチェーンに寄生しない——独自の OS と独自のファイルシステムと独自の停止/起動リズムを持つ**。

具象：

- Orb は独自の Debian 12 を実行し、独自のファイルシステムとプロセス空間を持つ。
- エージェントは独自の tmux セッションで作業する。あなたはそのセッションに「招待された訪問者」であって、そのマシンの「所有者」ではない。
- Webhook / OIDC により外部サービスは Orb を**長寿命なアイデンティティ**として呼び出せる——「ちょっとエージェントを走らせる」という一回限りの動作ではない。

### 4.2 思想 2：能力は権限ではない——モデルが強ければ強いほど、権限境界はより小さく描くべき

Orb 形態で見落とされがちな詳細：**エージェントは root ではない**。Orb 内で `apt install` もビルドもファイル編集もできるが、OIDC トークンは依然としてリモートサービスの明示的承認を必要とし、webhook URL は依然としてプラグインの署名検証を必要とし、機微な操作は依然としてあなたが確認した secrets を通る。

これは FDE Guide の 12 因子（当サイトの「FDE Guide 徹底解説」参照）と同じ系列の思考：**トークンは入力、自律性は設計選択、受け入れられた結果が製品**——能力は能力、権限は権限、両者は別々に設計しなければならない。

具象：

- **走れる ≠ 本番環境を変更できる**：OIDC 連携が長寿命なサービスアカウントキーを置換する。
- **ファイル編集できる ≠ メインブランチへ push できる**：diff をレビューし必要に応じて accept；エージェントは既定でレビューを迂回しない。
- **webhook を起こせる ≠ イベントを偽装できる**：Amp は署名を検証しない；ハンドラ内で検証が必要。

**この思想は「無人運転」成立の必要条件である**——あなたがエージェントを手放せるのは、権限境界が明確に描かれているからだ。

### 4.3 思想 3：結果単位で課金し席単位では課金しない——エージェントをサブスクリプション製品から計量可能なサービスへ

Orb の課金単位は分、停止は無料、アーカイブで即停止。この課金形態の裏にある Amp の判断：**エージェントは月額で購読する製品ではなく、利用量に応じて払うサービスである**。

なぜこれが重要か？「使った分だけ払う」でなければ、あなたは次のことをやろうとは思わない：

- エージェントを長時間走らせる（一晩ビルド、一晩テスト）——本当に走っている間だけ課金されるから。
- エージェントを並列 fan-out する（8 エージェントで 8 バグ調査）——実際に走っている 8 つだけ課金されるから。
- エージェントをチケットとして使う（bug report → エージェント）——アーカイブで停止し、「このチケットを生かしておく」サブスクコストが発生しないから。

**この思想は Amp のビジネスモデル全体を「Amp を購読する開発者数」から「Amp 上でエージェントを何分走らせたか」へ移す**。

### 4.4 思想 4：オンデマンドで起動し終われば眠る——「弾力性」をクラウドの概念からエージェント体験へ移植する

クラウドコンピューティングは 20 年かけて全員に「必要に応じて割り当て、終わったら開放する」を教え込んだ。Amp は同じ弾力性をエージェントに移植した：

- 5 分アイドルで自動停止（2026-08-07 に 15 分から 5 分に短縮）。
- 停止は無料。
- webhook による起動はほぼ即時（特に同じプロジェクトの他メンバーが直近 Orb を起動していた場合、ウォームスタートでさらに高速化）。

この思想の本質：**エージェントプラットフォームは「冷/熱」の 2 状態を持つべきで、「オン/オフ」だけを持つべきではない**。冷は無料ですぐ起こせ、熱は全力で動く。これが Orb が示す形態の参考だ。

### 4.5 思想 5：fan-out をローカルリソースの制約から解放する——「並列」を単一マシン能力からプラットフォーム能力へ

発表で最も直截的な段落：

> "Why not launch a group of agents to investigate eight different bugs independently when there are no local resource clashes to worry about? Why not turn a bug report into an agent and an investigation instead of a ticket?"

この思想は「並列」を「このマシンに何コアあるか」から「プラットフォームがあなたのためにいくつ Orb を spawn するか」へ移す——後者はクラウド上ほぼ無限だ。

具象：

- Megawatt は「ほぼすべての人の 1 か月分の Orb 利用」をカバー——より多く使うことを推奨。
- スレッド単位のサイズ選択（`--orb-size` またはエージェント自身に任せる）——簡単なタスクは `a1.tiny`、重いタスクは `a1.xxlarge`。
- webhook と組み合わせ——外部イベントが新しい Orb を起こし、並列 fan-out は完全にバックグラウンドで進む。

### 4.6 思想 6：ローカルと完全に同じインターフェース——移行コストの低減こそがプラットフォーム拡張の本当の堀

Orb の設計で最も地味で最も重要な詳細：**エージェントが Orb で露出する全インターフェース（diff レビュー、ターミナル起動、`amp sync`、TUI からの起動）はローカルと同一である**。

この思想の本質：**「クラウドに行く」は「使い方を変える」ことを代償にしてはならない**。Orb に移行した後で新しいコマンド体系を学ぶ必要があれば、移行コストが採用を殺す。Amp はこれを「`amp -x` を `amp -ox` にするだけ」に圧縮し、移行コストをほぼゼロにした。

具象：

- `amp -x` と `amp -ox` は同じメンタルモデル。
- Orb の tmux セッションはローカルシェルと全く同じ使い方。
- diff レビュー、ファイル閲覧、コマンド実行の UI はローカルエージェントとコンポーネントを共有。

**この思想は Orbs が素早く採用される根本理由だ——「強力」だからではなく、「既存のワークフローを中断しない」から**。

### 4.7 思想まとめ：6 つの思想が Orb のデザインマニフェストを成す

| 思想 | 一行で | 具象 |
|---|---|---|
| 1. 独立マシン | エージェントはあなたのツールに寄生しない | Orb = Debian 12 サンドボックス |
| 2. 能力≠権限 | モデルが強いほど権限境界は明確に | OIDC、webhook 署名、レビュー必須 |
| 3. 結果単位課金 | エージェントはサービス、サブスクではない | 分単位課金 |
| 4. オンデマンド弾力 | エージェントは冷/熱状態を持つべき | 5 分アイドルで自動停止 |
| 5. プラットフォーム並列 | fan-out はラップトップに阻まれるべきでない | スレッド単位サイズ選択、オンデマンド fan-out |
| 6. インターフェース同一性 | クラウド化は使い方の変更を伴うべきでない | `amp -x` ↔ `amp -ox`、共有 UI |

この 6 つは独立ではない——一つの鎖を成す：**インターフェース同一性が移行の意思を生む；独立マシンが実際の移行を可能にする；能力≠権限が安心して移行させる；結果単位課金が経済的に移行させる；オンデマンド弾力性が安く済ませる；プラットフォーム並列が新しい用途を解放する**。どれか一つでも欠ければこの形態は成立しない。

---

## 五、核心となる思想の要約

Agents in Orbs が与える最も重要な判断は：**2026 年下半期、エージェントプラットフォームの形をめぐる争いは「どのモデルがより優れているか」から「誰がユーザーに不在の間もエージェントに仕事を終わらせられるか」へ移った**。

- **エージェントの存在場所を再定義した**：IDE サイドバーからクラウド Orb へ。エージェントは独自のマシン、独自の停止/起動リズム、独自の課金単位を持つ。
- **「無人運転」を製品にした**：共有 tmux、webhook 起動、OIDC 連携、分単位課金、5 分アイドル自動停止——この 6 つはどれも欠けてはいけない。
- **fan-out をデモから日常へ移した**：ローカルで 8 並列エージェントは「できる/できない」の問題、クラウドで 8 つは「このくらい払う気になるか」の問題——Orb は後者を「分単位」に圧縮した。
- **エージェントとチケットの関係を逆転した**：以前はエージェントにチケットを切った。今後はチケットにエージェントを開く——エージェントはチケットの実行者で、チケットは通知とアーカイブの容器に退化する。
- **「無人エージェント」に安全ガードレールを描いた**：能力は権限ではない、OIDC 連携 + webhook 署名 + 必須レビュー + 共有 tmux が「手放し」に境界を与える。

覚えておくべき一文：**モデルが強ければ強いほど、それを 1 台のマシンに閉じ込めてはいけない。Orbs は Amp がエージェント時代に提示する工学的回答だ——Amp エージェントを動かすリモートマシン、分単位課金、オンデマンド起動、5 分アイドルで停止、あなたがコンピュータを離れてもエージェントが仕事を続けられる。**

---

## 付録：参考リンク

- [Agents in Orbs（2026-06-30 発表）](https://ampcode.com/news/agents-in-orbs)
- [The Coding Agent Is Dead（2026-02-19 エディトリアル）](https://ampcode.com/news/the-coding-agent-is-dead)
- [Orbs User Manual](https://ampcode.com/manual/orbs)
- [Size the Orbs of Production（2026-08-07 価格表）](https://ampcode.com/news/size-the-orbs-of-production)
- [More Orb Sizes（2026-07-03 ストレージ倍増）](https://ampcode.com/news/more-orb-sizes)
- [OIDC from Orbs](https://ampcode.com/manual/orbs/oidc)
- [Amp Pricing](https://ampcode.com/pricing)
