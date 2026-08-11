import { useState, useMemo, useRef } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { SearchX } from "lucide-react";

import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/config/site";
import { localizeText, normalizeLang } from "@/lib/locale";
import { blogDataSource, type BlogMeta } from "@/lib/blog-data";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { BlogSearch } from "@/components/blog/BlogSearch";
import { TagFilterBar } from "@/components/blog/TagFilterBar";
import { CategoryFilter } from "@/components/blog/CategoryFilter";
import type { CategorySlug } from "@/lib/blog-categories";
import { CATEGORY_ALL_SLUG } from "@/lib/blog-categories";

const matchesQuery = (post: BlogMeta, query: string, locale: string): boolean => {
  if (!query.trim()) return true;
  const q = query.toLowerCase();
  return (
    localizeText(post.title as any, locale as any).toLowerCase().includes(q) ||
    localizeText(post.description as any, locale as any).toLowerCase().includes(q) ||
    post.tags.join(" ").toLowerCase().includes(q) ||
    post.author.toLowerCase().includes(q)
  );
};

const BlogIndex = () => {
  const posts = blogDataSource.getPosts();
  const { t, i18n } = useTranslation();
  const currentLocale = normalizeLang(i18n.language);

  const [searchQuery, setSearchQuery] = useState("");
  const debouncedQuery = useDebouncedValue(searchQuery, 150);
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());
  const [selectedCategory, setSelectedCategory] = useState<CategorySlug | typeof CATEGORY_ALL_SLUG>(
    CATEGORY_ALL_SLUG
  );

  const resultRef = useRef<HTMLDivElement>(null);

  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      if (selectedCategory !== CATEGORY_ALL_SLUG && !post.categories.includes(selectedCategory)) {
        return false;
      }
      if (selectedTags.size > 0) {
        if (![...selectedTags].every((tag) => post.tags.includes(tag))) {
          return false;
        }
      }
      if (debouncedQuery.trim() && !matchesQuery(post, debouncedQuery, currentLocale)) {
        return false;
      }
      return true;
    });
  }, [posts, debouncedQuery, selectedTags, selectedCategory, currentLocale]);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) => {
      const next = new Set(prev);
      if (next.has(tag)) {
        next.delete(tag);
      } else {
        next.add(tag);
      }
      return next;
    });
  };

  const clearAll = () => {
    setSearchQuery("");
    setSelectedTags(new Set());
    setSelectedCategory(CATEGORY_ALL_SLUG);
    resultRef.current?.scrollIntoView({ block: "nearest" });
  };

  const hasFilters =
    searchQuery !== "" || selectedTags.size > 0 || selectedCategory !== CATEGORY_ALL_SLUG;

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

      <header className="mb-6">
        <h1 className="text-3xl font-bold">{t("blog.indexTitle")}</h1>
        <p className="text-muted-foreground mt-2">{t("blog.indexDesc")}</p>
      </header>

      {/* Search */}
      <div className="mb-4">
        <BlogSearch value={searchQuery} onChange={setSearchQuery} autoFocus />
      </div>

      {/* Filters row */}
      <div className="flex flex-wrap gap-3 items-center mb-6">
        <TagFilterBar posts={posts} selectedTags={selectedTags} onToggleTag={toggleTag} />
        <CategoryFilter value={selectedCategory} onChange={setSelectedCategory} />
        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={clearAll} className="text-xs">
            {t("blog.clearAll")}
          </Button>
        )}
      </div>

      {/* Results summary */}
      <div ref={resultRef} className="mb-4 text-sm text-muted-foreground">
        {t("blog.resultsCount", { count: filteredPosts.length })}
      </div>

      {/* Posts grid */}
      {filteredPosts.length > 0 ? (
        <section className="grid gap-6 md:grid-cols-2" tabIndex={-1}>
          {filteredPosts.map((post) => (
            <article
              key={post.slug}
              className="rounded-xl border p-6 hover:shadow-sm transition-shadow"
            >
              <h2 className="text-xl font-semibold">
                <Link
                  to={`/blog/${post.slug}`}
                  className="hover:text-brand transition-colors"
                >
                  {localizeText(post.title as any, currentLocale as any)}
                </Link>
              </h2>
              <p className="text-sm text-muted-foreground mt-2">
                {localizeText(post.description as any, currentLocale as any)}
              </p>
              <div className="mt-3 text-xs text-muted-foreground">
                <time dateTime={post.date}>{new Date(post.date).toLocaleDateString()}</time>
                {" · "}
                {post.author}
                {" · "}
                {post.tags.slice(0, 3).join(" / ")}
              </div>
            </article>
          ))}
        </section>
      ) : (
        /* Empty state */
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <SearchX className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-lg font-medium">{t("blog.noResults")}</p>
          <p className="text-sm text-muted-foreground mt-1 mb-4">{t("blog.noResultsHint")}</p>
          <Button variant="outline" size="sm" onClick={clearAll}>
            {t("blog.clearAll")}
          </Button>
        </div>
      )}
    </>
  );
};

export default BlogIndex;
