/**
 * Paddle.js v2 — lazy loaded wrapper. Only injects the script on first checkout call.
 * Reference: https://developer.paddle.com/build/checkout/build-overlay-checkout
 */
import { PADDLE_CONFIG, type PriceKind } from "@/lib/paddle-config";

declare global {
  interface Window {
    Paddle?: {
      Initialize: (opts: { token: string; environment: "production" | "sandbox" }) => void;
      Checkout: {
        open: (opts: Record<string, unknown>) => void;
      };
      Environment?: { set: (env: "production" | "sandbox") => void };
    };
  }
}

let scriptLoaded = false;
let paddleInitialized = false;

export async function loadPaddle(): Promise<void> {
  if (scriptLoaded) return;
  if (!window.Paddle) {
    await new Promise<void>((resolve, reject) => {
      const s = document.createElement("script");
      s.src = "https://cdn.paddle.com/paddle/v2/paddle.js";
      s.async = true;
      s.onload = () => resolve();
      s.onerror = () => reject(new Error("Failed to load Paddle.js"));
      document.head.appendChild(s);
    });
  }
  scriptLoaded = true;
  if (!paddleInitialized && window.Paddle && PADDLE_CONFIG.clientToken) {
    window.Paddle.Initialize({
      token: PADDLE_CONFIG.clientToken,
      environment: PADDLE_CONFIG.environment,
    });
    paddleInitialized = true;
  }
}

export type CheckoutItem = {
  priceId: string;
  quantity?: number;
};

export type CheckoutOptions = {
  items: CheckoutItem[];
  customer?: { email: string };
  customData?: Record<string, string>;
  successUrl?: string;
};

export async function openCheckout(opts: CheckoutOptions): Promise<void> {
  await loadPaddle();
  if (!window.Paddle) throw new Error("Paddle not loaded");
  window.Paddle.Checkout.open({
    items: opts.items.map((i) => ({ priceId: i.priceId, quantity: i.quantity ?? 1 })),
    customer: opts.customer,
    customData: opts.customData,
    successUrl: opts.successUrl ?? `${PADDLE_CONFIG.payDomain}/success`,
    ...(PADDLE_CONFIG.noRefund ? { allowUndo: false } : {}),
  });
}

export function getPriceId(kind: PriceKind): string {
  return PADDLE_CONFIG.prices[kind];
}