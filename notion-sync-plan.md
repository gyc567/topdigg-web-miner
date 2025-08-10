# Notion + GitHub Actions 同步流程方案

## 概述
实现从Notion数据库自动同步内容到GitHub仓库的配置文件，支持多语言博客文章和专栏配置的自动化更新。

## 架构设计

### 1. Notion 数据库结构

#### 博客文章数据库 (Blog Posts)
```
Properties:
- Title (Text) - 标题
- Slug (Text) - 文章别名
- Status (Select) - 状态: Draft, Ready, Published
- Date (Date) - 发布日期
- Author (Text) - 作者
- Tags (Multi-select) - 标签
- Description_ZH_Hans (Text) - 简体中文描述
- Description_ZH_Hant (Text) - 繁体中文描述
- Description_EN (Text) - 英文描述  
- Description_JA (Text) - 日文描述
- Content_ZH_Hans (Rich Text) - 简体中文内容
- Content_ZH_Hant (Rich Text) - 繁体中文内容
- Content_EN (Rich Text) - 英文内容
- Content_JA (Rich Text) - 日文内容
```

#### 专栏配置数据库 (Columns)
```
Properties:
- ID (Text) - 专栏ID (reddit, youtube, twitter)
- Status (Select) - 状态: Active, Inactive
- Title_ZH_Hans (Text) - 简体中文标题
- Title_ZH_Hant (Text) - 繁体中文标题
- Title_EN (Text) - 英文标题
- Title_JA (Text) - 日文标题
- Description_ZH_Hans (Text) - 简体中文描述
- Description_ZH_Hant (Text) - 繁体中文描述
- Description_EN (Text) - 英文描述
- Description_JA (Text) - 日文描述
```

#### 专栏账户数据库 (Column Accounts)
```
Properties:
- Name (Text) - 账户名称
- Handle (Text) - 账户handle (可选)
- URL (URL) - 账户链接
- Column (Relation) - 关联专栏
- Order (Number) - 排序
- Status (Select) - 状态: Active, Inactive
```

### 2. GitHub Actions 工作流

#### 文件结构
```
.github/
├── workflows/
│   ├── notion-sync.yml        # 主同步工作流
│   └── manual-sync.yml        # 手动触发同步
├── scripts/
│   ├── notion-client.js       # Notion API 客户端
│   ├── sync-blog.js          # 博客同步脚本
│   ├── sync-columns.js       # 专栏同步脚本
│   └── utils.js              # 工具函数
```

#### 主工作流 (.github/workflows/notion-sync.yml)
```yaml
name: Notion Sync

on:
  schedule:
    - cron: '0 */6 * * *'  # 每6小时执行一次
  workflow_dispatch:       # 手动触发
  repository_dispatch:     # Notion Webhook 触发
    types: [notion-update]

jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
        with:
          token: ${{ secrets.GITHUB_TOKEN }}
          
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Sync from Notion
        env:
          NOTION_API_KEY: ${{ secrets.NOTION_API_KEY }}
          BLOG_DATABASE_ID: ${{ secrets.BLOG_DATABASE_ID }}
          COLUMNS_DATABASE_ID: ${{ secrets.COLUMNS_DATABASE_ID }}
          ACCOUNTS_DATABASE_ID: ${{ secrets.ACCOUNTS_DATABASE_ID }}
        run: |
          node .github/scripts/sync-blog.js
          node .github/scripts/sync-columns.js
          
      - name: Check for changes
        id: verify-changed-files
        run: |
          if [ -n "$(git status --porcelain)" ]; then
            echo "changed=true" >> $GITHUB_OUTPUT
          else
            echo "changed=false" >> $GITHUB_OUTPUT
          fi
          
      - name: Commit changes
        if: steps.verify-changed-files.outputs.changed == 'true'
        run: |
          git config --local user.email "action@github.com"
          git config --local user.name "GitHub Action"
          git add src/config/site.ts
          git commit -m "🤖 Auto-sync from Notion [skip ci]"
          git push
```

### 3. 同步脚本实现

#### 博客同步脚本 (.github/scripts/sync-blog.js)
```javascript
const { Client } = require('@notionhq/client');
const fs = require('fs');
const path = require('path');

const notion = new Client({
  auth: process.env.NOTION_API_KEY,
});

const BLOG_DATABASE_ID = process.env.BLOG_DATABASE_ID;

async function syncBlogPosts() {
  try {
    // 查询已发布的文章
    const response = await notion.databases.query({
      database_id: BLOG_DATABASE_ID,
      filter: {
        property: 'Status',
        select: {
          equals: 'Published'
        }
      },
      sorts: [
        {
          property: 'Date',
          direction: 'descending'
        }
      ]
    });

    const posts = response.results.map(page => ({
      slug: page.properties.Slug.title[0]?.text?.content || '',
      title: {
        'zh-Hans': page.properties.Title.title[0]?.text?.content || '',
        'zh-Hant': page.properties.Description_ZH_Hant.rich_text[0]?.text?.content || '',
        'en': page.properties.Description_EN.rich_text[0]?.text?.content || '',
        'ja': page.properties.Description_JA.rich_text[0]?.text?.content || ''
      },
      description: {
        'zh-Hans': page.properties.Description_ZH_Hans.rich_text[0]?.text?.content || '',
        'zh-Hant': page.properties.Description_ZH_Hant.rich_text[0]?.text?.content || '',
        'en': page.properties.Description_EN.rich_text[0]?.text?.content || '',
        'ja': page.properties.Description_JA.rich_text[0]?.text?.content || ''
      },
      date: page.properties.Date.date?.start || new Date().toISOString(),
      author: page.properties.Author.rich_text[0]?.text?.content || 'TopDigg',
      tags: page.properties.Tags.multi_select?.map(tag => tag.name) || [],
      content: {
        'zh-Hans': page.properties.Content_ZH_Hans.rich_text[0]?.text?.content || '',
        'zh-Hant': page.properties.Content_ZH_Hant.rich_text[0]?.text?.content || '',
        'en': page.properties.Content_EN.rich_text[0]?.text?.content || '',
        'ja': page.properties.Content_JA.rich_text[0]?.text?.content || ''
      }
    }));

    return posts;
  } catch (error) {
    console.error('Error syncing blog posts:', error);
    throw error;
  }
}

module.exports = { syncBlogPosts };
```

#### 专栏同步脚本 (.github/scripts/sync-columns.js)
```javascript
const { Client } = require('@notionhq/client');
const fs = require('fs');
const path = require('path');

const notion = new Client({
  auth: process.env.NOTION_API_KEY,
});

const COLUMNS_DATABASE_ID = process.env.COLUMNS_DATABASE_ID;
const ACCOUNTS_DATABASE_ID = process.env.ACCOUNTS_DATABASE_ID;

async function syncColumns() {
  try {
    // 查询活跃专栏
    const columnsResponse = await notion.databases.query({
      database_id: COLUMNS_DATABASE_ID,
      filter: {
        property: 'Status',
        select: {
          equals: 'Active'
        }
      }
    });

    // 查询所有账户
    const accountsResponse = await notion.databases.query({
      database_id: ACCOUNTS_DATABASE_ID,
      filter: {
        property: 'Status',
        select: {
          equals: 'Active'
        }
      },
      sorts: [
        {
          property: 'Order',
          direction: 'ascending'
        }
      ]
    });

    const columns = {};
    
    for (const columnPage of columnsResponse.results) {
      const columnId = columnPage.properties.ID.title[0]?.text?.content;
      const columnAccounts = accountsResponse.results
        .filter(account => {
          const relation = account.properties.Column?.relation?.[0];
          return relation && relation.id === columnPage.id;
        })
        .map(account => ({
          name: account.properties.Name.title[0]?.text?.content || '',
          handle: account.properties.Handle.rich_text[0]?.text?.content || undefined,
          url: account.properties.URL.url || ''
        }));

      columns[columnId] = {
        id: columnId,
        title: {
          'zh-Hans': columnPage.properties.Title_ZH_Hans.rich_text[0]?.text?.content || '',
          'zh-Hant': columnPage.properties.Title_ZH_Hant.rich_text[0]?.text?.content || '',
          'en': columnPage.properties.Title_EN.rich_text[0]?.text?.content || '',
          'ja': columnPage.properties.Title_JA.rich_text[0]?.text?.content || ''
        },
        description: {
          'zh-Hans': columnPage.properties.Description_ZH_Hans.rich_text[0]?.text?.content || '',
          'zh-Hant': columnPage.properties.Description_ZH_Hant.rich_text[0]?.text?.content || '',
          'en': columnPage.properties.Description_EN.rich_text[0]?.text?.content || '',
          'ja': columnPage.properties.Description_JA.rich_text[0]?.text?.content || ''
        },
        topAccounts: columnAccounts
      };
    }

    return columns;
  } catch (error) {
    console.error('Error syncing columns:', error);
    throw error;
  }
}

module.exports = { syncColumns };
```

### 4. 配置文件更新

#### 主同步脚本 (.github/scripts/update-site-config.js)
```javascript
const fs = require('fs');
const path = require('path');
const { syncBlogPosts } = require('./sync-blog');
const { syncColumns } = require('./sync-columns');

async function updateSiteConfig() {
  try {
    const [blogPosts, columns] = await Promise.all([
      syncBlogPosts(),
      syncColumns()
    ]);

    // 读取当前配置文件
    const configPath = path.join(process.cwd(), 'src/config/site.ts');
    let configContent = fs.readFileSync(configPath, 'utf8');

    // 更新博客文章
    const blogPostsJson = JSON.stringify(blogPosts, null, 6);
    configContent = configContent.replace(
      /posts: \[(.*?)\] as BlogPost\[\],/s,
      `posts: ${blogPostsJson} as BlogPost[],`
    );

    // 更新专栏配置
    const columnsJson = JSON.stringify(columns, null, 4);
    configContent = configContent.replace(
      /columns: \{(.*?)\} as Record<string, ColumnConfig>,/s,
      `columns: ${columnsJson} as Record<string, ColumnConfig>,`
    );

    // 写入更新的配置
    fs.writeFileSync(configPath, configContent);
    
    console.log('✅ Site configuration updated successfully');
  } catch (error) {
    console.error('❌ Error updating site configuration:', error);
    process.exit(1);
  }
}

updateSiteConfig();
```

### 5. 环境变量配置

在GitHub仓库的 Settings > Secrets 中配置：
- `NOTION_API_KEY`: Notion集成的API密钥
- `BLOG_DATABASE_ID`: 博客文章数据库ID  
- `COLUMNS_DATABASE_ID`: 专栏配置数据库ID
- `ACCOUNTS_DATABASE_ID`: 专栏账户数据库ID

### 6. Notion Webhook集成 (可选)

#### Webhook服务器 (可使用Vercel/Netlify Functions)
```javascript
// api/notion-webhook.js
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // 验证Webhook签名 (可选)
    // const signature = req.headers['notion-webhook-signature'];
    
    // 触发GitHub Actions
    await fetch('https://api.github.com/repos/USERNAME/REPO/dispatches', {
      method: 'POST',
      headers: {
        'Authorization': `token ${process.env.GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        event_type: 'notion-update'
      })
    });

    res.status(200).json({ message: 'Sync triggered' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
```

### 7. 实施步骤

1. **创建Notion数据库**：按照设计创建3个数据库
2. **设置Notion集成**：创建集成并获取API密钥
3. **配置GitHub Secrets**：设置必要的环境变量
4. **部署同步脚本**：创建并测试同步脚本
5. **设置自动化**：配置GitHub Actions工作流
6. **测试完整流程**：验证端到端同步
7. **设置Webhook**（可选）：实现实时同步

### 8. 监控和错误处理

- GitHub Actions执行日志监控
- 同步失败时的邮件通知
- 数据验证和备份机制
- 回滚机制（通过Git历史）

这个方案提供了完整的Notion到GitHub的自动化内容管理流程，支持多语言内容和实时更新。