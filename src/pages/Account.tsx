/**
 * Account — subscription management page (pay.topdigg.com)
 */
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import { useAuth, useAccess } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { CheckCircle2, ExternalLink, X } from "lucide-react";

export function Account() {
  const { t } = useTranslation();
  const { user, loading: authLoading, signOut } = useAuth();
  const { subscription, loading: subLoading } = useAccess(user?.id);
  const [purchased, setPurchased] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("purchased") === "1") {
      setPurchased(true);
      window.history.replaceState({}, "", "/account");
    }
  }, []);

  if (authLoading) {
    return <div className="py-20 text-center text-muted-foreground">{t("common.loading", "加载中...")}</div>;
  }

  if (!user) {
    return (
      <div className="max-w-md mx-auto py-20 text-center">
        <p className="text-muted-foreground mb-4">{t("moneyLab.account.signInRequired", "请先登录")}</p>
        <Button asChild>
          <a href="/">{t("account.backHome", "回到首页")}</a>
        </Button>
      </div>
    );
  }

  const handleCancel = () => {
    // Paddle manages subscriptions server-side; user can cancel via Paddle Customer Portal
    window.open("https://checkout.paddle.com/subscription/" + (subscription?.paddle_subscription_id ?? ""), "_blank");
  };

  return (
    <div className="max-w-2xl mx-auto py-10">
      {purchased && (
        <div className="mb-6 p-4 rounded-xl bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-green-600" />
          <p className="text-green-700 dark:text-green-300">{t("moneyLab.account.purchaseSuccess", "支付成功！会员已激活")}</p>
        </div>
      )}

      <h1 className="text-2xl font-bold mb-6">{t("moneyLab.account.title", "会员中心")}</h1>

      <div className="rounded-2xl border bg-card p-6 mb-6">
        <p className="text-sm text-muted-foreground mb-1">{t("moneyLab.account.user", "登录账号")}</p>
        <p className="font-medium">{user.email}</p>
      </div>

      <div className="rounded-2xl border bg-card p-6 mb-6">
        <p className="text-sm text-muted-foreground mb-1">{t("moneyLab.account.currentPlan", "当前套餐")}</p>
        {subLoading ? (
          <p className="text-muted-foreground">{t("common.loading", "加载中...")}</p>
        ) : subscription ? (
          <>
            <p className="text-2xl font-bold mb-2">
              {subscription.plan === "yearly" ? t("moneyLab.paywall.yearlyTitle", "年度会员") : t("moneyLab.paywall.monthlyTitle", "月度会员")}
            </p>
            <p className="text-sm text-muted-foreground">
              {t("moneyLab.account.expiresAt", "有效期至")}: {new Date(subscription.current_period_end).toLocaleDateString()}
            </p>
            {subscription.cancel_at_period_end && (
              <p className="text-sm text-amber-600 mt-1">{t("moneyLab.account.cancelPending", "已设置到期不续费")}</p>
            )}
            <div className="flex gap-2 mt-4">
              <Button onClick={handleCancel} variant="outline" className="gap-2">
                <ExternalLink className="w-4 h-4" />
                {t("moneyLab.account.manageBilling", "管理订阅")}
              </Button>
              <Button onClick={signOut} variant="ghost" className="gap-2">
                <X className="w-4 h-4" />
                {t("account.signOut", "退出登录")}
              </Button>
            </div>
          </>
        ) : (
          <p className="text-muted-foreground">{t("moneyLab.account.noSubscription", "暂无会员订阅")}</p>
        )}
      </div>
    </div>
  );
}