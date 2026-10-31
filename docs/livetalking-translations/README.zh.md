> 译文来源：LiveTalking 项目 GitHub 仓库 <https://github.com/lipku/LiveTalking>（Apache 2.0 许可，作者 Hengzhong Li / lipku）。
> 翻译基准 commit：`c726943`。
> 本目录下的三份文档均为中文翻译，链接与图片路径保持原样。

# LiveTalking 文档中文翻译包

本目录收录 LiveTalking 实时交互流式数字人引擎的官方文档中文译本，方便中文读者在不依赖浏览器翻译插件的情况下阅读与检索。

| 文件 | 对应上游文件 | 内容 |
|---|---|---|
| `README-EN.zh.md` | `README-EN.md` | 英文 README 的完整中文翻译（安装、快速开始、架构、API、Docker、性能、商用对比、引用） |
| `API-SUMMARY.zh.md` | `docs/api.md` + `docs/avatar_api.md` + `docs/admin_api.md` | 三份 API 文档整合成的中文速查总表，附「三种信令方式对比」 |
| `UI-STRINGS.zh.md` | `web/index-en.html` + `web/admin-en.html` + `web/avatar-en.html` | 前端三个页面的全部可见文案中英对照表，共 109 条 |

## 术语约定

| 英文 | 中文 |
|---|---|
| real-time interactive streaming digital human engine | 实时交互流式数字人引擎 |
| avatar | 数字人形象 / avatar |
| action choreography | 动作编排 |
| virtual camera output | 虚拟摄像头输出 |
| interrupt | 打断 |
| lip-sync inference | 口型推理 |
| plugin registry | 插件注册表 |
| backpressure | 背压 |

## 使用说明

上游仓库地址：<https://github.com/lipku/LiveTalking>
国内镜像：<https://gitee.com/lipku/LiveTalking> ｜ <https://gitcode.com/lipku/LiveTalking>
官方文档站：<https://doc.livetalking.ai>

**注意**：上游项目迭代频繁，本译文对应的源码快照为 commit `c726943`（2026-10-20）。项目 README 与实际代码存在若干不一致（详见 `API-SUMMARY.zh.md` 末尾说明），使用前请以实际部署版本的代码为准。
