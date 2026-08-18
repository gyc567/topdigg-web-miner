# Awesome LLM Apps：100+ 开源 AI Agent 集合，覆盖从入门到生产级全场景

**作者：比特财商**

---

当整个行业还在争论"Agent 是不是噱头"的时候，有人已经把 100 多个真实可运行的 AI Agent 全部开源了。

**Awesome LLM Apps** 是由 AI 开发者 Shubhamsaboo 创建和维护的开源项目，收录了超过 100 个经过端到端测试的 AI Agent、Agent Skills 和 RAG 应用。全部采用 Apache 2.0 许可证，可以直接克隆使用、修改、甚至商业化。

GitHub 地址：[github.com/Shubhamsaboo/awesome-llm-apps](https://github.com/Shubhamsaboo/awesome-llm-apps)

---

## 一、项目概述

这是一个按场景分类的开源 AI Agent 大全。项目核心特点：

- **100+ 真实可运行的 Agent**，不是 Demo，不是 PPT，每个都有完整代码
- **Apache 2.0 许可证**，可商用，无版权风险
- **多模型兼容**：Claude、Gemini、GPT、DeepSeek、Llama、Qwen 等全部支持
- **端到端测试**：每个模板都经过 CI 安全和评估门禁验证
- **Skill 化安装**：一行命令给 Claude Code、Cursor 等编程助手添加新能力

项目维护者还运营 [Unwind AI](https://www.theunwindai.com)，每周发布新的教程和模板。

---

## 二、项目分类体系

项目按功能场景分为 10 大类别：

| 类别 | 数量 | 代表应用 |
|---|---|---|
| Agent Skills（给 AI 编程助手的技能） | 6+ | Project Graveyard、Scope Creep Detector |
| Starter AI Agents（入门级单文件 Agent） | 12+ | AI Travel Agent、AI Data Analysis Agent |
| Advanced AI Agents（生产级 Agent） | 20+ | AI VC Due Diligence、AI Deep Research |
| Multi-Agent Teams（多 Agent 协作） | 15+ | AI Legal Agent Team、AI Teaching Agent Team |
| Always-on Agents（常驻后台 Agent） | 2+ | HN Briefing Agent、Release Radar Agent |
| Voice AI Agents（语音 Agent） | 5+ | Insurance Claim Live Agent Team |
| Generative UI（生成式界面） | 7+ | AI Dashboard Canvas Agent |
| MCP AI Agents（MCP 协议 Agent） | 7+ | Browser MCP Agent、GitHub MCP Agent |
| RAG（检索增强生成） | 20+ | Agentic RAG、Corrective RAG、Knowledge Graph RAG |
| Autonomous Game-Playing（游戏 Agent） | 3+ | AI 3D Pygame Agent、AI Chess Agent |

---

## 三、核心设计理念

### 1. Skill 化：把能力装进 AI 编程助手

最有意思的设计是 **Agent Skills**——不是完整的应用，而是给 Claude Code、Cursor、Codex 这类 AI 编程助手安装的"技能包"。

```bash
# 给编程助手安装一个技能，10 秒搞定
npx skills add https://github.com/Shubhamsaboo/awesome-llm-apps/tree/main/agent_skills/project-graveyard
```

安装完之后，直接用自然语言调用：
- *"为什么我永远完不成副业项目？"*
- *"这个 PR 是不是范围蔓延了？"*
- *"这个文件当初为什么要这样写？"*

**Project Graveyard** 能找到你所有放弃的副业项目，分析每个项目"死掉"的原因，并帮助你决定哪个值得捡起来。**Scope Creep Detector** 会检查 PR diff 是否超出了原本的需求范围。**Commit Archaeologist** 能从 Git 历史中还原一个文件为什么被写成这样。

这是把专业能力注入日常开发流的最佳方式。

### 2. 单文件 Starter：30 秒跑起来

每个 Starter Agent 都是单文件实现，只需要一个 API Key 就能运行：

```bash
git clone https://github.com/Shubhamsaboo/awesome-llm-apps.git
cd awesome-llm-apps/starter_ai_agents/ai_travel_agent
pip install -r requirements.txt
streamlit run travel_agent.py
```

从博客转播客、数据分析、医疗影像诊断、音乐生成、旅行规划——入门门槛极低，但覆盖的场景足够真实。

### 3. Multi-Agent Teams：多角色协作

真正复杂的任务需要多个 Agent 配合。项目里有大量多 Agent 协作案例：

**AI Legal Agent Team**：研究、合同分析、策略建议——由一个完整的法律团队 Agent 组成。

**AI Teaching Agent Team**：由多个专业 Agent 组成"虚拟 faculty"，为用户构建完整的学习路径。

**AI Recruitment Agent Team**：从简历筛选到面试安排，全流程自动完成。

**AI Services Agency（CrewAI）**：一个数字机构，接单、评估需求、规划软件项目。

这种架构背后的思想是：**每个 Agent 专精一项，多个 Agent 通过消息传递协作完成复杂任务**——这正是 Garry Tan 说的"Fat Skills, Thin Harness"在多 Agent 场景的最佳实践。

### 4. RAG 全家桶：从基础到生产级

RAG 相关项目是整个仓库里最丰富的部分，涵盖了几乎所有主流 RAG 变体：

**基础 RAG**
- Basic RAG Chain：最小化检索管道
- Agentic RAG：带 Agent 推理的检索
- Autonomous RAG：GPT-4o 回答 PDF，支持 Web 搜索兜底

**高级 RAG**
- Corrective RAG（CRAG）：检索质量自评分，失败时自动重试
- Contextual AI RAG：分钟级从数据存储到 grounded 聊天
- Agentic RAG with Reasoning：逐步推理展示
- Hybrid Search RAG：关键词 + 向量搜索结合

**专业化 RAG**
- Multimodal Agentic RAG：文本、PDF、图片、音频、视频统一处理
- Knowledge Graph RAG：多跳问答，答案可验证来源
- Vision RAG：图片和 PDF 页面问答
- Typed Agentic RAG：Pydantic AI 验证输出格式

**本地化 RAG**
- Llama 3.1 Local RAG：完全离线运行
- Deepseek Local RAG：本地 DeepSeek 推理
- Local RAG Agent：Llama 3.2 + Qdrant，无需 API Key

这个 RAG 部分几乎可以当作学习 RAG 架构的完整课程来用。

### 5. MCP：连接 AI 与真实世界

MCP（Model Context Protocol）相关 Agent 让 AI 能够操作真实工具和数据：

- **Browser MCP Agent**：用自然语言控制真实浏览器
- **GitHub MCP Agent**：用自然语言探索和分析任意 GitHub 仓库
- **Notion MCP Agent**：从终端对话 Notion 页面
- **AI Travel Planner MCP Agent**：基于真实 Airbnb 和 Google Maps 数据规划行程
- **Multi-MCP Agent Router**：每个 Specialist Agent 接入自己的 MCP 服务器

---

## 四、精选案例详解

### 案例 1：Always-on HN Briefing Agent

这是一个常驻后台的 Agent，按照设定的时间表运行，自动监控 Hacker News，识别需要关注的技术信号，生成每日简报推送到 Slack 或邮件。

核心价值：**在你睡觉的时候，AI 帮你读完整个互联网的技术新闻**，筛选出真正重要的信号。

```bash
# 安装
npx skills add https://github.com/Shubhamsaboo/awesome-llm-apps/tree/main/always_on_agents/always_on_hn_briefing_agent
```

### 案例 2：AI VC Due Diligence Agent Team

多 Agent 团队对初创公司进行投资尽职调查：

- 一个 Agent 负责财务分析
- 一个 Agent 负责市场研究
- 一个 Agent 负责竞争格局
- 一个 Agent 负责创始团队评估

最终汇总成一份结构化的投资评估报告，全程自动完成。

### 案例 3：Insurance Claim Live Agent Team

语音驱动的保险理赔 Agent，使用 Gemini Live 进行实时语音对话：

- 用户打电话描述事故经过
- Agent 实时语音受理理赔
- 同时调用多个工具验证信息
- 全程语音交互，无需手动输入

这是 Voice AI 在保险行业的落地案例。

### 案例 4：AI Self-Evolving Agent

真正体现"Agent 可以自我进化"的项目——Agent 使用 EvoAgentX 框架，能够根据运行结果自动重写自己的 workflow，不断优化执行策略。

这是对 Garry Tan"技能自我改进"理念的完整实现。

---

## 五、快速入门教程

### 方式一：给 AI 编程助手安装技能（最快）

```bash
# 安装 Project Graveyard（分析死掉的副业项目）
npx skills add https://github.com/Shubhamsaboo/awesome-llm-apps/tree/main/agent_skills/project-graveyard

# 安装后直接用自然语言调用
# "为什么我永远完不成副业项目？"
```

### 方式二：克隆运行单个 Starter Agent

```bash
# 克隆整个仓库
git clone https://github.com/Shubhamsaboo/awesome-llm-apps.git
cd awesome-llm-apps/starter_ai_agents/ai_data_analysis_agent

# 安装依赖
pip install -r requirements.txt

# 设置 API Key
export OPENAI_API_KEY="your-key"

# 运行
streamlit run data_analysis_agent.py
```

### 方式三：运行 RAG 示例

```bash
cd awesome-llm-apps/rag_tutorials/agentic_rag_embedding_gemma

# 完全本地运行，使用 Llama 3.2 + EmbeddingGemma
pip install -r requirements.txt
python agentic_rag.py
```

### 方式四：在 Claude Code 中使用

```bash
# 在 Claude Code 环境下
npx skills add https://github.com/Shubhamsaboo/awesome-llm-apps/tree/main/agent_skills/commit-archaeologist

# 然后直接问：
# "为什么 app.py 里那个函数要这样写？"
```

---

## 六、观点与总结

### 1. 这代表了 AI 应用开发的"平民化"方向

100 个真实可运行的 Agent，意味着任何有基础 Python 能力的开发者都可以直接克隆、修改、商用。这打破了 AI 应用开发的技术壁垒。

### 2. Skill 化设计是 AI Agent 最实用的落地形态

与其做一个独立的应用，不如做一个可以被其他 AI 系统调用的 Skill。这与 Garry Tan"Fat Skills, Thin Harness"的思想完全一致——把智能推到 Skill 层，让底层的 Harness 保持轻薄。

### 3. RAG 全家桶是学习和生产的好工具

从最基础的 RAG Chain 到复杂的 Knowledge Graph RAG，涵盖了几乎所有主流变体。这既是学习 RAG 架构的绝佳教材，也是可以直接用于生产的参考实现。

### 4. Multi-Agent 是复杂任务的必然选择

单个 Agent 受限于上下文窗口和能力边界。多个专精 Agent 协作是完成复杂任务的唯一可行路径。项目里有 15+ 个多 Agent 协作案例，覆盖法律、金融、教育、房产等多个行业。

### 5. 开源是护城河

全部 Apache 2.0 许可证，可以商用、修改、分发。这让项目本身成为了 AI 应用开发者的"首选资源库"，形成了强大的社区护城河。

---

## 快速参考

| 项目信息 | 说明 |
|---|---|
| GitHub | github.com/Shubhamsaboo/awesome-llm-apps |
| 许可证 | Apache 2.0 |
| Agent 数量 | 100+ |
| 支持模型 | Claude, Gemini, GPT, DeepSeek, Llama, Qwen 等 |
| 主要框架 | LangGraph, CrewAI, OpenAI Agents SDK, AutoGen |
| 安装命令 | `git clone` 或 `npx skills add` |
| 文档站 | theunwindai.com |

---

以上，既然看到这里了，如果觉得不错，随手点个赞、在看、转发三连吧，如果想第一时间收到推送，也可以给我个星标，多谢你看我的文章，我们，下次再见。

首发于微信公众号「比特财商」。
