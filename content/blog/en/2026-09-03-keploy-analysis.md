---
title: "Keploy Deep Dive: eBPF-Driven Zero-Intrusion API Testing Platform — Turning Production Traffic into Test Cases"
date: "2026-09-03"
description: "In-depth analysis of the Keploy open-source project: eBPF kernel-level traffic capture, Record-Replay testing paradigm, dependency virtualization, and the 'AI Code Verification' design philosophy. Includes detailed tutorials, architecture analysis, and key insights."
tags:
  - Keploy
  - eBPF
  - API Testing
  - Record-Replay
  - Automated Testing
  - Dependency Virtualization
  - CI/CD
  - Open Source
categories:
  - Deep Dive
  - Automated Testing
  - DevOps
---

# Keploy Deep Dive: eBPF-Driven Zero-Intrusion API Testing Platform — Turning Production Traffic into Test Cases

> **Core Philosophy: Keploy's design philosophy is "let tests come from code and go to production." It uses eBPF to capture real traffic at the Linux kernel level, automatically generating test cases and dependency mocks — without modifying a single line of code, without any SDK, and independent of any programming language or framework. Testing is no longer a burden on development, but a deterministic mirror of production behavior.**

---

## 1. Project Background and Origin

### 1.1 Why Do We Need Keploy?

As a developer, you may have experienced these frustrating moments:

- **"It works on my machine, but breaks in production"** — unit test coverage is 100%, yet problems still appear online
- **"This endpoint depends on a third-party API, so I can't test it locally"** — external services are unstable, test environments are never complete
- **"I'm afraid to ship after refactoring"** — no reliable regression tests, changing one line of code feels like defusing a bomb
- **"Writing test scripts takes more time than writing business code"** — 50% of development time spent on tests

The root cause of all these problems: **traditional testing cannot truly reflect the complexity of production environments.** Unit tests rely on mocks, but mocks are manually written and always diverge from real behavior.

Keploy's founding team deeply felt this pain when building complex distributed systems. Their solution: **capture real production traffic directly and turn it into replayable test cases.** Stop writing tests manually — let the production environment tell us how to test itself.

### 1.2 Key Statistics

| Metric | Data |
|--------|------|
| GitHub Stars | 18.4K+ |
| Mocks Generated | 1.2M+ |
| Test Runs | 300M+ |
| Supported Languages | Go, Python, Java, Node.js, Ruby, C#, PHP, JavaScript, .NET, Kotlin, Scala, Rust, and more |
| Supported Databases | PostgreSQL, MySQL, MongoDB, Redis, SQL Server, and more |
| Supported Message Queues | Kafka, RabbitMQ, and more |

---

## 2. Core Concept: Record-Replay Testing Paradigm

### 2.1 What is Record-Replay?

Keploy's core workflow has two phases:

**Record Mode:**
1. Start your application with `keploy record`
2. Real user traffic hits your application
3. Keploy captures all inbound and outbound network requests via eBPF at the kernel level
4. These requests and dependency responses are stored as YAML test cases

**Replay Mode:**
1. Start your application with `keploy test`
2. Keploy reads previously recorded YAML test cases from local storage
3. Resends the recorded HTTP requests to the application
4. Dependency calls are automatically mocked, returning previously recorded data
5. Keploy compares actual responses with recorded responses and generates a test report

Think of it as installing a "dashcam" for your application — recording real road conditions, then detecting anomalies during playback.

### 2.2 Fundamental Differences from Traditional Testing

| Dimension | Traditional Mock/Stub | Keploy |
|-----------|---------------------|--------|
| Data Source | Manually written | Real production traffic recording |
| Dependency Complexity | Simple scenarios | Full chain (DB, queues, external APIs) |
| Maintenance Cost | High (code changes require syncing Mock updates) | Low (record once, auto-update) |
| Noisy Fields | Requires manual filtering | AI automatically identifies noisy fields |
| Environment Setup | Tedious | Zero configuration |

### 2.3 Noise Detection

Real production responses often contain dynamic data: timestamps, random UUIDs, current prices from third parties, etc. If you compare these fields directly, all tests will fail.

Keploy's solution is **intelligent noise detection:**

1. After recording is complete, Keploy re-requests the same endpoint using recorded dependency mocks
2. Compares the two responses to identify differing fields
3. Differing fields are marked as "noisy fields" and excluded from assertions
4. This ensures deterministic replay testing

---

## 3. Core Technology: eBPF-Powered

### 3.1 Why eBPF?

eBPF (Extended Berkeley Packet Filter) is a revolutionary Linux kernel technology that allows sandboxed programs to run safely within the operating system kernel. Keploy chose eBPF as the foundation for traffic capture for several key reasons:

**Zero Intrusion:** No SDK needs to be added to application code, no configuration changes. Just run your application under Keploy.

**Language Agnosticism:** eBPF works at the network layer, independent of any programming language. Whether your application is written in Go, Python, Java, or Node.js, Keploy can capture its traffic.

**Kernel-Level Precision:** Captures data at the socket layer — no request is missed.

### 3.2 How eBPF Works

```
User Space
    │
    │  Application makes HTTP request
    ▼
┌─────────────────────┐
│   eBPF Hooks        │ ← Ingress: Captures incoming HTTP requests
│   (Kernel Space)    │
└─────────────────────┘
    │
    │  Application makes DB/external API calls
    ▼
┌─────────────────────┐
│   eBPF Hooks        │ ← Egress: Captures outbound TCP/UDP connections
│   (Kernel Space)    │
└─────────────────────┘
    │
    ▼
┌─────────────────────┐
│   Network Proxy      │ ← Transparent proxy, handles protocol parsing
│   (User Space)      │
└─────────────────────┘
    │
    ▼
┌─────────────────────┐
│   YAML Test Cases    │ ← Stores recorded results
└─────────────────────┘
```

### 3.3 Network Proxy

Keploy's Network Proxy is a transparent proxy responsible for:

1. **Protocol Parsing:** Converts TCP binary streams into human-readable YAML format
2. **TLS Interception:** For HTTPS connections, Keploy inserts a fake certificate chain to decrypt encrypted traffic
3. **Fuzzy Matching:** For unknown dependencies, stores binary data as base64, using fuzzy matching during replay
4. **Multi-Protocol Support:** Built-in handling for HTTP, PostgreSQL, MySQL, MongoDB, Kafka, RabbitMQ, and more

---

## 4. Architecture Analysis

### 4.1 Keploy V2 Architecture Overview

Keploy V2 consists of three core components:

**1. eBPF Hooks Loader**

- **Ingress Interceptor:** Captures incoming HTTP requests to the application, storing them as YAML
- **Egress Interceptor:** Redirects the application's outbound TCP/UDP connections to Keploy's proxy server

**2. Network Proxy**

- Asynchronously processes data packets, converting them to readable format
- Supports databases (Postgres, MySQL, MongoDB, etc.)
- Supports message queues (Kafka, RabbitMQ, etc.)
- Supports external API calls

**3. API Server**

- Manages the lifecycle of recording and testing
- Provides command-line interface
- Generates test reports
- Evolving toward a full Agent mode

### 4.2 Data Flow Diagram

```
        Record Mode
        ─────────
  External Request ──→ eBPF Ingress ──→ Record HTTP Request ──→ YAML
  Application Call ──→ eBPF Egress ──→ Proxy Parsing ──→ YAML (Mock)

        Test Mode
        ─────────
  YAML Test Cases ──→ Send Recorded HTTP Requests ──→ Application Processing
  YAML Mock ──→ Proxy Intercepts ──→ Return Recorded Response ──→ Application Receives
  Compare Results ──→ Generate Test Report
```

---

## 5. Detailed Installation and Usage Tutorial

### 5.1 Requirements

- Linux system (kernel 4.18+, recommended 5.8+)
- eBPF support (most modern Linux distributions)
- curl (for downloading the install script)
- Go >= 1.17 (if building from source)

### 5.2 Installing Keploy

**Method 1: Official Install Script (Recommended)**

```bash
curl --silent -O -L https://keploy.io/install.sh && source install.sh
```

**Method 2: Homebrew (macOS/Linux)**

```bash
brew install keploy
```

**Method 3: Download Binary**

```bash
wget https://github.com/keploy/keploy/releases/latest/download/keploy_linux_amd64.tar.gz
tar -xzf keploy_linux_amd64.tar.gz
sudo mv keploy /usr/local/bin/
```

### 5.3 Quick Start: Go Application

**Step 1: Initialize Project**

```bash
mkdir my-app && cd my-app
go mod init my-app
```

**Step 2: Write Application Code (main.go)**

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

**Step 3: Record Test Cases**

```bash
# Terminal 1: Start recording mode
keploy record -c "go run main.go"

# Terminal 2: Send test requests
curl http://localhost:8080/health
curl http://localhost:8080/hello/world
```

After recording, Keploy generates YAML test files in the current directory's `keploy/testSets` folder.

**Step 4: Replay Tests**

```bash
# Stop recording (Ctrl+C), then run tests
keploy test -c "go run main.go" --delay 10
```

`--delay 10` waits 10 seconds for the application to finish starting. Keploy automatically executes all recorded test cases and outputs a report.

### 5.4 Quick Start: Python Application

```bash
# Install Flask
pip install flask

# Create app.py
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
# Recording mode
keploy record -c "python app.py"

# In another terminal, send requests
curl http://localhost:5000/api/hello
curl http://localhost:5000/api/users/42

# Test mode
keploy test -c "python app.py" --delay 10
```

### 5.5 Integrating with Existing Test Frameworks

Keploy integrates seamlessly with mainstream testing frameworks without abandoning your existing workflow.

**Integrating with go-test:**

```bash
keploy record -c "go run main.go" --generateTests
```

**Integrating with pytest:**

```bash
keploy record -c "python app.py" --testCommand "pytest"
```

**Integrating with JUnit (Jenkins CI):**

```bash
keploy test -c "java -jar app.jar" --ci
```

### 5.6 Using Keploy in Docker

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

**Running in Docker Compose:**

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

> Note: Running Keploy in Docker requires `--network=host` and `--privileged` mode, as eBPF needs direct access to network namespaces.

---

## 6. CI/CD Integration

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

### 6.2 GitLab CI

```yaml
stages:
  - test

keploy-test:
  stage: test
  image: golang:1.21
  before_script:
    - curl --silent -O -L https://keploy.io/install.sh
    - source install.sh
  script:
    - keploy test -c "go run main.go" --delay 15 --ci
```

---

## 7. Design Philosophy: Why Keploy is Built This Way

### 7.1 Core Design Principles

**1. Zero Intrusion**

Keploy's biggest design highlight: no code modifications needed at all. Using eBPF to capture traffic at the kernel level, the application is completely unaware it's being tested. This brings enormous convenience:

- Legacy systems don't need any refactoring to gain test coverage
- Third-party libraries and frameworks are naturally covered
- Test coverage is completely decoupled from business code

**2. Language Agnosticism**

eBPF operates at the OS level, independent of any programming language. Keploy can simultaneously test APIs written in Go, microservices in Python, backend tasks in Java — all inter-service calls are captured and recorded.

**3. Dependencies as Code**

In traditional testing, dependencies are the most troublesome part. Either you set up a complete test environment, or you write extensive mocks. Keploy's approach: **record dependency calls as well**, perfectly recreating them during replay. This means:

- Tests don't need a real database
- External API calls don't need a mock server
- Message queue interactions are fully recorded

**4. Tests as Documentation**

Keploy-generated YAML test cases are human-readable. Each test case records:

- Complete HTTP message of the request (headers, body, query parameters)
- All dependency call requests and responses
- Expected response

These YAML files are living documentation describing the API's actual behavior — not how we "think" it should work, but how it "actually" works.

### 7.2 Integration with AI Programming

Keploy is especially important in the AI-Gen era. When AI generates code, the biggest question is **how to verify the generated code is correct.** Traditional methods involve manually writing tests, but the volume of AI-generated code makes manual testing impractical.

Keploy provides an alternative approach:

1. Record baseline tests from real user traffic
2. After AI modifies code, replay tests with Keploy
3. Automatically detect response differences, schema changes, and behavioral drift

This creates a closed loop: "AI writes code, Keploy catches what breaks."

### 7.3 The Value of Production Traffic Testing

Keploy's record-replay mechanism has a lesser-known advantage: **using production traffic for regression testing in staging environments.** The approach:

1. Record traffic in production (after sanitization)
2. Replay this traffic in staging
3. Deploy new version code
4. Replay again and compare differences

This solves the ultimate testing problem: "How do I know if the new version will work in real scenarios?"

---

## 8. Summary: Key Insights and Conclusions

### 8.1 What Problem Keploy Solves

**Core Problem: The Gap Between Testing and Production**

Traditional testing (unit tests, integration tests) faces a fundamental contradiction: they test what we "expect" to happen, not what "actually" happens. Mocks are manually written and may not match real behavior; test environments are simplified and may differ from production.

Keploy bridges this gap by directly capturing production traffic. Test cases come from real requests; mocks come from real dependency responses. Tests passing means: at least during the recording period, this endpoint worked correctly under real load.

### 8.2 Key Advantages

1. **Saves 99% of test writing time:** No more manually writing test cases — just record production traffic
2. **Zero environment configuration:** No need to set up test databases, mock servers, or test third-party services
3. **True regression testing:** Use production traffic for regression testing, catching "works on my machine, breaks in prod" issues
4. **Language and framework agnostic:** One tool covers all microservices, regardless of tech stack
5. **Measurable coverage:** Not just code coverage, but API schema coverage and business use-case coverage

### 8.3 Use Cases

**Highly Recommended For:**

- Microservice architecture applications (with many internal services and external dependencies)
- Legacy systems (don't want to modify code but need test coverage)
- Frequently refactored projects (need reliable regression testing)
- AI-generated code verification (quickly verify AI-generated code correctness)

**Less Suitable For:**

- Pure computational logic (algorithms without network I/O)
- Timed tasks requiring real-time triggering
- Scenarios requiring real physical device interaction

### 8.4 Relationship with Existing Tools

Keploy doesn't aim to replace existing unit testing frameworks — it **complements what they can't do:**

- **Jest / go-test / JUnit:** Test individual function logic correctness → Keploy supplements with real API end-to-end integration
- **Postman:** Manual API testing → Keploy automates and persists manual testing
- **WireMock:** Manually define mocks → Keploy automatically generates mocks from real traffic
- **Selenium/Puppeteer:** UI automation testing → Keploy focuses on backend API layer

### 8.5 Open Source and Commercialization

Keploy's core functionality is open source (Apache 2.0 license), ensuring broad community support. Commercial version (Keploy Cloud) provides:

- Kubernetes environment recording
- Production environment recording and monitoring
- Mock Registry (centralized management of mock versions)
- Time Freezing: freeze system time for deterministic replay
- Enterprise security and compliance controls

---

## 9. FAQ

**Q: Does eBPF require root privileges?**
A: Yes, eBPF operations require privilege level. Usually runs as root or with `CAP_BPF` capability.

**Q: Does it support Windows or macOS?**
A: Keploy primarily supports Linux. Some users run it on Windows via WSL2, or on macOS via Docker (requires privileged mode).

**Q: Does recording affect application performance?**
A: eBPF overhead is minimal. Usually 1-5% performance loss during recording; no additional overhead during test replay.

**Q: Is recorded traffic secure?**
A: YAML files are stored locally and not automatically uploaded. Sensitive data should be sanitized before recording, or use Keploy Cloud's encrypted storage.

**Q: How to handle high traffic scenarios?**
A: Keploy has deduplication — only unique requests are recorded in high-traffic environments. Official recommendation: start recording from low-traffic environments.

---

## 10. Quick Reference

**Install:**
```bash
curl --silent -O -L https://keploy.io/install.sh && source install.sh
```

**Record:**
```bash
keploy record -c "your-app-command"
```

**Test:**
```bash
keploy test -c "your-app-command" --delay 10
```

**Official Docs:** https://keploy.io/docs/

**GitHub:** https://github.com/keploy/keploy

**Community Slack:** https://join.slack.com/t/keploy/shared_invite/zt-3zcnuqfgl-WYK1NMhslVHsCtNcA1ULwA
