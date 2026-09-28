import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { SearchX, ExternalLink as ExternalLinkIcon } from "lucide-react";

import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { siteConfig } from "@/config/site";
import { normalizeLang, localizeText, type SupportedLocale } from "@/lib/locale";
import { financeDailyDataSource } from "@/lib/finance-daily-data";
import { makeCollectionPageSchema } from "@/lib/jsonld";
import type { FinanceDailyMeta } from "@/lib/finance-daily-data";

const INITIAL_COUNT = 10;

const FinanceDailyIndex = () => {
  const { t, i18n } = useTranslation();
  const currentLocale = normalizeLang(i18n.language) as SupportedLocale;
  // Synchronously initialize so SSR/prerender always sees data and renders an <h1>.
  const [reports, setReports] = useState<FinanceDailyMeta[]>(() =>
    financeDailyDataSource.getReports()
  );
  const [visibleCount, setVisibleCount] = useState(INITIAL_COUNT);

  useEffect(() => {
    financeDailyDataSource.getReportsLocalized(currentLocale).then((data) => {
      setReports(data);
    });
  }, [currentLocale]);

  const visible = reports.slice(0, visibleCount);
  const hasMore = visibleCount < reports.length;

  // Group by date for timeline view
  const grouped = visible.reduce<{ date: string; reports: FinanceDailyMeta[] }[]>(
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

  if (grouped.length === 0) {
    return (
      <>
        <SEO
          title={t("financeDaily.indexTitle", "每日财经简报")}
          description={t("financeDaily.indexDesc", "每日财经市场速读")}
          path="/finance-daily"
        />
        <div className="container py-16 text-center">
          <SearchX className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h1 className="text-2xl font-semibold mb-2">
            {t("financeDaily.noReports", "暂无财经简报内容")}
          </h1>
          <p className="text-muted-foreground">
            {t("financeDaily.noReportsHint", "简报将在每天 8 点自动更新，请稍后再来")}
          </p>
        </div>
      </>
    );
  }

  const jsonLd = makeCollectionPageSchema({
    title: t("financeDaily.indexTitle", "每日财经简报"),
    description: t("financeDaily.indexDesc", "每日财经市场速读"),
    url: "/finance-daily",
    items: visible.map((r, i) => ({
      name: localizeText(r.title, currentLocale),
      url: `https://www.topdigg.com/finance-daily/${r.slug}`,
      position: i + 1,
    })),
  });

  const breadcrumbs = [
    { name: "Home", url: `${siteConfig.baseUrl}/` },
    { name: t("financeDaily.indexTitle", "每日财经简报"), url: `${siteConfig.baseUrl}/finance-daily` },
  ];

  return (
    <>
      <SEO
        title={t("financeDaily.indexTitle", "每日财经简报")}
        description={t("financeDaily.indexDesc", "每日财经市场速读")}
        path="/finance-daily"
        jsonLd={jsonLd}
        breadcrumbs={breadcrumbs}
      />

      <div className="container py-10">
        <header className="mb-8">
          <h1 className="text-3xl md:text-4xl font-extrabold mb-3">
            {t("financeDaily.indexTitle", "每日财经简报")}
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            {t("financeDaily.indexDesc", "每日财经市场速读")}
          </p>
          <p className="text-sm text-muted-foreground mt-3">
            {t("financeDaily.resultsCount", { count: reports.length }, { defaultValue: `共 ${reports.length} 期` })}
          </p>
        </header>

        <div className="space-y-8">
          {grouped.map((group) => (
            <section key={group.date}>
              <h2 className="text-xl font-bold mb-4 sticky top-16 bg-background/95 backdrop-blur py-2 z-10 border-b">
                <time dateTime={group.date}>{group.date}</time>
              </h2>
              <div className="grid gap-4 md:grid-cols-2">
                {group.reports.map((report) => (
                  <article
                    key={report.slug}
                    className="rounded-xl border p-5 hover:shadow-sm transition-shadow bg-card"
                  >
                    <h3 className="text-lg font-semibold mb-2">
                      <Link
                        to={`/finance-daily/${report.slug}`}
                        className="hover:text-primary transition-colors"
                      >
                        {localizeText(report.title, currentLocale)}
                      </Link>
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-3 mb-3">
                      {localizeText(report.description, currentLocale)}
                    </p>
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                      <div className="flex flex-wrap gap-1.5">
                        {report.tags.slice(0, 3).map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      {report.source.original.url && (
                        <a
                          href={report.source.original.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
                        >
                          {t("financeDaily.source", "来源")}
                          <ExternalLinkIcon className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            </section>
          ))}
        </div>

        {hasMore && (
          <div className="mt-8 text-center">
            <Button variant="outline" onClick={loadMore}>
              {t("financeDaily.loadMore", "加载更多")}
            </Button>
          </div>
        )}
      </div>
    </>
  );
};

export default FinanceDailyIndex;
