export type NavLink = {
  label: string;
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
  title: string;
  description: string;
  topAccounts: Account[];
};

export type BlogPost = {
  slug: string;
  title: string;
  description: string;
  date: string; // ISO date
  author: string;
  tags: string[];
  content: string;
};

export const siteConfig = {
  siteName: "TopDigg",
  baseUrl: "https://topdigg.example.com",
  nav: {
    main: [
      { label: "博客", href: "/blog" },
      { label: "Reddit专栏", href: "/columns/reddit" },
      { label: "YouTube专栏", href: "/columns/youtube" },
      { label: "Twitter专栏", href: "/columns/twitter" },
    ] as NavLink[],
    mySites: [
      { label: "我的网站A", href: "https://example.com", external: true },
      { label: "我的网站B", href: "https://example.org", external: true },
    ] as NavLink[],
  },
  columns: {
    reddit: {
      id: "reddit",
      title: "Reddit专栏",
      description: "挖掘Reddit社区的热门趋势与商业机会。",
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
      title: "YouTube专栏",
      description: "追踪内容增长高手，学习视频引流打法。",
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
      title: "Twitter专栏",
      description: "关注增长黑客与创业者，捕捉流量风向标。",
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
        title: "2025年如何系统性挖掘Web流量的商业机会",
        description:
          "从渠道分析到产品验证，系统性拆解流量->用户->收入的路径。",
        date: new Date().toISOString(),
        author: "TopDigg",
        tags: ["增长", "SEO", "流量变现"],
        content:
          "在这篇文章中，我们将从渠道地图、关键词意图、内容结构化与转化漏斗四个层面，构建一套可执行的增长手册……",
      },
      {
        slug: "seo-content-framework",
        title: "实战：一套可复用的SEO内容生产框架",
        description: "Topic集群、内链拓扑、结构化数据与复盘机制。",
        date: new Date().toISOString(),
        author: "TopDigg",
        tags: ["SEO", "内容策略"],
        content:
          "本文提供一个轻量但有效的SEO内容框架，包含选题、写作SOP、结构化数据与质量评估……",
      },
    ] as BlogPost[],
  },
};

export const getColumnById = (id: string): ColumnConfig | undefined => {
  return siteConfig.columns[id];
};
