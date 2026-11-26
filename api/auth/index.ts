/**
 * Better Auth API handler — mounts every auth endpoint plus the Dodo plugin
 * routes (/api/auth/dodopayments/*) under /api/auth.
 *
 * Routing: Vercel's zero-config builder only matched ONE path segment for the
 * old nested catch-all `api/auth/[...all].ts` (/api/auth/get-session worked,
 * /api/auth/sign-up/email 404'd). So the function now lives at /api/auth and
 * vercel.json rewrites `/api/auth/:path*` → `/api/auth?__auth_path=:path*`.
 *
 * Vercel normally hands the function the original URL. If it hands over the
 * rewritten one instead (pathname "/api/auth" + __auth_path), rebuild the
 * original path so Better Auth's router sees /api/auth/<path>.
 */
import { toNodeHandler } from "better-auth/node";
import { auth } from "../../src/lib/auth.js";

const nodeHandler = toNodeHandler(auth.handler);

const PARAM = "__auth_path";

export function restoreAuthUrl(rawUrl: string): string {
  const u = new URL(rawUrl, "http://internal");
  const injected = u.searchParams.get(PARAM);
  u.searchParams.delete(PARAM);
  let pathname = u.pathname;
  if (injected && (pathname === "/api/auth" || pathname === "/api/auth/")) {
    pathname = "/api/auth/" + injected.replace(/^\/+/, "");
  }
  const qs = u.searchParams.toString();
  return pathname + (qs ? "?" + qs : "");
}

export default function handler(req: any, res: any) {
  if (typeof req.url === "string") req.url = restoreAuthUrl(req.url);
  return nodeHandler(req, res);
}
