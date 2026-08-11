---
title: "T3 Code phân tích chuyên sâu: Một 'agent harness control surface' mã nguồn mở điều khiển năm coding agent — Hình thái sản phẩm, hướng dẫn thực hành và triết lý thiết kế"
description: "Dùng pingdotgg/t3code (GitHub 18k+ stars, MIT, mã nguồn mở) làm trục chính, bài viết bóc tách T3 Code theo từng lớp: (1) tổng quan dự án — một 'agent harness control surface' mã nguồn mở điều khiển Codex / Claude / Cursor / Grok / OpenCode từ web + desktop + mobile; (2) hướng dẫn thực hành — khởi chạy `npx t3@latest`, cài desktop, 5 provider với lệnh đăng nhập, 4 chế độ phân quyền (Supervised / Auto-accept edits / Auto / Full access), truy cập từ xa (LAN / Tailscale / T3 Connect / SSH), 4 source-control (GitHub/GitLab/Bitbucket/Azure DevOps), xác thực WebSocket + OAuth + DPoP, keybindings và thread pin; (3) kiến trúc kỹ thuật — Effect RPC WebSocket, event-sourced orchestration (command→decider→event→projector), 5 provider driver, checkpoint (hidden git ref), 3 queue-backed worker, sidecar giám sát tài nguyên Rust; (4) 6 triết lý thiết kế — Open at the core, Performance without compromise, Remote ready, Multi-surface, Complexity at the adapter boundary, Event-sourced truth. Luận điểm cốt lõi: agent harness là một hình thái sản phẩm cần control surface, không phải một framework agent khác; T3 Code là hiện thực hóa kỹ thuật của phán đoán đó."
date: "2026-08-10"
author: "TopDigg Research Team"
tags: ["T3 Code", "t3code", "pingdotgg", "Agent Harness", "AI Agent", "Coding Agent", "Codex", "Claude Code", "Cursor", "Grok", "OpenCode", "Effect RPC", "Event Sourcing", "Remote Access", "Tailscale", "T3 Connect", "WebSocket", "OAuth", "Clerk", "Electron", "React Native", "Open Source", "MIT"]
categories: ["Deep Dive"]
keywords: ["T3 Code", "t3code", "pingdotgg", "agent harness", "control surface", "multi-provider", "Codex CLI", "Claude Code", "Cursor CLI", "Grok Build CLI", "OpenCode", "Effect RPC", "WebSocket", "event-sourced", "checkpoint", "Tailscale", "T3 Connect", "Clerk OAuth", "DPoP", "Electron", "React Native", "Expo", "triết lý thiết kế", "AGENTS.md"]
---

# T3 Code phân tích chuyên sâu: Một "agent harness control surface" mã nguồn mở điều khiển năm coding agent — Hình thái sản phẩm, hướng dẫn thực hành và triết lý thiết kế

> Ý tưởng cốt lõi: **T3 Code (pingdotgg/t3code) không phải là một framework agent khác — đó là một "agent harness control surface": một server Node WebSocket gom 5 provider CLI (Codex / Claude / Cursor / Grok / OpenCode) thành một môi trường thực thi có thể điều khiển từ xa, rồi cung cấp nó qua 3 client surface (web + desktop (Electron) + mobile (React Native)).** Phán đoán cốt lõi ăn vào sản phẩm là: khả năng của model đã vượt qua framework agent, nên **nút thắt thật sự là "làm sao quản lý 5 agent khác nhau trên một máy và truy cập từ bất kỳ đâu."** T3 Code dùng Effect RPC WebSocket, event-sourced orchestration, hidden git ref cho checkpoint, một sidecar Rust độc lập để giám sát tài nguyên, Clerk OAuth với DPoP proof-of-possession, và ba đường truyền từ xa (Tailscale / T3 Connect / SSH) để biến "agent harness" thành một hình thái sản phẩm hoàn chỉnh — và phát hành MIT. Triết lý thiết kế của nó (ghi lại nguyên bản trong AGENTS.md) nén thành sáu câu: **Open at the core; Performance without compromise; Remote ready; Multi-surface; Complexity belongs at the adapter boundary; Event-sourced truth**.

---

## 1. Tổng quan dự án

### 1.1 Nó là gì?

Bài viết này phân tích GitHub repo [`pingdotgg/t3code`](https://github.com/pingdotgg/t3code) (**18k+ stars / 4k+ forks / 1.5k+ issues**, TypeScript, **giấy phép MIT**) — một "agent harness control surface" mã nguồn mở bắc cầu qua năm provider coding agent.

Tóm tắt trong một câu:

> **T3 Code = một server Node WebSocket local + một React web UI + một Electron desktop shell + một React Native mobile app cho phép bạn điều khiển các agent Codex / Claude Code / Cursor / Grok Build / OpenCode trên máy của mình từ bất kỳ thiết bị nào (điện thoại, máy tính bảng, máy tính khác).**

T3 Code tự nó **không huấn luyện model, không tạo framework agent, không thay thế subscription của bạn**. Nó làm năm việc:

1. **Bọc các provider CLI** — gấp 5 giao thức khác nhau (Codex app-server, Claude SDK, Cursor agent, Grok CLI, OpenCode SDK) thành một interface "provider driver + adapter" duy nhất.
2. **Chạy một server local** — tiến trình Node khởi động bằng `npx t3@latest` (tên package đúng là `t3`) là **ranh giới thực thi** cho mọi tiến trình provider, terminal, thao tác git, và đọc filesystem; client không bao giờ gọi provider trực tiếp.
3. **Điều khiển từ xa** — cùng một giao thức Effect RPC WebSocket có thể được kết nối qua bốn đường truyền: cùng mạng, Tailscale, T3 Connect (Cloudflare tunnel), hoặc desktop-managed SSH.
4. **UI đa bề mặt** — web, desktop (Electron bọc web bundle), và mobile (Expo / React Native, iOS + Android native).
5. **Mã nguồn mở + MIT** — AGENTS.md nói thẳng: "if we ever go the wrong direction, you have everything you need to fork."

### 1.2 Định vị một dòng

> **T3 Code là giải pháp thay thế mã nguồn mở, bring-your-own-subscription cho Claude Desktop, Codex App, Cursor Glass và Conductor.**

### 1.3 Sự kiện chính

- **Dữ liệu**: GitHub 18,104 stars · 4,083 forks · 1,510 open issues (README + GitHub API)
- **Giấy phép**: MIT
- **Ngôn ngữ chính**: TypeScript (pnpm workspace + Vite+)
- **Yêu cầu Node server**: `^22.16 || ^23.11 || >=24.10`
- **5 provider được hỗ trợ**: Codex (OpenAI), Claude Code (Anthropic), Cursor (Cursor), Grok Build (xAI), OpenCode (SST)
- **3 bề mặt client**: Web (`app.t3.codes` hosted + `npx t3` local), Desktop (Electron shell), Mobile (React Native, iOS App Store / Google Play)
- **4 đường truyền từ xa**: direct WebSocket, Tailscale Serve, T3 Connect (Cloudflare tunnel), desktop-managed SSH
- **4 chế độ phân quyền**: `approval-required` (Supervised) / `auto-accept-edits` / `auto` / `full-access`
- **3 lớp (orchestration)**: `apps/server` (execution runtime) / `apps/web`, `apps/desktop`, `apps/mobile` (client) / `packages/*` (chia sẻ contracts, client runtime, telemetry, SSH, Tailscale)
- **Sự kiện kiến trúc cốt lõi**: server dùng event-sourced orchestration (command → decider → event → projector), checkpoint mỗi turn bằng hidden git ref, sidecar Rust độc lập cho resource telemetry (không dùng Node native addon), Clerk OAuth + DPoP proof-of-possession cho auth
- **Chính sách đóng góp**: "We are (mostly) not accepting contributions yet. Small fixes may be considered. Big features will not be." — dự án giai đoạn đầu có rào cản cao, do Theo (`-bPingdotgg`) trực tiếp quản lý
- **Quy mô người dùng**: AGENTS.md nêu "over 100,000 users"
- **Tên repo**: `pingdotgg/t3code` (tên GitHub là `t3code`, app là "T3 Code")

### 1.4 Vấn đề nó giải quyết

"Trải nghiệm phát triển agent" năm 2026 bị xé thành năm mảnh:

1. **5 provider, 5 sản phẩm khác nhau** — Codex có app riêng, Claude Code có CLI riêng, Cursor có desktop riêng, Grok Build vẫn còn beta, OpenCode là SDK. Chuyển qua lại giữa chúng là rời rạc.
2. **Chỉ dùng được trước máy làm việc** — khi bạn cầm điện thoại, agent trên laptop không còn hữu ích.
3. **Đồng bộ thiết bị yếu** — mở thread trên desktop, không xem được trên mobile.
4. **Từ xa + bảo mật + hiệu năng** — Tailscale hoặc SSH port-forward hoạt động, nhưng mỗi dự án tự cài lại; managed tunnel thường hy sinh hiệu năng.
5. **Phân quyền thô** — bạn không muốn model chạy `rm -rf` trên nhánh chính mà không có giám sát.

Câu trả lời của T3 Code: **một execution runtime mã nguồn mở, một giao thức từ xa, một bộ 4 chế độ phân quyền, ba client native, năm tích hợp provider** — gộp "agent harness" từ 5 sản phẩm thành 1.

---

## 2. Hướng dẫn chi tiết: Từ Zero đến điều khiển từ xa 5 agent

Phần này đi theo Cài đặt → Providers → 4 Chế độ phân quyền → Truy cập từ xa → Source Control → Nâng cao, mỗi bước kèm lệnh copy-paste được, ví dụ tối thiểu và lưu ý. Nguồn: [docs/user/](https://github.com/pingdotgg/t3code/tree/main/docs/user).

### 2.1 Bước 1: Cài đặt T3 Code

**Điều kiện tiên quyết**:

- Node.js `^22.16 || ^23.11 || >=24.10` trên **máy chạy T3 server**
- Ít nhất một provider CLI đã cài và đăng nhập (Bước 2 dưới)

**Dùng thử nhanh nhất (không cài gì)**:

```bash
npx t3@latest
```

Khởi động T3 server trên máy và mở local web app. `npx t3@latest --help` để xem toàn bộ CLI reference.

**Desktop app** (nhiều người bắt đầu từ đây):

| Nền tảng | Lệnh |
|---|---|
| Windows | `winget install T3Tools.T3Code` |
| macOS | `brew install --cask t3-code` |
| Arch Linux | `yay -S t3code-bin` |
| Bất kỳ | Tải từ [GitHub Releases](https://github.com/pingdotgg/t3code/releases) |

> Điểm mấu chốt: desktop app có sẵn một `t3` backend; bạn cũng có thể để desktop app làm server rồi kết nối từ điện thoại hay máy khác.

### 2.2 Bước 2: Cài và đăng nhập provider

T3 Code **không đóng gói** provider CLI — bạn tự cài cái nào dùng cái đó. Đăng nhập trên **máy chạy T3 server** (không phải điện thoại, không phải thiết bị bạn đang duyệt):

| Provider | Cài CLI | Đăng nhập | Binary mặc định |
|---|---|---|---|
| **Codex** | [Codex CLI](https://developers.openai.com/codex/cli) | `codex login` | `codex` |
| **Claude** | [Claude Code](https://claude.com/product/claude-code) | `claude auth login` | `claude` |
| **Cursor** | [Cursor CLI](https://cursor.com/cli) | `agent login` | `cursor-agent` |
| **Grok Build** | [Grok Build CLI](https://x.ai/cli) | `grok login` | `grok` |
| **OpenCode** | [OpenCode](https://opencode.ai) | `opencode auth login` | `opencode` |

> **Bẫy Cursor**: cài binary `cursor-agent`, nhưng **đăng nhập bằng `agent login`, không phải `cursor-agent login`**. Tài liệu Cursor không nói điều này; tài liệu T3 Code cảnh báo rõ ràng.

**Không thấy CLI?** Dùng Settings → provider instance → **Binary path** để đặt đường dẫn tuyệt đối (thường cần khi dùng Volta / asdf / fnm khiến CLI không nằm trong PATH của shell khởi động T3).

**Khi nào cần đăng nhập?** Trước khi bắt đầu session với provider đó, không phải trước khi khởi động T3. Có thể cài T3, mở T3, rồi thêm provider sau. Provider chưa đăng nhập hiện trạng thái trong Settings và sẽ fail lúc bắt đầu session kèm lệnh đăng nhập cần chạy.

### 2.3 Bước 3: Chọn chế độ phân quyền (4 lựa chọn)

Chế độ phân quyền được đặt riêng cho từng thread từ mode control trong message composer. AGENTS.md và `docs/user/permission-modes.md` đối chiếu bốn chế độ:

| Chế độ | Hành vi | Khi nào dùng |
|---|---|---|
| **Supervised** ("Approve actions" trên mobile) | Hỏi trước lệnh và thay đổi file | Task lạ; repo có giá trị cao |
| **Auto-accept edits** | Sửa file tự động; lệnh vẫn hỏi | Refactor mà edit mới là mục đích |
| **Auto** | Thao tác thường ngày chạy; thao tác nguy hiểm vẫn hỏi | Dev hàng ngày; Codex ủy quyền cho AI reviewer, Claude dùng auto mode riêng, provider không có tương đương (như OpenCode) fallback về hỏi |
| **Full access** (mặc định) | Cho phép lệnh và edit không hỏi | worktree / sandbox có thể vứt |

Thread tạo từ thread khác **thừa hưởng** mode của thread cha; nếu không thì thread mới mặc định Full access.

Mỗi chế độ được provider ánh xạ sang cài đặt approval/sandbox riêng: Codex dịch sang `approval-policy` + cấp `sandbox`, Claude dùng `auto-permission-mode`. Mobile cung cấp cùng 4 chế độ; dán nhãn chế độ đầu là "Approve actions" thay vì "Supervised".

### 2.4 Bước 4: Truy cập từ xa

"Remote ready" là lời hứa cốt lõi. Tài liệu phân biệt rõ bốn cách truy cập.

#### 2.4.1 Direct WebSocket (cùng mạng, đơn giản nhất)

Nếu T3 server chạy ở `192.168.x.y:3773`, điện thoại/PC cùng LAN kết nối thẳng `http://192.168.x.y:3773` với pairing token. **Lưu ý**: trình duyệt trong trang HTTPS không dùng được plain-HTTP endpoint (mixed-content rule) — dùng HTTPS, hoặc dùng desktop app/CLI kết nối trực tiếp.

#### 2.4.2 Tailscale (khuyến nghị)

Nếu bạn chạy Tailscale, desktop app tự động phát hiện tailnet và liệt kê tailnet IP (`100.x.y.z`), MagicDNS, Tailscale Serve HTTPS làm endpoint trong Settings → Connections.

```bash
# Bật Tailscale HTTPS
npx t3 serve --tailscale-serve
# Backend được lộ ở https://machine.tailnet.ts.net/
```

Hoặc bật công tắc **Tailscale HTTPS** trong Settings desktop (mặc định off); desktop app sẽ tự chạy `tailscale serve --https=443` để thiết lập mapping.

**Tại sao khuyến nghị**: địa chỉ ổn định + mã hóa tầng vận chuyển + không lộ công khai.

#### 2.4.3 T3 Connect (Cloudflare tunnel, không cần cấu hình mạng)

T3 Connect là giải pháp Cloudflare-tunnel do T3 Code tự quản lý — dùng khi máy bạn sau NAT, cổng vào không khả dụng, hoặc mobile cần truy cập env do desktop host. Xác thực qua Clerk OAuth.

```bash
# Trên máy T3 server
npx t3 connect link
# Cài pinned managed cloudflared, cấp quyền, lưu intent
npx t3 serve
# Reconcile relay link và khởi chạy managed tunnel
```

Cách hoạt động: relay Worker **chỉ môi giới credentials và managed endpoint**; traffic ứng dụng chảy qua Cloudflare tunnel hostname đã được provision, **không qua chính relay Worker**.

**Desktop app + T3 Connect**:
1. Settings → T3 Connect → đăng nhập (Clerk)
2. Settings → T3 Connect → "Link this environment"
3. Trên mobile: Connections → Add Environment → đăng nhập cùng tài khoản; tự động phát hiện

#### 2.4.4 Desktop-Managed SSH Launch

Desktop app có thể **SSH sang máy từ xa, khởi động hoặc tái sử dụng T3 server, và port-forward ngược về**. Settings → Connections → Add environment → SSH launch flow → nhập `user@example.com` → xác nhận. Desktop sẽ:

1. Probe host
2. Khởi động hoặc tái sử dụng T3 server từ xa
3. Mở local port forward
4. Lưu env (reconnect tự động dùng lại)

> **Xử lý sự cố SSH launch**: máy từ xa phải có Node tương thích (`^22.16 || ^23.11 || >=24.10`); người dùng nvm chạy `nvm alias default 24`; launcher ghi `~/.t3/ssh-launch/<host-key>/`, kill tiến trình cũ, khởi động server mới — thường không cần dọn dẹp thủ công.

#### 2.4.5 Pairing Protocol (chung cho mọi đường truyền)

Bất kể đường truyền nào, quy trình pairing là:

1. `t3 serve` cấp một owner pairing token dùng một lần
2. Thiết bị từ xa đổi token với server để lấy session
3. Sau đó truy cập theo session — không cần dùng lại token gốc trừ khi pair thiết bị mới

**Một URL hosted pairing có dạng**:

```text
https://app.t3.codes/pair?host=https://backend.example.com:3773#token=PAIRCODE
```

- Token nằm trong URL hash (**không gửi tới hosted app origin**)
- Hosted app **không proxy traffic** — trình duyệt kết nối trực tiếp tới backend URL
- Chỉ hoạt động khi backend truy cập được từ trình duyệt qua HTTPS/WSS. Với plain HTTP LAN endpoint, dùng URL pairing trực tiếp từ desktop/CLI

#### 2.4.6 Quản lý truy cập sau pairing

`npx t3 auth`:
- Cấp thêm pairing credentials
- Kiểm tra session đang hoạt động
- Thu hồi link pairing hoặc session cũ

### 2.5 Bước 5: Tích hợp source control

T3 Code tích hợp trực tiếp với bốn nền tảng Git. Việc xác thực diễn ra trên **máy T3 server**, không phải trình duyệt.

#### 2.5.1 GitHub

```bash
brew install gh
gh auth login
# Mở T3 Code → Settings → Source Control; xác nhận GitHub đã đăng nhập
```

Có thể: clone, publish, tạo PR (T3 Code đề xuất tiêu đề/mô tả dựa trên commits), review PR (mở branch đồng nghiệp trong tab right-panel).

#### 2.5.2 GitLab

```bash
brew install glab
glab auth login
```

Hỗ trợ Merge Request, publish repository, hosted clone.

#### 2.5.3 Bitbucket

Không có CLI, dùng **biến môi trường** (khuyến nghị access token):

```bash
export T3CODE_BITBUCKET_ACCESS_TOKEN="your-access-token"
# hoặc
export T3CODE_BITBUCKET_EMAIL="you@example.com"
export T3CODE_BITBUCKET_API_TOKEN="your-token"
# Đặt xong khởi động lại T3 Code
```

Nếu đặt cả hai, access token thắng.

#### 2.5.4 Azure DevOps

```bash
brew install azure-cli
az extension add --name azure-devops
az login
```

#### 2.5.5 Tổng quát

**Bất kỳ Git URL nào** cũng có thể clone qua Custom Git URL. Repo local chưa có commit có thể dùng **Publish Repository** để tạo repo hosted (GitHub / GitLab / Bitbucket / Azure DevOps), thêm origin và push — tất cả trong một flow.

### 2.6 Bước 6: Keybindings và quản lý thread

#### 2.6.1 Keybindings

Lưu tại `~/.t3/userdata/keybindings.json` (trên máy T3 server). T3 Code ghi default có sẵn khi khởi động lần đầu, sau đó thêm default mới ở các lần khởi động sau — **trừ khi rule của bạn đã chiếm command hoặc shortcut đó**. Rule không hợp lệ bị bỏ qua; file không hợp lệ bị bỏ qua toàn bộ kèm cảnh báo trong server log.

Định dạng:

```json
[
  { "key": "mod+g", "command": "terminal.toggle" },
  { "key": "mod+shift+g", "command": "terminal.new", "when": "terminalFocus" }
]
```

`key` hỗ trợ `mod` (cmd trên macOS, ctrl ở nơi khác), `cmd`/`meta`, `ctrl`/`control`, `shift`, `alt`/`option`. `when` hỗ trợ `!`, `&&`, `||`, ngoặc. Context keys hiện tại: `terminalFocus`, `terminalOpen`, `previewFocus`, `previewOpen`, `modelPickerOpen` (coi là tăng dần theo thời gian, không cố định).

Đánh giá: **duyệt theo thứ tự mảng; rule cuối cùng có `key` khớp và `when` đúng sẽ thắng**. Thứ tự ưu tiên xét xuyên suốt giữa các command, không chỉ trong một command.

#### 2.6.2 Pin thread và sắp xếp đa thiết bị

- Pin thread từ context menu — nó xuất hiện phía trên công việc đang chạy, trong mục pinned, trên mọi thiết bị đang kết nối
- Web/Desktop: kéo để sắp xếp lại. Mobile: Move up / Move down trong menu thread
- **Thứ tự lưu trên server** và đồng bộ tới mọi thiết bị kết nối
- Server cũ pin/unpin được nhưng không hiểu sắp xếp đồng bộ — hãy nâng cấp server

#### 2.6.3 Tùy biến icon dự án

Settings → Projects → chọn dự án → Appearance → Choose a project file. Hỗ trợ SVG, PNG, ICO, JPEG, GIF, AVIF, WebP. Phát hiện tự động mặc định nhìn vào `t3.json`, các đường dẫn favicon / app icon thông thường, và `<link rel="icon">` trong file HTML.

### 2.7 Bước 7: Giữ cho app và server đồng bộ

Client do `npm run build` tạo ra kỳ vọng server cùng phiên bản — **lệch phiên bản sẽ hiện cảnh báo** ở:

- Hộp thoại hiện tại (phía trên message box)
- Settings → Connections, cạnh connection bị ảnh hưởng

Hành động phù hợp tùy cách server được khởi động:

| Cách khởi động | Việc cần làm |
|---|---|
| **Linux background service** | Nhấn nút **Update server**; T3 Code tự chuẩn bị, kiểm thử, khởi động lại, và kết nối lại |
| **Desktop app** | Cập nhật desktop app trên **máy chạy server** |
| **CLI (`npx t3`)** | Nhấn **Copy update command**, rồi chạy `npx t3@<client-version>` trên máy server |

Chi tiết background service: `npx t3@latest service install/update/status/uninstall`. systemd unit chạy một **launcher ổn định** (bất biến); các phiên bản chính xác nằm độc lập dưới `versions/<version>` — trial thất bại **cuộn về** phiên bản trước mà không cần viết lại unit. Launcher **snapshot toàn bộ SQLite** (gồm WAL và SHM) sau khi dừng server cũ và trước khi trial bắt đầu, nên database migration cuộn ngược theo phiên bản — **không cần down migration**. Trial phải báo `prepared` trong 120 giây; nếu không launcher dừng trial, khôi phục snapshot, ghi nhận rollback, và khởi động A.

### 2.8 Bước 8: Linux Background Service

```sh
npx t3@latest service install   # cài
npx t3@latest service status    # kiểm tra
npx t3@latest service update    # nâng cấp/sửa
npx t3@latest service uninstall # gỡ
```

Hiện yêu cầu **Linux + systemd**. Đăng xuất khỏi T3 Connect **không** gỡ service.

---

## 3. Tổng hợp quan điểm: 8 kết luận cốt lõi

Sau khi đọc tài liệu thiết kế, AGENTS.md và các trang kiến trúc, tám phán đoán về hình thái sản phẩm trong kỷ nguyên agent nổi lên.

### 3.1 Quan điểm 1: Agent harness là hình thái sản phẩm mới, không phải framework agent khác

AGENTS.md mở đầu: "T3 Code is a minimal GUI for coding agents." — nhưng ngay lập tức trở thành công cụ: bọc 5 provider CLI, chạy một Node server sở hữu mọi thực thi, phơi bày 3 client để điều khiển từ xa.

Hàm ý: **khi khả năng model đủ mạnh, lớp framework agent đồng nhất hóa — sự khác biệt nằm ở "làm sao giữ agent chạy lâu, kết nối xa, và quan sát rõ."** T3 Code biến phán đoán này thành hình thái sản phẩm có tên "agent harness control surface".

**Kết luận**: nếu bạn đang xây dựng công cụ coding agent, **đừng cạnh tranh ở framework agent** — cạnh tranh ở môi trường thực thi, đường truyền từ xa, trải nghiệm đa bề mặt, khả năng quan sát.

### 3.2 Quan điểm 2: Ranh giới thực thi nằm trên server, không phải client

Từ tài liệu kiến trúc:

> "every provider process, terminal, git operation, and filesystem read happens there, never in the client."

Thực thi hóa:
- Client **không bao giờ gọi provider trực tiếp** — mọi thao tác provider đi qua RPC `orchestration.dispatchCommand`
- Client **không tự tạo RPC client, retry loop, raw orchestration command** (gói `client-runtime` sở hữu tất cả)
- Terminal, git, fs đều nằm trên server

Cách vẽ ranh giới này cho phép T3 Code **tùy ý hoán đổi hình thái client** — thêm client thứ tư, thứ năm không thay đổi ngữ nghĩa thực thi phía server.

**Kết luận**: khi xây sản phẩm agent đa bề mặt, **đặt ranh giới thực thi trên server** — đừng để client chạy tiến trình provider, nếu không mỗi client mới sẽ phải viết lại runtime.

### 3.3 Quan điểm 3: Event sourcing là hình dáng đúng cho orchestration agent

Orchestration của server là event-sourced:

```
command → decideOrchestrationCommand (hàm thuần) → events
events → projector → read model (messages, threads, checkpoints, session status)
events đồng thời được append vào event store
append + project nằm trong một SQL transaction
```

**Những gì nó mang lại**:
- **Read model không thể lâu dài mâu thuẫn với event log** — cùng transaction
- **Replay-on-failure dễ dàng** — khi dispatch thất bại, đọc lại event quá starting sequence và reconcile
- **"Turn xong" có định nghĩa có thẩm quyền** — session rời `running` (không phải "checkpoint/diff xong")
- **Idempotency tự nhiên** — `processEnvelope` kiểm tra durable command receipt trước, nên retry cùng command là idempotent

**Kết luận**: lớp kép "hội thoại + công việc" của agent (tin nhắn user + lời gọi tool + file diff + text agent) vừa khớp với event sourcing. Đừng cố mô tả nó như một state machine CRUD.

### 3.4 Quan điểm 4: Trừu tượng provider thuộc về biên adapter, orchestration giữ thuần

5 provider driver + 5 adapter là hai mảnh:

- **driver** khai báo `driverKind` + `configSchema` + `create` (xây adapter)
- **adapter** thực thi interface `ProviderAdapter`

`ProviderService` ngồi phía trên — **nó không biết agent nào đứng sau thread, chỉ biết có thread**. `thread.turn.start` và `thread.approval.respond` là toàn bộ primitive client-dispatchable; `thread.message.assistant.delta` và `thread.session.set` là sự kiện nội bộ do reactor phía server phát ra.

**Thêm provider = viết một driver + một adapter + thêm vào `BUILT_IN_DRIVERS`** — không sửa orchestration, contract, hay client.

**Kết luận**: **complexity belongs at the adapter boundary** (nguyên văn AGENTS.md) — cách ly sự đa dạng trong adapter, giữ thân chính thuần.

### 3.5 Quan điểm 5: Từ xa = một giao thức + nhiều cách truy cập, không phân tách runtime

Từ tài liệu: "Remoteness is expressed at the connection layer, never by splitting the runtime."

Thực tế:
- Dù LAN, Tailscale, T3 Connect hay desktop SSH, **T3 server là cùng một tiến trình**, cùng event log, cùng SQLite
- 4 access method (trực tiếp / Tailscale / T3 Connect / desktop SSH) chỉ là **sự khác biệt về connection layer**
- 3 launch method (đã có sẵn / desktop SSH launch / client-managed publish) chỉ là **server xuất hiện như thế nào**

**Kết luận**: khi xây sản phẩm agent từ xa, **giữ giao thức ổn định, đa dạng hóa connection layer** — đừng viết một runtime riêng cho mỗi đường truyền.

### 3.6 Quan điểm 6: Capability-based OAuth đánh bại role-based cho agent đa bề mặt

T3 Code không dùng mô hình role `admin`/`user`. Nó dùng chuỗi scope kiểu OAuth:

```
orchestration:read / orchestration:operate / terminal:operate /
review:write / access:read / access:write / relay:read / relay:write
```

Một pairing thường cấp bốn scope client-operation cộng `relay:read`; bootstrap credential cấp thêm `access:read/write` và `relay:write`. **Mỗi RPC method tự khai báo required scope** thông qua map `RPC_REQUIRED_SCOPE`.

Auth flow phù hợp RFC 6750 (Bearer) + RFC 8693 (Token Exchange) + RFC 6749 (Scopes):
- `POST /oauth/token` với `grant_type=urn:ietf:params:oauth:grant-type:token-exchange`
- `POST /api/auth/websocket-ticket` trả về ticket ngắn 5 phút, **giữ token dài hạn khỏi URL WebSocket**
- **DPoP-bound access token** (proof-of-possession) cho client do relay môi giới, TTL 1 giờ — token lộ không replay được nếu thiếu proof key

**Kết luận**: nền tảng agent không nên dùng mô hình nhị phân "admin / user thường" — dùng capability scope, để mỗi RPC method tự khai báo năng lực cần thiết.

### 3.7 Quan điểm 7: Sidecar Rust độc lập an toàn hơn Node native addon

Tại sao không dùng Node native addon để đọc process counter? Câu trả lời từ tài liệu:

> "The cost is one persistent child process and NDJSON serialization. That is a better failure boundary than repeatedly spawning shell utilities or loading native code into Node."

Thực tế:
- `native/resource-monitor` là **một Rust executable độc lập** (dùng crate `sysinfo`), giao tiếp NDJSON qua stdin/stdout
- **Không** phải N-API / `ffi-rs` / dynamic library
- Monitor crash **không thể làm hỏng Node runtime** — server có thể supervise, restart, version-check, đo monitor như một child process bình thường
- **Cùng một giao thức** hoạt động trên desktop / web / headless server
- **Đóng gói đơn giản** — binary đơn nền tảng, **không có ma trận N-API × Node × Electron ABI**

Desktop app xếp thêm Electron host telemetry (powerMonitor, `app.getAppMetrics`, trạng thái nguồn host) thông qua fd 4 và fd 5 kế thừa — **không** qua renderer WebSocket.

**Kết luận**: khi cần dữ liệu cấp OS, **sidecar độc lập + NDJSON an toàn hơn Node native addon** — ranh giới thất bại, kiểm soát phiên bản, và đóng gói đều vượt trội.

### 3.8 Quan điểm 8: Triết lý thiết kế thuộc về AGENTS.md, không phải truyền miệng

T3 Code viết triết lý thiết kế vào `AGENTS.md` ở thư mục gốc repo — một trong những điều đáng bắt chước nhất của dự án. Bốn nguyên tắc đánh số:

```
1. Open at the core
2. Performance without compromise
3. Remote ready
4. Multi-surface
   - Web (2 surfaces: app.t3.codes + npx t3)
   - Desktop (Electron shell)
   - Mobile (React Native)
```

Đoạn "a note from Theo" đáng trích nguyên văn:

> "I like ambitious ideas, simple systems, and software that feels obvious. Do not preserve complexity just because it already exists. Do not introduce machinery because it looks architecturally impressive. Understand the real constraint, then fight for the smallest model that makes the correct behavior unsurprising."

> "Channel both 'measure twice, cut once' and 'yagni'. Fight scope creep."

**Kết luận**: viết rõ "chúng tôi không làm gì" và "tại sao làm thế này" trong AGENTS.md — đó là cách duy nhất để dự án có rào cản cao mở rộng được.

### 3.9 Mối quan hệ giữa 8 quan điểm

```
Quan điểm 1: agent harness là hình thái sản phẩm mới
   ↓ (định vị sản phẩm)
Quan điểm 2: ranh giới thực thi trên server
   ↓ (nền tảng kiến trúc)
Quan điểm 3: event sourcing là hình dáng đúng cho orchestration
Quan điểm 4: trừu tượng provider ở biên adapter
   ↓ (khả năng mở rộng)
Quan điểm 5: từ xa = 1 giao thức + nhiều connection layer
Quan điểm 6: capability-based OAuth thắng mô hình role
   ↓ (chất lượng vận hành)
Quan điểm 7: sidecar Rust độc lập thắng Node native addon
Quan điểm 8: triết lý thiết kế sống trong AGENTS.md
```

Quan điểm 1 là phán đoán sản phẩm; 2/3/4 là nền tảng kỹ thuật; 5/6 là khả năng mở rộng và vận hành; 7/8 là kỷ luật kỹ thuật. Bỏ bất kỳ cái nào, hình thái sản phẩm sụp đổ.

---

## 4. Triết lý thiết kế: Đọc AGENTS.md như một design manifesto

Triết lý thiết kế của T3 Code không phải là một "manifesto" duy nhất — nó rải rác trong `AGENTS.md`, `docs/internals/*.md`, và các bản ghi quyết định kiến trúc trong `.plans/`. Gom lại, ta có sáu triết lý có thể dùng để đánh giá quyết định độc lập.

### 4.1 Triết lý 1: Open at the core

**Nguyên văn**: "T3 Code is truly open. We share our roadmap, we share how we think about things, and of course we share all our code."

**Thực tiễn**:
- Giấy phép MIT
- Roadmap trên GitHub
- Thư mục `.plans/` nội bộ ghi lại **mọi quyết định quan trọng** (`01-shared-model-normalization.md` → `19-remote-endpoints-hosted-static.md`, công khai hoàn toàn)
- `AGENTS.md` viết cho agent cũng là mã nguồn mở — **fork nó và nó chạy cho agent của bạn**
- "We work in the open, and should strive to stay that way."

**Lý do**: nếu không công bố quy trình thiết kế, "mã nguồn mở" chỉ là vỏ. T3 Code biến "open" thành **thực hành kỹ thuật có thể kiểm toán** — `.plans/` là dấu vết kiểm toán, `AGENTS.md` là sổ tay hành động.

### 4.2 Triết lý 2: Performance without compromise

**Nguyên văn**: "Lots of apps have gotten bogged down with bad tech decisions and 'slop'. We have not, and we're proud of the performance of T3 Code. We regularly audit for performance regressions, often caused by sending too much data over websockets, css animations causing gpu spikes, lists being hard to render, and more."

**Thực tiễn**:
- Kiểm toán lưu lượng WebSocket — **đừng đổ quá nhiều dữ liệu qua dây**
- Kiểm toán hoạt ảnh CSS — **không có hoạt ảnh vẽ lại liên tục**
- Kiểm toán render danh sách lớn
- "No continuously repainting animations; they peg the GPU on high-refresh displays." (nguyên văn AGENTS.md)
- Người dùng T3 Code **vận hành agent cả ngày** — "a dropped frame, a lying spinner, and a stale label" đều bị nhận ra

**Lý do**: UI chat agent thường **mở trong phiên dài** — vấn đề hiệu năng nhỏ tích tụ thành ma sát kéo dài. Hiệu năng không phải nice-to-have; nó là retention.

### 4.3 Triết lý 3: Remote ready

**Nguyên văn**: "The architecture of T3 Code's websocket layer (npx t3) enables a lot of awesome remote features. These have become core to the product."

**Thực tiễn**:
- 4 access method (trực tiếp / Tailscale / T3 Connect / desktop SSH) chia sẻ một Effect RPC WebSocket
- 4 launch method (đã có sẵn / desktop SSH launch / client-managed publish) chỉ là khác biệt về cách server xuất hiện
- Tailscale là **endpoint provider add-on**, không phải khái niệm runtime riêng
- WebSocket dùng **ticket ngắn 5 phút** để xác thực (token dài hạn không bao giờ xuất hiện trong URL)
- Mọi tính năng mới đều phải xét: "nó có chạy trong trường hợp từ xa không?"

**Lý do**: agent chạy 24×7 — người dùng không ngồi trước editor. **Từ xa không phải tiện ích thêm; nó là năng lực cốt lõi**. Làm đúng từ kiến trúc ban đầu rẻ hơn gắn thêm sau.

### 4.4 Triết lý 4: Multi-surface

**Nguyên văn**: "T3 Code has 3 key app surfaces: web, desktop, and mobile."

**Thực tiễn**:
- **Web thực ra là hai bề mặt**: `app.t3.codes` hosted + `npx t3` local — **cả hai phải được hỗ trợ**
- Desktop là Electron shell **tải web bundle qua giao thức `t3code://`**
- Mobile là React Native dùng **cùng `packages/client-runtime`**
- `apps/web/src/connection/runtime.ts` và `apps/mobile/src/connection/runtime.ts` **khớp từng dòng** (trừ lớp background-activity riêng platform)

**Lý do**: người dùng **không chỉ dùng một thiết bị** — desktop để làm việc, điện thoại kiểm tra tiến độ, tablet review PR. **Đa bề mặt là phân bố thực tế**, không phải "thêm một native app là xong".

### 4.5 Triết lý 5: Complexity belongs at the adapter boundary

**Nguyên văn**: "Complexity belongs at the adapter boundary. Orchestration stays pure, UI stays dumb."

**Thực tiễn**:
- `decider.ts` ở lớp orchestration là **hàm thuần** — `(command, state) => events`, không có side effect
- 5 provider adapter giam sự khác biệt giữa 5 giao thức CLI **trong file riêng của chúng**
- Effect dùng nặng ở server; **React component không bao giờ tự tạo transport, retry loop, RPC client** (gói `client-runtime` sở hữu)
- UI component là dumb — **trạng thái domain là Atom factory** (`createProjectEnvironmentAtoms`, `createThreadEnvironmentAtoms`)

**Lý do**: **lõi hàm thuần + cạnh side effect** là viên đạn bạc của kỹ thuật phần mềm — phần có thể test, suy luận, tiến hóa được tối đa; phần hỗn loạn bị nén lại ở biên.

### 4.6 Triết lý 6: Event-sourced truth

**Tài liệu**: "Orchestration is event-sourced. The server does not mutate app state directly. Clients dispatch typed commands; the engine turns them into persisted events; projections derive the read model."

**Thực tiễn**:
- **Read model và event log cùng một SQL transaction** — nhất quán bền vững là tự động
- `processEnvelope` đầu tiên kiểm tra **durable command receipt** — retry là idempotent
- **"Turn xong" có định nghĩa có thẩm quyền**: session rời `running` (không phải "checkpoint/diff xong")
- 3 queue-backed worker (`ProviderRuntimeIngestion` / `ProviderCommandReactor` / `CheckpointReactor`) xây trên `DrainableWorker` — **enqueue nguyên tử + đếm nguyên tử**
- **Runtime receipts chỉ dành cho test** — `RuntimeReceiptBusLive` là no-op trong production; chỉ tầng test mới dựa trên PubSub

**Lý do**: hệ thống agent vốn dĩ có **luồng dài + nhiều bước + dễ retry + side effect của tool** — event sourcing là **bộ xương tự nhiên nhất** cho hình dáng đó. Như glossary nói: "requested" = ý định đã ghi; "completed" = kết quả đã áp dụng; "receipt" = cột mốc bất đồng bộ chỉ dành cho test.

### 4.7 Tổng kết triết lý: 6 triết lý = design manifesto của T3 Code

| Triết lý | Một dòng | Thực tiễn |
|---|---|---|
| 1. Open at the core | Quy trình thiết kế cũng công khai | MIT + công khai `.plans/` + AGENTS.md mã nguồn mở |
| 2. Performance without compromise | Hiệu năng là retention | Kiểm toán lưu lượng WebSocket + hoạt ảnh + render danh sách |
| 3. Remote ready | Từ xa không phải tiện ích thêm | 4 access chia sẻ 1 giao thức + ticket ngắn 5 phút |
| 4. Multi-surface | Đa thiết bị là phân bố thực | Web (2) + Desktop + Mobile chia sẻ client-runtime |
| 5. Complexity at adapter boundary | Lõi hàm thuần + cạnh side effect | decider thuần + 5 provider adapter + UI dumb |
| 6. Event-sourced truth | Read model không thể mâu thuẫn event log | command → event → projection (cùng transaction) + retry idempotent |

**Sáu triết lý không độc lập — chúng tạo thành chuỗi**: open giúp fork dễ → performance giữ chân người dùng → remote giữ agent chạy → multi-surface cho phép nhiều thiết bị → cách ly adapter cho phép nhiều provider → event-sourcing giữ async ngăn nắp. **Bỏ bất kỳ cái nào, hình thái sản phẩm không trọn vẹn**.

### 4.8 Một đoạn "a note from Theo"

Một đoạn từ AGENTS.md đáng trích riêng:

> "I like ambitious ideas, simple systems, and software that feels obvious. Do not preserve complexity just because it already exists. Do not introduce machinery because it looks architecturally impressive. Understand the real constraint, then fight for the smallest model that makes the correct behavior unsurprising."

> "Channel both 'measure twice, cut once' and 'yagni'. Fight scope creep. Try to honor the dev's intent in both a minimal and realistic fashion."

> "The rest of this document is meant to help you navigate the codebase and make changes effectively. Think of these instructions less as 'hard rules', more as 'good defaults'. The developer's preferences should be able to override anything here."

**Đây không phải triết lý kỹ thuật — đó là triết lý làm việc.** Nó giải thích tại sao T3 Code chọn **bọc 5 provider thay vì tạo provider thứ 6**, **viết event sourcing thay vì CRUD**, **dùng sidecar Rust thay vì Node native addon** — luôn luôn vì **mô hình nhỏ nhất**.

---

## 5. Ý tưởng cốt lõi

Phán đoán quan trọng nhất T3 Code đưa ra: **năm 2026, hình thái sản phẩm tiếp theo trong kỷ nguyên agent không phải là "một framework agent khác" mà là "agent harness control surface" — một runtime thực thi local cho phép bạn tự do chuyển đổi giữa 5 provider, 3 client surface, và 4 đường truyền từ xa.**

- **Nó tái định nghĩa agent harness** — không phải framework, mà là control surface; không phải một provider, mà 5 provider tương thích; không phải desktop-only, mà web + desktop + mobile; không phải local-only, mà 4 đường truyền từ xa
- **Nó đặt ranh giới thực thi trên server** — mọi tiến trình provider, terminal, git, fs đều ở server; client không bao giờ gọi provider trực tiếp
- **Nó dùng event sourcing để giải quyết async của agent** — command → decider → event → projector (cùng SQL transaction), retry idempotent theo cấu trúc, "turn xong" có định nghĩa có thẩm quyền
- **Nó cách ly sự khác biệt provider trong adapter** — 5 driver + 5 adapter; orchestration giữ thuần; thêm provider thứ 6 không chạm vào thân chính
- **Nó biến từ xa thành ma trận 4 access × 3 launch** — cùng giao thức + nhiều connection layer, không phân tách runtime
- **Nó dùng capability scope cho auth** — kiểu OAuth 2.0 (RFC 6750/8693/6749) + ticket WebSocket 5 phút + DPoP proof-of-possession
- **Nó dùng sidecar Rust cho giám sát tài nguyên cấp OS** — không ô nhiễm Node runtime; một giao thức trên mọi nền tảng
- **Nó viết "chúng tôi không làm gì" vào AGENTS.md** — triết lý thiết kế, quyết định `.plans/`, danh sách hit-every-surface đều công khai

Câu cần nhớ: **T3 Code không tạo agent, không tạo model, không tạo subscription — nó tạo "agent harness control surface": cho phép 5 agent Codex/Claude/Cursor/Grok/OpenCode chạy trên cùng một server local, được điều khiển từ web/desktop/mobile, từ bất kỳ đâu, theo chính sách phân quyền của bạn.**

---

## Phụ lục A: Liên kết tham khảo

- [T3 Code GitHub repo](https://github.com/pingdotgg/t3code)
- [T3 Code README](https://github.com/pingdotgg/t3code/blob/main/README.md)
- [T3 Code AGENTS.md](https://github.com/pingdotgg/t3code/blob/main/AGENTS.md)
- [docs/README](https://github.com/pingdotgg/t3code/blob/main/docs/README.md)
- Tài liệu người dùng:
  - [Install](https://github.com/pingdotgg/t3code/blob/main/docs/user/install.md)
  - [Permission modes](https://github.com/pingdotgg/t3code/blob/main/docs/user/permission-modes.md)
  - [Remote access](https://github.com/pingdotgg/t3code/blob/main/docs/user/remote-access.md)
  - [Source control](https://github.com/pingdotgg/t3code/blob/main/docs/user/source-control.md)
  - [Keybindings](https://github.com/pingdotgg/t3code/blob/main/docs/user/keybindings.md)
  - [Thread sidebar](https://github.com/pingdotgg/t3code/blob/main/docs/user/thread-sidebar.md)
  - [Project settings](https://github.com/pingdotgg/t3code/blob/main/docs/user/project-settings.md)
  - [Updating](https://github.com/pingdotgg/t3code/blob/main/docs/user/updating.md)
  - [Background service](https://github.com/pingdotgg/t3code/blob/main/docs/user/background-service.md)
- Tài liệu nội bộ:
  - [Architecture overview](https://github.com/pingdotgg/t3code/blob/main/docs/internals/overview.md)
  - [Workspace layout](https://github.com/pingdotgg/t3code/blob/main/docs/internals/workspace-layout.md)
  - [Providers](https://github.com/pingdotgg/t3code/blob/main/docs/internals/providers.md)
  - [Connection runtime](https://github.com/pingdotgg/t3code/blob/main/docs/internals/connection-runtime.md)
  - [Remote architecture](https://github.com/pingdotgg/t3code/blob/main/docs/internals/remote.md)
  - [T3 Connect](https://github.com/pingdotgg/t3code/blob/main/docs/internals/t3-connect.md)
  - [Environment auth](https://github.com/pingdotgg/t3code/blob/main/docs/internals/environment-auth.md)
  - [Server updates](https://github.com/pingdotgg/t3code/blob/main/docs/internals/server-updates.md)
  - [Resource telemetry](https://github.com/pingdotgg/t3code/blob/main/docs/internals/resource-telemetry.md)
  - [Glossary](https://github.com/pingdotgg/t3code/blob/main/docs/internals/glossary.md)
  - [CI gates](https://github.com/pingdotgg/t3code/blob/main/docs/internals/ci.md)
- [Mobile README](https://github.com/pingdotgg/t3code/blob/main/apps/mobile/README.md)
- Tải về: [GitHub Releases](https://github.com/pingdotgg/t3code/releases) · `winget install T3Tools.T3Code` · `brew install --cask t3-code` · `yay -S t3code-bin`
- Trực tuyến: [app.t3.codes](https://app.t3.codes) · iOS App Store · Google Play
- Cộng đồng: [Discord](https://discord.gg/jn4EGJjrvv)
