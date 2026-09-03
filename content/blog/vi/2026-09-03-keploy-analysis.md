---
title: "Keploy - Nền tảng kiểm thử API không xâm lấn dựa trên eBPF: Biến lưu lượng sản xuất thành các trường hợp kiểm thử"
date: "2026-09-03"
description: "Phân tích chuyên sâu dự án mã nguồn mở Keploy: chụp lưu lượng ở cấp độ hạt nhân với eBPF, mô hình kiểm thử Record-Replay, ảo hóa phụ thuộc, và triết lý thiết kế 'Xác minh mã AI'. Bao gồm hướng dẫn cài đặt chi tiết, phân tích kiến trúc cốt lõi và tổng hợp các quan điểm chính."
tags:
  - Keploy
  - eBPF
  - Kiểm thử API
  - Record-Replay
  - Kiểm thử tự động
  - Ảo hóa phụ thuộc
  - CI/CD
  - Mã nguồn mở
categories:
  - Phân tích công cụ AI
  - Kiểm thử tự động
  - DevOps
---

# Keploy - Nền tảng kiểm thử API không xâm lấn dựa trên eBPF: Biến lưu lượng sản xuất thành các trường hợp kiểm thử

> **Tư tưởng cốt lõi: Triết lý thiết kế của Keploy là "để bài kiểm thử đến từ mã nguồn và đi đến sản xuất". Nó sử dụng eBPF để chụp lưu lượng thực tế ở cấp độ hạt nhân Linux, tự động tạo các trường hợp kiểm thử và Mock phụ thuộc — không cần sửa bất kỳ dòng mã nào, không cần bất kỳ SDK nào, và không phụ thuộc vào ngôn ngữ hay framework. Kiểm thử không còn là gánh nặng phát triển, mà là một bản sao xác định của hành vi môi trường sản xuất.**

---

## 1. Bối cảnh dự án và nguồn gốc

### 1.1 Tại sao cần Keploy?

Là một nhà phát triển, bạn có thể đã trải qua những khoảnh khắc thất vọng này:

- **"Chạy được trên máy tôi, nhưng lỗi khi lên production"** — độ phủ unit test đạt 100%, nhưng vẫn có vấn đề ở môi trường thực
- **"API này phụ thuộc vào API bên thứ ba, không thể test ở local"** — dịch vụ bên ngoài không ổn định, môi trường test không bao giờ hoàn chỉnh
- **"Sau khi refactor không dám release"** — không có bài kiểm thử hồi quy đáng tin cậy, sửa một dòng code như gỡ bom
- **"Script test viết nhiều hơn code nghiệp vụ"** — 50% thời gian phát triển dành cho việc viết test

Gốc rễ của tất cả các vấn đề này: **kiểm thử truyền thống không thể phản ánh chính xác độ phức tạp của môi trường sản xuất.** Unit test phụ thuộc vào Mock, nhưng Mock được viết tay và luôn có khoảng cách với hành vi thực tế.

Đội ngũ sáng lập của Keploy đã trải nghiệm sâu sắc nỗi đau này khi xây dựng các hệ thống phân tán phức tạp. Giải pháp của họ: **chụp trực tiếp lưu lượng sản xuất thực tế và biến chúng thành các trường hợp kiểm thử có thể tái tạo.** Không còn viết test thủ công nữa — để môi trường sản xuất tự cho chúng ta biết nên kiểm thử như thế nào.

### 1.2 Dữ liệu chính

| Chỉ số | Dữ liệu |
|--------|----------|
| GitHub Stars | 18.4K+ |
| Mock đã tạo | 1.2M+ |
| Lần chạy test | 300M+ |
| Ngôn ngữ hỗ trợ | Go, Python, Java, Node.js, Ruby, C#, PHP, JavaScript, .NET, Kotlin, Scala, Rust, v.v. |
| Cơ sở dữ liệu hỗ trợ | PostgreSQL, MySQL, MongoDB, Redis, SQL Server, v.v. |
| Message queue hỗ trợ | Kafka, RabbitMQ, v.v. |

---

## 2. Khái niệm cốt lõi: Mô hình kiểm thử Record-Replay

### 2.1 Record-Replay là gì?

Quy trình cốt lõi của Keploy gồm hai giai đoạn:

**Record (Ghi lại):**
1. Khởi động ứng dụng với lệnh `keploy record`
2. Lưu lượng người dùng thực đến ứng dụng
3. Keploy chụp tất cả các yêu cầu mạng vào/ra thông qua eBPF ở cấp hạt nhân
4. Các yêu cầu và phản hồi phụ thuộc được lưu dưới dạng trường hợp kiểm thử định dạng YAML

**Replay (Tái tạo):**
1. Khởi động ứng dụng với lệnh `keploy test`
2. Keploy đọc các trường hợp kiểm thử YAML đã ghi trước đó
3. Gửi lại các yêu cầu HTTP đã ghi đến ứng dụng
4. Các lệnh gọi phụ thuộc được tự động Mock, trả về dữ liệu đã ghi trước đó
5. Keploy so sánh phản hồi thực tế với phản hồi đã ghi, tạo báo cáo kiểm thử

Điều này giống như lắp "camera hành trình" cho ứng dụng của bạn — ghi lại tình trạng đường thực, phát hiện bất thường khi tái tạo.

### 2.2 Sự khác biệt cơ bản với kiểm thử truyền thống

| Khía cạnh | Mock/Stub truyền thống | Keploy |
|-----------|----------------------|--------|
| Nguồn dữ liệu | Viết tay | Ghi từ lưu lượng sản xuất thực tế |
| Độ phức tạp phụ thuộc | Kịch bản đơn giản | Toàn bộ chuỗi (DB, queues, API bên ngoài) |
| Chi phí bảo trì | Cao (thay đổi code cần cập nhật Mock đồng bộ) | Thấp (ghi một lần, tự động cập nhật) |
| Trường nhiễu | Cần lọc thủ công | AI tự động nhận diện trường nhiễu |
| Thiết lập môi trường | Phức tạp | Không cần cấu hình |

### 2.3 Phát hiện nhiễu (Noise Detection)

Phản hồi môi trường sản xuất thực tế thường chứa dữ liệu động: timestamp, UUID ngẫu nhiên, giá hiện tại từ bên thứ ba, v.v. Nếu so sánh trực tiếp các trường này, tất cả các bài kiểm thử sẽ thất bại.

Giải pháp của Keploy là **phát hiện nhiễu thông minh:**

1. Sau khi ghi xong, Keploy sử dụng Mock phụ thuộc đã ghi để yêu cầu lại cùng một endpoint
2. So sánh hai phản hồi, tìm các trường khác biệt
3. Các trường khác biệt được đánh dấu là "trường nhiễu", không tham gia vào khẳng định
4. Điều này đảm bảo tính xác định của kiểm thử tái tạo

---

## 3. Công nghệ cốt lõi: Dựa trên eBPF

### 3.1 Tại sao dùng eBPF?

eBPF (Extended Berkeley Packet Filter) là công nghệ cách mạng của nhân Linux, cho phép chạy các chương trình sandbox an toàn trong nhân hệ điều hành. Keploy chọn eBPF làm nền tảng chụp lưu lượng với những lý do chính:

**Không xâm lấn:** Không cần thêm SDK vào code ứng dụng, không cần thay đổi cấu hình. Chỉ cần chạy ứng dụng dưới Keploy.

**Độc lập ngôn ngữ:** eBPF hoạt động ở tầng mạng, không phụ thuộc vào ngôn ngữ lập trình. Dù ứng dụng viết bằng Go, Python, Java hay Node.js, Keploy đều có thể chụp lưu lượng.

**Độ chính xác cấp hạt nhân:** Chụp dữ liệu ở tầng socket, không bỏ sót bất kỳ yêu cầu nào.

### 3.2 Cách eBPF hoạt động

```
Không gian người dùng
    │
    │  Ứng dụng gửi yêu cầu HTTP
    ▼
┌─────────────────────┐
│   eBPF Hooks        │ ← Ingress: Chụp yêu cầu HTTP đến
│   (Không gian hạt nhân) │
└─────────────────────┘
    │
    │  Ứng dụng gọi DB/API bên ngoài
    ▼
┌─────────────────────┐
│   eBPF Hooks        │ ← Egress: Chụp kết nối TCP/UDP ra
│   (Không gian hạt nhân) │
└─────────────────────┘
    │
    ▼
┌─────────────────────┐
│   Network Proxy      │ ← Proxy trong suốt, xử lý phân tích giao thức
│   (Không gian người dùng) │
└─────────────────────┘
    │
    ▼
┌─────────────────────┐
│   Trường hợp kiểm thử YAML │ ← Lưu kết quả ghi
└─────────────────────┘
```

### 3.3 Network Proxy

Network Proxy của Keploy là một proxy trong suốt, chịu trách nhiệm:

1. **Phân tích giao thức:** Chuyển đổi luồng nhị phân TCP thành định dạng YAML có thể đọc được
2. **Chặn TLS:** Với kết nối HTTPS, Keploy chèn chuỗi chứng chỉ giả để giải mã lưu lượng được mã hóa
3. **Khớp mờ:** Với các phụ thuộc không xác định, lưu dữ liệu nhị phân dưới dạng base64 trong YAML, sử dụng khớp mờ khi tái tạo
4. **Hỗ trợ đa giao thức:** Xử lý tích hợp sẵn cho HTTP, PostgreSQL, MySQL, MongoDB, Kafka, RabbitMQ, v.v.

---

## 4. Phân tích kiến trúc

### 4.1 Tổng quan kiến trúc Keploy V2

Keploy V2 gồm ba thành phần cốt lõi:

**1. eBPF Hooks Loader**

- **Ingress Interceptor:** Chụp các yêu cầu HTTP đến ứng dụng, lưu dưới dạng YAML
- **Egress Interceptor:** Chuyển hướng các kết nối TCP/UDP ra của ứng dụng đến máy chủ proxy của Keploy

**2. Network Proxy**

- Xử lý gói dữ liệu không đồng bộ, chuyển đổi sang định dạng có thể đọc
- Hỗ trợ cơ sở dữ liệu (Postgres, MySQL, MongoDB, v.v.)
- Hỗ trợ message queue (Kafka, RabbitMQ, v.v.)
- Hỗ trợ gọi API bên ngoài

**3. API Server**

- Quản lý vòng đời ghi/kiểm thử
- Cung cấp giao diện dòng lệnh
- Tạo báo cáo kiểm thử
- Đang phát triển hướng tới chế độ Agent đầy đủ

### 4.2 Sơ đồ luồng dữ liệu

```
        Chế độ Record
        ─────────
  Yêu cầu bên ngoài ──→ eBPF Ingress ──→ Ghi yêu cầu HTTP ──→ YAML
  Lệnh gọi ứng dụng ──→ eBPF Egress ──→ Proxy phân tích ──→ YAML (Mock)

        Chế độ Test
        ─────────
  Trường hợp kiểm thử YAML ──→ Gửi yêu cầu HTTP đã ghi ──→ Xử lý ứng dụng
  Mock YAML ──→ Proxy chặn ──→ Trả về phản hồi đã ghi ──→ Ứng dụng nhận
  So sánh kết quả ──→ Tạo báo cáo kiểm thử
```

---

## 5. Hướng dẫn cài đặt và sử dụng chi tiết

### 5.1 Yêu cầu môi trường

- Hệ thống Linux (nhân 4.18+, khuyến nghị 5.8+)
- Hỗ trợ eBPF (hầu hết các bản phân phối Linux hiện đại)
- curl (để tải script cài đặt)
- Go >= 1.17 (nếu biên dịch từ mã nguồn)

### 5.2 Cài đặt Keploy

**Cách 1: Script cài đặt chính thức (Khuyến nghị)**

```bash
curl --silent -O -L https://keploy.io/install.sh && source install.sh
```

**Cách 2: Homebrew (macOS/Linux)**

```bash
brew install keploy
```

**Cách 3: Tải binary**

```bash
wget https://github.com/keploy/keploy/releases/latest/download/keploy_linux_amd64.tar.gz
tar -xzf keploy_linux_amd64.tar.gz
sudo mv keploy /usr/local/bin/
```

### 5.3 Bắt đầu nhanh: Ứng dụng Go

**Bước 1: Khởi tạo dự án**

```bash
mkdir my-app && cd my-app
go mod init my-app
```

**Bước 2: Viết code ứng dụng (main.go)**

```go
package main

import (
    "encoding/json"
    "log"
    "net/http"
    "github.com/gorilla/mux"
)

type Response struct {
    Message string `json:"message"`
    Status  string `json:"status"`
}

func healthHandler(w http.ResponseWriter, r *http.Request) {
    json.NewEncoder(w).Encode(Response{
        Message: "OK",
        Status:  "healthy",
    })
}

func helloHandler(w http.ResponseWriter, r *http.Request) {
    vars := mux.Vars(r)
    json.NewEncoder(w).Encode(map[string]string{
        "hello": vars["name"],
    })
}

func main() {
    r := mux.NewRouter()
    r.HandleFunc("/health", healthHandler).Methods("GET")
    r.HandleFunc("/hello/{name}", helloHandler).Methods("GET")
    log.Fatal(http.ListenAndServe(":8080", r))
}
```

```bash
go get github.com/gorilla/mux
```

**Bước 3: Ghi các trường hợp kiểm thử**

```bash
# Terminal 1: Khởi động chế độ ghi
keploy record -c "go run main.go"

# Terminal 2: Gửi yêu cầu kiểm thử
curl http://localhost:8080/health
curl http://localhost:8080/hello/world
```

Sau khi ghi xong, Keploy sẽ tạo các tệp test YAML trong thư mục `keploy/testSets` của thư mục hiện tại.

**Bước 4: Tái tạo kiểm thử**

```bash
# Dừng ghi (Ctrl+C), rồi chạy kiểm thử
keploy test -c "go run main.go" --delay 10
```

`--delay 10` chờ 10 giây để ứng dụng khởi động xong. Keploy sẽ tự động thực thi tất cả các trường hợp kiểm thử đã ghi và xuất báo cáo.

### 5.4 Bắt đầu nhanh: Ứng dụng Python

```bash
# Cài đặt Flask
pip install flask

# Tạo app.py
cat > app.py << 'EOF'
from flask import Flask, jsonify
app = Flask(__name__)

@app.route("/api/hello")
def hello():
    return jsonify({"message": "Hello from Python!"})

@app.route("/api/users/<int:user_id>")
def get_user(user_id):
    return jsonify({"id": user_id, "name": "Alice"})
EOF
```

```bash
# Chế độ ghi
keploy record -c "python app.py"

# Ở terminal khác, gửi yêu cầu
curl http://localhost:5000/api/hello
curl http://localhost:5000/api/users/42

# Chế độ kiểm thử
keploy test -c "python app.py" --delay 10
```

### 5.5 Tích hợp với các framework kiểm thử hiện có

Keploy có thể tích hợp liền mạch với các framework kiểm thử phổ biến mà không cần từ bỏ quy trình kiểm thử hiện tại của bạn.

**Tích hợp go-test:**

```bash
keploy record -c "go run main.go" --generateTests
```

**Tích hợp pytest:**

```bash
keploy record -c "python app.py" --testCommand "pytest"
```

**Tích hợp JUnit (Jenkins CI):**

```bash
keploy test -c "java -jar app.jar" --ci
```

### 5.6 Sử dụng trong môi trường Docker

**Dockerfile:**

```dockerfile
FROM golang:1.21-alpine AS builder
WORKDIR /app
COPY . .
RUN go build -o server main.go

FROM alpine:latest
RUN apk add --no-cache curl
COPY --from=builder /app/server /server
COPY --from=builder /app/keploy /usr/local/bin/keploy
ENTRYPOINT ["keploy"]
```

**Chạy trong Docker Compose:**

```yaml
version: '3.8'
services:
  app:
    build: .
    environment:
      - KEPLOY_MODE=record
    network_mode: host
    privileged: true
    volumes:
      - ./keploy:/keploy
```

> Lưu ý: Chạy Keploy trong Docker cần `--network=host` và `--privileged` vì eBPF cần truy cập trực tiếp vào network namespace.

---

## 6. Tích hợp CI/CD

### 6.1 GitHub Actions

```yaml
name: Keploy Tests

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Set up Go
        uses: actions/setup-go@v5
        with:
          go-version: '1.21'

      - name: Install Keploy
        run: |
          curl --silent -O -L https://keploy.io/install.sh
          source install.sh

      - name: Run Keploy Tests
        run: |
          keploy test -c "go run main.go" --delay 15 --ci
```

---

## 7. Triết lý thiết kế: Tại sao Keploy được thiết kế như vậy

### 7.1 Nguyên tắc thiết kế cốt lõi

**1. Không xâm lấn (Zero Intrusion)**

Điểm nổi bật nhất của Keploy là hoàn toàn không cần sửa code. Sử dụng eBPF để chụp lưu lượng ở cấp hạt nhân, ứng dụng hoàn toàn không biết mình đang được kiểm thử. Điều này mang lại sự tiện lợi to lớn:

- Hệ thống legacy không cần refactor vẫn có độ phủ kiểm thử
- Thư viện và framework bên thứ ba được bao phủ tự nhiên
- Độ phủ kiểm thử hoàn toàn tách biệt với code nghiệp vụ

**2. Độc lập ngôn ngữ (Language Agnosticism)**

eBPF hoạt động ở cấp hệ điều hành, không phụ thuộc vào ngôn ngữ lập trình. Keploy có thể đồng thời kiểm thử API viết bằng Go, microservices viết bằng Python, tác vụ backend viết bằng Java — tất cả các lệnh gọi tương hỗ giữa chúng đều được chụp và ghi lại.

**3. Phụ thuộc như Code (Dependencies as Code)**

Trong kiểm thử truyền thống, phụ thuộc là phần rắc rối nhất. Hoặc xây dựng môi trường kiểm thử đầy đủ, hoặc viết một lượng lớn Mock. Cách tiếp cận của Keploy là **ghi lại các lệnh gọi phụ thuộc**, tái tạo hoàn hảo khi phát lại. Điều này có nghĩa:

- Kiểm thử không cần cơ sở dữ liệu thực
- Lệnh gọi API bên ngoài không cần máy chủ Mock
- Tương tác message queue được ghi chép đầy đủ

**4. Kiểm thử là Tài liệu (Tests as Documentation)**

Các trường hợp kiểm thử YAML mà Keploy tạo ra có thể đọc được. Mỗi trường hợp kiểm thử ghi lại:

- Thông điệp yêu cầu HTTP hoàn chỉnh (header, body, tham số query)
- Tất cả các yêu cầu và phản hồi của lệnh gọi phụ thuộc
- Phản hồi mong đợi

Các tệp YAML này chính là tài liệu sống, mô tả hành vi thực tế của API — không phải cách chúng ta "nghĩ" nó nên hoạt động, mà là cách nó "thực sự" hoạt động.

### 7.2 Kết hợp với lập trình AI

Keploy đặc biệt quan trọng trong thời đại AI-Gen. Khi AI tạo code, câu hỏi lớn nhất là **làm thế nào để xác minh code được tạo là đúng.** Phương pháp truyền thống là viết test thủ công, nhưng lượng code AI tạo ra quá lớn, viết test thủ công không thực tế.

Keploy cung cấp một hướng đi khác:

1. Ghi lại các bài kiểm thử baseline từ lưu lượng người dùng thực
2. Sau khi AI sửa code, phát lại kiểm thử bằng Keploy
3. Tự động phát hiện sự khác biệt phản hồi, thay đổi Schema, drift hành vi

Điều này tạo thành vòng lặp khép kín: "AI viết code, Keploy bắt lỗi." Keploy thậm chí đề xuất tầm nhìn: **AI writes code, Keploy catches what breaks.**

### 7.3 Giá trị của kiểm thử lưu lượng sản xuất

Cơ chế ghi-phát của Keploy có một lợi thế ít được biết đến: **có thể sử dụng lưu lượng sản xuất để kiểm thử hồi quy trong môi trường staging.** Cách thực hiện:

1. Ghi lại lưu lượng trong môi trường sản xuất (sau khi ẩn danh hóa)
2. Phát lại lưu lượng này trong môi trường staging
3. Triển khai phiên bản code mới
4. Phát lại lần nữa, so sánh sự khác biệt

Điều này giải quyết vấn đề tối hậu của kiểm thử: "Làm sao biết phiên bản mới có hoạt động đúng trong các tình huống thực tế?"

---

## 8. Tổng kết: Quan điểm và kết luận cốt lõi

### 8.1 Keploy giải quyết vấn đề gì

**Vấn đề cốt lõi: Khoảng cách giữa Kiểm thử và Sản xuất**

Kiểm thử truyền thống (unit test, integration test) đối mặt với một mâu thuẫn cơ bản: chúng kiểm thử những gì chúng ta "mong đợi" xảy ra, chứ không phải những gì "thực sự" xảy ra. Mock được viết tay và có thể không khớp với hành vi thực; môi trường kiểm thử được đơn giản hóa và có thể khác với môi trường sản xuất.

Keploy thu hẹp khoảng cách này bằng cách chụp trực tiếp lưu lượng sản xuất. Trường hợp kiểm thử đến từ các yêu cầu thực, Mock đến từ phản hồi phụ thuộc thực. Kiểm thử đạt nghĩa là: ít nhất trong thời gian ghi, endpoint này hoạt động bình thường dưới tải thực.

### 8.2 Lợi thế chính

1. **Tiết kiệm 99% thời gian viết kiểm thử:** Không cần viết trường hợp kiểm thử thủ công, chỉ cần ghi lưu lượng sản xuất
2. **Không cần cấu hình môi trường:** Không cần thiết lập cơ sở dữ liệu kiểm thử, máy chủ Mock, dịch vụ bên thứ ba để kiểm thử
3. **Kiểm thử hồi quy thực sự:** Sử dụng lưu lượng sản xuất để kiểm thử hồi quy, phát hiện vấn đề "chạy được ở local, lỗi ở production"
4. **Độc lập ngôn ngữ và framework:** Một bộ công cụ duy nhất bao phủ tất cả microservices, bất kể tech stack
5. **Độ phủ có thể đo lường:** Không chỉ có độ phủ code, mà còn có độ phủ API Schema và trường hợp sử dụng kinh doanh

### 8.3 Kịch bản áp dụng

**Khuyến nghị mạnh mẽ:**

- Ứng dụng kiến trúc microservices (có nhiều dịch vụ nội bộ và phụ thuộc bên ngoài)
- Hệ thống legacy (không muốn sửa code nhưng cần thêm kiểm thử)
- Dự án refactor thường xuyên (cần kiểm thử hồi quy đáng tin cậy)
- Xác minh code do AI tạo (nhanh chóng xác minh tính đúng đắn của code AI tạo)

**Ít phù hợp hơn:**

- Logic tính toán thuần túy (thuật toán không có I/O mạng)
- Tác vụ định thời gian cần trigger thời gian thực
- Kịch bản cần tương tác thiết bị vật lý thực

---

## 9. Câu hỏi thường gặp

**Hỏi: eBPF cần quyền root không?**
Đáp: Có, thao tác eBPF cần mức đặc quyền. Thường chạy với root hoặc sử dụng capability `CAP_BPF`.

**Hỏi: Có hỗ trợ Windows hoặc macOS không?**
Đáp: Keploy hiện chủ yếu hỗ trợ Linux. Một số người dùng chạy trên Windows thông qua WSL2, hoặc trên macOS qua Docker (cần chế độ privileged).

**Hỏi: Ghi có ảnh hưởng đến hiệu suất ứng dụng không?**
Đáp: Overhead của eBPF rất nhỏ. Thường có mức giảm hiệu suất 1-5% trong quá trình ghi, không có overhead bổ sung khi phát lại kiểm thử.

---

## 10. Tham khảo nhanh

**Cài đặt:**
```bash
curl --silent -O -L https://keploy.io/install.sh && source install.sh
```

**Ghi:**
```bash
keploy record -c "your-app-command"
```

**Kiểm thử:**
```bash
keploy test -c "your-app-command" --delay 10
```

**Tài liệu chính thức:** https://keploy.io/docs/

**GitHub:** https://github.com/keploy/keploy

**Slack cộng đồng:** https://join.slack.com/t/keploy/shared_invite/zt-3zcnuqfgl-WYK1NMhslVHsCtNcA1ULwA
