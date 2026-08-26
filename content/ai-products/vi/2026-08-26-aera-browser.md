---
title: "Phân tích Sâu Aera Browser: Nhân viên Tự động trong Trình duyệt — Bán Việc Lặp lại với $20/Tháng"
description: "Aera Browser là trình duyệt tự động local-first trên Chromium ra mắt 12/2025. Mô tả công việc lặp lại bằng ngôn ngữ tự nhiên và Aera chạy theo lịch trong trình duyệt đã đăng nhập của bạn. Stripe-verified MRR $343 / 9 thuê bao / ~1,700 người dùng. Báo cáo bóc tách mô hình kiếm tiền, bậc giá, triết lý thiết kế và giá trị mỗi người dùng mỗi tháng."
date: "2026-08-26"
author: "ERIC"
tags: ["Sản phẩm AI", "Tự động hoá Trình duyệt", "MCP", "Kiếm tiền", "SaaS", "Aera Browser", "Chromium", "Local-First"]
categories: ["Phân tích Sản phẩm AI"]
keywords: ["Aera Browser", "getaera.app", "tự động hoá trình duyệt", "MCP", "Chromium", "TrustMRR", "thuê bao"]
product:
  name: "Aera Browser"
  url: "https://trustmrr.com/startup/aera-browser?ref=eric-kwok-b654e8"
  category: "Công cụ Tự động hoá Trình duyệt AI"
  launch_date: "2025-12"
  revenue: "$343 MRR (2026-08, Stripe-verified) · $3,635 tổng doanh thu"
  users: "~1,700 người dùng · 9 thuê bao trả phí"
  pricing_model: "Free tự host + Pro $20/tháng + Ultra $200/tháng"
  logo: "https://files.stripe.com/links/MDB8YWNjdF8xU2ZScTlMaGhtZ1p0d1NofGZsX2xpdmVfSFRRMUwxYVFBOEtkRjBZT0c0czRCd3FN00eG4pLTYa"
pricing:
  - plan: "Free"
    price: 0
    currency: "USD"
    period: null
  - plan: "Pro"
    price: 20
    currency: "USD"
    period: "month"
  - plan: "Ultra"
    price: 200
    currency: "USD"
    period: "month"
metrics:
  - name: "MRR"
    value: "$343 (2026-08)"
  - name: "Doanh thu 30 ngày"
    value: "$140"
  - name: "Tổng doanh thu"
    value: "$3,635"
  - name: "Thuê bao hoạt động"
    value: "9"
  - name: "Tổng người dùng"
    value: "~1,700"
  - name: "Tỷ lệ chuyển đổi trả phí"
    value: "~0.5% (9/1700 ước tính)"
  - name: "ARPU hỗn hợp"
    value: "~$38/tháng"
  - name: "Domain Rating"
    value: "9/100"
  - name: "Xếp hạng TrustMRR"
    value: "#2108"
  - name: "Thành lập"
    value: "2025-12"
  - name: "Nhà sáng lập"
    value: "Andrew Rivers (Mỹ)"
  - name: "Ngăn xếp"
    value: "Chromium + Node.js + PostgreSQL + Stripe + OpenRouter"
sources:
  - label: "Hồ sơ TrustMRR (có ref)"
    url: "https://trustmrr.com/startup/aera-browser?ref=eric-kwok-b654e8"
  - label: "TrustMRR Markdown"
    url: "https://trustmrr.com/startup/aera-browser.md"
  - label: "Trang chính Aera"
    url: "https://getaera.app"
  - label: "Bảng giá Aera"
    url: "https://getaera.app/pricing"
  - label: "Tính năng Aera"
    url: "https://getaera.app/features"
  - label: "Use cases Aera"
    url: "https://getaera.app/use-cases"
  - label: "Bảo mật Aera"
    url: "https://getaera.app/security"
  - label: "FAQ Aera"
    url: "https://getaera.app/faq"
---

> **Link sản phẩm**: [https://trustmrr.com/startup/aera-browser?ref=eric-kwok-b654e8](https://trustmrr.com/startup/aera-browser?ref=eric-kwok-b654e8) (có theo dõi referral — cuối bài cũng có)

# Phân tích Sâu Aera Browser: Nhân viên Tự động trong Trình duyệt — Bán Việc Lặp lại với $20/Tháng

## 1. Mở đầu: Trình duyệt là Hào Thành Cuối cùng

Không gian tự động hoá AI đang chật cứng: ChatGPT Scheduled Tasks, Claude Computer Use, BrowserBase headless. **Aera Browser** ra mắt 12/2025 chọn con đường ngốc nhất mà đúng nhất — **không headless đám mây, không plugin, chỉ là một trình duyệt Chromium biết chạy theo lịch**.

> **Aera is a browser that executes.** Mô tả một việc lặp lại bằng tiếng người và Aera chạy nó theo lịch trong trình duyệt đã đăng nhập của bạn: đọc trang, kéo số, điền form, báo cáo thay đổi. Thức dậy là việc đã xong.

Snapshot TrustMRR 2026-08-26: **MRR $343, 9 thuê bao, ~1,700 users, $3,635 lifetime, Domain Rating 9**. Con số nhỏ nhưng mẫu rất thuần: một indie Mỹ, Stripe-verified, nền Chromium, MCP, local-first. Một lát cắt micro-SaaS giai đoạn rất sớm.

---

## 2. Tổng quan Dự án

**Aera = Trình duyệt thực Chromium + Bộ lập lịch ngôn ngữ tự nhiên + Kết nối MCP + Lưu trữ local-first.** Tagline: *The browser that does the work.* Nhóm người dùng: Developers, AI enthusiasts, workflow power-users.

### Năng lực Cốt lõi

| Năng lực | Mô tả |
|---|---|
| **Tự động hoá ngôn ngữ tự nhiên** | Mô tả việc, agent click, gõ, điều hướng trang thực |
| **Lập lịch & tác vụ thường trực** | Biến mọi yêu cầu thành workflow theo lịch, có lịch sử & thông báo |
| **Tích hợp MCP** | Kết nối Cursor, Claude Desktop, Gemini CLI |
| **Subagent song song** | Nhiều agent hợp tác xử lý việc nhiều bước |
| **Vision** | Hiểu trang phức tạp (bậc trả phí) |
| **Nhập Chrome** | Mang theo password manager, ad blocker, bookmark |
| **Local-first** | Lịch sử/bookmark/cấu hình ở trên máy bạn |

### Đáng tin cậy & Không đáng tin cậy

- **Đáng tin**: đọc, theo dõi thay đổi, kéo số từ dashboard, quét inbox, điền form thường, lặp theo lịch.
- **Không đáng tin**: rich text / code editor — thử nghiệm làm hỏng nội dung.
- **Một routine phạm vi hẹp > chuỗi dài qua nhiều site lạ**.
- **Không tự động checkout** — cố ý không làm thanh toán.

---

## 3. Triết lý Thiết kế: 5 Nguyên tắc

**1. Local-first nhưng trung thực về suy luận** — dữ liệu ở máy, suy luận qua OpenRouter ra ngoài; Free qua Ollama mới thực sự ở lại máy. Trang bảo mật liệt kê mọi thứ xuất ra và thừa nhận **không có SOC 2**.

**2. Trình duyệt của bạn, không phải trang trại bot** — chạy trên profile thực, không fingerprint headless, giảm rủi ro khoá tài khoản.

**3. Một câu nói > một bộ selector** — đọc lại ngữ nghĩa mỗi lần chạy, chống redesign. Đánh đổi: không tất định.

**4. Lập lịch là công dân hạng nhất** — Describe → Schedule → History → Notify.

**5. Tiêu chuẩn mở, không khoá mô hình** — Chromium + MCP + endpoint tương thích OpenAI. Free bắt tự host để đẩy nâng cấp.

---

## 4. Hướng dẫn Chi tiết: 7 Bước tới Nhân viên Tự động Đầu tiên

### Bước 0 — Chuẩn bị

OS chạy được Chrome (4GB tối thiểu, 8GB cho nặng). Free cài Ollama trước.

### Bước 1 — Tải & Nhập

Tải tại `getaera.app/download` → Import from Chrome → đăng nhập.

### Bước 2 — Cấu hình Mô hình

- Free: Settings → Models → `http://localhost:11434`
- Pro/Ultra: chọn mô hình hosted (GPT-4o, Claude 3.5)

### Bước 3 — Việc đầu tiên trong 60 giây

Sidebar: "Mỗi ngày 9h kéo 3 số từ Stripe vào dòng 1 Google Sheet" → Run → chuyển thành lịch.

### Bước 4 — Đặt lịch

Chọn tần suất, thông báo, retry. Xem Run History.

### Bước 5 — Kết nối MCP

Bật MCP Server → thêm vào Cursor / Claude Desktop → kích hoạt tự động trình duyệt từ IDE.

### Bước 6 — Marketplace Kỹ năng

Cài Skill cộng đồng hoặc xuất bản Skill của bạn.

### Bước 7 — Vận hành

Thất bại dừng ngay, đọc log, trang nhạy cảm dùng model local, cập nhật vài ngày một lần.

---

## 5. Cách Aera Kiếm Tiền

| Gói | Giá | Năm | Bán gì | Ý đồ |
|---|---|---|---|---|
| **Free** | $0 | — | Model tự host | **Phễu thu hút** — cho bạn nếm "đau local" |
| **Pro** | $20/tháng | $220/năm | Hosted frontier + Vision + subagent + MCP | **Bò sữa**, ngưỡng $20 |
| **Ultra** | $200/tháng | $2200/năm | Pro + 11x hạn mức | **Cá voi**, lọc người dùng nặng |

**5 chiêu có thể sao chép**: Free tự host đẩy nâng cấp, phân tầng $20+$200, bán mức dùng không bán ghế, thuê bao bán mô hình, hệ sinh thái MCP thu phí tương lai.

---

## 6. Phân tích Người dùng Cốt lõi: Mỗi Người dùng Đóng góp Bao nhiêu $ mỗi Tháng?

| Bậc | Người dùng | $/người/tháng | Tổng/tháng | % MRR | Công việc điển hình |
|---|---|---|---|---|---|
| **Free** | ~1691 | $0 | $0 | 0% | Thử demo rồi rời |
| **Pro $20** | 8 ước tính | $20 ($18.33 năm) | ~$160 | ~47% | Báo cáo hàng ngày, nháp social |
| **Ultra $200** | 1 ước tính | $200 ($183 năm) | ~$183 | **~53%** | Báo cáo thường trực + đồng thời |

**Suy luận**: $343/9 = ARPU $38. 8 Pro + 1 Ultra ≈ $360 khớp thực tế. Toàn Pro chỉ $180 → **ít nhất một cá voi**.

| Hạng | Bậc | $/tháng | $/năm | ROI thời gian ($50/h) |
|---|---|---|---|---|
| 🥇 | Ultra $200 | $200 | $2,200 | Tiết kiệm 2h/ngày = $3k/tháng, 15x |
| 🥈 | Pro $20 | $20 | $220 | Tiết kiệm 1h/ngày = $1.5k/tháng, 75x |

**LTV (24 tháng)**: Pro $480 / Ultra $4,800. Chuyển đổi 0.5% là nút thắt — 2% sẽ là MRR $1,360 (4x).

---

## 7. Quan điểm & Kết luận: 7 Insight

1. Trình duyệt là hào thành cuối 2. Thuê bao bán mô hình không bán trình duyệt 3. Trung thực là GTM 4. 0.5% vừa cơ hội vừa cảnh báo 5. MCP là đòn bẩy tăng trưởng 6. Ultra $200 là bộ lọc 7. Giá $15M là giá cảm xúc

---

## 8. 6 Bài học Có thể Sao chép

1. Trình duyệt miễn phí, trí tuệ trả phí 2. Free bắt tự host 3. Neo $20 + cá voi $200 4. Việc đầu tiên thành công trong 60s 5. Log là sản phẩm 6. MCP trước quảng cáo

---

## 9. Rủi ro

Chuyển đổi đình trệ, chi phí mô hình biến động, không tất định, thiếu chứng nhận tuân thủ, rủi ro solo-founder, bị big tech chèn ép.

---

## 10. Kết luận

Aera là mẫu rất sớm nhưng logic sạch: 1 Chromium + 1 scheduler + 3 bậc giá + $343 MRR. Đáng sao chép: **container miễn phí, trí tuệ trả phí; Free tự host; log có thể kiểm toán; lập lịch là hạng nhất**.

---

> **Link sản phẩm**: [https://trustmrr.com/startup/aera-browser?ref=eric-kwok-b654e8](https://trustmrr.com/startup/aera-browser?ref=eric-kwok-b654e8)
>
> Nguồn: TrustMRR (Stripe-verified) + getaera.app. Ước tính đã ghi chú.

*Snapshot 2026-08-26. Phân tích là quan điểm tác giả.*
