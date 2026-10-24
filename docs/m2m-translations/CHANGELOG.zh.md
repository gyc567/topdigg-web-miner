> 本文是 [CHANGELOG.md](https://github.com/MaxLiu22/Motion2MixamoRig/blob/main/CHANGELOG.md) 的中文翻译版，英文原文为准。

# 更新日志

本项目所有值得注意的变更都记录在此文件中。

## [未发布]

### 新增

- 自相交诊断：每次 `m2mr run` 都会检查生成的 `mixamo_character.glb`，看是否有身体部位陷入另一个部位，并写入 `diagnostics.json`（身体部位配对、帧区间、最严重帧、以厘米计的深度）以及一行摘要；摘要也会写入 `run.json`。检查未通过并不代表运行失败。`m2mr diagnose <run>` 会重新检查一次运行；`--visualize` 还会生成 `diagnostics.html`，其中角色旁边有源视频、有一条时间线和一个可点击的问题列表；`--threshold-cm` 设置报告深度（默认 1 厘米）。在关节处相连的部位不做比较，同一对部位相距最多 3 帧的片段会报告为一个区间。不检查地面。
- Blender 插件：Progress 下的 **Diagnostics** 框把该任务的自相交显示为一个 48 格帧条（红色表示相交；点击某格即可跳转），显示当前帧上相交的部位及其深度，还有 Previous / Next 按钮可在问题区间之间跳转。**Open HTML Report** 会在浏览器中打开交互式报告；首次点击时会在后台生成（`m2mr diagnose --visualize`，约 15 秒）。在此版本之前生成的结果会提示更新运行时并重新生成。
- 意大利语：一份 README、一份用户指南，以及插件界面（**UI Language → Italiano**；当 Blender 或系统设置为意大利语时，Auto 会自动选择它）。README 和插件现在提供 19 种语言。
- `m2mr run --detect-hands` 会启用随身体提取器一起使用的手部模型。在默认提取器 GVHMR 下，该模型是 HaMeR：它从人物和 GVHMR 已经选中的帧中裁剪手腕区域，把手指旋转写入 `skeleton_motion.npz`，并驱动蒙皮角色上的 30 根 Mixamo 手指骨骼。默认关闭；普通的 `m2mr run` 会让这些骨骼保持静止。身体处理流程没有清楚看到的手腕，对应的那只手保持静止。
- 该 flag 需要 `assets/body_models/mano/MANO_RIGHT.pkl`（在 https://mano.is.tue.mpg.de/ 注册后下载 Models & Code）。第一次运行 `m2mr run --detect-hands` 会把 HaMeR 权重下载到 `weights/hamer/`（约 2.7 GB，只下一次）。`m2mr doctor --detect-hands` 会检查该文件和额外的 Python 包；不带该 flag 的 `m2mr doctor` 不会检查。
- 带 `--detect-hands` 的运行耗时约为同一片段不带该 flag 的两倍。多出的时间是在身体提取之上叠加的手部处理。
- `--hand-smooth SECONDS` 会对手指旋转做平滑（默认 `0.08`；`0` 表示保留原始估计值）。只要骨架文件中已含手部动作，它就会生效，包括后续用 `--skeleton` 复用的情形。已复用且带手部动作的骨架，无需 `--detect-hands` 也能驱动手指。如果没有，则只有在该次运行的身体缓存仍与文件放在一起时，`--detect-hands` 才能补上手部；否则请带该 flag 重新运行视频或静态图。
- README 快速开始中记录了 `--detect-hands`、MANO 文件、额外运行时，以及复用时的行为。
- Blender 插件：Input 部分有 **Body Model** 菜单（`--set-extractor`，目前是 GVHMR）和 **Detect Hands**（`--detect-hands`，默认关闭）。打开手部后会显示耗时约两倍的提示、手指平滑，以及 **Choose MANO Hand Model…**。**Check Environment** 会用同样的这两项设置运行 `m2mr doctor`。
- 踩实的脚默认会被固定。GVHMR 的脚部接触点会选择支撑部位：脚掌着地时用脚掌，只有脚尖抬起时才用脚跟。当直腿够不到时，髋部会移动。`--no-foot-lock` 保留原始的重定向结果，因此脚可能会滑动。摘要见 `run.json` 中的 `foot_lock`。
- 在固定之后，髋部会垂直移动，使每次踩实的最低帧位于 y = 0。摘要见 `run.json` 中的 `ground`。即使使用 `--no-foot-lock`，这一步仍会执行。
- `diagnostics.html` 在 y = 0 上绘制固定的地面标记（每 0.5 米一个十字，每米一个更大的标记，绿色原点），便于对照地面判断移动。由 [Eddie (@_____eddie_____)](https://x.com/_____eddie_____) 在 [这条回复](https://x.com/_____eddie_____/status/2113685850907123736) 中提出。
- `diagnostics.html` 在相交轨道上方有一个评审通道。拖拽一个区间，或设置 In 和 Out，并写下 Mixamo 动作中看起来不对的地方。备注会留在浏览器中该报告内，并显示在右侧的 Notes 列表里；点击某一行可跳到它的第一帧。**Download notes** 会把它们连同自相交列表一起保存（`m2mr-review-v1`，第 0 帧是第一帧）。该文件以源视频命名并记录该视频的路径，这样后续流程就能知道该修改 GLB 还是 npz 文件中的哪个片段。文件中的标签为英文；评审者输入的文字按原样保留。
- Blender 导入会在视口地面（z = 0）上添加一个 **Floor Markers** 网格，覆盖髋部的移动范围。Progress / Result 下的 **Floor Markers** 复选框用于显示或隐藏它。下一次导入到该集合会替换该网格。由 [Eddie (@_____eddie_____)](https://x.com/_____eddie_____) 在 [这条回复](https://x.com/_____eddie_____/status/2113685850907123736) 中提出。

### 修复

- Blender 插件：导入后时间轴此前覆盖片段的第 1 到 n 帧，现在为第 0 到 n-1 帧，与 glTF 导入器和 `diagnostics.json` 使用的帧号一致。
- Blender 插件：第一次点击 **Open HTML Report** 时角色正常但源视频缺失。报告通过外部 Python 调用 `ffmpeg` 程序来嵌入该视频。从 Dock 或 Finder 启动的 Blender 会把该进程的 PATH 设为 launchd 的 PATH（`/usr/bin:/bin:/usr/sbin:/sbin`），因此位于 `/opt/homebrew/bin` 或 `/usr/local/bin` 的 Homebrew `ffmpeg` 找不到，视频被略去。现在这些目录若存在就会被加入。这里的 `ffmpeg` 指系统程序（macOS 上用 `brew install ffmpeg`）；外部 Python 在生成报告时会从 PATH 中查找它。
- 一个转身后又转回来的主体，在恢复出的 3D 动作中可能整个片段都保持背对镜头。2D 左右稳定器只在单个过渡帧上判定是"真实转身还是标签翻转"（它要求第一次转身后连续出现四帧侧视图），此后从不重新评估，于是一帧误标或一次快速旋转就会锁死错误的朝向。`motion2mixamorig/stabilize_kp2d.py` 现在会在侧视图帧处把片段切分成若干段，并取每一段内 RTMPose 标签的多数值；只有持续时间短于约 0.33 秒的相反符号连续段才算翻转。不使用任何面部关键点（帽子和口罩不影响结果），并且每个人物轨迹单独处理。在一个包含快速半秒转身的舞蹈片段上，朝向错误的帧从 642 帧中的 320 帧降到 3 帧。在已有缓存上重新运行会从 `vitpose_raw.pt` 备份重新稳定，而不是从旧规则的输出。

## [0.1.7] - 2026-10-17

仅在 macOS（Apple Silicon）上测试过；Windows 和 Linux 尚未测试。

### 新增

- 支持从 Cinema 4D 重新导出的 Mixamo 角色 FBX：静止姿势来自 FBX 绑定矩阵（`Pose`，然后是蒙皮簇的 `TransformLink`，然后是局部变换），而不再只依赖 `PreRotation`。见 `docs/c4d-fbx-support.md`。由 [@yng47](https://github.com/yng47) 在 [#8](https://github.com/MaxLiu22/Motion2MixamoRig/issues/8) 中贡献。
- 用户指南和 README 快速开始现已提供全部 18 种 README 语言版本。

### 变更

- GLB 中每个 FBX 几何体有一个网格节点和一个蒙皮，因此 Blender 会为每个网格部件导入一个 `skinned_mesh_…` 对象（Y Bot 为两个），而不是单个 `skinned_mesh`。骨架仍然名为 `mixamo`。动画与形变保持不变。

### 修复

- GLB 导出此前对所有网格部件复用第一个网格的逆绑定矩阵，这可能导致绑定矩阵不同的部件分离或塌陷。由 [@yng47](https://github.com/yng47) 在 [#8](https://github.com/MaxLiu22/Motion2MixamoRig/issues/8) 中贡献。
- `rest_skin_error_cm` 现在在与蒙皮结果相同的坐标系中比较，因此不会再对带有自身绑定变换的网格报告虚假错误。

## [0.1.6] - 2026-10-17

### 新增

- Blender 插件：**Install Runtime (one click)** 会把 Python 和依赖下载安装到 `~/Motion2MixamoRig`，因此无需终端即可使用插件；**Update Runtime** 会刷新代码并保留权重。
- Blender 插件：**Choose SMPL-X Model…** 会把 SMPL-X 文件复制到正确位置。
- Blender 插件：首次运行提示，以及模型下载进度（带速度和剩余时间）。
- Blender 插件：18 种语言的界面，与 README 一致。
- Blender 插件：面板标题旁的 ⚙ 开关用于显示或隐藏 Setup。
- 插件压缩包中包含一键运行时所安装的 Motion2MixamoRig 代码。
- 按平台区分的插件压缩包：`scripts/package_blender_extension.py --platform <name>` 会写出 `motion2mixamorig-<version>-<platform>.zip` 并在其 manifest 中声明平台，这样 Blender 在其他操作系统上会拒绝安装。本次发布只提供 `macos-arm64`。
- 无需写代码即可使用插件的用户指南（`docs/user-guide.md`），在 README 顶部有链接。

### 修复

- 非 30 fps 片段的 `compare.mp4` 中，原视频面板此前以一半速度播放。
- 回退用的 YOLO 权重此前下载到工作目录，而不是 `weights/yolo/`。

## [0.1.5] - 2026-10-15

### 新增

- Blender 4.2+ 扩展，可在外部 Python 环境中启动 `m2mr`、流式传输进度并导入生成的 GLB。
- `m2mr run --output-dir`、`--progress-jsonl` 和 `--no-preview`，用于插件的任务控制（现有 CLI flag 不变）。
- 位于 `docs/i18n/` 的 17 种语言的 README 翻译。
- Python、Blender 和 GitHub stars 徽章，以及英文 README 中的 star 历史图表。

### 变更

- 现在要求 Python 3.11+，与 `gvhmr>=1.6` 一致。
- 翻译后的 README、海报和演示视频移入 `docs/`。

## [0.1.0] - 2026-09-04

### 新增

- 将单人动作视频重定向到绑定 Mixamo 骨骼的角色。
- 从单人图片中恢复并迁移静态 3D 姿态。
- 导出可复用的人体骨架动作为 `skeleton_motion.npz`。
- 导出各骨骼的 Mixamo 旋转为 `mixamo_rotations.npz`。
- 导出带动画的蒙皮 Mixamo 角色为 `.glb`。
- 生成人体骨架、Mixamo 骨架、角色和对比预览。
- 用 `--skeleton` 复用此前提取的骨架动作。
- 用 `m2mr doctor` 校验依赖和用户提供的资源。
- 为动作提取选择 CPU、CUDA 或 Apple Silicon MPS。

[未发布]: https://github.com/MaxLiu22/Motion2MixamoRig/compare/v0.1.5...HEAD
[0.1.5]: https://github.com/MaxLiu22/Motion2MixamoRig/compare/v0.1.0...v0.1.5
[0.1.0]: https://github.com/MaxLiu22/Motion2MixamoRig/releases/tag/v0.1.0
