/**
 * BlogDataSource — dual-file strategy:
 *
 *   blog-meta.json  (13 KB)  → metadata only (slug, title, description, date, author, tags)
 *                              Loaded eagerly; used by Index + BlogIndex + build-routes
 *
 *   blog-data.json  (654 KB) → full content (all languages); lazily imported by BlogPost
 *                              Only needed when the user actually reads a post.
 *
 * The split keeps the main JS bundle small for listing/home pages.
 */
import type { BlogPost } from "@/config/site";
import metaData from "./blog-meta.json";

export type BlogMeta = Omit<BlogPost, "content">;

export class BlogDataSource {
  private static _instance: BlogDataSource;
  private _posts: BlogMeta[];

  private constructor() {
    this._posts = (metaData.posts as BlogMeta[]) ?? [];
  }

  public static getInstance(): BlogDataSource {
    if (!BlogDataSource._instance) {
      BlogDataSource._instance = new BlogDataSource();
    }
    return BlogDataSource._instance;
  }

  /** Returns all posts (metadata only). Safe to call eagerly. */
  getPosts(): BlogMeta[] {
    return this._posts;
  }

  /**
   * Returns a post by slug.
   * NOTE: this returns metadata only. The `content` field is always undefined.
   * For full content use getPostWithContent(slug) instead.
   */
  getPostBySlug(slug: string): BlogMeta | undefined {
    return this._posts.find((p) => p.slug === slug);
  }

  /**
   * Loads blog-data.json lazily and returns the full BlogPost (including content).
   * Only call this on the detail page — it imports ~654 KB.
   */
  async getPostWithContent(slug: string): Promise<BlogPost | undefined> {
    const { default: fullData } = await import("./blog-data.json");
    return (fullData.posts as BlogPost[]).find((p) => p.slug === slug);
  }
}

export const blogDataSource = BlogDataSource.getInstance();
