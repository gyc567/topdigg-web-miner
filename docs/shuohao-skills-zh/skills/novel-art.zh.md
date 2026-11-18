[![中文](https://img.shields.io/badge/%E4%B8%AD%E6%96%87-f2e3e3?style=for-the-badge&labelColor=f2e3e3&color=b07070)](https://github.com/eternityspring/shuohao-skills/blob/main/skills/novel-art/README.md)
[![English](https://img.shields.io/badge/English-8b1a1a?style=for-the-badge)](https://github.com/eternityspring/shuohao-skills/blob/main/skills/novel-art/README.en.md)
[![Follow on X](https://img.shields.io/badge/Follow-%40eternityspring-b07070?style=for-the-badge&labelColor=8b1a1a&logo=x&logoColor=f2e3e3)](https://x.com/eternityspring)

# novel-art

面向 **AI 短剧制作** 的美术圣经：场景 + 叙事道具。前提是内建的：**生成，而非拍摄** —— 不用勘景，不用搭景，不用找道具。环境与道具都是需要反复重新生成几十次、却仍要看起来是同一样东西的资产，因此交付物是一份一致性方案。

**场景（Scenes）**：设计意图、一致性锚点（每个场景 3–5 个 —— 观众靠它们认出这个地方，QC 也会对照它们检查镜头）、光照状态（时间变化是一次**重新生成，而不是重新打光**），以及变体机制（`variantOf` + `changes`，基于父级的设定图生成）。

**道具（Props）**（仅叙事道具 —— 特写、跨集、承载情节；通常每部剧 3–8 个）：先讲戏剧功能、**状态变体**（一个行李箱合上和打开是两个参考）、写入每条提示词的**尺度参考**（AI 很喜欢把手持道具画成家具尺寸），以及**白底、无手**的图版 —— 道具参考要合成进镜头，而拿着道具的手是经典的污染源。场景陈设留在场景锚点中；一次性的手持道具在镜头层面处理 —— 两者都不单独拥有资产。

输出 `art.json`、一份 Markdown 报告，以及一个自包含的 `art-report.html`。报告默认以中文界面渲染；传入 `--lang en` 可得到完全英文的报告（或在 art.json 中设置顶层 `"lang": "en"` —— `--lang` 优先）。无论如何，图像提示词始终是英文：在英文模式下，质量门禁的标签也会被翻译（阈值保持计算结果）；未通过门禁的详情以及所有数据都保持原样。

![art-report.html](https://github.com/eternityspring/shuohao-skills/blob/main/skills/novel-art/assets/report.webp)

## 质量门禁就是代码

与另外两个技能同样的立场：**让模型给自己打分的检查清单毫无价值。** 十道确定性门禁 —— 锚点 3–5 个（场景和道具都算）、每个场景光照状态 ≥1、所有负向提示词中禁止出现人物、所有提示词必须是英文、不含角色姓名（用 `--cast` 检查，未提供时明确报告为跳过）、变体引用完整，另外还有四道道具专属门禁：**状态数 ≥1**、**提示词中出现尺度描述**、**负向提示词中禁止出现手**、**设定图中为纯白背景**。自测会故意让每一道门禁失守。

## 三技能接力

```
novel-outline    → outline.json (what: structure & episodes)
novel-characters → cast.json    (who: character assets)
novel-art        → art.json     (where & what they hold: art assets)
```

`seed <outline.json>` 会确定性地预填场景列表和道具列表，带入各自出场的集数以及所服务的节拍；如果大纲没有 `props`，道具列表会留空，由模型按 `prop-pass.md` 从文本中提取。`validate --cast` 会对照角色名单交叉检查提示词。表层措辞偏环境风味，而非角色技能那种皮肤细节。渲染风格完全不会写进提示词 —— 由调用方在生成时前置。

## CLI

```bash
node scripts/novel-art.mjs seed outline.json > art.json
node scripts/novel-art.mjs validate art.json --cast cast.json
node scripts/novel-art.mjs checkup art.json
node scripts/novel-art.mjs render art.json --html             # Chinese report UI (default)
node scripts/novel-art.mjs render art.json --html --lang en   # English report UI
```

## 设定图版式规范

**本技能不生成图像。** 交付物是 `image.sheet` —— 一份完整的版式
说明，供下游任何生成图像的工具使用，模型、风格和画幅比例都在那里确定。这三者
都无法在这一层回答。

每个场景和每个道具各一张，都使用**主视图 + L 形细节边框**的版式
（下边缘与右边缘）。场景细节 = 锚点特写；道具细节 = 锚点特写 +
其他状态 + 侧面轮廓。场景中不含人物；道具额外禁止出现手，并置于纯白背景上以便干净抠图。变体的说明会指明要参考父级的设定图。完整规范见 `references/sheet.md`。

## 自测

```bash
node scripts/selftest.mjs
```

151 项断言 —— 预填、针对全部 10 道门禁的失守用例、渲染（zh/en 报告界面）、导出。不调用模型，约一秒跑完。

**仅在 macOS + Node 24 上测试过。**
