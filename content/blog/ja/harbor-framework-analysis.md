---
title: "Harbor Framework 徹底解説：AI に「試験場」をつくる — Turing-Bench から Harbor への進化の道"
description: "Harbor Framework（laude-institute 製）を徹底解説：AI Agent を『コンテナ試験室』で公平に評価できる、原文を深く読めば誰でも理解できるオープンソースフレームワーク。本記事は小学生でもわかる比喩で、Terminal-Bench 2.0 公式評価ツール Harbor の核心概念（タスク / データセット / Agent / Trial / Job）を説明し、詳細なインストール・実行チュートリアル（Docker ローカル実行 + Daytona クラウド 32 並列）を提供し、6 つの設計哲学（モジュール化インターフェース、クラウドサンドボックスによる水平拡張、評価データパイプラインの一体化、デフォルト Linux、不正防止、RewardKit 軽量検証）を整理し、『評価はインフラである』『最小のエンドツーエンドを先に動かす』などの核心的見解をまとめ、LLM-as-a-Judge と MCP サイドカー・タスクの 2 つの実践チュートリアルの要点も紹介します。"
date: "2026-08-09"
author: "TopDigg Research Team"
tags: ["Harbor", "Terminal-Bench", "AI Agent", "Benchmark", "LLM", "Evaluation", "Agent Framework", "Terminal-Bench 2.0", "Claude Code", "Daytona", "RewardKit", "MCP", "Docker", "Machine Learning"]
categories: ["深度解析"]
keywords: ["Harbor Framework", "Terminal-Bench 2.0", "AI Agent 評価", "ベンチマーク", "LLM eval", "コンテナ化タスク", "Daytona クラウドサンドボックス", "RewardKit", "LLM-as-a-Judge", "Agent トレーニング", "SFT", "RL", "プロンプト最適化", "Turing Bench", "Claude Code 評価"]
---

# Harbor Framework 徹底解説：AI に「試験場」をつくる —— Terminal-Bench から Agent 評価への完全な道のり

> **核心思想：** AI にも「卒業試験」がやってくる。Harbor は AI Agent のために作られた「試験場」だ。すべてのタスクを 1 枚の試験問題（コンテナ環境 + 指示 + 自動採点）に変え、異なるベンダーの AI Agent（Claude Code、Codex、Gemini CLI……）を同じ試験室で公平に点数比較させ、その点数で「本当に仕事ができる人」が誰かを決める。さらに Terminal-Bench 2.0（ターミナル操作ベンチマーク）を公式の試験場に変え、「AI がターミナルを使えるか」に初めて科学的で、再現可能で、水平拡張可能な物差しをもたらした。

---

## 一、これは何か？（小学生でもわかる版）

あなたのそばに一群の AI の子どもたちがいると想像してほしい。彼らはみんな「プログラマーアシスタント」になりたがっている。

- パソコンのキーボードをカタカタ打てる子；
- チュートリアルを読める子；
- ファイルを開いて、書き換えて、保存できる子。

しかし問題はここだ：**本当に仕事ができるのは誰なのか、どうやって知るのか？**

ただ「できる？」と聞くだけなら、どの AI も胸を叩いて「できる！」と答えるだろう。試験前に子どもに「ちゃんと勉強した？」と聞くのと同じで、誰もが「勉強した」と言う。

**Harbor こそ、その「試験問題を作る先生」だ。**

Harbor がやることは 3 つ：

1. **出題**：実際の仕事の指示（例：「このフォルダのバグを見つけて修正して」）を、独立した「小さな部屋」（コンテナ）に詰め込む。部屋にはパソコン、ツール、資料が用意されている。
2. **監督**：AI Agent を部屋に入れて仕事をさせ、横で見守りながら AI の一歩一歩の操作を記録する（これが「trajectory」、つまり試験の軌跡だ）。
3. **採点**：専用の「採点先生」（verifier）が部屋の中の結果をチェックする — AI がファイルを正しく修正し、ソフトウェアを正しくインストールし、テストを正しく書けば 1 点、そうでなければ 0 点。さらに細かい点数（例：「ユーモア感 0.75 点」）も付けられる。

1 つの AI を試験し終えたら、次の AI を試験する。点数の高い方がより優秀な「インターン」だ。

このシステムは「試験して採点する」だけでなく、3 つの大きなこともできる：

- **人材選抜**：複数の AI のどちらが強いかを比較する（benchmark ランキング）；
- **人材育成**：高得点の試験軌跡を収集し、AI をより強く訓練する（SFT / RL 強化学習）；
- **弱点発見**：あなたの AI がいつも同じ工程でミスをする？評価を使ってどの工程が弱いのかを突き止め、データでプロンプトを最適化する（prompt optimization）。

だからこそ Harbor という名前はぴったりだ：**港（harbor）** — すべての AI の「知性の船」がここに寄港し、整備を受け、再び出航する。

---

## 二、プロジェクト概要

### 2.1 基本情報

- **プロジェクト名**：Harbor
- **作者 / メンテナー**：laude-institute（Anthropic の研究機関であり、Terminal-Bench のオリジナルチームの 1 つ）
- **オープンソース URL**：[https://github.com/laude-institute/harbor](https://github.com/laude-institute/harbor)
- **公式ドキュメント**：https://www.harborframework.com
- **ライセンス**：MIT
- **インストール方法**：pip / uv でワンコマンドインストール、ゼロ設定で最初の評価を実行
- **技術スタック**：Python（CLI + インターフェース）、Docker（ローカルコンテナ環境）、cloud sandbox（Daytona / Modal / E2B / Runloop など）
- **位置づけ**：AI Agent の評価、後訓練（post-training）、プロンプト最適化のための統合フレームワーク

### 2.2 何を解決するのか？

Harbor の公式ドキュメントの *Motivation* の部分にははっきりと書かれている：**2025 年 5 月に Terminal-Bench が公開されて以来、作者は人々が想像を超える使い方をしていることに気づいた** — カスタム評価に使う人、プロンプト最適化に使う人、RL（強化学習）を回す人、SFT（教師あり微調整）の訓練軌跡を生成する人、さらには CI/CD に組み込んで Agent の回帰テストを行う人までいる。

同時に、作者たちは痛感した：**「コンテナ化されたタスクの定義と管理」はスケールするのが難しい。** そこで彼らは Terminal-Bench の背後にある評価エンジンを取り出し、汎用の「評価フレームワーク」に再構築した — それが Harbor だ。

つまり Harbor は新しい「タスクセット」ではなく、**試験場を作る方法論**だ：既存のベンチマーク（Terminal-Bench、SWE-Bench Verified）を実行することもできるし、自分のタスク、自分の環境、自分の Agent を定義することもできる。

### 2.3 6 つの核心概念（すべて平易な言葉で）

「試験場」の比喩で Harbor の全概念を説明しよう：

- **タスク（Task）= 1 枚の試験問題**：1 つの指示 + 専用の小さな部屋（コンテナ環境）+ 1 つの自動採点問題（テストスクリプト）
- **データセット（Dataset）= 試験問題の束**：Task の総和で、通常は 1 つのベンチマークに相当する（例：Terminal-Bench 2.0）
- **Agent = 受験者**：実行される AI プログラム。Harbor は箱から出してすぐ使える 99 の主流受験者を内蔵している — Claude Code、Codex CLI、Copilot CLI、Gemini CLI、Grok Build、OpenHands など
- **コンテナ環境（Environment）= 試験室の部屋**：パソコンの「状態」（どの OS か、何のソフトが入っているか、ネットに接続できるか）
- **単一試行（Trial）= 1 回の解答**：1 つの Agent が 1 枚の試験問題に 1 回完全に解答し、1 つの点数（reward）が出る
- **タスクバッチ（Job）= 一斉試験**：多数の Trial を並行して実施する（複数のデータセット、複数の Agent、複数のモデルにまたがる）

---

## 三、詳細チュートリアル：ゼロから Terminal-Bench 2.0 を実行する

### ステップ 1：Harbor をインストール（1 コマンド）

`uv`（Python の高速パッケージマネージャー）を推奨：

```bash
uv tool install harbor
```

インストール後は確認：

```bash
harbor --help
```

### ステップ 2：Docker をインストールして起動

ローカル評価はデフォルトで Docker を「小さな部屋」として使う。Docker をインストールして起動していることを確認しよう。その後、Terminal-Bench 2.0 の最初の「検証問題」を実行できる — 公式の標準解答（Oracle）を 1 回実行する：

```bash
harbor run -d terminal-bench/terminal-bench-2 -a oracle
```

> **このステップの意味：** oracle（標準解答の解法）が動けば、Harbor のインストールが正しく、コンテナ環境が準備完了であることを意味する。Oracle は満点の問題であり、それを実行できれば試験場の自己点検は合格だ。

### ステップ 3：実際の Agent で実行する（ローカル）

受験者として Claude Code を試し、モデルは `anthropic/claude-haiku-4-5`（速くて安い）を選ぶ：

```bash
harbor run \
  -d terminal-bench/terminal-bench-2 \
  -m anthropic/claude-haiku-4-5 \
  -a claude-code
```

このコマンドはデータセットを自動ダウンロードし、コンテナを起動し、Claude Code を試験場に入れて解答させ、採点を実行し、最後に点数レポートを出力する。

### ステップ 4：自分のデータセットを実行する（ローカルのタスクフォルダ）

公式のデータセットを使いたくない？自分の Task ディレクトリを `-p` に渡すだけ：

```bash
harbor run -p "/path/to/dataset" -m "model" -a "agent"
```

### ステップ 5：クラウドで水平拡張（重要！）

公式は重要な実践的アドバイスを出している：**サンドボックス Agent の評価は通常とても遅い**（1 回の評価に数十ラウンドの対話が必要で、各ラウンドのコマンドに時間がかかる）。実験を加速する唯一の方法は、より多くの「試験場」を水平に開くことだ。 — クラウドサンドボックスプロバイダー（例：Daytona）を使う：

```bash
export DAYTONA_API_KEY="<your-daytona-api-key>"
export ANTHROPIC_API_KEY="<your-anthropic-api-key>"
harbor run \
  -d terminal-bench/terminal-bench-2 \
  -m anthropic/claude-haiku-4-5 \
  -a claude-code \
  --env daytona \
  -n 32
```

`-n 32` は 32 の試験場を同時に開いて並列試験することを意味する。API モデルでクラウドサンドボックスを実行すると、ボトルネックが CPU からネットワーク I/O に変わるため、並列数はローカルマシンのコア数をはるかに超えられる — これは公式が強く推奨する方法だ。

### ステップ 6：ランキングを見る & 成績を提出

- **ランキングを見る**：https://tbench.ai/leaderboard
- **成績を提出する**：公式はランキングログを [HuggingFace データリポジトリ](https://huggingface.co/datasets/alexgshaw/terminal-bench-2-leaderboard) に保存している。その README の説明に従って PR を開いて提出するだけだ。

---

## 四、応用チュートリアル（深く学びたい人はここ）

### 4.1 自分で「タスク」（試験問題）を書く

1 つのタスクは 1 つのディレクトリで、1 つのコマンドで骨組みを初期化できる：

```bash
harbor init --task "org/name"
```

生成される構造は、規格に沿った試験問題のような形だ：

    task.toml             # 卷子的「个人信息」+ 考生配置
    instruction.md        # 题目（给 AI 的指令）
    environment/          # 考场：Dockerfile 定义系统
    solution/             # 标准答案（可选，Oracle 用）
    tests/                # 判分脚本（test.sh → 产生 reward）

採点時、スクリプトはコンテナ内で実行され、スコアを `/logs/verifier/reward.txt`（`1` を書けば成功、`0` を書けば失敗）または `reward.json`（複数の指標を同時に書ける。例：`{"runtime_sec": 1.23, "accuracy": 0.95}`）に書き込む。

**採点に関する 1 つのアドバイス**（公式原文の精神）：テストスクリプトではできるだけ**絶対パス**を使い、相対パスによるエラーを避けよう。

### 4.2 Linux / Windows / マルチコンテナで試験したい？

- **OS**：`task.toml` の `[environment].os = "linux"`（デフォルト）または `"windows"`；
- **マルチコンテナ**（例：横に MCP Server やデータベースを置く）：`environment/` に `docker-compose.yaml` を置くと、Harbor が自動的にマージする。現在マルチコンテナはローカル Docker 環境でのみサポートされており、クラウドサンドボックスプロバイダーでは開発中だ。

### 4.3 自分で書いた Agent を試験に参加させる

2 つのタイプがある：

**外部 Agent（パソコン上で実行し、exec でリモートからコンテナを指揮する）：**

```python
from harbor.agents.base import BaseAgent

class MyExternalAgent(BaseAgent):
    @staticmethod
    def name() -> str:
        return "my-agent"

    async def setup(self, environment):
        # 安装你的 agent 和工具
        pass

    async def run(self, instruction, environment, context):
        # 在容器里执行任务
        pass
```

**インストール済み Agent（Claude Code のようにコンテナに直接インストールしてヘッドレスで実行する）：**

```python
from harbor.agents.installed.base import BaseInstalledAgent

class MyInstalledAgent(BaseInstalledAgent):
    async def install(self, environment):
        await self.exec_as_root(environment, command="apt-get install -y curl")
        await self.exec_as_agent(environment, command="pip install my-agent")

    async def run(self, instruction, environment, context):
        await self.exec_as_agent(environment, command=f"my-agent run '{instruction}'")
```

あなたの Agent で試験を開始する：

```bash
harbor run -d "dataset@version" --agent path.to.agent:MyAgent
```

### 4.4 AI を採点官にする（LLM-as-a-Judge チュートリアル）

中には「ファイルが正しいかどうか」では採点できない試験問題もある（例：「面白い詩を書いて」）。Harbor の公式チュートリアルでは、採点官も LLM に置き換える方法を教えている：

- `tests/llm_judge.py` で Anthropic API（構造化出力）を使ってカードを読み、スコアを返す；
- キーは `task.toml` の `[verifier.env]` で注入し、ソースコードに key を残さない；
- `/logs/verifier/reward.json` を出力する。例：`{ "funny": 0.75 }`、さらに多次元も可能：`{ "creativity": 0.9, "humor": 0.7, "grammar": 1.0 }`。

完全な例は `examples/tasks/llm-judge-example` にあるので、コピーして書き換えるだけでよい。

### 4.5 MCP Server を試験場のそばのアシスタントにする（MCP Server Task チュートリアル）

「Agent が外部サービスとやり取りする」実際の業務をシミュレートしたい？Docker Compose で「サイドカー」コンテナを追加して FastMCP Server を実行する：

```yaml
services:
  main:
    depends_on:
      mcp-server:
        condition: service_healthy
  mcp-server:
    build: { context: ./mcp-server }
    expose: ["8000"]
    healthcheck:
      test: ["CMD", "python", "-c", "import socket; s=socket.create_connection(('localhost',8000),timeout=2); s.close()"]
```

`task.toml` で `[[environment.mcp_servers]]` を宣言すると、Claude Code、Codex などの互換 Agent が自動的に登録して接続する。一連の流れ（サービス接続 → ツール呼び出し → 結果の書き込み → pytest 採点）は `examples/tasks/hello-mcp` にある。

### 4.6 RewardingKit：軽量検証ツール（採点ツールキット）

公式は**ゼロ依存**の独立パッケージ `harbor-rewardkit` を用意しており、「採点」専用の UI を設計している：

```bash
uv tool install harbor-rewardkit
```

- **プログラム式**：`rk.file_exists("output.txt")`、`rk.command_succeeds("python main.py")` など 20 以上の内蔵採点基準；
- **判定式（LLM-judge）**：TOML ファイルを書いて Claude / GPT に採点させる（binary / Likert 5 段階）；
- **分離**：1 つの採点基準が別の基準に干渉するのが心配？`isolated=True`（overlayfs の読み取り専用マウント）を使う；
- **多次元報酬**：`correctness`、`structure`、`quality` をそれぞれ採点し、最後に合計スコアを集約する。

---

## 五、設計哲学（作者はなぜこう作ったのか）

公式ドキュメントを通読すると、6 つの明確な「設計信条」を抽出できる：

**1. モジュール化されたインターフェース、単一の責務。**
Environment / Agent / Task は 3 つの独立したインターフェースで、互いに相手の実装が複雑であることを前提としない。コンテナ環境でもクラウドでも、`BaseEnvironment` を実装すれば「新しい部屋」として差し込める。

**2. 「デフォルトで主流を同梱」、ゼロから車輪を再発明しない。** 「この世界の 99% のタスクは既存の Agent で実行されたことがある」として、Harbor は Claude Code、Copilot CLI、Codex CLI、Gemini CLI、Grok Build、OpenHands などの主流 CLI Agent をすべてパッケージに同梱し、ユーザーは箱から出してすぐ使える。

**3. 水平拡張はハードウェアの増強に勝る。** 公式は繰り返し強調している：評価は時間がかかるもので、唯一の加速方法は **クラウドサンドボックス（Daytona / Modal / E2B / Runloop / EC2 / Beam……）** を水平に展開することだ。API モデルを実行するときのボトルネックは CPU ではなく I/O だから。

**4. 評価データ = 訓練資産（「試験問題は後で教えるための教科書」）。** Harbor は SkyRL、GEPA などの強化学習フレームワークと接続し、評価の得点軌跡（trajectories）を直接 SFT 微調整データに変換する。試験は AI にハンコを押すためではなく、AI がより良く学ぶためのものだ。

**5. セキュリティと不正防止をデフォルトに組み込む。** 採点時には「受験者環境」と「監督環境」を分離（verifier separate）し、採点コードは Agent がいるコンテナを見ることができず、Agent が答えを覗き見るのを防ぐ。キーも `${VAR}` で注入し、タスクのソースコードには絶対に入らない。

**6. 最もシンプルな構造で最も厳密な評価を支える。** 公式ドキュメントは「良いタスク = シンプルな構造（instruction.md / task.toml / コンテナ / solution / tests）+ 明確な採点ファイル」を繰り返し強調している：絶対パスを使い、タスクにバージョン番号を付け、多段階の段階的採点をサポートすることを推奨している。複雑な評価は派手なフォーマットに依存すべきではなく、明確な規約に依存すべきだ — これが「最小実装 + 最大の検証可能性」のエンジニアリング美学だ。

---

## 六、まとめ：私たちの核心的見解

ドキュメントと実践を総合し、6 つの結論的な見解を示す：

### 見解 1：AI 評価は「インフラ」になりつつあり、「研究ツール」ではなくなった

Harbor の誕生は 1 つのトレンドを示している：Terminal-Bench が訓練データ、プロンプト最適化、CI/CD、RL のソースとして使われるようになったとき、**評価は AI Agent 開発サイクル（training → eval → improve）全体の中枢になった**。使いやすい評価フレームワークを握った者が、次の Agent 能力向上の加速器を握る。

### 見解 2：コンテナ化は Agent 評価の「セーフティネット」であり、「オプション」ではない

Agent が実際に環境を変更する（パッケージのインストール、ファイルの書き込み、サービスの起動）には、コンテナ内で実行して初めて：リスクの分離、環境の再現性、各試行への独立した小さな部屋の提供が可能になる。Harbor は「各タスクに 1 つのコンテナ」をデフォルトにしている。これは**Agent 能力の真の測定**の前提だ。

### 見解 3：クラウドサンドボックス + 並列化が唯一の現実的な加速ルート

1 つの Agent の評価が「受け入れられないほど遅い」のは常態であり、`-n 32` のような水平拡張（I/O bound）が公式に認められた加速方法だ。「マシンが足りない」は言い訳にならない。予算志向の答えはクラウドで実行することだ。

### 見解 4：評価の採点は「多元的」であり、採点するのも AI であり得る

`reward.txt` のバイナリ成績から `reward.json` の多次元スコア、さらに LLM-as-a-Judge や RewardKit の柔軟な TOML 採点まで — **Harbor は「採点」を yes/no の 1 問から、組み合わせ可能な能力へとアップグレードした**：コード品質、ユーモア、実用性をすべて定量化できる。

### 見解 5：「Agent を持ち込む」と「タスクを持ち込む」は 2 つのレベルの開放

3 層の開放：既存の Agent で既存の評価セットを実行（ゼロコード）；インターフェースで自分の Agent を接続（少しのコード）；ゼロから自分のタスク + 環境を定義（完全なコントロール）。**開放の最高の価値は、誰もが評価の教育者になれることだ。**

### 見解 6：ターミナル（Terminal）は「AI が仕事をできるか」を測る最初の試験場

Terminal-Bench 2.0 が試すのは「会話ができるか」ではなく、「実際のターミナルでの行動」だ：パッケージのインストール、デバッグ、コード修正、ドキュメント検索。Harbor の意義は、「AI が実際に仕事をこなせるか」という本来曖昧なことを、測定可能で、比較可能で、継承可能な物差しに変えたことにある — これがこのフレームワークが存在する最大の価値だ。

---

## 七、読者への一言

> **AI にチャットさせるだけでなく、AI に点数を付けることを学ぼう。** Harbor の設計哲学全体は 1 つの言葉に集約される：**評価を開発のようにする — モジュール化、再現可能、拡張可能。** モデルを選ぶとき、プロンプトを最適化するとき、自分の Agent を訓練するときは、まず「小さな試験場」を作り、感覚ではなくデータに語らせよう。

---

## 参考資料

- Harbor 公式ドキュメント Getting Started：https://www.harborframework.com/docs/getting-started
- Core Concepts：https://www.harborframework.com/docs/core-concepts
- Motivation：https://www.harborframework.com/docs
- Running Terminal-Bench 公式チュートリアル：https://www.harborframework.com/docs/tutorials/running-terminal-bench
- LLM-as-a-Judge チュートリアル：https://www.harborframework.com/docs/tutorials/llm-as-a-judge
- MCP Server Task チュートリアル：https://www.harborframework.com/docs/tutorials/mcp-server-task
- RewardKit ドキュメント：https://www.harborframework.com/docs/rewardkit
- Migrating from Terminal-Bench：https://www.harborframework.com/docs/migration
- Terminal-Bench 公式サイト：https://tbench.ai
- Repository：https://github.com/laude-institute/harbor