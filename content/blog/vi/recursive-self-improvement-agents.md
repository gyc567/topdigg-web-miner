---
title: "Tự Cải Thiện Đệ Quy Cho Coding Agents: Từ Một Prompt Đến Kết Quả SOTA"
description: "Phân tích chuyên sâu về cách đội ngũ Cline đạt điểm SOTA 88.8% trên Terminal-Bench 2.1 nhờ tự cải thiện đệ quy, chỉ tốn $49.8 — chưa bằng một phần mười chi phí của các phương pháp cạnh tranh. Bao gồm hướng dẫn đầy đủ, các quan điểm, và triết lý thiết kế."
date: "2026-07-30"
author: "TopDigg Research Team"
tags: ["Recursive Self-Improvement", "Coding Agents", "Cline", "Terminal-Bench", "AI Agent", "Self-Optimization", "SOTA", "Hill Climbing", "Prompt Engineering"]
categories: ["Deep Dive"]
keywords: ["tự cải thiện đệ quy", "RSI", "coding agents", "Cline", "Terminal-Bench", "AI Agent", "tự tối ưu hóa", "SOTA", "đánh giá tự động"]
---

# Tự Cải Thiện Đệ Quy Cho Coding Agents: Từ Một Prompt Đến Kết Quả SOTA

## Tóm Tắt

Bài viết này cung cấp phân tích chuyên sâu về cách đội ngũ Cline tận dụng công nghệ **Tự Cải Thiện Đệ Quy (RSI)** để điều khiển một coding agent trong 17 giờ chỉ với một prompt duy nhất, đạt điểm SOTA 88.8% trên Terminal-Bench 2.1 với chi phí chỉ $49.8 — thấp hơn đáng kể so với $552 của Fable 5 hay $400 của GPT-5.6 Terra. Bài viết bao quát toàn bộ bối cảnh dự án, hướng dẫn từng bước, các quan điểm then chốt, và triết lý thiết kế.

**Từ khóa**: Tự Cải Thiện Đệ Quy, Coding Agents, Cline, Terminal-Bench, AI Agent, Tự Tối Ưu Hóa, SOTA

---

## 1. Mô Tả Dự Án

### 1.1 Tự Cải Thiện Đệ Quy Là Gì?

Tự Cải Thiện Đệ Quy là ý tưởng rằng các mô hình AI có thể lặp và cải thiện chính mình để mở khóa điểm kỳ dị công nghệ. Đội ngũ Cline đã đạt được một phiên bản thực tiễn của khái niệm này — sử dụng mô hình Kimi K3 với harness của Cline, họ đạt 88.8% SOTA trên Terminal-Bench 2.1 thông qua một prompt tự cải thiện đệ quy một phát duy nhất.

### 1.2 Những Điểm Dữ Liệu Then Chốt

| Chỉ số | Giá trị |
|--------|-------|
| Điểm cuối cùng | 88.8% (79/89) |
| Chi phí mỗi lần chạy | $49.8 |
| So với chi phí Fable 5 | $552 (Cline rẻ hơn 11 lần) |
| So với chi phí GPT-5.6 Terra | $400 |
| Thời gian chạy | 17 giờ liên tục |
| Tổng lượng token tiêu thụ | 1 tỷ (400M do agent, 600M do đánh giá lặp lại) |
| Can thiệp của con người | Tối thiểu (kiểm tra vài giờ một lần) |
| Mô hình lãnh đạo | GPT-5.6-Sol |
| Mô hình mục tiêu | Kimi K3 (qua OpenRouter) |

### 1.3 Cline Là Gì?

Cline là một trợ lý lập trình AI mã nguồn mở cung cấp plugin IDE, công cụ CLI, và SDK. Nó hỗ trợ gọi nhiều mô hình và có một hệ thống harness hoàn chỉnh để chạy các đánh giá tự động (evals) và tối ưu hóa hill climbing. ClinePass cung cấp suy luận theo gói đăng ký ở mức $9.99/tháng, cho quyền truy cập ưu tiên vào các mô hình trọng số mở bao gồm Kimi K3, DeepSeek, GLM, MiniMax, và Qwen, với giới hạn tốc độ API gấp 2-5 lần chuẩn.

---

## 2. Hướng Dẫn Chi Tiết

### Bước 1: Thiết Lập Đường Cơ Sở

Đầu tiên, chạy một đánh giá Terminal-Bench 2.1 hoàn chỉnh trên mô hình mục tiêu và ghi lại điểm ban đầu.

```
Baseline run: Kimi K3 → Cline Harness → OpenRouter
Result: 69/89 (77.5%), cost $79
```

**Mục đích**: Có được một điểm khởi đầu định lượng để so sánh với mọi cải thiện tiếp theo.

### Bước 2: Viết Prompt Có Sự Hỗ Trợ Của AI

Thay vì tự tay viết một prompt hill climbing, hãy để GPT-5.6 viết prompt tự cải thiện đệ quy cho bạn:

1. Mô tả cho GPT-5.6 cách bạn thường thực hiện hill climbing
2. Mô tả cấu trúc của benchmark mục tiêu (Terminal-Bench 2.1) và phương pháp đánh giá
3. Yêu cầu GPT-5.6 chuyển quy trình thủ công của bạn thành một prompt tự cải thiện đệ quy tự động

**Kỹ thuật then chốt**: Bản nháp đầu tiên thường đã đủ toàn diện. Bạn cần:
- Bao phủ các trường hợp biên
- Định nghĩa một trạng thái kết thúc rõ ràng
- Cấm tường minh hành vi reward hacking

### Bước 3: Cấu Hình Prompt RSI

Prompt nên chứa:

1. **Định nghĩa mục tiêu**: Đạt điểm cao nhất trên Terminal-Bench 2.1
2. **Cơ chế ghi nhận thí nghiệm**: Duy trì một file lớn nơi agent ghi lại công việc đã hoàn thành sau mỗi thí nghiệm để tránh lặp lại các chu kỳ
3. **Khung thí nghiệm lặp**: Mỗi thí nghiệm tập trung vào một điểm cải thiện cụ thể
4. **Quy trình xác minh**: Chạy lại toàn bộ bộ kiểm thử sau mỗi sửa đổi để xác nhận kết quả
5. **Tự giới hạn**: Cấm sửa đổi verifier, kéo dài timeout, và reward hacking

### Bước 4: Khởi Động Chu Kỳ Thí Nghiệm

Khi prompt được gửi đi, agent tự động thực thi vòng lặp sau:

```
for each experiment:
    1. Analyze current failure pattern
    2. Identify root cause
    3. Implement fix
    4. Run full evaluation
    5. Record results to experiment log
    6. If improvement → commit and continue
       If no improvement → log as invalid experiment, move to next
```

### Bước 5: Giám Sát Và Can Thiệp

Sự can thiệp của con người nên được giữ ở mức tối thiểu tuyệt đối:
- Kiểm tra trạng thái agent mỗi 2-3 giờ
- Nhấn continue khi agent dừng ngoài ý muốn
- Chạy trên một VM đám mây để đảm bảo thực thi không bị gián đoạn
- Xem xét cuối cùng của con người đối với PR trước khi merge

---

## 3. Phân Tích Thí Nghiệm

### Thí nghiệm 0: Sửa Cấu Hình Lý Luận Tối Đa

**Vấn đề**: Harness của Cline không ánh xạ đúng mức lý luận `max` của Kimi K3 — harness âm thầm hạ nó xuống `high`.

**Sửa**: Hiệu chỉnh lớp trừu tượng để harness truyền đúng cấu hình lý luận `max`.

**Kết quả**: Không phải thay đổi điểm số, mà là một bản sửa lỗi đúng đắn quan trọng đã khai thông mọi thí nghiệm phía sau.

```
Commit: d1bc440
```

### Thí nghiệm 1: Cơ Chế Thử Lại Khi Gặp Giới Hạn Tốc Độ 429

**Vấn đề**: Năm lần thất bại ở đường cơ sở đều cùng một mô thức — OpenRouter trả về lỗi 429 và Cline bỏ cuộc. Vì lúc đó chỉ có một nhà cung cấp phục vụ Kimi K3, năng lực khá hạn hẹp.

**Sửa**: Tăng số lần thử lại với backoff hàm mũ.

**Kết quả**: Cả năm thất bại trong lát cắt chẩn đoán đều chuyển thành thành công.

```
Commit: cabfa9e
```

### Thí nghiệm 2: Phát Hiện Vòng Lặp Thông Minh Hơn (Nhận Thức Đầu Ra)

**Vấn đề**: Bộ phát hiện vòng lặp của Cline giết nhầm những agent đang hợp lệ poll công việc nền chạy lâu. Cùng một lệnh, nhưng đầu ra đang thay đổi — đó là tiến trình thực sự, không phải vòng lặp.

**Sửa**: Làm cho bộ phát hiện vòng lặp nhận thức được đầu ra — nếu đầu ra thay đổi, dù với cùng lệnh, nó được coi là tiến trình hợp lệ.

**Kết quả**: Cả hai tác vụ từng bị giết giờ đều thành công.

```
Commit: dbcdba8
```

### Thí nghiệm 3: Sửa Lỗi Ma 7,6 Giây

**Vấn đề**: Một tác vụ thoát sau 7,6 giây với không token và không phiên. Nguyên nhân gốc: bất kỳ prompt nào chứa token kiểu `@a` đều kích hoạt tra cứu nhắc đến file trên một async worker không được tham chiếu, và tiến trình thoát trước khi mô hình từng được gọi.

**Sửa**: Một bản sửa liveness một dòng đảm bảo async worker hoàn tất trước khi tiến trình thoát.

**Kết quả**: Đảo chiều tất định.

```
Commit: 289cb82
```

### Thí nghiệm 4: Ngăn Tác Vụ Tự Giết Chính Mình

**Vấn đề**: Hai tác vụ thất bại vì agent chạy `pkill -f` với một mẫu khớp với chính dòng lệnh harness của nó, tự kết thúc chính mình giữa chừng.

**Sửa**: Chuyển sang theo dõi PID thay vì các lệnh kill khớp mẫu rộng.

**Kết quả**: Cả hai tác vụ đều đảo chiều.

```
Commit: 23d5970
```

---

## 4. Kết Quả Cuối Cùng Và Xác Minh

### Kết Quả Ứng Viên Kết Hợp

```
77/89 (86.5%) at $65 → 8 tasks improved from baseline
```

### Lần Chạy Xác Nhận

```
79/89 (88.8%) at $49.8
```

### Các Điểm Xác Minh Then Chốt

- Mọi bản sửa đều là cải thiện harness tổng quát, không phải hack riêng cho benchmark
- Không sửa đổi verifier
- Không phát hiện tên tác vụ
- Không kéo dài timeout
- Mô hình tự kiểm toán với các rào chắn quy gán và loại trừ các lần chạy không hợp lệ
- Con người xem xét PR trước khi merge

---

## 5. Quan Điểm Quy Nạp Và Kết Luận

### Quan điểm 1: Nút Thắt Cổ Chai Không Phải Là Mô Hình — Mà Là Con Người

> "Ở thời điểm này, chúng tôi rất rõ ràng rằng **nút thắt cổ chai không phải là mô hình mà là con người sử dụng chúng.**"

Sáu tháng công việc hill climbing đã đi từ việc đọc thủ công các trace, hình thành giả thuyết, kiểm thử bản sửa, đến một prompt duy nhất + 17 giờ thực thi tự động. Điều này đánh dấu một sự chuyển dịch nền tảng trong mô hình kỹ thuật AI — con người chuyển từ "người thực thi" thành "người thiết kế."

### Quan điểm 2: Tự Cải Thiện Đệ Quy Đã Trở Thành Hiện Thực

Thí nghiệm của đội ngũ Cline chứng minh rằng tự cải thiện đệ quy không còn là một khái niệm lý thuyết. Một prompt duy nhất có thể điều khiển một hệ thống tự động khám phá và sửa lỗi, tối ưu hóa cấu hình, và cải thiện hiệu năng qua nhiều giờ thực thi. Điều này mở ra một con đường hoàn toàn mới cho sự tự tiến hóa của các agent AI.

### Quan điểm 3: Đạt SOTA Với Chi Phí Thấp Là Khả Thi

Với $49.8, điểm SOTA 88.8% được đạt chỉ ở mức 9% chi phí của Fable 5. Điều này chứng minh rằng:
- Phương pháp đúng đắn quan trọng hơn tính toán vũ phu
- Prompt được thiết kế tốt + vòng lặp thí nghiệm tự động = ROI cực cao
- Chi phí suy luận mô hình tiên tiến hoàn toàn đáng để đầu tư cho một số tác vụ nhất định

### Quan điểm 4: Reward Hacking Có Thể Được Ngăn Chặn Bằng Thiết Kế

Các nhà thiết kế thí nghiệm đã ngăn chặn reward hacking qua các cơ chế sau:
- Prompt cấm tường minh hành vi gian lận
- Không sửa đổi verifier
- Không phát hiện tên tác vụ
- Không kéo dài timeout
- Cơ chế tự kiểm toán của mô hình loại trừ các lần chạy không hợp lệ
- Xem xét cuối cùng của con người như tuyến phòng thủ cuối cùng

### Quan điểm 5: Cải Thiện Harness Tổng Quát Thắng Hack Riêng Cho Benchmark

Cả năm bản sửa đều là cải thiện harness tổng quát, không phải riêng cho benchmark. Chiến lược "cải thiện trực giao" này nghĩa là:
- Cải thiện có **tính khái quát** — các bản sửa áp dụng cho các kịch bản rộng hơn
- Hệ thống có **tính bảo trì** — không có mã mỏng manh gắn với một benchmark cụ thể
- Hiệu năng có **tính bền vững** — hack không làm suy giảm khả năng của mô hình ở các chiều khác

### Quan điểm 6: Bản Thân Việc Đánh Giá AI Cũng Cần AI Tối Ưu Hóa

Quy trình eval + hill climbing do con người lãnh đạo truyền thống đòi hỏi hàng tuần lao động thủ công. Tự cải thiện đệ quy nén điều này xuống còn 17 giờ thời gian chạy tự động. Điều này báo trước rằng bản thân hạ tầng đánh giá AI cũng cần các agent AI để tối ưu hóa và bảo trì.

### Quan điểm 7: Cline Là Harness Tốt Nhất Cho Tối Ưu Hóa Kimi K3

Cline đã khớp điểm SOTA của harness Kimi chính thức của Moonshot. Dùng ClinePass cũng cung cấp suy luận được trợ giá ($9.99/tháng), với giới hạn tốc độ API gấp 2-5 lần chuẩn.

---

## 6. Triết Lý Thiết Kế

### 6.1 Mô Hình Cộng Tác "Giám Sát Con Người + Thực Thi Máy"

Cốt lõi của triết lý thiết kế RSI là tái định nghĩa sự phân công lao động người-máy:
- **Vai trò con người**: Thiết kế prompt, định nghĩa các điều kiện biên, đặt rào chắn, xem xét cuối cùng
- **Vai trò agent**: Thực thi thí nghiệm, phân tích thất bại, định vị nguyên nhân gốc, triển khai bản sửa, ghi lại thành tựu

Đây không phải là "để AI chạy hoàn toàn tự chủ" mà là xây dựng một hệ thống lai của **mục tiêu do con người định nghĩa + thăm dò tự chủ của máy**.

### 6.2 Rào Chắn Được Đặt Lên Hàng Đầu

Hệ thống ưu tiên các cơ chế chống gian lận ngay từ ban đầu:
- Cấm tường minh reward hacking
- Cấm sửa đổi verifier
- Không phát hiện tên tác vụ
- Không kéo dài timeout
- Cơ chế tự kiểm toán của mô hình

Triết lý "tránh gian lận bằng thiết kế" này hiệu quả hơn việc phát hiện sau thực tế.

### 6.3 Cải Thiện Trực Giao

Bản sửa của mỗi thí nghiệm dành riêng cho cải thiện harness tổng quát, không phải hack riêng cho benchmark. Thiết kế trực giao này đảm bảo:
- **Tính di trú**: các bản sửa áp dụng cho các kịch bản rộng hơn
- **Tính bảo trì**: không có mã mỏng manh gắn với các benchmark cụ thể
- **Tính bền vững**: hack không làm suy giảm khả năng của mô hình ở các chiều khác

### 6.4 Ghi Chép Là Trí Thông Minh

Agent duy trì một file khổng lồ để ghi lại thành tựu của mỗi thí nghiệm, ngăn chặn công việc lặp lại và các vòng lặp tuần hoàn. Thiết kế tưởng chừng đơn giản này thực ra là hạ tầng quan trọng cho hệ thống tự cải thiện đệ quy:
- Tránh thất bại lặp lại
- Tích lũy tri thức kinh nghiệm
- Cung cấp ngữ cảnh quyết định
- Trao cho agent trí nhớ dài hạn

### 6.5 Xác Minh Tiến Dần

Hệ thống sử dụng cơ chế xác minh nhiều lớp:
1. **Xác minh cấp thí nghiệm**: Chạy kiểm thử mục tiêu ngay sau mỗi thay đổi
2. **Xác minh cấp kết hợp**: Chạy lại tất cả các thí nghiệm cùng nhau
3. **Xác minh cấp xác nhận**: Lần chạy xác nhận độc lập
4. **Xem xét cuối cùng của con người**: Con người xem xét PR trước khi merge

Xác minh tiến dần này đảm bảo mỗi cải thiện đều đáng tin cậy, không phải sự trùng hợp may mắn.

### 6.6 Tối Ưu Hóa Chi Phí-Hiệu Quả

Hệ thống coi kiểm soát chi phí là một trong những mục tiêu thiết kế cốt lõi:
- Tránh lãng phí token cho các lần thử lại vô vọng
- Giảm các lần chạy lại không cần thiết bằng cách sửa các lỗi tự giết
- Đạt điểm cao nhất với chi phí thấp nhất
- Mỗi thí nghiệm có phân tích chi phí-lợi ích rõ ràng

### 6.7 Mở Theo Thiết Kế

Cline là một dự án mã nguồn mở, và mọi prompt thí nghiệm, trace, và phân tích chi phí đều được chia sẻ minh bạch với cộng đồng qua GitHub Gist. Sự cởi mở này:
- Xây dựng lòng tin cộng đồng
- Thúc đẩy chia sẻ tri thức
- Cho phép người khác tái tạo và xác minh kết quả
- Tiến bộ cả ngành nói chung

---

## 7. Tiếp Theo Là Gì / Triển Vọng Tương Lai

1. **RSI trở thành quy trình chuẩn**: Đội ngũ Cline đã biến tự cải thiện đệ quy thành một phần chuẩn của quy trình phát hành mô hình mới — chạy baseline ngay lập tức, sau đó các prompt kiểu RSI để khai thác điều tốt nhất từ mọi mô hình.

2. **Thúc đẩy các tác vụ dài hơn**: Đội ngũ khuyến khích cộng đồng đẩy giới hạn của mô hình với nhiều tác vụ hơn và dài hơn.

3. **Tự Cải Thiện Đệ Quy không còn là thí nghiệm khoa học viễn tưởng**: Khả năng của các mô hình tiên tiến giờ đây khiến việc đánh giá AI phức tạp và tốn thời gian này trở nên khả thi. Chúng ta đang ở điểm bùng phát — các agent AI có thể tự động cải thiện hạ tầng đánh giá của các agent AI.

4. **Từ đánh giá đến sản xuất**: Công nghệ RSI có thể tối ưu hóa điểm benchmark và cũng áp dụng cho tối ưu hóa liên tục trong môi trường sản xuất, tạo thành một "vòng lặp tự cải thiện" thực sự.

---

## 8. Lời Khuyên Thực Tiễn Cho Lập Trình Viên

### Toolchain Được Khuyến Nghị

1. **Cline**: Trợ lý lập trình AI mã nguồn mở, 65k+ sao trên GitHub
2. **ClinePass**: $9.99/tháng, truy cập các mô hình Kimi K3, DeepSeek, GLM, MiniMax, Qwen
3. **OpenRouter**: Cổng API mô hình thống nhất
4. **Terminal-Bench 2.1**: Benchmark chuẩn để đánh giá các coding agents

### Khuyến Nghị Bắt Đầu

1. Bắt đầu với một benchmark đơn giản (ví dụ: một tập con của Terminal-Bench)
2. Thực hiện một lần hill climbing thủ công để hiểu quy trình
3. Dùng hỗ trợ AI để viết các prompt tự động
4. Chạy các thí nghiệm dài trên một VM đám mây
5. Giám sát và ghi lại kết quả mỗi thí nghiệm thường xuyên

### Khuyến Nghị Kiểm Soát Chi Phí

- Dùng định tuyến Kimi K3 của OpenRouter để tiết kiệm chi phí
- Nhận suy luận được trợ giá và giới hạn tốc độ cao hơn qua ClinePass
- Tránh lãng phí token cho các lần thử lại vô vọng
- Đặt giới hạn thí nghiệm hợp lý — đừng chạy vô thời hạn

---

## Tài Liệu Tham Khảo

- [Blog Tự Cải Thiện Đệ Quy của Cline](https://cline.bot/blog/recursive-self-improvement-for-coding-agents)
- [Prompt Gốc trên GitHub Gist](https://gist.github.com/arafatkatze/fe7d3743315c80d5e3e8ab1bdef39903)
- [Toàn Bộ Trace & Phân Tích Chi Phí](https://gist.github.com/arafatkatze/8ef2e3d452703fc2978715b40dff97fe)
- [Kho Lưu Trữ GitHub của Cline](https://github.com/cline/cline)
- [Giá ClinePass](https://cline.bot/cline-pass)
- [Hướng Dẫn Hill Climbing của Cline](https://cline.bot/blog/a-practical-guide-to-hill-climbing)
- [Nghiên Cứu Tự Cải Thiện Đệ Quy của Anthropic](https://www.anthropic.com/institute/recursive-self-improvement)

---

*Bài viết này dựa trên bài blog "Recursive Self Improvement for Coding Agents" của đội ngũ Cline xuất bản ngày 24 tháng 7 năm 2026, được dịch, tổ chức, và mở rộng để phân tích.*
