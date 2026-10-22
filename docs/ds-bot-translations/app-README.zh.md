> 译自 DeepSeek-Bot 仓库的 `app/README.md`（原文：<https://github.com/Fei2411/DeepSeek-Bot/blob/main/app/README.md>）

# DeepSeek Bot 桌面应用

面向 Windows 和 macOS 的 Electron 应用。它安装固定版本的 DeepSeek Harness（DSH 0.2.1-rc.2）以及本仓库的 `ds-bot` 插件，通过 `@deepseek-ai/dsh/profile-boot` 启动自己的 DSH profile `ds-bot`，并把数据保存在自己的 `DSH_HOME` 中。它绝不写入 `~/.dsh`。它的窗口展示带该插件的 DSH Web 前端，就像 DSH Desktop 那样。设计说明见 [docs/plans/2026-10-16-desktop-app.md](../docs/plans/2026-10-16-desktop-app.md)。

## 运行

```sh
npm ci
node node_modules/electron/install.js   # 当 npm 没有下载 Electron 时（缺少 node_modules/electron/dist）
npm start                               # 启动应用
```

当从 GitHub 下载很慢时，在 Electron 下载之前设置 `ELECTRON_MIRROR=https://npmmirror.com/mirrors/electron/`。如果你的终端里设置了 `ELECTRON_RUN_AS_NODE`，在 `npm start` 之前把它取消（某些基于 Electron 的编辑器内的终端会设置它）：有它时 Electron 会以普通 Node 运行，应用不会启动。

npm 会从 `../ds-bot` 以「复制其包文件」的方式安装 `ds-bot`（`.npmrc` 中的 `install-links`），因此应用运行的是当前这份检出中的插件。在你改动 `ds-bot` 或合入一个改动它的分支后，要再运行一次 `npm ci`：只要版本号不变，`npm install` 会保留旧的副本。`package.json` 中的 `overrides` 把 `ds-bot` 的四个 peer 依赖固定到 DSH 版本：它们声明为 `*`，而 npm 不会为满足 `*` 而选择预发布版本。

| 变量 | 它设置什么 | 默认值 |
|---|---|---|
| `DS_BOT_HOME` | 数据位置：应用的 `DSH_HOME`。设置后，应用首次启动时不会询问任何东西，也不会导入任何东西 | 首次启动时选择的文件夹 |
| `DS_BOT_WORKSPACE` | 与 `DS_BOT_HOME` 一起使用：团队工作区 | 数据位置下的 `bot/workspace` |
| `DS_BOT_SHELL_DATA` | 应用自身的数据（窗口、Chromium 存储、`locations.json`） | Electron 的 `userData`（Windows：`%APPDATA%\DeepSeek Bot`；macOS：`~/Library/Application Support/DeepSeek Bot`） |
| `DS_BOT_UPDATE_URL` | Windows：一个包含 `latest.yml` 及其安装包的文件夹 URL。macOS：一个返回类似 GitHub `releases` API 的 JSON 列表的 URL；只有附有这台 Mac 对应 zip 的发布才算数。预发布只对预发布安装生效（见[更新](#更新)）。设置了 `DS_BOT_HOME` 时，应用只在该变量已设置时才检查 | 最新的 GitHub 发布 |

在 macOS 上，Electron 为 `productName` "DeepSeek Bot" 默认使用的 `userData` 目录是 `~/Library/Application Support/DeepSeek Bot`。

## 首次启动与导入

首次启动时，应用通过系统对话框询问数据位置（默认 `~/.ds-bot`）和团队工作区（`~/DeepSeek Bot`），并把答案保存在自身数据中的 `locations.json` 里。这两个文件夹都不能位于对方内部，也不能位于用户的 DSH 数据内部。

两者之后都可在 DS Bot 的 Settings > General > Locations 中更改。插件会移动团队工作区并告知应用，应用再把它写入 `locations.json`。应用会把用户的 DSH 数据位置告知插件（`DS_BOT_USER_DSH_HOME`），这样团队工作区或某个 Bot 的文件夹就不会被设置到那里。数据位置的迁移通过应用进行（`src/move-data.mjs`）：新文件夹必须是空的或全新的，且要与旧数据、团队工作区、用户的 DSH 数据和程序文件夹分开。应用会停止 Host，把数据（不含团队的锁）复制到新文件夹旁边的一个暂存目录，待其完整后重命名为新文件夹，写入 `locations.json` 并再次启动。复制失败或被打断时，仍使用旧位置并删除暂存目录；旧文件夹始终保留。运行在一次性文件夹上（`DS_BOT_HOME`）时，保持其数据位置不变。

当用户的 DSH（`DSH_HOME`，否则为 `~/.dsh`）中已有 Bot 团队时，应用会提示复制它（`src/import.mjs`）。它只读取那里。复制前它会检查：没有正在运行的 DSH 占用该团队，且没有会话格式比固定版本 DSH 所能读取的更新的聊天。随后由固定版本的 DSH 逐个读取每个聊天一遍：更新的 DSH 可能写入固定版本拒绝读取的同类格式记录。它在数据位置中读取一份一次性副本，使用自己的 profile（`import-check`：`dsh-base` 和 `dsh-web-app`，不含 `ds-bot`），并在之后删除该副本。若某个聊天由更新的 DSH 写入，则因格式更新而中止复制；损坏的聊天则不会，因为用户的 DSH 同样读不了它。然后应用在新数据位置上启动一次 Host，这样 DSH 就不会把复制过来的会话文件夹登记为项目。复制内容包括 `bot/`（不含其锁、进行中的回合和工作区）、团队点名的每个会话、附件、`.credentials.yaml`、`.env`、某个 profile 的 `cordis.patch.yml` 中的模型行，以及旧团队工作区的文件——这些文件会进入新文件夹，但不会替换那里已有的文件。`bot/imported.json` 记录了这次导入。在下一回合，每个 Bot 和群聊都会转到新文件夹中的一个新片段。

Host 读取模型设置和密钥的方式与 DSH 相同：诸如 `DEEPSEEK_API_KEY` 的环境变量，以及数据位置下的 `.env` 和 `.credentials.yaml`。窗口中的 DSH 设置用于配置模型提供方及其密钥；DSH 把提供方保存在 profile 的 `cordis.patch.yml` 中，把密钥保存在 `.credentials.yaml` 中。

## Profile

Host 的 profile `ds-bot` 位于数据位置的 `profiles/ds-bot`。它叠加三个 bundle，在它们之后是用户安装的 bundle：

| Bundle | 它增加了什么 |
|---|---|
| `@deepseek-ai/dsh-base` | DSH 的共享核心：模型、会话、工具、设置、插件管理 |
| `@deepseek-ai/dsh-web-app` | DSH 的 Web 前端（窗口所展示的），以及它和 ds-bot 共用的宿主服务 |
| `ds-bot` | Bot 团队 |

每次启动，Host 都把这三个 bundle 放到 profile bundle 列表的最前面。单机的设置写入 profile 的 `cordis.patch.yml`，与 DSH 中一样。来自早期构建、列有 `deepseek-bot-engine` 的 profile 会由 `@deepseek-ai/dsh-web-app` 取代它。

## 检查一次改动

`npm test` 检查 profile 的组合、在一次性文件夹上的导入、对包含固定版本 DSH 不认识的记录的聊天的首次运行检查，以及应用运行的每个包都是依赖项（见[打包](#打包)）。

`scripts/shot.mjs` 在一次性文件夹上启动应用，保存其窗口截图，打印页面文本，以用户的方式关闭窗口并等待应用退出。使用插件的 mock 模型 `../ds-bot/dev/mock-llm.mjs`（`MOCK_PORT=<port> node ../ds-bot/dev/mock-llm.mjs`）。

```sh
DS_BOT_HOME=<tmp>/home DS_BOT_SHELL_DATA=<tmp>/shell \
DEEPSEEK_BASE_URL=http://127.0.0.1:<port>/v1 DEEPSEEK_API_KEY=mock-key \
node scripts/shot.mjs <tmp>/shot.png 20
```

绝不要把 `DS_BOT_HOME` 指向 `~/.dsh` 或你正在使用的某个应用的数据。

## 打包

[electron-builder](https://www.electron.build/) 用 `electron-builder.yml` 中的设置为应用打包。要在你要打包的目标平台上构建：原生模块（`node-pty`、`sharp`、`koffi`）取自 npm 安装后的 `node_modules`，不做重新编译。

```sh
npm run pack           # 不带安装包的应用：dist-pack/win-unpacked/（Windows）、dist-pack/mac*/（macOS）
npm run dist           # 安装包：dist-pack/DeepSeek-Bot-<version>-win-x64.exe（Windows）、一个 .zip（macOS）
npm run check-packed   # 在一次性文件夹上用 mock 模型启动已打包的应用，聊一次，然后关闭
```

macOS 每个架构产出一个 zip。在 Apple 芯片 Mac 上构建 arm64，在 Intel Mac 上构建 x64，或者在 Rosetta 下用同样跑过 `npm ci` 的 x64 Node。不要交叉构建：它从 `node_modules` 原样打包原生模块；一次混合构建把 12 个仅 arm64 的原生模块放进了它的 x64 应用里。`scripts/before-pack.mjs` 会中止架构与运行它的 Node 不一致的构建。应用做 ad-hoc 签名，使下载的副本具有封印性。它以 zip 而非 dmg 发布：macOS 26 会把下载的未签名 dmg 判定为已损坏而不打开，对 dmg 做 ad-hoc 签名也无济于事（#351）。Safari 会解压下载内容；请把 DeepSeek Bot 移到「应用程序」中。首次打开时，使用 系统设置 → 隐私与安全性 → 仍要打开。不要禁用 Gatekeeper。

`check-packed` 的第一个参数是另一个可执行文件，第二个参数是窗口截图的文件。它运行的是位于当前检出内部的应用，但其运行副本放在一次性文件夹中：如果从检出内部运行，Node 会找到打包时被排除在检出自身 `node_modules` 之外的模块。

electron-builder 只打包它通过 `dependencies` 和 `optionalDependencies` 找到的包。DSH 的包把许多包声明为 peer，npm 会安装它们，但 electron-builder 会漏掉，因此 `package.json` 把它们列为 dependencies。`npm test` 在缺少其中之一时会失败并指出是哪一个。

Windows 安装包默认只为当前用户安装，无需管理员权限，安装到 `%LOCALAPPDATA%\Programs\DeepSeek Bot`（`build/installer.nsh` 会跳过询问「所有用户」还是「仅当前用户」的页面）。卸载程序移除程序本身，但保留数据位置和应用自身的数据。CI 在每个 pull request 上构建 Windows 安装包，检查已打包的应用，然后安装它，检查已安装的应用，再卸载它。对于 `app/` 或工作流的改动，它还会在卸载前更新已安装的应用（见[更新](#更新)）。

## 更新

Windows 上已安装的应用用 electron-updater（`src/updates.mjs`）自我更新。启动时以及每 4 小时，它读取最新 GitHub 发布的 `latest.yml`，其中写明安装包及其 sha512。它在后台下载该安装包并校验其 sha512。下载完成后，窗口上的对话框询问是否立即重启：是则应用停止其 Host 并运行安装包，安装包会再次打开应用；否则安装包在应用退出时运行。

检查在 Host 启动之前就开始（首次启动的导入之后），这样即使某个版本的 Host 起不来，仍能更新。启动失败时，应用最多等待 15 秒等待最新一次检查。当发现有新版本时，错误框会说明；之后应用等待下载完成，然后安装并再次打开。

在 macOS 上，应用在启动时以及每 4 小时检查 GitHub 的发布。每个版本只询问一次，即该发布附有这台 Mac 的 zip 之后。正式版安装会忽略预发布，预发布安装则能看到它们。下载会打开发布页面；「稍后」关闭对话框。应用不自行安装更新。macOS 上的 `DS_BOT_UPDATE_URL` 指向一个类似 `releases` API 响应的 JSON 列表。一个发布需要 `tag_name`、一个 HTTPS 的 `html_url`，以及 `assets` 中匹配架构的 zip。

在 Windows 上，`app-update.yml` 告诉应用它的发布在哪里；`npm run dist` 会根据 `electron-builder.yml` 中的 `publish` 写入它，同时在安装包旁写入 `latest.yml`（`npm run pack` 两者都不写）。这两个命令都不发布。发布工作流（`.github/workflows/release.yml`）在发布被发布时构建安装包，并把安装包、其 `.blockmap` 和 `latest.yml` 附加到该发布上。发布标签即 `ds-bot` 的版本，`npm test` 会检查应用版本相同。macOS 的发布任务在匹配架构的 runner 上构建每个 zip，并只附加 zip。

在一次性文件夹上（`DS_BOT_HOME`），应用只从 `DS_BOT_UPDATE_URL` 检查更新，而且从不询问：更新会等到应用退出时才进行。`scripts/check-update.mjs` 用这样的 feed 检查已打包应用的更新：

```sh
npx electron-builder --publish never -c.extraMetadata.version=<next version> -c.directories.output=dist-next   # 生成 feed
node scripts/check-update.mjs "dist-pack/win-unpacked/DeepSeek Bot.exe" dist-next --kill
```

它提供该 feed 文件夹，在一次性文件夹上启动应用，并等待应用下载完更新且校验了其 sha512。然后它以用户的方式关闭应用，使应用在退出时安装更新；加上 `--kill` 则直接结束应用，从而不安装任何东西。在你自己的机器上请使用 `--kill`：安装包会安装到 `%LOCALAPPDATA%\Programs\DeepSeek Bot`。下载保留在 `%LOCALAPPDATA%\deepseek-bot-updater`。CI 在其已安装的应用上不带 `--kill` 运行它，然后检查已安装的版本是新的，且更新后的应用通过 `check-packed`。

在 macOS 上，传入应用可执行文件和一个版本号即可模拟一个新发布：

```sh
node scripts/check-update.mjs "<app executable>" 99.0.0
```

该脚本提供一个发布列表，其中有一个该版本且带这台 Mac 的 zip 的发布，在一次性文件夹上用它启动应用，等待应用记录新版本，然后关闭窗口。它不会打开浏览器。

## 目录结构

| 文件 | 它做什么 |
|---|---|
| `src/main.mjs` | 主进程：单实例、窗口（像 DSH Web 那样加载 Host 的回环地址），以及 DSH 打开的登录页（它会转到系统浏览器） |
| `src/host-port.mjs` | Host 的端口，跨启动保留，因为页面按地址保存其存储 |
| `src/preload.cjs` | 把数据位置及其迁移交给 DS Bot 的设置。在 Windows 上它为无边框窗口标记页面，并把标题栏按钮染成其下方的表面颜色 |
| `src/window-frame.mjs`、`src/mica.css` | 无边框的 Windows 窗口：标题栏区域（在 Mica 可用时，即 Windows 11 22H2 及以后），以及让 Mica 透出侧边栏的样式表 |
| `src/host-process.mjs` | 以 Electron 的 Node 模式启动 Host 并管理其退出 |
| `src/host.mjs` | Host：用 `runProfile()` 启动 profile，并报告启动 URL 和页面注入；用于首次运行检查（`DS_BOT_CHECK`）时报告它读不到的聊天 |
| `src/profile.mjs` | 各个 profile：应用自己的和首次运行检查的，它们的 bundle，以及它们的创建与更新 |
| `src/session-check.mjs` | 哪些聊天被固定版本的 DSH 拒绝（因为由更新的 DSH 写入） |
| `src/first-run.mjs` | 首次启动的对话框（两个文件夹和导入提示）以及数据迁移的文案 |
| `src/import.mjs` | 从用户的 DSH 导入 Bot 团队 |
| `src/move-data.mjs` | 数据位置的迁移：哪些文件夹可以接收它，以及经由暂存目录的复制 |
| `src/updates.mjs` | Windows 安装包更新和 macOS 发布页检查 |
| `engine/` | 暂缓，未安装：给应用自有窗口用的 bundle `deepseek-bot-engine`，位于 `ui/` |
| `test/` | `npm test`：profile 的组合，以及打包所需的依赖项 |
| `ui/` | 暂缓，未构建也未打包：应用自有窗口。React，用 Vite（`vite.config.js`）构建到 `ui/dist`。它从 `../ds-bot/src/client/` 绘制插件自己的 Bot 视图（侧边栏、聊天行、dock、对话框及其样式表），并用自己的 Markdown 取代 DSH 的。它使用 ds-bot 的 `api/bot` 通道及其实时 feed `api/bot/feed` |
| `assets/` | 应用图标：`icon.svg`、`icon.png`（1024 px）和 `icon.ico`（Windows，16 至 256 px）。`npm run icon`（`scripts/icon.mjs`）从 `../ds-bot` 中 Main Bot 的鲸鱼重新绘制它们 |
| `electron-builder.yml`、`build/` | 打包与安装包：应用标识、文件、图标、Windows 安装包和 macOS 磁盘镜像 |
| `scripts/check-packed.mjs` | `npm run check-packed`：对已打包应用的检查 |
| `scripts/check-update.mjs` | 从 Windows feed 文件夹或 macOS 发布检查已打包应用的更新 |

Host 使用应用自带的 pnpm（`node_modules/pnpm`）安装插件。

有些文件改编自 DSH Desktop（MIT）；见 [NOTICE](../NOTICE)。
