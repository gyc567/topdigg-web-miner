---
title: "Needle 2：極致輕量的本地 AI 工具調用模型——45M 參數實現設備端智能"
date: "2026-08-14"
description: "深度解析 Needle 2 開源項目——45M 參數的本地 AI 模型，僅 14MB 二進制文件，28MB 內存占用，支持工具調用、結構化數據提取，專為邊緣設備設計"
tags:
  - Needle
  - AI 模型
  - 邊緣計算
  - 工具調用
  - 本地部署
  - Cactus Quants
  - 結構化提取
  - 設備端 AI
categories:
  - AI 模型
  - 邊緣計算
  - 本地 AI
  - 工具調用
  - 模型壓縮
---

# Needle 2：極致輕量的本地 AI 工具調用模型——45M 參數實現設備端智能

## 項目背景與核心問題

### 邊緣設備的 AI 困境

在 AI 時代，我們面臨一個越來越突出的矛盾：**強大的 AI 能力與設備資源限制之間的衝突**。

| 設備類型 | 資源限制 | AI 需求 |
|---------|---------|---------|
| 智能手機 | 有限的內存和算力 | 實時響應、隱私保護 |
| 可穿戴設備 | 超低功耗要求 | 始終在線、快速響應 |
| 智能家居 | 成本敏感、離線運行 | 本地控制、低延遲 |
| 機器人 | 實時感知決策 | 快速響應、環境交互 |

### Needle 2 的誕生

Needle 2 團隊選擇了一條不同的路徑：

> **「不是讓小模型假裝是大模型，而是讓小模型在它擅長的領域做到極致。」**

這就是 Needle 2 —— 一個專門為**工具調用、设备使用、結構化數據提取**優化的極小模型。

---

## 項目概述

### 什麼是 Needle 2？

Needle 2 是一個 **45M 參數的 AI 模型**，專門用於：
- **工具調用 (Tool Calling)**
- **設備使用 (Device Use)**
- **結構化數據提取 (Structured Data Extraction)**

```
┌─────────────────────────────────────────────────────────────┐
│                    Needle 2 核心指標                            │
├─────────────────────────────────────────────────────────────┤
│  ⚡ 參數數量:    45M                                           │
│  📦 模型大小:    14MB (單文件部署)                             │
│  💾 內存占用:    ~28MB (256-token 滑動窗口)                    │
│  🔄 推理方式:    完全本地，無網絡依賴                           │
│  🎯 專長:        工具調用、結構化提取                           │
│  📊 性能:        與大 70 倍模型競爭                             │
└─────────────────────────────────────────────────────────────┘
```

### 核心特性

| 特性 | 描述 |
|------|------|
| 🖥️ **自包含部署** | 權重嵌入單個文件，推理時無網絡依賴 |
| 📝 **簡單 API** | 接受文本輸入，返回基於工具模式的結構化 JSON |
| 🎯 **置信度門控** | 提供校準的置信度分數 |
| 🔍 **工具檢索** | 內置檢索系統，每輪從大型目錄中篩選 top-5 相關工具 |
| 💾 **有界內存** | 256-token 滑動窗口，總內存約 28MB |
| 🧩 **模塊化工具** | 裝飾器定義工具，輕鬆集成 Python 函數 |
| 📊 **結構化提取** | 支持 Pydantic 模型 |

---

## 技術架構

### Simple Attention Networks

Needle 2 基於 **Simple Attention Networks (SAN)** 架構：

```
┌─────────────────────────────────────────────────────────────┐
│              Simple Attention Networks 架構                   │
├─────────────────────────────────────────────────────────────┤
│  1. Hadamard MLP (替代 FFN)                                │
│  2. Grouped Query Attention (GQA)                         │
│  3. Engram Key-Value Memory                               │
│  4. Multi-Lane Hyper-Connections                           │
└─────────────────────────────────────────────────────────────┘
```

### Cactus Quants (2-bit 壓縮)

```
量化對比：

FP32 → 180MB
FP16 → 90MB
INT8 → 45MB
CQ2  → ~14MB ✓
```

---

## 核心功能詳解

### 1. 工具調用系統

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

### 2. 置信度門控

```python
result = agent.run("what's it like in Lagos?")

if result["confidence"] > 0.8:
    print(result["results"])
else:
    print("不太確定...")
```

### 3. 結構化數據提取

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

## 快速上手

### 安裝

```bash
pip install cactus-needle

# GPU 加速
pip install "cactus-needle[gpu]"

# Apple Silicon
pip install "cactus-needle[metal]"
```

### 基本使用

```python
import needle

@needle.tool
def get_weather(city: str) -> dict:
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

## 微調教程

### 流程

```
1. 準備數據 → 工具調用對話格式
2. 可選：合成數據 → OpenRouter 生成
3. LoRA 微調 → 訓練適配器
4. 合併部署 → 合併為 .cact 文件
```

### 執行

```bash
needle finetune --data training_data.jsonl --output_dir ./output

needle merge --checkpoint_dir ./output/checkpoint-1000 --output ./needle-custom.cact
```

---

## 設計哲學

### 哲學1: 專而精，而非大而全

> **「不是讓小模型假裝是大模型，而是讓小模型在它擅長的領域做到極致。」**

### 哲學2: 本地優先，而非雲端

> **「推理時無網絡依賴」**

隱私、延遲無憂的本地推理優勢。

### 哲學3: 有界資源，而非無限制

256-token 滑動窗口 = 固定內存 28MB。

### 哲學4: 置信度作為安全邊界

```
高置信度 (> 0.8) → 直接執行
中置信度 (0.5-0.8) → 執行但確認
低置信度 (< 0.5) → 升級到更大模型
```

### 哲學5: 簡單才是終極複雜

```python
# Needle 2: 極簡 API
@needle.tool
def get_weather(city: str):
    return {...}

agent = needle.Needle(tools=[get_weather])
```

---

## 核心觀點總結

1. **邊緣 AI 的未來是專用模型** — 在特定任務上優化可以超越通用大模型
2. **本地 AI 是隱私的保護傘** — 數據永不離開設備
3. **資源約束激發創新** — Cactus Quants 2-bit 壓縮
4. **置信度是 AI 安全的核心** — 不知道什麼時候該信任
5. **簡單才是終極複雜** — 把簡單留給用戶

---

## 結論

Needle 2 代表了一個重要的方向：**不是讓 AI 變得更強大，而是讓 AI 變得更可部署**。

如果你正在尋找一個可以在邊緣設備上運行的工具調用模型，Needle 2 值得一試。

---

## 參考資源

| 資源 | 連結 |
|------|------|
| GitHub | [github.com/cactus-compute/needle](https://github.com/cactus-compute/needle) |
| PyPI | `pip install cactus-needle` |
| Playground | `needle playground` |

---

*本文基於 Needle 2 項目的 GitHub 倉庫整理而成。*
