---
title: 'Promptless ''Writing code was hard, actually'' phân tích chuyên sâu: Khi ''Code chưa bao giờ là phần khó'' trở thành hot take, đã đến lúc chốt sổ — Thị trường, cỗ máy, và kỹ sư'
description: 'Lấy bài viết trên blog kỹ thuật của Promptless ''Writing code was hard, actually'' làm trục chính, bài phân tích này mổ xẻ cách một bài ngắn 900 từ bác bỏ câu chuyện đang viral 2025-2026 rằng ''viết code chưa bao giờ là phần khó.'' Nội dung: (1) tổng quan dự án — Promptless là gì và tại sao bài ngắn này đáng đọc sâu; (2) hướng dẫn chi tiết — bốn đường bằng chứng (thời điểm, cỗ máy, thị trường, kỹ sư) + một nhượng bộ trung thực (''kỹ năng này đang khan hiếm đi'' ≠ ''kỹ năng này chưa bao giờ xuất sắc'') + một cảnh báo cho kỹ sư (''kỹ sư đã tạo ra công cụ đang được dùng để gọi họ là tầm thường''); (3) tổng hợp quan điểm — bài viết tách ''AI làm code rẻ đi'' khỏi ''code vốn đã dễ''; (4) triết lý thiết kế — ba thái độ đối với kể chuyện về sự khan hiếm, sự tôn trọng lịch sử, và bản sắc kỹ sư. Luận điểm cốt lõi: đừng viết lại ''kỹ năng đang trở nên rẻ hơn'' thành ''kỹ năng vốn đã tầm thường'' — cái trước là đánh giá thị trường trung thực, cái sau là viết lại lịch sử. Bài ngắn này cung cấp khuôn mẫu lập luận sạch nhất cho bất kỳ cuộc tranh luận ''AI có thay thế / không thay thế ai'' nào.'
date: "2026-08-10"
author: "TopDigg Research Team"
tags: ["Promptless", "writing-code", "AI Engineering", "Software Engineering", "AI Agents", "Engineering Culture", "AI Hype", "Code Generation", "Engineering Identity", "Career"]
categories: ["Deep Dive"]
keywords: ["Promptless", "writing code was hard", "AI thay thế lập trình viên", "code chưa bao giờ khó", "kể chuyện kỹ thuật", "cường điệu AI", "chi phí huấn luyện LLM", "lương kỹ sư phần mềm", "bản sắc kỹ sư", "sự nghiệp thời AI", "công cụ AI", "văn hóa kỹ thuật"]
---

# Promptless "Writing code was hard, actually" phân tích chuyên sâu: Khi "Code chưa bao giờ là phần khó" trở thành hot take, đã đến lúc chốt sổ — Thị trường, cỗ máy, và kỹ sư

> Ý tưởng cốt lõi: **"Viết code chưa bao giờ là phần khó" là một chủ nghĩa xét lại tiện lợi (revisionism) được phát minh ra đúng vào khoảnh khắc AI làm cho code gần như miễn phí. Bài viết trên blog kỹ thuật Promptless 'Writing code was hard, actually' tháo gỡ nó bằng bốn đường bằng chứng — thời điểm (không ai nói vậy năm 2018, khi vấn đề yêu cầu cũng đã tồn tại), cỗ máy (hàng tỷ USD + gigawatt + siêu máy tính chuyên dụng để *từng phần* tự động hóa một thứ "tầm thường"), thị trường (30 năm lương kỹ sư phần mềm tăng đều — hoặc thị trường tập thể phi lý 30 năm, hoặc viết code vốn đã khó), và kỹ sư (những người xây LLM *chính là* kỹ sư phần mềm — họ dùng kỹ năng này để từng phần tự động hóa kỹ năng này).** Nhưng đòn sắc nhất là sự nhượng bộ bên trong lập luận: "kỹ năng này đang trở nên khan hiếm" — chỉ đừng viết lại nó thành "kỹ năng này chưa bao giờ xuất sắc". Cái trước là đánh giá thị trường trung thực; cái sau là viết lại lịch sử. **Nó cung cấp khuôn mẫu lập luận sạch nhất cho bất kỳ cuộc tranh luận "AI có thay thế / không thay thế ai" nào: hỏi "cỗ máy có đắt không?" rồi "thị trường đã phán xét bao lâu?" rồi "ai đã tạo cỗ máy?" — ba câu hỏi là câu chuyện không đứng nổi.**

---

## 1. Tổng quan dự án

### 1.1 Nó là gì?

Bài phân tích này xem xét một bài viết ngắn trên blog kỹ thuật của **Promptless** có tựa đề **"Writing code was hard, actually"**.

Promptless làm gì: một công cụ AI tự động cập nhật tài liệu hướng khách hàng khi bạn phát hành tính năng và hỗ trợ khách hàng ("automatically updates your customer-facing docs as you ship features and support customers"). Blog kỹ thuật của họ thuộc thể loại "kể chuyện kỹ thuật + nghề tài liệu" — ngắn, có lập trường, không vòng vo. Bài này là mẫu điển hình.

Bài viết dài khoảng 900 từ tiếng Anh, nhưng cấu trúc rất gọn:

1. **Hiện tượng**: vài ngày lại có người đăng "viết code chưa bao giờ là phần khó"
2. **Vạch trần**: câu chuyện này là "chủ nghĩa xét lại tiện lợi"
3. **Bốn bằng chứng**: thời điểm, cỗ máy, thị trường, kỹ sư
4. **Nhượng bộ**: có một sự thật ở trong — "kỹ năng này đang khan hiếm đi" (không phải "chưa bao giờ xuất sắc")
5. **Kết**: kỹ sư đã tạo cỗ máy này — họ không phải người bị thay thế, họ là người có vị trí tốt nhất để trả lời "điều gì tiếp theo"

### 1.2 Định vị một dòng

> **Một bài ngắn 900 từ về văn hóa kỹ thuật, bác bỏ câu chuyện đang viral rằng "viết code chưa bao giờ là phần khó", sử dụng ba đường bằng chứng (cỗ máy, thị trường, kỹ sư) và một sự phân biệt giữa "kỹ năng đang trở nên rẻ hơn" và "kỹ năng vốn đã tầm thường".**

### 1.3 Sự kiện chính

- **Nguồn**: blog kỹ thuật Promptless ([promptless.ai/blog/technical/writing-code-was-hard-actually](https://promptless.ai/blog/technical/writing-code-was-hard-actually))
- **Thể loại**: văn hóa kỹ thuật / Technical
- **Tác giả**: nhóm Promptless (không ghi tên cá nhân)
- **Định dạng**: bài ngắn một trang, không biểu đồ, không code, không quảng cáo sản phẩm — **quan điểm thuần túy**
- **Hành động cốt lõi**: bác bỏ câu chuyện viral "viết code chưa bao giờ là phần khó"
- **Bài viết liên quan** (cùng trang): [Docs Site Search Optimization](https://promptless.ai/blog/technical/docs-site-search-optimization), [Developer Relations Docs](https://promptless.ai/blog/technical/developer-relations-docs), [Developer Relations Docs Have a New Primary Reader](https://promptless.ai/blog/technical/developer-relations-docs-agent-primary-reader)
- **Sản phẩm liên quan**: sản phẩm chính của Promptless là công cụ cập nhật tài liệu tự động; bài này không liên quan trực tiếp đến sản phẩm — thuộc bình luận văn hóa kỹ thuật

### 1.4 Vấn đề nó giải quyết

Trong suốt 2025-2026, X / LinkedIn / bản tin ngành liên tục xoay quanh các biến thể:

> "Kỹ sư mô tả thay đổi bằng tiếng Anh đơn giản, Claude Code viết code."
> "Người không chuyên xây dựng sản phẩm thực mà không động vào một dòng code nào."
> "Viết code chưa bao giờ là phần khó — hiểu yêu cầu, thiết kế hệ thống, giao tiếp với stakeholders mới là."

**Câu chuyện này đang làm một việc rất cụ thể: lấy một kỹ năng đã được tự động hóa từng phần, đóng khung lại từ "trước đây khó nhưng đã được giải quyết" thành "vốn đã không khó" — từ đó làm cho "AI thay thế lập trình viên" trông như tất yếu, đáng lẽ phải xảy ra từ lâu, và không phải lỗi của ai.**

Điều bài 900 từ này làm là: **đừng chấp nhận sự viết lại đó.** Đẩy lùi bằng bằng chứng.

---

## 2. Hướng dẫn chi tiết: Bốn đường bằng chứng + Một nhượng bộ trung thực + Một cảnh báo cho kỹ sư

Bài viết không cho bạn "code" — nó cho bạn "lập luận". Phần này tháo dỡ cấu trúc lập luận, mỗi mảnh kèm bằng chứng nhận biết được, mẫu phản bác tái sử dụng, và phép loại suy thực tế.

### 2.1 Bằng chứng 1: Thời điểm phơi bày câu chuyện

**Lập luận gốc**:

> "If writing code was never the hard part, someone should have been saying this in 2018. The requirements problem existed then. System design existed then. But nobody was writing blog posts about how coding was a trivial formality, because it obviously wasn't."

**Cấu trúc của bằng chứng này**:

- **Nếu X là đúng, X phải được nói trước thời điểm của X** (chứng cứ đảo thời gian)
- Năm 2018, vấn đề yêu cầu, thiết kế hệ thống, giao tiếp với stakeholders — tất cả những vấn đề đó đã tồn tại
- Nhưng **lúc đó không ai viết "viết code chưa bao giờ là phần khó"** — vì rõ ràng không phải vậy
- Câu chuyện xuất hiện đúng vào khoảnh khắc AI làm code rẻ đi — **vậy nó là sản phẩm của thời đại AI, không phải sự thật kỹ thuật**

**Mẫu phản bác tái sử dụng**:

> "Nếu 'X luôn là vậy' mà bạn khẳng định không được nói vào năm 2018, thì nó không phải 'luôn là vậy', mà là 'mới được phát minh gần đây để hỗ trợ một lập trường mới'."

**Phép loại suy**:

- Năm 2010 không ai nói "lái máy bay chưa bao giờ là phần khó" — lúc đó sự thật không phải vậy. Sau khi xe tự lái AI xuất hiện, người ta bắt đầu nói "lái máy bay vốn chỉ là khớp quy tắc"
- Năm 2015 không ai nói "dịch thuật chưa bao giờ là phần khó" — sự thật không phải vậy. Sau khi dịch máy neural vượt ngưỡng chất lượng (2016-2017), "dịch thuật vốn chỉ là chuyển ngôn ngữ" xuất hiện như hot take

### 2.2 Bằng chứng 2: Cỗ máy là bằng chứng

**Lập luận gốc**:

> "If writing code were easy, you would not need the machine. You don't spend billions of dollars training a model on purpose-built supercomputers to automate something trivial."

**Cấu trúc**:

- **Sự tồn tại của công cụ là phản chứng cho sự tầm thường của nhiệm vụ** — con người tạo công cụ cho những thứ họ không thể hoặc không dễ làm
- Huấn luyện LLM: hàng tỷ USD, siêu máy tính chuyên dụng, gigawatt điện, hàng thập kỷ nghiên cứu thuật toán — tất cả để *từng phần* tự động hóa việc sinh code
- Một nhiệm vụ hấp thụ quy mô tài nguyên này **không phải "chưa bao giờ là phần khó"**

**Bài viết dùng một câu hỏi phản đòn rất sắc**:

> "Can you describe the chip architecture, power delivery, and network topology required to run the coding tool you're using to declare that coding was never hard?"

Cỗ máy khiến việc viết code *trông* dễ lại chính là một kỳ quan kỹ thuật mà gần như không ai trên Trái Đất hiểu trọn vẹn từ đầu đến cuối. Cỗ máy tạo ra vẻ ngoài "dễ dàng" chính là bằng chứng cho nhiệm vụ nền tảng khó.

**Mẫu phản bác tái sử dụng**:

> "Nếu nó thật sự dễ, bạn sẽ không cần xây một cỗ máy đắt thế này để từng phần tự động hóa nó."

**Phép loại suy**:

- Hàn robot khung xe — chúng ta không nói "hàn chưa bao giờ là phần khó"; chúng ta nói kỹ sư hàn đã giải quyết một vấn đề khó
- AI hỗ trợ viết — chúng ta không nói "viết chưa bao giờ là phần khó"; chúng ta nói nhà văn đã giải quyết một vấn đề khó
- Việc sử dụng chọn lọc tu từ "chưa bao giờ là phần khó" **tùy thuộc vào việc người bị tự động hóa có phải là bạn hay không**

### 2.3 Bằng chứng 3: Thị trường không bị lừa trong ba mươi năm

**Lập luận gốc**:

> "For thirty years, companies fought over software engineers. Salaries climbed steadily. Entire recruiting industries existed just to find people who could do the job. Was the market wrong this entire time? The 'never the hard part' crowd has to pick one: either the labor market was wildly irrational for three decades, or writing software was in fact hard."

**Cấu trúc**:

- Thị trường tổng hợp mọi thông tin — **nó không nói dối ba mươi năm**
- Lương kỹ sư phần mềm tăng đều ba mươi năm, ngành săn đầu người chuyên biệt tồn tại, chính sách visa nghiêng về lao động kỹ thuật — tất cả nói rằng "những người viết code đang làm điều có giá trị"
- Phe "chưa bao giờ là phần khó" phải chọn một: **thị trường sai ba mươi năm, hoặc viết code vốn đã khó**
- Rõ ràng thị trường không sai

**Mẫu phản bác tái sử dụng**:

> "Trước 30 năm dữ liệu lương, 'chưa bao giờ là phần khó' của bạn phải giải thích tại sao các công ty săn đầu người, chính sách visa, và đường cong lương lại đi theo hướng ngược lại."

**Phép loại suy**:

- Bác sĩ phẫu thuật lương cao / đối tác luật lương cao / trader cao cấp lương cao — mức giá thị trường nhất quán với "những việc khó"
- **Nếu "viết code chưa bao giờ là phần khó" đúng, thì tất cả những người trả phí bảo hiểm cho kỹ sư phần mềm trong ba mươi năm — hội đồng quản trị, HR, thợ săn đầu người, viên chức nhập cư — đều sai**

### 2.4 Bằng chứng 4: Kỹ sư tự tay xây công cụ "thay thế" họ

**Lập luận gốc**:

> "It's not like a bunch of outsiders looked over at software engineers and thought, 'those lazy bastards soaking up all that pay for easy work—let's build AI to expose them.' Coal miners did not do this. Management consultants did not do this. The people who built LLMs are software engineers. Researchers who write code. Infrastructure teams who write code. ML engineers who write code. They spent their careers mastering the skill, and then used that mastery to partially automate it."

**Cấu trúc**:

- Những người viết LLM **chính là** kỹ sư phần mềm — họ dành ba mươi năm để thành thạo "viết code," rồi dùng sự thành thạo đó để **từng phần tự động hóa** nó
- Đây không phải "người ngoài nhìn người trong và ghen tị với lương của họ" — **đây là người trong dùng chính kỹ năng của mình để tạo công cụ mới**
- Giống như kỹ sư robot chế tạo robot hàn — **không ai nói "hàn chưa bao giờ là phần khó"**

**Mẫu phản bác tái sử dụng**:

> "Người tạo ra công cụ chính là những người bị cho là đang làm 'công việc dễ' — hoặc thừa nhận tạo công cụ đòi hỏi thành thạo 'công việc dễ', hoặc thừa nhận công việc vốn đã không dễ."

**Phép loại suy**:

- Kỹ sư hàn chế tạo robot hàn — **không được tái cấu trúc thành "hàn vốn đã tầm thường"**
- Biên dịch viên tạo công cụ dịch — **không được tái cấu trúc thành "dịch vốn đã tầm thường"**
- Điểm khác biệt duy nhất: kỹ sư **không có công đoàn** và **không có tấm khiên nghề nghiệp rõ ràng** — nên tu từ "vốn đã tầm thường" chảy không bị cản

### 2.5 Nhượng bộ trung thực: Một điều đúng ở bên trong

Sau khi phản bác, bài viết **tự nguyện nhượng bộ một phần sự thật**:

> "The economic value of writing code, in isolation, is declining. AI tools are making it cheaper and faster to produce working software. The mix of skills that makes an engineer valuable is shifting. Those are true, defensible claims."

**Điều được thừa nhận**:

- Giá trị kinh tế của "viết code" *với tư cách một kỹ năng đơn lẻ* đang giảm
- AI làm cho "sản xuất phần mềm hoạt động được" rẻ hơn và nhanh hơn
- **Sự kết hợp kỹ năng làm nên giá trị của kỹ sư đang thay đổi** — tỷ trọng của code đang dịch chuyển, các kỹ năng khác đang tăng

**Đó là phần trung thực.**

Nhưng bài viết ngay lập tức tách sự trung thực này khỏi một khẳng định khác:

> "But that's not what people are saying. They're reaching backward in time to retroactively trivialize the skill. There's an enormous difference between 'this skill is becoming less scarce' and 'this skill was never impressive.' One is an honest market assessment. The other is rewriting history."

**Đường cắt sắc nhất trong bài viết**:

- "Kỹ năng này đang trở nên khan hiếm" — **đánh giá thị trường trung thực** ✓
- "Kỹ năng này chưa bao giờ xuất sắc" — **viết lại lịch sử** ✗

**Hai điều này về cơ bản khác nhau** — gói cái sau trong cái trước là chủ nghĩa xét lại.

**Khung nhận thức tái sử dụng**:

> "Xu hướng ≠ viết lại". "AI làm X rẻ đi" là xu hướng; "X vốn đã dễ" là viết lại.

### 2.6 Cảnh báo cho kỹ sư: Kỹ sư đã tạo cỗ máy này

**Phần kết**:

> "But as we adapt, it's worth remembering who made the machine. Not the executives. Not the thought leaders. Engineers made it. The same people now being called trivial built the tool being used to call them trivial. That should give everyone pause."

> "The engineers who built the modern digital world aren't suddenly less capable because their hardest problem got automated. If anything, they're the ones best positioned to tackle what comes next. They've already proven they can do hard things. Now they have better tools."

**Tư thế của phần này**:

- Không cảm tính; không phải "kỹ sư bị đánh giá thấp"
- Là phát biểu sự thật + đưa ra dự đoán có thể kiểm chứng
- **Sự thật**: những người xây LLM, xây siêu máy tính, viết code huấn luyện phân tán — đều là kỹ sư phần mềm
- **Dự đoán**: nhóm này có khả năng nhất trong việc trả lời "AI sẽ đi đâu tiếp theo"
- **Không phải an ủi. Là khôi phục vị trí.**

### 2.7 Tóm tắt một câu

> **"Kỹ năng đang trở nên rẻ hơn" ≠ "kỹ năng vốn đã tầm thường".** Promptless dùng 900 từ để làm rõ sự phân biệt này. Phương pháp đơn giản: hỏi ba câu hỏi — cỗ máy có đắt không? thị trường đã phán xét bao lâu? ai đã tạo cỗ máy? — ba câu hỏi đó, "vốn đã tầm thường" không đứng nổi.

---

## 3. Tổng hợp quan điểm: 5 phán đoán cốt lõi từ 900 từ

Gộp lại lập luận cốt lõi của bài viết, ta có năm phán đoán về câu chuyện kỹ thuật.

### 3.1 Quan điểm 1: Chủ nghĩa xét lại tiện lợi là câu chuyện khó phản bác nhất — vì nó không sai, nó "một phần đúng"

**Cốt lõi**:

> "It is convenient revisionism, because it arrives at exactly the moment that AI tools are making code free to produce, and it flatters exactly the people who never wrote any."

**Triển khai**:

- "Viết code chưa bao giờ là phần khó" không hoàn toàn sai — nó có pha lẫn sự thật rằng "AI làm code rẻ đi"
- Nhưng **nó viết lại "đang trở nên rẻ hơn bây giờ" thành "vốn đã tầm thường"** — đó là động tác tu từ
- Tu từ này khó phản bác vì người phản bác phải thừa nhận một phần sự thật trước, rồi mới nói "nhưng không phải phần bạn đang ám chỉ" — **rào cản tâm lý cao**

**Kết luận**:

- Phản bác loại câu chuyện này đừng bắt đầu từ "hoàn toàn sai" — **bắt đầu từ "một phần đúng"**: "phần đầu bạn nói đúng, nhưng câu cuối thì không"
- Chủ nghĩa xét lại "tiện lợi" vì **phần "đúng" của nó tiêm phòng cho người đọc** — bạn thấy bất lịch sự khi phản bác phần đúng, nên nuốt luôn phần sai

### 3.2 Quan điểm 2: Sự tồn tại của công cụ là phản chứng cho sự tầm thường của nhiệm vụ

**Cốt lõi**:

> "If writing code were easy, you would not need the machine."

**Triển khai**:

- Con người tạo công cụ cho những thứ họ không thể hoặc không dễ làm
- LLM không phải "phép thuật" — chúng được xây trên **hàng tỷ USD, siêu máy tính chuyên dụng, gigawatt điện, hàng thập kỷ nghiên cứu thuật toán**
- Quy mô tài nguyên này được cam kết **chỉ để tự động hóa từng phần** — vì tự động hóa hoàn toàn là không thể
- Công cụ làm cho "viết code trông dễ" **chính nó là kỳ quan kỹ thuật** — cỗ máy tạo ra "sự dễ dàng" chứng minh nhiệm vụ khó

**Kết luận**:

- Đánh giá một kỹ năng có "vốn đã tầm thường" không — **trước hết xem bao nhiêu tài nguyên được đổ vào nó**
- Nhiều tài nguyên hơn → nhiệm vụ khó hơn
- Ngược lại: sự "nhẹ" của tự động hóa AI ≠ sự "nhẹ" của nhiệm vụ gốc — tự động hóa chỉ khiến "nhẹ" trông dễ

### 3.3 Quan điểm 3: Ba mươi năm dữ liệu lương có sức thuyết phục hơn bất kỳ bài blog nào

**Cốt lõi**:

> "Was the market wrong this entire time?"

**Triển khai**:

- Thị trường tổng hợp mọi thông tin — **nó không nói dối ba mươi năm**
- Lương kỹ sư phần mềm tăng đều ba mươi năm — điều này **bao trùm nhiều chu kỳ kinh tế, nhiều quốc gia, nhiều phân ngành**
- Phe "chưa bao giờ là phần khó" phải giải thích: **tại sao thị trường liên tục sai ba mươi năm?**
- Lời giải thích nhất quán duy nhất: viết code vốn đã khó

**Kết luận**:

- Khi một câu chuyện mâu thuẫn với ba mươi năm dữ liệu thị trường — **hãy nghi ngờ câu chuyện trước**
- Đặc trưng của chủ nghĩa xét lại: "nhanh và hợp lý" — nhưng nó cần **giả định phản thực tế** ("thị trường ngu ngốc") để đứng vững
- Đánh giá bất kỳ khẳng định "X vốn đã tầm thường" — **kiểm tra đường cong lương ba mươi năm**

### 3.4 Quan điểm 4: "Kỹ năng đang khan hiếm đi" và "Kỹ năng vốn đã tầm thường" là hai điều hoàn toàn khác nhau

**Cốt lõi**:

> "There's an enormous difference between 'this skill is becoming less scarce' and 'this skill was never impressive.' One is an honest market assessment. The other is rewriting history."

**Triển khai**:

- Phán đoán xu hướng vs. viết lại lịch sử — **hai điều hoàn toàn khác nhau**
- "AI làm code rẻ đi" — **hiện tượng bắt đầu năm 2023** (sau GPT-4)
- "Viết code chưa bao giờ là phần khó" — **một lập trường chưa tồn tại năm 2018**
- **Biến "đang khan hiếm" thành "vốn đã tầm thường" là trò ảo thuật chiều thời gian**

**Kết luận**:

- Phân biệt "phán đoán về tương lai" và "phán đoán về quá khứ" — **đừng để phán đoán tương lai viết lại quá khứ**
- Thao tác chuẩn của chủ nghĩa xét lại: dùng khung "X hiện là X" để khiến người ta nghĩ "X luôn là X" — nhưng cái trước là quan sát, cái sau là khẳng định
- Bất kỳ khung trung thực nào về "X đang trở nên rẻ hơn" **đều không cần đuôi "X vốn đã tầm thường"** — thêm đuôi đó là chủ nghĩa xét lại

### 3.5 Quan điểm 5: Ai tạo cỗ máy, người đó có vị trí tốt nhất để trả lời "tiếp theo là gì"

**Cốt lõi**:

> "The engineers who built the modern digital world aren't suddenly less capable because their hardest problem got automated. If anything, they're the ones best positioned to tackle what comes next."

**Triển khai**:

- Không phải an ủi, là khôi phục vị trí
- Những người viết LLM **chính là** kỹ sư phần mềm
- Nhóm này có **ba mươi năm kinh nghiệm kỹ thuật** — chỉ "code" bị tự động hóa từng phần; khả năng khác (thiết kế hệ thống, hiểu yêu cầu, giao tiếp nhóm, hiểu máy) **không bị tự động hóa**
- Nhóm này có khả năng nhất **đánh giá "điều gì đáng làm trong thời AI"** — vì họ hiểu máy

**Kết luận**:

- Đánh giá "ai bị thay thế trong thời AI" — **đừng nhìn danh sách kỹ năng, hãy nhìn người giữ kỹ năng**
- Kỹ sư phần mềm **sẽ không** bị thay thế vì "code bị tự động hóa từng phần" — vì **toàn bộ bản sắc nghề nghiệp** của họ chưa bao giờ là "code", mà là "giải quyết vấn đề khó bằng phương pháp kỹ thuật"
- Cái bị thay thế thật sự là **các công việc đơn kỹ năng** (người chỉ code mà không hiểu hệ thống) — **không phải nghề kỹ sư**

### 3.6 Cách 5 quan điểm liên kết nhau

```
Quan điểm 1: chủ nghĩa xét lại tiện lợi (gói "một phần đúng" quanh "một phần sai")
   ↓ (thủ pháp tu từ)
Quan điểm 2: sự tồn tại của công cụ là phản chứng cho sự tầm thường
Quan điểm 3: ba mươi năm dữ liệu thị trường không nói dối
   ↓ (sự thật lịch sử)
Quan điểm 4: xu hướng ≠ viết lại
Quan điểm 5: kỹ sư không bị thay thế, các công việc đơn kỹ năng bị thay thế
```

Quan điểm 1 là tầng tu từ ("tại sao câu chuyện này khó phản bác"); 2/3 là tầng sự thật ("cần bằng chứng gì để phản bác"); 4 là tầng phân biệt ("cắt phần thật khỏi phần sai"); 5 là tầng dự đoán ("kỹ sư sẽ ra sao"). **Cả 5 cùng tạo thành khuôn mẫu lập luận hoàn chỉnh cho "câu chuyện kỹ thuật thời AI".**

---

## 4. Triết lý thiết kế: Đọc 900 từ như tư thế kỹ thuật của Promptless

Bài 900 từ của Promptless (cùng vài bài kỹ thuật khác trên cùng trang) thể hiện một **tư thế kỹ thuật hiếm có** — **đặt một khuôn mẫu lập luận sạch, có thể tái sử dụng, không cảm tính cho các cuộc tranh luận kiểu "AI có thay thế / không thay thế ai"**. Rút ra từ tư thế này bốn triết lý thiết kế.

### 4.1 Triết lý 1: Thừa nhận trung thực "một phần đúng", rồi cắt gọn "một phần sai"

**Tư thế**:

Bài viết không phủ nhận "AI làm code rẻ đi" — **điều đó đúng**. Nó làm là **thừa nhận phần đúng, rồi cắt gọn phần sai**:

> "Those are true, defensible claims. But that's not what people are saying."

**Tại sao đây là tư thế kỹ thuật tốt**:

- Từ chối tư duy nhị phân "tất cả hoặc không" — **phán đoán thực tế đều là từng phần**
- Để lại "phần đúng" cho người đọc — **không sỉ nhục những ai đã chấp nhận câu chuyện**
- Cắt "phần sai" gọn gàng — **để người đọc chọn theo nửa nào**

**Mẫu tái sử dụng**:

> "Điều bạn nói đúng — nhưng chỉ đến câu đó. Từ câu đó trở đi, điều bạn nói không đúng."

**Mẫu chống (đừng làm thế này)**:

- Phủ nhận hoàn toàn "AI làm code rẻ đi" — **đó là chủ nghĩa xét lại theo hướng ngược lại**
- Biến phản bác thành chửi bới — **leo thang cảm xúc khiến lập luận thất bại**
- Dùng tư thế "kỹ sư là kẻ yếu thế" — **không ai cần được bảo vệ**

### 4.2 Triết lý 2: Dùng bằng chứng phản bác câu chuyện, không dùng cảm xúc

**Tư thế**:

Cả bốn bằng chứng — thời điểm, cỗ máy, thị trường, kỹ sư — **đều là sự thật có thể kiểm tra**. Không có cảm xúc, không phàn nàn, không phô trương.

**Tại sao đây là tư thế kỹ thuật tốt**:

- Người đọc kỹ thuật **chỉ nhìn bằng chứng**
- Phản bác dựa trên bằng chứng có thể **được trích dẫn, sao chép, kiểm chứng**
- Phản bác dựa trên cảm xúc chỉ có thể **được cảm nhận, bị lãng quên**

**Cấu trúc phản bác tái sử dụng**:

> "Bạn nói X. X có được nói vào năm Y không? X có cần đầu tư Z không? Dữ liệu thị trường của X là W? Ai đã tạo công cụ cho X? — nếu cả bốn câu hỏi đều không đứng, X là câu chuyện, không phải sự thật."

**Mẫu chống**:

- "Với tư cách kỹ sư, tôi rất đau lòng" — **cảm xúc không phản bác câu chuyện**
- "Những người cường điệu AI không hiểu" — **công kích cá nhân khiến người đọc kỹ thuật tắt**
- "Năm năm tới sẽ chứng minh bạn sai" — **dự đoán tương lai không phải lập luận**

### 4.3 Triết lý 3: Đặt phán đoán "thời AI" trở lại chiều thời gian

**Tư thế**:

Bài viết lặp đi lặp lại quay về **chiều thời gian**:

- "If writing code was never the hard part, someone should have been saying this in 2018."
- "For thirty years, salaries climbed steadily."
- "The 'never the hard part' crowd has to pick one"

**Tại sao đây là tư thế kỹ thuật tốt**:

- Bất kỳ khẳng định "X luôn là vậy" nào đều cần **bằng chứng theo chiều thời gian**
- Phán đoán thiếu chiều thời gian đều là **câu chuyện hiện tại** — và câu chuyện di chuyển cùng năng lực AI
- Người đọc kỹ thuật **nhạy cảm với lịch sử** — họ đã đọc lịch sử kỹ thuật trước LLM

**Khung phán đoán tái sử dụng**:

> Với bất kỳ khẳng định "X vốn đã là X" — hỏi "tại sao năm 2018, 2010, 2000 không ai nói vậy?"
> Với bất kỳ khẳng định "X hiện là X" — hỏi "bắt đầu khi nào? sự kiện kích hoạt là gì?"

### 4.4 Triết lý 4: Đặt "người làm việc đó" trở lại trung tâm

**Tư thế**:

Đòn sắc nhất của bài viết không phải cỗ máy, không phải thị trường — mà là **"người tạo cỗ máy chính là người bị cho là đang làm 'công việc dễ'"**:

> "The people who built LLMs are software engineers. Researchers who write code. Infrastructure teams who write code. ML engineers who write code. They spent their careers mastering the skill, and then used that mastery to partially automate it."

**Tại sao đây là tư thế kỹ thuật tốt**:

- Câu chuyện tu từ thường **làm trống rỗng "người làm việc đó"** — chỉ còn "cái việc" và "năng lực trừu tượng"
- Đặt "người làm việc đó" trở lại trung tâm — **câu chuyện ngay lập tức mất sức mạnh tu từ**
- "Người tạo robot" = "người bị cho là đang làm việc dễ" — **tự tham chiếu này không thể tránh né**

**Động tác viết tái sử dụng**:

> Với bất kỳ "X đang bị AI thay thế" — hỏi "người tạo AI có phải là người trước đây đang làm X không?"
> Nếu có — **câu chuyện không đứng**.
> Nếu không — **đó là sự dịch chuyển nghề nghiệp mới** (đáng bàn).
> Nhưng hầu hết trường hợp đều là cái trước.

### 4.5 Tóm tắt triết lý: 4 triết lý tạo thành tư thế của bài Promptless

| Triết lý | Một dòng | Bài viết làm gì |
|---|---|---|
| 1. Thừa nhận một phần đúng, cắt một phần sai | Từ chối tư duy nhị phân | Thừa nhận "kỹ năng khan hiếm đi", cắt "vốn đã tầm thường" |
| 2. Bằng chứng phản bác câu chuyện, không phải cảm xúc | Kỹ sư chỉ nhìn bằng chứng | Thời điểm / cỗ máy / thị trường / kỹ sư — 4 đường bằng chứng |
| 3. Đặt phán đoán trở lại chiều thời gian | Tu từ sợ lịch sử | 2018 / 1990 / 30 năm đường cong lương |
| 4. Đặt "người làm việc đó" trở lại trung tâm | Câu chuyện sợ tự tham chiếu | Người viết LLM = kỹ sư phần mềm |

**Bốn triết lý không độc lập — chúng tạo thành bộ công cụ phản bác**:

- Muốn phản bác một câu chuyện thời AI — **trước tiên dùng triết lý 3 để đặt nó vào chiều thời gian** ("trước đây thì sao?")
- Thời gian không giữ — **dùng triết lý 2 tìm bằng chứng** (thị trường, cỗ máy, người)
- Bằng chứng vẫn không giữ — **dùng triết lý 1 cắt "phần đúng" khỏi "phần sai"**
- Cuối cùng — **dùng triết lý 4 đưa người lên sân khấu** (người tạo AI là người bị gọi là "làm việc tầm thường")

**Bài 900 từ của Promptless không phải bình luận — nó là phương pháp luận có thể tái sử dụng cho "phản bác câu chuyện kỹ thuật thời AI".**

---

## 5. Ý tưởng cốt lõi

Di sản quan trọng nhất mà "Writing code was hard, actually" của Promptless để lại cho câu chuyện kỹ thuật thời AI là **phương pháp luận 4 bước để phản bác chủ nghĩa xét lại tiện lợi**:

1. **Thừa nhận một phần đúng** — "AI làm code rẻ đi" là đúng
2. **Cắt một phần sai** — nhưng "viết code vốn đã tầm thường" là viết lại
3. **Phản bác bằng bằng chứng** — ba mươi năm dữ liệu thị trường, hàng tỷ cho cỗ máy, kỹ sư đã tạo
4. **Đặt "người làm việc đó" trở lại trung tâm** — người tạo AI chính là người bị cho là làm "việc tầm thường"

**Ba câu hỏi để lật đổ bất kỳ câu chuyện "X vốn đã tầm thường" nào**:

- Cỗ máy này có đắt không? (đắt → không tầm thường)
- Thị trường đã phán xét bao lâu? (nhiều năm → không tầm thường)
- Ai đã tạo cỗ máy? (người làm việc đó → không tầm thường)

**Câu cần nhớ**:

> **"Kỹ năng đang khan hiếm đi" ≠ "kỹ năng vốn đã tầm thường".** Cái trước là đánh giá thị trường trung thực; cái sau là viết lại lịch sử. Promptless dùng 900 từ để làm rõ sự phân biệt này — và không phủ nhận bất kỳ thay đổi thực sự nào của thời AI, chỉ từ chối để "thay đổi" trở thành "viết lại".
>
> Kỹ sư sẽ không bị thuyết phục bởi tu từ "code vốn đã tầm thường" — nhưng sẽ bị thuyết phục bởi "thị trường không nói dối ba mươi năm" và "người tạo cỗ máy là người bị cho là làm việc tầm thường". **Đó là phản bác, không phải phàn nàn.** **Đó là món quà sạch nhất mà bài 900 từ của Promptless dành cho câu chuyện kỹ thuật thời AI.**

---

## Phụ lục A: Liên kết tham khảo

- [Promptless — "Writing code was hard, actually"](https://promptless.ai/blog/technical/writing-code-was-hard-actually)
- [Promptless — chỉ mục tài liệu đầy đủ (llms.txt)](https://promptless.ai/llms.txt)
- [Promptless trang chủ (Markdown)](https://promptless.ai/index.md)
- Bài văn hóa kỹ thuật liên quan trên cùng trang:
  - [Docs Site Search Optimization: Why Content Accuracy Comes First](https://promptless.ai/blog/technical/docs-site-search-optimization)
  - [Developer Relations Docs: Why They Go Stale and Who Should Own Them](https://promptless.ai/blog/technical/developer-relations-docs)
  - [Developer Relations Docs Have a New Primary Reader](https://promptless.ai/blog/technical/developer-relations-docs-agent-primary-reader)
- Sản phẩm chính của Promptless ([promptless.ai](https://promptless.ai/)): công cụ AI tự động cập nhật tài liệu hướng khách hàng khi bạn phát hành tính năng và hỗ trợ khách hàng
