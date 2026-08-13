---
title: "Hướng Dẫn Toàn Diện AGENTS.md: Nghệ Thuật Cấu Hình Trợ Lý Lập Trình AI"
date: 2026-08-14
description: "Tìm hiểu sâu về triết lý cấu hình và best practices của AGENTS.md để giúp trợ lý lập trình AI hiểu rõ hơn về dự án của bạn"
categories: ["AI Tools", "Developer Experience"]
tags: ["AGENTS.md", "Claude Code", "Cursor", "Copilot", "AI Assistant", "Configuration"]
draft: false
---

## Giới Thiệu

Trong thời đại AI programming assistants ngày càng phổ biến, cách để những công cụ này thực sự hiểu dự án của bạn và tuân thủ quy ước của nhóm đã trở thành chìa khóa để cải thiện hiệu quả phát triển. AGENTS.md, như một open standard, đang được hỗ trợ rộng rãi bởi các công cụ AI programming chính như Cursor, Copilot, Codex và Claude Code. Bài viết này sẽ đi sâu vào triết lý thiết kế và best practices của AGENTS.md.

## Tại Sao AGENTS.md Quan Trọng

### Dilemma của Các Tệp Cấu Hình Lớn

Mặc dù các mô hình ngôn ngữ lớn (LLM) hiện đại không ngừng được cải thiện về năng lực, chúng vẫn có những giới hạn cố hữu trong việc tuân thủ hướng dẫn. Nghiên cứu cho thấy rằng ngay cả LLM tiên tiến nhất cũng chỉ có thể nhất quán tuân thủ khoảng **150-200** hướng dẫn. Khi các tệp AGENTS.md trở nên cồng kềnh, những vấn đề sau sẽ xảy ra:

- **Lãng phí token**: Mỗi token đều được tải trong mỗi yêu cầu, nội dung dư thừa trực tiếp làm tăng chi phí
- **Giảm tuân thủ**: Nhiều hướng dẫn hơn có nghĩa là mô hình có khả năng cao hơn sẽ bỏ qua hoặc hiểu sai các quy tắc quan trọng
- **Phản hồi chậm hơn**: Ngữ cảnh dài hơn có nghĩa là thời gian phản hồi ban đầu chậm hơn

### Chi Phí Thực Sự của Các Tệp Cồng Kềnh

Một ví dụ điển hình về anti-pattern là tệp AGENTS.md chứa hàng nghìn dòng "best practices." Những tệp như vậy:
- Chứa nhiều hướng dẫn không bao giờ được thực thi
- Trộn lẫn các quy tắc xung đột cho các kịch bản khác nhau
- Khó bảo trì và cập nhật
- Trở thành rào cản hiểu biết cho các thành viên mới

## AGENTS.md vs CLAUDE.md: Sự Khác Biệt Chính

Mặc dù tên gọi giống nhau, hai tệp này có mục đích khác nhau:

| Tính năng | AGENTS.md | CLAUDE.md |
|-----------|-----------|-----------|
| **Tiêu chuẩn** | Cross-platform open standard | Claude Code specific config |
| **Công cụ hỗ trợ** | Cursor, Copilot, Codex, Claude Code, v.v. | Chỉ Claude Code |
| **Mục tiêu thiết kế** | Hướng dẫn dự án chung | Tối ưu hóa dành riêng cho Claude |
| **Hệ sinh thái** | Open standard, community-driven | Vendor lock-in (Anthropic) |

**Điểm cốt lõi**: Nếu bạn muốn cấu hình dự án có thể được sử dụng bởi nhiều công cụ AI programming, AGENTS.md là lựa chọn tốt hơn; nếu bạn tập trung vào việc tối ưu hóa trải nghiệm Claude Code, CLAUDE.md cung cấp quyền kiểm soát tinh tế hơn.

## Nội Dung Cốt Lõi của Tệp Gốc

Một tệp AGENTS.md gốc hiệu quả nên giữ được sự ngắn gọn, chỉ chứa thông tin quan trọng nhất.

### Ba Yếu Tố Thiết Yếu

#### 1. Mô Tả Dự Án Một Câu

```markdown
# Tên Dự Án

Một bot giao dịch tiền điện tử hiệu suất cao được xây dựng bằng Rust
```

Điều này cho phép AI assistant thiết lập đúng ngữ cảnh khi lần đầu tiếp xúc với dự án.

#### 2. Chỉ Định Package Manager

```markdown
## Package Manager

- Sử dụng `poetry` để quản lý dependencies Python
- Sử dụng `cargo` để quản lý dependencies Rust
```

Điều này đặc biệt quan trọng nếu dự án sử dụng toolchain không tiêu chuẩn.

#### 3. Các Lệnh Build Không Tiêu Chuẩn

```markdown
## Build Commands

- Type check: `pytest --type-check`
- Build: `make build TARGET=release`
- Test coverage: `make coverage`
```

Tránh để AI đoán hoặc sử dụng sai lệnh build.

### Những Gì Cần Tránh

**Không nên bao gồm trong tệp gốc:**
- Hướng dẫn style code chi tiết (chuyển sang tệp riêng)
- Hướng dẫn sử dụng framework cụ thể (trừ khi là cốt lõi của dự án)
- Tài liệu cấu trúc thư mục hoàn chỉnh (thông tin này nhanh chóng lỗi thời)

## Nguyên Tắc Progressive Disclosure

"Progressive Disclosure" là triết lý cốt lõi trong việc thiết kế AGENTS.md hiệu quả. Ý tưởng cốt lõi là: **chỉ tải các quy tắc liên quan khi cần**.

### Ví Dụ Cấu Trúc Thư Mục

```
project/
├── AGENTS.md              # Root: global rules + links
├── docs/
│   ├── TYPESCRIPT.md      # TypeScript-specific rules
│   ├── TESTING.md         # Testing conventions
│   ├── API.md             # API design guidelines
│   └── DEPLOYMENT.md      # Deployment process
└── packages/
    ├── core/
    │   └── AGENTS.md      # Core module-specific rules
    └── cli/
        └── AGENTS.md      # CLI tool-specific rules
```

### Cách Liên Kết Các Tệp Con

Sử dụng các liên kết rõ ràng trong AGENTS.md gốc:

```markdown
## Detailed Documentation

- [TypeScript Guidelines](docs/TYPESCRIPT.md)
- [Testing Guide](docs/TESTING.md)
- [API Design](docs/API.md)
```

### Ưu Điểm của Progressive Disclosure

1. **Giảm tải nhận thức**: Cả AI và con người chỉ cần tập trung vào các quy tắc liên quan đến công việc hiện tại
2. **Cải thiện tuân thủ**: Ít hướng dẫn hơn có nghĩa là độ chính xác thực thi cao hơn
3. **Dễ bảo trì hơn**: Các tệp độc lập có thể được cập nhật độc lập mà không ảnh hưởng đến các quy tắc khác
4. **Cách ly tốt hơn**: Giảm xung đột và phụ thuộc giữa các quy tắc

## Hỗ Trợ Monorepo

Một tính năng mạnh mẽ khác của AGENTS.md là hỗ trợ cấu hình đa cấp.

### Quy Tắc Merge

Khi tệp AGENTS.md tồn tại trong các thư mục khác nhau, AI assistants sẽ tự động merge chúng:

- **Root AGENTS.md**: Global rules, shared tools, general conventions
- **Subdirectory AGENTS.md**: Specific package guidance

### Ví Dụ Thực Tế

Giả sử bạn có monorepo với cấu trúc sau:

```
monorepo/
├── AGENTS.md              # Overall project description
├── packages/
│   ├── shared/
│   │   └── AGENTS.md      # Shared library rules
│   └── app/
│       ├── AGENTS.md      # Application-specific rules
│       └── docs/
│           └── FEATURES.md
```

Các quy tắc trong subdirectory kế thừa và mở rộng các quy tắc của thư mục gốc, tạo thành ngữ cảnh hoàn chỉnh.

## Best Practices và Common Pitfalls

### Best Practices

#### 1. Sử Dụng Từ Nhấn Mạnh Để Cải Thiện Tuân Thủ

```markdown
IMPORTANT: Tất cả API responses phải bao gồm mã lỗi
MUST: Chạy tests trước khi commit
NEVER: Không commit trực tiếp vào main branch
```

Nghiên cứu cho thấy rằng các từ chỉ dẫn mạnh (như IMPORTANT, MUST, NEVER) cải thiện đáng kể tỷ lệ tuân thủ của mô hình.

#### 2. Giữ Ngắn Gọn, Nhấn Mạnh Ưu Tiên

Một AGENTS.md tốt:
- Mỗi quy tắc một câu
- Được sắp xếp theo ưu tiên
- Sử dụng thuật ngữ dành riêng cho dự án

#### 3. Team vs Personal Preferences

| Loại | Vị trí | Ví dụ |
|------|--------|-------|
| Team rules | Main AGENTS.md | Code review process, Git conventions |
| Personal preferences | Local override files | Editor settings, shortcuts |

#### 4. Review và Dọn Dẹp Định Kỳ

Mỗi quý review AGENTS.md của bạn, loại bỏ:
- Các quy tắc không còn áp dụng
- Các hướng dẫn không bao giờ được tuân thủ
- Các quy định xung đột với thực tế

### Common Pitfalls

#### Pitfall 1: Over-documenting

**Ví dụ sai**:
```markdown
## Code Style

- Tên class sử dụng PascalCase
- Tên method sử dụng camelCase
- Tên biến sử dụng snake_case
- Constants viết hoa toàn bộ
- Private methods bắt đầu bằng _
- ...
(tiếp tục 200 dòng)
```

**Cách đúng**: Liên kết đến cấu hình linter hoặc tài liệu style guide.

#### Pitfall 2: Documenting File Structure

**Ví dụ sai**:
```markdown
## Directory Structure

src/
├── controllers/
│   ├── AuthController.php
│   └── UserController.php
├── models/
│   └── User.php
└── services/
    └── AuthService.php
```

**Cách đúng**: Mô tả hình dạng và khả năng của dự án, không phải đường dẫn cụ thể.

#### Pitfall 3: Bao Gồm Thông Tin Lỗi Thời

Đường dẫn tệp, phiên bản dependencies, cấu hình công cụ nhanh chóng lỗi thời. Giữ AGENTS.md ở cấp cao và theo nguyên tắc, tránh các chi tiết kỹ thuật cụ thể.

## Tóm Tắt Các Điểm Chính

1. **Giữ ngắn gọn**: Root AGENTS.md nên dưới 150-200 dòng, chỉ chứa các hướng dẫn cốt lõi
2. **Progressive disclosure**: Di chuyển các quy tắc chi tiết sang tệp riêng, tải khi cần
3. **Mô tả khả năng, không phải cấu trúc**: Giải thích dự án có thể làm gì, không phải tệp ở đâu
4. **Sử dụng từ nhấn mạnh**: IMPORTANT, MUST, NEVER cải thiện tuân thủ
5. **Cân nhắc cross-platform**: Nếu cần hỗ trợ multi-tool, ưu tiên AGENTS.md hơn config độc quyền
6. **Bảo trì định kỳ**: Liên tục dọn dẹp các quy tắc lỗi thời để giữ cho tệp sống động

## Kết Luận

AGENTS.md không chỉ là một tệp cấu hình - nó là ngôn ngữ tự mô tả dự án trong kỷ nguyên AI. Bằng cách tuân thủ triết lý thiết kế "nhỏ và đẹp", chúng ta có thể giúp các AI programming assistants hiểu dự án của mình hiệu quả hơn, tuân thủ các quy ước của chúng ta, và cuối cùng trở thành đối tác phát triển thực sự có giá trị.

Chiến lược AGENTS.md đúng có thể:
- Giảm thiểu hiểu lầm và lỗi của AI
- Tăng tốc độ phát triển
- Cải thiện tính nhất quán của code
- Hạ thấp rào cản cho các thành viên mới

Hãy xem xét AGENTS.md của dự án ngay bây giờ và bắt đầu hành trình đơn giản hóa.

---

*Nếu bạn thấy bài viết này hữu ích, hãy chia sẻ nó với nhiều developer friends hơn.*
