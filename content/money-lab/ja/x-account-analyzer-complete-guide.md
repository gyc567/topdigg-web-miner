---
title: "Twitterアカウント逆分析ツール：競合のフォロワー増加ロジックを解明"
date: "2026-10-02"
description: "x-account-analyzerスキル完全解読：6ステップ分析プロセス、複数データソースマトリックス、コンテンツ分類、フォロワー増加帰属モデル。"
tags:
  - Twitter運用
  - アカウント分析
  - フォロワー戦略
  - AIツール
  - 競合分析
categories:
  - スキル変現
  - ツール推薦
---

# Twitterアカウント逆分析ツール：競合のフォロワー増加ロジックを解明

@handleをいただければ、「なぜ彼はフォロワーを伸ばせたか＋どう複製できるか」の全链路レポートを差し上げます。

それがx-account-analyzer做的事。

great-skill-centerプロジェクト（github.com/gyc567/great-skill-center）から、花叔著、AI Native独立開発者、公众号「花叔」30万+フォロワー。

## 1. 概要：逆エンジニアリングのフォロワー分析

競合アカウントの分析は大多数が「彼は何を投稿するか」という表層に留まる。

x-account-analyzerの思路は異なる：「彼は何を投稿するか」ではなく「彼はどうやってフォロワーを伸ばしたか」と「我怎么複製」。

核心定位：**@handleをいただければ、全链路分析レポートを差し上げます。**

## 2. コア機能

### 2.1 6ステップ分析フロー

```
@handle入力
      │
[Step 1] 基礎情報採集 ─── twitter user + Exa検索 + SuperX/SocialBlade
[Step 2] Tweet全量取得 ─── twitter user-posts + search + Exa
[Step 2.5] 歴史フォロワー増加曲線 ─── fch (Wayback Machine)
[Step 3] コンテンツ分類（AI駆動）
[Step 4] エンゲージメントデータ相関分析
[Step 5] フォロワー増加パターンと帰因
[Step 6] 複製可能経験抽出
      │
[出力] 完全分析レポート
```

### 2.2 複数データソースマトリックス

| データソース | ツール | 取得内容 | 必須？ |
|-------------|--------|----------|--------|
| Tweet+エンゲージメント | `twitter user-posts` | 全Tweet、likes/RTs/replies | ✅ |
| 基礎情報 | `twitter user` | フォロワー数、bio、参加日 | ✅ |
| 歴史的增加 | `fch` (Wayback Machine) | 歴史的フォロワー数スナップショット | 強く推薦 |
| Tweet検索 | `twitter search --from` | 時間/タイプ別Tweet | ✅ |
| 全ネット伝播 | `mcporter` → Exa | 広く共有されたTweet | 推薦 |

### 2.3 コンテンツ分類（AI駆動）

各Tweetに以下でタグ付け：

**コンテンツタイプ**：技術/意見/個人的物語/チュートリアル/リソース/質問/ホット取り/製品/日常/ユーモア/データ報告/長文

**トーン**：励まし/中立/論争的/共感/的好奇/批判

**エンゲージメントフック**：質問/立場/リソース/サスペンス/感情/データ衝撃

### 2.4 フォロワー増加帰因モデル

```
成長ドライバー分析：
├── コンテンツ：高エンゲージメントタイプ、Thread vs 短推効率、話題効果
├── 行動：投稿頻度、返信頻度、投稿時間ウィンドウ
├── 関係：大VRT回数、サークル討論頻度、引用/返信チェーン
├── 戦略：固定コンテンツシリーズ、規律的エンゲージメント、bio最適化
└── 外部：メディア報道、クロスプラットフォーム誘導、イベント駆動急増
```

## 3. チュートリアル

### 3.1 環境セットアップ

```bash
pipx install twitter-cli
pipx install fch
npm i -g mcporter
```

### 3.2 Twitter認証

```bash
twitter status
```

未認証？Cookie-Editor拡張をインストールし、x.comから`auth_token` + `ct0`をコピー。

中国ユーザー：
```bash
export HTTP_PROXY=http://127.0.0.1:7890
export HTTPS_PROXY=http://127.0.0.1:7890
```

### 3.3 完全分析実行

```bash
twitter user HANDLE --json
twitter user-posts HANDLE -n 200 --json -o /tmp/tweets.json
fch --st=$(date -v-1y +%Y%m%d)000000 --et=$(date +%Y%m%d)000000 --freq=2592000 HANDLE
```

## 4. デザイン哲学：逆エンジニアリング

x-account-analyzerの核心理念は**逆エンジニアリング**。

大多数の運用者は競合アカウントを見て「彼は何を投稿するか」と問う。

真の成長ハッカーは「彼はどうやってフォロワーを伸ばしたか」と「我可以複製するか」と問う。

これらは完全に異なる層の問題だ。

> フォロワー増加 = コンテンツ戦略 × 行動リズム × 関係ネットワーク × 外部タイミング

x-account-analyzer做的就是、この4つの変数の реальныеデータを分解して見せ、どの変数の重みが最も高いかと、あなたはどう改变するかを教えてくれる。

競合のフォロワー数を見つめるのをやめよう。フォロワー増加ロジックを解体することを学べ。

## 関連リソース

- GitHub：github.com/gyc567/great-skill-center
- スキル：skills/x-account-analyzer
- 著者公众号：花叔（30万+フォロワー）

*WeChat公式アカウントより首发。*
