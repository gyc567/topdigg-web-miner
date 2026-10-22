> 译自 DeepSeek-Bot 仓库的 `AGENTS.md`（原文：<https://github.com/Fei2411/DeepSeek-Bot/blob/main/AGENTS.md>）

# AGENTS.md

给在本仓库上工作的 AI 编码代理的说明。人类贡献者请看 [CONTRIBUTING.md](CONTRIBUTING.md)，那里是同样的规则，只是更详细。

## 这个项目是什么

DS Bot 是一队长期驻留的 Bot，构建于 DeepSeek Harness（DSH）之上。它有两个部分：

- `ds-bot/`：Bot 功能，以 DSH 插件的形式编写。该插件可运行在 DSH Desktop、DSH Web 以及桌面应用中。
- `app/`：面向 Windows 和 macOS 的桌面应用。它以固定版本运行 DSH 并加载 `ds-bot` 插件，使用自己的 profile 和自己的 `DSH_HOME`，并可从用户的 DSH 导入已有的 Bot 团队。

Bot 团队：

- 每个 Bot 都是一个长期驻留的身份，它的工作运行在 DSH 会话中：它自己的聊天一个，它所属的每个群聊各一个，上下文填满时再新建一个（早先的那些仍可阅读）。每个回合都走标准的 DSH 代理循环、工具与模型路由。
- 团队协同工作：Bot 之间互相发消息、共享群聊，并能看见其他 Bot 在做什么。每个 Bot 仍独立运行，不会打扰其他 Bot。
- Bot 有着清晰且互不相同的角色。Main Bot 拥有最高权限：它可以创建、修改和移除其他 Bot。其他 Bot 不获得这些权限。Main Bot 可以有多个。
- 用户可定制每个 Bot（名称、角色标签、指令、模型、角色形象）。
- 行为必须可靠：Bot 依据证据行动，坚守自己的目标，其结果可被检查。

## 硬性规则

1. **构建在 DSH 之上；绝不打补丁。** Bot 功能使用有文档的插件 API。桌面应用只通过有文档的入口（`@deepseek-ai/dsh/profile-boot`、`dsh` CLI）启动 DSH。绝不修改 DeepSeek Harness，也不依赖 DSH 安装目录内部的文件。如果 DSH 中缺少某项能力，停下来并说明；不要用打补丁的方式绕过去。
2. **不带密钥。** 绝不写入、打印或提交 API key、token、cookie 或 `DSH_HOME` 的内容。测试请使用 mock 模型（`ds-bot/dev/mock-llm.mjs`）；它不需要密钥。
3. **只用原创材料。** 不要从其他产品或网站复制代码、文本、图标、logo 或图形。唯一例外是与 Apache 2.0 兼容的许可证下的代码：需注明来源，并将其声明加入 `NOTICE` 文件。
4. **`client.js` 是生成产物。** 修改 `ds-bot/src/client/`，然后运行 `npm run build` 并把两个文件一起提交。绝不手工编辑 `client.js`。
5. **不要动用户自己的 DSH 数据。** 桌面应用把数据保存在自己的 `DSH_HOME` 中；它的导入只读取 `~/.dsh`，绝不往那里写。测试台把数据保存在 `.dsh-test-<name>/` 中。绝不要把测试指向 `~/.dsh`、桌面应用的数据，或用户正在运行的 DSH。

## 命令

在 `ds-bot/` 下运行。单元测试和 linter 会从 `dev/harness/` 加载 `@deepseek-ai/*` 包，该目录由 `npm run harness` 按 `dev/harness/package.json` 中的 DSH 版本从 npm 安装。`DSH_HARNESS` 可把指向改为另一个安装或一份 DeepSeek Harness 检出。测试台需要 `../deepseek-harness`（或 `DSH_HARNESS`）处的一份检出，版本与 README 中一致。

```sh
npm ci                                 # 仅构建工具（esbuild）
npm run harness                        # 仅一次：为测试和 linter 安装 DSH 包
npm run build                          # src/client → client.js
npm test                               # 单元测试；若 client.js 过期也会失败
node scripts/build-client.mjs --check  # client.js 与 src/client 一致
npm run lint                           # oxlint
CONTEXT_WINDOW=100000 CHECK_RATIO=0.45 dev/bench.sh smoke 3096 8796 reset && node dev/smoke.mjs smoke 3096   # 冒烟测试
dev/bench.sh smoke 3096 8796 stop
```

当 `npm test`、`--check` 和 `npm run lint` 都通过时，一次修改才算完成；CI 会在每个 pull request 上运行它们。修改 `index.js` 或 `src/host/` 时还要跑冒烟测试。每个测试台使用一个空闲端口，并停掉你启动的每个测试台和进程。

## 分支、pull request 与 issue

完整流程见 [CONTRIBUTING.md](CONTRIBUTING.md#how-we-work)。代理必须遵循的部分：

- 从最新的 `dev` 切出分支开始工作，分支名为 `fix/<issue>-<name>`、`feat/<issue>-<name>`、`docs/<name>` 或 `chore/<name>`。绝不要以 `dev/` 开头命名分支。把 pull request 开向 `dev`，而不是 `main`；只有发布和热修复才进 `main`。
- 用 `git merge dev` 让分支保持最新。绝不 rebase 已推送的分支，绝不 force-push。
- 填写 pull request 模板。用 `Fixes #<number>` 关联 issue；缺陷修复要写明它修复的是哪个 bug。在 Changelog 字段里写出用户可见的变更，不要编辑 `CHANGELOG.md`。
- 不要着手处理带 `maintainer` 标签的 issue 或 pull request；那要等维护者处理。不要接手已指派给他人的 issue。
- 在改变行为之前，先读 `docs/plans/` 中对应的设计（以及 `docs/vision.md`）。对已定设计做改动需要维护者参与；新的大型功能要把设计说明加到同一个 pull request 中。
- 没有证据不要关闭 issue：给出修复它的 pull request 或提交、它重复的 issue，或它不会被修复的原因。
- 分诊 issue 请遵循 [.agents/skills/issue-triage/SKILL.md](.agents/skills/issue-triage/SKILL.md)。

## 目录结构

- `ds-bot/index.js` 和 `ds-bot/src/host/`：服务端（名册与存储、工具、回合与投递、群聊、对话片段与搜索索引、图片、浏览器桥接、`api/bot` 通道）。
- `ds-bot/src/client/`：浏览器端（侧边栏、聊天、面板、主题、角色形象、Bot 浏览器面板）。
- `ds-bot/web-search.js`：`auto` 网页搜索提供方，独立于 Bot 团队代码。
- `ds-bot/test/`：单元测试与测试夹具。`ds-bot/dev/`：测试用的 DSH 包（`harness/`）、mock 模型、测试台、冒烟测试、角色形象生成器、Linux 下的 Desktop 脚本。
- `app/`：桌面应用（Electron 主进程与窗口、首次运行设置与导入、安装包与更新）。

## 风格

- 遵循你改动周边的代码。保持函数小巧，命名朴素。
- 只在原因从代码中看不出来时才写注释：隐藏的约束、不变式、变通做法。不要描述代码做了什么。
- 提交信息用英文，主题用祈使句，原因写在正文里。保持提交粒度小。
- 提出该改动的人是提交作者。不要把 AI 代理或 bot 设为作者或提交者，也不要为此添加 `Co-authored-by` 行。
- 插件中面向用户的文本使用英文。修改 README 或 README.zh.md 之一时，让两者保持同步。
