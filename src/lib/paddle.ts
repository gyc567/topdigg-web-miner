/**
 * Paddle.js v2 — complete wrapper per https://developer.paddle.com/build/checkout/build-overlay-checkout
 * Lazy loaded: inject script on first checkout call.
 */
import { PADDLE_CONFIG, type PriceKind } from "@/lib/paddle-config";

declare global {
  interface Window {
    Paddle?: {
      Initialize: (opts: { token: string; environment: "production" | "sandbox" }) => void;
      Checkout: {
        open: (opts: Record<string, unknown>) => void;
        close: () => void;
      };
      Update: (opts: { items: Array<{ priceId: string; quantity: number }>; customer?: { email?: string } }) => void;
      Environment?: { set: (env: "production" | "sandbox") => void };
    };
  }
}

let scriptLoaded = false;
let paddleInitialized = false;
const eventListeners = new Map<string, Set<(e: unknown) => void>>();

async function loadPaddle(): Promise<void> {
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
    // Bridge native DOM events to our listener API
    const eventNames = [
      "paddle:checkout:open",
      "paddle:checkout:close",
      "paddle:checkout:payment-method-selected",
      "paddle:checkout:checkout-data-submit",
      "paddle:checkout:checkout-data-success",
      "paddle:checkout:completed",
      "paddle:checkout:error",
    ];
    for (const evt of eventNames) {
      window.addEventListener(evt, (e) => {
        const listeners = eventListeners.get(evt);
        if (listeners) for (const fn of listeners) fn(e);
      });
    }
  }
}

export function onPaddleEvent(eventName: string, handler: (e: unknown) => void): () => void {
  if (!eventListeners.has(eventName)) eventListeners.set(eventName, new Set());
  eventListeners.get(eventName)!.add(handler);
  return () => eventListeners.get(eventName)?.delete(handler);
}

export type CheckoutItem = { priceId: string; quantity?: number };

export type CheckoutOptions = {
  items: CheckoutItem[];
  customer?: { email: string };
  customData?: Record<string, string>;
  successUrl?: string;
  closeUrl?: string;
};

export async function openCheckout(opts: CheckoutOptions): Promise<void> {
  await loadPaddle();
  if (!window.Paddle) throw new Error("Paddle not loaded");
  window.Paddle.Checkout.open({
    items: opts.items.map((i) => ({ priceId: i.priceId, quantity: i.quantity ?? 1 })),
    customer: opts.customer,
    customData: opts.customData,
    successUrl: opts.successUrl ?? `${PADDLE_CONFIG.payDomain}/success`,
    closeUrl: opts.closeUrl,
    ...(PADDLE_CONFIG.noRefund ? { allowUndo: false } : {}),
  });
}

export function getPriceId(kind: PriceKind): string {
  return PADDLE_CONFIG.prices[kind];
}

/**
 * Open Paddle v2's subscription management overlay for an existing subscription.
 *
 * Paddle v1 hosted `https://checkout.paddle.com/subscription/{id}` URLs are
 * deprecated; v2 surfaces the same cancel / change-plan / payment-method
 * flows in-page via `Paddle.Checkout.open({ subscription_id })`.
 *
 * Caller typically passes the value stored in
 * `subscriptions.paddle_subscription_id` (e.g. "sub_abc123").
 */
export async function openCustomerPortal(paddleSubscriptionId: string): Promise<void> {
  await loadPaddle();
  if (!window.Paddle) throw new Error("Paddle not loaded");
  window.Paddle.Checkout.open({
    subscription_id: paddleSubscriptionId,
  });
}