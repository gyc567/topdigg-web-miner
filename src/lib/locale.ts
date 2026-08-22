export type SupportedLocale = "zh-Hans" | "zh-Hant" | "en" | "ja" | "vi";

export const supportedLocales: SupportedLocale[] = [
  "zh-Hans",
  "zh-Hant",
  "en",
  "ja",
  "vi",
];

export const defaultLocale: SupportedLocale = "zh-Hans";

export const ogLocaleMap: Record<SupportedLocale, string> = {
  "zh-Hans": "zh_CN",
  "zh-Hant": "zh_TW",
  en: "en_US",
  ja: "ja_JP",
  vi: "vi_VN",
};

export const htmlLangMap: Record<SupportedLocale, string> = {
  "zh-Hans": "zh-Hans",
  "zh-Hant": "zh-Hant",
  en: "en",
  ja: "ja",
  vi: "vi",
};

export const countryToLocale = (countryCode?: string): SupportedLocale => {
  const cc = (countryCode || "").toUpperCase();
  if (["CN", "SG"].includes(cc)) return "zh-Hans";
  if (["TW", "HK", "MO"].includes(cc)) return "zh-Hant";
  if (cc === "JP") return "ja";
  if (cc === "VN") return "vi";
  return "en";
};

export const normalizeLang = (lang?: string): SupportedLocale => {
  const l = (lang || "").toLowerCase();
  if (!l) return defaultLocale;
  if (l.startsWith("zh-hant") || l === "zh-tw" || l === "zh-hk") return "zh-Hant";
  if (l.startsWith("zh") || l === "zh-cn" || l === "zh-sg") return "zh-Hans";
  if (l.startsWith("ja")) return "ja";
  if (l.startsWith("vi")) return "vi";
  return "en";
};

export type I18nText = string | Partial<Record<SupportedLocale, string>>;

export const localizeText = (value: I18nText, lang: SupportedLocale): string => {
  if (typeof value === "string") return value;
  return (
    value[lang] ||
    value.en ||
    value[defaultLocale] ||
    Object.values(value).find(Boolean) ||
    ""
  );
};

/**
 * Appends ?lang= query param for internal i18n routing.
 * NOTE: canonical and hreflang must NOT use this — they must be clean URLs.
 */
export const withLangParam = (url: string, lang: SupportedLocale): string => {
  const hasQuery = url.includes("?");
  const sep = hasQuery ? "&" : "?";
  return `${url}${sep}lang=${lang}`;
};

/**
 * Returns clean canonical/hreflang URL (no ?lang= query param).
 * Self-referencing: the canonical of /blog/slug is /blog/slug (not /blog/slug?lang=en).
 */
export const canonicalUrl = (url: string): string => url;
