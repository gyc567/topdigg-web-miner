> 本文是 [docs/c4d-fbx-support.md](https://github.com/MaxLiu22/Motion2MixamoRig/blob/main/docs/c4d-fbx-support.md) 的中文翻译版，英文原文为准。

# 支持从 Cinema 4D 导出的 Mixamo FBX

自 v0.1.7 起，FBX 加载器支持那些经由 Cinema 4D 打开并重新导出的
Mixamo 角色 FBX（以及类似的、会重写关节变换的导出器）。在需要 Mixamo
骨骼的任何位置传入该文件即可，例如 `--rig`，或 Blender 插件中的
**Mixamo Rig FBX**。不需要先在 Blender 中重新保存。

由 [@yng47](https://github.com/yng47) 在
[#8](https://github.com/MaxLiu22/Motion2MixamoRig/issues/8) 中贡献。

## 变更内容

### 从绑定矩阵得到静止姿势

原始 Mixamo FBX 把每个关节的绑定朝向编码在 `PreRotation` 中。
Cinema 4D 可以把该朝向烘焙进 `Lcl Rotation` 并丢弃 `PreRotation`。
此后若仅用局部欧拉属性重建静止姿势，得到的关节坐标系就会不同，在
层级越深的地方越糟：静止姿势出错，蒙皮也跟着损坏，即便根本没有应用
任何动画。

加载器现在按以下优先级重建静止姿势：

1. FBX 的 `Pose` / `PoseNode.Matrix`（如果存在）。
2. 蒙皮簇的 `TransformLink`，用于那些没有可用 Pose 记录的关节。当多个
   网格链接到同一关节时，会使用与其他所有网格最接近的那个矩阵（旋转
   矩阵不会被平均）。
3. 局部 FBX 变换属性，用于没有绑定矩阵的关节（通常是末端骨骼）。

对于带绑定世界矩阵的关节，其局部绑定变换是相对于父级推导出来的，并
从矩阵中提取出刚性旋转（去掉缩放和剪切）。动画旋转仍然是**相对于绑定
朝向的差值**。在 GLB 中，每个关节节点存储恢复出的绑定变换，动画通道
存储差值。

对于原始 Mixamo FBX，这会得到与之前相同的静止姿势（见[验证](#validation)）。

### 每个网格部件一个 glTF 蒙皮

FBX 蒙皮簇可以为每个几何对象保存不同的逆绑定矩阵，而一个 glTF 蒙皮
只有一个逆绑定矩阵访问器。早期版本对所有网格部件复用第一个几何体的
矩阵，因此关节在 Blender 中看起来正常，而网格却分离或塌陷。现在每个
几何体都会作为自己的 glTF 网格节点和蒙皮导出，关节层级和动画则保持
共享。这让 GLB 与预览渲染器保持一致，后者本来就在按几何体分别使用
矩阵。

在 Blender 中的可见效果：角色会按每个 FBX 几何体导入为一个网格对象
（Y Bot 为 `skinned_mesh_0_Alpha_Surface` 和
`skinned_mesh_1_Alpha_Joints`），而不是单个 `skinned_mesh`。骨架仍然
名为 `mixamo`。

## 用法

```bash
m2mr run --video assets/video/dance.mp4 --rig path/to/c4d-export.fbx
m2mr run --image assets/image/pose.jpg --rig path/to/c4d-export.fbx

# Reuse a previous extraction while changing the rig
m2mr run --skeleton outputs/<previous-run>/skeleton_motion.npz --rig path/to/c4d-export.fbx
```

## 验证

在一对测试文件上（原始 Mixamo FBX 及其 Cinema 4D 导出版本）：

| 检查项 | 原始 Mixamo FBX | Cinema 4D FBX |
|---|---:|---:|
| 核心骨骼 | 25 | 25 |
| 完整骨架骨骼 | 33 | 33 |
| 完整骨架静止 FK 矩阵的最大误差 | `1.7e-14` | `3.2e-14` |
| 静止蒙皮误差（厘米） | `6.5e-14` | `2.0e-13` |

一次 Cinema 4D GLB 冒烟测试确认，全部七个网格部件都获得了各自对应的
蒙皮矩阵。

原始 Mixamo 骨架没有回归：同一个 `skeleton_motion.npz`（787 帧）在变更
前后于 Y Bot 上运行，结果为

- 各骨骼旋转差异在 `4e-7` 以内（浮点舍入），
- `rest_skin_error_cm` 为 `1.4e-5`（此前为 `9.9e-5`），
- 在 Blender 中，第 1、100、300 和 600 帧的蒙皮顶点位置差异在
  `0.5 µm` 以内，
- 插件导入结果相同（集合、FPS、帧范围、隐藏的关节球体）。

`run.json` 会为每次运行报告 `rest_fk_error` 和 `rest_skin_error_cm`，
使用 Cinema 4D 骨骼时两者也应接近零。此外还应在 Blender 中目视检查
一次真实的动作运行。
