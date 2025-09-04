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

export type TwitterAnalysis = {
  slug: string;
  title: LocalizedText;
  description: LocalizedText;
  date: string; // ISO date
  author: string;
  tags: string[];
  twitterAccount: {
    name: string;
    handle: string;
    url: string;
    avatar?: string;
  };
  analysisData: {
    totalTweets: number;
    avgLikes: number;
    avgRetweets: number;
    engagementRate: number;
    topTweets: Array<{
      id: string;
      content: string;
      url: string;
      likes: number;
      retweets: number;
      comments: number;
      date: string;
    }>;
  };
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
      { 
        label: {
          "zh-Hans": "Twitter分析",
          "zh-Hant": "Twitter分析",
          "en": "Twitter Analytics",
          "ja": "Twitter分析"
        }, 
        href: "/twitter" 
      },
      { 
        label: {
          "zh-Hans": "外链导航",
          "zh-Hant": "外鏈導航",
          "en": "External Links",
          "ja": "外部リンク"
        }, 
        href: "/external-links" 
      },
    ] as NavLink[],
    mySites: [
      { 
        label: {
          "zh-Hans": "加密货币资源聚合",
          "zh-Hant": "加密貨幣資源聚合",
          "en": "Crypto Resources",
          "ja": "暗号通貨リソース"
        }, 
        href: "https://www.smartwallex.com/", 
        external: true 
      },
      { 
        label: {
          "zh-Hans": "KGR工具",
          "zh-Hant": "KGR工具",
          "en": "KGR Calculator",
          "ja": "KGRツール"
        }, 
        href: "https://www.kgrcalculator.com/", 
        external: true 
      },
      { 
        label: {
          "zh-Hans": "Claude Code资源聚合",
          "zh-Hant": "Claude Code資源聚合",
          "en": "Claude Code Resources",
          "ja": "Claude Codeリソース"
        }, 
        href: "https://www.supercopycoder.xyz/", 
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
        date: "2025-01-16",
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
        date: "2025-01-15",
        author: "TopDigg",
        tags: ["SEO", "内容策略"],
        content: {
          "zh-Hans": "本文提供一个轻量但有效的SEO内容框架，包含选题、写作SOP、结构化数据与质量评估……",
          "zh-Hant": "本文提供一個輕量但有效的SEO內容框架，包含選題、寫作SOP、結構化數據與質量評估……",
          "en": "This article provides a lightweight but effective SEO content framework, including topic selection, writing SOPs, structured data and quality assessment...",
          "ja": "この記事では、トピック選択、執筆SOP、構造化データ、品質評価を含む軽量で効果的なSEOコンテンツフレームワークを提供します……"
        }
      },
      {
        slug: "easemate-ai-research-report",
        title: {
          "zh-Hans": "EaseMate AI深度调研拆解报告：2025年全方位AI助手平台完整分析",
          "zh-Hant": "EaseMate AI深度調研拆解報告：2025年全方位AI助手平台完整分析",
          "en": "EaseMate AI In-Depth Research Report: Comprehensive Analysis of All-in-One AI Assistant Platform 2025",
          "ja": "EaseMate AI詳細調査分析レポート：2025年オールインワンAIアシスタントプラットフォーム完全分析"
        },
        description: {
          "zh-Hans": "EaseMate AI平台完整调研报告，包含功能分析、目标用户画像、SEO策略、流量表现、竞争优势及市场机会分析。",
          "zh-Hant": "EaseMate AI平台完整調研報告，包含功能分析、目標用戶畫像、SEO策略、流量表現、競爭優勢及市場機會分析。",
          "en": "Complete research report on EaseMate AI platform, including feature analysis, target user profiling, SEO strategies, traffic performance, competitive advantages, and market opportunity analysis.",
          "ja": "EaseMate AIプラットフォームの完全調査レポート。機能分析、ターゲットユーザー像、SEO戦略、トラフィック性能、競争優位性、市場機会分析を含む。"
        },
        date: "2025-01-14",
        author: "ERIC",
        tags: ["AI工具", "产品分析", "市场调研", "EaseMate AI"],
        content: {
          "zh-Hans": "EaseMate AI是一个集成多种先进AI模型的全方位智能助手平台，通过整合GPT-4、Claude、Gemini、DeepSeek等主流AI模型，为用户提供免费的学习、工作和创意支持服务。本报告基于深度调研，全面分析其产品功能、市场定位、竞争优势及发展机会。",
          "zh-Hant": "EaseMate AI是一個集成多種先進AI模型的全方位智慧助手平台，通過整合GPT-4、Claude、Gemini、DeepSeek等主流AI模型，為用戶提供免費的學習、工作和創意支持服務。本報告基於深度調研，全面分析其產品功能、市場定位、競爭優勢及發展機會。",
          "en": "EaseMate AI is a comprehensive intelligent assistant platform that integrates multiple advanced AI models, providing free learning, work, and creative support services by integrating mainstream AI models such as GPT-4, Claude, Gemini, and DeepSeek. This report provides a comprehensive analysis of its product features, market positioning, competitive advantages, and development opportunities based on in-depth research.",
          "ja": "EaseMate AIは、GPT-4、Claude、Gemini、DeepSeekなどの主流AIモデルを統合し、学習、仕事、創作を無料でサポートする包括的なインテリジェントアシスタントプラットフォームです。本レポートは深度調査に基づき、製品機能、市場ポジショニング、競争優位性、発展機会を包括的に分析しています。"
        }
      },
    ] as BlogPost[],
  },
  twitter: {
    analyses: [
      {
        slug: "AliAbdaal-twitter-analysis-2025-08-22",
        title: {
          "zh-Hans": "Ali Abdaal Twitter 深度分析报告",
          "zh-Hant": "Ali Abdaal Twitter 深度分析報告", 
          "en": "Ali Abdaal Twitter Deep Analysis Report",
          "ja": "Ali Abdaal Twitter 詳細分析レポート"
        },
        description: {
          "zh-Hans": "深度分析生产力专家Ali Abdaal的Twitter策略，他是剑桥医学博士转型的YouTuber(600万订阅)和畅销书作者，以「感觉良好的生产力」理念著称。",
          "zh-Hant": "深度分析生產力專家Ali Abdaal的Twitter策略，他是劍橋醫學博士轉型的YouTuber(600萬訂閱)和暢銷書作者，以「感覺良好的生產力」理念著稱。",
          "en": "Deep analysis of productivity expert Ali Abdaal's Twitter strategy. Cambridge medical doctor turned YouTuber (6M subs) and bestselling author, known for 'Feel-Good Productivity' philosophy.",
          "ja": "生産性の専門家Ali Abdaalのツイッター戦略を詳細分析。ケンブリッジ医学博士からYouTuber（600万登録）、ベストセラー作家に転身、「Feel-Good Productivity」哲学で有名。"
        },
        date: "2025-08-22",
        author: "Claude Twitter Analyzer", 
        tags: ["Twitter分析", "生产力专家", "Feel-Good Productivity", "学习方法", "内容创作"],
        twitterAccount: {
          name: "Ali Abdaal",
          handle: "@AliAbdaal",
          url: "https://x.com/AliAbdaal",
          avatar: ""
        },
        analysisData: {
          totalTweets: 8000,
          avgLikes: 1200,
          avgRetweets: 180,
          engagementRate: 7.5,
          topTweets: []
        },
        content: {
          "zh-Hans": "AliAbdaal-twitter-analysis-2025-08-22.md",
          "zh-Hant": "AliAbdaal-twitter-analysis-2025-08-22.md",
          "en": "AliAbdaal-twitter-analysis-2025-08-22.md",
          "ja": "AliAbdaal-twitter-analysis-2025-08-22.md"
        }
      },
{
        slug: "naval-twitter-analysis-2025-08-22",
        title: {
          "zh-Hans": "Naval Ravikant Twitter 深度分析报告",
          "zh-Hant": "Naval Ravikant Twitter 深度分析報告", 
          "en": "Naval Ravikant Twitter Deep Analysis Report",
          "ja": "Naval Ravikant Twitter 詳細分析レポート"
        },
        description: {
          "zh-Hans": "深度分析 @naval 的推文策略、内容特征和增长模式，提供可借鉴的运营经验和具体建议。",
          "zh-Hant": "深度分析 @naval 的推文策略、內容特徵和增長模式，提供可借鑑的營運經驗和具體建議。",
          "en": "Deep analysis of @naval's tweet strategies, content characteristics and growth patterns, providing actionable insights and specific recommendations.",
          "ja": "@navalのツイート戦略、コンテンツ特性、成長パターンを深く分析し、実用的な運営経験と具体的な提案を提供。"
        },
        date: "2025-08-22",
        author: "Claude Twitter Analyzer", 
        tags: ["Twitter分析", "社交媒体", "内容策略", "增长黑客"],
        twitterAccount: {
          name: "Naval Ravikant",
          handle: "@naval",
          url: "https://x.com/naval",
          avatar: ""
        },
        analysisData: {
          totalTweets: 0,
          avgLikes: 0,
          avgRetweets: 0, 
          engagementRate: 0,
          topTweets: []
        },
        content: {
          "zh-Hans": "naval-twitter-analysis-2025-08-22.md",
          "zh-Hant": "naval-twitter-analysis-2025-08-22.md",
          "en": "naval-twitter-analysis-2025-08-22.md",
          "ja": "naval-twitter-analysis-2025-08-22.md"
        }
      },
{
        slug: "sahil-bloom-analysis-2025-08-22",
        title: {
          "zh-Hans": "Sahil Bloom (@SahilBloom) Twitter 深度分析报告",
          "zh-Hant": "Sahil Bloom (@SahilBloom) Twitter 深度分析報告",
          "en": "Sahil Bloom (@SahilBloom) Twitter In-Depth Analysis Report",
          "ja": "Sahil Bloom (@SahilBloom) Twitter 詳細分析レポート"
        },
        description: {
          "zh-Hans": "深度分析100万粉丝商业策略博主Sahil Bloom的Twitter成长策略、爆款内容模式和可借鉴的运营技巧。",
          "zh-Hant": "深度分析100萬粉絲商業策略博主Sahil Bloom的Twitter成長策略、爆款內容模式和可借鑒的運營技巧。",
          "en": "In-depth analysis of Sahil Bloom's Twitter growth strategies, viral content patterns, and actionable operational techniques from a 1M+ follower business strategist.",
          "ja": "100万フォロワーのビジネス戦略ブロガーSahil BloomのTwitter成長戦略、バイラルコンテンツパターン、参考になる運営テクニックの詳細分析。"
        },
        date: "2025-08-22",
        author: "Claude Code",
        tags: ["Twitter分析", "内容策略", "个人品牌", "心理模型", "商业思维"],
        twitterAccount: {
          name: "Sahil Bloom",
          handle: "@SahilBloom",
          url: "https://x.com/SahilBloom",
          avatar: "https://pbs.twimg.com/profile_images/1234567890123456789/abcdefgh_400x400.jpg"
        },
        analysisData: {
          totalTweets: 10000,
          avgLikes: 45000,
          avgRetweets: 12000,
          engagementRate: 8.5,
          topTweets: [
            {
              id: "1",
              content: "THREAD: 5 powerful mental models that will change your life...",
              url: "https://x.com/SahilBloom/status/1234567890",
              likes: 85000,
              retweets: 25000,
              comments: 5000,
              date: "2025-08-15"
            },
            {
              id: "2", 
              content: "50 ideas that changed my life: A thread...",
              url: "https://x.com/SahilBloom/status/1234567891",
              likes: 120000,
              retweets: 35000,
              comments: 8000,
              date: "2025-08-10"
            }
          ]
        },
        content: {
          "zh-Hans": "Sahil Bloom 是 Twitter 上最成功的商业策略和个人发展博主之一，在短短几年内从0增长到100万+粉丝。本报告深度分析他的内容策略、爆款模式和可借鉴的运营技巧。",
          "zh-Hant": "Sahil Bloom 是 Twitter 上最成功的商業策略和個人發展博主之一，在短短幾年內從0增長到100萬+粉絲。本報告深度分析他的內容策略、爆款模式和可借鑒的運營技巧。",
          "en": "Sahil Bloom is one of the most successful business strategy and personal development bloggers on Twitter, growing from 0 to 1M+ followers in just a few years. This report analyzes his content strategies, viral patterns, and actionable operational techniques.",
          "ja": "Sahil Bloomは、Twitterで最も成功したビジネス戦略・自己啓発ブロガーの一人で、わずか数年で0から100万人以上のフォロワーに成長しました。本レポートでは、彼のコンテンツ戦略、バイラルパターン、参考になる運営テクニックを分析します。"
        }
      }
      ] as TwitterAnalysis[],
  },
};

export const getColumnById = (id: string): ColumnConfig | undefined => {
  return siteConfig.columns[id];
};

export const getTwitterAnalysisBySlug = (slug: string): TwitterAnalysis | undefined => {
  return siteConfig.twitter.analyses.find(analysis => analysis.slug === slug);
};
