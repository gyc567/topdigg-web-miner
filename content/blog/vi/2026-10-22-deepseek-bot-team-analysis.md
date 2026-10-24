---
title: "DeepSeek mở nguồn một đội AI: Sếp ơi, đồng nghiệp AI của bạn nên có chỗ làm việc rồi"
date: "2026-10-22"
description: "DeepSeek-Bot được DeepSeek mở nguồn chính thức không phải là thêm một công cụ lập trình nữa, mà là một đội AI có vị trí, có trí nhớ, có ngữ cảnh. Đằng sau nó chỉ ra một xu hướng lớn: AI chuyển từ công cụ dùng một lần thành đồng nghiệp cư trú lâu dài. Điều sếp cần quan tâm không phải là cách cài đặt, mà là cách bố trí nhân sự và cách thiết kế lại vị trí công việc."
author: "瑞哥观势"
tags:
  - DeepSeek
  - AI Agent
  - Đội AI
  - Cải tổ tổ chức
  - Dự án mã nguồn mở
categories:
  - 产业趋势
  - 深度观察
---

# DeepSeek mở nguồn một đội AI: Sếp ơi, đồng nghiệp AI của bạn nên có chỗ làm việc rồi

Trước hết, nói kết luận.

DeepSeek gần đây đã mở nguồn một dự án tên DeepSeek-Bot, định nghĩa chính thức chỉ trong một câu: một đội Bot cư trú lâu dài.

Nhiều đội sẽ hiểu tin này là "lại mở nguồn thêm một trợ lý lập trình AI, bỏ qua". Hiểu như vậy là sai.

**Vấn đề nó muốn giải quyết không phải là "làm sao để AI viết code nhanh hơn", mà là "làm sao để một đội AI làm việc cùng nhau lâu dài như những đồng nghiệp thực sự".**

Khoảng cách giữa hai câu hỏi này xa hơn nhiều so với điều phần lớn mọi người tưởng.

Tôi sẽ tách ra nói, và cuối cùng đưa cho sếp một kết luận.

---

**Một: thứ AI chúng ta đang dùng thực ra là "nhân viên tạm"**

Bản thân cái dịch vụ AI mà chúng ta bỏ tiền mua là gì?

Là một đối tượng bạn có thể mở bất cứ lúc nào, cũng có thể tắt bất cứ lúc nào, và mỗi lần mở lên đều bắt đầu từ số không. Bạn nói chuyện với nó ba tiếng, nó nhớ; sáng mai bạn quay lại, nó quên. Bạn đổi cuộc trò chuyện, nó mất trí nhớ hoàn toàn.

Nghe thì không sao, cho đến khi bạn đặt nó vào quy trình làm việc thật.

**Tình huống một: phải dặn dòng lại cùng một việc nhiều lần.**

Bạn bảo AI sửa một phương án, sửa đến bảy vòng. Ba vòng đầu nó hiểu rõ yêu cầu của bạn, đến vòng năm thì bắt đầu lệch, đến vòng bảy thì đã quên ràng buộc cốt lõi ban đầu. Bạn đành dán lại ngữ cảnh, hoặc thà mở cuộc trò chuyện mới và nói lại từ đầu.

**Tình huống hai: các AI không nhìn thấy nhau.**

Nhiều công ty giờ đã dùng nhiều AI cùng phối hợp. Nhưng chúng không biết đối phương đang làm gì. Bạn giao việc, nhận về một câu "đã nhận", rồi không còn gì. Bạn không biết nó có làm không, làm đến đâu, vướng ở chỗ nào.

**Tình huống ba: AI không có trí nhớ, nên kinh nghiệm của bạn không thể đọng lại.**

Phán đoán của một nhân viên kinh doanh, một bộ quy tắc rà soát, thiên hướng khi nói chuyện với khách hàng, những thứ như vậy nếu chỉ nằm trong đầu một người thì AI không giúp được. Nếu viết vào câu lệnh (prompt), mỗi lần đều phải viết lại. Nếu viết vào tài liệu, AI sẽ không chủ động đi đọc.

Điểm chung của ba vấn đề này là: **chúng đều không phải vấn đề năng lực của mô hình.** Mô hình có đủ thông minh hay không là một chuyện; có trí nhớ, có bền vững, có phối hợp được với nhau hay không, là chuyện khác.

Và cái "chuyện khác" đó, chính là phần đáng giá nhất của doanh nghiệp.

---

**Hai: DeepSeek-Bot đổi hướng tiếp cận, đừng coi AI là cuộc trò chuyện, hãy coi nó là đồng nghiệp**

Sự thay đổi cốt lõi của dự án này, nói trong một câu là được.

**Trước đây: AI là một cuộc trò chuyện dùng một lần, dùng xong là bỏ.**
**Bây giờ: AI là một vai trò có mặt lâu dài trong công việc, có tên, có vị trí, có chỗ ngồi, có sổ tay riêng.**

Nghe như từ quảng cáo, nhưng khác biệt thực tế rất lớn. Ba ví dụ cụ thể.

**Ví dụ một: AI tự đánh giá "việc này đã xong chưa".**

Dùng AI lâu rồi chúng ta đều biết một điểm đau: nói nhiều thì nó quên. Nhưng xử lý chuyện này thì cách làm thông dụng của ngành là đặt một ngưỡng cứng, ví dụ ngữ cảnh dùng hết 80% là tự động nén lại, nén xong mở một đoạn mới.

Vấn đề của cách làm này là: nén vẫn là nén, tóm tắt của tóm tắt thì ngày càng rỗng, những chi tiết bạn nhấn mạnh trước đó lặng lẽ biến mất. Mở đoạn mới thì càng thô bạo, việc đang làm dở bị cắt ngang một nhát.

Cách làm của DeepSeek-Bot là: khi sắp chạm ngưỡng, cho một vai trò "quản gia" nhẹ đi đọc cuộc trò chuyện gần đây và đánh giá một việc:

**việc này đã tạm kết thúc, hay vẫn đang tiếp diễn?**

Nếu vẫn đang tiếp diễn, nó đóng gói tiến độ hiện tại thành một điểm bàn giao rồi tiếp tục làm tiếp. Nếu đã tạm kết thúc, nó viết một ghi chú bàn giao rồi chuyển sang đoạn tiếp theo một cách tự nhiên.

Điểm mấu chốt là, **nó không đếm số token.** Nó được yêu cầu rõ ràng đối chiếu từng mục: bạn cần gì, mình thực sự đã làm gì, những câu hỏi nào mình đã hỏi mà bạn chưa trả lời. Ngay cả khi AI tự nói "tôi đã xong", chỉ cần một mục con chưa khép kín thì vẫn bị phán đoán là đang tiếp diễn.

Quy tắc này nghe thì nhỏ, nhưng nó đổi bản chất của sự việc "AI hay quên". Từ "phải có người nhắc nó đừng quên", thành "tự nó biết chốt lại khi việc đã xong".

Điều thú vị hơn là một quy tắc ngược đời: càng nén nhiều lần, càng nên coi một khoảng dừng hợp lý là "tạm kết thúc". Bởi vì tóm tắt của tóm tắt tổn thất càng lớn, cứ cố chịu đựng còn hơn là giao bàn giao cho tử tế.

**Cảm nhận thực tế của sếp là: bạn không nhận ra chuyện này đã xảy ra.** Không có thông báo, không có công cụ "đổi cuộc trò chuyện", bạn luôn chỉ thấy một cuộc trò chuyện liên tục.

**Ví dụ hai: việc giao phó giữa các thành viên AI chuyển từ "gửi tin nhắn" sang "cây giao việc".**

Đây là thiết kế tôi cho là đáng giá nhất trong toàn bộ dự án, nói riêng cho sếp nghe.

Cách phối hợp nhiều AI hiện nay phần lớn là thế này: A giao việc cho B, B đáp một câu "đã nhận", rồi hai bên mỗi người làm việc của mình, không ai biết tiến độ của người kia. Để tránh hỗn loạn, dự án chất đống các giới hạn: tin nhắn truyền tối đa 6 lượt, đối phương tối đa 10 tin chưa đọc tồn đọng, trong một nhóm tối đa phát biểu 3 lượt, toàn bộ đội tối đa gửi 40 tin sau khi bạn nói lần cuối.

Nghe rất chặt chẽ đúng không? Thực tế là trong bốn giới hạn đó, ba giới hạn đầu hoàn toàn là tự đào hố cho mình.

**Tại sao? Vì kết quả của công việc sẽ tự đi lên.**

Cách làm của DeepSeek-Bot là quản lý "công việc" như một cái cây. Công việc ở nhánh dưới chưa trả về thì nhánh trên cứ chờ; bên dưới trả về hết thì bên trên tiếp tục làm, xong thì đưa cả kết quả bên dưới đi tiếp.

Nói thành lời dễ hiểu: **kết quả tự động quay về đúng chỗ cần đến, không cần dựa vào việc truy đuổi từng tin nhắn một.**

Kết quả là cả bốn giới hạn đó bị xóa sạch, và xóa theo kiểu "không để lại đường lui". Không phải nới lỏng, mà là gỡ bỏ triệt để.

Giới hạn mới chỉ có một: đừng gửi tin nhắn cho AI đang chờ kết quả đó.

Lý do đằng sau đáng để sếp ghi nhớ, vì nó không chỉ đúng với AI:

> **Độ tin cậy của một hệ thống không nên được chống đỡ bằng loại bộ đếm "tối đa làm mấy lần", mà bằng chính cấu trúc.**
> Hệ thống chống đỡ bằng bộ đếm thì bình thường nhìn ra không sao, chỉ cần gặp tình huống biên là xuống đồng loạt. Hệ thống chống đỡ bằng cấu trúc thì càng dùng càng vững.

Tiện thể nói thêm, cách làm của dự án này là: **xóa hết mọi trần trên, chỉ thêm một ràng buộc thực sự có ý nghĩa.** Tổng số ràng buộc giảm xuống mà độ tin cậy của hệ thống lại tăng lên. Chỉ có ai thật sự hiểu rõ cấu trúc mới dám quyết định như vậy.

**Ví dụ ba: AI có sổ tay riêng, và phân biệt rõ công tư.**

Đây là phần sếp nên quan tâm nhất.

Trí nhớ của dự án chia làm ba tầng, rất giống cơ cấu tổ chức của một công ty:

**Mỗi đồng nghiệp AI có sổ tay công việc riêng** (công việc nó làm, kinh nghiệm của nó)
**Mỗi nhóm trò chuyện có sổ tay chung của nhóm** (chỉ đọc được trong nhóm này, ra khỏi nhóm là không thấy)
**Toàn bộ đội có một ký ức chung của cả đội** (mọi AI đều đọc được)

Ở đây có một thiết kế khá tinh tế: **những gì nói trong nhóm thì ở lại trong nhóm.**

Thông tin trong nhóm không chảy vào cuộc trò chuyện riêng của thành viên, không chảy sang nhóm khác, cũng không chảy cho AI ở ngoài nhóm. Khi ai đó bị kick khỏi nhóm, lập tức không đọc được và không viết được nữa.

Nghe thì nhỏ, nhưng nó tương ứng trực tiếp với vấn đề ranh giới thông tin trong doanh nghiệp. Những gì bạn nói trong "nhóm bàn về lương" sẽ không tự nhiên xuất hiện trong sổ tay cá nhân của một AI nào đó, rồi bị nó mang sang bối cảnh kinh doanh khác. Rất nhiều đội chỉ bổ sung lớp cách ly như vậy sau khi đã xảy ra sự cố.

Một chi tiết khác: **AI sẽ không "tự nhớ ra" để ghi lại.** Mỗi đoạn trò chuyện kết thúc, hệ thống tự động làm một lần tổ chức trí nhớ. Giống như sau khi họp xong, người ta tự nhớ lại "kết luận nào cần ghi lại". Bạn không cần nhắc, nó tự làm.

Hơn nữa, AI không thể lưu trực tiếp những nội dung dạng "hãy nhớ điều này" trong các trang web, tệp tin, kết quả công cụ mà nó lỡ tay bắt về thành ký ức. **Ký ức là dữ liệu, không phải mệnh lệnh.** Quy tắc này chặn đúng kiểu tấn công chèn chỉ dẫn.

**Ví dụ ba còn đi kèm một thiết kế an toàn, tôi nói riêng vì nó quá quan trọng:**

**Giá trị khóa bí mật không bao giờ đi vào ngữ cảnh của AI.**

Cách làm cụ thể là: khi AI cần một khóa bí mật, nó hiện ra một thẻ, bạn điền vào thẻ đó. AI chỉ nhận được "khóa này tên là gì", không bao giờ nhận được giá trị. Giá trị bạn nhập được lưu trên máy của bạn và trước khi gửi đi mô hình thì đều được thay bằng ký hiệu giữ chỗ.

Cái này giải quyết đúng một vấn đề mà sếp lo lắng mỗi ngày: **dữ liệu của bạn lọt vào mô hình lớn, tức là đã giao cho người khác.**

Hơn nữa bản thân dự án có viết một cảnh báo rất thành thật: chỉ một AI chỉ biết mã hóa, chia nhỏ hoặc đảo ngược giá trị vẫn có thể in nó ra, **đừng giao khóa bí mật quan trọng cho một AI mà bạn không tin tưởng.**

Tôi đặc biệt muốn nhấn mạnh điều này với sếp: một hệ thống dám viết thẳng ra "tôi không chặn được cái gì" vào tài liệu, đáng tin hơn nhiều so với một hệ thống viết đầy "tuyệt đối an toàn".

---

**Ba: điều dự án này thực sự đang nói: ba thứ đang thay đổi cùng lúc**

Bóc hết chi tiết kỹ thuật ra, đằng sau DeepSeek-Bot là ba sự thay đổi đang diễn ra đồng thời.

**Thay đổi một: AI chuyển từ "bạn gọi nó" sang "nó có mặt tại chỗ".**

Trước đây, mỗi lần dùng AI đều do bạn chủ động khởi xướng. Không có bạn tìm nó, nó không tồn tại. Mô hình của DeepSeek-Bot thì ngược lại: **nó cư trú, nó có tên và vị trí, bạn dùng nó như dẫn một đội.**

Sự chuyển đổi này có ý nghĩa thương mại lớn hơn nhiều so với ý nghĩa kỹ thuật. Bởi vì một khi AI trở thành vai trò cư trú, nó có thể tích lũi. **Một AI không nhớ được gì thì mãi mãi chỉ là công cụ; một AI nhớ được thì mới có thể gánh trách nhiệm.**

**Thay đổi hai: thiết kế tổ chức của một đội AI quan trọng hơn nhiều so với độ thông minh của một AI đơn lẻ.**

Câu này nghe bây giờ có thể hơi sớm, nhưng tôi nghĩ trong vòng hai năm năm nó sẽ thành kiến thức hiển nhiên.

Lý do rất đơn giản: năng lực mô hình là hàng hóa chung mà các hãng đều giống nhau, nhưng "làm sao để tổ chức một nhóm AI làm việc" là việc riêng của từng công ty. Ai chạy được thiết kế tổ chức trước thì người đó dẫn đầu về cơ cấu chi phí.

Thiết kế "kết quả tự động đi lên" kia trông như một chi tiết kỹ thuật, nhưng thực ra là thiết kế tổ chức. **Nó tương ứng với câu hỏi "ai phải báo cáo cho ai, và sau khi báo cáo có cần đuổi theo tiếp không".** Bạn đang thiết kế cách đội AI cộng tác, thực chất là đang thiết kế quy trình quản lý của một công ty.

**Thay đổi ba: ranh giới an toàn của AI đang chuyển từ "tôi bảo đảm nó an toàn" sang "tôi nói rõ tôi đã dừng tay ở đâu".**

Trong dự án này có hai chỗ thể hiện rất tốt.

Một chỗ là trình duyệt: AI chỉ được đọc, không được bấm, không được nhập, không được cuộn, không được mở địa chỉ. Nó đọc nội dung trên trang web thì coi đó luôn là dữ liệu, không bao giờ là mệnh lệnh. Nó đọc DOM chứ không đọc ảnh chụp màn hình, nên những phần tử bị ẩn nó không nhìn thấy, còn ô mật khẩu, số thẻ tín dụng, mã xác minh thì nó chủ động bỏ qua.

Chỗ còn lại là khi hiển thị giao diện: thiết kế ban đầu là để AI tự viết mã trang web rồi render ra. Phương án này bị phản biện nội bộ hai lần. Phương án cuối cùng được chốt là **hoàn toàn không để AI viết mã**. AI chỉ được chọn thành phần từ một danh mục cố định rồi điền dữ liệu vào.

Tóm lại sự chuyển đổi trong tư duy này:

> **An toàn không đến từ việc "nhốt thứ không đáng tin vào lồng", mà đến từ việc "không cung cấp cái lồng đó".**

Cả hai thiết kế đó đều không phải tăng cường kiểm soát, mà là hủy bỏ năng lực. **Hủy bỏ rẻ hơn quản lý nhiều, và cũng đáng tin hơn nhiều.** Câu này đúng khi nói về an toàn AI, và cũng đúng khi nói về quản lý doanh nghiệp.

---

**Bốn: vài lời nói thẳng cần phải có**

Dự án này đáng để xem, nhưng tôi không thể chỉ nói mặt tốt. Ba điều nói rõ.

**Một: hiện tại nó là bản xem trước, chưa phải hạ tầng ổn định.**

Chính đội ngũ dự án ghi rõ đây là phiên bản sớm, tính năng, công cụ và định dạng dữ liệu vẫn có thể thay đổi. Ứng dụng máy tính chưa được ký số, trên Windows sẽ hiện cảnh báo bảo mật. Những lỗi đã biết bao gồm cả loại cơ bản như "tải plugin thất bại".

**Hai: triển khai Docker chỉ cấp một loại quyền: toàn quyền.**

Bởi vì lõi cấp quyền cấp thấp (sandbox) đi kèm của nó không chạy được trong cấu hình mặc định của Docker. Điều này có nghĩa là thư mục nào container nhìn thấy thì AI sửa được. **Nếu bạn định chạy lâu dài trên NAS hoặc máy chủ, ranh giới quyền phải do bạn tự kiểm soát bằng cách mount, đừng trông chờ vào sandbox tích hợp của nó.**

Điểm này nhất định phải có người hiểu kỹ thuật trực tiếp canh, không nên để bên kinh doanh tự ý quyết định.

**Ba, và cũng là điều tôi cho là quan trọng nhất với sếp: giá trị của cả bộ này phụ thuộc vào việc bạn có dùng nó như "đồng nghiệp" hay không.**

Nếu bạn chỉ coi nó như một khung chat dễ dùng hơn, thì đúng là nó mạnh hơn thứ khác một chút, nhưng chỉ một chút thôi.

Giá trị của nó nằm ở cách dùng khác: **bạn đặt cho nó một cái tên, cho nó một vị trí, viết rõ nó phụ trách việc gì, để nó làm lâu dài một loại việc, rồi xem cuốn sổ tay của nó dần dày lên.**

Đây không phải "triển khai một công cụ", đây là "tuyển người". **Lợi ích của việc tuyển người phụ thuộc vào việc bạn đã nghĩ rõ mình muốn tuyển người như thế nào.**

---

**Năm: kết luận cho sếp: ba xu hướng và một kết luận tổng**

Tổng hợp toàn bộ phần trên, tôi đưa ra ba dự đoán xu hướng.

**Xu hướng một: trong hai năm tới, cuộc cạnh tranh của các công cụ AI sẽ chuyển từ "năng lực đơn điểm" sang "giao hàng theo đội".**

Hôm nay mọi người so điểm mô hình, độ dài ngữ cảnh, giá rẻ hơn bao nhiêu. Những thứ này đều sẽ hội tụ, vì mô hình là hàng hóa chung.

Giai đoạn sau người ta sẽ so: **AI của bạn có đủ sức gánh một phần trách nhiệm một cách ổn định lâu dài hay không, thay vì mỗi lần đều bắt đầu từ số không.** Đây là khác biệt ở tầng sản phẩm, không phải tầng mô hình. Dự án mã nguồn mở chạy nhanh hơn các công ty lớn ở điểm này, vì các công ty lớn vẫn đang phân vân xem nhét Agent vào sản phẩm sẵn có bằng cách nào, trong khi cộng đồng mã nguồn mở đã bắt đầu dựng lại toàn bộ hình thức làm việc.

**Xu hướng hai: trí nhớ AI và cộng tác giữa AI sẽ trở thành tài sản dữ liệu tiếp theo của doanh nghiệp.**

Nếu phán đoán kinh doanh, sở thích khách hàng, tiêu chuẩn rà soát của một công ty đều đọng lại trong trí nhớ của AI, thì những kinh nghiệm ấy chuyển từ "trong đầu một người nào đó" thành "tài sản của công ty". Người rời đi không còn mang theo thứ gì, người mới vào cũng không phải đào tạo ba tháng.

**Điều này cùng một logic với chuyện doanh nghiệp triển khai hệ thống mười năm trước: dữ liệu đã vào hệ thống, người đi thì kinh nghiệm ở lại.** Trí nhớ AI là lần thứ hai của cùng chuyện đó.

**Xu hướng ba: trọng tâm an toàn AI đang chuyển từ "phòng ngừa model làm loạn" sang "nói rõ model không làm gì".**

Hai năm qua ai cũng đang thêm rào chắn. Cách làm trưởng thành hơn từ nay là: **lấy thẳng năng lực nguy hiểm ra khỏi mô hình, và viết rõ trong tài liệu đã lấy đi bao nhiêu.**

Trong tài liệu của DeepSeek-Bot có một câu: họ phát hiện rằng sau khi loại bỏ dữ liệu tấn công phòng thủ trong quá trình huấn luyện, năng lực liên quan giảm rõ rệt, từ 90.5% xuống còn 81.0%, nhưng năng lực lập trình phổ quát không bị tổn hại. Họ đưa con số này thẳng vào tài liệu.

**Nhà cung cấp nói được mình đã dừng tay ở đâu và dừng bao nhiêu, đáng tin hơn nhiều so với nhà cung cấp chỉ nói "chúng tôi rất an toàn".** Tiêu chuẩn đánh giá này, sau này khi mua sắm phương án công nghệ có thể dùng thẳng luôn.

---

**Kết luận tổng**

Tôi rút toàn bộ bài thành một câu:

> **AI đang chuyển từ một công cụ bạn thuê tạm thời thành một vai trò bạn thuê dài hạn.**
> **Và "làm sao để dẫn một đội AI" đang trở thành một môn quản lý mà mỗi công ty đều phải tự học.**

Cụ thể hơn, ba hành động sếp có thể làm ngay lập tức.

**Một: thử một việc trong tuần này, đặt cho một AI một cái tên và một vị trí.**

Đừng dùng cách gọi kiểu "trợ lý AI". Gọi nó là "kiểm tra hợp đồng", rồi chỉ cho nó làm đúng việc kiểm tra hợp đồng. Để nó làm liên tục hai tuần, rồi mở sổ tay của nó ra xem.

Bạn sẽ thấy thứ thực sự có giá trị không nằm ở câu trả lời đầu tiên của nó, mà nằm ở những gì nó vẫn nhớ sau hai tuần.

**Hai: rà soát xem trong công ty bạn có vị trí nào có thể định nghĩa lại.**

Không cần nghĩ về chuyện thay thế ai. Hãy tìm những vị trí **quy tắc tương đối ổn định, kinh nghiệm có thể tích lũy, cần so sánh xuyên nhiều tài liệu**. Kiểm tra hợp đồng, sàng lọc tuân thủ ban đầu, đối soát tài chính, chẩn đoán hậu bán, theo dõi đối thủ, đều nằm trong nhóm này.

Những vị trí như vậy giao cho AI cư trú lâu dài thì giá trị lớn nhất. Vì quy tắc ổn định thì nó mới không loạn, kinh nghiệm tích lũy được thì nó mới tốt dần lên.

**Ba: nhân cơ hội khi mọi người chưa làm phổ biến, hãy viết kinh nghiệm của bạn thành tài liệu.**

Đây là điều ngược đời nhất, nhưng cũng là điều tôi muốn nhấn mạnh nhất.

Bởi vì trong tương lai khi AI phổ biến tự ghi nhớ được mọi thứ, **"kinh nghiệm của bạn có viết ra được rõ ràng hay không" quyết định AI có thể làm thay bạn hay không.** Kinh nghiệm viết không rõ thì AI học không được, cũng truyền không tiếp.

Nên rào cản thực sự không phải là có AI hay không, mà là **bạn đã biến phán đoán của mình thành quy tắc tái sử dụng được hay chưa.**

Chuyện này làm bây giờ chi phí rất thấp; đến lúc tất cả mọi người đã làm thì lợi thế của bạn cũng hết.

---

Tôi muốn kết bằng một nhận xét.

Ở dự án này, thứ khiến tôi khâm phục nhất không phải kỹ thuật, mà là một câu trong tài liệu của họ, một quy tắc cứng dành cho các AI cộng tác:

**"Nếu framework nền tảng thiếu một năng lực nào đó, hãy dừng lại và nói rõ, đừng lách qua bằng cách vá tạm."**

Trong một hệ sinh thái mã nguồn mở nơi phổ biến là "chạy được là được, lách tạm trước đã", viết câu này vào quy tắc rồi thực sự làm theo, là cần có dũng khí.

Và câu này đặt vào trong công ty thì vẫn đúng. **Một phương án công nghệ sẵn sàng nói "chỗ này tôi không làm được" đáng để giao phó hơn một phương án dám cam kết mọi thứ.**

Bàn luận ở phần bình luận nhé, trong công ty bạn có vị trí nào muốn thử để AI làm lâu dài trước? Tôi rất muốn xem lựa chọn của mọi người.

---

Đăng lần đầu trên WeChat «瑞哥观势»

Nếu bạn đã đọc đến đây và thấy hay, tiện tay bấm like, bấm «xem» và chia sẻ liên hoàn đi; nếu muốn nhận bài viết mới nhất ngay lập tức, hãy tặng tôi một ngôi sao. Cảm ơn bạn đã đọc bài của tôi, hẹn gặp lại.

Đăng lần đầu trên WeChat «瑞哥观势».
