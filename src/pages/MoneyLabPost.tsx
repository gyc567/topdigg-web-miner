import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { normalizeLang, type SupportedLocale } from "@/lib/locale";
import { moneyLabDataSource } from "@/lib/money-lab-data";
import { localizeText } from "@/lib/locale";
import MarkdownContent from "@/components/MarkdownContent";
import { SEO } from "@/components/SEO";
import { siteConfig } from "@/config/site";

const DIFFICULTY_COLORS: Record<string, string> = {
  "简单": "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
  "中等": "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
  "困难": "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
};

const MoneyLabPost = () => {
  const { slug } = useParams();
  const { i18n, t } = useTranslation();
  const currentLocale = normalizeLang(i18n.language);

  const [fullPost, setFullPost] = useState<ReturnType<typeof moneyLabDataSource.getPostWithContent>>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) { setLoading(false); return; }
    setLoading(true);
    moneyLabDataSource.getPostWithContent(slug).then((post) => {
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
        <SEO title={t("post.notFoundTitle")} description={t("post.notFoundDesc")} path={`/money-lab/${slug}`} noIndex />
        <div className="py-20 text-center text-muted-foreground">{t("post.notFoundMsg")}</div>
      </>
    );
  }

  const postPath = `/money-lab/${fullPost.slug}`;
  const title = localizeText(fullPost.title, currentLocale as SupportedLocale);
  const description = localizeText(fullPost.description, currentLocale as SupportedLocale);

  const breadcrumbs = [
    { name: "Home", url: `${siteConfig.baseUrl}/` },
    { name: t("moneyLab.indexTitle", "赚钱实验室"), url: `${siteConfig.baseUrl}/money-lab` },
    { name: title, url: `${siteConfig.baseUrl}${postPath}` },
  ];

  return (
    <>
      <SEO
        title={title}
        description={description}
        path={postPath}
        type="article"
        publishedTime={fullPost.date}
        author={fullPost.author}
        breadcrumbs={breadcrumbs}
      />

      {/* Breadcrumbs */}
      <nav className="text-sm text-muted-foreground mb-6" aria-label="Breadcrumb">
        <ol className="flex items-center gap-2 flex-wrap">
          {breadcrumbs.map((crumb, idx) => (
            <li key={crumb.url} className="flex items-center gap-2">
              {idx > 0 && <span>/</span>}
              {idx === breadcrumbs.length - 1 ? (
                <span className="text-foreground">{crumb.name}</span>
              ) : (
                <a href={crumb.url} className="hover:text-foreground transition-colors">
                  {crumb.name}
                </a>
              )}
            </li>
          ))}
        </ol>
      </nav>

      <article>
        {/* Header */}
        <header className="mb-8">
          {/* Category & difficulty badges */}
          <div className="flex items-center gap-2 flex-wrap mb-3">
            {fullPost.categories.map((cat) => (
              <span
                key={cat}
                className="px-3 py-1 rounded-full text-sm font-medium bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300"
              >
                {cat}
              </span>
            ))}
            {fullPost.difficulty && (
              <span className={`px-3 py-1 rounded-full text-sm ${DIFFICULTY_COLORS[fullPost.difficulty] || "bg-muted text-muted-foreground"}`}>
                {fullPost.difficulty}
              </span>
            )}
          </div>

          <h1 className="text-3xl md:text-4xl font-bold mb-4">{title}</h1>

          {/* Meta row: earnings + time + author + date */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
            {fullPost.earnings && (
              <span className="flex items-center gap-1.5 text-green-600 dark:text-green-400 font-semibold text-base">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {fullPost.earnings}
              </span>
            )}
            {fullPost.timeRequired && (
              <span className="flex items-center gap-1.5">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {fullPost.timeRequired}
              </span>
            )}
            <span>{fullPost.author}</span>
            <span>{fullPost.date}</span>
          </div>

          {/* Description */}
          <p className="text-lg text-muted-foreground mt-4">{description}</p>
        </header>

        {/* Cover image */}
        {fullPost.coverImage && (
          <div className="mb-8 rounded-xl overflow-hidden">
            <img
              src={fullPost.coverImage}
              alt={title}
              className="w-full max-h-96 object-cover"
            />
          </div>
        )}

        {/* Tags */}
        {fullPost.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8">
            {fullPost.tags.map((tag) => (
              <span key={tag} className="px-2 py-1 rounded text-xs bg-muted text-muted-foreground">
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Content */}
        <MarkdownContent
          content={localizeText(fullPost.content, currentLocale as SupportedLocale)}
          className="mt-6"
        />
      </article>
    </>
  );
};

export default MoneyLabPost;
