import { Link } from "react-router-dom";
import { SEO } from "@/components/SEO";
import { siteConfig } from "@/config/site";
import { useTranslation } from "react-i18next";
import { localizeText, normalizeLang } from "@/lib/locale";
import { blogDataSource } from "@/lib/blog-data";
import { aiProductsDataSource } from "@/lib/ai-products-data";
import { makeSearchActionSchema, makeWebsiteSchema, makeOrganization } from "@/lib/jsonld";

const Index = () => {
  // blog-data.json 在构建时已按日期降序排序，直接取前 3 篇，避免原地 sort 修改共享数组
  const latest = blogDataSource.getPosts().slice(0, 3);
  // 同步拿 AI 产品分析（meta 全语言 ~50KB），与 blog-data 同量级
  const latestProducts = aiProductsDataSource.getPosts().slice(0, 3);
  const { t, i18n } = useTranslation();
  const currentLocale = normalizeLang(i18n.language);
  return (
    <>
      <SEO
        title={t("home.seoTitle")}
        description={t("home.seoDesc")}
        path="/"
        jsonLd={[makeWebsiteSchema(currentLocale), makeSearchActionSchema()]}
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
        </div>
      </section>

      <section className="mt-12 flex justify-center">
        {[
          siteConfig.columns.twitter,
        ].map((col) => (
          <article key={col.id} className="rounded-xl border p-6 hover:shadow-sm transition-shadow w-full max-w-md">
            <h2 className="text-xl font-bold mb-2">{localizeText(col.title, currentLocale)}</h2>
            <p className="text-sm text-muted-foreground mb-4">{localizeText(col.description, currentLocale)}</p>
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
                  {localizeText(post.title, currentLocale)}
                </Link>
              </h3>
              <p className="text-sm text-muted-foreground mt-2">{localizeText(post.description, currentLocale)}</p>
              <div className="mt-3 text-xs text-muted-foreground">
                <time dateTime={post.date}>{new Date(post.date).toLocaleDateString()}</time> · {post.author}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-12">
        <div className="flex items-baseline justify-between mb-4">
          <h2 className="text-2xl font-bold">{t("home.latestAIProducts")}</h2>
          <Link to="/ai-products" className="text-sm text-brand hover:underline">
            {t("common.viewAll")}
          </Link>
        </div>
        {latestProducts.length === 0 ? null : (
          <div className="grid gap-6 md:grid-cols-2">
            {latestProducts.map((post) => {
              const resolved = aiProductsDataSource.resolve(post, currentLocale);
              return (
                <article key={post.slug} className="rounded-xl border p-6 hover:shadow-sm transition-shadow bg-card">
                  <h3 className="text-lg font-semibold">
                    <Link to={`/ai-products/${post.slug}`} className="hover:text-brand transition-colors">
                      {resolved.title}
                    </Link>
                  </h3>
                  <p className="text-sm text-muted-foreground mt-2 line-clamp-3">{resolved.description}</p>
                  <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                    <span className="font-medium text-foreground">{post.product.name}</span>
                    <span aria-hidden="true">·</span>
                    <span>{post.product.category}</span>
                    <span aria-hidden="true">·</span>
                    <time dateTime={post.date} className="tabular-nums">{post.date}</time>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </>
  );
};

export default Index;
