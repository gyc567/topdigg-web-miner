---
title: "有人把 Excel、Slack、PS 全部重写了一遍：HeyPuter 的 53 个世界级软件"
description: "深度拆解 HeyPuter/everything 单仓库项目：51 个应用、224 万行代码、8711 个测试文件、零前端框架。附完整本地运行教程、Amplify 部署配置解析、六大设计哲学与八个可迁移观点。"
date: "2026-11-03"
author: "瑞哥观势"
tags:
  - HeyPuter
  - 开源项目分析
  - 开源软件
  - 单仓库
  - 无框架前端
  - 开发教程
categories:
  - 开源项目分析
keywords:
  - HeyPuter
  - Everything Project
  - 开源软件替代
  - monorepo
  - 无框架前端开发
  - Puter 平台
  - Spreadsheet 开源
  - 3D Studio 开源
  - Clean-room 实现
  - 软件架构方法论
---

# HeyPuter 53 个世界级软件：有人把 Excel、Slack、PS、AutoCAD 全部重写了一遍

先说结论。

**第一，这不是又一个"AI 套壳应用"，而是一场用十年时间才可能完成的长跑。** 我把 HeyPuter/everything 完整克隆下来逐个翻了一遍：51 个应用目录，48 个已部署上线，2.24M 行 JavaScript / TypeScript，8700 多个测试文件，没有任何一个前端框架（React、Vue、Svelte 全都没有），后端统一挂在一个叫 Puter 的云平台上。这是一个用"最笨的方式"堆出来的软件帝国。

**第二，它最狠的地方不是功能对齐，是它敢把"没有服务器"写进架构。** 24 个应用的 README 里都写着同一句话："no server of its own"（没有属于自己的服务器）。所有后端能力（账号、存储、数据库、KV、Worker、部署）全部来自 Puter 平台。这意味着每个应用都能被丢进任何静态托管（AWS Amplify、对象存储、自己的 Nginx），而且不用配一行环境变量、不用申请 API Key。这在 SaaS 里是反常识的。

**第三，绝大多数应用都明确标注自己是 alpha 状态。** CAD 的 README 第一句就是"Early alpha，请不要依赖它做真实项目，重要工作请自行留副本"。Records、Wiki、Expenses 也都有类似警告。所以正确的读法是：把它当一份**公开的、可以白嫖源码的架构范本**，而不是一个能直接替代 Office 的产品。

**第四，它最有价值的部分不是 53 个应用，而是一套"如何在不写后端、不用框架、不碰许可证红线的前提下，做出一个真能用的专业软件"的完整方法论。** 下面我会把这套方法论拆开讲，包括可以直接上手的本地运行教程。

---

## 一、项目说明：它到底是什么

### 1.1 一句话定位

The Everything Project 的自我描述是："重建并开源整个世界的软件"。从 Office 到 Slack，从 Photoshop 到 AutoCAD，把所有专有软件的自由开源替代品重新做一遍，全部放在一个单仓库（mono-repository）里。

### 1.2 规模盘点

我按实际文件统计（排除 node_modules、dist、tests、vendor、tmp）：

| 维度 | 实际数据 |
|---|---|
| 应用目录数 | 51 个（src/ 下） |
| 已上线站点 | 48 个 `*.puter.com` 子域 |
| 主代码行数（js/ts/jsx/tsx） | 约 2,242,000 行 |
| HTML + CSS | 约 243,000 行 |
| 源文件数 | 7,945 个 |
| 测试文件数 | 8,711 个 |
| 前端框架依赖 | **0**（无 React / Vue / Svelte / Angular） |
| 构建工具 | Vite（统一） |
| 根仓库许可证 | MIT |

各应用代码量 TOP 10：

| 应用 | 行数 | 对标产品 |
|---|---|---|
| 3d | 404,367 | Blender |
| presentation | 252,512 | PowerPoint |
| vector-studio | 158,337 | Illustrator |
| spreadsheet | 154,514 | Excel |
| photo-studio | 151,674 | Photoshop |
| whiteboard | 117,710 | Miro |
| documents | 108,657 | Word |
| video-studio | 70,944 | Premiere Pro |
| pdf | 64,313 | Acrobat |
| audio-studio | 57,416 | Audition |

代码量最大的 3D 单个应用就超过 40 万行，而且是从零手写的。这不是"做个壳然后接 API"的量级，这是把专业软件的核心数据结构、渲染管线、几何内核全部重新实现了一遍。

### 1.3 分类清单

README 把 51 个应用分成 9 大类：

- **办公**（7 个）：Spreadsheet、Documents、Presentation、Whiteboard、PDF、Notes、Records
- **协作**（6 个）：Meetings、Teamchat、Email、Contacts、Calendar、Signatures
- **创意工具**（6 个）：Photo Studio、Video Studio、Vector Studio、Audio Studio、Music Studio、3D Studio
- **工程**（4 个）：CAD、Parametric、Circuits、Building Design
- **效率**（5 个）：Tasks、Projects、Wiki、Time Tracking、Surveys
- **财务**（4 个）：Accounting、Invoicing、Expenses、Cap Table
- **商业**（13 个）：CRM、Help Desk、Contracts、POS、Inventory、Assets、Hiring、Shifts、Childcare、Field Service、Legal、Fleet、Property Management
- **开发者工具**（1 个）：API Client
- **游戏**（5 个）：Chess、Backgammon、Checkers、Solitaire、Sudoku

**这 9 类的分布本身就是一份需求清单。** 有人认真统计过全球软件的品类构成，然后把每一格都填上了。这背后是一种罕见的耐心。

### 1.4 许可证：有个坑，必须先说

根仓库 LICENSE 是 MIT，但**子应用不是统一 MIT**。逐个看 package.json 的结果：

- **AGPL-3.0-only（9 个）**：3d、building-design、email、notes、pdf、presentation、spreadsheet、video-studio、whiteboard
- **MIT（7 个）**：accounting、calendar、help-desk、parametric、projects、records、survey
- **未在 package.json 声明（其余）**：多数以根仓库 MIT 为准，但需逐个确认

AGPL 是什么概念？只要有人通过网络使用该软件（即便是 SaaS），就必须向用户提供完整源码。这是比 GPL 更狠的一层。你要拿 spreadsheet 去做商业闭源产品，AGPL 会直接卡住你。

另外，`documents` 应用的 AGENTS.md 里写了一条硬规则，我觉得是整个项目最有价值的一段工程治理文本：

> 不引入 AGPL 许可的代码或依赖（直接、间接、vendored 或远程加载的都不行）。不引入专有的第三方文档引擎，包括在测试和工具里。每一个发布的二进制都必须有对应源码和可接受的许可证。依赖变更后运行 `npm run check:licenses`。**不要为了通过检查而扩大许可证白名单，先审查真实许可证。**

最后一句尤其重要。这是防止开源项目在合规检查上自我麻痹的护栏。

---

## 二、详细教程

### 2.1 环境要求

| 项目 | 要求 |
|---|---|
| Node.js | 22.12+ （部分应用推荐 24 LTS，3d 明确要求 24） |
| npm | 随 Node 附带 |
| 浏览器 | 支持 WebGL2 的现代浏览器（Chrome / Edge / Firefox / Safari） |
| 磁盘 | 完整克隆约 1.8GB，装完依赖会更多 |

### 2.2 克隆与本地运行

```sh
git clone https://github.com/HeyPuter/everything.git
cd everything/src/spreadsheet
npm install
npm run dev
```

就这么四步。没有 `.env` 配置文件，没有数据库初始化脚本，没有 Docker Compose。

跑起来后浏览器打开的地址有点特别：

```
http://spreadsheet.puter.localhost:5173/
```

**这个 `puter.localhost` 域名是刻意设计的。** 仓库根目录有个 `dev/puter-localhost.mjs`，它是个 Vite 插件，会在服务器监听后把本地 URL 的主机名改写成 `<应用名>.puter.localhost`。原理很简单：浏览器会把所有 `*.localhost` 解析到回环地址，Vite 默认也接受 `.localhost` 主机名。所以不需要改 `/etc/hosts`，不需要配代理。**一个 20 行的插件解决了多应用本地开发的域名隔离问题**，这个设计相当干净。

每个应用的 vite.config 里都引入了这个共享插件：

```js
import puterLocalhost from '../../dev/puter-localhost.mjs';
```

### 2.3 切换到其他应用

所有应用在同一仓库下，切换方式就是换目录：

```sh
cd ../3d            # 3D Studio，40 万行
npm install
npm run dev

cd ../documents     # 文档编辑器
npm install
npm run dev
```

### 2.4 不登录也能用

这是很关键的一点，值得单独说。**绝大多数应用不需要登录就能干活。**

Spreadsheet 的 README 写得很清楚：

> 没人需要登录才能使用：应用直接打开一个新表格，Puter 只在第一个需要云端的动作时才要求登录，比如保存、打开文件，或者表格列表。在此之前，编辑内容留在标签页里（以及这个浏览器的本地草稿中），状态胶囊显示 "Sign in to save"。

Records、Presentation、CAD 都是同一套模式。这意味着什么？意味着你可以在完全离线的状态下把这套软件当作本地应用来用，包括：

- Spreadsheet：公式、图表、格式全都能用
- CAD：打开本地图纸、保存到本地设备、刷新后从浏览器恢复
- PDF：本地打开 PDF、编辑、导出
- Documents：`/playground.html` 独立运行，不需要账号也不需要云 SDK

登录只在四个时刻才发生：**存云端文件、开云端文件、协同编辑、需要后端运算的功能**（比如 Spreadsheet 的 `AI()` 和 `IMPORTDATA()`）。

### 2.5 各应用的构建与测试

不同应用的脚本略有差异，按需选择：

```sh
# 通用：单元测试
npm test

# 3d：完整检查链（单元测试 + 类型检查 + 生产构建 + 浏览器 E2E）
npm run check

# documents：许可检查 + DOCX 规范符合性检查
npm run check:licenses
npm run check:conformance

# pdf：生成第三方声明 + 构建 + 跨浏览器 E2E
npm run licenses
npm run build
npm test:e2e

# 白板 / 通用：生产构建 + 本地预览
npm run build
npm run preview
```

**E2E 需要先装浏览器：**

```sh
npx playwright install chromium
npm run test:e2e
```

### 2.6 部署：每个应用是一个独立的 Amplify 应用

仓库根目录两个文件定义了整套部署：

**`amplify.yml`** 里，每个 `src/xxx` 目录是一个独立的 Amplify 应用，根目录是那个子目录：

```yaml
applications:
  - appRoot: src/whiteboard
    frontend:
      phases:
        preBuild:
          commands:
            - nvm install 22
            - npm ci
        build:
          commands:
            - npm run build
      artifacts:
        baseDirectory: dist
        files:
          - '**/*'
```

**`customHttp.yml`** 定义缓存策略。注意它的文件头有一句关键说明：

> Amplify 对单仓库应用的请求头只从仓库根目录的这个文件读取，所以每个应用的头部都放在 appRoot 匹配它自己目录的条目里。**每个从本仓库部署的应用都需要在这里有一个条目，哪怕它自己没有头部：Amplify 会让找不到条目的应用部署失败。**

缓存策略本身也值得学：

```yaml
- pattern: '/'
  headers:
    - key: 'Cache-Control'
      value: 'no-cache, max-age=0, s-maxage=0, must-revalidate'
- pattern: '/assets/*'
  headers:
    - key: 'Cache-Control'
      value: 'public, max-age=31536000, immutable'
```

入口页永不缓存（因为 Vite 产物带 hash，入口却可能指向旧资源），带 hash 的资源永久缓存。这个"入口不缓存 + 资源 immutable"的组合，是任何 Vite 静态站的标准配置，但它是被写在配置文件里、被 CI 强制的，而不是靠人记得。

### 2.7 部署到 Puter 平台

部分应用自带 Puter 专用部署脚本，比如 Spreadsheet：

```sh
npm run deploy:email-worker
```

Teamchat 的机制更狠：**每个工作区会在创建者的 Puter 账户里跑一个属于自己的 Worker**。原文：

> 应用在用户首次创建工作区时，把自带的 worker 包（`public/worker/teamchat-worker.js`）复制到他的云盘，然后调用 `puter.workers.create()`。这个 worker 的 KV 和文件系统保存着所有数据。

也就是说，一个 Slack 替代品的多租户隔离，是靠"每个租户一个独立 Worker 实例"实现的，权限校验在 worker 的每一条路由上强制执行。

### 2.8 三条深度阅读路线

如果只读三份文档，我推荐这三份：

**① `src/documents/AGENTS.md`（27 行）**：最短，但信息密度最高。定义了依赖策略、许可红线、canvas 引擎的里程碑要求、以及 OOXML 规范符合性记录方式。核心是一条：

> 把文档变更、DOCX 序列化、布局、绘制四件事分开。保留未被触碰的 DOCX 包组件。用不支持的特性打开文档时按尽力而为处理；在安全编辑不可用时退回只读近似，**并且不要挂上可能丢弃不支持内容的保存处理器**。

这句话的分量很重。它承认了"我做不到 100% 兼容"，但规定了做不到时该怎么优雅降级，而不是默默吃掉用户的数据。

**② `src/3d/ARCHITECTURE.md`（273 行）**：工业级 3D 引擎的模块划分。核心概念是 Depsgraph（依赖图）和 COW（写时复制）快照：

> **类型化数组在一次撤销推入之后是不可变的。** 要在操作中原地修改，用 `data/cow.ts` 里的 `cow(owner, 'key')`（每个撤销步骤只复制一次），或者直接赋一个新数组。

配套的还有完整的 operator 注册模型：

```ts
registerOperators([{
  idname: 'mesh.subdivide',
  label: 'Subdivide',
  props: [...PropDef],
  poll: (ctx) => bool,
  exec: (ctx, props) => 'FINISHED' | 'CANCELLED' | void,
  undo?: boolean
}]);
```

**③ `src/spreadsheet/README.md`（1200 行）**：这是一个"功能规格说明书"级别的文档，也是全项目文档质量的标杆。它把 510 多个 Excel 函数按类别逐个列出，包括 `LAMBDA` 的自递归、`GROUPBY` 的分组汇总、`PIVOTBY` 的交叉透视、`@` 隐式交集运算符、以及 `IMPORTXML` 的 XPath 节点提取。文档详细到能直接当 Excel 函数手册用。

---

## 三、几个关键应用的技术看点

### 3.1 Spreadsheet：把 Excel 兼容做到什么程度

510+ 函数只是基础。真正难的是这些：

**动态数组**：`UNIQUE`、`FILTER`、`SORT`、`SORTBY`、`SEQUENCE`、`RANDARRAY`、`TRANSPOSE`、`TEXTSPLIT`、`VSTACK`、`HSTACK`、`WRAPROWS`、`TOCOL` 全部支持溢出（spill），`A1#` 引用溢出区域，被占用时报 `#SPILL!`。

**Excel 查询语言**：直接支持 Sheets 风格的查询字符串：

```
=QUERY(range, "select A, sum(C) where B > 5 group by A order by sum(C) desc limit 10 label sum(C) 'Total'")
```

**错误提示是产品级的**：`#NAME?` 会直接告诉你"没有叫 SUMM 的函数，你是不是想用 SUM？"，`#REF!` 会指出缺失的是哪个工作表。这不是报错，这是教学。

**AI 直接写进单元格**：

```
=AI(prompt, [data])
=TRANSLATE(text, [from], [to])
=DETECTLANGUAGE(text)
```

`AI()` 思考期间返回 `#BUSY!`，相同 prompt 只问一次，按 F9 重新提问。

**真实 .xlsx 文件**：存下来的就是真正的 Excel 文件，能在 Excel、Numbers、LibreOffice 里打开。往返导入导出覆盖了 Excel 原生图表（折线、散点、簇状柱、堆积柱、Pareto 组合图）、主题颜色、日期轴、隐藏辅助表、命名公式定位标签等一堆细节。

**没有后端服务器**，全部靠 Puter.js。

### 3.2 3D Studio：Clean-room 实现的 Blender 替代品

这个应用的野心最吓人：建模、雕刻、UV、材质节点 / 几何节点 / 合成器、动画绑定、物理模拟、路径追踪与实时渲染、视频剪辑、运动追踪、Grease Pencil、脚本系统，**全部跑在浏览器里**。

技术选型：**纯 TypeScript + three.js（WebGL2）**，不用任何前端框架。

**Z 轴向上，单位是米，角度内部用弧度。** 属性命名遵循广泛使用的 `bpy` 脚本约定（`location`、`rotation_euler`、`hide_render`），这样动画路径、脚本和导入器能 1:1 对应。

关于许可证有一段声明：

> 本项目是独立的：这是一个 clean-room 实现，不包含任何 Blender 源代码、图标、主题或其他资源，与 Blender 基金会无隶属关系，也未获其背书。

**clean-room 实现**是软件工程里最难的一种干净：不是"读了源码再重写"，而是"看了规格和文档，从零实现"。3D 的 README 里有一句话点破了这种做法的代价：

> `.blend` 导入覆盖活动场景和常见数据（不含体积、点云或线渲染设置）；不支持的数据会被报告出来，而不是静默丢失。**不支持导出 `.blend`。**

**AI 助手**部分的设计很值得抄：它读取场景、对 `bpy` 风格 API 写并运行脚本（失败的脚本会回滚）、查询 API 文档、截取视口截图来自检、读取用户附带的参考图像 / PDF / 文本。**它为一条消息所做的一切修改，合并成一个撤销步骤。**

### 3.3 Documents：重新实现一个 Canvas 编辑器

不是嵌入第三方富文本编辑器，是自己写渲染引擎。

**双模式运行**：

- `/playground.html`：独立本地编辑器，不需要账号也不需要云 SDK
- `/mock.html`：带内存版 Puter 模拟，测试保存与重开
- `/`：走真实 Puter 云存储

**字体度量兼容**：为 Calibri、Cambria、Arial、Times New Roman、Courier New 提供了度量兼容的替代字体。这不是"长得像"，是"排版结果一样"。

**功能覆盖**：审阅（批注线程、修订模式、接受 / 拒绝、变更栏、审阅窗格）、引用（目录、页脚脚注、题注 SEQ、交叉引用 REF / PAGEREF、F9 更新域）、页眉页脚、单双删除线、字距调整与样式继承、上下文间距、水平文字缩放 1% 至 600%、字符间距扩展与压缩、带符号的基线偏移、上下标、OOXML 高亮调色板、继承式主题色、表格跨页与重复表头、浮动图片（含裁剪、翻转、旋转、alt 文本）。

**最重要的诚实**：文档明确写了自己是什么。

> 这是一个受限的编辑器原型。页面预览使用保存的单节尺寸 / 页边距和内置的 Noto Sans 字体，**不是原生 DOCX 布局的完整复现**。域、批注、修订、多节、嵌套表格、浮动图片、自动段落间距等不支持的结构，在进入编辑前就会被拒绝。

最后那半句是关键：**宁可在编辑前明确拒绝，也不让用户改完之后发现内容被吞了。**

### 3.4 Teamchat：权限设计比功能列表更值得看

Slack 的替代品，1292 行 README 里有大量篇幅在讲权限矩阵：

**角色**：owner、admin、member、guest。嘉宾可以被单独邀请进某一个频道，链接和邀请码形状一致、过期机制一致、暴力破解预算一致。**嘉宾只能看到自己所在的频道和与自己共享频道的人**，不能浏览、加入、创建频道，不能邀请任何人，不能给陌生人发消息，这些全部由 worker 在每一条路由上强制执行。

**管理员可以限制频道发言**（公告频道：所有人只读和表态，侧边栏挂一个喇叭图标），以及**独立设置线程回复权限**（所有人 / 仅管理员 / 关闭）。同样由 worker 强制执行，成员仍然可以编辑和删除自己发的旧消息。

**交付诚实**：原文写 "Delivery is honest: a Puter worker only runs while handling a request"，即 worker 只在处理请求时运行。空口承诺不算承诺。

### 3.5 Whiteboard：把"引导式工作坊"做进产品

白板不只是画图。内置一整套会议引导机制：

- **实时反应**：8 种表情在画布上飘浮，不写入看板也不进撤销历史，需要实时 peer 连接
- **举手**：按举手顺序显示，屏幕阅读器播报变化，人离开自动放下
- **点投票**：Miro 式点选对象投票，也支持徽章和无障碍列表投票，结果可隐藏到揭晓，支持时间限制，可导出 CSV / JSON
- **私密模式**：每个人的新便签对他人保持背面朝上，直到引导者一次性揭示
- **议程运行器**：有序画框变成步骤，带时长和说明，保存为可复用内容后，引导者自己的剧本可以带着原始时间插进来
- **跟随演示**：跟随者只看得到当前幻灯片，被画框边缘裁切

匿名模式在应用里隐藏内容与姓名，README 明确注明：**它们不是加密**。

### 3.6 CAD：几何内核是自己写的

```
src/
  core/                # 无框架模型（可单元测试）
    schema.js            实体和图纸数据模型
    drawing.js           带撤销重做的事务式绘图
    spatial.js           用于拾取、选择、捕捉的 R-tree 空间索引
    tessellate.js        实体到显示列表（样式、块、文本、填充）
    geom/                几何内核：求交、偏移、修剪、倒角...
    text/                笔画字体和文本布局
```

命令行支持自动补全、坐标多种写法（`x,y`、`@dx,dy`、`@distance<angle`、直接距离、`<angle` 锁角）、英尺英寸与分数输入、十二种对象捕捉、极轴追踪。DXF 导入导出（R2000 ASCII）在 Web Worker 里做。

### 3.7 PDF：真正把"删除"做到位

它的安全删除逻辑写得非常克制：

> 标记下的文本、图片像素、绘图、链接和批注会**从文件中移除，而不是被覆盖**。标记下的表单字段会在它出现的所有位置被移除。任何无法按常规处理的内容都会列出来供检查。

OCR 用 Tesseract 在设备本地完成，加一层不可见文本层，让扫描件变得可搜索可选择。数字签名用增量更新追加，早先的签名保持有效。

---

## 四、设计哲学：这套东西为什么值得研究

### 4.1 「无框架」是一种立场，不是省钱

React 有 40 万行不是问题，问题是**你能不能解释为什么需要它**。这个项目的答案是：不需要。

Vanilla JS + Vite 的结果是：没有框架升级带来的破坏性变更，没有 hydration 问题，没有虚拟 DOM 和真实 DOM 之间的不一致，构建产物就是你能读懂的代码。对一个要长期维护、可能被审计、可能需要被移植到其他运行环境的专业软件来说，这是更安全的选择。

**特别是 Documents 和 3D 这两个最复杂的应用**，它们是"不写框架"这个决定的最大受益者：文档引擎需要精确控制渲染和序列化的边界，3D 引擎需要直接控制 WebGL 生命周期，框架在这两个场景里只会碍事。

### 4.2 「后端即平台」：把复杂度集中到一处

每个应用都写着 "no server of its own"。这带来三个后果：

1. **应用侧零配置**：没有环境变量、没有 API Key、没有数据库迁移。静态托管即可。
2. **数据侧统一**：账号、权限、存储、KV、Worker、部署全部走同一套抽象，新应用接入成本极低。
3. **协作侧自然**：因为存储和 Worker 都在平台侧，多人协同、数据一致性、权限校验这些最难的部分由平台统一提供。

**代价是应用高度依赖平台。** 这是一个明确的取舍，不是免费的午餐。用 Puter.js 意味着你的应用不能独立于 Puter 存在。

### 4.3 「不静默丢失」是贯穿全项目的一条铁律

这条原则在多个应用里反复出现，我把它单独拎出来：

- Documents：*"用不支持的特性打开文档时按尽力而为处理……不要挂上可能丢弃不支持内容的保存处理器"*
- 3D：*"不支持的数据会被报告出来，而不是静默丢失"*
- PDF：*"任何无法按常规处理的内容都会列出来供检查"*
- Records（alpha）：*"功能可能变化，数据可能丢失"*
- CAD（alpha）：*"特性可能变化，图纸可能丢失，请自行留副本"*

**这是一条把"用户的数据安全"放在"功能演示效果"之前的原则。** 大多数创业项目做不到，因为 alpha 阶段的 alpha 就是要把所有按钮都点亮。但这里选择了在 README 第一段就写"请不要依赖它"，并且在代码层面拒绝无法安全处理的操作。

### 4.4 「文档即规格」

看 documents 的文档结构就知道这是什么做法：

```
src/documents/docs/
  conformance.md                          # 规范符合性记录
  docx-parity-roadmap.md                  # 与 Word 的差距路线图
  paragraph-property-coverage.md          # 段落属性覆盖情况
  run-property-coverage.md                # 字符属性覆盖情况
  field-code-coverage.md                  # 域代码覆盖情况
  table-property-coverage.md              # 表格属性覆盖情况
  theme-structure-coverage.md             # 主题结构覆盖情况
  shape-fill-outline-coverage.md          # 形状填充与轮廓覆盖情况
  comment-revision-property-coverage.md   # 批注修订属性覆盖情况
  ...（共 20+ 份覆盖度文档）
  parity/                                 # 按功能域拆分的差距清单
    chrome.md, collab.md, design.md, draw.md, format.md,
    insert.md, mailings.md, pictures.md, references.md,
    review.md, tables.md, views.md
```

而且规矩很硬：

> 为每个编辑器功能，记录相关的 ECMA-376 / OOXML 条款和已支持子集。加上行为测试以及独立生成的 DOCX fixture，用 `npm run check:conformance` 验证浏览器导出。**在声明功能完成之前，修正规范审查发现的差异。明确记录剩余的差距；schema 通过不等于完整的 OOXML 符合性或布局保真度。**

**"schema 通过不等于布局保真度"** 这句话，是整份文档里最值钱的一句。它戳破了软件工程里一个非常常见的自欺：数据模型对上了，不代表渲染结果对。

同样的严谨度体现在 Documents 的测试结构上：光 `tests/fixtures/` 下面就有几百个目录，每个目录对应一个细分特性（`border-round-continuous`、`cjk-wrap`、`script-line-boxes`、`para-line-units-default-24`……）。有些 fixture 目录里甚至还有自己的 README，说明这个特性具体测什么。

### 4.5 「AI 是功能，不是主角」

这个项目最反潮流的一点是：**它几乎不谈 AI。**

Spreadsheet 里 AI 是单元格函数 `AI()`。3D 里有 AI 助手侧边栏。Whiteboard 里有 AI 集成。但整个仓库的叙事主线是"重建世界的软件"，AI 只是若干应用里的一个能力。

对比一下当下开源项目动辄把 "AI-native"、"agentic" 挂在标题上的风气，这项目显得像个老派工匠。**但它把力气全花在了对的地方**：510 个 Excel 函数、4 万行 3D 几何与渲染、干净的数据结构、两千多个测试 fixture。这些东西 AI 写不出来，因为它们需要几十年的领域知识沉淀和耐心。

### 4.6 「把许可证合规写进 CI」

`check:licenses` 不是一个提醒，是一道会挡住构建的门（`prebuild` 钩子）。而且规矩明确禁止"为了过检查而放宽白名单"。

在一个 AI 可以批量生成代码的年代，许可证污染是最容易发生的合规事故。这条规则来得正是时候。

---

## 五、归纳总结：八个可迁移的观点

**观点一：专业软件的护城河在数据结构，不在界面。** 3D 的 40 万行里，最核心的是 `data/types.ts` 里的 data-block 表（objects、meshes、materials、node_groups、actions）和依赖图求值。UI 是壳，数据模型是命。AI 能帮你写界面，写不出成熟的文档对象模型。

**观点二：「无服务器」不等于「无架构」，是把架构集中投资。** 这个项目没有在每个应用里重复实现用户系统、权限、存储，而是把这些沉到平台层，然后专心做差异化功能。这是平台型创业的标准路径，但很少有开源项目敢做得这么彻底。

**观点三：诚实的降级比勉强的兼容更有价值。** Documents 宁可编辑前拒绝不支持的结构，也不做"看起来能打开但存下去丢内容"的假兼容。同样的判断力体现在 3D 不支持导出 `.blend`、CAD 明确标注 alpha。**产品信任是这么攒出来的。**

**观点四：文档的质量决定项目的上限。** Spreadsheet 那 1200 行 README 本身就是产品说明书；Documents 那 20 多份覆盖度文档是工程资产。对比一下大部分开源项目 README 里"Contributing welcome!"的空白，这个项目的文档密度高出一个数量级。

**观点五：测试夹具（fixture）比单元测试更能逼近真实复杂度。** Documents 为每个细分排版特性建独立 fixture 目录，比一个大而全的测试文件更容易定位回归。**按特性维度切分测试，比按函数维度切分更贴近 bug 的发生方式。**

**观点六：把「一致性」做成 CI 契约。** `amplify.yml` 要求每个应用都有条目，`customHttp.yml` 明确"找不到条目就部署失败"，`check:licenses` 挂在 `prebuild` 上。**规则写进配置，而不是写进 wiki。** wiki 会过时，CI 不会。

**观点七：AI 应该是文件格式里的一等公民。** `AI()` 作为 Excel 函数、`TRANSLATE()` 作为内建函数，比"加个 AI 侧边栏"更有用。因为用户要的是**在具体工作流里的一步**，不是一个需要额外切换的独立工具。

**观点八：对这个项目最理性的使用方式，是当架构教材而不是当产品。** 它自己都写了 "Early alpha"、"do not rely on it for real projects yet"。所以正确的读法是：**读它的 AGENTS.md、ARCHITECTURE.md、conformance.md，然后在自己有真实商业约束的场景里，复制它的判断，而不只是复制它的代码。**

---

## 六、老板视角：这堆代码跟生意有什么关系

上面全是工程视角，做生意的人可能想问：这个东西对我有什么用？

**第一，它是一份用真金白银换来的"功能清单"。** 53 个应用覆盖了从个人效率到企业经营的完整链条。哪个品类你做了很多年还没找到好的开源方案，看一眼这个清单，可能就找到了现成的起点。

**第二，它证明了一件事：软件的生产成本正在塌方，但塌的是哪一截要看清楚。** 40 万行的 3D 引擎、25 万行的 PPT 引擎，写它们的成本在 AI 辅助下会持续下降。**但 Spreadsheet 里那 510 个函数的边界情况、Documents 里那几百个 fixture 背后的规范知识，不会因为 AI 更强就自动出现。** AI 能写实现，写不出"知道哪条规范条款要覆盖"。

**第三，"不写后端"正在变成一种可行的架构风格。** 如果你的业务里，每个应用都自己搭一遍用户系统、权限、存储，你会在第三个应用上耗尽耐心。这个项目的做法是：把这些沉到一个平台层。**对做 SaaS 的老板来说，这是成本结构的重排，不是技术选型的偏好。**

**第四，最值钱的一条：数据主权是可以被工程化的。** "你的文件存在你自己的云上"听起来像营销词，但落到实现上是一整套具体决策：存真实 `.xlsx` 而不是私有格式、用真实 `.docx` 而不是自有结构、不静默丢弃、导出路径完整。对做企业服务的老板来说，**这意味着你的客户不被锁定，而你的产品不被平台的策略变更绑架。**

---

## 七、写在最后

我翻完这个仓库，最强烈的感受不是"这些应用真厉害"，而是**一种久违的耐心**。

53 个应用，每个都是从零实现，没有一个是套壳。40 万行的 3D 引擎，8,711 个测试文件，几百个排版特性 fixture，20 多份 OOXML 覆盖度文档。这些东西没有 AI 帮忙的时候，一家公司要花多少钱多少年才做得出来？现在，它全部躺在 GitHub 上，MIT 和 AGPL 混合，免费。

这不是"颠覆 Microsoft Office"的故事。这是一个更朴素也更值得尊重的故事：**有人决定认真做一件难很久的事，然后把它放在大家都能拿到的地方。**

至于要不要用？我的建议是：**代码随便拿，文档认真读，alpha 的部分谨慎跑，许可证先看清楚。** 这四句话，恰好就是这个项目教给我们最好的东西。

---

## 附：核心资料索引

| 用途 | 路径 |
|---|---|
| 项目总览 | `README.md` |
| 许可与依赖红线 | `src/documents/AGENTS.md` |
| 3D 引擎架构 | `src/3d/ARCHITECTURE.md` |
| 功能规格范本 | `src/spreadsheet/README.md` |
| OOXML 符合性记录 | `src/documents/docs/conformance.md` |
| 多应用部署配置 | `amplify.yml` / `customHttp.yml` |
| 本地域名插件 | `dev/puter-localhost.mjs` |

> 相关的中文译本已同步至公开代码仓库的 `docs/everything-translations/` 目录，包含项目总览、Spreadsheet、Documents、3D Studio、CAD、Teamchat、PDF、3D 架构与依赖规范共 9 份文档的完整中文翻译。

---

**口径说明**：本文基于 HeyPuter/everything 公开仓库 <https://github.com/HeyPuter/everything> 的 commit `f45527dee1f82c816849e6a3854c09da591f50b8` 整理，代码行数、文件数、测试文件数均为本地完整克隆后按统一口径统计得出（排除 node_modules、dist、tests、vendor、tmp 目录），各应用行数按同一口径逐个统计。许可证信息取自各子应用 package.json 的 `license` 字段与仓库内 LICENSE 文件，MIT 与 AGPL-3.0-only 混用情况已逐个核对。文中引用的应用功能描述、限制说明与警示（如 CAD 的 "Early alpha"、3D 的 clean-room 声明与不支持导出 .blend）均译自官方 README 原文，未作美化。文档中文译本已同步发布在配套代码仓库的 `docs/everything-translations/` 目录，共 9 份。文中关于设计哲学、归纳观点与商业影响的分析为本人判断，不代表项目官方立场。

---

Eric|瑞哥
广东 深圳

✅前IBM架构师｜区块链书《区块链核心技术与应用》合著作者
技术代码仓库:https://github.com/gyc567
个人网站:www.topdigg.com
💼新加坡资管公司前CTO
👉公众号「瑞哥观势」主理人
💎聚焦在:创富和守富
🎯专注老板群体：用AI 降本增效
微信:360369487

---

在这个快节奏的时代，我依然相信面对面、小范围、高浓度的链接力量。

我致力于搭建一个"去泡沫化"的老板圈子，重点关注：

🔹 电商全域：国内直播、跨境电商与出海项目孵化

🔹 创投与产投：金融银行资源对接、企业融资与并购

🔹 内容生态：MCN机构、达人矩阵与品牌整合

🔹 组织建设：企业核心团队搭建、高管寻访

**【我的线下局】**

不办大会，只办"小会"。

✅ 创业私董会：深度剖析商业难题

✅ 老板闭门饭：链接同频灵魂，甚至解决人生大事（高质量单身圈层）

✅ 行业沙龙：聚焦具体赛道，促成实质合作

**筛选标准：**

只欢迎有结果、有边界感、有长期主义心态的创始人/合伙人。

时间宝贵，只留给有价值的人。
