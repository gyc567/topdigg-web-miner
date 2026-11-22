[![中文](https://img.shields.io/badge/%E4%B8%AD%E6%96%87-f2e3e3?style=for-the-badge&labelColor=f2e3e3&color=b07070)](https://github.com/eternityspring/shuohao-skills/blob/main/skills/character-refs/README.md)
[![English](https://img.shields.io/badge/English-8b1a1a?style=for-the-badge)](https://github.com/eternityspring/shuohao-skills/blob/main/skills/character-refs/README.en.md)
[![Follow on X](https://img.shields.io/badge/Follow-%40eternityspring-b07070?style=for-the-badge&labelColor=8b1a1a&logo=x&logoColor=f2e3e3)](https://x.com/eternityspring)

# character-refs

**真正生成**角色的参考图，素材来自任何故事 —— 一部小说的改编、你自己写的原创故事，或一个一次性的角色；不需要任何源文本。用一条消息描述一个角色，即可得到一组可直接挂到视频模型（H3 / Wan / Seedance）上的参考图。

![Character references report](https://github.com/eternityspring/shuohao-skills/blob/main/skills/character-refs/assets/report.webp)

**每一组只有一个根**：一张正面全身锚定图。它是唯一的文生图生成；头像、侧脸、背视图与细节图全部只引用该锚定图，彼此之间绝不互相引用 —— 因此某张图不好时只需单独重生成，不会牵连其他图。

## 层级 —— 默认第 2 层

| 层级 | 内容 | 何时 |
| --- | --- | --- |
| 1 | 正面全身（锚定图） | 始终，第一个 |
| 2（默认） | 正面头像、90° 侧脸、背视图 | 默认生成 |
| 3 | 细节：用户点名的细节，或角色最具辨识度的特征；缺省时取 头发/配饰、领口、袖口、鞋子 | 配饰或服饰细节的特写 |
| 4（默认关闭） | 45° 头像 | 仅在被要求时 |

基于一次 H3 测试：仅附带全身锚定图时，服装与背视图表现正确，但脸部会漂移；加入头像后脸部最接近。因此第 2 层默认生成；细节图与 45° 头像按需添加。

## 一次性输入

没有需要填写的表单。一条消息就够 —— 智能体会把它拆分为 身份、脸部、发型、体型、肤色、上装、下装、细节 等字段，补齐空缺，标注每个字段的来源（明确给出 / 推断 / 默认），并打印一张确认表。只有当年龄、性别或年代无法推断时才会发问。

## 模型

四种选项，首次使用时选定，此后保持不变：

| | 说明 |
| --- | --- |
| `qwen` | 你自己的 ComfyUI 上运行的 Qwen Image 2.1。每张 25–50 s，尺寸精确，无订阅额度限制 |
| `codex` | 本地 codex 内置的图像生成（GPT）。无需 API key，但会消耗你的 ChatGPT 套餐额度（Plus 约 25 张后触顶） |
| `openai` | OpenAI Images API，默认 gpt-image-2，按使用量付费 |
| `custom:<name>` | 你自己的命令，按 `{prompt_file}` `{refs}` `{out}` `{width}` `{height}` 模板化 |

**锚定图与派生图可以使用不同的模型，任何单张图也可以换模型重生成。** 一致性来自共享同一个锚定图，而非同一个模型 —— 测试中 Qwen 锚定图 + GPT 派生图、GPT 锚定图 + Qwen 派生图，以及在同一组内混用两者，都能保持协调。每张图都会记录自己的模型；混用只会带来一条提示。

## 风格

内置两种预设，中英文名称俱全：

```bash
node scripts/character-refs.mjs new 阿禾-intake.json --out out/                  # anime by default; --look realistic for photos
node scripts/character-refs.mjs looks                                             # list all presets
```

| 预设 | 名称 | 已测试 |
| --- | --- | --- |
| 动漫（默认） | `anime` / `cartoon` / `动漫` | Qwen，四个层级全部通过 |
| 写实照片 | `realistic` / `写实` | Qwen 与 GPT，若干角色 |

若要自定义风格：`look-template anime > my-look.json`，编辑它，然后 `--look my-look.json`。若要改变已有角色的风格，使用 `restyle`；所有图片都会变为过期，需要从锚定图重新生成。风格与角色是彼此独立的层，并且角色描述中会拒绝风格词 —— 同一个角色换一种预设，只是换一种画法。

## 标签与重生成

每张图都在文件名、`asset.json` 以及 PNG 元数据中带有标签 `character/outfit/view/version`（例如 `阿禾/default/face-front/v2`）。

```bash
node scripts/character-refs.mjs gen 阿禾/asset.json detail-neck --model codex   # regenerate one image as a new version
```

旧版本绝不会被覆盖。有三样东西是冻结的：锚定图文件、风格快照与文本描述。其中任意一样发生变化时，依赖它的东西会被标记为过期：新的锚定图会让其他一切过期；新的头像会让 头发/领口 细节过期；修改描述会让一切过期。过期的图只做标记，不做删除。

## 质量门禁

由代码检查；`check` 失败时退出码为 1：边长 300–5760 px，宽高比 0.4–2.5，该视图的目标比例（2:3 / 4:5 / 1:1），≤ 20 MB（H3 / Wan / Seedance 参考图限制的交集），白色背景（全身视图要求四边，头像只需上边与两侧，细节图明确跳过），以及过期状态。**这些门禁无法判断相似度、角度或构图** —— 请自己看图。

## 报告

`render` 写出一个自包含的 HTML 页面：第 1 层是一张单独的卡片，第 2 层起是角色设定表式布局（头像在左，右上是正面/侧面/背面，右下是细节条），细节默认隐藏，可一键切换。过期图片会带红色描边，页面顶部有图例说明；悬停在某张图上可查看过期原因。该布局是用代码实现的，而不是生成一张合成图 —— 用合成图作参考会让模型把人物画得更小。报告界面提供中文、英文与日文（`render --lang en`）；对于其他语言，智能体会就地翻译界面文案。角色描述保持原样，图像提示词始终是英文。

## 命令行

```bash
node scripts/character-refs.mjs config --model qwen --confirm-anchor yes --qwen-env-file ~/comfy.env
node scripts/character-refs.mjs intake-check examples/阿禾-intake.json
node scripts/character-refs.mjs new examples/阿禾-intake.json --out out/
node scripts/character-refs.mjs gen out/阿禾/asset.json          # anchor, then stop for confirmation
node scripts/character-refs.mjs confirm out/阿禾/asset.json
node scripts/character-refs.mjs gen out/阿禾/asset.json          # fill tier 2: headshot, profile, back
node scripts/character-refs.mjs gen out/阿禾/asset.json --tier 3 --reason "hair accessory close-up in E03"
node scripts/character-refs.mjs check out/阿禾/asset.json
node scripts/character-refs.mjs render out/阿禾/asset.json --out out/character-refs.html
```

## 自测

```bash
node scripts/selftest.mjs
```

233 条断言，不调用模型，不消耗额度。Qwen 与 GPT Image 适配器针对本地 mock 服务器进行校验；完整流水线以自定义命令端到端运行，产出纯白空图。

## 已知限制

- 仅测试过写实与动漫两种风格；动漫风格的 45° 头像同样存在旋转不足的问题（Qwen 上约为 20–30°）
- 小伤口疤痕往往看起来像新伤；大颗粒细节（如双排扣纽扣）的取景会过宽
- Qwen 在领口细节中把粗棉布渲染出类似天鹅绒的光泽；这一张用 codex 重新生成
- `openai` 适配器只检查过请求格式，未用真实 key 跑过
- **仅在 macOS + Node 24 上测试过**
