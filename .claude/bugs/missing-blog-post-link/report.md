# Bug Report: Missing Blog Post Link

## Bug Summary
**Title**: 新增文章remove-bg-report.md无法在博客列表显示
**Severity**: Medium - 内容无法访问
**Status**: New
**Reporter**: User

## Bug Description
用户新增了一篇名为 `remove-bg-report.md` 的文章，并运行了 `npm run build`，但在 http://localhost:8080/blog 页面中找不到该文章的链接或跳转入口。文章似乎已成功构建到系统中，但在博客列表页面没有显示对应的可点击条目。

## 当前状态
- **新增文章**: `remove-bg-report.md` 已创建
- **构建状态**: `npm run build` 执行成功
- **问题现象**: 博客列表页面无该文章链接
- **预期结果**: 应在博客列表显示该文章并提供点击进入详情页

## 重现步骤
1. 新增文章文件 `remove-bg-report.md`
2. 运行 `npm run build`
3. 访问 http://localhost:8080/blog
4. 观察博客列表页面
5. **问题**: 找不到 `remove-bg-report` 文章的链接

## 预期行为
- 博客列表页面应显示新文章的卡片/条目
- 点击条目应能跳转到文章详情页 `/blog/remove-bg-report`
- 文章标题和描述应正确显示

## 技术要求
- **文件完整性**: 确保文章包含完整的frontmatter
- **数据同步**: 构建过程应正确生成文章数据
- **UI显示**: 博客列表应正确渲染所有可用文章
- **路由匹配**: 详情页路由应正确匹配文章slug

## 验证标准
- [ ] 博客列表显示新文章条目
- [ ] 点击可跳转到正确详情页
- [ ] 文章标题和描述正确显示
- [ ] 支持多语言内容（如适用）

## 环境信息
- **构建工具**: Vite + React
- **内容管理**: 静态Markdown构建
- **路由**: React Router
- **语言**: 支持多语言