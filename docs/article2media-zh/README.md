# article2media 中文文档译本

本目录是 article2media 项目官方文档的中文译本集合。

上游仓库：https://github.com/threerocks/article2media ｜ 译本对应版本：2.3.1 ｜ 上游许可证：MIT ｜ 原作者：LeiLiu

## 本目录翻译了哪两份文档

article2media 仓库里共有两份英文文档，本目录已把它们完整译成简体中文：

| 本目录文件 | 对应上游文档 | 原文位置 | 原文行数 | 用途 |
|---|---|---|---|---|
| [CLAUDE.zh.md](./CLAUDE.zh.md) | `CLAUDE.md` | 全文 | 88 行 | 仓库开发约定，给 AI Agent（Claude Code）看的架构、目录结构、编码约定与测试方式 |
| [README-en.zh.md](./README-en.zh.md) | `README.md` 的 `## English` 章节 | 第 677 至 697 行 | 21 行 | 项目简介的英文版：输入、输出、发布、主题、验收、模型回归、环境要求、安装命令 |

## 翻译原则

1. **命令、路径、文件名、脚本名一律不译**，例如 `skills/article2media/engine/scripts/render.mjs`、`lib/layout-card.mjs`、`content.json`、`rewrite.md`、`article.md`、`article.zh.md`、`render.mjs --covers`、`node tests/run-all.mjs --quick`，保持与上游完全一致，方便直接复制执行。
2. **代码块保持原样**，只翻译其中的注释性文字，不改动任何可执行内容。
3. **技术名词保留英文**，首次出现时给出「英文（中文）」形式，例如 handoff（交接）、ledger（账本）、frontmatter（前置元数据）、verbatim（原样保留）。
4. **标题层级、表格结构、列表顺序与原文一一对应**，不合并、不删减、不重排。
5. **译文完整**，不省略任何段落，不使用省略号或「此处略」之类的写法。
6. **权威版本以英文原文为准**，本译本仅供中文读者阅读参考，若译本与上游英文原文表述有出入，以英文原文为准。

## 上游仓库其余文档的语言状况

上游仓库除上述两份英文文档外，其余全部文档的原文即为简体中文，本项目无需翻译：

- `README.md` 正文部分（`## English` 章节之前与之后的全部内容）原文即为简体中文。
- 全部 `skills/*/SKILL.md`（11 份）原文即为简体中文。
- 全部 `skills/*/references/*.md`（15 份）原文即为简体中文。
- `CHANGELOG.md`、`docs/introducing-article2media.md`、`tests/model-eval.md` 原文也已是简体中文。

换句话说，CLAUDE.md 与 README 的 English 章节是仓库里仅有的两份英文文档，已在本目录译出。

## 上游仓库文档索引表

行数为实际 `wc -l` 统计结果。

| 文档路径 | 语言 | 行数 | 用途 |
|---|---|---|---|
| `README.md` | 中文（正文）/ 英文（`## English` 章节，第 677 至 697 行） | 712 | 项目总览：功能、用法、路线图、致谢、许可 |
| `CLAUDE.md` | 英文 | 88 | 仓库开发约定：架构、目录结构、编码约定、测试方式（本目录已译为 `CLAUDE.zh.md`） |
| `CHANGELOG.md` | 中文 | 330 | 版本更新记录 |
| `docs/introducing-article2media.md` | 中文 | 434 | 项目介绍长文，带 frontmatter 元信息 |
| `skills/article2media/SKILL.md` | 中文 | 97 | 入口 skill：推荐组合与路由 |
| `skills/article-fetch/SKILL.md` | 中文 | 45 | 能力：文章抓取 |
| `skills/video-transcript/SKILL.md` | 中文 | 40 | 能力：视频转逐字稿 |
| `skills/article-rewrite/SKILL.md` | 中文 | 74 | 能力：改写（总结） |
| `skills/article-translate/SKILL.md` | 中文 | 45 | 能力：全文翻译 |
| `skills/long-image/SKILL.md` | 中文 | 57 | 能力：长图 |
| `skills/image-cards/SKILL.md` | 中文 | 56 | 能力：等比例卡片 |
| `skills/wechat-layout/SKILL.md` | 中文 | 49 | 能力：公众号排版 |
| `skills/explainer-video/SKILL.md` | 中文 | 29 | 能力：口播视频 |
| `skills/logic-whiteboard/SKILL.md` | 中文 | 30 | 能力：论证白板 |
| `skills/article-comic/SKILL.md` | 中文 | 29 | 能力：漫画 |
| `skills/article2media/references/pipeline.md` | 中文 | 92 | 共享：流水线、交接文件、调用兄弟 skill 的方式 |
| `skills/article2media/references/styles.md` | 中文 | 135 | 共享：主题与样式选用规则 |
| `skills/article2media/references/verbatim.md` | 中文 | 27 | 共享：原样排版的块账本校验 |

| `skills/video-transcript/references/video-input.md` | 中文 | 68 | 视频输入来源说明 |
| `skills/article-rewrite/references/writing-guide.md` | 中文 | 90 | 改写写作指南 |
| `skills/article-rewrite/references/figures.md` | 中文 | 162 | 配图生成规范 |
| `skills/article-rewrite/references/content-schema.md` | 中文 | 195 | `content.json` 数据结构说明 |
| `skills/article-translate/references/translate-guide.md` | 中文 | 39 | 翻译流程说明 |
| `skills/long-image/references/original-long.md` | 中文 | 20 | 原文长图说明 |
| `skills/image-cards/references/xhs-guide.md` | 中文 | 180 | 小红书卡片指南 |
| `skills/image-cards/references/original-cards.md` | 中文 | 36 | 原文卡片说明 |
| `skills/wechat-layout/references/wechat-guide.md` | 中文 | 44 | 公众号排版指南 |
| `skills/explainer-video/references/video-guide.md` | 中文 | 233 | 口播视频制作指南 |
| `skills/logic-whiteboard/references/mode-whiteboard.md` | 中文 | 60 | 白板模式说明 |
| `skills/article-comic/references/mode-comic.md` | 中文 | 62 | 漫画模式说明 |
| `tests/model-eval.md` | 中文 | 66 | 换模型回归测试流程 |

## 更新方式

上游仓库更新后，重新按同样原则翻译两份英文文档，并同步更新本文件的行数统计与版本号。

<!-- 译自 article2media 仓库英文文档，MIT License，原作者 LeiLiu -->
