# OmniJev：全模态 System One 决策模型，零生成 token 的智能决策新范式

**原创不易，转发请注明出处「比特财商」**

---

在人工智能领域，「生成」与「决策」是两条截然不同的路径。大多数视觉语言模型在回答问题时，会先理解问题，再逐字生成答案——这个过程我们称之为「System Two」式思维，它可靠但缓慢，且无法给出置信度。

而今天要介绍的这个开源项目，用一种截然不同的方式重新定义了视觉智能：**一次前向、零生成 token、直接输出校准概率**。

这就是 OmniJev。

---

## 一、项目概述：它是什么

OmniJev 是由**北京中关村学院**、**中国科学院自动化研究所**和**智进化**联合研发的全模态决策模型。它的核心理念是：

> **给模型一张图或一段视频，再问它一个有标准答案的问题，它不是生成文字，而是直接告诉你「选哪个」以及「有多确定」。**

简单来说，OmniJev 不写字，它**做判断**。

项目链接：
- GitHub：https://github.com/tinnel123666888/OmniJev
- 官网：https://omnijev.net/
- 在线试用：https://omnijev.net/try.html
- HuggingFace：https://huggingface.co/tinnel123/OmniJev

---

## 二、核心技术设计哲学

### 2.1 System One 决策范式

OmniJev 提出了一个非常有意思的概念——**System One 决策模型**。

这个命名借鉴了认知科学中的「双系统理论」：
- **System One**：快速、自动、无意识的决策（比如看到红绿灯立刻知道停还是行）
- **System Two**：缓慢、深思熟虑的推理（比如解一道数学题）

传统 VLM（视觉语言模型）本质上是 System Two：理解问题 → 推理 → 生成文字 → 给出答案。这个过程既慢，又无法给出可靠的概率。

OmniJev 的目标是成为 **System One**：看图 + 听问题 → 直接输出概率判断。

### 2.2 零生成 token 的决策架构

OmniJev 的核心技术突破在于：**它不生成任何文字 token**。

传统的做法是让模型生成「click」或「type text」这样的文字，然后用规则判断正误。但这种方法有两个致命问题：
1. **格式可能出错**：模型可能生成「tap」而不是「click」
2. **无法给出校准概率**：你不知道模型说「click」时，它到底有多确定

OmniJev 的做法是：在 Qwen3.5 视觉语言模型的基础上，新增一个**很小的决策层（decision head）**，直接读取模型的 token 概率分布，将其转化为结构化的概率输出。

这意味着：
- **永远不会答非所问**：输出一定是预定义的选项之一
- **输出自带置信度**：每个答案都带着一个校准过的概率
- **一次前向回答多个问题**：同一张图的 12 个问题，代价和 1 个问题几乎相同

### 2.3 三种决策类型

OmniJev 定义了三种「带类型的问题」：

| 类型 | 含义 | 返回值 |
|------|------|--------|
| `choice` | 在多个选项中选一个（或都不选） | 每个选项的概率 + abstain 概率 |
| `noul` | 判断一个陈述是否成立（是/否） | 校准过的概率（0~1） |
| `score` | 在有序量表上评级 | 各级别概率分布 |

这个设计非常优雅：**问题的类型决定了输出的结构**，而不是让模型自由生成文字。

### 2.4 校准误差（ECE）——概率可不可信

OmniJev 引入了一个关键指标：**ECE（Expected Calibration Error，期望校准误差）**。

这是什么意思？

假设模型说「我有 90% 的把握选 A」。如果它真的选对了 A，那我们希望它每次说 90% 的时候，实际对的几率也在 90% 左右。ECE 就是衡量这种「言行一致」程度的指标。

OmniJev-4B 在大多数任务上的 ECE 在 **0.009~0.079** 之间，意味着模型说「90%」时，实际正确率在 82%~98% 之间——概率是可信的。

这与传统生成式模型截然不同：生成模型只给你一个答案，你无法知道它到底有多确定。

---

## 三、技术架构详解

### 3.1 模型规模

OmniJev 发布了三个规模的模型，全部基于 **Qwen3.5** 底座：

| 模型 | 底座 | 参数量 |
|------|------|--------|
| OmniJev-4B | Qwen3.5-4B | ~4B |
| OmniJev-2B | Qwen3.5-2B | ~2B |
| OmniJev-0.8B | Qwen3.5-0.8B | ~0.8B |

所有模型均采用 **Apache-2.0** 许可，可商用。

### 3.2 训练数据

OmniJev 的训练数据规模：
- **约 27 万条决策记录**
- **约 130 万道带类型的问题**

覆盖场景：
- 网页与手机操作（Mind2Web、AndroidControl）
- 机器人任务仿真与真机（LIBERO-10、MUTEX、RoboArena）
- 视频事件理解（Charades-STA）
- 实时游戏（Atari、贪吃蛇、五子棋、超级马里奥）
- 手势识别（HaGRID）
- 危险监控（火/烟/武器检测）
- 声音频谱识别（ESC-50）

### 3.3 训练方法

OmniJev 采用**严格评分规则（Proper Scoring Rules）** 进行监督训练。这是一种特殊的损失函数，它不仅奖励正确答案，还奖励「对不确定性诚实」的预测。

举例来说：
- 如果模型有 60% 的把握说 A，而 A 确实是对的 → 获得高分
- 如果模型 100% 确定说 A，但 A 错了 → 受到严重惩罚
- 如果模型 60% 确定说 A，但 A 错了，且它说 B 有 30%、C 有 10% → 受到轻微惩罚

这种方式训练出来的模型，**不会盲目自信**，概率是可靠的。

### 3.4 延迟性能

在 NVIDIA A800-SXM4-40GB（单卡）上的测试结果：

| 模型 | 1题 | 3题 | 6题 | 12题 | 12题时每题 |
|------|-----|-----|-----|------|-----------|
| OmniJev-4B | 294ms | 292ms | 344ms | 436ms | **36.3ms** |
| OmniJev-2B | 217ms | 220ms | 243ms | 277ms | **23.1ms** |
| OmniJev-0.8B | 216ms | 216ms | 218ms | 236ms | **19.6ms** |

关键发现：**12 个问题打包一次请求，每题成本仅 36.3ms**（4B 模型），因为图片只编码一次。

---

## 四、应用场景示例

### 4.1 网页与手机自动化操作

OmniJev 可以理解 UI 界面，判断：
- 当前页面该点击哪个元素
- 下一步操作是什么（click / type / scroll）
- 操作是否不可逆
- 屏幕上是否有错误弹窗

在 Mind2Web 测试集上，OmniJev-4B 达到了 **73.3%** 的准确率，显著优于基线。

### 4.2 机器人控制

在 LIBERO-10 机器人决策任务上，OmniJev-4B 达到了 **80.7%** 的准确率。在真实机器人 MUTEX 任务上，达到了 **74.9%**。

它可以同时判断：
- 当前是哪个子任务
- 夹爪下一步往哪个方向
- 是否应该抓取
- 是否已经拿住物体

### 4.3 实时游戏决策

OmniJev 可以实时玩游戏：
- 挡板移动方向
- 球的落点预测
- 炸弹威胁判断
- 即时比分

在 Catch Game（接物游戏）上，OmniJev-4B 达到了 **87.0%** 的准确率。

### 4.4 危险监控与手势识别

OmniJev 可以监控摄像头画面，检测：
- 火、烟、武器等危险
- 危险类型和紧急程度
- 危险所在区域

在 HaGRID 手势 + 火/烟/武器检测任务上，OmniJev-4B 达到了 **98.7%** 的准确率，ECE 仅 0.009——概率几乎完美校准。

### 4.5 视频理解

OmniJev 将视频采样为 16 帧，然后整体判断：
- 事件是否发生
- 事件从哪帧开始
- 人物是否还在画面中
- 人物在做什么

---

## 五、快速上手教程

### 5.1 环境安装

```bash
# 克隆项目
git clone https://github.com/tinnel123666888/OmniJev && cd OmniJev

# 创建虚拟环境
python -m venv venv && ./venv/bin/pip install -r requirements.txt

# 安装可选的快速线性注意力内核
pip install fla-core

# 下载 OmniJev 权重
hf download tinnel123/OmniJev --local-dir ckpt

# 下载 Qwen3.5 底座
hf download Qwen/Qwen3.5-4B --local-dir base
```

### 5.2 图片问答

```python
from mso.infer import MSO1

# 初始化模型（自动选择 ckpt/base 路径）
m = MSO1("ckpt", "base")

# 图片问答
answers = m.system_one(
    {"images": ["screen.png"]},
    {
        "op": {
            "type": "choice",
            "instructions": "Which operation comes next?",
            "criteria": {
                "click": "tap an element",
                "type text": "",
                "scroll": ""
            }
        },
        "risk": {
            "type": "score",
            "instructions": "How irreversible is the next action?",
            "levels": ["harmless", "needs care", "irreversible"]
        },
        "err": {
            "type": "noul",
            "instructions": "This screen shows an error dialog."
        }
    }
)

# 查看结果
# answers["op"]   -> {"choice": "click", "probabilities": {"click": 0.81, ...}, "abstain": 0.02, "confidence": 0.81}
# answers["risk"] -> {"score": "needs care", "probabilities": {...}, "confidence": 0.7}
# answers["err"]  -> {"noul": 0.01}
```

### 5.3 视频问答

```python
from mso.video import video_state

# 将视频采样为16帧拼成一张图
answers = m.system_one(
    video_state("clip.mp4"),
    {
        "happened": {
            "type": "noul",
            "instructions": "The person opens the door."
        },
        "doing": {
            "type": "choice",
            "instructions": "What is the person doing?",
            "criteria": {
                "cooking": "",
                "cleaning": "",
                "reading": "",
                "eating": ""
            }
        },
        "progress": {
            "type": "score",
            "instructions": "How much of the action is shown?",
            "levels": ["none of it", "the beginning", "most of it", "all of it"]
        }
    }
)
```

### 5.4 带文本上下文的问答

```python
task = "Task: book a table for two at 7 pm on the restaurant's website."
answers = m.system_one(
    {"images": ["page.png"]},
    {
        "op": {
            "type": "choice",
            "instructions": task + "\nWhich operation comes next?",
            "criteria": {
                "click": "tap an element",
                "type text": "",
                "select": "",
                "scroll down": ""
            }
        },
        "done": {
            "type": "noul",
            "instructions": task + "\nThe task is finished."
        }
    }
)
```

### 5.5 区域选择（指点）

选项可以是图片中的区域（坐标 0~1000）：

```python
{
    "type": "choice",
    "instructions": "Which element should be clicked?",
    "criteria": {
        "search_box": {"region": {"box": [120, 40, 380, 90]}},
        "submit_btn": {"region": {"box": [400, 400, 550, 450]}},
        "menu_icon": {"region": {"box": [20, 20, 80, 80]}}
    }
}
```

### 5.6 命令行使用

```bash
python -m mso.infer --ckpt ckpt --model base --image screen.png --questions questions.json
```

---

## 六、性能总结

OmniJev-4B 在各任务上的表现（留出测试集）：

| 任务 | 准确率 |
|------|--------|
| HaGRID 手势+危险检测 | **98.7%** |
| Catch Game 接物游戏 | **87.0%** |
| 事件时序判断（视频） | **85.9%** |
| LIBERO-10 机器人决策 | **80.7%** |
| 网格指点（96格） | **73.7%** |
| Mind2Web 网页操作 | **73.3%** |
| AndroidControl 手机操作 | **73.4%** |
| 真实机器人 MUTEX | **74.9%** |

关键优势：
- 全面超越零训练基线（最高提升 3 倍以上）
- 大幅优于传统 SFT 微调方法
- 概率校准精准（ECE 低至 0.009）

---

## 七、核心观点与总结

### 7.1 决策比生成更适合视觉任务

传统的 VLM 将视觉任务转化为「生成文字」问题，但这个范式有几个根本性问题：
1. 生成内容可能格式错误
2. 无法给出可信的概率
3. 推理速度受限于 token 生成数量

OmniJev 证明了：**直接输出结构化决策**在视觉理解任务上更高效、更可靠。

### 7.2 概率校准是决策系统的生命线

一个只给答案不给置信度的决策系统是危险的。OmniJev 的 ECE 指标让用户可以设定阈值（如「只在置信度 > 0.8 时执行动作」），这对于自动驾驶、机器人控制等安全关键场景至关重要。

### 7.3 多问题并行是降低延迟的关键

OmniJev 允许在同一张图上同时问多个问题，且边际成本极低（12 题每题仅 36ms）。这意味着实时系统可以同时监控多个维度，而不需要多次调用模型。

### 7.4 System One 的实时性潜力

OmniJev 的设计目标是 **「快到可以用于实时控制」**。在游戏、机器人、摄像头监控等场景中，它已经展示了亚秒级的响应能力。随着模型小型化（0.8B 版本），边缘部署也成为可能。

### 7.5 开源与可复现性

OmniJev 采用了 Apache-2.0 许可证，代码、权重、训练细节全部公开。这在决策类模型中非常罕见，为学术研究和工业应用提供了宝贵的 baseline。

---

## 八、与传统方法的对比

| 维度 | 传统 VLM（生成式） | OmniJev（决策式） |
|------|------------------|-----------------|
| 输出形式 | 生成的文字 | 结构化概率 |
| 格式保证 | 无 | 100% |
| 置信度 | 无 | 有（校准过） |
| 推理速度 | 慢（需要生成 token） | 快（零生成） |
| 多问题效率 | 每个问题一次前向 | 一次前向多个问题 |
| 安全阈值 | 无法设置 | 可设置置信度阈值 |
| 适用场景 | 开放式问答 | 确定性决策任务 |

---

## 九、适用场景总结

OmniJev 特别适合以下场景：

1. **UI 自动化**：网页/手机操作自动化，判断点击位置和操作类型
2. **机器人控制**：实时决策夹爪方向、抓取时机、子任务状态
3. **游戏 AI**：实时游戏决策，无需搜索和规划
4. **视频监控**：危险检测、手势识别、事件判断
5. **自动驾驶**：实时路况决策、可信的概率输出
6. **边缘部署**：0.8B 版本适合资源受限环境

---

## 十、项目信息

**开发团队**：
- 北京中关村学院
- 中国科学院自动化研究所
- 智进化（Zevo）

**主要贡献者**：
- 徐添润（Tianrun Xu）· Core Developer
- 郭龙腾（Longteng Guo）· Project Lead
- 刘静（Jing Liu）· Corresponding Author

**联系邮箱**：s-xtr24@bza.edu.cn

**许可**：Apache-2.0（代码和权重均适用）

---

**总结**：OmniJev 提出了一个非常有前景的方向——用决策范式替代生成范式处理视觉任务。它的核心价值在于：**零生成 token、概率校准、多问题并行**。这让它在需要快速、可靠、可解释决策的场景中具有独特优势。如果你正在做 UI 自动化、机器人控制、游戏 AI 或视频理解相关的工作，OmniJev 绝对值得一试。
