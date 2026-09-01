---
title: "OpenClaude: CLI Coding-Agent Đa Nhà Cung Cấp Mã Nguồn Mở - Phân Tích Toàn Diện"
date: "2026-09-01"
description: "Phân tích sâu dự án Gitlawb/openclaude: CLI coding-agent mã nguồn mở hỗ trợ 20+ nhà cung cấp model bao gồm Claude, GPT, Gemini, DeepSeek, và Ollama cục bộ"
tags: ["OpenClaude", "AI Agent", "Coding Agent", "CLI", "Ollama", "Claude"]
categories: ["AI", "Developer Tools", "Open Source"]
---

# OpenClaude: CLI Coding-Agent Đa Nhà Cung Cấp Mã Nguồn Mở - Phân Tích Toàn Diện

## Giới Thiệu

Khi Claude Code ngày càng trở thành công cụ chính của nhiều nhà phát triển, một dự án mã nguồn mở đang thầm lặng thay đổi cuộc chơi: **OpenClaude** (Gitlawb/openclaude).

Triết lý cốt lõi là——**runs anywhere, uses anything**. Không bị ràng buộc với bất kỳ nhà cung cấp model cụ thể nào, một CLI kết nối cả API đám mây và model cục bộ, hỗ trợ 20+ backend bao gồm giao diện tương thích OpenAI, Gemini, GitHub Models, Codex, Ollama, v.v.

---

## 1. Tổng Quan Dự Án

### 1.1 OpenClaude là gì

OpenClaude là công cụ CLI coding-agent mã nguồn mở được phát triển và duy trì bởi đội ngũ GitLawb. Định vị cốt lõi:

> **Một CLI cho cloud API và local model backend — không cần công cụ riêng cho từng provider.**

Tính năng chính:
- Một CLI cho tất cả model được hỗ trợ (20+ Provider)
- Cài đặt provider có hướng dẫn + lưu profiles
- Workflow coding-agent đầy đủ
- VS Code extension đi kèm
- Hệ thống Buddy pixel art

### 1.2 Các Provider được Hỗ trợ

| Danh mục | Provider |
|---------|----------|
| Tương thích OpenAI | OpenAI, OpenRouter, DeepSeek, Groq, Mistral, LM Studio |
| API chuyên dụng | Gemini, GitHub Models, Codex OAuth, Codex |
| Inference cục bộ | Ollama, Atomic Chat, LM Studio |
| Aggregation Gateway | AI/ML API, Concentrate, LLMTR, ApiSmart, Fireworks AI |
| Dành cho Trung Quốc | Z.AI GLM Coding Plan, Xiaomi MiMo, LongCat (Meituan), NEAR AI |
| Cloud Provider | AWS Bedrock, Vertex AI, Cloudflare Workers AI, Microsoft Foundry |

---

## 2. Kiến Trúc Kỹ Thuật Cốt Lõi

### 2.1 Triết Lý Thiết Kế: Lớp Trừu Tượng Provider

Kiến trúc cốt lõi của OpenClaude là một **Provider Abstraction Layer**.

**Nguyên tắc thiết kế chính:**

1. **Provider có thể cắm rút**: Bất kỳ dịch vụ nào có OpenAI-compatible API hoặc Anthropic native API đều tích hợp liền mạch
2. **Ưu tiên Environment Variables**: Tất cả cấu hình qua env vars, không cần thay đổi code
3. **Lưu trữ cấu hình**: Lệnh `/provider` lưu profiles vào `~/.openclaude-profile.json`

### 2.2 Repo Map: Trí Tuệ Codebase

OpenClaude giới thiệu tính năng **Repo Map** — cho phép AI model có nhận thức cấu trúc về codebase ngay từ đầu session.

**Cách hoạt động (5 bước):**

1. **Liệt kê file**: Qua `git ls-files`
2. **Trích xuất symbol**: Sử dụng tree-sitter để parse source files
3. **Đồ thị tham chiếu**: Xây dựng đồ thị có hướng với trọng số reference count × IDF
4. **PageRank**: Xếp hạng file theo tầm quan trọng cấu trúc
5. **Rendering**: Output theo thứ tự ranking cho đến khi hết token budget

### 2.3 Agent Routing & Giới Hạn Bước

OpenClaude hỗ trợ **định tuyến agent theo loại đến các model khác nhau**.

```json
{
  "agentModels": {
    "deepseek-v4-flash": { "base_url": "...", "api_key": "..." }
  },
  "agentRouting": {
    "Explore": "deepseek-v4-flash",
    "default": "gpt-4o"
  }
}
```

**Giới hạn bước (maxSteps):**

```markdown
---
name: bounded-researcher
maxSteps: 8
---

You are a focused research agent.
```

---

## 3. Hướng Dẫn Bắt Đầu Nhanh

### 3.1 Cài đặt

```bash
npm install -g @gitlawb/openclaude@latest
```

### 3.2 Khởi động nhanh với OpenAI

```bash
export CLAUDE_CODE_USE_OPENAI=1
export OPENAI_API_KEY=sk-your-key-here
export OPENAI_MODEL=gpt-4o
openclaude
```

### 3.3 Khởi động nhanh với Ollama cục bộ

```bash
ollama pull qwen2.5-coder:7b

export CLAUDE_CODE_USE_OPENAI=1
export OPENAI_BASE_URL=http://localhost:11434/v1
export OPENAI_MODEL=qwen2.5-coder:7b
openclaude
```

---

## 4. Tóm Tắt Triết Lý Thiết Kế

### 4.1 Provider Agnosticism
Hỗ trợ 20+ provider thông qua lớp trừu tượng kép: OpenAI-compatible + Anthropic-native.

### 4.2 Terminal-First
Tất cả tính năng được cung cấp qua CLI. Nhà phát triển đã ở trong terminal — công cụ nên đến với họ.

### 4.3 Progressive Complexity
Bắt đầu với zero config. Một lệnh `openclaude` là hoạt động. Tùy chỉnh dần khi sử dụng.

### 4.4 Local-First, Nhưng Không Chỉ Local
Ollama/Atomic Chat/LM Studio cho coding không tốn phí API, offline, riêng tư. Nhưng cũng hỗ trợ cloud API.

---

## 5. Kết Luận

OpenClaude đại diện cho một triết lý khác: không phải xây dựng Claude Code tốt hơn, mà là một **Agent CLI không phân biệt model nào**.

Giá trị cốt lõi: **Tự do**. Không khóa provider, không ràng buộc ecosystem, không yêu cầu duy trì toolchain riêng cho từng model.

**Tài nguyên liên quan:**
- GitHub: https://github.com/Gitlawb/openclaude
- npm: https://www.npmjs.com/package/@gitlawb/openclaude
- Discord: https://discord.gg/k68zFR6AcB
