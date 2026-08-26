import { useParams } from "react-router-dom";
import { SEO } from "@/components/SEO";
import { getColumnById, siteConfig } from "@/config/site";
import { useTranslation } from "react-i18next";
import { localizeText, normalizeLang } from "@/lib/locale";

const ColumnPage = () => {
  const { id } = useParams();
  const { i18n, t } = useTranslation();
  const currentLocale = normalizeLang(i18n.language);
  const column = id ? getColumnById(id) : undefined;

  if (!column) {
    return (
      <>
        <SEO title={t("column.notFoundTitle")} description={t("column.notFoundDesc")} path={`/columns/${id}`} noIndex />
        <div className="py-20 text-center text-muted-foreground">{t("column.notFoundDesc")}</div>
      </>
    );
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `${localizeText(column.title, currentLocale)} Top 5 账户`,
    itemListElement: column.topAccounts.slice(0, 5).map((acc, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      item: {
        "@type": "Organization",
        name: acc.name,
        url: acc.url,
      },
    })),
  };

  return (
    <>
      <SEO
        title={localizeText(column.title, currentLocale)}
        description={localizeText(column.description, currentLocale)}
        path={`/columns/${column.id}`}
        jsonLd={jsonLd}
      />
      <header className="mb-6">
        <h1 className="text-3xl font-bold">{localizeText(column.title, currentLocale)}</h1>
        <p className="text-muted-foreground mt-2">{localizeText(column.description, currentLocale)}</p>
      </header>

    <section className="grid gap-4 md:grid-cols-2">
      {column.topAccounts.map((acc) => (
        <article key={acc.url} className="rounded-xl border p-5 flex items-center justify-between hover:shadow-sm transition-shadow">
          <div>
            <h2 className="text-lg font-semibold">{acc.name}</h2>
            {acc.handle && (
              <p className="text-sm text-muted-foreground">{acc.handle}</p>
            )}
          </div>
          <a
            href={acc.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-brand hover:underline"
          >
            {/* i18n common visit */}
            {t("common.visit")}
          </a>
        </article>
      ))}
    </section>
    </>
  );
};

export default ColumnPage;
