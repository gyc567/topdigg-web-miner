---
title: "HarnessRouter：一个协议定义未来的 AI Agent 基础设施"
author: 瑞哥观势
source: original
date: 2026-10-10
digest: 在 AI Agent 的世界里，有一个长期被忽视的工程难题：每推出一个新型 Agent 运行时（Ha...
tags:
  - AI Agent
  - UHP
  - HarnessRouter
  - 基础设施
  - 协议标准
---

# HarnessRouter：一个协议定义未来的 AI Agent 基础设施

在 AI Agent 的世界里，有一个长期被忽视的工程难题：每推出一个新型 Agent 运行时（Harness），产品就要重新接入一次。Codex、Claude Code、DeepSeek Harness……每个都有自己独特的驱动方式。你的产品与它们之间的"翻译层"，成了最大的工程负担。

HarnessRouter 和它的核心协议 UHP（Unified Harness Protocol），正是为解决这一问题而生。

---

## 一、它是什么？

**HarnessRouter** 是一个统一接口层，把各种主流 Agent 运行时（Harness）变成即插即用的后端，让你的产品通过一个 API 来驱动它们。

支持的主流 Harness 包括：Codex（OpenAI）、Claude Code（Anthropic）、Hermes、DeepSeek Harness、Gemini CLI、Pi、OpenCode、Cline、Goose、Kimi Code CLI、Aider / OpenHands / Agent Zero……以及更多。

Community Edition（社区版）完全开源，基于 **Apache 2.0** 协议，完全自托管，你用自己的 Provider API Key 驱动，不需要任何云服务账号。

---

## 二、为什么需要 UHP？

这里有一个被大多数开发者忽视的结构性问题：

**Model API 给你的只是一个"回合"（turn）：输入消息，输出 token，你自己运行工具。**

但 **Agent Harness 给的是一个"任务"（task）：输入工作，Agent 自己规划、调用工具、编辑文件、回报结果。**

这两种东西的接口完全不同。问题是：每接入一个 Harness，产品的工程团队都要重新回答这些问题：

- 如何启动一个任务？
- 如何跟踪进度？
- 如何继续一个会话？
- 如何取消任务？
- 如何获取生成的文件？
- 如何理解失败原因？

**今天每个产品都在重复回答这些问题——针对每一个不同的 Harness。**

UHP 把这七个问题**统一回答一次**，然后所有 Harness 都可以用同一个接口被驱动。

---

## 三、核心设计哲学：六大原则

UHP 不仅仅是一个技术规范，它有非常明确的设计哲学：

### 原则 1：客户端不应知道哪个 Harness 在运行

除了明确询问，客户端不应该能区分任务是由哪个 Harness 执行的。不同 Harness 之间的差异被协议完全抽象掉了——切换 Harness 不会破坏产品逻辑。

### 原则 2：进度是一连串事实，而非渲染指令

事件流描述的是"发生了什么"（文本、工具调用、文件），而不是"如何显示"。UI 层可以自由渲染，不被协议束缚。

### 原则 3：一个字段只有一个含义

UHP 在借用 OpenAI Responses API 表面的地方，选择添加字段而非重新定义已有字段的含义。向后兼容是铁律。

### 原则 4：Absent ≠ Empty，Empty ≠ Zero

不知道的值就省略。服务器**绝不发明**占位符、估算值或零。

### 原则 5：失败是一等公民

每个失败都可以用与成功相同的信封来报告，包含机器可读的错误码。客户端永远不需要解析人类语言文本来决定如何处理错误。

### 原则 6：规范、参考实现、测试套件必须同步演进

规范里写了但测试套件没有验证的内容，不是标准，是愿望。未来任何改变都必须让三者同时更新，否则不算数。

---

## 四、架构设计

### 4.1 三个核心角色

- **Client（客户端）**：发起任务的应用程序。它只说 UHP，不需要知道背后是哪个 Harness。
- **Server（服务器）**：实现 UHP 规范的服务。接受任务、管理会话、报告进度和结果。
- **Harness**：完整的 Agent 运行时。UHP 不规定 Harness 本身，只规定如何通过 Server 驱动它。

### 4.2 Community Edition 内部架构

```
Console :3000   ← 唯一对外暴露端口
      │ 同源代理
Gateway :8080   Responses API + Harness 生命周期管理
      │ loopback
Runner  :8081   在会话工作区中运行 harnesses
/data 卷       数据库 · 文件 · 密钥 · 工作区
```

Console 是用户界面和 API 的入口。Gateway 是协议实现。Runner 实际运行 Agent，每个会话有独立的 OS 用户和独立工作区，实现强隔离。

### 4.3 核心对象模型

UHP 定义了 7 种对象：

| 对象 | ID 前缀 | 说明 |
|---|---|---|
| Harness | `chrn_` | 配置好的 Agent 后端 |
| Response | `resp_` | 一次任务执行 |
| Session | `hsess` | 多次 Response 共享的会话链 |
| Container | `cntr_` | 会话的文件命名空间 |
| File | `file_` | 上传的文件或生成的产物 |
| Environment | `henv_` | 项目文件+依赖，构建一次，所有会话只读共享 |
| Memory | `hmem_` | 跨会话持久化的记忆树 |

---

## 五、详细安装教程

### 环境要求

- Docker
- 约 4 GB 磁盘空间
- 一个 Model Provider 的 API Key

**无需注册账号，无捆绑模型，无试用 Key。**

### 第一步：启动容器

```bash
docker run -d --name harnessrouter \
  -p 127.0.0.1:3000:3000 \
  -v harnessrouter:/data \
  harnessrouter/harnessrouter
```

**不要加 `--user` 参数。** 容器必须以 root 启动以管理会话用户，但 Console/Gateway 以非特权用户运行。

### 第二步：等待首次启动完成

```bash
docker logs -f harnessrouter
```

首次启动会自动安装所有 Harness CLI（约 700 MB）。等待出现：

```
[harnessrouter] ready on :3000
```

### 第三步：打开 Console 并登录

打开 http://localhost:3000 ，使用默认凭证：

| 用户名 | 密码 |
|---|---|
| `harnessrouter` | `harnessrouter` |

⚠️ **登录后立即去 Profile 页面修改默认密码。**

### 第四步：连接 Model Provider

1. 侧边栏打开 **Bring Your Own Key**
2. 点击 **Add Integration**
3. 选择 Provider（Anthropic / OpenAI / OpenRouter / Google / Azure / 自定义）
4. 填入 API Key 并命名，保存

### 第五步：运行第一个任务

1. 侧边栏打开 **Agent harnesses**
2. 选择一个 Harness，点击 **New task**
3. 选择模型，输入任务描述
4. 观察实时流式输出

---

## 六、通过 API 接入产品

### 创建 API Key

在 Console 侧边栏 **API Keys** 页面创建。

### 调用 API

```bash
export HARNESSROUTER_BASE_URL=http://localhost:3000/api/harness

curl --fail-with-body -sS "$HARNESSROUTER_BASE_URL/v1/responses" \
  -H "Authorization: Bearer ${HARNESSROUTER_API_KEY:?}" \
  -H 'content-type: application/json' \
  -d '{
    "input": "Summarise README.md in three bullets.",
    "metadata": {"harness_id": "chrn_…"},
    "model": "claude-sonnet-4.6",
    "stream": true
  }'
```

### 会话续接

```json
{
  "input": "Now add tests for those three points.",
  "previous_response_id": "resp_a1b2c3",
  "model": "claude-sonnet-4.6",
  "metadata": {"harness_id": "chrn_…"}
}
```

---

## 七、Configured Harness：配置即行为

UHP 中最重要的抽象：**Configured Harness**。

这不仅仅是选一个"base"，而是 base + 配置：
- 默认模型
- 系统提示词
- 可用工具列表
- MCP 服务器
- Skills（技能包）
- 插件
- 最大步数限制
- 超时时间

配置好的 Harness 是**可寻址的对象**，用 `chrn_` 开头的 ID 标识。产品可以通过配置变更改变 Agent 行为，而无需重新部署后端代码。

---

## 八、UHP 协议合规性

| 等级 | 要求 |
|---|---|
| **Core** | 能力发现、任务执行、会话续接、取消、错误模型 |
| **Extended** | Core + 文件上传/下载、产物检索、会话列表/查看 |
| **Full** | Extended + Harness 生命周期管理、会话共享 |
| **Plugins** | Plugins 能力（可选插件系统） |

HarnessRouter Community Edition 已通过 **Full 级别全部 64 项测试**。

---

## 九、安全设计亮点

### 范围隔离

服务器**必须**将每个对象限定在创建者的范围内。返回 `404` 而不是 `403`，ID 的存在本身也不会被泄露。

### 凭证不进入 Agent 工作区

Model Provider 的 API Key 存在于 Gateway 层，Agent 进程运行在独立的会话用户下，**不持有任何 Provider 凭证**。

### Vault 引用与脱敏

通过 `vault:name` 注入的密钥值，会在所有离开沙箱的输出中被**脱敏**——包括 Response、流式事件、trace 和存储记录。

### 请求级工具附加是越权

**收窄是安全的，扩大是越权。** 如果请求可以附加 MCP 服务器，任何持有 API Key 的人都可以让 Agent 指向任意端点。

---

## 十、归纳总结

### 观点 1：协议先于实现

规范、参考实现、测试套件**三者同步演进**，是 AI 基础设施领域少有的"协议驱动"思路。

### 观点 2：开放标准降低锁定风险

UHP 是 Apache 2.0 的开放标准，任何人都可以实现自己的 UHP Server，并通过官方 conformance suite 验证合规性。

### 观点 3：Harness 是可插拔的，但配置不是

Harness 的 Base 不能切换，但**配置（Harness 对象）是可移植的**。本地配置的 Agent 后端可以一键上传到 HarnessRouter Cloud。

### 观点 4：自托管是差异化选择

Community Edition 提供真正自包含的方案：无控制平面、无数据库外联、无遥测上报。所有状态在一个 Docker Volume 里。

### 观点 5：设计哲学的务实平衡

六条设计原则有直接的工程后果，不是学术宣誓。"客户端不应知道哪个 Harness 在运行"意味着接口抽象的严谨性；"失败是一等公民"意味着错误处理的完整性。

---

## 适合谁用？

| 场景 | 适合程度 |
|---|---|
| 需要同时接入多个 Agent 运行时 | ⭐⭐⭐⭐⭐ 极致适合 |
| 想要统一管理 Agent 后端的企业 | ⭐⭐⭐⭐⭐ |
| 自托管 AI 基础设施，数据敏感 | ⭐⭐⭐⭐⭐ |
| 想快速切换不同模型/Agent 的团队 | ⭐⭐⭐⭐ |
| 只需要一个 Model API（turn-level） | ❌ 不适合 |
| 没有 Docker 运维能力 | ⚠️ 有一定门槛 |

---

**参考资料：**

- 项目地址：https://github.com/HarnessRouter/harnessrouter
- UHP 规范：https://unifiedharnessprotocol.org
- Docker 镜像：https://hub.docker.com/r/harnessrouter/harnessrouter
- 官方文档：https://harnessrouter.ai/docs
