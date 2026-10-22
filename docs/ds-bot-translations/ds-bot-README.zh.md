> 译自 DeepSeek-Bot 仓库的 `ds-bot/README.md`（原文：<https://github.com/Fei2411/DeepSeek-Bot/blob/main/ds-bot/README.md>）

# ds-bot

面向 [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness)（dsh）的 DS Bot 插件。它把 dsh 变成一队长期驻留的 Bot，与你对话、彼此对话，并在群聊中协作。概览、安装步骤和截图见[项目主页](../README.md)。

> 早期版本（v0.1）。功能、工具和已保存数据的格式仍可能变化。

已在 dsh `0.2.1-rc.2`（Web）和 `0.2.0-rc.2`（Web 与 Desktop）上测试。

## 功能

- **长期驻留的 Bot**：每个 Bot 都是「DS Bot」工作区中的一个 dsh 会话，有自己的名称、角色、指令和模型。
- **工作文件夹**：Bot 可以在你指定的文件夹中工作，而不是团队工作区；群聊也可以为其中所有成员设置同一个文件夹。你可以在 Bot 的设置或详情面板中、在群组的设置中选择它，或直接让某个 Bot 来做（`update_bot`、`update_group`）。更改之后，聊天会在一个新片段中继续，该片段从新文件夹开始。当 Bot 在团队工作区之外设置文件夹，或把某个 Bot 加入一个在其中工作的群组时，若这些 Bot 只能在自己的文件夹中写入，它会请求你的批准。存放 dsh 数据的文件夹（`$DSH_HOME`、团队数据）会被拒绝。团队工作区本身在 Settings > General > Locations 中迁移；在那里工作的 Bot 和群组会在新文件夹的新片段中继续，旧文件夹保留其文件。
- **权限预设**：每个 Bot 都以自己的 dsh 权限预设运行（只读、工作区或完全访问），在其详情面板中设置。群聊可以在那里用同一个预设运行其所有成员，取代他们各自的预设：在群组设置的 Permissions 中打开 **Same for every member**。只有你能设置权限；Bot 不能更改权限。
- **Bot 协同工作**：`message_bot` 向另一个 Bot 发送消息，`create_bot` 和 `update_bot` 添加并设置 Bot（包括从本地图片文件或 data URL 设置头像），`ask_user` 向你提问且不阻塞其他 Bot。`show_view` 在 Bot 自己的聊天中绘制一张卡片——文本、指标、表格、进度、选项、确认和短表单；交互式卡片会等待你的回答。
- **群聊**：成员一次只发言一个，每个成员都先读取最新的消息。消息中可以用 `@Name` 提及某成员以把发言权交给它；输入 `@` 可从列表中挑选。**+ → Reference a chat** 会把另一个 Bot 的聊天作为上下文加入消息，在群聊中回答的成员也会得到它。没有新内容可补充的成员保持沉默（`[PASS]`）。每个成员在每个群组中都有自己的隐藏会话，因此群组绝不会读到某个 Bot 的私密聊天。
- **角色与权限**：

  | 谁 | 可以做什么 |
  |---|---|
  | 你 | 一切 |
  | Main Bot（可以有多个） | 管理所有群组；修改和删除 Bot |
  | 群管理员 | 仅管理自己的群组（名称、公告、成员、回复模式） |
  | 成员 | 在群组中发言、`@` 另一个成员，并从外部向自己的群组发帖 |

- **长聊天保持在模型窗口之内**：dsh 自带的压缩绝不会作用于 Bot 的会话。当一个回合越过检查线（模型上下文窗口的一个占比）时结束，会进行一次独立的小型模型调用，即上下文管家，它读取聊天的最新消息并一次性做出决定。如果工作仍在进行，聊天会在原地被压缩为一个检查点：一份交接摘要加上你近期消息的原文。如果工作已到达停歇点，Bot 会写一份交接笔记并在一个新片段中继续。无论哪种情况，你看到的仍是一个聊天，没有任何标记。早先的片段和被压缩的消息仍可通过全文索引（`node:sqlite` FTS5）用 `read_own_chat` 检索。
- **记忆**：每个 Bot 在它所有对话中保留笔记，每个群聊为自己的成员保留一份，团队还共享一份。见[记忆](#记忆)。
- **网页搜索**：见[网页搜索](#网页搜索)。
- **Bot 浏览器（仅 dsh Desktop）**：见[Bot 浏览器](#bot-浏览器)。
- **图片**：对于无法读取图片的模型，先由一个视觉模型把图片转成文本。
- **密钥**：Bot 通过自己聊天中的卡片索要 API key 或 token，永远看不到该值。见[密钥](#密钥)。
- **用量**：Settings → Usage 按时间（24 小时到 12 个月，或在日历上挑选的若干天）、按 Bot、按模型显示 token 用量，每个 Bot 和每个模型各有一页。会话记录下来的调用是从日志中读取的，因此较老的聊天也计入。没有留下日志的调用（检查点、交接笔记、管家、图片读取、dsh 标题和压缩）则是在其流式过程中从插件运行时起计数的。只统计 token，不计费用。
- **个性化**：为每个 Bot 设置名称、角色、指令、模型和外观（20 个字符和 12 种颜色，或你自己的照片）；为团队设置主题、强调色和头像动画级别（安静、普通或活泼）。被置顶的 Bot 或群聊会在侧边栏显示一个小图钉图标。Settings 中有以下页面：General（外观）、Bots（Main Bot 与每个 Bot 的设置）、Group chats（每个群组的设置）、Connectors、Capabilities、Scheduled tasks、Usage、Secrets、Feedback 和 About DS Bot（版本、更新和链接）。

## 安装

[项目主页](../README.md#install) 有 dsh Desktop 和 dsh Web 的完整步骤。简言之：

- dsh Desktop：Settings → Plugins → 添加 `ds-bot`（npm）、一个 `.tgz` 文件，或 `github:Fei2411/DeepSeek-Bot#v0.1.7&path:/ds-bot`。
- 命令行：`dsh plugin --profile desktop add ds-bot`（或 `--profile web`）。

若要从检出中开发该插件，把它作为链接依赖和 bundle 加进一个 dsh profile：

```json
{
  "dependencies": { "ds-bot": "link:/path/to/ds-bot" },
  "dsh": { "profile": { "bundles": ["@deepseek-ai/dsh-base", "@deepseek-ai/dsh-web-app", "ds-bot"] } }
}
```

在 profile 文件夹中运行 `pnpm install`，然后从 deepseek-harness 仓库启动 dsh：

```sh
pnpm -s dsh --profile web --no-open
```

团队首次打开时，插件会创建一个名为 Chief 的 Main Bot。

**从旧版 `dsh-bot` 包升级**：早期构建使用的包名是 `dsh-bot`。在添加 `ds-bot` 之前先从 profile 中移除 `dsh-bot`，因为两者使用同一个插件 id `bot`。你的团队、聊天和密钥都留在原处（见[数据与备份](#数据与备份)）；已保存的浏览器设置、主题和 Bot 颜色会在 DS Bot 首次打开时迁移过来。

## 配置

选项放在 profile 的 `cordis.patch.yml` 中，位于 `bot` 条目下。它们全部是可选的。

```yaml
- id: bot
  name: ds-bot
  config:
    workspace: /path/to/workspace   # where the Bots work; default <home>/workspace
    home: /path/to/bot-data         # where the team is saved; default $DSH_HOME/bot
    checkRatio: 0.8                 # share of the model's usable window where the steward decides
    browser: true                   # force the Bot browser on or off; default on in Desktop only
    memory: true                    # false turns memory off: no memory tools, section or panel
    memoryReview: true              # false leaves memory to the Bots' own remember calls
    diagnosticsFile: false          # keep the error log in memory only; default <home>/logs/diagnostics.jsonl
    updateCheck: true               # look for a newer DS Bot when a window opens; default true
    updateRegistry: https://registry.example/   # ask only this npm registry for updates
    github: false                   # hide the GitHub connector; default shown in Connectors
```

**更新**：窗口打开时，DS Bot 会询问它是从哪里安装的，以便查找新版本：npm registry（DSH 插件管理器安装时所用的那个，以及它的回退源），或对于 `github:…#vX.Y.Z` 安装则是最新的 GitHub 发布。有新版本时，侧边栏右上角会显示一个云朵按钮；**Update** 通过 DSH 插件管理器重新安装 DS Bot，新版本从下次启动 DSH 起生效。链接或本地检出永远不会被提供更新。Settings → About DS Bot 显示同样的状态，并有 **Check for updates** 可随时再次询问。

同一张卡片也可以承载 DSH 本身：某个 DS Bot 发布版可能注明它验证过的 DSH 版本（其 `package.json` 中的 `dsBot.verifiedDsh`），并且只提供该版本——运行更新的版本也算一种降级提议。没有注明版本的发布版不提供 DSH 更新。从 npm 安装的 DSH 通过 `npm install -g @deepseek-ai/dsh@<version>` 替换。DSH Desktop 会安装它自己的更新程序找到的最新发布版，因此卡片在那里只在那个发布版正是已验证版本时才显示 DSH，而 **Open updates** 会打开应用的更新面板。某个发布版可能用 `dsBot.minBot` 抬高下限：在 bot 本身还没到那个新版本之前，DSH 那一行会等待。

## 模型

模型提供方通过 dsh 的 `llm-pi-ai` 插件在 `cordis.patch.yml` 中配置。每个 Bot 都运行在 DSH 所提供的某个模型上。新团队的第一个 Main Bot 没有模型：它的聊天会打开一张模型卡片，只有在你选定之后才会向用户问候。Create Bot 表单默认从 DSH 的默认模型开始。Bot 的详情面板和设置（或某个 Main Bot 的 `update_bot`）可以更改它；若某个 Bot 的模型已不再被提供，则会再次显示该卡片。由旧版本保存的团队，会保留每个 Bot 最后运行所用的模型。

- 为每个模型设置 `contextWindow`。DS Bot 从中取其各行：可用窗口 = 窗口减去回复预留（`maxTokens`），硬性上限是该值的 95%，检查线则是该值的 `checkRatio`。没有 `contextWindow` 的模型会得到适配器的默认值（对 `llm-pi-ai` 而言是 262,144 tokens），这对该模型可能并不正确；完全不上报窗口的模型则按 500,000 计算。
- 若要发送图片，提供方需要 `defaultInput: [ text, image ]`。
- 不要把 API key 放进仓库。使用 dsh 自带的密钥存储或环境变量。

## 记忆

Bot 记住那些应当比一次对话更持久的东西：你的偏好、决定、纠正，以及它不该再问一遍的事实。记忆采用 [Agent Memory Repo](https://github.com/AgentMemoryRepo/agentmemoryrepo) 格式的纯 Markdown：每行一条，结尾为 `[source: …; added: …]`。

每个回合结束后，一次记忆审查会读取对话中新增的内容，并自行保留、更新或删除条目，因此记忆不依赖于 Bot 决定是否调用 `remember`。Bot 自己的聊天由它自己的模型审查进它自己的记忆；群聊则由管理员的模型（或第一个成员的模型）为整个群聊审查一次，只写入群组记忆。它只保留你说过的话，用你的语言书写条目，并拒绝密钥、口令和身份证号。

- **三种作用域**：每个 Bot 有自己的记忆；每个群聊有群组记忆，其成员只在该群组中读取它（在自己的聊天中读不到，在其他群组中也读不到）；团队记忆则每个 Bot 都能读。Bot 写自己的记忆，也可以从群组中写它所在群组的记忆。Main Bot 和群管理员（任意群组的）还会写团队记忆；当你提出要求时，Main Bot 可以读取并修改另一个 Bot 的记忆。
- **工具**：`remember` 保存一条目或替换一条（`replace`），`forget` 删除一条，`recall` 搜索所有条目、完整读取某个主题，或列出已保存的内容。在 Bot 自己的聊天中，它们默认使用它自己的记忆；在群聊中则使用群组记忆（用 `scope: "own"` 表示 Bot 自己的记忆）。Bot 会附加来源（一个片段锚点，例如 `part 2 #1234`，`read_own_chat` 可打开它；或群组和时间）以及日期；替他人写入的 Bot 会以 `by:` 标注。
- **文件**：`MEMORY.md` 保存每次对话都需要的内容，细节放在从其 `## Index` 以 `[[topic]]` 链接的主题文件中。
- **在提示词中**：Bot 自己的和团队的 `MEMORY.md` 会进入该 Bot 的系统提示词，在群组会话中则是群组的 `MEMORY.md` 排在它们之后。该部分在会话开始时被冻结，以便提供方的提示词缓存能保持命中；更改会从下个片段或检查点开始生效，而 `recall` 会立刻找到它。
- **固定大小**：一条目最多 300 字符，一个 `MEMORY.md` 4,000，一个主题 16,000，一个作用域 40 个主题。超出上限的保存会失败，并说明如何腾出空间。
- **安全**：记忆是数据，不是指令。看起来像密钥或令牌的条目会被拒绝，Bot 也会被告知不要保存网页、文件或工具结果要求它记住的内容。
- **历史**：文件就地修改，`journal.jsonl` 保留每一次更改及改动前后的那一行。当某个 Bot 或群聊被删除时，它的记忆会移入 `archive/`。

**记忆面板**：Bot 和群聊的详情面板中各有一个 Memory 行，显示条目数量；Manage 打开记忆面板。Bot 的面板显示它自己的记忆和团队记忆；群组的显示群组记忆。

- **记忆摘要**：一个模型用散文从所有条目写出一段简短摘要，使用界面语言：Bot 的用该 Bot 的语言，群组的用管理员的语言。条目变化时会重新写入，⋯ 菜单可以重新生成它。
- **全部条目**：⋯ 菜单按作用域和主题列出每个条目，附上日期、作者以及每个 `MEMORY.md` 的大小。移除需要点两下。
- **询问或更新**：问 Bot 记住了什么，或告诉它要添加、纠正、移除什么。一次模型调用仅依据条目作答，其修改走与工具相同的检查。
- 聊天中的一行提示（"Memory updated"）会在 Bot 改变记忆时显示并打开面板。当记忆在后台变化时，聊天顶部的小胶囊（该 Bot 的，或该群组的）会拉伸一下，显示 "Memory updated"；点击它会打开记忆面板。

只读的 dsh（见[数据与备份](#数据与备份)）可以显示记忆，但无法更改它。

## 网页搜索

该包还包含第二个插件 `ds-bot/web-search`。它注册搜索提供方 `auto`，并由 `cordis.patch.yml` 设为默认。每次搜索按以下顺序进行：

1. 如果 profile 指定了另一个 `searchProvider`，则使用那一个。
2. 当前模型路由自带的搜索，使用该路由的密钥和主机。插件认识 Anthropic Messages、OpenAI Responses 和 Gemini 协议，以及若干搜索 API（Ollama、Kimi、智谱、MiMo）。可用 `searchApis` 添加更多。
3. 不带密钥的回退：Bing 和 DuckDuckGo 的公开结果页。
4. 如果都不行，搜索失败，并告知模型不要猜测地址。

每条结果开头都会有一行 `Search backend: …`，标明它走的路径。

**关闭 `auto`**：当你只关闭 `web-search-auto` 这一行时（在侧边栏的 Plugins 页面，或在 profile 补丁中用 `disabled: true`），`web` 那一行仍然写着 `auto`。于是 `web_search` 在所有会话中（无论是否 Bot）都会失败，错误为 `WEB_PROVIDER_CONFIGURED_MISSING`（`configured web provider "auto" is not registered`）。关闭该行时，还要在 profile 的 `cordis.patch.yml` 中为 `web` 那一行指定另一个 `searchProvider`。该覆盖会替换整行的配置，因此要重新写出 `fetchProvider`：

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

其他插件也可以在 dsh 运行期间、profile 补丁之后设置搜索提供方。关闭这类插件时，请再次检查这项设置。

## Bot 浏览器

在 dsh Desktop 中，Bot 聊天的标题栏上有一个地球图标按钮。它会打开该 Bot 自己的浏览器面板。

- **每个 Bot 一个分区**（`bot:<id>`）：登录状态和 cookie 只属于该 Bot。
- **Bot 可以读取页面**：`read_browser` 工具读取的是页面的 DOM，而不是截图。文本会变成带标题、嵌套列表、表格、代码块和引用的 Markdown。链接和表单控件在原地标记为 `[#n]`，并在下方列出其目标和值。该工具也会读取你选中的文本。长页面分段读取（`from`）。页面内容被视为数据，绝不视为指令。
  - 它会读取开放的 Shadow DOM（含 `<slot>`）以及同源 iframe，最多 3 层深。
  - 它只读取可见内容：`display:none`、`visibility:hidden`、零高度和关闭的 `<details>` 内容会被跳过。
  - 它绝不读取密码、信用卡（`autocomplete="cc-*"`）或一次性验证码字段的值。
  - 限制：400,000 字符、150,000 个节点、每张表 5,000 行、3,000 个链接和控件、1.5 秒。被截断的结果会说明这一点。
  - 它无法读取跨域 iframe（只给出一行地址）、封闭的 shadow root、canvas 内容（在线编辑器、地图）或 CSS `::before` / `::after` 中的文本。在按需渲染的页面上，只读取已渲染的部分。
  - 只读：Bot 目前还不能点击、输入、滚动或打开地址。
- **地址**：仅限 http 和 https。允许 localhost 和 LAN 地址；不允许云元数据地址（如 `169.254.x.x`）和 dsh 自身的端口。
- 浏览器面板和详情抽屉共用右侧栏；打开其中一个会关闭另一个。切换聊天会把面板切换到对应的 Bot。删除 Bot 会清除其浏览器和已保存的地址。

dsh Web 没有浏览器面板，也没有 `read_browser` 工具。

## 密钥

当 Bot 需要 API key、token 或口令时，它调用 `request_secret`，一张密钥卡片会出现在它自己的聊天中。Bot 永远看不到该值。

- **填写**：该输入框会隐藏你输入的内容，不属于任何表单，也不会被自动填充。选择 "All Bots" 或 "Only this Bot"，然后点击 Save。值至少要有 4 个字符（4 位 PIN 码即可）。8 个字符及以上的值在任何出现的地方都会被隐藏；较短的则只在没有字母或数字紧贴它的地方隐藏，这样普通单词不会被破坏。
- **授权**：如果密钥已保存但该 Bot 未被允许使用它，卡片只会询问是否允许。你也可以在那里替换该值。
- **使用**：该值会以 `DSH_SECRET_<NAME>`（bash 中为 `$DSH_SECRET_NAME`，PowerShell 中为 `$env:DSH_SECRET_NAME`）注入 Bot 的 shell 环境。`list_secrets` 列出某个 Bot 可用的名称。MCP 能力也可以在其环境、请求头和 URL（路径或查询串）中使用 `$DSH_SECRET_<NAME>`；在 URL 中该值会做 URL 编码。服务器接受请求头时，请优先使用请求头。
- **掩码**：在工具结果被保存之前、每次请求发给模型之前，密钥值的每一份副本都会被替换为 `[secret:<NAME>]`。
- **管理**：Settings → Secrets 按名称、用途、索要它的 Bot 以及最近使用情况列出每个密钥。你可以更改谁可以使用它、替换其值、删除它或新增一个。删除某个 Bot 会把它从每个密钥中移除。
- **存储**：`<DSH_HOME>/bot/secrets.json`，文件权限 600，原子写入。值绝不会出现在 `state.json` 或日志中。

限制：

- 在 Windows 上，文件权限无效；该文件只受你的用户文件夹保护。
- 只有完全相同的副本才会被掩码。进行编码、拆分或反转的 Bot 仍可能打印出该值。不要把重要密钥交给你不信任的 Bot。
- 在非 HTTPS 的页面上（例如通过 http 在 LAN 上打开的 dsh Web），该值会以明文穿越网络。卡片会警告你。
- 群聊不显示卡片；Bot 会在自己的聊天中索要。

## 数据与备份

插件把数据保存在 `config.home` 中。未设置时，该文件夹为 `$DSH_HOME/bot`，若 `DSH_HOME` 未设置则为 `~/.dsh/bot`。

| 系统 | 默认文件夹 |
|---|---|
| Linux、macOS | `~/.dsh/bot/` |
| Windows | `C:\Users\<user>\.dsh\bot\` |

- 要移动全部 dsh 数据（会话、profile 和插件数据），设置 `DSH_HOME`。
- 要只移动插件数据，在配置中设置 `home`（见[配置](#配置)）。

`bot/` 中的文件：

| 文件 | 内容 |
|---|---|
| `state.json` | 团队：Bot、群组、Bot 之间的消息、偏好和未决问题。较长的消息在此只保留前 2,000 个字符；完整内容在它所属的会话中。 |
| `group-lines/` | 较长的群组消息行，每个成员最多读 20,000 字符，每行一个文件；当其消息行离开群组最近 60 行或群组被删除时移除 |
| `state.lock` | 正在使用该数据的 dsh（pid 和主机）。该 dsh 退出时移除。 |
| `chat-index.sqlite` | 较老聊天片段的全文索引（`read_own_chat`）；删除后会重建 |
| `usage.sqlite` | Usage 页面的 token 计数；删除后会从会话日志重建，仅丢失日志之外的调用和已删除 Bot 的名称 |
| `memory/` | 记忆（见[记忆](#记忆)）：`bots/<id>/`、`groups/<id>/` 和 `team/`（`MEMORY.md` 及主题）、`journal.jsonl`（每一次更改）、`snapshots/`（各会话冻结时的那一部分）、`summaries/`（面板的摘要；可安全删除）、`reviewed.json`（记忆审查已读到何处）和 `archive/`（已删除的 Bot 与群聊） |
| `ocr.json` | 图片文本的缓存；可安全删除 |
| `workspace` | 团队工作区：所有没有自己工作文件夹的 Bot 的工作文件夹（由 `config.workspace` 更改） |
| `secrets.json` | 已保存的密钥。请像对待密码一样对待它的备份。 |
| `logs/diagnostics.jsonl` | 最近的错误和警告，已移除密钥、token、已保存的密钥值和 home 文件夹。超过 1 MB 后会移为 `diagnostics.jsonl.1`。可安全删除。 |

聊天本身是 dsh 会话，不在 `bot/` 中：它们位于 `~/.dsh/sessions/`。dsh 把工作区列表保存在 `~/.dsh/storages/workspace.json`，把 profile（含模型设置）保存在 `~/.dsh/profiles/`。Bot 浏览器的登录状态不保存：Desktop 只在内存中保留每个 Bot 的分区。

**备份与恢复**

1. 完全退出 dsh（Web 服务器和 Desktop 都要退出），使 `state.json` 是最新的。
2. 复制整个 `~/.dsh/`（至少要有 `bot/`、`sessions/` 和 `storages/`）。只复制 `bot/` 会丢失聊天。
3. 恢复时，退出 dsh，把该文件夹放回原处，然后启动 dsh。

**迁移到另一台电脑**：`state.json` 中除你为 Bot 和群组设置的工作文件夹外没有绝对路径，但 dsh 的 `storages/workspace.json` 和会话文件夹名中含有工作区的绝对路径。如果新电脑上的路径相同，复制文件夹即可。如果不同（用户名或系统不同），dsh 能否找到旧会话尚未经过测试。

**同时运行 dsh Web 和 Desktop**：默认两者使用同一个 `~/.dsh`。先加载团队的 dsh 会取得 `bot/state.lock` 并可更改团队。另一个则是只读的：它显示团队并跟踪文件变化，但拒绝更改（`bot/read-only`，"open in another dsh"），其 Bot 也不能启动新会话。当第一个退出后，另一个会在下次请求时接管。若要同时从两者更改团队，给其中一个设置不同的 `DSH_HOME`（成为两个独立的团队）。

## 开发

你需要 Node 24、pnpm，以及一份已安装好依赖的 deepseek-harness 检出，位于本仓库旁边（`../deepseek-harness`，或设置 `DSH_HARNESS`）。Desktop 测试台还需要 `xvfb-run` 和 `ffmpeg`。Web 截图需要 Chrome 或 Chromium（`CHROME_BIN`；默认 `google-chrome` 或 `chromium`）。

```sh
npm ci                                   # esbuild, for the client build
npm run build                            # src/client → client.js
npm test                                 # unit tests
npm run lint                             # oxlint from the dsh repository (.oxlintrc.json)
dev/bench.sh dev 3100 8800 start         # Web test bench: mock model + dsh Web, data in ../.dsh-test-dev
dev/desktop-linux/desktop.sh dev start   # Desktop test bench: mock model + dsh Desktop in Xvfb
CONTEXT_WINDOW=100000 CHECK_RATIO=0.45 dev/bench.sh smoke 3101 8801 reset && node dev/smoke.mjs smoke 3101
dev/check.sh                             # all checks (see below)
```

- `client.js` 由 `src/client/` 构建并提交，因此 `link:` 和 Git 安装都不需要构建。不要手工编辑 `client.js`；`npm test` 会检查它是否与源码一致。改动 `src/client/` 之后，运行 `npm run build` 并重新加载页面。改动 `index.js` 或 `src/host/` 之后，重启 dsh。
- **Web 测试台** `dev/bench.sh <name> <web port> <mock port> [start|stop|reset|status]`：一个脚本化的 mock 模型（`dev/mock-llm.mjs`，不消耗真实 token；它的命令列在文件顶部）和一个 dsh Web 服务器。数据放在 `../.dsh-test-<name>/` 中；`reset` 会先清空团队和会话。带 token 的登录地址在 `../.dsh-test-<name>/web.log` 中。
- **Desktop 测试台** `dev/desktop-linux/desktop.sh <name> [start|stop|reset|status]`：dsh 不在 Linux 上运行 Desktop；`launch.mts` 在 Xvfb 中运行未打包的 Desktop。首次启动会下载 Electron 和一个 Linux 运行时（需要几分钟）。`start` 在团队显示于一个 1400×860 的窗口后返回。
- **全部检查** `dev/check.sh [--skip steps] [--only steps] [--out dir]`：`unit`、`build`、`lint`、`smoke`、`web`（侧边栏、聊天、群组、Bot 设置、Bots 页面和群组设置的截图）以及 `desktop`（同样的截图，然后是 Bot 浏览器检查）。它会停止自己启动的一切。失败时会指出失败的步骤及其日志，并以非零状态退出。首次下载之后，完整运行约需 3 分钟。
- **端口**：每个脚本都接受 `SLOT=n`（0-9，默认 0），这样同一台机器上的多个人或多个会话不会冲突：Web bench `31n0` 与 mock `88n0`，smoke `31n1` 与 `88n1`，Desktop mock `88n2`，等等。一个 Desktop 约占 1 GB 内存；用完后请停掉它。
- **真实模型**（这些会消耗 token）：`dev/steward-eval.mjs` 通过上下文管家自己的提示词把手写的对话结尾发给一个兼容 OpenAI 的路由（或用 `--api messages` 发给兼容 Anthropic Messages 的路由，例如 DeepSeek 官方路由），并检查每个决定。`dev/llm-tap.mjs <port> <upstream base URL> <log.jsonl> [body dir]` 是一个适用于两种格式的日志式透传：把某个提供方的 `baseURL` 指向它，它会为每次调用写一行 JSON（管家、检查点、交接笔记或主回合、Bot 的名称、token 用量、回答，以及该请求与同一 Bot 上一次请求首次出现差异的位置——这正是提供方缓存可以复用的部分；绝不记录请求头）。加上 body 目录时，它还会保存每个请求体。每个文件都在顶部说明其用途。
- **截图**：`dev/ui-shots.mjs` 对两个应用都适用（`desktop <dsh repo> <dir> <renderer port>` 或 `web <dsh repo> <dir> <bench name> <web port>`）。
- `npm test` 从 deepseek-harness 检出加载 `@deepseek-ai/*` 包。

## 目录结构

| 路径 | 用途 |
|---|---|
| `index.js` | 宿主入口：按顺序安装 `src/host/` 中的模块 |
| `src/host/` | 宿主：团队与存储（`roster`、`store`）、工具（`tools`）、回合与投递（`turns`、`delivery`）、群聊（`groups`）、聊天片段、上下文管家与索引（`parts`、`steward`、`chat-index`）、图片文本（`images`）、密钥（`secrets`）、Bot 浏览器（`browser`）、`POST api/bot` 路由（`channel`） |
| `src/client/` | 浏览器源码：侧边栏、聊天标题栏、对话记录单元、面板与对话框、主题、Bot 浏览器面板 |
| `client.js` | 由 `scripts/build-client.mjs`（esbuild）从 `src/client/` 构建；已提交 |
| `web-search.js` | `auto` 搜索提供方；独立于团队代码 |
| `test/` | 单元测试与测试夹具 |
| `dev/characters.mjs` | 把角色形象（描边成轮廓的小型 3D 模型）构建进 `src/client/characters.js` 中的 `CHARACTERS` 表 |
| `dev/` | Mock 模型、测试台、冒烟测试、Desktop 脚本、真实模型工具（管家评估、日志式透传） |

## 许可证

[Apache-2.0](LICENSE)
