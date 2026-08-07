---
title: "Loop Engineering Đi Sâu (Bài Gốc Của Addy Osmani): Ngừng Nhắc AI Từng Bước — Thiết Kế Một Vòng Lặp Tự Tìm Việc, Phân Việc Và Kiểm Chứng Kết Quả, Rồi Vẫn Giữ Vai Trò Kỹ Sư"
description: "Bài phân tích toàn diện về bài viết gốc 'Loop Engineering' (2026-06-07) của Addy Osmani — giám đốc kỹ thuật AI của Google Cloud và cựu thành viên nhóm Chrome. Ý tưởng cốt lõi: loop engineering là thay thế chính bạn — người đang nhắc agent — bằng một vòng lặp: một mục tiêu đệ quy nơi bạn xác định mục đích và AI lặp lại cho đến khi hoàn thành. Mở đầu bằng hai trích dẫn định khung cho toàn bộ mô hình: Peter Steinberger ('Bạn không nên nhắc coding agent nữa. Bạn nên thiết kế các vòng lặp nhắc agent của mình.') và trưởng nhóm Claude Code của Anthropic Boris Cherny ('Tôi không nhắc Claude nữa. Tôi có các vòng lặp đang chạy để nhắc Claude và quyết định việc cần làm. Công việc của tôi là viết vòng lặp.'). Bao quát: cách vòng lặp nằm một tầng trên harness (chạy theo timer, sinh sub-agent, tự nạp cho chính nó), năm khối xây dựng + bộ nhớ (Automations / Worktrees / Skills / Plugins & Connectors / Sub-agents + Memory), ánh xạ từng nguyên thủy giữa Codex app và Claude Code, một vòng lặp hoàn chỉnh trông như thế nào (automation buổi sáng → skill phân loại → worktree cô lập → sub-agent soạn thảo/rà soát → connector mở PR), hiểu biết không phụ thuộc công cụ (ngừng tranh cãi về công cụ khi hình dạng giống nhau), và ba điều vòng lặp vẫn KHÔNG làm thay bạn (kiểm chứng vẫn thuộc về bạn, sự mai một hiểu biết, đầu hàng nhận thức). Câu kết: Hãy xây vòng lặp. Vẫn là kỹ sư."
date: "2026-08-06"
author: "TopDigg Research Team"
tags: ["Loop Engineering", "Addy Osmani", "AI Agent", "Claude Code", "Codex", "Automations", "Worktrees", "Skills", "Sub-agents", "MCP", "Harness Engineering", "Cognitive Surrender"]
categories: ["Deep Dive"]
keywords: ["Loop Engineering", "Addy Osmani", "AI Agent", "Claude Code", "Codex", "Automations", "Worktrees", "Skills", "Sub-agents", "MCP", "Kỹ thuật Harness", "Bộ nhớ", "Đầu hàng nhận thức", "Vẫn là kỹ sư"]
---

# Loop Engineering Đi Sâu (Bài Gốc Của Addy Osmani): Ngừng Nhắc AI Từng Bước — Thiết Kế Một Vòng Lặp Tự Tìm Việc, Phân Việc Và Kiểm Chứng Kết Quả, Rồi Vẫn Giữ Vai Trò Kỹ Sư

> Ý tưởng cốt lõi: **Loop engineering là thay thế chính bạn — người đang nhắc agent.** Trong bài viết gốc của mình (2026-06-07), Addy Osmani (cựu giám đốc Google, Giám đốc Kỹ thuật tại Google Cloud AI) định nghĩa vòng lặp là một **mục tiêu đệ quy** — bạn xác định mục đích và AI lặp lại cho đến khi hoàn thành. Ông tin đây có thể là tương lai của cách chúng ta làm việc với coding agent, nhưng: "vẫn còn sớm, tôi hoài nghi và bạn chắc chắn phải cẩn thận về chi phí token." Hai trích dẫn định khung toàn bộ bài viết: Peter Steinberger (người tạo ra OpenClaw) — "**Bạn không nên nhắc coding agent nữa. Bạn nên thiết kế các vòng lặp nhắc agent của mình.**" — và Boris Cherny, trưởng nhóm Claude Code tại Anthropic — "**Tôi không nhắc Claude nữa. Tôi có các vòng lặp đang chạy để nhắc Claude và quyết định việc cần làm. Công việc của tôi là viết vòng lặp.**" Thay vì cầm công cụ từng lượt, bạn xây một hệ thống điều khiển nhỏ tự chọc vào các agent cho bạn. Nhưng lời cảnh báo sắc bén nhất nằm ở cuối bài: **Hãy xây vòng lặp. Vẫn là kỹ sư.** Vòng lặp không kiểm chứng thay bạn, không ngăn hiểu biết của bạn mai một, và không ngăn bạn đầu hàng nhận thức. Được thiết kế với sự phán đoán, nó là liều thuốc; được dùng để trốn tránh suy nghĩ, nó là chất xúc tác.

---

## 1. Đây Là Gì

### 1.1 Nguồn gốc

Bài phân tích này dựa trên **bài viết gốc《Loop Engineering》của Addy Osmani được đăng trên addyosmani.com vào ngày 2026-06-07**. Đây không phải là một hướng dẫn — nó là một tuyên ngôn về mô hình tư duy cộng với phân tích thực tế về cách chúng ta cộng tác với coding agent.

Bối cảnh của Addy rất quan trọng: **cựu giám đốc Google, hiện là Giám đốc Kỹ thuật tại Google Cloud AI, 14 năm tại Google**, một tên tuổi lớn trong hiệu năng web và kỹ thuật front-end (tác giả cuốn *Learning JavaScript Design Patterns*, xuất thân từ nhóm Chrome). Năm 2026 ông viết một loạt bài dày đặc về cộng tác lập trình với AI — agent harness engineering, mô hình nhà máy, thuế điều phối, nợ ý định, nợ hiểu biết, đầu hàng nhận thức, rà soát mã đối kháng, dàn nhạc code agent, agent chạy lâu dài — và *Loop Engineering* chính là **đỉnh điểm** của loạt bài đó.

Định nghĩa:

> **Loop engineering là thay thế chính bạn — người nhắc agent. Bạn thiết kế hệ thống làm điều đó thay mình.**

Một vòng lặp = **một mục tiêu đệ quy**: bạn xác định mục đích, AI lặp lại cho đến khi hoàn thành. Đây là một kỷ luật kỹ thuật được xây dựng trên sự dịch chuyển vai trò của kỹ sư con người: **bạn không còn là người gõ prompt mỗi ngày — bạn thiết kế hệ thống quyết định ai nhắc, nhắc khi nào, và kết quả được kiểm chứng ra sao.**

### 1.2 Sự thật chính

- Tác giả: **Addy Osmani**, cựu giám đốc Google, Giám đốc Kỹ thuật tại Google Cloud AI, kỹ sư front-end và người ủng hộ nhà phát triển nổi tiếng thế giới
- Kênh: blog cá nhân `addyosmani.com`
- Đăng ngày: **2026-06-07**
- Lập trường: **"Tôi tin đây có thể là tương lai của cách chúng ta làm việc với coding agent. Tuy nhiên, vẫn còn sớm, tôi hoài nghi và bạn chắc chắn phải cẩn thận về chi phí token"**
- Trích dẫn chính từ: Peter Steinberger (người tạo ra OpenClaw), Boris Cherny (trưởng nhóm Claude Code tại Anthropic)
- Dòng dõi khái niệm: agent harness engineering (môi trường một agent chạy trong đó) → mô hình nhà máy (hệ thống xây dựng phần mềm) → **loop engineering (một tầng trên harness: chạy theo timer, sinh ra các trợ thủ nhỏ, tự nạp cho chính nó)**
- Loạt bài liên quan: thuế điều phối, nợ ý định, nợ hiểu biết, đầu hàng nhận thức, rà soát mã đối kháng, dàn nhạc code agent, agent chạy lâu dài

### 1.3 Nó giải quyết vấn đề gì

Trong hai năm qua, cách để có được thứ gì đó từ coding agent là: **viết một prompt tốt, chia sẻ đủ ngữ cảnh, gõ một câu, đọc kết quả trả về, gõ câu tiếp theo** — "agent là một công cụ và bạn cầm nó suốt thời gian đó, từng lượt một." Phán quyết của Addy: **"Phần đó gần như đã hết thời, hoặc ít nhất một số người nghĩ nó sẽ hết thời."**

Câu trả lời của mô hình mới: **bạn xây một hệ thống nhỏ thay thế cuộc trò chuyện trực tiếp của bạn với agent.** Hệ thống đó tìm việc, phân việc, kiểm tra, ghi lại những gì đã xong, rồi quyết định việc tiếp theo — và bạn để hệ thống đó chọc vào các agent thay vì bạn.

Sự dịch chuyển chính: **đây không còn là vấn đề công cụ nữa.** Một năm trước, một vòng lặp nghĩa là viết cả đống bash và bảo trì mãi mãi; **giờ các mảnh ghép được đóng sẵn bên trong sản phẩm** (Codex, Claude Code). Danh sách của Steinberger khớp gần như chính xác với Codex app, và gần như tương tự với Claude Code — một khi bạn nhận ra hình dạng là như nhau, bạn ngừng tranh cãi về công cụ nào và chỉ cần thiết kế một vòng lặp hoạt động dù bạn đang ngồi trong bất kỳ công cụ nào.

---

## 2. Ý Tưởng Cốt Lõi

### 2.1 Định nghĩa một câu, hai trích dẫn ngành

Addy mở đầu bằng hai trích dẫn đặt nền móng cho mô hình. Thứ nhất, Peter Steinberger (người tạo ra OpenClaw, dự án mã nguồn mở trợ lý AI cá nhân đột phá của năm 2026):

> "Bạn không nên nhắc coding agent nữa. Bạn nên thiết kế các vòng lặp nhắc agent của mình."

Thứ hai, Boris Cherny, trưởng nhóm Claude Code tại Anthropic:

> "Tôi không nhắc Claude nữa. Tôi có các vòng lặp đang chạy để nhắc Claude và quyết định việc cần làm. Công việc của tôi là viết vòng lặp."

### 2.2 Vòng lặp nằm một tầng trên harness

Addy đã viết về *agent harness engineering* (môi trường một agent chạy trong đó) và *mô hình nhà máy* (hệ thống xây dựng phần mềm). Loop engineering nằm ở đâu:

> **Loop engineering nằm một tầng trên harness.**

- **Harness**: giàn giáo cho **một** lượt chạy agent (công cụ, tiêu chí chấp nhận, phản hồi)
- **Loop**: "harness nhưng chạy theo timer, sinh ra các trợ thủ nhỏ, và tự nạp cho chính nó"

Vậy nên: harness trang bị cho một lượt chạy; vòng lặp là lớp **liên tục lên lịch agent, sinh sub-agent, và tự nạp cho chính nó.**

### 2.3 Hình dạng giống nhau → ngừng tranh cãi về công cụ

Addy nêu bật một quan sát khiến ông bất ngờ: **"Đây không thực sự là chuyện công cụ nữa."** Một năm trước một vòng lặp nghĩa là bash viết tay và bảo trì mãi mãi; giờ **các mảnh ghép được đóng sẵn bên trong sản phẩm**. Kết luận:

> Một khi bạn nhận ra hình dạng là như nhau, bạn ngừng tranh cãi về công cụ nào, và chỉ cần thiết kế một vòng lặp hoạt động dù bạn đang ngồi trong bất kỳ công cụ nào.

Thiết kế vòng lặp là một **nghề thủ công không phụ thuộc công cụ** — một trong những bài học quan trọng nhất của bài viết.

---

## 3. Hướng Dẫn: Năm Thứ Một Vòng Lặp Cần, Cộng Một Nơi Để Ghi Nhớ

Addy liệt kê rõ ràng: **"Một vòng lặp cần năm thứ và sau đó là một nơi để ghi nhớ."**

| # | Thành phần | Vai trò trong vòng lặp |
|---|-----------|-----------------|
| 1 | **Automations** | Kích hoạt theo lịch trình; tự động làm công việc phát hiện và phân loại |
| 2 | **Worktrees** | Để hai agent làm việc song song không giẫm lên nhau |
| 3 | **Skills** | Ghi lại kiến thức dự án mà agent nếu không sẽ chỉ phải đoán |
| 4 | **Plugins & Connectors** | Cắm agent vào các công cụ bạn đã dùng |
| 5 | **Sub-agents** | Một người có ý tưởng, một người khác kiểm tra nó |
| 6 | **Memory** | Thứ gì đó nằm ngoài cuộc trò chuyện đơn lẻ, giữ những gì đã xong và những gì kế tiếp |

### 3.1 Bảng ánh xạ nguyên thủy (Codex app so với Claude Code)

| Nguyên thủy | Vai trò trong vòng lặp | Codex app | Claude Code |
|---|---|---|---|
| **Automations** | Phát hiện + phân loại theo lịch trình | Tab Automations: chọn dự án, prompt, tần suất, môi trường; các lượt chạy tìm thấy thứ gì đó rơi vào hộp thư Triage; `/goal` để chạy-đến-khi-xong | Tác vụ lập lịch và cron, `/loop`, `/goal`, hooks, GitHub Actions |
| **Worktrees** | Cô lập các tính năng song song | Worktree tích hợp sẵn cho từng thread | `git worktree`, `--worktree`, `isolation: worktree` trên một subagent |
| **Skills** | Mã hóa kiến thức dự án | Agent Skills (`SKILL.md`), được gọi bằng `$name` hoặc ngầm định | Agent Skills (`SKILL.md`) |
| **Plugins / Connectors** | Kết nối các công cụ của bạn | Connectors (MCP) cộng plugins để phân phối | MCP servers cộng plugins |
| **Sub-agents** | Đề xuất ý tưởng và kiểm chứng | Subagents định nghĩa bằng TOML trong `.codex/agents/` | Task subagents trong `.claude/agents/`, agent teams |
| **State (memory)** | Theo dõi những gì đã xong | Markdown hoặc Linear qua một connector | Markdown (`AGENTS.md`, file tiến độ) hoặc Linear qua MCP |

> "Tên có hơi khác nhau chỗ này chỗ kia nhưng khả năng là cùng một thứ."

### 3.2 Automations — nhịp đập

**Automations là thứ khiến một vòng lặp trở thành vòng lặp thực sự, không chỉ một lần chạy bạn làm một lần rồi thôi.**

- **Codex app**: tạo một automation trong tab Automations — chọn **dự án, prompt nó sẽ chạy, tần suất, và liệu nó chạy trên checkout cục bộ của bạn hay trên một worktree nền**. Các lượt chạy tìm thấy thứ gì đó sẽ đến một hộp thư **Triage inbox**; các lượt chạy không tìm thấy gì sẽ tự lưu trữ ("cũng hay"). OpenAI dùng chúng nội bộ cho những việc nhàm chán: **phân loại issue hằng ngày, tóm tắt lỗi CI, viết commit briefing, săn lỗi do ai đó thêm tuần trước.** Một automation có thể gọi một skill — giúp việc định kỳ dễ bảo trì: bạn gọi `$skill-name` thay vì dán cả bức tường chỉ dẫn vào một lịch trình không ai chịu cập nhật.
- **Claude Code**: đến cùng một đích qua lập lịch và hooks — `/loop` để chạy lại một prompt/lệnh theo chu kỳ, cron cho tác vụ định kỳ, hooks để kích hoạt lệnh shell tại các điểm trong vòng đời, hoặc đẩy toàn bộ lên **GitHub Actions** để nó tiếp tục chạy sau khi bạn đóng laptop.

Hai nguyên thủy trong phiên làm việc đáng biết (gần với trọng tâm của bài viết hơn):

- **`/loop`**: chạy lại theo một chu kỳ.
- **`/goal`**: tiếp tục cho đến khi một điều kiện bạn viết thực sự đúng; **sau mỗi lượt, một mô hình nhỏ riêng biệt kiểm tra xem bạn đã xong chưa** — agent viết mã không phải là người chấm điểm nó. Đưa cho nó thứ gì đó như "tất cả test trong test/auth đều pass và lint sạch" rồi bước đi. Codex cũng có thứ tương tự, cũng gọi là `/goal`: nó hoạt động qua nhiều lượt cho đến khi một điều kiện dừng kiểm chứng được giữ vững, với pause/resume/clear.

> "Cùng một nguyên thủy, cả hai công cụ, đó chính là khuôn mẫu của cả bài viết này."

**Vai trò**: Automations là phần **đưa công việc lên bề mặt**; phần còn lại của vòng lặp hành động trên đó.

### 3.3 Worktrees — để song song không biến thành hỗn loạn

**Ngay khi bạn chạy nhiều hơn một agent, va chạm file trở thành điểm gãy.** Hai agent ghi cùng một file chính xác là cơn đau đầu giống hai kỹ sư commit vào cùng những dòng mã mà không nói chuyện với nhau.

- **git worktree**: một thư mục làm việc riêng trên nhánh riêng chia sẻ cùng lịch sử repo — chỉnh sửa của một agent **về mặt vật lý không thể chạm tới** checkout của người kia.
- **Codex**: tích hợp hỗ trợ worktree ngay từ đầu, để nhiều thread cùng truy cập một repo mà không va vào nhau.
- **Claude Code**: cô lập tương tự qua `git worktree`, cờ `--worktree` để mở phiên trong checkout riêng của nó, và cài đặt `isolation: worktree` trên một subagent để mỗi trợ thủ có một checkout tự dọn dẹp mới.

Điểm của Addy (lặp lại *thuế điều phối* của ông): **worktrees loại bỏ va chạm cơ học, nhưng BẠN vẫn là trần nhà** — băng thông rà soát của bạn quyết định bạn thực sự chạy được bao nhiêu agent, chứ không phải công cụ.

### 3.4 Skills — ngừng giải thích dự án của bạn mỗi lần

**Một skill là cách bạn ngừng việc giải thích lại cùng một ngữ cảnh dự án mỗi phiên như một con cá vàng.**

- Cả hai công cụ dùng chung một định dạng: một thư mục chứa `SKILL.md` bên trong giữ chỉ dẫn và metadata, cộng các script / references / assets tùy chọn.
- **Codex**: chạy một skill khi bạn gọi nó bằng `$` hoặc `/skills`, hoặc tự động khi tác vụ của bạn khớp với mô tả skill — đó là lý do một mô tả chặt chẽ, nhàm chán thắng mô tả khéo léo.
- **Claude Code**: cùng một cơ chế.

Skills là liều thuốc giải cho **nợ ý định (intent debt)**. Như Addy đã lập luận trong *intent debt*: **một agent bắt đầu mỗi phiên với trạng thái trống và lấp đầy mọi lỗ hổng trong ý định của bạn bằng một phỏng đoán tự tin.** Một skill ghi ý định đó ra bên ngoài — quy ước, các bước build, cái "chúng ta không làm theo cách này vì sự cố kia" — được viết một lần tại nơi agent đọc nó mỗi lần chạy.

> Không có skills, vòng lặp suy luận lại toàn bộ dự án của bạn từ con số không mỗi chu kỳ; có skills, nó kiểu như lãi kép.

Một sự phân biệt cần nắm rõ: **skill là định dạng tác giả, plugin là cách bạn phân phối nó.** Chia sẻ một skill qua nhiều repo hoặc gói nhiều skill lại bằng cách đóng gói chúng thành một plugin — đúng trong Codex, đúng trong Claude Code.

### 3.5 Plugins & Connectors — vòng lặp chạm vào các công cụ thật của bạn

**Một vòng lặp chỉ nhìn thấy filesystem là một vòng lặp tí hon.**

- **Connectors** (xây trên **MCP**) để agent đọc hệ thống theo dõi issue của bạn, truy vấn cơ sở dữ liệu, gọi staging API, thả tin nhắn vào Slack.
- Codex và Claude Code đều nói được MCP, nên **một connector bạn viết cho cái này thường hoạt động luôn ở cái kia**.
- **Plugins** gói gọn connectors và skills để đồng nghiệp của bạn cài trọn bộ thiết lập của bạn trong một lần thay vì dựng lại mọi thứ từ trí nhớ.

Đây là khác biệt giữa một agent nói "đây là cách sửa" và **một vòng lặp tự mở PR, liên kết ticket Linear và ping kênh khi CI xanh — mà không cần ai làm gì.** Connectors là lý do vòng lặp có thể hành động bên trong môi trường thực của bạn thay vì chỉ nói cho bạn biết nó sẽ làm gì nếu có thể.

### 3.6 Sub-agents — giữ người tạo xa khỏi người kiểm tra

**Điều hữu ích nhất về mặt cấu trúc trong một vòng lặp, cho tới nay, là tách người viết khỏi người kiểm tra.**

> Mô hình viết mã quá dễ dãi khi chấm điểm bài tập của chính mình. Một agent thứ hai với chỉ dẫn khác — và đôi khi là một mô hình khác — bắt được những thứ mà agent đầu tiên tự thuyết phục chính mình.

- **Codex**: chỉ sinh subagent khi bạn yêu cầu; chạy chúng song song; gộp kết quả lại thành một câu trả lời. Định nghĩa agent riêng bằng TOML trong `.codex/agents/` (tên, mô tả, chỉ dẫn, mô hình và mức nỗ lực suy luận tùy chọn) — để **người rà soát bảo mật của bạn có thể là một mô hình mạnh ở mức nỗ lực cao** trong khi **người khám phá là một thứ nhanh chỉ-đọc**.
- **Claude Code**: task subagents trong `.claude/agents/` và **agent teams** trao việc cho nhau.
- Phân công phổ biến ở cả hai: **một người khám phá, một người hiện thực hóa, một người kiểm chứng theo spec.**

Vì sao điều này quan trọng đặc biệt bên trong một vòng lặp: **vòng lặp chạy trong khi bạn không nhìn, nên một bộ kiểm chứng bạn thực sự tin tưởng là lý do duy nhất bạn có thể rời đi.** Cái giá: subagents đốt nhiều token hơn (mỗi cái làm công việc mô hình và công cụ riêng) — hãy chi chúng ở nơi mà ý kiến thứ hai đáng giá tiền.

Addy cũng chỉ ra: **`/goal` của Claude Code về bản chất là khuôn mẫu này bên dưới lớp vỏ** — một mô hình mới quyết định vòng lặp đã xong chưa thay vì mô hình làm việc đó: sự tách người tạo/người kiểm tra được áp dụng ngay vào chính điều kiện dừng.

### 3.7 Một vòng lặp hoàn chỉnh trông như thế nào (một hình dạng Addy hay dùng)

Ghép lại với nhau và một thread đơn lẻ biến thành một bảng điều khiển nhỏ:

> 1. **Một automation chạy mỗi sáng trên repo.** Prompt của nó gọi một **skill phân loại** đọc các lỗi CI hôm qua, các issue đang mở, và các commit gần đây, rồi ghi phát hiện vào một file markdown hoặc bảng Linear.
> 2. Với mỗi phát hiện đáng làm, thread mở một **worktree** cô lập và cử một **sub-agent soạn thảo bản sửa**.
> 3. **Một sub-agent thứ hai rà soát bản nháp đó** dựa trên các skill của dự án và các test hiện có.
> 4. **Connectors** để vòng lặp mở PR và cập nhật ticket.
> 5. Bất cứ điều gì vòng lặp không xử lý được sẽ rơi vào **triage inbox** dành cho bạn.
> 6. **File trạng thái là xương sống của toàn bộ hệ thống** — nó nhớ những gì đã thử, những gì đã pass, những gì còn đang mở, để lượt chạy sáng mai tiếp tục từ nơi hôm nay dừng lại.

Rồi Addy chốt lại điểm chính:

> "Hãy nhìn những gì bạn thực sự đã làm ở đó. **Bạn thiết kế nó một lần. Bạn không nhắc bất kỳ bước nào trong số đó.** Đó là toàn bộ quan điểm của Steinberger được hiện thực hóa — và nó là cùng một vòng lặp trong Codex hoặc trong Claude Code, bởi vì các mảnh ghép là các mảnh ghép giống nhau."

---

## 4. Triết Lý Thiết Kế: Ba Điều Vòng Lặp Vẫn Không Làm Thay Bạn

Lời cảnh báo quan trọng nhất của Addy trong toàn bộ bài viết: **"Vòng lặp thay đổi công việc, nó không xóa bạn khỏi công việc đó."** Và ba vấn đề càng trở nên *sắc nét hơn* khi vòng lặp tốt hơn, chứ không dễ hơn.

### 4.1 Kiểm chứng vẫn thuộc về bạn

> "Một vòng lặp chạy không có người trông là một vòng lặp phạm sai lầm không có người trông."

Bạn tách sub-agent kiểm chứng khỏi người tạo để khiến câu "xong rồi" của vòng lặp có ý nghĩa — nhưng dù vậy, **"xong" là một tuyên bố chứ không phải một bằng chứng.** Addy liên tục quay lại câu nói từ *code review in the age of AI*: **công việc của bạn là phát hành mã bạn đã xác nhận là hoạt động.**

### 4.2 Hiểu biết của bạn vẫn mai một nếu bạn cho phép

> Vòng lặp phát hành mã bạn không viết càng nhanh, khoảng cách giữa những gì tồn tại và những gì bạn thực sự nắm càng lớn. Đó là **nợ hiểu biết (comprehension debt)** — và một vòng lặp trơn tru chỉ làm nó tăng nhanh hơn, **trừ khi bạn đọc những gì vòng lặp tạo ra.**

### 4.3 Tư thế thoải mái là tư thế nguy hiểm: đầu hàng nhận thức

> Khi vòng lặp tự vận hành, rất dễ ngừng có chính kiến và chỉ nhận bất cứ thứ gì nó trả về. Addy gọi đó là **đầu hàng nhận thức (cognitive surrender)**.

Câu triết lý nhất trong bài viết:

> **"Thiết kế vòng lặp là liều thuốc khi bạn làm nó với sự phán đoán và là chất xúc tác khi bạn làm nó để trốn tránh suy nghĩ — cùng một hành động, kết quả trái ngược."**

### 4.4 Châm ngôn kết: Hãy xây vòng lặp. Vẫn là kỹ sư.

Toàn bộ luận cứ kết của Addy:

1. **Đây là bản xem trước về cách công việc của chúng ta sẽ tiến hóa**: "Tôi nghĩ đây là bản xem trước về cách công việc của chúng ta sẽ tiến hóa."
2. **Nhưng ông không bỏ rà soát của con người**: "Nếu tôi không tự rà soát mã hoặc nếu tôi hoàn toàn dựa vào các vòng lặp tự động để sửa nó, chất lượng sản phẩm của tôi sẽ sụt giảm. Tôi có khả năng sẽ rơi vào một vòng xoáy đi xuống, liên tục đào mình vào hố sâu hơn."
3. **Cân bằng**: "Cứ thiết lập các vòng lặp của bạn, nhưng đừng quên rằng nhắc agent trực tiếp cũng hiệu quả. Tất cả là về việc tìm ra sự cân bằng đúng."
4. **Vòng lặp là thứ bạn tạo nên từ nó**: "Hai người có thể xây cùng một vòng lặp y hệt và nhận kết quả hoàn toàn trái ngược. Một người dùng nó để di chuyển nhanh hơn trên công việc họ hiểu sâu. Người kia dùng nó để tránh hiểu công việc hoàn toàn. **Vòng lặp không biết khác biệt đó. Bạn biết.** Đó là điều khiến thiết kế vòng lặp khó hơn, chứ không dễ hơn, so với prompt engineering."
5. **Điểm đòn bẩy đã dịch chuyển**: "Điểm của Cherny không phải là công việc trở nên dễ hơn. Mà là **điểm đòn bẩy đã dịch chuyển**."
6. **Câu cuối cùng**: "**Hãy xây vòng lặp. Nhưng hãy xây nó như một người có ý định vẫn là kỹ sư, không chỉ là người bấm nút chạy.**"

---

## 5. Tóm Tắt

### 5.1 Bài học cốt lõi

1. **Định nghĩa**: loop engineering = thay thế chính bạn — người nhắc agent; một vòng lặp là một mục tiêu đệ quy — bạn xác định mục đích, AI lặp lại cho đến khi hoàn thành.
2. **Sự dịch chuyển mô hình**: kỷ nguyên "agent là một công cụ và bạn cầm nó từng lượt" gần như đã hết — bạn xây một hệ thống nhỏ tự chọc vào các agent.
3. **Vị trí**: vòng lặp nằm một tầng trên harness — cùng một harness, nhưng nó chạy theo timer, sinh sub-agent, và tự nạp cho chính nó.
4. **Không phụ thuộc công cụ**: các mảnh ghép được đóng sẵn bên trong sản phẩm (Codex / Claude Code); hình dạng giống nhau → ngừng tranh cãi về công cụ, thiết kế một vòng lặp hoạt động dù bạn ngồi ở đâu.
5. **Năm khối xây dựng + bộ nhớ**: Automations (nhịp đập), Worktrees (cô lập song song), Skills (kiến thức dự án lãi kép), Plugins/Connectors (vươn tới công cụ thật của bạn), Sub-agents (tách người tạo/người kiểm tra) + Memory (file trạng thái là xương sống).
6. **Kiểm chứng vẫn thuộc về bạn**: "xong" là một tuyên bố, không phải bằng chứng; một vòng lặp không người trông phạm sai lầm không người trông.
7. **Nợ hiểu biết & đầu hàng nhận thức**: vòng lặp phát hành mã bạn không viết càng nhanh, khoảng cách hiểu càng lớn; tư thế thoải mái "cứ nhận đầu ra" là tư thế nguy hiểm.
8. **Thiết kế vòng lặp khó hơn prompt engineering**: vòng lặp không biết bạn đang tăng tốc hay đang né tránh — chỉ bạn biết. Điểm đòn bẩy đã dịch chuyển, nhưng trách nhiệm thì không.

### 5.2 Tóm tắt một câu

> **Vòng lặp thay đổi câu hỏi "ai nhắc" — chứ không thay đổi câu hỏi "ai chịu trách nhiệm."** Hãy xây vòng lặp của bạn để tìm việc, phân việc, và kiểm chứng kết quả; nhưng hãy đọc những gì nó tạo ra, giữ hiểu biết của bạn về mã, và thiết kế nó với sự phán đoán — **Hãy xây vòng lặp. Vẫn là kỹ sư.**

---

## References

- Bài gốc: Addy Osmani, *Loop Engineering* (2026-06-07) — `https://addyosmani.com/blog/loop-engineering/`
- Loạt bài liên quan của Addy Osmani: *Agent Harness Engineering*, *The Factory Model*, *Orchestration Tax*, *Intent Debt*, *Comprehension Debt*, *Cognitive Surrender*, *Adversarial Code Review*, *Code Agent Orchestra*, *Long-Running Agents*, *Code Review in the Age of AI* — đều có thể tìm tại `addyosmani.com/blog/`
- Peter Steinberger (người tạo ra OpenClaw) về "thiết kế các vòng lặp nhắc agent của bạn"
- Boris Cherny (trưởng nhóm Claude Code tại Anthropic) về "công việc của tôi là viết vòng lặp"
- Liên quan trên trang này: *Loop Engineering Deep Dive (Bài Gốc Của Cobus Greyling)* (`loop-engineering-substack-analysis`), *Loop Engineering Orange Book Deep Dive* (`loop-engineering-orange-book`)
