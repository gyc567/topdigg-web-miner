/**
 * 登录页
 */
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { authClient } from "@/lib/auth-client";

export default function Login() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!email || !password ) { setError(t("auth.fillAll")); return; }
    setLoading(true);
    try {
      const res = await authClient.signIn.email({ email, password });
      if (res.error) {
        setError(res.error.message ?? t("auth.authFailed"));
      } else {
        navigate("/account");
      }
    } catch {
      setError(t("auth.authFailed"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container mx-auto max-w-md px-4 py-16">
      <h1 className="text-2xl font-bold mb-2">{t("auth.login")}</h1>
      <p className="text-muted-foreground mb-8">{t("auth.welcome")}</p>
      {error && <div className="mb-4 p-3 bg-destructive/10 border border-destructive/30 rounded-lg text-destructive text-sm">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        
        <div>
          <label className="block text-sm mb-1">{t("auth.email")}</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-3 py-2 border rounded-lg bg-background" />
        </div>
        <div>
          <label className="block text-sm mb-1">{t("auth.password")}</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-3 py-2 border rounded-lg bg-background" />
        </div>
        <button disabled={loading} className="w-full px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium disabled:opacity-50">
          {loading ? t("auth.loggingIn") : t("auth.loginBtn")}
        </button>
      </form>
      <p className="mt-6 text-sm text-muted-foreground">
        <>{t("auth.noAccount")} <Link to="/register" className="text-primary hover:underline">{t("auth.register")}</Link></>
      </p>
    </div>
  );
}
