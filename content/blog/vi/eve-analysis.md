---
title: "Eve: Khung Agent mã nguồn mở của Vercel — Quản lý AI Agent qua cấu trúc thư mục"
date: "2026-08-16"
description: "Phân tích sâu khung Agent mã nguồn mở Vercel Eve — 'Next.js cho Agents', quản lý agent qua cấu trúc thư mục"
tags:
  - Eve
  - Vercel
  - AI Agent
  - Khung Agent
  - Mã nguồn mở
  - Workflow
  - MCP
  - TypeScript
categories:
  - AI Agent
  - Khung Agent
  - Vercel Open Source
  - TypeScript
  - Workflow Engine
---

# Eve: Khung Agent mã nguồn mở của Vercel — Quản lý AI Agent qua cấu trúc thư mục

## Bối cảnh dự án và vấn đề cốt lõi

### Thách thức cơ sở hạ tầng trong phát triển AI Agent

Trong lĩnh vực phát triển AI Agent, nhà phát triển đối mặt với một vấn đề phổ biến: **Sau khi xây dựng một agent loop, làm thế nào để xử lý các thách thức về cơ sở hạ tầng?**

| Điểm đau | Mô tả | Thiếu sót trong giải pháp hiện tại |
|----------|-------|-----------------------------------|
| **Tổ chức code lộn xộn** | Code agent, config, instructions phân tán khắp nơi | Thiếu cấu trúc dự án thống nhất |
| **Triển khai phức tạp** | Quản lý state, persistence, error recovery khó xử lý | Cần nhiều custom development |
| **Tích hợp đa kênh khó** | Tích hợp Slack, Discord, Telegram phức tạp | Mỗi kênh cần adapt riêng |
| **Chuyển đổi model không linh hoạt** | Phụ thuộc vào một provider, rủi ro tập trung | Thiếu cơ chế chuyển đổi model linh hoạt |
| **Quản lý subagent** | Tác vụ phức tạp khó phân rã và ủy quyền | Thiếu kiến trúc tiêu chuẩn |

### Sự ra đời của Eve

> **"Eve — Trải nghiệm Next.js cho Agents"**

Eve là **khung xây dựng Agent mã nguồn mở được ra mắt bởi Vercel vào tháng 6 năm 2025**, mang những best practice tích lũy trong 10 năm phát triển web vào lĩnh vực phát triển AI Agent:

```
┌─────────────────────────────────────────────────────────────────┐
│                      Eve Vị trí cốt lõi                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  🎯 Vị trí:        "Next.js cho Agents"                          │
│  🏢 Nhà phát triển: Vercel                                        │
│  📅 Phát hành:     Tháng 6 năm 2025                              │
│  📦 Ngôn ngữ:      TypeScript                                    │
│  🛠️ Kiến trúc:     Cấu trúc thư mục như Agent                   │
│  🔌 Tích hợp:      MCP, Slack, Discord, Đa kênh                  │
│  ⚙️ Engine:        Dựa trên Vercel Workflow SDK                   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Tổng quan dự án

### Eve là gì?

Eve là **khung production-grade để xây dựng và triển khai AI Agent**, với triết lý cốt lõi là coi mỗi Agent như một thư mục độc lập nơi tất cả code, config, instructions liên quan được quản lý tập trung.

### Tính năng chính

| Tính năng | Mô tả |
|-----------|-------|
| 🗂️ **Thư mục như Agent** | Mỗi Agent là thư mục độc lập với định nghĩa đầy đủ |
| 📝 **Markdown Instructions** | System prompts viết bằng Markdown, trực quan và dễ bảo trì |
| 🔧 **Tools như Files** | Mỗi tool là file TypeScript độc lập, tự động đăng ký |
| 🔄 **Chuyển đổi Model tự động** | AI Gateway tự động xử lý provider failover |
| 💬 **Hỗ trợ đa kênh** | Hỗ trợ Slack, Discord, Teams, Telegram tích hợp sẵn |
| ⚡ **Workflow-driven** | Dựa trên persistent workflows, hỗ trợ pause/resume/schedule |
| 🔌 **Tích hợp MCP** | Kết nối tools bên ngoài qua MCP servers |
| 🏗️ **Hỗ trợ Subagent** | Hỗ trợ xây dựng Agent Teams, phân rã tác vụ phức tạp |

---

## Phân tích sâu về Kiến trúc

### Triết lý cốt lõi: Thư mục như Agent

Quyết định thiết kế quan trọng nhất của Eve là sử dụng **cấu trúc thư mục như cách chính để tổ chức agents**:

```
my-agent/
├── package.json           # Project dependencies
├── tsconfig.json          # TypeScript config
├── .env.example           # Environment variables template
└── agent/
    ├── agent.ts           # Agent core logic
    ├── instructions.md    # System instructions (Markdown)
    ├── model.ts           # Model configuration
    ├── channels/          # Channel configurations
    │   ├── eve.ts         # Eve built-in channel
    │   ├── slack.ts       # Slack integration
    │   └── discord.ts     # Discord integration
    └── tools/             # Tool definitions
        ├── search.ts      # Search tool
        └── send.ts        # Send message tool
```

### Workflow Engine

Nền tảng của Eve dựa trên **Vercel's open-source Workflow SDK**:

- **Persistent State**: Sessions có thể pause và resume ở bất kỳ bước nào
- **Error Recovery**: Failed workflows retry từ checkpoint
- **Scheduled Execution**: Hỗ trợ timed tasks và delayed execution
- **Concurrency Control**: Built-in concurrency limits

### Model và AI Gateway

Eve đạt được unified model management và automatic failover thông qua **AI Gateway**:

```typescript
// agent/model.ts
export default defineModel({
  provider: "openai",
  model: "gpt-4o",
});
```

---

## Triết lý thiết kế

### Nguyên tắc cốt lõi

#### 1. Convention over Configuration

> **"Giống như Next.js, sử dụng conventions để giảm gánh nặng quyết định, để nhà phát triển tập trung vào business logic."**

#### 2. Directory as Boundary

> **"Một thư mục định nghĩa toàn bộ boundary của Agent, bao gồm code, config, instructions, và channels."**

#### 3. Workflow First

> **"Tất cả sessions đều là persistent workflows, có nghĩa reliability và recoverability được built-in."**

#### 4. Channel Abstraction

> **"Agent core logic được tách biệt khỏi channels; cùng một agent có thể kết nối tới bất kỳ channel nào."**

---

## Hướng dẫn bắt đầu nhanh

### Yêu cầu môi trường

| Yêu cầu | Mô tả |
|---------|-------|
| **Node.js** | 24.0.0 trở lên |
| **Package Manager** | npm, pnpm, hoặc bun |
| **API Key** | Vercel AI Gateway API Key |

### Cài đặt Eve CLI

```bash
# Sử dụng npm
npm install -g eve-cli

# Sử dụng pnpm
pnpm add -g eve-cli

# Xác minh cài đặt
eve --version
```

### Tạo Agent đầu tiên

#### Bước 1: Khởi tạo Project

```bash
eve init my-first-agent
cd my-first-agent
npm install
```

#### Bước 2: Cấu hình Environment Variables

```bash
cp .env.example .env
# Edit .env file, thêm API Key của bạn
```

#### Bước 3: Viết System Instructions

```markdown
<!-- agent/instructions.md -->
# Agent đầu tiên của tôi

Bạn là một AI assistant thân thiện, giúp đỡ người dùng trả lời câu hỏi.
```

#### Bước 4: Định nghĩa Model và Tools

```typescript
// agent/model.ts
export default defineModel({
  provider: "openai",
  model: "gpt-4o",
});
```

#### Bước 5: Chạy Agent

```bash
eve dev
```

---

## Hướng dẫn thực hành: Xây dựng Agent chăm sóc khách hàng đa kênh

### Cấu trúc Project

```
customer-service-agent/
├── package.json
├── tsconfig.json
└── agent/
    ├── agent.ts
    ├── instructions.md
    ├── model.ts
    ├── channels/
    │   ├── slack.ts
    │   └── discord.ts
    └── tools/
        ├── lookup-order.ts
        ├── faq.ts
        └── escalate.ts
```

### Triển khai hoàn chỉnh

```typescript
// agent/tools/lookup-order.ts
export const lookupOrder = defineTool({
  name: "lookup_order",
  description: "Look up order status by order ID",
  parameters: z.object({
    orderId: z.string().describe("The order ID"),
  }),
  execute: async ({ orderId }) => {
    const order = await fetchOrder(orderId);
    return order;
  },
});
```

---

## Tích hợp kênh

### Các kênh được hỗ trợ

| Kênh | Mô tả | Yêu cầu config |
|------|-------|----------------|
| **Eve** | CLI chat interface tích hợp sẵn | Không cần config thêm |
| **Slack** | Nền tảng cộng tác doanh nghiệp | Bot Token, Signing Secret |
| **Discord** | Nền tảng cộng đồng và gaming | Bot Token |
| **Teams** | Nền tảng cộng tác Microsoft | App ID, App Password |
| **Telegram** | Nhắn tin tức thì | Bot Token |

---

## Tổng kết và Kết luận

### Những insight cốt lõi

#### 1. Bản chất của Framework là Conventions

Đóng góp quan trọng nhất của Eve không phải là code, mà là **một hệ thống conventions rõ ràng**:

> **"Conventions giảm gánh nặng quyết định, để nhà phát triển tập trung vào business logic thực sự quan trọng."**

#### 2. Cấu trúc thư mục là công cụ tổ chức độ phức tạp

Sử dụng "thư mục" như boundary của agent là một quyết định thiết kế đơn giản nhưng mạnh mẽ.

#### 3. Workflow là nền tảng của độ tin cậy

Persistent workflows không chỉ là "lưu state", nó có nghĩa:
- **Error Recovery**: Retry từ checkpoint sau khi fail
- **Pause/Resume**: Tác vụ tốn thời gian có thể thực hiện theo bước
- **Scheduled Execution**: Có thể lên lịch thực hiện vào thời điểm cụ thể

### Trường hợp sử dụng

✅ **Khuyến nghị mạnh mẽ cho Eve**:
- Teams cần xây dựng Agents production-grade nhanh chóng
- Ứng dụng doanh nghiệp cần tích hợp đa kênh
- Scenarios hội thoại phức tạp cần quản lý state đáng tin cậy
- Nhà phát triển quen thuộc với hệ sinh thái Next.js/Vercel

---

## Liên kết tài nguyên

### Tài nguyên chính thức

| Tài nguyên | Liên kết |
|-----------|----------|
| 🌐 Website chính thức | https://vercel.com/ |
| 💻 GitHub Repository | https://github.com/vercel/eve |
| 🐦 Twitter | @vercel |

### Cài đặt

| Nền tảng | Lệnh |
|----------|------|
| npm | `npm install -g eve-cli` |
| pnpm | `pnpm add -g eve-cli` |

### Yêu cầu môi trường

| Yêu cầu | Phiên bản tối thiểu |
|---------|---------------------|
| Node.js | 24.0.0+ |

---

## Kết luận

Eve đại diện cho **một hướng đi quan trọng trong các khung phát triển AI Agent — mang những best practice tích lũy trong phát triển web vào lĩnh vực phát triển Agent**.

> **"Next.js đã thay đổi cách chúng ta xây dựng web, Eve st đang thay đổi cách chúng ta xây dựng agents."**

---

*Bài viết này được viết dựa trên dự án mã nguồn mở Vercel Eve.*

**Sources:**
- [GitHub - vercel/eve](https://github.com/vercel/eve)
- [Vercel Agentic Infrastructure](https://vercel.com/)
