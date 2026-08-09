---
title: "Claude Code 拡張フルセット徹底解説：gstack · Superpowers · Compound Engineering · ECC — AI アシスタントを 20 人分の仮想エンジニアリングチームに変える"
description: "eric-claude-code-dev プロジェクトが統合する 4 つの Claude Code 拡張ツールを徹底解説：gstack（YC CEO Garry Tan のソフトウェア工場、15 の専門ロール）、Superpowers（GitHub 元 CTO Jesse Vincent の自動トリガー開発ワークフロー）、Compound Engineering（Every 社の複利エンジニアリング、仕事をするたびに次が楽になる）と Everything Claude Code（Anthropic Hackathon 受賞の Token 最適化システム）。小学生にもわかる比喩で「AI を仮想エンジニアリングチームにする」という核となる考え方を解説し、完全なインストール手順、主要コマンドの詳細（/office-hours、/ce:brainstorm、/tdd など）、4 つのツールを組み合わせる 4 シナリオガイド、4 つの設計哲学（スキルはソフトウェア、自動トリガー、複利思考、サブ Agent オーケストレーション）を整理し、「コードを書くのは最後の一歩」「知識は人と一緒に消えずに蓄積する」などの核心的な考えをまとめます。"
date: "2026-08-09"
author: "TopDigg Research Team"
tags: ["Claude Code", "AI Agent", "gstack", "Superpowers", "Compound Engineering", "ECC", "Garry Tan", "Jesse Vincent", "Developer Tools", "AI Workflow", "TDD", "Open Source"]
categories: ["深度解析"]
keywords: ["Claude Code 拡張", "gstack", "Superpowers", "Compound Engineering", "Everything Claude Code", "AI 開発ワークフロー", "仮想エンジニアリングチーム", "複利エンジニアリング", "サブエージェント", "TDD", "コードレビュー", "Git worktree", "スキルシステム", "Token 最適化", "オープンソースツール"]
---

# Claude Code 拡張フルセット徹底解説：gstack · Superpowers · Compound Engineering · ECC —— AI を 20 人分の仮想エンジニアリングチームに変える

> **核心的な考え：** コードを書くことは最後のステップにすぎません。実際の開発作業の 80% は「何を作るのか、どう分解するのか、どう検証するのか」を考えることに費やされます。eric-claude-code-dev は、4 つの無料オープンソースの Claude Code 拡張ツールを 1 つの「仮想エンジニアリングチーム」にパッケージ化しました：gstack は 15 の専門ロール（CEO から QA エンジニアまで）、Superpowers はスキルをパイプラインのように自動トリガー（構想からリリースまで毎回手動で指示する必要なし）、Compound Engineering は仕事のたびに「雪だるま式」に積み上げ（知識を蓄積し、次回はもっと楽に）、ECC は Token を節約しながらすべてを記憶します。これらをインストールすれば、普通の開発者でも 20 人チームのように 1 日で 10,000 行以上の本番コードを書けます。

---

## 一、これは何？（小学生にもわかる版）

あなたが「一人社長」で、ソフトウェア会社を立ち上げてアプリを作りたいと想像してください。頭の中では完璧なプランがあるのに、一人ではすべてをこなせないことに気づきます：製品を考える人（CEO）、設計図を描く人（デザイナー）、予算を管理する人（エンジニアリングマネージャー）、コードを書く人（プログラマー）、バグをチェックする人（QA）、リリースを担当する人（リリースエンジニア）……

**20 人を雇うのは高すぎる。どうする？AI にチーム全体をやってもらおう！**

Claude Code はもともと「コードを書くのが得意な AI アシスタント」です。このリポジトリの 4 つのツールは、そのアシスタントに取り付ける 4 つの「スーパー外付け装置」で、一人でチーム全体を演じさせます：

- **gstack = 「会社の組織図」**：一揃いの「ロール」をインストールし、各ロールには『職務記述書』（スキル）があります。製品を考えたいときは「CEO」を呼び、コードを書きたいときは「プログラマー」を呼び、リリースしたいときは「リリースエンジニア」を呼ぶ——AI はロールに応じて異なる仕事をします。
- **Superpowers = 「自動パイプライン」**：AI に「作業フロー」を教えます：まず考える（構想）→ 次に計画する（プラン）→ それから書く（実装）→ チェック（レビュー）→ テスト（テスト）→ リリース（リリース）。**すごいのはこのフローが自動でバトンタッチすること**：要件を伝えると、次に何をすべきか AI が自動で判断し、まるでラインのベテラン職人がすべてのステップを見守っているかのように、細かい指示は不要です。
- **Compound Engineering = 「複利の貯金箱」**：仕事が終わるたびに、「今回学んだこと」を記録して知識ベースに保存します。次に似た問題に直面したら、直接取り出して使えます。貯金と同じで：少しずつ貯めると利息が雪だるま式に増え、**使えば使うほど楽になります**。
- **ECC（Everything Claude Code）= 「賢い節約アシスタント」**：AI が最小のコスト（Token）で仕事をするのを助け、作業の進捗も覚えてくれます——パソコンをシャットダウンしても、次に開けば「覚えています」。

**一言でまとめると：この 4 つを組み合わせることで、優秀だが孤独な AI プログラマーが、整理整頓され、役割分担され、振り返りができ、記憶力のあるチーム全体に変わるのです。**

---

## 二、プロジェクトの説明

### 2.1 基本情報

- **プロジェクト名**：eric-claude-code-dev（4 つの Claude Code 拡張ソリューションを収録した統合ガイドリポジトリ）
- **オープンソース URL**：[https://github.com/gyc567/eric-claude-code-dev](https://github.com/gyc567/eric-claude-code-dev)
- **4 つの構成要素**：
  - **gstack** — [Garage のソフトウェア工場](https://github.com/garrytan/gstack)、作者は Y Combinator の社長 Garry Tan
  - **Superpowers** — [GitHub 元 CTO Jesse Vincent の完全なワークフロー](https://github.com/obra/superpowers)
  - **Compound Engineering** — [Every 社の複利エンジニアリング](https://github.com/EveryInc/compound-engineering-plugin)
  - **Everything Claude Code (ECC)** — [Anthropic Hackathon 受賞の最適化システム](https://github.com/affaan-m/everything-claude-code)
- **ライセンス**：すべて無料オープンソース（MIT License）
- **前提条件**：Claude Code + Git + Bun（インストール・スクリプト補助用）
- **位置づけ**：Claude Code を「AI アシスタント」から「完全な仮想エンジニアリングチーム」にアップグレード

### 2.2 それは何の問題を解決するのか？

現代のソフトウェア開発には厄介な問題があります：**AI はコードを書くのが得意ですが、エンジニアリングはコードを書くだけではありません。**

実際のチームでは、コードを書くのは 20% だけで、残りの 80% は要件の議論、設計レビュー、テスト、バグ調査、リリース、振り返りです。一人で AI を使う場合、これらの工程はスキップされるか（誰も欲しがらない機能を作ってしまう）、すべて自分で手動で AI を指示するか（疲れ果てる）のどちらかです。

3 人の作者はそれぞれ異なる角度から「AI をどう使うか」という問題に答えています：

- **Garry（YC 社長）**：AI をどんなロールでも演じられる「俳優」ととらえ、重要なのは『ロール説明書』をしっかり書くこと——そこで gstack の 15 のロールが生まれました。
- **Jesse**（GitHub 元 CTO）：開発プロセス全体を**標準化**し、自動トリガーのスキルチェーンにしました——そこで Superpowers が生まれました。
- **Every 社**：重要なのは「今回はどれだけ速くやるか」ではなく「次回はどうやって速くやるか」——そこで複利エンジニアリングが生まれました。
- **ECC の作者**：AI は使うほど高くなり、使うほど忘れる。ならば**Token を節約 + すべてを記憶**——そこで Everything Claude Code が生まれました。

### 2.3 3 つの核心的な概念（すべてわかりやすい言葉で）

- **スキル（Skill / Command）= ロールの説明書**：SKILL.md というファイルに収められた特殊な説明文。AI にどのような状況でトリガーされ、どう行動すべきかを伝えます。gstack には 15 のロールスキル、Superpowers には一連のスキルチェーン、Compound には /ce: シリーズのコマンドがあります。
- **自動トリガー（Auto-trigger）= 心を読むパイプライン**：Superpowers はコマンドを覚える必要がありません——AI が「今は構想の段階だ」と判断すれば brainstorming をトリガーし、計画を書く段階なら writing-plans をトリガーし、次々と連鎖します。
- **複利 = 使うほど楽になる秘訣**：仕事を終えるたびに、経験、ハマった落とし穴、書いたパターンをドキュメントと知識ベースに記録します。次回はそれらの知識が自動的に呼び出されます（Compound Engineering の核心）。
- **ワークツリー分離 = 一人で複数仕事をするオフィス**：git worktree を使って各機能に独立した作業ディレクトリを作り、互いに干渉せず、複数のタスクを並行して進められます。
- **サブ Agent = あなたが派遣する部下**：メインの AI がタスクを複数のサブ Agent に分解して並行実行し、専用のレビュー Agent でチェックする 2 段階で品質を保証します。

---

## 三、詳細チュートリアル（手取り足取り版）

### 3.1 インストール（10 分で完了）

**前提環境**：Claude Code をインストールしたパソコン + Git + Bun（bun.sh でワンクリックインストール）。

**gstack をインストール（グローバルスキルパック）**：ターミナルを開き、Claude Code で以下を入力：

```bash
git clone https://github.com/garrytan/gstack.git ~/.claude/skills/gstack && cd ~/.claude/skills/gstack && ./setup
```

**Superpowers をインストール（公式マーケットプレイス）**：Claude Code で以下を入力：

```bash
/plugin install superpowers@claude-plugins-official
```

マーケットプレイスで見つからない場合は、先にマーケットプレイスを追加してからインストールします：

```bash
/plugin marketplace add obra/superpowers-marketplace
/plugin install superpowers@superpowers-marketplace
```

**Compound Engineering をインストール**：

```bash
/plugin marketplace add EveryInc/compound-engineering-plugin
/plugin install compound-engineering
```

**ECC をインストール（任意、どちらの方法でも可）**

```bash
# 方法 1：公式インストールスクリプト
git clone https://github.com/affaan-m/everything-claude-code.git
cd everything-claude-code && ./install.sh

# 方法 2：スキルディレクトリに手動でコピー
cp -r . ~/.claude/skills/everything-claude-code
```

**インストール成功の確認**

新しい Claude Code セッションを開き、それぞれ入力します：

```
/office-hours      # gstack - 「新しいアイデアにアドバイス」が表示されるはず
/brainstorm        # Superpowers - 要件の説明を求められるはず
/ce:brainstorm     # Compound - 何をしたいのか詳しく聞かれるはず
```

AI が反応すれば、インストール完了です！反応がない場合は、スキルディレクトリのファイルが揃っているか確認してください。

### 3.2 最初の完全なケース：ブログにコメント機能を追加する（全フロー演習）

これは完全な「仮想チームパイプライン」です——**順番に従って実際に打ち込んでみることを強くおすすめします**。

**ステップ 1：要件会議を開く（gstack の /office-hours + /plan-ceo-review）**

Claude Code で以下を入力します：

```
/office-hours
```

AI が「YC スタートアップアドバイザー」を演じ、6 つの質問をします：誰のために使う？どんな課題を解決する？既存のソリューションと何が違う？どうやって成功を測る？……

回答が終わったら、次を入力します：

```
/plan-ceo-review
```

AI は「CEO」になり、「10 つ星の製品を作れるか」という視点からあなたのプランを検討し、あなたの前提に挑戦します。この時点で**設計ドキュメント**が手に入ります。

**ステップ 2：計画を立てる（/plan-eng-review）**

以下を入力します：

```
/plan-eng-review
```

AI は「エンジニアリングマネージャー」になり、設計ドキュメントを技術プランに分解します：どのデータベースを使うか、インターフェースをどう設計するか、データ構造はどうなるか、エッジケースは何か。**このステップから、機能が「どんな形になるか」がすでにわかります。**

**ステップ 3：要件を詳細化する（Superpowers の brainstorming）**

新しい会話で以下を入力します：

```
/brainstorm
```

Superpowers がさらに質問を続けて要件を詳細化します（「コメントの並び順は？承認は必要？」）。数文で回答すると、最終設計を表示して確認を求めます。

**ステップ 4：実装計画を書く（/ce:plan）**

以下を入力します：

```
/ce:plan
```

それまでの要件ドキュメントを読み取り、**実行可能なタスクリスト**を自動生成します。例えば：

```markdown
## タスク 1: コメントのデータベースモデルを作成
- ファイル: src/models/comment.ts
- 検証: bun test models/comment.test.ts

## タスク 2: コメント API エンドポイントを実装
- ファイル: src/routes/comments.ts
- 検証: curl localhost:3000/api/comments
```

各タスクには正確なファイルパス、コード、検証方法があり、サブ Agent に直接渡せるほど明確です。

**ステップ 5：作業開始（/ce:work + Superpowers サブ Agent）**

以下を入力します：

```
/ce:work
```

分離された git worktree を作成し、タスクを分解し、サブ Agent を並行実行し、各タスク完了時に自動でアトミックコミットします。実装エラーが発生した場合は一時停止して確認を待ちます。

**ステップ 6：強制テスト（TDD）**

Superpowers は RED-GREEN-REFACTOR の 3 ステップを強制します：

1. **まず失敗するテストを書く**（RED）
2. **テストが通る最小限のコードを書く**（GREEN）
3. **リファクタリングして最適化し、コミットする**（REFACTOR）

先にコードを書いてからテストを書くと、AI は「怒って」コードを削除して書き直させます——**TDD は強制です**。

**ステップ 7：コードレビュー + QA + リリース**

品質チェックを一通り実行します：

```
/review        # gstack：バグを自動修正し、重要な問題を指摘
/ce:review     # Compound：4 つのレビュー Agent が正しさ/セキュリティ/パフォーマンス/テストの 4 視点から指摘
/qa            # gstack：実際のブラウザで回帰テストを実行
/ship          # メインブランチと同期、テスト実行、プッシュ、PR を自動作成
```

**ステップ 8：振り返り、次回を楽にする（/ce:compound）**

```
/ce:compound
```

AI が 3 つの質問をします：今回学んだことは？どんな状況で問題が起きる？未来の自分へのアドバイスは？——そしてそれらをドキュメントと知識ベースに書き込みます。**これが「次回を速くする」複利のアクションです。**

### 3.3 4 つのツールのよく使うコマンド一覧

**gstack（15 のロールスキル）**

- **/office-hours** — YC アドバイザー：6 つの質問でアイデアを再構築し、前提に挑戦
- **/plan-ceo-review** — CEO：「10 つ星の製品」の視点でチェック
- **/plan-eng-review** — エンジニアリングマネージャー：アーキテクチャ、データフロー、エッジケースを確定
- **/plan-design-review** — シニアデザイナー：デザインレビュー、ゴミを掃除
- **/review** — シニアエンジニア：バグを自動修正、本番の問題を発見
- **/qa** — QA リーダー：実際のブラウザテスト + 回帰テスト
- **/investigate** — 体系的なデバッグ：根本原因の調査
- **/ship** — リリースエンジニア：同期、テスト、プッシュ、PR 作成
- **/browse** — ブラウザ担当：エンドツーエンドテスト

**Superpowers スキルチェーン**（自動トリガー、覚える必要なし）

- **brainstorming** — 「I want……」と言うとトリガー：ソクラテス式に設計を詳細化
- **using-git-worktrees** — 設計が承認されるとトリガー：分離環境
- **writing-plans** — 設計ドキュメントがあるとトリガー：2〜5 分のタスクに分解
- **subagent-driven-development** — 計画があるとトリガー：サブ Agent 実行 + 2 段階レビュー
- **test-driven-development** — 実装中にトリガー：RED-GREEN-REFACTOR を強制
- **systematic-debugging** — バグがあるとトリガー：4 段階の根本原因分析
- **requesting-code-review** — タスクの合間にトリガー：重大度に応じて問題を報告
- **finishing-a-development-branch** — タスク完了時にトリガー：マージ/PR/保持/破棄を決定

**Compound Engineering コマンド**

- **/ce:ideate** — 発散して改善点を探し、対抗的にフィルタリング
- **/ce:brainstorm** — 要件探索（Q&A）+ 要件ドキュメント生成
- **/ce:plan** — 技術計画を実行可能なタスクに変換
- **/ce:work** — ワークツリー実行 + アトミックコミット
- **/ce:review** — 4 つのレビュー Agent が多視点で指摘
- **/ce:compound** — 振り返り + 知識の記録（複利）

**ECC コマンド**

- **/tdd** — TDD の 3 ステップループを強制
- **/plan** — 要件分析 + タスク分解
- **/e2e** — エンドツーエンドテストを生成して実行
- **/code-review** — 品質レビュー（Critical/High/Medium）
- **/build-fix** — ビルドエラーを修正
- **/learn** — セッションから再利用可能なパターンを抽出してスキルを生成
- **/worktree** — 並行ワークツリー

### 3.4 組み合わせて使う高度な使い方

**シナリオ 1：新機能の立ち上げ**

```bash
/office-hours   → /plan-ceo-review   → /plan-eng-review   → /ce:plan
```

まず gstack で方向性を決め、次に Superpowers の brainstorming で詳細化し、最後に CE で実行可能な計画を出します。**3 つのツールがそれぞれの段階を担当し、「アイデアからタスクリストまで」の完全なチェーンを構成します。**

**シナリオ 2：機能の実装**

```
/ce:work → subagent-driven-development → test-driven-development → コードを書く
```

**シナリオ 3：レビュー + デバッグ**

```
/review → /ce:review → /qa → /investigate（バグが見つかった場合）
```

**シナリオ 4：リリース + 振り返り**

```
/ship → /document-release → /ce:compound
```

---

## 四、設計哲学（このシステムはなぜこう設計されたのか？）

### 4.1 スキルは製品：経験をインストール可能なコードにする

gstack の各ロール（CEO、QA、リリースエンジニア）、Superpowers の各プロセスは、詳細な説明が書かれた Markdown ファイル（スキル）です。**あなたが読んだチュートリアル、ハマった落とし穴、チームの小さなルールは、すべてスキルに編成して AI に厳密に実行させることができます**。これは「専門家の経験のソースコード化」——プログラムを書かなくても、役立つエンジニアリング能力を「書く」ことができます。

### 4.2 自動化は指示に勝る：プロセスを自分で進ませる

Superpowers の最大のブレークスルーは**自動トリガー（auto-trigger）**です：コマンドを覚える必要がなく、AI が会話の状態に応じて自動的に次の段階に入ります。これは実際の人間のチームの働き方に近い——リーダーがすべてのステップを指示する必要はなく、チームメンバーは「設計が終わったら計画を書くべきだ」と自分でわかっています。

### 4.3 複利思考：すべての仕事に複利を生ませる

「複利エンジニアリング」の真髄：**従来の開発は「機能を追加するたびにコードが保守しにくくなる」、複合エンジニアリングは「仕事のたびに知識を残して次回を楽にする」**。技術負債 vs 知識資産、後者を選びましょう。

### 4.4 サブ Agent オーケストレーション：2 段階レビューで品質を保証

Superpowers と CE はどちらも同じパターンを採用しています：**メイン Agent がタスクを分解 → サブ Agent が実行 → 独立したレビュー Agent が再チェック**。実行とレビューを分離し、実際の会社でコードレビューをする人が機能コードを書かないのと同じ——「自分で自分をチェックする」という盲点を避けます。

### 4.5 並列処理が一人を超える秘密

gstack は「プロセス」であり、ツールだけではありません：10〜15 の並列スプリントをサポートします（1 つはアイデアを話し合い、1 つは PR を修正し、1 つは新機能を書き、1 つは QA を実行）。これが「1 日で 10,000+ 行のコードを書く」の答えです——速く書くのではなく、**同時に複数のことをする**のです。

### 4.6 すべて無料オープンソース

gstack / Superpowers / Compound / ECC はすべて MIT License です。核心的な結論：**最強の AI 開発ツールは、有料の商用製品ではなく、コミュニティがオープンに反復して作り上げたスキル体系です**。

---

## 五、まとめ：核心的な考えと結論

これだけ覚えれば、プロジェクト全体の真髄をつかんだことになります：

1. **「コードを書く」は最後の工程にすぎない**——本当のエンジニアリングの 80% の時間は、考えること、計画すること、レビューすることです。このツールチェーンは「手を動かす前」と「手を動かした後」の工程をすべてカバーし、逆にあなたの時間を大幅に削減します。
2. **設計が先、計画はコードより高価**。詳細な計画と受け入れ基準があれば、コードを書くことは「表に従って埋める」だけになり、AI のエラー率も下がります。
3. **強制 TDD（テストファースト）は品質向上の近道**——まず失敗するテストを書き、次にコードを通過させ、最後にリファクタリングします。この古くからの方法で、AI のコードもオンライン品質を保てます。
4. **知識は蓄積すべきで、人と一緒に消えてはいけない**。技術負債は「腐る」が、複利は積み上がる：仕事が終わるたびに「次回はどうすれば速くなるか」と自問しましょう。
5. **自動トリガー > 手動指示**。人間の唯一の仕事は「要件を伝える + 意思決定」で、残りは AI が自動で引き継ぎ、効率が最大になります。
6. **一人 + AI = 20 人チーム**。誇張ではありません：gstack の 1 つのセッションで新機能を進め、別のセッションで並行して QA/リリースを行い、git worktree で分離すれば、完全に合理的です。
7. **聖杯は機能の多さではなく、プロセスが閉じているかどうか**。構想 → 計画 → 開発 → レビュー → テスト → リリース → 振り返り、このループが回れば、あなたは本当に AI の使い方を「マスター」したことになります。

---

## 六、参考リソース（さらに学ぶ）

- eric-claude-code-dev（本ガイド）：https://github.com/gyc567/eric-claude-code-dev
- gstack（Garry のソフトウェア工場）：https://github.com/garrytan/gstack
- Superpowers（Jesse Vincent のワークフロー）：https://github.com/obra/superpowers
- Superpowers 公式ブログ：https://blog.fsck.com/2025/10/09/superpowers
- Compound Engineering（複利エンジニアリング）：https://github.com/EveryInc/compound-engineering-plugin
- Everything Claude Code（ECC 最適化システム）：https://github.com/affaan-m/everything-claude-code

> **次のアクションリスト（30 分で完了できます）：**
>
> 1. gstack + Superpowers をインストール（約 10 分）
> 2. /office-hours を実行して製品アイデアをテスト（約 5 分）
> 3. /ce:plan でタスクリストを生成（約 5 分）
> 4. 開発完了後に /review と /ship を実行（約 10 分）
> 5. 最後に /ce:compound を忘れずに——次回を速くしましょう！

**一緒に ride the wave!** 🚀