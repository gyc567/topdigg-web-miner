[![中文](https://img.shields.io/badge/%E4%B8%AD%E6%96%87-f2e3e3?style=for-the-badge&labelColor=f2e3e3&color=b07070)](https://github.com/eternityspring/shuohao-skills/blob/main/skills/novel-characters/README.md)
[![English](https://img.shields.io/badge/English-8b1a1a?style=for-the-badge)](https://github.com/eternityspring/shuohao-skills/blob/main/skills/novel-characters/README.en.md)
[![Follow on X](https://img.shields.io/badge/Follow-%40eternityspring-b07070?style=for-the-badge&labelColor=8b1a1a&logo=x&logoColor=f2e3e3)](https://x.com/eternityspring)

# novel-characters

喂给它一部小说或一个短篇故事，就能得到每个角色的完整设计圣经：

- **演员表（Cast list）** —— 哪些角色出场、重要程度如何，一个角色被称呼过的所有名字都会归并到同一个人身上
- **角色档案（Profile）** —— 性别、年龄、地位、外貌、性情、动机、人物弧光、人际关系，每一项都由**原文逐字引用**支撑
- **设计提示词（Design prompts）** —— 双语图像提示词 + 负向提示词 + 标签，可直接用于 Midjourney / SD / GPT-Image。画风不写进提示词：调用方在生成时为整批提示词前置一条风格指令
- **声音提示词（Voice prompts）** —— 音色、音高、语速、口音、情绪，外加一条用于 Qwen3-TTS / ElevenLabs Voice Design 的声音设计提示词
- **角色设定图（character model sheet）** —— **每个角色一张**：一张 16:9 的图分为三个区域：左侧是证件照风格的半身像（约 34%，作为脸部设计的参考），右上角是全身转面图，右下角是关键细节特写的条带。白色背景，便于干净抠图。**本技能不生成图像** —— 指令本身就是交付物
- **关系图谱（Relationship map）** —— 报告中的全员视角视图：谁与谁相关，以及如何相关。悬停某个角色可点亮其参与的所有连线，点击可跳转到该角色的档案

输出 `cast.json`、一份 Markdown 报告，以及一个自包含的 `report.html`，双击即可打开。

**输出语言不限**，默认为中文：

```
/novel-characters ./book.txt --lang en
/novel-characters ./book.txt --lang ja
```

中文、英文和日文的界面文案已内置。**其他语言同样可用** —— 该技能会即时把界面标签翻译成目标语言，并存放在 `cast.json` 的 `ui` 字段中，因此法语、韩语或西班牙语的报告都是完全本地化的，而不是半英半中。

![report.html](https://github.com/eternityspring/shuohao-skills/blob/main/skills/novel-characters/assets/report.webp)

角色设定图（沈知微，出自内置的示例故事）：

![model sheet](https://github.com/eternityspring/shuohao-skills/blob/main/skills/novel-characters/assets/sheet.jpg)

## 上游

在流水线中，**大纲位于角色圣经的上游**：

```
novel-outline    → outline.json (what: structure & episodes, who is in)
novel-characters → cast.json    (who: character assets)
```

如果你手头有 `outline.json`，就从 `seed` 开始 —— 其中的 `characters` 区块已经确定了角色名单：

```bash
node scripts/novel-characters.mjs seed outline.json > seed.json
```

带过来的内容是大纲已经决定的部分（角色 id、姓名、层级、人物弧光、哪些原角色被合并进了这一个）；留空的部分则是这一层需要补上的工作（别名、档案、设计提示词、声音提示词）。`tier` 映射到 `importance`：`lead` → protagonist，`support` → supporting，`functional` → minor。

**不要在这里推翻大纲的层级**；如果某个层级看起来不对，请去修大纲。在 lead 组*内部*做拆分是可以的 —— `lead` 涵盖所有主角以及主要反派，所以 `seed` 会把 protagonist 分配给他们所有人，你再根据 `seedNote` 中记录的 `role` 把其中的非主角降级为 major。

**没有大纲也能正常运行** —— 本技能并不依赖它。跳过 `seed`，直接喂给它原始小说，它会从文本本身构建角色名单。

## 使用

安装方式参见[仓库 README](https://github.com/eternityspring/shuohao-skills/blob/main/README.md)。然后：

```
/novel-characters ./your-novel.txt
```

或者直接说"把这本书拆成角色"，并给出路径。

### 报告语言

默认为中文。使用 `--lang`，或者直接用语言说明：

```
/novel-characters ./book.txt --lang en
/novel-characters ./book.txt --lang ja
```

中文、英文和日文的界面文案已内置。**其他任何语言同样可用** —— 该技能会即时把界面标签翻译成目标语言，并存放在 `cast.json` 的 `ui` 字段中，因此法语、韩语或西班牙语的报告都是完全本地化的，而不是半英半中。

有两样东西从不随语言变化：**图像提示词和 TTS 提示词始终是英文**（这两种引擎在英文下效果最好），**原文引用保持原语言**（一旦翻译，它们就不再是证据了）。

## 报告长什么样

一个三栏工作台：顶部是搜索，左侧是梗概加上按重要程度排序的演员表，主区域一次展示一个角色。

**关系图谱**位于左侧栏顶部，并接管主区域。它的连线直接来自每个角色的 `relationships` —— 没有额外的模型调用：

- 连线通过**姓名*与*别名**解析，因此写成"老伯"的关系依然会落在老周的节点上
- 同一对角色的两段单向描述会合并为一条连线，两种措辞都保留
- 每条弦上带一个短标签（6 个字符，完整文本在提示框和侧边列表中）。角色规模大时标签会变得杂乱，因此默认在 14 条连线以内开启，超过则关闭，页眉中有一个开关
- 悬停某个角色可点亮其参与的所有连线，悬停某一行可单独隔离出一条连线，点击两者中的任何一个都会打开该角色

圆形布局在 Node 中计算，并直接写入内联 SVG —— **不依赖任何库**，因此 report.html 依然是单个可离线打开的文件。

### 导出 JSON

顶栏的 **Export JSON** 按钮下载的正是 `cast.json` 的结构 —— 不是另一种单独的导出格式：

```json
{ "source": "…", "lang": "zh", "summary": "…", "characters": [ … ] }
```

因此外部工具可以编辑它，并**直接把它回灌进 `render`**，而它依然能通过 `validate`。每个角色都保留自己的 `sheetImage` 路径，因此你知道哪张设定图属于谁 —— 把 `render --images <dir>` 指向生成好的设定图所在位置，它就会把它们接上（不带该参数时，它会在 cast.json 旁边的 `images/` 中查找）。

数据以 `<script type="application/json">` 内嵌；导出只是把它包进 Blob 并下载 —— **没有任何网络请求**。

## 工作原理

把长文本一次性喂进单个上下文窗口会丢失角色，因此它分两遍运行：

**第一遍 —— 扫描**（廉价模型）
文本按段落边界切分成相互重叠的 4 万字符分块。每个分块并行扫描，找出角色姓名、别名、具体描写和逐字引用。正是重叠部分保证了一个恰好在分块接缝处被引入的角色对两侧都可见。

**合并**
姓名和别名一起建立索引，因此不同分块中不同的称呼方式会汇聚到同一个人身上。当精确匹配无法覆盖时（「陆」与「陆行远」没有共同键），脚本会列出基于包含关系的 `mergeCandidates` 供模型复核；已确认的合并会依据 merges.json 确定性地应用。角色按被提及的分块数量排名 —— 该排名是出场时长的代理指标。

**第二遍 —— 档案**
只有排名靠前的 N 个角色（**默认 30 个**）会获得完整档案，由为其合并的所有观察构建而成。每个角色都会被告知同一演员表中其他"兄弟姐妹"的名字，这样他们的外貌和声音就不会彼此塌缩。族裔、时代和地域是从原文推断的，并明确写入图像提示词 —— **它们不跟随 `--lang`**。把报告渲染成日文，并不会把一个民国时期的中国船夫变成日本男人。

**校验**（绝不跳过）
三条硬性规则，全部由脚本确定性地检查，而不是信任模型：

| 规则 | 原因 |
| --- | --- |
| `evidence` 必须是来源的**逐字、连续**片段 | 防止编造。被叙述节拍打断的对话不允许被重新拼接起来 |
| 图像提示词**不得包含角色姓名** | 图像模型对姓名非常敏感，会画出它记得的角色，而不是你描述的那个 |
| **按字段区分语言** | 供人阅读的字段遵循 `--lang`，图像和 TTS 提示词始终是英文 —— 否则模型会漂移 |
| 结构与枚举 | `importance` 是恰好四个取值之一 |

这些规则没有一条是预先写好的。每一条之所以存在，都是因为真实的模型输出违反了它，而校验器抓到了它。

## 直接使用脚本

这些辅助脚本无需 agent 也能正常运行 —— 只有两遍模型处理需要 agent：

```bash
node scripts/novel-characters.mjs seed outline.json              # seed the roster from an outline, if you have one
node scripts/novel-characters.mjs chunk book.txt /tmp/wk        # split
node scripts/novel-characters.mjs merge /tmp/wk                 # merge roster-*.json, with merge candidates
node scripts/novel-characters.mjs merge /tmp/wk --apply m.json   # apply reviewed merges
node scripts/novel-characters.mjs assemble /tmp/wk --source Book # combine card-*.json into cast.json, prominence-ordered
node scripts/novel-characters.mjs validate cast.json book.txt   # validate
node scripts/novel-characters.mjs render cast.json --html       # build report.html
node scripts/novel-characters.mjs slug "胡二爷"                  # filesystem-safe name
```

## 限制

- 每次运行最多处理 24 个分块（扣除重叠后约 93 万字符）。超出后它会明确报告 `truncated` —— 它**不会**悄悄丢掉尾部
- 供人阅读的字段遵循 `--lang`；图像和 TTS 提示词**始终是英文**，因为无论报告语言为何，这两种引擎在英文下效果最好
- 默认按重要程度为前 30 个角色建立档案，**其中每一个都会获得一张设定图** —— 每个角色一次调用，所以在角色规模较大时这是最慢的一步。如果想缩短，可以要求更小的数量，或者只要主要角色
- **画风不写进提示词。** 它是下游生成器在生成时为整批前置的一层。把某种画风钉死进每条提示词过去能抑制部分漂移，但那会把每条提示词冻结在一种风格上，并与调用方的选择相冲突。因此，演员表内部的一致性是生成器的问题；参见 `references/sheet.md`

## 文件

```
SKILL.md                 the workflow the agent reads
scripts/
  novel-characters.mjs   chunk / merge / assemble / validate / render / slug
  selftest.mjs           329 assertions, never calls a model
references/
  roster-pass.md         pass 1: scanning for characters
  profile-pass.md        pass 2: building a character sheet (8 hard rules)
  schema.md              sheet structure and which language each field takes
  sheet.md               layout spec for the model sheet
  report-style.md        design conventions for report.html
examples/
  渡口.txt                bundled short story, 4 characters
  渡口-cast.json          its output, doubling as the validation fixture
  渡口-cast.md            rendered result, a quality baseline
```

在 `examples/渡口.txt` 中，那个小贩始终只以绰号被称呼，而船夫有一次被称作"老伯" —— 这个故事的存在正是为了检验别名合并。

## 自测

```bash
node scripts/selftest.mjs
```

覆盖切分、别名合并、组装、本地化、校验和渲染的 329 项断言。不调用模型，不消耗额度，约一秒跑完。改动脚本后，请先运行它。

**仅在 macOS + Node 24 上测试过。** 其中没有平台特定代码，因此 Linux 和更旧的 Node 版本应该也没问题，但这一点**未经验证**。
