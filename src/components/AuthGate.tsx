/**
 * AuthGate — paywall component.
 * Shown when user is NOT authenticated OR has not subscribed/unlocked.
 */
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Lock, Sparkles, CheckCircle2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CheckoutButton } from "@/components/CheckoutButton";
import { AuthDialog } from "@/components/AuthDialog";
import { useAuth, useAccess } from "@/lib/auth";

type AuthGateProps = {
  postSlug: string;
  postTitle: string;
};

export function AuthGate({ postSlug, postTitle }: AuthGateProps) {
  const { t } = useTranslation();
  const { user, loading: authLoading } = useAuth();
  const { hasSubscription, hasUnlock, loading: accessLoading } = useAccess(user?.id, postSlug);
  const [authOpen, setAuthOpen] = useState(false);

  if (authLoading || accessLoading) {
    return (
      <div className="my-8 rounded-xl border bg-card p-8 text-center text-muted-foreground">
        {t("common.loading", "加载中...")}
      </div>
    );
  }

  if (!user) {
    return (
      <>
        <div className="my-8 rounded-2xl border-2 border-amber-500/30 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 p-8 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/40 mb-4">
            <Lock className="w-6 h-6 text-amber-600 dark:text-amber-400" />
          </div>
          <h3 className="text-xl font-bold mb-2">{t("moneyLab.paywall.lockedTitle", "解锁完整案例")}</h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            {t("moneyLab.paywall.lockedDesc", "登录或注册，立即解锁 100+ 真实可复制的赚钱案例")}
          </p>
          <Button size="lg" onClick={() => setAuthOpen(true)} className="bg-amber-600 hover:bg-amber-700">
            {t("moneyLab.paywall.cta", "立即解锁")}
          </Button>
        </div>
        <AuthDialog open={authOpen} onOpenChange={setAuthOpen} postSlug={postSlug} postTitle={postTitle} />
      </>
    );
  }

  if (hasSubscription || hasUnlock) {
    return null; // Caller renders full content
  }

  // Authenticated but no subscription/unlock — show pricing cards
  return (
    <div className="my-8 rounded-2xl border bg-gradient-to-br from-amber-50/50 to-orange-50/50 dark:from-amber-950/10 dark:to-orange-950/10 p-8">
      <div className="text-center mb-6">
        <Sparkles className="w-8 h-8 text-amber-600 mx-auto mb-2" />
        <h3 className="text-xl font-bold mb-1">{t("moneyLab.paywall.pricingTitle", "选择套餐")}</h3>
        <p className="text-sm text-muted-foreground">{t("moneyLab.paywall.pricingSubtitle", "全部案例畅读，新案例实时推送")}</p>
      </div>
      <div className="grid md:grid-cols-3 gap-4 max-w-3xl mx-auto">
        {/* Single */}
        <PricingCard
          title={t("moneyLab.paywall.singleTitle", "单篇解锁")}
          price="$1.99"
          features={[t("moneyLab.paywall.singleFeature1", "仅本案例"), t("moneyLab.paywall.singleFeature2", "永久阅读")]}
          priceKind="single"
          postSlug={postSlug}
          userEmail={user.email}
        />
        {/* Monthly */}
        <PricingCard
          title={t("moneyLab.paywall.monthlyTitle", "月度会员")}
          price="$4.99"
          suffix={`/${t("moneyLab.paywall.month", "月")}`}
          features={[t("moneyLab.paywall.monthlyFeature1", "全部案例畅读"), t("moneyLab.paywall.monthlyFeature2", "新案例实时推送"), t("moneyLab.paywall.monthlyFeature3", "随时取消")]}
          priceKind="monthly"
          userEmail={user.email}
          highlighted
        />
        {/* Yearly */}
        <PricingCard
          title={t("moneyLab.paywall.yearlyTitle", "年度会员")}
          price="$49.99"
          suffix={`/${t("moneyLab.paywall.year", "年")}`}
          features={[t("moneyLab.paywall.yearlyFeature1", "全部案例畅读"), t("moneyLab.paywall.yearlyFeature2", "省 17%"), t("moneyLab.paywall.yearlyFeature3", "优先客服")]}
          priceKind="yearly"
          userEmail={user.email}
        />
      </div>
      <div className="flex items-center justify-center gap-2 mt-6 text-xs text-muted-foreground">
        <ShieldCheck className="w-4 h-4" />
        {t("moneyLab.paywall.noRefund", "数字商品，一经售出不支持退款")}
      </div>
    </div>
  );
}

function PricingCard({
  title,
  price,
  suffix,
  features,
  priceKind,
  postSlug,
  userEmail,
  highlighted = false,
}: {
  title: string;
  price: string;
  suffix?: string;
  features: string[];
  priceKind: "monthly" | "yearly" | "single";
  postSlug?: string;
  userEmail?: string;
  highlighted?: boolean;
}) {
  return (
    <div className={`relative rounded-xl border p-5 ${highlighted ? "border-amber-500 ring-2 ring-amber-500/20 bg-white dark:bg-card" : "bg-white/60 dark:bg-card/60"}`}>
      {highlighted && (
        <span className="absolute -top-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-amber-500 text-white text-xs font-medium">
          Popular
        </span>
      )}
      <h4 className="font-semibold mb-2">{title}</h4>
      <div className="flex items-baseline gap-1 mb-4">
        <span className="text-3xl font-bold">{price}</span>
        {suffix && <span className="text-sm text-muted-foreground">{suffix}</span>}
      </div>
      <ul className="space-y-2 mb-4 text-sm">
        {features.map((f, i) => (
          <li key={i} className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
            <span>{f}</span>
          </li>
        ))}
      </ul>
      <CheckoutButton priceKind={priceKind} postSlug={postSlug} userEmail={userEmail} className="w-full" />
    </div>
  );
}