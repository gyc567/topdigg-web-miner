import { Link } from "react-router-dom";
import { SEO } from "@/components/SEO";
import { siteConfig } from "@/config/site";
import { useTranslation } from "react-i18next";
import { localizeText, SupportedLocale } from "@/lib/locale";
import { blogDataSource } from "@/lib/blog-data";

const Index = () => {
  // blog-data.json 在构建时已按日期降序排序，直接取前 3 篇，避免原地 sort 修改共享数组
  const latest = blogDataSource.getPosts().slice(0, 3);
  const { t, i18n } = useTranslation();
  return (
    <>
      <SEO
        title="挖掘Web流量与商业机会的内容站"
        description="TopDigg 专注SEO与增长，提供优质博客内容与Reddit/YouTube/Twitter等专栏的Top5账号推荐。"
        path="/"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: siteConfig.siteName,
          url: siteConfig.baseUrl,
        }}
      />
      <section className="relative overflow-hidden rounded-2xl border bg-gradient-to-b from-accent to-background p-10 md:p-16 shadow-sm">
        <h1 className="text-4xl md:text-5xl font-extrabold leading-tight mb-4">
          {t("home.heroTitle")}
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl">
          {t("home.heroDesc")}
        </p>
        <div className="mt-8 flex flex-wrap gap-4">
          <Link to="/blog" className="inline-flex items-center rounded-md px-5 py-2.5 bg-brand text-brand-foreground shadow hover:opacity-90 transition-colors">
            {t("home.blogCta")}
          </Link>
          <Link to="/columns/reddit" className="inline-flex items-center rounded-md px-5 py-2.5 border hover:bg-accent transition-colors">
            {t("home.columnsCta")}
          </Link>
        </div>
      </section>

      <section className="mt-12 grid gap-6 md:grid-cols-3">
        {[
          siteConfig.columns.reddit,
          siteConfig.columns.youtube,
          siteConfig.columns.twitter,
        ].map((col) => (
          <article key={col.id} className="rounded-xl border p-6 hover:shadow-sm transition-shadow">
            <h2 className="text-xl font-bold mb-2">{localizeText(col.title as any, i18n.language as SupportedLocale)}</h2>
            <p className="text-sm text-muted-foreground mb-4">{localizeText(col.description as any, i18n.language as SupportedLocale)}</p>
            <ul className="space-y-2 text-sm">
              {col.topAccounts.slice(0, 5).map((acc) => (
                <li key={acc.url}>
                  <a href={acc.url} target="_blank" rel="noopener noreferrer" className="text-foreground hover:text-brand transition-colors">
                    {acc.name} {acc.handle ? `(${acc.handle})` : ""}
                  </a>
                </li>
              ))}
            </ul>
            <Link to={`/columns/${col.id}`} className="mt-4 inline-flex text-sm text-brand hover:underline">
              {t("common.viewAll")}
            </Link>
          </article>
        ))}
      </section>

      <section className="mt-12">
        <h2 className="text-2xl font-bold mb-4">{t("home.latest")}</h2>
        <div className="grid gap-6 md:grid-cols-2">
          {latest.map((post) => (
            <article key={post.slug} className="rounded-xl border p-6 hover:shadow-sm transition-shadow">
              <h3 className="text-lg font-semibold">
                <Link to={`/blog/${post.slug}`} className="hover:text-brand transition-colors">
                  {localizeText(post.title as any, i18n.language as SupportedLocale)}
                </Link>
              </h3>
              <p className="text-sm text-muted-foreground mt-2">{localizeText(post.description as any, i18n.language as SupportedLocale)}</p>
              <div className="mt-3 text-xs text-muted-foreground">
                <time dateTime={post.date}>{new Date(post.date).toLocaleDateString()}</time> · {post.author}
              </div>
            </article>
          ))}
        </div>
      </section>
    </>
  );
};

export default Index;
