---
title: "PRO-LONG Phân Tích Sâu: Bộ Nhớ Chương Trình Hóa Cho Suy Luận Dài Hạn"
description: "Phân tích toàn diện về PRO-LONG — một khuôn khổ bộ nhớ chương trình hóa tối giản cho các tác tử LLM. Khám phá sâu về triết lý thiết kế, kiến trúc nhật ký tệp đơn, cơ chế truy xuất dựa trên mã, thành tựu đột phá trên ARC-AGI-3, và tại sao nó đại diện cho mô hình tương lai của hệ thống bộ nhớ tác tử."
date: "2026-08-08"
author: "TopDigg Research Team"
tags: ["PRO-LONG", "Tác tử LLM", "Bộ nhớ chương trình hóa", "Suy luận dài hạn", "ARC-AGI-3", "Quản lý ngữ cảnh", "Nguồn mở", "AI", "Fable", "Bộ nhớ tác tử"]
categories: ["Phân tích sâu"]
keywords: ["PRO-LONG", "Bộ nhớ chương trình hóa", "Tác tử LLM", "Suy luận dài hạn", "ARC-AGI-3", "Quản lý ngữ cảnh", "Hệ thống bộ nhớ tác tử", "Truy xuất dựa trên mã"]
---

> **PRO-LONG** là một khuôn khổ bộ nhớ chương trình hóa tối giản cho các tác tử LLM, thực hiện suy luận dài hạn thông qua nhật ký tệp đơn và truy xuất dựa trên mã. Phân tích toàn diện này bao gồm kiến trúc dự án, triết lý thiết kế, hướng dẫn thực hành và những hiểu biết cốt lõi về hệ thống bộ nhớ tác tử.

---

## 1. Tổng Quan Dự Án

### 1.1 PRO-LONG Là Gì?

PRO-LONG là một khuôn khổ quản lý ngữ cảnh tối giản được thiết kế cho các tác vụ dài hạn. Ý tưởng cốt lõi của nó đơn giản một cách tinh tế:

1. **Ghi lại mọi quan sát, hành động và kết quả vào một tệp `log.txt` được cấu trúc duy nhất**
2. **Tác tử truy xuất và suy luận lịch sử này một cách chương trình hóa (grep, Python)**
3. **Không có tác tử con, không có cơ chế truy xuất chuyên biệt, prompt hệ thống chỉ khoảng 30 dòng**

Đây không phải là một hệ thống bộ nhớ phức tạp khác. Triết lý thiết kế của PRO-LONG là **chủ nghĩa tối giản** — đạt được quản lý bộ nhớ hiệu quả nhất với ít mã nhất.

### 1.2 Tính Năng Cốt Lõi

| Tính Năng | Chi Tiết |
|-----------|----------|
| **Nhật Ký Tệp Đơn** | Tất cả lịch sử được lưu trữ trong một tệp `log.txt` |
| **Truy Xuất Dự Trên Mã** | Tác tử sử dụng grep, Python và các công cụ khác để tìm kiếm lịch sử một cách chương trình hóa |
| **Prompt Tối Giản** | Prompt hệ thống chỉ khoảng 30 dòng, không có hướng dẫn phức tạp |
| **Hỗ Trợ Đa Backend** | Hỗ trợ cả hai backend OpenAI Codison và Claude Code |
| **Docker Sandbox** | Thực thi trong môi trường container cô lập để đảm bảo an toàn |
| **Đột Phá ARC-AGI-3** | Đạt 97.4% best@2 trên ARC-AGI-3 |

### 1.3 Khái Niệm Trọng Tâm

#### Bộ Nhớ Chương Trình Hóa — Dạy Tác Tử "Cách Tìm Kiếm"

Các hệ thống bộ nhớ tác tử truyền thống thường sử dụng hai chiến lược:

1. **Tiêm Ngữ Cảnh**: Đặt tất cả thông tin lịch sử trực tiếp vào prompt (gây ra sự bùng nổ token)
2. **Truy Xuất Vector**: Sử dụng mô hình nhúng để truy xuất lịch sử liên quan (thêm độ phức tạp và độ trễ)

PRO-LONG đề xuất chiến lược thứ ba: **bộ nhớ chương trình hóa**. Tác tử có thể tìm kiếm và phân tích lịch sử bằng các công cụ như grep và script Python, giống như lập trình viên thực hiện.

Ưu điểm của cách tiếp cận này:
- **Tính Đầy Đủ**: Bảo toàn lịch sử đầy đủ mà không mất bất kỳ thông tin nào
- **Tính Chính Xác**: Truy xuất dựa trên mã chính xác hơn truy xuất ngữ nghĩa
- **Tính Giải Thích Được**: Quá trình truy xuất của tác tử minh bạch và có thể gỡ lỗi
- **Không Có Chi Phí Bổ Sung**: Không cần mô hình nhúng hoặc cơ sở dữ liệu vector

#### Nhật Ký Tệp Đơn — Đơn Giản Là Hiệu Quả Nhất

PRO-LONG lưu trữ tất cả thông tin trong một tệp `log.txt` duy nhất, bao gồm:
- Trạng thái bảng ban đầu
- Trạng thái bảng sau mỗi hành động
- Phân tích và suy luận của tác tử
- Kết quả thực thi hành động

Thiết kế này có vẻ "ngây thơ" nhưng thực tế rất thông minh:
- **Không Mất Thông Tin**: Bảo toàn đầy đủ tất cả lịch sử
- **Đơn Giản và Đáng Tin Cậy**: Không có cơ chế đồng bộ hóa hoặc lập chỉ mục phức tạp
- **Truy Xuất Hiệu Quả**: grep hoạt động xuất sắc trên các tệp lớn

#### Prompt 30 Dòng — Tin Tưởng Khả Năng Của Tác Tử

Prompt hệ thống của PRO-LONG chỉ khoảng 30 dòng và không bao gồm:
- Hướng dẫn suy luận phức tạp
- Hướng dẫn chiến lược chi tiết
- Yêu cầu định dạng tác vụ cụ thể

Nó chỉ cho tác tử biết:
1. Mục tiêu của bạn là gì (giải câu đố)
2. Lịch sử được lưu trữ ở đâu (`log.txt`)
3. Cách truy xuất lịch sử (sử dụng mã)
4. Cách xuất hành động (ghi `actions.json`)

Thiết kế tối giản này thể hiện sự tin tưởng vào khả năng của tác tử — để tác tử tự quyết định cách truy xuất và suy luận.

---

## 2. Triết Lý Thiết Kế

### 2.1 Chủ Nghĩa Tối Giản — Ít Hơn Là Nhiều Hơn

Triết lý thiết kế cốt lõi của PRO-LONG là **chủ nghĩa tối giản**. Trong khi các hệ thống bộ nhớ khác liên tục tăng thêm độ phức tạp, PRO-LONG chọn giải pháp đơn giản nhất:

- Một tệp lưu trữ tất cả lịch sử
- Một prompt cho tác tử biết cách sử dụng nó
- Một bộ công cụ để tác tử tự truy xuất

Ưu điểm của thiết kế này:
- **Dễ Hiểu**: Bất kỳ ai cũng có thể thấy hệ thống hoạt động như thế nào
- **Dễ Gỡ Lỗi**: Khi có vấn đề, chỉ cần kiểm tra tệp nhật ký
- **Dễ Mở Rộng**: Thêm tính năng mới chỉ cần thay đổi định dạng nhật ký

### 2.2 Tin Tưởng Tác Tử — Để Mã Nói Lên Tất Cả

PRO-LONG không cố gắng "dạy" tác tử cách suy luận. Nó tin tưởng khả năng của tác tử và chỉ cung cấp:
- Quyền truy cập lịch sử (hệ thống tệp)
- Công cụ truy xuất (grep, Python)
- Định dạng xuất (JSON)

Tác tử có thể:
- Sử dụng bất kỳ chiến lược truy xuất nào
- Viết bất kỳ script phân tích nào
- Áp dụng bất kỳ phương pháp suy luận nào

Thiết kế này thể hiện sự tự tin vào khả năng mã hóa của LLM hiện đại.

### 2.3 Chương Trình Hóa Vượt Trội Ngữ Nghĩa — Tính Chính Xác Vượt Hơn Tính Mơ Hồ

Các hệ thống bộ nhớ truyền thống sử dụng truy xuất ngữ nghĩa (tương đồng nhúng), nhưng PRO-LONG chọn truy xuất chương trình hóa (grep, Python).

Lý do:
- **Khớp Chính Xác**: grep có thể tìm chính xác các dòng chứa mẫu cụ thể
- **Truy Vấn Cấu Trúc**: Python có thể phân tích định dạng nhật ký và thực hiện truy vấn phức tạp
- **Không Có Độ Trễ**: Không cần tính toán nhúng hoặc tìm kiếm vector
- **Có Thể Giải Thích Được**: Quá trình truy xuất của tác tử hoàn toàn minh bạch

---

## 3. Hướng Dẫn Chi Tiết

### 3.1 Cài Đặt Và Thiết Lập

#### Yêu Cầu

- Python 3.12 (khuyến nghị)
- Docker

#### Các Bước Cài Đặt

```bash
# Clone kho lưu trữ
git clone git@github.com:alexisfox7/PRO-LONG.git
cd PRO-LONG

# Tạo môi trường ảo
python -m venv .venv
source .venv/bin/activate

# Cài đặt phụ thuộc
pip install -e .
```

#### Xây Dựng Docker Image

```bash
# Backend Codex
docker build -t rgb-agent/codex-sandbox:latest docker/codex-sandbox
docker build -t rgb-openai-proxy docker/openai-proxy

# Backend Claude Code
docker build -t rgb-agent/claude-sandbox:latest docker/claude-sandbox
docker build -t rgb-anthropic-proxy docker/anthropic-proxy
```

#### Thiết Lập Biến Môi Trường

Tạo tệp `.env`:

```
ARC_API_KEY=...
ANTHROPIC_API_KEY=...   # backend claude-code
OPENAI_API_KEY=...      # backend codex
```

### 3.2 Sử Dụng Cơ Bản

#### Chạy Đánh Giá

```bash
# Chạy tất cả trò chơi với backend Codex
prolong-swarm --suite all -m gpt-5.5 --max-actions 500

# Chạy tất cả trò chơi với backend Claude Code
prolong-swarm --suite all --backend claude-code -m claude-opus-4-6

# Chạy trò chơi cụ thể
prolong-swarm --game ls20,ft09 -m gpt-5.5
```

#### Các Tham Số Chính

| Tham Số | Mặc Định | Mô Tả |
|---------|-----------|-------|
| `--backend` | `codex` | Backend: `codex` hoặc `claude-code` |
| `--suite` | — | Bộ trò chơi: `ls20`, `vc33`, `ft09` hoặc `all` |
| `--game` | — | Tên trò chơi hoặc ID cách nhau bởi dấu phẩy |
| `--max-actions` | 500 | Số hành động tối đa mỗi trò chơi |
| `--model`, `-m` | `claude-opus-4-6` | Mô hình cơ sở |
| `--effort` | `high` | Mức độ nỗ lực (backend claude-code) |
| `--reasoning-effort` | `none` | Nỗ lực suy luận (backend codex) |
| `--operation-mode` | `online` | `online` / `offline` / `normal` |

### 3.3 Điều Kiện Bộ Nhớ

Quyền truy cập lịch sử trò chơi của tác tử được kiểm soát bởi `--log-window` và `--workspace`:

| Điều Kiện | Cờ | Lịch Sử Khả Dụng |
|-----------|-----|-------------------|
| **prolong** | (mặc định) | Nhật ký trò chơi đầy đủ |
| **lw25** | `--log-window 25` | 25 phần hành động cuối cùng của nhật ký |
| **no-log (in-prompt)** | `--log-window -1` | Không có tệp nhật ký; bảng hiện tại được thêm vào prompt |
| **stateless** | `--workspace stateless` | Nhật ký đầy đủ, nhưng workspace bị xóa mỗi lần gọi |

### 3.4 Hiểu Prompt Hệ Thống

Prompt hệ thống của PRO-LONG rất ngắn gọn, nội dung cốt lõi:

```python
SYSTEM_PROMPT = """
You are a coding agent playing a grid-based puzzle game by writing Python action plans.

Your primary objective is to solve all levels in the game. Your secondary objective is to minimize total cumulative actions used.

`/workspace/logs.txt` is the game log: action headers, tool calls, board states, and your own prior analyses. Parse it **programmatically**, as reading full 64x64 board states from prompt can introduce precision errors.

**Tools**: Read, Write, Edit, Bash, Grep, Glob.

**Workspace**: `/workspace/` persists across calls. `actions.json` is cleared each call; other files accumulate.

**Response format**: a strategic briefing, then
[PLAN]
<2-3 sentence action plan>

**Write `/workspace/actions.json`** with a JSON object `{"actions": ["ACTION6(30,40)", "ACTION1", "RESET"]}` — a list of 1–{action_cap} actions to execute in order.
"""
```

Các điểm chính của prompt này:
1. **Mục Tiêu Rõ Ràng**: Giải câu đố + tối thiểu hóa số hành động
2. **Vị Trí Bộ Nhớ Chỉ Định**: `/workspace/logs.txt`
3. **Phương Thức Truy Xuất Chỉ Định**: Chương trình hóa (grep, Python)
4. **Định Dạng Xuất Chỉ Định**: `actions.json`

### 3.5 Hệ Thống Hành Động

PRO-LONG hỗ trợ các hành động sau:

| Hành Động | Mô Tả |
|-----------|-------|
| `ACTION1` | Lên |
| `ACTION2` | Xuống |
| `ACTION3` | Trái |
| `ACTION4` | Phải |
| `ACTION5` | Phím cách / tương tác |
| `ACTION6(x,y)` | Nhấn cột x (0-63), hàng y (0-63) |
| `ACTION7` | Hoàn tác |
| `RESET` | Đặt lại cấp độ (số hành động vẫn được tính) |

### 3.6 Kết Quả Xuất

Kết quả đánh giá được ghi vào thư mục `evaluation_results/`. Thư mục `scorecards/` chứa bảng điểm trực tuyến chính thức.

---

## 4. Phân Tích Sâu Kiến Trúc Cốt Lõi

### 4.1 Cấu Trúc Dự Án

```
prolong_agent/
├── agent/
│   ├── base.py               # Kiến trúc cơ sở
│   ├── codex_agent.py        # Backend Codex CLI
│   ├── claude_code_agent.py  # Backend Claude Code
│   ├── swarm.py              # Điểm vào CLI
│   ├── action_queue.py       # Thực thi hành động
│   ├── game_state.py         # Định dạng bảng/nhật ký
│   └── prompts.py            # Mẫu prompt (~30 dòng)
├── environment/
│   ├── arcagi3.py            # API wrapper ARC-AGI-3
│   ├── runner.py             # Vòng lặp trò chơi
│   └── config.py
├── metrics/
└── utils/
```

### 4.2 Thành Phần Cốt Lõi

#### Kiến Trúc Cơ Sở Của Tác Tử

```python
class BaseAgent:
    """Lớp tác tử cơ sở: định nghĩa giao diện chuẩn"""
    
    def __init__(self, model: str, workspace: str):
        self.model = model
        self.workspace = workspace
        self.log_path = f"{workspace}/logs.txt"
    
    def act(self, observation: dict) -> list[str]:
        """Trả về danh sách hành động dựa trên quan sát"""
        # 1. Ghi quan sát vào nhật ký
        # 2. Đọc nhật ký
        # 3. Sử dụng mô hình để tạo hành động
        # 4. Ghi actions.json
        pass
```

#### Định Dạng Nhật Ký

```log
[INITIAL BOARD STATE]
<Trạng thái bảng 64x64>

[ACTION1]
Tool call: bash("python3 -c '...'")

[POST-ACTION BOARD STATE]
<Trạng thái bảng đã cập nhật>

[ACTION2]
Tool call: grep("pattern", "/workspace/logs.txt")
...
```

#### Thực Thi Hành Động

```python
class ActionQueue:
    """Hàng đợi hành động: thực thi hành động theo thứ tự"""
    
    def execute(self, actions: list[str]) -> dict:
        results = []
        for action in actions:
            result = self._run_action(action)
            results.append(result)
        return {"results": results, "total": len(results)}
```

### 4.3 Cơ Chế Truy Xuất

Cơ chế truy xuất của PRO-LONG hoàn toàn dựa vào khả năng mã hóa của tác tử:

```python
# Các phương thức truy xuất khả dụng cho tác tử

# 1. Tìm kiếm mẫu cụ thể bằng grep
grep -n "INITIAL BOARD STATE" /workspace/logs.txt

# 2. Phân tích nhật ký bằng Python
python3 -c "
import re
with open('/workspace/logs.txt') as f:
    content = f.read()
boards = re.findall(r'\[POST-ACTION BOARD STATE\](.*?)\[', content, re.DOTALL)
print(f'Found {len(boards)} board states')
"

# 3. Phân tích thống kê
python3 -c "
with open('/workspace/logs.txt') as f:
    lines = f.readlines()
actions = [l for l in lines if l.startswith('[ACTION')]
print(f'Total actions: {len(actions)}')
"
```

### 4.4 Dữ Liệu Hiệu Suất

Theo bài báo và đánh giá chính thức:

| Chỉ Số | Dữ Liệu |
|--------|----------|
| **ARC-AGI-3 best@2** | 97.4% (Fable 5) |
| **Cải Thiện Trung Bình** | +18.0 điểm phần trăm so với tác tử cơ sở |
| **Hiệu Suất Token** | Ít hơn 4.2-5.8 lần so với khuôn khổ chuyên biệt |
| **Tổng Chi Phí** | $1,750 (25 lần chạy Fable 5) |
| **pass@1 cao nhất** | 76.1% |

---

## 5. Tóm Tắt Hiểu Biết

### 5.1 Tại Sao PRO-LONG Quan Trọng

PRO-LONG đại diện cho một sự chuyển đổi mô hình quan trọng trong hệ thống bộ nhớ tác tử. Trong khi các hệ thống khác liên tục tăng thêm độ phức tạp, PRO-LONG chứng minh **sức mạnh của chủ nghĩa tối giản**.

**Ba Hiểu Biết Cốt Lõi**:

1. **Bộ Nhớ Chương Trình Hóa Vượt Trội Truy Xuất Ngữ Nghĩa**: Để tác tử tìm kiếm lịch sử bằng mã chính xác và hiệu quả hơn truy xuất dựa trên nhúng
2. **Nhật Ký Tệp Đơn Đủ Dùng**: Một tệp `log.txt` có thể lưu trữ tất cả thông tin cần thiết
3. **Tin Tưởng Khả Năng Của Tác Tử**: Prompt 30 dòng đủ để tác tử hoàn thành tự chủ các tác vụ phức tạp

### 5.2 So Sánh Với Các Công Cụ Khác

| Tính Năng | PRO-LONG | LangChain Memory | AutoGPT | BabyAGI |
|-----------|----------|------------------|---------|---------|
| **Phương Thức Bộ Nhớ** | Nhật ký tệp đơn | Cơ sở dữ liệu vector | Đa tệp | Hàng đợi tác vụ |
| **Phương Thức Truy Xuất** | Mã (grep/Python) | Tìm kiếm ngữ nghĩa | Đọc tệp | Sắp xếp theo ưu tiên |
| **Độ Dài Prompt** | ~30 dòng | Phức tạp | Phức tạp | Trung bình |
| **Hiệu Suất Token** | Cực cao | Trung bình | Thấp | Trung bình |
| **ARC-AGI-3** | 97.4% | Chưa kiểm tra | Chưa kiểm tra | Chưa kiểm tra |
| **Nguồn Mở** | ✅ | ✅ | ✅ | ✅ |

### 5.3 Trường Hợp Sử Dụng

**Phù Hợp Nhất**:
- Tác vụ tác tử cần bộ nhớ dài hạn
- Truy vấn lịch sử cần truy xuất chính xác
- Tác vụ suy luận và lập kế hoạch phức tạp
- Kịch bản ứng dụng nhạy cảm với chi phí

**Ít Phù Hợp Hơn**:
- Hội thoại đơn giản một lượt
- Tác vụ không cần bộ nhớ lịch sử
- Tác tử không mã hóa (cần khả năng mã hóa)

### 5.4 Tóm Tắt Triết Lý Thiết Kế

Triết lý thiết kế của PRO-LONG có thể được tóm tắt như sau:

1. **Chủ Nghĩa Tối Giản**: Ít mã nhất, bộ nhớ hiệu quả nhất
2. **Tin Tưởng Tác Tử**: Để tác tử tự quyết định cách truy xuất và suy luận
3. **Chương Trình Hóa Vượt Trội Ngữ Nghĩa**: Khớp chính xác vượt trội tương đồng mờ
4. **Bảo Toàn Đầy Đủ**: Không mất bất kỳ thông tin lịch sử nào
5. **Không Có Chi Phí Bổ Sung**: Không cần mô hình nhúng hoặc cơ sở dữ liệu vector

---

## 6. Lộ Trình

Dựa trên xu hướng dự án và sự phát triển của hệ thống bộ nhớ tác tử:

### Ngắn Hạn (3-6 tháng)
- Hỗ trợ thêm backend LLM
- Cải thiện định dạng nhật ký và hiệu quả truy xuất
- Thêm các tiêu chuẩn đánh giá mới

### Trung Hạn (6-12 tháng)
- Bộ nhớ cộng tác đa tác tử
- Nén nhật ký tăng dần
- Lưu trữ bộ nhớ liên tục qua các phiên

### Dài Hạn (1-2 năm)
- Tác tử quản lý bộ nhớ tự chủ
- Chia sẻ bộ nhớ liên tổ chức
- Khung suy luận dài hạn tổng quát

---

## 7. Kết Luận

PRO-LONG là một khuôn khổ bộ nhớ tác tử đột phá, đạt được thành tựu đột phá thông qua thiết kế tối giản. Nhật ký tệp đơn, truy xuất dựa trên mã, prompt 30 dòng — những thiết kế có vẻ "ngây thơ" này đã đạt độ chính xác 97.4% trên ARC-AGI-3.

**Giá Trị Cốt Lõi**:
- **Chủ Nghĩa Tối Giản**: Ít mã nhất, bộ nhớ hiệu quả nhất
- **Truy Xuất Chương Trình Hóa**: Chính xác, hiệu quả, có thể giải thích
- **Bảo Toàn Đầy Đủ**: Không mất bất kỳ thông tin lịch sử nào
- **Không Có Chi Phí Bổ Sung**: Không cần mô hình nhúng

**Tại Sao Chọn PRO-LONG?**
- Mở và minh bạch (Giấy phép MIT)
- Thiết kế tối giản, dễ hiểu và gỡ lỗi
- Truy xuất dựa trên mã, chính xác và hiệu quả
- Thành tựu đột phá được xác nhận trên ARC-AGI-3

**Bắt Đầu Ngay**:
```bash
# Clone kho lưu trữ
git clone git@github.com:alexisfox7/PRO-LONG.git
cd PRO-LONG

# Cài đặt
python -m venv .venv
source .venv/bin/activate
pip install -e .

# Chạy đánh giá
prolong-swarm --suite all -m gpt-5.5 --max-actions 500
```

---

> **Từ Chối Trách Nhiệm**: Bài viết này dựa trên tài liệu công khai, bài báo và phân tích kỹ thuật của PRO-LONG, nhằm cung cấp những hiểu biết kỹ thuật toàn diện và hướng dẫn thực hành. Trích dẫn bài báo: arXiv:2607.20064.
