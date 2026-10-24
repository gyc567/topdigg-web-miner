> 本文是 [AGENTS.md](https://github.com/MaxLiu22/Motion2MixamoRig/blob/main/AGENTS.md) 的中文翻译版，英文原文为准。

# AGENTS.md

Motion2MixamoRig 用从单目视频中提取的人体动作，或用静态照片恢复出的静态 3D
姿态，来驱动绑定了 Adobe Mixamo 骨骼的 3D 角色。
CLI：`m2mr`。

## 安装配置

```bash
# chumpy (legacy dep of gvhmr) breaks under PEP 517 build isolation
# ("No module named 'pip'"); install it without isolation first.
pip install --upgrade pip setuptools wheel \
  && pip install "numpy>=1.26" \
  && pip install --no-build-isolation "chumpy==0.70" \
  && pip install -e .
```

这些资源必须由用户提供（全部被 git 忽略，且有授权门槛）。
一次运行需要 SMPL-X、一个 Mixamo 角色，以及一个视频或一张静态图：

| 内容 | 放置位置 | 来源 |
| --- | --- | --- |
| SMPL-X 身体模型 | `assets/body_models/smplx/SMPLX_NEUTRAL.npz` | https://smpl-x.is.tue.mpg.de/ （需注册） |
| Mixamo 角色 | `assets/mixamo/<Name>.fbx` （FBX Binary，T-pose） | https://www.mixamo.com/ （需 Adobe 账号） |
| 输入视频 | `assets/video/<name>.mp4` | 一个清晰可见的人（多人镜头无法通过预检） |
| 输入静态图 | `assets/image/<name>.jpg` | 一个清晰可见的人，从头到脚（可选；`--image`） |

推理权重（约 5 GB）会在首次运行时自动下载到 `weights/`。

## 命令

```bash
m2mr doctor        # verify assets + dependencies; prints what is missing and where to get it
m2mr run           # latest video in assets/video/ + assets/mixamo/Y_Bot.fbx
m2mr run --video assets/video/dance.mp4 --rig assets/mixamo/Vampire.fbx
m2mr run --image assets/image/pose.jpg --rig assets/mixamo/Y_Bot.fbx
m2mr run --skeleton outputs/<run>/skeleton_motion.npz --rig ...   # reuse extraction, swap rig
m2mr run --output-dir DIR --progress-jsonl FILE --no-preview      # Blender Extension / automation
m2mr run --no-foot-lock ...                                        # keep the raw retarget (planted feet are pinned by default)
m2mr run --set-extractor gvhmr --detect-hands --hand-smooth 0.08  # HaMeR fingers; needs assets/body_models/mano/MANO_RIGHT.pkl
m2mr doctor --detect-hands                                         # also check the MANO file and HaMeR packages
m2mr diagnose outputs/<run> [--visualize] [--threshold-cm N]      # re-check self-intersection -> diagnostics.json (+ .html)
```

`--video` / `--image` 可以与 `--rig` 自由组合（`--video` 不能与 `--image` 同时使用）。
动作提取是耗时最长的步骤，只更换骨骼时用 `--skeleton` 复用提取结果。

## 一次生成之后

当代理为用户完成一个动作时（`m2mr run`，或一个 Blender 任务），那条说明已完成的消息里也会给出质量报告。那个文件就是运行目录下的 `diagnostics.json`：哪些身体部位相交、在哪些帧上、相交深度是多少。检查未通过并不代表运行失败。如果该文件不存在，就如实说明并提供 `m2mr diagnose <run>`。如果他们想看图，`m2mr diagnose <run> --visualize` 会生成 `diagnostics.html`；在 Blender 中，**Open HTML Report** 做的是同样的事。告诉他们如果需要可以打开它。在他们提出要求之前，不要开始修订。

同一条消息还可以主动提出标记那些看起来仍不对的片段。通过评审备注来和他们一起完成：在 `diagnostics.html` 里的琥珀色通道，或者根据他们指出的帧写出的 `<video stem>_review.json`。他们会把该 JSON 连同角色或骨骼一起交回（`mixamo_character.glb`、`mixamo_rotations.npz`、`skeleton_motion.npz`）。然后代理只为这些区间在新目录中构建一个新的 Mixamo 动画版本，并保持上一次的运行不变。旋转值保持四元数 wxyz 形式，也就是 `mixamo_rotations.npz` 内部的约定字符串。把新的 `mixamo_character.glb` 导入 Blender 供他们观看：隐藏 **Icosphere** 和骨架（armature），保留蒙皮网格。告诉他们新的 `diagnostics.json` 在哪里，和第一次报告一样。对于带有 `also_in_rest_pose` 的配对，它们在动作开始之前就已经相交，请直接说明这一点，而不是把那些帧摆开。

## Blender 扩展

该插件只是一个很薄的界面。它**不应该**在 Blender 的 Python 中导入 PyTorch /
GVHMR / OpenCV。它会启动一个外部 Python：

```text
<external-python> -m motion2mixamorig.cli run ...
```

这个 Python 要么是插件安装到 `~/Motion2MixamoRig` 的**一键运行时**（默认；
项目目录 `~/Motion2MixamoRig/app`），要么是用户在 **Advanced** 下设置的
自己的 venv。

- 非程序员：[`docs/user-guide.md`](docs/user-guide.md) （发布压缩包、
  一键运行时，无需终端）。
- 从源码构建 / 自建 venv：
  [`blender_extension/README.md`](blender_extension/README.md)。

在帮助用户时：

1. 一键路径：从最新的 GitHub release 下载压缩包，安装它，点击
   **Install Runtime (one click)**，然后 **Choose SMPL-X Model…**。
   自建 venv 路径：与 CLI 相同的 venv + SMPL-X + Mixamo FBX（见上面的
   安装配置）。
2. 用 `python scripts/package_blender_extension.py --platform macos-arm64`
   构建 `dist/motion2mixamorig-0.1.7-<platform>.zip`（每个平台一个压缩
   包；平台在压缩包的 manifest 中声明，版本是共用的；压缩包把
   `motion2mixamorig/` 放在 `backend/` 下用于一键运行时）。不带
   `--platform`：构建一个中立的测试版本。
3. 在 Blender 4.2+ 中：**Edit → Preferences → Get Extensions**，然后点击
   Repositories 旁边的 **∨** → **Install from Disk…**（没有大按钮），
   然后启用它。
4. 面板位于 **3D Viewport → N 侧边栏 → Motion2MixamoRig**，不在 Get
   Extensions 里。标题后面的 **⚙** 用于显示或隐藏 Setup。Setup：UI
   Language、Install / Update Runtime、Choose SMPL-X Model、Device、
   **Check Environment**；External Python 和 Project Directory 在
   **Advanced** 下。输入：**Body Model**，以及 **Detect Hands**（默认关闭，
   打开后显示手指平滑和 **Choose MANO Hand Model…**）。
5. 插件**代码**变更后必须重新构建压缩包并重新安装。已安装的副本不是从本
   仓库实时加载的。使用一键运行时时，`motion2mixamorig/` 的改动还需要
   **Update Runtime**（权重会保留）。如果出现
   `already registered` / `EnumProperty could not register`：先禁用插件，
   **完全退出 Blender**，重新打开，再次安装。
6. 任务输出写入 `<project>/outputs/blender_jobs/<job-id>/`。导入后，在
   Outliner 中隐藏 **Icosphere** 和 **armature**，保留 **skinned_mesh_…**
   对象（每个 FBX 几何体一个）可见。导入还会在 Blender 的地面上（z=0）
   添加一个 **Floor Markers** 网格：每 0.5 米一个十字标记，米级标记更大，
   原点为绿色。下一次导入到该集合会替换它。结果面板上的 **Floor Markers**
   复选框用于显示或隐藏该网格。FPS 必须与源片段时长一致（一个 60 fps 的
   视频被标记为 30 fps 会以一半速度播放）。时间轴从 0 到 n-1，也就是
   `diagnostics.json` 使用的帧；Progress 下的 **Diagnostics** 框会读取它
   （帧条、Previous / Next、**Open HTML Report** 首次点击时生成
   `diagnostics.html`）。

冒烟测试清单：[`docs/blender-extension.md`](docs/blender-extension.md)。

## 输出

每次运行会写入 `outputs/<YYYYMMDD_HHMMSS>_<source>/`：

- `run.json`：输入、耗时、输出清单
- `skeleton_motion.npz`：3D 人体骨架（24 个 SMPL 关节，Y 轴向上，单位米）+ `foot_contact`（F，4：左脚踝、左脚、右脚踝、右脚处于静止状态的概率，来自 GVHMR；较早的运行从 `cache/*/hmr4d_results.pt` 读取）
- `mixamo_rotations.npz`：各骨骼的动作旋转（四元数 wxyz；内部有约定字符串）
- `mixamo_character.glb`：蒙皮角色 + 动画片段（glTF 2.0；Blender：File → Import → glTF 2.0）
- `diagnostics.json`：针对该 GLB 的自相交报告（身体部位配对、帧区间、以厘米计的深度；帧从 0 开始计数）；摘要也写入 `run.json`。在关节处相连的部位不做比较。不检查地面。`m2mr diagnose <run> [--visualize] [--threshold-cm N]` 会重新检查一次运行；`--visualize` 会另外生成 `diagnostics.html`。报告的 3D 视图在 y=0 上保留固定的地面标记（0.5 米十字、更大的米级标记、绿色原点），便于对照地面判断移动。对该动作的眼睛观察记录是单独的文件，见评审备注。
- 视频输入：`videos/human_skeleton.mp4`、`videos/mixamo_skeleton.mp4`、`videos/mixamo_character.mp4`、`videos/compare.mp4`（2x2：原始 / mixamo 骨架 / 人体骨架 / 角色）
- 图片输入：`images/` 下同样四种视图的 PNG，外加 `images/before_after_360_compare.mp4`（左侧原始 / 右侧骨骼 10° 环绕旋转）

## 评审备注

只有肉眼才能发现的问题（打滑的脚、突然跳变的膝盖、没贴近身体的手）不在 `diagnostics.json` 里。它们写进一个评审文件，schema 为 `m2mr-review-v1`，这样后续的修订流程可以修改该次运行的 `mixamo_rotations.npz`、`skeleton_motion.npz`，或 `mixamo_character.glb` 中的动画。该文件不包含网格数据或 npz 字节。

在 `diagnostics.html` 中，相交轨道上方的琥珀色通道就是这一流程。拖拽一个区间，或设置 **In** 和 **Out**，然后写清楚哪里不对。右侧的 **Notes** 列表显示同样的备注，点击某一行可跳到它的第一帧。**Download notes** 会保存 `<video stem>_review.json`。浏览器把备注保存在 `localStorage` 中，键为 `m2mr-review-v1:<source glb>:<frame count>:<fps>`，所以重新生成 HTML 不会丢失它们。

自动执行这一步的代理不需要浏览器。直接写 `<run>/<video stem>_review.json`。从 `run.json` 读取片段和骨骼信息，从 `diagnostics.json` 读取相交情况。第 0 帧是第一帧，与 Blender 和 `diagnostics.json` 的索引一致。区间是闭区间。`start_s` 和 `end_s` 为 `frame / fps`，四舍五入到 3 位小数。

各键名和所有固定字符串都是英文。`manual_annotations[].note` 是评审者自己的原话，按输入原样存储，无论使用什么语言。静态图使用 `image` 和 `image_name`，`video` 留空为 null。

`self_intersections` 对应 `diagnostics.json` → `issues`。`self_intersection_summary` 对应 `diagnostics.json` → `summary.self_intersection`。直接照抄，不要改写部位名称。带有 `also_in_rest_pose` 的配对在动作开始之前就已经相交。

```json
{
  "schema": "m2mr-review-v1",
  "purpose": "Human notes on one Mixamo motion, plus the automatic self-intersection report. The clip is the file named in video, or in image for a still. Frame 0 is the first frame, matching Blender and diagnostics.json. Revise mixamo_rotations.npz, skeleton_motion.npz, or the animation in mixamo_character.glb so these ranges improve. Pairs with also_in_rest_pose already intersect before the motion starts. Each note is stored exactly as the reviewer typed it.",
  "run": "20261024_032240_beat_it_shotaro_test_input_compatible",
  "video": "/absolute/path/to/assets/video/beat_it_shotaro_test_input_compatible.mp4",
  "video_name": "beat_it_shotaro_test_input_compatible.mp4",
  "image": null,
  "image_name": null,
  "rig": "/absolute/path/to/assets/mixamo/Y_Bot.fbx",
  "rig_name": "Y_Bot.fbx",
  "source_glb": "mixamo_character.glb",
  "fps": 30,
  "frame_count": 554,
  "threshold_cm": 1.0,
  "generated": "2026-10-24T03:31:54",
  "files": ["mixamo_character.glb", "mixamo_rotations.npz", "skeleton_motion.npz", "diagnostics.json"],
  "manual_annotations": [
    {"id": "n1", "start_frame": 380, "end_frame": 410, "start_s": 12.667, "end_s": 13.667, "note": "left foot slides"}
  ],
  "self_intersection_summary": {"issue_count": 16, "frame_count": 56, "ranges": [[47, 48]], "max_depth_cm": 7.37},
  "self_intersections": [
    {"kind": "self_intersection", "parts": ["left_hand", "left_thigh"], "ranges": [[372, 373], [378, 381]], "frame_count": 6, "worst_frame": 380, "max_depth_cm": 7.37, "also_in_rest_pose": false}
  ]
}
```

`self_intersection_summary` 内部的 `ranges` 以及上面的 `self_intersections` 数组都是缩短过的。请从该次运行的 `diagnostics.json` 中完整复制这两个列表。

把这个文件连同 GLB 或骨骼交回，就是「一次生成之后」中的修订流程。代理会写入一个新版本并把该 GLB 导入 Blender，它不会覆盖此文件所描述的那次运行。

## 代码地图

- `motion2mixamorig/paths.py`：所有文件系统位置
- `motion2mixamorig/extract.py`：片段时序辅助函数，以及 `foot_contact_from_raw`
- `motion2mixamorig/extractors/`：身体提取器（`gvhmr`）与 HaMeR 手指流程（`hamer.py`、`--detect-hands`）
- `motion2mixamorig/mixamo/hand_retarget.py`：把 MANO 手指旋转重定向到 30 根 Mixamo 手指骨骼
- `motion2mixamorig/mixamo/`：FBX 解析、FK、重定向、蒙皮、渲染
- `motion2mixamorig/mixamo/foot_lock.py`：用两骨腿 IK 固定踩实的脚（先脚掌，否则脚跟），当直腿够不到时移动髋部；摘要见 `run.json` → `foot_lock`
- `motion2mixamorig/mixamo/ground.py`：移动髋部使踩实的脚底位于 y = 0；摘要见 `run.json` → `ground`
- `motion2mixamorig/diagnose.py`：对 GLB 做自相交检查 -> `diagnostics.json`
- `motion2mixamorig/diagnose_report.py`：`diagnostics.html`（`--visualize`）；评审通道与 `m2mr-review-v1`（见评审备注）
- `motion2mixamorig/pipeline.py`：一次运行的端到端流程
- `motion2mixamorig/cli.py`：`m2mr doctor` / `m2mr run`
- `blender_extension/motion2mixamorig_blender/`：Blender 4.2+ 扩展（界面 + 外部进程）
- `blender_extension/README.md`：构建插件、一键运行时内部机制、自建 venv 配置
- `docs/user-guide.md`：面向非程序员的插件指南
- `docs/blender-extension.md`：维护者冒烟测试清单
- `docs/c4d-fbx-support.md`：如何读取从 Cinema 4D 导出的 FBX 骨骼（绑定矩阵静止姿势，每个网格一个 GLB 蒙皮）
- `scripts/package_blender_extension.py`：构建 `dist/motion2mixamorig-0.1.7-<platform>.zip`
