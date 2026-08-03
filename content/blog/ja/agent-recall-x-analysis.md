---
title: "AgentRecall-X 徹底解説：訂正から学ぶ Agent メモリと、正直な計測革命"
description: "Goldentrii がオープンソースで公開する AgentRecall-X —— 「訂正から学ぶ」Claude Code メモリシステムであり、agent が本当にミスを繰り返さなくなったかを数値化する唯一のオープンソースプロジェクトを徹底分析。「統治された訂正台帳」と「欠けていた計測器」という二つの核、認知心理学に基づく五層メモリモデル、正直な 35.3% の捕捉率と 0/3 の遵守データ、/arstart /arsave /arrecall /arreflect のセッションループ、完全な MCP 導入チュートリアル、そして「自動化の原則」という設計哲学まで、312 stars で agent メモリ市場全体を揺るがすプロジェクトを 1 記事で解説します。"
date: "2026-08-03"
author: "TopDigg Research Team"
tags: ["AgentRecall", "Agent Memory", "Claude Code", "MCP", "Corrections Ledger", "RAG", "Mem0", "Retrieval", "AI Agent", "Memory Layers", "TypeScript"]
categories: ["徹底解説"]
keywords: ["AgentRecall-X", "Agent メモリ", "Claude Code メモリ", "MCP Server", "訂正台帳", "計測器", "五層メモリ", "セッションループ", "自動化の原則", "正直な計測", "RAG", "検索拡張", "Mem0 比較", "AI Agent メモリ"]
---

# AgentRecall-X 徹底解説：訂正から学ぶ Agent メモリと、正直な計測革命

> 核心理念：**「メモリツールの価値は、どれだけ蓄えるかではなく、訂正が本当に agent の次の行動を変えたかどうかにある。」** AgentRecall-X はこの一言で全競合との違いを定義します——それは単なるメモリエンジンではなく、**(a) 統治された訂正台帳** であり、**(b)「訂正→行動変容」を測る計測器** です。業界全体が高い検索スコアを自称する中、同プロジェクトは自らの 35.3% の捕捉率と 0/3 の遵守データを公表することを選びました——**「Measured, not promised.（計測されたもの、約束されたものではない）」**。

---

## 一、プロジェクト概要

### 1.1 これは何か？

**AgentRecall-X**（旧リポジトリ名 AgentRecall-MCP）は、Goldentrii がオープンソースで公開する Claude Code メモリシステムです。公式の自己定義：

- **「訂正から学ぶ Claude Code メモリ」**——会話を受動的に覚えるのではなく、あなたの毎回の訂正から能動的にルールを学びます；
- **「agent が本当にミスを繰り返さなくなったかを測る唯一の学習ループ」**——「ミスを繰り返さない」と約束するのではなく、実際に達成しているかをデータで伝えます；
- **MCP · SDK · CLI · Skill** の 4 形態で提供。

重要な事実：

- リポジトリ：`https://github.com/Goldentrii/AgentRecall-X`
- Stars：**312**、Forks：53
- ライセンス：MIT
- 言語：TypeScript / JavaScript（monorepo）
- 最新バージョン：v3.4.40（2026 年 7 月 27 日）
- npm 週間ダウンロード：約 2,759 回

### 1.2 何を解決しようとしているのか？

AI コーディングアシスタントを使ったことがある人なら誰でも体験があります：**「先に聞いてから変更して」「このファイルに触らないで」と 100 回訂正しても、次のラウンドで同じミスを犯す。** 市場の主流メモリツール（Mem0 ~60K stars、Graphiti/Zep ~28K、Supermemory ~28K、Letta ~24K）はすべて「より多く覚える」ことに注力していますが、誰もより根本的な問いに答えていません：

> 覚えた訂正は、本当に行動を変えるのか？

AgentRecall-X はこの分野の二つの欠陥を指摘します：

- **検索を測り、行動を測らない**：LongMemEval、LoCoMo、MemoryAgentBench、Letta Leaderboard——すべての公開ベンチマークは「検索できるか」を測るだけで、「検索した後、agent が本当に従ったか」を測るものはありません；
- **自己申告の高スコアは再現不能**：多くのメモリツールのベンチマーク数値は自己申告で、同じ検索テストに基づき、独立した再現が困難です。

AgentRecall-X の答え：**先に計測器を作り、それからメモリを語る。** 訂正台帳と計測ハーネスを第一級市民とし、検索はその中の一つの部品に過ぎません。

---

## 二、核心理念：Measured, not promised

### 2.1 統治された訂正台帳（Governed Corrections Ledger）

あなたが agent を訂正するたびに（*「違う、そのバージョンじゃない」*、*「このセクションを先頭に」*、*「推測する前に私に聞いて」*）、それは深刻度・証拠・結果追跡を備えた構造化レコードとして保存されます：

- `rule` —— ルール内容（agent が従うべき行動基準）
- `why` —— このルールがなぜ存在するか
- `project` —— どのプロジェクトに属するか
- `date` —— 記録日
- `severity` —— **P0**（never/always/don't）または P1（一般的な好み）
- `active` —— 有効かどうか
- `holder` —— ルール所有者
- `heeded_count` —— 遵守された回数
- `recurred_count` —— ミスが再発した回数
- `proof_confidence` —— 証拠の信頼度

それは**セッション・プロジェクト・agent の再起動をまたいで**永続化されます——一度訂正すれば、明示的に撤回されるまで効果が続きます。

### 2.2 欠けていた計測器（The Missing Measurement Instrument）

これが AgentRecall-X の最も独自的な貢献です：**すべての訂正は `retrieved_count`（検索された回数）を蓄積し、agent が同じ状況に再び出会うたびに、結果は `heeded`（遵守）または `recurred`（再発）として記録されます。**

作者自身の言葉：

> **「この分野のすべてのベンチマークは検索を測っている。セッションをまたぐ行動変容を測るものは一つもない。私たちは先に計測ハーネスを作った——そして見つけたすべてを公表する。不格好な数字も含めて。」**

### 2.3 同プロジェクトが公表した実データ（2026-07-03）

- **訂正捕捉率**（二重盲検、n=59）：**35.3%** [17.3–58.7 信頼区間]——実際の訂正の約 1/3 しか捕捉できていません；
- **遵守率（証拠基盤、リセット後）**：**0/3** イベント——92.5% の「楽観的推定」ではなく、正直な 0；
- **訂正転移リコール**（オフライン、達成可能水準）：**0/4** [Wilson 0–49%]——自社コーパスで 0 点；
- **session_start 注入の中央値**：**1,489 tokens**（最適化前 2,010、Mem0 アンカー約 7K）；
- **p95 session_start レイテンシ（ウォーム）**：**363 ms**（最適化前 1,132）。

作者の説明（正直かつ正確）：

- 35.3% の捕捉率は、**訂正の捕捉自体が最大のボトルネック**であることを示しています；
- 0/3 は「後退」ではなく、**デフォルトを「遵守と仮定」から「不明」に変えた後の正しい出発点**です；
- 0/4 の転移リコールは**データ密度の問題**（19 プロジェクトでアクティブな訂正はわずか 32 件——ミスに先回りするには疎すぎる）であり、**検索アーキテクチャの問題ではありません**（内部実験で 5 回確認済み）。

> これは極めて稀なことです：**不格好な数字を自ら進んで公表するオープンソースプロジェクト——しかもすべての数字が `npm run bench` 一発で、固定されハッシュロックされたコーパスから再生成できます。**

---

## 三、技術アーキテクチャ：五層メモリモデル

### 3.1 認知心理学に基づく五層メモリ

AgentRecall-X は認知心理学のメモリ分類法を agent のファイルシステムに写像します：

- **第 1 層 · エピソード記憶（Episodic）**——各セッションで何が起きたかを時系列で記録、パス `journal/`、作業中に自動書き込み；
- **第 2 層 · 意味記憶（Semantic）**——トピックでクラスタリングされた事実、`[[wikilinks]]` 付き、パス `palace/rooms/`（Architecture、Goals、Blockers）；
- **第 3 層 · 手続き記憶（Procedural）**——IF-THEN プロダクションルール、再利用可能な how-to、パス `palace/skills/`；
- **第 4 層 · 物語記憶（Narrative）**——プロジェクトの段階：目標 → 難しかったこと → どう解決したか → 総括、パス `palace/pipeline/`；
- **第 5 層 · 訂正記憶（Correction）**——行動キャリブレーションルール、深刻度と結果追跡付き、パス `corrections/`；
- **+ 認識層（Awareness）**：N 回確認された訂正から昇格するクロスプロジェクト洞察、パス `palace/awareness`——「複利」の層。

すべての層は共通の命名文法を共有し、どの agent も意図から検索パスを組み立てられます。既存ファイルは `legacy_path` ビューを通じて動作し続けるため、**移行は不要**です。

### 3.2 ローカルファイル構造

すべてのメモリはデフォルトでローカル Markdown、ゼロクラウド：

```
~/.agent-recall/
├── awareness.md                  # グローバル複合ドキュメント（約 200 行）
├── awareness-state.json          # 構造化 awareness データ
├── insights-index.json           # クロスプロジェクト insight マッチング
├── feedback-log.json             # 検索品質スコア
└── projects/<name>/
    ├── journal/YYYY-MM-DD--arsave--NL--slug.md
    ├── palace/
    │   ├── rooms/<room>/         # 永続的な知識ルーム
    │   ├── skills/               # 手続きルール
    │   ├── pipeline/             # 物語フェーズ
    │   ├── awareness/            # クロスプロジェクト洞察
    │   ├── identity.md           # プロジェクト意図 + 目標
    │   └── graph.json            # メモリ接続エッジ
    └── corrections/
        └── alignment-log.json    # 訂正履歴
```

### 3.3 技術スタックと検索

- **コア**：TypeScript monorepo、4 つの公開パッケージ（`core` ストレージ+ツールロジック、`mcp-server` 薄い MCP ラッパー、`sdk` プログラムAPI、`cli` の `ar` コマンド）；
- **デフォルト検索**：キーワード/サブストリングマッチ（ステミング + 同義語展開 + 軽量 IDF + ソース別ランキング）を **RRF（Reciprocal Rank Fusion、Cormack 2009）** で融合——注意：**BM25 ではありません**。作者は転置インデックスがないことを明言し、本物の BM25 は「将来の可能性」としています；
- **オプションの意味検索**：`OPENAI_API_KEY` 設定時にベクトル検索を有効化、オプションの Supabase ミラー（pgvector）；
- **減衰アルゴリズム**：FSRS-lite（Ebbinghaus → SuperMemo → FSRS-6 系譜）；
- **再ランキング**：Modern Hopfield 再ランクプリミティブ（Ramsauer 2020）はコードに存在しますが、**デフォルトパスには配線されていません**——「今動いているものが実際のもの」；
- **ユーザーフィードバック**：検索結果に評価を付けられ、Bayesian Beta モデルでランキングを更新。

---

## 四、設計哲学

### 4.1 自動化の原則（The Automaticity Principle）

> **「メモリはオンデマンドではなく、自動的に発火したときだけ複利になる。」**

根拠：44 プロジェクト、221 ジャーナル、81 訂正にわたる長期観察（2026-06-12）で、**すべての「プル型」ツール（recall、memory_query）の有機的呼び出しはゼロ**だったことが判明——それを作った agent 自身も使いませんでした。一方「プッシュ型」チャネル（session_start、session_end、訂正フック、アンビエントリコール）は一貫して行動変容を生み出しました。

結論：デフォルトで公開されるのは **5 ツールのみ**。「二動詞モデル」——`session_start`（吸う）と `session_end`（吐く）——が複利価値のすべてを担い、残りはすべてオプトイン（`--full`）です。

### 4.2 マーケティングナラティブより正直な計測

- 「Every correction saved is a mistake never repeated」（反証不可能なマーケティング文句）を削除；
- 競合比較表を削除（属性は漂移し、持続的に追跡できないため）；
- 再現可能な計測フレームワークを構築：すべての数字は 1 コマンドで再生成可能、「私たちを悪く見せる数字も含めて」。

### 4.3 ローカルファースト、デフォルトでゼロクラウド

デフォルトパスは純粋なローカル Markdown で、クラウドサービスに依存しません。Supabase ミラーと OpenAI ベクトルは**オプション**です。これは「Cheap + Private」の体現——あなたの訂正台帳はあなたのものです。

### 4.4 明確な選択

- **デフォルトストレージはベクトルDBではなく Markdown**——可読、diff 可能、grep 可能、git バージョン管理可能；
- **BM25 ではなく RRF**——十分かつ正直で、実際以上に複雑を装わない；
- **独自プロトコルではなく MCP**——1 つのインターフェースで全 agent クライアントに接続。

---

## 五、完全チュートリアル：AgentRecall-X をゼロから始める

### 5.1 MCP Server のインストール

**Claude Code（ワンコマンドインストール）：**

```bash
claude mcp add --scope user agent-recall -- npx -y agent-recall-mcp
```

**Cursor（`.cursor/mcp.json`）：**

```json
{ "mcpServers": { "agent-recall": { "command": "npx", "args": ["-y", "agent-recall-mcp"] } } }
```

**VS Code（`.vscode/mcp.json`）：**

```json
{ "servers": { "agent-recall": { "command": "npx", "args": ["-y", "agent-recall-mcp"] } } }
```

**Windsurf（`~/.codeium/windsurf/mcp_config.json`）：**

```json
{ "mcpServers": { "agent-recall": { "command": "npx", "args": ["-y", "agent-recall-mcp"] } } }
```

**Codex：**

```bash
codex mcp add agent-recall -- npx -y agent-recall-mcp
```

### 5.2 Skill のインストール（Claude Code 専用）

```bash
mkdir -p ~/.claude/skills/agent-recall
curl -o ~/.claude/skills/agent-recall/SKILL.md \
  https://raw.githubusercontent.com/Goldentrii/AgentRecall-X/main/SKILL.md
```

### 5.3 SDK と CLI のインストール

```bash
npm install agent-recall-sdk            # JS/TS アプリ
npx agent-recall-cli recall "topic"     # ターミナル & CI
```

### 5.4 四動詞セッションループ（The Session Loop）

これが AgentRecall-X の核となる使い方です——**「/arstart がなければ、新しい agent は方向感覚ゼロ。/arsave がなければ、何も複利にならない。」**

- **`/arstart`**（毎セッション**最初**のアクション）——ステータスボードを開く：全プロジェクトの保留中タスクとブロッカーを一覧表示し、番号で選択してそのプロジェクトの深いコンテキスト（palace ルーム、訂正、タスクリコール）をロード；`/arstart <slug>` で直接ロード；`/arstart bootstrap` はマシンをスキャンして既存プロジェクトをインポート；
- **`/arsave`**（毎セッション**最後**のアクション）——journal + palace 統合 + awareness 複利を書き込み；`/arsave all` はその日の全並行セッションを一括保存（スキャン、マージ、重複排除）；
- **`/arrecall`**（セッション途中、オンデマンド）——過去の知識を検索：文書化された修正、過去の決定、確立されたパターン；
- **`/arreflect`**（K セッションごと）——定期的な統合：再発/ファントムマッチの確認、新たなエラークラスのクラスタリング、ルール再抽象化の提案（**ルール編集は常にオーナー承認制**）。

### 5.5 コア MCP ツール早見表

**session_start（セッション開始時）：**

```json
{ "project": "my-app" }
```

返り値：プロジェクト ID、上位 5 件の awareness insights、顕著度の高い palace ルーム、過去の訂正パターンからの予測警告（`watch_for`）、最大 10 件の P0 行動ルール、再開ブリーフ。

**remember（新しい知識を学んだ時）：**

```json
{
  "content": "We decided to use GraphQL instead of REST",
  "context": "architecture decision"
}
```

返り値：自動ルーティング先（`routed_to`）、コンテンツ分類、自動生成の意味スラグ。

**recall（過去の知識を検索する時）：**

```json
{ "query": "authentication design", "limit": 5 }
```

フィードバックスコアを添えると、Bayesian ランキング更新を駆動します。

**session_end（セッション終了時）：**

```json
{
  "summary": "Built auth module with JWT refresh rotation. Fixed CORS bug.",
  "insights": [{
    "title": "JWT refresh tokens need httpOnly cookies",
    "evidence": "XSS attack vector discovered during security review",
    "applies_when": ["auth", "jwt", "security", "cookies"],
    "severity": "critical"
  }],
  "trajectory": "Next: add rate limiting to API endpoints"
}
```

**check（大きな決断の前に理解を検証）：**

```json
{
  "goal": "Build REST API for user management",
  "confidence": "medium",
  "assumptions": ["User wants REST, not GraphQL", "CRUD endpoints"]
}
```

### 5.6 SDK 使用例

```typescript
import { AgentRecall } from "agent-recall-sdk";

const memory = new AgentRecall({ project: "my-app" });

// 知識を捕捉
await memory.capture("What stack?", "Next.js + Postgres");

// 記憶を検索
const ctx = await memory.recall("rate limiting");
```

### 5.7 実験的ツールキット（Recurrence & Reflection Harness Kit）

- `ar-scoreboard.py`（SessionStart フック）——毎セッションのヘルスダイジェスト：訂正フロー、洞察昇格率、ループヘルス、ファントム数、振り返り頻度；
- `ar-recurrence-check.py`——エラークラスタクソノミーによる機械的ファントム検出（ルールの後に発生した違反 = phantom gradient step、書き込みコストは支払われたが行動は変わらなかった）；
- `ar-nudge.py`（UserPromptSubmit フック）——セッション中に期限切れの振り返りを能動的に提示；
- `dispatch-model-guard.py`（PreToolUse フック、オプション）——明示的なモデルディスパッチポリシーの警告専用ガード。

初回検証実行（2026-07-14、パワーユーザー 1 台）：**109 件の訂正から 8 つのエラークラスと 18 の確認済みファントムグラディエントステップを発見、当日 6 ルールを再抽象化。**

### 5.8 War Room ビジュアルダッシュボード

1. [最新 Release](https://github.com/Goldentrii/AgentRecall-X/releases/latest) から `ar-warroom-v3.4.40.zip` をダウンロード；
2. 解凍してローカルで起動：

```bash
cd warroom
python3 -m http.server 8080
```

3. **http://localhost:8080/AgentRecall.html** を開く——アクティビティカレンダー、プロジェクト別ステータス、訂正、洞察を、すべてローカルの `~/.agent-recall/` データからレンダリング。**完全オフライン、Node 不要、ビルドステップ不要**。

---

## 六、機能リスト：すぐに使える

- **統治された訂正台帳**：深刻度（P0/P1）+ 証拠 + 撤回 + 結果追跡
- **行動計測**：`retrieved_count` / `heeded` / `recurred` の 3 指標
- **五層メモリ**：エピソード / 意味 / 手続き / 物語 / 訂正 + Awareness 複利層
- **二動詞セッションモデル**：`session_start` / `session_end`、残りはオプトイン
- **検索**：キーワード + 同義語 + 軽量 IDF + RRF 融合（オプションで OpenAI ベクトル）
- **フィードバック学習**：検索結果の Bayesian Beta スコアリング
- **ドリームモード（オプション）**：夜間自動統合、Ebbinghaus 減衰、journal ロールアップ、awareness 卒業、Telegram 日報
- **プラットフォーム対応**：Claude Code（主）、Cursor、Windsurf、VS Code/Copilot、Codex、Hermes、Roo Code、任意の JS/TS アプリ、ターミナル/CI
- **War Room**：オフラインのビジュアルダッシュボード
- **再現可能なベンチマーク**：`npm run bench` で全数字を再生成
- **ローカルファースト**：デフォルトでゼロクラウド、可読かつ git 管理可能な Markdown

---

## 七、まとめ：見解と結論

### 7.1 核心的見解

1. **「メモリエンジン」は誤用されたラベル——AgentRecall-X の本質は訂正台帳 + 計測器。** 作者は内部リサーチドキュメントで直接断言しています：「AgentRecall はメモリエンジンではない。それは（a）統治された訂正台帳であり、（b）訂正学習のための欠けていた計測器——現在メモリツールとして誤ってラベル付けされている。」**これはポジショニングの正直さであり、差別化の出発点です。**
2. **「検索を測り、行動を測らない」は agent メモリ市場全体の体系的な盲点。** LongMemEval、LoCoMo、MemoryAgentBench はすべて検索を測るだけ。AgentRecall-X はセッションをまたぐ行動変容を公に測る唯一のオープンシステムです。**他人が「どれだけ蓄えたか」で競う中、それは「どれだけ本当に変わったか」で競います。**
3. **正直なデータは希少な資産。** 35.3% の捕捉率と 0/3 の遵守率を公表することは、短期的には「不格好な数字」に見えますが、長期的には**信頼の堀（モート）**です——すべての数字がハッシュロックされたコーパスから再現できるからです、「私たちを悪く見せる数字も含めて」。
4. **自動化の原則：複利はプルからではなくプッシュから生まれる。** 44 プロジェクト、数週間の実使用で、プル型ツールはすべてゼロ呼び出し——**デフォルトで 5 ツールだけを公開し、二動詞に全価値を担わせるのは、設計者の好みではなくデータ駆動の最適解です。**
5. **現在のボトルネックはデータ密度であり、検索アーキテクチャではない。** 19 プロジェクトでアクティブな訂正はわずか 32 件（75% は既に撤回済み）——ミスに先回りするには疎すぎます。**「捕捉」を先に解決し、「検索」は後で最適化する。順序を逆にしてはいけません。**

### 7.2 市場での位置づけ（競合との比較）

- **Mem0**（~60K stars）——ベクトル + BM25 + エンティティ、訂正層は低い、コーディング agent 特化は高い；
- **Graphiti/Zep**（~28K）——時系列ナレッジグラフ（Neo4j）、訂正層は低い；
- **Supermemory**（~28K）——fact + profiles + KG + RAG、コーディング agent 特化は**最高**；
- **Letta**（~24K）——agent 編集可能なメモリブロック、訂正層は中；
- **AgentRecall-X**（312 stars）——Markdown 訂正台帳 + 五層メモリ、**訂正層はネイティブ**、コーディング agent 特化は高い、**デフォルトでローカルのみ・ゼロクラウド**。

312 stars で 60K stars の巨人に立ち向かう戦略は、「より多くやる」ことではなく、**「より正直に測る」こと**です。

### 7.3 開発者への示唆

- **訂正の捕捉は最も過小評価されたボトルネック**——35.3% の捕捉率は、検索がどれだけ強くても、覚えられなかったミスは防げないことを意味します；
- **計測を先に**：どんなメモリシステムも、まず「行動を変えたか」に答え、それからストレージと検索を語るべきです；
- **デフォルト値が製品の性格を決める**：「未検証=遵守」を「未検証=不明」に変えることで、0/3 が正直な出発点になります；
- **ローカルファーストは再現可能な製品戦略**：Markdown メモリは可読・diff 可能・git 管理可能——ブラックボックスのベクトルストアに勝ります。

### 7.4 結び

「みんなが 90% 以上の検索スコアを自称する」2026 年の agent メモリ市場で、AgentRecall-X は「不格好だが真実の」数字のセットで、まったく異なるスタートラインを引きました。それは最も多くの stars を持っていないかもしれませんが、この分野が最も欠いているものを所有しています——**自分自身を反証できる計測器と、悪い知らせを公表する勇気**。

> 業界全体が検索の栄光を披露する中、AgentRecall-X は行動の真実を測ることを選んだ。それこそが agent メモリが本当に進むべき道なのかもしれない。

---

## 参考資料

- AgentRecall-X 公式リポジトリ：https://github.com/Goldentrii/AgentRecall-X
- 公式フルドキュメント：https://github.com/Goldentrii/AgentRecall-X/blob/main/README.full.md
- チェンジログ（設計の理由）：https://github.com/Goldentrii/AgentRecall-X/blob/main/UPDATE-LOG.md
- 競合リサーチレポート：https://github.com/Goldentrii/AgentRecall-X/blob/main/docs/research/agent-memory-landscape-2026-07.md
- ベンチマーク再現ガイド：https://github.com/Goldentrii/AgentRecall-X/blob/main/docs/eval/REPRODUCE.md
- npm パッケージ：https://www.npmjs.com/package/agent-recall-mcp
