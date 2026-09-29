---
title: "Phone Harness：从零打造 AI 控制手机的开源利器"
author: "瑞哥Eric"
date: "2026-09-30"
source: "https://github.com/ShawnPana/phone-harness"
tags: ["AI", "开源", "手机自动化", "Agent", "Claude", "Codex"]
---

## 项目概述

Phone Harness 是由开发者 ShawnPana 创建的开源项目，核心理念：**让 AI 编程助手（Claude Code、Codex 等）直接控制你的真实手机，无需越狱、无需安装任何 App。**

支持三种手机类型：

| 手机类型 | 连接方式 | 视觉 | 操作 |
|---|---|---|---|
| **iPhone** | macOS iPhone Mirroring | Apple Vision OCR | HID CGEvents |
| **Android 真机** | adb（USB 或 Wi-Fi） | 无障碍树 + Vision OCR | adb input |
| **Cloud Android** | Phone Harness Cloud | 同 Android | 同 Android |

**核心特点：**
- 无需越狱 / Root，无需安装任何 App，无需 Xcode
- 完全使用真机（非模拟器），MIT 许可证

## 设计哲学

### 1. 零侵入设计
完全利用系统自带能力：iPhone 用 macOS 的 Mirroring + Vision + Quartz，Android 用 adb + 系统无障碍服务。不装任何东西，不改任何设置。

### 2. 统一抽象层
同一套 API 驱动所有手机类型，差异封装在底层：

```python
phone-harness <<'PY'
open_app("Notes")
tap_text("New Note")
type_text("hello from phone harness")
PY
```

### 3. AI Agent 协作优先
典型场景：用户说"帮我查北京天气"，AI 边操作边向用户播报进度。SKILL.md 明确规定每一步操作前告知用户要做什么。

### 4. 安全边界清晰
- 绝不输入 PIN、密码或 2FA 验证码
- 对外操作（发送、发布、购买）必须先征得用户同意
- 连接手机是用户责任，AI 只操作不配对

## 工作原理

**iPhone：** macOS 捕获 iPhone Mirroring 窗口截图 → Vision OCR 识别文字坐标 → Quartz 发送 HID 事件模拟触摸。

**Android：** 通过 adb 使用 screencap 截图、uiautomator 无障碍树获取界面结构、input 命令执行操作。

## 安装配置教程

### 安装 phone-harness

```bash
git clone https://github.com/ShawnPana/phone-harness ~/.phone-harness
cd ~/.phone-harness
pip install -e .
```

### 注册为 Agent Skill

```bash
# Claude Code
mkdir -p ~/.claude/skills/phone-harness
phone-harness skill > ~/.claude/skills/phone-harness/SKILL.md

# Codex
mkdir -p "${CODEX_HOME:-$HOME/.codex}/skills/phone-harness"
phone-harness skill > "${CODEX_HOME:-$HOME/.codex}/skills/phone-harness/SKILL.md"
```

### iPhone 配置
1. macOS Sequoia+，iPhone 配对 iPhone Mirroring
2. 终端授权 **Accessibility** 和 **Screen Recording**（后者需重启终端）
3. `phone-harness --doctor ios` 验证

### Android 配置
1. `brew install android-platform-tools` 安装 adb
2. 开启开发者选项：设置 → 关于手机 → 连续点击版本号 7 次
3. 开发者选项 → USB 调试 → 连接电脑并允许调试
4. `phone-harness config set platform android && phone-harness --doctor android`

### Cloud Android（无需实体手机）
```bash
phone-harness cloud login   # 浏览器授权一次
phone-harness cloud start   # 启动云手机（新账号$5额度≈100分钟）
phone-harness cloud stop    # 停止计费
```

## 核心 Helper 函数

**导航：** `home()` `back()` `open_app("应用名")`

**视觉：** `ocr()` 读取屏幕文字及坐标，`ui()` Android 无障碍树，`screenshot()` 截图

**操作：** `tap(x,y)` `tap_text("文字")` `type_text()` `swipe("up/down/left/right")` `scroll("up/down")`

**关键区别：** `scroll` 是内容滚动方向（想看到什么），`swipe` 是手指运动方向（刷视频/翻页用）。

## 核心观点与洞察

1. **AI + 手机自动化 = 新一代 RPA**：自然语言驱动手机操作，无需编程知识
2. **零侵入设计是最优解**：任何 App 都能操作，不需要开发者适配
3. **视觉驱动 > 结构驱动**：看屏幕 → 操作 → 验证，通用性强于依赖结构化数据
4. **云手机是杀手级功能**：iPhone 用户测试 Android 体验的零门槛方案
5. **安全设计体现工程成熟度**：安全边界写入工作流规范，而非后期补丁

## 已知限制

- iPhone 无法自动解锁（解锁会暂停 Mirroring）
- 无法操作 Face ID 和多指手势
- DRM 视频内容显示为黑屏
- OCR 无法识别纯图标（需截图 + 视觉模型）

## 项目地址

- GitHub：https://github.com/ShawnPana/phone-harness
- 官网：https://phone-harness.com
