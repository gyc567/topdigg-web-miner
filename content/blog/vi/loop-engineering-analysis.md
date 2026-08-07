---
title: "Loop Engineering Đi Sâu: Ngừng Nhắc — Thiết Kế Vòng Lặp Chạy AI Agent Của Bạn Một Cách Tự Động"
description: "Bài phân tích toàn diện về Loop Engineering — framework kỹ thuật vòng lặp AI agent của Cobus Greyling. Ý tưởng cốt lõi: bạn không cần nhắc AI nữa. Bạn cần thiết kế một hệ thống tự động nhắc AI. Bao gồm 5 khối xây dựng (Automations/Schedule, Worktrees, Skills, Plugins/Connectors, Sub-agents) + Memory/State, 7 khuôn mẫu sản xuất (Daily Triage, PR Babysitter, CI Sweeper, Dependency Sweeper, Changelog Drafter, Post-Merge Cleanup, Issue Triage), sự tự chủ tiến bộ từ L1 chỉ báo cáo đến L2 sửa có hỗ trợ đến L3 không người trông, và một hệ sinh thái công cụ đầy đủ (loop-audit/loop-init/loop-cost/loop-sync/loop-context/loop-worktree/loop-gate/loop-sandbox/loop-swarm). Bao quát ý tưởng cốt lõi, triết lý thiết kế, hướng dẫn đầy đủ và danh mục tính năng."
date: "2026-08-04"
author: "TopDigg Research Team"
tags: ["Loop Engineering", "AI Agent", "Automation", "Grok", "Claude Code", "Codex", "MCP", "DevTools", "Prompt Engineering"]
categories: ["Deep Dive"]
keywords: ["Loop Engineering", "AI agent", "loop engineering", "tự động hóa", "Grok", "Claude Code", "Codex", "MCP", "skills", "worktrees", "triage", "sự tự chủ"]
---

# Loop Engineering Đi Sâu: Ngừng Nhắc — Thiết Kế Vòng Lặp Chạy AI Agent Của Bạn Một Cách Tự Động

> Ý tưởng cốt lõi: **Bạn không cần nhắc AI nữa. Bạn cần thiết kế một hệ thống tự động nhắc AI.** Peter Steinberger nói: "Bạn không nên nhắc coding agent của mình nữa. Bạn nên kỹ thuật các vòng lặp nhắc agent của bạn." Boris Cherny (trưởng nhóm Claude Code của Anthropic): "Tôi không nhắc Claude nữa. Tôi có các vòng lặp đang chạy để nhắc Claude và quyết định việc cần làm. Công việc của tôi là viết vòng lặp." Loop Engineering là framework kỹ thuật vòng lặp AI agent của Cobus Greyling — phần lõi của nó là **5 khối xây dựng** (Automations/Schedule, Worktrees, Skills, Plugins/Connectors, Sub-agents) + **Memory/State**, đi kèm 7 khuôn mẫu sản xuất và sự tự chủ tiến bộ từ L1 đến L3, biến AI agent từ "cần con người nhắc" thành "hệ thống tự chạy."

---

## 1. Tổng Quan Dự Án

### 1.1 Nó Là Gì?

**Loop Engineering** là một **framework kỹ thuật vòng lặp AI agent** — nó không dạy bạn cách viết prompt tốt hơn, mà dạy cách thiết kế một hệ thống khiến AI agent chạy một cách tự động. Định vị cốt lõi: **sự dịch chuyển mô hình từ "prompt engineering" sang "loop engineering."**

### 1.2 Sự Thật Chính

- Kho lưu trữ: `https://github.com/cobusgreyling/loop-engineering`
- Website: `https://cobusgreyling.github.io/loop-engineering/`
- Số sao: **9.838**
- Số fork: **1.335**
- Giấy phép: **MIT**
- Ngôn ngữ: **JavaScript**
- Tác giả: **Cobus Greyling**
- Ngày tạo: 2026-06-09
- Hệ sinh thái: memory-engineering → loop-engineering → harness-foundry → outerloop → fleet-engineering

### 1.3 Nó Giải Quyết Vấn Đề Gì?

Cơn đau của phát triển hỗ trợ AI truyền thống: bạn viết prompt thủ công mỗi lần, AI không nhớ nó đã làm gì lần trước, không có vòng phản hồi chất lượng, và bạn không thể an toàn để AI tự sửa mã. Câu trả lời của Loop Engineering: **thiết kế một hệ thống vòng lặp** — định nghĩa tần suất, logic phân loại, lưu trữ trạng thái, thực thi cô lập, và các cổng kiểm chứng, để AI agent chạy tự động bên trong các vòng lặp bạn thiết kế.

---

## 2. Ý Tưởng Cốt Lõi

### 2.1 Từ "Prompt Engineering" Đến "Loop Engineering"

Truyền thống: con người viết prompt → AI thực thi → con người kiểm tra → con người viết prompt khác. Loop Engineering: con người thiết kế vòng lặp → vòng lặp tự động nhắc AI → AI thực thi tự động → vòng lặp tự kiểm chứng → vòng lặp tự ghi lại. **Con người chuyển từ "người nhắc" sang "người thiết kế hệ thống."**

### 2.2 5 Khối Xây Dựng + Memory

- **Automations/Schedule**: phát hiện và phân loại theo tần suất
- **Worktrees**: thực thi song song an toàn
- **Skills**: kiến thức dự án bền vững
- **Plugins/Connectors**: kết nối với các công cụ thật (MCP)
- **Sub-agents**: tách người tạo/người kiểm
- **+ Memory/State**: xương sống bền vững vượt ra ngoài cuộc trò chuyện

### 2.3 Bảy Khuôn Mẫu Sản Xuất

- **Daily Triage**: tần suất 1d-2h, L1 chỉ báo cáo, chi phí token thấp
- **PR Babysitter**: tần suất 5-15 phút, L1 giám sát, chi phí token cao
- **CI Sweeper**: tần suất 5-15 phút, L2 sửa thận trọng, chi phí token rất cao
- **Dependency Sweeper**: tần suất 6h-1d, L2 chỉ vá, chi phí token trung bình
- **Changelog Drafter**: tần suất 1d hoặc theo tag, L1 soạn thảo, chi phí token thấp
- **Post-Merge Cleanup**: tần suất 1d-6h, L1 ngoài giờ cao điểm, chi phí token thấp
- **Issue Triage**: tần suất 2h-1d, L1 chỉ đề xuất, chi phí token thấp

### 2.4 Tự Chủ Tiến Bộ: L1 → L2 → L3

- **L1 Chỉ báo cáo**: AI chỉ báo cáo phát hiện, không tự sửa (quy tắc tuần đầu)
- **L2 Sửa có hỗ trợ**: AI thử sửa trong các worktree cô lập, cần xác nhận của bộ kiểm chứng
- **L3 Không người trông**: AI tự sửa và tự merge, cần ngân sách và các cổng chặn

### 2.5 Điểm Sẵn Sàng Của Vòng Lặp

`loop-audit` chấm điểm hệ thống vòng lặp của bạn từ 0-100, cho bạn biết những gì cần cải thiện. Điểm ≥ 80 → được khuyến nghị đóng gói phiên bản thành một runtime stack harness-foundry.

---

## 3. Triết Lý Thiết Kế

### 3.1 "Thiết Kế Hệ Thống, Không Phải Prompt"

Boris Cherny nói: "Công việc của tôi là viết vòng lặp." Điều này nghĩa là giá trị của một kỹ sư AI không còn là viết prompt tốt hơn, mà là thiết kế hệ thống điều khiển tốt hơn. Loops có thể tái sử dụng, quản lý phiên bản, kiểm toán được — prompts là thứ dùng một lần rồi bỏ.

### 3.2 "Tuần Đầu: Chỉ Báo Cáo, Không Sửa"

Trong tuần đầu của một hệ thống mới, AI chỉ được báo cáo phát hiện, không bao giờ tự sửa. Điều này cho con người đủ thời gian hiểu hành vi của vòng lặp, xây lòng tin, rồi dần cấp thêm quyền hạn.

### 3.3 "Memory Là Xương Sống Vượt Ra Ngoài Cuộc Trò Chuyện"

Không có memory, AI agent bắt đầu từ con số không mỗi cuộc trò chuyện. Loop Engineering cho AI agent bộ nhớ bền vững xuyên phiên qua STATE.md, loop-budget.md, và các file khác.

### 3.4 "Kiểm Chứng Có Giá Trị Hơn Tạo Sinh"

Mỗi vòng lặp có một sub-agent kiểm chứng — nó không tin đầu ra của sub-agent tạo sinh, mà kiểm chứng độc lập. Sự tách người tạo/người kiểm này là nền tảng của sự tự chủ an toàn.

### 3.5 "Lòng Tin Tiến Bộ"

L1 → L2 → L3 không phải một nâng cấp kỹ thuật, mà là một nâng cấp lòng tin. Mỗi bước cần xác nhận của con người rằng hệ thống xứng đáng nhiều quyền tự chủ hơn.

---

## 4. Hướng Dẫn Đầy Đủ

### 4.1 Bắt Đầu Nhanh Năm Phút

**Bước 1: Chọn điểm đau của bạn**

Không chắc nên dùng khuôn mẫu nào? Bộ chọn tương tác: `https://cobusgreyling.github.io/loop-engineering/#interactive`

Hoặc bắt đầu với Daily Triage — rủi ro thấp, học kỷ luật vòng lặp.

**Bước 2: Tạo khung trong repo của bạn**

```bash
# CLI hợp nhất (khuyến nghị)
npx @cobusgreyling/loop init . --pattern daily-triage --tool grok

# Kiểm tra sức khỏe một lần (audit + sync + 3 hành động đầu)
npx @cobusgreyling/loop doctor .
```

Các công cụ được hỗ trợ: `grok` (mặc định), `claude`, `codex`, `opencode`. `cursor`, `windsurf`, `openclaw` cần sao chép thủ công.

**Bước 3: Kiểm tra chi phí**

```bash
npx @cobusgreyling/loop cost --pattern daily-triage --level L1 --cadence 1d
```

**Bước 4: Kiểm toán mức sẵn sàng**

```bash
npx @cobusgreyling/loop doctor .
```

Điểm 0-100 kèm các đề xuất cải thiện cụ thể. Điểm ≥ 80 → đóng gói phiên bản thành harness-foundry.

**Bước 5: Chạy vòng lặp đầu tiên của bạn — chỉ báo cáo**

Grok:
```bash
/loop 1d Run loop-triage. Update STATE.md. No auto-fix in week one.
```

Claude Code:
```bash
/loop 1d Run $loop-triage. Read STATE.md. Merge findings into High Priority and Watch List. Update Last run. Do not edit code.
```

**Bước 6: Đọc đầu ra, commit trạng thái**

Mở `STATE.md`. Vòng lặp có nắm được các ưu tiên thực sự không? Sửa những phần sai — bạn vẫn là kỹ sư.

### 4.2 L2: Các Lần Thử Sửa Cô Lập

```bash
# Tạo worktree cô lập cho một lần thử sửa
npx @cobusgreyling/loop-worktree create --run-id pr-217-fix-1 --pattern pr-babysitter

# Bộ kiểm chứng bác bỏ — đánh dấu để dọn dẹp
npx @cobusgreyling/loop-worktree mark --run-id pr-217-fix-1 --status rejected

# Dọn dẹp các worktree bị bác bỏ/nâng cấp cũ hơn 24h
npx @cobusgreyling/loop-worktree cleanup --older-than 24h
```

### 4.3 Circuit Breakers (L2+)

```bash
npx @cobusgreyling/loop context --check --ledger loop-ledger.json
# Exit 0 = tiếp tục · Exit 2 = chuyển lên con người
```

Các trình kích hoạt: vượt số lần lặp tối đa, cùng một lỗi N lần, quá nhiều lỗi liên tiếp, chạm trần ngân sách token.

### 4.4 Cấu Hình Gate

Tạo `gate.yaml` trong thư mục gốc repo:

```yaml
version: 1
denylist:
  - "src/auth/**"
  - "**/*.env"
autoMergeAllowlist:
  - "docs/**"
  - "**/*.md"
```

```bash
npx @cobusgreyling/loop gate check --action auto-merge --paths <f1,f2,...>
# Exit 0 = được phép · Exit 2 = chuyển lên con người
```

---

## 5. Hệ Sinh Thái Công Cụ

- **loop**: CLI hợp nhất làm điểm vào (init/doctor/status/audit/cost)
- **loop-audit**: CLI chấm điểm sẵn sàng vòng lặp (0-100)
- **loop-init**: tạo khung + ngân sách/log chạy + ràng buộc
- **loop-cost**: công cụ ước tính mức tiêu thụ token
- **loop-sync**: phát hiện lệch STATE.md ↔ LOOP.md
- **loop-context**: trình quản lý bộ nhớ trạng thái + circuit breakers
- **loop-mcp-server**: tra cứu runtime MCP (patterns/skills/state)
- **loop-worktree**: git worktree cô lập cho mỗi lần thử sửa
- **loop-gate**: thực thi danh sách chặn đường dẫn + danh sách cho phép auto-merge
- **loop-sandbox**: cô lập worktree tạm thời + chụp patch
- **loop-action**: GitHub Composite Action để chạy vòng lặp trong CI
- **loop-swarm**: sandbox đồng thuận đa agent (N lần chạy tuần tự, đa số phải đạt)

---

## 6. Bài Học (Hiểu Biết Chính & Kết Luận)

1. **"Viết vòng lặp" có đòn bẩy hơn "viết prompt."** Prompts là thứ dùng một lần — loops là hệ thống có thể tái sử dụng, quản lý phiên bản, và kiểm toán được. Boris Cherny nói "công việc của tôi là viết vòng lặp," báo hiệu sự dịch chuyển từ người nhắc sang người thiết kế hệ thống.

2. **Lòng tin tiến bộ là con đường an toàn duy nhất đến sự tự chủ.** L1 → L2 → L3 là một nâng cấp lòng tin, không phải kỹ thuật. Tuần đầu chỉ báo cáo, tuần hai thử sửa, tuần ba cân nhắc không người trông. Cách tiếp cận tiến bộ này cho con người cơ hội kiểm chứng ở mỗi bước.

3. **Memory là "xương sống" của AI agent.** Không có memory, AI agent bắt đầu từ con số không mỗi cuộc trò chuyện. Loop Engineering cho agent bộ nhớ bền vững xuyên phiên qua STATE.md, loop-budget.md, và các file khác.

4. **Bộ kiểm chứng là nền tảng của lòng tin.** Mỗi vòng lặp có sub-agent tạo sinh và sub-agent kiểm chứng — bộ kiểm chứng không tin đầu ra của bộ tạo sinh, mà kiểm chứng độc lập. Sự tách người tạo/người kiểm này là cơ sở cho sự tự chủ an toàn.

5. **Chi phí token là một ràng buộc thực sự.** Các vòng lặp tần suất cao (như CI Sweeper mỗi 5 phút) tiêu thụ token nhanh chóng. Loop Engineering khiến chi phí token hiện hữu và quản lý được qua công cụ ước tính loop-cost và các file loop-budget.

6. **Tư duy hệ sinh thái.** Loop Engineering không phải một công cụ cô lập — nó là một phần của hệ sinh thái memory → loop → foundry → outerloop → fleet. Mỗi lớp giải quyết một chiều khác nhau: memory, khuôn mẫu, runtime, quản trị, swarm.

---

## References

- Kho lưu trữ: `https://github.com/cobusgreyling/loop-engineering`
- Website: `https://cobusgreyling.github.io/loop-engineering/`
- Bài viết gốc: `https://cobusgreyling.substack.com/p/loop-engineering`
- Bình luận của Addy Osmani: `https://addyosmani.com/blog/loop-engineering/`
- Bắt đầu nhanh: `https://github.com/cobusgreyling/loop-engineering/blob/main/docs/QUICKSTART.md`
- Sổ đăng ký khuôn mẫu: `https://github.com/cobusgreyling/loop-engineering/blob/main/patterns/registry.yaml`
