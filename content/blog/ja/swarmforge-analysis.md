---
slug: swarmforge-analysis
title: "SwarmForge：tmuxベースのマルチAI Agentオーケストレーションプラットフォーム"
description: "SwarmForge（tmuxベースのAI Agentオーケストレーションプラットフォーム）を詳しく解説—— ワークフロー設定（two-pack/four-pack/six-pack）、Worktree隔離、Handoffプロトコル、憲法構造を通じて、複数のAIエージェントがソフトウェアプロジェクトを協調開発を実現。プロジェクトアーキテクチャ、3種類のプリセットワークフロー工作机制、設定駆動型設計理念、使用例などを網羅。"
date: "2026-08-13"
author: "TopDigg"
tags: ["SwarmForge", "Multi-Agent", "tmux", "AI Agent", "Orchestration", "Worktree", "Handoff", "Developer Tools", "AI Agents"]
categories: ["Deep Dive"]
keywords: ["SwarmForge", "マルチエージェント", "tmux", "AI Agentオーケストレーション", "Worktree隔離", "Handoffプロトコル", "ソフトウェアエンジニアリング", "自動化", "開発者ツール", "AI協調", "four-pack", "six-pack"]
---

# SwarmForge：tmuxベースのマルチAI Agentオーケストレーションプラットフォーム

> コア思想：**複数のAIエージェントに開発チームのように協調作業させる。** SwarmForgeはローカルtmux環境で動作する軽量なマルチAI Agentオーケストレーションプラットフォームで、設定駆動型のアプローチによって複数のAIエージェントを協調させてソフトウェアプロジェクトを開発させます。複雑なクラウドサービスや派手なインターフェースを追求するのではなく、隔離されたgit worktreeでAI Agentを効率的に動作させ、構造化されたHandoffプロトコルを介してタスクとコンテキストを伝達することに注力しています。SwarmForgeのプロジェクトアーキテクチャ、コアメカニズム、3種類のプリセットワークフロー、使用ガイドの完全な解説です。

## 1. プロジェクト紹介と概要

### 1.1 一言で説明

**SwarmForgeは、tmuxベースのマルチAI Agentオーケストレーションプラットフォームで、設定駆動型ワークフローを通じて複数のAIエージェントを隔離されたgit worktreeで協調開発させるプラットフォームです。**

そのコアコンセプトは「設定＝コード」です。ハードコードされたワークフローに頼るのではなく、`swarmforge.conf`設定ファイルと役割プロンプト定義によってチーム全体の協調アプローチを定義します。各役割（Agent）は独自の隔離された環境で動作し、構造化されたHandoffファイルを介してタスクとコンテキストを伝達します。

### 1.2 プロジェクトメタデータ

| 項目 | 値 |
|------|-----|
| GitHub | [unclebob/swarm-forge](https://github.com/unclebob/swarm-forge) |
| Stars | 未確認 |
| ライセンス | 未確認 |
| 言語 | Shell + 設定ファイル |
| 作者 | unclebob（fork by gyc567）|
| 依存関係 | tmux, git |

### 1.3 コアバリュー proposition

SwarmForgeのコアバリューは3つの言葉で要約できます：

- **軽量実行**：ローカルtmux環境で動作し、複雑なクラウドインフラ不要
- **設定駆動**：すべてのワークフローが設定ファイルで定義され、ハードコードされない
- **隔離協調**：各役割が隔離されたgit worktreeで動作し、干渉を回避

### 1.4 他のマルチエージェントシステムとの違い

SwarmForgeと他のマルチエージェントシステム（CrewAI、AutoGen、LangChain Agentsなど）との最大の違い：

```
┌─────────────────────────────────────────────┐
│  他のマルチエージェントシステム               │
│  - 複雑なメッセージ传递メカニズム             │
│  - 集中型コーディネーター                    │
│  - APIキーとクラウドサービスが必要            │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│  SwarmForge                                  │
│  - 軽量なtmuxセッション                      │
│  - （Handoffファイルを介した）分散協調        │
│  - ローカル実行、外部依存なし                 │
└─────────────────────────────────────────────┘
```

## 2. コア設計哲学

### 2.1 設定＝コード

SwarmForgeの最も重要な設計原則は**設定駆動**です。これは以下のように反映されています：

**宣言型ワークフロー**
- 複雑な調整コードを記述する必要がない
- `swarmforge.conf`でワークフローと役割を宣言する
- システムは設定に基づいてtmuxウィンドウとセッションを自動作成

**役割プロンプトの外部化**
- 各役割の動作は`roles/`ディレクトリ下のプロンプトで定義
- コアコードを変更せずに役割の動作を変更可能
- プロジェクト別のカスタム役割をサポート

**憲法的制約**
- `constitution.prompt`でチーム行動ガイドラインを定義
- エンジニアリング標準（engineering.prompt）を含む
- Handoffプロトコル（handoffs.prompt）を定義
- ワークフロー規則（workflow.prompt）を明示

### 2.2 隔離優先

**Worktree隔離**
- 各役割が隔離されたgit worktreeで動作
- 複数のAgentが同時に同じコードベースを変更するのを防止
- 異なるタスクブランチの並列処理をサポート

**セッション隔離**
- 各役割が独立したtmuxウィンドウを所有
- 各Agentの状態をリアルタイムで監視可能
- 1つのAgentの問題が他のAgentに影響しない

### 2.3 Handoffプロトコル

**構造化タスク伝達**
- Agent間でHandoffファイルを介してタスクを伝達
- 現在状態、完了した作業、次のステップを含む
- Agent間でのスムーズなタスク伝達を保証

**コンテキスト保持**
- 各Handoffに十分なコンテキスト情報を含む
- 受信側がすぐに作業を引継ぎ可能
- 重複作業と状態喪失を削減

## 3. 3種類のプリセットワークフローの詳細

### 3.1 two-pack：高速バックエンドタスク

**最適なシナリオ**：シンプルから中程度の複雑なバックエンドタスク

**役割設定**：
| 役割 | 責務 |
|------|------|
| coder | コード記述と実装 |
| cleaner | コードクリーンアップと最適化 |

**ワークフロー**：
```
ユーザーがtwo-packを起動
    ↓
coderが隔離worktreeでコードを記述
    ↓
coderが完了、Handoffファイルを生成
    ↓
cleanerがHandoffを読み込み、コードをクリーンアップ
    ↓
cleanerが完了、最終コードを出力
```

**特徴**：
- 最小設定、快速タスクに最適
- 2つのAgentがそれぞれの責務に集中
- 小規模プロジェクトや単一機能開発に適合

### 3.2 four-pack：中程度複雑なプロジェクト

**最適なシナリオ**：中程度複雑なフルスタックプロジェクト

**役割設定**：
| 役割 | 責務 |
|------|------|
| specifier | 要件分析与规格定義 |
| coder | コード記述と実装 |
| refactorer | コードリファクタリングと最適化 |
| architect | アーキテクチャ設計と決定 |

**ワークフロー**：
```
ユーザーがfour-packを起動
    ↓
specifierが要件を分析し、仕様書を生成
    ↓
architectが仕様に基づいてアーキテクチャを設計
    ↓
coderがアーキテクチャに従ってコードを記述
    ↓
refactorerがコードをリファクタリングと最適化
    ↓
最終コードベースを出力
```

**特徴**：
- 完全な開発ライフサイクルをカバーする4つの役割
- 要件からアーキテクチャ、実装、最適化まで
- ある程度の計画が必要な中小規模プロジェクトに適合

### 3.3 six-pack：大规模プロジェクト

**最適なシナリオ**：厳格な品質保証が必要な大規模複雑なプロジェクト

**役割設定**：
| 役割 | 責務 |
|------|------|
| specifier | 要件分析与详细仕様定義 |
| coder | コード記述と実装 |
| cleaner | コードクリーンアップと最適化 |
| architect | アーキテクチャ設計と決定 |
| hardener | セキュリティ強化とパフォーマンス最適化 |
| QA | 品質保証とテスト |

**ワークフロー**：
```
ユーザーがsix-packを起動
    ↓
specifierが要件を分析し、詳細仕様を生成
    ↓
architectがシステムアーキテクチャを設計
    ↓
coderが機能コードを実装
    ↓
cleanerがコードスタイルをクリーンアップ
    ↓
hardenerがセキュリティとパフォーマンス強化を実行
    ↓
QAが包括的なテストと品質チェックを実施
    ↓
本番グレードのコードベースを出力
```

**特徴**：
- 完全な開発ライフサイクルと品質保証をカバーする6つの役割
- セキュリティとパフォーマンス強化段階を含む
- 大規模プロジェクトや高信頼性が必要なシナリオに適合

## 4. 工作メカニズムの詳細

### 4.1 Worktree隔離

**Git Worktree の基礎**

Git Worktreeは同一リポジトリに複数の作業ディレクトリを許可します。SwarmForgeは各役割に隔離された作業ディレクトリを作成するためにこの機能を利用します：

```bash
# 現在のworktreeリストを表示
git worktree list

# 新 역할のためにworktreeを作成
git worktree add ../worktree-coder coder-branch
```

**SwarmForge での Worktree の応用**

```
メインリポジトリ (main)
├── worktree-specifier/  (specifier の作業ディレクトリ)
├── worktree-coder/      (coder の作業ディレクトリ)
├── worktree-architect/  (architect の作業ディレクトリ)
└── ...
```

各worktreeが異なるブランチに対応することで：
- Agentがメインブランチに影響を与えずに作業可能
- 複数のブランチで同時に作業可能
- マージまたはPRを通じて作業をメインブランチに統合可能

### 4.2 tmuxセッション管理

**tmux セッション構造**

SwarmForgeはtmuxの階層構造を使用してAgentセッションを整理します：

```
tmux session: swarmforge
├── window: specifier
├── window: coder
├── window: refactorer
├── window: architect
├── window: cleaner
└── window: QA
```

**ウィンドウ管理**
- 各Agentが隔離されたウィンドウで実行
- ウィンドウを切り替えてAgentの状態を監視可能
- 複数のAgent出力を分割表示でビューをサポート

**セッション制御**
```bash
# すべてのセッションをリスト表示
tmux list-sessions

# 指定セッションに接続
tmux attach -t swarmforge

# ウィンドウ間を切り替え
Ctrl+b w  # すべてのウィンドウをリスト表示
Ctrl+b n  # 次のウィンドウ
Ctrl+b p  # 前のウィンドウ
```

### 4.3 Handoffプロトコル

**Handoff ファイル構造**

Handoffファイルは以下の内容を含む構造化テキストファイルです：

```
=== HANDOFF ===
FROM: coder
TO: refactorer
TASK: ユーザー認証モジュールの完了
STATUS: in_progress

完了済み:
- ユーザーログインAPI
- パスワード暗号化保存
- JWT Token生成

進行中:
- ユーザー登録API（80%完了）

未完了:
- メール認証機能
- パスワードリセット機能

コンテキスト:
- Expressフレームワークを使用
- データベース: PostgreSQL
- API接頭辞: /api/v1/auth
===
```

**Handoff フロー**

```
Agent A が作業
    ↓
Agent A がHandoffファイルを生成
    ↓
Agent B がHandoffファイルを読み込み
    ↓
Agent B が作業を継続
```

**主要な設計原則**
- **原子性**：各Handoffが完全なタスクコンテキストを含む
- **追跡可能性**：完了済みおよび未完了の作業をすべて記録
- **独立性**：受信側が送信側とは独立して継続可能

## 5. 憲法構造

### 5.1 憲法エントリーポイント：constitution.prompt

`constitution.prompt`は宪法システム全体のエントリーポイントです：

```
これはSwarmForgeチームの憲法です。

チームメンバーは以下の条項を遵守する必要があります：
1. エンジニアリング標準 (engineering.prompt)
2. Handoffプロトコル (handoffs.prompt)
3. ワークフロー規則 (workflow.prompt)

いずれのタスクを実行する前に、憲法条項を読んで理解してください。
```

### 5.2 エンジニアリング標準：constitution/articles/engineering.prompt

コード品質とエンジニアリング基準を定義：
- コードスタイルガイドライン
- コミットメッセージフォーマット
- PR/MR作成基準
- コードレビュー基準

### 5.3 Handoffプロトコル：constitution/articles/handoffs.prompt

Agent間のタスク伝達規則を定義：
- Handoffファイルフォーマット
- 状態遷移規則
- エラー処理メカニズム

### 5.4 ワークフロー規則：constitution/articles/workflow.prompt

ワークフロー実行規則を定義：
- 各役割の責任定義
- タスク配分規則
- 完了基準

### 5.5 役割定義：roles/

`roles/`ディレクトリには各役割のプロンプトが含まれています：

```
roles/
├── specifier.prompt      # 要件分析士
├── coder.prompt          # プログラマー
├── cleaner.prompt         # コードクリーナー
├── architect.prompt       # アーキテクト
├── hardener.prompt        # セキュリティ強化専門家
└── QA.prompt             # 品質保証エンジニア
```

各役割プロンプトには以下が含まれます：
- 役割の責任説明
- 他の役割との協調方法
- 憲法条項の具体的な適用

## 6. マルチバックエンドサポート

### 6.1 サポートされているバックエンド

SwarmForgeは複数のAIバックエンドをサポートしています：

| バックエンド | 説明 |
|-------------|------|
| claude | Anthropic Claude |
| codex | OpenAI Codex |
| copilot | GitHub Copilot |
| grok | x.ai Grok |

### 6.2 設定方法

`swarmforge.conf`でバックエンドを指定：

```ini
[backend]
default = claude

[backend.claude]
model = claude-sonnet-4
api_key = ${ANTHROPIC_API_KEY}

[backend.codex]
model = gpt-4
api_key = ${OPENAI_API_KEY}
```

### 6.3 バックエンド切り替え

タスクタイプに基づいてバックエンドを切り替え可能：

```bash
# claudeバックエンドを使用
SWARM_BACKEND=claude ./swarm

# codexバックエンドを使用
SWARM_BACKEND=codex ./swarm
```

## 7. 使用例とベストプラクティス

### 7.1 クイックスタート

**ワークフローを選択して起動**：

```bash
# four-packワークフローを使用
BRANCH=four-pack
curl -L "https://github.com/unclebob/swarm-forge/archive/refs/heads/${BRANCH}.tar.gz" | tar -xz --strip-components=1
./swarm
```

**完全な起動フロー**：

```bash
# 1. SwarmForgeをクローンまたはダウンロード
BRANCH=four-pack
curl -L "https://github.com/unclebob/swarm-forge/archive/refs/heads/${BRANCH}.tar.gz" | tar -xz --strip-components=1

# 2. AIバックエンドを設定
export ANTHROPIC_API_KEY="your-api-key"

# 3. 設定ファイル（オプション）
# swarmforge.confを編集してワークフローと役割を設定

# 4. swarmを起動
./swarm
```

### 7.2 プロジェクト設定の例

新規プロジェクトの設定を作成：

```ini
# swarmforge.conf
[project]
name = my-awesome-project
description = SwarmForgeで開発するプロジェクト

[workflow]
type = four-pack

[backend]
default = claude

[backend.claude]
model = claude-sonnet-4
max_tokens = 8192

[roles.specifier]
system_prompt = あなたはユーザーにとって使いやすいデザインに注力する要件分析士です

[roles.coder]
system_prompt = TypeScriptとPythonに精通したフルスタックエンジニアです
```

### 7.3 ベストプラクティス

**1. 適切なワークフローの選択**
- 简单なタスクにはtwo-packを使用
- 中程度の複雑さにはfour-packを使用
- 大規模プロジェクトにはsix-packを使用

**2. リアルタイム監視の活用**
- `tmux attach`でセッションに接続
- `Ctrl+b w`でウィンドウを切り替え
- 各Agentの出力をリアルタイムで監視

**3. Handoffの正しい使用**
- 各Handoffに十分なコンテキストが含まれていることを確認
- Handoffファイルで完了と未完了の作業を明示的にマーク
- 重複作業を避けるため状態をタイムリーに更新

**4. 定期的なコード同期**
- Agentの作業を定期的にメインブランチにマージ
- PR/MRを使用してコードレビューを実施
- worktreeとメインブランチの同期を維持

**5. 役割のカスタマイズ**
- プロジェクトの必要性に基づいて役割プロンプトを変更
- `roles/`ディレクトリに新しい役割定義を作成
- 新たな役割が宪法条項を遵守していることを確認

### 7.4 トラブルシューティング

**一般的な問題**：

1. **tmuxセッションが起動しない**
   - tmuxがインストールされているか確認：`tmux -V`
   - セッションが存在するか確認：`tmux list-sessions`

2. **AIバックエンド接続の失敗**
   - APIキーが正しく設定されているか確認
   - ネットワーク接続を確認
   - バックエンド設定を検証

3. **Handoffファイルが有効にならない**
   - Handoffファイルのパスを確認
   - ファイル形式が正しいことを確認
   - AgentがHandoffを正しく読み込んだか検証

## 8. 重要なポイントのまとめ

### 8.1 SwarmForgeの優位性

1. **軽量設計**
   - ローカルtmux環境で動作
   - 複雑なクラウドインフラが不要
   - 極めて低いリソース消費

2. **設定駆動**
   - すべてのワークフローが設定可能
   - カスタマイズと拡張が容易
   -「設定＝コード」原則に準拠

3. **隔離協調**
   - 各役割が独立して作業
   - 相互干渉を回避
   - 並列作業をサポート

4. **構造化Handoff**
   - 明確なタスク伝達
   - 完全なコンテキスト保持
   - 強力な追跡可能性

### 8.2 ユースケース

- **小規模チーム**：高速プロトタイプ開発
- **個人開発者**：開発効率の向上
- **大規模プロジェクト**：複雑なタスクの分解協調
- **学習と実験**：マルチエージェントシステムの理解

### 8.3 局限性

- **ローカル実行の制約**：リモート協調シナリオには不向き
- **tmux依存**：ある程度のtmux使用経験が必要
- **AIバックエンドの制約**：有効なAPIキーが必要

### 8.4 今後の展望

SwarmForgeはマルチエージェントシステムへの新しいアプローチ代表了——軽量、設定駆動型、ローカルファースト。AI Agent技術の成熟に伴い、このシンプルで効果的なオーケストレーションアプローチはますます人気を得る可能性があります。

## 9. 参考リソース

- [SwarmForge GitHub リポジトリ](https://github.com/unclebob/swarm-forge)
- [tmux公式ドキュメント](https://github.com/tmux/tmux)
- [Git Worktree ドキュメント](https://git-scm.com/docs/git-worktree)

---

*この記事はTopDiggが自動的に分析・編集しています。AI Agentと開発者ツールの最新動向をお届けします。*
