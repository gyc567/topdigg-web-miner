/**
 * JSON-LD factory functions for structured data.
 * Each function returns a typed object matching Google's Rich Results guidelines.
 */
import type { SupportedLocale } from "@/lib/locale";
import { localizeText } from "@/lib/locale";

const BASE = "https://topdigg.com";
const SITE_NAME = "TopDigg";

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
        "zh-Hans": "挖掘 Reddit、YouTube、Twitter 的热门趋势与商业机会",
        "zh-Hant": "挖掘 Reddit、YouTube、Twitter 的熱門趨勢與商業機會",
        en: "Discover trending topics and business opportunities across Reddit, YouTube, and Twitter.",
        ja: "Reddit、YouTube、Twitterのトレンドとビジネスチャンスを発掘。",
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
      url: `${BASE}/favicon.ico`,
    },
    sameAs: [
      "https://twitter.com/topdigg",
      "https://www.reddit.com/r/topdigg/",
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
      name: authorName,
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
      name: authorName,
      sameAs: `https://x.com/${twitterHandle.replace("@", "")}`,
    },
    publisher: makeOrganization("en"),
    keywords: tags?.join(", "),
    image: image ? `${BASE}${image}` : undefined,
  };
  Object.keys(schema).forEach((k) => schema[k] === undefined && delete schema[k]);
  return schema;
}

// ---------------------------------------------------------------------------
// CollectionPage + ItemList (栏目页：Reddit / YouTube / Twitter)
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
