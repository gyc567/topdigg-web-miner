import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import zhHans from "./locales/zh-Hans/translation.json";
import zhHant from "./locales/zh-Hant/translation.json";
import en from "./locales/en/translation.json";
import ja from "./locales/ja/translation.json";
import vi from "./locales/vi/translation.json";
import { defaultLocale } from "./lib/locale";

void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      "zh-Hans": { translation: zhHans },
      "zh-Hant": { translation: zhHant },
      en: { translation: en },
      ja: { translation: ja },
      vi: { translation: vi },
    },
    fallbackLng: ["en", defaultLocale],
    interpolation: { escapeValue: false },
    detection: {
      order: ["querystring", "localStorage", "navigator"],
      lookupQuerystring: "lang",
      caches: ["localStorage"],
    },
    react: {
      useSuspense: false,
    },
  });

export default i18n;
