---
title: "AirLLM Đi Sâu: Cuộc Cách Mạng Suy Luận Từng Lớp Chạy LLM 70B Trên GPU 4GB"
description: "Bài phân tích toàn diện về dự án mã nguồn mở AirLLM — không lượng tử hóa, không chưng cất, không tỉa bớt. Thông qua việc tải từng lớp một, nó chạy được LLM 70B tham số trên một GPU 4GB duy nhất. Từ cài đặt đến sử dụng API, từ cách nó hoạt động đến triết lý thiết kế, bài viết này bao quát các ý tưởng cốt lõi đằng sau một dự án 26k sao."
date: "2026-08-03"
author: "TopDigg Research Team"
tags: ["AirLLM", "LLM Inference", "Large Language Models", "GPU Memory Optimization", "Layer-wise Inference", "Open Source", "Gavin Li", "Deep Learning", "Model Inference", "Low-end Hardware"]
categories: ["Deep Dive"]
keywords: ["AirLLM", "LLM Inference", "mô hình 70B", "GPU 4GB", "suy luận từng lớp", "Gavin Li", "Anima AI", "mã nguồn mở", "GPU VRAM", "AutoModel", "nén mô hình"]
---

# AirLLM Đi Sâu: Cuộc Cách Mạng Suy Luận Từng Lớp Chạy LLM 70B Trên GPU 4GB

> Ý tưởng cốt lõi: **Tại sao chúng ta phải giữ toàn bộ mô hình trong bộ nhớ GPU cùng một lúc?** Vì các lớp transformer thực thi tuần tự, chúng ta chỉ cần lớp *đang chạy* trong GPU — tính toán nó, giải phóng nó, tải lớp tiếp theo. AirLLM biến câu hỏi tưởng chừng đơn giản này thành một hệ thống hoạt động được, chạy LLM 70B tham số trên một GPU 4GB duy nhất — không lượng tử hóa, không chưng cất, không tỉa bớt.

---

## 1. Tổng Quan Dự Án

### 1.1 Dự Án Này Là Gì?

**AirLLM** là một framework suy luận mô hình ngôn ngữ lớn mã nguồn mở do **Gavin Li** tạo ra (nhà sáng lập Anima AI, cựu lãnh đạo AI cấp cao tại Airbnb và Alibaba). Khả năng cốt lõi của nó là **giảm đáng kể mức sử dụng bộ nhớ GPU trong suy luận LLM**, cho phép các mô hình 70B tham số chạy trên **một GPU 4GB duy nhất** — không lượng tử hóa, không chưng cất, không tỉa bớt.

> Từ README: *"AirLLM tối ưu hóa mức sử dụng bộ nhớ suy luận, cho phép các mô hình ngôn ngữ lớn 70B chạy suy luận trên một card GPU 4GB duy nhất — không lượng tử hóa, không chưng cất, không tỉa bớt."*

### 1.2 Dự Án Nhìn Nhanh

- **Sao GitHub**: 26.230+ (tính đến tháng 8 năm 2026)
- **Giấy phép**: Apache License 2.0
- **Hoạt động**: Đang phát triển tích cực (commit gần nhất ngày 29 tháng 7 năm 2026)
- **Phân phối**: PyPI (`pip install airllm`)
- **Repo**: https://github.com/lyogavin/airllm

### 1.3 Nó Có Thể Làm Gì? (Điểm Chuẩn VRAM Đã Kiểm Chứng)

- **Qwen3 / Mistral / Phi (~8B)** → chỉ cần **~1–2 GB**
- **Qwen3-30B / Mixtral (MoE, 30–47B)** → **~1–3 GB**
- **Qwen3-235B (MoE)** → **~3 GB**
- **Llama 3.x 70B** → **~4 GB**
- **Llama 3.1 405B** → **~8 GB**
- **DeepSeek-V3 (671B)** → **~12 GB**
- **Kimi K3 (2.8T)** → **~3,72 GB**

> Lưu ý: các con số lấy từ điểm chuẩn chính thức. Theo cách truyền thống, một mô hình 70B cần ~140GB VRAM để tải đầy đủ; AirLLM nén nó xuống còn 4GB — giảm hơn 30 lần.

---

## 2. Ý Tưởng Cốt Lõi: Tại Sao Toàn Bộ Mô Hình Phải Nằm Trong VRAM?

### 2.1 Một Sự Thật Hiển Nhiên Bị Bỏ Quên

Trong quá trình suy luận LLM, các lớp của transformer thực thi **tuần tự**: đầu ra của lớp trước là đầu vào của lớp sau, và chỉ có **một** lớp đang tính toán tại bất kỳ thời điểm nào. Tác giả Gavin Li đã nói điều này trên Medium:

> "During inference, layers are executed sequentially. The output of the previous layer is the input to the next. Only one layer executes at any given time. Therefore, it is completely unnecessary to keep all layers in GPU memory. We can load whichever layer is needed from disk when executing that layer, do all the calculations, and then completely free the memory after."

Dịch: **Vì chỉ có một lớp tính toán tại một thời điểm, tại sao phải nhét tất cả chúng vào bộ nhớ video?** Tải lớp *đang chạy* từ đĩa vào GPU, giải phóng ngay sau khi tính toán, rồi tải lớp tiếp theo — đó là toàn bộ bí mật của AirLLM.

### 2.2 Khác Biệt Nền Tảng So Với Các Cách Tiếp Cận Chủ Đạo

Cách tiếp cận chủ đạo là "làm mô hình nhỏ hơn để vừa VRAM":

- **Lượng tử hóa (Quantization)**: nén trọng số từ FP16 xuống INT8/INT4, đánh đổi độ chính xác lấy kích thước
- **Chưng cất (Distillation)**: dạy một mô hình nhỏ hơn bằng mô hình lớn, huấn luyện lại một phiên bản gọn gàng
- **Tỉa bớt (Pruning)**: loại bỏ các tham số không quan trọng

Cách tiếp cận của AirLLM hoàn toàn khác — **đừng thay đổi mô hình; thay đổi nơi nó sống**: coi VRAM GPU như một *cache*, và đĩa như *bộ nhớ chính*. Đánh đổi tốc độ lấy dung lượng, để người bình thường có thể chạy các mô hình lớn trên phần cứng họ đã sở hữu.

---

## 3. Hướng Dẫn Chi Tiết: Từ Cài Đặt Đến Chạy

### 3.1 Cài Đặt

```bash
pip install airllm
```

Để hỗ trợ Kimi K3 (streaming theo từng expert), cài thêm các phụ thuộc:

```bash
pip install airllm compressed-tensors flash-attn
```

### 3.2 Bắt Đầu Nhanh: AutoModel

AirLLM cung cấp một API `AutoModel` tương thích HuggingFace tự động phát hiện kiến trúc mô hình:

```python
from airllm import AutoModel

MAX_LENGTH = 128
model = AutoModel.from_pretrained("Qwen/Qwen3-32B")

input_text = ['What is the capital of the United States?']
input_tokens = model.tokenizer(
    input_text,
    return_tensors="pt",
    return_attention_mask=False,
    truncation=True,
    max_length=MAX_LENGTH,
    padding=False
)

generation_output = model.generate(
    input_tokens['input_ids'].cuda(),
    max_new_tokens=20,
    use_cache=True,
    return_dict_in_generate=True
)

output = model.tokenizer.decode(generation_output.sequences[0])
print(output)
```

> Cách dùng phản chiếu `transformers` của HuggingFace: tải bằng `from_pretrained`, mã hóa bằng `tokenizer`, sinh bằng `generate` — chi phí gia nhập là tối thiểu.

### 3.3 Chế Độ Nén Để Tăng Tốc

Để tăng thêm tốc độ, bật lượng tử hóa trọng số 4-bit / 8-bit (suy giảm độ chính xác không đáng kể):

```python
model = AutoModel.from_pretrained(
    "garage-bAInd/Platypus2-70B-instruct",
    compression='4bit'   # hoặc '8bit'
)
```

### 3.4 Tải Các Mô Hình Rất Lớn (405B / 671B)

AirLLM hoạt động ngay lập tức với các mô hình lớn nhất của HuggingFace:

```python
# Llama 3.1 405B
model = AutoModel.from_pretrained("unsloth/Meta-Llama-3.1-405B-Instruct-bnb-4bit")
```

### 3.5 Các Kiến Trúc Được Hỗ Trợ

AirLLM hỗ trợ gần như mọi mô hình mở phổ biến:

- **Llama**: 2 / 3 / 3.1 / 3.3 / 4, bao gồm 405B
- **Qwen**: 1 / 2 / 2.5 / 3, bao gồm các biến thể MoE và FP8
- **DeepSeek**: V2 / V3 / R1, bao gồm V3 671B
- **Mistral / Mixtral**: Mistral-7B và Mixtral MoE
- **Phi, Gemma**: các dòng của Microsoft và Google
- **ChatGLM, Baichuan, InternLM, Yi**: các dòng mô hình Trung Quốc

### 3.6 Lưu Ý Khi Chạy Lần Đầu

- **Sharding lần đầu**: lần chạy đầu tiên chia mô hình thành các file theo từng lớp trên đĩa, mất khoảng **10–30 phút** (phụ thuộc kích thước và tốc độ đĩa)
- **Dung lượng đĩa**: lần chạy đầu cần mô hình gốc + bản sao đã sharding (~2 lần kích thước mô hình); dùng `delete_original=True` để thu hồi không gian
- **Nên dùng NVMe SSD**: I/O đĩa là nút thắt; HDD tụt xuống 0,1 token/s hoặc thấp hơn
- **Lỗi phổ biến**: lỗi `MetadataIncompleteBuffer` **thường có nghĩa là bạn đã hết dung lượng đĩa**

---

## 4. Cách Nó Hoạt Động: Bốn Trụ Cột Kỹ Thuật

### 4.1 Sharding Từng Lớp

Mô hình được chia thành các file đĩa theo từng lớp (safetensors với memory-mapping). Trong suy luận, các lớp được tải theo nhu cầu thay vì tất cả cùng một lúc.

### 4.2 Khởi Tạo Trên Meta Device

Dùng `accelerate.init_empty_weights()` để dựng cấu trúc mô hình — **chỉ tạo hình dạng tensor, phân bổ zero VRAM**.

### 4.3 Forward Hooks

Đây là cơ chế lõi. Mỗi lớp transformer có hai hook:

- **Pre-hook**: tải trọng số của lớp đó từ đĩa lên GPU
- **Post-hook**: sau khi tính toán, chuyển trọng số về meta device và gọi `clean_memory()` để giải phóng bộ nhớ

```python
def _pre_hook(self, module, args):
    idx = module._airllm_idx
    if self.prefetching and self._prefetch_future is not None and self._prefetched_idx == idx:
        state_dict = self._prefetch_future.result()
    else:
        state_dict = self._load_streamed_layer(idx)
    module._airllm_moved = self.move_layer_to_device(state_dict)
    # Prefetch lớp tiếp theo
    if self.prefetching:
        nxt = self._next_streamed_idx(idx)
        if nxt is not None:
            self._prefetch_future = self._executor.submit(self._load_streamed_layer, nxt)
```

### 4.4 Ba Tối Ưu Chủ Chốt

- **Prefetching (v2.5+)**: trong khi lớp N tính toán trên GPU, prefetch lớp N+1 từ đĩa — nhanh hơn khoảng **10%**
- **Per-Expert Streaming (v3.1+)**: với các mô hình MoE, chỉ tải các expert được router chọn cho token hiện tại, không phải toàn bộ lớp
- **MXFP4 Packed Transfer (Kimi K3)**: trọng số giữ nén 4-bit xuyên suốt PCIe và chỉ mở rộng trên GPU — **lượng dữ liệu truyền giảm 4 lần**

---

## 5. Triết Lý Thiết Kế

### 5.1 Câu Hỏi Khởi Nguồn Của Tác Giả

Gavin Li bắt đầu từ một câu hỏi đơn giản:

> "Large language models require huge amounts of GPU memory. Is it possible to run inference on a single GPU? If so, what is the minimum GPU memory required?"

**LLM cần rất nhiều VRAM — chúng có thể chạy trên một GPU duy nhất không? Nếu được, VRAM tối thiểu là bao nhiêu?**

### 5.2 Đảo Ngược Kiến Trúc Truyền Thống

Triết lý của AirLLM gói gọn ở: **thay vì nén mô hình để vừa VRAM, nó đặt câu hỏi vì sao toàn bộ mô hình cần nằm trong bộ nhớ ngay từ đầu.** Nó coi GPU là một cache và đĩa là bộ lưu trữ chính, đảo ngược kiến trúc suy luận truyền thống — đánh đổi một chút tốc độ để chạy được trên **phần cứng bạn đã sở hữu**.

### 5.3 Bốn Quyết Định Thiết Kế Cốt Lõi

1. **Không nén theo mặc định**: giữ nguyên chất lượng mô hình đầy đủ; nén hoàn toàn là tùy chọn — lượng tử hóa luôn tốn độ chính xác, câu trả lời của AirLLM là "chỉ lượng tử hóa khi bắt buộc"
2. **Nhắm vào nút thắt I/O, không phải tính toán**: nút thắt của AirLLM là tải từ đĩa, nên nó tối ưu truyền dữ liệu thay vì toán ma trận
3. **Gốc HuggingFace**: dùng API `AutoModel` tiêu chuẩn để mọi mô hình HF hoạt động ngay
4. **Kiến trúc dựa trên hook**: tách rời khỏi các chi tiết attention / rotary / cache của từng kiến trúc qua forward hooks

### 5.4 Quan Điểm Sắc Bén Của Tác Giả Về Lượng Tử Hóa

> "Quantization normally needs to quantize both weights and activations to really speed things up. While in our case the bottleneck is mainly at the disk loading, we only need to make the model loading size smaller. So, we get to only quantize the weights' part, which is easier to ensure the accuracy."

**Tóm gọn**: lượng tử hóa thông thường phải lượng tử hóa cả trọng số lẫn activation mới tăng tốc đáng kể; nhưng vì nút thắt của AirLLM là tải từ đĩa, nó chỉ cần kích thước tải mô hình nhỏ hơn — nên nó chỉ lượng tử hóa phần trọng số, vốn dễ giữ độ chính xác hơn.

> Đây là một hiểu biết sắc bén: **mục tiêu tối ưu quyết định phương pháp tối ưu.** Nếu nút thắt là I/O chứ không phải tính toán, bạn không phải trả giá độ chính xác của activation quantization.

---

## 6. Hiệu Năng: Đánh Đổi Tốc Độ Lấy Dung Lượng

### 6.1 Đánh Đổi Tốc Độ Lấy Dung Lượng

**VRAM (mô hình 70B)**
- Tải đầy đủ truyền thống: ~**140 GB**
- AirLLM từng lớp: ~**4 GB**

**Tốc độ suy luận**
- Truyền thống (A100): 10–20 token/s
- AirLLM (GPU 4GB): ~0,5–2 token/s

**Nút thắt**
- Truyền thống: bộ nhớ video
- AirLLM: I/O đĩa

**Ngưỡng phần cứng**
- Truyền thống: multi-GPU A100/H100
- AirLLM: GPU tiêu dùng 4GB thông thường

- Với lượng tử hóa block-wise 4-bit / 8-bit, tốc độ suy luận tăng lên tới **3 lần** với suy giảm độ chính xác "gần như không đáng kể"
- Như được phản ánh trong các thảo luận cộng đồng llama.cpp: *"AirLLM chỉ đạt tốc độ suy luận bằng GPU trong lúc lớp đang thực thi, và dừng lại khi chờ lớp tiếp theo được tải."*

---

## 7. So Sánh Với Các Cách Tiếp Cận Chủ Đạo

- **AirLLM**: streaming đĩa từng lớp. **Chậm nhưng trung thực, VRAM tối thiểu** — lý tưởng cho xử lý hàng loạt ngoại tuyến
- **llama.cpp / GGUF**: lượng tử hóa trọng số + lai CPU/GPU. Mất chất lượng, nhưng nhanh hơn
- **HuggingFace Accelerate**: offload qua nhiều thiết bị. **Đòi hỏi nhiều GPU**
- **vLLM / TGI**: tối ưu batching + KV cache. **Đòi hỏi VRAM lớn**

> Định vị: AirLLM giải quyết "**tôi không có VRAM lớn**"; những cái khác giải quyết "**tôi có nhiều token cần xử lý hiệu quả**".

---

## 8. Hạn Chế & Lưu Ý

1. **Chậm**: chậm hơn 10–50 lần so với tải đầy đủ; phù hợp tác vụ hàng loạt ngoại tuyến, không phải chat thời gian thực tương tác
2. **Tăng dung lượng đĩa**: lần chạy đầu cần bản gốc + bản sao đã sharding; dùng `delete_original=True` để dọn dẹp
3. **Thời gian sharding đầu tiên**: 10–30 phút tùy kích thước và tốc độ đĩa
4. **Nhạy với I/O**: NVMe SSD được khuyến nghị mạnh mẽ; HDD gần như không dùng được
5. **Yêu cầu cứng của Kimi K3**: CUDA 12 (không phải 13), `transformers==4.56.x` (5.x không tương thích), yêu cầu `flash-attn`

---

## 9. Tóm Tắt: Quan Điểm & Kết Luận

### 9.1 Bài Học Cốt Lõi

- **VRAM không phải là yêu cầu của suy luận, nó là một cache**: AirLLM chứng minh kiến trúc "VRAM là cache, đĩa là bộ nhớ chính", trực tiếp thách thức giả định mặc định rằng "mô hình lớn cần VRAM lớn"
- **Mục tiêu tối ưu quyết định phương pháp**: vì nút thắt là I/O, AirLLM chỉ cần lượng tử hóa trọng số, né được rủi ro độ chính xác của activation quantization — một hiểu biết kỹ thuật tái sử dụng được
- **"Chạy được" thắng "chạy nhanh"**: khi phần cứng bị khóa cứng, hãy giải quyết 0→1 trước, rồi mới đến tốc độ 1→N
- **MoE là chìa khóa cho quy mô cực lớn**: per-expert streaming để một Kimi K3 2.8T chỉ dùng 3,72GB — độ thưa của MoE và suy luận từng lớp là cặp hoàn hảo

### 9.2 Bài Học Cho Nhà Phát Triển

- Không có VRAM lớn? Bạn vẫn có thể chơi với các mô hình lớp 70B: **GPU tiêu dùng + AirLLM là một nền tảng thí nghiệm chi phí thấp**
- Khả năng tương thích liền mạch với HuggingFace đồng nghĩa **chi phí di chuyển gần bằng không**
- Tốt nhất cho xử lý hàng loạt ngoại tuyến, thí nghiệm nghiên cứu, demo giảng dạy — bất cứ thứ gì không nhạy với độ trễ

### 9.3 Kết Luận

Ý nghĩa của AirLLM vượt ra ngoài một giải pháp kỹ thuật; nó là **một minh chứng về một cách suy nghĩ khác**. Khi mọi người giả định "mô hình quá lớn, phải nén nó", AirLLM đặt câu hỏi ngược lại: "**tại sao toàn bộ mô hình phải nằm trong VRAM?**" — nghi ngờ giả định mặc định thường mở khóa những khả năng hoàn toàn mới.

**Tóm tắt một câu**: AirLLM = đánh đổi đĩa lấy VRAM, đánh đổi tốc độ lấy khả năng truy cập — mang các mô hình lớn về với phần cứng thông thường.

---

## References

- Repo: https://github.com/lyogavin/airllm
- PyPI: https://pypi.org/project/airllm/
- Medium của tác giả: https://medium.com/@lyo.gavin/unbelievable-run-70b-llm-inference-on-a-single-4gb-gpu-with-this-new-technique-93e2057c7eeb
- Trích dẫn:

```bibtex
@software{airllm2023,
  author = {Gavin Li},
  title = {AirLLM: scaling large language models on low-end commodity computers},
  url = {https://github.com/lyogavin/airllm/},
  version = {0.0},
  year = {2023},
}
```
