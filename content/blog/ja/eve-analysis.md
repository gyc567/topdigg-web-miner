---
title: "Eve：Vercel製オープンソースAgentフレームワーク——ディレクトリ構造でAIエージェントを管理"
date: "2026-08-16"
description: "Vercel EveオープンソースAgentフレームワークの深度解析——「AgentsのためのNext.js」、ディレクトリ構造によるエージェント管理"
tags:
  - Eve
  - Vercel
  - AI Agent
  - Agentフレームワーク
  - オープンソース
  - ワークフロー
  - MCP
  - TypeScript
categories:
  - AI Agent
  - Agentフレームワーク
  - Vercelオープンソース
  - TypeScript
  - ワークフローエンジン
---

# Eve：Vercel製オープンソースAgentフレームワーク——ディレクトリ構造でAIエージェントを管理

## プロジェクト背景とコア問題

### AI Agent開発の基礎施設課題

AI Agent開発分野では、開発者が普遍的な問題に囲われています：**Agentループを構築した後、どう基礎施設の課題に対処するか？**

| 痛点 | 説明 | 既存ソリューションの不足 |
|------|------|------------------------|
| **コード組織が乱雑** | Agentのコード、設定、命令が散在 | 統一されたプロジェクト構造がない |
| **デプロイが複雑** | 状態管理、永続化、エラー回復が困難 | 大量のカスタム開発が必要 |
| **マルチチャネル統合が困難** | Slack、Discord、Telegram統合が複雑 | 各チャネルに個別の適応が必要 |
| **モデル切り替えが不柔軟** | 单一プロバイダに依存、リスク集中 | 柔軟なモデル切り替えメカニズムがない |
| **サブエージェント管理** | 複雑なタスクの分解と委任が困難 | 標準化されたアーキテクチャがない |

### Eveの誕生

> **"Eve — AgentのためのNext.js体験"**

EveはVercelが2025年6月にリリースした**オープンソースAgent構築フレームワーク**で、Web開発分野で十年かけて蓄積したベストプラクティスをAI Agent開発に取り入れます：

```
┌─────────────────────────────────────────────────────────────────┐
│                      Eve コアポジショニング                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  🎯 位置づけ:      "AgentsのためのNext.js"                        │
│  🏢 開発元:        Vercel                                        │
│  📅 リリース:      2025年6月                                     │
│  📦 言語:          TypeScript                                    │
│  🛠️ アーキテクチャ:  ディレクトリ構造がAgent                      │
│  🔌 統合:          MCP、Slack、Discord、マルチチャネルサポート      │
│  ⚙️ エンジン:       Vercel Workflow SDKベース                     │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## プロジェクト概要

### Eveとは？

Eveは**AI Agentを構築・デプロイするためのプロダクショングレードフレームワーク**で、その核心理念は各Agentを独立したディレクトリとして扱い、関連するすべてのコード、設定、命令を一元管理することです。

### 主要機能

| 機能 | 説明 |
|------|------|
| 🗂️ **ディレクトリ即Agent** | 各Agentは完全な定義を含む独立ディレクトリ |
| 📝 **Markdown命令** | システムプロンプトはMarkdown形式で、直感的で保守が容易 |
| 🔧 **ツール即ファイル** | 各ツールは独立したTypeScriptファイル、自动登録 |
| 🔄 **自動モデル切り替え** | AI Gatewayがプロバイダのフェイルオーバーを自動処理 |
| 💬 **マルチチャネルサポート** | 組み込みSlack、Discord、Teams、Telegramサポート |
| ⚡ **ワークフロー駆動** | 永続化ワークフローに基づき、一時停止/再開/スケジュール対応 |
| 🔌 **MCP統合** | MCPサーバーを通じて外部ツールに接続 |
| 🏗️ **サブエージェントサポート** | Agent Teamの構築をサポート、複雑なタスクを分解 |

---

## アーキテクチャ設計深度解析

### 核心理念：ディレクトリ即Agent

Eveの最も重要な設計判断は**ディレクトリ構造をAgentを組織するコア方法**として採用することです：

```
my-agent/
├── package.json           # プロジェクト依存関係
├── tsconfig.json          # TypeScript設定
├── .env.example           # 環境変数テンプレート
└── agent/
    ├── agent.ts           # Agentコアロジック
    ├── instructions.md    # システム命令（Markdown）
    ├── model.ts           # モデル設定
    ├── channels/          # チャネル設定
    │   ├── eve.ts         # Eve組み込みチャネル
    │   ├── slack.ts       # Slack統合
    │   └── discord.ts     # Discord統合
    └── tools/             # ツール定義
        ├── search.ts      # 検索ツール
        └── send.ts        # メッセージ送信ツール
```

### ワークフローエンジン

Eveの基盤は**VercelのオープンソースWorkflow SDK**に基づいており、以下の能力をもたらします：

- **永続的状態**: セッションは任意の手順で一時停止と再開が可能
- **エラー回復**: 失敗したワークフローはチェックポイントからリトライ
- **スケジュール実行**: タイマータスクと遅延実行をサポート
- **并发制御**: 組み込み并发制限、リソース枯渇を防止

### モデルとAI Gateway

Eveは**AI Gateway**を通じてモデルの統一管理与と自動フェイルオーバーを実現します：

```typescript
// agent/model.ts
export default defineModel({
  provider: "openai",
  model: "gpt-4o",
});
```

### ツールシステム

```typescript
// agent/tools/search.ts
export const search = defineTool({
  name: "search",
  description: "Search the web for information",
  parameters: z.object({
    query: z.string().describe("The search query"),
  }),
  execute: async ({ query }) => {
    const results = await performSearch(query);
    return results;
  },
});
```

---

## 設計Philosophy

### コア原則

#### 1. 設定より約束（Convention over Configuration）

> **"Next.jsのように、約束を使用して意思決定の負担を軽減し、開発者がビジネスロジックに集中できるようにする。"**

#### 2. ディレクトリ即境界（Directory as Boundary）

> **"1つのディレクトリがAgentの完全な境界を定義する——コード、設定、命令、チャネルを含む。"**

#### 3. ワークフロー優先（Workflow First）

> **"すべてのセッションは永続化ワークフローであり、信頼性と回復性が組み込みであることを意味する。"**

#### 4. チャネル抽象化（Channel Abstraction）

> **"Agentのコアロジックはチャネルから分離され、同じAgentが任意のチャネルに接続できる。"**

---

## クイックスタート教程

### 環境要件

| 要件 | 説明 |
|------|------|
| **Node.js** | 24.0.0 以上 |
| **パッケージマネージャー** | npm、pnpm、または bun |
| **APIキー** | Vercel AI Gateway APIキー |

### Eve CLIのインストール

```bash
# npmを使用
npm install -g eve-cli

# pnpmを使用
pnpm add -g eve-cli

# インストール確認
eve --version
```

### 最初のAgentを作成

#### ステップ1：プロジェクトを初期化

```bash
eve init my-first-agent
cd my-first-agent
npm install
```

#### ステップ2：環境変数を設定

```bash
cp .env.example .env
# .envファイルを編集、APIキーを追加
```

#### ステップ3：システム命令を作成

```markdown
<!-- agent/instructions.md -->
# 私の最初のAgent

あなたはユーザーの質問を助ける友好的なAIアシスタントです。
```

#### ステップ4：モデルとツールを定義

```typescript
// agent/model.ts
export default defineModel({
  provider: "openai",
  model: "gpt-4o",
});
```

#### ステップ5：Agentを実行

```bash
eve dev
```

---

## ハンズオン教程：マルチチャネル客服Agentの構築

### プロジェクト構造

```
customer-service-agent/
├── package.json
├── tsconfig.json
└── agent/
    ├── agent.ts
    ├── instructions.md
    ├── model.ts
    ├── channels/
    │   ├── slack.ts
    │   └── discord.ts
    └── tools/
        ├── lookup-order.ts
        ├── faq.ts
        └── escalate.ts
```

### 完全実装

#### システム命令

```markdown
<!-- agent/instructions.md -->
# 客服Agent

あなたはプロのカスタマーサービス代表です。

## 利用可能なツール
- `lookup_order`: 注文ステータス查询
- `faq`: よくある質問への回答
- `escalate`: 人間によるサポートへの転送
```

#### 注文查询ツール

```typescript
// agent/tools/lookup-order.ts
export const lookupOrder = defineTool({
  name: "lookup_order",
  description: "Look up order status by order ID",
  parameters: z.object({
    orderId: z.string().describe("The order ID"),
  }),
  execute: async ({ orderId }) => {
    const order = await fetchOrder(orderId);
    return order;
  },
});
```

#### Agentコアロジック

```typescript
// agent/agent.ts
export default new EveAgent({
  name: "customer-service",
  tools: [lookupOrder, faq, escalate],
});
```

---

## マルチエージェントとサブエージェント

### Agent Teamの構築

Eveは複雑なタスクを複数のサブエージェントに分解することをサポートします：

```
┌─────────────────────────────────────────────────────────────┐
│                    Agent Team アーキテクチャ                  │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│                    メインAgent (マネージャー)                  │
│                         │                                    │
│          ┌──────────────┼──────────────┐                    │
│          ▼              ▼              ▼                    │
│    ┌──────────┐   ┌──────────┐   ┌──────────┐             │
│    │サブAgentA │   │サブAgentB │   │サブAgentC │             │
│    │(研究)     │   │(分析)     │   │(レポート) │             │
│    └──────────┘   └──────────┘   └──────────┘             │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## チャネル統合詳細

### サポートされているチャネル

| チャネル | 説明 | 設定要件 |
|----------|------|---------|
| **Eve** | 組み込みCLIチャットインターフェース | 追加設定不要 |
| **Slack** | エンタープライズチームコラボレーション | Bot Token、Signing Secret |
| **Discord** | コミュニティとゲームプラットフォーム | Bot Token |
| **Teams** | Microsoftコラボレーションプラットフォーム | App ID、App Password |
| **Telegram** | インスタントメッセージング | Bot Token |

---

## まとめと結論

### コアインサイト

#### 1. フレームワークの本質は約束

Eveの最も重要な貢献はコードではなく、**明確な約束体系**です：

> **"約束は意思決定の負担を軽減し、開発者が本当に重要なビジネスロジックに集中できるようにする。"**

#### 2. ディレクトリ構造は複雑性を組織化する利器

「ディレクトリ」をAgentの境界として使用するは、シンプルで強力な設計判断です：

- **一貫性**: すべての開発者がどこにあるか知っている
- **合成可能性**: ディレクトリはネスト可能、Agentは合成可能
- **バージョン管理可能**: Agent全体をバージョン控制和公開 가능

#### 3. ワークフローは信頼性の基盤

永続化ワークフローは単なる「状態保存」ではなく、以下を意味します：

| 能力 | 価値 |
|------|------|
| **エラー回復** | 失敗後チェックポイントからリトライ |
| **一時停止/再開** | 時間がかかるタスクは分部実行可能 |
| **スケジュール実行** | 特定时刻に実行するようにスケジュール可能 |
| **并发制御** | リソース枯渇を防止 |

### ユースケース

✅ **Eveを強く推奨**：

- プロダクショングレードAgentを迅速に構築する必要があるチーム
- マルチチャネル統合が必要なエンタープライズアプリケーション
- 信頼性の高い状態管理が必要な複雑な会話シナリオ
- Next.js/Vercelエコシステムに熟悉している開発者

---

## リソースリンク

### 公式サイト

| リソース | リンク |
|---------|--------|
| 🌐 公式サイト | https://vercel.com/ |
| 💻 GitHubリポジトリ | https://github.com/vercel/eve |
| 🐦 Twitter | @vercel |

### インストール

| プラットフォーム | コマンド |
|-----------------|---------|
| npm | `npm install -g eve-cli` |
| pnpm | `pnpm add -g eve-cli` |

### 環境要件

| 要件 | 最小バージョン |
|------|---------------|
| Node.js | 24.0.0+ |

---

## 結論

Eveは**AI Agent開発フレームワークの重要な方向性を代表しています——Web開発分野で蓄積されたベストプラクティスをAgent開発に取り入れる**。

> **"Next.jsはWeb開発の方法をを変え、EveはAgent開発の方法をを変えつつある。"**

---

*この記事はVercel Eveオープンソースプロジェクトに基づいています。*

**Sources:**
- [GitHub - vercel/eve](https://github.com/vercel/eve)
- [Vercel Agentic Infrastructure](https://vercel.com/)
