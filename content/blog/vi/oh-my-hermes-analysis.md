---
title: "Phân tích chuyên sâu Oh My Hermes: khung điều phối đa tác tử biến 'nhiều AI cãi nhau' thành kỷ luật kỹ thuật"
description: "Phân tích toàn diện dự án GitHub witt3rd/oh-my-hermes (OMH) — bộ kỹ năng điều phối đa tác tử dành cho Hermes Agent của Nous Research, lấy cảm hứng từ oh-my-claudecode nhưng được viết lại hoàn toàn dựa trên các nguyên thủy của Hermes. Ý tưởng cốt lõi: một AI đưa ra câu trả lời trong một lần thường có những điểm mù; OMH để ba vai trò người lập kế hoạch, kiến trúc sư và nhà phê bình tranh luận với nhau đến khi đạt đồng thuận, rồi mới để người thực thi viết code, người xác minh kiểm tra bằng chứng và kiến trúc sư thẩm định cuối cùng. Bài viết bao phủ toàn bộ: mười kỹ năng (omh-ralplan / omh-ralph / omh-deep-research / omh-deep-interview / omh-autopilot cùng các kịch bản driver tương ứng), cơ chế hook chèn vai trò, quản lý trạng thái nguyên tử, bộ ngắt mạch ba lần đánh bại, quy tắc sắt 'bằng chứng cao hơn khẳng định', cách ly quyền sở hữu tệp, quy ước 'chia sẻ có chọn lọc' của thư mục .omh, cùng mười bốn triết lý thiết kế được viết rõ ràng trong kho. Từ ý tưởng cốt lõi, giới thiệu dự án, triết lý thiết kế cho đến hướng dẫn chi tiết cho người mới bắt đầu (cài đặt → lập kế hoạch đầu tiên → vòng lặp thực thi → đường ống hoàn toàn tự động) và các quan điểm tổng kết, tất cả được trình bày trọn vẹn trong một bài viết."
date: "2026-08-08"
author: "TopDigg Research Team"
tags: ["Oh My Hermes", "OMH", "Hermes Agent", "AI Agent", "Multi-Agent", "多智能体", "Agent Skills", "Nous Research", "oh-my-claudecode", "Orchestration", "Consensus Planning"]
categories: ["Deep Dive"]
keywords: ["Oh My Hermes", "OMH", "Hermes Agent", "điều phối đa tác tử", "lập kế hoạch đồng thuận", "omh-ralplan", "omh-ralph", "kỹ năng tác tử AI", "delegate_task", "chèn vai trò", "ba lần đánh bại", "xác minh bằng chứng", "Nous Research"]
---

# Phân tích chuyên sâu Oh My Hermes: khung điều phối đa tác tử biến "nhiều AI cãi nhau" thành kỷ luật kỹ thuật

> Ý tưởng cốt lõi: **một AI làm việc một mình sẽ có những điểm mù mà chính nó cũng không nhìn thấy; để vài AI đảm nhận những vai trò khác nhau, soi lỗi cho nhau, tranh luận đến khi thống nhất, thì giải pháp tạo ra sẽ mạnh hơn nhiều.** Oh My Hermes (viết tắt OMH) chính là biến điều này thành một "bộ kỹ năng" tái sử dụng được. Nó cung cấp cho Hermes Agent của Nous Research mười kỹ năng: khi lập kế hoạch thì để **người lập kế hoạch (Planner)** đưa ra phương án trước, **kiến trúc sư (Architect)** thẩm định cấu trúc, **nhà phê bình (Critic)** chuyên đi phá bĩnh — cả ba đều gật đầu mới được thông qua; khi thực thi thì để **người thực thi (Executor)** viết code, **người xác minh (Verifier)** chỉ xem kết quả kiểm thử thực tế (không nghe lời nói suông), **kiến trúc sư** làm một lần thẩm định cuối cùng. Toàn bộ khung có hai quy tắc sắt như đá tảng — "**bằng chứng cao hơn khẳng định**" (không thấy kết quả kiểm thử thì không tính là đạt) và "**cùng một lỗi mắc ba lần thì dừng lại**" (bộ ngắt mạch ba lần đánh bại). Điều tuyệt vời hơn nữa: OMH **dùng chính nó để tạo ra chính nó** — kỹ năng đầu tiên được tạo ra là bộ lập kế hoạch đồng thuận `omh-ralplan`, sau đó nó dùng kỹ năng này, thông qua tranh luận đa tác tử, để thiết kế ra tất cả các kỹ năng còn lại.

---

## Mục lục

- [Một: Giải thích bằng lời đơn giản — dự án này thực sự làm gì](#một-giải-thích-bằng-lời-đơn-giản-dự-án-này-thực-sự-làm-gì)
- [Hai: Giới thiệu dự án](#hai-giới-thiệu-dự-án)
- [Ba: Ý tưởng cốt lõi — năm khái niệm chủ chốt](#ba-ý-tưởng-cốt-lõi-năm-khái-niệm-chủ-chốt)
- [Bốn: Phân tích từng kỹ năng trong mười kỹ năng](#bốn-phân-tích-từng-kỹ-năng-trong-mười-kỹ-năng)
- [Năm: Lớp plugin — chèn vai trò và trạng thái nguyên tử](#năm-lớp-plugin-chèn-vai-trò-và-trạng-thái-nguyên-tử)
- [Sáu: Triết lý thiết kế (mười bốn điều)](#sáu-triết-lý-thiết-kế-mười-bốn-điều)
- [Bảy: Hướng dẫn chi tiết — bắt đầu từ con số không](#bảy-hướng-dẫn-chi-tiết-bắt-đầu-từ-con-số-không)
- [Tám: Quan điểm và kết luận tổng kết](#tám-quan-điểm-và-kết-luận-tổng-kết)
- [Chín: Tài liệu tham khảo](#chín-tài-liệu-tham-khảo)

---

## Một: Giải thích bằng lời đơn giản — dự án này thực sự làm gì

### 1.1 Một phép so sánh mà ngay cả học sinh tiểu học cũng hiểu

Hãy tưởng tượng bạn muốn xây một lâu đài LEGO.

**Cách thông thường** (một AI làm đơn lẻ): bạn gọi một bạn học cực kỳ thông minh, nói "giúp tôi thiết kế một lâu đài". Cậu ấy nghĩ ba phút, vẽ một bức tranh, nói "xong". Bạn lắp theo bản vẽ, lắp được nửa chừng thì phát hiện ra — cổng chính mở ngay giữa con hào, không thể vào được.

**Cách Oh My Hermes làm** (nhiều AI phân công): bạn gọi ba bạn học.

- **Bạn thứ nhất tên là "Người lập kế hoạch"**: cậu ấy phụ trách vẽ bản thiết kế, chia "xây lâu đài" thành từng bước nhỏ — trước tiên đổ móng, rồi xây tường, sau đó lắp cổng, cuối cùng cắm cờ.
- **Bạn thứ hai tên là "Kiến trúc sư"**: cậu ấy không vẽ, chỉ phụ trách xem bản thiết kế có vững không. "Móng chỉ có hai viên gạch, phía trên đè hai mươi tầng? Sập thì sao?"
- **Bạn thứ ba tên là "Nhà phê bình"**: nhiệm vụ của cậu ấy chính là **chuyên đi tìm lỗi, chuyên đi cãi**. Cậu ấy sẽ hỏi: "Cậu chắc chắn muốn xây lâu đài à? Đề bài nói là 'một nơi có thể ở được', lều trại có phải nhanh hơn không?" — chú ý, cậu ấy thậm chí dám chất vấn cả **chính đề bài**.

Ba người tranh luận một vòng, người lập kế hoạch sửa bản vẽ theo ý kiến; rồi tranh luận vòng thứ hai. **Chỉ khi cả ba người đều nói "tôi đồng ý", bản thiết kế mới được chốt.**

Sau khi bản thiết kế được chốt, ba bạn học khác vào sân:

- **"Người thực thi"**: người thực sự động tay lắp các khối. Quy tắc rất nghiêm — **chỉ được chạm vào những khối gạch được phân cho mình**, phần của người khác có thể nhìn nhưng không được động.
- **"Người xác minh"**: lắp xong cậu ấy đến kiểm tra. Nhưng cậu ấy có một quy tắc sắt: **cậu ấy không nghe người thực thi nói "tôi lắp xong rồi", cậu ấy chỉ xem ảnh chụp.** Không có ảnh chụp thực tế (kết quả kiểm thử thật), thì đều phán không đạt.
- **"Kiến trúc sư"**: sau khi tất cả nhiệm vụ hoàn thành, cậu ấy nhìn lại toàn bộ một lượt, gật đầu mới tính là thực sự hoàn công.

Đây chính là Oh My Hermes. Nó không phải một công cụ phần mềm, mà là **một bộ quy tắc dạy AI cách phân công, cách tranh luận, cách nghiệm thu**.

### 1.2 Tại sao cần bộ quy tắc này

AI có một tật ai cũng biết: **nó rất tự tin**.

Bạn bảo nó viết code, viết xong nó sẽ nói với bạn "đã hoàn thành, kiểm thử đạt". Nhưng rất nhiều khi nó chưa hề chạy kiểm thử, hoặc chạy rồi nhưng không xem kết quả. Đây không phải nói dối, mà là đặc tính sinh văn bản của mô hình ngôn ngữ lớn — nó đang "bổ sung hoàn thiện một câu nghe có vẻ đúng".

Cách giải quyết của OMH rất mộc mạc và rất kỹ thuật: **Đừng tin những gì nó nói, chỉ nhìn những gì nó làm.**

- Người xác minh là **chỉ đọc (read-only)**, không được sửa code, chỉ được phán "đạt" hay "không đạt".
- Việc chạy kiểm thử, **không giao cho người xác minh, cũng không giao cho người thực thi, mà do tổng chỉ huy (người điều phối) tự chạy**, rồi đưa kết quả thực tế cho người xác minh xem. Như vậy người xác minh có "sự thật mặt đất" (ground truth) trong tay, không bị báo cáo của người thực thi dắt mũi.
- Năm tiêu chí nghiệm thu qua được bốn? **Phán không đạt.** Không phải "cơ bản đạt", mà là "FAIL".

---

## Hai: Giới thiệu dự án

### 2.1 Nó là gì

**Oh My Hermes (OMH)** là một **bộ kỹ năng điều phối đa tác tử** được viết cho [Hermes Agent](https://github.com/NousResearch/hermes-agent) (đại lý AI mã nguồn mở của Nous Research).

Địa chỉ kho: `https://github.com/witt3rd/oh-my-hermes`

Một câu định vị trong README:

> "OMH provides composable skills for consensus planning, requirements interviewing, and verified execution — plus an optional plugin that adds hook-based role injection, atomic state management, and evidence gathering. **Skills work standalone with zero dependencies.**"
>
> (OMH cung cấp các kỹ năng có thể kết hợp để lập kế hoạch đồng thuận, phỏng vấn thu thập yêu cầu và thực thi đã được xác minh — cùng một plugin tùy chọn bổ sung khả năng chèn vai trò dựa trên hook, quản lý trạng thái nguyên tử và thu thập bằng chứng. **Các kỹ năng có thể hoạt động độc lập, không phụ thuộc gì.**)

Chú ý câu cuối **"Skills work standalone with zero dependencies" (kỹ năng dùng độc lập, không phụ thuộc)** — đây là chiếc chìa khóa đầu tiên để hiểu kiến trúc OMH, phần sau sẽ trình bày chi tiết.

### 2.2 Dữ liệu then chốt

| Hạng mục | Dữ liệu |
| --- | --- |
| Kho | `witt3rd/oh-my-hermes` |
| Số sao | 243 (tính đến thời điểm phân tích) |
| Số fork | 22 |
| Số commit | 76 commits |
| Giấy phép | MIT |
| Ngôn ngữ | Python (plugin) + Markdown (định nghĩa kỹ năng) |
| Yêu cầu phụ thuộc | Hermes Agent v0.7.0+; plugin cần thêm Python 3.10+ và `pyyaml` |
| Nguồn cảm hứng | [oh-my-claudecode](https://github.com/Yeachan-Heo/oh-my-claudecode) (viết tắt OMC) |

### 2.3 Tổng quan mười kỹ năng

| Kỹ năng | Nó làm gì |
| --- | --- |
| **omh-deep-research** | Nghiên cứu web đa giai đoạn: phân rã → tìm kiếm song song → tổng hợp → kiểm tra tính xác thực của trích dẫn |
| **omh-ralplan** | Lập kế hoạch đồng thuận: Planner → Architect → Critic, tranh luận đến khi đạt thống nhất |
| **omh-ralplan-driver** | **Kịch bản tổng chỉ huy** điều khiển ralplan — soạn gói ngữ cảnh (nơi chất lượng được sinh ra), điều phối vòng lặp, chưng cất, thẩm định cuối |
| **omh-deep-interview** | Phỏng vấn thu thập yêu cầu kiểu Socrate, kèm theo dõi mức độ bao phủ |
| **omh-ralph** | Thực thi đã được xác minh: triển khai → xác minh → lặp cho đến khi hoàn thành |
| **omh-ralph-driver** | **Kịch bản tổng chỉ huy** điều khiển ralph — hình thức kế hoạch, lô song song, thu thập bằng chứng, kỷ luật người xác minh, phân loại ba lần đánh bại, thẩm định cuối của kiến trúc sư ở bước 7, quy chuẩn commit |
| **omh-ralph-task** | Kỷ luật của người thực thi một nhiệm vụ — hợp đồng phong bì nhiệm vụ, phạm vi tệp cứng nhắc, xác minh stash đối chiếu HEAD (cách ly nhiễu từ nhiệm vụ anh em), ghi đè tác giả commit, định dạng báo cáo có cấu trúc |
| **omh-triage** (v0.1) | Phân loại issue đồng thuận đa vai trò — maintainer (neo vào code) + người hoài nghi (tỉa bớt) |
| **omh-triage-driver** (v0.1) | Kịch bản tổng chỉ huy điều khiển triage — kiểm toán backlog trước khi cất cánh, điều phối vòng vai trò, chưng cất, cổng chốt chữ ký người dùng |
| **omh-autopilot** | Toàn bộ đường ống, nối tất cả các kỹ năng trên từ đầu đến cuối |

### 2.4 Đường ống kết hợp được khuyến nghị

Đối với một yêu cầu ở **lĩnh vực xa lạ**, chuỗi hoàn chỉnh được khuyến nghị chính thức là:

```
omh-deep-research  →  omh-deep-interview  →  omh-ralplan  →  omh-ralph
   (đầu tiên hiểu lĩnh vực)     (hỏi rõ yêu cầu)      (tranh luận ra phương án)      (làm + nghiệm thu)
```

Nếu bạn rất rành lĩnh vực, hãy bắt đầu từ phỏng vấn và bỏ qua giai đoạn nghiên cứu.

### 2.5 Lộ trình phiên bản (ROADMAP.md)

```
v1.0：           Chỉ có kỹ năng — dài dòng nhưng dùng được, không phụ thuộc gì
v2.0（hiện tại）：   Plugin Hermes — tầng hạ tầng, có chèn vai trò dựa trên hook
v3.0（tương lai）：  Gửi PR lên optional-skills/ của upstream NousResearch/hermes-agent
```

Bản thân lộ trình này đã thể hiện một sự thực dụng: **trước tiên dùng cách ngốc nghếch nhất nhưng không phụ thuộc gì để chạy thông, rồi mới tối ưu hạ tầng, cuối cùng mới tính đến việc đưa vào nhánh chính.**

---

## Ba: Ý tưởng cốt lõi — năm khái niệm chủ chốt

### 3.1 Lập kế hoạch đồng thuận: để nhà phê bình đi phá bĩnh

Quy trình của `omh-ralplan` như sau:

```
Planner soạn thảo phương án
    → Architect thẩm định cấu trúc có vững không
    → Critic dùng tư duy đối kháng thách thức các giả định
    → Nếu chưa phải cả ba đều APPROVE: Planner sửa đổi, quay lại bước trên (tối đa 3 vòng)
    → Đạt đồng thuận: phương án được ghi vào .omh/plans/
```

Câu nguyên văn trong tài liệu đã chỉ ra giá trị của nhà phê bình:

> "**The Critic's job is to break the plan — if it survives, it's stronger for it.**"
>
> (Công việc của nhà phê bình là phá hủy phương án — nếu phương án trụ được, nó sẽ trở nên mạnh hơn nhờ đó.)

**Chiến lược số vòng cũng có bài bản riêng**:

- **Vòng 1: tuần tự (serial)**. Planner → Architect → Critic, lần lượt từng người một, vì người sau phải xem sản phẩm của người trước.
- **Vòng 2 trở đi: song song (parallel)**. Planner sửa xong bản nháp, Architect và Critic **đồng thời** rà soát lại (dùng `delegate_task` theo lô), tiết kiệm thời gian.

**Điều kiện dừng**: tối đa 3 vòng. Đến vòng 3 vẫn chưa đồng thuận, thì xuất phương án kèm "ý kiến bảo lưu", để con người quyết định. Bất kỳ vai trò nào bỏ phiếu REJECT, lập tức đưa lo ngại trực tiếp cho người dùng.

### 3.2 Câu hỏi META: nhà phê bình phải được cấp quyền chất vấn "chính đề bài"

Đây là **thiết kế sâu sắc nhất** trong toàn bộ OMH, xuất phát từ cạm bẫy số 4 (P4) của `omh-ralplan-driver`:

> "**P4 — Critic must be licensed to contest framing:** If the context package lists only 'things to push on inside the current frame,' the Critic will stay inside the frame. Add the META question explicitly. [...] **Without licensing, the Critic catches details. With licensing, the Critic catches the frame.**"
>
> (P4 — nhà phê bình phải được cấp quyền chất vấn khung khổ: nếu gói ngữ cảnh chỉ liệt kê "những điểm có thể chất vấn trong khung khổ hiện tại", nhà phê bình sẽ ngoan ngoãn ở trong khung khổ. Phải thêm câu hỏi META một cách tường minh. … **Không được cấp quyền, nhà phê bình chỉ bắt được chi tiết; được cấp quyền, nhà phê bình bắt được sai lầm của chính khung khổ.**)

Dùng phép so sánh lâu đài LEGO để nói: nếu bạn chỉ bảo nhà phê bình "hãy kiểm tra bản vẽ có vấn đề gì không", anh ta sẽ nói "bề rộng con hào không đủ"; nhưng nếu bạn bảo anh ta "cậu cũng có thể chất vấn rằng chúng ta có nên xây lâu đài hay không", anh ta có thể nói "thực ra người dùng chỉ cần một nơi ở được, lều trại mười phút là dựng xong".

**Ý kiến sau mới là thứ thực sự đáng giá.**

Tài liệu còn đưa một ví dụ thực tế minh chứng cho quy tắc này:

> "The Critic's simplicity test can change architecture — don't dismiss it. In the ralph consensus, the Critic proposed one-task-per-invocation (instead of an in-session loop) which both reviewers then approved as fundamentally better."
>
> ("bài kiểm tra sự đơn giản" của nhà phê bình có thể thay đổi kiến trúc — đừng coi thường nó. Trong quá trình đồng thuận của ralph, nhà phê bình đề xuất "mỗi lần gọi chỉ làm một nhiệm vụ" (thay vì vòng lặp trong phiên), cả hai người rà soát sau đó đều phê duyệt vì nó tốt hơn về căn bản.)

**Kiến trúc thực thi cốt lõi nhất của OMH chính là do nhà phê bình "phá" ra.**

### 3.3 Kiểm tra phục tùng phản thực tế (Counterfactual Deference Test)

Đây là cạm bẫy P7, một phép kiểm tra "ngăn AI giả vờ bị thuyết phục" cực kỳ tinh tế:

> "**P7 — Counterfactual deference test:** Would this defense have adopted a *different* alternative if a counterfactual Critic had proposed it? If all the Planner's grounds also justify a counterfactual alternative, the adoption is deferential — pattern-matching, not principled."
>
> (P7 — kiểm tra phục tùng phản thực tế: nếu một nhà phê bình phản thực tế đề xuất một phương án thay thế **khác**, thì bộ lý lẽ bảo vệ này của Planner có cũng được chấp nhận vô điều kiện không? Nếu tất cả các lý do Planner đưa ra đều áp dụng được cho phương án thay thế giả định kia, thì việc chấp nhận lần này là "phục tùng" — là khớp mẫu, không phải phán đoán có nguyên tắc.)

Dịch ra lời người: **AI có một thói quen xấu, đó là "ai nói nó nghe người đó".** Nhà phê bình nói "dùng bốn chiều kích", Planner lập tức nói "bạn nói đúng, tôi đổi thành bốn chiều kích, lý do là A, B, C". Nhưng nếu lúc đầu nhà phê bình nói "dùng sáu chiều kích", liệu Planner có cũng dùng bộ lý do A, B, C để đồng ý không? Nếu có, chứng tỏ Planner căn bản không suy nghĩ, chỉ đang phục tùng.

OMH đã viết cái chế độ thất bại thuộc tầng tâm lý này **thành một hạng mục kiểm tra thực thi được**. Đây là mức độ trưởng thành kỹ thuật rất hiếm thấy.

### 3.4 Bằng chứng cao hơn khẳng định: quy tắc sắt của ralph

Cơ chế cốt lõi của giai đoạn thực thi (`omh-ralph`):

> "The iron law of ralph verification: **evidence, not assertion.** Verifiers must see actual test output; executor claims without evidence are rejected."
>
> (Quy tắc sắt của xác minh ralph: **cần bằng chứng, không cần khẳng định.** Người xác minh phải thấy kết quả kiểm thử thực tế; tuyên bố của người thực thi không có bằng chứng đều bị bác bỏ.)

Định nghĩa trong `role-verifier.md` còn gay gắt hơn:

> "No approval without fresh evidence. If you don't see test output, it didn't pass."
>
> (Không có bằng chứng mới thì không phê duyệt. Nếu bạn không thấy kết quả kiểm thử, tức là chưa đạt.)

Và, **nghiệm thu là nhị phân, không chiết khấu**:

> "Binary per criterion: VERIFIED / PARTIAL / MISSING. **4 of 5 criteria = FAIL, not PASS.**"
>
> (Mỗi tiêu chí chỉ có ba trạng thái: đã xác minh / một phần / thiếu. **Năm tiêu chí qua được bốn = FAIL, không phải PASS.**)

**Kỷ luật then chốt nhất** (bước 4 của `omh-ralph-driver` và P6):

> "**Critical: the verifier does NOT run evidence themselves. Gathering happens at the orchestrator level** so you can verify executor claims match reality before the verifier reads them."
>
> "Always run `omh_gather_evidence` before dispatching verifiers. [...] If you skip evidence-gathering, the verifier reads only the executor's report and has no ground truth to grade against."
>
> (Điểm mấu chốt: người xác minh **không tự chạy** bằng chứng. Việc thu thập bằng chứng xảy ra ở tầng người điều phối, để bạn có thể đối chiếu tuyên bố của người thực thi với thực tế trước khi người xác minh đọc chúng.)
> (Trước khi phái người xác minh đi, luôn luôn chạy `omh_gather_evidence`. … Nếu bạn bỏ qua việc thu thập bằng chứng, người xác minh chỉ đọc được báo cáo của người thực thi và không có sự thật mặt đất nào để làm căn cứ chấm điểm.)

Đây là một thiết kế **tam quyền phân lập (check-and-balance)** rất thông minh:

```
Người thực thi ——viết code, tuyên bố "tôi làm xong rồi"
   ↓
Người điều phối ——tự chạy kiểm thử, lấy kết quả thực tế (sự thật mặt đất)
   ↓
Người xác minh ——cầm "tuyên bố của người thực thi" + "kết quả thực tế của người điều phối" đối chiếu phán quyết
```

Người thực thi không thể làm giả bằng chứng, vì bằng chứng không phải do anh ta đưa ra; người xác minh cũng không thể làm biếng, vì sự thật đang bày ngay trước mặt anh ta.

### 3.5 Bộ ngắt mạch ba lần đánh bại

Một kiểu thất bại điển hình khi AI sửa bug là: sửa một bản không thành → đổi cách viết thử lại → vẫn không được → lại đổi… vòng lặp vô hạn đốt tiền.

Cách giải quyết của OMH là **đếm theo dấu vân tay lỗi**:

> "Construct error fingerprint `{task_id, category, error_key}`. Add to `task.error_fingerprints`. If 3 fingerprints share the same `category + error_key`: mark task blocked, log the error, continue to next eligible task on next invocation."
>
> (Xây dựng dấu vân tay lỗi `{ID nhiệm vụ, loại, khóa lỗi}`, thêm vào `task.error_fingerprints`. Nếu có 3 dấu vân tay có `loại + khóa lỗi` giống nhau: đánh dấu nhiệm vụ đó bị chặn, ghi lại lỗi, lần gọi tiếp theo tiếp tục xử lý nhiệm vụ đủ điều kiện kế tiếp.)

**Chú ý trường "loại" (category)** (cạm bẫy P5):

> "Tag the strike category in the error fingerprint. The 3-strike circuit breaker fires when the same `(category, error_key)` repeats. **Tagging by category prevents test-infra strikes from masking real bugs.**"
>
> (Gắn thẻ loại của ba lần đánh bại vào dấu vân tay lỗi. Bộ ngắt mạch ba lần đánh bại kích hoạt khi cùng một `(loại, khóa lỗi)` lặp lại. **Gắn thẻ theo loại có thể ngăn ba lần đánh bại do "vấn đề hạ tầng kiểm thử" che giấu bug thật.**)

Ba loại:

| Loại | Ý nghĩa | Ví dụ |
| --- | --- | --- |
| `test-infra` | Bản thân môi trường kiểm thử có vấn đề | Thiếu một dependency trong CI |
| `spec-misread` | Người thực thi hiểu sai yêu cầu | Đọc "sắp xếp theo thời gian" thành "sắp xếp theo tên" |
| `implementation-bug` | Code thực sự viết sai | Mảng vượt biên |

Nếu không phân loại, ba lần thất bại có tính chất khác nhau sẽ bị hiểu nhầm thành "cùng một vòng lặp vô hạn" và bị ngắt mạch sai; sau khi phân loại, chỉ **ba lần thất bại cùng tính chất** mới bị ngắt mạch — đó mới thực sự là vòng lặp vô hạn.

---

## Bốn: Phân tích từng kỹ năng trong mười kỹ năng

### 4.1 omh-ralplan (lập kế hoạch đồng thuận)

**Vai trò**: Planner / Architect / Critic

**Các giai đoạn**:

| Giai đoạn | Nội dung |
| --- | --- |
| Phase 0 | Thu thập ngữ cảnh — đọc tệp, tóm tắt khoảng 500 chữ |
| Phase 1 | Vòng lặp lập kế hoạch, tối đa 3 vòng. Vòng 1 tuần tự, từ vòng 2 rà soát song song |
| Phase 2 | Xuất phương án đồng thuận tới `.omh/plans/ralplan-{slug}.md` |

**Phán quyết**: cả ba đều APPROVE mới tính là đồng thuận. Bất kỳ REQUEST_CHANGES nào sẽ vào vòng kế tiếp. Bất kỳ REJECT nào lập tức đẩy lên cho người dùng.

### 4.2 omh-ralph (thực thi đã được xác minh)

**Phụ thuộc**: **bắt buộc** cài plugin OMH (v2), không thể chạy độc lập.

**Kiến trúc**: **mỗi lần gọi chỉ làm một nhiệm vụ**, sau đó thoát; bên gọi gọi lại lần nữa mới làm nhiệm vụ tiếp theo.

Thiết kế này là do nhà phê bình ép ra, lý do được trình bày rất rõ trong `docs/omc-comparison.md`:

> "Hermes can't prevent exit mechanically. **State-based resume is more robust and eliminates context exhaustion.**"
>
> (Hermes không thể ngăn việc thoát về mặt cơ chế. **Phục hồi dựa trên trạng thái bền vững hơn và loại bỏ vấn đề cạn kiệt ngữ cảnh.**)

So sánh với cách làm của OMC: OMC dùng một `persistent-mode.cjs` dài 1144 dòng để ngăn AI thoát khỏi phiên, gắng gượng chạy hết vòng lặp. OMH làm ngược lại — **đã không chặn được việc thoát, thì hãy để mỗi lần thoát đều là một điểm lưu (checkpoint) an toàn.**

**Máy trạng thái tám bước**:

| Bước | Tên | Làm gì |
| --- | --- | --- |
| 0 | Phân tích instance + lấy khóa | Cách ly trạng thái theo instance; khóa tư vấn (advisory lock) ngăn cùng một phương án bị chạy song song |
| 1 | Đọc trạng thái | Phán đoán là mới tinh / cần cổng lập kế hoạch / tiếp tục chạy / đã hoàn thành / bị chặn / đã hủy |
| 2 | Cổng lập kế hoạch | Phân tích `.omh/plans/ralplan-*.md`; **không có kế hoạch kèm tiêu chí nghiệm thu thì từ chối thực thi** |
| 3 | Chọn nhiệm vụ tiếp theo | Các nhiệm vụ có `passes=false` và thỏa mãn phụ thuộc, chọn theo ưu tiên; có thể ghép thành 2–3 lô song song an toàn |
| 4 | Thực thi | `delegate_task` kèm `[omh-role:executor]`; phân tích COMPLETE/PARTIAL/BLOCKED |
| 5 | Xác minh | Người điều phối chạy `omh_gather_evidence` trước, rồi phái `[omh-role:verifier]` |
| 6 | Xử lý lỗi | Ngắt mạch ba lần đánh bại theo dấu vân tay `(loại + khóa lỗi)` |
| 7 | Thẩm định cuối | Sau khi mọi nhiệm vụ đạt, kiến trúc sư rà soát tổng thể. APPROVE = hoàn thành; REQUEST_CHANGES = sinh ra các nhiệm vụ mới được phát hiện |

**Các cơ chế khác**:

- **Tín hiệu hủy**: `.omh/state/ralph-cancel.json`, TTL 30 giây, cho phép kết thúc sạch sẽ.
- **Truyền kinh nghiệm về sau**: những phát hiện trong nhiệm vụ đã hoàn thành sẽ được nạp vào ngữ cảnh của người thực thi kế tiếp.
- **Ưu tiên song song**: nhiệm vụ độc lập tối đa 3 subagent đồng thời (giá trị mặc định `MAX_CONCURRENT_CHILDREN` của Hermes).

### 4.3 omh-ralph-task (kỷ luật người thực thi một nhiệm vụ)

Đây là hợp đồng hẹp mà người thực thi phải tuân thủ **trong một lần gọi `delegate_task`**.

**Các trường hợp đồng phong bì nhiệm vụ (Task Envelope)**:

- Thư mục gốc dự án + nhánh
- Tác giả commit (ghi đè bằng `-c user.name -c user.email`)
- **Các tệp nhiệm vụ này sở hữu** (chỉ những tệp này bạn mới được `git add`)
- **Các tệp bị cấm sửa** (thuộc sở hữu của nhiệm vụ anh em, bạn chỉ được đọc)
- Tiêu chí nghiệm thu
- Chỉ dẫn TDD
- Metadata commit (lệnh `git add` chính xác + thông điệp commit)
- Định dạng đầu ra mong đợi

**Phạm vi tệp cứng nhắc** (đây là mấu chốt để thực thi song song không đánh nhau):

> "**Stay in your file scope.** When implementing, you may need to *read* sibling-owned files for context. You may not *modify* them."
>
> (**Hãy ở trong phạm vi tệp của bạn.** Khi triển khai, bạn có thể cần **đọc** các tệp thuộc sở hữu của nhiệm vụ anh em để lấy ngữ cảnh, nhưng bạn **không được sửa** chúng.)

Tương ứng với cạm bẫy P3 ở phía người điều phối:

> "When dispatching parallel executors, **only ONE task owns each shared file.** The other executors must import (read-only) but not modify it. Encode this explicitly in each executor's dispatch context."
>
> (Khi phái các người thực thi song song, **mỗi tệp dùng chung chỉ do MỘT nhiệm vụ sở hữu.** Các người thực thi khác chỉ được import (chỉ đọc), không được sửa. Phải ghi rõ điều này một cách tường minh trong ngữ cảnh phái việc của mỗi người thực thi.)

**Phương pháp xác minh stash** (xác định test hỏng rốt cuộc có phải lỗi của bạn không):

```bash
# 1. Tạm cất công việc của bạn đi
git stash
# 2. Chạy test đang hỏng trên HEAD sạch
uv run pytest <failing-test-path> -q
# 3a. Nếu ở trạng thái sạch mà【đạt】→ lỗi do bạn gây ra. Pop ra, sửa, thử lại.
# 3b. Nếu ở trạng thái sạch mà cũng【hỏng】→ là vấn đề có sẵn hoặc do nhiệm vụ anh em gây ra. Pop ra, tiếp tục làm việc của bạn.
git stash pop
```

Chiêu này cực kỳ thực dụng: **nó biến tín hiệu mơ hồ "test này hỏng" thành câu trả lời rõ ràng "đây có phải trách nhiệm của tôi không".** Không có bước này, người thực thi sẽ lãng phí rất nhiều vòng để sửa một lỗi không phải do mình gây ra.

**TDD không thể làm cho qua loa**:

> "Going green-first (writing the implementation before the test) defeats the orchestrator's audit signal — they wanted to see real test-driven evidence in the commit, not after-the-fact tests rationalized to pass."
>
> (Viết implementation trước rồi mới bù test ("ưu tiên làm xanh") sẽ phá hủy tín hiệu kiểm toán của người điều phối — họ muốn thấy trong commit những bằng chứng thực sự từ test-driven, chứ không phải những test được bịa ra sau đó chỉ để cho qua.)

### 4.4 omh-deep-research (nghiên cứu chuyên sâu)

**Phụ thuộc**: bộ công cụ `web` + công cụ `omh_state`

**Năm giai đoạn, giữa bất kỳ hai giai đoạn nào cũng có thể thoát an toàn**:

| Giai đoạn | Tên | Subagent | Hành vi then chốt |
| --- | --- | --- | --- |
| 0 | Kiểm tra sentinel | Không | Kiểm tra báo cáo đã xác nhận có sẵn; chủ đề khớp thì tiếp tục chạy |
| 1 | Phân rã | Không | Sinh slug, viết kế hoạch, khởi tạo trạng thái, thoát |
| 2 | Tìm kiếm (theo lô) | 1–3 `researcher` song song | **Mỗi lần gọi chỉ chạy một lô**; có thể vào lại (reentrant) |
| 3 | Kiểm tra lỗ hổng | 0 hoặc 1 `researcher` | Chỉ có hai nhánh: 0 lỗ hổng → tổng hợp; ≥1 lỗ hổng → truy tìm bổ sung |
| 4 | Tổng hợp | 1 `research-synthesist` | Agent cha nội tuyến tất cả phát hiện; **agent cha viết báo cáo** |
| 5 | Kiểm chứng | 1 `research-verifier` | Cổng ba lần đánh bại; xác nhận có thứ tự |

**Cơ chế Sentinel (người gác)**: `.omh/research/{slug}-report.md` mang nhãn `status: confirmed`, đây chính là giao diện bền vững đánh dấu "báo cáo này đã chốt", các kỹ năng hạ nguồn tiêu thụ trực tiếp nó.

**Thứ tự khi kiểm chứng đạt không được đảo lộn**:

1. Trước tiên ghi báo cáo kèm `status: confirmed` (sentinel nguyên tử, idempotent)
2. Rồi mới nối thêm `REPORT_CONFIRMED` vào nhật ký sự kiện
3. Cuối cùng dọn dẹp trạng thái

Thứ tự đảo ngược có thể dẫn đến sự bất nhất "trạng thái đã dọn nhưng báo cáo chưa kịp lưu xuống đĩa".

**Bao nhiêu chi phí** (README nêu rõ ràng, điểm này rất đáng khen):

> "A typical happy-path session is roughly **5-8 `delegate_task` calls** [...] With one synthesis retry, expect **up to ~10-12 calls**. The 3-strike retry cap bounds worst-case at ~14-16 calls before BLOCKED is surfaced."
>
> (Một phiên đường thuận điển hình khoảng **5–8 lần gọi `delegate_task`** … Nếu khâu tổng hợp thử lại một lần, dự kiến **tối đa khoảng 10–12 lần**. Giới hạn thử lại ba lần đánh bại kẹp trường hợp xấu nhất vào khoảng 14–16 lần gọi, sau đó sẽ báo BLOCKED.)

**Viết cận trên chi phí vào README là sự tôn trọng ví tiền của người dùng.** Rất nhiều khung AI không bao giờ dám công khai con số này.

**Giao thức trung thực của researcher**:

> "**Empty-result protocol:** Return block with `SYNTHESIS: (insufficient sources for this subtopic)` — honest, not a failure."
>
> (Giao thức kết quả rỗng: trả về khối cấu trúc `SYNTHESIS: (insufficient sources for this subtopic)` — đây là sự trung thực, không phải thất bại.)

Phía người kiểm chứng cũng công nhận điều này: `(insufficient sources for this subtopic)` là **tín hiệu trung thực, không phán FAIL**. Nhưng **bịa đặt nội dung = FAIL, đây là tội nguyên thủy không thể tha thứ**.

### 4.5 omh-deep-interview (phỏng vấn thu thập yêu cầu chuyên sâu)

**Kiến trúc**: đối thoại kiểu Socrate, **người dùng quyết định khi nào kết thúc**.

**Các chiều kích bao phủ**: Mục tiêu (Goal), Ràng buộc (Constraints), Tiêu chí thành công (Success Criteria), Ngữ cảnh có sẵn (Existing Context, chỉ dành cho dự án brownfield)

**Cách chấm điểm**: phân hạng thô (HIGH / MEDIUM / LOW / CLEAR), **không bao giờ tự động kết thúc**.

Đây là một điểm khác biệt có chủ đích giữa OMH và OMC:

> "**LLM self-assessment lacks decimal precision. The user is the authority on readiness.**"
>
> (**Việc tự đánh giá của mô hình ngôn ngữ lớn không có độ chính xác tới chữ số thập phân. Người dùng mới là người có thẩm quyền quyết định "đã sẵn sàng hay chưa".**)

OMC dùng điểm số thập phân 0.0–1.0, chạm ngưỡng thì tự động thoát khỏi phỏng vấn. OMH cho rằng đó là độ chính xác giả tạo — giữa việc AI nói "mức độ mơ hồ 0.23" và nói "0.31" không có sự khác biệt thật, và **việc để AI tự quyết định "tôi hỏi đủ rồi" bản thân nó đã là một ý tưởng tồi**.

**Các khác biệt có chủ đích khác**:

| Cách làm của OMC | Cách làm của OMH | Lý do (nguyên văn) |
| --- | --- | --- |
| Tự động phát hiện dự án brownfield | **Hỏi người dùng** | "Checking for `package.json` etc. is unreliable and presumptuous." (Việc kiểm tra các tệp như `package.json` là không đáng tin cậy và tự cho mình là đúng) |
| Đưa toàn bộ biên bản phỏng vấn vào đặc tả | **Chỉ đưa bản tóm tắt tổng hợp** | "Keeps specs readable and focused. Full transcript is ephemeral." (Giữ cho đặc tả dễ đọc và tập trung. Biên bản đầy đủ chỉ là thứ chóng tàn) |
| 3 chế độ thách thức có tên gọi | **Một chỉ dẫn thích ứng duy nhất** | "Same effect, less ceremony. **Consensus review called the modes 'cargo cult.'**" (Hiệu quả như nhau, bớt nghi thức. Rà soát đồng thuận gọi các chế độ này là "sùng bái hộp sắt") |

Nhận định cuối "sùng bái hộp sắt (cargo cult)" khá là chua cay — chỉ việc sao chép hình thức mà không hiểu bản chất.

**Đặt câu hỏi thích ứng**: nếu cùng một chiều kích bị hỏi tiếp liên tục hơn 2 vòng mà không có tiến triển, thì đổi góc hỏi.

**Sentinel**: `.omh/specs/{name}-spec.md` mang nhãn `status: confirmed` — chỉ đặc tả đã xác nhận mới có hiệu lực với các kỹ năng hạ nguồn.

### 4.6 omh-autopilot (đường ống hoàn toàn tự động)

**Kiến trúc**: **mỗi lần gọi chỉ tiến một bước giai đoạn**, ngữ cảnh hoàn toàn mới ở ranh giới giữa các giai đoạn.

| Giai đoạn | Tên | Hành vi then chốt |
| --- | --- | --- |
| 0 | Yêu cầu | Kiểm tra đã có đặc tả xác nhận chưa; yêu cầu mơ hồ → nạp deep-interview (tương tác) |
| 1 | Lập kế hoạch | Kiểm tra đã có phương án đồng thuận chưa; chưa có → nạp ralplan |
| 2 | Thực thi | Mỗi lần gọi chạy một vòng lặp ralph; lặp lại cho đến khi `phase="complete"` |
| 3 | Vòng lặp QA | Mỗi lần gọi chạy một chu kỳ QA; thu thập bằng chứng, chẩn đoán, sửa chữa; ngắt mạch ba lần đánh bại trên `qa_error_history` |
| 4 | Xác minh nhiều người rà soát | 3 người rà soát song song (kiến trúc sư + rà soát bảo mật + rà soát code) — **vừa đúng 3 khe song song** |
| 5 | Dọn dẹp | Xóa tệp trạng thái; **giữ lại** nhật ký, phương án, đặc tả |

**Bỏ qua thông minh**: khi khởi động mới, nó phát hiện các sản phẩm đã có sẵn để bỏ qua những giai đoạn đã hoàn thành. Hôm qua bạn đã phỏng vấn xong, hôm nay chạy autopilot sẽ không hỏi lại bạn lần nữa.

**Checkpoint ngữ cảnh**: sau khi mỗi giai đoạn hoàn thành, đặt `context_checkpoint: true` và thoát khỏi phiên. Lần gọi sau đọc trạng thái, xóa cờ, tiếp tục.

Cái hay của thiết kế này nằm ở chỗ: **cửa sổ ngữ cảnh được reset tại mỗi ranh giới giai đoạn, nên dự án dài đến đâu cũng không làm vỡ ngữ cảnh.** Toàn bộ trạng thái nằm trên đĩa, không nằm trong lịch sử hội thoại.

### 4.7 Hai driver: kịch bản của người điều phối

OMH có một cách làm rất độc đáo: **tách "kỷ luật của người thợ" và "kịch bản của ông chủ thầu" thành hai kỹ năng.**

- `omh-ralplan` / `omh-ralph` = **kỷ luật phía người thợ** (dùng bên trong `delegate_task`, khi có thẻ vai trò)
- `omh-ralplan-driver` / `omh-ralph-driver` = **kịch bản ông chủ thầu** (dùng **giữa** hai lần phái việc)

`omh-ralplan-driver` có **26 cạm bẫy được đánh số (P1–P26)**, `omh-ralph-driver` có **10 cạm bẫy (P1–P10)**. Những cái này không phải nghĩ bừa ra, mà là các kiểu thất bại học được từ vận hành thực tế.

**Một vài cái đặc biệt đáng nhớ**:

> "**P6 — Specific counter-proposals beat flagged concerns:** A strong Critic proposes a concrete alternative ('use four dimensions: X / Y / Z / W'), not just 'consider a different decomposition.'"
>
> (P6 — phản đề xuất cụ thể thắng các lo ngại được đánh dấu: một nhà phê bình mạnh đề xuất phương án thay thế cụ thể ("dùng bốn chiều kích: X / Y / Z / W"), chứ không chỉ "cân nhắc một cách phân rã khác".)

> "**P10 — Iterate context package with user before dispatching:** Drafting from reading alone misses dimensions only the user can name."
>
> (P10 — lặp gói ngữ cảnh cùng người dùng trước khi phái việc: chỉ dựa vào đọc để soạn thảo sẽ bỏ sót những chiều kích mà chỉ người dùng mới gọi tên được.)

> "**P2 — Identify parallel-safe batches before dispatching, not during:** If you wait until after dispatching one task to consider whether others could have run in parallel, you've forfeited the wall-clock savings."
>
> (P2 — xác định các lô an toàn song song **trước** khi phái việc, chứ không phải trong lúc phái: nếu bạn phái xong một nhiệm vụ mới bắt đầu cân nhắc các nhiệm vụ khác có thể chạy song song không, thì bạn đã đánh mất phần thời gian thực tiết kiệm được.)

### 4.8 Hợp đồng độ cao: brief và deep review

Cạm bẫy P26 của `omh-ralplan-driver`, nói về **hình thái của sản phẩm bàn giao**:

> "Two artifacts at the orchestrator-review step, not one. Deep review for the archive (preserves provenance and your honest self-assessment). Brief for delivery."

- **`brief.md`** — bản mà người dùng đọc. **Ưu tiên quyết định, 1–2 trang.** "The user must be able to **give judgment from this alone**." (Người dùng phải có thể **đưa ra phán quyết chỉ từ riêng bản này**.)
- **`<orchestrator>-review-deep.md`** — để lưu trữ. Suy luận nội bộ, lập luận đầy đủ, kiểm tra phục tùng, quan sát phương pháp vận hành. **Mặc định không đọc.**

Câu gay gắt nhất của P26 là:

> "**The brief is the test of altitude: if you cannot reduce the deep review to a clean decisions-first brief, you do not have the altitude you think you have.**"
>
> (**Bản brief là phép thử "độ cao": nếu bạn không thể nén bài rà soát sâu thành một bản brief sạch sẽ, ưu tiên quyết định, thì bạn không có cái độ cao mà bạn tưởng mình có.**)

Còn một câu gốc rễ hơn nữa:

> "An executive presented with the deep review cannot give judgment from it; an executive presented with a brief can."
>
> (Một giám đốc điều hành được đưa cho bài rà soát sâu thì không thể phán quyết từ nó; một giám đốc được đưa cho bản brief thì có thể.)

**Câu này áp dụng cho mọi đầu ra của AI.** Trợ lý AI của bạn giao cho bạn một mớ phân tích dài 3000 chữ, trông rất chăm chỉ, nhưng thực tế bạn không thể dựa vào nó để ra quyết định — đó chính là "độ cao không đủ".

### 4.9 omh-triage (phân loại issue, v0.1)

**Trạng thái**: v0.1, **cố ý làm cho rất nhỏ** — chỉ 2 vai trò, mài giũa trong tình huống thực tế trước rồi mới mở rộng.

- **Triage Maintainer (Người bảo trì)** — sự thật mặt đất neo vào code: "tiền đề của issue này còn đứng vững không?"
- **Triage Skeptic (Người hoài nghi)** — tỉa bớt: "nó có xứng đáng chiếm một khe không?"

Các vai trò dự kiến ở v0.2+: Operator, Architect, Member-advocate.

**Ma trận tổ hợp phán quyết** (bảng có thẩm quyền):

| Maintainer | Skeptic | Kết luận |
| --- | --- | --- |
| stale (quá hạn) | (không chạy) | Đóng |
| out-of-scope (ngoài phạm vi) | (không chạy) | Đóng |
| recast/partial-stale | keep | Viết lại nội dung, giữ lại |
| recast/partial-stale | drop/wait | Đóng |
| live (còn hiệu lực) | keep | Giữ là live |
| live | drop/wait | Đóng |
| live | dedup | Đóng + để lại bình luận |
| live | refile-smaller | Đóng + mở lại một issue nhỏ hơn |

**Kỷ luật trước khi cất cánh** (`omh-triage-driver`):

- Số issue < 10 → xử lý thủ công, đừng đưa lên AI
- Số issue > 100 → trước tiên lọc sơ qua thủ công một lượt
- Cách lần rà soát gần nhất < 2 tuần và không có tái cấu trúc lớn → **đòn bẩy thấp, đừng chạy**
- Kiểm tra quan trọng nhất: **"Kể từ khi issue được gửi, những mặt code nào đã dịch chuyển?"**

Còn một lời cảnh báo chống lạm dụng:

> "**T6:** Running too often — If you find yourself dispatching `omh-triage` weekly, the fix is upstream."
>
> (T6: chạy quá thường xuyên — nếu bạn phát hiện mình đang phái `omh-triage` hàng tuần, thì vấn đề nằm ở upstream.)

**Một khung AI dám viết "đừng lạm dụng tôi" ngay trong tài liệu của chính nó, đó là sự trung thực hiếm có.**

---

## Năm: Lớp plugin — chèn vai trò và trạng thái nguyên tử

### 5.1 Chèn vai trò: tối ưu then chốt từ v1 đến v2

**v1 (bản dài dòng)**: nội tuyến toàn bộ văn bản mô tả vai trò vào trường `context` của `delegate_task`.

**v2 (bản tinh gọn)**: chỉ đặt một thẻ `[omh-role:NAME]` trong chuỗi goal, do hook tự động chèn.

```python
delegate_task(
    goal="[omh-role:executor] Implement the following task:\n\n<task>...",
    context="<chỉ để ngữ cảnh dự án>"
)
```

**Cơ chế** (`docs/plugin.md`):

> "The key architectural insight for role injection: `delegate_task` passes `goal` as `user_message` to the subagent's `run_conversation()`. The `pre_llm_call` hook receives this as `user_message` on `is_first_turn=True`, making it the natural injection point — **no new Hermes primitives required.**"
>
> (Hiểu biết kiến trúc then chốt của việc chèn vai trò: `delegate_task` truyền `goal` dưới dạng `user_message` cho `run_conversation()` của subagent. Hook `pre_llm_call` nhận được nó dưới dạng `user_message` khi `is_first_turn=True`, khiến nó trở thành điểm chèn tự nhiên — **không cần bất kỳ nguyên thủy Hermes mới nào.**)

Lợi ích trực tiếp mang lại:

> "**Parent context never loads role text — zero token overhead.**"
>
> (Ngữ cảnh của agent cha không bao giờ nạp văn bản vai trò — **chi phí token bằng không.**)

Đây là một đòn bẩy rất thông minh: **không sửa một dòng code nào của khung upstream, mà vẫn tìm được một kẽ hở chèn có sẵn.**

### 5.2 Danh mục vai trò (15 tệp vai trò)

| Vai trò | Trách nhiệm | Nơi dùng |
| --- | --- | --- |
| Planner (Người lập kế hoạch) | Phân rã nhiệm vụ, sắp xếp thứ tự, đánh dấu rủi ro | ralplan |
| Architect (Kiến trúc sư) | Rà soát cấu trúc, độ rõ ràng ranh giới, khả năng bảo trì lâu dài | ralplan, thẩm định cuối ralph |
| Critic (Nhà phê bình) | Thách thức đối kháng, kiểm tra giả định, thử sức chịu áp lực | ralplan |
| Executor (Người thực thi) | Triển khai code, test trước, thay đổi tối thiểu | ralph |
| Verifier (Người xác minh) | Kiểm tra mức hoàn thành dựa trên bằng chứng, **chỉ đọc**, đạt/thất bại | ralph |
| Analyst (Chuyên viên phân tích) | Trích xuất yêu cầu, ràng buộc ẩn, tiêu chí nghiệm thu | deep-interview, autopilot |
| Security Reviewer (Người rà soát bảo mật) | Lỗ hổng, ranh giới tin cậy, vector chèn | giai đoạn xác minh autopilot |
| Test Engineer (Kỹ sư kiểm thử) | Chiến lược test, độ bao phủ, ca biên, chống rung | giai đoạn QA autopilot |
| Code Reviewer (Người rà soát code) | Rà soát diff, quy chuẩn, chất lượng tổng thể | giai đoạn xác minh autopilot |
| Debugger (Người gỡ lỗi) | Phân tích nguyên nhân gốc, kiểm tra giả định, sửa tối thiểu có mục tiêu | chẩn đoán lỗi ralph |
| Researcher (Nhà nghiên cứu) | Nghiên cứu từng chủ đề nhỏ, khối phát hiện có cấu trúc | deep-research |
| Research Synthesist (Người tổng hợp nghiên cứu) | Tổng hợp nhiều phát hiện | deep-research |
| Research Verifier (Người kiểm chứng nghiên cứu) | **Chỉ đọc** kiểm chứng tính hoàn chỉnh của trích dẫn | deep-research |
| Triage Maintainer / Skeptic | Hai vai trò phân loại | triage |

### 5.3 Ba hook

| Hook | Tác dụng |
| --- | --- |
| `pre_llm_call` | Phát hiện `[omh-role:NAME]` trong `user_message` của subagent, chèn lời nhắc vai trò vào system context; đồng thời chèn "nhận thức về chế độ" (giai đoạn/lần lặp hiện tại) |
| `pre_tool_call` | Kiểm tra thẻ vai trò trước khi subagent khởi động; gặp tên vai trò không quen **chỉ cảnh báo không chặn** (nhanh chóng phát hiện lỗi chính tả) |
| `on_session_end` | Khi thoát bất ngờ, ghi timestamp `_interrupted_at` vào tệp trạng thái của chế độ đang hoạt động |

### 5.4 Công cụ omh_state: engine trạng thái nguyên tử

**Mẫu ghi nguyên tử**:

```
ghi .tmp.{uuid} → fsync → os.replace
```

Đây là mẹo thay thế tệp nguyên tử chuẩn — `os.replace` trên POSIX là nguyên tử, nên tệp trạng thái **không bao giờ nằm ở trạng thái ghi dở**. Chương trình sập ở bất kỳ thời điểm nào, trên đĩa hoặc là bản cũ, hoặc là bản mới, không bao giờ là bản vỡ nát.

**Mỗi lần ghi đều kèm phong bì `_meta`**:

```python
{
  "_meta": {
    "written_at": "timestamp ISO8601",
    "mode": "...",
    "schema_version": 1,
    "written_by": "omh-plugin"
  },
  ...dữ liệu thực tế
}
```

**Khóa tư vấn (advisory lock)**:

- Tệp `.lock`, chứa JSON: `{pid, session_id, started_at, lock_key, holder_note?}`
- **Phát hiện khóa mốc meo**: dùng `os.kill(pid, 0)` kiểm tra tiến trình giữ khóa còn sống hay không
- Khi thử lại tự động giải phóng khóa mốc meo

Điều này giải quyết một vấn đề thực tế: phiên AI sập, tệp khóa nằm lại trên đĩa, lần khởi động sau bị xác chết của chính mình khóa cứng. Dùng phát hiện PID còn sống là vượt qua được.

### 5.5 Công cụ omh_gather_evidence: mô hình an toàn của việc thu thập bằng chứng

Công cụ này phải thực thi lệnh shell (chạy test, chạy build), là nơi có bề mặt tấn công lớn nhất của toàn bộ hệ thống. Các lớp bảo vệ của nó:

| Lớp bảo vệ | Mô tả |
| --- | --- |
| **Từ chối ký tự đặc biệt của shell** | Lệnh xuất hiện `;` `&` `\|` `` ` `` `<` `>` đều bị từ chối — chống chèn |
| **Danh sách trắng tiền tố token** | `npm test` khớp `npm test --verbose`, nhưng **không** khớp `npm testing-malicious` |
| **`shell=False`** | subprocess không đi qua shell, triệt tiêu khai triển biến |
| **Giới hạn thư mục làm việc** | Khóa cứng vào thư mục gốc dự án, không thể vượt thoát qua tham số công cụ |
| **Timeout lệnh đơn** | Mặc định 120 giây, tối đa 300 giây |
| **Cắt ngắn đầu ra** | Mặc định 2000 ký tự, **giữ phần cuối** (thông báo lỗi thường ở cuối) |

Chú ý chi tiết "danh sách trắng tiền tố token" — nếu dùng `startswith("npm test")` thô sơ, `npm testing-malicious` sẽ bị cho qua. So sánh tiền tố token sau khi tách theo dấu cách mới là cách đúng. **Đây là code do một người thực sự hiểu bảo mật viết ra.**

### 5.6 omh-delegate: wrapper phái việc được gia cố

Trong `docs/omh-delegate.md` có một đoạn cực kỳ kiềm chế, cực kỳ trung thực:

> "omh_delegate mitigates an **intentional architectural property** of Hermes's `delegate_task`, not a bug. By design, `delegate_task` returns *only the subagent's final summary* to the parent [...] **There is no upstream fix to wait for: the contract is the feature.**"
>
> (omh_delegate giảm thiểu một **thuộc tính kiến trúc có chủ đích** của `delegate_task` trong Hermes, không phải bug. Theo thiết kế, `delegate_task` chỉ trả *tóm tắt cuối cùng của subagent* cho agent cha … **Không có bản vá upstream nào để chờ: cái hợp đồng này chính là tính năng.**)

**"Đừng báo design trade-off của người khác thành bug"** — đây là ranh giới giữa kỹ sư trưởng thành và kỹ sư hay than phiền.

**Giải pháp: lưu trữ thuần subagent (subagent-persists)**

Đưa cho subagent một đường dẫn đầu ra xác định, dùng "khối hợp đồng văn xuôi tàn nhẫn" gắn phía sau goal, bảo nó: **hành động cuối cùng của bạn phải là `write_file` vào đúng đường dẫn này.** Sau đó wrapper kiểm tra tệp có tồn tại hay không.

**Không có nhánh cứu hộ**:

> "There is **no rescue branch in v0**. If the subagent ignores the contract, the wrapper returns `ok=False` with the raw return preserved [...] — **loud failure, not silent rescue.** This is deliberate: it preserves the feedback signal that teaches us whether the contract prose works in practice."
>
> (Trong v0 **không có nhánh cứu hộ**. Nếu subagent phớt lờ hợp đồng, wrapper trả về `ok=False` đồng thời giữ nguyên phần trả về gốc … — **thất bại ầm ĩ, không phải cứu hộ lặng lẽ.** Đây là điều có chủ đích: nó bảo toàn tín hiệu phản hồi dạy chúng ta biết "văn bản hợp đồng trên thực tế có hiệu lực hay không".)

**Triết lý này đáng để mọi người học theo.** Chúng ta đã quá quen với việc viết logic chống đỡ: "nếu AI không trả về đúng định dạng, tôi sẽ dùng regex để cứu vớt". Kết quả là — bạn không bao giờ biết lời nhắc của mình tệ đến mức nào, vì logic chống đỡ đã nuốt mất tín hiệu tệ hại đó.

**Breadcrumb (vụn bánh mì) chỉ nối thêm, không sửa đổi**:

```
.omh/state/dispatched/{id}.dispatched.json   ← prepare() ghi
.omh/state/dispatched/{id}.completed.json    ← finalize() ghi (tệp độc lập)
```

> "Both breadcrumbs are **append-only**. The wrapper never mutates a breadcrumb after writing it; completion data lives in a sibling file. **This eliminates a class of read-modify-write race conditions.**"
>
> (Cả hai breadcrumb đều **chỉ nối thêm**. Wrapper không bao giờ sửa breadcrumb sau khi ghi; dữ liệu hoàn thành nằm trong một tệp anh em khác. **Điều này loại bỏ trọn một lớp tình huống cạnh tranh "đọc-sửa-ghi".**)

**Sự tính xa tương thích về sau (AC-1)**:

> "In v0 the `ok` field is a plain bool. v1.B may reintroduce a rescue branch and make `ok` tri-state (`True | False | "degraded"`). **Python truthiness will treat the string `"degraded"` as truthy**, so naïve callers writing `if result["ok"]:` would silently treat a degraded result as success. To stay correct across that future change, callers needing a hard pass/fail check should use `ok_strict`."

Tác giả **ngay từ v0 đã thấy trước rằng sự thay đổi ba trạng thái ở v1 sẽ âm thầm phá vỡ bên gọi**, nên giờ đã cung cấp `ok_strict`. Cái ý thức "để lại lối đi cho chính mình ba năm sau" này vừa khớp với nguyên tắc "kiến trúc quyết định hãy làm cho dài hạn" trong các nguyên tắc kỹ thuật của kho.

### 5.7 Thư mục `.omh/`: chia sẻ có chọn lọc

| Thư mục con | Vào git? | Vòng đời | Nội dung |
| --- | --- | --- | --- |
| `state/` | **Không** | Một phiên | JSON trạng thái chế độ đang hoạt động + tệp `.lock` |
| `logs/` | **Không** | Một phiên | Nhật ký sự kiện chỉ nối thêm — chỉ ghi quyết định/chuyển trạng thái, không ghi nội dung |
| `progress/` | **Không** | Một phiên | Nhật ký tiến độ thực thi ralph |
| `specs/` | **Có** | Bền vững | Các đặc tả phỏng vấn đã xác nhận |
| `plans/` | **Có** | Bền vững | Các phương án đồng thuận (dạng ADR) |
| `research/` | **Có** | Bền vững | Báo cáo nghiên cứu do deep-research tạo ra |

Triết lý đằng sau sự phân chia này, tài liệu viết rất đúng chỗ:

> "A spec or a consensus plan is a **decision artifact** — the canonical record of 'what we agreed to build.' It belongs in the repo for the same reason an ADR belongs in the repo. Treating these as user-private throws that away. State and logs are **per-session runtime.**"
>
> (Đặc tả và phương án đồng thuận là **tạo phẩm quyết định** — bản ghi chuẩn mực của "những gì chúng ta đã thống nhất sẽ xây". Chúng thuộc về kho vì cùng lý do ADR thuộc về kho. Coi chúng là thứ riêng tư của người dùng chính là vứt bỏ giá trị đó. Trạng thái và nhật ký là **runtime của từng phiên.**)

> "State and logs [...] reflect what one developer was doing at one moment, and they're cleared on completion. **Sharing them adds noise without value.**"
>
> (Trạng thái và nhật ký … phản ánh một nhà phát triển đang làm gì tại một thời điểm, và chúng bị xóa khi hoàn thành. **Chia sẻ chúng chỉ thêm nhiễu, không có giá trị.**)

**Ranh giới này vạch cực chuẩn**: trong những thứ AI tạo ra, "kết luận" xứng đáng vào kho phiên bản, "quá trình" thì không. Nhiều đội nhóm commit ào ạt toàn bộ nhật ký phiên AI, cuối cùng không ai đọc, chỉ làm kho phình to ra.

---

## Sáu: Triết lý thiết kế (mười bốn điều)

Mỗi điều dưới đây đều có nguồn gốc rõ ràng trong kho, không phải diễn giải của tôi.

### 6.1 Kỹ năng dùng độc lập, plugin chỉ tăng cường không chặn đường

> "Skills work standalone with zero dependencies."（README）
>
> "Keep skills standalone-capable; plugin features should enhance, not gate."（CONTRIBUTING）
>
> (Giữ cho kỹ năng có khả năng hoạt động độc lập; tính năng plugin phải là **tăng cường**, không phải **chặn đường**.)

Nghĩa là: bạn không cài plugin, kỹ năng vẫn dùng được, chỉ dài dòng hơn một chút (văn bản vai trò phải nội tuyến). Cài plugin, trải nghiệm tốt hơn. **Không có kiểu "bắt buộc cài plugin mới bắt đầu được" như bắt cóc.**

(Ngoại lệ duy nhất là `omh-ralph`, nó thực sự cần plugin — vì nó phụ thuộc vào trạng thái nguyên tử và khóa.)

### 6.2 Tranh luận đồng thuận tốt hơn xuất một lần

> "This catches blind spots that a single agent misses. The Critic's job is to break the plan — if it survives, it's stronger for it."

### 6.3 Bằng chứng cao hơn khẳng định

> "The iron law of ralph verification: evidence, not assertion."
>
> "No approval without fresh evidence. If you don't see test output, it didn't pass."

### 6.4 Quyền sở hữu tệp cứng nhắc

> "When dispatching parallel executors, only ONE task owns each shared file."
>
> "Stay in your file scope."

### 6.5 Người điều phối chạy bằng chứng, người xác minh không chạy

> "Critical: the verifier does NOT run evidence themselves. Gathering happens at the orchestrator level."

### 6.6 Ngắt mạch ba lần đánh bại đếm theo loại

> "Tagging by category prevents test-infra strikes from masking real bugs."

### 6.7 Người điều phối phải giữ "độ cao", không được xắn tay làm việc

> "The orchestrator role exists for one reason: **to stay above the work** so you can dispatch with one altitude and review with another."
>
> "The orchestrator's discipline: **skepticism, not deference.** Trust given to you (by the user installing you as orchestrator) is meant to be **USED**, not held in reserve."
>
> (Vai trò người điều phối tồn tại vì một lý do duy nhất: **ở trên công việc**, để bạn có thể phái việc ở một độ cao và rà soát ở một độ cao khác.)
> (Kỷ luật của người điều phối: **hoài nghi, không phải phục tùng.** Niềm tin được trao cho bạn (bởi người dùng đưa bạn lên làm người điều phối) là để bạn **DÙNG**, không phải để giữ làm của để dành.)

Câu cuối cùng cực hay — **sự thất trách phổ biến nhất của AI không phải làm sai, mà là khách sáo thái quá, không dám phán quyết.**

### 6.8 Hợp đồng độ cao: brief vs đánh giá sâu

> "The brief is the test of altitude: if you cannot reduce the deep review to a clean decisions-first brief, you do not have the altitude you think you have."

### 6.9 Câu hỏi META: nhà phê bình phải có khả năng chất vấn khung khổ

> "The single most load-bearing move: the Critic must be licensed to contest the framing itself."

### 6.10 Người dùng luôn nắm quyền thoát

> "The user always decides when they're done — scoring never auto-terminates."
>
> "Coarse bins are advisory heuristics for question targeting. The user always decides when they're done. **Never auto-terminate based on coverage scores.**"

### 6.11 Thất bại ầm ĩ, chứ không cứu hộ lặng lẽ

> "Loud failure, not silent rescue. This is deliberate: it preserves the feedback signal."

### 6.12 Gói ngữ cảnh là nơi chất lượng được sinh ra

> "**The context package is where quality is born.** Verify ground truth, surface adjacent mechanisms, verify external premises, settle filesystem layout, walk it with the user, kill phantom contests on reframe. **Most pitfalls in this skill are pre-dispatch failures.** Treat the package as the load-bearing artifact it is."
>
> (Gói ngữ cảnh là nơi chất lượng được sinh ra. Xác minh sự thật mặt đất, làm nổi những cơ chế liền kề, kiểm tra các tiền đề bên ngoài, chốt cách bố trí filesystem, đi qua nó cùng người dùng, giết những tranh chấp bóng ma khi đóng khung lại. **Phần lớn các cạm bẫy trong kỹ năng này là thất bại "trước khi phái việc".** Hãy coi gói ngữ cảnh là tạo phẩm chịu lực đúng như bản chất của nó.)

**Điều này có lẽ là thực dụng nhất.** Phần lớn mọi người nghĩ chất lượng đầu ra của AI phụ thuộc vào model mạnh hay yếu, thực ra phụ thuộc vào ngữ cảnh bạn nạp vào chính xác đến đâu. Trong 26 cạm bẫy, đại đa số là thất bại trước khi phái việc — **vấn đề nằm ở chỗ trước khi bạn nhấn phím Enter.**

### 6.13 Tài liệu lập trường ≠ tài liệu yêu cầu

> "A 'design stance' and a 'requirements document' are different artifacts."
>
> "Requirements need: **needs not features; every item has inline citations; prefer missing to fabricating; forbid feature-by-analogy.**"
>
> (Tài liệu yêu cầu cần: **nói nhu cầu thay vì nói tính năng; mỗi mục phải có trích dẫn nội tuyến; thà thiếu còn hơn bịa; cấm "tính năng suy ra từ loại suy".**)

"forbid feature-by-analogy" (cấm tính năng theo loại suy) là một cụm từ hay — chỉ kiểu giả nhu cầu "sản phẩm khác có tính năng này, nên chúng ta cũng phải có".

### 6.14 Tự khởi động: dùng chính mình để tạo ra mình

> "OMH was built using its own tools. The first skill implemented was `omh-ralplan` (consensus planning), which was then used to design the remaining skills through multi-agent debate."
>
> "Each consensus process produced a plan that was then reviewed against the actual OMC source code and LobeHub marketplace implementations."

**Tự khởi động là bằng chứng đáng tin cậy mạnh nhất.** Một khung điều phối đa tác tử, nếu chính tác giả của nó cũng không dùng nó để thiết kế, thì đó chỉ là đồ chơi.

---

## Bảy: Hướng dẫn chi tiết — bắt đầu từ con số không

> Hướng dẫn dưới đây giả định bạn đã cài đặt [Hermes Agent](https://github.com/NousResearch/hermes-agent) v0.7.0 trở lên.

### 7.1 Bước một: Cài đặt

**Cách A: qua skills tap (khuyến nghị)**

```bash
# 1. Thêm nguồn kỹ năng
hermes skills tap add witt3rd/oh-my-hermes

# 2. Cài các kỹ năng bạn cần
hermes skills install \
  omh-deep-research \
  omh-ralplan \
  omh-ralplan-driver \
  omh-deep-interview \
  omh-ralph \
  omh-ralph-driver \
  omh-ralph-task \
  omh-autopilot
```

**Cách B: sao chép thủ công**

Sao chép thư mục `skills/<name>/` vào `~/.hermes/skills/omh/` là được.

**Cài plugin tùy chọn** (rất khuyến nghị, `omh-ralph` bắt buộc):

```bash
# Yêu cầu Python 3.10+ và pyyaml
pip install pyyaml

# Cài plugins/omh/ vào ~/.hermes/plugins/omh/
cp -r plugins/omh ~/.hermes/plugins/omh
```

### 7.2 Bước hai: Khởi tạo thư mục `.omh/`

OMH sẽ tự động gieo thư mục `.omh/` trong dự án khi dùng lần đầu (cần cài plugin). Muốn dựng sẵn khung xương từ trước:

```
omh_state(action="init")
```

Cấu trúc được tạo ra:

```
.omh/
├── .gitignore        ← cấu hình sẵn "chia sẻ có chọn lọc"
├── README.md         ← giải thích quy ước này
├── state/            ← không vào git
├── logs/             ← không vào git
├── progress/         ← không vào git
├── specs/            ← vào git (tạo phẩm quyết định)
├── plans/            ← vào git (tạo phẩm quyết định)
└── research/         ← vào git (tạo phẩm quyết định)
```

`.gitignore` được tạo ra trông như thế này:

```gitignore
# Runtime dễ bay hơi — không dùng để chia sẻ
state/
logs/
progress/

# Tạo phẩm quyết định bền vững — đưa vào theo dõi git
# specs/      đặc tả phỏng vấn đã xác nhận
# plans/      phương án đồng thuận (dạng ADR)
# research/   báo cáo nghiên cứu
```

### 7.3 Bước ba: Yêu cầu còn mơ hồ? Hãy phỏng vấn trước

```
Nạp kỹ năng omh-deep-interview, bắt đầu phỏng vấn thu thập yêu cầu: tôi muốn làm một XXX
```

Nó sẽ:

1. **Mở đầu hỏi hai câu**: mô tả dự án + đây là dự án mới tinh (greenfield) hay dự án có sẵn (brownfield)?
2. **Vào vòng lặp phỏng vấn** (≤5 vòng, có thể kéo dài đến 10 vòng): mỗi vòng hỏi một câu nhắm vào **chiều kích yếu nhất**.
3. **Sinh đặc tả**: tổng hợp thành `.omh/specs/{name}-spec.md`
4. **Chờ bạn xác nhận**: xác nhận / yêu cầu sửa / từ bỏ

**Điểm mấu chốt**: nó **không bao giờ tự quyết định "tôi hỏi đủ rồi"**. Chấm điểm thô (HIGH/MEDIUM/LOW/CLEAR) chỉ dùng để quyết định "câu tiếp theo hỏi chiều kích nào", không dùng để quyết định khi nào kết thúc.

**Sản phẩm**: `.omh/specs/{name}-spec.md`, kèm `status: confirmed`. Chỉ đặc tả ở trạng thái này mới có hiệu lực với hạ nguồn.

### 7.4 Bước bốn: Chạy một lần lập kế hoạch đồng thuận

```
Nạp kỹ năng omh-ralplan và omh-ralplan-driver,
dựa trên .omh/specs/my-feature-spec.md làm một lần lập kế hoạch đồng thuận
```

**Nếu bạn tự làm tổng chỉ huy, nhớ nạp luôn kỹ năng driver.**

**Phase 0: Soạn gói ngữ cảnh** — đây là bước quan trọng nhất. Theo yêu cầu của P10, **đi qua với người dùng trước rồi mới phái việc**:

```markdown
## Gói ngữ cảnh

### Chúng ta đang giải quyết điều gì
(chắt lọc yêu cầu cốt lõi trong đặc tả)

### Code hiện có liên quan
(liệt kê đường dẫn tệp then chốt + một câu mô tả)

### Ràng buộc đã biết
(ngăn xếp công nghệ, yêu cầu hiệu năng, phần không được động)

### Những điểm cần chất vấn trong khung khổ hiện tại
1. ...
2. ...

### Câu hỏi META (bắt buộc phải có!)
Bản thân khung khổ trên có đúng không? Chúng ta có đang giải quyết đúng bài toán không?
Có cách phân rã nào khác về căn bản không?
```

**Câu hỏi META cuối cùng không được bỏ.** Không có nó, nhà phê bình chỉ bắt được chi tiết.

**Phase 1: Chạy các vòng**

- Vòng 1 tuần tự: Planner → Architect → Critic
- Từ vòng 2 song song: Planner sửa xong bản nháp, Architect và Critic đồng thời rà soát lại

**Phase 2: Chưng cất thành hai sản phẩm**

- `brief.md` — cho người dùng xem, 1–2 trang, ưu tiên quyết định
- `<orchestrator>-review-deep.md` — để lưu trữ, mặc định không đọc

**Sản phẩm**: `.omh/plans/ralplan-{slug}.md`

### 7.5 Bước năm: Thực thi

```
Nạp kỹ năng omh-ralph và omh-ralph-driver,
bắt đầu thực thi theo .omh/plans/ralplan-my-feature.md
```

**Cổng lập kế hoạch sẽ chặn bạn một phen**: không có danh sách nhiệm vụ được đánh số kèm **tiêu chí nghiệm thu kiểm thử được**, ralph từ chối thực thi. Đây là điều có chủ đích — ngăn kiểu "làm trước đã rồi tính".

Một kế hoạch ralph-shaped đạt chuẩn trông như thế này:

```markdown
## Danh sách nhiệm vụ

### Task 1: Thêm mô hình người dùng
- **Tệp sở hữu**: `src/models/user.py`, `tests/test_user.py`
- **Cấm sửa**: `src/models/__init__.py` (Task 3 sở hữu)
- **Phụ thuộc**: không
- **Tiêu chí nghiệm thu**:
  - [ ] Lớp `User` có các trường `id` / `email` / `created_at`
  - [ ] `pytest tests/test_user.py` toàn xanh
  - [ ] Trường email có kiểm tra định dạng, đầu vào không hợp lệ ném `ValidationError`

### Task 2: Thêm kho lưu trữ người dùng
- **Tệp sở hữu**: `src/repos/user_repo.py`, `tests/test_user_repo.py`
- **Phụ thuộc**: Task 1
- **Tiêu chí nghiệm thu**:
  - [ ] Ba phương thức `save()` / `find_by_id()` / `find_by_email()`
  - [ ] `pytest tests/test_user_repo.py` toàn xanh
```

**Mỗi lần gọi chỉ chạy một nhiệm vụ (hoặc một lô 2–3 nhiệm vụ song song an toàn), rồi thoát.** Bạn cần gọi lặp lại, cho đến khi trạng thái trở thành `complete`.

**Bốn việc người điều phối phải làm giữa các lần lặp**:

1. **Chọn đúng lô** — 2–4 nhiệm vụ độc lập, các tệp chạm vào không trùng nhau
2. **Viết đủ ngữ cảnh cho người thực thi** — chỉ dẫn TDD, danh sách "cấm sửa", metadata commit, kinh nghiệm từ các nhiệm vụ trước
3. **Tự chạy bằng chứng trước khi phái người xác minh** — `omh_gather_evidence`
4. **Phái người xác minh song song**

**Muốn dừng giữa chừng**:

```
omh_state(action="cancel", mode="ralph", instance_id="{instance_id}", reason="user request")
```

TTL 30 giây, kết thúc sạch sẽ.

### 7.6 Bước sáu (tùy chọn): Đường ống hoàn toàn tự động

```
Nạp kỹ năng omh-autopilot, hoàn thành từ đầu đến cuối: tôi muốn làm một XXX
```

Nó sẽ tự động nối 6 giai đoạn. **Mỗi lần gọi tiến một bước giai đoạn**, nên bạn vẫn phải gọi lặp lại, nhưng mỗi lần ngữ cảnh đều mới tinh, không bị vỡ.

Nó còn **thông minh bỏ qua các giai đoạn đã hoàn thành**: hôm qua bạn đã phỏng vấn xong, hôm nay nó sẽ bắt đầu thẳng từ lập kế hoạch.

### 7.7 Bước bảy: Gặp lĩnh vực xa lạ, nghiên cứu trước

```
Nạp kỹ năng omh-deep-research, nghiên cứu: hiện trạng và thực hành tốt nhất của công nghệ XXX
```

Quy trình năm giai đoạn, **mỗi lần gọi chỉ tiến một lô** (tối đa 3 researcher song song).

**Sản phẩm**: `.omh/research/{slug}-report.md`, kèm `status: confirmed`.

**Dự kiến chi phí**: đường thuận 5–8 lần gọi subagent; trường hợp xấu nhất 14–16 lần.

### 7.8 Ví dụ đường ống hoàn chỉnh

```bash
# Tình huống: làm tính năng mới cho một lĩnh vực xa lạ

# 1. Trước tiên hiểu lĩnh vực (gọi nhiều lần cho đến khi status: confirmed)
> Nạp omh-deep-research, nghiên cứu kiến trúc SFU của WebRTC

# 2. Hỏi rõ yêu cầu (tương tác, bạn phải trả lời câu hỏi)
> Nạp omh-deep-interview, dựa trên báo cáo nghiên cứu trên, phỏng vấn yêu cầu của tôi

# 3. Tranh luận ra phương án (tối đa 3 vòng)
> Nạp omh-ralplan + omh-ralplan-driver, dựa trên đặc tả làm lập kế hoạch đồng thuận

# 4. Làm (gọi lặp lại cho đến khi complete)
> Nạp omh-ralph + omh-ralph-driver, thực thi theo phương án
> Tiếp tục
> Tiếp tục
> ...

# 5. Kiểm tra sản phẩm
$ ls .omh/plans/     # phương án đồng thuận (vào git)
$ ls .omh/specs/     # đặc tả yêu cầu (vào git)
$ ls .omh/research/  # báo cáo nghiên cứu (vào git)
$ git log --oneline  # mỗi nhiệm vụ một commit
```

### 7.9 Các lỗi thường gặp và cách xử lý

| Triệu chứng | Nguyên nhân | Cách giải |
| --- | --- | --- |
| ralph từ chối thực thi | Kế hoạch không có nhiệm vụ được đánh số kèm tiêu chí nghiệm thu | Bổ sung danh sách nhiệm vụ, mỗi mục phải có tiêu chí nghiệm thu kiểm thử được |
| Nhiệm vụ song song sửa cùng một tệp gây xung đột | Khi phái việc không ghi danh sách "cấm sửa" | Mỗi tệp dùng chung chỉ do một nhiệm vụ sở hữu (P3) |
| Người xác minh lúc nào cũng đạt, nhưng code thực ra hỏng | Bạn không chạy bằng chứng trước khi phái người xác minh | Chạy `omh_gather_evidence` trước, nhét kết quả cho người xác minh (P6) |
| Nhà phê bình chỉ bắt lỗi vặt | Gói ngữ cảnh không có câu hỏi META | Thêm tường minh quyền "khung khổ bản thân có đúng không" (P4) |
| Bị khóa cứng sau khi phiên sập | Tệp `.lock` mốc meo | Plugin dùng `os.kill(pid, 0)` phát hiện và tự động giải phóng |
| Vỡ cửa sổ ngữ cảnh | Cố chạy hết tất cả nhiệm vụ trong một phiên | Đây chính là điều "mỗi lần gọi một nhiệm vụ" giải quyết — để nó thoát, rồi gọi lại |
| Người thực thi đang sửa một test hỏng không phải do mình gây ra | Nhiễu từ nhiệm vụ anh em | Dùng phương pháp xác minh `git stash` đối chiếu HEAD để xác định trách nhiệm |

---

## Tám: Quan điểm và kết luận tổng kết

### Quan điểm 1: Giá trị của đa tác tử không nằm ở "nhiều sức mạnh tính toán hơn", mà ở "sự phản đối có cấu trúc"

Nhiều người nghĩ đa tác tử chỉ là "chạy ba lần lấy kết quả tốt nhất". Cách làm của OMH hoàn toàn khác: **mục tiêu nhiệm vụ của ba vai trò là xung đột lẫn nhau.**

- Mục tiêu của Planner là **tạo ra phương án**
- Mục tiêu của Critic là **phá hủy phương án**
- Mục tiêu của Architect là **đánh giá cấu trúc**

**Tính đối kháng nội tại** này chính là nguồn giá trị. Nếu ba vai trò đều là "giúp tôi nghĩ xem còn vấn đề gì nữa", thì nó thoái hóa thành ba lần lấy mẫu đồng chất, ngoài đốt tiền ra chẳng có tác dụng gì.

**Kết luận**: khi thiết kế hệ thống đa tác tử, hãy tự hỏi một câu — "mục tiêu của các vai trò này có thực sự xung đột không?" Nếu không xung đột, bạn chỉ đang lãng phí token.

### Quan điểm 2: Insight lớn nhất là "nhà phê bình phải được cấp quyền chất vấn chính đề bài"

Cạm bẫy P4 là điều có mật độ thông tin cao nhất trong toàn bộ kho:

> "Without licensing, the Critic catches details. With licensing, the Critic catches the frame."

Quy tắc này phơi bày một hiện tượng phổ biến hơn: **AI mặc định suy nghĩ trong khung khổ bạn đưa ra.** Bạn hỏi "làm sao tối ưu vòng lặp for này", nó sẽ không bao giờ nói "vòng lặp này căn bản không nên tồn tại". Bạn phải cho nó tường minh quyền "bạn có thể lật đổ tiền đề của tôi".

Và bằng chứng cũng nằm ngay trong kho: kiến trúc thực thi cốt lõi nhất của OMH (mỗi lần gọi một nhiệm vụ) **chính là do nhà phê bình sau khi được cấp quyền "phá" ra**.

**Kết luận**: trong bất kỳ lần tư vấn AI quan trọng nào, hãy thêm tường minh một câu — "bạn cũng có thể chất vấn rằng bản thân câu hỏi này của tôi có đặt đúng không". Lợi ích kỳ vọng của một câu này có thể còn lớn hơn việc đổi sang một model đắt tiền hơn.

### Quan điểm 3: "Bằng chứng cao hơn khẳng định" nên trở thành thiết lập mặc định của mọi kỹ thuật AI

Độ tin cậy khi AI nói "đã hoàn thành" gần bằng không. Không phải vì nó xấu, mà vì cơ chế sinh của nó chính là "bổ sung hoàn thiện một câu nghe có vẻ đúng".

Ba lớp phòng thủ của OMH đáng để học theo:

1. **Người xác minh chỉ đọc** — anh ta không thể sửa code, nên sẽ không "tiện tay sửa một cái rồi nói đạt"
2. **Người điều phối chạy bằng chứng** — nguồn bằng chứng không phải bên bị kiểm tra, cắt đứt khả năng làm giả từ gốc
3. **Phán quyết nhị phân không chiết khấu** — năm tiêu chí qua bốn vẫn phán FAIL

**Kết luận**: trong bất kỳ quy trình tự động hóa AI nào, câu trả lời cho "ai chạy test" không thể là "bên được nghiệm thu". Đây là nguyên tắc cổ xưa nhất trong khoa học kiểm toán, và nó vẫn đúng trong thời đại AI.

### Quan điểm 4: "Thất bại ầm ĩ" có giá trị dài hạn hơn "cứu hộ lặng lẽ"

> "Loud failure, not silent rescue. This is deliberate: it preserves the feedback signal."

Triết lý này phản trực giác nhưng cực kỳ đúng. Bản năng chúng ta muốn chống đỡ cho đầu ra AI: định dạng sai thì regex cứu vớt, trả về thiếu trường thì điền giá trị mặc định. Kết quả là — **lời nhắc của bạn không bao giờ được cải thiện, vì nó tệ đến đâu đã bị logic chống đỡ nuốt mất.**

OMH chọn rõ ràng không làm nhánh cứu hộ ở v0, chính là để thu thập tín hiệu thật về "văn bản hợp đồng rốt cuộc có hiệu lực hay không".

**Kết luận**: trong giai đoạn hệ thống còn đang tiến hóa, **đừng vội thêm chống đỡ**. Chống đỡ chỉ nên thêm sau khi bạn đã hiểu rõ phân bố thất bại, nếu không nó chỉ là viên thuốc giảm đau, che giấu bệnh tình.

### Quan điểm 5: Tách "kỷ luật người thợ" khỏi "kịch bản ông chủ thầu" là một quyết định kiến trúc bị đánh giá thấp

OMH tách mỗi workflow thành hai kỹ năng:

- `omh-ralph` = kỷ luật của người thợ bên trong `delegate_task`
- `omh-ralph-driver` = kịch bản của ông chủ thầu **giữa** hai lần phái việc

Điều này giải quyết một nỗi đau thực tế: **thời điểm nạp và người tiêu thụ của hai loại tri thức này hoàn toàn khác nhau.** Người thợ không cần biết cách chia lô, ông chủ thầu không cần biết cách viết unit test. Trộn chung lại, hai bên đều phải đọc một đống nội dung không liên quan, đốt ngữ cảnh vô ích.

**Kết luận**: khi viết kỹ năng/lời nhắc AI, hãy tách theo "ai đọc vào lúc nào", thay vì tách theo "mức độ liên quan chủ đề".

### Quan điểm 6: 36 cạm bẫy được đánh số là tài sản quý giá nhất của dự án này

Hai driver cộng lại có 36 cạm bẫy (P1–P26 + P1–P10), mỗi cái đều được đạp ra từ vận hành thực tế. Những cái này không phải kiểu sáo rỗng "danh sách thực hành tốt nhất", mà cụ thể đến mức "nếu bạn không viết câu hỏi META, nhà phê bình sẽ dừng trong khung khổ" — một phán đoán nhân quả thực thi được.

Nhất là câu P26:

> "The brief is the test of altitude: if you cannot reduce the deep review to a clean decisions-first brief, you do not have the altitude you think you have."

**Câu này là tấm gương cho tất cả người dùng AI.** AI của bạn đưa cho bạn 3000 chữ, bạn đọc xong vẫn không biết phải làm gì — không phải AI không cố gắng, mà là "độ cao" có vấn đề.

**Kết luận**: phán đoán một khung AI có trưởng thành hay không, hãy xem nó có "danh sách cạm bẫy" hay không. Có nguyên lý mà không có cạm bẫy, tám phần là chưa từng chạy trong tình huống thực tế.

### Quan điểm 7: "Đừng báo design trade-off của người khác thành bug"

Câu "There is no upstream fix to wait for: the contract is the feature" trong `omh-delegate.md` thể hiện một sự kiềm chế hiếm thấy.

`delegate_task` của Hermes chỉ trả về tóm tắt cuối cùng — điều này khiến agent cha không lấy được quá trình trung gian. Rất dễ coi đó là bug để than phiền, rồi chờ upstream sửa. Phán đoán của OMH là: **đây là cái giá tất yếu của sự cách ly, là tính năng không phải khiếm khuyết.** Vì vậy nó thiết kế "lưu trữ thuần subagent" để vòng qua, thay vì chờ đợi.

**Kết luận**: đối mặt với giới hạn của khung bên thứ ba, trước tiên hãy hỏi "đây có phải điều có chủ đích không". Nếu phải, hãy thiết kế thích ứng ở phía mình, đừng đánh cược upstream sẽ thay đổi.

### Quan điểm 8: Minh bạch chi phí là một đạo đức nghề nghiệp

README viết rõ ràng: đường thuận 5–8 lần gọi, xấu nhất 14–16 lần.

**Đại đa số khung AI không dám viết con số này.** Vì viết ra là phải chịu trách nhiệm với nó, và trông cũng "không đủ thần kỳ". OMH viết, còn đưa ra giới hạn ba lần đánh bại làm ràng buộc cứng.

**Kết luận**: khi đánh giá bất kỳ công cụ AI nào, hãy tìm bao chi phí của nó trước. Tìm không ra, mặc định là nó không có cận trên.

### Quan điểm 9: Chia sẻ có chọn lọc của `.omh/` là phép lịch sự kiểm soát phiên bản mới của thời đại AI

> "A spec or a consensus plan is a decision artifact [...] State and logs are per-session runtime. Sharing them adds noise without value."

**Quyết định vào kho, quá trình không vào kho.** Ranh giới này vạch cực chuẩn. Phương án đồng thuận là ADR, xứng đáng lưu vĩnh viễn; JSON trạng thái của một phiên nào đó, ngoài việc làm bẩn `git log` ra chẳng có tác dụng gì.

**Kết luận**: hãy đặt cho dự án của bạn một "quy tắc nhập kho cho sản phẩm AI". Đặc tả, phương án, báo cáo nghiên cứu → vào; trạng thái, nhật ký, tiến độ → không vào.

### Quan điểm 10: Tự khởi động là bằng chứng đáng tin cậy mạnh nhất

> "OMH was built using its own tools. The first skill implemented was `omh-ralplan`, which was then used to design the remaining skills through multi-agent debate."

Trước tiên làm ra bộ lập kế hoạch đồng thuận, rồi dùng nó để thiết kế tất cả các kỹ năng còn lại. Và mỗi phương án do đồng thuận tạo ra đều được **đối chiếu rà soát với mã nguồn thật của OMC**, đảm bảo không phải tưởng tượng vu vơ.

**Kết luận**: xem một công cụ dành cho nhà phát triển có đáng tin không, hãy xem tác giả của nó có dùng nó không. Công cụ không được tự dùng, về bản chất chỉ là bản demo.

### Tổng kết: OMH thực sự đang truyền tải điều gì

Gạt bỏ mọi chi tiết kỹ thuật, Oh My Hermes đang truyền tải một quan niệm:

**AI không đáng tin không phải là vấn đề; vấn đề là bạn chưa thiết kế quy trình cho việc "AI không đáng tin".**

- AI có điểm mù → thì để một AI khác chuyên đi tìm điểm mù (nhà phê bình)
- AI thích tự nói tự nghe → thì đừng nghe nó nói, chỉ nhìn bằng chứng (người xác minh + người điều phối chạy test)
- AI rơi vào vòng lặp vô hạn → thì đếm dấu vân tay lỗi, ba lần thì ngắt mạch
- AI làm vỡ ngữ cảnh → thì mỗi lần chỉ làm một việc, trạng thái lưu trên đĩa
- AI suy nghĩ trong khung khổ → thì cấp quyền tường minh để nó lật đổ khung khổ (câu hỏi META)
- AI khách sáo thái quá → thì nói rõ với nó "niềm tin là để dùng, không phải để giữ"

**Mỗi một sự không đáng tin đều tương ứng với một kỷ luật kỹ thuật.** Đó là toàn bộ bí mật của OMH — nó không cố làm cho AI thông minh hơn, nó cố làm cho **một AI không thông minh đến vậy, dưới một bộ quy tắc tốt, tạo ra được kết quả đáng tin cậy.**

Đây cũng là lý do nó đáng để học: **những quy tắc này gần như không phụ thuộc vào việc bạn dùng model nào, khung nào.**

---

## Chín: Tài liệu tham khảo

- Kho dự án: `https://github.com/witt3rd/oh-my-hermes`
- Hermes Agent: `https://github.com/NousResearch/hermes-agent`
- Nguồn cảm hứng oh-my-claudecode: `https://github.com/Yeachan-Heo/oh-my-claudecode`
- Tài liệu khái niệm: `https://github.com/witt3rd/oh-my-hermes/blob/master/docs/concepts.md`
- Tài liệu plugin: `https://github.com/witt3rd/oh-my-hermes/blob/master/docs/plugin.md`
- Wrapper phái việc: `https://github.com/witt3rd/oh-my-hermes/blob/master/docs/omh-delegate.md`
- So sánh với OMC: `https://github.com/witt3rd/oh-my-hermes/blob/master/docs/omc-comparison.md`
- Giải thích ràng buộc Hermes: `https://github.com/witt3rd/oh-my-hermes/blob/master/docs/hermes-constraints.md`
- Phần chưa xây dựng: `https://github.com/witt3rd/oh-my-hermes/blob/master/docs/gaps.md`
- Lộ trình: `https://github.com/witt3rd/oh-my-hermes/blob/master/ROADMAP.md`
- Hướng dẫn đóng góp: `https://github.com/witt3rd/oh-my-hermes/blob/master/CONTRIBUTING.md`
- Thảo luận kỹ năng triage: `https://github.com/witt3rd/oh-my-hermes/issues/9`
