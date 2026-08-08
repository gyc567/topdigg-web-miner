---
title: "Oh My Hermes 徹底解説：「複数の AI に議論させる」をエンジニアリング規律にするマルチエージェント編成フレームワーク"
description: "GitHub プロジェクト witt3rd/oh-my-hermes（OMH）を徹底解説——Nous Research の Hermes Agent のために作られたマルチエージェント編成スキル集で、oh-my-claudecode から着想を得つつ、Hermes のプリミティブに基づいて全面的に書き直されている。中核となる思想：単一の AI が一気に答えを出すと、自分自身にも見えない盲点が出やすい。OMH はプランナー、アーキテクト、批評者という三つのロールが互いに議論して合意に達し、その後エグゼキューターがコードを書き、ベリファイアが証拠を確認し、アーキテクトが最終審査を行う。本文では十のスキル（omh-ralplan / omh-ralph / omh-deep-research / omh-deep-interview / omh-autopilot とそれぞれの driver プレイブック）、ロール注入フック機構、原子状態管理、三振アウトのサーキットブレーカー、証拠は主張に勝るという鉄則、ファイル所有権の分離、.omh ディレクトリの「選択的共有」という慣習、そしてリポジトリに明記された十四条の設計哲学まで網羅。中核思想、プロジェクト概要、設計哲学から、ゼロからの詳細チュートリアル（インストール → 最初のプランニング → 実行ループ → 全自動パイプライン）と総括的な見解まで、一つの記事で徹底的に解説する。"
date: "2026-08-08"
author: "TopDigg Research Team"
tags: ["Oh My Hermes", "OMH", "Hermes Agent", "AI Agent", "Multi-Agent", "多智能体", "Agent Skills", "Nous Research", "oh-my-claudecode", "Orchestration", "Consensus Planning"]
categories: ["Deep Dive"]
keywords: ["Oh My Hermes", "OMH", "Hermes Agent", "マルチエージェント編成", "コンセンサスプランニング", "omh-ralplan", "omh-ralph", "AI エージェントスキル", "delegate_task", "ロール注入", "三振アウト", "証拠検証", "Nous Research"]
---

# Oh My Hermes 徹底解説：「複数の AI に議論させる」をエンジニアリング規律にするマルチエージェント編成フレームワーク

> 中核思想：**単一の AI が単独で作業すると、自分自身にも見えない盲点が生まれる。複数の AI にそれぞれ異なるロールを演じさせ、互いにあらを探し合い、議論して一致に達すれば、生まれる成果はずっと強い。** Oh My Hermes（略称 OMH）は、まさにこれを再利用可能な「スキルパック」にしたものだ。Nous Research の Hermes Agent に十のスキルを提供する。プランニングでは**プランナー**が先に案を出し、**アーキテクト**が構造を審査し、**批評者**が専門で場をぶち壊しに行く。三人全員が納得して初めて承認される。実行時には**エグゼキューター**がコードを書き、**ベリファイア**は実際のテスト出力だけを見る（口先の主張は見ない）、**アーキテクト**が最後にもう一度最終審査を行う。フレームワーク全体には、二つの重しのような鉄則がある——「**証拠は主張に勝る**」（テスト出力を見なければ合格としない）と「**同じ誤りを三回犯したら停止する**」（三振アウト・サーキットブレーカー）。さらに見事なのは：OMH は**自分自身で自分を作った**ことだ——最初に作られたスキルはコンセンサスプランナー `omh-ralplan` で、そのスキルを使って、マルチエージェントの議論を通じて残りの全スキルを設計した。

---

## 目次

- [一、平易な言葉で説明すると：このプロジェクトは一体何をやっているのか](#一平易な言葉で説明するとこのプロジェクトは一体何をやっているのか)
- [二、プロジェクト概要](#二プロジェクト概要)
- [三、コアとなる思想：五つの重要概念](#三コアとなる思想五つの重要概念)
- [四、十のスキルを一つずつ解説](#四十のスキルを一つずつ解説)
- [五、プラグイン層：ロール注入と原子状態](#五プラグイン層ロール注入と原子状態)
- [六、設計哲学（十四条）](#六設計哲学十四条)
- [七、詳細チュートリアル：ゼロから始める](#七詳細チュートリアルゼロから始める)
- [八、総括としての見解と結論](#八総括としての見解と結論)
- [九、参考資料](#九参考資料)

---

## 一、平易な言葉で説明すると：このプロジェクトは一体何をやっているのか

### 1.1 小学生でもわかるたとえ話

LEGO の城を建てたいと想像してみてください。

**普通のやり方**（AI 一台で単独作業）：とびきり賢い同級生を呼んで、「城を設計してくれ」と頼みます。彼は三分考えて一枚の図を描き、「できた」と言います。その図に従って組み立てていくと、途中で気づく——門が堀のど真ん中に開いていて、入れない。

**Oh My Hermes のやり方**（複数の AI で分業）：三人の同級生を呼びます。

- **一人目は「プランナー」**：彼は図面を描く担当で、「城を建てる」を一歩一歩の小さなタスクに分解する——まず基礎を打ち、次に壁を積み、それから門を取り付け、最後に旗を立てる。
- **二人目は「アーキテクト」**：彼は図面を描かない。図面が頑丈かどうかだけを見る。「基礎がレンガ二個しかないのに、上に二十層も載せる？崩れたらどうする？」
- **三人目は「批評者」**：彼の仕事は**専門であらを探し、専門で難癖をつけること**。彼はこう問う：「本当に城を建てるつもりなのか？問題文は『人が住める場所』と言っているぞ。テントの方が早いんじゃないか？」——注目すべきは、彼は**問題文そのもの**にすら疑いを向けることだ。

三人で一ラウンド議論し、プランナーが意見に基づいて図面を直す。そして二ラウンド目。**三人全員が「同意する」と言って初めて、図面は完成稿になる。**

図面が決まったら、別の三人が登場します：

- **「エグゼキューター」**：実際にブロックを組み立てる人。ルールは厳格——**自分に割り当てられたブロックにだけ触れていい**。他の人が担当する部分は見てもいいが、動かしてはいけない。
- **「ベリファイア」**：組み立てが終わったら彼が検査する。ただし彼には鉄則がある：**エグゼキューターの「組み立て終わった」という言葉は信じない。写真しか見ない。** 実写の写真（実際のテスト出力）がなければ、一律で不合格とする。
- **「アーキテクト」**：すべてのタスクが終わった後、彼が全体をもう一度見渡し、うなずいて初めて本当の完成となる。

これが Oh My Hermes です。ソフトウェアツールではなく、**AI にどう分業させ、どう議論させ、どう検収するかを教える規律のセット**なのです。

### 1.2 なぜこの規律が必要なのか

AI には誰もが知る癖があります：**それは自信過剰だということ。**

コードを書かせると、書き終わって「完了しました、テストは通っています」と言ってきます。しかし多くの場合、テストをまったく実行していないか、実行しても結果を見ていません。これは嘘をついているのではなく、大規模言語モデルの生成特性——「もっともらしい文を補完している」だけなのです。

OMH の解決策はとても素朴で、とても工学的です：**AI の言うことを信じるな、AI のやったことだけを見ろ。**

- ベリファイアは**読み取り専用**で、コードを変更できず、「合格」か「不合格」かだけを判断できる。
- テストの実行は、**ベリファイアにもエグゼキューターにも任せず、総指揮（オーケストレーター）自身が実行し**、その実際の出力をベリファイアに渡して見せる。そうすればベリファイアは「グラウンドトゥルース」を手にして、エグゼキューターの報告に引きずられない。
- 検収基準五つのうち四つが通った？**不合格だ。** 「ほぼ合格」ではなく、「FAIL」。

---

## 二、プロジェクト概要

### 2.1 これは何か

**Oh My Hermes（OMH）** は、[Hermes Agent](https://github.com/NousResearch/hermes-agent)（Nous Research が公開しているオープンソースの AI エージェント）のために書かれた**マルチエージェント編成スキル集**です。

リポジトリ：`https://github.com/witt3rd/oh-my-hermes`

README に書かれた一言での位置づけ：

> "OMH provides composable skills for consensus planning, requirements interviewing, and verified execution — plus an optional plugin that adds hook-based role injection, atomic state management, and evidence gathering. **Skills work standalone with zero dependencies.**"
>
> （OMH は、コンセンサスプランニング、要件インタビュー、検証付き実行のための合成可能なスキルを提供します——さらに、フックベースのロール注入、原子状態管理、証拠収集を追加するオプションのプラグインも付属します。**スキルは独立して動作し、依存関係はゼロです。**）

最後の **"Skills work standalone with zero dependencies"（スキルは独立して動作し、依存関係はゼロ）** という一文に注目してください——これは OMH のアーキテクチャを理解するための最初の鍵であり、後で詳しく説明します。

### 2.2 主要データ

| 項目 | データ |
| --- | --- |
| リポジトリ | `witt3rd/oh-my-hermes` |
| Star 数 | 243（分析時点） |
| Fork 数 | 22 |
| コミット数 | 76 commits |
| ライセンス | MIT |
| 言語 | Python（プラグイン）+ Markdown（スキル定義） |
| 依存要件 | Hermes Agent v0.7.0+；プラグインは別途 Python 3.10+ と `pyyaml` が必要 |
| 着想の源 | [oh-my-claudecode](https://github.com/Yeachan-Heo/oh-my-claudecode)（略称 OMC） |

### 2.3 十のスキル一覧

| スキル | 何をするか |
| --- | --- |
| **omh-deep-research** | 多段階のウェブ調査：分解 → 並列検索 → 総合 → 引用の真偽を検証 |
| **omh-ralplan** | コンセンサスプランニング：プランナー → アーキテクト → 批評者、議論して合意に達する |
| **omh-ralplan-driver** | ralplan を駆動する**総指揮のプレイブック**——コンテキストパッケージ作成（品質が生まれる場所）、ラウンドのスケジューリング、蒸留、最終審査 |
| **omh-deep-interview** | ソクラテス式の要件インタビュー、カバレッジ追跡付き |
| **omh-ralph** | 検証付き実行：実装 → 検証 → 完了するまで反復 |
| **omh-ralph-driver** | ralph を駆動する**総指揮のプレイブック**——プランの形態、並列バッチ、証拠収集、ベリファイアの規律、三振アウトの分類、第 7 ステップのアーキテクト最終審査、コミット規範 |
| **omh-ralph-task** | 単一タスク実行者としての規律——タスクエンベロープ契約、ファイルスコープの厳格さ、HEAD に対する stash 検証（兄弟タスクの干渉を隔離）、コミット作者の上書き、構造化された報告フォーマット |
| **omh-triage**（v0.1） | マルチロールによるコンセンサス型 issue トリアージ——メンテナー（コードにアンカー）+ スケプティック（剪定） |
| **omh-triage-driver**（v0.1） | triage を駆動する総指揮のプレイブック——事前フライトのバックログ監査、ロールのラウンドスケジューリング、蒸留、ユーザーのサインオフ関門 |
| **omh-autopilot** | 全パイプライン、上記のすべてのスキルをエンドツーエンドで連結 |

### 2.4 推奨される組み合わせパイプライン

**馴染みのない領域**の要件に直面したとき、公式が推奨する完全なチェーンは次のとおりです：

```
omh-deep-research  →  omh-deep-interview  →  omh-ralplan  →  omh-ralph
   （まず領域を理解）        （要件を明確に）        （案を議論）      （実行＋検収）
```

領域に詳しいなら、インタビューから始めて調査段階をスキップしてください。

### 2.5 バージョンロードマップ（ROADMAP.md）

```
v1.0：           スキルのみ——冗長だが使える、ゼロ依存
v2.0（現在）：    Hermes プラグイン——フックベースのロール注入を備えたインフラ層
v3.0（将来）：    上流の NousResearch/hermes-agent の optional-skills/ に PR を出す
```

このロードマップ自体が一種の現実主義を体現しています：**まず最も素朴でゼロ依存のやり方で動かしてから、インフラを最適化し、最後にようやく本流への採用を考える。**

---

## 三、コアとなる思想：五つの重要概念

### 3.1 コンセンサスプランニング：批評者に場をぶち壊させる

`omh-ralplan` のフローは次のとおりです：

```
プランナーが案を起草する
    → アーキテクトが構造が頑丈か審査する
    → 批評者が対抗的な視点で前提に挑戦する
    → 三人全員が APPROVE でない場合：プランナーが改訂し、前のステップに戻る（最大 3 ラウンド）
    → 合意に達する：案を .omh/plans/ に書き込む
```

ドキュメントの原文が、批評者の価値をズバリ指摘しています：

> "**The Critic's job is to break the plan — if it survives, it's stronger for it.**"
>
> （批評者の仕事はプランを壊すこと——もし持ちこたえれば、その分だけ強くなる。）

**ラウンドの戦略にも工夫があります**：

- **第 1 ラウンド：直列**。プランナー → アーキテクト → 批評者と順番に。後ろの人は前の人の成果物を見る必要があるからです。
- **第 2 ラウンド以降：並列**。プランナーが改稿し終えたら、アーキテクトと批評者が**同時に**再審査します（バッチの `delegate_task` を使う）、時間を節約するためです。

**停止条件**：最大 3 ラウンド。第 3 ラウンドまでに合意が得られなければ、「留保意見付き」で案を出力し、人間に判断を委ねます。いずれかのロールが REJECT を投げたら、その懸念を直接ユーザーに伝えます。

### 3.2 META 問題：批評者は「問題文そのもの」を疑うことを許可されなければならない

これは OMH 全体の中で**最も洞察力のある設計の一つ**で、`omh-ralplan-driver` の第 4 番目の落とし穴（P4）に由来します：

> "**P4 — Critic must be licensed to contest framing:** If the context package lists only 'things to push on inside the current frame,' the Critic will stay inside the frame. Add the META question explicitly. [...] **Without licensing, the Critic catches details. With licensing, the Critic catches the frame.**"
>
> （P4——批評者はフレームそのものを疑うことを許可されなければならない：コンテキストパッケージに「現在のフレーム内で突っ込める点」しか列挙されていなければ、批評者はおとなしくフレームの中に留まる。META 問題を明示的に追加せよ。……**許可がなければ、批評者が捕まえられるのは細部だけ。許可があれば、批評者はフレームそのものの誤りを捕まえられる。**）

LEGO 城のたとえで言えば：批評者に「図面に問題がないかチェックして」とだけ言えば、彼は「堀の幅が足りない」と言うでしょう。しかし「そもそも城を建てるべきかどうかを疑ってもいい」と伝えれば、彼は「実はユーザーは住める場所が欲しいだけだ。テントなら十分で組み立てられる」と言うかもしれません。

**後者の方が、本当に価値のある意見なのです。**

ドキュメントは、この規則を裏付ける実例も挙げています：

> "The Critic's simplicity test can change architecture — don't dismiss it. In the ralph consensus, the Critic proposed one-task-per-invocation (instead of an in-session loop) which both reviewers then approved as fundamentally better."
>
> （批評者の「シンプルさのテスト」はアーキテクチャを変え得る——軽視してはいけない。ralph のコンセンサス過程で、批評者は「呼び出しごとにタスクを一つだけ実行する方式」（セッション内ループの代わり）を提案し、他の二人のレビュアーは根本的により良いとして承認した。）

**OMH の中核となる実行アーキテクチャは、批評者がぶち壊して生まれたものです。**

### 3.3 反実仮想的従属テスト（Counterfactual Deference Test）

これは P7 番目の落とし穴で、「AI が説得されたふりをする」のを防ぐ、非常に巧妙なチェックです：

> "**P7 — Counterfactual deference test:** Would this defense have adopted a *different* alternative if a counterfactual Critic had proposed it? If all the Planner's grounds also justify a counterfactual alternative, the adoption is deferential — pattern-matching, not principled."
>
> （P7——反実仮想的従属テスト：もし反実仮想的な批評者が**別の**代替案を提案していたら、この弁護はその案も採用していただろうか？プランナーが挙げた理由がすべて、その仮想的な代替案にも当てはまるなら、その採用は「従属」——パターンマッチングであって、原理に基づく判断ではない。）

平たく言い換えると：**AI には「誰が話すかによって従う」という悪い癖があります。** 批評者が「四つの次元を使え」と言えば、プランナーは即座に「あなたの言う通りだ、四つの次元に変えよう。理由は A、B、C」と言います。しかし、もし批評者が最初から「六つの次元を使え」と言っていたら、プランナーは同じ A、B、C という理由で同意したでしょうか？もし同意するなら、プランナーは何も考えておらず、ただ従っているだけだということです。

OMH はこの心理学レベルの失敗モードを**実行可能なチェック項目として書き下しました**。これは珍しい工学的成熟度です。

### 3.4 証拠は主張に勝る：ralph の鉄則

実行段階（`omh-ralph`）の中核メカニズム：

> "The iron law of ralph verification: **evidence, not assertion.** Verifiers must see actual test output; executor claims without evidence are rejected."
>
> （ralph 検証の鉄則：**証拠を要求し、主張を信じない。** ベリファイアは実際のテスト出力を見なければならない。証拠のないエグゼキューターの主張はすべて却下される。）

`role-verifier.md` での定義はさらに手厳しい：

> "No approval without fresh evidence. If you don't see test output, it didn't pass."
>
> （新鮮な証拠がなければ承認しない。テスト出力を見ていなければ、それは合格していない。）

しかも、検収は二値的で、割引はありません：

> "Binary per criterion: VERIFIED / PARTIAL / MISSING. **4 of 5 criteria = FAIL, not PASS.**"
>
> （各基準は三状態のみ：VERIFIED / PARTIAL / MISSING。**五つ中四つ合格 = 失敗であって、合格ではない。**）

**最も重要な規律**（`omh-ralph-driver` の第 4 ステップと P6）：

> "**Critical: the verifier does NOT run evidence themselves. Gathering happens at the orchestrator level** so you can verify executor claims match reality before the verifier reads them."
>
> "Always run `omh_gather_evidence` before dispatching verifiers. [...] If you skip evidence-gathering, the verifier reads only the executor's report and has no ground truth to grade against."
>
> （重要：ベリファイアは証拠を**自ら実行しない**。証拠の収集はオーケストレーターの層で行われる。そうすることで、ベリファイアが読む前に、エグゼキューターの主張が現実と一致しているかを確認できる。）
> （ベリファイアを派遣する前に、常に `omh_gather_evidence` を実行せよ。……証拠収集をスキップすれば、ベリファイアはエグゼキューターの報告だけを読み、評価の根拠となるグラウンドトゥルースを一切持てない。）

これは非常に賢い**三者間の相互牽制**の設計です：

```
エグゼキューター  ——コードを書き、「完了した」と主張する
   ↓
オーケストレーター  ——自らテストを実行し、実際の出力（グラウンドトゥルース）を得る
   ↓
ベリファイア  ——「エグゼキューターの主張」+「オーケストレーターの実際の出力」を突き合わせて判定する
```

エグゼキューターは証拠を偽造できません。証拠は彼が用意したものではないからです。ベリファイアも怠けることができません。真実が目の前に突きつけられているからです。

### 3.5 三振アウト・サーキットブレーカー

AI がバグを直すときの典型的な失敗モードは：一版直しても成功しない → 書き方を変えて再試行 → やはり駄目 → また変える……という無限ループで金を溶かすことです。

OMH の解法は**エラーのフィンガープリントで数える**こと：

> "Construct error fingerprint `{task_id, category, error_key}`. Add to `task.error_fingerprints`. If 3 fingerprints share the same `category + error_key`: mark task blocked, log the error, continue to next eligible task on next invocation."
>
> （エラーフィンガープリント `{タスクID, カテゴリ, エラーキー}` を構築し、`task.error_fingerprints` に追加する。3 つのフィンガープリントが同じ `カテゴリ + エラーキー` を共有する場合：そのタスクをブロック済みとマークし、エラーを記録し、次回の呼び出しで次の対象タスクの処理に進む。）

**「カテゴリ」というフィールドに注目**してください（P5 番目の落とし穴）：

> "Tag the strike category in the error fingerprint. The 3-strike circuit breaker fires when the same `(category, error_key)` repeats. **Tagging by category prevents test-infra strikes from masking real bugs.**"
>
> （エラーフィンガープリントに三振のカテゴリをタグ付けせよ。三振サーキットブレーカーは同じ `(カテゴリ, エラーキー)` が繰り返されたときに発動する。**カテゴリでタグ付けすることで、「テストインフラの問題」による三振が本物のバグを覆い隠すのを防げる。**）

三つのカテゴリ：

| カテゴリ | 意味 | 例 |
| --- | --- | --- |
| `test-infra` | テスト環境そのものに問題がある | CI で依存を入れ忘れた |
| `spec-misread` | 実行者が要件を誤解した | 「時間順でソート」を「名前順でソート」と読み違えた |
| `implementation-bug` | 本当にコードの書き間違い | 配列の範囲外アクセス |

カテゴリを分けなければ、性質の異なる三つの失敗が「同じ無限ループ」と誤判定されて、誤って遮断されてしまいます。カテゴリを分ければ、**同じ性質の失敗が三回繰り返されたときだけ**遮断される——これこそが本当の無限ループの検出です。

---

## 四、十のスキルを一つずつ解説

### 4.1 omh-ralplan（コンセンサスプランニング）

**ロール**：プランナー / アーキテクト / 批評者

**フェーズ**：

| フェーズ | 内容 |
| --- | --- |
| Phase 0 | コンテキスト収集——ファイルを読み、約 500 字に要約 |
| Phase 1 | プランニングループ、最大 3 ラウンド。第 1 ラウンドは直列、第 2 ラウンド以降は並列で再審査 |
| Phase 2 | コンセンサスプランを `.omh/plans/ralplan-{slug}.md` に出力 |

**判定**：三人全員が APPROVE して初めてコンセンサス。いずれかが REQUEST_CHANGES なら次のラウンドへ。いずれかが REJECT なら即座にユーザーへ上申。

### 4.2 omh-ralph（検証付き実行）

**依存**：OMH プラグイン（v2）のインストールが**必須**で、単独では実行できません。

**アーキテクチャ**：**呼び出しごとに一つのタスクだけを実行**して終了。呼び出し元が再度呼び出して初めて次のタスクを実行します。

この設計は批評者に迫られて生まれたもので、理由は `docs/omc-comparison.md` に明確に書かれています：

> "Hermes can't prevent exit mechanically. **State-based resume is more robust and eliminates context exhaustion.**"
>
> （Hermes は機構的に終了を防げない。**状態ベースの再開の方がより堅牢で、コンテキスト枯渇の問題を解消する。**）

OMC のやり方と比べると：OMC は 1144 行の `persistent-mode.cjs` を使って AI がセッションを終了するのを防ぎ、無理やりループを完走させていました。OMH は逆を行く——**終了を防げないなら、毎回の終了を安全なセーブポイントにしてしまおう。**

**八段階のステートマシン**：

| ステップ | 名称 | 何をするか |
| --- | --- | --- |
| 0 | インスタンス解析 + ロック取得 | インスタンスごとに状態を分離；アドバイザリーロックで同一プランの並行実行を防止 |
| 1 | 状態読み取り | 新規／プランニング関門が必要／再開／完了／ブロック／キャンセルを判定 |
| 2 | プランニング関門 | `.omh/plans/ralplan-*.md` を解析；**検収基準のないプランは実行を拒否** |
| 3 | 次のタスクを選ぶ | `passes=false` かつ依存が満たされたタスクを優先度順に選択；2–3 個の並列安全バッチを組める |
| 4 | 実行 | `delegate_task` に `[omh-role:executor]` を付与；COMPLETE/PARTIAL/BLOCKED を解釈 |
| 5 | 検証 | オーケストレーターが先に `omh_gather_evidence` を実行し、`[omh-role:verifier]` を派遣 |
| 6 | エラー処理 | `(カテゴリ + エラーキー)` のフィンガープリントで三振アウトのサーキットブレーカー |
| 7 | 最終審査 | 全タスクが成功した後、アーキテクトが全体を再審査。APPROVE = 完了；REQUEST_CHANGES = 新たに発見されたタスクを生成 |

**その他のメカニズム**：

- **キャンセル信号**：`.omh/state/ralph-cancel.json`、30 秒の TTL、クリーンな中断を実現。
- **学びの前送り**：完了したタスクでの発見が、後続のエグゼキューターのコンテキストに渡されます。
- **並列優先**：独立タスクは最大 3 つの並行サブエージェント（Hermes の `MAX_CONCURRENT_CHILDREN` のデフォルト値）。

### 4.3 omh-ralph-task（単一タスク実行者としての規律）

これはエグゼキューターが**一回の `delegate_task` 呼び出しの内部**で守るべき、狭い契約です。

**タスクエンベロープ（Task Envelope）契約のフィールド**：

- プロジェクトルートディレクトリ + ブランチ
- コミット作者（`-c user.name -c user.email` で上書き）
- **本タスクが所有するファイル**（これらのファイルだけ `git add` できる）
- **変更禁止のファイル**（兄弟タスクが所有。読み取り専用）
- 検収基準
- TDD インストラクション
- コミットメタデータ（正確な `git add` コマンド + コミットメッセージ）
- 期待される出力フォーマット

**ファイルスコープの厳格さ**（これが並列実行で衝突しないための鍵）：

> "**Stay in your file scope.** When implementing, you may need to *read* sibling-owned files for context. You may not *modify* them."
>
> （**自分のファイルスコープに留まれ。** 実装時、兄弟タスクが所有するファイルを**読む**必要はあるかもしれないが、**変更してはいけない**。）

オーケストレーター側の P3 番目の落とし穴と対応しています：

> "When dispatching parallel executors, **only ONE task owns each shared file.** The other executors must import (read-only) but not modify it. Encode this explicitly in each executor's dispatch context."
>
> （並列エグゼキューターを派遣するとき、**各共有ファイルを所有できるのは一つのタスクだけ。** 他のエグゼキューターは参照（読み取り専用）のみ可能で、変更してはいけない。これを各エグゼキューターの派遣コンテキストに明示的に記述せよ。）

**stash 検証法**（テストが落ちたのが本当に自分のせいかを判定する）：

```bash
# 1. 自分の作業をいったん退避（stash）する
git stash
# 2. クリーンな HEAD 上で失敗したテストを実行する
uv run pytest <failing-test-path> -q
# 3a. クリーンな状態で【成功】した場合 → 失敗は自分のせい。pop して修正し、再試行する。
# 3b. クリーンな状態でも【失敗】する場合 → 既存の問題か兄弟タスクのせい。pop して作業を続行する。
git stash pop
```

この手は非常に実用的です：**「このテストが落ちている」という曖昧なシグナルを、「これは自分の責任かどうか」という明確な答えに変換します。** この手順がなければ、エグゼキューターは自分が引き起こしていない失敗の修正に膨大なラウンドを浪費することになります。

**TDD はごまかせない**：

> "Going green-first (writing the implementation before the test) defeats the orchestrator's audit signal — they wanted to see real test-driven evidence in the commit, not after-the-fact tests rationalized to pass."
>
> （実装を先に書いてテストを後付けする（「グリーン優先」）のは、オーケストレーターの監査シグナルを破壊する——彼らがコミットで見たいのは本当のテスト駆動の証拠であり、後から通るように無理やり書いたテストではない。）

### 4.4 omh-deep-research（深層調査）

**依存**：`web` ツールセット + `omh_state` ツール

**五つのフェーズ、どの二つのフェーズの間でも安全に終了できます**：

| フェーズ | 名称 | サブエージェント | 主要な挙動 |
| --- | --- | --- | --- |
| 0 | センチネルチェック | なし | 既存の確認済みレポートを確認；テーマが一致すれば続行 |
| 1 | 分解 | なし | slug 生成、プラン書き込み、状態初期化、終了 |
| 2 | 検索（バッチ） | 1–3 個の `researcher` を並列 | **1 回の呼び出しにつき 1 バッチのみ**；再入可能 |
| 3 | ギャップチェック | 0 または 1 個の `researcher` | 分岐は二つのみ：ギャップ 0 → 総合；ギャップ ≥1 → 追跡調査 |
| 4 | 総合 | 1 個の `research-synthesist` | 親エージェントがすべての発見をインライン化；**レポートは親エージェントが書く** |
| 5 | 検証 | 1 個の `research-verifier` | 三振アウト関門；順序付き確認 |

**センチネル（Sentinel）メカニズム**：`.omh/research/{slug}-report.md` に `status: confirmed` のマークを付ける。これが「この調査は確定稿」という耐久性のあるインターフェースであり、下流のスキルが直接これを消費します。

**検証が通ったときの順序は入れ替え不可**：

1. まず `status: confirmed` 付きのレポートを書き込む（原子的・冪等なセンチネル）
2. 次にイベントログへ `REPORT_CONFIRMED` を追記
3. 最後に状態をクリーンアップ

順序が逆だと「状態は消えたのにレポートが落ちていない」という不整合が起こり得ます。

**コストエンベロープ**（README に明記されている。これは親切です）：

> "A typical happy-path session is roughly **5-8 `delegate_task` calls** [...] With one synthesis retry, expect **up to ~10-12 calls**. The 3-strike retry cap bounds worst-case at ~14-16 calls before BLOCKED is surfaced."
>
> （典型的な順調なパスはおよそ **5–8 回の `delegate_task` 呼び出し**……総合の再試行が一回あれば、**最大約 10–12 回**を想定。三振アウトの再試行上限により、最悪ケースは約 14–16 回の呼び出しに抑えられ、その後 BLOCKED が報告される。）

**コストの上限を README に書くことは、ユーザーの財布への敬意です。** 多くの AI フレームワークはこの数字を公表しようとしません。

**リサーチャーの誠実プロトコル**：

> "**Empty-result protocol:** Return block with `SYNTHESIS: (insufficient sources for this subtopic)` — honest, not a failure."
>
> （空結果プロトコル：`SYNTHESIS:（このサブトピックはソース不足）` の構造ブロックを返す——それは誠実であって、失敗ではない。）

検証側もこれを認めています：`(insufficient sources for this subtopic)` は**誠実なシグナルであり、FAIL とは判定されません**。しかし**内容の捏造 = FAIL。これは許されざる原罪です**。

### 4.5 omh-deep-interview（深層要件インタビュー）

**アーキテクチャ**：ソクラテス式の対話、**いつ終えるかを制御するのはユーザー**。

**カバーする次元**：ゴール（Goal）、制約（Constraints）、成功基準（Success Criteria）、既存コンテキスト（Existing Context、ブラウンフィールドのみ）

**採点方式**：粗い粒度の区分（HIGH / MEDIUM / LOW / CLEAR）、**決して自動終了しない**。

これは OMH と OMC の意図的な相違点の一つです：

> "**LLM self-assessment lacks decimal precision. The user is the authority on readiness.**"
>
> （**LLM の自己評価には小数位レベルの精度がない。準備ができたかどうかの権威はユーザーである。**）

OMC は 0.0–1.0 の浮動小数点数で採点し、閾値に達すると自動でインタビューを終了します。OMH はこれを疑似精度だと考えます——AI が「曖昧さ 0.23」と言うのと「0.31」と言うのとに実質的な差はなく、さらに**AI 自身に「もう十分聞いた」と決めさせること自体が悪手**なのです。

**その他の意図的な相違点**：

| OMC のやり方 | OMH のやり方 | 理由（原文） |
| --- | --- | --- |
| ブラウンフィールドを自動検出 | **ユーザーに聞く** | "Checking for `package.json` etc. is unreliable and presumptuous."（package.json などのファイルをチェックするのは信頼性が低く、おせっかい） |
| 仕様に完全なインタビュー記録を入れる | **総合サマリーのみ入れる** | "Keeps specs readable and focused. Full transcript is ephemeral."（仕様を読みやすく焦点のあるものに保つ。完全な記録は一時的なもの） |
| 3 種類の名称付きチャレンジモード | **単一の適応型インストラクション** | "Same effect, less ceremony. **Consensus review called the modes 'cargo cult.'**"（効果は同じで、儀式が減る。コンセンサスレビューはそのモードを「カーゴカルト」と呼んだ） |

最後の「カーゴカルト（cargo cult）」という評価はかなり辛辣です——形式だけを真似て本質を理解していない行為を指します。

**適応型の質問**：同じ次元で 2 ラウンド以上続けても進展がなければ、質問の角度を変えます。

**センチネル**：`.omh/specs/{name}-spec.md` に `status: confirmed` を付ける——確認済みの仕様だけが下流のスキルに対して有効です。

### 4.6 omh-autopilot（全自動パイプライン）

**アーキテクチャ**：**呼び出しごとに一つのフェーズステップだけを進め**、フェーズの境界ではコンテキストが完全に新しい状態になる。

| フェーズ | 名称 | 主要な挙動 |
| --- | --- | --- |
| 0 | 要件 | 確認済み仕様があるか確認；要件が曖昧 → deep-interview をロード（対話式） |
| 1 | プランニング | コンセンサスプランがあるか確認；なければ → ralplan をロード |
| 2 | 実行 | 呼び出しごとに ralph のイテレーションを 1 回実行；`phase="complete"` になるまで繰り返し |
| 3 | QA ループ | 呼び出しごとに QA サイクルを 1 回実行；証拠収集、診断、修正；`qa_error_history` で三振アウト |
| 4 | 複数レビュー検証 | 3 つの並行レビュー（アーキテクト + セキュリティレビュー + コードレビュー）——**ちょうど 3 つの並行スロットを埋める** |
| 5 | クリーンアップ | 状態ファイルを削除；ログ、プラン、仕様は**保持** |

**スマートスキップ**：新規起動時、既存の成果物を検出して完了済みのフェーズをスキップします。昨日インタビューを終えていれば、今日 autopilot を走らせてももう一度聞いてくることはありません。

**コンテキストチェックポイント**：各フェーズ完了後に `context_checkpoint: true` を設定してセッションを終了。次回の呼び出しで状態を読み、フラグをクリアし、続行します。

この設計の妙は：**コンテキストウィンドウが各フェーズの境界でリセットされるので、どんなに長いプロジェクトでもコンテキストを破裂させない**ことです。状態はすべてディスク上にあり、対話履歴の中にはありません。

### 4.7 二つの driver：オーケストレーターのプレイブック

OMH には非常にユニークなやり方があります：**「労働者の規律」と「現場監督のプレイブック」を二つのスキルに分けること。**

- `omh-ralplan` / `omh-ralph` = **労働者側の規律**（`delegate_task` の内部、ロールマーク付きで使用）
- `omh-ralplan-driver` / `omh-ralph-driver` = **現場監督のプレイブック**（二つの派遣の**間**で使用）

`omh-ralplan-driver` には **26 の番号付き落とし穴（P1–P26）**、`omh-ralph-driver` には **10（P1–P10）** があります。これらは思いつきではなく、実際の運用から学ばれた失敗モードです。

**特に覚えておく価値のあるもの**：

> "**P6 — Specific counter-proposals beat flagged concerns:** A strong Critic proposes a concrete alternative ('use four dimensions: X / Y / Z / W'), not just 'consider a different decomposition.'"
>
> （P6——具体的な反提案は、指摘だけの懸念に勝る：強い批評者は具体的な代替案（「X / Y / Z / W の四つの次元を使え」）を提案する。「別の分解を考えてみては」というだけではない。）

> "**P10 — Iterate context package with user before dispatching:** Drafting from reading alone misses dimensions only the user can name."
>
> （P10——派遣前にユーザーと一緒にコンテキストパッケージを反復せよ：読んだだけで起草すると、ユーザーだけが名前を言える次元を見落とす。）

> "**P2 — Identify parallel-safe batches before dispatching, not during:** If you wait until after dispatching one task to consider whether others could have run in parallel, you've forfeited the wall-clock savings."
>
> （P2——並列安全なバッチは派遣**前に**特定せよ、派遣中ではなく：一つのタスクを派遣してから他のタスクが並列実行できたか考え始めるなら、節約できたはずの実時間をすでに失っている。）

### 4.8 高度の契約：ブリーフとディープレビュー

`omh-ralplan-driver` の P26 番目の落とし穴が語るのは、**成果物の形態**です：

> "Two artifacts at the orchestrator-review step, not one. Deep review for the archive (preserves provenance and your honest self-assessment). Brief for delivery."

- **`brief.md`** —— ユーザーが読む方。**意思決定を優先し、1–2 ページ。** "The user must be able to **give judgment from this alone**."（ユーザーはこれだけで判断を下せなければならない。）
- **`<orchestrator>-review-deep.md`** —— アーカイブ用。内部の推論、完全な論証、従属テスト、実行方法の観察。**デフォルトでは読まれない。**

そして P26 で最も手厳しい言葉：

> "**The brief is the test of altitude: if you cannot reduce the deep review to a clean decisions-first brief, you do not have the altitude you think you have.**"
>
> （**ブリーフは「高度」の試金石：ディープレビューを、きれいな意思決定優先のブリーフに圧縮できないなら、あなたは自分が思っているほどの高度を持っていない。**）

さらに本質的な一言：

> "An executive presented with the deep review cannot give judgment from it; an executive presented with a brief can."
>
> （ディープレビューを渡された役員はそこから判断を下せない。ブリーフを渡された役員は下せる。）

**この言葉はあらゆる AI の出力に当てはまります。** あなたの AI アシスタントが 3000 字の分析を渡してきて、一生懸命やっているように見えても、実はそれでは判断できない——それが「高度が足りない」ということです。

### 4.9 omh-triage（issue トリアージ、v0.1）

**ステータス**：v0.1、**意図的に小さく**作られている——ロールは 2 つだけ。まず実際のシーンで磨いてから拡大する方針です。

- **Triage Maintainer（メンテナー）** —— コードにアンカーしたグラウンドトゥルース：「この issue の前提はまだ成立するか？」
- **Triage Skeptic（スケプティック）** —— 剪定：「これはスロットを一つ分の価値があるか？」

計画中の v0.2+ のロール：Operator、Architect、Member-advocate。

**判定の組み合わせ行列**（権威テーブル）：

| メンテナー | スケプティック | 結論 |
| --- | --- | --- |
| stale（期限切れ） | （実行しない） | クローズ |
| out-of-scope（範囲外） | （実行しない） | クローズ |
| recast/partial-stale | keep | 本文を書き直して保持 |
| recast/partial-stale | drop/wait | クローズ |
| live（有効） | keep | live のまま保持 |
| live | drop/wait | クローズ |
| live | dedup | クローズ + コメントを残す |
| live | refile-smaller | クローズ + より小さな issue を開き直す |

**事前フライトの規律**（`omh-triage-driver`）：

- issue 数 < 10 → 手作業で処理し、AI は使わない
- issue 数 > 100 → まず人間が粗いスクリーニングを一回行う
- 前回の整理から < 2 週間、かつ大規模リファクタリングがない → **レバレッジが低い、実行しない**
- 最も重要なチェック：**「issue が投稿されて以来、どのコード面が動いたか？」**

そして過剰使用に対する戒めも：

> "**T6:** Running too often — If you find yourself dispatching `omh-triage` weekly, the fix is upstream."
>
> （T6：実行が頻繁すぎる——毎週 omh-triage を派遣している自分に気づいたら、問題は上流にある。）

**フレームワークが自らのドキュメントに「あまり使うな」と書くのは、稀有な誠実さです。**

---

## 五、プラグイン層：ロール注入と原子状態

### 5.1 ロール注入：v1 から v2 への重要な最適化

**v1（冗長版）**：ロールの完全な説明テキストを `delegate_task` の `context` フィールドにインライン展開する。

**v2（簡潔版）**：goal 文字列に `[omh-role:NAME]` マークだけを置き、フックが自動で注入する。

```python
delegate_task(
    goal="[omh-role:executor] Implement the following task:\n\n<task>...",
    context="<プロジェクトコンテキストのみ>"
)
```

**メカニズム**（`docs/plugin.md`）：

> "The key architectural insight for role injection: `delegate_task` passes `goal` as `user_message` to the subagent's `run_conversation()`. The `pre_llm_call` hook receives this as `user_message` on `is_first_turn=True`, making it the natural injection point — **no new Hermes primitives required.**"
>
> （ロール注入の鍵となるアーキテクチャ上の洞察：`delegate_task` は `goal` を `user_message` としてサブエージェントの `run_conversation()` に渡す。`pre_llm_call` フックはこれを `is_first_turn=True` の `user_message` として受け取り、これが自然な注入ポイントになる——**新しい Hermes プリミティブは一切不要。**）

もたらされる直接的な利益：

> "**Parent context never loads role text — zero token overhead.**"
>
> （親エージェントのコンテキストにはロールのテキストが一切ロードされない——**ゼロトークンのオーバーヘッド。**）

これは非常に賢いレバレッジです：**上流フレームワークのコードを一行も変えずに、既存の注入の隙間を見つけた**のです。

### 5.2 ロールディレクトリ（15 のロールファイル）

| ロール | 責務 | 使用者 |
| --- | --- | --- |
| Planner（プランナー） | タスク分解、順序付け、リスクのマーキング | ralplan |
| Architect（アーキテクト） | 構造レビュー、境界の明確さ、長期的な保守性 | ralplan、ralph 最終審査 |
| Critic（批評者） | 対抗的な挑戦、仮説検証、ストレステスト | ralplan |
| Executor（エグゼキューター） | コード実装、テスト優先、最小限の変更 | ralph |
| Verifier（ベリファイア） | 証拠に基づく完了チェック、**読み取り専用**、合格/不合格 | ralph |
| Analyst（アナリスト） | 要件の抽出、隠れた制約、検収基準 | deep-interview、autopilot |
| Security Reviewer（セキュリティレビュー） | 脆弱性、信頼境界、インジェクションベクトル | autopilot 検証フェーズ |
| Test Engineer（テストエンジニア） | テスト戦略、カバレッジ、境界ケース、フレーク耐性 | autopilot QA フェーズ |
| Code Reviewer（コードレビュー） | diff レビュー、規範、全体品質 | autopilot 検証フェーズ |
| Debugger（デバッガー） | 根本原因分析、仮説検証、最小のピンポイント修正 | ralph エラー診断 |
| Researcher（リサーチャー） | 単一サブトピックの調査、構造化された発見ブロック | deep-research |
| Research Synthesist（研究総合者） | 複数の発見を総合 | deep-research |
| Research Verifier（研究検証者） | **読み取り専用**で引用の完全性を検証 | deep-research |
| Triage Maintainer / Skeptic | トリアージの二重ロール | triage |

### 5.3 三つのフック

| フック | 役割 |
| --- | --- |
| `pre_llm_call` | サブエージェントの `user_message` 内の `[omh-role:NAME]` を検出し、ロールのプロンプトをシステムコンテキストに注入；同時に「モード認識」（現在のフェーズ/イテレーション）も注入 |
| `pre_tool_call` | サブエージェント起動前にロールマークを検証；未知のロール名には**警告のみでブロックしない**（タイプミスを素早く発見） |
| `on_session_end` | 予期しない終了時に、アクティブなモードの状態ファイルへ `_interrupted_at` タイムスタンプを書き込む |

### 5.4 omh_state ツール：原子状態エンジン

**原子書き込みパターン**：

```
.tmp.{uuid} に書き込む → fsync → os.replace
```

これは標準的な原子ファイル置換の定石です——`os.replace` は POSIX 上で原子的なので、状態ファイルは**決して書きかけの状態になりません**。プログラムがどの瞬間にクラッシュしても、ディスク上にあるのは旧バージョンか新バージョンのどちらかで、欠けたバージョンになることはありません。

**毎回の書き込みに `_meta` エンベロープが付きます**：

```python
{
  "_meta": {
    "written_at": "ISO8601 タイムスタンプ",
    "mode": "...",
    "schema_version": 1,
    "written_by": "omh-plugin"
  },
  ...実際のデータ
}
```

**アドバイザリーロック（advisory lock）**：

- `.lock` ファイル、中身は JSON：`{pid, session_id, started_at, lock_key, holder_note?}`
- **陳腐ロックの検出**：`os.kill(pid, 0)` でロック保持プロセスがまだ生きているかを確認
- 再試行時には陳腐ロックを自動解放

これが解決するのは現実の問題です：AI セッションがクラッシュしてロックファイルがディスクに残り、次回の起動時に自分自身の亡骸にロックされてしまう。PID の生存検出でこれを回避します。

### 5.5 omh_gather_evidence ツール：証拠収集の安全モデル

このツールはシェルコマンドを実行する（テストを走らせ、ビルドを走らせる）ため、システム全体で攻撃面が最も大きい場所です。その防御は層状になっています：

| 防御 | 説明 |
| --- | --- |
| **シェルメタ文字を拒否** | コマンド内に `;` `&` `\|` `` ` `` `<` `>` などがあれば一律拒否——インジェクション防止 |
| **トークン接頭辞ホワイトリスト** | `npm test` は `npm test --verbose` に一致するが、`npm testing-malicious` には**一致しない** |
| **`shell=False`** | subprocess がシェルを経由しないので、変数展開を根絶 |
| **作業ディレクトリの限定** | プロジェクトルートに固定され、ツール引数で逃げられない |
| **単一コマンドのタイムアウト** | デフォルト 120 秒、最大 300 秒 |
| **出力の切り詰め** | デフォルト 2000 文字、**末尾を保持**（エラー情報は通常末尾にある） |

「トークン接頭辞ホワイトリスト」という細部に注目してください——素朴な `startswith("npm test")` では `npm testing-malicious` が通ってしまいます。空白で分割してから接頭辞トークンを突き合わせるのが正しいやり方です。**これは本当にセキュリティを理解している人が書いたコードです。**

### 5.6 omh-delegate：強化された派遣ラッパー

`docs/omh-delegate.md` には、極めて抑制の効いた、極めて誠実な記述があります：

> "omh_delegate mitigates an **intentional architectural property** of Hermes's `delegate_task`, not a bug. By design, `delegate_task` returns *only the subagent's final summary* to the parent [...] **There is no upstream fix to wait for: the contract is the feature.**"
>
> （omh_delegate が緩和するのは、Hermes の `delegate_task` が持つ**意図的なアーキテクチャ上の特性**であって、バグではない。設計上、`delegate_task` はサブエージェントの最終サマリーだけを親に返す……**待つべき上流の修正は存在しない：その契約こそが機能なのだ。**）

**「他人の設計上のトレードオフをバグとして報告しない」**——これは成熟したエンジニアと、文句ばかり言うエンジニアを分ける分水嶺です。

**解法：サブエージェント永続化（subagent-persists）**

サブエージェントに確定した出力パスを与え、「残酷な散文の契約ブロック」を goal の後ろに付けて、**最後の行動がこの正確なパスへの `write_file` であること**を伝えます。そしてラッパーがファイルが存在するかを確認します。

**救済分岐はない**：

> "There is **no rescue branch in v0**. If the subagent ignores the contract, the wrapper returns `ok=False` with the raw return preserved [...] — **loud failure, not silent rescue.** This is deliberate: it preserves the feedback signal that teaches us whether the contract prose works in practice."
>
> （v0 には**救済分岐がない**。サブエージェントが契約を無視したら、ラッパーは生の戻り値を保持したまま `ok=False` を返す……——**静かな救済ではなく、大きな失敗。** これは意図的だ：契約の散文が実際に効くのかどうかを教えてくれるフィードバックシグナルを保持するためだ。）

**この哲学は、誰もが持ち帰る価値があります。** 私たちは「もし AI がフォーマット通りに返さなかったら、正規表現で救ってやろう」というフォールバックロジックを書くのに慣れすぎています。その結果——あなたのプロンプトが実際にどれほど劣っているか永遠に分からない。なぜならフォールバックロジックが劣ったシグナルを食い尽くしてしまうからです。

**パンくず（breadcrumb）は追記のみで変更しない**：

```
.omh/state/dispatched/{id}.dispatched.json   ← prepare() が書く
.omh/state/dispatched/{id}.completed.json    ← finalize() が書く（独立したファイル）
```

> "Both breadcrumbs are **append-only**. The wrapper never mutates a breadcrumb after writing it; completion data lives in a sibling file. **This eliminates a class of read-modify-write race conditions.**"
>
> （二つのパンくずはどちらも**追記専用**。ラッパーは書き込んだ後にパンくずを決して変更しない。完了データは同じ階層の別ファイルに置かれる。**これにより「読み取り-変更-書き込み」系の競合状態の一クラス全体が排除される。**）

**前方互換を見据えた深謀遠慮（AC-1）**：

> "In v0 the `ok` field is a plain bool. v1.B may reintroduce a rescue branch and make `ok` tri-state (`True | False | "degraded"`). **Python truthiness will treat the string `"degraded"` as truthy**, so naïve callers writing `if result["ok"]:` would silently treat a degraded result as success. To stay correct across that future change, callers needing a hard pass/fail check should use `ok_strict`."

作者は**v0 の時点で、v1 の三状態化が呼び出し側を静かに壊すことを予見して**、今から `ok_strict` を提供しています。この「三年後の自分のために扉を残しておく」意識は、本リポジトリのエンジニアリング原則である「アーキテクチャ上の判断は長いスパンでする」に呼応しています。

### 5.7 `.omh/` ディレクトリ：選択的共有

| サブディレクトリ | git 管理？ | ライフサイクル | 内容 |
| --- | --- | --- | --- |
| `state/` | **いいえ** | 単一セッション | アクティブなモードの状態 JSON + `.lock` ファイル |
| `logs/` | **いいえ** | 単一セッション | 追記専用のイベントログ——意思決定/状態遷移のみを記録し、内容は記録しない |
| `progress/` | **いいえ** | 単一セッション | ralph の実行進捗ログ |
| `specs/` | **はい** | 耐久 | 確認済みのインタビュー仕様 |
| `plans/` | **はい** | 耐久 | コンセンサスプラン（ADR の形） |
| `research/` | **はい** | 耐久 | deep-research が生み出した調査レポート |

この区分の背後にある哲学を、ドキュメントは見事に書き表しています：

> "A spec or a consensus plan is a **decision artifact** — the canonical record of 'what we agreed to build.' It belongs in the repo for the same reason an ADR belongs in the repo. Treating these as user-private throws that away. State and logs are **per-session runtime.**"
>
> （仕様とコンセンサスプランは**意思決定の成果物**——「私たちが何を作ることに合意したか」の正準記録である。それがリポジトリに属する理由は、ADR がリポジトリに属するのと同じだ。これらをユーザー私物として扱うことは、その価値を捨てることになる。状態とログは**セッション単位のランタイム**である。）

> "State and logs [...] reflect what one developer was doing at one moment, and they're cleared on completion. **Sharing them adds noise without value.**"
>
> （状態とログは……ある開発者がその瞬間に何をしていたかを反映したもので、完了時には消去される。**それらを共有することは、価値のないノイズを増やすだけだ。**）

**この境界線は極めて正確に引かれています**：AI が生み出すものの中で、「結論」はバージョン管理に入れる価値があり、「過程」には価値がない。多くのチームは AI のセッションログをまとめてコミットしますが、結局誰も見ず、リポジトリを太らせるだけです。

---

## 六、設計哲学（十四条）

以下はすべてリポジトリ内に明確な出典があるもので、私の解釈ではありません。

### 6.1 スキルは単独で使え、プラグインは強化のみで門を塞がない

> "Skills work standalone with zero dependencies."（README）
>
> "Keep skills standalone-capable; plugin features should enhance, not gate."（CONTRIBUTING）
>
> （スキルは単独で使える状態を保つこと；プラグインの機能は**強化**であって、**門を塞ぐもの**であってはならない。）

つまり：プラグインをインストールしなくてもスキルは使えます。ただ冗長になるだけです（ロールテキストをインラインにする必要がある）。プラグインを入れれば体験はより良くなります。**「プラグインを入れないと始められない」という人質取りはありません。**

（唯一の例外は `omh-ralph` で、これは確かにプラグインが必要です——原子状態とロックに依存するため。）

### 6.2 コンセンサス議論は単発出力に勝る

> "This catches blind spots that a single agent misses. The Critic's job is to break the plan — if it survives, it's stronger for it."

### 6.3 証拠は主張に勝る

> "The iron law of ralph verification: evidence, not assertion."
>
> "No approval without fresh evidence. If you don't see test output, it didn't pass."

### 6.4 ファイル所有権の厳格さ

> "When dispatching parallel executors, only ONE task owns each shared file."
>
> "Stay in your file scope."

### 6.5 証拠を実行するのはオーケストレーター、ベリファイアは実行しない

> "Critical: the verifier does NOT run evidence themselves. Gathering happens at the orchestrator level."

### 6.6 三振アウトの遮断はカテゴリごとに数える

> "Tagging by category prevents test-infra strikes from masking real bugs."

### 6.7 オーケストレーターは高度を保ち、現場に下りない

> "The orchestrator role exists for one reason: **to stay above the work** so you can dispatch with one altitude and review with another."
>
> "The orchestrator's discipline: **skepticism, not deference.** Trust given to you (by the user installing you as orchestrator) is meant to be **USED**, not held in reserve."
>
> （オーケストレーターというロールが存在する理由は一つだけ：**仕事の上に留まる**こと。そうすることで、ある高度で派遣し、別の高度でレビューできる。）
> （オーケストレーターの規律：**懐疑であって、従属ではない。** ユーザーがあなたをオーケストレーターに据えて与えた信頼は、**使う**ためのものであって、とっておくためのものではない。）

最後の言葉は極めて秀逸です——**AI の最もありがちな職務怠慢は、間違ったことをすることではなく、過度に丁寧で判断を下せないことなのです。**

### 6.8 高度の契約：ブリーフ vs ディープレビュー

> "The brief is the test of altitude: if you cannot reduce the deep review to a clean decisions-first brief, you do not have the altitude you think you have."

### 6.9 META 問題：批評者はフレームを疑えなければならない

> "The single most load-bearing move: the Critic must be licensed to contest the framing itself."

### 6.10 ユーザーは常に終了権を持つ

> "The user always decides when they're done — scoring never auto-terminates."
>
> "Coarse bins are advisory heuristics for question targeting. The user always decides when they're done. **Never auto-terminate based on coverage scores.**"

### 6.11 静かな救済ではなく、大きな失敗

> "Loud failure, not silent rescue. This is deliberate: it preserves the feedback signal."

### 6.12 コンテキストパッケージは品質が生まれる場所

> "**The context package is where quality is born.** Verify ground truth, surface adjacent mechanisms, verify external premises, settle filesystem layout, walk it with the user, kill phantom contests on reframe. **Most pitfalls in this skill are pre-dispatch failures.** Treat the package as the load-bearing artifact it is."
>
> （コンテキストパッケージは品質が生まれる場所である。グラウンドトゥルースを検証し、隣接メカニズムを浮かび上がらせ、外部の前提を検証し、ファイルシステムのレイアウトを確定し、ユーザーと一緒に通し、フレームの組み直しで幽霊論争を消す。**このスキルの落とし穴のほとんどは「派遣前」の失敗である。** パッケージを、それが本来そうであるところの荷重支持の成果物として扱え。）

**これはおそらく最も実用的な一条です。** 多くの人は AI の出力品質がモデルの強さで決まると思っていますが、実際にはあなたが投入するコンテキストの正確さで決まります。26 の落とし穴の大半は派遣前の失敗——**問題はあなたがエンターキーを押す前に存在するのです。**

### 6.13 スタンス文書 ≠ 要件文書

> "A 'design stance' and a 'requirements document' are different artifacts."
>
> "Requirements need: **needs not features; every item has inline citations; prefer missing to fabricating; forbid feature-by-analogy.**"
>
> （要件文書に必要なのは：**機能ではなくニーズを書くこと；すべての項目にインライン引用があること；捏造より欠落を選ぶこと；「類推による機能」を禁じること。**）

「類推による機能を禁じる」（forbid feature-by-analogy）は良い言葉です——「他の製品にこの機能があるから、自分たちにもあるべきだ」という疑似要件を指します。

### 6.14 ブートストラップ：自分自身で自分を作る

> "OMH was built using its own tools. The first skill implemented was `omh-ralplan` (consensus planning), which was then used to design the remaining skills through multi-agent debate."
>
> "Each consensus process produced a plan that was then reviewed against the actual OMC source code and LobeHub marketplace implementations."

**ブートストラップは最も強い信頼性の証明です。** マルチエージェント編成フレームワークが、その作者自身が設計に使っていないなら、それはおもちゃにすぎません。

---

## 七、詳細チュートリアル：ゼロから始める

> 以下のチュートリアルは、[Hermes Agent](https://github.com/NousResearch/hermes-agent) v0.7.0 以降がインストール済みであることを前提としています。

### 7.1 ステップ 1：インストール

**方法 A：skills tap 経由（推奨）**

```bash
# 1. スキルソースを追加する
hermes skills tap add witt3rd/oh-my-hermes

# 2. 必要なスキルをインストールする
hermes skills install \
  omh-deep-research \
  omh-ralplan \
  omh-ralplan-driver \
  omh-deep-interview \
  omh-ralph \
  omh-ralph-driver \
  omh-ralph-task \
  omh-autopilot
```

**方法 B：手動コピー**

`skills/<name>/` ディレクトリを `~/.hermes/skills/omh/` にコピーするだけです。

**オプションのプラグインをインストール**（強く推奨、`omh-ralph` には必須）：

```bash
# Python 3.10+ と pyyaml が必要
pip install pyyaml

# plugins/omh/ を ~/.hermes/plugins/omh/ にインストールする
cp -r plugins/omh ~/.hermes/plugins/omh
```

### 7.2 ステップ 2：`.omh/` ディレクトリを初期化

OMH は初回使用時にプロジェクト内に自動で `.omh/` ディレクトリを播種します（プラグインのインストールが必要）。事前に骨組みを用意したい場合：

```
omh_state(action="init")
```

生成される構造：

```
.omh/
├── .gitignore        ← 「選択的共有」が事前設定済み
├── README.md         ← この慣習を説明する
├── state/            ← git 管理外
├── logs/             ← git 管理外
├── progress/         ← git 管理外
├── specs/            ← git 管理（意思決定の成果物）
├── plans/            ← git 管理（意思決定の成果物）
└── research/         ← git 管理（意思決定の成果物）
```

生成される `.gitignore` は次のような内容です：

```gitignore
# はかないランタイム——共有には使わない
state/
logs/
progress/

# 耐久性のある意思決定の成果物——git 追跡に含める
# specs/      確認済みのインタビュー仕様
# plans/      コンセンサスプラン（ADR の形）
# research/   調査レポート
```

### 7.3 ステップ 3：要件がまだ曖昧？まずインタビュー

```
omh-deep-interview スキルをロードして、要件インタビューを開始する：XXX を作りたい
```

すると次のことを行います：

1. **最初に二つの質問をする**：プロジェクトの説明 + これは新規プロジェクト（greenfield）か既存プロジェクト（brownfield）か？
2. **インタビューループに入る**（≤5 ラウンド、10 ラウンドまで延長可）：各ラウンドで**最も弱い次元**について一問だけ質問する。
3. **仕様を生成する**：`.omh/specs/{name}-spec.md` に総合する
4. **確認を待つ**：確認 / 修正要求 / 放棄

**重要**：**自分から「もう十分聞いた」と決めることは絶対にありません。** 粗い粒度の採点（HIGH/MEDIUM/LOW/CLEAR）は「次の質問はどの次元にするか」を決めるためだけに使い、「いつ終えるか」を決めるのには使いません。

**成果物**：`.omh/specs/{name}-spec.md`、`status: confirmed` 付き。この状態の仕様だけが下流に対して有効です。

### 7.4 ステップ 4：コンセンサスプランニングを一回実行

```
omh-ralplan と omh-ralplan-driver スキルをロードし、
.omh/specs/my-feature-spec.md に基づいてコンセンサスプランニングを行う
```

**自分自身が総指揮になるなら、必ず driver スキルも同時にロードしてください。**

**Phase 0：コンテキストパッケージを書く** —— これが最も重要なステップです。P10 の要求に従い、**まずユーザーと一度通してから派遣します**：

```markdown
## コンテキストパッケージ

### 何を解決するのか
（仕様から中核要件を抽出する）

### 関連する既存コード
（主要ファイルのパス + 一言の説明を列挙する）

### 既知の制約
（技術スタック、性能要件、触ってはいけない部分）

### 現在のフレーム内で疑問を投げるべき点
1. ...
2. ...

### META 問題（必須！）
上記のフレーム自体は正しいか？正しい問題を解決しようとしているか？
根本的に異なる分解の仕方はないか？
```

**最後の META 問題は省略できません。** これがなければ、批評者は細部しか捕まえられません。

**Phase 1：ラウンドを回す**

- 第 1 ラウンドは直列：プランナー → アーキテクト → 批評者
- 第 2 ラウンド以降は並列：プランナーが改稿した後、アーキテクトと批評者が同時に再審査

**Phase 2：二つの成果物に蒸留する**

- `brief.md` —— ユーザーに見せる用、1–2 ページ、意思決定優先
- `<orchestrator>-review-deep.md` —— アーカイブ用、デフォルトでは読まれない

**成果物**：`.omh/plans/ralplan-{slug}.md`

### 7.5 ステップ 5：実行

```
omh-ralph と omh-ralph-driver スキルをロードし、
.omh/plans/ralplan-my-feature.md に従って実行を開始する
```

**プランニング関門がまずあなたを止めます**：**テスト可能な検収基準**の付いた番号付きタスクリストがなければ、ralph は実行を拒否します。これは意図的です——「まずやってみて後から考える」を防ぐためです。

まともな ralph 型プランは次のような形です：

```markdown
## タスクリスト

### Task 1: ユーザーモデルを追加
- **所有ファイル**: `src/models/user.py`, `tests/test_user.py`
- **変更禁止**: `src/models/__init__.py`（Task 3 が所有）
- **依存**: なし
- **検収基準**:
  - [ ] `User` クラスに `id` / `email` / `created_at` フィールドがある
  - [ ] `pytest tests/test_user.py` が全パス
  - [ ] email フィールドに形式検証があり、不正入力は `ValidationError` を投げる

### Task 2: ユーザーリポジトリを追加
- **所有ファイル**: `src/repos/user_repo.py`, `tests/test_user_repo.py`
- **依存**: Task 1
- **検収基準**:
  - [ ] `save()` / `find_by_id()` / `find_by_email()` の三メソッド
  - [ ] `pytest tests/test_user_repo.py` が全パス
```

**呼び出しごとに一つのタスク（または 2–3 個の並列安全なタスクのバッチ）だけを実行して終了します。** 状態が `complete` になるまで、繰り返し呼び出す必要があります。

**オーケストレーターが各イテレーションの間にやるべき四つのこと**：

1. **バッチを正しく選ぶ** —— 2–4 個の独立タスクで、触れるファイルが互いに重ならないもの
2. **エグゼキューターに十分なコンテキストを書く** —— TDD インストラクション、「変更禁止」リスト、コミットメタデータ、前のタスクからの学び
3. **ベリファイアを派遣する前に自分で証拠を実行する** —— `omh_gather_evidence`
4. **ベリファイアを並列で派遣する**

**途中で止めたい場合**：

```
omh_state(action="cancel", mode="ralph", instance_id="{instance_id}", reason="user request")
```

30 秒の TTL で、クリーンに中断します。

### 7.6 ステップ 6（任意）：全自動パイプライン

```
omh-autopilot スキルをロードして、エンドツーエンドで完了させる：XXX を作りたい
```

6 つのフェーズを自動で連結します。**呼び出しごとに一つのフェーズステップを進める**ので、やはり繰り返し呼び出す必要がありますが、毎回コンテキストが新しい状態なので、コンテキストを破裂させることがありません。

また、完了済みのフェーズを**スマートにスキップ**します：昨日インタビューを終えていれば、今日はプランニングから直接始まります。

### 7.7 ステップ 7：馴染みのない領域に直面したら、まず調査

```
omh-deep-research スキルをロードして、調査する：XXX 技術の現状とベストプラクティス
```

五段階のフローで、**呼び出しごとに一つのバッチだけを進めます**（最大 3 人の並行リサーチャー）。

**成果物**：`.omh/research/{slug}-report.md`、`status: confirmed` 付き。

**コストの想定**：順調なパスで 5–8 回のサブエージェント呼び出し；最悪ケースで 14–16 回。

### 7.8 完全なパイプラインの例

```bash
# シナリオ：馴染みのない領域に新機能を追加する

# 1. まず領域を理解する（status: confirmed になるまで複数回呼び出す）
> omh-deep-research をロードして、WebRTC の SFU アーキテクチャを調査する

# 2. 要件を明確にする（対話式、自分が質問に答える）
> omh-deep-interview をロードして、上記の調査レポートに基づいて要件をインタビューする

# 3. 案を議論して固める（最大 3 ラウンド）
> omh-ralplan + omh-ralplan-driver をロードして、仕様に基づいてコンセンサスプランニングを行う

# 4. 実行する（complete になるまで繰り返し呼び出す）
> omh-ralph + omh-ralph-driver をロードして、プランに従って実行する
> 続行
> 続行
> ...

# 5. 成果物を確認する
$ ls .omh/plans/     # コンセンサスプラン（git 管理）
$ ls .omh/specs/     # 要件仕様（git 管理）
$ ls .omh/research/  # 調査レポート（git 管理）
$ git log --oneline  # 各タスクにつき 1 コミット
```

### 7.9 よくある落とし穴とトラブルシューティング

| 症状 | 原因 | 解決策 |
| --- | --- | --- |
| ralph が実行を拒否する | プランに検収基準付きの番号付きタスクがない | タスクリストを補完し、各項目にテスト可能な検収基準を付ける |
| 並列タスクが同じファイルを変更して衝突 | 派遣時に「変更禁止」リストを書いていない | 各共有ファイルを所有できるのは一つのタスクだけにする（P3） |
| ベリファイアはいつも合格なのに、コードは実は壊れている | ベリファイアを派遣する前に証拠を実行していない | 先に `omh_gather_evidence` を実行し、出力をベリファイアに渡す（P6） |
| 批評者が小さな欠点しか指摘しない | コンテキストパッケージに META 問題がない | 「フレーム自体が正しいか」への許可を明示的に加える（P4） |
| セッションがクラッシュした後にロックされてしまう | 陳腐な `.lock` ファイル | プラグインが `os.kill(pid, 0)` で検出して自動解放する |
| コンテキストウィンドウが破裂する | 一つのセッションで全タスクを終わらせようとしている | こそが「呼び出しごとに一つのタスク」が解決する問題——終了させて、もう一度呼び出す |
| 実行者が自分が引き起こしていないテスト失敗を直そうとする | 兄弟タスクの干渉 | `git stash` による HEAD 検証法で責任の帰属を確認する |

---

## 八、総括としての見解と結論

### 見解 1：マルチエージェントの価値は「より多くの計算能力」ではなく「構造化された異議」にある

多くの人はマルチエージェントを「三回実行して一番良いのを取る」ことだと思っています。OMH のやり方はまったく違います：**三つのロールのタスク目標は互いに衝突するようにできています。**

- プランナーの目標は**案を生み出すこと**
- 批評者の目標は**案を破壊すること**
- アーキテクトの目標は**構造を評価すること**

この**内蔵された対抗性**こそが価値の源泉です。もし三つのロールがすべて「他に問題がないか一緒に考えて」というものなら、それは同質なサンプリングを三回やっているだけで、金を燃やす以外の効果はありません。

**結論**：マルチエージェントシステムを設計するとき、まず自問せよ——「これらのロールの目標は本当に衝突しているか？」衝突していないなら、あなたはただトークンを浪費しているだけだ。

### 見解 2：最大の洞察は「批評者は問題文そのものを疑う許可を与えられなければならない」こと

P4 番目の落とし穴は、リポジトリ全体で情報密度が最も高い一条です：

> "Without licensing, the Critic catches details. With licensing, the Critic catches the frame."

この規則はより普遍的な現象を明らかにしています：**AI はデフォルトで、あなたが与えたフレームの中で思考する。** 「この for ループをどう最適化するか」と聞けば、彼は決して「このループはそもそも存在すべきではない」とは言いません。あなたは明示的に「私の前提を覆してもよい」という許可を与えなければならないのです。

そしてその裏付けもリポジトリ内にあります：OMH の中核となる実行アーキテクチャ（呼び出しごとに一つのタスク）**は、まさに許可を与えられた批評者がぶち壊して生まれたものです**。

**結論**：重要な AI 相談のたびに、明示的に一言加えよ——「この問題の立て方自体が正しいかどうかも疑ってほしい」。この一言の期待収益は、より高価なモデルに乗り換えるよりも大きいかもしれない。

### 見解 3：「証拠は主張に勝る」は、すべての AI エンジニアリングのデフォルト設定にすべき

AI の「完了しました」という主張の信頼度は、ほぼゼロです。悪意があるからではなく、その生成メカニズムがそもそも「もっともらしい文を補完する」ことだからです。

OMH の三層防御は真似する価値があります：

1. **ベリファイアは読み取り専用** —— コードを変更できないので、「ついでに直してから合格と言う」ことができない
2. **証拠を実行するのはオーケストレーター** —— 証拠の出所は被検収者ではなく、源流から捏造の可能性を断つ
3. **二値判定で割引なし** —— 五つ中四つ合格でも FAIL

**結論**：どんな AI 自動化フローでも、「誰がテストを実行するか」という問いの答えは「被検収側」であってはならない。これは監査学で最も古い原則であり、AI 時代でも同様に成立する。

### 見解 4：「大きな失敗」は「静かな救済」よりも長期的な価値がある

> "Loud failure, not silent rescue. This is deliberate: it preserves the feedback signal."

この哲学は直感に反しますが、極めて正しい。私たちは本能的に AI の出力にフォールバックを付け加えたくなります：フォーマットがおかしければ正規表現で救い、フィールドが欠けていればデフォルト値を埋める。その結果は——**あなたのプロンプトは永遠に改善されない。なぜなら、その劣り具合がフォールバックロジックに食い尽くされてしまうからだ。**

OMH は v0 で救済分岐を作らないことを明確に選択し、「契約の散文が実際に効くのか」という真のシグナルを集めようとしています。

**結論**：システムがまだ進化している段階では、**フォールバックを急いで足すな。** フォールバックは、失敗の分布を十分に理解してから加えるべきものだ。そうでなければ、それは痛み止めであり、病気を隠すだけになる。

### 見解 5：「労働者の規律」と「現場監督のプレイブック」を分けるのは、過小評価されたアーキテクチャ上の決定

OMH は各ワークフローを二つのスキルに分けています：

- `omh-ralph` = 労働者が `delegate_task` の内部で守る規律
- `omh-ralph-driver` = 現場監督が二つの派遣の**間**で使うプレイブック

これが解決するのは現実の痛点です：**この二種類の知識は、ロードされるタイミングと消費者がまったく異なる。** 労働者はバッチの組み方を知る必要がなく、現場監督は単体テストの書き方を知る必要がない。混ぜてしまうと、両者が大量の無関係な内容を読まされ、コンテキストを無駄に焼くことになります。

**結論**：AI スキル/プロンプトを書くときは、「テーマの関連性」ではなく「誰がいつ読むか」で分割せよ。

### 見解 6：36 の番号付き落とし穴は、このプロジェクトで最も価値のある資産

二つの driver を合わせて 36 の落とし穴（P1–P26 + P1–P10）があり、それぞれが実際の運用から踏み抜いて得られたものです。これらは「ベストプラクティス一覧」のような空疎な言葉ではなく、「META 問題を書かなければ、批評者はフレームの中に留まる」という具体的な実行可能な因果判断にまで落とし込まれています。

特に P26 の言葉：

> "The brief is the test of altitude: if you cannot reduce the deep review to a clean decisions-first brief, you do not have the altitude you think you have."

**この言葉はすべての AI ユーザーへの鏡です。** あなたの AI が 3000 字の出力を渡してきて、読み終えてもどうすればいいか分からない——それは AI が努力していないのではなく、「高度」に問題があるのです。

**結論**：AI フレームワークが成熟しているかどうかは、「落とし穴リスト」があるかどうかで判断できる。原理はあるが落とし穴がないものは、十中八九、実戦では回っていない。

### 見解 7：「他人の設計上のトレードオフをバグとして報告しない」

`omh-delegate.md` の "There is no upstream fix to wait for: the contract is the feature" という言葉は、稀有な節制を示しています。

Hermes の `delegate_task` は最終サマリーだけを返す——これにより親エージェントは中間過程を手に入れられません。これをバグとして文句を言い、上流の修正を待つのは簡単です。OMH の判断は：**これは分離性の必然的な代償であり、欠陥ではなく機能である。** そこで彼らは待つのではなく、「サブエージェント永続化」を設計して迂回しました。

**結論**：サードパーティフレームワークの制限に直面したら、まず「これは意図的なものか？」と問え。意図的なら、こちら側で適応を設計し、上流が変わるのを賭けるな。

### 見解 8：コストの透明性は職業倫理である

README は明確に書いています：順調なパスで 5–8 回の呼び出し、最悪で 14–16 回。

**大多数の AI フレームワークはこの数字を書こうとしません。** 書けば責任を負わなければならず、「十分に魔法っぽくない」ようにも見えるからです。OMH は書き、さらに三振アウトの上限をハードな制約として設けました。

**結論**：あらゆる AI ツールを評価するとき、まずコストエンベロープを探せ。見つからなければ、デフォルトで「上限なし」とみなすこと。

### 見解 9：`.omh/` の選択的共有は、AI 時代の新しいバージョン管理マナー

> "A spec or a consensus plan is a decision artifact [...] State and logs are per-session runtime. Sharing them adds noise without value."

**意思決定はリポジトリに入り、過程はリポジトリに入らない。** この境界線は極めて正確です。コンセンサスプランは ADR であり、永久保存に値します。一方、あるセッションの状態 JSON は、`git log` を汚す以外に何の役にも立ちません。

**結論**：自分のプロジェクトに「AI 成果物のリポジトリ収録規則」を定めよ。仕様、プラン、調査レポート → 入れる；状態、ログ、進捗 → 入れない。

### 見解 10：ブートストラップは最も強い信頼性の証明

> "OMH was built using its own tools. The first skill implemented was `omh-ralplan`, which was then used to design the remaining skills through multi-agent debate."

まずコンセンサスプランナーを作り、それを使って残りの全スキルを設計しました。しかも毎回のコンセンサスで生まれたプランは、**実際の OMC ソースコードと突き合わせて再検証**され、空想ではないことが確認されています。

**結論**：開発者ツールが信頼できるかどうかは、作者自身がそれを使っているかで分かる。自ら使わないツールは、本質的にはデモだ。

### まとめ：OMH が本当に伝えようとしていること

すべての技術的細部を脇に置けば、Oh My Hermes が伝えているのは一つの観念です：

**AI が信頼できないことは問題ではない。問題は、あなたが「AI が信頼できない」ことに対してプロセスを設計していないことだ。**

- AI には盲点がある → ならば、別の AI に盲点探しを専門でやらせる（批評者）
- AI は自分勝手に語る → ならば、その言葉を信ぜず証拠だけを見る（ベリファイア + オーケストレーターがテストを実行）
- AI は無限ループに陥る → ならば、エラーのフィンガープリントを数え、三回で遮断する
- AI はコンテキストを破裂させる → ならば、毎回一つのことだけをやり、状態をディスクに置く
- AI はフレームの中で思考する → ならば、明示的にフレームを覆す許可を与える（META 問題）
- AI は過度に丁寧になる → ならば、明確に伝える「信頼は使うためのものであって、とっておくものではない」

**信頼できない性質の一つひとつに、一つの工学的規律が対応している。** これが OMH のすべての秘密です——それは AI をより賢くしようとするのではなく、**それほど賢くない AI が、良い規律のもとで信頼できる結果を生み出せるようにする**ものなのです。

だからこそ学ぶ価値があります：**これらの規律は、あなたがどのモデルを使い、どのフレームワークを使うかとは、ほとんど無関係だからです。**

---

## 九、参考資料

- プロジェクトリポジトリ：`https://github.com/witt3rd/oh-my-hermes`
- Hermes Agent：`https://github.com/NousResearch/hermes-agent`
- 着想の源 oh-my-claudecode：`https://github.com/Yeachan-Heo/oh-my-claudecode`
- コンセプトドキュメント：`https://github.com/witt3rd/oh-my-hermes/blob/master/docs/concepts.md`
- プラグインドキュメント：`https://github.com/witt3rd/oh-my-hermes/blob/master/docs/plugin.md`
- 派遣ラッパー：`https://github.com/witt3rd/oh-my-hermes/blob/master/docs/omh-delegate.md`
- OMC との比較：`https://github.com/witt3rd/oh-my-hermes/blob/master/docs/omc-comparison.md`
- Hermes の制約説明：`https://github.com/witt3rd/oh-my-hermes/blob/master/docs/hermes-constraints.md`
- 未完成の部分：`https://github.com/witt3rd/oh-my-hermes/blob/master/docs/gaps.md`
- ロードマップ：`https://github.com/witt3rd/oh-my-hermes/blob/master/ROADMAP.md`
- コントリビューションガイド：`https://github.com/witt3rd/oh-my-hermes/blob/master/CONTRIBUTING.md`
- triage スキルの議論：`https://github.com/witt3rd/oh-my-hermes/issues/9`










