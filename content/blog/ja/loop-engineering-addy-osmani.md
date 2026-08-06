---
title: "Loop Engineering 徹底解説（Addy Osmani 原著）：ターンごとの AI プロンプトをやめよ——仕事を発見し、割り当て、検証するループを設計せよ。そしてエンジニアであり続けよ"
description: "Addy Osmani（Google 元幹部、Google Cloud AI エンジニアリングディレクター）が個人ブログで公開したオリジナル記事『Loop Engineering』（2026-06-07）を完全解説。核心思想：loop engineering とは「エージェントにプロンプトを送る自分自身を、あなたが設計したシステムで置き換えること」——ループとは再帰的ゴール（recursive goal）であり、目的を定義すれば AI が完了まで反復する。冒頭で Peter Steinberger（「コーディングエージェントにプロンプトを送るのをやめろ。エージェントにプロンプトを送るループを設計すべきだ」）と Anthropic Claude Code 責任者 Boris Cherny（「私はもう Claude にプロンプトを送らない。私の代わりに Claude にプロンプトを送り、何をすべきか判断するループが動いている。私の仕事はループを書くことだ」）の二大名言がパラダイムを定める。収録内容：harness の一階層上に位置するループの概念（タイマーで動作し、サブエージェントを生み出し、自己給餌する）、5つの構成要素＋記憶（Automations/Worktrees/Skills/Plugins & Connectors/Sub-agents＋Memory）、Codex app と Claude Code のプリミティブ対比表、完全なループの姿（朝の自動化→トリアージスキル→worktree 分離→ドラフト/レビューのサブエージェント→コネクタが PR を開く）、ツール非依存の洞察、そしてループが代わりにやってくれない3つのこと（検証は依然あなたの責任、理解の腐敗、認知の降伏）。結びの金言：Build the loop. Stay the engineer.（ループを築け。だがエンジニアであり続けよ）。"
date: "2026-08-06"
author: "TopDigg Research Team"
tags: ["Loop Engineering", "Addy Osmani", "AI Agent", "Claude Code", "Codex", "Automations", "Worktrees", "Skills", "Sub-agents", "MCP", "Harness Engineering", "認知の降伏"]
categories: ["Deep Dive"]
keywords: ["Loop Engineering", "Addy Osmani", "循環エンジニアリング", "AI エージェント", "Claude Code", "Codex", "自動化", "ワークツリー", "スキル", "サブエージェント", "MCP", "Harness", "メモリ", "認知の降伏", "Stay the Engineer"]
---

# Loop Engineering 徹底解説（Addy Osmani 原文）：ターンごとの AI プロンプトをやめよ——仕事を発見し、割り当て、検証するループを設計せよ。そしてエンジニアであり続けよ

> 核心思想：**Loop engineering とは「エージェントにプロンプトを送る自分自身を、あなたが設計したシステムで置き換えること」**。Addy Osmani（Google 元幹部、Google Cloud AI エンジニアリングディレクター）は個人ブログのオリジナル記事（2026-06-07）でこう定義する：ループとは**再帰的ゴール（a recursive goal）**であり、目的を定義すれば AI が完了まで反復する。彼はこれがコーディングエージェントとの働き方の未来になり得ると考えるが、**「まだ初期段階で、私は懐疑的だ。そして token コストに絶対に注意しなければならない」**。冒頭で業界の二大名言がパラダイムを定める。Peter Steinberger（OpenClaw 作者）：「**あなたはもうコーディングエージェントにプロンプトを送るべきではない。エージェントにプロンプトを送るループを設計すべきだ**」。Anthropic Claude Code 責任者 Boris Cherny：「**私はもう Claude にプロンプトを送らない。私の代わりに Claude にプロンプトを送り、何をすべきか判断するループが動いている。私の仕事はループを書くことだ**」。ツールをターンごとに握るのをやめ、エージェントを「つつく」小さな制御システムを築く。だが最も鋭い警告は結末にある：**Build the loop. Stay the engineer.**——ループは検証を代わりにやらず、理解の腐敗を防がず、認知の降伏も防がない。判断力を持って設計すればループは解毒剤、思考を避けるために使えば加速剤になる。

---

## 一、本記事の説明

### 1.1 これは何か

本稿で解説するのは **Addy Osmani が個人ブログ（addyosmani.com）で公開したオリジナル記事『Loop Engineering』**（公開日 **2026-06-07**）です。チュートリアルではなく、「コーディングエージェントとどう協働するか」についてのパラダイム宣言＋実践解説です。

Addy Osmani の経歴は重要です：**Google 元幹部、現 Google Cloud AI エンジニアリングディレクター、Google に14年間在籍**。Web パフォーマンスとフロントエンド工学の分野で長年巨大な影響力を持ちます（『Learning JavaScript Design Patterns』著者、Chrome チーム出身）。2026年に彼は AI コーディング協働に関する一連の記事を密集して書きました——agent harness engineering、the factory model、orchestration tax、intent debt、comprehension debt、cognitive surrender、adversarial code review、code agent orchestra、long-running agents——そして『Loop Engineering』はまさにその一連の思想の**集大成**です。

定義：

> **Loop engineering is replacing yourself as the person who prompts the agent. You design the system that does it instead.**（Loop engineering は「エージェントにプロンプトを送る人」を置き換えること。代わりにそれを行うシステムをあなたが設計する。）

ループ＝**再帰的ゴール**：目的を定義し、AI が完了まで反復する。これは人間のエンジニアの役割移行の上に成り立つ工学規律です：**あなたは毎日プロンプトを打つ人ではなく、「誰が、いつ、どう検証するか」を設計する人になる。**

### 1.2 キーデータと情報

- 著者：**Addy Osmani**、Google 元幹部、Google Cloud AI エンジニアリングディレクター、世界的に有名なフロントエンドエンジニア／開発者アドボケイト
- 公開チャネル：個人ブログ `addyosmani.com`
- 公開日：**2026-06-07**
- スタンス：**「未来になるかもしれないが、まだ初期段階で、私は懐疑的だ。token コストに絶対に注意しなければならない」**（原文："I believe this may be the future of how we work with coding agents. However, its still early, I'm skeptical and you absolutely have to be careful about token costs"）
- 引用元：Peter Steinberger（OpenClaw 作者）、Boris Cherny（Anthropic Claude Code 責任者）
- 概念の系譜：agent harness engineering（単一エージェントが動く環境）→ factory model（ソフトウェアを構築するシステム）→ **loop engineering（harness の一階層上：タイマーで動き、サブエージェントを生み、自己給餌する）**
- 関連シリーズ：orchestration tax、intent debt、comprehension debt、cognitive surrender、adversarial code review、code agent orchestra、long-running agents

### 1.3 何を解決するのか

この2年間、コーディングエージェントから成果を得る方法はこうでした：**良いプロンプトを書き、十分なコンテキストを共有し、何かを打ち込み、返ってきたものを読み、次の何かを打ち込む**——「エージェントはツールであり、あなたはそれを全時間握っている。ターンとターンの連続」。Addy の判定：**「その部分は基本的に終わった」（"That part is kind of over, or at least some think it's going to be."）**

新しいパラダイムの答え：**エージェントとの直接対話を置き換える小さなシステムを築く。** そのシステムが、仕事を発見し（finds the work）、配り（hands it out）、チェックし（checks it）、完了事項を書き留め（writes down what is done）、次の一手を決める（decides the next thing）。そしてあなたの代わりにそのシステムがエージェントを「つつく」。

重要な転換：これは**もはやツールレベルの問題ではない**。一年前、ループが欲しければ自分で bash の山を書いて永遠にメンテナンスするしかありませんでしたが、**今や構成要素は製品（Codex、Claude Code など）に直接組み込まれている**。Steinberger のリストは Codex app にほぼ完全にマッピングでき、Claude Code にもほぼ同じようにマッピングできる——形が同じだと気づけば「どのツールを使うか」の議論はやめて、「どのツールに座っていても機能するループ」を設計すればいいのです。

---

## 二、核心思想

### 2.1 一言の定義と業界の二大名言

Addy は冒頭の二つの引用でパラダイムを決めます。まず Peter Steinberger（OpenClaw 作者。2026年で最も話題になった個人 AI アシスタント OSS）：

> "You shouldn't be prompting coding agents anymore. You should be designing loops that prompt your agents."（あなたはもうコーディングエージェントにプロンプトを送るべきではない。エージェントにプロンプトを送るループを設計すべきだ。）

次に Anthropic Claude Code 責任者 Boris Cherny：

> "I don't prompt Claude anymore. I have loops running that prompt Claude and figuring out what to do. My job is to write loops."（私はもう Claude にプロンプトを送らない。私の代わりに Claude にプロンプトを送り、何をすべきか判断するループが動いている。私の仕事はループを書くことだ。）

### 2.2 ループは harness の一階層上に座る：階層的世界観

Addy は以前『agent harness engineering』と『the factory model』で「単一エージェントが動く環境」と「ソフトウェアを構築するシステム」を書きました。Loop engineering の位置づけ：

> **Loop engineering sits one floor above the harness.**（Loop engineering は harness の一階層上に座る。）

- **Harness**：**一回の**エージェント実行の足場（ツール、合格基準、フィードバックループ）
- **Loop**：**「the harness but it runs on a timer, it spawns little helpers, and it feeds itself」**——同じ harness だが、タイマーで動き、小さなヘルパー（サブエージェント）を生み出し、自己給餌（self-feeding）する

つまり：harness は**一回の**実行を武装し、ループは**エージェントを継続的にスケジュールし、サブエージェントを生み、自分自身に材料を供給する**層です。

### 2.3 形が同じなら → ツールの議論をやめる

Addy は自分を驚かせた観察を強調します：**「This is not really a tool thing anymore.」（これはもはやツールレベルの問題ではない。）** 一年前、ループは自分で書いた bash を永遠にメンテナンスすることでした。今は**構成要素が製品に組み込まれている**。結論：

> 形が同じだと気づけば、どのツールかで議論するのをやめ、**どのツールに座っていても機能するループ**を設計する。

つまりループ設計は**ツール非依存（tool-agnostic）の技芸**——この記事で最も重要な認識の一つです。

---

## 三、詳細チュートリアル：ループに必要な5つのもの＋記憶を置く場所

Addy は明確にリストを与えます：**「A loop needs five things and then one place to remember stuff.」（ループには5つのものと、物事を覚えておく場所が1つ必要だ。）**

| # | 構成要素 | ループでの役割 |
|---|---------|--------------|
| 1 | **Automations（自動化）** | スケジュールで自動発火し、発見とトリアージを自ら行う |
| 2 | **Worktrees（ワークツリー）** | 並行する2つのエージェントが互いを踏まないようにする |
| 3 | **Skills（スキル）** | エージェントが推測するしかないプロジェクト知識を書き留める |
| 4 | **Plugins & Connectors（プラグインとコネクタ）** | エージェントを既存ツールに接続する |
| 5 | **Sub-agents（サブエージェント）** | 一方がアイデアを出し、別の一方がチェックする |
| 6 | **Memory（記憶）** | 単一会話の外に存在し、「やったこと／次にやること」を保持する場所 |

### 3.1 ツールのプリミティブ対比表（Codex app vs Claude Code）

| プリミティブ | ループでの役割 | Codex app | Claude Code |
|---|---|---|---|
| **Automations** | スケジュールで自動発見＋トリアージ | Automations タブ：プロジェクト・プロンプト・頻度・環境を選択。発見した実行は Triage インボックスへ。`/goal` で完了まで実行 | スケジュールタスクと cron、`/loop`、`/goal`、hooks、GitHub Actions |
| **Worktrees** | 並行機能開発の分離 | スレッドごとに組み込みの worktree | `git worktree`、`--worktree`、サブエージェントに `isolation: worktree` |
| **Skills** | プロジェクト知識の定着 | Agent Skills（`SKILL.md`）、`$名前` または暗黙に呼び出し | Agent Skills（`SKILL.md`） |
| **Plugins / Connectors** | あなたのツールに接続 | Connectors（MCP ベース）＋配布用 plugins | MCP servers ＋ plugins |
| **Sub-agents** | アイデア出し＋検証 | `.codex/agents/` に TOML で定義 | `.claude/agents/` のタスクサブエージェント、agent teams |
| **State（記憶）** | 完了・未完了の追跡 | コネクタ経由で Markdown か Linear へ | Markdown（`AGENTS.md`、progress ファイル）または MCP 経由で Linear へ |

> 「名前はあちこち少し違うが、能力は同じものだ。」（"The names are a bit different here and there but the capability is the same thing."）

### 3.2 順に解説：Automations——ループの鼓動

**Automations はループを本当の「ループ」にするもの——「一度だけ手動で走らせた」ではなく。**

- **Codex app**：Automations タブで自動化を作成し、**プロジェクト、プロンプト、実行頻度、実行環境**（ローカル checkout かバックグラウンド worktree か）を選択。何かを発見した実行は **Triage インボックス**に入り、何も見つからなかった実行は自分でアーカイブされます（"which is nice"）。OpenAI は社内で退屈な日常業務に使っています：**毎日の issue トリアージ、CI 失敗の要約、コミットブリーフィングの作成、先週誰かが入れたバグの追跡**。自動化はスキルを呼べるので、繰り返しの作業を保守可能に保てます——巨大な指示の壁を誰も更新しないスケジュールに貼る代わりに、`$skill-name` を発火させるのです。
- **Claude Code**：スケジューリングと hooks で同じ場所に到達します。`/loop` で間隔実行、cron で定期タスク、hooks でエージェントライフサイクルの各ポイントにシェルコマンドを発火、または全部を **GitHub Actions** に押し込んで、ノートパソコンを閉じた後も動かし続ける。

知っておくべき**セッション内プリミティブ**（本記事の主題により近いもの）：

- **`/loop`**：カデンス（間隔）で再実行。
- **`/goal`**：あなたが書いた条件が実際に真になるまで動き続けます。**毎ターン後に、別の独立した小さなモデルが完了をチェック**——コードを書いたエージェントが自分で採点しない。例：「`all tests in test/auth pass and lint is clean`」のような条件を与えて、あなたは立ち去る。Codex にも同じく `/goal` があり、検証可能な停止条件が成立するまでターンをまたいで働き、pause／resume／clear をサポート。

> 「同じプリミティブ、両方のツール——それがこの記事全体のパターンみたいなものだ。」（"Same primitive, both tools, which is kind of the pattern for this whole article."）

**役割**：Automations は**仕事を水面に浮かび上がらせる**部分であり、ループの残りはそれに**作用する**部分です。

### 3.3 順に解説：Worktrees——並行を混乱にしない

**2つ以上のエージェントを動かした瞬間、ファイル衝突が失敗になります。** 2つのエージェントが同じファイルを書くのは、互いに相談せず同じ行にコミットする2人のエンジニアとまったく同じ頭痛です。

- **git worktree**：リポジトリ履歴を共有する、独自ブランチ上の独立した作業ディレクトリ——一方のエージェントの編集は、文字どおり他方の checkout に触れられません。
- **Codex**：worktree サポートを組み込み、複数のスレッドが同時に同じリポジトリにぶつからずにアクセスできます。
- **Claude Code**：`git worktree`、独自 checkout でセッションを開く `--worktree` フラグ、サブエージェントに付ける `isolation: worktree` 設定（各ヘルパーが使い捨ての自動クリーンアップ checkout を取得）で同じ分離を実現。

Addy の補足（自身の『orchestration tax』を踏まえて）：**worktree は機械的な衝突を取り除くが、あなた自身が依然として天井**——実際に並行実行できるエージェント数を決めるのはツールではなく、あなたのレビュー帯域です。

### 3.4 順に解説：Skills——毎回プロジェクトを説明するのをやめる

**Skill とは、金魚のように毎セッション同じプロジェクトコンテキストを説明し直すのをやめるためのもの。**

- 両ツールとも**同じ形式**：中に `SKILL.md`（指示とメタデータ）を持つフォルダ＋任意の scripts／references／assets。
- **Codex**：`$` または `/skills` で呼び出すか、タスクがスキル説明に一致すれば**自動**で実行——「緊密で退屈な説明が、賢い説明に勝る」理由がここにあります。
- **Claude Code**：同じ仕組み。

Skills は **intent debt（意図の負債）** の解毒剤です。Addy が『intent debt』で論じた通り：**エージェントは毎セッション冷間起動し、あなたの意図の穴を自信に満ちた推測で埋める**。スキルはその意図を外部に書き出す——慣習、ビルド手順、「あの事故があったからこうはしない」——一度書いて、エージェントが毎回読む。

> スキルがなければ、ループは毎サイクルプロジェクト全体をゼロから導出する。スキルがあれば、複利的に成長する（compounds）。

一つ区別を覚えておくこと：**スキルは「創作形式」であり、プラグインは「配布方法」**。リポジトリをまたいでスキルを共有したり、複数を束ねたりするときはプラグインとしてパッケージ化します——Codex でも Claude Code でも同じ。

### 3.5 順に解説：Plugins & Connectors——ループが本物のツールに触れる

**ファイルシステムしか見えないループは、小さなループだ。**

- **Connectors**（**MCP** 上に構築）で、エージェントは issue トラッカーを読み、データベースに問い合わせ、staging API を叩き、Slack にメッセージを落とせます。
- Codex と Claude Code は両方 MCP を話すので、**一方用に書いたコネクタは通常そのまま他方でも動きます**。
- **Plugins** はコネクタとスキルを束ね、チームメイトが記憶から全部を作り直す代わりに、ワンショットでセットアップをインストールできるようにします。

これは「エージェントが『修正はこれだ』と言う」と「**ループが CI がグリーンになったら自分で PR を開き、Linear チケットをリンクし、チャンネルに ping する**」の違いです。**コネクタこそ、ループが「できたらこうする」と言うだけでなく、実際の環境の中で行動できる理由です。**

### 3.6 順に解説：Sub-agents——「作る人」と「チェックする人」を分離する

**ループの中で断然最も有用な構造的要素は、「書く人」と「チェックする人」を分けること。**

> コードを書いたモデルは、自分の宿題を採点するときあまりに甘い（way too nice grading its own homework）。異なる指示を持ち、時には異なるモデルを使う2つ目のエージェントが、1つ目のエージェントが自分を説得してしまった問題を掴む。

- **Codex**：要求したときだけサブエージェントを生成し、並行実行し、結果を1つの回答に畳み込みます。`.codex/agents/` で独自エージェントを TOML 定義（name、description、instructions、任意の model と reasoning effort）——**セキュリティレビュアーは高 effort の強いモデルに**、**探索者は高速リードオンリーの小さなものに**できます。
- **Claude Code**：`.claude/agents/` のタスクサブエージェントと、互いに作業を渡す **agent teams**。
- 両ツール共通の分担：**一つが探索（explores）、一つが実装（implements）、一つが仕様に対して検証（verifies）**。

なぜループ内で特に重要か：**ループはあなたが見ていない間に動く**。だからあなたが本当に信頼できる検証者こそ、あなたが立ち去れる唯一の理由です。コスト：サブエージェントは各自がモデルとツールの仕事をするので**より多くの token を消費**——セカンドオピニオンに払う価値がある場所に使うこと。

Addy はもう一層見抜きます：**Claude Code の `/goal` は本質的にこのパターン**——仕事をしたモデルではなく、新しいモデルがループの完了を決める。「作り手／チェッカー分離」が**停止条件そのもの**に適用されています。

### 3.7 完全なループはどんな姿か（Addy がよく使う形）

組み立てると、一本のスレッドが小さなコントロールパネルになります：

> 1. **毎朝、自動化がこのリポジトリで動く**。そのプロンプトは **triage スキル**を呼び、昨日の CI 失敗・開いている issue・最近のコミットを読み、発見を Markdown ファイルか Linear board に書く。
> 2. やる価値のある発見ごとに、スレッドは分離された **worktree** を開き、**修正のドラフトを作るサブエージェント**を送る。
> 3. **2つ目のサブエージェント**が、プロジェクトスキルと既存テストに照らしてそのドラフトをレビューする。
> 4. **Connectors** がループに PR を開かせ、チケットを更新させる。
> 5. ループが処理できないものはすべて **triage インボックス**に落ちて、あなたが扱う。
> 6. **状態ファイルが全体の背骨**——何を試したか、何が通ったか、何がまだ開いているかを覚えているので、翌朝の実行は今日の終点から続く。

そして Addy は本質を一言で指します：

> 「実際にあなたがやったことを見てみよう：**あなたは一度設計しただけだ。そのどのステップにもプロンプトを送っていない。** それが Steinberger の主張が現実になった姿だ——そして Codex でも Claude Code でも同じループだ。なぜなら構成要素が同じだから。」

---

## 四、設計哲学：ループが代わりにやってくれない3つのこと

Addy が記事全体で最も重視する警告：**「The loop changes the work, it does not delete you from it.」（ループは仕事を変えるが、あなたを仕事から消し去りはしない。）** しかも3つの問題はループが良くなるほど**より鋭くなる**のであって、簡単にはならない。

### 4.1 検証は依然としてあなたの責任（Verification is still on you）

> 「無人で動くループは、無人で間違いも犯すループだ。」

検証サブエージェントを作り手から分離するのは、ループの「完了した」に意味を持たせるためです。それでも「完了した」は**主張（a claim）であり、証明（a proof）ではありません**。Addy は『code review in the age of AI』からの同じ言葉を繰り返します：**あなたの仕事は「自分が実際に動くことを確認したコード」をリリースすることだ。**

### 4.2 あなたの理解は、放置すれば腐る（Your understanding still rots if you allow it）

> ループがあなたが書いていないコードを速く出荷するほど、「存在するもの」と「あなたが実際に理解しているもの」のギャップは大きくなる。それが**理解の負債（comprehension debt）**——滑らかなループはそれをより速く育てるだけだ。**あなたがループの作ったものを読まない限り。**

### 4.3 快適な姿勢こそ危険な姿勢：認知の降伏（Cognitive surrender）

> ループが自分で動いてうまくいくと、意見を持つことをやめ、返ってくるものは何でも受け取るのがとても魅力的になる。Addy はそれを**認知の降伏（cognitive surrender）**と呼ぶ。

この記事で最も哲学的な一行：

> **「Designing the loop is the cure when you do it with judgement and the accelerant when you do it to avoid thinking, same action, opposite result.」（判断力を持ってループを設計すれば解毒剤、思考を避けるために使えば加速剤。同じ行動、正反対の結果。）**

### 4.4 結びの金言：Build the loop. Stay the engineer.

Addy の完全な締めくくりの論証：

1. **これは仕事の進化のプレビュー**：「I think this is a preview of how our work is going to evolve.」
2. **だが彼は人間によるレビューを放棄しない**：「自分でコードをレビューしなかったり、完全に自動化ループに頼って修正したりしたら、製品の品質は下がるだろう。おそらく下向きスパイラルにはまり、自分をどんどん深い穴に掘り続けることになるだろう。」
3. **バランス**：「ループをセットアップしなさい。だが、エージェントに直接プロンプトを送ることもまた効果的だということを忘れないで。要は正しいバランスを見つけることだ。」
4. **ループは人によって結果が変わる**：「まったく同じループを2人が作っても、正反対の結果になる。一方は深く理解している仕事を速く進めるために使う。もう一方は仕事の理解を避けるために使う。**ループはその違いを知らない。あなたが知っている。** それこそが、ループ設計をプロンプトエンジニアリングより難しくしている理由だ——簡単ではない。」
5. **てこの点が動いた**：「Cherny の主張は仕事が楽になったということではない。**てこの点（the leverage point）が動いた**ということだ。」
6. **最終句**：「**Build the loop. But build it like someone who intends to stay the engineer, not just the person who presses go.**」（ループを築け。だが「スタートボタンを押すだけの人」ではなく、「エンジニアであり続けるつもりの人」として築け。）

---

## 五、帰納的まとめ

### 5.1 核心的見解リスト

1. **定義**：loop engineering＝「エージェントにプロンプトを送る人」をあなたが設計したシステムで置き換えること。ループ＝再帰的ゴール。目的を定義し、AI が完了まで反復する。
2. **パラダイムシフト**：「エージェントはツールで、あなたがターンごとに握る」時代は基本的に終わった——今はエージェントを「つつく」小さなシステムを築く。
3. **位置づけ**：ループは harness の一階層上——同じ harness だが、タイマーで動き、サブエージェントを生み、自己給餌する。
4. **ツール非依存**：構成要素は製品（Codex／Claude Code）に組み込まれた。形が同じならツールの議論をやめ、どこに座っても動くループを設計する。
5. **5つの構成要素＋記憶**：Automations（鼓動）、Worktrees（並行分離）、Skills（知識の複利）、Plugins／Connectors（本物のツールに到達）、Sub-agents（作り手／チェッカー分離）＋Memory（状態ファイルが背骨）。
6. **検証は依然あなたの責任**：「完了」は主張であって証明ではない。無人ループは無人で間違いを犯す。
7. **理解の負債と認知の降伏**：ループが書いていないコードを速く出荷するほど理解のギャップは拡大し、快適な「結果をそのまま受け取る」姿勢は危険。
8. **ループ設計はプロンプトエンジニアリングより難しい**：ループはあなたが加速しているのか逃避しているのか知らない——知っているのはあなただけ。てこの点は動いたが、責任は消えていない。

### 5.2 一言でまとめ

> **ループが変えるのは「誰がプロンプトを送るか」という問いであって、「誰が責任を負うか」という問いではない。** ループを築いて、仕事を発見させ、配らせ、結果を検証させよ。だが、それが生み出したものを読み、コードへの理解を保ち、判断力を持って設計せよ——**Build the loop. Stay the engineer.**

---

## 参考資料

- 原文：Addy Osmani、『Loop Engineering』（2026-06-07）—— `https://addyosmani.com/blog/loop-engineering/`
- Addy Osmani 関連シリーズ：『Agent Harness Engineering』『The Factory Model』『Orchestration Tax』『Intent Debt』『Comprehension Debt』『Cognitive Surrender』『Adversarial Code Review』『Code Agent Orchestra』『Long-Running Agents』『Code Review in the Age of AI』—— すべて `addyosmani.com/blog/` で検索可能
- Peter Steinberger（OpenClaw 作者）の「designing loops that prompt your agents」に関する公開発言
- Boris Cherny（Anthropic Claude Code 責任者）の「my job is to write loops」に関する公開発言
- 当サイト関連記事：『Loop Engineering 徹底解説（Cobus Greyling 原著）』（`loop-engineering-substack-analysis`）、『Loop Engineering オレンジブック徹底解説』（`loop-engineering-orange-book`）
