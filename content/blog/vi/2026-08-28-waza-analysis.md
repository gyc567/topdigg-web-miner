---
title: "tw93/Waza: Chuyển Thói quen Kỹ thuật Thành Kỹ năng AI Agent"
date: "2026-08-28"
description: "tw93/Waza, 8 lệnh Slash chuyển thói quen kỹ thuật thành kỹ năng AI Agent, thiết kế theo triết lý 'ràng buộc tạo nên tự do'"
tags:
  - AI Agent
  - Waza
  - tw93
  - slash commands
  - kỹ năng Agent
  - công cụ AI
categories:
  - Phân tích chuyên sâu
  - Công cụ AI
  - Dự án nguồn mở
  - Kỹ năng Agent
---

# tw93/Waza: Chuyển Thói quen Kỹ thuật Thành Kỹ năng AI Agent

## 1. Bối cảnh: Tại sao AI Agent cần thói quen kỹ thuật?

Khi các mô hình ngôn ngữ lớn (LLM) tiến hóa thành AI Agent có khả năng thực thi đa bước, một vấn đề tồn tại dai dẳng: làm sao để Agent duy trì **tính nhất quán trong hành vi**, **chất lượng đầu ra ổn định**, và **khả năng tự kiểm tra** xuyên suốt các tác vụ phức tạp?

Các Agent framework hiện tại như LangChain, AutoGen, hay CrewAI cung cấp kiến trúc tổng thể, nhưng lại để ngỏ câu hỏi: **"Agent nên suy nghĩ như thế nào trước khi hành động? Làm sao để nó biết khi nào cần dừng lại và kiểm tra?"**

tw93 nhận ra rằng bản thân lập trình viên đã có sẵn những thói quen kỹ thuật tốt — viết test trước khi code, đọc tài liệu trước khi implement, kiểm tra lỗi sau khi deploy. Waza ra đời với ý tưởng đột phá: **chuyển những thói quen kỹ thuật này thành kỹ năng Agent có thể thực thi thông qua 8 lệnh Slash đơn giản.**

---

## 2. Triết lý thiết kế

### Less is More

Waza không cố gắng bao quát mọi trường hợp sử dụng. Thay vào đó, nó chỉ cung cấp **8 lệnh Slash** — mỗi lệnh tương ứng với một thói quen kỹ thuật cốt lõi. Sự tối giản này không phải là giới hạn, mà là **thiết kế có chủ đích**: khi Agent chỉ có 8 hành động chính, nó sẽ học cách chọn đúng hành động thay vì lan man.

### Structure is Efficiency

Mỗi lệnh Slash trong Waza đi kèm một cấu trúc prompt cố định. Cấu trúc này không ràng buộc sáng tạo, mà **tạo nền tảng cho sự sáng tạo có kiểm soát**. Khi Agent biết rõ "sau khi viết code xong, mình phải chạy /check để xác minh", nó sẽ tự động xây dựng chuỗi hành động có chiến lược.

### Project-Aware

Waza được thiết kế để **nhận biết ngữ cảnh dự án**. Các lệnh Slash không hoạt động trong chân không — chúng đọc cấu trúc thư mục, hiểu ngôn ngữ lập trình đang dùng, và thích ứng đầu ra theo convention của dự án. Một `/check` trong dự án Rust sẽ chạy `cargo check`; trong Python sẽ chạy `ruff` hoặc `mypy`.

---

## 3. 8 kỹ năng chi tiết

### /think — Suy nghĩ có chiến lược trước khi hành động

`/think` là lệnh nền tảng nhất, được thiết kế để Agent **dừng lại và tư duy trước khi viết bất kỳ dòng code nào**.

Khi Agent nhận lệnh `/think`, nó sẽ:
- Phân tích yêu cầu thành các bước nhỏ
- Xác định các rủi ro tiềm ẩn
- Đề xuất phương án tiếp cận
- Kiểm tra xem có thư viện/hàm đã có sẵn không

```markdown
/think
Yêu cầu: Triển khai chức năng rate limiting cho API
Bối cảnh: Node.js + Express, chạy trên Kubernetes
Câu hỏi cần trả lời:
1. Dùng sliding window hay token bucket?
2. Lưu trạng thái ở Redis hay in-memory?
3. Xử lý distributed case như thế nào?
```

### /hunt — Tìm kiếm có hệ thống

`/hunt` giúp Agent tìm kiếm thông tin một cách **có phương pháp** thay vì click chuột lung tung.

Quy trình `/hunt` gồm 4 giai đoạn:
1. **Scope**: Xác định chính xác cần tìm gì
2. **Source**: Ưu tiên nguồn đáng tin cậy (docs chính thức > blog > Stack Overflow)
3. **Verify**: Kiểm tra thông tin bằng cách đọc ít nhất 2 nguồn
4. **Synthesize**: Tổng hợp thành câu trả lời ngắn gọn

### /check — Tự kiểm tra chất lượng

`/check` là lệnh tự kiểm tra mà Agent chạy **sau khi hoàn thành mỗi tác vụ**.

Các tiêu chí kiểm tra:
- Code có chạy được không? (syntax, runtime errors)
- Có match với specification không?
- Có pass các test case cơ bản không?
- Có conventions nào bị vi phạm không?

```bash
# Agent sẽ tự động chạy
cargo clippy -- -D warnings  # Rust
ruff check .                 # Python
eslint .                     # JavaScript
```

### /ui — Xây dựng giao diện có nguyên tắc

`/ui` hướng dẫn Agent tạo giao diện người dùng theo **design system nhất quán**.

Agent sử dụng `/ui` sẽ:
- Tuân thủ color palette và typography của dự án
- Đảm bảo accessibility (contrast ratio, ARIA labels)
- Kiểm tra responsive trên nhiều viewport
- Tự động generate dark mode nếu dự án hỗ trợ

### /learn — Học từ feedback

`/learn` cho phép Agent **ghi nhận lỗi sai** và tránh lặp lại trong tương lai.

Cơ chế hoạt động:
- Mỗi khi Human sửa lỗi của Agent, `/learn` được trigger
- Agent ghi lại: (1) lỗi gì, (2) tại sao sai, (3) cách sửa đúng
- Khi gặp tình huống tương tự, Agent tự tra cứu memory

### /read — Đọc code hiệu quả

`/read` giúp Agent đọc và **hiểu codebase** nhanh chóng.

Chiến lược đọc:
1. Đọc README và cấu trúc thư mục trước
2. Xác định entry point và data flow
3. Đọc các module quan trọng theo dependency graph
4. Ghi chú lại architecture decisions

### /write — Viết code có định hướng

`/write` là lệnh Agent dùng khi bắt đầu implement một tính năng mới.

Checklist trước khi viết:
- [ ] Đã chạy `/think` chưa?
- [ ] Đã `/read` phần code liên quan chưa?
- [ ] Đã hiểu convention của dự án chưa?
- [ ] Có test case nào cần viết trước không?

### /health — Kiểm tra sức khỏe hệ thống

`/health` dành cho các tác vụ liên quan đến **deployment và monitoring**.

Agent chạy `/health` sẽ:
- Kiểm tra các endpoint health check
- Verify database connectivity
- Xem logs gần đây có lỗi không
- So sánh metrics hiện tại với baseline

---

## 4. Hướng dẫn cài đặt

### Yêu cầu hệ thống

- Node.js 18+
- npm hoặc yarn
- Access token cho OpenAI/Anthropic API (tùy model sử dụng)

### Cài đặt qua npm

```bash
npm install -g @tw93/waza
```

### Cài đặt trong dự án

```bash
cd your-project
npx waza init
```

Lệnh `waza init` sẽ:
1. Tạo thư mục `.waza/` trong dự án
2. Khởi tạo file cấu hình `waza.config.ts`
3. Setup hooks cho Git (tùy chọn)
4. Tạo file `.waza/memory/` để lưu kết quả `/learn`

### Cấu hình

```typescript
// waza.config.ts
export default {
  model: "claude-sonnet-4-20250514",
  projectAware: true,
  slashCommands: {
    think: { enabled: true, model: "claude-sonnet-4-20250514" },
    hunt: { enabled: true, searchDepth: "deep" },
    check: { enabled: true, autoRun: true },
    // ...
  },
  conventions: {
    language: "typescript",
    testFramework: "vitest",
    linter: "eslint",
  },
};
```

### Sử dụng trong Claude Desktop / Cursor

Waza cung cấp integration cho các AI coding tool phổ biến:

```bash
# Cursor
npx waza integrate --with cursor

# Claude Desktop
npx waza integrate --with claude-desktop
```

---

## 5. Bộ ba: Kaku, Waza, Kami

tw93 không chỉ phát triển Waza. Bộ ba công cụ này cùng tạo nên một hệ sinh thái Agent workflow:

### Kaku — Task Orchestration

**Kaku** đảm nhận vai trò **sắp xếp và điều phối tác vụ**. Trong khi Waza tập trung vào kỹ năng cá nhân của Agent, Kaku quản lý:
- Phân tách dự án lớn thành subtasks
- Điều phối nhiều Agent cùng làm việc
- Quản lý dependency giữa các tác vụ
- Theo dõi tiến độ và phát hiện blocker

### Waza — Skill Execution

**Waza** là tầng **thực thi kỹ năng**. Mỗi lệnh Slash là một kỹ năng nhỏ, có thể kết hợp linh hoạt. Waza không biết gì về "dự án tổng thể" — nó chỉ biết: "Đây là cách suy nghĩ đúng, đây là cách tìm kiếm đúng, đây là cách kiểm tra đúng."

### Kami — Knowledge Management

**Kami** là lớp **quản lý tri thức**. Trong khi Waza ghi nhận lỗi sai qua `/learn`, Kami tổng hợp:
- Architecture decisions của dự án
- Coding conventions và style guide
- Team-specific practices
- Business logic và domain knowledge

Ba công cụ này hoạt động bổ sung cho nhau: **Kaku chia việc, Waza làm việc, Kami nhớ việc.**

---

## 6. Năm quan điểm cốt lõi

### Quan điểm 1: Ràng buộc tạo nên tự do

Waza tin rằng **giới hạn không phải kẻ thù của sáng tạo**. Khi Agent có quá nhiều tự do, nó sẽ đưa ra quyết định không nhất quán. 8 lệnh Slash tạo ra khung sườn đủ chặt để đảm bảo chất lượng, nhưng đủ linh hoạt để Agent sáng tạo trong phạm vi đó.

### Quan điểm 2: Thói quen > Công cụ

Nhiều công cụ AI Agent thất bại vì chúng cố gắng thay thế hoàn toàn quy trình của lập trình viên. Waza không làm vậy. Nó **lấy thói quen kỹ thuật đã được chứng minh** và embed vào Agent. Kết quả là Agent hoạt động như một lập trình viên có kinh nghiệm, không phải một hộp đen ngẫu nhiên.

### Quan điểm 3: Project-Aware là bắt buộc

Một Agent hoạt động tốt trong dự án React có thể hoàn toàn vô dụng trong dự án Rust. Waza khẳng định: **mọi tương tác của Agent phải có ngữ cảnh dự án**. Không có "generic solution" — chỉ có solution phù hợp với convention, cấu trúc, và yêu cầu cụ thể của dự án đó.

### Quan điểm 4: Memory phải actionable

Đơn giản chỉ ghi lại lỗi sai là không đủ. Waza yêu cầu `/learn` phải tạo ra **actionable memory**: không phải "đoạn code này sai" mà là "trong tình huống X, dùng approach Y thay vì Z vì reason R". Memory chỉ có giá trị khi nó thay đổi hành vi.

### Quan điểm 5: Sự đơn giản là tính năng

Trong một thế giới mà mọi công cụ đều cố gắng thêm nhiều tính năng hơn, Waza chọn con đường ngược lại. **8 lệnh Slash duy nhất** — không phải 80. Điều này làm cho:
- Agent dễ học hơn
- Prompt dễ maintain hơn
- Hành vi nhất quán hơn
- Onboarding nhanh hơn

---

## 7. Tài nguyên

### Liên kết chính thức

- **GitHub**: [tw93/Waza](https://github.com/tw93/Waza)
- **Documentation**: [waza.tw93.dev](https://waza.tw93.dev)
- **Kaku**: [tw93/Kaku](https://github.com/tw93/Kaku)
- **Kami**: [tw93/Kami](https://github.com/tw93/Kami)

### Bài viết liên quan

- [Building Project-Aware AI Agents](https://waza.tw93.dev/blog/project-aware)
- [From Habits to Skills: The Waza Philosophy](https://waza.tw93.dev/blog/philosophy)
- [Kaku + Waza + Kami: A Complete Workflow](https://waza.tw93.dev/blog/ecosystem)

### Thảo luận và Community

- Discord: `#waza` channel trong server của tw93
- GitHub Discussions: [Issues và Discussions](https://github.com/tw93/Waza/discussions)
- Twitter/X: [@tw93](https://x.com/tw93)

---

*Waza không phải là một framework Agent hoàn chỉnh — nó là một lớp kỹ năng mà bất kỳ Agent nào cũng có thể học. Triết lý "Less is More, Structure is Efficiency, Project-Aware" của nó đáng để suy ngẫm khi thiết kế bất kỳ hệ thống AI Agent nào.*
