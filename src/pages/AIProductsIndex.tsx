/**
 * AI产品分析 列表页
 *
 * 纯网格布局（用户决策 B），按发布日期降序，不引入 TagFilter / CategoryFilter / 搜索。
 * 数据源：aiProductsDataSource.getPostsLocalized(locale) — 懒加载 per-locale meta JSON。
 */
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { SearchX } from "lucide-react";

import { SEO } from "@/components/SEO";
import { siteConfig } from "@/config/site";
import { normalizeLang, type SupportedLocale } from "@/lib/locale";
import { aiProductsDataSource, type AIProductMeta } from "@/lib/ai-products-data";
import { makeCollectionPageSchema } from "@/lib/jsonld";

const AIProductsIndex = () => {
  const { t, i18n } = useTranslation();
  const currentLocale = normalizeLang(i18n.language) as SupportedLocale;
  const [posts, setPosts] = useState<AIProductMeta[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    aiProductsDataSource.getPostsLocalized(currentLocale).then((data) => {
      setPosts(data);
      setLoading(false);
    });
  }, [currentLocale]);

  const jsonLd = makeCollectionPageSchema({
    title: t("aiProducts.indexTitle"),
    description: t("aiProducts.indexDesc"),
    url: "/ai-products",
    items: posts.slice(0, 10).map((p, i) => ({
      name: aiProductsDataSource.resolve(p, currentLocale).title,
      url: `${siteConfig.baseUrl}/ai-products/${p.slug}`,
      position: i + 1,
    })),
  });

  if (loading) {
    return (
      <>
        <SEO title={t("aiProducts.indexTitle")} description={t("aiProducts.indexDesc")} path="/ai-products" />
        <header className="mb-8">
          <h1 className="text-3xl font-bold mb-2">{t("aiProducts.heroTitle")}</h1>
          <p className="text-muted-foreground">{t("aiProducts.heroDesc")}</p>
        </header>
        <div className="grid gap-6 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-xl border p-6 animate-pulse">
              <div className="h-6 bg-muted rounded w-3/4 mb-3" />
              <div className="h-4 bg-muted rounded w-full mb-2" />
              <div className="h-4 bg-muted rounded w-2/3" />
            </div>
          ))}
        </div>
      </>
    );
  }

  return (
    <>
      <SEO
        title={t("aiProducts.indexTitle")}
        description={t("aiProducts.indexDesc")}
        path="/ai-products"
        jsonLd={jsonLd}
        breadcrumbs={[
          { name: siteConfig.siteName, url: siteConfig.baseUrl },
          { name: t("aiProducts.indexTitle"), url: `${siteConfig.baseUrl}/ai-products` },
        ]}
      />

      <header className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{t("aiProducts.heroTitle")}</h1>
        <p className="text-muted-foreground">{t("aiProducts.heroDesc")}</p>
      </header>

      {posts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <SearchX className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-lg font-medium">{t("aiProducts.emptyTitle")}</p>
          <p className="text-sm text-muted-foreground mt-1">{t("aiProducts.emptyDesc")}</p>
        </div>
      ) : (
        <>
          <div className="text-sm text-muted-foreground mb-6">
            {t("aiProducts.resultsCount", { count: posts.length })}
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {posts.map((post) => {
              const resolved = aiProductsDataSource.resolve(post, currentLocale);
              return (
                <article
                  key={post.slug}
                  className="rounded-xl border p-6 hover:shadow-sm transition-shadow bg-card"
                >
                  <h2 className="text-xl font-semibold mb-2">
                    <Link
                      to={`/ai-products/${post.slug}`}
                      className="hover:text-brand transition-colors"
                    >
                      {resolved.title}
                    </Link>
                  </h2>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                    {resolved.description}
                  </p>

                  {/* Product info strip — small, sets context */}
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground mb-3">
                    <span className="font-medium text-foreground">{post.product.name}</span>
                    <span aria-hidden="true">·</span>
                    <span>{post.product.category}</span>
                    <span aria-hidden="true">·</span>
                    <span className="tabular-nums">{post.product.launch_date}</span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <time dateTime={post.date} className="tabular-nums">{post.date}</time>
                    <span aria-hidden="true">·</span>
                    <span>{post.author}</span>
                    <Link
                      to={`/ai-products/${post.slug}`}
                      className="ml-auto text-primary hover:underline flex items-center gap-1 text-xs font-medium"
                    >
                      {t("aiProducts.readMore")} →
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        </>
      )}
    </>
  );
};

export default AIProductsIndex;
