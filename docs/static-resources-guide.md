# 静态资源管理规范指南

本文档旨在规范HTML文件和其他静态资源的管理，避免访问链接失效的问题。

## 🚨 核心问题

**问题描述**：HTML文件放在错误位置导致链接访问失败。

**问题原因**：
- 将HTML文件放在 `content/blog/` 目录下
- React SPA架构无法直接访问非public目录下的静态文件
- 构建过程不会将content目录下的HTML文件复制到dist目录

**最新案例**：GenColor.ai知识卡片HTML文件最初放在 `content/blog/zh-Hans/` 目录，导致链接 `/blog/gencolor-ai-knowledge-card.html` 返回404错误。

## ✅ 正确的静态资源管理

### 1. 目录结构规范

```
project-root/
├── public/                    # ✅ 静态HTML文件放这里
│   ├── favicon.ico
│   ├── robots.txt
│   ├── gencolor-ai-knowledge-card.html
│   └── other-static-files.html
├── content/blog/              # ❌ 不要放HTML文件
│   ├── zh-Hans/
│   │   ├── article1.md       # ✅ 只放markdown文件
│   │   └── article2.md
│   └── en/
├── src/                       # React组件和页面
└── dist/                      # 构建输出目录
    ├── gencolor-ai-knowledge-card.html  # 自动从public复制
    └── index.html
```

### 2. 链接引用规范

#### ✅ 正确的链接格式
```html
<!-- 绝对路径，从网站根目录开始 -->
<a href="/static-file.html">链接文本</a>
<a href="/gencolor-ai-knowledge-card.html">知识卡片</a>

<!-- 相对于public目录的文件 -->
<a href="/assets/document.pdf">PDF文档</a>
```

#### ❌ 错误的链接格式
```html
<!-- 相对路径，在SPA中容易失效 -->
<a href="./static-file.html">链接文本</a>
<a href="../knowledge-card.html">知识卡片</a>

<!-- 指向content目录（无法访问） -->
<a href="/content/blog/zh-Hans/file.html">错误链接</a>
```

### 3. 文件类型分类

#### public目录适合放置的文件
- ✅ 独立的HTML页面（如知识卡片、落地页）
- ✅ PDF文档、图片等媒体文件
- ✅ robots.txt、sitemap.xml等SEO文件
- ✅ favicon.ico等网站图标
- ✅ 第三方库的静态文件

#### content目录适合放置的文件
- ✅ Markdown博客文章
- ✅ 配置文件（JSON、YAML）
- ❌ 不要放HTML文件
- ❌ 不要放需要直接访问的静态资源

## 🔧 构建过程说明

### Vite构建行为
1. **public目录**：文件会被原样复制到dist目录根级
2. **src目录**：源码会被编译和打包
3. **content目录**：不会被自动处理，需要自定义脚本处理

### 验证构建结果
```bash
# 构建项目
npm run build

# 检查dist目录结构
ls -la dist/

# 验证静态文件是否正确复制
ls -la dist/*.html
```

## 🚀 最佳实践

### 1. 创建静态HTML文件

```bash
# ✅ 正确：在public目录创建
touch public/new-knowledge-card.html

# ❌ 错误：在content目录创建
touch content/blog/zh-Hans/knowledge-card.html
```

### 2. 引用静态资源

```html
<!-- 在markdown文章中引用 -->
<a href="/knowledge-card.html" target="_blank">查看知识卡片</a>

<!-- 在React组件中引用 -->
<a href="/static-document.pdf" target="_blank">下载PDF</a>
```

### 3. 文件命名规范

```
✅ 好的命名：
- gencolor-ai-knowledge-card.html
- mindvideo-ai-report.html
- product-landing-page.html

❌ 避免的命名：
- card.html (太通用)
- 知识卡片.html (包含中文)
- file with spaces.html (包含空格)
```

## 🔍 调试步骤

### 1. 检查文件位置
```bash
# 确认文件在public目录
ls -la public/*.html

# 确认构建后在dist目录
ls -la dist/*.html
```

### 2. 测试链接访问
```bash
# 启动预览服务器
npm run preview

# 直接访问静态文件
curl http://localhost:4173/your-file.html
```

### 3. 检查网络请求
- 打开浏览器开发者工具
- 点击链接查看Network tab
- 确认请求状态码为200而不是404

## 📋 问题预防清单

创建新的静态HTML文件时：

- [ ] 文件放在 `public/` 目录下
- [ ] 使用绝对路径引用（以 `/` 开头）
- [ ] 文件名使用英文和连字符
- [ ] 构建后验证文件在 `dist/` 目录
- [ ] 测试链接能正常访问
- [ ] 确认在生产环境能正常工作

## 🛠️ 迁移现有文件

如果发现文件放错位置：

```bash
# 1. 移动文件到正确位置
mv content/blog/zh-Hans/file.html public/file.html

# 2. 更新所有引用链接
# 从 ./file.html 改为 /file.html
sed -i 's|href="./file.html"|href="/file.html"|g' content/blog/**/*.md

# 3. 重新构建
npm run build

# 4. 验证访问
npm run preview
```

## 🔄 自动化检查

可以创建脚本检查静态资源位置：

```javascript
// scripts/check-static-resources.js
import fs from 'fs';
import path from 'path';

function checkStaticResources() {
  const contentDir = 'content/blog';
  const htmlFiles = [];
  
  function scanDirectory(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
      const fullPath = path.join(dir, file);
      if (fs.statSync(fullPath).isDirectory()) {
        scanDirectory(fullPath);
      } else if (file.endsWith('.html')) {
        htmlFiles.push(fullPath);
      }
    }
  }
  
  scanDirectory(contentDir);
  
  if (htmlFiles.length > 0) {
    console.error('❌ 发现HTML文件在错误位置:');
    htmlFiles.forEach(file => console.error(`  ${file}`));
    console.error('请将这些文件移动到 public/ 目录');
    process.exit(1);
  } else {
    console.log('✅ 静态资源位置检查通过');
  }
}

checkStaticResources();
```

## 📞 故障排除

遇到静态资源访问问题时：

1. **检查文件位置**：确认在public目录
2. **检查链接格式**：使用绝对路径
3. **重新构建**：确保文件被正确复制
4. **清除缓存**：浏览器和CDN缓存可能导致问题
5. **测试本地环境**：确认开发环境正常

记住：**位置决定可访问性** - 只有public目录下的文件才能被直接访问。