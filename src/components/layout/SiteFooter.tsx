import { siteConfig } from "@/config/site";

export const SiteFooter = () => {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t">
      <div className="container py-8 text-sm text-muted-foreground flex flex-col md:flex-row gap-4 items-center justify-between">
        <p>
          © {year} {siteConfig.siteName}. 保留所有权利。
        </p>
        <p>
          由 TopDigg 构建 — 专注挖掘 Web 流量与商业机会。
        </p>
      </div>
    </footer>
  );
};
