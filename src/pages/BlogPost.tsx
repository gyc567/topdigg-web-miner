import { useParams } from "react-router-dom";
import { SEO } from "@/components/SEO";
import { siteConfig } from "@/config/site";
import { useTranslation } from "react-i18next";
import { localizeText, SupportedLocale } from "@/lib/locale";
import { blogDataSource } from "@/lib/blog-data";
import MarkdownContent from "@/components/MarkdownContent";

const BlogPost = () => {
  const { slug } = useParams();
  const { i18n, t } = useTranslation();
  const post = blogDataSource.getPostBySlug(slug || "");

  if (!post) {
    return (
    <>
      <SEO title={t("post.notFoundTitle")} description={t("post.notFoundDesc")} path={`/blog/${slug}`} noIndex />
      <div className="py-20 text-center text-muted-foreground">{t("post.notFoundMsg")}</div>
    </>
    );
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: localizeText(post.title as any, i18n.language as SupportedLocale),
    description: localizeText(post.description as any, i18n.language as SupportedLocale),
    datePublished: post.date,
    author: {
      "@type": "Person",
      name: post.author,
    },
    mainEntityOfPage: `${siteConfig.baseUrl}/blog/${post.slug}`,
  };

  return (
    <>
      <SEO
        title={localizeText(post.title as any, i18n.language as SupportedLocale)}
        description={localizeText(post.description as any, i18n.language as SupportedLocale)}
        path={`/blog/${post.slug}`}
        type="article"
        jsonLd={jsonLd}
      />
      <article className="max-w-none">
        <header className="mb-8">
          <h1 className="text-4xl font-bold mb-4">{localizeText(post.title as any, i18n.language as SupportedLocale)}</h1>
          <div className="text-sm text-muted-foreground mb-6">
            <time dateTime={post.date}>{new Date(post.date).toLocaleDateString()}</time> · {post.author} · {post.tags.join(" / ")}
          </div>
        </header>
        <MarkdownContent 
          content={localizeText(post.content as any, i18n.language as SupportedLocale)} 
          className="mb-8"
        />
      </article>
    </>
  );
};

export default BlogPost;
