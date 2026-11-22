[![中文](https://img.shields.io/badge/%E4%B8%AD%E6%96%87-f2e3e3?style=for-the-badge&labelColor=f2e3e3&color=b07070)](https://github.com/eternityspring/shuohao-skills/blob/main/skills/novel-staging/README.md)
[![English](https://img.shields.io/badge/English-8b1a1a?style=for-the-badge)](https://github.com/eternityspring/shuohao-skills/blob/main/skills/novel-staging/README.en.md)
[![Follow on X](https://img.shields.io/badge/Follow-%40eternityspring-b07070?style=for-the-badge&labelColor=8b1a1a&logo=x&logoColor=f2e3e3)](https://x.com/eternityspring)

# novel-staging

为 AI 短剧的每一场戏提供开场站位：这场戏开场时，画面里每个人分别站在或坐在什么东西旁边，是坐是站，以及面朝哪个方向。

**为什么要单独一步**：短剧的每一段都是各自单独生成的，每一段都自行决定谁坐哪里。六个人围着一张长桌：第一段凭空多出五位无名宾客，第三段又有人在主角的衣服上倒酒。分镜表会把站位从上一段原封不动地交给下一段，但每一场的**第一**段却是自己编出来的句子。所以每个场景在进入分镜之前先做一次站位，分镜直接复制这份站位。

- **先读图** —— 人所站在旁边或坐着的物件，从场景图的主视角读出（4–20 个），并标注在俯视图上。人只能站在画面里真实存在的东西旁边：提示词里提到、但画面里从没画出来的台子，会让每个片段里这个人站的位置都不一样
- **再安排人物** —— 谁在开场时已经在场，谁是后来进来的；按剧本写明的坐或站；长者在主位，对手在桌子对面，被冷落的人在最远端；除非剧本点名有一群人，否则不添加多余角色
- **程序写出站位句** —— “胡二爷 sits on the third bench row, facing north; every other seat is empty and nobody else is there.”（胡二爷坐在第三排长凳上，面朝北；其余座位空着，现场没有别人。）分镜里这一场的第一段照抄这句
- **报告可以编辑** —— 每个场景一张俯视图：拖动人物，点击某人以设置坐或站以及朝向，把结果导出为新的 staging.json

**默认交付物是交互式的 `staging-report.html` 工具报告。** 在浏览器里打开，拖动人物，调整姿势与朝向，并导出编辑后的 JSON。`staging.json` 也会作为工作数据保存；Markdown 是可选的 `--md` 导出。报告界面默认为中文；`render --lang en` 给出英文界面（此时站位句使用读图时记录的英文名）。

![staging-report.html with English UI](https://github.com/eternityspring/shuohao-skills/blob/main/skills/novel-staging/assets/report-en.jpg)

## 质量门禁：8 个，全部由代码执行

| 门禁 | 规则 |
| --- | --- |
| 读图 | 每个地点 4–20 个物件 |
| 物件形态良好 | 名称唯一；俯视框合法；从图片读出时须为图片中的框 |
| 地点已解析 | 每一场的地点都已读过（若给出 art.json 则与之核对） |
| 演员表 | 每个人恰好出现一次；若给出 script.json 则与之核对，**未给出时必须说明** |
| 在场与否 | 每个人都标注了开场时在场或不在场；且至少有一人在场 |
| **在读出的物件旁** | 人站在读图得到的物件旁；只有能坐或能站的物件才用 “on”；侧面、姿势与朝向必须合法 |
| 无人重叠 | 处于同一物件同一侧面的两个人沿其长度方向分开 |
| 群众 | 数量为整数；有群众时须说明其所处位置 |

每个门禁都有一个能将其破坏的测试用例。

## 报告：一张可拖动的俯视图

- 把人物拖到平面上的任意位置；松手后他们会落在最近物件的最近一侧，若是座位则落在其上。拖到另一侧后，他们转身面向该物件
- 平面下方是开场时不在场人员的托盘：拖进来即为入场，拖回去即为离场
- 点击某人以设置坐或站，以及八种朝向之一
- 群众可增减，也可指定位置；站位句与该场的各项检查实时更新
- 若有场景图，悬停在某个物件上会在图片中点亮它的框
- 改动保存在浏览器中，刷新后仍在；“Export JSON” 下载编辑后的 staging.json，`validate` 可原样读回

该页面运行与命令行相同的代码：落位点、平面上的坐标、句子与各项检查全部来自整体内嵌的 `stagingCore()`。

## 它在流水线中的位置

```
novel-outline    → outline.json  (names)
novel-art        → art.json      (places + scene pictures)
novel-script     → script.json   (who is in each scene, what happens)
novel-staging    → staging.json  (who is where when each scene opens)
novel-storyboard → storyboard.json
```

- `seed <script.json> --art <art.json> --outline <outline.json>` 以确定性的方式填入地点、场景与演员表
- novel-storyboard 目前尚不自行读取 staging.json：`blocking` 会打印每一场开场的句子，供分镜的第一段使用

## 命令行

```bash
node scripts/novel-staging.mjs seed script.json --art art.json --outline outline.json > staging.json
node scripts/novel-staging.mjs validate staging.json --script script.json --art art.json
node scripts/novel-staging.mjs checkup staging.json                 # gates only
node scripts/novel-staging.mjs render staging.json > staging-report.html  # HTML by default
node scripts/novel-staging.mjs render staging.json --lang en > staging-report.html # English UI
node scripts/novel-staging.mjs render staging.json --md > staging.md # optional text export
node scripts/novel-staging.mjs blocking staging.json --lang en       # each scene's opening blocking
```

## 自测

```bash
node scripts/selftest.mjs
```

99 条断言：俯视几何、落位点、句子、seed、8 个门禁逐一被破坏的情形、渲染（两种界面、转义、图片），以及从自身源码重建内嵌代码以核对其与命令行一致。不调用模型，一秒内完成。

**仅在 macOS + Node 24 上测试过。** 代码中没有平台相关部分，但 Linux 与较旧的 Node **未经验证**。
