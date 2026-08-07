---
title: "Agent Plugins 深度解析：一个由 Amazon、Cursor、微软、OpenAI、Vercel 联合制定的 AI 代理插件可移植标准"
description: "全面解析 agent-plugins.org 发布的 Agent Plugins 规范 v1.0.0——一个开放、厂商中立的插件打包标准，为 Agent Skills 和 MCP servers 定义统一的可移植包格式。核心思想：各 AI 代理客户端各搞一套插件格式，插件作者被迫为每个客户端重新整理或复制组件；Agent Plugins 只定义一个「互操作性最小公约数」——共享组件用统一结构，而分发、安装、权限、用户体验和客户端专属能力仍由各客户端掌控。全文覆盖：为什么需要它、可移植包的目录结构与 manifest 规范、五种 MCP 传输（stdio/Streamable HTTP/HTTP+SSE）、PLUGIN_ROOT 与 PLUGIN_DATA 插件变量、反向域名客户端扩展、渐进式采用、失败隔离，以及十条设计决策背后的哲学。从核心思想、项目说明、设计哲学到零基础教程（最小 hello-plugin → 完整 manifest → 打包技能 → 配置 MCP → 实现客户端）和归纳观点，一文讲透。"
date: "2026-08-07"
author: "TopDigg Research Team"
tags: ["Agent Plugins", "AI Agent", "MCP", "Agent Skills", "Plugin", "Interoperability", "Open Standard", "Amazon", "OpenAI", "Microsoft", "Cursor", "Vercel"]
categories: ["Deep Dive"]
keywords: ["Agent Plugins", "AI 代理插件", "MCP", "Agent Skills", "可移植插件", "互操作性", "开放标准", "plugin.json", "mcp.json", "PLUGIN_ROOT", "PLUGIN_DATA", "技术指导委员会"]
---

# Agent Plugins 深度解析：一个由 Amazon、Cursor、微软、OpenAI、Vercel 联合制定的 AI 代理插件可移植标准

> 核心思想：**Agent Plugins 是一个开放、厂商中立的 AI 代理插件打包标准（v1.0.0）。** 它解决一个真实存在的碎片化问题：AI 代理客户端各自发明了自己的插件格式，即使插件装的是同样的组件（技能、MCP 服务器），作者也必须为每个客户端重新整理或复制一份。Agent Plugins 不试图统一一切，它只定义一个「互操作性最小公约数」——共享组件用一套可预测的结构，而分发、安装、权限、用户体验和客户端专属能力，全部留给各客户端自己掌控。这个由 Amazon、Cursor、Microsoft、OpenAI、Vercel 核心维护者组成的**技术指导委员会（TSC）**推动的标准，把「可移植性」和「客户端自主权」同时写进了规范：目录即包、根级 `plugin.json` 是唯一一致性地板、`skills/` 与 `mcp.json` 是固定组件位置、反向域名命名空间是客户端扩展的出口。它用十条清晰的设计决策回答了同一个问题：**如何用最小的规范面，换取最大的生态互通。**

---

## 一、项目说明

### 1.1 它是什么？

**Agent Plugins** 是一个**开放、厂商中立的插件打包标准**，用于把可复用组件打包成可移植插件，从而扩展 AI 代理的能力。它的 **v1.0.0 规范**为两类组件定义了统一的共享格式：

- **Agent Skills**（`https://agentskills.io/specification` 定义的技能格式）
- **MCP servers**（`https://modelcontextprotocol.io/specification` 定义的模型上下文协议服务器）

兼容的客户端（AI 代理工具、开发工具）可以一致地发现和加载这些插件。

### 1.2 关键数据

- 官网：`https://agent-plugins.org`
- 规范仓库：`https://github.com/agentplugins/agent-plugins-spec`
- 规范版本：**1.0.0**（状态：Working Draft，工作草案）
- 许可证：**Apache-2.0**（规范文本 + 配套文档以 Apache-2.0 / CC-BY-4.0 双轨发布）
- 技术指导委员会（TSC）初始核心维护者来自：**Amazon、Cursor、Microsoft、OpenAI、Vercel**
- 治理模式：社区治理的开放规范项目，个人持有角色（非公司席位），单一厂商不得占据核心维护者多数席位
- 发布物：规范文本（`spec/1.0.0.md`）、插件清单 JSON Schema、MCP 配置 JSON Schema、一致性检查清单
- 配套文档：`plugin-authors`（插件作者指南）、`client-implementers`（客户端实现指南）、`schemas`（机器可读 Schema）、`llms.txt` / `sitemap.md`（文档索引）

### 1.3 它解决什么问题？

**问题：插件格式碎片化。** AI 代理客户端（Claude Code、Cursor、OpenAI 系工具、各类 agent 框架……）各自定义了自家的插件格式，即使这些插件包含的是相同的底层组件。结果是：一个为客户端 A 打包的插件，客户端 B 往往需要改造后才能使用；插件作者不得不为每个客户端重复整理、重复复制组件。

**答案：定义一个「互操作性地板」。** Agent Plugins 只对「可以跨客户端移植的部分」设定标准——共享组件使用一种可预测的结构；而分发、安装、权限、用户体验、更新、客户端专属能力，全部保留在客户端自己的控制之下。规范有意不去规定：安装源/注册表/市场、启用/更新/缓存的 UX、权限提示/信任策略/沙箱、技能如何展示给用户或模型、客户端扩展的内部行为。

---

## 二、核心思想

### 2.1 互操作性最小公约数

Agent Plugins 的设计不是「大一统」——它明确只定义**可移植部分的共享格式**。规范原文这样表述：

> Agent Plugins defines a small interoperability floor for the parts that can be portable across clients.（Agent Plugins 为可跨客户端移植的部分定义了一个小型的互操作性地板。）

这是一个精妙的边界划分：**标准化的是「包装」而非「运行时」**。插件如何被发现、安装、运行、展示、授权——这些继续由每个客户端决定。标准只保证「同一个包，任何兼容客户端都能读懂」。

### 2.2 目录即包

一个 Agent Plugin 就是一个**目录**（不是 zip、不是注册表拉取的捆绑包）：

```text
my-plugin/
├── plugin.json          # 必选：清单，标识插件与目标规范版本
├── skills/              # 可选：Agent Skills 固定位置
│   └── summarize/
│       ├── SKILL.md
│       ├── scripts/
│       └── references/
├── mcp.json             # 可选：MCP 服务器配置
└── com.example.client/  # 可选：客户端扩展目录（反向域名）
```

选择目录作为包单位，带来四个直接收益：**可用标准工具检查**（`ls`、`cat`、`git`）、**开发时可原地编辑**、**无需特殊工具即可版本控制**、**没有发现间接层**。

### 2.3 两个固定组件位置

v1 规范定义了恰好两种组件类型，各有一个固定位置：

- **Skills** → `skills/`：每个包含 `SKILL.md` 的直接子目录就是一个技能（不递归搜索深层后代）
- **MCP servers** → `mcp.json`：根级 JSON 配置文件

固定位置的意义：`plugin.json` 不能覆盖这些位置，也不能内联组件配置——**发现规则对每个客户端都一样**，客户端无需实现「寻找替代来源」的复杂逻辑。

### 2.4 开放开发与公开治理

- 提案与技术决策**公开**，参与对更广泛生态开放
- 新特性与实质性变更从 **GitHub Discussions** 开始，提案须证明「具体的可移植性需求 + 实现者支持」
- 治理章程（Technical Charter）独立于包格式定义，角色由**个人**持有，公司不占席位，单一厂商不能控制核心维护者多数

---

## 三、设计哲学

规范末尾的 **Design Decisions** 附录是理解这个项目设计哲学的最佳入口——它逐条解释「为什么这样设计」。以下十条是核心：

### 3.1 为什么用目录做发现，而不是归档格式？

`zip`/`tar.gz` 或注册表捆绑包需要专门的工具才能检查。目录则可以用 `ls`/`cat`/`git` 直接检查，开发时可以原地编辑，版本控制无需特殊工具。**固定根级位置**（`skills/`、`mcp.json`）消除了发现间接层、替代来源优先级和清单配置——这些都是每个客户端原本都要各自实现的复杂度。

### 3.2 为什么 v1 只做 Agent Skills 和 MCP？

因为这两者**在项目外部已经有成熟的规范**（agentskills.io、modelcontextprotocol.io），且有可观的跨客户端采用。其他被提议的组件类型——commands、hooks、agents、rules、LSP servers——仍然太客户端专属，无法形成稳定的可移植契约，**在其格式收敛之前不进入 v1**。这是典型的「先跑通最小端到端」工程原则：先做有共识的两类，把不确定性留给未来。

### 3.3 为什么根级 `plugin.json` 是一致性地板？

每个合规客户端**必须**检查插件根目录的 `plugin.json`。这给插件作者一个**跨所有客户端保证存在**的单一清单——作者无需知道任何客户端专属的路径知识。

### 3.4 为什么是可移植清单的封闭 Schema？

根级 `plugin.json` 只允许 10 个顶层字段：`$schema`、`name`、`version`、`description`、`author`、`homepage`、`repository`、`license`、`keywords`、`extensions`。封闭 Schema 带来：**严格校验、拼写错误检测、Schema 驱动的键补全**。客户端的实验性字段不能占用任意顶层字段，只能收进 `extensions` 的反向域名键下。未知顶层字段是 Schema 违规，但客户端**报告并忽略**而不是拒绝整个插件——宽容地容纳未来。

### 3.5 为什么用反向域名做客户端扩展？

反向域名标识符提供了一种**去中心化的防冲突约定**，不需要中心化的客户端名注册表。同一个标识符可以同时用于清单数据（`extensions` 键）和客户端专属目录（顶层目录名），两种表示可以独立存在。扩展目录保持在顶层，让插件布局保持扁平、约定驱动。

### 3.6 为什么要有显式的 MCP 配置格式？

现有客户端使用的 MCP 配置形状互不兼容，传输推断方式各异。Agent Plugins 定义一个**显式的封闭联合（closed union）**，其含义独立于任何客户端原生格式。区分 Streamable HTTP 与旧版 HTTP+SSE，让每个条目有**无歧义的初始传输**，而连接失败后的回退行为则留在可移植格式之外。

### 3.7 为什么允许客户端只支持一种标准 MCP 传输？

Stdio 和 Streamable HTTP 服务于不同的部署与安全模型。要求每个支持 MCP 的客户端同时支持本地进程执行和远程 HTTP 连接，会**扩大其实现面和信任面**，却不改变可移植配置格式。由于每个服务器条目声明了自己的传输，客户端可以跳过不支持的条目，同时继续加载独立服务器和组件。

### 3.8 为什么 Schema 与规范共享版本号？

`plugin.json` 和 `mcp.json` 的 Schema 使用 Agent Plugins 规范版本号，而不是独立的版本序列。这让作者和客户端只需理解**一个**可移植格式版本，防止混合版本包，并让 `$schema` 选择完整的校验与解释契约——包括 JSON Schema 表达不了的要求。相比暴露三条独立的兼容性时间线，规范发布时重发一份未变的 Schema 只是很小的维护成本。

### 3.9 为什么用插件变量而不是配置里的相对路径？

MCP 服务器参数在运行时往往需要绝对路径。`${PLUGIN_ROOT}` 提供无歧义的、由客户端解析的**捆绑文件锚点**；`${PLUGIN_DATA}` 标识客户端管理的、跨更新持久化的**可写状态目录**。`command` 字段不做插值：`./` 路径直接相对插件根解析，裸名称用平台可执行文件搜索规则。**把 `command` 当作单个 token**，避免要求客户端解析和转义用户手写的 shell 命令字符串。不同客户端的继承环境和 `PATH` 行为各异，所以标准统一了配置的环境覆盖，但把裸命令搜索留给客户端定义——插件相对路径提供确定性的捆绑执行。

### 3.10 为什么组件失败是非致命的？

MCP 服务器启动或连接失败时，客户端**继续加载**插件的其余组件。一个同时提供技能和 MCP 服务器的插件，不应因为一个服务器不可用就整体不可用。规范把非致命组件失败与**诊断要求**配对，让失败可见而非沉默。

---

## 四、详细教程

### 4.1 创建最小插件（hello-plugin）

最小的可用插件是一个目录 + 一个技能，三步完成：

```text
hello-plugin/
├── plugin.json
└── skills/
    └── greet/
        └── SKILL.md
```

**Step 1：创建 `plugin.json`**

```json
{
  "$schema": "https://agent-plugins.org/schemas/1.0.0/plugin.schema.json",
  "name": "hello-plugin"
}
```

**Step 2：创建技能 `skills/greet/SKILL.md`**

```markdown
---
name: greet
description: Greet the user and offer help.
---

Greet the user and offer help.
```

**Step 3：加载**

支持技能的客户端读取 `plugin.json`，扫描 `skills/` 的直接子目录，并按 Agent Skills 规范校验每个 `SKILL.md`。要加 MCP 服务器，就把 `mcp.json` 放在插件根目录，使用相同的 Agent Plugins Schema 版本。

> 完整可复制的例子见：`https://github.com/agentplugins/agent-plugins-example`

### 4.2 完整清单字段

```json
{
  "$schema": "https://agent-plugins.org/schemas/1.0.0/plugin.schema.json",
  "name": "plugin-name",
  "version": "1.2.0",
  "description": "Brief plugin description",
  "author": {
    "name": "Author Name",
    "email": "author@example.com",
    "url": "https://example.com"
  },
  "homepage": "https://docs.example.com/plugin",
  "repository": "https://github.com/example/plugin",
  "license": "MIT",
  "keywords": ["keyword1", "keyword2"],
  "extensions": {
    "com.example.client": {
      "setting": true
    }
  }
}
```

要点：

- **必填字段只有两个**：`$schema`（目标规范版本标识符）和 `name`（可读插件名）。缺失/类型错误/为空 → 客户端拒绝插件且不得发现或执行任何组件
- `version` 建议用语义化版本（SemVer），用于更新检查与缓存新鲜度
- `author` 对象只允许 `name`/`email`/`url` 三个字段
- 除显式约束外，元数据字段只按 JSON 类型校验——**不会**因为 version 不是合法 SemVer、URL 不合法、邮箱不合法、license 不是 SPDX 标识而拒绝插件
- 未知顶层字段 → 报告并忽略，继续加载（非致命）

### 4.3 插件命名约束

`name` 必须全部满足：

- 长度 **1–64 字符**
- 字符集仅限 **小写字母、数字、`-`、`.`**
- **首尾必须是字母数字**
- **不允许连续 `--` 或 `..`**（但允许单个 `.`，如 `acme.tools`）

合法示例：`my-plugin`、`acme.tools`、`lint3r`、`a`
非法示例：`My-Plugin`（大写）、`-start`（前导连字符）、`has--double`（连续连字符）、`too.many..dots`（连续句点）、空串

### 4.4 打包 Agent Skills

- 固定位置 `skills/`，每个包含 `SKILL.md` 的**直接子目录**算一个技能；**不递归**搜索更深后代
- 技能本身必须符合 Agent Skills 规范（`SKILL.md` 格式、frontmatter、`scripts/`/`references/`/`assets/` 布局）
- 技能不合规 → **跳过该技能**并继续加载其他技能（建议报告无效技能）

```text
skills/
└── deploy/
    ├── SKILL.md          # name: deploy
    ├── scripts/
    │   └── rollback.sh
    └── references/
        └── runbook.md
```

### 4.5 配置 MCP 服务器（mcp.json）

`mcp.json` 必须是 JSON 对象，只含两个顶层字段：`$schema` 和 `mcpServers`。每个服务器条目必须包含 `type`，并匹配以下封闭变体之一：

**stdio（本地进程）**

```json
{
  "type": "stdio",
  "command": "./bin/validator",
  "args": ["--data", "${PLUGIN_DATA}/validator"],
  "env": {
    "CONFIG": "${PLUGIN_ROOT}/config.json"
  },
  "cwd": "${PLUGIN_ROOT}"
}
```

要点：

- `command` 必须是**单个可执行 token**（裸名称或 `./` 开头的插件相对路径），不能是 shell 命令字符串，不做占位符展开
- 省略 `cwd` 时默认插件根目录；`cwd` 只能是插件相对路径、`${PLUGIN_ROOT}` 开头、或 `${PLUGIN_DATA}` 开头三种形式
- `args`/`env`/`cwd` 支持 `${PLUGIN_ROOT}` 和 `${PLUGIN_DATA}` 展开

**Streamable HTTP（远程）**

```json
{
  "type": "streamable-http",
  "url": "https://deploy.example.com/mcp",
  "headers": {
    "X-Tenant": "public-tenant"
  }
}
```

**旧版 HTTP+SSE（已弃用）**

```json
{
  "type": "sse",
  "url": "https://legacy.example.com/sse"
}
```

远程要点：

- `url` 必须是绝对 HTTP/HTTPS URL，不含用户信息或 fragment；非回环端点**必须用 HTTPS**
- header 名称大小写不敏感，不允许同名字段不同大小写重复出现
- **header 值是可见的包数据，不是机密机制**——禁止在 header 里嵌入凭据；v1 不定义 OAuth 或可移植凭据引用字段，授权发现/用户交互/凭据存储由客户端管理

**传输支持要求**：支持 MCP 的客户端必须至少支持 `stdio` 或 `streamable-http` 之一（SHOULD 两者都支持），`sse` 可选。客户端必须用 `type` 声明的传输做首次连接尝试，Agent Plugins 不定义失败后的回退行为。

### 4.6 插件变量：PLUGIN_ROOT 与 PLUGIN_DATA

启动插件子进程的客户端**必须**为每个子进程提供两个环境变量：

- `PLUGIN_ROOT`：文件系统解析后的插件根目录绝对路径——用于引用**随插件捆绑**的脚本、二进制和配置文件
- `PLUGIN_DATA`：客户端管理的持久化数据目录绝对路径——用于 `node_modules`、虚拟环境、生成代码、缓存等**跨更新持久化**的状态（客户端必须在启动前创建、保证可写、跨更新保留；卸载时可删除）

展开规则：

- 展开是**单次、非递归**的文本替换，替换引入的文本不再扫描占位符
- 展开适用于 `args` 的每个字符串元素、`env` 的每个字符串值、`cwd`；**不适用**于 `env` 键、`command`、固定组件位置
- 未识别的类占位符文本保持字面量；客户端不得做任何其他占位符/环境变量展开
- 服务器 `env` 对象**禁止**包含名为 `PLUGIN_ROOT` 或 `PLUGIN_DATA` 的条目（保留变量由客户端供应，违规则该服务器条目无效）
- `env` 值同样是可见包数据，禁止嵌入凭据

### 4.7 实现一个兼容客户端

**加载序列（客户端视角）**：

1. 建立文件系统解析后的插件根目录
2. 用 `$schema` 选定的本地支持 Schema 定位并校验根 `plugin.json`
3. 致命清单违规 → 拒绝插件；显式非致命情形 → 报告并忽略
4. 从固定位置发现每种支持的组件类型
5. 应用每种组件类型/条目定义的失败边界
6. 应用已实现的客户端扩展命名空间，忽略其他

**最小客户端要求**（一致性要点）：

- 能从目录路径加载插件
- 校验封闭的 `plugin.json` Schema，忽略未实现的 `extensions` 成员（不校验其值的内容）
- 为支持的组件类型在固定位置发现组件
- 支持 MCP 时：至少支持 `stdio` 或 `streamable-http` 之一；提供 `PLUGIN_ROOT`/`PLUGIN_DATA` 并展开运行时配置值
- 把 `command` 解析为单个可执行 token，默认工作目录为插件根
- **至少支持一种组件类型**（技能或 MCP）——增量采用是被明确允许的：仅技能客户端也可以合规

**失败隔离**：未知组件类型 → 忽略；独立组件的失败 → 不得阻止加载其他独立有效的组件；失败必须可见（SHOULD 报告），但「不支持某种组件类型/传输/扩展」本身不是错误。

---

## 五、归纳总结（观点与结论）

1. **碎片化是 AI 代理生态当前最大的互操作税。** 每个客户端一套插件格式，作者被迫重复打包。Agent Plugins 判断：与其统一运行时，不如统一「包装契约」——这是成本最低、共识最大的标准化切入点。

2. **「互操作性地板」而非「大一统」是正确的野心。** 规范明确把分发、安装、权限、UX、沙箱、客户端扩展留给各家。这个边界克制让 Amazon、Cursor、微软、OpenAI、Vercel 这些互为竞争对手的厂商能坐到同一张桌子上——没人愿意把自家运行时完全交出去。

3. **先做有共识的两类组件。** v1 只标准 Agent Skills 和 MCP，因为它们在项目外部已有成熟规范。commands/hooks/agents/LSP 服务器等仍在收敛中——「等格式收敛再进 v1」是防止过早标准化的教科书式做法。

4. **封闭 Schema + 宽容处理，是给未来留活口的智慧。** 未知顶层字段不致命（报告并忽略），客户端实验收进反向域名 `extensions`——既守住可移植契约的严格性，又允许生态在命名空间内自由实验。

5. **安全是设计出来的，不是口号。** 插件路径必须留在插件根内（拒绝 `../` 逃逸）、`command` 不做 shell 解释、header/env 明确「不是机密机制」、非回环端点强制 HTTPS、OAuth 明确留给客户端——每一条都在压缩攻击面。

6. **失败隔离让插件生态更健壮。** 一个 MCP 服务器挂了，整个插件不该不可用。非致命组件失败 + 诊断报告要求，让「部分可用」成为默认姿态。

7. **增量采用是标准落地的关键。** 客户端可以只支持技能、只支持 MCP，或只支持一种传输——标准为渐进式采用留了清晰的合规路径，大幅降低接入门槛。

8. **治理设计决定了标准的可信度。** 个人持有角色而非公司席位、单一厂商不得占多数、TSC 会议公开、提案从 GitHub Discussions 起步——这些条款让一个由竞争对手组成的标准组织有了长期可信的基础。

---

## 参考资料

- 官网：`https://agent-plugins.org`
- 规范仓库：`https://github.com/agentplugins/agent-plugins-spec`
- 规范文本 v1.0.0：`https://github.com/agentplugins/agent-plugins-spec/blob/main/spec/1.0.0.md`
- 插件清单 Schema：`https://agent-plugins.org/schemas/1.0.0/plugin.schema.json`
- MCP 配置 Schema：`https://agent-plugins.org/schemas/1.0.0/mcp.schema.json`
- 插件作者指南：`https://agent-plugins.org/plugin-authors`
- 客户端实现指南：`https://agent-plugins.org/client-implementers`
- 治理章程（Technical Charter）：`https://github.com/agentplugins/agent-plugins-spec/blob/main/GOVERNANCE.md`
- 示例插件：`https://github.com/agentplugins/agent-plugins-example`
- Agent Skills 规范：`https://agentskills.io/specification`
- MCP 规范：`https://modelcontextprotocol.io/specification`
- 讨论区：`https://github.com/agentplugins/agent-plugins-spec/discussions`
