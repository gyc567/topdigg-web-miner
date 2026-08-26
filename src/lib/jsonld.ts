/**
 * JSON-LD factory functions for structured data.
 * Each function returns a typed object matching Google's Rich Results guidelines.
 */
import type { SupportedLocale } from "@/lib/locale";
import { localizeText } from "@/lib/locale";

const BASE = "https://www.topdigg.com";
const SITE_NAME = "TopDigg";
const AUTHOR_NAME = "Eric";
const AUTHOR_URL = `${BASE}/about`;
const AUTHOR_SAME_AS = [
  "https://twitter.com/topdigg",
  "https://www.reddit.com/r/topdigg/",
  "https://github.com/topdigg",
];

// ---------------------------------------------------------------------------
// Shared
// ---------------------------------------------------------------------------

export interface BreadcrumbItem {
  name: string;
  url: string;
}

/** @returns BreadcrumbList schema with up to 3 items (home → parent → current) */
export function makeBreadcrumbList(items: BreadcrumbItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

// ---------------------------------------------------------------------------
// WebSite + Organization (全站 · 每页附加)
// ---------------------------------------------------------------------------

export function makeWebsiteSchema(lang: SupportedLocale) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: BASE,
    description: localizeText(
      {
        "zh-Hans": "专注于 Twitter 头部账号的深度分析与趋势追踪",
        "zh-Hant": "專注於 Twitter 頭部帳號的深度分析與趨勢追蹤。",
        en: "Deep dives into top Twitter accounts and trend tracking.",
        ja: "Twitter のトップアカウントとトレンドを深く分析。",
        vi: "Phân tích chuyên sâu các tài khoản Twitter hàng đầu và theo dõi xu hướng.",
      },
      lang
    ),
    inLanguage: lang,
    publisher: makeOrganization(lang),
  };
}

export function makeOrganization(lang: SupportedLocale) {
  return {
    "@type": "Organization",
    name: SITE_NAME,
    url: BASE,
    logo: {
      "@type": "ImageObject",
      url: `${BASE}/logo-header.png`,
    },
    sameAs: [
      "https://twitter.com/topdigg",
      "https://www.reddit.com/r/topdigg/",
      "https://github.com/topdigg",
      "https://t.me/topdigg",
    ],
  };
}

// ---------------------------------------------------------------------------
// SearchAction (首页)
// ---------------------------------------------------------------------------

export function makeSearchActionSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: BASE,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${BASE}/?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

// ---------------------------------------------------------------------------
// BlogPost Article + BreadcrumbList (博客详情页)
// ---------------------------------------------------------------------------

export interface ArticleSchemaParams {
  title: string;       // already localised
  description: string; // already localised
  url: string;
  datePublished: string; // ISO date
  dateModified?: string;
  authorName: string;
  tags?: string[];
  image?: string;
}

export function makeArticleSchema(params: ArticleSchemaParams) {
  const { title, description, url, datePublished, dateModified, authorName, tags, image } = params;
  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description,
    url: `${BASE}${url}`,
    datePublished,
    dateModified: dateModified ?? datePublished,
    author: {
      "@type": "Person",
      name: AUTHOR_NAME,
      url: AUTHOR_URL,
      sameAs: AUTHOR_SAME_AS,
    },
    publisher: makeOrganization("en"),
    keywords: tags?.join(", "),
    image: image ? `${BASE}${image}` : undefined,
  };
  // Remove undefined keys
  Object.keys(schema).forEach((k) => schema[k] === undefined && delete schema[k]);
  return schema;
}

// ---------------------------------------------------------------------------
// TwitterAnalysis Article + BreadcrumbList (Twitter 详情页)
// ---------------------------------------------------------------------------

export interface TwitterArticleSchemaParams {
  title: string;
  description: string;
  url: string;
  datePublished: string;
  dateModified?: string;
  authorName: string;      // e.g. "Claude Twitter Analyzer"
  twitterHandle: string;   // e.g. "@AliAbdaal"
  tags?: string[];
  image?: string;
}

export function makeTwitterArticleSchema(params: TwitterArticleSchemaParams) {
  const { title, description, url, datePublished, dateModified, authorName, twitterHandle, tags, image } =
    params;
  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description,
    url: `${BASE}${url}`,
    datePublished,
    dateModified: dateModified ?? datePublished,
    author: {
      "@type": "Person",
      name: AUTHOR_NAME,
      url: AUTHOR_URL,
      sameAs: AUTHOR_SAME_AS,
    },
    publisher: makeOrganization("en"),
    keywords: tags?.join(", "),
    image: image ? `${BASE}${image}` : undefined,
  };
  Object.keys(schema).forEach((k) => schema[k] === undefined && delete schema[k]);
  return schema;
}

// ---------------------------------------------------------------------------
// CollectionPage + ItemList (栏目页：Twitter)
// ---------------------------------------------------------------------------

export interface ItemListEntry {
  name: string;
  url: string;
  position: number;
}

export interface CollectionPageSchemaParams {
  title: string;
  description: string;
  url: string;
  items: ItemListEntry[];
}

export function makeCollectionPageSchema(params: CollectionPageSchemaParams) {
  const { title, description, url, items } = params;
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: title,
    description,
    url: `${BASE}${url}`,
    itemListElement: items.map((item) => ({
      "@type": "ListItem",
      position: item.position,
      name: item.name,
      url: item.url,
    })),
  };
}

// ---------------------------------------------------------------------------
// Person + ProfilePage (About 页)
// ---------------------------------------------------------------------------

export function makePersonSchema(lang: SupportedLocale) {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: AUTHOR_NAME,
    url: AUTHOR_URL,
    image: `${BASE}/logo-header.png`,
    sameAs: AUTHOR_SAME_AS,
    jobTitle: localizeText(
      {
        "zh-Hans": "AI 研究员 / SEO 策略师",
        "zh-Hant": "AI 研究員 / SEO 策略師",
        en: "AI Researcher & SEO Strategist",
        ja: "AI研究者 / SEOストラテジスト",
        vi: "Nhà nghiên cứu AI & Chuyên gia SEO",
      },
      lang
    ),
    worksFor: {
      "@type": "Organization",
      name: SITE_NAME,
      url: BASE,
    },
    description: localizeText(
      {
        "zh-Hans": "专注 AI 趋势研究与 SEO/GEO 策略，帮助内容创作者提升有机流量和 AI 引用率。",
        "zh-Hant": "專注 AI 趨勢研究與 SEO/GEO 策略，幫助內容創作者提升有機流量和 AI 引用率。",
        en: "Focused on AI trend research and SEO/GEO strategy — helping content creators boost organic traffic and AI citations.",
        ja: "AIトレンド研究与SEO/GEO戦略に特化。コンテンツクリエイター органика流量とAI引用率の向上を支援。",
        vi: "Tập trung nghiên cứu xu hướng AI và chiến lược SEO/GEO — giúp nhà sáng tạo nội dung tăng lưu lượng tìm kiếm và trích dẫn AI.",
      },
      lang
    ),
  };
}

export function makeProfilePageSchema(lang: SupportedLocale) {
  return {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    dateCreated: "2024-01-01",
    dateModified: new Date().toISOString().split("T")[0],
    mainEntity: makePersonSchema(lang),
  };
}

// ---------------------------------------------------------------------------
// FAQPage (文章页)
// ---------------------------------------------------------------------------

export interface FAQPageSchemaParams {
  mainEntity: Array<{ question: string; answer: string }>;
}

export function makeFAQPageSchema(params: FAQPageSchemaParams) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: params.mainEntity.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}


// ---------------------------------------------------------------------------
// Product (AI产品分析 详情页)
// ---------------------------------------------------------------------------

export type ProductSchemaParams = {
  name: string;
  description: string;
  url: string;
  image?: string;
  category: string;
  brand?: string;
  offers?: Array<{ price: number; priceCurrency: string; name?: string; priceValidUntil?: string }>;
};

export function makeProductSchema(params: ProductSchemaParams) {
  const { name, description, url, image, category, brand, offers } = params;
  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name,
    description,
    url: `${BASE}${url}`,
    category,
  };
  if (image) schema.image = image;
  if (brand) schema.brand = { "@type": "Brand", name: brand };
  if (offers && offers.length > 0) {
    schema.offers = offers.map((o) => {
      const offer: Record<string, unknown> = {
        "@type": "Offer",
        price: o.price,
        priceCurrency: o.priceCurrency,
      };
      if (o.name) offer.name = o.name;
      if (o.priceValidUntil) offer.priceValidUntil = o.priceValidUntil;
      return offer;
    });
  }
  return schema;
}
