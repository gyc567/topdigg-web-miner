---
title: "安装配置"
description: "这是给智能体看的配置说明，它会陪同运维者一起完成 dsh-superagent 的安装、配置与验收。"
source: "dsh-superagent-prototype"
source_file: "SETUP.md"
---

# 安装配置

以下是给智能体的说明，它需要与自己的运维者一起把 dsh-superagent 配置起来。如果你是人，请让你的编码智能体阅读本文件并照做。

## 如何进行配置

配置流程遵循 [docs/000-philosophy.md](docs/000-philosophy.md)：尽可能少占用运维者的注意力。

- **在提出第一个问题之前，**只阅读本文件和 `docs/000-philosophy.md`，并且只运行一次下面的探测命令。在收齐所有答案之前不要读其他任何内容。
- **每条消息只问一个问题，**每次只问一件事。收到答案后再问下一个。探测命令已经回答了的问题就跳过。
- **每条消息控制在 300 词以内，**除非运维者要求更多。每个问题都要给出一个运维者用一个词就能接受的推荐答案，并用一句话说明它为什么重要。
- **提问时不要执行。** 先收齐所有答案，然后发一条包含完整计划的消息，只有在运维者确认之后才执行。
- **绝不要在聊天中索要密钥。** 需要运维者亲自动手的步骤，例如创建账号、登录 CLI、输入应用密钥，应合并到一条消息中，并附上要在其自己终端里运行的确切命令。
- **通过提问来传达理念，**每次一句话，而不是做一场讲座。

## 1. 探测

在本检出目录中运行一次，并自行保留结果：

```sh
node -v; pnpm -v; git --version; tmux -V; python3 --version; gh --version | head -1; dsh --version
gh api user --jq .login
command -v lark-cli
grep -l -E 'id: dsh-superagent\b' "${DSH_HOME:-$HOME/.dsh}"/profiles/*/cordis.patch.yml 2>/dev/null
```

- **前置条件：**Node.js 22.19+ 或 24+、pnpm、git 2.32+、tmux、Python 3.8+、GitHub CLI 2.48+，以及处于 `package.json` 中 `engines.dsh` 版本范围内的 DSH。缺少其中任何一项时，它会变成计划中的一个条目，而不是一个问题。DSH 还需要一个模型供应商；如果运维者从未用模型运行过 DSH，那么配置模型供应商是运维者要做的步骤。
- **运维者登录：**`gh api user` 的结果是运维者本人的 GitHub 登录名，在问题 5 中作为推荐答案使用。
- **已存在的 profile：**含有 `dsh-superagent` 条目的 profile 说明之前已经配置过：询问是否继续沿用它并保留其配置，同时阅读 `docs/006-deployment.md` 中的 Upgrade 一节。

## 2. 问题

按下面顺序提问，每条消息一个，遵循 [docs/001-domain.md](docs/001-domain.md) 中的工作流程：先问触发器来自哪里，再问谁可以在那里提出工作请求，最后问执行者拿工单做什么。推荐答案写在方括号中。

**来源：请求从哪里来。**

1. **来源。** 智能体应当只从 GitHub 接收请求，还是也要从飞书会话接收？[除非团队在飞书中工作，否则只选 GitHub。]
2. **仓库。** 智能体应当在哪个 github.com 仓库上工作，请写成 `owner/name`？
3. **智能体账号。** 智能体将以哪个 GitHub 用户账号的身份行动？[使用一个专用账号，绝不用运维者本人的账号：智能体写下的一切都会显示在这个名字下。] 它可能还不存在，创建它是运维者的步骤。
4. 使用飞书时：**具体哪些会话，**按名称列出？机器人配置好之后，智能体会去查询它们的 id。

**策略：谁可以提出工作请求。**

5. **在 GitHub 上。** 哪些 GitHub 登录名可以向智能体提出工作请求？[只填 `<operator login>`：智能体只为名单上的人行动，而且名单越短，团队受到的噪音越少，运维者也更容易摸清智能体的行为方式。]
6. 使用飞书时：**谁可以在飞书里提问？** [第一个会话中的所有人，并与其成员保持同步。]

**执行：智能体拿工单做什么。**

7. **检出。** 每个工单应当从仓库的哪个本地克隆检出？[在 `~/src/<name>` 下新建一个克隆。]
8. **提交身份。** 智能体的提交应当把谁署名为作者？[使用智能体账号，这样它的工作一眼就能看出是自己的。] 如果要用别的身份，比如运维者的身份，应写入 Delivery requirements 这一提示词小节。
9. **自动合并。** 当智能体自己的拉取请求就绪并获批后，是否让智能体开启自动合并？[不：在智能体的拉取请求一段时间内一直正确之前，由人来合并。] 智能体绝不会以智能体账号的身份开启它，因此如果选择开启，就需要另一个有合并权限账号的 GitHub CLI：请让运维者在运维者步骤中登录一个，并在 Delivery requirements 中写明它。如果选择不开启，就从 Delivery requirements 中删掉自动合并那一段。

不要询问那些已有合理默认值的选项；把它们列在计划里：

- profile 名 `superagent`，它是 DSH 的 Web profile 的一份副本，与运维者自己使用的 profile 分开存放，这样它重启时不会关掉运维者的会话；端口 `3082`；状态目录 `<home>/.dsh/state/superagent`，使用绝对路径；
- 每小时一次的自检，使用运维者本人的 profile，在 dsh-superagent 未运行时修复它；
- 分支前缀 `agent/`；
- 接受模式 `observe`，只记录主动型工作而不真正执行，以及默认规则和提示词小节；
- 使用飞书时：机器人只读取 @ 提及，私信开启。

## 3. 计划

发送一条消息，300 词以内：将要安装什么、需要哪些账号和 CLI、要保存哪些设置、有哪些运维者步骤，以及各项默认值。请求一次确认。

## 4. 执行

1. **先做运维者步骤。** 阅读 `docs/006-deployment.md` 的 Accounts 一节，自己写好 CLI 包装脚本，然后发送一条消息，只包含只有运维者才能做的事：创建智能体账号；在启用自动合并时，以拥有合并权限的账号登录一个 CLI；以智能体账号接受仓库邀请；为每个包装脚本执行 `auth login`；使用飞书时创建并发布机器人应用，并带上它的密钥执行 `config init` 命令。等运维者说完成之后，再用 `<wrapper> api user --jq .login` 逐一检查登录状态。
2. **安装并启动。** 按照 `docs/006-deployment.md` 中的 Install、Machine configuration 和 Start and stop 三节执行。跳过对本仓库的 `git clone`：你已经在它的检出目录里。如果问题 7 要求新建克隆，则克隆问题 2 中的仓库。如果已存在 profile，跳过 `dsh superagent --from-default-profile` 命令，因为它会替换 profile 并删除其 `cordis.patch.yml`，此时应改为编辑该文件，而不是替换它。
3. **设置。** 通过 `docs/006-deployment.md` 中的 Management API 保存，顺序如下：`github` Source、如果使用飞书则加 `feishu` Source、带允许名单的 `policy` 块（使用飞书时，先用机器人的 CLI 查询会话 id），以及带准备命令的 `executor` 块，准备命令取自问题 7 的答案。然后保存提示词，其中 Delivery requirements 要包含问题 8 的提交身份和问题 9 的自动合并答案。若某次保存返回 `restarting: true`，说明 dsh-superagent 正在重启：在下一次请求之前，等到 `scripts/dsh-superagent status` 不再以退出码 1 结束，并重新从 `GET settings` 读取各版本。
4. **失败处理。** 被拒绝的保存会在响应体中指出配置问题。在 `docs/006-deployment.md` 的 Troubleshooting 表格中找到它，修复后继续。只有你自己无法修复的部分才去问运维者。

## 5. 验证与交接

`scripts/dsh-superagent status` 以退出码 0 结束，表示没有配置问题。如果你在运维者本人的 DSH profile 中运行，就用你的调度工具按 `docs/006-deployment.md` 的 Hourly check 一节创建每小时自检；否则把它的提示词交给运维者去那边调度。然后发送一条消息，300 词以内：

- 面板 URL，以及侧边栏中的 **Superagent** 条目就是查看入口。
- 如何试用：从允许名单上的账号，在仓库中的某个 issue 下评论 `@<agent login> <request>`。约一分钟后，概览页上就会出现一个工单。
- 给运维者的三条规则，来自 `docs/000-philosophy.md` 的 Responsibility 一节：先从窄开始、为更少的噪音做调优、为智能体所说的话负责。
- 延伸阅读：`docs/` 下按顺序排列的编号文档。
