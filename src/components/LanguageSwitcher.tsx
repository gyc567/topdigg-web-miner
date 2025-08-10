import { useTranslation } from "react-i18next";
import { supportedLocales } from "@/lib/locale";

export const LanguageSwitcher = () => {
  const { i18n, t } = useTranslation();

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
          {t(`languages.${l}`)}
        </option>
      ))}
    </select>
  );
};
