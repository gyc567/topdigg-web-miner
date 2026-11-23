/**
 * Shared Dodo Payments plan identifiers.
 *
 * Kept free of `import.meta.env` so it can be imported from both the browser
 * bundle (Vite) and the serverless function (plain Node) without dragging
 * Vite-only globals into the server.
 */

export type DodoPlan = "monthly" | "yearly" | "single";

export const DODO_PLANS: readonly DodoPlan[] = ["monthly", "yearly", "single"] as const;

export function isDodoPlan(value: unknown): value is DodoPlan {
  return typeof value === "string" && (DODO_PLANS as readonly string[]).includes(value);
}
