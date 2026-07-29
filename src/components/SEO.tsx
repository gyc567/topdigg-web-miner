import { Helmet } from "react-helmet-async";
import { siteConfig } from "@/config/site";
import { useTranslation } from "react-i18next";
import {
  supportedLocales,
  ogLocaleMap,
  htmlLangMap,
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
  jsonLd?: Record<string, any>;
  /** Injected automatically as a separate JSON-LD BreadcrumbList block. */
  breadcrumbs?: BreadcrumbItem[];
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
}: SEOProps) => {
  const { i18n } = useTranslation();
  const lang: SupportedLocale = normalizeLang(i18n.language);
  const fullTitle = `${title} | ${siteConfig.siteName}`;
  const base = siteConfig.baseUrl.replace(/\/$/, "");
  const baseUrl = `${base}${path}`;
  const canonical = withLangParam(baseUrl, lang);

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
      {image && <meta property="og:image" content={image} />}

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      {image && <meta name="twitter:image" content={image} />}

      {jsonLd && (
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      )}
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
