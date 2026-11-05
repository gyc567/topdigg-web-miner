# 拍片哥女装（nvzhuang）项目文档中文译本

> 原文仓库：[`paipiange/nvzhuang`](https://github.com/paipiange/nvzhuang) · commit `6aee46e`
> 许可证：MIT License（完全免费开源，允许商业使用）

本目录收录了 [`paipiange/nvzhuang`](https://github.com/paipiange/nvzhuang) 项目全部技术文档的中文译本。

原项目是一个纯静态前端 + GoFrame v2 后端的 AI 服装参考图集与虚拟试穿系统，2026 年 10 月底建仓，至 11 月初已积累 2193 Star / 555 Fork。

## 项目简介

- **在线体验**：https://paipiange.github.io/nvzhuang/
- **GitHub 源码**：https://github.com/paipiange/nvzhuang
- **兄弟项目**（AI 姿势参考与生图工坊）：https://github.com/paipiange/ai-pose-gallery-zh

三大图库合计收录超 4200 组参考素材：

| 图库 | 数量 | 说明 |
|---|---:|---|
| 写实服装 | 1407 套 | 真人风格纯服装展示图（2:3 比例，人物不入镜） |
| 二次元动漫服装 | 1320 套 | 动漫插画风格服饰 |
| AI 模特脸部/造型库 | 1499 位 | CC0 1.0 授权，支持 50 种具体发型筛选 |

AI 换装后端支持 5 种模型协议可插拔：OpenAI Images（GPT-Image 2）、Google generateContent（Nano Banana 2）、火山方舟（豆包 Seedream）、ComfyUI 本地离线（Qwen-Image-Edit-2511 / MiniMax H3），以及任意 OpenAI 兼容的国内模型（通义万相、智谱 CogView、硅基流动等）。

## 译本目录

| 文件 | 对应原文 | 内容 |
|---|---|---|
| [README.zh.md](./README.zh.md) | `README.md` | 项目总览、功能特性、模型配置、部署方式、URL 参数、目录结构 |
| [backend-README.zh.md](./backend-README.zh.md) | `backend/README.MD` | 后端功能、ComfyUI 模式、接口说明、目录结构 |
| [backend-DEPLOY.zh.md](./backend-DEPLOY.zh.md) | `backend/DEPLOY.md` | 部署指南、Nginx 反代、安全与成本控制防护、部署验证 |
| [AGENTS.zh.md](./AGENTS.zh.md) | `AGENTS.md` | 协作智能体开发与提交规范、安全红线、提交前自查清单 |
| [nvzhuang-task.zh.md](./nvzhuang-task.zh.md) | `nvzhuang.md` | Linux.do 推广准备任务书（代码增量优化项与验收标准） |
| [custom-garment-upload-technical.zh.md](./custom-garment-upload-technical.zh.md) | `docs/2026-10-30_custom-garment-upload-technical.md` | 自定义上传服装技术实施文档 |
| [security-image-validation.zh.md](./security-image-validation.zh.md) | `docs/2026-10-30_security-image-validation-requirements.md` | AI 换装接口保护与图片校验功能需求（FR-1 ~ FR-16） |
| [CONTENT_REVIEW.zh.md](./CONTENT_REVIEW.zh.md) | `docs/CONTENT_REVIEW.md` | 图库内容合规与社区发布审查报告 |
| [LICENSE-DECISION.zh.md](./LICENSE-DECISION.zh.md) | `docs/LICENSE-DECISION.md` | 开源许可证决策与授权执行书 |
| [LINUXDO_RELEASE_AUDIT.zh.md](./LINUXDO_RELEASE_AUDIT.zh.md) | `docs/LINUXDO_RELEASE_AUDIT.md` | 项目现状与开源合规审计报告 |
| [LINUXDO_PUBLISH_CHECKLIST.zh.md](./LINUXDO_PUBLISH_CHECKLIST.zh.md) | `docs/LINUXDO_PUBLISH_CHECKLIST.md` | Linux.do 推广发布前核验清单 |

## 翻译说明

- 代码块、命令行、YAML / JSON / Go / JavaScript 代码、文件路径、字段名、环境变量名、URL、HTML 属性一律保持原样。
- 表格结构保留，表头译为中文。
- 日文原始字段名（`カテゴリ`、`キーワード`、`サムネ`、`画像`、`原寸`）保持原样，因为这是数据源的真实 schema。
- 每份译文开头标注了原文路径与对应 commit。

## 延伸阅读

关于该项目的完整技术拆解文章（含六大设计哲学、完整部署教程与安全设计解析），见：

- 公众号「瑞哥观势」同名文章
- 博客：https://www.topdigg.com
- 代码仓库：https://github.com/gyc567
