/**
 * blog-categories.ts
 *
 * Normalizes mixed-language category labels (Chinese + English) into
 * consistent English slugs, with i18n labels for UI display.
 *
 * Raw categories in blog-meta.json:
 *   "AI Analysis", "AI Tools", "AI前沿", "Analysis", "Daily Report",
 *   "Deep Analysis", "Deep Dive", "Development Efficiency", "Review",
 *   "Reviews", "技术突破", "深度分析"
 */

import type { LocalizedText } from "@/config/site";

// ---------------------------------------------------------------------------
// Slug definitions
// ---------------------------------------------------------------------------

export const CATEGORY_SLUGS = [
  "ai-analysis",
  "ai-tools",
  "ai-frontier",
  "analysis",
  "daily-report",
  "deep-analysis",
  "deep-dive",
  "development-efficiency",
  "review",
  "reviews",
  "tech-breakthrough",
] as const;

export type CategorySlug = (typeof CATEGORY_SLUGS)[number];

// ---------------------------------------------------------------------------
// Raw label → slug mapping (used in build-blog.js)
// ---------------------------------------------------------------------------

export const RAW_TO_SLUG: Record<string, CategorySlug> = {
  // English
  "AI Analysis":          "ai-analysis",
  "AI Tools":            "ai-tools",
  "Analysis":            "analysis",
  "Daily Report":        "daily-report",
  "Deep Analysis":       "deep-analysis",
  "Deep Dive":           "deep-dive",
  "Development Efficiency": "development-efficiency",
  "Review":              "review",
  "Reviews":             "reviews",
  "Tech Breakthrough":   "tech-breakthrough",
  // Chinese equivalents
  "AI前沿":              "ai-frontier",
  "技术突破":            "tech-breakthrough",
  "深度分析":            "deep-analysis",
};

export const isValidSlug = (v: string): v is CategorySlug =>
  CATEGORY_SLUGS.includes(v as CategorySlug);

export const normalizeCategory = (raw: string): CategorySlug => {
  return RAW_TO_SLUG[raw] ?? "analysis";
};

// ---------------------------------------------------------------------------
// Slug → i18n label
// ---------------------------------------------------------------------------

type CategoryLabelMap = Record<CategorySlug, LocalizedText>;

export const CATEGORY_LABEL: CategoryLabelMap = {
  "ai-analysis":          { en: "AI Analysis",          "zh-Hans": "AI 分析",   "zh-Hant": "AI 分析",   ja: "AI 分析",     vi: "Phân tích AI"      },
  "ai-tools":             { en: "AI Tools",             "zh-Hans": "AI 工具",   "zh-Hant": "AI 工具",   ja: "AI ツール",   vi: "Công cụ AI"        },
  "ai-frontier":          { en: "AI Frontier",          "zh-Hans": "AI前沿",     "zh-Hant": "AI前沿",     ja: "AIフロンティア", vi: "Tiền tuyến AI"    },
  "analysis":             { en: "Analysis",             "zh-Hans": "分析",       "zh-Hant": "分析",       ja: "分析",         vi: "Phân tích"         },
  "daily-report":         { en: "Daily Report",         "zh-Hans": "每日报告",   "zh-Hant": "每日報告",   ja: "デイリーレポート", vi: "Báo cáo hàng ngày" },
  "deep-analysis":        { en: "Deep Analysis",        "zh-Hans": "深度分析",   "zh-Hant": "深度分析",   ja: "詳細分析",     vi: "Phân tích sâu"    },
  "deep-dive":            { en: "Deep Dive",            "zh-Hans": "深度分析",   "zh-Hant": "深度分析",   ja: "深掘り",       vi: "Phân tích sâu"    },
  "development-efficiency":{ en: "Dev Efficiency",      "zh-Hans": "开发效率",   "zh-Hant": "開發效率",   ja: "開発効率",     vi: "Hiệu quả phát triển" },
  "review":               { en: "Review",               "zh-Hans": "评测",       "zh-Hant": "評測",       ja: "レビュー",     vi: "Đánh giá"          },
  "reviews":              { en: "Reviews",              "zh-Hans": "评测",       "zh-Hant": "評測",       ja: "レビュー",     vi: "Đánh giá"          },
  "tech-breakthrough":    { en: "Tech Breakthrough",   "zh-Hans": "技术突破",   "zh-Hant": "技術突破",   ja: "技術突破口",   vi: "Đột phá công nghệ" },
};

// ---------------------------------------------------------------------------
// "All" option (not a real slug)
// ---------------------------------------------------------------------------
export const CATEGORY_ALL_SLUG = "all";
export type CategoryFilterValue = CategorySlug | typeof CATEGORY_ALL_SLUG;
