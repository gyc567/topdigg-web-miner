---
title: "FDE Guide phân tích chuyên sâu: Kỹ thuật hóa giá trị trước khi có quyền tự chủ — Phương pháp luận giao hàng cấp sản xuất dành cho FDE và kỹ sư AI (Giới thiệu dự án + Vòng giao hàng 7 giai đoạn + Hướng dẫn kỹ thuật giá trị 12 yếu tố + Triết lý thiết kế)"
description: "Lấy davidahmann/fde-guide (dự án mã nguồn mở GitHub, Apache-2.0, tác giả David Ahmann) làm bản gốc, phân tích toàn diện phương pháp luận 'kỹ sư triển khai tiền phương (FDE) và giao hàng AI ứng dụng nội bộ'. Ý tưởng cốt lõi trong một câu: **Tokens là đầu vào, quyền tự chủ là một lựa chọn thiết kế, kết quả được chấp nhận (Accepted Outcome) mới là sản phẩm.** Dự án cung cấp ba độ sâu: ① The Guide (mô hình tư duy 20 phút: bốn trách nhiệm của FDE = khám phá/sản phẩm/kỹ thuật/vận hành; một vòng giao hàng 7 giai đoạn xuyên suốt = quan sát→hiến chương→chọn cơ chế→xây lát cắt có kiểm soát→chứng minh→lên sóng bàn giao→vận hành học hỏi hoặc ngừng vận hành); ② The Handbook (playbooks vòng đời + kỹ thuật giá trị AI 12 yếu tố: lấy 'chi phí mỗi kết quả được chấp nhận' và 'giá trị ròng đã hiện thực' làm sổ cái, 4 cổng cứng = kết quả có chủ sở hữu / người xác minh độc lập đáng tin cậy / quyền hạn và tổn thất dự kiến có giới hạn / đề xuất giá trị dương sau toàn bộ chi phí, các yếu tố còn lại chấm theo 0/1/2, điểm số hỗ trợ đối thoại nhưng yếu tố mạnh không thể làm trung bình hóa cổng đã thất bại); ③ The Engineering Kit (tài sản thực thi: hệ thống tham chiếu ghi có kiểm soát invoice-exception — 'mô hình đề xuất, phần mềm đáng tin cậy ủy quyền và cam kết, đọc lại nguồn sự thật chứng minh kết quả', bao gồm chính sách quyền hạn, hợp đồng công cụ, mô hình mối đe dọa, kiểm thử hồi quy và bằng chứng phát hành; hệ thống hỗn hợp shipment-risk-triage — chấm điểm ML cổ điển + định tuyến tất định + giải thích mô hình tùy chọn + xem xét thủ công, chứng minh hệ thống AI không nhất thiết phải ưu tiên agent). Triết lý thiết kế: AI có 'vấn đề kế toán' — đội ngũ đo lường token, lời gọi, số agent thay vì kết quả được thay đổi; quan sát công việc thực tế trước khi thiết kế hệ thống (đừng tự động hóa quy trình trên slide thuyết trình); 'dùng AI' không phải quyết định kiến trúc, phân rã theo quyết định và dùng cơ chế tối giản đủ dùng; năng lực không bằng quyền hạn, mô hình mãi mãi chỉ có thể đề xuất; kỹ thuật hóa giá trị (valuemaxxing) không phải tối đa hóa tự động hóa, mà là tối đa hóa giá trị ròng bền vững có thể thu được từ một hệ thống được xác minh, vận hành và dừng lại được. Bài viết bao gồm: giới thiệu dự án, ý tưởng cốt lõi, hướng dẫn từng yếu tố của vòng giao hàng 7 giai đoạn và 12 yếu tố, phân rã kiến trúc của hai ví dụ thực thi, năm nguyên tắc triết lý thiết kế, và 10 quan điểm tổng kết."
date: "2026-08-10"
author: "TopDigg Research Team"
tags: ["FDE", "Forward Deployed Engineering", "AI Value Engineering", "Production AI", "AI Agent", "Value Engineering", "12 Factors", "Accepted Outcome", "Frugal Architecture", "Intelligence Selection", "Agent Architecture", "LLM", "David Ahmann"]
categories: ["Deep Dive"]
keywords: ["FDE", "kỹ sư triển khai tiền phương", "kỹ thuật giá trị AI", "Accepted Outcome", "kết quả được chấp nhận", "AI cấp sản xuất", "cơ chế tối giản đủ dùng", "12 yếu tố", "người xác minh", "ranh giới quyền hạn", "đọc lại nguồn sự thật", "ghi có kiểm soát", "triết lý thiết kế", "David Ahmann"]
---

# FDE Guide phân tích chuyên sâu: Kỹ thuật hóa giá trị trước khi có quyền tự chủ — Phương pháp luận giao hàng cấp sản xuất dành cho FDE và kỹ sư AI

> Ý tưởng cốt lõi: **Tokens là đầu vào (Tokens are an input). Quyền tự chủ là một lựa chọn thiết kế (Autonomy is a design choice). Kết quả được chấp nhận mới là sản phẩm (Accepted outcomes are the product).** davidahmann/fde-guide là hướng dẫn và bộ công cụ kỹ thuật mã nguồn mở độc lập do tác giả David Ahmann (lãnh đạo nền tảng Cloud, Data & AI, cựu Field CTO) duy trì, với một mục tiêu duy nhất: **biến một quy trình làm việc thực tế của khách hàng hoặc nội bộ thành một dịch vụ AI có thể đo lường, có thể vận hành.** Nguyên tắc đầu tiên của nó là "kỹ thuật hóa giá trị trước khi có quyền tự chủ" — bắt đầu từ một mô hình hoặc cấu trúc liên kết agent là sai, phải bắt đầu từ **chính công việc và kết quả được chấp nhận của nó**. Hệ thống AI cấp sản xuất không thể chỉ tạo ra những câu trả lời có vẻ hợp lý; nó phải biết: ai có quyền hành động, thông tin nào là hiện tại, thất bại được giới hạn như thế nào, hoàn thành được xác minh ra sao, toàn bộ dịch vụ tốn bao nhiêu, ai có thể vận hành nó hoặc dừng nó. Agent chỉ là một trong các lựa chọn thành phần; với mỗi quyết định quan trọng, phải so sánh giữa phần mềm tất định, tối ưu hóa, ML cổ điển, truy xuất, gọi mô hình nền tảng, quy trình làm việc agent có giới hạn và xem xét thủ công, rồi chọn **cơ chế tối giản đủ dùng (smallest sufficient mechanism)**, đồng thời giữ lại bằng chứng, quyền hạn, chi phí, đường quay lui và lộ trình ngừng vận hành của nó. "Kỹ thuật giá trị AI 12 yếu tố" của dự án chuyển nguyên tắc này thành các cổng giá trị, người xác minh, áp dụng, quyền hạn, chi phí, bằng chứng và vòng đời một cách tường minh.

---

## 1. Tổng quan dự án

### 1.1 Nó là gì?

Bài viết này phân tích **kho lưu trữ mã nguồn mở GitHub `davidahmann/fde-guide`** — với phụ đề *"Value engineering and production architecture for FDEs, applied-AI engineers, product teams, and operators"* (kỹ thuật giá trị và kiến trúc sản xuất dành cho FDE, kỹ sư AI ứng dụng, đội ngũ sản phẩm và người vận hành). Nó được định vị là "một hướng dẫn mã nguồn mở độc lập và bộ công cụ kỹ thuật", dùng để **biến quy trình làm việc thực tế của khách hàng hoặc nội bộ thành dịch vụ AI có thể đo lường, có thể vận hành**.

Nó không phải một agent framework khác, mà là một tổ hợp **phương pháp kỹ thuật + bằng chứng có thể thực thi**: phương pháp (The Guide) dạy bạn cách suy nghĩ, sổ tay (The Handbook) hỗ trợ phán đoán của bạn, bộ công cụ kỹ thuật (The Engineering Kit) làm cho các tuyên bố, quyền hạn, hành vi và thay đổi trở nên có thể kiểm tra, có thể kiểm chứng. Ba phần là ba độ sâu của cùng một phương pháp, không phải ba framework độc lập.

**Ba độ sâu, dùng theo nhu cầu:**

| Cấp độ | Khi nào dùng | Lối vào |
|------|---------|------|
| **The Guide (Hướng dẫn)** | Muốn có mô hình tư duy, nguyên tắc cốt lõi và vòng giao hàng hoàn chỉnh, khoảng 20 phút | `guide/README.md` |
| **The Handbook (Sổ tay)** | Đang đánh giá, thiết kế, giao hàng, bàn giao hoặc vận hành một quy trình làm việc thực tế | `playbooks/` playbooks vòng đời + `library/00-start-here.md` |
| **The Engineering Kit (Bộ công cụ kỹ thuật)** | Cần hiện vật triển khai, kiến trúc, hợp đồng máy đọc được, kiểm soát phát hành, ví dụ thực thi hoặc kiểm thử | `examples/`, `blueprints/`, `templates/`, `controls/`, `schemas/`, `operations/`, `tests/` |

### 1.2 Dữ liệu và thông tin chính

- Kho lưu trữ: `https://github.com/davidahmann/fde-guide` (giấy phép Apache-2.0, 21 stars / 2 forks, 17 commits, bao gồm siêu dữ liệu trích dẫn `CITATION.cff`)
- Tác giả: **David Ahmann** — lãnh đạo nền tảng Cloud, Data & AI, có kinh nghiệm Field CTO; dự án độc lập, không đại diện cho sự xác nhận của bất kỳ nhà tuyển dụng hiện tại hay trước đây
- Định vị: không yêu cầu mô hình, đám mây hay agent framework cụ thể; không phải runtime có thể triển khai, chứng nhận hay thay thế cho đánh giá của tổ chức mục tiêu
- Tài sản quản trị: `AGENTS.md` (hợp đồng làm việc của kho lưu trữ), `catalog.json` (sổ đăng ký hiện vật được quản trị), `llms.txt` (chỉ mục điều hướng máy gọn gàng)
- Đường cơ sở thực thi: Node.js 22+, `npm ci --ignore-scripts && npm run test:reference && npm run test:evals && npm run test:hybrid`
- Hai hệ thống giảng dạy: ví dụ **ghi có kiểm soát** (invoice-exception, giải quyết ngoại lệ hóa đơn) + ví dụ **hệ thống hỗn hợp** (shipment-risk-triage, phân loại rủi ro vận chuyển)
- Mười kỹ năng agent tùy chọn: `$qualify-ai-workflow`, `$engineer-ai-value`, `$select-ai-mechanism`, `$design-production-ai-system`, `$build-ai-evaluation`, `$secure-ai-action-boundary`, `$review-ai-production-readiness`, `$operate-ai-service`, `$transfer-ai-service`, `$productize-field-learning` (chỉ là chỉ dẫn, không cấp bất kỳ công cụ/thông tin xác thực/quyền/phê duyệt/bằng chứng nào)
- Tổ hợp luồng nghiệp vụ: ngoại lệ đến giải quyết (exception-to-resolution), tín hiệu đến điều tra (signal-to-investigation), rủi ro đến hành động ưu tiên (risk-to-prioritized-action), yêu cầu đến kích hoạt (request-to-activation); hồ sơ dọc bao gồm điều phối tiếp cận y tế, điều tra dịch vụ tài chính, phản hồi vận hành công nghiệp

### 1.3 Nó giải quyết vấn đề gì?

Đầu bài viết chỉ ra ngay điểm đau cốt lõi: **AI có một vấn đề kế toán (AI has an accounting problem).** Các đội ngũ đo lường token, lời gọi mô hình, mã được tạo ra, agent được triển khai, "số giờ công được tuyên bố tiết kiệm" — những thước đo này mô tả việc sản xuất và tiêu thụ trí thông minh, **không xác lập rằng điều gì có giá trị đã xảy ra**. Tổ chức cuối cùng trả tiền cho những kết quả được thay đổi: ngoại lệ hóa đơn được giải quyết và xác nhận trong sổ cái; vụ việc vận chuyển đến đúng người điều phối trước khi ảnh hưởng đến dịch vụ; bản phát hành đến production, vượt qua kiểm tra và giữ được trạng thái khỏe mạnh.

**Một kết quả được chấp nhận (accepted outcome)** là một đơn vị công việc hoàn thành, được người xác minh độc lập, hệ thống quyền hạn hoặc người đánh giá chịu trách nhiệm chấp nhận là đúng. Kỹ thuật giá trị AI kết nối kết quả này với nhu cầu đủ điều kiện, áp dụng, quy kết, toàn bộ chi phí và rủi ro.

Vì vậy vấn đề nó giải quyết là: **làm thế nào biến "hoạt động AI" thành "kết quả được chấp nhận"? Làm thế nào đảm bảo hệ thống được giao không phải là demo, không phải prompt, không phải lời gọi mô hình, không phải agent, không phải bảng điều khiển, mà là một thay đổi có chủ sở hữu (owned change) đối với công việc thực tế** — với kết quả được chấp nhận, người xác minh đáng tin cậy, quyền hạn có giới hạn, đề xuất giá trị với toàn bộ chi phí, đội ngũ vận hành và lộ trình ngừng vận hành.

---

## 2. Tư tưởng cốt lõi

### 2.1 Thế giới quan trong một câu

> **"Tokens are an input. Autonomy is a design choice. Accepted outcomes are the product."**
> (**Tokens là đầu vào. Quyền tự chủ là một lựa chọn thiết kế. Kết quả được chấp nhận mới là sản phẩm.**)

Đây là phương châm của toàn bộ dự án, cũng là ranh giới phân chia với phần lớn nội dung "agent cuồng nhiệt": **tối đa hóa trí thông minh, token, tự động hóa hay quyền tự chủ đều không phải mục tiêu; mục tiêu là cải thiện một kết quả có chủ sở hữu trong giới hạn chi phí và rủi ro được chấp nhận.**

### 2.2 Kỹ thuật hóa giá trị trước khi có quyền tự chủ

> **"Start with the work and the accepted outcome—not with a model or agent topology."**
> (**Bắt đầu từ công việc và kết quả được chấp nhận — chứ không phải từ mô hình hay cấu trúc liên kết agent.**)

Bảy câu hỏi mà hệ thống AI cấp sản xuất phải trả lời: ai có thể hành động, thông tin nào là hiện tại, thất bại được giới hạn như thế nào, hoàn thành được xác minh ra sao, toàn bộ dịch vụ tốn bao nhiêu, ai có thể vận hành nó, ai có thể dừng nó. Agent là một lựa chọn thành phần; với mỗi quyết định quan trọng, so sánh 7 cơ chế (phần mềm tất định / tối ưu hóa / ML cổ điển / truy xuất / gọi mô hình nền tảng / quy trình làm việc agent có giới hạn / xem xét thủ công), chọn cơ chế tối giản đủ dùng, và giữ lại bằng chứng, quyền hạn, chi phí, đường quay lui và lộ trình ngừng vận hành của nó.

### 2.3 Bốn trách nhiệm của FDE và đầu ra "thay đổi có chủ sở hữu"

Một kỹ sư triển khai tiền phương (Forward-Deployed Engineer, FDE) biến **vấn đề vận hành mơ hồ** thành **dịch vụ phần mềm được hỗ trợ tạo ra kết quả có thể đo lường**. Công việc trải dài qua bốn trách nhiệm:

1. **Khám phá (Discovery)**: hiểu công việc, phán đoán, độ trễ, rủi ro và giá trị thực sự nằm ở đâu.
2. **Sản phẩm (Product)**: quyết định người dùng nên thay đổi điều gì, điều gì nên giữ thủ công, cục bộ hoặc bằng tay.
3. **Kỹ thuật (Engineering)**: xây dựng hệ thống đáng tin cậy tối thiểu có thể cải thiện quy trình làm việc.
4. **Vận hành (Operation)**: chứng minh kết quả, bàn giao quyền sở hữu, hỗ trợ dịch vụ, học hỏi từ production.

**Đầu ra không phải demo, prompt, lời gọi mô hình, agent hay bảng điều khiển**, mà là một **thay đổi có chủ sở hữu đối với công việc thực tế**: với kết quả được chấp nhận, người xác minh đáng tin cậy, quyền hạn có giới hạn, đề xuất giá trị với toàn bộ chi phí, đội ngũ vận hành và lộ trình ngừng vận hành. Phương pháp tương tự áp dụng trong nội bộ công ty — kỹ sư AI ứng dụng nội bộ dù không có chức danh FDE cũng phải kết nối bối cảnh kinh doanh, phán đoán sản phẩm, kiến trúc phần mềm, áp dụng và vận hành sản xuất.

### 2.4 Một vòng giao hàng xuyên suốt

Toàn bộ kho lưu trữ chỉ tuân theo một vòng đời (7 giai đoạn), không tạo phương pháp song song cho từng khách hàng, mô hình hay framework:

```
Quan sát công việc → Hiến chương hóa giá trị và phạm vi → Chọn cơ chế → Xây dựng một lát cắt có kiểm soát → Chứng minh bằng ca sử dụng và người dùng → Lên sóng và bàn giao quyền sở hữu → Vận hành, học hỏi hoặc ngừng vận hành → (quay lại hiến chương)
```

Mỗi giai đoạn kết thúc bằng **quyết định + bằng chứng mà người khác có thể kiểm tra**. Dừng lại, thu hẹp hoặc thiết kế lại một công việc yếu kém là một kết quả hợp lệ — một điểm số mô hình đẹp, nhà tài trợ, gia hạn hợp đồng, lên sóng hay con số sử dụng, **không thể làm trung bình hóa các cổng giá trị, quyền hạn, an toàn, quyền sở hữu hoặc sản xuất đã thất bại**.

---

## 3. Hướng dẫn chi tiết: Vòng giao hàng 7 giai đoạn + Kỹ thuật giá trị 12 yếu tố

### 3.1 Giai đoạn 1: Quan sát công việc trước, rồi mới thiết kế hệ thống (Observe)

**Trích xuất bối cảnh không phải là thu thập mọi tài liệu, mà là khám phá sự thật vận hành tối thiểu cần thiết để đưa ra các quyết định thiết kế quan trọng.** Quan sát các ca thực tế cùng với những người thực hiện, tiếp nhận, đánh giá và hỗ trợ công việc đó, ghi lại:

1. Điểm kích hoạt và giao diện công việc;
2. Các quyết định đang được đưa ra;
3. Đầu vào và nguồn quyền hạn của chúng;
4. Hành động được phép và mức ảnh hưởng tối đa có thể chấp nhận;
5. Đường đi bình thường, ngoại lệ, cách xử lý tạm và phục hồi;
6. Người sở hữu kết quả kinh doanh;
7. Người hoặc hệ thống có thể độc lập chấp nhận kết quả;
8. Đội ngũ sẽ vận hành quy trình làm việc sau khi thay đổi.

**Phỏng vấn tạo ra giả thuyết; walkthrough của người vận hành, hiện vật nguồn, trace hệ thống và bản ghi đối soát tạo ra bằng chứng mạnh hơn.** Nếu quy trình làm việc chỉ rõ ràng trên slide thuyết trình, việc khám phá chưa hoàn thành.

Cảnh báo: **đừng tự động hóa một cách xử lý tạm trước khi hỏi "quy trình làm việc, chính sách, hệ thống nguồn hay bàn giao có nên được sửa chữa không".** AI có thể làm một quy trình hỏng chạy nhanh hơn, đồng thời khiến vấn đề nền tảng khó bị nhìn thấy hơn.

### 3.2 Giai đoạn 2: Kỹ thuật hóa hợp đồng giá trị (Charter) — bảy trường mà một ca sử dụng có thể xây dựng

Một ca sử dụng chỉ có thể xây dựng khi kết quả của nó **có thể được sở hữu, đo lường, chất vấn**. Định nghĩa các trường này trước khi kiến trúc:

- **Nhóm đủ điều kiện (Eligible population)**: công việc nào có thể hợp pháp sử dụng hệ thống, bao gồm các loại trừ.
- **Đường cơ sở (Baseline)**: hiệu suất, trạng thái, ngày tháng, nhóm và mức độ tin cậy hiện tại.
- **Kết quả được chấp nhận (Accepted outcome)**: sự kiện công việc được chấp nhận độc lập — không phải mô hình "tạo ra" hay "hoàn thành".
- **Người xác minh (Verifier)**: người, quy tắc, đối soát hoặc sự kiện nguồn sự thật xác lập sự chấp nhận.
- **Mục tiêu và rào chắn (Target and guardrails)**: thay đổi mong muốn, và những thứ tuyệt đối không được xấu đi.
- **Quy kết (Attribution)**: đội ngũ phân biệt hiệu ứng hệ thống với các thay đổi khác như thế nào.
- **Toàn bộ chi phí (Full cost)**: khám phá, giao hàng, thay đổi, mô hình, hạ tầng, công cụ, xem xét thủ công, hỗ trợ, sự cố, phục hồi và bảo trì.
- **Tổn thất còn lại (Residual loss)**: thiệt hại dự kiến hoặc đã xảy ra không nằm trong các khoản lợi ích hoặc chi phí khác.
- **Chủ sở hữu (Owner)**: vai trò chịu trách nhiệm về chỉ số và các quyết định mà nó thúc đẩy.

Đơn vị vận hành hữu ích:

```text
Chi phí mỗi kết quả được chấp nhận =
  Tổng chi phí vận hành và chi phí vòng đời phân bổ
  / Số kết quả được chấp nhận độc lập
```

```text
Giá trị ròng đã hiện thực =
  Giá trị quy kết được của kết quả được chấp nhận
  + Tổn thất tránh được không trùng lặp
  − Chi phí vòng đời
  − Tổn thất còn lại chưa được bù trừ
```

**Tách biệt dự đoán, bằng chứng thí điểm đã chứng minh và giá trị sản xuất đã hiện thực.** Đừng quy năm hóa một thí điểm hẹp trừ khi có suy luận tường minh, có chủ sở hữu. Đừng đếm trùng cùng một lợi ích qua tiết kiệm thời gian, giá trị đơn vị, tổn thất tránh được hay giảm biên chế.

### 3.3 Giai đoạn 3: Chọn cơ chế tối giản đủ dùng (Select)

**"Dùng AI" không phải một quyết định kiến trúc.** Phân rã quy trình làm việc thành các bước quyết định quan trọng, chọn cơ chế riêng cho từng bước:

| Cơ chế | Phù hợp với | Tín hiệu cảnh báo |
|------|------|---------|
| **Phần mềm tất định** | Quy tắc ổn định, chuyển đổi, xác minh, định tuyến, ủy quyền | Sự mơ hồ ngôn ngữ tự nhiên bị giấu vào các nhánh if-else mong manh |
| **Thuật toán tối ưu hóa** | Phân bổ, lập lịch, sắp xếp, lập kế hoạch (với mục tiêu và ràng buộc tường minh) | Mục tiêu hoặc ràng buộc không thể được sở hữu hoặc đo lường |
| **ML cổ điển** | Dự đoán lặp lại (có nhãn, độ không chắc chắn được hiệu chuẩn, giám sát trôi dạt) | Không tồn tại kết quả đại diện hoặc đường phản hồi |
| **Truy xuất** | Bằng chứng phải được tìm kiếm qua các nguồn được quản trị | Đầu ra truy xuất được phép trở thành chính sách hoặc quyền hạn |
| **Gọi mô hình nền tảng** | Giải thích, trích xuất, phân loại hoặc soạn thảo có giới hạn | Đầu ra trôi chảy bị coi là sự thật đã được xác minh |
| **Quy trình làm việc agent có giới hạn** | Phán đoán nhiều bước thực sự phụ thuộc vào bằng chứng hoặc việc sử dụng công cụ thay đổi | Các bước đã biết trước, mã quy trình làm việc thông thường sẽ đơn giản hơn |
| **Xem xét thủ công** | Phán đoán khó xác minh, rủi ro cao, hoặc chính sách yêu cầu trách nhiệm giải trình | Xem xét bị dùng để che giấu hệ thống không dùng được hoặc khối lượng công việc không giới hạn |

Một hệ thống sản xuất có thể kết hợp nhiều cơ chế. Giữ mỗi đường đi có thể quan sát, kiểm thử, thay thế, tính chi phí. **Đường đi mô hình không làm suy yếu danh tính, ủy quyền, dữ liệu, phát hành hay các kiểm soát kỹ thuật phần mềm thông thường.** Chỉ thêm agent khi phán đoán nhiều bước có giới hạn thực sự hữu ích; chỉ thêm nhiều agent khi **khác biệt thực sự** về quyền, công cụ, bối cảnh, quyền sở hữu hoặc độ trễ chứng minh được chi phí điều phối là hợp lý.

### 3.4 Giai đoạn 4: Xây dựng một lát cắt dọc có kiểm soát (Build)

Lát cắt đầu tiên nên xuyên qua **giao diện và ranh giới kiểm soát thực tế**, mà không cần thử nghiệm sản phẩm hoàn chỉnh. Nó nên trình diễn:

- Một điểm kích hoạt và người dùng đại diện;
- Bối cảnh quyền hạn với hành vi quyền thực tế;
- Đường quyết định đã chọn;
- Giao diện công việc cuối cùng của người vận hành;
- Ảnh hưởng mô phỏng, tạm thời, có thể đảo ngược hoặc có giới hạn theo cách khác;
- Trạng thái thất bại và leo thang tường minh;
- Bằng chứng đo từ xa, chi phí và chấp nhận;
- Đường phục hồi hoặc quay lui có chủ sở hữu.

**Bắt đầu áp dụng và bàn giao ngay trong thời gian thí điểm.** Đội ngũ tiếp nhận nên tham gia đánh giá, phát hành, hỗ trợ, thay đổi chính sách, sự cố, quay lui và ngừng vận hành theo cặp trước khi đội ngũ giao hàng rút lui.

**Tuyên bố trước thời lượng tối đa của thí điểm, điểm cắt bằng chứng, và các cổng tốt nghiệp độc lập (kỹ thuật / người vận hành / áp dụng / giá trị / kinh tế / sẵn sàng sản xuất).** Một demo không nên âm thầm trở thành production chỉ vì gây ấn tượng với nhà tài trợ.

### 3.5 Giai đoạn 5: Chứng minh tuyên bố trên công việc đại diện (Prove)

**Đánh giá là "tuyên bố phát hành trong các điều kiện được khai báo", không phải điểm số vĩnh viễn.** Sử dụng ca bình thường đại diện, lát cắt khó, ngoại lệ đã biết, đầu vào đối nghịch, thất bại phụ thuộc, thay đổi chính sách, hết thời gian, thử lại, hủy bỏ, phục hồi và dung lượng xem xét thủ công. **Giữ lại toàn bộ phiên bản môi trường và hành vi cần thiết để phát lại kết quả.**

Tách ba câu hỏi:

1. **Năng lực (Capability)**: cơ chế có thể thực hiện tác vụ không?
2. **Hành vi (Behavior)**: toàn bộ hệ thống có đi đúng đường và dừng an toàn không?
3. **Kết quả (Outcome)**: quy trình làm việc có cải thiện kết quả được chấp nhận cho nhóm mục tiêu trong rào chắn không?

Kiểm tra tất định mạnh nhất với các bất biến đóng; thước đo thống kê cần mẫu số và độ không chắc chắn; trọng tài mô hình cần rubric được hiệu chuẩn và so sánh thủ công; phản hồi sản xuất không thể âm thầm làm ô nhiễm tập giữ lại, cũng không thể để mô hình ứng viên kiểm soát người đánh giá của chính nó. Thăng cấp qua các giai đoạn có giới hạn như **đánh giá ngoại tuyến → vận hành song song → canary → phân đoạn sản xuất được đặt tên**; **định nghĩa quay lui trước khi lên sóng**.

### 3.6 Giai đoạn 6: Vận hành dịch vụ và bàn giao quyền sở hữu (Launch + Operate)

**Production là một quyết định lặp lại, không phải bước triển khai cuối cùng.** Giám sát toàn bộ hệ thống: kết quả được chấp nhận, giá trị, áp dụng và rào chắn; nguồn, quyền, độ tươi và đối soát; phiên bản đường đi, mô hình, prompt, công cụ và chính sách; độ trễ, chi phí, thử lại, bước và lý do kết thúc; sự kiện bị từ chối/bị cấm/trùng lặp/không rõ hiệu quả/không khớp khi đọc lại; tải người đánh giá, sửa chữa, bỏ cuộc, đào tạo và hỗ trợ; tính liên tục của chủ sở hữu, sẵn sàng sự cố, quay lui và khả năng ngừng vận hành.

**Bàn giao chỉ hoàn thành khi đội ngũ tiếp nhận có thể vận hành, thay đổi, phục hồi, hỗ trợ và ngừng vận hành dịch vụ mà không cần chủ nghĩa anh hùng của đội ngũ giao hàng. Tài liệu tự nó không chứng minh năng lực vận hành; diễn tập mới chứng minh.**

### 3.7 Giai đoạn 7: Biến học hỏi hiện trường thành năng lực sản phẩm (Field learning)

Lợi thế lãi kép của công việc FDE không phải dữ liệu khách hàng tái sử dụng hay mã tùy chỉnh chất đống, mà là **khả năng tách bối cảnh cục bộ khỏi kiến thức kỹ thuật có thể chuyển giao**. Mặc định giữ lại cho khách hàng/đơn vị kinh doanh cụ thể: chính sách, ngưỡng, danh tính, quyền, dữ liệu nhạy cảm, chi tiết nguồn và quyết định vận hành. Ứng viên tái sử dụng bao gồm: hình dạng hợp đồng, loại thất bại, phương pháp đánh giá, mẫu giao diện công việc, nguyên thủy tích hợp, kiểm soát, runbook và lỗ hổng nền tảng.

**Chỉ sản phẩm hóa khi bằng chứng cho thấy sự lặp lại trong môi trường độc lập, ứng viên đã được khử nhạy cảm, tồn tại điểm đến và chủ sở hữu, xác minh cụ thể mục tiêu thành công, và đi theo đường phát hành bình thường.** Phân loại trước (cấu hình khách hàng / mở rộng thuộc sở hữu mục tiêu / năng lực sản phẩm hoặc nền tảng dùng chung / thí nghiệm có thời hạn / bị cấm hoặc hoãn), rồi mới triển khai. **Đừng tạo ra sự phụ thuộc, giữ lại bằng chứng tiêu cực và dừng lại, giữ lại đường thoát.**

### 3.8 Cốt lõi hướng dẫn: Kỹ thuật giá trị AI 12 yếu tố (Valuemaxxing)

Đây là khung "sổ cái" của toàn bộ dự án — quy đổi hoạt động AI thành kết quả được chấp nhận:

| # | Yếu tố | Điểm chính trong một câu |
|---|------|-----------|
| 1 | **Quan sát công việc thực tế** | Đừng tự động hóa quy trình trên slide thuyết trình; cách xử lý tạm không tự động bằng chuyên môn miền (`FDE-002`) |
| 2 | **Sở hữu kết quả** | Định nghĩa kết quả vận hành trước khi chọn công nghệ; "tạo phản hồi" là đầu ra, "giải quyết ngoại lệ và xác nhận số dư đã sửa trong sổ cái" mới là kết quả (`FDE-001`, `VAL-001`) |
| 3 | **Khoanh vùng công việc đủ điều kiện** | Làm rõ công việc nào đủ điều kiện, công việc nào không; khai báo mẫu số trước khi tính tỷ lệ áp dụng; "hệ thống xử lý hầu hết ca đơn giản" có thể có giá trị thấp hơn "hệ thống xử lý vài ca đắt đỏ" (`VAL-001`) |
| 4 | **Xây dựng phản thực tế** | Đo quy trình làm việc hiện tại trước khi tuyên bố cải thiện; biểu đồ trước/sau không tự động là bằng chứng nhân quả, khai báo các yếu tố gây nhiễu đã biết và giới hạn của phương pháp quy kết (`VAL-001`, `VAL-002`) |
| 5 | **Đặt tên người xác minh** | Hệ thống sản xuất không nên là trọng tài duy nhất về việc nó có thành công hay không; người xác minh phải có thể phủ quyết kết quả; chấp nhận ≠ agent đi đến cuối quy trình làm việc (`FDE-001`, `EVA-001`, `REL-003`) |
| 6 | **Kỹ thuật hóa quy trình làm việc và áp dụng** | Thành công kỹ thuật nhưng không ai dùng = giá trị bằng không; nếu người dùng phải dựng lại mọi kết quả mới dám tin, công việc chưa được tự động hóa (`FDE-003`, `ADP-001`, `ADP-002`) |
| 7 | **Dùng trí thông minh tối giản đủ dùng** | Đừng quyết định ngay từ đầu rằng vấn đề cần agent; phân rã thành quyết định rồi so sánh từng cái; leo thang ca khó thay vì cho mọi quyết định đi qua mô hình mạnh nhất (`ARC-004`, `ARC-005`) |
| 8 | **Khoanh vùng quyền hạn và tổn thất** | Năng lực không trao quyền hạn; các hành động được phép đơn lẻ có thể kết hợp thành kết quả không thể chấp nhận, hãy xem xét toàn bộ đường hành động (`IAM-003`, `SEC-004`, `REL-001/003/005`) |
| 9 | **Định giá cho toàn bộ dịch vụ** | Token chỉ là một trong các chi phí; mô hình rẻ hơn có thể khiến quy trình làm việc xung quanh đắt hơn; kết quả đúng về mặt kỹ thuật vẫn có thể không thể chấp nhận về mặt kinh tế (`CST-001`, `CST-002`) |
| 10 | **Chứng minh trên công việc đại diện** | Demo thành công chứng minh đường đi khả thi, không chứng minh hệ thống sẵn sàng lên sóng; thí điểm tuyên bố trước thời lượng tối đa, điểm cắt bằng chứng, chủ sở hữu quyết định và cổng tốt nghiệp độc lập (`EVA-001/003`, `DEL-001`) |
| 11 | **Đo giá trị đã hiện thực có thể quy kết** | Công việc đủ điều kiện → đến quy trình làm việc → hoàn thành quy trình làm việc → kết quả được chấp nhận → tác động kinh doanh được đo → giá trị ròng bền vững; báo cáo không áp dụng, phủ sóng, làm lại, tải người đánh giá, sự cố, phục hồi và toàn bộ chi phí (`VAL-002`, `OPS-004/006`, `CST-001`) |
| 12 | **Mở rộng, siết chặt hoặc ngừng vận hành dựa trên bằng chứng** | Quyền tự chủ và đầu tư phải giành được quyền tiếp tục bằng kết quả tiến lên; benchmark mạnh hơn, mô hình lớn hơn hay con số sử dụng cao hơn không tự động chứng minh thêm quyền hạn (`VAL-003`, `ADP-002`, `OPS-007`) |

**Bốn cổng cứng (cứng, không thể làm trung bình hóa):**

1. Một kết quả có chủ sở hữu, có thể đo lường (owned outcome)
2. Một người xác minh độc lập đáng tin cậy (credible independent verifier)
3. Quyền hạn và tổn thất dự kiến có giới hạn (bounded authority and expected loss)
4. Đề xuất giá trị hợp lý, dương sau toàn bộ chi phí (plausible positive value case after full cost)

Thiếu bất kỳ cổng nào, quyết định đúng có thể là `defer` (hoãn), `redesign` (thiết kế lại) hoặc `do_not_build` (không xây dựng). Các yếu tố còn lại được chấm theo **0 — chưa định nghĩa / 1 — đã khai báo / 2 — đã chứng minh**; điểm số hỗ trợ đối thoại, không phải chứng nhận, yếu tố mạnh không thể làm trung bình hóa cổng đã thất bại.

**Công thức giá trị:**

```text
Giá trị ròng dự kiến =
  Khối lượng đủ điều kiện × Tỷ lệ áp dụng dự kiến × Tỷ lệ kết quả được chấp nhận tăng thêm dự kiến × Giá trị mỗi kết quả được chấp nhận
  − Chi phí vòng đời dự kiến
  − Tổn thất còn lại dự kiến chưa được bù trừ từ tổn thất tránh được hoặc giá trị đơn vị
```

### 3.9 Ví dụ hướng dẫn 1: Hệ thống ghi có kiểm soát (invoice-exception, giải quyết ngoại lệ hóa đơn)

Mục tiêu trình diễn: **mô hình đề xuất; phần mềm đáng tin cậy ủy quyền và cam kết; đọc lại nguồn sự thật chứng minh kết quả.** Luồng mục tiêu:

```text
Sự kiện ngoại lệ hóa đơn → Thu thập bằng chứng sổ cái/nhà cung cấp/chính sách → Đề xuất giải pháp → Xác minh bất biến
  → Ủy quyền và tạm giữ → Phê duyệt tóm tắt đề xuất chính xác → Ủy quyền lại lũy đẳng và cam kết
  → Đối soát mọi thời gian chờ 'không rõ hiệu quả' → Đọc lại trạng thái sổ cái → Biên nhận hoàn thành | Bồi thường + sự cố
```

Cơ chế cốt lõi và bất biến (đây chính là minh họa của "ghi có kiểm soát"):

- `resolution_commits(tenant_id, business_operation_id) <= 1` (lũy đẳng: một thao tác nghiệp vụ chỉ có thể cam kết một lần)
- Tóm tắt phát hành runtime trước khi cam kết == tóm tắt phát hành giải pháp được chấp nhận; bản sửa đổi hóa đơn được cam kết == bản sửa đổi hóa đơn hiện tại; tóm tắt đề xuất được cam kết == tóm tắt đề xuất được phê duyệt; bản sửa đổi chính sách == bản sửa đổi chính sách hiện tại
- Tenant người gọi == tenant hóa đơn; mỗi ranh giới dữ liệu/ảnh hưởng đều kiểm tra phạm vi người gọi hiện tại và bản sửa đổi chính sách hiện tại
- `committed == true` chỉ sau khi đọc lại nguồn sự thật; `effect_unknown` được đối soát trước khi thử lại hoặc hoàn thành
- `completed == true` chỉ sau khi xác minh biên nhận đáng tin cậy và bằng chứng đọc lại; các bước, thời gian tường và chi phí nằm trong ngân sách runtime đã khai báo; **`model_access(credentials) == false` (mô hình không bao giờ chạm tới thông tin xác thực)**

Hiện vật đi kèm: runtime thực thi `reference-loop.mjs`, chính sách ủy quyền `authorization-policy.mjs`, hợp đồng công cụ có kiểu (đọc/tạm giữ/cam kết/đọc lại), danh sách năng lực và bản ghi xuất xứ, mô hình mối đe dọa, ca đánh giá (cam kết được ủy quyền / ghi không được ủy quyền / thử lại trùng lặp / thử lại trôi dạt bản sửa đổi / tiêm prompt), bộ chấm điểm độc lập, báo cáo đánh giá và phát hành giải pháp chỉ để xem xét. Phủ hồi quy: ủy quyền, cô lập tenant, chính sách cũ, thử lại trùng lặp, thời điểm phê duyệt, thu hồi phát hành, xác minh biên nhận, phục hồi không rõ hiệu quả và đọc lại nguồn sự thật.

### 3.10 Ví dụ hướng dẫn 2: Hệ thống hỗn hợp (shipment-risk-triage, phân loại rủi ro vận chuyển)

Chứng minh **hệ thống AI không nhất thiết phải ưu tiên agent**: chấm điểm ML cổ điển → định tuyến chính sách tất định → giải thích mô hình tùy chọn → giữ quyết định vận hành cho con người. Bốn cơ chế kết hợp trong một quy trình làm việc có giới hạn, mỗi thành phần đều có bản ghi chọn lựa (`intelligence-selection.md`), ca đánh giá và kiểm thử hồi quy. Nó là người bạn đồng hành thực thi của "bản thiết kế hệ thống trí thông minh hỗn hợp".

### 3.11 Tám lớp tường minh của thiết kế hệ thống

Mô hình là một thành phần trong một ranh giới phần mềm và vận hành lớn hơn. Thiết kế các lớp này (tương ứng `design-production-ai-system`):

- **Miền và trạng thái (Domain and state)**: đối tượng, danh tính, bản sửa đổi, trạng thái vòng đời, bất biến và hệ thống nguồn sự thật
- **Bối cảnh (Context)**: nguồn, quyền, xuất xứ, độ tươi, đầy đủ, tin cậy và vô hiệu hóa
- **Hành vi (Behavior)**: mã, quy tắc, đường mô hình, prompt, công cụ, rào chắn và khả năng tương thích
- **Quyền hạn (Authority)**: danh tính người gọi hoặc khối lượng công việc, tenant, phạm vi, chính sách, phê duyệt và ảnh hưởng tối đa
- **Năng lực (Capabilities)**: đầu vào đầu ra có kiểu, điểm đến chính xác, mẫu thông tin xác thực, hợp đồng thất bại, an toàn trùng lặp và đọc lại
- **Runtime**: trạng thái bền vững, hủy bỏ, hết thời gian, ngân sách tài nguyên, thử lại, cầu chì và trạng thái kết thúc tường minh
- **Bề mặt công việc (Work surface)**: hiện vật bền vững, bằng chứng, trạng thái, độ không chắc chắn, phương án thay thế và hành động thủ công được phép
- **Vận hành (Operation)**: trace, mục tiêu dịch vụ, cảnh báo, runbook, đường thay đổi, quay lui, quyền sở hữu và ngừng vận hành

**Quy tắc hành động cốt lõi**: mô hình có thể đề xuất (propose). Phần mềm đáng tin cậy ủy quyền và cam kết (authorize and commit). Đọc lại nguồn sự thật (source-of-truth readback) chứng minh kết quả. Bí mật và thông tin xác thực nằm ngoài bối cảnh mô hình có thể thấy; tại ranh giới thực hiện ảnh hưởng quan trọng (consequential effect), kiểm tra lại danh tính, tenant, phạm vi, chính sách, chấp nhận phát hành và phê duyệt hiện tại; suy ra an toàn trùng lặp từ danh tính thao tác nghiệp vụ ổn định; sau khi tạo ảnh hưởng, xác minh kết quả trong hệ thống quyền hạn trước khi báo cáo hoàn thành.

### 3.12 Nguyên tắc bất khả xâm phạm và phản mẫu của kiến trúc

**Nguyên tắc bất khả xâm phạm:**

- Khi dùng mô hình: mô hình đề xuất, phần mềm tất định xác minh, ủy quyền, thực thi, lưu trữ bền vững và xác minh công việc quan trọng (`ARC-002`)
- Mỗi thành phần có mục đích, phiên bản, chủ sở hữu, trần quyền hạn, bằng chứng, phân bổ chi phí, giám sát, quay lui và lộ trình ngừng vận hành được đặt tên (`ARC-005`, `DEL-001`)
- Trạng thái nguồn sự thật, danh tính, phê duyệt và bằng chứng hoàn thành nằm ngoài prompt và bối cảnh mô hình tức thời (`CTX-001`, `IAM-001`, `REL-003`)
- Đơn vị phát hành ràng buộc dữ liệu, miền, thành phần trí thông minh, công cụ, chính sách, đánh giá, giao diện người dùng và vận hành — không chỉ mã (`DEL-001`)
- Mô hình nền tảng hoặc agent được giữ lại vì nó cải thiện kết quả được chấp nhận trong rào chắn yêu cầu, chứ không phải vì nó mới lạ hoặc dùng được (`ARC-004`, `VAL-002`)

**Phản mẫu:** gọi quyết định chính sách tất định là "suy luận agent"; coi đường mô hình là kiến trúc trong khi trạng thái/truy cập/ảnh hưởng/phục hồi vẫn ngầm định; thêm LLM vào bài toán lập lịch, phân bổ, xác minh hoặc phân loại mà không so sánh cơ chế đơn giản hơn; huấn luyện hoặc định tuyến mô hình ML mà không có nhãn ổn định, thước đo lỗi, giám sát trôi dạt hoặc chủ sở hữu; tối ưu chi phí suy luận nhưng bỏ qua chi phí công cụ, đánh giá, phục hồi và hỗ trợ khách hàng; coi sơ đồ kiến trúc không có chuyển đổi trạng thái, ranh giới tin cậy, hành vi thất bại hay kiểm thử phát hành là hoàn chỉnh.

---

## 4. Triết lý thiết kế

### 4.1 "AI có vấn đề kế toán": Từ đo lường hoạt động sang đo lường kết quả

Điểm khởi đầu của triết lý thiết kế là sự phê phán hiện trạng: **các đội ngũ đo lường token, lời gọi, mã, agent và "số giờ công được tuyên bố tiết kiệm", những thứ này chỉ mô tả việc sản xuất và tiêu thụ trí thông minh, không xác lập giá trị nào xảy ra.** Tổ chức cuối cùng trả tiền cho những kết quả được thay đổi. Vì vậy "valuemaxxing (tối đa hóa giá trị)" không có nghĩa là tối đa hóa tự động hóa — nó có nghĩa là **tối đa hóa giá trị ròng bền vững từ một hệ thống mà con người có thể xác minh, vận hành và dừng lại**.

### 4.2 "Kỹ thuật hóa giá trị trước khi có quyền tự chủ": Mô hình không phải điểm khởi đầu

Nguyên tắc đầu tiên của dự án ngược với câu chuyện chủ đạo của ngành: **đừng bắt đầu từ "dùng mô hình nào" hay "cần cấu trúc liên kết agent gì", hãy bắt đầu từ công việc và kết quả được chấp nhận.** Agent là một lựa chọn thành phần. Với mỗi quyết định quan trọng, 7 cơ chế (phần mềm tất định/tối ưu hóa/ML cổ điển/truy xuất/mô hình nền tảng/agent có giới hạn/con người) được so sánh từng cái một, chọn cơ chế tối giản đủ dùng. **"AI hơn" có thể có nghĩa là quy trình làm việc chưa bao giờ được phân rã đúng.**

### 4.3 "Năng lực không trao quyền hạn": Thiết kế tin cậy tối thiểu

**Mô hình mãi mãi chỉ có thể đề xuất.** Phần mềm đáng tin cậy (mã tất định) chịu trách nhiệm ủy quyền, thực thi, lưu trữ bền vững và xác minh công việc quan trọng. Quyền hạn ràng buộc vào quy trình làm việc, tác nhân, tenant, mục đích, nhiệm vụ, mục tiêu, thời lượng và hậu quả; các hành động được phép đơn lẻ có thể kết hợp thành kết quả không thể chấp nhận, vì vậy hãy xem xét toàn bộ đường hành động. Trạng thái nguồn sự thật, danh tính, phê duyệt và bằng chứng hoàn thành luôn nằm ngoài prompt và bối cảnh mô hình tức thời — **bí mật và thông tin xác thực mô hình không bao giờ chạm tới (`model_access(credentials) == false`)**.

### 4.4 "Người xác minh phải có thể phủ quyết": Hệ thống sản xuất không thể tự chấm điểm

Ba câu hỏi đánh giá tách năng lực/hành vi/kết quả; **hệ thống sản xuất không nên là trọng tài duy nhất về việc nó có thành công hay không** — người xác minh (kiểm tra tất định, đối soát nguồn sự thật, đánh giá độc lập, xác nhận hạ nguồn hoặc người đánh giá thủ công chịu trách nhiệm) phải có thể phủ quyết kết quả. "Chấp nhận" đòi hỏi nhiều hơn "agent đi đến cuối quy trình làm việc". Triết lý này cùng mạch với "đừng để agent tự xác minh", nhưng nâng nó thành **một trường cứng trong hợp đồng giá trị (người xác minh được đặt tên)**.

### 4.5 "Điểm số hỗ trợ đối thoại, cổng không thể làm trung bình hóa": Đạo đức bằng chứng

Sự phân tách giữa khung chấm điểm 0/1/2 và 4 cổng cứng là tuyên bố triết học sắc bén nhất của toàn bộ dự án: **demo và điểm số tổng hợp không thể làm trung bình hóa cổng đã thất bại; dự đoán, thí điểm đã chứng minh và giá trị đã hiện thực phải được tách biệt; số không là bằng chứng, không phải giá trị mặc định.** Dừng lại, thu hẹp hoặc thiết kế lại công việc yếu kém là một kết quả hợp lệ — điểm số mô hình mạnh, nhà tài trợ, con số lên sóng đều không thể che giấu các cổng giá trị/quyền hạn/an toàn/quyền sở hữu/sản xuất đã thất bại. **Đánh giá là "tuyên bố phát hành trong các điều kiện được khai báo", không phải điểm số vĩnh viễn.**

### 4.6 "Cách xử lý tạm không phải chuyên môn miền": Sự khiêm tốn với hiện trường

Quan sát công việc thực tế (chứ không phải quy trình trên slide thuyết trình); phân loại mỗi hành vi quan sát được thành giữ lại/sửa chữa/loại bỏ/nâng cấp. **AI có thể làm quy trình hỏng chạy nhanh hơn, đồng thời khiến vấn đề nền tảng khó bị nhìn thấy hơn.** Lợi thế lãi kép của học hỏi hiện trường là khả năng tách bối cảnh cục bộ khỏi kiến thức kỹ thuật có thể chuyển giao; đừng tạo ra sự phụ thuộc, giữ lại bằng chứng tiêu cực và dừng lại, giữ lại đường thoát.

---

## 5. Tổng kết (quan điểm và kết luận)

### 5.1 Danh sách quan điểm cốt lõi

1. **Định nghĩa giá trị:** kết quả được chấp nhận (đơn vị công việc được người xác minh độc lập/hệ thống quyền hạn/người đánh giá chịu trách nhiệm chấp nhận là đúng) mới là sản phẩm; token và tự động hóa chỉ là đầu vào và phương tiện.
2. **Điểm khởi đầu:** bắt đầu từ công việc và kết quả được chấp nhận, chứ không phải từ mô hình hay cấu trúc liên kết agent; Agent là một lựa chọn thành phần, không phải kiến trúc.
3. **Cơ chế tối giản đủ dùng:** với mỗi quyết định quan trọng, so sánh giữa 7 cơ chế và chọn cơ chế tối giản đủ dùng; "dùng AI" không phải quyết định kiến trúc; AI hơn có thể có nghĩa là quy trình làm việc chưa bao giờ được phân rã đúng.
4. **Quan sát trước:** quan sát công việc thực tế (walkthrough người vận hành/hiện vật nguồn/trace hệ thống) trước khi thiết kế; phỏng vấn chỉ tạo ra giả thuyết; đừng tự động hóa quy trình trên slide thuyết trình, cũng đừng tự động hóa cách xử lý tạm trước khi sửa chữa.
5. **Các trường hợp đồng giá trị:** nhóm đủ điều kiện/đường cơ sở/kết quả được chấp nhận/người xác minh/mục tiêu rào chắn/quy kết/toàn bộ chi phí/tổn thất còn lại/chủ sở hữu — chín trường đi trước kiến trúc.
6. **12 yếu tố + 4 cổng cứng:** kết quả có chủ sở hữu / người xác minh độc lập đáng tin cậy / quyền hạn và tổn thất dự kiến có giới hạn / đề xuất giá trị dương sau toàn bộ chi phí; thiếu bất kỳ cổng nào → defer / redesign / do_not_build; chấm điểm 0/1/2 hỗ trợ đối thoại nhưng không thể làm trung bình hóa cổng.
7. **Ranh giới quyền hạn:** năng lực không trao quyền hạn; mô hình đề xuất, phần mềm đáng tin cậy ủy quyền và cam kết, đọc lại nguồn sự thật chứng minh; bí mật và thông tin xác thực luôn nằm ngoài bối cảnh mô hình; tính lũy đẳng (một thao tác nghiệp vụ cam kết một lần) và đối soát không rõ hiệu quả là bất biến cứng.
8. **Áp dụng và vận hành:** thành công kỹ thuật nhưng không ai dùng = giá trị bằng không; bàn giao lấy "đội ngũ tiếp nhận có thể vận hành/thay đổi/phục hồi/hỗ trợ/ngừng vận hành" làm tiêu chuẩn hoàn thành (diễn tập chứ không phải tài liệu); production là quyết định lặp lại chứ không phải bước triển khai cuối cùng.
9. **Chống ưu tiên agent:** ví dụ hệ thống hỗn hợp chứng minh chính sách tất định + ML cổ điển + xem xét thủ công có thể là kiến trúc đúng; chỉ thêm agent khi phán đoán nhiều bước có giới hạn thực sự hữu ích.
10. **Học hỏi hiện trường:** lợi thế lãi kép = tách bối cảnh cục bộ khỏi kiến thức có thể chuyển giao; sản phẩm hóa cần bằng chứng tái hiện qua môi trường độc lập + khử nhạy cảm + điểm đến và chủ sở hữu + đường phát hành bình thường; đừng tạo ra sự phụ thuộc.

### 5.2 Những câu trích quan trọng (đáng ghi nhớ)

- "Tokens are an input. Autonomy is a design choice. Accepted outcomes are the product." (**Tokens là đầu vào, quyền tự chủ là một lựa chọn thiết kế, kết quả được chấp nhận mới là sản phẩm.**)
- "Start with the work and the accepted outcome—not with a model or agent topology." (**Bắt đầu từ công việc và kết quả được chấp nhận, chứ không phải từ mô hình hay cấu trúc liên kết agent.**)
- "Capability does not grant authority." (**Năng lực không trao quyền hạn.**)
- "The model may propose. Trusted software authorizes and commits. A source-of-truth readback proves the result." (**Mô hình có thể đề xuất; phần mềm đáng tin cậy ủy quyền và cam kết; đọc lại nguồn sự thật chứng minh kết quả.**)
- "AI has an accounting problem." (**AI có một vấn đề kế toán.**)
- "The system producing the work should not be the sole judge of whether it succeeded." (**Hệ thống tạo ra công việc không nên là trọng tài duy nhất về việc nó có thành công hay không.**)
- "A workaround is not automatically domain expertise." (**Cách xử lý tạm không tự động bằng chuyên môn miền.**)
- "A more capable model will not repair an undefined task." (**Mô hình mạnh hơn sẽ không sửa chữa một nhiệm vụ chưa được định nghĩa.**)
- "The point is not to use more AI. The point is to make the outcome worth the system required to produce it." (**Điểm mấu chốt không phải dùng nhiều AI hơn, mà là làm cho kết quả xứng đáng với hệ thống cần thiết để tạo ra nó.**)

### 5.3 Kết nối với các bài phân tích chuyên sâu khác trên trang (bước tiếp theo cho người đọc)

- **Graph Engineering Guide (2026)** (`graph-engineering-guide-2026-analysis`): kỹ thuật đồ thị bàn về "khi nào dệt agent thành đồ thị"; fde-guide trả lời câu hỏi sớm hơn — **trước tiên quyết định quy trình làm việc này có xứng đáng trở thành hệ thống không, cơ chế được chọn thế nào, kết quả được nghiệm thu ra sao**. Hai bài bổ trợ cho nhau: đồ thị là lựa chọn cấu trúc, FDE Guide là tiền đề giá trị và quản trị.
- **The Art of Loop Engineering (LangChain chính thức)** (`loop-engineering-langchain`): LangChain bàn về "xếp chồng vòng lặp" (vòng lặp agent/xác minh/sự kiện/leo đồi); fde-guide cung cấp **sổ cái và cổng** đi kèm — mỗi lớp vòng lặp đều phải có kết quả được chấp nhận, người xác minh, ranh giới quyền hạn và toàn bộ chi phí.
- **Loạt bài Loop Engineering** (`loop-engineering-*`): vòng lặp là hình thái chạy; fde-guide nhấn mạnh "quyền tự chủ là một lựa chọn thiết kế" — vòng lặp, đồ thị, agent đều là lựa chọn cơ chế, hãy chọn cơ chế tối giản đủ dùng.

---

## Tài liệu tham khảo

- Trang dự án: `https://github.com/davidahmann/fde-guide` (Apache-2.0, David Ahmann)
- The Guide (hướng dẫn ngắn gọn): `guide/README.md` — trách nhiệm FDE, vòng giao hàng 7 giai đoạn, hợp đồng giá trị, bảng chọn cơ chế, thiết kế hệ thống tám lớp, lát cắt có kiểm soát, ba câu hỏi đánh giá, bàn giao vận hành, học hỏi hiện trường
- The 12 Factors of AI Value Engineering: `library/14-twelve-factors-ai-value-engineering.md` — 4 cổng cứng + chấm điểm 0/1/2 + công thức giá trị ròng dự kiến/đã hiện thực
- Software Architecture and Intelligence Selection: `library/12-software-architecture-and-intelligence-selection.md` — bảng quyết định cơ chế, thiết kế hệ thống hỗn hợp, đường cơ sở Beyond Twelve-Factor, nguyên tắc bất khả xâm phạm và phản mẫu kiến trúc
- Ví dụ ghi có kiểm soát: `examples/invoice-exception/README.md` — mô hình đề xuất/phần mềm đáng tin cậy ủy quyền cam kết/đọc lại nguồn sự thật; danh sách bất biến hiệu quả
- Ví dụ hệ thống hỗn hợp: `examples/shipment-risk-triage/` — ML cổ điển + định tuyến tất định + giải thích mô hình tùy chọn + xem xét thủ công
- Tài sản quản trị: `AGENTS.md` (hợp đồng làm việc), `catalog.json` (sổ đăng ký hiện vật), `llms.txt` (chỉ mục điều hướng máy), `controls/control-catalog.json` (yêu cầu sản xuất được quản trị)
- Đọc liên quan (trang này): *Graph Engineering Guide (2026) phân tích chuyên sâu*, *The Art of Loop Engineering phân tích chuyên sâu (LangChain chính thức)*, *Loạt bài Loop Engineering phân tích chuyên sâu*
