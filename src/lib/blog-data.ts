/**
 * BlogDataSource — per-locale + dual-file strategy:
 *
 *   blog-meta-{locale}.json  (~80 KB per locale) → metadata only (title/description pre-localized)
 *                                                      Loaded eagerly on BlogIndex; zero localizeText() overhead
 *
 *   blog-meta.json           (430 KB) → all languages metadata (for build-routes + BlogPost slug lookup)
 *
 *   blog-data.json           (9.9 MB) → full content (all languages); lazily imported by BlogPost
 *
 * The per-locale split reduces initial load from 430 KB → ~80 KB (80% savings).
 */
import type { BlogPost } from "@/config/site";
import { normalizeLang, type SupportedLocale } from "@/lib/locale";
import metaDataAll from "./blog-meta.json";

// Re-export types for consumers
export type BlogMeta = Omit<BlogPost, "content">;

// Locale → module map (static, tree-shakeable)
const localeMetaModules = {
  "zh-Hans": () => import("./blog-meta-zh-Hans.json"),
  "zh-Hant": () => import("./blog-meta-zh-Hant.json"),
  en: () => import("./blog-meta-en.json"),
  ja: () => import("./blog-meta-ja.json"),
  vi: () => import("./blog-meta-vi.json"),
} as const;

export class BlogDataSource {
  private static _instance: BlogDataSource;
  private _posts: BlogMeta[];

  private constructor() {
    // Default: load all-languages meta for slug lookups (build-routes, etc.)
    this._posts = (metaDataAll.posts as BlogMeta[]) ?? [];
  }

  public static getInstance(): BlogDataSource {
    if (!BlogDataSource._instance) {
      BlogDataSource._instance = new BlogDataSource();
    }
    return BlogDataSource._instance;
  }

  /** Returns all posts (all languages, metadata only). Safe to call eagerly. */
  getPosts(): BlogMeta[] {
    return this._posts;
  }

  /**
   * Returns posts localized for the given locale.
   * Uses per-locale blog-meta-{locale}.json for efficient loading (80% smaller).
   * Returns all posts with title/description already in the target locale.
   */
  async getPostsLocalized(locale: SupportedLocale): Promise<BlogMeta[]> {
    const loader = localeMetaModules[locale] ?? localeMetaModules["zh-Hans"];
    const module = await loader();
    return (module.default.posts as BlogMeta[]) ?? [];
  }

  /**
   * Returns a post by slug (all languages, metadata only).
   * NOTE: this returns metadata only. The `content` field is always undefined.
   * For full content use getPostWithContent(slug) instead.
   */
  getPostBySlug(slug: string): BlogMeta | undefined {
    return this._posts.find((p) => p.slug === slug);
  }

  /**
   * Loads blog-data.json lazily and returns the full BlogPost (including content).
   * Only call this on the detail page — it imports ~9.9 MB.
   */
  async getPostWithContent(slug: string): Promise<BlogPost | undefined> {
    const { default: fullData } = await import("./blog-data.json");
    return (fullData.posts as BlogPost[]).find((p) => p.slug === slug);
  }
}

export const blogDataSource = BlogDataSource.getInstance();
