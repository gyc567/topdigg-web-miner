# TopDigg 项目指导文档 (Project Steering Document)

## 项目概述

TopDigg 是一个基于 React 的多语言内容网站，专注于 SEO 和增长话题，包含博客系统和精选栏目（Reddit、YouTube、Twitter）。项目采用现代化的技术栈，支持四种语言（简体中文、繁体中文、英文、日文），具有完善的 SEO 优化和响应式设计。

## 技术架构

### 核心技术栈
```
Frontend:
├── React 18 + TypeScript + Vite (基础框架)
├── shadcn/ui + Tailwind CSS (UI/样式系统)
├── React Router DOM (路由管理)
├── react-i18next (国际化)
├── react-helmet-async (SEO管理)
├── React Query (状态管理)
└── gray-matter + marked (Markdown处理)

Build & Development:
├── Vite (构建工具)
├── SWC (编译器)
├── ESLint (代码检查)
└── PostCSS (CSS处理)
```

### 项目结构详解
```
topdigg-web-miner/
├── src/
│   ├── components/
│   │   ├── ui/              # shadcn/ui 组件库 (自动生成，勿手动编辑)
│   │   ├── layout/          # 布局组件
│   │   │   ├── Layout.tsx   # 主布局容器
│   │   │   ├── SiteHeader.tsx
│   │   │   └── SiteFooter.tsx
│   │   ├── LanguageInitializer.tsx  # 语言初始化
│   │   ├── LanguageSwitcher.tsx     # 语言切换器
│   │   ├── MarkdownContent.tsx      # Markdown 内容渲染
│   │   └── SEO.tsx                  # SEO 元数据组件
│   ├── pages/               # 页面组件
│   │   ├── Index.tsx        # 首页
│   │   ├── BlogIndex.tsx    # 博客列表页
│   │   ├── BlogPost.tsx     # 博客文章页
│   │   ├── ColumnPage.tsx   # 栏目页（Reddit/YouTube/Twitter）
│   │   └── NotFound.tsx     # 404页面
│   ├── config/
│   │   └── site.ts          # 🔥 核心配置文件（内容、导航、栏目）
│   ├── lib/
│   │   ├── blog-loader.ts   # 博客内容加载器
│   │   ├── blog-adapter.ts  # 博客数据适配器
│   │   ├── locale.ts        # 多语言工具函数
│   │   └── utils.ts         # 通用工具函数
│   ├── locales/             # 国际化翻译文件
│   │   ├── zh-Hans/translation.json
│   │   ├── zh-Hant/translation.json
│   │   ├── en/translation.json
│   │   ├── ja/translation.json
│   │   └── vi/translation.json
│   ├── hooks/               # 自定义 React Hooks
│   ├── i18n.ts             # i18next 配置
│   └── main.tsx            # 应用入口
├── content/blog/           # 博客内容 (Markdown 文件)
│   ├── zh-Hans/
│   ├── zh-Hant/
│   ├── en/
│   ├── ja/
│   └── vi/
├── public/                 # 静态资源
├── scripts/
│   └── build-blog.js      # 博客构建脚本
├── sw.js                  # Service Worker (广告组件)
└── vite.config.ts         # Vite 配置
```

## 核心系统详解

### 1. 多语言系统 (i18n)
```typescript
// 支持的语言
type SupportedLocale = "zh-Hans" | "zh-Hant" | "en" | "ja" | "vi";

// 语言检测优先级：
// 1. URL query parameter (?lang=)
// 2. localStorage
// 3. 浏览器语言偏好
// 4. 默认语言 (zh-Hans)

// 地理位置映射：
CN, SG -> zh-Hans
TW, HK, MO -> zh-Hant  
JP -> ja
VN -> vi
其他 -> en
```

### 2. 内容管理系统
**核心配置文件**: `src/config/site.ts`
- **集中式配置**: 所有网站内容、导航、栏目数据集中管理
- **类型安全**: 完整的 TypeScript 类型定义
- **多语言支持**: 所有文本内容支持五种语言

```typescript
// 主要数据类型
LocalizedText    // 多语言文本对象
NavLink         // 导航链接
ColumnConfig    // 栏目配置
BlogPost        // 博客文章
```

### 3. 路由系统
```typescript
// 路由配置 (src/App.tsx:28-34)
/                    -> Index (首页)
/blog               -> BlogIndex (博客列表)
/blog/:slug         -> BlogPost (博客文章)
/columns/:id        -> ColumnPage (栏目页面)
/*                  -> NotFound (404页面)
```

### 4. 博客系统
- **双模式支持**: 
  - 静态配置 (`site.ts` 中的 `blog.posts`)
  - 动态文件加载 (`content/blog/` 目录中的 Markdown 文件)
- **文件结构**: `/content/blog/{locale}/{slug}.md`
- **构建流程**: `scripts/build-blog.js` 处理 Markdown 文件
- **渲染**: gray-matter 解析 frontmatter，marked 渲染 Markdown

### 5. SEO 优化系统
- **结构化数据**: JSON-LD 格式
- **多语言 Meta 标签**: 自动生成对应语言的 meta 信息
- **OpenGraph 支持**: 社交媒体分享优化
- **HTML lang 属性**: 根据当前语言动态设置

## 开发工作流

### 环境配置
```bash
# 开发环境
npm run dev          # 启动开发服务器 (http://localhost:8080)

# 构建
npm run build        # 生产构建 (包含博客构建)
npm run build:dev    # 开发构建
npm run build:blog   # 单独构建博客

# 代码质量
npm run lint         # ESLint 检查
```

### 添加新功能的标准流程
1. **理解现有架构**: 查看相关组件和配置
2. **检查依赖**: 确认所需库是否已安装
3. **遵循约定**: 使用现有的样式、命名、类型定义
4. **多语言支持**: 确保新功能支持所有四种语言
5. **SEO 考虑**: 添加适当的 meta 标签和结构化数据

### 内容管理最佳实践
1. **统一入口**: 所有内容通过 `site.ts` 管理
2. **类型安全**: 使用现有的 TypeScript 类型
3. **多语言一致性**: 确保所有语言版本内容对等
4. **SEO 友好**: 合理的 URL 结构和 meta 信息

## 代码架构规范

### 文件大小限制
- **TypeScript/JavaScript 文件**: ≤ 200 行
- **目录文件数量**: ≤ 8 个文件/目录

### 架构质量监控
**必须避免的架构异味**:
1. **刚性 (Rigidity)**: 系统难以修改，小改动引发连锁反应
2. **冗余 (Redundancy)**: 相同逻辑在多处重复
3. **循环依赖**: 模块间相互依赖形成死锁
4. **脆弱性 (Fragility)**: 修改一处破坏看似无关的其他部分
5. **晦涩性 (Obscurity)**: 代码结构混乱，意图不明
6. **数据泥团**: 总是一起出现的参数，暗示缺少抽象
7. **过度复杂**: 为简单问题使用重量级解决方案

### 编码规范
- **导入顺序**: 第三方库 → 本地模块 → 类型定义
- **命名约定**: 组件用 PascalCase，函数用 camelCase
- **路径别名**: 使用 `@/` 指向 `src/` 目录
- **注释**: 仅在必要时添加，代码应自说明

## 特殊文件说明

### sw.js (Service Worker)
- **用途**: 广告组件 (monetag)
- **状态**: 混淆代码，属于第三方广告集成
- **维护**: 无需手动修改

### 配置文件关系图
```
vite.config.ts        -> 构建配置、路径别名、插件
tailwind.config.ts    -> 样式配置
tsconfig.json         -> TypeScript 配置
package.json          -> 依赖管理、脚本
components.json       -> shadcn/ui 配置
```

## 栏目系统

### 当前栏目配置
1. **Reddit 专栏** (`/columns/reddit`)
   - 聚焦创业、营销、SEO 等社区
   - 推荐账号: r/Entrepreneur, r/SideProject 等

2. **YouTube 专栏** (`/columns/youtube`)
   - 内容增长专家和教育频道
   - 推荐账号: Ali Abdaal, HubSpot, Ahrefs 等

3. **Twitter 专栏** (`/columns/twitter`)
   - 增长黑客和创业者
   - 推荐账号: Sahil Bloom, Julian Shapiro 等

### 扩展栏目指南
1. 在 `site.ts` 中添加新的 `ColumnConfig`
2. 确保多语言标题和描述
3. 添加相应的路由处理
4. 考虑 SEO 优化

## 部署与维护

### 构建产物
- **目标目录**: `dist/`
- **静态资源**: 自动处理和优化
- **多语言路由**: 客户端路由，需要服务器配置支持

### 性能优化建议
1. **代码分割**: 利用 React.lazy 和动态导入
2. **图片优化**: 使用现代格式 (WebP/AVIF)
3. **缓存策略**: 合理配置静态资源缓存
4. **Bundle 分析**: 定期检查包大小

### 监控指标
- **Core Web Vitals**: LCP, FID, CLS
- **SEO 指标**: 页面索引情况，搜索排名
- **多语言**: 各语言版本的访问情况
- **用户行为**: 页面停留时间，跳出率

## 未来发展方向

### 技术升级路线图
1. **React 19**: 准备升级到最新版本
2. **Vite 6**: 跟进构建工具更新
3. **TypeScript 5.x**: 利用最新语言特性

### 功能扩展建议
1. **用户系统**: 注册登录、个人中心
2. **内容管理**: 在线编辑器、内容审核
3. **数据分析**: 用户行为分析、A/B 测试
4. **API 集成**: 社交媒体 API、内容聚合

---

**📋 使用指南**: 本文档应定期更新，确保与代码实际状态保持同步。在进行重大架构调整时，必须更新相应章节。