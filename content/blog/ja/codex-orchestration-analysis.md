---
title: "Codex-Orchestration 徹底解説：1つのプラグインで Fable 5・Opus 5・Kimi K3 を Codex に組み込み、各 AI に異なる役割を担わせて協業開発を実現する方法"
description: "Cjbuilds/Codex-Orchestration（580+ stars）の包括的分析。このオープンソースプラグインは Codex タスクに Planner・Advisor・Designer・Executor の4つの役割を導入し、Claude Fable 5 で計画、Opus 5 でレビュー、Kimi K3 でデザイン、GPT-5.6 Luna で実装を行う。3つの核心問題、インストールチュートリアル、ワークフロー図、設計哲学、production-readiness audit から抽出したセキュリティ境界を解説。"
date: "2026-08-08"
author: "TopDigg Research Team"
tags: ["Codex-Orchestration", "Codex", "OpenAI", "Multi-Agent", "Claude Fable 5", "Claude Opus 5", "Kimi K3", "OpenRouter", "MCP", "Model Routing", "AI Agent", "Python", "Role-Based Agent"]
categories: ["深度解析"]
keywords: ["Codex-Orchestration", "Codex マルチモデル協業", "Claude Fable 5", "Claude Opus 5", "Kimi K3", "OpenRouter", "MCP プラグイン", "モデルルーティング", "Planner Advisor Designer Executor", "外部モデル", "Gate 0", "クレデンシャルセキュリティ", "マルチエージェント協業", "AI コーディングアシスタント", "OpenAI Codex"]
---

# Codex-Orchestration 徹底解説：1つのプラグインで Fable 5・Opus 5・Kimi K3 を Codex に組み込み、各 AI に異なる役割を担わせて協業開発を実現する方法

> **核心的考え方：** 「より強力な単一のモデルが必要ではなく、より良いコラボレーション・フレームワークが必要です。」 Codex-Orchestration は「異なる AI が異なる役割を果たす」という概念を極めました — Planner には Fable 5、Advisor には Opus 5、Designer には Kimi K3、Executor には GPT-5.6 Luna が担います。Codex は依然として責任者ですが、今度は適切な AI が適切な仕事をします。

---

## 1. これは何ですか？（小学生でもわかる解説）

プログラミングするチームプロジェクトを想像してください。しかし、そのチームは人ではなく AI アシスタントです。

通常、あなたは1人の AI アシスタントだけを雇います。それがプロジェクトマネージャー、デザイナー、プログラマー、QA テスターをすべて兼任しなければなりません。結果はどうでしょうか？ プロジェクトマネージャーがあまり考えずにコードを書き始めるかもしれません。デザイナーの成果物があまり美しくないかもしれません。QA は作業中に忘れてしまうかもしれません。

Codex-Orchestration は Codex（OpenAI の AI コーディングアシスタント）用の **スマートなチーム管理プラグイン** です。あなたの AI アシスタントを **置き換える** のではなく、 **より多くの異なった得意分野の AI アシスタントを雇える** ようにします：

- **Planner**（計画者） — 要望を詳細な実行計画に変換します。プロジェクトマネージャーがロードマップを描くようなものです。
- **Advisor**（アドバイザー） — 計画をレビューし、見落としや潜在的リスクを発見します。コードを書く前に問題を捉える品質マネージャーのようなものです。
- **Designer**（デザイナー） — UI/UX デザインを作成し、製品が美しく使いやすいことを保証します。
- **Executor**（実行者） — 承認された計画をコードで実装します。

**最も印象的なのは：** 各「アシスタント」は **異なる会社の異なるモデル** であることができます：

- Planner → **Claude Fable 5**（計画が得意）
- Advisor → **Claude Opus 5**（レビューが得意）
- Designer → **Kimi K3**（1,048,576 トークンのコンテキスト）
- Executor → **GPT-5.6 Luna**（実装が速い）

そしてあなたが Codex で元々使用している AI は **CEO** のままです — いつどのサブアシスタントを呼ぶべきかを決定し、すべての結果を集め、最終結果に署名します。

---

## 2. プロジェクト概要

### 2.1 基本情報

| 属性 | 詳細 |
|------|------|
| **名称** | Codex-Orchestration |
| **作者/メンテナー** | Cjbuilds (GitHub Organization) |
| **リポジトリ** | [https://github.com/Cjbuilds/Codex-Orchestration](https://github.com/Cjbuilds/Codex-Orchestration) |
| **スター数** | 582+（2026年7月時点） |
| **フォーク数** | 59+ |
| **言語** | Python 3.11+ |
| **ライセンス** | MIT |
| **作成日** | 2026年7月10日 |
| **現在のバージョン** | 0.9.3（Unreleased） |

### 2.2 解決する問題

#### 問題 1: 1つのモデルではすべてを上手くやれない

Codex に複雑なタスクを依頼すると、以下のすべてを同時に行う必要があります：

1. 要件を理解 → 2. ソリューションを計画 → 3. リスクをレビュー → 4. コードを書く → 5. テスト・検証

単一のモデルは各段階で「及第点」程度です。GPT-5.6 Sol は素晴らしい計画性を持つかもしれませんが、レビューでエッジケースを見逃すかもしれません。Fable 5 はレビューが得意かもしれませんが、実装は最速ではありません。

#### 問題 2: モデル選択が ChatGPT/OpenAI にロックされる

Codex のネイティブインターフェースでは、ChatGPT/OpenAI プラットフォームに登録されているモデルしか選択できません。Anthropic の Claude や OpenRouter の Kimi K3 のような「外部モデル」を Codex のワークフローに組み込むことは通常できません。

#### 問題 3: 独立レビューの仕組みがない

マルチモデル協業で最も危険なのは **自己レビュー** — 計画者が自分の計画をレビューする。Codex-Orchestration は **Planner と Advisor が異なるモデルでなければならない** を厳密に強制し、常に独立レビューを保証します。

#### 問題 4: 資格情報のセキュリティ

API キーをチャットに貼り付けることや設定ファイルに書き込むことは非常に危険です。Codex-Orchestration は **「警備システム」** を設計しました — 資格情報は決して Codex のチャットログやコードリポジトリに現れません。

### 2.3 コア機能

| 機能 | 説明 |
|------|------|
| **役割ルーティング** | Planner、Advisor、Designer、Executor を異なるモデルにマッピング |
| **外部モデルサポート** | OpenRouter 経由で Kimi K3 などの外部モデルを Codex に導入 |
| **Claude 統合** | Claude Fable 5 / Opus 5 を Planner または Advisor として接続 |
| **安全な資格情報管理** | OS の credential store を使用 — チャットやコードベースにキーを保存しない |
| **プレビュー優先** | すべての操作はプレビュー → 適用の順序で行われる — 誤操作を防止 |
| **ルーティング修復** | ルーティング設定が乱れた場合にのみ修復可能 |
| **プラグイン自動更新** | `$codex-orchestration:codex-orchestration --update` |

---

## 3. コアコンセプト

### 3.1 4つの役割システム

Codex-Orchestration は Codex タスクに 4 つの特殊角色を導入し、各モデルに開発ライフサイクルの 1 フェーズずつを専念させます：

#### 🎯 Planner（計画者）
- **責務**：ユーザーの要望を詳細な実行計画に変換する
- **ワークフロー**：要望を受信 → 計画を作成 → Advisor のフィードバックを受信 → 計画を改善
- **任意**：省略した場合、現在の Codex モデルが Planner となる
- **例モデル**：Claude Fable 5、GPT-5.6 Sol

#### 🔍 Advisor（アドバイザー/レビューア）
- **責務**：計画に欠陥を発見し、リスクや技術的な落とし穴を指摘する
- **ワークフロー**：計画を受信 → 問題を特定 → `PLAN_APPROVED` または `PLAN_REVISE` を返す
- **任意**：省略した場合、レビュー段階は行われない
- **例モデル**：Claude Fable 5、Claude Opus 5、GPT-5.6 Sol
- **制限**：最大 8 回のレビュー — 承認されない場合は実行を停止

#### 🎨 Designer（デザイナー）
- **責務**：承認された計画をデザインアセット（UI/UX、インタラクションデザイン、情報アーキテクチャ）に変換する
- **ワークフロー**：計画を受信 → デザインファイルを作成 → Executor に渡す
- **任意**：省略した場合、デザイン段階は行われない
- **例モデル**：GPT-5.6 Terra、Kimi K3（外部モデル）

#### ⚙️ Executor（実行者）
- **責務**：承認された計画をコードで実装する
- **ワークフロー**：計画 + デザインを受信 → 実装 → 納品
- **必須**：常に指定する必要がある
- **例モデル**：GPT-5.6 Luna

### 3.2 ワークフロー

```text
                         YOUR TASK
                             |
                             v
                  CODEX COORDINATES THE WORK
                             |
                             v
               PLANNER CREATES THE FIRST PLAN
               Fable 5, another model, or Codex
                             |
                             v
                    ADVISOR REVIEWS IT
                       finds real gaps
                             |
                   needs work? -- yes --+
                             |            |
                            no            v
                             |      PLANNER IMPROVES IT
                             |            |
                             +<-----------+
                             |
                       PLAN APPROVED
                             |
                             v
                DESIGNER SHAPES THE EXPERIENCE
                (optional design handoff)
                             |
                             v
                  EXECUTORS IMPLEMENT IT
                             |
                             v
                    CODEX TESTS & DELIVERS
```

> **重要なルール**：Planner と Advisor は **異なるモデルでなければなりません**。この原則により「独立レビュー」が保証されます。

### 3.3 設計哲学

#### 哲学 1: Codex は常に責任者である

> "The model selected for the Codex task remains in charge."

Codex-Orchestration は **Codex を置き換えることは決してありません**。Codex のワークフローに他のモデルを「サブアシスタント」としてだけ導入します。Codex は依然として以下を担う責任者です：

- タスクをどのように分解するかを決定する
- いつ各サブアシスタントを呼ぶべきかを決定する
- すべての結果を収集する
- 最終的な検証と納品を行う

#### 哲学 2: プレビュー優先、フェイルクローズド

すべての操作は「プレビュー → 確認 → 適用」の流れに従います：

```bash
# プレビュー（設定を変更しません）
python3 configure_native_routing.py --codex-bin <path> --status

# 適用
python3 configure_native_routing.py --codex-bin <path> --status --require-effective
```

チェックに失敗した場合、システムは **即座に停止** し、続行しません。この「フェイルクローズド」（fail-closed）設計により、セキュリティ境界が偶然破られることを防ぎます。

#### 哲学 3: 資格情報は決して保存されない

> "Never paste an API key into Codex chat. The repository, provider TOML, registry, journal, logs, and tests store no key."

このプロジェクトは非常に厳しい安全原則を掲げています：**API キーは決してどこにも表示されません**。資格情報の取扱方法は以下の通りです：

1. **準備段階**：信頼できるターミナルで隠されたローカルプロンプトを実行
2. **保存先**：OS の credential store（macOS Keychain / Linux Secret Service / Windows Credential Manager）
3. **取得タイミング**：API 呼び出しが必要な時のみ、credential store から読み取り
4. **禁止対象**：チャットログ、設定ファイル、ソースコード、Git、ログ、テスト、レジストリ — すべてキーを保存してはならない

#### 哲学 4: ルーティングはポリシーによってガイドされるものであり、エンジンによって強制されるものではない

> "Same-provider routing could be mistaken for an engine-enforced executor selector."

ルーティングは **ポリシーによってガイドされる**（policy-guided）ものであり、**エンジンによって強制される**（engine-enforced）ものではありません。これは以下を意味します：

- Codex は依然として委任しないことを選択できる
- `model` パラメータは「提案」されたルートであり、強制ではない
- ルーティングが失敗した場合、Codex はルートモデルでフォールバックする

#### 哲学 5: 最小特権の原則

各役割は明確な権限境界を持ちます：

- **Planner**：計画のみ可能；コードの編集は不可
- **Advisor**：計画のレビューのみ可能；実行や編集は不可
- **Designer**：設計アセットの編集のみ可能；実装コードの変更は不可
- **Executor**：承認された計画の実装のみ可能；他の役割に干渉しない
- **Claude subprocess**：no-tools, no-persistence, minimal environment

---

## 4. 主要な知見と結論

### 4.1 production-readiness audit から学ぶ 5 つの教訓

Codex-Orchestration は 2026 年 7 月 12 日に正式な **production-readiness audit** を実施しました。監査で発見された問題と修正内容：

| 等級 | 元の問題 | 解決策 |
|------|----------|--------|
| **高** | README が内部ルーティングの詳細から始まり、一般ユーザーには理解しにくい | プレーンテキストで「これは何ですか」、「なぜ必要ですか」、「どのようにインストールしますか」を先頭に配置 |
| **高** | Fable 5 は独立して開発されており、advisor ワークフローを保証できない | root-directed Fable ブリッジを統合し、ログインチェックと fail-closed レビューを追加 |
| **高** | `main` 分岐が変更可能で、PR レビュープロセスがない | PR 必須、status checks 必須、admin enforcement、force-push ブロック |
| **高** | 同じプロバイダー内のルーティングが engine-enforced executor selector と誤解される可能性 | policy-guided routing として説明し、4つの明確な状態を定義: config / effective / accepted / confirmed |
| **中** | 復元状態の永続化失敗時に rollback エラーを無視していた | rollback ステータスを検証し、管理対象フィールドが永続される可能性を報告 |

> **結論**：このプロジェクトは初期段階で「複雑なルーティング技術を安全かつ使いやすくする方法」という難問に直面し、厳密な監査と反復によって解決しました。

### 4.2 3つのルーティング方法

| 方法 | 用途 | 例 | セキュリティレベル |
|--------|------|------|-------------|
| **同じプロバイダーの直接ルーティング** | 同じプロバイダー内でモデルを切り替える | GPT-5.6 Sol → Luna | 標準（App Server config） |
| **Claude サブスクリプション** | Fable 5 / Opus 5 を Planner または Advisor として使用 | Fable 5 High を Planner | 高（sealed bridge） |
| **外部モデル** | OpenRouter などでサポートされているモデル | Kimi K3 via OpenRouter | 高（Gate 0 + OS credential store） |

> **結論**：プラグインは「モデルアクセスの金字塔」を提供します — 最も簡単な同じプロバイダーの直接ルーティングから、最も厳密な外部モデル統合まで。

### 4.3 Kimi K3 の資格情報セキュリティアーキテクチャ

Kimi K3（OpenRouter 経由）はこのプロジェクトで最も代表的な「外部モデル」の事例です。完全なセキュリティアーキテクチャを示しています：

1. **プロバイダー準備**：`[model_providers.openrouter]` と command-backed `auth` テーブルのみを追加
2. **認証**：OS credential store + 隠されたローカルプロンプト（チャットに API キーを貼り付けてはいけません）
3. **Gate 0 プローブ**：動作を検証するための 1 回の有料隔離プローブ
4. **ロール作成**：プロバイダー固有のパーソナルエージェントバリアントを作成
5. **封印された実行**：すべてのツールを無効にした `codex exec` 直接 CLI 呼び出し

> **重要ポイント**：各インストールは、明示的に料金が承認された隔離された Gate 0 を 1 回パスするまで「未修飾」（unqualified）です。これにより、未承認の料金なしにモデルにアクセスすることはできません。

### 4.4 バージョン進化の歴史

CHANGELOG から、このプロジェクトの進化を明確に追跡できます：

- **v0.1～v0.3**（7月9日）：基本インフラストラクチャの確立、advisor ワークフロー、安全な外部モデル役割
- **v0.4**（7月10日）：config-first routing を主要ワークフローに変更、v2 spawn metadata サポート
- **v0.5.1**（7月16日）：**Planner 役割追加**；Fable 5 が Planner + Advisor の両方を同時サポート
- **v0.6.0**（7月18日）：**外部モデル（Kimi K3）、OS credential store、Gate 0 probe** — セキュリティ基盤完成
- **v0.7～v0.7.2**（7月18日）：**Designer 役割**；`--update`；簡潔な activation confirmation
- **v0.8.0**（7月18日）：**READY 外部モデルに封印された direct CLI transport**を使用
- **v0.9.0**（7月25日）：**Claude Opus 5 追加**；レビュー上限を 5→8 回に拡大；セキュリティ強化

> **結論**：わずか 1 か月で v0.1 から v0.9 へ — 各リリースは特定のセキュリティまたは使いやすさの問題を解決しています。

### 4.5 エンジニアリングの技芸

production-readiness audit の「Deliberate boundaries that remain」のセクションから、設計者は攻撃面の各々に非常に慎重にアプローチしていることがわかります：

1. **External Model READY roles は封印された direct CLI transport**を使用 — ツールの濫用を防ぐ
2. **engine-level executor selector は存在しない** — ルーティングは常に policy-guided であり、Codex は最終決定権を保持
3. **Direct model overrides は root provider を継承** — クロスプロバイダーには明示的な設定が必要
4. **Claude Fable 5 は narrowly-scoped built-in exception** — Planner/Advisor のみで使用可能
5. **「Any model」には明確な範囲** — Codex のプロバイダー、設定済みの互換性のあるカスタムプロバイダー、または intentionally bundled bridge のいずれか

> **結論**：設計者は **fail-closed** を **convenience-first** より優先しました。AI エージェントがますます自律的になる時代に、この「信頼しながら検証する」、「便利しながら安全に」という設計哲学は、将来のマルチモデルコラボレーションの標準になるでしょう。

---

## 5. 詳細チュートリアル

### 5.1 インストール

まず、Codex-Orchestration プラグインを Codex にインストールします：

```bash
# marketplace からインストール
codex plugin marketplace add Cjbuilds/Codex-Orchestration

# プラグインを Codex に追加
codex plugin add codex-orchestration@codex-orchestration
```

> ⚠️ **重要**：インストール後、必ず **Codex を再起動し新しいタスクを開始** してください。

### 5.2 コマンド構文

すべての操作は **Codex prompt** で行います（ターミナルコマンドではありません）。Codex チャットに次の形式を入力します：

```text
$codex-orchestration:codex-orchestration <command>
```

例えば、現在のステータスを確認するには：

```text
$codex-orchestration:codex-orchestration status
```

### 5.3 役割の設定（setup）

`setup` は最も重要なコマンドで、各役割を対応するモデルにマッピングします：

```text
$codex-orchestration:codex-orchestration setup \
  planner: <model and effort>, \
  advisor: <model and effort>, \
  designer: <model and effort>, \
  executor: <model and effort>
```

#### 例 1: Fable 5 で計画、Sol でレビュー、Luna で実装

```text
$codex-orchestration:codex-orchestration setup planner: Claude Fable 5 High, advisor: GPT-5.6 Sol High, executor: GPT-5.6 Luna Extra High
```

#### 例 2: フル 4 人組 + Kimi K3 デザイナー

```text
$codex-orchestration:codex-orchestration setup planner: Claude Fable 5 High, advisor: GPT-5.6 Sol High, designer: GPT-5.6 Terra High, executor: GPT-5.6 Luna Extra High
```

#### 例 3: 現在の Codex モデルで計画、Fable 5 は Advisor のみ

```text
$codex-orchestration:codex-orchestration setup advisor: Claude Fable 5 High, executor: GPT-5.6 Luna Extra High
```

### 5.4 設定ルール

- **`executor` は必須** — 誰が計画を実装するかを決定
- **`planner` は任意** — 省略時は現在の Codex モデルが Planner
- **`advisor` は任意** — 省略時はレビュー段階なし
- **`designer` は任意** — 省略時はデザイン段階なし
- **Planner と Advisor は異なるモデル** — 独立レビューを保証

### 5.5 Claude Fable 5 / Opus 5 の Effort オプション

| モデル | サポートされる Effort | デフォルト | 特記事項 |
|-------|-------------------|---------|---------|
| **Claude Fable 5** | Low, Medium, High, XHigh, Max | High | `Ultra` は `Max` のエイリアスとして受付 |
| **Claude Opus 5** | Low, Medium, High, XHigh, Max | High | `Ultra` は受付なし；Claude Code 2.1.219+ が必要 |

### 5.6 外部モデルの可用性確認

自然言語で外部モデルの可用性を確認できます：

```text
is Kimi available to use as Designer?
```

プラグインは External Model registry をチェックし、4つの状態を報告します：

1. **supported**：Kimi K3 はプラグインでサポートされている
2. **configured**：Kimi K3 はこのインストールで設定済み
3. **locally ready**：Kimi K3 は現在のワークスペースで使用可能
4. **callable now**：Kimi K3 は封印された呼び出しによって検証済み

### 5.7 外部モデルの設定（Kimi K3 例）

#### ステップ 1: 外部ロールの設定

```text
$codex-orchestration:codex-orchestration configure external role researcher with OpenRouter model moonshotai/kimi-k3 at max; job: gather evidence and cite sources
```

#### ステップ 2: 認証

プラグインは terminal に隠されたローカルプロンプトを表示し、API キーを OS の credential store に保存するように誘導します。**チャットに API キーを貼り付けてはいけません！**

#### ステップ 3: Gate 0 プローブ

明示的に料金が承認された 1 回の隔離プローブを実行する必要があります：

```bash
python3 <skill-dir>/scripts/external_configurator.py \
  --codex-bin <codex-binary-path> \
  gate0 --provider openrouter --model moonshotai/kimi-k3 --effort max --acknowledge-billing
```

> このステップで実�agonals API 費用が発生します。

#### ステップ 4: ロールの作成

```bash
python3 <skill-dir>/scripts/external_configurator.py connect \
  --role researcher \
  --purpose "Gather evidence from the bounded packet and cite sources." \
  --provider openrouter \
  --model moonshotai/kimi-k3 \
  --effort max --apply
```

#### ステップ 5: 再起動

完了後、必ず **Codex を再起動し新しいタスクを開始** してください。

#### ステップ 6: ロールの呼び出し

```text
$codex-orchestration:codex-orchestration call researcher at max — review this bounded research packet
```

### 5.8 ステータスとメンテナンス

| コマンド | 機能 |
|---------|------|
| `status` | 現在のルーティング設定を表示 |
| `status --require-effective` | 設定が実際に有効であるかを確認（CI/CD 向け） |
| `repair` | ルーティング設定が乱れた場合に修復 |
| `--update` | プラグインを最新バージョンに更新 |
| `disable` | 設定をインストール前の状態に戻す |

### 5.9 Designer: Kimi K3 のクイックラベル

Kimi K3 が既に準備完了の場合、ショートハンドの seat-label 構文を使用できます：

```text
$codex-orchestration:codex-orchestration Planner: Claude Fable 5 High, Designer: Kimi K3
```

### 5.10 Codex Goals との使用

通常の Codex Goal を作成し、Codex に保存されたワークフローを使用するように指示します：

```text
Please use the saved codex-orchestration workflow until this Goal completes.
```

### 5.11 セキュリティ操作

#### 資格情報の安全な保存方法

1. **決して** Codex チャットに API キーを貼り付けない
2. **決して** 設定ファイル、ソースコード、Git、ログにキーを書き込まない
3. **正しい方法**：OS credential store（macOS Keychain / Linux Secret Service / Windows Credential Manager）

---

## 6. 開発環境セットアップ

```bash
# クローン
git clone https://github.com/Cjbuilds/Codex-Orchestration.git
cd Codex-Orchestration

# 開発依存関係のインストール
python3 -m pip install -r requirements-dev.txt

# コンパイルとリント
python3 -m compileall -q plugins tests scripts
python3 -m ruff check plugins tests scripts

# テストの実行
python3 -m unittest discover -s tests -v
python3 tests/plugin_lifecycle_smoke.py
python3 scripts/release_check.py
```

### 6.2 バージョン要件

- **Python**：3.11+
- **Codex Desktop**：0.144.0-alpha.4+（v2 spawn metadata 用途）
- **Claude Code**：2.1.219+（Opus 5 サポート用）

---

## 7. 結論

Codex-Orchestration は非常に革新的な **AI チーム管理プラグイン** です。このプラグインは「単一モデルの能力限界」という問題だけでなく、3つの重要なアーキテクチャ原則により、AI マルチモデルコラボレーションを安全かつ制御可能なものにしました：

### 7.1 3つの革新的原則

1. **役割ベースルーティング**：異なるモデルを Planner / Advisor / Designer / Executor に割り当て、各社の強みを最大化
2. **安全な外部モデルの統合**：OpenRouter + OS credential store + Gate 0 probe により、Kimi K3 のような外部モデルを Codex に安全に接続
3. **ポリシーによってガイドされるルーティング**：Codex は常に CEO；ルーティングは「提案」であり、「強制」ではない

### 7.2 3つの付与価値

1. **より強力な計画能力**：Fable 5 は計画が得意 — 計画を任せる
2. **より厳密な品質管理**：Opus 5 はレビューが得意 — 独立レビューにより自己レビューを防止
3. **より迅速な実装**：Luna は実装が速い — 並行実行をサポート

### 7.3 設計者の知恵

production-readiness audit からわかるように、設計者は攻撃面の各々において **fail-closed** を **convenience-first** より優先しました：

- **資格情報の安全**：キーはチャット/コード/設定/Git/ログに決して保存されず、常に OS credential store を使用
- **ルーティングの安全**：クロスプロバイダーには明示的な設定が必要 — 意図しないプロバイダーの使用を防止
- **レビューの安全**：Planner と Advisor は異なるモデルでなければならない — 自己レビューを防止
- **更新の安全**：プラグインの自動更新には canonical source 検証が必要 — 悪意のある置き換えを防止

このプロジェクトは非常に成熟した思考姿勢を示しています：**「何ができるか」ではなく、「何ができないか」を尋ねる**。AI エージェントがますます自律的になる時代に、この「信頼しながら検証する」、「便利しながら安全に」という設計哲学は、将来のマルチモデルコラボレーションの標準になるでしょう。

---

## 8. 主要な知見

| 知見 | 出典 | 結論 |
|------|------|------|
| **マルチモデル ≠ 単一モデルの強化** | README | 異なるモデルを異なる役割に割り当てる方が、単一モデルの性能を最大化するより効果的 |
| **コーディング前にレビュー** | ワークフロー図 | Advisor review は「計画のゲート」であり、実装の保証ではない |
| **外部モデルには厳密な監査が必要** | production-readiness audit | 任意の URL を provider にすることはできない — reviewed bundled manifest でなければならない |
| **資格情報のゼロ保存が基準** | CHANGELOG v0.6.0 | API キーは決してチャット/コード/Git/設定/ログに保存されない |
| **Codex は常に責任者** | SKILL.md | プラグインは Codex を置き換えない — ルーティングをガイドするだけ |
| **フェイルクローズドが便利さに勝る** | 監査員 | すべてのセキュリティ境界は fail-closed であり、best-effort ではない |
| **バージョン進化はセキュリティ中心** | CHANGELOG | v0.5→0.6: 資格情報セキュリティ；v0.7→0.8: sealed CLI transport；v0.9: Opus 5 + 8 回レビュー |
| **観測可能な状態が約束に勝る** | providers-and-models.md | ルーティングには明確な状態がある（installed/effective/accepted/confirmed） — 曖昧なマーケティングはしない |
