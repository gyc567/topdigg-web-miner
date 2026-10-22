---
title: "DeepSeek-Bot: Phân tích chuyên sâu — Biến DeepSeek Harness thành một đội AI có ký ức dài hạn"
date: "2026-10-22"
description: "Phân tích DeepSeek-Bot: đội AI Bot lâu dài trên DeepSeek Harness, cây bàn giao, phân quyền 3 cấp, ký ức dài hạn và hướng dẫn triển khai."
author: "瑞哥观势"
tags:
  - DeepSeek
  - Multi-Agent
  - AI Agent
  - Mã nguồn mở
  - Quản lý ngữ cảnh
  - Ký ức dài hạn
categories:
  - Phân tích dự án mã nguồn mở
  - AI Agent
---
# Phân tích chuyên sâu DeepSeek-Bot: Biến DeepSeek Harness thành một đội AI có ký ức dài hạn

## Dẫn dắt: Một câu hỏi bị hỏi quá nhiều lần

Khi dùng các công cụ lập trình AI, gần như ai cũng từng gặp cùng một kịch bản:

Bạn bảo nó viết một tính năng, nó viết được một nửa, bạn nói "khoan, chỗ này không đúng", nó sửa; sửa xong bạn nói "vẫn còn vấn đề", nó lại sửa tiếp. Đến lượt thứ bảy, bạn nhận ra nó đã quên mất yêu cầu đầu tiên của bạn, cả luồng tư tưởng bắt đầu trôi dạt.

Thế là chúng ta nghĩ ra đầy đủ các mả vá: viết system prompt dài hơn, mỗi lượt lại dán thủ công ngữ cảnh, cứ vài lúc lại tạo một phiên chat mới, bảo model tự tóm tắt... mỗi mả vá lại sinh ra mả vá khác.

Dự án DeepSeek-Bot, xét bản chất, cũng đang làm đúng việc đó, nhưng lời giải của nó không phải là "vá cho một Agent", mà là **đổi một tầng trừu tượng**: không còn coi AI là một phiên chat liên tục, mà coi nó là một **thành viên trong đội có danh tính, có ký ức, có đồng nghiệp**.

Đây chính là điều đáng nghiên cứu nhất của dự án.

---

## Một: Giới thiệu dự án: Nó thực chất là gì

**DeepSeek-Bot (gọi tắt DS Bot)** là một tiện ích và ứng dụng desktop được xây dựng trên nền [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) (DSH). Định nghĩa chính thức của nó chỉ cần một câu:

> Một đội Bot cư trú lâu dài.

### 1.1 Hai hình thức

| Hình thức | Mô tả |
|---|---|
| Plugin `ds-bot` | Plugin DSH tiêu chuẩn, chạy trong DSH Desktop và DSH Web. Toàn bộ năng lực Bot nằm ở đây |
| Ứng dụng desktop DS Bot | Mở ra là chính là DS Bot. Đi kèm DSH đã ghim phiên bản, profile và thư mục dữ liệu riêng, sẽ nhập các đội đã có sẵn của bạn trong DSH và cài các tiện ích tương thích với DSH, hình thành hệ sinh thái tiện ích riêng |

Hai hình thức chạy **cùng một mã nguồn** tiện ích `ds-bot`. Ý nghĩa của ứng dụng desktop là: DS Bot tự nắm quyền profile, giao diện và phiên bản DSH, không còn bị giao diện dùng chung và cài đặt toàn cục của DSH ràng buộc.

### 1.2 Mười yêu cầu cốt lõi (tầm nhìn chính thức)

Dự án liệt kê mười yêu cầu cốt lõi trong `docs/vision.md`, về cơ bản đây chính là hiến pháp thiết kế của nó:

1. **Xây dựng trên DSH, độc lập với nhau.** Mỗi Bot đều dựa trên DSH, các Bot không ảnh hưởng lẫn nhau.
2. **Đáng tin cậy.** Bot phải bám sát mục tiêu, hành động dựa trên bằng chứng, không vượt ranh giới, kết quả có thể kiểm chứng.
3. **Ký ức và tính bền vững.** Bot có ký ức dài hạn. Có thể đọc ký ức của Bot khác nhưng không sửa được (chỉ Main Bot mới sửa được), nhóm chat dùng chung một phần ký ức.
4. **Phân cấp quyền.** Main Bot có quyền cao nhất (tạo, sửa các Bot khác), các Bot còn lại không có các quyền này. Chỉ người dùng mới xóa được Bot.
5. **Nhóm chat.** Nhóm chat là hình thức chính để các Bot cộng tác, có thể có Bot quản trị, mặc định Bot quản trị trả lời tin nhắn của người dùng.
6. **Thư mục làm việc.** Mỗi Bot có thư mục làm việc riêng, nhóm chat có thể đặt một thư mục chung cho tất cả thành viên.
7. **Trình duyệt.** Mỗi Bot có trình duyệt riêng, không ảnh hưởng lẫn nhau.
8. **Giao diện và hiệu ứng động.** Giao diện được đánh bóng kỹ, hiệu ứng động mượt mà.
9. **Ứng dụng độc lập.** DS Bot phải trở thành một ứng dụng độc lập, không nhượng quá nhiều cho DSH.
10. **Agent cục bộ.** Có thể đưa agent CLI cục bộ vào dùng như Bot (đang trong kế hoạch).

### 1.3 Quy mô dự án

| Chỉ số | Giá trị |
|---|---|
| Giấy phép | Apache 2.0 |
| Phiên bản hiện tại | v0.2.0 (phát hành ngày 2026-10-21) |
| Phụ thuộc DSH | 0.2.1-rc.2 |
| Mã nguồn phía host | 106 tệp, khoảng 12.500 dòng |
| Mã nguồn phía client | khoảng 14.400 dòng |
| Unit test | 93 tệp test |
| Tài liệu thiết kế | 11 bản thiết kế tiếng Trung (`docs/plans/`) |
| Vấn đề đã biết | 3 vấn đề (`docs/known-issues.md`) |

**Hãy chú ý tỷ lệ này: hơn 900 dòng tài liệu thiết kế, 27 nghìn dòng mã nguồn.** Chính tỷ lệ đó đã là một tín hiệu — độ phức tạp của dự án không nằm ở chỗ viết mã, mà nằm ở chỗ làm rõ "rốt cuộc các Bot nên cộng tác với nhau như thế nào".

---

## Hai, Triết lý thiết kế: Sáu tư tưởng mà tôi thực sự thấy là hay

Phần dưới đây là phần lõi của bài viết. Rất nhiều thiết kế trong tài liệu dự án, đọc xong tôi phải gõ bàn gõ khen ngợi.

### Tư tưởng một: Quản lý ngữ cảnh — không phải "nén" cũng không phải "cắt", mà là "phán đoán"

**Vấn đề**: Bot là dài hạn. Người dùng trò chuyện với một Bot trong vài tuần, vài tháng, ngữ cảnh chắc chắn sẽ đầy. Hai cách làm phổ biến đều không đúng:

- **Nén lặp đi lặp lại cùng một phiên chat**: bản tóm tắt của bản tóm tắt ngày càng mơ hồ, chi tiết bị mất đi không tìm lại được.
- **Đến giới hạn thì cứng cắt sang phiên mới**: công việc đang làm dở bị cắt ngang, Bot như bị mất ký ức.

**Cách làm của DS Bot**: một Bot là **một định danh dài hạn không đổi**, các cuộc hội thoại của nó được tạo thành từ nhiều đoạn DSH Session. Khi sắp đầy, hãy gọi một "quản lý ngữ cảnh" (context steward) nhẹ, bảo nó đọc các tin nhắn gần đây và phán đoán một điều:

> Công việc đã tạm kết thúc một chặng, hay vẫn còn đang tiếp?

- **Vẫn đang tiếp** → nén ngay tại chỗ thành một "checkpoint": một bản tóm tắt bàn giao + nguyên văn các tin nhắn gần đây của người dùng. Công việc tiếp tục, không bị gián đoạn.
- **Đã kết thúc một chặng** → Bot tự viết một ghi chú bàn giao, chuyển sang một đoạn mới để tiếp tục.

**Chỗ nào của thiết kế này thú vị?**

Quản lý ngữ cảnh không dựa vào việc đếm token, mà dựa vào **phán đoán ngữ nghĩa**. Nó được yêu cầu rõ ràng là "đối chiếu từng mục xem người dùng muốn gì và Bot thực sự làm gì, có câu hỏi nào Bot đã hỏi mà người dùng chưa trả lời không". Ngay cả khi Bot tự nói "Tôi đã xong", nếu còn một mục con chưa hoàn thành thì vẫn bị phán đoán là "vẫn đang tiếp".

Còn một quy tắc đặc biệt nghịch lý nhưng đặc biệt đúng:

> **Càng nén nhiều lần, càng nên coi một khoảng dừng hợp lý là đã kết thúc một chặng.** Bởi vì bản tóm tắt của bản tóm tắt tổn thất càng lớn.

Đây là cách hiểu có định lượng về "tổn thất do nén", cao tay hơn nhiều so với loại phán đoán trực giác kiểu "mỗi lần nén mất một chút".

**Cảm giác của người dùng**: hoàn toàn không nhận ra gì. Không có thông báo "ngữ cảnh đã dùng 80%", cũng không có công cụ "chuyển phiên". Bạn luôn thấy một dòng chat liên tục.

**Chi tiết kỹ thuật** (chính những chi tiết này quyết định đây không phải một dự án chỉ có slide PPT):

| Hạng mục | Giá trị |
|---|---|
| Cửa sổ W | `contextWindow` do mô hình khai báo, nếu không khai báo thì lấy 500,000 |
| Dung lượng khả dụng U | W trừ phần dành cho câu trả lời (`maxTokens`), không ít hơn W/2 |
| Vạch cứng H | 0.95 × U |
| Vạch kiểm tra C | `checkRatio` × U (mặc định 0.8), không vượt quá H |
| Số tin nhắn quản lý ngữ cảnh đọc | khoảng 6,000 token gần nhất, mỗi tin dài tối đa 1,500 ký tự |
| Đầu ra của quản lý ngữ cảnh | một dòng JSON: `{"action":"switch"|"compact","reason":"…"}` |

**Trong code không có con số token nào bị hard-code**, tất cả đều đi theo mô hình. Đây là sự kiên trì đến mức cực đoan của "không viết cứng số cho một mô hình cụ thể".

**Một chi tiết an toàn**: nếu quản lý ngữ cảnh thất bại hoặc không trả lời được, thì chuyển sang đoạn khác luôn. Không đoán.

### Tư tưởng hai: Cây bàn giao — biến "chuỗi tin nhắn" thành "cây công việc"

Đây là thiết kế đơn điểm mà tôi cho là **có giá trị nhất trong toàn bộ dự án**.

**Vấn đề**: việc phân công giữa các Bot, ban đầu được chặn theo số lượng. Kết quả là gì?

- **Bot không nhìn thấy đối phương đang làm gì.** `list_bots` chỉ cho tên, vai trò, mô hình, thư mục. Gửi liên tiếp 5 tin nhắn, 5 tin "đã gửi", 0 tin trả lời.
- **Bị từ chối gửi khi đối phương chưa đọc.** Khi đối phương dồn 10 tin chưa đọc thì từ chối gửi thẳng, nhưng người gửi không hiểu vì sao.
- **Chặn theo số lượng không phân biệt bình thường và luồn quanh.** Chuỗi tin nhắn cắt ở 6 bước, sau lượt phát biểu gần nhất của người dùng toàn bộ nhóm tối đa 40 tin, Bot trong một nhóm chat khởi động tối đa 3 vòng. Kết quả là: một chuỗi phân công dài, mỗi bước đều đổi người và đều có kết quả, bị cắt ở bước thứ 7; còn vòng A→B→A thì phải đi đủ 6 bước mới dừng.

**Lời giải của DS Bot: mô hình hóa "công việc" thành một cái cây.**

> Việc được giao ngược từ dưới lên chưa quay lại thì phần trả lời ở trên cũng chưa giao; khi dưới cùng đã giao hết, trên tiếp tục làm, xong thì giao kèm cả kết quả bên dưới lên trên.

**Kết quả tự đi lên trên.** Bot không cần bù tin nhắn cho phía trên, do đó **không cần dựa vào số bước, số tin để chống luồn quanh**. Vậy nên:

> **Chuỗi tin nhắn 6 bước nhảy, 10 tin chưa đọc của đối phương, Bot trong một nhóm chat tối đa mở 3 vòng, 40 tin toàn nhóm sau lượt phát biểu gần nhất của người dùng — tất cả đều bị bỏ đi, không để lại bản dự phòng nào.**

Đây là quyết định táo bạo nhất mà cũng đúng nhất trong toàn bộ tài liệu thiết kế. **Giới hạn chưa bao giờ là lời giải, chỉ là miếng băng vết thương che giấu vấn đề.** Một khi cấu trúc đã đúng, rất nhiều hạn chế không còn cần thiết.

Đi kèm thiết kế này, còn hai việc nữa:

**1. Trạng thái là công dân hạng nhất.** Trạng thái của mỗi Bot thuộc một trong năm loại: chờ người dùng phê duyệt / đang chuyển sang phiên mới / đang làm việc / đang chờ Bot khác / rảnh. `list_bots` cho ra tất cả trong một lần, kèm số tin nhắn chưa đọc và trạng thái thẻ câu hỏi.

**2. Chỉ chặn một loại tin nhắn.** Duy nhất bị từ chối là tin nhắn "gửi cho Bot đang chờ kết quả của công việc này" — bởi vì kết quả sẽ tự động được giao ngược lại, gửi đi vừa là luồn quanh vừa thừa. Tất cả những loại khác đều được phép, cùng một Bot xuất hiện bao nhiêu lần trong một công việc cũng được (chuỗi bàn giao giữa các khâu thiết kế, thẩm định, làm lại, nghiệm thu).

**Gộp tin nhắn chưa đọc thành một**: khi tin nhắn X gửi cho Y mà Y chưa đọc, X lại gửi thêm một tin (cùng một công việc), thì gộp thành một. Nhờ vậy **trong hộp thư mỗi người gửi có tối đa một tin chưa đọc**, nguyên nhân gốc của việc dồn nén bị loại bỏ, và do đó giới hạn cũng không còn cần thiết.

### Tư tưởng ba: Ba cấp quyền — tách hoàn toàn quyền theo vai trò và quyền sandbox

Đây là chỗ nhiều dự án nhiều Agent làm cho nhoè, còn DS Bot phân tách rất sạch.

**Hai lớp quyền độc lập với nhau**:

- **Quyền theo vai trò**: ai được quản lý Bot, nhóm chat và ký ức của nhóm. **Do DS Bot tự kiểm tra.**
- **Quyền sandbox**: một Bot được phép chạm vào những gì bằng công cụ (đọc file, sửa file, chạy lệnh). **Dùng bộ thiết lập quyền do DSH cung cấp, do DSH thực thi.**

| Ai | Phạm vi | Được làm gì |
|---|---|---|
| Người dùng | Toàn bộ | Mọi thao tác, gồm đặt/hủy Main Bot, đặt quyền sandbox |
| Main Bot | Toàn nhóm | Tạo Bot, sửa bất kỳ Bot nào, dừng lượt của Bot khác; tạo/sửa/xóa nhóm chat; ghi ký ức đội; đọc/ghi ký ức của Bot khác; gắn/gỡ khả năng |
| Quản trị viên nhóm chat | Nhóm chat mình quản lý | Sửa nhóm chat của mình; phát biểu trong nhóm; ghi ký ức đội. Không xóa nhóm, không sửa thư mục làm việc của nhóm |
| Bot thường | Bản thân | Sửa tên, vai trò, màu, mô hình, thư mục làm việc, chỉ dẫn của mình; tự gắn/gỡ khả năng; phát biểu trong nhóm chat, `@` nhắc tên; gửi tin nhắn cho bất kỳ Bot nào qua `message_bot` trong chat riêng |

**Ba chi tiết thiết kế cực kỳ quan trọng**:

1. **Chỉ người dùng mới đặt được quyền sandbox.** Mọi thay đổi do Bot khởi xướng đều bị từ chối, `update_bot` và `update_group` đều không có tham số này. Bot không thể tự nâng quyền cho mình.
2. **Khi vượt quyền thì báo cho Bot biết phải làm gì**, thay vì chỉ báo lỗi đơn giản. Công cụ trả về "chỉ Main Bot mới tạo được Bot, hãy nhờ Main Bot làm" — để Bot tự chuyển hướng, chứ không bị treo.
3. **"Toàn quyền" trên giao diện luôn hiện bằng chữ màu đỏ**, và còn phải xác nhận thêm một lần nữa.

### Tư tưởng bốn: Ba tầng ký ức — ngữ cảnh quản lý "lần này đang làm gì", ký ức quản lý "cần nhớ gì qua các cuộc trò chuyện"

Hai đường này được tách rất rõ:

| | Ngữ cảnh | Ký ức |
|---|---|---|
| Quản lý cái gì | Lần trò chuyện này đang làm gì | Những gì cần nhớ qua tất cả các cuộc trò chuyện |
| Ai bảo trì | Quản lý ngữ cảnh (phán đoán nén/chuyển đoạn) | Mô hình sắp xếp (sau khi mỗi đoạn trò chuyện rảnh) |

**Thiết kế cốt lõi của ký ức**:

**Ba tầng phạm vi**:
- Mỗi Bot có ký ức riêng
- Mỗi nhóm chat có ký ức nhóm, **chỉ đọc được trong nhóm này**
- Ký ức đội, tất cả Bot đều đọc được

**"Thứ nói trong nhóm thì ở lại trong nhóm"**: ký ức nhóm chỉ đi vào các phiên chat nhóm của thành viên nhóm đó, không đi vào chat riêng của họ, cũng không đi vào nhóm khác hay Bot ngoài nhóm. Khi một thành viên bị gỡ khỏi nhóm thì lập tức không đọc được và cũng không ghi được.

**Ký ức không thể chỉ dựa vào việc Bot nhớ ra để gọi.** Sau mỗi đoạn trò chuyện rảnh sẽ có một lần "sắp xếp ký ức" tự động, do mô hình đọc phần nội dung mới của đoạn trò chuyện đó, rồi giữ lại, sửa hoặc xóa các mục như người ta sau khi nói chuyện xong. Chat riêng do mô hình của chính Bot đó sắp xếp và ghi vào ký ức của nó; nhóm chat **được sắp xếp một lần cho cả nhóm** (không phải mỗi thành viên sắp xếp một lần), dùng mô hình của quản trị viên, và chỉ ghi vào ký ức nhóm.

**Định dạng cực gọn**: giữ nguyên định dạng Markdown của Agent MemoryRepo, mỗi dòng một mục, cuối dòng có `[source: …; added: …]`.

**Giới hạn cố định về kích thước** (ký tự): một mục 300, `MEMORY.md` 4,000, một chủ đề 16,000, một phạm vi 40 chủ đề. Vượt giới hạn thì báo lỗi ngay và chỉ bạn cách dọn chỗ.

**An toàn**: ký ức là dữ liệu, không phải chỉ dẫn. Các mục trông giống khóa bí mật sẽ bị từ chối; Bot được nhắc rõ ràng không lưu trang web, tệp tin hay kết quả công cụ "yêu cầu nó nhớ".

**Thân thiện với bộ nhớ đệm** (chi tiết này rất chuyên nghiệp): khi render lần đầu của mỗi Session, phần ký ức được đóng băng lại, từ đó prompt giữ nguyên **từng byte một**, để bộ nhớ tiền tố của nhà cung cấp có thể trúng. Chỉ khi chuyển đoạn hoặc tạo checkpoint (checkpoint vốn đã phá vỡ bộ nhớ đệm) mới đóng băng lại. Cái giá là "những mục được lưu sau khi một đoạn trò chuyện bắt đầu sẽ không xuất hiện trong prompt của đoạn đó" — nên prompt yêu cầu Bot rõ ràng: **trước khi trả lời "không biết", hãy gọi `recall` trước**.

**Không dùng git để quản lý ký ức**: file được sửa tại chỗ, `journal.jsonl` ghi lại mỗi lần thay đổi đã thay cái gì.

### Tư tưởng năm: Mô hình an toàn — web không đáng tin, khóa bí mật không được lộ

> **Trình duyệt do người dùng điều khiển, Bot chỉ có thể đọc. Giá trị của khóa bí mật chỉ do người dùng nhập và chỉ tồn tại trên máy này. Bot chỉ nhận được tên biến môi trường; trước khi giá trị rời khỏi máy, nó luôn được thay bằng một placeholder.**

Cụ thể ở mức hiện thực:

**Trình duyệt của Bot (chỉ DSH Desktop)**:
- Mỗi Bot một vùng lưu trữ riêng (`bot:<id>`), trạng thái đăng nhập không chia sẻ lẫn nhau
- `read_browser` đọc **DOM chứ không phải ảnh chụp màn hình**, chuyển thành Markdown, liên kết và điều khiển được đánh dấu thành `[#n]`
- **Chỉ đọc nội dung hiển thị được**: `display:none`, `visibility:hidden`, chiều cao bằng 0, nội dung `<details>` đang thu gọn đều bị bỏ qua
- **Tuyệt đối không đọc** mật khẩu, thẻ tín dụng (`autocomplete="cc-*"`), trường mã xác thực một lần
- Giới hạn cứng: 400 nghìn ký tự, 150 nghìn nút, mỗi bảng 5 nghìn dòng, 3 nghìn liên kết, 1,5 giây
- **Không thể bấm, không thể nhập, không thể cuộn, không thể mở địa chỉ**
- Nội dung trang luôn được **coi là dữ liệu, không bao giờ coi là chỉ dẫn**
- Địa chỉ siêu dữ liệu máy chủ đám mây (`169.254.x.x`) bị cấm truy cập — nó phát hành thông tin đăng nhập tài khoản

**Khóa bí mật**:
- Bot gọi `request_secret`, người dùng nhập vào thẻ trong chat riêng của mình, **Bot không bao giờ nhìn thấy giá trị**
- Giá trị lưu trong `secrets.json`, quyền 600, ghi bằng cơ chế nguyên tử, không vào `state.json`, không vào log
- Được tiêm vào qua biến môi trường `$DSH_SECRET_<NAME>`
- Trước khi lưu kết quả công cụ và trước mỗi lần gửi yêu cầu cho mô hình, toàn bộ giá trị đều được thay bằng `[secret:<NAME>]`
- Giá trị ngắn dưới 8 ký tự (PIN) chỉ bị thay khi "đứng độc lập", để tránh làm lỗi văn bản thường
- Cảnh báo thành thật, rõ ràng: **chỉ có bản sao chính xác mới bị che; một Bot biết mã hóa, chia nhỏ hoặc đảo ngược giá trị vẫn có thể in ra nó. Đừng giao những khóa bí mật quan trọng cho Bot bạn không tin tưởng.**

**Tìm kiếm trên mạng**:
- Tuyệt đối không mượn key của một tuyến khác (mỗi key đều được tính phí trên tài khoản của chính nó)
- Khi tìm kiếm gốc không khả dụng, lùi về cách không cần key (lấy trang kết quả công khai của Bing / DuckDuckGo rồi phân tích)
- Mỗi kết quả bắt đầu bằng `Search backend: …` để nói rõ đã đi qua tuyến nào
- Khi thất bại toàn bộ, báo cho mô hình **đừng đoán địa chỉ**

### Tư tưởng sáu: Thẻ hiển thị — bác bỏ "mô hình tự viết HTML"

Đây là một phương án được chốt sau khi bị hội đồng đánh giá bên ngoài bác bỏ hai lần, đáng để nói riêng, vì nó đại diện cho một **tư duy thiết kế an toàn hiện đại**.

**Phương án thứ nhất**: mô hình viết HTML, render trong iframe. **Bị bác bỏ.** Lý do:

- HTML tùy ý không có chiến lược serialize nén: quản lý ngữ cảnh và gói bàn giao hoặc vỡ tung, hoặc mất sạch
- iframe trong cuộn ảo của chat bị tháo bỏ là mất luôn trạng thái bên trong
- **Script do mô hình sinh ra có thể tự động submit, gây ra vòng lặp vô hạn cướp lượt xử lý**
- Mở route GET cho nội dung widget và thiết lập CSP đòi hỏi khả năng chưa được DSH tài liệu hóa, rủi ro do tiện ích gánh chịu

**Phương án thứ hai (đang áp dụng)**: **không thực thi code do mô hình sinh ra.**

> Mô hình chỉ chọn thành phần từ một danh mục thành phần cố định rồi điền dữ liệu, việc render dùng chính thành phần của DS Bot. **An toàn đến từ "không có thực thi mã", chứ không dựa vào sandbox.**

Danh mục thành phần phiên bản đầu có 8 mục: `stack` (vùng chứa dọc theo chiều dọc), `text` (văn bản Markdown), `metric` (chỉ số), `table` (bảng chỉ đọc), `options` (lựa chọn), `confirm` (xác nhận), `form` (biểu mẫu ngắn), `progress` (ảnh chụp tiến độ).

Giới hạn cứng: 8 KiB sau khi serialize, cây thành phần sâu 8 tầng, 64 nút, bảng 50 dòng 8 cột, form 6 trường, options 8 lựa chọn.

**Một lần submit là chốt cả thẻ**, các đầu vào của thành phần khác chưa submit bị loại bỏ. **Thẻ hiển thị không đưa vào nhóm chat** (cùng câu nhắc với `ask_user`).

> **Bản chất thay đổi của thiết kế an toàn**: từ "nhốt code không đáng tin vào lồng", thành "đơn giản là không cung cấp cái lồng nào".

---

## Ba, những chi tiết khác đáng nói

### 3.1 Nhóm chat: mỗi lần chỉ một người nói

Ban đầu để các thành viên viết song song rồi kiểm tra tin nhắn mới trước khi gửi, **kể cả đếm số cũng bị loạn**: mô hình sẽ cứ dùng con số đã loạn để gửi. Giao việc sắp xếp cho mô hình làm không ổn.

Kết luận: **trong nhóm chỉ một người nói mỗi lượt**, mỗi thành viên khi mở miệng đều đọc được trạng thái mới nhất của nhóm.

Có hai cách trả lời:
- **Quản trị viên trả lời trước** (mặc định với nhóm mới): tin nhắn thường không có `@` chỉ được gửi cho quản trị viên, quản trị viên dùng `@tên` để gọi người. **Đây là cân nhắc chi phí** — mỗi lần gọi một thành viên là phải mang theo toàn bộ ngữ cảnh hội thoại của nó để chạy mô hình một lần, chi phí tăng tuyến tính theo số người phát biểu, hệ số rất lớn. Vậy nên mặc định gọi ít người.
- **Mọi người luân phiên**: các thành viên trả lời theo thứ tự, quản trị viên đi trước.

Phần hiển thị tiến độ làm rất tốt: sau khi thành viên gọi công cụ lần đầu, nếu 15 giây sau vẫn đang làm việc thì lượt này cứ đi tiếp, không đợi nó nữa; nhưng câu đầu tiên nó nói trong lúc làm việc cùng những câu có `@` **được gửi ngay vào nhóm** (mấy câu cách nhau chưa tới 30 giây được gộp thành một). Kết quả do Bot được giao việc tiếp nhận.

### 3.2 Tin nhắn dài: tệp nóng chỉ chứa dữ liệu có giới hạn

Trước đây toàn bộ tin nhắn giữa các Bot được lưu nguyên đoạn vào `state.json`, mà `state.json` mỗi lần lưu đều ghi lại toàn bộ. Một tin `message_bot` dài 5 triệu ký tự làm nó phình lên 6,5 MB, sau đó **đổi màu cũng phải ghi lại nhiều như vậy**.

Bây giờ:
- `state.json` chỉ lưu 2.000 ký tự đầu + tổng độ dài + toàn văn nằm ở đâu
- Tin nhắn vượt quá 20.000 ký tự **được lưu nguyên văn thành tệp đính kèm DSH** (định danh theo nội dung, nội dung giống nhau chỉ lưu một bản)
- Trong tin nhắn chỉ giữ lại một câu mô tả, 1.000 ký tự đầu và một khối tệp
- Các dòng dài của lịch sử nhóm được đặt ở `bot/group-lines/<nhóm>/<seq>.txt`; khi dòng bị đẩy ra khỏi 60 dòng gần nhất hoặc nhóm bị xoá thì tệp cũng bị xoá theo

### 3.3 Sổ nợ nhượng bộ của DSH: một cuốn sổ trung thực hiếm có

`docs/plans/2026-10-13-dsh-concessions.md` ghi lại 14 khoản "thỏa hiệp vì chính những giới hạn của DSH". Mỗi khoản nêu rõ: ngày, Issue/PR liên quan, **giới hạn của DSH**, **cách làm hiện tại**, **đánh đổi**, **sau khi có ứng dụng desktop thì xử lý thế nào**.

Ví dụ vài khoản:

| # | Giới hạn của DSH | Cách làm hiện tại | Đánh đổi |
|---|---|---|---|
| C1 | Dưới preset PTC, mô hình chỉ có thể gọi trực tiếp `run_code`, một lần chạy chương trình tối đa khoảng 10 phút | Cả phần hiển thị công cụ lẫn phía máy chủ đều duyệt các lệnh gọi con | Mọi chức năng liên quan tới công cụ đều phải xử lý cả lệnh gọi cấp cao nhất lẫn lệnh gọi con |
| C2 | Lệnh được đăng ký toàn cục, không thể lọc theo từng phiên chat | Phiên chat của Bot nhìn chung không hỗ trợ goal | `/goal` vẫn xuất hiện trong menu lệnh nhưng không dùng được |
| C5 | patch không có cú pháp điều kiện; bộ chọn của tìm kiếm web không lùi về mặc định khi id chưa được đăng ký | Chỉ viết tài liệu | Khi tắt `web-search-auto` bắt buộc phải sửa cả `web.searchProvider`, nếu không `web_search` của **mọi phiên chat** sẽ hỏng |
| C7 | CSS của các tiện ích khác có thể ghi đè ds-bot; ds-bot phụ thuộc vào tên lớp riêng của DSH | Vài thuộc tính bố cục thêm `!important` | Mỗi lần DSH đổi cấu trúc hoặc đổi giao diện đều có thể phá vỡ bố cục |
| C11 | Khi luồng của mô hình bị treo không có watchdog, lượt sẽ không kết thúc | Các yêu cầu chưa đọc được gộp thành một, trạng thái nhìn thấy được | Bot bị treo phải để người dùng tự dừng |

**Khi phân biệt một Issue là bug của DS Bot hay là giới hạn của DSH, hãy xem bảng này trước.** Loại tài liệu như vậy cực kỳ hiếm trong các dự án mã nguồn mở, và đây cũng là một trong những bằng chứng cho thấy chất lượng dự án này cao nhất mà tôi từng thấy.

### 3.4 Quy tắc cứng: năm điều

`AGENTS.md` ở thư mục gốc dự án đặt ra năm quy tắc cứng cho các tác nhân mã hóa AI, tôi trích lại (đã dịch):

1. **Xây dựng trên nền DSH; không bao giờ vá lỗi.** Tuyệt đối không sửa DeepSeek Harness, cũng không phụ thuộc vào các tệp bên trong thư mục cài đặt của DSH. **Nếu DSH thiếu một năng lực nào đó, hãy dừng lại và nói rõ; đừng lách bằng cách vá lỗi.**
2. **Không mang theo bí mật.** Tuyệt đối không ghi, in ra hay commit API key, token, cookie hoặc nội dung của `DSH_HOME`.
3. **Chỉ dùng tài liệu gốc.** Không sao chép mã, văn bản, biểu tượng, logo hay hình ảnh từ sản phẩm hoặc website khác.
4. **`client.js` là sản phẩm sinh ra.** Hãy sửa `src/client/`, rồi chạy `npm run build`, tuyệt đối không sửa tay.
5. **Không đụng vào dữ liệu DSH của chính người dùng.** Chỉ import ở chế độ chỉ đọc từ `~/.dsh`, tuyệt đối không ghi vào đó.

Quy tắc 1 và quy tắc 3 đáng đồng cảm đặc biệt. **"Nếu DSH thiếu một năng lực nào đó, hãy dừng lại và nói rõ"** — câu này đằng sau là sự kiềm chế.

### 3.5 Quy trình đánh giá tài liệu thiết kế của chính dự án

Các bản thiết kế trong `docs/plans/` có yêu cầu định dạng rất rõ ràng: **tại sao / hành vi đã chốt / không làm gì / giới hạn đã biết / thay đổi**.

Mục "**không làm gì**" là thứ nhiều tài liệu thiết kế dự án thiếu nhất. Ví dụ:

- Nhóm chat: **không** làm việc phát biểu song song rồi mới kiểm tra xung đột; **không** làm thảo luận nhiều lượt kiểu "luân phiên cho tới khi không ai nói nữa"; **không** để thành viên giữ chỗ phát biểu với một nhiệm vụ dài
- Giao việc: **không** ghi trạng thái vào system prompt (để giữ cache); **không** chủ động báo cho Bot được giao việc rằng "đối phương bị kẹt" (mỗi lần thông báo sẽ khiến Bot được giao việc phải chạy mô hình thêm một lần); **không** đặt trần giới hạn dự phòng cho tổng số lượt, độ dài chuỗi hay số vòng
- Ký ức: **không** báo cho Bot hay người dùng biết ngữ cảnh đã chiếm bao nhiêu; **không** cung cấp công cụ để Bot đổi đoạn; **không** dùng git để quản lý ký ức
- Thẻ hiển thị: **không** render HTML/JS do mô hình sinh ra; **không** đưa iframe vào; **không** tự dựng MCP Apps host

Hơn nữa, bản thiết kế còn phải trải qua **nhiều vòng đánh giá từ bên ngoài và có chữ ký**. Bản ghi thay đổi của bài về widget-views ghi:

> 2026-10-20: bản nháp đầu tiên (danh mục khai báo, bản thứ hai). Đánh giá: Antigravity bác bỏ phương án iframe bản một; Codex lần một (ship with changes)…… lần hai (ship with changes)…… lần ba ký (ship, không cần sửa thêm).

**Cho các AI khác nhau đánh giá cùng một bản thiết kế và ghi lại ý kiến chỉnh sửa của từng vòng.** Đây là lần đầu tiên tôi thấy ở các dự án mã nguồn mở.

---

## Bốn, tổng kết: sáu nhận định của tôi

### Nhận định một: đây là tư duy "sản phẩm hóa Agent" chứ không phải "điều phối Agent"

Đa số các framework đa Agent trên thị trường (AutoGen, CrewAI, LangGraph…) quan tâm đến **làm sao để chia nhỏ tác vụ, chạy song song, tổng hợp lại**. Giả định ngầm ẩn của chúng là: tác vụ là một lần, ngữ cảnh là ngắn, kết quả là thứ cần bàn giao.

DS Bot quan tâm đến **làm sao để một nhóm đồng nghiệp tồn tại lâu dài cùng làm việc**. Mọi thiết kế của nó đều hướng về mục tiêu đó:

- Danh tính cư trú lâu dài (không phải một task)
- Ký ức dài hạn (không phải ngữ cảnh dùng một lần)
- Cây bàn giao (không phải DAG của tác vụ)
- Nhóm chat (không phải worker chạy song song)
- Phân cấp quyền (không phải ai cũng bình đẳng)

**Đây là sự chuyển dịch từ "điều phối một quy trình" sang "vận hành một đội ngũ".** Trước đó tối ưu thông lượng, sau đó tối ưu tính bền vững.

### Nhận định hai: quyết định thiết kế quan trọng nhất là "xoá bỏ hạn chế", chứ không phải "thêm thật nhiều quy tắc"

Tôi đếm thử, các hạn chế mà DS Bot đã **xoá bỏ** trong quá trình tiến hoá:

- Cắt chuỗi tin nhắn ở bước nhảy thứ 6 → xoá
- Giới hạn 10 tin nhắn chưa đọc phía đối diện → xoá
- Bot được phát biểu tối đa 3 lượt trong một nhóm → xoá
- 40 tin nhắn toàn đội sau lần người dùng phát biểu gần nhất → xoá

Đồng thời, ràng buộc mà nó **thêm vào** chỉ có một: **không gửi tin nhắn cho Bot đang chờ kết quả của nhiệm vụ đó**.

**Hiệu ứng ròng là số ràng buộc giảm mạnh, mà độ tin cậy lại tăng lên.** Lý do rất đơn giản: thứ bị xoá là các hạn chế "mức triệu chứng" (đếm số), thứ được giữ lại là các ràng buộc "mức cấu trúc" (quan hệ chờ đợi).

Đó là mùi vị của một thiết kế hệ thống tốt — **ràng buộc nên đến từ cấu trúc của hệ thống, chứ không đến từ bộ đếm.**

### Nhận định ba: "quản lý ngữ cảnh" là không gian thiết kế mới do năng lực mô hình được nâng lên

Trong các cách xử lý ngữ cảnh dài truyền thống, "khi nào nén" là một **vấn đề kỹ thuật**, giải quyết bằng ngưỡng token.

Nhưng khi mô hình đủ thông minh, nó có thể **hiểu cấu trúc ngữ nghĩa của cuộc hội thoại** — "việc này đã xong chưa" là một câu hỏi ngữ nghĩa, không phải câu hỏi đếm số.

Vậy nên về mặt thiết kế đã xuất hiện một bước chuyển chất: DS Bot không còn hỏi "còn bao nhiêu ngữ cảnh", mà hỏi "**việc này đã tạm kết thúc chưa**".

Đây là phần có tiền đồ nhất mà tôi thấy trong toàn bộ dự án. **Nó giao một vấn đề kỹ thuật vốn mang tính tất định cho một mô hình không tất định để phán đoán, và thiết kế trọn vẹn một lớp dự phòng cho phán đoán đó (thất bại thì đổi đoạn).**

Tư duy tương tự cũng được áp dụng cho việc tổ chức ký ức: không phải để Bot quyết định có ghi nhớ hay không, mà là **mỗi đoạn hội thoại kết thúc sẽ tự động tổ chức lại một lần**. Hành vi của Agent không còn phụ thuộc vào việc nó "nhớ ra" phải làm một việc gì đó.

### Nhận định bốn: hướng tiếp cận về an toàn là "từ chối khả năng" chứ không phải "siết chặt quản lý"

So sánh hai hướng tiếp cận:

| Hướng tiếp cận | Ví dụ |
|---|---|
| Siết chặt quản lý | Cho mô hình chạy an toàn hơn trong sandbox; thêm CSP nghiêm ngặt hơn cho HTML; thêm kiểm tra nguồn chi tiết hơn cho iframe |
| **Từ chối khả năng** | **Ngay từ đầu không cung cấp khả năng cho mô hình viết HTML**; Bot **chỉ đọc** trình duyệt chứ không ghi; **giá trị bí mật không bao giờ đi vào ngữ cảnh của mô hình** |

Cách sau triệt để hơn và cũng nhẹ nhàng hơn. **DS Bot ở cả hai chỗ đều chọn cách sau**, và đều nêu rõ lý do ("sự an toàn đến từ việc không có thực thi mã, không dựa vào sandbox").

Đáng chú ý là nó không giả vờ mình không bao giờ có lỗ hổng. Cảnh báo thành thật trong phần về bí mật — "một Bot có thể mã hoá, chia nhỏ hay đảo ngược giá trị thì vẫn in ra được" — kiểu viết nói thẳng các giới hạn đã biết đáng tin hơn bất kỳ tuyên bố miễn trừ nào.

### Nhận định năm: khả năng đọc được bản thân nó là một phần của chất lượng kiến trúc

Nhìn vào vài thiết kế của nó:

- **`state.json` chỉ lưu 2.000 ký tự đầu.** Vì nó ghi lại toàn bộ mỗi lần lưu. Ràng buộc này đến trực tiếp từ "tệp nóng chỉ chứa dữ liệu có giới hạn".
- **Tin nhắn dài lưu thành tệp đính kèm.** Vì DSH có `ctx.attachments`, định danh theo nội dung, nội dung giống nhau chỉ lưu một bản.
- **Trạng thái không ghi vào system prompt.** Vì system prompt phải ổn định tuyệt đối từng byte thì mới tái sử dụng được cache tiền tố của nhà cung cấp.

Ba điều này trông như ba quyết định kỹ thuật rời rạc, nhưng đằng sau cùng là một nguyên tắc: **đặt dữ liệu ở chỗ phù hợp nhất.** Đối tượng lớn thì để trên hệ thống file, dữ liệu nóng thì để trong bộ nhớ, dữ liệu ngắn và xuất hiện nhiều thì để trong prompt.

**Sổ nợ nhượng bộ của DSH, mục known-issues, mục "không làm gì"** — tất cả cũng là cùng một điều: **viết lý do của các quyết định thiết kế ngay bên cạnh code, để người sau không phải tự suy lại từ đầu.**

### Nhận định sáu: đây là sự kết hợp giữa "dự án mã nguồn mở" và "sản phẩm", đáng lạc quan nhưng cần cảnh giác

Trước hết là những điều đáng lạc quan:

- Apache 2.0, mã nguồn đầy đủ, 93 tệp kiểm thử, CI chạy kiểm thử trên mọi PR
- 11 tài liệu thiết kế, mỗi bài đều có "tại sao" và "không làm gì"
- Có cả ba hình thức: ứng dụng desktop, tiện ích, ảnh Docker
- Tiến độ rất nhanh: từ 0.1.7 đến 0.2.0 chỉ cách nhau 5 ngày, nhưng thay đổi thì rất lớn

Cần cảnh giác:

- **v0.2.0, vẫn là bản xem trước.** Chính đội ngũ chính thức viết "Early release (v0.1). Features, tools and the saved data format can still change."
- **Ứng dụng desktop chưa được ký.** Windows SmartScreen sẽ cảnh báo, macOS lần chạy đầu cần mật khẩu quản trị để cho phép thủ công.
- **Trong known-issues có cả loại vấn đề cơ bản như "tiện ích không tải được"**, các bước khắc phục dài như một bài viết độc lập (xem `cordis.patch.yml`, chạy `--dump-config`, xoá thư mục profile).
- **Docker triển khai chỉ có một preset quyền: toàn quyền.** Vì sandbox kernel của chính DSH (bubblewrap / Landlock) không chạy được dưới seccomp mặc định của Docker. Trong kịch bản NAS, điều này có nghĩa là **bạn phải tự kiểm soát thủ công các thư mục được mount**.
- **Trong nhóm chat ở preset PTC với phiên cũ, một lượt dài nhất khoảng 10 phút** sẽ bị hủy.
- **Sau khi thư mục làm việc bị xoá hoặc đổi tên, tin nhắn sẽ bị nuốt mất** (DSH 0.2.1-alpha).

**Kết luận**: đây là một dự án mà **độ trưởng thành kiến trúc vượt xa số phiên bản**. Có thể yên tâm nghiên cứu và thử nghiệm, nhưng hãy đối xử với nó như một sản phẩm ở giai đoạn đầu, đừng coi như hạ tầng ổn định.

---

## Năm, Hướng dẫn đầy đủ: Triển khai một nhóm DS Bot từ số 0

### 5.1 Yêu cầu môi trường

| Mục | Yêu cầu |
|---|---|
| Ứng dụng desktop | Windows x64 hoặc macOS (chip Apple / Intel) |
| DSH Web | Node.js **22.19+**, pnpm |
| Docker | Docker 24+, Compose v2.24+, Linux x86-64 |
| Mô hình | DeepSeek API key, hoặc endpoint tương thích Anthropic-Messages khác |

### 5.2 Phương án A: Ứng dụng desktop (đơn giản nhất)

**Windows (x64)**:
1. Truy cập [Releases](https://github.com/Fei2411/DeepSeek-Bot/releases) để tải `DeepSeek-Bot-<version>-win-x64.exe`
2. Chạy trình cài đặt. **Chỉ cài cho người dùng hiện tại, không cần quyền quản trị**
3. Nếu Windows hiện thông báo "Windows đã bảo vệ PC của bạn", hãy nhấn vào **Thông tin thêm** → **Vẫn chạy**

**macOS**:
1. Với chip Apple tải `DeepSeek-Bot-<version>-mac-arm64.zip`, với Intel tải `mac-x64.zip`
2. Safari sẽ tự giải nén, hãy kéo **DeepSeek Bot** vào "Ứng dụng" và mở lên
3. Khi macOS báo "không thể kiểm tra ứng dụng": **Cài đặt hệ thống** → **Quyền riêng tư & Bảo mật** → **Vẫn mở** (cần mật khẩu quản trị)

**Khởi động lần đầu**:
1. Ứng dụng sẽ hỏi bạn hai điều: **đặt dữ liệu ở đâu** (mặc định `~/.ds-bot`), **đặt tệp của Bot ở đâu** (mặc định `~/DeepSeek Bot`)
   - Hai vị trí này không được lồng vào nhau, cũng không được nằm trong dữ liệu DSH của người dùng
2. Khi phát hiện bạn đã có sẵn đội trong DSH, nó sẽ hỏi có nhập không. **Chỉ hỏi một lần, việc nhập chỉ đọc DSH của bạn, không thay đổi byte nào**
3. Cấu hình một mô hình trong phần settings
4. Mở ra là thấy một Main Bot tên **Chief**. Nói chuyện với nó, nó sẽ dẫn bạn hoàn thành thiết lập

> **Lời khuyên cho người chơi lần đầu**: đừng vội tạo mười Bot. Trước tiên hãy chỉ trò chuyện với Chief để nó hiểu cách bạn làm việc, rồi nhờ nó tạo Bot chuyên trách đầu tiên.

### 5.3 Phương án B: Làm tiện ích của DSH

Trước tiên hãy cài DSH và cấu hình ít nhất một mô hình bên trong. **DS Bot dùng luôn mô hình của DSH.**

**DSH Desktop (Windows / macOS)**:
1. Ở thanh bên chọn **Plugins** → **Add plugin**
2. Ở **Package name or address** nhập `ds-bot`
3. **Người dùng tại Trung Quốc đại lục**: đặt **Registry** thành **Mainland China mirror**
4. Nhấn **Install**, rồi **Enable now**
5. Nếu có thông báo áp dụng từ lần khởi động tiếp theo, hãy **thoát hoàn toàn** DSH rồi mở lại

**DSH Web (Windows / macOS / Linux)**:
```sh
npx @deepseek-ai/dsh@0.2.1-rc.2 plugin --profile web add ds-bot
npx @deepseek-ai/dsh@0.2.1-rc.2 web
```

**Phương án dự phòng khi npm không dùng được** (bước 2):
- Nhập đường dẫn đầy đủ tới tệp `ds-bot-0.2.0.tgz` đã tải từ Releases
- Hoặc `github:Fei2411/DeepSeek-Bot#v0.2.0&path:/ds-bot` (cần cài Git)

**Phát triển từ mã nguồn** (thêm tiện ích dưới dạng linked dependency vào profile):
```json
{
  "dependencies": { "ds-bot": "link:/path/to/ds-bot" },
  "dsh": { "profile": { "bundles": ["@deepseek-ai/dsh-base", "@deepseek-ai/dsh-web-app", "ds-bot"] } }
}
```
Sau đó trong thư mục profile chạy `pnpm install`, rồi khởi chạy từ kho deepseek-harness:
```sh
pnpm -s dsh --profile web --no-open
```

### 5.4 Phương án C: Triển khai bằng Docker (NAS / máy chủ chạy liên tục)

**Cách một: compose ở thư mục gốc (khuyến nghị)**

Chỉnh sửa tệp `docker-compose.yml` ở thư mục gốc:
- Điền `DEEPSEEK_API_KEY`
- Thêm IP của NAS vào `DSH_TRUSTED_HOST`
- Đặt `PUID` / `PGID` thành ID của chủ sở hữu thư mục dùng chung

```sh
docker compose up -d --build
docker compose logs ds-bot
```

Trong log sẽ in ra một dòng:
```
dsh web: http://127.0.0.1:3080/?token=*** (LAN: http://172.x.x.x:3080/?token=***
```

**Chú ý cổng**: dòng in ra là cổng **bên trong container**, còn bạn cần dùng **cổng máy chủ** được ánh xạ trong `ports:` (compose ở thư mục gốc mặc định là **13080**). Lần mở đầu tiên hãy dùng `http://<NAS IP>:13080/?token=***`, token sẽ được đặt thành một cookie đã ký (hết hạn 30 ngày), sau đó chỉ cần truy cập `http://<NAS IP>:13080/` là được.

**Cách hai: dùng tệp .env trong thư mục docker/**
```sh
cd docker
cp .env.example .env
# Sửa .env: DEEPSEEK_API_KEY, DSH_TRUSTED_HOST, PUID/PGID
docker compose up -d --build
```
Cách này mặc định công bố **cổng máy chủ 3080**. **Hãy chọn một trong hai cách, đừng chạy cả hai trên cùng một thư mục dữ liệu.**

**Image dựng sẵn (GHCR)**:
```yaml
services:
  ds-bot:
    image: ghcr.io/fei2411/deepseek-bot:dev
    ports:
      - "13080:3080"
    environment:
      DEEPSEEK_API_KEY: ""
      PUID: "1000"
      PGID: "1000"
      DSH_TRUSTED_HOST: "localhost,127.0.0.1"
    volumes:
      - ./data:/data
      - ./workspace:/workspace
    extra_hosts:
      - "host.docker.internal:host-gateway"
    restart: unless-stopped
    stop_grace_period: 15s
```

**⚠️ Cảnh báo an toàn khi triển khai Docker (bắt buộc đọc)**:

> Sandbox kernel của chính DSH (bubblewrap / Landlock) **không chạy được dưới seccomp profile mặc định của Docker hoặc trên phần lớn kernel NAS**. Vì vậy image chỉ cung cấp**một preset quyền: toàn quyền** — mọi lệnh của Bot đều được thực thi trực tiếp, không hỏi ý kiến.
>
> **Nên: chỉ mount những thư mục mà Bot cần thay đổi vào `/workspace`. Mọi thứ khác mà container nhìn thấy, Bot đều có thể sửa.**

**HTTPS rất nên dùng nhưng không bắt buộc**: giao diện vẫn chạy được trên HTTP thuần, nhưng trang đó **không phải là một ngữ cảnh bảo mật** — API key và giá trị bí mật bạn nhập sẽ **đi dạng văn bản thuần qua mạng nội bộ**. Trong sử dụng hằng ngày, hãy đặt một reverse proxy ở phía trước.

### 5.5 Giải thích chi tiết cấu hình

Các tùy chọn của tiện ích nằm dưới mục `bot` trong `cordis.patch.yml` của profile, **tất cả đều không bắt buộc**:

```yaml
- id: bot
  name: ds-bot
  config:
    workspace: /path/to/workspace   # Nơi Bot làm việc; mặc định <home>/workspace
    home: /path/to/bot-data         # Nơi lưu dữ liệu của đội; mặc định $DSH_HOME/bot
    checkRatio: 0.8                 # Tỷ lệ ngữ cảnh mà quản lý ngữ cảnh dùng để đánh giá
    browser: true                   # Ép bật/tắt trình duyệt của Bot; mặc định chỉ bật ở Desktop
    memory: true                    # false để tắt ký ức: không có công cụ, mục và bảng ký ức
    memoryReview: true              # false thì ký ức hoàn toàn giao cho lời gọi remember của chính Bot
    diagnosticsFile: false          # Log lỗi chỉ nằm trong bộ nhớ; mặc định <home>/logs/diagnostics.jsonl
    updateCheck: true               # Kiểm tra phiên bản mới khi mở cửa sổ; mặc định true
    updateRegistry: https://registry.example/   # Chỉ tra cập nhật trên npm registry này
    github: false                   # Ẩn connector GitHub; mặc định hiển thị trong Connectors
```

**Về `contextWindow`**: hãy nhớ điền `contextWindow` cho từng mô hình.

> Cửa sổ khả dụng = cửa sổ − phần dự phòng cho câu trả lời (`maxTokens`)
> Vạch cứng = cửa sổ khả dụng × 0.95
> Vạch kiểm tra = cửa sổ khả dụng × `checkRatio` (mặc định 0.8)
>
> Mô hình không điền `contextWindow` sẽ nhận giá trị mặc định của adapter (`llm-pi-ai` là 262.144), **giá trị này có thể sai với mô hình đó**. Mô hình hoàn toàn không khai báo cửa sổ thì được tính là 500.000.

**Endpoint mô hình tùy chỉnh** (relay tương thích OpenAI, v.v.), tạo `DATA_DIR/cordis.patch.yml` trước lần khởi động đầu tiên:
```yaml
- id: llm-pi-ai
  config:
    providers:
      relay:
        apiKeyEnv: RELAY_API_KEY
        api: openai-completions          # hoặc openai-responses / anthropic-messages
        baseURL: http://host.docker.internal:3425/v1
        models:
          - id: my-model
            contextWindow: 131072
            maxTokens: 8192
- id: agent-default-model
  config:
    provider: relay
    model: my-model
```
Sau đó thêm `RELAY_API_KEY` vào phần `environment` của compose.

### 5.6 Phát triển từ mã nguồn

Cần Node 24, pnpm, và một bản deepseek-harness đã cài sẵn dependency, đặt cạnh kho này (`../deepseek-harness`, hoặc đặt `DSH_HARNESS`). Bàn test Desktop còn cần `xvfb-run` và `ffmpeg`.

```sh
npm ci                                   # esbuild, chỉ dùng cho bản build client
npm run harness                          # chỉ một lần: cài các gói DSH dùng cho test và linter
npm run build                            # src/client → client.js
npm test                                 # unit test
npm run lint                             # oxlint
```

**Bàn test**:
```sh
dev/bench.sh dev 3100 8800 start         # Bàn test Web: mock model + dsh Web
dev/desktop-linux/desktop.sh dev start   # Bàn test Desktop (Xvfb)
dev/check.sh                             # Tất cả kiểm tra
```

**Các hạng mục kiểm tra đầy đủ**: `unit`, `build`, `lint`, `smoke`, `web` (ảnh chụp màn hình sidebar, chat, nhóm, cài đặt Bot, v.v.), `desktop`. Khoảng 3 phút sau lần tải đầu tiên.

**Cổng**: mỗi script đều nhận `SLOT=n` (0-9, mặc định 0), bàn test Web dùng `31n0`, mock dùng `88n0`, để tránh xung đột khi nhiều người dùng chung máy.

**Sau khi sửa `src/client/` bắt buộc phải chạy `npm run build`** (`client.js` là sản phẩm được commit vào kho, `npm test` sẽ kiểm tra xem nó đã lỗi thời chưa). Sau khi sửa `index.js` hoặc `src/host/` thì khởi động lại dsh.

### 5.7 Quy trình sử dụng điển hình

```
1. Mở DS Bot → xuất hiện Chief (Main Bot)
2. Nói rõ cách làm việc của bạn với Chief
3. Nhờ Chief tạo một Bot chuyên trách:
   "Tạo một Bot tên Reviewer, vai trò là biên tập,
    phụ trách kiểm tra logic trong tài liệu của tôi có nhất quán không"
4. Tạo nhóm chat để nhiều Bot cùng phối hợp:
   "Tạo một nhóm tên Nhóm Viết, thành viên là Chief, Writer, Reviewer"
5. Trong nhóm hãy @ gọi tên, hoặc nói thẳng với Main Bot để nó điều phối
6. Khi cần bí mật, Bot sẽ hiện một thẻ, bạn điền vào thẻ, nó không bao giờ nhìn thấy
7. Xem mức tiêu thụ token qua Settings → Usage
```

### 5.8 Dữ liệu và sao lưu

Dữ liệu nằm ở `config.home`, nếu chưa cấu hình thì là `$DSH_HOME/bot`, mặc định tiếp là `~/.dsh/bot/` (trên Windows là `C:\Users\<user>\.dsh\bot\`).

| Tệp | Nội dung |
|---|---|
| `state.json` | Đội: các Bot, nhóm, tin nhắn giữa các Bot, tuỳ chọn, câu hỏi chờ trả lời |
| `group-lines/` | Dòng nhóm dài, mỗi dòng một tệp |
| `chat-index.sqlite` | Chỉ mục toàn văn của chat cũ (`read_own_chat`); xoá đi sẽ được dựng lại |
| `usage.sqlite` | Thống kê mức sử dụng; xoá đi sẽ dựng lại từ log |
| `memory/` | Ký ức: `bots/<id>/`, `groups/<id>/`, `team/`, `journal.jsonl`, `archive/` |
| `secrets.json` | Bí mật. **Hãy coi nó như mật khẩu** |
| `logs/diagnostics.jsonl` | Lỗi và cảnh báo gần đây (đã được che thông tin) |

**Bản thân nội dung chat không nằm trong `bot/`**, mà nằm ở `~/.dsh/sessions/`.

**Các bước sao lưu**:
1. **Thoát hoàn toàn DSH** (cả dịch vụ Web lẫn Desktop đều phải đóng), để đảm bảo `state.json` là mới nhất
2. Sao chép toàn bộ `~/.dsh/` (ít nhất là `bot/`, `sessions/`, `storages/`)
3. **Chỉ sao chép `bot/` sẽ làm mất lịch sử chat**
4. Khôi phục: thoát DSH, đặt lại thư mục vào chỗ cũ, rồi khởi động lại

**Đổi máy tính**: nếu đường dẫn giống nhau thì cứ copy trực tiếp. Nếu đường dẫn khác (ví dụ tên người dùng đổi) thì **chưa được kiểm chứng** DSH có tìm được các Session cũ hay không.

**Mở Web và Desktop cùng lúc**: mặc định cùng dùng chung một `~/.dsh`. DSH nạp đội trước sẽ giữ `bot/state.lock`, còn bên kia trở thành **chỉ đọc** — nó vẫn thấy đội và theo dõi thay đổi của tệp, nhưng từ chối thay đổi (báo `bot/read-only`). Muốn cả hai đều sửa được, hãy đặt `DSH_HOME` khác nhau cho một trong hai bên.

---

## Sáu: Xử lý sự cố thường gặp

### Q1: DS Bot không tải được, log báo `disabling profile plugin row "bot"`

```
dsh: disabling profile plugin row "bot": its declared peer dependencies cannot be validated: Cannot read properties of undefined (reading 'startsWith')
```

**Nguyên nhân**: Trước khi nạp tiện ích, DSH kiểm tra từng dòng của profile. Thông báo này nghĩa là có một dòng có id là `bot` nhưng không có package name. Dòng mà DS Bot thêm vào có name là `ds-bot`, vì vậy **nhiều khả năng trong thư mục profile có một file còn sót lại dòng `- id: bot` không có name** (ví dụ một `cordis.patch.yml` override không còn khớp nữa).

**Cách khắc phục**:
1. Thoát DSH
2. Mở file `cordis.patch.yml` trong thư mục profile (`~/.dsh/profiles/web/`, trên Windows là `C:\Users\<user>\.dsh\profiles\web\`; bản Desktop dùng `profiles/desktop/`)
3. Tìm dòng `- id: bot` không có `name: ds-bot` rồi xóa đi. **Hãy sao lưu file trước**
4. Kiểm tra trong `dependencies` của file `package.json` cùng thư mục đã có `ds-bot` chưa, nếu chưa thì thêm lại:
   ```sh
   npx @deepseek-ai/dsh@0.2.1-rc.2 plugin --profile web add ds-bot
   ```
5. Khởi động lại DSH

**Cách truy vết**:
```sh
npx @deepseek-ai/dsh@0.2.1-rc.2 --profile web --dump-config
```
Lệnh này sẽ in ra từng dòng tiện ích cùng file nguồn của nó.

> Xóa cả thư mục profile cũng sửa được, nhưng như vậy sẽ xóa luôn các tiện ích và cấu hình khác (ví dụ cấu hình model). Nhóm của Bot nằm ở `~/.dsh/bot/`, không bị ảnh hưởng.

### Q2: Tắt "web-search-auto" xong thì tất cả phiên chat đều mất chức năng tìm kiếm

```
Error: configured web provider "auto" is not registered
```
Mã lỗi `WEB_PROVIDER_CONFIGURED_MISSING`.

**Nguyên nhân**: Dù bật hay tắt `web-search-auto`, `cordis.patch.yml` của DS Bot vẫn luôn đặt `searchProvider` của dòng `web` là `auto`, mà DSH **không fallback** khi provider được chỉ định chưa được đăng ký.

**Cách khắc phục**: Thêm một dòng `web` trong `cordis.patch.yml` của profile (**dòng này sẽ thay thế toàn bộ config của dòng `web`, nên `fetchProvider` cần được giữ lại**):
```yaml
- id: web-search-auto
  name: ds-bot/web-search
  disabled: true
- id: web
  name: '@deepseek-ai/dsh-web'
  config:
    searchProvider: deepseek-official
    fetchProvider: http
```

### Q3: `@Name` hiển thị thành biểu tượng file khi tin nhắn còn chưa được gửi

**Nguyên nhân**: DeepSeek Harness tự vẽ các dòng chờ này và đọc `@` cho tới khi gặp khoảng trắng. Hiện tại tiện ích chưa thay đổi được cách vẽ của nó.

**Không ảnh hưởng tới việc ai trả lời**: DS Bot dùng luật riêng để đọc `@Name`, các Bot được nhắc tên sẽ được gọi tới. Sau khi tin nhắn được gửi đi thì hiển thị bình thường.

**Cách lách**: Thêm một khoảng trắng sau tên (`@Anvil bạn xem đi`).

### Q4: Nâng cấp từ package `dsh-bot` cũ

Những bản build đầu tiên dùng tên package là `dsh-bot`. **Hãy gỡ `dsh-bot` khỏi profile trước, rồi mới thêm `ds-bot`** — cả hai package đều dùng plugin id là `bot`.

Nhóm, chat và khóa bí mật sẽ được giữ nguyên tại chỗ; cài đặt trình duyệt đã lưu, theme và màu Bot sẽ được chuyển sang khi DS Bot mở lần đầu.

---

## Bảy: Lời kết: Dự án này nhắc chúng ta điều gì

Sau khi xem xong dự án này, cảm nhận mạnh nhất của tôi không phải là "dự án này hay", mà là:

**Phần khó nhất của hệ thống multi-Agent không bao giờ là "làm sao để chúng chạy song song", mà là "làm sao để chúng giữ được sự nhất quán trong thời gian dài".**

Có ba kẻ thù của sự nhất quán:

1. **Trôi dạt ngữ cảnh** — chat nhiều thì quên mục tiêu
2. **Trạng thái không nhất quán** — không biết người khác đang làm gì
3. **Mất trật tự phối hợp** — làm lặp lại, vòng vẩy, mất kết quả

DS Bot có đối ứng rõ ràng cho cả ba: **quản lý ngữ cảnh** để chống trôi dạt, **trạng thái là công dân hạng nhất** để chống không nhất quán, **cây bàn giao** để chống mất trật tự.

Và sau tất cả những đối ứng đó là cùng một triết lý thiết kế:

> **Đừng dùng bộ đếm để kìm hành vi, hãy dùng cấu trúc để ràng buộc hành vi.**

Xóa bỏ giới hạn 6 bước nhảy, trần 10 tin chưa đọc, trần 3 vòng, trần 40 tin — ràng buộc duy nhất được thêm vào là "đừng gửi cho Bot đang chờ kết quả". **Số ràng buộc ròng giảm, độ tin cậy tăng lên.** Đây là quyết định chỉ người thực sự hiểu rõ cấu trúc hệ thống mới có thể đưa ra.

Còn một điều nữa:

> **"Nếu DSH thiếu một khả năng nào đó, hãy dừng lại và nói rõ; đừng lách qua nó bằng cách vá tạm."**

Trong một hệ sinh thái mã nguồn mở mang thiên hướng phổ biến là "chạy được là được, cứ lách tạm trước đã", việc viết câu này vào luật cứng rồi thực sự áp dụng nó tới các quyết định kiến trúc của ứng dụng desktop đòi hỏi một chút dũng khí.

**Địa chỉ dự án**: <https://github.com/Fei2411/DeepSeek-Bot>
(Kho mã nguồn được phân tích trong bài này ban đầu là `FeiZhuLulu/DeepSeek-Bot`, nay đã chuyển hướng về `Fei2411/DeepSeek-Bot`)

---

**Toàn bộ bản dịch tiếng Trung của tài liệu tiếng Anh của dự án đã được biên tập đầy đủ, gồm bốn bài:**

| Tài liệu | Bản dịch tiếng Trung |
|---|---|
| `ds-bot/README.md` (tài liệu đầy đủ về tính năng tiện ích) | `ds-bot-README.zh.md` |
| `docker/README.md` (triển khai Docker) | `docker-README.zh.md` |
| `AGENTS.md` (quy tắc phối hợp cho coding agent AI) | `AGENTS.zh.md` |
| `app/README.md` (ứng dụng desktop) | `app-README.zh.md` |

Các tài liệu tiếng Trung đi kèm sẵn trong dự án: `README.zh.md`, `CONTRIBUTING.zh.md`, `docs/vision.zh.md`, `docs/known-issues.zh.md`, cùng toàn bộ 11 bản thiết kế trong `docs/plans/` (vốn đã viết bằng tiếng Trung).

---

Trên đây là tất cả, nếu bạn đọc được đến đây và thấy hay, tiện tay bấm like, "in" và share cho một lượt ba liền nhé; nếu muốn nhận được tin tức sớm nhất thì cho tôi một ngôi sao cũng được. Cảm ơn bạn đã đọc bài viết của tôi, hẹn gặp lại ở bài sau.

Đăng lần đầu trên tài khoản WeChat 「瑞哥观势」.
