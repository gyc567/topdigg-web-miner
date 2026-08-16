import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { SEO } from "@/components/SEO";
import { siteConfig } from "@/config/site";
import { useTranslation } from "react-i18next";
import { localizeText, normalizeLang } from "@/lib/locale";
import { blogDataSource } from "@/lib/blog-data";
import type { BlogMeta } from "@/lib/blog-data";
import MarkdownContent from "@/components/MarkdownContent";
import { makeArticleSchema } from "@/lib/jsonld";
import type { BlogPost } from "@/config/site";
import { AuthorBio } from "@/components/AuthorBio";

const BlogPost = () => {
  const { slug } = useParams();
  const { i18n, t } = useTranslation();
  const currentLocale = normalizeLang(i18n.language);

  const [fullPost, setFullPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);

  // Load metadata immediately (from blog-meta.json, ~13 KB)
  // then fetch full content lazily (from blog-data.json, ~654 KB)
  useEffect(() => {
    if (!slug) { setLoading(false); return; }
    setLoading(true);

    blogDataSource.getPostWithContent(slug).then((post) => {
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
        <SEO title={t("post.notFoundTitle")} description={t("post.notFoundDesc")} path={`/blog/${slug}`} noIndex />
        <div className="py-20 text-center text-muted-foreground">{t("post.notFoundMsg")}</div>
      </>
    );
  }

  const postPath = `/blog/${fullPost.slug}`;
  const jsonLd = makeArticleSchema({
    title: localizeText(fullPost.title as any, currentLocale),
    description: localizeText(fullPost.description as any, currentLocale),
    url: postPath,
    datePublished: fullPost.date,
    authorName: fullPost.author,
    tags: fullPost.tags,
  });

  const breadcrumbs = [
    { name: "Home", url: `${siteConfig.baseUrl}/` },
    { name: "Blog", url: `${siteConfig.baseUrl}/blog` },
    { name: localizeText(fullPost.title as any, currentLocale), url: `${siteConfig.baseUrl}${postPath}` },
  ];

  return (
    <>
      <SEO
        title={localizeText(fullPost.title as any, currentLocale)}
        description={localizeText(fullPost.description as any, currentLocale)}
        path={postPath}
        type="article"
        jsonLd={jsonLd}
        breadcrumbs={breadcrumbs}
      />
      <article className="max-w-none">
        <header className="mb-8">
          <h1 className="text-4xl font-bold mb-4">{localizeText(fullPost.title as any, currentLocale)}</h1>
          <div className="text-sm text-muted-foreground mb-6">
            <time dateTime={fullPost.date}>{new Date(fullPost.date).toLocaleDateString()}</time> · {fullPost.author} · {fullPost.tags.join(" / ")}
          </div>
        </header>
        <MarkdownContent
          content={localizeText(fullPost.content as any, currentLocale)}
          className="mb-8"
        />
        <AuthorBio />
      </article>
    </>
  );
};

export default BlogPost;
