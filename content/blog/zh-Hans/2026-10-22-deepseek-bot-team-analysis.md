---
title: "DeepSeek-Bot 深度解析：让 DeepSeek Harness 变成一支有长期记忆的 AI 团队"
date: "2026-10-22"
description: "深度解析开源项目 DeepSeek-Bot：一支构建在 DeepSeek Harness 上的长期驻留 AI Bot 团队。涵盖项目说明、上下文管家、派活树、三级权限模型、记忆体系设计哲学，以及完整安装部署教程。"
author: "瑞哥观势"
tags:
  - DeepSeek
  - Multi-Agent
  - AI Agent
  - 开源项目
  - 上下文管理
  - 长期记忆
categories:
  - 开源项目解析
  - AI Agent
---

# DeepSeek-Bot 深度解析：让 DeepSeek Harness 变成一支有长期记忆的 AI 团队

## 引子：一个被问烂了的问题

我们用 AI 编程工具的时候，几乎都遇到过同一个场景：

你让它写一个功能，它写了一半，你说"等等，这个地方不对"，它改；改完你说"还有问题"，它再改。改到第七轮的时候，你发现它已经忘了你第一次的要求，整个思路开始漂移。

于是我们发明了一堆补丁：把系统提示词写得更长、每轮手动贴上下文、隔一会儿新建一个会话、让模型自己做摘要……每个补丁都在打补丁。

DeepSeek-Bot 这个项目，本质上是在做同一件事，但它的解法不是"给一个 Agent 打补丁"，而是**换一个抽象层级**：不再把 AI 当成一个持续对话的会话，而是把它当成一个**有身份、有记忆、有同事的团队成员**。

这就是这个项目最值得研究的地方。

---

## 一、项目说明：它到底是什么

**DeepSeek-Bot（简称 DS Bot）** 是构建在 [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness)（DSH）之上的插件和桌面应用。它的官方定义一句话讲清楚：

> 一支长期驻留的 Bot 团队。

### 1.1 两种形态

| 形态 | 说明 |
|---|---|
| `ds-bot` 插件 | 标准 DSH 插件，跑在 DSH Desktop 和 DSH Web 里。全部 Bot 能力都在这里 |
| DS Bot 桌面应用 | 直接打开就是 DS Bot。自带锁定版本的 DSH、独立的 profile 和数据目录，会导入你在 DSH 里已有的团队，并安装 DSH 兼容插件，形成自己的插件生态 |

两种形态跑的是**同一份** `ds-bot` 插件代码。桌面应用的意义在于：DS Bot 自己掌握 profile、界面和 DSH 版本，不再受 DSH 通用界面和全局设置的束缚。

### 1.2 十个核心要求（官方愿景）

项目在 `docs/vision.md` 里列了十条核心要求，这基本就是它的设计宪法：

1. **构建在 DSH 之上，彼此独立。** 每个 Bot 都基于 DSH，Bot 之间互不干扰。
2. **可靠。** Bot 要与目标保持一致、依据证据行动、不越界、结果可检查。
3. **记忆与持久化。** Bot 有长期记忆。可以读别的 Bot 的记忆但不能改（只有 Main Bot 能改），群聊共享一份记忆。
4. **分级权限。** Main Bot 权限最高（创建、修改其他 Bot），其他 Bot 没有这些权限。只有用户能删 Bot。
5. **群聊。** 群聊是 Bot 协作的主要形式，可以有管理员 Bot，默认由管理员回答用户消息。
6. **工作文件夹。** 每个 Bot 有自己的工作目录，群聊可以给所有成员设一个。
7. **浏览器。** 每个 Bot 有自己的浏览器，互不影响。
8. **界面与动效。** 打磨过的界面，平滑的动效。
9. **独立应用。** DS Bot 要做成独立应用，不对 DSH 做太多让步。
10. **本地 Agent。** 可以把本地 agent CLI 接进来当 Bot（规划中）。

### 1.3 项目规模

| 指标 | 数值 |
|---|---|
| 许可证 | Apache 2.0 |
| 当前版本 | v0.2.0（2026-10-21 发布） |
| 依赖 DSH | 0.2.1-rc.2 |
| host 端代码 | 106 个文件，约 12,500 行 |
| client 端代码 | 约 14,400 行 |
| 单元测试 | 93 个测试文件 |
| 设计文档 | 11 篇中文设计稿（`docs/plans/`） |
| 已知问题 | 3 个（`docs/known-issues.md`） |

**注意这个比例：设计文档 900 多行，代码 2.7 万行。** 这个比例本身就是一种信号——这个项目的复杂度不在写代码，在想清楚"Bot 之间到底该怎么协作"。

---

## 二、设计哲学：六个我认为真正牛的思想

下面这部分是本文的核心。项目文档里的很多设计，我读完是拍案叫绝的。

### 思想一：上下文管家——不是"压缩"也不是"切断"，而是"判断"

**问题**：Bot 是长期的。用户跟一个 Bot 聊几周、几个月，上下文一定会满。两种常见做法都不对：

- **一遍遍压缩同一个会话**：摘要的摘要越来越虚，细节丢了找不回来。
- **到线就硬切新会话**：做到一半的活被切断，Bot 像失忆。

**DS Bot 的做法**：一个 Bot 是**一个长期不变的身份**，它的对话由多段 DSH Session 组成。快满的时候，唤起一个轻量的"上下文管家"（context steward），让它读最近的消息，判断一件事：

> 活是告一段落了，还是仍在进行中？

- **仍在进行** → 原地压缩成一个"检查点"（checkpoint）：一份交接摘要 + 用户近期消息的原文。活接着干，不中断。
- **告一段落** → Bot 自己写一份交接笔记，切换到新的一段继续。

**这个设计精妙在哪？**

管家不是靠 token 数判断，而是靠**语义判断**。它被明确要求"逐条核对用户要的和 Bot 实际做的，有没有 Bot 问了但用户还没答的问题"。哪怕 Bot 自己说"我做完了"，只要有一个子项没做完，就判定为"仍在进行"。

还有一条特别反直觉但特别正确的规则：

> **压缩过的次数越多，越应该把合理的停顿当作告一段落。** 因为摘要的摘要损失更大。

这是对"压缩损耗"的量化理解，比"每次压缩损失一点"这种直觉式判断高明得多。

**对用户的体感**：完全无感。没有"上下文已用 80%"的提示，也没有"切换会话"的工具。你看到的始终是一条连续的聊天。

**工程细节**（这些细节决定了这不是 PPT 项目）：

| 项 | 值 |
|---|---|
| 窗口 W | 模型声明的 `contextWindow`，没声明则按 500,000 |
| 可用 U | W 减去回复预留（`maxTokens`），不少于 W/2 |
| 硬线 H | 0.95 × U |
| 检查线 C | `checkRatio` × U（默认 0.8），不超过 H |
| 管家看的消息 | 最近约 6,000 tokens，单条最长 1,500 字符 |
| 管家输出 | 一行 JSON：`{"action":"switch"|"compact","reason":"…"}` |

**代码里没有写死任何 token 数**，全部跟着模型走。这是"不给某个模型写死数字"的极致坚持。

**一条安全细节**：管家失败或答不出，就直接换段。不猜。

### 思想二：派活树——把"消息链"变成"工作树"

这是我认为整个项目**最有价值的单点设计**。

**问题**：Bot 之间派活，早期是按数量拦的。结果是什么？

- **Bot 看不到对方在做什么。** `list_bots` 只给名字、角色、模型、文件夹。连发 5 条消息，5 条"已送达"，0 条回复。
- **对方没读就拒绝发送。** 对方积压 10 条未读时直接拒发，但发件人不知道为什么。
- **按数量拦不分正常和空转。** 消息链 6 跳截断，用户上次发言后全团队最多 40 条，Bot 在一个群里最多发起 3 轮。结果是：每一步都换人、都有结果的长派活链在第 7 手被截断；而 A→B→A 的绕圈要转满 6 手才停。

**DS Bot 的解法：把"活"建模成一棵树。**

> 下面交回的活还没回来，上面的回复就先不交；下面全部交回，上面接着做，做完连同下面的结果一起交上去。

**结果自己会往上走。** Bot 不需要给上游补消息，因此**不需要靠跳数、条数来防绕圈**。于是：

> **消息链 6 跳、对方 10 条未读、Bot 在一个群里最多发起 3 轮、用户上次发言后全团队 40 条——全部去掉，不留兜底。**

这是我认为整份设计文档里最激进也最正确的一次决定。**上限从来不是解决方案，是掩盖问题的创可贴。** 一旦结构对了，很多限制就不需要存在了。

配合这个设计，还做了两件事：

**1. 状态是一等公民。** 每个 Bot 的状态是五种之一：等用户批准 / 换新会话中 / 在干活 / 在等别的 Bot / 空闲。`list_bots` 一次给全，还带未读消息数和问题卡片状态。

**2. 只拦一种消息。** 唯一被拒绝的是"发给正在等这件活结果的 Bot"——因为结果会自动交回去，发过去既是绕圈也是多余。其他全允许，同一个 Bot 在一件活里出现几次都行（设计、审查、返工、验收的接力链）。

**未读消息合成一条**：X 发给 Y 的消息 Y 还没读时 X 又发一条（同一件活），就合成一条。这样**收件箱里每个发件人最多一条未读消息**，堆积的根本原因被消除了，于是上限也就不需要了。

### 思想三：三级权限——角色权限与沙盒权限彻底分离

这是很多多 Agent 项目做糊的地方，DS Bot 分得很干净。

**两层互相独立的权限**：

- **角色权限**：谁能管理 Bot、群和团队记忆。**由 DS Bot 自己检查。**
- **沙盒权限**：一个 Bot 的工具能碰到什么（读文件、改文件、跑命令）。**用 DSH 提供的权限预设，由 DSH 执行。**

| 谁 | 范围 | 能做什么 |
|---|---|---|
| 用户 | 全部 | 一切操作，包括设置/取消 Main Bot，设置沙盒权限 |
| Main Bot | 整个团队 | 建 Bot、改任何 Bot、停止别的 Bot 的回合；建群改群删群；写团队记忆；读写别的 Bot 的记忆；挂摘能力 |
| 群管理员 | 自己管的群 | 改自己的群；往群里发言；写团队记忆。不能删群，不能改群的工作文件夹 |
| 普通 Bot | 自己 | 改自己的名字、角色、颜色、模型、工作文件夹、指令；给自己挂摘能力；群里发言、`@` 点名；私聊里 `message_bot` 给任何 Bot 发消息 |

**三条极关键的设计细节**：

1. **只有用户能设沙盒权限。** Bot 发起的修改一律拒绝，`update_bot` 和 `update_group` 都没有这个参数。Bot 不能给自己提权。
2. **越权时告诉 Bot 该怎么办**，而不是简单报错。工具返回"只有 Main Bot 能创建 Bot，请让 Main Bot 来做"——让 Bot 能自己改道，而不是卡死。
3. **"完全权限"在界面上这几个字一直是红色**，还要再确认一次。

### 思想四：三层记忆——上下文管"这次在做什么"，记忆管"跨对话该记住什么"

这两条线分得很清楚：

| | 上下文 | 记忆 |
|---|---|---|
| 管什么 | 这次对话在做什么 | 跨所有对话都该记住的事 |
| 谁维护 | 上下文管家（判断压缩/换段） | 模型整理（每段对话空闲后） |

**记忆的关键设计**：

**三层作用域**：
- 每个 Bot 有自己的记忆
- 每个群聊有群记忆，**只在这个群里读**
- 团队记忆，所有 Bot 都读

**"群里说的话留在群里"**：群记忆只进这个群成员的群会话，不进他们的私聊，也不进别的群和群外的 Bot。成员被移出群后即刻读不到、也写不了。

**记忆不能只靠 Bot 想起来调用。** 每段对话空闲后有一次自动的"记忆整理"，由模型读这段对话新增的内容，像人谈完话后那样保留、修改或删除条目。私聊由 Bot 自己的模型整理写进它自己的记忆；群聊**按群整理一次**（不是每个成员各整理一次），用管理员的模型，只写进群记忆。

**格式极简**：沿用 Agent MemoryRepo 的 Markdown 格式，一行一条，行尾带 `[source: …; added: …]`。

**固定大小上限**（字符）：一条 300，`MEMORY.md` 4,000，一个主题 16,000，一个作用域 40 个主题。超限直接失败并告诉你怎么腾空间。

**安全**：记忆是数据，不是指令。看起来像密钥的条目被拒绝；Bot 被明确告知不要保存网页、文件或工具结果"要求它记住"的东西。

**缓存友好性**（这个细节很专业）：每个 Session 第一次渲染时把记忆段冻结下来，之后提示词保持**逐字节不变**，提供方的前缀缓存才能命中。换段或做检查点（检查点本来就会打破缓存）才重新冻结。代价是"一段对话开始之后才保存的条目不会出现在这段的提示词里"——所以提示词明确要求 Bot：**在回答"不知道"之前先调用 `recall`**。

**不用 git 管记忆**：文件原地修改，`journal.jsonl` 记下每次改动替换了什么。

### 思想五：安全模型——网页不可信，密钥不能泄露

> **浏览器由用户操作，Bot 只能读。密钥的值只有用户输入、只存在本机。Bot 只拿到环境变量名；值在离开本机之前一律换成占位符。**

具体到实现：

**Bot 浏览器（仅 DSH Desktop）**：
- 每个 Bot 一个存储分区（`bot:<id>`），登录状态互不互通
- `read_browser` 读的是 **DOM 不是截图**，转成 Markdown，链接和控件标成 `[#n]`
- **只读可见内容**：`display:none`、`visibility:hidden`、零高度、折叠的 `<details>` 内容全部跳过
- **绝不读取**密码、信用卡（`autocomplete="cc-*"`）、一次性验证码字段
- 硬上限：40 万字符、15 万节点、每表 5 千行、3 千链接、1.5 秒
- **不能点击、不能输入、不能滚动、不能打开网址**
- 页面内容一律**当作数据，永不当作指令**
- 云主机元数据地址（`169.254.x.x`）禁止访问——它会发放账号凭据

**密钥**：
- Bot 调用 `request_secret`，用户在自己聊天里的卡片输入，**Bot 永远看不到值**
- 值存 `secrets.json`，权限 600，原子写入，不进 `state.json`、不进日志
- 通过 `$DSH_SECRET_<NAME>` 环境变量注入
- 工具结果保存前、每次请求发给模型前，值全换成 `[secret:<NAME>]`
- 8 字符以下的短值（PIN）只在"独立出现"时替换，避免误伤普通文字
- 明确的诚实警告：**只有精确副本会被屏蔽，一个把值编码、拆分或反转的 Bot 仍然能打印出来。不要把重要密钥交给你不信任的 Bot。**

**联网搜索**：
- 绝不借用另一条路由的 key（每个 key 都在自己账户上计费）
- 原生搜索不可用时，退回不需要 key 的方式（抓取 Bing / DuckDuckGo 公开结果页并解析）
- 每条结果开头有 `Search backend: …` 说明走的哪条路径
- 全失败时告诉模型**不要猜地址**

### 思想六：视图卡——把"模型写 HTML"否决掉

这是一个被外部评审否决两次后定下来的方案，值得单说，因为它代表了一种**安全设计的现代思路**。

**第一版方案**：模型写 HTML，iframe 渲染。**被否决**。理由：

- 任意 HTML 没有压缩序列化策略：上下文管家和交接包要么塞爆要么丢光
- iframe 在聊天虚拟滚动中卸载即丢失内部状态
- **模型生成的脚本可以自动提交，造成回合劫持死循环**
- 为 widget 内容开 GET 路由、配 CSP 需要依赖 DSH 未文档化的能力，风险由插件承担

**第二版方案（现行）**：**不执行模型生成的代码。**

> 模型只从一份固定组件目录里挑组件、填数据，渲染用 DS Bot 自己的组件。**安全性来自"没有代码执行"，不靠沙箱。**

第一版组件目录 8 个：`stack`（纵向容器）、`text`（Markdown 文本）、`metric`（指标）、`table`（只读表格）、`options`（选项）、`confirm`（确认）、`form`（短表单）、`progress`（进度快照）。

硬上限：序列化后 8 KiB、组件树深 8 层、节点 64 个、表格 50 行 8 列、form 6 字段、options 8 选项。

**一次提交结算整张卡**，其他组件未提交的输入丢弃。**视图不进群聊**（和 `ask_user` 同一句提示）。

> **安全设计的本质变化**：从"把不可信代码关进笼子"，变成"根本不提供笼子"。

---

## 三、其他值得一说的细节

### 3.1 群聊：一次只有一个人说话

早期让成员并行写、发出前再检查新消息，**连报数都会乱**：模型会沿用乱掉的数字硬发。把排序交给模型做不好。

结论：**群里一次只有一个人说话**，每个成员开口前读到的都是最新的群。

回答方式两种：
- **管理员先答**（新群默认）：没有 `@` 的普通消息只给管理员，管理员用 `@名字` 叫人。**这是成本考虑**——每叫一个成员，就要带上它整个会话的上下文跑一次模型，成本随发言人数线性增长，系数很大。所以默认少叫人。
- **全员轮流**：每个成员按顺序回答，管理员第一个。

进度可见性做得很好：成员第一次调工具后 15 秒仍在干活，本轮就继续往下走，不再等它；但它干活中说的第一句话和带 `@` 的话**立刻发到群里**（间隔不到 30 秒的几句合并成一条）。结果由派活的 Bot 接话。

### 3.2 长消息：热文件只放有上限的数据

原来 Bot 之间的消息整段存进 `state.json`，而 `state.json` 每次保存都整份重写。一条 500 万字的 `message_bot` 让它涨到 6.5 MB，之后**改个颜色也要重写这么多**。

现在：
- `state.json` 只存前 2,000 字 + 总长度 + 全文在哪
- 超过 20,000 字的消息**原样存成 DSH 附件**（内容寻址，相同内容只存一份）
- 消息里只留一句说明、开头 1,000 字和一个文件块
- 群记录的长行放到 `bot/group-lines/<群>/<seq>.txt`，行被挤出最近 60 行或群被删时文件一起删

### 3.3 DSH 让步总账：一份罕见的坦诚账本

`docs/plans/2026-10-13-dsh-concessions.md` 记录了 14 条"因为 DSH 本身的限制而做的妥协"。每条写明：日期、相关 Issue/PR、**DSH 的限制**、**现在的做法**、**代价**、**桌面应用之后怎么处理**。

举几条：

| # | DSH 的限制 | 现在的做法 | 代价 |
|---|---|---|---|
| C1 | PTC 预设下模型只能直接调 `run_code`，一次程序运行最长约 10 分钟 | 工具展示和服务端都遍历子调用 | 每个工具相关功能都要同时处理顶层和子调用 |
| C2 | 命令全局注册，不能按会话过滤 | Bot 会话一律不支持 goal | `/goal` 仍出现在命令菜单里，但用不了 |
| C5 | patch 没有条件语法；网页搜索选择器在 id 没注册时不回落 | 只写文档 | 关掉 `web-search-auto` 时必须同时改 `web.searchProvider`，否则**所有会话**的 `web_search` 都失效 |
| C7 | 其他插件的 CSS 能覆盖 ds-bot；ds-bot 依赖 DSH 的私有类名 | 几处布局属性加 `!important` | DSH 每次改结构或换皮都可能弄坏布局 |
| C11 | 模型流卡死时没有看门狗，回合不会结束 | 没读的请求合成一条，状态可见 | 卡死的 Bot 要用户手动停止 |

**判断一个 Issue 是 DS Bot 的 bug 还是 DSH 的限制时，先看这张表。** 这种文档在开源项目里极其罕见，也是我认为这个项目质量最高的证明之一。

### 3.4 硬性规则：五条

项目根目录的 `AGENTS.md` 给 AI 编码代理定了五条硬性规则，我摘抄一下（已翻译）：

1. **构建在 DSH 之上；绝不打补丁。** 绝不修改 DeepSeek Harness，也不依赖 DSH 安装目录内部的文件。**如果 DSH 中缺少某项能力，停下来并说明；不要用打补丁的方式绕过去。**
2. **不带密钥。** 绝不写入、打印或提交 API key、token、cookie 或 `DSH_HOME` 的内容。
3. **只用原创材料。** 不从其他产品或网站复制代码、文本、图标、logo 或图形。
4. **`client.js` 是生成产物。** 改 `src/client/`，然后 `npm run build`，绝不手工编辑。
5. **不要动用户自己的 DSH 数据。** 导入只读 `~/.dsh`，绝不往那里写。

第 1 条和第 3 条特别值得共鸣。**"如果 DSH 中缺少某项能力，停下来并说明"**——这句话背后是克制。

### 3.5 项目自己的设计文档评审流程

`docs/plans/` 下的设计稿有非常明确的格式要求：**为什么 / 已定的行为 / 不做什么 / 已知限制 / 变更**。

"**不做什么**"这一节是很多项目设计文档里最缺的东西。比如：

- 群聊：**不做**并行发言后再检查冲突；**不做**"一直轮到没人说话为止"的多轮讨论；**不让**成员把长任务一直占着发言位
- 派活：**不把状态写进系统提示**（为了缓存）；**不主动通知**派活的 Bot"对方卡住了"（每条通知都会让派活的 Bot 再跑一次模型）；**不设**总量、链长或轮数的兜底上限
- 记忆：**不告诉** Bot 或用户上下文占用了多少；**不给** Bot 切换段的工具；**不用** git 管理记忆
- 视图卡：**不渲染**模型生成的 HTML/JS；**不引入** iframe；**不自建** MCP Apps host

而且设计稿要经过**多轮外部评审并签字**。widget-views 那一篇的变更记录写着：

> 2026-10-20：初稿（声明式目录，第二版）。评审：Antigravity 否决第一版 iframe 方案；Codex 一审（ship with changes）……二审（ship with changes）……三审签字（ship，无需再改）。

**让不同的 AI 评审同一份设计稿，并记录每一轮的修改意见。** 这在我见过的开源项目里是头一份。

---

## 四、归纳总结：我的六个判断

### 判断一：这是"Agent 产品化"而非"Agent 编排"的思路

市面上绝大多数多 Agent 框架（AutoGen、CrewAI、LangGraph 等）关心的是**怎么把任务拆开、并行跑、汇总**。它们的隐含假设是：任务是一次性的、上下文是短的、结果是要交付的。

DS Bot 关心的是**怎么让一群长期存在的同事一起工作**。它的每个设计都指向这个目标：

- 长期驻留的身份（不是一个 task）
- 长期记忆（不是一次性上下文）
- 派活树（不是任务 DAG）
- 群聊（不是并行 worker）
- 权限分级（不是所有人平等）

**这是从"编排一个流程"到"经营一个团队"的转变。** 前者优化的是吞吐量，后者优化的是持续性。

### 判断二：最重要的设计决策是"删掉限制"，而不是"加更多规则"

我数了一下，DS Bot 在演进过程中**删掉**的限制：

- 消息链 6 跳截断 → 删
- 对方 10 条未读上限 → 删
- Bot 在一个群里最多发起 3 轮 → 删
- 用户上次发言后全团队 40 条消息 → 删

同时它**新增**的约束只有一个：**不给正在等这件活结果的 Bot 发消息**。

**净效果是约束大幅减少，可靠性反而提高。** 原因很简单：删掉的是"症状级"限制（计数），保留的是"结构级"约束（等待关系）。

这就是好的系统设计的味道——**约束应该来自系统的结构，而不是来自计数器。**

### 判断三："上下文管家"是模型能力提升带来的新设计空间

传统的长上下文方案里，"什么时候压缩"是一个**工程问题**，用 token 阈值解决。

但当模型足够聪明时，它能**读懂对话的语义结构**——"这件事做完了吗"是一个语义问题，不是计数问题。

于是设计上出现了质变：DS Bot 不再问"上下文还剩多少"，而是问"**这件事告一段落了吗**"。

这是我认为整个项目里最有前瞻性的部分。**它把一个原本确定性的工程问题，交给了一个非确定性的模型判断，并且为这个判断设计了一整套兜底（失败就换段）。**

同样的思路用在记忆整理上：不是让 Bot 决定要不要记，而是**每段对话结束自动整理一次**。Agent 的行为不再依赖它"想起来"做某件事。

### 判断四：安全上的思路是"拒绝能力"而不是"加强管控"

对比一下两种思路：

| 思路 | 例子 |
|---|---|
| 加强管控 | 让模型在沙箱里跑得更安全；给 HTML 加更严的 CSP；给 iframe 加更细的来源检查 |
| **拒绝能力** | **根本不提供模型写 HTML 的能力**；Bot **只读**不写浏览器；**密钥值永不进入模型上下文** |

后者更彻底，也更省心。**DS Bot 在这两处都选了后者**，而且都给了明确的理由（"安全性来自没有代码执行，不靠沙箱"）。

值得注意的是它并不假装自己万无一失。密钥那一节的诚实警告——"一个把值编码、拆分或反转的 Bot 仍然能打印出来"——这种把已知局限明说的写法，比任何免责声明都更值得信任。

### 判断五：可读性本身就是架构质量的一部分

看它的几个设计：

- **`state.json` 只存前 2,000 字。** 因为它每次保存都整份重写。这个约束直接来自"热文件只放有上限的数据"。
- **长消息存成附件。** 因为 DSH 有 `ctx.attachments`，内容寻址、相同内容只存一份。
- **状态不写进系统提示。** 因为系统提示要逐字节稳定才能复用提供方的前缀缓存。

这三条看起来是三个孤立的技术决策，但它们背后是同一条原则：**数据放在最合适的地方。** 大对象放文件系统，热点放内存，短小高频放提示词。

**DSH 让步总账、known-issues、"不做什么"章节**，这些也都是同一件事：**把设计决策的理由写在代码旁边，让后来的人不用重新推导。**

### 判断六：这是"开源项目"和"产品"的混合体，值得警惕地乐观

先说值得乐观的：

- Apache 2.0，代码完整，93 个测试文件，CI 在每个 PR 上跑测试
- 设计文档 11 篇，每篇都有"为什么"和"不做什么"
- 桌面应用、插件、Docker 镜像三种形态都在
- 进度很快：从 0.1.7 到 0.2.0 只隔了 5 天，但改动巨大

需要警惕的：

- **v0.2.0，还是预览版。** 官方自己写"Early release (v0.1). Features, tools and the saved data format can still change."
- **桌面应用未签名。** Windows SmartScreen 会警告，macOS 首次启动需要管理员密码手动放行。
- **已知问题里有"插件加载失败"这种基础问题**，排查步骤长得像一篇独立文章（要看 `cordis.patch.yml`、跑 `--dump-config`、删 profile 目录）。
- **Docker 部署只有一个权限预设：完全权限。** 因为 DSH 自己的内核沙箱（bubblewrap / Landlock）在 Docker 默认 seccomp 下跑不起来。这在 NAS 场景下意味着**你必须手动控制挂载哪些目录**。
- **群聊在 PTC 预设下旧会话，一轮最长约 10 分钟**会被中止。
- **工作文件夹被删或改名后，消息会被吞掉**（DSH 0.2.1-alpha）。

**结论**：这是一个**架构成熟度远超版本号**的项目。可以放心研究和试用，但要把它当早期产品对待，别当稳定基础设施。

---

## 五、完整教程：从零部署一个 DS Bot 团队

### 5.1 环境要求

| 项目 | 要求 |
|---|---|
| 桌面应用 | Windows x64 或 macOS（Apple 芯片 / Intel） |
| DSH Web | Node.js **22.19+**，pnpm |
| Docker | Docker 24+，Compose v2.24+，Linux x86-64 |
| 模型 | DeepSeek API key，或其他 Anthropic-Messages 兼容端点 |

### 5.2 路线 A：桌面应用（最简单）

**Windows (x64)**：
1. 前往 [Releases](https://github.com/Fei2411/DeepSeek-Bot/releases) 下载 `DeepSeek-Bot-<version>-win-x64.exe`
2. 运行安装。**只装给当前用户，不需要管理员权限**
3. 如果 Windows 弹出"Windows 已保护你的电脑"，点**更多信息** → **仍要运行**

**macOS**：
1. Apple 芯片下载 `DeepSeek-Bot-<version>-mac-arm64.zip`，Intel 下载 `mac-x64.zip`
2. Safari 会自动解压，把 **DeepSeek Bot** 拖进"应用程序"并打开
3. macOS 提示"无法检查应用"时：**系统设置** → **隐私与安全性** → **仍要打开**（需要管理员密码）

**首次启动**：
1. 问你两件事：**数据放哪**（默认 `~/.ds-bot`）、**Bot 的文件放哪**（默认 `~/DeepSeek Bot`）
   - 两个位置不能一个在另一个里面，也不能在用户 DSH 的数据里
2. 检测到你 DSH 里已有团队时，问要不要导入。**只问一次，导入只读你的 DSH，一个字节都不改**
3. 在设置里配一个模型
4. 打开就是一个叫 **Chief** 的 Main Bot。跟它说话，它会带你走完设置

> **给第一次玩的人的建议**：别急着建十个 Bot。先只跟 Chief 聊，让它理解你的工作方式，然后让它建第一个专职 Bot。

### 5.3 路线 B：作为 DSH 插件

先装好 DSH，并在里面配好至少一个模型。**DS Bot 直接用 DSH 的模型。**

**DSH Desktop（Windows / macOS）**：
1. 侧栏选 **Plugins** → **Add plugin**
2. **Package name or address** 填 `ds-bot`
3. **中国大陆用户**：把 **Registry** 设为 **Mainland China mirror**
4. 点 **Install**，然后 **Enable now**
5. 如果提示下次启动生效，**完全退出** DSH 再打开

**DSH Web（Windows / macOS / Linux）**：
```sh
npx @deepseek-ai/dsh@0.2.1-rc.2 plugin --profile web add ds-bot
npx @deepseek-ai/dsh@0.2.1-rc.2 web
```

**npm 不通时的备选**（第 2 步）：
- 填 Releases 里下载的 `ds-bot-0.2.0.tgz` 完整路径
- 或 `github:Fei2411/DeepSeek-Bot#v0.2.0&path:/ds-bot`（需要装 Git）

**从源码检出开发**（把插件作为 linked dependency 加进 profile）：
```json
{
  "dependencies": { "ds-bot": "link:/path/to/ds-bot" },
  "dsh": { "profile": { "bundles": ["@deepseek-ai/dsh-base", "@deepseek-ai/dsh-web-app", "ds-bot"] } }
}
```
然后在 profile 目录跑 `pnpm install`，再从 deepseek-harness 仓库启动：
```sh
pnpm -s dsh --profile web --no-open
```

### 5.4 路线 C：Docker 部署（NAS / 常开服务器）

**方式一：根目录 compose（推荐）**

编辑根目录 `docker-compose.yml`：
- 填 `DEEPSEEK_API_KEY`
- 把 NAS 的 IP 加进 `DSH_TRUSTED_HOST`
- 把 `PUID` / `PGID` 设成共享目录所有者的 ID

```sh
docker compose up -d --build
docker compose logs ds-bot
```

日志里会打印一行：
```
dsh web: http://127.0.0.1:3080/?token=*** (LAN: http://172.x.x.x:3080/?token=***
```

**注意端口**：打印的是**容器内**的端口，你要用 `ports:` 里映射的**宿主机端口**（根目录 compose 默认 **13080**）。第一次打开用 `http://<NAS IP>:13080/?token=***`，token 会设成一个签名 cookie（有效期 30 天），之后直接访问 `http://<NAS IP>:13080/` 就行。

**方式二：docker/ 目录下的 .env 方式**
```sh
cd docker
cp .env.example .env
# 编辑 .env：DEEPSEEK_API_KEY、DSH_TRUSTED_HOST、PUID/PGID
docker compose up -d --build
```
这个方式默认发布**宿主机端口 3080**。**两种方式选一种，别同时跑在同一个数据目录上。**

**预构建镜像（GHCR）**：
```yaml
services:
  ds-bot:
    image: ghcr.io/fei2411/deepseek-bot:dev
    ports:
      - "13080:3080"
    environment:
      DEEPSEEK_API_KEY: ""
      PUID: "1000"
      PGID: "1000"
      DSH_TRUSTED_HOST: "localhost,127.0.0.1"
    volumes:
      - ./data:/data
      - ./workspace:/workspace
    extra_hosts:
      - "host.docker.internal:host-gateway"
    restart: unless-stopped
    stop_grace_period: 15s
```

**⚠️ Docker 部署的安全警告（务必读）**：

> DSH 自己的内核沙箱（bubblewrap / Landlock）**在 Docker 默认 seccomp profile 下或大多数 NAS 内核上跑不起来**。所以镜像只提供**一个权限预设：完全权限**——每个 Bot 的命令都直接执行，不询问。
>
> **所以：只把 Bot 需要改动的目录挂进 `/workspace`。容器能看到的其他一切，Bot 都能改。**

**HTTPS 强烈建议但不强制**：UI 在纯 HTTP 下能跑，但那个页面**不是安全上下文**——你输入的 API key 和密钥值会**明文穿过局域网**。日常使用请在前面放个反向代理。

### 5.5 配置详解

插件选项在 profile 的 `cordis.patch.yml` 的 `bot` 条目下，**全部可选**：

```yaml
- id: bot
  name: ds-bot
  config:
    workspace: /path/to/workspace   # Bot 干活的地方；默认 <home>/workspace
    home: /path/to/bot-data         # 团队数据存放处；默认 $DSH_HOME/bot
    checkRatio: 0.8                 # 管家判断的上下文占比
    browser: true                   # 强制开关 Bot 浏览器；默认只在 Desktop 开
    memory: true                    # false 关闭记忆：没有记忆工具、板块和面板
    memoryReview: true              # false 则记忆完全交给 Bot 自己的 remember 调用
    diagnosticsFile: false          # 错误日志只留在内存；默认 <home>/logs/diagnostics.jsonl
    updateCheck: true               # 窗口打开时检查新版本；默认 true
    updateRegistry: https://registry.example/   # 只向这个 npm registry 查更新
    github: false                   # 隐藏 GitHub 连接器；默认在 Connectors 里显示
```

**关于 `contextWindow`**：务必给每个模型填上 `contextWindow`。

> 可用窗口 = 窗口 − 回复预留（`maxTokens`）
> 硬线 = 可用窗口 × 0.95
> 检查线 = 可用窗口 × `checkRatio`（默认 0.8）
>
> 没填 `contextWindow` 的模型会拿到适配器默认值（`llm-pi-ai` 是 262,144），**这个值对该模型可能是错的**。完全没声明窗口的按 500,000 算。

**自定义模型端点**（OpenAI 兼容中转等），在首次启动前创建 `DATA_DIR/cordis.patch.yml`：
```yaml
- id: llm-pi-ai
  config:
    providers:
      relay:
        apiKeyEnv: RELAY_API_KEY
        api: openai-completions          # 或 openai-responses / anthropic-messages
        baseURL: http://host.docker.internal:3425/v1
        models:
          - id: my-model
            contextWindow: 131072
            maxTokens: 8192
- id: agent-default-model
  config:
    provider: relay
    model: my-model
```
然后在 compose 的 `environment` 里加 `RELAY_API_KEY`。

### 5.6 从源码开发

需要 Node 24、pnpm，以及一份装好依赖的 deepseek-harness 检出，放在本仓库旁边（`../deepseek-harness`，或设 `DSH_HARNESS`）。Desktop 测试台还需要 `xvfb-run` 和 `ffmpeg`。

```sh
npm ci                                   # esbuild，仅客户端构建
npm run harness                          # 仅一次：安装测试和 linter 用的 DSH 包
npm run build                            # src/client → client.js
npm test                                 # 单元测试
npm run lint                             # oxlint
```

**测试台**：
```sh
dev/bench.sh dev 3100 8800 start         # Web 测试台：mock 模型 + dsh Web
dev/desktop-linux/desktop.sh dev start   # Desktop 测试台（Xvfb）
dev/check.sh                             # 全部检查
```

**完整检查项**：`unit`、`build`、`lint`、`smoke`、`web`（侧栏、聊天、群、Bot 设置等截图）、`desktop`。首次下载后约 3 分钟。

**端口**：每个脚本都接受 `SLOT=n`（0-9，默认 0），Web 测试台 `31n0`、mock `88n0`，避免多人同机冲突。

**改完 `src/client/` 之后必须 `npm run build`**（`client.js` 是提交进仓库的产物，`npm test` 会检查它是否过期）。改完 `index.js` 或 `src/host/` 之后重启 dsh。

### 5.7 典型使用流程

```
1. 打开 DS Bot → 出现 Chief（Main Bot）
2. 跟 Chief 说清楚你的工作方式
3. 让 Chief 建专职 Bot：
   "建一个叫 Reviewer 的 Bot，角色是审校，
    负责检查我的文档逻辑是否自洽"
4. 建群聊，让多个 Bot 协作：
   "建一个群叫 写作组，成员是 Chief、Writer、Reviewer"
5. 在群里 @ 点名，或直接跟 Main Bot 说，让它调度
6. 需要密钥时，Bot 会弹卡片，你在卡片里填，它永远看不到
7. 用设置 → Usage 看 token 消耗
```

### 5.8 数据与备份

数据在 `config.home`，未配置则 `$DSH_HOME/bot`，再默认 `~/.dsh/bot/`（Windows 是 `C:\Users\<user>\.dsh\bot\`）。

| 文件 | 内容 |
|---|---|
| `state.json` | 团队：Bot、群、Bot 间消息、偏好、待答问题 |
| `group-lines/` | 长群行，每行一个文件 |
| `chat-index.sqlite` | 旧聊天全文索引（`read_own_chat`）；删了会重建 |
| `usage.sqlite` | 用量统计；删了从日志重建 |
| `memory/` | 记忆：`bots/<id>/`、`groups/<id>/`、`team/`，`journal.jsonl`、`archive/` |
| `secrets.json` | 密钥。**当密码对待** |
| `logs/diagnostics.jsonl` | 最近的错误和警告（已脱敏） |

**聊天本身不在 `bot/` 里**，在 `~/.dsh/sessions/`。

**备份步骤**：
1. **完全退出 DSH**（Web 服务和 Desktop 都要关），保证 `state.json` 是最新的
2. 复制整个 `~/.dsh/`（至少 `bot/`、`sessions/`、`storages/`）
3. **只复制 `bot/` 会丢聊天**
4. 恢复：退出 DSH，把文件夹放回原处，再启动

**换电脑**：路径相同的话直接复制。路径不同（比如用户名变了）**尚未测试** DSH 能否找到旧的 Session。

**Web 和 Desktop 同时开**：默认共用同一个 `~/.dsh`。先加载团队的 DSH 拿到 `bot/state.lock`，另一个变成**只读**——它能看到团队并跟随文件变化，但拒绝修改（报 `bot/read-only`）。想让两边都能改，给其中一个设不同的 `DSH_HOME`。

---

## 六、常见问题排查

### Q1：DS Bot 加载不了，日志报 `disabling profile plugin row "bot"`

```
dsh: disabling profile plugin row "bot": its declared peer dependencies cannot be validated: Cannot read properties of undefined (reading 'startsWith')
```

**原因**：DSH 加载插件前会检查 profile 的每一行。这条消息说明有一行 id 是 `bot` 但没有 package name。DS Bot 加的行 name 是 `ds-bot`，所以**多半是 profile 目录里某个文件留了一行没有 name 的 `- id: bot`**（比如一个不再匹配的 `cordis.patch.yml` 覆盖）。

**解决**：
1. 退出 DSH
2. 打开 profile 目录的 `cordis.patch.yml`（`~/.dsh/profiles/web/`，Windows 是 `C:\Users\<user>\.dsh\profiles\web\`；Desktop 用 `profiles/desktop/`）
3. 找到没有 `name: ds-bot` 的 `- id: bot` 行，删掉它。**先备份文件**
4. 检查同目录 `package.json` 的 `dependencies` 里有没有 `ds-bot`，没有就重新加：
   ```sh
   npx @deepseek-ai/dsh@0.2.1-rc.2 plugin --profile web add ds-bot
   ```
5. 重启 DSH

**排查来源**：
```sh
npx @deepseek-ai/dsh@0.2.1-rc.2 --profile web --dump-config
```
它会打印每一行插件及其来源文件。

> 删掉整个 profile 目录也能修好，但那会连其他插件和设置（如模型配置）一起删掉。Bot 团队在 `~/.dsh/bot/`，不受影响。

### Q2：关掉 "web-search-auto" 后，所有会话的搜索都失效

```
Error: configured web provider "auto" is not registered
```
错误码 `WEB_PROVIDER_CONFIGURED_MISSING`。

**原因**：DS Bot 的 `cordis.patch.yml` 无论 `web-search-auto` 开不开，都把 `web` 行的 `searchProvider` 设成 `auto`，而 DSH 在指定的 provider 没注册时**不会回退**。

**解决**：在 profile 的 `cordis.patch.yml` 里加一个 `web` 行（**这行会替换掉 `web` 行的整个 config，所以 `fetchProvider` 要保留**）：
```yaml
- id: web-search-auto
  name: ds-bot/web-search
  disabled: true
- id: web
  name: '@deepseek-ai/dsh-web'
  config:
    searchProvider: deepseek-official
    fetchProvider: http
```

### Q3：`@Name` 在消息还没发出去时显示成文件图标

**原因**：DeepSeek Harness 自己画这些等待行，并且把 `@` 读到下一个空格为止。插件目前改不了它的画法。

**不影响谁回答**：DS Bot 用自己的规则读 `@Name`，被点名的 Bot 会被叫到。消息发出后就正常显示。

**绕过**：名字后面加个空格（`@Anvil 你看下`）。

### Q4：从旧 `dsh-bot` 包升级

早期构建用的包名是 `dsh-bot`。**先把 `dsh-bot` 从 profile 移除，再加 `ds-bot`**——两个包都用 `bot` 这个插件 id。

团队、聊天和密钥会留在原处；保存的浏览器设置、主题和 Bot 颜色会在 DS Bot 首次打开时迁移。

---

## 七、结语：这个项目在提醒我们什么

看完这个项目，我最强烈的感受不是"这个项目好"，而是：

**多 Agent 系统真正难的地方，从来不是"怎么让它们并行"，而是"怎么让它们在长时间里保持一致"。**

一致性的敌人有三个：

1. **上下文漂移**——聊久了忘了目标
2. **状态不一致**——不知道别人在干什么
3. **协作失序**——重复劳动、绕圈、结果丢失

DS Bot 对这三条各有明确对策：**上下文管家**治漂移，**状态一等公民**治不一致，**派活树**治失序。

而所有这些对策背后，是同一个设计哲学：

> **不要用计数器限制行为，要用结构约束行为。**

删掉 6 跳截断、10 条未读上限、3 轮上限、40 条上限，新增的唯一约束是"不要发给正在等结果的 Bot"。**净约束减少，可靠性提升。** 这是只有真正想清楚了系统结构的人才能做出的决定。

还有一点：

> **"如果 DSH 中缺少某项能力，停下来并说明；不要用打补丁的方式绕过去。"**

在一个普遍倾向于"能跑就行、先绕过再说"的开源生态里，把这句话写进硬性规则并且贯彻到桌面应用的架构决策里，是需要一点底气的。

**项目地址**：<https://github.com/Fei2411/DeepSeek-Bot>
（本文分析的仓库原为 `FeiZhuLulu/DeepSeek-Bot`，现重定向至 `Fei2411/DeepSeek-Bot`）

---

**本文完整的英文文档中文翻译已同步整理，共四篇：**

| 文档 | 中文翻译 |
|---|---|
| `ds-bot/README.md`（插件完整功能文档） | `ds-bot-README.zh.md` |
| `docker/README.md`（Docker 部署） | `docker-README.zh.md` |
| `AGENTS.md`（AI 编码代理协作规则） | `AGENTS.zh.md` |
| `app/README.md`（桌面应用） | `app-README.zh.md` |

项目自带的中文文档：`README.zh.md`、`CONTRIBUTING.zh.md`、`docs/vision.zh.md`、`docs/known-issues.zh.md`，以及 `docs/plans/` 下全部 11 篇设计稿（本来就是中文写的）。

---

以上，既然看到这里了，如果觉得不错，随手点个赞、在看、转发三连吧，如果想第一时间收到推送，也可以给我个星标，谢谢你看我的文章，我们，下次再见。

首发于微信公众号「瑞哥观势」。
