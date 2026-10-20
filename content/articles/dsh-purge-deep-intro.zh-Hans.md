---
title: "DeepSeek Harness 破甲工具 dsh-purge：让所有模型都能被安全评测"
source: original
author: 瑞哥观势
date: 2026-10-20
tags:
  - AI安全
  - 红队评测
  - DeepSeek
  - 大模型
  - 网络安全
description: "深度解析 dsh-purge：腾讯开源的 DeepSeek Harness 破甲插件，支持多模型多提示词切换，用于大模型安全评测与红队研究。"
---

# DeepSeek Harness 破甲工具 dsh-purge：让所有模型都能被安全评测

## 前言

2026年10月，一款名为 **dsh-purge** 的 DeepSeek Harness 插件在 GitHub 上引发了关注。这是一个由独立开发者 YuJunZhiXue 创建的网络安全红队评测工具，目标非常明确——**让所有模型都能破甲，不同模型可以换不同提示词**。

这个项目不仅包含了详尽的使用文档和设计哲学，还因其开发者的一封"致读者信"而显得格外特殊：开发者坦言自己被裁员，这个项目是他在彻底转型前的最后一个作品。

本文将全面解析这个项目的功能、设计哲学、安装配置和使用方法。

---

## 一、项目概述

### 1.1 什么是 dsh-purge

dsh-purge 是一款运行在 **DeepSeek Harness**（官方 AI 助手平台）上的插件，本质上是一个**红队评测辅助工具**。它能够绕过宿主（Harness）内置的安全策略，让研究者在受控环境下对模型进行安全评测。

核心能力：

- **多模型支持**：不绑定单一模型，可针对不同模型配置不同的破甲提示词
- **分层隔离**：将"模型拒绝"和"宿主拦截"两层分开，精准识别真实安全边界
- **本地化运行**：所有操作都在本机完成，不对外发起任何网络攻击
- **双端支持**：同时支持官方 Web 端（dsh web）和官方桌面端（EXE）

### 1.2 核心定位

开发者在 README 中明确写道：

> "Harness 不只是把问题交给模型。它还会在运行时改提示词、审批门、沙箱和会话格式。只看'模型答不答'，会把宿主拦截误当成模型拒绝。"

这句话点明了 dsh-purge 存在的核心价值——**在 AI 安全评测中，准确区分"模型本身的拒绝"和"宿主平台的安全拦截"**，是红队研究的关键前提。

### 1.3 版本与适配

| 版本 | 适配对象 | 说明 |
|------|---------|------|
| 1.1.40+ | dsh 0.2（官方桌面 0.2.0-rc.2 / 0.2.1-rc.2 / 官方 dsh web） | 当前主流版本 |
| 1.1.39 及更早 | dsh 0.1.7（含 rc.1 / rc.2） | 历史版本，在 Releases 中可下载 |

> 注意：社区桌面端（Community Desktop）不在维护范围内。

---

## 二、设计哲学

### 2.1 受控评测，而非攻击工具

dsh-purge 从架构层面就限定了它的使用范围：

- **只作用于本机官方 Harness**：所有补丁、提示词注入都发生在使用者本机已安装的官方软件上
- **不对外网目标联网**：应用补丁、写入注入、回滚、卸载均在本机文件与本机进程内完成
- **明确的法律边界**：严禁对中国大陆、香港、澳门网段进行任何操作

这种"本地受控"的设计哲学，让它本质上是一个**安全评测研究工具**，而非攻击武器。

### 2.2 不改宿主源码，只做运行时注入

dsh-purge 并不修改 DeepSeek Harness 的源代码仓库。它的写入时机是：

1. 用户在 dsh-purge 侧栏点击「应用」
2. 补丁写入 `$DSH_HOME` 配置目录
3. 宿主自动重启，补丁进入当前进程

这意味着：
- **可还原**：随时可以回滚到官方原版状态
- **不影响官方能力**：宿主的所有原生功能保持不变
- **不绑定特定版本**：补丁独立于 Harness 源码演进

### 2.3 身份来自加密提示词

dsh-purge 的身份（破甲提示词）来自插件内部封装的加密提示词文件（prompt-inject.md），而非读取宿主磁盘上的提示词文件。这种设计确保了：

- 提示词不会被轻易篡改或窥探
- 不同 profile（web/desktop）可以有不同的注入策略
- 升级插件后自动再检查并应用，无需手动维护

### 2.4 商业许可的转变

值得注意的是，这个项目经历了从 MIT 到商业许可的转变。开发者坦言：

> "10 月 27 日起，我把这个仓库关上。GitHub 上我不再发新版本。后面的包我只发在频道 t.me/LLM_PoJia/271。"

这一决定背后是一个独立开发者的生存压力。项目采用**商业许可**，但明确允许个人自用；付费卖插件、卖课、白标则需要单独购买授权。

---

## 三、详细安装教程

### 3.1 环境要求

- **Node.js ≥18**（Windows 无闪窗需要 Node ≥22）
- 已安装官方 DeepSeek Harness（dsh web 或桌面端 EXE）
- npm 上没有 dsh-purge 包，必须从 GitHub 归档安装

### 3.2 自动安装（推荐）

**第一步：安装插件**

给 AI 助手发送以下指令（只执行安装命令，不做其他操作）：

```
安装 DeepSeek Harness 插件 dsh-purge，Web 和官方桌面端都要装。不要全盘搜索，不要读或改其它文件，不要应用设置，也不要重启应用。

dsh 不在 PATH 就告诉用户后停止。当前目录已是本仓库时，把下面两条里的归档地址都换成 .。某个 profile 不存在就跳过那一条，另一条照装。npm 上没有这个包，不要 pnpm add dsh-purge。

Web 端（官方 dsh web）
dsh plugin --profile web add https://github.com/YuJunZhiXue/dsh-purge/archive/refs/heads/master.tar.gz

桌面端（官方 EXE）
dsh plugin --profile desktop add https://github.com/YuJunZhiXue/dsh-purge/archive/refs/heads/master.tar.gz

命令结束后，提醒用户：Web 完全退出并重启 dsh web；桌面端退出托盘再打开 EXE。各自点会话标题旁的 dsh-purge，在「清洗」里点「应用」。然后停止。
```

**第二步：重启宿主**

- Web 端：完全退出 dsh web，再重新打开
- 桌面端：退出系统托盘，再重新打开 EXE

**第三步：应用补丁**

- 在会话标题旁找到 dsh-purge 按钮并点击
- 进入「清洗」页面，点击「应用」
- 成功后会自动重启一次，让补丁进入当前进程
- 重启后新开一轮对话，注入才生效

> ⚠️ 重要：Web 和桌面端必须分开安装、分开点「应用」。一个宿主里不要点另一个宿主的应用。

### 3.3 手动安装（备选方案）

当命令行安装失败或 dsh 不在 PATH 时，使用手动安装。

**第一步：找到正确的 $DSH_HOME**

按以下顺序查找：
1. `DSH_HOME` 环境变量
2. dsh 安装根目录旁边的 `.dsh`（便携包）
3. `~/.dsh`（Windows 为 `%USERPROFILE%\.dsh`）
4. `%APPDATA%\DeepSeek Harness\dsh-home` 或 `%LOCALAPPDATA%\DeepSeek Harness\dsh-home`

确认方法：找到的目录下要有 `profiles`，且 `profiles/web/package.json` 里 `"name"` 是 `dsh-profile-web`（桌面端是 `dsh-profile-desktop`）。

**第二步：放置插件**

```bash
git clone https://github.com/YuJunZhiXue/dsh-purge.git "$DSH_HOME/plugins/dsh-purge"
```

**第三步：修改 profile 配置**

备份后，编辑 `$DSH_HOME/profiles/web/package.json`（或 desktop），新增：

```json
{
  "name": "dsh-profile-web",
  "private": true,
  "dependencies": {
    "dsh-purge": "file:../../plugins/dsh-purge"
  },
  "dsh": {
    "profile": {
      "bundles": [
        "@deepseek-ai/dsh-base",
        "@deepseek-ai/dsh-web-app",
        "dsh-purge"
      ],
      "patchReload": "live"
    }
  }
}
```

**第四步：安装依赖并应用**

```bash
cd "$DSH_HOME/profiles/web"  # 或 profiles/desktop
pnpm install
```

**第五步：重启宿主并点「应用」**

---

## 四、核心功能解析

### 4.1 清洗（Clean）

清洗页面是 dsh-purge 的核心控制面板，包含：

| 功能 | 说明 |
|------|------|
| **补丁** | 分组查看状态，支持应用、还原、卸载 |
| **提示词** | 编辑 prompt-inject.md，作为会话覆盖段 |
| **规则集** | 多套 AGENTS.md / CLAUDE.md，启用后写入 $DSH_HOME |
| **Skill** | 导入压缩包或文件夹到当前宿主官方目录 |
| **自己的服务器** | 登记白名单 IP 或主机名，写入 net-scope-allow.txt |

### 4.2 演练台（Drill）

演练台是正式版内置功能，需要首次授权后使用。授权前会显示法律声明，需阅读并勾选三项条款。

功能包括：
- **资产**：查看当前环境资产
- **技能**：查看可用技能列表
- **环境**：查看本机环境信息

> 用途限定：只用于你有权管理的本机、离线靶标，或已经书面授权的演练环境。

### 4.3 命令行工具

dsh-purge 提供完整的 CLI 和聊天命令：

**命令行：**
```bash
dsh-purge --status    # 查看状态
dsh-purge --apply     # 应用补丁
dsh-purge --revert    # 还原补丁
dsh-purge --uninstall # 卸载
dsh-purge --edit      # 编辑配置
```

**聊天命令：**
```
/purge status | apply | revert | uninstall | edit | help
/rules list | use <id> | create <id> | delete <id> | reset | help
/skills list | import <压缩包> | create <id> [说明] | delete <id> | help
/rewind
```

### 4.4 高级配置

**调整 Bash 超时（macOS/Linux dsh web）：**

在 `$DSH_HOME/profiles/web/cordis.patch.yml` 添加：

```yaml
- id: bash-sandbox
  config:
    timeoutMs: 10000
```

**默认使用 Low 推理：**

```yaml
- id: agent-default-model
  config:
    provider: deepseek-official
    model: deepseek-flash
    reasoningEffort: low
```

---

## 五、工作原理详解

### 5.1 架构层次

dsh-purge 的技术架构可以分为三层：

```
┌─────────────────────────────────────┐
│         会话层（Session）             │
├─────────────────────────────────────┤
│  提示词注入（Prompt Inject）          │
│  - prompt-inject.md                 │
│  - 规则集（AGENTS.md/CLAUDE.md）    │
├─────────────────────────────────────┤
│  补丁层（Patch）                     │
│  - Cordis 配置覆盖                   │
│  - 宿主策略调整                      │
├─────────────────────────────────────┤
│  宿主层（Harness Host）              │
│  - @deepseek-ai 包                  │
│  - 官方安全策略                      │
└─────────────────────────────────────┘
```

### 5.2 关键文件

| 路径 | 用途 |
|------|------|
| `$DSH_HOME/plugins/dsh-purge/` | 插件本体 |
| `$DSH_HOME/prompt-inject.md` | 会话注入提示词 |
| `$DSH_HOME/rules/` | 规则集目录 |
| `$DSH_HOME/skills/` | Skill 目录 |
| `$DSH_HOME/net-scope-allow.txt` | 白名单服务器列表 |
| `$DSH_HOME/redteam/` | 红队预设数据 |

### 5.3 注入时机

补丁通过 `dsh.profile.patchReload: "live"` 配置实现运行时重载。用户点「应用」后：

1. 补丁写入 `$DSH_HOME` 相关文件
2. 宿主自动重启
3. 新会话加载时，注入段被拼接到原始提示词中
4. 模型在增强后的提示词环境下响应

---

## 六、核心观点与总结

### 6.1 观点一：AI 安全评测需要"分层思维"

dsh-purge 最重要的贡献不是具体的破甲技术，而是一种**分层评测的方法论**。开发者在文档中反复强调：

> "只问'模型答不答'，会把宿主拦截误当成模型拒绝。"

这提醒我们：大模型安全评测必须区分三层：
- **平台层**：Harness 本身的安全策略
- **提示词层**：注入的提示词是否改变了模型行为
- **模型层**：模型本身的鲁棒性边界

### 6.2 观点二：本地工具 ≠ 攻击工具

dsh-purge 的设计哲学刻意将其限定为"本机评测工具"：

- 所有操作不涉及对外网络请求
- 明确禁止针对未授权目标使用
- 包含详尽的法律声明和免责声明

这是一种负责任的安全研究态度。

### 6.3 观点三：开源与生存的两难

项目从 MIT 转向商业许可，折射出独立开源开发者的生存困境：

- 开发者被裁员，项目失去经济来源
- 社区依赖免费工具，但维护需要时间
- 商业化可能失去部分用户，但能延续项目生命

这是一个行业性问题，没有标准答案。

### 6.4 观点四：提示词安全是模型安全的"软肋"

dsh-purge 的核心机制是通过修改提示词来改变模型行为。这揭示了一个重要事实：

> 在模型本身越来越安全的同时，**提示词层面的攻击面**往往被忽视。

通过对提示词的精细控制，可以让模型"越狱"，也可以让模型更安全——这是一把双刃剑。

---

## 七、总结

dsh-purge 是一个专注于 DeepSeek Harness 平台的安全评测工具，它的核心价值在于：

1. **精准区分**：将宿主拦截与模型拒绝分离，实现精确的安全边界测量
2. **本地受控**：所有操作本地化，确保研究活动在合规范围内
3. **可还原性**：补丁机制支持完整回滚，不影响宿主原生功能
4. **多模型适配**：支持不同模型使用不同破甲策略

同时，这个项目也提醒我们：大模型安全不仅是模型本身的问题，更是一个涉及平台、提示词、使用者的系统性工程。

---

**相关资源：**

- GitHub：https://github.com/YuJunZhiXue/dsh-purge
- 插件市场：https://dsh-plugin.org/plugins/yujunzhixue/dsh-purge
- 官方 Harness：https://www.deepseek.com/harness/

---

*首发于微信公众号「瑞哥观势」*

*既然看到这里了，如果觉得不错，随手点个赞、在看、转发三连吧，如果想第一时间收到推送，也可以给我个星标，谢谢你看我的文章，我们，下次再见。*

*首发于微信公众号「瑞哥观势」。*
