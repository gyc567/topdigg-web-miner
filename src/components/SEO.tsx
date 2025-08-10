import { Helmet } from "react-helmet-async";
import { siteConfig } from "@/config/site";

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
  const fullTitle = `${title} | ${siteConfig.siteName}`;
  const url = `${siteConfig.baseUrl.replace(/\/$/, "")}${path}`;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      {noIndex && <meta name="robots" content="noindex, nofollow" />}

      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      {image && <meta property="og:image" content={image} />}

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      {image && <meta name="twitter:image" content={image} />}

      {jsonLd && (
        <script type="application/ld+json">
          {JSON.stringify(jsonLd)}
        </script>
      )}
    </Helmet>
  );
};
