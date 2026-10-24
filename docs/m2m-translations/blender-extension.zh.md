> 本文是 [docs/blender-extension.md](https://github.com/MaxLiu22/Motion2MixamoRig/blob/main/docs/blender-extension.md) 的中文翻译版，英文原文为准。

# Blender 扩展（维护者笔记）

用户安装与使用：[`docs/user-guide.md`](user-guide.md)。
从源码构建以及 Advanced（自建 venv）配置：
[`blender_extension/README.md`](../blender_extension/README.md)。

本页是冒烟测试清单和范围之外事项的列表。

## 手工冒烟测试清单

### macOS（Apple Silicon）：一键运行时

在干净的用户状态下执行：先把 `~/Motion2MixamoRig` 移开
（`mv ~/Motion2MixamoRig ~/Motion2MixamoRig.bak`），之后再恢复。

1. `python scripts/package_blender_extension.py --platform macos-arm64`
2. 在 Blender 4.2+ 中安装该压缩包并启用插件，**Get Extensions** 中的
   版本与压缩包名称一致。
3. 确认 3D 视图 N 面板中的 **Motion2MixamoRig** 标签页存在。
4. 点击标题后的 **⚙**：Setup 可以隐藏并再次显示。
5. **Install Runtime (one click)**：进度条前进并最终显示
   "Runtime installed"；External Python 和 Project Directory（在
   **Advanced** 下）被填好。
6. **Choose SMPL-X Model…** → "SMPL-X model: found"。
7. **Check Environment** → Ready。
8. 首次运行提示显示在 **Generate Motion** 上方。
9. 在 CPU 上生成一个短的单人视频：下载框显示大小、速度和剩余时间，
   然后消失；任务完成，GLB 自动导入。
10. 再次生成：没有下载框，也没有首次运行提示。
11. 重新安装压缩包，点击 **Update Runtime**：完成且不会重新下载权重。
12. 把 **UI Language** 切换到几种语言，包括 ไทย、नेपाली 和
    العربية，并检查文字是否正常渲染。
13. **Detect Hands** 处于关闭状态。打开后会显示耗时约两倍的提示、手指
    平滑，以及 **Choose MANO Hand Model…**。
14. 导入后，地面上有一个 **Floor Markers** 网格。Progress / Result 下的
    复选框可以隐藏它并再次显示。

### macOS（Apple Silicon）：自建 venv

1. 创建 `.venv`，安装 Motion2MixamoRig，放置 SMPL-X。
2. 安装压缩包并启用插件。
3. 在 **Advanced** 下，把 External Python 设为 `.venv/bin/python`，Project
   Directory 设为仓库路径。
4. 退出 Blender，重新打开另一个 `.blend`，确认这两个路径仍然保留。
5. **Check Environment** → Ready（或明确的 Error）。
6. 选一张单人静态图、一个 Mixamo FBX，Device 选 **MPS**（或 CPU）。
7. 在关闭预览的情况下生成。界面必须保持可用（可以旋转视口）。
8. 确认阶段 / 进度 / 日志有更新，随后 GLB 自动导入。
9. 时间轴起点为 0，终点是 `run.json` 中的 `n_frames` − 1，FPS 一致。
10. **Open Output Folder** 和 **View Full Log** 均可用。
11. **Diagnostics** 框：红色格子与 `diagnostics.json` 对应，点击某格、
    **Previous** 和 **Next** 都会移动播放头，播放时三角形始终停在当前
    格下方。**Open HTML Report** 首次点击时生成报告（Blender 从 Dock
    启动，因此源视频通过 Homebrew 的 `ffmpeg` 嵌入），第二次点击则
    立即打开。报告的 3D 视图显示固定的 0.5 米地面十字标记。相交轨道
    上方的琥珀色通道接受拖拽出的区间或 In / Out。右侧的 Notes 列表
    显示这些备注，而 **Download notes** 会把它们连同相交列表一起保存。
12. 启动第二个任务并点击 **Cancel**，应当只有该任务停止。
13. 禁用再启用插件，不出现崩溃。

### Windows 10/11（尚未测试）

用 `--platform windows-x64` 构建。一键运行时已知的阻塞问题：
`cython-bbox`（由 `gvhmr[preproc]` 引入，运行时并未使用）没有
Windows 预编译包，需要 C 编译器。

1. 一键运行时：**Install Runtime** 可用，包括带空格的路径
   （`C:\Users\Jane Doe\...`）。
2. 自建 venv：External Python 为 `.venv\Scripts\python.exe`。
3. **Check Environment**。
4. 先在 **CPU** 上运行一个短的单人视频，一键运行时自带的 PyTorch 仅
   支持 CPU，因此只有在自建 venv 中才尝试 **CUDA**。
5. 生成过程中 Blender 不应卡死。
6. 确认自动导入、FPS 和帧范围。
7. **Open Output Folder** 会调用资源管理器，**View Full Log** 会打开
   日志。
8. 取消一个正在运行的任务，不应杀掉其他 `python.exe` 进程。
9. 卸载插件并确认 `~/Motion2MixamoRig`（或项目的 `weights/` 和
   `outputs/`）仍然存在。

## 未来工作

尚未完成：

- 自动下载 SMPL-X（其许可证要求每位用户自行注册）
- 在扩展中打包权重
- Windows 一键运行时中的 CUDA PyTorch
- 为下载缓慢提供镜像选项
- 云端推理
- 多人视频
- 把 `mixamo_rotations.npz` 写入当前 Armature
- 足部锁定、根运动编辑器、曲线清理、NLA 工具
- 发布到 Blender Extensions Platform
