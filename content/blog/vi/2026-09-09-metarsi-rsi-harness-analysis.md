---
title: 'MetaRSI/RSI-Harness Phân tích sâu: Công cụ AI có thể tự chế tạo công cụ của mình'
date: "2026-09-09"
description: "Phân tích sâu RSI-Harness của CosmosMind-ai: Hệ thống Tự Cải Thiện Đệ Quy Siêu Cấp (Meta-Recursive Self-Improving System). Genome biến cấu hình harness của AI thành thư mục có thể versioning, chia sẻ và tạo tự động; harness-rsi là một meta-tool được xây dựng từ chính năng lực của nó, đọc lịch sử của bạn để tạo Genome cá nhân hóa."
tags:
  - RSI-Harness
  - MetaRSI
  - Genome
  - Recursive Self-Improving
  - Pi Coding Agent
  - AI Agent
  - Prompt Engineering
  - Open Source
categories:
  - Phân tích sâu
  - AI Tools
  - Open Source
  - Recursive Self-Improving
---

# MetaRSI/RSI-Harness Phân tích sâu: Công cụ AI có thể tự chế tạo công cụ của mình

"Điều chỉnh AI agent hiện nay phân tán configuration ra settings.json, CLI flags, prompt dán vào, và 'nhớ cái prompt hôm trước nó ngon lắm' — không có gì trong số đó có thể versioning, diff, tái tạo, hay chuyển cho người khác."

Đây là câu mở đầu của developer RSI-Harness. Dự án này cố gắng trả lời một câu hỏi cơ bản: **Nếu AI có thể sửa weights của chính mình, tại sao nó không thể sửa harness của chính mình — dùng đúng cách mà bạn sẽ dùng để viết nó thủ công?**

Câu trả lời chính là RSI-Harness.

---

## 1. Bối cảnh dự án và Vị trí Cốt lõi

### Ý nghĩa tên gọi

**RSI-Harness** = Recursive Self-Improving Harness. Tên chứa hai tầng đệ quy:

- **Tầng 1**: Dùng Pi coding agent làm nền tảng, thêm một lớp cấu hình gọi là Genome ở trên
- **Tầng 2**: harness-rsi là một Genome đặc biệt bên trong, đầu ra của nó là các Genome khác — một meta-tool được xây dựng từ chính năng lực của nó, đọc lịch sử của bạn để tự động tạo harness cá nhân hóa

**MetaRSI** là tên trong paper, chỉ "Hệ thống Tự Cải Thiện Đệ Quy Siêu Cấp" — không phải model tự sửa weights của mình, mà là harness tự sửa cấu hình của mình, dùng đúng cách mà bạn dùng để viết harness thủ công.

### Nó giải quyết vấn đề gì

Tình trạng điều chỉnh AI agent hiện nay:

| Tình trạng | Vấn đề |
|------------|--------|
| settings.json | Chỉ một phần fields |
| CLI flags | Mỗi lần phải gõ, không thể lưu lại |
| Prompt dán | Không thể versioning |
| "Nhớ" | Hoàn toàn không thể tái tạo |

Giải pháp của RSI-Harness: gom tất cả cấu hình harness (system prompt, tool set, skills, MCP servers, extensions, runtime policies, memory, keybindings, themes) vào một thư mục, gọi là **Genome**. Chuyển ngữ cảnh là chuyển Genome.

### Kiến trúc cốt lõi

```
Pi coding-agent ← Core bất biến, không fork
     ↓
Genome adapter ← Chính dự án RSI-Harness
     ↓
harness-rsi ← Một Genome, đầu ra là các Genome khác
```

RSI-Harness chỉ làm một việc: **thêm một lớp cấu hình Genome trên bề mặt cấu hình công khai của Pi**.

---

## 2. Khái niệm Cốt lõi: Genome là gì

### 2.1 Định nghĩa

Genome là một thư mục cấu hình harness đầy đủ, có thể đóng gói và phân phối độc lập.

```
my-genome/
  genome.json              # manifest + danh sách component
  components/              # 12 file cấu hình component
  contracts/               # contract doc cho mỗi component
  skills/                  # skill files đi kèm
  extension/               # extensions đi kèm
```

12 components, quyền sở hữu field loại trừ lẫn nhau. Ghi ngoài ranh giới sẽ fail ngay khi load.

### 2.2 Ngữ nghĩa Merge: Kế thừa, không thay thế

Cấu hình Genome là **patch, không phải replacement**:

- Field vắng → kế thừa từ base (cuối cùng là default của Pi)
- Field là `null` → xóa field, trả lại cho Pi
- Field có giá trị → ghi đè; object merge đệ quy, array thay thế toàn bộ

Nghĩa là một Genome chỉ khai báo component `model` vẫn có đầy đủ system prompt và tool set của Pi. **Không cần viết lại toàn bộ harness chỉ để đổi một field.**

### 2.3 Hai Genome có sẵn

| Genome | Vai trò |
|--------|---------|
| `coding` (hoặc `paperlab`) | Ví dụ cấu hình harness viết code |
| `harness-rsi` | Tạo các Genome khác, khởi động bằng lệnh `gee` |

---

## 3. harness-rsi: Xây dựng chính nó bằng chính năng lực của nó

Đây là phần thú vị nhất của dự án.

### 3.1 Tại sao nó chỉ là một Genome

Mọi thứ harness-rsi cần đều được cung cấp bởi components có sẵn của Genome:

| Cần gì | Dùng component nào |
|--------|-------------------|
| Định vị và quy trình bắt buộc | `instructions` `append_system_prompt` |
| Tài liệu phương pháp, load theo yêu cầu | `skills`, Pi skill dạng file |
| Các tool đọc session | `tools` (Pi mặc định tắt 3 cái này) |
| Ba tool tương tác | `integrations.extensions`, `.ts` riêng của Genome |
| Bản nháp và session dài | `policies` scratchpad và compaction |
| Chặn skill toàn cục không liên quan | `resources.isolate: true` |

**Không dòng nào trong `src/` phục vụ riêng cho harness-rsi.** Đó là bằng chứng của invariant: "Genome có thể cấu hình mọi thứ."

### 3.2 Tác dụng của `resources.isolate: true`

Đo thực tế: không cách ly thì 58 skills trong `~/.agents/skills` đều vào system prompt, 36 KB; cách ly xong chỉ còn `genome-authoring` một cái, 7 KB. Với agent có quy trình nghiêm ngặt, 57 skills không liên quan vừa là noise vừa là nguồn nhiễu.

### 3.3 GEE: Genome Expression Engine

GEE là lệnh front-end của harness-rsi:

```bash
gee  # tương đương rsih :harness-rsi
```

Cách GEE hoạt động độc đáo: **không hỏi bạn muốn system prompt gì — nó đọc những gì bạn thực sự đã làm.**

Luồng tương tác:

1. **Hỏi về kịch bản trước**: Genome này dùng để làm gì? Nói bằng lời của bạn, càng chi tiết càng tốt
2. **Hỏi phạm vi session**: quét lịch sử của những harness nào
3. **Gom session theo thư mục làm việc**: trả về đường dẫn, nguồn, số session, kích thước
4. **Người dùng chọn workspace**
5. **Agent tự phân tích**: trước tiên bash để tổng hợp (histogram tool calls, lệnh thường dùng), rồi đọc chọn lọc raw text
6. **Trình bày kế hoạch TRƯỚC khi viết**: đưa toàn bộ Genome bằng văn bản
7. **Chỉ viết file sau khi xác nhận**: ghi vào `~/.rsih/genomes/<name>/`, chạy `rsih genome validate`

### 3.4 Một nguyên tắc thiết kế

> **Không gì được viết thành code trừ những gì agent thực sự không thể tự lấy được.**

Extension chỉ có ba tool, vì chỉ ba thứ agent thực sự không làm được. **Đổi chiến lược không cần đổi code.**

---

## 4. 12 Components Chi tiết

| Component | Sở hữu |
|-----------|---------|
| instructions | `system_prompt`, `append_system_prompt` |
| tools | Bật/tắt tool có sẵn, thu hẹp args, tool được sinh ra |
| skills | Inline skills và Pi skill files |
| commands | Inline slash commands |
| model | Default provider/model, model cycle list |
| runtime | Tool execution, steering, max turns |
| policies | Tool policies, scratchpad, compaction, memory |
| integrations | Pi extensions và stdio MCP servers |
| appearance | Theme assets, lựa chọn theme |
| settings | Mọi field của Pi settings.json |
| keybindings | Mọi binding của Pi keybindings.json |
| resources | Phạm vi tự động khám phá tài nguyên (isolate) |

---

## 5. Hướng dẫn Cài đặt và Sử dụng

### 5.1 Yêu cầu

- Node 22.19+
- bun khuyến nghị (biên dịch thành binary một file)

### 5.2 Cài đặt

```bash
git clone https://github.com/CosmosMind-ai/RSI-Harness.git
cd RSI-Harness
./install.sh
```

### 5.3 Sử dụng cơ bản

```bash
rsih                           # khởi động, tương đương pi
rsih --resume                  # tiếp tục session trước
rsih -p "Review the workspace" # lệnh một lần
```

### 5.4 Khởi động Genome

```bash
rsih :coding                   # viết tắt dấu hai chấm
rsih +coding                   # dấu cộng
```

### 5.5 GEE tạo Genome mới

```bash
gee  # tương đương rsih :harness-rsi
```

### 5.6 Quản lý Genome

```bash
rsih genome list               # liệt kê Genome đã cài
rsih genome validate ./my-genome  # kiểm tra Genome
rsih genome install coding     # khôi phục phiên bản gốc
```

---

## 6. Triết lý Thiết kế

### 6.1 Cấu hình là công dân hạng nhất

Genome gom mọi cấu hình vào thư mục có thể versioning, diff, chia sẻ, biến cấu hình harness thành tài sản kỹ thuật thực sự.

### 6.2 Core bất biến, cấu hình là tất cả

Pi Core bất biến. RSI-Harness không fork nó, chỉ dùng bề mặt cấu hình công khai. Mỗi lần Pi nâng cấp, RSI-Harness tự động có thêm năng lực mới.

### 6.3 Meta-tool tự tham chiếu

harness-rsi được xây từ chính components của Genome, **không dòng code đặc biệt nào**. Đó là thực hành nghiêm ngặt của "RSI": tool xây chính nó bằng đúng phương tiện mà bạn dùng để viết nó.

### 6.4 Bằng chứng hơn tự khai

GEE không hỏi "bạn muốn harness gì" mà đọc những gì bạn thực sự đã làm. Bằng chứng phải trả lời "điều này có thật không", không phải "đây có phải điều họ muốn không". Khi bằng chứng và ý định mâu thuẫn, dùng `AskUserQuestion` đưa cả hai cách đọc cho người dùng.

### 6.5 Seed cập nhật nhưng không ghi đè bạn

Seed cập nhật: bạn chưa sửa → tự động refresh. Đã sửa → chỉ cảnh báo, không ghi đè. Genome cùng tên của người khác → không ghi đè (genome_id khác).

### 6.6 Ràng buộc tạo ra sự ổn định

12 components, quyền sở hữu field loại trừ lẫn nhau, ghi ngoài ranh giới fail khi load. Component chỉ quản lý thứ thuộc về nó, không xâm phạm ranh giới.

---

## 7. Quan điểm và Kết luận Cốt lõi

### Quan điểm 1: Cấu hình harness nên là một artifact kỹ thuật có versioning

Ngày nay chúng ta có thể code-review code, nhưng không thể diff "cái prompt ngon đó". Genome làm được điều này. **Đây mới là điểm khởi đầu của engineering AI agent thực sự.**

### Quan điểm 2: Hình thức đúng của Meta-RSI không phải sửa weights

Tự cải thiện đệ quy không nên là model sửa weights của chính nó (nguy hiểm, không dự đoán được) mà nên là harness sửa cấu hình của chính nó (an toàn, có thể kiểm toán, rollback được). RSI-Harness chứng minh điều này.

### Quan điểm 3: Cá nhân hóa từ bằng chứng là hướng đi của thế hệ AI cấu hình tiếp theo

Cách tiếp cận truyền thống hỏi người dùng "bạn muốn gì" rồi viết cấu hình từ câu trả lời. Vấn đề: người dùng không biết họ muốn gì. GEE trích xuất patterns từ hành vi thực tế — những gì bạn làm đáng tin hơn những gì bạn nói. Những field không có bằng chứng giữ trống — trống nghĩa là kế thừa default của Pi, và default luôn là câu trả lời an toàn.

### Quan điểm 4: Tool tự xây chính nó bằng chính phương tiện của nó là khả thi

harness-rsi chứng minh điều này: extension chỉ có ba tool (`scan_workspaces`, `choose_workspaces`, `ask_user_question`), vì chỉ ba thứ agent thực sự không làm được. Mọi thứ khác được điều khiển bởi text trong skills và system prompt. **Đổi chiến lược không cần đổi code.** Đó mới là thiết kế thực sự bền vững.

### Quan điểm 5: Cách ly là điều kiện cần cho agent chuyên nghiệp

58 skills không liên quan tràn vào prompt sẽ nhấn chìm tín hiệu. `resources.isolate: true` khiến prompt chỉ chứa những gì Genome khai báo. Với agent có quy trình nghiêm ngặt, đầu vào không liên quan không chỉ là noise mà là kẻ thù của sự ổn định.

---

## 8. Tình trạng Hiện tại và Hạn chế

### Đã triển khai

- Xây dựng Genome dùng được đầu cuối (12 components phủ toàn bộ bề mặt cấu hình của Pi)
- Ngữ nghĩa merge inherit-by-default
- Lớp biên dịch settings
- Đóng gói thư mục và phân phối
- Cơ chế cập nhật seed
- harness-rsi tạo Genome tương tác từ RSIH, Pi và Claude Code session stores

### Chưa triển khai

- Cài đặt từ xa một lệnh (hiện chỉ chấp nhận tên có sẵn và đường dẫn cục bộ)
- Cổng kiểm duyệt trước khi chia sẻ
- Tích hợp Codex session store (1341 files / 2.9 GB)

---

## 9. Tóm tắt

RSI-Harness trả lời một câu hỏi cơ bản: làm sao cấu hình harness của AI agent có thể được coi như một artifact kỹ thuật như code?

Câu trả lời: **biến nó thành một thư mục, một Genome.**

- Có thể versioning, diff, tái tạo, chia sẻ
- 12 components phủ toàn bộ bề mặt cấu hình, merge inherit-by-default
- harness-rsi xây chính nó bằng chính năng lực của nó, tạo Genome cá nhân hóa từ hành vi thực tế của người dùng
- Không fork Pi Core, chỉ dùng bề mặt cấu hình công khai

**Tool xây chính nó bằng chính phương tiện của nó, tự nhận thức qua bằng chứng không phải tự khai, đạt được cải thiện đệ quy qua cấu hình không phải weights.** Đó mới là hình dáng đúng của Meta-RSI.

Dự án: https://github.com/CosmosMind-ai/RSI-Harness
Paper: https://www.cosmosmind.ai/research/metarsi-v1.pdf
HuggingFace: https://huggingface.co/CosmosMind/RSI-Harness

---

Trên đây là toàn bộ nội dung bài chia sẻ. Nếu thấy hữu ích, hãy ủng hộ bằng like, share và comment. Để nhận bài viết mới nhất, các bạn có thể theo dõi tài khoản WeChat 「比特财商」.

Đăng tải đầu tiên trên WeChat Official Account 「比特财商」.
