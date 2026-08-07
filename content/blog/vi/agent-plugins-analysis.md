---
title: "Agent Plugins Phân Tích Chuyên Sâu: Tiêu Chuẩn Đóng Gói Plugin AI Agent Trung Lập Về Nhà Cung Cấp — Đồng Sáng Lập bởi Amazon, Cursor, Microsoft, OpenAI và Vercel"
description: "Bài phân tích toàn diện về đặc tả Agent Plugins v1.0.0 được công bố tại agent-plugins.org — một tiêu chuẩn mở, trung lập về nhà cung cấp để đóng gói các thành phần tái sử dụng thành plugin di động, định nghĩa một định dạng dùng chung cho Agent Skills và MCP servers. Ý tưởng cốt lõi: mọi client AI agent đều tự phát minh ra định dạng plugin riêng dù plugin chứa cùng các thành phần cơ bản, buộc tác giả phải sắp xếp lại hoặc nhân bản thành phần cho từng client. Agent Plugins định nghĩa một 'tầng tương tác tối thiểu' — các thành phần dùng chung dùng một cấu trúc có thể dự đoán được, trong khi phân phối, cài đặt, quyền hạn, trải nghiệm người dùng và khả năng riêng của từng client vẫn nằm dưới sự kiểm soát của mỗi client. Bài viết này bao quát tất cả: vì sao nó tồn tại, mô hình thư mục-là-gói và đặc tả manifest, ba giao thức vận chuyển MCP (stdio / Streamable HTTP / HTTP+SSE cũ), biến plugin PLUGIN_ROOT và PLUGIN_DATA, phần mở rộng client theo tên miền ngược, áp dụng từng phần, cô lập lỗi, và triết lý đằng sau mười quyết định thiết kế. Từ ý tưởng cốt lõi, tổng quan dự án và triết lý thiết kế đến hướng dẫn từng bước (hello-plugin tối thiểu → manifest đầy đủ → đóng gói kỹ năng → cấu hình MCP → triển khai client) cùng phần tóm tắt quan điểm và kết luận."
date: "2026-08-07"
author: "TopDigg Research Team"
tags: ["Agent Plugins", "AI Agent", "MCP", "Agent Skills", "Plugin", "Interoperability", "Open Standard", "Amazon", "OpenAI", "Microsoft", "Cursor", "Vercel"]
categories: ["Deep Dive"]
keywords: ["Agent Plugins", "plugin AI agent", "MCP", "Agent Skills", "plugin di động", "tương tác", "tiêu chuẩn mở", "plugin.json", "mcp.json", "PLUGIN_ROOT", "PLUGIN_DATA", "ủy ban kỹ thuật"]
---

# Agent Plugins Phân Tích Chuyên Sâu: Tiêu Chuẩn Đóng Gói Plugin AI Agent Trung Lập Về Nhà Cung Cấp — Đồng Sáng Lập bởi Amazon, Cursor, Microsoft, OpenAI và Vercel

> Ý tưởng cốt lõi: **Agent Plugins là một tiêu chuẩn mở, trung lập về nhà cung cấp để đóng gói các thành phần tái sử dụng thành plugin di động cho AI agent (v1.0.0).** Nó giải quyết một vấn đề phân mảnh thực tế: các client AI agent đều tự phát minh ra định dạng plugin riêng, dù plugin chứa cùng các thành phần cơ bản — tác giả phải sắp xếp lại hoặc nhân bản các thành phần đó cho từng client. Agent Plugins không cố thống nhất mọi thứ. Nó chỉ định nghĩa một tầng tương tác tối thiểu: các thành phần dùng chung dùng một cấu trúc có thể dự đoán được, trong khi phân phối, cài đặt, quyền hạn, trải nghiệm người dùng và khả năng riêng của từng client vẫn nằm dưới sự kiểm soát của mỗi client. Tiêu chuẩn này, được thúc đẩy bởi một **Ủy ban Kỹ thuật (TSC)** có các Core Maintainer ban đầu đến từ Amazon, Cursor, Microsoft, OpenAI và Vercel, ghi cả 'khả năng di động' lẫn 'quyền tự chủ của client' vào đặc tả: thư mục-là-gói, `plugin.json` ở thư mục gốc là tầng tuân thủ duy nhất, `skills/` và `mcp.json` là vị trí thành phần cố định, và tên miền ngược là lối thoát cho phần mở rộng client. Mười quyết định thiết kế rõ ràng trả lời cùng một câu hỏi: **làm sao mua được sự tương tác tối đa của hệ sinh thái với diện tích đặc tả tối thiểu.**

---

## 1. Tổng Quan Dự Án

### 1.1 Nó Là Gì?

**Agent Plugins** là một **tiêu chuẩn đóng gói plugin mở, trung lập về nhà cung cấp** để đóng gói các thành phần tái sử dụng thành plugin di động giúp mở rộng khả năng của AI agent. **Đặc tả v1.0.0** của nó định nghĩa một định dạng dùng chung cho đúng hai loại thành phần:

- **Agent Skills** (định dạng kỹ năng được định nghĩa tại `https://agentskills.io/specification`)
- **MCP servers** (máy chủ Model Context Protocol được định nghĩa tại `https://modelcontextprotocol.io/specification`)

Các client tương thích (công cụ AI agent, công cụ phát triển) có thể phát hiện và tải các plugin này một cách nhất quán.

### 1.2 Số Liệu Chính

- Trang web: `https://agent-plugins.org`
- Kho đặc tả: `https://github.com/agentplugins/agent-plugins-spec`
- Phiên bản đặc tả: **1.0.0** (trạng thái: Working Draft)
- Giấy phép: **Apache-2.0** (văn bản đặc tả + tài liệu kèm theo phát hành kép Apache-2.0 / CC-BY-4.0)
- Core Maintainer ban đầu của TSC: **Amazon, Cursor, Microsoft, OpenAI, Vercel**
- Quản trị: dự án đặc tả mở do cộng đồng quản lý; vai trò do **cá nhân** nắm giữ, không phải công ty; không nhà cung cấp nào được kiểm soát đa số ghế Core Maintainer
- Sản phẩm phát hành: văn bản đặc tả (`spec/1.0.0.md`), JSON Schema manifest plugin, JSON Schema cấu hình MCP, danh sách kiểm tra tuân thủ
- Tài liệu kèm theo: `plugin-authors` (hướng dẫn tác giả), `client-implementers` (hướng dẫn triển khai client), `schemas` (Schema máy đọc được), `llms.txt` / `sitemap.md` (chỉ mục tài liệu)

### 1.3 Nó Giải Quyết Vấn Đề Gì?

**Vấn đề: phân mảnh định dạng plugin.** Các client AI agent (Claude Code, Cursor, công cụ họ OpenAI, các framework agent…) mỗi bên định nghĩa định dạng plugin riêng, dù những plugin đó chứa cùng các thành phần cơ bản. Kết quả: một plugin đóng gói cho client A thường cần chỉnh sửa trước khi client B dùng được, và tác giả phải liên tục sắp xếp lại, nhân bản thành phần cho từng client.

**Câu trả lời: định nghĩa một tầng tương tác.** Agent Plugins chỉ tiêu chuẩn hóa những phần có thể di động giữa các client — các thành phần dùng chung dùng một cấu trúc có thể dự đoán được — trong khi phân phối, cài đặt, quyền hạn, trải nghiệm người dùng, cập nhật và khả năng riêng của từng client vẫn nằm dưới sự kiểm soát của mỗi client. Đặc tả cố ý không quy định: nguồn cài đặt, registry hay marketplace; UX bật/tắt, cập nhật, bộ nhớ đệm; lời nhắc quyền hạn, chính sách tin cậy hay sandbox; cách kỹ năng được hiển thị cho người dùng hoặc mô hình; hành vi nội bộ của phần mở rộng client.

---

## 2. Ý Tưởng Cốt Lõi

### 2.1 Tầng Tương Tác Tối Thiểu

Agent Plugins không phải là một sự thống nhất lớn — nó chỉ tiêu chuẩn hóa **định dạng dùng chung của các phần di động**. Đặc tả diễn đạt như sau:

> Agent Plugins defines a small interoperability floor for the parts that can be portable across clients. (Agent Plugins định nghĩa một tầng tương tác nhỏ cho những phần có thể di động giữa các client.)

Đây là một ranh giới tinh tế: **thứ được tiêu chuẩn hóa là đóng gói, không phải runtime.** Cách plugin được phát hiện, cài đặt, chạy, hiển thị và cấp quyền tiếp tục do từng client quyết định. Tiêu chuẩn chỉ đảm bảo rằng cùng một gói có thể được mọi client tương thích hiểu được.

### 2.2 Thư Mục-Là-Gói

Một Agent Plugin là một **thư mục** — không phải zip, không phải gói tải từ registry:

```text
my-plugin/
├── plugin.json          # Bắt buộc: manifest, định danh plugin và phiên bản đặc tả mục tiêu
├── skills/              # Tùy chọn: vị trí cố định cho Agent Skills
│   └── summarize/
│       ├── SKILL.md
│       ├── scripts/
│       └── references/
├── mcp.json             # Tùy chọn: cấu hình máy chủ MCP
└── com.example.client/  # Tùy chọn: thư mục mở rộng client (tên miền ngược)
```

Chọn thư mục làm đơn vị gói mang lại bốn lợi ích trực tiếp: **kiểm tra được bằng công cụ chuẩn** (`ls`, `cat`, `git`), **chỉnh sửa tại chỗ khi phát triển**, **quản lý phiên bản không cần công cụ đặc biệt**, và **không có lớp gián tiếp trong phát hiện**.

### 2.3 Hai Vị Trí Thành Phần Cố Định

v1 định nghĩa đúng hai loại thành phần, mỗi loại có một vị trí cố định:

- **Skills** → `skills/`: mỗi thư mục con trực tiếp chứa `SKILL.md` là một kỹ năng (không tìm kiếm đệ quy các cấp sâu hơn)
- **MCP servers** → `mcp.json`: tệp cấu hình JSON ở thư mục gốc

Vì sao vị trí cố định quan trọng: `plugin.json` không thể ghi đè chúng hoặc nhúng cấu hình thành phần — **quy tắc phát hiện giống hệt nhau với mọi client**, nên client không cần logic cho nguồn thay thế hay thứ tự ưu tiên.

### 2.4 Phát Triển Mở và Quản Trị Công Khai

- Đề xuất và quyết định kỹ thuật **công khai**; sự tham gia mở cho toàn hệ sinh thái
- Ý tưởng về tính năng mới và thay đổi thực chất bắt đầu từ **GitHub Discussions**, nơi đề xuất phải chứng minh được 'nhu cầu di động cụ thể' và 'sự ủng hộ của người triển khai'
- Điều lệ kỹ thuật (Technical Charter) được định nghĩa tách biệt với định dạng gói; vai trò do **cá nhân** nắm giữ, không phải công ty, và không nhà cung cấp nào kiểm soát đa số Core Maintainer

---

## 3. Triết Lý Thiết Kế

Phụ lục **Design Decisions** ở cuối đặc tả là điểm vào tốt nhất để hiểu triết lý thiết kế của dự án này — nó giải thích từng lý do vì sao mỗi lựa chọn được đưa ra. Mười điểm sau là cốt lõi:

### 3.1 Vì Sao Dùng Thư Mục Để Phát Hiện Thay Vì Định Dạng Lưu Trữ?

`zip`/`tar.gz` hoặc gói registry cần công cụ đặc biệt để kiểm tra. Thư mục có thể được kiểm tra bằng `ls`/`cat`/`git`, chỉnh sửa tại chỗ khi phát triển, và quản lý phiên bản không cần công cụ đặc biệt. **Vị trí cố định ở thư mục gốc** (`skills/`, `mcp.json`) loại bỏ lớp gián tiếp phát hiện, thứ tự ưu tiên nguồn thay thế và cấu hình manifest — những thứ mà mọi client lẽ ra phải tự triển khai.

### 3.2 Vì Sao v1 Chỉ Có Agent Skills và MCP?

Vì cả hai **đã có đặc tả trưởng thành bên ngoài dự án này** (agentskills.io, modelcontextprotocol.io) và có mức áp dụng đa client đáng kể. Các loại thành phần được đề xuất khác — commands, hooks, agents, rules, LSP servers — vẫn quá đặc thù cho từng client để tạo thành một hợp đồng di động ổn định và **không vào v1 cho đến khi định dạng của chúng hội tụ**. Đây là nguyên tắc kỹ thuật kinh điển 'chạy phần end-to-end tối thiểu trước': tiêu chuẩn hóa hai loại có đồng thuận, để sự không chắc chắn cho tương lai.

### 3.3 Vì Sao `plugin.json` Ở Thư Mục Gốc Là Tầng Tuân Thủ?

Mọi client tuân thủ **BẮT BUỘC** kiểm tra `plugin.json` ở thư mục gốc plugin. Điều này cho tác giả plugin một **manifest duy nhất được đảm bảo tồn tại trên mọi client** — tác giả không cần bất kỳ kiến thức đường dẫn riêng của client nào.

### 3.4 Vì Sao Schema Đóng Cho Manifest Di Động?

`plugin.json` ở thư mục gốc chỉ cho phép đúng 10 trường cấp cao: `$schema`, `name`, `version`, `description`, `author`, `homepage`, `repository`, `license`, `keywords`, `extensions`. Schema đóng cho phép **xác thực nghiêm ngặt, phát hiện lỗi chính tả và hoàn thiện khóa theo Schema**. Thí nghiệm của client không thể chiếm các trường cấp cao tùy ý; chúng bị gói trong các khóa tên miền ngược ở `extensions`. Trường cấp cao không xác định vẫn là vi phạm Schema, nhưng client **báo cáo và bỏ qua** thay vì từ chối một plugin vốn hợp lệ — sự khoan dung dành chỗ cho tương lai.

### 3.5 Vì Sao Phần Mở Rộng Client Dùng Tên Miền Ngược?

Định danh tên miền ngược cung cấp một **quy ước phi tập trung tránh xung đột** mà không cần registry tên client trung tâm. Cùng một định danh có thể phục vụ cả dữ liệu manifest (khóa `extensions`) lẫn thư mục riêng của client (tên thư mục cấp cao), và mỗi cách biểu diễn có thể tồn tại độc lập. Thư mục mở rộng nằm ở cấp cao để giữ bố cục plugin phẳng và theo quy ước.

### 3.6 Vì Sao Có Định Dạng Cấu Hình MCP Tường Minh?

Các client hiện tại dùng các hình dạng cấu hình MCP không tương thích và suy đoán giao thức vận chuyển khác nhau. Agent Plugins định nghĩa một **hợp đóng (closed union) tường minh** có ý nghĩa độc lập với mọi định dạng gốc của client. Việc phân biệt Streamable HTTP với HTTP+SSE cũ cho mỗi mục một **giao thức vận chuyển ban đầu không mơ hồ**, trong khi hành vi dự phòng sau lỗi kết nối nằm ngoài định dạng di động.

### 3.7 Vì Sao Client Có Thể Chỉ Hỗ Trợ Một Giao Thức Vận Chuyển MCP Chuẩn?

Stdio và Streamable HTTP phục vụ các mô hình triển khai và bảo mật khác nhau. Yêu cầu mọi client hỗ trợ MCP phải hỗ trợ cả thực thi tiến trình cục bộ lẫn kết nối HTTP từ xa sẽ **mở rộng bề mặt triển khai và tin cậy** của nó mà không thay đổi định dạng cấu hình di động. Vì mỗi mục máy chủ khai báo giao thức vận chuyển của mình, client có thể bỏ qua các mục không hỗ trợ trong khi vẫn tải các máy chủ và thành phần độc lập khác.

### 3.8 Vì Sao Schema Dùng Chung Phiên Bản Đặc Tả?

Schema của `plugin.json` và `mcp.json` dùng phiên bản đặc tả Agent Plugins thay vì các chuỗi phiên bản độc lập. Điều này cho tác giả và client chỉ **một** phiên bản định dạng di động để hiểu, ngăn gói hỗn hợp phiên bản, và để `$schema` chọn toàn bộ hợp đồng xác thực và diễn giải — bao gồm cả các yêu cầu mà JSON Schema không thể biểu diễn. Việc tái phát hành một Schema không thay đổi kèm bản phát hành đặc tả mới là chi phí bảo trì nhỏ so với việc phơi ra ba mốc thời gian tương thích độc lập.

### 3.9 Vì Sao Dùng Biến Plugin Thay Vì Đường Dẫn Tương Đối Trong Cấu Hình?

Đối số máy chủ MCP thường cần đường dẫn tuyệt đối lúc chạy. `${PLUGIN_ROOT}` cung cấp một **mốc không mơ hồ, do client giải quyết** cho các tệp đi kèm gói; `${PLUGIN_DATA}` xác định **thư mục trạng thái ghi được do client quản lý**, tồn tại qua các lần cập nhật. Trường `command` không dùng phép chèn: đường dẫn `./` được giải quyết trực tiếp so với thư mục gốc plugin, và tên trần dùng quy tắc tìm kiếm tệp thực thi của nền tảng. **Coi `command` như một token duy nhất** tránh việc phải yêu cầu client phân tích và thoát các chuỗi lệnh shell do người dùng viết. Các client khác nhau về môi trường kế thừa và hành vi `PATH`, nên Agent Plugins tiêu chuẩn hóa việc ghi đè môi trường được cấu hình nhưng để tìm kiếm lệnh trần do client quyết định — lệnh theo đường dẫn tương đối plugin cung cấp việc thực thi gói đi kèm mang tính xác định.

### 3.10 Vì Sao Lỗi Thành Phần Không Gây Chết?

Khi một máy chủ MCP không khởi động hoặc kết nối được, client **tiếp tục tải** các thành phần còn lại của plugin. Một plugin cung cấp cả kỹ năng lẫn máy chủ MCP không nên trở nên hoàn toàn vô dụng chỉ vì một máy chủ không khả dụng. Đặc tả ghép lỗi thành phần không gây chết với **yêu cầu chẩn đoán** để lỗi hiện hữu thay vì im lặng.

---

## 4. Hướng Dẫn Chi Tiết

### 4.1 Tạo Plugin Tối Thiểu (hello-plugin)

Plugin nhỏ nhất có ích là một thư mục cộng một kỹ năng, qua ba bước:

```text
hello-plugin/
├── plugin.json
└── skills/
    └── greet/
        └── SKILL.md
```

**Bước 1: Tạo `plugin.json`**

```json
{
  "$schema": "https://agent-plugins.org/schemas/1.0.0/plugin.schema.json",
  "name": "hello-plugin"
}
```

**Bước 2: Tạo kỹ năng `skills/greet/SKILL.md`**

```markdown
---
name: greet
description: Greet the user and offer help.
---

Greet the user and offer help.
```

**Bước 3: Tải nó**

Một client hỗ trợ kỹ năng đọc `plugin.json`, quét các thư mục con trực tiếp của `skills/`, và xác thực từng `SKILL.md` theo đặc tả Agent Skills. Để thêm máy chủ MCP, hãy đặt `mcp.json` ở thư mục gốc plugin dùng cùng phiên bản Schema Agent Plugins.

> Xem gói có thể sao chép với manifest đầy đủ và kỹ năng thật tại: `https://github.com/agentplugins/agent-plugins-example`

### 4.2 Các Trường Manifest Đầy Đủ

```json
{
  "$schema": "https://agent-plugins.org/schemas/1.0.0/plugin.schema.json",
  "name": "plugin-name",
  "version": "1.2.0",
  "description": "Brief plugin description",
  "author": {
    "name": "Author Name",
    "email": "author@example.com",
    "url": "https://example.com"
  },
  "homepage": "https://docs.example.com/plugin",
  "repository": "https://github.com/example/plugin",
  "license": "MIT",
  "keywords": ["keyword1", "keyword2"],
  "extensions": {
    "com.example.client": {
      "setting": true
    }
  }
}
```

Điểm chính:

- **Chỉ có hai trường bắt buộc**: `$schema` (định danh phiên bản đặc tả mục tiêu) và `name` (tên plugin dễ đọc). Thiếu / sai kiểu / rỗng → client từ chối plugin và KHÔNG được phát hiện hay thực thi bất kỳ thành phần nào
- `version` NÊN dùng Semantic Versioning, dùng cho kiểm tra cập nhật và độ tươi của bộ nhớ đệm
- Đối tượng `author` chỉ cho phép `name`/`email`/`url`
- Ngoài các ràng buộc tường minh, trường metadata chỉ được xác thực theo kiểu JSON — client KHÔNG được từ chối manifest chỉ vì `version` không phải SemVer hợp lệ, URL/email không được nhận diện, hay `license` không phải định danh SPDX
- Trường cấp cao không xác định → báo cáo và bỏ qua, tiếp tục tải (không gây chết)

### 4.3 Ràng Buộc Tên Plugin

`name` phải thỏa mãn tất cả các điều sau:

- Độ dài **1–64 ký tự** (bao gồm cả hai đầu)
- Bộ ký tự giới hạn ở **chữ thường, số, `-`, `.`**
- **Ký tự đầu và cuối phải là chữ số/chữ cái**
- **Không có `--` hoặc `..` liên tiếp** (dấu chấm đơn được phép, ví dụ `acme.tools`)

Hợp lệ: `my-plugin`, `acme.tools`, `lint3r`, `a`
Không hợp lệ: `My-Plugin` (chữ hoa), `-start` (gạch nối đầu), `has--double` (gạch nối liên tiếp), `too.many..dots` (dấu chấm liên tiếp), chuỗi rỗng

### 4.4 Đóng Gói Agent Skills

- Vị trí cố định `skills/`; mỗi **thư mục con trực tiếp** chứa `SKILL.md` tính là một kỹ năng; **không tìm kiếm đệ quy** các cấp sâu hơn
- Bản thân kỹ năng phải tuân thủ đặc tả Agent Skills (định dạng `SKILL.md`, frontmatter, bố cục `scripts/`/`references/`/`assets/`)
- Kỹ năng không tuân thủ → **bỏ qua nó** và tiếp tục tải các kỹ năng khác (NÊN báo cáo kỹ năng không hợp lệ)

```text
skills/
└── deploy/
    ├── SKILL.md          # name: deploy
    ├── scripts/
    │   └── rollback.sh
    └── references/
        └── runbook.md
```

### 4.5 Cấu Hình Máy Chủ MCP (mcp.json)

`mcp.json` PHẢI là một đối tượng JSON với đúng hai trường cấp cao: `$schema` và `mcpServers`. Mỗi mục máy chủ PHẢI chứa trường `type` và khớp chính xác một trong các biến thể đóng dưới đây:

**stdio (tiến trình cục bộ)**

```json
{
  "type": "stdio",
  "command": "./bin/validator",
  "args": ["--data", "${PLUGIN_DATA}/validator"],
  "env": {
    "CONFIG": "${PLUGIN_ROOT}/config.json"
  },
  "cwd": "${PLUGIN_ROOT}"
}
```

Điểm chính:

- `command` PHẢI là một **token thực thi duy nhất** (tên trần hoặc đường dẫn tương đối plugin bắt đầu bằng `./`), không phải chuỗi lệnh shell; không mở rộng placeholder trong `command`
- Khi bỏ qua `cwd`, thư mục gốc plugin là thư mục làm việc của tiến trình con; `cwd` chỉ có thể là đường dẫn tương đối plugin, bắt đầu bằng `${PLUGIN_ROOT}`, hoặc bắt đầu bằng `${PLUGIN_DATA}`
- `args`/`env`/`cwd` hỗ trợ mở rộng `${PLUGIN_ROOT}` và `${PLUGIN_DATA}`

**Streamable HTTP (từ xa)**

```json
{
  "type": "streamable-http",
  "url": "https://deploy.example.com/mcp",
  "headers": {
    "X-Tenant": "public-tenant"
  }
}
```

**HTTP+SSE cũ (không dùng nữa)**

```json
{
  "type": "sse",
  "url": "https://legacy.example.com/sse"
}
```

Điểm chính cho từ xa:

- `url` PHẢI là URL HTTP/HTTPS tuyệt đối, không chứa thông tin người dùng hay fragment; các điểm cuối không phải loopback **PHẢI dùng HTTPS**
- Tên header không phân biệt hoa thường; mục trùng tên chỉ khác hoa thường là không hợp lệ
- **Giá trị header là dữ liệu gói hiển thị được, không phải cơ chế bí mật** — plugin KHÔNG được nhúng thông tin xác thực vào header; v1 không định nghĩa cấu hình OAuth hay trường tham chiếu thông tin xác thực di động; việc phát hiện ủy quyền, tương tác người dùng và lưu trữ thông tin xác thực do client quản lý

**Yêu cầu hỗ trợ giao thức vận chuyển**: một client hỗ trợ MCP PHẢI hỗ trợ ít nhất một trong `stdio` hoặc `streamable-http` (NÊN hỗ trợ cả hai); `sse` là TÙY CHỌN. Client PHẢI dùng giao thức do `type` khai báo cho lần kết nối ban đầu; Agent Plugins không định nghĩa hành vi dự phòng nếu lần thử đó thất bại.

### 4.6 Biến Plugin: PLUGIN_ROOT và PLUGIN_DATA

Client khởi chạy tiến trình con plugin PHẢI cung cấp hai biến môi trường trong mỗi tiến trình con:

- `PLUGIN_ROOT`: đường dẫn tuyệt đối đến thư mục gốc plugin đã giải quyết theo hệ thống tệp — dùng để tham chiếu các script, nhị phân và tệp cấu hình **đi kèm gói**
- `PLUGIN_DATA`: đường dẫn tuyệt đối đến thư mục dữ liệu bền vững do client quản lý — dùng cho `node_modules`, môi trường ảo, mã được sinh, bộ nhớ đệm và trạng thái khác cần **tồn tại qua các lần cập nhật** (client PHẢI tạo trước khi khởi chạy, đảm bảo ghi được, và giữ qua các lần cập nhật; có thể xóa khi gỡ cài đặt)

Quy tắc mở rộng:

- Việc mở rộng là một phép **thay thế văn bản đơn, không đệ quy**; văn bản do phép thay thế đưa vào không bị quét thêm placeholder
- Việc mở rộng áp dụng cho mọi phần tử chuỗi của `args`, mọi giá trị chuỗi trong `env`, và chuỗi `cwd`; **không** áp dụng cho khóa `env`, `command`, hoặc vị trí thành phần cố định
- Văn bản dạng placeholder không nhận diện được giữ nguyên; client KHÔNG được thực hiện bất kỳ việc mở rộng placeholder/biến môi trường nào khác
- Đối tượng `env` của máy chủ KHÔNG được chứa mục tên `PLUGIN_ROOT` hoặc `PLUGIN_DATA` (client cung cấp các biến dành riêng này; mục như vậy khiến mục máy chủ không hợp lệ)
- Giá trị `env` cũng là dữ liệu gói hiển thị được — plugin KHÔNG được nhúng thông tin xác thực vào chúng

### 4.7 Triển Khai Một Client Tuân Thủ

**Chuỗi tải (góc nhìn client)**:

1. Thiết lập thư mục gốc plugin đã giải quyết theo hệ thống tệp
2. Xác định và xác thực `plugin.json` gốc bằng Schema được hỗ trợ cục bộ do `$schema` chọn
3. Từ chối plugin vì vi phạm manifest gây chết; báo cáo và bỏ qua các trường hợp không gây chết tường minh
4. Phát hiện từng loại thành phần được hỗ trợ từ vị trí cố định của nó
5. Áp dụng ranh giới lỗi được định nghĩa cho từng loại thành phần hoặc mục
6. Áp dụng các không gian tên mở rộng client đã triển khai và bỏ qua tất cả các không gian khác

**Yêu cầu client tối thiểu** (điểm cốt yếu của tuân thủ):

- Có thể tải plugin từ đường dẫn thư mục
- Xác thực schema `plugin.json` đóng; bỏ qua các thành viên `extensions` chưa triển khai mà không xác thực giá trị của chúng
- Phát hiện thành phần ở vị trí cố định cho từng loại thành phần được hỗ trợ
- Nếu hỗ trợ MCP: hỗ trợ ít nhất một trong `stdio` hoặc `streamable-http`; cung cấp `PLUGIN_ROOT`/`PLUGIN_DATA` và mở rộng cả hai trong các giá trị cấu hình lúc chạy
- Giải quyết `command` như một token thực thi duy nhất; dùng thư mục gốc plugin làm thư mục làm việc mặc định
- **Hỗ trợ ít nhất một loại thành phần** (kỹ năng hoặc MCP) — áp dụng từng phần được cho phép tường minh: một client chỉ hỗ trợ kỹ năng vẫn tuân thủ

**Cô lập lỗi**: loại thành phần không xác định → bỏ qua; lỗi cô lập ở một thành phần không được ngăn việc tải các thành phần hợp lệ độc lập khác; lỗi NÊN được báo cáo, nhưng việc không hỗ trợ một loại thành phần, giao thức vận chuyển hay phần mở rộng không tự nó là lỗi.

---

## 5. Tóm Tắt Quan Điểm & Kết Luận

1. **Phân mảnh là khoản thuế tương tác lớn nhất của hệ sinh thái AI agent hiện nay.** Mỗi client có định dạng plugin riêng, buộc tác giả đóng gói lại liên tục. Phán đoán của Agent Plugins: thay vì thống nhất runtime, hãy thống nhất **hợp đồng đóng gói** — điểm vào tiêu chuẩn hóa rẻ nhất và có đồng thuận rộng nhất.

2. **'Tầng tương tác' thay vì 'thống nhất lớn' mới là tham vọng đúng đắn.** Đặc tả cố ý để phân phối, cài đặt, quyền hạn, UX, sandbox và phần mở rộng client cho từng nhà cung cấp. Sự kiềm chế đó chính là điều khiến các đối thủ cạnh tranh như Amazon, Cursor, Microsoft, OpenAI và Vercel ngồi được vào cùng một bàn — không ai muốn trao toàn bộ runtime của mình cho người khác.

3. **Tiêu chuẩn hóa hai loại thành phần đã có đồng thuận trước.** v1 chỉ bao phủ Agent Skills và MCP vì chúng có đặc tả ngoài trưởng thành. Commands, hooks, agents, LSP servers… vẫn đang hội tụ — 'chờ định dạng hội tụ rồi mới vào v1' là một phòng thủ kinh điển chống tiêu chuẩn hóa sớm.

4. **Schema đóng + xử lý khoan dung là trí tuệ dành chỗ cho tương lai.** Trường cấp cao không xác định không gây chết (báo cáo và bỏ qua), và thí nghiệm của client được gói trong `extensions` tên miền ngược — vừa giữ sự nghiêm ngặt của hợp đồng di động, vừa cho hệ sinh thái thử nghiệm tự do bên trong không gian tên.

5. **Bảo mật được thiết kế sẵn, không phải khẩu hiệu.** Đường dẫn plugin phải nằm trong thư mục gốc plugin (từ chối thoát `../`), `command` không bao giờ bị diễn giải shell, header/env được tuyên bố tường minh 'không phải cơ chế bí mật', điểm cuối không phải loopback chỉ dùng HTTPS, và OAuth được để tường minh cho client — mọi quy tắc đều thu nhỏ bề mặt tấn công.

6. **Cô lập lỗi làm hệ sinh thái plugin mạnh hơn.** Một máy chủ MCP chết không nên kéo theo cả plugin. Lỗi thành phần không gây chết cộng với yêu cầu báo cáo chẩn đoán khiến 'khả dụng một phần' trở thành tư thế mặc định.

7. **Áp dụng từng phần là chìa khóa để tiêu chuẩn lan tỏa.** Client có thể chỉ hỗ trợ kỹ năng, chỉ MCP, hoặc chỉ một giao thức vận chuyển — tiêu chuẩn để lại một lộ trình tuân thủ rõ ràng cho áp dụng dần dần, hạ thấp đáng kể rào cản gia nhập.

8. **Thiết kế quản trị quyết định độ tín nhiệm của một tiêu chuẩn.** Vai trò do cá nhân nắm giữ thay vì ghế công ty, không nhà cung cấp nào nắm đa số, cuộc họp TSC công khai, và đề xuất bắt đầu từ GitHub Discussions — những điều khoản này tạo nền tảng tin cậy dài hạn cho một tổ chức tiêu chuẩn gồm các đối thủ cạnh tranh.

---

## Tài Liệu Tham Khảo

- Trang web: `https://agent-plugins.org`
- Kho đặc tả: `https://github.com/agentplugins/agent-plugins-spec`
- Văn bản đặc tả v1.0.0: `https://github.com/agentplugins/agent-plugins-spec/blob/main/spec/1.0.0.md`
- Schema manifest plugin: `https://agent-plugins.org/schemas/1.0.0/plugin.schema.json`
- Schema cấu hình MCP: `https://agent-plugins.org/schemas/1.0.0/mcp.schema.json`
- Hướng dẫn tác giả plugin: `https://agent-plugins.org/plugin-authors`
- Hướng dẫn triển khai client: `https://agent-plugins.org/client-implementers`
- Quản trị (Technical Charter): `https://github.com/agentplugins/agent-plugins-spec/blob/main/GOVERNANCE.md`
- Plugin mẫu: `https://github.com/agentplugins/agent-plugins-example`
- Đặc tả Agent Skills: `https://agentskills.io/specification`
- Đặc tả MCP: `https://modelcontextprotocol.io/specification`
- Thảo luận: `https://github.com/agentplugins/agent-plugins-spec/discussions`
