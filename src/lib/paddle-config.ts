/**
 * Paddle configuration — uses env vars, never hardcode price IDs.
 * Paddle Dashboard → Developer Tools → Authentication → API Keys
 */
export const PADDLE_CONFIG = {
  clientToken: import.meta.env.VITE_PADDLE_CLIENT_TOKEN ?? "",
  environment: (import.meta.env.VITE_PADDLE_ENV ?? "production") as "production" | "sandbox",
  prices: {
    monthly: import.meta.env.VITE_PADDLE_PRICE_MONTHLY ?? "pri_ml_monthly",
    yearly: import.meta.env.VITE_PADDLE_PRICE_YEARLY ?? "pri_ml_yearly",
    single: import.meta.env.VITE_PADDLE_PRICE_SINGLE ?? "pri_ml_single",
  },
  payDomain: import.meta.env.VITE_PAY_DOMAIN ?? "https://pay.topdigg.com",
  siteUrl: import.meta.env.VITE_SITE_URL ?? "https://www.topdigg.com",
  noRefund: true,
} as const;

export type PriceKind = keyof typeof PADDLE_CONFIG.prices;