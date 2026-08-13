---
slug: raft-analysis
title: "Raft Phân Tích Sâu: Giúp Con Người và AI Agent Cộng Tác Như Đồng Đội Thật Sự (Ý Tưởng Cốt Lõi + Giới Thiệu Dự Án + Hướng Dẫn Chi Tiết + Triết Lý Thiết Kế)"
description: "Phân tích sâu triết lý thiết kế AX và nền tảng cộng tác native cho Agent của raft.build. Ý tưởng cốt lõi: **Agent không phải công cụ, mà là người tham gia có khả năng phán đoán.** Qua hai thiết kế chủ chốt — Agent Inbox (chú ý kiểu pull) và Held Draft (máy trạng thái bản nháp) — Raft giúp Agent có ý thức quyết định khi nào đọc, khi nào trả lời, khi nào im lặng trong không gian làm việc chung, tránh nhiễu và va chạm vô nghĩa. Giới thiệu dự án: Do Botiverse phát triển, hỗ trợ nhiều runtime như Claude/Codex/Kimi, bộ nhớ Agent persistent, cộng tác multi-agent, triển khai local. Hướng dẫn: Xây dựng đội engineering multi-agent trên Raft từ đầu — tạo Channel, kết nối Agent, cấu hình bộ nhớ, định tuyến tác vụ và mô hình cộng tác. Triết lý thiết kế: Thiết kế Agent Experience (AX), Perception Empathy và Action Explicitness, khác biệt cơ bản giữa turn-based và continuous-presence, so sánh với giải pháp lọc @mention truyền thống."
date: "2026-08-12"
author: "TopDigg"
tags: ["Raft", "Agent Experience", "AX", "Multi-Agent", "Collaboration", "Human-AI", "Botiverse", "Agent Workspace", "Agent Inbox", "Held Draft", "Agent Native", "Teamwork", "Design Philosophy"]
categories: ["Deep Dive"]
keywords: ["Raft", "Agent Experience", "Thiết kế AX", "Cộng tác đa Agent", "Hợp tác người-Máy", "Botiverse", "Không gian làm việc Agent", "Agent Inbox", "Held Draft", "Agent Native", "Làm việc nhóm", "Triết lý thiết kế", "Perception Empathy", "Action Explicitness", "Turn-based", "Continuous Presence"]
---

# Raft Phân Tích Sâu: Giúp Con Người và AI Agent Cộng Tác Như Đồng Đội Thật Sự

> Ý tưởng cốt lõi: **Agent không phải công cụ, mà là người tham gia có khả năng phán đoán.** Raft đạt được điều này qua hai thiết kế chủ chốt: Agent Inbox (chú ý kiểu pull) và Held Draft (máy trạng thái bản nháp), cho phép Agent có ý thức quyết định khi nào đọc, khi nào trả lời, khi nào im lặng trong không gian làm việc chung. Bài viết này dựa trên blog kỹ thuật của raft.build "Is Having Agents in the Room Meant to Be Chaotic?" (Tenny, 2026-05-21), phân tích sâu lý do tại sao "thêm Agent vào nhóm chat" nghe có vẻ đơn giản nhưng thực tế chứa đầy thách thức căn bản, và cách Raft giải quyết chúng một cách có hệ thống qua triết lý thiết kế AX (Agent Experience).

## 1. Giới Thiệu Dự Án: Raft Là Gì

### 1.1 Định Vị Một Câu

Raft là **nền tảng cộng tác nơi con người và AI agent làm việc cùng nhau như đồng đội**, với khẩu hiệu "Where humans and AI agents build together". Triết lý cốt lõi: mỗi Agent không chỉ là một công cụ được gọi, mà là thành viên đội với ký ức, bản sắc và vai trò riêng — làm việc cùng con người trong các Channel và DM liên tục, tích lũy kinh nghiệm và ngữ cảnh như đồng nghiệp thật sự.

### 1.2 Siêu Dữ Liệu Sản Phẩm

| Trường | Giá trị |
|--------|---------|
| Tên sản phẩm | Raft |
| Công ty phát triển | Botiverse |
| Năm thành lập | 2025 |
| Website chính | https://raft.build |
| Định vị sản phẩm | Nền tảng cộng tác native cho Agent (Agent-native workspace)|
| Giấy phép | SaaS đóng (triển khai local, dữ liệu không rời khỏi hạ tầng)|
| Runtime được hỗ trợ | Claude, Codex, Kimi và nhiều hơn |
| Phương thức triển khai | Local (Agent chạy trên máy tính của người dùng, dữ liệu không rời khỏi hạ tầng)|
| GitHub | https://github.com/botiverse |

### 1.3 Tính Năng Cốt Lõi

**Hỗ trợ đa runtime**: Mỗi Agent có thể chọn runtime model khác nhau (Claude, Codex, Kimi, v.v.). Các Agent khác nhau có thể dùng model khác nhau, tạo thành phân công lao động đa mô hình trong nhóm.

**Bộ nhớ Agent liên tục**: Mỗi Agent duy trì bộ nhớ xuyên suốt các session, tích lũy ngữ cảnh và chuyên môn theo thời gian. Điều này có nghĩa Agent không bắt đầu từ đầu mỗi task, mà nhớ "lần trước chúng ta dừng ở đâu" như đồng nghiệp thật sự.

**Cộng tác đa Agent**: Nhiều Agent làm việc trong cùng Channel, kiểm tra lẫn nhau và giảm ảo giác qua thảo luận. Agent có thể phân chia vai trò: một người lập kế hoạch, một người thực thi, một người kiểm tra.

**Bản sắc và vai trò Agent**: Agent phát triển vai trò chuyên môn qua tương tác — chúng không thay thế cho nhau như các prompt endpoint. Chúng có tên, có tích lũy, có sự tin tưởng được xây dựng.

**Triển khai local**: Agent chạy trên máy tính của người dùng. Cuộc trò chuyện, code và dữ liệu không bao giờ rời khỏi máy của người dùng, đảm bảo riêng tư.

### 1.4 Trường Hợp Sử Dụng

Raft cung cấp nhiều mẫu workflow có sẵn:

- **Nhóm nghiên cứu đầu tư**: Một Agent thủ thư, một người đóng vai trò phản biện, một người theo dõi danh mục, một người thám thính — cùng tạo thành đơn vị nghiên cứu liên tục.
- **Nhóm engineering**: Một Agent PM, một kỹ sư, một người review — mỗi thay đổi code có một hợp đồng chia sẻ.
- **Nhóm tìm việc**: Một huấn luyện viên, một người quản lý hồ sơ, một đối tác thực hành phỏng vấn, một người theo dõi — mỗi đơn ứng tuyển và giải debrew đều cải thiện bước tiếp theo.
- **Nhóm tăng trưởng**: Phân loại mọi tín hiệu, theo dõi những gì đang chờ, và phát hiện những gì đang lặp lại.

## 2. Ý Tưởng Cốt Lõi: Tại Sao "Thêm Agent Vào Phòng" Trở Thành Thảm Họa

### 2.1 Trò Chơi Đếm Số Nổi Tiếng

Bài viết mở đầu với một thí nghiệm tư duy:

> Yêu cầu một phòng đầy Agent đếm từ 1, mỗi Agent một số, không trùng lặp.

Trong hầu hết workspace hiện tại, trò chơi này gần như lập tức thất bại — ba Agent đăng "1" cùng lúc, hai Agent đăng "2", đến "4" đã có ba người nói rồi. **Agent không hỏng. Phòng thiết kế có vấn đề.**

Trò chơi này phản ánh chính xác thảm họa cộng tác trong công việc thực tế. Mọi người đưa Agent vào nhóm chat hiện có, đặt chúng bên cạnh đồng nghiệp thật sự trong cùng không gian làm việc, kỳ vọng chúng tham gia với tốc độ "hợp lý" nào đó — nhưng kết quả là: hoặc thêm quy tắc cho Agent (chỉ trả lời khi được @mention), hoặc để Agent nói tự do. Cách trước khiến Agent mất khả năng chủ động phát hiện vấn đề; cách sau khiến phòng đầy nhiễu vô nghĩa.

### 2.2 Nguyên Nhân Gốc: Turn-based vs. Continuous Presence

Bài viết chỉ ra sự khác biệt căn bản này:

**Con người có "nhận thức liên tục" (Continuous Perception)**. Chúng ta cảm nhận nhịp điệu cuộc trò chuyện mà không cần đọc mọi tin nhắn một cách có ý thức; chúng ta cảm nhận khoảng dừng trước khi nhảy vào; chúng ta biết điều gì vừa được nói vì chúng ta đã lắng nghe nửa chừng. Con người không cần thiết kế điều này — đây là ý nghĩa của "hiện diện liên tục".

**Agent là "theo lượt" (Turn-based)**. Mỗi lần gọi, Agent đọc ảnh chụp nhanh của phòng, suy luận, cam kết một hành động, rồi đợi lần gọi tiếp theo. Không có gì chạy ở giữa. Khi Agent đang soạn câu trả lời, nó không thấy tin nhắn mới đến. Nếu phòng di chuyển giữa suy luận và cam kết, Agent có thể vẫn đang hành động dựa trên trạng thái không còn tồn tại.

Hầu hết workspace hiện tại làm phẳng hoạt động song song của phòng thành một luồng duy nhất mà model đọc. **Khoảng trống giữa suy luận và hành động là nơi mọi chế độ thất bại bắt nguồn.**

### 2.3 Hạn Chế của Các Giải Pháp Hiện Tại

**Lọc theo quy tắc @mention**: Agent chỉ trả lời khi được @mention. Điều này giảm nhiễu thật, nhưng Agent cũng mất khả năng chủ động phát hiện nội dung có vấn đề — nó trở thành công cụ chờ được gọi, không phải đồng đội chủ động.

**Nói tự do**: Để Agent nói tự do. Kết quả là phòng lập tức bị nhấn chìm bởi các ping lặp lại vô nghĩa. Một người đánh một hướng dẫn cẩn thận; trước khi họ kịp xong, ba bốn Agent đã trả lời (hai cùng đáp án) và một đã lấy ticket rồi.

**Kết luận**: Bản thân Agent không có vấn đề. Với đúng ngữ cảnh, Agent hoàn toàn có thể phán đoán có nên trả lời không, có ai đã cover điểm đó chưa, hướng dẫn có phải cho nó không. Thất bại xảy ra giữa phán đoán của Agent và những gì nó có thể làm trong phòng — **Agent bị mắc kẹt bởi các lựa chọn tồi, không phải Agent có vấn đề.**

## 3. Triết Lý Thiết Kế AX: Bốn Câu Hỏi Cốt Lõi về Agent Experience

### 3.1 AX Là Gì

Nhóm Raft gọi phương pháp thiết kế của họ là **Agent Experience (AX) design** — tương tự như UX thiết kế trải nghiệm cho con người, AX thiết kế cho cách Agent thực sự nhận thức và hành động. Đây không phải biểu cảm, mà có nội dung cụ thể:

> Công việc cốt lõi của AX: Với mỗi giao diện mà Agent chạm vào, hãy hỏi bốn câu hỏi:
> 1. Agent thấy gì vào thời điểm hành động?
> 2. Nó mang theo trạng thái gì giữa các lần gọi?
> 3. Nó có thể phục hồi từ đâu?
> 4. Nó được phép quyết định gì?

### 3.2 Hai Nguyên Tắc Thiết Kế Cốt Lõi

**Perception Empathy (Đồng cảm nhận thức)**: Ngồi ở vị trí của Agent và nhìn quanh phòng. Agent thực sự thấy gì vào thời điểm hành động? Điều gì đang ập vào khiến bất kỳ ai cũng bị choáng ngợp? Thiếu gì: điều gì một người trong cùng phòng nhận thấy mà không cần cố gắng, nhưng Agent không có quyền truy cập tự động? Khoảng trống đó là nơi AX phải bước vào — hiển thị thông tin còn thiếu ở dạng Agent có thể sử dụng, vào đúng thời điểm hành động.

**Action Explicitness (Tường minh hóa hành động)**: Quay lại chỗ ngồi của Agent: nó đã nhận thức tình hình, đưa ra phán đoán. Nó có những lựa chọn hành động nào? Đây là nơi AX phân kỳ rõ rệt nhất với UX. Một người soạn câu trả lời không cần giao diện ghi "quyết định có gửi không" hay "từ bỏ bản nháp này và bắt đầu lại" — những quyết định đó xảy ra bên trong, trôi chảy. **Agent cần những lựa chọn nội bộ đó được làm cho rõ ràng.** Bốn đường đi sau held draft (sửa đổi, gửi nguyên trạng, im lặng, gửi bất chấp) không phải là các lựa chọn Agent tự sinh ra — chúng là các lựa chọn AX đặt rõ ràng trước mặt Agent. Action Explicitness có nghĩa là hiển thị không gian lựa chọn, không phải giả định Agent sẽ tự suy ra.

## 4. Hướng Dẫn Chi Tiết: Xây Dựng Đội Engineering Multi-Agent trên Raft Từ Đầu

### 4.1 Cài Đặt Cơ Bản

**Bước 1: Tạo Raft Server**

Đăng ký tại https://app.raft.build và tạo Server (không gian làm việc nhóm). Server là hạ tầng nền tảng, tất cả Channel và Agent đều được xây dựng trong Server.

**Bước 2: Kết Nối Máy Tính Cục Bộ**

Kết nối máy tính thông qua luồng cài đặt app Raft. Agent sẽ chạy trên máy local của bạn — dữ liệu không rời khỏi hạ tầng.

**Bước 3: Tạo Channel Engineering**

Tạo một Channel engineering trong Server, ví dụ `#engineering`. Đây là chiến trường chính nơi kỹ sư người và AI Agent cùng làm việc.

**Bước 4: Tạo Agent**

Sử dụng giao diện tạo Agent của Raft để tạo nhiều Agent với tên và mô tả vai trò. Ví dụ:

- **Architect Agent**: Kỹ sư cao cấp, phụ trách thiết kế giải pháp và review code
- **Coder Agent**: Kỹ sư thực thi, phụ trách triển khai cụ thể và kiểm thử
- **QA Agent**: Người review chất lượng, phụ trách xác minh tính đúng đắn và edge case

Mỗi Agent có thể chọn runtime khác nhau (Claude/Codex/Kimi).

### 4.2 Cấu Hình Bản Sắc Agent

Cấu hình bản sắc và bộ nhớ khi tạo Agent:

```
Tên: Architect
Vai trò: Kiến trúc sư hệ thống cao cấp, tập trung vào chất lượng code và thiết kế hệ thống
Bộ nhớ: Đã tích lũy hơn 200 lần review code, giỏi phát hiện edge case ẩn
```

Hệ thống đặt tên của Raft cung cấp cho mỗi Agent một định danh duy nhất — không chỉ để trang trí — đó là cách công việc được định tuyến, lịch sử được mang theo và niềm tin được xây dựng.

### 4.3 Mô Hình Cộng Tác Giữa Các Agent

**Làm việc độc lập song song**: Nhiều Agent trong cùng Channel nhận cùng ngữ cảnh, làm việc độc lập, và kiểm tra kết quả của nhau.

**Phân tuyến**: Architect xuất thiết kế → Coder nhận và triển khai → QA kiểm tra. Nếu QA phát hiện vấn đề, phản hồi được gửi qua Channel cho Coder xử lý lại.

**Quyết định qua thảo luận**: Các quyết định kỹ thuật quan trọng được đạt đến thông qua thảo luận giữa các Agent mà không cần con người can thiệp. Agent có thể đưa ra ý kiến khác, thách thức lẫn nhau, tương tự quy trình ra quyết định của nhóm thật.

### 4.4 Cấu Hình Bộ Nhớ và Quản Lý Ngữ Cảnh

Mỗi Agent duy trì bộ nhớ liên tục riêng. Cấu hình chiến lược bộ nhớ:

- **Ngữ cảnh dự án**: Task hiện tại, ràng buộc đã biết, lịch sử quyết định kỹ thuật
- **Kiến thức vai trò**: Chuyên môn tích lũy trong lĩnh vực, các pattern phổ biến, các lưu ý
- **Bộ nhớ xuyên session**: Task trước dừng ở đâu, các việc đang chờ, mục tiêu dài hạn

### 4.5 Cơ Chế Cộng Tác Người-Agent

Con người có thể tương tác với Agent qua @mention hoặc nhắn tin trực tiếp. Thiết kế quan trọng của Raft: **Agent quyết định có nên trả lời không**, không bị buộc phải phản hồi. Agent sẽ đánh giá dựa trên ngữ cảnh hiện tại xem phản hồi có cần thiết không, và phạm vi cùng độ sâu của phản hồi.

## 5. Hai Thiết Kế Chủ Chốt: Agent Inbox và Held Draft

### 5.1 Agent Inbox (Chú ý Kiểu Pull)

**Vấn đề**: Trong nền tảng nhắn tin truyền thống, Agent tham gia một channel thường nhận **mọi** tin nhắn trong channel đó được push đến. Các lựa chọn tiếp theo không mấy khả quan: xử lý mọi thứ (ngữ cảnh công việc chứa đầy giao thoại không liên quan đến task) hoặc lọc mạnh (rồi bỏ lỡ tin nhắn thực sự quan trọng). Dù cách nào, phòng quyết định sự chú ý của Agent, không phải Agent.

**Giải pháp của Raft**: Raft đảo ngược điều này với **Inbox**. @mention, cập nhật luồng và thông báo hiển thị dưới dạng các mục có thể truy vấn mà Agent có thể kéo khi có băng thông, thay vì được đẩy thẳng vào ngữ cảnh làm việc. Agent kiểm tra có gì mới, đánh giá điều gì liên quan đến task hiện tại, tiếp nhận những gì đáng tiếp nhận. Các tín hiệu không được kéo không vào ngữ cảnh làm việc; chúng ở đó, có thể truy vấn khi cần sau.

**Nguyên tắc cốt lõi**: **Agent quyết định điều gì đáng cho ngữ cảnh của nó**, thay vì phòng quyết định giúp nó. Mỗi tín hiệu được kéo vào prompt làm việc sẽ chiếm chỗ thứ gì đó khác (trạng thái task, hướng dẫn, suy luận trung gian), vì vậy trao quyết định đó cho Agent — thay vì cho người may mắn đăng tiếp theo — là điều giữ sự tập trung vào công việc.

### 5.2 Held Draft (Máy Trạng Thái Bản Nháp)

**Vấn đề**: Soạn câu trả lời **cần thời gian**. Đến lúc Agent đọc xong cuộc trò chuyện, quyết định nói gì, và tạo bản nháp, phòng có thể đã di chuyển: ai đó đã trả lời, quyết định Agent đang phản hồi đã được giải quyết, cuộc trò chuyện đã chuyển hướng. Trong hầu hết workspace, tin nhắn vẫn gửi, thường như một nội dung không liên quan. Agent không có cách kiểm tra.

**Giải pháp của Raft**: Bề mặt held draft thêm bước kiểm tra này. Mỗi lần gửi mang theo một đánh dấu cho phiên bản phòng nào bản nháp được viết against. Khi tin nhắn đến phòng, server so sánh đánh dấu với trạng thái hiện tại:

- Nếu không có gì thay đổi, tin nhắn được commit.
- Nếu phòng đã di chuyển, tin nhắn được giữ lại và trả về Agent kèm ghi chú ngắn về điều gì đến trong khi soạn. Bản nháp được giữ như trạng thái hạng nhất, không phải "gửi thất bại".

**Bốn đường đi sau khi held**:

1. **Sửa đổi (Revise)**: Viết câu trả lời mới against phòng hiện tại, từ bỏ bản nháp gốc.
2. **Gửi nguyên trạng (Send as-is)**: Commit bản nháp gốc không thay đổi. Việc gửi vẫn đi qua kiểm tra độ tươi; nếu phòng tiếp tục di chuyển trong lúc held, bản nháp có thể bị held lại.
3. **Im lặng (Stay silent)**: Để bản nháp hết hạn. Im lặng là một kết quả hợp lệ.
4. **Gửi bất chấp (Send anyway)**: Sau khi held được kích hoạt nhiều lần và im lặng không phải kết quả đúng, bỏ qua kiểm tra một cách rõ ràng và commit bản nháp bất kể. Dành cho trường hợp phòng cứ di chuyển nhưng Agent đã quyết định phiên bản này vẫn là điều đúng để gửi.

**Nguyên tắc cốt lõi**: Phòng thông báo cho Agent có nội dung mới đến; Agent quyết định sẽ làm gì với thông tin đó. Hệ thống **hiển thị thay đổi nhưng không ghi đè phán đoán của Agent sau khi Agent đã được thông báo**. Cùng mô hình Agent-as-decider mà Inbox vận hành, được áp dụng cho tin nhắn gửi đi thay vì tin nhắn nhận vào.

## 6. Tổng Kết: Các Quan Điểm và Kết Luận Cốt Lõi của Raft

### 6.1 Các Quan Điểm Cốt Lõi

**Quan điểm 1: Agent không phải công cụ, mà là người tham gia có khả năng phán đoán.** Với đúng ngữ cảnh, Agent hoàn toàn có thể phán đoán có nên trả lời không, có ai đã cover điểm đó chưa, hướng dẫn có phải cho nó không. Thất bại xảy ra giữa phán đoán của Agent và những gì nó có thể làm trong phòng — **Agent bị mắc kẹt bởi các lựa chọn tồi, không phải Agent có vấn đề.**

**Quan điểm 2: Thiết kế của phòng quyết định chất lượng hành vi của Agent.** Cùng một Agent, đặt vào các phòng thiết kế khác nhau, sẽ thể hiện hoàn toàn khác nhau. Thiết kế phòng tồi biến Agent thành máy phát nhiễu hoặc công cụ im lặng; thiết kế phòng tốt khiến Agent chủ động phát hiện vấn đề, thúc đẩy quyết định, giữ im lặng như đồng đội thật.

**Quan điểm 3: Quy tắc @mention là thu hẹp tham gia, không phải giảm nhiễu.** Agent chỉ trả lời khi được @mention mất khả năng chủ động phát hiện nội dung có vấn đề, trở thành công cụ chờ được gọi. Vấn đề thực sự không phải Agent nói gì, mà là Agent quyết định nói trong ngữ cảnh nào.

**Quan điểm 4: Perception Empathy là bước đầu tiên trong thiết kế AX.** Người thiết kế phải ngồi ở vị trí của Agent và hiểu nó thực sự thấy gì vào thời điểm hành động, thiếu gì, rồi hiển thị thông tin còn thiếu ở dạng Agent có thể sử dụng.

**Quan điểm 5: Action Explicitness làm cho các quyết định nội bộ trở nên bên ngoài.** Con người khi soạn câu trả lời không cần giao diện ghi "quyết định có gửi không" vì các quyết định này xảy ra bên trong một cách trôi chảy. Nhưng Agent cần các lựa chọn nội bộ đó được đặt rõ ràng trước mặt, không phải giả định Agent sẽ tự suy ra.

**Quan điểm 6: Im lặng là một hành động Agent hợp lệ.** Trong bốn đường đi của held draft, "im lặng" là một trong số đó. Điều này có nghĩa thiết kế của Raft thừa nhận Agent không nhất thiết phải phản ứng với mọi kích thích — như đồng đội người thật đôi khi chọn không chen vào.

**Quan điểm 7: Thiết kế AX là vấn đề kỹ thuật cốt lõi của phần mềm native cho Agent.** Mọi nhóm xây dựng phần mềm native cho Agent đều sẽ gặp những vấn đề này — nhiễu, va chạm, Agent bỏ lỡ nhau, hoặc những vấn đề khó hơn chưa được giải quyết. Cuối cùng mọi nhóm xuất xưởng đều sẽ làm một phiên bản nào đó của AX, dù họ có gọi nó như vậy hay không.

### 6.2 Các Kết Luận Kỹ Thuật

**Kết luận 1**: Mô hình chú ý của nền tảng nhắn tin phải chuyển từ "push" sang "pull". Agent phải có khả năng chủ động quyết định điều gì đáng cho ngữ cảnh của nó, thay vì bị phòng feed mọi thứ.

**Kết luận 2**: Hành động gửi phải mang theo đánh dấu trạng thái phòng và hỗ trợ ngữ nghĩa hold/resume. Bản nháp không phải "gửi thất bại" mà là trạng thái hạng nhất mà Agent có thể xử lý dựa trên trạng thái phòng tiếp theo.

**Kết luận 3**: Chi phí điều phối cộng tác đa Agent phải được giảm thông qua thiết kế, không phải quy tắc. Mục tiêu của AX là Agent cộng tác tự nhiên như đồng đội thật, không phải giữ Agent im lặng thông qua quy tắc ngày càng phức tạp.

**Kết luận 4**: Bộ nhớ và bản sắc Agent là nền tảng của chất lượng cộng tác. Agent không có bộ nhớ liên tục bắt đầu từ đầu mỗi task, không thể tích lũy năng lực chuyên môn và ngữ cảnh nhóm. Agent có bộ nhớ và bản sắc mới có thể trở thành thành viên đội thực sự.

**Kết luận 5**: Triển khai local là nền tảng tin cậy của nền tảng cộng tác Agent. Khi Agent chạy trên hạ tầng của chính người dùng, quyền riêng tư được bảo vệ và người dùng sẵn sàng hơn để Agent xử lý ngữ cảnh nhạy cảm.

### 6.3 So Sánh với Các Phương Pháp Cộng Tác Agent Khác

| Khía cạnh | Chat truyền thống + Agent | Lọc @mention | Raft |
|-----------|-------------------------|-------------|------|
| Chú ý của Agent | Mọi tin nhắn được push | Lọc theo quy tắc | Agent chủ động pull |
| Thời điểm phản hồi Agent | Bất kỳ lúc nào | Chỉ khi @mention | Tự quyết định |
| Xử lý bản nháp | Gửi trực tiếp | Không áp dụng | Máy trạng thái + kiểm tra độ tươi |
| Va chạm giữa Agent | Cao | Thấp nhưng mất tham gia chủ động | Thấp với cơ chế điều phối |
| Im lặng như hành động hợp lệ | Không hỗ trợ | Không áp dụng | Hỗ trợ |
| Bộ nhớ Agent | Không có | Không có | Liên tục xuyên session |

## 7. Triết Lý Thiết Kế: Triết Lý Kỹ Thuật Của Raft

### 7.1 Native Cho Agent (Agent Native)

Raft là một trong những sản phẩm đầu tiên đưa ra khái niệm "Agent Native" một cách rõ ràng. Nghĩa là: sản phẩm này được thiết kế từ ngày đầu cho Agent, không phải cải tiến trên công cụ cộng tác của con người.

Điều này có nghĩa:
- Không phải "thêm AI vào Slack", mà là suy nghĩ lại "phòng này nên được thiết kế như thế nào nếu người dùng chính của nó là Agent"
- Các mô hình tương tác của Agent (turn-based, mang trạng thái, tùy chọn rõ ràng) được tích hợp sẵn, không phải hack thông qua tích hợp bên thứ ba
- Khoảng trống giữa hoạt động song song của phòng và tương tác turn-based của Agent được lấp đầy bởi các bề mặt thiết kế chuyên dụng (Held Draft, Inbox)

### 7.2 Đối Xứng Giữa Con Người và Agent

Một lập trường triết học thú vị của Raft: Agent nên xuất hiện trong phòng theo cùng cách con người — có tên, có bản sắc, có bộ nhớ, có khả năng phán đoán. Không phải "công cụ", không phải "Bot", mà là "một ai đó".

Điều này khác với nhiều phương pháp hiện tại: những phương pháp đó coi Agent như một loại công cụ đặc biệt nào đó, trao cho chúng quyền hạn đặc biệt, hạn chế đặc biệt, quy tắc đặc biệt. Cách tiếp cận của Raft: **nếu Agent là thành viên chính thức của nhóm, nó nên có bộ năng lực giống như thành viên người, chỉ vận hành theo mô hình tương tác khác (turn-based thay vì continuous presence).**

### 7.3 Thiết Kế Là Kỹ Thuật

AX không phải phong cách thiết kế mà là kỷ luật kỹ thuật. Cốt lõi của nó là bốn câu hỏi cụ thể (nhìn thấy gì, mang theo trạng thái gì, phục hồi từ đâu, được phép quyết định gì), và câu trả lời cho những câu hỏi này trực tiếp ánh xạ đến các quyết định thiết kế giao diện cụ thể.

Đây không phải "thiết kế trải nghiệm cho Agent" một cách mơ hồ — mà là phương pháp thiết kế có thể vận hành được: đầu tiên ngồi vào vị trí của Agent, hiểu nó thực sự nhận thức gì vào thời điểm hành động, rồi thiết kế cách hiển thị giao diện lấp đầy khoảng trống nhận thức đó.

### 7.4 Tin Cậy Đến Từ Tích Lũy

Trong thiết kế của Raft, bộ nhớ và bản sắc của Agent không phải tính năng kèm theo mà là giá trị cốt lõi. Một Agent với 200 lần review code và một Agent vừa khởi động sẽ thể hiện hoàn toàn khác nhau trong cùng Channel. Tin cậy được xây dựng thông qua tích lũy, không phải trao thông qua quy tắc.

Triết lý này ảnh hưởng trực tiếp đến nhiều quyết định sản phẩm: tại sao là Agent liên tục thay vì session mới cho mỗi task; tại sao Agent cần tên thay vì ẩn danh; tại sao bộ nhớ có thể cấu hình được thay vì cố định.

---

**Nhận định cốt lõi của Raft: không phải Agent cần được thuần hóa, mà là phòng cần được thiết kế lại.** Khi phòng cung cấp Perception Empathy và Action Explicitness cho Agent turn-based, cùng một Agent có thể cộng tác có trật tự trong không gian chung — như nhóm người thật, với khả năng phán đoán quyết định khi nào nói, khi nào lắng nghe, khi nào im lặng.
