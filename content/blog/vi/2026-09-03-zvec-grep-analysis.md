---
title: "zvec-grep - Trợ lý Lập trình AI Ưu tiên Cục bộ: Tìm kiếm Thống nhất Ngữ nghĩa và Từ vựng"
date: "2026-09-03"
description: "Phân tích chuyên sâu dự án mã nguồn mở zvec-grep (zg) của Alibaba: lớp tìm kiếm thống nhất kết hợp ripgrep, BM25 và tìm kiếm vector, kết nối với các công cụ lập trình AI như Codex và Claude Code qua MCP, thực hiện tìm kiếm ngữ nghĩa ưu tiên cục bộ. Bao gồm hướng dẫn cài đặt chi tiết, phân tích kiến trúc, tích hợp đa Agent và triết lý thiết kế cốt lõi."
tags:
  - zvec-grep
  - zg
  - zvec
  - tìm kiếm ngữ nghĩa
  - BM25
  - tìm kiếm vector
  - RRF fusion
  - MCP
  - trợ lý lập trình AI
  - ưu tiên cục bộ
  - ripgrep
  - mã nguồn mở
categories:
  - Phân tích công cụ AI
  - Công cụ năng suất phát triển
  - Lập trình AI
---

# zvec-grep - Trợ lý Lập trình AI Ưu tiên Cục bộ: Tìm kiếm Thống nhất Ngữ nghĩa và Từ vựng

> **Tư tưởng cốt lõi: zvec-grep (viết tắt zg) thống nhất tìm kiếm ngữ nghĩa, xếp hạng từ vựng BM25 và khớp regex chính xác trong một cổng tìm kiếm ưu tiên cục bộ duy nhất, cho phép cả nhà phát triển người và trợ lý lập trình AI chia sẻ cùng một bộ chỉ mục. Vấn đề cốt lõi nó giải quyết: khi AI Agent cần tìm "chỗ xử lý lưu trữ sở thích theme" trong codebase của bạn, làm thế nào để tìm được nó khi không biết từ khóa chính xác, đồng thời giữ tất cả dữ liệu cục bộ?**

---

## 1. Bối cảnh dự án và định vị cốt lõi

### 1.1 Tại sao cần zvec-grep?

Trong thời đại các trợ lý lập trình AI bùng nổ, có một mâu thuẫn được nhắc đi nhắc lại:

- **Tìm kiếm chính xác** (ripgrep): Bạn biết từ khóa cần tìm là gì, nhưng không biết vị trí cụ thể
- **Tìm kiếm ngữ nghĩa** (tìm kiếm vector): Bạn biết muốn làm gì, nhưng không biết nên dùng từ nào

Ví dụ, bạn muốn tìm code "xử lý lưu trữ sở thích theme". Có thể bạn sẽ tìm "theme preference persistence" hoặc "loadTheme". Cái trước ngữ nghĩa liên quan nhưng từ không khớp; cái sau chính xác nhưng đòi hỏi bạn đoán đúng tên biến.

Vấn đề phức tạp hơn là **bẫy tìm kiếm của AI Agent**. Khi các trợ lý lập trình AI như Claude Code, Codex cần tìm câu trả lời trong kho lưu trữ cục bộ của bạn, chúng đối mặt với hai lựa chọn:
- Tìm kiếm theo từ khóa (dễ bỏ sót code liên quan ngữ nghĩa nhưng khác cách diễn đạt)
- Tìm kiếm ngữ nghĩa (phụ thuộc API từ xa, rủi ro quyền riêng tư)

Câu trả lời của zvec-grep: **Cả hai đều cần, ưu tiên cục bộ.** Nó thống nhất khớp chính xác của ripgrep, xếp hạng từ vựng BM25 và phát hiện ngữ nghĩa của tìm kiếm vector — tất cả chạy cục bộ, không cần upload code lên bất kỳ server từ xa nào.

### 1.2 Thông tin cơ bản dự án

| Chỉ số | Dữ liệu |
|--------|----------|
| Tên dự án | zg (zvec-grep) |
| Engine cơ sở | zvec (Alibaba mã nguồn mở) |
| Tech stack | ripgrep + BM25 + Tìm kiếm vector + RRF Fusion |
| Cài đặt | npm install -g @zvec/zvec-grep |
| Yêu cầu Node.js | Node.js 22+ |
| Hỗ trợ nền tảng | macOS, Linux, Windows |
| Hỗ trợ AI Agent | Codex, Claude Code, Qwen Code, Qoder, Cursor, OpenCode |
| Giao thức | MCP server cục bộ, mặc định chỉ listen loopback |

---

## 2. Nguyên lý kỹ thuật cốt lõi

### 2.1 Ba Gác súng Tìm kiếm: Từ vựng + Ngữ nghĩa + Chính xác

Engine cốt lõi của zvec-grep cung cấp hai đường dẫn tìm kiếm bổ sung:

**Đường dẫn 1: Truy xuất có lập chỉ mục (Indexed Retrieval)**

Phù hợp cho: Ý định, khái niệm liên quan và từ khóa được xếp hạng

Nguồn dữ liệu: Dữ liệu BM25/FTS và vector trong chỉ mục workspace

Cách hoạt động:
1. **Tìm kiếm vector**: Mã hóa truy vấn thành vector, tìm các đoạn nội dung ngữ nghĩa tương tự trong không gian vector
2. **Tìm kiếm từ vựng BM25**: Phân tích từ vựng truy vấn để tìm tài liệu chứa các thuật ngữ liên quan
3. **RRF Fusion**: Kết hợp kết quả xếp hạng từ tìm kiếm vector và BM25 bằng thuật toán hợp nhất xếp hạng tương hỗ

**Đường dẫn 2: ripgrep được quản lý (Managed ripgrep)**

Phù hợp cho: Văn bản đã biết, ký hiệu, đường dẫn và biểu thức chính quy

Nguồn dữ liệu: Quét trực tiếp các tệp workspace mà không cần chỉ mục

Đặc điểm: Tìm kiếm toàn diện, có thể định vị chính xác bằng regex.

### 2.2 RRF Fusion: Tại sao Tìm kiếm Hybrid mạnh hơn

RRF (Reciprocal Rank Fusion) là thuật toán cổ điển trong lĩnh vực truy xuất thông tin. Ý tưởng cốt lõi: **Nếu một kết quả xếp hạng cao trong nhiều phương pháp tìm kiếm, nó nên xếp hạng cao trong kết quả cuối cùng.**

Cách tiếp cận hybrid này tránh được các điểm yếu của cả hai:
- Tìm kiếm vector thuần túy: "Ngữ nghĩa tương tự nhưng từ khóa không khớp"
- BM25 thuần túy: "Từ khóa khớp nhưng ngữ nghĩa không liên quan"

### 2.3 Trích xuất nội dung nhận biết cấu trúc

zvec-grep không chỉ coi các tệp là văn bản không cấu trúc — nó sử dụng các trình trích xuất khác nhau cho các loại tệp khác nhau, bảo tồn thông tin cấu trúc hữu ích:

| Loại tệp | Trình trích xuất | Thông tin được bảo tồn |
|----------|------------------|------------------------|
| Code (C/C++/Go/Java/JS/TS/Python/Rust) | CodeExtractor | Ký hiệu, chữ ký, breadcrumb, mã nguồn xung quanh |
| Component Vue/Svelte | CodeExtractor | Khối `<script>` |
| Markdown | MarkdownExtractor | Phần tiêu đề, breadcrumb |
| Tệp cấu hình (JSON/YAML/TOML/CSV) | TextExtractor | Đoạn văn bản thuần túy |
| Tài liệu văn bản thuần túy | TextExtractor | Đoạn văn bản thuần túy |
| Hình ảnh (cần bao gồm rõ ràng) | ImageExtractor | Nội dung hình ảnh (cần mô hình Embedding đa phương thức) |

---

## 3. Phân tích Kiến trúc

### 3.1 Sơ đồ Kiến trúc Hệ thống

```
Tầng Người dùng
  │
  ├── Người/script ──→ zg CLI
  │
  └── AI Agent ──→ MCP Client ──→ MCP Server Cục bộ

Tầng Thực thi
  │
  └── Router ──→ Direct hoặc Server
                      │
                      ▼
               ┌─────────────────┐
               │  zvec-grep Engine │
               └────────┬────────┘
                        │
         ┌──────────────┼──────────────┐
         ▼              ▼              ▼
   Truy xuất chỉ mục  ripgrep được     Xây dựng chỉ mục
   (BM25+vector        quản lý          (quét+
    +RRF fusion)       (văn bản chính    trích xuất+
                       xác+regex)        embed)

Tầng Dữ liệu
  │
  ├── Tệp workspace ──→ Quét trực tiếp
  │
  └── Tệp workspace ──→ Thư mục chỉ mục .zvec-grep/
```

### 3.2 Ranh giới Bảo mật Ưu tiên Cục bộ

| Loại dữ liệu | Hành vi mặc định | Yêu cầu ủy quyền |
|--------------|------------------|------------------|
| Quét tệp workspace | Hoàn toàn cục bộ | Không |
| Mô hình Embedding cục bộ | Hoàn toàn cục bộ | Không |
| Lưu trữ chỉ mục workspace | Hoàn toàn cục bộ (~/.zvec-grep/) | Không |
| MCP server | Chỉ listen loopback | Không |
| API Embedding từ xa | Cần ủy quyền rõ ràng | Mỗi lần hỏi người dùng |

---

## 4. Hướng dẫn Cài đặt và Sử dụng Chi tiết

### 4.1 Yêu cầu Môi trường

- Node.js 22.0.0 trở lên
- npm hoặc yarn
- Hỗ trợ: macOS, Linux, Windows

### 4.2 Các bước Cài đặt

**Bước 1: Cài đặt toàn cục**

```bash
npm install -g @zvec/zvec-grep
```

**Bước 2: Xác minh cài đặt**

```bash
zg help
zg version
```

**Bước 3: Tạo Workspace demo**

```bash
mkdir zg-demo && cd zg-demo

curl --retry 3 --retry-all-errors --progress-bar -fL \
  -o alice-in-wonderland.txt \
  https://raw.githubusercontent.com/GITenberg/Alice-s-Adventures-in-Wonderland_11/master/11.txt

curl --retry 3 --retry-all-errors --progress-bar -fL \
  -o sherlock-holmes.txt \
  https://raw.githubusercontent.com/GITenberg/The-Memoirs-of-Sherlock-Holmes_834/master/834.txt
```

**Bước 4: Xây dựng chỉ mục**

```bash
zg index --embedding local/potion-retrieval-32m
```

**Bước 5: Thực hiện truy vấn**

```bash
# Tìm kiếm ngữ nghĩa
zg query --human "An unseen creature left a few marks. What did the detective infer?" --limit 3

# Tìm kiếm từ vựng
zg query --fts "marks" --limit 5

# Tìm kiếm regex thuần túy (không cần chỉ mục)
zg query --rg -n "detective" sherlock-holmes.txt
```

### 4.3 Lập chỉ mục Kho code

```bash
cd /path/to/your/project

zg index \
  --embedding local/potion-code-16m-v2 \
  -g "src/**" \
  -g "docs/**" \
  -g "!dist/**" \
  -t ts
```

### 4.4 Hướng dẫn Chọn Mô hình Embedding

| Kịch bản sử dụng | Mô hình được khuyến nghị | Đặc điểm |
|------------------|--------------------------|-----------|
| Lập chỉ mục kho code nhanh | local/potion-code-16m-v2 | Mô hình Model2Vec tĩnh nhỏ, giới hạn 1024 token |
| Truy xuất tài liệu tiếng Anh nhanh | local/potion-retrieval-32m | Mô hình tĩnh tối ưu hóa truy xuất, vector 512 chiều |
| Truy xuất tài liệu đa ngôn ngữ nhanh | local/potion-multilingual-128m | Hỗ trợ 101 ngôn ngữ, vector 256 chiều |
| Transformer chuyên dụng cho code | local/jina-embeddings-v2-base-code | Hướng code, đa ngôn ngữ, 8192 token |
| Không có runtime mô hình cục bộ | qwen/qwen3.7-text-embedding | API từ xa, 128K token |

**Đặt mô hình mặc định:**

```bash
zg config model set local/potion-code-16m-v2 --default
```

### 4.5 Tích hợp với Trợ lý Lập trình AI

```bash
# Cài đặt cho Claude Code
zg install --target claude --yes

# Cài đặt cho tất cả Agent được hỗ trợ
zg install --target all --yes
```

---

## 5. Cấu hình MCP Server

### 5.1 Khởi động MCP Server

```bash
# Như daemon
zg server on

# Với cổng và token
zg server on --listen 127.0.0.1:8080 --token-file ~/.zg-token
```

---

## 6. Benchmark và Hiệu suất

### 6.1 Kết quả kiểm tra

| Kho | Loại câu hỏi | Mô tả |
|-----|--------------|-------|
| pylint-dev/pylint | What (Kiến trúc) | Các nút AST phân biệt khởi tạo thuộc tính có chú thích kiểu và không chú thích như thế nào? |
| matplotlib/matplotlib | Where (Dữ liệu/Luồng điều khiển) | FontInfo truyền dữ liệu phông chữ qua pipeline kết xuất như thế nào? |
| django/django | Why (Nguyên lý thiết kế) | Ràng buộc duy nhất của trường username tương tác với xử lý giao dịch ORM Django như thế nào? |

**Phát hiện cốt lõi:**

- **Phát hiện ngữ nghĩa thu hẹp không gian tìm kiếm**: Tìm kiếm vector tìm các vùng liên quan ngữ nghĩa trước
- **Định vị từ vựng cho định danh chính xác**: BM25/RRF tìm kết quả khớp chính xác trong các vùng đó
- **Bằng chứng nhỏ gọn giảm chi phí**: Bằng chứng được định vị chính xác giảm lượng ngữ cảnh mà mô hình cần xử lý

---

## 7. Triết lý Thiết kế

### 7.1 Ưu tiên Cục bộ không phải là Khẩu hiệu

Ưu tiên cục bộ của zvec-grep có nhiều lớp ý nghĩa:

- **Dữ liệu không rời khỏi máy**: Quét tệp được thực hiện cục bộ, tệp chỉ mục được lưu cục bộ
- **Tái sử dụng chỉ mục**: Lập chỉ mục một lần, chia sẻ giữa CLI và tất cả AI Agent
- **Cân bằng quyền riêng tư và hiệu suất**: Mô hình Embedding cục bộ chạy hoàn toàn ngoại tuyến; Embedding từ xa cần ủy quyền rõ ràng

### 7.2 Thiết kế Tìm kiếm Hướng Agent

Công cụ tìm kiếm truyền thống được thiết kế cho con người — trả về nhiều kết quả, để con người tự đánh giá mức độ liên quan.

zvec-grep được thiết kế cho AI Agent — trả về số lượng nhỏ bằng chứng chất lượng cao được định vị chính xác, giảm số lần gọi công cụ và tiêu thụ ngữ cảnh của Agent.

**Ba chỉ số quan trọng:**
1. **Ít lệnh gọi công cụ hơn**: Một tìm kiếm chính xác thay thế nhiều tìm kiếm thô
2. **Ít token tiêu thụ hơn**: Đoạn bằng chứng nhỏ gọn hiệu quả hơn toàn bộ tệp
3. **Ít nhiễu hơn**: Xếp hạng và lọc đảm bảo kết quả không liên quan được xếp sau

---

## 8. Tổng hợp: Quan điểm và Kết luận Cốt lõi

### 8.1 zvec-grep giải quyết vấn đề gì

**Vấn đề cốt lõi: Bẫy tìm kiếm của AI Agent trong codebase cục bộ**

Giải pháp của zvec-grep: Sử dụng hợp nhất RRF để thống nhất tìm kiếm vector và xếp hạng từ vựng BM25 — tất cả chạy cục bộ.

### 8.2 Lợi thế chính

1. **Tìm kiếm hybrid**: Phát hiện ngữ nghĩa + Định vị từ vựng + Hợp nhất RRF
2. **Ưu tiên cục bộ**: Tệp và chỉ mục không rời khỏi máy, hỗ trợ sử dụng ngoại tuyến hoàn toàn
3. **Native cho Agent**: Tích hợp MCP giúp tất cả trợ lý lập trình AI chính tự động có khả năng tìm kiếm cục bộ
4. **Nhận biết cấu trúc**: Bảo tồn ký hiệu code, chữ ký và đường dẫn breadcrumb
5. **Tái sử dụng chỉ mục**: Một chỉ mục, chia sẻ bởi CLI và tất cả Agent
6. **Lựa chọn Embedding linh hoạt**: Từ mô hình cục bộ nhỏ (~16M tham số) đến API từ xa lớn (128K ngữ cảnh)

### 8.3 Tóm tắt Triết lý Cốt lõi bằng một câu

> **Nhận định cốt lõi của zvec-grep: Điều các trợ lý lập trình AI cần không phải là mô hình từ xa mạnh hơn, mà là lập chỉ mục và truy xuất cục bộ thông minh hơn.** Thống nhất tìm kiếm ngữ nghĩa và khớp chính xác cho phép AI Agent có thể cả "hiểu code làm gì" và "tìm nó ở đâu" — tất cả thực hiện cục bộ, không rò rỉ một dòng code nào.

---

## 9. Tham khảo Nhanh

**Cài đặt:**
```bash
npm install -g @zvec/zvec-grep
```

**Lập chỉ mục:**
```bash
zg index --embedding local/potion-code-16m-v2
```

**Tìm kiếm:**
```bash
zg query "nội dung tìm kiếm của bạn"
zg query --fts "từ khóa chính xác"
zg query --vector "mô tả ngữ nghĩa"
zg query --rg -n "mẫu regex" src
```

**Tích hợp Agent:**
```bash
zg install --target claude --yes
zg install --target all --yes
```

**Tài liệu chính thức:** https://github.com/zvec-ai/zvec-grep
