import { Helmet } from "react-helmet-async";
import { siteConfig } from "@/config/site";
import { useTranslation } from "react-i18next";
import {
  supportedLocales,
  ogLocaleMap,
  htmlLangMap,
  canonicalUrl,
  withLangParam,
  normalizeLang,
  type SupportedLocale,
} from "@/lib/locale";

export type BreadcrumbItem = {
  name: string;
  url: string;
};

type SEOProps = {
  title: string;
  description: string;
  path?: string; // e.g. "/blog/slug"
  type?: "website" | "article";
  image?: string;
  noIndex?: boolean;
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
  /** Injected automatically as a separate JSON-LD BreadcrumbList block. */
  breadcrumbs?: BreadcrumbItem[];
  /** ISO date string for article:published_time meta */
  publishedTime?: string;
  /** Author name for article:author meta */
  author?: string;
};
export const SEO = ({
  title,
  description,
  path = "/",
  type = "website",
  image,
  noIndex = false,
  jsonLd,
  breadcrumbs,
  publishedTime,
  author,
}: SEOProps) => {
  const { i18n } = useTranslation();
  const lang: SupportedLocale = normalizeLang(i18n.language);
  const fullTitle = `${title} | ${siteConfig.siteName}`;
  const base = siteConfig.baseUrl.replace(/\/$/, "");
  const baseUrl = `${base}${path}`;
  const canonical = canonicalUrl(baseUrl);

  return (
    <Helmet htmlAttributes={{ lang: htmlLangMap[lang] }}>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonical} />
      {supportedLocales.map((l) => (
        <link key={l} rel="alternate" hrefLang={htmlLangMap[l]} href={withLangParam(baseUrl, l)} />
      ))}
      <link rel="alternate" hrefLang="x-default" href={withLangParam(baseUrl, "en")} />
      {noIndex && <meta name="robots" content="noindex, nofollow" />}

      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonical} />
      <meta property="og:locale" content={ogLocaleMap[lang]} />
      <meta property="og:image" content={image ?? siteConfig.defaultOGImage} />
      {type === "article" && publishedTime && (
        <meta property="article:published_time" content={publishedTime} />
      )}
      {type === "article" && author && (
        <meta property="article:author" content={author} />
      )}

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image ?? siteConfig.defaultOGImage} />

      {jsonLd && (Array.isArray(jsonLd) ? jsonLd : [jsonLd]).map((schema, i) => (
        <script key={i} type="application/ld+json">{JSON.stringify(schema)}</script>
      ))}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: breadcrumbs.map((item, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: item.name,
            item: item.url,
          })),
        })}</script>
      )}
    </Helmet>
  );
};
