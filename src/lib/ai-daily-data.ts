/**
 * AIDailyDataSource — AI日报数据加载层
 *
 * 模式与 BlogDataSource 完全一致：
 *   - src/lib/ai-daily-meta.json     → 全语言元数据（用于slug查找 + build-routes）
 *   - src/lib/ai-daily-meta-{locale}.json → per-locale元数据（~10KB，按需加载）
 *   - src/lib/ai-daily-data.json     → 全量内容（含Markdown，懒加载）
 *
 * 单日多篇过滤：同一自然日只保留一篇（slug字典序最大 = 最新）
 */
import type { SupportedLocale } from "@/lib/locale";
import { normalizeLang } from "@/lib/locale";
import metaDataAll from "./ai-daily-meta.json";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type AIDailySource = {
  aggregator: string;
  aggregator_url?: string;
  original: {
    name: string;
    url?: string;
  };
};

export type AIDailyMeta = {
  slug: string;
  title: string | Record<string, string>;
  description: string | Record<string, string>;
  date: string;
  author: string;
  tags: string[];
  categories: string[];
  source: AIDailySource;
};

export type AIDailyPost = AIDailyMeta & {
  content: string | Record<string, string>;
};

// ---------------------------------------------------------------------------
// Locale → module map (static, tree-shakeable)
// ---------------------------------------------------------------------------

const localeMetaModules = {
  "zh-Hans": () => import("./ai-daily-meta-zh-Hans.json"),
  "zh-Hant": () => import("./ai-daily-meta-zh-Hant.json"),
  en: () => import("./ai-daily-meta-en.json"),
  ja: () => import("./ai-daily-meta-ja.json"),
  vi: () => import("./ai-daily-meta-vi.json"),
} as const;

type LocaleKey = keyof typeof localeMetaModules;

// ---------------------------------------------------------------------------
// Helper: localise text field
// ---------------------------------------------------------------------------

function resolveText(
  value: string | Record<string, string> | undefined,
  lang: SupportedLocale
): string {
  if (!value) return "";
  if (typeof value === "string") return value;
  return (
    value[lang] ||
    value["zh-Hans"] ||
    value.en ||
    Object.values(value).find(Boolean) ||
    ""
  );
}

// ---------------------------------------------------------------------------
// Singleton
// ---------------------------------------------------------------------------

export class AIDailyDataSource {
  private static _instance: AIDailyDataSource;
  private _cache: Map<string, AIDailyMeta[]> = new Map();
  private _allBySlug: Map<string, AIDailyMeta> = new Map();

  private constructor() {
    const all = (metaDataAll as any).reports as AIDailyMeta[] ?? [];
    this._allBySlug = new Map(all.map((r) => [r.slug, r]));
  }

  public static getInstance(): AIDailyDataSource {
    if (!AIDailyDataSource._instance) {
      AIDailyDataSource._instance = new AIDailyDataSource();
    }
    return AIDailyDataSource._instance;
  }

  // ---------------------------------------------------------------------------
  // Public API
  // ---------------------------------------------------------------------------

  /** Synchronous: all reports (all languages), metadata only. */
  getReports(): AIDailyMeta[] {
    return [...this._allBySlug.values()];
  }

  /** Async: reports localised for a given locale, deduplicated (one per date). */
  async getReportsLocalized(locale: SupportedLocale): Promise<AIDailyMeta[]> {
    if (this._cache.has(locale)) {
      return this._cache.get(locale)!;
    }

    const keyedLocale = locale as LocaleKey;
    const loader = localeMetaModules[keyedLocale] ?? localeMetaModules["zh-Hans"];
    const mod = await loader();
    const raw: AIDailyMeta[] = (mod as any).reports ?? [];

    // Deduplicate: one report per date (keep latest by slug)
    const byDate = new Map<string, AIDailyMeta>();
    for (const r of raw) {
      const existing = byDate.get(r.date);
      if (!existing || r.slug > existing.slug) {
        byDate.set(r.date, r);
      }
    }

    const sorted = [...byDate.values()].sort((a, b) =>
      b.date.localeCompare(a.date)
    );
    this._cache.set(locale, sorted);
    return sorted;
  }

  /** Sync: look up by slug from the all-language index. */
  getReportBySlug(slug: string): AIDailyMeta | undefined {
    return this._allBySlug.get(slug);
  }

  /** Async: load full content (includes Markdown) lazily. */
  async getReportWithContent(slug: string): Promise<AIDailyPost | undefined> {
    const meta = this._allBySlug.get(slug);
    if (!meta) return undefined;

    try {
      const { default: fullData } = await import("./ai-daily-data.json");
      const all: AIDailyPost[] = (fullData as any).reports ?? [];
      return all.find((r) => r.slug === slug);
    } catch {
      return undefined;
    }
  }

  /** Resolve a text field to the current locale (for React components). */
  resolve(meta: AIDailyMeta | AIDailyPost, locale: SupportedLocale) {
    const normalized = normalizeLang(locale) as SupportedLocale;
    return {
      ...meta,
      title: resolveText(meta.title, normalized),
      description: resolveText(meta.description, normalized),
      content: "content" in meta ? resolveText(meta.content, normalized) : undefined,
    };
  }
}

export const aiDailyDataSource = AIDailyDataSource.getInstance();
