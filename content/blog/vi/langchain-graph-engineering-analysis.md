---
slug: langchain-graph-engineering-analysis
title: "LangGraph Giải Mã Chuyên Sâu: 3 Năm Kỹ Thuật Đồ Thị — Hướng Dẫn Hoàn Chỉnh Xây Dựng Agent Đáng Tin Cậy Bằng Đồ Thị (Ý Tưởng Cốt Lõi + Giới Thiệu Dự Án + Hướng Dẫn Chi Tiết + Triết Lý Thiết Kế)"
description: "Dựa trên bài blog chính thức của LangChain '3 Years of Graph Engineering with LangGraph' (Harrison Chase & Sydney Runkle, 2026-07-22), đây là bản phân tích hoàn chỉnh về mô hình 'kỹ thuật đồ thị (graph engineering)' và khung LangGraph. Ý tưởng cốt lõi: biểu diễn hệ thống agentic dưới dạng đồ thị cho phép bạn (người xây dựng) áp đặt những định kiến (preconceptions) của mình về cách hệ thống nên hoạt động vào các đường dẫn bị ràng buộc hơn, thay vì chỉ dựa vào phán đoán của LLM — giúp kiểm soát hành vi chặt chẽ hơn khi bạn muốn agent đi theo các đường dẫn cụ thể. Giới thiệu dự án: LangGraph là khung điều phối agent mà nhóm LangChain xây dựng ba năm trước; hiện đạt 65M+ lượt tải mỗi tháng, được cả startup và doanh nghiệp lớn sử dụng, phổ biến nhờ cân bằng giữa đường dẫn xác định (deterministic) và bước agentic. Hướng dẫn chi tiết: ba yếu tố của mô hình hóa đồ thị (nút làm việc / cạnh định nghĩa bước tiếp theo / góc nhìn máy trạng thái), khi nào dùng đồ thị (agent hỗ trợ phân loại trước khi trả lời hoặc nâng cấp, agent mã hóa kiểm tra kho lưu trữ trước khi đề xuất thay đổi, quy trình tuân thủ cần phê duyệt trước khi hành động) và khi nào không (các tác vụ bản chất agentic như deep research dùng agent harness/Deep Agents), map-reduce và chuyển đổi động với Send API, và mẫu mới đặt một agent hoàn chỉnh bên trong nút, kèm nghiên cứu tình huống docs agent (Yêu cầu Slack → PR, các nút nằm ở các vị trí khác nhau trên phổ từ xác định đến agentic). Triết lý thiết kế: đồ thị là một kiến trúc nhận thức — giống như prompt mang tri thức miền, đồ thị mã hóa tri thức thế giới của bạn về cách hệ thống nên hoạt động; mô hình chỉ suy luận nơi nó tạo giá trị, phần còn lại do mã xử lý, nên agent rẻ hơn, nhanh hơn và dễ dự đoán hơn. Bài học ba năm: đồ thị agent thường không phải DAG (cần vòng lặp: thử lại lệnh gọi công cụ thất bại, hỏi người dùng thông tin còn thiếu, sửa đổi câu trả lời sau khi xác thực, tạm dừng chờ đầu vào con người); vòng lặp là đồ thị đơn giản (loop engineering là phiên bản đơn giản hơn của graph engineering, và bản thân LangChain được xây trên LangGraph); chuyển đổi động rất quan trọng (thường không biết cần sinh bao nhiêu công việc cho đến lúc chạy — định tuyến động bằng Send)."
date: "2026-08-12"
author: "TopDigg"
tags: ["LangGraph", "Graph Engineering", "AI Agent", "Agent Architecture", "LangChain", "Loop Engineering", "Multi-Agent", "Orchestration", "State Machine", "Cognitive Architecture", "Harness", "Agentic Systems"]
categories: ["Deep Dive"]
keywords: ["LangGraph", "kỹ thuật đồ thị", "Graph Engineering", "AI agent", "kiến trúc agent", "LangChain", "kỹ thuật vòng lặp", "Loop Engineering", "đa agent", "Multi-Agent", "điều phối", "máy trạng thái", "State Machine", "kiến trúc nhận thức", "Cognitive Architecture", "Send API", "Map-Reduce", "Harrison Chase", "xác định", "Agentic"]
---

# LangGraph Giải Mã Chuyên Sâu: 3 Năm Kỹ Thuật Đồ Thị — Hướng Dẫn Hoàn Chỉnh Xây Dựng Agent Đáng Tin Cậy Bằng Đồ Thị

> Ý tưởng cốt lõi: **Biểu diễn hệ thống agentic dưới dạng đồ thị (graph) cho phép bạn, với tư cách người xây dựng, áp đặt những định kiến của mình về cách hệ thống nên hoạt động vào các đường dẫn bị ràng buộc hơn, thay vì chỉ dựa vào phán đoán của LLM.** Kỹ thuật đồ thị (graph engineering) là thuật ngữ mới nhất ra đời từ "nhà máy nội dung AI" của X, nối tiếp prompt engineering, context engineering, harness engineering và loop engineering. Có thể gọi chúng là "từ thông dụng (buzzwords)" — vừa hấp dẫn vừa chính xác — nhưng chúng tồn tại và xuất hiện là có lý do: **chúng mô tả những thách thức thực tế và quyết định thiết kế mà người xây dựng phải đối mặt.** Mục tiêu cuối cùng là khai thác sức mạnh của LLM để làm những việc hữu ích. Dù bạn dùng prompt, agent, loop hay graph, đó chỉ là chi tiết triển khai. Sở dĩ có nhiều thuật ngữ đến vậy là vì **bắt LLM làm việc rất khó** — chúng là một loại phần mềm mới, không bền vững (non-robust) và không xác định (non-deterministic), và chúng ta liên tục thử các chiến lược mới để khiến chúng hoạt động, nên chiến lược mới sinh ra thuật ngữ mới. LangGraph được xây dựng ba năm trước chính từ trực giác này, và hiện đạt **65M+ lượt tải mỗi tháng**, được cả startup và doanh nghiệp lớn sử dụng. Lý do nó phổ biến: nó tìm được sự cân bằng — **cân bằng giữa đường dẫn xác định và bước agentic.** Biểu diễn hệ thống dưới dạng đồ thị, về bản chất, là mã hóa tri thức thế giới của bạn — giống như tri thức miền trong prompt giúp agent của bạn khác biệt với ChatGPT thông thường, đồ thị như một "kiến trúc nhận thức" cũng mang tri thức miền. Kết quả là mã và suy luận của mô hình cộng tác với nhau: **mô hình suy luận nơi nó tạo giá trị, mã xử lý phần còn lại, nên agent rẻ hơn, nhanh hơn và dễ dự đoán hơn.**

---

## 1. Bối cảnh: Thuật ngữ "Kỹ Thuật Đồ Thị" từ đâu ra

### 1.1 Sự ra đời của thuật ngữ

"Kỹ thuật đồ thị (graph engineering)" nổi lên vào cuối tuần tháng 7 năm 2026, khởi nguồn từ một dòng tweet của Peter Steinberger. Đây là thuật ngữ mới nhất ra đời từ nhà máy nội dung AI của X, nối tiếp prompt engineering (kỹ thuật nhắc lệnh), context engineering (kỹ thuật ngữ cảnh), harness engineering (kỹ thuật khung), loop engineering (kỹ thuật vòng lặp).

Dù việc gọi những thuật ngữ này là "từ thông dụng (buzzwords)" vừa hấp dẫn vừa chính xác, chúng tồn tại và xuất hiện là có lý do: **chúng thực sự mô tả những thách thức thực tế và quyết định thiết kế mà người xây dựng phải đối mặt.**

### 1.2 Tại sao lại có nhiều thuật ngữ đến vậy

Suy cho cùng, mục tiêu là khai thác sức mạnh của LLM để làm những việc hữu ích cho chúng ta. Dù bạn dùng prompt, agent, loop hay graph, đó đều là chi tiết triển khai. Sở dĩ có nhiều thuật ngữ đến vậy là vì **bắt LLM làm việc rất khó**:

- Chúng là một loại phần mềm mới, **không bền vững (non-robust), không xác định (non-deterministic)**
- Chúng ta liên tục thử các chiến lược mới để khiến chúng hoạt động đáng tin cậy
- Chiến lược mới → thuật ngữ mới

### 1.3 Ngoài những từ thông dụng: Tại sao đồ thị lại hợp lý

Nói không ngoa, **biểu diễn hệ thống agentic dưới dạng đồ thị là một cách rất hợp lý để khai thác sức mạnh của LLM.** Cụ thể:

> Đồ thị cho phép bạn (người xây dựng) áp đặt những **định kiến (preconceptions)** của mình về cách hệ thống nên hoạt động vào các đường dẫn bị ràng buộc hơn, thay vì chỉ dựa vào phán đoán của LLM. Cụ thể hơn, nó giúp bạn kiểm soát hành vi chặt chẽ hơn khi muốn agent đi theo các đường dẫn cụ thể.

Chính trực giác này đã thúc đẩy LangChain xây dựng LangGraph ba năm trước, như một khung để giúp xây dựng những loại hệ thống agentic này.

### 1.4 Dữ liệu chính

| Chỉ số | Dữ liệu |
|------|------|
| Thời điểm phát hành | Khoảng ba năm trước (khoảng 2023) |
| Lượt tải hàng tháng hiện tại | 65M+ lượt/tháng |
| Người dùng | Startup và doanh nghiệp lớn |
| Điểm bán cốt lõi | Cân bằng giữa đường dẫn xác định và bước agentic |
| Người xây dựng | Đội ngũ LangChain (Harrison Chase và cộng sự) |

---

## 2. Giới Thiệu Dự Án: LangGraph là gì

### 2.1 Định vị trong một câu

LangGraph là **khung điều phối và runtime cấp thấp để xây dựng, quản lý và triển khai các agent có trạng thái (stateful), chạy dài hạn bằng đồ thị (graph).**

### 2.2 Khác biệt với các khung agent khác

Trên thị trường có vô số khung agent. LangGraph phổ biến vì nó **cân bằng giữa đường dẫn xác định (deterministic paths) và bước agentic (agentic steps)**:

- Khung quá tự do (vòng lặp agent thuần túy): mô hình tự quyết định mọi thứ, hành vi khó dự đoán
- Khung quá cứng nhắc (đường ống thuần túy): không xử lý được tác vụ mở, lãng phí năng lực mô hình
- LangGraph: **mã hóa cấu trúc vào đồ thị, giữ sự tự do bên trong các nút** — xác định nơi cần xác định, agentic nơi cần agentic

### 2.3 Định vị của bài tổng kết ba năm

Đây là bài tổng kết chính thức do đội ngũ LangChain (Harrison Chase và Sydney Runkle) công bố ngày 22 tháng 7 năm 2026, tựa đề "3 Years of Graph Engineering with LangGraph" — tóm gọn trong một câu: **ba năm qua chúng tôi xây dựng hệ thống agentic bằng đồ thị; dưới đây là những gì chúng tôi đã học được.**

---

## 3. Hướng Dẫn Chi Tiết: Cách Mô Hình Hóa Agent Thành Đồ Thị

### 3.1 Ba yếu tố của đồ thị

Mô hình hóa agent thành đồ thị, về bản chất, là định nghĩa một **máy trạng thái (state machine)**:

| Yếu tố | Vai trò | Nội dung |
|------|------|------|
| **Nút (Nodes)** | Làm việc | Mã xác định, một lệnh gọi LLM, một lệnh gọi công cụ, hoặc một agent hoàn chỉnh có vòng lặp nội bộ riêng |
| **Cạnh (Edges)** | Định nghĩa điều gì xảy ra tiếp theo | Cạnh xác định (luồng cố định); cạnh có điều kiện (dựa trên kết quả của nút, trạng thái hiện tại hoặc tín hiệu bên ngoài) |
| **Trạng thái (State)** | Dữ liệu chảy qua đồ thị | Di chuyển qua quy trình mà đồ thị định nghĩa, kết nối các bước |

Hiểu đơn giản: **đồ thị định nghĩa quy trình làm việc, trạng thái chảy qua nó, và các cạnh định nghĩa sự chuyển đổi giữa các bước.**

### 3.2 Ví dụ tối thiểu: Agent tri thức có phân loại

Đây là nghiên cứu tình huống cốt lõi trong bài gốc: một agent tri thức dùng ba agent con để tìm kiếm:

- **Agent GitHub**: tìm mã nguồn, issue và pull request
- **Agent Notion**: tìm tài liệu nội bộ và wiki
- **Agent Slack**: tìm các luồng thảo luận liên quan

Quy trình có ba giai đoạn cố định: **phân loại (classify) → tìm kiếm (search) → tổng hợp (synthesize)**.

Mô hình hóa bằng Python API của LangGraph gần như như sau:

```python
from langgraph.graph import StateGraph, END
from typing import TypedDict, Literal

class AgentState(TypedDict):
    query: str
    source: Literal["github", "notion", "slack"]
    results: list

def classify(query: str) -> str:
    """Nút phân loại: quyết định câu hỏi thuộc nguồn tri thức nào (một lần gọi mô hình, không dùng công cụ)"""
    # Dùng LLM phán đoán: câu hỏi về mã → github; tài liệu nội bộ → notion; thảo luận → slack
    return "github"  # giá trị trả về ví dụ

def search_github(state: AgentState) -> AgentState:
    """Nút tìm kiếm: agent GitHub tìm trong mã/issue/PR"""
    return {**state, "results": search_code(state["query"])}

def search_notion(state: AgentState) -> AgentState:
    """Nút tìm kiếm: agent Notion tìm trong tài liệu nội bộ/wiki"""
    return {**state, "results": search_docs(state["query"])}

def search_slack(state: AgentState) -> AgentState:
    """Nút tìm kiếm: agent Slack tìm trong các luồng liên quan"""
    return {**state, "results": search_threads(state["query"])}

def synthesize(state: AgentState) -> AgentState:
    """Nút tổng hợp: kết hợp kết quả tìm kiếm thành câu trả lời cuối (một lần gọi mô hình)"""
    return state

# Xây dựng đồ thị
graph = StateGraph(AgentState)
graph.add_node("classify", classify)
graph.add_node("github", search_github)
graph.add_node("notion", search_notion)
graph.add_node("slack", search_slack)
graph.add_node("synthesize", synthesize)

graph.add_edge("classify", "github")   # ví dụ cạnh xác định (có thể đổi thành cạnh có điều kiện)
graph.add_edge("classify", "notion")
graph.add_edge("classify", "slack")
graph.add_edge("github", "synthesize")
graph.add_edge("notion", "synthesize")
graph.add_edge("slack", "synthesize")
graph.add_edge("synthesize", END)

app = graph.compile()
```

Quy trình này là **fan-out rồi tổng hợp (fan-out and synthesize)**: một đầu vào được phân phối cho nhiều bộ tìm kiếm song song, rồi mọi kết quả được gom về một bước tổng hợp duy nhất.

### 3.3 Khi nào nên dùng đồ thị

Các quy trình agent trong thế giới thực thường có **cấu trúc có thể dự đoán**:

- **Agent hỗ trợ**: phân loại vấn đề trước khi trả lời hoặc nâng cấp
- **Agent mã hóa**: kiểm tra kho lưu trữ trước khi đề xuất thay đổi
- **Quy trình tuân thủ**: cần phê duyệt trước khi thực hiện hành động bên ngoài

Đồ thị cho phép bạn **mã hóa trực tiếp cấu trúc đó**: đường dẫn nào hợp lệ, chỗ nào cho mô hình chọn, và chỗ nào hệ thống nên thực thi hành vi xác định thay vì hy vọng mô hình luôn ra quyết định đúng.

> **Hiểu biết chính**: Bằng cách biểu diễn hệ thống dưới dạng đồ thị, bạn đang mã hóa **tri thức thế giới (world knowledge)** của mình về cách hệ thống nên hoạt động. Giống như tri thức miền trong prompt giúp agent của bạn khác biệt với ChatGPT thông thường, đồ thị như một "kiến trúc nhận thức (cognitive architecture)" cũng mang tri thức miền.

**Lợi ích của việc dùng đồ thị**: mã và suy luận của mô hình cộng tác — mô hình suy luận nơi nó tạo giá trị, mã xử lý phần còn lại, nên agent **rẻ hơn, nhanh hơn và dễ dự đoán hơn**.

### 3.4 Khi nào KHÔNG nên dùng đồ thị

Một số tác vụ bản chất mang tính agentic hơn, và ép chúng vào các đường dẫn xác định là sai lầm. Trong những trường hợp này, bạn không muốn biểu diễn hệ thống dưới dạng đồ thị mà nên dùng trực tiếp **agent harness (khung/chứa agent)**, như **Deep Agents** của LangChain.

**Ví dụ điển hình: deep research (nghiên cứu sâu) tổng quát.** Một agent nghiên cứu cần lập kế hoạch, ủy quyền, tìm kiếm, đọc và tổng hợp theo những cách khó cố định trước. Bài gốc tiết lộ:

- LangChain xây dựng deep research thời kỳ đầu bằng **các quy trình LangGraph được định nghĩa trước**
- Sau đó chuyển sang **vòng lặp cốt lõi mang tính agentic hơn (core loop)**
- **GPT Researcher**, một triển khai mã nguồn mở nổi tiếng, cũng thực hiện chuyển đổi tương tự: thay đường ống đa agent hình đồ thị bằng Deep Agents, để việc lập kế hoạch, ủy quyền và quản lý ngữ cảnh **nảy sinh (emerge) trong harness** thay vì bị mã hóa cứng trong đồ thị

> **Nguyên tắc quyết định**: cấu trúc quy trình có thể dự đoán → dùng đồ thị, làm cho cấu trúc hiện hữu rõ ràng; quy trình về bản chất là khám phá mở → dùng agent harness, để cấu trúc nảy sinh.

### 3.5 Nâng cao: Chuyển đổi động và map-reduce

Không phải lúc nào bạn cũng muốn định nghĩa mọi cạnh ngay từ đầu. Đôi khi một nút cần quyết định lúc chạy sẽ tạo ra bao nhiêu công việc. **Map-reduce là trường hợp kinh điển**:

> Chia đầu vào thành nhiều mảnh, gửi mỗi mảnh cho một worker, rồi kết hợp kết quả. Số lượng worker phụ thuộc vào đầu vào, và bạn không biết con số đó trước.

LangGraph xử lý việc này bằng **`Send` API** — nó cho phép một nút định tuyến công việc đến một hoặc nhiều nút hạ nguồn một cách động, **mà không cần định nghĩa tĩnh mọi chuyển đổi**:

```python
from langgraph.types import Send

def continue_to_sources(state):
    """Phân phối động: quyết định tạo bao nhiêu tác vụ tìm kiếm dựa trên đầu vào"""
    return [
        Send("search", {"query": q})
        for q in split_into_queries(state["input"])
    ]

# Trong đồ thị: nút source_router dùng Send để fan-out công việc đến nhiều nút search,
# sau đó kết quả search hội tụ về nút synthesize
```

Điều này quan trọng vì **hệ thống agent hữu ích pha trộn cấu trúc đã biết với sự biến thiên lúc chạy**:

- Bạn có thể biết nghiên cứu nên fan-out rồi tổng hợp, nhưng không biết sẽ có bao nhiêu nguồn
- Bạn có thể biết supervisor nên ủy quyền cho workers, nhưng không biết cụ thể cho ai cho đến khi tác vụ bắt đầu
- **Đồ thị vẫn cần sự linh hoạt lúc chạy**

---

## 4. Điều Gì Thực Sự Mới

### 4.1 Không phải bản thân đồ thị — mà là thứ bạn có thể đặt trong một nút

Biểu diễn hệ thống agentic dưới dạng đồ thị không mới — LangChain đã làm ba năm rồi! Vậy trong làn sóng "kỹ thuật đồ thị" này, điều gì thực sự thay đổi?

Một cách diễn giải hào phóng: **điều thay đổi là thứ bạn có thể đặt bên trong một nút.**

- **Thời kỳ đầu**: nút là mã xác định hoặc một lệnh gọi LLM
- **Hiện tại**: bản thân agent đã đủ đáng tin cậy để giao việc thực — **một nút có thể là một lần chạy agent hoàn chỉnh (agent run).** Bạn đang điều phối các agent, không chỉ các lệnh gọi LLM

### 4.2 Agent mã hóa làm nút: Mẫu mới trở nên thực dụng

**Agent mã hóa (coding agents)** là một trong những agent hiệu quả và có tác động nhất trong sản xuất hiện nay. Nhúng một agent mã hóa làm nút trong một đồ thị lớn hơn là một **mẫu chỉ mới trở nên thực dụng.**

**Nghiên cứu tình huống: docs agent (agent tài liệu).** Nó biến một yêu cầu Slack:

> Ví dụ: "Vui lòng thêm tài liệu cho công cụ tùy chỉnh của chúng tôi"

thành một **pull request sẵn sàng để xem xét**. Mỗi nút trong đồ thị này nằm ở một vị trí khác nhau trên **phổ từ xác định đến agentic**:

| Loại bước | Nội dung | Ví dụ |
|---------|------|------|
| **Bước cố định (Fixed steps)** | Mã và lệnh gọi API được thiết lập sẵn | Các thao tác Slack và Linear |
| **Bước mô hình (Model steps)** | Một lệnh gọi LLM, không dùng công cụ | Bộ phân loại và bước tổng hợp |
| **Bước agent (Agent steps)** | Công việc mở hơn | agent tài liệu tham khảo và agent tài liệu khái niệm hoàn thành công việc mở trong kho mã tương ứng |

> **Hiểu biết cốt lõi**: sự pha trộn giữa tính xác định và tính tự chủ ở đây chính là lý do khiến docs agent này **dễ dự đoán, mạnh mẽ và hiệu quả.**

---

## 5. Triết Lý Thiết Kế: Thế Giới Quan Của LangGraph Và Kỹ Thuật Đồ Thị

### 5.1 Đồ thị là một kiến trúc nhận thức

Tuyên bố cốt lõi đằng sau triết lý thiết kế của LangGraph:

> **Bằng cách biểu diễn hệ thống dưới dạng đồ thị, bạn đang mã hóa tri thức thế giới của mình về cách hệ thống nên hoạt động.** Giống như tri thức miền trong prompt giúp agent của bạn khác biệt với ChatGPT thông thường, đồ thị như một "kiến trúc nhận thức" cũng mang tri thức miền.

**Hệ quả**: một đồ thị được thiết kế tốt tự nó là một dạng tri thức miền có thể thực thi — nó giải phóng "hệ thống nên hoạt động thế nào" khỏi phán đoán hộp đen của mô hình và biến nó thành cấu trúc tường minh mà người xây dựng có thể xem xét, điều chỉnh và xác thực.

### 5.2 Cân bằng giữa đường dẫn xác định và bước agentic

Lý do tồn tại của LangGraph là **tìm sự cân bằng giữa đường dẫn xác định và bước agentic**:

- Không phải "hoàn toàn tự động" — một số đường dẫn phải được ép buộc, không thể cho mô hình tự do
- Không phải "toàn đường ống" — bên trong nút được phép tự do agentic
- **Nguyên tắc: xác định nơi cần xác định, tự chủ nơi cần tự chủ, sự tự do được thu về bên trong các nút**

### 5.3 Vòng lặp là đồ thị đơn giản

Bài học thực tế ba năm của đội ngũ LangGraph: **loop engineering không phải giải pháp thay thế cho graph engineering — nó là phiên bản đơn giản hơn.** Như tác giả XState David Khourshid đã nói: "một vòng lặp chỉ là một đồ thị có hướng, tuần hoàn (a loop is just a directed, cyclic graph)."

Bằng chứng mạnh nhất: **bản thân khung LangChain (dựa trên một vòng lặp agentic đơn giản) được xây dựng trên LangGraph.**

### 5.4 Mô hình suy luận nơi nó tạo giá trị

Mục tiêu triết học cuối cùng của kỹ thuật đồ thị là **tối ưu hóa chi phí và tính dễ dự đoán**:

> Mã và suy luận của mô hình cộng tác: mô hình suy luận nơi nó tạo giá trị, mã xử lý phần còn lại, nên agent rẻ hơn, nhanh hơn và dễ dự đoán hơn.

**Đừng** bắt mô hình làm logic cố định mà nó không giỏi; **hãy** để mô hình tỏa sáng ở phán đoán, tổng hợp và hiểu biết mở. Đồ thị là công cụ để phân lớp chính xác hai năng lực này.

---

## 6. Tổng Kết Ba Năm Thực Hành: Ba Điều Đã Học

### 6.1 Thứ nhất, đồ thị agent thường KHÔNG phải DAG

Agent sản xuất cần **vòng lặp (cycles)**:

- Thử lại các lệnh gọi công cụ thất bại
- Hỏi người dùng thông tin còn thiếu
- Sửa đổi câu trả lời sau khi xác thực
- Gọi công cụ lặp lại cho đến khi có đủ ngữ cảnh
- Tạm dừng chờ đầu vào con người trước khi tiếp tục

**Vòng lặp là phần cốt lõi của hệ thống agentic**, nên đồ thị agent khó có thể là DAG (đồ thị có hướng không chu trình).

### 6.2 Thứ hai, vòng lặp là đồ thị đơn giản

- Loop engineering không phải giải pháp thay thế cho graph engineering — mà là **phiên bản đơn giản hơn**
- Một vòng lặp = một đồ thị có hướng, tuần hoàn
- LangChain (khung dựa trên vòng lặp agentic đơn giản) được xây trên LangGraph — **đồ thị đơn giản nhất là thứ LangGraph có thể biểu diễn.** Hai thứ không đối lập mà là quan hệ bao hàm

### 6.3 Thứ ba, chuyển đổi động rất quan trọng

- Bạn không cần định nghĩa mọi cạnh ngay từ đầu
- Đôi khi nút quyết định lúc chạy sẽ tạo bao nhiêu công việc (map-reduce)
- **Send API** cho phép nút định tuyến công việc động, không cần định nghĩa tĩnh mọi chuyển đổi
- Hệ thống agent hữu ích = sự pha trộn của **cấu trúc đã biết + biến thiên lúc chạy**

---

## 7. Tóm Tắt: Quan Điểm Cốt Lõi Và Kết Luận

### 7.1 Danh sách quan điểm cốt lõi

1. **Nhiều thuật ngữ ≠ thổi phồng**: các thuật ngữ như graph engineering mô tả những quyết định thiết kế thực tế mà người xây dựng phải đối mặt; chúng tồn tại vì bắt LLM làm việc rất khó
2. **Đồ thị là mô hình hợp lý**: đồ thị cho phép bạn áp đặt định kiến vào các đường dẫn bị ràng buộc và kiểm soát hành vi chặt chẽ hơn khi cần — đó là lý do LangGraph tồn tại
3. **Sự cân bằng là lý do LangGraph phổ biến**: cân bằng giữa đường dẫn xác định và bước agentic giúp nó khác biệt với các khung agent khác
4. **Đồ thị mã hóa tri thức thế giới**: đồ thị là kiến trúc nhận thức mang tri thức miền như prompt — một dạng tri thức miền có thể thực thi
5. **Tác vụ có cấu trúc → đồ thị**: phân loại hỗ trợ, kiểm tra mã hóa, phê duyệt tuân thủ — các quy trình có cấu trúc dự đoán được mã hóa trực tiếp thành đồ thị
6. **Tác vụ mở → harness**: các tác vụ bản chất agentic như deep research dùng agent harness (Deep Agents), để lập kế hoạch/ủy quyền/quản lý ngữ cảnh nảy sinh
7. **Đồ thị agent không phải DAG**: vòng lặp (thử lại, hỏi, sửa, tạm dừng) là cốt lõi của hệ thống agentic
8. **Vòng lặp là đồ thị đơn giản**: LangChain được xây trên LangGraph; hai thứ là bao hàm, không đối lập
9. **Chuyển đổi động là điều bắt buộc**: thường không biết khối lượng công việc cho đến lúc chạy (map-reduce), nên cần định tuyến động như Send API
10. **Thay đổi thực sự nằm bên trong nút**: một nút giờ có thể là một lần chạy agent hoàn chỉnh — bạn điều phối agent, không chỉ lệnh gọi LLM
11. **Agent mã hóa là nút thực dụng mới**: nghiên cứu tình huống docs agent cho thấy sự pha trộn nút trên phổ từ xác định đến agentic
12. **Mô hình suy luận nơi nó tạo giá trị**: mục tiêu cuối cùng là agent rẻ hơn, nhanh hơn, dễ dự đoán hơn

### 7.2 Bảng quyết định nhanh

| Tình huống | Lựa chọn | Lý do |
|------|------|------|
| Cấu trúc quy trình dự đoán được (phân loại → trả lời/nâng cấp) | Đồ thị (LangGraph) | Mã hóa trực tiếp các đường dẫn hợp lệ |
| Cần kiểm soát xác định (phê duyệt tuân thủ) | Đồ thị (LangGraph) | Hệ thống thực thi thay vì hy vọng mô hình đúng |
| Cần fan-out lúc chạy (map-reduce) | Đồ thị + Send API | Định tuyến động không cần định nghĩa tĩnh |
| Khám phá mở (deep research) | Agent harness (Deep Agents) | Lập kế hoạch/ủy quyền/quản lý ngữ cảnh nảy sinh |
| Vòng lặp một agent | Dạng đơn giản nhất của đồ thị | Vòng lặp là đồ thị có hướng tuần hoàn |
| Cần tự do bên trong nút | Đặt agent trong nút | Điều phối agent, không chỉ lệnh gọi LLM |

### 7.3 Bài học cho người xây dựng

1. **Nghĩ về cấu trúc trước khi viết mã**: trước khi bắt đầu, hãy tự hỏi — đâu là chỗ dự đoán được trong quy trình này? Đâu là chỗ bắt buộc mô hình phải tự do? Biến những phần dự đoán được thành một đồ thị tường minh
2. **Đừng tôn sùng đồ thị**: nếu tác vụ là khám phá mở, câu trả lời không phải đồ thị mà là harness
3. **Đón nhận vòng lặp**: thử lại, hỏi và sửa đổi không phải bất thường — chúng là chuẩn mực trong hệ thống agentic, và đồ thị phải hỗ trợ chúng
4. **Đặt sự tự do đúng tầng**: ép buộc các đường dẫn xác định nơi cần thiết, để các bước tự chủ ở lại bên trong nút

---

## 8. Đọc Thêm

- [Tài liệu LangGraph](https://docs.langchain.com/oss/python/langgraph/overview)
- [Kiến trúc nhận thức là gì (Cognitive Architectures)](https://www.langchain.com/blog/what-is-a-cognitive-architecture)
- [Nghệ thuật kỹ thuật vòng lặp (The Art of Loop Engineering)](https://www.langchain.com/blog/the-art-of-loop-engineering)
- [Giải phẫu một agent harness (The Anatomy of an Agent Harness)](https://www.langchain.com/blog/the-anatomy-of-an-agent-harness)
- [Cách xây dựng agent harness tùy chỉnh](https://www.langchain.com/blog/how-to-build-a-custom-agent-harness)
- [Deep Agents vs LangChain vs LangGraph](https://www.langchain.com/blog/deep-agents-vs-langchain-vs-langgraph)

---

*Bài viết này là bản phân tích chuyên sâu và sáng tạo lại dựa trên bài blog chính thức của LangChain "3 Years of Graph Engineering with LangGraph" (Sydney Runkle & Harrison Chase, 2026-07-22).*
