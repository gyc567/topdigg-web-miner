---
slug: aura-analysis
title: "Phân tích chuyên sâu Aura: Một coding agent Rust tối giản, có thể kiểm thử — Xây dựng Agent bằng một vòng lặp while duy nhất (Ý tưởng cốt lõi + Tổng quan dự án + Hướng dẫn chi tiết + Triết lý thiết kế)"
description: "Phân tích toàn diện gyc567/aura (dự án mã nguồn mở, Rust, giấy phép MIT) — 'một coding agent Rust tối giản, có thể kiểm thử (a minimal, testable Rust coding agent)'. Ý tưởng cốt lõi: 'Stop prompting. Design the loop. Get a score.' (Ngừng gửi prompt. Thiết kế vòng lặp. Nhận điểm số) — thay vì thủ công gửi prompt cho agent mỗi lần, ta thiết kế trước cấu trúc vòng lặp để agent tự chạy, báo cáo và sửa lỗi theo nhịp cố định, với cổng kiểm duyệt của con người trước khi bất kỳ dòng code nào được hạ cánh. Ở cấp độ sản phẩm, toàn bộ sức mạnh của Aura đến từ một sự thật được kiểm chứng lặp đi lặp lại: một vòng lặp while(tool_use) duy nhất cộng với một bộ công cụ nhỏ gọn và sắc bén chính là nguồn gốc toàn bộ sức mạnh của Claude Code — độ phức tạp nên sống trong công cụ, không phải trong cấu trúc vòng lặp. Tổng quan dự án: Aura nhận nhiệm vụ ngôn ngữ tự nhiên → thu thập ngữ cảnh workspace được kiểm soát → chạy vòng lặp while(tool_use) trên tokio single-thread runtime → thông qua công cụ sửa đổi file và chạy xác minh → xuất bản tóm tắt thay đổi + báo cáo kiểm thử; kiến trúc năm lớp (L1 CLI presentation → L2 Session layer → L3 Agent while-loop driver → L4 Tool Registry/Policy/Precheck/Reminders → L5 ModelGateway); v1/v1.2/Phase 6-7 đã hoàn thành, v0.1.0 đã phát hành (ma trận build 5 nền tảng + install.sh), 345+ test xanh, clippy 0 cảnh báo; tham chiếu Claude Code (patterns & mechanisms), pi_agent_rust (security model), prime-agent (RLM programming model & session/persistence concepts). Hướng dẫn chi tiết: khởi động nhanh (cargo build, --fake-model kiểm thử không cần key, OpenAI-compatible API thật, output --json), bất biến vòng lặp cốt lõi (điều kiện thoát duy nhất: SIGINT / budget cạn kiệt / ErrorBudget cạn kiệt / model trả về non-Call), mã giả có thể biên dịch của vòng lặp while, tham số CLI, thứ tự ưu tiên cấu hình (CLI > config.toml > env vars), danh sách công cụ và thực thi hai giai đoạn (capability gate + regex precheck), tool error backfill + ErrorBudget (mặc định 3) để model tự phục hồi, subagent kiểu RLM (admission handle + background task + ChildRegistry + agent_message), scratchpad bộ nhớ làm việc liên tục, lớp Session JSONL transcript + --resume, framework đánh giá aura bench (run/report/init + 8 seed task + workspace cô lập + chỉ số định lượng), compaction ngữ cảnh phân lớp, plugin v2 (đặc tả agent-plugins.org + MCP), và phương pháp luận phát triển Loop Engineering (LOOP.md/STATE.md/loop-budget/loop-constraints, tiến hóa L1→L2→L3). Triết lý thiết kế: 15 nguyên tắc — KISS ưu tiên đơn giản ('vòng lặp đơn + 14 công cụ là nguồn gốc toàn bộ sức mạnh của Claude Code', mọi thiết kế đều hỏi 'có thể bớt lớp này không'), high cohesion low coupling, ranh giới năng lực rõ ràng (cấm kiểm tra whitelist đường dẫn âm thầm bên trong công cụ), bảo vệ thực thi hai giai đoạn, biên nhận kết quả công cụ (mỗi lần gọi tái tiêm vào, mạnh hơn N lần so với system prompt một lần), nhắc nhở hệ thống tĩnh, ưu tiên khả kiểm thử (hành vi mới phải có unit test, model mặc định dùng fake mang tính quyết định, cổng phủ 100%), tương thích tăng dần, có thể phục hồi (thất bại giữ nguyên hiện trường không tự động rollback nguy hiểm), tuyên bố dựa trên bằng chứng (tuyên bố hiệu năng/an toàn/tương thích phải gắn evidence artifact), tách SDK công khai với triển khai, Graceful SIGINT ngắt, xác thực tham số trước, ưu tiên streaming, chiến lược cắt ngắn rõ ràng; cùng nguyên tắc mượn chọn lọc — Claude Code cung cấp patterns & mechanisms, pi_agent_rust cung cấp security model, prime-agent cung cấp RLM programming model, mọi năng lực phức tạp ngoài giao của ba nguồn (vòng đời tin cậy, multi-provider, daemon đa tiến trình, TUI, RPC, Critic, bộ nhớ dài hạn) đều trì hoãn hoặc tách thành đặc tả độc lập."
date: "2026-08-12"
author: "TopDigg"
tags: ["Aura", "Rust", "AI Agent", "Coding Agent", "Agent Architecture", "While Loop", "Tool Use", "Claude Code", "RLM", "Session", "Benchmark", "Loop Engineering", "KISS", "Model Gateway", "Error Budget"]
categories: ["Deep Dive"]
keywords: ["Aura", "Rust", "Coding Agent", "AI Agent", "Agent Architecture", "vòng lặp while", "Tool Use", "Claude Code", "subagent RLM", "RLM", "Session Layer", "JSONL", "resume", "scratchpad", "bộ nhớ làm việc", "bench", "benchmark framework", "Loop Engineering", "KISS", "capability gate", "thực thi hai giai đoạn", "ErrorBudget", "error backfill", "triết lý thiết kế", "gyc567", "prime-agent", "pi_agent_rust"]
---

# Phân tích chuyên sâu Aura: Một coding agent Rust tối giản, có thể kiểm thử — Xây dựng Agent bằng một vòng lặp while duy nhất

> Ý tưởng cốt lõi: **"Stop prompting. Design the loop. Get a score."** (Ngừng gửi prompt. Thiết kế vòng lặp. Nhận điểm số). Đây là khẩu hiệu của phương pháp luận Loop Engineering và triết lý phát triển của dự án Aura. Thay vì thủ công gửi prompt cho agent mỗi lần, Aura **thiết kế trước cấu trúc vòng lặp**, để agent tự chạy, báo cáo và sửa lỗi theo nhịp cố định — với cổng kiểm duyệt của con người trước khi bất kỳ dòng code nào được hạ cánh. Ở cấp độ sản phẩm, toàn bộ sức mạnh của Aura đến từ một sự thật được kiểm chứng lặp đi lặp lại: **một vòng lặp `while(tool_use)` duy nhất cộng với một bộ công cụ nhỏ gọn và sắc bén chính là nguồn gốc toàn bộ sức mạnh của Claude Code** — độ phức tạp nên sống trong công cụ, không phải trong cấu trúc vòng lặp.

## Một. Tổng quan dự án: Aura là gì

### 1.1 Định vị một câu

Aura là một **coding agent Rust tối giản, có thể kiểm thử (a minimal, testable Rust coding agent)**. Nó nhận một nhiệm vụ ngôn ngữ tự nhiên, sau đó tự động hoàn thành một "vòng lặp mã hóa" đầy đủ trong một workspace được kiểm soát:

```text
Yêu cầu người dùng -> Thu thập ngữ cảnh -> Vòng lặp while(tool_use) -> Xác minh -> Tóm tắt kết quả
```

Quy trình khi tách ra: nhận nhiệm vụ → thu thập ngữ cảnh workspace → chạy vòng lặp `while(tool_use)` (thông qua công cụ sửa đổi file và thực thi xác minh) → xuất bản tóm tắt thay đổi và báo cáo kiểm thử.

### 1.2 Thông tin meta dự án

| Trường | Giá trị |
|------|-----|
| Kho mã | https://github.com/gyc567/aura |
| Stars | 1 |
| Giấy phép | MIT |
| Ngôn ngữ | Rust (edition 2024, MSRV 1.85) |
| Ngày tạo | 2026-08-07 |
| Push gần nhất | 2026-08-10 |
| Trạng thái phát hành | **v0.1.0 đã phát hành** (ma trận build gốc 5 nền tảng + install.sh) |
| Trạng thái hoàn thành | v1 / v1.2 / Phase 6-7 đã hoàn thành |

### 1.3 Sức khỏe hiện tại

- `cargo test`: 345+ kiểm thử, tất cả đều đạt (STATE.md ghi nhận đỉnh 449)
- `cargo clippy --all-targets --all-features -- -D warnings`: 0 cảnh báo
- `cargo fmt --check`: đạt
- `cargo audit`: 0 lỗ hổng (180 phụ thuộc)
- Cổng phủ: `cargo llvm-cov --fail-under-lines 100 --fail-under-functions 100`

### 1.4 Kiến trúc năm lớp

```
┌─────────────────────────────────────────────────────────────┐
│  L1 Lớp trình bày  CLI (aura)                                │
│         --workspace --max-turns --policy --resume --json   │
├─────────────────────────────────────────────────────────────┤
│  L2 Lớp phiên  Session (v1.1) — JSONL transcript + artifacts│
│                    + artifacts (scratchpad, children)       │
├─────────────────────────────────────────────────────────────┤
│  L3 Lớp thực thi  Agent (while loop driver)                  │
│    while !interrupted && turns < budget && tool_errors < 3 │
│      → model.complete()                                     │
│      → if Decision::Call → registry.execute() → backfill   │
│      → else break (Done/Ask/Fail/Absent)                   │
├─────────────────────────────────────────────────────────────┤
│  L4 Lớp năng lực  Tool Registry + Policy + Precheck + Reminders │
├─────────────────────────────────────────────────────────────┤
│  L5 Lớp mô hình  ModelGateway (OpenAI-compatible HTTP)       │
└─────────────────────────────────────────────────────────────┘
```

v1 là CLI đơn tiến trình, runtime `tokio` đơn luồng (`#[tokio::main(flavor = "current_thread")]`); v1.1 giới thiệu lớp Session + subagent kiểu RLM, sau đó nâng cấp thành runtime `multi_thread`. Mọi trait đều có giới hạn trên `Send + Sync`, dành chỗ cho mở rộng đa luồng.

### 1.5 Mô-đun cốt lõi

| Mô-đun | Vai trò |
|------|------|
| `domain` | Kiểu cốt lõi: `TaskRequest`, `Decision`, `ToolCall`, `Message` |
| `state` | `AgentState`, `Budget`, `StateMachine`, `StopReason` |
| `model` | trait `ModelGateway` + `ModelRequest` / `ModelResponse` |
| `model_http` | Bộ thích ứng HTTP OpenAI-compatible, bao gồm phân tích SSE |
| `registry` | trait `ToolRegistry` + `InMemoryRegistry` |
| `tool` | trait `Tool` + `ToolSchema`, `ToolInput`, `ToolOutput` |
| `tools/todo_write` | Công cụ chính v1: quản lý TODO có cấu trúc |
| `policy` | Cổng năng lực (`FsRead`, `FsWrite`, `Exec`) |
| `precheck` | Phân tích rủi ro lệnh dựa trên regex |
| `reminders` | Biên nhận kết quả công cụ + sinh nhắc nhở hệ thống |
| `context` | Thu thập file workspace, phát hiện đường dẫn nhạy cảm, cắt ngắn |
| `event` | `AgentEvent` + luồng kiểm toán `EventSink` |
| `agent` | Hàm async `run()` — trình điều khiển vòng lặp while |
| `session` | (v1.1) `Session` + `Transcript` — lịch sử thông điệp, artifact, khả năng phục hồi |
| `children` | (v1.1) Subagent kiểu RLM — `ChildRegistry`, admission handle, `agent_message`, `subagent_result` |
| `tools/scratchpad` | (v1.1) Bộ nhớ làm việc liên tục (`artifacts/scratchpad.json`) |
| `cli` | Phân tích tham số dựa trên clap |
| `output` | Định dạng báo cáo văn bản và JSON |

### 1.6 Dự án tham chiếu và nguyên tắc mượn chọn lọc

Aura không phải phát minh từ số không, nó đứng trên bốn dự án tham chiếu, mỗi dự án đóng góp một thứ khác nhau:

| Dự án tham chiếu | Đóng góp |
|----------|------|
| **Claude Code** | Pattern và cơ chế: vòng lặp đơn + công cụ TODO + biên nhận kết quả công cụ + nhắc nhở hệ thống tĩnh + subagent cùng thực thể |
| **pi_agent_rust** | Mô hình an toàn: cổng năng lực + thực thi hai giai đoạn + tuyên bố dựa trên bằng chứng |
| **pi** (TypeScript) | Ý tưởng phân tách mô-đun |
| **prime-agent** | Mô hình lập trình RLM, triết lý phiên/lưu trữ, harness tự cải thiện (tham chiếu từ lộ trình v0.6) |

**Nguyên tắc mượn chọn lọc**: Claude Code cung cấp **pattern và cơ chế**; pi_agent_rust cung cấp **mô hình an toàn**; prime-agent cung cấp **mô hình lập trình RLM và triết lý phiên/lưu trữ**; mọi năng lực phức tạp nằm ngoài giao của ba nguồn (vòng đời tin cậy, multi-provider, daemon đa tiến trình, TUI, RPC, Critic tự đánh giá, bộ nhớ dài hạn/sơ đồ tri thức) đều **trì hoãn hoặc tách thành đặc tả độc lập**.

### 1.7 Phi mục tiêu (v1 tuyên bố không làm)

| Năng lực | Trì hoãn đến | Lý do |
|------|--------|------|
| TUI hoàn chỉnh / tự động hoàn thành / theme | v2+ | KISS ưu tiên xác minh vòng lặp đóng không tương tác |
| Hệ thống tiện ích mở rộng/plugin | v2 (đặc tả độc lập) | Mở rộng năng lực thông qua biên dịch lại là đủ |
| Định tuyến đa provider | v1 chỉ OpenAI-compatible, v2+ | pi_agent_rust duy trì 7 provider là gánh nặng |
| Lưu trữ phiên | v1.1 (lớp Session) | Xác minh vòng lặp đóng trước |
| Nén/tóm tắt phiên dài tự động | v2 (compaction) | Gắn với lưu trữ |
| Chế độ Critic / self-review | Không làm | Thực chiến Claude Code chứng minh không cần |
| Cơ sở dữ liệu bộ nhớ dài hạn / sơ đồ tri thức | Không làm | Như trên |
| Công cụ termination tường minh | Không làm | Điều kiện kết thúc tự nhiên của vòng lặp là "model không còn sinh ToolCall" |

---

## Hai. Ý tưởng cốt lõi: Tại sao là "một vòng lặp + vài công cụ"

### 2.1 Nguồn gốc sức mạnh

Trong tài liệu thiết kế Aura có một câu xuất hiện lặp đi lặp lại:

> "Vòng lặp đơn + 14 công cụ" là nguồn gốc toàn bộ sức mạnh của Claude Code. Bất kỳ thiết kế nào giới thiệu mô-đun con, trạng thái con, vai trò con cho v1 đều phải tự hỏi trước: "có thể bớt lớp này không".

Sự thấu hiểu này là nền tảng của toàn bộ dự án. Rất nhiều framework agent trên thị trường chất độ phức tạp lên **cấu trúc điều phối** — máy trạng thái, vai trò, pipeline, event bus… trong khi thực tiễn Claude Code chứng minh: **cấu trúc vòng lặp giữ cực kỳ tối giản, độ phức tạp được đặt vào công cụ**. Aura chọn con đường này và đẩy nó đến cực hạn: v1 chỉ có 8 công cụ (gồm `todo_write`), toàn bộ logic thực thi là một vòng lặp `while`.

### 2.2 Ngữ nghĩa Decision: Điều kiện duy nhất để tiếp tục là "gọi công cụ"

Mỗi phản hồi của model được phân tích thành một `Decision`:

```rust
pub enum Decision {
    Call(ToolCall),                       // Biến thể duy nhất tiếp tục vòng lặp
    Ask { question: String },             // Kết thúc vòng lặp, CLI chịu trách nhiệm hiển thị câu hỏi
    Done { summary: String },             // Kết thúc bình thường
    Done,                                 // Model không trả về ToolCall, xử lý như Done
    Fail { reason: String },              // Model chủ động tuyên bố thất bại
}
```

`Decision::Call` là biến thể **duy nhất tiếp tục vòng lặp**. `Ask` / `Done` / `Fail` / "không có ToolCall" (`Absent`) đều tương đương kết thúc vòng lặp. Thiết kế này khiến điều kiện kết thúc trở nên cực kỳ đơn giản và dự đoán được: **vòng lặp tự nhiên dừng khi model không còn sinh lệnh gọi công cụ**, không cần công cụ termination tường minh.

### 2.3 Bất biến vòng lặp cốt lõi (sau sửa đổi v0.6)

- **Điều kiện thoát duy nhất**: SIGINT / budget cạn kiệt / `ErrorBudget` cạn kiệt / model trả về non-`Call`
- **Lỗi công cụ backfill cho model**: thông qua `ErrorBudget` (mặc định 3 lần), để model tự sửa; budget ngăn vòng lặp mất kiểm soát
- `recorder.transition()` thất bại chỉ ghi log (`let _ =`), **không chặn thực thi**

Chú ý một sự đảo ngữ nghĩa quan trọng trong v0.6: phiên bản sớm "lỗi công cụ lập tức kết thúc vòng lặp" (lý do là "tránh ảo giác từ việc nhắc lại sau lỗi"), sau này mượn từ prime-agent và Claude Code chuyển thành **backfill lỗi** — lỗi công cụ không phải điểm cuối của nhiệm vụ, mà là một "phản hồi" cho model, để nó sửa tham số hoặc đổi phương án; `ErrorBudget` là giới hạn trên ngăn vòng lặp vô hạn. Đây là sự chuyển đổi triết học từ "một lần thất bại là bỏ cuộc" sang "để model tự phục hồi".

---

## Ba. Hướng dẫn chi tiết: Chạy Aura từ số không

### 3.1 Khởi động nhanh

```bash
# Xây dựng
cargo build --release

# Chạy với fake model (không cần API key, chỉ để kiểm thử)
cargo run --release -- \
  --workspace /tmp/my-project \
  --fake-model \
  "Add a README"

# Sử dụng OpenAI-compatible API thật
cargo run --release -- \
  --workspace /tmp/my-project \
  --endpoint https://api.openai.com/v1 \
  --model gpt-4o \
  --api-key $OPENAI_API_KEY \
  "Add a README"

# Output JSON
cargo run --release -- --workspace /tmp/my-project --fake-model --json "Add a README"
```

`--fake-model` là biểu hiện trực tiếp của triết lý khả kiểm thử của Aura: **gọi model mặc định sử dụng fake mang tính quyết định**, kiểm thử vòng lặp while cốt lõi không phụ thuộc mạng. Điều này có nghĩa bạn có thể chạy đầy đủ vòng lặp agent ở local mà không tốn một xu, không cần cấu hình bất kỳ key nào.

### 3.2 Thứ tự ưu tiên cấu hình và file cấu hình

```toml
# aura.toml (ví dụ)
model = "openai-compatible"
max_turns = 12
max_context_bytes = 100000
command_timeout_seconds = 120
require_write_confirmation = false
allowed_commands = ["cargo test", "cargo fmt --check", "cargo clippy"]
policy = "balanced"
precheck = "regex"
```

Thứ tự ưu tiên nguồn cấu hình: **tham số CLI > cấu hình dự án (`aura.toml`) > biến môi trường > giá trị mặc định**. Ngoài ra v1.2 hỗ trợ `~/.config/aura/config.toml` (có thể ghi đè bằng `AURA_CONFIG` / `XDG_CONFIG_HOME`): endpoint/model/api_key, thứ tự ưu tiên CLI > file cấu hình > biến môi trường `AURA_API_KEY`; cấu hình hỏng fail fast, thiếu cấu hình không có tác dụng phụ. TOML sai định dạng trả về `AgentError::Config`, CLI chuyển thành mã thoát 2.

### 3.3 Vòng lặp while cốt lõi (mã giả có thể biên dịch)

```rust
loop {
    if interrupted.load(Ordering::Relaxed) {
        return Ok(RunReport::aborted(used_turns, StopReason::UserAborted));
    }
    budget.check_turns(used_turns)?;

    let req = ModelRequest::new(system_prompt(&task), messages.clone());
    let resp: ModelResponse = model.complete(req).await?;

    // Điều kiện kết thúc (non-Call là kết thúc)
    let call = match resp.decision.into_tool_call() {
        Some(c) => c,
        None => {
            // Ask / Done / Fail / Absent → kết thúc vòng lặp
            let reason = match resp.decision {
                Decision::Ask { question } => StopReason::ModelAsked { question },
                Decision::Done { summary } => StopReason::Completed { summary },
                Decision::Fail { reason } => StopReason::ModelFailed { reason },
                Decision::Absent => StopReason::Completed { summary: resp.raw },
            };
            let _ = recorder.transition(AgentState::Completed);
            sink.emit(AgentEvent::Stopped { reason: reason.clone() });
            return Ok(RunReport::completed(used_turns, reason));
        }
    };

    // record-only transition (lỗi bị loại bỏ)
    let _ = recorder.transition(AgentState::ExecutingTool);
    sink.emit(AgentEvent::ToolStarted { name: call.name.clone() });

    let ctx = ToolContext::new(task.workspace.clone(), call.id.clone());
    // Lỗi công cụ backfill thay vì kết thúc; chỉ ErrorBudget cạn kiệt mới kết thúc
    let output = registry.execute(&call, &ctx).unwrap_or_else(|e| {
        error_count += 1;
        ToolOutput::err(format!("tool execution failed: {e}"))
    });
    let reminded = RemindedOutput::wrap(&call, output.clone());
    sink.emit(AgentEvent::ToolFinished { name: call.name.clone(), success: output.success });

    messages.push(Message::Tool {
        call_id: call.id.clone(),
        output: reminded.to_text(),
        success: output.success,
    });
    used_turns += 1;

    // ErrorBudget cạn kiệt → kết thúc
    if error_count >= budget.max_tool_errors {
        // ... viết StopReason::ToolFailed và trả về
    }
}
```

Mỗi chi tiết của vòng lặp này đều có lý do:

- **`interrupted` là `Arc<AtomicBool>`** (`Ordering::Relaxed`), chia sẻ qua `Clone` cho handler SIGINT — an toàn trong ngữ cảnh async, không cần anti-pattern `block_on`
- **`recorder.transition()` dùng `let _ =` để loại bỏ lỗi** — máy trạng thái chỉ đóng vai trò kiểm toán record-only, không phải driver, tuyệt đối không chặn thực thi
- **Lỗi công cụ đi qua `unwrap_or_else` backfill** — trở thành `Message::Tool { success: false }` đưa ngược lại cho model, kèm nhắc nhở cấp hệ thống "công cụ trước thất bại, hãy sửa hoặc đổi phương án, đừng lặp lại cùng một lệnh gọi"

### 3.4 Hệ thống công cụ: 8 công cụ của v1

| Công cụ | Năng lực | Ghi chú |
|------|------|------|
| `todo_write` | (không có) | Công cụ hàng đầu; lập kế hoạch tường minh tốt hơn ngầm định |
| `read_file` | `FsRead` | Whitelist đường dẫn, giới hạn byte, từ chối file nhạy cảm |
| `write_file` | `FsWrite` | Bắt buộc qua confirmation; in unified diff ra stderr trước khi ghi |
| `run_command` | `Exec` | Bốn bước (precheck → capability gate → confirmation → spawn); chế độ argv; timeout; cắt ngắn output |
| `list_dir` / `grep_files` / `find_files` | `FsRead` | Chỉ đọc; grep giới hạn số dòng output |

**Tuyên bố không làm**: `edit`/`hashline_edit` (dùng `write_file` ghi đè toàn file + xác minh diff), `web_fetch`/`web_search` (v2+), `notebook_*` (v3+).

### 3.5 Thực thi hai giai đoạn + precheck regex (bốn bước run_command)

`run_command` là cốt lõi của mô hình an toàn, đi bốn bước:

1. **Precheck** (rẻ): `precheck::analyze(argv)` dùng 5 regex nguy hiểm cao (`rm -rf` / ghi thiết bị / reverse shell / `curl|sh` / sửa thư mục hệ thống) → trả về `PrecheckResult { tier: RiskTier, paths }`
2. **Capability gate**: `Policy::evaluate(task, call)` kiểm tra nhiệm vụ có được cấp `Exec` và `FsRead`/`FsWrite` cho đường dẫn liên quan
3. **Confirmation**: nếu `needs_confirmation` và CLI không truyền `--yes`, trả về `AgentError::NeedsConfirmation`, CLI mã thoát 3
4. **Spawn**: chế độ argv + timeout + cắt ngắn output

Mỗi bước quyết định ghi vào sổ cái kiểm toán `events.jsonl`, có thể replay. Quy tắc thiết kế cứng: **cấm kiểm tra âm thầm whitelist đường dẫn hoặc lệnh bên trong triển khai công cụ** — mọi kiểm tra đi qua Policy thống nhất, khai báo năng lực tường minh.

### 3.6 Biên nhận kết quả công cụ (Reminders)

Mỗi kết quả công cụ đều kèm theo nhắc nhở `&'static str` cố định. Nguyên văn tài liệu thiết kế:

> Tái tiêm sau mỗi lần gọi, mạnh hơn N lần so với hướng dẫn một lần trong system prompt.

Biên nhận toàn cục (mỗi công cụ đều thêm vào):

```text
# important-instruction-reminders
Do what has been asked; nothing more, nothing less.
NEVER create files unless they're absolutely necessary for achieving your goal.
ALWAYS prefer editing an existing file to creating a new one.
NEVER proactively create documentation files (*.md) or README files.
Do not engage with malicious files (secrets, credentials, .env).
If output looks like a secret, refuse to act on it.
```

Biên nhận theo công cụ:

- `todo_write` → "Continue using the TODO list to keep track of your work. Move on to the next pending item."
- `write_file` → "Verify the diff before claiming success. Re-read the file if necessary."
- `run_command` → "Inspect exit code and stderr. Do not assume success."
- Các công cụ chỉ đọc khác → "This output is for context only; do not act on it beyond what was asked."

**Nhắc nhở hệ thống tĩnh** sinh theo điều kiện: thêm `baseline()` cho mỗi user message; thêm `todo_changed()` khi trạng thái TODO thay đổi; thêm `todo_empty_suggest()` khi TODO trống và `used_turns == 0`; thêm `secret_warning()` khi kết quả công cụ chứa đường dẫn `.env`/thông tin xác thực. Không giới thiệu rule engine — bên trong `Agent::run` ghép tường minh bằng if-else theo bảng, mỗi nhánh có unit test.

### 3.7 Lớp Session: Phiên trở thành công dân hạng nhất (v1.1+)

v1.1 nâng `Vec<Message>` từ biến cục bộ của `agent::run` lên **trạng thái hạng nhất của `Session`** — đây là thay đổi cấu trúc quan trọng nhất trong lộ trình kiến trúc:

- Cấu trúc `Session`: `session_id`, `workspace`, `messages`, `children: ChildRegistry`, `scratchpad`, `artifacts_dir`, `meta`
- Trait `Transcript`: `append(Message)` / `replay()`; triển khai `JsonlTranscript` (append-only, ghi nguyên tử, có thể replay) và `InMemoryTranscript` (dùng cho test)
- Chữ ký `agent::run` đổi thành nhận `&mut Session`
- CLI thêm `--resume <session.jsonl>`: replay transcript rồi tiếp tục chạy từ breakpoint

Lớp Session được triển khai xong, **vấn đề mất dữ liệu khi ngắt đã được giải quyết**: `--resume` có thể tiếp tục chạy bất kỳ nhiệm vụ nào bị ngắt. Đây là phiên bản Rust đơn tiến trình của triết lý "worker sở hữu session" của prime-agent.

### 3.8 Subagent kiểu RLM (v1.1)

Mượn ngữ nghĩa `rlm()` của prime-agent, subagent của Aura là **bất đồng bộ, có thể giao tiếp, có thể giữ lại**:

```text
Công cụ subagent: input { task, name?, model? } → trả ngay admission handle
                 { child_id, name, session_dir, status: "running" }
Background:        tokio::spawn tác vụ agent con (lịch sử thông điệp độc lập, transcript độc lập)
ChildRegistry:     sổ đăng ký phạm vi cha (Arc<Mutex<HashMap<ChildId, ChildHandle>>>)
                   · list / status / fetch_result / delete
agent_message:     công cụ: parent → child gửi thông điệp định hướng (hàng đợi mailbox); child trả lời parent qua cùng công cụ
Đệ quy:           TaskRequest thêm max_depth (kế thừa, mặc định 2); ở độ sâu 0 công cụ subagent không khả dụng
```

Thiết kế cốt lõi: subagent là **kiểu gọi hàm (kiểu RLM)** thay vì "spawn/await đồng bộ giữ chỗ" — agent cha nhận admission handle là tiếp tục công việc của mình, kết quả được thu thập tường minh qua `subagent_result(child_id)`, hoặc giao tiếp định hướng qua `agent_message`, **không chờ đồng bộ như giá trị trả về của `subagent`**. Mỗi phiên con ghi transcript độc lập vào `artifacts/children/<child_id>.jsonl`. Runtime tương ứng nâng cấp thành multi-thread. Công cụ subagent ở độ sâu 0 / chưa opt-in được **gỡ bỏ tĩnh tại thời điểm khởi tạo**, đảm bảo cấp độ biên dịch rằng không thể đệ quy vô hạn.

### 3.9 scratchpad: Bộ nhớ làm việc liên tục (v1.1)

Không giới thiệu IPython, cung cấp cho model một **ghi chú nhớ xuyên suốt các vòng, có thể đặt tên, ghi xuống đĩa** (phiên bản Rust hóa của "ngữ cảnh là biến"):

- Công cụ `scratchpad`: `set(name, value)` / `get(name)` / `append(name, value)` / `list()` / `clear()`, dữ liệu lưu `artifacts/scratchpad.json`
- Mỗi vòng tiêm vào không phải toàn bộ nội dung, mà là **chỉ mục tóm tắt** (tên + số byte + thời gian cập nhật), model gọi `get` theo nhu cầu
- Công dụng điển hình: danh sách file, kết quả phân tích, trạng thái việc cần làm, đoạn output lệnh — tránh model lặp lại `find_files`/đọc lại file, nén đường cong tăng trưởng ngữ cảnh
- Phân công với `todo_write`: `todo_write` quản lý kế hoạch, `scratchpad` quản lý dữ liệu

### 3.10 compaction: Ngữ cảnh phân lớp (v2)

Thông điệp cũ không bị loại bỏ đơn giản nữa, mà được tiêm theo lớp:

```text
Mỗi vòng tiêm vào = tóm tắt bộ nhớ làm việc (scratchpad tên mục + kích thước)
                    + cửa sổ cốt lõi (N thông điệp gần nhất, toàn bộ)
                    + tóm tắt lịch sử (thông điệp cũ, sinh bởi fast model hoặc quy tắc, chỉ một lần)
```

Ngưỡng kích hoạt theo `Budget.max_context_bytes` (kích hoạt ở 80%, không phải đầy); sinh tóm tắt có thể dùng **fast model** cấu hình được, khi không có fast model thì thoái lui thành cắt ngắn hiện tại; tóm tắt ghi ngược lại lớp lưu trữ Session, hỗ trợ sự kiện kiểm toán `ContextCompacted { from_bytes, to_bytes, summary }`. compaction không phải tín hiệu hoàn thành, không kết thúc goals, subagent hoặc các vòng tiếp theo.

### 3.11 Framework đánh giá: aura bench (v1.2)

Aura dùng **chỉ số định lượng** để trả lời "thay đổi lần này làm agent tốt lên hay xấu đi":

```bash
aura bench run                    # Chạy tất cả nhiệm vụ
aura bench run --tasks 'tasks/easy-*'   # Chạy tập con
aura bench run --agent 'claude-code'    # Đánh giá agent ngoài (không chỉ Aura)
aura bench report results/latest  # Sinh báo cáo
aura bench init <name>            # Tạo giàn giáo nhiệm vụ
```

- Định nghĩa nhiệm vụ là YAML (`bench/tasks/*.yaml`): `setup` (clone/write/mkdir/copy) + `instruction` + `verify` (command/file_exists/git_diff/cargo_test/cargo_fmt)
- Mỗi nhiệm vụ chạy trong workspace tạm độc lập, kết quả ghi vào `bench/results/<timestamp>/`, gồm pass/fail, thời gian, turns, tỷ lệ đạt nhóm theo category/difficulty
- 8 seed task phủ easy/medium các độ khó (hello-world, add-tests-to-lib, fix-compile-error, format-code, readme-from-spec, write-grep-tool, refactor-duplication, implement-scratchpad-tests)
- Đánh giá **trải nghiệm người dùng cuối**: gọi qua tiến trình `cargo run --bin aura -- --json`, nhất quán với phiên bản phát hành
- Bổ sung cho kim tự tháp kiểm thử hiện có: unit test (tính đúng đắn mô-đun) → integration test (logic vòng lặp FakeModel) → **bench (hiệu năng end-to-end thật)**; bench bổ sung không thay thế

Quyết định thiết kế cốt lõi: workspace cô lập Phase B1 dùng cấp tiến trình + xác minh đường dẫn (workspace phải nằm dưới `/tmp/aura-bench/`), Phase B2 thêm tùy chọn Docker; định nghĩa nhiệm vụ dùng YAML + serde phân tích (thân thiện với người); file kết quả do harness ghi, không qua tay agent, chống agent tự đánh giá gian lận.

### 3.12 Hệ thống plugin v2 (Phase 7)

v2 giới thiệu **plugin dạng thư mục** + tích hợp **MCP server**, tái sử dụng cổng năng lực và trung gian lệnh của v1 làm nền tảng an toàn:

- Cấu trúc thư mục plugin: `plugin.json` (khớp schema v1.0.0 của agent-plugins.org) + `skills/*/SKILL.md`
- Quét `skills/*/SKILL.md` trong thư mục plugin, phân tích frontmatter rồi đăng ký vào `ToolRegistry`, danh sách công cụ của model mở rộng động
- Hỗ trợ ba MCP transport: `stdio` (cwd giới hạn trong thư mục plugin), `streamable-http`, `sse`
- Vòng đời: `aura plugin install/list/enable/disable/uninstall/update`
- An toàn: cấm lộ biến môi trường `PLUGIN_ROOT`/`PLUGIN_DATA`; `${SECRET}` được runtime tiêm vào, manifest không lưu khóa rõ

### 3.13 Loop Engineering: Phương pháp luận phát triển của chính Aura

Bản thân dự án Aura dùng Loop Engineering (cobusgreyling/loop-engineering) để phát triển:

```bash
# Kiểm tra trạng thái sức khỏe Loop (bao gồm audit + sync)
npx @cobusgreyling/loop doctor .

# Chạy thủ công một lần Triage (phiên bản Claude Code)
/loop 1d Run $loop-triage. Read STATE.md. Merge findings into High Priority and Watch List. Update Last run. Do not edit code.
```

| File | Công dụng |
|------|------|
| `LOOP.md` | Cấu hình vòng lặp — chế độ, nhịp, cổng người-máy |
| `STATE.md` | Trạng thái hiện tại — High Priority / Watch / Noise |
| `loop-budget.md` | Ngân sách Token và kill switch (ngưỡng 95% chuyển sang chỉ báo cáo) |
| `loop-run-log.md` | Nhật ký chạy mỗi vòng |
| `loop-constraints.md` | Ràng buộc an toàn — đường dẫn cấm sửa (.env, auth/, secrets/) và thao tác cấm |

Lộ trình tiến hóa: **L1 chế độ báo cáo** (triage + cập nhật STATE.md, cấm tự động sửa) → **L2 sửa hỗ trợ** (Score ≥ 50, minimal-fix + loop-verifier, thực thi sau khi nhân viên duyệt) → **L3 không người giám sát** (Score ≥ 80, sửa tự động + merge tự động, circuit breaker chống vòng lặp vô hạn). Aura lâu dài ở L1 và dần bật L2 — `STATE.md` ghi nhận quy trình cổng nhân công đầy đủ: thông báo trước khi push, không merge main nếu chưa phê duyệt, mỗi vấn đề thử tối đa 3 lần.

---

## Bốn. Triết lý thiết kế: 15 nguyên tắc và mượn chọn lọc

### 4.1 Mười lăm nguyên tắc thiết kế lớn

1. **Ưu tiên đơn giản (KISS)**: ưu tiên thư viện chuẩn và ít phụ thuộc ổn định; một mô-đun chỉ giải quyết một vấn đề; không dành chỗ trừu tượng cho nhu cầu tương lai. "Vòng lặp đơn + 14 công cụ là nguồn gốc toàn bộ sức mạnh của Claude Code, mọi thiết kế đều hỏi 'có thể bớt lớp này không'".
2. **High cohesion, low coupling**: đối tượng miền giữ dữ liệu thuần và quy tắc; IO bên ngoài tiêm qua giao diện hẹp; vòng lặp cốt lõi không phụ thuộc triển khai LLM, terminal hoặc hệ thống file cụ thể.
3. **Ranh giới năng lực tường minh**: mỗi công cụ khai báo tường minh năng lực cần thiết, do `Policy` thống nhất đánh giá. **Cấm kiểm tra âm thầm whitelist đường dẫn hoặc lệnh bên trong triển khai công cụ.**
4. **Bảo vệ thực thi hai giai đoạn**: công cụ thực thi trước capability gate, sau đó trung gian lệnh chặn theo phân loại chế độ nguy hiểm.
5. **Biên nhận kết quả công cụ**: mỗi kết quả công cụ đều kèm theo nhắc nhở cố định, **tái tiêm sau mỗi lần gọi, mạnh hơn N lần so với system prompt một lần**.
6. **Nhắc nhở hệ thống tĩnh**: theo loại công cụ + trạng thái TODO sinh tĩnh nhắc nhở hệ thống gắn vào thông điệp người dùng.
7. **Ưu tiên khả kiểm thử**: hành vi mới phải có unit test; bộ thích ứng giao thức và thao tác file thật dùng integration test; gọi model mặc định dùng fake mang tính quyết định; cổng phủ 100% (lines/functions/regions).
8. **Tương thích tăng dần**: trước hết nhận diện giao diện và kiểm thử dự án hiện có, sau đó tiếp cận bằng mô-đun mới thêm, không sửa code không liên quan, không xóa hoặc viết lại kiểm thử và chú thích hiện có.
9. **Có thể phục hồi**: mỗi bước thực thi đều sinh sự kiện; thất bại có thể dừng và giữ hiện trường; không tự động rollback nguy hiểm.
10. **Tuyên bố dựa trên bằng chứng**: bất kỳ tuyên bố bên ngoài nào về hiệu năng, an toàn hoặc tương thích phải trỏ được đến evidence artifact trong kho mã.
11. **Tách SDK công khai với triển khai**: v1 đã phân chia `sdk` (lớp ổn định) và `impl` (nội bộ có thể điều chỉnh).
12. **Ngắt Graceful**: vòng lặp phải dừng优雅 khi nhận SIGINT, giữ trạng thái kiểm toán, không sinh tiến trình zombie hoặc mất log.
13. **Xác thực tham số trước**: trước khi thực thi công cụ phải xác thực schema tham số, xác thực thất bại trả về lỗi có cấu trúc thay vì panic.
14. **Ưu tiên streaming**: `ModelGateway::stream` là triển khai bắt buộc v1, phân tích SSE hoàn thành ở Phase 3.
15. **Chiến lược cắt ngắn rõ ràng**: khi vượt giới hạn ngữ cảnh thì cắt ngắn theo thứ tự ưu tiên, bản thân việc cắt ngắn được ghi vào log kiểm toán.

### 4.2 Nguyên tắc mượn chọn lọc (quan trọng nhất)

> Claude Code cung cấp **pattern và cơ chế**; pi_agent_rust cung cấp **mô hình an toàn**; prime-agent cung cấp **mô hình lập trình RLM và triết lý phiên/lưu trữ**; mọi năng lực phức tạp ngoài giao của ba nguồn đều trì hoãn hoặc tách thành đặc tả độc lập.

Thái độ của Aura đối với dự án tham chiếu không phải "sao chép toàn bộ", mà là **mượn phân lớp + tuyên bố không làm rõ ràng**:

- Mượn từ Claude Code: vòng lặp while đơn, công cụ hàng đầu `todo_write`, biên nhận kết quả công cụ, nhắc nhở hệ thống tĩnh, subagent cùng thực thể
- Mượn từ pi_agent_rust: cổng năng lực, thực thi hai giai đoạn, dựa trên bằng chứng, `#![forbid(unsafe_code)]`
- Mượn từ prime-agent (từ v0.6): backfill lỗi + ErrorBudget, lưu trữ Session + resume, subagent kiểu RLM, scratchpad, compaction phân lớp
- **Tuyên bố không giới thiệu**: daemon/supervisor đa tiến trình, phụ thuộc IPython/Python, bus thông điệp toàn cục giữa agent, vòng đời tin cậy, Critic tự đánh giá, bộ nhớ dài hạn/sơ đồ tri thức, định tuyến đa provider

### 4.3 Ràng buộc cứng về mặt kỹ thuật

- `#![forbid(unsafe_code)]` + `#![warn(missing_docs)]`
- **Không giữ tương thích ngược**: cái lỗi thời xóa thẳng, không thêm lớp tương thích
- Tuyên bố không giới thiệu `async-trait` / `anyhow` / `tracing` / `jemalloc` / `quickjs` (giữ mặt phụ thuộc tối thiểu)
- Danh sách phụ thuộc: `thiserror` / `serde` / `serde_json` / `serde_yaml` / `toml` / `regex` / `reqwest` / `clap` / `tokio` / `tempfile` / `ratatui` / `crossterm` / `keyring`
- Quy tắc an toàn: mọi đường dẫn sau khi chuẩn hóa phải vẫn nằm trong workspace; mặc định từ chối xóa, đổi tên, yêu cầu mạng và shell tùy ý; lệnh dùng argv (không thực thi chuỗi chưa phân tích); mặc định không commit git; cô lập mạnh ra OS/container bên ngoài

---

## Năm. Tổng hợp các quan điểm

### Quan điểm 1: Vòng lặp là tất cả của Agent, công cụ là linh hồn của vòng lặp

Sai lầm lớn nhất của các framework Agent trên thị trường là chất độ phức tạp lên cấu trúc điều phối. Aura dùng "vòng lặp while đơn + 8 công cụ" chứng minh: **cấu trúc vòng lặp nên mỏng đến mức không thể mỏng hơn, mọi trí tuệ sống trong công cụ**. Công cụ có thể kiểm thử, có thể thay thế, có thể kiểm toán; vòng lặp thì không. Nhận thức này trực tiếp quyết định hình thái kiến trúc của Aura.

### Quan điểm 2: Tính quyết định là tiền đề của khả kiểm thử, khả kiểm thử là tiền đề của độ tin cậy

345+ test của Aura, cổng phủ 100%, `--fake-model` kiểm thử mang tính quyết định, integration test FakeModel, tất cả phục vụ cùng một mục tiêu: **để vòng lặp cốt lõi không phụ thuộc mạng, không phụ thuộc LLM thật, có thể được xác minh đầy đủ**. Đặt LLM không xác định ra ngoài ranh giới kiểm thử, phần xác định mới dám lên cổng phủ 100%.

### Quan điểm 3: Từ "một lần thất bại là bỏ cuộc" đến "để model tự phục hồi" — backfill lỗi là bước ngoặt kỹ thuật Agent

Trước v0.6 "lỗi công cụ lập tức kết thúc vòng lặp", lý do là tránh ảo giác; sau v0.6 chuyển thành **backfill lỗi + ErrorBudget (mặc định 3 lần)**. Sự chuyển đổi này sâu sắc: nó thừa nhận "lỗi công cụ (biên dịch thất bại, file không tồn tại, lệnh timeout) chiếm đa số trong nhiệm vụ thật", và "một lần thất bại là bỏ cuộc" đồng nghĩa với bỏ cuộc nhiệm vụ thật. **Năng lực tự phục hồi có giá của nó, ErrorBudget là nhãn giá của nó** — vừa để model sửa, vừa đảm bảo giới hạn trên.

### Quan điểm 4: KISS không phải viết ít code, mà là dám nói "không làm"

Danh sách "phi mục tiêu" và danh sách "không làm" của Aura dài ngang nhau: không làm TUI, không multi-provider, không Critic, không bộ nhớ dài hạn, không RPC, không daemon, không IPython, không vòng đời tin cậy. **Mỗi câu "không làm" đều là quyết định kiến trúc được cân nhắc kỹ**, ngăn v1 giới thiệu mô-đun con, trạng thái con, vai trò con. Điều này phù hợp nguyên tắc kỹ thuật của dự án: "không giữ tương thích ngược, cái lỗi thời xóa thẳng".

### Quan điểm 5: Lớp Session là công dân hạng nhất, là nền móng chung của nhiệm vụ dài

`Vec<Message` từ biến cục bộ nâng lên trạng thái hạng nhất của `Session`, là bước nhảy kiến trúc quan trọng nhất của Aura. Subagent, compaction, `--resume`, lưu trữ plugin đều phụ thuộc nó. **Thứ tự phụ thuộc: Session là nền móng chung, dù khởi công từ v1.1, cũng phải triển khai tập con quản lý thông điệp của Session trước, rồi mới chồng các phần còn lại**.

### Quan điểm 6: Hệ thống đánh giá là tiền đề cải tiến dựa trên bằng chứng

`aura bench` trả lời ba câu hỏi: thay đổi lần này làm agent tốt lên hay xấu đi (so sánh baseline)? công cụ/chiến lược/model mới có cải thiện tỷ lệ thành công không (chỉ số định lượng)? loại nhiệm vụ nào là điểm yếu (chẩn đoán hạt mịn)? **Không có hệ thống đánh giá, "dựa trên bằng chứng" chỉ là khẩu hiệu rỗng**. Đây chính là lý do v1.2 xếp framework bench vào ưu tiên.

### Quan điểm 7: Mô hình an toàn nên tường minh, phân lớp, có thể kiểm toán

Thực thi hai giai đoạn (capability gate + trung gian lệnh), precheck 5 regex nguy hiểm cao, chuẩn hóa đường dẫn, chế độ argv, sổ cái kiểm toán `events.jsonl` — an toàn của Aura không phải một công tắc, mà là một chuỗi **điểm kiểm tra có thể được kiểm toán và chặn ở bất kỳ lớp nào**. Quy tắc thiết kế cứng "cấm kiểm tra âm thầm bên trong triển khai công cụ" đảm bảo logic an toàn không rải rác khắp nơi.

### Quan điểm 8: Tự phát triển chính mình — Loop Engineering là siêu phương pháp luận kỹ thuật AI

Aura dùng Loop Engineering để phát triển Aura: triage hàng ngày cập nhật STATE.md, ngưỡng ngân sách Token 95%, kill switch, tiến hóa L1→L2→L3, cổng nhân công. **Khi bạn đang xây dựng AI agent, dùng vòng lặp do AI điều khiển để quản lý quá trình xây dựng của chính bạn** — điều này hình thành một kỷ luật kỹ thuật tự tham chiếu, và xác minh chủ trương "thiết kế vòng lặp thay vì thiết kế prompt".

### Quan điểm 9: Chi tiết phát hành và chất lượng quyết định độ đáng tin

Chuỗi phát hành v0.1.0 cho thấy độ đáng tin kỹ thuật được xây dựng thế nào: ma trận build gốc 5 nền tảng (linux x64/arm64, macos x64/arm64, windows x64), install.sh có xác minh SHA256 và dấu phân cách `--` chống tiêm, draft release人工 gate, model thật (MiniMax M2.5) chạy end-to-end và sửa 4 bug thật (B1 chỉ thị chưa gửi / B2 schema công cụ thiếu / B3 assistant tool_calls bị mất / B4 chuẩn hóa đường dẫn báo sai), bẫy MSRV bị bắt (ratatui 0.30 cần rustc 1.88 > MSRV 1.85 khiến CI 5 nền tảng đều treo, hạ cấp 0.29 sửa). **Những chi tiết này chính là bằng chứng "tối giản" không đồng nghĩa với "đồ chơi"**.

---

## Sáu. Kết luận: Aura dạy chúng ta điều gì

Aura là một dự án nhỏ chỉ có 1 star, nhưng nó cô đọng gần như tất cả trực giác đúng đắn của coding agent AI năm 2026:

1. **Độ phức tạp đặt vào công cụ, không vào vòng lặp** — vòng lặp là bộ xương ổn định, công cụ là cơ quan có thể thay thế;
2. **Ưu tiên tính quyết định** — dùng fake model và cổng phủ 100% đóng đinh logic cốt lõi, cô lập tính không xác định ở ranh giới model;
3. **Backfill lỗi để model tự phục hồi** — ErrorBudget là ranh giới chính xác giữa tự phục hồi và mất kiểm soát;
4. **Phiên là công dân hạng nhất** — JSONL transcript + `--resume`, ngắt không còn là điểm cuối;
5. **Tiến hóa dựa trên đánh giá** — framework bench cho phép mỗi thay đổi được xác minh định lượng;
6. **Nói không rõ ràng** — mỗi câu "không làm" đều chịu trách nhiệm cho chất lượng của "làm";
7. **Tự phát triển chính mình** — Loop Engineering biến cổng nhân công thành kỷ luật chứ không phải tùy chọn.

> Trích dẫn cách diễn đạt kết luận từ tài liệu thiết kế Aura: **"Vòng lặp đơn + 14 công cụ là nguồn gốc toàn bộ sức mạnh của Claude Code."** Aura chứng minh con đường này cũng thành công trong Rust — và có thể làm nhỏ hơn, dễ kiểm thử hơn, có kỷ luật hơn.

Nếu bạn muốn tự tay làm, con đường nhanh nhất là: `cargo build --release`, rồi `cargo run --release -- --workspace /tmp/my-project --fake-model "Add a README"`, trong vòng mười phút bạn sẽ thấy một vòng lặp agent hoàn chỉnh chạy ở local — không tốn một xu, không cần bất kỳ API key nào.