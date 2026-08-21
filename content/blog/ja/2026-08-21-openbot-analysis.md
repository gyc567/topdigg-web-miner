---
title: "OpenBot 深掘り：すべての AI Agent に自分のコンピュータを"
date: "2026-08-21"
description: "CopilotKit/OpenBot の深度解析。AI Agent プラットフォーム、各 Bot は独立したコンピュータ（ реаль браузер + ファイルシステム + ツール）を保有、すべての操作は実行前に承認され後に記録される。核心のアイデア：信頼性の高い AI Agent 同事。任意の AG-UI Agent 接入対応 CEL ポリシーエンジン、完整審計日誌、Docker ワンクリックデプロイ。"
tags:
  - OpenBot
  - CopilotKit
  - AI Agent
  - AG-UI
  - Agent Platform
  - LangGraph
  - CrewAI
  - 自主権
  - セキュリティガバナンス
  - MCP
categories:
  - 深度解析
  - AI Agent
  - オープンソース
---

# OpenBot 深掘り：すべての AI Agent に自分のコンピュータを

> 核心思想：**"AI coworkers you can hand real work to, and actually trust with the access"**——OpenBot の創業者たちは、現在の AI Agent が不足しているのは「能力」ではなく「信頼性の高い操作境界」だと主張する。Agent は本物のブラウザを駆動し、ファイルを読み書きし、MCP サービスを呼び出すことができるが、その Agent が何をしているのか、なぜしているのか、いつでも制御を取り戻すことができるのか——これらが Agent を真の同僚にできるかどうかの決定打となる。OpenBot の答えは：**すべての Agent に自分のコンピュータをを与え、ゲートウェイで監視し、完全な操作記録を残す。**

## 一、プロジェクトの背景とコアな位置づけ

CopilotKit チームは AI Agent 分野で2つの有名なプロダクトを持っている：**CopilotKit**（フロントエンド Agent 統合フレームワーク）と **Copilot Runtime**。OpenBot はこの方向における最新の試み——**オープンソースの AI Agent プラットフォーム**であり、 목표は AI Agent を「ツールを呼び出せる」から「安心して授權できる」へ進化させること。

現在のほとんどの Agent 製品の核心的な矛盾は以下のとおり：

- 本当のことがさせたい（ウェブサイトにログイン、ファイルの読み書き、外部サービスの呼び出し）
- しかし、本当のことをさせるということはリスクを伴う（誤操作しないか？データ漏洩しないか？）

OpenBot の解き方は Agent の能力を制限することではなく、**授權モデルを再び構築すること**：Agent に何ができるかを問うのではなく、誰がどんな状況で何を確認し、事後に記録が残るかを問う。

### プロジェクトのメタ情報

| フィールド | 値 |
|------|-----|
| リポジトリ | https://github.com/CopilotKit/openbot |
| ステータス | Alpha（活発な開発中）|
| ライセンス | MIT |
| 言語 | TypeScript/React + Bun + Hono |
| デプロイ | Docker Compose / シングルコンテナ Docker |
| データベース | PostgreSQL + pgvector |
| Agent プロトコル | AG-UI（オープンプRotocol） |
| 依存 | CopilotKit Intelligence（スレッドと記憶）|

### 一言で定位

OpenBot は**ローカルファースト、監査可能、治理を含む AI Agent コラボレーションナラフ폼**である：各 Bot は自分の独立したコンピュータ（コンテナ+ブラウザ+ファイルシステム）を持ち、すべての操作は CEL ポリシーゲートウェイを通過して承認され、完全な監査ログが記録され、ユーザーはいつでも制御を取り戻すことができる。

## 二、核心的な考え方：「何ができる」から「凭什么做（なぜやるのか）」へ

### 2.1 従来の Agent の信頼性の苦境

現在の主流 Agent 製品（Claude Code、Cursor Agent、OpenAI Operator）の共通問題は：**Agent が操作を実行することと、ユーザーの操作の間の巨大的情報非対称性。**

ユーザーは「Agent に X をさせた」ことしか知らないが、以下を知らない：

- Agent が呼び出した具体的なツールが何であるか
- ツールのパラメータと目标是何か
- 操作結果が予想通りかどうか
- 危険な操作が黙って拒否されたかどうか

OpenBot の核心的な判断は：**信頼は能力を制限することでは構築ものではなく、透明性と制御可能性によって構築される。** Agent に「何をしてはならない」を伝えることで身を守るのではなく、**すべての操作が承認ゲートウェイを通過し、記録が残り、いつでも制御を取り戻せる**ことで真の信頼を構築する。

### 2.2 「先に承認、後に実行」ガバナンスモデル

OpenBot の設計哲学の核心は **Gateway（ゲートウェイ）を唯一のエントリポイントとする** こと：

```
ユーザー操作 → サーバーゲートウェイ → ポリシー検査 → 監査ログ → 許可/拒否 → Bot コンピュータが実行
```

このフローの鍵は：**記録なしで行動することは永遠にない。** 各操作は以下の通り：

1. **resolve** - サーバーが保持するスナップショットから目標を解析
2. **evaluate** - CEL ポリシーに基づいて許可与否を評価
3. **audit** - 監査行を書き込み、決定と理由を記録
4. **act** - 許可された場合にのみ実際に実行

### 2.3 各 Bot 自分のコンピュータ

OpenBot の最もユニークな理念は **各 Bot が独立したコンピュータを所有する** こと：

- 独立した Chromium ブラウザ（自分のログイン状態）
- 独立した `/workspace` ファイルシステムボリューム
- 独立したブラウザプロファイル
- オプションの gVisor サンドボックス隔离

これは、Agent 間のデータが完全に分離されており、ある Agent が漏洩してもすべての Agent が漏洩するわけではないことを意味する。

## 三、プロジェクト說明：アーキテクチャとコンポーネント

### 3.1 サービスアーキテクチャ図

OpenBot は Docker Compose でオーケストレーションされる複数の協調サービスで構成されている：

```
┌─────────────────────────────────────────────────────┐
│                     React/Vite UI                   │
│                    (app :3010)                      │
└──────────────────────┬──────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────┐
│              Hono API Server (server :3001)          │
│  Auth / Policy / Audit / Credentials / Plugins       │
│  Components / Coworkers / Channels                   │
│  CopilotKit Runtime                                  │
└──────┬────────────────┬──────────────────┬───────────┘
       │                │                  │
┌──────▼──────┐  ┌──────▼──────┐  ┌────────▼────────┐
│agent-computer│  │ agent-bot   │  │agent-langgraph  │
│  (:4100)    │  │  (:4200)    │  │    (:4201)      │
│ Chromium    │  │ PoC AG-UI   │  │  LangGraph Bot  │
│ + workspace │  │  Bot        │  │                 │
└─────────────┘  └─────────────┘  └──────────────────┘
                       │
              ┌────────▼────────┐
              │   Supervisor    │
              │ (:4500 host /   │
              │  :4300 container)│
              │ 各Bot独立コンテナ │
              └─────────────────┘
                       │
              ┌────────▼────────┐
              │   PostgreSQL    │
              │ + pgvector (:5432)│
              │ データ/監査/ポリシー │
              └─────────────────┘
```

### 3.2 コアコンポーネントの詳細

#### Gateway（ポリシーゲートウェイ）

Gateway は OpenBot セキュリティモデルの核心である。Bot のすべての操作の唯一のエントリポイント：

- 操作目標を解析（URL、ファイルパス、MCP 呼び出し）
- CEL ポリシーに基づいて許可与否を評価
- 監査行を書き込む
- 許可後に Bot コンピュータを実行に呼び出す

鍵の設計：**ゲートウェイをバイパスして直接操作する道は存在しない。** .low-level トークン保護サービスポートであっても、ゲートウェイをバイパスするために使用できない。

#### Supervisor（スーパーバイザ）

Supervisor は各 Bot の独立したコンピュータコンテナを作成・管理することを負責：

- 各 Bot に1つの Docker コンテナ
- 各コンテナに独立した workspace ボリューム
- 各コンテナに独立したブラウザプロファイル
- gVisor（`runsc`）分離ランタイムをサポート

#### Agent Computer（Agent コンピュータ）

Agent Computer は Bot が本当のブラウザを操作するコンポーネント：

- 本物の Chromium ブラウザ（任意のウェブサイトを操作可能）
- ファイルシステムツール（Bot の workspace の読み書き）
- シェル実行（同一ゲートウェイ承認経由）
- スクリーンショットと DOM スナップショット

#### Bot Endpoints（Bot エンドポイント）

OpenBot は2種類の Bot をサポート：

1. **ビルドイン Bot**（built-in）：システムプロンプトを構成するだけですぐ作成
2. **リモート AG-UI Bot**（remote-ag-ui）：任意の AG-UI プロトコルエンドポイントに接続

サポートフレームワーク：LangGraph、Mastra、CrewAI、Pydantic AI、Google ADK、または自作 AG-UI エンドポイント。

### 3.3 3つのビルドイン同僚

OpenBot サンプルパックには3つの Bot が内置（構成のみ、コードではない）：

| Bot | 定位 | 能力 |
|-----|------|------|
| **General Assistant** | 日常アシスタント | ブラウザ操作、ファイル処理、情報検索 |
| **Knowledge** | エンタープライズナレッジベース | Google Drive/OneDrive 知識ソースに接続 |
| **Risk Analyst** | リスク管理・コンプライアンス | 操作リスクをレビュー、コンプライアンス意見を出具 |

## 四、詳細な教程：ゼロから OpenBot を構築

### 4.1 前提条件

- **Docker** + Docker Compose（PostgreSQL と Bot サービス用）
- **Bun 1.3+**（App と API サービス用）
- **CopilotKit Intelligence プロジェクトとライセンス**（無料プランあり、セルフホスト可能）
- **モデル API Key**（OpenAI / Anthropic / Google）

### 4.2 クイックスタート（5ステップで完了）

**Step 1：環境変数をコピー**

```bash
cp .env.example .env
```

**Step 2：CopilotKit Intelligence の認証情報を取得**

```bash
npx --yes copilotkit@latest login
npx --yes copilotkit@latest project select
npx --yes copilotkit@latest license --write
```

- `license --write` は `COPILOTKIT_LICENSE_TOKEN` を `.env` に書き込む
- `project select` が出力する `cpk-...` runtime key を `INTELLIGENCE_API_KEY` として設定

**Step 3：残りの設定を記入**

```bash
# 記入必須
OPENAI_API_KEY=sk-...

# 暗号化キーを生成（ローカル開発用）
openssl rand -base64 32
# KEY_ENCRYPTION_KEY に入力
```

**Step 4：依存関係をインストールして起動**

```bash
bun install
bash scripts/start.sh
```

`start.sh` 起動フロー：
1. Docker Compose が PostgreSQL、Bot サービスを起動
2. データベースマイグレーションを実行
3. API Server を起動（:3001）
4. React App を起動（:3010）
5. ヘルスチェックで全サービスの準備完了を確認

**Step 5：ブラウザで開く**

http://localhost:3010 にアクセス

### 4.3 クイック体験パス

起動後、すぐに以下のシナリオを試せる：

**パス1：Bot と直接会話**
- `/bot` にアクセス
- 入力：`Open news.ycombinator.com and tell me the top story.`
- Bot がどのようにブラウザを開き、自主的に検索し、結果を報告するか観察

**パス2：監査ログの検証**
- Bot に https://httpbin.org/forms/post を記入させる
- `/admin/audit` にアクセスして完全な操作記録を表示
- 各操作ステップにタイムスタンプ、ツール名、ターゲットアドレス、結果が記録されていることを確認

**パス3：ポリシー遮断**
- `/admin/boundaries` にアクセス
- 拒否ルールを追加（例如：某个ドメインへのアクセスを禁止）
- 同じ操作を再試行し、Bot が拒否され、ルール名が表示されることを確認

**パス4：カスタム同僚を作成**
- `/agents` にアクセス
- 新規 Bot を作成：名前、職種、ロール記述を入力
- AG-UI エンドポイントまたはビルドインモードを選択
- 専用チャネルを起動

### 4.4 Docker シングルコンテナデプロイ（本番推奨）

```bash
# イメージをビルド
docker build -t openbot .

# 起動（組み込み PostgreSQL）
docker run -p 3001:3001 --env-file .env \
  -e EMBEDDED_POSTGRES=on \
  -v openbot-data:/var/lib/postgresql/data \
  openbot

# または外部 PostgreSQL に接続
docker run -p 3001:3001 --env-file .env \
  -e DATABASE_URL="postgresql://user:pass@host:5432/openbot" \
  openbot
```

### 4.5 Google OAuth 認証の設定（オプション）

ローカル開発ではデフォルトで `OPENBOT_DEV_NO_AUTH`（ログインをスキップ、すべてのリクエストを管理者のアイデンティティで実行）。

本当のログインを設定：

```bash
# キーを生成
openssl rand -base64 32

# .env で設定
BETTER_AUTH_URL=http://localhost:3001
BETTER_AUTH_SECRET=<上記で生成したキー（最低32文字）>
GOOGLE_OAUTH_CLIENT_ID=<あなたのGoogle OAuth Client ID>
GOOGLE_OAUTH_CLIENT_SECRET=<あなたのGoogle OAuth Client Secret>

# 信頼されたOrigin（ローカル開発）
TRUSTED_ORIGINS=http://localhost:3010

# 初期管理者メールアドレス
INITIAL_ADMIN_EMAILS=your@email.com

# OPENBOT_DEV_NO_AUTH を削除
```

## 五、CEL ポリシーエンジンの詳細

### 5.1 ポリシールールのフォーマット

ポリシーは JSON フォーマットで `AGENT_COMPUTER_POLICY` 環境変数または管理者が保存した設定に格納：

```json
{
  "deny": [
    {
      "description": "クラウドメタデータアドレスへのアクセスをブロック",
      "expression": "page.host.matches('.*\\.google\\.com.*')"
    }
  ],
  "allow": [
    {
      "description": "閲覧と検索を許可",
      "expression": "tool.name in ['browser.navigate', 'browser.search']"
    }
  ]
}
```

### 5.2 検査可能なフィールド

CEL ルールは次のフィールドを検査可能：

| フィールドタイプ | 利用可能なフィールド |
|---------|---------|
| ツール | `tool.name` |
| 意図 | `intent` |
| Bot | `bot.id` |
| ユーザー | `actor.id` |
| ページ | `page.url`, `page.host` |
| 要素 | `element.ref`, `element.role`, `element.name`, `element.type` |
| キーボード | `key` |
| ファイル | `file.path`, `file.name`, `file.extension` |
| MCP | `mcp.server`, `mcp.tool`, `mcp.effect` |

### 5.3 Fail-Closed の原則

OpenBot のポリシーエンジンは**fail-closed の原則を厳密に守る**：

- 拒否ルールは許可ルールより先に評価
- **ポリシーが未設定 = すべて禁止**
- 破損した拒否ルール = 拒否
- 破損した許可ルール = 許可しない

これは、デフォルト状態で Bot には何もさせず、管理者が許可ルールを明確に設定するまでは動作しないことを意味する。

### 5.4 ポリシー管理インターフェース

管理者は `/admin/boundaries` インターフェースで以下が可能：

- 現在のポリシーを表示
- ルールの追加/編集/削除
- プリセットポリシーテンプレートの選択
- ルール有効化後の遮断効果をを表示

## 六、重要な機能の深度解析

### 6.1 「ハンドルを握る」メカニズム

Bot が以下の場合に人間の助けをリクエスト：

- ログイン壁（認証情報の入力が必要）
- 2FA プロンプト
- 危険な操作が不確実

制御権の移交は3つの監査イベントとして記録：

- `computer.help_requested` - Bot がヘルプをリクエスト
- `computer.control_taken` - ユーザーが制御を引き継ぐ
- `computer.control_released` - ユーザーが制御を解放

**鍵の設計**：ユーザーが制御を引き継いでいる間、Bot のすべての操作リクエストは**直接拒否**され、キューに積まれない。これにより、ユーザーは常に最終的な決定権を握ることを確保。

### 6.2 認証情報金庫

機密認証情報（API Key、OAuth Token、データベースパスワード）は会話記録に出るべきではない。

OpenBot の解決策：

- `/admin/credentials` インターフェースで暗号化された認証情報を хранится
- 認証情報は暗号化された形式で 保存され、**API レスポンスで返されることは永远不会**
- 監査ログは「認証情報がリクエストされた」と「リクエスト時間」のみを記録し、認証情報の内容は記録しない

### 6.3 MCP ガバナンス

OpenBot は MCP（Model Context Protocol）を統合し、 内蔵ガバナンス層を含む：

**組み込み MCP 統合**：

- Atlassian（Jira、Confluence）
- Box
- Slack
- Salesforce
- ServiceNow

**ガバナンスルール**：

- カスタム MCP サーバーは URL 検査を通過する必要がある
- 「読み取り」として明確分類できないツールは、**デフォルトで書き込み操作とみなす**
- 各 MCP 呼び出しは grant 検査とポリシー評価を通過

### 6.4 React コンポーネントをツールとして

ほとんどの Agent が純粋なテキストで返信するのとは異なり、OpenBot の Bot は **React コンポーネント**を返せる：

- コンパイル済みコンポーネントは `app/src/components/gallery/` に格納
- サンドボックスコンポーネントは `/admin/playground` で創作・公開
- 各コンポーネント呼び出しはサーバー検証を経由（存在？公開済み？その Bot の使用が許可？）
- 組み込みデータ関数：`botActivity`（Bot アクティビティ）と `recentRefusals`（最近の拒否）

### 6.5 永続スレッドと記憶

OpenBot は CopilotKit Intelligence を通じて以下を実現：

- サービスの再起動後も会話が保持（コンテキストが失われない）
- 各デプロイされたスレッドに独立した識別子（`DEPLOYMENT_ID`）
- セッションをまたいだ記憶の再利用をサポート

## 七、設計哲学：6つの核心原則

### 7.1 先に記録、後に実行（Record Before Act）

OpenBot の最も重要な設計原則：**監査ログが書き込まれる前に操作を実行することはできない。**  操作が最終的に許可されたとしても、監査行は行動の前に書き込まれる必要がある。これにより、システムが攻撃されても、攻撃行為が記録されることが確保。

### 7.2 失敗即关闭（Fail Closed）

CEL ポリシーエンジンの fail-closed 動作は以下を意味する：

- デフォルト状態が最も安全
- セキュリティの脆弱性は設計の欠陥ではなく、構成のエラーから生じる
- 管理者は各権限を明示的に付与する必要がある

### 7.3 隔离而非限制（Isolate, Don't Restrict）

各 Bot には独立したコンテナ、独立したブラウザプロファイル、独立した workspace ——**隔离がデフォルト**であり、制限によってセキュリティを実現するのではなく。これにより、ロックンの安全ベルトの論理に直接対応：安全はあなたと落下を隔离することから生まれ、あなたが高いところに登ることを禁止することからではない。

### 7.4 透明性即信任（Transparency is Trust）

OpenBot は機能を隠すことで信頼を構築するのではなく、**完全な透明性**によって構築：

- 各操作に記録がある
- 各拒否に理由がある
- ユーザーはいつでも制御を引き継げる
- 認証情報が会話記録に出ることは永远不会

### 7.5 プロトコル而非プラットフォーム（Protocol, Not Platform）

OpenBot は AG-UI プロトコルに基づいて構築され任何、特定のフレームワークに縛られない。これにより：

- LangGraph、Mastra、CrewAI、Pydantic AI がシームレスに接続可能
- ガバナンスロジックがプロトコルに従い、フレームワークに従わない
- ユーザーが CopilotKit エコシステムにロックインされない

### 7.6 ローカルファースト（Local-First）

OpenBot は**你自己的インフラストラクチャ**上で実行されるように設計：

- データが PostgreSQL（あなたがコントロールするデータベース）に
- モデルはご自分で選択（ご自分の API Key）
- ブラウザは loopback にバインド（ローカル）
- 機密データをサードパーティサービスに送信する必要がない

## 八、見解のまとめと示唆

### 見解 1：Agent の次の進化の方向は「能力」ではなく「監査可能性」

現在の AI Agent の軍拡競争は「何ができるか」に集中：より多くのツール、より強力な推論、より長いコンテキスト。OpenBot は見落とされている方向を指し示す：**監査可能性**。Agent ができることが増えるほど、信頼の問題の根源は「能力が強すぎる」ではなく「境界が不明確」にある。次の進化の焦点は、各操作が追跡可能、介入可能、説明可能にすること。

### 見解 2：「先に承認、後に実行」は企業向け Agent の必经之路

エンタープライズシナリオでは、AI Agent はコンプライアンス要件（SOX、GDPR、SEC）を満たす必要がある。コンプライアンスを実装する技術的パスは「Agent の能力を制限する」ではなく、**各操作の前に意思決定ポイントを確立する**こと。OpenBot の CEL ポリシーエンジン + 監査ログはこの方向の技術的実装レファレンス。

### 見解 3：隔离アーキテクチャは権限システムより根本的

従来のセキュリティ思考は RBAC（役割ベースのアクセス制御）：Agent に役割を割り当て、役割が権限を決定する。これは Agent シナリオでは不十分、なぜなら Agent の動作は動的でコンテキストに依存するから。OpenBot の「各 Bot 独立コンテナ」アーキテクチャはより根本的な隔离を提供——たとえ1つの Bot が攻撃されても、攻撃面は独立したコンテナ内に限定。

### 見解 4：認証情報管理は Agent プラットフォームのインフラストラクチャであり、機能ではない

ほとんどの Agent 製品が「認証情報管理」を追加機能として扱かう。OpenBot はそれを第一級市民として位置づけ：認証情報金庫、暗号化保存、API で返さない、監査記録するが内容は記録しない。これは Agent が「実験用おもちゃ」から「本番システム」へのインフラストラクチャのまたぎ。

### 見解 5：AG-UI プロトコルの価値は「ガバナンスがプロトコルに従う」

OpenBot が AG-UI を、自作プロトコルではなく選択した核心的なロジック：**ガバナンスルールは LangGraph や CrewAI ではなく、プロトコルに従うべき。** ガバナンスロジックが LangGraph や CrewAI に埋め込まれている場合、フレームワークを切り替えるたびにガバナンスを再度実装し直す必要がある。AG-UI をオープンプ Rotocol とすることで、フレームワークをまたいだ統一ガバナンスの可能性を提供。

### 見解 6：「人がループにいる」ことは効率を低下させるのではなく、信頼度を向上させる

「ユーザーがいつでも制御を引き継げる」ことが Agent の効率を低下させるという批判がある。OpenBot の設計実践は示す：**信頼が構築されると、ユーザーの介入頻度は大幅に減少する。** 効率を本当に低下させるのは「Agent が何をしているかわからないので委ね不敢」。透明性と制御可能性は信頼を高め、介入を減少させる根本。

### 見解 7：オープンソース Agent プラットフォームは商用製品との差を縮めている

CopilotKit チームが OpenBot を完全にオープンソース化（MIT）、アーキテクチャ図込み（`bun run diagram` で再生成可能）、ポリシーエンジン、MCP ガバナンスを含む。これは、オープンソースコミュニティが AI Agent インフラストラクチャの成熟度において、商用製品を急速に追いかけていることを示している。

## 九、技術仕様早見表

| ディメンション | 仕様 |
|------|------|
| デプロイ形態 | Docker Compose / シングルコンテナ Docker |
| データベース | PostgreSQL + pgvector |
| App ポート | 3010 |
| API ポート | 3001 |
| Bot ブラウザポート | 4100 |
| Bot エンドポイントポート | 4200/4201 |
| スーパーバイザポート | 4500（ホスト）/ 4300（コンテナ内）|
| ポリシーエンジン | CEL 式 + fail-closed |
| 分離ランタイム | gVisor（オプション）|
| 認証情報暗号化 | AES-256、KEY_ENCRYPTION_KEY からキーを取得 |
| Agent プロトコル | AG-UI |
| サポートフレームワーク | LangGraph、Mastra、CrewAI、Pydantic AI、Google ADK |
| 組み込み MCP | Atlassian、Box、Slack、Salesforce、ServiceNow |

## 十、結語

OpenBot の核心的な貢車は「また Agent フレームワーク」ではなく、**Agent の信頼モデルを再定義したこと**にある。

ほとんどの Agent 製品が信頼を構築するために能力を制限しようとしている（"この Agent はこれらのことしかできない"）。OpenBot のパス：**能力は制限せず、各行動が透明で、監査可能で、介入可能である。** 信頼は「より少ないことをする」からではなく、「各ことをするたびに記録がある」から構築される。

また、より根本的な警鐘も提供：**AI Agent の問題は「モデルが強さ足りない」ではなく「Agent の実際の環境での行動境界が明確かどうか」もある。** Agent が本当のブラウザを操作し、本当のファイルを読み書きし、本当のサービスを呼び出すとき、「能力」と「ガバナンス」は同時に進化する必要がある。

OpenBot は現在 Alpha 段階（ドキュメントには "Expect rough edges and bugs" と明記されている）だが、方向は正しい——これは Agent の能力の問題ではなく、Agent の信頼の問題を解決しようとしている。AI Agent が「 демо 用おもちゃ」から「本番システム」へ進む过程中的必须之路。

---

*プロジェクトアドレス：https://github.com/CopilotKit/openbot*
*公式サイト：https://copilotkit.ai/openbot*
*プロトコル：AG-UI（オープンプ Rotocol、https://github.com/ag-ui-protocol/ag-ui）*
