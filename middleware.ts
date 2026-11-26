/**
 * Vercel Edge Middleware — returns a real 404 for unknown SPA routes so
 * search engines don't index junk URLs that all map to index.html.
 *
 * Uses only vanilla Web APIs (Request/Response/URL) so it works on Vercel
 * Edge without Next.js — this is a Vite SPA, not a Next.js app.
 *
 * Vercel Edge Middleware requires:
 *   - default export of an async function (Request) => Response | Promise<Response>
 *   - named export `config` with optional `matcher`
 *
 * Pass-through uses `next()` from @vercel/functions — NOT `fetch(request)`.
 * `fetch(request)` re-enters this middleware on the same URL, and Vercel
 * aborts the whole request with INFINITE_LOOP_DETECTED (HTTP 508). That
 * regression only surfaced on newer Vercel builds, which is why the same
 * middleware worked in the 2026-11-14 deployment and 508'd in the next one.
 */
import { next } from "@vercel/functions";

// Valid SPA route prefixes (must not return 404)
const VALID_ROUTES = new Set([
  "/",
  "/blog",
  "/ai-daily",
  "/ai-products",
  "/finance-daily",
  "/money-lab",
  "/aura-workbench",
  "/twitter",
  "/columns",
  "/external-links",
  "/about",
  "/privacy",
  "/creators",
  "/creators/join",
  "/creators/submit",
  "/creators/dashboard",
  "/creators/admin",
  "/advertisers",
  "/advertisers/dashboard",
  // Checkout (Dodo Payments) — /checkout and /checkout/success
  "/checkout",
  // Auth & account
  "/login",
  "/register",
  "/account",
  "/forgot-password",
  "/reset-password",
  // Vercel internals (should never 404)
  "/_vercel",
  "/__next",
]);

// Paths that should always pass through (assets, API, etc.)
// Static asset rule: any request whose pathname has a file extension
// (e.g. .png, .webp, .ico, .svg, .css, .js, .json) is treated as a static
// asset and handed to Vercel's static layer. This replaces the old
// hard-coded whitelist (`/favicon`, `/logo-header.png`, ...) which silently
// 404'd every other public file. The "has extension" check is the same
// heuristic Vercel's static lookup uses to decide whether a path is a file
// request vs an SPA route.
//
// Missing assets still 404 for real: the SPA rewrite in vercel.json now skips
// any path that ends in a file extension, so `/missing.png` is not rewritten
// to /index.html.
const STATIC_FILE_EXT = /\.[a-z0-9]{2,5}$/i;

export default async function middleware(request: Request): Promise<Response> {
  const pathname = new URL(request.url).pathname;

  // Static asset → Vercel's static layer. `next()` continues to the
  // filesystem/rewrite phase without re-entering this middleware.
  if (STATIC_FILE_EXT.test(pathname)) {
    return next();
  }

  // Allow valid SPA route prefixes (exact match or sub-path like /blog/foo)
  for (const route of VALID_ROUTES) {
    if (pathname === route || pathname.startsWith(route + "/")) {
      return next();
    }
  }

  // Unknown route → real 404 (not a 200-with-index.html like vercel.json rewrites)
  return new Response("Not Found", { status: 404 });
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (Next.js static files)
     * - _next/image  (Next.js image optimization)
     * - favicon.ico
     * - public/      (files served directly from public/)
     * - api/         (serverless functions)
     *
     * `api/` is excluded on purpose: the middleware answers unknown routes
     * with a 404, and its pass-through `fetch(request)` would put the request
     * body through an extra hop. The Dodo webhook endpoint must receive the
     * exact raw bytes Dodo sent — the signature covers them.
     */
    "/((?!_next/static|_next/image|favicon.ico|public/|api/).*)",
  ],
};
