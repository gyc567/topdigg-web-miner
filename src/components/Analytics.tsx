/**
 * Analytics — global, env-driven head injections for:
 *   - Google Search Console verification (meta tag)
 *   - Microsoft Clarity (analytics script)
 *   - Google Analytics 4 (gtag.js)
 *
 * All three are opt-in: scripts only render when the corresponding
 * Vite env var is set. Leaving them empty in dev/build is safe.
 *
 * Mounted once at the App root so every route gets the same scripts.
 * Uses useEffect + document.head directly (not react-helmet) so:
 *   - works deterministically in jsdom tests
 *   - cleanup removes the tags on unmount
 *   - no race with helmet's rAF-based diffing
 *
 * Setup instructions: docs/analytics-setup.md
 */
import { useEffect } from "react";

function readEnv(): { ga4: string; clarity: string; gsc: string } {
  const ga4 = (import.meta.env.VITE_GA4_MEASUREMENT_ID ?? "").trim();
  const clarity = (import.meta.env.VITE_CLARITY_PROJECT_ID ?? "").trim();
  const gsc = (import.meta.env.VITE_GSC_VERIFICATION_ID ?? "").trim();
  return { ga4, clarity, gsc };
}

export function Analytics() {
  const { ga4: GA4_ID, clarity: CLARITY_ID, gsc: GSC_ID } = readEnv();

  useEffect(() => {
    const inserted: HTMLElement[] = [];

    // Google Search Console verification — meta tag
    if (GSC_ID) {
      const meta = document.createElement("meta");
      meta.setAttribute("name", "google-site-verification");
      meta.setAttribute("content", GSC_ID);
      document.head.appendChild(meta);
      inserted.push(meta);
    }

    // Microsoft Clarity — single inline script per docs
    if (CLARITY_ID) {
      const script = document.createElement("script");
      script.textContent =
        `(function(c,l,a,r,i,t,y){` +
        `c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};` +
        `t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;` +
        `y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);` +
        `})(window,document,"clarity","script","${CLARITY_ID}");`;
      document.head.appendChild(script);
      inserted.push(script);
    }

    // Google Analytics 4 — gtag.js loader + init
    if (GA4_ID) {
      const loader = document.createElement("script");
      loader.async = true;
      loader.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(GA4_ID)}`;
      document.head.appendChild(loader);
      inserted.push(loader);

      const init = document.createElement("script");
      init.textContent =
        `window.dataLayer = window.dataLayer || [];\n` +
        `function gtag(){dataLayer.push(arguments);}\n` +
        `gtag('js', new Date());\n` +
        `gtag('config', '${GA4_ID.replace(/'/g, "\\'")}', { anonymize_ip: true });`;
      document.head.appendChild(init);
      inserted.push(init);
    }

    return () => {
      for (const el of inserted) el.parentNode?.removeChild(el);
    };
  }, [GA4_ID, CLARITY_ID, GSC_ID]);

  return null;
}
