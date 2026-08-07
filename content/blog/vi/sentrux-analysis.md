---
title: 'sentrux Chuyên Sâu: Cảm Biến Kiến Trúc Cho AI Agent — Đóng Vòng Phản Hồi Để Tự Cải Thiện Đệ Quy Chất Lượng Mã'
description: "Phân tích hoàn chỉnh về sentrux — một cảm biến kiến trúc thời gian thực giúp AI agent đóng vòng phản hồi, cho phép tự cải thiện đệ quy chất lượng mã. Nhị phân Rust thuần duy nhất không có phụ thuộc runtime, hỗ trợ 52 ngôn ngữ qua plugin tree-sitter. Có trực quan hóa treemap phụ thuộc trực tiếp, 5 chỉ số nguyên nhân gốc (modularity/acyclicity/depth/equality/redundancy) hợp nhất thành một điểm chất lượng duy nhất, tích hợp máy chủ MCP (Claude Code/Cursor/Windsurf/OpenCode), engine quy tắc dựa trên TOML và cổng chất lượng CI. Từ vấn đề cốt lõi và triết lý thiết kế đến kiến trúc, hướng dẫn cài đặt đầy đủ và danh sách tính năng."
date: "2026-08-04"
author: "TopDigg Research Team"
tags: ["sentrux", "AI Agent", "Code Quality", "Architecture", "Rust", "Static Analysis", "MCP", "Tree-sitter", "DevTools"]
categories: ["Deep Dive"]
keywords: ["sentrux", "AI agent", "code quality", "architecture sensor", "feedback loop", "static analysis", "Rust", "MCP", "tree-sitter", "dependency analysis", "code visualization", "quality gate"]
---

# sentrux Chuyên Sâu: Cảm Biến Kiến Trúc Cho AI Agent — Đóng Vòng Phản Hồi Để Tự Cải Thiện Đệ Quy Chất Lượng Mã

> Ý tưởng cốt lõi: **AI agent viết mã nhanh hơn bao giờ hết, nhưng nếu không có cảm biến, chúng không biết cái gì cần cải thiện — như một chiếc máy điều nhiệt không có cảm biến nhiệt độ, nó không bao giờ có thể điều chỉnh.** sentrux là một cảm biến kiến trúc thời gian thực viết bằng Rust thuần, sứ mệnh cốt lõi là **giúp AI agent đóng vòng phản hồi** — quét cấu trúc thực tế của một kho mã (không phải diff, không phải đầu ra terminal, mà là mọi tệp, mọi phụ thuộc, mọi mối quan hệ kiến trúc), tính 5 chỉ số nguyên nhân gốc thành một điểm chất lượng thống nhất (0-10000), để AI agent có thể cảm nhận được sự suy thoái kiến trúc ngay khoảnh khắc chúng viết mã. Nó tích hợp với Claude Code, Cursor, Windsurf, OpenCode và mọi máy khách MCP thông qua Model Context Protocol, cung cấp trực quan hóa treemap trực tiếp, một engine quy tắc dựa trên TOML, cổng chất lượng CI và theo dõi chất lượng cấp phiên. Trong một câu: **Bạn không cần một kế hoạch tốt hơn. Bạn cần một cảm biến tốt hơn.**

---

## 1. Tổng Quan Dự Án

### 1.1 Nó Là Gì?

**sentrux** là một **cảm biến kiến trúc thời gian thực** được thiết kế cho lập trình có trợ giúp AI. Đề xuất cốt lõi của nó: **xây dựng một vòng phản hồi giữa AI agent và kho mã** — mỗi lần agent sửa mã, sentrux quét thay đổi cấu trúc theo thời gian thực, tính điểm chất lượng, và cho agent biết liệu thay đổi này đã làm mã tốt hơn hay tệ hơn.

### 1.2 Thông Tin Chính

- Kho lưu trữ: `https://github.com/sentrux/sentrux`
- Trang web: `https://sentrux.dev`
- Số sao: **2.600+**
- Số fork: **237**
- Giấy phép: **MIT**
- Ngôn ngữ: **Rust** (nhị phân Rust thuần duy nhất, không phụ thuộc runtime)
- Số commit: **318**
- Ngôn ngữ được hỗ trợ: **52** (qua plugin tree-sitter)
- Nền tảng: **macOS / Linux / Windows**
- Hỗ trợ MCP: Claude Code, Cursor, Windsurf, OpenCode, OpenClaw, mọi máy khách MCP

### 1.3 Vấn Đề Nó Giải Quyết Là Gì?

Đây là bí mật bẩn thỉu của phát triển có trợ giúp AI: **AI sinh mã càng tốt, kho mã của bạn càng nhanh trở nên mất kiểm soát.**

Khi bạn dùng IDE, bạn nhìn thấy cây tệp, mở tệp, xây dựng mô hình tinh thần về kiến trúc — bạn là người quản trị. Nhưng AI agent đã đưa chúng ta lên terminal. Agent sửa hàng chục tệp mỗi phiên; bạn thấy một dòng `Modified src/foo.rs` chạy qua nhưng mất nhận thức không gian: bạn không thấy tệp đó nằm ở đâu trong đồ thị phụ thuộc, rằng nó vừa tạo ra một chu trình, rằng ba module giờ phụ thuộc vào một tệp vốn được cho là nội bộ.

Mỗi phiên AI âm thầm làm suy thoái kiến trúc của bạn. Câu trả lời truyền thống — "lên kế hoạch kiến trúc trước, rồi để AI triển khai" — tái phát minh mô hình waterfall: tạo ra biển tài liệu markdown với độ hiển thị bằng không vào đầu ra mã thực tế. Không có vòng phản hồi. Không có cách phát hiện khi việc triển khai lệch khỏi đặc tả.

**Câu trả lời của sentrux: Bạn không cần một kế hoạch tốt hơn. Bạn cần một cảm biến tốt hơn.**

---

## 2. Ý Tưởng Cốt Lõi

### 2.1 Vòng Phản Hồi — Một Mô Hình Lý Thuyết Điều Khiển Kinh Điển

Thiết kế của sentrux bắt nguồn từ lý thuyết điều khiển: mọi hệ thống hiệu quả cần một **cảm biến** (quan sát thực tế), một **đặc tả** (định nghĩa "tốt") và một **cơ cấu chấp hành** (hiệu chỉnh độ lệch). Trình biên dịch đóng vòng lặp về cú pháp, bộ kiểm thử về hành vi, linter về phong cách. Nhưng kiến trúc — thay đổi này có phù hợp với hệ thống không? — không có cảm biến. sentrux đóng vòng lặp ở cấp độ kiến trúc.

### 2.2 Năm Chỉ Số Nguyên Nhân Gốc — Một Điểm Thống Nhất

sentrux đánh giá kho mã theo 5 chiều kiến trúc:

- **Modularity (Tính mô-đun)**: Trách nhiệm được phân chia rõ ràng giữa các module không?
- **Acyclicity (Tính phi chu trình)**: Có chu trình nào trong đồ thị phụ thuộc không?
- **Depth (Độ sâu)**: Các chuỗi gọi có quá sâu không?
- **Equality (Tính đồng đều)**: Các phụ thuộc liên module có quá đồng đều (thiếu phân cấp) không?
- **Redundancy (Tính dư thừa)**: Có cấu trúc mã trùng lặp không?

5 chỉ số này hội tụ thành một điểm 0-10000 duy nhất — được tính trong mili giây, cập nhật theo thời gian thực.

### 2.3 Theo Dõi Chất Lượng Cấp Phiên

sentrux lưu một đường cơ sở trước khi AI agent bắt đầu viết mã, so sánh sau khi phiên kết thúc — nắm bắt chính xác liệu phiên đã cải thiện hay làm suy thoái chất lượng mã. Đây là **rào chắn kiến trúc cấp phiên**.

### 2.4 Hỗ Trợ Ngôn Ngữ Dựa Trên Plugin — Sức Mạnh của tree-sitter

Nhị phân sentrux là một **nền tảng đa dụng** — mọi tri thức ngôn ngữ nằm trong các tệp `plugin.toml` + `tags.scm`. Thêm một ngôn ngữ mới không cần bất kỳ mã Rust nào. 52 ngôn ngữ hoạt động ngay nhờ plugin tree-sitter.

---

## 3. Kiến Trúc

### 3.1 Các Thành Phần Cốt Lõi

- **sentrux-core**: Engine phân tích lõi (quét, chấm điểm, kiểm tra quy tắc)
- **sentrux-bin**: Điểm vào CLI và GUI
- **Máy chủ MCP**: Cung cấp dữ liệu sức khỏe cấu trúc thời gian thực cho AI agent qua Model Context Protocol
- **Engine quy tắc**: Thực thi ràng buộc kiến trúc cấu hình bằng TOML
- **Hệ thống plugin**: Quản lý plugin ngôn ngữ tree-sitter

### 3.2 Quy Trình Làm Việc

```
scan → score → agent improves → rescan → better score → repeat
```

1. Agent gọi `scan()` để lấy điểm chất lượng hiện tại và các chỉ số nút thắt
2. Agent gọi `session_start()` để lưu đường cơ sở
3. Agent viết mã
4. Agent gọi `session_end()` để so sánh đường cơ sở — xác định chất lượng cải thiện hay suy thoái
5. Nếu suy thoái, agent điều chỉnh dựa trên phản hồi

### 3.3 Bộ Công Cụ MCP

9 công cụ MCP: `scan` · `health` · `session_start` · `session_end` · `rescan` · `check_rules` · `evolution` · `dsm` · `test_gaps`

---

## 4. Triết Lý Thiết Kế

### 4.1 "Human-in-the-Loop" Là Bất Khả Nhượng

AI agent mạnh mẽ nhưng có giới hạn — chúng không thể đồng thời nắm bức tranh lớn và các chi tiết nhỏ. Con người phải có thể thấy ở bất kỳ khoảnh khắc nào agent đang làm gì với toàn bộ hệ thống. sentrux khiến điều đó trở nên khả thi.

### 4.2 Xác Minh Giá Trị Hơn Sinh Tạo

Sinh ra một lời giải đúng khó hơn xác minh nó (trực giác P vs NP). Bạn không cần viết mã giỏi hơn máy — bạn cần đánh giá giỏi hơn nó. sentrux biến phán đoán kiến trúc thành điểm số và ràng buộc mà máy đọc được.

### 4.3 Hệ Thống Tốt Khiến Kết Quả Tốt Trở Nên Tất Yếu

Một hệ thống được thiết kế tốt ràng buộc hành vi sao cho điều đúng đắn là điều dễ dàng: một cổng chất lượng chặn suy thoái trước khi nó lên sóng, một engine quy tắc mã hóa các quyết định kiến trúc của bạn, một bản đồ trực quan khiến sự mục nát cấu trúc không thể bị phớt lờ.

### 4.4 "Đừng Tái Phát Minh" — Một Lập Trường Thực Dụng

sentrux không tự viết bộ phân tích cú pháp ngôn ngữ — nó dùng tree-sitter. Không tự xây framework GUI — nó dùng WGPU. Không tự tạo giao thức — nó dùng MCP. Sự thực dụng này cho phép sentrux tập trung vào giá trị cốt lõi: phân tích kiến trúc và vòng phản hồi.

---

## 5. Hướng Dẫn Từng Bước

### 5.1 Cài Đặt

**macOS (Homebrew)**
```bash
brew install sentrux/tap/sentrux
```

**Linux**
```bash
curl -fsSL https://raw.githubusercontent.com/sentrux/sentrux/main/install.sh | sh
```

**Windows**
```bash
curl -L -o sentrux.exe https://github.com/sentrux/sentrux/releases/latest/download/sentrux-windows-x86_64.exe
```

**Build từ mã nguồn**
```bash
git clone https://github.com/sentrux/sentrux.git
cd sentrux && cargo build --release
```

### 5.2 Sử Dụng Cơ Bản

```bash
sentrux                    # Mở GUI — treemap trực tiếp
sentrux /path/to/project   # Quét thư mục cụ thể
sentrux check .            # Kiểm tra quy tắc (thân thiện CI, exit 0 hoặc 1)
sentrux gate --save .      # Lưu đường cơ sở (trước phiên agent)
sentrux gate .             # So sánh đường cơ sở (bắt suy thoái)
```

### 5.3 Tích Hợp AI Agent (MCP)

**Claude Code**
```
/plugin marketplace add sentrux/sentrux
/plugin install sentrux
```

**Cursor / Windsurf / OpenCode / Bất Kỳ Máy Khách MCP Nào**
```json
{
  "mcpServers": {
    "sentrux": {
      "command": "sentrux",
      "args": ["--mcp"]
    }
  }
}
```

### 5.4 Ví Dụ Quy Trình Agent

```
Agent: scan("/Users/me/myproject")
  → { quality_signal: 7342, files: 139, bottleneck: "modularity" }

Agent: session_start()
  → { status: "Baseline saved", quality_signal: 7342 }

  ... agent writes 500 lines of code ...

Agent: session_end()
  → { pass: false, signal_before: 7342, signal_after: 6891,
      summary: "Quality degraded during this session" }
```

### 5.5 Cấu Hình Engine Quy Tắc

Tạo `.sentrux/rules.toml` trong thư mục gốc dự án:

```toml
[constraints]
max_cycles = 0
max_coupling = "B"
max_cc = 25
no_god_files = true

[[layers]]
name = "core"
paths = ["src/core/*"]
order = 0

[[layers]]
name = "app"
paths = ["src/app/*"]
order = 2

[[boundaries]]
from = "src/app/*"
to = "src/core/internal/*"
reason = "App must not depend on core internals"
```

```bash
sentrux check .
# ✓ All rules pass — Quality: 7342
```

### 5.6 Plugin Ngôn Ngữ

```bash
sentrux plugin list              # Liệt kê plugin đã cài
sentrux plugin add <name>        # Cài từ kho lưu trữ
sentrux plugin add-standard      # Cài cả 52 ngôn ngữ
sentrux plugin init my-lang      # Tạo scaffold plugin ngôn ngữ mới
```

### 5.7 Xử Lý Sự Cố GPU Linux

```bash
WGPU_BACKEND=vulkan sentrux    # Buộc dùng Vulkan
WGPU_BACKEND=gl sentrux        # Buộc dùng OpenGL
```

---

## 6. Danh Sách Tính Năng

- **Trực quan hóa kiến trúc trực tiếp**: treemap tương tác, tệp phát sáng khi agent sửa
- **5 chỉ số nguyên nhân gốc**: modularity, acyclicity, depth, equality, redundancy
- **Điểm chất lượng thống nhất**: điểm liên tục 0-10000, tính toán trong mili giây
- **Máy chủ MCP**: 9 công cụ (scan/health/session_start/session_end/rescan/check_rules/evolution/dsm/test_gaps)
- **Theo dõi chất lượng cấp phiên**: lưu đường cơ sở + so sánh phiên
- **Engine quy tắc**: cấu hình TOML với constraints, layers, boundaries
- **Cổng chất lượng CI**: `sentrux check .` mã thoát 0/1
- **52 ngôn ngữ**: Bash, C, C++, C#, Go, Java, JavaScript, Python, Rust, TypeScript, và hơn thế
- **Hệ thống plugin**: do tree-sitter cung cấp, không cần mã Rust cho ngôn ngữ mới
- **Đa nền tảng**: macOS / Linux / Windows
- **Rust thuần**: nhị phân đơn lẻ, không phụ thuộc runtime
- **GUI**: kết xuất WGPU, trực quan hóa treemap trực tiếp
- **Plugin Claude Code**: tích hợp cài đặt một cú nhấp chuột

---

## 7. Các Điểm Chốt Chính

1. **Nút thắt thực sự của phát triển có trợ giúp AI không phải là sinh mã — mà là quản trị kiến trúc.** README của sentrux mở đầu bằng việc gọi tên "vấn đề không ai nói đến": AI viết mã càng tốt, kho mã càng suy thoái nhanh. Đây không phải là AI trở nên kém thông minh — mà là bạn mất nhận thức kiến trúc. Khi bạn ở trong IDE, bạn là người gác cổng; chuyển lên terminal, bạn mất nhận thức không gian. sentrux khôi phục nó bằng treemap trực tiếp và chấm điểm chất lượng.

2. **"Một kế hoạch tốt hơn" không phải là câu trả lời — "một cảm biến tốt hơn" mới là.** Các phương pháp truyền thống cố gắng ràng buộc AI bằng các đặc tả chi tiết hơn — nhưng đặc tả là tĩnh, mã là động. Một đặc tả không có vòng phản hồi là một chiếc máy điều nhiệt không có nhiệt kế. Đổi mới cốt lõi của sentrux: nó không lên kế hoạch trước khi viết mã — nó xác minh trong khi viết mã.

3. **Trực giác P vs NP áp dụng trong kỹ thuật.** Sinh ra một kiến trúc đúng khó hơn nhiều so với xác minh một kiến trúc. Bạn không cần viết mã giỏi hơn AI — bạn cần đánh giá giỏi hơn nó. sentrux biến năng lực mơ hồ của con người là "phán đoán kiến trúc" thành điểm số và ràng buộc mà máy đọc được.

4. **tree-sitter minh họa "đừng tái phát minh bánh xe".** sentrux không viết bộ phân tích cho 52 ngôn ngữ — nó dùng ngôn ngữ truy vấn của tree-sitter. Điều này cho phép nó tập trung vào giá trị cốt lõi (phân tích kiến trúc và vòng phản hồi) thay vì tái phát minh bộ phân tích.

5. **MCP là "cổng USB" của bộ công cụ AI.** sentrux không viết bộ điều hợp cho từng công cụ AI — nó triển khai giao thức MCP. Một tích hợp, mọi máy khách MCP đều hoạt động. Đây là tư duy thiết kế ưu tiên giao thức.

6. **"Human-in-the-loop" không phải là bảo thủ — nó thực dụng.** Một trong ba niềm tin của sentrux: AI mạnh mẽ nhưng có giới hạn — nó không thể đồng thời nắm bức tranh lớn và các chi tiết. Vai trò con người đang chuyển từ "viết mã" sang "quản trị mã" — sentrux khiến sự chuyển dịch đó trở nên khả thi.

---

## References

- Kho lưu trữ: `https://github.com/sentrux/sentrux`
- Trang web: `https://sentrux.dev`
- Giấy phép: MIT
- Plugin Claude Code: `/plugin marketplace add sentrux/sentrux`
- Giao thức MCP: `https://modelcontextprotocol.io`
- tree-sitter: `https://tree-sitter.github.io/`
