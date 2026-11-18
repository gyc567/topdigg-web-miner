# article2media 项目简介（README English 章节中文译本）

原文：https://github.com/threerocks/article2media/blob/main/README.md ｜ 翻译自 README 的 English 章节 ｜ 权威版本以英文原文为准

**article2media**（原名 article2img）是一组开源的 Claude Code / Codex skill，同时也以 Claude Code 插件的形式打包，能把一篇文章或一个视频变成可直接发布的中文视觉内容。它包含十个彼此独立的能力：抓取、视频转逐字稿、改写（总结）、全文翻译、长图、卡片、公众号排版、口播视频、白板、漫画，这些能力既可以单独使用，也可以串联使用；此外还有一个入口 skill，提供一键组合（文章 → 改写 → 长图，文章 → 公众号排版，外文文章 → 翻译 → 公众号，视频 → 逐字稿 → 小红书卡片……）、批量处理以及发布反馈闭环。

- **输入：** 一条 X/Twitter 推文或长推、一个网页、一篇公众号文章、一个 Markdown 文件，或者一个视频：抖音、YouTube、哔哩哔哩链接，本地视频和音频文件，`.srt` / `.vtt` 字幕。视频会先被转成逐字稿文章，能拿到平台字幕时用平台字幕，否则使用本地 Whisper。
- **输出：**
  - 手机宽度的长图（加 `--wide` 则是 1200 px 的杂志页）；
  - 小红书（RedNote）3:4 轮播卡片，含 6 种封面版式，以及全卡引用 / 数字 / 图片三类变体；
  - 同一篇内容的多个封面变体，以及更轻量的形态：一页摘要、引用卡片、问答卡片；
  - 可直接粘贴的公众号排版；
  - 9:16 带解说的短视频，配本地 AI 配音（VoxCPM2）、逐词同步字幕（Whisper）、可选的原片片段和你自己的背景音乐；
  - 一字不改的原样排版（长图、卡片、公众号），并逐块回读校验；
  - 逐块与原文比对校验的完整中文译文；
  - 论证白板和漫画。
- **发布：** 一套品牌素材（头像、颜色、期号），面向多条链接的批量队列，带标题候选的单篇发布检查清单，以及带分平台报告的本地发布数据统计。
- **主题：** 12 套主推，9 套旧版。
- **验收：** 每份产物都自动检查，检查失败时退出码非零。改写稿还会与其原文比对校验（无出处的数字、给别人文章写第一人称标题、未使用的配图、原文数字与人名的覆盖率）。
- **模型回归：** `tests/eval-score.mjs` 和 `tests/model-eval.md` 用于对比执行同一任务的模型。Haiku 在规则项上与 Opus 持平，在盲测中达到其约 88% 的水平。
- **环境要求：** 零 npm 依赖，只需要 Node.js 22 和 Chrome。主题字体可以用一条显式命令镜像到本地；渲染本身从不下载任何东西。
- **安装：** `claude plugin marketplace add threerocks/article2media && claude plugin install article2media@article2media`，或者 `npx skills add threerocks/article2media -g -a claude-code -a codex -y`（安装全部 skill：它们共享 `article2media/engine`）。

<!-- 译自 article2media 仓库英文文档，MIT License，原作者 LeiLiu -->
