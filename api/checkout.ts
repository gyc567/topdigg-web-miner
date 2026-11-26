/**
 * POST /api/checkout — creates a Dodo Payments checkout session.
 *
 * Vercel Node function (repo root `api/` directory).
 *
 * Security model:
 *   - The browser never receives the API key. It POSTs a plan slug only.
 *   - The slug is mapped to an allowlisted product id here, server-side.
 *     Accepting a product id from the browser is the documented mistake to
 *     avoid — see the guide's "Common mistakes".
 *   - Access is granted from the verified webhook, never from the redirect.
 *
 * Docs: https://docs.dodopayments.com/developer-resources/checkout-session
 */
import DodoPayments from "dodopayments";
import { isDodoPlan, type DodoPlan } from "../src/lib/dodo-plans.js";

/** plan slug → Dodo product id. Server-side allowlist, never client input. */
const PRODUCT_IDS: Readonly<Record<DodoPlan, string>> = {
  monthly: process.env.DODO_PRODUCT_MONTHLY ?? "",
  yearly: process.env.DODO_PRODUCT_YEARLY ?? "",
  single: process.env.DODO_PRODUCT_SINGLE ?? "",
};

const ENVIRONMENT =
  process.env.DODO_PAYMENTS_ENVIRONMENT === "live_mode" ? "live_mode" : "test_mode";

function getClient() {
  const bearerToken = process.env.DODO_PAYMENTS_API_KEY;
  if (!bearerToken) {
    throw new Error("DODO_PAYMENTS_API_KEY is not set — add it to .env.local or Vercel env vars");
  }
  return new DodoPayments({ bearerToken, environment: ENVIRONMENT });
}

/** Absolute origin of the current request, used to build the return URL. */
function originOf(host?: string, proto?: string): string {
  const configured = process.env.SITE_URL;
  if (configured) return configured.replace(/\/$/, "");
  const hostHeader = host ?? "localhost:8080";
  const protocol = proto ?? (hostHeader.startsWith("localhost") ? "http" : "https");
  return `${protocol}://${hostHeader}`;
}

/**
 * Create a checkout session for a plan.
 * Returns the raw SDK session (snake_case fields: session_id, checkout_url).
 */
export async function createCheckoutSession(
  plan: DodoPlan,
  opts: { returnUrl?: string; customerEmail?: string } = {},
) {
  const productId = PRODUCT_IDS[plan];
  if (!productId) {
    throw new Error(
      `No product id configured for plan "${plan}" (DODO_PRODUCT_${plan.toUpperCase()})`,
    );
  }

  const client = getClient();
  return client.checkoutSessions.create({
    product_cart: [{ product_id: productId, quantity: 1 }],
    ...(opts.customerEmail ? { customer: { email: opts.customerEmail } } : {}),
    metadata: { plan },
    ...(opts.returnUrl ? { return_url: opts.returnUrl } : {}),
  });
}

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    const raw = typeof req.body === "string" ? JSON.parse(req.body) : (req.body ?? {});
    const plan = raw?.plan;
    if (!isDodoPlan(plan)) {
      res.status(400).json({ error: "Unknown plan" });
      return;
    }

    const email = typeof raw?.email === "string" && raw.email.includes("@") ? raw.email : undefined;
    const returnUrl = `${originOf(req.headers?.host, req.headers?.["x-forwarded-proto"])}/checkout`;

    const session = await createCheckoutSession(plan, { returnUrl, customerEmail: email });

    res.status(200).json({
      checkoutUrl: session.checkout_url,
      sessionId: session.session_id,
      plan,
      environment: ENVIRONMENT,
    });
  } catch (err: any) {
    console.error("[api/checkout]", err?.message ?? err);
    res.status(500).json({ error: err?.message ?? "Failed to create checkout session" });
  }
}
