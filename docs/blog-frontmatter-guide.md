# Blog Frontmatter Format Guide

## 问题总结

在添加新的博客文章时遇到的问题：新创建的 `mindvideo-ai-analysis-report.md` 文件没有显示在博客页面上。

## 根本原因

**Frontmatter格式不匹配**：
- 新文件使用了 TOML 格式（`+++`开头和结尾）
- 项目中的其他文件使用 YAML 格式（`---`开头和结尾）
- `gray-matter` 库默认解析 YAML 格式，无法正确解析 TOML 格式的 frontmatter

## 正确的 Frontmatter 格式

### ✅ 正确格式（YAML）
```yaml
---
title: "文章标题"
description: "文章描述"
date: "2025-08-16"
author: "ERIC"
tags: ["标签1", "标签2", "标签3"]
categories: ["分类"]
keywords: ["关键词1", "关键词2"]
---
```

### ❌ 错误格式（TOML）
```toml
+++
title = '文章标题'
description = '文章描述'
date = '2025-08-16T16:52:01+08:00'
draft = false
tags = ['标签1', '标签2', '标签3']
categories = ['分类']
keywords = ['关键词1', '关键词2']
+++
```

## 检查流程

1. **检查 frontmatter 格式**：确保使用 `---` 而不是 `+++`
2. **验证博客数据生成**：运行 `npm run build:blog` 检查是否正确解析
3. **检查生成的数据**：查看 `src/lib/blog-data.json` 中是否包含新文章
4. **重新构建**：运行 `npm run build:dev` 重新构建网站

## 预防措施

### 1. 创建模板文件
```bash
# 在项目根目录创建模板
cp content/blog/zh-Hans/easemate-ai-research-report.md content/blog/zh-Hans/new-template.md
```

### 2. 使用检查脚本
在 `package.json` 中添加验证脚本：
```json
{
  "scripts": {
    "validate-frontmatter": "node scripts/validate-frontmatter.js"
  }
}
```

### 3. 自动化检查
创建 `scripts/validate-frontmatter.js`：
```javascript
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function validateFrontmatter(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  
  // 检查是否使用正确的分隔符
  if (content.startsWith('+++')) {
    console.error(`❌ ${filePath}: 使用了错误的 TOML 格式 (+++), 应该使用 YAML 格式 (---)`);
    return false;
  }
  
  try {
    const { data } = matter(content);
    if (!data.title || !data.description) {
      console.error(`❌ ${filePath}: 缺少必需的 frontmatter 字段`);
      return false;
    }
    console.log(`✅ ${filePath}: frontmatter 格式正确`);
    return true;
  } catch (error) {
    console.error(`❌ ${filePath}: frontmatter 解析错误`, error.message);
    return false;
  }
}

// 验证所有博客文件
const contentDir = path.join(__dirname, '../content/blog');
// ... 遍历文件的代码
```

## 故障排除步骤

1. **检查文件是否被正确扫描**：
   ```bash
   find content/blog -name "*.md" | grep mindvideo
   ```

2. **手动测试 frontmatter 解析**：
   ```bash
   node -e "
   const matter = require('gray-matter');
   const fs = require('fs');
   const content = fs.readFileSync('content/blog/zh-Hans/mindvideo-ai-analysis-report.md', 'utf-8');
   console.log(matter(content).data);
   "
   ```

3. **重新生成博客数据**：
   ```bash
   npm run build:blog
   head -20 src/lib/blog-data.json
   ```

4. **检查博客页面**：
   - 访问 http://localhost:8080/blog
   - 确认新文章是否显示

## 建议的工作流程

1. 复制现有文章作为模板
2. 修改 frontmatter 内容（保持 YAML 格式）
3. 添加文章内容
4. 运行 `npm run build:blog` 验证
5. 运行 `npm run build:dev` 构建
6. 检查博客页面

## 多语言支持

确保为所有支持的语言创建对应版本：
- `content/blog/zh-Hans/` - 简体中文
- `content/blog/zh-Hant/` - 繁体中文  
- `content/blog/en/` - 英文
- `content/blog/ja/` - 日文

每个语言版本都必须使用相同的 YAML frontmatter 格式。