/**
 * Paddle configuration for TopDigg paywall.
 *
 * Setup:
 * 1. Copy .env.example to .env.local and fill in your Paddle sandbox values.
 * 2. For sandbox testing, use test_... client tokens from Paddle sandbox dashboard.
 * 3. For production, use live_... tokens from Paddle production dashboard.
 */

export const paddleConfig = {
  // Environment: 'sandbox' or 'production'
  env: (import.meta.env.VITE_PADDLE_ENV as 'sandbox' | 'production') || 'sandbox',

  // Client-side token (safe to expose in browser)
  clientToken: import.meta.env.VITE_PADDLE_CLIENT_TOKEN || '',

  // Price IDs from Paddle dashboard
  prices: {
    monthly: import.meta.env.VITE_PADDLE_PRICE_MONTHLY || 'pri_ml_monthly',
    yearly: import.meta.env.VITE_PADDLE_PRICE_YEARLY || 'pri_ml_yearly',
    single: import.meta.env.VITE_PADDLE_PRICE_SINGLE || 'pri_ml_single',
  },

  // Pay domain for success/cancel redirects
  payDomain: import.meta.env.VITE_PAY_DOMAIN || 'https://pay.topdigg.com',
} as const;

export type PaddleEnv = 'sandbox' | 'production';
