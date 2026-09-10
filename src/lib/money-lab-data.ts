/**
 * MoneyLabDataSource — same three-tier strategy as BlogDataSource:
 *
 *   money-lab-meta-{locale}.json  → metadata only, pre-localized (for list page)
 *   money-lab-meta.json           → all languages metadata (for slug lookups)
 *   money-lab-data/{slug}.json    → full content for ONE post (lazy loaded)
 *   money-lab-data.json           → legacy monolith (not used by client)
 */
import type { MoneyLabPost } from "@/config/site";
import { normalizeLang, type SupportedLocale } from "@/lib/locale";
import metaDataAll from "./money-lab-meta.json";

// Re-export types for consumers
export type MoneyLabMeta = Omit<MoneyLabPost, "content">;

// Locale → module map
const localeMetaModules = {
  "zh-Hans": () => import("./money-lab-meta-zh-Hans.json"),
  "zh-Hant": () => import("./money-lab-meta-zh-Hant.json"),
  en: () => import("./money-lab-meta-en.json"),
  ja: () => import("./money-lab-meta-ja.json"),
  vi: () => import("./money-lab-meta-vi.json"),
} as const;

// Per-slug content loaders
const slugLoaders = import.meta.glob<{ default: MoneyLabPost }>("./money-lab-data/*.json");

function loaderFor(slug: string): (() => Promise<{ default: MoneyLabPost }>) | undefined {
  return slugLoaders[`./money-lab-data/${slug}.json`];
}

export class MoneyLabDataSource {
  private static _instance: MoneyLabDataSource;
  private _posts: MoneyLabMeta[];

  private constructor() {
    this._posts = (metaDataAll.posts as MoneyLabMeta[]) ?? [];
  }

  public static getInstance(): MoneyLabDataSource {
    if (!MoneyLabDataSource._instance) {
      MoneyLabDataSource._instance = new MoneyLabDataSource();
    }
    return MoneyLabDataSource._instance;
  }

  getPosts(): MoneyLabMeta[] {
    return this._posts;
  }

  async getPostsLocalized(locale: SupportedLocale): Promise<MoneyLabMeta[]> {
    const loader = localeMetaModules[locale] ?? localeMetaModules["zh-Hans"];
    const module = await loader();
    return (module.default.posts as MoneyLabMeta[]) ?? [];
  }

  getPostBySlug(slug: string): MoneyLabMeta | undefined {
    return this._posts.find((p) => p.slug === slug);
  }

  async getPostWithContent(slug: string): Promise<MoneyLabPost | undefined> {
    const loader = loaderFor(slug);
    if (loader) {
      try {
        const mod = await loader();
        return mod.default;
      } catch {
        // Fallback to metadata-only
      }
    }
    return this.getPostBySlug(slug);
  }
}

export const moneyLabDataSource = MoneyLabDataSource.getInstance();
