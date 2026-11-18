/**
 * Account centre — membership status, credits balance, billing links.
 */
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useSession, authClient } from "@/lib/auth-client";

type AccountData = {
  user: { email: string; name: string; dodoCustomerId: string | null };
  subscriptions: Array<{ subscriptionId: string; status: string; nextBillingDate?: string; amount?: number; currency?: string }>;
  credits: Array<{ creditEntitlementId: string; name?: string; balance?: string }>;
  creditsStale?: boolean;
};

export default function Account() {
  const { t } = useTranslation();
  const { data: session, isPending } = useSession();
  const [data, setData] = useState<AccountData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!session?.user) return;
    setLoading(true);
    fetch("/api/account")
      .then((r) => (r.ok ? r.json() : null))
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [session?.user]);

  if (isPending) {
    return <div className="container mx-auto px-4 py-16 text-muted-foreground">…</div>;
  }

  if (!session?.user) {
    return (
      <div className="container mx-auto max-w-md px-4 py-16 text-center">
        <p className="text-muted-foreground mb-6">{t("auth.sessionExpired")}</p>
        <Link to="/login" className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium inline-block">
          {t("auth.login")}
        </Link>
      </div>
    );
  }

  const activeSub = data?.subscriptions?.find((s) => s.status === "active");

  return (
    <div className="container mx-auto max-w-2xl px-4 py-16">
      <h1 className="text-2xl font-bold mb-2">{t("auth.account")}</h1>
      <p className="text-muted-foreground mb-8">
        {session.user.name} · {session.user.email}
      </p>

      <div className="grid gap-4 md:grid-cols-2 mb-8">
        <div className="p-4 border rounded-lg">
          <div className="text-sm text-muted-foreground mb-1">{t("auth.membership")}</div>
          {loading ? (
            <div className="text-muted-foreground">…</div>
          ) : activeSub ? (
            <div>
              <span className="inline-block px-2 py-0.5 rounded text-xs bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                {activeSub.status}
              </span>
              <div className="text-sm text-muted-foreground mt-2">
                {activeSub.subscriptionId}
                {activeSub.nextBillingDate ? ` · ${new Date(activeSub.nextBillingDate).toLocaleDateString()}` : ""}
              </div>
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">{t("auth.noMembership")}</div>
          )}
        </div>

        <div className="p-4 border rounded-lg">
          <div className="text-sm text-muted-foreground mb-1">{t("auth.credits")}</div>
          {loading ? (
            <div className="text-muted-foreground">…</div>
          ) : data?.credits?.length ? (
            <div className="space-y-1">
              {data.credits.map((c) => (
                <div key={c.creditEntitlementId} className="font-mono">
                  {c.balance ?? "0"} <span className="text-xs text-muted-foreground">{c.name}</span>
                </div>
              ))}
              {data.creditsStale && <div className="text-xs text-amber-600">stale</div>}
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">0</div>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        {!activeSub && (
          <Link to="/checkout" className="px-5 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium">
            {t("auth.register") === "注册" ? "开通会员" : "Subscribe"}
          </Link>
        )}
        <button
          onClick={() => authClient.signOut().then(() => location.assign("/"))}
          className="px-5 py-2.5 border rounded-lg text-sm"
        >
          {t("auth.logout")}
        </button>
      </div>
    </div>
  );
}
