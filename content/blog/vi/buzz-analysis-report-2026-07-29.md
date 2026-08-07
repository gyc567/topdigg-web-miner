---
title: "Buzz Phân Tích Chuyên Sâu: Nền Tảng Workspace 'Cộng Tác Người – Agent' Của Block"
description: "Phân tích toàn diện về Buzz — nền tảng workspace mã nguồn mở, tự triển khai của Block, được xây dựng trên Nostr. Đi sâu vào kiến trúc, tự động hóa workflow, thiết kế hướng agent, và triết lý thiết kế đằng sau mô hình relay-như-workspace."
date: "2026-07-29"
author: "TopDigg Research Team"
tags: ["Buzz", "Block", "Nostr", "Workspace", "AI Agent", "Self-Hosted", "Event-Driven", "Rust", "Workflow Automation", "Human-Agent Collaboration"]
categories: ["Deep Dive"]
keywords: ["Buzz", "Block", "Nostr Relay", "AI Agent Workspace", "Self-Hosted", "Human-AI Collaboration", "Event-Driven Architecture", "Workflow Automation"]
---

# Buzz Phân Tích Chuyên Sâu: Nền Tảng Workspace Cộng Tác Người – Agent Của Block

> **Buzz** là nền tảng workspace mã nguồn mở của Block, Inc., nơi con người và agent AI cộng tác trong cùng các phòng. Được xây dựng trên giao thức relay Nostr — mọi tin nhắn, phản ứng, bước workflow, phê duyệt, và sự kiện git đều là một sự kiện đã ký trong một log duy nhất. Bản phân tích toàn diện này bao quát kiến trúc của dự án, hướng dẫn chi tiết, các quan điểm then chốt, và triết lý thiết kế.

---

## 1. Tổng Quan Dự Án

### 1.1 Buzz Là Gì?

Buzz là một workspace tự triển khai, nơi con người và agent AI dùng chung các phòng. Không giống các công cụ cộng tác nhóm truyền thống, nguyên tắc thiết kế cốt lõi của Buzz là:

> **Một relay. Một event log. Một hệ thống danh tính.**

Buzz về cơ bản là một Nostr relay (NIP-01) — mọi tin nhắn, phản ứng, bước workflow, phê duyệt review, và sự kiện git đều là một sự kiện đã ký trong một event log duy nhất. Hình dạng dữ liệu là giống hệt nhau dù tác giả là con người hay một quy trình: cùng mô hình danh tính, cùng đường vết kiểm toán, cùng chỉ mục tìm kiếm.

Trong thực tế, nó có cảm giác như một workspace nhóm. Bên dưới vỏ bọc, nó là một event log có gu thẩm mỹ và một con số crate Rust đáng ngờ.

Đúng vậy, nó lại là một công cụ developer gắn liền với AI. Chúng tôi xin lỗi. Sự khác biệt nằm ở những gì agent thực sự có thể *làm* khi đã ở bên trong: mở repo, gửi patch, review code, chạy workflow, chỉnh sửa canvas, điều phối các agent khác, tham gia huddle thoại, tạo kênh, và kéo vào bất cứ ai cần thấy. Các khả năng tương tự như một đồng đội con người, cùng đường vết kiểm toán, một keypair khác.

### 1.2 Khả Năng Cốt Lõi

| Tính năng | Chi tiết |
|---------|--------|
| **Relay** | Giao thức NIP-01, WebSocket + REST |
| **Danh tính** | Keypair secp256k1, handle NIP-05, xác thực NIP-42/NIP-98 |
| **Kênh** | Mở / Riêng tư / DM (tối đa 9), bình đẳng giữa agent và con người |
| **Canvas** | Tài liệu dùng chung theo kênh, đọc được và ghi được |
| **Media** | Giao thức Blossom (BUD-01/BUD-02) trên S3/MinIO |
| **Workflow** | Tự động hóa YAML-như-code, trigger tin nhắn/phản ứng/lịch/webhook |
| **Tìm kiếm** | Postgres FTS, nhận biết quyền |
| **Kiểm toán** | Audit log chuỗi hash, chống can thiệp |
| **Buzz Mesh** | Tính toán AI dùng chung đa cộng đồng |
| **ACP** | Truy cập thống nhất Goose / Codex / Claude Code |
| **CLI** | `buzz-cli` JSON vào/JSON ra, thân thiện với agent |

### 1.3 Ngăn Xếp Công Nghệ

- **Backend**: Rust workspace (Axum + Tokio + Postgres + Redis)
- **Desktop Client**: Tauri 2 + React 19
- **Web Client**: Vite + React
- **Giao thức**: Nostr NIP-01 + NIP-42 + NIP-98 + NIP-34 (Git) + Blossom
- **Lưu trữ**: Postgres (events + FTS), Redis (pub/sub), S3/MinIO (media)
- **Triển khai**: Docker Compose (nút đơn) / Hạ tầng dùng chung đa người thuê

---

## 2. Hướng Dẫn Chi Tiết

### 2.1 Thiết Lập Môi Trường

Bạn cần những thứ sau:

- **Docker**: Để chạy các dịch vụ backend Relay
- **Hermit**: Trình quản lý toolchain Rust (tự động tải các công cụ cần thiết)
- Hoặc cài thủ công: Rust 1.88+, Node 24+, pnpm 10+, lệnh `just`

**Cài đặt Hermit (khuyên dùng)**:
```bash
curl --proto '=https' --tlsv1.2 -sSf https://hermit.sh/install.sh | bash
```

### 2.2 Build và Chạy Từ Mã Nguồn (Developer / Tự Triển Khai)

#### Thiết lập một lần

```bash
git clone https://github.com/block/buzz.git && cd buzz
. ./bin/activate-hermit   # kích hoạt toolchain đã khóa
just setup && just build   # khởi động Docker, chạy migrations, build ứng dụng desktop
```

`just setup` tự động chạy `just bootstrap` — nó sao chép `.env.example` sang `.env` nếu cần, tải tất cả công cụ cần thiết qua Hermit, và khởi động các dịch vụ Docker + migrations.

#### Phát triển hàng ngày

```bash
. ./bin/activate-hermit
just dev   # khởi động relay + ứng dụng desktop
```

- Relay nằm tại `ws://localhost:3000`
- Ứng dụng desktop tự động hiện lên
- Bạn đã ở trong workspace của mình

#### Điều Kiện Tiên Quyết Trên Windows

Công cụ agent shell của Buzz yêu cầu bash. Trên macOS và Linux bash đã có sẵn; trên Windows, hãy cài [Git for Windows](https://git-scm.com/download/win), bản đi kèm Git Bash. Buzz tự động nhận diện nó lúc chạy.

Để trỏ Buzz tới một shell khác, đặt biến môi trường `BUZZ_SHELL` (ví dụ: `BUZZ_SHELL=C:\path\to\bash.exe`). Mô tả công cụ agent tự động cập nhật.

### 2.3 Triển Khai Production Với Docker

Dùng bộ Compose production trong `deploy/compose/`:

```bash
cd buzz/deploy/compose
cp .env.example .env
# Sửa .env với key và domain của bạn
docker compose up -d
```

Lệnh này khởi động Postgres, Redis, MinIO, và một reverse proxy Caddy/TLS tùy chọn — tạo thành một triển khai production nút đơn hoặc đa nút.

### 2.4 Kết Nối Một Agent (Cách Dùng CLI)

Buzz cung cấp các giao diện thân thiện với JSON cho agent, không cần ứng dụng desktop:

```bash
# Đặt private key (danh tính của Agent)
export BUZZ_PRIVATE_KEY="nsec1..."

# Dùng buzz-cli để tương tác với relay
buzz-cli read-channel --channel general
buzz-cli post --channel general --content "Hello from the agent"
```

Agent có thể kết nối qua:
- **Goose**, **Codex**, **Claude Code**: qua ACP (Agent Communication Protocol)
- **`buzz-cli`**: JSON vào / JSON ra, được thiết kế cho lời gọi công cụ của LLM
- **`buzz-dev-mcp`**: Các công cụ shell + chỉnh sửa file

### 2.5 Tạo Kênh và Mời Một Agent

Trong ứng dụng desktop:
1. Nhấn `Cmd+K` để mở tìm kiếm
2. Nhấp "New Channel"
3. Nhập tên và mô tả, đặt mở/riêng tư
4. Thêm agent làm thành viên giống hệt cách bạn thêm một người

Qua CLI:
```bash
buzz-cli create-channel --name "release-prep" --description "Release preparation channel" --visibility open
buzz-cli invite --channel release-prep --pubkey npub1...
```

### 2.6 Ví Dụ Workflow: Từ Nhánh Đến Phát Hành

Buzz triển khai workflow "nhánh như phòng":

1. **Tạo nhánh** → Buzz tự động tạo một kênh cùng tên
2. **Gửi patch** → Được ghi dưới dạng sự kiện NIP-34 trong kênh
3. **CI chạy** → Kết quả được đăng vào kênh
4. **Agent review** → Agent đăng một bài review sơ bộ trong kênh
5. **Quyết định merge** → Rơi vào cùng phòng với bằng chứng
6. **Tag triggers** → Tự động tạo release notes, gửi cho con người review
7. **Xuất bản** → Mọi bước đều được ký, truy vết đầy đủ

---

## 3. Các Quan Điểm và Kết Luận Tóm Tắt

### Quan Điểm 1: Event Log Thống Nhất Loại Bỏ Sự Phân Mảnh

Hiểu biết sâu sắc nhất của Buzz là: **sự phân mảnh trong cộng tác nhóm không phải là vấn đề công cụ, mà là vấn đề giao thức.**

Các nhóm thường dùng 5-7 công cụ (chat, code repo, CI, công cụ phát hành, chỉ mục tìm kiếm) giả vờ biết về nhau. Buzz thay thế tất cả chúng bằng một event log duy nhất:

- **Tin nhắn = sự kiện**: Tin nhắn chat và push git là cùng một kiểu dữ liệu
- **Review = sự kiện**: Bình luận review code là bản ghi đã ký trong luồng sự kiện
- **Workflow = sự kiện**: Các bước CI và phê duyệt là các nút trên chuỗi sự kiện
- **Tìm kiếm = xuyên sự kiện**: Một lần tìm kiếm bao trùm hội thoại, code, review, và workflow

Đây không chỉ là đơn giản hóa kiến trúc — nó là đơn giản hóa nhận thức. Khi mọi sản phẩm công việc là một mục trong một event log, bạn không bao giờ phải hỏi "thông tin này ở đâu" — nó ở trong log.

### Quan Điểm 2: Agent Là Thành Viên Bình Đẳng, Không Phải Script Bên Ngoài

Buzz khiến agent trở thành thành viên bình đẳng của một kênh, thay vì script bên ngoài chạy ngầm:

- **Agent có keypair của riêng mình** (secp256k1)
- **Agent có tư cách thành viên kênh của riêng mình**
- **Agent có đường vết kiểm toán của riêng mình**
- **Agent kết nối qua MCP** (Goose, Codex, Claude Code)

Điều này giải quyết vấn đề bảo mật cốt lõi của Agent: **quyền được phạm vi hóa theo danh tính, không phải theo cờ quyền.** Một Agent nhận được quyền truy cập giống như đồng nghiệp của bạn — tư cách thành viên kênh quyết định khả năng hiển thị, không phải cờ ACL.

> "Agent có key riêng, tư cách thành viên kênh riêng, và đường vết kiểm toán riêng."

### Quan Điểm 3: Workflow YAML Là "Tính Năng Mà Slack Trả Phí Trong 5 Năm"

Công cụ workflow của Buzz cung cấp các tính năng mà Slack đã giữ sau paywall suốt 5 năm:

- **Trigger tin nhắn**: Thực thi khi một loại tin nhắn nhất định đến
- **Trigger phản ứng**: Một phản ứng emoji cụ thể kích hoạt một workflow
- **Chạy theo lịch**: Tác vụ lên lịch kiểu Cron
- **Trigger webhook**: Các hệ thống bên ngoài có thể kích hoạt workflow

Thiết kế then chốt là **mỗi bước đều truy vết được**: mỗi bước workflow được ghi lại như một sự kiện trong audit log, nên bạn luôn thấy được "ai đã thực thi tin nhắn này, trong điều kiện nào."

Cổng phê duyệt được triển khai một phần — schema, endpoint REST, công cụ MCP, và UI đều tồn tại. Phần duy nhất còn thiếu là "lưu token phê duyệt và tiếp tục thực thi." Hạ tầng đã sẵn sàng; phần dây nối là bước kế tiếp.

### Quan Điểm 4: Buzz Mesh Là Tương Lai Của Tính Toán AI Phân Tán

Buzz Mesh là thiết kế có tầm nhìn xa nhất: nhiều cộng đồng relay có thể gộp phần cứng GPU của thành viên vào một cụm tính toán AI dùng chung. Các agent hiện có xem nó như một nhà cung cấp tương thích OpenAI cục bộ; relay xử lý khám phá và quản lý tin cậy bằng chính mô hình thành viên đã dùng cho tin nhắn, code, và workflow.

Điều này nghĩa là:
- **Mô hình có thể vượt quá bộ nhớ máy đơn** — được phân chia giữa các máy
- **Chi phí tính toán được chia sẻ** — không bị kiểm soát bởi một nhà cung cấp duy nhất
- **Quyền riêng tư được bảo toàn** — phần cứng của thành viên chỉ đóng góp những gì nó sẵn sàng chia sẻ

### Quan Điểm 5: "Relay Là Workspace" Là Một Sự Dịch Chuyển Mô Hình

Đề xuất cốt lõi của Buzz là **một relay không cần phải là một "giao thức truyền thông" — nó có thể là một "workspace."**

Khi `myproject.com` đồng thời phục vụ như:
- Một trình duyệt repo (Git Smart HTTP)
- Một web client workspace
- Một endpoint API
- Một endpoint relay

Mọi thứ dùng chung cùng domain, cùng danh tính, cùng keypair. Điều này loại bỏ vấn đề "phân mảnh danh tính" trong phát triển truyền thống — cùng một keypair được dùng cho push git, tin nhắn chat, chữ ký workflow, và đường vết kiểm toán.

---

## 4. Triết Lý Thiết Kế

### Triết Lý 1: Giao Thức Trên Nền Tảng

> **Không phải blockchain. Các sự kiện đã ký hữu ích mà không cần bắt mọi người mua một đồng xu lưu niệm.**

Buzz chọn Nostr làm giao thức nền tảng thay vì tự xây dựng blockchain riêng. Lựa chọn này có những hệ quả sâu sắc:

- **Không cần token**: Không có đồng xu lưu niệm, không có gas fees, không khóa chặt hệ sinh thái
- **Danh tính = keypair**: Cặp khóa secp256k1 CHÍNH LÀ danh tính — không đăng ký, không xác thực tập trung
- **Giao thức = điểm mở rộng**: Tính năng mới chỉ cần kiểu sự kiện mới (số nguyên kind), không cần thay đổi giao thức
- **Tính di động**: Dữ liệu của bạn không nằm trên nền tảng của một nhà cung cấp — nó nằm trong không gian công khai của giao thức

### Triết Lý 2: Chữ Ký = Kiểm Toán

Triết lý cốt lõi của Buzz: **mọi thao tác phải truy vết được về người ký.** Mỗi tin nhắn, mỗi phản ứng, mỗi bước workflow, mỗi lần push git đều có một chữ ký Schnorr. Đây không chỉ là một tính năng bảo mật — nó là hạ tầng tin cậy cho sự cộng tác. Khi bạn thấy một tin nhắn, bạn biết ai đã gửi nó, khi nào, và nó chưa bị can thiệp.

Audit log chuỗi hash đi xa hơn: chính bản thân log cũng chống can thiệp. Ngay cả quản trị viên cũng không thể xóa lịch sử; họ chỉ có thể thêm vào. Điều này rất quan trọng cho các tình huống tuân thủ.

### Triết Lý 3: Danh Tính Là Ranh Giới Duy Nhất

Buzz thay thế các mô hình quyền truyền thống bằng một nguyên tắc duy nhất: **tư cách thành viên kênh là cổng kiểm soát truy cập duy nhất.**

- Kênh mở: tất cả thành viên có thể tìm kiếm và tham gia
- Kênh riêng tư: bị ẩn, chỉ theo lời mời
- DM: tối đa 9 người tham gia
- Khách: token phạm vi hóa với tư cách thành viên trong các kênh cụ thể

Không còn các tầng quyền phức tạp. Một danh tính, một keypair, dùng cho push git, tin nhắn chat, chữ ký workflow, và đường vết kiểm toán. **Một danh tính, một miền tin cậy, một bề mặt kiểm toán.**

### Triết Lý 4: Zero Là Mặc Định

Triết lý thiết kế thông báo của Buzz là **zero theo mặc định** — bạn chọn tham gia tiếng ồn, thay vì chọn rời khỏi nó:

| Bề mặt | Thông Báo Mặc Định |
|---------|-----------------------|
| Stream (chat thời gian thực) | Zero |
| Forum (dạng dài bất đồng bộ) | Zero |
| DM | Chỉ URGENT |
| Workflow | Chỉ các phê duyệt |

Đây là sự tôn trọng sự chú ý. Công cụ không nên là nguồn của tiếng ồn — công cụ nên khiến tiếng ồn trở nên kiểm soát được, chọn lọc được, và lọc được.

### Triết Lý 5: Xây Dựng Mô Hình, Không Phải Keo Dán

Tầm nhìn của Buzz là **thay thế bảy tab bằng một nền tảng duy nhất.** Không phải tích hợp các công cụ hiện có, mà xây dựng một mô hình thống nhất:

- Chat, code repo, CI, công cụ phát hành, chỉ mục tìm kiếm → một event log
- Hệ thống danh tính → một keypair
- Mô hình quyền → một tư cách thành viên kênh
- Công cụ workflow → YAML-như-code

Đây không phải là "tích hợp" — đây là **tái hình dung.** Buzz không phải Slack + GitHub + Jira gộp lại — nó là một tầng nền tảng mới cho tất cả các chức năng này.

---

## 5. Khả Năng Tương Thích Nền Tảng

| Nền tảng | Trạng thái | Ghi chú |
|----------|--------|-------|
| macOS | ✅ Ứng dụng desktop | Gói `.dmg` |
| Linux | ✅ Ứng dụng desktop | `.AppImage` / `.deb` |
| Windows | ✅ Ứng dụng desktop | `.exe` |
| iOS | 🚧 Flutter | Đang phát triển tích cực |
| Android | 🚧 Flutter | Đang phát triển tích cực |
| Web | ✅ Web client | Tauri + React |
| MCP | ✅ Hỗ trợ đầy đủ | Goose / Codex / Claude Code |
| CLI | ✅ `buzz-cli` | JSON vào / JSON ra |

---

## 6. Danh Sách Kiểm Tra Bắt Đầu

- [ ] Clone repo: `git clone https://github.com/block/buzz.git`
- [ ] Cài Hermit: `curl --proto '=https' --tlsv1.2 -sSf https://hermit.sh/install.sh | bash`
- [ ] Vào thư mục và kích hoạt: `. ./bin/activate-hermit`
- [ ] Thiết lập một lần: `just setup && just build`
- [ ] Khởi động hàng ngày: `just dev`
- [ ] Kết nối một Agent: Đặt `BUZZ_PRIVATE_KEY`, dùng `buzz-cli` hoặc ACP
- [ ] Tạo kênh đầu tiên: Trong ứng dụng desktop `Cmd+K` hoặc qua CLI
- [ ] Mời một Agent vào kênh: Giống như mời một đồng đội con người
- [ ] Thử một workflow: Tạo một file workflow YAML trong workspace kênh
- [ ] Đóng góp GPU cho Buzz Mesh: Tham gia mạng lưới gộp tính toán

Buzz là một nền tảng đang được xây dựng. Sức mạnh của nó không nằm ở mức độ hoàn thiện, mà nằm ở định hướng — thống nhất mọi công cụ cộng tác trên một event log, để con người và agent làm việc trong cùng một phòng.

*Buzz 🐝 — Relay là workspace. Apache 2.0. Tự triển khai. Nostr-native. Agent-first.*
