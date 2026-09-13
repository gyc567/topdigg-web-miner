/**
 * Supabase client — lazy loaded; only used in browser (post-hydration).
 * Requires VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY.
 */
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let _client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (_client) return _client;
  const url = import.meta.env.VITE_SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error("Supabase not configured");
  }
  _client = createClient(url, key, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: false,
      storage: typeof window !== "undefined" ? window.localStorage : undefined,
    },
  });
  return _client;
}

export function isSupabaseConfigured(): boolean {
  return !!(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY);
}

export type SubscriptionRow = {
  id: string;
  user_id: string;
  paddle_subscription_id: string;
  paddle_customer_id: string;
  status: "active" | "trialing" | "canceled" | "past_due";
  plan: "monthly" | "yearly";
  current_period_end: string;
  cancel_at_period_end: boolean;
};

export type UnlockRow = {
  id: string;
  user_id: string;
  post_slug: string;
  paddle_transaction_id: string;
  amount: number;
  currency: string;
  created_at: string;
};