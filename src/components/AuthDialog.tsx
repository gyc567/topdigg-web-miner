/**
 * AuthDialog — email/password + Google OAuth login & signup.
 */
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { X, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { signInWithGoogle, signInWithEmail, signUpWithEmail, notifyPurchaseCompleted } from "@/lib/auth";

type AuthDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  postSlug?: string;
  postTitle?: string;
};

export function AuthDialog({ open, onOpenChange, postSlug, postTitle }: AuthDialogProps) {
  const { t } = useTranslation();
  const [mode, setMode] = useState<"signin" | "signup">("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await signUpWithEmail(email, password);
        if (error) throw error;
      } else {
        const { error } = await signInWithEmail(email, password);
        if (error) throw error;
      }
      onOpenChange(false);
      // Trigger paywall refresh
      if (postSlug) {
        setTimeout(() => notifyPurchaseCompleted(postSlug), 100);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "登录失败";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError(null);
    setLoading(true);
    try {
      const returnTo = postSlug ? `/money-lab/${postSlug}` : "/money-lab";
      await signInWithGoogle(returnTo);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Google 登录失败");
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => onOpenChange(false)}>
      <div
        className="bg-card rounded-2xl shadow-2xl max-w-md w-full p-6 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={() => onOpenChange(false)} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground">
          <X className="w-5 h-5" />
        </button>
        <h2 className="text-xl font-bold mb-1">{t("moneyLab.paywall.authTitle", "解锁全部赚钱案例")}</h2>
        {postTitle && <p className="text-sm text-muted-foreground mb-5">{postTitle}</p>}

        <Button onClick={handleGoogle} disabled={loading} variant="outline" className="w-full mb-3 gap-2">
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          {t("moneyLab.paywall.googleSignIn", "使用 Google 登录")}
        </Button>

        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-card px-2 text-muted-foreground">
              {t("moneyLab.paywall.orEmail", "或使用邮箱")}
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="relative">
            <Mail className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@example.com"
              className="w-full pl-10 pr-3 py-2 border rounded-md text-sm bg-background"
            />
          </div>
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={t("moneyLab.paywall.passwordPlaceholder", "密码（至少6位）")}
            className="w-full px-3 py-2 border rounded-md text-sm bg-background"
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "处理中..." : mode === "signup" ? t("moneyLab.paywall.signUp", "创建账号") : t("moneyLab.paywall.signIn", "登录")}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-4">
          {mode === "signup" ? (
            <>
              {t("moneyLab.paywall.haveAccount", "已有账号？")}{" "}
              <button onClick={() => setMode("signin")} className="text-primary hover:underline">
                {t("moneyLab.paywall.signIn", "登录")}
              </button>
            </>
          ) : (
            <>
              {t("moneyLab.paywall.noAccount", "还没账号？")}{" "}
              <button onClick={() => setMode("signup")} className="text-primary hover:underline">
                {t("moneyLab.paywall.signUp", "注册")}
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
}