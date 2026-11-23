/**
 * Set a new password. Reached via the link in the reset email —
 * Better Auth redirects here with ?token=...
 */
import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";

export default function ResetPassword() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (password.length < 8) {
      setError(t("auth.passwordTooShort"));
      return;
    }
    if (password !== confirm) {
      setError(t("auth.passwordMismatch"));
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newPassword: password, token }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.message ?? `HTTP ${res.status}`);
      }
      setDone(true);
    } catch (err: any) {
      setError(err?.message ?? String(err));
    } finally {
      setLoading(false);
    }
  }

  if (!token) {
    return (
      <div className="container mx-auto max-w-md px-4 py-16 text-center">
        <p className="text-muted-foreground mb-6">{t("auth.resetLinkInvalid")}</p>
        <Link to="/forgot-password" className="text-primary hover:underline">
          {t("auth.forgotTitle")}
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-md px-4 py-16">
      <h1 className="text-2xl font-bold mb-2">{t("auth.resetTitle")}</h1>
      <p className="text-muted-foreground mb-8">{t("auth.resetDesc")}</p>

      {done ? (
        <div className="p-4 border rounded-lg text-sm bg-green-50 dark:bg-green-950/40 border-green-200 dark:border-green-900 mb-4">
          {t("auth.resetDone")}
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
              <label className="block text-sm mb-1">{t("auth.newPassword")}</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                className="w-full border rounded-md px-4 py-2.5 bg-background"
              />
            </div>
            <div>
              <label className="block text-sm mb-1">{t("auth.confirmPassword")}</label>
              <input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                autoComplete="new-password"
                className="w-full border rounded-md px-4 py-2.5 bg-background"
              />
            </div>
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "…" : t("auth.resetBtn")}
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
