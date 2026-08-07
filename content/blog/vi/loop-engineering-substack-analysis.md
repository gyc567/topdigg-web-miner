---
title: "Loop Engineering Phân Tích Chuyên Sâu (Bản Gốc Cobus Greyling): Ngừng Prompting Agent — Thiết Kế Vòng Lặp Phát Hiện Công Việc, Phân Công Nhiệm Vụ, và Xác Minh Kết Quả"
description: "Một bài phân tích toàn diện về bài viết gốc trên Substack của Cobus Greyling 'Loop Engineering' (2026-06-09). Ý tưởng cốt lõi: sự chuyển dịch từ việc prompting coding agent từng bước một sang việc thiết kế một hệ thống (vòng lặp) tự phát hiện công việc, giao nhiệm vụ cho các (sub-)agent, xác minh kết quả, duy trì trạng thái, và quyết định hành động tiếp theo — theo lịch trình hoặc cho đến khi đạt mục tiêu. Bao quát sự tiến hóa khái niệm (Context Engineering → Harness Engineering → Loop Engineering), sự phân công lao động harness/loop, năm khối xây dựng + memory (Automations/Scheduling, Worktrees, Skills, Plugins & Connectors, Sub-agents + Memory), các tiếng nói trực tiếp (Boris Cherny, Peter Steinberger, Addy Osmani), sự hội tụ không phụ thuộc công cụ của các primitive Grok/Codex/Claude Code, và những thực tế không nên bỏ qua (chi phí token, nợ hiểu biết, đầu hàng nhận thức)."
date: "2026-08-06"
author: "TopDigg Research Team"
tags: ["Loop Engineering", "Cobus Greyling", "AI Agent", "Substack", "Harness Engineering", "Context Engineering", "Claude Code", "Grok", "Codex", "MCP", "Worktrees", "Skills", "Automation"]
categories: ["Deep Dive"]
keywords: ["Loop Engineering", "Cobus Greyling", "AI agent", "loop engineering", "Harness", "Context Engineering", "Claude Code", "Grok", "Codex", "worktrees", "skills", "sub-agents", "memory", "đầu hàng nhận thức"]
---

# Loop Engineering Phân Tích Chuyên Sâu (Bản Gốc Cobus Greyling): Ngừng Prompting Agent — Thiết Kế Vòng Lặp Phát Hiện Công Việc, Phân Công Nhiệm Vụ, và Xác Minh Kết Quả

> Ý tưởng cốt lõi: **sự chuyển dịch từ prompting coding agent từng bước một sang việc thiết kế một hệ thống (vòng lặp).** Trong bài viết gốc trên Substack (2026-06-09), Cobus Greyling định nghĩa loop engineering là: bạn thiết kế một vòng lặp **phát hiện công việc, giao nhiệm vụ cho các agent (thường là sub-agents), xác minh kết quả, duy trì trạng thái, và quyết định hành động tiếp theo** — theo lịch trình hoặc cho đến khi đạt mục tiêu. Sự diễn đạt sắc bén nhất đến từ Boris Cherny (người đứng đầu Claude Code tại Anthropic): "Tôi không còn prompt Claude nữa. Tôi có các vòng lặp đang chạy để prompt Claude và quyết định phải làm gì. **Công việc của tôi là viết các vòng lặp.**" Bạn không viết một prompt to hơn — bạn đang xây một hệ thống trong đó các agent chỉ là những bánh răng.

---

## 1. Tổng Quan Dự Án

### 1.1 Nó Là Gì?

Bài viết này phân tích **bài viết gốc trên Substack của Cobus Greyling "Loop Engineering"** (`cobusgreyling.substack.com/p/loop-engineering`, xuất bản **ngày 9 tháng 6, 2026**). Nó không chỉ là một bài blog — nó là sự diễn đạt ở cấp tuyên ngôn của một mô hình phát triển mới gốc AI-native. Trong đó, Cobus định nghĩa Loop Engineering là:

> **Sự chuyển dịch từ việc bạn là người prompt coding agent từng bước một, sang việc bạn thiết kế một hệ thống (vòng lặp) tự phát hiện công việc, giao nhiệm vụ cho các agent (thường là sub-agents), xác minh kết quả, duy trì trạng thái, và quyết định hành động tiếp theo — theo lịch trình hoặc cho đến khi đạt mục tiêu.**

Vòng lặp có thể được nghĩ như một **mục tiêu đệ quy** (cách đóng khung của Addy Osmani): bạn định nghĩa một mục đích và AI lặp cho đến khi hoàn thành.

### 1.2 Các Thông Tin Chính

- Tác giả: **Cobus Greyling**, Chief Evangelist tại **Kore.ai**
- Nền tảng: Substack (`cobusgreyling.substack.com`)
- Xuất bản: 2026-06-09
- Dòng dõi khái niệm: Context Engineering → Harness Engineering → **Loop Engineering**
- Repo OSS đồng hành: `github.com/cobusgreyling/loop-engineering`
- Các liên kết hệ sinh thái: *Effective harnesses for long-running agents* của Anthropic, *When AI builds itself*, bài đăng X của Addy Osmani, Peter Steinberger (người tạo OpenClaw)

### 1.3 Vấn Đề Nó Giải Quyết Là Gì?

Quy trình AI-coding cũ là: **viết prompt → đọc đầu ra → viết prompt tiếp theo**. Con người giữ công cụ "hết lượt này đến lượt khác." Vấn đề: bạn không thể prompt riêng lẻ 10 agent song song, và vai trò người prompt không thể mở rộng.

Câu trả lời (Loop Engineering): **xây các hệ thống điều khiển tự động nhỏ dùng các agent.** Bạn ngừng điều khiển agent từng bước và thay vào đó thiết kế một hệ thống tự chạy — theo lịch trình hoặc cho đến khi một điều kiện được đáp ứng. Đó là sự khác biệt cốt yếu so với một cuộc trò chuyện một lần.

---

## 2. Các Ý Tưởng Cốt Lõi

### 2.1 Sự Tiến Hóa Ba Lớp (Ngữ Cảnh Trước)

Bài viết mở đầu bằng cách định vị sự tiến hóa của toàn ngành — bản thân điều đó đã là một quan điểm:

> "(Bối cảnh AI đang mở ra nhanh chóng…) còn nhớ khi **Context Engineering** còn mới, rồi **Harness Engineering**… giờ chúng ta có **Loop Engineering**. Hãy nghĩ về chúng như ba lớp, mỗi lớp giải quyết một vấn đề khác nhau."

Sự phân công lao động harness/loop:

- **Harness**: làm khung cho một lần chạy agent **đơn lẻ** (công cụ, tiêu chí hoàn thành, phản hồi).
- **Loop**: lớp **liên tục thúc các agent theo lịch trình, sinh trợ lý phụ, và tự nuôi chính nó.**

### 2.2 Định Nghĩa Một Câu (Cách Đóng Khung Của Addy Osmani)

> "Loop engineering là thay thế bạn trong vai trò người prompt agent. Bạn thiết kế hệ thống làm việc đó thay bạn. Một vòng lặp ở đây có thể được nghĩ như một mục tiêu đệ quy nơi bạn định nghĩa một mục đích và AI lặp cho đến khi hoàn thành."

### 2.3 Hai Câu Trích Dẫn Đặc Trưng

- **Peter Steinberger** (người tạo OpenClaw): "Bạn không nên prompting coding agent nữa. **Bạn nên thiết kế các vòng lặp để prompt các agent của mình.**"
- **Boris Cherny** (người đứng đầu Claude Code tại Anthropic): "Tôi không còn prompt Claude nữa. Tôi có các vòng lặp đang chạy để prompt Claude và quyết định phải làm gì. **Công việc của tôi là viết các vòng lặp.**"

> Sự hội tụ công cụ đáng chú ý: cả Claude Code và OpenAI Codex đều đã chạm tới các primitive rất giống nhau, nên **"hình dạng vòng lặp" đang trở nên phần nào không phụ thuộc công cụ.**

---

## 3. Hướng Dẫn Chi Tiết: Năm Khối Xây Dựng + Memory (Hệ Thống Sáu Phần Cốt Lõi)

Đây là trái tim của bài viết. **Một vòng lặp thực sự chạy không cần giám sát không phải một prompt dài — nó là một hệ thống nhỏ với sáu phần.** Năm là năng lực; phần thứ sáu là xương sống giữ trạng thái giữa các lần chạy.

### 3.1 Khối 1: Automations / Scheduling (Nhịp Tim)

> **Nhịp tim của vòng lặp.**

- Không có lịch trình, bạn có một phiên agent một lần; có lịch trình, bạn có **phát hiện và phân loại theo một nhịp điệu**.
- Nó biến "tôi nên kiểm tra CI mỗi sáng" thành **điều gì đó xảy ra dù bạn có mở terminal hay không**.
- **Claude Code**: `/loop`, `/schedule`, `/goal` (chạy cho đến khi một điều kiện xác minh được được đáp ứng, với một **mô hình riêng biệt** kiểm tra "xong" để worker không tự chấm bài của chính mình); Hooks và GitHub Actions mang cùng ý tưởng ra ngoài chat.
- **Grok**: `/loop [interval] <prompt>` cùng các công cụ scheduler bên dưới (`scheduler_create`, `scheduler_list`, `scheduler_delete`) — lặp lại, bền vững, kích hoạt ngay lập tức.

> "Nhịp tim không cần phải thông minh nhưng nó cần phải đáng tin cậy."

### 3.2 Khối 2: Worktrees (Thực Thi Song Song An Toàn)

- Hai agent cùng chỉnh sửa các file giống nhau cùng lúc = **một thảm họa merge đang chờ xảy ra**.
- Các git worktree cô lập (hoặc checkout tương đương) cho mỗi agent một thư mục làm việc riêng trong khi chia sẻ lịch sử.
- Cả hai công cụ coding-agent lớn đều đóng kèm tính năng này; các sub-agent có thể được phóng vào các checkout mới để công việc song song không va chạm.

> Trong Grok: truyền `isolation: "worktree"` khi sinh sub-agents. **Dọn dẹp quan trọng.** Một vòng lặp để lại các worktree mồ côi là một vòng lặp bạn sẽ hối hận.

### 3.3 Khối 3: Skills (Tri Thức Dự Án Bền Vững)

> Mỗi phiên, agent khởi động lạnh.

- Các quy ước, lệnh build, chuẩn mực review, và sự cố đã dạy bạn "chúng tôi không làm theo cách đó" — tất cả phải được ngoại hóa.
- **Skills là cách bạn trả bớt nợ ý định.**
- Một `SKILL.md` (cùng các script và tài liệu tham khảo tùy chọn) giữ tri thức cần tồn tại xuyên các lần chạy.
- Claude Code dùng `CLAUDE.md` và skills, đóng gói thành plugins để chia sẻ; Grok dùng cùng một mẫu hình.

> Không có skills, mỗi lần chạy vòng lặp lại là ngày một.

### 3.4 Khối 4: Plugins & Connectors (Vươn Vào Các Công Cụ Thực)

- **Một vòng lặp chỉ đọc được filesystem là một vòng lặp chỉ có thể gợi ý.**
- Các connector dựa trên MCP cho phép vòng lặp hành động: mở PR, cập nhật ticket Linear, đăng lên Slack, truy vấn cơ sở dữ liệu, kích hoạt một runbook. Vòng lặp ngừng là một nhà bình luận và bắt đầu là một **nhà điều hành**.
- MCP đã trở thành nền chung — các connector viết cho một công cụ thường chuyển được sang công cụ khác.

### 3.5 Khối 5: Sub-agents (Sự Phân Tách Maker/Checker)

> **Agent viết ra mã là một người phán xử kém công việc của chính nó.**

- Đây không phải giới hạn của mô hình — **nó là một giới hạn cấu trúc**.
- Một agent (hoặc đội) khám phá và triển khai; một agent **khác** (đôi khi là một mô hình mạnh hơn, luôn với các chỉ dẫn khác) xác minh theo specs, skills, và tests.
- Trong các vòng lặp không giám sát, **bộ xác minh là thứ cho phép bạn bước đi với chút tự tin**.
- `/goal` trong vài công cụ áp dụng cùng nguyên tắc: **một mô hình mới mẻ** quyết định liệu điều kiện dừng đã được đáp ứng hay chưa.

### 3.6 Khối 6: Memory (Xương Sống Bền Vững)

> Không thứ nào ở trên tự mình sống sót qua ranh giới phiên.

- Vòng lặp phải đọc từ và ghi vào một thứ **bên ngoài**: một `STATE.md`, một `LOOP-STATE.json`, một cột Linear board, một chế độ xem GitHub Project.
- Trạng thái tốt trả lời ba câu hỏi:
  1. Chúng ta đang làm gì ngay lúc này?
  2. Lần trước chúng ta đã thử gì, và điều gì đã xảy ra?
  3. Điều gì đang chờ một con người?

> Với các vòng lặp nhiều ngày hoặc nhiều lần chạy, điều này **không thể thương lượng**. File trạng thái thường là **artifact quan trọng nhất mà vòng lặp tạo ra.**

---

## 4. Triết Lý Thiết Kế

### 4.1 Hệ Thống Điều Khiển Tự Vận Hành, Không Phải Prompt To Hơn

Cốt lõi tinh thần: **loop engineering không phải một prompt đơn lẻ dài hơn — nó là một hệ thống tự gọi chính nó lặp đi lặp lại.** Vai trò của bạn chuyển từ người prompt sang người thiết kế hệ thống. Điểm đòn bẩy đã dịch chuyển.

### 4.2 "Hình Dạng Vòng Lặp" Không Phụ Thuộc Công Cụ

Về sự hội tụ của các công cụ agent, bài viết nói rõ: Claude Code và OpenAI Codex đã chạm tới các primitive rất giống nhau, nên hình dạng vòng lặp đang trở nên **không phụ thuộc công cụ** — một tín hiệu rằng ngành đang hội tụ về một sổ tay điều phối chuẩn.

### 4.3 Nguyên Tắc Tách Biệt Maker/Checker

Xuyên suốt các câu trích dẫn then chốt chạy một triết lý: các hệ thống agent mạnh nhất luôn giữ một bộ xác minh độc lập, và **agent viết ra mã không bao giờ tự chấm bài của chính nó**. Đây là mức tin cậy tối thiểu cần thiết cho vận hành không giám sát.

### 4.4 Đòn Bẩy Hay Cái Bẫy — Phần Kết Đáng Tỉnh Táo

Bài viết kết thúc bằng một cảnh báo tỉnh táo: "**Đầu hàng nhận thức là cái bẫy thoải mái.**" Cùng một thiết kế vòng lặp có thể đẩy nhanh một người vẫn ở vai trò kỹ sư — hoặc để một người từ bỏ hoàn toàn khả năng phán đoán.

> Hãy xây vòng lặp như một người có ý định vẫn là kỹ sư — không phải chỉ là người bấm nút chạy.

---

## 5. Tóm Tắt: Quan Điểm & Kết Luận

1. **Hướng của sự chuyển dịch là rõ ràng**: từ "con người viết prompt → agent thực thi" sang "con người thiết kế vòng lặp → vòng lặp prompt agent tự động."
2. **Thứ bậc**: Loop Engineering nằm trên một cấp so với "kỹ thuật harness agent."
3. **Hình dạng**: các vòng lặp đang trở nên không phụ thuộc công cụ.
4. **Định nghĩa**: một mục tiêu đệ quy — bạn định nghĩa một mục đích, AI lặp cho đến khi hoàn thành.
5. **Cấu trúc**: bất kỳ vòng lặp thực sự không giám sát nào cũng là một hệ thống sáu phần "năm năng lực + một memory."
6. **Bộ xác minh là lý do bạn có thể bước đi**: xác minh độc lập là thứ khiến vận hành không giám sát đáng tin cậy.
7. **Các tiếng nói trực tiếp khớp nhau**: Peter Steinberger và Boris Cherny đều chốt ở "công việc của tôi là viết các vòng lặp."
8. **Đừng bỏ qua các thực tế**: chi phí token, nợ hiểu biết, và đầu hàng nhận thức là những chi phí thực mà một câu chuyện lý tưởng hóa không nên che giấu.

### Các Câu Trích Dẫn Then Chốt Đáng Giữ

- Boris Cherny: "Công việc của tôi là viết các vòng lặp."
- Peter Steinberger: "Bạn nên thiết kế các vòng lặp để prompt các agent của mình."
- "Nhịp tim không cần phải thông minh nhưng nó cần phải đáng tin cậy."
- "Skills là cách bạn trả bớt nợ ý định."
- "Vòng lặp đã giao hàng nó, nhưng điều đó không có nghĩa bạn biết nó hoạt động thế nào."

---

## References

- Bài viết gốc: `https://cobusgreyling.substack.com/p/loop-engineering`
- Repo OSS đồng hành: `https://github.com/cobusgreyling/loop-engineering`
- Kỹ thuật Anthropic: `https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents`
- Anthropic (tự cải thiện đệ quy): `https://www.anthropic.com/institute/recursive-self-improvement`
- Tác giả: Cobus Greyling (Chief Evangelist, Kore.ai) — `https://cobusgreyling.me/`
