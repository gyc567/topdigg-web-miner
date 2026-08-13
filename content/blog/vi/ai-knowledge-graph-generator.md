---
title: "AI Knowledge Graph: Chuyển đổi tài liệu phi cấu trúc thành đồ thị tri thức tương tác"
date: "2026-08-13"
description: "Phân tích sâu dự án AI Knowledge Graph Generator - công cụ chuyển đổi tài liệu văn bản phi cấu trúc thành đồ thị tri thức tương tác"
tags: ["AI", "Đồ thị tri thức", "NLP", "Python", "Trực quan hóa"]
categories: ["AI & ML"]
author: "robert-mcdermott"
image: "/assets/blog/ai-knowledge-graph/overview.png"
---

# AI Knowledge Graph: Chuyển đổi tài liệu phi cấu trúc thành đồ thị tri thức tương tác

Trong thời đại bùng nổ thông tin, chúng ta đối mặt với hàng loạt văn bản phi cấu trúc mỗi ngày. Bài báo nghiên cứu, tài liệu kỹ thuật, báo cáo doanh nghiệp, hàng nghìn cuốn sách — những nội dung này chứa đựng tri thức quý giá, nhưng lại phân tán như những mảnh ghép rời rạc, khó nhìn thấy toàn cảnh. Làm thế nào để trích xuất thông tin giá trị từ các văn bản phi cấu trúc này và trình bày mối liên kết giữa chúng một cách trực quan? Dự án **AI Knowledge Graph Generator** cung cấp cho chúng ta một giải pháp tinh tế.

## Tổng quan dự án

**AI Knowledge Graph Generator** là dự án mã nguồn mở được tạo bởi [robert-mcdermott](https://github.com/robert-mcdermott), hiện đã đạt được **2.8k Stars** và **388 Forks** trên GitHub, được cấp phép theo **Apache-2.0**.

Chức năng cốt lõi của dự án này là chuyển đổi bất kỳ tài liệu văn bản phi cấu trúc nào thành **đồ thị tri thức tương tác**, cho phép người dùng khám phá các thực thể, khái niệm và mối quan hệ giữa chúng thông qua hình ảnh hóa trực quan.

### Tính năng chính

- **Khả năng tương thích rộng**: Hỗ trợ bất kỳ điểm cuối API tương thích OpenAI nào, bao gồm Ollama, LM Studio, OpenAI, vLLM và LiteLLM
- **Phân đoạn văn bản thông minh**: Tự động chia tài liệu lớn thành các khối chồng nhau phù hợp với ngữ cảnh LLM
- **Trích xuất bộ ba SPO**: Trích xuất bộ ba Chủ ngữ-Động từ-Đối tượng từ mỗi khối văn bản
- **Chuẩn hóa thực thể**: Đảm bảo tính nhất quán của việc đặt tên thực thể xuyên suốt các khối tài liệu
- **Suy luận quan hệ**: Tự động khám phá các mối quan hệ bắc cầu giữa các thành phần bị ngắt kết nối
- **Trực quan hóa tương tác**: Sử dụng thư viện PyVis để tạo hình ảnh hóa HTML tương tác đẹp mắt

## Triết lý thiết kế cốt lõi

### Tại sao cần đồ thị tri thức?

Việc đọc văn bản truyền thống đối mặt với một số thách thức cốt lõi:

1. **Thông tin phân mảnh**: Thông tin quan trọng trong tài liệu dài phân tán ở khắp nơi, khó nắm bắt toàn cục
2. **Quan hệ ẩn**: Mối quan hệ giữa các thực thể trong văn bản thường ẩn trong các câu, khó phát hiện trực quan
3. **Cô lập tri thức**: Các kết nối giữa các tài liệu khác nhau thường bị bỏ qua

Đồ thị tri thức phân giải văn bản thành **Thực thể (Entity)** và **Quan hệ (Relation)**, lưu trữ dưới dạng cấu trúc đồ thị, cho phép chúng ta:

- Nhìn thấy nội dung cốt lõi của tài liệu ngay lập tức
- Nhanh chóng xác định các kết nối giữa các khái niệm khác nhau
- Khám phá các kết nối ẩn thông qua duyệt đồ thị

### Bộ ba SPO: Biểu diễn nguyên tử của tri thức

SPO (Subject-Predicate-Object) là nền tảng của biểu diễn tri thức. Bất kỳ tri thức nào cũng có thể được phân giải thành một chủ ngữ, một động từ và một đối tượng.

## Quy trình làm việc chi tiết

### 1. Xử lý phân đoạn

Đầu tiên, tài liệu được chia thành các khối chồng nhau có kích thước phù hợp với ngữ cảnh LLM. Chiến lược chồng lấn đảm bảo các thực thể không bị cắt đứt giữa các khối.

### 2. Trích xuất bộ ba SPO

Mỗi khối văn bản được xử lý bởi LLM để trích xuất các bộ ba SPO. Ví dụ:

*"Python được tạo bởi Guido van Rossum như một ngôn ngữ lập trình"*

→ `(Python, được tạo bởi, Guido van Rossum)`, `(Python, là, ngôn ngữ lập trình)`

### 3. Chuẩn hóa thực thể

LLM hỗ trợ căn chỉnh và giải quyết thực thể, đảm bảo cùng một thực thể được nhất quán trong toàn bộ tài liệu.

### 4. Suy luận quan hệ

Hệ thống tự động suy luận các mối quan hệ bắc cầu giữa các thành phần bị ngắt kết nối trong đồ thị.

### 5. Tạo trực quan hóa

Sử dụng thư viện PyVis để tạo đồ thị HTML tương tác với:

- Cộng đồng được mã hóa màu sắc theo phương pháp Louvain
- Kích thước nút dựa trên tầm quan trọng (degree, betweenness, eigenvector centrality)
- Quan hệ gốc hiển thị dưới dạng đường liền, quan hệ suy luận hiển thị dưới dạng đường đứt nét
- Điều khiển tương tác: zoom, pan, di chuột, lọc, điều khiển vật lý
- Chế độ sáng và tối

## Hướng dẫn cài đặt chi tiết

### Yêu cầu hệ thống

- Python 3.10 trở lên
- API key từ OpenAI hoặc nhà cung cấp tương thích OpenAI

### Các bước cài đặt

```bash
# Clone dự án
git clone https://github.com/robert-mcdermott/ai-knowledge-graph
cd ai-knowledge-graph

# Cài đặt phụ thuộc
pip install -r requirements.txt

# Chạy với tài liệu đầu vào
python generate-graph.py --input your_text_file.txt --output knowledge_graph.html
```

### Cấu hình tùy chỉnh

Chỉnh sửa `config.toml` để tùy chỉnh:

- Nhà cung cấp LLM (OpenAI/Ollama/vLLM)
- Kích thước khối và độ chồng lấn
- Cấu hình trực quan hóa

## Tóm tắt các quan điểm chính

1. **Sức mạnh của biểu diễn tri thức**: Đồ thị tri thức biến thông tin phi cấu trúc thành dữ liệu có cấu trúc có thể khám phá được

2. **SPO là nền tảng**: Bộ ba Chủ ngữ-Động từ-Đối tượng cung cấp cách biểu diễn tri thức nguyên tử, phổ quát

3. **Khả năng tương thích rộng**: Hỗ trợ nhiều nhà cung cấp LLM cho phép triển khai linh hoạt

4. **Trực quan hóa tương tác**: Không chỉ trích xuất tri thức mà còn trình bày nó theo cách có thể khám phá

5. **Tự động hóa hoàn toàn**: Toàn bộ quy trình từ đầu vào văn bản đến đầu ra đồ thị được tự động hóa

## Kết luận

AI Knowledge Graph Generator đại diện cho một bước tiến quan trọng trong việc biến đổi cách chúng ta tương tác với thông tin phi cấu trúc. Bằng cách kết hợp sức mạnh của LLM với đồ thị tri thức trực quan, dự án này mở ra những khả năng mới cho việc khám phá và hiểu hệ thống tri thức phức tạp.

Cho dù bạn là nhà nghiên cứu đang phân tích bài báo học thuật, chuyên gia kỹ thuật đang điều hướng tài liệu phức tạp, hay nhà phát triển đang xây dựng hệ thống RAG, công cụ này đều có giá trị để khám phá.

---

*Nguồn: [robert-mcdermott/ai-knowledge-graph](https://github.com/robert-mcdermott/ai-knowledge-graph) - Apache-2.0 License*
