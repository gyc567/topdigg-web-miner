---
slug: swarmforge-analysis
title: "SwarmForge: Nền tảng điều phối Multi-AI Agent dựa trên tmux"
description: "Phân tích chuyên sâu SwarmForge (nền tảng điều phối AI Agent dựa trên tmux) — đạt được sự cộng tác phát triển phần mềm đa AI agent thông qua cấu hình workflow (two-pack/four-pack/six-pack), cách ly Worktree, giao thức Handoff và cấu trúc Constitution. Chi tiết bao gồm: kiến trúc dự án, ba workflow预设，三种预设工作流、工作机制详解、配置驱动设计理念和使用示例。"
date: "2026-08-13"
author: "TopDigg"
tags: ["SwarmForge", "Multi-Agent", "tmux", "AI Agent", "Orchestration", "Worktree", "Handoff", "Developer Tools", "AI Agents"]
categories: ["Deep Dive"]
keywords: ["SwarmForge", "Đa Agent", "tmux", "Điều phối AI Agent", "Cách ly Worktree", "Giao thức Handoff", "Kỹ thuật phần mềm", "Tự động hóa", "Công cụ phát triển", "Cộng tác AI", "four-pack", "six-pack"]
---

# SwarmForge: Nền tảng điều phối Multi-AI Agent dựa trên tmux

> Triết lý cốt lõi: **Để nhiều AI agent làm việc cùng nhau như một đội phát triển.** SwarmForge là một nền tảng điều phối multi-AI Agent nhẹ, chạy trong môi trường tmux cục bộ, điều phối nhiều AI agent cùng phát triển dự án phần mềm thông qua các workflow được điều khiển bằng cấu hình. Nó không theo đuổi các dịch vụ đám mây phức tạp hoặc giao diện hào nhoáng, mà tập trung vào việc cho phép AI Agent làm việc hiệu quả trong các git worktree được cách ly thông qua giao thức Handoff có cấu trúc. Đây là hướng dẫn đầy đủ bao gồm kiến trúc dự án, cơ chế cốt lõi, ba workflow预设，三种预设工作流、工作机制详解、配置驱动设计理念和使用示例。

## 1. Giới thiệu dự án và Tổng quan

### 1.1 Định vị trong một câu

**SwarmForge là một nền tảng điều phối multi-AI Agent dựa trên tmux, cho phép nhiều AI agent phát triển phần mềm cộng tác trong các git worktree được cách ly thông qua các workflow được điều khiển bằng cấu hình.**

Triết lý cốt lõi của nó là "Cấu hình như Code" — thay vì dựa vào các workflow được hardcode, nó định nghĩa toàn bộ cách cộng tác của đội thông qua các tệp cấu hình `swarmforge.conf` và định nghĩa prompt vai trò. Mỗi vai trò (Agent) làm việc trong môi trường được cách ly riêng của mình, truyền tải tác vụ và ngữ cảnh thông qua các tệp Handoff có cấu trúc.

### 1.2 Siêu dữ liệu dự án

| Trường | Giá trị |
|--------|----------|
| GitHub | [unclebob/swarm-forge](https://github.com/unclebob/swarm-forge) |
| Stars | Chưa xác nhận |
| Giấy phép | Chưa xác nhận |
| Ngôn ngữ | Shell + Tệp cấu hình |
| Tác giả | unclebob（fork by gyc567）|
| Phụ thuộc | tmux, git |

### 1.3 Đề xuất giá trị cốt lõi

Các giá trị cốt lõi của SwarmForge có thể được tóm tắt trong ba từ:

- **Thực thi nhẹ**: Chạy trong môi trường tmux cục bộ, không cần cơ sở hạ tầng đám mây phức tạp
- **Điều khiển bằng cấu hình**: Tất cả workflow được định nghĩa thông qua tệp cấu hình, không hardcode
- **Cộng tác được cách ly**: Mỗi vai trò làm việc trong git worktree được cách ly, tránh can thiệp lẫn nhau

### 1.4 Sự khác biệt với các hệ thống Multi-Agent khác

Sự khác biệt chính giữa SwarmForge và các hệ thống multi-agent khác (như CrewAI, AutoGen, LangChain Agents):

```
┌─────────────────────────────────────────────┐
│  Các hệ thống Multi-Agent khác              │
│  - Cơ chế truyền tin phức tạp              │
│  - Bộ điều phối tập trung                  │
│  - Yêu cầu API key và dịch vụ đám mây     │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│  SwarmForge                                  │
│  - Phiên tmux nhẹ                           │
│  - Cộng tác phân tán (qua tệp Handoff)      │
│  - Thực thi cục bộ, không phụ thuộc bên ngoài │
└─────────────────────────────────────────────┘
```

## 2. Triết lý thiết kế cốt lõi

### 2.1 Cấu hình như Code

Nguyên tắc thiết kế quan trọng nhất của SwarmForge là** điều khiển bằng cấu hình**. Điều này được phản ánh trong:

**Workflow khai báo**
- Không cần viết mã điều phối phức tạp
- Khai báo workflow và vai trò trong `swarmforge.conf`
- Hệ thống tự động tạo cửa sổ và phiên tmux dựa trên cấu hình

**Prompt vai trò được tách biệt**
- Hành vi của mỗi vai trò được định nghĩa bởi prompt trong thư mục `roles/`
- Có thể sửa đổi hành vi vai trò bất kỳ lúc nào mà không cần thay đổi mã cốt lõi
- Hỗ trợ vai trò tùy chỉnh theo dự án

**Ràng buộc Hiến pháp**
- Hướng dẫn hành vi đội được định nghĩa qua `constitution.prompt`
- Bao gồm tiêu chuẩn kỹ thuật (engineering.prompt)
- Định nghĩa giao thức Handoff (handoffs.prompt)
- Chỉ định quy tắc workflow (workflow.prompt)

### 2.2 Ưu tiên cách ly

**Cách ly Worktree**
- Mỗi vai trò làm việc trong git worktree được cách ly
- Ngăn nhiều Agent sửa đổi cùng một codebase cùng lúc
- Hỗ trợ xử lý song song các nhánh tác vụ khác nhau

**Cách ly phiên**
- Mỗi vai trò có cửa sổ tmux riêng
- Có thể quan sát trạng thái của mỗi Agent theo thời gian thực
- Vấn đề của một Agent không ảnh hưởng đến các Agent khác

### 2.3 Giao thức Handoff

**Truyền tải tác vụ có cấu trúc**
- Agent truyền tải tác vụ qua các tệp Handoff
- Bao gồm trạng thái hiện tại, công việc đã hoàn thành và bước tiếp theo
- Đảm bảo truyền tải tác vụ trơn tru giữa các Agent

**Bảo toàn ngữ cảnh**
- Mỗi Handoff chứa đủ ngữ cảnh
- Bên nhận có thể tiếp quản công việc ngay lập tức
- Giảm công việc trùng lặp và mất trạng thái

## 3. Ba Workflow预设，三种预设工作流工作流程 chi tiết

### 3.1 two-pack: Tác vụ backend nhanh

**Phù hợp với**: Tác vụ backend đơn giản đến trung bình

**Cấu hình vai trò**:
| Vai trò | Trách nhiệm |
|---------|-------------|
| coder | Viết mã và triển khai |
| cleaner | Dọn dẹp và tối ưu mã |

**Quy trình làm việc**:
```
Người dùng khởi động two-pack
    ↓
coder viết mã trong worktree được cách ly
    ↓
coder hoàn thành, tạo tệp Handoff
    ↓
cleaner đọc Handoff, dọn dẹp mã
    ↓
cleaner hoàn thành, xuất mã cuối cùng
```

**Đặc điểm**:
- Cấu hình tối thiểu, phù hợp với tác vụ nhanh
- Hai Agent tập trung vào trách nhiệm riêng của họ
- Phù hợp với dự án nhỏ hoặc phát triển tính năng đơn lẻ

### 3.2 four-pack: Dự án độ phức tạp trung bình

**Phù hợp với**: Dự án fullstack độ phức tạp trung bình

**Cấu hình vai trò**:
| Vai trò | Trách nhiệm |
|---------|-------------|
| specifier | Phân tích yêu cầu và định nghĩa đặc tả |
| coder | Viết mã và triển khai |
| refactorer | Tái cấu trúc và tối ưu mã |
| architect | Thiết kế kiến trúc và quyết định |

**Quy trình làm việc**:
```
Người dùng khởi động four-pack
    ↓
specifier phân tích yêu cầu, tạo đặc tả
    ↓
architect thiết kế kiến trúc dựa trên đặc tả
    ↓
coder viết mã theo kiến trúc
    ↓
refactorer tái cấu trúc và tối ưu mã
    ↓
Xuất codebase cuối cùng
```

**Đặc điểm**:
- Bốn vai trò bao phủ toàn bộ vòng đời phát triển
- Từ yêu cầu đến kiến trúc đến triển khai và tối ưu
- Phù hợp với dự án nhỏ đến trung bình cần một số lập kế hoạch

### 3.3 six-pack: Dự án lớn

**Phù hợp với**: Dự án phức tạp lớn, yêu cầu đảm bảo chất lượng nghiêm ngặt

**Cấu hình vai trò**:
| Vai trò | Trách nhiệm |
|---------|-------------|
| specifier | Phân tích yêu cầu và định nghĩa đặc tả chi tiết |
| coder | Viết mã và triển khai |
| cleaner | Dọn dẹp và tối ưu mã |
| architect | Thiết kế kiến trúc và quyết định |
| hardener | Tăng cường bảo mật và tối ưu hiệu suất |
| QA | Đảm bảo chất lượng và kiểm thử |

**Quy trình làm việc**:
```
Người dùng khởi động six-pack
    ↓
specifier phân tích yêu cầu, tạo đặc tả chi tiết
    ↓
architect thiết kế kiến trúc hệ thống
    ↓
coder triển khai mã chức năng
    ↓
cleaner dọn dẹp phong cách mã
    ↓
hardener thực hiện tăng cường bảo mật và hiệu suất
    ↓
QA tiến hành kiểm thử và kiểm tra chất lượng toàn diện
    ↓
Xuất codebase cấp sản xuất
```

**Đặc điểm**:
- Sáu vai trò bao phủ toàn bộ vòng đời phát triển và đảm bảo chất lượng
- Bao gồm các giai đoạn tăng cường bảo mật và hiệu suất
- Phù hợp với dự án lớn hoặc yêu cầu độ tin cậy cao

## 4. Chi tiết Cơ chế làm việc

### 4.1 Cách ly Worktree

**Cơ bản về Git Worktree**

Git Worktree cho phép nhiều thư mục làm việc cho cùng một repository. SwarmForge sử dụng tính năng này để tạo thư mục làm việc được cách ly cho mỗi vai trò:

```bash
# Liệt kê các worktree hiện tại
git worktree list

# Tạo worktree cho vai trò mới
git worktree add ../worktree-coder coder-branch
```

**Ứng dụng Worktree trong SwarmForge**

```
Repository chính (main)
├── worktree-specifier/  (thư mục làm việc của specifier)
├── worktree-coder/      (thư mục làm việc của coder)
├── worktree-architect/  (thư mục làm việc của architect)
└── ...
```

Mỗi worktree tương ứng với một nhánh khác nhau, đảm bảo:
- Agent có thể làm việc mà không ảnh hưởng đến nhánh chính
- Có thể làm việc trên nhiều nhánh cùng lúc
- Có thể tích hợp công việc vào nhánh chính qua merge hoặc PR

### 4.2 Quản lý phiên tmux

**Cấu trúc phiên tmux**

SwarmForge sử dụng cấu trúc phân cấp của tmux để tổ chức các phiên Agent:

```
tmux session: swarmforge
├── window: specifier
├── window: coder
├── window: refactorer
├── window: architect
├── window: cleaner
└── window: QA
```

**Quản lý cửa sổ**
- Mỗi Agent chạy trong cửa sổ được cách ly
- Có thể chuyển cửa sổ bất kỳ lúc nào để quan sát trạng thái Agent
- Hỗ trợ xem nhiều đầu ra Agent với chia đôi màn hình

**Điều khiển phiên**
```bash
# Liệt kê tất cả các phiên
tmux list-sessions

# Kết nối đến phiên cụ thể
tmux attach -t swarmforge

# Chuyển đổi giữa các cửa sổ
Ctrl+b w  # Liệt kê tất cả cửa sổ
Ctrl+b n  # Cửa sổ tiếp theo
Ctrl+b p  # Cửa sổ trước đó
```

### 4.3 Giao thức Handoff

**Cấu trúc tệp Handoff**

Tệp Handoff là tệp văn bản có cấu trúc chứa:

```
=== HANDOFF ===
FROM: coder
TO: refactorer
TASK: Hoàn thành module xác thực người dùng
STATUS: in_progress

Đã hoàn thành:
- API đăng nhập người dùng
- Mã hóa và lưu trữ mật khẩu
- Tạo JWT Token

Đang thực hiện:
- API đăng ký người dùng (hoàn thành 80%)

Còn lại:
- Tính năng xác minh email
- Tính năng đặt lại mật khẩu

Ngữ cảnh:
- Sử dụng framework Express
- Cơ sở dữ liệu: PostgreSQL
- Tiền tố API: /api/v1/auth
===
```

**Luồng Handoff**

```
Agent A làm việc
    ↓
Agent A tạo tệp Handoff
    ↓
Agent B đọc tệp Handoff
    ↓
Agent B tiếp tục làm việc
```

**Nguyên tắc thiết kế chính**
- **Tính nguyên tử**: Mỗi Handoff chứa đầy đủ ngữ cảnh tác vụ
- **Khả năng truy vết**: Ghi lại tất cả công việc đã hoàn thành và còn lại
- **Tính độc lập**: Bên nhận có thể tiếp tục độc lập với bên gửi

## 5. Cấu trúc Constitution

### 5.1 Điểm vào Constitution: constitution.prompt

`constitution.prompt` là điểm vào cho toàn bộ hệ thống constitution:

```
Đây là hiến pháp của đội SwarmForge.

Các thành viên trong đội phải tuân thủ các điều khoản sau:
1. Tiêu chuẩn Kỹ thuật (engineering.prompt)
2. Giao thức Handoff (handoffs.prompt)
3. Quy tắc Workflow (workflow.prompt)

Trước khi thực hiện bất kỳ tác vụ nào, vui lòng đọc và hiểu các điều khoản hiến pháp.
```

### 5.2 Tiêu chuẩn Kỹ thuật: constitution/articles/engineering.prompt

Định nghĩa chất lượng mã và tiêu chuẩn kỹ thuật:
- Hướng dẫn phong cách mã
- Định dạng thông điệp commit
- Tiêu chuẩn tạo PR/MR
- Tiêu chí đánh giá mã

### 5.3 Giao thức Handoff: constitution/articles/handoffs.prompt

Định nghĩa quy tắc truyền tải tác vụ giữa các Agent:
- Định dạng tệp Handoff
- Quy tắc chuyển đổi trạng thái
- Cơ chế xử lý lỗi

### 5.4 Quy tắc Workflow: constitution/articles/workflow.prompt

Định nghĩa quy tắc thực thi workflow:
- Định nghĩa trách nhiệm từng vai trò
- Quy tắc phân công tác vụ
- Tiêu chí hoàn thành

### 5.5 Định nghĩa vai trò: roles/

Thư mục `roles/` chứa prompt cho từng vai trò:

```
roles/
├── specifier.prompt      # Nhà phân tích yêu cầu
├── coder.prompt          # Lập trình viên
├── cleaner.prompt         # Người dọn dẹp mã
├── architect.prompt       # Kiến trúc sư
├── hardener.prompt        # Chuyên gia tăng cường bảo mật
└── QA.prompt             # Kỹ sư đảm bảo chất lượng
```

Mỗi prompt vai trò bao gồm:
- Mô tả trách nhiệm vai trò
- Phương thức cộng tác với các vai trò khác
- Ứng dụng cụ thể của các điều khoản hiến pháp

## 6. Hỗ trợ đa Backend

### 6.1 Các Backend được hỗ trợ

SwarmForge hỗ trợ nhiều backend AI:

| Backend | Mô tả |
|---------|--------|
| claude | Anthropic Claude |
| codex | OpenAI Codex |
| copilot | GitHub Copilot |
| grok | x.ai Grok |

### 6.2 Phương thức cấu hình

Chỉ định backend trong `swarmforge.conf`:

```ini
[backend]
default = claude

[backend.claude]
model = claude-sonnet-4
api_key = ${ANTHROPIC_API_KEY}

[backend.codex]
model = gpt-4
api_key = ${OPENAI_API_KEY}
```

### 6.3 Chuyển đổi Backend

Có thể chuyển đổi backend dựa trên loại tác vụ:

```bash
# Sử dụng backend claude
SWARM_BACKEND=claude ./swarm

# Sử dụng backend codex
SWARM_BACKEND=codex ./swarm
```

## 7. Ví dụ sử dụng và Thực hành tốt nhất

### 7.1 Khởi đầu nhanh

**Chọn workflow và khởi động**:

```bash
# Sử dụng workflow four-pack
BRANCH=four-pack
curl -L "https://github.com/unclebob/swarm-forge/archive/refs/heads/${BRANCH}.tar.gz" | tar -xz --strip-components=1
./swarm
```

**Luồng khởi động đầy đủ**:

```bash
# 1. Clone hoặc tải SwarmForge
BRANCH=four-pack
curl -L "https://github.com/unclebob/swarm-forge/archive/refs/heads/${BRANCH}.tar.gz" | tar -xz --strip-components=1

# 2. Cấu hình backend AI
export ANTHROPIC_API_KEY="your-api-key"

# 3. Tệp cấu hình (tùy chọn)
# Chỉnh sửa swarmforge.conf để cấu hình workflow và vai trò

# 4. Khởi động swarm
./swarm
```

### 7.2 Ví dụ cấu hình dự án

Tạo cấu hình cho dự án mới:

```ini
# swarmforge.conf
[project]
name = my-awesome-project
description = Một dự án được phát triển với SwarmForge

[workflow]
type = four-pack

[backend]
default = claude

[backend.claude]
model = claude-sonnet-4
max_tokens = 8192

[roles.specifier]
system_prompt = Bạn là nhà phân tích yêu cầu tập trung vào thiết kế thân thiện với người dùng

[roles.coder]
system_prompt = Bạn là kỹ sư full-stack thành thạo TypeScript và Python
```

### 7.3 Thực hành tốt nhất

**1. Chọn Workflow phù hợp**
- Sử dụng two-pack cho tác vụ đơn giản
- Sử dụng four-pack cho độ phức tạp trung bình
- Sử dụng six-pack cho dự án lớn

**2. Tận dụng giám sát thời gian thực**
- Sử dụng `tmux attach` để kết nối phiên
- Sử dụng `Ctrl+b w` để chuyển cửa sổ
- Quan sát đầu ra của từng Agent theo thời gian thực

**3. Sử dụng Handoff đúng cách**
- Đảm bảo mỗi Handoff chứa đủ ngữ cảnh
- Đánh dấu rõ ràng công việc đã hoàn thành và còn lại trong tệp Handoff
- Cập nhật trạng thái kịp thời để tránh trùng lặp công việc

**4. Đồng bộ mã thường xuyên**
- Thường xuyên hợp nhất công việc của Agent vào nhánh chính
- Sử dụng PR/MR để đánh giá mã
- Duy trì đồng bộ giữa worktree và nhánh chính

**5. Tùy chỉnh vai trò**
- Sửa đổi prompt vai trò dựa trên nhu cầu dự án
- Tạo định nghĩa vai trò mới trong thư mục `roles/`
- Đảm bảo vai trò mới tuân thủ các điều khoản hiến pháp

### 7.4 Xử lý sự cố

**Các vấn đề thường gặp**:

1. **Phiên tmux không khởi động được**
   - Kiểm tra tmux đã được cài đặt: `tmux -V`
   - Kiểm tra phiên đã tồn tại: `tmux list-sessions`

2. **Kết nối backend AI thất bại**
   - Xác minh API key được đặt đúng
   - Kiểm tra kết nối mạng
   - Xác thực cấu hình backend

3. **Tệp Handoff không có hiệu lực**
   - Kiểm tra đường dẫn tệp Handoff
   - Đảm bảo định dạng tệp đúng
   - Xác minh Agent đã đọc đúng Handoff

## 8. Tóm tắt các Điểm chính

### 8.1 Ưu thế của SwarmForge

1. **Thiết kế nhẹ**
   - Chạy trong môi trường tmux cục bộ
   - Không cần cơ sở hạ tầng đám mây phức tạp
   - Tiêu thụ tài nguyên cực thấp

2. **Điều khiển bằng cấu hình**
   - Tất cả workflow có thể cấu hình
   - Dễ dàng tùy chỉnh và mở rộng
   - Tuân thủ nguyên tắc "Cấu hình như Code"

3. **Cộng tác được cách ly**
   - Mỗi vai trò làm việc độc lập
   - Không có sự can thiệp lẫn nhau
   - Hỗ trợ làm việc song song

4. **Handoff có cấu trúc**
   - Truyền tải tác vụ rõ ràng
   - Bảo toàn ngữ cảnh đầy đủ
   - Khả năng truy vết mạnh

### 8.2 Trường hợp sử dụng

- **Đội nhỏ**: Phát triển prototype nhanh
- **Nhà phát triển cá nhân**: Cải thiện hiệu quả phát triển
- **Dự án lớn**: Phân rã cộng tác cho các tác vụ phức tạp
- **Học tập và thử nghiệm**: Hiểu hệ thống đa Agent

### 8.3 Hạn chế

- **Hạn chế thực thi cục bộ**: Không phù hợp với các kịch bản cộng tác từ xa
- **Phụ thuộc tmux**: Cần một số kinh nghiệm sử dụng tmux
- **Hạn chế backend AI**: Yêu cầu API key hợp lệ

### 8.4 Triển vọng tương lai

SwarmForge đại diện cho một cách tiếp cận mới đối với hệ thống đa agent — nhẹ, điều khiển bằng cấu hình, ưu tiên cục bộ. Khi công nghệ AI Agent trưởng thành, cách tiếp cận điều phối đơn giản nhưng hiệu quả này có thể ngày càng phổ biến.

## 9. Tài nguyên tham khảo

- [SwarmForge GitHub Repository](https://github.com/unclebob/swarm-forge)
- [tmux Tài liệu chính thức](https://github.com/tmux/tmux)
- [Git Worktree Tài liệu](https://git-scm.com/docs/git-worktree)

---

*Bài viết này được phân tích và biên soạn tự động bởi TopDigg. Theo dõi chúng tôi để cập nhật mới nhất về AI Agent và công cụ phát triển.*
