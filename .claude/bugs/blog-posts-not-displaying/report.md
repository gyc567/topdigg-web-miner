# Bug Report: Blog Posts Not Displaying After Build

## Bug Summary
**Title:** 博客文章在http://localhost:8080/blog中不显示
**Severity:** High - Content not visible to users
**Status:** New
**Reporter:** User

## Bug Description
运行 `npm run build` 后，新添加的博客文章（如 `web-traffic-opportunities-2025.md` 和 `seo-content-framework.md`）在 http://localhost:8080/blog 页面中无法正常显示，只有原有配置的文章可见。

## Environment
- **OS:** macOS (Darwin 23.6.0)
- **Node.js:** v22.13.0
- **Build Command:** `npm run build`
- **Access URL:** http://localhost:8080/blog

## Steps to Reproduce
1. 在 `content/blog/zh-Hans/` 目录下添加新的Markdown文章
2. 运行 `npm run build` 构建项目
3. 启动开发服务器 `npm run dev`
4. 访问 http://localhost:8080/blog
5. 观察页面只显示原有配置的文章，不显示新添加的文章

## Expected Behavior
新添加的Markdown文章应该出现在博客列表页面中，与原有文章一起显示

## Actual Behavior
只有 `siteConfig.blog.posts` 中定义的文章显示，新添加的Markdown文件内容不显示

## Build Process
- ✅ 构建脚本运行成功：✅ Generated blog data with 2 posts
- ✅ 构建过程无错误：vite build 成功完成
- ✅ 文件生成：`src/lib/blog-data.json` 已更新

## File Structure Check
```
content/blog/zh-Hans/
├── web-traffic-opportunities-2025.md    ✅ 存在
├── seo-content-framework.md             ✅ 存在
```

## Data Source Analysis
- **旧数据源**: `src/config/site.ts` 中的 `siteConfig.blog.posts`
- **新数据源**: `src/lib/blog-data.json` (由构建脚本生成)
- **当前问题**: 博客页面可能仍在使用旧的数据源

## Priority
**High** - 影响内容管理和博客功能完整性

## Next Steps
需要检查博客页面的数据加载逻辑，确认是否使用了新的博客数据源