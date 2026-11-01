---
title: "dsh-superagent"
description: "dsh-superagent 是一个面向单个 GitHub 仓库的主动型编码智能体，以 DeepSeek Harness 插件包的形式分发。"
source: "dsh-superagent-prototype"
source_file: "README.md"
---

# dsh-superagent

> **仅供参考的研究原型，并非 DeepSeek 官方产品。** 这份代码来自我们团队日常开发工作的积累，其中大量工程实现由编码智能体完成。请把它当作研究代码，而不是可直接投产的软件。它可能仍存在缺陷，代码风格与工程实践也可能前后不一致。在你自己的环境中使用之前，请先评审并改造它。
>
> 我们为发布做了适配，因此它与我们的内部版本、以及《探索超级智能体设计：迈向更自主的智能体系统》（*Exploring Super-agent Design: Towards a More Autonomous Agent System*）一文中描述的实现并不完全相同。文中讨论的部分设计属于未来发展的方向，在本原型中并未实现。

dsh-superagent 是一个面向单个 GitHub 仓库的主动型编码智能体，以 [DeepSeek Harness](https://www.deepseek.com/en/harness/) 插件包的形式分发。它监听 GitHub，也可以选择监听飞书。当某个被允许的人向智能体提出工作请求时，它会开出一个工作项，在自己的智能体会话和工作目录中完成该工作，并在原始会话中给出回复，例如提交一个拉取请求。一个网页面板会展示哪些事项需要人来处理。

它同时也是一种与智能体协作的工作方式：**尽可能少占用人的注意力，尽可能多地交付价值。** 一个能替整个团队干活的智能体，同样也能浪费整个团队的注意力，因此它只在被要求时、或团队自己写下的规则允许时才行动，并且只在有人必须采取行动、或有人能利用某个结果时才发声。[docs/000-philosophy.md](docs/000-philosophy.md) 解释了这一原则，以及它对运维者提出的要求。

## 安装配置

配置步骤很多，所以交由智能体陪你一起完成。请让你的编码智能体说：

> 阅读本仓库中的 SETUP.md，帮我把 dsh-superagent 配置起来。

它每次只问一个简短的问题，会一次性展示完整计划，然后安装并配置好一切。[SETUP.md](SETUP.md) 就是它所遵循的流程。

## 文档

请按顺序阅读这些编号文档，每一篇都只建立在此前文档的基础上。

- [000 理念](docs/000-philosophy.md)
- [001 领域模型](docs/001-domain.md)
- [002 授权](docs/002-authorization.md)
- [003 执行](docs/003-execution.md)
- [004 提示词](docs/004-prompts.md)
- [005 面板](docs/005-panel.md)
- [006 部署](docs/006-deployment.md)：手工安装、配置、升级与故障排查
- [007 架构](docs/007-architecture.md)
- [008 手册](docs/008-cookbook.md)：如何新增一个 Source

## 开发

`pnpm check` 会执行类型检查、测试和构建。

## 许可证

[MIT](LICENSE)
