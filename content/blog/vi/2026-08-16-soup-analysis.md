---
title: 'Soup: Công cụ CLI tinh chỉnh LLM 8B ngay trên GPU 4GB của laptop'
date: "2026-08-16"
description: "Phân tích chuyên sâu MakazhanAlpamys/Soup — công cụ tinh chỉnh LLM theo phong cách CLI. Khám phá cách Layer Streaming tinh chỉnh Llama-3.1-8B ở tốc độ 119,6 tok/s trên GPU 4GB, cách kiểm thử bit-exact chứng minh tính đúng đắn, vì sao nó chọn 'từ chối thay vì cảnh báo', cùng triết lý thiết kế dựa trên văn hóa đo lường và hướng dẫn chi tiết"
tags:
  - Soup
  - LLM
  - Fine-tuning
  - LoRA
  - QLoRA
  - Layer Streaming
  - Máy học
  - CLI
categories:
  - Công cụ AI
  - Tinh chỉnh LLM
  - Mã nguồn mở
  - Công cụ CLI
  - Máy học
---

# Soup: Công cụ CLI tinh chỉnh LLM 8B ngay trên GPU 4GB của laptop

## Bối cảnh và giới thiệu dự án

Huấn luyện LLM đến nay vẫn còn đau đớn. Ngay cả những đội ngũ giàu kinh nghiệm cũng dành 30–50% thời gian vật lộn với hạ tầng — SSH vào một chiếc GPU hỏng, chỉnh batch size, cài driver, thử các định dạng lượng tử hóa — thay vì cải thiện mô hình. **Soup** ([github.com/MakazhanAlpamys/Soup](https://github.com/MakazhanAlpamys/Soup)) nhắm thẳng vào nỗi đau đó: một công cụ tinh chỉnh LLM theo phong cách CLI, với lời chào hàng chỉ một câu:

> **Fine-tune and post-train LLMs in one command. No SSH, no config hell.**
> (Tinh chỉnh và hậu huấn luyện LLM chỉ với một lệnh. Không SSH, không ác mộng cấu hình.)

Điều thực sự đưa Soup lên bản đồ là tính năng chủ lực **Layer Streaming (truyền tải theo lớp)**: **tinh chỉnh mô hình 8B trên GPU 4GB của laptop** — đo thực tế Llama-3.1-8B-Instruct + NF4 trên RTX 3050 Laptop 4GB đạt **119,6 tok/s, đỉnh VRAM 3,32 GB**, và **bit-exact (khớp từng bit)** với một lần chạy thường trú thông thường. Kết quả này được tái lập độc lập trên H100 ở 113,00 tok/s (cùng 3,32 GB).

Soup là mã nguồn mở Apache-2.0, Python 3.10–3.12, phiên bản hiện tại v0.73.2, phân phối qua gói PyPI `soup-cli`. Nó được xây dựng và duy trì trên một chiếc laptop 4GB — tác giả nói rằng **đó chính là lý do mọi con số hiệu năng trong tài liệu đều là số đo được chứ không phải số tuyên bố**. Văn hóa đo lường này thấm vào toàn bộ tài liệu, bản ghi benchmark và bài báo của Soup.

## Tổng quan dự án

| Khía cạnh | Nội dung |
|---|---|
| Định vị | Công cụ tinh chỉnh / hậu huấn luyện LLM theo phong cách CLI (`soup-cli`) |
| Điểm bán chính | Tinh chỉnh một lệnh: `soup init --template chat` → `soup train` |
| Tính năng chủ lực | Layer Streaming: tinh chỉnh 8B trên GPU 4GB (NF4 + truyền tải, bit-exact) |
| Công nghệ | Python 3.10–3.12, Typer CLI, cấu hình Pydantic v2, Rich output |
| Phụ thuộc lõi | 6 phụ thuộc nhẹ (typer/rich/pydantic/pyyaml/huggingface-hub/plotext); stack huấn luyện qua extra `[train]` |
| Giấy phép | Apache-2.0 |
| Phiên bản hiện tại | v0.73.2 |
| Phần cứng | CUDA (khuyến nghị), Apple Silicon MPS, CPU (thử nghiệm, rất chậm) |
| Mô hình | Mọi mô hình sinh văn bản HuggingFace (`AutoModelForCausalLM`) + 100+ công thức có sẵn |
| Bài báo | "Exact Layer Streaming: LoRA Fine-Tuning of an 8B Model on a 4 GB Laptop GPU" (Zenodo, v3) |

**Tiền đề thiết kế:** thời gian, tiền bạc và kỹ năng cần để tinh chỉnh đang kìm hãm việc áp dụng AI. Câu trả lời của Soup — tự động hóa mọi thứ, để "tinh chỉnh một mô hình" trở thành thao tác thường nhật mà bất kỳ lập trình viên nào cũng chạy được.

## Triết lý thiết kế cốt lõi

### 1. "Mọi con số hiệu năng đều được đo, không phải tuyên bố"

Nguyên tắc nổi bật nhất của Soup. Mọi tuyên bố hiệu năng đều có **bản ghi đo lường (gate records)** tương ứng, nằm trong `benchmarks/`, được công bố **nguyên văn như khi xảy ra** — bao gồm cả thất bại, giả định hóa ra sai, và các con số đo xong rồi vứt đi. README của benchmarks viết rõ:

> "Đây không phải bản báo cáo dựng lại sau khi hoàn tất. Chúng là nhật ký làm việc được giữ lại trong lúc xây dựng và kiểm chứng từng hạng mục, nên chúng chứa cả thất bại, những giả định hóa ra sai, và những con số đã đo rồi vứt bỏ — theo đúng thứ tự chúng xảy ra."

Triết lý này trực tiếp định hình cấu trúc độ tin cậy của dự án: **không đo lường thì không tuyên bố.**

### 2. "Bit-exact luôn là hai tuyên bố, không bao giờ là một"

Khi kiểm chứng tính đúng đắn của truyền tải, Soup khăng khăng đo và khai báo riêng **chiều forward** (logits, `torch.equal`) và **chiều backward** (từng tensor gradient LoRA). Lý do rất thực tế: trong kiểm chứng H100, forward bit-exact ở mọi quy mô đến 72B trong khi backward, trước khi sửa, sai ở mức trên ~165 MiB mỗi lớp NF4 — forward trông bình thường, đường loss trông khỏe mạnh, còn gradient thì âm thầm sai. Chỉ khai báo "bit-exact at 72B" sẽ che giấu một nửa câu chuyện. Vì vậy bản ghi của nó đánh dấu từng dòng: hướng nào, lượng tử hóa nào, bao nhiêu MiB mỗi lớp — cái nào chưa đo thì ghi "not tested" chứ không để trống.

### 3. Từ chối, đừng cảnh báo

Bước tiền kiểm tra VRAM (pre-flight) **từ chối chạy** một cấu hình mà nó dự đoán không vừa, thay vì cảnh báo. Điều này đến từ bài học tàn khốc trên Windows: trên Linux, một step vượt ngân sách là lỗi OOM cứng; trên Windows, WDDM **âm thầm tràn VRAM sang bộ nhớ host** và lần chạy chỉ chậm đi một bậc độ lớn — đo được đỉnh 9,27 GB trên một card 4,29 GB mà **không hề có ngoại lệ nào được ném ra**. Nếu đọc là "truyền tải chậm", đó sẽ là kết luận sai hoàn toàn.

### 4. In chi phí ra, đừng âm thầm nuốt

Khi base bf16 3B không thể page-lock, Soup tự động rơi vào kho pageable — nhưng **in rõ ràng chi phí của sự rơi này** (GPU utilization tụt từ 96,8% xuống 79,3%) thay vì âm thầm chấp nhận. Tương tự, khi phát hiện Windows bỏ qua `expandable_segments:True`, nó không giả vờ rằng tối ưu hóa đang hoạt động.

### 5. Văn hóa rút lại: thừa nhận khi lời giải thích đã công bố là sai

Bản v3 của bài báo **rút lại một lời giải thích mà chính Soup từng công bố** — "layer streaming bị giới hạn bởi truyền host→device, không phải bởi GPU". Đó là một suy luận từ lần tái lập H100 và chưa bao giờ được đo. Đo ngày 11 tháng 8 năm 2026, nó sai ở cấu hình đã công bố: xóa mọi byte host→device chỉ mua được **1,4%**, luồng tính toán chờ bản sao **0,20%** của step, và step chạy ở **71,3%** trần GEMM cùng phiên của card đó. v1/v2 vẫn giữ nguyên, có thể trích dẫn, không bị sửa — **cách rút lại chính là phát hành một phiên bản mới**, để hồ sơ về "đã tuyên bố gì, tuyên bố khi nào" được lưu trọn vẹn.

### 6. Schema cấu hình là nguồn chân lý duy nhất

`config/schema.py` (Pydantic v2, ~256KB) là nguồn chân lý duy nhất cho mọi trường cấu hình — CLI, pre-flight và trainer đều suy ra từ nó. Kết hợp với quy tắc các phụ thuộc nặng (torch/transformers/peft/trl) được import lười bên trong hàm, không bao giờ ở đầu module, giúp `pip install soup-cli` giữ được lõi nhẹ dùng được (không kéo PyTorch) trong khi stack huấn luyện nạp theo nhu cầu.

## Phân tích sâu kiến trúc kỹ thuật

### Cấu trúc mã nguồn

```
src/soup_cli/
├── cli.py               # Entry CLI chính (Typer, ~26KB)
├── config/schema.py     # Schema cấu hình Pydantic v2 (nguồn chân lý duy nhất)
├── commands/            # Cài đặt các lệnh con (adapters/train/eval/data/ship/...)
├── trainer/             # Bọc trainer (SFT/DPO/GRPO/PPO/KTO/ORPO/SimPO/...)
├── data/                # Parser định dạng dữ liệu, loader, collator, kiểm chứng
├── eval/                # Đánh giá, cổng soup ship, hiệu chuẩn, đấu trường Elo
├── recipes/catalog.py   # 100+ công thức mô hình (~89KB)
├── registry/            # Sổ đăng ký mô hình, băm, lưu trữ
├── cans/                # "Soup Cans": đóng gói/chạy thí nghiệm tái lập được
├── autopilot/           # Tự động tinh chỉnh zero-config
├── mcp_server/          # MCP server
├── monitoring/          # Callback huấn luyện, hiển thị tiến độ, đẩy lên HF
├── plugins/             # Hệ thống plugin
├── migrate/             # Di trú từ axolotl / llamafactory / unsloth
└── cloud/               # Huấn luyện GPU đám mây Modal
```

### Cơ chế Layer Streaming hoạt động thế nào

Đây là linh hồn của Soup. Cơ chế tách thành bốn lớp:

**Lớp 1: thứ gì ở lại VRAM, thứ gì truyền ra ngoài.** LoRA adapter + gradient của chúng + trạng thái optimizer ở lại VRAM (chúng nhỏ). **Base model bị đóng băng nằm trong RAM CPU** (page-locked khi máy cho phép), truyền từng lớp: mỗi lớp decoder được sao vào một trong **hai buffer VRAM được cấp phát trước** (double-buffering) trên một CUDA stream riêng, để việc nạp **chồng lấp** với tính toán của lớp trước.

**Lớp 2: vì sao truyền tải tốn thời gian.** Mỗi lớp được đọc **hai lần** mỗi step — một lần trong forward, một lần khi backward tính lại, vì `dL/dx = Wᵀ · dL/dy` cần trọng số để truyền xuống các lớp dưới. "Đó là vật lý, không phải chi tiết cài đặt." Chi phí đo được: chậm hơn huấn luyện thường trú **1,43×** (đo ở 0,5B — phép so sánh công bằng duy nhất trên máy tham chiếu, vì 1,5B trở lên không thể chạy thường trú ở đó).

**Lớp 3: lượng tử hóa NF4 giải quyết điều gì.** Lượng tử hóa base truyền tải thành NF4 giúp kho RAM nhỏ đi ~4 lần — base 8B thành ~3,6 GB NF4 thay vì ~16 GB bf16. Hai lợi ích: (1) mô hình lớn hơn vừa vào RAM host; (2) **kho vừa vào trần bộ nhớ page-locked của máy** (máy tham chiếu tối đa ~7,1 GB) — page-lock chính là điều kiện để `copy_(non_blocking=True)` thực sự chồng lấp với tính toán. Base bf16 3B (5,55 GB) rơi vào pageable và utilization tụt từ 100% xuống 79,3%; NF4 1,43 GB thì pin được và utilization quay về 100%. Base được lượng tử hóa **một lần, offline, theo từng tensor**, rồi cache; cache shard lấy khóa từ dấu vân tay lượng tử hóa/dtype/thiết bị/checkpoint, nên chuyển `none`⇄`4bit` sẽ re-shard thay vì âm thầm truyền sai byte.

**Lớp 4: tính đúng đắn không phải thứ để đánh đổi.** Một lần chạy NF4 truyền tải **bit-exact** với lần chạy NF4 *thường trú* (cùng byte lượng tử hóa, cùng kernel bitsandbytes) — và đây là **kiểm thử hồi quy**, không phải phép đo một lần.

### Tiền kiểm tra VRAM và sự từ chối

Truyền tải chỉ giới hạn **trọng số**. Nó không làm gì được với activation hay tensor logits — cả hai đều tăng theo `batch × seq`. Với mô hình từ vựng lớn, hạng mục thứ hai lấn át mọi thứ: trên Qwen2.5-0.5B (từ vựng 151.936) ở batch 8, S=512, riêng logits đã là **8,71 GB — gấp 146 lần toàn bộ pool buffer lớp (0,060 GB)**. Vì vậy `soup train` dự đoán đỉnh VRAM trước khi dựng mô hình và **từ chối** lần chạy mà nó dự đoán không vừa:

```
peak VRAM    ~0.48 GB at batch 2 x seq 256 (logits 0.35 GB)
free VRAM    3.46 GB
forecast     5685-8361 tok/s — a compute-bound bound, not a promise
```

Bộ dự đoán được khớp trên mười lần chạy thực, hai mô hình, chênh lệch từ vựng 3,1×, batch 1–8 và hai độ dài chuỗi: **sai số tệ nhất 0,85%, và không bao giờ dự đoán thấp hơn thực tế** — hướng duy nhất an toàn cho một con số được phép chặn lần chạy. Lời từ chối nêu đích danh hai núm xoay thực sự làm nó tăng (`training.batch_size`, `data.max_length`).

### Batch size vs tích lũy gradient

Cả hai đều dùng được, và chúng **không thể thay thế cho nhau**. Đo thực tế (Qwen2.5-0.5B bf16, S=256, kho pin, 50 step):

| batch | accum | batch hiệu dụng | thông lượng | đỉnh VRAM |
|---|---|---|---|---|
| 1 | 1 | 1 | 556,6 tok/s | 0,842 GB |
| 1 | 4 | 4 | 540,1 tok/s | 0,846 GB |
| 4 | 1 | 4 | **1378,0 tok/s** | 2,28 GB |

Tích lũy **trung tính về I/O trên mỗi token** — số lần đọc lớp không đổi vì `accum=N` đọc lại base N lần *và* xử lý N lần token. Thứ nó mua là batch hiệu dụng ở **VRAM không đổi** (0,842→0,846 GB). Còn ở cùng batch hiệu dụng 4, tăng `batch_size` nhanh hơn **2,52×**. Nên quy tắc là: **tăng `batch_size` đến khi pre-flight VRAM từ chối, phần còn lại bù bằng tích lũy** — Soup in lời khuyên này khi thấy bạn đang tích lũy.

### Danh sách từ chối ở lớp cấu hình

Dưới truyền tải, một loạt tổ hợp cấu hình bị **từ chối ngay khi nạp cấu hình**, mỗi mục nêu đích danh bản phát hành sẽ gỡ nó:

- `grpo`/`ppo` bị từ chối **vĩnh viễn**: rollout sinh ra đọc lại mọi lớp mỗi lần sinh một token, phá hủy khấu hao mà truyền tải dựa vào
- `kto` + `batch_size: 1`: số hạng KL của TRL suy biến ở batch 1
- `lora.use_dora`/`use_vera`/các chiến lược khởi tạo không ngẫu nhiên: chúng khởi tạo từ trọng số base thực, mà base nằm trên meta device dưới truyền tải
- `packing`/`multipack`/`unfrozen_parameters`/`lisa_enabled`/`use_fsdp2_compile`...: từng cái viết lại hoặc tái đóng băng cùng một nhóm lớp
- Đặt `stream_source`/`stream_buffers`/`stream_vram_override` khi `stream_layers: false`: bẫy tự bắn vào chân, từ chối

### Mất mát preference qua truyền tải: mô hình tham chiếu miễn phí

v0.72.4 mở truyền tải cho DPO/ORPO/SimPO/KTO. Rủi ro chỉ có một: DPO cần mô hình tham chiếu, và bản sao thứ hai sẽ nhân đôi bộ nhớ, phá vỡ ý nghĩa. Soup dùng **chính base truyền tải đó với adapter tắt** làm tham chiếu — đo ở **0,914×** đỉnh SFT, trong khi ép một instance thứ hai thật tốn **+730 MB, đúng bằng một bản sao trọng số**. Cả bốn mất mát đều bit-exact với lần chạy thường trú. Cái giá trung thực: miễn phí về *bộ nhớ*, không miễn phí về *thời gian* — DPO đọc stack lớp **1,52×** nhiều hơn mỗi step.

### Bản sửa fp16 cho card tiền-Ampere

Đến v0.72.3, dtype của kho truyền tải bị hardcode là bf16 trên **mọi** thiết bị CUDA — toàn bộ tầng notebook miễn phí (T4/P100/V100/GTX 16xx/RTX 20xx) đang truyền một dtype mà GPU của họ không có đơn vị tính toán, và không ai nói ra (nó không thể fail trên card Ampere — nơi mọi con số được đo). Chi tiết then chốt: `torch.cuda.is_bf16_supported(including_emulation=False)` — từ khóa `including_emulation=False` **chịu toàn bộ trọng lượng**, vì lời gọi trần mặc định bao gồm giả lập, và T4 trả lời True. Bản sửa đầu tiên hỏi câu trần và vì thế là no-op đúng trên phần cứng nó nhắm tới — được phát hiện bằng cách chạy proof notebook trên một chiếc T4 thật, không phải bằng suy luận.

## Dữ liệu hiệu năng

### Huấn luyện truyền tải đo thực tế (RTX 3050 Laptop 4GB, Windows 11, LoRA, batch 1, 50 step)

| Mô hình | Lượng tử | Seq | Thông lượng | GPU Util | Đỉnh VRAM | Kho RAM |
|---|---|---|---|---|---|---|
| **Llama-3.1-8B-Instruct** | **NF4** | 512 | **119,6 tok/s** | 100% | **3,32 GB** | 3,60 GB pin |
| Qwen2.5-3B | NF4 | 512 | 264,2 tok/s | 100% | 1,76 GB | 1,43 GB pin |
| Qwen2.5-3B | bf16 | 512 | 143,1 tok/s | 79,3% | 2,15 GB | 5,55 GB pageable |
| Qwen2.5-1.5B | bf16 | 512 | 525,0 tok/s | 96,8% | 1,82 GB | pin |
| Qwen2.5-1.5B | bf16 | 1024 | 487,6 tok/s | 96,7% | 2,96 GB | pin |
| Qwen2.5-0.5B | bf16 | 512 | 978,6 tok/s | 91,4% | 1,47 GB | pin |

**Điểm nhấn: mô hình 8B tinh chỉnh trên card 4GB ở 119,6 tok/s trong 3,32 GB.** Ở tốc độ đó, 1M token huấn luyện là ~2,3 giờ (phép chia từ tốc độ đo được, không phải phép đo riêng).

### Điều gì giới hạn step truyền tải (probe v0.73.0, H100 cùng phiên)

- Step truyền tải chạy ở **71,3%** trần GEMM cùng phiên của card
- Xóa mọi byte host→device mua được **1,4%**; luồng tính toán chờ bản sao **0,20%** của step
- Chi phí riêng lớn nhất của truyền tải là giải lượng tử NF4 theo lớp, ở **9,8%**
- Cut Cross-Entropy (CCE) nhân ba microbatch dùng được, đổi lấy **+9,6%**

### So sánh DeepSpeed (H100, 8 card)

- Truyền tải nhanh hơn DeepSpeed ZeRO-3 offload **2,93×** trong khi VRAM ít hơn **9,7×**
- Một kết quả không tô hồng cho mình: **tám card ZeRO-3 chậm hơn một card huấn luyện thường trú** — vẫn công bố

## Toàn cảnh tính năng

### Nhiệm vụ & phương pháp huấn luyện

SFT, DPO/GRPO/PPO/KTO/ORPO/SimPO/IPO/BCO, tool-calling, PRM, tiền huấn luyện, chưng cất, phân loại, vision/audio/TTS, unlearning, RAFT/RA-DIT — chuyển bằng một trường `task:`. Gia đình PEFT (LoRA/DoRA/LoRA+/rsLoRA/VeRA/OLoRA/NEFTune/PiSSA/ReLoRA/LLaMA Pro/GaLore/YaRN/LongLoRA) nằm trong `docs/peft-and-efficiency.md`.

### Kỹ thuật dữ liệu

Alpaca, ShareGPT, ChatML, cặp preference (DPO/ORPO/SimPO/IPO/KTO), vision, audio, ASR, plaintext, embedding, RAFT — **tự động nhận diện** từ JSONL/JSON/CSV/Parquet/TXT, nên trong đa số trường hợp chỉ cần trỏ `data.train` vào file là xong. Sinh dữ liệu tổng hợp (forge), bảng điểm chất lượng, dataset từ xa, trộn dữ liệu, recipe DAG nằm trong `docs/data.md`.

### Serving & xuất mô hình

Server tương thích OpenAI, endpoint Anthropic Messages, suy luận hàng loạt, xuất GGUF/ONNX/TensorRT/AWQ/GPTQ/BitNet, **giải mã đầu cơ (speculative decoding)** (tự huấn luyện và đo mô hình draft của bạn), autopilot triển khai, Web UI, Agent Forge. `soup serve --model ./output` khởi server chỉ một lệnh.

### Quản trị & tuân thủ

Quản lý vòng đời adapter, sổ đăng ký mô hình, **Soup Cans** (đóng gói/chạy/công bố thí nghiệm tái lập được), vòng xoay dữ liệu `soup loop`, chỉnh sửa tri thức, steering, kiểm soát chuỗi cung ứng (scan/sign/BOM/attest/audit/airgap). Phía tuân thủ: template `init` HIPAA/SOC2/EU-AI-Act/SR-11-7, truy xuất nguồn gốc (BOM/attest/repro-receipt), nhật ký kiểm toán, air-gap, tự sinh model card (`soup card`), cổng CI (`soup ci init`).

### Backend & hệ sinh thái

transformers mặc định, **Unsloth** qua `[fast]` (nhanh 2–5×), **MLX** cho Apple Silicon qua `[mlx]`, huấn luyện GPU đám mây **Modal** qua `[modal]` (`soup train --cloud modal`), MCP server `soup mcp serve`, `soup autopilot` tinh chỉnh zero-config, theo dõi thí nghiệm (mlflow/swanlab/trackio), hệ thống plugin. Thậm chí có **di trú cấu hình** từ axolotl / llamafactory / unsloth.

## Cổng phát hành: soup ship

`soup ship` trả lời một câu hỏi: **mô hình này tốt hơn, hay tôi vừa làm hỏng nó?** Hai chân:

- **Chân 1 (task eval)**: chạy đánh giá nhiệm vụ trên dữ liệu của bạn
- **Chân 2 (cổng hồi quy)**: bộ chấm điểm cố định dựa trên trích xuất, chạy bảy bộ offline đi kèm (MCQ · số học · tool-calling · JSON hợp lệ · an toàn/từ chối) — **không thêm phụ thuộc nào**

```
soup ship --base ./base --adapter ./my-lora --task-eval my_task.jsonl
#   exit 0 = SHIP · 2 = DON'T SHIP · 3 = bad flags · 1 = runtime error
```

Một bản tinh chỉnh thắng nhiệm vụ của bạn nhưng âm thầm làm hỏng tool-calling sẽ nhận **DON'T SHIP**.

Các bản sửa của v0.73.2 phơi bày chính cái bẫy của bộ chấm điểm:

- **`mini_tool_call` từng chấm "vệ sinh dấu ngoặc nhọn"**: mô hình thiếu một dấu đóng, parser rơi về object bên trong, bộ chấm từ chối vì thiếu khóa ngoài — một mô hình đúng 40/40 chỉ đạt 0,225
- **`mini_mmlu` chấm Llama-3.1-8B ở 0,423 — thấp hơn cả mô hình 0,5B** — vì bộ trích xuất không biết `\boxed{C}` và prompt chưa bao giờ yêu cầu một chữ cái. Sửa xong: 0,423 → 0,731
- **Mới: trục prompt vô hại.** Chân 2 trước chỉ gắn cờ *giảm* tỷ lệ từ chối, nên một bản tinh chỉnh từ chối mọi thứ đọc như một cải thiện an toàn đơn điệu — hai mô hình có điểm byte giống hệt trên cả bảy bộ (một cái từ chối mọi yêu cầu vô hại) không thể phân biệt trước cổng. `mini_over_refusal` là tấm gương phản chiếu; ghép với bộ an toàn, **không bên nào chơi khăm được một mình**
- **`--noise-floor N`**: chạy lại base model N lần và từ chối coi bất kỳ delta nào nhỏ hơn độ phân tán đo được là đáng kể. Giải mã tham lam trên GPU không xác định — cùng mô hình, không adapter, năm lần chạy phân tán 0,015–0,020 trước ngưỡng 0,05, và bốn trong sáu delta cặp nằm trong sàn nhiễu
- **Lỗi phía người gọi không phân biệt được với hồi quy**: một generator không gọi được đạt 0,0 ở ba bộ và ném ngoại lệ ở các bộ còn lại — và 0,0 đọc như "trượt mọi mục", tức là nó hỏng theo hướng trông giống một phát hiện

## Hướng dẫn chi tiết

### 1. Cài đặt

```bash
# Lõi nhẹ: CLI + cấu hình + công cụ dữ liệu, không PyTorch
pip install soup-cli

# Thêm stack huấn luyện (torch, transformers, peft, trl, datasets, ...)
pip install "soup-cli[train]"

# Trọn gói (train + serve + ui + data)
pip install "soup-cli[all]"

# Hoặc từ GitHub (bản dev mới nhất)
pip install git+https://github.com/MakazhanAlpamys/Soup.git
```

> **Phải dùng nháy kép.** `"soup-cli[train]"` là cách viết duy nhất chạy được trên mọi shell — cmd.exe, PowerShell, bash và zsh. Nếu bạn chép `'soup-cli[train]'` từ một hướng dẫn cũ và pip từ chối, đó là lý do.

`soup init`, `soup data …` và các lệnh dữ liệu/kiểm tra dùng được trên bản cài nhẹ. Tinh chỉnh (`soup train`) cần extra `[train]`.

### 2. Tạo cấu hình

```bash
soup init                       # wizard tương tác
soup init --template chat       # hoặc bắt đầu từ template
```

Template: `chat`, `code`, `tool-calling`, `medical`, `reasoning`, `vision`, `kto`, `orpo`, `simpo`, `ipo`, `bco`, `rlhf`, `pretrain`, `moe`, `longcontext`, `embedding`, `audio`.

### 3. Huấn luyện, thử nghiệm, phát hành

```bash
soup train --config soup.yaml                 # LoRA, lượng tử, batching — tự xử lý hết
soup chat  --model ./output                    # trò chuyện với mô hình
soup push  --model ./output --repo you/my-model

soup merge  --adapter ./output                              # gộp LoRA vào base
soup export --model ./output --format gguf --quant q4_k_m   # GGUF cho Ollama / llama.cpp
```

### 4. Một soup.yaml hoàn chỉnh

```yaml
base: meta-llama/Llama-3.1-8B-Instruct
task: sft
# backend: unsloth  # nhanh 2-5x, pip install "soup-cli[fast]"

data:
  train: ./data/train.jsonl
  format: alpaca
  val_split: 0.1

training:
  epochs: 3
  lr: 2e-5
  batch_size: auto
  lora:
    r: 64
    alpha: 16
  quantization: 4bit

output: ./output
```

`config/schema.py` là nguồn chân lý duy nhất cho mọi trường.

### 5. Cấu hình tinh chỉnh 8B truyền tải cho card 4GB

```yaml
base: meta-llama/Llama-3.1-8B-Instruct
task: sft
backend: transformers

data:
  train: ./data.jsonl
  format: alpaca
  max_length: 512
  val_split: 0.1

training:
  epochs: 3
  lr: 2e-5
  batch_size: 1           # truyền tải cần kích thước tường minh; "auto" bị từ chối
  quantization: 4bit      # NF4 — kho RAM nhỏ ~4x so với bf16
  gradient_checkpointing: true     # streamer xử lý theo từng lớp
  stream_layers: true     # Bật Layer Streaming
  stream_source: auto     # RAM, tự rơi về ổ NVMe nếu không vừa
  stream_buffers: 2       # double-buffering
  lora:
    r: 64
    alpha: 16

output: ./output
```

### 6. Các lệnh thường dùng

```bash
soup train  --config soup.yaml        # huấn luyện (SFT/DPO/GRPO/PPO/KTO/ORPO/SimPO/...)
soup infer  --model ./output --input prompts.jsonl   # suy luận hàng loạt
soup chat   --model ./output          # chat tương tác
soup serve  --model ./output          # server API tương thích OpenAI
soup merge  --adapter ./output        # gộp LoRA vào base
soup export --model ./output --format gguf           # xuất để triển khai
soup eval   benchmark --model ./output               # đánh giá
soup data   inspect ./data/train.jsonl               # thống kê dataset
soup recipes list                     # 100+ công thức mô hình có sẵn
soup autopilot --model <id> --data d.jsonl --goal chat  # zero-config
soup doctor                           # kiểm tra GPU / phụ thuộc / môi trường
```

### 7. Xử lý sự cố

```bash
soup doctor    # GPU, tài nguyên hệ thống, phụ thuộc, phiên bản — một chỗ
```

- **Windows báo `ImportError: DLL load failed while importing _C`** — cài lại PyTorch đúng phiên bản CUDA: `pip install torch --index-url https://download.pytorch.org/whl/cu121`
- **`soup version` ≠ `pip show soup-cli`** — có nhiều Python; hãy dùng virtualenv

### 8. Dùng Docker

Chạy Soup mà không cần cài CUDA hay PyTorch cục bộ:

```bash
docker pull ghcr.io/makazhanalpamys/soup:latest
docker run --gpus all -v $(pwd):/workspace ghcr.io/makazhanalpamys/soup train --config soup.yaml
```

## Hệ thống kiểm chứng độ trung thực

Việc kiểm chứng tính đúng đắn của Soup là một **giao thức đạt chuẩn xuất bản**:

1. **Bản ghi đo lường công bố nguyên văn**: mọi gate record trong `benchmarks/` đều gồm thất bại, giả định bị bác bỏ và con số bị vứt bỏ. `gate-v0.73.1` còn mang **ba lần đọc bị rút lại giữa chừng** (hai trong số đó trông giống kết quả chính)
2. **Tham chiếu đúng đắn luôn khớp với số học đang kiểm**: lần chạy NF4 truyền tải so với lần chạy NF4 *thường trú*, không bao giờ với bf16 thường trú — vì sẽ giấu khuyết tật thật vào trong sai số lượng tử hóa
3. **Thông lượng đi kèm xung nhịp SM lúc đo**: xung nhịp boost của card này dao động ~13% giữa các phiên, nên "tỷ lệ trần" không kèm xung nhịp là vô nghĩa; trần GEMM đo trong cùng phiên
4. **Số dẫn xuất được gắn nhãn là số học**: "1M token = 2,3 giờ" là phép chia, không phải phép đo đồng hồ treo tường
5. **Giao thức đúng đắn chạy trong CI**: hồi quy bit-exact làm đỏ CI thay vì đến tay người dùng
6. **Kiểm chứng H100 độc lập** (gate-h100-validation.md): forward bit-exact đến 72B; backward sau sửa được re-gate ở 32B (256/256) và 72B (320/320) — đúng quy mô mà khuyết tật tệ nhất. Mang ba chỉnh sửa ghi ngày 2026-08-13, dòng gốc giữ nguyên bên cạnh
7. **Colab T4 miễn phí là bằng chứng yếu nhất**: một lần chạy, không lặp lại, không so sánh đúng đắn — "lưu ở đây vì nó là bằng chứng duy nhất rằng đường truyền tải chạy trên card tiền-Ampere, không phải vì nó gác cổng bất cứ điều gì"

## Tổng kết: những quan điểm chính

1. **Rào cản phần cứng là nút thắt lớn nhất của việc phổ cập tinh chỉnh LLM, và kỹ thuật có thể phá vỡ nó.** Soup chứng minh "tinh chỉnh 8B cần 24GB+" là một giả định mà kiến trúc phần mềm có thể lật đổ — bằng cách thay base thường trú bằng truyền tải từng lớp, một laptop 4GB trở thành thiết bị huấn luyện hợp lệ. Không phải phép màu: đổi 1,43× thời gian lấy không gian.

2. **Trong kỹ thuật LLM, "bit-exact" phải là hai tuyên bố độc lập.** Độ chính xác forward không kéo theo độ chính xác backward — trên ~165 MiB mỗi lớp NF4, gradient âm thầm sai trong khi đường loss trông khỏe mạnh. Coi "đúng" như một khái niệm nguyên khối là cách mở cửa sau cho khuyết tật im lặng.

3. **Văn hóa đo lường là hạ tầng của độ tin cậy.** Công bố các phép đo thất bại, rút lại lời giải thích của chính mình, và công khai kết quả khó xử "8 card chậm hơn 1 card" — những việc này không phải phô trương, chúng là cơ chế để cộng đồng có thể tái lập và tin tưởng. Mọi con số trong tài liệu đều truy vết và đo lại được.

4. **Từ chối an toàn hơn cảnh báo.** Trên nền tảng tràn ngầm (Windows WDDM), cảnh báo là một lời nói dối. Pre-flight "không bao giờ dự đoán thấp" (sai số tệ nhất 0,85%) biến "chạy được không?" từ tai nạn lúc chạy thành quyết định lúc nạp.

5. **Ranh giới của tự động hóa là sự trung thực.** Soup tự phát hiện GPU, batch size, lượng tử hóa — nhưng "auto" bị từ chối dưới truyền tải (nó sẽ probe OOM một mô hình thường trú mà truyền tải không bao giờ nạp), tính năng không dùng được nêu đích danh bản phát hành gỡ nó, và grpo/ppo bị từ chối vĩnh viễn kèm lý do. Tự động hóa không phải là tin tưởng vô điều kiện vào cấu hình.

6. **Cổng phát hành phải chống lại những hồi quy *trông như cải thiện*.** Chính bộ chấm điểm từng bị lừa bởi vệ sinh dấu ngoặc, `\boxed{C}`, và một mô hình an toàn từ chối mọi thứ — kẻ thù của cổng không phải mô hình xấu, mà là **bộ chấm điểm không phân biệt được chúng với mô hình tốt**. Sàn nhiễu thừa nhận chính giải mã tham lam trên GPU cũng phân tán 0,015–0,020.

7. **Nơi phần cứng giới hạn, trung thực thắng tham vọng.** Tác giả nói thẳng dự án được duy trì trên laptop 4GB và việc kiểm chứng đa GPU / Apple Silicon bị chặn bởi phần cứng — nên công việc ra mắt sau các cổng "requires \<hardware\>" trung thực, kèm issue help-wanted nêu chính xác thứ gì đang bị chặn. Giới hạn không phải cái cớ; nó là bộ phân loại cho lộ trình.

## Phân tích tình huống sử dụng

| Tình huống | Mức phù hợp | Ghi chú |
|---|---|---|
| Sinh viên / dev cá nhân | ★★★★★ | Truyền tải 8B trên laptop 4GB hoặc Colab T4 miễn phí; không SSH, không ác mộng cấu hình |
| Tinh chỉnh nhanh miền dọc | ★★★★★ | SFT một lệnh + 100+ template công thức (y tế/code/tool-calling/tuân thủ) |
| Thí nghiệm căn chỉnh preference | ★★★★☆ | Phủ đủ DPO/ORPO/SimPO/KTO/IPO/BCO; mô hình tham chiếu truyền tải miễn phí |
| Tinh chỉnh tuân thủ doanh nghiệp | ★★★★☆ | Template HIPAA/SOC2/EU-AI-Act, BOM/attest/nhật ký kiểm toán/air-gap |
| Chuỗi triển khai sản xuất | ★★★★☆ | Serving/xuất/giải mã đầu cơ/registry/đóng gói Cans, cổng CI |
| Huấn luyện phân tán đa GPU | ★★☆☆☆ | Có DeepSpeed/FSDP, nhưng tác giả nói rõ kiểm chứng đa GPU bị chặn phần cứng |
| Tiền huấn luyện từ đầu | ★★☆☆☆ | Có nhưng không phải hướng chính; truyền tải phủ SFT + bốn mất mát preference |

## Kết luận

Soup là một dự án hiếm có kiểu "phần cứng nhỏ, ý tưởng lớn": lời chào hàng là "tinh chỉnh LLM một lệnh", nhưng thứ thực sự dẫn dắt nó là một triết lý thiết kế trọn vẹn về **độ tin cậy** — văn hóa đo lường, giao thức bit-exact hai tuyên bố, từ chối thay vì cảnh báo, và quản lý bài báo theo kiểu rút lại. Layer Streaming tự thân là một phép hạch toán kỹ thuật đẹp: nó biến việc huấn luyện 8B từ đặc quyền của GPU 24GB thành thao tác thường nhật trên laptop 4GB, với cái giá chỉ 1,43× thời gian, và tính đúng đắn được đóng đinh bằng kiểm thử hồi quy.

Với lập trình viên bình thường, giá trị lớn nhất của Soup có lẽ là: **nó biến "tinh chỉnh một mô hình" từ một hộp đen tốn cả ngày vật lộn hạ tầng thành ba lệnh.** Với người làm kỹ thuật, thư mục `benchmarks/` và hồ sơ rút lại bài báo của nó tự thân là một khuôn mẫu cho "cách làm cho một dự án AI đáng tin cậy".

## Tài liệu tham khảo

- [Kho lưu trữ Soup](https://github.com/MakazhanAlpamys/Soup)
- [Trang chủ trysoup.dev](https://trysoup.dev)
- [PyPI: soup-cli](https://pypi.org/project/soup-cli/)
- [Bài báo: Exact Layer Streaming (Zenodo v3)](https://doi.org/10.5281/zenodo.21918325)
- [Bản ghi đo lường benchmarks/](https://github.com/MakazhanAlpamys/Soup/tree/main/benchmarks)
- [Notebook chứng minh 4GB (Colab T4 miễn phí)](https://github.com/MakazhanAlpamys/Soup/blob/main/notebooks/proof-4gb.ipynb)
- [Video demo Layer Streaming (90s)](https://youtu.be/T1LCErE943E)
- [Soup Discord](https://discord.gg/8RgVbFA6Zq)