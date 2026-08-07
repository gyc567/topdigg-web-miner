---
title: "RTK (Rust Token Killer) Phân Tích Chuyên Sâu: Một CLI Proxy Nhị Phân Rust Duy Nhất Cắt Tới 90% Đầu Ra Bash Mà Agent Của Bạn Đọc — Từ Bốn Chiến Lược Nén Và Auto-Rewrite Hook Đến Kiến Trúc 64 Module"
description: "Bài phân tích toàn diện về dự án mã nguồn mở bùng nổ rtk-ai/rtk (75k+ stars, Rust, Apache-2.0, nhánh mặc định develop) — một 'CLI proxy nhận biết ngữ cảnh LLM'. Ý tưởng cốt lõi: RTK chặn các lệnh shell và lọc, nhóm, cắt ngắn, khử trùng lặp đầu ra trước khi nó đến ngữ cảnh LLM — 'nó cắt đầu ra bash, không phải hóa đơn của bạn'. Một nhị phân Rust duy nhất, 100+ lệnh được hỗ trợ, chi phí ~5-15ms mỗi lệnh, kích thước ~4.1MB. Bài viết này bao quát tất cả: mô hình proxy (Claude → RTK → chuyển hướng đầu ra git), bốn chiến lược nén, hai chiến lược hook (Auto-Rewrite vs Suggest, 100% vs ~70-85% áp dụng), năm nguyên tắc thiết kế (Single Responsibility / Minimal Overhead / Exit Code Preservation / Fail-Safe / Transparent), vòng đời lệnh sáu pha (PARSE→ROUTE→EXECUTE→FILTER→PRINT→TRACK), phân loại 12 chiến lược lọc, theo dõi token SQLite với phân tích rtk gain, các cờ toàn cục -v/-vv/-vvv và -u, config.toml với dự phòng tee khi lỗi, tích hợp 15 công cụ AI (Claude Code/Gemini/Copilot/OpenCode và hơn thế), thiết kế telemetry ưu tiên quyền riêng tư, và triết lý kỹ thuật cùng hồ sơ quyết định kiến trúc đằng sau 75k stars (vì sao Rust/SQLite/anyhow/Clap)."
date: "2026-08-06"
author: "TopDigg Research Team"
tags: ["RTK", "Rust", "Token Optimization", "LLM", "CLI", "AI Agent", "Claude Code", "Token Killer", "Developer Tools", "SQLite", "Proxy", "Open Source"]
categories: ["Deep Dive"]
keywords: ["RTK", "Rust Token Killer", "rtk-ai", "tối ưu token", "CLI proxy", "nén đầu ra bash", "ngữ cảnh LLM", "Claude Code", "Auto-Rewrite Hook", "rtk gain", "SQLite", "tiết kiệm token", "mã nguồn mở", "Patrick Szymkowiak"]
---

# RTK (Rust Token Killer) Phân Tích Chuyên Sâu: Một CLI Proxy Nhị Phân Rust Duy Nhất Cắt Tới 90% Đầu Ra Bash Mà Agent Của Bạn Đọc

> Ý tưởng cốt lõi: **RTK là một CLI proxy hiệu năng cao nằm giữa agent lập trình AI của bạn và shell, nén đầu ra lệnh trước khi nó đi vào ngữ cảnh LLM — cắt tới 90% đầu ra bash.** Hãy chú ý cách diễn đạt: nó cắt "đầu ra bash mà agent của bạn đọc," **không phải hóa đơn của bạn** — đầu ra bash chỉ là một phần đóng góp vào input tokens, và input tokens chỉ là một phần của hóa đơn; mức tiết kiệm bị loãng ở từng bước. Dự án này (`rtk-ai/rtk`, 75k+ stars, viết bằng Rust, Apache-2.0) đẩy ý tưởng đến cực hạn: **một nhị phân Rust duy nhất (~4.1MB), 100+ lệnh được hỗ trợ, chỉ ~5-15ms chi phí mỗi lệnh, 64 module, và 15 tích hợp công cụ AI.** Nó dùng mô hình proxy để viết lại một cách trong suốt `git status` → `rtk git status`, và bốn chiến lược nén (lọc thông minh / nhóm / cắt ngắn / khử trùng lặp) để thu gọn đầu ra `git push` 15 dòng thành một dòng — `ok main` — và lỗi `cargo test` hơn 200 dòng thành ~20 dòng. Điều đáng khen nhất là triết lý kỹ thuật của nó: năm nguyên tắc thiết kế — **Single Responsibility, Minimal Overhead, Exit Code Preservation, Fail-Safe, và Transparent** — nơi lỗi lọc sẽ rơi về đầu ra thô, `-v` luôn cho bạn thấy bản gốc, và mã thoát CI/CD không bao giờ bị nuốt mất.

---

## 1. Tổng Quan Dự Án

### 1.1 Nó Là Gì?

**RTK (Rust Token Killer)** là một **CLI proxy hiệu năng cao** mã nguồn mở với một sứ mệnh duy nhất: **lọc và nén đầu ra lệnh trước khi nó đến ngữ cảnh LLM của bạn.** Dự án nằm tại `https://github.com/rtk-ai/rtk`, và dòng đầu tiên của README định nghĩa rõ ràng:

> **CLI proxy hiệu năng cao cắt tới 90% đầu ra bash mà agent của bạn đọc**

Nó không phải là một "công cụ AI" — nó là một **lớp đệm cho các công cụ AI**: nó bọc các lệnh shell bạn đã dùng (`ls`, `git status`, `cargo test`, `ruff check`, `docker ps`...) và viết lại đầu ra ở lớp trung gian. Bạn vẫn gõ `git status`; một hook viết lại thành `rtk git status`; agent nhận phiên bản đã nén — **không nhận biết gì, không thêm chi phí prompt.**

### 1.2 Sự Thật & Con Số Chính

- Kho lưu trữ: `github.com/rtk-ai/rtk` — **75k+ stars, 4.7k+ forks** (tính đến thời điểm viết bài)
- Ngôn ngữ: **Rust** (một nhị phân duy nhất, không phụ thuộc runtime); Giấy phép: **Apache-2.0**
- Nhánh mặc định: `develop` (dòng phát triển chính); tạo 2026-01-22, lặp với tần suất cao
- Người sáng lập: **Patrick Szymkowiak**; người đóng góp chính: Florian Bruniaux, Adrien Eppling, Nicolas Le Cam, Takayuki Maeda
- Sản phẩm: một **nhị phân Rust ~4.1MB (stripped) duy nhất**, khởi động nguội ~5-10ms, bộ nhớ thường trú ~2-5MB
- Phạm vi: **100+ lệnh được hỗ trợ, 64 module (42 module lệnh + 22 module hạ tầng), 15 tích hợp công cụ lập trình AI**
- Cam kết hiệu năng: **~5-15ms chi phí proxy mỗi lệnh** (mục tiêu thiết kế "Minimal Overhead")
- Nén: **cắt tới 90% đầu ra bash**; theo hệ sinh thái: Git 85-99%, JS/TS 70-99%, Python 70-90%, Go 75-90%, Ruby 60-90%, Cloud 60-80%, System 50-90%, Rust 60-99%
- Kiểm thử cục bộ: bài viết này được viết trong môi trường có **rtk 0.44.2** cài qua Homebrew (bản 0.28.2 trong ví dụ README là số phiên bản cũ hơn)

### 1.3 Vấn Đề Nó Giải Quyết Là Gì?

Các agent lập trình mô hình lớn (Claude Code, Gemini CLI, Cursor, Copilot, v.v.) hoạt động theo một vòng lặp cơ bản: **đọc đầu ra lệnh → suy nghĩ → chạy lệnh khác.** Nhưng đầu ra lệnh shell thường được viết "cho con người": hàng trăm dòng liệt kê file, thanh tiến trình, màu ANSI, thông báo thành công, log lặp lại... Khi nội dung này đi vào ngữ cảnh LLM, nó được **tính phí theo token** — nó là một phần của input tokens, và input tokens là một phần của hóa đơn.

Câu trả lời của RTK: **gỡ bỏ tạp âm của con người trước khi đầu ra vào ngữ cảnh.** Nó không thể quản lý prompt, system prompt, hay lịch sử hội thoại của bạn — nhưng nó có thể quản lý phần đầu ra bash, và đó là ranh giới của tuyên bố "tới 90%" của nó.

Ở đây chúng ta phải vạch một đường đỏ về khái niệm (README dành hẳn một phần, "How Savings Work", cho nó):

> **Cắt đầu ra bash ≠ cắt 90% hóa đơn của bạn.** Đầu ra bash là một phần đóng góp vào input tokens (bên cạnh prompt, system prompt, và lịch sử hội thoại của bạn); input tokens lại chỉ là một phần của hóa đơn (vốn còn tính cả output tokens). Mức giảm bị loãng ở từng bước.

Các con số token mà RTK báo cáo là **ước lượng** của `bytes / 4` — RTK không kèm tokenizer, nên **các phần trăm đáng tin cậy nhưng các con số token tuyệt đối chỉ là xấp xỉ.**

---

## 2. Ý Tưởng Cốt Lõi

### 2.1 Định Nghĩa Trong Một Câu

> **RTK chặn các lệnh shell, nén đầu ra, và để agent đọc phiên bản đã nén.** Một nhị phân Rust duy nhất, 100+ lệnh, chi phí <10ms.

Nó không phải là "git nhanh hơn" hay "linter tốt hơn" — nó là một **bộ viết lại trên đường ống đầu ra.** Toàn bộ trí thông minh của nó nằm ở việc biết **thông tin nào hữu ích cho quyết định của LLM và thông tin nào chỉ là tạp âm.**

### 2.2 Mô Hình Proxy: Chuyển Hướng Luồng Đầu Ra

README giải thích cơ chế bằng một sơ đồ ASCII:

```
  Without rtk:                                    With rtk:

  Claude  --git status-->  shell  -->  git         Claude  --git status-->  RTK  -->  git
    ^                                   |            ^                      |          |
    |         full raw output           |            |  compact output      | filter   |
    +-----------------------------------+            +------- (filtered) ---+----------+
```

- **Không có RTK**: Claude nhận toàn bộ đầu ra thô của git (hàng trăm dòng).
- **Có RTK**: một hook viết lại lệnh thành `rtk git status`; RTK thực thi lệnh thật, lọc và nén stdout, và trao **phiên bản đã nén** cho Claude. Claude không hề hay biết — nó tin những gì nó đọc là tất cả.

### 2.3 Bốn Chiến Lược Nén

RTK áp dụng kết hợp bốn chiến lược theo từng loại lệnh:

1. **Smart Filtering** — loại bỏ tạp âm: bình luận, dòng trống, boilerplate (ví dụ các dòng "Using..." của bundle install).
2. **Grouping** — gom các mục tương tự: file theo thư mục, lỗi theo quy tắc (`no-unused-vars: 23`, `semi: 45`).
3. **Truncation** — giữ ngữ cảnh liên quan, cắt phần dư thừa (cắt dòng dài, thu gọn nội dung lặp).
4. **Deduplication** — thu gọn các dòng log lặp lại thành "đã xảy ra N lần" (`[ERROR] ... (×5)`).

Hiệu quả cụ thể theo lệnh (bảng ánh xạ của README):

| Thao tác | RTK làm gì với đầu ra |
|-----------|-----------------------------|
| `ls` / `tree` | Định dạng cây kèm số file (`src/ (8 files)`) thay vì một dòng mỗi mục |
| `cat` / `read` | Đọc file thông minh: chữ ký và cấu trúc thay vì toàn bộ nội dung |
| `grep` / `rg` | Cắt dòng dài, nhóm kết quả theo file |
| `git status` | Định dạng thống kê gọn, nhóm theo trạng thái |
| `git diff` | Giảm ngữ cảnh, bỏ tiêu đề |
| `git log` | Chỉ hash, tác giả và chủ đề |
| `git add/commit/push` | Dòng xác nhận thay vì toàn bộ đầu ra tiến trình |
| `cargo test` / `npm test` | Chỉ lỗi, các test đạt thu gọn thành số đếm |
| `pytest` / `go test` | Chỉ lỗi, traceback cắt gọn / NDJSON được phân tích |
| `docker ps` | Chỉ các trường thiết yếu |

### 2.4 Hai Chiến Lược Hook: Auto-Rewrite vs Suggest

Cách dùng hiệu quả nhất của RTK là **Auto-Rewrite Hook** — hook chặn trong suốt các lệnh Bash và viết lại chúng thành các lệnh rtk tương đương trước khi thực thi. Kết quả: **100% áp dụng rtk với chi phí ngữ cảnh bằng không.** Tài liệu kiến trúc so sánh hai chiến lược:

```
Auto-Rewrite (default)              Suggest (non-intrusive)
─────────────────────               ────────────────────────
Hook intercepts command             Hook emits systemMessage hint
Rewrites before execution           Claude decides autonomously
100% adoption                       ~70-85% adoption
Zero context overhead               Minimal context overhead
Best for: production                Best for: learning / auditing
```

- **Auto-Rewrite**: các lệnh được viết lại âm thầm, agent không nhận biết — dành cho môi trường sản xuất theo đuổi mức tiết kiệm tối đa.
- **Suggest**: hook chỉ phát ra một thông báo hệ thống gợi ý "lệnh này có thể dùng rtk"; Claude tự quyết định — dành cho người dùng muốn quan sát hiệu quả trước.

**Lưu ý ranh giới**: hook chỉ áp dụng cho **lời gọi Bash tool**. Các công cụ tích hợp của Claude Code như `Read`, `Grep`, và `Glob` không đi qua Bash hook và không bị viết lại — để nén các quy trình đó, hãy dùng lệnh shell hoặc gọi tường minh `rtk read`, `rtk grep`, hoặc `rtk find`.

### 2.5 Ranh Giới Của "Cắt 90%" và Phương Pháp Ước Lượng

RTK cực kỳ dè dặt về "tiết kiệm" — đây là điều tách nó khỏi lời quảng cáo:

- Thứ được tiết kiệm là **đầu ra bash**, không phải hóa đơn (xem 1.3).
- Ước lượng token dùng phép thô `bytes / 4` (~4 ký tự ≈ 1 token, kiểu GPT); **không kèm tokenizer**.
- Do đó: **các phần trăm (savings_pct) là giá trị tương đối đáng tin cậy; các con số token tuyệt đối chỉ là xấp xỉ** — đủ tốt cho so sánh chéo và theo dõi xu hướng, không phải để hạch toán chính xác.

---

## 3. Hướng Dẫn Chi Tiết

### 3.1 Cài Đặt

Bốn lựa chọn, tùy bạn:

```bash
# Homebrew (khuyên dùng trên macOS)
brew install rtk

# Script cài nhanh (Linux/macOS, cài vào ~/.local/bin)
curl -fsSL https://raw.githubusercontent.com/rtk-ai/rtk/refs/heads/master/install.sh | sh

# Cargo
cargo install --git https://github.com/rtk-ai/rtk

# Nhị phân dựng sẵn: tải từ GitHub Releases
# macOS: rtk-aarch64-apple-darwin.tar.gz / Linux: rtk-x86_64-unknown-linux-musl.tar.gz / Windows: rtk-x86_64-pc-windows-msvc.zip
```

Xác minh cài đặt:

```bash
rtk --version   # Sẽ hiện "rtk X.Y.Z" (0.44.2 trong môi trường của bài viết này)
rtk gain        # Sẽ hiện bảng điều khiển tiết kiệm
```

> ⚠️ **Cảnh báo trùng tên**: một dự án khác tên "rtk" (Rust Type Kit) tồn tại trên crates.io. Nếu `rtk gain` lỗi, bạn đã cài nhầm gói — hãy dùng `cargo install --git` ở trên.

### 3.2 Bắt Đầu Nhanh: Để Agent Của Bạn Tự Động Dùng RTK

```bash
# 1. Cài cho công cụ AI của bạn (-g = toàn cục)
rtk init -g                     # Claude Code / Copilot (mặc định)
rtk init -g --gemini            # Gemini CLI
rtk init -g --codex             # Codex (OpenAI)
rtk init -g --agent cursor      # Cursor
rtk init -g --agent windsurf    # Windsurf
rtk init --agent cline          # Cline / Roo Code
rtk init -g --opencode          # OpenCode (plugin)
rtk init -g --auto-patch        # Không tương tác (CI/CD)
rtk init --show                 # Xác minh cài đặt

# 2. Khởi động lại công cụ AI của bạn, rồi kiểm thử
git status                      # Tự động viết lại thành rtk git status
```

Sau khi cài, hook viết lại trong suốt các lời gọi Bash (`git status` → `rtk git status`), và agent nhận đầu ra đã nén **mà không bao giờ cần gọi rtk tường minh.** Công cụ được hỗ trợ (15): Claude Code, GitHub Copilot (VS Code), Copilot CLI, Cursor, Gemini CLI, Codex, Windsurf, Cline/Roo Code, OpenCode, OpenClaw, Pi, Hermes, Kilo Code, Google Antigravity, Kimi AI, Factory Droid — mỗi công cụ một phương thức tích hợp khác nhau (PreToolUse hook / plugin / hướng dẫn AGENTS.md / quy tắc phạm vi dự án); xem hướng dẫn Supported Agents chính thức để biết chi tiết.

### 3.3 Tham Chiếu Lệnh (Theo Danh Mục)

**Files**:
```bash
rtk ls .                        # Cây thư mục gọn
rtk read file.rs                # Đọc file thông minh (chữ ký & cấu trúc trước)
rtk read file.rs -l aggressive  # Chỉ chữ ký (bỏ phần thân)
rtk smart file.rs               # Tóm tắt mã heuristic 2 dòng
rtk find "*.rs" .               # Kết quả find gọn
rtk grep "pattern" .            # Kết quả tìm kiếm nhóm
rtk diff file1 file2            # Diff rút gọn (exit 1 nếu file khác nhau)
```

**Git**:
```bash
rtk git status                  # Trạng thái gọn
rtk git log -n 10               # Commit một dòng
rtk git diff                    # Diff rút gọn
rtk git add                     # -> "ok"
rtk git commit -m "msg"         # -> "ok abc1234"
rtk git push                    # -> "ok main"
rtk git pull                    # -> "ok 3 files +10 -2"
```

**GitHub CLI**:
```bash
rtk gh pr list                  # Liệt kê PR gọn
rtk gh pr view 42               # Chi tiết PR + checks
rtk gh issue list               # Liệt kê issue gọn
rtk gh run list                 # Trạng thái workflow run
```

**Test Runners** (vùng giá trị cốt lõi — tập trung lỗi):
```bash
rtk jest                        # Jest gọn (chỉ lỗi)
rtk vitest                      # Vitest gọn (chỉ lỗi)
rtk playwright test             # Kết quả E2E (chỉ lỗi)
rtk pytest                      # Python tests (-90%)
rtk go test                     # Go tests (NDJSON, -90%)
rtk cargo test                  # Cargo tests (-90%)
rtk rake test                   # Ruby minitest (-90%)
rtk rspec                       # RSpec tests (JSON, -60%+)
rtk err <cmd>                   # Chỉ lọc lỗi từ bất kỳ lệnh nào
rtk test <cmd>                  # Bọc test chung - chỉ lỗi (-90%)
```

**Build & Lint**:
```bash
rtk lint                        # ESLint nhóm theo quy tắc/file
rtk tsc                         # Lỗi TypeScript nhóm theo file
rtk next build                  # Next.js build gọn
rtk cargo build                 # Cargo build (-80%)
rtk cargo clippy                # Cargo clippy (-80%)
rtk ruff check                  # Python linting (JSON, -80%)
rtk golangci-lint run           # Go linting (JSON, -85%)
rtk rubocop                     # Ruby linting (JSON, -60%+)
```

**Cloud & Containers**:
```bash
rtk aws sts get-caller-identity # Danh tính một dòng
rtk aws lambda list-functions   # Tên/runtime/memory (bỏ secrets)
rtk docker ps                   # Danh sách container gọn
rtk docker logs <container>     # Log khử trùng lặp
rtk kubectl pods                # Danh sách pod gọn
rtk kubectl logs <pod>          # Log khử trùng lặp
```

**Data & Meta-Commands**:
```bash
rtk json config.json            # Cấu trúc không có giá trị
rtk deps                        # Tóm tắt phụ thuộc
rtk env -f AWS                  # Env vars đã lọc
rtk log app.log                 # Log khử trùng lặp
rtk curl <url>                  # Cắt ngắn + lưu đầu ra đầy đủ
rtk summary <long command>      # Tóm tắt heuristic
rtk proxy <command>             # Chuyển tiếp thô + theo dõi (để gỡ lỗi)
```

### 3.4 Cờ Toàn Cầu

```bash
-u, --ultra-compact    # Biểu tượng ASCII, định dạng nội dòng (giảm đầu ra thêm)
-v, --verbose          # Tăng chi tiết: -v / -vv / -vvv
```

Các mức chi tiết (áp dụng cho mọi lệnh):
- Không cờ: chỉ đầu ra gọn
- `-v`: + thông báo gỡ lỗi (`eprintln!` debug statements)
- `-vv`: + lệnh đang được thực thi
- `-vvv`: + đầu ra thô trước khi lọc (**mức sàn trong suốt** — bất cứ khi nào bạn muốn bản gốc, `-vvv` có nó)

### 3.5 Meta-Commands Phân Tích: Bảng Điều Khiển Tiết Kiệm Token

```bash
rtk gain                        # Thống kê tóm tắt (90 ngày)
rtk gain --graph                # Biểu đồ ASCII (30 ngày gần nhất)
rtk gain --history              # Lịch sử lệnh gần đây
rtk gain --daily                # Phân tích theo từng ngày
rtk gain --all --format json    # Xuất JSON cho dashboard

rtk discover                    # Tìm cơ hội tiết kiệm bị bỏ lỡ
rtk discover --all --since 7    # Tất cả dự án, 7 ngày qua

rtk session                     # Hiển thị mức áp dụng RTK qua các phiên gần đây
```

Cơ chế: sau mỗi lần thực thi lệnh, RTK chèn một bản ghi vào **cơ sở dữ liệu SQLite** (`~/.local/share/rtk/history.db`): `input_tokens` (byte đầu ra thô/4), `output_tokens` (đã nén/4), `saved_tokens`, `savings_pct`, `exec_time_ms`, và dấu thời gian. Tự dọn sau 90 ngày. `rtk gain` tạo ra một báo cáo như thế này:

```
Token Savings Report (90 days)
──────────────────────────────
Commands executed:  1,234
Average savings:    78.5%
Total tokens saved: 45,678
Total exec time:    8m50s (573ms)

Top commands:
  • rtk git status    (234 uses)
  • rtk lint          (156 uses)
  • rtk test          (89 uses)
```

### 3.6 Cấu Hình & Dự Phòng Khi Lỗi

File cấu hình (`~/.config/rtk/config.toml`, trên macOS `~/Library/Application Support/rtk/config.toml`):

```toml
[hooks]
exclude_commands = ["curl", "playwright"]  # bỏ qua viết lại cho các lệnh này

[tee]
enabled = true          # lưu đầu ra thô khi lỗi (mặc định: true)
mode = "failures"       # "failures", "always", hoặc "never"
```

**Cơ chế dự phòng tee** (nguyên tắc Fail-Safe trong thực tế): khi một lệnh lỗi, RTK lưu toàn bộ đầu ra chưa lọc xuống đĩa để LLM có thể đọc bản gốc mà không cần thực thi lại:

```
FAILED: 2/15 tests
[full output: ~/.local/share/rtk/tee/1707753600_cargo_test.log]
```

Gỡ cài đặt: `rtk init -g --uninstall` (xóa hook/RTK.md/các mục settings) + `cargo uninstall rtk` hoặc `brew uninstall rtk`.

### 3.7 Quyền Riêng Tư & Telemetry

- Telemetry **tắt theo mặc định** và cần **đồng ý rõ ràng** (tại `rtk init` hoặc qua `rtk telemetry enable`).
- Thứ được thu thập là **dữ liệu ẩn danh, tổng hợp**: một hash thiết bị có muối (SHA-256, không đảo ngược), số đếm lệnh, ước lượng token tiết kiệm, tên công cụ hàng đầu (chỉ 3 từ đầu của **tên công cụ** như "git"/"cargo", không bao giờ là đối số), phân bố danh mục, v.v.
- **Thứ KHÔNG được thu thập**: mã nguồn, đường dẫn file, đối số lệnh, secrets, biến môi trường, dữ liệu cá nhân, hoặc nội dung kho lưu trữ.
- Quản lý: `rtk telemetry status / enable / disable / forget`; biến môi trường `RTK_TELEMETRY_DISABLED=1` chặn cứng việc thu thập bất kể sự đồng ý.

---

## 4. Triết Lý Thiết Kế

### 4.1 Năm Nguyên Tắc Thiết Kế (nêu ngay đầu tài liệu kiến trúc)

1. **Single Responsibility**: mỗi module xử lý đúng một loại lệnh — `git.rs` chỉ hiểu git, `pytest_cmd.rs` chỉ hiểu pytest. Tách biệt trách nhiệm xuống cấp module.
2. **Minimal Overhead**: chi phí proxy mỗi lệnh được giữ ở **~5-15ms** — không đáng kể cho trải nghiệm người dùng, nhưng là mục tiêu thiết kế cứng (mỗi chiến lược lọc mang một ngân sách chi phí trong mã nguồn: phân tích Clap 2-3ms, lọc 2-8ms, theo dõi SQLite 1-3ms).
3. **Exit Code Preservation**: **độ tin cậy CI/CD lên hàng đầu** — mã thoát của công cụ bên dưới được truyền nguyên vẹn (git trả 128, RTK trả 128), tín hiệu lỗi không bao giờ bị nuốt. 0 = thành công; 1 = lỗi nội bộ rtk; N = mã thoát được bảo toàn từ công cụ bên dưới.
4. **Fail-Safe**: **nếu lọc lỗi, rơi về đầu ra gốc** — RTK không bao giờ được là nguồn mất thông tin. Cơ chế tee (3.6) mở rộng nguyên tắc này: khi lỗi, bản gốc đầy đủ được lưu cho LLM.
5. **Transparent**: người dùng **luôn** có thể thấy thông báo gỡ lỗi, lệnh đang thực thi, hoặc thậm chí đầu ra thô trước lọc qua `-v`/`-vv`/`-vvv`.

### 4.2 Vòng Đời Lệnh Sáu Pha

Tài liệu kiến trúc đi qua toàn bộ chuỗi với `rtk git log --oneline -5 -v`:

```
Phase 1 PARSE   → Clap parses Commands::Git, args, verbose=1
Phase 2 ROUTE   → main.rs routes to git::run(args, verbose)
Phase 3 EXECUTE → std::process::Command runs the real git, captures stdout/stderr/exit_code
Phase 4 FILTER  → format_git_output() applies the strategy: "5 commits, +142/-89" (96% compression)
Phase 5 PRINT   → verbose>0 prints debug message + compressed result
Phase 6 TRACK   → tracking::track() writes to SQLite (input 500 chars → output 20 chars)
```

**Ý nghĩa sâu hơn của Phase 6**: RTK không chỉ nén đầu ra — nó **ghi lại chính việc nén.** Mức tiết kiệm của mọi lệnh được định lượng và trở thành nguồn dữ liệu cho bảng điều khiển `rtk gain`. **Đo lường là tiền đề của tối ưu hóa** — đây là điều về cơ bản tách nó khỏi một "đường ống sed được viết kịch bản."

### 4.3 Phân Loại 12 Chiến Lược Lọc

Tài liệu kiến trúc khái quát logic lọc của 100+ lệnh thành 12 chiến lược tái sử dụng:

| # | Chiến lược | Kỹ thuật | Giảm | Module tiêu biểu |
|---|----------|-----------|-----------|------------------------|
| 1 | **Stats Extraction** | Đếm/tổng hợp, bỏ chi tiết | 90-99% | git status/log/diff, pnpm list |
| 2 | **Error Only** | Bỏ stdout, giữ stderr | 60-80% | runner err mode |
| 3 | **Grouping by Pattern** | Nhóm theo quy tắc/file/mã lỗi, đếm | 80-90% | lint, tsc, grep |
| 4 | **Deduplication** | Dòng duy nhất + số đếm | 70-85% | log |
| 5 | **Structure Only** | Giữ key + type, bỏ giá trị | 80-95% | json |
| 6 | **Code Filtering** | Ba mức: none/minimal(bỏ bình luận)/aggressive(bỏ thân) | 0-90% | read, smart |
| 7 | **Failure Focus** | Ẩn test đạt, chỉ hiện lỗi | 94-99% | vitest, playwright |
| 8 | **Tree Compression** | Danh sách phẳng → cây + số đếm thư mục | 50-70% | ls |
| 9 | **Progress Filtering** | Bỏ thanh tiến trình/chuỗi ANSI | 85-95% | wget, pnpm install |
| 10 | **JSON/Text Dual Mode** | Dùng JSON khi có, rơi về text | 80%+ | ruff, pip |
| 11 | **State Machine Parsing** | Theo dõi trạng thái test, trích chi tiết lỗi | 90%+ | pytest |
| 12 | **NDJSON Streaming** | Phân tích từng dòng JSON, tổng hợp sự kiện | 90%+ | go test |

**Cây quyết định thiết kế** (cách một module mới chọn chiến lược): công cụ có cờ JSON và cần dữ liệu có cấu trúc → dùng JSON API; sự kiện streaming → phân tích từng dòng NDJSON; text thuần → state machine nếu có trạng thái, lọc text nếu đơn giản.

### 4.4 Lựa Chọn Công Nghệ & Hồ Sơ Quyết Định Kiến Trúc (ADRs)

- **Vì sao Rust?** Hiệu năng (~5-15ms chi phí), an toàn (không lỗi runtime null-pointer/data-race), một nhị phân (phân phối không phụ thuộc runtime), đa nền tảng (macOS/Linux/Windows không cần sửa đổi).
- **Vì sao SQLite cho theo dõi?** Không cấu hình (không server), nhẹ (~100KB cho 90 ngày lịch sử), đáng tin cậy ACID, truy vấn được (`rtk gain` chạy tổng hợp SQL trực tiếp).
- **Vì sao anyhow cho xử lý lỗi?** `.context()` thêm thông báo lỗi có ý nghĩa dọc chuỗi lời gọi, toán tử `?` cho truyền lỗi gọn, và hiển thị lỗi cho thấy toàn bộ chuỗi ngữ cảnh.
- **Vì sao Clap cho phân tích CLI?** Macro derive tiết kiệm boilerplate, `--help` tự sinh, an toàn kiểu (đối số phân tích trực tiếp vào struct có kiểu), và cờ toàn cục (`-v`/`-u`) hoạt động trên mọi lệnh.
- **Hồ sơ phát hành**: `opt-level = 3`, `lto = true`, `codegen-units = 1`, `strip = true`, `panic = "abort"` — nén nhị phân xuống còn ~4.1MB.

### 4.5 Tổ Chức Module & Phạm Vi Hệ Sinh Thái

64 module được tổ chức theo hệ sinh thái, và đường cong lợi ích hiện ra ngay lập tức:

```
GIT (cmds/git/)          85-99%    status, diff, log, gh, gt
JS/TS (cmds/js/)         70-99%    lint, tsc, next, prettier, playwright, prisma, vitest, pnpm
PYTHON (cmds/python/)    70-90%    ruff, pytest, mypy, pip
GO (cmds/go/)            75-90%    go test/build/vet, golangci-lint
RUBY (cmds/ruby/)        60-90%    rake, rspec, rubocop
DOTNET (cmds/dotnet/)    70-85%    dotnet build/test, binlog
CLOUD (cmds/cloud/)      60-80%    aws, docker/kubectl, curl, wget, psql
SYSTEM (cmds/system/)    50-90%    ls, tree, read, grep, find, json, log, env, deps
RUST (cmds/rust/)        60-99%    cargo test/build/clippy, err
```

Hai mẫu kiến trúc đáng chú ý:
- **Module Python dùng mẫu lệnh độc lập** (`Commands::Ruff` / `Pytest` / `Pip`), còn **module Go dùng mẫu sub-enum** (`Commands::Go { Test | Build | Vet }`) — vì go test/build/vet là các anh em ngữ nghĩa trong một toolchain, trong khi ruff/pytest/pip là các công cụ độc lập.
- **Phát hiện package manager** (tiện ích cốt lõi cho ngăn xếp JS/TS): `pnpm-lock.yaml` → `pnpm exec --`; `yarn.lock` → `yarn exec --`; nếu không thì `npx --no-install --`. Điều này đảm bảo lồng monorepo chính xác, chỉ dùng phụ thuộc cục bộ của dự án, và nhất quán trong mọi môi trường CI/CD.

---

## 5. Tóm Tắt

### 5.1 Những Điểm Cốt Lõi

1. **RTK là một "bộ viết lại đầu ra cho ngữ cảnh LLM"**: nó nén đầu ra bash, không phải hóa đơn của bạn — mức tiết kiệm loãng dần ở từng lớp của "đầu ra bash → input tokens → hóa đơn"; phần trăm đáng tin cậy, con số tuyệt đối chỉ xấp xỉ.
2. **Mô hình proxy là linh hồn của nó**: RTK nằm giữa agent và shell, viết lại lệnh và nén đầu ra một cách trong suốt — agent không nhận biết, không chi phí prompt thêm.
3. **Bốn chiến lược nén + phân loại 12 chiến lược**: lọc thông minh / nhóm / cắt ngắn / khử trùng lặp là bốn phương tiện; trích xuất thống kê, tập trung lỗi, state machine, NDJSON streaming và hơn thế được tái sử dụng trên các hệ sinh thái — **logic lọc là một thư viện mẫu có tính khái quát cao, không phải viết tay theo từng lệnh**.
4. **Hai chiến lược hook**: Auto-Rewrite (100% áp dụng, chi phí bằng không) và Suggest (không can thiệp, ~70-85% áp dụng) — cả một triết lý sản phẩm mạnh mẽ lẫn nhẹ nhàng, được cung cấp song song.
5. **Năm nguyên tắc thiết kế là nền móng kỹ thuật**: trách nhiệm đơn lẻ, chi phí tối thiểu (5-15ms), bảo toàn mã thoát (đường đỏ CI/CD), fail-safe (lỗi lọc → đầu ra thô), trong suốt (`-vvv` luôn hiện bản gốc). **Mất thông tin là chế độ lỗi tồi tệ nhất.**
6. **Đo lường là tiền đề của tối ưu hóa**: theo dõi SQLite + `rtk gain` làm cho "tiết kiệm" trở nên định lượng và kiểm toán được — nó không hài lòng với "cảm giác nhanh hơn" mà ghi lại input/output tokens và phần trăm tiết kiệm của mọi lệnh.
7. **Một nhị phân, không phụ thuộc, đa nền tảng**: 4.1MB, Rust, 100+ lệnh, 15 tích hợp công cụ AI — chi phí cài đặt và phân phối được nén đến mức tối thiểu; đây là nền tảng vật lý của thành công bùng nổ (75k stars).
8. **Dè dặt về quyền riêng tư**: telemetry tắt theo mặc định, ẩn danh và tổng hợp, không bao giờ thu thập đối số lệnh hay mã nguồn — sự chăm sóc lòng tin của một công cụ mã nguồn mở là tài sản vô hình cho tăng trưởng bền vững.

### 5.2 Kết Luận Trong Một Câu

> **RTK thực hiện tối ưu hóa token bằng "nén" thay vì "bỏ sót": dự phòng fail-safe, bảo toàn mã thoát, `-v` để xem bản gốc — nó để lại một cửa sau cho mọi khả năng mất thông tin, rồi tập trung vắt "tạp âm của con người" ra khỏi đường ống đầu vào của LLM.** Với các agent lập trình AI, nó giải quyết phần có thể kỹ thuật hóa nhất trong căng thẳng "chi phí token vs chất lượng ngữ cảnh": **không làm mô hình đọc ít đi, mà làm mô hình đọc hiệu quả hơn.**

---

## References

- Kho lưu trữ dự án: RTK (Rust Token Killer) — `https://github.com/rtk-ai/rtk` (README.md, README_zh.md, docs/contributing/ARCHITECTURE.md, docs/TELEMETRY.md, hooks/README.md)
- Trang tài liệu chính thức: `https://www.rtk-ai.app/guide` (cài đặt, agent được hỗ trợ, cấu hình, xử lý sự cố)
- Tài liệu kiến trúc: `docs/contributing/ARCHITECTURE.md` (thiết kế hệ thống, phân loại 12 chiến lược lọc, ADRs, v3.1)
- Giải thích tiết kiệm: *How RTK Savings Work* — `docs/guide/resources/savings-explained.md`
- Tham chiếu cục bộ: `~/.claude/RTK.md` (ghi chú sử dụng cho rtk 0.44.2 cài cục bộ)
- Liên quan trên trang này: loạt bài *Loop Engineering Deep Dive* (`loop-engineering-orange-book` / `loop-engineering-substack-analysis` / `loop-engineering-addy-osmani` / `loop-engineering-langchain`)
