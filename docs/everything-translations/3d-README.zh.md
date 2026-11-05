> 译文来源：HeyPuter/everything 仓库 <https://github.com/HeyPuter/everything> 中的 `src/3d/README.md`（commit f45527dee1f82c816849e6a3854c09da591f50b8）。
> 以下为中文翻译，命令、代码、路径与链接保持原样。

# 3D

一个完全运行在浏览器中的 Blender 替代品：建模、雕刻、UV 编辑、着色器/几何/合成节点、动画与绑定、物理、路径追踪与实时渲染、视频剪辑、运动追踪、Grease Pencil 与脚本，无需安装任何东西。它基于 three.js（WebGL2）用 TypeScript 从零编写。

本项目是独立的：它是一次 clean-room（净室）实现，不包含任何 Blender 源码、图标、主题或其他资产，也与 Blender Foundation 无关联或背书关系。"Blender" 是 Blender Foundation 的商标。

## 本地运行

前置条件：**Node.js 24 LTS** 与 npm，以及一个支持 WebGL2 的浏览器（任意较新的 Chrome、Edge、Firefox 或 Safari）。

```sh
npm ci
npm run dev          # 打开打印出来的 URL
```

URL 中的 `?factory-startup` 会从默认场景启动，而不恢复自动保存的会话。

## 构建与测试

```sh
npm run build        # 类型检查 + 生产构建输出到 dist/
npm run preview      # 提供生产构建的预览服务
npm test             # 单元测试（vitest）
npx playwright install chromium
npm run test:e2e     # 浏览器测试（Playwright）；E2E_BASE_URL=… 可复用正在运行的服务器
npm run check        # 以上全部
```

## 包含哪些内容

**界面。** 顶栏包含默认工作区（Layout、Modeling、Sculpting、UV Editing、Texture Paint、Shading、Animation、Rendering、Compositing、Geometry Nodes、Scripting），以及一个「+」菜单，内含 2D Animation、Motion Tracking 和 Video Editing 模板。区域可以被拆分、合并，并切换到任意编辑器（Shift+F1…F12）。菜单、饼状菜单（pie menu）、F3 搜索、重做面板（F9）、工具提示、状态栏以及默认键位映射（左键选择、小键盘/模拟小键盘导航）。
一个文件可包含多个场景与视图层（逐层的集合开关、通道、AOV、灯光组）；每个属性上都有右键菜单（关键帧、驱动器、重置、复制数据路径等）、自定义属性，以及面板、操作符和导入导出选项的预设。

**编辑器。** 3D 视图、Outliner（大纲视图）、Properties（属性）、Timeline（时间线）、Dope Sheet（摄影表）、Graph Editor（曲线编辑器）、Drivers（驱动器）、Nonlinear Animation（非线性动画）、Shader Editor（着色器编辑器）、Geometry Node Editor（几何节点编辑器）、Compositor（合成器）、Spreadsheet（表格）、Image Editor（图像编辑器）、UV Editor、Video Sequencer（视频序列编辑器）、Movie Clip Editor（影片剪辑编辑器）、File Browser（文件浏览器）、Text Editor（文本编辑器）、Python Console（Python 控制台）、Info（信息）、Preferences（偏好设置）。

**对象与模式。** 网格、曲线（贝塞尔/NURBS/多段线）、文本（Inter 字体）、骨架、晶格、空对象（包括参考图/背景图）、灯光、相机、Grease Pencil、体积（OpenVDB 导入）、点云、元球与毛发曲线。对象模式、编辑模式（网格、曲线、骨架、晶格、文本）、姿态（Pose）模式、雕刻模式、顶点/权重/纹理绘制模式，以及 Grease Pencil 的绘制/编辑/雕刻模式。

**建模。** 选择工具（点击、框选、圆形、套索、循环/环带、相连、最短路径等）、带约束的变换、数值输入、比例编辑与元素捕捉（顶点、边、边中点、面、体、网格、增量）、挤出、内插、倒角、循环切分与滑动、刀具、旋转、切割、撕开、合并、消融、填充/桥接、细分、对称化、法线工具、UV 展开与投影，以及修改器堆栈（Array、Bevel、Boolean、Build、Decimate、Edge Split、Geometry Nodes、Mask、Mirror、Remesh、Screw、Solidify、Subdivision Surface、Triangulate、Weld、Wireframe、Armature、Cast、Curve、Displace、Hook、Lattice、Shrinkwrap、Simple Deform、Smooth、Laplacian Smooth、Warp、Wave、Weighted Normal、Smooth by Angle，以及物理修改器）。

**雕刻与绘制。** 约 20 支雕刻笔刷，带对称、遮罩与体素重构网格（remesh）；顶点、权重与纹理绘制；自动骨架权重。

**节点。** 约 80 个着色器节点编译为 GLSL（Principled BSDF 及其系列、纹理、颜色与向量工具），带字段、实例与查看器的 Geometry Nodes（几何节点），以及具备完整合成节点集与背景的 GPU 合成器。

**动画与绑定。** 关键帧、关键帧集（keying set）、自动关键帧、F-曲线修改器、驱动器、非线性动画（NLA）、运动路径、Bake Action、带 IK 与骨骼约束的骨架、形态键、对象约束。

**物理。** 刚体（Rapier）、布料、软体、粒子（发射器与毛发）、力场、碰撞，以及烟雾/火焰域解算器，全部在时间线上做缓存。

**渲染。** 实体/材质预览/渲染视图着色，带降噪的渐进式路径追踪器、体积与次表面散射、灯光链接与纹理烘焙，以及实时光栅引擎（AO、泛光、软阴影、运动模糊）、色彩管理（Standard、AgX、Filmic、Khronos PBR Neutral）、F12 静帧与动画渲染为 PNG/JPEG/WebP 序列或 WebM 视频、渲染通道、合成与序列器输出，以及在最终渲染之上的线条渲染（线集与线样式）。

**视频剪辑与追踪。** 视频序列编辑器包含场景、影片、图像、声音、颜色、文本、调整、元数据与效果片段，并支持音频混音；影片剪辑编辑器包含 2D 特征追踪、特征检测、2D 稳定、带场景朝向的相机求解、平面轨道，以及 Follow Track / Camera Solver / Object Solver 约束。

**脚本。** 一套可从 JavaScript（离线）或 Python（Pyodide，首次使用时加载）使用的 `bpy` 风格 API、带「运行脚本」的文本编辑器、Python 控制台，以及由脚本注册的操作符与面板。

**AI 助手。** 一个侧边栏（默认打开；顶栏的 Assistant 按钮或 窗口 › AI Assistant 可显示/隐藏，并会记住选择），你在其中描述要构建或修改什么。它运行在 Puter AI 之上：读取场景，针对 `bpy` 风格 API 编写并运行脚本（脚本失败会回滚）、查阅 API、截取视口截图检查自己的工作，并读取附带的参考图像、PDF 与文本文件。它为一条消息所做的一切更改算作一个撤销步骤。

**文件。** 原生 `.p3d` 项目格式，带自动保存/恢复；导入 Blender 2.80–5.x 写出的 `.blend` 文件；导入/导出 glTF/GLB、FBX、OBJ/MTL、STL、PLY 与 USD（USDA/USDC/USDZ）；导入 Collada 与 Alembic；Grease Pencil 的 SVG/PDF 导出与 SVG 导入；以及本应用早期版本中的旧版 `.3d.json` 场景。文件 › 链接/追加 可从其他 `.p3d` 或 `.blend` 文件引入数据，可以作为只读链接数据（带库覆盖），也可以作为本地副本。

## 已知限制

- 没有 EEVEE 专属特效。路径追踪器最多同时渲染 8 个体积（重叠处一次只用一种介质），并支持最多 64 种材质的随机游走次表面散射；实时引擎没有次表面散射。
- Python 脚本覆盖 `bpy` 的一个成文子集；每个会话需要一次网络访问以下载 Pyodide。
- `.blend` 导入覆盖活动场景与常见数据（不含体积、点云或线条渲染设置）；不支持的数据会被报告出来，而不是静默丢失。不支持导出为 `.blend`。
- 各特性的限制请参见模块头部注释与 pull request 描述。

## 代码结构

参见 `ARCHITECTURE.md`。

## 许可证与第三方软件

参见 `LICENSE` 与 `THIRD_PARTY_NOTICES.md`。随包分发依赖的许可证文本位于 `public/licenses/`。

## 许可证

本应用及其全部内容、模块与组件，采用 [GNU Affero General Public License v3.0](LICENSE)（AGPL-3.0-only）许可。本应用中包含的第三方库可能受其各自许可证约束。

## 译者注

- 源文特别声明本项目与 Blender 无关：它是 clean-room（净室）实现，不含 Blender 源码/图标/主题/资产，且「Blender」商标归 Blender Foundation 所有；这段免责声明原样保留。
- Blender 与各编辑器/工作区的专有名称（Layout、Sculpting、Geometry Nodes、Dope Sheet 等）保留英文原名，与 Blender 用户习惯一致；通用功能描述才译为中文。
- 源文列出明确限制：无 EEVEE 特效、路径追踪器的体积与散射上限、Python 需联网下载 Pyodide、`.blend` 导入范围有限且不支持导出；这些警示均如实译出，未加评论。
- 许可信息与其余 Everything 项目不同：本应用为 AGPL-3.0-only（根仓库整体为 MIT），译文中保留了二者区别。
