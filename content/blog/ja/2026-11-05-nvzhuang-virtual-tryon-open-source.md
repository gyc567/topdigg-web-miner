---
title: "誰か1407枚のAI衣装画像をサイトにし、バーチャル試着までつなげた：写真撮りの兄貴の女性衣装プロジェクト完全分解"
date: "2026-11-05"
description: "paipiange/nvzhuangを深掘り：ビルド不要の純静的衣装画像ライブラリ + GoFrame製AI着替えバックエンド。完全なデプロイ手順、マルチモデル連携設定、APIセキュリティ設計の解析、6つのデザイン哲学を収録。"
author: "瑞哥观势"
tags:
  - オープンソースプロジェクト分析
  - AI着替え
  - バーチャル試着
  - GoFrame
  - ComfyUI
  - マルチモデル対応
  - セキュリティ設計
categories:
  - オープンソースプロジェクト分析
keywords:
  - paipiange nvzhuang
  - AIバーチャル試着
  - AI着替えバックエンド
  - GoFrame オープンソースプロジェクト
  - ComfyUI ローカル着替え
  - マルチモデルアダプタ
  - API セキュリティ防御
  - ビルド不要フロントエンド
---

# 誰か1407枚のAI衣装画像をサイトにし、バーチャル試着までつなげた

結論から。

`paipiange/nvzhuang` は2026年10月末に建立起られたばかりのリポジトリで、11月4日にはすでに **2193 Star / 555 Fork** を獲得しているプロジェクトだ。技術スタックは直感に反するほど単純で、フロントエンドは3278行の `index.html` 単ファイル、バックエンドは GoFrame v2、AI着替えはプロンプトエンジニアリングとマルチモデルアダプタで実現している。

しかし、難しいことをいくつかも正しくやり遂げている。そしてそれはコード量よりずっと重要なことだ。

**第一に、「ゼロコストで使える」と「高品質な能力」を、二つのレイヤーとして分けた。** ライブラリ部分は完全無料、デプロイ不要、Key不要で、ページを開けばそのまま使える。AI着替え部分は自前のバックエンドと自前のKeyが必要だ。ほとんどの同種プロジェクトは、中核機能を有料壁の向こう側に隠すか、そもそもログイン必須のSaaSにしてしまうところが多い。このプロジェクトはしていない。

**第二に、6日で本番レベルのAPIセキュリティ防御を一式揃えてしまった。** Bearer Token認証（SHA-256ダイジェスト + 一定時間比較）、厳格なCORSホワイトリスト、トークンバケットのレート制限、日次クォータ、並行ロック、リクエストボディ上限、ピクセル爆弾対策、SSRF対策。これらは「ついでに追加した」ものではなく、プロダクト仕様書のように書かれたセキュリティ要件ドキュメントが起点になっている。

**第三に、プロンプトエンジニアリングでモデルのモデレーションという現実的な制約を回避した。** コードには率直なコメントが残っている。GPT-Image系は実人物の着替えシーンで公式の安全モデレーションにブロックされるため、デフォルトモデルはGeminiであり、GPT-Image向けに「BAN回避用」のプロンプトテンプレートが専用に用意されている。これはハックではなく、工学的妥協だ——ただし正直な妥協である。

。接下来では、このプロジェクトを分解していく。何なのか、どう動かすのか、セキュリティはどうなっているのか、そしてその背後にあるデザイン哲学。

---

## 一、プロジェクト概要：そもそも何なのか

### 1.1 一言で位置づけると

> **衣装集 COSTUME-DB-01**：1407セットのフォトリアルな実写版 + 1320セットの二次元アニメ版のAI生成衣装のみ画像（2:3比率、人物は写らない）、中国語・英語バイリンガル検索と多次元フィルタリングに対応、任意のAIワンクリックバーチャル試着付き。

### 1.2 3つのライブラリ

| ライブラリ | 数量 | 内容 | データファイル |
|---|---|---|---|
| フォトリアル衣装 | 1407セット | 実写写真风格的衣装のみ展示 | `data.js` |
| 二次元アニメ衣装 | 1320セット | アニメ画風の服飾 | `data-anime.js` |
| AIモデル顔・スタイルライブラリ | 1499人 | 顔のクローズアップ（Face）とスタイル（Styling） | `data-portrait.js` |

合計4200組を超えるリファレンス素材。モデルライブラリはCC0 1.0ライセンスの `ai-portrait-gallery` プロジェクト由来で、ショート/ミディアム/ミディアムロング/ロングの髪の長さや、50種の具体的な髪型（ボブ、ゆるミクロカール、ワンカットなど）による精密なフィルタリングに対応し、中国語・日本語・英語の3言語検索 가능하다。

### 1.3 8つのカテゴリ（元は日本語名を保持）

データファイル内のカテゴリフィールドは日本語になっている。これは**元のデータソースとの互換性のために意図的に残されている**もので、フロントエンドが自動で中国語または英語にローカライズする：

| カテゴリ（元日本語名） | 英語 | 数量 |
|---|---|---:|
| 春 | Spring | 215 |
| 夏 | Summer | 254 |
| 秋 | Autumn | 244 |
| 冬 | Winter | 253 |
| ランジェリー | Lingerie | 199 |
| パーティ | Party | 48 |
| 水着 | Swimwear | 54 |
| セクシー | Sexy style | 140 |
| **合計** | | **1407** |

プロジェクトには「ライブラリコンテンツコンプライアンスおよびコミュニティ公開審査報告書」が付属しており、最初の5カテゴリ計1014件を低リスクと判定し宣伝素材として推奨、後ろ3カテゴリ計393件を中〜高リスクと判定し、完全なデータセットの一部として受動的に検索されるのみとし、トップページへの特权配置は設けないと規定している。

**この細部は単独で言及する価値がある**：自分のコンテンツに自らグレードをつけ、宣伝素材に赤字を引く、どの内容をカバー画像に使ってはいけないかを規定する——これはコミュニティ意識のある書き手にしかやらないことだ。ほとんどの同種プロジェクトは「画像をもう少し多く置こう」しか考えていない。

### 1.4 データ構造：フィールド名は日本語、値は英語

```javascript
const META={"total":1407,"cats":["春","夏","秋","冬","ランジェリー","パーティ","水着","セクシー"],
"counts":{"春":215,"夏":254,"秋":244,"冬":253,"ランジェリー":199,"パーティ":48,"水着":54,"セクシー":140}};

const D=[{
  "id":"SPR-0001",
  "カテゴリ":"春",
  "キーワード":"ivory frill knit denim mini skirt coat socks white sneakers",
  "サムネ":"thumbs/SPR-0001.webp",
  "画像":"img/SPR-0001.webp",
  "原寸":"png/SPR-0001.png"
}];
```

| フィールド | 説明 |
|---|---|
| `id` | ID（例 `SPR-0001`） |
| `カテゴリ` | カテゴリ（日本語カテゴリ名） |
| `キーワード` | キーワード（英語、スペース区切り） |
| `サムネ` | サムネイルパス（WebP） |
| `画像` | 表示画像パス（WebP） |
| `原寸` | フル解像度PNGパス |

フィールド名は日本語（`カテゴリ`、`キーワード`、`サムネ`、`画像`、`原寸`）で、これはデータソースの元のスキーマであり、互換性を壊さないためにそのまま残している。値は英語のキーワード（`ivory frill knit denim mini skirt coat socks white sneakers`）なので、日中英双方向の検索が成立する。中国語モードで「白」と入力してヒットするのは、フロントエンドがキーワードのローカライズマッピングを行っているためだ。

**よくある落とし穴**：フル解像度のPNG（約1GB+）はリポジトリに含まれておらず、`原寸` が指す `png/*.png` はGitHub Pages上で404になる。プロジェクトの対応策は、ダウンロード時に自動でホスト済みの高解像度WebP画像へ自然にフォールバックさせ、ボタンが空振りしないようにすることだ。

### 1.5 AI着替え：画像1 + 画像2 ➔ 画像3

試着フローの本質は、2枚の画像を画像モデルに与え、1枚に合成させることにある：

- **画像1**：選択された衣装リファレンス画像（組み込みライブラリ、またはユーザーアップロード）
- **画像2**：ユーザーがアップロードしたモデル写真
- **画像3**：AIが合成した着替え結果（モデルの顔立ち・髪型を維持し、衣装の素材とシルエットを融合）

フォトリアルな実写と二次元アニメの両方に対応している。姉妹プロジェクトの `ai-pose-gallery-zh`（288セット / 1439枚の多角度ポーズリファレンス）とも連携し、「ポーズリファレンス + 人物リファレンス → AI生成」という完全なワークフローを形成している。

---

## 二、核となる思想

3つの文しか覚えられないとしたら、以下の3つだ。

### 思想1：静的サイトは「ゼロ摩擦」を担当し、バックエンドは「高品質」を担当する

これがプロジェクト全体の最も核心的なアーキテクチャ判断だ。

ほとんどのAI着替えプロジェクトはフロントとバックをがっちりと結びつける。使いたい？ ならバックエンドを先にデプロイし、Keyを先に購入し、Base URLを先に記入しろ。個人ユーザーにとって、そのハードルは99%の人間を追い払った。

`nvzhuang` のやり方は**能力の階層化**だ：

```
┌─────────────────────────────────────────┐
│  第1層：純静的フロントエンド（デプロイ不要、Key不要）      │
│  · 4226件のライブラリ閲覧                        │
│  · 中英バイリンガル検索 / カテゴリフィルタ                 │
│  · 大画像フルスクリーン / キーボードページ送り / 原寸ダウンロード          │
│  · 手動搭配台（ブラウザ内でクロップ合成）         
│  · 画像検索（淘宝 / 拼多多）             │
│  · ローカル生成履歴（IndexedDB）              │
│  ↓ ユーザーが本当にAI着替えを求めたとき                    │
├─────────────────────────────────────────┤
│  第2層：任意のGoFrameバックエンド（自前構築、自前Key）  │
│  · 本物のAI着替え生成                     │
│  · 5種のモデルプロトコルのプラガブル化                     │
│  · ComfyUIローカルオフライン、コストゼロ                 │
└─────────────────────────────────────────┘
```

第1層は100%無料で準備も不要、`https://paipiange.github.io/nvzhuang/` を開けばそのまま使える。第2層が有料機能が必要な部分であり、しかも**きちんと価格表示されている**：プロジェクトはREADME、フロントエンドページ、監査報告書の3箇所すべてに「自前のバックエンドとAPI Keyが必要、モデル利用料が発生する可能性がある」と明示している。

**この階層化は、本質的に「獲得コスト」をゼロにし、「収益点」を本当に価値のある場所に残すためだ。**

### 思想2：モデルはプラグインであって、ハードコードではない

バックエンドは極めてミニマルなアダプタインターフェースを定義している：

```go
// ImageGenerator 图像生成模型适配器接口
type ImageGenerator interface {
    // Generate 生成换装图。入参为两张图的 base64（人像 + 服装），返回结果图 base64
    Generate(ctx context.Context, personB64, garmentB64, prompt, size string) (string, error)
    // Name 模型别名（对外暴露的名称）
    Name() string
}
```

そして各プロトコルごとにアダプタを1つ実装する：`gpt_image.go`（OpenAI Imagesプロトコル）、`doubao.go`（火山方舟プロトコル）、`gemini.go`（Google generateContentプロトコル）、`comfyui.go`（ローカルワークフロー）。

設定ファイルに1ブロック追加するだけで新品の国内モデルに接続でき、**コードを1行も変更する必要がない**：

```yaml
llm:
  models:
    qwen:                 # 通义万相示例
      provider: openai
      envKey: "DASHSCOPE_API_KEY"
      baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1"
      model: "wanx2.1-t2i-turbo"
```

### 思想3：セキュリティはプロダクト機能であり、リリース前のパッチではない

これが本プロジェクトと，绝大多数のオープンソースプロジェクトとの最大の違いだ。

562行の独立文書『AI着替えインターフェース保護と画像検証機能要件』があり、その構成は完全にPRDの書き方になっている：ユーザーストーリー → 証拠表（Evidence）→ 結論表（Findings）→ 機能要件（FR-1からFR-16）→ エラーコード表 → 設定項目。

Evidence表はこうなっている：

| ID | コード位置 | 現在の観察 | 再確認コマンド |
|---|---|---|---|
| E-001 | `backend/internal/cmd/cmd.go` | 現在はレスポンスとデフォルトCORSミドルウェアのみ登録で、アクセス認証もレート制限もない | `rg -n "Middleware\|CORSDefault" backend/internal/cmd/cmd.go` |
| E-002 | `backend/api/tryon/v1/tryon.go` | `/tryon` は2枚のBase64画像を直接受け取ると生成を起動できる | `rg -n "PersonImage\|GarmentImage\|path:\"/tryon\"" backend/api/tryon/v1/tryon.go` |
| E-003 | `backend/internal/logic/tryon/gpt_image.go` | `decodeB64` はBase64のデコード結果しか検査していない | `rg -n "func decodeB64" backend/internal/logic/tryon/gpt_image.go` |

Findings部分は結論を直接書いている：

- **F-001**：公開デプロイでは誰でも生成APIを呼べる可能性 → モデルのクォータを消費したり、ローカルGPUを占有したりする恐れ
- **F-002**：正当なBase64は正当で安全な画像と等しいわけではない → メモリ・CPU・帯域の浪費やモデル呼び出しの失敗につながる

**この「まず証拠を集め、次に結論を出し、最後に手法を提示する」という書き方は、ほとんどの企業のセキュリティPRDより厳格だ。** しかも本当に実行されている——`internal/security/` と `internal/middleware/` の実装をすべて通読したが、要件ドキュメントのFR-1からFR-16にはすべて対応するコードが存在する。

---

## 三、デザイン哲学：移植できる6つの原則

ここが私がこのプロジェクトで最も価値ある成果だと思う。技術は陳腐化するが、以下の判断は陳腐化しない。

### 哲学1：Fail-Safe Defaults（失敗したら安全な状態へ）

これは `AGENTS.md` のアーキテクチャ規約に書き込まれ、コードでも厳格に実行されている：

> バックエンドサービスは起動時に、ホストマシンに `config.yaml` が明示的に作成されていないことを検出した場合、コード層で自動的に `config.example.yaml` にフォールバックして読み込む機能を備えているなければならない。

```go
// InitConfigFallback 检查并保障配置文件就绪：
// 若当前没有可用的 config.yaml，自动尝试回退加载 config.example.yaml。
func InitConfigFallback(ctx context.Context) {
    if !g.Cfg().Available(ctx) {
        candidates := []string{
            "manifest/config/config.example.yaml",
            "config/config.example.yaml",
            "config.example.yaml",
        }
        for _, path := range candidates {
            if gfile.Exists(path) {
                ...
            }
        }
    }
}
```

同様にポートのフォールバックもある：

```go
// EnsureServerPort 确保 Server 具备显式监听端口，避免未配置时随机分配高位端口 (:0)
func EnsureServerPort(ctx context.Context, s *ghttp.Server) {
    addr, err := g.Cfg().Get(ctx, "server.address")
    if err != nil || addr.IsEmpty() {
        s.SetPort(8000)
        g.Log().Info("未指定 server.address 配置，已显式绑定默认端口 :8000")
    }
}
```

**なぜこれが重要なのか。** Goの `net/http` は `ListenAndServe(":0")` のときにランダムな上位ポートを割り当てる。AGENTS.md はこの落とし穴を名指しで禁止している：

> 未設定の address によってシステムの一時的な `:0` ランダム上位ポート（`:37093` など）に落ちることを絶対的に禁止する。

コンテナ環境でのデプロイにおいて、`server.address` の設定漏れひとつで、ヘルスチェック、リバースプロキシ、コンテナオーケストレーションがすべて機能しなくなる——しかもエラーは出ず、「サービスは起動したのに接続できない」という症状としてしか現れない。この種のバグは極めて原因究明しづらい。

### 哲学2：ゼロ漏洩原則（Zero Leakage）

`AGENTS.md` の冒頭には赤い線が引かれている：

> 実際のAPI Key（OpenAIの `sk-...`、火山方舟の `ARK...`、Google Geminiの `AIza...`、通義千問の `sk-...` など）、プライベートToken、パスワード、証明書の鍵をGitリポジトリまたはステージング領域にコミットすることを絶対的に禁止する。

その実現手段：

- `config.yaml` と `.env` はすべて `.gitignore` に追加され、リポジトリには `config.example.yaml` と `.env.example` だけが残る
- テンプレート内のKeyフィールドは空文字列か `sk-あなたのkey` のようなプレースホルダでなければならない
- フロントエンドの「個人モデル設定」はブラウザの `localStorage` にのみ存在し、バックエンドはメモリ上でのみ保持し、**データベースにも設定ファイルにも業務ログにも書き込まない**
- ログに記載できるのはMIME、幅高、バイト数、および最大16文字のSHA-256プレフィックスまでであり、画像の内容や完全なハッシュは記録しない

さらに容赦ないのがコミット前の自己チェックリストで、そのまま実行可能なコマンドとして書かれている：

```markdown
- [ ] **ステップ 1**：`git status` を実行し、一時ファイル、ログファイル、ビルド成果物、実ファイル設定がステージング領域に入っていないことを確認する。
- [ ] **ステップ 2**：`git diff --cached` を1行ずつレビューし、実際のKey、個人名・電話番号、デバッグ由来のハードコードされた資格情報がないことを確認する。
- [ ] **ステップ 3**：機密文字列のセキュリティスキャンを実行し、正規表現 `(sk-[a-zA-Z0-9]{20,}|AIza[a-zA-Z0-9]{20,})` を使う。
- [ ] **ステップ 4**：`go test ./...` と `go vet ./...` を実行し、コードがコンパイルされ、テストが全て通ることを確認する。
```

**このチェックリストはそのまま持ち帰って使える。** 「気をつけて」というスローガンを、4つの具体的なゲートに変えてしまうからだ。

### 哲学3：プライバシー境界は隠さずドキュメントに書く

プロジェクトはデータフローを複数箇所で明示している：

- ユーザーがアップロードした衣装の原画像は**現在のページのメモリ上にのみ保持**され、ローカルストレージにも生成履歴にも書き込まれず、リロードまたはページ閉鎖時に自動的に消去される
- 生成履歴は現在のブラウザのIndexedDBにのみ保存され、**アップロードされず、デバイス間を同期もしない**
- 生成時には**圧縮した**画像内容のみが、ユーザーが設定した着替えバックエンドに送信される

この透明性は決定的に重要だ。AI着替えは人物写真に関わるので、ユーザーが最も恐れているのは「私の写真はどこへ行ったのか」である。プロジェクトは含糊にせず、データフローを図示している。

### 哲学4：明示的な拒否は、暗黙の劣化よりよい

エラー応答は「生成失敗」という曖昧模糊なものではなく、業務コードまで厳密に特定される：

| HTTP | 業務コード | `error_code` | ユーザーへの表示 |
|---:|---:|---|---|
| 401 | 40101 | `AUTH_REQUIRED` | 設定センターでバックエンドアクセストークンを入力してください |
| 401 | 40102 | `AUTH_INVALID` | バックエンドアクセストークンが無効です |
| 403 | 40301 | `ORIGIN_NOT_ALLOWED` | 現在のページのオリジンからバックエンドへのアクセスが許可されていません |
| 429 | 42901 | `RATE_LIMITED` | リクエストが多すぎます。しばらくしてから再試行してください |
| 429 | 42902 | `DAILY_QUOTA_EXCEEDED` | 本日の生成枠を使い切りました |
| 429 | 42903 | `CONCURRENCY_LIMITED` | 実行中の生成タスクが多すぎます。しばらくしてから再試行してください |
| 413 | 41301 | `REQUEST_TOO_LARGE` | アップロード内容が大きすぎます。画像を圧縮してから再試行してください |
| 422 | 42201 | `INVALID_IMAGE_BASE64` | 画像データが壊れています。画像をもう一度選んでください |
| 422 | 42202 | `UNSUPPORTED_IMAGE_TYPE` | JPEG、PNG、WebPのみサポートされています |
| 422 | 42203 | `IMAGE_FILE_TOO_LARGE` | 画像ファイルが大きすぎます。圧縮してから再試行してください |
| 422 | 42204 | `IMAGE_DIMENSIONS_INVALID` | 画像の寸法が要件を満たしていません |
| 422 | 42205 | `IMAGE_PIXEL_LIMIT_EXCEEDED` | 画像のピクセル数が多すぎます。縮小してから再試行してください |

フロントエンドは `error_code` に基づいて中国語・英語のメッセージを表示し、**バックエンドの生のエラーメッセージを正規表現でマッチさせることに依存しない**。

さらに、すべてのエラー応答は `request_id` を含む必要があり、Token、モデルAPIキー、画像のBase64、プロバイダ由来の機微なエラー情報を含んではならない。

### 哲学5：モデル適配と業務ロジックを分離する

`tryon.go` のメインフローは短い。しかし一つ一つの判断には明確な理由がある：

```go
// 默认模型：Gemini（Nano Banana 2），因为 GPT Image 系列对真人换装场景
// 会被官方安全审核拦截（moderation_blocked / sexual），Gemini 无此限制。
if model == "" {
    model = "gemini"
}

var gen ImageGenerator
if clientConfig != nil {
    gen, err = NewGeneratorFromClientConfig(clientConfig)
} else {
    gen, err = NewGenerator(ctx, model)
}

// 构建提示词：
// 1. GPT-Image-2 专门使用防封控安全提示词；
// 2. Gemini 保留原英文稳定提示词；
// 3. 豆包等其他模型保留原提示词（按语言选择）。
var promptStr string
isGemini := (clientConfig != nil && strings.EqualFold(clientConfig.Provider, "gemini")) || gen.Name() == "gemini"
if isGPTImageModel(model, clientConfig, gen.Name()) {
    promptStr = BuildGPTSafety(lang)
} else if isGemini {
    promptStr = BuildGemini(lang)
} else {
    promptStr = BuildDefault(lang)
}
```

最後のエラー処理の扱いに注目：

```go
result, err := gen.Generate(ctx, personB64, garmentB64, promptStr, size)
if err != nil {
    // 不记录原始错误：网络错误可能包含用户自定义 Base URL，供应商响应也可能含敏感信息。
    return "", "", "", gerror.Wrap(err, "换装生成失败，请稍后重试")
}
```

**なぜ生のエラーを記録しないのか。** ユーザーの `client_config.base_url` がネットワークエラーメッセージに埋め込まれる可能性があり、プロバイダのレスポンスボディに機微な内容が含まれる可能性があるからだ。生のエラーを握り潰し、親切なメッセージ1つに統一することが、ここでは最も安全な選択だ。

### 哲学6：ドキュメントとコードは一致していなければならない

このプロジェクトには `nvzhuang.md` というタスクシートがあり、ドキュメントとコードのずれを直すために特化している。個々の不一致を名指しで挙げている：

> 1. READMEのルートディレクトリでの起動手順は `cp backend/.env.example backend/.env` を実行した後に**リポジトリのルートディレクトリ**で `docker compose up -d` を実行するとなっているが、Composeはデフォルトで作業ディレクトリの `.env` を優先して読む。この誘導は確認し修正すべきである。
> 2. フロントエンドのドロップダウン、デフォルトモデルは `gemini`；APIリクエスト構造の `Model` のデフォルト値は `gpt-image` と書かれており、一部の業務ロジックのコメント/空値フォールバックは `gemini` となっている。GoFrameのデフォルト値が実際に効く経路を必ず検証し、README/フロントエンド/バックエンドの説明を統一せよ。**「デフォルトはGPT Image 2」と単純に主張してはならない。**

2点目が特に面白い——「ドキュメントの中で3種類の記述が食い違っている」こういう極細の不一致まで拾い上げている。この背景にあるのは（あるいは作者のためにタスクシートを書いたAIの）ある執念だ：**ドキュメントのドリフトは技術債であり、もっとも無視されやすい種類のそれである。**

---

## 四、詳細チュートリアル：ゼロから動かす

### 4.1 環境要件

| 用途 | 要件 |
|---|---|
| フロントエンドの静的サイト | 現代のブラウザのみ、または Python 3 / Node |
| バックエンドのビルド・実行 | Go 1.18+ または Docker |
| クラウドAI着替え | 少なくとも1つのモデルAPIキー |
| ローカルAI着替え | ComfyUI + 独立系GPU（推奨）、Key不要 |

### 4.2 第一歩：フロントエンドを動かす（設定は一切不要）

フロントエンドは純静的サイトで、**ビルドは不要**。

```bash
# 方法1：Pythonの組み込みサーバー（推奨、ポート3000、バックエンドの8000と競合しない）
python3 -m http.server 3000

# 方法2：Nodeの簡易サーバー
npx serve -l 3000 .

# 方法3：現代のブラウザで index.html を直接開く
```

ブラウザで `http://localhost:3000` にアクセスする。

この時点で手元にあるもの：4226件のライブラリ、中英バイリンガル検索、カテゴリフィルタ、大画像フルスクリーン、キーボードページ送り、無限スクロール、原寸ダウンロード、手動組み合わせ台、画像検索、IndexedDBによるローカル生成履歴——**すべて無料、Key不要、バックエンド不要**。

> ⚠️ **ポートの衝突に注意**：静的サイトは3000、バックエンドは8000。プロジェクトの元タスクシートはまさにこの混同を指摘していた。

### 4.3 第二歩：バックエンドを起動する（Dockerがいちばん楽）

```bash
cd backend

# 1. 環境変数テンプレートをコピーして自分のKeyを入力
cp .env.example backend/.env
# .env を編集する、例：ARK_API_KEY=xxxx（国内なら豆包が推奨、VPN不要）

# 2. ワンタッチ起動（すぐに使えるフォールバック内蔵、デフォルトで8000ポートをリッスン）
docker compose up -d

# 3. ログを見る
docker compose logs -f
```

サービス起動後は `http://localhost:8000` でリッスンする。

**注意**：このコマンドは `backend/` ディレクトリ内で実行しなければならない（まず `cd backend` して `cp .env.example .env`）。リポジトリのルートで実行すると、Composeはルートの `.env` を見に行くため、backendの設定は読めなくなる——これはプロジェクトタスクシートが名指しした落とし穴だ。

Docker単一コンテナ方式：

```bash
cd backend
docker build -f manifest/docker/Dockerfile -t costume-tryon .

docker run -d --name costume-tryon -p 8000:8000 \
  -e ARK_API_KEY="あなたの豆包ArkKey" \
  -e OPENAI_API_KEY="sk-あなたのOpenAIKey" \
  costume-tryon
```

Windowsユーザーには手抜き特典がある。`backend/restart.bat` をダブルクリックするだけで、ビルドと起動が自動実行される。

Dockerがない環境（ソースから実行）：

```bash
cd backend
# 任意：設定ファイルをコピー（コピーしない場合も、システムは安全にテンプレートへフォールバックして8000でリッスンする）
# cp manifest/config/config.example.yaml manifest/config/config.yaml
export ARK_API_KEY="あなたのKey"      # Windows PowerShell では $env:ARK_API_KEY="あなたのKey"
go run main.go
```

### 4.4 第三歩：フロントエンドをバックエンドに向ける

フロントエンドの `index.html` は次の優先順位で着替えバックエンドのアドレスを判定する（**高い順**）：

1. **設定センター**：ユーザーが現在のブラウザに保存した「バックエンドAPIアドレス」（クロスオリジンの外部公開バックエンドは **HTTPS** 必須）
2. **グローバル変数**：HTMLの読み込み前に `window.AI_API_URL = "http://localhost:8000"` を設定
3. **URLパラメータ**：`https://あなたのフロントエンド/?tryon=http://localhost:8000`
4. **ローカルフォールバック**：フロントエンドに `localhost` または `127.0.0.1` でアクセスした場合、既定で `http://127.0.0.1:8000` に自動接続

3番目については、**必ず知っておくべきセキュリティ上の制約**がある：

> フィッシングによるAPIキーの窃取やプライベート写真の漏洩を防ぐため、`?tryon=` は同一オリジンまたはローカルループバックの `localhost`/`127.0.0.1` のみ許可される。外部バックエンドは設定センターで明示的に保存しなければならない。

つまり、**公開ウェブページ上で `?tryon=` を使って見知らぬバックエンドを指すことはできない**。これはSSRF対策とフィッシング対策の設計だ。

フロントエンドにはいくつかの便利なURLパラメータもある：

```
?lang=en           # 初期言語（zh / en、デフォルトは zh）
?q=lace            # 初期検索語
?lang=en&q=white   # 組み合わせ使用
```

### 4.5 第四歩：マルチモデルの組み込み

バックエンドは設定ファイルの `llm.models` でモデルを管理しており、**Key・Base URL・モデル名の3つすべてが設定可能**：

```yaml
llm:
  models:
    gpt-image:              # フロントエンドのリクエストで使うエイリアス
      provider: openai      # プロトコル：openai / doubao / gemini
      apiKey: ""            # Keyを直接記入するか、空にして環境変数を使う
      envKey: "OPENAI_API_KEY"   # 環境変数名（apiKey より優先）
      baseURL: "https://api.openai.com/v1"
      model: "gpt-image-2"

    doubao:                 # 豆包（火山方舟）、国内で利用可能
      provider: doubao
      envKey: "ARK_API_KEY"
      baseURL: "https://ark.cn-beijing.volces.com/api/v3"
      model: "doubao-seedream-3-0-t2i-250415"

    gemini:                 # Google Nano Banana 2
      provider: gemini
      envKey: "GEMINI_API_KEY"
      baseURL: "https://generativelanguage.googleapis.com/v1beta"
      model: "gemini-3.1-flash-image"
```

**4つのプロトコルの違い**（組み込み時に最も間違えやすい部分）：

| provider | プロトコル | 説明 |
|---|---|---|
| `openai` | `POST {baseURL}/images/generations` + `input` 配列 | OpenAI公式のGPT-Image、通義万相、智譜CogView、シリコンフロー、ほとんどの中継駅 |
| `doubao` | 同上の `/images/generations` だが、リクエストボディは火山形式（`prompt` + `image[]`）で、レスポンスは `url` を返す | 豆包 Seedream |
| `gemini` | Google ネイティブの `generateContent` | Gemini画像モデル |
| `comfyui` | ローカルComfyUI API + サーバー側固定ワークフロー | ローカルオフライン、`client_config` は受け付けない |

**国内モデルをつなぐのは `llm.models` の下に1ブロック追加するだけでよく**、フロントエンドのドロップダウンは `index.html` の `<select id="aiModel">` にある `<option>` を増減させれば対応できる。

### 4.6 第五歩：ComfyUI ローカルオフラインモード（コストゼロ、Key不要）

これがこのプロジェクトで最も想像力あふれる部分だ：**あなたのGPUに請求させる。**

システムには**デュアルワークフローの適応機構**が内蔵されている：

| ワークフロー | モデル | 特徴 |
|---|---|---|
| **Qwen-Image-Edit-2511（優先デフォルト）** | `qwen_image_edit_2511_int8_convrot.safetensors` + 4ステップ Lightning LoRA | 4ステップの超高速生成、意味的着替えの忠実度がより高い |
| **MiniMax H3（互換のために保持）** | H3 Ref2VA 動画モデルから31フレーム目を抽出して固定 | フォールバック手段 |

呼び出し時にシステムが利用可否を自動検出し、まずQwenを、未準備ならH3へ滑らかにフォールバックする。`comfyui-qwen` または `comfyui-h3` で明示指定することもできる。

**モデルファイルの準備：**

```bash
# Qwen-Image-Edit
models/diffusion_models/qwen_image_edit_2511_int8_convrot.safetensors
models/text_encoders/qwen_2.5_vl_7b_fp8_scaled.safetensors
models/vae/qwen_image_vae.safetensors
models/loras/Qwen-Image-Edit-2511-Lightning-4steps-V1.0-bf16.safetensors

# MiniMax H3（別途必要）：H3、Qwen3-VL、ClipProj、LoRA、動画VAEおよび音声VAE
```

**ComfyUIの起動：**

```bash
# 既定のアドレス http://127.0.0.1:8188
```

**ウェブページでの有効化：**

1. 右上の「設定センター」を開く
2. 「自分のモデル設定を使う」を選択
3. プロトコルを「ComfyUI ローカル」に設定
4. 「接続テスト」をクリック——このエンドポイント（`GET /comfyui/health`）はComfyUI API、固定ワークフロー、ノードとモデルの利用可否のみを検査し、**画像をアップロードせず、生成も実行しない**
5. テスト成功後に保存

### 4.7 第六歩：本番環境へのデプロイ（重要）

#### 4.7.1 Nginx リバースプロキシ

```nginx
server {
    listen 443 ssl;
    server_name api.あなたのドメイン.com;

    ssl_certificate     /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        # 大きなbase64画像のリクエストボディなので、タイムアウトとサイズ上限を上げる
        client_max_body_size 30m;
        proxy_read_timeout 180s;
        proxy_send_timeout 180s;
    }
}
```

フロントエンドのデプロイ時は `index.html` の先頭に1行追加する：

```html
<script>window.AI_API_URL="https://api.あなたのドメイン";</script>
```

#### 4.7.2 セキュリティ設定チェックリスト

```yaml
security:
  authRequired: true                # ローカルデバッグでは false 可、本番デプロイでは必ず true
  apiKeysEnv: "TRYON_API_KEYS"      # 複数のTokenはカンマ区切り、各32〜512文字
  trustedOrigins:                   # CORS厳格ホワイトリスト（完全一致、`*` は禁止）
    - "https://paipiange.github.io"
    - "http://localhost:3000"
    - "http://127.0.0.1:3000"
  allowPrivateNetwork: false        # プライベートネットワークからのPNAプリフライトを許可するか
  rateLimit:
    requestsPerMinute: 10           # 呼び出し元1件あたりの毎分リクエスト上限
    burst: 3                        # 短時間のバースト容量を許可
    limiterIdleMinutes: 30          # レートリミッタのアイドル自動清掃周期（分）
    dailyRequestsPerPrincipal: 100  # 呼び出し元1件あたりの日次成功クォータ（暦日でリセット）
  concurrency:
    global: 2                       # グローバルな最大画像生成並列数
    perPrincipal: 1                 # 呼び出し元1件あたりの最大画像生成並列数
```

Tokenの設定：

```bash
TRYON_API_KEYS="your-secure-token-with-at-least-32-chars-long-1234,another-client-token-5678"
```

バックエンドは**TokenのSHA-256ハッシュダイジェストをメモリ上にのみ保持**し、比較には一定時間比較（Constant-Time Compare）を用いてタイミングサイドチャネル攻撃を防ぎ、ログ・エラー応答・レスポンスヘッダに平文のTokenを一切出力しない。

> ⚠️ **必ず知っておくべき制限**：日次クォータのカウンタはプロセスメモリに保存されるため、**バックエンドを再起動するとリセットされる**。複数インスタンス構成にはRedisなどの外部共有ストレージが必要だ。

#### 4.7.3 デプロイの検証

```bash
# Tokenなし、または誤ったToken（期待される結果: HTTP 401: AUTH_REQUIRED）
curl -X POST https://api.あなたのドメイン/tryon -H "Content-Type: application/json" -d '{}'

# 期待される応答：
# {"code":40101,"message":"请在设置中心填写后端访问 Token",
#  "data":{"error_code":"AUTH_REQUIRED","request_id":"..."}}

# 正当なTokenで疎通確認
curl -X POST https://api.あなたのドメイン/tryon \
  -H "Authorization: Bearer あなたのToken" \
  -H "Content-Type: application/json" \
  -d '{}'

# 期待される応答：パラメータ不足のバリデーションエラー：
# {"code":51,"message":"The PersonImage field is required","data":null}
```

---

## 五、セキュリティ設計の深掘り

私が最も学ぶ価値があると思う部分なので、独立した節としている。

### 5.1 リクエスト処理の順序：まず拒否してからお金を使う

```
1. リクエストを受信しリクエストIDを生成する
2. Origin を検証する（CORSホワイトリスト）
3. HTTPリクエストボディ全体のサイズを制限する（24 MiB、JSONパース前）
4. バックエンドアクセストークンを検証する
5. レート・日次クォータ・並列数のチェックを実行する
6. 2枚の画像のBase64、実際のMIME、ファイルサイズ、幅高、総ピクセル数を検証する
7. モデルアダプタを呼び出す
8. 成功か失敗かに関わらず、並列スロットを解放する
```

**7番目が6番目より後ろにあることに注目**——不正なリクエストはすべてモデルに到達する前に拒否される。これが「攻撃者にお金を使わせない」核心設計だ。

### 5.2 画像検証の9重の関門

`internal/imagevalidate/validate.go` の `ValidateImage` 関数は、ロジックが段階的に積み上がっている：

```go
// 1. 预检查 Base64 编码字符串长度
if limits.MaxEncodedImageBytes > 0 && int64(len(rawB64)) > limits.MaxEncodedImageBytes {
    return nil, security.ErrImageFileTooLarge
}

// 2. 根据字符串长度预估解码大小（防止超大 Base64 占满内存）
estimatedDecodedSize := int64(len(rawB64)) * 3 / 4
if limits.MaxDecodedImageBytes > 0 && estimatedDecodedSize > limits.MaxDecodedImageBytes+1024 {
    return nil, security.ErrImageFileTooLarge
}

// 3. 解码 Base64
data, err := base64.StdEncoding.DecodeString(rawB64)

// 5. 校验真实 MIME 类型（http.DetectContentType）
realMIME := http.DetectContentType(data)
// 若 Data URL 声明了 MIME，必须与真实内容严格一致
if declaredMIME != "" && !strings.EqualFold(declaredMIME, realMIME) {
    return nil, security.ErrUnsupportedImageType
}

// 6. 使用 image.DecodeConfig 校验图片头有效性并提取宽高
cfg, _, err := image.DecodeConfig(bytes.NewReader(data))

// 8. 总像素校验（防止乘法整数溢出）
pixels := int64(cfg.Width) * int64(cfg.Height)
if limits.MaxPixels > 0 && pixels > limits.MaxPixels {
    return nil, security.ErrImagePixelLimitExceeded
}
```

重要な設計が3つ：

**① 宣言を信じず、内容を信じる。** Data URLに書かれた `image/png` は一切信用せず、実際のバイト列の型を `http.DetectContentType` で嗅ぎ分けて、宣言と実態が一致しているかを厳密に検査する。拡張子を偽装した攻撃はここで死ぬ。

**② 先に推定し、後でデコードする。** 2番目のステップで `len(rawB64) * 3 / 4` を使ってデコード後のサイズを推定し、明らかに上限を超えていれば**完全なデコード自体を実行しない**。これは非常に素朴なDoS、500MBのBase64文字列をアップロードする攻撃を 막는다。

**③ `Decode` ではなく `DecodeConfig` を使う。** `image.DecodeConfig` は画像ヘッダのみを読んで幅高を得るだけで、全ピクセルをデコードしない。速くて安全だ——2000万ピクセルの画像を完全にデコードすると100MB超のメモリを消費する。

**制限パラメータ一覧：**

| 項目 | 制限 |
|---|---|
| HTTPリクエストボディ全体 | 24 MiB |
| 単一のBase64エンコード文字列 | 12 MiB |
| 単一画像（デコード後） | 8 MiB |
| 2画像のデコード後合計 | 16 MiB |
| 幅高の範囲 | 256 px ~ 8192 px |
| 総ピクセル | ≤ 20,000,000 px |
| 許可フォーマット | `image/jpeg`、`image/png`、`image/webp` |

### 5.3 フロントエンドの圧縮：99%のユーザーがバックエンド制限に抵触しないようにする

バックエンドの制限は厳しいが、プロジェクトはユーザーに手動で圧縮させなかった。フロントエンドで適応的に処理している：

| 段階 | 処理 |
|---|---|
| アップロード前 | いずれかの辺が 256 px 未満の場合、比率を保ったまま**拡大**して準拠サイズにする |
| 通常モード | 長辺を1280 pxに縮小 |
| 高画質モード | 長辺を2048 pxに縮小 |
| エンコード形式 | WebPを優先し、ブラウザが非対応ならJPEGにフォールバック |
| 品質ラダー | 0.90 → 0.75 と段階的に下げ、≤ 8 MiB になるまで続ける |

結果として、**ほとんどのスマホ実写写真はユーザーが意識しないうちに問題なくアップロードされ**、「ファイルが大きすぎます」といったメッセージは決して目に留まらない。

### 5.4 SSRF対策：公開バックエンドを社内ネットワークの踏み台にできないようにする

`ModelConfig` には専用のフラグがある：

```go
// ClientProvided 表示配置来自浏览器；启用后 HTTP 客户端会阻止内网/保留地址，降低 SSRF 风险。
ClientProvided bool
```

対応するルール：

- 個人のBase URLはHTTP/HTTPSの公開アドレスでなければならない
- **アカウント情報、クエリパラメータ、フラグメントを含めることはできない**
- **localhost、社内ネットワーク、予約済みアドレスは一律拒否**
- GeminiのKeyはリクエストヘッダで渡し、**上流URLには一切含めない**
- ComfyUIは `client_config` を**受け付けない**、バックエンド自身のローカル設定のみを使う

最後の1つがきわめて重要だ。ComfyUIのワークフローパスとノードIDはサーバー側設定からのみ許可され、ブラウザのリクエストで上書きされてはならない。そうでなければ、公開デプロイされたバックエンドは「ローカルホストの8188ポートに任意にアクセスして任意のワークフローを実行できる」という脆弱性になってしまう。

### 5.5 並行制御：待たせず、即座に拒否する

| 設定 | デフォルト |
|---|---|
| グローバル最大並列数 | 2 |
| Token1件あたりの最大並列数 | 1 |

> 成功・失敗・タイムアウト・Contextのキャンセル・panicのいずれでも必ずスロットを解放しなければならない。

「待たせない」は議論を呼ぶ設計だ。あるシステムは待機して処理する選択をし、ユーザー体験はスムーズになる。しかし**有料の画像生成API**にとって、待機はリクエストの滞留、メモリ使用量の増加、タイムアウトの増加を意味する。直接429 + `Retry-After` を返すほうが誠実だ。

### 5.6 プロンプトエンジニアリング：モデレーションシステムとの駆け引き

これがプロジェクト内で最も面白いコードだ。`prompt.go` はモデルごとに**3種類のプロンプト**を用意している。

**汎用プロンプト（Gemini / 豆包など）——英語メイン、中国語サブ：**

```
You are a professional fashion virtual try-on assistant.

Task: Dress the person in the first image wearing the garment in the second image,
and output a single photorealistic full-body or half-body photo.

Strict requirements:
1. Keep the person's identity EXACTLY the same: same face, same facial features,
   same skin tone, same hairstyle, same body type and proportions.
   Do not change who they are.
2. Keep the person's original pose, body angle and orientation as much as possible;
   only adjust the arms/limbs if strictly needed to fit the garment naturally.
3. Put the exact garment from the second image onto the person: preserve its color,
   fabric texture, pattern, neckline, sleeve length, hem length and silhouette faithfully.
   Do not redesign or simplify the garment.
4. The garment must drape naturally on the body, follow the body contours,
   and cast realistic folds, shadows and highlights consistent with the original lighting.
5. Keep the original background, lighting and overall mood of the person's photo.
6. Photorealistic, high detail, professional fashion editorial quality, 8k, natural skin texture.

Output: ONLY the final dressed-up photograph, nothing else.
```

**GPT-Image専用プロンプト**—— 表現がより保守的になっていることに注目：

```
Task: Professional commercial fashion virtual try-on photograph.

Strict Requirements:
1. Model Identity: Maintain the adult female model from Image 1 - faithfully preserve
   her facial features, ethnic identity, eye shape, smile, skin tone, and hairstyle.
2. Wardrobe: Dress her in the exact clothing and accessories shown in Image 2.
3. Safety & Fit: Professional high-end commercial lookbook standard. Fully clothed,
   modest neckline, standard tailored fit, upright standing posture, non-revealing.
4. Composition: Clean bright studio lighting, neutral minimal background,
   photorealistic 8k, high detail fashion editorial photograph.

Output: ONLY the final dressed-up photograph.
```

違いはどこにある？

- "professional commercial fashion virtual try-on photograph" —— **商業写真**という文脈を強調
- "adult female model" —— 大人の女性モデルであることを明示
- "Fully clothed, modest neckline, standard tailored fit, upright standing posture, non-revealing" —— モデレーションを誘発しうる表現を先回りして排除
- "lookbook standard" —— ハイファッションのlookbookという、より「無害な」業界文脈を使う

**なぜ専用のものを書くのか。** コードのコメントが明快に語っている。GPT-Image系は実人物の着替えシーンで公式の安全モデレーションにブロックされる（`moderation_blocked` / `sexual`）。

これは**工学上の現実的な妥協**である。モデレーションを回避しに行っているのではない（それは規約違反だ）。元々コンプライアンスに適合している商業写真のシーンとしてリクエストを記述し、モデルが正しいセマンティック空間で働けるようにしている。同時に、デフォルトモデルをモデレーションのより緩いGeminiに設定している。

**コンテンツ戦略の観点からすれば、これはなぜライブラリが「人物を映さない」設計になっているのかも説明になる。** 1407セットすべてが衣装のみの展示で、人物は登場しない——これにより素材からプロンプトまでのチェーン全体が、機微な境界から遠ざかっている。プロジェクト自身のコンプライアンス報告書もこの点を強調している。

### 5.7 見落とされがちな細部：結果画像のMIMEも嗅ぎ分けて判定している

```go
// DetectGeneratedImageMIME determines the real media type from the generated
// file signature instead of trusting provider headers or declarations.
func DetectGeneratedImageMIME(value string) (string, error) {
    ...
    if len(data) >= 8 && string(data[:8]) == "\x89PNG\r\n\x1a\n" {
        return "image/png", nil
    }
    if len(data) >= 3 && data[0] == 0xff && data[1] == 0xd8 && data[2] == 0xff {
        return "image/jpeg", nil
    }
    if len(data) >= 12 && string(data[:4]) == "RIFF" && string(data[8:12]) == "WEBP" {
        return "image/webp", nil
    }
    return "", fmt.Errorf("生成结果不是受支持的图片格式")
}
```

**受信時はプロバイダのheaderを信じず、送信時も信じない**——ファイルシグネチャで自分で判定する。この対称性がとても美しい。

---

## 六、まとめ：持ち帰れる7つの観点

### 観点1：無料層は慈善ではなく、獲得の構造である

4200件以上のライブラリを完全無料公開し、AI着替えは自前構築の選択肢にした——この決断が、6日で2193 Starを獲得させた。

**プロモーションは「他者が即座に体験できること」に依存し、課金は「価値のあるシーン」に依存する。** この2つを紐づけてしまうと、プロモーションも紐づけてしまう。

### 観点2：任意の選択肢は、はっきり言わなければならない

プロジェクトはREADME、ページ、監査報告書の3箇所で「自前のバックエンドとAPIキーが必要、モデル利用料が発生する可能性がある」を繰り返し明示している。

多くのプロジェクトは「はっきり言ったら誰も使わなくなる」ことを恐れて含糊にしがちだが、結果としてユーザーが使えずにプロジェクトを責めることになる。**はっきり言うことで、かえって信頼が生まれる。**

### 観点3：ドキュメントのドリフトは最も過小評価される技術債

`nvzhuang.md` タスクシートが捉えた細部は側面を物語っている：デフォルトモデルはREADME、API構造、業務ロジックのコメントの3箇所で3種類の記述がある；Docker Composeの `.env` 読み込みパスはユーザーを誘導する。

**これらはプログラムをクラッシュさせないが、どれもユーザーの30分を無駄にする。** こういうドリフトを潰すためにわざわざタスクシートを書くプロジェクトがあるということは、作者が「ドキュメントはプロダクトの一部だ」と理解しているということだ。

### 観点4：セキュリティ要件はプロダクト要件のように書くべきだ

あの562行のセキュリティ要件ドキュメントは、ユーザーストーリー → Evidence → Findings → FR → エラーコード → 設定項目という標準構成を使っている。

鍵はEvidence表にある：**すべての結論にコード位置と再現可能な再確認コマンドが付いている**。これによりドキュメントは空想に終わらず、後から来た人間も自分で検証できる。

### 観点5：デフォルト値の方向は常に「安全かつ利用可能」であるべきだ

`config.yaml` が欠けていれば自動的に `config.example.yaml` にフォールバックし、`server.address` が未設定ならランダムポートではなく `:8000` を明示的にバインドし、`authRequired` のデフォルトは `true`、`allowPrivateNetwork` のデフォルトは `false`。

**Fail-safe という意味は、問題が起きたときにはシステムが「動く」側ではなく「安全」側へ倒れることを意味する。**

### 観点6：ローカライズは翻訳ではなく、データモデル上の意思決定だ

フィールド名は日本語のまま、キーワードは英語、カテゴリ値も日本語のままにして、**フロントエンド**で双方向マッピングを行う。この決断によって、元のデータソースを変更する必要も、高リスクなデータ移行を行う必要もなく、同時に中国語・英語バイリンガルの検索能力を得られた。

**互換性のコストは、場合によってはアーキテクチャで完全に吸収できる。**

### 観点7：姉妹プロジェクトは低コストの成長レバーだ

`nvzhuang` ↔ `ai-pose-gallery-zh`（288セット / 1439枚のポーズリファレンス）は互いにトラフィックを誘導し、「ポーズリファレンス + 人物リファレンス + 衣装リファレンス → AI生成」という完全なチェーンを組み立てる。

2つのプロジェクトは同じComfyUIワークフローの基盤（`Ref2VA` コンセプト）を共有している：技術再利用 + トラフィック相互導流 + シナリオ補完。**これは独立開発者が打てる最高の組み合わせの一手だ。**

---

## 七、噴き出すべき点と注意すべき点

客観的にいくつかの不足を挙げる。

### 7.1 日次クォータはメモリ上にあり、再起動でリセットされる

ドキュメントにはこの制約が明記されている。単一インスタンスでの個人利用なら問題ないが、誰かがこのバックエンドを公開サービスとして二次配布したら、再起動でクォータをリセットできてしまう。スケールさせるならRedisが必須だ。

### 7.2 フル解像度のPNGは利用できない

`原寸` フィールドが指す `png/*.png` ディレクトリは1GB超で未ホストのため、GitHub Pages上で404になる。フロントエンドにWebPフォールバックがあるのでユーザーは実感しない。しかし「原寸をダウンロード」という機能は実質的に存在しない——**本当の原画像には別の画像ホスティングが必要だ。**

### 7.3 ポート規約はかつて自己矛盾していた

タスクシートにはこの件について専用の段落がある：

> 静的ページとバックエンドの両方が8000を例に使うと衝突しやすい；READMEには明確に競合しないローカルデモ用ポートの組を書け。

現在のREADMEはフロントエンド3000、バックエンド8000に修正済みだが、この落とし穴は思い出させてくれる：**ドキュメント内のサンプルコマンドは実際に動かして確認しなければならない。**

### 7.4 コンテンツコンプライアンスは恒久的な箍（くびり）の呪縛

プロジェクト自身の審査報告書が393件（ランジェリー/水着/セクシー）を中〜高リスクと判定している。この種のコンテンツは、どの技術コミュニティで公開してもアルゴリズムに誤判定されうる。プロジェクトの対処は「宣伝には日常のものだけを使う」だが、これは**自分の最も豊富な在庫を見せられない**ことを意味する——これは構造的な緊張である。

### 7.5 単一ファイルフロントエンドのスケール上限

3278行の `index.html` に、スタイル、インタラクション、二言語辞書、試着台、IndexedDBの履歴、設定センター、圧縮ロジックがすべて入っている。**ビルド不要は利点だが、ファイルが3000行を超えるあたりから、協働と保守のコストが明確に上がり始める。**

学ぶ価値があるのは「ビルド不要」で、学ぶ価値がないのは「決して分割しない」だ。

### 7.6 AI着替えの効果は制御できない

プロンプトをどれだけ良く書いても、最終的な結果はモデル次第だ。READMEにある「顔を正確に保持」「完璧に再現」といった表現は、実はプロジェクト自身の仕様書が明確に警告している：

> 着替えの3枚は実装に事実として対応させ、アルゴリズムの必然的効果に偽装してはならない。「顔を正確に保持」「100%再現」のような保証できない表現を避けること。

**理想と現実の乖離は、こうした製品における最大の暗黙のコストだ。**

---

## 八、類似のものを作るなら、何を，我们应该するか

### 構成を写す

```
純静的フロントエンド（ビルド不要、Key不要、コストゼロ）
        ↓ ユーザーが実際のニーズを生んだら
任意のバックエンド（マルチモデルプラガブル + 完全なセキュリティ防御）
        ↓ コストを節約したいなら
ローカルComfyUI（コストゼロ、Key不要、オフライン）
```

### ドキュメントを写す

500行以上のセキュリティ要件ドキュメントを書き、Evidence表にはコード位置と再確認コマンドを付ける。監査報告書を書き、PASSED / PENDING / BLOCKED の三状態をはっきり分ける。ライセンス判断書を書き、コードのライセンスと素材のライセンスを**別々に**扱う。

### 規約を写す

`AGENTS.md` にある4項目のコミット前自己チェックリストをそのまま写す。各項目には実行可能なコマンドが必要であり、スローガンだけではだめだ。

### トレードオフを写す

「全面互換」と「正直なラベル付け」の間では、後者を選ぶ。READMEにある「生成属性声明：すべての画像はAI生成（t2i）によるコンセプト衣装デザインであり、実在ブランドの商品写真ではない」という一文は、500枚多くの画像を置くより長期的な信頼を生む。

---

## 九、最後に

`nvzhuang` のコード量は大したものではなく、技術スタックにも目玉となる要素がない。6日で2193 Starに到達できたのは技術的難しさではなく、**「やっておくべき」箇所をすべてやった**からである：

- 静的と動的の分離、無料と有料の明確化
- プラガブルなモデル、設定によるプラガブル化
- セキュリティを機能として扱い、要件ドキュメントからコードまでエンドツーエンドで揃える
- 失敗したときは安全側に倒れる
- ドキュメントとコードを1項目ずつ突き合わせる
- データの流れをユーザーに対して完全に透明に保つ

これらはどれも才能を要するものではなく、必要なのは**すべての細部に3分多く時間を使うこと**だけだ。

AIアプリケーション系のオープンソースプロジェクトを作っているなら、この「セキュリティ要件ドキュメント + Evidenceトレーサビリティ + Fail-Safeなデフォルト値 + コミット前の4つのゲート」のやり方は、まるごと持ち帰る価値がある。

---

**プロジェクト所在地**

- オンライン体験：https://paipiange.github.io/nvzhuang/
- GitHubソース：https://github.com/paipiange/nvzhuang
- 姉妹プロジェクト（ポーズリファレンスと画像生成ワークショップ）：https://github.com/paipiange/ai-pose-gallery-zh
- ライセンス：MIT License（完全無料オープンソース、商用利用可）

**中国語訳**

本プロジェクトのすべての技術ドキュメントの中国語訳は、コードリポジトリの `docs/nvzhuang-translations/` ディレクトリに同期済みで、README、バックエンドデプロイガイド、セキュリティ検証要件、カスタムアップロード技術提案、コンプライアンス審査報告書など、計11種類のドキュメントを含む。

---

Eric|瑞哥
広東 深圳

✅元IBMアーキテクト｜.Blockchainの書籍『Blockchainのコア技術と応用』の共著著者
技術コードリポジトリ:https://github.com/gyc567
個人サイト:www.topdigg.com
💼シンガポール資産運用会社 元CTO
👉WeChat公式アカウント「瑞哥观势」責任者
💎フォーカス:富創造と富守住
🎯経営者層に集中：AIによるコスト削減と効率化
WeChat:360369487

---

この高速な時代において、私は依然として対面、小規模、高濃度のつながりの力信じている。

私は「脱バブル化」された経営者のサークルづくりに尽力しており、关注する領域は：

🔹 Eコマース全領域：国内ライブコマース、越境EC、海外展開プロジェクトのインキュベーション

🔹 VCと産業投資：金融・銀行リソースのマッチング、企業資金調達とM&A

🔹 コンテンツエコシステム：MCN機構、クリエイター行列、ブランド統合

🔹 組織づくり：コアチームの編成、高级管理者の採用

## 【私のオフライン会】

大会は開かない、「小さな会」だけを開く。

✅ 創業者プライベートボード：ビジネス難題を深く掘り下げる

✅ 経営者の閉門夕食：波の合う仲間とのつながり、そして人生における重要な決断まで（質の高い独身層）

✅ 業界サロン：特定のトラックに集中し、実質的な協業病例、实现

## 選考基準：

結果を持ち、境界線を持ち、長期的な視点を持つ創業者／パートナーだけを歓迎する。

時間は貴重だ。価値のある人にだけ捧げよう。
