---
title: "Từ Tauri sang Electron: Bài học đau đớn từ Founder của Paseo"
date: "2026-08-20"
description: "Ngày 28/05/2026, Mo Boudra - Founder của Paseo đã viết 'Tôi đã sai về Electron' - một bài viết chi tiết về việc chuyển đổi Paseo từ Tauri sang Electron, phơi bày những nguy hiểm của việc đưa ra quyết định 'theo cảm tính' trong việc chọn công nghệ."
tags:
  - Lựa chọn công nghệ
  - Electron
  - Tauri
  - Ứng dụng Desktop
  - Mã nguồn mở
  - Paseo
categories:
  - Chuyên sâu kỹ thuật
source:
  aggregator: "比特财商"
  aggregator_url: "https://mp.weixin.qq.com/s/Q-SOuDzIX69B_KE4pIAwWlofqxUaRF4H7CkCksIl3VD0gyRIeDsQkZPPl3Ms0hV1"
  original:
    name: "比特财商"
    url: "https://mp.weixin.qq.com/s/Q-SOuDzIX69B_KE4pIAwWlofqxUaRF4H7CkCksIl3VD0gyRIeDsQkZPPl3Ms0hV1"
---

## Mở đầu: Một Founder thừa nhận mình đã sai

Ngày 28 tháng 5 năm 2026, **Mo Boudra** - Founder của Paseo đã đăng một bài blog với tiêu đề khiến cộng đồng công nghệ ngạc nhiên: **"I was wrong about Electron"** (Tôi đã sai về Electron).

Đây không phải là một lời tự phê bình nhẹ nhàng. Trong bài blog đó, Boudra đã chi tiết hóa toàn bộ quá trình "thay tim" - chuyển đổi framework từ Tauri sang Electron cho ứng dụng desktop Paseo.

Với một dự án nguồn mở vừa đạt được **14.4k GitHub Stars** và được cộng đồng quan tâm rộng rãi, sự tự phản chiếu thẳng thắn này là vô cùng hiếm. Điều còn hiếm hơn là anh không dừng lại ở "nhận lỗi", mà đã trình bày toàn bộ chuỗi quyết định chuyển đổi, các坑 (pitfall) và quá trình suy nghĩ của mình trước mặt tất cả mọi người.

**Bài viết này là một bài giảng công khai về lựa chọn công nghệ.**

---

## 1. Paseo là gì?

Trước khi đi sâu vào chi tiết kỹ thuật, hãy trả lời câu hỏi cơ bản: **Paseo là gì?**

Paseo là một **nền tảng điều phối tác tử AI cấp desktop**, sứ mệnh cốt lõi của nó là cho phép bạn gọi các trợ lý lập trình AI từ nhiều nhà cung cấp khác nhau - bao gồm **Claude Code, Copilot, Codex, OpenCode và Pi** - tất cả trong **cùng một giao diện**.

Nói cách khác, nó không phải là một công cụ lập trình AI khác, mà là một **lớp điều phối thống nhất**. Dù bạn quen dùng Agent nào, bạn đều có thể quản lý, chuyển đổi và cộng tác thông qua giao diện và workflow thống nhất của Paseo.

### Các tính năng chính

| Tính năng | Mô tả |
|---|---|
| **Điểm vào đa tác tử thống nhất** | Kết nối Claude Code, Copilot, Codex, OpenCode, Pi |
| **Chạy ưu tiên local** | Tác tử chạy trên máy local, truy cập đầy đủ môi trường phát triển |
| **Đồng bộ đa thiết bị** | Trải nghiệm thống nhất trên iOS, Android, desktop, web và CLI |
| **Điều khiển bằng giọng nói** | Hỗ trợ nhập liệu bằng giọng nói, chỉ cần "nói" để đưa ra nhiệm vụ |
| **Bảo mật riêng tư tuyệt đối** | Không telemetry, không tracking, không đăng nhập bắt buộc |
| **Mã hóa đầu cuối** | Ghép nối đa thiết bị sử dụng truyền tải được mã hóa |
| **Nguồn mở AGPL-3.0** | Mã nguồn mở, do cộng đồng phát triển |

### Triết lý kiến trúc của Paseo

Thiết kế kiến trúc của Paseo phản ánh rõ ràng một nguyên tắc cốt lõi: **code và dữ liệu của bạn luôn ở bên bạn**.

Nó điều phối các tác tử thông qua một **Node.js daemon** chạy trên cổng local `6767`. Tất cả các client (desktop, di động, web, CLI) giao tiếp với daemon này qua **WebSocket**. Ghép nối đa thiết bị được thực hiện thông qua một **dịch vụ relay được mã hóa đầu cuối**.

Kiến trúc này mang lại một số lợi thế quan trọng:

1. **Bảo mật riêng tư tự nhiên**: Code không đi qua bất kỳ server bên thứ ba nào
2. **Hiệu suất xuất sắc**: Daemon tương tác trực tiếp với môi trường phát triển local, không có độ trễ mạng
3. **Khả năng mở rộng cao**: TypeScript SDK cho phép bất kỳ ai xây dựng tích hợp riêng dựa trên Paseo

---

## 2. Kiến trúc kỹ thuật chi tiết: Một daemon + Nhiều client

### 2.1 Cấu trúc Monorepo

Paseo sử dụng quản lý monorepo với các gói cốt lõi sau:

```
packages/
├── server/    # Node.js daemon, điều phối tiến trình tác tử, WebSocket API, MCP server
├── app/       # Expo client (iOS, Android, Web)
├── cli/       # Công cụ paseo CLI
├── desktop/   # Ứng dụng desktop Electron
├── relay/     # Tầng truyền tải relay & mô-đun mã hóa
└── website/   # Website chính thức & tài liệu
```

### 2.2 Nguyên lý hoạt động của Daemon Mode

Paseo daemon là hệ thần kinh trung ương của toàn bộ hệ thống. Nó chịu trách nhiệm:

- **Quản lý vòng đời tác tử**: Khởi động, dừng, giám sát các tiến trình tác tử lập trình
- **WebSocket API**: Cung cấp giao diện giao tiếp thời gian thực cho tất cả client
- **MCP (Model Context Protocol) server**: Triển khai giao thức tiêu chuẩn kết nối với các nhà cung cấp mô hình AI
- **Điều phối đa tiến trình**: Truyền ngữ cảnh và phân phối nhiệm vụ giữa nhiều tác tử

Khởi động daemon chỉ cần một dòng lệnh:

```bash
# Triển khai Docker
docker run -d --name paseo \
  -p 6767:6767 \
  -e PASEO_PASSWORD=change-me \
  -v "$PWD/paseo-home:/home/paseo" \
  -v "$PWD:/workspace" \
  ghcr.io/getpaseo/paseo:latest

# Khởi động qua CLI (phát triển local)
paseo daemon start
```

### 2.3 Giao tiếp thời gian thực qua WebSocket

Tất cả client kết nối với `localhost:6767` qua WebSocket, điều này có nghĩa:

- Client desktop có thể xem luồng đầu ra của tác tử theo thời gian thực
- Client di động có thể giám sát tiến độ nhiệm vụ từ xa
- Công cụ CLI có thể được nhúng vào bất kỳ workflow terminal nào

```bash
# Kết nối daemon qua CLI
paseo connect --agent claude-code

# Xem các tác tử đang hoạt động
paseo status
```

### 2.4 TypeScript SDK: Tích hợp liền mạch vào dự án của bạn

Nếu bạn muốn xây dựng công cụ hoặc nền tảng riêng dựa trên Paseo, có thể sử dụng SDK chính thức `@getpaseo/client`:

```typescript
import { createClient } from '@getpaseo/client';

const client = createClient({
  password: process.env.PASEO_PASSWORD,
  host: 'localhost',
  port: 6767,
});

// Kết nối daemon và lấy danh sách tác tử đang hoạt động
const agents = await client.listAgents();
console.log('Tác tử đang hoạt động:', agents);

// Gửi nhiệm vụ đến tác tử được chỉ định
await client.sendTask({
  agentId: 'claude-code',
  prompt: 'Tối ưu hóa tốc độ build của dự án hiện tại',
});
```

---

## 3. Chuyển đổi từ Tauri sang Electron: Retrospective kỹ thuật đầy đủ

### 3.1 Lựa chọn ban đầu: Tại sao là Tauri?

Giai đoạn đầu dự án, Mo Boudra - như nhiều nhà phát triển khác - có thiên kiến với Electron: **kích thước lớn, tiêu tốn bộ nhớ cao, khởi động chậm**. Họ chọn Tauri với những lý do có vẻ hợp lý:

- **Rust backend**: Hiệu suất xuất sắc, tiêu tốn bộ nhớ thấp
- **Gói nhị phân nhỏ gọn**: Ứng dụng đóng gói bằng Tauri nhỏ hơn nhiều so với Electron
- **Webview native**: Mong đợi hiệu suất "cấp native" trên mọi nền tảng

Đây确实是 Tauri 的真实优势。但问题在于，**理论优势和实际落地之间，隔着整个工程现实。**

### 3.2 问题一：Linux 上的 WebKitGTK 噩梦

Tauri 在 Linux 上依赖系统自带的 WebKitGTK 引擎，而非捆绑自己的浏览器运行时。

这带来了三个层面的问题：

**（1）版本碎片化**
不同 Linux 发行版自带的 WebKitGTK 版本差异巨大。Ubuntu 22.04 可能用着 WebKitGTK 4.1，而 Fedora 40 可能还在用 4.0。API 细微的差异足以让同一个功能在两个发行版上表现截然不同。

**（2）Wayland 兼容性问题**
现代 Linux 桌面正在向 Wayland 过渡，但 WebKitGTK 在 Wayland 下的输入法支持、硬件加速等仍存在已知问题。

**（3）真实存在的布局差异**
同一个 CSS flexbox 布局，在 macOS 的 WKWebView、Windows 的 WebView2 和 Linux 的 WebKitGTK 下渲染结果可能不一致。Boudra 坦言："你花了两天调试一个居中问题，结果发现它只在 Ubuntu 上出现。"

### 3.3 问题二：通知系统：看似简单，实则坑深

桌面通知是一个看似微不足道、却极其考验平台适配能力的功能。

Paseo 需要支持：**点击通知 → 聚焦应用窗口 → 跳转到相关任务**。

这要求精确处理：

- 通知的点击事件捕获
- 应用窗口的激活与焦点管理
- 跨平台行为一致性

Tauri 的通知插件提供了基础能力，但**不支持桌面通知的点击处理**。Boudra 尝试了多个 Rust crates——没有任何一个能可靠地在所有目标平台上提供完整的通知交互能力。

最终，他被迫为每个平台写**平台特定的原生通知处理代码**。这对于一个追求跨平台一致性的项目来说，是一个巨大的讽刺——为了解决跨平台问题，引入了更多跨平台问题。

### 3.4 问题三：Daemon 复杂度：Tauri Sidecar 的真实代价

Paseo 的核心是一个 Node.js daemon。这在 Electron 生态里几乎是天然的选择——Node.js 随 Electron 预装，无需额外配置。

但 Tauri 的方案是 **Sidecar**（边车）模式：

- Sidecar 是一个**独立编译的二进制文件**，针对特定平台和目标三元组（target triple）编译
- 需要处理：跨平台打包、文件路径解析、进程启动参数、权限配置、版本升级
- 每次新增一个目标平台，都意味着 sidecar 的编译矩阵扩大一倍

Boudra 的评价一针见血：**"我发现自己其实是在'用 Rust 重新实现一个 Electron 环境'——而且还不如 Electron 成熟。"**

### 3.5 迁移过程：痛苦但出乎意料地快

决定迁移之后，团队用了一周时间完成了从 Tauri 到 Electron 的切换。

Boudra 特别提到，这个过程虽然需要大量重写，但**比预期快得多**，原因在于：

1. **应用逻辑完全不需要改变**：所有的业务代码都在 JavaScript/TypeScript 层，迁移不影响这些
2. **Electron 工具链更成熟**：调试工具、热重载、生态插件都比 Tauri 丰富很多
3. **跨平台一致性让 QA 成本骤降**：不需要再为每个发行版单独调试

迁移完成后的体验改善是全方位的：

- **跨平台 UI 表现一致**，不再有"Ubuntu 上那个按钮歪了"的问题
- **通知功能正常工作**，包括点击处理
- **daemon 管理大幅简化**，Node.js 运行时直接由 Electron 进程管理
- **整体感觉更轻快**，这可能是最令人意外的发现

### 3.6 迁移后的反思：Tauri 并不差，只是不适合

Boudra 在博文结尾特别强调：Tauri 本身并不是一个糟糕的选择——它对于某些场景确实非常出色。他的失误在于**没有客观评估场景需求**，而是凭"感觉"选择了 Tauri。

> "我做了这个选择，是因为我喜欢 Rust，或者因为 Tauri 在 HN 上有很多热度。但我没有真正问自己：我的应用场景到底是什么？"

这个反思比任何技术细节都更有价值。

---

## 4. 设计哲学：从 Paseo 提炼出的工程方法论

### 4.1 技术选型要回答的三个问题

Paseo 的迁移经历告诉我们，技术选型不能只问"这个技术好不好"，而要问：

**① 我的实际场景是什么？**
Paseo 是一个多智能体编排平台，需要：
- 稳定的跨平台 webview 渲染（三个平台都要完美一致）
- Node.js runtime（daemon 本质是 Node.js 应用）
- 复杂的通知和窗口管理

这些都是 Electron 的**核心能力**，而不是附加功能。对于这些需求，Electron 不是"凑合用"，而是"天生适配"。

**② 我的约束边界在哪里？**
如果应用二进制体积是硬性约束（比如必须小于 10MB），Tauri 可能是必选项。但如果只是"希望体积小一点"，就需要权衡为此付出的工程复杂度。

**③ 我能接受的维护成本是多少？**
Tauri 的 sidecar 模式、生态不成熟度、plugin 质量参差不齐——这些都是隐形的维护成本。Boudra 最终意识到，他在 Tauri 上花的额外精力，本质上是在"自己造轮子"来弥补 Tauri 的生态缺口。

### 4.2 本地优先不等于简单

Paseo 选择了本地 daemon 架构，这意味着必须自己处理：

- 进程生命周期管理
- WebSocket 长连接维护
- 跨平台路径和权限处理

这显然比"把代码扔给第三方 API"复杂得多。但 Boudra 选择了这条更难的路，因为**隐私和数据主权是不可妥协的**。

这体现了一种工程哲学：**有时候，更复杂的技术实现，是对更重要价值的守护。**

### 4.3 跨平台一致性是核心竞争力，而非装饰品

很多框架都宣称"跨平台"，但真正能做到 UI 一致、功能一致、体验一致的少之又少。Paseo 在迁移过程中花大量时间解决 WebKitGTK 差异问题，恰恰说明了——**跨平台的一致性不是自然而然发生的，而是需要刻意投入的**。

桌面应用开发者在选择框架时，应该把"目标平台的 webview 差异"列为必考项，而不是想当然地以为"写一次，到处跑"。

---

## 5. Paseo 实战教程

### 5.1 安装 Paseo

#### 方式一：桌面应用（推荐新手）

访问 [paseo.sh/download](https://paseo.sh/download)，下载对应平台的安装包。

#### 方式二：CLI 工具

```bash
# 全局安装 CLI
npm install -g @getpaseo/cli

# 验证安装
paseo --version

# 启动 daemon
paseo daemon start

# 连接第一个智能体
paseo connect --agent claude-code
```

#### 方式三：Docker 部署（适合服务器或无头环境）

```bash
docker run -d --name paseo \
  --restart unless-stopped \
  -p 6767:6767 \
  -e PASEO_PASSWORD=your-secure-password \
  -v "$PWD/paseo-home:/home/paseo" \
  -v "$PWD:/workspace" \
  ghcr.io/getpaseo/paseo:latest
```

> ⚠️ **安全提示**：务必修改 `PASEO_PASSWORD`，默认密码在生产环境中极不安全。

### 5.2 桌面端使用指南

安装完成后：

1. 打开 Paseo 桌面应用
2. 首次使用需要设置 daemon 连接密码
3. 连接你的第一个智能体 Provider（Claude Code / Copilot / Codex 等）
4. 在统一的界面中创建任务、监控进度、切换智能体

Paseo 支持**语音输入模式**，点击界面中的麦克风图标，可以直接用语音描述任务，特别适合在通勤或双手不便时使用。

### 5.3 移动端使用

Paseo 同时支持 iOS 和 Android，通过 Expo 构建。下载对应 App，扫描桌面端的配对二维码，即可远程连接本地 daemon，实现跨设备任务管理。

### 5.4 进阶：使用 Paseo Skills

Paseo 内置了三个强大的内置 Skill，用于多智能体协作：

#### `/paseo-handoff` — 智能体交接

当一个智能体完成部分工作后，将上下文完整移交给另一个智能体继续处理：

```
/paseo-handoff --from claude-code --to opencode --reason "需要更强的代码重构能力"
```

#### `/paseo-advisor` — 顾问智能体

引入一个专注于"审查和建议"的 advisor 智能体，在不干扰主智能体工作流的情况下，提供实时反馈：

```
/paseo-advisor enable --mode realtime
```

#### `/paseo-committee` — 多智能体委员会

将多个智能体组成委员会，通过投票或共识机制做决策：

```
/paseo-committee create --agents claude-code,copilot,opencode --task "架构评审"
```

### 5.5 TypeScript SDK 进阶示例

构建一个自动化代码审查流水线：

```typescript
import { createClient } from '@getpaseo/client';

async function automatedCodeReview() {
  const client = createClient({
    password: process.env.PASEO_PASSWORD!,
    host: process.env.PASEO_HOST || 'localhost',
    port: 6767,
  });

  // 监听智能体输出流
  client.on('agent:output', (event) => {
    console.log(`[${event.agentId}] ${event.type}: ${event.content}`);
  });

  // 启动代码审查任务
  const task = await client.sendTask({
    agentId: 'claude-code',
    prompt: `
      请对 /workspace 目录下的所有 TypeScript 文件进行代码审查：
      1. 检查类型安全性
      2. 识别潜在的空指针异常
      3. 提出重构建议
      输出格式：JSON
    `,
    options: {
      timeout: 300000, // 5分钟超时
      stream: true,
    },
  });

  console.log(`任务已提交，ID: ${task.id}`);
}

automatedCodeReview().catch(console.error);
```

---

## 6. 总结：框架没有最好，只有最合适

Paseo 的故事，最打动人心的不是技术本身，而是一个创始人**敢于承认错误、公开复盘**的坦诚态度。

Boudra 没有把锅甩给 Tauri，也没有事后诸葛亮地说"我早知道 Electron 更好"。他诚实地承认：**他是被技术本身的魅力（Rust、性能、小体积）所吸引，而不是被实际需求所驱动。**

这恰恰是技术选型中最常见的陷阱——**我们不是因为某个框架"更好"而选择它，而是因为它让我们感觉"更好"而选择它。**

关于 Tauri vs Electron 的争论，Paseo 给出了一个相当有说服力的答案：

- **Tauri 适合**：对包体积有严格限制、UI 交互简单、不需要复杂原生集成的工具类应用
- **Electron 适合**：需要稳定跨平台 UI 表现、依赖 Node.js 生态、有复杂原生系统集成需求的应用

而一个优秀的工程师，应该根据**业务需求**而非**技术偏好**来回答这个问题。

---

**相关链接**

- Paseo 官网：[https://paseo.sh](https://paseo.sh)
- GitHub：[https://github.com/getpaseo/paseo](https://github.com/getpaseo/paseo)
- 官方文档：[https://docs.paseo.sh](https://docs.paseo.sh)
- Mo Boudra 博客原文：[https://moboudra.com](https://moboudra.com)

---

*首发于微信公众号「比特财商」。*
