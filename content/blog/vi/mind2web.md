---
title: 'Mind2Web: Bộ Dữ Liệu Chuẩn Web Agent Thực Tế Đầu Tiên Trên Thế Giới — Dạy AI Hoàn Thành Các Tác Vụ Phức Tạp Trên Mọi Trang Web'
date: "2026-08-14"
description: "Phân tích chuyên sâu về dự án Mind2Web của OSU-NLP-Group — bộ dữ liệu chuẩn web agent LLM đầu tiên dựa trên trang web thực tế, với hơn 2000 tác vụ, 137 trang web, 31 lĩnh vực"
tags:
  - Mind2Web
  - Web Agent
  - LLM
  - Large Language Models
  - Web Navigation
  - AI Agent
  - NeurIPS
  - Dataset
  - Trí Tuệ Nhân Tạo
categories:
  - AI Dataset
  - Large Language Models
  - Web Agents
  - AI Research
  - Artificial Intelligence Agents
---

# Mind2Web: Bộ Dữ Liệu Chuẩn Web Agent Thực Tế Đầu Tiên Trên Thế Giới — Dạy AI Hoàn Thành Các Tác Vụ Phức Tạp Trên Mọi Trang Web

## Bối Cảnh Dự Án và Vấn Đề Cốt Lõi

### Tại Sao Cần Web Agent?

Trong kỷ nguyên internet ngày nay, người dùng cần hoàn thành nhiều tác vụ phức tạp trên vô số trang web mỗi ngày — đặt vé máy bay, tìm kiếm thông tin, điền biểu mẫu, quản lý mạng xã hội, v.v. Những thao tác tưởng chừng đơn giản này đòi hỏi con người phải dành nhiều thời gian để học hỏi và thích nghi với mỗi trang web mới.

**Câu hỏi quan trọng**: Liệu chúng ta có thể huấn luyện một tác tử AI có thể như con người — hiểu được hướng dẫn bằng ngôn ngữ tự nhiên, tự động điều hướng và thao tác trên bất kỳ trang web nào, và hoàn thành các tác vụ phức tạp dài hạn không?

Đây chính là vấn đề cốt lõi mà Mind2Web giải quyết.

### Hạn Chế của Các Bộ Dữ Liệu Hiện Có

Trước Mind2Web, nghiên cứu về Web agent phải đối mặt với hai thách thức lớn:

| Loại Dataset | Vấn Đề | Dataset Đại Diện |
|-------------|--------|-----------------|
| Môi trường mô phỏng | Quá đơn giản, không phản ánh được độ phức tạp của trang web thực | MiniWoB, WebShop |
| Phạm vi trang web hạn chế | Không thể đánh giá khả năng tổng quát hóa, mô hình có thể "học vẹt" | ALFWorld, WebArena |

Những bộ dữ liệu này hoặc sử dụng môi trường được xây dựng nhân tạo và đơn giản hóa, hoặc chỉ bao phủ một số ít trang web và tác vụ, khiến không thể thực sự đánh giá khả năng tổng quát hóa của tác tử AI trong thế giới web thực sự.

### Sự Ra Đời của Mind2Web

> **"Chúng tôi giới thiệu Mind2Web, bộ dữ liệu đầu tiên để phát triển và đánh giá các tác tử web tổng quát có thể làm theo hướng dẫn bằng ngôn ngữ để hoàn thành các tác vụ phức tạp trên bất kỳ trang web nào."**
> — Bài báo Mind2Web

Mind2Web được phát triển bởi Nhóm Nghiên cứu NLP của Đại học Bang Ohio (OSU-NLP-Group) và được vinh danh Spotlight tại hội nghị NeurIPS 2023, trở thành một cột mốc quan trọng trong lĩnh vực nghiên cứu Web agent.

---

## Tổng Quan Dự Án và Thống Kê Cốt Lõi

### Mind2Web là gì?

Mind2Web là **bộ dữ liệu chuẩn web agent LLM đầu tiên trên thế giới sử dụng trang web thực tế**, với các đặc điểm cốt lõi sau:

- 🌍 **Môi trường trang web thực tế**: Sử dụng các trang web internet thực, không phải môi trường mô phỏng
- 📊 **Dataset quy mô lớn**: Hơn 2.000 tác vụ mở
- 🌐 **Phạm vi lĩnh vực rộng**: 137 trang web thực trên 31 lĩnh vực
- 🎯 **Ba cấp độ đánh giá tổng quát hóa**: Hỗ trợ kiểm tra khả năng tổng quát hóa cross-task, cross-website, cross-domain

### Thống Kê Dữ Liệu Cốt Lõi

| Chỉ Số | Giá Trị |
|--------|---------|
| Tổng số tác vụ | 2.350 |
| Số trang web | 137 |
| Số lĩnh vực | 31 |
| Độ dài tác vụ trung bình | 7,3 bước thao tác |
| Số phần tử trang trung bình | 1.135 phần tử DOM/trang |
| Quy mô tập huấn luyện | 1.009 instances |
| Quy mô tập kiểm tra | 1.341 instances |

---

## Triết Lý Thiết Kế Dataset

### Nguyên Tắc Cốt Lõi: Thực Tế, Mở, Thực Dụng

Triết lý thiết kế của Mind2Web được xây dựng trên ba nguyên tắc cốt lõi:

#### 1. Ưu Tiên Thế Giới Thực

> **"Các bộ dữ liệu hiện có cho web agent hoặc sử dụng trang web mô phỏng hoặc chỉ bao phủ một tập hợp hạn chế các trang web và tác vụ, do đó không phù hợp cho các web agent tổng quát."**

Mind2Web kiên trì sử dụng trang web thực tế, điều này mang lại:
- **Tính xác thực**: Phản ánh độ phức tạp của các trang web thực (bao gồm các bố cục, quảng cáo, cửa sổ bật lên khác nhau)
- **Tính đa dạng**: Các trang web khác nhau có ngôn ngữ thiết kế và mẫu tương tác hoàn toàn khác nhau
- **Tính thử thách**: Tính không đều và tính động của trang web thực không thể tái tạo trong môi trường mô phỏng

#### 2. Thiết Kế Tác Vụ Mở Domain

Các tác vụ không phải là các mẫu cố định được đặt trước mà được **thực sự đề xuất và hoàn thành bởi những người lao động crowdsourced**:

```
Ba Giai Đoạn Thu Thập Dữ Liệu:
┌─────────────────────────────────────────────────────┐
│  Giai đoạn 1: Đề Xuất Tác Vụ (Task Proposal)        │
│  Người lao động đề xuất các tác vụ khả thi          │
│  cho các trang web đã cho                           │
└─────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────┐
│  Giai đoạn 2: Minh Họa Tác Vụ (Task Demonstration)  │
│  Người lao động minh họa việc hoàn thành tác vụ    │
│  bằng Playwright                                   │
└─────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────┐
│  Giai đoạn 3: Xác Minh Tác Vụ (Task Verification)   │
│  Tác giả xác minh tất cả các hành động              │
│  đều sạch sẽ và chính xác                          │
└─────────────────────────────────────────────────────┘
```

#### 3. Đánh Giá Tổng Quát Hóa Theo Cấp Độ

Để đánh giá toàn diện khả năng tổng quát hóa của tác tử, Mind2Web đã thiết kế **ba độ khó tăng dần cho các phân tách kiểm tra**:

| Loại Phân Tách | Dữ Liệu Huấn Luyện | Dữ Liệu Kiểm Tra | Độ Khó | Trọng Tâm Đánh Giá |
|---------------|-------------------|-----------------|--------|-------------------|
| **Cross Task** | Tác vụ cùng trang web | Tác vụ mới cùng trang web | ⭐⭐ | Tổng quát hóa cấp tác vụ |
| **Cross Website** | Trang web cùng domain | Trang web mới cùng domain | ⭐⭐⭐ | Tổng quát hóa cấp trang web |
| **Cross Domain** | Tác vụ domain cụ thể | Hoàn toàn domain kỹ thuật mới | ⭐⭐⭐⭐⭐ | Tổng quát hóa cấp domain |

---

## Chi Tiết Kiến Trúc Kỹ Thuật

### Thiết Kế Pipeline Hai Giai Đoạn

Giải pháp kỹ thuật của Mind2Web sử dụng **Pipeline hai giai đoạn**, đây là điểm đổi mới cốt lõi:

```
                    ┌─────────────────────────────────────┐
                    │         Hướng Dẫn Ngôn Ngữ Tự Nhiên │
                    │   "Tìm chuyến bay một chiều từ       │
                    │    New York đến Los Angeles"         │
                    └─────────────────────────────────────┘
                                    ↓
                    ┌─────────────────────────────────────┐
                    │    Giai Đoạn 1: Tạo Ứng Viên        │
                    │         DeBERTa-v3-base Encoder      │
                    │    Chấm điểm cặp truy vấn-ứng viên  │
                    │         Recall@50 ≈ 85%              │
                    └─────────────────────────────────────┘
                                    ↓
                    ┌─────────────────────────────────────┐
                    │    Giai Đoạn 2: Dự Đoán Hành Động   │
                    │         Flan-T5 Seq2seq Model        │
                    │   Mô tả tác vụ + Ngữ cảnh HTML      │
                    │         Đầu ra: CLICK/TYPE/SELECT   │
                    └─────────────────────────────────────┘
                                    ↓
                    ┌─────────────────────────────────────┐
                    │          Thực Thi Chuỗi Hành Động   │
                    │      Hoàn thành tác vụ phức tạp     │
                    └─────────────────────────────────────┘
```

### Giai Đoạn 1: Tạo Phần Tử Ứng Viên

#### Tại Sao Cần Tạo Ứng Viên?

Các trang web thực chứa một số lượng lớn các phần tử (Mind2Web trung bình có 1.135 phần tử DOM mỗi trang), việc đưa tất cả vào LLM vừa **không hiệu quả** vừa **tốn kém**.

#### Giải Pháp

Sử dụng **mô hình DeBERTa-v3-base encoder** để chấm điểm và lọc các phần tử ứng viên:

```python
# Ví dụ tạo ứng viên
model = AutoModel.from_pretrained("osunlp/MindAct_CandidateGeneration_deberta-v3-base")

# Đầu vào: cặp truy vấn-phần tử ứng viên
scores = model.score(query, candidate_elements)

# Đầu ra: Top-50 phần tử ứng viên
top_candidates = select_top_k(scores, k=50)
```

**Chỉ số hiệu suất**: Recall@50 ≈ 85%, nghĩa là 85% phần tử đúng xuất hiện trong Top-50 ứng viên.

### Giai Đoạn 2: Dự Đoán Hành Động

#### Lựa Chọn Mô Hình

Mind2Web hỗ trợ nhiều mô hình dự đoán hành động:

| Loại Mô Hình | Kích Thước | Đặc Điểm |
|-------------|-----------|----------|
| Flan-T5 | Base / Large / XL | Nguồn mở, có thể triển khai cục bộ |
| GPT-3.5/GPT-4 | API calls | Hiệu suất tốt hơn, chi phí cao hơn |

#### Định Dạng QA Đa Lựa Chọn

Đối với LLM (như dòng GPT), Mind2Web sử dụng **định dạng QA đa lựa chọn**:

```python
# Định dạng QA cho dự đoán hành động
prompt = f"""
Tác vụ: {task_description}

Trang hiện tại chứa các phần tử tương tác sau:
{formatted_candidates}

Nên thao tác trên phần tử nào và bằng cách nào?

A) Click vào phần tử [button: "Search flights"]
B) Nhập "New York" vào [input: "From"]
C) Chọn "One-way" từ [select: "Trip type"]
...
"""
```

#### Loại Hành Động

Mind2Web định nghĩa ba loại hành động cơ bản:

| Hành Động | Mô Tả | Ví Dụ |
|----------|--------|-------|
| **CLICK** | Click vào phần tử | Click nút, liên kết |
| **TYPE** | Nhập văn bản | Điền văn bản vào trường nhập |
| **SELECT** | Chọn tùy chọn | Chọn từ menu thả xuống |

---

## Loại Tác Vụ và Ví Dụ

### Các Tác Vụ Thực Tế Đa Dạng

Mind2Web chứa các loại tác vụ đa dạng phong phú, bao quát mọi khía cạnh trong cuộc sống trực tuyến hàng ngày của người dùng:

#### 1. Du Lịch và Giao Thông
```
Tác vụ: Tìm chuyến bay một chiều từ New York đến Los Angeles trên Expedia
- Thao tác: Nhập thành phố khởi hành → Nhập điểm đến → Chọn ngày → Click tìm kiếm
- Độ khó: Liên quan đến điền biểu mẫu nhiều bước và tải nội dung động
```

#### 2. Chăm Sóc Sức Khỏe
```
Tác vụ: Tìm tương tác giữa một loại thuốc với các loại thuốc khác
- Thao tác: Truy cập trang web thuốc → Tìm kiếm tên thuốc → Xem thông tin tương tác
- Độ khó: Cần hiểu thuật ngữ và nội dung lĩnh vực chuyên môn
```

#### 3. Dịch Vụ Tài Chính
```
Tác vụ: Đăng ký điện thoại kèm gói nhà mạng
- Thao tác: Chọn dòng điện thoại → Chọn gói → Điền thông tin cá nhân → Gửi đăng ký
- Độ khó: Liên quan đến luồng nhiều trang và logic biểu mẫu phức tạp
```

#### 4. Mạng Xã Hội
```
Tác vụ: Tìm và theo dõi một tech blogger trên Twitter
- Thao tác: Tìm kiếm tên người dùng → Truy cập trang cá nhân → Click theo dõi
- Độ khó: Cần hiểu mẫu tương tác của mạng xã hội
```

#### 5. Khám Phá Nội Dung
```
Tác vụ: Tìm phim kinh dị phát hành năm 2020 trên Netflix
- Thao tác: Truy cập Netflix → Chọn thể loại → Lọc theo năm → Duyệt kết quả
- Độ khó: Liên quan đến lọc đa chiều và khám phá nội dung
```

---

## Chỉ Số Đánh Giá và Kết Quả Thực Nghiệm

### Hệ Thống Chỉ Số Đánh Giá

Mind2Web cung cấp các chỉ số đánh giá đa chiều:

#### 1. Chỉ Số Độ Chính Xác

| Chỉ Số | Cách Tính | Trường Hợp Sử Dụng Tốt Nhất |
|--------|-----------|----------------------------|
| **Macro Avg Accuracy** | Trung bình trọng số bằng nhau cho tất cả tác vụ | So sánh bài báo (được khuyến nghị) |
| **Micro Avg Accuracy** | Trọng số theo số instance tác vụ | Có thể thiên về trang web có nhiều tác vụ |

#### 2. Recall Ứng Viên

- **Recall@K**: Tỷ lệ phần tử đúng xuất hiện trong Top-K ứng viên
- Đánh giá chất lượng giai đoạn tạo ứng viên

### Hiệu Suất Mô Hình Baseline

| Mô Hình | Cross Task | Cross Website | Cross Domain |
|---------|-----------|--------------|--------------|
| MindAct (Flan-T5-base) | 40.2% | 28.1% | 16.4% |
| MindAct (Flan-T5-large) | 47.5% | 32.7% | 19.5% |
| MindAct (Flan-T5-xl) | 52.1% | 38.9% | 24.3% |
| GPT-3.5 (3-shot) | 48.2% | 33.5% | 20.8% |
| GPT-4 (3-shot) | 57.6% | 42.3% | 28.9% |

### Các Phát Hiện Quan Trọng

#### Phát Hiện 1: LLM Thể Hiện Khả Năng Tổng Quát Hóa Ban Đầu

> **"Giải pháp của chúng tôi thể hiện mức độ hiệu suất khá, ngay cả trên các trang web hoặc toàn bộ domain mà mô hình chưa từng thấy."**

Điều này chứng minh rằng web agent dựa trên LLM có khả năng tổng quát hóa cross-domain ban đầu.

#### Phát Hiện 2: Lọc Ứng Viên là Rất Quan Trọng

Việc đưa HTML thô trực tiếp vào LLM hoạt động kém, nhưng **lọc các phần tử ứng viên trước bằng LM nhỏ (DeBERTa)** có thể cải thiện đáng kể hiệu quả và hiệu suất của LLM.

#### Phát Hiện 3: Vẫn Còn Rất Nhiều Dư Địa Cải Thiện

> **"Nhưng vẫn còn nhiều dư địa cải thiện đáng kể để đạt được các tác tử thực sự có thể tổng quát hóa."**

Ngay cả GPT-4 tiên tiến nhất cũng chỉ đạt 28,9% độ chính xác trong cài đặt Cross Domain, cho thấy công nghệ hiện tại vẫn còn một chặng đường dài để trở thành web agent thực sự tổng quát.

---

## Triển Khai Mô Hình MindAct

### Cấu Trúc Dự Án

```
Mind2Web/
├── data/
│   ├── train/                  # Dữ liệu huấn luyện (1.009 instances)
│   ├── test/
│   │   ├── cross_task/         # Tập kiểm tra cross-task (252)
│   │   ├── cross_website/      # Tập kiểm tra cross-website (177)
│   │   └── cross_domain/       # Tập kiểm tra cross-domain (912)
│   └── annotation/             # Dữ liệu chú thích
├── src/
│   ├── candidate_generation/  # Mô hình tạo ứng viên
│   ├── action_prediction/      # Mô hình dự đoán hành động
│   └── utils/                  # Hàm tiện ích
├── scripts/
│   ├── evaluation.py          # Script đánh giá
│   └── inference.py           # Script suy luận
└── README.md
```

### Bắt Đầu Nhanh

#### Cài Đặt Môi Trường

```bash
# Sao chép kho lưu trữ
git clone https://github.com/OSU-NLP-Group/Mind2Web.git
cd Mind2Web

# Tạo môi trường ảo
python -m venv mind2web-env
source mind2web-env/bin/activate  # Linux/Mac
# mind2web-env\Scripts\activate  # Windows

# Cài đặt các gói phụ thuộc
pip install -r requirements.txt
```

#### Các Gói Phụ Thuộc Chính

```txt
# requirements.txt các gói phụ thuộc chính
torch>=2.0.0
transformers>=4.28.0
deepspeed>=0.9.0
beautifulsoup4>=4.12.0
playwright>=1.40.0
```

#### Tải Dữ Liệu

```python
# Tải dataset từ HuggingFace
from datasets import load_dataset

# Tải dataset hoàn chỉnh
dataset = load_dataset("osunlp/Mind2Web")

# Tải các phân tách cụ thể
train_data = load_dataset("osunlp/Mind2Web", split="train")
test_cross_task = load_dataset("osunlp/Mind2Web", split="test_cross_task")
test_cross_website = load_dataset("osunlp/Mind2Web", split="test_cross_website")
test_cross_domain = load_dataset("osunlp/Mind2Web", split="test_cross_domain")
```

#### Tải Mô Hình

```python
# Tải mô hình tạo ứng viên
from transformers import AutoModel, AutoTokenizer

model_name = "osunlp/MindAct_CandidateGeneration_deberta-v3-base"
tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModel.from_pretrained(model_name)
```

#### Ví Dụ Suy Luận

```python
import json
from mindact import MindActPipeline

# Khởi tạo pipeline
pipeline = MindActPipeline(
    candidate_model="osunlp/MindAct_CandidateGeneration_deberta-v3-base",
    action_model="flan-t5-large",
    device="cuda"
)

# Tải tác vụ
task = {
    "instruction": "Find one-way flights from New York to Los Angeles",
    "html": "<html>...</html>",  # HTML trang
    "dom_trace": [...]  # Danh sách phần tử DOM
}

# Chạy suy luận
result = pipeline.predict(task)
print(f"Các hành động dự đoán: {result['actions']}")
```

#### Đánh Giá Mô Hình

```bash
# Sử dụng script đánh giá
python scripts/evaluation.py \
    --model flan-t5-large \
    --split test_cross_domain \
    --output results.json

# Xem kết quả
python scripts/analysis.py --results results.json
```

---

## Công Cụ Bổ Sung và Mở Rộng

### SeeAct: Khung Web Agent Tăng Cường

[SeeAct](https://osu-nlp-group.github.io/SeeAct/) là công trình tiếp theo của nhóm Mind2Web, tăng cường thêm khả năng của web agent:

- 🔍 **Định vị hình ảnh tinh tế hơn**: Kết hợp thông tin hình ảnh để hiểu bố cục trang
- 🎯 **Nhận dạng phần tử chính xác hơn**: Giảm click sai và thao tác sai
- 📈 **Hiệu suất tổng quát hóa tốt hơn**: Cải thiện đáng kể trên Mind2Web

### Online-Mind2Web: Mở Rộng Học Trực Tuyến

[Online-Mind2Web](https://github.com/OSU-NLP-Group/Online-Mind2Web) khám phá mô hình học trực tuyến:

- 🌐 **Tương tác môi trường động**: Học tương tác trên trang web thực
- 🔄 **Cải thiện năng lực liên tục**: Cải thiện chiến lược liên tục thông qua tương tác với môi trường
- 🎮 **Gần hơn với cách con người học**: Mô phỏng cách con người khám phá và học các trang web mới

### Multimodal-Mind2Web: Mở Rộng Đa Phương Thức

[Multimodal-Mind2Web](https://huggingface.co/datasets/osunlp/Multimodal-Mind2Web) thêm phương thức hình ảnh:

- 🖼️ **Dữ liệu ảnh chụp màn hình được ghép nối**: Mỗi ảnh chụp DOM được ghép nối với ảnh chụp màn hình tương ứng
- 👁️ **Căn chỉnh hình ảnh-ngôn ngữ**: Hỗ trợ nghiên cứu web agent đa phương thức
- 📸 **Ngữ cảnh phong phú hơn**: Kết hợp thông tin hình ảnh và văn bản để hiểu trang

---

## Tổng Hợp Triết Lý Thiết Kế

### 1. Nguyên Tắc Ưu Tiên Thực Tế

Quyết định thiết kế quan trọng nhất của Mind2Web là **kiên trì sử dụng trang web thực tế**. Điều này làm cho bộ dữ liệu có thể phản ánh sự phức tạp của internet thực, nhưng cũng mang lại thách thức (như trang web có thể thay đổi, nội dung có thể hết hiệu lực, v.v.). Nhóm đảm bảo tính lâu dài của dữ liệu bằng cách cung cấp ảnh chụp DOM và định dạng MHTML.

### 2. Đánh Giá Hướng Tác Vụ

Khác với đánh giá kết quả đầu vào-đầu ra truyền thống, Mind2Web sử dụng **tỷ lệ hoàn thành tác vụ** làm chỉ số đánh giá cốt lõi. Điều này có nghĩa là tác tử cần duy trì hướng đúng qua nhiều bước thao tác và cuối cùng hoàn thành toàn bộ tác vụ.

### 3. Tổng Quát Hóa Theo Cấp Độ

Thông qua ba phân tách kiểm tra với độ khó tăng dần (Cross Task, Cross Website, Cross Domain), Mind2Web thiết lập một **hệ thống đánh giá tổng quát hóa theo cấp bậc**, giúp các nhà nghiên cứu xác định chính xác các nút thắt cổ chai trong tổng quát hóa.

### 4. Mô Hình Nhỏ Hỗ Trợ Mô Hình Lớn

Thiết kế Pipeline hai giai đoạn thể hiện triết lý **phân công và hợp tác**: mô hình nhỏ và hiệu quả (DeBERTa) xử lý lọc thông tin, mô hình lớn (Flan-T5/GPT) xử lý suy luận phức tạp. Thiết kế này giảm đáng kể chi phí tính toán trong khi duy trì hiệu suất.

### 5. Nguồn Mở và Cởi Mở

Mind2Web kiên trì **nguồn mở bộ dữ liệu, mã nguồn và mô hình**, cung cấp cho cộng đồng:
- Bộ dữ liệu hoàn chỉnh (HuggingFace)
- Mô hình đã huấn luyện (HuggingFace)
- Khung đánh giá hoàn chỉnh
- Tài liệu và ví dụ chi tiết

---

## Các Nhận Định Cốt Lõi và Tổng Kết Kết Luận

### Các Nhận Định Cốt Lõi

#### Nhận Định 1: Thử Nghiệm Môi Trường Thực là Chìa Khóa cho Nghiên Cứu Web Agent

Hầu hết các nghiên cứu web agent hiện tại được thực hiện trong môi trường mô phỏng, thuận tiện cho đánh giá nhưng không thực sự phản ánh hiệu suất của tác tử trong thế giới internet thực phức tạp và luôn thay đổi. Mind2Web lấp đầy khoảng trống này bằng cách cung cấp bộ chuẩn quy mô lớn đầu tiên dựa trên trang web thực.

#### Nhận Định 2: Lọc Ứng Viên là Chìa Khóa để LLM Xử Lý HTML Dài

Các trang web thực có nhiều phần tử DOM, việc đưa tất cả vào LLM vừa không thực tế vừa không hiệu quả. Mind2Web chứng minh rằng **lọc các phần tử ứng viên trước bằng LM nhỏ (DeBERTa)** có thể cải thiện đáng kể hiệu quả và hiệu suất. Mô hình này đã được nhiều nghiên cứu tiếp theo áp dụng rộng rãi.

#### Nhận Định 3: Tổng Quát Hóa Cross-Domain là Thách Thức Cốt Lõi

Kết quả thực nghiệm cho thấy ngay cả GPT-4 tiên tiến nhất cũng chỉ đạt 28,9% độ chính xác trong cài đặt Cross Domain. Điều này cho thấy **tổng quát hóa theo domain** vẫn là nút thắt cổ chai cốt lõi của công nghệ web agent hiện tại, cần được nhiều nghiên cứu quan tâm hơn.

#### Nhận Định 4: Pipeline Hai Giai Đoạn là Kiến Trúc Hiệu Quả

Thiết kế hai giai đoạn tạo ứng viên + dự đoán hành động đạt được sự cân bằng tốt giữa hiệu suất và hiệu quả. Thiết kế kiến trúc này đã được nhiều công trình web agent tiếp theo tham khảo và mở rộng.

#### Nhận Định 5: Đa Phương Thức là Hướng Tương Lai

Các công trình tiếp theo của nhóm Mind2Web (SeeAct, Multimodal-Mind2Web) cho thấy **kết hợp thông tin hình ảnh** có thể tiếp tục cải thiện hiệu suất của web agent, đa phương thức là hướng phát triển quan trọng cho nghiên cứu web agent.

### Đóng Góp Phương Pháp Luận

| Loại Đóng Góp | Nội Dung Cụ Thể |
|-------------|----------------|
| **Đóng góp Dataset** | Bộ chuẩn web agent thực đầu tiên, 137 trang web/31 domain/2.350 tác vụ |
| **Đóng góp Khung Đánh Giá** | Hệ thống đánh giá tổng quát hóa ba tầng, chỉ số đánh giá đa chiều |
| **Đóng góp Mô Hình** | Mô hình MindAct hoàn chỉnh với mã huấn luyện/suy luận |
| **Đóng góp Thực Tiễn** | Thiết kế Pipeline hai giai đoạn, baseline có thể tái tạo |

### Hạn Chế

1. **Tính Động của Trang Web**: Các trang web thực liên tục thay đổi, có thể ảnh hưởng đến tính kịp thời của dữ liệu
2. **Hạn Chế của Đánh Giá Offline**: Đánh giá hiện tại là offline, không phản ánh được sự phức tạp của tương tác online
3. **Phương Thức Tương Tác Đơn Lẻ**: Chủ yếu hỗ trợ CLICK/TYPE/SELECT, hỗ trợ tương tác phức tạp hơn còn hạn chế
4. **Cân Nhắc Chi Phí**: Sử dụng các mô hình lớn như GPT-4 để đánh giá tốn kém

### Triển Vọng Tương Lai

| Hướng | Mô Tả |
|------|-------|
| **Học Trực Tuyến** | Mô hình học tương tác được khám phá bởi Online-Mind2Web |
| **Hợp Nhất Đa Phương Thức** | Phương pháp kết hợp thông tin hình ảnh trong SeeAct và các công trình khác |
| **Tác Vụ Phức Tạp Hơn** | Suy luận dài hạn, đối thoại đa vòng và các mẫu tương tác phức tạp hơn |
| **Ứng Dụng Thực Tế** | Áp dụng công nghệ web agent vào sản phẩm thực tế |
| **An Toàn** | Đảm bảo tính an toàn và đáng tin cậy của hành vi tác tử trong môi trường thực |

---

## Tài Liệu Tham Khảo

| Tài Nguyên | Liên Kết |
|-----------|---------|
| Bài báo (arXiv) | [arxiv.org/abs/2306.06070](https://arxiv.org/abs/2306.06070) |
| Trang Web Dự Án | [osu-nlp-group.github.io/Mind2Web/](https://osu-nlp-group.github.io/Mind2Web/) |
| Kho GitHub | [github.com/OSU-NLP-Group/Mind2Web](https://github.com/OSU-NLP-Group/Mind2Web) |
| Dataset (HuggingFace) | [huggingface.co/datasets/osunlp/Mind2Web](https://huggingface.co/datasets/osunlp/Mind2Web) |
| Mô Hình Tạo Ứng Viên | [huggingface.co/osunlp/MindAct_CandidateGeneration_deberta-v3-base](https://huggingface.co/osunlp/MindAct_CandidateGeneration_deberta-v3-base) |
| SeeAct Mở Rộng | [osu-nlp-group.github.io/SeeAct/](https://osu-nlp-group.github.io/SeeAct/) |
| Online-Mind2Web | [github.com/OSU-NLP-Group/Online-Mind2Web](https://github.com/OSU-NLP-Group/Online-Mind2Web) |

---

## Kết Luận

Mind2Web là một cột mốc quan trọng trong nghiên cứu web agent. Nó không chỉ cung cấp bộ dữ liệu chuẩn quy mô lớn đầu tiên dựa trên trang web thực mà còn thiết lập một khung đánh giá và giải pháp kỹ thuật hoàn chỉnh. Thiết kế Pipeline hai giai đoạn và hệ thống đánh giá tổng quát hóa ba tầng của nó cung cấp tài liệu tham khảo quan trọng cho các nghiên cứu tiếp theo.

Tuy nhiên, kết quả thực nghiệm cũng cho thấy rõ ràng rằng công nghệ web agent hiện tại vẫn còn một chặng đường dài để trở thành trợ lý AI thực sự tổng quát có thể tự động làm việc trên bất kỳ trang web nào. Độ chính xác 28,9% trong Cross Domain nhắc nhở chúng ta rằng **tổng quát hóa theo domain** vẫn là thách thức cốt lõi mà các tác tử AI đang đối mặt.

Với sự phát triển không ngừng của công nghệ đa phương thức, phương pháp học trực tuyến và các mô hình nền tảng mạnh mẽ hơn, chúng ta có lý do để tin rằng các web agent thực sự tổng quát sẽ trở thành hiện thực trong tương lai không xa. Mind2Web đã đặt nền móng nghiên cứu quan trọng cho mục tiêu này.

---

**Cách Trích Dẫn**:
```
@misc{deng2023mind2web,
  title={Mind2Web: Towards a Generalist Agent for the Web},
  author={Xiang Deng and Yu Gu and Boyuan Zheng et al.},
  year={2023},
  eprint={2306.06070},
  archivePrefix={arXiv},
  primaryClass={cs.CL}
}
```
