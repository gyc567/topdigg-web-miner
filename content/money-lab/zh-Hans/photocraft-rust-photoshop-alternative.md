---
title: "PhotoCraft：纯Rust实现的Photoshop开源替代，架构设计与Agent化实践"
slug: photocraft-rust-photoshop-alternative
date: 2026-10-07
description: "深度解析PhotoCraft项目：纯Rust实现的开源Photoshop替代方案，包含架构设计哲学、命令系统、PSD兼容实现、Agent驱动能力，以及详细安装与使用教程。"
source: https://github.com/storytold/photocraft
author: 瑞哥观势
---

# PhotoCraft：纯Rust实现的Photoshop开源替代，架构设计与Agent化实践

## 一、项目概述

PhotoCraft 是 GitHub 上的一个开源项目，全称是一个用纯 Rust 从零实现的 Adobe Photoshop 替代品。项目采用"干净房间"（Clean-Room）方式开发，即不依赖任何 Adobe 私有代码，仅通过研究公开规范和观察行为来实现。

核心定位：
- **原生应用**：不依赖 Electron 或 WebView，Rust 代码直接编译为各平台原生二进制
- **完全可控**：代码开源，无网络依赖，离线可用
- **Agent 就绪**：所有功能通过统一命令系统暴露，AI Agent 可直接驱动

关键数据：
- 代码 100% Rust，共 24 个 crate
- 支持 macOS、Windows、Linux、FreeBSD、Web
- 1700+ 测试用例
- 500+ 命令，34 种工具

---

## 二、设计哲学

### 2.1 干净房间原则

项目明确禁止：
- 复制任何专有代码（Rust、WGSL、C++、JS）
- 使用专有着色器或资源文件
- 任何形式的学习模仿仅限于"行为和外观"

信息来源仅限于：
- Adobe 公开的 PSD 格式规范
- ICC、ISO 32000 等公开标准
- 学术论文（PatchMatch、泊松融合等）
- 纯观察行为

这一原则确保项目法律安全，同时催生了极其重视架构正确性的开发文化。

### 2.2 引擎优先，命令即一切

PhotoCraft 最核心的设计哲学：**Everything is a Command**。

每个用户可见的操作都有一个稳定的 `CommandId`（如 `filter.blur.gaussian`），包含类型化的、可序列化的参数。菜单、命令面板、快捷键、录制动作、CLI、MCP 和插件都通过同一个命令系统分发。

这意味着：
- 界面能做的事，脚本也能做
- 界面能做的事，AI Agent 也能做
- 所有操作天然可复现、可记录、可自动化

### 2.3 避免 GIMP 的历史陷阱

架构文档详细分析了 GIMP 的失败路径：

| 问题 | GIMP 后果 | PhotoCraft 规则 |
|------|----------|----------------|
| 位深度硬编码 | GEGL 重写耗时 18 年 | PixelFormat 作为运行时数据 |
| 非破坏编辑缺失 | 30年后才在 GIMP 3.0 实现 | 调整图层天生非破坏 |
| CMYK 假设RGB内 | 至今仍是纯 RGB 编辑器 | ColorMode 从第一天设计 |
| PSD 支持差 | 导入有损，文字常需重录 | 独立 psd crate，逐一对比 Oracle |

设计原则：**添加 64 位浮点、新色彩模型或新文件格式，应该只修改叶子 crate，不触及基础**。

---

## 三、架构设计

### 3.1 分层架构（24个crate）

```
L0  基础层（无上层依赖）
    geom     — 几何：点、矩形、仿射变换、贝塞尔曲线
    cms      — ICC 色彩管理：配置档、变换、渲染意图、黑点补偿
    color    — 像素格式、色彩空间、混合模式数学
    raster   — COW 瓦片表面、蒙版、MIP 金字塔、脏区域
    psd      — PSD/PSB 读写（独立crate，无工作区依赖）
    codecs   — PNG/JPEG/TIFF/WebP/GIF/AVIF 等格式编解码

L1  文档模型
    doc      — 纯数据：图层树、蒙版、效果、通道、路径

L2  算法层
    ops      — 可逆操作、历史、撤销
    algo     — 调整、滤镜、选择、修复、变换、重采样
    paint    — 画笔引擎：压感、动态、平滑
    text     — 字体数据库、字形整形、文本图层栅格化
    vector   — 形状、路径、笔画 → 覆盖率

L3  渲染层
    compose  — 图层树 → DrawOp 计划；CPU 合成器（Oracle）
    gpu      — wgpu 后端 + GPU 内核（WGSL）

L4  I/O与扩展
    io       — 导入/导出编排，doc ↔ PSD 映射
    plugins  — WebAssembly 沙箱滤镜插件

L5  引擎
    engine   — Session、命令注册表、任务调度、事件、视图模型

L6  前端
    ui-egui  — egui 壳（薄层）
    automation — MCP 服务器 + JSON-RPC 命令通道
```

**分层强制执行**：通过 `cargo xtask layers` 在 CI 中检查，禁止逆向依赖。

### 3.2 双合成器设计

PhotoCraft 同时维护两个独立的合成器：
- **CPU 合成器**：作为参考 Oracle，用于测试和验证
- **GPU 合成器**：基于 wgpu（Metal/Vulkan/DX12/WebGPU），负责实际渲染

两者相互测试，确保像素级一致。这解决了长期困扰开源图像编辑器的"预览与导出不一致"问题。

### 3.3 Copy-on-Write 瓦片机制

像素数据存储在 `Arc` 共享的 256×256 稀疏瓦片中：
- 撤销操作成本极低（O图层数）
- 超大画布内存轻盈
- 效果图按图层状态缓存

```
┌─────┬─────┬─────┬─────┐
│  0  │  0  │  1  │  0  │
├─────┼─────┼─────┼─────┤
│  0  │  1  │  1  │  1  │
├─────┼─────┼─────┼─────┤
│  0  │  1  │  0  │  0  │
├─────┼─────┼─────┼─────┤
│  0  │  0  │  0  │  0  │
└─────┴─────┴─────┴─────┘
        稀疏瓦片示意图（1=已分配）
```

### 3.4 UI-引擎边界

架构最关键的设计：**UI 层极薄，数据驱动**。

前端只需实现 5 个接口：

```rust
// 1. Session：命令进，事件出
pub fn dispatch(&self, doc: Option<DocId>, cmd: CommandInvocation) -> Result<JobHandle>

// 2. CommandRegistry：菜单、面板、快捷键的数据目录
// GUI 从中构建菜单栏和 ⌘K 命令面板

// 3. Tool：指针事件进，操作和覆盖层出
// 覆盖层是数据（贝塞尔路径、蚁行选区、手柄），UI 负责绘制

// 4. Viewport：文档坐标 → 屏幕像素
// 任何支持 wgpu TextureView 的 UI 框架都能嵌入画布

// 5. ViewModels：面板数据（纯结构体，UI 读取后渲染）
```

Litmus 测试：**CLI 和自动化服务器必须能完成 GUI 能做的一切**。

---

## 四、功能实现

### 4.1 工具集（34种）

移动 · 矩形/椭圆选框 · 套索 · 多边形套索 · 魔术棒 · 快速选择 · 对象选择 · 裁剪 · 取色器 · 画笔 · 铅笔 · 混合画笔 · 颜色替换 · 橡皮擦 · 克隆图章 · 修复画笔 · 污点修复 · 历史画笔 · 渐变 · 油漆桶 · 模糊 · 锐化 · 涂抹 · 加深 · 减淡 · 海绵 · 钢笔 · 路径选择 · 文字 · 五种形状工具 · 抓手 · 缩放

### 4.2 调整图层

16 种调整图层，实时预览，原片永不修改：
- 曲线（可按通道编辑）
- 色阶（带直方图）
- 黑白 · 通道混合器 · 渐变映射 · 照片滤镜 · 可选颜色 · 色彩查找（.cube/.3dl/.look）
- 阴影/高光 · 替换颜色 · 匹配颜色 · HDR 色调 · 去色 · 均匀化

### 4.3 图层样式

投影 · 内阴影 · 外/内发光 · 斜面和浮雕 · 光泽 · 描边 · 颜色/渐变/图案叠加

支持从 PSD 文件直接读取图层样式，像素级匹配 Photoshop。

### 4.4 选区与蒙版

选框、套索、魔术棒用于精确选择；快速选择、对象选择、选择主体由机器学习驱动（本地运行，无云）。

选区可转换为：图层蒙版、矢量路径、形状。

### 4.5 画笔引擎

完整实现 Photoshop 画笔参数：
- 形状动态 · 散射 · 纹理 · 双画笔 · 颜色动态 · 传递 · 画笔姿势 · 湿边 · 建立 · 平滑（含 Pulled String）
- 压感、倾斜、旋转、方向驱动
- 画笔预设 · 从选区定义画笔 · 确定性可重放笔触

### 4.6 色彩管理

纯 Rust ICC 色彩管理：
- 嵌入配置档
- 指定和转换配置档（4种渲染意图 + 黑点补偿）
- 软打样（⌘Y）
- 色域警告（⇧⌘Y）
- GPU 上运行

支持 RGB、灰度、CMYK、Lab，8/16/32 位每通道，位深和色彩模型均为运行时数据。

---

## 五、PSD 兼容性实现

### 5.1 独立 PSD Crate

`photocraft-psd` 是一个完全独立发布的 crate，从 Adobe 公开规范编写，不依赖工作区任何其他代码。

### 5.2 兼容性数据

| 测试集 | 通过率 |
|--------|--------|
| psd-tools 测试集（309个文件） | 307/309 |
| ag-psd + psd-tools 混合集（170个文件） | 169/170 |

### 5.3 Composite Oracle 验证

PhotoCraft 维护一套 Photoshop 原生输出的 Oracle PSD 文件，对比自研渲染结果与 Photoshop 的合并图像，覆盖：
- 渐变插值（Classic、Perceptual、Linear）
- 图层效果
- 形状描边
- 剪贴蒙版和填充不透明度

### 5.4 未来改进方向

当前差距（官方 Roadmap 诚实评估）：
- AI/生成功能
- 约 20 种缺失工具
- 排版和 Professional 工作流深度
- 插件兼容性

---

## 六、Agent 驱动能力

### 6.1 命令系统

PhotoCraft 的命令系统是 Agent 化的核心基础。

500+ 命令，每个命令：
- 有稳定的 `CommandId`
- 有类型化的参数结构
- 有菜单路径、快捷键、启用状态
- 有参数 JSON Schema（可生成 UI）

### 6.2 四种调用方式

同一命令可通过以下方式触发：
1. **GUI**：菜单、工具栏、快捷键
2. **CLI**：`photocraft-cli run image.psd --cmd filter.sharpen.smartSharpen --params '{"amount":80}'`
3. **JSON 控制通道**：`photocraft --control 7878`，通过 TCP JSON-RPC 调用
4. **MCP 服务器**：`photocraft-cli mcp`，AI Agent 通过 MCP 协议直接驱动

### 6.3 命令执行示例

```sh
# 头less模式：打开、编辑、保存
photocraft-cli run wave.psd \
  --cmd filter.sharpen.smartSharpen     --params '{"amount":80}' \
  --cmd layer.newAdjustmentLayer.curves  --params '{"points":[[0,0],[64,48],[192,212],[255,255]]}' \
  --out wave-final.png

# 批量处理：一组动作应用于文件夹
photocraft-cli batch --actions grade.json --in ./raw --out ./graded

# MCP 模式：Agent 驱动
photocraft-cli mcp
```

### 6.4 控制协议方法

```json
{"id": 1, "method": "ui.inspect", "params": {}}
{"id": 2, "method": "ui.pointer", "params": {"events": [{"kind": "down", "x": 100, "y": 200, "pressure": 0.8}]}}
{"id": 3, "method": "engine.execute", "params": {"command": "filter.blur.gaussian", "params": {"radius": 10}}}
{"id": 4, "method": "ui.screenshot", "params": {}}
```

### 6.5 偏好设置系统

所有偏好设置通过命令系统暴露：

```json
prefs.get  {"path": "performance.historyStates"}
prefs.set  {"path": "cursors.painting", "value": "precise"}
edit.colorSettings {"workingRgb": "display-p3", "intent": "perceptual", "bpc": true}
```

存储在平台配置目录（macOS ~/Library/Application Support/Photocraft，Linux ~/.config/photocraft）。

---

## 七、安装与使用教程

### 7.1 从源码构建

```sh
# 克隆代码
git clone https://github.com/storytold/photocraft
cd photocraft

# 构建桌面应用
cargo run --release -p photocraft -- image.psd

# 构建测试套件
cargo test --workspace
```

### 7.2 macOS / Windows / Linux 安装包

各平台安装包（DMG、exe、AppImage、Flatpak 等）在 GitHub Releases 页面：
https://github.com/storytold/photocraft/releases

### 7.3 Linux Flatpak 安装

```sh
flatpak install --user photocraft-<version>-linux-x86_64.flatpak
flatpak run ai.storyteller.photocraft
```

### 7.4 CLI 工具安装（macOS）

```sh
# 下载并解压
ditto -x -k photocraft-cli-<version>-macos-universal.zip .

# 验证签名
spctl --assess --type install -vv photocraft-cli-<version>-macos-universal/photocraft-cli
# 应输出: accepted, source=Notarized Developer ID
```

### 7.5 MCP Server 启动

```sh
# 直接启动（生成临时 token）
photocraft-cli mcp

# 连接已有桌面应用
photocraft-cli mcp --bridge 127.0.0.1:7878

# 带 Token 认证的桌面应用
photocraft --control 7878 --control-token-file /private/path/token \
  --automation-read-root /work/project \
  --automation-write-root /work/project
```

### 7.6 自动化脚本示例（Python）

```python
import subprocess
import json
import base64

# 启动 PhotoCraft 并发送命令
def run_photocraft_command(cmd_id, params=None):
    # 通过 CLI 执行命令
    result = subprocess.run([
        'photocraft-cli', 'run', 'input.psd',
        '--cmd', cmd_id,
        '--params', json.dumps(params or {}),
        '--out', 'output.png'
    ], capture_output=True)
    return result.returncode == 0

# 示例：添加曲线调整图层
run_photocraft_command(
    'layer.newAdjustmentLayer.curves',
    {'points': [[0,0], [64,48], [192,212], [255,255]]}
)

# 示例：应用智能锐化
run_photocraft_command(
    'filter.sharpen.smartSharpen',
    {'amount': 80, 'radius': 1.2, 'noise': 0.1}
)
```

### 7.7 批量处理工作流

创建 `grade.json` 动作文件：

```json
[
  {"command": "layer.newAdjustmentLayer.curves", "params": {"points": [[0,0],[48,48],[192,212],[255,255]]}},
  {"command": "layer.newAdjustmentLayer.vibrance", "params": {"vibrance": 15}},
  {"command": "filter.sharpen.smartSharpen", "params": {"amount": 50}}
]
```

执行：
```sh
photocraft-cli batch --actions grade.json --in ./raw --out ./graded
```

---

## 八、核心结论与观点

### 结论1：架构正确性是长期竞争力的来源

PhotoCraft 从第一天就将位深度、色彩模型、文件格式作为运行时数据而非硬编码假设。这意味着添加 CMYK 或 32 位浮点支持，不需要重写任何上层代码。GIMP 用 18 年才填平的坑，PhotoCraft 从一开始就是设计的一部分。

**启示**：技术债务的真正代价不是当下的开发速度，而是它对未来架构选择的限制。

### 结论2：命令系统是 Agent 化的最佳架构

PhotoCraft 的"一切皆命令"设计，使得 Photoshop 的全部能力天然对 Agent 开放。不需要额外包装，不需要 API 适配层——命令 ID 就是 Agent 的工具名称，参数 Schema 就是 Agent 的调用契约。

**启示**：AI Native 应用的设计，应该从"功能如何暴露给用户"转向"功能如何暴露给 AI"，命令化是其中最直接的路径。

### 结论3：双 Oracle 验证是质量保证的关键

CPU 合成器和 GPU 合成器相互测试，确保渲染结果像素级一致。这解决了开源项目中常见的"预览一个样，导出另一个样"问题，也使得大规模重构有信心进行。

**启示**：测试的投入产出比，在复杂渲染系统中极高。PhotoCraft 1700+ 测试，覆盖 PSD 往返、合成器 Oracle、多深度验证。

### 结论4：Clean-Room 是可扩展的开源策略

通过严格区分"观察行为"和"复制代码"，PhotoCraft 实现了法律上的完全安全，同时通过公开规范和学术论文构建了扎实的技术基础。

**启示**：开源不等于放弃质量。干净的实现方式，反而迫使团队更深入理解原理，而非简单复制。

### 结论5：Engine-First 确保了头的less能力

所有功能都可以在无 UI 的情况下运行：测试、CLI、MCP、自动化脚本。这是 PhotoCraft 与 Photoshop 本质不同的地方——它既是桌面应用，也是一个可嵌入的图像处理引擎。

**启示**：现代创意工具的价值，不只在 UI，而在于底层引擎的可编程性。

---

## 九、与 Photoshop 功能对比

| 类别 | PhotoCraft | Photoshop | 差距 |
|------|------------|-----------|------|
| PSD 读取 | 307/309 测试文件往返正确 | 基准 | 极小 |
| PSD 保存 | 像素级匹配 Oracle | 基准 | 极小 |
| 调整图层 | 16种，均实时预览 | 17+种 | 接近 |
| 图层样式 | 8种，含 PSD 往返 | 全部 | 接近 |
| 画笔引擎 | 完整动态参数 | 完整 | 接近 |
| AI 功能 | 无 | Neuron/Generative Fill | 显著 |
| 插件系统 | Wasm 沙箱（开发中） | 8BF/CC | 显著 |
| CMYK 编辑 | 存储/导入导出 | 完整 | 中等 |

**当前定位**：早期 Alpha，功能丰富度接近 Photoshop 70%，核心渲染引擎质量极高。

---

## 十、相关生态（Crafting Apps）

PhotoCraft 是 ArtCraft 团队"Crafting Apps"系列之一：

| 应用 | 用途 | 状态 |
|------|------|------|
| PhotoCraft | 图像编辑 | 早期 Alpha |
| VectorCraft | 矢量插画 | 开发中 |
| FilmCraft | 视频编辑、调色、声音 | 开发中 |
| LightCraft | 图片库和 RAW 显影 | 开发中 |
| PrintCraft | PDF 阅读整理 | 开发中 |
| EffectCraft | 动态图形和视觉特效 | 开发中 |
| DesignCraft | 页面布局和出版 | 开发中 |

共同特点：纯 Rust、Clean-Room、原生 + WebAssembly、Agent 可驱动。

---

## 十一、总结

PhotoCraft 代表了一种新型开源图像编辑器的设计思路：

- **架构层面**：通过严格的分层设计和数据驱动，确保长期可维护性和扩展性
- **工程层面**：双 Oracle 验证、命令化系统、1700+ 测试，构建了极高的质量基准
- **生态层面**：Clean-Room 实现确保法律安全，MCP 支持为 AI 时代做好准备
- **愿景层面**：不是做一个"像 Photoshop 的工具"，而是做一个"正确实现的图像编辑引擎"

当前仍是早期 Alpha，AI 功能和部分专业工具链存在差距，但核心渲染引擎、PSD 兼容性和 Agent 驱动能力已达到极高水准。对于需要可控图像处理引擎的开发者，或对 AI 驱动的图像编辑有需求的用户，PhotoCraft 是值得关注的项目。

---

**首发于微信公众号「瑞哥观势」**

既然看到这里了，如果觉得不错，随手点个赞、在看、转发三连吧，如果想第一时间收到推送，也可以给我个星标，谢谢你看我的文章，我们，下次再见。

**首发于微信公众号「瑞哥观势」**
