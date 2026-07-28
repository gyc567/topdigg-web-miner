import { Link } from "react-router-dom";
import { SEO } from "@/components/SEO";
import { siteConfig } from "@/config/site";
import { useTranslation } from "react-i18next";
import { localizeText, normalizeLang } from "@/lib/locale";
import { blogDataSource } from "@/lib/blog-data";

const BlogIndex = () => {
  const posts = blogDataSource.getPosts();
  const { t, i18n } = useTranslation();
  const currentLocale = normalizeLang(i18n.language);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: `${siteConfig.siteName} 博客`,
    url: `${siteConfig.baseUrl}/blog`,
  };

  return (
    <>
      <SEO
        title={t("blog.indexTitle")}
        description={`${siteConfig.siteName} ${t("blog.indexDesc")}`}
        path="/blog"
        jsonLd={jsonLd}
      />
      <header className="mb-8">
        <h1 className="text-3xl font-bold">{t("blog.indexTitle")}</h1>
        <p className="text-muted-foreground mt-2">{t("blog.indexDesc")}</p>
      </header>
      <section className="grid gap-6 md:grid-cols-2">
        {posts.map((post) => (
          <article key={post.slug} className="rounded-xl border p-6 hover:shadow-sm transition-shadow">
            <h2 className="text-xl font-semibold">
              <Link to={`/blog/${post.slug}`} className="hover:text-brand transition-colors">
                {localizeText(post.title as any, currentLocale)}
              </Link>
            </h2>
            <p className="text-sm text-muted-foreground mt-2">{localizeText(post.description as any, currentLocale)}</p>
            <div className="mt-3 text-xs text-muted-foreground">
              <time dateTime={post.date}>{new Date(post.date).toLocaleDateString()}</time> · {post.author} · {post.tags.join(" / ")}
            </div>
          </article>
        ))}
      </section>
    </>
  );
};

export default BlogIndex;
