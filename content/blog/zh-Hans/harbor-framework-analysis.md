---
title: "Harbor Framework 深度解析：给 AI 造一个「考试院」— 从 Turing-Bench 到 Harbor 的进化之路"
description: "全面解析 Harbor Framework（laude-institute 出品）：一套让 AI Agent 在『容器考场』里被公平测评、深度阅读原文你都能听懂的开源框架。本文用小学生也能懂的比喻讲清 Terminal-Bench 2.0 官方评测工具 Harbor 的核心概念（任务/数据集/Agent/Trial/Job）、提供了详细安装与运行教程（含 Docker 本地跑 + Daytona 云端 32 并发）、归纳六大设计哲学（模块化接口、云沙箱横向扩展、评测数据管道一体化、默认 Linux、防作弊、RewardKit 轻量验证），并总结『评测即基础设施』『先跑通最小端到端』等核心观点，附带 LLM-as-a-Judge 与 MCP 侧车任务两个真实教程的要点。"
date: "2026-08-09"
author: "TopDigg Research Team"
tags: ["Harbor", "Terminal-Bench", "AI Agent", "Benchmark", "LLM", "Evaluation", "Agent Framework", "Terminal-Bench 2.0", "Claude Code", "Daytona", "RewardKit", "MCP", "Docker", "Machine Learning"]
categories: ["深度解析"]
keywords: ["Harbor Framework", "Terminal-Bench 2.0", "AI Agent 评测", "基准测试", "LLM eval", "容器化任务", "Daytona 云沙盒", "RewardKit", "LLM-as-a-Judge", "Agent 训练", "SFT", "RL", "提示词优化", "Turing Bench", "Claude Code 评测"]
---

# Harbor Framework 深度解析：给 AI 造一个「考试院」—— 从 Terminal-Bench 到 Agent 评测的完整之路

> **核心思想：** AI 也会有"毕业考试"。Harbor 就是给 AI Agent 造的一间"考试院"——把每个任务变成一张考卷（容器环境 + 指令 + 自动判卷），让不同厂商的 AI Agent（Claude Code、Codex、Gemini CLI……）在同一考场里公平比分数，用分数决定谁更像"真会干活的人"。它还把 Terminal-Bench 2.0（终端操作基准）变成了官方考场，让"AI 会不会用终端"第一次有了科学的、可复现的、可横向扩展的度量衡。

---

## 一、这是什么？（小学生都能懂版）

想象你有一群 AI 小朋友，他们都想当"程序员助理"。

- 有的会用电脑键盘刷刷打字；
- 有的会看教程；
- 有的会把文件打开、改一改、再保存。

但问题来了：**你怎么知道谁真的会干活？**

如果你只是问他们："你会不会？"——每个 AI 都会拍胸脯说"会！"。就像考试前问小朋友"你复习好了吗"，谁都会说"复习好了"。

**Harbor 就是那个"出考卷的老师"。**

它干三件事：

1. **出卷子**：把一条真实工作指令（比如"在这个文件夹里找到 bug 并修复它"）装进一个独立的"小房间"（容器）里，房间里配好电脑、工具、资料。
2. **监考**：让 AI Agent 进房间干活，它在一边看着，把 AI 每一步操作都记录下来（这就是"trajectory"，考试轨迹）。
3. **判分**：有专门的"评分老师"（verifier）检查房间里的结果 — AI 改对文件、装对软件、写对了测试，就记 1 分，否则 0 分；还可以打出细腻的分（比如"幽默感 0.75 分"）。

考完一个 AI，再考下一个，谁分高谁就是更棒的"实习生"。

这套系统不但能"考试打分"，还能干三件大事：

- **挑人才**：比较好几个 AI 谁强（benchmark 排行榜）；
- **练人才**：把高分的考试轨迹收集起来，训练 AI 变得更强（SFT / RL 强化学习）；
- **抓毛病**：你的 AI 老在某个环节犯错？用评测找到它到底在哪个步骤弱，再用数据优化它的提示词（prompt optimization）。

所以 Harbor 的名字很贴切：**海港（harbor）** — 所有 AI 的"智力轮船"都到这里来靠岸、检修、再出发。

---

## 二、项目说明

### 2.1 基本信息

- **项目名称**：Harbor
- **作者/维护者**：laude-institute（Anthropic 的研究机构，也是 Terminal-Bench 的原版团队之一）
- **开源地址**：[https://github.com/laude-institute/harbor](https://github.com/laude-institute/harbor)
- **官方文档**：https://www.harborframework.com
- **许可证**：MIT
- **安装方式**：pip / uv 一键安装，零配置跑第一个评测
- **技术栈**：Python（CLI + 接口）、Docker（本地容器环境）、cloud sandbox（Daytona / Modal / E2B / Runloop 等）
- **定位**：AI Agent 的评测、后训练（post-training）与提示词优化的统一框架

### 2.2 它要解决什么问题？

Harbor 的官方文档在 *Motivation* 部分说的很明白：**2025 年 5 月 Terminal-Bench 发布后，作者发现大家用它干的事超出了想象**——有人拿它做自定义评测、有人用它优化提示词、有人在跑 RL（强化学习）、有人在生成 SFT（监督微调）训练轨迹，还有人把它接进 CI/CD 做 Agent 回归测试。

与此同时，作者也痛苦地发现：**"定义和管理容器化的任务"在规模上很难。** 于是他们干脆把 Terminal-Bench 背后那套评测引擎拿出来，重构成一个通用的"评测框架"——这就是 Harbor。

所以 Harbor 不是一个新的"任务集"，而是**造考场的方法论**：你可以用它跑现成榜单（Terminal-Bench、SWE-Bench Verified），也可以定义自己的任务、自己的环境、自己的 Agent。

### 2.3 六个核心概念（全部用大白话）

用一个「考试院」比喻讲透 Harbor 的全部概念：

- **任务（Task）= 一张考卷**：一段指令 + 一个专属小房间（容器环境）+ 一道自动判分题（测试脚本）
- **数据集（Dataset）= 一沓考卷**：一堆 Task 的总和，通常等于一个基准（比如 Terminal-Bench 2.0）
- **Agent = 考生**：一个会复活的 AI 程序。Harbor 开箱内置 99 个主流考生——Claude Code、Codex CLI、Copilot CLI、Gemini CLI、Grok Build、OpenHands 等
- **容器环境（Environment）= 考场房间**：装着电脑的“状态”（哪个 OS、装了什么软件、能不能上网）
- **单次尝试（Trial）= 一次答题**：一个 Agent 对一张考卷的一次完整作答，出门一个分数（reward）
- **任务批次（Job）= 一场大考**：一堆 Trial 并行开考（可跨多个数据集、多个 Agent、多个模型）

---

## 三、详细教程：从零开始跑 Terminal-Bench 2.0

### 第一步：装 Harbor（一条命令）

推荐用 `uv`（Python 的快速包管理器）：

```bash
uv tool install harbor
```

装完检查一下：

```bash
harbor --help
```

### 第二步：装 Docker 并启动

本地评测默认用 Docker 当"小房间"。装好 Docker 并确保它在运行。然后就可以跑 Terminal-Bench 2.0 的第一道"验证卷"——跑一遍官方标准答案（Oracle）：

```bash
harbor run -d terminal-bench/terminal-bench-2 -a oracle
```

> **这一步的意义：** 你能跑动 oracle（标准答案解法），就说明 Harbor 安装正确、容器环境就绪。Oracle 是满分卷，跑通它等于考场自检合格。

### 第三步：用真 Agent 跑（本地）

试试用 Claude Code 作为考生，模型选 `anthropic/claude-haiku-4-5`（快且省钱）：

```bash
harbor run \
  -d terminal-bench/terminal-bench-2 \
  -m anthropic/claude-haiku-4-5 \
  -a claude-code
```

这条命令会自动下载数据集、启动容器、让 Claude Code 进考场作答、跑判分，最后输出分数报告。

### 第四步：跑自己的数据集（本地任务文件夹）

不想用官方数据集？把一堆自己的 Task 目录传给 `-p` 就可以：

```bash
harbor run -p "/path/to/dataset" -m "model" -a "agent"
```

### 第五步：云上横向扩展（重要！）

官方给出重要实战建议：**沙盒 Agent 评测通常很慢**（一次评测要几十轮对话，每轮命令都要花时间）。要加速实验，唯一的办法就是横向开更多"考场"。 ——用云端沙箱提供商（比如 Daytona）：

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

`-n 32` 表示同时开 32 个考场并行考试。用 API 模型跑云端沙箱后，限速瓶颈从 CPU 变成网络 I/O，所以并行数可以远超你本机核数——这是官方强烈推荐的做法。

### 第六步：看排行榜 & 提交成绩

- **看排行榜**：https://tbench.ai/leaderboard
- **提交你的成绩**：官方把排行榜日志存放在 [HuggingFace 数据仓库](https://huggingface.co/datasets/alexgshaw/terminal-bench-2-leaderboard)，按它 README 里的说明开一个 PR 提交即可。

---

## 四、进阶教程（深度看的都在这）

### 4.1 自己写「任务」（考卷）

一条任务就是一个目录，用一条命令初始化骨架：

```bash
harbor init --task "org/name"
```

生成的结构像一个规范的卷子：

    task.toml             # 卷子的「个人信息」+ 考生配置
    instruction.md        # 题目（给 AI 的指令）
    environment/          # 考场：Dockerfile 定义系统
    solution/             # 标准答案（可选，Oracle 用）
    tests/                # 判分脚本（test.sh → 产生 reward）

判分时脚本在容器里跑，并把分数写进 `/logs/verifier/reward.txt`（写 `1` 就成功，写 `0` 失败）或 `reward.json`（可同时多个指标，如 `{"runtime_sec": 1.23, "accuracy": 0.95}`）。

**一条对判分的建议**（官方原文精神）：测试脚本里尽量用**绝对路径**，避免相对路径出错。

### 4.2 想考 Linux / Windows / 多容器？

- **系统**：`task.toml` 里 `[environment].os = "linux"`（默认）或 `"windows"`；
- **多容器**（比如旁边挂一个 MCP Server、数据库）：在 `environment/` 放 `docker-compose.yaml`，Harbor 会自动合并。目前多容器只在本地 Docker 环境支持，云沙箱提供商正在开发中。

### 4.3 把你自己写的 Agent 塞进来考

两种类型：

**外部 Agent（跑在电脑上，通过 exec 远程指挥容器）：**

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

**已安装 Agent（像 Claude Code 一样直接装进容器里无头运行）：**

```python
from harbor.agents.installed.base import BaseInstalledAgent

class MyInstalledAgent(BaseInstalledAgent):
    async def install(self, environment):
        await self.exec_as_root(environment, command="apt-get install -y curl")
        await self.exec_as_agent(environment, command="pip install my-agent")

    async def run(self, instruction, environment, context):
        await self.exec_as_agent(environment, command=f"my-agent run '{instruction}'")
```

用你的 Agent 开考：

```bash
harbor run -d "dataset@version" --agent path.to.agent:MyAgent
```

### 4.4 让 AI 当考官（LLM-as-a-Judge 教程）

有的卷子不能靠"文件对不对"判分（比如"写一首搞笑诗"）。Harbor 官方教程教你把法官也换成 LLM：

- 在 `tests/llm_judge.py` 用 Anthropic API（结构化输出）读一手卡片，返回分数；
- 密钥通过 `task.toml` 的 `[verifier.env]` 注入，源码里不留 key；
- 输出 `/logs/verifier/reward.json`，例如 `{ "funny": 0.75 }`，还能多个维度：`{ "creativity": 0.9, "humor": 0.7, "grammar": 1.0 }`。

完整示例在 `examples/tasks/llm-judge-example`，直接复制改就行。

### 4.5 让 MCP Server 当考场旁边的小助手（MCP Server Task 教程）

想模拟"Agent 要跟外部服务交互"的真实业务？用 Docker Compose 加一个"侧车"容器跑 FastMCP Server：

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

在 `task.toml` 里声明 `[[environment.mcp_servers]]`，Claude Code、Codex 这类兼容 Agent 会自动注册并连接它。整条链路（连服务 → 调工具 → 写结果 → pytest 判分）在 `examples/tasks/hello-mcp` 里。

### 4.6 RewardingKit：轻量验证器（判卷工具包）

官方配套了一个**零依赖**的独立包 `harbor-rewardkit`，专门给"判卷"设计 UI ：

```bash
uv tool install harbor-rewardkit
```

- **程序式**：`rk.file_exists("output.txt")`、`rk.command_succeeds("python main.py")` 等 20+ 内置判分标准；
- **判定式（LLM-judge）**：写 TOML 文件让 Claude / GPT 打分（binary / Likert 5 分）；
- **隔离**：担心一个判分标准干扰另一个？用 `isolated=True`（overlayfs 只读挂载）；
- **多维奖励**：`correctness`、`structure`、`quality` 分别出分，再聚合一个总分。

---

## 五、设计哲学（作者为什么把它做成这样）

通读官方文档，可以提炼出 6 条明确的“设计信仰”：

**1. 模块化接口，职责单一。**
Environment / Agent / Task 是三个独立接口，互不假设彼此实现繁杂。容器环境也好、云端也好，只要实现 `BaseEnvironment`，就能插进去当“新房间”。

**2. “默认预置主流”，拒绝从零造轮子。** “这世界上已经有 99% 的任务被现成 Agent 跑过”，Harbor 直接把 Claude Code、Copilot CLI、Codex CLI、Gemini CLI、Grok Build、OpenHands 等主流 CLI Agent 全装进包里，用户开箱即用。

**3. 横向扩展胜于硬件堆料。** 官方反复强调：评测耗时长，唯一能加速的方案是横向铺开 **云沙箱（Daytona / Modal / E2B / Runloop / EC2 / Beam……）**，因为跑 API 模型时瓶颈是 I/O 而不是 CPU。

**4. 评测数据=训练资产（“考卷就是课本来后教学”）。** Harbor 连接 SkyRL、GEPA 等强化学习框架，直接把评测的得分轨迹（trajectories）转成 SFT 微调数据。考试不是为了给 AI 盖个章，而是为了让 AI 学得更好。

**5. 安全与防作弊设进默认。** 判分时借助不同的“考生环境”与“监考环境”（verifier separate），判分代码看不到 agent 所在容器，防 Agent 偷看答案；密钥还用 `${VAR}` 注入，绝不进任务源码。

**6. 用最简结构承载最严谨的评判。** 官网文档反复强调「好任务=简洁结构（instruction.md / task.toml / 容器 / solution / tests）+ 明确判分文件」：建议用绝对路径、给任务版本号、支持多阶段逐步判分。复杂评判不应依赖花哨格式，而应依赖清晰约定——这是「最小实现 + 最大可验证性」的工程美学。

---

## 六、归纳总结：我们的核心观点

汇总反映文档与实践，给出 6 条结论性的观点：

### 观点 1：AI 评测正在变成“基础设施”，不再是“研究工具”

Harbor 的诞生标志着一个趋势：当 Terminal-Bench 被当作训练数据、提示词优化、CI/CD 和 RL 的来源时，**评测变成了整个 AI Agent 开发循环（training → eval → improve）的中枢**。谁掌握了好用的评测框架，谁就掌握了下一次 Agent 能力提升的加速器。

### 观点 2：容器化是 Agent 评测的“安全网”，不是“可选项”

Agent 要真的动手改环境（装包、写文件、起服务），跑在容器里才能：隔离风险、可复现环境、给每个试打独立小房间。Harbor 把"每个任务一个小容器"设为默认，这是**对 Agent 能力的真实测度**的前提。

### 观点 3：云沙箱+并行化是唯一现实加速路线

单个 Agent 评测慢到“不可接受”是常态，而 `-n 32` 这类横向扩展（I/O bound）是官方认证的加速方式。“机器不够"不是借口，预算导向的答案就是云跑步。

### 观点 4：评测判分可以是“多元”的，打分的也可以是 AI

从 `reward.txt` 二进制成绩到 `reward.json` 多维分数，再到 LLM-as-a-Judge、RewardKit 的宽容 TOML 判分——**Harbor 把‘判分’从一道 yes/no 升级为一种可组合的能力**：代码质量、幽默、可用性都能量化。

### 观点 5：“自带 Agent” 与 “自带任务”是两个层级的开放

三层开放：用现成的 Agent 跑现成评分集（零代码）；用接口接自己的 Agent（少许代码）；从头定义自己的任务+环境（完全掌控）。**开放的最高价值在于：任何人都能变成评测的教育者。**

### 观点 6：终端（Terminal）是衡量「AI 能不能干活」的第一考场

Terminal-Bench 2.0 考的不是「会聊天」，而是「在真实终端里的行为」：装包、Debug、改代码、查文档。Harbor 的意义在于把「AI 能不能下地干活」这件原本模糊的事，变成可测量、可比较、可传承的度量衡——这是这个框架存在的最大价值。

---

## 七、给读者的一句话

> **别只会让 AI 聊天，要学会给 AI 打分。** Harbor 的整套设计哲学就是一句话：**把评价变得像开发一样 —— 模块化、可复现、可扩展。** 当你需要挑选模型、优化提示词、训练自己的 Agent 时，先建一个“小考场”，让数据说话，而不是让感觉说话。

---

## 参考资料

- Harbor 官方文档 Getting Started：https://www.harborframework.com/docs/getting-started
- Core Concepts：https://www.harborframework.com/docs/core-concepts
- Motivation：https://www.harborframework.com/docs
- Running Terminal-Bench 官方教程：https://www.harborframework.com/docs/tutorials/running-terminal-bench
- LLM-as-a-Judge 教程：https://www.harborframework.com/docs/tutorials/llm-as-a-judge
- MCP Server Task 教程：https://www.harborframework.com/docs/tutorials/mcp-server-task
- RewardKit 文档：https://www.harborframework.com/docs/rewardkit
- Migrating from Terminal-Bench：https://www.harborframework.com/docs/migration
- Terminal-Bench 官方网站：https://tbench.ai
- Repository：https://github.com/laude-institute/harbor