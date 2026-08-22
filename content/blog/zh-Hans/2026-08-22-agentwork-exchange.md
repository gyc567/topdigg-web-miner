---
title: "AgentWork Exchange：让个人AI Agent成为可采购、可认证、可结算的数字劳动力"
date: 2026-08-22
description: "深入分析AgentWork Exchange开源项目，解读其设计哲学、核心概念、工作流程，并提供详细接入教程"
tags: ["AI Agent", "AgentWork", "开源项目", "数字劳动力", "认证体系"]
categories: ["AI技术", "产品分析"]
---

# AgentWork Exchange：让个人AI Agent成为可采购、可认证、可结算的数字劳动力

## 前言：个人AI Agent的"孤岛困境"

2025年以来，以Codex、Claude Code、OpenClaw为代表的个人AI Agent蓬勃发展。这些Agent运行在个人或团队的机器上，已经具备相当强大的任务执行能力——Bug修复、代码迁移、技术文档编写、市场研究、数据清洗……几乎可以承担一半以上的标准化知识工作。

但问题也随之而来：**这些Agent被困在各自的"孤岛"上，无法成为企业可调度的外部生产力。**

企业面临一连串的灵魂拷问：

- 这个Agent能做什么？谁能负责？
- 它遵循什么样的风险边界？
- 它是否通过可验证的认证测试？
- 任务交付后，谁来审查、验收和结算？

这些问题不解决，个人AI Agent再强，也只能是少数技术极客的"玩具"，无法真正进入企业采购清单。

**AgentWork Exchange** 正是为解决这个问题而生。它是一个开源MVP项目，目标是把分散在个人和团队手中的AI Agent，统一认证成企业可采购、可调度、可审计、可结算的数字生产力单元。

---

## 一、项目概述：它到底是什么？

AgentWork Exchange（GitHub: `earthwalking/agentwork-exchange`）是一个**经过认证的个人Agent劳动力市场**开源实现。

它的核心思路是：把一个AI Agent与它的Owner（责任人）、工作流边界、认证记录和交付历史打包成一个完整的"劳动力单元"，企业可以像采购外包服务一样发布任务、匹配Agent、验收结果、支付费用。

项目特点：

- **完全开源**：MIT协议，可以自由使用和二次开发
- **产品化MVP**：不是白皮书，是一个可运行的最小化产品
- **隐私优先**：本地Agent连接器不扫描全盘、不读取配置内容、不自动上传数据
- **人审安全边界**：高风险操作默认要求企业人工审核

### 支持的Agent框架

目前MVP已支持以下主流框架的识别和接入：

- Codex（OpenAI）
- Claude Code（Anthropic）
- Hermes
- OpenClaw
- LangGraph
- CrewAI
- 自定义Agent

---

## 二、核心概念：理解AgentWork的四大支柱

### 2.1 Agent Passport——Agent的"数字身份档案"

每个接入平台的Agent都会获得一个**Agent Passport**，相当于Agent的身份证和履历本。

Passport包含以下核心信息：

- **基本信息**：Agent名称、版本、所属框架
- **技能列表**：Bug修复、测试生成、技术文档等具体能力
- **工具链**：GitHub、Playwright、Docker Sandbox等已集成的工具
- **协作模式**：例如"Owner定义任务目标，Agent生成补丁，Owner审核输出"
- **风险边界**：明确Agent不被允许执行的操作，如"禁止接触生产环境密钥"
- **认证等级**：L0-L5，代表不同的能力验证级别
- **交付历史**：过往任务的验收记录和评分

### 2.2 Certification——让能力可验证

认证体系采用L0-L5分级：

| 等级 | 含义 | 说明 |
|------|------|------|
| L0 | 基础声明 | Owner自行声明的技能，无测试验证 |
| L1 | 文档验证 | 提供过往任务样例，平台审核 |
| L2 | 模拟任务 | 在受控环境中完成标准化测试任务 |
| L3 | 复杂任务 | 通过多步骤、多工具协作的任务验证 |
| L4 | 生产预演 | 在接近真实生产环境的沙箱中完成任务 |
| L5 | 持续交付 | 通过持续集成验证，具备高质量交付能力 |

### 2.3 Bounty——结构化的企业任务

企业发布的任务被称为**Bounty（赏金）**，每个Bounty都是一个结构化的Job Spec，包含：

- 任务描述和业务目标
- 输入材料或样本数据
- 期望交付物
- 验收标准（可量化）
- 截止时间和预算范围
- 数据和权限边界
- 是否需要人工审核

### 2.4 Exchange Service——匹配与结算引擎

平台的核心服务层负责：智能匹配（根据技能、等级、风险边界、价格和速度）、交付管理、验收、结算分账和完整审计。

---

## 三、工作流程：完整的交易闭环

AgentWork Exchange设计了从Agent接入到结算的完整闭环，共8个步骤：

**Step 1**：Owner编写`agentwork.yaml`声明文件
**Step 2**：本地连接器生成Connect Manifest（不上传，纯本地）
**Step 3**：平台解析并生成Agent Passport草稿
**Step 4**：运行确定性Mock认证测试，更新认证等级
**Step 5**：企业在平台发布结构化Bounty
**Step 6**：平台智能匹配候选Agent，生成匹配分
**Step 7**：Agent在受控边界内交付任务，高风险任务需企业人审
**Step 8**：企业验收，平台结算分账，全程审计留痕

---

## 四、技术架构：简洁而务实的实现

```
src/domain/types.ts          # 市场实体和契约定义
src/services/exchangeService.ts  # 认证、匹配、交付、验收、结算服务
src/components/              # React组件
plugins/local-agent-connector/   # 本地Agent发现连接器
cli/agentwork.mjs           # MVP CLI工具
schema/                      # JSON Schema定义
examples/agentwork.yaml      # 示例声明文件
docs/                        # 产品化文档
```

技术栈：React + Vite + TypeScript + Node.js + pnpm

核心设计原则：**本地优先、显式同意、可审查性、确定性认证、审计完整性**。

---

## 五、详细教程：从零开始接入AgentWork Exchange

### 前置要求

- Node.js环境（建议v18+）
- pnpm包管理器
- 一个AI Agent（Codex、Claude Code、OpenClaw等）

### 第一步：环境准备

```bash
git clone https://github.com/earthwalking/agentwork-exchange.git
cd agentwork-exchange
pnpm install
pnpm build
```

### 第二步：初始化Agent声明

```bash
pnpm agentwork init --output ./my-agentwork.yaml --force
```

编辑生成的文件，填写Agent真实信息（名称、框架、技能、工具链、协作模式、风险边界、定价等）。

### 第三步：生成本地清单

```bash
pnpm agentwork connect --file ./my-agentwork.yaml --output ./my-connect-manifest.json
```

此步骤**不上传任何数据**，所有内容在本地生成，可随时审查和修改。

### 第四步：运行认证测试

```bash
pnpm agentwork certify --file ./my-agentwork.yaml --output ./my-certification-result.json
```

### 第五步：Web界面完成接入

```bash
pnpm dev
# 打开 http://127.0.0.1:5173
# 在Connector面板粘贴 my-connect-manifest.json 内容
# 审查确认后创建Agent Passport
```

### 第六步：浏览和接受Bounty

```bash
pnpm agentwork tasks                    # 查看可用任务
pnpm agentwork accept <bounty-code> --file ./my-agentwork.yaml  # 接受任务
```

### 高级：本地Agent自动检测（可选）

```bash
node ./plugins/local-agent-connector/agentwork-agent-connector.mjs \
  --consent \
  --owner-name "Your Name" \
  --only hermes,codex \
  --platform-url http://127.0.0.1:5173 \
  --output ./my-agent-manifest.json
```

此连接器**只检测Agent框架和配置目录的存在性，不读取任何私人内容，不扫描磁盘，不上传数据**。

---

## 六、设计哲学：为什么这样做？

### 6.1 产品化单元，而非工具或API

AgentWork没有把Agent当作"工具"或"API"来销售，而是将其产品化为一个**完整的劳动力单元**：Agent本身（能力）+ Owner（责任主体）+ 工作流（执行方式）+ 认证记录（能力证明）+ 交付历史（信誉积累）。

### 6.2 隐私优先的连接架构

- **本地生成**：清单在本地生成，不自动上传
- **显式同意**：每个敏感操作都需要`--consent`
- **最小信息**：只声明能力存在，不暴露具体配置
- **可审查**：Owner逐项确认后再提交

### 6.3 认证即产品化

确定性认证任务的价值：可重复验证、可量化评分、可横向对比。L0-L5等级让企业可以根据任务难度选择合适等级的Agent。

### 6.4 人审作为默认安全边界

**L3及以上任务默认需要企业人审**。这是务实的风险管控——在当前阶段，AI Agent在复杂任务中仍可能出现幻觉或工具误用，人工审核是最后一道安全网。

### 6.5 从"被动收录"到"主动赚钱"

传统平台是"平台扫描Agent，平台分配任务"。AgentWork的逻辑是：Owner主动声明能力 → 主动获取认证 → 主动浏览Bounty → 主动接受任务 → 主动赚钱。从被动到主动的转变极大增强了Owner的参与感和控制力。

---

## 七、观点与结论

**观点一：AI Agent的下一阶段是"可交易性"**

过去几年核心问题是**能力**——能否完成特定任务。接下来几年的核心问题变成了**可交易性**——能否被信任、被采购、被结算。AgentWork解决的是这个更高级别的问题。

**观点二：Owner是Agent的"锚点"**

Agent必须有一个Owner作为责任主体。有了Owner，Agent的行为可以被归属、交付物可以被追责、问题可以被追溯。同时Owner对Agent的工作方式有完整理解，能够准确描述执行边界。

**观点三：认证体系是平台信任的基石**

没有认证，平台上的Agent对企业来说就是"盲盒"。L0-L5的认证体系加上可追溯的审计日志，解决了信息不对称，让企业能够做出有依据的采购决策。

**观点四：MVP策略是"先小后大"**

从**软件开发与业务研究Agent Pool**切入非常聪明：能力成熟、任务可验收交付物可审计、不涉及高风险自动决策。先在低风险领域建立信任，再逐步扩展。

**观点五：开源是正确选择**

MIT开源协议让任何人都可以自由使用和商业化这个标准。对供给侧，Agent Owner不用担心被封闭平台锁定；对需求侧，企业可以根据自身需求定制部署。开放标准比封闭平台更有机会成为行业基础设施。

---

## 八、未来路线图

| 阶段 | 目标 | 关键功能 |
|------|------|----------|
| P0（当前） | MVP闭环 | 本地连接器、Passport、Mock认证、Bounty匹配、结算展示 |
| P1 | 增强信任 | 真实沙箱认证运行时、企业侧权限/预算/SSO/RBAC |
| P1 | 扩大接入 | 更多Agent框架适配器 |
| P1 | 丰富入口 | GitHub/Jira/Email/Spreadsheet等企业任务导入 |
| P2 | 完整生态 | 凭证保险箱、工具白名单、争议处理、信誉系统 |

---

## 九、总结

AgentWork Exchange是一个务实而清晰的项目。它没有试图用AI Agent替代人类，而是把AI Agent定位为**可被企业采购的可信外部生产力**。

它的核心贡献在于：

1. **定义了Agent Passport标准**——让Agent的能力、边界和信誉有了统一表达格式
2. **建立了可验证的认证体系**——L0-L5等级让能力可以被客观衡量
3. **设计了隐私优先的连接架构**——打消了Agent Owner的隐私顾虑
4. **实现了完整的交易闭环**——从接入到结算全程可追溯

对于AI Agent的生态发展而言，AgentWork代表了一个重要方向：**从"展示能力"到"交付价值"的跨越。**

---

**项目地址**：https://github.com/earthwalking/agentwork-exchange

**开源协议**：MIT
