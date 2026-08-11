---
slug: bb-ide-analysis
title: "bb Phân tích chuyên sâu: IDE tác tử tự xây dựng chính nó — không gian làm việc có thể lập trình để điều phối mọi tác tử lập trình (Tổng quan dự án + Hướng dẫn khởi động nhanh + Kiến trúc hệ thống + Triết lý thiết kế)"
description: "Lấy get-bb/bb (dự án nguồn mở trên GitHub, giấy phép MIT, 1,6k stars) làm nền tảng, phân tích toàn diện 'IDE tác tử tự xây dựng chính nó (The agent IDE that builds itself)'. Ý tưởng cốt lõi: bb là một không gian làm việc có thể lập trình dành cho các tác tử lập trình (programmable workspace for coding agents) — người dùng và tác tử đều là những operator công dân hạng nhất, cả bốn bề mặt gồm desktop App, Web App, CLI và HTTP API đều là công dân hạng nhất; công việc chạy trong thread (luồng công việc), có thể theo dõi theo thời gian thực, đổi hướng bất cứ lúc nào, bàn giao cho một tác tử khác; tác tử không chỉ bị điều phối, mà còn có thể sử dụng bb theo cách lập trình qua SDK/CLI/HTTP API, hiện thực hóa 'sự điều phối của kẻ điều phối' và tự khởi động. Tổng quan dự án: không phát minh ra tác tử mới, mà điều phối các provider CLI bạn đã có như Claude Code, Codex, Cursor (ACP), Pi, OpenCode, Grok Build, Hermes (tái sử dụng thông tin xác thực đã xác minh). Hướng dẫn khởi động nhanh: npx bb-app@latest → http://localhost:38886; CLI (bb skill list / config / env / ssh-target); Node SDK (BBSdk: spawn thread → wait idle → output). Kiến trúc hệ thống: Server (SQLite nguồn chân lý + HTTP API + WebSocket đẩy sự kiện, tự thân không trạng thái) → Host daemon (trú tại mỗi máy thực thi, cung cấp workspace, chạy tiến trình provider) → App → CLI; mô hình dữ liệu gồm Project/Source, Thread (standard/manager/child ủy thác), Environment (managed/unmanaged) và Host; hai gói contract @bb/server-contract và @bb/host-daemon-contract phân chia ranh giới thành phần một cách nghiêm ngặt. Triết lý thiết kế sáu nguyên tắc: người dùng và tác tử đều là công dân hạng nhất, có thể mở rộng (thích ứng với hạ tầng của người dùng thay vì ép họ fork), linh hoạt không cứng nhắc (giá trị mặc định mạnh + nguyên thủy tái sử dụng), làm việc ở mọi nơi (tiến hóa từ máy đơn đến từ xa/đám mây), nhanh và dễ hiểu, dễ tin tưởng và áp dụng (ưu tiên cục bộ). Quan điểm tổng kết: điều phối tốt hơn phát minh, thread là đơn vị công việc, kiến trúc hướng contract, SQLite nguồn chân lý + Server không trạng thái, ưu tiên cục bộ + quản lý như phép tăng dần, telemetry ẩn danh có thể tắt."
date: "2026-08-11"
author: "TopDigg"
tags: ["bb", "Agent IDE", "AI Agent", "Agent Orchestration", "Claude Code", "Codex", "IDE", "DevTools", "Programmable Workspace", "Threads", "Agentic Development", "Monorepo", "Electron"]
categories: ["Deep Dive"]
keywords: ["bb", "IDE tác tử", "Agent IDE", "Điều phối tác tử", "Agent Orchestration", "Không gian làm việc có thể lập trình", "Programmable Workspace", "Thread", "Threads", "Claude Code", "Codex", "BBSdk", "Server không trạng thái", "SQLite", "Triết lý thiết kế", "get-bb"]
---

# bb Phân tích chuyên sâu: IDE tác tử tự xây dựng chính nó — không gian làm việc có thể lập trình để điều phối mọi tác tử lập trình

> Ý tưởng cốt lõi: **bb là một "IDE tác tử tự xây dựng chính nó (The agent IDE that builds itself)"** — một không gian làm việc có thể lập trình dành cho các tác tử lập trình. Nó không phát minh ra tác tử mới, mà điều phối **những** tác tử lập trình **bạn đã có** như Claude Code, Codex, Cursor, Pi, OpenCode, Grok Build, Hermes, và cho phép chúng **sử dụng bb theo cách lập trình** ngược lại. Bốn bề mặt (desktop App, Web App, CLI, HTTP API) đều là công dân hạng nhất; mọi công việc chạy trong **thread (luồng công việc)**, có thể theo dõi theo thời gian thực, đổi hướng bất cứ lúc nào, hoặc bàn giao cho một tác tử khác; thread còn có thể sinh thread con để hiện thực ủy thác gốc. "Tự xây dựng chính nó" nghĩa là bản thân bb cũng dùng chính cơ chế này để phát triển và lặp (dogfooding). Đằng sau là một kiến trúc hướng contract: Server không trạng thái + SQLite nguồn chân lý + WebSocket đẩy sự kiện, Host daemon chạy các tiến trình provider trên từng máy thực thi. Triết lý thiết kế sáu nguyên tắc: **người dùng và tác tử đều là operator công dân hạng nhất, có thể mở rộng (thích ứng với hạ tầng của bạn thay vì ép bạn fork), linh hoạt không cứng nhắc (giá trị mặc định mạnh + nguyên thủy tái sử dụng), làm việc ở mọi nơi (tiến hóa từ máy đơn đến từ xa/đám mây), nhanh và dễ hiểu, dễ tin tưởng và áp dụng (ưu tiên cục bộ).**

---

## 1. Tổng quan dự án

### 1.1 Nó là gì?

Bài viết phân tích **kho nguồn mở GitHub `get-bb/bb`** — với phụ đề *"The agent IDE that builds itself"* (IDE tác tử tự xây dựng chính nó). Dự án được phát hành trên npm với tên `bb-app` (hai kênh latest / nightly), sử dụng giấy phép MIT, tại thời điểm viết bài có khoảng **1,6k stars, 155 forks, hơn 4500 commits**, đang trong quá trình phát triển tích cực: kiến trúc cốt lõi đã ổn định, nhưng các workflow và bề mặt vẫn đang tiến hóa.

Định vị trong một câu: **bb là một không gian làm việc có thể lập trình cho các tác tử lập trình** — bạn có thể liền mạch điều phối tất cả các tác tử lập trình yêu thích lại với nhau và khiến chúng sử dụng bb theo cách lập trình. Đây không chỉ đơn thuần là "một trình soạn thảo AI khác", mà là một **mặt điều khiển kiểu hệ điều hành hướng tới tác tử**: con người có thể dùng giao diện để điều khiển tác tử, tác tử cũng có thể dùng giao diện để điều khiển tác tử.

Nó hoàn toàn trái ngược với hướng "tự làm lại một tác tử": **bb tái sử dụng các provider CLI đã được cài đặt và xác thực sẵn trên máy của bạn** (Codex, Claude Code, Cursor...), tự thân không sở hữu model, không làm lại tác tử, mà đóng vai "người điều phối + không gian làm việc + mặt điều khiển thời gian thực". Chỉ cần một lệnh `npx bb-app@latest` là khởi động: tải gói `bb-app`, khởi động Server cùng Host daemon cục bộ, phục vụ Web App, sau đó mở trình duyệt `http://localhost:38886` là có thể sử dụng.

### 1.2 Dữ liệu và thông tin chính

- Kho lưu trữ: `https://github.com/get-bb/bb` (giấy phép MIT, khoảng 1,6k stars / 155 forks / 4585 commits)
- Phát hành: gói npm `bb-app`, kênh ổn định `npx bb-app@latest`, kênh bản dựng hằng ngày `npx bb-app@nightly`
- Điều kiện tiên quyết: Node.js 22.19 / 24 / 26 + Git + ít nhất một Agent provider đã xác thực
- Nền tảng hỗ trợ: macOS (bản desktop dành cho Apple Silicon arm64), Linux; Windows cần chạy trong WSL2 (không hỗ trợ PowerShell/CMD gốc)
- Cổng mặc định: `http://localhost:38886`; thư mục dữ liệu `~/.bb/` (instance phát triển `~/.bb-dev/<checkout-instance>/`)
- Telemetry: bản chạy production gửi telemetry sử dụng ẩn danh (khởi động ứng dụng, số thread được tạo, số tin nhắn người dùng), dấu hiệu nhận dạng là installation ID ngẫu nhiên, không kèm nội dung về người dùng/máy chủ/dự án/workspace/tin nhắn; có thể tắt bằng `BB_TELEMETRY=false`; chạy phát triển từ mã nguồn không bao giờ gửi
- Lưu trữ trạng thái: **cơ sở dữ liệu SQLite là nguồn chân lý (source of truth)**, bản thân Server không trạng thái
- Đối tượng điều phối: Codex, Claude Code, Cursor (qua ACP), Pi, OpenCode, Grok Build, Hermes Agent, cùng mọi tác tử tùy chỉnh tương thích ACP (`customAcpAgents`)
- Bốn bề mặt: desktop App (Electron, macOS arm64), Web App, CLI (`bb`), HTTP API; cùng với Node SDK (`BBSdk`)
- Chỉ mục skills gốc: tự động đọc các thư mục gốc skill của Codex / Claude Code / Pi / Cursor / OpenCode / omp / Grok Build / Hermes, đưa vào menu lệnh `/` của từng provider
- Hình thái kinh doanh: `getbb.app` cung cấp trang tiếp thị + xác thực/bảng điều khiển bb connect (TanStack Start on Cloudflare Workers)

### 1.3 Nó giải quyết vấn đề gì?

1. **Khoảng trống điều phối đa tác tử**: Các đội ngũ thường đồng thời sở hữu Codex, Claude Code, Cursor và nhiều coding agent khác, mỗi bên chiến đấu riêng lẻ, ngữ cảnh bị chia cắt. bb cung cấp một không gian làm việc và mô hình thread thống nhất, biến "mở thread, giao nhiệm vụ, theo dõi tiến độ, bàn giao" thành một bộ thao tác xuyên provider.

2. **Tính lập trình được của tác tử**: Hầu hết các công cụ agent chỉ dành cho "người gõ lệnh", khó bị chương trình hay tác tử khác gọi tới. bb biến CLI, SDK, HTTP API thành các giao diện hạng nhất — **một tác tử có thể mở thread để khiến tác tử khác làm việc**, hình thành "sự điều phối của kẻ điều phối".

3. **Tính hiển thị và kiểm soát của workflow**: Tác tử chạy như hộp đen trong thời gian dài là điểm đau. Thread của bb có trạng thái vòng đời và luồng sự kiện append-only (tin nhắn, gọi công cụ, thay đổi tệp), bạn có thể **theo dõi theo thời gian thực, đổi hướng bất cứ lúc nào, tiếp sức giữa chừng**, và còn có thể tạo thread con để ủy thác (manager / child thread).

4. **Vấn đề môi trường và đa máy**: Project ánh xạ tới repo và ràng buộc với một Host cụ thể; Environment chia managed (bb quản lý vòng đời, tự dọn khi không còn tham chiếu) và unmanaged (trỏ tới thư mục hiện có); Server có thể đăng ký nhiều Host từ xa. Chạy được trên máy đơn, điều phối từ xa cũng không bị khóa cứng.

## 2. Ý tưởng cốt lõi

### 2.1 Thế giới quan trong một câu

> **"The agent IDE that builds itself."** (IDE tác tử tự xây dựng chính nó.)
> **"bb is a programmable workspace for coding agents."** (bb là không gian làm việc có thể lập trình cho các tác tử lập trình.)

Đây là phương châm của dự án, cũng là ranh giới giữa nó với IDE truyền thống và công cụ agent truyền thống: **hướng tiến hóa của IDE không phải "bổ sung thông minh hơn", mà là "giao diện để con người lập trình điều khiển tác tử làm việc"**; giá trị của tác tử không nằm ở đánh đơn một mình, mà nằm ở việc **có thể bị điều phối, được bàn giao, được gọi theo cách lập trình**.

### 2.2 "Người dùng và tác tử đều là operator công dân hạng nhất"

**Users and agents are both first-class operators** — bb dùng cho cả con người lẫn tác tử. Bốn bề mặt (desktop App, Web App, CLI, HTTP API) phơi bày cùng một tập chức năng cốt lõi, CLI **tuyệt đối không phải sidecar hay bản vá sau này**. Script và tác tử thông qua biến môi trường `BB_SERVER_URL` / `BB_THREAD_ID` để biết mình đang chạy trong Server nào, thread nào, có thể mở thêm thread, tra cứu trạng thái, lấy output.

### 2.3 Thread là đơn vị công việc

Mỗi thread là một **cuộc hội thoại với agent provider + trạng thái vòng đời + luồng sự kiện append-only** (tin nhắn, gọi công cụ, thay đổi tệp...). Thread chia hai loại:

- **standard (thread chuẩn)**: làm việc trực tiếp;
- **manager (thread quản lý)**: điều phối các thread khác, có thể sở hữu **thread con (child threads)** để ủy thác.

"Theo dõi theo thời gian thực, đổi hướng bất cứ lúc nào, bàn giao cho một tác tử khác" được hiện thực hóa ngay trên mô hình luồng sự kiện + trạng thái này — **công việc không phải ném ra là xong, mà luôn có thể quan sát, can thiệp, chuyển giao**.

### 2.4 Lập trình được, mở rộng được, đáng tin cậy

- **Lập trình được**: CLI, SDK (`BBSdk`), HTTP API đều là công dân hạng nhất, tác tử có thể điều khiển bb theo cách lập trình;
- **Mở rộng được**: hỗ trợ các điểm mở rộng như provider tùy chỉnh, môi trường, dịch vụ nền LLM, tích hợp CLI, bề mặt UI; hệ thống thích ứng với hạ tầng và workflow của bạn thay vì ép bạn fork;
- **Đáng tin cậy**: ưu tiên cục bộ — đánh giá và áp dụng không cần lên đám mây; tính năng quản lý có thể mở rộng trong tương lai, nhưng **không thay thế sản phẩm cốt lõi**; telemetry ẩn danh và có thể tắt.

---

## 3. Hướng dẫn chi tiết

### 3.1 Khởi động nhanh (cài đặt và chạy)

**Điều kiện tiên quyết:**

- Node.js 22.19 / 24 / 26;
- Git;
- Ít nhất một Agent provider được hỗ trợ: Claude Code, Codex, Cursor (qua ACP), Pi, OpenCode, Grok Build, Hermes, hoặc tác tử tương thích ACP khác.

**Bước 1: Khởi động.** Khuyến nghị desktop App (hiện chỉ có macOS Apple Silicon): tải từ [bản phát hành desktop-latest](https://github.com/get-bb/bb/releases/tag/desktop-latest); Intel Mac và Linux dùng npx:

```bash
npx bb-app@latest
```

Sau đó mở: `http://localhost:38886`

Muốn dùng bản tự động dựng hằng ngày (có thể không ổn định):

```bash
npx bb-app@nightly
```

`npx bb-app@latest` sẽ tải gói `bb-app`, khởi động Server và Host daemon cục bộ trong cùng cây tiến trình (nếu bất kỳ tiến trình con nào thoát bất thường, bộ khởi động chỉ khởi động lại tiến trình con đó), phục vụ Web App, trạng thái mặc định lưu trong `~/.bb/`. Nhấn `Ctrl+C` trong terminal sẽ dừng cả hai tiến trình và thoát với mã thoát 0.

Dừng bb đang chạy trong terminal/ngầm khác:

```bash
npx bb-app stop
```

`stop` đọc `bb-app-runtime.json` trong thư mục dữ liệu, xác nhận tiến trình được ghi nhận đích thực do bộ khởi động này sinh ra rồi mới dừng; với thư mục dữ liệu không mặc định thì truyền `--data-dir`.

**Bước 2: Chuẩn bị thông tin xác thực của provider.** bb trực tiếp tái sử dụng provider CLI bạn đã xác thực:

| Provider | Thiết lập |
|----------|------|
| `codex` | Cài [Codex CLI](https://developers.openai.com/codex/cli) và `codex login` |
| `claude-code` | Cài [Claude Code](https://docs.anthropic.com/en/docs/claude-code) và xác thực theo tài liệu |
| `cursor` | Cài CLI agent của Cursor (`cursor-agent`) và xác thực |
| `pi` | bb tích hợp runtime Pi đã cố định phiên bản, không cần cài tệp thực thi Pi; Pi extensions có thể thêm model và công cụ |
| `opencode` | Cài [opencode](https://opencode.ai/) và xác thực |
| `grok` | Cài [Grok Build](https://docs.x.ai/build/overview), `grok login` hoặc đặt `XAI_API_KEY` |
| `hermes-agent` | Cài [Hermes Agent](https://hermes-agent.nousresearch.com/docs/getting-started/installation), `hermes model` để cấu hình thông tin xác thực, `hermes acp --check` để xác minh |

**Bước 3: Bắt đầu làm việc.** Trong App, thêm/mở một project, khởi động một thread, chọn provider cho thread đó, bắt đầu hội thoại. Bản chạy production sẽ gửi telemetry ẩn danh, có thể tắt bằng `BB_TELEMETRY=false`.

### 3.2 Hướng dẫn sử dụng CLI

CLI hướng tới **một bb Server đang chạy**:

```bash
npx --package bb-app bb --help
```

CLI và SDK dùng chung một bộ phân tích `BB_SERVER_URL` và cấu hình bb; khi không thiết lập, mặc định trỏ tới Server đóng gói cục bộ `http://127.0.0.1:38886`.

Lệnh thường dùng:

```bash
# 查看（原生 + 插件）技能列表
bb skill list

# 包级非敏感配置（~/.bb/config.json）
npx bb-app config set BB_APP_URL https://<machine>.<tailnet>.ts.net
npx bb-app config set BB_INFERENCE codex/gpt-5.6-luna
npx bb-app config set BB_TRANSCRIPTION codex/gpt-transcribe
npx bb-app config list
npx bb-app config refresh

# 远程 bb Server 的本地编辑器打开映射（~/.bb/client.json）
npx bb-app client ssh-target set https://bb.example.test devbox
npx bb-app client ssh-target list

# Provider 凭证（~/.bb/env.json，list 会对所有值打码）
npx bb-app env set OPENAI_API_KEY <key>
npx bb-app env list
npx bb-app env unset OPENAI_API_KEY
```

`config`/`env` khi ghi sẽ yêu cầu bb Server cục bộ đang chạy hot-reload; nếu bb chưa chạy, sẽ có hiệu lực ở lần khởi động sau.

### 3.3 Hướng dẫn lập trình SDK (để tác tử dùng bb theo cách lập trình)

`bb-app` đồng thời xuất một Node SDK, script có thể điều khiển một bb Server đang chạy:

```ts
import { BBSdk } from "bb-app";

const bb = new BBSdk();
const thread = await bb.threads.spawn({
  projectId: "proj_personal",
  environment: { type: "host", workspace: { type: "personal" } },
  prompt: "Summarize my active bb work.",
});
await bb.threads.wait({ threadId: String(thread.id), status: "idle" });
console.log(await bb.threads.output({ threadId: String(thread.id) }));
```

Quy trình ba bước: **spawn (mở thread) → wait idle (chờ thread rảnh) → output (lấy output)** — đây chính là nguyên thủy tối thiểu của "agent điều phối agent". `new BBSdk()` dùng chung phân tích `BB_SERVER_URL` và cấu hình với CLI; với mục tiêu từ xa/kiểm thử có thể truyền `new BBSdk({ baseUrl: "http://host:38886" })`. **Script được bb khởi động sẽ tự động nhận các biến môi trường `BB_SERVER_URL` và `BB_THREAD_ID`**, nhờ đó biết mình đang chạy trong Server nào, thread nào.

### 3.4 Kiến trúc hệ thống (phân tích runtime)

Bốn thành phần runtime:

| Thành phần | Trách nhiệm |
|------|------|
| **Server** | Trung tâm điều phối. Toàn bộ trạng thái lưu trong SQLite, phơi bày HTTP API, đẩy thông báo thay đổi qua WebSocket; tự thân không trạng thái, DB là nguồn chân lý; định tuyến công việc tới từng Host qua WebSocket của daemon đang hoạt động |
| **Host daemon** | Chạy trên từng máy thực thi đã đăng ký (enrolled). Kết nối Server, xử lý host RPC, cung cấp workspace, chạy tiến trình agent provider, đẩy ngược sự kiện; phơi bày HTTP API cục bộ cho App/CLI cùng máy (mở trình soạn thảo, chọn thư mục, tra cứu trạng thái daemon) |
| **App** | Web UI: xem project và thread, theo dõi tiến độ, chuyển hướng công việc |
| **CLI (`bb`)** | Giao diện công dân hạng nhất cho người dùng và tác tử, cùng năng lực với App và có thể script hóa |

**Mô hình dữ liệu:**

- **Project**: vùng chứa cấp cao nhất, thường tương ứng với một repository; một project có một hoặc nhiều **Source** (mã nằm ở đâu). Source dạng đường dẫn cục bộ thuộc về một Host đã đăng ký, vì vậy một project có thể ánh xạ tới nhiều đường dẫn trên nhiều máy.
- **Thread**: đơn vị công việc. Theo dõi cuộc hội thoại với agent provider, có trạng thái vòng đời, sinh ra luồng sự kiện append-only (tin nhắn, gọi công cụ, thay đổi tệp...); chia hai loại standard (làm việc trực tiếp) và manager (điều phối các thread khác); thread có thể sở hữu thread con để ủy thác.
- **Environment**: ngữ cảnh thực thi của thread, gắn workspace (thư mục đĩa) với Host. Có thể **unmanaged** (trỏ tới thư mục hiện có) hoặc **managed** (bb quản lý vòng đời, tự động dọn dẹp khi không có bất kỳ thread nào chưa archive sử dụng); nhiều thread có thể chia sẻ một environment.
- **Host**: danh tính daemon trú dài hạn của một máy thực thi. Server có một primary host, có thể đăng ký thêm host từ xa; project sources và environments đều giữ ranh giới host.
- **Commands & Events**: Server phân phát host RPC qua WebSocket của daemon đang hoạt động; các công việc vòng đời như cung cấp môi trường, khởi động/dừng thread là bất đồng bộ trên góc nhìn người gọi API, sau khi daemon trả kết quả RPC thì Server quyết toán side-effect của lệnh; daemon riêng biệt đẩy ngược tiến độ của provider và thread theo đợt sự kiện.

**Contract và ranh giới:**

Hai gói contract định nghĩa ranh giới giữa các thành phần: `@bb/server-contract` (HTTP + WebSocket API giữa app/CLI ↔ Server: schema đường route, kiểu request/response, kiểu thông báo WS) và `@bb/host-daemon-contract` (giao thức Server ↔ host daemon: kiểu lệnh, kiểu sự kiện, vòng đời phiên, API cục bộ cho app/CLI). **Các gói triển khai tuyệt đối không vượt qua các ranh giới này khi import** — Server không biết workspace được cung cấp như thế nào, daemon không biết chi tiết thread/project (ngoài những gì lệnh bảo nó).

### 3.5 Cấu trúc Monorepo (bản đồ kho lưu trữ)

monorepo (pnpm workspaces + turbo + vitest) chứa App đã đóng gói cùng các dịch vụ runtime đi kèm:

| Gói / Ứng dụng | Vai trò |
|-----------|------|
| `packages/bb-app` | Gói npm được phát hành: bộ khởi động `npx bb-app@latest`, CLI `bb` được đóng gói, xuất SDK công khai |
| `apps/desktop` | Vỏ Electron macOS: giám sát runtime đóng gói và nạp bb Web UI |
| `apps/app` | Web UI: xem project, thread, environment và công việc đang chạy |
| `apps/server` | HTTP API, thông báo WebSocket, quản lý trạng thái, chính sách sản phẩm riêng của Server |
| `apps/host-daemon` | Runtime cục bộ của Host: cung cấp workspace, chạy tiến trình provider |
| `apps/cli` | CLI `bb` có thể script hóa (dùng cho cả người dùng lẫn tác tử) |
| `apps/web` | Trang getbb.app: trang tiếp thị + xác thực/bảng điều khiển bb connect (TanStack Start on Cloudflare Workers) |
| `packages/sdk` | TypeScript SDK: phục vụ CLI, xuất SDK gói và client lập trình |
| `packages/agent-runtime` | Adapter cầu nối runtime provider: Codex, Claude Code, Pi, ACP agents |
| `packages/config` | Phân tích cấu hình, giá trị mặc định, schema cấu hình gói được quản lý, định nghĩa biến môi trường |
| `packages/db` | Schema SQLite, migration và tiện ích truy cập dữ liệu |
| `packages/server-contract` | Contract HTTP/WS giữa client ↔ Server |
| `packages/host-daemon-contract` | Contract lệnh/sự kiện giữa Server ↔ host daemon |

**Phụ thuộc cố định phiên bản (không thể thấy lý do từ package.json, đáng chú ý):**

- `@opentelemetry/api@1.9.1` (apps/server): cả Pi AI lẫn Drizzle đều kéo `@opentelemetry/api`; nếu không cố định tới phiên bản chính xác, pnpm sẽ phân giải ra hai bản sao, TypeScript sẽ thấy hai danh tính type khác nhau, khiến server typecheck thất bại.
- Gói Pi (0.84.0): Pi bridge và Pi extensions trong `bb-app` sẽ import mô-đun Pi của máy chủ; bridge được đóng gói giữ nguyên cây gói chính xác này trên đĩa, khiến extensions dùng chung một runtime tương thích.

### 3.6 Chế độ phát triển (xây dựng chính bb)

```bash
pnpm dev                # 启动 Vite App，代理 API/WS 到独立 dev server；启动器打印实际端口
pnpm dev:desktop        # 用 Electron 桌面外壳运行同一份源码 dev server
pnpm dev:restart        # 先在后台重新构建，再只重启有状态服务
pnpm dev:restart-server
pnpm dev:restart-host-daemon
pnpm start              # 生产模式构建（app + server + host-daemon），直接跑 launcher
pnpm bb --help          # 构建后的 CLI，指向默认/生产实例
pnpm reset              # 清空生产状态
pnpm bb:dev --help      # 源码 CLI，指向本 checkout 的 dev 实例
pnpm reset:dev          # 清空本 checkout 的 dev 状态
pnpm reset:all          # 清空生产与 dev 状态
```

Điểm thiết kế: mỗi checkout có thư mục dữ liệu riêng `~/.bb-dev/<checkout-instance>/` và cổng cao tầng xác định được suy ra từ đường dẫn checkout; nhiều worktree có thể chạy song song với instance `npx bb-app@latest` đã đóng gói. Hành vi hot-reload được **tách bạch có chủ đích**: App tự hot-reload, Server không hot-reload, host daemon không hot-reload — dịch vụ mang trạng thái cần khởi động lại một cách tường minh. Truy cập từ xa có thể dùng `tailscale serve --bg --https=443 http://127.0.0.1:<app-port>` để công bố listener loopback; `pnpm storybook` (Ladle) ràng buộc mọi giao diện, không nên chạy trên mạng không tin cậy.

### 3.7 Tích hợp Provider và skills

- **Chỉ mục skill gốc**: bb lập chỉ mục các thư mục gốc skill gốc được tài liệu hóa của Codex, Claude Code, Pi, Cursor, OpenCode, omp, Grok Build, Hermes (user root, project root và các root tương thích như `.agents/skills`), các skill này xuất hiện trong menu lệnh `/` của provider đã chọn; trang Skills và `bb skill list` hiển thị native skills của Claude Code / Codex / Cursor.
- **Chính sách tin cậy của Pi**: bb đọc tệp global `~/.pi/agent` của Pi và các tệp `.pi` của từng workspace (settings, credentials, models, packages, extensions, skills, prompts, themes, context); chỉ khi Pi đã lưu hoặc chính sách tin cậy global phê duyệt workspace đó, bb mới nạp tài sản project; các quyết định `ask` chưa được giải quyết vẫn giữ trạng thái không tin cậy.
- **Tác tử ACP tùy chỉnh**: cấu hình qua `customAcpAgents` trong `~/.bb/config.json`; có thể có `modelCli` / `reasoningCli` hoặc cấu hình suy luận `nativeReasoning`; trường `logo` cung cấp biểu tượng cho bộ chọn provider; `nativeSkillRoots` (đường dẫn user/project) thêm skill gốc của provider vào composer; `sharedSkillRoots` cho phép một tập skill vật lý dùng chung cho cả bb lẫn provider CLI độc lập (bb liệt kê chúng là skill chỉ đọc, tiêm vào các thread Codex / Claude / Pi / ACP).

### 3.8 Cấu hình và truy cập từ xa

- Cấu hình bền vững `~/.bb/config.json` (`bb-app config set/list/refresh`); thông tin xác thực lưu riêng trong `~/.bb/env.json` (`bb-app env set/list/unset`, `list` che dấu giá trị).
- Dùng từ xa: **bb connect** (qua xác thực/bảng điều khiển getbb.app) hoặc Tailscale Serve công bố listener loopback; truy cập trực tiếp cổng `38886` qua tailnet/LAN cần cờ tương thích nhạy cảm bảo mật tường minh `--server-bind-host 0.0.0.0`.
- Ánh xạ mở trình soạn thảo cục bộ cho Server từ xa: `bb-app client ssh-target set https://bb.example.test devbox`.

---

## 4. Triết lý thiết kế

### 4.1 Người dùng và tác tử đều là operator công dân hạng nhất

Nguyên tắc đầu tiên trong VISION.md. **bb không phải "công cụ dành cho con người, tiện thể mở một API", mà từ ngày đầu đã coi "được gọi theo cách lập trình" là nhu cầu hạng nhất**: Web App, CLI, managers và các bề mặt tương lai phơi bày cùng một tập chức năng cốt lõi, CLI không phải sidecar. Điều này trực tiếp quyết định cả một bộ thiết kế như SDK, tiêm `BB_SERVER_URL`/`BB_THREAD_ID`, mô hình thread...

### 4.2 Mở rộng được, thay vì bị fork

**"The system should adapt to a user's infrastructure and workflows, not force them to fork bb."** (Hệ thống nên thích ứng với hạ tầng và workflow của người dùng, thay vì ép họ fork.) Provider tùy chỉnh, môi trường, dịch vụ nền LLM, tích hợp CLI, bề mặt UI và các điểm mở rộng tương lai đều là các hình thức được hỗ trợ chính thức. bb không đặt cược vào một hệ sinh thái agent duy nhất, mà làm "mặt bằng chung của mọi agent".

### 4.3 Linh hoạt, không cứng nhắc

**"strong defaults and built-in flows without forcing users into one blessed way of working."** (Cung cấp giá trị mặc định mạnh và các luồng tích hợp sẵn, nhưng không ép người dùng chấp nhận một cách làm duy nhất được ban phước.) Quy trình managed và unmanaged đều nên trơn tru tự nhiên; hệ thống được cấu thành từ các nguyên thủy tái sử dụng được (primitives), chứ không phải một mớ ngoại lệ cứng nhắc viết tay. Thread, environment, contract đều là nguyên thủy, hình thái nghiệp vụ là kết quả được tổ hợp nên.

### 4.4 Làm việc ở mọi nơi

Máy đơn hôm nay phải dùng tốt ngay, nhưng không khóa cứng điều phối từ xa, thực thi đám mây, môi trường peer-backed và mobile tương lai. **Ưu tiên loopback cục bộ + công bố qua Tailscale/bb connect + cờ `--server-bind-host` tường minh** chính là hiện thân của triết lý này: mặc định an toàn (chỉ ràng buộc loopback), từ xa là một lựa chọn tường minh và có thể kiểm toán.

### 4.5 Nhanh và dễ hiểu

Hiệu năng, tính đơn giản vận hành và gánh nặng nhận thức thấp là một phần của sản phẩm (part of the product), không phải tối ưu hóa sau này. Tách hot-reload (App nóng, Server/daemon không nóng), Server không trạng thái + SQLite nguồn chân lý, tách gói contract, đều là hình chiếu của "tính dễ hiểu" ở tầng kiến trúc — **mỗi khối biết những gì nó cần biết, không hơn không kém**.

### 4.6 Dễ tin tưởng và áp dụng

**Chế độ cục bộ luôn dễ đánh giá và áp dụng**, đặc biệt với các đội hạn chế về bảo mật và tin cậy; tính năng có quản lý có thể mở rộng bb, nhưng **không thay thế sản phẩm cốt lõi**. Telemetry ẩn danh (installation ID ngẫu nhiên, không có nội dung), tắt bằng một nút (`BB_TELEMETRY=false`), bản xây dựng phát triển không bao giờ gửi — tin cậy là đầu vào thiết kế, không phải lời hoa mỹ marketing.

---

## 5. Tổng kết: Quan điểm và Kết luận

### 5.1 Danh sách quan điểm cốt lõi

1. **Điều phối tốt hơn phát minh**: thay vì làm lại coding agent thứ N, hãy điều phối các Codex/Claude Code/Cursor/Pi hiện có thành một không gian làm việc có thể lập trình — tái sử dụng thông tin xác thực đã xác minh, giảm chi phí chuyển đổi.
2. **Khuôn mẫu mới của IDE**: IDE tiến hóa từ "giao diện con người viết code" thành "giao diện con người có thể lập trình điều khiển tác tử làm việc"; bb là sự cụ thể hóa của khuôn mẫu này.
3. **Bề mặt công dân hạng nhất**: desktop/Web/CLI/HTTP API đều là công dân hạng nhất, CLI không phải giao diện hạng hai — khả năng script hóa là tiêu chuẩn của IDE thời đại agent, không phải điểm cộng.
4. **Thread là đơn vị công việc**: hội thoại + trạng thái vòng đời + luồng sự kiện append-only, biến "theo dõi theo thời gian thực, đổi hướng bất cứ lúc nào, bàn giao cho một tác tử khác" thành năng lực hạng nhất.
5. **Nguyên thủy ủy thác gốc**: manager thread + child thread khiến việc ủy thác nhiệm vụ giữa các tác tử trở thành thao tác hạng nhất, thay vì ghép nối tạm bợ.
6. **Tự khởi động (dogfooding)**: "builds itself" không phải khẩu hiệu — bb dùng cơ chế CLI/SDK/thread để phát triển bb, nhà phát triển là người dùng, người dùng là nhà phát triển.
7. **Server không trạng thái + DB nguồn chân lý**: Server chỉ làm định tuyến và giao thức, SQLite gánh toàn bộ trạng thái — trạng thái tập trung, thành phần không trạng thái, tự nhiên có thể khởi động lại và quan sát được.
8. **Ranh giới hướng contract**: `@bb/server-contract` và `@bb/host-daemon-contract` khiến các gói triển khai không vượt ranh giới lẫn nhau, hệ sinh thái provider có thể tiến hóa độc lập.
9. **Ưu tiên cục bộ, đám mây là phép tăng dần**: mặc định ràng buộc loopback, telemetry ẩn danh có thể tắt, môi trường managed/unmanaged tồn tại song song — trước tiên làm cho máy đơn đáng tin và dùng được, rồi mới bàn tới quản lý và đám mây.
10. **Quản lý vòng đời môi trường**: môi trường managed tự dọn dẹp, nhiều thread chia sẻ môi trường, Project xuyên Host — môi trường thực thi trở thành tài nguyên điều phối được thay vì đồ tạp thủ công.

### 5.2 Những câu nói ấn tượng (đáng để memo)

- "The agent IDE that builds itself." (IDE tác tử tự xây dựng chính nó.)
- "bb is a programmable workspace for coding agents." (bb là không gian làm việc có thể lập trình cho các tác tử lập trình.)
- "Every surface — the desktop app, web app, CLI, and HTTP API — is a first-class way to drive bb." (Mỗi bề mặt — desktop App, Web App, CLI và HTTP API — đều là cách công dân hạng nhất để điều khiển bb.)
- "Work runs in threads you can follow live, steer at any point, or hand off to another agent." (Công việc chạy trong thread, bạn có thể theo dõi theo thời gian thực, đổi hướng bất cứ lúc nào, hoặc bàn giao cho một tác tử khác.)
- "Users and agents are both first-class operators." (Người dùng và tác tử đều là operator công dân hạng nhất.)
- "The system should adapt to a user's infrastructure and workflows, not force them to fork bb." (Hệ thống nên thích ứng với hạ tầng và workflow của người dùng, thay vì ép họ fork bb.)
- "Flexible, not rigid." (Linh hoạt, không cứng nhắc.)

### 5.3 Kết nối với các bài phân tích chuyên sâu khác trên site này (bước tiếp theo cho độc giả)

- **Herdr / Harbor Framework / Codex Orchestration (công cụ điều phối tác tử)**: các dự án này giải quyết "nhiều tác tử phối hợp thế nào"; bb tiến thêm một bước, nâng điều phối thành **không gian làm việc IDE hoàn chỉnh + mô hình thread + giao diện có thể lập trình**, và hỗ trợ orchestrator bị điều phối (điều phối lồng nhau).
- **Loạt bài Loop Engineering (kỹ thuật vòng lặp)**: vòng lặp/đồ thị là hình thái chạy của tác tử; bb cung cấp **runtime và bề mặt làm việc** để chứa các hình thái này — thread là vùng chứa có thể quan sát, tiêm và bàn giao được.
- **Công cụ IDE tác tử loại base**: so với ràng buộc sâu một provider, bb chủ trương provider trung lập (hơn 7 provider + ACP tùy chỉnh) + toàn bề mặt công dân hạng nhất, là đại diện của lộ trình "giao thức lớn hơn thương hiệu".

---

## Tài liệu tham khảo

- Trang chủ dự án: `https://github.com/get-bb/bb` (MIT, tổ chức get-bb)
- README: `README.md` — định vị, bốn bề mặt, tải desktop, khởi động npx, telemetry, vòng phát triển, khắc phục sự cố
- Vision: `docs/VISION.md` — mục tiêu và sáu nguyên tắc thiết kế (căn cứ chương 4 của bài viết)
- System Overview: `docs/system-overview.md` — thành phần runtime, mô hình dữ liệu, contract và ranh giới (căn cứ 3.4 của bài viết)
- Repository Overview: `docs/repository-overview.md` — bản đồ 13 gói monorepo và giải thích phụ thuộc cố định phiên bản (căn cứ 3.5 của bài viết)
- Tài liệu gói: `packages/bb-app/README.md` — khởi động nhanh, CLI, script SDK, bảng thông tin xác thực provider, lệnh cấu hình (căn cứ chương 3 của bài viết)
- Tài liệu khác: `docs/configuration.md`, `docs/platform-support.md`, `docs/multiple-devices.md`, `docs/worktrees.md`
- Đọc liên quan (tại site này): các bài phân tích chuyên sâu Herdr / Harbor Framework / Codex Orchestration, loạt bài phân tích chuyên sâu Loop Engineering