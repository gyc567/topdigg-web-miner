---
slug: autohedge-analysis
title: "AutoHedge: Phân tích kiến trúc và hướng dẫn thực hành quỹ đầu cơ đa tác tử tự chủ"
description: "Phân tích chuyên sâu AutoHedge — quỹ đầu cơ đa tác tử tự chủ xây dựng trên framework swarms. Bao gồm: kiến trúc pipeline của 5 tác tử chuyên trách Director/Quant/Risk/Execution/Sentiment, triết lý thiết kế ưu tiên rủi ro, luồng thực thi trên Solana (Jupiter Ultra API), hướng dẫn cài đặt cấu hình chi tiết, cách dùng Python API và CLI, cùng tổng hợp điểm mạnh, hạn chế và bối cảnh áp dụng của dự án."
date: "2026-09-07"
author: "TopDigg"
tags: ["AutoHedge", "Multi-Agent", "AI Agent", "Hedge Fund", "Trading", "Swarms", "Solana", "Risk Management", "Quantitative Trading", "LLM"]
categories: ["Deep Dive"]
keywords: ["AutoHedge", "Đa tác tử", "Quỹ đầu cơ", "AI Agent", "Giao dịch tự chủ", "Framework Swarms", "Quản trị rủi ro", "Solana", "Jupiter", "Giao dịch định lượng", "Triết lý thiết kế", "Pipeline giao dịch"]
---

# AutoHedge: Phân tích kiến trúc và hướng dẫn thực hành quỹ đầu cơ đa tác tử tự chủ

> Tư tưởng cốt lõi:**tái hiện cơ cấu tổ chức của một quỹ đầu cơ bằng một nhóm tác tử AI chuyên trách.** AutoHedge ánh xạ năm vai trò — giám đốc đầu tư, nhà nghiên cứu định lượng, quản lý rủi ro, trader thực thi và nhà phân tích tâm lý thị trường — sang năm tác tử LLM, nối chúng thành một pipeline giao dịch thông qua cơ chế bàn giao (handoff) có cấu trúc. Director tạo luận điểm giao dịch, Quant kiểm chứng bằng số liệu, Risk định cỡ vị thế, Execution sinh thông số lệnh. Khoảng 1.600 dòng code khiến dự án trở thành mẫu nghiên cứu điển hình về "tổ chức hóa LLM".

**Lưu ý rủi ro: đây là phần mềm nguồn mở thực nghiệm ở giai đoạn Beta. Bài viết chỉ phân tích kỹ thuật, không phải lợi khuyên đầu tư. Hãy tự đánh giá rủi ro và tuân thủ pháp lý trước khi chạy bất kỳ hệ thống giao dịch tự động nào với tiền thật.**

## 1. Giới thiệu dự án

### 1.1 Định vị một câu

**AutoHedge là quỹ đầu cơ tự chỰ cấp doanh nghiệp dựa trên tác tử: dùng trí tuệ tập thể (swarm intelligence) điều phối nhiều tác tử AI chuyên trách thực hiện phân tích thị trường, quản trị rủi ro và thực thi lệnh từ đầu đến cuối với can thiệp tối thiểu của con ngưởi.**

### 1.2 Thông tin dự án

| Trường | Giá trị |
|--------|---------|
| GitHub | [The-Swarm-Corporation/AutoHedge](https://github.com/The-Swarm-Corporation/AutoHedge) |
| Đơn vị phát triển | The Swarm Corporation (tác giả: Kye Gomez) |
| Giấy phép | MIT |
| Ngôn ngữ | Python 3.10+ |
| Phiên bản | 0.1.5 (Beta) |
| Phụ thuộc chính | swarms, swarm-models, pydantic, loguru, httpx, solders, yfinance, rich |
| Sàn giao dịch | Solana (hỗ trợ đầy đủ); Coinbase (đang phát triển); các sàn CEX khác (lộ trình) |
| Framework nền tảng | [Swarms](https://github.com/The-Swarm-Corporation/swarms) |

### 1.3 Ranh giới năng lực

- Hỗ trợ: tạo luận điểm giao dịch đa tác tử, phân tích định lượng và tâm lý thị trường, định cỡ vị thế và đánh giá rủi ro, sinh thông số lệnh, truy vấn và hoán đổi token on-chain trên Solana (Jupiter Ultra API), console REPL tương tác.
- Không hỗ trợ: công cụ backtest, giới hạn rủi ro cứng ở cấp tài khoản, hệ thống quản lý lệnh (OMS) cấp production, quản lý danh mục đa tài khoản.

Dự án ở giai đoạn sớm. Nhật ký giao dịch trong `logs/` xuất phát từ các script thực nghiệm market-making trong `experimental/`, không phải kết quả vận hành thật của hệ thống chính.

## 2. Phân tích kiến trúc

### 2.1 Năm tác tử chuyên trách

`autohedge/workers.py` định nghĩa toàn bộ tác tử. Mỗi tác tử gồm ba phần: system prompt (`prompts.py`), model và bộ công cụ.

| Tác tử | Model | Nhiệm vụ | Vai trò con ngưởi tương đương |
|--------|-------|----------|--------------------------------|
| Trading-Director | gpt-4.1 | Tạo luận điểm thị trường, tự phát hiện mã giao dịch từ task, điều phối tác tử phía dưới | Giám đốc đầu tư |
| Quant-Analyst | gpt-4.1 | Chỉ báo kỹ thuật, mô hình thống kê, chỉ số rủi ro VaR/ES, xác suất thành công của lệnh | Nhà nghiên cứu định lượng |
| Risk-Manager | gpt-4.1 | Định cỡ vị thế, drawdown tối đa, mức độ lộ rủi ro thị trường, điểm rủi ro tổng hợp | Quản lý rủi ro |
| Execution-Agent | gpt-4.1 | Loại lệnh, số lượng, giá vào, stop loss, take profit, thờ hạn hiệu lực | Trader thực thi |
| Sentiment-Agent | gpt-4o-mini | Chấm điểm tâm lý tin tức/mạng xã hội (0-1), nhận diện chủ đề, tín hiệu contrarian | Nhà phân tích tâm lý |

### 2.2 Pipeline: cơ chế handoff của Director

Điểm vào chính `AutoHedge.run(task)` chỉ làm một việc: giao task của ngưởi dùng cho Director. Director nắm giữ toàn bộ tác tử phía dưới thông qua tham số `handoffs` của framework swarms:

```
Task ngưởi dùng (ngôn ngữ tự nhiên)
  │
  ▼
Trading-Director ──handoff──▶ Quant-Analyst ──handoff──▶ Risk-Manager ──handoff──▶ Execution-Agent
  │ tạo luận điểm                │ kiểm chứng số liệu          │ định cỡ & chấm rủi ro      │ lệnh có cấu trúc
  ▼
Đầu ra: toàn bộ nhật ký hội thoại (Conversation)
```

Các chi tiết triển khai quan trọng:

1. **Không có danh sách mã giao dịch định trước.** Director tự trích xuất ticker từ task bằng ngôn ngữ tự nhiên (prompt chuyên dụng `DIRECTOR_TICKER_DISCOVERY_PROMPT` yêu cầu model chỉ trả về một mảng JSON). Task có thể là "Analyze NVDA for a 50k allocation" hoặc "Analyze oil market sentiment".
2. **Mỗi tác tử chạy `max_loops=1`.** Mỗi giai đoạn gọi model đúng một lần, không tự lặp. Pipeline một chiều — không có vòng phản hồi.
3. **Nội dung bàn giao tuân theo hợp đồng rõ ràng.** Risk-Manager luôn nhận ba phần "Stock, Thesis, Quant Analysis"; Execution-Agent luôn nhận "Stock, Thesis, Risk Assessment". Mỗi giai đoạn bị buộc xuất các trường có cấu trúc: Quant xuất `technical_score / volume_score / trend_strength / volatility / probability_score / key_levels(support, resistance, pivot)`; Risk xuất cỡ vị thế, drawdown tối đa, mức lộ rủi ro, điểm rủi ro; Execution xuất loại lệnh, số lượng, giá vào, stop loss, take profit, time-in-force.
4. **Prompt có nhận thức thờ gian.** Thờ điểm hiện tại được chèn vào cuối mọi system prompt khi khởi động ("Current date and time (use this as now)"), ngăn model suy luận bằng dữ liệu cũ.
5. **Ghi lại toàn bộ quá trình.** Đối tượng `Conversation` lưu đầu ra của từng vai trò; `output_type` hỗ trợ định dạng trả về `list / dict / str` phục vụ kiểm toán.

### 2.3 Tầng công cụ

`autohedge/tools/` cung cấp công cụ dữ liệu và thực thi, đăng ký tập trung qua `tools_registry.py`:

| Công cụ | Chức năng | Phụ thuộc |
|---------|-----------|-----------|
| `search_tokens` | Tìm kiếm token Solana | Jupiter API |
| `get_token_price` | Giá USD theo địa chỉ mint | Jupiter Price API V3 |
| `execute_trade` | Ký và gửi giao dịch hoán đổi on-chain | Jupiter Ultra API + solders |
| `get_holdings` | Tra cứu tài sản ví | Jupiter Ultra API |
| `get_order` | Tra cứu trạng thái lệnh | Jupiter Ultra API |
| `exa_search` | Tìm kiếm tin tức/tâm lý trên web (gắn cho Sentiment-Agent) | Exa |
| `yahoo_api` / `polygon_api` | Dữ liệu chứng khoán Mỹ (yfinance, Polygon) | yfinance, httpx |

Luồng thực thi trên Solana là hoàn chỉnh: `WALLET_PRIVATE_KEY` được nạp thành Keypair qua `solders`, `execute_trade` chạy luồng "báo giá - ký - gửi" của Jupiter Ultra tại `/ultra/v1`. Lưu ý: ở phiên bản hiện tại, các công cụ giao dịch này chưa được nối vào danh sách công cụ của các tác tử chính — các tác tử chính chỉ xuất văn bản thông số lệnh, bước thực thi thật cuối cùng cần tích hợp thủ công hoặc phát triển thêm.

## 3. Triết lý thiết kế

Sáu nguyên tắc rút ra từ code và tài liệu.

### 3.1 Tổ chức chính là code

Một quỹ đầu cơ con ngưởi phân chia lao động theo chức năng: PM định hướng, quant tạo tín hiệu, risk giới hạn mức lộ rủi ro, trader thực thi. AutoHedge ánh xạ trực tiếp tổ chức đó sang topology tác tử — vai trò định nghĩa bằng prompt, quy trình định nghĩa bằng handoff, quan hệ báo cáo định nghĩa bằng pipeline một chiều (`max_loops=1`). Thiết kế tổ chức trở thành kỹ thuật prompt.

### 3.2 Ưu tiên rủi ro (Risk-First)

Tác tử rủi ro nằm giữa quant và thực thi, là nút bắt buộc trong pipeline. Mọi lệnh phải qua định cỡ vị thế, ước tính drawdown và đánh giá mức lộ rủi ro trước khi được sinh ra. README nói thẳng: "Risk-First Design: Built-in risk management and position sizing before any execution." Đây là nghịch đảo của mô hình nghiệp dư "tín hiệu trước, rủi ro sau" — cửa kiểm soát rủi ro đặt trước thực thi, không phải vá sau.

### 3.3 Đơn trách nhiệm và bàn giao có cấu trúc

Mỗi tác tử chỉ làm một việc, định dạng đầu vào/đầu ra được ghi trong prompt. Việc bàn giao dùng trường cố định (cỡ vị thế, stop loss, điểm xác suất...), và prompt phía dưới nêu rõ sẽ nhận gì — "You will receive Stock, Thesis, Quant Analysis". Cách này hạ giao tiếp giữa các tác tử từ đối thoại tự do xuống giao thức bị ràng buộc, giảm khả năng lan truyền ảo giác.

### 3.4 Điều khiển bằng task, không có danh mục cổ phiếu định trước

Không có whitelist ticker tích hợp sẵn. Director tự phát hiện ticker từ task. Task là "phân tích thị trường dầu" thì hệ thống đi theo hướng vĩ mô; task là "phân tích NVDA" thì đi theo hướng cổ phiếu đơn lẻ. Tính linh hoạt đến từ prompt, không phải cấu hình.

### 3.5 Mở rộng theo module

Prompt tập trung ở `prompts.py` (202 dòng), định nghĩa tác tử ở `workers.py` (93 dòng), công cụ đăng ký qua registry. Thêm sàn giao dịch = thêm một bộ hàm công cụ; thêm vai trò = định nghĩa một tác tử và thêm vào danh sách handoffs. Ranh giới module trùng ranh giới file.

### 3.6 Khả năng kiểm toán cấp tổ chức

Toàn bộ quá trình được loguru ghi lại; hội thoại lưu trong đối tượng Conversation và xuất được ba định dạng. Mục tiêu thiết kế hướng tới "độ tin cậy tổ chức" — mọi quyết định truy vết được, mọi sự cố tái hiện được.

## 4. Hướng dẫn chi tiết

### 4.1 Cài đặt

```bash
pip install -U autohedge
```

Yêu cầu Python 3.10+. Hoặc cài từ mã nguồn:

```bash
git clone https://github.com/The-Swarm-Corporation/AutoHedge.git
cd AutoHedge
pip install -r requirements.txt
```

### 4.2 Cấu hình biến môi trường

Tạo file `.env` ở thư mục gốc (tham khảo `.env.example`):

```bash
# Jupiter API: công cụ giá & tìm kiếm token, lấy key tại https://portal.jup.ag
JUPITER_API_KEY=jupiter_củaban

# LLM (framework swarms yêu cầu giao diện tương thích OpenAI)
OPENAI_API_KEY=openai_củaban
ANTHROPIC_API_KEY=anthropic_củaban

# Thư mục làm việc của agent
WORKSPACE_DIR="agent_workspace"

# Giao dịch Solana: chỉ điền khi cần đặt lệnh thật
WALLET_PRIVATE_KEY=privatekey_solana_củaban
```

Ghi chú: các tác tử chính dùng gpt-4.1 và gpt-4o-mini. CLI in cảnh báo nếu thiếu `OPENAI_API_KEY` khi khởi động. Key Jupiter dùng cho công cụ giá/tìm kiếm; không có key, một số công cụ sẽ gọi API không xác thực hoặc lỗi.

### 4.3 Cách 1: CLI tương tác

```bash
autohedge
```

Khởi động REPL (render bằng rich), hiển thị phiên bản, thư mục làm việc, hướng dẫn và 5 task gần nhất (lưu tại `~/.autohedge/recent_tasks.txt`).

Ví dụ tương tác:

```
> Analyze NVDA for a 50k allocation
```

Nhập bất kỳ task nào là kích hoạt một chu kỳ phân tích giao dịch hoàn chỉnh. Kết quả hiển thị dạng panel (cắt ở 2.000 ký tự). Lệnh:

- `help` / `?` / `h`: hiển thị gợi ý
- `quit` / `exit` / `q`: thoát

Khác: `autohedge --version`; `autohedge help`.

### 4.4 Cách 2: Python API

```python
from autohedge import AutoHedge

trading_system = AutoHedge(
    name="my-fund",
    description="Private Hedge Fund",
)

task = "Analyze the sentiment of oil market and provide a thesis on the overall market position and expected trends."
result = trading_system.run(task=task)
print(result)
```

Tham số của `AutoHedge`:

| Tham số | Mặc định | Tác dụng |
|---------|----------|----------|
| `name` | "autohedge" | Tên hệ thống |
| `description` | "fully autonomous hedgefund" | Mô tả hệ thống |
| `output_dir` | "outputs" | Thư mục đầu ra |
| `output_type` | "list" | Định dạng trả về: `list` / `dict` / `str` |

### 4.5 Tùy biến tối thiểu: đổi model, thêm công cụ, sửa prompt

Mọi thay đổi tập trung ở `workers.py`:

```python
# Đổi model: thay gpt-4.1 bằng tên model tương thích OpenAI bất kỳ
risk_agent = Agent(
    agent_name="Risk-Manager",
    system_prompt=RISK_PROMPT,
    model_name="gpt-4o",        # ← sửa tại đây
    max_loops=1,
)
```

Thêm công cụ: viết hàm trong `tools/`, đăng ký trong `get_tools()` tại `tools_registry.py`, rồi thêm tên hàm vào tham số `tools=[...]` của tác tử mục tiêu.

Sửa prompt: chỉnh hằng số tương ứng trong `prompts.py`. Ví dụ muốn Quant xuất thêm hệ số Sharpe, thêm một dòng vào `QUANT_PROMPT`.

### 4.6 Kết quả mong đợi của một chu kỳ hoàn chỉnh

Với task "Analyze NVDA for a 50k allocation": Director phát hiện mã NVDA và tạo luận điểm thị trường; Quant xuất điểm chỉ báo và vùng hỗ trợ/kháng cự; Risk xuất cỡ vị thế đề xuất và điểm rủi ro; Execution xuất thông số lệnh kèm stop loss và take profit. `Conversation` lưu toàn bộ đầu ra từng vai trò, truy xuất theo tên vai trò qua `output_type="dict"`.

## 5. Quan điểm và kết luận

### 5.1 Giá trị thật của dự án

Giá trị của AutoHedge không nằm ở "kiếm tiền", mà ở một câu trả lởi dễ đọc cho câu hỏi:**hệ thống đa tác tử tổ chức một quy trình nghiệp vụ hoàn chỉnh như thế nào.** Trong 1.600 dòng code có đủ: định nghĩa vai trò, giao thức giao tiếp, điều phối quy trình, nhật ký kiểm toán — mỗi thứ một vị trí cố định. Với ngưởi nghiên cứu orchestration của agent hoặc thiết kế hệ thống đa tác tử của riêng mình, đây là tài liệu giảng dạy cụ thể hơn một bài báo khoa học.

### 5.2 Ba điểm mạnh về kiến trúc

1. **Cửa rủi ro đặt trước.** Tác tử rủi ro là nút bắt buộc của pipeline; nguyên tắc này được ghi vào hợp đồng prompt của mọi giai đoạn — và nó đúng.
2. **Hợp đồng bàn giao rõ ràng.** Mỗi tác tử biết mình nhận gì, xuất gì. Ổn định hơn hẳn cách "một nhóm tác tử thảo luận tự do".
3. **Nhận thức thờ gian.** Chèn thờ điểm hiện tại vào mọi prompt tốn một dòng code, ngăn model giao dịch bằng thông tin cũ quá ngày cắt huấn luyện — chi tiết đặc thù của ngành tài chính.

### 5.3 Hạn chế và rủi ro (phải nhìn thẳng)

1. **Tính chất thực nghiệm.** Phiên bản 0.1.5, nhãn Beta. Các tác tử chính chưa nối với công cụ giao dịch thật; `WALLET_PRIVATE_KEY` chỉ dùng trong script experimental. README tuyên bố đầu ra cấu trúc Pydantic, còn triển khai thực tế là chuỗi văn bản.
2. **Không có công cụ backtest.** Mọi chiến lược cần kiểm chứng lịch sử trước khi vận hành; dự án không cung cấp.
3. **Rủi ro là "khuyến nghị", không phải "ràng buộc".** Cỡ vị thế và stop loss do LLM tạo ra; không có giới hạn cứng cấp tài khoản trong code (ví dụ: cầu dao ngắt lỗ tối đa mỗi ngày). LLM có thể bị prompt injection lừa phóng to vị thế.
4. **Không có vòng phản hồi.** Pipeline chạy một chiều; kết quả của Quant không quay lại Director để sửa luận điểm — lỗi không tự sửa.
5. **Phụ thuộc một framework.** Liên kết chặt với abstraction Agent/Conversation của swarms; chi phí di chuyển cao.
6. **Chi phí.** Mỗi chu kỳ gọi model cấp gpt-4.1 từ 4-5 lần; chạy tần suất cao tốn kém.

### 5.4 Bối cảnh áp dụng

- Tài liệu giảng dạy về kiến trúc đa tác tử và kỹ thuật prompt
- Điểm khởi đầu prototype cho hệ thống giao dịch tự chủ (xây thêm backtest, giới hạn cứng, tích hợp thực thi)
- Phương tiện nghiên cứu sự lan truyền sai số của LLM trong chuỗi ra quyết định tài chính

Không phù hợp: vận hành thật với tiền thật ngay lập tức.

### 5.5 Kết luận

AutoHedge nhét một quỹ đầu cơ vào một gói Python: năm vai trò, một pipeline, một giao thức bàn giao. Triết lý thiết kế của nó — ưu tiên rủi ro, đơn trách nhiệm, bàn giao có cấu trúc, điều khiển bằng task, khả năng kiểm toán — đáng áp dụng cho mọi hệ thống đa tác tử. Mức độ hoàn thiện của phần triển khai nhắc tất cả mọi ngưởi một điều: giữa "kiến trúc đúng" và "hệ thống đáng tin" còn cách nhau backtest, ràng buộc cứng, giám sát và một khối lượng lớn công việc kỹ thuật. Phần trước AutoHedge đã minh họa; phần sau bạn phải tự xây.

## 6. Liên kết tham khảo

- Kho mã nguồn: https://github.com/The-Swarm-Corporation/AutoHedge
- Framework Swarms: https://github.com/The-Swarm-Corporation/swarms
- Tài liệu Jupiter API: https://dev.jup.ag
- Đăng ký key Jupiter: https://portal.jup.ag
