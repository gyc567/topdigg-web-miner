> 译自 DeepSeek-Bot 仓库的 `docker/README.md`（原文：<https://github.com/Fei2411/DeepSeek-Bot/blob/main/docker/README.md>）

# 在 Docker 中运行 DS Bot

本目录把 DS Bot 部署为一个 Docker 镜像：一个装有 `ds-bot` 插件、可直接使用的 `dsh web` 服务器（DeepSeek Harness），适合 NAS 或任何常开机器。容器就是沙盒边界——见[权限](#权限)。

## 环境要求

- Docker 24+ 搭配 Compose v2.24+（Docker Desktop，或 Docker Engine 加 compose 插件——`env_file.required` 需要 2.24）。
- Linux 容器，x86-64。arm64 构建理论上可行（`node:24-bookworm-slim` 是多架构的），但未经验证。
- 一个 DeepSeek API key（或通过 `DEEPSEEK_BASE_URL` 指定的其他兼容 Anthropic-Messages 的端点）。

## 快速开始

在仓库根目录编辑 `docker-compose.yml`：填入 `DEEPSEEK_API_KEY`，把 NAS 的 IP 加入 `DSH_TRUSTED_HOST`，并把 `PUID`/`PGID` 设为共享目录所有者的 ID。环境变量、端口和路径都直接在这个文件里配置；不需要 `.env`。不要提交真实密钥。

```sh
docker compose up -d --build
docker compose logs ds-bot
```

这会构建本地镜像，而不会拉取已发布的 DS Bot 镜像。根目录的 Compose 文件映射主机端口 **13080**，并把数据与工作区文件存放在 `docker/data` 和 `docker/workspace`。

日志会打印一行类似 `dsh web: http://127.0.0.1:3080/?token=… (LAN: http://172.x.x.x:3080/?token=…)` 的内容。从中取出 token，在浏览器里访问一次 `http://<NAS IP>:13080/?token=…`：该 token 会设置一个签名 cookie（有效期 30 天，绑定到该 authority），之后 `http://<NAS IP>:13080/` 就能直接打开界面。打印出的端口是容器内的端口；访问时请使用 `ports:` 中的主机端口。团队首次打开时，DS Bot 会创建一个名为 Chief 的 Main Bot。

喜欢用 `.env` 的用户仍可选择 `docker/` 中的方案：

```sh
cd docker
cp .env.example .env
# 编辑 .env：DEEPSEEK_API_KEY、DSH_TRUSTED_HOST、PUID/PGID。
docker compose up -d --build
```

该文件默认映射主机端口 **3080**。两种部署方式选其一；不要同时对同一数据目录运行两者。

## 权限

容器是唯一的沙盒。DSH 自带的内核沙盒（bubblewrap / Landlock）在 Docker 默认的 seccomp 配置下、或在多数 NAS 内核上都无法运行，因此镜像只提供一种权限预设：**完全访问**——每个 Bot 命令都无需询问即可运行。只把允许 Bot 改动的文件夹挂载到 `/workspace`，并以共享目录所有者的 `PUID`/`PGID` 运行容器，以保持文件归属正确。

## 网络

`dsh web` 只绑定回环地址或所有接口（`0.0.0.0`）——绝不绑定具体的 LAN 地址——而且它的 `--host` 标志拒绝 `0.0.0.0`，因此入口脚本会写入一个配置覆盖层来绑定所有接口。在容器内部，真正的边界是端口发布规则，下面的信任围栏依然适用。界面会检查每个 `/api` 请求的 `Host` 头：回环地址始终被信任，而其他任何你用来访问它的名称或 IP 都必须列在 `DSH_TRUSTED_HOST` 中（不带端口——裸条目表示在任意端口上都信任它），否则 API 返回 403。`DSH_HOST=127.0.0.1` 把绑定收窄到回环地址（例如同一网络命名空间中的反向代理）；此时映射的端口将不再能访问它。

可选方案：

- **主机网络**：在 `compose.yml` 中设置 `network_mode: host` 并去掉 `ports:`。服务器随后直接在 NAS 的接口上以 `DSH_LISTEN_PORT`（默认 3080）绑定；`DSH_HOST=127.0.0.1` 又会把它收窄到回环地址。
- **反向代理 / HTTPS**：代理必须保留浏览器可见的 `Host` 头并转发 WebSocket 升级；把公网主机名加入 `DSH_TRUSTED_HOST`。打印出的登录 URL 是容器内的——首次登录时把它的主机替换为公网的那个。

**推荐使用 HTTPS，但不是必须。** 在这个 dsh 版本上，界面在明文 `http://<LAN IP>` 下也能工作，但该页面在此时不是安全上下文：你输入的 API key 和密钥值会以明文穿越 LAN。日常使用请在前面放一个反向代理。

## 环境变量

在根目录的 `docker-compose.yml` 中，编辑 `environment` 下的容器变量、`ports` 下的映射端口，以及 `volumes` 下的主机目录。备选方案 `docker/compose.yml` 则从 `.env` 读取这些设置；其完整列表见 `docker/.env.example`。主要变量有：

| 变量 | 用途 |
|---|---|
| `DEEPSEEK_API_KEY` | 模型端点的 API key |
| `DEEPSEEK_BASE_URL` | 覆盖端点（兼容 Anthropic-Messages） |
| `DSH_TRUSTED_HOST` | 以逗号分隔的界面所响应的主机名 / IP |
| `DSH_PORT` | 备选 `.env` 部署的主机端口（默认 3080）；在根目录 Compose 文件中请直接编辑 `ports` |
| `DSH_HOST` | 绑定地址：`0.0.0.0`（默认）或 `127.0.0.1`；仅在使用 `network_mode: host` 时相关 |
| `DSH_LISTEN_PORT` | 容器内监听端口（默认 3080）；仅在使用 `network_mode: host` 时相关 |
| `PUID` / `PGID` | 服务器运行所用的用户/组，以及新文件的归属 |
| `DSH_TELEMETRY_DISABLED` | 设为 `1` 可关闭 dsh 的匿名遥测 |

可以在容器命令后追加额外的 `dsh` CLI 标志。

## 自定义模型端点

若要使用兼容 OpenAI 的中转（或其他 DSH 能对话的服务提供方），请在首次启动前创建 `DATA_DIR/cordis.patch.yml`——这是 DSH 的 home 级补丁层，在 profile 自身的补丁层之后应用——其中包含一个 `llm-pi-ai` 提供方和一行 `agent-default-model`，并把密钥作为环境变量传入：

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
# 通过「创建 Bot」表单新建的 Bot 会从 DSH 的默认模型开始；
# 也要把它指向该中转，否则它们会从没有密钥的 deepseek-official 开始。
- id: agent-default-model
  config:
    provider: relay
    model: my-model
```

在根目录 Compose 文件的 `environment` 下加入 `RELAY_API_KEY`，或为备选部署加到 `.env` 中。另一种做法是在界面的 Settings → Models 中设置，它会写入同样的配置。

## 数据

- `/data`（`DATA_DIR`）是 `DSH_HOME`：团队与聊天（`bot/`、`sessions/`）、profiles、设置以及登录 cookie 密钥（`.credentials.yaml`）。
- `/workspace`（`WORKSPACE_DIR`）是 Bot 工作的团队工作区。

重新构建会复用已持久化的数据和工作区。重新构建或迁移主机目录时，保持它们的容器目标路径 `/data` 和 `/workspace` 不变；团队记录的是这些目标路径，而不是主机路径。

**备份**：停止容器，然后复制 `DATA_DIR` 和 `WORKSPACE_DIR` 两者。恢复时把两个文件夹都放回原处再启动。

每次启动时，`/data` 中属主或属组不同的条目都会被改到 `PUID`/`PGID`，包括已有的 profiles 和恢复进来的文件。这会扫描数据目录，所以庞大的历史记录可能让启动更久。它不跟随符号链接，也不进入其他文件系统。已有内容的 `/workspace` 保持其归属；若你更改了 `PUID`/`PGID`，请在主机上给新用户授予该共享目录的访问权。

## 更新

```sh
docker compose build   # 或：docker build -f docker/Dockerfile -t ds-bot:local .
docker compose up -d
```

重新构建会改变镜像及其内置的 DSH。已持久化的 profile 会被复用，入口脚本不管理插件升级。镜像以 dsh `0.2.0-rc.2` 构建和测试，这也是 DS Bot 验证过的版本；存在一个 `DSH_VERSION` 构建参数，但其他版本未经测试，较新的版本会改变服务器的绑定方式。

## 预构建镜像

分支 CI 通过后，GitHub Actions 会把镜像发布到 GHCR：`main` 对应 `latest`，`dev` 对应 `dev`，每次成功推送还对应一个 `sha-<完整 commit SHA>`。只发布经过测试的 linux/amd64 镜像。首次发布只有在这个工作流被合并且有一次推送成功之后才会发生。维护者必须先把 GHCR 包的可见性设为 Public，匿名拉取才能工作。

把下面的内容保存为你要部署的目录中的 `compose.yml`。启动前填入 API key 和你的 NAS 主机名。在仓库根目录运行这些命令会改用本地的根目录 Compose 文件。

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

```sh
docker compose pull
docker compose up -d
```

根目录的 `docker-compose.yml` 和 `docker/compose.yml` 仍然会构建本地镜像。两种配置选其一；不要同时对同一数据目录运行两者。已持久化的 profile 不会自动升级。

## 限制

- 没有 Bot 浏览器 / `read_browser` 工具：它们只存在于 dsh Desktop 中。
- 在明文 http 下，你输入的 API key 和密钥值会以明文穿越网络——请在盒子外使用 HTTPS（见[网络](#网络)）。
- 完全访问是唯一的权限模式：Bot 可以改动容器能看到的一切。

## 测试

构建镜像后，在仓库根目录运行 `node docker/test.mjs ds-bot:local`。该测试使用隔离的、禁用网络的容器和临时 Docker 卷，不挂载主机目录，也不调用模型。它检查入口脚本的权限、首次启动、UID/GID 变更、恢复的文件、工作区归属以及 Web 启动。测试结束后，所有测试容器和卷都会被删除。CI 会从 Linux 检出构建镜像，并把该测试作为必需的 Test 结果检查的一部分运行。
