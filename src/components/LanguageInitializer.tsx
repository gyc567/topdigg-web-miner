import { useEffect } from "react";
import i18n from "@/i18n";
import { normalizeLang, SupportedLocale } from "@/lib/locale";
import { useGeoLanguage } from "@/hooks/useGeoLanguage";

const getQueryLang = (): SupportedLocale | null => {
  const params = new URLSearchParams(window.location.search);
  const lang = params.get("lang");
  return lang ? normalizeLang(lang) : null;
};

export const LanguageInitializer = () => {
  const geo = useGeoLanguage();

  useEffect(() => {
    const stored = localStorage.getItem("lang");
    const query = getQueryLang();

    const next = query || (stored ? normalizeLang(stored) : null) || geo;
    if (next && i18n.language !== next) {
      void i18n.changeLanguage(next);
      localStorage.setItem("lang", next);
    }
  }, [geo]);

  return null;
};
