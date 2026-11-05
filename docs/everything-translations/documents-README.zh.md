> 译文来源：HeyPuter/everything 仓库 <https://github.com/HeyPuter/everything> 中的 `src/documents/README.md`（commit f45527dee1f82c816849e6a3854c09da591f50b8）。
> 以下为中文翻译，命令、代码、路径与链接保持原样。

# Documents（文档）

一个浏览器中的文字处理器，采用自研的 canvas editor（画布编辑器），`.docx` 文件存放在你自己的 Puter 云端——是 Microsoft Word 的开源替代品。

本分支实现了自研的 canvas engine（画布引擎）。**不得引入 AGPL 代码及依赖。** 依赖政策记录在 [AGENTS.md](AGENTS.md) 中，并由 `npm run check:licenses` 以及生产构建前的检查把关。

## 运行

```sh
npm ci
npm run dev
```

- **`/playground.html`** — 独立的本地编辑器；无需账号或云 SDK。包含两段与两页的示例内容、本地 DOCX 打开与下载。
- **`/mock.html`** — 应用配有一个内存中的 Puter mock，用于测试保存/重新打开。
- **`/`** — 使用 Puter 进行云存储的应用。

## Canvas 编辑器功能

- 审阅：侧边栏列中的评论线程（回复、编辑、解决、删除）与修订（记录、全部/简单/无标记/原始、接受/拒绝、修订标记条、审阅窗格）；朗读。
- 引用：目录、页脚处的脚注、题注（SEQ）、交叉引用（REF/PAGEREF）、更新域（F9）。
- 页眉页脚：缺失时创建、页码、首页不同、奇偶页不同、页面上的编辑提示。
- 保留的内容不再强制只读：SEQ/REF/DATE/AUTHOR/引文域、隐藏文本、公式（以线性形式显示）、被跟踪的格式更改。
- 与度量兼容的 Calibri、Cambria、Arial、Times New Roman 与 Courier New 替代字体；文件 → 另存为 PDF 时文字可搜索。

- 单删除线与双删除线，支持样式继承、显式移除以及基于字体的画布笔画。
- 行尾的普通空格仍留在本行，并保留换行/下划线兼容标志以及有界的插入符/选区几何。
- 字距调整阈值，支持样式继承，并可显式控制画布的字间距。
- 相同样式段落之间的上下文间距，支持继承以及表格兼容设置。
- 水平文字缩放 1–600%，支持继承，并保留字高与字符间距。
- 扩展/紧缩字符间距，支持样式继承、归零重置以及共享的度量与绘制。
- 带符号的基线偏移，支持样式继承、归零重置并保留字号。
- 上标/下标编辑与样式继承，保留字号并使用偏移后的画布文字几何。
- 使用 OOXML 调色板的文字高亮，支持显式移除以及继承的扁平 run 底纹。
- RGB/自动文字颜色编辑，支持继承主题颜色、色调/明暗以及彩色单下划线。
- 使用内置 Noto Sans 字体的画布文字渲染。
- 点击定位插入符；拖动、Shift+click 以及键盘可在段落与页面间选择。
- 文本插入/删除、段落拆分/合并、加粗、斜体、单下划线、以半点为步进的字号、撤销与重做。
- 左对齐、居中、右对齐与两端对齐段落；自定义行距倍数、精确/最小点高以及段前/段后间距，并支持继承重置。
- 单节 Letter/A4/Legal/自定义页面设置、方向、页边距与装订线；手动分页符与分栏符以及段落分页。
- 段落缩进与制表位，带可编辑的点/短横线/实线前导符，与下段同页/段中不分页，以及孤行控制。
- 项目符号与编号、可复用的段落样式和字符样式，以及遵循 ECMA-376 切换属性规则的继承格式。
- 固定宽度与自动调整表格、水平/垂直单元格合并、跨页续排的行以及重复表头。
- 可编辑的自动/最小行高，含合并行，并支持撤销/重做与页面回流。
- 可编辑的大纲级别与文档导航，支持样式继承与内置标题语义。
- 内联 PNG/JPEG 插入、调整大小、源裁剪、水平/垂直翻转、旋转、替代文字，并保留原始图片字节。
- 原生文本输入与输入法组合桥接；复制、剪切与粘贴可保留标题、列表、强调、颜色与链接（表格、域和控件内部为纯文本）。
- 用于文本编辑的原生 textarea 模式。
- 本地 DOCX 打开/下载，以及 Puter 保存/重新打开。
- 保留未改动的 DOCX 包部件以及原始的 run/段落属性。

这是一个受限的编辑器原型。页面预览使用已保存的单节尺寸/页边距以及内置的 Noto Sans 正体/斜体；它并不是对原生 DOCX 排版的完整复现。域、评论、修订、多节、嵌套表格、浮动图片、自动段落间距等不受支持的结构会在编辑前被拒绝。引擎指南与一致性记录定义了各自支持的范围。内置模板（Letter、Meeting notes、Report、Résumé、Essay）以新文档打开，使用画布引擎的样式、列表与表格排版。纯文本文件按每行一个段落导入，Markdown 与 HTML 文件则连同其标题、列表、强调和链接一起导入。旧版编辑器的高级特性尚未接入。

参见[引擎指南](docs/canvas-engine.md)，其中包含架构、支持范围、手动验收场景以及后续迭代计划。

编辑器把文档标题与保存状态、文件/编辑/查看/插入/格式/表格菜单，以及日常格式工具栏相互分开。较少使用的控件可通过菜单或**更多格式工具**获得。鼠标用户在窄窗口中会遇到换行控制项；触摸用户可以滑动工具栏。键盘用户可用方向键在菜单标题和工具栏按钮之间移动，按 Escape 从工具栏返回文档。

在手机尺寸的屏幕上，加粗、斜体、下划线、文字颜色与高亮保留在工具栏中。删除线、上标与下标移入**更多格式工具**，并仍可经由格式 → 文字访问。调整尺寸时会移动现有控件并保留其选中状态。

查找与大纲在工作区左边缘共享一组带标签的导航控件，位于格式区下方。在手机上它们排成一行，把整幅宽度留给文档。查找替换与大纲在桌面上共用一个左侧面板，在手机上使用可滚动的底部面板。搜索时菜单、格式工具栏以及文件 → 下载 .docx 命令仍然可用。手机布局一次只显示一个导航/格式/搜索面板；Escape 关闭搜索并返回当前匹配项。

在字号输入框中，Enter 应用有效字号并返回写作。Escape 取消草稿，包括无效值或混合选中值，不会添加撤销步骤，也不会关闭手机上的格式检查器。

## 检查

```sh
npm run check:licenses
npm test
npm run test:browser
# 需要 Python 测试工具；参见 docs/conformance.md
npm run check:conformance
npm run build
```

浏览器测试默认使用已安装的 Google Chrome。如需使用 Playwright 的 Chromium，运行 `npx playwright install chromium` 并设置 `PLAYWRIGHT_CHANNEL=chromium`。

新增的测试覆盖文档变更、格式保留、对不支持文件的拒绝、分页、原生输入事件、浏览器下载/重新打开，以及使用 mock 的云端保存/重新加载。与被移除引擎相关的测试已下线；与引擎无关的工具、存储与路由测试保留。

参见[一致性记录](docs/conformance.md)，其中包含规范条款、独立的 schema 检查、渲染对比以及遗留差距。

## 源码结构

```text
src/engine/model.js          文档模型与编辑事务
src/engine/docx.js           DOCX 包保留与序列化
src/engine/page-settings.js  页面度量、校验与几何
src/engine/layout.js         换行、分页与源位置几何
src/engine/font-metrics.js   来自内置 Noto 字体表的度量
src/engine/canvas-editor.js  画布渲染器与输入适配器
src/views/editor.js          编辑器控件与存储集成
src/playground.js            独立的本地测试台
src/lib/doc.js               既有的保存、冲突、版本与生命周期模型
public/fixtures/            独立生成的示例 DOCX
public/fonts/               Noto Sans 及其许可证与来源说明
```

较早由应用自行编写的导入/导出辅助工具仍然保留，供后续迁移使用。它们的存在并不意味着当前的 canvas engine 支持这些特性。

## 许可

- 应用与自研 canvas engine：[MIT](../../LICENSE)。
- ZIP 编解码器 `fflate`：MIT。
- 实时协同编辑（CRDT）`yjs` 及其 `lib0` 与 `isomorphic.js` 辅助库：MIT。
- Noto Sans：[OFL-1.1](public/fonts/OFL.txt)，附[来源说明](public/fonts/PROVENANCE.md)。
- 其他保留的依赖：[第三方声明](public/licenses/THIRD_PARTY.txt)。

`tools/check-licenses.mjs` 会检查所有锁定依赖的许可证声明，拒绝未知声明与已移除的引擎包，并校验随包分发的字体许可证。这是一项依赖政策检查，并不等同于声明包元数据可以取代源码审计。修改运行时依赖后请运行 `node tools/generate-licenses.mjs` 以刷新分发用的声明文件。

## 许可证

本仓库及其全部内容、子项目、模块与组件，除另有明确说明外，均采用 [MIT](../../LICENSE) 许可。仓库中包含的第三方库可能受其各自许可证约束。

## 译者注

- 「canvas engine」在本文档中译为「canvas engine（画布引擎）」，「canvas editor」译为「canvas editor（画布编辑器）」，因为源文反复强调这两者是自研、区别于既有 DOCX 引擎的独立实现，保留英文更能对应代码中的 `src/engine/`。
- 源文明确说明这是「a restricted editor prototype」，页面预览并非对原生 DOCX 排版的完整复现，且不支持的结构会在编辑前被拒绝——译文如实保留了这层限制，未做淡化。
- 许可约束是本文件的核心要求之一：禁止引入 AGPL 代码与依赖，并由 `npm run check:licenses` 与 `tools/check-licenses.mjs` 把关；引用 `docs/conformance.md` 的链接指向原文保持不变。
- 本文件描述的是 Everything 项目中「文档编辑器」这一 monorepo app（单仓库应用）的实现与自检方式，与根 README 中的 `src/documents/` 目录对应。
