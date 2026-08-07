import { SEO } from "@/components/SEO";
import { useTranslation } from "react-i18next";

const Contact = () => {
  const { t } = useTranslation();

  return (
    <>
      <SEO title={t("pages.contact.title")} description={t("pages.contact.seoDesc")} path="/contact" />

      <article className="max-w-3xl mx-auto py-12 space-y-10">
        <header>
          <h1 className="text-4xl font-bold mb-4">{t("pages.contact.h1")}</h1>
        </header>

        <section>
          <p className="text-muted-foreground leading-relaxed">{t("pages.contact.intro")}</p>
        </section>

        <section className="grid gap-4 sm:grid-cols-2">
          <a
            href="https://twitter.com/topdigg"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-4 p-5 rounded-xl border hover:shadow-sm transition-shadow"
          >
            <svg className="w-6 h-6 shrink-0" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
            <div>
              <div className="font-semibold">Twitter / X</div>
              <div className="text-sm text-muted-foreground">@topdigg</div>
            </div>
          </a>

          <a
            href="https://www.reddit.com/r/topdigg/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-4 p-5 rounded-xl border hover:shadow-sm transition-shadow"
          >
            <svg className="w-6 h-6 shrink-0" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z"/></svg>
            <div>
              <div className="font-semibold">Reddit</div>
              <div className="text-sm text-muted-foreground">r/topdigg</div>
            </div>
          </a>
        </section>

        <section className="rounded-xl border p-6">
          <h2 className="text-xl font-semibold mb-3">{t("pages.contact.businessTitle")}</h2>
          <p className="text-muted-foreground">{t("pages.contact.businessDesc")}</p>
        </section>
      </article>
    </>
  );
};

export default Contact;
