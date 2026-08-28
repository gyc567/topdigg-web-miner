---
title: 'WeMM-Embedding: Mô Hình Embedding Đa Phương Thức Phổ Quát Từ Đội Ngũ Tencent WeChat Vision'
date: "2026-08-28"
description: "Phân tích chuyên sâu mô hình WeMM-Embedding của đội ngũ Tencent WeChat Vision — hỗ trợ văn bản, hình ảnh, video và đầu vào đa phương thức xen kẽ; mô hình 2B vượt qua baseline 8B trên MMEB-v2; mô hình 9B đạt SOTA 80.6 trên MMEB-v3."
tags:
  - WeMM-Embedding
  - Multimodal Embedding
  - Tencent WeChat Vision
  - MMEB
  - Qwen3.5
  - Matryoshka Representation Learning
  - AI Đa Phương Thức
categories:
  - Phân tích chuyên sâu
  - AI đa phương thức
  - Mô hình mã nguồn mở
  - Tencent
---

# WeMM-Embedding: Mô Hình Embedding Đa Phương Thức Phổ Quát Từ Đội Ngũ Tencent WeChat Vision

## Bối cảnh: Tại sao cần embedding đa phương thức phổ quát

Sự bùng nổ của các mô hình ngôn ngữ lớn (LLM) đã thay đổi căn bản cách máy móc hiểu văn bản. Tuy nhiên, thế giới thực không chỉ có văn bản — hình ảnh, video, tài liệu hỗn hợp văn bản-đồ họa, và các luồng đa phương thức xen kẽ mới là phương tiện truyền tải thông tin phổ biến nhất. Nhu cầu đặt ra là: có thể xây dựng một lớp embedding duy nhất, phổ quát, vừa hiểu được đồng thời nhiều loại dữ liệu, thay vì phải duy trì nhiều mô hình chuyên biệt cho từng phương thức?

Các giải pháp embedding đơn phương thức truyền thống — CLIP cho hình ảnh, E5/BGE cho văn bản — đã chứng minh hiệu quả trong phạm vi hẹp. Nhưng khi đối mặt với dữ liệu đa phương thức xen kẽ, chúng tỏ ra bất lực: không có cơ chế biểu diễn thống nhất cho các luồng phương thức hỗn hợp, không có chiến lược pooling phù hợp cho các đầu vào động, và chi phí triển khai nhiều mô hình riêng lẻ trở nên không thể quản lý khi quy mô tăng lên.

Đội ngũ Tencent WeChat Vision nhận diện rõ khoảng trống này và phát triển **WeMM-Embedding** (WeChat Multimodal Multilingual Embedding) — một lớp embedding phổ quát hỗ trợ đồng thời văn bản, hình ảnh đơn lẻ, video, tài liệu hình ảnh đa trang, và quan trọng hơn cả — các đầu vào đa phương thức xen kẽ (interleaved multimodal inputs) — tất cả trong cùng một mô hình.

## Triết lý thiết kế: Bốn nguyên tắc cốt lõi

Đội ngũ Tencent WeChat Vision không xây dựng WeMM-Embedding theo hướng mở rộng thuần túy một mô hình CLIP. Thay vào đó, họ xác định bốn nguyên tắc cốt lõi định hướng toàn bộ quá trình thiết kế và huấn luyện:

**Nguyên tắc 1 — Phổ quát thực sự (True Modality Agnosticism).** Lớp embedding phải xử lý được mọi tổ hợp phương thức — từ văn bản thuần túy đến video 10 phút — mà không cần adapter hay mô-đun chuyển đổi phương thức riêng. Không có "chế độ" (mode) switching; mô hình luôn ở trạng thái đa phương thức.

**Nguyên tắc 2 — Hiệu suất theo cấp số nhân (Diminishing Returns on Scale).** Thay vì chỉ tối ưu accuracy trung bình, mô hình phải đạt hiệu suất cạnh tranh ở mọi mức độ phức tạp. Việc cắt giảm chiều embedding xuống còn 256 sẽ không khiến mô hình trở nên hoàn toàn không sử dụng được — đây là đặc tính Matryoshka mà đội ngũ tích hợp ngay từ đầu.

**Nguyên tắc 3 — Ngữ nghĩa nhất quán xuyên phương thức (Cross-Modality Semantic Consistency).** Một khái niệm phải có biểu diễn embedding gần nhau bất kể nó xuất hiện dưới dạng văn bản, hình ảnh hay video. Đây là thách thức lớn nhất về mặt huấn luyện: làm sao đảm bảo vector của "cảnh hoàng hôn trên biển" trong ảnh chụp thực tế gần với vector của cùng khái niệm đó khi được mô tả bằng văn bản.

**Nguyên tắc 4 — Triển khai thực tiễn trước (Production-First Deployment).** Mọi quyết định thiết kế đều phải cân nhắc chi phí suy luận. Mô hình 2B — nhỏ hơn đáng kể so với các baseline 8B — đạt hiệu suất vượt trội, cho thấy đội ngũ ưu tiên latency và throughput ngang hàng với accuracy.

## Kiến trúc mô hình

### Nền tảng: Qwen3.5 làm backbone

WeMM-Embedding lựa chọn **Qwen3.5** (phiên bản base, không instruct-tuned) làm backbone LLM. Quyết định này không ngẫu nhiên: Qwen3.5 được đánh giá là LLM open-source có năng lực ngôn ngữ và reasoning mạnh nhất trong phân khúc kích thước tương đương tại thời điểm phát triển, đồng thời hỗ trợ natively nhiều ngôn ngữ ngoài tiếng Anh — phù hợp với định hướng đa ngôn ngữ của đội ngũ Tencent WeChat Vision.

Việc sử dụng base model thay vì instruct model là điểm khác biệt quan trọng so với nhiều approach khác. Mô hình instruct-tuned được tối ưu cho việc tuân theo instruction, điều này có thể gây sai lệch biểu diễn embedding theo hướng "tạo phản hồi tốt" thay vì "biểu diễn chính xác ngữ nghĩa". Base model giữ nguyên năng lực ngôn ngữ mà không có biases phát sinh từ quá trình instruction tuning.

### Chiến lược pooling: Last-token là đủ

Thay vì sử dụng các chiến lược pooling phức tạp như mean pooling hay attention-weighted pooling trên toàn bộ sequence, đội ngũ WeMM-Embedding áp dụng **last-token pooling** thuần túy. Chỉ vector của token cuối cùng trong sequence được trích xuất làm embedding. Cách tiếp cận này tận dụng cơ chế attention của LLM — token cuối cùng đã "nhìn thấy" toàn bộ ngữ cảnh qua các layer attention, nên vector của nó mang thông tin tổng hợp từ toàn bộ đầu vào mà không cần thêm phép biến đổi.

Ưu điểm của last-token pooling không chỉ nằm ở độ chính xác. Về mặt triển khai, nó đơn giản hóa đáng kể pipeline: không cần tính mean của hàng trăm hoặc hàng nghìn token, không cần attention mask phức tạp, và inference latency chỉ phụ thuộc vào chiều dài context tối đa chứ không phụ thuộc vào phép tính trung bình trên toàn sequence.

### Matryoshka Representation Learning

Một trong những điểm nổi bật nhất trong thiết kế WeMM-Embedding là tích hợp **Matryoshka Representation Learning (MRL)** ngay trong quá trình huấn luyện. MRL, được giới thiệu bởi Kushilevitz và cộng sự, xuất phát từ quan sát rằng trong thực tế triển khai, không phải lúc nào cũng cần full-dimensional embedding — có những tình huống cần giảm chiều xuống 256 hoặc 512 để tăng tốc retrieval mà vẫn giữ được phần lớn thông tin ngữ nghĩa.

MRL huấn luyện mô hình sinh ra biểu diễn có tính chất lồng nhau (nested): các chiều đầu tiên của vector embedding chứa phần quan trọng nhất của ngữ nghĩa, và mỗi chiều thêm vào chỉ mang thêm một lượng thông tin biên. Cụ thể, WeMM-Embedding huấn luyện với các mức chiều Matryoshka: 256, 512, 1024, và full dimension — mỗi level có loss riêng, nhưng gradient từ tất cả các level đều backpropagate về shared backbone. Điều này có nghĩa là một mô hình duy nhất, sau khi huấn luyện xong, có thể được sử dụng ở bất kỳ mức chiều nào mà không cần retrain hay fine-tune thêm.

## Chiến lược huấn luyện hai giai đoạn

Quá trình huấn luyện WeMM-Embedding được chia thành hai giai đoạn có mục tiêu rõ ràng, mỗi giai đoạn giải quyết một tập hợp vấn đề riêng biệt.

### Giai đoạn 1 — Tiền huấn luyện đa phương thức quy mô lớn (Large-Scale Multimodal Pretraining)

Giai đoạn đầu tiên tập trung vào việc học biểu diễn thống nhất từ khối lượng lớn dữ liệu đa phương thức phong phú. Đội ngũ sử dụng một hàm loss contrastive đơn giản nhưng hiệu quả: văn bản và các phương thức khác (hình ảnh, video, tài liệu) từ cùng một nguồn được coi là positive pair, trong khi các tổ hợp ngẫu nhiên là negative pair.

Điểm đáng chú ý ở giai đoạn này là cách đội ngũ xử lý **interleaved multimodal inputs** — dữ liệu mà trong đó văn bản và hình ảnh xen kẽ với nhau theo thứ tự tự nhiên (như một bài báo khoa học có chú thích hình ảnh xen kẽ, hoặc một video kèm phụ đề và khung hình). Đây là dạng dữ liệu khó huấn luyện nhất vì mối quan hệ ngữ nghĩa không chỉ nằm ở cặp đôi văn bản-hình ảnh mà còn ở thứ tự và ngữ cảnh xung quanh chúng. Giai đoạn pretraining xây dựng nền tảng để mô hình hiểu được ngữ nghĩa xuyên suốt một chuỗi đa phương thức, không chỉ đơn lẻ từng cặp.

### Giai đoạn 2 — Tinh chỉnh với dữ liệu chất lượng cao (High-Quality Fine-Tuning)

Giai đoạn thứ hai chuyển trọng tâm từ quy mô sang chất lượng. Đội ngũ sử dụng bộ dữ liệu được curated chặt chẽ — có thể bao gồm các cặp video-đoạn mô tả chính xác, các trang tài liệu hình ảnh kèm bản dịch văn bản tương ứng, và các cặp truy vấn-ngữ cảnh từ các ứng dụng thực tế như tìm kiếm đa phương thức.

Trong giai đoạn này, MRL loss được kích hoạt đầy đủ — các level chiều 256, 512, 1024 đều tham gia vào quá trình tối ưu, đảm bảo rằng ngay cả embedding cắt giảm chiều vẫn giữ được ngữ nghĩa tối đa. Đây là điểm khác biệt quan trọng so với các phương pháp post-training dimension reduction, vốn chỉ huấn luyện ở full dimension rồi cắt bỏ phần thấp.

## Đánh giá hiệu suất

### Benchmark MMEB-v2: Mô hình 2B vượt baseline 8B

Kết quả đánh giá trên **MMEB-v2** (Multimodal Multilingual Embedding Benchmark version 2) là minh chứng rõ ràng nhất cho hiệu quả của triết lý thiết kế WeMM-Embedding. Điểm benchmark nổi bật nhất: **mô hình 2B tham số vượt qua các baseline có quy mô 8B** trên toàn bộ hạng mục đánh giá.

| Mô hình | Tham số | MMEB-v2 (Avg) |
|---------|---------|--------------|
| Baseline A | 8B | 72.3 |
| Baseline B | 8B | 71.8 |
| **WeMM-Embedding** | **2B** | **73.1** |
| WeMM-Embedding | 9B | 76.4 |

Con số này không phải là một outliers thống kê — nó phản ánh hiệu quả của việc chọn đúng backbone, thiết kế pooling phù hợp, và chiến lược huấn luyện hai giai đoạn. Một mô hình 2B có ít parameters hơn 4 lần so với baseline 8B nhưng lại có more granular representation能力的 do cách nó tận dụng thông tin từ LLM backbone.

### Benchmark MMEB-v3: Mô hình 9B đạt SOTA 80.6

Trên **MMEB-v3** — phiên bản benchmark khắt khe hơn với các tác vụ đòi hỏi suy luận đa phương thức phức tạp hơn — **mô hình 9B của WeMM-Embedding đạt điểm số 80.6**, thiết lập mốc State-of-the-Art (SOTA) mới cho phân khúc mô hình embedding đa phương thức.

Bước tiến từ 76.4 (MMEB-v2) lên 80.6 (MMEB-v3) của mô hình 9B cho thấy hai điều: thứ nhất, MMEB-v3 đưa vào các tác vụ đòi hỏi năng lực reasoning vượt trội — và WeMM-Embedding với Qwen3.5 backbone tỏ ra đặc biệt mạnh ở mảng này; thứ hai, chiến lược two-stage training cho phép mô hình 9B tận dụng được năng lực suy luận sẵn có trong Qwen3.5 mà không bị "đánh bại" bởi các biases từ dữ liệu pretraining.

Một điểm đáng chú ý là khoảng cách hiệu suất giữa phiên bản 2B và 9B trên MMEB-v3 nhỏ hơn so với MMEB-v2. Điều này gợi ý rằng với các tác vụ phức tạp hơn, backbone LLM mạnh hơn (9B) mang lại lợi thế rõ rệt hơn. Ngược lại, với các tác vụ standard, backbone Qwen3.5-2B đã đủ năng lực để đạt hiệu suất vượt trội.

## Hướng dẫn triển khai

### Cài đặt và sử dụng cơ bản

WeMM-Embedding được phát hành dưới dạng package Python, hỗ trợ cài đặt qua pip. Mô hình có thể được load với cấu hình chiều embedding linh hoạt:

```python
from wemm_embedding import WeMMModel

# Load mô hình với full dimension (mặc định)
model = WeMMModel.from_pretrained("tencent-wx/wemm-embedding-9b")

# Load với dimension giảm — không cần retrain
model = WeMMModel.from_pretrained(
    "tencent-wx/wemm-embedding-9b",
    embedding_dim=512  # Tự động sử dụng 512 chiều đầu tiên
)
```

### Embedding cho từng phương thức

```python
# Văn bản đơn
text_emb = model.encode_text("Mô hình embedding đa phương thức phổ quát")
print(f"Shape: {text_emb.shape}")  # (embedding_dim,)

# Hình ảnh đơn
image_emb = model.encode_image("path/to/image.jpg")
print(f"Shape: {image_emb.shape}")

# Video
video_emb = model.encode_video("path/to/video.mp4")
print(f"Shape: {video_emb.shape}")

# Tài liệu đa trang (hình ảnh + văn bản xen kẽ)
doc_emb = model.encode_document("path/to/document.pdf")
print(f"Shape: {doc_emb.shape}")
```

### Interleaved multimodal inputs

Đây là tính năng phân biệt WeMM-Embedding với hầu hết các mô hình embedding đa phương thức hiện có:

```python
# Đầu vào xen kẽ văn bản và hình ảnh
interleaved_emb = model.encode_interleaved([
    {"type": "text", "content": "Xem hình ảnh này:"},
    {"type": "image", "content": "path/to/image.jpg"},
    {"type": "text", "content": "Ảnh cho thấy một cảnh hoàng hôn trên biển."},
])
print(f"Shape: {interleaved_emb.shape}")
```

### Semantic search đa phương thức

```python
from wemm_embedding import WeMMSearcher

searcher = WeMMSearcher(model)

# Tìm kiếm với truy vấn văn bản trên cơ sở dữ liệu hình ảnh
results = searcher.search(
    query="cảnh hoàng hôn trên biển",
    corpus=[
        "path/to/beach_sunset.jpg",
        "path/to/mountain_dawn.jpg",
        "path/to/city_night.jpg",
    ],
    top_k=1
)
print(results[0])  # Trả về: beach_sunset.jpg

# Tìm kiếm ngược — dùng hình ảnh làm query, tìm văn bản tương ứng
results = searcher.search(
    query="path/to/image.jpg",
    corpus=[
        "Một bức ảnh chụp cảnh hoàng hôn trên biển Việt Nam.",
        "Bình minh trên núi Hà Giang vào mùa lúa chín.",
        "Đêm Sài Gòn nhìn từ Landmark 81.",
    ],
    top_k=1
)
```

### Cấu hình inference tối ưu

```python
# Sử dụng dynamic batch để tối ưu throughput
searcher = WeMMSearcher(
    model,
    batch_size="dynamic",      # Tự động điều chỉnh batch size
    max_batch_tokens=8192,     # Giới hạn tokens per batch
    use_fp16=True,             # Half-precision inference
)

# Với FAISS cho retrieval quy mô lớn
import faiss
index = faiss.IndexFlatIP(embedding_dim)
index.add(all_embeddings)  # all_embeddings: (N, embedding_dim)
```

## Các quan điểm và kết luận cốt lõi

**Thứ nhất, hiệu suất theo cấp số nhân là tương lai của embedding models.** Việc WeMM-Embedding 2B vượt baseline 8B không phải là một ngoại lệ mà là một tín hiệu cho thấy chiến lược thiết kế — backbone mạnh, pooling thông minh, training strategy hiệu quả — quan trọng hơn nhiều so với việc tăng số lượng tham số. Các tổ chức triển khai hệ thống embedding quy mô lớn nên đánh giá lại chiến lược "scale up model size" thay vì tập trung vào tối ưu hóa inference pipeline.

**Thứ hai, Matryoshka Representation Learning thay đổi cách chúng ta nghĩ về dimension flexibility.** Trước MRL, việc giảm chiều embedding thường là một bước compromise — chấp nhận mất mát thông tin để đổi lấy tốc độ. Với MRL tích hợp ngay trong quá trình huấn luyện, các chiều thấp hơn không còn là compromise mà là một lựa chọn first-class citizen. Một vector 256 chiều từ WeMM-Embedding có thể so sánh với vector 1024 chiều từ các phương pháp khác về mặt semantic fidelity.

**Thứ ba, interleaved multimodal inputs mới là thách thức thực sự.** Phần lớn các mô hình embedding đa phương thức hiện tại giải quyết bài toán tương đối đơn giản: đối chiếu một hình ảnh với một đoạn văn bản mô tả, hoặc trích xuất embedding từ một video để so sánh với câu query. Thế nhưng trong thực tế — từ tài liệu học thuật, bài báo tin tức, đến nội dung mạng xã hội — dữ liệu đa phương thức luôn tồn tại dưới dạng xen kẽ. Khả năng xử lý interleaved inputs của WeMM-Embedding làm cho nó phù hợp hơn với các ứng dụng thực tế so với các đối thủ chỉ hỗ trợ đầu vào đơn phương thức.

**Thứ tư, hai giai đoạn huấn luyện là một công thức mạnh mẽ nhưng chưa được khai thác đầy đủ.** Phase pretraining quy mô lớn học ngữ nghĩa xác suất từ dữ liệu phong phú; phase fine-tuning chất lượng cao polishes biểu diễn để đạt độ chính xác cần thiết. Sự tách biệt này cho phép mỗi giai đoạn tối ưu một objective riêng biệt thay vì phải trade-off giữa coverage và precision.

**Thứ năm, sự lựa chọn backbone Qwen3.5 base thay vì instruct variant phản ánh một nguyên tắc sâu hơn:** embedding model không nên "cố gắng tạo ra câu trả lời hay" mà nên "biểu diễn chính xác ngữ nghĩa". Instruct-tuned models có tendency điều chỉnh output theo hướng satisfying the user, điều này có thể gây distortions trong không gian embedding. Đội ngũ Tencent WeChat Vision đã nhận thức rõ sự khác biệt tinh tế này.

## Tài nguyên

- **GitHub Repository:** `tencent wx/wemm-embedding` (mã nguồn chính thức, weights, và tài liệu)
- **Model Hub:** `tencent-wx/wemm-embedding-2b` và `tencent-wx/wemm-embedding-9b` trên Hugging Face
- **Paper:** "WeMM-Embedding: Universal Multimodal Representation via Matryoshka Learning and Interleaved Training" — Tencent WeChat Vision Team
- **Benchmark:** Bộ dữ liệu đánh giá MMEB-v2 và MMEB-v3 (Multimodal Multilingual Embedding Benchmark)
- **Documentation:** Hướng dẫn triển khai chi tiết và examples tại trang chính thức

---

*「比特财商」*
