import { useTranslation } from "react-i18next";
import { normalizeLang } from "@/lib/locale";
import { localizeText } from "@/lib/locale";
import auraMeta from "@/lib/aura-meta.json";
import { SEO } from "@/components/SEO";
import {
  Shield,
  Cpu,
  Layers,
  Presentation,
  Smartphone,
  Lock,
  Sparkles,
  AlertTriangle,
  Monitor,
  Download,
} from "lucide-react";

const FEATURE_ICONS = [Shield, Cpu, Layers, Presentation, Smartphone, Lock];

const PLATFORM_COLORS: Record<string, string> = {
  Windows: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  macOS: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
};

const AuraWorkbench = () => {
  const { t, i18n } = useTranslation();
  const currentLocale = normalizeLang(i18n.language);
  const meta = auraMeta as typeof auraMeta;

  const features = [
    { key: "f1", Icon: FEATURE_ICONS[0] },
    { key: "f2", Icon: FEATURE_ICONS[1] },
    { key: "f3", Icon: FEATURE_ICONS[2] },
    { key: "f4", Icon: FEATURE_ICONS[3] },
    { key: "f5", Icon: FEATURE_ICONS[4] },
    { key: "f6", Icon: FEATURE_ICONS[5] },
  ];

  const platformIcons: Record<string, React.ElementType> = {
    Windows: Monitor,
    macOS: Monitor,
  };

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
              <Sparkles className="w-8 h-8 text-white" aria-hidden="true" />
            </div>
            <h1 className="text-3xl font-bold mb-2">{t("auraWorkbench.indexTitle", "Aura 智能工作台")}</h1>
            <p className="text-muted-foreground text-lg">
              {localizeText(meta.description, currentLocale)}
            </p>
          </header>

          {/* Features */}
          <section className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10" aria-label={t("auraWorkbench.indexTitle", "Aura 智能工作台")}>
            {features.map(({ key, Icon }) => (
              <div
                key={key}
                className="flex items-start gap-3 p-4 rounded-xl border bg-card text-card-foreground hover:shadow-md transition-shadow"
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-purple-600 dark:text-purple-400" aria-hidden="true" />
                </div>
                <div>
                  <h3 className="font-medium text-sm mb-1">
                    {t(`auraWorkbench.features.${key}.title`)}
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {t(`auraWorkbench.features.${key}.desc`)}
                  </p>
                </div>
              </div>
            ))}
          </section>

          {/* Version badge */}
          <div className="flex items-center justify-center gap-3 mb-8">
            <span className="px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300">
              v{meta.version.replace("v", "")}
            </span>
            <span className="text-sm text-muted-foreground">{meta.date}</span>
          </div>

          {/* Download cards */}
          <section className="space-y-3 mb-8" aria-label={t("auraWorkbench.downloadTitle", "下载安装包")}>
            <h2 className="text-sm font-medium text-muted-foreground mb-3">
              {t("auraWorkbench.downloadTitle", "下载安装包")}
            </h2>
            {meta.downloads.map((dl) => {
              const PlatformIcon = platformIcons[dl.platform] || Download;
              return (
                <a
                  key={dl.url}
                  href={dl.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-4 rounded-xl border hover:shadow-md hover:border-primary/50 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                      <PlatformIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" aria-hidden="true" />
                    </div>
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
              );
            })}
          </section>

          {/* Warnings */}
          <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl p-4 mb-6">
            <p className="text-sm text-amber-800 dark:text-amber-200 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" aria-hidden="true" />
              <span>{localizeText(meta.warnings, currentLocale)}</span>
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
