import { useParams } from "react-router-dom";
import { SEO } from "@/components/SEO";
import { siteConfig } from "@/config/site";
import { useTranslation } from "react-i18next";
import { localizeText, normalizeLang } from "@/lib/locale";
import { blogDataSource } from "@/lib/blog-data";
import MarkdownContent from "@/components/MarkdownContent";
import { makeArticleSchema } from "@/lib/jsonld";

const BlogPost = () => {
  const { slug } = useParams();
  const { i18n, t } = useTranslation();
  const currentLocale = normalizeLang(i18n.language);
  const post = blogDataSource.getPostBySlug(slug || "");

  if (!post) {
    return (
    <>
      <SEO title={t("post.notFoundTitle")} description={t("post.notFoundDesc")} path={`/blog/${slug}`} noIndex />
      <div className="py-20 text-center text-muted-foreground">{t("post.notFoundMsg")}</div>
    </>
    );
  }

  const postPath = `/blog/${post.slug}`;
  const jsonLd = makeArticleSchema({
    title: localizeText(post.title as any, currentLocale),
    description: localizeText(post.description as any, currentLocale),
    url: postPath,
    datePublished: post.date,
    authorName: post.author,
    tags: post.tags,
  });

  const breadcrumbs = [
    { name: "Home", url: `${siteConfig.baseUrl}/` },
    { name: "Blog", url: `${siteConfig.baseUrl}/blog` },
    { name: localizeText(post.title as any, currentLocale), url: `${siteConfig.baseUrl}${postPath}` },
  ];

  return (
    <>
      <SEO
        title={localizeText(post.title as any, currentLocale)}
        description={localizeText(post.description as any, currentLocale)}
        path={postPath}
        type="article"
        jsonLd={jsonLd}
        breadcrumbs={breadcrumbs}
      />
      <article className="max-w-none">
        <header className="mb-8">
          <h1 className="text-4xl font-bold mb-4">{localizeText(post.title as any, currentLocale)}</h1>
          <div className="text-sm text-muted-foreground mb-6">
            <time dateTime={post.date}>{new Date(post.date).toLocaleDateString()}</time> · {post.author} · {post.tags.join(" / ")}
          </div>
        </header>
        <MarkdownContent 
          content={localizeText(post.content as any, currentLocale)} 
          className="mb-8"
        />
      </article>
    </>
  );
};

export default BlogPost;
