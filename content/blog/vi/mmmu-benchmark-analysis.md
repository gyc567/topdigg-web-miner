---
title: "MMMU: Thách Thức Đa Ngôn Ngữ Đa Phương Thức Quy Mô Lớn Cho LLMs — Phân Tích Chi Tiết 11.5K Câu Hỏi Cấp Đại Học"
date: "2026-08-14"
description: "Phân tích chuyên sâu MMMU Benchmark — đánh giá khả năng hiểu và suy luận đa phương thức của mô hình ngôn ngữ lớn ở cấp độ đại học đa ngành, bao gồm 11.5K câu hỏi, 30 môn học, 32 loại hình ảnh,揭示当前顶尖多模态模型的真實水平與未來發展方向"
tags:
  - MMMU
  - Mô Hình Đa Phương Thức Lớn
  - LMM
  - Đánh Giá LLM
  - Mô Hình Ngôn Ngữ Thị Giác
  - AGI
  - CVPR
  - Tập Dữ Liệu
  - Trí Tuệ Nhân Tạo
  - Hiểu Đa Phương Thức
categories:
  - Tập Dữ Liệu AI
  - Mô Hình Ngôn Ngữ Lớn
  - Học Đa Phương Thức
  - Nghiên Cứu AI
  - Đánh Giá LLM
---

# MMMU: Thách Thức Đa Ngôn Ngữ Đa Phương Thức Quy Mô Lớn Cho LLMs — Phân Tích Chi Tiết 11.5K Câu Hỏi Cấp Đại Học

## Bối Cảnh Dự Án và Vấn Đề Cốt Lõi

### Tại Sao Cần MMMU?

Trong lĩnh vực trí tuệ nhân tạo, các mô hình đa phương thức lớn (Large Multimodal Models - LMMs) stanno đang phát triển với tốc độ chưa từng có. Từ GPT-4V đến Gemini, từ LLaVA đến Qwen-VL, các mô hình này tuyên bố có thể "nhìn" hình ảnh, "hiểu" biểu đồ, "suy luận" thông tin phức tạp. Tuy nhiên, **một câu hỏi quan trọng luôn ám ảnh các nhà nghiên cứu và người hành nghề**: Liệu các mô hình này thực sự có khả năng hiểu đa phương thức ở cấp độ chuyên gia?

Các điểm chuẩn hiện có có những hạn chế rõ ràng:

| Loại Điểm Chuẩn | Phạm Vi | Độ Sâu Kiến Thức | Đa Dạng Hình Ảnh | Vấn Đề Cốt Lõi |
|-----------------|---------|-----------------|------------------|----------------|
| Điểm chuẩn kịch bản hàng ngày | Cuộc sống hàng ngày | Kiến thức thông thường | Ảnh chụp, biểu đồ đơn giản | Không thể đánh giá kiến thức chuyên môn |
| Điểm chuẩn học thuật | Môn học hạn chế | Kiến thức nông | Loại đơn lẻ | Độ sâu không đủ |
| Điểm chuẩn VQA | Lĩnh vực phân tán | Hiểu bề mặt | Định dạng hạn chế | Thiếu tính hệ thống |

**Sự ra đời của MMMU chính là để lấp đầy khoảng trống này** — đây là điểm chuẩn đầu tiên được thiết kế riêng để đánh giá khả năng hiểu và suy luận đa phương thức của mô hình lớn trong các tác vụ đa ngành ở cấp độ đại học.

### Mục Tiêu Cốt Lõi của MMMU

> **"Chúng tôi giới thiệu MMMU, một điểm chuẩn mới được thiết kế để đánh giá các mô hình đa phương thức trên các tác vụ đa ngành quy mô lớn đòi hỏi kiến thức chuyên ngành và suy luận có chủ đích ở cấp đại học."**
> — Bài báo MMMU

Các mục tiêu thiết kế của MMMU rõ ràng và đầy tham vọng:

1. **Đánh giá khả năng tổng hợp của nhận thức, kiến thức và suy luận**: Không chỉ kiểm tra mô hình "nhìn thấy" gì, mà còn đánh giá liệu chúng có thể kết hợp kiến thức chuyên môn để suy luận đúng hay không
2. **Bao phủ các kịch bản thi thật của đại học**: Câu hỏi đến từ các kỳ thi, bài kiểm tra và sách giáo khoa thực tế, không phải tổng hợp nhân tạo
3. **Kiểm tra hiểu hình ảnh không đồng nhất**: Bao gồm hơn 30 loại hình ảnh khác nhau, yêu cầu mô hình có khả năng hiểu hình ảnh rộng
4. **Thúc đẩy hướng tới AGI cấp chuyên gia**: Sử dụng điểm chuẩn độ khó cao để thúc đẩy phát triển các mô hình nền tảng đa phương thức thế hệ tiếp theo

---

## Tổng Quan Dự Án và Thống Kê Cốt Lõi

### MMMU là gì?

MMMU (Massive Multi-discipline Multimodal Understanding and Reasoning Benchmark) là một điểm chuẩn mới về hiểu và suy luận đa phương thức đa ngành quy mô lớn, được thiết kế để đánh giá **khả năng hiểu đa phương thức cấp chuyên gia** của các mô hình AI.

### Thống Kê Dữ Liệu Cốt Lõi

| Chỉ Số | Giá Trị | Mô Tả |
|--------|---------|--------|
| Tổng số câu hỏi | **11.500+** | Câu hỏi thực từ thi đại học, bài kiểm tra, sách giáo khoa |
| Số môn học | **30** | Trải rộng sáu lĩnh vực cốt lõi |
| Tiểu lĩnh vực | **183** | Hướng chuyên môn chi tiết |
| Loại hình ảnh | **32** | Nội dung hình ảnh không đồng nhất cao |
| Bộ phát triển | 150 mẫu | Để học few-shot |
| Bộ xác thực | 900 mẫu | Để gỡ lỗi và đánh giá nhanh |
| Bộ thử nghiệm | 10.500 mẫu | Tiêu chuẩn đánh giá chính thức |

### Sáu Lĩnh Vực Cốt Lõi

Các câu hỏi trong MMMU bao gồm sáu lĩnh vực chính:

| Lĩnh Vực | Ví Dụ Môn Học | Mức Độ Khó |
|----------|--------------|------------|
| **Nghệ Thuật & Thiết Kế** | Lịch sử nghệ thuật, Nguyên lý thiết kế, Truyền thông thị giác | Sáng tạo + Thẩm mỹ + Kiến thức chuyên môn |
| **Kinh Doanh** | Tài chính, Kế toán, Marketing, Quản trị | Logic kinh doanh + Phân tích dữ liệu |
| **Khoa Học** | Vật lý, Hóa học, Sinh học, Địa lý | Khoa học tự nhiên + Suy luận thực nghiệm |
| **Sức Khỏe & Y Học** | Y học lâm sàng, Dược lý học, Điều dưỡng | Kiến thức y khoa + Phán đoán lâm sàng |
| **Nhân Văn & Khoa Học Xã Hội** | Lịch sử, Triết học, Kinh tế học, Xã hội học | Hiểu nhân văn + Tư duy phê phán |
| **Công Nghệ & Kỹ Thuật** | Khoa học máy tính, Kỹ thuật điện tử, Kỹ thuật cơ khí | Nguyên lý kỹ thuật + Thực hành kỹ thuật |

---

## Triết Lý Thiết Kế Dữ Liệu

### Triết Lý Cốt Lõi: Thách Thức Cấp Chuyên Gia

Triết lý thiết kế của MMMU xoay quanh một mệnh đề cốt lõi: **Một chuyên gia đa phương thức thực sự cần những khả năng gì?**

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│              Mô Hình Tam Giác Khả Năng Hiểu Đa Phương      │
│                      Thức Cấp Chuyên Gia                    │
│                                                             │
│                        ▲ Khả Năng Suy Luận                  │
│                       /│\                                  │
│                      / │ \                                 │
│                     /  │  \                                │
│                    /   │   \                               │
│                   /    │    \                              │
│                  /──────│──────\                            │
│                /  Nhận thức │  Kiến thức  \               │
│               /─────────────┴─────────────\                  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

MMMU yêu cầu mô hình đồng thời có:

- **Khả năng nhận thức (Perception)**: Nhận dạng và hiểu thông tin hình ảnh trong các loại hình ảnh khác nhau
- **Kiến thức (Knowledge)**: Nắm vững kiến thức chuyên ngành cấp đại học
- **Suy luận (Reasoning)**: Kết hợp nhận thức và kiến thức để suy luận logic

### Nguyên Tắc Thiết Kế 1: Ưu Tiên Tính Xác Thực

Tất cả các câu hỏi đến từ **nguồn thực**:

```
Quy Trình Thu Thập Dữ Liệu:
┌─────────────────────────────────────────────────────┐
│                                                     │
│   Bước 1: Thu Thập Nguồn                           │
│   Thu thập tài liệu từ website đại học,           │
│   nhà xuất bản sách giáo khoa, nền tảng khóa học   │
│                                                     │
└─────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────┐
│                                                     │
│   Bước 2: Chọn lọc và Biên Soạn Thủ Công          │
│   Đội ngũ sinh viên đa ngành chọn lọc và biên    │
│   soạn câu hỏi để đảm bảo độ khó phù hợp,         │
│   trình bày rõ ràng, hình ảnh hoàn chỉnh          │
│                                                     │
└─────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────┐
│                                                     │
│   Bước 3: Kiểm Tra Chất Lượng                      │
│   Đội ngũ chuyên gia kiểm tra chất lượng cuối     │
│   cùng, xác minh tính đúng của đáp án và          │
│   tính hợp lệ của câu hỏi                         │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### Nguyên Tắc Thiết Kế 2: Thách Thức Hình Ảnh Không Đồng Nhất

MMMU bao gồm **32 loại hình ảnh không đồng nhất cao**, đây là thách thức độc đáo của nó:

| Loại Hình Ảnh | Ví Dụ Môn Học | Khó Hiểu |
|--------------|--------------|----------|
| Sơ đồ (Diagrams) | Sinh học, Hóa học | Cần hiểu quan hệ cấu trúc |
| Bảng (Tables) | Kinh doanh, Thống kê | Cần phân tích thông tin hàng/cột |
| Bản đồ (Maps) | Địa lý, Lịch sử | Cần suy luận không gian |
| Nhạc cụ (Music Sheets) | Âm nhạc | Cần kiến thức ký hiệu chuyên môn |
| Công thức hóa học | Hóa học | Cần hiểu công thức phân tử |
| Ký hiệu toán học | Toán, Vật lý | Cần phân tích LaTeX |
| Sơ đồ mạch | Kỹ thuật điện tử | Cần đọc bản vẽ kỹ thuật |
| Hình ảnh y tế | Y học lâm sàng | Cần kiến thức hình ảnh y khoa |
| Tranh vẽ | Lịch sử nghệ thuật | Cần phân tích thẩm mỹ |
| Ảnh chụp (Photos) | Tin tức, Khoa học | Cần hiểu cảnh |

**Nhận định quan trọng**: Nhiều loại hình ảnh hiếm gặp trong dữ liệu huấn luyện thông thường, khiến mô hình khó có đủ kiến thức hình ảnh đặc thù từng lĩnh vực.

### Nguyên Tắc Thiết Kế 3: Văn Bản và Hình Ảnh Đan Xen

Không giống nhiều điểm chuẩn đơn giản coi hình ảnh là đầu vào độc lập, MMMU sử dụng **thiết kế văn bản và hình ảnh đan xen**:

```
Cấu Trúc Câu Hỏi MMMU Điển Hình:
┌─────────────────────────────────────────────────────┐
│                                                     │
│   [Đoạn văn bản 1]                                │
│   "Dựa trên dữ liệu thí nghiệm của phản ứng       │
│   hóa học sau..."                                   │
│                                                     │
│   [Hình ảnh cấu trúc hóa học]                     │
│   [Hình ảnh phương trình phản ứng]                │
│                                                     │
│   [Đoạn văn bản 2]                                │
│   "Hãy phân tích loại phản ứng và trả lời        │
│   câu hỏi 1-3"                                     │
│                                                     │
│   [Dữ liệu bảng]                                   │
│                                                     │
│   [Câu hỏi]                                        │
│   1. Loại phản ứng này là?                         │
│   A. Phản ứng oxi hóa  B. Phản ứng khử           │
│   C. Phản ứng phân hủy  D. Phản ứng hóa hợp      │
│                                                     │
└─────────────────────────────────────────────────────┘
```

Thiết kế này **tái hiện chân thực các kịch bản thi đại học**, yêu cầu mô hình có thể:
- Chuyển đổi ngữ cảnh giữa văn bản và hình ảnh
- Tích hợp thông tin từ nhiều nguồn
- Xử lý các phụ thuộc liên phương thức

### So Sánh với Các Điểm Chuẩn Hiện Có

| Chiều | MMMU | Điểm chuẩn hiện có |
|-------|------|---------------------|
| **Độ sâu kiến thức** | Kiến thức chuyên môn cấp đại học | Kiến thức thông thường |
| **Đa dạng hình ảnh** | 32 loại hình ảnh không đồng nhất | 2-5 loại hình ảnh phổ biến |
| **Phạm vi môn học** | 6 lĩnh vực, 30 môn học | Một lĩnh vực hoặc phạm vi hạn chế |
| **Độ phức tạp suy luận** | Cần suy luận chuyên môn có chủ đích | Suy luận đơn giản, trực tiếp |
| **Nguồn thực** | Câu hỏi thi đại học thực | Tổng hợp nhân tạo hoặc Q&A đơn giản |

---

## MMMU-Pro: Phiên Bản Đánh Giá Mạnh Mẽ Hơn

### Tại Sao Cần MMMU-Pro?

Tháng 9/2024, nhóm MMMU ra mắt **MMMU-Pro**, một phiên bản đánh giá nghiêm ngặt và thực tế hơn.

### Phương Pháp Đánh Giá 3 Bước của MMMU-Pro

```
Quy Trình Đánh Giá MMMU-Pro:

Bước 1: Lọc các câu hỏi có thể trả lời bằng văn bản
         ↓
    Đảm bảo câu hỏi phải dựa vào thông tin hình ảnh
         ↓
Bước 2: Tăng số lượng tùy chọn ứng viên
         ↓
    Tăng từ 4 tùy chọn lên 10 tùy chọn
    Giảm khả năng đoán ngẫu nhiên
         ↓
Bước 3: Cài đặt đầu vào chỉ có hình ảnh
         ↓
    Nhúng văn bản câu hỏi vào hình ảnh
    Yêu cầu mô hình "nhìn" và "đọc"
```

### Phát Hiện Quan Trọng

Kết quả đánh giá MMMU-Pro cho thấy những phát hiện đáng kinh ngạc:

| Mô Hình | Độ Chính Xác MMMU | Độ Chính Xác MMMU-Pro | Mức Giảm |
|---------|-------------------|----------------------|----------|
| GPT-4V | ~56% | ~26.9% | -52% |
| Các mô hình top khác | ~40-50% | ~16.8-20% | -50%+ |

**Kết luận**: Khi thực sự yêu cầu hiểu hình ảnh thay vì suy luận văn bản, hiệu suất của tất cả các mô hình đều giảm đáng kể.

---

## Kiến Trúc Kỹ Thuật

### Pipeline Đánh Giá

MMMU cung cấp pipeline đánh giá hoàn chỉnh:

```
                    ┌─────────────────────────────────────┐
                    │         Mô Hình Cần Đánh Giá       │
                    │   (LMM nguồn mở hoặc Mô hình API)  │
                    └─────────────────────────────────────┘
                                    ↓
                    ┌─────────────────────────────────────┐
                    │      Định Dạng Câu Hỏi (Prompt)    │
                    │   - Định dạng MCQ thành QA         │
                    │   - Giữ nguyên định dạng QA mở     │
                    │   - Chain-of-Thought tùy chọn       │
                    └─────────────────────────────────────┘
                                    ↓
                    ┌─────────────────────────────────────┐
                    │           Suy Luận Mô Hình          │
                    │   - Mã hóa hình ảnh                 │
                    │   - Hiểu văn bản                   │
                    │   - Hợp nhất đa phương thức        │
                    │   - Tạo câu trả lời                 │
                    └─────────────────────────────────────┘
                                    ↓
                    ┌─────────────────────────────────────┐
                    │           Phân Tích Câu Trả Lời     │
                    │   - Trích xuất câu trả lời từ đầu ra│
                    │   - So sánh với đáp án chuẩn        │
                    │   - Tính độ chính xác              │
                    └─────────────────────────────────────┘
```

### Các Loại Mô Hình Được Hỗ Trợ

Bộ đánh giá MMMU hỗ trợ nhiều loại mô hình:

| Loại Mô Hình | Mô Hình Đại Diện | Triển Khai |
|--------------|-----------------|-----------|
| Mô hình API đóng | GPT-4V, Claude, Gemini | Gọi API |
| LMM nguồn mở | LLaVA, Qwen-VL, InternVL | Triển khai cục bộ |
| LLM nguồn mở + Bộ mã hóa thị giác | BLIP-2, InstructBLIP | Triển khai cục bộ |

### Hỗ Trợ Chain-of-Thought (CoT)

MMMU hỗ trợ suy luận Chain-of-Thought tùy chọn:

```python
# Chế độ tiêu chuẩn (Direct)
prompt = """
Câu hỏi: {question}
Các tùy chọn: {options}
Hãy chọn đáp án đúng trực tiếp.
"""

# Chế độ CoT (Chain-of-Thought)
prompt = """
Câu hỏi: {question}
Các tùy chọn: {options}
Hãy phân tích câu hỏi trước, suy luận từng bước, rồi đưa ra câu trả lời cuối cùng.
"""
```

**Phát hiện nghiên cứu**: CoT thường cải thiện hiệu suất mô hình, đặc biệt trên các tác vụ suy luận phức tạp.

---

## Kết Quả Đánh Giá và Thực Nghiệm

### So Sánh Hiệu Suất Tổng Thể

Hiệu suất của các mô hình chính trên MMMU:

| Mô Hình | Tham Số | Độ Chính Xác Tổng Thể | Ghi Chú |
|---------|---------|----------------------|---------|
| **Chuyên Gia Con Người** | - | 87.0% | Đường cơ sở trên |
| GPT-4V | - | 56.0% | Mô hình đóng tốt nhất |
| GPT-4o | - | 65.0% | Phiên bản nâng cấp |
| Qwen-VL-7B | 7B | ~35% | Nguồn mở dẫn đầu |
| LLaVA-1.6-34B | 34B | ~43% | Nguồn mở lớn |
| InternVL-Chat-V1.2 | - | ~40% | Đại diện Trung Quốc |
| Yi-VL-34B | 34B | ~38% | |

### Phân Tích Hiệu Suất Theo Lĩnh Vực

| Lĩnh Vực | GPT-4V | Nguồn Mở Tốt Nhất | Chênh Lệch |
|----------|--------|-------------------|------------|
| Nghệ thuật & Thiết kế | ~50% | ~30% | 20% |
| Kinh doanh | ~55% | ~35% | 20% |
| Khoa học | ~50% | ~30% | 20% |
| Sức khỏe & Y học | ~48% | ~28% | 20% |
| Nhân văn & KHXH | ~55% | ~35% | 20% |
| Công nghệ & Kỹ thuật | ~52% | ~32% | 20% |

### Phân Tích Hiệu Suất Theo Loại Hình Ảnh

Đây là một trong những nhận định quan trọng nhất từ MMMU:

| Loại Hình Ảnh | Tần Suất | GPT-4V | Nguồn Mở Tốt Nhất | Đoán Ngẫu Nhiên |
|--------------|----------|--------|-------------------|-----------------|
| Ảnh chụp (Photos) | Cao | Cao | Khá cao | 25% |
| Tranh vẽ (Paintings) | Trung bình | Trung bình-cao | Trung bình | 25% |
| Sơ đồ (Diagrams) | Cao | Trung bình | Thấp | 25% |
| Bảng (Tables) | Cao | Trung bình | Thấp | 25% |
| Hình dạng hình học | Thấp | Rất thấp | Rất thấp | 25% |
| Nhạc cụ (Music Sheets) | Thấp | Rất thấp | Rất thấp | 25% |
| Công thức hóa học | Thấp | Rất thấp | Rất thấp | 25% |
| Hình ảnh y tế | Thấp | Thấp | Rất thấp | 25% |

**Nhận định quan trọng**:
1. **Sai lệch tần suất nghiêm trọng**: Mô hình hoạt động tốt với các loại hình ảnh phổ biến, nhưng gần như đoán ngẫu nhiên với các loại hiếm
2. **Kiến thức bao phủ không đủ**: Ngay cả GPT-4V cũng có độ chính xác cực thấp trên công thức hóa học, nhạc cụ...
3. **Khả năng tổng quát hóa đáng nghi ngờ**: Các mô hình hiện tại gặp khó khăn với các định dạng hình ảnh hiếm gặp trong tập huấn luyện

### Phân Tích Hiệu Suất Theo Mức Độ Khó

| Độ Khó | GPT-4V | Nguồn Mở Tốt Nhất | Phân Tích |
|--------|--------|-------------------|-----------|
| Dễ (Easy) | 76.1% | ~50% | Chênh lệch rõ rệt |
| Trung bình (Medium) | 55.6% | ~35% | Chênh lệch thu hẹp |
| Khó (Hard) | ~30% | ~25% | Chênh lệch biến mất |

**Phát hiện đáng kinh ngạc**: Khi độ khó tác vụ tăng lên, khoảng cách giữa mô hình tiên tiến và mô hình thường dần biến mất. Điều này cho thấy **ngay cả GPT-4V cũng đối mặt với thách thức lớn trên các tác vụ thực sự cấp chuyên gia**.

---

## Phân Tích Lỗi: Các Trường Hợp Thất Bại của GPT-4V

### Phân Bố Loại Lỗi

Nhóm MMMU đã phân tích sâu 150 trường hợp lỗi của GPT-4V:

| Loại Lỗi | Tỷ Lệ | Mô Tả |
|----------|-------|--------|
| **Lỗi nhận thức** | ~30% | Hiểu hình ảnh không đầy đủ, bỏ lỡ thông tin hình ảnh quan trọng |
| **Lỗi kiến thức** | ~25% | Thiếu kiến thức chuyên ngành liên quan hoặc áp dụng không đúng |
| **Lỗi suy luận** | ~25% | Vấn đề trong quá trình suy luận logic |
| **Lỗi hiểu lĩnh vực** | ~15% | Hiểu sai thuật ngữ chuyên môn hoặc khái niệm đặc thù |
| **Lỗi khác** | ~5% | Hiểu sai định dạng, sơ suất, v.v. |

---

## Các Nhận Định và Kết Luận Cốt Lõi

### Nhận Định 1: "Ảo Giác" của Mô Hình Đa Phương Thức Nghiêm Trọng Hơn LLM

Khi GPT-4V đạt 56% độ chính xác trên MMMU, nhiều người cho rằng điều này "không tệ". Tuy nhiên:

> **Sự thật**: Trong 32 loại hình ảnh, có hơn 10 loại có độ chính xác **thấp hơn hoặc gần bằng mức đoán ngẫu nhiên 25%**.

Điều này có nghĩa là mô hình trong nhiều lĩnh vực chuyên môn **gần như "mù lòa"** — chúng có thể xử lý ảnh chụp phổ biến và biểu đồ đơn giản, nhưng khi gặp các định dạng hình ảnh chuyên ngành, chúng quay lại chế độ "đoán ngẫu nhiên".

### Nhận Định 2: Độ Sâu Kiến Thức Quan Trọng Hơn Phạm Vi Nhận Thức

Hướng phát triển hiện tại của mô hình đa phương thức có sai lệch:

- **Quá tập trung vào khả năng nhận thức**: Theo đuổi bộ mã hóa thị giác lớn hơn, nhiều dữ liệu hình ảnh huấn luyện hơn
- **Bỏ qua độ sâu kiến thức**: Mức độ nắm vững kiến thức chuyên môn cấp đại học nghiêm trọng không đủ

**Hiểu đa phương thức cấp chuyên gia thực sự đòi hỏi**:
1. **Nhận thức**: Nhận dạng các yếu tố hình ảnh trong hình ảnh
2. **Kiến thức**: Hiểu ý nghĩa của các yếu tố này trong các lĩnh vực cụ thể
3. **Suy luận**: Kết hợp nhận thức và kiến thức để đưa ra đánh giá đúng

Các mô hình hiện tại hoạt động tạm được ở bước 3 (suy luận), nhưng sự thiếu sót ở bước 2 (kiến thức) là điểm yếu chí mạng.

### Nhận Định 3: MMMU-Pro Cho Thấy Sự Thật Khắc Nghiệt Hơn

MMMU-Pro đẩy cài đặt chỉ-hình-ảnh lên mức cực đoan, cho thấy kết quả đáng báo động:

> **Độ chính xác của GPT-4V trên MMMU-Pro giảm từ 56% xuống 26.9%.**

Điều này cho thấy "hiểu đa phương thức" của các mô hình hiện tại phần lớn dựa vào **khả năng OCR mạnh và hiểu văn bản**, không phải hiểu hình ảnh thực sự. Khi bị ép buộc "chỉ nhìn hình", hiệu suất lập tức sụp đổ.

### Nhận Định 4: Khoảng Cách Giữa Mô Hình Nguồn Mở và Đóng Đang Thu Hẹp

| Chiều So Sánh | Khoảng Cách 2023 | Khoảng Cách 2024 |
|--------------|------------------|------------------|
| MMMU Tổng thể | ~30% | ~20% |
| Tác vụ dễ | ~35% | ~25% |
| Tác vụ khó | ~15% | ~5% |

**Xu hướng**: Trên các tác vụ khó, khoảng cách giữa nguồn mở và đóng đã gần như không đáng kể, cho thấy toàn bộ lĩnh vực đang hướng tới khả năng cấp chuyên gia cao hơn.

### Nhận Định 5: AGI Đa Phương Thức Cần Đổi Mới Liên Ngành

Sự thành công của MMMU cho thấy một thách thức cơ bản: **AI chuyên gia đa phương thức thực sự cần đột phá trên nhiều lĩnh vực cùng lúc**:

```
Ngăn Xếp Công Nghệ AGI Đa Phương Thức:

┌─────────────────────────────────────────────────┐
│              Tầng Ứng Dụng Cấp Chuyên Gia      │
│         (Chẩn đoán y tế, Thiết kế kỹ thuật,    │
│          Phân tích pháp lý)                     │
├─────────────────────────────────────────────────┤
│              Tầng Suy Luận Liên Ngành           │
│      (Đồ thị tri thức chuyên môn,              │
│       Suy luận thích ứng lĩnh vực)             │
├─────────────────────────────────────────────────┤
│              Tầng Hợp Nhất Đa Phương Thức       │
│    (Hợp nhất đa hạt giữa thị giác,             │
│     ngôn ngữ, kiến thức chuyên môn)            │
├─────────────────────────────────────────────────┤
│              Tầng Nền Tảng Nhận Thức             │
│       (Hiểu hình ảnh, Phân tích biểu đồ,        │
│        Thị giác chuyên môn)                     │
└─────────────────────────────────────────────────┘
```

---

## Hướng Dẫn Sử Dụng: Cách Đánh Giá Mô Hình Trên MMMU

### Chuẩn Bị Môi Trường

```bash
# Clone repository MMMU
git clone https://github.com/MMMU-Benchmark/MMMU.git
cd MMMU

# Cài đặt các phụ thuộc
pip install -r requirements.txt
```

### Truy Cập Dữ Liệu

Dữ liệu MMMU được lưu trữ trên HuggingFace:

```python
from datasets import load_dataset

# Load bộ dữ liệu MMMU đầy đủ
mmmu = load_dataset("MMMU/MMMU")

# Xem cấu trúc dữ liệu
print(mmmu)
```

### Đánh Giá Mô Hình API (GPT-4V, v.v.)

```python
from mmmu.evaluator import Evaluator

evaluator = Evaluator(
    model_name="gpt-4v",
    api_key="your-api-key"
)

val_data = load_dataset("MMMU/MMMU", split="val")
results = evaluator.evaluate(val_data)

print(f"Độ chính xác tổng thể: {results['overall_accuracy']:.2%}")
```

### Đánh Giá Mô Hình Nguồn Mở (LLaVA, v.v.)

```python
from transformers import AutoProcessor, AutoModelForVision2Seq
import torch

model_name = "llava-hf/llava-1.5-13b-hf"
processor = AutoProcessor.from_pretrained(model_name)
model = AutoModelForVision2Seq.from_pretrained(
    model_name, 
    torch_dtype=torch.float16,
    device_map="auto"
)

def evaluate_llava(dataset):
    correct = 0
    for item in dataset:
        inputs = processor(
            text=item["question"],
            images=item["image"],
            return_tensors="pt"
        ).to("cuda")
        
        outputs = model.generate(**inputs, max_new_tokens=256)
        answer = processor.decode(outputs[0], skip_special_tokens=True)
        
        if answer == item["answer"]:
            correct += 1
    
    return correct / len(dataset)

accuracy = evaluate_llava(val_data)
print(f"Độ chính xác LLaVA-1.5-13B: {accuracy:.2%}")
```

---

## Tổng Kết và Triển Vọng

### Đóng Góp Cốt Lõi của MMMU

1. **Lấp đầy khoảng trống đánh giá**: Điểm chuẩn đầu tiên đánh giá có hệ thống khả năng hiểu đa phương thức cấp đại học
2. **Cho thấy giới hạn khả năng**: Xác định rõ điểm mạnh và điểm yếu chí mạng của mô hình hiện tại
3. **Chỉ ra hướng phát triển**: Cung cấp hướng nghiên cứu cho các mô hình đa phương thức thế hệ tiếp theo
4. **Thúc đẩy tiến bộ lĩnh vực**: Mã nguồn đánh giá mở, tạo điều kiện hợp tác cộng đồng

### Triển Vọng Tương Lai

| Hướng | Tình Trạng Hiện Tại | Mục Tiêu Cải Thiện |
|-------|---------------------|-------------------|
| Thu thập kiến thức chuyên môn | Nghiêm trọng không đủ | Nắm vững sâu 30+ môn học |
| Hiểu hình ảnh không đồng nhất | Hầu hết các loại <30% | Phạm vi đầy đủ 32 loại hình ảnh |
| Tích hợp đa hình | Độ chính xác 45% | Gần bằng mức đơn hình |
| Suy luận phức tạp | Hiệu suất trung bình | Đạt cấp chuyên gia |

---

## Tài Liệu Tham Khảo

```bibtex
@inproceedings{yue2023mmmu,
  title={MMMU: A Massive Multi-discipline Multimodal Understanding and Reasoning Benchmark for Expert AGI},
  author={Xiang Yue and others},
  booktitle={Proceedings of CVPR},
  year={2024},
}

@inproceedings{yue2025mmmu-pro,
  title={MMMU-Pro: A More Robust Multi-discipline Multimodal Understanding Benchmark},
  author={Xiang Yue and others},
  booktitle={Proceedings of ACL},
  year={2025}
}
```

---

> **Thông Tin Liên Quan**
> - Website chính thức: https://mmmu-benchmark.github.io/
> - GitHub: https://github.com/MMMU-Benchmark/MMMU
> - HuggingFace: [MMMU](https://huggingface.co/datasets/MMMU/MMMU) | [MMMU-Pro](https://huggingface.co/datasets/MMMU/MMMU_Pro)
