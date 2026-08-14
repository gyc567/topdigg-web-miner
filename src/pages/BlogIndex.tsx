import { useState, useMemo, useRef, useEffect, useDeferredValue } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { SearchX } from "lucide-react";
import { useVirtualizer } from "@tanstack/react-virtual";

import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/config/site";
import { normalizeLang, type SupportedLocale } from "@/lib/locale";
import { blogDataSource, type BlogMeta } from "@/lib/blog-data";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { BlogSearch } from "@/components/blog/BlogSearch";
import { TagFilterBar } from "@/components/blog/TagFilterBar";
import { CategoryFilter } from "@/components/blog/CategoryFilter";
import type { CategorySlug } from "@/lib/blog-categories";
import { CATEGORY_ALL_SLUG } from "@/lib/blog-categories";

const matchesQuery = (post: BlogMeta, query: string): boolean => {
  if (!query.trim()) return true;
  const q = query.toLowerCase();
  return (
    post.title.toLowerCase().includes(q) ||
    post.description.toLowerCase().includes(q) ||
    post.tags.join(" ").toLowerCase().includes(q) ||
    post.author.toLowerCase().includes(q)
  );
};

const BlogIndex = () => {
  const { t, i18n } = useTranslation();
  const currentLocale = normalizeLang(i18n.language);

  // Load locale-specific posts (80 KB vs 430 KB)
  const [posts, setPosts] = useState<BlogMeta[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    blogDataSource.getPostsLocalized(currentLocale as SupportedLocale).then((localized) => {
      setPosts(localized);
      setLoading(false);
    });
  }, [currentLocale]);

  const [searchQuery, setSearchQuery] = useState("");
  const debouncedQuery = useDebouncedValue(searchQuery, 150);
  // Deferred value: filter runs at lower priority so typing stays responsive
  const deferredQuery = useDeferredValue(debouncedQuery);
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
      if (deferredQuery.trim() && !matchesQuery(post, deferredQuery)) {
        return false;
      }
      return true;
    });
  }, [posts, deferredQuery, selectedTags, selectedCategory]);

  // Track whether a deferred search is still pending (shows stale state indicator)
  const isSearching = debouncedQuery !== deferredQuery;

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

  if (loading) {
    return (
      <>
        <SEO title={t("blog.indexTitle")} description={t("blog.indexDesc")} path="/blog" />
        <header className="mb-6">
          <h1 className="text-3xl font-bold">{t("blog.indexTitle")}</h1>
          <p className="text-muted-foreground mt-2">{t("blog.indexDesc")}</p>
        </header>
        <div className="grid gap-6 md:grid-cols-2">
          {Array.from({ length: 6 }).map((_, i) => (
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
      <div ref={resultRef} className="mb-4 text-sm text-muted-foreground flex items-center gap-2">
        {isSearching ? (
          <span className="inline-block h-3 w-3 rounded-full border border-muted-foreground/30 border-t-muted-foreground animate-spin" />
        ) : null}
        <span>{t("blog.resultsCount", { count: filteredPosts.length })}</span>
      </div>

      {/* Posts grid — virtualized 2-column list */}
      {filteredPosts.length > 0 ? (
        <VirtualGrid posts={filteredPosts} />
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

// VirtualGrid: renders only visible rows in a 2-column CSS grid
// Uses @tanstack/react-virtual for windowing — DOM nodes go from ~500 to ~20
function VirtualGrid({ posts }: { posts: BlogMeta[] }) {
  const parentRef = useRef<HTMLDivElement>(null);

  const rowVirtualizer = useVirtualizer({
    count: Math.ceil(posts.length / 2),
    getScrollElement: () => parentRef.current,
    estimateSize: () => 180, // estimated row height in px
    overscan: 3,
  });

  return (
    <div
      ref={parentRef}
      className="overflow-auto"
      style={{ maxHeight: "calc(100vh - 280px)" }}
    >
      <div
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
          width: "100%",
          position: "relative",
        }}
      >
        {rowVirtualizer.getVirtualItems().map((virtualRow) => {
          const leftPost = posts[virtualRow.index * 2];
          const rightPost = posts[virtualRow.index * 2 + 1];

          return (
            <div
              key={virtualRow.key}
              className="grid gap-6 md:grid-cols-2"
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: `${virtualRow.size}px`,
                transform: `translateY(${virtualRow.start}px)`,
              }}
            >
              {leftPost && (
                <article className="rounded-xl border p-6 hover:shadow-sm transition-shadow">
                  <h2 className="text-xl font-semibold">
                    <Link
                      to={`/blog/${leftPost.slug}`}
                      className="hover:text-brand transition-colors"
                    >
                      {leftPost.title}
                    </Link>
                  </h2>
                  <p className="text-sm text-muted-foreground mt-2">
                    {leftPost.description}
                  </p>
                  <div className="mt-3 text-xs text-muted-foreground">
                    <time dateTime={leftPost.date}>
                      {new Date(leftPost.date).toLocaleDateString()}
                    </time>
                    {" · "}
                    {leftPost.author}
                    {" · "}
                    {leftPost.tags.slice(0, 3).join(" / ")}
                  </div>
                </article>
              )}
              {rightPost && (
                <article className="rounded-xl border p-6 hover:shadow-sm transition-shadow">
                  <h2 className="text-xl font-semibold">
                    <Link
                      to={`/blog/${rightPost.slug}`}
                      className="hover:text-brand transition-colors"
                    >
                      {rightPost.title}
                    </Link>
                  </h2>
                  <p className="text-sm text-muted-foreground mt-2">
                    {rightPost.description}
                  </p>
                  <div className="mt-3 text-xs text-muted-foreground">
                    <time dateTime={rightPost.date}>
                      {new Date(rightPost.date).toLocaleDateString()}
                    </time>
                    {" · "}
                    {rightPost.author}
                    {" · "}
                    {rightPost.tags.slice(0, 3).join(" / ")}
                  </div>
                </article>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default BlogIndex;
