---
title: 'holaOS Phân Tích Chuyên Sâu: Chiếc Máy Tính Của Bạn Và Agent Của Bạn — Không Gian Làm Việc AI Agent Toàn Diện Mã Nguồn Mở'
date: "2026-08-15"
description: "Phân tích chuyên sâu holaboss-ai/holaOS (dự án mã nguồn mở 7.4k sao, Electron + TypeScript): không gian làm việc AI agent toàn diện mã nguồn mở — chạy bất kỳ agent nào (Claude Code, Codex, hoặc agent holaOS tích hợp) trong một không gian làm việc local-first, chia sẻ cùng một bộ nhớ, cùng bộ công cụ, cùng không gian làm việc. Ý tưởng cốt lõi: 'The Computer for You and Your Agent' (Chiếc máy tính của bạn và agent của bạn) — nhân vật chính của kỷ nguyên agent không phải là cửa sổ chat mà là một chiếc máy tính bạn dùng chung với agent của mình; thứ thực sự tạo giá trị không phải bản thân mô hình (mô hình đã bị hàng hóa hóa) mà là lớp không gian làm việc phía trên agent: bộ nhớ dùng chung, giao diện ứng dụng thực (HolaApps), và một máy trạm hoàn chỉnh mà agent có thể thao tác. Giới thiệu dự án: ứng dụng desktop Electron local-first + runtime trong tiến trình (runtime/{harnesses,harness-host,api-server,state-store}), monorepo bun + turbo; sáu tính năng cốt lõi — chạy bất kỳ agent nào, một bộ nhớ cho mọi agent, mô hình tích hợp sẵn hoặc BYOK, HolaApps giao diện ứng dụng thực, Skills/Integrations/MCP dạy một lần dùng mọi nơi, toàn bộ máy trạm agent thao tác được (trình duyệt thực / tạo sinh tiên phong / sản phẩm giao thực / mọi cửa ngõ chat / tự động hóa); ba hình thức cung cấp (desktop app / tự lưu trữ mã nguồn mở / doanh nghiệp SSO). Hướng dẫn chi tiết: cài đặt một dòng (install.sh), toàn bộ quy trình cài đặt thủ công (desktop:install → .env → prepare-runtime:local → typecheck → dev), đóng gói runtime (runtime tự chứa: API + Node/npm nhúng + Python nhúng), gỡ lỗi bộ não pi bằng hola CLI, đóng gói và phát hành (dist:mac/dist:win, ký và công chứng CI, phiên bản YYYY.MDD.R), mô hình bảo mật (contextIsolation/nodeIntegration/webviewTag). Triết lý thiết kế: local-first và quyền sở hữu dữ liệu, không phụ thuộc agent (không khóa hãng), ngữ cảnh chia sẻ hơn các silo agent, giao diện thực thay vì chat, dạy một lần dùng mọi nơi, mặc định không cần cấu hình + linh hoạt BYOK, runtime tự chứa, bảo mật ưu tiên hàng đầu, con người trong vòng lặp. Tổng hợp quan điểm: Agent OS là lớp nền tảng tiếp theo; bộ nhớ là hào phòng thủ; lớp không gian làm việc bắt giá trị sau khi mô hình bị hàng hóa hóa; con đường kép mã nguồn mở + lưu trữ; runtime tự chứa là lựa chọn thực dụng cho không gian làm việc AI."
tags:
  - holaOS
  - Holaboss
  - AI Agent
  - Agent Workspace
  - Agent OS
  - Electron
  - TypeScript
  - Claude Code
  - Codex
  - MCP
  - Skills
  - Bộ nhớ dùng chung
  - Local-First
  - BYOK
  - HolaApps
  - Triết lý thiết kế
categories:
  - Phân tích chuyên sâu
  - AI Agent
  - Mã nguồn mở
---

# holaOS Phân Tích Chuyên Sâu: Chiếc Máy Tính Của Bạn Và Agent Của Bạn — Không Gian Làm Việc AI Agent Toàn Diện Mã Nguồn Mở

> Ý tưởng cốt lõi: **"The Computer for You and Your Agent" (Chiếc máy tính của bạn và agent của bạn)**. Những người sáng lập holaOS tin rằng nhân vật chính thực sự của kỷ nguyên agent không phải là một chồng cửa sổ chat mà là một **chiếc máy tính bạn có thể dùng chung với các agent của mình**. Họ đã biến tầm nhìn đó thành một không gian làm việc AI agent toàn diện mã nguồn mở: chạy **bất kỳ** agent nào — Claude Code, Codex, hoặc agent holaOS tích hợp — trong một không gian làm việc local-first, chia sẻ cùng một bộ nhớ, cùng bộ công cụ, cùng trình duyệt và cùng hệ sinh thái ứng dụng. "Dùng agent tốt nhất cho công việc mà không cần dựng lại môi trường mỗi lần." Nhận định sâu hơn: **các mô hình đang bị hàng hóa hóa nhanh chóng (giá trị của chúng tiến về con số không), và lớp thực sự bắt giữ giá trị là "lớp không gian làm việc" phía trên agent** — bộ nhớ dùng chung, giao diện ứng dụng thực và một máy trạm hoàn chỉnh mà agent có thể vận hành.

## Bối Cảnh & Giới Thiệu Dự Án

Đến năm 2026, bối cảnh AI agent đã trở nên cạnh tranh khốc liệt: Claude Code, OpenAI Codex, Cursor, Windsurf… mọi agent đều cố trở thành điểm vào duy nhất của nhà phát triển. Nhưng nhóm holaOS (holaboss-ai) đưa ra một góc nhìn khác: **tại sao chúng ta phải chọn một trong các agent?**

Câu trả lời của holaOS — đừng đặt cược vào bất kỳ agent đơn lẻ nào; hãy đặt cược vào **"chiếc máy tính" chứa đựng tất cả chúng**. Cũng như bạn không mất file, bookmark và lịch sử khi đổi trình duyệt, bạn không nên mất bộ nhớ, công cụ và kỹ năng khi đổi agent. holaOS chính là "hệ điều hành của kỷ nguyên agent" này: mã nguồn mở, local-first, và không phụ thuộc vào bất kỳ agent cụ thể nào — một **lớp không gian làm việc**.

### Thông Tin Dự Án

| Trường | Giá trị |
|--------|---------|
| Kho lưu trữ | https://github.com/holaboss-ai/holaOS |
| Stars | 7.4k |
| Forks | 642 |
| Watchers | 172 |
| Giấy phép | Modified Apache 2.0 (kèm điều kiện phân phối thương mại và thương hiệu) |
| Ngôn ngữ | TypeScript (ứng dụng desktop Electron + runtime trong tiến trình) |
| Trình quản lý gói | bun 1.3.6 + turbo (monorepo) |
| Nền tảng | macOS (Apple Silicon + Intel), Windows, Linux |
| Hình thức | Ứng dụng desktop Electron + gói runtime tự chứa |
| Số commit | 73 |
| Trang web | https://www.holaos.ai |
| Liên hệ bảo mật | admin@holaboss.ai (báo cáo riêng tư) |

### Định Vị Trong Một Câu

holaOS là một **không gian làm việc AI agent toàn diện, mã nguồn mở, local-first**: chạy bất kỳ agent nào — Claude Code, Codex, hoặc agent holaOS tích hợp — trong một không gian làm việc, chia sẻ cùng bộ nhớ, bộ công cụ và hệ sinh thái ứng dụng, với mô hình tích hợp sẵn hoặc tự mang khóa (BYOK).

## Ý Tưởng Cốt Lõi: Vì Sao Là "Một Chiếc Máy Tính" Mà Không Phải "Một Ô Chat"

Linh hồn của toàn bộ dự án holaOS có thể tách thành bốn nhận định tuần tiến:

### 1. Nhân vật chính của kỷ nguyên agent là "chiếc máy tính", không phải "chat"

Hầu hết sản phẩm AI thiết kế tương tác như một ô chat: bạn gửi tin nhắn, AI trả lời bằng văn bản. Những người sáng lập holaOS tin đây là phép ẩn dụ sai lầm. Mô hình thực sự là một **chiếc máy tính** — bạn và agent của mình dùng chung một máy, một bộ file, một trình duyệt, một bộ ứng dụng. Agent không tạo ra "bản ghi hội thoại"; chúng tạo ra **sản phẩm giao thực sự, đã hoàn tất**: báo cáo `.xlsx` thực, slide `.pptx` thực, tài liệu `.docx` thực, các giao diện ứng dụng chúng đã thao tác.

### 2. Mô hình đã bị hàng hóa hóa; giá trị nằm ở lớp không gian làm việc

Với Kimi K3 và GLM 5.2 tích hợp sẵn (tiết kiệm chi phí cho khối lượng hàng ngày), cùng GPT 5.6, Claude Opus 5 và Fable 5 (hàng đầu cho bài toán khó), và BYOK cho OpenAI/Anthropic hoặc mọi endpoint tương thích — nhận định đằng sau điều này: **bản thân mô hình không còn là nguồn khác biệt hóa**. Sự khác biệt nằm ở lớp trên mô hình: **sự điều phối và chia sẻ** bộ nhớ, công cụ, kỹ năng, ứng dụng và quy trình làm việc.

### 3. Không khóa hãng: agent có thể thay thế, không gian làm việc bền vững

holaOS cam kết rõ ràng "No lock-in" (không khóa hãng) — hãy mang theo agent bạn đã tin tưởng. Đổi agent, đóng ứng dụng, tuần sau quay lại: nó đã biết bạn dừng ở đâu. **Chia sẻ mọi thứ** (một ngữ cảnh, một bộ công cụ, một không gian làm việc) + **kết quả nhất quán** (cùng kỹ năng và tích hợp, dù cái gì đang điều khiển).

### 4. Dạy một lần, dùng mọi nơi (Teach once, reuse everywhere)

Trong holaOS, các Skills (kỹ năng), Integrations (tích hợp), máy chủ MCP và Combos (gói kết hợp) bạn cấu hình cho một agent sẽ **tự động được mọi agent kế thừa**. Điều này đẩy chi phí di chuyển khi "đổi agent" về con số không — chính là nền tảng kỹ thuật làm cho cam kết không khóa hãng trở nên đáng tin.

## Giới Thiệu Dự Án: holaOS Là Gì

### Sáu Tính Năng Cốt Lõi

#### 🔀 Chạy bất kỳ agent nào, một không gian làm việc

Claude Code, Codex và agent holaOS tích hợp — đặt cạnh nhau, không cần chuyển đổi. Dù bạn chạy cái nào, nó đều chia sẻ cùng bộ nhớ, công cụ, kỹ năng và ứng dụng.

#### 🧠 Một bộ nhớ, mọi agent

Ngữ cảnh, sở thích và lịch sử dự án nằm trong một **bộ nhớ dùng chung duy nhất** — được lưu **cục bộ, dưới dạng file văn bản thuần bạn có thể đọc và sửa**. Đổi agent, đóng ứng dụng, tuần sau quay lại: nó đã biết bạn dừng ở đâu.

- **Không bao giờ bắt đầu từ con số không** — bộ nhớ bền vững qua các phiên *và* các agent
- **Local-first và thuộc về bạn** — trên máy của bạn, hiển thị và chỉnh sửa được, không bị nhốt trong đám mây của ai khác
- **Thực sự gọi lại được** — được lưu có cấu trúc và nhúng, để ngữ cảnh đúng quay lại khi cần

#### 💸 Mô hình theo cách của bạn — tích hợp sẵn, hoặc tự mang

Một tài khoản, mọi mô hình — không cần khóa, không cần cấu hình, không chuyển đổi giữa các nhà cung cấp. Mô hình tiên phong được **tích hợp sẵn**: **Kimi K3** và **GLM 5.2** tiết kiệm chi phí cho khối lượng hàng ngày, cùng **GPT 5.6**, **Claude Opus 5** và **Fable 5** hàng đầu cho bài toán khó. Thích nhà cung cấp của riêng bạn? **Tự mang khóa** cho OpenAI, Anthropic hoặc mọi endpoint tương thích OpenAI/Anthropic — những cái đó chạy trên *tài khoản của bạn*, không phải gói holaOS của bạn.

#### 🪟 HolaApps — ứng dụng và agent, đặt cạnh nhau

Cài ứng dụng từ chợ trong không gian làm việc và chúng mở ra như **giao diện tương tác thực, ngay bên cạnh agent của bạn**. Xem nó làm việc bên trong ứng dụng, can thiệp bất cứ khi nào bạn muốn, và kết quả đổ vào đúng chỗ — không phải một bức tường văn bản chat, mà là ứng dụng thực, do agent điều khiển, cạnh agent.

- **Giao diện thực, không phải chat** — mọi ứng dụng là UI sống (Notion, trình duyệt, ứng dụng của riêng bạn)
- **Cạnh nhau là thiết kế** — ứng dụng và agent chia sẻ màn hình
- **Một cú nhấp để cài** — duyệt chợ trong không gian làm việc và mở mọi ứng dụng ngay lập tức
- **Tự mang** — trỏ một HolaApp vào bất kỳ URL và máy chủ MCP nào

#### 🧩 Skills, Integrations & MCP — dạy một lần, dùng mọi nơi

- **Integrations** — kết nối Gmail, Notion, Slack, GitHub, Linear và 50+ ứng dụng khác bằng OAuth một cú nhấp; agent đọc và hành động xuyên các công cụ của bạn, không cần mã keo
- **MCP** — cắm bất kỳ máy chủ Model Context Protocol nào, hoặc cài máy chủ MCP cộng đồng trong một cú nhấp
- **Skills** — đóng gói một quy trình một lần; bất kỳ agent nào cũng chạy theo yêu cầu
- **Combos** — gói kỹ năng và tích hợp thành một bản cài một cú nhấp

#### 🛠️ Toàn bộ máy trạm của bạn, agent thao tác được

- **🌐 Trình duyệt thực, do agent điều khiển** — trình duyệt đã đăng nhập để agent duyệt, nhấp và trích xuất — trong tầm kiểm soát của bạn
- **🎨 Tạo sinh tiên phong tích hợp sẵn** — mô hình hình ảnh, video và âm thanh mới nhất bên trong mọi agent
- **📄 Sản phẩm giao thực** — báo cáo, bảng tính và slide được lưu thành file `.xlsx`, `.pptx` và `.docx` thực
- **💬 Tiếp cận từ bất kỳ nơi bạn chat** — Feishu, WeChat, Slack, Telegram
- **⏰ Tự động hóa** — chạy theo lịch hoặc trigger

### Ba Hình Thức Cung Cấp

| Hình thức | Mô tả |
|-----------|-------|
| 🖥️ Ứng dụng desktop | Tải về và dùng ngay; mô hình tiên phong tích hợp sẵn, miễn phí để bắt đầu |
| 🔓 Mã nguồn mở | Tự lưu trữ; Modified Apache 2.0, tự mang khóa, chạy hoàn toàn trên máy của bạn |
| 🏢 Doanh nghiệp | SSO với quyền theo vai cho mọi agent, kỹ năng và ứng dụng; nhật ký kiểm toán mọi hành động; on-prem hoặc đám mây riêng của bạn |

### Kiến Trúc Kỹ Thuật: Electron Desktop + Runtime Trong Tiến Trình

holaOS dùng monorepo bun + turbo, với phần lõi tách giữa **ứng dụng desktop** và **runtime trong tiến trình**:

```text
holaOS/
├── apps/                     # Ứng dụng
│   ├── desktop/              # Ứng dụng desktop Electron (Vite renderer + electron main/preload)
│   └── docs/                 # Trang tài liệu
├── runtime/                  # Runtime trong tiến trình (lõi)
│   ├── api-server/           # Máy chủ API runtime
│   ├── channel-gateway/      # Cổng kênh
│   ├── harness-host/         # Máy chủ runtime (bộ não pi/Hola chạy ở đây)
│   ├── harnesses/            # Các harness (gồm bộ não pi)
│   └── state-store/          # Kho trạng thái (better-sqlite3)
├── packages/                 # Gói dùng chung (vd: @holaboss/app-sdk)
├── shared/                   # Mã dùng chung
├── scripts/                  # install.sh, hola.mts, v.v.
└── patches/                  # Bản vá phụ thuộc
```

Desktop là Electron + React 19 + TypeScript + Vite + Tailwind CSS với bố cục ba khung (trình khám phá file / bảng trình duyệt trong ứng dụng / trợ lý chat AI), truy cập hệ thống file cục bộ và trình duyệt nhúng qua cầu preload an toàn (`contextIsolation: true`, `nodeIntegration: false`, `webviewTag: true`).

Runtime là một **gói tự chứa**: nó đóng gói API runtime, Node/npm nhúng và Python nhúng. Ứng dụng desktop dàn dựng runtime tại `apps/desktop/out/runtime-<platform>`, đảm bảo tính xác định môi trường và tính khả chuyển.

### Skills Tích Hợp Sẵn (Thư Viện Kỹ Năng Mặc Định)

audience-analyst (phân tích đối tượng), content-planner (lập kế hoạch nội dung), content-writer (viết nội dung), data-analyst (phân tích dữ liệu), email-writer (viết email), idea-generator (tạo ý tưởng), image-generator (tạo hình ảnh), meeting-notes (biên bản họp), performance-reporter (báo cáo hiệu suất), prd-writer (viết PRD), proposal-writer (viết đề xuất), summarizer (tóm tắt), tone-adapter (điều chỉnh giọng điệu), translator (dịch), trend-spotter (phát hiện xu hướng), video-generator (tạo video), web-researcher (nghiên cứu web) — ví dụ mặc định của "dạy một lần, dùng mọi nơi".

## Hướng Dẫn Chi Tiết: Cài Đặt holaOS Từ Đầu

### Cách 1: Cài Đặt Một Dòng (Khuyến Nghị)

Trên máy mới macOS, Linux hoặc WSL:

```bash
curl -fsSL https://raw.githubusercontent.com/holaboss-ai/holaOS/refs/heads/main/scripts/install.sh | bash -s -- --launch
```

Theo mặc định, tập lệnh đó:
1. Cài `git` nếu chưa có
2. Cài Node.js 24 và npm nếu chưa có
3. Nhân bản kho lưu trữ vào `~/holaboss-ai`
4. Tạo `apps/desktop/.env` từ `apps/desktop/.env.example` nếu cần
5. Chạy `npm run desktop:install`
6. Chạy `npm run desktop:prepare-runtime:local`
7. Chạy `npm run desktop:typecheck`
8. Dừng trước khi khởi chạy Electron (trừ khi bạn truyền `--launch`)

Cờ tùy chọn:
- `--dir <path>` chọn thư mục checkout khác
- `--ref <git-ref>` / `--branch <git-ref>` cài từ nhánh hoặc tag khác `main`
- `--launch` tiếp tục vào `npm run desktop:dev`

Nếu bạn đã ở trong một checkout cục bộ và muốn dùng lại cùng trình bao bọc:

```bash
bash scripts/install.sh --dir "$PWD"
```

### Cách 2: Cài Đặt Thủ Công (Kiểm Soát Từng Bước)

Trước tiên xác minh các điều kiện tiên quyết:

```bash
git --version
node --version    # phải >= 24
npm --version
```

Sau đó chạy theo thứ tự:

```bash
# 1. Nhân bản kho lưu trữ
git clone https://github.com/holaboss-ai/holaOS.git holaboss-ai
cd holaboss-ai

# 2. Cài phụ thuộc desktop
npm run desktop:install

# 3. Tạo file môi trường cục bộ
cp apps/desktop/.env.example apps/desktop/.env

# 4. Chuẩn bị gói runtime cục bộ
npm run desktop:prepare-runtime:local

# 5. Xác minh nhanh không tương tác trước khi khởi chạy
npm run desktop:typecheck

# 6. Khởi động chế độ phát triển
npm run desktop:dev
```

Hook `predev` của `npm run desktop:dev` tự động xác thực môi trường, dựng lại mô-đun gốc và đảm bảo gói runtime đã được dàn dựng — nên đường phát triển bình thường không cần bước chuẩn bị thủ công.

### Hai Nguồn Cho Gói Runtime

```bash
# Dựng runtime từ mã nguồn cục bộ và dàn dựng
npm run desktop:prepare-runtime:local

# Lấy runtime đã phát hành mới nhất cho nền tảng hiện tại từ GitHub Releases
npm run desktop:prepare-runtime
```

Dùng đường mã nguồn cục bộ khi bạn đang thay đổi mã runtime; dùng gói đã phát hành để xác minh desktop với một artifact phát hành đã biết.

### Xác Minh Runtime (Tùy Chọn, Cho Clone Mới)

```bash
npm run runtime:state-store:install
npm run runtime:state-store:build
npm run runtime:harness-host:install
npm run runtime:harness-host:build
npm run runtime:api-server:install
npm run runtime:test
```

### Nâng Cao: Gỡ Lỗi Bộ Não pi Bằng hola CLI

`scripts/hola.mts` cho phép bạn chạy **bộ não pi (Hola)** trong tiến trình từ mã nguồn để gỡ lỗi **mà không cần mở UI desktop**: đặt breakpoint trong `runtime/harness-host/src/pi.ts`, sửa-rồi-chạy lại không cần vòng build/stage, và khởi động nhiều phiên bản.

```bash
# Đóng desktop của checkout NÀY trước (tránh tranh chấp ghi), rồi:
npm --prefix runtime/api-server run hola -- -p "list the files in this repo and summarize it"
```

Nó gọi pipeline `executeTsRunnerRequest` thực của runtime và chỉ ghi đè phụ thuộc `runHarnessHost` để chạy `runPi()` trong tiến trình thay vì spawn `harness-host run-pi`. Vì vậy mọi giai đoạn dựng (MCP, sidecar, skills, công cụ, `model_client`, ngữ cảnh tiêm) **trung thực với một lần chạy desktop**; chỉ subprocess harness bị thay thế. Sự kiện chảy qua relay thực (nên `harness_session_id` được lưu → resume hoạt động).

Cờ thường dùng: `-p/--prompt`, `--cwd`, `-m/--model`, `-s/--session <path>` (tiếp tục một phiên cụ thể), `--fresh` (phiên mới), `--no-runtime` (bỏ qua công cụ nền HTTP), `--keep` (giữ runtime đã khởi chạy), `--force` (mở root mà desktop đang hoạt động dùng), `--print-request` (dựng + in, không gọi mô hình), `--debug` (sự kiện thô), `--port`.

### Đóng Gói & Phát Hành (Nâng Cao)

```bash
# macOS (ký ad-hoc cục bộ)
npm run dist:mac
npm run dist:mac:dmg

# Windows (trình cài NSIS)
npm run dist:win
```

- `dist:mac` tạo `.app` cục bộ chưa ký (nhúng `runtime-macos` trong `Contents/Resources/`)
- `dist:mac:dmg` tạo trình cài `.dmg` dùng cục bộ
- Ký và công chứng sản xuất diễn ra trong GitHub Actions (sau khi cấu hình các secret của Apple)
- Phiên bản phát hành desktop dùng semver ổn định dạng `YYYY.MDD.R` (vd: `2026.410.1`, `2026.1113.1`); tag phát hành GitHub là `holaOS-YYYY.MDD.R`

### Mô Hình Bảo Mật

- Renderer: `contextIsolation: true`, `nodeIntegration: false`, `webviewTag: true` (bật có chủ đích cho bảng trình duyệt nhúng)
- Cầu preload chỉ lộ thông tin runtime và API hệ thống file bị giới hạn
- Vấn đề bảo mật (lộ thông tin xác thực, RCE, thoát sandbox, vượt xác thực, cấu hình mặc định không an toàn) nên được báo cáo **riêng tư** tới `admin@holaboss.ai`, không phải issue công khai

## Triết Lý Thiết Kế: Chín Nguyên Tắc Của holaOS

### 1. Local-first và quyền sở hữu dữ liệu

Bộ nhớ là file văn bản thuần trên máy của bạn — hiển thị được, sửa được, di chuyển được. "Không bị nhốt trong đám mây của người khác" là phản hồi trực tiếp với "hộp đen bộ nhớ" của các sản phẩm AI SaaS. Quyền chủ quyền dữ liệu của người dùng là nền tảng của niềm tin sản phẩm.

### 2. Không phụ thuộc agent (Agent-agnostic)

Đừng đặt cược vào một agent duy nhất; hãy tách lớp không gian làm việc khỏi các agent. Claude Code, Codex và agent tích hợp là **công cụ thực thi có thể thay thế**; không gian làm việc (bộ nhớ/công cụ/kỹ năng/ứng dụng) là **tài sản bền vững**. Đây vừa là lời hứa với người dùng (không khóa hãng) vừa là lựa chọn định vị (không đứng về phía nào).

### 3. Ngữ cảnh chia sẻ hơn các silo agent

Mỗi agent tự duy trì bộ nhớ và công cụ riêng là sự lãng phí và phân mảnh khổng lồ. Tuyên bố cốt lõi của holaOS: **ngữ cảnh, sở thích và lịch sử dự án nên là một tài sản dùng chung duy nhất**, bất kể agent nào đang điều khiển. Đây cũng là nguồn gốc của lời hứa "Kết quả nhất quán".

### 4. Giao diện thực, không phải chat

Đầu ra của agent nên là **giao diện ứng dụng thực và file thực**, không phải bức tường bản ghi chat. HolaApps đặt ứng dụng và agent cạnh nhau — "app and agent share the screen, so you always see what's happening and can take over" (ứng dụng và agent chia sẻ màn hình, bạn luôn thấy điều đang diễn ra và có thể tiếp quản). **Con người trong vòng lặp** được xây vào thiết kế, không phải vá vào sau.

### 5. Dạy một lần, dùng mọi nơi

Skills, tích hợp, MCP và Combos là **tài sản không phụ thuộc agent**. Điều này nâng đơn vị tái sử dụng tri thức từ "một agent" lên "toàn bộ không gian làm việc", và đẩy chi phí di chuyển khi đổi agent về gần không — khiến cam kết không khóa hãng trở nên đáng tin.

### 6. Mặc định không cần cấu hình + linh hoạt BYOK

Mô hình tích hợp sẵn nghĩa là mặc định không cần cấu hình: một tài khoản, mọi mô hình SOTA, không cần quản lý API key. BYOK nghĩa là khóa của bạn, nhà cung cấp của bạn, giá của bạn. Điều này thỏa mãn cả dễ dùng lẫn tự chủ — đường mặc định không ma sát, đường nâng cao không bị khóa.

### 7. Runtime tự chứa

Đóng gói API runtime, Node/npm và Python vào gói runtime, ứng dụng desktop dàn dựng trước khi chạy. Điều này đảm bảo **tính xác định môi trường** (không phụ thuộc phiên bản Node/Python của máy chủ), tính khả chuyển và tính tái lập — một không gian làm việc AI không thể đặt trên giả định "môi trường máy người dùng tình cờ đúng".

### 8. Bảo mật ưu tiên hàng đầu

`contextIsolation` + cầu preload bị giới hạn + quy trình báo cáo lỗ hổng riêng tư rõ ràng + nhật ký kiểm toán doanh nghiệp. Agent có thể thao tác trình duyệt và file của bạn, nên bảo mật phải là công dân hạng nhất. Chính sách bảo mật liệt kê rõ năm lớp vấn đề nhạy cảm (lộ thông tin xác thực, RCE, thoát sandbox/leo thang đặc quyền, vượt xác thực, cấu hình mặc định không an toàn làm lộ runtime cục bộ), cho thấy đội ngũ coi trọng "quyền hạn của agent" đến mức nào.

### 9. Tài liệu xác định dành cho agent

INSTALL.md được viết rõ ràng như "một runbook thiết lập xác định cho một agent làm việc từ máy mới" — thậm chí cung cấp một câu bàn giao để Codex/Claude Code thực thi cài đặt trực tiếp. AGENTS.md yêu cầu icon đi qua lớp bao bọc `@/components/ui/icons` và commit dùng định dạng Conventional Commits chi tiết. **Chính kho lưu trữ này là một minh họa về "codebase thân thiện với agent"** — tài liệu được viết không chỉ cho con người đọc, mà cho agent thực thi.

## Các Quan Điểm Chính

### Quan điểm 1: Agent OS là lớp nền tảng tiếp theo

Lớp mô hình đang bị hàng hóa hóa (khoảng cách SOTA thu hẹp và ai cũng đuổi theo ai), còn lớp ứng dụng đã do các gã khổng lồ kiểm soát. Khoảng trống thực sự là **lớp hệ điều hành chứa các agent** — lớp điều phối bộ nhớ, công cụ, kỹ năng và ứng dụng. Đó chính xác là vị trí holaOS đặt cược. "Chiếc máy tính của bạn và agent của bạn" không phải khẩu hiệu tiếp thị; đó là một phán đoán nền tảng.

### Quan điểm 2: Bộ nhớ là hào phòng thủ

Bộ nhớ dùng chung bền vững qua phiên và qua agent là sự khác biệt sâu nhất của holaOS. Khi mọi agent đều gọi được mô hình và công cụ, **"việc ghi nhớ" mới là thứ khan hiếm**. Và lựa chọn "lưu dưới dạng file văn bản thuần bạn có thể đọc và sửa" cực kỳ thông minh: nó tôn trọng lời hứa local-first đồng thời làm cho bộ nhớ có thể kiểm toán, di chuyển và đáng tin cậy.

### Quan điểm 3: Sau khi mô hình bị hàng hóa hóa, lớp không gian làm việc bắt giá trị

Tư thế mô hình tiên phong tích hợp sẵn + BYOK cho thấy: holaOS không kiếm tiền từ mô hình (đó là lớp đã bị hàng hóa hóa) — nó kiếm tiền từ **điều phối, bộ nhớ, hệ sinh thái ứng dụng và bảo mật doanh nghiệp**. Đây là lời bác bỏ rõ ràng cho câu chuyện "mô hình là hào phòng thủ": hào phòng thủ nằm phía trên mô hình.

### Quan điểm 4: Con đường ba nhánh mã nguồn mở + lưu trữ + doanh nghiệp

Ứng dụng desktop (miễn phí bắt đầu) → tự lưu trữ mã nguồn mở (BYOK) → doanh nghiệp (SSO/kiểm toán/triển khai riêng). Đây vừa là phễu tăng trưởng (mã nguồn mở dẫn dắt, doanh nghiệp tạo doanh thu) vừa là chiến lược niềm tin (lựa chọn tự lưu trữ loại bỏ lo ngại "dữ liệu của tôi nằm trong đám mây của bạn").

### Quan điểm 5: Agent cần giao diện thao tác "nhìn thấy được, tiếp quản được"

Thiết kế cạnh nhau của HolaApps trả lời một câu hỏi then chốt về an toàn agent: **làm sao để người dùng tin agent vận hành ứng dụng thực?** Câu trả lời — làm cho thao tác hiển thị hoàn toàn (side-by-side) và khiến việc tiếp quản luôn có thể (step in whenever). Niềm tin không được xây bằng hệ thống quyền hạn; nó được xây bằng **sự minh bạch**.

### Quan điểm 6: Runtime tự chứa là lựa chọn thực dụng cho không gian làm việc AI

Đóng gói Node/npm/Python vào gói runtime hy sinh kích thước để đổi lấy tính xác định và khả chuyển. Với không gian làm việc AI, **tính tái lập quan trọng hơn tính nhẹ** — chuỗi công cụ mà agent thực thi phải ổn định. Lựa chọn này là bài học trực tiếp cho các sản phẩm tương tự.

### Quan điểm 7: Sự chuyển dịch mô hình từ "AI hội thoại" sang "AI không gian làm việc"

holaOS đại diện cho một sự đồng thuận đang hình thành: **tương tác AI cuối cùng không phải hộp thoại mà là một môi trường làm việc chia sẻ**. Agent làm việc trong trình duyệt của bạn, trong ứng dụng của bạn, trong hệ thống file của bạn, tạo sản phẩm giao thực, tiếp cận bạn từ mọi cửa ngõ chat, và chạy tự động theo lịch — "chat" chỉ là một giao diện người-máy trong số nhiều giao diện, không còn là toàn bộ sản phẩm.

## Kết Luận

holaOS là một trong những dự án tiêu biểu nhất của "trường phái không gian làm việc" trong cuộc đua cơ sở hạ tầng agent năm 2026. Nó không đặt cược agent nào thắng; nó đặt cược vào một lớp cơ bản hơn: **chiếc máy tính của kỷ nguyên agent**. 7.4k sao và 642 fork cho thấy phán đoán này được cộng hưởng rộng rãi.

Bài học cốt lõi có thể cô đọng thành một câu: **khi mô hình không còn khan hiếm, "không gian làm việc bền vững chia sẻ với agent của bạn" mới là thứ khan hiếm.** Dù là thiết kế bộ nhớ dùng chung local-first, mô hình HolaApps giao diện thực thay vì chat, hệ thống kỹ năng dạy một lần dùng mọi nơi, hay tài liệu xác định viết cho agent, holaOS đều trả lời cùng một câu hỏi: **làm thế nào để "dùng bất kỳ agent nào làm bất kỳ việc gì" trở nên tự nhiên, đáng tin cậy và có thể tiếp quản như dùng một chiếc máy tính.**

Với người đang xây dựng sản phẩm AI, holaOS đáng mổ xẻ ở nhiều khía cạnh: cấu trúc monorepo, cách tiếp cận runtime tự chứa, mô hình tương tác cạnh nhau của HolaApps, và phán đoán sản phẩm "bộ nhớ là hào phòng thủ". Với người dùng cuối, nó mang một lời hứa hiếm có: **đổi agent không còn nghĩa là bắt đầu từ con số không.**