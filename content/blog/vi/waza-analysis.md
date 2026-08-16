---
title: "Waza: Khung đánh giá kỹ năng AI Agent mã nguồn mở của Microsoft — Từ cơ bản đến nâng cao"
date: "2026-08-16"
description: "Phân tích sâu dự án Microsoft Waza — công cụ CLI viết bằng Go để đánh giá kỹ năng AI Agent với so sánh đa mô hình, kiểm thử đối kháng và MCP mock servers"
tags:
  - Waza
  - AI Agent
  - Đánh giá kỹ năng
  - Microsoft
  - Go
  - CLI Tool
  - Benchmarking
  - Mã nguồn mở
categories:
  - AI Agent
  - Khung đánh giá
  - Microsoft Open Source
  - Go Tools
  - Đánh giá kỹ năng
---

# Waza: Khung đánh giá kỹ năng AI Agent mã nguồn mở của Microsoft — Từ cơ bản đến nâng cao

## Bối cảnh dự án và vấn đề cốt lõi

### Thách thức trong đánh giá kỹ năng AI Agent

Trong quá trình phát triển AI Agent, cách **đánh giá và xác minh chất lượng kỹ năng của Agent một cách có hệ thống** luôn là thách thức cốt lõi đối với nhà phát triển:

| Điểm đau | Vấn đề của phương pháp truyền thống | Giải pháp của Waza |
|----------|-------------------------------------|-------------------|
| **Thiếu tiêu chuẩn hóa** | Mỗi team tự xây dựng hệ thống đánh giá, khó tái sử dụng | Quy spec Eval thống nhất |
| **Kết quả không thể tái tạo** | Tính ngẫu nhiên gây dao động kết quả | Cơ chế Snapshot & Replay |
| **Khó so sánh đa mô hình** | So sánh thủ công, không hiệu quả | Lệnh compare được tích hợp sẵn |
| **Thiếu kiểm thử đối kháng** | Khó phát hiện vấn đề bảo mật | Fault injection đối kháng được tích hợp |
| **Tích hợp CI/CD phức tạp** | Thiếu giao diện tiêu chuẩn hóa | Exit Codes và Reporters tiêu chuẩn |

### Sự ra đời của Waza

Waza là **công cụ CLI viết bằng Go được ra mắt bởi Microsoft** dành riêng cho việc đánh giá chất lượng kỹ năng AI Agent. Triết lý cốt lõi của nó là:

> **"Cung cấp một khung đánh giá được tiêu chuẩn hóa, có thể tái tạo và lượng hóa cho kỹ năng AI Agent."**

---

## Tổng quan dự án

### Waza là gì?

Waza là **công cụ dòng lệnh để đánh giá kỹ năng AI Agent**, giúp nhà phát triển:

- **Tạo bộ đánh giá**: Tự động tạo task đánh giá từ SKILL.md
- **Chạy benchmark**: Chạy và so sánh kết quả giữa các mô hình khác nhau
- **Chấm điểm chất lượng**: Đánh giá đa chiều sử dụng LLM-as-Judge
- **Kiểm thử đối kháng**: Tiêm lỗi để phát hiện vấn đề bảo mật tiềm ẩn
- **Quản lý token**: Phân tích và tối ưu kích thước tài liệu kỹ năng

### Các tính năng chính

| Tính năng | Mô tả |
|-----------|-------|
| 🎯 **Quản lý vòng đời kỹ năng** | Quy trình hoàn chỉnh: init, create, run, check |
| 📊 **So sánh đa mô hình** | Chạy benchmark trên các mô hình khác nhau |
| 🏅 **LLM-as-Judge** | Các bộ chấm điểm được tích hợp: groundedness, helpfulness |
| 🔢 **Quản lý token** | Đếm, so sánh, phân tích, đề xuất tối ưu |
| 🛡️ **Kiểm thử đối kháng** | Tiêm lỗi offline: prompt injection, scope-bypass |
| 📸 **Snapshot & Replay** | Chụp lại runs để tái tạo có thể deterministic |
| 🔌 **MCP Mock Servers** | Kiểm thử tách biệt không cần mạng |
| ☁️ **Tích hợp Cloud Storage** | Tự động upload kết quả lên Azure Blob Storage |
| 📈 **Dashboard trực quan** | Xem kết quả qua HTTP hoặc JSON-RPC |

---

## Phân tích sâu về Kiến trúc

### Kiến trúc tổng thể

Waza sử dụng kiến trúc mô-đun:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                            Waza Architecture                             │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│   ┌─────────────────────────────────────────────────────────────────┐   │
│   │                         CLI Entry (cmd/waza)                     │   │
│   │                    init | run | check | compare | serve         │   │
│   └─────────────────────────────────────────────────────────────────┘   │
│                                    │                                     │
│   ┌─────────────────────────────────────────────────────────────────┐   │
│   │                       Core Modules (internal/)                   │   │
│   │  graders │ models │ orchestration │ metrics                      │   │
│   │  execution │ reporting │ transcript │ config                     │   │
│   └─────────────────────────────────────────────────────────────────┘   │
│                                    │                                     │
│   ┌─────────────────────────────────────────────────────────────────┐   │
│   │                        Executor Backends                         │   │
│   │              mock (CI-friendly)  │  copilot-sdk (default)         │   │
│   └─────────────────────────────────────────────────────────────────┘   │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### Cấu trúc dự án

```
waza/
├── cmd/waza/               # CLI entry point
│   └── tokens/             # Token counting subcommand
├── internal/
│   ├── config/             # Configuration với functional options
│   ├── execution/          # AgentEngine interface (mock, copilot)
│   ├── graders/            # Validator registry và built-in graders
│   ├── metrics/            # Scoring metrics
│   ├── models/             # Data structures
│   ├── orchestration/      # EvalRunner
│   ├── reporting/          # Result formatting
│   ├── transcript/         # Per-task transcript capture
│   └── wizard/             # Interactive init wizard
├── examples/               # Ví dụ eval suites
├── skills/                 # Ví dụ skills
└── registry.json           # Shared graders registry
```

### Định dạng Eval Spec (Schema 1.2)

```yaml
name: my-skill-eval
skill: my-skill
schemaVersion: "1.2"
version: "1.0.0"

config:
  trials: 3
  max_attempts: 2
  timeout: 300
  executor: mock

tasks:
  - task: hello-world
    assert:
      - grading: text
        config:
          contains: "Hello"
```

---

## Triết lý thiết kế

### Nguyên tắc cốt lõi

#### 1. Schema-driven

> **"Quản lý phiên bản rõ ràng; đọc cùng major version thì linh hoạt, khác major version thì nghiêm ngặt."**

#### 2. Snapshot-based Determinism

Mỗi evaluation run capture complete context snapshot:

```
waza run → Capture Snapshot → Save as JSON
                  ↓
waza replay snapshot.json → Tái tạo chính xác kết quả trước
```

#### 3. CI-First Design

| Tính năng CI | Triển khai |
|--------------|------------|
| **Exit Codes** | 0=Thành công, 1=Test thất bại, 2=Lỗi cấu hình |
| **Reporters** | JSON, JUnit XML format |
| **Threshold Checks** | `waza tokens compare` cho CI gating |

#### 4. Tách biệt Execution và Grading

```bash
# Bước 1: Chạy đánh giá (bỏ qua grading)
waza run eval.yaml --skip-graders --output results.json

# Bước 2: Grade sau
waza grade results.json
```

---

## Hướng dẫn bắt đầu nhanh

### Cài đặt Waza

#### Phương pháp 1: Binary Install (Khuyến nghị)

```bash
# Linux/macOS
curl -fsSL https://raw.githubusercontent.com/microsoft/waza/main/install.sh | bash

# Windows (PowerShell)
irm https://raw.githubusercontent.com/microsoft/waza/main/install.ps1 | iex
```

#### Phương pháp 2: Từ Source

```bash
git clone https://github.com/microsoft/waza.git
cd waza
git lfs install && git lfs pull
go build -o waza ./cmd/waza
```

### Quick Start Flow

```bash
# 1. Khởi tạo project
waza init my-agent-project && cd my-agent-project

# 2. Tạo skill mới
waza new skill my-skill

# 3. Chạy đánh giá
waza run my-skill
waza check my-skill
```

---

## Hướng dẫn thực hành: Xây dựng bộ đánh giá kỹ năng

### Bước 1: Khởi tạo Project

```bash
waza init waza-demo && cd waza-demo
```

### Bước 2: Tạo Skill

```bash
waza new skill calculator
```

### Bước 3: Viết SKILL.md

```markdown
---
name: calculator
description: A calculator skill for basic arithmetic
triggers:
  - "calculate {{expression}}"
version: 1.0.0
---

# Calculator Skill
```

### Bước 4: Viết Evaluation Tasks

```yaml
# evals/calculator/tasks/basic-operations.yaml
- task: addition_test
  description: Test basic addition
  prompt: "Calculate 15 + 27"
  assert:
    - grading: text
      config:
        contains: "42"
```

### Bước 5: Cấu hình Evaluation

```yaml
# evals/calculator/eval.yaml
name: calculator-eval
skill: calculator
schemaVersion: "1.2"

config:
  trials: 3
  executor: mock

tasks:
  - task: basic-operations
```

### Bước 6: Chạy Evaluation

```bash
waza run calculator
```

---

## Các tính năng nâng cao

### 1. LLM-as-Judge Scoring

```yaml
graders:
  - type: prompt
    model: gpt-4
    dimensions:
      - groundedness
      - helpfulness
      - instruction_following
```

### 2. MCP Mock Servers

```yaml
mcp_mocks:
  - name: filesystem
    command: ["npx", "mcp-server-fs", "/tmp/test"]
```

### 3. Kiểm thử đối kháng

```bash
waza adversarial --pack prompt-injection
waza adversarial --pack scope-bypass
```

### 4. So sánh đa mô hình

```bash
waza run eval.yaml --model gpt-4 --output gpt4-results.json
waza compare gpt4-results.json claude-results.json
```

### 5. Quản lý Token

```bash
waza tokens count skills/my-skill/SKILL.md
waza tokens suggest skills/my-skill/SKILL.md
```

---

## Tích hợp CI/CD

### GitHub Actions Workflow

```yaml
# .github/workflows/waza-eval.yml
name: Waza Evaluation

on:
  pull_request:
    branches: [main]

jobs:
  evaluate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Install Waza
        run: |
          curl -fsSL https://raw.githubusercontent.com/microsoft/waza/main/install.sh | bash
      - name: Run Evaluation
        run: waza run evals/my-skill/eval.yaml --output results.json --executor mock
```

---

## Loại Graders

| Loại | Mục đích | Ví dụ cấu hình |
|------|----------|----------------|
| **code** | Python/JS assertions | `assert: "result == 42"` |
| **text** | Text matching | `contains: "success"` |
| **file** | File verification | `path: "/tmp/out.txt"` |
| **diff** | Workspace comparison | `snapshot_path: "./snapshots/"` |
| **behavior** | Behavior constraints | `max_tokens: 1000` |
| **action_sequence** | Tool call sequence | `expected: ["read", "write"]` |
| **prompt** | LLM-as-Judge | `dimensions: ["groundedness"]` |

---

## Tổng kết và Kết luận

### Những insight cốt lõi

#### 1. Tiêu chuẩn hóa đánh giá AI Agent

Waza đóng góp quan trọng nhất là **thiết lập một khung tiêu chuẩn cho việc đánh giá kỹ năng AI Agent**:

> **"Đánh giá AI agent không nên phụ thuộc vào các bài test d临时, mà nên có spec tiêu chuẩn, kết quả có thể tái tạo và quy trình tự động."**

#### 2. Tầm quan trọng của Reproducibility

Trong đánh giá AI Agent, **reproducibility là thách thức cốt lõi**. Waza giải quyết qua:
- Snapshot & Replay capture đầy đủ context
- Multiple trials giảm ảnh hưởng của randomness
- Mock executors loại bỏ network dependency

#### 3. CI-First không chỉ là khẩu hiệu

| Thực hành | Giá trị |
|-----------|---------|
| Exit Codes | Build system có thể trực tiếp xác định thành công/thất bại |
| Standard Reporters | Tích hợp liền mạch với CI tools hiện có |
| Threshold Checks | Tự động gating, ngăn chặn suy giảm chất lượng |

### Trường hợp sử dụng

✅ **Khuyến nghị mạnh mẽ cho Waza**:
- Team phát triển AI Agent cần đánh giá có hệ thống
- Cần so sánh đa mô hình
- Cần kiểm thử đối kháng (ứng dụng nhạy cảm về bảo mật)
- Cần tự động hóa CI/CD
- Doanh nghiệp cần đánh giá kỹ năng tiêu chuẩn hóa

---

## Liên kết tài nguyên

### Tài nguyên chính thức

| Tài nguyên | Liên kết |
|-----------|----------|
| 🌐 Website chính thức | https://microsoft.github.io/waza/ |
| 💻 GitHub Repository | https://github.com/microsoft/waza |
| 📚 Documentation | https://microsoft.github.io/waza/docs/ |

---

## Kết luận

Waza đại diện cho **một cột mốc quan trọng trong lĩnh vực đánh giá kỹ năng AI Agent**—nó chuyển đổi các phương pháp đánh giá rời rạc, không tiêu chuẩn thành quy trình làm việc hoàn chỉnh, được tiêu chuẩn hóa và tự động hóa.

> **"Đừng tin tưởng AI agent của bạn nếu không có đánh giá phù hợp. Sử dụng Waza."**

---

*Bài viết này được viết dựa trên dự án mã nguồn mở Microsoft Waza (MIT License).*

**Sources:**
- [GitHub - microsoft/waza](https://github.com/microsoft/waza)
- [Waza Documentation](https://microsoft.github.io/waza/)
