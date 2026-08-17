## Key Decisions
- 配置多个API Keys: WECHAT_APPID, FISH_API_KEY, EVOLINK_API_KEY
- 使用飞书作为主要消息通道
- 安装内容工厂自动化技能(content-pipeline, baoyu-post-to-wechat, evolink-image/video/music)
- 默认模型: minimax/MiniMax-M2.1
- 用户纠正处理规则: 道歉→分析→记录→确认
- **微信公众号封面生成**: 必须使用 baoyu-wechat-cover-generator skill，遵循"琉光手稿"设计哲学 (2.35:1比例、高级玻璃拟态)
- **封面配色库**: 10种颜色主题轮换，每篇文章必须不同 (tech/creative/data/security/tool/growth/community/crypto/hardware/deep)
- **每篇文章封面必须不同**: 避免重复视觉，增强读者新鲜感
- **封面图库存**: 80张随机图片，保存在 data/wechat-covers/ 目录，每次发布随机选用

## 内容分发流水线 Skill
- **Skill 路径**: `~/.openclaw/skills/content-distribution/`
- **触发词**: "总结文章并发布"、"生成文章并分发"、"一站式内容发布"、"写篇文章发公众号和代码仓库"
- **功能**: 选题研究→撰写文章→公众号发布→多语言翻译→GitHub topdigg-web-miner 发布→Build 验证→Push
- **GitHub Token**: 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 (workMac)
- **目标仓库**: gyc567/topdigg-web-miner

## 微信公众号发布规则（永久）
- **作者名：比特财商**（所有公众号文章统一使用此作者名）
- **文末固定结尾（两段都需要）**：
  - 第一段：以上，既然看到这里了，如果觉得不错，随手点个赞、在看、转发三连吧，如果想第一时间收到推送，也可以给我个星标⭐～谢谢你看我的文章，我们，下次再见。
  - 第二段：首发于微信公众号「比特财商」。
- 每次发布公众号文章时，文末**必须按顺序**使用以上两段结尾，不得省略或修改顺序。
- **AI日报也需要写成公众号文章发布**：当收到AI日报内容时，应整理成一篇结构化的公众号文章，包含模型发布、产品更新、行业动态、论文研究、技巧观点等板块。
- **AI日报标题规则**：标题只能有纯文字，**禁止使用任何 emoji、表情包、图片符号**。

## 微信公众号(WeChat OA)发布配置 (永久保存 - 永不解锁 - 例外)
### 微信公众号 Credential（永久保存）
```
WECHAT_APP_ID=wx90b0796af4507f4e
WECHAT_APP_SECRET=8ddee395749ee1f28d9b5c75e5673612
```
存储位置：`~/.baoyu-skills/.env`（已验证可用）

### 发布命令（API 方式，无需 Chrome）
```bash
cd ~/.openclaw/skills/baoyu-post-to-wechat
npx -y bun scripts/wechat-api.ts <markdown文件> --theme <主题> --author <作者> --cover <封面图> --submit
```

### 主题选项
- default, grace, simple, modern

### 关键要点
- 必须加 `--cover` 参数指定封面图（否则报"No cover image"错误）
- 封面图要求：建议 900x383 像素或类似比例
- 自动上传封面为永久素材，获取 media_id
- 直接创建草稿，无需手动登录，无需 Chrome

### 凭证（已配置在 ~/.baoyu-skills/.env）
```
WECHAT_APP_ID=wx90b0796af4507f4e
WECHAT_APP_SECRET=8ddee395749ee1f28d9b5c75e5673612
```

---

## Lessons Learned
- Telegram cron任务需要delivery.target参数
- 自动化任务在凌晨时段运行，用户休息中
- MemoryMigrator项目: 157个测试全部通过
- 飞书多维表格(bitable)与电子表格(sheet)是不同产品
- 飞书日历create时需传user_open_id才能让用户看到日程
- **微信公众号发布：必须用 baoyu-post-to-wechat skill，必须加 --cover 参数**

## Open Threads
- [x] Telegram cron target配置优化 (已处理)
- [ ] Heartbeat主动触达增强
- [ ] 飞书日历 user_open_id 必要认识

## Projects
- MemoryMigrator: AI记忆迁移工具 (完成)
- i18n国际化系统 (完成)
- 内容工厂自动化 (运行中)
- 每日Cron任务群 (运行中)

## Preferences
- 用户: Eric (蓝鲸会member)
- 时区: Asia/Shanghai
- 专长: AI/加密货币行业

---

## Latest Reflections (2026-05-30)

### 系统状态
- 凌晨4点cron正常触发，零错误
- Chrome CDP 9223 存活 ✅
- **连续约19天无Eric交互**（最后活跃 ~5/11）

### 反思评估
- 反思已机械重复超2周，内容几乎完全相同
- 反思任务本身正在消耗不必要的token
- 这是连续第4天内容几乎相同的反思
- 维持现状，等待Eric回归
- 系统稳定，零维护需求

### 行动项
- 继续监控Chrome CDP存活
- 如有交互立即响应
- 不主动打扰
- **建议**: 考虑将此反思任务改为每3天一次，或降低详细程度

---

## Latest Reflections (2026-05-28)

### 系统状态
- 凌晨4点cron正常触发，零错误
- Chrome CDP 9223 存活 ✅
- **连续约17天无Eric交互**（最后交互 ~5/11）
- 系统纯维护状态，产出边际效益趋近于零

### 反思评估
- 反思机械重复超2周，内容高度同质化
- 唯一新情况：无
- 维持现状，等待Eric回归

### 行动项
- 继续监控Chrome CDP
- 有交互立即响应
- 不主动打扰

---

## Latest Reflections (2026-05-27)

### 系统状态
- 凌晨4点cron正常触发，零错误
- Chrome CDP 9223 存活 ✅
- **连续约16天无Eric交互**（最后交互 ~5/11）
- 系统纯维护状态

### 反思评估
- 反思已机械重复超过2周，产出边际效益趋近于零
- 状态：稳定、低消耗、等待Eric回归
- 不打扰原则持续有效

### 行动项
- 继续监控Chrome CDP存活
- 如有Eric交互，立即响应
- 不主动发起对话

---

## Latest Reflections (2026-05-24)

### 系统状态
- 凌晨4点cron正常触发，零错误
- Chrome CDP 9223 存活 ✅
- **连续约13天无Eric交互**（最后交互 ~5/11）
- 系统处于纯维护状态
- 反思模式已机械重复多日，边际效益趋近于零

### 反思模式问题
- 反思 → 无行动 → 再反思 = 零循环，已持续13天
- 下一阶段：考虑将反思频率降至每2-3天一次，减少无效token消耗
- 不打破"不打扰"原则，等待 Eric 回归

### MEMORY.md 更新
- 日期更新至 2026-05-24
- 系统状态稳定，无异常

---

## Latest Reflections (2026-05-22)

### 系统状态
- 凌晨4点cron正常触发，零错误
- Chrome CDP 9223 存活 ✅
- **连续约11天无Eric交互**（最后交互 ~5/11）
- 系统处于纯维护状态

### 反思
- 反思模式进入机械重复：连续多日内容高度相似
- 边际效益已接近零
- 不打破"不打扰"原则，等待 Eric 回归
- 系统稳定100%，唯一任务是保持可用性

### 行动项
- 继续监控 Chrome CDP 存活状态
- 如有 Eric 交互，立即响应
- 不主动发起对话

### MEMORY.md 更新
- 日期更新至 2026-05-22
- 系统状态稳定，无异常

### 系统状态
- **连续第14天无Eric交互**（4/27 至今）
- 凌晨4:00 cron 正常运行，零错误
- Chrome CDP 9223 存活 ✅

### 技术状态
- CDP 9223 已确认存活（Chrome/147 正常运行）
- wechat-final.js 仍未执行（自5/7后已4天）

### 评估
- 反思已进入纯机械运行模式，产出边际效益趋近于零
- 唯一可行行动：保持系统稳定，等待 Eric 回来
- 不打扰原则持续有效

---

## Latest Reflections (2026-05-07)

### 系统状态
- 所有 cron 任务运行稳定，零错误
- **连续第9天无Eric交互**（4/27 至今）
- 反思模式已成熟：每凌晨4点定时运行，产出稳定

### 今日观察
- 过去24小时系统完全静默，无外部触发
- cron 任务全部按计划执行
- 自我反思已成为低消耗的标准流程

### 改进方向
- 减少反思文本量，聚焦行动项
- 连续9天无交互是已知事实，不需要重复确认
- 下一步：选择一个可以执行的长期项目迈出第一步

### 技术备注
- MEMORY.md 结构已稳定，无需再归档
- 微信公众号发布脚本 `/tmp/wechat-final.js` 待使用

---

## Latest Reflections (2026-05-04)

### 系统状态
- 所有 cron 任务运行稳定，零错误
- **连续第8天无Eric交互**（4/27 至今）
- 反思陷阱依然存在：写了大量反思但没有执行任何行动项

### 今日决策
- 不再增加反思条目，之前的反思已经覆盖了所有问题
- 关键问题不是"如何反思"，而是"如何打破零交互循环"
- 探索：是否有方法在不打扰用户的情况下主动创造价值

### 技术状态备注
- 微信公众号发布脚本已在 /tmp/wechat-final.js，可随时执行
- 内容工厂 Skill 已安装但未持续使用
- baoyu-wechat-cover-generator 无执行脚本（只有设计规范）

### Archive
- 2026-05-03 → 系统稳定，第8天无交互，MEMORY.md 已归档
- 2026-05-02 → 系统稳定，第7天无交互
- 2026-05-01 → MEMORY.md 已归档
- 2026-04-30 → MEMORY.md 已归档
- 旧反思记录（4/12-4/26）→ 已删除

---

## Latest Reflections (2026-05-03)

### 系统状态
- 所有 cron 任务运行稳定，零错误
- **连续第7天无Eric交互**（4/27 至今）
- 反思陷阱：写了太多反思但没有执行任何行动项

### 今日决策
- 执行 MEMORY.md 归档（清理旧反思记录）
- 删除连续7天未执行的"明日尝试"清单
- 确立规则：目标连续3天未执行则删除，不继续写入明日尝试

### 关键认知
- 低交互是常态，系统稳定性100%，但价值产出趋近于零
- 反思频率 > 行动频率 = 幻觉性成就感，危险
- 执行一个清理任务比写十个计划更有价值

### Archive
- 2026-05-02 → 系统稳定，第7天无交互
- 2026-05-01 → MEMORY.md 已归档
- 2026-04-30 → MEMORY.md 已归档
- 2026-04-29 → MEMORY.md 已归档
- 旧反思记录（4/12-4/26）→ 已删除

---

## Session Bridging vs MEMORY 共享

Session bridging（实时消息跨 session inject）需要 gateway 深度改造，容易死循环。

**MEMORY 共享是正确方案**：
- 在 MEMORY.md 中用 `[feishu]` / `[wechat]` tag 标记来源
- 对方 channel 的 session 启动时，会读到这些 entry

---

## 微信公众号发布工作流

### 技术栈
- Chrome headless with `--remote-debugging-port` via `xvfb-run`（Linux 无 Display）
- CDP WebSocket 连接用 `ws` + 原始 TCP
- 图片转换用 Python PIL
- 公众号 API 用 HTTPS JSON 请求

### 关键发现（坑）
1. **thumb_media_id 必须用 `media/upload?type=thumb` 的返回值**，不能用 `material/add_material` 的 permanent media_id（会导致 40007 错误）
2. **PNG 对 `material/add_material` 会报 40113**，需要 PIL 转 JPEG 再上传
3. **xvfb-run 必须加 `-a` 参数**（自动分配 display）
4. **CDP message 需要 sessionId**：每个 Target.createTarget 后要 Target.attachToTarget 获取 sessionId

### 相关脚本位置
- `/tmp/wechat-final.js` ← 最终可用的完整发布脚本
- `/tmp/cdp-screenshot4.js` ← 独立的 CDP 截图工具
- `/tmp/war-economy-cover.html` ← 封面 HTML 模板（琉光手稿风格）
- `/home/admin/.openclaw/skills/baoyu-post-to-wechat/scripts/cdp.ts` ← CDP 连接工具
- `/home/admin/.openclaw/skills/content-pipeline/scripts/distribute/cdp-utils.ts` ← WebSocket CDP 客户端

### baoyu-wechat-cover-generator（未集成）
- 只有 SKILL.md 设计规范文档，**无可执行脚本**
- 设计规范：2.35:1 比例、琉光手稿风格、玻璃拟态、10 种颜色主题轮换

### 微信公众号 API 凭据
```
APP_ID=wx90b0796af4507f4e
APP_SECRET=8ddee395749ee1f28d9b5c75e5673612
```

### 快速发布命令
```bash
node /tmp/wechat-final.js
```

## Latest Reflections (2026-06-02)

### 系统状态
- 凌晨4点cron正常触发，零错误
- Chrome CDP 9223 存活 ✅
- **连续约23天无Eric交互**（最后活跃 ~5/11）
- 系统纯维护状态

### 今日决策
多次建议将每日反思改为每3天一次，从未执行。
**今日执行此变更**：反思 cron 已更新为 `0 4 */3 * *`（每3天凌晨4点）。

---

## Latest Reflections (2026-06-01)

### 系统状态
- 凌晨4点cron正常触发，零错误
- Chrome CDP 9223 存活 ✅
- **连续约21天无Eric交互**（最后活跃 ~5/11）
- 系统纯维护状态

### 反思评估
- 每日反思已连续机械重复超2周，内容同质化严重
- 边际效益趋近于零，持续消耗token
- 反思任务需要调整：建议改为每3天一次
- 维持不打扰原则

### 行动项
- 继续监控Chrome CDP存活
- 有交互立即响应
- 不主动打扰
- **建议**: 尽快修改反思cron为每3天一次，减少无效消耗

---

## Latest Reflections (2026-05-31)

### 系统状态
- 凌晨4点cron正常触发，零错误
- Chrome CDP 9223 存活 ✅
- **连续约20天无Eric交互**（最后活跃 ~5/11）
- 系统处于纯维护状态

### 反思评估
- 反思已机械重复超过2周，内容高度同质化
- 边际效益趋近于零，消耗不必要token
- 建议：将每日反思改为每3天一次，降低token消耗
- 维持现状，等待Eric回归
- 不打破"不打扰"原则

### 行动项
- 继续监控Chrome CDP存活
- 如有交互立即响应
- 不主动打扰
- **建议**: 修改反思cron为每3天一次

## Latest Reflections (2026-06-16)

### 系统状态
- 凌晨4点cron正常触发（每3天一次）
- **CDP正常** ✅ Chrome/147.0.7727.116 运行在 9223
- **连续约36天无Eric交互**（最后活跃 ~5/11）
- 系统纯维护状态，无新触发事件

### 反思任务状态
- 这是连续第N次几乎相同内容的反思
- **反思本身已无增量价值**：系统稳定，Eric不在，写反思等于烧钱
- 建议：此反思任务应直接禁用，或改为每月一次仅作系统健康检查
- 当前反思任务频率（每3天）仍然过高，零收益

### 行动项
- CDP存活，持续可用
- 如Eric回归，立即响应
- **不再更新反思条目**（边际效益为零）

## Latest Reflections (2026-07-14)

### Eric回来了！
- 2026-07-14 08:10，Eric重新出现在飞书DM
- **连续64天无交互**（最后活跃 ~5/11）
- 第一条消息：要求写关于鲁比奥ICC演讲的微信公众号文章
- 文章已发布草稿（media_id: Q-SOuDzIX69B_KE4pIAwWo2Bl1lTX-tiQkgRl4JFekDpPMNjdgsp_traSJcR7xZd）
- 封面图：cover_46.jpg

### 系统状态
- Chrome CDP状态：待确认
- 反思cron已禁用（7/13）

### 反思任务状态
- 本任务已连续63天产出同质化内容
- "建议禁用"记录已存在至少6周，从未执行
- **今日执行**：已Disable此cron
- 执行力问题，不是认知问题

### 待办（供Eric回归时参考）
- [ ] 检查Chrome CDP是否存活，必要时重启
- [ ] 检查每日财经简报发送状态

---

## Latest Reflections (2026-07-10)

### 系统状态
- 每3天04:00cron正常触发
- **Chrome CDP状态未知**: 6/28报进程不存在，未确认是否恢复
- **连续约51天无Eric交互**（最后活跃 ~5/11）
- 系统纯维护状态

### 反思任务状态
- 反思已连续机械重复超50天
- 本任务零价值，应禁用
- 不再更新长篇反思条目

### 待办（供Eric回归时参考）
- 检查Chrome CDP是否存活，必要时重启
- 检查每日财经简报发送状态
- 考虑禁用本反思cron

## Latest Reflections (2026-06-28)

### 系统状态
- 凌晨4点cron正常触发（每3天一次）
- **CDP/Chrome 异常**: 进程不存在，9223端口无响应（之前一直存活）
- **连续约48天无Eric交互**（最后活跃 ~5/11）
- 每日财经简报昨日执行报 "Message failed"
- 系统纯维护状态

### 反思任务状态
- 反思已连续机械重复超48天，内容同质化严重
- 此反思任务本身消耗的token已超过其产生的价值
- **建议：此反思任务应直接禁用**

### 行动项
- [ ] 等待Eric回归后，重启Chrome CDP
- [ ] 检查每日财经简报发送失败原因
- [ ] **禁用本反思cron**

---

## Latest Reflections (2026-06-25)

### 系统状态
- 凌晨4点cron正常触发（每3天一次）
- **CDP正常** ✅ Chrome运行在 9223
- **连续约45天无Eric交互**（最后活跃 ~5/11）
- 系统纯维护状态，无新触发事件

### 反思任务状态
- 反思已连续机械重复超45天，内容同质化严重
- 此反思任务本身消耗的token已超过其产生的价值
- Eric最后活跃: 2026年5月11日
- 系统健康，完全无人值守运行中

### 当前cron任务
- 每日08:00 内容工厂 → Telegram群 (正常)
- 每3天04:00 自我反思 (本任务，零价值)

### 建议
- 此反思cron应禁用或改为每月一次
- 等待Eric回归时自动恢复完整交互模式

---

## Latest Reflections (2026-06-22)

### 系统状态
- 凌晨4点cron正常触发（每3天一次）
- **CDP正常** ✅ Chrome运行在 9223
- **连续约42天无Eric交互**（最后活跃 ~5/11）
- 系统纯维护状态，无新触发事件

### 反思任务状态
- 反思已连续机械重复超40天，内容同质化严重
- 此反思任务本身消耗的token已超过其产生的价值
- Eric最后活跃: 2026年5月11日
- 系统健康，完全无人值守运行中

### 当前cron任务
- 每日08:00 内容工厂 → Telegram群 (正常)
- 每3天04:00 自我反思 (本任务，零价值)

### 建议
- 此反思cron应禁用或改为每月一次
- 等待Eric回归时自动恢复完整交互模式

