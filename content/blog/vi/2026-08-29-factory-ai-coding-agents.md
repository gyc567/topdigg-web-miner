---
title: "Làm thế nào để Coding Agent hoàn thành các tác vụ phần mềm lớn? Nghiên cứu của Factory AI tiết lộ bước ngoặt quan trọng"
date: "2026-08-29"
description: "Nghiên cứu của Factory AI tiết lộ lý do tại sao các coding agent dừng sớm trên các tác vụ phần mềm lớn, và việc thêm tiêu chuẩn xác minh độc lập có thể cải thiện đáng kể tỷ lệ hoàn thành từ 36% lên 90%."
author: "比特财商"
tags:
  - AI Agent
  - Software Engineering
  - Factory AI
  - ProgramBench
  - Research
categories:
  - Research
---

# Làm thế nào để Coding Agent hoàn thành các tác vụ phần mềm lớn? Nghiên cứu của Factory AI tiết lộ bước ngoặt quan trọng

## Giới thiệu

Khi AI giành huy chương vàng Olympic Toán học, phá vỡ các giới hạn tối ưu hóa tổ hợp hàng thập kỷ, người ta bắt đầu tin rằng lập trình AI đã được giải quyết.

Nhưng sự thật là: **Các mô hình AI giỏi các vấn đề có tiêu chuẩn thành công nhỏ gọn và ổn định**. Các tác vụ phần mềm lớn thì ngược lại—đặc tả phần mềm mô tả kết quả mong muốn nhưng không chỉ ra phải chạy gì, kiểm tra gì và so sánh gì trước khi công việc được coi là hoàn thành.

Nghiên cứu gần đây của Factory AI đi sâu vào vấn đề này: Tại sao cùng một mô hình lại hoạt động thấp hơn mong đợi trên các tác vụ tái cấu trúc phần mềm quy mô lớn? Và tại sao việc đưa vào "tiêu chuẩn hoàn thành có thể thực thi bên ngoài" có thể tạo ra bước nhảy về chất cho cùng một mô hình?

---

## 1. Vấn đề: Tại sao Single Agent dừng sớm

### 1.1 Một thí nghiệm thực tế

Factory AI thiết kế một thí nghiệm đối chứng trên ProgramBench:

**Tác vụ**: Tái tạo GDAL (công cụ tiêu chuẩn thực tế cho xử lý dữ liệu không gian địa lý, hoạt động từ 1998, hỗ trợ hơn 200 định dạng raster và vectơ) từ đầu.

**Điều kiện thí nghiệm**:
- Chế độ Single Agent: Droid tự triển khai, tự kiểm tra, tự quyết định khi nào xong
- Chế độ System: Một vai trò Validator trước tiên thiết lập "tiêu chuẩn hoàn thành", sau đó dùng tiêu chuẩn này để "chấm điểm" công việc của Implementer

**Kết quả khiến các nhà nghiên cứu kinh ngạc:**

| Chế độ | Số dòng code | Tỷ lệ bao phủ hành vi |
|------|-------------|---------------------|
| Single Agent | 17,000 dòng | **36%** |
| System (có tiêu chuẩn độc lập) | 115,000 dòng | **90%** |

Cùng mô hình, cùng thời gian, cùng quyền thực thi—điểm khác biệt duy nhất là: **Có ai đó thiết lập tiêu chuẩn "như thế nào được coi là xong" trước không**.

Single Agent không hết ngân sách hay gặp trở ngại kỹ thuật. Nó dừng lại vì "theo đánh giá của chính nó, nó đã xong".

### 1.2 Nguyên nhân cốt lõi: Xác minh cục bộ không thể bao phủ toàn bộ

Các coding agent thường xác minh khi làm việc: triển khai một phần, viết một vài kiểm tra, chạy chúng, kiểm tra đầu ra và quyết định có tiếp tục không. Với các thay đổi nhỏ, điều này hiệu quả—tác vụ, triển khai và bằng chứng vừa đủ trong một tầm nhìn.

Nhưng các tác vụ lớn phải được phân rã thành các tính năng, hệ thống con và nhiều vòng công việc. Khi agent đến từng phần, nó cũng quyết định bằng chứng nào sẽ tính và liệu bằng chứng đó có đủ không. **Các kiểm tra này thừa hưởng phạm vi của công việc đã tạo ra chúng**. Chúng có thể xác minh mọi thứ agent định xây dựng, nhưng loại trừ các tính năng, tương tác hoặc ràng buộc mà agent không bao giờ đại diện.

Một agent có thể đạt được tiến bộ ổn định, đúng đắn cục bộ và dừng lại với phần lớn kết quả còn thiếu. Vấn đề không nhất thiết là nó không thể triển khai phần còn lại—nó **không bao giờ thiết lập được một mô tả đầy đủ về những gì còn lại chưa làm**.

---

## 2. Giải pháp: Thiết lập tiêu chuẩn hoàn thành có thể thực thi bên ngoài

### 2.1 Kiến trúc hệ thống ba vai trò

```
┌─────────────────────────────────────────────────────────────┐
│                Orchestrator (Người điều phối)               │
│  Ủy thác công việc cho Implementer và Validator,            │
│  quyết định khi nào giao hàng                               │
├──────────────────────────┬──────────────────────────────────┤
│   Implementer (Người triển khai) │  Validator (Người xác minh) │
│  Điều tra chương trình tham chiếu  │  Xây dựng "tiêu chuẩn hoàn thành"│
│  Xây dựng chương trình ứng viên   │  trước khi triển khai bắt đầu  │
│  Chạy vòng phát triển             │  Đo lường đầu ra của Implementer│
└─────────────────────────────────┴──────────────────────────┘
```

**Thiết kế chính: "Bức tường" (The Wall)**

Instrument và kết quả thô của Validator ở lại phía Validator; chỉ các phát hiện được nhóm mới qua bức tường đến Orchestrator. Implementer không bao giờ thấy các test case hoặc đầu ra thô: **một khi một mẫu thưa trở nên hiển thị, nó trở thành mục tiêu**, và vượt qua nó chỉ thiết lập các trường hợp đó, không phải không gian hành vi mà chúng được cho là đại diện.

### 2.2 Validator xây dựng tiêu chuẩn hoàn thành như thế nào

Validator xây dựng instrument bao gồm hàng trăm test case. Chính sách chấm điểm so sánh bốn kênh: mã thoát, bytes stdout, bytes stderr, và delta cây công việc đầy đủ.

### 2.3 Vòng lặp bên ngoài hoạt động như thế nào

```
1. Orchestrator chọn nên đo lường gì
2. Validator kiểm tra ứng viên hiện tại và diễn giải các lỗi
3. Orchestrator quyết định phát hiện nào là thực và công việc tiếp theo là gì
4. Implementer điều tra chương trình tham chiếu và tiến triển ứng viên
5. Khi instrument ngừng tiết lộ sự khác biệt có ý nghĩa, mở rộng các vùng yếu
```

---

## 3. Kết quả thí nghiệm

### 3.1 Hiệu suất của ba mô hình

| Mô hình | Trung vị Single Agent | Trung vị System | Khoảng cách thu hẹp |
|--------|---------------------|---------------|-------------------|
| **Fable 5 (xhigh)** | 56.7 | **89.3** | **73%** |
| **Kimi K3 (high)** | 45.1 | **75.4** | **42%** |
| **GPT-5.6 Sol (max)** | 48.6 | **66.2** | **25%** |

Các con số chính: **Tái tạo GDAL 36%→90%, 7-Zip 54%→95%, DuckDB 34%→80%**.

### 3.2 Phát hiện quan trọng

**Ngân sách tính toán không phải nút thắt cổ chai**—Mỗi chiến dịch single agent kết thúc vì agent tự quyết định kết thúc nó. Tính toán bổ sung không giúp được agent không muốn chi tiêu nó. Điều thực sự thay đổi là **sự phán đoán về hoàn thành**; tính toán đi theo từ phán đoán đó.

---

## 4. Triết lý thiết kế

### 4.1 Xác minh phải được thiết lập trước công việc

Tiêu chuẩn hoàn thành không được phép "sụp đổ" xung quanh những gì đã được xây dựng. Nó phải được suy ra từ kết quả, trước khi triển khai thu hẹp sự chú ý thành các mục công việc riêng lẻ.

### 4.2 Thiết kế "Bức tường" ngăn chặn "ô nhiễm" tiêu chuẩn

Nếu Implementer nhìn thấy các test case, những test case đó trở thành mục tiêu. Giữ instrument của Validator không hiển thị với Implementer đảm bảo tính toàn vẹn của đo lường.

### 4.3 Tiêu chuẩn bên ngoài quan trọng hơn khả năng mô hình

Single agent không thiếu kỹ năng. Nó thiếu tiêu chuẩn hoàn thành. **Một tiêu chuẩn độc lập, được viết bởi cùng một mô hình, thúc đẩy việc triển khai gần hơn nhiều đến sự tương đương hành vi**.

---

## 5. Kết luận cốt lõi

**Kết luận 1: AI giỏi các vấn đề có "tiêu chuẩn nhỏ gọn"; các tác vụ phần mềm lớn không thuộc loại này**

Các đột phá của AI trong toán học và tối ưu hóa ràng buộc xảy ra vì "thành công" có thể được định nghĩa và xác minh đầy đủ. Nhưng "hoàn thành" của tác vụ phần mềm thường mơ hồ.

**Kết luận 2: Single agent dừng sớm không phải vì thiếu khả năng, mà vì thiếu "danh sách chưa làm" đầy đủ**

Nó không biết mình đã hoàn thành bao nhiêu—chỉ biết mình đã làm bao nhiêu.

**Kết luận 3: Đưa vào Validator bên ngoài với tiêu chuẩn hoàn thành có thể tạo ra bước nhảy về chất cho cùng một mô hình**

Fable 5 đi từ 36%→90% trên GDAL không phải từ nâng cấp mô hình—nó đến từ hành động "thiết lập tiêu chuẩn".

**Kết luận 4: Thiết kế "Bức tường" ngăn chặn tiêu chuẩn bị "ô nhiễm"**

Một khi các test case trở nên hiển thị, chúng trở thành mục tiêu.

**Kết luận 5: Cách tiếp cận này tổng quát hóa cho công việc phần mềm thực tế**

Điều tổng quát là **cần một tiêu chuẩn hoàn thành có thể thực thi bên ngoài**—được suy ra từ kết quả, trước khi triển khai thu hẹp sự chú ý, và được duy trì cho đến khi công việc đáp ứng nó.

---

## Kết luận

Nghiên cứu này có ý nghĩa sâu sắc nhất không phải ở một đột phá kỹ thuật cụ thể, mà là **sự thay đổi trong khung nhận thức**:

Chúng ta từng nghĩ rằng để AI hoàn thành tốt hơn các tác vụ phần mềm, điều quan trọng là nâng cao khả năng code của mô hình. Nhưng thí nghiệm của Factory AI cho thấy **vấn đề không phải là "có thể viết được không", mà là "có biết khi nào mình xong không"**.

Khi thiết kế hệ thống coding agent tiếp theo, có lẽ câu hỏi không nên là "mô hình này mạnh đến đâu", mà là "hệ thống này có tiêu chuẩn hoàn thành có thể thực thi bên ngoài không"?

Câu trả lời khác nhau, kiến trúc hệ thống sẽ hoàn toàn khác.
