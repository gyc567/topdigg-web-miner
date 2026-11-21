/**
 * Forgot password — requests a reset link by email.
 */
import { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";

export default function ForgotPassword() {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!email) {
      setError(t("auth.fillAll"));
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/request-password-reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          redirectTo: `${window.location.origin}/reset-password`,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.message ?? `HTTP ${res.status}`);
      }
      setSent(true);
    } catch (err: any) {
      setError(err?.message ?? String(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container mx-auto max-w-md px-4 py-16">
      <h1 className="text-2xl font-bold mb-2">{t("auth.forgotTitle")}</h1>
      <p className="text-muted-foreground mb-8">{t("auth.forgotDesc")}</p>

      {sent ? (
        <div className="p-4 border rounded-lg text-sm bg-green-50 dark:bg-green-950/40 border-green-200 dark:border-green-900">
          {t("auth.resetSent")}
        </div>
      ) : (
        <>
          {error && (
            <div className="mb-4 p-3 bg-destructive/10 border border-destructive/30 rounded-lg text-destructive text-sm">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm mb-1">{t("auth.email")}</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full border rounded-md px-4 py-2.5 bg-background"
              />
            </div>
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "…" : t("auth.sendResetLink")}
            </Button>
          </form>
        </>
      )}

      <p className="mt-6 text-sm text-muted-foreground">
        <Link to="/login" className="text-primary hover:underline">
          {t("auth.login")}
        </Link>
      </p>
    </div>
  );
}
