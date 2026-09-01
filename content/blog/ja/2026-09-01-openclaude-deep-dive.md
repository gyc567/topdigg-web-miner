---
title: "OpenClaude：オープンソースのクロスマデル coding-agent CLI 完全解析"
date: "2026-09-01"
description: "Gitlawb/openclaude プロジェクトの深掘り：任意のモデルプロバイダをサポートするオープンソース coding-agent CLI。アーキテクチャ、設計哲学、核心機能、実践ガイドを详细介绍"
tags: ["OpenClaude", "AI Agent", "Coding Agent", "CLI", "Ollama", "Claude"]
categories: ["AI", "Developer Tools", "Open Source"]
---

# OpenClaude：オープンソースのクロスマデル coding-agent CLI 完全解析

## はじめに

Claude Code がますます多くの開発者の主力ツールとなる中、オープンソースプロジェクトが静かにゲームを変えようとしています：**OpenClaude**（Gitlawb/openclaude）。

核心理念は——**runs anywhere, uses anything**。特定のモデルベンダーに縛られず、1つのCLIでクラウドAPIとローカルモデルの両方に接続。OpenAI互換インターフェース、Gemini、GitHub Models、Codex、Ollamaなど20以上のバックエンドをサポートしながら、ターミナルファーストのワークフローを維持します。

---

## 1. プロジェクト概要

### 1.1 OpenClaudeとは

OpenClaudeは、GitLawbチームが開発・メンテナンスするオープンソースのcoding-agentコマンドラインツールです。

> **1つのCLIでクラウドAPIとローカルモデルバックエンドを跨ぐ——プロバイダーごとにツールを持つ必要なし**

主な特徴：
- サポートモデル対応の1つのCLI（20+プロバイダー）
- ガイド付きプロバイダー設定＋保存プロファイル
- 完全なcoding-agentワークフロー
- バンドルされたVS Code拡張
- Buddyピクセルアートコンパニオンシステム

### 1.2 サポートされるモデルプロバイダー

| カテゴリ | プロバイダー |
|---------|-------------|
| OpenAI互換 | OpenAI, OpenRouter, DeepSeek, Groq, Mistral, LM Studio |
| 専用API | Gemini, GitHub Models, Codex OAuth, Codex |
| ローカル推論 | Ollama, Atomic Chat, LM Studio |
| 集約ゲートウェイ | AI/ML API, Concentrate, LLMTR, ApiSmart, Fireworks AI |
| 中国向け | Z.AI GLM Coding Plan, Xiaomi MiMo, LongCat (美団), NEAR AI |
| クラウド | AWS Bedrock, Vertex AI, Cloudflare Workers AI, Microsoft Foundry |

---

## 2. コア技術アーキテクチャ

### 2.1 設計哲学：プロバイダー抽象レイヤー

OpenClaudeの中核アーキテクチャは**プロバイダー抽象レイヤー**です。

**主要な設計原則：**

1. **プロバイダー着脱可能**：OpenAI互換APIまたはAnthropicネイティブAPIをサポートするサービスはすべてシームレスに統合
2. **環境変数優先**：すべての設定を環境変数を介して注入、コード変更不要
3. **設定ファイル永続化**：`/provider`コマンドがプロファイルを`~/.openclaude-profile.json`に保存

### 2.2 Repo Map：コードベースインテリジェンス

OpenClaudeは**Repo Map**機能を導入し、AIモデルがセッション開始時にコードベースの構造的理解を持ちます。

**動作原理（5ステップ）：**

1. **ファイル列挙**：`git ls-files`で追跡・未追跡ファイルをリスト
2. **シンボル抽出**：tree-sitterでソースファイルを解析し、関数・クラス・型・インターフェース定義を抽出
3. **参照グラフ**：参照回数×IDFで重み付けされた有向グラフを構築
4. **PageRank**：構造的重要度でファイルをランキング
5. **レンダリング**：トークンバジェットに達するまでランキングファイルをトップダウンで出力

### 2.3 Agentルーティングとステップ制限

OpenClaudeは**タイプ별로Agentを異なるモデルにルーティング**することをサポート。

```json
{
  "agentModels": {
    "deepseek-v4-flash": { "base_url": "...", "api_key": "..." }
  },
  "agentRouting": {
    "Explore": "deepseek-v4-flash",
    "default": "gpt-4o"
  }
}
```

**ステップ制限（maxSteps）：**

```markdown
---
name: bounded-researcher
maxSteps: 8
---

You are a focused research agent.
```

---

## 3. クイックスタートガイド

### 3.1 インストール

```bash
npm install -g @gitlawb/openclaude@latest
```

### 3.2 OpenAIでのクイックスタート

```bash
export CLAUDE_CODE_USE_OPENAI=1
export OPENAI_API_KEY=sk-your-key-here
export OPENAI_MODEL=gpt-4o
openclaude
```

### 3.3 ローカルOllamaでのクイックスタート

```bash
ollama pull qwen2.5-coder:7b

export CLAUDE_CODE_USE_OPENAI=1
export OPENAI_BASE_URL=http://localhost:11434/v1
export OPENAI_MODEL=qwen2.5-coder:7b
openclaude
```

---

## 4. 設計哲学の要約

### 4.1 プロバイダー非ロックイン
20以上のプロバイダー対応。OpenAI互換レイヤー＋Anthropicネイティブレイヤーの二重抽象화로実現。

### 4.2 ターミナルファースト
すべての機能がCLIで提供。開発者はすでにターミナルにいる、ツールがこちらに来る。

### 4.3 プログレッシブ複雑性
ゼロ設定で開始。1つの`openclaude`コマンドで動作。使用，逐步的にカスタマイズ。

### 4.4 ローカルファースト、でもローカルだけじゃない
Ollama/Atomic Chat/LM StudioでAPIコストゼロ、オフライン、プライバシー保護。でもクラウドAPIもサポート。

---

## 5. 結論

OpenClaudeは異なる哲学的代表：**より良いClaude Codeを作るのではなく、どんなモデルでも差別しないAgent CLIを作る**。

核心価値：**自由**。プロバイダーロックインなし、エコシステム束縛なし、各モデルの独立したツールチェーン維持不要。

**関連リソース：**
- GitHub: https://github.com/Gitlawb/openclaude
- npm: https://www.npmjs.com/package/@gitlawb/openclaude
- Discord: https://discord.gg/k68zFR6AcB
