---
title: "Agents in Orbs phân tích chuyên sâu: Khi agent học cách tự chạy code khi bạn không ngồi trước máy tính — Hướng dẫn thực hành Orb từ xa của Amp, triết lý thiết kế và năm điểm cốt lõi"
description: "Dựa trên thông báo chính thức ngày 2026-06-30 'Agents in Orbs' của Amp, bài xã luận ngày 2026-02-19 'The Coding Agent Is Dead', Hướng dẫn sử dụng Orbs, và bảng giá ngày 2026-08-07 'Size the Orbs of Production', bài viết phân tích toàn diện hình thái sản phẩm, chi tiết kỹ thuật và triết lý thiết kế của Amp 'Orb'. Nội dung bao gồm: (1) Orb là gì — một máy từ xa Debian 12 chạy Amp agent, tính phí theo phút, tự động tạm dừng sau 5 phút không hoạt động; (2) hướng dẫn thực hành đầy đủ — bốn điểm vào (Web / CLI `amp -ox` / bảng lệnh TUI / plugin `agent.createThread()`), `amp sync <thread>` đồng bộ hai chiều, `--orb-size` chọn kích thước theo thread, hook vòng đời `.agents/setup` và `.agents/resume`, liên kết OIDC, webhook và portal; (3) bảng giá năm cấp a1 (a1.tiny/small/medium/large/xxlarge ở $0,08/$0,17/$0,33/$0,66/$1,32 mỗi giờ); (4) triết lý thiết kế — 'giải phóng agent khỏi thanh bên của trình soạn thảo', 'năng lực không phải quyền lực', 'tính phí theo kết quả chứ không phải theo chỗ ngồi', 'đánh thức theo nhu cầu, ngủ khi xong', 'để fan-out không còn bị giới hạn bởi tài nguyên cục bộ'; (5) năm điểm cốt lõi: ngưỡng biến mất giải phóng tiềm năng song song, không người giám sát trở thành mặc định, agent tách khỏi trình soạn thảo, giao hàng tự thúc đẩy tăng tốc, đơn vị tính phí chuyển từ chỗ ngồi sang phút. Luận điểm cốt lõi: mô hình càng mạnh, bạn càng không nên nhốt nó trên một máy duy nhất; Orbs là câu trả lời kỹ thuật của Amp cho kỷ nguyên agent."
date: "2026-08-10"
author: "TopDigg Research Team"
tags: ["Amp", "Agents in Orbs", "Coding Agent", "AI Agent", "Remote Agent", "Orb", "amp CLI", "amp -ox", "amp sync", "CLI Agent", "Debian 12", "OIDC", "Webhook", "Plugin", "TUI", "SaaS", "Ampcode", "DevOps"]
categories: ["Deep Dive"]
keywords: ["Agents in Orbs", "Amp Orb", "agent từ xa", "agent không giám sát", "amp -ox", "amp sync", "kích thước Orb", "a1.tiny", "a1.small", "a1.medium", "a1.large", "a1.xxlarge", "tính phí theo phút", "Amp CLI", "ampcode", "mô hình agent", "triết lý thiết kế", "Coding Agent Is Dead", "liên kết OIDC", "amp webhooks", "Orbs Manual"]
---

# Agents in Orbs phân tích chuyên sâu: Khi agent học cách tự chạy code khi bạn không ngồi trước máy tính — Hướng dẫn thực hành Orb từ xa của Amp, triết lý thiết kế và năm điểm cốt lõi

> Ý tưởng cốt lõi: **Agents in Orbs là câu trả lời kỹ thuật của Amp cho khẩu hiệu "agent không còn bị nhốt trong thanh bên của trình soạn thảo" — một máy từ xa (Debian 12) chạy Amp agent, tính phí theo phút, tự động tạm dừng sau 5 phút không hoạt động, được đánh thức theo nhu cầu từ bốn điểm vào (Web / CLI / TUI / plugin), đồng bộ với laptop của bạn bằng `amp sync`, giải phóng việc lập lịch song song fan-out khỏi "chiếc laptop này" sang "một hạm đội VM đám mây theo nhu cầu".** Bản phát hành ngày 2026-06-30 không phải là Amp giao một tính năng mới — đó là sự hiện thực hóa sản phẩm cụ thể của bài xã luận tháng 2 năm 2026 The Coding Agent Is Dead: biến "các mô hình muốn viết code và chạy ngay cả khi bạn không ngồi trước trình soạn thảo" thành một sản phẩm có thể nhấp, có thể tính phí, có thể tạm dừng, có thể quan sát. Triết lý thiết kế của nó nén lại thành năm câu — **giải phóng agent khỏi thanh bên trình soạn thảo; năng lực không phải quyền lực; tính phí theo kết quả chứ không theo chỗ ngồi; đánh thức theo nhu cầu và ngủ khi rảnh; đừng để laptop của bạn kìm hãm fan-out.**

---

## 1. Tổng quan dự án

### 1.1 Nó là gì?

Bài viết này phân tích thông báo ngày 2026-06-30 [Agents in Orbs](https://ampcode.com/news/agents-in-orbs) của Amp — một hình thái sản phẩm đưa Amp agent ra khỏi trình soạn thảo, ra khỏi laptop cục bộ, và vào trong các máy từ xa theo nhu cầu.

Nó không phải là "Amp thêm một tính năng mới"; đó là sự thực hiện cụ thể lời hứa mà Amp đã đưa ra trong bài xã luận ngày 2026-02-19 [The Coding Agent Is Dead](https://ampcode.com/news/the-coding-agent-is-dead):

> "These models no longer need the hand-holding and really want to kick off their training wheels. They want to write code and run even when you're not sitting in front of your editor. It's time to see what they can do without supervision."

—biến khẩu hiệu đó thành hình thái sản phẩm chính là Agents in Orbs.

### 1.2 Hình thái trong một câu

**Orb là một máy từ xa chạy Amp agent**: hệ thống Debian 12 đã cài sẵn `gh`, `amp`, git, SSH, tmux, Bun, Node.js, Python, ripgrep và các công cụ quen thuộc khác; mỗi thread Amp bắt đầu bằng việc clone kho dự án của bạn và tải trước các secrets và biến môi trường bạn đã cấu hình, để agent chạy 24×7 không giám sát; tính phí theo phút, tự động tạm dừng sau 5 phút không hoạt động, dừng ngay khi thread được lưu trữ.

Bốn đặc tính phân biệt nó với "agent trên laptop của bạn":

1. **Không chạy trên máy của bạn**: agent chạy trong sandbox Debian 12 trên đám mây, tách biệt hoàn toàn với laptop — CPU và bộ nhớ của bạn không bị đụng đến.
2. **Cùng giao diện như cục bộ**: điều khiển từ Web UI, CLI, TUI hoặc plugin; xem lại diff, duyệt tệp, mở terminal chia sẻ tmux.
3. **Đánh thức theo nhu cầu, ngủ khi xong**: tự động tạm dừng 5 phút sau hoạt động cuối cùng; lưu trữ thread dừng ngay lập tức; tính phí theo phút, tạm dừng là miễn phí.
4. **Fan-out tùy ý**: một laptop không thể chạy 8 agent song song mà không tàn phá hiệu năng; một hạm đội orb trên đám mây có thể — và đây là "sự chuyển đổi mô hình khi ngưỡng biến mất" mà Amp muốn bạn nhận ra.

### 1.3 Dữ liệu và thông tin chính

- **Ngày phát hành**: 2026-06-30 (thông báo Agents in Orbs); bài xã luận tiền truyện ngày 2026-02-19 (The Coding Agent Is Dead); Hướng dẫn sử dụng Orbs tại [ampcode.com/manual/orbs](https://ampcode.com/manual/orbs).
- **Hệ điều hành cơ sở**: Orb chạy Debian 12, đã cài sẵn `gh` (đã xác thực), `amp` (đã xác thực), git, SSH, tmux, ffmpeg, ImageMagick, vim, jq, fzf, unzip, zstd, lsof, websocat, ripgrep, Bun, Node.js, npm, pnpm, Yarn, Python, pip, agent-browser.
- **Đơn vị tính phí**: theo phút (billed by the minute); tạm dừng là miễn phí.
- **Tự động tạm dừng**: 5 phút không hoạt động (giảm từ 15 phút, có hiệu lực từ 2026-08-07); lưu trữ thread dừng ngay lập tức; không cần tạm dừng thủ công.
- **Tối ưu hóa khởi động**: khởi động ấm nhanh hơn đáng kể khi thành viên khác trong nhóm gần đây đã tạo orb trong cùng dự án.
- **Các cấp giá** ([Size the Orbs of Production, 2026-08-07](https://ampcode.com/news/size-the-orbs-of-production)):
  - `a1.tiny`: 1 CPU · 2 GB bộ nhớ · **$0,08/giờ**
  - `a1.small`: 2 CPU · 4 GB bộ nhớ · **$0,17/giờ**
  - `a1.medium`: 4 CPU · 8 GB bộ nhớ · **$0,33/giờ** (mới ngày 2026-08-07, rẻ hơn 50% so với `a0.medium` cũ)
  - `a1.large`: 8 CPU · 16 GB bộ nhớ · **$0,66/giờ**
  - `a1.xxlarge`: 16 CPU · 32 GB bộ nhớ · **$1,32/giờ**
  - Workspace doanh nghiệp giá +50%; người đăng ký Megawatt nhận `a1.small` làm mặc định cho dự án cá nhân.
- **Bộ nhớ lưu trữ**: tăng gấp đôi từ 20 GB lên 40 GB ngày 2026-07-03, không tăng giá ([More Orb Sizes](https://ampcode.com/news/more-orb-sizes)).
- **Điểm vào**: Web ([ampcode.com](https://ampcode.com/)) → Create New Thread; CLI `amp -ox`; bảng lệnh TUI `thread: new in orb`; plugin `agent.createThread()`.
- **Lệnh đồng bộ**: `amp sync <thread>` phản chiếu các thay đổi của orb vào checkout cục bộ của bạn trong khi agent tiếp tục làm việc từ xa.
- **Hook vòng đời**: `.agents/setup` (giai đoạn chuẩn bị) và `.agents/resume` (giai đoạn tiếp tục, chặn tối đa 10 giây); khai báo dịch vụ `.amp/services.yaml`; mô tả portal dưới `.amp/portals/*.json`.
- **Bảo mật/tích hợp**: có thể tạo token OIDC thời hạn ngắn để liên kết với Google Cloud / Tailscale / AWS; plugin có thể đăng ký webhook (sự kiện bên ngoài đánh thức orb đang tạm dừng), thời gian chờ xử lý 30 giây, giao ít nhất một lần, giới hạn tốc độ 10/phút, tối đa 100 sự kiện xếp hàng mỗi endpoint; hỗ trợ mọi máy chủ Git (repo riêng trên các máy chủ khác tiêm thông tin xác thực qua biến môi trường `GIT_CONFIG_*`).
- **Ký Git**: bật "Sign Git commits in orbs" trong cài đặt cá nhân; dự án phải dùng Thread Creator làm Orb Commit Author.

### 1.4 Vấn đề nó giải quyết

"Agents in Orbs" không giải quyết "agent chạy như thế nào" — nó giải quyết "làm sao để agent hoàn thành công việc trong khi bạn đi khỏi máy tính". Ba giới hạn của agent cục bộ bị Orb gỡ bỏ cùng lúc:

1. **Tranh chấp tài nguyên cục bộ**: chạy 8 agent song song cục bộ thì quạt gào, pin cạn, IDE đơ. Amp chỉ ra điều này trực tiếp — "launch a group of agents to investigate eight different bugs independently when there are no local resource clashes to worry about". Orb chuyển sự tranh chấp đó từ laptop của bạn lên đám mây.
2. **Giới hạn theo thời gian trong ngày**: agent cục bộ theo giờ làm việc của bạn — bạn rời máy, nó dừng; đổi múi giờ, cộng tác đa khu vực, build qua đêm đều bị "bạn không có ở đó" chặn lại. Orb chạy 24×7, tính phí theo phút, bạn đi vắng cũng không lãng phí (5 phút không hoạt động là ngủ).
3. **Dùng agent như ticket chứ không phải công cụ**: Amp nhấn mạnh điều này — "Why not turn a bug report into an agent and an investigation instead of a ticket? Why not manage the agent and its results instead of the ticket?" Orb cho phép agent thoát khỏi ticket vào trạng thái vận hành liên tục — một webhook, một portal, một agent liên kết OIDC từ giờ trở đi sẽ "sống" vô thời hạn.

---

## 2. Hướng dẫn chi tiết: Từ Zero đến Agent Orb đầu tiên của bạn

Phần này đi theo Chuẩn bị → Khởi chạy → Điều khiển → Đồng bộ → Nâng cao, với các lệnh có thể sao chép, ví dụ chạy được tối thiểu, và các lưu ý. Nguồn: [ampcode.com/manual/orbs](https://ampcode.com/manual/orbs).

### 2.1 Bước 1: Chọn điểm vào và khởi chạy một Orb Thread

Bốn điểm vào — chọn cái phù hợp với quy trình làm việc của bạn.

**Điểm vào A: Bảng điều khiển Web**

Mở [ampcode.com](https://ampcode.com/), nhấp **Create New Thread**, chọn một Project, nhập prompt, gửi. Amp tự động sinh một orb mới, clone kho, chạy `.agents/setup`, và khởi động agent.

**Điểm vào B: CLI (hình thái chuẩn)**

```bash
# trong thư mục dự án:
amp -ox "Investigate why the latest CI run on 'main' failed"
```

Đây là hình thái Amp liên tục demo trong thông báo — gần giống hệt việc dùng `amp -x` để khởi chạy agent cục bộ, chỉ thay `-x` bằng `-ox` (orb execute). Dùng kích thước orb mặc định của dự án; để ghi đè:

```bash
amp -ox "your prompt" --orb-size a1.small
```

**Điểm vào C: Bảng lệnh Amp TUI**

Trong TUI, mở bảng lệnh, tìm `thread: new in orb`, nhấn enter; chọn dự án, nhập prompt, nhấn enter. Lợi thế: bạn ở nguyên trong quy trình terminal quen thuộc.

**Điểm vào D: Plugin**

```ts
await amp.createThread({
  prompt: 'Investigate flaky tests',
  orb: true,
})
```

Trường hợp sử dụng: lỗi CI tự động sinh một orb agent để điều tra; trình xử lý webhook khởi động agent; tập lệnh batch fan-out các agent.

### 2.2 Bước 2: Xem lại thay đổi và duyệt tệp (không cần đồng bộ trước)

Hai bảng chính trong một Orb thread:

1. **Bảng Review**: xem diff mà agent đã thay đổi; kiểm tra từng tệp; từ chối hoặc chấp nhận; không cần phản chiếu về cục bộ trước.
2. **Bảng File Browser**: duyệt toàn bộ kho trên orb — tệp agent đã thay đổi, chưa thay đổi, tệp tạm, sản phẩm build.

Điều này có nghĩa quy trình review PR của bạn có thể hoàn toàn bỏ qua bước "trước tiên git clone về cục bộ" — bạn review trên orb trong khi agent tiếp tục lặp tiếp.

### 2.3 Bước 3: Cộng tác trong Terminal (chia sẻ tmux)

Mở bảng Terminal của orb thread và bạn vào một **phiên tmux chia sẻ với agent**:

- Cùng hệ thống tệp (bản sao làm việc của orb); một tệp bạn chỉnh sửa trong terminal thì agent thấy ngay lập tức.
- Bạn có thể cài đặt phụ thuộc, chạy thử nghiệm, kiểm tra tiến trình, viết script, thay đổi cấu hình cục bộ — không khác gì phát triển cục bộ.
- Agent cũng thấy output terminal của bạn — vì vậy "tôi mở terminal trong orb, chạy build và xem log cùng agent" là hình thái cộng tác tự nhiên.

Đây là thiết kế bị đánh giá thấp nhất của Orb: **nó không ép agent và con người làm việc trên hai máy khác nhau với hai shell khác nhau — nó cung cấp cho họ một phiên shell chia sẻ làm bề mặt cộng tác.**

### 2.4 Bước 4: Phản chiếu thay đổi về cục bộ (`amp sync`)

Khi bạn muốn tiếp tục làm việc cục bộ:

```bash
amp sync <thread>
```

`<thread>` có thể là URL thread hoặc ID thread. `amp sync` phản chiếu mọi thay đổi trong bản sao làm việc của orb **vào checkout cục bộ của bạn**, trong khi agent tiếp tục làm việc trên đám mây. Luồng dữ liệu là hai chiều, nhưng lưu ý:

- Đừng chỉnh sửa cùng một tệp ở cả cục bộ và orb cùng lúc — lần ghi sau thắng.
- Muốn đẩy thay đổi cục bộ về orb? Chỉnh sửa, commit và push trực tiếp trong bảng Terminal (phiên tmux chia sẻ hệ thống tệp).

### 2.5 Bước 5: Nâng cao

#### 2.5.1 Hook vòng đời kho lưu trữ

Tạo hai script shell ở thư mục gốc kho; Amp chạy chúng theo lịch trình dưới đây:

| Tệp | Khi nào | Chiến lược chặn | Log |
|---|---|---|---|
| `.agents/setup` | Chuẩn bị trạng thái orb, chạy từ repo root | Chặn đồng bộ | `/home/user/.cache/amp/logs/setup.log` |
| `.agents/resume` | Khi orb đã tạm dừng được tiếp tục, trước khi agent tiếp tục làm việc | Chặn tối đa 10 giây; tiếp tục sau khi hết giờ | `/home/user/.cache/amp/logs/resume.log` |

`.agents/setup` tối thiểu:

```bash
#!/usr/bin/env bash
set -euo pipefail

corepack enable
pnpm install --frozen-lockfile
[ -f .env.local ] || cp -- .env.example .env.local
```

`.agents/resume` tối thiểu (**chỉ sửa chữa idempotent nhanh** — KHÔNG cài đặt phụ thuộc ở đây):

```bash
#!/usr/bin/env bash
set -euo pipefail

# Fast, idempotent repair work only. Do not install dependencies here.
mkdir -p .amp
date > .amp/resume-last-ran.txt
```

Cả hai script cần `chmod +x` và phải được commit.

> **Quy tắc quan trọng**: `.agents/resume` phải giữ nhẹ — ý đồ thiết kế là "hoàn thành trong 10 giây, không chặn agent". Nếu bạn cần "sau khi khởi động lại, chạy lại toàn bộ migration", hãy đặt điều đó vào `.agents/setup` và giữ `.agents/resume` chỉ là kiểm tra "đã chạy đến đâu, có tiếp tục được không".

#### 2.5.2 Dịch vụ chạy lâu dài và Portal

Khai báo dịch vụ trong kho để orb khởi động chúng và hiển thị URL portal:

`.amp/services.yaml`:

```yaml
services:
  dev:
    command: pnpm dev
    ports: [5173]
```

`.amp/portals/dev.json`:

```json
{
  "title": "Dev Server",
  "links": [
    { "url": "http://localhost:5173", "note": "Local dev server" }
  ]
}
```

Khi portal đã chạy, Amp hiển thị một liên kết tab trong giao diện thread để bạn có thể mở dev server trong trình duyệt — không cần chạy cục bộ, không cần đường hầm SSH.

#### 2.5.3 Liên kết OIDC (token thời hạn ngắn thay cho thông tin xác thực dài hạn)

Đừng đặt khóa service account Google Cloud / AWS / Tailscale trực tiếp vào secrets dự án — hãy dùng OIDC:

```bash
amp orb id-token --audience my-service
```

Token mang nhận dạng workspace / project / user / thread; dịch vụ từ xa liên kết dựa trên nhận dạng đó. Công thức đầy đủ cho Google Cloud, Tailscale và AWS tại [OIDC from Orbs](https://ampcode.com/manual/orbs/oidc).

#### 2.5.4 Webhook: Để sự kiện bên ngoài đánh thức orb đang tạm dừng

Đăng ký webhook trong plugin để dịch vụ bên ngoài (ví dụ: GitHub) có thể đánh thức orb đang tạm dừng:

```ts
const { url } = await amp.createWebhook({
  key: 'github-events',
  headers: ['x-hub-signature-256'],
  handler: async (event, ctx) => {
    await verifyAndApply(
      event.id,
      event.body,
      event.headers['x-hub-signature-256'],
      ctx.signal,
    )
  },
})
```

Điểm chính:

- **HTTP 202 = đã xếp hàng, chưa xử lý**.
- **Giao ít nhất một lần** — dùng `event.id` làm khóa idempotency.
- Thời gian chờ xử lý 30 giây; truyền `ctx.signal` cho các lệnh gọi mạng có thể hủy trước khi hết giờ.
- Giới hạn tốc độ: bùng nổ 10, bổ sung 10/phút, vượt quá trả 429.
- Kích thước thân yêu cầu tối đa 1 MB.
- **Đối xử với URL webhook như mật khẩu** — đừng commit, đừng dán vào tin nhắn thread.
- **Amp không xác minh chữ ký cho bạn** — mọi kiểm tra chữ ký đều thuộc về handler.

#### 2.5.5 Kho riêng / Git tự host

- **Kho riêng GitHub**: dùng [kết nối GitHub](https://ampcode.com/settings/integrations); không cần cấu hình thêm.
- **Máy chủ Git khác (GitLab / Bitbucket / tự host)**: tiêm thông tin xác thực qua secrets. Git đọc biến môi trường `GIT_CONFIG_*`, vì vậy việc viết lại URL hoàn tất xác thực:

```
GIT_CONFIG_COUNT=1
GIT_CONFIG_KEY_0=url.https://USERNAME:TOKEN@gitlab.com/.insteadOf
GIT_CONFIG_VALUE_0=https://gitlab.com/
```

Lưu dòng chứa TOKEN làm secret — không bao giờ commit.

#### 2.5.6 Commit Git đã ký

Cần commit đã ký từ orb? Hai bước:

1. Bật "[Sign Git commits in orbs](https://ampcode.com/settings/keys#signing-keys)" trong cài đặt cá nhân.
2. Đặt Orb Commit Author của dự án thành Thread Creator.

Nếu không, commit trong orb được ký bởi nhận dạng tạm thời của orb, và git cục bộ sẽ từ chối vì "unknown signer".

#### 2.5.7 Chọn kích thước Orb trong thực tế

Không nói rõ trong thông báo, nhưng kết hợp [Size the Orbs of Production](https://ampcode.com/news/size-the-orbs-of-production) với các khối lượng công việc điển hình:

| Kịch bản | Kích thước khuyến nghị | Tại sao |
|---|---|---|
| Scaffold đơn giản / sửa một tệp | `a1.tiny` | 1 CPU là đủ, rẻ nhất |
| Fan-out dự án thông thường (mặc định) | `a1.small` | Mặc định Megawatt; 4 GB xử lý hầu hết dự án Node/Python |
| Chạy bộ thử nghiệm + biên dịch front-end | `a1.medium` | 4 CPU để chạy thử song song; 8 GB cho webpack/vite |
| ML nặng / biên dịch Rust | `a1.large` | 16 GB để tránh OOM |
| CI monorepo đầy đủ / build phức tạp | `a1.xxlarge` | 32 GB để hấp thụ áp lực monorepo |

Sử dụng nâng cao:

```bash
# để agent tự chọn kích thước — nói rõ trong prompt
amp -ox "Run full E2E suite. Use a1.large if available — tests are memory-heavy."

# kích thước rõ ràng theo từng thread
amp -ox "Quick lint check" --orb-size a1.tiny
```

Amp cũng hỗ trợ để agent tự cung cấp — nói "use a smaller orb for this" với agent chính và sub-agent sẽ hạ cấp cho phù hợp.

### 2.6 Bước 6: Lưu trữ và ngừng sử dụng

- Muốn dừng orb? **Lưu trữ thread** — orb dừng ngay lập tức.
- Muốn tiếp tục? Nhấp Resume trong danh sách thread; `.agents/resume` chạy (tối đa 10 giây), rồi agent tiếp tục.
- Muốn xóa hoàn toàn? Xóa thread; URL webhook liên kết trả về 404.

### 2.7 Cơ chế tự động tạm dừng 5 phút

Orb tự động tạm dừng sau 5 phút không hoạt động (cùng tuần Amp giảm giá 20% cho mọi người vào 2026-07-27, họ cũng rút ngắn thời gian chờ từ 15 phút xuống 5 phút vào 2026-08-07). **Tạm dừng = không tính phí**. Tiếp tục gần như tức thì; đặc biệt khi đồng nghiệp gần đây đã mở orb trong cùng dự án, khởi động ấm sẽ nhanh hơn.

---

## 3. Tổng hợp quan điểm: Dịch phán đoán cốt lõi trong thông báo của Amp thành 5 kết luận

### 3.1 Quan điểm 1: Giải phóng agent khỏi thanh bên của trình soạn thảo là bước đi đáng giá nhất năm 2026

Bài xã luận ngày 2026-02-19 The Coding Agent Is Dead đã nói rõ: "the agent is no longer the limiting factor"; "These new models barely need to be told how to act like coding agents anymore". Nút thắt chuyển từ "năng lực agent" sang "bạn có sẵn sàng buông tay và để nó chạy không". Orbs biến sự buông tay đó thành sản phẩm: agent của bạn không còn dừng vì "bạn không ngồi trước trình soạn thảo".

**Kết luận**: nếu bạn vẫn đang dùng agent trong thanh bên IDE cho công việc nghiêm túc, bạn nên ngay lập tức chuyển ít nhất một quy trình sang Orbs — không phải vì nó nhanh hơn, mà vì nó **cho phép agent làm việc trong khi bạn không có ở đó**.

### 3.2 Quan điểm 2: Năng lực không phải quyền lực — nhưng năng lực càng lớn, đơn vị tính phí càng phải chuyển từ chỗ ngồi sang kết quả

Cả thông báo và bài xã luận đều nhấn mạnh điểm này: khi năng lực mô hình vượt qua giàn giáo, việc phóng to giàn giáo (nhiều agent hơn) mới có hiệu quả. Nhưng nút thắt của việc tăng số lượng agent không phải AI — mà là **bạn sẵn sàng trả bao nhiêu cho các agent song song**. Tính phí theo phút của Orbs (với 5 phút không hoạt động = tạm dừng miễn phí) là câu trả lời của Amp: biến "tôi sẵn sàng trả bao nhiêu cho agent" từ "tôi đã mua bao nhiêu đăng ký" thành "tôi đã cho bao nhiêu agent chạy bao nhiêu phút". Cái trước là chỗ ngồi, cái sau là kết quả.

**Kết luận**: trong vài năm tới, tính phí theo phút sẽ trở thành tiêu chuẩn cho các nền tảng agent — vì chỉ tính phí theo phút mới biến fan-out từ một hành động xa xỉ "cần tính ROI trước khi khởi chạy" thành hành động tùy ý "khởi chạy trước, nhìn hóa đơn rồi quyết định có tiếp tục không".

### 3.3 Quan điểm 3: Để fan-out không còn bị giới hạn bởi tài nguyên cục bộ — biến 8 agent song song từ demo thành thực hành hàng ngày

Đoạn thẳng thắn nhất trong thông báo:

> "Why not launch a group of agents to investigate eight different bugs independently when there are no local resource clashes to worry about? Why not turn a bug report into an agent and an investigation instead of a ticket? Why not manage the agent and its results instead of the ticket?"

"Tại sao không biến một bug report thành một agent?" — trước đây điều này là không thể ở cục bộ (tranh chấp CPU/bộ nhớ, IDE đơ, lo lắng về pin). Orbs biến điều này từ "một demo thỉnh thoảng" thành "thực hành hàng ngày".

**Kết luận**: khi "khởi chạy 8 agent song song để điều tra 8 bug độc lập" trở thành thực hành hàng ngày, quy trình ticket-first sẽ bị thay thế bằng quy trình agent-first. Thứ bạn quản lý thay đổi từ "ticket do con người viết" thành "kết quả do agent tạo ra".

### 3.4 Quan điểm 4: Không giám sát là mặc định mới — agent không còn cần bạn "trông chừng"

Thông báo, nguyên văn:

> "Never mind the editor, now we can let our agents run even when we're not sitting at our computer."

Đọc cùng với The Coding Agent Is Dead: Amp đã giết "agent trong trình soạn thảo" vào 2026-02 (tự hủy các extension VS Code / Cursor), rồi đặt agent vào Orb vào 2026-06 — hai bước này xóa bỏ hoàn toàn giả định "agent phải có editor mới làm việc được".

**Kết luận**: đối xử với agent như ticket có thể lưu trữ / đánh thức (webhook, OIDC, portal) là hình thái mà mọi nền tảng agent sẽ sao chép trong nửa cuối năm 2026. Mô hình vận hành tinh thần của bạn chuyển từ "8 tab IDE trông 8 agent" sang "một inbox chứa kết quả đầu ra của 8 agent, kiểm tra khi tôi ăn tối / thức dậy / ăn xong".

### 3.5 Quan điểm 5: Đơn vị tính phí chuyển từ đăng ký sang phút, từ theo tháng sang theo sử dụng — cuộc cách mạng SaaS tiếp theo

Hình thái kết hợp — "đăng ký hàng tháng + tính phí Orb theo phút" — là có chủ đích: sử dụng LLM vẫn theo đăng ký (tính theo token), nhưng Orb (tài nguyên tính toán) theo phút. Megawatt bao trùm "gần như tất cả mọi người dùng Orb cả tháng", nhưng khi sử dụng vượt ngưỡng đó, tính phí theo phút có nghĩa là nó **không trở thành giới hạn kèm điều tiết** — nó mở rộng theo nhu cầu.

**Kết luận**: giá nền tảng agent sẽ tiếp tục nghiêng về "trả cho thứ bạn dùng" — nhưng nó sẽ không thay thế hoàn toàn đăng ký. Hình thái là "sàn đăng ký + trần sử dụng". Amp Orbs là một mẫu sớm của xu hướng này.

### 3.6 Quan hệ giữa 5 quan điểm

```
Quan điểm 1: giải phóng agent khỏi trình soạn thảo
       ↓ (đường dẫn triển khai)
Quan điểm 4: không giám sát là mặc định mới
       ↓ (nền tảng kinh tế)
Quan điểm 2 & 5: tính phí chuyển từ chỗ ngồi sang phút / từ đăng ký sang kết quả
       ↓ (hình thái ứng dụng được mở khóa)
Quan điểm 3: fan-out không còn bị giới hạn bởi tài nguyên cục bộ
```

Quan điểm 1 là tiền đề triết học, Quan điểm 4 là hình thái sản phẩm, Quan điểm 2/5 là cơ sở hạ tầng kinh tế, Quan điểm 3 là ứng dụng mới được mở khóa. Đọc thông báo và bài xã luận theo thứ tự này và bạn sẽ thấy câu chuyện đầy đủ của Amp.

---

## 4. Triết lý thiết kế: Đọc thông báo và bài xã luận của Amp như một tuyên ngôn thiết kế

### 4.1 Triết lý 1: Từ "trợ lý trong trình soạn thảo" đến "máy độc lập trong đám mây" — định nghĩa lại nơi agent sống

A: The Coding Agent Is Dead nói:

> "They're now much more than mere assistants. They no longer need the hand-holding and really want to kick off their training wheels."

B: Agents in Orbs nói:

> "Orbs are machines where agents can run without supervision."

A nâng agent từ "trợ lý" lên "thực thể độc lập"; B làm cho "độc lập" cụ thể thành Orb (máy độc lập). Bản chất của triết lý này: **agent không còn sống như ký sinh trên chuỗi công cụ của bạn — nó có hệ điều hành riêng, hệ thống tệp riêng, nhịp tạm dừng/đánh thức riêng.**

Biểu hiện cụ thể:

- Orb chạy Debian 12 riêng với hệ thống tệp và không gian tiến trình riêng.
- Agent làm việc trong phiên tmux riêng của nó; bạn là "khách được mời vào" phiên đó, không phải "chủ sở hữu của máy".
- Webhook / OIDC cho phép dịch vụ bên ngoài coi Orb như một **nhận dạng tồn tại lâu dài** để gọi, không phải hành động một lần "để tôi chạy agent một chút".

### 4.2 Triết lý 2: Năng lực không phải quyền lực — mô hình càng mạnh, biên giới quyền lực phải vẽ càng nhỏ

Một chi tiết dễ bị bỏ qua trong hình thái Orb: **agent không phải root**. Nó có thể chạy `apt install`, chạy build, chỉnh sửa tệp — nhưng token OIDC vẫn cần sự chấp nhận rõ ràng của dịch vụ từ xa; URL webhook vẫn cần xác minh chữ ký của plugin; các thao tác nhạy cảm vẫn đi qua các secrets bạn đã xem xét.

Đây là cùng dòng tư duy với 12 yếu tố của FDE Guide (xem *FDE Guide phân tích chuyên sâu* trên trang này): **Token là đầu vào, quyền tự chủ là lựa chọn thiết kế, kết quả được chấp nhận là sản phẩm** — năng lực là năng lực, quyền lực là quyền lực, hai cái phải được thiết kế tách biệt.

Biểu hiện cụ thể:

- **Có thể chạy ≠ có thể thay đổi môi trường sản xuất**: liên kết OIDC thay thế khóa service-account dài hạn.
- **Có thể chỉnh sửa tệp ≠ có thể push lên nhánh chính**: bạn xem xét diff và chấp nhận khi cần; agent không vượt qua review của bạn theo mặc định.
- **Có thể dựng webhook ≠ có thể giả mạo sự kiện**: Amp không xác minh chữ ký cho bạn; handler phải tự xác minh.

**Triết lý này là điều kiện tiên quyết để "chạy không giám sát"** — bạn chỉ buông tay cho agent vì biên giới quyền lực được vẽ rõ ràng.

### 4.3 Triết lý 3: Tính phí theo kết quả chứ không theo chỗ ngồi — biến agent từ sản phẩm đăng ký thành dịch vụ có thể đo lường

Đơn vị tính phí của Orb là phút, tạm dừng miễn phí, lưu trữ dừng đồng hồ ngay. Đằng sau hình thái tính phí này là phán đoán của Amp: **agent là dịch vụ bạn trả khi sử dụng, không phải sản phẩm bạn đăng ký hàng tháng.**

Tại sao điều này quan trọng? Chỉ "trả cho thứ bạn dùng" mới khiến bạn sẵn sàng làm tất cả những điều sau:

- Để agent chạy tác vụ dài (build qua đêm, chạy thử nghiệm cả đêm) — vì nó thực sự chỉ tính phí khi đang chạy.
- Fan-out agent song song (8 agent điều tra 8 bug) — vì bạn chỉ trả cho 8 cái thực sự đang chạy.
- Đối xử với agent như ticket (một bug report → một agent) — vì lưu trữ dừng đồng hồ và không có chi phí đăng ký cho việc "giữ ticket này sống".

**Triết lý này chuyển toàn bộ mô hình kinh doanh của Amp từ "có bao nhiêu nhà phát triển đăng ký Amp" sang "tôi đã cho bao nhiêu agent chạy trên Amp bao nhiêu phút".**

### 4.4 Triết lý 4: Đánh thức theo nhu cầu, ngủ khi xong — chuyển "tính đàn hồi" từ khái niệm đám mây sang trải nghiệm agent

Điện toán đám mây mất 20 năm để dạy mọi người "phân bổ theo nhu cầu, giải phóng khi xong"; Amp chuyển cùng tính đàn hồi đó cho agent:

- Tự động tạm dừng sau 5 phút không hoạt động (giảm từ 15 phút, có hiệu lực từ 2026-08-07).
- Tạm dừng miễn phí.
- Đánh thức qua webhook gần như tức thì (và khởi động ấm nhanh hơn khi đồng nghiệp gần đây đã mở orb).

Bản chất của triết lý này: **nền tảng agent nên có tính lưỡng cực "lạnh/nóng", không chỉ "bật/tắt"**. Lạnh không tốn gì và đánh thức theo nhu cầu; nóng chạy hết công suất. Đây là hình thái Orb đưa ra làm tham chiếu.

### 4.5 Triết lý 5: Để fan-out không còn bị giới hạn bởi tài nguyên cục bộ — chuyển "tính song song" từ khả năng mỗi máy thành khả năng nền tảng

Đoạn thẳng thắn nhất của thông báo:

> "Why not launch a group of agents to investigate eight different bugs independently when there are no local resource clashes to worry about? Why not turn a bug report into an agent and an investigation instead of a ticket?"

Triết lý này chuyển "tính song song" từ "máy này có bao nhiêu lõi" sang "nền tảng sẵn sàng sinh bao nhiêu Orb cho bạn" — và cái sau trên đám mây hầu như là vô hạn.

Biểu hiện cụ thể:

- Megawatt bao trùm "gần như tất cả mọi người dùng Orb cả tháng" — khuyến khích bạn dùng nhiều hơn.
- Chọn kích thước theo thread (`--orb-size` hoặc để agent tự quyết) — tác vụ đơn giản dùng `a1.tiny`, tác vụ nặng dùng `a1.xxlarge`.
- Kết hợp với webhook — sự kiện bên ngoài kích hoạt orb mới; fan-out song song hoàn toàn chạy nền.

### 4.6 Triết lý 6: Giao diện ngang bằng với cục bộ — giảm chi phí di chuyển là chiến hào thực sự cho việc mở rộng nền tảng

Chi tiết khiêm tốn nhưng quan trọng nhất trong thiết kế Orb: **mọi giao diện mà agent phơi bày trên Orb (xem lại diff, mở terminal, `amp sync`, khởi chạy từ TUI) đều giống hệt phiên bản cục bộ**.

Bản chất của triết lý này: **"lên đám mây" không được đi kèm chi phí "học cách dùng mới"**. Nếu chuyển quy trình sang Orb đòi hỏi phải học bộ lệnh mới, chi phí di chuyển sẽ giết chết việc áp dụng. Amp nén điều này thành "`amp -x` trở thành `amp -ox`, chỉ vậy thôi" — làm cho chi phí di chuyển gần bằng 0.

Biểu hiện cụ thể:

- `amp -x` và `amp -ox` chia sẻ cùng mô hình tinh thần.
- Phiên tmux trên Orb hoạt động giống hệt shell cục bộ.
- UI xem lại diff, duyệt tệp, chạy lệnh chia sẻ thành phần với agent cục bộ.

**Triết lý này là lý do Orbs được áp dụng nhanh — không phải vì nó "mạnh", mà vì nó "không làm gián đoạn quy trình làm việc hiện tại của bạn".**

### 4.7 Tổng kết triết lý: Sáu triết lý tạo thành tuyên ngôn thiết kế của Orb

| Triết lý | Một dòng | Hình thức cụ thể |
|---|---|---|
| 1. Máy độc lập | agent không sống trên công cụ của bạn | Orb = sandbox Debian 12 |
| 2. Năng lực ≠ quyền lực | mô hình càng mạnh, biên giới quyền lực càng rõ | OIDC, ký webhook, review bắt buộc |
| 3. Tính phí theo kết quả | agent là dịch vụ, không phải đăng ký | tính phí theo phút |
| 4. Đàn hồi theo nhu cầu | agent nên có trạng thái lạnh/nóng | tự động tạm dừng sau 5 phút không hoạt động |
| 5. Song song cấp nền tảng | fan-out không nên bị laptop kìm hãm | chọn kích thước theo thread, fan-out theo nhu cầu |
| 6. Ngang bằng giao diện | lên đám mây không nên đổi cách bạn làm việc | `amp -x` ↔ `amp -ox`, UI chia sẻ |

Sáu triết lý này không độc lập — chúng tạo thành một chuỗi: **ngang bằng giao diện khiến bạn sẵn sàng di chuyển; máy độc lập khiến việc di chuyển thực sự khả thi; năng lực ≠ quyền lực khiến di chuyển an toàn; tính phí theo kết quả khiến di chuyển kinh tế; đàn hồi theo nhu cầu khiến di chuyển rẻ; song song cấp nền tảng mở khóa cách dùng mới**. Thiếu bất kỳ cái nào, hình thái này không đứng vững.

---

## 5. Ý tưởng cốt lõi

Phán đoán quan trọng nhất mà Agents in Orbs đưa ra: **trong nửa cuối năm 2026, cuộc chiến hình thái cho các nền tảng agent đã chuyển từ "mô hình nào tốt hơn" sang "ai có thể để agent hoàn thành công việc trong khi người dùng không có ở đó".**

- **Nó định nghĩa lại nơi agent sống**: từ thanh bên IDE đến Orb trên đám mây, với máy riêng, nhịp tạm dừng/đánh thức riêng, đơn vị tính phí riêng.
- **Nó biến "chạy không giám sát" thành sản phẩm**: tmux chia sẻ, đánh thức qua webhook, liên kết OIDC, tính phí theo phút, tự động tạm dừng sau 5 phút — sáu thứ đều cần thiết.
- **Nó chuyển fan-out từ demo thành thực hành hàng ngày**: chạy 8 agent song song cục bộ là câu hỏi "có thể/không thể", chạy 8 cái trên đám mây là câu hỏi "có muốn trả số tiền này không" — và Orb nén cái sau xuống "trả theo phút".
- **Nó đảo ngược quan hệ giữa agent và ticket**: trước đây bạn mở ticket cho một agent; bây giờ bạn mở agent cho một ticket — agent là người thực thi của ticket; ticket thoái hóa thành thùng chứa thông báo và lưu trữ.
- **Nó vẽ các thanh chắn an toàn cho "agent không giám sát"**: năng lực không phải quyền lực, liên kết OIDC + ký webhook + review bắt buộc + tmux chia sẻ giữ cho việc "buông tay" có biên giới.

Câu để nhớ: **mô hình càng mạnh, bạn càng không nên nhốt nó trên một máy duy nhất. Orbs là câu trả lời kỹ thuật của Amp cho kỷ nguyên agent — một máy từ xa chạy Amp agent, tính phí theo phút, đánh thức theo nhu cầu, tạm dừng sau 5 phút không hoạt động, để bạn có thể tiếp tục làm việc (hoặc dừng làm việc) trong khi agent tiếp tục chạy.**

---

## Phụ lục: Liên kết tham khảo

- [Agents in Orbs (thông báo 2026-06-30)](https://ampcode.com/news/agents-in-orbs)
- [The Coding Agent Is Dead (bài xã luận 2026-02-19)](https://ampcode.com/news/the-coding-agent-is-dead)
- [Orbs User Manual](https://ampcode.com/manual/orbs)
- [Size the Orbs of Production (bảng giá 2026-08-07)](https://ampcode.com/news/size-the-orbs-of-production)
- [More Orb Sizes (tăng gấp đôi bộ nhớ 2026-07-03)](https://ampcode.com/news/more-orb-sizes)
- [OIDC from Orbs](https://ampcode.com/manual/orbs/oidc)
- [Amp Pricing](https://ampcode.com/pricing)
