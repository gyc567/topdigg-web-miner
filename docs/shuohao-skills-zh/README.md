# shuohao-skills 中文文档译本

本目录是 `shuohao-skills` 项目官方英文文档的中文译本集合。

上游仓库：https://github.com/eternityspring/shuohao-skills ｜ 译本对应版本：2.2.1 ｜ 上游许可证：Apache-2.0 ｜ 原作者：烁皓（eternityspring）

## 上游文档的语言状况

上游仓库的文档**以中文为主、英文为辅**：全部 7 个 `skills/*/SKILL.md`、全部 `skills/*/references/*.md`、根目录 `README.zh.md` 原文即为简体中文。

英文文档集中在两处：

- 根目录 `README.md`（英文版项目主页）
- 每个 skill 的 `README.en.md`（英文版使用说明，共 7 份）

另有 2 份非 skill 文档：根目录 `AGENTS.md`（仓库行为规则）、`docs/superpowers/specs/2026-08-21-shot-recipes-repository-migration-design.md`（shot-recipes 仓库迁移设计）。

**本目录译出了全部 10 份英文文档。**

## 本目录翻译了哪十份文档

| 本目录文件 | 对应上游文档 | 原文行数 | 用途 |
|---|---|---|---|
| [README.zh.md](./README.zh.md) | `README.md` | 229 | 项目主页：skill 一览、开场站位说明、五阶段报告合页、安装、前置条件、仓库约定、端到端工作目录约定 |
| [AGENTS.zh.md](./AGENTS.zh.md) | `AGENTS.md` | 10 | 仓库行为规则：文案规范、自包含要求、样例数据原则、渲染产物不进版本库、门失败累积的推广边界 |
| [shot-recipes-migration-design.zh.md](./shot-recipes-migration-design.zh.md) | `docs/superpowers/specs/2026-08-21-shot-recipes-repository-migration-design.md` | 114 | shot-recipes 从本仓库迁移到新私有仓库的完整设计：目标、迁移范围、历史策略、旧仓库清理、提交流程、验证与失败恢复 |
| [skills/novel-outline.zh.md](./skills/novel-outline.zh.md) | `skills/novel-outline/README.en.md` | 82 | 改编大纲 skill 说明：14 道质量门、报告长什么样、体检模式、长文本处理、与 novel-characters 的关系 |
| [skills/novel-characters.zh.md](./skills/novel-characters.zh.md) | `skills/novel-characters/README.en.md` | 178 | 角色设定 skill 说明：上游依赖、用法、报告语言、报告构成、内部机制、脚本直用、限制、文件结构、自测 |
| [skills/novel-art.zh.md](./skills/novel-art.zh.md) | `skills/novel-art/README.en.md` | 61 | 美术设定 skill 说明：10 道质量门、三 skill 接力、命令行、设定图版面规范、自测 |
| [skills/novel-script.zh.md](./skills/novel-script.zh.md) | `skills/novel-script/README.en.md` | 95 | 剧本 skill 说明：10 道质量门、报告内容、接力关系、命令行、限制、自测 |
| [skills/novel-staging.zh.md](./skills/novel-staging.zh.md) | `skills/novel-staging/README.en.md` | 79 | 开场站位 skill 说明：8 道质量门、可拖动的俯视报告、在管线中的位置、命令行、自测 |
| [skills/novel-storyboard.zh.md](./skills/novel-storyboard.zh.md) | `skills/novel-storyboard/README.en.md` | 129 | 分镜 skill 说明：18 道质量门、门失败累积与 stats、报告、管线收口、命令行、限制、自测 |
| [skills/character-refs.zh.md](./skills/character-refs.zh.md) | `skills/character-refs/README.en.md` | 103 | 角色参考图 skill 说明：分档、一次性输入、模型、画风、标识与重出、质量门、报告、命令行、自测、已知限制 |

## 翻译原则

1. **命令、路径、文件名、脚本名、字段名、JSON key、CLI 参数、模型 ID 一律不译**，与上游完全一致，方便直接复制执行。
2. **代码块保持原样**，一个字符都不改，只翻译其中的说明性文字（若原文代码块内含中文注释，注释亦保持中文原样）。
3. **技术专有名词保留英文**，首次出现时给出「英文（中文）」形式，例如 agent（智能体）、hook（钩子）、quality gate（质量门）。
4. **标题层级、表格结构、列表顺序与原文一一对应**，不合并、不删减、不重排；表格列数与行数完全一致。
5. **译文完整**，不省略任何段落，不使用省略号或「此处略」之类的写法。
6. **文末固定署名段不翻译**（仅涉及博客文章，不涉及本目录文档）。
7. **权威版本以英文原文为准**，本译本仅供中文读者阅读参考，若译本与上游英文原文表述有出入，以英文原文为准。
8. **上游链接已改写为绝对 URL**：本译本位于另一个仓库的 `docs/` 目录下，上游仓库内的相对链接（如 `README.md`、`assets/report.webp`）已统一指向 `https://github.com/eternityspring/shuohao-skills/blob/main/…`，保证在本站点可点击。

## 相关阅读

- 分析长文：《6800 星的 shuohao-skills：AI 短剧真正的门槛不是生成，是谁敢把质量门写成代码》——见本站博客 `2026-11-19-shuohao-skills-analysis`。
