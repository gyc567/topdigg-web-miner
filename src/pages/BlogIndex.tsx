import { useState, useMemo, useRef, useEffect, useDeferredValue } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { SearchX, ChevronLeft, ChevronRight } from "lucide-react";

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

const POSTS_PER_PAGE = 12;

// Safe fallback display: prefer localized text, fall back to first available language.
// Handles edge case where a post has no localized content (empty string) for current locale.
const displayTitle = (post: BlogMeta): string =>
  post.title || Object.values(post.title).find(Boolean) || post.slug;
const displayDesc = (post: BlogMeta): string =>
  post.description || Object.values(post.description).find(Boolean) || "";

const matchesQuery = (post: BlogMeta, query: string): boolean => {
  if (!query.trim()) return true;
  const q = query.toLowerCase();
  const title = displayTitle(post).toLowerCase();
  const desc = displayDesc(post).toLowerCase();
  return (
    title.includes(q) ||
    desc.includes(q) ||
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

  const [currentPage, setCurrentPage] = useState(1);

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

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredPosts.length / POSTS_PER_PAGE));
  const startIndex = (currentPage - 1) * POSTS_PER_PAGE;
  const paginatedPosts = filteredPosts.slice(startIndex, startIndex + POSTS_PER_PAGE);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedQuery, selectedTags, selectedCategory]);

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
    setCurrentPage(1);
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
        {totalPages > 1 && (
          <span className="ml-2">
            — {t("blog.pageOf", { page: currentPage, total: totalPages })}
          </span>
        )}
      </div>

      {/* Posts grid — paginated 2-column list */}
      {filteredPosts.length > 0 ? (
        <>
          <div className="grid gap-6 md:grid-cols-2">
            {paginatedPosts.map((post) => (
              <article key={post.slug} className="rounded-xl border p-6 hover:shadow-sm transition-shadow">
                <h2 className="text-xl font-semibold">
                  <Link
                    to={`/blog/${post.slug}`}
                    className="hover:text-brand transition-colors"
                  >
                    {displayTitle(post)}
                  </Link>
                </h2>
                <p className="text-sm text-muted-foreground mt-2">
                  {displayDesc(post)}
                </p>
                <div className="mt-3 text-xs text-muted-foreground">
                  <time dateTime={post.date}>
                    {new Date(post.date).toLocaleDateString()}
                  </time>
                  {" · "}
                  {post.author}
                  {" · "}
                  {post.tags.slice(0, 3).join(" / ")}
                </div>
              </article>
            ))}
          </div>
          {totalPages > 1 && (
            <PaginationNav
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          )}
        </>
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

// PaginationNav: previous/next buttons + page number buttons
function PaginationNav({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  // Build page number buttons with ellipsis
  const pages: (number | "...")[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (currentPage > 3) pages.push("...");
    for (
      let i = Math.max(2, currentPage - 1);
      i <= Math.min(totalPages - 1, currentPage + 1);
      i++
    ) {
      pages.push(i);
    }
    if (currentPage < totalPages - 2) pages.push("...");
    pages.push(totalPages);
  }

  return (
    <nav className="mt-8 flex items-center justify-center gap-1" aria-label="pagination">
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
        aria-label="Previous page"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      {pages.map((page, idx) =>
        page === "..." ? (
          <span key={`ellipsis-${idx}`} className="px-2 text-muted-foreground">
            …
          </span>
        ) : (
          <Button
            key={page}
            variant={page === currentPage ? "default" : "outline"}
            size="sm"
            onClick={() => onPageChange(page)}
          >
            {page}
          </Button>
        )
      )}

      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
        aria-label="Next page"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </nav>
  );
}

export default BlogIndex;
