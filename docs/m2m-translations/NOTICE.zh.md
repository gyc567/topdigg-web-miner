> 本文是 [NOTICE.md](https://github.com/MaxLiu22/Motion2MixamoRig/blob/main/NOTICE.md) 的中文翻译版，英文原文为准。

# NOTICE

本项目自身的代码按 `LICENSE` 中的许可证发布。它构建在以下上游组件
之上，每个组件都受其各自的条款约束。这些组件中受门槛限制的资源在此
均未再分发，用户需自行从下面的来源获取。

## GVHMR

World-Grounded Human Motion Recovery via Gravity-View Coordinates
（Shen 等，SIGGRAPH Asia 2024）。以 `gvhmr` Python 包的形式安装。
GVHMR 仅限**非商业研究用途**发布，在任何商业用途之前请先查看其
许可证。
https://github.com/zju3dv/GVHMR

## SMPL-X 身体模型

SMPL-X 身体模型需要注册才能获取，并由马克斯·普朗克智能系统研究所
授权用于非商业科学研究。
用户必须自行注册并下载 `SMPLX_NEUTRAL.npz`。
https://smpl-x.is.tue.mpg.de/

## Adobe Mixamo 角色

Mixamo 角色（Y Bot 及其他）由 Adobe 按 Mixamo 使用条款提供。
请使用你自己的 Adobe 账号下载，这些 FBX 文件绝不提交到本仓库。
https://www.mixamo.com/

## 推理权重

提取步骤会自动把模型检查点（GVHMR、HMR2、RTMPose /
ViTPose 2D 姿态、YOLOv8 人体检测器）下载到 `weights/`。请注意
YOLOv8（Ultralytics）采用 **AGPL-3.0** 许可证，而姿态 / HMR 检查点
各自带有其对应的研究许可证。

## 摘要

由于其上游组件的限制，端到端流程实际上限于非商业 /
研究用途，无论本仓库自身的代码许可证如何。
