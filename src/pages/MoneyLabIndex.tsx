import { useState, useEffect, useMemo, useRef } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useDeferredValue } from "react";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { normalizeLang, type SupportedLocale } from "@/lib/locale";
import { moneyLabDataSource, type MoneyLabMeta } from "@/lib/money-lab-data";
import { localizeText } from "@/lib/locale";
import { SEO } from "@/components/SEO";

const POSTS_PER_PAGE = 12;

const CATEGORY_ALL_SLUG = "all";

const CATEGORIES = ["电商带货", "技能变现", "工具推荐", "信息差"] as const;
type CategorySlug = (typeof CATEGORIES)[number] | typeof CATEGORY_ALL_SLUG;

// Difficulty badge colors
const DIFFICULTY_COLORS: Record<string, string> = {
  "简单": "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
  "中等": "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
  "困难": "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
};

function matchesQuery(post: MoneyLabMeta, query: string): boolean {
  const q = query.toLowerCase();
  return (
    localizeText(post.title, "zh-Hans").toLowerCase().includes(q) ||
    localizeText(post.title, "en").toLowerCase().includes(q) ||
    localizeText(post.description, "zh-Hans").toLowerCase().includes(q) ||
    localizeText(post.description, "en").toLowerCase().includes(q) ||
    post.tags.some((t) => t.toLowerCase().includes(q))
  );
}

const MoneyLabIndex = () => {
  const { t, i18n } = useTranslation();
  const currentLocale = normalizeLang(i18n.language);

  const [posts, setPosts] = useState<MoneyLabMeta[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    moneyLabDataSource.getPostsLocalized(currentLocale as SupportedLocale).then((localized) => {
      setPosts(localized);
      setLoading(false);
    });
  }, [currentLocale]);

  const [searchQuery, setSearchQuery] = useState("");
  const debouncedQuery = useDebouncedValue(searchQuery, 150);
  const deferredQuery = useDeferredValue(debouncedQuery);
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());
  const [selectedCategory, setSelectedCategory] = useState<CategorySlug>(CATEGORY_ALL_SLUG);
  const [currentPage, setCurrentPage] = useState(1);
  const resultRef = useRef<HTMLDivElement>(null);

  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    posts.forEach((p) => p.tags.forEach((t) => tagSet.add(t)));
    return Array.from(tagSet).sort();
  }, [posts]);

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

  const isSearching = debouncedQuery !== deferredQuery;

  const totalPages = Math.max(1, Math.ceil(filteredPosts.length / POSTS_PER_PAGE));
  const startIndex = (currentPage - 1) * POSTS_PER_PAGE;
  const paginatedPosts = filteredPosts.slice(startIndex, startIndex + POSTS_PER_PAGE);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedQuery, selectedTags, selectedCategory]);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) => {
      const next = new Set(prev);
      if (next.has(tag)) next.delete(tag);
      else next.add(tag);
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

  const hasFilters = searchQuery.trim() || selectedTags.size > 0 || selectedCategory !== CATEGORY_ALL_SLUG;

  if (loading) {
    return (
      <div className="py-20 text-center text-muted-foreground">
        {t("post.loading", "Loading…")}
      </div>
    );
  }

  return (
    <>
      <SEO
        title={t("moneyLab.indexTitle", "零门槛赚钱实验室")}
        description={t("moneyLab.indexDesc", "分享真实可复制的零门槛赚钱案例")}
        path="/money-lab"
      />
      <header className="mb-8">
        <h1 className="text-3xl font-bold">{t("moneyLab.indexTitle", "零门槛赚钱实验室")}</h1>
        <p className="text-muted-foreground mt-2">{t("moneyLab.indexDesc", "分享真实可复制的零门槛赚钱案例")}</p>
      </header>

      {/* Search */}
      <div className="mb-6">
        <input
          type="search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={t("moneyLab.searchPlaceholder", "搜索案例...")}
          className="w-full md:w-80 px-4 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
      </div>

      {/* Category filters */}
      <div className="flex flex-wrap gap-2 mb-4">
        <button
          onClick={() => setSelectedCategory(CATEGORY_ALL_SLUG)}
          className={`px-3 py-1 rounded-full text-sm transition-colors ${
            selectedCategory === CATEGORY_ALL_SLUG
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:bg-muted/80"
          }`}
        >
          {t("blog.allCategories", "全部")}
        </button>
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1 rounded-full text-sm transition-colors ${
              selectedCategory === cat
                ? "bg-amber-500 text-white"
                : "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300 hover:bg-amber-200 dark:hover:bg-amber-800"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Tag filters */}
      {allTags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {allTags.slice(0, 12).map((tag) => (
            <button
              key={tag}
              onClick={() => toggleTag(tag)}
              className={`px-2 py-0.5 rounded text-xs transition-colors ${
                selectedTags.has(tag)
                  ? "bg-amber-500 text-white"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      )}

      {/* Results count & clear */}
      <div className="flex items-center justify-between mb-4" ref={resultRef}>
        <p className="text-sm text-muted-foreground">
          {isSearching ? t("blog.searching", "搜索中...") : t("blog.resultsCount", "找到 {{count}} 个案例", { count: filteredPosts.length })}
        </p>
        {hasFilters && (
          <button onClick={clearAll} className="text-sm text-primary hover:underline">
            {t("blog.clearAll", "清除筛选")}
          </button>
        )}
      </div>

      {/* Post grid */}
      {paginatedPosts.length === 0 ? (
        <div className="py-16 text-center text-muted-foreground">
          <p>{t("blog.noResults", "未找到案例")}</p>
          <p className="text-sm mt-1">{t("blog.noResultsHint", "尝试其他关键词或清除筛选")}</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {paginatedPosts.map((post) => (
            <Link
              key={post.slug}
              to={`/money-lab/${post.slug}`}
              className="group rounded-xl border p-5 flex flex-col gap-3 hover:shadow-md transition-shadow bg-card"
            >
              {/* Header: category + difficulty */}
              <div className="flex items-center gap-2 flex-wrap">
                {post.categories.map((cat) => (
                  <span
                    key={cat}
                    className="px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300"
                  >
                    {cat}
                  </span>
                ))}
                {post.difficulty && (
                  <span className={`px-2 py-0.5 rounded text-xs ${DIFFICULTY_COLORS[post.difficulty] || "bg-muted text-muted-foreground"}`}>
                    {post.difficulty}
                  </span>
                )}
              </div>

              {/* Title */}
              <h2 className="text-lg font-semibold group-hover:text-amber-600 transition-colors line-clamp-2">
                {localizeText(post.title, currentLocale as SupportedLocale)}
              </h2>

              {/* Description */}
              <p className="text-sm text-muted-foreground line-clamp-2 flex-1">
                {localizeText(post.description, currentLocale as SupportedLocale)}
              </p>

              {/* Footer: earnings + time + date */}
              <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                {post.earnings && (
                  <span className="flex items-center gap-1 text-green-600 dark:text-green-400 font-medium">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {post.earnings}
                  </span>
                )}
                {post.timeRequired && (
                  <span className="flex items-center gap-1">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {post.timeRequired}
                  </span>
                )}
                <span className="ml-auto">{post.date}</span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 rounded border text-sm disabled:opacity-50 hover:bg-muted transition-colors"
          >
            ←
          </button>
          <span className="text-sm text-muted-foreground">
            {t("blog.pageOf", "第 {{page}} 页，共 {{total}} 页", { page: currentPage, total: totalPages })}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-1 rounded border text-sm disabled:opacity-50 hover:bg-muted transition-colors"
          >
            →
          </button>
        </div>
      )}
    </>
  );
};

export default MoneyLabIndex;
