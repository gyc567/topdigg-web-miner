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
 * Returning `fetch(request)` is the documented "pass-through" idiom — the
 * request continues to the static asset / SPA rewrite as if the middleware
 * were not there.
 */

// Valid SPA route prefixes (must not return 404)
const VALID_ROUTES = new Set([
  "/",
  "/blog",
  "/ai-daily",
  "/twitter",
  "/columns",
  "/external-links",
  "/about",
  "/privacy",
  // Vercel internals (should never 404)
  "/_vercel",
  "/__next",
]);

// Paths that should always pass through (assets, API, etc.)
// Static asset rule: any request whose pathname has a file extension
// (e.g. .png, .webp, .ico, .svg, .css, .js, .json) is treated as a static
// asset and pass-through'd to Vercel's static layer. This replaces the old
// hard-coded whitelist (`/favicon`, `/logo-header.png`, ...) which silently
// 404'd every other public file. The "has extension" check is the same
// heuristic Vercel's static lookup uses to decide whether a path is a file
// request vs an SPA route.
const STATIC_FILE_EXT = /\.[a-z0-9]{2,5}$/i;

export default async function middleware(request: Request): Promise<Response> {
  const pathname = new URL(request.url).pathname;

  // Static asset: pass through to Vercel's static layer. If the file doesn't
  // exist, propagate a real 404 — don't let the SPA rewrite (`vercel.json`
  // `/(.*) → /index.html`) turn a missing asset into a 200-index.html, which
  // pollutes SEO by indexing the homepage under non-existent URLs.
  if (STATIC_FILE_EXT.test(pathname)) {
    const res = await fetch(request);
    if (res.status === 404) return new Response("Not Found", { status: 404 });
    return res;
  }

  // Allow valid SPA route prefixes (exact match or sub-path like /blog/foo)
  for (const route of VALID_ROUTES) {
    if (pathname === route || pathname.startsWith(route + "/")) {
      return fetch(request);
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
     */
    "/((?!_next/static|_next/image|favicon.ico|public/).*)",
  ],
};
