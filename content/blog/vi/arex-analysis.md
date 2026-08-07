---
title: "AREX Chuyên Sâu: Agent Nghiên Cứu Sâu Tự Cải Thiện Đệ Quy Mã Nguồn Mở của BAAI"
description: "Phân tích toàn diện về AREX mã nguồn mở của BAAI — một agent nghiên cứu sâu tự cải thiện đệ quy. Từ hiểu biết cốt lõi về 'bất đối xứng khám phá-xác minh' trong arXiv 2607.21461 đến khung vòng lặp kép, từ các mô hình AREX-Turbo / AREX-Base đến hướng dẫn sử dụng hoàn chỉnh, bài viết này giải thích triết lý thiết kế của mô hình nghiên cứu mở Apache 2.0 này."
date: "2026-08-03"
author: "TopDigg Research Team"
tags: ["AREX", "BAAI", "Deep Research", "Agent", "Recursive Self-Improvement", "arXiv", "Open Source Model", "Deep Research", "MoE", "Qwen3.5"]
categories: ["Deep Dive"]
keywords: ["AREX", "BAAI", "Deep Research agent", "Recursive self-improvement", "arXiv 2607.21461", "Open Source", "Apache 2.0", "Qwen3.5", "AREX-Turbo", "AREX-Base", "Discovery-verification asymmetry"]
---

# AREX Chuyên Sâu: Agent Nghiên Cứu Sâu Tự Cải Thiện Đệ Quy Mã Nguồn Mở của BAAI

> Ý tưởng cốt lõi: **Tìm ra câu trả lời thì đắt; xác minh câu trả lời thì rẻ.** Nghiên cứu sâu đòi hỏi các câu trả lời thỏa mãn đồng thời nhiều ràng buộc — "khám phá" trải trên một không gian tìm kiếm khổng lồ, nhưng "xác minh" một ứng viên thường phân rã thành các kiểm tra đơn giản theo từng ràng buộc. AREX nắm bắt sự bất đối xứng này để agent không chỉ đơn thuần tìm kiếm lâu hơn — nó **tự cải thiện đệ quy**, dùng trạng thái đã xác minh một phần để định hướng các lần lặp sau.

---

## 1. Tổng Quan Dự Án

### 1.1 Đây Là Gì?

**AREX (Agent Tự Cải Thiện Đệ Quy cho Nghiên Cứu Sâu)** là một agent nghiên cứu sâu do BAAI (Học viện Trí tuệ Nhân tạo Bắc Kinh) phát hành vào tháng 7 năm 2026. Nó không chỉ là một mô hình lớn khác — nó là một "phương pháp luận agent nghiên cứu + mô hình đã huấn luyện" hoàn chỉnh.

- **Bài báo**: arXiv:2607.21461 (cs.AI, nộp ngày 23-24 tháng 7 năm 2026)
- **Tiêu đề**: *AREX: Towards a Recursively Self-Improving Agent for Deep Research*
- **Tác giả**: Lu Shuqi, Li Chaofan, Luo Kun, và 21 người khác (tổng 24, BAAI)
- **Trang chủ**: https://vectorspacelab.github.io/arex-model/
- **Demo trực tiếp**: https://arex-research.com/
- **Bộ sưu tập mô hình**: https://huggingface.co/collections/BAAI/arex

### 1.2 Các Mô Hình Mã Nguồn Mở

- **AREX-Turbo**: 4B dense, dựa trên Qwen3.5-4B, Apache 2.0, **ngữ cảnh 256K**
- **AREX-Base**: 122B tổng / 10B hoạt động (MoE), dựa trên Qwen3.5-122B-A10B, Apache 2.0, **ngữ cảnh 256K**

> Cả hai mô hình đều có giấy phép Apache 2.0 — miễn phí cho nghiên cứu và sử dụng thương mại. Đây là một đóng góp quan trọng khác của BAAI sau BGE, BGE-M3 và các mô hình mở khác.

---

## 2. Ý Tưởng Cốt Lõi: Bất Đối Xứng Khám Phá-Xác Minh

### 2.1 Vì Sao Nghiên Cứu Sâu Lại Đắt Đến Vậy?

Nghiên cứu sâu yêu cầu agent tìm ra các câu trả lời thỏa mãn **nhiều ràng buộc đồng thời**. Khó khăn nằm ở:

- **Khám phá** một câu trả lời thỏa mãn mọi ràng buộc — không gian tìm kiếm lớn, chi phí cao
- **Xác minh** một ứng viên — thường phân rã thành **các kiểm tra đơn giản theo từng ràng buộc**, rẻ hơn nhiều

> Phép so sánh: thật khó tìm một căn hộ ở Bắc Kinh *gần tàu điện ngầm, dưới 5000 NDT, hướng nam và có thang máy*; nhưng với một tin rao cụ thể, xác minh từng ràng buộc thì nhanh. **Khám phá thì khó, xác minh thì dễ — đó là sự bất đối xứng.**

### 2.2 Câu Trả Lời Của AREX: Đừng Tìm Kiếm Lâu Hơn — Hãy Cải Thiện Đệ Quy

Hiểu biết chính của AREX: dùng **trạng thái trung gian đã xác minh một phần** để định hướng lặp, thay vì mở rộng tìm kiếm một cách mù quáng.

- Mỗi lần lặp đều xác minh các kết quả trung gian
- Các phát hiện đã xác minh được giữ lại
- Các ràng buộc chưa giải quyết được nghiên cứu lại
- Điều này trở thành một **vòng lặp tự cải thiện đệ quy**

---

## 3. Kiến Trúc Kỹ Thuật: Khung Vòng Lặp Kép

### 3.1 Vòng Lặp Nghiên Cứu Bên Trong

- Thu thập bằng chứng, đánh giá ứng viên, xây dựng câu trả lời dự kiến
- Duy trì trạng thái nghiên cứu thông qua quỹ đạo tích lũy
- Tạo ra các câu trả lời kèm **bằng chứng hỗ trợ** và **điểm tự tin (0-100)**

### 3.2 Vòng Lặp Tự Cải Thiện Bên Ngoài

Kiểm toán câu trả lời dự kiến theo từng ràng buộc, sau đó áp dụng các quy tắc quyết định:

- **Chấp nhận**: độ tự tin ≥ ngưỡng
- **Tinh chỉnh**: độ tự tin < ngưỡng VÀ quỹ đạo có thể khôi phục — giữ các phát hiện hữu ích, nhắm vào các ràng buộc chưa giải quyết
- **Khởi động lại**: độ tự tin < ngưỡng VÀ quỹ đạo quá nhiễu/khó hiểu

### 3.3 Công Cụ Cập Nhật Ngữ Cảnh Tự Động (update_context)

AREX học cách gọi `update_context` để nén một lịch sử tương tác đang phình to thành một **trạng thái cải thiện** gọn gàng:

- Giữ các phát hiện đã xác minh kèm định danh nguồn
- Ghi lại trạng thái thỏa mãn ràng buộc
- Nêu bật các khoảng trống thông tin chưa giải quyết
- Chỉ định kế hoạch nghiên cứu tiếp theo

> Đây không phải là tóm tắt chung chung! **Chính agent** tổ chức bản cập nhật quanh mục tiêu hiện tại của nó, giữ trạng thái nén thẳng hàng với các niềm tin đang tiến hóa của nó.

### 3.4 Các Công Cụ Sẵn Có

- **search**: tìm kiếm web hàng loạt (top 10 kết quả mỗi truy vấn)
- **visit**: truy cập trang web và trả về tóm tắt nội dung
- **google_scholar**: tìm kiếm ấn phẩm học thuật
- **update_context**: nén bộ nhớ/trạng thái nghiên cứu
- **finish**: trả về câu trả lời cuối cùng kèm bằng chứng

---

## 4. Đường Ống Huấn Luyện: Huấn Luyện Nhiều Giai Đoạn

### 4.1 Huấn Luyện Giữa Kỳ Hướng Agent (Agentic Mid-Training)

Xây dựng năng lực tiến dần:

- **Các tác vụ nghiên cứu nặng duyệt web**: sử dụng công cụ nền tảng, thu thập bằng chứng
- **Các tác vụ suy luận chuyên gia**: tư duy dạng dài, suy luận nhiều bước
- **Củng cố năng lực hỗn hợp**: với phát lại tập trung bước chính

### 4.2 Học Tăng Cường Nhận Thức Bước (Step-Aware Reinforcement Learning)

- Tối ưu chính sách ở cấp bước với chuẩn hóa phân cấp
- **Định hình phần thưởng bước chính**: phần thưởng phụ trợ cho các điểm quyết định quan trọng
- **Độ chính xác câu trả lời cuối** vẫn là mục tiêu tối ưu hóa chính

### 4.3 Giám Sát Tập Trung Bước Chính

Xác định các bước quan trọng, ví dụ:

- Các bước thu thập **bằng chứng chính**
- Các bước **bác bỏ giả thuyết sai**
- Cập nhật ngữ cảnh **giữ lại bằng chứng đã xác minh**

> Điều này giải quyết vấn đề **phân bổ tín nhiệm** (credit assignment) tầm nhìn xa: trong số các quỹ đạo trải dài hàng chục bước, bước nào thực sự quyết định chất lượng câu trả lời cuối?

---

## 5. Hướng Dẫn Chi Tiết: Cách Sử Dụng AREX

### 5.1 Tùy Chọn 1: vLLM

```bash
pip install vllm

vllm serve BAAI/AREX-Turbo \
  --served-model-name AREX-Turbo \
  --tensor-parallel-size 1 \
  --max-model-len 262144 \
  --reasoning-parser qwen3 \
  --language-model-only
```

### 5.2 Tùy Chọn 2: SGLang

```bash
pip install sglang

python3 -m sglang.launch_server \
    --model-path "BAAI/AREX-Turbo" \
    --host 0.0.0.0 \
    --port 30000
```

### 5.3 Tùy Chọn 3: Transformers (cục bộ)

```python
from transformers import AutoProcessor, AutoModelForMultimodalLM

processor = AutoProcessor.from_pretrained("BAAI/AREX-Turbo")
model = AutoModelForMultimodalLM.from_pretrained(
    "BAAI/AREX-Turbo",
    device_map="auto"
)

messages = [
    {
        "role": "user",
        "content": [
            {"type": "image", "url": "https://example.com/image.jpg"},
            {"type": "text", "text": "Describe this image"}
        ]
    },
]

inputs = processor.apply_chat_template(
    messages,
    add_generation_prompt=True,
    tokenize=True,
    return_dict=True,
    return_tensors="pt",
).to(model.device)

outputs = model.generate(**inputs, max_new_tokens=40)
print(processor.decode(outputs[0][inputs["input_ids"].shape[-1]:]))
```

### 5.4 Vòng Lặp Agent: Gọi Công Cụ XML

```python
from openai import OpenAI

client = OpenAI(
    base_url="http://127.0.0.1:8000/v1",
    api_key="EMPTY",
    timeout=600.0,
)

question = "Your research question"
messages = [
    {"role": "system", "content": SYSTEM_PROMPT},  # contains tool descriptions
    {"role": "user", "content": f"Question: {question}"}
]

# Loop: generate → execute tool → append result → repeat
while True:
    response = client.chat.completions.create(
        model="AREX-Turbo",
        messages=messages,
        max_tokens=8192,
        temperature=1.0,
        top_p=0.95,
        presence_penalty=1.5,
        extra_body={"top_k": 20},
    )

    assistant_output = response.choices[0].message.content
    messages.append({"role": "assistant", "content": assistant_output})

    # If finish is called, extract the answer and break
    if "<function=finish>" in assistant_output:
        break

    # Execute tool and append the result
    tool_result = execute_tool(assistant_output)
    messages.append({"role": "tool", "content": f"<tool_response>{tool_result}</tool_response>"})
```

### 5.5 Bộ Công Cụ (từ prompts.py)

- `search(query: list[str])` — tìm kiếm web hàng loạt
- `visit(url: str|list[str], goal: str)` — truy cập trang web
- `google_scholar(query: list[str])` — tìm kiếm học thuật
- `update_context(context: str)` — nén trạng thái nghiên cứu
- `finish(answer: str, evidences: list[{evidence, url}])` — nộp câu trả lời cuối cùng

---

## 6. Kết Quả Benchmark

### 6.1 Điểm Số Dòng AREX

- **BrowseComp**: AREX-Base **82,5** / AREX-Turbo 70,7
- **GAIA**: AREX-Base **85,4** / AREX-Turbo 81,6
- **xbench-2510**: AREX-Base **71,0** / AREX-Turbo 57,0
- **DeepSearchQA**: AREX-Base **89,9** / AREX-Turbo 78,5
- **WideSearch-en**: AREX-Base **82,0** / AREX-Turbo 68,5
- **HLE with tools**: AREX-Base **52,4** / AREX-Turbo 40,6

### 6.2 So Với Các Mô Hình Cùng Cỡ, Lớn Hơn Nhiều & Đóng (các benchmark chọn lọc)

- **Qwen3.5-122B**: BrowseComp 63.8 / GAIA 81.6 / WideSearch-en 60.5
- **Qwen3.5-397B**: BrowseComp 78.6 / GAIA 83.5 / WideSearch-en 74.0
- **Kimi-K2.6 (1T)**: BrowseComp 83.2 / GAIA 80.6 / WideSearch-en 80.8
- **DeepSeek-Pro (1.6T)**: BrowseComp 83.4 / WideSearch-en 78.0
- **GPT-5.4**: BrowseComp 82.7 / WideSearch-en 88.5
- **Gemini-3.1-Pro**: BrowseComp 85.9 / GAIA 80.6 / WideSearch-en 66.4

> Kết luận chính: **AREX-Base (122B MoE, chỉ 10B hoạt động)** vượt trội đáng kể so với các đường cơ sở cùng cỡ và duy trì khả năng cạnh tranh với các mô hình dùng nhiều tham số hoạt động hơn nhiều — xác nhận rằng "lợi ích tự cải thiện đệ quy > đơn thuần mở rộng tham số."

---

## 7. Triết Lý Thiết Kế

### 7.1 Năm Nguyên Tắc Thiết Kế Cốt Lõi

1. **Xác minh là một tín hiệu điều khiển tích cực**: xác minh không phải là một bộ lọc cuối — nó điều khiển các quyết định Chấp nhận / Tinh chỉnh / Phản ứng-tạm dừng
2. **Giữ tiến trình qua các lần lặp**: các phát hiện đã xác minh sống sót; chỉ các ràng buộc chưa giải quyết được nghiên cứu lại
3. **Quản lý ngữ cảnh tự động**: chính agent quyết định khi nào nén và tổ chức nó quanh mục tiêu của riêng mình — không phải qua tóm tắt chung chung bên ngoài
4. **Phân bổ tín nhiệm bước chính**: các quyết định nghiên cứu quan trọng (tìm bằng chứng, bác bỏ giả thuyết sai) nhận tín hiệu huấn luyện tập trung
5. **Hiệu quả hơn quy mô**: tự cải thiện đệ quy mang lại lợi ích tốt hơn so với đơn thuần mở rộng tham số

### 7.2 Định Vị So Với Các Công Trình Liên Quan

- **Mirorecursive (chưa rõ)**: mở rộng ngữ cảnh và kích thước mô hình; AREX tập trung vào cải thiện đệ quy
- **WebResearcher (else)**: mô hình lặp; vĩ mô thêm các chuyển tiếp định hướng xác minh
- **DeepSeek/Tổng hợp (else)**: xác minh theo ràng buộc của AREX khác biệt về bản chất

### 7.3 Vì Sao Nó Độc Đáo

1. Bất đối xứng khám phá-xác minh như một nguyên tắc thiết kế
2. Khung vòng lặp kép đệ quy (bên trong + bên ngoài)
3. Công cụ cập nhật ngữ cảnh tự động đã học
4. Huấn luyện tập trung bước chính cho phân bổ tín nhiệm
5. Cấu trúc câu trả lời dựa trên bằng chứng với điểm tự tin

---

## 8. Hạn Chế & Các Câu Hỏi Mở

1. **Humanity's Last Exam (HLE) vẫn còn dư địa phát triển**: AREX-Base 52,4% — vẫn sau các mô hình tiên phong
2. **Phân bổ tín nhiệm tầm nhìn xa vẫn còn khó khăn**: quy kết chính xác kết quả trên các quỹ đạo hàng chục-tới-hàng trăm bước vẫn mở
3. **Đánh giá khả năng phục hồi đôi khi đánh giá sai**: ranh giới giữa các quyết định Tinh chỉnh/Khởi động lại không phải lúc nào cũng hoàn hảo

---

## 9. Tổng Kết: Quan Điểm & Kết Luận

### 9.1 Quan Điểm Cốt Lõi

- **Bất đối xứng khám phá-xác minh là một nguyên tắc thiết kế tái sử dụng được**: với bất kỳ vấn đề nào mà "tìm kiếm lớn và xác minh rẻ" (nghiên cứu, gỡ lỗi, quyết định), bạn có thể mượn chiến lược đệ quy "xác minh trước, rồi mở rộng"
- **Lặp định hướng xác minh thắng lặp định hướng tìm kiếm**: chi tiêu nguồn lực cho xác minh và tinh chỉnh, không phải cho mở rộng tìm kiếm một cách mù quáng
- **Quản lý ngữ cảnh nên là năng lực của agent, không phải một công cụ bên ngoài**: AREX chứng minh rằng một mô hình học cách nén ngữ cảnh tự động giữ được trạng thái niềm tin mạch lạc qua các tác vụ dài
- **Giám sát bước chính là chìa khóa cho RL tầm nhìn xa**: giải quyết phân bổ tín nhiệm là điều khiến các quỹ đạo nghiên cứu hàng chục/hàng trăm bước có thể huấn luyện được trong thực tế
- **Mã nguồn mở + Apache 2.0 là cam kết hệ sinh thái của BAAI**: kết quả gần tiên phong với 122B (10B hoạt động) khiến các agent nghiên cứu sâu chất lượng cao không còn là đặc quyền của các gã khổng lồ ngành

### 9.2 Điểm Rút Ra Cho Nhà Phát Triển

- Cả hai mô hình đều Apache 2.0 — **có thể sử dụng thương mại trực tiếp**
- AREX-Turbo (4B) triển khai trên phần cứng tiêu dùng; tuyệt vời cho các tác vụ nghiên cứu nhẹ
- AREX-Base (122B MoE, 10B hoạt động) phục vụ trên vLLM/SGLang mà không cần VRAM cấp tỷ
- Ngữ cảnh 256K + mô hình gọi công cụ XML tương thích với các framework suy luận chính thống

### 9.3 Kết Luận

> Hiểu biết của AREX: **nút thắt của nghiên cứu sâu không phải là "suy nghĩ lâu" mà là "cải thiện đúng cách."** Khi một mô hình học cách xác minh các phát hiện, giữ tiến trình và tập trung vào các ràng buộc chưa giải quyết, một mô hình MoE 122B có thể tiếp cận các mô hình đóng cấp 1T trên nhiều benchmark — tự cải thiện đệ quy là một bàn tay thanh lịch hơn so với tích trữ tham số.

**Tóm tắt một câu: AREX = tự cải thiện đệ quy định hướng xác minh, để các agent nghiên cứu sâu vươn tới các mô hình mạnh hơn với ít tính toán hơn.**

---

## References

- Bài báo: https://arxiv.org/abs/2607.21461
- Trang bài báo HuggingFace: https://huggingface.co/papers/2607.21461
- Bộ sưu tập mô hình: https://huggingface.co/collections/BAAI/arex
- Trang chủ: https://vectorspacelab.github.io/arex-model/
- Demo trực tiếp: https://arex-research.com/
- Trích dẫn:

```bibtex
@misc{baai2026arex,
  title={AREX: Towards a Recursively Self-Improving Agent for Deep Research},
  author={Shuqi Lu and Chaofan Li and Kun Luo et al.},
  year={2026},
  eprint={2607.21461},
  archivePrefix={arXiv},
  primaryClass={cs.AI},
  url={https://arxiv.org/abs/2607.21461},
}
```
