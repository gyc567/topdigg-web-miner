---
title: "AREX 徹底解説：BAAIが公開した再帰的自己改善型ディープリサーチエージェント"
description: "BAAI（北京智源人工知能研究院）が公開したAREXを包括的に分析 —— 再帰的自己改善型ディープリサーチエージェント。arXiv 2607.21461の核となる考え方「発見と検証の非対称性」から二重ループフレームワーク、AREX-Turbo / AREX-Baseモデルから完全な使用チュートリアルまで、このApache 2.0オープンリサーチモデルの設計哲学を解説。"
date: "2026-08-03"
author: "TopDigg Research Team"
tags: ["AREX", "BAAI", "智源", "ディープリサーチ", "エージェント", "再帰的自己改善", "arXiv", "オープンソースモデル", "Deep Research", "MoE", "Qwen3.5"]
categories: ["徹底解説"]
keywords: ["AREX", "BAAI", "智源人工知能研究院", "ディープリサーチエージェント", "再帰的自己改善", "Deep Research", "arXiv 2607.21461", "オープンソース", "Apache 2.0", "Qwen3.5", "AREX-Turbo", "AREX-Base", "発見と検証の非対称性"]
---

# AREX 徹底解説：BAAIが公開した再帰的自己改善型ディープリサーチエージェント

> 核となる考え方：**答えを「発見する」のは高く、「検証する」のは安い。** ディープリサーチでは複数の制約を同時に満たす答えが必要ですが、「発見」の探索空間は巨大です。一方、候補となる答えの「検証」は、制約ごとの単純なチェックに分解できることが多い。AREXはこの非対称性を捉え、エージェントは単に長く検索するのではなく**再帰的に自己改善**します —— 部分的に検証された状態を使って、その後の反復を導くのです。

---

## 1. プロジェクト概要

### 1.1 これは何か？

**AREX（Recursively Self-Improving Agent for Deep Research）** は、北京智源人工知能研究院（BAAI）が2026年7月に公開した**再帰的自己改善型ディープリサーチエージェント**です。単なる大規模モデルではなく、「リサーチエージェントの方法論＋学習済みモデル」の完全なセットです。

- **論文**：arXiv:2607.21461（cs.AI、2026年7月23〜24日投稿）
- **タイトル**：*AREX: Towards a Recursively Self-Improving Agent for Deep Research*
- **著者**：Shuqi Lu、Chaofan Li、Kun Luoほか24名（BAAI）
- **ホームページ**：https://vectorspacelab.github.io/arex-model/
- **ライブデモ**：https://arex-research.com/
- **モデルコレクション**：https://huggingface.co/collections/BAAI/arex

### 1.2 オープンソースモデル

- **AREX-Turbo**：4B稠密、Qwen3.5-4Bベース、Apache 2.0、**256Kコンテキスト**
- **AREX-Base**：総パラメータ122B / アクティブ10B（MoE）、Qwen3.5-122B-A10Bベース、Apache 2.0、**256Kコンテキスト**

> 両モデルとも **Apache 2.0** ライセンスで、研究・商用とも無料で利用可能。これはBAAIがBGE、BGE-M3などに続く重要なオープンソース貢献です。

---

## 2. 核となる考え方：発見と検証の非対称性（Discovery-Verification Asymmetry）

### 2.1 問題：なぜディープリサーチはこんなに高いのか？

ディープリサーチでは、エージェントが**複数の制約を同時に満たす**答えを見つける必要があります。難しさはここにあります：

- **発見（Discovering）**：すべての制約を満たす答えを探す —— 探索空間が巨大で、コストが高い
- **検証（Verifying）**：候補の答えを確認する —— **制約ごとの単純なチェック**に分解できることが多く、はるかに安い

> たとえ話：北京で「地下鉄に近い・家賃5,000元未満・南向き・エレベーター付き」の物件を探すのは難しい。しかし具体的な物件が与えられれば、4つの制約をそれぞれ検証するのは速い。**発見は難しく、検証は易しい —— これが非対称性です。**

### 2.2 AREXの答え：長く検索するのではなく、再帰的に改善する

AREXの重要な洞察：**部分的に検証された中間状態**を使って反復を導くことで、盲目的に探索を拡大しない。

- 各反復で中間結果を検証
- 検証済みの発見を保持
- 未解決の制約だけを再リサーチ
- これが**再帰的自己改善ループ**になる

---

## 3. 技術アーキテクチャ：二重ループフレームワーク

### 3.1 内部リサーチループ（Inner Research Loop）

- 証拠を収集し、候補を評価し、暫定回答を構築
- 蓄積された軌跡を通じてリサーチ状態を維持
- **裏付け証拠**と**信頼度スコア（0-100）** 付きの回答を出力

### 3.2 外部自己改善ループ（Outer Self-Improvement Loop）

暫定回答を制約ごとに監査し、決定ルールを適用：

- **受け入れ（Accept）**：信頼度 ≥ 閾値
- **洗練（Refine）**：信頼度 < 閾値 かつ 軌跡が回復可能 —— 有用な発見を保持し、未解決の制約に集中
- **再起動（Restart）**：信頼度 < 閾値 かつ 軌跡がノイズだらけ・誤解を招く

### 3.3 自律的コンテキスト更新ツール（update_context）

AREXは `update_context` を自律的に呼び出し、成長し続ける対話履歴をコンパクトな**改善状態（improvement state）**に圧縮します：

- 検証済みの発見とソース識別子を保持
- 制約充足状態を記録
- 未解決の情報ギャップを強調
- 次のリサーチ計画を明示

> これは汎用の要約ではありません！**エージェント自身が**現在の研究目的に合わせて更新を組織化し、圧縮された状態が進化する信念と整合し続けるようにします。

### 3.4 利用可能なツール

- **search**：バッチ型ウェブ検索（クエリごとに上位10件）
- **visit**：ウェブページにアクセスし内容の要約を返す
- **google_scholar**：学術論文検索
- **update_context**：メモリ/リサーチ状態を圧縮
- **finish**：証拠付きの最終回答を返す

---

## 4. トレーニングパイプライン：多段階トレーニング

### 4.1 エージェント型中間トレーニング（Agentic Mid-Training）

段階的な能力構築：

- **ブラウジング集約型リサーチタスク**：基礎的なツール使用、証拠獲得
- **専門家推論タスク**：長文思考、多段階演繹
- **混合能力の統合**：キーステップ焦点リプレイ付き

### 4.2 ステップ認識強化学習（Step-Aware RL）

- 階層的正規化によるステップレベルのポリシー最適化
- **キーステップ報酬シェイピング**：重要な決定ポイントへの補助報酬
- **最終回答の正しさ**が引き続き主要な最適化目標

### 4.3 キーステップ焦点監視（Key-Step Focused Supervision）

重要なステップを特定：

- **重要な証拠**を獲得するステップ
- **誤った仮説を棄却する**ステップ
- コンテキスト更新が**検証済みの証拠を保持する**ステップ

> これは長期的な**クレジットアサインメント（信用配分）**の問題を解決します：数十〜数百ステップの軌跡の中で、どのステップが最終回答の品質を本当に決定するのか？

---

## 5. 詳細チュートリアル：AREXの使い方

### 5.1 方法1：vLLMデプロイ

```bash
pip install vllm

vllm serve BAAI/AREX-Turbo \
  --served-model-name AREX-Turbo \
  --tensor-parallel-size 1 \
  --max-model-len 262144 \
  --reasoning-parser qwen3 \
  --language-model-only
```

### 5.2 方法2：SGLangデプロイ

```bash
pip install sglang

python3 -m sglang.launch_server \
    --model-path "BAAI/AREX-Turbo" \
    --host 0.0.0.0 \
    --port 30000
```

### 5.3 方法3：Transformersローカルロード

```python
from transformers import AutoProcessor, AutoModelForMultimodalLM

processor = AutoProcessor.from_pretrained("BAAI/AREX-Turbo")
model = AutoModelForMultimodalLM.from_pretrained(
    "BAAI/AREX-Turbo",
    device_map="auto"
)

messages = [
    {
        "role": "user",
        "content": [
            {"type": "image", "url": "https://example.com/image.jpg"},
            {"type": "text", "text": "Describe this image"}
        ]
    },
]

inputs = processor.apply_chat_template(
    messages,
    add_generation_prompt=True,
    tokenize=True,
    return_dict=True,
    return_tensors="pt",
).to(model.device)

outputs = model.generate(**inputs, max_new_tokens=40)
print(processor.decode(outputs[0][inputs["input_ids"].shape[-1]:]))
```

### 5.4 エージェントループ：XMLツール呼び出し

```python
from openai import OpenAI

client = OpenAI(
    base_url="http://127.0.0.1:8000/v1",
    api_key="EMPTY",
    timeout=600.0,
)

question = "あなたのリサーチクエスチョン"
messages = [
    {"role": "system", "content": SYSTEM_PROMPT},  # ツール説明を含む
    {"role": "user", "content": f"Question: {question}"}
]

# ループ：生成 → ツール実行 → 結果を追記 → 繰り返し
while True:
    response = client.chat.completions.create(
        model="AREX-Turbo",
        messages=messages,
        max_tokens=8192,
        temperature=1.0,
        top_p=0.95,
        presence_penalty=1.5,
        extra_body={"top_k": 20},
    )

    assistant_output = response.choices[0].message.content
    messages.append({"role": "assistant", "content": assistant_output})

    # finishが呼ばれたら回答を取り出して終了
    if "<function=finish>" in assistant_output:
        break

    # ツールを実行して結果を追記
    tool_result = execute_tool(assistant_output)
    messages.append({"role": "tool", "content": f"<tool_response>{tool_result}</tool_response>"})
```

### 5.5 ツールセット（prompts.pyより）

- `search(query: list[str])` — バッチ型ウェブ検索
- `visit(url: str|list[str], goal: str)` — ウェブページ訪問
- `google_scholar(query: list[str])` — 学術検索
- `update_context(context: str)` — リサーチ状態の圧縮
- `finish(answer: str, evidences: list[{evidence, url}])` — 最終回答の提出

---

## 6. ベンチマーク結果

### 6.1 AREXシリーズのスコア

- **BrowseComp**：AREX-Base **82.5** / AREX-Turbo 70.7
- **GAIA**：AREX-Base **85.4** / AREX-Turbo 81.6
- **xbench-2510**：AREX-Base **71.0** / AREX-Turbo 57.0
- **DeepSearchQA**：AREX-Base **89.9** / AREX-Turbo 78.5
- **WideSearch-en**：AREX-Base **82.0** / AREX-Turbo 68.5
- **HLE（ツール使用）**：AREX-Base **52.4** / AREX-Turbo 40.6

### 6.2 同規模・より大規模・クローズドモデルとの比較（一部）

- **Qwen3.5-122B**：BrowseComp 63.8 / GAIA 81.6 / WideSearch-en 60.5
- **Qwen3.5-397B**：BrowseComp 78.6 / GAIA 83.5 / WideSearch-en 74.0
- **Kimi-K2.6（1T）**：BrowseComp 83.2 / GAIA 80.6 / WideSearch-en 80.8
- **DeepSeek-Pro（1.6T）**：BrowseComp 83.4 / WideSearch-en 78.0
- **GPT-5.4**：BrowseComp 82.7 / WideSearch-en 88.5
- **Gemini-3.1-Pro**：BrowseComp 85.9 / GAIA 80.6 / WideSearch-en 66.4

> 主要な結論：**AREX-Base（122B MoE、アクティブわずか10B）** は同規模のベースラインを大幅に上回り、はるかに多くのアクティブパラメータを使うモデルと複数のベンチマークで互角 —— 「再帰的自己改善の利益 > 単純なパラメータ拡大」を検証しています。

---

## 7. 設計哲学

### 7.1 5つのコア設計原則

1. **検証は能動的な制御信号**：検証は最終フィルターではなく、リサーチラウンド間の遷移（Accept/Refine/Restart）を定義する
2. **反復をまたいで進捗を保持**：検証済みの発見は生き残り、未解決の制約だけが再リサーチされる
3. **自律的なコンテキスト管理**：エージェント自身がいつ圧縮するかを決め、自分の研究目的に合わせて組織化 —— 外部の汎用要約ではない
4. **キーステップのクレジットアサインメント**：重要な研究決定（証拠発見、誤った仮説の棄却）に焦点を当てたトレーニング信号
5. **規模より効率**：再帰的自己改善は、単純なパラメータ拡大より良い利益をもたらす

### 7.2 関連研究との位置づけ

- **vs MiroThinker**：コンテキストとモデル規模を拡大する。AREXは再帰的改善に集中
- **vs WebResearcher**：反復パラダイム。AREXは検証駆動の遷移を追加
- **vs DeepSeek/クエリ集約**：AREXの制約ごとの検証は根本的に異なる

### 7.3 なぜユニークか

1. 設計原則としての発見-検証非対称性
2. 再帰的二重ループフレームワーク（内＋外）
3. 学習された自律的コンテキスト更新ツール
4. クレジットアサインメントのためのキーステップ集中トレーニング
5. 信頼度スコア付きの証拠基盤型回答構造

---

## 8. 制限とオープンクエスチョン

1. **HLE（Humanity's Last Exam）には改善余地**：AREX-Base 52.4% —— フロンティアにはまだ及ばない
2. **長期的なクレジットアサインメントは依然困難**：数十〜数百ステップの軌跡での正確な帰属は未解決
3. **回復可能性の評価が時々誤判定**：Refine/Restartの決定境界は完璧ではない

---

## 9. まとめ：視点と結論

### 9.1 核となる視点

- **発見-検証非対称性は再利用可能な設計原則**：「探索は大きいが検証は安い」あらゆる問題（研究、デバッグ、意思決定）に「まず検証、それから拡張」という再帰戦略を適用できる
- **検証駆動の反復は検索駆動の反復より効率的**：盲目的な検索拡大ではなく、検証と洗練にリソースを使う
- **コンテキスト管理はエージェントの能力であるべき**：外部ツールではなく。AREXは自律的なコンテキスト圧縮を学んだモデルが長タスクで一貫した信念状態を維持できることを証明
- **キーステップ監視は長期的RLの鍵**：クレジットアサインメントの解決こそ、数十〜数百ステップのリサーチ軌跡を実際に訓練可能にする
- **オープンソース＋Apache 2.0はBAAIのエコシステムへのコミットメント**：122B（アクティブ10B）でフロンティアに迫る結果を出し、高品質なディープリサーチエージェントを大手独占のものではなくした

### 9.2 開発者への示唆

- 両モデルともApache 2.0 —— **そのまま商用利用可能**
- AREX-Turbo（4B）はコンシューマー向けハードウェアでデプロイ可能、軽量なリサーチタスクに最適
- AREX-Base（122B MoE、アクティブ10B）はvLLM/SGLangでサービス可能、数百億単位のVRAMは不要
- 256Kコンテキスト＋XMLツール呼び出しパラダイムは主要な推論フレームワークと互換

### 9.3 結論

> AREXの示唆：**ディープリサーチのボトルネックは「長く考える」ことではなく、「正しく改善する」こと。** モデルが自分の発見を検証し、進捗を保持し、未解決の制約に集中することを学べば、122BのMoEモデルでも複数のベンチマークで1T規模のクローズドモデルに迫れる —— 再帰的自己改善は、パラメータの量産よりエレガントな進化の道です。

**一言まとめ：AREX = 検証駆動の再帰的自己改善で、ディープリサーチエージェントがより少ない計算でより強いモデルに迫る。**

---

## 参考資料

- 論文：https://arxiv.org/abs/2607.21461
- HuggingFace論文ページ：https://huggingface.co/papers/2607.21461
- モデルコレクション：https://huggingface.co/collections/BAAI/arex
- ホームページ：https://vectorspacelab.github.io/arex-model/
- ライブデモ：https://arex-research.com/
- 引用形式：

```bibtex
@misc{baai2026arex,
  title={AREX: Towards a Recursively Self-Improving Agent for Deep Research},
  author={Shuqi Lu and Chaofan Li and Kun Luo et al.},
  year={2026},
  eprint={2607.21461},
  archivePrefix={arXiv},
  primaryClass={cs.AI},
  url={https://arxiv.org/abs/2607.21461},
}
```