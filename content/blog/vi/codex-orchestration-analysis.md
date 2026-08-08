---
title: "Codex-Orchestration Phân tích sâu: Cách một plugin đưa Fable 5, Opus 5, Kimi K3 vào Codex để mỗi AI đảm nhận vai trò khác nhau hợp tác phát triển"
description: "Phân tích toàn diện Codex-Orchestration (580+ stars). Plugin nguồn mở này giới thiệu 4 vai trò Planner, Advisor, Designer, Executor vào Codex, để Fable 5 lập kế hoạch, Opus 5 review, Kimi K3 thiết kế, GPT-5.6 Luna triển khai. Giải quyết 3 vấn đề cốt lõi, hướng dẫn cài đặt chi tiết, sơ đồ quy trình, triết lý thiết kế, ranh giới bảo mật từ production-readiness audit."
date: "2026-08-08"
author: "TopDigg Research Team"
tags: ["Codex-Orchestration", "Codex", "OpenAI", "Multi-Agent", "Claude Fable 5", "Claude Opus 5", "Kimi K3", "OpenRouter", "MCP", "Model Routing", "AI Agent", "Python", "Role-Based Agent"]
categories: ["Phân tích sâu"]
keywords: ["Codex-Orchestration", "Codex đa mô hình hợp tác", "Claude Fable 5", "Claude Opus 5", "Kimi K3", "OpenRouter", "plugin MCP", "định tuyến mô hình", "Planner Advisor Designer Executor", "mô hình bên ngoài", "Gate 0", "bảo mật thông tin", "đa tác tử hợp tác", "trợ lý lập trình AI", "OpenAI Codex"]
---

# Codex-Orchestration Phân tích sâu: Một plugin, bốn vai trò, vô số sự hợp tác

> **Ý tưởng cốt lõi:** "Bạn không cần một mô hình mạnh hơn — bạn cần một khung hợp tác tốt hơn." Codex-Orchestration lấy trọn lấy khái niệm 'mỗi AI đảm nhận vai trò khác nhau' — Planner dùng Fable 5 lên kế hoạch, Advisor dùng Opus 5 review, Designer dùng Kimi K3 thiết kế, Executor dùng GPT-5.6 Luna triển khai. Codex vẫn là người chịu trách nhiệm, nhưng giờ thì AI phù hợp làm việc phù hợp.

---

## 1. Đây là gì? (Dành cho học sinh trung học)

Hãy tưởng tượng bạn có một dự án lập trình, nhưng nhóm của bạn không phải là con người — mà là trợ lý AI.

Thông thường, bạn chỉ thuê một trợ lý AI. Nó phải đồng thời là quản lý dự án, nhà thiết kế, lập trình viên, và tester QA. Kết quả sao? Quản lý dự án có thể chưa nghĩ kỹ đã bắt đầu viết code. Nhà thiết kế sản phẩm có thể chưa đẹp. Tester QA có thể bị lãng quên trong lúc bận rộn.

Codex-Orchestration là một **plugin quản lý đội nhóm thông minh** cho Codex (trợ lý lập trình AI của OpenAI). Nó **không thay thế** trợ lý AI của bạn — mà giúp bạn **thuê thêm nhiều trợ lý AI khác nhau với tài năng khác nhau**, mỗi người chịu trách nhiệm cho một phần công việc riêng:

- **Planner** (Người lập kế hoạch) — Chuyển yêu cầu của bạn thành kế hoạch thực thi chi tiết. Như một quản lý dự án vẽ roadmap.
- **Advisor** (Người tư vấn) — Review kế hoạch, tìm lỗ hổng, đảm bảo không bỏ sót. Như một quản lý chất lượng bắt lỗi trước khi code.
- **Designer** (Nhà thiết kế) — Tạo thiết kế UI/UX, đảm bảo sản phẩm đẹp và dễ dùng.
- **Executor** (Người thực hiện) — Thực hiện kế hoạch đã được phê duyệt, viết code.

**Điều tuyệt vời nhất:** Mỗi "trợ lý AI" có thể là **của công ty khác nhau**:

- Planner → **Claude Fable 5** (giỏi lập kế hoạch)
- Advisor → **Claude Opus 5** (giỏi review)
- Designer → **Kimi K3** (1,048,576 tokens ngữ cảnh)
- Executor → **GPT-5.6 Luna** (nhanh triển khai)

Và AI gốc trong Codex của bạn vẫn là **CEO** — quyết định khi nào nên gọi AI phụ, tập hợp kết quả, và ký duyệt cuối cùng.

---

## 2. Giới thiệu dự án

### 2.1 Thông tin cơ bản

| Thuộc tính | Chi tiết |
|-----------|----------|
| **Tên dự án** | Codex-Orchestration |
| **Tác giả/Bảo trì** | Cjbuilds (tổ chức GitHub) |
| **Kho lưu trữ** | [https://github.com/Cjbuilds/Codex-Orchestration](https://github.com/Cjbuilds/Codex-Orchestration) |
| **Số sao** | 582+ (tháng 7/2026) |
| **Số fork** | 59+ |
| **Ngôn ngữ** | Python 3.11+ |
| **Giấy phép** | MIT |
| **Ngày tạo** | 10/7/2026 |
| **Phiên bản hiện tại** | 0.9.3 (Unreleased) |

### 2.2 Vấn đề mà nó giải quyết

#### Vấn đề 1: Một mô hình không thể làm tốt hết mọi việc

Khi yêu cầu Codex hoàn thành một nhiệm vụ phức tạp, nó cần đồng thời:

1. Hiểu yêu cầu → 2. Lập kế hoạch → 3. Review rủi ro → 4. Viết code → 5. Kiểm thử

Một mô hình đơn chỉ "vượt qua" ở mỗi giai đoạn. GPT-5.6 Sol có thể lập kế hoạch tốt nhưng bỏ sót trường hợp biên. Fable 5 có thể review tốt nhưng triển khai chưa nhanh.

#### Vấn đề 2: Lựa chọn mô hình bị khóa vào ChatGPT/OpenAI

Giao diện nguyên gốc của Codex chỉ cho phép chọn các mô hình đã đăng ký trên nền tảng ChatGPT/OpenAI. Muốn dùng Claude của Anthropic hay Kimi K3 qua OpenRouter — những "mô hình bên ngoài" thường không thể tích hợp vào workflow Codex.

#### Vấn đề 3: Thiếu cơ chế review độc lập

Nguy hiểm nhất trong hợp tác đa mô hình là **tự review chính mình** — người lập kế hoạch review kế hoạch của chính mình. Codex-Orchestration **bắt buộc Planner và Advisor phải dùng mô hình khác nhau**, đảm bảo luôn có review độc lập.

#### Vấn đề 4: Bảo mật thông tin đăng nhập

Dán API key vào chat hoặc lưu vào file cấu hình là vô cùng nguy hiểm. Codex-Orchestration thiết kế một **"hệ thống kiểm soát"** — thông tin đăng nhập sẽ **không bao giờ** xuất hiện trong log chat hay repo code.

### 2.3 Tính năng cốt lõi

| Tính năng | Mô tả |
|-----------|-------|
| **Định tuyến vai trò** | Ánh xạ Planner, Advisor, Designer, Executor tới các mô hình khác nhau |
| **Hỗ trợ mô hình bên ngoài** | Mang Kimi K3 và các mô hình khác vào Codex qua OpenRouter |
| **Tích hợp Claude** | Kết nối Claude Fable 5 / Opus 5 như Planner hoặc Advisor |
| **Quản lý thông tin bảo mật** | Dùng OS credential store — không lưu key trong chat/code |
| **Ưu tiên xem trước** | Tất cả thao tác đều xem trước → áp dụng — tránh nhầm lẫn |
| **Sửa lỗi định tuyến** | Chỉ khắc phục khi cài đặt bị lảng sóng |
| **Tự động cập nhật plugin** | `$codex-orchestration:codex-orchestration --update` |

---

## 3. Ý tưởng thiết kế cốt lõi

### 3.1 Hệ thống bốn vai trò

Codex-Orchestration giới thiệu 4 vai trò trong một nhiệm vụ Codex, mỗi mô hình chịu trách nhiệm cho một giai đoạn của vòng đời phát triển:

#### 🎯 Planner (Người lập kế hoạch)
- **Trách nhiệm**: Chuyển yêu cầu người dùng thành kế hoạch thực hiện chi tiết
- **Quy trình**: Nhận yêu cầu → Lập kế hoạch → Nhận phản hồi từ Advisor → Cải tiến kế hoạch
- **Tùy chọn**: Bỏ qua → mô hình Codex hiện tại sẽ làm Planner
- **Mô hình mẫu**: Claude Fable 5, GPT-5.6 Sol

#### 🔍 Advisor (Người tư vấn/Reviewer)
- **Trách nhiệm**: Tìm lỗ hổng trong kế hoạch, chỉ ra rủi ro kỹ thuật
- **Quy trình**: Nhận kế hoạch → Xác định vấn đề → Trả về `PLAN_APPROVED` hoặc `PLAN_REVISE`
- **Tùy chọn**: Bỏ qua → không có giai đoạn review
- **Mô hình mẫu**: Claude Fable 5, Claude Opus 5, GPT-5.6 Sol
- **Giới hạn**: Tối đa 8 vòng review — dừng thực thi nếu chưa được duyệt

#### 🎨 Designer (Nhà thiết kế)
- **Trách nhiệm**: Chuyển kế hoạch đã duyệt thành tài nguyên thiết kế (UI/UX, thiết kế tương tác, kiến trúc thông tin)
- **Quy trình**: Nhận kế hoạch → Tạo file thiết kế → Gửi cho Executor
- **Tùy chọn**: Bỏ qua → không có giai đoạn thiết kế
- **Mô hình mẫu**: GPT-5.6 Terra, Kimi K3 (mô hình bên ngoài)

#### ⚙️ Executor (Người thực hiện)
- **Trách nhiệm**: Triển khai kế hoạch đã được phê duyệt thành code
- **Quy trình**: Nhận kế hoạch + thiết kế → Triển khai → Giao hàng
- **Bắt buộc**: Luôn phải chỉ định
- **Mô hình mẫu**: GPT-5.6 Luna

### 3.2 Quy trình làm việc

```text
                         YOUR TASK
                             |
                             v
                  CODEX COORDINATES THE WORK
                             |
                             v
               PLANNER CREATES THE FIRST PLAN
               Fable 5, another model, or Codex
                             |
                             v
                    ADVISOR REVIEWS IT
                       finds real gaps
                             |
                   needs work? -- yes --+
                             |            |
                            no            v
                             |      PLANNER IMPROVES IT
                             |            |
                             +<-----------+
                             |
                       PLAN APPROVED
                             |
                             v
                DESIGNER SHAPES THE EXPERIENCE
                (optional design handoff)
                             |
                             v
                  EXECUTORS IMPLEMENT IT
                             |
                             v
                    CODEX TESTS & DELIVERS
```

> **Quy tắc cốt lõi**: Planner và Advisor **phải dùng mô hình khác nhau**. Nguyên tắc này đảm bảo "review độc lập".

### 3.3 Triết lý thiết kế

#### Triết lý 1: Codex luôn là người chịu trách nhiệm

> "The model selected for the Codex task remains in charge."

Codex-Orchestration **không bao giờ thay thế** Codex. Nó chỉ mang các mô hình khác đến như "trợ lý phụ" trong workflow Codex. Codex vẫn là người chịu trách nhiệm:

- Quyết định cách tách nhiệm vụ
- Quyết định khi nào nên gọi trợ lý nào
- Thu thập mọi kết quả
- Kiểm tra cuối cùng và giao hàng

#### Triết lý 2: Ưu tiên xem trước, thất bại đóng cửa (fail-closed)

Tất cả thao tác tuân theo quy trình "Xem trước → Xác nhận → Áp dụng":

```bash
# Xem trước (không thay đổi bất kỳ cài đặt nào)
python3 configure_native_routing.py --codex-bin <path> --status

# Áp dụng
python3 configure_native_routing.py --codex-bin <path> --status --require-effective
```

Nếu bất kỳ kiểm tra nào thất bại, hệ thống **ngay lập tức dừng lại** thay vì tiếp tục. Sự thiết kế này đảm bảo ranh giới bảo mật không bị phá vỡ vô tình.

#### Triết lý 3: Thông tin thiết bảo mật không bao giờ được lưu trữ

> "Never paste an API key into Codex chat. The repository, provider TOML, registry, journal, logs, and tests store no key."

Dự án đề ra một nguyên tắc bảo mật rất nghiêm ngặt: **API key không bao giờ xuất hiện ở bất kỳ nơi nào có thể nhìn thấy được**。Xử lý thông tin đăng nhập như sau:

1. **Giai đoạn chuẩn bị**: Chạy prompt cục bản trong terminal tin cậy
2. **Lưu trữ**: OS credential store (macOS Keychain / Linux Secret Service / Windows Credential Manager)
3. **Lấy ra**: Chỉ khi cần gửi API call
4. **Chặn tuyệt đối**: chat log, file cấu hình, source code, Git, log, tests, registry — tất cả đều không được lưu key

#### Triết lý 4: Định tuyến là điều khiển chính sách, không phải ép buộc động cơ

> "Same-provider routing could be mistaken for an engine-enforced executor selector."

Định tuyến là **được hướng dẫn bởi chính sách** (policy-guided), không phải **được ép buộc bởi động cơ** (engine-enforced)。Ý nghĩa:

- Codex vẫn có thể chọn không ủy thác công việc
- Tham số `model` chỉ là "lộ trình đề xuất", không phải "bắt buộc"
- Nếu định tuyến thất bại, Codex sẽ fallback về mô hình gốc

#### Triết lý 5: Nguyên tắc đặc quyền tối thiểu

Mỗi vai trò đều có ranh giới quyền hạn rõ ràng:

- **Planner**: Chỉ có thể lập kế hoạch; không được sửa code
- **Advisor**: Chỉ có thể review kế hoạch; không được thực thi hoặc chỉnh sửa
- **Designer**: Chỉ có thể chỉnh sửa tài nguyên thiết kế; không được thay đổi code thực hiện
- **Executor**: Chỉ có thể thực hiện kế hoạch đã duyệt; không can thiệp các vai trò khác
- **Claude subprocess**: no-tools, no-persistence, minimal environment

---

## 4. Những quan sát và kết luận chính

### 4.1 Năm bài học từ production-readiness audit

Codex-Orchestration đã qua một **production-readiness audit** chính thức vào ngày 12/7/2026. Những vấn đề phát hiện và giải pháp:

| Mức độ | Vấn đề ban đầu | Giải pháp |
|--------|---------------|-----------|
| **Cao** | README bắt đầu với chi tiết routing nội bộ, người dùng thường không hiểu | Viết bằng ngôn ngữ đơn giản: "Đây là gì", "Tại sao cần", "Cách cài đặt" |
| **Cao** | Fable 5 được phát triển độc lập, không thể đảm bảo workflow advisor | Tích hợp opt-in root-directed Fable bridge, thêm kiểm tra đăng nhập và fail-closed review |
| **Cao** | `main` branch có thể thay đổi, không có quy trình PR | Yêu cầu PR, status checks, admin enforcement, chặn force-push |
| **Cao** | Routing cùng provider có thể bị nhầm là engine-enforced executor selector | Mô tả là policy-guided routing，定義 4 states: config / effective / accepted / confirmed |
| **Trung bình** | Thất bại trong lưu trữ trạng thái phục hồi bỏ qua lỗi rollback | Kiểm tra rollback status，báo cáo rằng managed fields có thể còn lại |

> **Kết luận**: Dự án sớm đã đối mặt với câu hỏi khó — "làm sao để công nghệ routing phức tạp trở nên an toàn và dễ dùng?" — và giải quyết qua kiểm toán nghiêm ngặt và lặp đi lặp lại。

### 4.2 Ba phương pháp định tuyến

| Phương pháp | Tình huống | Ví dụ | Mức độ bảo mật |
|-------------|------------|-------|----------------|
| **Định tuyến trực tiếp cùng provider** | Chuyển đổi mô hình trong một provider | GPT-5.6 Sol → Luna | Tiêu chuẩn |
| **Claude subscription** | Dùng Fable 5 / Opus 5 làm Planner hoặc Advisor | Fable 5 High làm Planner | Cao (sealed bridge) |
| **External Models** | Các mô hình hỗ trợ bởi OpenRouter | Kimi K3 qua OpenRouter | Cao (Gate 0 + OS credential store) |

> **Kết luận**: Plugin cung cấp một "kim tự cầm cụ mô hình" — từ đơn giản nhất đến nghiêm ngặt nhất。

### 4.3 Kiến trúc bảo mật Kimi K3

Kimi K3 (qua OpenRouter) là trường hợp đại diện nhất của "external model". Nó minh chứng kiến trúc bảo mật đầy đủ:

1. **Chuẩn bị provider**: Chỉ thêm `[model_providers.openrouter]` và `auth` table
2. **Xác thực**: OS credential store + prompt ẩn trong terminal
3. **Gate 0 probe**: Một lần probe có phí để xác minh mô hình hoạt động
4. **Tạo vai trò**: Tạo provider-pinned personal agent variants
5. **Thực thi bị đóng kín**: Gọi `codex exec` trực tiếp，tất cả tools đều bị vô hiệu hóa

> **Điểm quan trọng**: Mỗi lần lắp đặt đều "chưa được chứng nhận" cho đến khi vượt qua một lần Gate 0 có phí được phê duyệt.

### 4.4 Lịch sử tiến độ phiên bản

Từ CHANGELOG, tiến trình phát triển rõ rệt:

- **v0.1～v0.3** (7/9): Cơ sở hạ tầng, advisor workflow, external model an toàn
- **v0.4** (7/10): config-first routing làm workflow chính, hỗ trợ v2 spawn metadata
- **v0.5.1** (7/16): **Vai trò Planner được thêm vào**；Fable 5 hỗ trợ cả Planner + Advisor
- **v0.6.0** (7/18): **External models (Kimi K3)、OS credential store、Gate 0 probe** — nền tảng bảo mật hoàn thiện
- **v0.7～0.7.2** (7/18): **Vai trò Designer**；`--update`；xác nhận kích hoạt ngắn gọn
- **v0.8.0** (7/18): **封印 direct CLI transport cho READY external models**
- **v0.9.0** (7/25): **Claude Opus 5 được thêm vào**；giới hạn review từ 5→8 vòng；tăng cường bảo mật

> **Kết luận**: Chỉ trong 1 tháng, dự án đi từ v0.1 đến v0.9 — mỗi bản phát hành đều giải quyết vấn đề bảo mật hoặc trải nghiệm cụ thể。

### 4.5 Tinh hoa kỹ thuật

Từ "Deliberate boundaries that remain"，chúng ta thấy nhà thiết kế rất cẩn trọng trong từng bề mặt tấn công:

1. **External Model READY roles dùng sealed direct CLI transport** — ngăn ngừa lạm dụng tools
2. **Không có engine-level executor selector** — định tuyến luôn là policy-guided，Codex giữ quyền quyết định cuối
3. **Direct model overrides kế thừa root provider** — cross-provider cần cấu hình thủ công
4. **Claude Fable 5 là built-in exception hẹp nhất** — chỉ dùng làm Planner/Advisor
5. **「Any model」 có ranh giới rõ ràng** — chỉ là provider của Codex, custom provider đã cấu hình, hoặc bundled bridge

> **Kết luận**: Nhà thiết kế luôn chọn **fail-closed** thay vì **convenience-first**。Trong thời đại AI agent ngày càng tự động, triết lý "tin cậy nhưng kiểm chứng"、"tiện lợi nhưng an toàn" này sẽ trở thành chuẩn mực cho hợp tác đa mô hình trong tương lai。

---

## 5. Hướng dẫn chi tiết

### 5.1 Cài đặt

Đầu tiên, cài đặt plugin Codex-Orchestration vào Codex：

```bash
# Cài từ marketplace
codex plugin marketplace add Cjbuilds/Codex-Orchestration

# Thêm plugin vào Codex
codex plugin add codex-orchestration@codex-orchestration
```

> ⚠️ **Lưu ý**：Sau khi cài đặt，bạn **phải khởi động lại Codex và bắt đầu một nhiệm vụ mới** để kích hoạt plugin。

### 5.2 Cú pháp lệnh

Tất cả thao tác đều thực hiện qua **Codex prompt**（không phải lệnh terminal）。Nhập định dạng sau vào Codex chat：

```text
$codex-orchestration:codex-orchestration <lệnh>
```

Ví dụ，để kiểm tra trạng thái hiện tại：

```text
$codex-orchestration:codex-orchestration status
```

### 5.3 Cấu hình vai trò（setup）

`setup` là lệnh quan trọng nhất，ánh xạ mỗi vai trò tới mô hình tương ứng：

```text
$codex-orchestration:codex-orchestration setup \
  planner: <model and effort>, \
  advisor: <model and effort>, \
  designer: <model and effort>, \
  executor: <model and effort>
```

#### Ví dụ 1: Fable 5 lên kế hoạch、Sol review、Luna triển khai

```text
$codex-orchestration:codex-orchestration setup planner: Claude Fable 5 High, advisor: GPT-5.6 Sol High, executor: GPT-5.6 Luna Extra High
```

#### Ví dụ 2: Đội 4 người đầy đủ + Kimi K3 làm designer

```text
$codex-orchestration:codex-orchestration setup planner: Claude Fable 5 High, advisor: GPT-5.6 Sol High, designer: GPT-5.6 Terra High, executor: GPT-5.6 Luna Extra High
```

#### Ví dụ 3: Mô hình Codex hiện tại lên kế hoạch、Fable 5 chỉ làm Advisor

```text
$codex-orchestration:codex-orchestration setup advisor: Claude Fable 5 High, executor: GPT-5.6 Luna Extra High
```

### 5.4 Quy tắc cấu hình

- **`executor` là bắt buộc** — quyết định ai thực hiện kế hoạch
- **`planner` là tùy chọn** — bỏ qua → mô hình Codex hiện tại làm Planner
- **`advisor` là tùy chọn** — bỏ qua → không có giai đoạn review
- **`designer` là tùy chọn** — bỏ qua → không có giai đoạn thiết kế
- **Planner và Advisor phải dùng mô hình khác nhau** — bảo đảm review độc lập

### 5.5 Lựa chọn effort của Claude Fable 5 / Opus 5

| Mô hình | Effort hỗ trợ | Mặc định | Đặc biệt |
|---------|---------------|----------|---------|
| **Claude Fable 5** | Low, Medium, High, XHigh, Max | High | `Ultra`  là bí danh của `Max` |
| **Claude Opus 5** | Low, Medium, High, XHigh, Max | High | Không chấp nhận `Ultra`; cần Claude Code 2.1.219+ |

### 5.6 Kiểm tra khả năng mô hình bên ngoài

Bạn có thể dùng ngôn ngữ tự nhiên để kiểm tra:

```text
is Kimi available to use as Designer?
```

Plugin sẽ kiểm tra registry và báo cáo 4 trạng thái:

1. **supported**：Kimi K3 being hỗ trợ
2. **configured**：Kimi K3 đã được cấu hình
3. **locally ready**：Kimi K3 sẵn sàng trong workspace hiện tại
4. **callable now**：Kimi K3 đã được xác minh gọi

### 5.7 Cấu hình mô hình bên ngoài (ví dụ Kimi K3)

#### Bước 1: Cấu hình ngoài vai trò

```text
$codex-orchestration:codex-orchestration configure external role researcher with OpenRouter model moonshotai/kimi-k3 at max; job: gather evidence and cite sources
```

#### Bước 2: Xác thực

Plugin sẽ hiển thị prompt ẩn trong terminal, hướng dẫn bạn lưu API key vào OS credential store. **Đừng bao giờ dán API key vào Codex chat!**

#### Bước 3: Gate 0 probe

Bạn phải **được phép rõ ràng trả phí** cho một lần probe đã cô lập:

```bash
python3 <skill-dir>/scripts/external_configurator.py \
  --codex-bin <codex-binary-path> \
  gate0 --provider openrouter --model moonshotai/kimi-k3 --effort max --acknowledge-billing
```

#### Bước 4: Tạo vai trò

```bash
python3 <skill-dir>/scripts/external_configurator.py connect \
  --role researcher \
  --purpose "Gather evidence from the bounded packet and cite sources." \
  --provider openrouter \
  --model moonshotai/kimi-k3 \
  --effort max --apply
```

#### Bước 5: Khởi động lại

Hoàn tất → **bắt buộc khởi động lại Codex và mở nhiệm vụ mới**。

#### Bước 6: Gọi vai trò

```text
$codex-orchestration:codex-orchestration call researcher at max — review this bounded research packet
```

### 5.8 Trạng thái và bảo trì

| Lệnh | Chức năng |
|------|----------|
| `status` | Xem cài đặt routing hiện tại |
| `status --require-effective` | Kiểm tra cài đặt có thực sự có hiệu lực không |
| `repair` | Sửa chữa khi hints bị lệch |
| `--update` | Cập nhật plugin |
| `disable` | Khôi phục về trạng thái trước khi cài đặt |

### 5.9 Designer: Kimi K3 Quick Label

Nếu Kimi K3 đã sẵn sàng, bạn có thể dùng cú pháp rút gọn:

```text
$codex-orchestration:codex-orchestration Planner: Claude Fable 5 High, Designer: Kimi K3
```

### 5.10 Dùng với Codex Goals

Tạo một Codex Goal bình thường, sau đó nói với Codex:

```text
Please use the saved codex-orchestration workflow until this Goal completes.
```

### 5.11 Bảo mật

#### Cách an toàn lưu trữ thông tin đăng nhập

1. **Không bao giờ** dán API key vào Codex chat
2. **Không bao giờ** ghi key vào file cấu hình、source code、Git、log
3. **Cách đúng**: Qua OS credential store（macOS Keychain / Linux Secret Service / Windows Credential Manager）

---

## 6. Cài đặt môi trường phát triển

```bash
# Clone
git clone https://github.com/Cjbuilds/Codex-Orchestration.git
cd Codex-Orchestration

# Cài đặt dev dependencies
python3 -m pip install -r requirements-dev.txt

# Biên dịch & lint
python3 -m compileall -q plugins tests scripts
python3 -m ruff check plugins tests scripts

# Chạy tests
python3 -m unittest discover -s tests -v
python3 tests/plugin_lifecycle_smoke.py
python3 scripts/release_check.py
```

### 6.2 Yêu cầu phiên bản

- **Python**：3.11+
- **Codex Desktop**：0.144.0-alpha.4+
- **Claude Code**：2.1.219+（hỗ trợ Opus 5）

---

## 7. Kết luận

Codex-Orchestration là một **plugin quản lý đội nhóm AI rất đột phá**。Nó không chỉ giải quyết vấn đề "giới hạn của mô hình đơn" — mà còn thông qua 3 nguyên tắc kiến trúc quan trọng, làm cho hợp tác đa mô hình trở nên an toàn và có thể kiểm soát：

### 7.1 Ba nguyên tắc đột phá

1. **Định tuyến dựa trên vai trò**：Phân bổ mô hình khác nhau vào Planner / Advisor / Designer / Executor，tối đa hóa điểm mạnh của từng nhà cung cấp
2. **Tích hợp mô hình bên ngoài một cách an toàn**：OpenRouter + OS credential store + Gate 0 probe — mang an toàn Kimi K3 vào Codex
3. **Định tuyến dựa trên chính sách**: Codex vẫn là CEO；định tuyến là "đề xuất", không phải "ép buộc"

### 7.2 Ba giá trị mang lại

1. **Khả năng lập kế hoạch mạnh mẽ hơn**：Fable 5 giỏi lập kế hoạch — hãy để nó lo phần này
2. **Kiểm soát chất lượng nghiêm ngặt hơn**：Opus 5 giỏi review — review độc lập ngăn chặn tự review
3. **Tốc độ triển khai nhanh hơn**：Luna nhanh — hỗ trợ thực thi song song

### 7.3 Trí tuệ của nhà thiết kế

Từ production-readiness audit, nhà thiết kế luôn chọn **fail-closed** thay vì **convenience-first**:

- **Bảo mật thông tin**：Key không bao giờ trong chat/code/cấu hình/Git/log — luôn dùng OS credential store
- **Bảo mật định tuyến**：Cross-provider cần cấu hình thủ công — ngăn ngừa sử dụng provider chưa ủy quyền
- **Bảo mật review**：Planner  và Advisor phải khác model — ngăn chặn "tự review"
- **Bảo mật cập nhật**：Plugin tự động cập nhật cần xác minh canonical source — ngăn ngừa thay thế độc hại

Dự án này thể hiện một cách suy nghĩ rất chín chờ: **không phải "có thể làm gì", mà là "không thể làm gì"**。Trong thời đại AI agent ngày càng tự động, triết lý "tin cậy nhưng kiểm chứng"、"tiện lợi nhưng an toàn" này sẽ trở thành chuẩn mực cho hợp tác đa mô hình.

---

## 8. Tóm tắt các quan sát

| Quan sát | Nguồn | Kết luận |
|----------|-------|----------|
| **Đa mô hình ≠ Mô hình đơn mạnh hơn** | README | Phân bổ model khác nhau vào vai trò khác nhau hiệu quả hơn là tối đa hóa model đơn |
| **Review trước khi code** | Sơ đồ quy trình | Advisor review là "cổng gating kế hoạch"，không phải bảo đảm triển khai |
| **Mô hình bên ngoài cần kiểm toán nghiêm ngặt** | production-readiness audit | Không thể dùng "URL tùy ý" làm provider — phải là bundled manifest được review |
| **Zero-retention API key là chuẩn** | CHANGELOG v0.6.0 | Key không bao giờ lưu trong chat/code/Git/cấu hình/log |
| **Codex luôn là người chịu trách nhiệm** | SKILL.md | Plugin không thay thế Codex — chỉ định tuyến |
| **Fail-closed thắng hơn convenience** | Auditor | Tất cả ranh giới bảo mật đều fail-closed |
| **Tiến độ bản cập nhật theo bảo mật** | CHANGELOG | v0.5→0.6: bảo mật thông tin；v0.7→0.8: sealed CLI transport；v0.9: Opus 5 + 8 vòng review |
| **Trạng thái có thể quan sát thắng hơn lời hứa** | providers-and-models.md | Routing có trạng thái rõ ràng (installed/effective/accepted/confirmed) |
