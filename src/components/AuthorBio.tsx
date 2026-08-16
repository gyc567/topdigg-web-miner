import { useTranslation } from "react-i18next";

export const AuthorBio = () => {
  const { t } = useTranslation();

  return (
    <div className="border-t mt-8 pt-8">
      <h3 className="text-lg font-semibold mb-4">{t("footer.aboutAuthor")}</h3>
      <div className="flex flex-col gap-4">
        <div>
          <p className="font-medium text-foreground">{t("footer.authorName")}</p>
          <p className="text-sm text-muted-foreground">{t("footer.authorTitle")}</p>
        </div>

        <div>
          <p className="text-sm font-medium mb-2">{t("footer.contactTitle")}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">{t("footer.email")}:</span>
              <a href="mailto:gyc567@gmail.com" className="text-primary hover:underline">gyc567@gmail.com</a>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">{t("footer.twitter")}:</span>
              <a href="https://twitter.com/EricBlock2100" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">@EricBlock2100 ↗</a>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">{t("footer.wechat")}:</span>
              <span className="text-foreground">360369487</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">{t("footer.telegram")}:</span>
              <a href="https://t.me/fatoshi_block" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">https://t.me/fatoshi_block ↗</a>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">{t("footer.telegramChannel")}:</span>
              <a href="https://t.me/cryptochanneleric" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">https://t.me/cryptochanneleric ↗</a>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">{t("footer.cryptoGroup")}:</span>
              <a href="https://t.me/btcgogopen" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">https://t.me/btcgogopen ↗</a>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">{t("footer.youtube")}:</span>
              <a href="https://www.youtube.com/@0XBitFinance" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">@0XBitFinance ↗</a>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">{t("footer.personalBlog")}:</span>
              <a href="https://www.topdigg.com/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">topdigg.com ↗</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
