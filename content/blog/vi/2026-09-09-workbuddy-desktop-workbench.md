---
title: 'Dựng Personal Desktop Workbench với WorkBuddy（Hướng dẫn từ Zero）'
date: "2026-09-09"
description: "Hướng dẫn chi tiết cách dựng personal desktop workbench từ đầu với WorkBuddy, bao gồm 5 bước hoàn chỉnh, chiến lược chọn model, prompt template, triết lý thiết kế và cách deploy lên mobile."
tags:
  - WorkBuddy
  - Personal Efficiency
  - AI Workbench
  - Prompt Engineering
  - Workflow Automation
categories:
  - Hướng dẫn
  - AI Tools
  - Productivity
---

# Dựng Personal Desktop Workbench với WorkBuddy（Hướng dẫn từ Zero）

Bạn có bao giờ cảm thấy: mỗi ngày bật máy tính, phải mở cả chục phần mềm, chuyển tab liên tục, lục tìm email và chat để tìm thứ mình cần?

Đây không phải vấn đề của riêng bạn. Thông tin bị phân mảnh, khung cảnh công việc chia tan — đây là nỗi đau của mọi người làm việc tri thức.

Bài viết này giới thiệu một phương pháp: dùng WorkBuddy để dựng từ đầu một **personal desktop workbench** cho riêng bạn — tập hợp mọi thứ cần làm, thông tin cần xem, file cần xử lý vào một trang duy nhất, như một cuốn sổ tay số.

## 一、Personal Desktop Workbench là gì

Nói đơn giản, desktop workbench là một trang web, mở trình duyệt là dùng được. Nó gom lại những thứ sau:

- Danh sách việc hôm nay
- Ghi chú ý tưởng nhanh
- Đường tắt tới trang hay dùng
- Bộ đếm Pomodoro tập trung
- Theo dõi tiến độ hôm nay

Nó không phải phần mềm quản lý dự án phức tạp, mà là **trang đầu tiên mở mỗi ngày**. Không cần học thao tác phức tạp, không cần đăng nhập hệ thống nào, chỉ cần mở trình duyệt, biết ngay hôm nay phải làm gì.

### So sánh với công cụ thông thường

| Đặc điểm | Công cụ thường | Personal Workbench |
|----------|----------------|-------------------|
| Cách triển khai | Dịch vụ SaaS | File HTML cục bộ |
| Lưu trữ dữ liệu | Server đám mây | localStorage trong trình duyệt |
| Mức độ tùy biến | Tính năng cố định | Hoàn toàn tùy biến |
| Chi phí bảo trì | Phụ thuộc nhà cung cấp | Một lần dựng, dùng mãi mãi |
| Phụ thuộc mạng | Bắt buộc online | Có thể dùng offline hoàn toàn |

## 二、Bước 1: PREPARE — Thiết lập workspace

### 2.1 Tạo thư mục làm việc cục bộ

Tạo thư mục mới trên màn hình desktop, đặt tên `WorkBuddy`. Thư mục này dùng để lưu:

- File do AI tạo ra
- Tài liệu cần AI xử lý
- Hình ảnh và dữ liệu liên quan công việc

### 2.2 Tạo workspace trong WorkBuddy

Sau khi mở phần mềm WorkBuddy:

1. Nhận 100 điểm đăng nhập hàng ngày (điểm tích lũy dần)
2. Gõ "tạo workspace mới" vào hộp thoại bên phải
3. Chọn "mở thư mục cục bộ", trỏ tới thư mục `WorkBuddy` vừa tạo

Sau bước này, mọi file AI tạo ra trong workspace sẽ được lưu vào thư mục `WorkBuddy`.

## 三、Bước 2: MODEL — Chọn model phù hợp

Việc chọn model ảnh hưởng trực tiếp tới thẩm mỹ giao diện và chất lượng code của bản đầu tiên.

### 3.1 Model được khuyến nghị

| Tình huống | Model khuyến nghị | Giải thích |
|------------|-------------------|------------|
| Việc đơn giản (placeholder, bản thử) | Hy3 (Hỗn Nguyên 3) | Miễn phí theo thời hạn, không tốn điểm |
| Độ phức tạp trung bình | Deepseek-V4-Flash | Tiết kiệm điểm, hiệu quả tốt |
| Việc phức tạp (thiết kế giao diện, chất lượng code) | GLM-5.2 hoặc Kimi K3 | Khả năng mạnh, kết quả tốt |

### 3.2 Chiến lược chọn model

Việc đơn giản dùng model miễn phí trước để tiết kiệm điểm; việc phức tạp thì đừng tiết kiệm, cần mạnh thì dùng model mạnh. Khả năng model ảnh hưởng trực tiếp tới chất lượng đầu ra — đặc biệt rõ với code frontend. Khả năng frontend của Kimi K3 trong thực tế không thua GPT.

## 四、Bước 3: PROMPT — Viết rõ yêu cầu

Viết prompt là bước quan trọng nhất trong toàn bộ quá trình. Tôi đã tổng hợp ba câu hỏi cốt lõi:

**01 Workbench của tôi trông như thế nào?**
Mô tả phong cách tổng thể, màu sắc, bố cục giao diện.

**02 Workbench của tôi làm được những gì?**
Liệt kê các tính năng cụ thể, giải thích rõ công dụng của từng tính năng.

**03 Workbench của tôi cần những skill/connector/automation gì?**
Có cần kết nối API bên ngoài, tác vụ tự động hóa, đồng bộ dữ liệu không. Bước này có thể bỏ qua, không bắt buộc.

### Lưu ý

- Ba bước không cố định, có thể thêm bớt tùy nhu cầu
- Đừng muốn quá nhiều tính năng cùng lúc, tính năng càng nhiều càng phức tạp
- Workbench không làm xong trong một lần, cần trao đổi điều chỉnh nhiều lần
- Mỗi lần chỉ đưa ra 1-2 yêu cầu chỉnh sửa, lặp lại cải thiện

## 五、Bước 4: TEMPLATE — Prompt template dùng được ngay

Sau đây là prompt template hoàn chỉnh, copy rồi chỉnh sửa theo nhu cầu của bạn và gửi cho WorkBuddy:

```
Tôi muốn làm một desktop workbench dạng web, một file HTML mở là dùng được, không cần backend phức tạp.

【Nó làm gì】
Đây là trang tôi mở đầu tiên mỗi ngày khi bật máy tính, như một "desktop số", đặt mọi thứ hay dùng vào một màn hình, không cần chuyển đổi qua lại giữa các phần mềm.

【Những gì nó làm được】
1. Xem giờ và trạng thái hôm nay: ngày tháng, giờ, tuần thứ mấy, một câu mục tiêu hôm nay
2. Ghi việc: thêm việc cần làm nhanh, click đánh dấu hoàn thành, xóa được
3. Ghi ý tưởng: vùng ghi chú nhanh, tự động lưu, refresh không mất
4. Đường tắt: hàng icon trang web và công cụ hay dùng, click mở tab mới, tự thêm xóa được
5. Bộ đếm tập trung: Pomodoro, đếm ngược 25 phút, có thể bắt đầu, tạm dừng, reset
6. Xem tiến độ: đã hoàn thành mấy việc hôm nay, hiển thị bằng thanh tiến độ nhỏ

【Giao diện như thế nào】
- Toàn bộ nền tối (hoặc sáng, có thể chuyển một click), sạch sẽ, nhiều khoảng trắng, không quá cầu kỳ
- Bố cục dạng card: mỗi tính năng là một card bo góc tròn, có bóng nhẹ, rê chuột vào hơi nổi lên
- Thanh trên: trái là lời chào "Buổi tối, [tên của tôi]", phải là giờ và nút chuyển theme
- Giữa chia ba cột (màn rộng): trái là việc cần làm, giữa là ghi chú + Pomodoro, phải là đường tắt
- Trên điện thoại tự chuyển thành một cột, dùng bình thường
- Font mặc định hệ thống không chân, màu chủ đạo [điền màu bạn thích, ví dụ: indago / xanh đậm / cam]
- Animation nhẹ, transition 0.2 giây, không chói mắt

【Yêu cầu kỹ thuật】
- Một file HTML, HTML + CSS + JS thuần, không dùng framework
- Toàn bộ dữ liệu lưu trong localStorage của trình duyệt, đóng rồi mở lại vẫn còn
- Code viết comment, để sau tự sửa được
- Cung cấp code đầy đủ, không cắt khúc

【Sau khi xong】
Mở trong trình duyệt cho xem thử, chụp ảnh gửi xác nhận, chỗ nào xấu hoặc lệch thì sửa luôn rồi gửi lại.
```

Gửi template này cho WorkBuddy sẽ tạo ra bản đầu tiên của workbench. Nếu chưa hài lòng, tiếp tục đưa ra yêu cầu chỉnh sửa.

## 六、Bước 5: ITERATION — Lặp cải thiện

### 6.1 Xem kết quả bản đầu

Sau khi WorkBuddy tạo xong sẽ tự động mở trong trình duyệt mặc định. Xem tổng thể, chú ý những điểm sau:

- Bố cục có ngay ngắn không
- Màu sắc có dễ nhìn không
- Tính năng có đầy đủ không
- Trên điện thoại có dùng được không

### 6.2 Đổi model thử lại

Nếu giao diện bản đầu chưa đẹp, đổi sang model mạnh hơn để tạo lại. Thực tế cho thấy khả năng frontend của Kimi K3 rất tốt, thẩm mỹ không thua GPT. Cách đổi model: chuyển model trong WorkBuddy bên phải, gửi lại prompt.

### 6.3 Lặp nhiều lần

Việc tối ưu workbench không thể xong trong một lần. Tôi khuyến nghị mỗi lần chỉ sửa một vấn đề:

- Vòng 1: Chỉnh màu và theme
- Vòng 2: Chỉnh bố cục card
- Vòng 3: Tối ưu animation
- Vòng 4: Test hiển thị trên điện thoại

Mỗi vòng sửa xong đều phải mở thực tế trong trình duyệt để xem kết quả, có vấn đề thì tiếp tục yêu cầu.

## 七、Mobile: Dùng được trên điện thoại

Workbench không chỉ dùng được trên máy tính, mà cả trên điện thoại.

### Cách deploy

1. Deploy file HTML đã tạo lên CloudStudio (miễn phí)
2. Lấy URL truy cập công khai
3. Mở URL đó bằng trình duyệt điện thoại

### Đặt icon màn hình chính

Hầu hết trình duyệt điện thoại đều hỗ trợ "thêm vào màn hình chính". Sau khi cài đặt, workbench trên điện thoại trông như app gốc, bấm icon là mở thẳng.

Như vậy đã đồng bộ giữa máy tính và điện thoại, dữ liệu lưu trong localStorage của trình duyệt, cả hai đều truy cập được.

## 八、Triết lý thiết kế

### 8.1 Công cụ cá nhân không theo đuổi đa năng, mà theo đuổi sự phù hợp

Nhiều người mắc sai lầm: muốn làm công cụ có nhiều tính năng nhất. Nhưng cốt lõi của personal workbench là **dùng đầu tiên mỗi ngày**, tính năng càng ít càng dùng được. Thay vì một hệ thống phức tạp với 20 tính năng, tốt hơn là một công cụ đơn giản 5 tính năng mà dùng mỗi ngày.

### 8.2 Ưu tiên file đơn, giảm gánh nặng bảo trì

Một file HTML, không cần backend, không cần database, không cần server — điều này có nghĩa là **không bao giờ phải lo dịch vụ ngừng hoạt động, dữ liệu mất, tài khoản bị khóa**. Dữ liệu lưu trong localStorage, mở trình duyệt là dùng được. Đơn giản mới bền vững.

### 8.3 Lặp cải thiện hơn là hoàn thiện từ đầu

Không ai có thể lần đầu đã thiết kế được workbench hoàn hảo. Phương pháp là: làm một bản dùng được trước, dùng một tuần, rồi điều chỉnh theo trải nghiệm thực tế. Chức năng nào không dùng thì bỏ, chức năng nào cần thì thêm. **Workbench là thứ sống, không phải dự án xong là xong**.

### 8.4 Ràng buộc tạo ra hiệu quả

Trong prompt không cần viết những yêu cầu mơ hồ như "làm đẹp hơn". Giới hạn tính năng trong 5 cái, cố định màu giao diện, kiểm soát thời gian animation ở 0.2 giây — những ràng buộc cụ thể này lại giúp AI cho ra kết quả ổn định và đáng tin cậy hơn. Ràng buộc là chất xúc tác cho sáng tạo, không phải kẻ thù của nó.

## 九、Tổng kết

Dựng personal desktop workbench với WorkBuddy, chỉ cần năm bước cốt lõi:

| Bước | Cốt lõi | Hành động chính |
|------|---------|----------------|
| PREPARE | Thiết lập workspace | Tạo thư mục cục bộ, tạo workspace trong WorkBuddy |
| MODEL | Chọn model | Việc đơn giản dùng model miễn phí, việc phức tạp dùng Kimi K3 hoặc GLM-5.2 |
| PROMPT | Viết rõ yêu cầu | Theo ba câu hỏi: như thế nào, làm được gì, cần gì |
| TEMPLATE | Dùng template | Copy template rồi chỉnh sửa, tiết kiệm thời gian |
| ITERATION | Lặp cải thiện | Mỗi lần chỉ sửa một vấn đề, đổi model test kết quả |

Workbench không phải một dự án, mà là một thói quen. Giá trị của nó không nằm ở sự hoàn hảo, mà ở việc bạn có mở nó mỗi ngày hay không.

Đừng chờ một giải pháp hoàn hảo, cứ làm một bản dùng được trước, rồi bắt đầu dùng từ ngày thứ hai.

---

Trên đây là toàn bộ nội dung bài chia sẻ. Nếu thấy hữu ích, hãy ủng hộ bằng like, share và comment. Để nhận bài viết mới nhất, các bạn có thể theo dõi tài khoản WeChat 「比特财商」.

Đăng tải đầu tiên trên WeChat Official Account 「比特财商」.
