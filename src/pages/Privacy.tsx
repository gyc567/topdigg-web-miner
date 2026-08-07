import { SEO } from "@/components/SEO";
import { useTranslation } from "react-i18next";

const Privacy = () => {
  const { t } = useTranslation();

  return (
    <>
      <SEO title={t("pages.privacy.title")} description={t("pages.privacy.seoDesc")} path="/privacy" />

      <article className="max-w-3xl mx-auto py-12 space-y-8">
        <header>
          <h1 className="text-4xl font-bold mb-2">{t("pages.privacy.h1")}</h1>
          <p className="text-sm text-muted-foreground">{t("pages.privacy.lastUpdated")}</p>
        </header>

        <section>
          <h2 className="text-xl font-semibold mb-3">{t("pages.privacy.collectTitle")}</h2>
          <p className="text-muted-foreground leading-relaxed">{t("pages.privacy.collectDesc")}</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">{t("pages.privacy.cookieTitle")}</h2>
          <p className="text-muted-foreground leading-relaxed">{t("pages.privacy.cookieDesc")}</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">{t("pages.privacy.thirdTitle")}</h2>
          <p className="text-muted-foreground leading-relaxed">{t("pages.privacy.thirdDesc")}</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">{t("pages.privacy.contactTitle")}</h2>
          <p className="text-muted-foreground leading-relaxed">{t("pages.privacy.contactDesc")}</p>
        </section>
      </article>
    </>
  );
};

export default Privacy;
