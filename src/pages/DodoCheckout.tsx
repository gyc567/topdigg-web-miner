/**
 * Dodo Payments checkout test page.
 * Route: /checkout
 *
 * The browser asks the server to create a checkout session, then opens it in
 * Dodo's overlay. The API key never leaves the server.
 */
import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { DodoPayments } from "dodopayments-checkout";
import { dodoConfig, DODO_PLANS, isDodoPlan, type DodoPlan } from "@/lib/dodo-config";

type CheckoutState = "idle" | "loading" | "ready" | "error";

export default function DodoCheckout() {
  const [searchParams] = useSearchParams();
  const requested = searchParams.get("plan");
  const initialPlan: DodoPlan = isDodoPlan(requested) ? requested : "monthly";

  const [plan, setPlan] = useState<DodoPlan>(initialPlan);
  const [checkoutState, setCheckoutState] = useState<CheckoutState>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [logLines, setLogLines] = useState<string[]>([]);

  const log = useCallback((msg: string) => {
    setLogLines((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
  }, []);

  // Dodo returns the customer here after payment:
  // /checkout?payment_id=pay_xxx&status=succeeded&email=...
  const paymentId = searchParams.get("payment_id");
  const subscriptionId = searchParams.get("subscription_id");
  const status = searchParams.get("status");

  const result = useMemo(() => {
    if (status) {
      return {
        kind: "payment" as const,
        ok: status === "succeeded" || status === "active",
        status,
        id: paymentId ?? subscriptionId ?? "(无)",
        email: searchParams.get("email"),
      };
    }
    return null;
  }, [status, paymentId, subscriptionId, searchParams]);

  useEffect(() => {
    DodoPayments.Initialize({
      mode: dodoConfig.environment === "live_mode" ? "live" : "test",
      displayType: "overlay",
      onEvent: (event: any) => {
        if (event?.name) log(`Dodo event: ${event.name}`);
      },
    });
    setCheckoutState("ready");
    log(`Dodo overlay initialized (${dodoConfig.environment})`);

    if (result) {
      log(`Return from checkout: status=${result.status} id=${result.id}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCheckout = useCallback(async () => {
    setCheckoutState("loading");
    setErrorMsg("");
    log(`Requesting checkout session for plan: ${plan}`);

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload?.error ?? `HTTP ${response.status}`);
      }

      log(`Session created: ${payload.sessionId}`);
      log(`Checkout URL: ${payload.checkoutUrl}`);
      DodoPayments.Checkout.open({ checkoutUrl: payload.checkoutUrl });
      setCheckoutState("ready");
    } catch (err: any) {
      setErrorMsg(err?.message ?? String(err));
      setCheckoutState("error");
      log(`Error: ${err?.message ?? err}`);
    }
  }, [plan, log]);

  return (
    <div className="container mx-auto max-w-2xl px-4 py-16">
      <h1 className="text-2xl font-bold mb-6">Dodo Payments Checkout Test</h1>

      <div className="mb-4 p-4 bg-muted rounded-lg text-sm font-mono space-y-1">
        <div>
          <strong>Environment:</strong> {dodoConfig.environment}
        </div>
        <div>
          <strong>Plan:</strong> {plan}
        </div>
        <div>
          <strong>Status:</strong> {checkoutState}
        </div>
        <div>
          <strong>Display mode:</strong> overlay (session created server-side)
        </div>
      </div>

      {result && (
        <div
          className={`mb-4 p-4 border rounded-lg text-sm ${
            result.ok
              ? "border-green-500/40 bg-green-500/10 text-green-700 dark:text-green-400"
              : "border-destructive/30 bg-destructive/10 text-destructive"
          }`}
        >
          <strong>Checkout returned:</strong> status={result.status}, id={result.id}
          {result.email ? `, email=${result.email}` : ""}
          <br />
          <span className="text-xs opacity-80">
            注意：正式环境应以已验签的 webhook 为准来开通权限，不要依赖这个跳转参数。
          </span>
        </div>
      )}

      {errorMsg && (
        <div className="mb-4 p-4 bg-destructive/10 border border-destructive/30 rounded-lg text-destructive text-sm">
          <strong>Error:</strong> {errorMsg}
        </div>
      )}

      <div className="flex flex-wrap gap-3 mb-6">
        <select
          value={plan}
          onChange={(e) => setPlan(e.target.value as DodoPlan)}
          className="px-3 py-3 border rounded-lg text-sm bg-background"
        >
          {DODO_PLANS.map((p) => (
            <option key={p} value={p}>
              {dodoConfig.planLabels[p]}
            </option>
          ))}
        </select>

        <button
          onClick={openCheckout}
          disabled={checkoutState === "loading"}
          className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium disabled:opacity-50"
        >
          {checkoutState === "loading" ? "Creating session..." : "Open Checkout (Overlay)"}
        </button>

        <button
          onClick={() => setLogLines([])}
          className="px-4 py-3 border rounded-lg text-sm"
        >
          Clear log
        </button>
      </div>

      <div className="bg-black text-green-400 p-4 rounded-lg font-mono text-xs h-64 overflow-y-auto">
        {logLines.length === 0 ? (
          <span className="text-muted-foreground">Waiting for events...</span>
        ) : (
          logLines.map((line, i) => <div key={i}>{line}</div>)
        )}
      </div>

      <div className="mt-8 p-4 border rounded-lg text-sm text-muted-foreground">
        <strong>Test card:</strong> 4242 4242 4242 4242 — expiry 06/32, CVC 123
        <br />
        <strong>Declines:</strong> 4000 0000 0000 0002 (generic decline) / 4000 0000 0000 9995
        (insufficient funds)
      </div>
    </div>
  );
}
