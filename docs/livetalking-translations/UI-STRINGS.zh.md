# LiveTalking 前端英文文案中文对照表

本文档覆盖以下三个英文前端页面中所有面向用户的可见字符串：

- `web/index-en.html`（首页，实时交互页）
- `web/admin-en.html`（管理后台）
- `web/avatar-en.html`（数字人形象制作页）

翻译约定：简体中文，标点使用中文全角；代码标识符、接口路径、模型名、字段名保持原样。

---

## 一、index-en.html（首页）

### 1.1 页面标题与顶部导航栏

| 页面 | 英文原文 | 中文翻译 |
|------|----------|----------|
| index-en.html | `LiveTalking - Real-time Digital Human`（页面 title） | `LiveTalking - 实时数字人` |
| index-en.html | `LiveTalking`（导航栏品牌名） | `LiveTalking`（品牌名保留原样） |
| index-en.html | `Disconnected`（状态徽章，未连接） | `未连接` |
| index-en.html | `Connected`（状态徽章，已连接） | `已连接` |
| index-en.html | `SID: -`（会话 ID 占位显示） | `SID: -`（会话 ID 占位符保留） |

### 1.2 快捷入口卡片

| 页面 | 英文原文 | 中文翻译 |
|------|----------|----------|
| index-en.html | `Avatar Creator` | `形象制作` |
| index-en.html | `Generate digital human avatars` | `生成数字人形象` |
| index-en.html | `Admin Console` | `管理后台` |
| index-en.html | `Monitor sessions & config` | `监控会话与配置` |
| index-en.html | `TTS Voice Manager` | `TTS 语音管理` |
| index-en.html | `Voices · Clone · Synthesize` | `音色 · 克隆 · 合成` |

### 1.3 WebRTC 连接卡片

| 页面 | 英文原文 | 中文翻译 |
|------|----------|----------|
| index-en.html | `WebRTC Connection`（卡片标题） | `WebRTC 连接` |
| index-en.html | `Avatar ID`（标签） | `数字人 ID` |
| index-en.html | `wav2lip256_avatar1`（placeholder，示例值） | `wav2lip256_avatar1`（示例值保留原样） |
| index-en.html | `Ref Audio`（标签） | `参考音频` |
| index-en.html | `zh-CN-YunxiaNeural`（placeholder，示例音色） | `zh-CN-YunxiaNeural`（示例音色保留原样） |
| index-en.html | `Ref Text`（标签） | `参考文本` |
| index-en.html | `Reference text (optional)`（placeholder） | `参考文本（可选）` |
| index-en.html | `Connect`（按钮） | `连接` |
| index-en.html | `Disconnect`（按钮） | `断开连接` |

### 1.4 文本驱动卡片

| 页面 | 英文原文 | 中文翻译 |
|------|----------|----------|
| index-en.html | `Text Driver (POST /human)`（卡片标题） | `文本驱动（POST /human）` |
| index-en.html | `Text (type: echo/chat)`（标签） | `文本（类型：echo/chat）` |
| index-en.html | `Enter text to speak...`（placeholder） | `输入要朗读的文本...` |
| index-en.html | `Hello, welcome to LiveTalking`（输入框默认内容） | `Hello, welcome to LiveTalking`（示例语句，可译为「你好，欢迎使用 LiveTalking」） |
| index-en.html | `Echo`（下拉选项） | `复读` |
| index-en.html | `Chat LLM`（下拉选项） | `大模型对话` |
| index-en.html | `Interrupt`（开关标签） | `打断` |
| index-en.html | `Send`（按钮） | `发送` |
| index-en.html | `Interrupt`（按钮） | `打断` |

### 1.5 音频驱动卡片

| 页面 | 英文原文 | 中文翻译 |
|------|----------|----------|
| index-en.html | `Audio Driver (POST /humanaudio)`（卡片标题） | `音频驱动（POST /humanaudio）` |
| index-en.html | `Upload & Play`（按钮） | `上传并播放` |

### 1.6 录制卡片

| 页面 | 英文原文 | 中文翻译 |
|------|----------|----------|
| index-en.html | `Recording (POST /record)`（卡片标题） | `录制（POST /record）` |
| index-en.html | `Start Recording`（按钮） | `开始录制` |
| index-en.html | `Stop Recording`（按钮，录制中状态） | `停止录制` |
| index-en.html | `Download Video`（按钮） | `下载视频` |

### 1.7 自定义状态卡片

| 页面 | 英文原文 | 中文翻译 |
|------|----------|----------|
| index-en.html | `Custom State (POST /set_audiotype)`（卡片标题） | `自定义状态（POST /set_audiotype）` |
| index-en.html | `Audiotype Index`（标签） | `音频类型索引` |
| index-en.html | `Switch State`（按钮） | `切换状态` |

### 1.8 提示与错误信息（alert / 弹窗）

| 页面 | 英文原文 | 中文翻译 |
|------|----------|----------|
| index-en.html | `Please connect WebRTC first`（alert，未连接时发送文本） | `请先连接 WebRTC` |
| index-en.html | `Please connect WebRTC and select an audio file`（alert，未连接或未选文件时上传音频） | `请先连接 WebRTC 并选择音频文件` |
| index-en.html | `Speaking: ` + JSON（alert，查询说话状态） | `正在说话： ` + JSON |
| index-en.html | `Unknown server error`（服务端返回非 0 错误码时的异常信息） | `服务端未知错误` |
| index-en.html | `Server returned no SDP`（服务端未返回 SDP 时的异常信息） | `服务端未返回 SDP` |

---

## 二、admin-en.html（管理后台）

### 2.1 页面标题与顶部

| 页面 | 英文原文 | 中文翻译 |
|------|----------|----------|
| admin-en.html | `Admin Console - LiveTalking`（页面 title） | `管理后台 - LiveTalking` |
| admin-en.html | `LiveTalking Console`（页面主标题） | `LiveTalking 控制台` |
| admin-en.html | `Refresh`（按钮） | `刷新` |

### 2.2 全局配置卡片

| 页面 | 英文原文 | 中文翻译 |
|------|----------|----------|
| admin-en.html | `Global Config`（区块标题） | `全局配置` |
| admin-en.html | `Loading...`（配置表占位） | `加载中...` |
| admin-en.html | `Not set`（配置项为空时的显示） | `未设置` |

### 2.3 活跃会话区块

| 页面 | 英文原文 | 中文翻译 |
|------|----------|----------|
| admin-en.html | `Active Sessions`（区块标题） | `活跃会话` |
| admin-en.html | `No active sessions`（空状态标题） | `暂无活跃会话` |
| admin-en.html | `Sessions will appear here when users connect.`（空状态说明） | `用户连接后会话将显示在这里。` |

### 2.4 会话卡片内的字段标签

| 页面 | 英文原文 | 中文翻译 |
|------|----------|----------|
| admin-en.html | `SID: ` + sessionid | `SID: ` + sessionid |
| admin-en.html | `Transport: ` + 值 / `Default` | `传输方式： ` + 值 / `默认` |
| admin-en.html | `Speaking`（会话状态徽章） | `说话中` |
| admin-en.html | `Silent`（会话状态徽章） | `静默` |
| admin-en.html | `Recording`（录制状态徽章） | `录制中` |
| admin-en.html | `Avatar ID:` | `数字人 ID:` |
| admin-en.html | `Model:` | `模型:` |
| admin-en.html | `Voice Ref:` | `音色参考:` |
| admin-en.html | `Custom Actions:` | `自定义动作:` |
| admin-en.html | `None`（无自定义动作时的显示） | `无` |

### 2.5 配置项名称（configLabels 映射表）

| 页面 | 英文原文 | 中文翻译 |
|------|----------|----------|
| admin-en.html | `Avatar Model`（key: `model`） | `数字人模型` |
| admin-en.html | `Default Avatar ID`（key: `avatar_id`） | `默认数字人 ID` |
| admin-en.html | `TTS Engine`（key: `tts`） | `TTS 引擎` |
| admin-en.html | `Voice Reference`（key: `REF_FILE`） | `音色参考` |
| admin-en.html | `Stream Protocol`（key: `transport`） | `推流协议` |
| admin-en.html | `Listen Port`（key: `listenport`） | `监听端口` |
| admin-en.html | `Inference Batch`（key: `batch_size`） | `推理批大小` |
| admin-en.html | `Video FPS`（key: `fps`） | `视频帧率` |
| admin-en.html | `Push URL`（key: `push_url`） | `推流地址` |

### 2.6 控制台日志（开发者可见，非直接 UI 文案）

| 页面 | 英文原文 | 中文翻译 |
|------|----------|----------|
| admin-en.html | `Failed to fetch config:` | `获取配置失败：` |
| admin-en.html | `Network error fetching config` | `获取配置时网络错误` |
| admin-en.html | `Failed to fetch sessions:` | `获取会话列表失败:` |
| admin-en.html | `Network error fetching sessions` | `获取会话列表时网络错误` |

---

## 三、avatar-en.html（数字人形象制作页）

### 3.1 页面标题与导航栏

| 页面 | 英文原文 | 中文翻译 |
|------|----------|----------|
| avatar-en.html | `Avatar Creator - LiveTalking`（页面 title） | `形象制作 - LiveTalking` |
| avatar-en.html | `LiveTalking Avatar Creator`（导航栏品牌名） | `LiveTalking 数字人形象制作` |

### 3.2 创建任务表单

| 页面 | 英文原文 | 中文翻译 |
|------|----------|----------|
| avatar-en.html | `Create New Task`（卡片标题） | `创建新任务` |
| avatar-en.html | `Model`（标签） | `模型` |
| avatar-en.html | `Wav2Lip`（下拉选项） | `Wav2Lip`（模型名保留原样） |
| avatar-en.html | `MuseTalk`（下拉选项） | `MuseTalk`（模型名保留原样） |
| avatar-en.html | `Avatar ID`（标签） | `数字人 ID` |
| avatar-en.html | `e.g. my_avatar_001`（placeholder） | `例如 my_avatar_001` |
| avatar-en.html | `Video File`（标签） | `视频文件` |
| avatar-en.html | `Advanced (Optional)`（折叠面板链接） | `高级选项（可选）` |
| avatar-en.html | `Image Size`（标签） | `图像尺寸` |
| avatar-en.html | `BBox Shift (musetalk)`（标签） | `人脸框偏移（musetalk）` |
| avatar-en.html | `Pads (top bottom left right)`（标签） | `填充（上 下 左 右）` |
| avatar-en.html | `0 10 0 0`（placeholder 与默认值） | `0 10 0 0`（数值保留原样） |
| avatar-en.html | `Face Detect Batch Size`（标签） | `人脸检测批大小` |
| avatar-en.html | `Submit Task`（提交按钮） | `提交任务` |
| avatar-en.html | `Uploading & creating task...`（提交中按钮文案） | `正在上传并创建任务...` |

### 3.3 任务列表

| 页面 | 英文原文 | 中文翻译 |
|------|----------|----------|
| avatar-en.html | `Task List`（卡片标题） | `任务列表` |
| avatar-en.html | `Auto refreshing...`（自动刷新提示） | `自动刷新中...` |
| avatar-en.html | `Loading tasks...`（加载占位） | `正在加载任务...` |
| avatar-en.html | `No tasks yet`（空状态） | `暂无任务` |
| avatar-en.html | `Avatar: ` + 标识 | `数字人： ` + 标识 |
| avatar-en.html | `Cancel`（按钮，删除待处理任务） | `取消` |

### 3.4 任务状态枚举（task.status 大写显示）

| 页面 | 英文原文 | 中文翻译 |
|------|----------|----------|
| avatar-en.html | `PENDING` | `等待中` |
| avatar-en.html | `RUNNING` | `运行中` |
| avatar-en.html | `COMPLETED` | `已完成` |
| avatar-en.html | `FAILED` | `已失败` |

### 3.5 提示与错误信息（alert / confirm）

| 页面 | 英文原文 | 中文翻译 |
|------|----------|----------|
| avatar-en.html | `Task created! Task ID: ` + task_id | `任务创建成功！任务 ID： ` + task_id |
| avatar-en.html | `Failed: ` + msg | `失败： ` + msg |
| avatar-en.html | `Network error` | `网络错误` |
| avatar-en.html | `Cancel this pending task?`（confirm 确认框） | `确认取消这个待处理任务吗？` |
| avatar-en.html | `Delete request failed` | `删除请求失败` |
| avatar-en.html | `Error:`（控制台日志） | `错误：` |
| avatar-en.html | `Load tasks failed:`（控制台日志） | `加载任务失败：` |

---

## 四、补充说明

1. 本表仅翻译面向用户的可见文案，HTML 结构、元素 id、class、CSS 变量名、事件处理函数名均保持原样，不做改动。
2. `index-en.html` 顶部快捷入口中链接到 `/avatar-en.html`、`/admin-en.html`、`/tts/index-en.html`，其中 TTS 页面不在本次翻译范围内。
3. `admin-en.html` 中虽有 `btn-stop` 的 CSS 样式定义，但当前页面脚本并未渲染「强制停止」按钮，因此该按钮无对应可见英文文案；`docs/admin_api.md` 也仅记录了配置查询与会话列表两个接口。
4. 页面中的图标（bootstrap-icons）属于装饰性元素，不计入文案条目。
5. 错误码 `code` 非 0 时的 `msg` 字段由服务端返回，实际文案以服务端返回内容为准，前端默认文案仅为兜底。
