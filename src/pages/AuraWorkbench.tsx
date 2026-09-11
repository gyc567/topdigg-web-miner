import { useTranslation } from "react-i18next";
import { normalizeLang } from "@/lib/locale";
import { localizeText } from "@/lib/locale";
import auraMeta from "@/lib/aura-meta.json";
import { SEO } from "@/components/SEO";

const PLATFORM_ICONS: Record<string, string> = {
  Windows: "🪟",
  macOS: "🍎",
};

const PLATFORM_COLORS: Record<string, string> = {
  Windows: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  macOS: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
};

const AuraWorkbench = () => {
  const { t, i18n } = useTranslation();
  const currentLocale = normalizeLang(i18n.language);
  const meta = auraMeta as typeof auraMeta;

  return (
    <>
      <SEO
        title={t("auraWorkbench.indexTitle", "Aura 智能工作台")}
        description={localizeText(meta.description, currentLocale)}
        path="/aura-workbench"
      />

      <div className="container py-10">
        <div className="max-w-2xl mx-auto">

          {/* Header */}
          <header className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 mb-4">
              <span className="text-3xl">🔮</span>
            </div>
            <h1 className="text-3xl font-bold mb-2">{t("auraWorkbench.indexTitle", "Aura 智能工作台")}</h1>
            <p className="text-muted-foreground text-lg">
              {localizeText(meta.description, currentLocale)}
            </p>
          </header>

          {/* Version badge */}
          <div className="flex items-center justify-center gap-3 mb-8">
            <span className="px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300">
              v{meta.version.replace("v", "")}
            </span>
            <span className="text-sm text-muted-foreground">{meta.date}</span>
          </div>

          {/* Download cards */}
          <section className="space-y-3 mb-8">
            <h2 className="text-sm font-medium text-muted-foreground mb-3">
              {t("auraWorkbench.downloadTitle", "下载安装包")}
            </h2>
            {meta.downloads.map((dl, idx) => (
              <a
                key={idx}
                href={dl.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-4 rounded-xl border hover:shadow-md hover:border-primary/50 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{PLATFORM_ICONS[dl.platform] || "📦"}</span>
                  <div>
                    <p className="font-medium">{dl.platform} {dl.arch}</p>
                    <p className="text-sm text-muted-foreground">{dl.file}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground">{dl.size}</span>
                  <span className="px-3 py-1 rounded-md text-sm font-medium bg-primary text-primary-foreground group-hover:opacity-90 transition-opacity">
                    {t("common.visit", "下载")}
                  </span>
                </div>
              </a>
            ))}
          </section>

          {/* Warnings */}
          <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl p-4 mb-6">
            <p className="text-sm text-amber-800 dark:text-amber-200">
              ⚠️ {localizeText(meta.warnings, currentLocale)}
            </p>
          </div>

          {/* Contact */}
          <footer className="text-center">
            <p className="text-sm text-muted-foreground">
              {t("auraWorkbench.contact", "联系方式")}：Eric | {t("auraWorkbench.wechat", "微信")}：360369487
            </p>
          </footer>

        </div>
      </div>
    </>
  );
};

export default AuraWorkbench;
