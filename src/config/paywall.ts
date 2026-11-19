/**
 * Per-section paywall switches.
 *
 * A `true` section's full content is kept OUT of the client bundle: the build
 * script writes it to api/_gated/ (served only by the entitlement-checked
 * API), and detail pages render a teaser + CTA for everyone without access.
 *
 * IMPORTANT — enabling a section requires three coordinated changes (see
 * docs/membership-system-plan.md §8.2):
 *   1. flip the switch here
 *   2. the section's build script must honor it (write full content to
 *      api/_gated/ instead of src/lib/*-data/)
 *   3. the detail page must render a teaser for anonymous visitors
 * Miss any one and the full text leaks into the JS bundle or static HTML.
 */
export const PAYWALL_SECTIONS = {
  blog: false,
  "ai-daily": true,
  "finance-daily": false,
  "money-lab": false,
  "ai-products": false,
  twitter: false,
} as const;

export type PaywallSection = keyof typeof PAYWALL_SECTIONS;

export function isPaywalled(section: string): boolean {
  return (PAYWALL_SECTIONS as Record<string, boolean>)[section] === true;
}

/** Credits charged to unlock one gated article. */
export const ARTICLE_UNLOCK_CREDITS = 20;
