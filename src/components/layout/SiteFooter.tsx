import { Link } from "react-router-dom";
import { siteConfig } from "@/config/site";
import { useTranslation } from "react-i18next";
import { AuthorBio } from "@/components/AuthorBio";

export const SiteFooter = () => {
  const { t } = useTranslation();
  const year = new Date().getFullYear();
  return (
    <footer className="border-t">
      <div className="container py-8">
        <div className="text-sm text-muted-foreground flex flex-col md:flex-row gap-4 items-center justify-between mb-8">
          <p>
            {t("footer.rights", { year, siteName: siteConfig.siteName })}
          </p>
          <p>
            <Link to="/" className="hover:text-foreground">{siteConfig.siteName}</Link>
            {" · "}
            {t("footer.builtBy", { siteName: siteConfig.siteName })}
          </p>
        </div>
        <AuthorBio />
      </div>
    </footer>
  );
};
