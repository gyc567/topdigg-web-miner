---
title: "Phân tích chuyên sâu Harbor Framework: Xây cho AI một 'trường thi' — Hành trình tiến hóa từ Turing-Bench đến Harbor"
description: "Phân tích toàn diện Harbor Framework (do laude-institute phát hành): một framework mã nguồn mở giúp AI Agent được đánh giá công bằng trong 'phòng thi container', đọc kỹ bài gốc là bạn sẽ hiểu. Bài viết dùng những phép so sánh mà học sinh tiểu học cũng hiểu được để giải thích rõ các khái niệm cốt lõi của Harbor — công cụ đánh giá chính thức của Terminal-Bench 2.0 (Task/Dataset/Agent/Trial/Job), cung cấp hướng dẫn cài đặt và chạy chi tiết (gồm chạy Docker cục bộ + Daytona đám mây 32 luồng song song), tổng kết sáu triết lý thiết kế (giao diện mô-đun, mở rộng ngang với cloud sandbox, đường ống dữ liệu đánh giá hợp nhất, mặc định Linux, chống gian lận, xác minh nhẹ với RewardKit), và tóm tắt các quan điểm cốt lõi như 'đánh giá là hạ tầng' và 'chạy thông tối thiểu end-to-end trước', kèm điểm chính của hai hướng dẫn thực tế LLM-as-a-Judge và MCP sidecar task."
date: "2026-08-09"
author: "TopDigg Research Team"
tags: ["Harbor", "Terminal-Bench", "AI Agent", "Benchmark", "LLM", "Evaluation", "Agent Framework", "Terminal-Bench 2.0", "Claude Code", "Daytona", "RewardKit", "MCP", "Docker", "Machine Learning"]
categories: ["Phân tích sâu"]
keywords: ["Harbor Framework", "Terminal-Bench 2.0", "đánh giá AI Agent", "benchmark", "LLM eval", "nhiệm vụ container hóa", "Daytona cloud sandbox", "RewardKit", "LLM-as-a-Judge", "huấn luyện Agent", "SFT", "RL", "tối ưu prompt", "Turing Bench", "đánh giá Claude Code"]
---

# Phân tích chuyên sâu Harbor Framework: Xây cho AI một 'trường thi' — Hành trình hoàn chỉnh từ Terminal-Bench đến đánh giá Agent

> **Ý tưởng cốt lõi:** AI cũng cần có "kỳ thi tốt nghiệp". Harbor chính là một "trường thi" dành cho AI Agent — biến mỗi nhiệm vụ thành một đề thi (môi trường container + chỉ dẫn + chấm điểm tự động), để các AI Agent của nhiều hãng khác nhau (Claude Code, Codex, Gemini CLI…) thi đấu công bằng trong cùng một phòng thi, và điểm số quyết định xem ai giống "người thực sự biết làm việc" hơn. Nó còn biến Terminal-Bench 2.0 (benchmark thao tác terminal) thành trường thi chính thức, để lần đầu tiên "AI có biết dùng terminal không" có một thước đo khoa học, tái lập được và mở rộng ngang được.

---

## Một. Đây là gì? (Bản học sinh tiểu học cũng hiểu)

Hãy tưởng tượng bạn có một nhóm "bạn nhỏ AI", tất cả đều muốn làm "trợ lý lập trình viên".

- Có bạn thì gõ bàn phím máy tính rất nhanh;
- Có bạn thì biết xem hướng dẫn;
- Có bạn thì biết mở file, sửa một chút, rồi lưu lại.

Nhưng vấn đề là: **làm sao bạn biết ai thực sự biết làm việc?**

Nếu bạn chỉ hỏi chúng: "Mày có biết không?" — thì AI nào cũng vỗ ngực nói "Biết!". Giống như trước kỳ thi hỏi học sinh "con ôn bài chưa", ai cũng nói "ôn rồi".

**Harbor chính là "thầy giáo ra đề thi".**

Nó làm ba việc:

1. **Ra đề**: Đóng gói một chỉ dẫn công việc thực tế (ví dụ "tìm bug trong thư mục này và sửa nó") vào một "căn phòng nhỏ" độc lập (container), trong phòng đã chuẩn bị sẵn máy tính, công cụ, tài liệu.
2. **Giám thị**: để AI Agent vào phòng làm việc, nó đứng bên cạnh quan sát, ghi lại từng thao tác của AI (đây chính là "trajectory", quỹ đạo bài thi).
3. **Chấm điểm**: có "thầy chấm bài" chuyên dụng (verifier) kiểm tra kết quả trong phòng — AI sửa đúng file, cài đúng phần mềm, viết đúng test, thì được 1 điểm, ngược lại 0 điểm; còn có thể chấm điểm tinh tế hơn (ví dụ "điểm hài hước 0.75").

Thi xong một AI, lại thi tiếp AI khác, ai điểm cao hơn thì là "thực tập sinh" giỏi hơn.

Hệ thống này không chỉ "thi và chấm điểm", mà còn làm được ba việc lớn:

- **Chọn nhân tài**: so sánh xem vài AI nào mạnh hơn (bảng xếp hạng benchmark);
- **Luyện nhân tài**: thu thập các quỹ đạo bài thi điểm cao, huấn luyện AI trở nên mạnh hơn (SFT / RL học tăng cường);
- **Bắt bệnh**: AI của bạn cứ sai ở một khâu nào đó? Dùng đánh giá để tìm ra nó yếu ở bước nào, rồi dùng dữ liệu tối ưu prompt của nó (prompt optimization).

Vì vậy cái tên Harbor rất hợp: **hải cảng (harbor)** — mọi "con tàu trí tuệ" của AI đều cập bến ở đây, bảo dưỡng, rồi lại ra khơi.

---

## Hai. Giới thiệu dự án

### 2.1 Thông tin cơ bản

- **Tên dự án**: Harbor
- **Tác giả/người duy trì**: laude-institute (viện nghiên cứu của Anthropic, cũng là một trong những đội ngũ gốc của Terminal-Bench)
- **Địa chỉ mã nguồn mở**: [https://github.com/laude-institute/harbor](https://github.com/laude-institute/harbor)
- **Tài liệu chính thức**: https://www.harborframework.com
- **Giấy phép**: MIT
- **Cách cài đặt**: cài một lệnh với pip / uv, chạy đánh giá đầu tiên không cần cấu hình
- **Công nghệ**: Python (CLI + giao diện), Docker (môi trường container cục bộ), cloud sandbox (Daytona / Modal / E2B / Runloop v.v.)
- **Định vị**: khung thống nhất cho đánh giá, hậu huấn luyện (post-training) và tối ưu prompt của AI Agent

### 2.2 Nó giải quyết vấn đề gì?

Tài liệu chính thức của Harbor nói rất rõ trong phần *Motivation*: **sau khi Terminal-Bench ra mắt tháng 5/2025, tác giả phát hiện mọi người dùng nó cho những việc vượt xa tưởng tượng** — có người dùng nó để đánh giá tùy chỉnh, có người dùng để tối ưu prompt, có người chạy RL (học tăng cường), có người sinh quỹ đạo huấn luyện SFT (tinh chỉnh có giám sát), còn có người nối nó vào CI/CD để làm regression test cho Agent.

Đồng thời, tác giả cũng đau đớn nhận ra: **"định nghĩa và quản lý các nhiệm vụ container hóa" rất khó ở quy mô lớn.** Thế là họ đưa luôn engine đánh giá đằng sau Terminal-Bench ra, tái cấu trúc thành một "framework đánh giá" tổng quát — đó chính là Harbor.

Vậy nên Harbor không phải là một "bộ nhiệm vụ" mới, mà là **phương pháp luận để xây trường thi**: bạn có thể dùng nó chạy các bảng xếp hạng có sẵn (Terminal-Bench, SWE-Bench Verified), cũng có thể tự định nghĩa nhiệm vụ, môi trường, Agent của riêng mình.

### 2.3 Sáu khái niệm cốt lõi (tất cả nói bằng lời dễ hiểu)

Dùng một phép so sánh "trường thi" để nói thấu mọi khái niệm của Harbor:

- **Nhiệm vụ (Task) = một đề thi**: một đoạn chỉ dẫn + một căn phòng riêng (môi trường container) + một bài chấm tự động (script test)
- **Tập dữ liệu (Dataset) = một xấp đề thi**: tổng của một đống Task, thường tương đương một benchmark (ví dụ Terminal-Bench 2.0)
- **Agent = thí sinh**: một chương trình AI có thể tái sinh. Harbor tích hợp sẵn 99 thí sinh chính thống — Claude Code, Codex CLI, Copilot CLI, Gemini CLI, Grok Build, OpenHands v.v.
- **Môi trường container (Environment) = phòng thi**: "trạng thái" của máy tính (OS nào, cài phần mềm gì, có lên mạng không)
- **Một lần thử (Trial) = một lần trả lời**: một lần trả lời hoàn chỉnh của một Agent với một đề thi, ra một điểm số (reward)
- **Lô nhiệm vụ (Job) = một kỳ thi lớn**: một đống Trial thi song song (có thể vượt qua nhiều dataset, nhiều Agent, nhiều model)

## Ba. Hướng dẫn chi tiết: chạy Terminal-Bench 2.0 từ con số không

### Bước một: cài Harbor (một lệnh)

Khuyến nghị dùng `uv` (trình quản lý gói nhanh của Python):

```bash
uv tool install harbor
```

Cài xong kiểm tra một chút:

```bash
harbor --help
```

### Bước hai: cài Docker và khởi động

Đánh giá cục bộ mặc định dùng Docker làm "căn phòng nhỏ". Cài Docker và đảm bảo nó đang chạy. Sau đó có thể chạy "đề kiểm tra" đầu tiên của Terminal-Bench 2.0 — chạy đáp án chuẩn chính thức (Oracle):

```bash
harbor run -d terminal-bench/terminal-bench-2 -a oracle
```

> **Ý nghĩa của bước này:** bạn chạy được oracle (lời giải đáp án chuẩn), nghĩa là Harbor cài đặt đúng, môi trường container sẵn sàng. Oracle là đề đạt điểm tuyệt đối, chạy thông nó tương đương trường thi tự kiểm tra đạt yêu cầu.

### Bước ba: chạy với Agent thật (cục bộ)

Thử dùng Claude Code làm thí sinh, model chọn `anthropic/claude-haiku-4-5` (nhanh và rẻ):

```bash
harbor run \
  -d terminal-bench/terminal-bench-2 \
  -m anthropic/claude-haiku-4-5 \
  -a claude-code
```

Lệnh này sẽ tự động tải dataset, khởi động container, cho Claude Code vào phòng thi trả lời, chạy chấm điểm, cuối cùng xuất báo cáo điểm số.

### Bước bốn: chạy dataset của riêng bạn (thư mục nhiệm vụ cục bộ)

Không muốn dùng dataset chính thức? Truyền một đống thư mục Task của bạn vào `-p` là được:

```bash
harbor run -p "/path/to/dataset" -m "model" -a "agent"
```

### Bước năm: mở rộng ngang trên đám mây (quan trọng!)

Chính thức đưa ra lời khuyên thực chiến quan trọng: **đánh giá Agent trong sandbox thường rất chậm** (một lần đánh giá cần hàng chục vòng hội thoại, mỗi vòng lệnh đều tốn thời gian). Muốn tăng tốc thí nghiệm, cách duy nhất là mở thêm nhiều "phòng thi" theo chiều ngang — dùng nhà cung cấp cloud sandbox (ví dụ Daytona):

```bash
export DAYTONA_API_KEY="<your-daytona-api-key>"
export ANTHROPIC_API_KEY="<your-anthropic-api-key>"
harbor run \
  -d terminal-bench/terminal-bench-2 \
  -m anthropic/claude-haiku-4-5 \
  -a claude-code \
  --env daytona \
  -n 32
```

`-n 32` nghĩa là mở 32 phòng thi song song cùng lúc. Sau khi dùng model API chạy cloud sandbox, nút thắt tốc độ chuyển từ CPU sang network I/O, nên số luồng song song có thể vượt xa số nhân máy của bạn — đây là cách làm được chính thức khuyến nghị mạnh.

### Bước sáu: xem bảng xếp hạng & nộp kết quả

- **Xem bảng xếp hạng**: https://tbench.ai/leaderboard
- **Nộp kết quả của bạn**: chính thức lưu log bảng xếp hạng trong [kho dữ liệu HuggingFace](https://huggingface.co/datasets/alexgshaw/terminal-bench-2-leaderboard), theo hướng dẫn trong README của nó mở một PR nộp là được.

## Bốn. Hướng dẫn nâng cao (chỗ cho ai đọc sâu)

### 4.1 Tự viết "nhiệm vụ" (đề thi)

Một nhiệm vụ là một thư mục, dùng một lệnh khởi tạo khung:

```bash
harbor init --task "org/name"
```

Cấu trúc sinh ra giống một đề thi chuẩn:

    task.toml             # "thông tin cá nhân" của đề + cấu hình thí sinh
    instruction.md        # đề bài (chỉ dẫn cho AI)
    environment/          # phòng thi: Dockerfile định nghĩa hệ thống
    solution/             # đáp án chuẩn (tùy chọn, dùng cho Oracle)
    tests/                # script chấm điểm (test.sh → tạo reward)

Khi chấm điểm, script chạy trong container và ghi điểm vào `/logs/verifier/reward.txt` (ghi `1` là thành công, ghi `0` là thất bại) hoặc `reward.json` (có thể nhiều chỉ số cùng lúc, ví dụ `{"runtime_sec": 1.23, "accuracy": 0.95}`).

**Một lời khuyên về chấm điểm** (tinh thần nguyên văn chính thức): trong script test hãy cố dùng **đường dẫn tuyệt đối**, tránh lỗi do đường dẫn tương đối.

### 4.2 Muốn thi Linux / Windows / nhiều container?

- **Hệ điều hành**: trong `task.toml` đặt `[environment].os = "linux"` (mặc định) hoặc `"windows"`;
- **Nhiều container** (ví dụ treo thêm một MCP Server, database bên cạnh): đặt `docker-compose.yaml` trong `environment/`, Harbor sẽ tự động gộp. Hiện tại nhiều container chỉ hỗ trợ môi trường Docker cục bộ, nhà cung cấp cloud sandbox đang phát triển.

### 4.3 Nhét Agent tự viết của bạn vào thi

Hai loại:

**Agent bên ngoài (chạy trên máy tính, điều khiển container từ xa qua exec):**

```python
from harbor.agents.base import BaseAgent

class MyExternalAgent(BaseAgent):
    @staticmethod
    def name() -> str:
        return "my-agent"

    async def setup(self, environment):
        # 安装你的 agent 和工具
        pass

    async def run(self, instruction, environment, context):
        # 在容器里执行任务
        pass
```

**Agent đã cài (như Claude Code, cài thẳng vào container chạy headless):**

```python
from harbor.agents.installed.base import BaseInstalledAgent

class MyInstalledAgent(BaseInstalledAgent):
    async def install(self, environment):
        await self.exec_as_root(environment, command="apt-get install -y curl")
        await self.exec_as_agent(environment, command="pip install my-agent")

    async def run(self, instruction, environment, context):
        await self.exec_as_agent(environment, command=f"my-agent run '{instruction}'")
```

Dùng Agent của bạn mở kỳ thi:

```bash
harbor run -d "dataset@version" --agent path.to.agent:MyAgent
```

### 4.4 Để AI làm giám khảo (hướng dẫn LLM-as-a-Judge)

Có những đề thi không thể chấm bằng "file có đúng không" (ví dụ "viết một bài thơ hài hước"). Hướng dẫn chính thức của Harbor dạy bạn đổi cả giám khảo thành LLM:

- Trong `tests/llm_judge.py` dùng Anthropic API (đầu ra có cấu trúc) đọc một thẻ, trả về điểm số;
- Khóa bí mật được tiêm qua `[verifier.env]` trong `task.toml`, trong mã nguồn không để key;
- Xuất `/logs/verifier/reward.json`, ví dụ `{ "funny": 0.75 }`, còn có thể nhiều chiều: `{ "creativity": 0.9, "humor": 0.7, "grammar": 1.0 }`.

Ví dụ đầy đủ trong `examples/tasks/llm-judge-example`, copy sửa là dùng được.

### 4.5 Cho MCP Server làm trợ lý bên cạnh phòng thi (hướng dẫn MCP Server Task)

Muốn mô phỏng nghiệp vụ thực tế "Agent phải tương tác với dịch vụ bên ngoài"? Dùng Docker Compose thêm một container "sidecar" chạy FastMCP Server:

```yaml
services:
  main:
    depends_on:
      mcp-server:
        condition: service_healthy
  mcp-server:
    build: { context: ./mcp-server }
    expose: ["8000"]
    healthcheck:
      test: ["CMD", "python", "-c", "import socket; s=socket.create_connection(('localhost',8000),timeout=2); s.close()"]
```

Trong `task.toml` khai báo `[[environment.mcp_servers]]`, các Agent tương thích như Claude Code, Codex sẽ tự động đăng ký và kết nối nó. Toàn bộ chuỗi (kết nối dịch vụ → gọi tool → ghi kết quả → pytest chấm điểm) nằm trong `examples/tasks/hello-mcp`.

### 4.6 RewardKit: bộ xác minh nhẹ (bộ công cụ chấm bài)

Chính thức đi kèm một gói độc lập **không phụ thuộc** `harbor-rewardkit`, chuyên thiết kế UI cho "chấm bài":

```bash
uv tool install harbor-rewardkit
```

- **Lập trình**: `rk.file_exists("output.txt")`, `rk.command_succeeds("python main.py")` v.v. hơn 20 tiêu chuẩn chấm điểm tích hợp sẵn;
- **Dạng phán quyết (LLM-judge)**: viết file TOML để Claude / GPT chấm điểm (binary / Likert 5 điểm);
- **Cô lập**: lo một tiêu chuẩn chấm điểm làm nhiễu tiêu chuẩn khác? Dùng `isolated=True` (overlayfs mount chỉ đọc);
- **Reward đa chiều**: `correctness`, `structure`, `quality` ra điểm riêng, rồi gộp một tổng điểm.

## Năm. Triết lý thiết kế (vì sao tác giả làm nó như vậy)

Đọc kỹ tài liệu chính thức, có thể rút ra 6 "tín điều thiết kế" rõ ràng:

**1. Giao diện mô-đun, trách nhiệm đơn nhất.**
Environment / Agent / Task là ba giao diện độc lập, không giả định lẫn nhau về độ phức tạp triển khai. Môi trường container hay cloud cũng vậy, chỉ cần triển khai `BaseEnvironment` là cắm vào được làm "phòng mới".

**2. "Mặc định tích hợp sẵn các loại chính thống", từ chối tự làm lại bánh xe.** "Trên thế giới đã có 99% nhiệm vụ được chạy bởi các Agent có sẵn", Harbor trực tiếp đóng gói hết các CLI Agent chính thống như Claude Code, Copilot CLI, Codex CLI, Gemini CLI, Grok Build, OpenHands vào trong gói, người dùng mở hộp là dùng được.

**3. Mở rộng ngang thắng nhồi phần cứng.** Chính thức nhấn đi nhấn lại: đánh giá tốn thời gian, cách duy nhất để tăng tốc là trải rộng theo chiều ngang **cloud sandbox (Daytona / Modal / E2B / Runloop / EC2 / Beam……)**, vì khi chạy model API, nút thắt là I/O chứ không phải CPU.

**4. Dữ liệu đánh giá = tài sản huấn luyện ("đề thi chính là giáo trình để dạy sau này").** Harbor kết nối các framework học tăng cường như SkyRL, GEPA, trực tiếp chuyển các quỹ đạo điểm số (trajectories) của đánh giá thành dữ liệu tinh chỉnh SFT. Thi không phải để đóng dấu cho AI, mà để AI học tốt hơn.

**5. An toàn và chống gian lận được đặt vào mặc định.** Khi chấm điểm, nhờ "môi trường thí sinh" và "môi trường giám thị" khác nhau (verifier separate), mã chấm điểm không nhìn thấy container của agent, chống Agent lén xem đáp án; khóa bí mật còn được tiêm bằng `${VAR}`, tuyệt đối không vào mã nguồn nhiệm vụ.

**6. Dùng cấu trúc tối giản để chở sự phán xét nghiêm túc nhất.** Tài liệu trang chủ nhấn đi nhấn lại "nhiệm vụ tốt = cấu trúc gọn (instruction.md / task.toml / container / solution / tests) + file chấm điểm rõ ràng": khuyến nghị dùng đường dẫn tuyệt đối, đặt số phiên bản cho nhiệm vụ, hỗ trợ chấm điểm từng giai đoạn. Phán xét phức tạp không nên dựa vào định dạng hoa mỹ, mà nên dựa vào quy ước rõ ràng — đây là thẩm mỹ kỹ thuật của "triển khai tối thiểu + khả năng xác minh tối đa".

## Sáu. Tổng kết: quan điểm cốt lõi của chúng tôi

Tổng hợp phản ánh tài liệu và thực tiễn, đưa ra 6 quan điểm kết luận:

### Quan điểm 1: Đánh giá AI đang trở thành "hạ tầng", không còn là "công cụ nghiên cứu"

Sự ra đời của Harbor đánh dấu một xu hướng: khi Terminal-Bench được dùng làm nguồn dữ liệu huấn luyện, tối ưu prompt, CI/CD và RL, **đánh giá trở thành trung tâm của toàn bộ vòng lặp phát triển AI Agent (training → eval → improve)**. Ai nắm được framework đánh giá dùng tốt, người đó nắm được bàn đạp tăng tốc cho lần nâng cấp năng lực Agent tiếp theo.

### Quan điểm 2: Container hóa là "lưới an toàn" của đánh giá Agent, không phải "tùy chọn"

Agent phải thực sự động tay sửa môi trường (cài gói, viết file, khởi động dịch vụ), chạy trong container mới có thể: cô lập rủi ro, môi trường tái lập được, cho mỗi lần thử một căn phòng riêng. Harbor đặt "mỗi nhiệm vụ một container nhỏ" làm mặc định, đây là tiền đề của **phép đo thực sự về năng lực Agent**.

### Quan điểm 3: cloud sandbox + song song hóa là con đường tăng tốc thực tế duy nhất

Đánh giá một Agent chậm đến "không thể chấp nhận" là chuyện thường, mà `-n 32` kiểu mở rộng ngang (I/O bound) là cách tăng tốc được chính thức công nhận. "Máy không đủ" không phải cái cớ, câu trả lời theo ngân sách chính là chạy trên cloud.

### Quan điểm 4: chấm điểm đánh giá có thể "đa nguyên", người chấm cũng có thể là AI

Từ điểm nhị phân `reward.txt` đến điểm đa chiều `reward.json`, rồi đến LLM-as-a-Judge, RewardKit với TOML chấm điểm khoan dung — **Harbor nâng cấp 'chấm điểm' từ một câu yes/no thành một năng lực có thể tổ hợp**: chất lượng code, sự hài hước, tính khả dụng đều có thể định lượng.

### Quan điểm 5: "Agent đi kèm" và "nhiệm vụ đi kèm" là hai tầng mở

Ba tầng mở: dùng Agent có sẵn chạy bộ chấm điểm có sẵn (không code); dùng giao diện nối Agent của riêng bạn (một chút code); từ đầu định nghĩa nhiệm vụ + môi trường của riêng mình (kiểm soát hoàn toàn). **Giá trị cao nhất của sự mở: bất kỳ ai cũng có thể trở thành người giáo dục đánh giá.**

### Quan điểm 6: Terminal là trường thi đầu tiên đo "AI có làm được việc không"

Terminal-Bench 2.0 không thi "biết chat", mà thi "hành vi trong terminal thực": cài gói, Debug, sửa code, tra tài liệu. Ý nghĩa của Harbor là biến chuyện "AI có xuống tay làm việc được không" vốn mơ hồ thành một thước đo đo được, so sánh được, truyền lại được — đây là giá trị lớn nhất của framework này.

## Bảy. Một câu dành cho độc giả

> **Đừng chỉ biết cho AI chat, hãy học cách chấm điểm AI.** Toàn bộ triết lý thiết kế của Harbor gói trong một câu: **biến việc đánh giá thành giống như phát triển — mô-đun, tái lập được, mở rộng được.** Khi bạn cần chọn model, tối ưu prompt, huấn luyện Agent của riêng mình, hãy dựng một "phòng thi nhỏ" trước, để dữ liệu lên tiếng, chứ không phải để cảm giác lên tiếng.

---

## Tài liệu tham khảo

- Tài liệu chính thức Harbor Getting Started: https://www.harborframework.com/docs/getting-started
- Core Concepts: https://www.harborframework.com/docs/core-concepts
- Motivation: https://www.harborframework.com/docs
- Hướng dẫn chính thức Running Terminal-Bench: https://www.harborframework.com/docs/tutorials/running-terminal-bench
- Hướng dẫn LLM-as-a-Judge: https://www.harborframework.com/docs/tutorials/llm-as-a-judge
- Hướng dẫn MCP Server Task: https://www.harborframework.com/docs/tutorials/mcp-server-task
- Tài liệu RewardKit: https://www.harborframework.com/docs/rewardkit
- Migrating from Terminal-Bench: https://www.harborframework.com/docs/migration
- Trang web chính thức Terminal-Bench: https://tbench.ai
- Repository: https://github.com/laude-institute/harbor