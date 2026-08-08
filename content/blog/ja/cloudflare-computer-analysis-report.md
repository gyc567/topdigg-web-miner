---
title: "Cloudflare Computer 深層解析：エージェントにコンピュータを提供する"
description: "Cloudflare Computer — Cloudflareのオープンソースバーチャルファイルシステムの包括的解析。その設計哲学、SQLite永続化アーキテクチャ、マルチバックエンド実行エンジン、FUSEマウントメカニズム、およびAIエージェントインフラストラクチャの将来のパラダイムを定義する理由を深く探求します。"
date: "2026-08-08"
author: "TopDigg Research Team"
tags: ["Cloudflare Computer", "Durable Objects", "AIエージェント", "バーチャルファイルシステム", "SQLite", "FUSE", "オープンソース", "Workers", "コンテナ", "クラウドネイティブ"]
categories: ["深層解析"]
keywords: ["Cloudflare Computer", "バーチャルファイルシステム", "Durable Objects", "AIエージェントインフラ", "SQLite永続化", "FUSEマウント", "マルチバックエンド実行", "クラウドネイティブエージェント"]
---

> **Cloudflare Computer** はCloudflareのオープンソースバーチャルファイルシステムで、AIエージェントに永続的でポータブルな作業ディレクトリを提供します。この包括的解析は、プロジェクトのアーキテクチャ、設計哲学、実用的チュートリアル、およびAIインフラストラクチャの核心的な洞察をカバーします。

---

## 1. プロジェクト概要

### 1.1 Cloudflare Computerとは？

Cloudflare Computerは、Durable Object内部に存在するバーチャルファイルシステムです。永続的でSQLiteベースのワークスペースを提供し、プラガブルな実行バックエンドを持ち、小さくポータブルな作業ディレクトリを必要とするAIエージェント向けに設計されています。

これは従来のファイルシステムやクラウドストレージではありません。Cloudflare Computerは完全な「エージェントコンピュータ」コンセプトです。ファイルストレージだけでなく、エージェントがコードを読み取り、書き込み、実行できる実行環境を提供します。

### 1.2 コア機能

| 機能 | 詳細 |
|------|------|
| **永続ファイルシステム** | SQLiteベースのバーチャルファイルシステム、DO再起動後も持続 |
| **マルチバックエンド実行** | Container、Worker Shell、Worker JavaScript — 3つの実行エンジン |
| **AI SDKツール** | 内蔵read、write、edit、ls、execエージェントツール |
| **Git統合** | isomorphic-gitクライアント、SQLite VFSを直接操作 |
| **R2読み取り専用マウント** | R2バケットからワークスペースに読み取り専用データを事前填充 |
| **アセット共有** | presigned URLまたはCloudflare Artifacts経由でファイルを共有 |
| **マルチバックエンドルーティング** | ワークスペースごとに複数バックエンドを登録、名前付きルーティング |

### 1.3 重要な概念

#### ワークスペースパターン — エージェントの「ホーム」

Cloudflare Computerはワークスペースパターンを中心に構築されています。各エージェントは独立したワークスペースを取得します：

1. **ファイルシステム**：`workspace.fs` がNode.js `fs/promises`ライクなAPIを提供
2. **実行エンジン**：`workspace.runtime.exec()` がコマンドやモジュールを実行
3. **永続状態**：すべての操作がDurable ObjectのSQLiteストレージに永続化

この設計により、エージェントは真の「ホーム」を持ちます。状態を永続的に保存し、コードを実行し、ファイルを管理する環境です。

#### 3バックエンドアーキテクチャ — 柔軟性の中核

Cloudflare Computerは3つの実行バックエンドを提供し、それぞれ異なる特性を持ちます：

| バックエンド | 実行環境 | 特徴 |
|-------------|----------|------|
| **Container** | 完全Linuxユーザー空間 | 真のバイナリ、npm、node、ネットワーク |
| **Worker Shell** | Dynamic Worker内のjust-bash | 高速、コンテナ不要 |
| **Worker JavaScript** | Dynamic Worker内のECMAScriptモジュール | 構造化I/O、永続インポート |

**単一実行エントリポイント**：`workspace.runtime.exec(source, { backend })` が唯一の実行エントリポイントです。`source` の意味はバックエンドによって異なります。シェルバックエンドではコマンド、JavaScriptバックエンドではモジュールです。

#### 同期プロトコル — データ整合性保証

Cloudflare Computerは双方向同期プロトコルを使用し、Durable ObjectのSQLiteストレージと実行環境間のデータ整合性を確保します：

- **プッシュ**：DO側の書き込みを設定されたバックエンドにプッシュ
- **プル**：バックエンドの書き込みをDOにプルバック
- **コンテンツアドレス指定**：blobキャッシュとLRU戦略を使用
- **リビジョンベース**：変更履歴を追跡

---

## 2. 設計哲学

### 2.1 すべてはワークスペース

Cloudflare Computerの設計哲学は**すべてはワークスペース**です。ファイルシステム、実行エンジン、Gitクライアント、アセット共有 — すべてワークスペースを中心に構築されています。

これは偶然の設計选择ではなく、意ではなく、意図的なアーキテクチャ決定です：

1. **統一抽象化**：ワークスペースが唯一の抽象化レイヤーであり、すべての操作がそれを通じて行われる
2. **合成可能性**：異なるバックエンドを組み合わせて複雑なワークフローをサポート
3. **ポータビリティ**：ワークスペースは異なる実行環境間で移行可能

### 2.2 プラガブルバックエンド — 必要に応じて選択

Cloudflare Computerのコア革新はプラガブルバックエンドアーキテクチャです。`workspace.runtime.exec()` が唯一の実行エントリポイントであり、バックエンドが `source` がシェルコマンドかECMAScriptモジュールかを定義します。

この設計は以下をサポート：
- **柔軟性**：タスク要件に基づいて最適なバックエンドを選択
- **拡張可能性**：新しい実行バックエンドを追加可能
- **コスト最適化**：簡単なタスクはWorker Shell、複雑なタスクはContainerを使用

### 2.3 永続化優先 — 状態は資産

Cloudflare Computerは永続化をコア機能として扱います。すべてのファイル操作がDurable ObjectのSQLiteストレージに永続化され、再起動後も変更されません。

これは従来のステートレスエージェントフレームワークとは根本的に異なります。従来のフレームワークでは、エージェントの状態は通常外部データベースやファイルシステムに保存されます。Cloudflare Computerは状態をエージェントのワークスペースに直接埋め込み、状態管理を简单で信頼性のあるものにします。

---

## 3. 詳細チュートリアル

### 3.1 インストールとセットアップ

#### パッケージのインストール

```bash
npm install @cloudflare/computer
```

#### Wrangler設定

```json
{
  "compatibility_flags": ["nodejs_compat"],
  "durable_objects": {
    "bindings": [
      { "name": "Agent", "class_name": "Agent" }
    ]
  },
  "migrations": [
    { "tag": "v1", "new_sqlite_classes": ["Agent"] }
  ]
}
```

#### 最小限の例 — ファイルシステムのみ

```typescript
import { withWorkspace, getWorkspace } from "@cloudflare/computer";
import { DurableObject } from "cloudflare:workers";

export class Agent extends withWorkspace(
  class extends DurableObject<Env> {},
  (self) => ({ storage: self.ctx.storage }),
) {}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const id = env.Agent.idFromName("user-123");
    using ws = await getWorkspace(env.Agent.get(id));

    await ws.fs.writeFile("/notes.md", "- [ ] ship it\n");
    const notes = await ws.fs.readFile("/notes.md", "utf8");

    return new Response(notes);
  },
} satisfies ExportedHandler<Env>;
```

### 3.2 実行バックエンドの追加

#### Worker Shell バックエンド（入門推奨）

```typescript
import { withWorkspace, getWorkspace } from "@cloudflare/computer";
import { WorkerShellBackend } from "@cloudflare/computer/backends/worker-shell";
import curlModules from "@cloudflare/computer/shell/curl";
import { DurableObject } from "cloudflare:workers";

export class Agent extends withWorkspace(
  class extends DurableObject<Env> {},
  (self) => ({
    storage: self.ctx.storage,
    backends: [
      new WorkerShellBackend({
        loader: self.env.LOADER,
        workspace: { binding: "Agent", id: self.ctx.id.toString() },
        ctx: self.ctx,
        commands: [curlModules],
      }),
    ],
  }),
) {}
```

Worker Loaderバインディングを `wrangler.jsonc` に追加：

```json
{
  "compatibility_flags": ["nodejs_compat", "experimental"],
  "worker_loaders": [{ "binding": "LOADER" }]
}
```

#### Container バックエンド（完全Linux環境）

```typescript
import { Workspace } from "@cloudflare/computer";
import {
  CloudflareContainerBackend,
  withWorkspaceContainer,
} from "@cloudflare/computer/backends/container";
import { DurableObject } from "cloudflare:workers";

export class Agent extends withWorkspaceContainer(class extends DurableObject<Env> {}) {
  readonly workspace = new Workspace({
    storage: this.ctx.storage,
    backends: [
      new CloudflareContainerBackend({
        container: () => this,
        workspace: { binding: "Agent", id: this.ctx.id.toString() },
      }),
    ],
  });
}
```

### 3.3 ファイルシステム操作

```typescript
using ws = await getWorkspace(env.Agent.get(id));

// ファイル書き込み
await ws.fs.writeFile("/notes/todo.md", "- [ ] ship it\n");
await ws.fs.writeFile("/data/blob.bin", new Uint8Array([1, 2, 3]));
await ws.fs.writeFile("/uploads/big.csv", request.body!);

// ファイル読み取り
const todo = await ws.fs.readFile("/notes/todo.md", "utf8");
const stream = await ws.fs.readFile("/uploads/big.csv");

// ディレクトリ操作
await ws.fs.mkdir("/notes/daily", { recursive: true });
for (const entry of await ws.fs.readdir("/notes")) {
  console.log(entry.isDirectory ? `d ${entry.name}` : `f ${entry.name}`);
}

// 削除と検索
await ws.fs.rm("/notes/daily", { recursive: true });
const hits = await ws.fs.grep("TODO", "/", { ignoreCase: true });
```

### 3.4 コマンドとコードの実行

```typescript
// シェルコマンド実行
using run = await ws.runtime.exec("ls -la /workspace", { encoding: "utf8" });
const { stdout, exitCode } = await run.result();

// リアルタイムストリーミング出力（Server-Sent Events）
async fetch(request: Request) {
  const run = await ws.runtime.exec("npm test", { encoding: "utf8" });

  const sse = run.pipeThrough(
    new TransformStream({
      transform(event, controller) {
        const frame = `event: ${event.name}\ndata: ${JSON.stringify(event.value)}\n\n`;
        controller.enqueue(new TextEncoder().encode(frame));
      },
    }),
  );

  return new Response(sse, {
    headers: {
      "content-type": "text/event-stream",
      "cache-control": "no-cache",
    },
  });
}
```

### 3.5 Git操作

```typescript
import { Workspace } from "@cloudflare/computer";
import { createGitClient } from "@cloudflare/computer/git";

const ws = new Workspace({
  storage: ctx.storage,
  git: createGitClient(),
  defaultGitIdentity: { name: "Agent", email: "agent@example.test" },
});

await ws.git.clone({ url: "https://github.com/example/repo.git" });
await ws.fs.writeFile("/notes.md", "hello");
await ws.git.add({ paths: ["notes.md"] });
await ws.git.commit({ message: "add notes" });
```

### 3.6 AIエージェントツール

```typescript
import { createAITools } from "@cloudflare/computer/tools";

const tools = createAITools({
  workspace,
  read: { maxBytes: 32 * 1024, maxLines: 800 },
  shell: {
    defaultBackend: "shell",
    backends: {
      shell: { description: "Fast Worker shell with built-in text commands." },
      container: { description: "Full Linux userland in a Cloudflare Container." },
    },
  },
});

// AI SDKにツールを渡す
const result = await generateText({
  model: openai("gpt-4"),
  tools,
  prompt: "このコードベースを分析してください",
});
```

---

## 4. コアアーキテクチャの深層解析

### 4.1 パッケージ構造

Cloudflare Computerは以下のパッケージを含む小さなmonorepoです：

| パッケージ | 用途 |
|------------|------|
| `@cloudflare/dofs` | Durable Object SQLiteサポートバーチャルファイルシステム |
| `@cloudflare/computer-rpc` | capnwebワイヤタイプとサーバー/クライアントヘルパー |
| `@cloudflare/computerd` | FUSEマウント + RPCサーバーデーモン |
| `@cloudflare/computer` | トップレベルパッケージ、Durable Objects用Workspace門面 |
| `@cloudflare/computer/tools` | AI SDKツール：read、write、edit、ls、exec |

### 4.2 同期プロトコル

Cloudflare Computerはコンテンツアドレス指定blobキャッシュとリビジョンベースの変更追跡を使用します：

```
Durable Object (SQLite)
    ↓ プッシュ
同期プロトコル
    ↓
実行環境 (Container/Worker)
    ↓ プル
Durable Object (SQLite)
```

主要機能：
- **コンテンツアドレス指定**：blobハッシュを使用した重複排除
- **LRUキャッシュ**：メモリ使用量を制限
- **バッファ付き書き込み**：FUSE用の書き込みバッファを提供
- **アトミック操作**：データ整合性を確保

### 4.3 FUSEマウントメカニズム

ContainerバックエンドはFUSE（ユーザー空間ファイルシステム）を使用してSQLite状態をコンテナに投影します：

```
Container
    ↓ FUSEマウント
computerdデーモン
    ↓ capnweb RPC
Durable Object
    ↓ SQLite
永続ストレージ
```

`computerd` は以下を行うデーモンです：
1. FUSEファイルシステムをマウント
2. HTTP/WebSocket RPCを通じてDurable Objectと通信
3. ファイルシステムの変更を同期

### 4.4 性能特性

公式ベンチマークによると：

- **メタデータ集中型操作**：FUSEマウントが実ディスクを上回る
- **大規模連続I/O**：実ディスクにやや劣る
- **コンテナファイルシステム**：メモリ内に保持（~10 GB制限、DOと共有）
- **コールドスタート**：Containerは遅く、Worker Shellは高速

---

## 5. 洞察のまとめ

### 5.1 Cloudflare Computerが重要な理由

Cloudflare ComputerはAIエージェントインフラストラクチャの重要な進化を代表します。これは単なるファイルシステムではなく、完全な「エージェントコンピュータ」コンセプトです。

**3つのコア洞察**：

1. **ワークスペースはエージェントのホーム**：永続ワークスペースにより、エージェントは真の状態管理能力を獲得
2. **プラガブルバックエンド**：柔軟な実行エンジンが異なるワークロードをサポート
3. **同期プロトコル**：データ整合性を確保し、複雑なコラボレーションシナリオをサポート

### 5.2 他のツールとの比較

| 機能 | Cloudflare Computer | GitHub Codespaces | Replit | Vercel |
|------|---------------------|-------------------|--------|--------|
| **永続化** | ✅ SQLite in DO | ❌ 一時的 | ✅ | ❌ |
| **実行バックエンド** | ✅ 3種類 | ✅ コンテナ | ✅ コンテナ | ❌ |
| **AIツール** | ✅ 内蔵 | ❌ | ❌ | ❌ |
| **Git統合** | ✅ isomorphic-git | ✅ | ✅ | ✅ |
| **コスト** | 使用量ベース | 時間ベース | 時間ベース | デプロイベース |
| **オープンソース** | ✅ MIT | ❌ | ❌ | ❌ |

### 5.3 ユースケース

**最適**：
- 永続状態を必要とするAIエージェント
- コード実行が必要なエージェントワークフロー
- ファイルシステム操作が必要な自動化タスク
- Git操作が必要なコード管理シナリオ

**あまり適さない**：
- 大規模monorepo（10 GB制限）
- 高I/O集約型ワークロード
- 完全Linux環境を必要とする複雑なアプリケーション

### 5.4 設計哲学のまとめ

Cloudflare Computerの設計哲学は以下のように要約できます：

1. **すべてはワークスペース**：統一抽象化レイヤー、すべての操作がそれを通じて行われる
2. **プラガブルバックエンド**：必要に応じて実行エンジンを選択、柔軟なワークフローをサポート
3. **永続化優先**：状態は資産であり、再起動後も変更されない
4. **AIネイティブ**：内蔵エージェントツール、AI SDK統合をサポート
5. **クラウドネイティブ**：Cloudflareのグローバルネットワークとエッジコンピューティング能力を活用

---

## 6. ロードマップ

プロジェクトのトレンドとAIエージェントインフラストラクチャの進化に基づいて：

### 短期（3-6ヶ月）
- より多くの実行バックエンドサポート
- 改善された同期プロトコル性能
- より豊富なAIツールセット

### 中期（6-12ヶ月）
- マルチエージェント協調ワークスペース
- エンタープライズグレードのセキュリティとコンプライアンス機能
- メインストリームAIフレームワークとの深い統合

### 長期（1-2年）
- 完全自律エージェントコンピューティングプラットフォーム
- 組織横断エージェント協調ネットワーク
- AI駆動ソフトウェアエンジニアリングインフラ

---

## 7. 結論

Cloudflare Computerは、AIエージェントに永続的でポータブルな作業ディレクトリを提供する画期的なAIエージェントインフラストラクチャです。SQLite永続化、プラガブル実行バックエンド、同期プロトコルを通じて、これは単なるファイルシステムではなく、完全な「エージェントコンピュータ」コンセプトです。

**コアバリュー**：
- **永続ワークスペース**：再起動後も状態を保持
- **プラガブルバックエンド**：柔軟な実行エンジン
- **AIネイティブツール**：内蔵エージェントツールサポート
- **クラウドネイティブアーキテクチャ**：Cloudflareグローバルネットワークを活用

**Cloudflare Computerを選ぶ理由**：
- オープンで透明（MITライセンス）
- 真の永続状態管理
- 柔軟な実行バックエンド選択
- 内蔵AIエージェントツール

**今すぐ开始**：
```bash
# インストール
npm install @cloudflare/computer

# サンプルを確認
git clone https://github.com/cloudflare/computer.git
cd computer/examples/worker-shell
npm install
npm start
```

---

> **免責事項**：この記事はCloudflare Computerの公開ドキュメントと技術分析に基づいており、包括的な技術的洞察と実用的ガイドを提供することを目的としています。注意：このプロジェクトは現在プレビューステージにあり、APIは不安定で本番環境での使用は推奨されません。
