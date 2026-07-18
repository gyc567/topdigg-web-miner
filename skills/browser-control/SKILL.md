# Browser Control Skill

使用 browser 工具控制浏览器自动化。

---

## 工具

使用 OpenClaw 内置的 `browser` 工具：

### 基础操作

| 操作 | 说明 |
|------|------|
| `browser status` | 查看浏览器状态 |
| `browser start` | 启动浏览器 |
| `browser open [url]` | 打开网址 |
| `browser snapshot` | 截图当前页面 |
| `browser navigate [url]` | 导航到网址 |

### 交互操作

| 操作 | 说明 |
|------|------|
| `browser act click [ref]` | 点击元素 |
| `browser act type [ref] [text]` | 输入文本 |
| `browser act press [key]` | 按键 |
| `browser act scroll [down/up]` | 滚动 |

### 高级操作

| 操作 | 说明 |
|------|------|
| `browser console` | 获取控制台日志 |
| `browser search [query]` | 搜索页面元素 |
| `browser evaluate [js]` | 执行 JavaScript |

---

## 使用示例

### 打开网页
```
browser open https://example.com
```

### 截图
```
browser screenshot
```

### 点击按钮
```
browser act click button:submit
```

### 输入表单
```
browser act type input:email user@example.com
browser act type input:password secret123
browser act click button:login
```

### 滚动页面
```
browser act scroll down
```

---

## 注意事项

1. 使用 `ref` 引用元素（通过 snapshot 获取）
2. 复杂操作可以组合使用
3. 敏感操作前先截图确认
