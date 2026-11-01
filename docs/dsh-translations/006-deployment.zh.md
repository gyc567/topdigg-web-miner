---
title: "006 部署"
description: "dsh-superagent 的安装、配置、账号隔离、启动停止、升级与故障排查指南。"
source: "dsh-superagent-prototype"
source_file: "docs/006-deployment.md"
---

# 006 部署

本指南用于安装、配置和运行 dsh-superagent。它涵盖账号、启动检查、升级与故障排查，建立在 [001 领域模型](001-domain.md) 至 [005 面板](005-panel.md) 的基础之上。

## 运行什么

- **一个专用的 DeepSeek Harness 配置文件**，在本指南中称为 `superagent`。从 Web 配置文件模板创建它。它加载该插件包，并在 `127.0.0.1` 上提供其面板。将其与你日常使用的配置文件分开：插件会修改进程级的 `PATH` 和 git 设置，而它的进程需要独立重启与升级。
- **一个智能体 GitHub 账号。** 智能体以该账号身份发表评论、推送分支并发起拉取请求，通过一个仅以该账号登录的 GitHub CLI 进行。
- **可选：** 一个用于接收聊天请求的飞书机器人。

插件配置保存状态目录与机器限制。其他所有内容都使用面板：来源用于仓库和账号，策略用于允许列表，执行用于执行者目录和命令。

### 权限与隔离

该插件包为执行者定义了 `dsh-superagent-worker`，为主会话定义了 `dsh-superagent-router`。它们出现在 DeepSeek Harness 预设列表中，但仅供 dsh-superagent 使用。不要为个人会话选择它们，也不要禁用其配置行。应用需要它们来创建和恢复会话。

在 Web 界面中打开一个空的受管会话，可能会选中该配置文件的默认预设。dsh-superagent 会在第一轮对话之前恢复其角色专属预设。

两个预设都以操作者的操作系统用户身份并以 `danger-full-access` 运行，并从已订阅的会话线程读取消息。账号包装器默认选择智能体的凭据；它们并不隔离进程。执行者可以按路径执行程序，并读取操作者的主目录。若需隔离，请使用仅包含智能体凭据的专用操作系统账号。

## 前置条件

- Node.js 22.19+ 或 24+、pnpm、git 2.32+、Python 3.8+ 与 tmux
- GitHub CLI（`gh`）2.48 或更高版本。来源 CLI 字段必须指向 `gh` 或 `lark-cli` 包装器；主机依赖它们的子命令和输出格式。
- github.com 上的一个仓库；不支持 GitHub Enterprise Server。若要为每个工单创建一个检出，请保留一个本地克隆，使准备命令能够基于它添加工作树。如果该仓库使用 Git LFS，请安装 `git-lfs`。
- 为 DeepSeek Harness 配置好的模型提供商。除非评估或执行设置指定了其他模型，dsh-superagent 使用该配置文件的默认模型。
- 对于飞书：`lark-cli`（在 1.0.90 上测试通过）以及一个带机器人的飞书或 Lark 应用

## 账号

### 智能体 GitHub 账号

1. 为智能体创建一个 GitHub 用户账号，并授予其对仓库的写权限。GitHub App 不能充当智能体，因为 dsh-superagent 会读取该账号的通知。
2. 为其提供一个只使用自身凭据的 GitHub CLI：

   ```sh
   mkdir -p ~/.local/bin
   cat > ~/.local/bin/gh-agent <<'EOF'
   #!/bin/sh
   GH_CONFIG_DIR="$HOME/.config/gh-agent" exec gh "$@"
   EOF
   chmod +x ~/.local/bin/gh-agent
   gh-agent auth login
   gh-agent api user --jq .login
   ```

   以智能体账号登录；最后一条命令会打印其登录名。dsh-superagent 也以同样方式读取该登录名。

### 飞书机器人（可选）

1. 创建一个带机器人能力的自建应用。为其授予接收消息事件、读取与发送聊天消息、读取群成员等权限，然后发布应用版本。
2. 为机器人提供其专属的 `lark-cli` 配置，限制为机器人身份，并添加一个包装器：

   ```sh
   LARKSUITE_CLI_CONFIG_DIR="$HOME/.lark-cli-dsh-superagent" lark-cli config init --app-id <cli_…> --app-secret-stdin
   LARKSUITE_CLI_CONFIG_DIR="$HOME/.lark-cli-dsh-superagent" lark-cli config strict-mode bot --global
   cat > ~/.local/bin/lark-bot <<'EOF'
   #!/bin/sh
   export LARKSUITE_CLI_CONFIG_DIR="$HOME/.lark-cli-dsh-superagent"
   exec lark-cli "$@"
   EOF
   chmod +x ~/.local/bin/lark-bot
   ```

   第一条命令从标准输入读取应用密钥。请使用独立的配置目录：`lark-cli` 每个 app id 只允许一个配置文件配置，而你的个人配置中可能已经为该应用包含了一个用户登录。

   主机拒绝可以以用户身份行事的 CLI。它从机器人配置中读取 app id、飞书/Lark 品牌以及机器人 `open_id`。

   两份配置共享同一份应用密钥的钥匙串条目。若只想移除机器人配置，请删除其目录；不要运行 `lark-cli config remove`，那会影响共享的密钥。

## 安装

在还没有 `superagent` 配置文件的机器上，运行以下代码块一次：

```sh
npm install -g @deepseek-ai/dsh@0.2.1-rc.3
git clone <this repository> dsh-superagent && cd dsh-superagent
pnpm install && pnpm build
dsh superagent --from-default-profile web --dump-config > /dev/null
dsh plugin --profile superagent add "link:$PWD"
```

上面固定的那个版本是公开的；其他版本必须满足 `package.json` 中的 `engines.dsh`。

第四条命令会基于 DeepSeek Harness Web 模板创建 `~/.dsh/profiles/superagent`。第五条命令安装该插件包。设置 `DSH_HOME` 可以重新定位默认的 `~/.dsh` 目录。

仅在新安装时运行创建配置文件的命令。如果该配置文件已存在，运行该命令会替换它并删除其 `cordis.patch.yml`，包括机器配置。升级时不要使用它。

## 机器配置

将 [examples/profile.cordis.patch.yml](../examples/profile.cordis.patch.yml) 复制到 `~/.dsh/profiles/superagent/cordis.patch.yml`，替换该文件，并把每一个 `<placeholder>` 都替换掉。对于飞书，还需在其中启用 `dsh-superagent-feishu` 条目。`webserver` 条目设置面板端口。

| 键 | 必填 | 含义 |
| --- | --- | --- |
| `stateDir` | 是 | 绝对路径：数据库、锁、`worker-bin` 中的命令垫片、智能体的 git 配置，以及默认情况下 `work` 中的工单目录。升级前请备份 |
| `promptMaxChars`、`admissionContextMaxPages`、`admissionContextTimeoutMs` | 否 | 所保存的提示词配置的最大长度，以及一次评估在多长时间内读取多少个会话线程页面 |

首次启动后，可在 **设置 → 部署** 或 DeepSeek Harness 插件管理器中编辑机器限制。更改无需重启即可生效。`stateDir` 无法在那里更改。无效值或未知配置键会阻止启动；日志会指出是哪个键。

## 启动与停止

```sh
scripts/dsh-superagent start
scripts/dsh-superagent status
```

`start` 在 tmux 会话 `dsh-superagent` 中运行 `dsh --profile superagent`，对于其他配置文件则为 `dsh-<profile>`。它最多等待一分钟，等待运行时准备好或报告配置要求。在首次运行时，它会打印缺失的配置信息。它拒绝重复实例，包括通过本脚本之外启动的实例。

`stop` 与 `restart` 请求优雅关闭，并最多等待执行者五分钟。它们绝不强制杀死进程，也不触碰其他 tmux 会话。

`status` 打印进程 id、健康状况与配置问题。对于其他配置文件或端口，使用 `--profile` 与 `--url`，或设置 `DSH_SUPERAGENT_PROFILE` 与 `DSH_SUPERAGENT_URL`。

`status`、`start` 与 `restart` 以以下四种代码之一退出：

| 代码 | 含义 |
| --- | --- |
| 0 | 服务正常运行 |
| 1 | 服务未运行、运行了两次、无响应，或其运行时报告错误；重启可能修复它 |
| 2 | 服务在运行，但运行时以外的某一部分（如某个来源或某次策略同步（`sync:<source id>`））报告错误；重启无法修复它 |
| 3 | 服务在运行并等待配置；重启无法修复它 |

仍在启动中的来源算作正常运行。配置无法检查的飞书机器人同样如此。

`status` 在 `errors` 下返回失败的各部分及其详情，在 `setup` 下返回配置要求。`start` 与 `restart` 会把这些问题按行打印；如果服务始终未能启动，它们以 1 退出。只有有意执行的 `stop` 才会暂停自动恢复。

每个配置文件在 `.artifacts/` 下保存日志与控制文件：

- 启动日志：`dsh-superagent-<profile>-<date>-<time>-<pid>.log`，其中 pid 属于该脚本。保留最新 20 个。
- 控制文件：`control/profiles/<profile>/`，包含停止标记、锁与进程 id。

打开日志中打印的 URL，然后在侧边栏中选择 **Superagent**。

### 每小时检查

请在你平时使用的 DeepSeek Harness 配置文件中创建每小时检查，而不是在 `superagent` 中创建。它必须在智能体服务停止时仍持续运行。请求该配置文件中的一个智能体使用以下提示词创建每小时定时任务，并填入检出路径：

```text
Check dsh-superagent: run `scripts/dsh-superagent --profile superagent status` in <checkout>. Exit 0: do nothing and say nothing. Exit 2: do not restart; tell me each part under `errors` with its detail, unless you already told me about the same ones. Exit 3: do not restart; tell me what `setup` says setup needs, unless you already told me. If it reports manually_stopped: true, leave it stopped. Otherwise (exit 1) run `scripts/dsh-superagent --profile superagent --respect-stop restart`, which exits the same way: 0 means it recovered, so say nothing; 2 and 3 are reported as above; if it exits 1 or fails otherwise, read the newest .artifacts/dsh-superagent-superagent-*.log and the Troubleshooting section of docs/006-deployment.md, fix what you can, and tell me what was wrong and what you did.
```

`--respect-stop` 会保留有意执行的停止。只有 `stop` 会写入该标记；`start` 会清除它。`restart` 不写入标记，因此该检查可以恢复那些关闭超时的重启。

## 设置

在轮询或工作开始之前，配置必须成功。概览会列出缺失的要求并链接到相应设置。修改一项设置会重新运行配置。如果你在应用之外修复了某个问题（例如 CLI 认证），请选择 **重新检查**。

1. **来源。** 设置 GitHub 仓库（`owner/name`）与智能体 CLI，例如 `/home/me/.local/bin/gh-agent`。请求通常通过智能体账号的通知抵达。新建 Issue 或包含该账号的评论会在下一次轮询时到达；通过编辑已有 Issue 正文来添加提及则不会。请改为发布一条新评论。对于飞书，设置机器人 CLI、会话、每个会话的“全部接收”或“仅提及”模式，以及是否接收私信。
2. **策略。** 两条示例规则可以编辑或删除。在 **对每个来源** 下，添加可以提出工作请求的 GitHub 账号和飞书用户；在某个列表中有人之前，任何请求都无法成为工单。对于飞书，可以选择一个会话作为列表同步来源，在启动时以及点击 **立即同步** 时同步。
3. **执行。** 目录根路径和准备命令。若要为每个工单提供仓库的一个检出：

   ```sh
   git -C /home/me/src/widgets fetch --no-tags "https://github.com/$DSH_SUPERAGENT_GITHUB_REPOSITORY.git" "${DSH_SUPERAGENT_GITHUB_PR_HEAD:-HEAD}:refs/dsh-superagent/$DSH_SUPERAGENT_TICKET" &&
   git -C /home/me/src/widgets worktree add -b "agent/$DSH_SUPERAGENT_NAME" "$DSH_SUPERAGENT_DIR" "refs/dsh-superagent/$DSH_SUPERAGENT_TICKET"
   ```

   将个人 CLI（例如以你自己的账号登录的那个）列为被阻止的命令。
4. **提示词。** 设置团队段落：GitHub 披露行、评审机器人、提交作者以及自动合并条件。

### 管理 API

面板使用一个本地 HTTP API，智能体也可以调用它。`SETUP.md` 用它来保存设置，服务脚本则读取 `GET state`。

向 `http://127.0.0.1:<port>/orchestrator/api/` 发送请求，并带上 `x-orchestrator-request: 1`。主机必须是 `127.0.0.1:<port>` 或 `localhost:<port>`。缺少请求头或 `Origin` 来自其他站点时将收到 403。

API 保存拥有与面板相同的权限。它们可以更改执行环境和配置账号字段，这一点不同于通过主会话工具所做的保存。

智能体可以依赖以下路由与字段。`src/app/api.ts` 中的其他路由服务于面板，并随之变化。

| 请求 | 返回 |
| --- | --- |
| `GET state` | 每个页面都读取的内容：`setup`，其中含 `problem` 与 `feishuProblem`，各为 `null` 或带 `place`、`code`、`values` 与 `detail` 的配置问题，以及配置解决后得到的 `accounts`；`health`，每个部分一条，含义见下文，含 `state`（`starting`、`ready`、`paused` 或 `error`）、`detail` 与 `at`；`load`，即执行者会话的 `running`、工单的 `queued` 与 `maxWorkers`；`paused`；以及 `masterId` |
| `GET settings` | `blocks`：`policy`、`eval` 与 `executor`，各带其 `value` 与 `revision`；`sources`：来源实例，各带 `id`、`kind`、`installed`、其区块的 `value`、`{"enabled": …, "config": {…}}` 与 `revision`，其种类的表单，以及存在时的配置 `problem`；`policyVersion`；以及 `environment`，即执行环境的 `root` 与 `variables` |
| `GET sources` | 每个来源的状态：`state`（`missing`、`off`、`error`、`setup`、`starting`、`paused` 或 `ready`）、其各部分的 `health`、其配置 `problem`、最近一天的 `stats`、该天被 `filtered` 的触发器，以及该天被 `dropped` 的消息，最新丢弃在前，每条包含其 `channel`、`preview`、当它对应某个工单时的 `ticket`（`id` 与 `title`）、存储中存在时的 `thread`，以及 `dropped.at` 与 `dropped.reason`、`channelGone` 或 `channelIgnored` |
| `PUT settings/<block>`，请求体为 `{"value": …, "revision": n}` | 保存一个区块：`saved`、该区块的新 `revision`、`policy_changed` 与 `restarting`。`value` 是完整区块，与 `GET settings` 中的形式相同；缺失的键取其默认值 |
| `POST executor/pause`，请求体为 `{"paused": true}` 或 `false` | 暂停或恢复处理：`paused` |
| `POST setup/check` | 通过重启 dsh-superagent 重新运行配置：`restarting: true`。当配置无需修复时会被拒绝 |
| `POST policy-sync/<source id>` | 立即同步该来源的允许列表：`policy`，即已保存的该来源部分 |
| `GET prompts`、`PUT prompts`，请求体为 `{"config", "baseRevision"}` | 读取提示词配置：`current`，含其 `revision` 与 `config`；`defaults`；`sections`，即会话读取团队段落的顺序；`skillName`，团队技能名称的命名模式；`builtin`，团队技能不可取的名称；以及 `skillPrefix`，会话加载技能名称时使用的前缀。或者保存它：新的 `revision` |
| `POST tickets/<id>/retry`、`POST tickets/<id>/stop` | 与面板一样重试或停止一个工单 |

健康条目按职责分组：

| 条目 | 报告内容 |
| --- | --- |
| `runtime` | 应用本身 |
| `models` | 等待模型预算重试的会话 |
| `evals` | 最近一小时内不可用且之后没有判断或忽略的评估 |
| `assessment`、`launch`、`delivery`、`relay`、`notice`、`reply` | [003 执行](003-execution.md) 中描述的已存储工作；delivery 统计等待中的工作，reply 涵盖频道消息 |
| `worker` | 执行者会话事件处理；在其首次失败后出现 |
| `github`、`feishu`、`history` | 来源轮询、事件与历史恢复 |
| `sync:<source id>` | 允许列表同步 |

拒绝响应带有一个状态码和 `error`，其文本为英文：

- 400：无效值（`issues`，每条带其 `path`）、失败的账号检查（`setup`）、固定形式的拒绝（`code` 与 `values`），或请求体不是 JSON 或过大。
- 404：某个不存在的内容。
- 409：版本过期。
- 500：其他任何情况。

各区块：

- `source:github`、`source:feishu`：`{"enabled": true, "config": {…}}`。GitHub 的配置包含 `repository` 与 `cli`，以及开关 `observeIssues`、`observePulls`、`observeComments` 与 `observeCi`，默认关闭，它们用于接收仓库中的每个新 Issue、新拉取请求和评论以及默认分支的 CI；飞书的配置包含 `cli`、`chats`（形如 `[{"chatId": "oc_…", "name": "…", "listen": "mentions"}]`（或 `"all"`））、`directMessages`，以及 `otherChats`（取 `"none"` 或 `"mentions"`）。
- `policy`：`{"rules": […], "sources": {"github": {"allowed": [{"id": "<login>"}], "bots": [{"id": "dependabot[bot]"}]}, "feishu": {"allowed": [{"id": "ou_…", "name": "…"}], "syncChat": "oc_…", "admission": {"oc_…": {"unlistedAddressed": "explicit"}}}}}`。`bots` 列出其消息可以成为推断候选的机器人。`admission` 行以聊天 id 为键，飞书使用 `other` 或 `direct`，GitHub 使用 `issues`、`pulls`、`comments` 或 `ci`；未设置的单元格取其默认值（参见 [002 授权](002-authorization.md)）。
- `eval`：`mode`、`timeoutSeconds` 与 `model`。
- `executor`：`model`、`maxWorkers`、`directory`、`prepare` 与 `blockedCommands`。处理暂停是独立的设置项 `paused`，由 `POST executor/pause` 设置。

更改仓库或 CLI 时会先运行相应的配置检查。检查失败返回 400，详情在 `setup` 中。成功的账号变更，或在配置待处理期间的任何保存，都会返回 `restarting: true`。应用重启期间 API 暂时不可用。

```sh
api=http://127.0.0.1:3082/orchestrator/api
rev=$(curl -s -H 'x-orchestrator-request: 1' $api/settings | jq '.sources[] | select(.id == "github") | .revision')
curl -s -X PUT -H 'x-orchestrator-request: 1' -H 'content-type: application/json' $api/settings/source:github \
  -d "{\"value\": {\"enabled\": true, \"config\": {\"repository\": \"acme/widgets\", \"cli\": \"$HOME/.local/bin/gh-agent\"}}, \"revision\": $rev}"
```

## 配置检查

配置使用 DeepSeek Harness 子进程服务，与执行者 shell 一样。它会移除名称中包含 KEY、PASSWORD、SECRET 或 TOKEN 的环境变量。

配置验证 GitHub 仓库与智能体的推送权限，写入执行者环境，并检查 git 对 github.com 只使用智能体凭据。飞书配置失败只会禁用飞书来源。

配置写入的进程环境：

- **命令垫片**位于 `<stateDir>/worker-bin`，位于 `PATH` 最前：`gh` 运行智能体的 CLI；`lark-cli` 运行机器人的 CLI；被阻止的命令会失败。垫片在运行目标之前会先把自己的目录从 `PATH` 中移除。
- **git 配置**位于 `<stateDir>/worker-gitconfig`：替换操作者的全局与系统 git 配置。它把智能体 CLI 选为 github.com 的凭据助手，把 GitHub SSH 地址重写为 HTTPS，并定义 Git LFS 过滤器。诸如 HTTP 代理之类的个人 git 设置不再生效。这里不设置提交身份，git 永不提示输入凭据，并且 `GH_TOKEN` 与 `GITHUB_TOKEN` 会被移除。

`worker-bin` 或 `worker-gitconfig` 中若存在 dsh-superagent 未写入的文件，配置就会停止。若某个工单目录位于其自身配置会添加凭据的 git 仓库中，该工单将失败。

## 试一试

从一个允许的 GitHub 账号发起，打开一个 Issue 或发布一条包含 `@<agent login> <request>` 的评论。在一个轮询间隔内（默认一分钟），概览应显示一个工单。智能体会确认该请求，在自己的会话与目录中开展工作，并在原对话中回复。对于飞书，在已配置的会话中提及机器人即可。

## 升级

1. 等待没有执行者正处于一轮对话的中间。
2. 备份 `<stateDir>/orchestrator.sqlite`。
3. 运行 `git pull && pnpm install && pnpm build`。
4. 运行 `scripts/dsh-superagent restart` 并检查其状态。

重启会结束正在进行的指派，并带着恢复说明启动替代者。团队文本与被覆盖的提示词部分会被保留；未被覆盖的部分则遵循新的默认值。升级后请检查标记为 **默认内容已更新** 的部分。

由更新版本迁移过的数据库无法被旧版本打开。因此回滚需要升级前的备份。升级 DeepSeek Harness 本身之后，重启正在运行的实例，使面板加载匹配的资源文件。

### 智能体预设

执行者与路由器预设在 5 秒后把 shell 命令转入后台。会话没有其预设无法加载。在其会话仍在使用时，请在 `cordis.patch.yml` 中保留 `dsh-superagent-worker` 与 `dsh-superagent-router` 两行；否则恢复会以 `agent-preset/not-found` 失败。

## 故障排查

配置问题会以面板的语言显示在概览上，并附有修复链接；日志与 API 会显示下面的英文文本。

| 症状 | 原因与修复 |
| --- | --- |
| `The agent GitHub CLI is not set.` | 在 GitHub 卡片上设置智能体的 CLI |
| `The agent GitHub CLI was not found.` | 设置包装器的绝对路径，或 `PATH` 上的命令名 |
| `The agent GitHub CLI cannot read its account` | 用 `auth login` 登录该包装器 |
| `@… cannot read …` 或 `@… cannot push to …` | 给智能体账号授予仓库的写权限 |
| `The GitHub Source names no repository.` | 在 GitHub 卡片上设置仓库 `owner/name` |
| 工单失败并提示 `The prepare command failed: …` | 输出中会指出原因，例如克隆路径有误；修复命令，然后重试该工单 |
| `git does not read the github.com credential configuration dsh-superagent writes` | 安装 git 2.32 或更高版本 |
| 工单失败并提示 `The git configuration of the repository in … sets …` | 从克隆的 `.git/config` 中移除所指定的凭据或 `http.*.extraheader` 设置 |
| `… was not written by dsh-superagent` | 把所指定的文件移出 `<stateDir>/worker-bin` 或 `<stateDir>/worker-gitconfig`，或换一个 `stateDir` |
| `The bot lark-cli allows user identities` | 如上文“飞书机器人”所示，把飞书来源指向仅限机器人的配置 |
| `The bot lark-cli does not work.` 或 `The bot identity of app … is …` | 检查配置中的 app id 与密钥 |
| `The Feishu bot is not a member of the chat.` | 在会话的设置中把机器人加入该会话；下一次尝试即可成功 |
| `status` 退出码为 2 | 某个部分报告错误，重启无法修复：`errors` 会像管理 API 中所列那样指出每个部分及其详情；每个部分恢复正常后会自行清除其条目 |
| `status` 退出码为 3 | 配置仍在等待：`setup` 说明缺少什么，概览会链接到可以修复它的设置 |
| `status` 退出码为 1 | 服务未运行、运行了两次、无响应，或其运行时报告错误；输出与最新日志会说明是哪种情况 |
| `… timed out after 90 s`、`… was stopped by …`、`… exited with code …` 或 `… could not run: …` | 某个 CLI 失败却没有打印原因；以操作者的用户身份手动运行所指出的程序，以查看它自己的报错信息 |
| 面板提示 dsh-superagent 没有响应 | 它正在重启，或因配置问题未能启动；DeepSeek Harness 日志会指出原因 |
| `dsh-superagent configuration has keys it does not use`（日志） | 移除所指定的键；该消息会说明每个值现在位于何处 |
| 日志称插件与正在运行的 dsh 不兼容 | 安装处于 `engines.dsh` 范围内的 DeepSeek Harness 版本 |
| DeepSeek Harness 升级后面板显示 "Failed to load plugins" | 重启正在运行的实例 |
| 提及之后没有任何反应 | 检查作者是否在该来源的允许列表上、该来源是否已开启，以及处理是否被暂停。在 GitHub 上，通过编辑 Issue 正文添加的提及不会被接收；请在评论中提及智能体 |
