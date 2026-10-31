# LiveTalking API 速查总表（中文）

本文档整合 `docs/api.md`、`docs/avatar_api.md`、`docs/admin_api.md` 三份文档，并补充「三种信令方式对比」章节。

基础路径：`http://<host>:<listenport>`（默认 `http://<host>:8010`）

所有 JSON 接口统一返回格式：

```json
{ "code": 0, "msg": "ok", "data": {} }
```

`code` 为 0 表示成功，非 0 表示错误。

---

## 一、接口总表

### 1.1 通用接口（`docs/api.md`）

| 接口路径 | 方法 | 作用 | 关键参数 | 返回结构 |
|---------|------|------|----------|----------|
| `/offer` | POST | WebRTC Offer 信令（JSON），交换 SDP 建立连接 | body(JSON): `sdp`(必), `type`(必, 须为 `offer`), `avatar`, `refaudio`, `reftext`, `custom_config` | `{"sdp": "...", "type": "answer", "sessionid": "uuid"}` |
| `/whep` | POST | WHEP 信令（裸 SDP），符合 WHEP 协议 | query: `avatar`, `refaudio`, `reftext`, `tts`, `tts_server`, `tts_speed`, `custom_config`, `sessionid`(可选自定义)；body: `application/sdp` 裸文本 offer | HTTP 201，`Content-Type: application/sdp`，头 `X-Session-ID` 返回会话 ID，body 为 SDP answer 裸文本 |
| `/human` | POST | 文本驱动数字人说话，支持复读或 LLM 对话 | body(JSON): `sessionid`(必), `text`(必), `type`(必, `echo`/`chat`), `interrupt`(bool, 默认 false), `tts`(object, 透传 `voice`/`emotion`) | `{"code": 0, "msg": "ok"}` |
| `/humanaudio` | POST | 上传音频文件驱动数字人 | body(multipart/form-data): `sessionid`(必), `file`(必, 音频文件) | `{"code": 0, "msg": "ok"}` |
| `/interrupt_talk` | POST | 打断播报，立即清空当前会话音频队列 | body(JSON): `sessionid`(必) | `{"code": 0, "msg": "ok"}` |
| `/is_speaking` | POST | 查询当前会话是否正在说话 | body(JSON): `sessionid`(必) | `{"code": 0, "msg": "ok", "data": true}` |
| `/record` | POST | 录制控制，控制服务器端渲染录制 | body(JSON): `sessionid`(必), `type`(必, `start_record`/`end_record`) | `{"code": 0, "msg": "ok"}` |
| `/record/{sessionid}` | GET | 下载录制完成的 MP4 文件 | 路径参数: `sessionid` | MP4 文件流；文件不存在返回 404 |
| `/set_audiotype` | POST | 设置自定义状态（动作编排） | body(JSON): `sessionid`(必), `audiotype`(必, int，预定义动作/状态索引) | `{"code": 0, "msg": "ok"}` |
| `/sse?sessionid=<sessionid>` | GET | SSE 事件流，服务器到客户端的异步状态推送（播报事件、状态变化） | query: `sessionid`(必) | `Content-Type: text/event-stream`，每条事件一行 JSON，形如 `data: {"status": "start"}` |

### 1.2 形象生成接口（`docs/avatar_api.md`）

| 接口路径 | 方法 | 作用 | 关键参数 | 返回结构 |
|---------|------|------|----------|----------|
| `/api/avatar/task` | POST | 创建 Avatar 生成任务 | `model`(必, `wav2lip`/`musetalk`), `avatar_id`(必), `video_file`(file), `video_path`(未上传文件时必填), `img_size`(默认 256), `nosmooth`(默认 false), `bbox_shift`(默认 0), `extra_margin`(默认 10), `pads`(默认 `"0 10 0 0"`), `parsing_mode`(默认 `"jaw"`), `version`(默认 `"v15"`), `face_det_batch_size`(默认 16), `task_id`(可选自定义), `notifyurl`(回调 URL) | `{"code": 0, "msg": "ok", "data": {"task_id": "uuid-string"}}` |
| `/api/avatar/task/{task_id}` | GET | 查询单个任务的生成状态与进度 | 路径参数: `task_id` | `data`: `task_id`, `model_type`, `avatar_id`, `status`, `progress`, `error_msg`, `notify_url`, `start_time`, `end_time`, `duration` |
| `/api/avatar/tasks` | GET | 列出所有生成任务，按 `start_time` 降序 | 无 | `{"code": 0, "msg": "ok", "data": {"tasks": [{"task_id": "...", "status": "completed", "progress": 100}, ...]}}` |
| `/api/avatar/task/{task_id}` | DELETE | 删除任务，仅 `pending` 状态可删除 | 路径参数: `task_id` | 成功 `{"code": 0, "msg": "ok", "data": {"msg": "Task deleted"}}`；不存在 `{"code": -1, "msg": "Task not found"}`；运行中 `{"code": -1, "msg": "Task is in running state, cannot delete"}` |

任务 `status` 取值流转：`pending` → `running` → `completed` / `failed`；`progress` 为 0-100 整数。

### 1.3 管理接口（`docs/admin_api.md`）

| 接口路径 | 方法 | 作用 | 关键参数 | 返回结构 |
|---------|------|------|----------|----------|
| `/api/admin/config` | GET | 获取服务启动时的全局配置参数（来自 CLI 参数） | 无 | `{"code": 0, "msg": "ok", "data": {"config": {...}}}` |
| `/api/admin/sessions` | GET | 获取当前所有活跃会话及其状态和配置 | 无 | `{"code": 0, "msg": "ok", "data": {"sessions": [{sessionid, speaking, recording, model, avatar_id, REF_FILE, transport, batch_size, customopt}]}}` |

**全局配置字段说明**（`data.config`）：

| 字段 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `fps` | int | 25 | 视频帧率 |
| `l` | int | 10 | 音频缓冲参数 |
| `m` | int | 8 | 音频缓冲参数 |
| `r` | int | 10 | 音频缓冲参数 |
| `model` | string | "wav2lip" | Avatar 模型：musetalk / wav2lip / ultralight |
| `avatar_id` | string | "wav2lip256_avatar1" | 默认 Avatar 标识 |
| `data_path` | string | "data/avatars" | Avatar 数据目录 |
| `batch_size` | int | 16 | 推理批大小 |
| `modelres` | int | 192 | 模型分辨率 |
| `modelfile` | string | "" | 自定义模型文件路径 |
| `customvideo_config` | string | "" | 自定义动作 JSON 文件路径 |
| `tts` | string | "edgetts" | TTS 插件 |
| `REF_FILE` | string | "zh-CN-YunxiaNeural" | TTS 参考文件或语音模型 ID |
| `REF_TEXT` | string | null | TTS 参考文本 |
| `TTS_SERVER` | string | "http://127.0.0.1:9880" | TTS 服务地址 |
| `transport` | string | "webrtc" | 输出传输方式：rtcpush / webrtc / rtmp / virtualcam |
| `push_url` | string | — | RTCPush 目标地址 |
| `max_session` | int | 1 | 最大会话数 |
| `listenport` | int | 8010 | HTTP 监听端口 |
| `customopt` | array | [] | 自定义动作配置（已解析） |

**会话字段说明**（`data.sessions[]`）：

| 字段 | 类型 | 说明 |
|------|------|------|
| `sessionid` | string | 会话唯一标识 |
| `speaking` | bool | 当前是否正在说话 |
| `recording` | bool | 当前是否正在录制 |
| `model` | string | 会话使用的 Avatar 模型 |
| `avatar_id` | string | 会话使用的 Avatar 标识 |
| `REF_FILE` | string | TTS 参考文件/模型 ID |
| `transport` | string | 传输方式 |
| `batch_size` | int | 推理批大小 |
| `customopt` | array | 自定义动作配置 |

---

## 二、三种信令方式对比：/offer JSON、/whep 裸 SDP、rtcpush 主动推流

LiveTalking 提供三条建立 WebRTC 连接的路径，分别对应「客户端拉取」「协议标准拉取」「服务端主动推送」三种不同的会话建立方向。

| 对比维度 | `/offer`（JSON 信令） | `/whep`（裸 SDP 信令） | `rtcpush`（主动推流） |
|---------|----------------------|----------------------|------------------------|
| 方向 | 客户端发起，浏览器作为 DTLS 客户端 | 客户端发起，浏览器作为 DTLS 客户端 | 服务端发起，LiveTalking 作为 DTLS 客户端 |
| HTTP 方法 | `POST /offer` | `POST /whep` | 无 HTTP 信令请求，由服务端主动 POST 到 `push_url` |
| 请求 Content-Type | `application/json` | `application/sdp`（裸文本 SDP） | 目标端按 WHIP 接收，通常为 `application/sdp` |
| 扩展参数传递位置 | JSON body：`avatar`、`refaudio`、`reftext`、`custom_config` | query string：`avatar`、`refaudio`、`reftext`、`tts`、`tts_server`、`tts_speed`、`custom_config`、`sessionid` | 启动参数：`--transport rtcpush`、`--push_url`、`--avatar_id`、`--tts` 等 CLI 配置 |
| 响应状态码 | 200 | 201 | 不适用（接收端返回 SDP answer） |
| 会话 ID 返回方式 | 响应 body 字段 `sessionid` | 响应头 `X-Session-ID` | 客户端可自行指定 `sessionid`，默认按 `max_session` 序号生成 `0`、`1`…… |
| 错误返回 | JSON `{"code": -1, "msg": "..."}` | HTTP 503，text/plain 错误说明 | 服务端日志记录异常 |
| 协议标准性 | 私有约定，非标准 | 遵循 [WHEP 协议](https://datatracker.ietf.org/doc/draft-ietf-wish-whep/) | 推流方向对应 WHIP 接收端 |
| 典型用途 | 自定义前端、测试脚本、需要精细控制 SDP 的场景 | 通用播放器、SRS 等标准媒体服务器对接 | 数字人作为推送方，将流推到外部平台（LiveStream、SRS 等） |
| 是否需要浏览器 | 否 | 否 | 否 |

### 2.1 `/offer` JSON 信令示例

```javascript
const res = await fetch('/offer', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    sdp: pc.localDescription.sdp,
    type: pc.localDescription.type,
    avatar: 'wav2lip256_avatar1',
    refaudio: 'zh-CN-YunxiaNeural',
  }),
});
const answer = await res.json();
// answer.sdp / answer.type / answer.sessionid
```

### 2.2 `/whep` 裸 SDP 信令示例

```javascript
const params = new URLSearchParams({
  avatar: 'wav2lip256_avatar1',
  refaudio: 'zh-CN-YunxiaNeural',
});

const res = await fetch('/whep?' + params.toString(), {
  method: 'POST',
  headers: { 'Content-Type': 'application/sdp' },
  body: pc.localDescription.sdp,
});

const answerSdp = await res.text();
const sessionid = res.headers.get('X-Session-ID');
await pc.setRemoteDescription({ type: 'answer', sdp: answerSdp });
```

### 2.3 `rtcpush` 主动推流说明

当启动参数为 `--transport rtcpush` 时，LiveTalking 不再等待客户端连接，而是在 HTTP 服务启动后由 `RTCManager.handle_rtcpush(push_url, sessionid)` 主动发起连接：

1. 为会话 `sessionid` 创建虚拟形象会话（默认从 `"0"` 开始，按 `--max_session` 递增，多个会话时 `push_url` 后依次拼接序号）。
2. 创建 `RTCPeerConnection`，加入音频轨与视频轨，生成本地 offer。
3. 以 HTTP POST 把本地 SDP offer 发送到 `--push_url` 指定的地址。
4. 读取返回的 SDP answer 并设置远端描述，推流建立完成。

推流地址示例：`http://localhost:1985/rtc/v1/whip/?app=live&stream=livestream`（即 WHIP 推入端点）。

---

## 三、补充说明

1. 本表仅收录仓库中实际存在的接口，路由注册位置为 `app.py` 与 `server/routes.py`、`server/avatar_routes.py`，未包含任何推测或臆造的接口。
2. `/whep` 的 `OPTIONS` 预检请求由服务自行处理并返回 200，用于避免与 `aiohttp_cors` 冲突。
3. `/offer` 与 `/whep` 在超过 `--max_session` 上限时会被拒绝，`/offer` 返回 `{"code": -1, "msg": "..."}`，`/whep` 返回 HTTP 503。
4. `docs/admin_api.md` 标题提及的「强制停止」能力在当前代码中尚未提供对应的 HTTP 接口，管理后台页面也未渲染该按钮；实际可用的管理接口只有 `/api/admin/config` 与 `/api/admin/sessions` 两个。
5. `/sse` 断开时调用 `es.close()` 即可，EventSource 侧连接出错或服务端主动断开时会自动重连。
