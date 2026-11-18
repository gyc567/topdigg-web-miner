[![中文](https://img.shields.io/badge/%E4%B8%AD%E6%96%87-f2e3e3?style=for-the-badge&labelColor=f2e3e3&color=b07070)](https://github.com/eternityspring/shuohao-skills/blob/main/skills/novel-storyboard/README.md)
[![English](https://img.shields.io/badge/English-8b1a1a?style=for-the-badge)](https://github.com/eternityspring/shuohao-skills/blob/main/skills/novel-storyboard/README.en.md)
[![Follow on X](https://img.shields.io/badge/Follow-%40eternityspring-b07070?style=for-the-badge&labelColor=8b1a1a&logo=x&logoColor=f2e3e3)](https://x.com/eternityspring)

# novel-storyboard

为 AI 短剧制作分镜：把 novel-script 的节拍流转成一份可以直接交给视频模型的工作清单。这是流水线中第一个与该模型直接对话的层级，其前提已经内建：**镜头是生成出来的，所以多切一刀几乎不花成本** —— 而短剧的注意力节奏是按约 3 秒一切来走的。因此采用三级结构：

```
segment = one video-generation call, ≤ 15s, never crosses scenes
 ├─ cuts × 3–5 = intra-segment edits, 2–5s each (hard gate), each claiming script beats
 ├─ frames    = one keyframe per cut: the master frame pinned at 0.00s,
 │              sub-frames pinned at their own cut marks
 └─ H3 prompt = one per segment; multi-picture alignment + [Shot k] cut times audited verbatim
```

- **一段对话的正反打位于同一段、同一次生成之内** —— 全景、A 的近景、B 的近景分别是各自 2–5 秒的独立剪辑，每一处的构图都由它自己的分镜帧控制，而不是靠散文式描述去碰运气
- **对齐指令是推导出来的，而非手写** —— 多图对齐行（`Picture 2 aligns with the 3.00-second mark…`）以及每一个 `[Shot k] At 00:0X.XXX` 剪辑时间点都由剪辑时长计算得出，而 validate 会**逐字符**核对：改了时长却没改提示词，它就会阻断
- **提示词遵循官方规范：默认英文，每个镜头一行** —— 每个镜头单独一行并附带其剪辑时间；对话、歌词与屏幕文字按官方规则保留原语言（`<d>[Chinese] …</d>` 逐字保留）。`promptLang: 'zh'` 会把整条提示词切换为中文。写作规范已内化为 `references/h3-prompt.md` —— **本 skill 自包含，不依赖任何外部 skill**
- **分镜帧是素材组合，而非凭空创作** —— 每一帧都带有一份引用清单：它必须由哪些场景图 / 角色图 / 道具图构建而成。**本 skill 不生成这些图片**；提示词与该清单才是交付物

输出 `storyboard.json`、一份 Markdown 镜头清单，以及一份自包含的 `storyboard-report.html`：

![storyboard-report.html](https://github.com/eternityspring/shuohao-skills/blob/main/skills/novel-storyboard/assets/report.webp)

## 十八道质量门禁，全部由代码执行

与本仓库中另外四个 skill 立场一致：**一份让模型给自己打分的清单毫无价值。**

| 门禁 | 规则 |
| --- | --- |
| **节拍全覆盖** | 每个剧本节拍恰好被认领一次，顺序正确、连续、在剪辑级别上完成 |
| 单段时长 | 0 < Σcuts ≤ 15s（单次生成上限；可通过 `params.maxSegmentSeconds` 调整） |
| **剪辑时长** | 每一刀 2–5s —— 约 3s 的节奏是**硬门禁**，不是建议 |
| 对白适配 | 已认领节拍的对话秒数 ≤ 剪辑秒数，逐刀计算 |
| 全集总时长 | Σ 段数落在剧本 `targetSeconds` 的 ±15% 之内 |
| 屏幕字数上限 | 每刀 ≤ 3 个字，更多则须附拆分说明 |
| 段 ID 规范 | `E01-01` 格式，顺序编号 —— 段 ID 即素材文件名 |
| 景别词 | 中文景别词（如 特写）必须出现在该刀的帧提示词中 |
| 运镜词汇 | 运镜使用 H3 的官方术语（`Push In` / `Pan Left` / `Tracking Shot`…），且必须出现在**该刀自己的 [Shot k] 段落**内 |
| **H3 结构** | 对齐行**由剪辑结构推导得出并被逐字核对**；三个字段按顺序排列；每个 `[Shot k]` 的剪辑时间等于此前各刀时长之和 |
| **H3 对白逐字** | 每句已认领台词都逐字出现在某个 `<d>` 块内 —— 改一个标点都会失败 |
| **提示词语言一致性** | 散文部分对照 `promptLang` 双向核对：中文剧写成英文会失败，英文模式下混入中文也会失败 |
| 帧提示词洁净度 | 中文、非空（它有意点名角色 —— 名字指向所附带的设计图） |
| 视频提示词中不得出现人名 | H3 正文（无论何种语言）与 Seedance 镜头文本都不得包含角色名或别名 —— 官方的两份提示词指南都要求如此。使用 `--outline` / `--cast` 检查；跳过时会被**明确告知** |
| **构图字段** | 每段需有 `blocking`；每刀需有镜头 / 机位 / 构图 / 视线 / 焦点 / 稳定性，稳定性取自枚举 |
| **Seedance 镜头文本** | 每刀的 `shot` 须为中文且非空，不含时间点、镜号、图片引用、H3 标记，也不含 `{}` `<>` `（）` —— 这些由程序依据真实结构补上 |
| 引用完整性 | 场景索引 / 角色 / 道具均对照剧本场景核对 |
| **Shot recipe**（可选挂载） | 仅在使用 `--shots <cards dir>` 时检查：某刀的 `recipe` id 存在于卡片库中，该卡片每条必备短语都出现在该刀的帧提示词里，且多刀 recipe 的时长足够。未使用 `--shots` 时跳过会被**明确告知**；同样会告知“没有任何一刀引用 recipe” |

自测**刻意击败每一道门禁**，以证明每一道确实会阻断。

**Shot recipe 是一层可选的词汇表。** 每一刀可以携带一个可选的 `recipe` —— 来自外部可选卡片库的一个卡片 id，**按刀计，而非按段计**，**多刀 recipe 表示为一串连续使用同一 id 的刀**，而不是一个数组。没有安装外部卡片库时一切照常运行：本 skill 是自包含的，甚至自带一个 25 行的受限 frontmatter 解析器，而不跨目录导入。卡片建议的景别与运镜**刻意不设门禁** —— 报告的 Recipe 列会用 `≠` 标出偏差（悬停可看建议），`checkup` 会打印一条提示。recipe 是词汇而非法律；把可选挂载卡得太严就没人挂载了，**而误阻断的门禁比没有门禁更糟**。

## 门禁失败会累积，`stats` 告诉你模型最常违反哪条规则

每次 `validate` 和 `checkup` 都会把门禁结果追加到**当前目录**下的 `.gates.jsonl`。跑上几十次之后：

```bash
node scripts/novel-storyboard.mjs stats
```

它回答三个问题：

| 问题 | 它告诉你什么 |
| --- | --- |
| **哪道门禁触发最频繁** | 那条规则正是模型最容易忽略的 —— **需要改的是措辞，而不是模型** |
| **哪道门禁从未触发** | 要么是死门禁，要么是模型已经内化的规则 |
| **失败细节长什么样** | 那些反复出现却没有专属门禁的问题，只有读这段自由文本才会浮现 |

这正是 SkillOpt 中“skill 文档是可训练状态”这一理念中唯一值得借鉴的点：**文档不是一写就定的规格，而是从反馈中迭代出来的东西** —— 但迭代需要证据而非印象。日志只负责积累证据，改什么仍然由人决定。

传入 `--no-log` 可跳过记录。若文件无法写入，该步骤会静默跳过，校验本身不受影响。`.gates.jsonl` 已在 `.gitignore` 中。

## 报告

一份单页、宽 1600px 的审阅文档。报告默认以中文界面渲染；给 `render` 传入 `--lang en` 可得到全英文报告（内置 zh / en）。这只切换界面标签 —— 它与 `promptLang` 相互独立，后者控制 H3 提示词语言（默认为英文）。英文模式下质量门禁的标签也会翻译（阈值保持计算结果不变）；失败门禁的细节与所有数据保持原样。

- **KPI 条带**：段数 / 刀数与平均长度 / 总时长对比目标 / 生成批次 / 含对话的段数
- **剪辑节奏条**（招牌图表）：每一集一条带，**粗分隔线 = 段边界（每段一次生成）**，切片宽度 = 该刀时长占比，颜色深浅 = 景别；点击切片可跳转到对应的段卡片
- **段卡片**：主帧遵循顶层 `aspectRatio` 约定（默认 `16:9`，竖版分镜板用 `9:16`；旧的 `_meta.orientation` 与帧尾标签保留为兼容性回退）（未生成时给出诚实的提示词占位符），随后是子帧条，接着是**左右各半**的布局：左侧是刀的行（起始标记 · 秒数 · 景别 · 运镜 · recipe · **由已认领剧本节拍自动推导**的画面摘要），右侧是 H3 提示词面板 —— 每个镜头一行，支持一键复制
- **生成批次列表**：共享同一场景与光线状态的段归为一个批次，围绕一张环境参考图
- **音频对齐列表**：每一句对话都映射到 **段#刀** —— 摆放 TTS 音频的工作清单，完全由计算得出
- **质量门禁**面板 + 头部徽章 + **Export JSON**（原样下载 `storyboard.json`）
- 所有图形均为内联 CSS/SVG，零外部资源，可离线打开

## 接力 —— 流水线在此闭合

```
novel-outline    → outline.json    (what: structure)
novel-characters → cast.json       (who: character sheets)
novel-art        → art.json        (where: scene & prop sheets)
novel-script     → script.json     (the drama: scenes, beats, lines)
novel-storyboard → storyboard.json (how to shoot: segments, cuts, frames, H3 prompts)
```

`seed <script.json> --eps 1-3 --aspect 16:9` 以确定性的方式展开每一场的节拍列表（编号、每拍秒数、说话人），作为剪辑工作表，并写入正式的顶层 `aspectRatio`；可接受的取值为 `16:9` 与 `9:16`，默认 `16:9`。`validate --script` 是必需的；`--outline` / `--cast` 启用人名禁用检查，`--art` 则把场景名称与图缩略图带进报告。每一帧都携带一份提示词以及指明上游图纸的引用清单；生成在下游进行。H3 提示词加上帧集合可直接送入 MiniMax H3。

## CLI

```bash
node scripts/novel-storyboard.mjs seed script.json --eps 1 --aspect 16:9
node scripts/novel-storyboard.mjs validate sb.json --script script.json --outline outline.json --cast cast.json
node scripts/novel-storyboard.mjs checkup sb.json --script script.json
node scripts/novel-storyboard.mjs validate sb.json --script script.json --shots /path/to/cards   # optional: the 18th gate
node scripts/novel-storyboard.mjs render sb.json --html --script script.json --outline outline.json --art art.json > storyboard-report.html
node scripts/novel-storyboard.mjs render sb.json --html --lang en --script script.json --outline outline.json --art art.json > storyboard-report.html   # English report UI
node scripts/novel-storyboard.mjs export sb.json --script script.json   # per-segment folders: f1..fN.png + prompt.md
```

## 限制

- 不撰写或改写对话，不产出设计图，不做视频生成或剪辑
- 口型同步暂不在范围内 —— 那属于生成流水线的事
- 秒数是**生成顺序，而非估算**；请按你的模型在 `params` 中调整单段上限与剪辑节奏区间
- 报告界面提供中文（默认）与英文 —— 用 `--lang` 选择；提示词语言由 `promptLang` 单独控制（默认为英文）
- 先生成第一段的完整帧集合（3–5 张图）供审批，通过后再正式提交 —— 一集约 30–40 帧，而错误的美术方向会浪费整批生成

## 自测

```bash
node scripts/selftest.mjs
```

336 条断言 —— 节拍展开、H3 骨架推导、Seedance 组装、stats 与分批、击败门禁的用例、recipe 卡片解析与挂载、seed、渲染（两种报告界面语言、帧槽比例）、H3 与 Seedance 导出。不调用模型，约一秒完成。

随附的示例（`examples/渡口-storyboard.json`）是一份完整的第 1 集分镜 —— 10 个段、34 刀认领了全部 35 个剧本节拍，平均每刀约 3.5s，总时长 119s 对 120s 的目标，2 个生成批次，每个段都带有经过完整核对的 H3 提示词。

**仅在 macOS + Node 24 上测试过。**
