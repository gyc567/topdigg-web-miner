<p align="center">
    <img src="./assets/LiveTalking-logo.png" align="middle" width="600"/>
</p>

中文版 | [English](./README-EN.md)

<p align="center">
    <a href="./LICENSE"><img src="https://img.shields.io/badge/license-Apache%202-dfd.svg"></a>
    <a href="https://github.com/lipku/LiveTalking/releases"><img src="https://img.shields.io/github/v/release/lipku/LiveTalking?color=ffa"></a>
    <a href=""><img src="https://img.shields.io/badge/python-3.10+-aff.svg"></a>
    <a href=""><img src="https://img.shields.io/badge/os-linux%2C%20win%2C%20mac-pink.svg"></a>
    <a href="https://github.com/lipku/LiveTalking/graphs/contributors"><img src="https://img.shields.io/github/contributors/lipku/LiveTalking?color=c4f042&style=flat-square"></a>
</p>
<p align="center">
<a href="https://trendshift.io/repositories/12565" target="_blank"><img src="https://trendshift.io/api/badge/repositories/12565" alt="lipku%2FLiveTalking | Trendshift" style="width: 250px; height: 55px;" width="250" height="55"/></a>
</p>

实时交互流式数字人引擎（real-time interactive streaming digital human engine），实现音视频同步对话，已在业内获得广泛商用。

**效果演示**: [wav2lip](https://youtu.be/-ss0H8qLr7E) | [ernerf](https://www.bilibili.com/video/BV1G1421z73r/) | [musetalk](https://youtu.be/vzUMruoZlxc/)

国内镜像: [Gitee](https://gitee.com/lipku/LiveTalking) | [GitCode](https://gitcode.com/lipku/LiveTalking)

## ❤️赞助商

> [想出现在这里？](mailto:lipku@foxmail.com)

<details open>
<summary>点击折叠</summary>
<table>
<tr>
<td width="180"><a href="https://www.packyapi.ai/register?aff=4gqz"><img src="assets/partner/packycode.png" alt="PackyCode" width="150"></a></td>
<td>通过 PackyCode 用一个 API 端点、一个 API 密钥即可接入主流 AI 模型。支持自动故障转移，并为 Codex 和 Claude Code 提供专属高速通道，访问快速稳定。
新用户可获得 $1 免费额度，首次充值享受折扣，符合条件的线路最高可省 80%。点击<a href="https://www.packyapi.ai/register?aff=4gqz">链接</a>注册</td>
</tr>
<tr>
<td width="180"><a href="https://go.apimart.ai/tw-livetalking"><img src="assets/partner/apimart.png" alt="APIMart" width="150"></a></td>
<td>APIMart 是专注于 AI 图片与视频生成的低价 API 平台，GPT-Image-2 低至 $0.006/张，1 美元可出图 160+ 张。图片、视频一套异步 API 通吃，提交任务拿 ID、轮询或回调取结果，跑批万张不超时、换模型不改代码。按量付费、无月费，点击<a href="https://go.apimart.ai/tw-livetalking">这里</a>注册开始使用。</td>
</tr>
</table>

</details>

---

## Features
1. 支持多种数字人模型（digital human model）: ernerf、musetalk、wav2lip、Ultralight-Digital-Human
2. 支持声音克隆（voice cloning）
3. 支持数字人说话被打断（interrupt）
4. 支持全身视频拼接（full-body video stitching）
5. 支持 WebRTC、RTMP、虚拟摄像头输出（virtual camera output）
6. 支持动作编排（action choreography）: 不说话时播放自定义视频
7. 支持多并发（multi-concurrency）
8. 支持自定义数字人形象（custom digital human avatar）
9. 提供前端 API 接口对接（frontend API integration）

---

## 使用场景

LiveTalking 基于实时流式数字人技术，通过文本或语音驱动虚拟形象说话，结合大语言模型（LLM）实现智能对话。适用于以下场景：

| 场景 | 说明 |
|----------|-------------|
| **虚拟主播/直播带货 [LiveStream](https://github.com/lipku/livestream)** | 24 小时无人直播，通过 LLM 自动生成带货话术，配合动作编排实现自然表现 |
| **AI 数字人客服** | 接入企业知识库，用户语音提问，数字人实时回答，支持打断重说 |
| **在线教育/培训** | 教师数字分身录制课程，或通过 API 驱动数字人讲师实时授课 |
| **智能语音助手** | 结合智能音箱或 APP，调用 `/human` 接口驱动数字人进行语音对话交互 |
| **大屏讲解** | 数字人讲解员在展厅大屏、活动现场等场景进行内容讲解和互动 |
| **短视频批量制作** | 通过 API 批量提交文案生成数字人出镜视频，无需真人拍摄，调用 `/human` + `/record` 接口 |

**核心流程**: 用户输入文字/音频 → LLM 生成回复（可选）→ TTS 语音合成（speech synthesis）→ 数字人实时口型同步（lip-sync）→ 音视频推流输出

---

## 1. 安装

在 Ubuntu 24.04、Python 3.12、PyTorch 2.9.1、CUDA 12.8 环境下测试通过。

### 1.1 安装依赖

```bash
git clone https://github.com/lipku/LiveTalking.git 
conda create -n livetalking python=3.12
conda activate livetalking
# If CUDA version is not 12.8 (check via nvidia-smi), install the corresponding PyTorch version(https://pytorch.org/get-started/previous-versions)
pip install torch==2.9.1 torchvision==0.24.1 torchaudio==2.9.1 --index-url https://download.pytorch.org/whl/cu128
cd LiveTalking
pip install -r requirements.txt
```

安装常见问题: <https://doc.livetalking.ai/en/docs/faq/>

Linux CUDA 环境配置: <https://zhuanlan.zhihu.com/p/674972886>

---

## 2. 快速开始

### 2.1 下载模型

| 来源 | 链接 |
|--------|------|
| 夸克网盘 | <https://pan.quark.cn/s/83a750323ef0> |
| Google Drive | <https://drive.google.com/drive/folders/1FOC_MD6wdogyyX_7V1d4NDIO7P9NlSAJ?usp=sharing> |

1. 把 `wav2lip256.pth` 复制到项目的 `models/` 目录，并重命名为 `wav2lip.pth`
2. 解压 `wav2lip256_avatar1.tar.gz`，把整个解压出来的文件夹复制到 `data/avatars/`

### 2.2 启动服务

```bash
python app.py --transport webrtc --model wav2lip --avatar_id wav2lip256_avatar1
```

> **注意**: 服务需要开放端口 TCP:8010、UDP:1-65536

### 2.3 客户端接入

| 方式 | 说明 |
|--------|-------------|
| 浏览器 | 打开 `http://serverip:8010/index.html`，点击 "Start Connection" 播放数字人视频，然后输入文本并提交 |
| API | 参见 [API 文档](docs/api.md)，通过 HTTP 方式集成 |
| 桌面客户端 | 下载: <https://pan.quark.cn/s/d7192d8ac19b> |

### 2.4 网页端

| 页面 | URL | 说明 |
|------|-----|-------------|
| 首页 | `/index.html` | WebRTC 连接 + 文本/音频驱动 + 录制控制 |
| 数字人形象制作 | `/avatar.html` | 上传视频自动生成数字人形象 |
| 管理后台 | `/admin.html` | 实时会话监控与全局配置 |

<img src="./assets/index.jpg" align="middle"/>

### 2.5 快速体验

1. 使用云镜像一键创建实例即刻运行: [UCloud 镜像](https://www.compshare.cn/images/4458094e-a43d-45fe-9b57-de79253befe4?referral_code=3XW3852OBmnD089hMMrtuU&ytag=GPU_GitHub_livetalking)  
2. Windows 一体化整合包 <https://pan.quark.cn/s/a040bf5cb065>
3. 商业版 Demo 地址 <https://www.livetalking.top>

### 2.6 文档
<https://doc.livetalking.ai/en>

---

## 3. 架构

### 数据流图

<img src="./assets/dataflow.png" align="middle" />

### 分层说明

**API 层**
- `/human`: 接收文本，支持 echo（直接复读）和 chat（LLM 对话）两种模式
- `/humanaudio`: 接收音频文件直接播放
- 每个连接会分配一个唯一的 `sessionid`，支持多用户并发

**逻辑层**
- **LLM 引擎**: 对接 Qwen 等模型生成对话回复
- **TTS 引擎**: 模块化设计，支持 EdgeTTS、GPT-SoVITS、CosyVoice、腾讯云等多种实现
- **特征提取**: 同步提取声学特征（如梅尔频谱图），用于口型同步推理

**渲染层**
- **模型推理**: 使用深度学习模型（Wav2Lip、MuseTalk 等）根据音频特征生成口型同步画面
- **后处理**: 将生成的口部区域平滑地叠加回原始高清视频

**推流层**
- **WebRTC**: 面向浏览器的低延迟推流
- **RTMP**: 标准直播协议，支持推送到哔哩哔哩/YouTube 等平台
- **虚拟摄像头**: 作为系统摄像头设备输出

**插件系统**
- 基于 [registry.py](registry.py) 的去中心化注册机制，开发者可扩展 TTS、Avatar、Output 等模块

---

## 4. API 文档

| 文档 | 说明 |
|----------|-------------|
| [docs/api.md](docs/api.md) | 通用接口，包含 WebRTC、文本/音频驱动、录制、动作编排 |
| [docs/avatar_api.md](docs/avatar_api.md) | 形象生成接口，包含创建任务、查询进度、删除任务 |
| [docs/admin_api.md](docs/admin_api.md) | 管理接口，包含全局配置、会话监控、强制停止 |

---

## 5. Docker

可用镜像:
- **AutoDL**: [镜像](https://www.codewithgpu.com/i/lipku/livetalking/base)  
- **UCloud**: [镜像](https://www.compshare.cn/images/4458094e-a43d-45fe-9b57-de79253befe4?referral_code=3XW3852OBmnD089hMMrtuU&ytag=GPU_GitHub_livetalking) ，支持开放任意端口  


---

## 6. 性能

- 每路视频流压缩都要消耗 CPU，分辨率越高 CPU 占用越大。每次口型同步推理都要消耗 GPU
- 不说话时的并发数取决于 CPU，同时说话的并发数取决于 GPU
- 后端日志中: `inferfps` = GPU 推理帧率，`finalfps` = 最终推流帧率。两者都需要 >= 25 才能达到实时效果

### 实时推理性能

| 模型 | GPU | FPS |
|:------|:----|:----|
| wav2lip256 | RTX 3060 | 60 |
| wav2lip256 | RTX 3080Ti | 120 |
| musetalk | RTX 3080Ti | 42 |
| musetalk | RTX 3090 | 45 |
| musetalk | RTX 4090 | 72 |

- wav2lip256: 推荐 RTX 3060 或更高
- musetalk: 推荐 RTX 3080Ti 或更高

---

## 7. 商业版
|维度|开源版|商业版|
|---|---|---|
|定位|开源社区版，Apache 2\.0|商业付费版，面向需要高性能与可交付落地的客户|
|核心目标|快速原型、二次开发与学术研究|开箱即用的商业交付：性能加速、自适应动作、实时交互|
|技术栈|三种模型：wav2lip、musetalk 和 ultralight|在开源版基础上新增 wav2lip 及一整套增强能力| 

更多细节 <https://doc.livetalking.ai/en/docs/service/>  

---
## 8. 声明

基于本项目开发并在哔哩哔哩、微信视频号、抖音等平台发布的视频，必须带上 LiveTalking 水印和 Logo。

---

## 引用

如果本仓库对你的研究或项目有所帮助，请引用我们的工作。

```
@software{livetalking,
  author = {Hengzhong Li},
  title = {LiveTalking: Real-Time Interactive Streaming Digital Human Framework},
  year = {2025},
  publisher = {GitHub},
  url = {https://github.com/lipku/livetalking}
}
```

---


| 社区 | 链接 |
|-----------|------|
| 知识星球 | <https://t.zsxq.com/7NMyO> |
| 微信 | wxwubug  |
| Telegram | <https://t.me/livetalking> |
| Discord | <https://discord.gg/n5jSPCT3Uf> |
| 邮箱 | lipku@foxmail.com |
| 微信公众号 | 数字人技术 |

<img src="./assets/qrcode-wechat.jpg" align="middle" />
