---
title: "VoiceStudio: Trạm làm việc giọng nói mã nguồn mở chạy cục bộ — Phân tích kiến trúc và hướng dẫn thực chiến với 16 engine TTS + 11 engine ASR"
date: "2026-09-03"
author: "ERIC"
description: "Phân tích sâu VoiceStudio — nền tảng giọng nói mã nguồn mở chạy hoàn toàn cục bộ: nhân bản giọng nói zero-shot, lồng tiếng video, tạo văn bản bằng giọng nói, phiên âm và sản xuất sách nói, 646 ngôn ngữ, 16 engine TTS + 11 engine ASR, kèm hướng dẫn thực chiến và triết lý thiết kế cơ chế tiếp nhận engine"
tags:
  - VoiceStudio
  - TTS
  - Nhận diện giọng nói
  - Nhân bản giọng nói
  - AI cục bộ
  - Mã nguồn mở
categories:
  - Công cụ AI
  - Tổng hợp giọng nói
  - Dự án mã nguồn mở
  - Ưu tiên cục bộ
keywords:
  - VoiceStudio
  - Nhân bản giọng nói
  - Lồng tiếng video
  - WhisperX
  - TTS cục bộ
---

# VoiceStudio: Trạm làm việc giọng nói mã nguồn mở chạy cục bộ — Phân tích kiến trúc và hướng dẫn thực chiến với 16 engine TTS + 11 engine ASR

> **Địa chỉ dự án**: https://github.com/debpalash/VoiceStudio
> **Giấy phép**: AGPL-3.0 (mã ứng dụng); các model tải về giữ nguyên giấy phép upstream của từng model
> **Tóm tắt một câu**: VoiceStudio là nền tảng giọng nói mã nguồn mở chạy hoàn toàn cục bộ, bao phủ nhân bản giọng nói, thiết kế giọng nói, lồng tiếng video, tạo văn bản bằng giọng nói, phiên âm, sản xuất sách nói, hỗ trợ 646 ngôn ngữ, không cần tài khoản, API Key hay gói thuê bao.

---

## I. Giới thiệu dự án

### 1.1 Định vị

VoiceStudio (tiền thân OmniVoice-Studio) là lựa chọn thay thế chạy cục bộ cho ElevenLabs. Khác biệt không nằm ở số lượng tính năng, mà ở đường dữ liệu: âm thanh và văn bản mặc định ở lại máy người dùng; các chức năng cần mạng là tùy chọn bật rõ ràng, không phải hành vi mặc định.

| Khía cạnh | VoiceStudio | Dịch vụ giọng nói được lưu trữ |
|-----------|-------------|--------------------------------|
| Kịch bản phù hợp | Công việc riêng tư, ngoại tuyến, tự xây dựng, thông lượng cao | Bắt đầu nhanh, khỏi quản lý model |
| Đường dữ liệu | Mặc định cục bộ; chức năng từ xa bật rõ ràng | Âm thanh và văn bản do nhà cung cấp xử lý |
| Chi phí | Phần mềm miễn phí, tự túc phần cứng | Gói thuê bao, điểm tính phí hoặc API đo lường |
| Dùng ngoại tuyến | Tải model xong dùng được | Thường cần mạng |
| Không gian tùy biến | Mã nguồn, engine, model, API, định tuyến mở toàn bộ | Giới hạn trong tùy chọn của nhà cung cấp |
| Trách nhiệm bảo trì | Người dùng tự lo cập nhật, đĩa và sức tính toán | Nhà cung cấp lo hạ tầng |

### 1.2 Dữ liệu cốt lõi

- 16 engine TTS, 11 engine ASR, chuyển đổi bằng Ctrl/Cmd+E trong Model Catalogue
- Danh mục 646 ngôn ngữ TTS (phạm vi và chất lượng thực tế phụ thuộc engine đã chọn)
- Nền tảng: macOS 13.3+ (Apple Silicon), Windows 10/11 x64, Linux x86_64 (glibc 2.39+), Docker
- Sức tính toán: CUDA, Apple Silicon MPS/MLX, ROCm (Linux), CPU, Worker từ xa tùy chọn
- Giao diện: ứng dụng desktop, API REST/SSE/WebSocket cục bộ, API âm thanh tương thích OpenAI, MCP Server
- Lưu trữ: giọng nói, dự án, cài đặt, đầu ra mặc định toàn bộ trên máy

### 1.3 Danh sách chức năng

| Khu vực chức năng | Nội dung |
|-------------------|----------|
| Nhân bản giọng nói | Tổng hợp zero-shot từ đoạn âm thanh tham chiếu ngắn, 3 giây dùng được, 5–15 giây tốt hơn |
| Thiết kế giọng nói | Mô tả độ tuổi, giọng điệu, cao độ, phong cách bằng lệnh văn bản, tạo giọng mới |
| Lồng tiếng video | Phiên âm → dịch → giữ nguyên người nói → tổng hợp → xuất video |
| Truyện và sách nói | Kịch bản nhiều nhân vật, nhập EPUB/PDF, render theo chương, xuất .m4b |
| Tiện ích tạo văn bản bằng giọng nói | Phím tắt cấp hệ thống, phiên âm thời gian thực, tùy chọn dùng LLM cục bộ để dọn văn bản |
| Tách giọng nói | Demucs tách lời nói và nhạc nền |
| Tách người nói | Gắn nhãn người nói với Pyannote và WhisperX |
| Hàng đợi hàng loạt | Xếp hàng tác vụ âm thanh/video lớn + theo dõi thư mục |
| Danh mục model | Cài đặt, gỡ cài đặt, chọn, định tuyến model TTS/ASR/LLM |
| Tự động phát hiện GPU | Định tuyến CUDA / MPS / ROCm / CPU, kiểm tra từng engine |
| Thủy ấn AI | Nhúng và phát hiện âm thanh tổng hợp bằng AudioSeal |
| MCP Server | Cung cấp công cụ tổng hợp và phiên âm cho các client như Claude Code, Cursor |
| Chẩn đoán | Tự kiểm tra, nhật ký lỗi, gói hỗ trợ đã che thông tin nhạy cảm |

### 1.4 Cấu trúc dự án

```
frontend/src-tauri/    Tauri v2 桌面壳（Rust）：窗口、托盘、快捷键、更新器
frontend/src/          React UI、Zustand 状态、API 与事件客户端、i18n
backend/api/           REST 路由、schema、认证边界、流式输出
backend/services/      生成、配音、音频处理、持久化
backend/engines/       隔离的可选引擎适配器
backend/worker/        带认证的远程算力与任务传输
omnivoice_data/        项目、声音、设置、日志、SQLite 状态
scripts/ deploy/       开发、打包、容器、发布、CI
```

Phân tầng kiến trúc: vỏ desktop Tauri kết nối với React UI qua IPC; UI kết nối backend FastAPI qua HTTP/SSE/WebSocket tại localhost:3900; bên trong backend là registry engine, pipeline lồng tiếng/âm thanh/văn bản dài, API tương thích OpenAI và MCP Server, trạng thái lưu vào SQLite + migration Alembic.

---

## II. Hướng dẫn chi tiết

### 2.1 Cài đặt

| Nền tảng | Gói | Ghi chú |
|----------|-----|---------|
| macOS 13.3+ | Apple Silicon DMG | Lần đầu chạy cần chuột phải → Mở, vượt qua Gatekeeper |
| Windows 10/11 | x64 MSI | Chọn bản current-user để cài không cần quyền admin |
| Linux | AppImage | x86_64, glibc 2.39+ |
| Docker | Nhiều profile | CUDA, ROCm, CPU, GPU thuần Worker |

Khởi động Docker một dòng:

```bash
docker run -d -p 127.0.0.1:3900:3900 \
  -v omnivoice-data:/app/omnivoice_data \
  --name voicestudio \
  palashdeb/omnivoice-studio:stable
```

Lần đầu chạy sẽ tạo môi trường Python được quản lý và tải các model mặc định, sau đó tái sử dụng. Không muốn cài đặt có thể dùng notebook Google Colab để trải nghiệm trên mây (lưu ý: Colab là sức tính toán từ xa, âm thanh tải lên không nằm trên máy).

### 2.2 Chạy nhân bản giọng nói trong 5 phút

1. Mở VoiceStudio → Voice Cloning
2. Thêm một đoạn mẫu giọng nói sạch. 3 giây dùng được; 5–15 giây tốt hơn
3. Nhập văn bản, chọn ngôn ngữ, bấm Generate

Lưu ý: trong nhân bản zero-shot, âm thanh tham chiếu là "câu lệnh" chứ không phải "dữ liệu huấn luyện". Mẫu cần đáp ứng: một người nói, gần mic, không lẫn nhạc nhiễu vang, ngữ điệu khớp với đầu ra mong muốn. Mẫu dài hơn không đồng nghĩa tốt hơn.

### 2.3 Chạy từ mã nguồn và phát triển

Điều kiện tiên quyết: Node 20+/Bun, Python 3.11+.

```bash
git clone https://github.com/debpalash/VoiceStudio.git
cd VoiceStudio
bun install
bun run desktop        # 桌面版；首次自动用 uv 配置 Python 依赖
bun run dev            # 浏览器 UI
```

Lệnh chẩn đoán:

```bash
uv run python backend/main.py --diagnose --deep
```

### 2.4 API tương thích OpenAI

Trỏ base_url của client OpenAI về backend cục bộ là tái sử dụng được mã hiện có:

```python
from openai import OpenAI

client = OpenAI(base_url="http://localhost:3900/v1", api_key="local")
with client.audio.speech.with_streaming_response.create(
    model="tts-1",
    voice="<profile-id>",
    input="Made on my own hardware.",
    response_format="wav",
) as response:
    response.stream_to_file("speech.wav")
```

Kiểm thử bằng cURL:

```bash
curl http://localhost:3900/v1/audio/speech \
  -H "Content-Type: application/json" \
  -d '{"model": "tts-1", "input": "Made on my own hardware.", "voice": "default", "response_format": "wav"}' \
  --output speech.wav
```

| Endpoint | Mục đích |
|----------|----------|
| POST /v1/audio/speech | TTS, xuất mp3/opus/aac/flac/wav/pcm |
| POST /v1/audio/transcriptions | STT, xuất json/text/verbose_json/srt/vtt |
| WS /v1/audio/transcriptions/stream | Phiên âm PCM/WebM thời gian thực, kèm kết quả trung gian và sự kiện kết thúc phiên |
| GET /.well-known/voicestudio-speech | Phát hiện kênh truyền HTTP/WebSocket/MCP/điều khiển tạo văn bản bằng giọng nói |
| GET /v1/audio/voices | Liệt kê hồ sơ giọng nói và engine cục bộ |

### 2.5 Tích hợp MCP

VoiceStudio gắn MCP Server tại `http://localhost:3900/mcp`, các công cụ gồm `generate_speech`, `clone_voice`, `transcribe`:

```json
{
  "mcpServers": {
    "voicestudio": {
      "url": "http://localhost:3900/mcp"
    }
  }
}
```

Client cần truyền tải stdio dùng shim tích hợp sẵn:

```json
{
  "mcpServers": {
    "voicestudio": {
      "command": "python",
      "args": ["-m", "backend.mcp_shim"],
      "cwd": "/path/to/VoiceStudio"
    }
  }
}
```

### 2.6 Chọn engine: đối chiếu theo phần cứng

| Phần cứng | TTS đề xuất | ASR đề xuất | Lý do |
|-----------|-------------|-------------|-------|
| Apple Silicon (M1–M4) | MLX-Audio, OmniVoice (MPS) | MLX Whisper, Parakeet MLX | Bộ nhớ thống nhất, độ trễ thấp nhất trên macOS |
| NVIDIA GPU (8 GB+) | OmniVoice, CosyVoice 3 | WhisperX | Nhân bản zero-shot độ trung thực cao, nhãn thời gian cấp từ |
| Ít VRAM / thuần CPU | PocketTTS, Sherpa-ONNX, KittenTTS | Moonshine, Faster-Whisper (int8) | Chiếm ít bộ nhớ, tối ưu suy luận trên CPU |

Thiết bị tự động phát hiện (CUDA/ROCm/MPS/CPU), có thể khóa thủ công trong Settings → Performance & Device hoặc qua `OMNIVOICE_DEVICE`.

---

## III. Triết lý thiết kế

### 3.1 Local-first: ưu tiên cục bộ là trạng thái mặc định, không phải từ khóa marketing

Các luồng công việc cốt lõi nằm trên máy; chức năng mạng (Worker từ xa, endpoint ASR bên ngoài) là tùy chọn bật rõ ràng. Gọi API loopback không cần khóa; truy cập từ xa cần chia sẻ PIN hoặc API Key. ASR loopback dùng HTTP được và âm thanh không rời máy; endpoint không phải loopback bắt buộc HTTPS, không theo redirect. Phân tích tắt mặc định, bật lên cũng chỉ gửi siêu dữ liệu không nội dung trong danh sách cho phép — không gửi văn bản, âm thanh, tên file, dữ liệu dự án.

### 3.2 Engine không phải danh sách, mà là vị trí: cơ chế tiếp nhận engine-acceptance

VoiceStudio tích hợp sẵn 16 engine TTS. Số lượng engine chỉ là tài sản khi "mỗi engine chạy được trên mỗi nền tảng", nếu không là đống chồng trong hàng đợi hỗ trợ, làm suy yếu cam kết "chạy được ngay lần đầu". Vì vậy engine mới là "tuyển dụng cho một vị trí", không phải "thêm vào danh sách".

**Bảng vị trí** (mỗi vị trí chỉ có một người giữ):

| Vị trí | Người giữ hiện tại |
|--------|------------------|
| Chất lượng nhân bản zero-shot tốt nhất | omnivoice |
| Phủ ngôn ngữ rộng nhất | omnivoice |
| Cách ly sự cố model mặc định | omnivoice-subprocess |
| Render CPU nhanh nhất / độ trễ thấp nhất | Trống |
| Biểu cảm tiếng Trung/Nhật tốt nhất | cosyvoice, indextts2 |
| Tiếng Anh thời gian thực trên CPU, kích thước cực nhỏ | kittentts, supertonic3 |
| Độ chính xác phiên âm tốt nhất | whisperx, faster-whisper |
| Phiên âm nhanh nhất trên Apple Silicon | parakeet-mlx, mlx-whisper |
| Cách ly sự cố phiên âm | faster-whisper-isolated |

Đề xuất phải "giành vị trí từ tay người giữ hiện tại bằng dữ liệu", hoặc "nhận vị trí chưa ai phủ". "Điểm benchmark khá" không phải vị trí.

**Ngưỡng tiếp nhận**, thiếu một điều là từ chối:

1. Nêu tên vị trí — giành vị trí nào, tại sao người giữ hiện tại không phủ;
2. Giấy phép sạch, dùng được thương mại, kiểm cả trọng số lẫn mã — điều này kết thúc nhiều đề xuất nhất;
3. Dùng được toàn nền tảng hoặc tùy chọn rõ ràng — phải có đường CPU, engine chỉ chạy được trên một loại thẻ tăng tốc phải chạy chế độ hạ cấp thay vì vỡ luôn;
4. Khớp giao diện adapter hiện có (TTSBackend / SubprocessBackend), không sửa pipeline cốt lõi; xung đột phụ thuộc đi sidecar;
5. Kèm kiểm thử CI smoke trong cùng PR, không có GPU thì làm mock sidecar;
6. Chỉ định steward (người chịu trách nhiệm) 12 tháng, không có steward thì không hợp nhất — đây là ranh giới giữa "chiều rộng" và "nợ";
7. Cung cấp bằng chứng nhu cầu: yêu cầu thật, luồng công việc thật, người dùng thật.

**Cơ chế thoát**: engine không có steward và không qua kiểm thử smoke trong hai phiên bản liên tiếp bị lưu trữ. Lưu trữ không phải phán xét, mà là cách giữ cho các engine còn sống đáng tin. **Engine không khớp giao diện có thể sống ngoài cây chính** — giao diện adapter là công khai, cài xong chọn theo id là dùng; dự án thà liên kết engine bên ngoài tốt còn hơn nuôi engine nội bộ nửa vời maintained.

### 3.3 Ranh giới năng lực thất bại rõ ràng, không hạ cấp âm thầm

Engine không hỗ trợ nhân bản không giữ được người nói tham chiếu trong tác vụ lồng tiếng hay tác vụ hàng loạt có khóa giọng. Cách xử lý của VoiceStudio là **từ chối tác vụ**, không phải đổi engine âm thầm. Hành vi có thể dự đoán được ưu tiên hơn bề mặt chức năng "cái gì cũng chạy".

### 3.4 Dự trữ giao diện cho kỷ nguyên Agent

Cùng một backend phục vụ đồng thời gian REST/SSE/WebSocket, API âm thanh tương thích OpenAI, MCP Server, sidecar điều khiển tạo văn bản bằng giọng nói bằng Rust (có thể bị Herdr, Agent lập trình, VS Code, TUI kích hoạt luồng tạo văn bản bằng giọng nói cấp hệ thống). Dự án còn phân phối kèm Agent skill (`npx skills add debpalash/VoiceStudio`). Giả định thiết kế: con người không phải người tiêu thụ duy nhất, AI Agent cũng là người dùng hạng nhất.

### 3.5 Ranh giới trách nhiệm viết vào sản phẩm

Tích hợp mặc định thủy ấn không nhận thấy được bằng AudioSeal, dùng để phát hiện âm thanh tổng hợp; cần có sự cho phép rõ ràng của người nói trước khi nhân bản; script gỡ cài đặt chạy dry-run trước khi xóa. Yêu cầu đạo đức tồn tại dưới dạng chức năng, không phải lời kêu gọi trong tài liệu.

---

## IV. Tổng kết: quan điểm và kết luận

### 4.1 Sáu quan điểm cốt lõi

1. **Ưu tiên cục bộ là quyết định kiến trúc, không phải cách phát hành.** Đường dữ liệu, ranh giới xác thực (loopback không khóa/từ xa cần PIN), ép HTTPS, phân tích tắt mặc định — mỗi chi tiết đều có phần cài đặt đỡ. Riêng tư là trạng thái mặc định, không phải mục cài đặt.

2. **"Nhiều engine" là bài toán quản lý nợ.** Cơ chế engine-acceptance biến việc tiếp nhận engine thành cạnh tranh vị trí: đặt tên vị trí, giành vị trí bằng dữ liệu, giấy phép có quyền phủ quyết một phiếu, steward 12 tháng, liên tục bị bỏ bê là lưu trữ. Quy tắc này áp dụng cho mọi dự án muốn tích hợp nhiều model bên thứ ba.

3. **Hạ cấp âm thầm là chất ăn mòn lòng tin của hệ thống.** Engine không nhân bản được nhận việc rồi đổi engine âm thầm, người dùng nhận kết quả không thể dự đoán. Từ chối tác vụ rẻ hơn đầu ra sai.

4. **Giao diện adapter công khai = mở rộng sinh thái không cần đi qua kho chính.** Engine ngoài cây chính cắm theo id là dùng. Dự án dùng "liên kết engine bên ngoài tốt" thay cho "nuôi engine nội bộ nửa vời maintained", thu hẹp diện tích bảo trì.

5. **API tương thích OpenAI là đường tích hợp rẻ nhất.** Client OpenAI hiện có đổi một dòng base_url là cắm vào được, chi phí di chuyển sinh thái xấp xỉ không. Với hạ tầng kiểu công cụ, tương thích giao thức chính thống rẻ hơn phát minh giao thức mới.

6. **AGPL + cấp phép phân tầng model là thiết kế trung thực.** Mã ứng dụng AGPL-3.0; trọng số OmniVoice mặc định CC-BY-NC (thương mại hạn chế), một số engine có giấy phép riêng kích hoạt theo MAU/doanh thu (như IndexTTS 2.5 vượt 100 triệu MAU cần ủy quyền văn bản của Bilibili). Giấy phép ứng dụng không thay thế giấy phép model, người dùng thấy nhắc này ngay trên giao diện. Trước khi dùng thương mại phải đối chiếu từng điều khoản trọng số của từng engine.

### 4.2 Kịch bản phù hợp

| Kịch bản | Đề xuất |
|----------|---------|
| Người sáng tạo cá nhân làm lồng tiếng/sách nói | Cài bản desktop luôn, khởi đầu với OmniVoice mặc định |
| Ngành nhạy cảm về riêng tư (y tế, pháp lý, truyền thông) | Luồng công việc cục bộ + API loopback, âm thanh không rời máy |
| Phiên âm/tổng hợp hàng loạt thông lượng cao | Docker + hàng đợi hàng loạt + Worker từ xa mở rộng sức tính toán |
| Thêm năng lực giọng nói cho Agent | MCP Server hoặc API tương thích OpenAI, cắm nửa ngày |

### 4.3 Hạn chế và lưu ý

- Đang ở giai đoạn beta, khuyến nghị dùng bản release mới nhất thay vì nhánh main;
- Ủy quyền thương mại cần đối chiếu từng điều khoản trọng số model của từng engine, trọng số engine mặc định là CC-BY-NC;
- Mac Intel không chạy được backend Python cục bộ (PyTorch không có wheel dùng được), chỉ có thể kết nối backend từ xa;
- 646 ngôn ngữ là giới hạn danh mục, chất lượng thực tế thay đổi theo engine, ngôn ngữ ít người dùng cần đo thực tế;
- Worker từ xa và endpoint ASR bên ngoài một khi bật, dữ liệu rời khỏi máy, ranh giới do cấu hình quyết định.

---

## V. Lời kết

Tư tưởng cốt lõi của VoiceStudio có thể nén thành một câu: **biến năng lực giọng nói thành hạ tầng cục bộ mà người dùng kiểm soát hoàn toàn.** Nó trả lời câu hỏi riêng tư bằng trạng thái mặc định ưu tiên cục bộ, trả lời câu hỏi bảo trì bằng cơ chế tiếp nhận engine theo vị trí, trả lời câu hỏi lòng tin bằng thất bại rõ ràng, trả lời câu hỏi sinh thái bằng tương thích OpenAI và MCP. Bốn đường đi cùng hướng về một mục tiêu: chạy được ngay lần đầu, lâu dài không gãy dây chuyền.

> **Tài liệu tham khảo**
> - Kho dự án: https://github.com/debpalash/VoiceStudio
> - Cơ chế tiếp nhận engine: docs/engine-acceptance.md (phần 3.2 bài này dịch chủ yếu từ tài liệu đó)
> - Hướng dẫn engine: docs/engines/
