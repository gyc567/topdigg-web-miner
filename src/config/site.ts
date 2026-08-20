export type LocalizedText = {
  "zh-Hans": string;
  "zh-Hant": string;
  en: string;
  ja: string;
  vi: string;
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
  categories: string[];
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
  baseUrl: "https://topdigg.com",
  nav: {
    main: [
      { 
        label: {
          "zh-Hans": "博客",
          "zh-Hant": "博客",
          "en": "Blog",
          "ja": "ブログ",
          "vi": "Blog"
        }, 
        href: "/blog" 
      },
      { 
        label: {
          "zh-Hans": "Reddit专栏",
          "zh-Hant": "Reddit專欄",
          "en": "Reddit Column",
          "ja": "Redditコラム",
          "vi": "Chuyên mục Reddit"
        }, 
        href: "/columns/reddit" 
      },
      { 
        label: {
          "zh-Hans": "YouTube专栏",
          "zh-Hant": "YouTube專欄",
          "en": "YouTube Column",
          "ja": "YouTubeコラム",
          "vi": "Chuyên mục YouTube"
        }, 
        href: "/columns/youtube" 
      },
      { 
        label: {
          "zh-Hans": "Twitter专栏",
          "zh-Hant": "Twitter專欄",
          "en": "Twitter Column",
          "ja": "Twitterコラム",
          "vi": "Chuyên mục Twitter"
        }, 
        href: "/columns/twitter" 
      },
      { 
        label: {
          "zh-Hans": "Twitter分析",
          "zh-Hant": "Twitter分析",
          "en": "Twitter Analytics",
          "ja": "Twitter分析",
          "vi": "Phân tích Twitter"
        }, 
        href: "/twitter" 
      },
      { 
        label: {
          "zh-Hans": "外链导航",
          "zh-Hant": "外鏈導航",
          "en": "External Links",
          "ja": "外部リンク",
          "vi": "Liên kết ngoài"
        }, 
        href: "/external-links"
      },
      {
        label: {
          "zh-Hans": "关于我们",
          "zh-Hant": "關於我們",
          "en": "About",
          "ja": "私たちについて",
          "vi": "Về chúng tôi"
        },
        href: "/about"
      },
    ] as NavLink[],
    mySites: [
      { 
        label: {
          "zh-Hans": "KGR工具",
          "zh-Hant": "KGR工具",
          "en": "KGR Calculator",
          "ja": "KGRツール",
          "vi": "Công cụ KGR"
        }, 
        href: "https://www.kgrcalculator.com/", 
        external: true 
      },
      { 
        label: {
          "zh-Hans": "Claude Code资源聚合",
          "zh-Hant": "Claude Code資源聚合",
          "en": "Claude Code Resources",
          "ja": "Claude Codeリソース",
          "vi": "Tài nguyên Claude Code"
        }, 
        href: "https://www.githot.xyz/", 
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
        "ja": "Redditコラム",
        "vi": "Chuyên mục Reddit"
      },
      description: {
        "zh-Hans": "挖掘Reddit社区的热门趋势与商业机会。",
        "zh-Hant": "挖掘Reddit社群的熱門趨勢與商業機會。",
        "en": "Discover trending topics and business opportunities in Reddit communities.",
        "ja": "Redditコミュニティのトレンドとビジネスチャンスを発掘。",
        "vi": "Khám phá xu hướng nổi bật và cơ hội kinh doanh trong cộng đồng Reddit."
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
        "ja": "YouTubeコラム",
        "vi": "Chuyên mục YouTube"
      },
      description: {
        "zh-Hans": "追踪内容增长高手，学习视频引流打法。",
        "zh-Hant": "追蹤內容增長高手，學習影片引流打法。",
        "en": "Follow content growth experts and learn video marketing strategies.",
        "ja": "コンテンツ成長の専門家をフォローし、動画マーケティング戦略を学ぶ。",
        "vi": "Theo dõi các chuyên gia tăng trưởng nội dung và học chiến lược tiếp thị video."
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
        "ja": "Twitterコラム",
        "vi": "Chuyên mục Twitter"
      },
      description: {
        "zh-Hans": "关注增长黑客与创业者，捕捉流量风向标。",
        "zh-Hant": "關注增長黑客與創業者，捕捉流量風向標。",
        "en": "Follow growth hackers and entrepreneurs, catch traffic trends.",
        "ja": "グロースハッカーと起業家をフォローし、トラフィックトレンドをキャッチ。",
        "vi": "Theo dõi các growth hacker và doanh nhân, nắm bắt xu hướng lưu lượng truy cập."
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
  twitter: {
    analyses: [
      {
        slug: "AliAbdaal-twitter-analysis-2025-08-22",
        title: {
          "zh-Hans": "Ali Abdaal Twitter 深度分析报告",
          "zh-Hant": "Ali Abdaal Twitter 深度分析報告", 
          "en": "Ali Abdaal Twitter Deep Analysis Report",
          "ja": "Ali Abdaal Twitter 詳細分析レポート",
          "vi": "Báo cáo phân tích chuyên sâu Twitter của Ali Abdaal"
        },
        description: {
          "zh-Hans": "深度分析生产力专家Ali Abdaal的Twitter策略，他是剑桥医学博士转型的YouTuber(600万订阅)和畅销书作者，以「感觉良好的生产力」理念著称。",
          "zh-Hant": "深度分析生產力專家Ali Abdaal的Twitter策略，他是劍橋醫學博士轉型的YouTuber(600萬訂閱)和暢銷書作者，以「感覺良好的生產力」理念著稱。",
          "en": "Deep analysis of productivity expert Ali Abdaal's Twitter strategy. Cambridge medical doctor turned YouTuber (6M subs) and bestselling author, known for 'Feel-Good Productivity' philosophy.",
          "ja": "生産性の専門家Ali Abdaalのツイッター戦略を詳細分析。ケンブリッジ医学博士からYouTuber（600万登録）、ベストセラー作家に転身、「Feel-Good Productivity」哲学で有名。",
          "vi": "Phân tích chuyên sâu chiến lược Twitter của chuyên gia năng suất Ali Abdaal — bác sĩ y khoa Cambridge chuyển thành YouTuber (6 triệu người đăng ký) và tác giả sách bán chạy, nổi tiếng với triết lý 'Feel-Good Productivity'."
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
          "ja": "AliAbdaal-twitter-analysis-2025-08-22.md",
          "vi": "AliAbdaal-twitter-analysis-2025-08-22.md"
        }
      },
{
        slug: "naval-twitter-analysis-2025-08-22",
        title: {
          "zh-Hans": "Naval Ravikant Twitter 深度分析报告",
          "zh-Hant": "Naval Ravikant Twitter 深度分析報告", 
          "en": "Naval Ravikant Twitter Deep Analysis Report",
          "ja": "Naval Ravikant Twitter 詳細分析レポート",
          "vi": "Báo cáo phân tích chuyên sâu Twitter của Naval Ravikant"
        },
        description: {
          "zh-Hans": "深度分析 @naval 的推文策略、内容特征和增长模式，提供可借鉴的运营经验和具体建议。",
          "zh-Hant": "深度分析 @naval 的推文策略、內容特徵和增長模式，提供可借鑑的營運經驗和具體建議。",
          "en": "Deep analysis of @naval's tweet strategies, content characteristics and growth patterns, providing actionable insights and specific recommendations.",
          "ja": "@navalのツイート戦略、コンテンツ特性、成長パターンを深く分析し、実用的な運営経験と具体的な提案を提供。",
          "vi": "Phân tích chuyên sâu chiến lược tweet, đặc điểm nội dung và mô hình tăng trưởng của @naval, cung cấp kinh nghiệm vận hành và đề xuất cụ thể."
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
          "ja": "naval-twitter-analysis-2025-08-22.md",
          "vi": "naval-twitter-analysis-2025-08-22.md"
        }
      },
{
        slug: "sahil-bloom-analysis-2025-08-22",
        title: {
          "zh-Hans": "Sahil Bloom (@SahilBloom) Twitter 深度分析报告",
          "zh-Hant": "Sahil Bloom (@SahilBloom) Twitter 深度分析報告",
          "en": "Sahil Bloom (@SahilBloom) Twitter In-Depth Analysis Report",
          "ja": "Sahil Bloom (@SahilBloom) Twitter 詳細分析レポート",
          "vi": "Báo cáo phân tích chuyên sâu Twitter của Sahil Bloom (@SahilBloom)"
        },
        description: {
          "zh-Hans": "深度分析100万粉丝商业策略博主Sahil Bloom的Twitter成长策略、爆款内容模式和可借鉴的运营技巧。",
          "zh-Hant": "深度分析100萬粉絲商業策略博主Sahil Bloom的Twitter成長策略、爆款內容模式和可借鑒的運營技巧。",
          "en": "In-depth analysis of Sahil Bloom's Twitter growth strategies, viral content patterns, and actionable operational techniques from a 1M+ follower business strategist.",
          "ja": "100万フォロワーのビジネス戦略ブロガーSahil BloomのTwitter成長戦略、バイラルコンテンツパターン、参考になる運営テクニックの詳細分析。",
          "vi": "Phân tích chuyên sâu chiến lược tăng trưởng Twitter, mô hình nội dung lan truyền và kỹ thuật vận hành của nhà chiến lược kinh doanh 1 triệu+ người theo dõi Sahil Bloom."
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
          "ja": "Sahil Bloomは、Twitterで最も成功したビジネス戦略・自己啓発ブロガーの一人で、わずか数年で0から100万人以上のフォロワーに成長しました。本レポートでは、彼のコンテンツ戦略、バイラルパターン、参考になる運営テクニックを分析します。",
          "vi": "Sahil Bloom là một trong những blogger chiến lược kinh doanh và phát triển cá nhân thành công nhất trên Twitter, tăng từ 0 lên hơn 1 triệu người theo dõi chỉ trong vài năm. Báo cáo này phân tích chiến lược nội dung, mô hình lan truyền và kỹ thuật vận hành của anh ấy."
        }
      },
      {
        slug: "yangyi-twitter-analysis-2026-04-16",
        title: {
          "zh-Hans": "@yangyi 完整 Twitter 账号分析报告",
          "zh-Hant": "@yangyi 完整 Twitter 帳號分析報告",
          "en": "@yangyi Complete Twitter Account Analysis Report",
          "ja": "@yangyi Twitter アカウント完全分析レポート",
          "vi": "Báo cáo phân tích đầy đủ tài khoản Twitter của @yangyi"
        },
        description: {
          "zh-Hans": "深度分析 @yangyi 的Twitter运营策略：老账号转型、AI赛道卡位、人设打造与产品闭环的完整方法论。",
          "zh-Hant": "深度分析 @yangyi 的Twitter運營策略：老帳號轉型、AI賽道卡位、人設打造與產品閉環的完整方法論。",
          "en": "Deep analysis of @yangyi's Twitter strategy: old account pivot, AI niche positioning, personal branding, and product loop methodology.",
          "ja": "@yangyiのTwitter運營戦略の深度分析：古いアカウントの转型、AI賽道のポジショニング、パーソナルブランディング、制品クローズループの完整方法論。",
          "vi": "Phân tích chuyên sâu chiến lược Twitter của @yangyi: chuyển đổi tài khoản cũ, định vị lĩnh vực AI, xây dựng thương hiệu cá nhân và vòng khép kín sản phẩm."
        },
        date: "2026-04-16",
        author: "Claude Twitter Analyzer",
        tags: ["Twitter分析", "人机协同", "AI工具", "个人IP", "牛马AI", "Reverb Marketing", "内容策略", "产品闭环"],
        twitterAccount: {
          name: "Yangyi",
          handle: "@yangyi",
          url: "https://x.com/yangyi",
          avatar: ""
        },
        analysisData: {
          totalTweets: 5000,
          avgLikes: 500,
          avgRetweets: 80,
          engagementRate: 5.5,
          topTweets: []
        },
        content: {
          "zh-Hans": "yangyi-twitter-analysis-2026-04-16.md",
          "zh-Hant": "yangyi-twitter-analysis-2026-04-16.md",
          "en": "yangyi-twitter-analysis-2026-04-16.md",
          "ja": "yangyi-twitter-analysis-2026-04-16.md",
          "vi": "yangyi-twitter-analysis-2026-04-16.md"
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
