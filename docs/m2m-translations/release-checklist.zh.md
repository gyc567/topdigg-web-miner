> 本文是 [docs/release-checklist.md](https://github.com/MaxLiu22/Motion2MixamoRig/blob/main/docs/release-checklist.md) 的中文翻译版，英文原文为准。

# 发布清单

## 仓库

- [ ] 工作区是干净的
- [ ] 版本号一致：`pyproject.toml` 中的 `version` 与
      `blender_extension/motion2mixamorig_blender/blender_manifest.toml` 中
      的值都等于去掉 `v` 的标签名（标签 `v0.1.6` → `0.1.6`）。插件压缩包
      的名称和 Blender 中显示的版本都来自该 manifest。
- [ ] 没有把受门槛限制的模型、权重、Mixamo 资源或用户输入纳入版本管理
- [ ] README 中的说明与当前 CLI 一致
- [ ] CHANGELOG 已更新
- [ ] 发布说明已准备好（`.github/RELEASE_NOTES_v<version>.md`）

## 验证

- [ ] 包可以成功导入
- [ ] CLI 帮助可用
- [ ] `m2mr doctor` 能运行并报告环境状态
- [ ] 视频流程冒烟测试已完成
- [ ] 图片流程冒烟测试已完成
- [ ] 生成的 NPZ 文件可以成功加载
- [ ] 生成的 GLB 可以导入 Blender
- [ ] Blender 插件冒烟测试（[`blender-extension.md`](blender-extension.md)）

## 发布

- [ ] 发布准备提交已推送
- [ ] 已创建附注标签（annotated tag）
- [ ] 标签已推送
- [ ] 每个测试过的平台一个插件压缩包：
      `python scripts/package_blender_extension.py --platform macos-arm64`
      → `dist/motion2mixamorig-<version>-macos-arm64.zip`（其他平台重复
      `--platform`）。只发布通过冒烟测试的平台；绝不上传与平台无关的测试版本。
- [ ] GitHub Release 从该标签创建，附带发布说明和每个平台的压缩包；说明中列出包含哪些平台
- [ ] Release 链接可以正常打开，且
      `https://github.com/MaxLiu22/Motion2MixamoRig/releases/latest` 指向它
