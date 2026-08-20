import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { SearchX, ExternalLink as ExternalLinkIcon } from "lucide-react";

import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { siteConfig } from "@/config/site";
import { normalizeLang, type SupportedLocale } from "@/lib/locale";
import { aiDailyDataSource } from "@/lib/ai-daily-data";
import { makeCollectionPageSchema } from "@/lib/jsonld";
import type { AIDailyMeta } from "@/lib/ai-daily-data";

const INITIAL_COUNT = 10;

const AIDailyIndex = () => {
  const { t, i18n } = useTranslation();
  const currentLocale = normalizeLang(i18n.language) as SupportedLocale;
  const [reports, setReports] = useState<AIDailyMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(INITIAL_COUNT);

  useEffect(() => {
    setLoading(true);
    aiDailyDataSource.getReportsLocalized(currentLocale).then((data) => {
      setReports(data);
      setLoading(false);
      setVisibleCount(INITIAL_COUNT);
    });
  }, [currentLocale]);

  const visible = reports.slice(0, visibleCount);
  const hasMore = visibleCount < reports.length;

  // Group by date for timeline view
  const grouped = visible.reduce<{ date: string; reports: AIDailyMeta[] }[]>(
    (acc, report) => {
      const existing = acc.find((g) => g.date === report.date);
      if (existing) {
        existing.reports.push(report);
      } else {
        acc.push({ date: report.date, reports: [report] });
      }
      return acc;
    },
    []
  );

  const loadMore = () => setVisibleCount((c) => c + INITIAL_COUNT);

  const jsonLd = makeCollectionPageSchema({
    title: t("aiDaily.indexTitle"),
    description: t("aiDaily.indexDesc"),
    url: "/ai-daily",
    items: reports.slice(0, 10).map((r, i) => ({
      name: aiDailyDataSource.resolve(r, currentLocale).title,
      url: `${siteConfig.baseUrl}/ai-daily/${r.slug}`,
      position: i + 1,
    })),
  });

  const formatDate = (dateStr: string, locale: string) => {
    const d = new Date(dateStr);
    const localeMap: Record<string, string> = {
      "zh-Hans": "zh-CN",
      "zh-Hant": "zh-TW",
      en: "en-US",
      ja: "ja-JP",
      vi: "vi-VN",
    };
    return d.toLocaleDateString(localeMap[locale] || "en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const isToday = (dateStr: string) => {
    const today = new Date().toISOString().split("T")[0];
    return dateStr === today;
  };

  if (loading) {
    return (
      <>
        <SEO title={t("aiDaily.indexTitle")} description={t("aiDaily.indexDesc")} path="/ai-daily" />
        <header className="mb-8">
          <h1 className="text-3xl font-bold">{t("aiDaily.indexTitle")}</h1>
          <p className="text-muted-foreground mt-2">{t("aiDaily.indexDesc")}</p>
        </header>
        <div className="space-y-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-xl border p-6 animate-pulse">
              <div className="h-5 bg-muted rounded w-1/3 mb-3" />
              <div className="h-4 bg-muted rounded w-full mb-2" />
              <div className="h-4 bg-muted rounded w-2/3" />
            </div>
          ))}
        </div>
      </>
    );
  }

  return (
    <>
      <SEO
        title={t("aiDaily.indexTitle")}
        description={t("aiDaily.indexDesc")}
        path="/ai-daily"
        jsonLd={jsonLd}
      />

      <header className="mb-8">
        <h1 className="text-3xl font-bold">{t("aiDaily.indexTitle")}</h1>
        <p className="text-muted-foreground mt-2">{t("aiDaily.indexDesc")}</p>
      </header>

      {reports.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <SearchX className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-lg font-medium">{t("aiDaily.noReports")}</p>
          <p className="text-sm text-muted-foreground mt-1">{t("aiDaily.noReportsHint")}</p>
        </div>
      ) : (
        <>
          <div className="text-sm text-muted-foreground mb-6">
            {t("aiDaily.resultsCount", { count: reports.length })}
          </div>

          <div className="relative">
            {/* Timeline vertical line */}
            <div className="absolute left-[7px] top-2 bottom-2 w-px bg-border" />

            <div className="space-y-8">
              {grouped.map((group) => {
                const dateLabel = isToday(group.date)
                  ? t("aiDaily.today")
                  : formatDate(group.date, currentLocale);

                return (
                  <div key={group.date} className="relative pl-8">
                    {/* Timeline dot */}
                    <div className="absolute left-0 top-[6px] w-4 h-4 rounded-full bg-primary border-2 border-background z-10" />

                    {/* Date label */}
                    <div className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                      {dateLabel}
                      <span className="flex-1 h-px bg-border max-w-[200px]" />
                    </div>

                    {/* Cards for this date */}
                    <div className="space-y-3">
                      {group.reports.map((report) => {
                        const resolved = aiDailyDataSource.resolve(report, currentLocale);
                        return (
                          <article
                            key={report.slug}
                            className="rounded-xl border p-5 hover:shadow-sm transition-shadow bg-card"
                          >
                            <h2 className="text-lg font-semibold mb-2">
                              <Link
                                to={`/ai-daily/${report.slug}`}
                                className="hover:text-primary transition-colors"
                              >
                                {resolved.title}
                              </Link>
                            </h2>
                            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                              {resolved.description}
                            </p>
                            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                              {/* Source badge */}
                              <Badge variant="outline" className="text-xs">
                                {t("aiDaily.source")}：
                                {report.source.aggregator_url ? (
                                  <a
                                    href={report.source.aggregator_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="hover:text-primary ml-1 underline underline-offset-2"
                                  >
                                    {report.source.aggregator}
                                    <ExternalLinkIcon className="inline h-3 w-3 ml-0.5" />
                                  </a>
                                ) : (
                                  <span className="ml-1">{report.source.aggregator}</span>
                                )}
                              </Badge>
                              {/* Tags */}
                              {report.tags.slice(0, 3).map((tag) => (
                                <Badge key={tag} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                              <Link
                                to={`/ai-daily/${report.slug}`}
                                className="ml-auto text-primary hover:underline flex items-center gap-1 text-xs font-medium"
                              >
                                {t("aiDaily.readMore")} →
                              </Link>
                            </div>
                          </article>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {hasMore && (
            <div className="flex justify-center mt-8">
              <Button variant="outline" onClick={loadMore}>
                {t("aiDaily.loadMore")}
              </Button>
            </div>
          )}
        </>
      )}
    </>
  );
};

export default AIDailyIndex;
