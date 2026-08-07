---
title: 'GOAL.md Đi Sâu: Một Framework Tối Giản Cho Việc Cải Thiện Mã Tự Động Bằng AI — Chỉ Cần Đưa Nó Một Con Số'
description: "Bài phân tích toàn diện về GOAL.md — một định dạng file từ AutoHarness cho phép các AI agent tự động cải thiện mã. Ý tưởng cốt lõi đơn giản đến bất ngờ: viết một script chấm điểm xuất ra một con số (Fitness Function), viết một file GOAL.md định nghĩa mục tiêu và danh mục hành động, rồi để agent tự tìm ra cách làm con số tăng lên. Bài viết này bao quát các khái niệm cốt lõi (Fitness Function, Action Catalog, Improvement Loop, Operating Modes), triết lý thiết kế, hướng dẫn hoàn chỉnh và các ví dụ thực tế — cho thấy GOAL.md biến AI agent thành những kỹ sư chất lượng mã tự động."
date: "2026-08-04"
author: "TopDigg Research Team"
tags: ["GOAL.md", "AutoHarness", "AI Agent", "Fitness Function", "Code Quality", "Autonomous Improvement", "Rust", "LLM"]
categories: ["Deep Dive"]
keywords: ["GOAL.md", "AutoHarness", "fitness function", "AI agent", "cải thiện tự động", "chất lượng mã", "action catalog", "vòng lặp cải thiện", "script chấm điểm"]
---

# GOAL.md Đi Sâu: Một Framework Tối Giản Cho Việc Cải Thiện Mã Tự Động Bằng AI — Chỉ Cần Đưa Nó Một Con Số

> Ý tưởng cốt lõi: **Cách tiếp cận truyền thống — con người phân tích mã, liệt kê todos, thực thi từng cái một, kiểm chứng thủ công — chậm và không bền vững. Câu trả lời của GOAL.md: bạn không cần nói cho AI biết *cách* cải thiện, bạn chỉ cần nói nó "tốt hơn" trông như thế nào.** Viết một script chấm điểm xuất ra một con số (Fitness Function), viết một file GOAL.md định nghĩa mục tiêu và danh mục hành động, rồi để agent tự tìm ra cách làm con số tăng lên. Agent đo điểm hiện tại, chọn hành động có tác động cao nhất, thực thi thay đổi, kiểm chứng điểm đã cải thiện, ghi lại vào log — hình thành một vòng lặp cải thiện tự điều khiển. Đây là "framework cải thiện tự động tối giản" từ AutoHarness — không phải để AI *viết* mã, mà để AI *cải thiện* mã.

---

## 1. Tổng Quan Dự Án

### 1.1 Nó Là Gì?

**GOAL.md** là một **định dạng file** từ AutoHarness cho phép các AI agent tự động cải thiện dự án. Nó giải quyết một vấn đề cốt lõi:

> **"Tôi muốn dự án này tốt hơn, nhưng tôi không chắc bằng cách nào"**

Cách tiếp cận truyền thống: con người phân tích mã → liệt kê todos → thực thi từng cái → kiểm chứng thủ công. Cách tiếp cận GOAL.md: viết script chấm điểm → viết GOAL.md → để agent tự tìm ra → agent ghi lại từng thay đổi và độ lệch điểm.

### 1.2 Các Khái Niệm Chính

Phần lõi của GOAL.md gồm bốn thành phần:

- **Fitness Function**: Một script xuất ra một con số đo "dự án tốt đến mức nào"
- **Action Catalog**: Liệt kê tất cả các hành động cải thiện khả thi và tác động kỳ vọng của chúng
- **Improvement Loop**: Đo → Chọn → Thực thi → Kiểm chứng → Ghi lại → Lặp lại
- **Operating Mode**: Converge / Continuous / Supervised

### 1.3 Nó Giải Quyết Vấn Đề Gì?

Các AI agent viết mã nhanh, nhưng chúng không biết "mã tốt hơn" trông như thế nào. Nếu không có vòng phản hồi, agent giống như một chiếc máy điều nhiệt không có cảm biến nhiệt độ — nó không thể biết các thay đổi của mình khiến mọi thứ tốt hơn hay tệ hơn. GOAL.md giải quyết điều này bằng một con số đơn giản: **điểm cao hơn = dự án tốt hơn**. Mục tiêu của agent là làm con số đó tăng lên.

---

## 2. Ý Tưởng Cốt Lõi

### 2.1 Fitness Function — Định Nghĩa "Tốt" Bằng Một Con Số

Fitness Function là một script xuất ra một con số đo chất lượng dự án:

```bash
./scripts/score.sh
# Output: 85 / 100
```

Các nguyên tắc thiết kế:

- **Tất định (Deterministic)**: Cùng đầu vào phải tạo ra cùng đầu ra
- **Nhanh**: Lý tưởng hoàn thành trong dưới 60 giây
- **Độc lập**: Không phụ thuộc trạng thái bên ngoài
- **Có thể tổ hợp**: Điểm = tổng của các điểm thành phần

Các thành phần phổ biến:

- **format**: 20 điểm — `cargo fmt -- --check`
- **clippy**: 20 điểm — số lượng cảnh báo `cargo clippy`
- **tests**: 25 điểm — `cargo test` đạt
- **docs**: 15 điểm — kiểm tra file
- **maintenance**: 10 điểm — trạng thái bảo trì dự án
- **safety**: 10 điểm — kiểm tra mã `unsafe`

### 2.2 Action Catalog — Cho Agent Biết "Bạn Có Thể Làm Gì"

Action catalog là một bảng liệt kê tất cả các hành động cải thiện khả thi và tác động kỳ vọng của chúng:

- **Chạy cargo fmt** — Tác động +20, thực thi `cargo fmt`
- **Sửa các cảnh báo clippy** — Tác động +10, thực thi `cargo clippy --fix`
- **Thêm unit tests** — Tác động +10, thêm test cho các hàm công khai

Agent chọn hành động "tác động cao nhất" để thực thi trước.

### 2.3 Improvement Loop — Cải Thiện Tự Điều Khiển

```
1. Đo điểm hiện tại
2. Chọn hành động tác động cao nhất
3. Thực thi thay đổi
4. Kiểm chứng điểm đã cải thiện
5. Ghi lại vào log
6. Lặp lại
```

Vòng lặp này tự điều khiển — agent không cần chỉ dẫn của con người cho bước tiếp theo; nó quyết định dựa trên sự thay đổi của điểm số.

### 2.4 Operating Mode — Ba Chiến Lược

- **Converge**: Dừng khi đạt điểm mục tiêu (cho các cải thiện hướng mục tiêu)
- **Continuous**: Chạy cho đến khi bị ngắt (cho tối ưu hóa liên tục)
- **Supervised**: Tạm dừng tại các điểm quan trọng để xác nhận (cho rà soát mã nhạy cảm)

---

## 3. Triết Lý Thiết Kế

### 3.1 "Bạn Không Cần Nói Cho AI Biết Cách — Chỉ Cần Nói Nó 'Tốt Hơn' Trông Như Thế Nào"

Đây là triết lý thiết kế sâu nhất của GOAL.md. Các cách tiếp cận truyền thống viết chỉ dẫn chi tiết bảo AI từng bước — nhưng điều này giới hạn sự sáng tạo của AI. GOAL.md chỉ định nghĩa "mục tiêu" (điểm số) và "ranh giới" (ràng buộc), để AI tự khám phá con đường tối ưu. Nó giống như đưa cho một nhân viên thông minh một chỉ số KPI, chứ không phải một cuốn sổ tay vận hành.

### 3.2 "Vòng Phản Hồi Là Nền Tảng Của Mọi Hệ Thống Tự Động"

Vòng lặp cải thiện của GOAL.md về bản chất là một vòng phản hồi: đo → hành động → đo lại. Không có vòng phản hồi, các hệ thống tự động không thể hoạt động — chúng không biết hành động của mình có hiệu quả hay không. GOAL.md xây vòng lặp này bằng cơ chế đơn giản nhất có thể: một con số.

### 3.3 "Tính Tất Định Là Nền Tảng Của Lòng Tin"

Fitness Function phải tất định — cùng đầu vào, cùng đầu ra. Nếu script chấm điểm cho kết quả khác nhau mỗi lần chạy, agent không thể tin tưởng phản hồi của nó, và toàn bộ hệ thống sụp đổ. Tính tất định không chỉ là một yêu cầu kỹ thuật — nó là một yêu cầu về lòng tin. Con người phải có khả năng dự đoán những gì AI nhìn thấy để tin tưởng các quyết định của nó.

### 3.4 "Ràng Buộc Hiệu Quả Hơn Chỉ Dẫn"

GOAL.md không bảo agent làm việc chính xác như thế nào — nó định nghĩa các ràng buộc (đừng phá chức năng hiện có, format trước lint, một commit cho mỗi thay đổi). Ràng buộc hiệu quả hơn chỉ dẫn vì chúng cho AI tự do trong khi vẫn đảm bảo an toàn. Điều này khớp với trí tuệ quản lý con người: quản lý giỏi định nghĩa ranh giới, không vi quản lý.

---

## 4. Hướng Dẫn Từng Bước

### 4.1 Bắt Đầu Nhanh Năm Phút

**Bước 1: Tạo script chấm điểm**

```bash
mkdir -p scripts
cat > scripts/score.sh << 'EOF'
#!/bin/bash
set -uo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")/.." || exit 1

FORMAT_SCORE=0; CLIPPY_SCORE=0; TEST_SCORE=0

# Format check (20 pts)
cargo fmt -- --check 2>/dev/null && FORMAT_SCORE=20

# Clippy check (20 pts)
WARN_COUNT=$(cargo clippy 2>&1 | grep -c "warning:" || true)
[[ "$WARN_COUNT" -eq 0 ]] && CLIPPY_SCORE=20

# Test check (20 pts)
cargo test 2>&1 | grep -q "test result: ok" && TEST_SCORE=20

TOTAL=$((FORMAT_SCORE + CLIPPY_SCORE + TEST_SCORE))
echo "Score: $TOTAL / 60"
EOF
chmod +x scripts/score.sh
```

**Bước 2: Tạo GOAL.md**

```markdown
# Goal: My Project - Improve Code Quality

## Fitness Function

./scripts/score.sh

## Operating Mode

- [x] **Converge** — Stop when target reached

Stop when:
- Score reaches 60/60
- 10 iterations with no improvement

## Action Catalog

| Action | Impact | How |
|--------|--------|-----|
| cargo fmt | +20 | `cargo fmt` |
| Fix clippy warnings | +20 | `cargo clippy --fix` |
| Add unit tests | +20 | Add tests for public functions |

## Constraints

1. Don't break existing functionality
2. Format before lint
3. One commit per change

## Iteration Log

File: `iterations.jsonl`
```

**Bước 3: Chạy**

```bash
./scripts/score.sh
# Score: 20 / 60

# Agent tự động thực thi các cải thiện
cargo fmt
./scripts/score.sh
# Score: 40 / 60

cargo clippy --fix
cargo fmt
./scripts/score.sh
# Score: 60 / 60
```

### 4.2 Ví Dụ Dự Án Hoàn Chỉnh

Cấu trúc file:

```
my-cli/
├── GOAL.md           # Định nghĩa mục tiêu
├── AGENTS.md         # Hướng dẫn agent
├── iterations.jsonl  # Log lặp
├── scripts/
│   └── score.sh      # Script chấm điểm
├── src/
│   └── ...
└── Cargo.toml
```

### 4.3 Định Dạng Log Lặp

Sau mỗi cải thiện, ghi lại vào `iterations.jsonl`:

```json
{"iteration":1,"component":"format","before":20,"after":40,"action":"cargo fmt"}
{"iteration":2,"component":"clippy","before":40,"after":60,"action":"cargo clippy --fix"}
```

### 4.4 Định Dạng Đầu Ra JSON

Script chấm điểm hỗ trợ `--json`:

```bash
./scripts/score.sh --json
# {"total":60,"max":60,"components":{"format":20,"clippy":20,"tests":20}}
```

### 4.5 Tự Động Nhận Diện Của Agent

Đặt `GOAL.md` và `CLAUDE.md` trong thư mục gốc dự án — agent sẽ tự động nhận diện và bắt đầu vòng lặp cải thiện.

---

## 5. Các Khuôn Mẫu Nâng Cao

### 5.1 Cộng Tác Đa Agent

Nhiều agent có thể cải thiện cùng một dự án đồng thời, chia sẻ trạng thái qua `iterations.jsonl`.

### 5.2 Các Thành Phần Tùy Chỉnh

Thêm bất kỳ thành phần chấm điểm nào:

```bash
# Safety check (10 pts)
UNSAFE_COUNT=$(grep -r "unsafe" src/ | wc -l)
[[ "$UNSAFE_COUNT" -eq 0 ]] && SAFETY_SCORE=10

# Documentation check (10 pts)
[[ -f "README.md" ]] && DOC_SCORE=$((DOC_SCORE + 5))
[[ -f "AGENTS.md" ]] && DOC_SCORE=$((DOC_SCORE + 5))
```

### 5.3 Xử Lý Timeout

```bash
# Ngăn script treo
TEST_OUTPUT=$(timeout 120 cargo test 2>&1 || true)
```

### 5.4 Kiểm Tra Sự Tồn Tại Của Công Cụ

```bash
if command -v cargo-tarpaulin &>/dev/null; then
    COVERAGE=$(cargo tarpaulin --out json | jq '.line_percent')
else
    COVERAGE=0
fi
```

---

## 6. Các Trường Hợp Sử Dụng

- **Cải thiện chất lượng mã** — Mode khuyến nghị Converge, ví dụ dọn dẹp cảnh báo Clippy
- **Tối ưu hóa hiệu năng** — Mode khuyến nghị Continuous, ví dụ tối ưu hóa liên tục Benchmark
- **Kiểm toán bảo mật** — Mode khuyến nghị Supervised, ví dụ rà soát mã nhạy cảm
- **Cải thiện tài liệu** — Mode khuyến nghị Converge, ví dụ viết README
- **Độ phủ test** — Mode khuyến nghị Converge, ví dụ thêm unit tests
- **Chuẩn hóa định dạng** — Mode khuyến nghị Converge, ví dụ định dạng mã

---

## 7. Bài Học Chính

1. **"Đưa AI một con số" thắng "đưa AI một danh sách kiểm tra."** Các cách tiếp cận truyền thống liệt kê mọi todo để AI thực thi từng cái — giới hạn sự sáng tạo của AI và ngăn việc ưu tiên tự chủ. GOAL.md định nghĩa "cái gì tốt hơn" bằng một con số (điểm), để AI tự khám phá con đường tối ưu. Nó giống như đưa cho một nhân viên thông minh một chỉ số KPI, chứ không phải một cuốn sổ tay vận hành.

2. **Vòng phản hồi là nền tảng của mọi hệ thống tự động.** Không có chúng, các hệ thống tự động không thể hoạt động — chúng không biết hành động của mình có hiệu quả hay không. Vòng lặp cải thiện của GOAL.md (đo → hành động → đo lại) xây vòng lặp này theo cách đơn giản nhất có thể. Trình biên dịch đóng vòng phản hồi về cú pháp, bộ test về hành vi, GOAL.md đóng nó về **chất lượng kiến trúc**.

3. **Tính tất định là nền tảng của lòng tin con người–AI.** Nếu script chấm điểm cho kết quả khác nhau mỗi lần chạy, agent không thể tin tưởng phản hồi của nó. GOAL.md yêu cầu Fitness Function tất định — không chỉ là yêu cầu kỹ thuật, mà là yêu cầu về lòng tin. Con người phải có khả năng dự đoán những gì AI nhìn thấy để tin tưởng các quyết định của nó.

4. **Ràng buộc hiệu quả hơn chỉ dẫn.** GOAL.md không bảo agent làm việc chính xác như thế nào — nó định nghĩa các ràng buộc (đừng phá chức năng hiện có, format trước lint). Ràng buộc cho AI tự do trong khi vẫn đảm bảo an toàn. Điều này khớp với trí tuệ quản lý con người: quản lý giỏi định nghĩa ranh giới, không vi quản lý.

5. **Sức mạnh của tối giản.** Phần lõi của GOAL.md chỉ là bốn thành phần: một script chấm điểm, một file mục tiêu, một danh mục hành động, và một log lặp. Không cấu hình phức tạp, không framework đồ sộ — chỉ những thứ thiết yếu. Sự tối giản này giúp GOAL.md được sử dụng ngay lập tức trong bất kỳ dự án nào.

6. **Sự dịch chuyển mô hình từ "viết mã" sang "cải thiện mã."** Lập trình hỗ trợ AI truyền thống tập trung vào "làm sao để AI viết mã tốt hơn"; GOAL.md tập trung vào "làm sao để AI cải thiện mã hiện có." Đây là một sự dịch chuyển tinh tế nhưng sâu sắc — codebase không bắt đầu từ con số không; giá trị của AI không chỉ là tạo mã mới, mà là liên tục cải thiện những gì đã tồn tại.

---

## References

- Kho lưu trữ AutoHarness: `https://github.com/gyc567/AutoHarness`
- Bài báo AutoHarness: `https://arxiv.org/abs/2603.03329`
- Hướng dẫn GOAL.md: `https://github.com/gyc567/AutoHarness/tree/main/docs/goal-md/tutorial-cn`
- Mẫu GOAL.md: `https://github.com/gyc567/AutoHarness/blob/main/template/GOAL.md`
