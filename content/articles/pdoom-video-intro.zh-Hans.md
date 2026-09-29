---
title: "用代码"画"出来的MV：pdoom-video如何用生成式渲染颠覆音乐视频制作"
author: "瑞哥Eric"
date: "2026-09-30"
source: "https://github.com/mexicat/pdoom-video"
tags: ["AI", "开源", "音乐视频", "three.js", "生成式渲染", "Claude"]
---

## 项目概述

pdoom-video 是一个**生成式代码渲染音乐视频项目**——为歌曲《I'm Upping My P(doom)》制作了一部完整的 4K 音乐视频，每一帧都是歌曲时间的确定性函数。浏览器实时预览和离线导出的 4K60fps 视频完全一致。

**最令人震惊的是：整个视频的创意、脚本、技术实现，全部是与 Claude（Opus 5.5）在 Claude Code 中对话协作完成的。**

## 核心特点

- **完全确定性**：每一帧都是歌曲时间 `t` 的纯函数
- **歌词逐字同步卡拉OK**：词级时间轴精确对齐毫秒
- **17 个视觉场景**：每个场景有独特视觉风格（版画、示波器、官僚表格、纸币雕花、3D光线行进、织物等）
- **本地 4K60fps 导出**：headless Chrome + WebSocket + ffmpeg
- **AI 协作创作**：概念、分镜、渲染器、所有场景，全部与 Claude 对话完成

## 设计哲学

### 1. 确定性大于一切
"Every frame is a deterministic function of song time." 同一时间点在任何设备上渲染结果完全相同，浏览器预览和 4K 导出像素级一致。

### 2. 歌词即画面，不是叠加在画面上
歌词本身就是视觉元素：沿燃烧的引线排列成遮罩逐字解除、被压缩在回形针缝隙中、作为 token 显示概率分布——歌词从来不是字幕。

### 3. 约束催生创造力
七色配色、四种字体、信号色只用于高光。没有紫色霓虹赛博朋克、没有发光大脑、没有矩阵代码雨——恰恰是对"看起来像AI生成的"的主动拒绝，成就了独特的视觉语言。

### 4. 运动必须落在节拍上
剪辑落下拍（downbeat），重击落在 kick/snare，摄影机运动 ease 到下拍。没有漂浮的屏保式运动——只有强 ease、保持、然后猛然停止。

## 技术架构

**渲染核心（engine）：**
- timeline 播放驱动所有场景
- 后处理：Bloom（仅 signal/ember）、Halation、Grain、Vignette
- 2D 排版：四种字体逐字 kerning，单笔画字体光学调整
- GPU LineBatch：10k-200k 线段高速渲染

**运动模糊与自适应采样：**
每帧对 shutter 窗口（帧时间的 1/5）内多个子帧求均值。`--samples auto` 自适应选择：静止帧 12 子帧、普通运动 36 子帧、高速摇镜 108/324 子帧。

**场景模块：** 每个场景是扩展 `Scene` 基类的 TypeScript 类，输出必须是 `f.t` 的纯函数，禁止 `Math.random()`。

## 17 个场景一览

| 场景 | 视觉风格 | 歌词主题 |
|---|---|---|
| `open` | TikZ 图纸 + 绘图仪笔 | Sparks of AGI |
| `loss` | 对数坐标图纸 + 地形等高线 | 训练 loss 骤降 |
| `prompt` ×3 | token 概率分布 | ChatGPT / Sydney / Gato |
| `hook` ×4 | 全屏文字 slam | P(doom) 递进 0.02→0.15→0.42→0.81→0.99 |
| `room` | 指数分支爆炸 + 图书馆 | 中文房间 FOOM |
| `shoggoth` | X光扫描 + 版画光线行进 | 透过克苏鲁的谎言 |
| `paperclips` | 无限光线行进网格 | 回形针填满房间 |
| `outro` | P(DOOM)→∞→8→0/0→NaN | 结局循环回起点 |

## 安装使用

```bash
git clone https://github.com/mexicat/pdoom-video.git
cd pdoom-video/app && bun install && bunx vite
# 浏览器打开 http://localhost:5173

# 导出 1080p60
bun scripts/render.ts video --samples auto --shutter 0.2 --out ../out/pdoom.mp4

# 导出 4K60
bun scripts/render.ts video --scale 2 --samples auto --shutter 0.2 --out ../out/pdoom-4k.mp4
```

## 核心观点

1. **确定性渲染是 AI 视频的未来**：可验证、可精确复现任何一帧
2. **约束催生创造力**：七色/四字体限制下反而产生最独特的视觉语言
3. **歌词即界面**：文字和视觉应被同等设计，而非分先后叠加
4. **AI 协作需要工程化管理**：文档、规范、版本控制，而非灵光一现的对话
5. **自适应采样是工程与艺术的交汇**：内容感知的运动模糊，而非固定参数

## 项目地址

- GitHub：https://github.com/mexicat/pdoom-video
- 4K 视频：https://www.youtube.com/watch?v=5EoO5413dBY
