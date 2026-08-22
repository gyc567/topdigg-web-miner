import { NextRequest, NextResponse } from "vercel/node";

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
  // Vercel/Next.js internals
  "/_vercel",
  "/__next",
]);

// Paths that should always return 200 (assets, API, etc.)
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

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Always allow static assets and known paths
  for (const prefix of ALWAYS_200) {
    if (pathname.startsWith(prefix)) return NextResponse.next();
  }

  // Allow valid SPA route prefixes
  for (const route of VALID_ROUTES) {
    if (pathname === route || pathname.startsWith(route + "/")) {
      return NextResponse.next();
    }
  }

  // Unknown route → real 404
  return new NextResponse("Not Found", { status: 404 });
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico (favicon)
     * - public files (public/)
     */
    "/((?!_next/static|_next/image|favicon.ico|public/).*)",
  ],
};
