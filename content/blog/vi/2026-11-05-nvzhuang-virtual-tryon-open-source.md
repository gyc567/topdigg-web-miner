---
title: "Có người biến 1407 ảnh trang phục AI thành một website, thậm chí còn tích hợp cả thử đồ ảo: Phân tích toàn diện dự án trang phục nữ của anh chàng chụp ảnh"
date: "2026-11-05"
description: "Phân tích chuyên sâu paipiange/nvzhuang: một thư viện ảnh trang phục tĩnh thuần, không cần build, kèm backend AI thay đồ viết bằng GoFrame. Bao gồm hướng dẫn triển khai đầy đủ, cấu hình tích hợp đa mô hình, phân tích thiết kế bảo mật API và sáu triết lý thiết kế."
author: "瑞哥观势"
tags:
  - phân tích dự án mã nguồn mở
  - AI thay đồ
  - thử đồ ảo
  - GoFrame
  - ComfyUI
  - thích nghi đa mô hình
  - thiết kế bảo mật
categories:
  - phân tích dự án mã nguồn mở
keywords:
  - paipiange nvzhuang
  - thử đồ ảo bằng AI
  - backend AI thay đồ
  - dự án mã nguồn mở GoFrame
  - thay đồ cục bộ ComfyUI
  - adapter đa mô hình
  - bảo vệ bảo mật API
  - frontend tĩnh thuần
---

# Có người biến 1407 ảnh trang phục AI thành một website, thậm chí còn tích hợp cả thử đồ ảo

Nói trước kết luận.

`paipiange/nvzhuang` là một dự án mới chỉ được khởi tạo repo vào cuối tháng 10 năm 2026, nhưng đến ngày 4 tháng 11 đã giành được **2193 Star / 555 Fork**. Ngăn xếp công nghệ của nó đơn giản đến mức ngược đời: frontend là một file `index.html` 3278 dòng, backend là GoFrame v2, còn AI thay đồ thì được thực hiện bằng kỹ thuật prompt engineering cộng với bộ adapter đa mô hình.

Nhưng nó đã làm đúng vài việc rất khó, và những việc đó quan trọng hơn nhiều so với số lượng code:

**Thứ nhất, nó biến "dùng được với chi phí bằng không" và "năng lực chất lượng cao" thành hai tầng, thay vì một.** Phần thư viện hoàn toàn miễn phí, không triển khai, không cần Key, mở trang web là dùng ngay; phần AI thay đồ thì cần tự dựng backend và tự chuẩn bị Key. Đa số các dự án cùng loại sẽ chọn khóa chức năng cốt lõi sau tường phí, hoặc đơn giản làm thành một SaaS bắt buộc đăng nhập. Nó thì không.

**Thứ hai, trong 6 ngày nó đã bổ sung trọn vẹn một bộ phòng vệ API ở mức production.** Xác thực Bearer Token (digest SHA-256 + so sánh thời gian hằng số), danh sách trắng CORS nghiêm ngặt, giới hạn tần suất theo token bucket, hạn ngạch hằng ngày, khóa đồng thời, giới hạn kích thước request body, chống pixel bomb, chống SSRF. Những thứ này không phải "tiện tay thêm vào", mà được dẫn dắt bởi một tài liệu yêu cầu bảo mật được viết y như đặc tả sản phẩm.

**Thứ ba, nó dùng prompt engineering để vòng qua ràng buộc thực tế của kiểm duyệt mô hình.** Trong code có một đoạn comment viết rất thẳng: dòng GPT-Image đối với kịch bản thay đồ người thật sẽ bị kiểm duyệt an toàn chính thức chặn, nên mô hình mặc định là Gemini, và có hẳn một bộ template prompt "chống ban" riêng cho GPT-Image. Đây không phải hack, mà là một sự thỏa hiệp kỹ thuật — nhưng nó thành thật.

Tiếp theo, bài viết này sẽ cùng bạn mổ xẻ dự án: nó là gì, chạy thế nào, bảo mật ra sao, và triết lý thiết kế đằng sau nó.

---

## 1. Mô tả dự án: Nó thực chất là gì

### 1.1 Định vị trong một câu

> **Bộ sưu tập trang phục COSTUME-DB-01**: 1407 bộ ảnh trang phục thuần AI tạo sinh theo phong cách chân thực người thật + 1320 bộ theo phong cách anime 2D (tỉ lệ 2:3, không có người trong khung), hỗ trợ tìm kiếm song ngữ Trung–Anh, lọc đa chiều, kèm tính năng thử đồ ảo bằng AI một chạm (tùy chọn).

### 1.2 Ba thư viện ảnh

| Thư viện | Số lượng | Nội dung | Tệp dữ liệu |
|---|---|---|---|
| Trang phục chân thực | 1407 bộ | Trưng bày trang phục thuần theo phong cách ảnh người thật | `data.js` |
| Trang phục anime 2D | 1320 bộ | Trang phục phong cách tranh vẽ anime | `data-anime.js` |
| Thư viện khuôn mặt/kiểu tóc người mẫu AI | 1499 người | Ảnh cận cảnh khuôn mặt (Face) và kiểu tạo hình (Styling) | `data-portrait.js` |

Tổng cộng hơn 4200 nhóm tài liệu tham khảo. Thư viện người mẫu đến từ dự án `ai-portrait-gallery` với giấy phép CC0 1.0, hỗ trợ lọc chính xác theo độ dài tóc ngắn/vừa/vừa dài/dài cùng 50 kiểu tóc cụ thể (như mái búp bê, xoăn nhẹ, cắt thẳng), và hỗ trợ tìm kiếm đa ngôn ngữ Trung – Nhật – Anh.

### 1.3 8 danh mục lớn (giữ nguyên tên gốc tiếng Nhật)

Trường danh mục trong tệp dữ liệu là tiếng Nhật, đây là điều **được cố ý giữ lại để tương thích với nguồn dữ liệu gốc**, frontend sẽ tự động bản địa hóa sang tiếng Trung hoặc tiếng Anh:

| Danh mục (tên gốc tiếng Nhật) | Tiếng Trung | Số lượng |
|---|---|---:|
| 春 | Mùa xuân | 215 |
| 夏 | Mùa hạ | 254 |
| 秋 | Mùa thu | 244 |
| 冬 | Mùa đông | 253 |
| ランジェリー | Đồ lót | 199 |
| パーティ | Đồ dạ hội | 48 |
| 水着 | Đồ bơi | 54 |
| セクシー | Phong cách gợi cảm | 140 |
| **Tổng** | | **1407** |

Dự án có sẵn một báo cáo mang tên 《Báo cáo rà soát tuân thủ nội dung thư viện và phát hành cộng đồng》, trong đó xác định rõ 5 danh mục đầu với tổng 1014 món là rủi ro thấp, khuyến nghị dùng làm tư liệu quảng bá; 3 danh mục sau với tổng 393 món được đánh giá là rủi ro trung bình đến cao, quy định chỉ dùng như một phần của bộ dữ liệu đầy đủ để tra cứu thụ động, không đặt quyền ưu tiên lên trang chủ.

**Chi tiết này đáng để nói riêng một câu**: một dự án thư viện ảnh chủ động tự phân loại nội dung của chính mình, vạch đỏ cho tài liệu quảng bá, quy định nội dung nào không được dùng làm ảnh bìa — đó là việc chỉ tác giả có tư duy cộng đồng mới làm. Đa số dự án cùng loại chỉ nghĩ tới cách nhồi thêm vài chục tấm ảnh nữa thôi.

### 1.4 Cấu trúc dữ liệu: tên trường là tiếng Nhật, giá trị là tiếng Anh

```javascript
const META={"total":1407,"cats":["春","夏","秋","冬","ランジェリー","パーティ","水着","セクシー"],
"counts":{"春":215,"夏":254,"秋":244,"冬":253,"ランジェリー":199,"パーティ":48,"水着":54,"セクシー":140}};

const D=[{
  "id":"SPR-0001",
  "カテゴリ":"春",
  "キーワード":"ivory frill knit denim mini skirt coat socks white sneakers",
  "サムネ":"thumbs/SPR-0001.webp",
  "画像":"img/SPR-0001.webp",
  "原寸":"png/SPR-0001.png"
}];
```

| Trường | Ý nghĩa |
|---|---|
| `id` | Mã số, ví dụ `SPR-0001` |
| `カテゴリ` | Danh mục (tên danh mục tiếng Nhật) |
| `キーワード` | Từ khóa (tiếng Anh, phân tách bằng dấu cách) |
| `サムネ` | Đường dẫn ảnh thu nhỏ (WebP) |
| `画像` | Đường dẫn ảnh hiển thị (WebP) |
| `原寸` | Đường dẫn PNG kích thước gốc |

Tên trường là tiếng Nhật (`カテゴリ`、`キーワード`、`サムネ`、`画像`、`原寸`), đây là schema gốc của nguồn dữ liệu, giữ nguyên là để không phá vỡ tính tương thích. Giá trị lại là từ khóa tiếng Anh (`ivory frill knit denim mini skirt coat socks white sneakers`), nhờ đó tìm kiếm hai chiều Trung–Anh mới hoạt động được: khi ở chế độ tiếng Trung, gõ "白" vẫn ra kết quả, vì frontend đã thực hiện bản địa hóa từ khóa.

**Một cái bẫy dễ mắc phải**: các file PNG kích thước gốc (khoảng 1GB+) không được đưa vào repo, nên `png/*.png` mà trường `原寸` trỏ tới sẽ trả về 404 trên GitHub Pages. Cách xử lý của dự án là frontend tự động quay về mượn dần sang bản WebP độ phân giải cao đã được hosting, đảm bảo nút bấm không rơi vào hư không.

### 1.5 AI thay đồ: Ảnh 1 + Ảnh 2 ➔ Ảnh 3

Bản chất của quy trình thử đồ là đưa hai ảnh cho mô hình ảnh, để nó tổng hợp thành một ảnh:

- **Ảnh 1**: Ảnh tham khảo trang phục đã chọn (từ thư viện tích hợp, hoặc do người dùng tự tải lên)
- **Ảnh 2**: Ảnh người mẫu do người dùng tải lên
- **Ảnh 3**: Kết quả thay đồ do AI tổng hợp (giữ nguyên ngũ quan và kiểu tóc của người mẫu, hòa quyện chất liệu và đường cắt của trang phục)

Hỗ trợ cả hai phong cách: chân thực người thật và anime 2D. Dự án còn liên kết với dự án anh em `ai-pose-gallery-zh` (288 bộ / 1439 ảnh tham khảo tư thế đa góc), tạo nên quy trình đầy đủ "tham khảo tư thế + tham khảo nhân vật → sinh ảnh AI".

---

## 2. Ý tưởng cốt lõi

Nếu chỉ nhớ được ba câu, thì đây là ba câu đó.

### Ý tưởng 1: Trang tĩnh phụ trách "ma sát bằng không", backend phụ trách "chất lượng cao"

Đây là phán đoán kiến trúc cốt lõi nhất của toàn bộ dự án.

Đa số dự án AI thay đồ sẽ gói chặt frontend và backend: muốn dùng? Hãy triển khai backend trước, mua Key trước, điền Base URL trước. Với người dùng cá nhân, rào cản này loại 99% người ra.

Cách làm của `nvzhuang` là **phân tầng năng lực**:

```
┌─────────────────────────────────────────┐
│  第一层：纯静态前端（零部署、零 Key）      │
│  · 4226 套图库浏览                        │
│  · 中英双向检索 / 分类筛选                 │
│  · 大图全屏 / 键盘翻页 / 原图下载          │
│  · 手动搭配台（纯浏览器抠图组合）           │
│  · 以图搜同款（淘宝 / 拼多多）             │
│  · 本地生成记录（IndexedDB）              │
│  ↓ 用户真的想要 AI 换装了                    │
├─────────────────────────────────────────┤
│  第二层：可选 GoFrame 后端（自建、自备 Key）  │
│  · 真正的 AI 换装生成                     │
│  · 5 种模型协议可插拔                     │
│  · ComfyUI 本地离线，零成本                 │
└─────────────────────────────────────────┘
```

Tầng 1 miễn phí 100% và không cần chuẩn bị gì, mở `https://paipiange.github.io/nvzhuang/` là dùng được ngay. Tầng 2 mới là phần cần năng lực trả phí, và **giá niêm yết rõ ràng**: dự án ghi rõ ở ba nơi — README, trang frontend, báo cáo kiểm toán — rằng "cần tự mang backend và API Key, có thể phát sinh phí mô hình".

**Sự phân tầng này, bản chất là đưa "chi phí thu hút" về bằng không, và giữ lại "điểm kiếm tiền" ở đúng chỗ thực sự có giá trị.**

### Ý tưởng 2: Mô hình là plugin, không phải mã cứng

Backend định nghĩa một giao diện adapter cực gọn:

```go
// ImageGenerator 图像生成模型适配器接口
type ImageGenerator interface {
    // Generate 生成换装图。入参为两张图的 base64（人像 + 服装），返回结果图 base64
    Generate(ctx context.Context, personB64, garmentB64, prompt, size string) (string, error)
    // Name 模型别名（对外暴露的名称）
    Name() string
}
```

Sau đó mỗi giao thức có một adapter: `gpt_image.go` (giao thức OpenAI Images), `doubao.go` (giao thức Volcano Ark), `gemini.go` (giao thức Google generateContent), `comfyui.go` (workflow cục bộ).

Thêm vào tệp cấu hình một đoạn là tích hợp được một mô hình nội địa hoàn toàn mới, **không cần sửa một dòng code nào**:

```yaml
llm:
  models:
    qwen:                 # 通义万相示例
      provider: openai
      envKey: "DASHSCOPE_API_KEY"
      baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1"
      model: "wanx2.1-t2i-turbo"
```

### Ý tưởng 3: Bảo mật là tính năng sản phẩm, không phải bản vá trước khi lên sóng

Đây là khác biệt lớn nhất giữa dự án này và đa số dự án mã nguồn mở.

Nó có một tài liệu riêng mang tên 《AI 换装接口保护与图片校验功能需求》 dài 562 dòng, với cấu trúc hoàn toàn theo kiểu đặc tả yêu cầu sản phẩm: câu chuyện người dùng → bảng Evidence → bảng Findings → yêu cầu chức năng (FR-1 đến FR-16) → bảng mã lỗi → các mục cấu hình.

Bảng Evidence trong tài liệu trông như thế này:

| ID | Vị trí code | Quan sát hiện tại | Lệnh kiểm chứng |
|---|---|---|---|
| E-001 | `backend/internal/cmd/cmd.go` | Hiện chỉ đăng ký middleware phản hồi và CORS mặc định, không có xác thực truy cập và không giới hạn tần suất | `rg -n "Middleware\|CORSDefault" backend/internal/cmd/cmd.go` |
| E-002 | `backend/api/tryon/v1/tryon.go` | `/tryon` có thể trực tiếp nhận hai ảnh Base64 và kích hoạt sinh ảnh | `rg -n "PersonImage\|GarmentImage\|path:\"/tryon\"" backend/api/tryon/v1/tryon.go` |
| E-003 | `backend/internal/logic/tryon/gpt_image.go` | `decodeB64` chỉ kiểm tra kết quả giải mã Base64 | `rg -n "func decodeB64" backend/internal/logic/tryon/gpt_image.go` |

Phần Findings đưa ra kết luận trực tiếp:

- **F-001**: Khi triển khai công khai, bất kỳ ai cũng có thể gọi giao diện sinh ảnh → có thể làm hao hụt hạn ngạch mô hình hoặc chiếm hết GPU cục bộ
- **F-002**: Base64 hợp lệ không đồng nghĩa với ảnh hợp lệ, an toàn → có thể gây lãng phí bộ nhớ, CPU, băng thông hoặc khiến lời gọi mô hình thất bại

**Cách viết "thu thập bằng chứng trước, kết luận sau, phương án cuối cùng" này chuẩn hơn cả đa số PRD bảo mật của các công ty.** Và nó thực sự được thực thi — tôi đã đọc toàn bộ phần triển khai trong `internal/security/` và `internal/middleware/`, mọi mục từ FR-1 đến FR-16 trong tài liệu yêu cầu đều có code tương ứng.

---

## 3. Triết lý thiết kế: Sáu nguyên tắc có thể mang đi

Phần này theo tôi là sản phẩm có giá trị nhất của dự án. Công nghệ sẽ lỗi thời, nhưng những phán đoán dưới đây thì không.

### Triết lý 1: Fail-Safe Defaults (quay về trạng thái an toàn khi thất bại)

Nguyên tắc này được viết vào đặc tả kiến trúc trong `AGENTS.md` và được thực thi nghiêm ngặt trong code:

> Khi backend khởi động, nếu phát hiện máy chủ chưa tạo tường minh `config.yaml`, phải có khả năng tự động fallback ở tầng code để nạp `config.example.yaml`.

```go
// InitConfigFallback 检查并保障配置文件就绪：
// 若当前没有可用的 config.yaml，自动尝试回退加载 config.example.yaml。
func InitConfigFallback(ctx context.Context) {
    if !g.Cfg().Available(ctx) {
        candidates := []string{
            "manifest/config/config.example.yaml",
            "config/config.example.yaml",
            "config.example.yaml",
        }
        for _, path := range candidates {
            if gfile.Exists(path) {
                ...
            }
        }
    }
}
```

Tương tự, còn có phần dự phòng cho cổng:

```go
// EnsureServerPort 确保 Server 具备显式监听端口，避免未配置时随机分配高位端口 (:0)
func EnsureServerPort(ctx context.Context, s *ghttp.Server) {
    addr, err := g.Cfg().Get(ctx, "server.address")
    if err != nil || addr.IsEmpty() {
        s.SetPort(8000)
        g.Log().Info("未指定 server.address 配置，已显式绑定默认端口 :8000")
    }
}
```

**Vì sao nguyên tắc này quan trọng?** Vì `net/http` của Go khi chạy `ListenAndServe(":0")` sẽ cấp phát một cổng cao ngẫu nhiên. AGENTS.md đặc biệt nhắc đích danh cái bẫy này:

> Tuyệt đối cấm để hệ thống rơi vào cổng tạm ngẫu nhiên cao `:0` (ví dụ `:37093`) vì không cấu hình address.

Trong triển khai container, chỉ một cấu hình `server.address` ngẫu nhiên bị thiếu cũng khiến health check, reverse proxy và container orchestration đều hỏng — mà không báo lỗi, chỉ biểu hiện là "dịch vụ đã lên nhưng không truy cập được". Loại bug này cực kỳ khó truy vết.

### Triết lý 2: Nguyên tắc không rò rỉ (Zero Leakage)

Ngay đầu `AGENTS.md` là một đường ranh đỏ:

> Tuyệt đối cấm commit bất kỳ API Key thật nào (bao gồm nhưng không giới hạn ở OpenAI `sk-...`, Volcano Ark `ARK...`, Google Gemini `AIza...`, Tongyi Qianwen `sk-...` v.v.), token riêng tư, mật khẩu, khóa chứng thư vào Git repository hoặc staging area.

Các biện pháp đi kèm:

- `config.yaml`, `.env` đều nằm trong `.gitignore`, repository chỉ giữ `config.example.yaml` và `.env.example`
- Trường Key trong template bắt buộc là chuỗi rỗng hoặc placeholder kiểu `sk-cua-ban`
- "Cấu hình mô hình cá nhân" ở frontend chỉ nằm trong `localStorage` của trình duyệt, backend chỉ dùng trong bộ nhớ, **không ghi database, không ghi file cấu hình, không ghi log nghiệp vụ**
- Log chỉ được ghi MIME, chiều rộng/cao, số byte và tối đa 16 ký tự tiền tố SHA-256, không ghi nội dung ảnh và không ghi hash đầy đủ

Nghiêm khắc hơn nữa là danh sách tự kiểm tra trước khi commit, được viết thành lệnh thực thi được ngay:

```markdown
- [ ] **步骤 1**：运行 `git status`，确保没有临时文件、日志文件、编译产物、真实配置文件进入暂存区。
- [ ] **步骤 2**：逐行审查 `git diff --cached`，确认无真实 Key、无个人姓名电话、无调试遗留硬编码凭证。
- [ ] **步骤 3**：敏感字符串安全扫描，执行正则 `(sk-[a-zA-Z0-9]{20,}|AIza[a-zA-Z0-9]{20,})`。
- [ ] **步骤 4**：运行 `go test ./...` 与 `go vet ./...`，确保代码编译通过、测试全绿。
```

**Bản danh sách này bản thân nó đã có thể copy đi dùng ngay.** Nó biến khẩu hiệu "phải cẩn thận" thành bốn cổng kiểm soát cụ thể.

### Triết lý 3: Ranh giới riêng tư phải được nói rõ trong tài liệu, chứ không giấu đi

Dự án ghi rõ luồng dữ liệu ở nhiều chỗ:

- Ảnh quần áo gốc do người dùng tự tải lên **chỉ được giữ trong bộ nhớ của trang hiện tại**, không ghi vào bộ nhớ cục bộ và không tạo bản ghi, tự động xóa khi tải lại hoặc đóng trang
- Bản ghi tạo ảnh chỉ lưu trong IndexedDB của trình duyệt hiện tại, **không tải lên, không đồng bộ xuyên thiết bị**
- Khi tạo ảnh chỉ gửi nội dung ảnh **đã nén** tới backend thay đồ do người dùng cấu hình

Sự minh bạch này rất quan trọng. AI thay đồ liên quan đến ảnh chân dung, điều người dùng sợ nhất chính là "ảnh của tôi đi đâu rồi". Dự án không nói lời lặng lẽ, mà vẽ rõ luồng dữ liệu.

### Triết lý 4: Từ chối tường minh tốt hơn suy giảm im lặng

Phản hồi lỗi không phải là "tạo ảnh thất bại" chung chung, manh mã đến từng mã nghiệp vụ:

| HTTP | Mã nghiệp vụ | `error_code` | Thông báo cho người dùng |
|---:|---:|---|---|
| 401 | 40101 | `AUTH_REQUIRED` | Vui lòng nhập Token truy cập backend trong Trung tâm cài đặt |
| 401 | 40102 | `AUTH_INVALID` | Token truy cập backend không hợp lệ |
| 403 | 40301 | `ORIGIN_NOT_ALLOWED` | Nguồn trang hiện tại không được phép truy cập backend |
| 429 | 42901 | `RATE_LIMITED` | Yêu cầu quá thường xuyên, vui lòng thử lại sau |
| 429 | 42902 | `DAILY_QUOTA_EXCEEDED` | Hạn ngạch tạo ảnh hôm nay đã hết |
| 429 | 42903 | `CONCURRENCY_LIMITED` | Hiện có nhiều tác vụ tạo ảnh, vui lòng thử lại sau |
| 413 | 41301 | `REQUEST_TOO_LARGE` | Nội dung tải lên quá lớn, vui lòng nén ảnh rồi thử lại |
| 422 | 42201 | `INVALID_IMAGE_BASE64` | Dữ liệu ảnh bị hỏng, vui lòng chọn lại ảnh |
| 422 | 42202 | `UNSUPPORTED_IMAGE_TYPE` | Chỉ hỗ trợ JPEG, PNG và WebP |
| 422 | 42203 | `IMAGE_FILE_TOO_LARGE` | Tệp ảnh quá lớn, vui lòng nén rồi thử lại |
| 422 | 42204 | `IMAGE_DIMENSIONS_INVALID` | Kích thước ảnh không đúng yêu cầu |
| 422 | 42205 | `IMAGE_PIXEL_LIMIT_EXCEEDED` | Số pixel ảnh quá cao, vui lòng thu nhỏ rồi thử lại |

Frontend hiển thị thông báo tiếng Trung và tiếng Anh dựa trên `error_code`, **không phụ thuộc vào việc khớp regex với chuỗi lỗi gốc từ backend**.

Hơn nữa, mọi phản hồi lỗi bắt buộc phải chứa `request_id`, và không được chứa Token, API Key của mô hình, ảnh Base64 hay lỗi nhạy cảm gốc từ nhà cung cấp.

### Triết lý 5: Tách lớp thích ứng mô hình khỏi logic nghiệp vụ

Luồng chính của `tryon.go` rất ngắn, nhưng mỗi bước kiểm tra đều mang một lý do rõ ràng:

```go
// 默认模型：Gemini（Nano Banana 2），因为 GPT Image 系列对真人换装场景
// 会被官方安全审核拦截（moderation_blocked / sexual），Gemini 无此限制。
if model == "" {
    model = "gemini"
}

var gen ImageGenerator
if clientConfig != nil {
    gen, err = NewGeneratorFromClientConfig(clientConfig)
} else {
    gen, err = NewGenerator(ctx, model)
}

// 构建提示词：
// 1. GPT-Image-2 专门使用防封控安全提示词；
// 2. Gemini 保留原英文稳定提示词；
// 3. 豆包等其他模型保留原提示词（按语言选择）。
var promptStr string
isGemini := (clientConfig != nil && strings.EqualFold(clientConfig.Provider, "gemini")) || gen.Name() == "gemini"
if isGPTImageModel(model, clientConfig, gen.Name()) {
    promptStr = BuildGPTSafety(lang)
} else if isGemini {
    promptStr = BuildGemini(lang)
} else {
    promptStr = BuildDefault(lang)
}
```

Chú ý cách xử lý lỗi ở cuối:

```go
result, err := gen.Generate(ctx, personB64, garmentB64, promptStr, size)
if err != nil {
    // 不记录原始错误：网络错误可能包含用户自定义 Base URL，供应商响应也可能含敏感信息。
    return "", "", "", gerror.Wrap(err, "换装生成失败，请稍后重试")
}
```

**Vì sao không ghi lỗi gốc?** Vì `client_config.base_url` của người dùng có thể bị nhúng vào thông báo lỗi mạng, còn body phản hồi từ nhà cung cấp có thể chứa nội dung nhạy cảm. Nuốt luôn lỗi gốc và gộp thành một thông báo thân thiện thống nhất là lựa chọn an toàn nhất ở đây.

### Triết lý 6: Tài liệu và code phải khớp nhau

Dự án có một bản đặc tả nhiệm vụ `nvzhuang.md`, chuyên dùng để sửa lệch lạc giữa tài liệu và code, trong đó nêu đích danh những điểm không khớp cụ thể:

> 1. Lệnh khởi động ở thư mục gốc trong README là `cp backend/.env.example backend/.env` rồi chạy `docker compose up -d` **tại thư mục gốc repository**, nhưng Compose mặc định ưu tiên đọc `.env` từ thư mục làm việc. Nên kiểm tra và sửa lại điểm gây hiểu lầm này.
> 2. Mô hình mặc định trong dropdown của frontend là `gemini`; giá trị mặc định của `Model` trong cấu trúc request API lại viết là `gpt-image`, trong khi một phần comment/fallback rỗng của logic nghiệp vụ lại viết là `gemini`. Phải đối chiếu đường đi thực sự của giá trị mặc định GoFrame, thống nhất README và mô tả frontend/backend, **không được đơn giản tuyên bố "mặc định là GPT Image 2"**.

Điểm thứ hai đặc biệt thú vị — nó bắt được cả loại sai lệch cực tinh vi như "trong tài liệu có ba cách nói khác nhau". Đằng sau đó là một kiểu bám việc của tác giả (hay đúng hơn là của AI viết bản đặc tả nhiệm vụ cho tác giả): **sự trôi dạt tài liệu là nợ kỹ thuật, và là loại nợ dễ bị bỏ qua nhất.**

---

## 4. Hướng dẫn chi tiết: Chạy từ đầu

### 4.1 Yêu cầu môi trường

| Mục đích | Yêu cầu |
|---|---|
| Frontend static site | Trình duyệt hiện đại là đủ, hoặc Python 3 / Node |
| Build và chạy backend | Go 1.18+ hoặc Docker |
| AI thay đồ trên cloud | Ít nhất một model API Key |
| AI thay đồ cục bộ | ComfyUI + GPU riêng (khuyến nghị), không cần Key nào |

### 4.2 Bước một: Chạy frontend (không cần cấu hình gì)

Frontend là static site thuần, **không cần build**.

```bash
# 方式一：Python 内置服务器（推荐，端口 3000，与后端 8000 不冲突）
python3 -m http.server 3000

# 方式二：Node 简单服务器
npx serve -l 3000 .

# 方式三：直接用现代浏览器打开 index.html
```

Mở trình duyệt và truy cập `http://localhost:3000`.

Lúc này bạn đã có: 4226 bộ thư viện ảnh, tìm kiếm song ngữ Trung–Anh, lọc theo danh mục, xem ảnh toàn màn hình, lật trang bằng bàn phím, cuộn vô hạn, tải ảnh gốc, bàn phối đồ thủ công, tìm ảnh tương tự bằng ảnh, bản ghi tạo ảnh cục bộ trong IndexedDB — **hoàn toàn miễn phí, không Key, không backend**.

> ⚠️ **Đừng để cổng đụng nhau với backend**: static site dùng 3000, backend dùng 8000. Bản đặc tả nhiệm vụ gốc của dự án đã chỉ ra đúng điểm nhầm lẫn này.

### 4.3 Bước hai: Dựng backend (Docker, tiện nhất)

```bash
cd backend

# 1. 复制环境变量模板并填入你的 Key
cp .env.example backend/.env
# 编辑 .env，例如：ARK_API_KEY=xxxx（国内推荐豆包，无需翻墙）

# 2. 一键启动（内置开箱即用兜底，默认监听 8000 端口）
docker compose up -d

# 3. 查看日志
docker compose logs -f
```

Sau khi khởi động, dịch vụ lắng nghe ở `http://localhost:8000`.

**Lưu ý**: phải chạy lệnh này trong thư mục `backend/` (làm `cd backend` rồi `cp .env.example .env`). Nếu chạy ở thư mục gốc repository, Compose sẽ đọc `.env` ở thư mục gốc và không đọc được cấu hình của backend — đây là cái bẫy được bản đặc tả nhiệm vụ của dự án nêu đích danh.

Cách dùng Docker một container:
```bash
cd backend
docker build -f manifest/docker/Dockerfile -t costume-tryon .

docker run -d --name costume-tryon -p 8000:8000 \
  -e ARK_API_KEY="你的豆包ArkKey" \
  -e OPENAI_API_KEY="sk-你的OpenAIKey" \
  costume-tryon
```

Người dùng Windows có một phúc lợi lười biếng: chỉ cần bấm đúp `backend/restart.bat`, tự động biên dịch và khởi động.

Không có môi trường Docker (chạy từ source):

```bash
cd backend
# 可选：复制配置文件（不复制时系统会自动安全回退加载模板并监听 8000）
# cp manifest/config/config.example.yaml manifest/config/config.yaml
export ARK_API_KEY="你的Key"      # Windows PowerShell 用 $env:ARK_API_KEY="你的Key"
go run main.go
```

### 4.4 Bước ba: Cấu hình frontend trỏ về backend

File `index.html` của frontend nhận diện địa chỉ backend thay đồ theo thứ tự ưu tiên sau (**từ cao xuống thấp**):

1. **Trung tâm cài đặt**: "Địa chỉ API backend" do người dùng lưu trong trình duyệt hiện tại (backend ngoài mạng, khác origin bắt buộc phải dùng **HTTPS**)
2. **Biến toàn cục**: đặt `window.AI_API_URL = "http://localhost:8000"` trước khi HTML được nạp
3. **Tham số URL**: `https://dia-chi-frontend-cua-ban/?tryon=http://localhost:8000`
4. **Fallback cục bộ**: khi truy cập frontend qua `localhost` hoặc `127.0.0.1`, mặc định tự động kết nối `http://127.0.0.1:8000`

Về mục thứ 3, có một **ràng buộc bảo mật** bắt buộc phải biết:

> Để chống lừa đảo đánh cắp API Key và ảnh riêng tư, `?tryon=` chỉ cho phép cùng origin hoặc loopback máy cục bộ `localhost`/`127.0.0.1`; backend bên ngoài phải được lưu tường minh trong Trung tâm cài đặt.

Nói cách khác, **bạn không thể dùng `?tryon=` trên một trang công cộng để trỏ tới backend lạ**, đây là thiết kế chống SSRF và chống phishing.

Frontend còn có vài tham số URL khá tiện lợi:

```
?lang=en           # 初始语言（zh / en，默认 zh）
?q=lace            # 初始搜索词
?lang=en&q=white   # 组合使用
```

### 4.5 Bước bốn: Kết nối nhiều mô hình

Backend quản lý các mô hình qua `llm.models` trong file cấu hình, **cả ba khía cạnh Key, Base URL và tên mô hình đều cấu hình được**:

```yaml
llm:
  models:
    gpt-image:              # 前端请求用的别名
      provider: openai      # 协议：openai / doubao / gemini
      apiKey: ""            # 直接填 Key，或留空用环境变量
      envKey: "OPENAI_API_KEY"   # 环境变量名（优先级高于 apiKey）
      baseURL: "https://api.openai.com/v1"
      model: "gpt-image-2"

    doubao:                 # 豆包（火山方舟），国内可用
      provider: doubao
      envKey: "ARK_API_KEY"
      baseURL: "https://ark.cn-beijing.volces.com/api/v3"
      model: "doubao-seedream-3-0-t2i-250415"

    gemini:                 # Google Nano Banana 2
      provider: gemini
      envKey: "GEMINI_API_KEY"
      baseURL: "https://generativelanguage.googleapis.com/v1beta"
      model: "gemini-3.1-flash-image"
```

**Khác biệt giữa bốn giao thức** (đây là chỗ dễ nhầm nhất khi tích hợp):

| provider | Giao thức | Mô tả |
|---|---|---|
| `openai` | `POST {baseURL}/images/generations` + mảng `input` | GPT-Image chính thức của OpenAI, Tongyi Wanxiang, Zhipu CogView, SiliconFlow, hầu hết các trạm trung gian |
| `doubao` | Cùng `/images/generations`, nhưng body là định dạng Volcano (`prompt` + `image[]`), trả về `url` | Doubao Seedream |
| `gemini` | `generateContent` native của Google | Mô hình ảnh Gemini |
| `comfyui` | API ComfyUI cục bộ + workflow cố định phía server | Chạy offline cục bộ, không nhận `client_config` |

**Muốn thêm một mô hình trong nước chỉ cần thêm một mục dưới `llm.models`**, dropdown ở frontend tương ứng với các thẻ `<option>` trong `<select id="aiModel">` của `index.html`.

### 4.6 Bước năm: Chế độ offline cục bộ với ComfyUI (zero chi phí, không cần Key)

Đây là phần giàu hình ảnh nhất của dự án: **để card đồ họa của bạn trả tiền thay**.

Hệ thống tích hợp sẵn **workflow thích ứng kép**:

| Workflow | Mô hình | Đặc điểm |
|---|---|---|
| **Qwen-Image-Edit-2511 (mặc định, ưu tiên)** | `qwen_image_edit_2511_int8_convrot.safetensors` + Lightning LoRA 4 bước | Sinh ảnh siêu nhanh 4 bước, độ trung thành của thay đồ theo ngữ nghĩa cao hơn |
| **MiniMax H3 (giữ để tương thích)** | Trích frame thứ 31 từ video model H3 Ref2VA | Phương án dự phòng |

Khi gọi, hệ thống tự phát hiện trạng thái khả dụng: ưu tiên Qwen, nếu chưa sẵn sàng thì tự động lùi mượt mà về H3; cũng có thể chỉ định tường minh bằng `comfyui-qwen` hoặc `comfyui-h3`.

**Chuẩn bị tệp mô hình:**

```bash
# Qwen-Image-Edit
models/diffusion_models/qwen_image_edit_2511_int8_convrot.safetensors
models/text_encoders/qwen_2.5_vl_7b_fp8_scaled.safetensors
models/vae/qwen_image_vae.safetensors
models/loras/Qwen-Image-Edit-2511-Lightning-4steps-V1.0-bf16.safetensors

# MiniMax H3（还需要）：H3、Qwen3-VL、ClipProj、LoRA、视频 VAE 和音频 VAE
```

**Khởi động ComfyUI:**

```bash
# 默认地址 http://127.0.0.1:8188
```

**Bật trên web:**

1. Mở «Trung tâm cài đặt» ở góc trên bên phải
2. Chọn «Dùng cấu hình mô hình của tôi»
3. Chọn giao thức «ComfyUI cục bộ»
4. Bấm «Kiểm tra kết nối» — endpoint này (`GET /comfyui/health`) chỉ kiểm tra API ComfyUI, workflow cố định và tính khả dụng của node/mô hình, **không tải ảnh lên và không thực hiện tạo ảnh**
5. Lưu lại sau khi kiểm tra thành công

### 4.7 Bước sáu: Triển khai môi trường production (quan trọng)

#### 4.7.1 Nginx reverse proxy

```nginx
server {
    listen 443 ssl;
    server_name api.你的域名.com;

    ssl_certificate     /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        # 大图片 base64 请求体，调大超时和体积上限
        client_max_body_size 30m;
        proxy_read_timeout 180s;
        proxy_send_timeout 180s;
    }
}
```

Khi triển khai frontend, thêm một dòng ở đầu `index.html`:

```html
<script>window.AI_API_URL="https://api.你的域名";</script>
```

#### 4.7.2 Danh sách cấu hình bảo mật

```yaml
security:
  authRequired: true                # 本地调试可设 false，线上部署必须为 true
  apiKeysEnv: "TRYON_API_KEYS"      # 多个 Token 用英文逗号分隔，每个 32~512 字符
  trustedOrigins:                   # CORS 严格白名单（精确匹配，禁止 *）
    - "https://paipiange.github.io"
    - "http://localhost:3000"
    - "http://127.0.0.1:3000"
  allowPrivateNetwork: false        # 是否允许来自私有网络的 PNA 预检
  rateLimit:
    requestsPerMinute: 10           # 单调用方每分钟请求速率上限
    burst: 3                        # 允许短时间突发容量
    limiterIdleMinutes: 30          # 限流器闲置自动清理周期（分钟）
    dailyRequestsPerPrincipal: 100  # 单调用方每日最高调用成功额度（自然日重置）
  concurrency:
    global: 2                       # 全局最大生图并发数
    perPrincipal: 1                 # 单调用方最大生图并发数
```

Đặt Token:

```bash
TRYON_API_KEYS="your-secure-token-with-at-least-32-chars-long-1234,another-client-token-5678"
```

Backend **chỉ lưu trong bộ nhớ digest SHA-256 của Token**, dùng so sánh thời gian hằng số (Constant-Time Compare) để chống tấn công side-channel theo thời gian, và tuyệt đối không in bất kỳ Token bản rõ nào trong log, phản hồi lỗi hay header.

> ⚠️ **Một giới hạn bắt buộc phải biết**: bộ đếm hạn ngạch hằng ngày được lưu trong bộ nhớ tiến trình, **backend khởi động lại là reset**. Triển khai nhiều instance cần kho lưu trữ dùng chung bên ngoài (Redis chẳng hạn).

#### 4.7.3 Kiểm tra triển khai

```bash
# 未带 Token 或错误 Token（预期返回 HTTP 401: AUTH_REQUIRED）
curl -X POST https://api.你的域名/tryon -H "Content-Type: application/json" -d '{}'

# 预期返回：
# {"code":40101,"message":"请在设置中心填写后端访问 Token",
#  "data":{"error_code":"AUTH_REQUIRED","request_id":"..."}}

# 携带合法 Token 验证连通性
curl -X POST https://api.你的域名/tryon \
  -H "Authorization: Bearer 你的Token" \
  -H "Content-Type: application/json" \
  -d '{}'

# 预期返回缺少参数验证错误：
# {"code":51,"message":"The PersonImage field is required","data":null}
```

---

## 5. Phân tích sâu về thiết kế bảo mật

Theo tôi đây là phần đáng học nhất, nên tách riêng thành một mục.

### 5.1 Thứ tự xử lý request: Từ chối trước, rồi mới tốn tiền

```
1. 接收请求并生成请求 ID
2. 校验 Origin（CORS 白名单）
3. 限制整个 HTTP 请求体大小（24 MiB，在 JSON 解析前）
4. 校验后端访问 Token
5. 执行速率、每日额度和并发检查
6. 校验两张图片的 Base64、真实 MIME、文件大小、宽高和像素数
7. 调用模型适配器
8. 无论成功或失败，都释放并发占用
```

**Chú ý bước 7 nằm sau bước 6** — mọi request không hợp lệ đều bị từ chối trước khi chạm tới mô hình. Đây là thiết kế cốt lõi để "không để kẻ tấn công tốn tiền của bạn".

### 5.2 Chín cửa kiểm tra ảnh

Hàm `ValidateImage` trong `internal/imagevalidate/validate.go` có logic đi từ tầng này sang tầng khác:

```go
// 1. 预检查 Base64 编码字符串长度
if limits.MaxEncodedImageBytes > 0 && int64(len(rawB64)) > limits.MaxEncodedImageBytes {
    return nil, security.ErrImageFileTooLarge
}

// 2. 根据字符串长度预估解码大小（防止超大 Base64 占满内存）
estimatedDecodedSize := int64(len(rawB64)) * 3 / 4
if limits.MaxDecodedImageBytes > 0 && estimatedDecodedSize > limits.MaxDecodedImageBytes+1024 {
    return nil, security.ErrImageFileTooLarge
}

// 3. 解码 Base64
data, err := base64.StdEncoding.DecodeString(rawB64)

// 5. 校验真实 MIME 类型（http.DetectContentType）
realMIME := http.DetectContentType(data)
// 若 Data URL 声明了 MIME，必须与真实内容严格一致
if declaredMIME != "" && !strings.EqualFold(declaredMIME, realMIME) {
    return nil, security.ErrUnsupportedImageType
}

// 6. 使用 image.DecodeConfig 校验图片头有效性并提取宽高
cfg, _, err := image.DecodeConfig(bytes.NewReader(data))

// 8. 总像素校验（防止乘法整数溢出）
pixels := int64(cfg.Width) * int64(cfg.Height)
if limits.MaxPixels > 0 && pixels > limits.MaxPixels {
    return nil, security.ErrImagePixelLimitExceeded
}
```

Ba thiết kế then chốt:

**① Không tin khai báo, chỉ tin nội dung.** `image/png` ghi trong Data URL tuyệt đối không được tin, dùng `http.DetectContentType` để dò MIME thật của byte, và khai báo phải khớp với thực tế. Các cuộc tấn công đổi đuôi tệp chết ngay tại đây.

**② Ước lượng trước, giải mã sau.** Bước 2 dùng `len(rawB64) * 3 / 4` để ước lượng kích thước giải mã, khi vượt hạn rõ ràng thì **hoàn toàn không thực hiện giải mã đầy đủ**. Điều này chặn được một loại DoS rất đơn giản: tải lên một chuỗi Base64 500MB.

**③ Dùng `DecodeConfig` chứ không dùng `Decode`.** `image.DecodeConfig` chỉ đọc header ảnh là lấy được chiều rộng và chiều cao, không giải mã toàn bộ pixel. Vừa nhanh vừa an toàn — giải mã trọn vẹn một ảnh 20 triệu pixel sẽ ăn hơn trăm MB RAM.

**Danh sách tham số giới hạn:**

| Hạng mục | Giới hạn |
|---|---|
| Toàn bộ body của HTTP request | 24 MiB |
| Một chuỗi Base64 đã mã hóa | 12 MiB |
| Một ảnh sau khi giải mã | 8 MiB |
| Tổng hai ảnh sau khi giải mã | 16 MiB |
| Phạm vi chiều rộng/cao | 256 px ~ 8192 px |
| Tổng số pixel | ≤ 20,000,000 px |
| Định dạng cho phép | `image/jpeg`, `image/png`, `image/webp` |

### 5.3 Nén ở frontend: Để 99% người dùng không bao giờ chạm trần giới hạn backend

Backend có giới hạn rất nghiêm, nhưng dự án không bắt người dùng tự nén ảnh, mà xử lý thích ứng ngay ở frontend:

| Công đoạn | Xử lý |
|---|---|
| Trước khi tải lên | Khi một cạnh < 256 px thì tự động **phóng to** theo tỉ lệ về kích thước hợp lệ |
| Chế độ thường | Thu nhỏ cạnh dài nhất về 1280 px |
| Chế độ HD | Thu nhỏ cạnh dài nhất về 2048 px |
| Định dạng mã hóa | Ưu tiên WebP, trình duyệt không hỗ trợ thì hạ về JPEG |
| Thang chất lượng | 0.90 → 0.75, hạ dần từng bậc cho tới khi ≤ 8 MiB |

Kết quả là: **đa số ảnh chụp bằng điện thoại tải lên trơn tru không hề nhận ra**, người dùng không bao giờ thấy thông báo "tệp quá lớn".

### 5.4 Chống SSRF: Backend công cộng không được dùng làm bậc nhảy vào mạng nội bộ

Trong `ModelConfig` có một cờ riêng:

```go
// ClientProvided 表示配置来自浏览器；启用后 HTTP 客户端会阻止内网/保留地址，降低 SSRF 风险。
ClientProvided bool
```

Các quy tắc tương ứng:

- Base URL cá nhân phải là địa chỉ HTTP/HTTPS công cộng
- **Không được chứa tài khoản, tham số truy vấn hoặc fragment**
- **localhost, mạng nội bộ và địa chỉ dành riêng đều bị từ chối**
- Gemini Key được truyền qua header, **không đi vào URL upstream**
- ComfyUI **không chấp nhận** `client_config`, chỉ dùng cấu hình cục bộ của backend

Điểm cuối cùng đặc biệt quan trọng. Đường dẫn workflow và node ID của ComfyUI chỉ được lấy từ cấu hình phía server, không cho phép request từ trình duyệt ghi đè. Nếu không, backend triển khai công cộng sẽ trở thành lỗ hổng "tùy ý truy cập cổng 8188 cục bộ và thực thi workflow tùy ý".

### 5.5 Kiểm soát đồng thời: Không xếp hàng, từ chối thẳng

| Cấu hình | Mặc định |
|---|---|
| Đồng thời tối đa toàn cục | 2 |
| Đồng thời tối đa mỗi Token | 1 |

> Thành công, thất bại, timeout, Context bị hủy và panic đều phải giải phóng chỗ.

"Không xếp hàng" là một thiết kế gây tranh cãi. Có hệ thống chọn cách xếp hàng chờ đợi, trải nghiệm người dùng mượt mà hơn. Nhưng với **interface tạo ảnh có trả phí**, xếp hàng nghĩa là request dồn ứ, mức dùng bộ nhớ tăng, timeout tăng. Trả thẳng 429 kèm `Retry-After` thành thật hơn.

### 5.6 Kỹ thuật prompt: Múa vòng với hệ thống kiểm duyệt

Đây là đoạn code thú vị nhất của dự án. `prompt.go` chuẩn bị **ba bộ prompt** cho các mô hình khác nhau.

**Prompt chung (Gemini / Doubao v.v.) — chính dùng tiếng Anh, dự phòng tiếng Trung:**

```
You are a professional fashion virtual try-on assistant.

Task: Dress the person in the first image wearing the garment in the second image,
and output a single photorealistic full-body or half-body photo.

Strict requirements:
1. Keep the person's identity EXACTLY the same: same face, same facial features,
   same skin tone, same hairstyle, same body type and proportions.
   Do not change who they are.
2. Keep the person's original pose, body angle and orientation as much as possible;
   only adjust the arms/limbs if strictly needed to fit the garment naturally.
3. Put the exact garment from the second image onto the person: preserve its color,
   fabric texture, pattern, neckline, sleeve length, hem length and silhouette faithfully.
   Do not redesign or simplify the garment.
4. The garment must drape naturally on the body, follow the body contours,
   and cast realistic folds, shadows and highlights consistent with the original lighting.
5. Keep the original background, lighting and overall mood of the person's photo.
6. Photorealistic, high detail, professional fashion editorial quality, 8k, natural skin texture.

Output: ONLY the final dressed-up photograph, nothing else.
```

**Prompt riêng cho GPT-Image** — chú ý cách diễn đạt thận trọng hơn hẳn:

```
Task: Professional commercial fashion virtual try-on photograph.

Strict Requirements:
1. Model Identity: Maintain the adult female model from Image 1 - faithfully preserve
   her facial features, ethnic identity, eye shape, smile, skin tone, and hairstyle.
2. Wardrobe: Dress her in the exact clothing and accessories shown in Image 2.
3. Safety & Fit: Professional high-end commercial lookbook standard. Fully clothed,
   modest neckline, standard tailored fit, upright standing posture, non-revealing.
4. Composition: Clean bright studio lighting, neutral minimal background,
   photorealistic 8k, high detail fashion editorial photograph.

Output: ONLY the final dressed-up photograph.
```

Khác biệt nằm ở đâu?

- "professional commercial fashion virtual try-on photograph" — nhấn mạnh ngữ cảnh **nhiếp ảnh thương mại**
- "adult female model" — xác định rõ là người mẫu nữ trưởng thành
- "Fully clothed, modest neckline, standard tailored fit, upright standing posture, non-revealing" — chủ động loại bỏ những mô tả có thể kích hoạt kiểm duyệt
- "lookbook standard" — dùng ngữ cảnh ngành đồ may cao cấp "vô hại" hơn

**Vì sao phải viết riêng?** Vì comment trong code nói rất rõ: chuỗi GPT-Image sẽ bị kiểm duyệt an toàn chính thức chặn trong kịch bản thay đồ người thật (`moderation_blocked` / `sexual`).

Đây là **một sự thỏa hiệp thực tế ở tầng kỹ thuật**: không phải để lách kiểm duyệt (làm vậy là vi phạm), mà là diễn đạt yêu cầu sát hơn với một kịch bản nhiếp ảnh thương mại vốn dĩ đã hợp lệ, để mô hình làm việc trong không gian ngữ nghĩa đúng. Đồng thời đặt mô hình mặc định là Gemini vốn kiểm duyệt dễ chịu hơn.

**Nhìn từ góc độ chiến lược nội dung**, điều này cũng giải thích vì sao thư viện ảnh phải "không có người trong khung". 1407 bộ ảnh toàn bộ chỉ trưng bày trang phục, không xuất hiện người — điều này đẩy cả chuỗi từ nguyên liệu đến prompt ra xa khỏi những ranh giới nhạy cảm. Báo cáo tuân thủ của chính dự án cũng nhấn mạnh điều này.

### 5.7 Một chi tiết dễ bị bỏ qua: MIME của ảnh kết quả cũng được dò bằng chữ ký tệp

```go
// DetectGeneratedImageMIME determines the real media type from the generated
// file signature instead of trusting provider headers or declarations.
func DetectGeneratedImageMIME(value string) (string, error) {
    ...
    if len(data) >= 8 && string(data[:8]) == "\x89PNG\r\n\x1a\n" {
        return "image/png", nil
    }
    if len(data) >= 3 && data[0] == 0xff && data[1] == 0xd8 && data[2] == 0xff {
        return "image/jpeg", nil
    }
    if len(data) >= 12 && string(data[:4]) == "RIFF" && string(data[8:12]) == "WEBP" {
        return "image/webp", nil
    }
    return "", fmt.Errorf("生成结果不是受支持的图片格式")
}
```

**Vào thì không tin header của nhà cung cấp, ra thì cũng không tin** — tự xác định theo chữ ký tệp. Sự đối xứng này rất sạch sẽ.

---
## 6. Tổng kết: Bảy điều có thể mang đi

### Điểm 1: Tầng miễn phí không phải lòng tốt, mà là cấu trúc thu hút người dùng

Mở toàn bộ 4200+ bộ thư viện ảnh miễn phí, đưa AI thay đồ làm tuỳ chọn tự host — quyết định này giúp dự án giành được 2193 Star trong 6 ngày.

**Quảng bá dựa vào "người khác dùng thử được ngay", trả phí dựa vào "kịch bản giá trị cao".** Gộp hai việc này lại tức là gộp cả việc quảng bá vào.

### Điểm 2: Tuỳ chọn phải nói rõ, không được nói lấp ló

Dự án lặp lại ba lần ở README, trên trang và trong báo cáo kiểm toán: "cần tự chuẩn bị backend và API Key, có thể phát sinh phí mô hình".

Nhiều dự án sợ nói rõ thì không ai dùng, nên nói lấp ló, kết quả người dùng không dùng được còn trách dự án. **Nói rõ ngược lại tạo niềm tin.**

### Điểm 3: Sự trôi dạt tài liệu là nợ kỹ thuật dễ bị đánh giá thấp nhất

Những chi tiết mà bản đặc tả nhiệm vụ `nvzhuang.md` bắt được rất nói lên vấn đề: mô hình mặc định có ba cách nói khác nhau ở README, cấu trúc API và comment logic nghiệp vụ; đường dẫn đọc `.env` của Docker Compose gây hiểu lầm cho người dùng.

**Những thứ này không làm chương trình sập, nhưng mỗi cái đều lãng phí nửa giờ của người dùng.** Một dự án sẵn sàng viết riêng một bản đặc tả nhiệm vụ để xoá sạch loại sai lệch này, nghĩa là tác giả hiểu "tài liệu là một phần của sản phẩm".

### Điểm 4: Yêu cầu bảo mật nên được viết y như yêu cầu sản phẩm

Bản đặc tả yêu cầu bảo mật dài 562 dòng dùng cấu trúc tiêu chuẩn: user story → Evidence → Findings → FR → mã lỗi → hạng mục cấu hình.

Điểm mấu chốt nằm ở bảng Evidence: **mỗi kết luận đều kèm vị trí trong code và lệnh kiểm chứng có thể tái lập**. Nhờ vậy tài liệu không biến thành suy đoán, và người sau cũng tự kiểm chứng được.

### Điểm 5: Hướng của giá trị mặc định luôn phải là "an toàn và dùng được"

Khi thiếu `config.yaml` thì tự động fallback về `config.example.yaml`; khi `server.address` chưa cấu hình thì gắn tường minh `:8000` thay vì cổng ngẫu nhiên; `authRequired` mặc định là `true`; `allowPrivateNetwork` mặc định là `false`.

**Fail-safe nghĩa là: khi có sự cố, hệ thống nghiêng về phía "an toàn" chứ không phải phía "chạy được".**

### Điểm 6: Bản địa hoá không phải dịch thuật, mà là quyết định về mô hình dữ liệu

Giữ tên trường bằng tiếng Nhật, dùng từ khoá tiếng Anh, giá trị danh mục bằng tiếng Nhật, rồi làm ánh xạ hai chiều ở **frontend**. Quyết định này giúp nguồn dữ liệu gốc không phải sửa, không cần một lần di chuyển dữ liệu rủi ro, đồng thời vẫn có khả năng tìm kiếm song ngữ Trung–Anh.

**Đôi khi cái giá của tương thích hoàn toàn có thể được kiến trúc hấp thụ hết.**

### Điểm 7: Dự án anh em là đòn bẩy tăng trưởng chi phí thấp

`nvzhuang` ↔ `ai-pose-gallery-zh` (288 bộ / 1439 ảnh tham chiếu tư thế) dẫn dắt lẫn nhau, ghép thành chuỗi hoàn chỉnh "tham chiếu tư thế + tham chiếu nhân vật + tham chiếu trang phục → AI sinh ảnh".

Hai dự án dùng chung nền tảng workflow ComfyUI (khái niệm `Ref2VA`), tái sử dụng kỹ thuật + dẫn dắt traffic lẫn nhau + bối cảnh bổ trợ nhau. **Đây là một trong những combo tốt nhất mà một nhà phát triển độc lập có thể chơi.**

---

## 7. Những điểm đáng chê và cần lưu ý

Nói thẳng vài hạn chế.

### 7.1 Hạn ngạch hằng ngày nằm trong bộ nhớ, khởi động lại là reset

Tài liệu ghi rõ giới hạn này. Dùng một instance cho bản thân thì không sao, nhưng nếu có ai đó biến backend này thành dịch vụ công cộng để phân phối lại, khởi động lại là làm mới hạn ngạch. Muốn mở rộng quy mô thì bắt buộc phải đổi sang Redis.

### 7.2 PNG kích thước gốc không dùng được

Thư mục `png/*.png` mà trường `原寸` trỏ tới vượt 1GB và chưa được hosting, dẫn đến 404 trên GitHub Pages. Frontend có fallback WebP nên người dùng không nhận ra. Nhưng tính năng "tải ảnh gốc" thực chất không tồn tại — **ảnh gốc thật sự cần một nơi lưu trữ ảnh riêng**.

### 7.3 Quy ước cổng từng tự mâu thuẫn

Bản đặc tả nhiệm vụ viết riêng một đoạn:

> Trang tĩnh và backend đều dùng ví dụ cổng 8000 rất dễ xung đột; vui lòng viết trong README một cặp cổng demo cục bộ rõ ràng, không xung đột.

README hiện tại đã đổi thành frontend 3000, backend 8000, nhưng cái bẫy này nhắc chúng ta: **lệnh ví dụ trong tài liệu phải được chạy thật**.

### 7.4 Tuân thủ nội dung là chiếc nhà tù vĩnh viễn

Báo cáo tự thẩm tra của dự án đánh dấu 393 món (nội y/bikini/quyến rũ) là rủi ro trung bình đến cao. Loại nội dung này khi công khai trong bất kỳ cộng đồng kỹ thuật nào đều có thể bị thuật toán phán đoán sai. Cách xử lý của dự án là "quảng bá chỉ dùng mẫu mặc thường ngày", nhưng điều này có nghĩa là **nó không bao giờ có thể khoe phần giàu có nhất trong kho của mình** — đó là một sức căng nội tại.

### 7.5 Trần quy mô của frontend một file

`index.html` dài 3278 dòng gánh style, tương tác, từ điển song ngữ, bàn thử đồ, bản ghi IndexedDB, trung tâm cài đặt và logic nén. **Không build là ưu điểm, nhưng khi file vượt 3000 dòng thì chi phí cộng tác và khả năng bảo trì bắt đầu tăng rõ rệt.**

Cái đáng học là "không build"; cái không đáng học là "không bao giờ tách".

### 7.6 Hiệu quả AI thay đồ không kiểm soát được

Prompt viết tốt đến đâu thì hiệu quả cuối cùng vẫn phụ thuộc mô hình. Những câu kiểu "giữ chính xác đường nét nét khuôn mặt" hay "tái tạo hoàn hảo" trong README, bản đặc tả chuẩn của chính dự án thực ra đã cảnh báo rõ không được viết như vậy:

> Ba hình ảnh thay đồ phải thực sự tương ứng với những gì đã hiện thực, không được giả làm thuật toán chắc chắn cho kết quả này; tránh những cách diễn đạt không thể bảo đảm như "giữ chính xác đường nét nét khuôn mặt" hay "tái tạo 100%".

**Khoảng cách giữa lý tưởng và thực tế là chi phí ẩn lớn nhất của loại sản phẩm này.**

---

## 8. Nếu bạn làm thứ tương tự, hãy lấy những gì

### Lấy kiến trúc

```
纯静态前端（零构建、零 Key、零成本）
        ↓ 用户产生真实需求后
可选后端（多模型可插拔 + 完整安全防护）
        ↓ 想省钱
本地 ComfyUI（零成本、免 Key、离线）
```

### Lấy tài liệu

Viết một bản đặc tả yêu cầu bảo mật 500+ dòng, bảng Evidence kèm vị trí code và lệnh kiểm chứng; viết một báo cáo kiểm toán với ba trạng thái PASSED / PENDING / BLOCKED rõ ràng; viết một bản quyết định về giấy phép, tách bạch việc **xử lý riêng** quyền cấp code và quyền cấp tài nguyên.

### Lấy quy chuẩn

Chép nguyên danh sách tự kiểm tra bốn điểm trong `AGENTS.md`, mỗi điểm đều phải có lệnh thực thi được, không chỉ là khẩu hiệu.

### Lấy cách cân bằng

Giữa "tương thích toàn diện" và "ghi nhãn trung thực", hãy chọn cái sau. Câu trong README "Khai báo thuộc tính nội dung tạo ảnh: toàn bộ hình ảnh đều là thiết kế trang phục mang tính khái niệm do AI tạo ra (t2i), không phải ảnh chụp sản phẩm của thương hiệu thực tế" còn tạo được niềm tin dài hạn hơn việc thêm 500 bức ảnh.

---

## 9. Cuối cùng

Số lượng code của `nvzhuang` không lớn, công nghệ dùng cũng không có chút nào hào nhoáng. Nó đạt 2193 Star trong 6 ngày không nhờ độ khó kỹ thuật, mà nhờ **làm đúng mọi chỗ "lẽ ra phải làm đúng"**:

- Tách lớp tĩnh và động, phân minh miễn phí và trả phí
- Mô hình cắm được, cấu hình là cắm được
- Coi bảo mật là tính năng, căn chỉnh toàn tuyến từ đặc tả yêu cầu đến code
- Khi thất bại thì nghiêng về phía an toàn
- Đối chiếu tài liệu và code từng mục
- Luồng dữ liệu minh bạch hoàn toàn với người dùng

Không mục nào trong số đó đòi hỏi tài năng, cái cần chỉ là **bỏ thêm ba phút ở mỗi chi tiết**.

Nếu bạn đang làm một dự án mã nguồn mở ứng dụng AI, bộ "đặc tả yêu cầu bảo mật + truy vết Evidence + giá trị mặc định Fail-Safe + bốn cổng kiểm soát trước khi commit" này đáng để mang sang nguyên vẹn.

---

**Địa chỉ dự án**

- Trải nghiệm trực tuyến: https://paipiange.github.io/nvzhuang/
- Mã nguồn GitHub: https://github.com/paipiange/nvzhuang
- Dự án anh em (tham chiếu tư thế và xưởng sinh ảnh): https://github.com/paipiange/ai-pose-gallery-zh
- Giấy phép: MIT License (hoàn toàn miễn phí mã nguồn mở, cho phép sử dụng thương mại)

**Bản dịch tiếng Trung**

Toàn bộ bản dịch tiếng Trung của các tài liệu kỹ thuật của dự án đã được đồng bộ vào thư mục `docs/nvzhuang-translations/` trong repository, gồm README, hướng dẫn triển khai backend, đặc tả kiểm tra bảo mật, phương án kỹ thuật tải lên tùy chỉnh, báo cáo thẩm tra tuân thủ và 11 tài liệu khác.

---

Eric|瑞哥
Guangdong, Thâm Quyến

✅Cựu kiến trúc sư IBM | Đồng tác viên cuốn sách blockchain "Blockchain: Công nghệ cốt lõi và Ứng dụng"
Kho mã nguồn kỹ thuật:https://github.com/gyc567
Trang cá nhân:www.topdigg.com
💼Cựu CTO của một công ty quản lý tài sản tại Singapore
👉Chủ vận hành tài khoản chính thức「瑞哥观势」
💎Tập trung vào: tạo của cải và giữ của cải
🎯Chuyên về nhóm chủ doanh nghiệp: dùng AI để giảm chi phí và tăng hiệu quả
WeChat:360369487

---

Trong thời đại nhịp độ này, tôi vẫn tin vào sức mạnh kết nối trực tiếp, trong phạm vi nhỏ, với mật độ cao.

Tôi cống hiến sự công của mình để xây dựng một vòng tròn "chống bong bóng" dành cho các chủ doanh nghiệp, tập trung vào:

🔹 Toàn dải thương mại điện tử: livestream trong nước, thương mại xuyên biên giới và ấp ủ dự án xuất khẩu

🔹 Đầu tư mạo hiểm và đầu tư công nghiệp: kết nối nguồn lực ngân hàng – tài chính, gọi vốn doanh nghiệp và sáp nhập

🔹 Hệ sinh thái nội dung: tổ chức MCN, ma trận KOL và tích hợp thương hiệu

🔹 Xây dựng tổ chức: xây dựng đội ngũ cốt lõi của doanh nghiệp, săn tìm lãnh đạo cấp cao

## Buổi gặp mặt trực tiếp của tôi

Không tổ chức đại hội, chỉ tổ chức "tiểu hội".

✅ Hội đồng tư vấn nhà sáng lập: phân tích sâu các bài toán kinh doanh

✅ Bữa cơm kín của các ông chủ: kết nối những tâm hồn cùng tần số, thậm chí giải quyết những việc lớn của đời (tầng lớp người độc thân chất lượng cao)

✅ Hội nghị ngành: tập trung vào một lĩnh vực cụ thể, thúc đẩy hợp tác thực chất

## Tiêu chí tuyển chọn:

Chỉ hoan nghênh những người sáng lập / đối tác có kết quả, có ranh giới rõ ràng, có tư duy dài hạn.

Thời gian quý giá, chỉ dành cho những người có giá trị.
