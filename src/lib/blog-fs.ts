import { BlogPost } from '@/config/site';

export interface BlogFileData {
  slug: string;
  locale: string;
  title: string;
  description: string;
  content: string;
  date: string;
  author: string;
  tags: string[];
}

export class BlogFileSystem {
  private static instance: BlogFileSystem;
  private cache: Map<string, BlogPost[]> = new Map();

  public static getInstance(): BlogFileSystem {
    if (!BlogFileSystem.instance) {
      BlogFileSystem.instance = new BlogFileSystem();
    }
    return BlogFileSystem.instance;
  }

  async getPosts(): Promise<BlogPost[]> {
    if (this.cache.has('posts')) {
      return this.cache.get('posts')!;
    }

    try {
      // 在浏览器环境中，我们使用预构建的内容
      // 在实际部署时，可以通过构建脚本生成这些内容
      const posts = this.getStaticPosts();
      this.cache.set('posts', posts);
      return posts;
    } catch (error) {
      console.warn('Failed to load blog posts from file system, returning empty array:', error);
      return [];
    }
  }

  async getPostBySlug(slug: string): Promise<BlogPost | undefined> {
    const posts = await this.getPosts();
    return posts.find(post => post.slug === slug);
  }

  private getStaticPosts(): BlogPost[] {
    // 这里返回预构建的静态内容
    // 在实际项目中，可以通过构建脚本从content/blog目录读取文件
    return [
      {
        slug: "web-traffic-opportunities-2025",
        title: {
          "zh-Hans": "2025年如何系统性挖掘Web流量的商业机会",
          "zh-Hant": "2025年如何系統性挖掘Web流量的商業機會",
          "en": "How to Systematically Discover Web Traffic Business Opportunities in 2025",
          "ja": "2025年にWebトラフィックのビジネスチャンスを体系的に発掘する方法"
        },
        description: {
          "zh-Hans": "从渠道分析到产品验证，系统性拆解流量->用户->收入的路径。",
          "zh-Hant": "從渠道分析到產品驗證，系統性拆解流量->用戶->收入的路徑。",
          "en": "From channel analysis to product validation, systematically break down the traffic → users → revenue path.",
          "ja": "チャネル分析から製品検証まで、トラフィック→ユーザー→収益の経路を体系的に分解。"
        },
        date: "2024-12-15T10:00:00.000Z",
        author: "TopDigg",
        tags: ["增长", "SEO", "流量变现"],
        content: {
          "zh-Hans": "在这篇文章中，我们将从渠道地图、关键词意图、内容结构化与转化漏斗四个层面，构建一套可执行的增长手册...",
          "zh-Hant": "在這篇文章中，我們將從渠道地圖、關鍵詞意圖、內容結構化與轉化漏斗四個層面，構建一套可執行的增長手冊...",
          "en": "In this article, we will build an actionable growth handbook from four aspects: channel mapping, keyword intent, content structuring, and conversion funnels...",
          "ja": "この記事では、チャネルマップ、キーワード意図、コンテンツ構造化、コンバージョンファネルの4つの側面から、実行可能な成長ハンドブックを構築します..."
        }
      },
      {
        slug: "seo-content-framework",
        title: {
          "zh-Hans": "实战：一套可复用的SEO内容生产框架",
          "zh-Hant": "實戰：一套可複用的SEO內容生產框架",
          "en": "In Practice: A Reusable SEO Content Production Framework",
          "ja": "実践：再利用可能なSEOコンテンツ制作フレームワーク"
        },
        description: {
          "zh-Hans": "Topic集群、内链拓扑、结构化数据与复盘机制。",
          "zh-Hant": "Topic集群、內鏈拓撲、結構化數據與複盤機制。",
          "en": "Topic clusters, internal link topology, structured data and review mechanisms.",
          "ja": "トピッククラスター、内部リンクトポロジー、構造化データとレビューメカニズム。"
        },
        date: "2024-12-10T08:00:00.000Z",
        author: "TopDigg",
        tags: ["SEO", "内容策略"],
        content: {
          "zh-Hans": "本文提供一个轻量但有效的SEO内容框架，包含选题、写作SOP、结构化数据与质量评估...",
          "zh-Hant": "本文提供一個輕量但有效的SEO內容框架，包含選題、寫作SOP、結構化數據與質量評估...",
          "en": "This article provides a lightweight but effective SEO content framework, including topic selection, writing SOPs, structured data and quality assessment...",
          "ja": "この記事では、トピック選択、執筆SOP、構造化データ、品質評価を含む軽量で効果的なSEOコンテンツフレームワークを提供します..."
        }
      }
    ];
  }
}

export const blogFileSystem = BlogFileSystem.getInstance();