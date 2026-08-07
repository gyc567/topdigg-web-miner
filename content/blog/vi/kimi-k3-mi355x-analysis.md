---
title: "Kimi K3 × AMD MI355X Phân Tích Chuyên Sâu: Bộ Nhớ Có Phải Là Con Hào Không?"
description: "Bài phân tích toàn diện về bài blog kỹ thuật của Wafer AI về việc phục vụ mô hình mã nguồn mở 2.8T Kimi K3 trên AMD MI355X với tốc độ 952 tok/s/node. Từ luận điểm cốt lõi 'bộ nhớ là con hào', đến speculative decoding và tối ưu prefill AITER, cho đến MI355X đè bẹp B200 với 48 tok/s/$, bài viết giải thích vì sao dung lượng bộ nhớ mang lại cho AMD một lợi thế đo lường được trước NVIDIA ở quy mô mô hình 2.8T — và liệu con hào CUDA có thực sự đang chết hay không."
date: "2026-08-03"
author: "TopDigg Research Team"
tags: ["Kimi K3", "AMD", "MI355X", "Moonshot", "GPU Inference", "MoE", "Speculative Decoding", "ROCm", "Wafer AI", "Open Source Model", "Performance per Dollar"]
categories: ["Deep Dive"]
keywords: ["Kimi K3", "MI355X", "AMD", "Moonshot AI", "Wafer AI", "Memory is the moat", "Performance per dollar", "Speculative decoding", "AITER prefill", "ROCm", "B200", "B300", "Open source LLM", "GPU inference", "MoE"]
---

# Kimi K3 × AMD MI355X Phân Tích Chuyên Sâu: Bộ Nhớ Có Phải Là Con Hào Không?

> Hiểu biết cốt lõi: **Bộ nhớ là con hào.** Khi các mô hình mã nguồn mở ngày càng phình to — từ 753B của GLM-5.2, 1.6T của DeepSeek V4-Pro, cho đến 2.8T tham số của Kimi K3 — nút thắt cổ chai của suy luận không còn là sức mạnh tính toán thô nữa, mà là ai có thể nhét "trọng số mô hình + KV cache" vào VRAM. MI355X của AMD, với 288GB HBM và giá rẻ hơn khoảng 2.4× so với B300, biến lợi thế của mình trước NVIDIA thành một thứ gì đó **đo lường được, thực tế và định lượng được** — lần đầu tiên, trên một mô hình 2.8T.

---

## 1. Tổng Quan Dự Án

### 1.1 Bài Viết Này Nói Về Gì?

Đây là một bài blog kỹ thuật có tựa đề *"Is memory the moat?"* của **Wafer AI** (một startup tối ưu suy luận AI thuộc YC S25), do Ian Ye viết, xuất bản vào ngày 31 tháng 7 năm 2026. Bài viết ghi lại cách nhóm đã phục vụ mô hình mã nguồn mở **Kimi K3 (2.8T tham số)** trên **8 GPU AMD MI355X với tốc độ 952 token/s/node**, và so sánh nó với B200 và B300 của NVIDIA trong một bài benchmark thông lượng-và-chi-phí nghiêm ngặt.

Đây không chỉ là một bằng chứng "chúng tôi đã chạy được mô hình" — đây là sự hội tụ của ba lực lượng:

1. **Moonshot AI** — phát hành một mô hình mã nguồn mở có quy mô chưa từng có;
2. **AMD** — chứng minh rằng ROCm có thể phục vụ các mô hình tiên phong ở cấp độ sản xuất mà không cần hệ sinh thái CUDA;
3. **Wafer AI** — sử dụng giải pháp tối ưu dựa trên agent nội bộ để ép giá trị-trên-mỗi-đô-la tối đa ra khỏi MI355X.

### 1.2 Ba Nhân Vật Chính: Mô Hình, GPU, Nền Tảng

**Nhân vật 1: Kimi K3 (mô hình mã nguồn mở MoE thưa thớt 2.8T tham số)**

Kimi K3 là mô hình Mixture-of-Experts thưa thớt của Moonshot AI: tổng cộng 2.8 nghìn tỷ tham số, nhưng chỉ khoảng ~104 tỷ được kích hoạt cho mỗi token. Mô hình tuyên bố mở ra **kỷ nguyên mới cho mã nguồn mở** — không chỉ vì trí thông minh của nó tiệm cận các mô hình đóng hàng đầu, mà vì nó đẩy trần của "một mô hình mở có thể lớn đến mức nào" lên ngưỡng 3T.

- Tổng tham số: **2.8T**
- Tham số được kích hoạt: **~104B mỗi token**
- Độ dài ngữ cảnh: **1M token** (1,048,576)
- Kiến trúc: MoE + các tối ưu hóa attention ngữ cảnh dài
- Mã nguồn mở: toàn bộ trọng số được phát hành

**Nhân vật 2: AMD MI355X (bộ tăng tốc CDNA 288GB)**

MI355X là bộ tăng tốc dòng Instinct của AMD xây dựng trên kiến trúc CDNA 4 (GFX 9). Mỗi thẻ tích hợp **288GB HBM3** với băng thông bộ nhớ ~**8 TB/s**. Đối với các mô hình siêu lớn "không vừa", dung lượng chính là tính năng giết người.

- Bộ nhớ: **288GB HBM3**
- Phát hành: tháng 6 năm 2025
- Định vị: **lựa chọn thay thế không phải NVIDIA** cho Blackwell (B200/B300)

**Nhân vật 3: Wafer AI (startup tối ưu suy luận)**

Wafer AI là một startup của Y Combinator S25 cung cấp suy luận serverless với "các AI agent tự động tối ưu GPU kernels". Công ty cung cấp các API suy luận tương thích OpenAI cho các mô hình mở như Qwen, GLM, DeepSeek và Kimi, với triết lý "Tối đa hóa trí thông minh trên mỗi watt". Bài viết này là bài blog minh chứng của họ.

### 1.3 Vì Sao Bài Viết Này Quan Trọng

Trong một lĩnh vực bị CUDA/NVIDIA thống trị suốt hơn một thập kỷ, sự kết hợp giữa "mô hình 2.8T mã nguồn mở của Trung Quốc + GPU AMD + một startup tối ưu suy luận" là một trong những thách thức sắc bén nhất cho đến nay đối với quan điểm cho rằng con hào CUDA là không thể phá vỡ. Điều hiếm có: bài đăng này **không phải marketing rỗng tuếch — đây là một ghi chép kỹ thuật trực tiếp từ thực tế với số liệu, phân tích nguyên nhân gốc rễ và mã sửa lỗi**.

---

## 2. Ý Tưởng Cốt Lõi: Bộ Nhớ Là Con Hào

### 2.1 Biến Số Bị Bỏ Qua: Các Mô Hình Đang Ngày Càng "Mập"

Bài viết mở đầu bằng một xu hướng đang diễn ra: **khả năng của mô hình đang tăng lên, nhưng kích thước mô hình còn tăng nhanh hơn.**

- GLM-5.2 có **753B** (0.75T) tham số;
- DeepSeek V4-Pro đạt **1.6T** tham số;
- Kimi K3 nhảy thẳng lên **2.8T** tham số.

Tham số càng lớn đồng nghĩa triển khai càng đắt đỏ và khó khăn. Phục vụ Kimi K3 đòi hỏi hơn **1.5TB VRAM** — trước cả khi cấp phát KV cache cho một ngữ cảnh 1M token.

### 2.2 Vài Con Đường Ít Ỏi Để Phục Vụ Kimi K3

Để chạy Kimi K3 trong một trung tâm dữ liệu, các nhà vận hành chỉ có ba lựa chọn thực tế:

- **Một node B300 8-GPU**: 288GB mỗi GPU, vừa — nhưng cực kỳ đắt;
- **Hai node B200 8-GPU (tổng 16 GPU)**: chia TP16, nhưng phải trả giá phạt truyền thông giữa các node;
- **Một node MI355X 8-GPU**: cũng 288GB mỗi GPU, vừa, và rẻ hơn nhiều.

Lưu ý: bên cạnh B300, **GPU duy nhất không phải NVIDIA có 288GB là MI355X của AMD**. Đó chính là điểm nhấn của tựa đề bài viết — **khi một mô hình đủ lớn đến mức "bắt buộc phải trải qua nhiều node", bản thân dung lượng bộ nhớ trở thành rào cản.**

Theo logic này, MI355X không phải là "ông vua hiệu năng" — nó là "**ông vua dung lượng**".

### 2.3 Cú "Đè Bẹp Dung Lượng" Của MI355X Trước B200

- Một **node 8×MI355X** duy nhất cung cấp ~**2.3TB** VRAM, vừa khít Kimi K3 (trọng số + KV cache 1M token) ở TP8 trên một node;
- Một **node 8×B200** duy nhất chỉ cung cấp ~**1.5TB**, không đủ chứa — buộc phải mở rộng thành **TP16 trải qua hai node**.

Nếp nhăn "không vừa" này phơi bày điểm yếu của B200: **chi phí truyền thông giữa các node**. B200 phải chạy all-reduce xuyên node (RoCE v2 ở ~195 Gb/s) trên đường tới hạn giải mã, trong khi MI355X xử lý mọi thứ trên một node duy nhất.

> Cách diễn đạt của Wafer rất sắc bén: "Hình phạt xuyên node là bất lợi cấu hình duy nhất của B200 — nhưng **đó chính là điểm mấu chốt**: lợi thế dung lượng VRAM của MI355X lần đầu tiên chuyển hóa thành những lợi ích đo lường được và thực tế ở quy mô của Kimi K3."

### 2.4 Các Con Số: MI355X vs B200 vs B300

Trên một benchmark đầu vào 1,024 token / đầu ra 400 token, đo theo từng node (giá theo giá GPU thị trường công khai):

- **Giải mã luồng đơn**: MI355X **118 tok/s**, B200 90 tok/s, B300 172 tok/s
- **Thông lượng tổng hợp đỉnh / node**: MI355X **952 tok/s**, B200 ~249 tok/s (tổng 498 trên 16 GPU chia đều 2 node), B300 1,568 tok/s
- **Thông lượng tổng hợp đỉnh / một GPU**: MI355X **119 tok/s**, B200 31 tok/s, B300 196 tok/s
- **Đỉnh trên mỗi $/GPU-giờ (hiệu năng trên mỗi đô la)**: MI355X **48 tok/s/$**, B200 7 tok/s/$, B300 33 tok/s/$

> **Kết luận:** Về "thông lượng tổng hợp", B300 vẫn dẫn MI355X khoảng ~1.65×; nhưng về "thông lượng trên mỗi đô la", MI355X (48) vượt B300 (33) khoảng ~1.45× và đè bẹp B200 (7) khoảng ~**7×**. Ông vua hiệu năng-trên-mỗi-đô-la chắc chắn là MI355X.

Giá công khai tham khảo: MI355X ~**$2.50/GPU-giờ**, B300 ~**$6.00**, B200 ~**$4.25**.

---

## 3. Kiến Trúc Kỹ Thuật & Thực Hành: Chạy Kimi K3 Trên MI355X

### 3.1 Tin Tốt: Hỗ Trợ Ngay Từ Ngày 0

Wafer nêu ra một tiền đề nhiều người bỏ qua: Kimi K3 có **hỗ trợ Ngày-0 trên AMD** — nó chạy trên ROCm ngay ngày trọng số được phát hành. Điều này bắt nguồn từ mối quan hệ đối tác sâu giữa AMD × Moonshot (trong kỷ nguyên Kimi 2.6 họ đã cùng thiết kế UMBP, lập lịch KV-cache, và bộ tăng tốc ngữ cảnh dài AITER). Vì vậy công việc của Wafer không phải là "chúng tôi có chạy được không", mà là "làm sao để vắt ra thông lượng".

### 3.2 Speculative Decoding

- Kimi K3 ra mắt **không kèm bất kỳ draft tensor nào** (không MTP, không EAGLE);
- Con đường khả thi duy nhất là một **draft khuếch tán khối bên ngoài**: **Kimi-K3-DSpark** của RadixArk;
- Trên CUDA nó chạy ngay lập tức — nhưng trên ROCm nó vấp phải bug đầu tiên:

```text
NameError: name 'top_k_renorm_prob' is not defined.
```

### 3.3 Sửa Lỗi: Không Phải Thiếu Kernel, Mà Thiếu Định Nghĩa

Đây là cuộc mổ xẻ hậu phẫu kỹ thuật hay nhất trong bài viết. Quá trình điều tra của Wafer:

- bộ kiểm chứng accept-sampling của sglang có hai cách để xây dựng phân phối mục tiêu:
  - **đường dẫn dày đặc**: gọi `top_k_renorm_prob`;
  - **đường dẫn nhanh thưa thớt**: đi thẳng qua `torch.topk`.
- Bản build CUDA import `top_k_renorm_prob` từ `sgl_kernel`; nhưng **bản build ROCm chỉ đặt bí danh cho một kernel top-p, để lại `top_k_renorm_prob` chưa được định nghĩa** — vì không có kernel top-k renorm nào trên gfx950 để đặt bí danh.
- Vì vậy, ngay khi một yêu cầu chạm vào đường dẫn dày đặc, bộ kiểm chứng ném ra `NameError` và kéo toàn bộ scheduler sụp đổ theo.

**Cách sửa**: top-k renorm là một thao tác nhỏ — giữ lại k mục cao nhất của vector xác suất của mô hình, gán phần còn lại về 0, chuẩn hóa lại để tổng bằng 1. Một `sort`, một `masked_fill`, một phép chia — chỉ vậy thôi. Wafer chỉ cần nhét nó vào nhánh sampling ROCm của sglang, tái tạo những gì bản build CUDA nhận được từ `sgl_kernel`. Không cần kernel tùy chỉnh.

> Bài học quan trọng: **khi gặp lỗi trên ROCm, phản xạ đầu tiên của bạn là "chúng ta cần một custom kernel" — nhưng thường chỉ là "một định nghĩa bị thiếu".** Đây là một tên hàm không được định nghĩa — vấn đề không phải "không có kernel", mà là "thứ gì đó đã không được export".

**Lợi ích tối ưu** sau khi sửa và củng cố speculative decoding:

- ~**2.2×** thông lượng luồng đơn;
- ~**1.7×** mỗi luồng ở mức tải vừa phải;
- **+18%** thông lượng tổng hợp đỉnh;
- Quan trọng hơn, thông lượng tổng hợp đỉnh đạt được ở **mức độ đồng thời cao hơn** (c64 so với c24 khi không có speculation) — gần với sản xuất thực tế hơn.

### 3.4 Tối Ưu Prefill: decode tok/s Là "Vàng Của Kẻ Ngốc"

Quan sát sắc bén nhất của bài viết: **decode tok/s thường là "vàng của kẻ ngốc" — được tôn vinh, trong khi thời gian đến-token-đầu-tiên (TTFT), thứ người dùng thực sự cảm nhận, lại bị bỏ qua.**

**Đường cơ sở**: một prefill nguội 172k-token giống hệt nhau mất ~**51s** trên MI355X so với ~**23s** trên B300. Đối với các mô hình ngữ cảnh 1M, nhiều khối lượng công việc có prefill khổng lồ (đôi khi nguội) — vài phút prefill có thể làm hàng loạt node phải ngồi không.

**Nguyên nhân gốc rễ: một kernel.** Kimi K3 trên ROCm rơi về Triton attention chung chung chậm chạp vì **kernel prefill MLA nhanh của AITER không tải được**. Nguyên nhân là **lệch hình dạng**, không phải thiếu kernel:

- K3 ở TP8 cho **12 head attention** mỗi rank;
- Đường dẫn MLA của AITER chỉ hỗ trợ các bội số của 4, 8 hoặc 16.

**Cách sửa**: đệm thêm số head từ **12 lên 16**, chạy kernel nhanh, rồi trích xuất 12 head thật từ đầu ra.

**Kết quả**: trên cùng prefill nguội 172k, prefill MLA AITER chạy ở ~**13k tok/s** ở trạng thái ổn định (so với ~4–7k tok/s của Triton fallback) — tăng tốc prefill **~2–3×**. Nó không làm thay đổi thông lượng tổng hợp (decode không đổi); nó thay đổi **người dùng phải chờ token đầu tiên bao lâu**.

---

## 4. Hướng Dẫn: Triển Khai Và Tối Ưu Kimi K3 Trên AMD MI355X

Đây là cách tiếp cận của Wafer được trình bày thành các bước có thể tái lập (môi trường: 8×MI355X, TP8, ROCm, sglang).

### 4.1 Bước 1: Chuẩn Bị Môi Trường

```bash
# Install ROCm and sglang
pip install --upgrade sglang[rocm]

# Pull Kimi K3 weights
huggingface-cli download MoonshotAI/Kimi-K3 --local-dir ./backend
```

Xác nhận phiên bản ROCm và GPU của bạn được phát hiện chính xác (CDNA 4 / gfx950).

### 4.2 Bước 2: Khởi Chạy Server (TP8)

```bash
python3 -m sglang.launch_server \
  --model-path ./backend \
  --served-model-name kimi-k3 \
  --tensor-parallel-size 8 \
  --max-model-len 1000000 \
  --reasoning-parser kimi-k3
```

### 4.3 Bước 3: Bật Speculative Decoding

```bash
# Kimi K3 needs an external draft model, so add:
  --speculative-algorithm block \
  --draft-model RadixArk/Kimi-K3-DSpark
```

(Điều kiện tiên quyết: sửa định nghĩa `top_k_renorm_prob` từ mục 3.3 trước.)

### 4.4 Bước 4: Xác Minh Và Benchmark

```bash
# Test TTFT and generation speed with curl
curl -X POST http://localhost:8119/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{"model":"kimi-k3","messages":[{"role":"user","content":"Explain MoE architecture in one sentence"}],"max_tokens":200}'
```

Theo dõi thời gian đến-token-đầu-tiên và tổng tok/s để xác nhận bạn đang chạm tới prefill AITER nhanh (nếu không, hãy áp dụng đệm head 12→16).

---

## 5. Kết Quả Benchmark: Để Các Con Số Lên Tiếng

### 5.1 Các Phép Đo Của Wafer: MI355X vs B200 vs B300 (phục vụ Kimi K3)

Dữ liệu đầy đủ ở mục 2.4. Đây là **tóm tắt trong một câu**:

- **Hiệu năng trên mỗi đô la**: MI355X **48 tok/s/$** — gấp ~**7×** B200 (7) và ~**1.45×** B300 (33);
- **Thông lượng tổng hợp**: B300 (1,568) vẫn đứng #1, nhưng MI355X (952) bao phủ đại đa số các kịch bản sản xuất;
- **Trải nghiệm luồng đơn**: MI355X 118 tok/s (tốt hơn B200 khoảng 31%), thấp hơn 172 tok/s của B300.

### 5.2 Hiểu Biết Chính: Vì Sao Dung Lượng Bộ Nhớ Trở Thành Yếu Tố Quyết Định

- B200 buộc phải **TP16 trải qua hai node** để chứa Kimi K3, kéo all-reduce xuyên node vào đường tới hạn giải mã;
- MI355X vừa khít "trọng số + KV ngữ cảnh 1M" ở **TP8 trên một node** không có hình phạt xuyên node;
- Vì vậy: **lợi thế dung lượng (288GB) trực tiếp chuyển hóa thành các lợi thế hiệu năng và chi phí tương đương, đo lường được.**

---

## 6. Triết Lý Thiết Kế: Vì Sao "Bộ Nhớ Là Con Hào" Đúng Trong Năm 2026

### 6.1 Cuộc Đua Vũ Trang Kích Thước Mô Hình Ủng Hộ "Bộ Nhớ Lớn"

2.8T của Kimi K3 là một **cuộc đua vũ trang** theo kiểu "càng to càng mạnh, càng mạnh càng to". Mô hình càng lớn, nó càng đòi hỏi các thẻ có bộ nhớ lớn — và đây chính là nơi AMD bước vào: **chiến đấu trên "liệu có vừa không + chi phí mỗi token" thay vì đỉnh FLOPs.**

### 6.2 AMD: Không Theo Đuổi Hiệu Năng, Mà "Dung Lượng + Chi Phí"

AMD đã tụt lại sau CUDA về phần mềm trong nhiều năm, nhưng lần này nó đã thay đổi cuộc chơi:

- **Không cạnh tranh về sức tính toán trên một thẻ**, mà cung cấp **288GB bộ nhớ + rẻ hơn 2.4×**;
- **Tăng gấp đôi đầu tư vào ROCm với hỗ trợ Ngày-0** — các mô hình quen thuộc hoạt động ngay từ ngày đầu;
- Định nghĩa lại "ai được phục vụ các mô hình tiên phong" với "dung lượng × chi phí".

### 6.3 Kiểm Soát Xuất Khẩu Lại Ủng Hộ AMD — Trớ Trêu Thay

Có một bối cảnh lớn: **các chip NVIDIA cao cấp bị hạn chế xuất khẩu sang Trung Quốc** (các sản phẩm dòng H100/B200 nằm trong "giả định từ chối"). Điều này buộc các đội AI Trung Quốc phải tìm giải pháp thay thế:

- **AMD** trở thành lựa chọn "tiết kiệm chi phí, hợp pháp" — rẻ hơn, ít bị giám sát quản lý hơn, không nằm ở tầng từ chối khắc nghiệt nhất;
- Vì vậy "**các mô hình tiên phong Trung Quốc + thẻ AMD + các startup nhạy cảm chi phí**" tạo thành một **vòng tròn đạo đức**: mô hình lớn hơn cần bộ nhớ lớn hơn → AMD cung cấp dung lượng lớn rẻ → nhiều đội áp dụng AMD hơn → nhiều nhà cung cấp đầu tư vào tối ưu ROCm hơn → khoảng cách phần mềm đóng lại nhanh hơn.

### 6.4 Tuyên Bố Tối Thượng Của Wafer: Agent Tối Ưu Đang Chấm Dứt "Độc Quyền CUDA"

- Niềm tin của Wafer: thay vì chờ đợi các CUDA kernels được trao cho bạn, **hãy dùng AI agents để tự động tối ưu kernels**;
- Kết luận của họ đưa ra một khẳng định táo bạo: **"SOTA trên AMD đã cận kề"**;
- Bài viết kết thúc bằng một câu hỏi khiêu khích: **"Con hào CUDA có chết không?"**

---

## 7. Tóm Tắt: Quan Điểm Và Kết Luận

### 7.1 Các Quan Điểm Cốt Lõi

1. **Dung lượng bộ nhớ là cánh cổng cứng cho các mô hình thế hệ tiếp theo**. Khi một mô hình trở nên quá lớn so với một node duy nhất, ai nhét vừa "trọng số + KV cache" sẽ thắng cuộc đua triển khai.
2. **Chọn phần cứng theo "hiệu năng trên mỗi đô la".** 48 tok/s/$ của MI355X gấp 7× B200 và 1.45× B300 — ông vua giá trị không thể tranh cãi.
3. **Khoảng cách phần mềm của AMD đang đóng lại nhanh chóng (đặc biệt nhờ agents)**. Wafer khôi phục hiệu năng cấp sản xuất chỉ với hai lỗi "thiếu định nghĩa / lệch hình dạng" — không cần bất kỳ custom kernel nào.
4. **TTFT là trải nghiệm người dùng thực sự cảm nhận**. decode tok/s bị tôn vinh; độ trễ token đầu tiên mới là thật — vì vậy tối ưu prefill (12→16 head, AITER) không phải để phô trương, mà là đang tiết kiệm thời gian cho người dùng.

### 7.2 Bài Học Cho Các Nhà Phát Triển

- Trước khi triển khai, hãy tự hỏi: **bộ nhớ của GPU này có vừa "trọng số + ngữ cảnh" không?** — quan trọng hơn việc săn đuổi "số GPU / FLOPs".
- Đừng bị mê hoặc bởi decode tok/s — **hãy nhìn vào độ trễ token đầu tiên của bạn trước**.
- Khi gặp lỗi ROCm, hãy gỡ lỗi bình tĩnh: **nhiều lỗi là "chưa định nghĩa / lệch hình dạng" thay vì "thiếu kernel"** — một dòng sửa thường là đủ (`top_k_renorm_prob`, đệm head 12→16 là những ví dụ thực tế).

### 7.3 Kết Lời

Quay lại câu hỏi ở tựa đề: **con hào CUDA có chết không?**

Nếu "con hào" nghĩa là các điểm hiệu năng đỉnh — rõ ràng là chưa. Nhưng nếu bạn định nghĩa nó là "**bạn có thể mua được bao nhiêu trí thông minh bằng tiền**" — bài viết này đưa ra một câu trả lời không thể rõ ràng hơn: **bộ nhớ đã trở thành con hào mới, và sự kết hợp AMD + mã nguồn mở Trung Quốc đang đào cho con hào đó rộng thêm.**

Các tín hiệu đáng theo dõi: khi kích thước các mô hình mở liên tục leo thang, khi hỗ trợ Ngày-0 của AMD trở nên thường lệ, khi các framework suy luận tối ưu sâu hơn cho ROCm — câu trả lời cho "có nhất định phải là một thẻ N không?" đang dịch chuyển từ "tất nhiên rồi" sang "không hẳn".

---

## References

- Wafer AI Blog *"Is memory the moat?"*: https://www.wafer.ai/blog/kimi-k3-mi355x
- Kimi K3 official release: https://www.kimi.com/blog/kimi-k3
- AMD MI355X official page: https://www.amd.com/en/products/accelerators/instinct/mi350/mi355x.html
- AMD official Kimi K3 Day-0 technical article: https://www.amd.com/en/developer/resources/technical-articles/2026/kimi-k3-on-amd-instinct-gpus.html
- DeepLearning.AI *The Batch* analysis: https://www.deeplearning.ai/the-batch/kimi-k3-reveals-how-a-giant-frontier-ai-model-works
- VentureBeat coverage: https://venturebeat.com/technology/chinas-moonshot-ai-releases-kimi-k3-the-largest-open-source-model-ever-rivaling-top-u-s-systems
- vLLM K3 support: https://vllm.ai/blog/2026-07-27-k3
