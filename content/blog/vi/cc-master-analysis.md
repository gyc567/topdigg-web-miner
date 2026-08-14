---
slug: cc-master-analysis
title: "cc-master Phân tích chuyên sâu: biến bất kỳ phiên coding agent nào thành trưởng dự án dài hạn (Tổng quan dự án + Hướng dẫn khởi động nhanh + Kiến trúc hệ thống + Triết lý thiết kế)"
description: "Lấy nemori-ai/cc-master (dự án nguồn mở, TypeScript, giấy phép PolyForm Noncommercial 1.0.0) làm nền tảng, phân tích toàn diện 'biến phiên coding agent thành trưởng dự án dài hạn (a project lead for long-running work)'. Ý tưởng cốt lõi: cc-master biến bất kỳ phiên coding agent được hỗ trợ nào trong số Claude Code, Codex, Cursor, kimi-code thành 'trưởng dự án' — bạn mang đến ý tưởng, thực hiện số ít những quyết định thực sự cần đến bạn; nó phụ trách phân rã mục tiêu lớn, điều phối song song các nhiệm vụ con độc lập, theo dõi tiến độ và hạn ngạch, đồng thời xác minh kết quả đối chiếu với mục tiêu tường minh. Board (bảng kế hoạch) sống sót qua các lần đặt lại ngữ cảnh và bàn giao phiên, công việc không phụ thuộc vào trí nhớ của một cuộc hội thoại. Cài đặt: lệnh curl một dòng cài engine ccm + plugin; plugin tạo bộ điều hợp native cho từng harness (lệnh slash Claude Code /cc-master:as-master-orchestrator, Codex $cc-master-as-master-orchestrator, Cursor /as-master-orchestrator, kimi-code cc-master:as-master-orchestrator). Kiến trúc hệ thống: mô hình sản phẩm ba lớp (lớp bộ điều hợp plugin per-harness → CLI ccm + engine @ccm/engine → web-viewer ccm chỉ đọc); mô hình dữ liệu JSON Board v2 (thiết kế eo hẹp); 8 Skill phân tán (master-orchestrator-guide / authoring-workflows / using-ccm / slicing-goals-into-dags / dev-as-ml-loop / engineering-with-craft / pacing-and-estimation / distilling-lessons-into-assets); phân bổ mô hình thống nhất O/T1/T2/T3; 7 loại Hooks dormant-until-armed; trạng thái hạn ngạch + dự đoán bàn giao Monte Carlo; phái cử worker xuyên harness và Agent Registry. Triết lý thiết kế: 'nhạc trưởng không bao giờ tự chơi nhạc cụ' (người điều phối không tự làm công việc đơn vị), tái phân bổ sự chú ý (tái phân bổ sự chú ý vào nơi thực sự đáng để dành thời gian), sáu mục tiêu hiến chương, ship-anywhere (hooks chỉ dùng bash + node/JS), nguyên tắc eo hẹp (chỉ một số ít trường board cố định được hooks phụ thuộc), tách rời hai đường phiên bản (plugin vX.Y.Z và ccm ccm-vX.Y.Z phát hành độc lập). Ranh giới rõ ràng: đây không phải 'ước một điều là AI lo hết' — những quyết định chỉ bạn mới có thể đưa ra như gu thẩm mỹ, thiết kế, định hướng vẫn thuộc về bạn; sửa một hai dòng mà mười phút xong cũng không đáng để mời 'trưởng dự án'."
date: "2026-08-11"
author: "TopDigg"
tags: ["cc-master", "Claude Code", "Codex", "Cursor", "kimi-code", "Agent Orchestration", "AI Agent", "Long-horizon", "Task DAG", "Monte Carlo", "Project Lead", "DevTools", "Agent Plugin"]
categories: ["Deep Dive"]
keywords: ["cc-master", "Claude Code", "Codex", "Cursor", "kimi-code", "Điều phối tác tử", "Orchestration", "Nhiệm vụ dài hạn", "Long-running", "Board", "DAG", "O/T1/T2/T3", "Phân bổ mô hình", "Triết lý thiết kế", "nemori-ai", "Hạn ngạch", "Monte Carlo", "Worker", "Agent Registry"]
---

# cc-master Phân tích chuyên sâu: biến bất kỳ phiên coding agent nào thành trưởng dự án dài hạn

> Ý tưởng cốt lõi: **cc-master biến bất kỳ phiên coding agent được hỗ trợ nào trong số Claude Code, Codex, Cursor, kimi-code thành một "trưởng dự án dài hạn" (a project lead for long-running work)**. Bạn mang đến ý tưởng và thực hiện số ít những quyết định thực sự cần đến bạn; nó giúp bạn phân rã công việc, chạy song song các phần độc lập, theo dõi tiến độ và hạn ngạch, đồng thời xác minh kết quả đối chiếu với mục tiêu tường minh. **Board (bảng kế hoạch) sống sót qua các lần đặt lại ngữ cảnh và bàn giao phiên**, công việc không phụ thuộc vào trí nhớ của một cuộc hội thoại — đây là khác biệt cốt lõi nhất giữa nó với "Agent trong một cuộc hội thoại đơn lẻ".

## 1. Tổng quan dự án

### 1.1 Nó là gì?

cc-master là **framework điều phối tác tử (Agent Orchestration)** do nemori-ai mở mã nguồn (viết bằng TypeScript), mục tiêu nâng cấp "một phiên coding agent đơn lẻ" thành **trưởng dự án** có thể trụ vững nhiều ngày, chạy song song đa luồng và sống sót qua nhiều phiên.

Định vị chính thức trong một câu:

> cc-master turns a supported coding-agent session into a project lead for long-running work. You bring the idea and make the handful of calls that truly need you; it helps break the work down, run independent pieces in parallel, track progress and quota, and verify the result against an explicit goal. The board survives context resets and session handoffs, so the work can continue without relying on one conversation's memory.

(cc-master biến phiên coding agent được hỗ trợ thành trưởng dự án cho công việc dài hạn. Bạn mang đến ý tưởng, thực hiện số ít quyết định thực sự cần đến bạn; nó giúp bạn phân rã công việc, chạy song song các phần độc lập, theo dõi tiến độ và hạn ngạch, đồng thời xác minh kết quả đối chiếu với mục tiêu tường minh. Bảng kế hoạch sống sót qua các lần đặt lại ngữ cảnh và bàn giao phiên, công việc có thể tiếp tục mà không phụ thuộc vào trí nhớ của một cuộc hội thoại.)

**Tóm lại trong một câu**: trong kỷ nguyên AI hỗ trợ lập trình, cc-master tái phân bổ sự chú ý của con người vào những nơi thực sự đáng để dành thời gian — những việc vặt như phân rã, điều phối, theo dõi tiến độ và hạch toán hạn ngạch được giao cho "trưởng dự án", bạn chỉ đưa ra định hướng và các quyết định lớn.

### 1.2 Thông tin chính của dự án

| Trường | Giá trị |
|------|-----|
| Kho lưu trữ | https://github.com/nemori-ai/cc-master |
| Stars | 8 |
| License | PolyForm Noncommercial 1.0.0 (mã nguồn dùng được, chỉ giới hạn phi thương mại) |
| Ngôn ngữ | TypeScript |
| Lần đẩy gần nhất | 2026-08-07 |
| Topics | `agent-plugin` `agent-skill` `claude-code` `claude-plugin` `dynamic-workflow` `orchestration` |
| Tài liệu tiếng Trung | README_zh.md (kèm README tiếng Trung) |

### 1.3 Nó không phải là gì (ranh giới quan trọng)

> Nhưng đừng hiểu lầm — đây **không phải** "ước một điều là AI lo hết". Gu thẩm mỹ, thiết kế, định hướng — những quyết định chỉ bạn mới có thể đưa ra **vẫn thuộc về bạn**; thứ nó lấy khỏi đĩa của bạn chỉ là những việc phân rã, điều phối, theo dõi tiến độ và hạch toán lẽ ra sẽ vùi lấp bạn.

**Khi nào không nên dùng cc-master**:

> Sửa một hai dòng mà mười phút là xong? Cứ sửa thẳng luôn — đừng mời "trưởng dự án", đó là dùng dao mổ trâu giết gà, chỉ chậm hơn thôi. **Nó được sinh ra cho những mục tiêu một mình bạn theo dõi không nổi, phải chạy nhiều ngày, đồng thời mở rất nhiều luồng. Công việc càng lớn, càng rối, càng dài thì càng đáng dùng.**

### 1.4 Làm cho ai (ba nhóm người dùng mục tiêu)

| Chân dung người dùng | Điểm đau | Giá trị cc-master mang lại |
|----------|------|---------------------|
| 🚀 Bạn có ý tưởng nhưng không rành kỹ thuật | Nói rõ được mình muốn gì, thiếu một **trưởng dự án đáng tin cậy** | Giúp bạn phân rã ý tưởng thành nhiệm vụ thực thi được, theo dõi tiến độ, xác minh kết quả |
| 🔧 Kỹ sư không muốn làm "quản lý" | Việc quản lý chiếm mất thời gian viết code | Gỡ phần quản lý xuống, để bạn ở lại với nghề |
| 🧭 Người dẫn dắt đội nhóm | Muốn thành "mười bản thân mình" | Nó gánh phần điều phối rườm rà, bạn định hướng và đưa quyết định lớn |

## 2. Ý tưởng cốt lõi

### 2.1 Tái phân bổ sự chú ý (Attention Reallocation)

> At bottom it does one thing: in the age of AI-assisted coding, it **reallocates your attention to where it's actually worth spending**.

Tóm lại nó chỉ làm một việc: trong kỷ nguyên AI hỗ trợ lập trình, **tái phân bổ sự chú ý của bạn đến nơi thực sự đáng để dành thời gian**. Sự chú ý của con người là tài nguyên khan hiếm; thay vì nhìn chằm chằm vào output của từng Agent và bảo trì từng mục tiến độ, hãy tập trung sự chú ý vào những "phán đoán chỉ bạn mới có thể làm".

### 2.2 Nhạc trưởng không bao giờ tự chơi nhạc cụ

> The conductor never plays an instrument.

Đây là đường ranh giới thiết kế cốt lõi nhất của cc-master: **người điều phối lo việc điều phối, tuyệt đối không tự xuống tay làm công việc đơn vị**. Bất kỳ thay đổi nào đẩy luồng chính về phía "tự triển khai" hay "tự đánh giá" đều sai hướng. Nguyên tắc này xuyên suốt thiết kế skill, thiết kế hook và state machine của board.

### 2.3 Sáu mục tiêu hiến chương (Charter Goals)

Sáu mục tiêu được liệt kê trong hiến chương dự án (một phần vẫn đang tiến hóa):

1. **Thúc đẩy bất đồng bộ, song song đa luồng**, bàn giao đầy đủ mục tiêu
2. **Kiểm soát nhịp tiêu thụ token** (nhận biết hạn ngạch)
3. **Nắm ranh giới giữa ra quyết định tự chủ và cộng tác người-máy** (những quyết định nào nên hỏi con người)
4. **Phân rã, quản lý, cập nhật, lập kế hoạch mục tiêu**
5. **Điều phối sắp xếp tối đa hóa hiệu suất trong mức tiêu thụ tài nguyên hợp lý**
6. **Chọn mô hình phù hợp theo độ phức tạp / độ khó / thời lượng** (O/T1/T2/T3)

### 2.4 Khác biệt cốt lõi với "Agent hoàn toàn tự động"

- **Không phải** "một prompt chạy hết hoàn toàn tự động" — nó đưa vào **Goal Contract tường minh (hợp đồng mục tiêu)** và **cổng xác minh**, kết quả phải được đối chiếu từng điều với mục tiêu.
- **Không phải** một cuộc hội thoại đơn lẻ — **Board được bền hóa xuống đĩa** (`~/.cc_master/boards/*.board.json`), vẫn sống sót sau đặt lại ngữ cảnh và bàn giao phiên.
- **Không phải** công việc nào cũng nên dùng — nó có ranh giới rõ ràng về "khi nào không nên dùng" (sửa nhỏ thì làm thẳng, đừng mời trưởng dự án).

## 3. Hướng dẫn chi tiết

### 3.1 Điều kiện tiên quyết bắt buộc

| Phụ thuộc | Yêu cầu |
|------|------|
| Node.js | **22+** (bắt buộc ở mọi chế độ, bao gồm offline / khóa phiên bản) |
| unzip | Giải nén plugin và engine |
| Công cụ SHA256 | Một trong các lệnh `sha256sum` / `shasum` / `openssl` |
| Công cụ mạng | `curl` hoặc `wget` (cần cho cài đặt trực tuyến) |

### 3.2 Cài đặt một lệnh (cài luôn engine ccm + plugin)

```bash
# Cài engine ccm + plugin (tự động dò tìm harness theo mặc định)
curl -fsSL https://raw.githubusercontent.com/nemori-ai/cc-master/main/install.sh | bash
```

### 3.3 Tùy chọn cài đặt (khóa phiên bản / chỉ định harness)

```bash
# Khóa đồng thời phiên bản engine và plugin (hai flag độc lập với nhau, đều tùy chọn)
curl -fsSL https://raw.githubusercontent.com/nemori-ai/cc-master/main/install.sh | bash -s -- \
  --ccm-version ccm-v0.23.0 --plugin-version v0.22.0

# Chỉ khóa phiên bản engine, plugin dùng bản mới nhất
curl -fsSL https://raw.githubusercontent.com/nemori-ai/cc-master/main/install.sh | bash -s -- --ccm-version ccm-v0.23.0

# Chỉ định harness mục tiêu
curl -fsSL https://raw.githubusercontent.com/nemori-ai/cc-master/main/install.sh | bash -s -- --harness claude-code
curl -fsSL https://raw.githubusercontent.com/nemori-ai/cc-master/main/install.sh | bash -s -- --harness cursor
curl -fsSL https://raw.githubusercontent.com/nemori-ai/cc-master/main/install.sh | bash -s -- --harness kimi-code

# Cài tất cả các harness
curl -fsSL https://raw.githubusercontent.com/nemori-ai/cc-master/main/install.sh | bash -s -- --all-harnesses
```

### 3.4 Các biến môi trường quan trọng

| Biến | Giá trị mặc định | Công dụng |
|------|--------|------|
| `CC_MASTER_HOME` | `$HOME/.cc_master` | Thư mục gốc trạng thái runtime (boards, Goal Briefs, đăng ký tài khoản, sidecar hạn ngạch) |
| `PREFIX` | `$HOME/.local/bin` | Vị trí cài đặt binary `ccm` |
| `CC_MASTER_PLUGIN_DIR` | `$HOME/.local/share/cc-master` | Thư mục gốc tạm lưu plugin |
| `CC_MASTER_INSTALL_LOCAL` | _rỗng_ | Đặt thành đường dẫn thư mục cục bộ → cài đặt offline từ tài nguyên cục bộ |
| `CC_MASTER_NO_AUTOINSTALL` | _rỗng_ | Đặt thành `1` → tắt cài đặt tự động status bar trên Claude Code |

### 3.5 Khởi động điều phối trong từng harness

Sau khi cài đặt xong, khởi động bằng lối vào native của harness tương ứng:

```bash
# Claude Code (lệnh slash)
/cc-master:as-master-orchestrator <mục tiêu của bạn>

# Codex (subcommand)
$cc-master-as-master-orchestrator <mục tiêu của bạn>

# Cursor (lệnh slash trong Agent chat)
/as-master-orchestrator <mục tiêu của bạn>

# kimi-code (lệnh plugin không gian tên)
cc-master:as-master-orchestrator <mục tiêu của bạn>
```

### 3.6 Bảng tra nhanh lệnh hằng ngày

| Lệnh | Công dụng |
|------|------|
| `/cc-master:as-master-orchestrator <goal>` | Bắt đầu một lần điều phối hoàn toàn mới |
| `/cc-master:as-master-orchestrator --resume` | Khôi phục board đã có |
| `ccm harness list --machine-wide --json` | Khám phá bề mặt harness cấp máy |
| `ccm quota status --machine-wide --json` | Đọc trạng thái hạn ngạch đã cache |
| `ccm model-policy show --task <taxonomy> --json` | Xem các ứng viên vai trò mô hình O/T1/T2/T3 |
| `ccm worker help --harness <target>` | Đọc trợ giúp lệnh agent thực của CLI mục tiêu |
| `ccm worker run` | Vận chuyển worker thô (không có side-effect lên board) |
| `ccm worker dispatch --board … --task … --idempotency-key …` | Phái cử có hạch toán (được ghi trong Agent Registry) |
| `ccm agent list --json` | Xem danh sách runtime và bằng chứng vòng đời |
| `ccm status-report show` | Tạo báo cáo trạng thái board |
| `ccm web-viewer open` | Mở sơ đồ kế hoạch thời gian thực chỉ đọc trong trình duyệt |
| `/cc-master:discuss <decision>` | Ném quyết định cho con người |
| `/cc-master:bulk-discuss` | Xử lý hết mọi quyết định đang chờ trong một lần |
| `/cc-master:stop` | Kết thúc và lưu trữ board |
| `/cc-master:handoff-to-new-session` | Chuẩn bị cho bàn giao phiên |
| `/cc-master:retro` | Hồi tưởng chỉ đọc → tài liệu bài học kinh nghiệm |
| `/cc-master:distill <retro-path...>` | Chưng cất kinh nghiệm thành tài sản dự án (discipline-doc / skill / workflow / subagent) |
| `ccm account add\|list\|switch <email>` | Quản lý nhóm tài khoản Claude Code |

### 3.7 Hình dạng của một workflow hoàn chỉnh

```text
1. Bạn: /cc-master:as-master-orchestrator "Di chuyển blog sang kiến trúc i18n mới"
2. cc-master: tạo Goal Contract → cắt mục tiêu thành DAG (T0 nghiên cứu → T1/T2 triển khai song song → T3 xác minh)
3. cc-master: phân bổ vai trò mô hình O/T1/T2/T3 cho từng nhiệm vụ, phái worker tới Claude Code/Codex...
4. Gặp quyết định thực sự cần đến bạn → /cc-master:discuss hoặc /cc-master:bulk-discuss
5. Ngữ cảnh sắp đầy → /cc-master:handoff-to-new-session → phiên mới --resume, board khôi phục nguyên trạng
6. Mọi nhiệm vụ done → cổng verify-board đối chiếu từng điều với Goal Contract → /cc-master:stop lưu trữ
7. Tùy chọn: /cc-master:retro → /cc-master:distill biến bài học thành tài sản đội ngũ
```

## 4. Kiến trúc hệ thống

### 4.1 Mô hình sản phẩm ba lớp

```text
┌─────────────────────────────────────────────────────────┐
│  cc-master plugin (bộ điều hợp per-harness)             │
│  lệnh / skills / rules / hooks                          │
│  → Claude Code · Codex · Cursor · kimi-code             │
├─────────────────────────────────────────────────────────┤
│  ccm CLI + @ccm/engine (sản phẩm độc lập)               │
│  board / Goal Contract / worker / agent registry /      │
│  quota / model policy / runtime / monitor / viewer      │
├─────────────────────────────────────────────────────────┤
│  ccm web-viewer (chỉ đọc, nhúng trong binary ccm)       │
│  Graph / Board / List / Timeline / DecisionCard         │
└─────────────────────────────────────────────────────────┘
```

- **Lớp thứ nhất**: bộ điều hợp plugin per-harness — dịch cùng một bộ lệnh/skill/hook sang hình thái native của từng harness.
- **Lớp thứ hai**: CLI `ccm` và `@ccm/engine` — sản phẩm engine độc lập, tách rời khỏi harness, phụ trách board, worker, hạn ngạch, chính sách mô hình.
- **Lớp thứ ba**: `ccm web-viewer` — chế độ xem trình duyệt chỉ đọc (Graph / Board / List / Timeline / DecisionCard).

### 4.2 Mô hình chiếu từ mã nguồn sang bộ điều hợp (phong cách paragoge)

```text
plugin/src/                      ← mã nguồn chuẩn (SSOT)
  skills/                        ← SAP: <skill>/canonical/ + adapters/<host>/strategy.yaml
  hooks/                         ← PHIP: _manifest/ + _hosts/<host>/ + implementations/<host>/
  commands/                      ← mã nguồn thân lệnh
  adapters/                      ← ánh xạ gọi native host xuyên bề mặt
plugin/dist/<host>/              ← sản phẩm bộ điều hợp được sinh ra (commit vào repo)
  cc-master-plugin-claude-code-<version>.zip
  cc-master-plugin-codex-<version>.zip
  cc-master-plugin-cursor-<version>.zip
  cc-master-plugin-kimi-code-<version>.zip
```

### 4.3 Mô hình dữ liệu Board v2 (thiết kế eo hẹp)

Board là tệp JSON `~/.cc_master/boards/<dấu thời gian UTC>-<pid>.board.json`:

```json
{
  "schema": "cc-master/v1",
  "goal": "...",
  "owner": { "active": true, "session_id": "abc123", "heartbeat": "..." },
  "git": { "worktree": "/.../.claude/worktrees/i18n", "branch": "feat/i18n-rollout" },
  "wip_limit": 4,
  "tasks": [
    { "id": "T0", "status": "done", "deps": [], "artifact": "commit a1b2c3", "verified": true },
    { "id": "T1", "status": "in_flight", "deps": ["T0"], "mechanism": "sub-agent", "handle": "bg-7a" },
    { "id": "D1", "status": "blocked", "blocked_on": "user", "title": "PR có nên tách thành hai không?" }
  ],
  "log": []
}
```

**Liệt kê trạng thái nhiệm vụ**: `ready / in_flight / blocked(blocked_on:"user"|"<taskid>") / done / escalated / failed / stale / uncertain`

**Nguyên tắc eo hẹp**: chỉ một nhúm trường cố định được hooks phụ thuộc — `schema / goal / owner.session_id / git / tasks[{id,status,deps}]` + bảng liệt kê trạng thái; phần còn lại hoàn toàn là "dạng thức tự do cho Agent". Muốn thay đổi phần eo hẹp, bắt buộc phải cập nhật đồng thời mọi hooks + test trong cùng một PR.

### 4.4 8 Skill phân tán (dùng chung cho mọi harness)

| Skill | Trách nhiệm |
|-------|------|
| `master-orchestrator-guide` | Danh tính trưởng dự án, quyết định luồng chính, điều phối DAG đã cắt lát, ranh giới phái cử/khôi phục/xác minh/chuyển tài khoản |
| `authoring-workflows` | Viết workflow một cách xác định trên các host khả dụng; host không hỗ trợ sẽ hạ cấp một cách tường minh |
| `using-ccm` | Cẩm nang vận hành toàn bộ CLI ccm, mô hình board, state machine, Agent Registry và các quy tắc xác thực engine |
| `slicing-goals-into-dags` | Cắt mục tiêu thành DAG có thể bàn giao sớm, chạy song song và xác minh được |
| `dev-as-ml-loop` | Coi mỗi nhiệm vụ phát triển như vòng lặp tối ưu "đề xuất → đo lường → điều chỉnh → hội tụ" |
| `engineering-with-craft` | Kỹ năng và ranh giới triển khai DDD / SDD / TDD / OOP |
| `pacing-and-estimation` | Tiêu thụ các khuyến nghị chỉ đọc của ccm (usage / estimate / baseline) để định nhịp và ước lượng |
| `distilling-lessons-into-assets` | Định tuyến bằng chứng hồi tưởng vào các tài sản discipline-doc / skill / workflow / subagent |

### 4.5 Phân bổ mô hình thống nhất O / T1 / T2 / T3

| Vai trò | Công dụng |
|------|------|
| **O** (orchestrator) | Kiến trúc hệ thống / thiết kế, đánh giá phản biện |
| **T1** | Triển khai chính sau khi hoàn tất spec |
| **T2** | Đánh giá thông thường, kiểm thử, nghiên cứu repo, tổng hợp có cấu trúc |
| **T3** | Công việc hàng loạt mang tính cơ học, rủi ro thấp, độ xác minh cao |

### 4.6 Hooks: dormant-until-armed (ngủ đông cho đến khi được vũ trang)

Mỗi hook ngủ hoàn toàn cho đến khi phiên bị `as-master-orchestrator` tiếp quản và kích hoạt board; chỉ có `bootstrap-board.sh` là ngoại lệ (bản thân nó là hành động vũ trang). 7 loại năng lực:

| Hook | Năng lực |
|------|------|
| `bootstrap` / `resume` | Tạo board / tiếp quản board cũ |
| `reinject` / orchestrator context | Khôi phục danh tính, Goal Contract, nhiệm vụ, dữ kiện cấp máy sau khi nén |
| `verify-board` | Cổng dừng: kiểm tra mục tiêu chưa hoàn thành, Agent nền, bằng chứng hoàn thành thực |
| `board-guard` / `board-lint` | Chặn sửa board thủ công; kiểm tra cấu trúc sau khi ghi |
| `usage-pacing` | Tiêu thụ hạn ngạch/khuyến nghị đã cache của ccm |
| `coordination inbox` | Thông báo cấp quyết định xuyên phiên |
| `identity` / `critical-path nudge` | Khôi phục vai trò trong phiên dài + chú ý đường tới hạn |

### 4.7 Trạng thái hạn ngạch và dự đoán Monte Carlo

- **Quota posture**: tín hiệu hạn ngạch cấp máy được cache theo provider — Claude Code 5h/7d, giới hạn cứng Codex 7d, chu kỳ thanh toán Cursor, kimi-code 5h/7d cuốn chiếu.
- **Dự đoán Monte Carlo**: mô phỏng lịch trình điều phối hàng nghìn lần để đưa ra ước lượng xác suất bàn giao — không còn hứa kiểu vỗ ngực "mai sẽ xong", mà đưa ra một phân bố.

### 4.8 Hai đường phiên bản (ADR-022)

| Sản phẩm | Mẫu tag phiên bản | Track phát hành |
|------|--------------|----------|
| Plugin cc-master | `v0.22.0` (phiên bản trần) | Phát hành plugin |
| Engine `ccm` | `ccm-v0.23.0` | Phát hành ccm |

Plugin và engine là hai đường phiên bản độc lập, có thể khóa riêng — điều này đảm bảo "engine nâng cấp không làm nổ plugin, plugin cập nhật không cần chờ engine".

## 5. Triết lý thiết kế

### 5.1 Nhạc trưởng không bao giờ tự chơi nhạc cụ

Người điều phối lo việc điều phối, tuyệt đối không tự làm công việc đơn vị. Bất kỳ thay đổi nào đẩy luồng chính về phía "tự triển khai / tự đánh giá" đều sai hướng — đây là đường ranh giới quan trọng nhất của toàn bộ hệ thống.

### 5.2 Tái phân bổ sự chú ý

Mục tiêu tối thượng của hệ thống không phải "tự động hóa mọi thứ", mà là **tái phân bổ sự chú ý của con người đến nơi thực sự đáng để dành thời gian**. Tự động hóa những việc vặt mang tính xác định như phân rã, điều phối, theo dõi tiến độ, hạch toán; giữ lại cho con người những phán đoán không thể thuê ngoài như gu thẩm mỹ, thiết kế, định hướng.

### 5.3 ship-anywhere (chạy được ở bất cứ đâu)

hooks chỉ dùng **bash + node/JS** (runtime mà host Claude Code đảm bảo), không dùng `jq` / `python` / TS native; không phụ thuộc `agent-teams` hay các thói quen định kỳ (không đáng tin cậy); nguyên thủy định kỳ (CronCreate) chỉ dùng cho watchdog, không dùng cho điều phối thông thường.

### 5.4 dormant-until-armed (ngủ đông cho đến khi được vũ trang)

Không kích hoạt thì không tồn tại: mọi hook ngủ hoàn toàn cho đến khi phiên tiếp quản và kích hoạt board, đưa "side-effect khi không dùng" về con số không.

### 5.5 Eo hẹp (Narrow Waist)

hooks chỉ phụ thuộc một tập trường cố định cực nhỏ, phần còn lại là không gian để Agent tự do phát huy; thay đổi phần eo hẹp bắt buộc cập nhật đồng thời mọi hooks + test trong cùng PR. Điều này giúp hệ thống cân bằng giữa "lõi xác định" và "mức độ tự do của Agent".

### 5.6 Tách rời hai đường phiên bản

Plugin và engine phát hành độc lập, có thể khóa phiên bản riêng, các quyết định kiến trúc nằm trong ADR (đã có 39 ADR). Đây là hiện thân của "quyết định kiến trúc dài hạn": chọn lựa theo chiều ba năm, không làm giải pháp tạm bợ.

### 5.7 Ranh giới sử dụng rõ ràng

Điều phản trực giác nhất trong triết lý thiết kế là **chủ động vạch ra ranh giới "không nên dùng"**: sửa nhỏ mười phút xong, cứ làm thẳng, đừng mời trưởng dự án. Hệ thống được sinh ra cho những mục tiêu "quá lớn, quá rối, quá dài" — công việc càng lớn càng đáng dùng.

## 6. Tổng kết: Quan điểm và Kết luận

1. **Trí nhớ của một cuộc hội thoại không nên là trạng thái công việc duy nhất**: bền hóa Board xuống đĩa, sống sót qua đặt lại ngữ cảnh và bàn giao phiên, là bước then chốt để công việc Agent dài hạn từ "demo" tiến tới "sản xuất được".

2. **Điều phối tốt hơn phát minh**: cc-master không phát minh Agent mới, mà điều phối Claude Code / Codex / Cursor / kimi-code lại với nhau — tái sử dụng thông tin xác thực và năng lực sẵn có, giá trị nằm ở "chỉ huy", không nằm ở "nhạc cụ".

3. **Sự chú ý của con người là tài nguyên khan hiếm, nên được tái phân bổ**: tự động hóa những việc vặt mang tính xác định (phân rã / điều phối / hạch toán), giữ lại những phán đoán không thể thuê ngoài (gu thẩm mỹ / thiết kế / định hướng), là phân công đúng đắn của kỷ nguyên AI hỗ trợ lập trình.

4. **"Tự động hoàn toàn kiểu ước nguyện" là nhu cầu giả**: Goal Contract tường minh + cổng xác minh + cơ chế discuss chứng minh rằng điều phối thực sự dùng được phải đưa con người trở lại vòng ra quyết định, thay vì bỏ qua con người.

5. **Ý thức hạn ngạch là nền móng của nhiệm vụ dài hạn**: dự đoán bàn giao Monte Carlo + trạng thái hạn ngạch theo provider, biến "có bàn giao đúng hạn không" từ chuyện vỗ ngực thành phân bố xác suất.

6. **Lõi xác định và mức độ tự do của Agent có thể cùng tồn tại**: board eo hẹp + hooks ngủ đông + runtime ship-anywhere, khiến hệ thống vừa có tính xác định có thể xác minh, vừa giữ được sự linh hoạt của Agent.

7. **Thích ứng xuyên harness là kỹ thuật hệ thống**: cùng một bộ skill/hook/lệnh chiếu sang hình thái native của 4 harness (mô hình SAP/PHIP), bền vững hơn nhiều so với "mỗi harness viết một bộ riêng".

8. **Ý thức ranh giới là dấu hiệu của sự chín muồi**: vạch rõ "khi nào không nên dùng", hơn cả việc chồng chất tính năng, thể hiện một công cụ tỉnh táo về định vị của chính nó.

## Tài liệu tham khảo

- Trang chủ kho lưu trữ: https://github.com/nemori-ai/cc-master
- README tiếng Trung: `README_zh.md`
- Sổ tay tính năng: `design_docs/feature-manual.md`
- Mô hình năng lực: `design_docs/cross-harness-orchestration-capability-model.md`
- Spec đầy đủ: `design_docs/spec.md`
- Bảng thuật ngữ: `design_docs/glossary.md`
- Hồ sơ quyết định kiến trúc: `adrs/ADR-001…ADR-039`
- Danh mục lệnh: `plugin/src/skills/using-ccm/canonical/references/command-catalog.md`
