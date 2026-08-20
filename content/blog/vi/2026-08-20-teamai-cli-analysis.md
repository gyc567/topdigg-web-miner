---
title: "TeamAI CLI Phân Tích Sâu: Kiến Trúc Git-Native Của Tencent Để Thống Nhất Cộng Tác Đội Agent Đa Nền Tảng"
date: "2026-08-20"
description: "TeamAI là công cụ Agent Harness mã nguồn mở của Tencent, quản lý skills, rules và kiến thức theo phương thức Git-native, cho phép cộng tác đội Agent đa nền tảng (Claude Code/Codex/CodeBuddy/v.v.). Bài viết này phân tích toàn diện triết lý thiết kế, kiến trúc, các lệnh cốt lõi và hướng dẫn chi tiết."
tags:
  - TeamAI
  - Agent Harness
  - AI Agent
  - Git
  - Claude Code
  - Tencent
  - Cộng Tác Đa Agent
  - Quản Lý Kiến Thức Đội
  - MCP
categories:
  - Phân Tích Sâu
---

# TeamAI CLI Phân Tích Sâu: Kiến Trúc Git-Native Của Tencent Để Thống Nhất Cộng Tác Đội Agent Đa Nền Tảng

> Make every AI coding agent work by the same harness.
> (Làm cho mọi AI coding agent đều hoạt động trên cùng một harness.)

---

## Một. Tổng Quan Dự Án: Để Mỗi AI Agent Đều Dùng Chung Một "Hệ Thống Điều Khiển"

### 1.1 Agent Harness Là Gì?

Trong bối cảnh AI Agent, "Harness" (hệ thống điều khiển/giáp gắn) chỉ **lớp middleware runtime bao quanh mô hình ngôn ngữ lớn**, có nhiệm vụ biến một LLM "chỉ biết nói" thành một Agent "thực sự làm được việc" đáng tin cậy.

Tương tác LLM truyền thống theo mô hình **yêu cầu - phản hồi** — bạn hỏi, nó trả lời, xong là hết. Nhưng một AI Agent thực sự cần:

- **Lập kế hoạch (Plan)**: phân rã nhiệm vụ phức tạp thành các bước có thể thực thi
- **Hành động (Act)**: gọi tool, thực thi mã, đọc/ghi file
- **Quan sát (Observe)**: thu thập kết quả thực thi, hình thành vòng phản hồi

Harness chính là bộ khung runtime kết nối ba yếu tố này. Các sản phẩm AI Agent khác nhau (Claude Code, Codex, CodeBuddy, WorkBuddy...) đều đóng gói Harness riêng, nhưng kỹ năng, quy tắc và kiến thức đội nhóm bên trong thường nằm rải rác, không thể tái sử dụng chéo.

### 1.2 Định Vị Của TeamAI

**Triết lý cốt lõi của TeamAI**: Make every AI coding agent work by the same harness.

Nghĩa là, bất kể đội dùng sản phẩm Agent nào, đều nên chia sẻ chung một bộ:

- **Kỹ năng (Skills)**: gói năng lực chuyên môn của Agent
- **Quy tắc (Rules)**: quy chuẩn coding và ràng buộc quy trình của đội
- **Tài liệu (Docs)**: kho tri thức chia sẻ
- **Biến môi trường (Env)**: khóa bí mật và cấu hình

Sợi dây kết nối tất cả những thứ này, chính là thứ mà mỗi đội kỹ thuật đều đã quen thuộc — **Git**.

---

## Hai. Triết Lý Thiết Kế Cốt Lõi

### 2.1 Git Là Phương Tiện Quản Lý Kiến Thức Đội Tốt Nhất

Đây là triết lý thiết kế cốt lõi nhất của TeamAI: **dùng Git để quản lý kiến thức đội của AI Agent, thay vì xây dựng một hệ thống hoàn toàn mới.**

Tại sao chọn Git? Bởi vì Git vốn đã giải quyết các vấn đề cốt lõi của cộng tác đội nhóm:

| Khái niệm Git | Khả năng tương ứng của TeamAI |
|---------------|-------------------------------|
| Remote repository (Kho chứa từ xa) | Kho kiến thức chia sẻ của đội |
| Branch (Nhánh) | Thử nghiệm cá nhân hoặc kỹ năng chuyên biệt |
| Merge Request (MR) | Cơ chế review của đội |
| Pull/Push | Đồng bộ kiến thức |
| Lịch sử Commit | Quỹ đạo tiến hóa của tri thức |
| Rollback | Khôi phục nhanh tri thức lỗi |

Điều này có nghĩa: việc triển khai TeamAI **không đòi hỏi thay đổi quy trình Git hiện tại của đội**, không cần cơ sở dữ liệu hay dịch vụ bổ sung, không cần triển khai thêm bất cứ thứ gì.

### 2.2 Tư Duy Không Cần Hạ Tầng (Zero-Infrastructure)

Quản lý kiến thức đích thực nên có chi phí bảo trì bằng không. TeamAI không phụ thuộc bất kỳ dịch vụ nào:

- **Lưu trữ**: dùng trực tiếp kho Git
- **Chỉ mục tìm kiếm**: cục bộ `search-index.json`, xây dựng theo nhu cầu
- **Xác thực**: tận dụng xác thực nền tảng Git (GitHub gh CLI / TGit / CNB)

Điều này khác biệt về bản chất so với các phương án truyền thống:

- **So với giải pháp vector database**: không cần triển khai dịch vụ vector database, không cần quản lý pipeline embedding
- **So với giải pháp rule engine**: quy tắc được lưu trực tiếp dưới dạng file YAML, có thể review trong MR, có thể `git blame`
- **So với kho tri thức tập trung**: không cần duy trì hệ thống tài liệu tập trung, mỗi đội có thể fork và tùy biến

### 2.3 Kiến Thức Đến Từ Ma Sát (Friction-Driven Learning)

TeamAI cho rằng: **tri thức có giá trị nhất đến từ những khoảnh khắc ma sát**.

Khi Agent gặp phải các tình huống sau trong quá trình thực thi, thường ẩn chứa kinh nghiệm quý giá nhất của đội:

- Lệnh gọi tool bị từ chối (Denied tool calls)
- Tool thất bại rồi thử lại (Failing tools retried)
- Con người sửa lỗi (Corrections)
- Thực thi bị ngắt (Interrupts)

Stop Hook của TeamAI sẽ ghi lại "điểm ma sát" của mỗi Session; những Session có điểm cao sẽ tự động kích hoạt `/teamai-share-learnings`, chia sẻ kinh nghiệm vào kho kiến thức đội. Thiết kế này khiến việc tích lũy kiến thức được tích hợp tự nhiên vào công việc hằng ngày, không cần quy trình bổ sung.

### 2.4 Văn Hóa Chia Sẻ Ưu Tiên Quyền Riêng Tư

Chia sẻ kiến thức đội không được phép đánh đổi bằng quyền riêng tư cá nhân. Việc chia sẻ Session mặc định của TeamAI chỉ bao gồm:

- Số lần và loại lệnh gọi tool (không bao gồm nội dung prompt cụ thể)
- Các số liệu thống kê tổng hợp

Nếu cần chia sẻ nội dung prompt chi tiết, phải dùng tường minh tham số `--include-prompt`; hệ thống sẽ tự động thực hiện việc làm sạch bí mật (ví dụ `ghp_xxxx` → `<REDACTED:token>`).

---

## Ba. Phân Tích Kiến Trúc

### 3.1 Kiến Trúc Tổng Thể

TeamAI CLI gồm các module cốt lõi sau:

```text
src/
├── providers/          # Lớp trừu tượng nền tảng Git
│   ├── github/         # GitHub (gh CLI hoặc GITHUB_TOKEN)
│   ├── tgit/           # Tencent TGit (gf CLI)
│   └── cnb/            # CNB (cnb.cool)
├── resources/          # Bộ xử lý loại tài nguyên
│   ├── skills/         # Gói kỹ năng
│   ├── rules/          # Quy tắc
│   ├── docs/           # Tài liệu
│   └── env/            # Biến môi trường
├── utils/              # Hàm tiện ích
└── *.ts                # Điểm vào lệnh
```

**Đặc điểm then chốt**:

- Mọi thao tác Git đều dùng **Git Worktree cô lập** — thư mục làm việc và nhánh hiện tại không bao giờ bị ảnh hưởng
- Dùng thư viện `simple-git` để thao tác Git, không gọi trực tiếp lệnh git
- Mọi cấu hình được lưu trong `teamai.yaml`

### 3.2 Truy Vấn Kiến Thức: BM25 + Đồ Thị Tri Thức Song Hành

Hệ thống tìm kiếm của TeamAI áp dụng chiến lược lai:

**BM25 (truy vấn thưa)**:

- Dùng `Intl.Segmenter` để phân đoạn từ hỗn hợp Trung-Anh
- Đối với từ ghép tiếng Trung (như "超时", "排查") dùng phân đoạn bigram (hai chữ)
- Công thức tính điểm: `title×3 + tags×2 + body×1 + vote×0.5 (trần +5)`

**Đồ thị tri thức (truy vấn dày)**:

- Thông qua lệnh `teamai import` để nhập tri thức có cấu trúc từ codebase
- Xây dựng đồ thị codebase trong thư mục `teamwiki/`
- Hỗ trợ nhập tăng dần (`--incremental`)

**Quy trình Recall**:

1. Người dùng nhập truy vấn
2. Sub-agent `teamai-recall` kiểm tra tính liên quan trước (`teamai recall --check`)
3. Chỉ khi vượt qua kiểm tra trước mới thực hiện truy vấn thực sự
4. Trong kết quả truy vấn, kiến thức dự án có điểm cao hơn kiến thức cá nhân người dùng (khi dự án đang hoạt động)

### 3.3 Trừu Tượng Git Provider

TeamAI định nghĩa giao diện `GitProvider` thống nhất, hỗ trợ ba nền tảng Git:

| Provider | Tình huống áp dụng | Cách xác thực |
|----------|--------------------|--------------|
| `github` | Dự án mã nguồn mở / đội bên ngoài | gh CLI hoặc `GITHUB_TOKEN` |
| `tgit` | Đội nội bộ Tencent | gf CLI + iOA SSO / Device Code |
| `cnb` | Người dùng CNB | `cnb login` hoặc `CNB_TOKEN` |

Thêm Provider mới chỉ cần triển khai 6 phương thức của giao diện `GitProvider`: `parseRepoInput` / `authenticate` / `cloneRepo` / `createRepo` / `createPullRequest` / `getDefaultEmailDomain`, rồi đăng ký trong `registry.ts` là xong.

---

## Bốn. Tài Liệu Chi Tiết Các Lệnh Cốt Lõi

### 4.1 Khởi Tạo (init)

```bash
# Cách 1: dùng kho đội đã có
teamai init https://github.com/your-org/teamai-repo

# Cách 2: kho hiện tại làm kho đội (chế độ đơn kho)
teamai init .

# Cách 3: chế độ HTTP chỉ đọc (dùng cho Agent không có quyền truy cập git)
teamai init --http https://api.example.com --token <key>

# Giải thích tham số
--scope project    # Đặt .teamai/ trong thư mục dự án (mặc định)
--scope user       # Đặt .teamai/ trong thư mục chính người dùng
--inherit-user-scope  # scope dự án kế thừa tài nguyên an toàn từ scope người dùng
```

Khởi tạo sẽ hoàn thành:

1. Đăng nhập OAuth nền tảng Git
2. Clone kho đội về máy local
3. Đăng ký làm thành viên đội
4. Tiêm SessionStart/Stop Hooks vào cấu hình Agent

### 4.2 Đẩy Kiến Thức (push)

```bash
# Đẩy tài nguyên cục bộ lên kho đội
teamai push

# Đẩy tài nguyên liên quan đến vai trò chỉ định
teamai push --role developer

# Chế độ im lặng (không mở MR)
teamai push --silent

# Đẩy thông tin thống kê
teamai push --stats

# Đẩy bản ghi Session
teamai push --sessions
```

Quy trình làm việc của push: tài nguyên cục bộ → tạo nhánh tính năng → Commit → mở MR → chờ đội Review.

### 4.3 Kéo Kiến Thức (pull)

```bash
# Kéo tài nguyên mới nhất của đội
teamai pull

# Chế độ xem trước (xem nội dung sắp được kéo)
teamai pull --dry-run

# Buộc ghi đè cục bộ
teamai pull --force
```

Pull sẽ tự động đồng bộ đến tool Agent (Claude Code...), được SessionStart Hook kích hoạt tự động.

### 4.4 Triệu Hồi Kiến Thức (recall)

```bash
# Tìm kiếm trong kho kiến thức đội
teamai recall "cách xử lý vấn đề timeout"

# Bật/tắt tự động recall
teamai recall enable
teamai recall disable

# Xem trạng thái recall
teamai recall status

# Chế độ kiểm tra trước (không thực hiện truy vấn thực sự)
teamai recall --check "nội dung truy vấn"
```

### 4.5 Xây Dựng Đồ Thị Tri Thức Codebase (import)

```bash
# Nhập từ thư mục cục bộ
teamai import --dir ./src

# Nhập từ kho khác
teamai import --from-repo owner/repo

# Nhập hàng loạt từ tổ chức
teamai import --from-org tencent

# Nhập từ MR
teamai import --from-mr https://github.com/owner/repo/pull/123

# Nhập tăng dần
teamai import --incremental

# Bỏ qua giai đoạn enrich (tăng tốc)
teamai import --skip-enrich
```

### 4.6 Quản Lý Thành Viên (members)

```bash
# Xem danh sách thành viên
teamai members list

# Thêm thành viên
teamai members add <username>
```

### 4.7 Quản Lý Vai Trò (roles)

```bash
# Khởi tạo cấu hình vai trò
teamai roles init

# Thêm vai trò
teamai roles add developer --description "Vai trò phát triển"

# Gán vai trò cho thành viên
teamai roles set @username developer

# Xem danh sách vai trò
teamai roles list
```

### 4.8 Các Lệnh Thường Dùng Khác

```bash
# Xem khác biệt giữa cục bộ và kho đội
teamai status

# Chia sẻ kinh nghiệm của phiên này
teamai contribute --file ./session.md

# Xem danh mục kỹ năng
teamai skill list

# Xem chi tiết kỹ năng
teamai skill show <tên-kỹ-năng>

# Quản lý MCP server
teamai mcp list
teamai mcp inject

# Quản lý biến môi trường đội
teamai env add API_KEY=xxx
teamai env list
teamai env --reveal

# Dùng dashboard (giao diện web)
teamai dashboard --port 3721

# Chẩn đoán vấn đề cấu hình
teamai doctor

# Chia sẻ trải nghiệm tương tác
teamai contribute
```

---

## Năm. Cơ Chế Đăng Ký Skills Đa Đội

### 5.1 Thêm Nguồn Kỹ Năng Bên Ngoài

```bash
# Thêm kho GitHub làm nguồn kỹ năng
teamai source add https://github.com/other-team/teamai-skills --name other-skills

# Thêm điểm cuối HTTP (chỉ đọc)
teamai source add-http https://api.example.com/teamai --name external

# Duyệt các kỹ năng khả dụng
teamai source browse

# Liệt kê các nguồn kỹ năng đã cấu hình
teamai source list
```

### 5.2 Giải Thích Cơ Chế Đăng Ký

Đăng ký chéo đội cho phép đội tái sử dụng thư viện kỹ năng của các đội khác, tương tự triết lý quản lý gói của npm. Sau khi đăng ký, có thể dùng kỹ năng bên ngoài giống như kỹ năng cục bộ:

```bash
# Xem tất cả kỹ năng khả dụng (bao gồm nguồn đã đăng ký)
teamai skill list --source all

# Xem nguồn chỉ định
teamai skill list --source other-skills
```

---

## Sáu. Hệ Thống Mở Rộng Hook Và MCP

### 6.1 Hệ Thống Hook

TeamAI định nghĩa hook vòng đời thông qua `hooks/hooks.yaml`, hỗ trợ mở rộng tùy biến hành vi của Agent:

```yaml
# Ví dụ hooks/hooks.yaml
PostToolUse:
  - name: teamai-recall
    script: ${TEAMAI_CLI}/dist/teamai-recall.js
    trigger: recall
```

Các loại Hook được hỗ trợ:

- `SessionStart`: khi phiên khởi động (tự động thực hiện pull)
- `Stop`: khi phiên kết thúc (chấm điểm + kích hoạt chia sẻ learnings)
- `PostToolUse`: sau khi gọi tool (kiểm tra trước recall)

### 6.2 Quản Lý MCP Server

Cấu hình MCP server thông qua `mcp/mcp.yaml`:

```yaml
mcpServers:
  filesystem:
    command: npx
    args: ["-y", "@modelcontextprotocol/server-filesystem", "./workspace"]
  slack:
    command: npx
    args: ["-y", "@modelcontextprotocol/server-slack"]
    env:
      SLACK_BOT_TOKEN: ${SLACK_BOT_TOKEN}  # Tham chiếu Secret
```

Biến môi trường dùng cú pháp `${VAR}`, TeamAI sẽ phân giải thành giá trị thực trước khi ghi xuống đĩa.

---

## Bảy. Tích Hợp Với Claude Code

### 7.1 Nguyên Lý Tích Hợp

TeamAI tách rời khỏi sản phẩm Agent cụ thể thông qua cơ chế Hook của Agent. Lấy Claude Code làm ví dụ:

1. **SessionStart Hook** → tự động thực hiện `teamai pull`
2. **Stop Hook** → chấm điểm Session, đẩy kinh nghiệm của Session có điểm cao lên kho đội
3. **Recall** → Agent tìm kiếm kiến thức đội trước khi thực hiện nhiệm vụ

### 7.2 Danh Sách Agent Được Hỗ Trợ (28)

Thông qua `teamai list --agent <id>` có thể xem tất cả Agent đã đăng ký, bao gồm: claude, codex, codebuddy, workbuddy, copilot...

---

## Tám. Tổng Hợp Triết Lý Thiết Kế

### 8.1 Ôn Lại Ý Niệm Cốt Lõi

1. **Git là phương tiện quản lý kiến thức đội tốt nhất**: không cần giới thiệu hạ tầng mới, không thay đổi quy trình Git hiện tại, hòa nhập hoàn hảo vào quy trình cộng tác mã nguồn hiện có.

2. **Không cần hạ tầng (Zero-Infrastructure)**: không cần triển khai cơ sở dữ liệu, không cần quản lý dịch vụ embedding, không cần triển khai thêm hệ thống tài liệu.

3. **Kiến thức đến từ ma sát (Friction-Driven)**: kinh nghiệm quý giá nhất đến từ những khoảnh khắc lỗi và khó khăn, hệ thống chủ động nắm bắt những khoảnh khắc này và chuyển hóa thành kiến thức đội.

4. **Văn hóa chia sẻ ưu tiên quyền riêng tư**: mặc định chỉ chia sẻ số liệu thống kê tổng hợp, thông tin nhạy cảm được làm sạch tự động, chia sẻ không cần lo lắng.

5. **Phiên bản hóa mọi thứ (Version Control Everything)**: kỹ năng, quy tắc, tài liệu, biến môi trường đều có thể được quản lý phiên bản, khôi phục và review.

### 8.2 Hạn Chế

- Nhánh đẩy mặc định là `master` (thay vì `main`), tồn tại vấn đề di sản
- Cách ly thao tác Git phụ thuộc vào worktree, mọi độ phức tạp do CLI gánh chịu
- Chất lượng Recall phụ thuộc vào mức độ bảo trì kho kiến thức, không bảo trì thì không có giá trị
- Nội dung đa ngôn ngữ (tiếng Trung/tiếng Anh/tiếng Nhật...) cần đồng bộ thủ công

### 8.3 Tình Huống Áp Dụng

**Khuyến nghị mạnh mẽ nên dùng**:

- Cộng tác đội Agent đa dạng (sản phẩm Agent khác nhau, thành viên khác nhau)
- Đội cần thống nhất quy chuẩn coding và thực tiễn tốt nhất
- Đội kỹ thuật đã có nền tảng kho Git

**Không phù hợp lắm**:

- Người dùng cá nhân (độ phức tạp khi giới thiệu lớn hơn lợi ích)
- Đội phi kỹ thuật (ngưỡng quy trình Git tương đối cao)
- Tình huống cần cộng tác kiến thức thời gian thực (mô hình bất đồng bộ của Git có độ trễ)

---

## Chín. Hướng Dẫn Bắt Đầu Nhanh

### 9.1 Cài Đặt

```bash
# Cài đặt qua npm (khuyến nghị)
npm install -g teamai-cli

# Xác minh cài đặt
teamai --version
```

### 9.2 Khởi Tạo Kho Đội

```bash
# Cách 1: dùng kho đội đã có
teamai init https://github.com/your-org/teamai-knowledge

# Cách 2: dự án hiện tại làm kho đội
teamai init .
```

### 9.3 Đẩy Kinh Nghiệm Đầu Tiên

```bash
# Trong Claude Code, sau khi hoàn thành một nhiệm vụ
teamai contribute

# Hoặc chỉ định trực tiếp file
teamai contribute --file ./session-summary.md
```

### 9.4 Thành Viên Đội Kéo Về

```bash
# Kéo kiến thức mới nhất của đội
teamai pull

# Tìm kiếm kiến thức liên quan
teamai recall "đội chúng ta xử lý timeout API thế nào"
```

### 9.5 Xem Trạng Thái

```bash
# Xem khác biệt giữa cục bộ và đội
teamai status

# Mở dashboard web
teamai dashboard --port 3721
```

---

## Mười. Tech Stack Và Thực Hành Kỹ Thuật

### 10.1 Lựa Chọn Công Nghệ

| Hạng mục | Công nghệ |
|----------|-----------|
| Ngôn ngữ | TypeScript (chế độ nghiêm ngặt) |
| Hệ thống module | ESM (`"type": "module"`) |
| Framework CLI | Commander.js |
| Thao tác Git | simple-git |
| Công cụ build | tsup |
| Framework kiểm thử | Vitest |
| Định dạng cấu hình | YAML + TOML |
| Kiểm tra runtime | Zod |
| Frontend | Không (CLI thuần) |

### 10.2 Quy Chuẩn Phát Triển

- Sử dụng [conventional commits](https://www.conventionalcomms.org/): `feat:`, `fix:`, `docs:`, `test:`, `refactor:`
- Mục tiêu độ phủ kiểm thử ≥ 80%
- Unit test đặt trong `src/__tests__/`, tên file phản chiếu (ví dụ `init.test.ts`)
- I/O bên ngoài mock ở ranh giới module, kiểm thử mạng được bảo vệ bởi biến môi trường (ví dụ `TEAMAI_TEST_TOKEN`)

---

## Mười Một. Kết Luận Và Triển Vọng

TeamAI đại diện cho một hướng quan trọng trong cộng tác đội AI Agent: **dùng công cụ đã chín muồi (Git) để giải quyết vấn đề mới (quản lý kiến thức Agent)**, thay vì phát minh ra hạ tầng hoặc giao thức mới.

Giá trị cốt lõi của nó nằm ở:

- **Giảm chi phí cộng tác đội nhóm**: không cần thay đổi quy trình, không cần học công cụ mới
- **Nâng cao tính nhất quán giữa các Agent**: Agent khác nhau, thành viên khác nhau chia sẻ cùng một nền tảng tri thức
- **Tích lũy trí tuệ đội nhóm**: chuyển hóa kinh nghiệm cá nhân thành tài sản đội, để các thành viên sau được hưởng lợi

Nếu bạn đang xây dựng hệ thống đa Agent hoặc quản lý đội AI Agent, TeamAI cung cấp một kiến trúc tham chiếu đã được xác minh qua thực tiễn quy mô lớn. Ngay cả khi bạn không dùng chính TeamAI, **triết lý quản lý kiến thức Git-native** của nó cũng đáng để suy ngẫm và tham khảo sâu.

**Địa chỉ dự án**: https://github.com/Tencent/teamai-cli
**Gói npm**: `teamai-cli`
**Phiên bản hiện tại**: 0.19.0

---

*Bài viết này được viết dựa trên trạng thái mới nhất của dự án tính đến tháng 8 năm 2026, phiên bản v0.19.0 là phiên bản chưa phát hành (Unreleased), một số chi tiết chức năng có thể thay đổi theo cập nhật phiên bản.*