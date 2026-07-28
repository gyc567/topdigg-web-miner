import { useTranslation } from "react-i18next";
import { normalizeLang, type SupportedLocale } from "@/lib/locale";

/**
 * Returns the current i18n language normalized to one of the supported locales.
 * Prevents unsupported browser locales (e.g. "en-US") from breaking
 * localized object lookups.
 */
export const useSupportedLocale = (): SupportedLocale => {
  const { i18n } = useTranslation();
  return normalizeLang(i18n.language);
};
