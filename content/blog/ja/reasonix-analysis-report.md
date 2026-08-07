---
title: "Reasonix 徹底分析：DeepSeek ネイティブ ターミナル コーディング Agent のアーキテクチャ革命"
description: "DeepSeek のプレフィックス キャッシュを中心に構築されたターミナル コーディング Agent である Reasonix の総合分析。キャッシュ優先アーキテクチャから単一バイナリ配布、サブ Agent から ACP エディタ統合まで、その設計哲学と技術詳細を一記事で深く解説。"
date: "2026-07-31"
author: "TopDigg Research Team"
tags: ["Reasonix", "DeepSeek", "AI Agent", "ターミナルコーディング", "プレフィックスキャッシュ", "Coding Agent", "Go", "CLI", "TUI", "MCP"]
categories: ["徹底分析"]
keywords: ["Reasonix", "DeepSeek", "AI Agent", "ターミナルコーディング", "プレフィックスキャッシュ", "Coding Agent", "Go", "CLI", "TUI", "MCP", "コーディングエージェント"]
---

## 📱 精美知識カード

<div style="text-align: center; margin: 20px 0; padding: 20px; background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%); border-radius: 15px;">
  <h3 style="color: #333; margin-bottom: 15px;">🧠 Reasonix 知識カード</h3>
  <p style="color: #666; margin-bottom: 20px;">DeepSeek プレフィックス キャッシュを中心に構築されたターミナル コーディング Agent、28k+ stars、MIT オープンソース</p>
  <a href="https://github.com/esengine/DeepSeek-Reasonix" target="_blank" style="display: inline-block; background: linear-gradient(135deg, #0078D4 0%, #00B4D8 100%); color: white; padding: 12px 30px; border-radius: 25px; text-decoration: none; font-weight: bold; transition: all 0.3s ease;">
    🎯 プロジェクト リポジトリを見る →
  </a>
</div>

---

## 一、プロジェクト説明 / Project Description

### 1.1 Reasonix とは何か？

**Reasonix** は DeepSeek ネイティブのターミナル コーディング Agent（coding agent）で、長時間・低コストのコーディング セッション専用に設計されています。DeepSeek の**プレフィックス キャッシュ（prefix cache）**特性を中心に構築されており、"append-only" ループとバイト単位の安定したプレフィックス再利用により、長時間セッションの入力トークン コストを約 **1/5** に圧縮し、キャッシュ ヒット率は **90% 以上** を実現しています。

Reasonix は単なる CLI ラッパーではありません。完全な Agent フレームワークであり、以下を含みます：
- **キャッシュ優先の会話ループ**：各ラウンドの要求で前ラウンドの完全なプレフィックスを再利用
- **設定駆動アーキテクチャ**：すべてのモデル、ツール、プラグインを TOML 設定で宣言
- **マルチ エントリ サポート**：CLI/TUI、デスクトップ、ローカル ブラウザ UI、ACP エディタ拡張
- **サブ Agent システム**：explore/research/review/security-review サブ Agent を内蔵
- **MCP 互換**：stdio、SSE、streamable HTTP プロトコルをサポート

### 1.2 コア データ ハイライト

| 指標 | 数値 |
|------|------|
| GitHub Stars | 28,200+ |
| マージされた PR 数 | 2,749+ |
| 貢献者 | 97 名 |
| ライセンス | MIT |
| 実装言語 | Go（CGO-free） |
| 対応プラットフォーム | darwin/linux/windows × amd64/arm64 |
| キャッシュ ヒット率 | 90% 以上（長時間セッション） |
| トークン コスト | 約 1/5（従来の agent と比較） |
| セッション コスト | $0.043 / 18 分（deepseek-v4-flash） |
| キャッシュ ヒット率 | 95.1%（実際のセッション） |

### 1.3 なぜ Reasonix は重要なのか？

Reasonix 以前、主要な AI coding agent（Claude Code、Copilot など）には一つの根本的な問題がありました：**各会話ラウンドごとに、増大するプロンプト全体に対して全額支払う必要がある**。セッションが長くなるにつれてプロンプトは増大し、トークン コストは直線的に上昇し、最終的に持続不可能になります。

Reasonix は 3 つの重要なイノベーションでこの問題を解決します：

1. **プレフィックス キャッシュ アラインメント**：各ラウンドの要求のプレフィックス バイトが完全に一致することを保証し、DeepSeek のキャッシュ メカニズムが自動的に処理
2. **Append-only ループ**：履歴は追加のみで変更されず、プレフィックスのバイト安定性を保証
3. **単一バイナリ配布**：CGO-free クロス コンパイル、Node.js ランタイム不要、インストール即使用可能

---

## 二、詳細チュートリアル / Detailed Tutorial

### ステップ 1：Reasonix のインストール

#### 方法 A：npm 経由でインストール（推奨）

```bash
# 任意プラットフォームで、1 コマンドでインストール完了
npm i -g reasonix
```

npm は対応するプラットフォーム用のプリコンパイル済みネイティブ バイナリを自動ダウンロードし、追加の依存関係は不要です。

#### 方法 B：Homebrew 経由でインストール（macOS）

```bash
brew install esengine/reasonix/reasonix
```

#### 方法 C：ソースからビルド

```bash
git clone https://github.com/esengine/DeepSeek-Reasonix.git
cd DeepSeek-Reasonix
make build      # bin/reasonix(.exe) を生成
make cross      # dist/ にクロス コンパイル（darwin|linux|windows × amd64|arm64）
```

#### 方法 D：デスクトップ版のインストール

[公式ダウンロード ページ](https://reasonix.io/?download=desktop#start) へ行き、対応するプラットフォーム用のインストーラーをダウンロードしてください：

| プラットフォーム | インストーラー | アーキテクチャ |
|----------|----------|----------|
| macOS | Universal `.dmg` または `.zip` | Apple Silicon / Intel |
| Windows | インストーラー `.exe` またはポータブル `.zip` | x64 / ARM64 |
| Linux | `.deb` または `.tar.gz` | x64 |

**macOS 隔離警告の処理：**
公式サイトからダウンロードして `/Applications` に配置した後、開けない場合は以下を実行してください：
```bash
sudo xattr -rd com.apple.quarantine /Applications/Reasonix.app
```

### ステップ 2：Provider とモデルの設定

```bash
# インタラクティブ設定ウィザード
reasonix setup
```

設定完了後、`reasonix.toml` が自動的にプロジェクト ルートまたはユーザー ホーム ディレクトリに生成されます。設定例：

```toml
[provider]
name = "deepseek"
api_key = "sk-xxxxxxxxxxxxxxxx"
base_url = "https://api.deepseek.com"

[model]
name = "deepseek-v4-flash"

[session]
cache_enabled = true
append_only = true
```

### ステップ 3：インタラクティブ セッションの起動

```bash
# プロジェクト ディレクトリに移動してから起動
cd your-project
reasonix
```

起動後、以下のような全画面 TUI インターフェースが表示されます：

```
~/app — reasonix

◆ reasonix latest · deepseek-v4-flash · ~/app›
```

### ステップ 4：コーディング タスクの実行

セッション内で直接ニーズを入力してください：

```
› add retry with backoff to the http client
```

Reasonix は以下を実行します：
1. 現在のコードベース コンテキストを分析
2. 実装プランを計画
3. 段階的に変更を実行
4. テストを実行して検証

実際のセッション効果：
```
✓ edit internal/net/client.go +24 −3
✓ edit internal/net/client_test.go +41 −0
✓ run go test ./internal/net/ ok (0.21s)
● 2 files · cache 94.2% → 95.1%
›
cache 95.1% hit  session 18m  model deepseek-v4-flash  cost $0.043
```

### ステップ 5：Web UI の使用

```bash
# ローカル Web UI を起動
reasonix serve --auth token
```

ブラウザから Reasonix のローカル Web インターフェースにアクセスすると、以下が可能です：
- セッションのビジュアル管理
- 設定と承認の確認
- 自動更新の監視

**セキュリティに関するヒント：** tunnel またはリモート ポート経由で共有する前に、必ず `--auth token` 認証を有効にしてください。

### ステップ 6：サブ Agent（Subagents）の使用

Reasonix には複数のサブ Agent が組み込まれており、`/` コマンドで呼び出せます：

```bash
# コードベースを探索
› explore the auth module

# ある問題を調査
› research best practices for error handling in Go

# コード レビュー
› review the recent changes

# セキュリティ レビュー
› security-review the payment module
```

各サブ Agent は独立したツールと隔離された実行環境を持ちます。

### ステップ 7：プラン モード（Plan Mode）

```bash
# まず計画してから実行
› /plan implement the retry logic for the HTTP client
```

プラン モードでは、モデルにまず実装プランを立てさせ、ユーザーが確認した後に実行します。各ツール呼び出しは引き続き権限とワークスペース サンドボックスによって制御されます。

### ステップ 8：ACP エディタ統合

Reasonix は ACP（Agent Communication Protocol）互換のエディタをサポートします：

```bash
# ACP バックエンドを起動
reasonix acp
```

その後、エディタで Reasonix 拡張を選択します：
- **VS Code：** [拡張をインストール](https://marketplace.visualstudio.com/items?itemName=SivanLiu.reasonix-agent)
- **VSCodium / Eclipse Theia：** [Open VSX からインストール](https://open-vsx.org/extension/SivanLiu/reasonix-agent)

### ステップ 9：プロジェクトの初期化

インタラクティブ セッションで `/init` を実行すると、Reasonix は自動的にプロジェクト指示ファイル（`.reasonix/commands/`）を生成し、モデルがプロジェクト構造とコーディング規約を理解するのを助けます。

### ステップ 10：セッション管理と復元

```bash
# セッション状態を確認
reasonix status

# 以前のセッションを復元
reasonix resume

# チェックポイントを表示
reasonix checkpoints
```

---

## 三、コア イノベーションと技術詳細分析 / Core Innovations

### 3.1 キャッシュ優先ループ（Cache-First Loop）

これは Reasonix の中核となるイノベーションです。従来の agent は各会話ラウンドごとに完全な会話履歴を送信するため、以下の問題が発生します：
- プロンプトが継続的に増大
- 各ラウンドが完全なプロンプトに基づいて課金
- セッションが長いほど高額に

Reasonix のソリューションは、各ラウンドの要求のプレフィックスを**バイト単位で完全に一致させる**ことです：

```
Turn 1: [system prompt] + [user query 1]     → すべて計算
Turn 2: [system prompt] + [user query 1]     → キャッシュ ヒット、新規のみ計算
Turn 3: [system prompt] + [user query 1]     → キャッシュ ヒット、新規のみ計算
Turn 4: [system prompt] + [user query 1]     → キャッシュ ヒット、新規のみ計算
```

**効果：**
- 長時間セッションのキャッシュ ヒット率 **90% 以上**
- 入力トークン コストが約 **1/5** に低下
- セッションが長いほど、各ラウンドが安くなる（高くなるのではなく）

### 3.2 Append-Only 履歴管理

Reasonix の会話履歴は **append-only** モードを採用しています：
- 既存メッセージを絶対に変更しない
- 末尾にのみ新しいメッセージを追加
- プレフィックスのバイト単位の安定性を保証

この設計は一見シンプルに見えますが、キャッシュ アラインメントを実現するための鍵です。履歴メッセージの変更を許可すると、プレフィックスのバイト オフセットが変化し、キャッシュが無効化されます。

### 3.3 単一バイナリ アーキテクチャ（Single Go Binary）

Reasonix は Go で記述され、`CGO_ENABLED=0` で単一の静的バイナリにコンパイルされます：
- Node.js ランタイム依存関係なし
- 6 つのターゲット プラットフォームへのクロス コンパイル
- 唯一の外部依存は TOML 解析ライブラリ
- インストール即使用可能、環境設定不要

```bash
# 1 コマンドでインストール、全プラットフォーム対応
npm i -g reasonix
```

### 3.4 MCP ネイティブ サポート

Reasonix は MCP（Model Context Protocol）に対する第一級サポートを提供します：
- **stdio**：標準入出力を介した通信
- **SSE**：サーバー送信イベント
- **streamable HTTP**：ストリーミング可能な HTTP

外部 MCP サーバーのツールはプレフィックス マージにより統一ツール レジストリに統合され、使用時にはプレフィックスを指定するだけでソースを区別できます。

### 3.5 設定駆動アーキテクチャ

Reasonix はコード駆動ではなく設定駆動を採用しています：
- **Provider**：`reasonix.toml` で宣言
- **モデル**：任意の OpenAI 互換エンドポイントが 1 つの設定
- **ツール**：組み込みツールはコンパイル時に自己登録、外部ツールは MCP 経由で動的ロード
- **プラグイン**：Markdown スキル スクリプトと隔離ツール

この設計により、新しいモデルや新しいツールの追加にコードの変更が不要で、設定を更新するだけで済みます。

### 3.6 サブ Agent システム

Reasonix には複数の専門サブ Agent が組み込まれています：

| サブ Agent | 用途 |
|----------|------|
| **explore** | コードベース構造の探索 |
| **research** | 技術方案的調査 |
| **review** | コード レビュー |
| **security-review** | セキュリティ レビュー |

各サブ Agent は独立したツールセットと実行環境を持ち、Markdown スキル スクリプトで定義されます。

---

## 四、要約された見解 / Key Viewpoints and Conclusions

### 見解一：プレフィックス キャッシュは Coding Agent コスト最適化の鍵

Reasonix の中核的洞察は次のとおり：**AI coding agent のコスト問題は本質的にキャッシュ問題である**。従来の agent は各ラウンドで完全な会話履歴を送信するため、同じコンテンツが繰り返し計算・課金されます。DeepSeek のプレフィックス キャッシュをアラインメントすることで、Reasonix は重複計算のコストを最小限に抑えます。

**中核的結論**：プレフィックス キャッシュ アラインメントは、coding agent が経済的持続可能性を実現するための重要な技術的手段であり、Reasonix は現在この方向の最適実践です。

### 見解二：「常駐実行のために設計」(Built to be left running)

Reasonix の設計哲学はセッションの永続性を強調します：
- セッションは決して冷却されない
- キャッシュは常に温かさを保つ
- タスクをキューに入れたり、diff を確認したり、いつでも復元可能

これは従来の agent の「使ったら終わり」モデルとは対照的です。Reasonix は、良い coding agent はローカル開発環境のように——常時実行され、必要なときにいつでも使えるべきだと考えています。

**中核的結論**：coding agent の使用パターンは「オンデマンド起動」から「常駐実行」に移行すべきであり、これによりキャッシュ最適化のメリットを十分に発揮できます。

### 見解三：単一バイナリ アーキテクチャが配布と使用の摩擦を軽減

Reasonix の Go で記述された単一バイナリ アーキテクチャは、AI agent 配布の中核的な課題を解決します：
- Node.js ランタイムのインストール不要
- 依存関係の管理不要
- クロス プラットフォーム ワンクリック インストール
- 高速起動、低リソース消費

**中核的結論**：AI agent の配布は従来の CLI ツールのようにシンプルでるべきである——単一バイナリ、クロス プラットフォーム、依存関係なし。Reasonix はこれが実現可能であることを証明しました。

### 見解四：設定駆動はコード駆動より優れている

Reasonix の設定駆動アーキテクチャは次を実現します：
- モデル切り替えは設定変更のみ
- 新しいツールの追加は MCP サーバー設定のみ
- プラグインは Markdown スクリプトで定義

この設計によりメンテナンス コストが削減され、柔軟性が向上します。ユーザーはコード更新を待たずに新しいモデルや新しいツールを使用できます。

**中核的結論**：AI agent フレームワークは、モデル、ツール、プラグインの設定をコア ロジックから分離すべきであり、コードではなく設定によって動作をカスタマイズするべきです。

### 見解五：サブ Agent モデルがタスク専門性を向上

Reasonix のサブ Agent システムは、異なるタイプのタスクを専門 agent に割り当てます：
- explore サブ Agent はコードベース探索に特化
- review サブ Agent はコード レビューに特化
- security-review サブ Agent はセキュリティ分析に特化

各サブ Agent は独立したツールセットと実行環境を持ち、汎用 agent の専門タスクにおける不足を回避します。

**中核的結論**：サブ Agent モデルは AI agent の専門能力を向上させる効果的な方法であり、単一の汎用 agent よりも複雑な開発ワークフローにより適しています。

### 見解六：コストの透明性はユーザー信頼の基盤

Reasonix はセッション インターフェースに以下をリアルタイムで表示します：
- キャッシュ ヒット率
- セッション時間
- モデル名
- 現在のコスト

この透明なコスト表示により、ユーザーは以下が可能になります：
- 各操作の費用を把握
- 使用習慣を最適化
- システムへの信頼を構築

**中核的結論**：AI agent はローカル ツールのように透過的であるべきである——ユーザーは各操作のコストとシステム状態を明確に把握できるべきです。

### 見解七：オープンソース コミュニティがイノベーションを推進

Reasonix は 97 名の貢献者と 2,749 個のマージされた PR を持ち、コミュニティ貢献には以下が含まれます：
- 新機能の開発
- バグ修正
- ドキュメント作成
- プラットフォーム適応

MIT ライセンスとオープン開発モデルにより、大量のコミュニティ参加を引き付け、プロジェクトの急速な反復を推進しています。

**中核的結論**：オープンソース コミュニティは AI agent イノベーションの重要な推進力であり、オープン開発モデルは製品の反復と機能の充実を加速できます。

---

## 五、設計哲学 / Design Philosophy

### 5.1 「キャッシュ優先」(Cache-First) 設計哲学

Reasonix の中核的設計哲学は **「キャッシュ優先」** であり、すべての設計決定はキャッシュ ヒット率の最大化を中心に展開されます：

1. **Append-only 履歴**：プレフィックスのバイト単位の安定性を保証
2. **安定した環境注入**：起動時に固定のシステム プロンプトを注入
3. **ツール出力のトリミング**：古いツール出力は要約前に切り捨て/剪定
4. **バイト単位のアラインメント**：プレフィックスの各バイトがキャッシュ キーと正確に一致

この「キャッシュ優先」哲学は次のように考えます：**AI agent の効率はモデルの知能度に依存するのではなく、システム アーキテクチャがインフラのキャッシュ能力を十分に活用できるかどうか**。

### 5.2 「常駐実行のために設計」(Built to be Left Running)

Reasonix のスローガン "Engineered around DeepSeek's prefix cache — leave it running" はその中核的設計哲学を表現しています：

- **セッションの永続化**：セッションは中断されず、キャッシュは冷却されない
- **状態の保持**：コードベース マッピングは一度だけ構築され、温かいプレフィックスに常駐
- **タスク キュー**：タスクをキューに入れたり、いつでも復元可能

これは従来の agent の「リクエスト - レスポンス」モデルとは対照的です。Reasonix は、coding agent はローカル サービスのように——常時実行され、いつでも利用できるべきだと考えています。

### 5.3 ミニマリズム（Minimalism）

Reasonix は究極のシンプルさを追求します：
- **単一バイナリ**：1 ファイル、依存関係なし
- **設定駆動**：コード変更なしでカスタマイズ可能
- **ゼロ摩擦配布**：`npm i -g` 1 コマンドでインストール
- **CGO-free**：C 依存関係なし、クロス プラットフォーム コンパイルが簡単

このミニマリズム哲学は次のように考えます：**良いツールはコマンドライン ツールのようにシンプルで、信頼性が高く、手間がかからないべきである**。

### 5.4 「単一エンジン、マルチ エントリ」(One Engine, Many Surfaces)

Reasonix のアーキテクチャの中核は**同一のローカル エンジン**であり、異なるエントリを通じて使用されます：
- CLI/TUI：ターミナル ネイティブ エントリ
- デスクトップ：グラフィカル インターフェース
- Web UI：`reasonix serve` でローカル ブラウザ インターフェースを起動
- ACP：エディタ拡張統合

すべてのエントリが同一のエンジン、同一の設定、同一のキャッシュ戦略を共有します。この設計により、ユーザーがどのインタラクション方法を選択しても、ユーザー エクスペリエンスの一貫性が保証されます。

### 5.5 セキュリティと権限の内蔵

Reasonix は設計の最初からセキュリティと権限を中核的制約として組み込んでいます：
- **ワークスペース サンドボックス**：各ツール呼び出しがサンドボックスの制限を受ける
- **権限制御**：機密操作にはユーザーの確認が必要
- **プラン モード**：`/plan` はモデルにまず計画してから実行を要求
- **ツール コントラクト**：組み込みツール スキーマにはドキュメントとリグレッション テスト保護がある

この「セキュリティ内蔵」(security by design) の理念は次のように考えます：**AI agent のセキュリティは事後修正ではなく、アーキテクチャ レベルで保証されるべきである**。

### 5.6 オープン性と組み合わせ可能性

Reasonix の設計はオープン性と組み合わせ可能性を強調します：
- **MCP 互換**：すべての MCP プロトコル ツール サーバーをサポート
- **OpenAI 互換**：任意の OpenAI 互換エンドポイントが 1 つの設定
- **MIT ライセンス**：完全にオープン、使用制限なし
- **コミュニティ駆動**：97 名の貢献者、2,749 個のマージされた PR

このオープン哲学は次のように考えます：**AI agent の未来はエコシステムの相互運用性にあり、閉鎖的な独自システムではない**。

---

## 六、将来の AI Agent 技術への示唆 / Implications for Future AI Agents

### 6.1 キャッシュ最適化が Agent インフラの標準コンポーネントになる

Reasonix は、プレフィックス キャッシュ最適化が 5 倍のコスト削減をもたらすことを証明しました。未来：
- より多くの agent フレームワークがキャッシュ最適化を統合
- キャッシュ ヒット率が agent 効率を測定する中核指標になる
- インフラストラクチャ層（API ゲートウェイなど）がキャッシュ サポートを提供

### 6.2 「常駐 Agent」モデルが「オンデマンド起動」に取って代わる

Reasonix の「常駐実行」モデルは AI agent の別の使用パラダイムを示しています：
- Agent はローカル サービスのように常時実行
- ユーザーはいつでもタスクを送信でき、起動を待つ必要なし
- キャッシュが継続的に温かい状態を維持し、応答がより高速

このモデルは次のような継続的な開発シナリオに特に適しています：
- 長期保守プロジェクト
- 継続的インテグレーション / 継続的デプロイ パイプライン
- 7×24 時間開発チーム

### 6.3 設定駆動がコード駆動に取って代わる

Reasonix の設定駆動アーキテクチャは AI agent カスタマイズの未来の方向性を示しています：
- ユーザーはコードではなく設定によって agent 動作をカスタマイズ
- モデル切り替え、ツール追加、プラグイン管理はすべて設定で完了
- 使用门槛が下がり、柔軟性が向上

### 6.4 サブ Agent モデルがタスク専門性を向上

Reasonix のサブ Agent システムは、専門化によって agent 能力を向上させる方法を示しています：
- 異なるタスク タイプが異なるサブ Agent を使用
- 各サブ Agent は独立したツールセットとコンテキストを持つ
- 汎用 agent の専門タスクにおける不足を回避

### 6.5 コスト透明性が AI Agent の標準になる

Reasonix のリアルタイム コスト表示機能は、AI agent 透明化の重要性を示しています：
- ユーザーは各操作のコストを明確に把握すべき
- コスト データはリアルタイムで表示されるべき
- コスト最適化は agent 設計の中核目標の 1 つになるべき

---

## 七、開発者への実践的アドバイス / Practical Advice for Developers

### 推奨ツールチェーン

1. **Reasonix**：コア ターミナル コーディング Agent
2. **DeepSeek API**：deepseek-v4-flash モデルの使用を推奨
3. **VS Code 拡張**：エディタ統合
4. **ACP 互換エディタ**：`reasonix acp` 経由で接続
5. **MCP サーバー**：ツール能力を拡張

### 入門アドバイス

1. **まず CLI をインストール**：`npm i -g reasonix` でターミナル インタラクションを体験
2. **Provider を設定**：`reasonix setup` で DeepSeek API Key を設定
3. **セッションを開始**：プロジェクト ディレクトリで `reasonix` を実行
4. **サブ Agent を試す**：`/explore`、`/review` などのコマンドを使用
5. **Web UI を有効化**：`reasonix serve --auth token` を実行
6. **エディタを接続**：VS Code 拡張をインストールしてより良い開発体験を得る

### コスト管理アドバイス

1. **セッションを常駐させる**：頻繁な再起動を避け、キャッシュ ヒット率を最大化
2. **`/plan` モードを使用**：まず計画してから実行し、不要なツール呼び出しを減らす
3. **サブ Agent を適切に使用**：専門タスクには専門サブ Agent を使用
4. **キャッシュ ヒット率を監視**：セッション インターフェースがキャッシュ状態をリアルタイムで表示
5. **適切なモデルを選択**：deepseek-v4-flash はコストとパフォーマンスのバランスが良い

### 上級使用方法

1. **デュアル モデル連携**：executor + planner の 2 つのモデルを設定し、それぞれ独立したキャッシュ
2. **カスタム サブ Agent**：Markdown スキル スクリプトで専門サブ Agent を定義
3. **MCP 統合**：外部 MCP サーバーに接続してツール能力を拡張
4. **ACP 統合**：ACP 互換エディタに接続してネイティブ開発体験を得る

---

## 八、参考文献 / References

- [Reasonix 公式サイト](https://reasonix.io/)
- [GitHub リポジトリ](https://github.com/esengine/DeepSeek-Reasonix)
- [中国語 README](https://github.com/esengine/DeepSeek-Reasonix/blob/main-v2/README.zh-CN.md)
- [npm パッケージ](https://www.npmjs.com/package/reasonix)
- [DeepSeek API](https://platform.deepseek.com)
- [VS Code 拡張](https://marketplace.visualstudio.com/items?itemName=SivanLiu.reasonix-agent)
- [Open VSX Registry](https://open-vsx.org/extension/SivanLiu/reasonix-agent)
- [Discord コミュニティ](https://discord.gg/XF78rEME2D)
- [ドキュメント センター](https://reasonix.io/docs/)

---

*本文は Reasonix 公式ドキュメント、GitHub README（英語版および中国語版）、公式サイトコンテンツに基づいて翻訳、編集、分析されたものです。*