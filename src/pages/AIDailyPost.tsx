import { useParams } from "react-router-dom";
import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { SEO } from "@/components/SEO";
import { siteConfig } from "@/config/site";
import { useTranslation } from "react-i18next";
import { normalizeLang, localizeText, type SupportedLocale } from "@/lib/locale";
import { aiDailyDataSource } from "@/lib/ai-daily-data";
import type { AIDailyMeta } from "@/lib/ai-daily-data";
import MarkdownContent from "@/components/MarkdownContent";
import { makeArticleSchema, makeBreadcrumbList, makeFAQPageSchema } from "@/lib/jsonld";
import { AuthorBio } from "@/components/AuthorBio";
import { Badge } from "@/components/ui/badge";
import { ExternalLink as ExternalLinkIcon } from "lucide-react";

// Related AI Daily reports: up to 3 sharing at least one tag, excluding current
function RelatedReports({ currentSlug, tags }: { currentSlug: string; tags: string[] }) {
  const { t, i18n } = useTranslation();
  const currentLocale = normalizeLang(i18n.language);
  const [allReports, setAllReports] = useState<AIDailyMeta[]>([]);

  useEffect(() => {
    aiDailyDataSource.getReportsLocalized(currentLocale).then(setAllReports);
  }, [currentLocale]);

  const related = useMemo(() => {
    return allReports
      .filter((r) => r.slug !== currentSlug && r.tags.some((tag) => tags.includes(tag)))
      .sort((a, b) => {
        const aMatch = a.tags.filter((t) => tags.includes(t)).length;
        const bMatch = b.tags.filter((t) => tags.includes(t)).length;
        return bMatch - aMatch;
      })
      .slice(0, 3);
  }, [allReports, currentSlug, tags]);

  if (related.length === 0) return null;

  return (
    <section className="border-t mt-12 pt-8">
      <h2 className="text-xl font-semibold mb-4">{t("aiDaily.related", "More AI Daily")}</h2>
      <div className="grid gap-4 md:grid-cols-3">
        {related.map((report) => (
          <Link
            key={report.slug}
            to={`/ai-daily/${report.slug}`}
            className="block rounded-lg border p-4 hover:shadow-sm transition-shadow"
          >
            <h3 className="font-medium text-sm line-clamp-2 hover:text-brand transition-colors">
              {localizeText(report.title as any, currentLocale)}
            </h3>
            <time className="text-xs text-muted-foreground mt-2 block">{report.date}</time>
          </Link>
        ))}
      </div>
    </section>
  );
}

const AIDailyPost = () => {
  const { slug } = useParams();
  const { i18n, t } = useTranslation();
  const currentLocale = normalizeLang(i18n.language) as SupportedLocale;

  const [fullPost, setFullPost] = useState<AIDailyPost | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) {
      setLoading(false);
      return;
    }
    setLoading(true);
    aiDailyDataSource.getReportWithContent(slug).then((post) => {
      setFullPost(post ?? null);
      setLoading(false);
    });
  }, [slug]);

  if (loading) {
    return (
      <div className="py-20 text-center text-muted-foreground">
        {t("post.loading", "Loading…")}
      </div>
    );
  }

  if (!fullPost) {
    return (
      <>
        <SEO title={t("post.notFoundTitle")} description={t("post.notFoundDesc")} path={`/ai-daily/${slug}`} noIndex />
        <div className="py-20 text-center text-muted-foreground">{t("post.notFoundMsg")}</div>
      </>
    );
  }

  const resolved = aiDailyDataSource.resolve(fullPost, currentLocale);
  const postPath = `/ai-daily/${fullPost.slug}`;

  const jsonLd = makeArticleSchema({
    title: resolved.title,
    description: resolved.description,
    url: postPath,
    datePublished: fullPost.date,
    authorName: fullPost.author,
    tags: fullPost.tags,
  });

  const breadcrumbs = [
    { name: "Home", url: `${siteConfig.baseUrl}/` },
    { name: t("aiDaily.indexTitle"), url: `${siteConfig.baseUrl}/ai-daily` },
    { name: resolved.title, url: `${siteConfig.baseUrl}${postPath}` },
  ];

  const breadcrumbSchema = makeBreadcrumbList(breadcrumbs);
  const faqSchema = makeFAQPageSchema({
    mainEntity: [
      { question: "What is AI Daily?", answer: "AI Daily is a daily newsletter that curates the most important AI news from Reddit, YouTube, Twitter and other sources." },
      { question: "How often is AI Daily updated?", answer: "AI Daily is updated every day with the latest AI news and insights." },
      { question: "Can I contribute or suggest content?", answer: "Please contact us through our social media channels for contributions and suggestions." },
    ],
  });

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).replace(/\//g, '-');
  };

  return (
    <>
      <SEO
        title={resolved.title}
        description={resolved.description}
        path={postPath}
        type="article"
        jsonLd={[jsonLd, breadcrumbSchema, faqSchema]}
        breadcrumbs={breadcrumbs}
        publishedTime={fullPost.date}
        author={fullPost.author}
      />

      <article className="max-w-none">
        {/* AI Daily header */}
        <header className="mb-6 pb-6 border-b">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
            <span className="text-primary font-medium">{t("aiDaily.indexTitle")}</span>
            <span>·</span>
            <time dateTime={fullPost.date}>{formatDate(fullPost.date)}</time>
          </div>

          {/* Source info */}
          <div className="flex flex-wrap items-center gap-2 text-sm mb-4">
            <Badge variant="outline">
              {t("aiDaily.aggregator")}：
              {fullPost.source.aggregator_url ? (
                <a
                  href={fullPost.source.aggregator_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-primary ml-1 underline underline-offset-2"
                >
                  {fullPost.source.aggregator}
                  <ExternalLinkIcon className="inline h-3 w-3 ml-0.5" />
                </a>
              ) : (
                <span className="ml-1">{fullPost.source.aggregator}</span>
              )}
            </Badge>
            {resolved.source.original.name && resolved.source.original.name !== resolved.source.aggregator && (
              <figure className="mt-4 mb-6 max-w-sm">
                <picture>
                  <source srcSet="/qr-scan-follow.webp" type="image/webp" />
                  <img
                    src="/qr-scan-follow.png"
                    alt={t("aiDaily.originalHint", "扫码关注公众号获取原文")}
                    width={1280}
                    height={467}
                    loading="eager"
                    fetchpriority="high"
                    decoding="async"
                    className="w-full h-auto rounded-md border bg-card"
                  />
                </picture>
                <figcaption className="mt-2 text-xs text-muted-foreground">
                  {t("aiDaily.originalCaption", "原文出处：{{name}}", { name: resolved.source.original.name })}
                </figcaption>
              </figure>
            )}
          </div>

          <h1 className="text-3xl font-bold mb-3">{resolved.title}</h1>
          <p className="text-muted-foreground mb-4">{resolved.description}</p>

          <div className="flex flex-wrap gap-1.5">
            {fullPost.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        </header>

        <MarkdownContent content={resolved.content || ""} className="mb-8" />
        <div className="mt-8 pt-6 border-t">
          <Link to="/ai-daily">
            <Button variant="ghost" className="pl-0 hover:pl-2 transition-all">
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t("aiDaily.backToList", "返回日报列表")}
            </Button>
          </Link>
        </div>
        <AuthorBio />
        <RelatedReports currentSlug={fullPost.slug} tags={fullPost.tags} />
      </article>
    </>
  );
};

export default AIDailyPost;
