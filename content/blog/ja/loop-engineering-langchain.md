---
title: "The Art of Loop Engineering 徹底解説（LangChain 公式）：4つのループの積み重ね——Agent ループから検証ループ、イベント駆動ループ、山登り改善ループへ、各層の LangChain プリミティブ"
description: "LangChain 公式ブログ『The Art of Loop Engineering』（著者 Sydney Runkle、2026-06-16、7分で読了）を完全解説。核心思想：コアな agent アルゴリズム自体がループ——LLM にコンテキストを与え、完了するまでツールをループで呼び出させる。だがこれは最も基本的なループに過ぎず、agent を動かす唯一のループではない。swyx の loopcraft（ループを積み重ねる技術）の思想を借用し、LangChain は4層のループを提案する：① Agent loop（モデルがタスク完了までツールを繰り返し呼ぶ——create_agent プリミティブ）；② Verification loop（grader が rubric に照らして出力をチェックし、不合格ならフィードバック付きで再試行——RubricMiddleware／after_agent hook。LLM-as-judge が古典的な実装）；③ Event driven loop（イベントが agent 実行をトリガーする——新ドキュメントの到着、cron スケジュール、webhook——agent はより大きなシステム内で継続的に動くコンポーネントになる——LangSmith Deployment の cron/webhooks、Fleet の channels/schedules、OpenClaw の heartbeats）；④ Hill climbing loop（すべての agent 実行が trace を生成し、分析エージェントが trace を読んで harness 設定を書き換える——プロンプト/ツール/grader の調整——LangSmith Engine。RL ファインチューニングやメモリ/スキル最適化にも拡張可能）。要点：第4ループの戻り矢印は頂上に戻るだけでなく、内部に届いて agent ループを直接更新する——外側ループの各サイクルが内側ループをより効果的にする。だが自動化は人間の排除を意味しない：各層に自然な人間監視ポイントがあり、機密性の高い操作（金融取引、DB 操作）にはライブでの人間レビューが必要。結びに Satya Nadella の言葉：学習ループを早期に構築する企業は、人間の判断とトークン資本が共に複利する場所で、再現が難しい優位性を築くだろう。"
date: "2026-08-06"
author: "TopDigg Research Team"
tags: ["Loop Engineering", "LangChain", "LangSmith", "AI Agent", "loopcraft", "swyx", "create_agent", "RubricMiddleware", "LLM-as-Judge", "Deep Agents", "LangGraph", "Fleet", "Satya Nadella"]
categories: ["Deep Dive"]
keywords: ["Loop Engineering", "LangChain", "LangSmith", "循環エンジニアリング", "AI エージェント", "loopcraft", "swyx", "検証ループ", "イベント駆動", "山登りループ", "create_agent", "RubricMiddleware", "Engine", "Fleet", "人間の監視", "Satya Nadella"]
---

# The Art of Loop Engineering 徹底解説（LangChain 原文）：4つのループの積み重ね——Agent ループから検証ループ、イベント駆動ループ、山登り改善ループへ

> 核心思想：**Agent のコアアルゴリズムはループ——LLM にコンテキストを与え、完了するまでツールをループで呼び出させる。だがこれは最も基本的なループに過ぎず、唯一ではない。** LangChain 公式ブログ（著者 Sydney Runkle、2026-06-16）は swyx の「loopcraft: the art of stacking loops」（ループを積み重ねる技術）の思想を借用し、4層のループ積み重ねの世界観を提示する：**① Agent loop**（モデルがタスク完了までツールを呼ぶ——`create_agent` プリミティブ）；**② Verification loop**（検証ループ——grader が rubric に照らして出力をチェックし、不合格ならフィードバック付きで再試行——`RubricMiddleware`／`after_agent` hook。LLM-as-judge が古典的実装）；**③ Event driven loop**（イベント駆動ループ——イベントが agent 実行をトリガーする：新ドキュメントの到着、cron スケジュール、webhook——agent はより大きなシステム内で継続的に動くコンポーネントになる——LangSmith Deployment の cron/webhooks、Fleet の channels/schedules、OpenClaw の heartbeats）；**④ Hill climbing loop**（山登り改善ループ——各 agent 実行が trace を生成し、分析エージェントが trace を読んで harness 設定を書き換える——LangSmith Engine。RL ファインチューニング信号やメモリ/スキル最適化にも拡張可能）。要点：**第4ループの戻り矢印は頂上に戻るだけでなく、内部に届いて agent ループを直接更新する**——外側ループの各サイクルが内側ループをより効果的にする。だが自動化は人間の排除を意味しない：各層に自然な人間監視ポイントがあり、機密性の高い操作（金融取引、DB 操作）にはライブでの人間レビューが必要。結びに Satya Nadella：**学習ループを早期に構築する企業は、人間の判断とトークン資本が共に複利する場所で、再現が難しい優位性を築くだろう。**

---

## 一、本記事の説明

### 1.1 これは何か

本稿で解説するのは **LangChain 公式ブログの記事『The Art of Loop Engineering』**、著者 **Sydney Runkle（LangChain）**、公開日 **2026-06-16**、読了時間約7分。純粋なコンセプト記事ではなく、**製品化された工学世界観**です：LangChain/LangSmith プラットフォーム（Observability、Evaluation、Deployment、Sandboxes、LLM Gateway、Fleet、Engine、deepagents、langgraph）のほぼすべての能力が、この「ループ積み重ね」フレームワークの中に位置づけられます。

記事の立場を一言で：**Agent は現実世界で行動を起こすことで仕事を自動化するから有用だ。しかし agent に価値ある仕事を確実にやらせるには、良いモデルだけでは足りない——タスク群に適合した、注意深く設計された harness（足場）が必要だ。** コアな agent アルゴリズムは単純です：LLM にコンテキストを与え、完了するまでツールをループで呼び出させる——これが最も基本的なループ。**だが agent を動かすループはこれだけではない。**

記事は swyx（Shawn Wang）が最近書いた **「loopcraft: the art of stacking loops」** を引用します——核心思想：**ループを積み重ね、拡張することで、より効果的な agent を構築できる。** LangChain のこの記事は「これが私たちの考える積み重ね構造であり、各層を LangChain プリミティブでどう計装（instrument）するか」への回答です。

### 1.2 キーデータと情報

- 著者：**Sydney Runkle（LangChain）**、レビューに感謝：Vivek、Mason、Harrison、Hunter
- 公開チャネル：LangChain 公式ブログ `langchain.com/blog`
- 公開日：**2026-06-16**、読了時間7分
- 核心的インスピレーション：swyx の『loopcraft: the art of stacking loops』
- 記事全体を貫く動機付けの例：**LangChain 社内ドキュメント agent（docs agent）**——ドキュメント改善リクエストを受ける → モデルが計画して修正案を起草 → ツールでリポジトリを clone し、ファイルを読み、ドキュメントを書き、PR を開く
- プラットフォームの文脈：LangSmith（Observability／Evaluation／Deployment／Sandboxes／LLM Gateway／Fleet／Engine）＋オープンソースフレームワーク（deepagents／langgraph／langchain）
- 結びの見解：Satya Nadella（マイクロソフト CEO）の組織的学習ループ論
- 業界の結論：Steipete（Peter Steinberger）、Boris（Cherny）、Andrej（Karpathy）「全員が同じ結論に達している」

### 1.3 何を解決するのか

記事は入れ子になった一連の問題に答えます：

1. **単層の問題**：agent ループは仕事をこなすが、**初回で正しく一貫した出力を生むとは限らない**——検証層が必要。
2. **統合の問題**：agent は手動で呼び出すものではなく、**より大きなシステム内で継続的に動くコンポーネント**——イベント駆動層が必要。
3. **改善の問題**（おそらく最も重要）：最初の3つのループが自動化するのは「仕事」、第4は「**改善そのもの**」——trace を読んで harness を逆方向に最適化する。

その答えは、4層のループ積み重ね＋各層の LangChain プリミティブ＋各層の人間監視ポイントです。

---

## 二、核心思想

### 2.1 一言の世界観

> **「コアな agent アルゴリズムは単純だ：LLM にコンテキストを与え、完了するまでツールをループで呼び出させる。これが最も基本的なループ。だが agent を動かすループはこれだけではない。」**

より高度な能力はすべて、この基本ループの上に**積み重ねられる**。記事の核心フレームワークは4層：

| レベル | ループ | 役割 | LangChain プリミティブ |
|--------|--------|------|------------------------|
| 1 | **Agent loop** | モデルがタスク完了までツールを繰り返し呼ぶ | `create_agent`、LangChain がサポートする任意のモデル |
| 2 | **Verification loop** | agent 実行後、出力を rubric で採点、不合格ならフィードバック付きで再試行 | `RubricMiddleware` |
| 3 | **Event driven loop** | イベントが agent 実行をトリガーし、実システムを更新 | LangSmith Deployment（cron トリガー／webhooks）または Fleet channels |
| 4 | **Hill climbing loop** | 本番実行の trace を分析エージェントに与え、harness 設定を改善 | LangSmith Engine |

### 2.2 ループ積み重ねの本質：戻り矢印が内部に届く

LangChain は第4ループの重要な動きを強調します：

> **「The key move here is that the return arrow doesn't just loop back to the top — it reaches inside and updates the agent loop directly. Each cycle of the outer loop makes the inner loops more effective.」**
> （ここでの重要な動きは、戻り矢印が頂上に戻るだけではないこと——内部に直接届いて agent ループ自体を更新する。外側ループの各サイクルが内側ループをより効果的にする。）

これこそ「ループの積み重ね」と「複数タスクを逐次実行すること」の本質的な違いです：**ループの中にループがあり、外側の出力が内側の設定を最適化する。**

### 2.3 自動化 ≠ 人間の排除

記事は独立した節を割いて強調します：

> **「Automation doesn't mean removing humans from the loop.」（自動化は人間をループから排除することを意味しない。）**

各層には**人間の監視が価値を加える自然なポイント（natural points where human oversight adds value）** があります：

- **agent loop**：機密性の高いアクション／ツール呼び出しの前に人間の入力を要求
- **verification loop**：機密ワークフローでは人間が grader を務める
- **application loop**：出力をエンドユーザーに返す前に人間が承認
- **hill climbing loop**：harness の改善はデプロイ前に人間のレビューを経由

LangChain の立場：**すべてのオープンソースフレームワークが「human in the loop」をファーストクラスのプリミティブにしている。** 例：「自動化された grader はリンクが解決するかをチェックできる。だが、フレーミングが対象オーディエンスにとって間違っていることに気づくのは人間だ——コンテキスト、経験、趣味から得られるその種の判断こそ、人間のレビューが価値を発揮する場所だ。」

---

## 三、詳細チュートリアル：4つのループを層ごとに

### 3.1 Loop 1：The Agent（Agent ループ）——仕事を自動化する土台

**最も核心のところで、agent は「タスク完了までツールをループで呼び出すモデル」に過ぎない。** これが LangChain の `create_agent` が与えてくれるもの：**任意のモデルを選び、ツールを差し込めば、動く agent ループができあがる。**

- **ツールこそが、agent に「現実世界で行動する」力を与える。** ツールがなければ agent はテキストを生成するだけ。ツールがあればファイルを書き、コードを実行し、API を呼べる。
- **記事を貫く動機付けの例（docs agent）**：最初のループレベルで、ドキュメント改善リクエストを受け、モデルが計画して修正を起草し、ツールで**リポジトリを clone し、ファイルを読み、ドキュメントを書き、pull request を開く**など。

この層が自動化するのは「**行うこと**」（getting work done）。

### 3.2 Loop 2：The Verification Loop（検証ループ）——品質と正確性の保証

**Agent ループは仕事をこなすが、初回で正しく一貫した出力を生むとは限らない。一貫性が重要なとき、出力をチェックし、不足があればフィードバックをモデルに送り返す検証ループで包むのが有用だ。**

検証ループは **grader（採点者）** を追加します：

> agent の出力が **rubric（採点基準）** に照らして合格かをチェックし、不合格ならフィードバック付きで結果を送り返すもの。

- **Grader は決定論的（deterministic）でも、エージェント的（agentic）でもよい**（LLM-as-judge は古典的な例）。
- **LangChain の実装**：`RubricMiddleware` がこのパターンを直接扱う。あるいは `create_agent` の `after_agent` hook で自分で配線する。

**docs agent の例**：grader は試行のたびにテストを実行——**すべてのリンクが解決するか、すべての CI チェックが通るか、diff が実際にリクエストされた範囲に限定されているか**をチェック。この種のエラーは手動レビューなしで捕捉できます。

**トレードオフ**：検証の追加は**実行ごとのレイテンシとコスト**を増やす。品質が速度より重要なときに価値がある——それはほとんどの本番ユースケースに当てはまります。

この層が自動化するのは「**検証**」（verifying）。

### 3.3 Loop 3：The Event Driven Loop（イベント駆動ループ）——仕事を規模で自動化する

**agent 開発の最も重要な部分の一つは統合層：エージェントをあなたのエコシステムに接続し、バックグラウンドで実行できるようにすること。**

イベント駆動ループはまさにこれをやります：**イベントが発火する——新しいドキュメントが届く、スケジュールがトリガーされる、webhook が到達する——そして agent が実行される。**

> **「The agent isn't something you invoke manually; it's a component running continuously inside a larger system.」**
> （agent は手動で呼び出すものではない。より大きなシステム内で継続的に動くコンポーネントだ。）

**LangChain の実装**：

- **LangSmith Deployment** がトリガーインフラをサポート。**cron スケジュールと webhooks** を含む。
- **cron の有名な使用例：「heartbeats」（ハートビート）**——**OpenClaw** 由来で、agent を**常時オン、プロアクティブなアシスタント**に変える。
- **docs agent は Fleet（LangChain のノーコード agent ビルダー）で駆動**：Fleet の **channels と schedules** がイベント駆動型・cron 型トリガーを処理する。`#docs-plz` Slack チャンネルでメッセージが送られるたびに docs agent を発火させるのにチャンネルを使っている。

この層が自動化するのは「**規模での仕事**」（work at scale）——agent は「呼べば来る」から「システムの一部として、イベントが来れば働く」に変わります。

### 3.4 Loop 4：The Hill Climbing Loop（山登り改善ループ）——改善そのものを自動化する

**最初の3つのループは仕事を自動化する。第4（そしておそらく最も重要）は改善を自動化する！**

- **すべての agent 実行は trace（軌跡）を生成する**：モデルが何をしたか、どのツールを呼んだか、grader フィードバックなどの記録。
- その trace には「**何が機能し、何が機能しないか**」に関する高価値のシグナルが含まれる。
- **山登りループは trace に対して分析エージェントを実行し、その発見を使って harness を改善された設定で書き直す**——プロンプト／ツールの微調整、あるいは grader の微調整。
- **LangChain の実装**：**LangSmith Engine**（彼らの trace 分析エージェント）がこの第4ループを計装する。

**docs agent の例**：docs agent の trace に対して Engine を実行し、問題を検出する。**複数の trace が潜在的な問題を示すとき、問題のあるプロンプトやツールの変更を求める issue が提出される。**

**外挿の方向**（記事が明示的に列挙）：

> 「プロンプトとツールの設定は改善するのが最も簡単なものだが、唯一の選択肢ではない。オープンウェイトモデルを実行するチームにとって、山登りループは **RL ファインチューニング** に供給でき、trace や eval の結果をトレーニングシグナルとしてモデル自体を改善できる。**補助コンテキスト（auxiliary context）**——メモリや取得したスキルなど——も同じ方法で改善できる。**ループはパターンであり、何を最適化するかはあなた次第だ。**」

（"The loop is the pattern; what it optimizes is up to you."）

この層が自動化するのは「**改善**」（improvement）——しかも**継続的で自律的な**改善です。

### 3.5 完全な対比表

| ループ | 何をするか | 影響 | LangChain プリミティブ |
|--------|-----------|------|------------------------|
| 1. Agent loop | モデルがタスク完了までツールを繰り返し呼ぶ | 仕事を自動化 | `create_agent`、LangChain がサポートする任意のモデル |
| 2. Verification loop | agent 実行後、出力を rubric で採点、不合格ならフィードバック付きで再試行 | 仕事の品質と正確性を保証 | `RubricMiddleware` |
| 3. Event driven loop | イベントが agent 実行をトリガーし、実システムを更新 | 規模での仕事の自動化 | LangSmith Deployment の cron トリガー／webhooks、または Fleet channels |
| 4. Hill climbing loop | 本番実行の trace を分析エージェントに与え、harness 設定を改善 | harness 自体の改善 | LangSmith Engine |

---

## 四、設計哲学

### 4.1 「ループはパターンであり、何を最適化するかはあなた次第」

LangChain はループを**メタパターン**に抽象化します：同じ「分析→調整→再試行」ループで、プロンプト、ツール、grader、RL トレーニングシグナル、さらにはメモリやスキルまで最適化できる。**対象は違うが、パターンは同じ。** これは「agent を作る」から「自分で良くなる agent システムを作る」への哲学的跳躍です。

### 4.2 ツール論争から積み重ね構造へ

記事の含意は swyx の loopcraft と Addy Osmani の観察を呼応します：**注意を「どの agent ツールか」から「ループがどう積み重なるか」へ移した瞬間、議論は終わる。** 価値は単独のループの中ではなく、ループ間の**階層関係**の中にある——特に「外側ループが内側ループを最適化する」再帰構造に。

### 4.3 人間の監視は層設計の一部であり、パッチではない

各層に自然な人間の介入ポイントがあり、LangChain は human-in-the-loop を**ファーストクラスのプリミティブ**として明示的に扱います（後付けの修正ではない）。判断（judgment）——「コンテキスト、経験、趣味から得られる」能力——は自動化された grader では代替できません。**機密性の高いアクション（金融取引、データベース操作）にはライブでの人間レビューが必要です。**

### 4.4 組織の視点：学習ループは堀（モート）

記事は結びに Satya Nadella（マイクロソフト CEO）を引用して組織レベルの利害を枠付けます：

> **「companies that build learning loops early, where human judgment and token capital compound together, will build an advantage that's hard to replicate.」**
> （**学習ループを早期に構築する企業は——人間の判断とトークン資本が共に複利する場所で——再現が難しい優位性を築くだろう。**）

同時に業界のコンセンサスがすでに形成されつつあると指摘します：

> **「AI leaders like Steipete, Boris, and Andrej have all arrived at the same conclusion: the potential in agents is in the loops you build around them.」**
> （Steipete、Boris、Andrej といった AI リーダーは全員同じ結論に達している：**agent の潜在力は、その周りに構築するループの中にある。**）

### 4.5 重心の移動：Loop 1/2 から Loop 3/4 へ

> **「We've been thinking about loops 1 and 2 for a while. But focus should pivot to loops 3 and 4 where value compounds by embedding agents into your ecosystem that continuously improve in response to your criteria.」**
> （私たちはしばらくループ1と2を考えてきた。だが焦点はループ3と4に移すべきだ——そこでは、エージェントをエコシステムに埋め込み、あなたの基準に応じて継続的に改善させることで価値が複利する。）

---

## 五、帰納的まとめ

### 5.1 核心的見解リスト

1. **Agent の核心はループ**：LLM にコンテキストを与え、完了するまでツールをループで呼ぶ——すべての agent 仕事の土台（Loop 1、`create_agent`）。
2. **信頼性には検証ループが必要**：grader が出力を rubric でチェックし、不合格ならフィードバック付きで再試行。grader は決定論的ロジックでも LLM-as-judge でもよい（Loop 2、`RubricMiddleware`／`after_agent` hook）。代償はレイテンシとコスト——品質が速度に勝るときに価値がある。
3. **規模にはイベント駆動が必要**：agent は「手動で呼び出される」から「より大きなシステム内で継続的に動くコンポーネント」へ——イベント（新ドキュメント、cron、webhook）が実行をトリガー（Loop 3、LangSmith Deployment cron/webhooks、Fleet channels、OpenClaw heartbeats）。
4. **改善は自動化できる**：trace が改善シグナル。分析エージェントが trace を読んで harness 設定を書き換える——プロンプト、ツール、grader（Loop 4、LangSmith Engine）。
5. **重要な動きは「内部に届く」**：第4ループの戻り矢印は頂上に戻るだけでなく、agent ループを直接更新する——外側の各サイクルが内側のループをより効果的にする。これが loopcraft の本質。
6. **外挿の余地は大きい**：同じループパターンで RL ファインチューニング信号、メモリ、取得スキルを最適化できる——「ループはパターンであり、何を最適化するかはあなた次第」。
7. **自動化は人間の排除を意味しない**：各層に自然な監視ポイント。コンテキスト／経験／趣味から得られる判断は自動化 grader では代替不能。機密性の高いアクション（金融取引、DB 操作）にはライブでの人間レビューが必要。
8. **学習ループは組織の堀**（Satya Nadella）：人間の判断とトークン資本の複利 → 再現が難しい優位性。業界のコンセンサス（Steipete/Boris/Andrej）はすでに形成されている。

### 5.2 一言でまとめ

> **Agent の価値は単独のループの中ではなく、ループの積み重ね構造の中にある：Agent ループが仕事をし、検証ループが品質を支え、イベント駆動ループが規模化し、山登りループがシステム自身を良くする——そして人間の判断は全層を貫き、トークン資本を複利させる定数だ。** 「agent を構築する」から「自身の agent を改善するシステムを構築する」へ——それが loop engineering の実践形です。

---

## 参考資料

- 原文：LangChain、『The Art of Loop Engineering』（Sydney Runkle、2026-06-16）—— `https://www.langchain.com/blog/the-art-of-loop-engineering`
- swyx、『loopcraft: the art of stacking loops』
- LangChain 関連ドキュメント：`create_agent`、`RubricMiddleware`、`after_agent` hook、LangSmith Deployment（cron jobs／webhooks）、LangSmith Engine、Fleet channels、deepagents quickstart、langgraph
- 関連プロジェクト：OpenClaw（heartbeats、Peter Steinberger）
- 関連人物の見解：Steipete（Peter Steinberger）、Boris Cherny（Anthropic Claude Code）、Andrej Karpathy、Satya Nadella（マイクロソフト CEO）
- 当サイト関連記事：『Loop Engineering 徹底解説（Addy Osmani 原著）』（`loop-engineering-addy-osmani`）、『Loop Engineering 徹底解説（Cobus Greyling 原著）』（`loop-engineering-substack-analysis`）
