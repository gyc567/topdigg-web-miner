---
title: 'Kami 深度解析：让 AI 文档拥有专业印刷级设计系统'
date: "2026-08-19"
description: "深入解析 tw93/Kami：AI 时代的设计系统工具，为 Claude Code 和 Codex 添加专业文档生成能力。核心思想：好内容值得好排版。设计哲学：暖色羊皮纸画布 + 墨蓝单色强调色 + 衬线字体建立层级。8种文档模板、自研18种SVG图表、三路径幻灯片渲染、MCP服务器、确定性质量门。涵盖安装教程、设计规范详解、模板系统和设计哲学。"
tags:
  - Kami
  - 设计系统
  - AI文档
  - Claude Code
  - 排版
  - 印刷
  - WeasyPrint
  - PDF生成
  - Mermaid
  - 衬线字体
  - 文档工具
  - tw93
categories:
  - 深度解析
  - AI工具
  - 开源项目
  - 设计系统
---

# Kami 深度解析：让 AI 文档拥有专业印刷级设计系统

"AI 可以写出比大多数人手动撰写更好的文档。缺失的不是能力，而是约束——没有设计系统，每次会话都会漂移到灰色、扁平、布局不一致的输出。"

这是 Kami 开发者 tw93 在 GitHub 上写下的开场白。他因为经常让 Claude 帮他写美股研究报告，受够了每次输出的"灰色扁平风"，于是开始一个规则一个规则地改进排版——从字体、配色、间距开始，直到报告变成了一份他真正愿意读的页面。

后来他要做演讲幻灯片，又不想从零开始搭，就用 Claude Design 按自己的风格排版，反复调整，最终得到了一份满意的幻灯片。这个过程沉淀出了内联 SVG 图表、统一的暖色调、更紧凑的编辑节奏。

他把这些不断抽象，最终变成了 **Kami**。

---

## 一、项目背景与核心定位

### 名字的含义

**Kami**（紙/かみ）在日语里是"纸"的意思——一个想法最终落地的载体。

这是 tw93 "三部曲"中的最后一部：

| 项目 | 读音 | 作用 |
|------|------|------|
| **Kaku**（書く） | かく | 写代码 |
| **Waza**（技） | わざ | 训练习惯 |
| **Kami**（紙） | かみ | 交付文档 |

### 核心问题

大多数 AI 工具生成文档时，面临一个共同困境：内容质量不错，但排版一言难尽。每次生成的文档风格都不同——灰色背景、扁平布局、毫无层级感。问题是：AI 具备了能力，但缺乏**约束**。

Kami 的解决方案是：一套约束语言 + 8 个文档模板 + 一个落地页系统。简单到 Agent 可以可靠运行，严格到每个输出都是可以直接交付的。

### 设计哲学一句话

> **暖色羊皮纸画布，墨蓝单色强调色，衬线字体建立层级，避免冷灰和硬阴影。**

这不是一个 UI 框架——而是一套**印刷品的约束系统**。

---

## 二、设计系统详解

### 十大不可变规则

这是 Kami 设计系统的核心，每条规则都有真实代价，修改前需要三思：

1. **页面背景 `#f5f4ed`**（羊皮纸色），永远不要纯白
2. **单色强调：墨蓝 `#1B365D`**，不允许第二个色彩
3. **所有灰色必须带暖色调**（黄褐底色），禁止冷蓝灰
4. **全页面使用单一衬线字体**（英文全衬线，中文标题衬线正文无衬线）
5. **衬线字重锁定 500**，不允许粗体
6. **行高：标题 1.1-1.3 / 密集正文 1.4-1.45 / 阅读正文 1.5-1.55**
7. **字间距：中文正文 0.3pt；英文正文 0**
8. **标签背景必须是纯色 hex**，禁止 rgba（WeasyPrint 会渲染双矩形）
9. **深度通过环形阴影或轻阴影实现**，禁止硬投影
10. **印刷模板禁止斜体**

### 色彩系统

**主色调（唯一强调色）**：

| 角色 | 色值 | 用途 |
|------|------|------|
| 墨蓝 | `#1B365D` | CTA、强调色、标题左侧条 |
| 墨蓝亮 | `#2D5A8A` | 深色表面链接 |

**表面色**：

| 角色 | 色值 | 用途 |
|------|------|------|
| 羊皮纸 | `#f5f4ed` | 页面背景 |
| 象牙白 | `#faf9f5` | 卡片/抬升容器 |
| 暖沙色 | `#e8e6dc` | 按钮/交互表面 |
| 深暖色 | `#30302e` | 深色容器 |
| 极深色 | `#141413` | 深色页面背景（带橄榄底色，不是纯黑） |

**文字色**（四层灰度，均带暖色调）：

| 角色 | 色值 |
|------|------|
| 近黑 | `#141413` |
| 深暖灰 | `#3d3d3a` |
| 橄榄灰 | `#504e49` |
| 石灰 | `#6b6a64` |

**暖色灰的记忆法**：在 `rgb()` 中，暖灰是 R ≥ G > B（或者 R > G > B 且差距小）。冷灰是 R < G < B 或 R = G = B。

### 字体系统

每种语言整页只用一种衬线字体：

| 语言 | 字体 |
|------|------|
| 英文 | Charter |
| 中文 | TsangerJinKai02 |
| 日文 | YuMincho |
| 韩文 | Source Han Serif K |

**重要**：任何可能渲染中日文的字体栈，必须包含 CJK 回退，包括 `@page` 页脚文本、`pre`、`code` 和 SVG 标签。

### 字号层级（印刷 pt）

| 角色 | 字号 | 字重 | 行高 |
|------|------|------|------|
| Display | 36pt | 500 | 1.10 |
| H1 章节 | 22pt | 500 | 1.20 |
| H2 | 16pt | 500 | 1.25 |
| H3 | 13pt | 500 | 1.30 |
| 正文引导 | 11pt | 400 | 1.55 |
| 正文 | 10pt | 400 | 1.55 |
| 密集正文 | 9.2pt | 400 | 1.42 |
| 标题 | 9pt | 400 | 1.45 |
| 标签 | 9pt | 600 | 1.35 |

**最小地板**：网页文本 >= 12px，PDF 文本 >= 9pt。

---

## 三、8种文档模板

### 模板一览

| 模板 | 用途 |
|------|------|
| **One-Pager** | 一页纸项目介绍、产品简报 |
| **Long Doc** | 长文档、深度报告 |
| **Letter** | 正式信件、推荐信 |
| **Portfolio** | 作品集 |
| **Resume** | 简历 |
| **Slides** | 演示幻灯片 |
| **Equity Report** | 股票研究报告 |
| **Changelog** | 版本更新日志 |

### 幻灯片三种渲染路径

1. **WeasyPrint HTML → PDF**（默认）
2. **python-pptx**（按需生成可编辑 PPTX）
3. **Marp 变体**（Markdown 优先的演示稿）

### 自研 18 种 SVG 图表

| 类型 | 文件 |
|------|------|
| Architecture | 系统组件和连接 |
| Architecture Board | 报告级五层系统架构板 |
| Flowchart | 决策分支和流程 |
| Quadrant | 2x2 定位矩阵 |
| Bar Chart | 分类对比（最多8组x3系列） |
| Line Chart | 时间趋势（最多12点x3线） |
| Donut Chart | 比例分解（最多6段） |
| State Machine | 有限状态机 |
| Timeline | 时间轴+里程碑 |
| Swimlane | 跨职责流程 |
| Tree | 层级关系 |
| Layer Stack | 垂直堆叠系统层 |
| Venn | 集合交集 |
| Candlestick | OHLC 价格历史 |
| Waterfall | 收入桥/分解 |

Sequence、Class、ER 图表可以从 **Mermaid** 文本编写：[beautiful-mermaid](https://github.com/lukilabs/beautiful-mermaid) 渲染 SVG，`scripts/mermaid_normalize.py` 重新主题化为 Kami 配色并使其兼容 WeasyPrint。

---

## 四、快速上手教程

### Claude Code 安装

```bash
/plugin marketplace add tw93/kami
/plugin install kami@kami
```

### Codex 安装

```bash
codex plugin marketplace add tw93/kami
codex plugin add kami@kami
```

### 通用 Agent 安装（读取 ~/.agents/ 的工具）

```bash
px skills add tw93/kami/plugins/kami -a universal -g -y
```

### Claude Desktop 安装

1. 下载 [kami.zip](https://github.com/tw93/kami/releases/latest/download/kami.zip)（不是 GitHub 源码 ZIP）
2. 打开 Customize > Skills > "+" > Create skill
3. 直接上传 ZIP 文件（无需解压）

### 更新方法

| 平台 | 命令 |
|------|------|
| Claude Code | `claude plugin update kami` |
| Codex | `codex plugin marketplace upgrade kami` |
| Claude Desktop | 下载新版 ZIP，替换 |
| 通用 Agent | 重新运行安装命令 |

### 使用方式（自然语言触发）

安装后直接用自然语言，无需斜杠命令：

**英文示例**：
- `make a one-pager for my startup`
- `turn this research into a long doc`
- `build me a resume`
- `design a slide deck for my talk`
- `build a landing page for my app`

**中文示例**：
- 帮我做一份一页纸
- 帮我排版一份长文档
- 帮我做一份简历
- 帮我做一套演讲幻灯片
- 帮我做一个产品落地页

**日文示例**：
- スタートアップ向けの一枚資料を作って
- この調査を長文レポートに整えて
- 履歴書を作って

**韩文示例**：
- 스타트업 원페이저를 만들어줘
- 이 리서치를 장문 문서로 정리해줘

### 品牌配置（可选）

创建 `~/.config/kami/brand.md` 持久化身份、品牌、默认值和写作习惯：

```yaml
---
name: Your Name
role: Founder / Engineer
email: you@example.com
brand_color: "#1B365D"
language: zh-CN
page_size: A4
tone: professional
---
# 品牌笔记
这是我的写作习惯和品牌风格...
```

---

## 五、MCP 服务器

Kami 自带一个**零依赖的 MCP 服务器**（`scripts/mcp_server.py`），暴露以下工具：

- **capability diagnosis** — 能力诊断
- **render** — 渲染
- **structured check** — 结构化检查
- **screenshot** — 截图

这意味着任何支持 MCP 的 Agent 都可以驱动 Kami 作为渲染引擎，无需加载完整的 skill prompt。

```python
# 启动 MCP 服务器
python3 scripts/mcp_server.py
```

---

## 六、确定性质量门

Kami 的验证不是模糊的人工检查，而是可重复的质量门：

1. **内容 Schema 验证** — 每种文档类型的结构在布局前验证
2. **可选的结构化简报** — 记录文档的目标和验收边界
3. **覆盖率检查** — 确认每个事实都存活到最终页面
4. **视觉检查** — 导出页面图像对照固定审查清单

```bash
# 渲染和验证
python3 scripts/build.py --verify [target]

# 检查占位符
python3 scripts/build.py --check-placeholders path/to/filled.html

# 检查密度（超过25%尾部空白警告）
python3 scripts/build.py --check-density

# 检查内容覆盖
python3 scripts/build.py --check-content content.json filled.html

# 视觉检查
python3 scripts/build.py --check-visual path/to/filled.pdf
```

---

## 七、MCP 集成示例

任何 MCP Agent 都可以调用 Kami 作为文档引擎：

```python
# MCP 工具调用示例
mcp__kami__render(
    template="one-pager",
    content={
        "title": "项目名称",
        "subtitle": "一句话描述",
        "metrics": [...],
        "features": [...]
    },
    output="project-onepager.pdf"
)
```

---

## 八、设计哲学与核心观点

### 1. 约束而非自由

大多数 AI 工具给你无限自由度，结果是千篇一律的"AI味"输出。Kami 的思路相反：**好的设计系统不是告诉你可以做什么，而是不让你做什么**。10条不可变规则就是边界，边界内的创意空间才是真正有效的创意。

### 2. 单一色彩比多色彩更有力

很多设计新手以为"色彩丰富 = 设计好"。Kami 证明相反：只用一种墨蓝色作为强调色，其他一切用暖灰系——反而更专业、更克制、更有记忆点。**限制是创意的催化剂，不是创意的敌人**。

### 3. 暖色调传递情感温度

羊皮纸色 `#f5f4ed` 不是"老旧"，而是"可信赖"。纯白 `#ffffff` 在印刷品上反射刺眼，羊皮纸色柔和温暖，阅读体验更接近纸质书。**色彩是有情感重量的**。

### 4. 衬线字体建立信任感

在英文排版中，衬线字体（Charter）被认为更正式、更可信赖。无衬线字体（Helvetica 等）更现代但也更有"界面感"。Kami 选择全页衬线，让文档读起来像一份值得保存的报告，而不是网页截图。

### 5. AI 负责写作，设计系统负责排版

tw93 的洞察很深刻：AI 写作能力已经很强，缺失的是一致的视觉语言。Kami 把"让文档好看"这件事从 AI 写作中剥离出来，交给设计系统处理。AI 专注内容，设计系统专注呈现，**分工才是效率**。

### 6. 可验证才可交付

"内容看起来不错"不是一个质量标准。Kami 的确定性质量门让每份文档的输出都可测量、可重复、可验证。覆盖率检查、密度检查、视觉检查——这些才是专业的质量保障流程。

---

## 九、超越文档

 Kami 的约束系统不只适用于页面——它还能生成**可部署的网站**和**AI 图像生成提示词**：

**落地页**：`https://kami.tw93.fun` — 部署型多语言站点

**AI 图像生成提示词规范**：
```
Redraw this as a clean editorial diagram.
Background: warm parchment (#f5f4ed), never pure white.
One accent only, ink blue (#1B365D);
everything else in warm gray with a yellow-brown undertone, no other colors.
Thin single-line geometric strokes and simple flat icons.
No gradients, no drop shadows, no 3D.
Labels in a serif typeface.
Generous whitespace, calm and composed, like a figure in a well-typeset report.
```

Kami 负责规范指定，图像生成器负责绘制。

---

## 十、总结

Kami 解决的是 AI 时代文档输出的一个根本问题：内容有了，形式跟不上。

它的核心优势：

- **专业印刷级输出**：羊皮纸暖色调 + 墨蓝单色强调 + 衬线层级
- **8种文档模板覆盖全场景**：简历到研报，从一页纸到长文档
- **确定性质量门**：可测量、可重复、可验证的输出保障
- **MCP 零依赖集成**：任何 Agent 都可以调用
- **多语言原生支持**：中英日韩各有专属字体和排版规则
- **约束即设计**：10条不可变规则，边界内的自由才是真正的自由

如果你经常需要让 AI 生成可交付的文档——报告、简历、幻灯片、产品介绍——Kami 值得一试。

项目地址：https://github.com/tw93/Kami

---

以上，既然看到这里了，如果觉得不错，随手点个赞、在看、转发三连吧，如果想第一时间收到推送，也可以给我个星标，谢谢你看我的文章，我们，下次再见。

首发于微信公众号「比特财商」。
