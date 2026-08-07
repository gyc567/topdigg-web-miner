---
title: "Harper Phân Tích Chuyên Sâu: Trình Kiểm Tra Ngữ Pháp Mã Nguồn Mở Mà Automattic Mua Để Thách Thức Grammarly"
description: "Harper là một trình kiểm tra ngữ pháp tiếng Anh miễn phí, mã nguồn mở, chạy hoàn toàn cục bộ, viết bằng Rust, được Automattic mua lại vào cuối năm 2024. Báo cáo này được xác minh kép đối với repo chính thức, trang web chính thức, và các bài đưa tin độc lập, phân tích công nghệ, logic kinh doanh, và những hạn chế thực tế của nó."
date: "2026-07-27"
author: "ERIC"
tags: ["Harper", "grammar checker", "open source", "Automattic", "Grammarly alternative", "privacy"]
categories: ["Review"]
keywords: ["đánh giá Harper", "trình kiểm tra ngữ pháp Harper", "thay thế Grammarly mã nguồn mở", "Automattic Harper", "trình kiểm tra ngữ pháp cục bộ"]
---

## 1. Harper Là Gì, Trong Một Câu

**Harper là một trình kiểm tra ngữ pháp tiếng Anh miễn phí, mã nguồn mở, chạy hoàn toàn trên thiết bị của bạn — không một byte nào bài viết của bạn rời khỏi thiết bị.**

Nếu bạn từng dùng Grammarly, bạn có thể nghĩ Harper như một "bản thay thế mã nguồn mở" của nó — nhưng cách định khung đó thực sự đang đánh giá thấp nó. Harper không cố gắng nhân bản Grammarly. Nó đang trả lời một câu hỏi cơ bản hơn: **việc kiểm tra ngữ pháp có thực sự cần gửi lời nói của bạn đến máy chủ của người khác không?**

Các sự kiện then chốt (tất cả đều được đối chiếu chéo với repo GitHub chính thức và trang web chính thức):

| Hạng mục | Chi tiết |
|------|--------|
| Định vị | Trình kiểm tra ngữ pháp tiếng Anh ưu tiên cục bộ |
| Người sáng lập | Elijah Potter, hiện là Code Wrangler tại Automattic |
| Nguồn gốc tên | Là một lời tri ân tới nhà văn Harper Lee (To Kill a Mockingbird) |
| Ngăn xếp công nghệ | Viết bằng Rust; chạy trong trình duyệt qua WebAssembly |
| Giấy phép | Apache-2.0, hoàn toàn miễn phí |
| Quyền sở hữu | Được Automattic (công ty đứng sau WordPress.com) mua lại vào ngày 21 tháng 11 năm 2024 |
| Sức hút trên GitHub | ~13,4k stars, phát hành tích cực (vẫn ra bản thường xuyên vào năm 2026) |
| Ngôn ngữ | Chỉ tiếng Anh (các phương ngữ Anh, Mỹ, Canada, Úc, Ấn Độ) |

## 2. Nguồn Gốc: Sự Bực Bội Trên Hai Mặt Trận Của Một Developer

Potter nói rõ trong README chính thức rằng ông xây dựng Harper sau nhiều năm phải chịu đựng các đối thủ. Những chỉ trích của ông đáng được lưu giữ nguyên tinh thần, vì chúng chạm đúng những điểm yếu cấu trúc của cả hai sản phẩm chủ lưu.

**Về Grammarly:**

1. **Quá đắt, quá lấn át** — các gói đăng ký đắt tiền, những gợi ý bỏ qua ngữ cảnh và "thường chỉ đơn giản là sai";
2. **Một cơn ác mộng quyền riêng tư** — mọi thứ bạn viết đều được gửi đến máy chủ của Grammarly. Chính sách quyền riêng tư nói họ không bán dữ liệu của bạn, nhưng điều đó không có nghĩa là họ không dùng nó để huấn luyện các mô hình ngôn ngữ lớn;
3. **Độ trễ mạng giết chết mạch suy nghĩ** — mỗi lần kiểm tra là một vòng khứ hồi mạng, khiến việc sửa bài trở nên tẻ nhạt.

**Về LanguageTool:**

1. **Ngốn bộ nhớ** — yêu cầu gigabyte RAM và một bộ dữ liệu n-gram ~16GB phải tải về;
2. **Quá chậm** — mất vài giây để lint ngay cả một tài liệu cỡ vừa.

Vậy nên Potter tự đặt cho mình ba ràng buộc kỹ thuật: lint trong **miligiây**, dùng **ít hơn 1/50 bộ nhớ của LanguageTool**, và **hoàn toàn riêng tư**. Harper chính là thứ mà những ràng buộc đó tạo ra.

Một chi tiết đáng lưu ý: trang chủ của Harper tuyên bố "gợi ý trong vòng dưới 10ms," trong khi thông cáo mua lại của Automattic nói "dưới 20 miligiây — ít hơn 1% thời gian mà một công cụ ngữ pháp trực tuyến phổ biến nhất định cần." Các con số khác nhau tùy cách định khung, nhưng kết luận là như nhau: **tính toán cục bộ nhanh hơn các vòng khứ hồi đám mây ít nhất hai bậc độ lớn.**

## 3. Các Nguyên Tắc Cốt Lõi: Vì Sao Nó Nhanh Và Riêng Tư

### 3.1 Không LLM — một công cụ quy tắc xác định

Trong một kỷ nguyên mà mọi sản phẩm đều gắn thêm LLM, Harper đã đưa ra một quyết định ngược dòng: **các lần kiểm tra của nó hoàn toàn là các quy tắc xác định được viết tay. Không có LLM trong vòng lặp, không telemetry, không gọi đám mây.**

Ba lợi ích trực tiếp:

- **Tốc độ**: đối khớp quy tắc là tính toán cục bộ thuần túy. Hiệu năng của Rust cộng với vết chân bộ nhớ nhỏ nghĩa là phản hồi đến nhanh hơn bạn có thể gõ;
- **Tính xác định**: cùng một đầu vào luôn cho cùng một đầu ra — không có "sự thất thường của mô hình";
- **Kích thước**: toàn bộ công cụ đủ nhỏ để biên dịch thành WebAssembly và chạy trong một tab trình duyệt.

### 3.2 Rust + WebAssembly: viết một lần, chạy khắp nơi

Ở trung tâm là `harper-core` (một crate Rust), với ba dòng sản phẩm được xây dựng trên nó:

- **harper-ls**: một language server. Mọi trình soạn thảo nói giao thức LSP — VS Code, Neovim, Helix, Emacs, Zed, Sublime Text — đều được bao phủ trong một động tác;
- **harper.js**: ràng buộc JavaScript/WebAssembly, cung cấp sức mạnh cho plugin Obsidian, các tiện ích mở rộng Chrome/Firefox, và plugin WordPress;
- **Ứng dụng native**: một desktop client (các bản phát hành gần đây bổ sung hỗ trợ Slack và Discord).

Điểm khéo léo về kiến trúc ở đây: **một bộ quy tắc, các kênh phân phối gần như vô hạn.** Mỗi tích hợp trình soạn thảo mới tốn gần như không là gì. Đó là cổ tức của giao thức — LSP được thiết kế cho việc hoàn thành mã; Harper biến nó thành một đường ống phân phối cho việc kiểm tra ngữ pháp.

### 3.3 Nó chỉ kiểm tra "ngôn ngữ con người" trong code của bạn

Một nét thân thiện với developer: bên trong một trình soạn thảo mã, Harper chỉ kiểm tra các comment, docstring, và các vùng ngôn ngữ tự nhiên khác — nó sẽ không càm ràm bạn về tên biến. Do đó có nhãn "trình kiểm tra ngữ pháp cho developer."

## 4. Xác Minh Kép: Những Gì Chúng Tôi Đã Đối Chiếu Chéo

Mọi tuyên bố then chốt trong bài viết này đều được xác nhận bởi ít nhất hai nguồn độc lập:

| Tuyên bố | Nguồn 1 | Nguồn 2 |
|-------|----------|----------|
| Ngày và bối cảnh mua lại | Thông cáo chính thức của Automattic (2024-11-21) | Bài đưa tin của TechCrunch (2024-11-21) |
| Được đặt tên theo Harper Lee | Thông cáo của Automattic | Bài đưa tin của WP Tavern |
| Thời gian phản hồi <20ms | Thông cáo của Automattic | Trang web chính thức (định khung <10ms) |
| 1/50 bộ nhớ của LanguageTool | README của tác giả | WP Tavern trích lời tác giả |
| Apache-2.0, miễn phí | FAQ trang web chính thức | Kho lưu trữ GitHub |
| Chỉ tiếng Anh | FAQ trang web chính thức | README trên GitHub |
| Review hands-on hỗn hợp | Review của It's FOSS (2025-07) | Lời chứng thực của người dùng trên trang web chính thức |

## 5. Các Nhận Định Sắc Bén: Giá Trị Thực Của Harper — Và Điều Gì Được Đánh Giá Quá Cao

### Nhận Định 1: Hào rãnh không phải là "miễn phí" — mà là tính xác định

Nhiều người xếp Harper vào mục "Grammarly miễn phí." Điều đó bỏ lỡ trọng điểm. Điểm khác biệt thực sự của nó là **tính xác định về kiến trúc**: chạy cục bộ nghĩa là quyền riêng tư không phải một lời hứa chính sách mà là một sự thật vật lý — không có kênh nào để văn bản của bạn rời khỏi thiết bị. Với luật sư, nhà báo, và bất kỳ ai có bản thảo không thể rò rỉ, "không thể rò rỉ" đánh bại "hứa không rò rỉ" ở cả một chiều kích. Quyền riêng tư của Grammarly dựa trên niềm tin; của Harper dựa trên kiến trúc — và kiến trúc thì không thể bị một bản cập nhật chính sách sửa đổi.

### Nhận Định 2: Automattic không mua một "Grammarly killer"

Khi thương vụ mua lại hoàn tất vào tháng 11 năm 2024, phần lớn bài đưa tin định khung Harper như một đối thủ của Grammarly. Nhưng hãy nhìn xem Automattic thực sự định làm gì: tích hợp Harper vào WordPress.com, WooCommerce, và Jetpack. **WordPress cung cấp sức mạnh cho khoảng 40% web** — Automattic không săn đuổi người đăng ký của Grammarly; nó đang lắp đặt hạ tầng viết lách vào toàn bộ hệ sinh thái WordPress. Matt Mullenweg tự nói điều đó: "Chúng tôi đang làm quá nhiều thứ trên đám mây ngay lúc này, và có rất nhiều tính toán cùng tiềm năng ở biên." Harper là một mảnh ghép trong bàn cờ điện toán biên của ông, bên cạnh Gutenberg và Playground.

Nói cách khác: **Grammarly vận hành một công việc kinh doanh theo gói đăng ký; Harper được mua để trở thành một tầng giao thức.** Đó là hai cuộc chiến rất khác nhau.

### Nhận Định 3: "Không LLM" đã trở thành một tài sản khan hiếm

Nhìn lại từ năm 2026, quyết định phản trực giác nhất của Harper hóa ra lại là quyết định có giá trị nhất. Trong khi mọi công cụ viết đều cạnh tranh về kích thước mô hình, Harper đã chứng minh một con đường khác: một lớp lớn các lỗi ngữ pháp — chính tả, viết hoa, hòa hợp chủ-vị, cụm từ cố định — là **các vấn đề xác định** mà chưa từng cần một mô hình xác suất. Dùng LLM cho những việc này cũng giống như giao đồ ăn mang đi bằng tên lửa: đắt, chậm, và thỉnh thoảng giao nhầm địa chỉ. Với lớp vấn đề này, hiệu quả chi phí và độ tin cậy của một công cụ quy tắc sẽ không bị phá vỡ trong tương lai gần.

### Nhận Định 4: Nhưng đừng thần thoại hóa nó — cái trần cũng rõ ràng không kém

Khách quan mà nói, điểm yếu của Harper cũng rõ rệt như điểm mạnh của nó:

1. **Chỉ tiếng Anh**, với đội ngũ công khai tập trung làm cho tiếng Anh trở nên xuất sắc trước khi đa dạng hóa — hỗ trợ đa ngôn ngữ không nằm ở bất kỳ đâu trong chân trời;
2. **Công cụ quy tắc có một cái trần** — hiểu ngữ nghĩa, trau chuốt văn phong, và điều chỉnh giọng điệu chính xác là nơi các công cụ dựa trên LLM thắng;
3. **Dương tính giả và âm tính giả cùng tồn tại** — tiêu đề của bài hands-on trên It's FOSS nói một cách tinh tế: "Tôi thích nó... à... kiểu kiểu." Ngay cả với các cộng tác viên cộng đồng thêm quy tắc gần như hằng ngày, độ phủ cũng không thể theo kịp độ phức tạp của chính ngôn ngữ;
4. **Không có con đường thương mại hóa rõ ràng** — hoàn toàn miễn phí dưới Apache-2.0, tính liên tục của nó hiện phụ thuộc vào sự kiên nhẫn chiến lược của Automattic.

Tóm lại: **Harper là câu trả lời tối ưu cho "đủ tốt, đáng tin cậy, không tốn kém" — chứ không phải câu trả lời mạnh nhất về tổng thể.** Nó thắng trên các chiến trường quyền riêng tư và tốc độ, chứ không phải chiến trường trí tuệ.

## 6. Đối Đầu Trực Diện: Harper vs Grammarly vs LanguageTool

| Chiều | Harper | Grammarly | LanguageTool |
|-----------|--------|-----------|--------------|
| Giá | Hoàn toàn miễn phí | Gói miễn phí hạn chế, gói đăng ký đắt | Miễn phí + trả phí |
| Điểm đến của dữ liệu | Không bao giờ rời khỏi thiết bị | Đám mây | Đám mây (hoặc tự lưu trữ) |
| Độ trễ kiểm tra | <10–20ms | Giây (bao gồm mạng) | Giây |
| Vết chân bộ nhớ | Nhỏ | Client nặng | GBs + bộ dữ liệu 16GB |
| Trí tuệ | Công cụ quy tắc, lỗi phổ biến | Được hỗ trợ bởi LLM, hiểu ngữ cảnh mạnh | Quy tắc + n-grams |
| Mã nguồn mở | Apache-2.0 | Độc quyền | Lõi đã mã nguồn mở |
| Ngôn ngữ | Chỉ tiếng Anh | Chỉ tiếng Anh | 30+ |
| Ngoại tuyến | Có | Không | Tùy thuộc cách triển khai |
| Hệ sinh thái trình soạn thảo | LSP khắp nơi + trình duyệt/Obsidian/WordPress | Plugin chủ lưu | Plugin chủ lưu |

## 7. Ai Nên Dùng Harper, và Bắt Đầu Như Thế Nào

**Khuyên dùng cho:**

- Developer viết tài liệu tiếng Anh, README, và blog (chi phí gia nhập gần như bằng không cho người dùng VS Code/Neovim);
- Người dùng Obsidian nặng ký (plugin chính thức hoạt động ngay ra hộp);
- Nhà văn nhạy cảm về quyền riêng tư — hợp đồng, ghi chú y tế, bản thảo chưa xuất bản không nên chạm tới đám mây;
- Developer muốn có kiểm tra ngữ pháp bên trong sản phẩm của chính mình (tích hợp `harper.js` hoặc `harper-core` trực tiếp).

**Không khuyên dùng cho:**

- Bất kỳ ai cần kiểm tra bằng tiếng Trung hoặc các ngôn ngữ không phải tiếng Anh khác;
- Bất kỳ ai kỳ vọng viết lại sâu, trau chuốt, hoặc tối ưu hóa giọng điệu — đó không phải chiến trường của nó.

**Bắt đầu:** cài tiện ích mở rộng Chrome/Firefox; trỏ cấu hình LSP của trình soạn thảo tới `harper-ls`; hoặc tìm "Harper" trong chợ plugin cộng đồng của Obsidian. Không cần tài khoản ở bất kỳ đâu.

## 8. Đánh Giá Tổng Thể

| Chiều | Điểm (/10) | Nhận xét |
|-----------|:---:|---------|
| Kiến trúc quyền riêng tư | 10 | Dữ liệu không bao giờ rời khỏi thiết bị — quyền riêng tư bằng vật lý |
| Hiệu năng | 9.5 | Độ trễ miligiây, vết chân nhỏ, kỹ thuật xuất sắc |
| Khả năng kiểm tra | 7 | Vững vàng với lỗi phổ biến; ngữ nghĩa phức tạp nằm ngoài tầm với |
| Tích hợp hệ sinh thái | 9 | Phân phối LSP + WASM gần như không ma sát |
| Độ phủ ngôn ngữ | 4 | Chỉ tiếng Anh, không có lộ trình đa ngôn ngữ |
| Bền vững | 7.5 | Có hậu thuẫn của Automattic, nhưng không có vòng lặp thương mại khép kín |
| **Tổng thể** | **8.0** | **Tốt nhất trong phân khúc của nó — không phải công cụ đa năng** |

Harper chứng minh một điều mà ngành đã lãng quên một nửa: **không phải vấn đề nào cũng cần đám mây, một mô hình, và một gói đăng ký.** Đẩy các ràng buộc kỹ thuật đến giới hạn của chúng tự nó là một chiến lược sản phẩm. Nếu công việc của bạn là "viết tiếng Anh đúng" thay vì "viết tiếng Anh lộng lẫy," Harper hiện là giá trị tốt nhất trên hành tinh — sau cùng, với một công cụ miễn phí và không bán dữ liệu của bạn, bạn cũng không trở thành sản phẩm.

## References

1. Repo GitHub chính thức: github.com/Automattic/harper
2. Trang web chính thức: writewithharper.com
3. Thông cáo mua lại của Automattic (2024-11-21)
4. TechCrunch: WordPress.com owner Automattic snaps up grammar checker Harper (2024-11-21)
5. WP Tavern: Automattic Acquires Harper; Founder Elijah Potter Joins the Team (2024-11-22)
6. It's FOSS: I Found a New Open Source Grammar Checker Tool (2025-07)
7. Blog của Matt Mullenweg: Welcoming Harper (2024-11)
