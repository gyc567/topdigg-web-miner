import { useParams } from "react-router-dom";
import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ExternalLink } from "lucide-react";

import { SEO } from "@/components/SEO";
import { siteConfig } from "@/config/site";
import { useTranslation } from "react-i18next";
import { normalizeLang, localizeText, type SupportedLocale } from "@/lib/locale";
import { financeDailyDataSource, type FinanceDailyPost } from "@/lib/finance-daily-data";
import MarkdownContent from "@/components/MarkdownContent";
import { Badge } from "@/components/ui/badge";
import { makeBlogPostingSchema, makeBreadcrumbList } from "@/lib/jsonld";
import { AuthorBio } from "@/components/AuthorBio";

// Related Finance Daily reports: up to 3 sharing at least one tag, excluding current
function RelatedReports({ currentSlug, tags }: { currentSlug: string; tags: string[] }) {
  const { t, i18n } = useTranslation();
  const currentLocale = normalizeLang(i18n.language);
  const [allReports, setAllReports] = useState<FinanceDailyPost[]>([]);

  useEffect(() => {
    financeDailyDataSource.getReportsLocalized(currentLocale).then((data) => {
      // getReportsLocalized returns meta, but we want full post — simpler fallback:
      const full = data.map((m) => ({
        ...m,
        content: m.content || "",
      })) as FinanceDailyPost[];
      setAllReports(full);
    });
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
      <h2 className="text-xl font-semibold mb-4">{t("financeDaily.related", "更多财经简报")}</h2>
      <div className="grid gap-4 md:grid-cols-3">
        {related.map((report) => (
          <Link
            key={report.slug}
            to={`/finance-daily/${report.slug}`}
            className="block rounded-lg border p-4 hover:shadow-sm transition-shadow"
          >
            <h3 className="font-medium text-sm line-clamp-2 hover:text-primary transition-colors">
              {localizeText(report.title, currentLocale)}
            </h3>
            <time className="text-xs text-muted-foreground mt-2 block">{report.date}</time>
          </Link>
        ))}
      </div>
    </section>
  );
}

const FinanceDailyPost = () => {
  const { slug } = useParams();
  const { i18n, t } = useTranslation();
  const currentLocale = normalizeLang(i18n.language) as SupportedLocale;

  const [fullPost, setFullPost] = useState<FinanceDailyPost | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) {
      setLoading(false);
      return;
    }
    setLoading(true);
    financeDailyDataSource.getReportWithContent(slug).then((post) => {
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
        <SEO title={t("post.notFoundTitle")} description={t("post.notFoundDesc")} path={`/finance-daily/${slug}`} noIndex />
        <div className="py-20 text-center text-muted-foreground">{t("post.notFoundMsg")}</div>
      </>
    );
  }

  const postPath = `/finance-daily/${fullPost.slug}`;
  const title = localizeText(fullPost.title, currentLocale);
  const description = localizeText(fullPost.description, currentLocale);

  const jsonLd = makeBlogPostingSchema({
    title,
    description,
    url: postPath,
    datePublished: fullPost.date,
    authorName: fullPost.author,
    tags: fullPost.tags,
  });

  const breadcrumbs = [
    { name: "Home", url: `${siteConfig.baseUrl}/` },
    { name: t("financeDaily.indexTitle", "每日财经简报"), url: `${siteConfig.baseUrl}/finance-daily` },
    { name: title, url: `${siteConfig.baseUrl}${postPath}` },
  ];
  const breadcrumbSchema = makeBreadcrumbList(breadcrumbs);

  return (
    <>
      <SEO
        title={title}
        description={description}
        path={postPath}
        type="article"
        jsonLd={[jsonLd, breadcrumbSchema]}
        breadcrumbs={breadcrumbs}
        publishedTime={fullPost.date}
        author={fullPost.author}
      />

      <article className="max-w-none">
        <header className="mb-6 pb-6 border-b">
          <Link
            to="/finance-daily"
            className="text-sm text-muted-foreground hover:text-foreground mb-4 inline-flex items-center gap-1"
          >
            <ArrowLeft className="w-3 h-3" />
            {t("financeDaily.backToList", "返回财经简报列表")}
          </Link>

          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
            <span className="text-primary font-medium">{t("financeDaily.indexTitle", "每日财经简报")}</span>
            <span>·</span>
            <time dateTime={fullPost.date}>{fullPost.date}</time>
          </div>

          {/* Source info */}
          {fullPost.source.original.url && (
            <div className="flex flex-wrap items-center gap-2 text-sm mb-4">
              <Badge variant="outline">
                <span>{t("financeDaily.source", "来源")}：</span>
                <a
                  href={fullPost.source.original.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-primary ml-1 underline underline-offset-2 inline-flex items-center gap-0.5"
                >
                  {localizeText(fullPost.source.original.name, currentLocale)}
                  <ExternalLink className="inline h-3 w-3 ml-0.5" />
                </a>
              </Badge>
            </div>
          )}

          <h1 className="text-3xl font-bold mb-3">{title}</h1>
          <p className="text-muted-foreground mb-4">{description}</p>

          <div className="flex flex-wrap gap-1.5">
            {fullPost.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        </header>

        <MarkdownContent content={localizeText(fullPost.content || "", currentLocale)} className="mb-8" />

        <RelatedReports currentSlug={fullPost.slug} tags={fullPost.tags} />

        <AuthorBio />
      </article>
    </>
  );
};

export default FinanceDailyPost;
