import { useParams, Link } from "react-router-dom";
import { useState, useEffect, useMemo } from "react";
import { SEO } from "@/components/SEO";
import { siteConfig } from "@/config/site";
import { useTranslation } from "react-i18next";
import { localizeText, normalizeLang } from "@/lib/locale";
import { blogDataSource } from "@/lib/blog-data";
import type { BlogMeta } from "@/lib/blog-data";
import MarkdownContent from "@/components/MarkdownContent";
import { makeArticleSchema, makeFAQPageSchema } from "@/lib/jsonld";
import type { BlogPost } from "@/config/site";
import { AuthorBio } from "@/components/AuthorBio";

// Related posts: up to 3 posts sharing at least one tag, excluding current post
function RelatedPosts({ currentSlug, tags }: { currentSlug: string; tags: string[] }) {
  const { t, i18n } = useTranslation();
  const currentLocale = normalizeLang(i18n.language);
  const [allPosts, setAllPosts] = useState<BlogMeta[]>([]);

  useEffect(() => {
    setAllPosts(blogDataSource.getPosts());
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
      <h2 className="text-xl font-semibold mb-4">{t("post.related", "Related Posts")}</h2>
      <div className="grid gap-4 md:grid-cols-3">
        {related.map((post) => (
          <Link key={post.slug} to={`/blog/${post.slug}`} className="block rounded-lg border p-4 hover:shadow-sm transition-shadow">
            <h3 className="font-medium text-sm line-clamp-2 hover:text-brand transition-colors">
              {localizeText(post.title as any, currentLocale)}
            </h3>
            <time className="text-xs text-muted-foreground mt-2 block">{post.date}</time>
          </Link>
        ))}
      </div>
    </section>
  );
}

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
  const faqSchema = makeFAQPageSchema({
    mainEntity: [
      {
        question: "Who is behind TopDigg?",
        answer: "TopDigg is created by Eric, a researcher focused on AI trends and SEO/GEO strategies.",
      },
      {
        question: "How often is content updated?",
        answer: "Blog posts are published regularly. AI Daily is updated daily with the latest AI news.",
      },
      {
        question: "Can I republish or share content from TopDigg?",
        answer: "Please contact us for content licensing and collaboration inquiries.",
      },
    ],
  });
  const jsonLd = [makeArticleSchema({
    title: localizeText(fullPost.title as any, currentLocale),
    description: localizeText(fullPost.description as any, currentLocale),
    url: postPath,
    datePublished: fullPost.date,
    authorName: fullPost.author,
    tags: fullPost.tags,
  }), faqSchema];

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
        publishedTime={fullPost.date}
        author={fullPost.author}
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
        <section className="border-t mt-8 pt-8">
          <h2 className="text-xl font-semibold mb-4">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {[
              { q: "Who is behind TopDigg?", a: "TopDigg is created by Eric, a researcher focused on AI trends and SEO/GEO strategies." },
              { q: "How often is content updated?", a: "Blog posts are published regularly. AI Daily is updated daily with the latest AI news." },
              { q: "Can I republish or share content from TopDigg?", a: "Please contact us for content licensing and collaboration inquiries." },
            ].map((item, i) => (
              <div key={i}>
                <h3 className="font-medium text-foreground">{item.q}</h3>
                <p className="text-sm text-muted-foreground mt-1">{item.a}</p>
              </div>
            ))}
          </div>
        </section>
        <AuthorBio />

        {/* Related Posts */}
        <RelatedPosts currentSlug={fullPost.slug} tags={fullPost.tags} />
      </article>
    </>
  );
};

export default BlogPost;
