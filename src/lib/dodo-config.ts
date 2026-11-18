/**
 * Dodo Payments configuration — client-safe values only.
 *
 * The API key is a server-side secret and lives in `DODO_PAYMENTS_API_KEY`
 * (no VITE_ prefix, so Vite never inlines it into the bundle). It is read
 * exclusively by `api/checkout.ts`.
 *
 * Product ids are also server-side: the browser only sends a plan slug and
 * the server maps it to an allowlisted product id. See
 * https://docs.dodopayments.com/developer-resources/checkout-session
 */
import { DODO_PLANS, type DodoPlan } from "./dodo-plans";

export { DODO_PLANS, isDodoPlan, type DodoPlan } from "./dodo-plans";

export const dodoConfig = {
  /** 'test_mode' | 'live_mode' — test and live share nothing (keys, products, customers). */
  environment: (import.meta.env.VITE_DODO_ENVIRONMENT as "test_mode" | "live_mode") || "test_mode",

  /** Display labels for the checkout tester UI. */
  planLabels: {
    monthly: "月付会员 · $9.90 / 月",
    yearly: "年付会员 · $89.90 / 年",
    single: "单篇解锁 · $4.90",
  } as Record<DodoPlan, string>,
} as const;
