---
title: "Keploy 深度解析：eBPF駆動のゼロ侵入型APIテストプラットフォーム——本番トラフィックをテストケースに変える"
date: "2026-09-03"
description: "Keployオープンソースプロジェクトの深層解析：eBPFカーネルレベルトラフィックキャプチャ、Record-Replayテストパラダイム、依存関係仮想化、そして「AIコード検証」設計哲学。詳細なインストール教程、コアアーキテクチャ分析、主な观点まとめを含む。"
tags:
  - Keploy
  - eBPF
  - APIテスト
  - Record-Replay
  - 自動化テスト
  - 依存関係仮想化
  - CI/CD
  - オープンソース
categories:
  - AI ツール深度解析
  - 自動化テスト
  - DevOps
---

# Keploy 深度解析：eBPF駆動のゼロ侵入型APIテストプラットフォーム——本番トラフィックをテストケースに変える

> **コア思想：Keployの設計哲学は「テストをコードから来て、本番に行くものにする」。eBPFを使ってLinuxカーネルレベルで実際のトラフィックをキャプチャし、テストケースと依存関係Mockを自動生成——コードの一行も修正せず、SDK也不要、言語やフレームワークに依存しない。テストはもう開発負担ではなく、本番環境の振る舞いの確定的なミラーである。**

---

## 一、プロジェクトの背景と起源

### 1.1 なぜKeployが必要なのか？

开发者としては、こんな崩壊体験をしたことがあるかもしれません：

- **「自分のマシンでは動く、本番にデプロイすると落ちる」** —— ユニットテストのカバレッジは100%なのに、本番では 여전히 問題が発生する
- **「このAPIは外部APIに依存しているので、ローカルでテストできない」** —— 外部サービスが不安定で、テスト環境は永遠に不完全
- **「リファクタリング之後 发布が怖い」** —— 信頼性の高い回帰テストがなく、コードの一行を変更するのが爆弾処理のように感じる
- **「テストスクリプトの方がビジネスコードより多い」** —— 開発の50%の時間がテスト написании に費やされる

これらの問題の根源は一つ：**従来のテストは本番環境の複雑さを本当に反映できない。** ユニットテストはMockに依存するが、Mockは人間が書いたものであり、実際の振る舞いとの間には常にギャップがある。

Keployの创始チームは複雑な分散 시스템을構築する際にこの痛苦を深く体会した。彼らの解決策は——**実際の本番トラフィックを直接キャプチャして、再生可能なテストケースに変換する。** テストを手で書くことから離れ、本番環境が私たちにどのようにテストすべきかを教えてくれるようにする。

### 1.2 主要データ

| 指標 | データ |
|------|--------|
| GitHub Stars | 18.4K+ |
| 生成されたMock数 | 1.2M+ |
| テスト実行回数 | 300M+ |
| 対応言語 | Go、Python、Java、Node.js、Ruby、C#、PHP、JavaScript、.NET、Kotlin、Scala、Rust など |
| 対応データベース | PostgreSQL、MySQL、MongoDB、Redis、SQL Server など |
| 対応メッセージキュー | Kafka、RabbitMQ など |

---

## 二、コア概念：Record-Replay テストパラダイム

### 2.1 什么是Record-Replay？

Keployの核心処理は2つの段階で構成される：

**Record（録画モード）：**
1. アプリケーション起動時に `keploy record` コマンドを使用
2. 実際のユーザートラフィックがアプリケーションに到着
3. KeployはeBPFを通じてカーネルレベルで全ての発信・受信ネットワークリクエストをキャプチャ
4. これらのリクエストと依存関係レスポンスがYAML形式のテストケースとして保存される

**Replay（再生モード）：**
1. アプリケーション起動時に `keploy test` コマンドを使用
2. Keployはローカルから Previously recorded YAMLテストケースを読み込む
3. 録画されたHTTPリクエストをアプリケーションに再送信
4. 依存関係呼び出しは自動的にMockされ、録画されたデータが返される
5. Keployは実際のレスポンスと録画されたレスポンスを比較し、テストレポートを生成

これはまるでアプリケーションに「ドライブレコーダー」を取り付けるようなもの——実際の走行状況を録画し、再生時に異常を検出する。

### 2.2 従来のテストとの本質的な違い

| 側面 | 従来のMock/Stub | Keploy |
|------|---------------|--------|
| データソース | 人間が書く | 実際の本番トラフィックの録画 |
| 依存関係の複雑さ | シンプルなシナリオ | DB、キュー、外部APIを含む完全なチェーン |
| 維持コスト | 高（コード変更時にMockも同步更新必要） | 低（一度録画すれば自動更新） |
| ノイズフィールド | 手動で除外必要 | AIが自動的にノイズフィールドを識別 |
| 環境構築 | 面倒 | ゼロ設定 |

### 2.3 ノイズ検出（Noise Detection）

実際の本番環境のレスポンスには動的データが含まれていることが多い：タイムスタンプ、ランダムUUID、第三方が返す現在の価格など。これらのフィールドを直接比較すると、すべてのテストが失敗する。

Keployの解決策は**インテリジェントなノイズ検出**：

1. 録画完了後、Keployは録画された依存Mockを使用して同じエンドポイントに再リクエスト
2. 2つのレスポンスを比較し、差分フィールドを特定
3. 差分フィールドは「ノイズフィールド」としてマークされ、アサーションに参加しない
4. これにより再生テストの確定性が保証される

---

## 三、コア技術：eBPF駆動

### 3.1 なぜeBPFなのか？

eBPF（Extended Berkeley Packet Filter）はLinuxカーネルの革命的な技術で、オペレーティングシステムカーネル内でサンドボックスプログラムを安全に実行することを可能にする。Keployが流量キャプチャの基盤としてeBPFを選んだ理由は以下の通り：

**ゼロ侵入性：** アプリケーションコードにSDKを追加する必要も、設定を変更する必要もない。Keployの下でアプリケーションを実行するだけでよい。

**言語非依存性：** eBPFはネットワーク層で動作し、プログラミング言語に依存しない。アプリケーションがGo、Python、Java、Node.jsのいずれで書かれていても、Keployはトラフィックをキャプチャできる。

**カーネルレベルの精度：** socket層でデータをキャプチャするため、リクエストを見落とすことはない。

### 3.2 eBPFの動作原理

```
ユーザー空間
    │
    │  アプリケーションがHTTPリクエストを発信
    ▼
┌─────────────────────┐
│   eBPF Hooks        │ ← Ingress: 受信HTTPリクエストをキャプチャ
│   (カーネル空間)      │
└─────────────────────┘
    │
    │  アプリケーションがDB/外部API呼び出しを発信
    ▼
┌─────────────────────┐
│   eBPF Hooks        │ ← Egress: 送信TCP/UDP接続をキャプチャ
│   (カーネル空間)      │
└─────────────────────┘
    │
    ▼
┌─────────────────────┐
│   Network Proxy      │ ← 透過プロキシ、プロトコル解析を処理
│   (ユーザー空間)      │
└─────────────────────┘
    │
    ▼
┌─────────────────────┐
│   YAML テストケース   │ ← 録画結果を保存
└─────────────────────┘
```

### 3.3 ネットワークプロキシ（Network Proxy）

KeployのNetwork Proxyは透過プロキシとして以下の职责を果たす：

1. **プロトコル解析：** TCPバイナリストリームを読み可能なYAML形式に変換
2. **TLS傍受：** HTTPS接続に対し、Keployは偽造証明書チェーンを挿入して暗号化トラフィックの復号化を実現
3. **ファジーマッチング：** 未知の依存関係に対し、バイナリデータをbase64としてYAMLに保存し、再生時にファジーマッチングを使用
4. **マルチプロトコル対応：** HTTP、PostgreSQL、MySQL、MongoDB、Kafka、RabbitMQなどのプロトコル処理が組み込まれている

---

## 四、アーキテクチャ解析

### 4.1 Keploy V2 アーキテクチャ概要

Keploy V2は3つのコアコンポーネントで構成される：

**1. eBPF Hooks Loader**

- **Ingress Interceptor（入口インタ셉タ）：** アプリケーションに到着するHTTPリクエストをキャプチャし、YAML形式で保存
- **Egress Interceptor（出口インタ셉タ）：** アプリケーションが送信するTCP/UDP接続をKeployプロキシサーバーにリダイレクト

**2. Network Proxy（ネットワークプロキシ）**

- データパケットを非同期処理し、読み可能な形式に変換
- データベース対応（Postgres、MySQL、MongoDBなど）
- メッセージキュー対応（Kafka、RabbitMQなど）
- 外部API呼び出し対応

**3. API Server（APIサーバー）**

- 録画/テストのライフサイクルを管理
- コマンドラインインターフェースを提供
- テストレポートを生成
- 完全Agentモードへの進化中

### 4.2 データフロー図

```
        Record モード
        ─────────
  外部リクエスト ──→ eBPF Ingress ──→ HTTPリクエストを記録 ──→ YAML
  アプリケーション呼び出し ──→ eBPF Egress ──→ Proxy解析 ──→ YAML (Mock)

        Test モード
        ─────────
  YAMLテストケース ──→ 録画されたHTTPリクエストを送信 ──→ アプリケーション処理
  YAML Mock ──→ Proxyが傍受 ──→ 録画されたレスポンスを返す ──→ アプリケーション受信
  比較結果 ──→ テストレポートを生成
```

---

## 五、詳細なインストールと使用教程

### 5.1 環境要件

- Linuxシステム（カーネル 4.18+、推奨 5.8+）
- eBPF対応（ほとんどの сучасних Linuxディストリビューション）
- curl（インストールスクリプトのダウンロード用）
- Go >= 1.17（ソースからビルドする場合）

### 5.2 Keployのインストール

**方法一：公式インストールスクリプト（推奨）**

```bash
curl --silent -O -L https://keploy.io/install.sh && source install.sh
```

**方法二：Homebrew（macOS/Linux）**

```bash
brew install keploy
```

**方法三：バイナリをダウンロード**

```bash
wget https://github.com/keploy/keploy/releases/latest/download/keploy_linux_amd64.tar.gz
tar -xzf keploy_linux_amd64.tar.gz
sudo mv keploy /usr/local/bin/
```

### 5.3 クイックスタート：Goアプリケーション

**ステップ1：プロジェクトを初期化**

```bash
mkdir my-app && cd my-app
go mod init my-app
```

**ステップ2：アプリケーションコードを作成（main.go）**

```go
package main

import (
    "encoding/json"
    "log"
    "net/http"
    "github.com/gorilla/mux"
)

type Response struct {
    Message string `json:"message"`
    Status  string `json:"status"`
}

func healthHandler(w http.ResponseWriter, r *http.Request) {
    json.NewEncoder(w).Encode(Response{
        Message: "OK",
        Status:  "healthy",
    })
}

func helloHandler(w http.ResponseWriter, r *http.Request) {
    vars := mux.Vars(r)
    json.NewEncoder(w).Encode(map[string]string{
        "hello": vars["name"],
    })
}

func main() {
    r := mux.NewRouter()
    r.HandleFunc("/health", healthHandler).Methods("GET")
    r.HandleFunc("/hello/{name}", helloHandler).Methods("GET")
    log.Fatal(http.ListenAndServe(":8080", r))
}
```

```bash
go get github.com/gorilla/mux
```

**ステップ3：テストケースを録画**

```bash
# ターミナル1：録画モードで起動
keploy record -c "go run main.go"

# ターミナル2：テストリクエストを送信
curl http://localhost:8080/health
curl http://localhost:8080/hello/world
```

録画完了後、Keployは現在のディレクトリの `keploy/testSets` フォルダにYAMLテストファイルを生成する。

**ステップ4：テストを再生**

```bash
# 録画を停止（Ctrl+C）、次にテストを実行
keploy test -c "go run main.go" --delay 10
```

`--delay 10` はアプリケーションの起動完了を10秒間待つ。Keployは自動的に録画された全テストケースを実行し、レポートを出力する。

### 5.4 クイックスタート：Pythonアプリケーション

```bash
# Flaskをインストール
pip install flask

# app.pyを作成
cat > app.py << 'EOF'
from flask import Flask, jsonify
app = Flask(__name__)

@app.route("/api/hello")
def hello():
    return jsonify({"message": "Hello from Python!"})

@app.route("/api/users/<int:user_id>")
def get_user(user_id):
    return jsonify({"id": user_id, "name": "Alice"})
EOF
```

```bash
# 録画モード
keploy record -c "python app.py"

# 別のターミナルからリクエストを送信
curl http://localhost:5000/api/hello
curl http://localhost:5000/api/users/42

# テストモード
keploy test -c "python app.py" --delay 10
```

### 5.5 既存のテストフレームワークとの統合

Keployは主流のテストフレームワークとシームレスに統合でき、既存のテストフローを放棄する必要はない。

**go-testとの統合：**

```bash
keploy record -c "go run main.go" --generateTests
```

**pytestとの統合：**

```bash
keploy record -c "python app.py" --testCommand "pytest"
```

**JUnitとの統合（Jenkins CI）：**

```bash
keploy test -c "java -jar app.jar" --ci
```

### 5.6 Docker環境での使用

**Dockerfile：**

```dockerfile
FROM golang:1.21-alpine AS builder
WORKDIR /app
COPY . .
RUN go build -o server main.go

FROM alpine:latest
RUN apk add --no-cache curl
COPY --from=builder /app/server /server
COPY --from=builder /app/keploy /usr/local/bin/keploy
ENTRYPOINT ["keploy"]
```

**Docker Composeで実行：**

```yaml
version: '3.8'
services:
  app:
    build: .
    environment:
      - KEPLOY_MODE=record
    network_mode: host
    privileged: true
    volumes:
      - ./keploy:/keploy
```

> 注意：DockerでKeployを実行するには `--network=host` と `--privileged` モードが必要。eBPFはネットワーク名前空間への直接アクセスを必要とするため。

---

## 六、CI/CD統合

### 6.1 GitHub Actions

```yaml
name: Keploy Tests

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Set up Go
        uses: actions/setup-go@v5
        with:
          go-version: '1.21'

      - name: Install Keploy
        run: |
          curl --silent -O -L https://keploy.io/install.sh
          source install.sh

      - name: Run Keploy Tests
        run: |
          keploy test -c "go run main.go" --delay 15 --ci
```

---

## 七、設計哲学：なぜKeployはこのように設計されているか

### 7.1 コア設計原則

**1. ゼロ侵入性（Zero Intrusion）**

Keployの最大の特徴はコードの完全なる非改変性。eBPFでカーネルレベルからトラフィックをキャプチャし、アプリケーションは自分がテストされていることを完全に知らない。これにより以下の巨大な便利さがもたらされる：

- レガシーシステムはリファクタリングなしでテストカバレッジを獲得できる
- サードパーティライブラリとフレームワークが自然にカバーされる
- テストカバレッジとビジネスコードが完全に切り離される

**2. 言語非依存性（Language Agnosticism）**

eBPFはOSレベルで動作し、プログラミング言語に依存しない。KeployはGoで書かれたAPI、Pythonで書かれたマイクロサービス、Javaで書かれたバックエンドタスクを同時にテストできる——これらのサービス間の相互呼び出しもすべてキャプチャ・録画される。

**3. 依存関係をコードとして（Dependencies as Code）**

従来のテストでは、依存関係が最も面倒な部分だった。完全なテスト環境を構築するか、大量のMockを書くか。Keployのアプローチは**依存関係の呼び出しも録画する**ことで、再生時に完全に再現する，这意味着：

- テストは実際のデータベースを必要としない
- 外部API呼び出しはMockサーバーを必要としない
- メッセージキューの相互作用も完全に記録される

**4. テストはドキュメントである（Tests as Documentation）**

Keployが生成するYAMLテストケースは人間に読める。各テストケースは以下を記録する：

- 完全なHTTPリクエストメッセージ（ヘッダー、ボディ、クエリパラメータ）
- すべての依存関係呼び出しのリクエストとレスポンス
- 期待されるレスポンス

これらのYAMLファイル自体が、生きたドキュメントであり、APIの実際の振る舞いを記述する——我々が「思う」ように動くべきものではなく、「実際」にどう動くか。

### 7.2 AIプログラミングとの結合

KeployはAI-Gen時代に特に重要。AIがコードを生成使用时，最大的问题是**如何验证生成的代码是正确的**。传统方法是手工编写测试，但AI生成的代码量太大，手工编写测试不现实。

Keployは別の思路を提供する：

1. 実際のユーザートラフィックからベースラインテストを録画
2. AIがコードを変更した後、Keployでテストを再生
3. レスポンスの違い、Schemaの変更、動作ドリフトを自動的に検出

これにより「AIがコードを書く → Keployが検証する」のループが形成される。Keployの公式はさえ：**AI writes code, Keploy catches what breaks**という激动的愿景を提案している。

### 7.3 本番トラフィックテストの価値

Keployの録画-再生メカニズムには以下の知られざる優位性がある：**staging環境で本番トラフィックを使用して回帰テストを実行できる。** 具体的な方法は：

1. 本番環境でトラフィックを録画（匿名化後）
2. staging環境でこれらのトラフィックを再生
3. 新バージョンのコードをデプロイ
4. 再度再生し、结果の差異を比較

これによりテストの究極の問題が解決される：「新バージョンが実際のシナリオで動くかどうかをどのように知るか？」

---

## 八、まとめ：コア观点と結論

### 8.1 Keployが解決する問題

**コア問題：テストと本番の間のギャップ**

従来のテスト（ユニットテスト、統合テスト）は根本的な矛盾に直面している：テストされるのは我々が「期待する」振る舞いであり、「実際の」振る舞いではない。Mockは人間が書いたものであり、実際の振る舞いと一致しない可能性がある；テスト環境は簡略化されており、本番環境と異なる場合がある。

Keployは本番トラフィックを直接キャプチャすることでこのギャップを埋める。テストケースは実際のリクエストから来にあり、Mockは実際の依存関係レスポンスから来ています。テストが通るということは：少なくとも録画期間中、このエンドポイントは実際の負荷で正常に動作していたことを意味する。

### 8.2 主要優位性

1. **テスト作成時間の99%を節約：** 手動でテストケースを書く必要がなく、本番トラフィックを録画するだけでよい
2. **ゼロ環境設定：** テストデータベース、Mockサーバー、テスト用第三方サービスの構築が不要
3. **真の回帰テスト：** 本番トラフィックで回帰テストを実行し、「自分のマシンでは正常、本番で落ちる」問題を検出
4. **言語とフレームワーク非依存：** 同じツールでテックスタックに関係なくすべてのマイクロサービスをカバー
5. **測定可能なカバレッジ：** コードカバレッジだけでなく、API Schemaカバレッジとビジネスユースケースカバレッジもある

### 8.3 適用シナリオ

**強く推奨：**

- マイクロサービスアーキテクチャアプリケーション（大量の内部分サービスと外部依存関係あり）
- レガシーシステム（コードを変更したくないがテストを追加する必要がある）
- 頻繁に変更されるプロジェクト（信頼性の高い回帰テストが必要）
- AI生成コードの検証（AI生成コードの正確性を迅速に検証）

**あまり向いていない：**

- 純粋な計算ロジック（ネットワークI/Oのないアルゴリズム）
- 実際の時間でトリガーされるタイマータスク
- 実際の物理デバイスとの相互作用が必要なシナリオ

---

## 九、FAQ

**Q：eBPFはroot権限を必要としますか？**
A：はい、eBPF操作は特权レベルを必要とします。通常はrootで実行するか、`CAP_BPF` capabilityを使用します。

**Q：WindowsやmacOSに対応していますか？**
A：Keployは現在主にLinuxをサポートしています。一部のユーザーはWSL2経由でWindowsで実行するか、Docker経由でmacOSを使用しています（privilegedモードが必要）。

**Q：録画はアプリケーションのパフォーマンスに影響しますか？**
A：eBPFのオーバーヘッドは非常に小さい。録画中は通常1〜5%のパフォーマンロスがあり、テスト再生時は追加オーバーヘッドがない。

---

## 十、クイックリファレンス

**インストール：**
```bash
curl --silent -O -L https://keploy.io/install.sh && source install.sh
```

**録画：**
```bash
keploy record -c "your-app-command"
```

**テスト：**
```bash
keploy test -c "your-app-command" --delay 10
```

**公式ドキュメント：** https://keploy.io/docs/

**GitHub：** https://github.com/keploy/keploy

**コミュニティSlack：** https://join.slack.com/t/keploy/shared_invite/zt-3zcnuqfgl-WYK1NMhslVHsCtNcA1ULwA
