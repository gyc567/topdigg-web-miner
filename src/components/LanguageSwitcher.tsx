import { useTranslation } from "react-i18next";
import { supportedLocales } from "@/lib/locale";

const labels: Record<string, string> = {
  "zh-Hans": "中文(简)",
  "zh-Hant": "中文(繁)",
  en: "English",
  ja: "日本語",
};

export const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  return (
    <select
      aria-label="Select language"
      className="text-sm bg-transparent border rounded-md px-2 py-1"
      value={i18n.language}
      onChange={(e) => {
        const next = e.target.value;
        void i18n.changeLanguage(next);
        localStorage.setItem("lang", next);
      }}
    >
      {supportedLocales.map((l) => (
        <option key={l} value={l}>
          {labels[l]}
        </option>
      ))}
    </select>
  );
};
