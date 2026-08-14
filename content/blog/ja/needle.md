---
title: "Needle 2：极致轻量のローカル AI ツール呼び出しモデル——45M パラメータでエッジインテリジェンスを実現"
date: "2026-08-14"
description: "Needle 2 オープンソースプロジェクトの深度解析——45M パラメータのローカル AI モデル、14MB バイナリ、約28MB RAM消費、専門的なツール呼び出しと構造化データ抽出をサポート"
tags:
  - Needle
  - AI モデル
  - エッジコンピューティング
  - ツール呼び出し
  - ローカル展開
  - Cactus Quants
  - 構造化抽出
  - デバイス上 AI
categories:
  - AI モデル
  - エッジコンピューティング
  - ローカル AI
  - ツール呼び出し
  - モデル圧縮
---

# Needle 2：极致轻量のローカル AI ツール呼び出しモデル——45M パラメータでエッジインテリジェンスを実現

## プロジェクト背景とコア問題

### エッジデバイスの AI ジレンマ

AI 時代において、私たちはますます顕著な矛盾に直面しています：**強力な AI 機能とデバイスのリソース制限の間の衝突**です。

| デバイスタイプ | リソース制限 | AI ニーズ |
|--------------|------------|----------|
| スマートフォン | 制限された RAM と計算力 | リアルタイム応答、プライバシー |
| ウェアラブル | 超低電力 | 常にオン、快速応答 |
| スマートホーム | コスト重視、オフライン | ローカル制御、低遅延 |
| ロボット | リアルタイム知覚 | 快速応答、環境対話 |

### Needle 2 の誕生

Needle 2 チームは深入った研究の結果、別の道を選択しました：

> **「小さなモデルに大規模モデルのふりをさせるのではなく、小さなモデルが最も得意的分野で最も優れたものにする。」**

これが Needle 2 —— 专门为**ツール呼び出し、设备使用、構造化データ抽出**に最適化された最先进的极小言語モデル。

---

## プロジェクト概述

### Needle 2 とは？

Needle 2 は **45M パラメータの AI モデル**で、以下の专门化：
- **ツール呼び出し (Tool Calling)**
- **设备使用 (Device Use)**
- **構造化データ抽出 (Structured Data Extraction)**

```
┌─────────────────────────────────────────────────────────────┐
│                    Needle 2 コア指標                           │
├─────────────────────────────────────────────────────────────┤
│  ⚡ パラメータ:    45M (GPT-4 の約 1T と比べる)                 │
│  📦 モデルサイズ:  14MB (単一ファイル展開)                     │
│  💾 メモリ使用量:  ~28MB (256-token スライドウィンドウ)         │
│  🔄 推論:         完全ローカル、网络依存なし                   │
│  🎯 専門:          ツール呼び出し、構造化抽出                   │
│  📊 性能:         70 倍大きいモデルと競争                      │
└─────────────────────────────────────────────────────────────┘
```

### 主要機能

| 機能 | 説明 |
|------|------|
| 🖥️ **自己完結型展開** | 重みが一つのファイルに埋め込まれ、推論時にネットワーク不要 |
| 📝 **シンプルな API** | テキスト入力、ツールスキーマに基づく構造化 JSON 出力 |
| 🎯 **置信度ゲート** | 較正された置信度スコア、行動/エスカレーションの判断材料 |
| 🔍 **ツール検索** | 内蔵検索システム、大規模カタログから top-5 関連ツールを抽出 |
| 💾 **境界メモリ** | 256-token スライドウィンドウ、会话長さに関係なく約 28MB |
| 🧩 **モジュール式ツール** | デコレータベースのツール定義、Python 関数の簡単な統合 |
| 📊 **構造化抽出** | Pydantic モデルサポート、構造化データ出力 |

---

## 技術アーキテクチャ深度解析

### アーキテクチャ：Simple Attention Networks

Needle 2 は革新的なアーキテクチャ **Simple Attention Networks (SAN)** に基づく：

```
┌─────────────────────────────────────────────────────────────┐
│              Simple Attention Networks アーキテクチャ           │
├─────────────────────────────────────────────────────────────┤
│  ┌────────────────────────────────────────────────────┐   │
│  │                   コアコンポーネント                    │   │
│  ├────────────────────────────────────────────────────┤   │
│  │  1. Hadamard MLP (FFN の代替)                       │   │
│  │  2. Grouped Query Attention (GQA)                    │   │
│  │  3. Engram Key-Value Memory                        │   │
│  │  4. Multi-Lane Hyper-Connections                   │   │
│  └────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### 主要技術：Cactus Quants (CQ2-bit 圧縮)

Needle 2 は **Cactus Quants** の革命的量子化技術を使用し、**2-bit 圧縮**を実現：

```
量子化比較：

┌───────────────┬───────────────┬─────────────────────────────┐
│    精度        │   パラメータ   │        メモリ                 │
├───────────────┼───────────────┼─────────────────────────────┤
│  FP32 (32-bit) │   180MB      │         高                   │
│  FP16 (16-bit) │   90MB       │         中                   │
│  INT8 (8-bit)  │   45MB       │         低                   │
│  CQ2 (2-bit)   │   ~14MB      │      极低 ✓                 │
└───────────────┴───────────────┴─────────────────────────────┘
```

---

## 核心機能详解

### 1. ツール呼び出しシステム

```python
import needle

@needle.tool
def get_weather(city: str) -> dict:
    "Get the current weather for a city."
    return {"city": city, "temp_c": 27, "sky": "clear"}

agent = needle.Needle(tools=[get_weather])
result = agent.run("what's it like in Lagos right now?")
print(result["results"])
```

### 2. 信頼度ゲート

```python
result = agent.run("what's it like in Lagos?")

if result["confidence"] > 0.8:
    # 高信頼度：直接使用
    print(result["results"])
else:
    # 低信頼度：更大モデルにエスカレーション
    print("自信がない...")
```

### 3. ツール検索システム

```python
tools = [get_weather, get_time, search_web, send_email, ...]  # 100+ ツール

agent = needle.Needle(tools=tools)
result = agent.run("I need to schedule a meeting")
# Needle は 100+ ツールから関連ツールを自動選択
```

### 4. 構造化データ抽出

```python
from pydantic import BaseModel
import needle

class UserProfile(BaseModel):
    name: str
    email: str
    age: int

extractor = needle.Needle()
profile = extractor.extract(
    "John is 28, email is john@example.com",
    schema=UserProfile
)
```

---

## クイックスタート

### インストール

```bash
pip install cactus-needle

# GPU 加速 (CUDA)
pip install "cactus-needle[gpu]"

# Apple Silicon 加速
pip install "cactus-needle[metal]"
```

### 基本的なツール呼び出し

```python
import needle

@needle.tool
def get_weather(city: str) -> dict:
    """Get the current weather for a city."""
    return {"city": city, "temp_c": 22, "condition": "sunny"}

agent = needle.Needle(tools=[get_weather])
response = agent.run("What's the weather in Tokyo?")
print(response["results"])
```

### Playground

```bash
needle playground
```

---

## 微調整教程

### LoRA 微調整流れ

```
1. データ準備
   └── ツール呼び出し会話としてフォーマット

2. (optional) データ合成
   └── OpenRouter を使用してより多くの訓練データを生成

3. LoRA 微調整実行
   └── 凍結ったベース重みの上でアダプターを訓練

4. 展開用にマージ
   └── アダプターを単一の .cact ファイルにマージ
```

### 実行

```bash
# 微調整
needle finetune \
    --data training_data.jsonl \
    --output_dir ./output \
    --epochs 3

# マージ
needle merge \
    --checkpoint_dir ./output/checkpoint-1000 \
    --output ./needle-custom.cact
```

---

## 設計哲学

### 哲学1: 専門化 > 全般

> **「小さなモデルに大規模モデルのふりをさせるのではなく、小さなモデルが最も得意的分野で最も優れたものにする。」**

### 哲学2: ローカルファースト

> **「推論時にネットワーク依存なし」**

プライバシー、遅延なしで本地推理の利点：

```
云端 API:              エッジ展開:
─────────────────      ────────────────
データ第三方に送信      データ機械から永不離
プライバシー政策依存      完全データ制御
転送リスク存在          零伝送リスク
```

### 哲学3: 境界リソース

256-token スライドウィンドウは境界リソースの体現：

```
传统 LLM:                  Needle 2:
────────────────            ────────────────
長い文脈 = より多くのメモリ    固定 256-token ウィンドウ
↓                           ↓
無制限会話、メモリ爆発          限定会話、定数 28MB RAM
```

### 哲学4: 信頼度は安全の境界

```
高信頼度 (> 0.8):
  └── 直接実行、確認なし

中信頼度 (0.5-0.8):
  └── 実行だがユーザーに確認

低信頼度 (< 0.5):
  └── 実行を拒否、较大モデルにエスカレーション
```

### 哲学5: シンプルさは究極の複雑さ

```python
# 传统: 複雑なツール呼び出し設定
from some_library import Agent, Tool, Memory

# Needle 2: 最小限の API
@needle.tool
def get_weather(city: str):
    return {...}

agent = needle.Needle(tools=[get_weather])
```

---

## 核心观点まとめ

### 观点1: エッジ AI の未来は専門モデル

> **「70 倍大きいモデルと競争」** —— これは専門化の回报です。

### 观点2: ローカル AI はプライバシーの保護

```
云端 API:                  エッジ展開:
─────────────────          ────────────────
データを送信用              データ機械から永不離
```

### 观点3: リソース制約はイノベーションを刺激

> **Cactus Quants (2-bit 圧縮)** —— 极端な圧縮下での品質維持。

### 观点4: 信頼度は AI 安全に核心

### 观点5: シンプルさは究極の複雑さ

---

## ユースケース推奨

| シナリオ | 推奨理由 |
|---------|---------|
| 📱 モバイルアプリ内 AI | 28MB RAM、网络不要 |
| ⌚ ウェアラブル | 超低電力、リアルタイム |
| 🏠 スマートホーム制御 | ローカル処理、プライバシー |
| 🤖 ロボットリアルタイム意思決定 | 快速応答、クラウド不要 |

---

## 結論

Needle 2 は重要な方向性を代表しています：**AI をより強力にするのではなく、より展開可能にする**。

AI が実際の產品に落ちる過程で、**モデルそのものよりも、展開の便利性と信頼性**がしばしば決定要因になります。Needle 2 の極端なサイズ、ネットワーク依存なし、内蔵信頼度などの特性は、エッジデバイスの AI 化に実行可能な解決策を提供します。

その出現は私たちに思い出させます：**AI の世界で、時はより少ないことがより多く、専門化が強いこともあります**。

エッジデバイスで実行できるツール呼び出しモデルを探しているなら、Needle 2 は試す価値があります。

---

## 参考リソース

| リソース | リンク |
|---------|-------|
| GitHub | [github.com/cactus-compute/needle](https://github.com/cactus-compute/needle) |
| PyPI | `pip install cactus-needle` |
| Playground | `needle playground` |

---

*この記事は Needle 2 プロジェクトの GitHub リポジトリから整理しました。*
