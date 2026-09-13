/**
 * CheckoutSuccess — landing page after Paddle checkout successUrl.
 * Listens for `paddle:checkout:completed` event (per Paddle v2 docs).
 */
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { CheckCircle2, ArrowRight, Loader2 } from "lucide-react";
import { onPaddleEvent } from "@/lib/paddle";

export function CheckoutSuccess() {
  const { t } = useTranslation();
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    // Listen for Paddle's in-page completion event
    const off = onPaddleEvent("paddle:checkout:completed", (e) => {
      setCompleted(true);
      // Notify other tabs (pay.topdigg.com → www.topdigg.com)
      try {
        localStorage.setItem("purchase-completed", JSON.stringify({
          slug: new URLSearchParams(window.location.search).get("slug") ?? "",
          timestamp: Date.now(),
        }));
      } catch {
        // ignore
      }
      window.dispatchEvent(new CustomEvent("purchase-completed", {
        detail: { slug: new URLSearchParams(window.location.search).get("slug") ?? "" },
      }));
    });
    return off;
  }, []);

  // Auto-detect from URL params (when Paddle redirects here via successUrl)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("status") === "completed" || params.get("transaction_id")) {
      setCompleted(true);
    }
  }, []);

  if (!completed) {
    return (
      <div className="max-w-md mx-auto py-20 text-center">
        <Loader2 className="w-12 h-12 text-muted-foreground mx-auto mb-4 animate-spin" />
        <p className="text-muted-foreground">{t("moneyLab.success.processing", "支付处理中...")}</p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto py-20 text-center">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/40 mb-6">
        <CheckCircle2 className="w-8 h-8 text-green-600" />
      </div>
      <h1 className="text-2xl font-bold mb-2">{t("moneyLab.success.title", "支付成功！")}</h1>
      <p className="text-muted-foreground mb-6">{t("moneyLab.success.desc", "您的会员已激活，正在为您解锁全部案例...")}</p>
      <a
        href={(() => {
          const slug = new URLSearchParams(window.location.search).get("slug");
          return slug ? `https://www.topdigg.com/money-lab/${slug}` : "https://www.topdigg.com/money-lab";
        })()}
        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-medium"
      >
        {t("moneyLab.success.cta", "返回案例")}
        <ArrowRight className="w-4 h-4" />
      </a>
    </div>
  );
}