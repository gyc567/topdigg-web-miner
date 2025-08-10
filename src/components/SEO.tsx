import { Helmet } from "react-helmet-async";
import { siteConfig } from "@/config/site";
import { useTranslation } from "react-i18next";
import { supportedLocales, ogLocaleMap, htmlLangMap, withLangParam } from "@/lib/locale";

type SEOProps = {
  title: string;
  description: string;
  path?: string; // e.g. "/blog/slug"
  type?: "website" | "article";
  image?: string;
  noIndex?: boolean;
  jsonLd?: Record<string, any>;
};
export const SEO = ({
  title,
  description,
  path = "/",
  type = "website",
  image,
  noIndex = false,
  jsonLd,
}: SEOProps) => {
  const { i18n } = useTranslation();
  const lang = (i18n.language as any) as keyof typeof htmlLangMap;
  const fullTitle = `${title} | ${siteConfig.siteName}`;
  const base = siteConfig.baseUrl.replace(/\/$/, "");
  const baseUrl = `${base}${path}`;
  const canonical = withLangParam(baseUrl, lang as any);

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
    </Helmet>
  );
};
