/**
 * AI产品分析 详情页
 *
 * 结构：ProductCard（产品速览） + MarkdownContent（正文） + AuthorBio + RelatedPosts + FAQ
 * JSON-LD：Article + FAQ + BreadcrumbList + （有 pricing 时）Product offers schema
 */
import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft } from "lucide-react";

import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import MarkdownContent from "@/components/MarkdownContent";
import { ProductCard } from "@/components/ProductCard";
import { AuthorBio } from "@/components/AuthorBio";
import { siteConfig } from "@/config/site";
import {
  normalizeLang,
  localizeText,
  type SupportedLocale,
} from "@/lib/locale";
import { aiProductsDataSource, type AIProductMeta } from "@/lib/ai-products-data";
import type { AIProduct } from "@/config/site";
import {
  makeArticleSchema,
  makeBreadcrumbList,
  makeFAQPageSchema,
  makeProductSchema,
} from "@/lib/jsonld";

// Related products: up to 3 sharing at least one tag, excluding current
function RelatedProducts({ currentSlug, tags }: { currentSlug: string; tags: string[] }) {
  const { t, i18n } = useTranslation();
  const currentLocale = normalizeLang(i18n.language);
  const [allPosts, setAllPosts] = useState<AIProductMeta[]>([]);

  useEffect(() => {
    setAllPosts(aiProductsDataSource.getPosts());
  }, []);

  const related = useMemo(() => {
    return allPosts
      .filter((p) => p.slug !== currentSlug && p.tags.some((tag) => tags.includes(tag)))
      .sort((a, b) => {
        const aMatch = a.tags.filter((t) => tags.includes(t)).length;
        const bMatch = b.tags.filter((t) => tags.includes(t)).length;
        return bMatch - aMatch;
      })
      .slice(0, 3);
  }, [allPosts, currentSlug, tags]);

  if (related.length === 0) return null;

  return (
    <section className="border-t mt-12 pt-8">
      <h2 className="text-xl font-semibold mb-4">{t("aiProducts.related", "Related Products")}</h2>
      <div className="grid gap-4 md:grid-cols-3">
        {related.map((post) => (
          <Link
            key={post.slug}
            to={`/ai-products/${post.slug}`}
            className="block rounded-lg border p-4 hover:shadow-sm transition-shadow"
          >
            <h3 className="font-medium text-sm line-clamp-2 hover:text-brand transition-colors">
              {localizeText(post.title, currentLocale)}
            </h3>
            <time className="text-xs text-muted-foreground mt-2 block">{post.date}</time>
          </Link>
        ))}
      </div>
    </section>
  );
}

const AIProductsPost = () => {
  const { slug } = useParams();
  const { t, i18n } = useTranslation();
  const currentLocale = normalizeLang(i18n.language) as SupportedLocale;

  const [fullPost, setFullPost] = useState<AIProduct | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) {
      setLoading(false);
      return;
    }
    setLoading(true);
    aiProductsDataSource.getPostWithContent(slug).then((post) => {
      setFullPost(post ?? null);
      setLoading(false);
    });
  }, [slug]);

  if (loading) {
    return (
      <div className="py-20 text-center text-muted-foreground">
        {t("aiProducts.post.loading", "Loading…")}
      </div>
    );
  }

  if (!fullPost) {
    return (
      <>
        <SEO
          title={t("aiProducts.post.notFoundTitle")}
          description={t("aiProducts.post.notFoundMsg")}
          path={`/ai-products/${slug}`}
          noIndex
        />
        <div className="py-16 text-center text-muted-foreground">
          <p className="text-lg font-medium mb-2">{t("aiProducts.post.notFoundMsg")}</p>
          <p className="text-sm mb-6">slug: <code>{slug}</code></p>
          <Button asChild variant="outline">
            <Link to="/ai-products">
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t("aiProducts.indexTitle")}
            </Link>
          </Button>
        </div>
      </>
    );
  }

  const postPath = `/ai-products/${fullPost.slug}`;
  const titleStr = localizeText(fullPost.title, currentLocale);
  const descStr = localizeText(fullPost.description, currentLocale);
  const contentStr = localizeText(fullPost.content, currentLocale);

  // Build JSON-LD: Article + BreadcrumbList + FAQ + (optional) Product offers
  const articleSchema = makeArticleSchema({
    title: titleStr,
    description: descStr,
    url: postPath,
    datePublished: fullPost.date,
    authorName: fullPost.author,
    tags: fullPost.tags,
  });

  const breadcrumbSchema = makeBreadcrumbList([
    { name: "Home", url: `${siteConfig.baseUrl}/` },
    { name: t("aiProducts.indexTitle"), url: `${siteConfig.baseUrl}/ai-products` },
    { name: titleStr, url: `${siteConfig.baseUrl}${postPath}` },
  ]);

  const faqSchema = makeFAQPageSchema({
    mainEntity: [
      {
        question: `What is ${fullPost.product.name}?`,
        answer: `${fullPost.product.name} is a ${fullPost.product.category} launched ${fullPost.product.launch_date}. ${descStr}`,
      },
      {
        question: `How does ${fullPost.product.name} make money?`,
        answer: fullPost.product.revenue
          ? `${fullPost.product.name} reports ${fullPost.product.revenue}. ${fullPost.product.pricing_model ?? ""}`
          : fullPost.product.pricing_model ?? "",
      },
      {
        question: "How often is content on TopDigg updated?",
        answer: "AI Products analyses are added regularly as new products reach monetization milestones.",
      },
    ],
  });

  const hasPricingArray = Array.isArray(fullPost.pricing) && fullPost.pricing.length > 0;
  const productSchema = hasPricingArray
    ? makeProductSchema({
        name: fullPost.product.name,
        description: descStr,
        url: postPath,
        category: fullPost.product.category,
        brand: fullPost.product.name,
        offers: fullPost.pricing!.map((p) => ({
          price: p.price ?? 0,
          priceCurrency: p.currency,
          name: p.plan,
        })),
      })
    : null;

  const jsonLd = productSchema
    ? [articleSchema, breadcrumbSchema, faqSchema, productSchema]
    : [articleSchema, breadcrumbSchema, faqSchema];

  const breadcrumbs = [
    { name: "Home", url: `${siteConfig.baseUrl}/` },
    { name: t("aiProducts.indexTitle"), url: `${siteConfig.baseUrl}/ai-products` },
    { name: titleStr, url: `${siteConfig.baseUrl}${postPath}` },
  ];

  return (
    <>
      <SEO
        title={titleStr}
        description={descStr}
        path={postPath}
        type="article"
        jsonLd={jsonLd}
        breadcrumbs={breadcrumbs}
        publishedTime={fullPost.date}
        author={fullPost.author}
      />

      <article className="max-w-none">
        <header className="mb-6">
          <h1 className="text-4xl font-bold mb-3">{titleStr}</h1>
          <p className="text-lg text-muted-foreground mb-3">{descStr}</p>
          <div className="text-sm text-muted-foreground">
            <time dateTime={fullPost.date}>{fullPost.date}</time> · {fullPost.author} · {fullPost.tags.join(" / ")}
          </div>
        </header>

        {/* Product at-a-glance card */}
        <ProductCard
          product={fullPost.product}
          pricing={fullPost.pricing ?? undefined}
          metrics={fullPost.metrics ?? undefined}
          sources={fullPost.sources ?? undefined}
        />

        <MarkdownContent content={contentStr} className="mb-8" />

        <AuthorBio />

        {/* Related Products */}
        <RelatedProducts currentSlug={fullPost.slug} tags={fullPost.tags} />
      </article>
    </>
  );
};

export default AIProductsPost;
