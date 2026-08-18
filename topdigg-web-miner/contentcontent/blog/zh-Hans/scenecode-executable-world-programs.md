# SceneCode：用代码构建可编辑的室内世界

## 从自然语言到可执行的世界程序——一场室内场景合成的范式革命

> **论文**：SceneCode: Executable World Programs for Editable Indoor Scenes with Articulated Objects  
> **作者**：Puyi Wang*、Yuhao Wang*、Linjie Li、Zhengyuan Yang、Kevin Qinghong Lin、Yangguang Li、Yu Cheng  
> **机构**：香港中文大学、上海交通大学、上海AI Lab、Microsoft、牛津大学  
> **arXiv**：https://arxiv.org/abs/2605.19587  
> **项目主页**：https://scene-code.github.io/  
> **代码仓库**：https://github.com/wangpuyi/SceneCode

---

## 一、项目概述：SceneCode是什么？

想象一下，你对AI说一句"我要一个温馨的北欧风客厅，有一张灰色布艺沙发，沙发旁放一盏落地灯，茶几上摆几本书"，几秒钟后，AI不仅渲染出了一张精美的3D图片，还生成了**可以运行、可以编辑、可以用于机器人仿真的完整室内世界**——包括每个物体的关节结构、物理参数、材质定义，全部是可读的Python代码。

这正是SceneCode在做的事情。

**SceneCode的核心使命**：将自然语言提示词编译为**可执行的代码驱动室内世界**，而非一堆不透明的静态网格（mesh）。

### 与传统方法的本质区别

| 维度 | 传统室内场景合成 | SceneCode |
|------|----------------|-----------|
| **输出形式** | 静态3D网格（Mesh） | 可执行的Python程序 |
| **物体关节** | 仅从预设资产库继承 | 按需合成，支持铰接关节 |
| **可控性** | 对象级控制受限 | 零件级（Part-level）精确控制 |
| **可编辑性** | 修改困难，需重新生成 | 直接编辑代码，局部修改 |
| **仿真就绪** | 需额外处理 | 原生导出SDF+URDF |
| **可追溯性** | 黑盒 | 持久场景状态注册表 |

---

## 二、核心问题：为什么现有方案不够用？

在具身AI、机器人操控和仿真策略评估场景中，室内场景合成是一个基础能力。但现有方案有三个根本性缺陷：

### 2.1 静态网格的困境

传统方法输出的本质是一堆顶点/面片数据——你无法知道一个"柜子"有几个门、门怎么开合、铰链在哪。生成出来的只是一个视觉上看起来对的三维模型，**完全丢失了物理结构和运动信息**。

### 2.2 关节资产库的依赖

大多数现有系统要生成可交互的物体（如抽屉、门、椅子），必须依赖人工制作的、带有关节元数据的资产库。这造成两个问题：
- **无法按需生成新资产**：如果提示词描述了一个资产库中没有的物体，系统就束手无策
- **控制粒度受限**：无法精确控制零件级别（哪个部分能动、怎么动）

### 2.3 黑盒合成的不可编辑性

传统生成的场景是"一次性"的。要改一个沙发的颜色？得重新生成整个场景。要把椅子腿改短？得重新生成整个场景。**无法实现局部编辑**，这对于真实世界的场景构建工作流是致命的。

---

## 三、技术架构：SceneCode的工作原理

SceneCode的完整流水线分为**房间级**和**对象级**两大阶段，通过多层Agent循环和代码生成策略实现自然语言到可执行世界的编译。

### 3.1 整体架构图

```
┌─────────────────────────────────────────────────────────────┐
│                  自然语言提示词输入                            │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│           房间级 Agentic 主干（Planner-Designer-Critic）       │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐              │
│  │ Planner  │───▶│ Designer │───▶│  Critic  │              │
│  └──────────┘    └──────────┘    └──────────┘              │
│       ◀───────────────────────────────────                  │
│         循环迭代优化，直到通过评审                             │
└─────────────────────────────────────────────────────────────┘
                            │
          ┌─────────────────┼─────────────────┐
          ▼                 ▼                 ▼
    ┌──────────┐     ┌──────────┐     ┌──────────┐
    │ 地板规划  │     │ 家具放置  │     │墙壁/天花板│
    │Floor Plan│     │ Furniture│     │ Wall/Ceiling│
    └──────────┘     └──────────┘     └──────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              对象级资产请求路由（5种代码生成策略）              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ 策略1: Part Reuse    │ 策略2: Parametric Gen         │  │
│  │ 策略3: Flux Image Gen│ 策略4: Hybrid Gen             │  │
│  │ 策略5: Primitive Compose                               │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│            执行引导的修复-精化循环（Execution-Guided）          │
│  Blender Python程序执行验证 → 失败则修复 → 循环直到通过          │
└─────────────────────────────────────────────────────────────┘
                            │
          ┌─────────────────┴─────────────────┐
          ▼                                   ▼
    ┌──────────────────┐             ┌──────────────────┐
    │ 仿真就绪资产       │             │ 持久场景状态注册表  │
    │ (URDF + SDF)     │             │ (Scene-State     │
    │                  │             │  Registry)       │
    └──────────────────┘             └──────────────────┘
```

### 3.2 房间级Agentic主干预览

这是SceneCode的第一层智能——将用户的模糊描述转化为结构化的房屋布局，并为每个物体生成精确的AssetRequest。

#### Planner（规划器）
接收自然语言提示词，生成整体房间布局规划，决定：
- 有哪些房间，每个房间的类型
- 房间之间如何连接
- 整体空间结构

#### Designer（设计师）
根据Planner的规划，为每个物体生成详细的AssetRequest，包括：
- 物体的类别（沙发、桌子、灯等）
- 空间位置和朝向
- 尺寸约束和比例要求
- 物理属性需求（是否需要铰接、可动部件）

#### Critic（评审）
对Planner和Designer的输出进行评审，检查：
- 布局是否符合物理合理性
- 物体摆放是否冲突
- 是否忠实于原始提示词
- 铰接关节配置是否正确

**循环迭代**：Planner→Designer→Critic形成闭环，直到Critic通过为止。这确保了高质量的场景规划。

### 3.3 五大代码生成策略

每个AssetRequest被路由到以下五种策略之一：

#### 策略一：Part Reuse（零件复用）
从已有的零件库中选择合适的组件进行组合。适合家具等标准物体，效率最高。

#### 策略二：Parametric Generation（参数化生成）
根据物体类别和参数规格，通过参数化建模生成代码。适合标准几何形状的物体。

#### 策略三：Flux Image Generation（Flux图像生成）
调用Flux图像生成模型，生成纹理和外观材质。适合外观复杂的装饰物。

#### 策略四：Hybrid Generation（混合生成）
结合以上多种策略，兼顾结构效率和视觉质量。

#### 策略五：Primitive Composition（图元组合）
使用基本几何图元（立方体、圆柱、球等）直接构建物体。适合简单物件或测试场景。

### 3.4 执行引导的修复-精化循环

这是SceneCode最关键的技术创新之一。

生成的Blender Python程序（BPY代码）会被实际执行，如果执行失败（比如参数越界、几何冲突），系统会自动分析错误原因并进行修复，然后重新执行——**循环直到程序成功运行**。

这确保了输出的每个程序都是**真正可执行的**，而非静态文本。

```
生成BLENDER PYTHON程序
        │
        ▼
    执行程序
        │
    ┌───┴───┐
    │ 成功？ │───否──▶ 分析错误原因
    └───┬───┘         │
        │是           ▼
        │         修复代码
        │             │
        └─────────────┘
        （循环直到成功）
```

### 3.5 持久场景状态注册表

SceneCode维护了一个持久化的场景状态注册表（Scene-State Registry），将以下所有信息关联在一起：

- **Object Requests**：原始的资产请求
- **Executable Programs**：生成的Blender Python程序
- **Rendered Geometry**：渲染出的几何体
- **Simulation Assets**：仿真资产（URDF/SDF）

这使得场景构建过程**完全可追溯、可局部编辑**。你可以直接修改某个物体的程序代码，而不影响场景其他部分。

---

## 四、输出成果：SceneCode能生成什么？

### 4.1 可渲染的房间（Blender文件）

生成的 `.blend` 文件可直接在Blender中打开，包含：
- 完整的室内几何体（墙、地板、天花板）
- 所有家具和物体
- 材质和纹理
- 光照设置

### 4.2 仿真就绪资产

每个物体都可以导出为：
- **URDF**：统一机器人描述格式，用于机器人仿真
- **SDF**：仿真描述格式，用于物理引擎
- 包含：视觉网格、碰撞几何、关节类型、关节轴、关节限位

### 4.3 可编辑的世界程序

每个物体都对应一段Blender Python程序代码，可以直接阅读、修改和重新执行。

---

## 五、安装与使用教程

### 5.1 环境要求

- Python 3.10+
- Blender 4.4（独立安装，在PATH中）
- uv（依赖管理工具）
- OpenAI API Key（或兼容的API端点）
- 可选：Flux图像生成环境

### 5.2 安装步骤

#### 第一步：安装uv
```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
```

#### 第二步：安装核心依赖
```bash
cd SceneCode
uv sync
source .venv/bin/activate
pre-commit install  # 可选，预提交钩子
```

#### 第三步：安装Blender
```bash
wget https://download.blender.org/release/Blender4.4/blender-4.4.3-linux-x64.tar.xz
tar -xf blender-4.4.3-linux-x64.tar.xz -C /path/to/install_dir
# 将Blender目录添加到PATH
export PATH="/path/to/blender-4.4.3-linux-x64:$PATH"
```

#### 第四步：配置环境变量
```bash
# API配置
export OPENAI_API_KEY="your-openai-key"
export OPENAI_API_BASE="https://your-openai-compatible-endpoint/v1"

# Blender配置
export PATH="/path/to/blender-4.4.3-linux-x64:$PATH"
export SCENECODE_BLENDER_GLOBAL_LOCK=$HOME/.cache/scenecode/blender_requests.lock

# 可选：Flux图像生成
export FLUX_PYTHON="/path/to/flux/venv/bin/python"
export FLUX_MODEL_PATH="/path/to/ckpt/FLUX.2-klein-9B"
```

### 5.3 快速开始

运行一个完整的单场景生成：
```bash
python main.py +name=my_experiment
```

### 5.4 分阶段控制

SceneCode的流水线分为5个阶段，可通过 `start_stage` 和 `stop_stage` 控制：

```bash
# 只运行到家具摆放阶段
python main.py +name=my_experiment experiment.pipeline.stop_stage=furniture

# 从家具阶段继续，恢复之前的运行
python main.py +name=resume_scene \
  experiment.pipeline.resume_from_path=outputs/2026-05-27/21-04-00 \
  experiment.pipeline.start_stage=furniture \
  experiment.pipeline.stop_stage=wall_mounted \
  experiment.num_workers=1
```

### 5.5 批量运行

准备一个CSV文件（包含表头和两列：prompt和其他信息），然后：
```bash
python main.py +name=batch_example \
  experiment.csv_path=examples/prompts.csv \
  experiment.num_workers=1
```

### 5.6 输出产物

运行完成后，`outputs/` 目录下会生成：

```
outputs/.../scene_{id}/
├── room_{name}/
│   └── generated_assets/{category}/   # 按类别分类的物体资产
├── code_object/                        # 代码生成的所有物体
├── sdf/                               # SDF仿真资产
├── materials/generated_materials/     # 生成的材质
├── combined_house/                    # 合并的房间
│   ├── house.blend                    # Blender可渲染文件
│   ├── house.dmd.yaml                 # Drake仿真就绪房间
│   ├── house_state.json               # 场景状态注册表
│   └── house_furniture_welded.dmd.yaml # 家具焊接到地板的版本
```

---

## 六、核心观点与设计哲学

### 6.1 程序化世界生成（Programmatic World Generation）

SceneCode最核心的思想：**把场景视为程序，而非静态数据**。

传统方法把场景当成"一幅画"——生成后就固定了。SceneCode把场景当成"一段代码"——生成后还可以运行、修改、调试。

这带来了几个根本性优势：
- **可编辑性**：改代码比改mesh容易一万倍
- **可组合性**：代码可以模块化复用
- **可解释性**：代码即文档，每个物体的构造逻辑清晰可见
- **可验证性**：代码可以执行，执行成功才说明正确

### 6.2 从"生成内容"到"生成能力"

传统场景合成关注的是"生成什么视觉内容"。SceneCode关注的是"生成什么物理能力"——一个抽屉能拉开、一扇门能开关、椅子腿能折叠。

这种能力导向的思维，使得SceneCode生成的场景天然适配机器人仿真和具身AI研究。

### 6.3 Agentic Loop（Agent化循环）的重要性

Planner-Designer-Critic的三方循环，确保了：
- **规划层面**：整体布局合理
- **细节层面**：每个物体符合设计意图
- **质量层面**：有独立的评审机制把关

这不是简单的单次生成，而是**迭代优化的过程**。生成质量随循环次数提升。

### 6.4 执行即验证

"执行引导的修复-精化"是整个系统最务实的工程决策。它承认了一个现实：**生成的代码可能出错，但只要能执行，就能验证；只要能验证，就能修复**。

与其在生成阶段追求完美（这在LLM时代几乎不可能），不如让生成+执行验证形成闭环，循环修复直到正确。

### 6.5 持久注册表实现可追溯性

把场景构建过程从"一次性生成"变成了"可记录、可回放、可编辑的历史"。这对于大型项目的协作和迭代至关重要。

---

## 七、实验结果与评估

SceneCode在四个维度进行了评估：

### 7.1 场景级合成质量
- 在提示词忠实度（prompt-faithful）上优于传统mesh生成方法
- 生成场景的布局合理性和物体摆放自然度通过人类评估验证

### 7.2 对象级资产质量
- 生成的网格结构更干净（cleaner mesh structure）
- 关节元数据可直接用于仿真器（simulator-loadable articulation metadata）

### 7.3 人类主观评估
- 在视觉质量、物体合理性、场景整体协调性等维度均获得高分

### 7.4 下游机器人交互
- 生成的仿真资产在真实机器人交互任务中验证有效
- URDF/SDF格式被主流仿真器（Drake等）原生支持

---

## 八、技术亮点总结

| 技术亮点 | 说明 |
|---------|------|
| **程序化场景表示** | 用Python代码而非mesh表示场景 |
| **Agentic主干预览** | Planner-Designer-Critic循环优化 |
| **五大生成策略** | 按需选择零件复用/参数化/图像生成/混合/图元组合 |
| **执行引导验证** | Blender程序执行+自动修复循环 |
| **持久场景注册表** | 链接请求、代码、几何体、仿真资产 |
| **原生仿真导出** | 直接生成URDF/SDF，无需额外转换 |

---

## 九、应用场景

SceneCode的能力使其适用于以下场景：

1. **具身AI研究**：生成可交互的室内场景用于训练和评估具身智能体
2. **机器人仿真**：生成带有关节物理信息的仿真资产，直接导入Mujoco/Drake等仿真器
3. **游戏开发**：快速生成可编辑的室内关卡
4. **室内设计**：用自然语言探索不同的室内布局方案
5. **电影特效**：生成可精确控制的室内3D场景

---

## 十、结论与展望

SceneCode提出了一种全新的室内场景合成范式——**程序化世界生成**。它将自然语言提示词编译为可执行的代码驱动世界，而非静态的视觉网格。

核心价值在于三点：
1. **生成的不只是画面，而是可运行的物理世界**
2. **每个物体的构造逻辑完全透明、可编辑**
3. **原生支持仿真，为具身AI和机器人研究而生**

随着具身AI和仿真技术的快速发展，对高质量、可交互、可编辑的3D场景需求会越来越大。SceneCode提供的程序化思路，可能代表了这个方向的重要趋势。

---

## 附录：关键资源

- **项目主页**：https://scene-code.github.io/
- **GitHub仓库**：https://github.com/wangpuyi/SceneCode
- **arXiv论文**：https://arxiv.org/abs/2605.19587
- **交互式Demo**：项目主页提供客厅、卧室、浴室、厨房、地下室、餐厅等场景的3D交互查看

---

*本文基于SceneCode官方论文、项目主页和GitHub仓库整理。论文发表于2026年5月，代码已开源（MIT License）。*
