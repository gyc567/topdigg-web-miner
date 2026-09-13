/**
 * Auth helpers — wraps Supabase Auth with React-Query-friendly hooks.
 * Email/password + Google OAuth supported.
 */
import { useEffect, useState } from "react";
import { getSupabase, isSupabaseConfigured, type SubscriptionRow, type UnlockRow } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setLoading(false);
      return;
    }
    const supabase = getSupabase();
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      setLoading(false);
    }).catch(() => {
      setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => {
      sub.subscription.unsubscribe();
    };
  }, []);

  return { user, loading, isAuthenticated: !!user };
}

export async function signInWithGoogle(returnTo?: string) {
  const supabase = getSupabase();
  const redirectTo = returnTo
    ? `${import.meta.env.VITE_PAY_DOMAIN ?? window.location.origin}/oauth-callback?return_to=${encodeURIComponent(returnTo)}`
    : `${window.location.origin}/oauth-callback`;
  await supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo } });
}

export async function signInWithEmail(email: string, password: string) {
  const supabase = getSupabase();
  return supabase.auth.signInWithPassword({ email, password });
}

export async function signUpWithEmail(email: string, password: string) {
  const supabase = getSupabase();
  return supabase.auth.signUp({ email, password });
}

export async function signOut() {
  const supabase = getSupabase();
  await supabase.auth.signOut();
}

/**
 * Check if user has active subscription or has unlocked a specific post.
 */
export function useAccess(userId: string | undefined, postSlug?: string) {
  const [hasSubscription, setHasSubscription] = useState(false);
  const [hasUnlock, setHasUnlock] = useState(false);
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<SubscriptionRow | null>(null);
  const [refreshTick, setRefreshTick] = useState(0);

  useEffect(() => {
    if (!userId || !isSupabaseConfigured()) {
      setLoading(false);
      return;
    }
    const supabase = getSupabase();
    let cancelled = false;

    (async () => {
      setLoading(true);
      try {
        const { data: subs } = await supabase
          .from("subscriptions")
          .select("*")
          .eq("user_id", userId)
          .in("status", ["active", "trialing"])
          .order("current_period_end", { ascending: false })
          .limit(1);
        if (cancelled) return;
        const active = subs?.[0];
        setHasSubscription(!!active);
        setSubscription(active ?? null);

        if (postSlug) {
          const { data: unlocks } = await supabase
            .from("unlocks")
            .select("*")
            .eq("user_id", userId)
            .eq("post_slug", postSlug)
            .limit(1);
          if (cancelled) return;
          setHasUnlock(!!unlocks?.[0]);
        }
      } catch {
        // Silently fail — fall back to no access
      }
      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [userId, postSlug, refreshTick]);

  return {
    hasSubscription,
    hasUnlock,
    subscription,
    loading,
    refetch: () => setRefreshTick((t) => t + 1),
  };
}

/**
 * Cross-tab purchase notification — emitted from pay.topdigg.com after Paddle webhook success.
 */
export function notifyPurchaseCompleted(slug: string) {
  const payload = JSON.stringify({ slug, timestamp: Date.now() });
  try {
    localStorage.setItem("purchase-completed", payload);
  } catch {
    // ignore quota errors
  }
  window.dispatchEvent(new CustomEvent("purchase-completed", { detail: { slug } }));
}

export function onPurchaseCompleted(handler: (slug: string) => void) {
  const storageHandler = (e: StorageEvent) => {
    if (e.key !== "purchase-completed" || !e.newValue) return;
    try {
      const { slug } = JSON.parse(e.newValue);
      handler(slug);
    } catch {
      // ignore
    }
  };
  const customHandler = (e: Event) => {
    const detail = (e as CustomEvent).detail as { slug: string };
    handler(detail.slug);
  };
  window.addEventListener("storage", storageHandler);
  window.addEventListener("purchase-completed", customHandler);
  return () => {
    window.removeEventListener("storage", storageHandler);
    window.removeEventListener("purchase-completed", customHandler);
  };
}