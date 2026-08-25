---
title: "Phân tích chuyên sâu Cumora: Nền tảng cộng tác đa nền tảng nơi AI Agent là thành viên hạng nhất của nhóm — Hình thức sản phẩm, Hướng dẫn chi tiết và Triết lý thiết kế"
description: "Phân tích chuyên sâu yetone/cumora (GitHub mã nguồn mở, MIT, v0.2.2): ① Tổng quan dự án — ứng dụng chat nhóm đa nền tảng PWA+Electron+Capacitor ba shell đồng nguồn, Cumora Cloud+BYOA hai đường dẫn bộ não, AI Agent là thành viên first-class; ② Hướng dẫn chi tiết — khởi động cục bộ (Postgres+Redis), chuyển đổi bộ não (managed / Claude Code / Codex / Grok Build / Cursor Agent), các lớp phòng thủ phối hợp (freshness gate / atomic claim / small-brain triage), email thực (Resend ra + Cloudflare Email Routing vào), triết lý thiết kế Coordination; ③ Kiến trúc kỹ thuật — React 18 + Vite + TS + Tailwind frontend, Express + ws + Postgres + Redis backend, Kubernetes agent pods, Go FUSE mount workspace, sổ cái chi phí llm_calls; ④ 7 triết lý thiết kế — Agent là đồng đội không phải chatbot, Computer là hạng nhất, I/O surface tách rời, cộng tác không xung đột, sổ cái chi phí minh bạch, CI cưỡng chế big-brain guard, feature lifecycle khép kín. Luận điểm cốt lõi: coi AI Agent là thành viên nhóm thực sự chứ không phải công cụ phản hồi — họ có persona bền vững, trí nhớ, nhận việc, phối hợp với nhau, gửi/nhận email thật, tất cả trên cùng một Roster."
date: "2026-08-25"
author: "TopDigg Research Team"
tags: ["Cumora", "yetone", "AI Agent", "Multi-Agent", "BYOA", "Claude Code", "Codex", "Cursor Agent", "Grok Build", "Kubernetes", "React", "Vite", "Express", "Postgres", "Redis", "Electron", "Capacitor", "Cloudflare Workers", "OpenAI Responses API", "Mã nguồn mở", "MIT", "Phối hợp Agent", "freshness gate", "triage"]
categories: ["Deep Dive"]
keywords: ["Cumora", "yetone/cumora", "AI agent team", "multi-agent collaboration", "BYOA", "Bring Your Own Agent", "Claude Code", "Codex CLI", "Cursor Agent", "Grok Build", "OpenAI Responses API", "agent coordination", "freshness gate", "atomic claim", "small-brain triage", "Kubernetes agent pods", "Go FUSE", "React 18", "Vite", "TypeScript", "Tailwind", "Express", "WebSocket", "Postgres", "Drizzle ORM", "Redis pub/sub", "Electron", "Capacitor", "Cloudflare Workers", "Resend", "agent persona", "agent memory", "feature lifecycle", "ship protocol", "mã nguồn mở", "MIT license", "triết lý thiết kế"]
---

# Phân tích chuyên sâu Cumora: Nền tảng cộng tác đa nền tảng nơi AI Agent là thành viên hạng nhất của nhóm — Hình thức sản phẩm, Hướng dẫn chi tiết và Triết lý thiết kế

> **Ý tưởng cốt lõi**: **Cumora (yetone/cumora) không phải là một "tích hợp chatbot AI" khác — nó là một nền tảng cộng tác đa nền tảng coi AI agent là thành viên hạng nhất của nhóm.** Trong Cumora, AI agent và con người chia sẻ cùng danh sách, cùng DM, cùng cuộc trò chuyện nhóm, cùng bảng Kanban, cùng lịch. Agent không chỉ trả lời khi được gọi — chúng có **persona bền vững, trí nhớ, tự chủ động nhận việc, phối hợp mà không xung đột, và gửi/nhận email thật** — đồng thời có thể chạy trên cloud chính thức của Cumora hoặc trên Mac/VPS của riêng bạn (BYOA). Phán đoán kỹ thuật cốt lõi của nó là: **"Cộng tác là N bộ não độc lập + một lớp điều phối + một sổ cái minh bạch"** — 7 lớp phòng thủ (per-agent model pin, semaphore đồng thời, deterministic spawn pacing, AdaptivePacer thích nghi, wake debounce, per-agent rate-limit cooldown, freshness preflight) + một small-brain triage gate + một sổ cái chi phí `llm_calls` biến cộng tác đa agent từ "gửi tin nhắn nhóm" thành "hệ thống phối hợp kỹ thuật hóa". Phán đoán này được hiện thực hóa thành triển khai kỹ thuật có thể chạy được thông qua 2 đường dẫn triển khai (Managed / BYOA), 5 trụ tài liệu (BYOA / COORDINATION / SHIPPING / email / i18n), 2 bộ bảo vệ kiến trúc (guard:big-brain / guard:llm-tracked), và 1 feature lifecycle (Draft → Contract → Building → Verifying → Ready → Releasing → Watching → Learned).

---

## I. Tổng quan dự án

### 1.1 Nó là gì?

Bài viết này phân tích kho GitHub [`yetone/cumora`](https://github.com/yetone/cumora) (TypeScript, giấy phép MIT, v0.2.2) — **một ứng dụng chat nhóm đa nền tảng coi AI agent là người tham gia hạng nhất**.

Có thể tóm gọn trong một câu:

> **Cumora = một client đồng nguồn PWA / Electron / iOS / Android + một backend Express + ws + Postgres + Redis + N agent runtime (managed K8s pods hoặc BYOA local daemons) + Cloudflare Workers (email-gate / r2-gate)** — AI agent và con người cùng tồn tại trên một Roster; agent có persona, trí nhớ, có thể nhận việc, phối hợp với nhau, và gửi/nhận email thật.

Cumora cố ý **không** làm một số việc: **không phát minh LLM mới, không phát minh framework agent mới, không thay thế subscription của bạn**. Những gì nó làm:

1. **Coi agent là đồng đội** — cùng danh sách, cùng DM, cùng chat nhóm, cùng Kanban, cùng lịch — agent không phải chatbox thụ động, mà là người cộng tác có trạng thái và chủ động;
2. **Hai đường dẫn "bộ não"**:
   - **Cumora Cloud** (managed): mỗi agent chạy trong một K8s pod; `server/src/agents/turn.ts` chạy vòng lặp multi-hop tool-calling trên OpenAI Responses API (bash, files, browser, email, memory, skills…);
   - **BYOA (Bring Your Own Agent)**: bạn chạy daemon `npx cumora agent computer` và sử dụng **Claude Code / Codex / Grok Build (`grok`) / Cursor Agent (`cursor-agent`)** cục bộ làm bộ não của agent — server không bao giờ thấy provider key của bạn;
3. **I/O surface tách rời** — bộ não nào được dùng và Computer nào chạy agent được tách rời khỏi các hành động thế giới của nó (reply, DM, memory, workspace, card); tất cả đều đi qua `cumora` CLI (một shim mỏng POST argv đến `/runtime/cli`), một giao thức cho mọi bộ não;
4. **Phối hợp kỹ thuật thực sự** — N agent trong cùng phòng không giẫm lên nhau. Server phân xử bằng seen-cursor freshness gate (một reply cũ bị HELD và hiển thị các tin nhắn mới hơn để quyết định lại), atomic claims trên các đơn vị công việc thực, và một small-brain triage gate bảo vệ model lớn;
6. **Feature Lifecycle** — agent dùng cùng Ship protocol như con người: `Draft → Contract → Building → Verifying → Ready → Releasing → Watching → Learned` — mỗi giai đoạn cần evidence squares, verifier độc lập, và 24h production readback;
7. **Mã nguồn mở + MIT** — `CONTRIBUTING.md` ghi rõ các bất biến kiến trúc và CI guards: `npm run guard:big-brain` (chỉ agent turn mới được dùng model lớn) + `npm run guard:llm-tracked` (mọi lệnh gọi LLM phải được ghi sổ).

### 1.2 Định vị một dòng

> **Cumora là Slack mã nguồn mở, bring-your-own-subscription + một đội ngũ đồng đội Claude Code / Codex / Cursor Agent / Grok Build.**

### 1.3 Sự kiện chính

- **Kho**: [yetone/cumora](https://github.com/yetone/cumora) (MIT)
- **Phiên bản**: v0.2.2
- **Sản phẩm**: [cumora.ai](https://cumora.ai) · Web app: [app.cumora.ai](https://app.cumora.ai)
- **Ngôn ngữ chính**: TypeScript (strict, dual tsconfigs)
- **Cơ sở dữ liệu**: Postgres + Drizzle ORM
- **Message bus**: Redis (pub/sub fan-out + presence)
- **Server**: Node.js + Express 5 + ws (WebSocket)
- **Frontend**: React 18 + Vite + TypeScript + Tailwind CSS (desktop / mobile / web / admin chia sẻ components)
- **Desktop**: Electron + electron-updater (auto-update qua [yetone/cumora-releases](https://github.com/yetone/cumora-releases))
- **Di động**: Capacitor (iOS + Android, package `io.cumora.app`)
- **Agent runtime**: Cumora Cloud chạy trong K8s pods (mỗi agent một, Go FUSE driver mount server-side workspace); BYOA chạy trên Mac/VPS của người dùng (daemon `npx cumora agent computer`)
- **Bộ não BYOA hỗ trợ**: Claude Code (Anthropic) / Codex CLI (OpenAI) / Grok Build `grok` (xAI) / Cursor Agent `cursor-agent`
- **Giao thức LLM**: OpenAI Responses API (multi-hop tool calling)
- **Email ra**: Resend HTTP API (mock mode không cần key)
- **Email vào**: Cloudflare Email Workers (workers/email-gate)
- **CDN**: Cloudflare R2 (workers/r2-gate signed URLs)
- **Push**: APNs (iOS) + FCM (Android) qua Capacitor Push Notifications
- **Lớp phòng thủ Coordinator**: 7 lớp (per-agent model pin, big-brain semaphore mặc định 6, deterministic spawn pacing mặc định 500ms, AdaptivePacer thích nghi tối đa 8s, wake debounce 2.5s, per-agent rate-limit cooldown 60s, freshness preflight)
- **CI architecture guards**: `guard:big-brain` (chỉ agent turn mới được dùng model lớn) + `guard:llm-tracked` (mọi lệnh gọi LLM phải được ghi sổ)
- **Feature lifecycle 8 giai đoạn**: `Draft → Contract → Building → Verifying → Ready → Releasing → Watching → Learned`
- **Benchmarks**: `benchmarks/` chạy benchmark phối hợp đa agent LLM thực — chain / counting / werewolf / kanban
- **i18n**: hỗ trợ English + Simplified Chinese (`zh-CN`), tùy chọn locale theo thiết bị
- **Bề mặt triển khai**: PWA / Electron desktop / iOS / Android / admin — 5 shell

### 1.4 Vấn đề nó giải quyết

"Cộng tác nhóm AI" năm 2026 bị xé thành 5 mảng:

1. **Agent = chatbot** — hầu hết sản phẩm tích hợp LLM kiểu "@gpt tóm tắt cái này" — không persona, không trí nhớ, không chủ động mở hội thoại, không nhận việc, không phối hợp giữa các agent;
2. **Agent = cloud hoặc local, không phải cả hai** — bạn muốn subscription Claude Code / Codex cục bộ VÀ độ tin cậy của cloud — BYOA và Managed không thể cùng tồn tại;
3. **Agent xung đột** — nhiều agent thức dậy cùng lúc, thấy cùng tin nhắn, đưa ra cùng quyết định, đăng cùng tin nhắn — "race collisions" và "brain misjudgment";
4. **Chi phí không minh bạch** — nhiều agent cộng tác, mỗi turn dùng bao nhiêu token, bao nhiêu tiền, model nào — không có sổ cái minh bạch;
5. **Đa nền tảng không liên tục** — cuộc trò chuyện mở trên web không có trên mobile; thông báo desktop không đến mobile — không có UI đa đầu thống nhất.

Câu trả lời của Cumora: **biến agent thành đồng đội thực sự; để bộ não có thể là chính thức hoặc cục bộ; biến phối hợp thành 7 lớp phòng thủ kỹ thuật; ghi mọi lệnh gọi LLM vào sổ cái; chạy cùng React components trên mọi nền tảng.**

---

## II. Hướng dẫn chi tiết: Từ 0 đến chạy một agent team

Phần này đi qua 7 bước: "khởi động cục bộ → khởi chạy client → chuyển Managed/BYOA → cơ chế phối hợp hoạt động ra sao → email thực → Feature Lifecycle". Mỗi bước có lệnh copy được, ví dụ tối thiểu và ghi chú. Nguồn: [CONTRIBUTING.md](https://github.com/yetone/cumora/blob/main/CONTRIBUTING.md), [docs/BYOA.md](https://github.com/yetone/cumora/blob/main/docs/BYOA.md), [docs/COORDINATION.md](https://github.com/yetone/cumora/blob/main/docs/COORDINATION.md), [docs/SHIPPING.md](https://github.com/yetone/cumora/blob/main/docs/SHIPPING.md).

### 2.1 Bước 1: Chuẩn bị môi trường cục bộ

**Điều kiện tiên quyết**:

- **Node.js ≥ 18** (CI chạy Node 24)
- **Postgres** (Homebrew / Docker)
- **Redis** (Homebrew / Docker)
- **OpenAI API key** (biến môi trường bắt buộc duy nhất)

**Thử nhanh nhất**:

```bash
# Tạo database
createdb -h localhost cumora

# Đặt biến môi trường
export OPENAI_API_KEY=sk-...

# Clone và cài đặt
git clone https://github.com/yetone/cumora.git
cd cumora
npm run setup        # cài đặt root + Email Worker dependencies
npm run dev:all      # Vite renderer :5180 + API server :5181
```

Mở [http://localhost:5180](http://localhost:5180) cho PWA, hoặc chạy `npm run electron:dev` cho cửa sổ desktop.

> Lưu ý: Schema database được **tạo idempotent khi khởi động**, và seed một starter team (6 agent + 3 người + 9 cuộc trò chuyện), nhưng **tất cả tin nhắn được tạo trực tiếp** — seed chỉ seed cấu trúc, không seed tin nhắn.

### 2.2 Bước 2: Cấu hình biến môi trường

`OPENAI_API_KEY` là biến bắt buộc duy nhất; mọi thứ khác có giá trị mặc định hợp lý hoặc soft-disable khi chưa đặt:

| biến | mặc định |
|-----|---------|
| `DATABASE_URL` | `postgres://$USER@localhost:5432/cumora` |
| `REDIS_URL` | `redis://localhost:6379` |
| `OPENAI_MODEL` | big-brain model |
| `OPENAI_MODEL_SUPPORT` | support model |
| `PORT` | `5181` |

Các nhóm tính năng tùy chọn (OAuth login, Resend + Cloudflare Email Routing, R2 storage/CDN, APNs/FCM push, sub2api LLM gateway, waitlist/invites, metrics) được ghi trong [`.env.example`](https://github.com/yetone/cumora/blob/main/.env.example) và `server/src/env.ts`.

### 2.3 Bước 3: Chọn đường dẫn bộ não của agent

#### Đường dẫn A: Cumora Cloud (Managed)

Không cần cấu hình thêm — `runAgentTurn` (trong `server/src/agents/turn.ts`) chạy vòng lặp multi-hop tool-calling mặc định; agent sống trong K8s pod riêng (dùng image `agent-computer`); pod mount server-side workspace qua Go FUSE driver.

```bash
# Phía server, khi khởi động:
# msg.new ─► scheduler.wakeOne ─► ensurePod (kubectl) ─► pod
#                                                       │
#                turn.ts hop loop ◄─────────────────────┘
#                getLlmClient → OpenAI Responses API
#                bash → cumora shim → /runtime/cli → DB
```

#### Đường dẫn B: BYOA (Bring Your Own Agent)

Chạy daemon trên Mac/VPS của bạn, dùng CLI cục bộ làm bộ não:

```bash
# Cài đặt cumora CLI (npm package agent-cli)
npx cumora agent computer
```

Các bộ não cục bộ được hỗ trợ:
- **Claude Code** (Anthropic)
- **Codex CLI** (OpenAI)
- **Grok Build** (`grok`) (xAI)
- **Cursor Agent** (`cursor-agent`) (Cursor)

> Thuộc tính quan trọng: **Server không bao giờ chạm vào provider key của bạn** — toàn bộ vòng đời wake → turn của BYOA đi qua SSE (`/runtime/wake-stream`) + CLI (`/runtime/cli`), nhưng API key ở lại trên máy bạn.

### 2.4 Bước 4: Hiểu 7 lớp phòng thủ phối hợp

Đây là tinh hoa của Cumora — nhiều agent trong cùng phòng không xung đột, nhờ 7 lớp phòng thủ kỹ thuật + một triage gate:

```
┌─────────────────────────────────────────────────────────────┐
│  1. Per-agent model pin (deploy env)                        │
│     CUMORA_DEFAULT_CLAUDE_MODEL=claude-opus-4-7             │
│     → ghim model, ngăn CLI default drift                   │
├─────────────────────────────────────────────────────────────┤
│  2. Per-computer big-brain concurrency cap (daemon)         │
│     CUMORA_BYOA_MAX_CONCURRENT_BIG_BRAIN=6                  │
│     → mặc định 6, ngăn rate limit theo burst               │
├─────────────────────────────────────────────────────────────┤
│  3. Deterministic spawn spacing (daemon)                     │
│     MIN_SPAWN_INTERVAL_MS=500ms                              │
│     → pacing xác định thay vì random jitter                 │
├─────────────────────────────────────────────────────────────┤
│  3a. Per-computer small-brain (triage) concurrency cap      │
│     CUMORA_BYOA_MAX_CONCURRENT_TRIAGE=8                      │
│     → triage cũng được gác (bài học 2026-06-02)            │
├─────────────────────────────────────────────────────────────┤
│  3b. AdaptivePacer — burst absorber cho sustained throttle │
│     gấp đôi khi rate limit (tối đa 8s), giảm nửa sau 5 lần │
│     → backoff thích nghi toàn cục                            │
├─────────────────────────────────────────────────────────────┤
│  3c. Wake debounce, coalescing, và same-turn steering      │
│     WAKE_DEBOUNCE_MS=2500 + direct-ping steering + group nudge │
│     → gộp burst, lái trực tiếp giữa turn                   │
├─────────────────────────────────────────────────────────────┤
│  4. Per-agent rate-limit cooldown (daemon)                  │
│     ENGINE_BACKOFF_AFTER_RATE_LIMIT_MS=60_000                │
│     → cooldown 60s từng agent, nén thông báo                 │
├─────────────────────────────────────────────────────────────┤
│  5. Server-side freshness preflight (`cumora reply`)        │
│     seen-cursor vs baseline → HELD + quyết định lại         │
│     → ngăn race collision                                    │
├─────────────────────────────────────────────────────────────┤
│  small-brain triage gate                                    │
│     haiku / gpt-5.4-mini gác, actionable=true mới qua       │
│     → bảo vệ big-brain khỏi việc vặt vãnh                  │
└─────────────────────────────────────────────────────────────┘
```

> **Triết lý cốt lõi**: **Không bao giờ thêm quy tắc prompt khi cơ chế mã mới là cách sửa đúng, và không bao giờ thêm cơ chế mã khi bộ não đang đưa ra quyết định rõ ràng trước trạng thái đúng.**

### 2.5 Bước 5: Cho agent có email thực

Mỗi agent có một **địa chỉ email thực** (`<participantId>.<companySlug>@<EMAIL_DOMAIN>`), có thể gửi và nhận:

```
┌──────────────┐  MIME    ┌────────────────────────┐  HMAC-signed JSON   ┌──────────────────┐
│  Sender MTA  │ ───────► │  Cloudflare            │ ──────────────────► │  cumora-server   │
│ (gmail, etc) │   MX     │  Email Routing +       │   POST /webhooks/   │  /webhooks/email │
└──────────────┘          │  workers/email-gate    │   email/inbound     │  /inbound        │
                          └────────────────────────┘                     └──────────────────┘
                                                                                 │
                                                                                 ▼ đánh thức agent nhận
```

CLI con:

```bash
cumora email send ...
cumora email reply ...
```

Khi `RESEND_API_KEY` chưa đặt, mock mode được kích hoạt (trả về message-id giả và log) — tiện cho phát triển cục bộ.

### 2.6 Bước 6: Chạy test và guard

```bash
npm test                  # unit test (node:test) — server + workers
npm run test:integration  # integration suite (cần Postgres/Redis cục bộ)
npm run typecheck && npm run server:typecheck
npm run guard:big-brain   # CI guard: chỉ agent turn mới được dùng model lớn
npm run guard:llm-tracked # CI guard: mọi lệnh gọi LLM phải được ghi sổ
```

### 2.7 Bước 7: Feature Lifecycle (Ship protocol)

Cumora coi việc phát hành là một workflow chia sẻ, có bằng chứng hỗ trợ:

```
Draft → Contract → Building → Verifying → Ready → Releasing → Watching → Learned
```

Mỗi giai đoạn:

- **Contract** — yêu cầu problem, desired outcome, concise contract
- **Building** — yêu cầu ít nhất một builder + một invariant
- **Verifying** — mọi invariant bắt buộc phải được evidence square bao phủ; mỗi square bắt buộc phải có owner
- **Ready** — mọi square bắt buộc phải qua, bao gồm user-path, trace, release-note proof; builder không thể tự hoàn thành square của mình
- **Production** — staging/canary release thành công + release notes + rollback plan + measurable baseline + approval
- **Watching** — bắt đầu sau khi production smoke qua; default readback đến hạn 24 giờ sau
- **Learned** — production readback đã qua + không có failing regression

Agent CLI:

```bash
cumora ship list
cumora ship show <feature_id>
cumora ship create "<title>" --problem "..." --outcome "..." --contract "..."
cumora ship square <feature_id> <square_id> running
cumora ship square <feature_id> <square_id> passed --evidence "..."
cumora ship friction <feature_id|none> "<title>" --severity high
cumora ship regression <feature_id> "<title>" --command "..." --expected "..."
```

---

## III. Kiến trúc kỹ thuật

### 3.1 Sơ đồ kiến trúc tổng thể

```
 Electron / PWA / iOS / Android         ┌─────────────────┐
 ┌──────────────────┐   HTTP / WS       │   App workers   │──▶ OpenAI (Responses API)
 │    React UI      │ ◀───────────────▶ │  Express + ws   │──▶ Resend (email out)
 └──────────────────┘                   │    (any N)      │──▶ APNs / FCM (push)
                                        └───┬────────┬────┘
 Cloudflare Workers                         │        │ kubectl
 ┌─────────────────┐   webhooks / R2   ┌────▼───┐ ┌──▼──────────────┐
 │ email-gate      │ ────────────────▶ │Postgres│ │ Agent pods (K8s)│
 │ r2-gate (CDN)   │                   │ Redis  │ │ hoặc BYOA daemons│
 └─────────────────┘                   └────────┘ └─────────────────┘
```

### 3.2 Frontend

- Pure UI (`src/`): React 18 + Vite + TypeScript + Tailwind
- 4 shell chia sẻ cùng components: `desktop/`, `mobile/`, `web/`, `admin/`
- Backend-driven; **frontend không ra quyết định business-rule**

### 3.3 Backend

- Stateless Node service (`server/`): Express + `ws`
- Postgres là **source of truth** (pg pool + Drizzle schema)
- Redis cho **pub/sub fan-out** và **presence**
- Bất kỳ N instance sau LB đều đồng bộ qua Redis bus

### 3.4 Agent runtime

- **Cloud agents**: mỗi agent một K8s pod (server dùng `kubectl`; Go FUSE driver mount server-side workspace)
- **BYOA agents**: daemon trên máy người dùng (`npx cumora agent computer`)
- Cả hai tương tác với thế giới qua **cùng giao thức `cumora` CLI**
- **Mọi lệnh gọi LLM** (cloud hoặc BYOA) đều vào một sổ cái chi phí `llm_calls`

### 3.5 Bất biến chính (CI bắt buộc)

```bash
# 1. Chỉ agent turn mới được dùng model lớn
npm run guard:big-brain

# 2. Mọi lệnh gọi LLM phải được ghi sổ
npm run guard:llm-tracked
```

Hai cái này là **mô hình chi phí cốt lõi** của Cumora — model "tiểu não" rẻ xử lý triage, phân loại, tóm tắt, mọi utility call; model đắt tiền chỉ dành cho agent reasoning turn thực sự.

### 3.6 Bố cục kho

| đường dẫn | nó là gì |
|---|---|
| `src/` | React renderer (desktop / mobile / web / admin) |
| `server/` | API + WebSocket + agent runtime (Express, Postgres, Redis) |
| `electron/` | desktop shell (auto-update qua yetone/cumora-releases) |
| `ios/`, `android/` | Capacitor native shells (`io.cumora.app`) |
| `agent-cli/` | npm package đã xuất bản `cumora` — daemon BYOA người dùng chạy |
| `agent-fuse/` | Go FUSE driver mount agent workspace trong cloud pods |
| `workers/` | Cloudflare Workers: `email-gate` (inbound mail) và `r2-gate` (signed CDN) |
| `website/` | marketing site cho cumora.ai (Cloudflare Pages) |
| `benchmarks/` | benchmark phối hợp đa agent LLM thực (chain / counting / werewolf / kanban) |
| `server/k8s/` | deployment manifests + GKE notes |

---

## IV. Tổng hợp quan điểm và kết luận

Qua phân tích chuyên sâu Cumora, dưới đây là 13 quan điểm chính:

### Quan điểm 1: AI agent nên được thiết kế là "đồng đội," không phải "chatbot"

**Sự kiện**: Cumora cho phép agent và con người chia sẻ cùng Roster, DM, chat nhóm, Kanban, lịch; agent có persona, trí nhớ, tự chủ động nhận việc, và có khả năng gửi/nhận email.

**Kết luận**: Thiết kế agent như công cụ phản hồi thụ động là sự lười biếng về hình thức sản phẩm — "AI đồng đội" thực sự cần tính chủ động, trí nhớ, khả năng phối hợp. Cumora biến nguyên lý này thành kỹ thuật (persona bền vững, wake chủ động, claim work, phối hợp giữa các agent).

### Quan điểm 2: "Bộ não" và "host" nên được tách rời — Computer là hạng nhất

**Sự kiện**: Cumora tách "agent" khỏi "chạy trên máy nào / dùng bộ não nào." Managed dùng `turn.ts` + OpenAI Responses API; BYOA dùng Claude Code / Codex / Grok Build / Cursor Agent CLI; cả hai tương tác với thế giới qua **cùng giao thức `cumora` CLI**.

**Kết luận**: "Khả năng suy nghĩ" và "vị trí làm việc" của agent không nên bị khóa cứng — cùng một mô hình tinh thần "agent của tôi sống trên máy" hoạt động cho cả managed cloud và thiết lập user-local. Cumora gọi đây là **Computer** (một khái niệm sản phẩm), không phải trường hợp đặc biệt BYOA.

### Quan điểm 3: Tách rời I/O surface làm "chuyển bộ não" gần như miễn phí

**Sự kiện**: `cumora` CLI là một shim mỏng — POST argv đến `/runtime/cli`, transport (SSE + `/runtime/cli`) là brain/host-agnostic.

**Kết luận**: Tách rời "làm gì" (reply, DM, memory, workspace, card) khỏi "nghĩ thế nào" (LLM nào, máy nào) là chiến thắng then chốt về kỹ thuật — bộ não và host có thể hoán đổi mà không cần triển khai lại I/O.

### Quan điểm 4: Phối hợp đa agent dựa vào "7 lớp phòng thủ kỹ thuật" + triage gate, không dựa vào prompt

**Sự kiện**: Phối hợp của Cumora có 7 lớp phòng thủ (model pin / concurrency semaphore / deterministic pacing / AdaptivePacer / wake debounce / rate-limit cooldown / freshness preflight) + small-brain triage gate.

**Kết luận**: **Không bao giờ thêm quy tắc prompt khi cơ chế mã mới là cách sửa đúng.** Phối hợp là vấn đề hệ thống cho N engine độc lập quyết định trong cùng phòng; prompt là cơ chế mềm với trần thấp; mã là cơ chế cứng, có thể kỹ thuật hóa, kiểm chứng được. Cumora dùng **dữ liệu sự cố thực** (130 rate-limit hit trong 17 phút) để thúc đẩy ra đời mỗi lớp phòng thủ.

### Quan điểm 5: Freshness gate + atomic claim là cốt lõi ngăn race collision

**Sự kiện**: `cumora reply` kiểm tra seen-cursor baseline (Redis, TTL 10 phút) trước INSERT; nếu có cập nhật, trả về HELD envelope (exit code 2) để agent quyết định lại với tin nhắn mới; work claim trên một Computer là nguyên tử.

**Kết luận**: **Serializable là nền tảng của cộng tác.** Không phải làm cho mọi agent đúng (không thể) — mà là để agent sai có thể HELD và quyết định lại khi lỗi xảy ra. Tư duy hệ thống phân tán áp dụng trực tiếp cho cộng tác agent.

### Quan điểm 6: Wake debounce + same-turn steering giải quyết mâu thuẫn "burst vs latency"

**Sự kiện**: `WAKE_DEBOUNCE_MS=2500` gộp các burst thành một turn; đồng thời DM/@mention giữa turn được inject trực tiếp vào session LIVE; group activity dùng content-free nudge đơn lẻ.

**Kết luận**: Phối hợp không thể là "mỗi tin nhắn một turn" (lãng phí, race) hay "chờ xử lý batch" (latency cao). Hai đường thoát của Cumora — direct-ping steering + coalesced rerun — là thiết kế then chốt.

### Quan điểm 7: BYOA là triển khai cấp sản phẩm của "người dùng sở hữu provider key"

**Sự kiện**: Daemon BYOA chạy trên máy người dùng, dùng Claude Code / Codex / Grok / Cursor Agent CLI cục bộ của người dùng; server **không bao giờ** chạm vào provider key.

**Kết luận**: Trong kỷ nguyên LLM, "API key của bạn hay của tôi" là bước ngoặt cấp sản phẩm — BYOA không phải lựa chọn kỹ thuật, mà là lựa chọn cấu trúc tin tưởng. Cumora nâng tầm điều này thành hình thức sản phẩm hạng nhất (Computer / BYOA / Managed ba trạng thái trong cùng UI).

### Quan điểm 8: CI guard là chất mang duy nhất có thể thực thi của "bất biến kỹ thuật"

**Sự kiện**: `guard:big-brain` và `guard:llm-tracked` là các script CI cưỡng chế "chỉ agent turn mới được dùng model lớn" và "mọi lệnh gọi LLM phải được ghi sổ."

**Kết luận**: **"Model lớn cho suy luận, model nhỏ cho công cụ" và "chi phí phải truy vết được" là nguyên lý — nhưng nguyên lý không cưỡng chế thì không phải nguyên lý.** Cumora dùng CI để biến nguyên lý thành bất biến có thể thực thi.

### Quan điểm 9: Feature Lifecycle là "giao thức phát triển chia sẻ giữa người và agent"

**Sự kiện**: 8 giai đoạn (Draft → Contract → Building → Verifying → Ready → Releasing → Watching → Learned) + mỗi giai đoạn cần evidence squares + verifier độc lập + 24h production readback.

**Kết luận**: **"Phát hành" không phải trạng thái PR — nó là workflow có bằng chứng hỗ trợ.** Cumora để agent cũng dùng CLI `cumora ship ...` để tạo / xác minh / phát hành feature — đây không chỉ là tích hợp công cụ, đó là **hội tụ workflow** — người và agent cộng tác trong cùng giao thức.

### Quan điểm 10: i18n là "bản địa hóa tiến bộ," không phải "phải hoàn chỉnh trước khi lên"

**Sự kiện**: Mỗi locale được TS-type đối chiếu `en.ts`; key sai chính tả / bịa sẽ `tsc` fail; key chưa dịch fallback về tiếng Anh — partial là bình thường.

**Kết luận**: i18n không nên là mô hình thác đổ đòi hỏi "mọi thứ dịch xong mới lên." Cách của Cumora: **`en` là source of truth, locale khác type đối chiếu nó** — thiếu dịch không vỡ UI, dịch sai vỡ biên dịch. "i18n tiến bộ do kiểu dẫn dắt" này là giải pháp thanh lịch nhất.

### Quan điểm 11: Tách rời + phối hợp + minh bạch = hệ thống agent đáng tin cậy

**Sự kiện**: I/O tách khỏi bộ não + 7 lớp phòng thủ phối hợp + sổ cái chi phí `llm_calls` + guard CI cưỡng chế.

**Kết luận**: **Ba điều kiện để người dùng tin tưởng hệ thống agent: có thể kiểm soát (hoán đổi bộ não), đáng tin (không xung đột), có thể kiểm toán (chi phí minh bạch).** Cumora thỏa mãn cả ba — một "hệ thống agent hoàn chỉnh" hiếm có về kỹ thuật.

### Quan điểm 12: Mã nguồn mở + đa nền tảng là hình thức sản phẩm "đúng không hiển nhiên"

**Sự kiện**: Giấy phép MIT, 5 shell (PWA / Electron / iOS / Android / admin), cùng React components, CI guard nghiêm ngặt, i18n production-ready, production 24h readback.

**Kết luận**: Năm 2026, với tư cách một danh mục sản phẩm "nền tảng cộng tác AI", **điểm yếu dễ bị gã khổng lồ đè bẹp nhất là vendor lock-in** — Cumora dùng MIT + đa đầu + CI guard biến điều này thành chiến hào.

### Quan điểm 13: Local CLI + remote protocol đang trở thành hình thức chuẩn của chuỗi công cụ agent

**Sự kiện**: Daemon BYOA dùng Claude Code / Codex / Grok / Cursor cục bộ làm bộ não; managed dùng OpenAI Responses API; cả hai tương tác với thế giới qua cùng giao thức `cumora` CLI + SSE + `/runtime/cli`.

**Kết luận**: **"Local CLI + remote protocol" đang trở thành tiêu chuẩn thực tế cho chuỗi công cụ agent.** Claude Code / Codex / Cursor đã là CLI-first; Cumora trừu tượng hóa điều này thành triển khai cấp sản phẩm.

---

## V. Triết lý thiết kế

Triết lý thiết kế của Cumora có thể đọc từ mã, tài liệu, CI guard, hướng dẫn đóng góp — **nó không phải khẩu hiệu viết ở đâu đó, mà là phán đoán thấm vào mọi quyết định kỹ thuật.** Tôi cô đọng thành 7 nguyên lý:

### Triết lý 1: Agent là đồng đội, không phải chatbot

> *"Agents don't just answer when poked: they hold personas and memory, claim work, coordinate with each other without colliding, send and receive real email."*
> — Cumora README

Đây không phải ngôn ngữ sản phẩm, mà là phán đoán kỹ thuật — mọi thiết kế của Cumora xoay quanh nguyên lý này:

- Cùng Roster, DM, chat nhóm, Kanban, lịch
- Persona và trí nhớ bền vững
- Wake chủ động, claim work, phối hợp giữa các agent
- Email thực (không phải "hệ thống thông báo" — SMTP thực)

### Triết lý 2: Computer là hạng nhất — bộ não và host tách rời

> *"Rather than bolt BYOA on as a special case, Computer is a first-class product concept that every agent shares: an agent always runs on some Computer."*
> — docs/BYOA.md

Mặt ngược lại của triết lý này là "BYOA là trường hợp đặc biệt của Managed" — cách Cumora là trừu tượng hóa nó thành Computer: mọi agent chạy trên một Computer nào đó (Cumora Cloud là một trong số đó), với cùng UI, cùng state machine, cùng logic phối hợp.

### Triết lý 3: I/O surface tách khỏi bộ não — làm cho "đổi bộ não" không tốn gì

> *"Cumora's I/O surface is fully decoupled from the brain. The same `cumora` CLI an agent uses for every world action is a thin shim that POSTs argv to `/runtime/cli`."*
> — docs/BYOA.md

Đây là phán đoán then chốt về kỹ thuật — tách "làm gì" (reply, DM, memory, workspace, card) khỏi "nghĩ thế nào" (LLM nào, máy nào), để cái sau có thể hoán đổi tùy ý.

### Triết lý 4: Phối hợp dựa vào phòng thủ kỹ thuật, không dựa vào prompt

> *"Never add a prompt rule when a code mechanism is the right fix, and never add a code mechanism when the brain's making a clear decision in front of correct state."*
> — docs/COORDINATION.md

Đây là cốt lõi triết lý phối hợp của Cumora — prompt là cơ chế mềm với trần thấp; phối hợp là vấn đề hệ thống phân tán và xứng đáng nhận câu trả lời của hệ thống phân tán (điều khiển đồng thời, serialization, debounce, adaptive backoff, atomic claim). Cumora biến nguyên lý này thành triển khai kỹ thuật có thể kiểm chứng qua 7 lớp phòng thủ.

### Triết lý 5: Minh bạch chi phí là nguyên lý, CI cưỡng chế là phương tiện

> *"Only agent turns may use the big model... the expensive model is reserved for the actual agent reasoning turn."*
> — CONTRIBUTING.md

> *"Every LLM call must be tracked in the cost ledger. Untracked spend is a correctness bug here, not just an oversight."*
> — CONTRIBUTING.md

Hai cái này không phải đề xuất, chúng là CI guard — `guard:big-brain` và `guard:llm-tracked` sẽ fail build của bạn. **Nguyên lý không cưỡng chế thì không phải nguyên lý.**

### Triết lý 6: Người và agent chia sẻ cùng giao thức phát triển

> *"Cumora treats shipping as a shared, evidence-backed workflow instead of a pull request status. Humans and agents use the same feature contract, verification squares, releases, production readbacks, friction inbox, and regression assets."*
> — docs/SHIPPING.md

Đây là triết lý sâu nhất của Cumora — **người và agent không phải hai loại nhà phát triển, mà là các vai trò khác nhau trong cùng workflow.** 8 giai đoạn lifecycle + evidence squares + verifier độc lập + 24h readback là chất mang của triết lý này.

### Triết lý 7: Thất bại phải được "read back", không phải "push and forget"

> *"The release contract is complete only after production behavior has been read back against its baseline. A green build or successful rollout is an intermediate signal, not the terminal state."*
> — docs/SHIPPING.md

Triết lý này chống lại văn hóa kỹ thuật "lên là xong" — Cumora coi production readback 24 giờ sau là một phần của release contract; readback thất bại đẩy feature trở lại trạng thái Building.

---

## VI. Kết luận: Bài học của Cumora cho kỹ thuật hóa AI Agent

Cumora dùng 5 shell + 2 đường dẫn triển khai + 7 lớp phòng thủ phối hợp + 1 feature lifecycle + 2 CI guard + 1 sổ cái chi phí `llm_calls` để biến "AI agent là thành viên hạng nhất của nhóm" từ tầm nhìn sản phẩm thành **hệ thống kỹ thuật có thể chạy được, kiểm chứng được, kiểm toán được, mã nguồn mở**.

Bài học cho kỹ thuật hóa AI agent có thể cô đọng thành 5:

1. **Agent là hạng nhất** — cùng Roster, DM, chat nhóm, Kanban, lịch; persona và trí nhớ bền vững; wake chủ động, claim work, phối hợp giữa các agent; email thực.
2. **Bộ não và host tách rời** — Computer là khái niệm sản phẩm hạng nhất; `cumora` CLI là I/O surface thống nhất; BYOA và Managed dùng cùng giao thức.
3. **Phối hợp là vấn đề kỹ thuật, không phải vấn đề prompt** — 7 lớp phòng thủ + triage gate đáng tin cậy hơn 100 dòng prompt; freshness gate + atomic claim là tư duy hệ thống phân tán áp dụng cho cộng tác agent.
4. **Bất biến kỹ thuật do CI cưỡng chế** — `guard:big-brain` + `guard:llm-tracked` biến "chi phí có thể kiểm soát, truy vết được" từ khẩu hiệu thành bất biến có thể thực thi.
5. **Người và agent chia sẻ cùng workflow** — 8 giai đoạn feature lifecycle + verifier độc lập + 24h readback là triển khai cấp sản phẩm của "AI đồng đội."

Nếu bạn đang thiết kế hệ thống agent của riêng mình, câu trả lời của Cumora không phải "dùng framework nào" — **mà là "hình thức sản phẩm nào."** Biến agent thành đồng đội thực sự, biến Computer thành hạng nhất, biến phối hợp thành phòng thủ kỹ thuật, biến chi phí thành CI cưỡng chế — đó là câu trả lời kỹ thuật của Cumora.

---

## Tài liệu tham khảo

- **Kho GitHub**: [yetone/cumora](https://github.com/yetone/cumora)
- **Sản phẩm**: [cumora.ai](https://cumora.ai)
- **Web App**: [app.cumora.ai](https://app.cumora.ai)
- **Tài liệu chính thức**:
  - [README.md](https://github.com/yetone/cumora/blob/main/README.md)
  - [docs/BYOA.md](https://github.com/yetone/cumora/blob/main/docs/BYOA.md)
  - [docs/COORDINATION.md](https://github.com/yetone/cumora/blob/main/docs/COORDINATION.md)
  - [docs/SHIPPING.md](https://github.com/yetone/cumora/blob/main/docs/SHIPPING.md)
  - [docs/email.md](https://github.com/yetone/cumora/blob/main/docs/email.md)
  - [docs/I18N.md](https://github.com/yetone/cumora/blob/main/docs/I18N.md)
  - [CONTRIBUTING.md](https://github.com/yetone/cumora/blob/main/CONTRIBUTING.md)
  - [SECURITY.md](https://github.com/yetone/cumora/blob/main/SECURITY.md)
- **Bất biến chính**: CI guard `guard:big-brain`, `guard:llm-tracked`
- **Lõi kiến trúc**: React 18 + Vite + TS + Tailwind / Express + ws + Postgres (Drizzle) + Redis / K8s Agent Pods / Go FUSE / Cloudflare Workers (email-gate + r2-gate) / Resend / APNs / FCM / Capacitor / Electron