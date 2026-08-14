---
title: "Needle 2: Mô Hình AI Cục Bộ Siêu Nhẹ cho Gọi Công Cụ — 45M Tham Số Cung Cấp Trí Tuệ Edge"
date: "2026-08-14"
description: "Phân tích chuyên sâu dự án mã nguồn mở Needle 2 — mô hình AI 45M tham số trong file nhị phân 14MB với ~28MB RAM, được thiết kế cho gọi công cụ và trích xuất dữ liệu có cấu trúc trên thiết bị edge"
tags:
  - Needle
  - Mô Hình AI
  - Edge Computing
  - Tool Calling
  - Deployment Cục Bộ
  - Cactus Quants
  - Trích Xuất Có Cấu Trúc
  - AI Trên Thiết Bị
categories:
  - Mô Hình AI
  - Edge Computing
  - AI Cục Bộ
  - Tool Calling
  - Nén Mô Hình
---

# Needle 2: Mô Hình AI Cục Bộ Siêu Nhẹ cho Gọi Công Cụ

## Bối Cảnh Dự Án và Vấn Đề Cốt Lõi

### AI Thiết Bị Edge

Trong kỷ nguyên AI, chúng ta đối mặt với một mâu thuẫn ngày càng rõ ràng: **sự xung đột giữa khả năng AI mạnh mẽ và giới hạn tài nguyên thiết bị**.

| Loại Thiết Bị | Giới Hạn Tài Nguyên | Nhu Cầu AI |
|--------------|---------------------|------------|
| Điện thoại thông minh | RAM và compute giới hạn | Phản hồi real-time, bảo mật |
| Thiết bị đeo được | Yêu cầu công suất cực thấp | Luôn bật, phản hồi nhanh |
| Nhà thông minh | Nhạy cảm về chi phí, offline | Điều khiển cục bộ, độ trễ thấp |
| Robot | Quyết định perception thời gian thực | Phản hồi nhanh, tương tác môi trường |

### Sự Ra Đời của Needle 2

Đội ngũ Needle 2 đã chọn một con đường khác:

> **"Không phải làm cho mô hình nhỏ giả làm mô hình lớn, mà là làm cho mô hình nhỏ xuất sắc trong lĩnh vực nó giỏi nhất."**

Đây là Needle 2 — một **mô hình AI 45M tham số** chuyên biệt cho:
- **Gọi Công Cụ (Tool Calling)**
- **Sử Dụng Thiết Bị (Device Use)**
- **Trích Xuất Dữ Liệu Có Cấu Trúc (Structured Data Extraction)**

Một mô hình ngôn ngữ siêu nhỏ có thể **cạnh tranh với các mô hình lớn hơn 70 lần** trên các tác vụ cụ thể.

---

## Tổng Quan Dự Án

### Needle 2 là gì?

Needle 2 là một **mô hình AI mã nguồn mở 45M tham số** chuyên biệt cho gọi công cụ, sử dụng thiết bị và trích xuất dữ liệu có cấu trúc.

```
┌─────────────────────────────────────────────────────────────┐
│                    Needle 2 Chỉ Số Cốt Lõi                    │
├─────────────────────────────────────────────────────────────┤
│  ⚡ Tham số:         45M (so với GPT-4 ~1T)                 │
│  📦 Kích thước:      14MB (triển khai file đơn)            │
│  💾 Bộ nhớ:         ~28MB (cửa sổ trượt 256 tokens)        │
│  🔄 Suy luận:        Hoàn toàn cục bộ, không phụ thuộc mạng │
│  🎯 Chuyên môn:      Gọi công cụ, trích xuất có cấu trúc   │
│  📊 Hiệu suất:       Cạnh tranh với mô hình lớn hơn 70x    │
└─────────────────────────────────────────────────────────────┘
```

### Tính Năng Chính

| Tính Năng | Mô Tả |
|-----------|--------|
| 🖥️ **Triển khai tự chứa** | Trọng số nhúng trong file đơn, không phụ thuộc mạng |
| 📝 **API đơn giản** | Đầu vào văn bản, JSON có cấu trúc dựa trên schema |
| 🎯 **Điều khiển độ tin cậy** | Điểm tin cậy được hiệu chỉnh cho quyết định hành động |
| 🔍 **Truy xuất công cụ** | Hệ thống truy xuất nội bộ, top-5 công cụ liên quan |
| 💾 **Bộ nhớ giới hạn** | Cửa sổ trượt 256-token, ~28MB RAM bất kể cuộc trò chuyện |
| 🧩 **Công cụ mô-đun** | Định nghĩa bằng decorator, tích hợp Python dễ dàng |
| 📊 **Trích xuất có cấu trúc** | Hỗ trợ Pydantic models |
| ⚡ **Tăng tốc** | GPU (`cactus-needle[gpu]`), Apple Silicon (`cactus-needle[metal]`) |

---

## Kiến Trúc Kỹ Thuật

### Simple Attention Networks

Needle 2 dựa trên kiến trúc đổi mới **Simple Attention Networks (SAN)**:

```
┌─────────────────────────────────────────────────────────────┐
│              Simple Attention Networks Kiến Trúc              │
├─────────────────────────────────────────────────────────────┤
│  1. Hadamard MLP (thay thế FFN)                             │
│  2. Grouped Query Attention (GQA)                            │
│  3. Engram Key-Value Memory                                 │
│  4. Multi-Lane Hyper-Connections                           │
└─────────────────────────────────────────────────────────────┘
```

### Cactus Quants (Nén 2-bit)

```
So Sánh Lượng Tử:

FP32 → 180MB
FP16 → 90MB
INT8 → 45MB
CQ2  → ~14MB ✓
```

---

## Tính Năng Cốt Lõi

### 1. Hệ Thống Gọi Công Cụ

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

### 2. Điều Khiển Độ Tin Cậy

```python
result = agent.run("what's it like in Lagos?")

if result["confidence"] > 0.8:
    # Độ tin cậy cao: sử dụng trực tiếp
    print(result["results"])
else:
    # Độ tin cậy thấp: nâng cấp lên mô hình lớn hơn
    print("Không chắc chắn...")
```

### 3. Trích Xuất Có Cấu Trúc

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

## Bắt Đầu Nhanh

### Cài Đặt

```bash
pip install cactus-needle

# Tăng tốc GPU
pip install "cactus-needle[gpu]"

# Apple Silicon
pip install "cactus-needle[metal]"
```

### Cách Sử Dụng Cơ Bản

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

## Fine-Tuning

### Luồng

```
1. Chuẩn bị dữ liệu → Định dạng cuộc trò chuyện gọi công cụ
2. (Tùy chọn) Tổng hợp dữ liệu → OpenRouter
3. LoRA Fine-tuning → Train adapter trên base weights đông lạnh
4. Merge triển khai → Gộp thành file .cact
```

### Chạy

```bash
needle finetune --data training_data.jsonl --output_dir ./output

needle merge --checkpoint_dir ./output/checkpoint-1000 --output ./needle-custom.cact
```

---

## Triết Lý Thiết Kế

### Triết Lý 1: Chuyên Môn Hóa > Tổng Quát

> **"Không phải làm cho mô hình nhỏ giả làm mô hình lớn, mà là làm cho mô hình nhỏ xuất sắc trong lĩnh vực nó giỏi nhất."**

### Triết Lý 2: Cục Bộ Trước, Không Phải Đám Mây

> **"Không phụ thuộc mạng khi suy luận"**

### Triết Lý 3: Tài Nguyên Giới Hạn, Không Vô Hạn

256-token sliding window = Bộ nhớ cố định 28MB.

### Triết Lý 4: Độ Tin Cậy Là Biên Giới An Toàn

```
Độ tin cậy cao (> 0.8) → Thực thi trực tiếp
Độ tin cậy trung bình (0.5-0.8) → Thực thi nhưng xác nhận
Độ tin cậy thấp (< 0.5) → Nâng cấp lên mô hình lớn hơn
```

### Triết Lý 5: Đơn Giản Mới Là Phức Tạp Cuối Cùng

```python
# Needle 2: API tối thiểu
@needle.tool
def get_weather(city: str):
    return {...}

agent = needle.Needle(tools=[get_weather])
```

---

## Insights Cốt Lõi

### Insight 1: Tương Lai của AI Edge Là Các Mô Hình Chuyên Biệt

> **"Cạnh tranh với mô hình lớn hơn 70 lần"** — Đây là phần thưởng cho sự chuyên biệt hóa.

### Insight 2: AI Cục Bộ Là Lá Chắn Bảo Mật

```
Cloud API:                     Triển khai Edge:
─────────────────             ────────────────
Dữ liệu gửi đến server        Dữ liệu không rời thiết bị
Phụ thuộc chính sách          Kiểm soát hoàn toàn
Rủi ro truyền dữ liệu         Không rủi ro truyền
```

### Insight 3: Ràng Buộc Tài Nguyên Thúc Đẩy Đổi Mới

> **Cactus Quants (nén 2-bit)** — Duy trì chất lượng mô hình dưới nén cực đoan.

---

## Kết Luận

Needle 2 đại diện cho một hướng quan trọng: **không phải làm cho AI mạnh hơn, mà làm cho AI có thể triển khai được**.

Nếu bạn đang tìm kiếm một mô hình gọi công cụ có thể chạy trên thiết bị edge, Needle 2 rất đáng để thử.

---

## Tài Nguyên

| Tài Nguyên | Liên Kết |
|-----------|---------|
| GitHub | [github.com/cactus-compute/needle](https://github.com/cactus-compute/needle) |
| PyPI | `pip install cactus-needle` |
| Playground | `needle playground` |

---

*Bài viết này được tổng hợp từ GitHub repository của dự án Needle 2.*
