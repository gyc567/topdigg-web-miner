---
title: "CodexLoom — Từ Multi-Agent đến Agent Team: Đưa AI Agent từ công cụ thành một đội ngũ thực thụ"
description: "Giải mã sâu về Agent Team Best Practices của CodexLoom: tại sao nhiều agent không tự động trở thành một Agent Team, cách biến agent từ Task dùng một lần thành các chủ thể chịu trách nhiệm dài hạn, và cấu trúc 5 lớp Profile · Message · Topic · Overview · External để chuyển trách nhiệm từ trong đầu Human ra thành cấu trúc làm việc mà cả đội có thể dùng chung."
author: topdigg-web-miner
date: 2026-08-09
tags:
  - AI Agent
  - Agent Team
  - Multi-Agent
  - Codex
  - CodexLoom
  - Quản trị đội ngũ
  - AI Collaboration
categories:
  - Công cụ AI
  - Hiệu suất phát triển
---

# CodexLoom — Từ Multi-Agent đến Agent Team: Đưa AI Agent từ công cụ thành một đội ngũ thực thụ

> **Nói ngắn gọn**: CodexLoom là một cách làm việc và một sản phẩm dệt những Codex Thread độc lập thành một Agent Team — một đội ngũ "chịu trách nhiệm dài hạn, có thể cộng tác, do Human quản trị". Câu hỏi cốt lõi của nó: **khi nào nhiều agent thực sự trở thành một Team?** — không phải khi chúng bắt đầu chạy cùng lúc, mà là khi chúng bắt đầu gánh những trách nhiệm dài hạn khác nhau, tìm thấy nhau, cộng tác trực tiếp, hội tụ liên tục và cùng nhau làm công việc thật dưới sự quản trị của Human.

---

## 📌 Tổng quan dự án

| Mục | Nội dung |
|------|----------|
| **Tên sản phẩm** | CodexLoom |
| **Trang chủ** | [codexloom.ai](https://codexloom.ai) |
| **Tác giả** | yan5xu (Ngôn Ngọ) |
| **Vấn đề giải quyết** | Tổ chức nhiều AI coding agent thành một Agent Team có thể quản trị, cộng tác và tiến hóa liên tục |
| **Phương tiện cốt lõi** | Codex Thread (gắn một Thread vào một agent dài hạn) |
| **Hình thức bài viết** | Bài dài về Agent Team Best Practices (prologue + 7 chương) |
| **Nền tảng xuất bản** | WeChat Official Account |

Đây là một bài viết dài, đồng thời là **Agent Team Best Practices** — được đúc kết từ kinh nghiệm vận hành một Agent Team thực tế trong thời gian dài của tác giả, không phải suy luận lý thuyết mà là bài học từ những thất bại.

---

## 🎬 Mở đầu: Một lần "tình cờ" phát ngôn ra bên ngoài

Phần mở đầu bài viết rất kịch tính.

Tác giả vốn định đăng Landing Page của dự án CodexLoom — thứ anh đã dày công xây dựng hơn một tháng — trước, rồi từ từ trau chuốt. Không ngờ khi Agent phụ trách Web nhận lệnh publish, theo quan hệ cộng tác sẵn có, nó đã thông báo cho **Community Agent** — agent chuyên đối ngoại. Community Agent thấy "tin lớn", vội vàng gom tài liệu và đăng lên nhóm Feishu (飞书).

Khi tác giả phát hiện ra, **tin nhắn đã được gửi đi**.

Điều này nghe như "mất kiểm soát", nhưng tác giả lại thấy "họ" đã làm rất tốt. Vì trong toàn bộ quá trình:

- Tác giả không đứng giữa các agent để tự chọn xem chuyển tiếp cho ai
- Không phải tự tay vận chuyển context, truyền đạt kết quả
- Công việc tự chảy theo **trách nhiệm, quan hệ cộng tác và ranh giới phê duyệt** đã có sẵn

"Tình cờ" này chính là minh chứng cho giá trị của Agent Team: **khi trách nhiệm cộng tác chuyển từ Human sang Agent, công việc không còn cần Human tự kết nối từng bước nữa.**

---

## 🧠 Tư duy cốt lõi: Vì sao nhiều Agent ≠ Agent Team

Đây là nền móng của toàn bài.

Trước đây chúng ta quan tâm đến "làm sao một agent đơn lẻ mạnh hơn, hoàn thành những task dài và phức tạp hơn". Nhưng năng lực agent đơn lẻ có giới hạn, nhiều người bắt đầu dùng nhiều agent cùng lúc. **Khi agent tăng lên, nút thắt thực sự không phải là agent đơn lẻ làm được gì, mà là làm sao tổ chức chúng.**

Tác giả đưa ra một nhận định rất sắc bén:

> **Nhiều agent sẽ không tự động trở thành một Agent Team.**
>
> Nếu mọi công việc vẫn cần Human chọn điểm vào, tóm tắt bối cảnh, vận chuyển context, chuyển kết quả từ agent này sang agent kia, thì những agent đó về bản chất chỉ là một bộ công cụ độc lập. Human vẫn là Router duy nhất của cả hệ thống, và là nút thắt thực sự.

Tác giả dùng mô hình "sợi dây trách nhiệm liên tục" để mô tả con đường tiến hóa của agent:

1. **Task** — công việc một lần, ranh giới rõ ràng (đơn vị công việc)
2. **Long-running Agent** — cùng một loại trách nhiệm có chủ thể tồn tại lâu dài (vòng đời)
3. **Domain Agents** — sau khi scope phình to và năng lực suy giảm, các ranh giới chuyên môn phân hóa (phân công)
4. **Human Router** — sau khi xuất hiện nhiều agent, nút thắt cộng tác dồn về Human (nút thắt di chuyển)
5. **Agent Team** — trách nhiệm, quan hệ và cách bàn giao được ngoại hóa, trách nhiệm cộng tác chuyển sang Agent (tổ chức)

> **Nhận định cốt lõi**
>
> Công việc thật lặp đi lặp lại quay về tạo ra Long-running Agent; scope phình to và năng lực suy giảm tạo ra nhiều Domain Agents; sự phân hóa agent dồn nút thắt cộng tác về phía Human.

Sự phân hóa agent chỉ tạo ra nhiều agent. Chỉ khi những trách nhiệm, quan hệ, cách bàn giao từng giấu trong đầu Human được ngoại hóa dần, và một phần trách nhiệm cộng tác chuyển từ Human sang Agent, thì mới có thể thành một Team thực sự.

---

## 🏗️ Hướng dẫn chi tiết: Phương pháp 6 bước từ Multi-Agent đến Agent Team

Dưới đây tôi tổ chức lại theo kết cấu các chương của bài gốc thành một hướng dẫn 6 bước khả thi. Mỗi bước trả lời một câu hỏi quan trọng và giới thiệu cơ chế CodexLoom tương ứng.

### Bước 1: Từ Task Agent đến Long-running Agent

**Câu hỏi: Vì sao agent cần tồn tại lâu dài?**

Khi mới bắt đầu dùng agent, thứ bạn gặp là Task. Bạn tạo một Thread mới, nói cho agent biết cần hoàn thành gì, agent dựa vào context hiện tại gọi tool, thực thi task, đưa ra kết quả. Task xong thì công việc đó coi như xong.

Nhưng công việc thật không phải một chuỗi các Task độc lập nhau. **Task có thể hoàn thành, nhưng trách nhiệm đằng sau nó thì không kết thúc.**

- Bài viết viết xong, sau đó vẫn còn sửa
- Trang đã publish, sau đó vẫn còn vòng lặp
- Công ty hôm nay đã nghiên cứu, tháng sau lại xuất hiện với sản phẩm mới, vòng gọi vốn mới, dữ liệu mới

Mỗi lần quay lại không phải lặp lại đơn giản. Bối cảnh, phán đoán, sai lầm của lần trước vẫn hữu ích; những chỉnh sửa, sở thích, ranh giới Human đưa ra cũng nên tiếp tục ảnh hưởng đến công việc lần sau.

> **Task là một mảnh công việc; công việc thật là một sợi dây trách nhiệm chảy liên tục.**

Nếu mỗi lần tạo agent mới, bạn phải giải thích lại bối cảnh, truyền đạt lại sở thích, định nghĩa lại ranh giới, thậm chí **giẫm lại những sai lầm đã sửa**. Chi phí sâu của việc khởi động nguội lặp đi lặp lại không phải token, mà là **tái tạo lại quan hệ cộng tác mỗi lần**.

Vì vậy lựa chọn tự nhiên nhất là: giữ agent trong cùng một Thread, lần sau tiếp tục từ công việc lần trước. Công việc quá khứ, chỉnh sửa của con người, kinh nghiệm được lưu qua Summary, Memory, Skill... bắt đầu ảnh hưởng đến vòng lặp sau. Lúc này Task Agent trở thành **Long-running Agent**.

> Long-running không phải là kéo dài một cuộc trò chuyện, mà là cùng một loại trách nhiệm có chủ thể tồn tại lâu dài.

### Bước 2: Đưa "ai chịu trách nhiệm việc gì" ra khỏi đầu Human

**Câu hỏi: Sau khi agent phân hóa, vì sao nút thắt dồn về Human?**

Agent càng tiện, người càng giao nhiều việc. Ban đầu viết bài, rồi tìm tài liệu, kiểm tra sự thật, quản lý nội dung, rồi trang, SEO, phát ngôn đối ngoại... Context có độ phân giải cao, cách làm việc, phán đoán chuyên môn của các công việc khác nhau bắt đầu trộn lẫn, agent chậm lại, chất lượng giảm, cần sửa đi sửa lại.

**Domain không phải nhãn khu vực được vẽ sẵn, mà là ranh giới công việc dần hiện ra trong quá trình dùng liên tục, scope phình to và năng lực suy giảm.** Nó trả lời "công việc nào hợp để một agent đảm nhiệm lâu dài, công việc nào nên tách ra".

Sau khi phân hóa, áp lực context của từng agent giảm, nhưng vấn đề mới xuất hiện: **cộng tác vẫn đang diễn ra trong đầu Human**. Mỗi việc mới, con người phải phán đoán tìm agent nào; xong việc, con người phải đọc kết quả, phán đoán dùng được không, rồi chuyển cho agent tiếp theo.

> Agent có thể chạy song song, nhưng Human vẫn phải đọc từng cái, phán đoán, định tuyến. Agent càng nhiều, context và quan hệ cộng tác Human phải duy trì càng nhiều.

**Giải pháp: làm cho mọi agent trở thành chủ thể dài hạn ổn định, nhận diện được.**

Việc đầu tiên CodexLoom làm không phải để agent gửi tin nhắn cho nhau ngay, mà là cho mọi agent một **Profile**. Profile trả lời ba câu hỏi cực kỳ quan trọng với tổ chức:

- **Identity** — nó là ai
- **Domain** — nó chịu trách nhiệm dài hạn về điều gì
- **Scope** — nó dừng ở đâu, việc gì không phải việc của nó

Điểm quan trọng: Profile **không phải** viết một lần khi tạo agent. Trình tự đúng đắn hơn là:

> **Sai**: tạo agent → điền Profile → xong Domain Agent
>
> **Đúng**: công việc thật phơi bày ranh giới → Profile lưu giữ hiểu biết hiện tại → công việc sau tiếp tục kiểm chứng và chỉnh sửa

Profile không phải đáp án cuối cùng, mà là **giả thuyết tổ chức mà đội ngũ này đang áp dụng**.

Trên nền đó, CodexLoom dùng ba cấu trúc ghi lại quan hệ đội ngũ:

- **Organization** — ghi ranh giới trách nhiệm dài hạn parent/child (dưới một trách nhiệm lớn hơn, có trách nhiệm con ổn định phân hóa không)
- **Collaboration** — ghi giao diện cộng tác dài hạn có hướng (giữa hai Domain độc lập có ranh giới cộng tác lặp đi lặp lại)
- **Activity** — ghi lại các lần cộng tác Message thực sự xảy ra trong một khoảng thời gian (bằng chứng thực thi)

> **Phân biệt quan trọng**: Profile, Organization, Collaboration lưu **tuyên bố** (giả thuyết tổ chức), Activity ghi **bằng chứng thực thi**. Hai thứ không thể thay thế nhau, cũng không tự động kiểm chứng lẫn nhau. Viết Collaboration không chứng minh hai bên cộng tác tốt; gửi tin nhắn qua lại nhiều cũng không tự động thành Collaboration dài hạn.

**Tiêu chuẩn kiểm chứng (cột mốc đầu tiên)**:

> **Câu hỏi mấu chốt**
>
> Khi công việc cần cộng tác, agent hiện tại chỉ biết quay lại hỏi Human "nên hỏi ai", hay có thể dựa vào Scope của mình, quan hệ trực tiếp, và Profile chủ động tra cứu để phán đoán chủ thể chịu trách nhiệm tiềm năng tiếp theo?

### Bước 3: Agent cộng tác trực tiếp với nhau (Agent Message)

**Câu hỏi: Sau khi xác định được chủ thể chịu trách nhiệm tiềm năng thì sao?**

Nếu agent hiện tại chạm ranh giới vẫn phải báo về Human trước, thì Human chỉ đổi từ "phán đoán chuyển cho ai" thành "nối mọi công việc" — vẫn là đường truyền tay thủ công của cả hệ thống.

**Giải pháp: để agent xây quan hệ cộng tác trực tiếp. Bắt đầu từ Agent Message.**

Message có người gửi và người nhận rõ ràng, đồng thời cho biết cuộc giao tiếp này có mong đợi kết quả trả về từ đối phương hay không. Nó đi vào Thread dài hạn của chính người nhận, người nhận dùng Profile, quan hệ trực tiếp và context chuyên môn tích lũy của mình để hiểu và xử lý. **Thread đầy đủ, toàn bộ lịch sử và context riêng tư của người gửi sẽ không bị sao chép sang.**

Quá trình từng diễn ra trong đầu và tay Human:

```
Phát hiện công việc vượt ranh giới
  ↓ tìm agent phù hợp hơn
  ↓ giải thích vì sao chọn agent đó
  ↓ bàn giao context cần thiết
  ↓ chờ xử lý
  ↓ mang kết quả về
```

Giờ đây nó diễn ra trực tiếp giữa các agent.

**Ba ý định giao tiếp của Message:**

- **request** — yêu cầu đối phương phán đoán, hành động và trả kết quả (`--response required`)
- **notification** — đồng bộ thay đổi trạng thái đối phương cần biết (không cần trả lời) (`--response none`)
- **reply** — trả lời request, kết quả chảy ngược theo Message gốc, giữ quan hệ nhân quả thực sự

Ví dụ CLI:

```bash
# Request có ranh giới: yêu cầu đối phương phán đoán/hành động/trả kết quả
loom msg TARGET --from SELF --subject "Request có ranh giới" \
  --response required --body "vấn đề hiện tại, ranh giới, yêu cầu bằng chứng, nghĩa vụ trả về"

# Đồng bộ trạng thái: không cần trả lời
loom msg TARGET --from SELF --subject "Trạng thái hoặc sự thật" \
  --response none --body "thay đổi, ảnh hưởng, lối vào kiểm chứng"
```

**Best practice: giao tiếp agent không phải "nói hết một lần"**

Người gửi và người nhận mỗi bên có context dài hạn tích lũy riêng. Người nhận không phải một bộ máy thực thi trống chờ người gửi đổ prompt vào — có thể nó biết những sự thật người gửi không biết, có tool và phán đoán chuyên môn khác, thậm chí phát hiện tiền đề của vấn đề đã sai.

Nếu người gửi cố định nghĩa mọi thứ hoàn chỉnh trong Message đầu tiên, tức là ép người nhận phải "bạn biết gì, vì sao vấn đề xảy ra, nên đạt kết luận gì", rất dễ đưa điểm mù của chính mình vào cuộc cộng tác.

Nguyên tắc rút ra từ thực tế:

- Không giả định đối phương biết gì, cũng không ép nguyên nhân hay kết luận lên đối phương
- Message đầu tiên chỉ cần đủ để đối phương khởi động đúng, không cần phơi bày hết bối cảnh
- Vòng sau tiếp nối theo phản hồi thực tế của đối phương, không máy móc bám danh sách câu hỏi soạn sẵn
- Mỗi vòng nên mang lại thông tin hoặc quyết định mới; khi context đã đủ thì hội tụ nhanh

> **Best practice**
>
> Giao tiếp đa vòng tốt không phải băm nhỏ một thông điệp hoàn chỉnh, mà là biến phản hồi thực tế của vòng trước thành context mới của vòng sau.
>
> Đa vòng cũng không phải càng nhiều càng tốt: nếu ranh giới trách nhiệm, đầu vào, tiền đề phê duyệt và vòng phản hồi kết quả đều rõ ràng, một handoff tự chứa đủ thường hiệu quả hơn.

> **Ranh giới**
>
> Message được giao chỉ chứng tỏ turn của người nhận đã tiếp nhận đầu vào đó, **không** chứng tỏ người nhận đã hiểu, đồng ý hay phán đoán đúng. Trạng thái xử lý báo hoàn thành cũng chỉ nghĩa là lần thực thi đó kết thúc bình thường, **không** nghĩa là kết quả kinh doanh đã hoàn tất, cũng **không** nghĩa là đã có quyền với tool mới, production hay đối ngoại.

### Bước 4: Message lo giao tiếp, Topic lo hội tụ

**Câu hỏi: Với công việc trải qua nhiều agent và nhiều giai đoạn, làm sao giữ một phiên bản hiện tại duy nhất?**

Một công việc có thể do Content Agent sắp xếp đề tài, Research Agent kiểm chứng sự thật, Product Agent xác nhận triển khai sản phẩm. Giữa chừng còn chờ tài liệu mới, chờ Human chọn lựa, chờ sự thật bên ngoài thay đổi. Mỗi agent hoàn thành phần của mình, nhưng **không ai biết tổng thể đang đi đến đâu**.

Nếu những trạng thái này vẫn cần Human đọc từng Message, chui vào từng Thread khác nhau, tự lắp ráp bức tranh tiến độ hoàn chỉnh trong đầu, thì Human chỉ đổi từ "Router giao tiếp" thành "Router trạng thái dự án".

**Giải pháp: Topic — cấu trúc hội tụ duy nhất cho công việc xuyên agent.**

> **Nhận định cốt lõi**
>
> Không phải cho mọi agent share cùng một context, mà là để công việc xuyên agent có một phiên bản hiện tại rõ ràng và một agent duy nhất chịu trách nhiệm hội tụ cuối cùng.

Topic **không** kéo agent vào một group chat. Mỗi Topic có đúng một **Responsible**:

1. Human / Owner truyền định hướng, lựa chọn, chỉnh sửa cho Responsible
2. Responsible phái những câu hỏi có ranh giới cho các **Participant** khác nhau qua Message
3. Participant làm việc chuyên môn trong Thread của chính mình (không bước vào cửa sổ chat chung)
4. Kết quả từng phần quay về Responsible, Responsible cập nhật Topic

> Nếu group chat giống một phòng họp mọi người cùng nói, thì Topic giống **một hồ sơ hạng mục cộng tác có chủ trì rõ ràng**. Nó giữ phiên bản công việc đang áp dụng, nhưng không thay thế không gian làm việc chuyên môn của từng participant.

Topic lưu giữ liên tục:

- `current brief` do Responsible duy trì (sự thật, phán đoán, bước tiếp theo, ràng buộc đang áp dụng)
- Mỗi Participant chịu trách nhiệm về điều gì
- Công việc đang chờ ai, chờ điều gì
- Các mốc bằng chứng quan trọng và kết quả từng phần nằm ở đâu
- Topic đang được đánh dấu hội tụ hay chưa

**Responsible không phải "việc gì cũng tự làm"**. Trách nhiệm của nó không phải thay các agent khác đưa phán đoán chuyên môn, mà là giữ tính liên tục của tổng thể: phân rã vấn đề, chọn participant phù hợp, hấp thụ kết quả từng phần, phát hiện xung đột và chờ đợi, cập nhật phiên bản hiện tại, trả về kết quả cuối cùng.

> **Ranh giới cộng tác**
>
> **Hoàn thành cục bộ không có nghĩa là cộng tác đã hoàn thành.** Chỉ khi kết quả từng phần, bằng chứng, ràng buộc, bước tiếp theo quay về Responsible và được hợp nhất vào phiên bản hiện tại của công việc, thì lần bàn giao trách nhiệm đó mới thực sự khép lại.

**Artifact: cho kết quả chính thức một phiên bản ổn định**

Thành quả của công việc xuyên agent rất đa dạng: báo cáo nghiên cứu, ảnh chụp màn hình, code, bản thảo chương, evidence ledger... CodexLoom dùng **Artifact** để lưu snapshot của những file cần bàn giao — có ID ổn định, thông tin file, checksum; sau này file gốc có thay đổi, snapshot đã phát hành vẫn không đổi.

> `current brief` giải thích "chúng ta hiểu công việc này thế nào hiện tại", Artifact lưu "phán đoán này tương ứng với phiên bản file cụ thể nào".

**Needs You: gọi Human về đúng chỗ**

Khi agent thiếu sự thật, lựa chọn, review, phê duyệt của Human, nó không thể thay Human trả lời, cũng không nên ném lại một câu mơ hồ "giờ làm sao?". Nó phải giải thích rõ: đang tiến hành công việc nào, sự thật nào đã xác định, cụ thể thiếu phán đoán nào của con người, có những lựa chọn và ảnh hưởng nào, sau khi Human trả lời sẽ tiếp tục công việc từ đâu. CodexLoom gọi đường này là **Needs You**.

> Human không cần đứng giữa mọi agent để đẩy từng bước. Hầu hết công việc cứ chảy về phía trước. Chỉ khi thực sự cần sự thật, trade-off, review, phê duyệt của con người, Human mới được gọi về đúng vị trí công việc.
>
> Tạo Needs You không có nghĩa đã được phê duyệt. Phản hồi của Human cũng chỉ bao phủ phạm vi được nói rõ — nếu chỉ đồng ý "tiếp tục viết nháp", agent không được hiểu thành "có thể trực tiếp publish".

### Bước 5: Overview — khiến Agent Team đang thay đổi trở nên quản trị được

**Câu hỏi: Khi agent từ 2 thành 20, Human nhìn thế nào để biết cả đội đang vận hành ra sao?**

Sự chú ý của Human có hạn. Cố đọc toàn bộ quá trình của mọi agent sẽ nhanh chóng chết chìm trong thông tin. Điều này giống hệt quản lý đội ngũ con người: người quản lý không thể vận hành tổ chức bằng cách đọc bản ghi công việc đầy đủ của từng người. Đội càng lớn, càng phải quan sát thực thi từ tầng cao trước.

> **Câu hỏi quản trị thực sự**
>
> Human làm sao biết Agent Team hiện tại còn phù hợp với công việc đang diễn ra? Khi cấu trúc tuyên bố và thực thi thực tế bắt đầu lệch, tìm manh mối để điều tra và điều chỉnh ở đâu?

**Giải pháp: Overview — cửa vào quan sát thực thi và phân loại.**

Overview không phải một dashboard nhộn nhịp cho thấy "hôm nay bao nhiêu agent hoạt động", cũng không phải bảng xếp hạng thành tích agent. Nó nén các tín hiệu thực thi vốn nằm rải rác trong trạng thái agent, Codex Turn, Needs You, Inbox, Connection bên ngoài, hàng đợi, bản ghi token vào một cửa vào duy nhất. Gồm vài view cốt lõi:

- **Status** — agent nào đang chạy, thứ gì đang chờ Human, Inbox có tồn đọng không, Connection bên ngoài có để lại vấn đề không; Daily Activity xếp thực thi, turn, token lên trục thời gian
- **Capacity** — hiển thị thực thi turn, chờ việc mới (**New-work wait**: thời gian từ khi một việc mới có thể theo dõi vào hàng đợi đến khi thực sự được xử lý lần đầu), backlog hiện tại, nguồn công việc, bằng chứng hàng đợi
- **Token Usage** — phân bố input / cached input / output / reasoning output / model calls theo ngày, agent, model

**Góc nhìn quản trị tinh gọn: hiệu suất tài nguyên vs hiệu suất dòng chảy**

Hiệu suất tài nguyên quan tâm từng cục bộ có được dùng đủ không; hiệu suất dòng chảy quan tâm một công việc chảy suôn sẻ từ đầu đến cuối không. Agent Team cũng vậy:

> Một agent luôn full-load nhưng làm mọi downstream chờ đợi, không phải thứ hiệu suất đáng theo đuổi. Nó có thể chỉ đang biến sự bận rộn cục bộ thành nút thắt của cả đội.

**Nguyên tắc quan trọng nhất: Signal không phải Diagnosis.**

- Bận rộn không có nghĩa là tạo ra giá trị; thực thi thấp không có nghĩa vô dụng; token nhiều không có nghĩa kết quả tốt hơn; chờ đợi không tự động chứng minh thiếu agent
- Overview không tự hiểu tổ chức: không tự đọc Profile để phán đoán công việc đã vượt ranh giới chưa, cũng không tự đối chiếu Collaboration với Activity
- Activity thấp không phải giá trị thấp, activity cao không phải performance cao — nó chỉ báo "chỗ này có thể đáng điều tra"

Vòng quản trị hoàn chỉnh là:

> **Vòng quản trị**
>
> Phát hiện Signal → đào sâu Evidence → phán đoán nguyên nhân → chọn can thiệp → kiểm chứng ở công việc thật tiếp theo.

Can thiệp cuối cùng cũng không nhất thiết là tách hay thêm agent: vấn đề ở phương pháp thì đổi Skill và cách làm việc; thiếu tool thì thêm tool; routing sai thì chỉnh Collaboration; quyền bị chặn thì sửa approval gate. **Chỉ khi vấn đề lặp đi lặp lại lâu dài đến từ ranh giới Domain, mới nên cân nhắc tách, gộp, định nghĩa lại trách nhiệm.**

> **Vị trí mới của Human**
>
> Human không biến mất khỏi Agent Team, mà từ Router thủ công của mọi công việc, đi lên thành Owner quan sát, truy vấn, chẩn đoán, điều chỉnh cả đội.

### Bước 6: External — đưa Agent Team vào quan hệ bên ngoài thực tế

**Câu hỏi: Sau khi đội nội bộ trưởng thành, agent có thể trực tiếp phục vụ bên ngoài không?**

Tài nguyên thực sự khan hiếm của một cá nhân là thời gian và sự chú ý. Nếu mọi công việc đối ngoại cuối cùng đều phải quay về người — hiểu nhu cầu, tổ chức agent nội bộ, xác nhận kết quả, trực tiếp trả lời — thì dù Agent Team nội bộ mạnh đến đâu, thứ được cải thiện chủ yếu vẫn là hiệu suất cá nhân. **Chỉ khi năng lực Domain trưởng thành bước ra ngoài dưới một danh tính rõ ràng và ranh giới trách nhiệm, agent mới mang lại sự mở rộng năng lực chứ không phải tăng hiệu suất.**

**Nhưng agent ra ngoài, mô hình rủi ro thay đổi:**

- Bên trong có nhiều năm cộng tác ngầm; người ngoài không biết agent này từng được chỉnh sửa những gì, ranh giới kiến thức và quyền hạn ra sao
- Cùng một câu không chính xác, bên trong chỉ là sai sót công việc, bên ngoài có thể bị hiểu thành sự thật sản phẩm, lập trường tổ chức, lời hứa đã thành lập
- Đầu vào bên ngoài không mặc định đáng tin: có người cung cấp bối cảnh sai, có người dò xem agent nhìn thấy gì, có người dụ dỗ tiết lộ thông tin nội bộ, có người tìm cách vòng quy tắc, thậm chí có người tấn công

**Giải pháp: bên ngoài đối diện một cửa vào duy nhất được quản trị.**

CodexLoom không nối Provider Bot trực tiếp vào cả đội. Người dùng bên ngoài thông qua Address và Membership đã cấu hình, đi vào **agent dài hạn sở hữu Address đó** (Interface Agent là một hình thái tổ chức, không phải type cứng nhắc) — chứ không phải cửa vào trực tiếp tới Profile, Thread, tool, credential nội bộ.

Các khái niệm chính:

- **Connection** — thiết lập kết nối, năng lực, tình trạng lành mạnh của Provider app / bot / account / tenant
- **Agent Address** — ràng buộc danh tính bên ngoài với agent dài hạn, trả lời "agent nào xuất hiện ra ngoài bằng danh tính này"
- **Conversation Membership** — ghi lại vì sao agent này có mặt trong cuộc trò chuyện hiện tại, đóng vai trò gì, tuân theo guidance nào, ranh giới giao tiếp (inbound message nào là trigger, kết quả ánh xạ ra phản hồi ngoài thế nào, chỉ trả lời hay cho phép chủ động gửi, dùng nhãn `trust-domain` nào)

> Danh tính dài hạn của cùng một agent có thể ổn định, nhưng vai trò cục bộ và ranh giới hành vi trong từng quan hệ bên ngoài phải được **quản trị riêng**. Một Membership chỉ áp dụng cho Conversation tương ứng.

**Đường đi đầy đủ của một request bên ngoài:**

```
Provider event
  ↓ Connection / Address / Membership
  ↓ Inbox / Handling
  ↓ Interface Agent primary Thread
  ↓ tùy chọn cộng tác agent nội bộ
  ↓ Outbox
  ↓ provider result / receipt
```

- Interface Agent có thể tra cứu Profile nội bộ và quan hệ đã tuyên bố, qua Message hay Topic giao công việc có ranh giới cho chủ thể chịu trách nhiệm tiềm năng — nhưng External không tự động chọn đúng agent nội bộ
- Agent Domain nội bộ không thể vòng qua vai trò bên ngoài để có quyền trực tiếp gửi kết quả cho Provider
- **Outbox** lưu mục tiêu, nội dung, thông tin idempotency, lần thử gửi, trạng thái, kết quả trả về của Provider — khiến hành động bên ngoài có thể theo dõi
- **Provider receipt** chỉ chứng minh Provider lúc đó đã trả message identifier, không có nghĩa đối phương đã đọc, hiểu, chấp nhận, càng không phải hiệu quả kinh doanh đã xảy ra

**Human giữ ranh giới kết quả bên ngoài:**

> Biết câu trả lời, phác thảo cách diễn đạt, trả lời câu hỏi sẵn có, chủ động phát ngôn, hứa hẹn thay người khác, thực thi hành động có tác động thực tế — là những cấp độ quyền hoàn toàn khác nhau.

Khi agent phán đoán công việc thiếu sự thật, lựa chọn, review, phê duyệt, nó có thể tạm dừng công việc hiện tại bằng Needs You và hỏi Human câu hỏi rõ ràng. Human không còn vận chuyển mọi context, nhưng **ranh giới cuối cùng của kết quả bên ngoài vẫn do con người giữ**.

---

## 🔧 Giới thiệu sản phẩm CodexLoom: dệt nên thứ gì?

Quay lại lần "tình cờ" phát ngôn ra ngoài ở đầu bài. Điều thực sự có giá trị không phải "agent tự động gửi được tin nhắn" — **tự động hóa không phải Agent Team**. Nếu chạy theo một workflow viết sẵn từ agent đầu đến agent cuối đã là Team, thì chúng ta chỉ thay nút của chương trình bằng agent.

CodexLoom làm một việc: dệt những Thread mạnh mẽ mà Codex đã có thành một Agent Team.

- Biến một Thread thành **agent tồn tại lâu dài**, có Identity, Domain, Scope ổn định
- Để các agent khác nhau tra cứu Profile và quan hệ đã tuyên bố của nhau, qua **Message** cộng tác trực tiếp
- Giữ công việc xuyên agent trong phiên bản hiện tại do Responsible duy trì qua **Topic**
- Để Human quay lại đúng lúc thực sự cần sự thật, lựa chọn, review, phê duyệt (**Needs You**)
- Để Owner quan sát thực thi thực tế của đội qua **Overview**
- Cuối cùng, qua **External** được quản trị, đưa năng lực nội bộ đến khách hàng, cộng đồng, quan hệ hợp tác

**Bảng tra nhanh lệnh CLI:**

```bash
# View đội ngũ
loom team                  # view tổng thể đội ngũ hiện tại
loom team <agent>          # Profile đầy đủ, quan hệ lân cận, Activity của agent
loom team links <agent>    # quan hệ đã tuyên bố của agent
loom profile get <agent>   # đọc Identity · Domain · Scope

# Agent Message
loom msg TARGET --from SELF --subject "Request có ranh giới" --response required --body "..."
loom msg TARGET --from SELF --subject "Trạng thái hoặc sự thật" --response none --body "..."
```

**Các view WebUI:** trang Team cung cấp 4 view Directory · Organization · Collaboration · Activity; Overview cung cấp Status · Capacity · Token Usage; còn có trang Topic Current, Needs You, External (Inbox / Outbox).

---

## 🎨 Triết lý thiết kế

Những ranh giới tác giả nhấn đi nhấn lại trong bài tạo thành triết lý thiết kế của CodexLoom. Định nghĩa "không phải là gì" quan trọng hơn "là gì":

1. **Profile là giả thuyết tổ chức, không phải bằng chứng năng lực.** Nó giữ "ranh giới trách nhiệm đáng áp dụng lúc này", không phải chứng minh "agent này đã chứng minh năng lực". Tuyên bố là đường cơ sở để cộng tác, không phải bằng chứng năng lực, trí nhớ hay phê duyệt.

2. **Tuyên bố ≠ bằng chứng thực thi.** Organization / Collaboration là cấu trúc trách nhiệm đã tuyên bố; Activity là bằng chứng cộng tác thực sự xảy ra. Ghi riêng, không thay thế nhau, không tự động kiểm chứng lẫn nhau.

3. **Hoàn thành cục bộ ≠ hoàn thành cộng tác.** Chỉ khi kết quả từng phần quay về Responsible và được hợp nhất vào phiên bản hiện tại, lần bàn giao trách nhiệm mới thực sự khép lại.

4. **Trạng thái ≠ kết quả.** Message `delivered` không có nghĩa công việc đúng; Topic `resolved` không có nghĩa mọi kết quả thực tế đã xong; External receipt không có nghĩa đối phương đã đọc, chấp nhận, hay đạt hiệu quả kinh doanh.

5. **Signal không phải Diagnosis.** Vai trò của chỉ số là giúp Owner hiểu và cải thiện hệ thống, không phải xếp hạng agent. Activity thấp ≠ giá trị thấp; activity cao ≠ performance cao.

6. **Membership không phải hệ thống quyền.** Nó xử lý vai trò cục bộ và chính sách giao tiếp. `trust-domain` là nhãn để ghi chép và ràng buộc, không phải sandbox bảo mật.

7. **Không phán đoán thay agent.** CodexLoom không tự động tìm "người đúng" cho agent, không tự động kiểm chứng ranh giới đã được đáp ứng, không tự động nâng cấp những lần qua lại lặp đi lặp lại thành Collaboration. Hỏi ai, ranh giới có được đáp ứng không — vẫn là phán đoán của agent và Human.

8. **Can thiệp tối thiểu và có thể đảo ngược.** Quản trị không phải một lần Reorg, mà là vòng lặp cải thiện liên tục: để vấn đề phơi bày, điều tra nguyên nhân, thử điều chỉnh nhỏ nhất có thể đảo ngược, kiểm chứng kết quả ở công việc thật tiếp theo. Chỉ những thay đổi thực sự đứng vững mới lắng đọng vào Profile, Organization, Collaboration, Skill.

9. **Agent ổn định, Team động.** Agent phải đủ ổn định để tích lũy kinh nghiệm trong Domain; Team phải đủ động để thích ứng với thay đổi của model, tool, công việc, môi trường bên ngoài. Ổn định là chủ thể trách nhiệm dài hạn; động là giả thuyết tổ chức hiện tại.

10. **Tự động hóa ≠ Agent Team.** Team thực sự là một tập hợp các chủ thể trách nhiệm tồn tại lâu dài: mỗi chủ thể tích lũy kinh nghiệm trong Domain của mình, biết mình chịu trách nhiệm gì và dừng ở đâu, khi cần cộng tác thì tìm thấy nhau, giao tiếp trực tiếp, hội tụ liên tục. Human giữ định hướng và ranh giới quan trọng, cùng công việc thật tiến hóa không ngừng.

---

## 💡 Tóm tắt: các góc nhìn và kết luận chính

1. **Nhiều agent không tự động thành Agent Team.** Nếu mọi điểm vào, context, kết quả, bước tiếp theo vẫn dồn về Human, thì đó chỉ là "một bộ công cụ cần người sắp xếp".

2. **Sự di chuyển của nút thắt là động lực tiến hóa.** Quá tải agent đơn lẻ thúc đẩy phân hóa Domain; quá tải Human Routing thúc đẩy nhiều agent tiến hóa thành Agent Team.

3. **Ngoại hóa trách nhiệm là cột mốc.** Cột mốc đầu tiên từ Multiple Agents đến Agent Team: khi cần cộng tác, agent chỉ biết hỏi Human, hay có thể dựa vào Scope của mình, quan hệ trực tiếp, Profile tra cứu để phán đoán chủ thể chịu trách nhiệm tiềm năng tiếp theo?

4. **Trách nhiệm cộng tác chuyển giao và phân tầng.** Công việc từng do Human Router gánh được phân rã: người gửi phán đoán vì sao cần cộng tác và chuyển context; người nhận dùng context chuyên môn của mình hiệu chỉnh vấn đề; agent chịu trách nhiệm hội tụ hợp nhất kết quả từng phần; Human giữ định hướng, lựa chọn quan trọng, review, phê duyệt.

5. **Giá trị của giao tiếp đa vòng nằm ở hiệu chỉnh.** Giao tiếp đa vòng tốt là biến phản hồi thực tế của vòng trước thành context mới của vòng sau, không phải băm nhỏ một thông điệp hoàn chỉnh. Ranh giới rõ ràng thì handoff tự chứa đủ hiệu quả hơn.

6. **Topic là "nguồn sự thật duy nhất" của công việc xuyên agent.** Được chia sẻ là trạng thái hiện tại, không phải mọi context. Một Topic có đúng một Responsible; Participant tiếp tục làm việc trong Thread của mình.

7. **Vị trí mới của Human là Owner, không phải biến mất.** Human từ Router thủ công của mọi công việc đi lên thành Owner quan sát, truy vấn, chẩn đoán, điều chỉnh cả đội, dùng sự chú ý vào đúng chỗ thực sự cần con người.

8. **Ra ngoài là mở rộng năng lực, không phải tăng hiệu suất.** Khi năng lực Domain trưởng thành bước ra ngoài với danh tính rõ ràng và ranh giới hành vi kiểm chứng được, Agent Team từ hệ thống năng suất nội bộ trở thành năng lực tổ chức liên tục phục vụ bên ngoài.

9. **Câu trả lời cuối cùng:** khi nào nhiều agent thực sự thành Team? — không phải khi bắt đầu chạy cùng lúc, mà là khi bắt đầu gánh những trách nhiệm dài hạn khác nhau, tìm thấy nhau, cộng tác trực tiếp, hội tụ liên tục, và cùng làm công việc thật dưới sự quản trị của Human.

---

## 🗺️ Tình huống áp dụng và gợi ý đọc

**Bài viết gợi ý đọc theo chương:**

- Muốn hiểu "vì sao nhiều agent ≠ Agent Team" trước → đọc prologue, 01, 07
- Đang vận hành nhiều agent và kiệt sức vì Human Routing → đọc kỹ 02, 03, 04
- Quan tâm tải agent, nút thắt, điều chỉnh Scope, Team Governance → đọc thẳng 05
- Muốn đưa agent vào Slack, Feishu, khách hàng, cộng đồng... quan hệ bên ngoài thực tế → đọc thẳng 06
- Muốn hiểu đầy đủ logic sản phẩm CodexLoom → đọc từ đầu đến cuối

**Phù hợp với:**

- Developer đang vận hành từ 3 agent coding AI trở lên (Codex, Claude Code, Cursor...)
- Đội ngũ cảm thấy "agent nhiều hơn, người bận hơn"
- Nhà nghiên cứu và kiến trúc sư quan tâm Multi-Agent collaboration, agent governance, tổ chức đội ngũ AI

**Không phù hợp với:**

- Mới bắt đầu dùng agent, xử lý task một lần (đọc prologue, 01, 07 để dựng khung trước)
- Chỉ cần công việc sâu của một agent đơn lẻ (không cần cấu trúc cộng tác cấp đội)

---

## 📝 Kết luận

CodexLoom không phải công cụ để "mở nhiều agent cùng lúc", mà là cách dệt những Codex Thread độc lập thành một Agent Team **chịu trách nhiệm dài hạn, có thể cộng tác, do Human quản trị**.

Lộ trình của nó rõ ràng và tiết chế:

1. **Task → Long-running**: cho cùng một loại trách nhiệm một chủ thể tồn tại lâu dài
2. **Long-running → Domain Agents**: để ranh giới hiện ra từ ma sát thực tế, rồi phân hóa
3. **Domain Agents → Agent Team**: ngoại hóa trách nhiệm, quan hệ, cách bàn giao khỏi đầu Human

Cơ chế sản phẩm tương ứng tiến theo từng lớp: **Profile** (tôi là ai, chịu trách nhiệm gì, dừng ở đâu) → **Message** (agent giao tiếp trực tiếp) → **Topic** (hội tụ công việc xuyên agent) → **Overview** (đội ngũ có thể quản trị) → **External** (bước vào thế giới thực).

> **Câu hỏi cuối cùng**: khi nào nhiều agent thực sự trở thành một Team?
>
> **Câu trả lời cuối cùng**: không phải khi chúng bắt đầu chạy cùng lúc, mà là khi chúng bắt đầu gánh những trách nhiệm dài hạn khác nhau, tìm thấy nhau, cộng tác trực tiếp, hội tụ liên tục và cùng nhau làm công việc thật dưới sự quản trị của Human.

**Từ một Codex Thread, đến một Agent Team chịu trách nhiệm dài hạn, có thể cộng tác, có thể quản trị, có thể bước vào thế giới thực. Đó là CodexLoom.**

**Loom Your Codex.**

---

## 🔗 Liên kết liên quan

- **Trang chủ**: [https://codexloom.ai](https://codexloom.ai)
- **Nguồn bài gốc**: WeChat Official Account "言午" (yan5xu) —《Best Practices: Từ Multi-Agent đến Agent Team》
- **Bài liên quan**: Báo cáo phân tích Herdr của blog này (quản lý terminal workspace cho AI coding agent), bài đào sâu Claude Code engineering team
