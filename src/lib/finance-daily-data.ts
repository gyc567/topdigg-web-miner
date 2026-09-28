/**
 * FinanceDailyDataSource — 财经简报数据加载层
 *
 * 模式与 AIDailyDataSource / BlogDataSource 完全一致：
 *   - src/lib/finance-daily-meta.json     → 全语言元数据（用于slug查找 + build-routes）
 *   - src/lib/finance-daily-meta-{locale}.json → per-locale元数据（~10KB，按需加载）
 *   - src/lib/finance-daily-data.json     → 全量内容（含Markdown，懒加载）
 *
 * 单日多篇过滤：同一自然日只保留一篇（slug字典序最大 = 最新）
 */
import type { SupportedLocale } from "@/lib/locale";
import { normalizeLang } from "@/lib/locale";
import metaDataAll from "./finance-daily-meta.json";

type MetaManifest = { reports: FinanceDailyMeta[] };
type ContentManifest = { reports: FinanceDailyPost[] };

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type FinanceDailySource = {
  original: {
    name: string | Record<string, string>;
    url?: string;
  };
};

export type FinanceDailyMeta = {
  slug: string;
  title: string | Record<string, string>;
  description: string | Record<string, string>;
  date: string;
  author: string;
  tags: string[];
  categories: string[];
  source: FinanceDailySource;
};

export type FinanceDailyPost = FinanceDailyMeta & {
  content: string | Record<string, string>;
};

// ---------------------------------------------------------------------------
// Locale → module map (static, tree-shakeable)
// ---------------------------------------------------------------------------

const localeMetaModules = {
  "zh-Hans": () => import("./finance-daily-meta-zh-Hans.json"),
  "zh-Hant": () => import("./finance-daily-meta-zh-Hant.json"),
  en: () => import("./finance-daily-meta-en.json"),
  ja: () => import("./finance-daily-meta-ja.json"),
  vi: () => import("./finance-daily-meta-vi.json"),
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

export class FinanceDailyDataSource {
  private static _instance: FinanceDailyDataSource;
  private _cache: Map<string, FinanceDailyMeta[]> = new Map();
  private _allBySlug: Map<string, FinanceDailyMeta> = new Map();

  private constructor() {
    const all = (metaDataAll as MetaManifest).reports ?? [];
    this._allBySlug = new Map(all.map((r) => [r.slug, r]));
  }

  public static getInstance(): FinanceDailyDataSource {
    if (!FinanceDailyDataSource._instance) {
      FinanceDailyDataSource._instance = new FinanceDailyDataSource();
    }
    return FinanceDailyDataSource._instance;
  }

  // ---------------------------------------------------------------------------
  // Public API
  // ---------------------------------------------------------------------------

  /** Synchronous: all reports (all languages), metadata only. */
  getReports(): FinanceDailyMeta[] {
    return [...this._allBySlug.values()];
  }

  /** Async: reports localised for a given locale, deduplicated (one per date). */
  async getReportsLocalized(locale: SupportedLocale): Promise<FinanceDailyMeta[]> {
    if (this._cache.has(locale)) {
      return this._cache.get(locale)!;
    }

    const keyedLocale = locale as LocaleKey;
    const loader = localeMetaModules[keyedLocale] ?? localeMetaModules["zh-Hans"];
    const mod = await loader();
    const raw: FinanceDailyMeta[] = (mod as MetaManifest).reports ?? [];

    // Deduplicate: one report per date (keep latest by slug)
    const byDate = new Map<string, FinanceDailyMeta>();
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
  getReportBySlug(slug: string): FinanceDailyMeta | undefined {
    return this._allBySlug.get(slug);
  }

  /** Async: load full content (includes Markdown) lazily. */
  async getReportWithContent(slug: string): Promise<FinanceDailyPost | undefined> {
    const meta = this._allBySlug.get(slug);
    if (!meta) return undefined;

    try {
      const { default: fullData } = await import("./finance-daily-data.json");
      const all: FinanceDailyPost[] = (fullData as ContentManifest).reports ?? [];
      return all.find((r) => r.slug === slug);
    } catch {
      return undefined;
    }
  }

  /** Resolve a text field to the current locale (for React components). */
  resolve(meta: FinanceDailyMeta | FinanceDailyPost, locale: SupportedLocale) {
    const normalized = normalizeLang(locale) as SupportedLocale;
    return {
      ...meta,
      title: resolveText(meta.title, normalized),
      description: resolveText(meta.description, normalized),
      content: "content" in meta ? resolveText(meta.content, normalized) : undefined,
      source: {
        ...meta.source,
        original: {
          ...meta.source.original,
          name: resolveText(meta.source.original.name, normalized),
        },
      },
    };
  }
}

export const financeDailyDataSource = FinanceDailyDataSource.getInstance();
