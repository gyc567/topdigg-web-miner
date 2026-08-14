---
title: "Macro: Không Gian Làm Việc Đội Nhóm Thống Nhất — Nền Tảng All-in-One Hợp Nhất Email, Chat, Tài Liệu, Nhiệm Vụ"
date: "2026-08-14"
description: "Phân tích chuyên sâu dự án Macro — không gian làm việc đội nhóm thống nhất xây dựng bằng SolidJS + Rust, tích hợp email, chat, tài liệu, nhiệm vụ, AI agents và CRM với @linking hai chiều và bộ nhớ cấp đội"
tags:
  - Macro
  - Cộng Tác Đội Nhóm
  - Không Gian Làm Việc All-in-One
  - SolidJS
  - Rust
  - MCP
  - CRM
  - AI Agents
  - Thiết Kế Workflow
categories:
  - Công Cụ Cộng Tác Đội Nhóm
  - Công Cụ AI
  - Workflow
  - Phân Tích Sản Phẩm
  - Dự Án Mã Nguồn Mở
---

# Macro: Không Gian Làm Việc Đội Nhóm Thống Nhất — Nền Tảng All-in-One

## Bối Cảnh Dự Án và Vấn Đề Cốt Lõi

### Sự Phân Mảnh Công Cụ

Các đội ngày nay phải chuyển đổi giữa nhiều công cụ:

| Loại Công Cụ | Phần Mềm | Vấn Đề |
|-------------|----------|---------|
| Email | Gmail, Outlook | Rời rạc với chat/tài liệu |
| Nhắn tin | Slack, Discord | Lịch sử khó tìm |
| Tài liệu | Notion, Confluence | Không liên kết với task/email |
| Quản lý Task | Linear, Jira | Tách biệt với ngữ cảnh |
| AI Assistant | ChatGPT, Claude | Thiếu ngữ cảnh đội |

**Mâu thuẫn cốt lõi**: Mỗi công cụ xuất sắc đơn lẻ, nhưng cùng nhau tạo thành các đảo thông tin.

### Sự Ra Đời của Macro

Sau nhiều năm đau đầu với công cụ rời rạc, đội Macro đã đưa ra quyết định táo bạo:

> **"Hãy thiết kế lại toàn bộ phần mềm làm việc từ đầu thành một hệ thống thống nhất."**

Đây là Macro — không gian làm việc đội nhóm thống nhất kết hợp email, chat, tài liệu, nhiệm vụ, AI agents, cuộc gọi và CRM.

---

## Tổng Quan Dự Án

### Macro là gì?

Macro là **không gian làm việc đội nhóm All-in-One**:

```
┌─────────────────────────────────────────────────────────────────┐
│                    Macro Workspace                                │
├─────────────────────────────────────────────────────────────────┤
│    📧 Email   💬 Chat   📝 Docs   📋 Tasks                     │
│       │            │            │             │                  │
│       └────────────┴────────────┴─────────────┘                  │
│                        │                                         │
│                ┌───────┴───────┐                                │
│                │  @linking     │                                │
│                │  Hai Chiều    │                                │
│                └───────┬───────┘                                │
│                        │                                        │
│        ┌───────────────┼───────────────┐                        │
│        ▼               ▼               ▼                        │
│    🤖 AI Agents    📊 CRM        📞 Calls                       │
└─────────────────────────────────────────────────────────────────┘
```

### Tính Năng Cốt Lõi

| Tính Năng | Mô Tả |
|-----------|--------|
| 📧 **Email** | Hộp thư đa tài khoản, phím tắt, shared inbox, Gmail tích hợp |
| 💬 **Chat** | Thread collapse, thiết kế cho thảo luận kỹ thuật |
| 📋 **Tasks** | Liên kết chặt với channels/DM, tạo từ mọi nơi |
| 📝 **Docs** | CRDT collaboration, chỉnh sửa offline, version history |
| 🤖 **AI Agents** | Team memory (cập nhật hàng đêm), MCP integration |
| 📊 **CRM** | Contacts/companies native, Kanban boards |
| 📞 **Calls** | Ghi âm, transcription, log tự động |

---

## Kiến Trúc Kỹ Thuật

### Tech Stack

Macro sử dụng **SolidJS + Rust** — không truyền thống nhưng được tối ưu cho hiệu suất:

```
Macro Architecture:

Frontend (SolidJS)               Backend (Rust)
┌──────────────────────┐        ┌──────────────────────┐
│ apps/web (Browser)   │◄──────►│ 42 Microservices      │
│ apps/web (Tauri)     │  HTTP  │ - email, chat, docs   │
│ apps/web (Mobile)     │  gRPC  │ - tasks, AI, CRM      │
└──────────────────────┘        └──────────────────────┘
```

### Cấu Trúc Repository

```
macro/
├── apps/              # Ứng dụng SolidJS
├── services/          # 42 microservices
├── crates/           # 167 Rust libraries
├── packages/         # TypeScript chia sẻ
├── infra/            # Pulumi infrastructure
└── docker/          # Local dev stack
```

---

## Tính Năng Cốt Lõi

### 1. Email: Thống Nhất, Không Phân Mảnh

```javascript
// Macro keyboard shortcuts
const shortcuts = {
  'c t': 'tạo task từ email',  // Phím tắt quan trọng!
  'j': 'email tiếp theo',
  'k': 'email trước',
};
```

#### Workflow Task từ Email

```
1. Đọc email từ client@company.com

2. Nhấn 'c t' để tạo task
   Tiêu đề: Sửa landing page
   Mô tả: [tự động điền]

3. Task tự động liên kết ngược lại email
   📧 ←→ 📋 Liên kết hai chiều!
```

### 2. AI Agents: Team-Level Memory

Đây là tính năng khác biệt nhất của Macro — **AI agents với team memory**:

```
AI Agent Architecture:

                    ┌─────────────────┐
                    │   Team Memory    │
                    │  (Cập nhật đêm)  │
                    └────────┬────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────┐
│                 AI Agent Layer                          │
│    OpenAI GPT-4 │ Google Gemini │ Anthropic Claude     │
└─────────────────────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────┐
│                MCP Tools Interface                       │
│   Email │ Chat │ Tasks │ Docs │ Contacts │ Memory       │
└─────────────────────────────────────────────────────────┘
```

---

## Triết Lý Thiết Kế

### Triết Lý 1: @linking Hai Chiều

```
Vấn đề truyền thống:
  Notion: Trang A tham chiếu Trang B
  → Trang B không biết mình được tham chiếu
  → Chỉ liên kết một chiều

Macro:
  📧 Email ←──── @link ────→ 📋 Task
       │                        │
       │   Hai chiều            │
       └──────── @link ─────────┘
```

### Triết Lý 2: Channel = Quyền

```
Truyền thống:
  Tạo tài liệu → đặt quyền
  Gửi email → chọn người nhận

Macro:
  Chia sẻ trong channel → thành viên tự động có quyền truy cập
```

### Triết Lý 3: Unified Inbox

```
┌───────────────────────────────────────┐
│           Unified Inbox               │
├───────────────┬───────────────────────┤
│     📢 Signal │        🔔 Noise       │
├───────────────┼───────────────────────┤
│ • @mention    │ • Newsletters          │
│ • Tin nhắn    │ • Thông báo hệ thống  │
│ • Task giao   │ • Hoạt động channel   │
└───────────────┴───────────────────────┘
```

### Triết Lý 4: AI Là Memory, Không Phải Tool

```
AI cá nhân:
  "Hôm qua tôi hỏi ChatGPT gì?"
  → Mỗi lần hội thoại mới, không có bộ nhớ

Macro AI:
  "Tuần trước đội chúng ta thảo luận gì?"
  → Bộ nhớ thuộc về đội, có thể truy vết
```

---

## Bắt Đầu Nhanh

### Cách 1: Phiên Bản Hosted (Khuyến Nghị)

**Bước 1: Đăng ký**

1. Truy cập [macro.com/app](https://macro.com/app)
2. Đăng nhập Google hoặc email
3. Kết nối Gmail hoặc Google Workspace

**Bước 2: Kết Nối Gmail**

```
Kết nối Gmail:

1. Click Settings ở thanh bên trái
2. Chọn Email Accounts
3. Click Add Account
4. Chọn Gmail hoặc Google Workspace
5. Ủy quyền Macro truy cập Gmail
6. Chọn labels/folders để đồng bộ
```

### Cách 2: Phát Triển Cục Bộ

```bash
git clone https://github.com/macro-inc/macro
cd macro

# Copy template
cp .env.example .env

# Khởi động infrastructure
docker compose up -d

# Cài đặt dependencies
cd apps/web && npm install

# Khởi động dev server
npm run dev
```

**Truy cập:**
- Frontend: http://localhost:3000
- API: http://localhost:4000

---

## MCP Integration

### Sử Dụng với Cursor

```bash
npm install -g @macro/mcp-server
```

```json
// ~/.cursor/config.json
{
  "mcpServers": {
    "macro": {
      "command": "macro-mcp",
      "args": ["--api-key", "your-api-key"]
    }
  }
}
```

```
Sử dụng:

@macro search "phản hồi từ khách hàng X"
@macro create_task "trả lời khách hàng X"
@macro get_team_memory "tuần trước chúng ta thảo luận gì"
```

---

## So Sánh

| Tính Năng | Macro | Notion | Slack | Linear |
|-----------|-------|--------|-------|--------|
| Email Integration | ✅ | ❌ | ❌ | ❌ |
| Liên kết Hai Chiều | ✅ | ⚠️ yếu | ❌ | ⚠️ yếu |
| AI Team Memory | ✅ | ❌ | ❌ | ❌ |
| MCP Support | ✅ | ❌ | ❌ | ❌ |
| Mã Nguồn Mở Hoàn Toàn | ✅ | ❌ | ❌ | ❌ |
| Self-hosting | ✅ | ❌ | ❌ | ❌ |

---

## Triết Lý Thiết Kế Tóm Tắt

### 1. Thống Nhất Hơn Tích Hợp

```
Chế độ tích hợp (Slack + Notion + Linear + Gmail):
  → Cần Zapier/Make
  → Độ trễ, chi phí bảo trì, dữ liệu không nhất quán

Chế độ thống nhất (Macro):
  Tất cả modules → Shared DB → Tự nhiên nhất quán
```

### 2. Ngữ Cảnh Quan Trọng Hơn Tính Năng

```
Ưu tiên truyền thống:          Macro ưu tiên:
1. Tính năng đầy đủ?           1. Có thể truy vết ngữ cảnh?
2. Hiệu suất tốt?              2. Thông tin có kết nối?
3. UI đẹp?                     3. Tính năng phục vụ ngữ cảnh?
```

### 3. AI Là Bộ Nhớ, Không Phải Tool

```
AI cá nhân:                     Macro AI:
Hội thoại độc lập              Bộ nhớ thuộc về đội, có thể truy vết
```

### 4. Quyền Theo Dòng Chảy Nội Dung

```
Truyền thống: Tạo nội dung → đặt quyền → phân phối
Macro: Chia sẻ trong channel → thành viên tự động có quyền
```

### 5. Mã Nguồn Mở Là Niềm Tin

```
Vấn đề độc quyền:              Giải pháp mã nguồn mở (AGPLv3):
Không thể xác minh bảo mật     Code minh bạch
Sợ vendor lock-in              Có thể tự host
Không thể sửa lỗi              Cộng đồng cải tiến
```

---

## Kết Luận

Macro đại diện cho hướng đi quan trọng trong công cụ làm việc: **từ tập hợp công cụ đến hệ thống thống nhất**. @linking hai chiều, AI team memory, và không gian làm việc thống nhất đều hướng về một mục tiêu — **giữ cho công việc đội được kết nối ngữ cảnh**.

Trong thời đại bùng nổ công cụ, Macro nhắc nhở chúng ta: **có thể chúng ta không cần nhiều công cụ hơn, mà cần một hệ thống thống nhất tất cả**.

AGPLv3 licensing có nghĩa là Macro sẽ không trở thành công cụ vendor lock-in — nó thực sự thuộc về đội.

---

## Tài Nguyên Tham Khảo

| Tài Nguyên | Liên Kết |
|-----------|---------|
| Website | [macro.com](https://macro.com) |
| GitHub | [github.com/macro-inc/macro](https://github.com/macro-inc/macro) |
| App | [macro.com/app](https://macro.com/app) |
| Docs | [docs.macro.com](https://docs.macro.com) |
| License | AGPLv3 |

---

*Bài viết này được tổng hợp từ GitHub repository và tài liệu chính thức của Macro.*
