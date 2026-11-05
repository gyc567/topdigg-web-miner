> 译文来源：HeyPuter/everything 仓库 <https://github.com/HeyPuter/everything> 中的 `src/3d/ARCHITECTURE.md`（commit f45527dee1f82c816849e6a3854c09da591f50b8）。
> 以下为中文翻译，命令、代码、路径与链接保持原样。

# 架构

本应用是一套基于浏览器的 3D 创作套件。全部为纯 TypeScript（无框架），使用 **three.js**（WebGL2）渲染。世界坐标系为 **Z 轴向上（Z-up）**，单位为米，角度在内部以弧度表示。属性命名遵循广泛使用的 `bpy` 脚本约定（`location`、`rotation_euler`、`hide_render` 等），这样动画路径、脚本与导入器可以 1:1 对应。

```
src/
  app/        应用运行时（文档、撤销、操作符、模态）、键位映射、偏好设置
  data/       文档类型（types.ts）、工厂函数（defaults.ts）、RNA 路径（rna.ts）、写时复制快照
  mesh/       多边形网格辅助（mesh.ts）与基元
  eval/       依赖图：变换、约束、修改器、骨架/IK、曲线、纹理
  anim/       F-曲线、关键帧、驱动器、非线性动画求值
  render/     共享 WebGL 渲染器（engine.ts）、场景同步、材质、网格、辅助物、图像
  editors/    编辑器（view3d/、properties/、outliner.ts、timeline.ts 等）
  ui/         虚拟 DOM（h.ts）、控件、菜单/饼菜单/浮层、屏幕/区域、外壳、属性辅助
  ops/        操作符（object、view3d、screen、transform、data、wm）
  object/     对象模式菜单与对象数据管理：顶点组、形态键、材质
              槽、修改器、钩子、关系/数据传递、实例化（集合/顶点/面）、
              扬声器、快速效果
  io/         原生 .p3d 格式、自动保存、旧版导入、文件操作符 + 格式注册表、
              fonts.ts（文字轮廓）、formats/（glTF、FBX、OBJ、STL、PLY、USD、Collada、Alembic）、
              blend/（.blend 读取器）
  modes/      编辑模式：editmesh/（网格）、armature/（编辑 + 姿态）、curve/、lattice/、text/
  nodes/      节点注册表、着色器节点 + GLSL 编译器、通用节点编辑器（editor/）
  geonodes/   几何节点节点、字段求值器、NODES 修改器、几何节点编辑器
              curves/：样条类型（贝塞尔/NURBS/Catmull-Rom 属性 + 求值）、曲线、文本、
              导入、Grease Pencil 与 gizmo 节点；通过 `place()` 放置在添加菜单中（curves/menu.ts）
  spreadsheet/ 表格编辑器
  compositor/ 合成节点（GPU）、合成器编辑器、渲染后处理
  animation/  摄影表、曲线编辑器、驱动器、非线性动画编辑器及其操作符
  paint/      雕刻、顶点/权重/纹理绘制、体素 remesh、自动权重
  hair/       毛发曲线对象：数据（doc.hair_curves）、发丝显示/渲染管线、编辑模式、
              雕刻曲线笔刷（brushmath.ts 为纯函数）、转换、贴面变形曲线；
              particle/：毛发粒子系统的粒子编辑模式（在该系统上编辑关键帧）
  constraints/ 对象/骨骼约束选项卡（约束面板）、constraint.* 操作符、骨骼选项卡的 IK 面板
  physics/    刚体（Rapier，懒加载）及其关节、布料、软体、粒子（群集、
              流体、关键帧、毛发动力学）、力场、烟雾与液体域、动态绘制
  render/final/ 路径追踪器、光栅引擎、F12/动画渲染、图像编辑器、色彩管理；
              props/ 保存渲染、输出、视图层与相机数据属性面板
  render/realtime/ 注入场景材质的实时引擎效果（fxshader.ts：光
              照度、屏幕追踪、地平线扫描、平面/体积探针）、泛光、阴影、
              烟雾与世界体积、AO/AOV 通道、光照探针对象（probes/）
  sequencer/  视频序列编辑器（片段、效果、预览、音频）
  tracking/   影片剪辑编辑器、2D 追踪、稳定、Follow Track 约束
  mask/       遮罩数据块（带羽化的贝塞尔样条、形态键、追踪父子关系）、
              栅格化、剪辑编辑器的遮罩模式、合成器遮罩节点
  greasepencil/ Grease Pencil 对象、绘制/编辑/雕刻模式、2D 动画工作区
  scripting/  bpy 风格 API（JavaScript + Pyodide Python）、文本编辑器、控制台、信息
  prefs/      偏好设置编辑器：分区、键位映射编辑器 + 键位配置、主题、工作室
              灯光/MatCap/HDRIs、插件、NDOF 设备
  assistant/  AI 助手侧边栏（Puter AI）：智能体循环、场景快照、基于脚本 API 的工具
  assets/     资产系统：数据块上的资产元数据（asset_data）、目录、库（当前
              文件、内置 Essentials、IndexedDB 中的用户库）、预览、资产浏览器编辑器
              （ASSETS）、拖放、姿态库、.blend 资产标记导入（io/blend/assets.ts）
  scenes/     多场景（doc.scene 为当前场景，其余在 doc.scenes 中并带其主
              集合）、视图层（当前层的通道/集合开关为实时，其余存储并可切换）、
              灯光链接 + 灯光组（rendervis.ts 向 RenderScene 供给）、背景场景、
              顶栏场景/视图层选择器、bpy 场景与视图层
  library/    链接库：库数据块（doc.libraries）与库文件存储
              （IndexedDB：最近打开的项目、文件夹句柄、已选取的副本）、文件 ▸ 链接/追加
              浏览器、只读链接数据、打开时重新加载、重定位、转为本地、库
              覆盖、bpy.data.libraries；core.ts 为纯函数（有单元测试）
  edit/, modifiers/, storage/document.ts, core/   保留供复用的旧版多边形内核
                                                 （unwrap/UV）与旧版 .3d.json 解析器
```

## 核心概念

### 文档（`data/types.ts`）
`DocumentData` 持有按 id 索引的数据块表（`objects`、`meshes`、`materials`、`node_groups`、`actions` 等），以及 `scene`（帧范围、渲染设置、工具设置、活动对象、主集合）和 `mode`。对象按 id 引用数据（`ob.data`）。

网格是多边形网格：`positions`（每顶点的 xyz）、`offsets`（面角偏移）、`indices`（每角的顶点）、`uvs`（逐角），可选的逐角 `seams/sharp/creases`，逐面的 `smooth/material_index`，逐顶点的 `select_vert/hide_vert`，`vertex_groups`+`weights`、`shape_keys`、`color_attributes`。辅助函数位于 `mesh/mesh.ts`（`buildMesh`、`toPolys`、`edgeTopology`、`vertexFaces`、`cornerNormals`、`triangulatePoly`）。

**类型化数组在一次撤销推入之后即不可变。** 若要在操作过程中原地修改，使用 `data/cow.ts` 中的 `cow(owner, 'key')`（每个撤销步骤复制一次），或直接赋一个新数组。

### App（`app/app.ts`）
`import { app } from './app/app'`。主要成员：
- `app.doc`、`app.graph`（依赖图）、`app.activeObject`、`app.selectedObjects()`、`app.isVisible(id)`
- `app.changed(...kinds)` – 安排重新求值与重绘。kinds 取值：`'doc' | 'select' | 'frame' | 'ui' | 'mode' | 'view' | 'geometry'`
- `app.pushUndo(label)` – 推入一个撤销快照（在一次不经由操作符的直接编辑之后调用）
- `app.run(idname, props?, { invoke?, event? })` – 运行一个操作符
- `app.report(type, message)` – 状态栏/信息日志消息
- `app.startModal(handler)` / `app.endModal('FINISHED'|'CANCELLED')`
- `app.setFrame(n)`、`app.playing`

### 操作符
```ts
import { registerOperators } from '../app/app';
registerOperators([{ idname: 'mesh.subdivide', label: 'Subdivide', props: [...PropDef], poll: (ctx) => bool,
  exec: (ctx, props) => 'FINISHED' | 'CANCELLED' | void, invoke?: (ctx, props) => ..., undo?: boolean }]);
```
- `exec`/`invoke` 返回 `FINISHED`（或 `undefined`）之后，App 会以 `label` 命名推入一个撤销步骤；若操作符有可见的 `props`，则在**调整上一次操作（Adjust Last Operation）**面板中提供这些属性（用新属性在前一状态上重新运行 `exec`）。因此操作符在给定 props 的前提下必须是确定性的。
- 视图/UI 类操作符使用 `undo: false`。
- 模态工具：`invoke` 调用 `app.startModal({...})` 并返回 `'RUNNING_MODAL'`。模态的 `label` 在结束时成为撤销步骤的名称。

### 键位映射（`app/keymap.ts`）
`addKeys('Keymap Name', [{ key: 'G', shift?, ctrl?, alt?, op: 'transform.translate', props?, when?: () => bool, menu?: () => MenuItem[] }])`。
键名为事件名：`'A'..'Z'`、`'ONE'..`、`'NUMPAD_1'`、`'TAB'`、`'SPACE'`、`'DEL'`、`'ESC'`、`'RET'`、`'F1'..`、`'LEFT_ARROW'` 等。编辑器在 `editor.keymaps` 中列出它使用的键位映射（按优先级排序）；`Frames`、`Screen`、`Window` 始终生效。Ctrl 同时匹配 Cmd。
条目可设置 `value`（默认 `'PRESS'`，还有 `'RELEASE'`、`'CLICK'`、`'DOUBLE_CLICK'`）与 `repeat: false`；`inactive` 条目会被跳过（其他键盘分发器也必须跳过它们）。偏好设置 ▸ 键位映射会重写这些实时条目（`prefs/keyconfig_core.ts`）：用 `addKeys` 注册按键，编辑器即可拾取，包括启动之后新增的按键。

### 偏好设置（`app/prefs.ts`、`prefs/`）
`prefs` 保存各项取值（持久化在 localStorage 中）。用 `setPref(key, value)`（`prefs/store.ts`）修改：它会应用并保存（除非关闭了自动保存偏好设置）。各模块通过 `onPrefsApply(fn)` 响应；多数效果被推入使用它们的小型设置对象（`menuSettings`、`widgetSettings`、`keyframeDefaults`、`animSettings`、`textureSettings`、`renderViewSettings` 等），这样这些模块就不必导入偏好设置本身。
用 `registerPrefSection({ id, label, group, draw })`（`prefs/editor.ts`）添加一个分区；行辅助函数在 `prefs/ui.ts`。主题写入 CSS 变量以及画布颜色表（`prefs/themes.ts`）；画布编辑器可以用 `canvasGrey(level)`（`ui/canvastheme.ts`）获取跟随主题的灰阶。工作室灯光、MatCap 与 HDRIs：`render/studiolights.ts`。

### 编辑器（`ui/screen.ts`）
```ts
registerEditor({ id: 'GRAPH', label: 'Graph Editor', icon: 'graph', group: 'Animation', create: (area, state) => new GraphEditor(area, state) });
```
一个 `Editor` 具备 `el`（填充该区域）、`header(): Child`（头部虚拟 DOM）、`update(kinds)`、`resize?()`、`dispose()`、`keymaps`、`onKey?(e): boolean`、`serialize?()`。区域头部（编辑器类型下拉框）由框架绘制。工作区（`ui/screen.ts` 中的 `defaultWorkspaces()`）引用编辑器 id：`VIEW_3D, IMAGE_EDITOR, UV, SHADER, GEOMETRY, COMPOSITOR, DOPESHEET, TIMELINE, GRAPH, DRIVERS, NLA, TEXT, CONSOLE, INFO, OUTLINER, PROPERTIES, FILE_BROWSER, SPREADSHEET, PREFERENCES`。未注册的编辑器 id 会回退到 3D 视图。

### UI 工具包
- `ui/h.ts`：`h(tag, attrs, ...children)` 加上带 key 的虚拟 DOM `patch(container, vnodes)`。事件处理器为 `onclick`、`onpointerdown` 等。`ref: (el) => …` 在创建时执行一次。
- `ui/widgets.ts`：`numberField`、`checkbox`、`enumMenu`、`enumRow`、`colorSwatch`、`textField`、`button`、`opButton`、`panel`（可折叠）、`decorator`。
- `ui/props.ts`：数据绑定的分栏行：`num(owner, key, label, opts)`、`bool`、`enumProp`、`colorProp`、`vecProp`、`textProp` —— 它们会推入撤销并调用 `app.changed('doc')`。
- `ui/menu.ts`：`openMenu(items, anchor)`、`openPie(title, items8, x, y, key)`、`openPopover`、`openSearch`、`promptText`。`MenuItem` 支持 `op`/`props`、`action`、`submenu`、`separator`、`heading`、`checked`、`active`、`shortcut`、`icon`。
- `ui/icons.ts`：原创 SVG 图标，`icon('name')`。新图标加在那里（16×16 网格，使用 `class="f"` 填充 / `class="s"` 描边，以便应用主题颜色）。
- 主题：`src/theme.css`（CSS 变量）。复用已有类名（`panel`、`split-row`、`hdr-row`、`hdr-menu`、`hdr-toggle`、`btn` 等）。

### 属性编辑器选项卡
来自 `editors/properties/properties.ts` 的 `registerTab({ id, label, icon, group, poll, draw: (p) => Child })`。修改器面板从 `modifierFields[type]` 获得类型专属字段，额外 UI 通过 `modifierExtraUI[type]`（`editors/properties/stack.ts`）提供。

### 约束（`eval/constraints*.ts`、`eval/constraint_solve.ts`）
`constraintTypes[type] = { apply(ownerMatrix, c, ctx), spaces, usesTarget, boneOnly, deps, isValid }`。
求解器把所有者（以及 `ctx.target`）转换到约束的 owner/target 空间，应用该类型，并按 influence 混合；对象栈在 `evaluateTransform` 中运行，姿态骨骼栈（包括 IK 与样条 IK 求解器，`eval/ik.ts`、`eval/splineik.ts`）在 `evaluatePose` 中运行。面板：`constraints/ui.ts`（`constraintExtraUI[type]` 为在别处注册的类型追加 UI）。

### 求值（`eval/depsgraph.ts`）
`app.graph.get(id)` → `EvalObject { world: Matrix4, mesh?: EvalMesh, pose?, visible, geomVersion }`。
修改器：`registerModifier({ type, label, category, icon, defaults, apply(mesh, mod, ctx), deps?, timeDependent?, deformOnly? })`（`eval/modifiers.ts`）。`MeshBuilder`（`eval/meshbuild.ts`）构建求值后的网格。`app.graph.simulationPositions.set(objectId, Float32Array)` 在修改器堆栈之前注入模拟出的顶点位置（物理缓存）。

### 渲染
`render/context.ts` 导出 `renderContext`（引擎、场景同步、环境贴图）。`render/engine.ts` 拥有唯一的 WebGL2 渲染器；视口实现 `ViewportRenderer` 并绘制到带裁剪的矩形区域中。材质预览/渲染模式的材质来自 `viewportMaterial(doc, materialId)`（`render/pbr.ts`）；基于节点的编译器通过 `setMaterialCompiler` 接入。世界环境：`render/world.ts`。图像：`render/images.ts`（`imageTexture`、`imageCanvas`、`touchImage`）。

### 3D 视图的扩展点
`editors/view3d/hooks.ts`（`editModeHooks.pointer/pick/box/svg/...`）、`modemenus.ts`（各模式的头部菜单）、`toolbar.ts`（`toolsByMode`、`extraToolLists`、`toolSettingsRenderers`）、`sidebar.ts`（`sidebarTabs`、`itemPanels`）、`ops/modes.ts`（`modeHandlers[mode].enter/exit`）、`ops/transform.ts`（用于自定义数据上 G/R/S 的 `transformProviders`）、`ops/view3d.ts`（`frameHooks`）。

### 文件
`io/files.ts`：`registerFormat({ id, label, extensions, import?(file), export?({selectedOnly}) })` 会向 文件 ▸ 导入/导出 添加条目。原生格式：`io/native.ts`。

### 工作区
`ui/screen.ts`：`defaultWorkspaces()` 与 `registerWorkspaceTemplate(category, () => Workspace)`（「+」标签菜单）；布局由 `A(type)`、`H(ratio, a, b)`、`V(ratio, a, b)`、`dock()` 构建。

### 其他扩展点
- `eval/modifiers.ts` 的 `registerModifier`、`editors/properties/stack.ts` 的 `modifierFields`（面板行）；较新的修改器家族位于 `eval/mods/`（纯函数、有单元测试；在修改器的 `_bind_*` 类型化数组上绑定数据），其面板/操作符位于 `editors/properties/modui/`（`kit.ts` 含有子面板、顶点组与反转行、曲线与纹理控件）
- `editors/properties/properties.ts` 的 `registerTab`、`tabs.ts` 的 `objectExtraPanels`、`dataTabDrawers`（按对象类型的对象数据选项卡）
- `editors/properties/uilist.ts` 的 `uiList(..., { specials, up, down })`，用于列表的特殊项菜单与重排序
- `object/instancing.ts` 的 `objectDuplis`（一个对象显示哪些实例；通过 `SyncedObject.duplis` 绘制）
- `editors/view3d/draw.ts` 的 `drawHooks`、`render/scene.ts` 的 `sceneSyncHooks`
- `render/final` 的 `renderPostHooks`（合成器），`job.ts` 中的序列器帧钩子
- `app/keymap.ts` 的 `keyInputHooks`（原始文本输入，例如文本编辑模式）
- 几何节点：`geonodes/nodes/gndef.ts` 的 `geoNode(spec, exec)` 内联定义一个节点；`geonodes/menuplace.ts` 按菜单条目顺序放置添加菜单项。区域（`geonodes/zones/`）把其条目以 JSON 形式保存在输出节点上（`repeat_items`、`state_items` 等；输入通过 `props.paired_output` 找到它们）；区域输出通过 `ZoneEval` 运行其主体（`ExecContext.evaluator` 是正在运行的求值器）。`NodeTypeDef.onAdd` 在交互式添加节点时追加配套节点。`geonodes/menu.ts` 保存完整的添加菜单布局（`GEOMETRY_MENU_LAYOUT`；注册的菜单保留那些加载时存在的类型条目）。矩阵是一种字段类型（16 个浮点数，列主序）；旋转字段保存 XYZ 欧拉三元组（`geonodes/rotmath.ts` 经四元数转换）。Format String / Index Switch / Menu Switch 的动态条目列表使用 `geonodes/nodes/items.ts`（节点上的 JSON、侧边栏编辑器、到 `__item__` 接口的链接）。基元给出 `MeshComponent.edgeOrder`（`geonodes/ops/edgeorder.ts`）；其他网格按在面中首次使用的顺序为边编号。节点消息带有严重级别（`ExecContext.warn(msg, kind)`）；提供方的 `nodeWarnings` 会在节点头部显示它们。`tests/unit/gnspec.ts` 从 JSON 规格构建树；`tests/fixtures/geonodes/*.json` 保存带有记录在案的预期属性值的规格。
- `nodes/editor/context.ts` 的 `registerNodeEditorProvider`（着色器、几何、合成编辑器；可选的 `linkViewer` 用于 Ctrl Shift 点击，`viewPanels` / `optionsPanels` 用于侧边栏的 视图/选项 选项卡）。节点编辑器菜单背后的树命令是 `nodes/treeops.ts` 与 `nodes/iface.ts` 中的纯函数。
- 屏幕：`ui/layout.ts`（布局树的纯拆分/合并/交换）、`ui/screenops.ts`（区域操作符）；类名为 `hdr-menu` 且在 pointerdown 时打开菜单的头部按钮会被 F3 菜单搜索与折叠菜单按钮捕获（`ui/menu.ts` 中的 `captureMenuItems`）
- 顶栏菜单位于 `ui/topbar.ts`（`fileNewTemplates`、`wm.call_menu` 名称）；最近文件、启动文件与自动保存快照在 `io/session.ts`；`itemContextHooks`（`ui/menu.ts`）向菜单项的右键菜单添加条目
- `ui/props.ts` 的 `propertyAnimMenuHook`（关键帧装饰器的右键菜单）、`anim/keyingsets.ts` 的 `propertyAnimExtraItems`；`editors/properties/tabs.ts` 的 `sceneKeyingPanel`、`armatureDataPanels`
- 资产（`assets/`）：资产表中的任何数据块都可以携带 `asset_data`；`doc.asset_catalogs` 保存该文件的目录。其他编辑器的菜单通过钩子扩展：`rowMenuHooks` / `rowBadgeHooks`（`editors/outliner/menus.ts`）、`idSelectorMenuHooks`（`ui/idmenu.ts`，数据块选择器）、`addMenuExtras`（`nodes/editor/context.ts`，节点添加菜单与搜索）、`shelfCategoryHooks`（`paint/assetshelf.ts`）、`idAssetHooks`（`scripting/api.ts`，`ID.asset_mark()`）
- 驱动器：`anim/drivers.ts` 对变量与驱动器求值（依赖图在某个对象的驱动器所读取的对象之后、该对象自身变换之前运行它）；表达式在 `anim/driverexpr.ts` 中编译（Python 子集，无全局变量）。驱动器的 `fcurve` 映射其数值；驱动器编辑器（`animation/driverseditor.ts`）通过替身动作（`animation/drivercurves.ts`）显示这些曲线，设置 UI 在 `driverpanel.ts`
- 表格：`spreadsheet/data.ts`（源、表格、列）、`filter.ts`（行筛选、排序、TSV；纯函数）
- 动画编辑器（`animation/animeditor.ts`）：`selectables()` 为框选/圆形/套索选择提供数据，`overlay` 绘制临时的圆形/套索/滑块读数，`snapTo()`/`snapHeader()` 提供捕捉选项；关键帧塑形逻辑位于 `animation/fcurvetools.ts`（纯函数），其操作符位于 `graphtools.ts`

### 链接数据（`library/`）
一个链接数据块位于其常规表中，`library` 被设为一个 Library id；其 id 为 `<id in the library file>~<library id>`（即"库文件中的 id~library id"），因此本地使用者在重新加载后仍可继续工作。链接记录由 `lockLinked`（`library/readonly.ts`）置为只读：写入会抛出异常（操作符会回滚并给出明确报告），但视图层状态（`select`、`hide`、集合 `exclude` 等）、`_` 缓存以及求值会写入的数值向量除外（依赖图运行在 `withLinkedWrites` 之内）。控件通过 `isReadOnly(owner)` 询问是否应绘制为禁用。覆盖（override）是带 `override_library.reference` 的本地副本；`reloadFromDoc` 保留覆盖所改动的键。定义在 `tree.ts` 之外的 Outliner 显示模式在 `modeBuilders` 中注册，数据块根节点在 `fileModeRoots` 中，按元素种类的行菜单在 `kindMenuHooks`（`editors/outliner/menus.ts`）中，同步选择在 `rowSync` 中。

### 脚本扩展点
- `scripting/api.ts` 的 `ID_MIXINS[table]`（数据块包装器的成员）、`NEW_DATA` / `addDataCollection`（新的 `bpy.data` 集合）、`rna.ts` 的 `mixin` 与 `arrayFactories`（通过通用包装器访问的列表上的 new()/add()/remove()）、`jsmodules.ts` 的 `registerScriptModule`（一个 JS 全局变量加上 Python 中的 `import name`）；特性文件通过 `scripting/api_ext.ts` 加载。`scripting/handlers.ts` 触发 `bpy.app.handlers`。
- 单元测试可以运行 Python：`tests/unit/support/python.ts` 加载 `pyodide` 开发依赖（无网络）。

### 注册
特性模块在 `src/modules.ts` 中被导入以产生副作用（`registerModules()`）。
它们在 `App` 实例存在之前运行：任何需要 `app` 的地方（例如 `app.subscribe`）请使用 `onAppReady(fn)`（`app/app.ts`）。

## 约定
- 绝不从任何其他应用复制代码、文字、图标或其他资产；一切都要独立实现。插槽/属性/操作符的**名称**遵循公开的 `bpy` 标识符以保持兼容。
- 优先使用位于各特性自身目录下的、职责集中的小文件。
- 每个可见控件都必须能用；不要为不存在的操作符添加菜单条目。
- 对可恢复的失败使用 `app.report('ERROR', …)`，而不是把异常抛给界面。

## 译者注

- 这是一份面向开发者的架构文档，术语大量沿用 Blender/bpy 生态既有命名，因此 `Depsgraph`、`Operator`、`RNA`、`Dope Sheet`、`F-curve`、`NLA`、`Grease Pencil` 等一律保留英文原名，仅在首次出现处辅以中文说明。
- 源文中的 `src/` 目录树是代码导航的关键，译文在目录树注释中补充了中文职责说明，但所有路径、文件名与符号名均未改动。
- 「Conventions」一节是强制性工程约定，译文用「绝不」「不要」「必须」等明确语气保留其规范性，未加入任何评论或建议。
- 本文件与 `src/3d/README.md` 配套：README 面向使用者介绍功能与限制，本文件解释模块划分、扩展点与注册机制；对应 Everything 项目中的 3D Studio 这一 monorepo app（单仓库应用）。
