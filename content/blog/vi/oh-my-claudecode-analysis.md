---
slug: oh-my-claudecode-analysis
title: "oh-my-claudecode: Hướng Dẫn Chi Tiết Về Khung Điều Phối Đa Tác Nhân Thông Minh Cho Claude Code"
description: "Phân tích toàn diện oh-my-claudecode (38.5k+ stars, MIT, TypeScript) — Khung điều phối đa tác nhân thông minh cho Claude Code. Triết lý thiết kế cốt lõi: đường cong học tập bằng không, điều phối đa tác nhân, định tuyến thông minh, kết hợp kỹ năng. Chi tiết: 19 tác nhân chuyên dụng, 3 cấp độ định tuyến mô hình, 31 Skills, Team Pipeline 5 giai đoạn, Magic Keywords kích hoạt bằng ngôn ngữ tự nhiên, hướng dẫn cài đặt, chế độ cộng tác team, thực hành tốt nhất."
date: "2026-08-13"
author: "TopDigg"
tags: ["oh-my-claudecode", "Claude Code", "Multi-Agent", "Orchestration", "TypeScript", "AI Agents", "Developer Tools", "Skills", "Team Pipeline"]
categories: ["Deep Dive"]
keywords: ["oh-my-claudecode", "Điều phối đa tác nhân Claude Code", "Đa tác nhân", "Hệ thống điều phối", "TypeScript", "AI Agent", "Công cụ phát triển", "Hệ thống Skills", "Team Pipeline", "Magic Keywords", "autopilot", "ralph", "ultrawork", "Cộng tác nhóm", "Định tuyến thông minh"]
---

# oh-my-claudecode: Hướng Dẫn Chi Tiết Về Khung Điều Phối Đa Tác Nhân Thông Minh Cho Claude Code

> Triết lý cốt lõi: **Đừng học Claude Code. Chỉ cần dùng OMC.** oh-my-claudecode (OMC) là một lớp điều phối đa tác nhân chạy trên Claude Code, cho phép kỹ sư con người điều khiển một đội AI bằng ngôn ngữ tự nhiên thông qua 19 tác nhân chuyên dụng, 3 cấp độ định tuyến mô hình, 31 Skills và Team Pipeline 5 giai đoạn. Nó không thay thế Claude Code mà xếp chồng lên trên — đường cong học tập bằng không, tích hợp liền mạch vào workflow hiện có. Đây là hướng dẫn đầy đủ từ đầu, bao gồm giới thiệu dự án, triết lý thiết kế cốt lõi, cài đặt cấu hình, chế độ cộng tác nhóm, danh mục tác nhân, hệ thống kỹ năng, ví dụ sử dụng và thực hành tốt nhất.

## 1. Giới Thiệu Dự Án và Tổng Quan

### 1.1 Định Vị Một Câu

**oh-my-claudecode (OMC) là một hệ thống điều phối đa tác nhân chạy trên Claude Code, sử dụng Skills và các tác nhân chuyên dụng để thay thế cấu hình thủ công và kỹ thuật prompt.** Khẩu hiệu là "Don't learn Claude Code. Just use OMC." — nó biến Claude Code từ một công cụ tác nhân đơn cần crafted prompt cẩn thận thành một môi trường phát triển mà bạn có thể điều khiển đội ngũ đa tác nhân bằng ngôn ngữ tự nhiên.

### 1.2 Metadata Dự Án

| Trường | Giá trị |
|--------|---------|
| GitHub | [Yeachan-Heo/oh-my-claudecode](https://github.com/Yeachan-Heo/oh-my-claudecode) |
| Stars | 38,500+ (liên tục tăng) |
| Forks | 3,400+ |
| Giấy phép | MIT |
| Ngôn ngữ | TypeScript |
| Phiên bản mới nhất | 4.15.7+ |
| npm Package | `oh-my-claude-sisyphus` |
| Người sáng lập | Yeachan Heo ([@Yeachan-Heo](https://github.com/Yeachan-Heo)) |
| Website | https://yeachan-heo.github.io/oh-my-claudecode-website |
| Discord | https://discord.gg/jq6jnSGABY |

### 1.3 Đề xuất Giá trị Cốt lõi

Giá trị cốt lõi của OMC có thể tóm tắt trong ba từ:

- **Đường cong học tập bằng không**: Không cần ghi nhớ các lệnh phức tạp hay cú pháp — chỉ cần mô tả nhu cầu bằng ngôn ngữ tự nhiên
- **Điều phối đa tác nhân**: 19 tác nhân chuyên dụng làm việc cùng nhau, bao phủ vòng đời phát triển đầy đủ từ khám phá đến xác minh
- **Kết hợp thông minh**: Hệ thống Skills cho phép bạn xây dựng chức năng như lắp ráp khối xây dựng, tăng cường theo nhu cầu

### 1.4 Mối Quan Hệ với Claude Code

OMC **không phải** là sự thay thế cho Claude Code — nó là một lớp tăng cường:

```
┌─────────────────────────────────────────────┐
│  Người dùng (Ngôn ngữ tự nhiên)            │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│  Lớp Điều phối OMC (Skills + Agents + Hooks) │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│  Claude Code (Động cơ thực thi nền tảng)     │
└─────────────────────────────────────────────┘
```

Điều này có nghĩa:
- Tất cả tính năng của Claude Code vẫn khả dụng
- OMC chỉ cung cấp khả năng điều phối khi bạn cần cộng tác đa tác nhân
- Không cần thay đổi thói quen sử dụng Claude Code hiện tại

## 2. Triết Lý Thiết Kế Cốt Lõi

### 2.1 Triết Lý Đường Cong Học Tập Bằng Không

Nguyên tắc thiết kế quan trọng nhất của OMC là **đường cong học tập bằng không**. Điều này thể hiện qua:

**Ngôn ngữ tự nhiên ưu tiên**
- Không cần học cú pháp lệnh đặc biệt
- Mô tả trực tiếp những gì bạn muốn bằng ngôn ngữ con người
- Hệ thống tự động nhận diện ý định và kích hoạt kỹ năng phù hợp

**Độ phức tạp tiến triển**
- Bắt đầu với cách sử dụng đơn giản nhất: `/team "task description"`
- Thêm độ phức tạp khi cần: chỉ định mô hình, chọn kết hợp kỹ năng
- Không bắt buộc nắm vững tất cả tính năng cùng lúc

**Tích hợp liền mạch vào Workflow hiện có**
- Không cần xây dựng lại quy trình phát triển
- OMC có thể được thêm một cách tăng dần vào workflow hiện có
- Có thể quay lại Claude Code thuần túy bất kỳ lúc nào

### 2.2 Triết Lý Điều Phối Đa Tác Nhân

**Phân công chuyên môn**
- Mỗi tác nhân chỉ làm một việc, nhưng làm cực kỳ tốt
- 19 tác nhân bao phủ 4 làn đường: Xây dựng/Phân tích, Đánh giá, Chuyên gia lĩnh vực, Điều phối
- Các tác nhân cộng tác thông qua các giao diện được xác định rõ ràng

**Định tuyến động**
- Tự động chọn mô hình phù hợp dựa trên độ phức tạp của nhiệm vụ
- Nhiệm vụ đơn giản dùng haiku (nhanh và rẻ)
- Nhiệm vụ phức tạp dùng opus (chất lượng suy luận cao nhất)
- Mọi thứ đều tự động — người dùng không cần lo lắng

**Chế độ cộng tác nhóm**
- Pipeline 5 giai đoạn đảm bảo mọi nhiệm vụ đều được xem xét kỹ lưỡng
- team-plan → team-prd → team-exec → team-verify → team-fix
- Mỗi giai đoạn có đầu vào, đầu ra và tiêu chí nghiệm thu rõ ràng

### 2.3 Triết Lý Định Tuyến Thông Minh

Định tuyến mô hình của OMC tuân theo nguyên tắc đơn giản: **Sử dụng nguồn lực phù hợp nhất cho mỗi nhiệm vụ**.

| Loại nhiệm vụ | Mô hình khuyến nghị | Lý do |
|---------------|---------------------|-------|
| Khám phá codebase | haiku | Quét nhanh nhiều tệp |
| Phân tích yêu cầu | opus | Cần suy luận sâu và phát hiện ràng buộc ngầm |
| Triển khai code | sonnet | Cân bằng tốc độ và chất lượng |
| Đánh giá bảo mật | sonnet | Cần khả năng suy luận đủ mạnh |
| Thiết kế kiến trúc | opus | Phân tích trade-off phức tạp |
| Viết tài liệu | haiku | Nhiệm vụ đơn giản, trực tiếp |

### 2.4 Triết Lý Kết Hợp Skills

Hệ thống Skills là một trong những tính năng mạnh nhất của OMC. Triết lý thiết kế của nó là **cấu trúc phân lớp có thể kết hợp**:

```
┌─────────────────────────────────────────────┐
│  GUARANTEE LAYER (Tùy chọn)                │
│  Ví dụ: ralph — Không dừng cho đến khi xác minh xong │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│  ENHANCEMENT LAYER (0-N lớp)              │
│  Ví dụ: ultrawork (song song) | git-master (commit) │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│  EXECUTION LAYER (Kỹ năng chính)           │
│  Ví dụ: default (xây dựng) | planner (lập kế hoạch) │
└─────────────────────────────────────────────┘
```

Ưu điểm của thiết kế này:
- **Kết hợp theo nhu cầu**: Chỉ tải các lớp bạn cần
- **Có thể dự đoán**: Mỗi lớp có trách nhiệm rõ ràng, không nhầm lẫn
- **Có thể mở rộng**: Có thể tạo kết hợp Skills tùy chỉnh

## 3. Hướng Dẫn Cài Đặt và Cấu Hình

### 3.1 Yêu Cầu Môi Trường

Trước khi bắt đầu cài đặt, hãy đảm bảo môi trường của bạn đáp ứng các yêu cầu sau:

| Yêu cầu | Phiên bản tối thiểu | Phiên bản khuyến nghị |
|----------|---------------------|------------------------|
| Node.js | 18.0+ | 20.0+ |
| npm | 8.0+ | 10.0+ |
| Claude Code | Phiên bản mới nhất | Phiên bản mới nhất |
| Hệ điều hành | macOS/Linux/Windows (WSL) | macOS/Linux |

### 3.2 Các Bước Cài Đặt

**Cách 1: Cài đặt npm toàn cục (Khuyến nghị cho chế độ plugin)**

```bash
# Cài đặt phiên bản mới nhất
npm install -g oh-my-claude-sisyphus

# Xác minh cài đặt
omc --version

# Chạy trình hướng dẫn cài đặt
omc setup
```

**Cách 2: Cài đặt phát triển cục bộ**

```bash
# Sao chép repository
git clone https://github.com/Yeachan-Heo/oh-my-claudecode.git
cd oh-my-claudecode

# Cài đặt dependencies
npm install

# Liên kết đến toàn cục (chế độ phát triển)
npm link

# Chạy cài đặt
npm run setup
```

**Cách 3: Triển khai Docker**

```bash
# Build image
docker build -t oh-my-claudecode .

# Chạy container
docker run -it oh-my-claudecode omc --version
```

### 3.3 Tệp Cấu Hình

Tệp cấu hình của OMC nằm trong thư mục `~/.omc/`. Tạo hoặc chỉnh sửa `~/.omc/config.json`:

```json
{
  "version": "4.15.7",
  "model": {
    "default": "sonnet",
    "routing": {
      "haiku": ["explore", "writer"],
      "sonnet": ["executor", "debugger", "test-engineer"],
      "opus": ["architect", "planner", "critic"]
    }
  },
  "skills": {
    "default": ["default"],
    "autoLoad": true
  },
  "team": {
    "pipeline": ["team-plan", "team-prd", "team-exec", "team-verify", "team-fix"]
  },
  "hooks": {
    "enabled": true,
    "events": ["onStart", "onError", "onComplete"]
  }
}
```

### 3.4 Thiết Lập Tích Hợp Claude Code

Để cho phép OMC cộng tác liền mạch với Claude Code, cần thực hiện cấu hình sau:

**Kích hoạt OMC trong Cấu hình Claude Code**

```bash
# Khởi tạo kết nối OMC
omc init

# Kích hoạt skills trong Claude Code
/claude-code:omc-setup
```

**Đặt biến môi trường**

```bash
# Thêm vào ~/.bashrc hoặc ~/.zshrc
export OMC_API_KEY="your-api-key"
export OMC_MODEL_PROVIDER="anthropic"  # hoặc "openai", "google"
export OMC_DEFAULT_MODEL="claude-sonnet-4-20250514"
```

### 3.5 Xác Minh Cài Đặt

Sau khi cài đặt hoàn tất, chạy các lệnh sau để xác minh cấu hình:

```bash
# Kiểm tra phiên bản
omc --version
# Đầu ra phải là: omc v4.15.7

# Kiểm tra kết nối Claude Code
omc doctor

# Chạy benchmark tests
./setup.sh
./quick_test.sh
```

Nếu tất cả kiểm tra đều đạt, chúc mừng! OMC đã được cài đặt và cấu hình thành công.

## 4. Chế Độ Cộng Tác Nhóm (Team Pipeline) - Hướng Dẫn Đầy Đủ

### 4.1 Tổng Quan Chế Độ Team

Chế độ Team là phương pháp điều phối được khuyến nghị từ OMC v4.1.7. Nó phân rã các nhiệm vụ phức tạp thành 5 giai đoạn, mỗi giai đoạn do các tác nhân chuyên dụng xử lý, đảm bảo nhiệm vụ được xem xét toàn diện và hoàn thành chất lượng cao.

### 4.2 Chi Tiết Pipeline 5 Giai Đoạn

**Giai đoạn 1: team-plan (Giai đoạn Lập kế hoạch)**

Đầu vào: Yêu cầu ngôn ngữ tự nhiên của người dùng
Đầu ra: Danh sách nhiệm vụ có cấu trúc và kế hoạch thực thi

Trách nhiệm chính:
- Phân tích yêu cầu, xác định ràng buộc ngầm
- Phân rã nhiệm vụ lớn thành các nhiệm vụ nhỏ có thể thực thi
- Xác định phụ thuộc nhiệm vụ và thứ tự thực thi
- Đánh giá rủi ro và yêu cầu tài nguyên

Tác nhân sử dụng: `analyst` + `planner`

**Giai đoạn 2: team-prd (Giai đoạn Yêu cầu Sản phẩm)**

Đầu vào: Danh sách nhiệm vụ từ giai đoạn lập kế hoạch
Đầu ra: PRD chi tiết (Tài liệu Yêu cầu Sản phẩm)

Trách nhiệm chính:
- Viết chi tiết kỹ thuật cho từng tính năng
- Định nghĩa tiêu chí nghiệm thu và điều kiện thành công
- Xác định các trường hợp biên và yêu cầu xử lý lỗi
- Điều phối ý kiến của các bên liên quan

Tác nhân sử dụng: `writer` + `analyst`

**Giai đoạn 3: team-exec (Giai đoạn Thực thi)**

Đầu vào: Tài liệu PRD
Đầu ra: Code đã triển khai và bài test ban đầu

Trách nhiệm chính:
- Thực thi các nhiệm vụ phát triển theo kế hoạch
- Viết bài test đơn vị và bài test tích hợp
- Tuân thủ tiêu chuẩn code và best practices
- Ghi lại mọi vấn đề gặp phải

Tác nhân sử dụng: `executor` + `explore` + `debugger`

**Giai đoạn 4: team-verify (Giai đoạn Xác minh)**

Đầu vào: Code đã triển khai
Đầu ra: Báo cáo xác minh và kết quả test

Trách nhiệm chính:
- Chạy bộ test đầy đủ
- Kiểm tra chất lượng code và độ phủ
- Xác minh tính năng đáp ứng yêu cầu PRD
- Xác định mọi vấn đề regression

Tác nhân sử dụng: `verifier` + `test-engineer`

**Giai đoạn 5: team-fix (Giai đoạn Sửa lỗi)**

Đầu vào: Báo cáo xác minh
Đầu ra: Code đã sửa và xác minh cuối cùng

Trách nhiệm chính:
- Sửa các vấn đề được tìm thấy trong giai đoạn xác minh
- Chạy lại xác minh để đảm bảo mọi vấn đề đã được giải quyết
- Cập nhật tài liệu liên quan
- Chuẩn bị cho commit cuối cùng

Tác nhân sử dụng: `executor` + `debugger` + `verifier`

### 4.3 Ví Dụ Sử Dụng Chế Độ Team

**Cách sử dụng cơ bản**

```bash
# Khởi động chế độ Team trong Claude Code
/team 3:executor "Triển khai hệ thống xác thực người dùng"
```

Điều này khởi động một đội với 3 tác nhân executor để hoàn thành việc triển khai hệ thống xác thực.

**Chỉ định kết hợp tác nhân cụ thể**

```bash
# Khởi động đội với các vai trò cụ thể
/team architect + 2:executor + qa-tester "Tái cấu trúc module xử lý đơn hàng"
```

**Ví dụ đầu ra của Team Mode**

```
[team-plan] Phân tích yêu cầu, tạo kế hoạch thực thi...
[team-plan] ✓ Đã xác định 12 nhiệm vụ con, 4 phụ thuộc

[team-prd] Viết chi tiết kỹ thuật...
[team-prd] ✓ PRD đã được tạo, 5 tiêu chí nghiệm thu

[team-exec] Bắt đầu thực thi...
[team-exec] [1/5] Triển khai API đăng ký người dùng...
[team-exec] [2/5] Triển khai API đăng nhập...
[team-exec] [3/5] Viết bài test đơn vị...
[team-exec] ✓ 4/5 nhiệm vụ hoàn thành, 1 cần sửa

[team-verify] Chạy bài test...
[team-verify] ⚠ Tìm thấy 2 bài test thất bại

[team-fix] Sửa các vấn đề...
[team-fix] ✓ Tất cả bài test đạt

[team] Nhiệm vụ hoàn thành! Xác minh cuối cùng đạt.
```

### 4.4 So Sánh với Các Chế Độ Khác

| Chế độ | Kịch bản áp dụng | Độ phức tạp | Quy mô đội |
|--------|------------------|-------------|-------------|
| Team | Nhiệm vụ điều phối với danh sách nhiệm vụ chia sẻ | Trung bình-Cao | 2-5 tác nhân |
| Autopilot | Phát triển tính năng end-to-end | Thấp | Tác nhân đơn dẫn đầu |
| Ultrawork | Sửa lỗi/tái cấu trúc song song đột xuất | Trung bình | Đa tác nhân song song |
| Ralph | Nhiệm vụ quan trọng phải hoàn thành đầy đủ | Trung bình | Tác nhân đơn + vòng verify |
| UltraQA | Cổng chất lượng cần xác minh lặp lại | Trung bình | Vòng lặp kép tác nhân |

## 5. Danh Mục Tác Nhân và Mô Tả Vai Trò

### 5.1 Tổng Quan Tác Nhân

OMC cung cấp 19 tác nhân chuyên dụng qua 4 làn đường. Mỗi tác nhân được gọi là `oh-my-claudecode:<agent-name>`.

### 5.2 Làn Xây Dựng/Phân Tích

Các tác nhân này bao phủ vòng đời phát triển đầy đủ từ khám phá đến xác minh:

| Tác nhân | Mô hình mặc định | Trách nhiệm cốt lõi |
|----------|------------------|---------------------|
| `explore` | haiku | Khám phá codebase, ánh xạ file/symbol |
| `analyst` | opus | Phân tích yêu cầu, phát hiện ràng buộc ngầm |
| `planner` | opus | Sắp xếp nhiệm vụ, tạo kế hoạch thực thi |
| `architect` | opus | Thiết kế hệ thống, định nghĩa interface, phân tích trade-off |
| `debugger` | sonnet | Phân tích nguyên nhân gốc, sửa lỗi build |
| `executor` | sonnet | Triển khai code, tái cấu trúc |
| `verifier` | sonnet | Xác minh hoàn thành, xác nhận độ đầy đủ của bài test |
| `tracer` | sonnet | Theo dõi nhân quả dựa trên bằng chứng, phân tích giả thuyết cạnh tranh |

**Kịch bản sử dụng điển hình**

```bash
# Khám phá codebase
/explore "Tìm tất cả các module liên quan đến thanh toán"

/analyst "Phân tích yêu cầu ngầm cho xác thực người dùng"

/planner "Tạo kế hoạch thực thi cho tính năng mới"

/architect "Thiết kế kiến trúc microservices"

/debugger "Sửa lỗi đăng nhập thất bại"

/executor "Triển khai chức năng trả hàng đơn hàng"

/verifier "Xác minh độ phủ bài test cho module thanh toán"

/tracer "Theo dõi nguyên nhân gốc của rò rỉ bộ nhớ"
```

### 5.3 Làn Đánh Giá

Các tác nhân này cung cấp kiểm tra cổng chất lượng trước khi bàn giao:

| Tác nhân | Mô hình mặc định | Trách nhiệm cốt lõi |
|----------|------------------|---------------------|
| `security-reviewer` | sonnet | Lỗ hổng bảo mật, ranh giới tin cậy, đánh giá authn/authz |
| `code-reviewer` | opus | Đánh giá code toàn diện, hợp đồng API, tương thích ngược |

**Kịch bản sử dụng điển hình**

```bash
# Đánh giá bảo mật
/security-reviewer "Đánh giá các endpoint API mới"

/code-reviewer "Đánh giá thay đổi code cho module đơn hàng"
```

### 5.4 Làn Chuyên Gia Lĩnh Vực

Các tác nhân này cung cấp chuyên môn lĩnh vực theo yêu cầu:

| Tác nhân | Mô hình mặc định | Trách nhiệm cốt lõi |
|----------|------------------|---------------------|
| `test-engineer` | sonnet | Chiến lược test, độ phủ, ngăn chặn test không ổn định |
| `designer` | sonnet | Kiến trúc UI/UX, thiết kế tương tác |
| `writer` | haiku | Tài liệu, hướng dẫn di chuyển |
| `qa-tester` | sonnet | Xác minh thời gian chạy CLI/dịch vụ tương tác qua tmux |
| `scientist` | sonnet | Phân tích dữ liệu, nghiên cứu thống kê |
| `git-master` | sonnet | Thao tác Git, commit, rebase, quản lý lịch sử |
| `document-specialist` | sonnet | Tài liệu bên ngoài, tra cứu tài liệu API/SDK |
| `code-simplifier` | opus | Làm rõ code, đơn giản hóa, cải thiện khả năng bảo trì |

**Kịch bản sử dụng điển hình**

```bash
# Kỹ thuật test
/test-engineer "Thiết kế chiến lược test cho module thanh toán"

/designer "Thiết kế component UI cho luồng checkout"

/writer "Viết tài liệu API cho xác thực người dùng"

/qa-tester "Chạy test end-to-end để xác minh luồng đơn hàng"

/scientist "Phân tích dữ liệu hành vi người dùng"

/git-master "Tạo nhánh tính năng và commit code"

/document-specialist "Tra cứu tài liệu API Stripe mới nhất"

/code-simplifier "Đơn giản hóa logic nghiệp vụ phức tạp trong dịch vụ đơn hàng"
```

### 5.5 Làn Điều Phối

Tác nhân này cung cấp đánh giá kế hoạch và thiết kế cấp cao:

| Tác nhân | Mô hình mặc định | Trách nhiệm cốt lõi |
|----------|------------------|---------------------|
| `critic` | opus | Phân tích khoảng trống cho kế hoạch/thiết kế, đánh giá đa góc nhìn |

**Kịch bản sử dụng điển hình**

```bash
# Đánh giá kế hoạch
/critic "Đánh giá kế hoạch thực thi cho tính năng mới"

/design-review "Đánh giá trade-off trong phương án chia microservices"
```

### 5.6 Sử Dụng Kết Hợp Tác Nhân

Nhiều tác nhân có thể được kết hợp để hoàn thành các nhiệm vụ phức tạp:

```bash
# Quy trình phát triển tính năng đầy đủ
/team architect + 2:executor + verifier "Triển khai hệ thống thông báo thời gian thực"

/# Quy trình sửa lỗi khẩn cấp
/team debugger + verifier "Sửa lỗi thanh toán ở môi trường sản xuất"

/# Tái cấu trúc kiến trúc
/team architect + code-reviewer + code-simplifier "Tái cấu trúc monolith thành microservices"
```

## 6. Hệ Thống Kỹ Năng (Skills) Chi Tiết

### 6.1 Skills Là Gì

Skills là cơ chế injection hành vi của OMC. Chúng sửa đổi cách orchestrator hoạt động, cho phép bạn tăng cường khả năng của tác nhân theo nhu cầu. Mỗi Skill là một module hành vi độc lập có thể được xếp chồng lên tác nhân.

### 6.2 Các Khái Niệm Cốt Lõi

**Execution Layer (Lớp Thực thi)**
Các loại skill chính xác định cách thực thi nhiệm vụ chính:
- `default`: Quy trình xây dựng tiêu chuẩn
- `planner`: Workflow dựa trên kế hoạch
- `orchestrate`: Điều phối đa tác nhân

**Enhancement Layer (Lớp Tăng cường)**
Các tính năng tăng cường tùy chọn, có thể thêm 0-N:
- `ultrawork`: Thực thi độ song song tối đa
- `git-master`: Tích hợp thao tác Git
- `frontend-ui-ux`: Tăng cường phát triển frontend

**Guarantee Layer (Lớp Đảm bảo)**
Cơ chế đảm bảo tùy chọn:
- `ralph`: Vòng lặp liên tục đảm bảo hoàn thành nhiệm vụ

### 6.3 Chi Tiết Các Skills Thường Dùng

**autopilot**

Skill thực thi tự chủ, phù hợp để phát triển tính năng end-to-end.

Từ khóa kích hoạt: `autopilot`, `build me`, `I want a`

```bash
/autopilot "Xây dựng một hệ thống blog"
```

Đặc điểm:
- Tác nhân dẫn đầu đơn lẻ
- Nghi lễ tối thiểu
- Tự động xử lý toàn bộ quy trình từ lập kế hoạch đến xác minh

**ultrawork**

Skill thực thi độ song song tối đa, phù hợp cho các nhiệm vụ song song đột xuất.

Từ khóa kích hoạt: `ultrawork`, `ulw`, `parallel`

```bash
/ultrawork "Sửa tất cả lỗ hổng bảo mật song song"
```

Đặc điểm:
- Nhiều tác nhân làm việc đồng thời
- Độ song song tối đa
- Không cần điều phối tuần tự như Team

**ralph**

Skill vòng lặp liên tục đảm bảo hoàn thành nhiệm vụ đầy đủ.

Từ khóa kích hoạt: `ralph`, `don't stop`, `must complete`

```bash
/ralph "Hoàn thành di chuyển cơ sở dữ liệu, không được dừng giữa chừng"
```

Đặc điểm:
- Không thoát cho đến khi verifier xác nhận hoàn thành
- Không bỏ qua các phần nhiệm vụ một cách âm thầm
- Phù hợp cho các nhiệm vụ quan trọng

**deep-interview**

Skill phỏng vấn sâu Socratic để làm rõ yêu cầu.

Từ khóa kích hoạt: `interview`, `deep interview`, `gather requirements`

```bash
/deep-interview "Thu thập yêu cầu chi tiết cho tính năng mới"
```

Đặc điểm:
- Làm rõ các điểm mơ hồ thông qua câu hỏi
- Cổng độ mờ đảm bảo hiểu biết đầy đủ
- Thiết kế đối thoại lấy cảm hứng từ Ouroboros

**ralplan**

Skill lập kế hoạch đồng thuận lặp lại.

Từ khóa kích hoạt: `ralplan`, `consensus plan`

```bash
/ralplan "Phát triển kế hoạch đồng thuận dự án"
```

Đặc điểm:
- Phương pháp lặp RALPLAN-DR
- Nhiều vòng thảo luận để đạt đồng thuận
- Ghi lại quá trình ra quyết định

### 6.4 Magic Keywords

OMC cung cấp chức năng Magic Keywords tự động kích hoạt Skills thông qua ngôn ngữ tự nhiên:

| Từ khóa | Skill được kích hoạt | Hiệu ứng |
|---------|---------------------|----------|
| `ralph` / `don't stop` / `must complete` | `$ralph` | Vòng lặp liên tục, chỉ thoát sau khi verifier xác nhận |
| `autopilot` / `build me` / `I want a` | `$autopilot` | Pipeline thực thi tự chủ |
| `ultrawork` / `ulw` / `parallel` | `$ultrawork` | Điều phối tác nhân song song tối đa |
| `plan this` / `plan the` | `$plan` | Workflow lập kế hoạch |
| `interview` / `deep interview` / `gather requirements` | `$deep-interview` | Phỏng vấn sâu Socratic |
| `ralplan` / `consensus plan` | `$ralplan` | Lập kế hoạch đồng thuận lặp RALPLAN-DR |
| `ecomode` / `eco` / `budget` | `$ecomode` | Chế độ hiệu quả token |
| `cancel` / `stop` / `abort` | `$cancel` | Hủy chế độ đang hoạt động |

### 6.5 Kết Hợp Skills Tùy Chỉnh

Bạn có thể tạo Skills tùy chỉnh trong thư mục `~/.omc/skills/`:

```bash
# Tạo Skill tùy chỉnh
mkdir -p ~/.omc/skills/my-custom-skill
cd ~/.omc/skills/my-custom-skill

# Tạo SKILL.md
cat > SKILL.md << 'EOF'
# My Custom Skill

## Mô tả
Đây là một skill tùy chỉnh

## Điều kiện kích hoạt
Kích hoạt khi người dùng nói "my task"

## Luồng thực thi
1. Bước một
2. Bước hai
3. Bước ba
EOF
```

## 7. Tóm Tắt Các Quan Điểm Chính

### 7.1 Giá Trị Cốt Lõi Của OMC

1. **Giảm rào cản**: Không cần học kỹ thuật prompt phức tạp — chỉ cần dùng ngôn ngữ tự nhiên để điều khiển workflow đa tác nhân phức tạp
2. **Phân công chuyên môn**: 19 tác nhân chuyên dụng mỗi người một vai, đảm bảo mọi nhiệm vụ được xử lý bởi tác nhân phù hợp nhất
3. **Phân bổ nguồn lực thông minh**: Tự động chọn mô hình dựa trên độ phức tạp nhiệm vụ, tối ưu hóa chi phí và hiệu quả
4. **Có thể kết hợp**: Hệ thống Skills cho phép bạn xây dựng workflow như lắp ráp khối xây dựng
5. **Cộng tác nhóm**: Team Pipeline cung cấp khung cộng tác nhóm hoàn chỉnh

### 7.2 Kịch Bản Áp Dụng

**Kịch bản khuyến nghị mạnh mẽ sử dụng OMC**

- Các dự án tái cấu trúc đa tệp phức tạp
- Tính năng lớn cần cộng tác nhiều lĩnh vực chuyên môn
- Phát triển code sản xuất cấp độ cao với yêu cầu chất lượng nghiêm ngặt
- Quy trình sửa lỗi cần xác minh và sửa lại lặp đi lặp lại
- Hoàn thiện có hệ thống sau phát triển prototype nhanh

**Kịch bản có thể không cần OMC**

- Các sửa đổi tệp đơn giản
- Viết script tạm thời nhanh
- Nhiệm vụ chỉ cần tìm và thay thế đơn giản
- Các thay đổi tăng dần với CI/CD đã trưởng thành

### 7.3 Khuyến Nghị Thực Hành Tốt Nhất

1. **Bắt đầu đơn giản**: Trước tiên hãy dùng lệnh `/team` cho các nhiệm vụ có độ phức tạp trung bình, sau đó thử các kết hợp nâng cao hơn khi đã quen
2. **Chọn chế độ phù hợp**: Chọn chế độ điều phối phù hợp dựa trên loại nhiệm vụ (Team, Autopilot, Ultrawork, v.v.)
3. **Tận dụng Magic Keywords**: Sử dụng kích hoạt ngôn ngữ tự nhiên để giảm gánh nặng ghi nhớ lệnh
4. **Giá trị hóa giai đoạn xác minh**: Không bỏ qua giai đoạn team-verify — cổng chất lượng là đảm bảo quan trọng cho việc bàn giao code
5. **Học liên tục**: Theo dõi các bản cập nhật và tính năng mới của OMC, liên tục tối ưu hóa workflow của bạn

### 7.4 Nhận Thức Về Hạn Chế

OMC cũng không phải là viên đạn bạc. Cần nhận thức về hạn chế của nó:

- Đối với các nhiệm vụ rất đơn giản và trực tiếp, overhead của OMC có thể lớn hơn lợi ích
- Cộng tác đa tác nhân làm tăng độ phức tạp của hệ thống, độ khó debug tăng theo
- Chế độ cộng tác nhóm đòi hỏi khả năng phân rã nhiệm vụ nhất định
- Định tuyến thông minh, dù thông minh, nhưng không hoàn hảo — đôi khi cần can thiệp thủ công

## 8. Ví Dụ Sử Dụng và Thực Hành Tốt Nhất

### 8.1 Kịch Bản Phát Triển Hàng Ngày

**Kịch bản 1: Triển khai tính năng mới**

```bash
# Sử dụng chế độ Team để triển khai tính năng đầy đủ
/team architect + 2:executor + verifier "Triển khai tính năng đánh giá sản phẩm"
```

Luồng thực thi:
1. architect phân tích yêu cầu kiến trúc
2. executor triển khai API và component frontend song song
3. verifier xác minh độ phủ bài test

**Kịch bản 2: Sửa lỗi**

```bash
# Sử dụng ralph để đảm bảo sửa lỗi đầy đủ
/ralph "Sửa lỗi mất session sau khi đăng nhập"
```

Luồng thực thi:
1. debugger phân tích nguyên nhân gốc
2. Thực hiện sửa lỗi
3. verifier xác nhận vấn đề đã được giải quyết
4. Chỉ thoát sau khi xác minh đạt

**Kịch bản 3: Tái cấu trúc code**

```bash
# Sử dụng ultrawork để tái cấu trúc song song
/ultrawork "Tái cấu trúc tất cả lệnh gọi đồng bộ ở tầng dịch vụ thành bất đồng bộ song song"
```

Luồng thực thi:
- Nhiều executor xử lý các module khác nhau đồng thời
- Độ song song tối đa tăng tốc tái cấu trúc

### 8.2 Thủ thuật Sử Dụng Nâng Cao

**Thủ thuật 1: Thành phần nhóm tùy chỉnh**

```bash
# Chỉ định số lượng và loại tác nhân cụ thể
/team 2:architect + 3:executor + 2:verifier + security-reviewer "Tái cấu trúc toàn bộ kiến trúc backend"
```

**Thủ thuật 2: Sử dụng ecomode để tối ưu chi phí**

```bash
# Bật chế độ hiệu quả token
/ecomode /team "Phát triển công cụ nội bộ"
```

Sử dụng haiku cho nhiều nhiệm vụ hơn khi ngân sách hạn chế.

**Thủ thuật 3: Phỏng vấn yêu cầu sâu**

```bash
# Thực hiện làm rõ yêu cầu sâu trước khi bắt đầu triển khai
/deep-interview "Thu thập yêu cầu đầy đủ cho nền tảng thương mại điện tử"
```

Đảm bảo hiểu biết đầy đủ trước khi bắt đầu để tránh làm lại.

### 8.3 Thủ Thuật Tối Ưu Hiệu Suất

**Tối ưu 1: Chọn mô hình hợp lý**

```json
// Đặt ánh xạ tác nhân đến mô hình trong cấu hình
{
  "model": {
    "routing": {
      "haiku": ["explore", "writer", "document-specialist"],
      "sonnet": ["executor", "debugger", "test-engineer", "verifier"],
      "opus": ["architect", "planner", "critic", "analyst"]
    }
  }
}
```

**Tối ưu 2: Kết hợp nhiệm vụ song song**

```bash
# Thực thi các nhiệm vụ độc lập song song
/ultrawork "Chạy song song: đánh giá code + quét bảo mật + test hiệu suất"
```

**Tối ưu 3: Workflow tăng dần**

```bash
# Thực thi theo giai đoạn, xác minh sau mỗi giai đoạn
/team "Triển khai module người dùng"
# Tiếp tục sau khi xác minh đạt
/team "Triển khai module đơn hàng"
```

### 8.4 Khắc Phục Sự Cố

**Vấn đề: Chế độ Team thực thi quá lâu**

Giải pháp:
- Kiểm tra phụ thuộc vòng lặp
- Giảm số lượng tác nhân song song
- Sử dụng ultrawork thay cho Team (nếu không cần điều phối tuần tự)

**Vấn đề: Giai đoạn xác minh thất bại lặp lại**

Giải pháp:
- Sử dụng chế độ ralph để sửa lỗi sâu
- Kiểm tra các phụ thuộc chưa được giải quyết
- Cân nhắc phân rã nhiệm vụ thành các đơn vị nhỏ hơn

**Vấn đề: Chất lượng phản hồi mô hình giảm**

Giải pháp:
- Chuyển sang mô hình cấp cao hơn (sonnet → opus)
- Đơn giản hóa prompt
- Kiểm tra xem độ dài ngữ cảnh có vượt quá giới hạn không

## Kết Luận

oh-my-claudecode đại diện cho một mô hình mới trong phát triển được hỗ trợ bởi AI. Nó không nhằm thay thế Claude Code, mà là để tăng cường nó — biến một công cụ đơn lẻ thành một đội ngũ AI có thể làm việc cùng nhau. Thông qua phân công tác nhân chuyên môn, định tuyến mô hình thông minh và hệ thống Skills linh hoạt có thể kết hợp, OMC làm cho việc phát triển phần mềm phức tạp trở nên dễ quản lý và hiệu quả hơn.

Dù bạn là nhà phát triển độc lập hay trưởng nhóm, OMC đều có giá trị để khám phá. Bắt đầu từ hôm nay bằng cách đưa OMC vào dự án tiếp theo của bạn và trải nghiệm cảm giác điều khiển một đội ngũ AI bằng ngôn ngữ tự nhiên.

**Hãy nhớ: Đừng học Claude Code. Chỉ cần dùng OMC.**

---

*Bài viết này được viết dựa trên oh-my-claudecode v4.15.7. Để biết các bản cập nhật, vui lòng tham khảo tài liệu chính thức.*
