# 知识卡片设计制作指南

## 🎨 视觉设计规范

### 配色方案
- **背景渐变**：绿色渐变 `#20BF7A` → `#1A9B6B`（135度线性渐变）
- **主内容区**：白色圆角背景 `#FFFFFF`，圆角半径 20px
- **装饰元素**：使用主绿色 `#20BF7A` 作为强调色

### 布局结构
- **卡片尺寸**：1200px × 600px（标准比例 2:1）
- **整体布局**：左右分栏设计，Grid布局 `1fr 1fr`
- **内边距**：外层40px，内容区32px
- **栏间距**：40px

### 左侧区域设计
- **主标题**：48px粗体，白色文字
- **副标题**：20px常规字重，白色90%透明度
- **核心理念框**：
  - 背景：`rgba(255, 255, 255, 0.15)` + 玻璃模糊效果
  - 边框：2px `rgba(255, 255, 255, 0.2)`
  - 圆角：16px
  - 内边距：24px
- **引用区**：左侧4px白色40%透明度竖线装饰

### 右侧区域设计
- **背景**：纯白色圆角背景
- **列表项间距**：24px垂直间距
- **第一项装饰**：绿色虚线框（8px-4px虚线模式）+ 5%绿色背景
- **圆形数字标签**：
  - 尺寸：32px直径
  - 背景：绿色渐变
  - 文字：14px粗体白色
- **文字层次**：标题16px粗体 + 描述14px常规

## 📋 复制功能技术实现

### Canvas绘制核心要点

#### 1. Canvas初始化
```javascript
const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');
canvas.width = 1200;
canvas.height = 600;
```

#### 2. 圆角矩形绘制（兼容性函数）
```javascript
function drawRoundRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
}
```

#### 3. 状态管理
- 使用 `ctx.save()` 和 `ctx.restore()` 管理绘制状态
- 透明度设置要用状态保存包裹
- 避免状态污染导致的渲染问题

#### 4. 渐变绘制
- **背景渐变**：`createLinearGradient(0, 0, 1200, 600)`
- **数字圆圈渐变**：`createRadialGradient(centerX, centerY, 0, centerX, centerY, 16)`

#### 5. 文字渲染规范
- **字体选择**：使用 `Arial, sans-serif` 确保跨平台兼容
- **对齐方式**：明确设置 `textAlign` 和 `textBaseline`
- **长文本处理**：实现智能换行，避免文字超出边界

#### 6. 虚线绘制
```javascript
ctx.setLineDash([8, 4]);  // 设置虚线
drawRoundRect(ctx, x, y, width, height, radius);
ctx.stroke();
ctx.setLineDash([]);      // 重置为实线
```

#### 7. 图片导出
```javascript
canvas.toBlob(async (blob) => {
    const item = new ClipboardItem({ 'image/png': blob });
    await navigator.clipboard.write([item]);
}, 'image/png', 1.0);  // 最高质量导出
```

### 关键技术要点

#### ❌ 避免的问题
1. **不要使用现代Canvas API**：如 `roundRect()`，兼容性差
2. **不要依赖高DPI缩放**：会导致坐标系混乱
3. **不要使用复杂字体**：如 `-apple-system`，可能渲染失败
4. **不要忽略状态管理**：透明度等属性会累积影响

#### ✅ 必须遵循的规则
1. **手动绘制圆角**：使用 `quadraticCurveTo` 方法
2. **明确状态边界**：每个复杂绘制用 `save/restore` 包裹
3. **测量文本宽度**：长文本要检查并换行
4. **统一字体策略**：全部使用 Arial 字体
5. **完整错误处理**：捕获并显示具体错误信息

## 🔧 交互功能设计

### 复制按钮
- **位置**：卡片右侧，垂直居中
- **样式**：60px圆形，绿色渐变背景
- **状态反馈**：
  - 默认：📋 图标
  - 成功：✓ 图标 + 绿色背景
  - 失败：✗ 图标 + 红色背景
  - 状态持续2秒后恢复

### 状态消息
- **位置**：按钮右侧
- **样式**：黑色半透明背景 + 白色文字
- **动画**：淡入淡出效果
- **内容**：
  - 成功："复制成功！"
  - 失败："复制失败，请重试"

## 📝 内容组织规范

### 左侧内容结构
1. **主标题** - 知识主题名称
2. **副标题** - 完整名称或英文名
3. **核心理念框**
   - 标题："核心智慧/核心理念/核心要点"
   - 内容：一句话概括核心思想
4. **引用语句** - 经典名言或重要表述

### 右侧维度展开
- **固定5个维度**，每个维度包含：
  - 圆形数字标签（1-5）
  - 维度标题（4-6个字）
  - 一句话描述（不超过25字）
- **第一个维度**：添加虚线框装饰突出重要性

### 文案撰写原则
- **简洁精炼**：每个维度一句话概括
- **层次清晰**：从基础到应用，逻辑递进
- **实用导向**：结合现代意义和实际应用
- **语言统一**：保持专业性与可读性平衡

## 🚀 实施检查清单

### 开发前确认
- [ ] Canvas兼容性函数已定义
- [ ] 所有绘制方法使用手动圆角
- [ ] 字体统一设置为Arial
- [ ] 状态管理策略明确

### 测试验证
- [ ] 复制功能在不同浏览器测试
- [ ] 图片完整性检查（左右两侧内容）
- [ ] 文字清晰度验证
- [ ] 交互反馈正常工作

### 最终交付
- [ ] 卡片内容完整准确
- [ ] 视觉效果符合设计规范
- [ ] 复制功能稳定可用
- [ ] 代码注释清晰完整

---

**重要提醒**：严格按照此指南实施，特别是Canvas绘制部分的技术要点，确保每次都能成功复制出完整的高质量卡片图片。