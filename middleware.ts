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
const ALWAYS_200 = [
  "/assets/",
  "/og-image",
  "/favicon",
  "/robots.txt",
  "/sitemap.xml",
  "/llms.txt",
  "/llms-full.txt",
  "/logo-header.png",
];

export default async function middleware(request: Request): Promise<Response> {
  const pathname = new URL(request.url).pathname;

  // Always allow static assets and known paths
  for (const prefix of ALWAYS_200) {
    if (pathname.startsWith(prefix)) return fetch(request);
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
