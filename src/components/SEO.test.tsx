import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";
import { SEO } from "./SEO";
import * as reactI18next from "react-i18next";

vi.mock("react-i18next", async () => {
  const actual = await vi.importActual<typeof reactI18next>("react-i18next");
  return {
    ...actual,
    useTranslation: () => ({
      i18n: { language: "en" },
    }),
  };
});

vi.mock("react-helmet-async", () => ({
  Helmet: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

describe("SEO", () => {
  it("renders title, description and canonical link", () => {
    render(<SEO title="Test Title" description="Test description" path="/test" />);

    expect(document.title).toBe("Test Title | TopDigg");
    expect(document.querySelector('meta[name="description"]')).toHaveAttribute("content", "Test description");
    expect(document.querySelector('link[rel="canonical"]')).toHaveAttribute("href", "https://topdigg.com/test?lang=en");
  });

  it("renders hreflang alternates for all supported locales", () => {
    render(<SEO title="Test" description="Desc" path="/test" />);

    const alternates = document.querySelectorAll('link[rel="alternate"]');
    expect(alternates.length).toBe(6); // 5 locales + x-default
  });

  it("adds noindex meta when requested", () => {
    render(<SEO title="Test" description="Desc" noIndex />);

    const robots = document.querySelector('meta[name="robots"]');
    expect(robots).toHaveAttribute("content", "noindex, nofollow");
  });

  it("injects JSON-LD script when provided", () => {
    const jsonLd = { "@context": "https://schema.org", "@type": "WebSite", name: "TopDigg" };
    render(<SEO title="Test" description="Desc" jsonLd={jsonLd} />);

    const script = document.querySelector('script[type="application/ld+json"]');
    expect(script).toBeInTheDocument();
    expect(script?.textContent).toContain("TopDigg");
  });
});
