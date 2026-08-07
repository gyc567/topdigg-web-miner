---
title: 'DwarfStar (ds4) Chuyên Sâu: antirez (Người Tạo Redis) Đã Xây Dựng Một Engine Suy Luận LLM Bản Địa Như Thế Nào — Giải Pháp Tích Hợp Dọc Cho DeepSeek V4 Flash'
description: "Phân tích hoàn chỉnh về DwarfStar (ds4) của antirez (Salvatore Sanfilippo, người tạo Redis) — một engine suy luận bản địa nhỏ được thiết kế riêng cho DeepSeek V4 Flash/PRO và GLM 5.2. Trong khoảng ~65.000 dòng C, nó mang lại các backend Metal/CUDA/ROCm, streaming SSD, song song pipeline, giải mã suy đoán DSpark, một agent lập trình bản địa, và API tương thích OpenAI như một ngăn xếp tích hợp dọc duy nhất. 87 t/s prefill và 34 t/s sinh mỗi thế hệ trên M5 Max; prefill phân tán lên tới 674 t/s trên hai máy. Từ ý tưởng cốt lõi và kiến trúc đến triết lý thiết kế, hướng dẫn đầy đủ, danh sách tính năng và các điểm chốt chính."
date: "2026-08-04"
author: "TopDigg Research Team"
tags: ["DwarfStar", "ds4", "antirez", "DeepSeek V4", "LLM Inference", "Metal", "CUDA", "ROCm", "Local LLM", "Salvatore Sanfilippo"]
categories: ["Deep Dive"]
keywords: ["DwarfStar", "ds4", "antirez", "DeepSeek V4 Flash", "local inference", "LLM", "Metal", "CUDA", "ROCm", "Redis creator", "speculative decoding", "SSD streaming", "pipeline parallelism", "vertical integration"]
---

# DwarfStar (ds4) Chuyên Sâu: antirez (Người Tạo Redis) Đã Xây Dựng Một Engine Suy Luận LLM Bản Địa Như Thế Nào — Giải Pháp Tích Hợp Dọc Cho DeepSeek V4 Flash

> Ý tưởng cốt lõi: **Đừng xây dựng một framework suy luận đa dụng — hãy xây dựng trải nghiệm sử dụng ngay tối thượng cho một số ít các mô hình mạnh nhất.** DwarfStar (ds4) là dự án mới của antirez (Salvatore Sanfilippo, người tạo Redis): một engine suy luận bản địa nhỏ viết hoàn toàn bằng C, **cố ý hẹp, cố ý sâu** — nạp mô hình, kết xuất prompt, gọi công cụ, quản lý trạng thái KV, máy chủ HTTP và agent lập trình đều được xây dựng và kiểm thử như một ngăn xếp thống nhất. Nó tồn tại duy nhất cho DeepSeek V4 Flash (mục tiêu chính), DeepSeek V4 PRO và GLM 5.2, cung cấp ba backend: Metal (mục tiêu macOS chính), NVIDIA CUDA (bao gồm DGX Spark đa GPU) và ROCm (AMD Strix Halo). Trên phần cứng tiêu dùng — MacBook, DGX Spark, Framework Desktop — nó chạy các mô hình mã nguồn mở hàng tỷ tham số với streaming SSD để phá vỡ trần bộ nhớ. Nó thể hiện toàn bộ suy nghĩ của antirez về LLM cục bộ: **khi mô hình tiến hóa, bộ công cụ cũng nên tiến hóa, thay vì mắc kẹt trong một framework chung chung nhưng tầm thường.**

---

## 1. Tổng Quan Dự Án

### 1.1 Nó Là Gì?

**DwarfStar** là một **engine suy luận LLM bản địa nhỏ** của antirez (Salvatore Sanfilippo), viết tắt **ds4**. Nó **cố ý hẹp** — không phải là một trình nạp GGUF đa dụng, mà là một **ngăn xếp suy luận tích hợp dọc cho các mô hình cụ thể**:

- **Nạp mô hình** (định dạng GGUF với lượng tử hóa expert định tuyến)
- **Kết xuất prompt** (prefill theo khối)
- **Gọi công cụ** (hỗ trợ bản địa)
- **Quản lý trạng thái KV** (với lưu trữ bền trên đĩa)
- **Máy chủ HTTP** (API tương thích OpenAI / Anthropic)
- **Agent lập trình** (triển khai bản địa trong tiến trình)

— tất cả đều được **xây dựng và kiểm thử như một khối thống nhất**, không phải ghép lại với nhau.

### 1.2 Thông Tin Chính

- Kho lưu trữ: `https://github.com/antirez/ds4`
- Số sao: **20,4k**
- Số fork: **1,8k**
- Tác giả: **antirez** (Salvatore Sanfilippo, người tạo Redis)
- Ngày tạo: 2026-05-06
- Lần push cuối: 2026-08-03
- Giấy phép: **MIT** (giữ thông báo bản quyền GGML)
- Ngôn ngữ: **C** (engine lõi ds4.c có ~65.000 dòng)
- Số commit: 428
- Người đóng góp: 11 (antirez dẫn đầu với 281 commit)
- Mô hình được hỗ trợ: **DeepSeek V4 Flash** (chính), **DeepSeek V4 PRO**, **GLM 5.2**
- Backend: **Metal** (macOS chính), **NVIDIA CUDA** (bao gồm đa GPU), **ROCm** (AMD Strix Halo)

### 1.3 Vấn Đề Nó Giải Quyết Là Gì?

Đã có nhiều engine suy luận cục bộ (llama.cpp, MLX, vLLM...), nhưng antirez nhìn thấy một khoảng trống: **các giải pháp hiện có hoặc quá chung chung và không đủ hiệu quả, hoặc quá phân mảnh — mỗi thành phần được kiểm thử riêng lẻ, lỗi chỉ xuất hiện khi lắp ráp.** Câu trả lời của DwarfStar: **xây dựng một ngăn xếp hoàn chỉnh từ dưới lên cho một số ít mô hình mạnh nhất** — nạp, suy luận, API, agent đều được kiểm thử cùng nhau trong một mã nguồn. Điều này cho phép nó đạt hiệu quả cao hơn trên các tổ hợp mô hình × phần cứng cụ thể so với các framework đa dụng.

---

## 2. Ý Tưởng Cốt Lõi

### 2.1 Cố Ý Hẹp — "Chuyên Biệt Cho Một Số ít Mô Hình"

Đây là điểm phân kỳ nền tảng so với llama.cpp và các engine đa dụng khác. llama.cpp cố gắng hỗ trợ mọi mô hình GGUF; DwarfStar **cố ý từ chối tính đa dụng**: nó tồn tại duy nhất cho DeepSeek V4 Flash / PRO và GLM 5.2. Lợi ích là tối ưu sâu cho các kiến trúc cụ thể của các mô hình này (expert MoE định tuyến, định dạng lượng tử hóa cụ thể, cấu trúc bộ nhớ đệm KV) mà không cần duy trì các lớp tương thích cho các mô hình không xác định.

### 2.2 Tích Hợp Dọc — Một Khối Thống Nhất, Không Phải Mảnh Rời

README nói rõ ràng: **"Nạp mô hình, kết xuất prompt, gọi công cụ, trạng thái KV, máy chủ HTTP và agent lập trình được xây dựng và kiểm thử cùng nhau."** Đây không phải là về việc chia sẻ một Makefile — mà là chia sẻ trạng thái, bố cục bộ nhớ và quản lý vòng đời. Ví dụ, lưu trữ bền KV trên đĩa (tên tệp khóa SHA1) và phát lại công cụ của agent lập trình (phát lại DSML chính xác) gắn kết chặt chẽ — agent có thể tiếp tục chính xác trạng thái hội thoại trước đó khi khởi động lại.

### 2.3 Tiết Lộ AI Trung Thực — "Phần Mềm Này Được Xây Dựng Bằng AI; Nếu Điều Đó Làm Phiền Bạn, Đừng Dùng Nó"

antirez viết trong README với sự thành thật hiếm có: **"Phần mềm này được phát triển với sự trợ giúp mạnh mẽ từ GPT 5.5, 5.6, Claude Fable và với con người dẫn dắt ý tưởng, kiểm thử và gỡ lỗi. Nếu bạn không hài lòng với mã do AI phát triển, phần mềm này không dành cho bạn."** Sự minh bạch này — được đặt nổi bật trong thân README, không vùi trong chú thích cuối — là điều không phổ biến trong mã nguồn mở.

### 2.4 Đứng Trên Vai llama.cpp, Không Phải Fork Từ Nó

ds4 **không liên kết với GGML**, nhưng nó công khai thừa nhận "tồn tại nhờ con đường mở ra bởi dự án llama.cpp." Nó giữ lại một số mã GGML (bảng bố cục lượng tử hóa, logic CPU quant/dot, một số kernel) dưới giấy phép MIT, nhưng bản thân engine là mã C viết độc lập. Đây là kiểu "đứng trên vai người khổng lồ và làm điều của riêng mình" kinh điển.

---

## 3. Kiến Trúc

### 3.1 Cây Mã Nguồn

```
ds4/
├── ds4.c                 # Engine suy luận lõi (~65.000 dòng)
├── ds4.h                 # Header API công khai
├── ds4_metal.m           # Backend Metal (~40.000 dòng)
├── ds4_cuda.cu           # Backend CUDA (~30.000 dòng)
├── ds4_rocm.cu           # Backend ROCm
├── ds4_server.c          # Máy chủ API HTTP (~17.500 dòng)
├── ds4_agent.c           # Agent lập trình bản địa (~11.000 dòng)
├── ds4_distributed.c     # Song song pipeline (~8.400 dòng)
├── ds4_tp.c              # Song song tensor (~8.600 dòng)
├── ds4_kvstore.c         # Lưu trữ bền KV trên đĩa
├── ds4_bench.c           # Benchmark thông lượng
├── ds4_eval.c            # Đánh giá năng lực (92 câu hỏi nhúng)
├── rax.c / .h            # Cây Radix (bản đồ phát lại công cụ)
├── metal/                # Mã kernel Metal
├── cuda/                 # Mã kernel CUDA
├── rocm/                 # Mã kernel ROCm
├── gguf-tools/           # Công cụ tạo GGUF, imatrix, lượng tử hóa
├── dir-steering/         # Dữ liệu và vector định hướng
├── speed-bench/          # Script và biểu đồ benchmark
├── tests/                # Vector kiểm thử và test hồi quy
├── Makefile              # Hệ thống build
├── download_model.sh     # Script tải mô hình
├── AGENT.md              # Hướng dẫn AI Agent
├── CONTRIBUTING.md       # Hướng dẫn đóng góp
└── QA_BEFORE_RELEASES.md # Ma trận kiểm thử phát hành
```

### 3.2 Các Trừu Tượng Hóa Cốt Lõi

- **`ds4_engine`**: một phiên bản mô hình đã nạp
- **`ds4_session`**: một dòng thời gian suy luận với bộ nhớ đệm KV trực tiếp và logits
- **`ds4_backend`** enum: `DS4_BACKEND_METAL` / `DS4_BACKEND_CUDA` / `DS4_BACKEND_CPU`
- **`ds4_think_mode`** enum: `DS4_THINK_NONE` / `DS4_THINK_HIGH` / `DS4_THINK_MAX`
- **`ds4_distributed_role`** enum: `NONE` / `COORDINATOR` / `WORKER`
- **`ds4_tp_role`** enum: `NONE` / `LEADER` / `WORKER`

### 3.3 Quản Lý Trạng Thái Phiên

Một lựa chọn thiết kế chính: **Session sở hữu bộ nhớ đệm KV trực tiếp và logits**. Người gọi cung cấp các tiền tố token đầy đủ, và `ds4_session_sync()` tái sử dụng, mở rộng hoặc xây dựng lại trạng thái đồ thị. Bộ nhớ đệm KV trên đĩa dùng **SHA1** của tiền tố byte đã kết xuất làm tên tệp, cho phép khôi phục trạng thái chính xác — agent lập trình có thể tiếp tục liền mạch một cuộc hội thoại sau khi khởi động lại.

### 3.4 Lượng Tử Hóa Bất Đối Xứng

Đảm bảo chất lượng: **chỉ các expert MoE định tuyến được lượng tử hóa** (xuống IQ2_XXS / Q2_K); expert dùng chung, các lớp chiếu và mạng định tuyến vẫn giữ độ chính xác gốc. Vì các expert định tuyến chiếm phần lớn kích thước mô hình nhưng chỉ được kích hoạt một phần trong mỗi lần suy luận, điều này giữ chất lượng đủ cao để gọi công cụ đáng tin cậy dưới các agent lập trình.

---

## 4. Triết Lý Thiết Kế

### 4.1 "Hẹp" Là Một Tính Năng, Không Phải Khiếm Khuyết

Trong một thế giới nơi "tính đa dụng là đức tính", DwarfStar đi theo hướng ngược lại. antirez tuyên bố rõ ràng: **"Ý tưởng về một hệ thống suy luận chuyên biệt cho một số ít mô hình."** Ông chọn tối ưu sâu cho một vài mô hình mạnh thay vì tối ưu rộng cho mọi mô hình — đây là lý do nó vượt trội so với các framework đa dụng trên DeepSeek V4 Flash.

### 4.2 Kiểm Thử Thống Nhất Thắng Lắp Ráp Rời Rạc

Mỗi bản phát hành DwarfStar đều trải qua một ma trận QA hoàn chỉnh (`QA_BEFORE_RELEASES.md`), bao phủ các máy Metal / CUDA / ROCm từ xa. Đây không phải là CI chạy kiểm tra — mà là một con người chạy toàn bộ bộ kiểm thử trên phần cứng thực. Nạp mô hình, suy luận, API, agent đều được xác thực như một khối thống nhất.

### 4.3 Trung Thực Hơn Trau Chuốt

antirez công khai tiết lộ sự tham gia của AI, đánh dấu dự án là chất lượng beta, thừa nhận không hỗ trợ GGUF đa dụng, và tuyên bố giao thức phân tán không có mã hóa. Phong cách "nêu vấn đề trước, ưu điểm sau" này không phổ biến trong mã nguồn mở nhưng vô giá với người dùng — bạn biết ranh giới mà không cần tự va vào chúng.

### 4.4 Đứng Trên Vai Người Khổng Lồ Mà Không Sao Chép

ds4 không liên kết GGML nhưng công khai đứng trên vai llama.cpp. Nó tái sử dụng một số mã theo MIT (bảng lượng tử hóa, kernel), nhưng engine được viết độc lập. Kiểu "đứng trên người khổng lồ và làm điều của riêng mình" kinh điển.

---

## 5. Hướng Dẫn Từng Bước

### 5.1 Build

```bash
make                  # macOS Metal (mặc định)
make cuda-spark       # Linux CUDA, DGX Spark / GB10
make cuda-generic     # Linux CUDA, các GPU CUDA cục bộ khác
make strix-halo       # Linux ROCm, AMD Strix Halo
make cpu              # Build tham chiếu chỉ CPU (chỉ debug)
```

### 5.2 Tải Mô Hình

```bash
./download_model.sh q2-imatrix     # Máy RAM 96/128 GB, q2 tinh chỉnh imatrix
./download_model.sh q2-q4-imatrix  # 96/128 GB, q2 + 6 lớp cuối q4
./download_model.sh q4-imatrix     # Máy RAM >= 256 GB
./download_model.sh mxfp4          # Trọng số expert MXFP4 gốc, ~156 GB
./download_model.sh pro-q2-imatrix # Máy RAM 512 GB, PRO q2
```

### 5.3 Sử Dụng CLI

```bash
# Prompt một lần
./ds4 -p "Explain Redis streams in one paragraph."

# Trò chuyện tương tác
./ds4

# Tắt chế độ suy nghĩ
./ds4 --nothink
```

### 5.4 Khởi Động Máy Chủ

```bash
# Máy chủ cơ bản
./ds4-server --ctx 100000 --kv-disk-dir /tmp/ds4-kv --kv-disk-space-mb 8192

# Batching đa GPU nhiều phiên (8x L40S)
./ds4-server --cuda --cuda-tensor-parallel \
  --gpu-vram auto \
  --gpu-devices 0,2,4,6,1,3,5,7 \
  --model "$MODEL" \
  --ctx 100000 \
  --batched-session 16 \
  --host 0.0.0.0
```

### 5.5 Khởi Động Agent Lập Trình

```bash
./ds4-agent --ctx 100000
```

### 5.6 Streaming SSD (Phá Vỡ Trần Bộ Nhớ)

```bash
./ds4 -m ./ds4flash.gguf \
  --ssd-streaming \
  --ssd-streaming-cache-experts 32GB \
  --ctx 32768
```

### 5.7 Song Song Pipeline (Suy Luận Liên Máy)

```bash
# Máy điều phối (lớp 0-30)
./ds4 -m gguf/...-layers00-30.gguf \
  --role coordinator --layers 0:30 --listen 169.254.43.68 1234

# Máy worker (lớp 31 đến đầu ra)
./ds4 -m gguf/...-layers31-output.gguf \
  --role worker --layers 31:output --coordinator 169.254.43.68 1234
```

### 5.8 Giải Mã Suy Đoán DSpark (Thử Nghiệm)

```bash
./download_model.sh dspark-support
./ds4 -m ds4flash.gguf \
  --mtp gguf/DeepSeek-V4-Flash-DSpark-support.gguf \
  --dspark --temp 0
```

### 5.9 Benchmark

```bash
./ds4-bench \
  -m ds4flash.gguf \
  --prompt-file speed-bench/promessi_sposi.txt \
  --ctx-start 2048 --ctx-max 65536 --step-incr 2048 --gen-tokens 128
```

### 5.10 Đánh Giá Năng Lực

```bash
./ds4-eval -m ds4flash.gguf   # 92 câu hỏi đánh giá nhúng (GPQA, AIME, COMPSEC)
```

---

## 6. Danh Sách Tính Năng

- **Hỗ trợ ba mô hình**: DeepSeek V4 Flash (chính), DeepSeek V4 PRO, GLM 5.2
- **Ba backend**: Metal (macOS chính), NVIDIA CUDA (đa GPU), ROCm (AMD Strix Halo)
- **Streaming SSD**: expert định tuyến được tải theo nhu cầu từ SSD khi mô hình vượt RAM
- **Song song pipeline**: chia các lớp transformer trên nhiều máy như một dây chuyền lắp ráp
- **Song song tensor**: RDMA Thunderbolt 5 trên hai Mac hoặc song song tensor CUDA đa GPU
- **Giải mã suy đoán DSpark**: mô hình nháp phụ trợ tăng tốc sinh (thử nghiệm)
- **Agent lập trình bản địa**: trong tiến trình, phát lại công cụ DSML chính xác, bộ nhớ đệm KV bền trên đĩa
- **API tương thích OpenAI / Anthropic**: `/v1/chat/completions`, `/v1/completions`, `/v1/messages`
- **Bộ nhớ đệm KV trên đĩa**: khóa SHA1, khôi phục trạng thái hội thoại chính xác
- **Ba chế độ suy nghĩ**: Non-think / Think High / Think Max
- **Định hướng**: tinh chỉnh hành vi mô hình ở cấp độ kích hoạt
- **Quản lý năng lượng**: `--power N` giảm năng lượng/nhiệt GPU
- **Công cụ benchmark**: kiểm thử thông lượng `ds4-bench`
- **Công cụ đánh giá**: `ds4-eval` 92 câu hỏi nhúng
- **Công cụ gỡ lỗi**: `--dump-tokens`, `--dump-logprobs`, `--dump-logits`, `--trace`

---

## 7. Các Điểm Chốt Chính

1. **"Hẹp" là một chiến lược bị đánh giá thấp.** Trong cuộc đua vũ trang của các framework đa dụng, DwarfStar chọn tối ưu sâu cho một số ít mô hình — và đó là lý do nó vượt trội hơn các framework đa dụng trên DeepSeek V4 Flash. "Ít là nhiều" trong kỹ thuật không phải là một câu sáo rỗng; đó là một chân lý có ranh giới.

2. **Tích hợp dọc là vũ khí bí mật cho hiệu suất.** Khi nạp, suy luận, quản lý KV, API và agent chia sẻ một không gian trạng thái duy nhất, bạn có bộ nhớ zero-copy, quản lý vòng đời thống nhất và sự gắn kết chặt chẽ mà các tổ hợp rời rạc không thể đạt được. ds4.c 65.000 dòng không phải là phình to — đó là toàn bộ trạng thái trong một struct.

3. **Streaming SSD phá vỡ giả định cũ "bộ nhớ = trần".** Expert định tuyến chiếm phần lớn kích thước mô hình nhưng chỉ được kích hoạt một phần trong mỗi lần suy luận. DwarfStar khai thác điều này: trọng số không định tuyến nằm thường trú, expert định tuyến tải theo nhu cầu từ SSD. Một MacBook 64 GB có thể chạy DeepSeek V4 Flash.

4. **Sự minh bạch của antirez là một chuẩn mực cho mã nguồn mở.** Chủ động tiết lộ sự tham gia của AI, chất lượng beta, không hỗ trợ GGUF đa dụng, giao thức phân tán không mã hóa — phong cách "nêu vấn đề trước" này cho phép người dùng biết ranh giới mà không cần va vào chúng.

5. **Nó đứng trên vai llama.cpp mà không fork nó.** ds4 không liên kết GGML, engine được viết độc lập, nhưng nó công khai thừa nhận đứng trên con đường của llama.cpp. Kinh điển: tôn trọng người đi trước mà không bị ràng buộc bởi họ.

6. **Tối ưu cho phần cứng cụ thể + mô hình cụ thể là điểm ngọt cho suy luận cục bộ tiêu dùng.** Framework đa dụng thỏa hiệp cho mọi phần cứng và mọi mô hình. DwarfStar tối ưu sâu cho Metal + DeepSeek V4 Flash — mang lại suy luận gần như đám mây trên một MacBook 128 GB.

---

## References

- Kho lưu trữ: `https://github.com/antirez/ds4`
- Tác giả: antirez (Salvatore Sanfilippo, người tạo Redis)
- Trọng số mô hình: `huggingface.co/antirez/deepseek-v4-gguf`
- Nguồn mô hình: DeepSeek-AI (`huggingface.co/deepseek-ai/DeepSeek-V4-Pro`)
- Hạ tầng: llama.cpp / GGML (Georgi Gerganov và các cộng sự)
- Trợ giúp AI: GPT 5.5, 5.6, Claude Fable
- Hướng dẫn đóng góp: `CONTRIBUTING.md`
- Ma trận kiểm thử phát hành: `QA_BEFORE_RELEASES.md`
