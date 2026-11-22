[![中文](https://img.shields.io/badge/%E4%B8%AD%E6%96%87-f2e3e3?style=for-the-badge&labelColor=f2e3e3&color=b07070)](https://github.com/eternityspring/shuohao-skills/blob/main/skills/novel-script/README.md)
[![English](https://img.shields.io/badge/English-8b1a1a?style=for-the-badge)](https://github.com/eternityspring/shuohao-skills/blob/main/skills/novel-script/README.en.md)
[![Follow on X](https://img.shields.io/badge/Follow-%40eternityspring-b07070?style=for-the-badge&labelColor=8b1a1a&logo=x&logoColor=f2e3e3)](https://x.com/eternityspring)

# novel-script

面向 AI 短剧的编剧：把 novel-outline 的分集梗概变成场景和台词。前提是内建的：**剧本负责戏剧，分镜负责拍摄。** "好不好看"和"怎么拍"这两件事的迭代节奏完全不同 —— 台词不断被重写，而一旦把台词绑定到分镜拆解上，每改一行就要重剪镜头。因此这一层没有镜号，也没有画面提示词；那些属于下一层的分镜技能。

不过有一条是牢牢守住的：**台词是结构化数据，不是散文。**

- **节拍流（Beat flow）** —— 每个场景都是动作节拍与台词行交替出现的序列：每个动作节拍只承载一个事件（叙述性散文），每一行都带着说话人和演绎说明。台词行可直接送入逐行 TTS；动作节拍则是画面必须做到的事
- **分集时长预算** —— 台词按阅读速度折算（默认每秒 4.5 个字），动作按固定的每节拍估值（2.5 秒）。每一集都必须落在目标值的 ±15% 以内。**三分钟的一集就是三分钟** —— 超时在这里就被抓住，而不是等到生成流水线里
- **钩子 + 悬念（Hook + cliffhanger）** —— 每一集都写在纸面上，而且**钩子是第一个节拍，而不是一个标签**：`hookBeat` 会认领其具体画面，并被限制在该集的前 3 个节拍内（冷开场）；大纲所承诺的节拍必须由真实场景认领
- **旁白约定** —— `VO` 标记内心独白与旁白，其声音写在演绎说明里；台词本会单独归组 VO

输出 `script.json`、一份 Markdown 剧本，以及一个自包含的 `script-report.html`：

![script-report.html](https://github.com/eternityspring/shuohao-skills/blob/main/skills/novel-script/assets/report.webp)

## 十道质量门禁，全部由代码实现

与本仓库中其他三个技能同样的立场：**让模型给自己打分的检查清单毫无价值。**

| 门禁 | 规则 |
| --- | --- |
| **单集时长** | 估值落在 `targetSeconds` 的 ±15% 以内（语速、每节拍秒数、容差都可通过 `params` 调整） |
| 台词长度 | ≤ 35 字 —— 一口气说不完的一句话同样也没法生成 |
| 说话人合法性 | speaker 必须在该场景的演员表中，或者显式标为 `VO` |
| 纸面钩子与悬念 | 每集都必须有 `hook` / `cliff` |
| **钩子落在前 3 个节拍** | `hookBeat` 认领钩子的具体画面出现在哪里 —— 冷开场是一道门禁而非一种习惯，因此钩子与实际开场绝不会脱节 |
| **每个场景至少一个动作节拍** | 只有台词的场景就是广播剧 —— 画面无事可做 |
| 叙述性动作 | 动作节拍中不得出现带引号的台词 —— 台词只存在于台词条目中 |
| 节拍认领 | 大纲钉到这一集的每个节拍都必须被认领（用 `--outline` 检查；跳过时**会明确告知**，绝不静默） |
| 角色引用 | 场景演员表必须存在于大纲中（配合 `--outline`） |
| 场景引用 | 场景必须存在，**光照状态必须已在美术圣经中登记**，道具必须存在（配合 `--art`） |

自测会**故意让每一道门禁失守**，以证明每道门禁确实会拦截。

## 报告

**报告默认以中文界面渲染；传入 `--lang en` 可得到完全英文的报告**（或在 script.json 中设置顶层 `"lang": "en"` —— 两者都给时 `--lang` 优先）。在英文模式下，质量门禁的标签也会被翻译（阈值保持计算结果）；未通过门禁的详情以及所有数据都保持原样。

一份单页、宽 1600px 的审阅文档：

- **KPI 区**：集数 / 预计总时长与目标对比 / 台词行数 / 台词占比 / 平均场景长度 —— 场景切换次数是一个统计量，而不是门禁；AI 场景切换是免费的
- **时长仪表**：每集一条柱，台词与动作堆叠，叠放在目标区间带上；超时与不足用红色标出，并给出精确秒数
- **剧本本体**：主体部分，**每行两集**。集头（估值 / 钩子 / 悬念 / 已认领节拍）始终可见；场景区域在 300px 处截断并渐隐，可按集展开；每行台词在悬停时出现复制按钮
- **场景表**：每个场景 × 场景设定 × 光照 × 演员表 × 预计秒数 —— 均为计算所得，绝不手写
- **台词本**：**每行两个区块**，全部台词按角色归组，每个列表高六行并带自己的滚动条，附有集/场引用和一个全部复制的按钮；使用 `--cast` 时，每个角色标题还会带上一个**声音提示词**复制按钮 —— 台词与声音设计同处一页，直接送入 TTS
- **质量门禁**面板 + 页眉徽章 + **Export JSON**（原样下载 `script.json` —— 编辑后可直接回灌进 `render` / `validate`）
- 所有图形均为内联 CSS/SVG，零外部资源，可离线打开

## 接力

```
novel-outline    → outline.json (what)
novel-characters → cast.json    (who)
novel-art        → art.json     (where + what's in their hands)
novel-script     → script.json  (the drama: scenes, beats, lines)
```

`seed <outline.json> --eps 1-3` 会确定性地预填每一集的骨架（目标秒数、钩子、悬念、已认领节拍、候选场景和演员表）。`validate --outline --art` 会交叉检查角色、节拍以及场景/光照/道具 —— 美术圣经从未登记过的光照状态就在这里失败。`render --outline --art` 会显示名称而非原始 ID：**数据里是 ID，屏幕上显示名称。**

再下一层是分镜技能：镜号、每个镜头的时长、首帧提示词、生成批处理。

## CLI

```bash
node scripts/novel-script.mjs seed outline.json --eps 1-3
node scripts/novel-script.mjs validate script.json --outline outline.json --art art.json
node scripts/novel-script.mjs checkup script.json
node scripts/novel-script.mjs render script.json --html --outline outline.json --art art.json --cast cast.json > script-report.html
node scripts/novel-script.mjs render script.json --html --lang en --outline outline.json --art art.json > script-report.html
```

报告界面默认为中文；`--lang en` 会将其完全渲染为英文。

## 限制

- 没有镜头、没有镜号、没有生成提示词、没有图像 —— 不含分镜层的任何内容
- 时长是**估值，而不是秒表** —— 这正是 ±15% 容差存在的意义；按你的旁白语速调整 `params.charsPerSecond`
- 报告界面提供中文和英文（`--lang zh|en`，默认中文，或使用 script.json 顶层的 `lang` 字段）；台词跟随该剧的剧本语言
- 每批写入 ≤ 3 集 —— 剧本是整条流水线中被重写最多的层

## 自测

```bash
node scripts/selftest.mjs
```

154 项断言 —— 计时引擎、统计、门禁失守用例、预填、渲染（两种界面语言）、导出。不调用模型，约一秒跑完。

内置示例（`examples/渡口-script.json`）是一份**完整的 6 集剧本** —— 9 个场景、123 行台词，每一集都落在 ±15% 区间内，针对大纲和美术固定数据所有门禁全部通过。

**仅在 macOS + Node 24 上测试过。**
