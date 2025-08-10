import { Link, NavLink } from "react-router-dom";
import { siteConfig } from "@/config/site";
import { LanguageSwitcher } from "../LanguageSwitcher";

export const SiteHeader = () => {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container h-16 flex items-center justify-between">
        <Link to="/" className="font-extrabold text-xl tracking-tight">
          <span className="bg-gradient-to-r from-brand to-primary bg-clip-text text-transparent">
            {siteConfig.siteName}
          </span>
        </Link>
        <nav className="hidden md:flex items-center gap-6" aria-label="主导航">
          {siteConfig.nav.main.map((item) => (
            <NavLink
              key={item.href}
              to={item.href}
              className={({ isActive }) =>
                `text-sm transition-colors ${
                  isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                }`
              }
            >
              {/* label may be localized */}
              {item.labelTranslated}
            </NavLink>
          ))}
        </nav>
        <nav className="flex items-center gap-4" aria-label="我的站点">
          {siteConfig.nav.mySites.map((item) => (
            <a
              key={item.href}
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {item.label}
            </a>
          ))}
          <LanguageSwitcher />
        </nav>
      </div>
    </header>
  );
};
