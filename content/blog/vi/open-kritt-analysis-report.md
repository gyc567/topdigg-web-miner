---
title: "open·kritt Phân Tích Sâu: Điều Phối AI Agents Để Tìm Lỗ Hổng Code Thực Sự"
description: "Phân tích chuyên sâu open·kritt, một nền tảng bảo mật AI mã nguồn mở phân rã các cuộc kiểm toán bảo mật phức tạp thành các tác vụ nhỏ và tập trung, chạy song song nhiều AI agents, và xuất ra các phát hiện bảo mật có thể khử trùng lặp, xếp hạng và xác minh. Tư duy cốt lõi của nền tảng đến từ kinh nghiệm săn tiền thưởng lỗ hổng thực tế, đã tích lũy hơn 1,5 triệu USD tiền thưởng. Bài viết bao gồm: tư duy cốt lõi, kiến trúc dự án, cài đặt cấu hình, hướng dẫn chi tiết, triết lý thiết kế, mô hình bảo mật, và tổng kết quan điểm."
date: "2026-08-08"
author: "TopDigg Research Team"
tags: ["open-kritt", "AI Security", "Vulnerability Detection", "Bug Bounty", "AI Agent", "Security Research", "Code Analysis"]
categories: ["Deep Dive"]
keywords: ["open-kritt", "AI Security", "Vulnerability Detection", "Bug Bounty", "AI Agent", "Security Research", "Code Analysis", "Workflow Orchestration", "Fuzzing"]
---

# open·kritt Phân Tích Sâu: Điều Phối AI Agents Để Tìm Lỗ Hổng Code Thực Sự

> Tư Duy Cốt Lõi: **open·kritt là một nền tảng nghiên cứu bảo mật AI mã nguồn mở, có tư duy cốt lõi là phân rã các cuộc kiểm toán bảo mật phức tạp thành các tác vụ nhỏ và tập trung, chạy song song nhiều AI agents, và xuất ra các phát hiện bảo mật có thể khử trùng lặp, xếp hạng và xác minh thông qua các workflow có cấu trúc.** Khác với cách tiếp cận thô bạo là đưa toàn bộ codebase cho AI model và yêu cầu nó "tìm lỗ hổng", open·kritt nhấn mạnh vào phân rã tác vụ và phân tích tập trung — giao cho một agent một tác vụ nhỏ và rõ ràng (như "phân tích một hàm cụ thể trong một file cụ thể") hiệu quả hơn nhiều so với việc让它 quét toàn bộ codebase. Tư duy này đến từ thực tiễn nghiên cứu bảo mật: Đội ngũ Kritt đã tích lũy được hơn **1,5 triệu USD** tiền thưởng lỗ hổng dưới tên săn tiền thưởng **Blockian**, và open·kritt là phiên bản mã nguồn mở của công cụ nội bộ của họ.

---

## 1. Giới Thiệu Dự Án

### 1.1 Nó Là Gì?

**open·kritt** là một **nền tảng nghiên cứu bảo mật AI tự lưu trữ, mã nguồn mở**, được sử dụng để điều phối các AI agents nhằm tìm ra các lỗ hổng code thực sự. Tư duy cốt lõi của nó là: thay vì đưa một model lớn cho toàn bộ codebase và hy vọng tìm được lỗi, hãy chia nhỏ nghiên cứu thành **các tác vụ nhỏ, được định nghĩa rõ ràng**, chạy song song nhiều AI agents, rồi kết hợp kết quả thành các phát hiện có thể xác minh và xếp hạng.

Nền tảng được phát triển bởi đội ngũ Kritt, với các thành viên Harel Rom (@harel-coffee) và Gabriel Balko (@GabiCtrlZ) cùng sở hữu và bảo trì. Nền tảng sử dụng **AGPL-3.0** làm giấy phép mã nguồn mở.

### 1.2 Dữ Liệu Quan Trọng

- GitHub: `https://github.com/Kritt-ai/open-kritt`
- Website: `https://kritt.ai`
- Tài liệu: `https://docs.kritt.ai`
- Giấy phép: **AGPL-3.0**
- Tech Stack: Frontend (React/Vite) + Backend (Express/Prisma/PostgreSQL) + Engine (Python/Codex hoặc Claude Code) + Docker
- CLI: `./kritt` (tích hợp sẵn trong repository, không cần cài đặt)

### 1.3 Cấu Trúc Dự Án

```
open-kritt/
├── backend/           # Express + Prisma REST API
├── frontend/          # React/Vite UI
├── engine/            # Engine thực thi scan (Python)
├── docs-site/         # Trang tài liệu Mintlify
├── database/          # Khởi tạo PostgreSQL
├── scripts/           # CLI scripts
├── kritt              # CLI tool tích hợp sẵn
└── docs/              # Tài liệu mô hình đe dọa bảo mật
```

---

## 2. Các Tính Năng Cốt Lõi

### 2.1 Workflows

Workflows là **bản thiết kế có thể tái sử dụng** — cấu trúc cây các prompt steps mà engine chạy theo thứ tự depth, truyền output của mỗi step cho step tiếp theo.

**Đặc điểm chính:**
- **Steps**: Mỗi step là một prompt + định dạng JSON output mong đợi
- **Depth**: Các steps được tổ chức theo depth; depth 0 là entry point, depth càng sâu task càng cụ thể
- **Multi-output**: Một step có thể tạo ra nhiều kết quả, feed vào các parallel tasks ở depth tiếp theo
- **Structured Output**: Mỗi step khai báo định dạng output (string/number/boolean/array/object), tất cả keys phải duy nhất toàn cục

### 2.2 Scans

Scan gắn workflow vào codebase mục tiêu:
- Hỗ trợ **remote repositories** (GitHub owner/repo + commit_sha) và **local repositories**
- Hỗ trợ cấu hình dependency repositories
- Hỗ trợ `repo_scope` có thể cấu hình để giới hạn phạm vi scan
- Hỗ trợ repeat runs (`repeat_runs`) để phân tích tích lũy

### 2.3 Post-scripts

Post-scripts là **các bước post-processing riêng cho từng finding**, chạy sau khi workflow hoàn thành, khử trùng lặp và xếp hạng:
- Xác minh findings
- Xây dựng proofs of concept (PoC)
- Viết báo cáo
- Thêm ratings, tags và metadata khác

### 2.4 Severity Rankers

Severity rankers là **các quy tắc Markdown** hướng dẫn model cách ưu tiên findings. Chúng có thể tùy chỉnh và điều chỉnh theo tiêu chuẩn phân loại lỗ hổng của dự án mục tiêu.

---

## 3. Tư Duy Cốt Lõi và Triết Lý Thiết Kế

### 3.1 Triết Lý Phân Rã Tác Vụ: Tác Vụ Nhỏ, Tập Trung > Tác Vụ Lớn, Mơ Hồ

Insight cốt lõi của open·kritt: **"Nếu bạn chỉ đạo AI vào toàn bộ codebase và yêu cầu nó 'tìm lỗ hổng', thường nó không làm được. Nhưng nếu bạn chỉ đạo nó vào một hàm trong một file và hỏi một câu hỏi tập trung, nó thường có thể."**

Triết lý này là nền tảng cho tất cả các quyết định kiến trúc của open·kritt:

1. **Phân Rã Workflow**: Chia các cuộc kiểm toán bảo mật phức tạp thành cây các steps có thứ tự depth tăng dần
2. **Thực Thi Song Song**: Mỗi depth có thể chạy nhiều tasks song song, tận dụng tối đa context windows
3. **Hiệu Quả Context**: Context windows của agents được sử dụng cho công việc phân tích thực sự, không phải điều hướng qua các codebase khổng lồ

### 3.2 Built-in Workflows

open·kritt đi kèm với hai workflows thực tiễn được cài sẵn:

#### External Flow Analysis

Đây là workflow mà đội ngũ đã sử dụng trong nghiên cứu thực tế, không phải ví dụ hướng dẫn. Nó theo dõi input được kiểm soát bên ngoài từ production entry points đến các hành vi nhạy cảm bảo mật cụ thể:

1. **Enumerate Entrypoints**: Quét codebase để xác định các entry points có thể truy cập từ bên ngoài và các handlers xử lý input được kiểm soát bởi kẻ tấn công
2. **Trace Reachable Flows**: Với mỗi entry point, liệt kê các production paths khác nhau về thực chất, bao gồm kết quả validation, ranh giới ủy quyền, thay đổi trạng thái, external calls và sensitive sinks
3. **Investigate Each Flow**: Giao cho mỗi downstream agent một reachable flow để xác minh. Nó chỉ trả về các lỗ hổng cụ thể có đường dẫn kẻ tấn công được hỗ trợ, hoặc một no-finding stub

> Chiến lược phân rã này tiết kiệm context: entry points và flows được map một lần, trong khi mỗi agent cuối cùng dành context window của nó cho một path cụ thể.

#### Cosmos ABCI Panic Halt Review

Nhắm vào các ứng dụng Cosmos dựa trên Go, nơi panic trong production ABCI path có thể làm dừng consensus:
1. **Enumerate ABCI Methods**: Chứng minh các ABCI methods và phase handlers nào được kết nối vào production application
2. **Investigate Panic Classes**: Fan out bốn reviews tập trung cho mỗi method có thể truy cập — explicit panics, arithmetic panics, nil pointer panics, và bounds/type panics

### 3.3 Tính Bắt Buộc Của Finding Schema

Step sâu nhất (terminal step) phải emit fixed **finding schema**, đảm bảo mọi finding đều nhất quán và có thể so sánh:
- `explanation`, `file_path`, `line`, `malicious_input_example`, `summary`
- `trigger_flow`, `vulnerability_type`, `malicious_actor`
- Tùy chọn `exploitable`

Ràng buộc bắt buộc này đảm bảo tất cả findings có thể được xử lý đồng nhất, khử trùng lặp và xếp hạng.

### 3.4 Ưu Tiên Self-Hosted

open·kritt rõ ràng chọn **self-hosted** làm phương thức triển khai mặc định và được khuyến nghị:
- Người dùng sở hữu infrastructure, data và credentials của riêng mình
- Hỗ trợ Codex login (khuyến nghị), OpenAI API Key, Anthropic API Key hoặc OpenRouter
- Backend không bao gồm application-level authentication theo mặc định — người dùng phải tự thêm vào network layer

---

## 4. Hướng Dẫn Cài Đặt và Cấu Hình Chi Tiết

### 4.1 Yêu Cầu Tiên Quyết

- Git
- Docker Desktop hoặc Docker Engine + Docker Compose plugin
- Node.js 20 hoặc cao hơn (chỉ cho CLI)
- Model access credentials (Codex login khuyến nghị, hoặc API Key)

### 4.2 Cài Đặt Nhanh

```bash
# 1. Clone repository
git clone https://github.com/Kritt-ai/open-kritt && cd open-kritt

# 2. Chạy CLI setup tương tác
./kritt

# 3. Khởi động full stack
./kritt start
```

Sau khi khởi động, truy cập http://localhost:5173 để mở giao diện frontend.

### 4.3 Cấu Hình Model Access

| Tùy chọn | Mô tả |
|----------|-------|
| **Codex Login** (khuyến nghị) | Sử dụng quyền truy cập đăng ký ChatGPT/Codex đủ điều kiện thông qua guided device flow |
| `OPENAI_API_KEY` | Sử dụng OpenAI Platform API Key + Codex harness |
| `ANTHROPIC_API_KEY` | Sử dụng Claude Code + Anthropic API billing |
| `OPENROUTER_API_KEY` | Route các model tương thích qua OpenRouter |

`GITHUB_TOKEN` là tùy chọn và chỉ cần khi cần clone các private GitHub repositories hoặc dependencies của chúng.

### 4.4 Cấu Hình Docker Thủ Công

```bash
# Copy template biến môi trường
cp .env.example .env
chmod 600 .env

# Đặt một Provider credential trong .env:
# OPENAI_API_KEY, CODEX_API_KEY, ANTHROPIC_API_KEY, hoặc OPENROUTER_API_KEY

# Tạo các thư mục cần thiết
mkdir -p .data/codex
chmod 700 .data/codex

# Khởi động
docker compose up --build
```

### 4.5 Tải Dữ Liệu Mẫu

```bash
docker compose exec backend npm run seed
```

Dữ liệu mẫu là bổ sung và idempotent, giữ nguyên dữ liệu hiện có.

---

## 5. Hướng Dẫn Toàn Diện Scan Đầu Tiên

### 5.1 Tạo Workflow

1. Mở **Workflows → New workflow**
2. Chọn **Blank workflow**, đặt tên và thêm mô tả
3. Thêm các steps:

**Depth 0 - Enumerate (Entry Point)**
- Tên: `Enumerate Entrypoints`
- Nội dung: Xác định tất cả các entry points có thể truy cập từ bên ngoài trong codebase này (HTTP routes, API endpoints, user input handling functions)
- Output format: `endpoints` (array)
- Check **Multi-output**

**Depth 1 - Analyze (Analysis)**
- Tên: `Analyze Endpoint`
- Nội dung: Phân tích entry point `{{endpoint}}`, xác định các điểm injection có thể, data flows và các hoạt động nhạy cảm bảo mật
- Output format: `findings` (array), mỗi finding chứa `vulnerability_type`, `file_path`, `line`, v.v.
- Tham chiếu các keys từ depth 0: `{{endpoint}}`

**Depth 2 - Terminal**
- Tên: `Document Finding`
- Nội dung: Ghi lại chi tiết lỗ hổng được phát hiện, cung cấp đường dẫn tấn công và proof of concept
- Output format: Phải bao gồm tất cả các required finding schema keys

### 5.2 Tạo Post-script

1. Mở **Post-scripts → New post-script**
2. Chọn **Blank post-script**
3. Ví dụ nội dung:

```
Đánh giá finding "{{summary}}" - một {{vulnerability_type}} tại {{file_path}}:{{line}}.

Trả về:
- severity (string): CRITICAL, HIGH, MEDIUM, hoặc LOW
- confidence (string): HIGH, MEDIUM, hoặc LOW
- recommendation (string): Khuyến nghị sửa chữa
```

### 5.3 Tạo Severity Ranker

1. Mở **Severity Rankers → New ranker**
2. Viết các quy tắc Markdown định nghĩa cách các loại lỗ hổng và context ánh xạ đến các mức độ nghiêm trọng

### 5.4 Chạy Scan

1. Mở **Scans → New scan**
2. Chọn workflow
3. Đặt target: remote (GitHub owner/repo) hoặc local
4. Chọn model, provider và harness
5. Attach post-scripts và rankers
6. Submit và khởi động

### 5.5 Xem Kết Quả

Sau khi scan hoàn thành, mở bất kỳ finding nào để xem báo cáo đầy đủ, proof of concept và output của post-script.

---

## 6. Mô Hình Bảo Mật và Phân Tích Đe Dọa

### 6.1 Ranh Giới Tin Cậy

| Component | Role | Trust Level |
|-----------|------|-------------|
| Frontend | UI (React/Vite) | Operator-facing |
| Backend | REST API + Postgres (Express/Prisma) | Operator-facing, **mặc định không có authentication** |
| Database | PostgreSQL — workflows, scans, findings | Trusted store |
| Engine | Claims scans, checks out repos, runs harnesses | **Phân tích code và prompts không đáng tin cậy** |
| executor-view | Read-only view | Operator-facing |

### 6.2 Các Đe Dọa Chính và Biện Pháp Giảm Thiểu

#### 1. Code Không Đáng Tin Cậy và Prompt Injection

Engine phân tích code do kẻ tấn công kiểm soát; các repositories có thể chứa nội dung được thiết kế để thao túng agents (prompt injection).

**Biện pháp giảm thiểu:**
- Mỗi job có tools enabled chạy trong một container dùng một lần
- Containers có các thư mục checkout per-job có thể ghi và job homes đã copy
- Jobs không mount Docker socket, database, project `.env`, hoặc các jobs khác
- Harness output là JSON có schema-constrained
- Các lệnh tạo draft tắt model tools, user rules/settings và session persistence

#### 2. Rò Rỉ Secrets

Các agents bị xâm nhập/Injection có thể cố đọc credentials hoặc gửi dữ liệu.

**Biện pháp giảm thiểu:**
- Secrets được giữ trong `.env` và các credential stores của provider (cả hai đều được gitignore)
- Ưu tiên sử dụng `GITHUB_TOKEN` **hẹp và có thời hạn ngắn** (chỉ đọc, chỉ các repos cần thiết)
- Luân chuyển provider keys định kỳ
- Scan runners có **quyền truy cập internet outbound trực tiếp theo mặc định** (để agents nghiên cứu, cài đặt tools, lấy dependencies)

#### 3. Egress Dữ Liệu Đến Model Providers

Scanning gửi code đến các endpoint bên ngoài theo mặc định.

**Biện pháp giảm thiểu:**
- Hiểu dữ liệu đi đâu trước khi scan code nhạy cảm
- Chọn các model endpoints có cách xử lý dữ liệu phù hợp với độ nhạy cảm của code
- Xem xét các điều khoản lưu giữ dữ liệu của provider

#### 4. API Không Có Authentication Được Tiếp Cận

`/api/*` **không có authentication theo mặc định**.

**Biện pháp giảm thiểu:**
- Không bind đến các interface công cộng
- Đặt authentication/authorization proxy của riêng bạn trước backend API và UI
- Áp dụng authentication, network controls và rate limits ở proxy layer

### 6.3 Checklist Triển Khai Bảo Mật

- [ ] Chạy complete stack trên **VM hoặc Docker host chuyên dụng**
- [ ] Thêm host-level egress controls nếu direct internet access không phù hợp với policy của bạn
- [ ] Đặt **authentication trước** backend API và UI
- [ ] Sử dụng `GITHUB_TOKEN` **tối thiểu, có thời hạn ngắn**; luân chuyển provider keys
- [ ] Chọn các model endpoints có **data handling** phù hợp với độ nhạy cảm của code
- [ ] Giữ `.env` và `.data/` credential stores ở chế độ private; không bao giờ commit chúng

---

## 7. Các Insights và Kết Luận Chính

### 7.1 Các Insights Cốt Lõi

**Insight 1: Phân Rã Tác Vụ Là Chìa Khóa Cho Nghiên Cứu Bảo Mật AI**

Insight quan trọng nhất của open·kritt là việc phân rã các cuộc kiểm toán bảo mật phức tạp thành các tác vụ nhỏ, tập trung hiệu quả hơn nhiều so với việc cố gắng giải quyết toàn bộ vấn đề bằng một model lớn. Điều này phù hợp với cách các nhà nghiên cứu bảo mật con người thực sự làm việc — các chuyên gia không审视 toàn bộ codebase cùng một lúc; họ tập trung vào các entry points cụ thể, data flows và functions.

**Insight 2: Structured Output Thực Thi Chất Lượng Finding**

Yêu cầu mọi terminal step emit fixed finding schema (với các required keys) đảm bảo tất cả findings có thể được xử lý đồng nhất, khử trùng lặp và xếp hạng. Đây là một thực hành quan trọng để kiểm soát chất lượng output AI.

**Insight 3: Self-Hosting Là Nền Tảng Của Tin Cậy**

Sự lựa chọn self-hosted làm phương thức triển khai mặc định của open·kritt phản ánh sự hiểu biết sâu sắc về bảo mật code — người dùng cần kiểm soát dữ liệu, credentials và infrastructure của họ. Đây không phải là một tính năng bị thiếu; đó là một quyết định thiết kế có chủ đích.

**Insight 4: Kinh Nghiệm Bug Bounty Thực Tế Thúc Đẩy Thiết Kế Sản Phẩm**

open·kritt không phải là một dự án lý thuyết. Nó đến từ nghiên cứu bảo mật thực tế, với các thành viên đội ngũ đã kiếm được hơn 1,5 triệu USD tiền thưởng bug bounty dưới tên Blockian. Các workflows được tích hợp sẵn phản ánh các thực hành nghiên cứu bảo mật thực tế, không phải ví dụ hướng dẫn.

**Insight 5: Cân Bằng Giữa Bảo Mật và Chức Năng**

Thiết kế của open·kritt cân bằng giữa bảo mật và chức năng — các agents cần internet access để cài đặt tools và nghiên cứu targets, nhưng nền tảng cung cấp các cơ chế cô lập và giám sát. Đây là một sự cần thiết thực tế khi xử lý code không đáng tin cậy.

### 7.2 Các Trường Hợp Sử Dụng

- **Nhà Nghiên Cứu Bảo Mật**: Tích hợp AI vào quy trình nghiên cứu mà không từ bỏ quyền kiểm soát prompts, data hoặc models
- **Lập Trình Viên Có Ý Thức Bảo Mật**: Nhận hỗ trợ AI để viết và kiểm toán code bảo mật
- **Thợ Săn Bug Bounty**: Hệ thống hóa quy trình phát hiện lỗ hổng để tăng hiệu quả
- **Đội Ngũ Bảo Mật**: Thực hiện kiểm toán bảo mật liên tục trên các codebase nội bộ

### 7.3 Hạn Chế

- Không có application-level authentication theo mặc định; người dùng phải tự thêm
- Phụ thuộc vào các model providers bên ngoài; tồn tại nguy cơ data egress
- Yêu cầu Docker infrastructure; có thể tăng độ phức tạp cho một số người dùng
- Scanning code không đáng tin cậy đòi hỏi môi trường cô lập chuyên dụng

### 7.4 Kết Luận

open·kritt là một nền tảng trưởng thành áp dụng điều phối AI agents cho nghiên cứu bảo mật. Giá trị cốt lõi của nó nằm ở:

1. **Phương Pháp Phân Rã Tác Vụ**: Biến các kiểm toán phức tạp thành các tác vụ có thể quản lý và tập trung
2. **Xác Thực Thực Tế**: Đến từ kinh nghiệm bug bounty thực tế
3. **Kiểm Soát Self-Hosted**: Người dùng sở hữu dữ liệu và infrastructure
4. **Structured Finding Output**: Kết quả có thể xác minh, xếp hạng và hành động

Đối với các đội ngũ và cá nhân nghiêm túc về bảo mật code, open·kritt cung cấp một giải pháp vừa thực tế vừa có nguyên tắc. Triết lý thiết kế của nó — phân rã tác vụ tập trung, output có cấu trúc và kiểm soát self-hosted — đại diện cho các thực hành tốt nhất của nghiên cứu bảo mật được hỗ trợ bởi AI.

---

## 8. Tài Liệu Tham Khảo

- Repository Dự Án: https://github.com/Kritt-ai/open-kritt
- Tài Liệu Chính Thức: https://docs.kritt.ai
- Website: https://kritt.ai
- Bài Nghiên Cứu: https://kritt.ai/open-kritt-launch
- Cộng Đồng Discord: https://discord.gg/kritt
- X (Twitter): https://x.com/Kritt_AI
- Mô Hình Đe Dọa: https://github.com/Kritt-ai/open-kritt/blob/main/docs/threat-model.md
- Hồ Sơ Bug Bounty (Blockian): https://immunefi.com/profile/Blockian/
