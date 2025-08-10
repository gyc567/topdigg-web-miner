export type LocalizedText = {
  "zh-Hans": string;
  "zh-Hant": string;
  en: string;
  ja: string;
};

export type NavLink = {
  label: LocalizedText;
  href: string;
  external?: boolean;
};

export type Account = {
  name: string;
  handle?: string;
  url: string;
  avatar?: string;
};

export type ColumnConfig = {
  id: string;
  title: LocalizedText;
  description: LocalizedText;
  topAccounts: Account[];
};

export type BlogPost = {
  slug: string;
  title: LocalizedText;
  description: LocalizedText;
  date: string; // ISO date
  author: string;
  tags: string[];
  content: LocalizedText;
};

export const siteConfig = {
  siteName: "TopDigg",
  baseUrl: "https://topdigg.example.com",
  nav: {
    main: [
      { 
        label: {
          "zh-Hans": "博客",
          "zh-Hant": "博客",
          "en": "Blog",
          "ja": "ブログ"
        }, 
        href: "/blog" 
      },
      { 
        label: {
          "zh-Hans": "Reddit专栏",
          "zh-Hant": "Reddit專欄",
          "en": "Reddit Column",
          "ja": "Redditコラム"
        }, 
        href: "/columns/reddit" 
      },
      { 
        label: {
          "zh-Hans": "YouTube专栏",
          "zh-Hant": "YouTube專欄",
          "en": "YouTube Column",
          "ja": "YouTubeコラム"
        }, 
        href: "/columns/youtube" 
      },
      { 
        label: {
          "zh-Hans": "Twitter专栏",
          "zh-Hant": "Twitter專欄",
          "en": "Twitter Column",
          "ja": "Twitterコラム"
        }, 
        href: "/columns/twitter" 
      },
    ] as NavLink[],
    mySites: [
      { 
        label: {
          "zh-Hans": "我的网站A",
          "zh-Hant": "我的網站A",
          "en": "My Site A",
          "ja": "私のサイトA"
        }, 
        href: "https://example.com", 
        external: true 
      },
      { 
        label: {
          "zh-Hans": "我的网站B",
          "zh-Hant": "我的網站B",
          "en": "My Site B",
          "ja": "私のサイトB"
        }, 
        href: "https://example.org", 
        external: true 
      },
    ] as NavLink[],
  },
  columns: {
    reddit: {
      id: "reddit",
      title: {
        "zh-Hans": "Reddit专栏",
        "zh-Hant": "Reddit專欄",
        "en": "Reddit Column",
        "ja": "Redditコラム"
      },
      description: {
        "zh-Hans": "挖掘Reddit社区的热门趋势与商业机会。",
        "zh-Hant": "挖掘Reddit社群的熱門趨勢與商業機會。",
        "en": "Discover trending topics and business opportunities in Reddit communities.",
        "ja": "Redditコミュニティのトレンドとビジネスチャンスを発掘。"
      },
      topAccounts: [
        { name: "r/Entrepreneur", url: "https://www.reddit.com/r/Entrepreneur/" },
        { name: "r/SideProject", url: "https://www.reddit.com/r/SideProject/" },
        { name: "r/marketing", url: "https://www.reddit.com/r/marketing/" },
        { name: "r/startups", url: "https://www.reddit.com/r/startups/" },
        { name: "r/SEO", url: "https://www.reddit.com/r/SEO/" },
      ],
    } as ColumnConfig,
    youtube: {
      id: "youtube",
      title: {
        "zh-Hans": "YouTube专栏",
        "zh-Hant": "YouTube專欄",
        "en": "YouTube Column",
        "ja": "YouTubeコラム"
      },
      description: {
        "zh-Hans": "追踪内容增长高手，学习视频引流打法。",
        "zh-Hant": "追蹤內容增長高手，學習影片引流打法。",
        "en": "Follow content growth experts and learn video marketing strategies.",
        "ja": "コンテンツ成長の専門家をフォローし、動画マーケティング戦略を学ぶ。"
      },
      topAccounts: [
        { name: "Ali Abdaal", url: "https://www.youtube.com/@aliabdaal" },
        { name: "HubSpot", url: "https://www.youtube.com/@hubspot" },
        { name: "Ahrefs", url: "https://www.youtube.com/@AhrefsCom" },
        { name: "Veritasium", url: "https://www.youtube.com/@veritasium" },
        { name: "Kurzgesagt", url: "https://www.youtube.com/@kurzgesagt" },
      ],
    } as ColumnConfig,
    twitter: {
      id: "twitter",
      title: {
        "zh-Hans": "Twitter专栏",
        "zh-Hant": "Twitter專欄",
        "en": "Twitter Column",
        "ja": "Twitterコラム"
      },
      description: {
        "zh-Hans": "关注增长黑客与创业者，捕捉流量风向标。",
        "zh-Hant": "關注增長黑客與創業者，捕捉流量風向標。",
        "en": "Follow growth hackers and entrepreneurs, catch traffic trends.",
        "ja": "グロースハッカーと起業家をフォローし、トラフィックトレンドをキャッチ。"
      },
      topAccounts: [
        { name: "Sahil Bloom", handle: "@SahilBloom", url: "https://x.com/SahilBloom" },
        { name: "Julian Shapiro", handle: "@Julian", url: "https://x.com/Julian" },
        { name: "Brian Lovin", handle: "@brian_lovin", url: "https://x.com/brian_lovin" },
        { name: "Lenny Rachitsky", handle: "@lennysan", url: "https://x.com/lennysan" },
        { name: "Andrew Chen", handle: "@andrewchen", url: "https://x.com/andrewchen" },
      ],
    } as ColumnConfig,
  } as Record<string, ColumnConfig>,
  blog: {
    posts: [
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
        date: new Date().toISOString(),
        author: "TopDigg",
        tags: ["增长", "SEO", "流量变现"],
        content: {
          "zh-Hans": "在这篇文章中，我们将从渠道地图、关键词意图、内容结构化与转化漏斗四个层面，构建一套可执行的增长手册……",
          "zh-Hant": "在這篇文章中，我們將從渠道地圖、關鍵詞意圖、內容結構化與轉化漏斗四個層面，構建一套可執行的增長手冊……",
          "en": "In this article, we will build an actionable growth handbook from four aspects: channel mapping, keyword intent, content structuring, and conversion funnels...",
          "ja": "この記事では、チャネルマップ、キーワード意図、コンテンツ構造化、コンバージョンファネルの4つの側面から、実行可能な成長ハンドブックを構築します……"
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
        date: new Date().toISOString(),
        author: "TopDigg",
        tags: ["SEO", "内容策略"],
        content: {
          "zh-Hans": "本文提供一个轻量但有效的SEO内容框架，包含选题、写作SOP、结构化数据与质量评估……",
          "zh-Hant": "本文提供一個輕量但有效的SEO內容框架，包含選題、寫作SOP、結構化數據與質量評估……",
          "en": "This article provides a lightweight but effective SEO content framework, including topic selection, writing SOPs, structured data and quality assessment...",
          "ja": "この記事では、トピック選択、執筆SOP、構造化データ、品質評価を含む軽量で効果的なSEOコンテンツフレームワークを提供します……"
        }
      },
    ] as BlogPost[],
  },
};

export const getColumnById = (id: string): ColumnConfig | undefined => {
  return siteConfig.columns[id];
};
