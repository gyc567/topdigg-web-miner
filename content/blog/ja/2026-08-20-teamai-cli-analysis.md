---
title: "TeamAI CLI 深層解析：GitネイティブアーキテクチャでマルチAgentチームコラボレーションを統一する"
date: "2026-08-20"
description: "TeamAIはTencentがオープンソース化したAgent Harnessツールで、Gitネイティブ方式でスキル、ルール、ナレッジを管理し、Claude Code/Codex/CodeBuddyなどのクロスイAgentチームコラボレーションを実現します。本稿ではその設計哲学、アーキテクチャ、コアコマンドを全面的に解析し、詳細なチュートリアルを提供します。"
tags:
  - TeamAI
  - Agent Harness
  - AI Agent
  - Git
  - Claude Code
  - Tencent
  - マルチAgentコラボレーション
  - チームナレッジ管理
  - MCP
categories:
  - 深層解析
---

# TeamAI CLI 深層解析：GitネイティブアーキテクチャでマルチAgentチームコラボレーションを統一する

> **核心メッセージ**：すべてのAIコーディングAgentに同じ「Harness」を使わせる——それがTeamAIの設計思想の中核です。Gitという既存の道具でチーム知識を管理し、Claude Code/Codex/CodeBuddyといった異なるAgent製品にまたがるナレッジの共有を実現します。

## 一、プロジェクト概要：すべてのAI Agentに同じ「Harness」を

### 1.1 Agent Harnessとは何か

AI Agentの文脈における「Harness（駕馭システム）」とは、**大規模言語モデルの外側にあるランタイム中間層**を指します。Harnessは「ただ話す」だけのLLMを、「本当に物事を行える」信頼できるAgentへと転換する役割を担います。

従来のLLMとのやり取りは**リクエスト-レスポンス**モデルです——質問し、答えが返り、終わり。しかし、真に実用的なAI Agentには以下の能力が求められます。

- **計画（Plan）**：複雑なタスクを実行可能なステップに分解する
- **行動（Act）**：ツールを呼び出し、コードを実行し、ファイルを読書きする
- **観察（Observe）**：ツールの実行結果を取得し、フィードバックループを形成する

Harnessとは、この3つを結びつけるランタイムの骨格です。Claude Code、Codex、CodeBuddy、WorkBuddyなど、異なるAI Agent製品はそれぞれ独自のHarnessを内包していますが、それらの内部スキル、ルール、チームナレッジは各所に散在しており、再利用が困難でした。

### 1.2 TeamAIの位置づけ

**TeamAIの核心理念**は「Make every AI coding agent work by the same harness（すべてのAIコーディングAgentを同じHarnessで働かせる）」です。

つまり、所属チームがどのAgent製品を使っていても、以下の同一セットを共有できるべきだと考えます。

- **スキル（Skills）**：Agentの専門能力パッケージ
- **ルール（Rules）**：チームのコーディング規約とプロセス制約
- **ドキュメント（Docs）**：共有ナレッジベース
- **環境変数（Env）**：キーと設定情報

そしてこれらを結びつける絆こそ、すべての技術チームにとって馴染み深い道具——**Git**です。

| 項目 | 内容 |
|------|------|
| 開発元 | Tencent |
| リポジトリ | https://github.com/Tencent/teamai-cli |
| npmパッケージ | `teamai-cli` |
| 位置づけ | GitネイティブのAgent Harnessツール |
| 対応Agent | Claude Code、Codex、CodeBuddy、WorkBuddy、Copilotなど28種類 |
| コア技術 | TypeScript（厳格モード）、simple-git、Commander.js、Zod |
| 設計思想 | Gitをナレッジ管理の中核に据える「Zero-Infrastructure」 |

---

## 二、核心設計哲学

### 2.1 Gitはチームナレッジ管理の最良のキャリア

TeamAIの最も根本的な設計哲学は、**AI Agentのチーム知識を管理するためにGitを用いる**こと、そしてそれ以外のシステムを新規に構築しないことです。

なぜGitなのか？Gitはチームコラボレーションにおける核心的課題に対して、最初から答えを持っているからです。

| Gitの概念 | TeamAIでの対応能力 |
|-----------|--------------------|
| リモートリポジトリ | チーム共有のナレッジベース |
| ブランチ | 個人の実験や専門スキル |
| Merge Request（MR） | チームのレビュー機構 |
| Pull/Push | ナレッジ同期 |
| コミット履歴 | ナレッジの進化過程 |
| ロールバック | 誤ったナレッジの迅速な巻き戻し |

これはつまり、TeamAIの導入は**チームの既存のGitワークフローを変える必要がない**ことを意味します。追加のデータベースやサービス、別途のデプロイは一切不要です。

### 2.2 ゼロインフラ思想（Zero-Infrastructure）

真のナレッジ管理はゼロコストで運用できるべきです。TeamAIは追加サービスに一切依存しません。

- **ストレージ**：Gitリポジトリをそのまま利用
- **検索インデックス**：ローカルの `search-index.json` をオンデマンドで構築
- **認証**：既存のGit平台認証（GitHub gh CLI / TGit / CNB）をそのまま再利用

これは従来のアプローチとは本質的に異なります。

- **ベクトルデータベース方式との比較**：ベクトルDBサービスのデプロイも、embeddingパイプラインの管理も不要
- **ルールエンジン方式との比較**：ルールはYAMLファイルとして直接保存され、MRでレビューでき、git blameも可能
- **集中型ナレッジベースとの比較**：中央集権的なドキュメントシステムの維持が不要で、各チームはforkしてカスタマイズ可能

### 2.3 摩擦駆動型学習（Friction-Driven Learning）

TeamAIは次のように考えます。**最も価値あるナレッジは摩擦の瞬間から生まれる**。

Agentの実行過程で次のような状況が発生したとき、そこにはチームの最も貴重な経験が宿っています。

- ツール呼び出しが拒否された（Denied tool calls）
- 実行失敗後に再試行された（Failing tools retried）
- 人間による修正（Corrections）
- 実行が中断された（Interrupts）

TeamAIのStop Hookは各Sessionの「摩擦スコア」を記録し、高スコアのSessionは自動的に `/teamai-share-learnings` を起動して、経験をチームナレッジベースに共有します。この設計により、ナレッジ蓄積が日常業務に自然に溶け込み、追加のプロセスは不要です。

### 2.4 プライバシー優先の共有文化

チームナレッジの共有は、個人のプライバシーを犠牲にして達成されるべきではありません。TeamAIのSession共有機能では、デフォルトで以下の情報のみが含まれます。

- ツール呼び出しの回数と種類（具体的なプロンプト内容は含まない）
- 集約された統計データ

詳細なプロンプト内容を共有したい場合は、明示的に `--include-prompt` パラメータを指定する必要があります。その際、システムは自動的にSecretのサニタイズ（例えば `ghp_xxxx` を `<REDACTED:token>` に置換）を実行します。

---

## 三、アーキテクチャ解析

### 3.1 全体アーキテクチャ

TeamAI CLIは以下のコアモジュールから構成されています。

```
src/
├── providers/          # Gitプラットフォーム抽象化層
│   ├── github/         # GitHub（gh CLI または GITHUB_TOKEN）
│   ├── tgit/           # Tencent TGit（gf CLI）
│   └── cnb/            # CNB（cnb.cool）
├── resources/          # リソースタイププロセッサ
│   ├── skills/         # スキルパッケージ
│   ├── rules/          # ルール
│   ├── docs/           # ドキュメント
│   └── env/            # 環境変数
├── utils/              # ユーティリティ関数
└── *.ts                # コマンドエントリポイント
```

**重要な特徴**：

- すべてのGit操作は**分離されたGit Worktree**を使用します。作業ディレクトリと現在のブランチが影響を受けることは決してありません
- `simple-git` ライブラリでGitを操作し、gitコマンドを直接呼び出すことはしません
- すべての設定は `teamai.yaml` に保存されます

### 3.2 ナレッジ検索：BM25 + ナレッジグラフのデュアル駆動

TeamAIの検索システムはハイブリッド戦略を採用しています。

**BM25（スパース検索）**：

- `Intl.Segmenter` を用いて中日英混合の単語分割を行います
- 中国語の複合語（例えば「超时」「排查」）に対してはバイグラム（bigram）分割を適用します
- スコアリング式：`title×3 + tags×2 + body×1 + vote×0.5（上限+5）`

**ナレッジグラフ（デンス検索）**：

- `teamai import` コマンドでコードベースから構造化されたナレッジを取り込みます
- `teamwiki/` ディレクトリ以下にコードベースのグラフを構築します
- 増分インポート（`--incremental`）をサポートします

**Recallのワークフロー**：

1. ユーザーがクエリを入力
2. `teamai-recall` サブエージェントがまず関連性の事前チェック（`teamai recall --check`）を実行
3. 事前チェックを通過した場合のみ実際の検索を実行
4. 検索結果において、プロジェクトナレッジは個人ナレッジより高いスコアを獲得（プロジェクトがアクティブな場合）

### 3.3 Git Provider抽象化

TeamAIは統一された `GitProvider` インターフェースを定義し、3種類のGitプラットフォームをサポートします。

| Provider | 適用シーン | 認証方式 |
|----------|------------|----------|
| `github` | オープンソースプロジェクト／外部チーム | gh CLI または `GITHUB_TOKEN` |
| `tgit` | Tencent社内チーム | gf CLI + iOA SSO / Device Code |
| `cnb` | CNBユーザー | `cnb login` または `CNB_TOKEN` |

新規Providerを追加するには、`GitProvider` インターフェースの6つのメソッドを実装するだけです。`parseRepoInput` / `authenticate` / `cloneRepo` / `createRepo` / `createPullRequest` / `getDefaultEmailDomain` を実装し、`registry.ts` に登録するだけで済みます。

---

## 四、コアコマンド詳解

### 4.1 初期化（init）

```bash
# 方式1：既存のチームリポジトリを使用
teamai init https://github.com/your-org/teamai-repo

# 方式2：現在のリポジトリをチームリポジトリとする（単一リポジトリモード）
teamai init .

# 方式3：HTTP読み取り専用モード（Gitアクセス権を持たないAgent向け）
teamai init --http https://api.example.com --token <key>

# パラメータ説明
--scope project    # .teamai/ をプロジェクトディレクトリに配置（デフォルト）
--scope user       # .teamai/ をユーザーホームディレクトリに配置
--inherit-user-scope  # プロジェクトscopeがユーザーscopeの安全なリソースを継承
```

初期化処理は以下のステップを完了します。

1. GitプラットフォームへのOAuthログイン
2. チームリポジトリのローカルへのクローン
3. チームメンバーとしての登録
4. SessionStart/Stop HooksのAgent設定への注入

### 4.2 ナレッジのプッシュ（push）

```bash
# ローカルリソースをチームリポジトリにプッシュ
teamai push

# 指定ロールに関連するリソースをプッシュ
teamai push --role developer

# サイレントモード（MRを開かない）
teamai push --silent

# 統計情報をプッシュ
teamai push --stats

# Session記録をプッシュ
teamai push --sessions
```

Pushのワークフロー：ローカルリソース → 機能ブランチの作成 → コミット → MRオープン → チームレビュー待ち。

### 4.3 ナレッジのプル（pull）

```bash
# チームの最新リソースを取得
teamai pull

# プレビューモード（取得予定のコンテンツを確認）
teamai pull --dry-run

# ローカルを強制上書き
teamai pull --force
```

Pullは自動的にAgentツール（Claude Codeなど）に同期され、SessionStart Hookにより自動的にトリガーされます。

### 4.4 ナレッジのリコール（recall）

```bash
# チームナレッジベースを検索
teamai recall "タイムアウト問題の処理方法"

# 自動recallの有効化／無効化
teamai recall enable
teamai recall disable

# recallステータスの確認
teamai recall status

# 事前チェックモード（実際の検索を実行しない）
teamai recall --check "クエリ内容"
```

### 4.5 コードベースナレッジグラフの構築（import）

```bash
# ローカルディレクトリからインポート
teamai import --dir ./src

# 他のリポジトリからインポート
teamai import --from-repo owner/repo

# 組織から一括インポート
teamai import --from-org tencent

# MRからインポート
teamai import --from-mr https://github.com/owner/repo/pull/123

# 増分インポート
teamai import --incremental

# enrichステージをスキップ（高速化）
teamai import --skip-enrich
```

### 4.6 チームメンバー管理（members）

```bash
# メンバー一覧の確認
teamai members list

# メンバーの追加
teamai members add <username>
```

### 4.7 ロール管理（roles）

```bash
# ロール設定の初期化
teamai roles init

# ロールの追加
teamai roles add developer --description "開発者ロール"

# メンバーのロール設定
teamai roles set @username developer

# ロール一覧の表示
teamai roles list
```

### 4.8 その他の常用コマンド

```bash
# ローカルとチームリポジトリの差分を確認
teamai status

# 今回のセッション経験を共有
teamai contribute --file ./session.md

# スキルカタログの確認
teamai skill list

# スキルの詳細を表示
teamai skill show <skill-name>

# MCPサーバーの管理
teamai mcp list
teamai mcp inject

# チーム環境変数の管理
teamai env add API_KEY=xxx
teamai env list
teamai env --reveal

# ダッシュボード（Webインターフェース）の使用
teamai dashboard --port 3721

# 設定問題の診断
teamai doctor

# インタラクティブな体験共有
teamai contribute
```

---

## 五、チーム横断スキル購読メカニズム

### 5.1 外部スキルソースの追加

```bash
# GitHubリポジトリをスキルソースとして追加
teamai source add https://github.com/other-team/teamai-skills --name other-skills

# HTTPエンドポイントの追加（読み取り専用）
teamai source add-http https://api.example.com/teamai --name external

# 利用可能なスキルの閲覧
teamai source browse

# 設定済みのスキルソースを一覧表示
teamai source list
```

### 5.2 購読メカニズムの説明

チーム横断購読は、他のチームのスキルライブラリを再利用することを可能にし、npmのパッケージ管理の理念に類似しています。購読後は、ローカルのスキルと同じように外部スキルを使用できます。

```bash
# 利用可能な全スキルを表示（購読ソースを含む）
teamai skill list --source all

# 指定したソースの表示
teamai skill list --source other-skills
```

---

## 六、HookとMCP拡張メカニズム

### 6.1 Hookシステム

TeamAIは `hooks/hooks.yaml` でライフサイクルHooksを定義し、Agent挙動のカスタマイズ拡張をサポートします。

```yaml
# hooks/hooks.yaml のサンプル
PostToolUse:
  - name: teamai-recall
    script: ${TEAMAI_CLI}/dist/teamai-recall.js
    trigger: recall
```

サポートされているHookタイプ：

- `SessionStart`：セッション起動時（自動的にpullを実行）
- `Stop`：セッション終了時（スコアリング + learnings共有のトリガー）
- `PostToolUse`：ツール呼び出し後（recallの事前チェック）

### 6.2 MCPサーバー管理

`mcp/mcp.yaml` でMCPサーバーを設定します。

```yaml
mcpServers:
  filesystem:
    command: npx
    args: ["-y", "@modelcontextprotocol/server-filesystem", "./workspace"]
  slack:
    command: npx
    args: ["-y", "@modelcontextprotocol/server-slack"]
    env:
      SLACK_BOT_TOKEN: ${SLACK_BOT_TOKEN}  # Secret参照
```

環境変数には `${VAR}` 構文を使用し、TeamAIがディスクに書き込む前に実際の値へと解決します。

---

## 七、Claude Codeとの統合

### 7.1 統合の原理

TeamAIはAgentのHookメカニズムを通じて、具体的なAgent製品との結合度を下げています。Claude Codeを例にとると、以下の通りです。

1. **SessionStart Hook** → 自動的に `teamai pull` を実行
2. **Stop Hook** → Sessionをスコアリングし、高スコアのSessionの経験をチームリポジトリにプッシュ
3. **Recall** → Agentがタスク実行前にチームナレッジを検索

### 7.2 サポートされているAgent一覧（28種類）

`teamai list --agent <id>` で登録済みの全Agentを確認できます。主な対応製品には claude、codex、codebuddy、workbuddy、copilotなどが含まれます。

各Agent製品との統合はHookレイヤで抽象化されているため、TeamAIはClaude Code、Codex CLI、CodeBuddy、WorkBuddyなど複数のAgent製品に対して統一されたナレッジ共有インターフェースを提供します。

---

## 八、設計哲学のまとめ

### 8.1 核心理念の振り返り

1. **Gitはチームナレッジの最良のキャリア**：新たなインフラを導入せず、既存のGitワークフローを変える必要がなく、既存のコードコラボレーションプロセスに完全に溶け込みます。

2. **ゼロインフラ（Zero-Infrastructure）**：データベースのデプロイ不要、embeddingサービスの管理不要、ドキュメントシステムの追加デプロイ不要。

3. **ナレッジは摩擦から生まれる（Friction-Driven）**：最も価値ある経験はエラーや困難な瞬間から来ており、システムがこれらの瞬間を能動的に捕捉してチームナレッジへと変換します。

4. **プライバシー優先の共有文化**：デフォルトでは集約統計データのみを共有し、機密情報は自動的にサニタイズされるため、心理的ハードルを伴うことなく共有できます。

5. **すべてをバージョン管理（Version Control Everything）**：スキル、ルール、ドキュメント、環境変数のすべてをバージョン管理し、ロールバックとレビューが可能。

### 8.2 限界と課題

- デフォルトのプッシュ先ブランチが `master`（`main` ではない）であり、レガシー問題が存在します
- Git操作の分離がworktreeに依存しており、その複雑さはすべてCLIが負担します
- Recallの品質はナレッジベースのメンテナンス状況に依存し、メンテナンスされなければ価値が出ません
- 多言語サイト（中国語／英語／日本語など）の内容は手動で同期する必要があります

### 8.3 適用シーン

✅ **強く推奨されるシーン**：

- マルチAgentチームコラボレーション（異なるAgent製品、異なるメンバー）
- 統一されたコーディング規約とベストプラクティスを必要とするチーム
- Gitリポジトリ基盤を持つ技術チーム

⚠️ **あまり適さないシーン**：

- 個人ユーザー（導入の複雑さが利益を上回る）
- 非技術チーム（Gitワークフローのハードルが高い）
- リアルタイムナレッジコラボレーションが必要なシーン（Gitの非同期モデルには遅延がある）

---

## 九、クイックスタートチュートリアル

### 9.1 インストール

```bash
# npmでインストール（推奨）
npm install -g teamai-cli

# インストールの確認
teamai --version
```

### 9.2 チームリポジトリの初期化

```bash
# 方式1：既存のチームリポジトリを使用
teamai init https://github.com/your-org/teamai-knowledge

# 方式2：現在のプロジェクトをチームリポジトリとして使用
teamai init .
```

### 9.3 最初の経験をプッシュ

```bash
# Claude Codeでタスク完了後
teamai contribute

# または直接ファイルを指定
teamai contribute --file ./session-summary.md
```

### 9.4 チームメンバーがプル

```bash
# チームの最新ナレッジを取得
teamai pull

# 関連ナレッジを検索
teamai recall "うちのチームでAPIタイムアウトをどう扱っているか"
```

### 9.5 ステータスの確認

```bash
# ローカルとチーム間の差分を表示
teamai status

# Webダッシュボードを開く
teamai dashboard --port 3721
```

### 9.6 高度な使用例：摩擦から学ぶ

```bash
# Session中の摩擦スコアを表示
teamai status --show-friction

# 高摩擦Sessionの経験を手動で共有
teamai contribute --file ./session-with-errors.md --include-prompt

# 共有履歴の確認
teamai history --shared
```

### 9.7 トラブルシューティング

問題が発生した場合は、まず `teamai doctor` を実行してください：

```bash
# 設定問題の診断
teamai doctor

# 詳細なデバッグ情報
teamai doctor --verbose

# 自動修復
teamai doctor --fix
```

---

## 十、技術スタックとエンジニアリングプラクティス

### 10.1 技術選択

| カテゴリ | 技術 |
|----------|------|
| 言語 | TypeScript（厳格モード） |
| モジュールシステム | ESM（`"type": "module"`） |
| CLIフレームワーク | Commander.js |
| Git操作 | simple-git |
| ビルドツール | tsup |
| テストフレームワーク | Vitest |
| 設定フォーマット | YAML + TOML |
| ランタイムバリデーション | Zod |
| フロントエンド | なし（純粋なCLI） |

### 10.2 開発規範

- [conventional commits](https://www.conventionalcommits.org/) を使用：`feat:`、`fix:`、`docs:`、`test:`、`refactor:`
- テストカバレッジ目標 ≥ 80%
- ユニットテストは `src/__tests__/` に配置し、ファイル名はミラー（例：`init.test.ts`）
- 外部I/Oはモジュール境界でモックし、ネットワークテストは環境変数（例：`TEAMAI_TEST_TOKEN`）で保護

### 10.3 アーキテクチャ上のハイライト

**Provider Pattern**：Gitプラットフォームの抽象化には古典的なProviderパターンが採用されており、新プラットフォームの追加コストを大幅に下げています。6つのメソッドを実装するだけで新規Providerを追加できます。

**Worktree分離戦略**：すべてのGit操作は分離されたworktreeで実行されるため、現在の作業ブランチが破壊される心配がありません。これはエンタープライズ環境で特に重要な保証です。

**Sandboxサニタイズ**：Session共有時のSecret自動サニタイズにより、APIキーやトークンが意図せず漏洩するリスクを排除しています。

**Plugin Architecture**：スキル、ルール、MCPサーバーなど、すべての拡張ポイントがプラグインアーキテクチャで設計されており、TeamAIコアへの変更なしでチーム独自の拡張が可能です。

### 10.4 コード品質保証

- TypeScript厳格モードにより、ランタイム前に型エラーを検出
- Zodによる設定ファイルの実行時バリデーション
- 統合テストとユニットテストの両方をカバー
- CI/CDパイプラインでの自動Lint・Format・Test実行

---

## 十一、まとめと展望

TeamAIは、AI Agentチームコラボレーションにおける重要な方向性を体現しています。**成熟したツール（Git）を使って新しい問題（Agentナレッジ管理）を解決する**こと——新たなインフラやプロトコルを発明するのではなく。

TeamAIの核心的価値は以下の点にあります。

- **チームコラボレーションコストの低減**：ワークフローを変える必要がなく、新しいツールを学ぶ必要もない
- **Agent一貫性の向上**：異なるAgent、異なるメンバーが同一のナレッジ基盤を共有
- **チーム知恵の蓄積**：個人の経験をチームの資産に変換し、後から参加したメンバーが恩恵を受ける

マルチAgentシステムを構築している、またはAI Agentチームを管理しているのであれば、TeamAIは大規模な実践検証を経た参考アーキテクチャを提供します。TeamAI自体を使用しなくても、その**Gitネイティブナレッジ管理**の理念は深く考察し借鉴する価値があります。

### 11.1 今後の発展方向

プロジェクトのロードマップから読み取れる今後の発展方向：

1. **より多くのAgent統合**：28種類のAgentに加え、新たなAI Codingツールとの統合を継続
2. **検索品質の向上**：BM25とナレッジグラフのさらなる融合により、セマンティックな検索を強化
3. **摩擦スコアリングの精緻化**：機械学習ベースの摩擦検出により、より正確な経験抽出を実現
4. **エンタープライズ機能の強化**：権限管理、監査ログ、コンプライアンス対応の拡充
5. **国際化とローカライゼーション**：多言語サポートの強化、中国語、英語、日本語以外の言語への拡張

### 11.2 採用時の推奨事項

TeamAIを本番環境で採用する際は、以下の点を推奨します。

- **小規模から開始**：まずパイロットチームで導入し、効果を検証後に全社展開
- **チームナレッジの整備**：最初から質の高いルールとスキルを用意し、価値実感までの時間を短縮
- **Gitワークフローの標準化**：MRレビュープロセスを確立し、共有ナレッジの品質を担保
- **プライバシー設定の確認**：組織ポリシーに合わせてSecretサニタイズルールを調整
- **継続的なメンテナンス文化**：ナレッジベースの鮮度を維持する運用ルールを策定

### 11.3 最後に

AI Agent時代のチームコラボレーションは、まだ始まったばかりです。TeamAIが示す「Gitネイティブ」というアプローチは、シンプルで実用的、かつ拡張性に優れています。新種のインフラを次々生み出すのではなく、既存の道具を使いこなす——この哲学が、AI Agentの実用化フェーズにおいて、より持続可能で現実的な解となるのではないでしょうか。

---

**プロジェクトアドレス**：https://github.com/Tencent/teamai-cli
**npmパッケージ**：`teamai-cli`
**現在のバージョン**：0.19.0

---

*本稿は2026年8月のプロジェクト最新状態に基づいて執筆。v0.19.0は未リリースバージョン（Unreleased）であり、一部の機能詳細はバージョンアップに伴い変更される可能性があります。*

## 研究文档（引用来源参考）
(no reference document available)