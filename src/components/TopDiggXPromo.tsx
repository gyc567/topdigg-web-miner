import { ArrowUpRightIcon, SparklesIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import { normalizeLang } from "@/lib/locale";

/**
 * TopDiggXPromo — 首页置顶推广「推文打分器」（TopDiggX @ x.topdigg.com）。
 *
 * 设计要点（v2 Loop Engineering）：
 *  - 与现有 Hero 视觉强差异化：鲜明品牌渐变（from-blue-600 → indigo-600 → purple-700）
 *    + 桌面端 CSS-only 9-dot 信号网格预览（零图片，LCP 友好）
 *  - 主 CTA `fetchpriority="high"`（与 logo 一档），目标成为首屏 LCP
 *  - UTM 参数 + GA4 事件埋点 `topdiggx_cta_click`（带 cta_variant / language 维度）
 *  - 5 语言 i18n（flat key，与 home.heroTitle 一致）；href lang 跟随当前 locale
 *  - a11y：aria-label、ExternalLinkIcon、focus-visible ring 沿用现有
 *  - 单 commit 可 revert，无 DB / 无 flag
 *
 * 性能预算：纯 CSS 渐变 + 系统字体 + 零图片；预计 < 2KB HTML，无新网络请求。
 */

const TOPDIGGX_URL = "https://x.topdigg.com/";
const UTM = "utm_source=topdigg&utm_medium=homepage_promo&utm_campaign=topdiggx_2026q4";

function buildHref(utm: string, anchor?: string): string {
  const url = `${TOPDIGGX_URL}?${utm}`;
  return anchor ? `${url}#${anchor}` : url;
}

function fireAnalyticsEvent(variant: "primary" | "secondary", language: string) {
  // GA4 gtag 在 Analytics.tsx 中初始化；这里只在用户点击时触发，不阻塞首屏渲染
  const w = window as unknown as { gtag?: (...args: unknown[]) => void };
  if (typeof w.gtag === "function") {
    w.gtag("event", "topdiggx_cta_click", {
      cta_variant: variant,
      language,
      surface: "homepage_hero",
    });
  }
}

export const TopDiggXPromo = () => {
  const { t, i18n } = useTranslation();
  const currentLocale = normalizeLang(i18n.language);

  // 次 CTA 锚点：x.topdigg.com 当前未提供 #signals 锚点（V1 静态隐藏次 CTA，
  // 未来若站点提供锚点可恢复）。这里注释保留路径，避免后续忘记。
  const HAS_SIGNALS_ANCHOR = false;
  const secondaryAnchor = undefined as string | undefined;

  return (
    <section
      aria-labelledby="topdiggx-promo-title"
      className="relative overflow-hidden rounded-2xl border shadow-sm mb-12
                 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700
                 text-white"
      data-surface="topdiggx-promo"
    >
      {/* 桌面端右侧：CSS-only 信号网格预览（9-dot，零图片） */}
      <div
        aria-hidden="true"
        className="hidden md:block absolute right-8 top-1/2 -translate-y-1/2
                   grid grid-cols-3 gap-2 opacity-90"
      >
        {[
          "from-cyan-300 to-blue-400",
          "from-blue-300 to-indigo-400",
          "from-indigo-300 to-purple-400",
          "from-cyan-200 to-blue-300",
          "from-pink-300 to-purple-400",
          "from-violet-300 to-purple-500",
          "from-blue-200 to-cyan-300",
          "from-fuchsia-300 to-pink-400",
          "from-indigo-200 to-blue-300",
        ].map((g, i) => (
          <span
            key={i}
            className={`block h-3 w-3 rounded-full bg-gradient-to-br ${g}
                        shadow-[0_0_12px_rgba(255,255,255,0.45)]`}
          />
        ))}
      </div>

      <div className="relative p-8 md:p-12 pr-8 md:pr-56">
        {/* Badge */}
        <span
          className="inline-flex items-center gap-1.5 rounded-full
                     bg-white/15 backdrop-blur px-3 py-1
                     text-xs font-medium text-white border border-white/20"
        >
          <SparklesIcon className="h-3.5 w-3.5" aria-hidden="true" />
          {t("home.promoBadge")}
        </span>

        {/* Title */}
        <h2
          id="topdiggx-promo-title"
          className="mt-4 text-3xl md:text-4xl font-extrabold leading-tight tracking-tight"
        >
          {t("home.promoTitle")}
        </h2>

        {/* Description */}
        <p className="mt-3 text-base md:text-lg text-white/85 max-w-xl">
          {t("home.promoDesc")}
        </p>

        {/* CTAs */}
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <a
            href={buildHref(UTM)}
            target="_blank"
            rel="noopener noreferrer"
            fetchPriority="high"
            onClick={() => fireAnalyticsEvent("primary", currentLocale)}
            aria-label={`${t("home.promoTitle")} — ${t("home.promoPrimaryCta")} (${currentLocale})`}
            className="inline-flex items-center gap-1.5 rounded-md px-5 py-2.5
                       bg-white text-blue-700 font-semibold shadow-sm
                       hover:bg-white/90 active:bg-white/80 transition-colors
                       focus-visible:outline-none focus-visible:ring-2
                       focus-visible:ring-white focus-visible:ring-offset-2
                       focus-visible:ring-offset-blue-700"
            // 主 CTA 是首屏 LCP 候选之一，提示浏览器优先抓取
          >
            <span>{t("home.promoPrimaryCta")}</span>
            <ArrowUpRightIcon className="h-4 w-4" aria-hidden="true" />
          </a>
          {HAS_SIGNALS_ANCHOR && secondaryAnchor && (
            <a
              href={buildHref(UTM, secondaryAnchor)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => fireAnalyticsEvent("secondary", currentLocale)}
              className="inline-flex items-center rounded-md px-5 py-2.5
                         border border-white/40 text-white font-medium
                         hover:bg-white/10 transition-colors
                         focus-visible:outline-none focus-visible:ring-2
                         focus-visible:ring-white focus-visible:ring-offset-2
                         focus-visible:ring-offset-blue-700"
            >
              {t("home.promoSecondaryCta")}
            </a>
          )}
        </div>

        {/* 站点域名提示（增加信任感 + 跨域可见性） */}
        <p className="mt-4 text-xs text-white/60">
          x.topdigg.com ↗
        </p>
      </div>
    </section>
  );
};

export default TopDiggXPromo;
