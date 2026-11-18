# article2media 仓库开发约定（CLAUDE.md 中文译本）

原文：https://github.com/threerocks/article2media/blob/main/CLAUDE.md ｜ 版本 2.3.1 ｜ 译自英文原文，仅供中文读者参考，权威版本以英文原文为准

## 关于本文件

本文件是 Claude Code 在本仓库中工作时需要遵循的开发约定（不涉及使用 skill 时的行为，那部分见 `skills/*/SKILL.md`）。

## 概览

这是一个 skills 仓库，同时也是一个 Claude Code 插件（`.claude-plugin/`，`"skills": "./skills"`）。从 2.0 起它包含 **11 个 skill**：十个彼此独立的能力，以及一个把这些能力串成推荐组合的入口 skill。输入文章或视频，输出中文视觉内容（长图、定比例卡片、公众号、口播视频、白板、漫画），并提供 12 套主推主题（另有 9 套旧主题仍可按名称渲染）。

| skill | 能力 | 输入 → 输出 |
|---|---|---|
| `article-fetch` | 抓取文章 | URL / 文件 → `article.md` |
| `video-transcript` | 视频 → 逐字稿 | 链接 / 媒体文件 / .srt → `article.md` + `transcript/` |
| `article-rewrite` | 改写（总结） | `article.md` → `content.json`；`export.mjs` → `rewrite.md` + 配图 PNG |
| `article-translate` | 全文翻译 | `article.md` → `article.zh.md`（由模型撰写；`translate.mjs check` 负责校验） |
| `long-image` | 长图 | `content.json` → 手机宽度的摘要页（`--wide`：1200 px 双栏杂志页）；`article.md` → 原文长图 |
| `image-cards` | 3:4 / 4:5 / 1:1 / 9:16 卡片 | `content.json` → 设计好的卡片（6 种封面版式，全卡引用 / 数字 / 图片三类变体）；`article.md` → 原文卡片 |
| `wechat-layout` | 公众号排版 | 文章（仅 `.md`）→ 可直接粘贴的行内样式 HTML + 封面 |
| `explainer-video` | 9:16 视频 | 文章（+ `content.json`）→ `video.json` → MP4 |
| `logic-whiteboard` | 论证白板 | `article.md` → `whiteboard.json` → PNG |
| `article-comic` | 漫画 | `article.md` → `comic.json` → 分镜 + PNG + 3:4 卡片 |
| `article2media` | 入口 + 共享引擎 | 推荐组合；`engine/` 存放全部代码、版式、主题、音色 |

## 仓库结构

```
article2media/
├── .claude-plugin/              # plugin.json, marketplace.json, icon.png
├── .claude/skills/<name>        # 指向 skills/<name> 的软链，供本仓库本地使用
├── skills/
│   ├── article2media/           # 入口 skill + 共享引擎
│   │   ├── SKILL.md             # 组合方式与路由
│   │   ├── scripts/             # 入口层工具（非能力本身）：stats.mjs, batch.mjs, fonts.mjs 包装
│   │   ├── references/          # 共享文档：pipeline.md（含 handoff（交接）文件、原文与改写对照表、调用兄弟 skill 的方式）, verbatim.md, styles.md
│   │   └── engine/
│   │       ├── scripts/         # Node 22 CLI，零 npm 依赖：fetch, render, export, translate, illustrate, video, comic, doctor, stats, batch, fonts；以及 lib/
│   │       ├── layouts/         # 各版式的结构 CSS（long, long-mobile, card, full, cards-article, wechat, wechat-article, whiteboard, comic, video）
│   │       ├── themes/          # 主题（首行注释 = 名称 | 描述；catalog.json = 12 套主推 + 9 套旧版）；illustration-styles.json, caption-styles.json
│   │       └── assets/voices/   # VoxCPM2 设计音色（catalog.json）
│   └── <capability>/            # SKILL.md, agents/openai.yaml, references/, scripts/（指向引擎的薄包装）
│       └── …                    # article-rewrite/examples/：测试使用并作为模型范例的 content.json 测试数据
├── tests/                       # run-all.mjs（自测矩阵）, unit.mjs（离线, mock fetch）, visual.mjs + baseline/（像素回归）, eval-score.mjs + model-eval.md（模型回归）, theme-sheet.mjs, showcase.mjs
├── scripts/install.sh           # 依赖检查；只打印命令，不下载任何东西
├── experiments/                 # 本地原型（已 gitignore）
└── article2media-out/           # 生成的产物（已 gitignore）
```

## 架构

- **所有 skill 共享一套引擎，通过文件交接。** 每个能力 skill 的 `scripts/*.mjs` 都是约 10 行的包装脚本，用来定位 `../../article2media/engine/scripts/`（或 `$ARTICLE2MEDIA_ENGINE`），设置 `A2M_CLI`（它自己的名字，用于输出使用提示）以及预设参数（`--layout card`、`--kind video` 等），然后导入引擎脚本。skill 之间从不互相 import，它们在同一个工作目录里交换 `article.md`、`article.zh.md`、`content.json`、`rewrite.md`（见 `skills/article2media/references/pipeline.md`）。若安装某个能力时旁边没有 `article2media`，会以明确的报错信息失败（有测试覆盖）。
- **流水线由输入决定**，判断逻辑在 `render.mjs` 里：文章（`.md`）按原样排版（verbatim，即不改动原文，入口为 `render-full.mjs`, `render-cards-article.mjs`, `render-wechat-article.mjs`）；`content.json` 则进入设计排版（长页面、卡片）。`--layout wechat` 只接受文章，改写稿要进入公众号需经 `export.mjs` → `rewrite.md`（配图以 PNG 形式导出到对应主题，frontmatter（前置元数据）为 `kind: rewrite`）。
- **卡片会自行适应版面**（`lib/layout-card.mjs` 中的 `window.__fit`）：配图按其实际绘制内容缩放，卡片溢出时可丢弃的部分会被移除（`data-drop`），剩余空间用于放大字号（`.roomy`）和补充可选元素（`data-fill`）。封面与全卡变体由 `cover.style` / `card.style` 决定；每套主推主题都有自己对 `.cv-deco`、`.cv-band` 和 `.c-quote` 的样式。
- **一份 content.json，多种切法。** `render.mjs --covers` 对每个变体只绘制一次封面（`cover.alts`，或所有适用版式）；`--form quotes|onepage|qa` 绘制更轻量的独立形态（`planCards(…, form)`）；品牌套件（`lib/brand.mjs`：头像、主色、期号、slogan、关注引导）会在封面上加角标、在最后一张卡片和长页页脚加品牌区块，并在主题 CSS 之后追加 `--accent-1`。
- **批量处理与反馈闭环位于入口 skill。** `batch.mjs` 通过 `fetch.mjs`（子进程）抓取一批链接，维护 `article2media-out/batches/<name>/queue.json` + `queue.md`，并从磁盘重新计算每个条目的状态（`lib/workdir.mjs` 依据其中的文件和质检报告对产物目录分类）；改写仍由模型完成。`batch.mjs checklist` 写出 `publish.md`（上传顺序、来自 `xhs.title` / `wechat.title` / `publish.titles` 的标题候选、平台限制）。`stats.mjs` 把发布记录和指标快照记入 `<workdir>/publish.json`，并汇总为 `article2media-out/stats-report.md`；样本数 n<5 的分组标记为 样本不足，`styles.md` 第 4 步只把 n≥5 的行当作平局时的判定依据。
- **字体。** 主题通过 `@import` 引用网络字体；`fonts.mjs`（一条显式命令）把它们镜像到 `<cache>/fonts`，`lib/chrome.mjs` 的 `goto` 在 manifest 收录了本地副本时，会把每个已构建页面中的 `@import` 换成本地副本。渲染过程从不下载任何东西。字体质检报告按字族分别给出。
- **图像生成**（`lib/imagegen.mjs`）：一张默认模型表，可通过环境变量或 `~/.config/article2media/config.json` 覆盖；遇到鉴权、配额、可用性错误时回退到下一个服务商，但遇到拒绝生成时绝不回退；参考图在三个服务商上都可用。
- **改写稿要与其原文比对校验**（`lib/source-check.mjs`，当 `article.md` 与 `content.json` 相邻时由 `check.mjs` / `render.mjs` 触发）：原文中从未出现的数字、给别人文章写第一人称标题、文章自带的配图未被使用，以及原文数字与反复出现的人名是否都被覆盖。`validate.mjs` 还会补充深度提示（分镜、每节两幅配图、全卡节奏、与标题不匹配的大数字）。这些都是 ⚠ 级提示，经过测试的模型会把每一个 ⚠ 都压到 0，因此凡是影响质量的要求都应写进这里，而不只停留在文字描述里。
- **模型变更要靠测量，而不是靠假设。** `tests/eval-score.mjs` 给一个已完成的「改写 → 卡片」工作目录打分（版面 / 规则 / 深度 / 覆盖 / 交付，共 100 分，`--ref` 可给出相对比例）；`tests/model-eval.md` 是评测流程（用同一提示让参考模型和一个更小的模型处理 3 篇文章，再做盲测并排对比）。评测用的文章不要放进文档示例里。
- **内容与样式分离。** 版式 CSS 与主题 CSS（变量加少量结构性覆盖，最后加载）通过 DevTools 协议在无头 Chrome 中截图（`lib/chrome.mjs`）。
- **原样排版流水线共享一本 ledger（账本）**（`lib/layout-full.mjs`）：`loadArticle`（frontmatter、`parseBlocks`、解析覆盖率检查）、`readbackInPage`（按 `data-source-block` 逐块读取 DOM 文本，忽略 `[data-deco]`，`merge` 会把被拆到多张卡片的块合并）、`compareLedger`（针对公众号的 `looseBreaks`，那里的换行是 `<br>`）。原文卡片会在页面中按顺序流动（`flowInPage`），并在行、条目或表格行的边界处切分段落 / 列表 / 表格。
- **输入：** `fetch.mjs`（`--kind article|video`）把任何来源转成 `article.md`。视频走 `lib/media/`（抖音分享页 → yt-dlp；YouTube / 哔哩哔哩字幕经由 yt-dlp；其余情况用本地 Whisper；`.srt` / `.vtt` 直接解析），产出带时间戳的逐字稿，存放在 `transcript/`。
- **每种产物都有自己的验收**，出错时运行会以退出码 1 失败：版面质检、原样排版的块账本、白板账本、翻译结构检查、漫画文字边界、视频安全区与时序。
- **可选能力只做探测，从不强依赖：** 图像生成（Codex CLI → OpenAI → Gemini）、本地音色（VoxCPM2）、Whisper、edge-tts、yt-dlp。缺失时要么优雅降级，要么以明确的提示停止；绝不隐式安装或下载任何东西。

## 约定

- 面向用户的文字（CLI 输出、references、SKILL.md）使用简体中文；代码注释使用英文。
- 脚本打印 `✓ / ⚠ / ✗` 开头的行，最后给出一行 `版面检查：N 个错误，M 个提示` 汇总（翻译任务则是 `翻译检查`）；出现错误时退出码非零。
- 生成的图像里不含任何文字，所有文字都用 HTML 实现。图像提示词只描述可观察到的属性，绝不提及艺术家名字。
- 除来源署名之外，不要把制作说明、免责声明或质检状态放进图像里；应在交付回复中报告。
- SKILL.md 中的路径使用 `${CLAUDE_SKILL_DIR}/…`；引用其他 skill 时使用 `../<skill>/…`。测试套件会检查每一个 `${CLAUDE_SKILL_DIR}` 路径都存在。
- 新增一个能力 = 新建 `skills/<name>/`（SKILL.md、agents/openai.yaml、包装脚本），在 `pipeline.md` 和入口 SKILL.md 中各加一行，并在 `.claude/skills/` 下加一个软链。
- `batch.mjs` 带有 `fetch.mjs` 中 `slugify()` 的一份拷贝（有测试保证两者一致），改动时两处都要改。
- 版本号写在每个 `skills/*/SKILL.md` 的 frontmatter、`.claude-plugin/plugin.json` 和 `marketplace.json` 中，必须全部同步升级（测试会检查三者一致），并补一条 `CHANGELOG.md` 记录。

## 测试改动

```bash
node tests/run-all.mjs --quick            # skills、CLI、插画/公众号/原文卡片/翻译/视频/全文/白板/漫画检查，examples × layouts
node tests/run-all.mjs                    # 完整矩阵，覆盖每一套主推主题
node tests/run-all.mjs --themes quiet     # 只跑部分主题（新增主题时）
node tests/unit.mjs                       # 离线单元检查（图像配置 / 回退、mock fetch）
node tests/visual.mjs [--update]          # 针对 tests/baseline/ 的像素回归（需要本地字体；有意改动版式后加 --update）
node tests/eval-score.mjs <dir> --ref <dir>   # 把某个模型的「改写 → 卡片」产物与参考产物对比打分（见 tests/model-eval.md）
node tests/theme-sheet.mjs                # 重新生成 docs/themes.jpg
claude plugin validate .
```

通过 = 每项检查都是 ✓，且每次渲染 0 个版面错误。装好本地字体后（`fonts.mjs`），每次渲染拥有独立的 Chrome 缓存，渲染可以并行；没装字体时它们共用 `<cache>/http-cache`，此时只能一次跑一个。改动了版式或主题之后，要看渲染出来的 PNG（以及 `review/` 切片 / `overview.jpg`），而不能只看测试结果。

<!-- 译自 article2media 仓库英文文档，MIT License，原作者 LeiLiu -->
