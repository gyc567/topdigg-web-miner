import { describe, it, expect } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { I18nextProvider } from "react-i18next";
import i18n from "@/i18n";
import { ProductCard, type ProductCardProps } from "./ProductCard";

const wrap = (ui: React.ReactNode) => (
  <I18nextProvider i18n={i18n}>{ui}</I18nextProvider>
);

const baseProduct: ProductCardProps["product"] = {
  name: "Cursor",
  url: "https://cursor.com",
  category: "AI编程工具",
  launch_date: "2023-03",
  revenue: "$1B+ ARR",
  users: "1M+",
};

describe("ProductCard", () => {
  it("renders product name", () => {
    render(wrap(<ProductCard product={baseProduct} />));
    expect(screen.getByText("Cursor")).toBeInTheDocument();
  });

  it("renders website link with noopener noreferrer", () => {
    render(wrap(<ProductCard product={baseProduct} />));
    const link = screen.getByRole("link", { name: /cursor/i });
    expect(link).toHaveAttribute("href", "https://cursor.com");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("renders logo fallback when product.logo is missing", () => {
    const { container } = render(wrap(<ProductCard product={baseProduct} />));
    // LogoFallback renders a div with the initial "C"
    const fallbacks = container.querySelectorAll('[aria-hidden="true"]');
    expect(fallbacks.length).toBeGreaterThan(0);
  });

  it("renders product logo image when provided", () => {
    render(
      wrap(<ProductCard product={{ ...baseProduct, logo: "/logos/cursor.svg" }} />)
    );
    const img = screen.getByAltText("Cursor logo");
    expect(img).toHaveAttribute("src", "/logos/cursor.svg");
  });

  it("renders data grid: category / launch_date / revenue / users", () => {
    render(wrap(<ProductCard product={baseProduct} />));
    expect(screen.getByText("AI编程工具")).toBeInTheDocument();
    expect(screen.getByText("2023-03")).toBeInTheDocument();
    expect(screen.getByText("$1B+ ARR")).toBeInTheDocument();
    expect(screen.getByText("1M+")).toBeInTheDocument();
  });

  it("gracefully degrades when revenue is missing (no empty row)", () => {
    const { container } = render(
      wrap(<ProductCard product={{ ...baseProduct, revenue: undefined }} />)
    );
    expect(screen.queryByText("$1B+ ARR")).not.toBeInTheDocument();
    // category still present
    expect(screen.getByText("AI编程工具")).toBeInTheDocument();
  });

  it("shows pricing_model text when pricing array is missing", () => {
    render(
      wrap(
        <ProductCard
          product={{ ...baseProduct, pricing_model: "Hobby 免费 + Pro $20/月" }}
        />
      )
    );
    expect(screen.getByText(/Hobby 免费/)).toBeInTheDocument();
  });

  it("renders pricing table when pricing array provided", () => {
    const pricing = [
      { plan: "Hobby (Free)", price: 0, currency: "USD", period: null },
      { plan: "Pro", price: 20, currency: "USD", period: "month" },
    ];
    render(wrap(<ProductCard product={baseProduct} pricing={pricing} />));
    expect(screen.getByText("Hobby (Free)")).toBeInTheDocument();
    expect(screen.getByText("Pro")).toBeInTheDocument();
    expect(screen.getByText(/USD 20/)).toBeInTheDocument();
    // When pricing array present, pricing_model text should NOT be shown
    expect(screen.queryByText("Hobby 免费 + Pro $20/月")).not.toBeInTheDocument();
  });

  it("hides metrics section when metrics array empty", () => {
    const { container } = render(wrap(<ProductCard product={baseProduct} metrics={[]} />));
    // Look for the metrics heading — should not be present
    expect(container.querySelector('[data-testid="metrics"]')).toBeNull();
  });

  it("renders metrics badges when array provided", () => {
    const metrics = [
      { name: "ARR", value: "$1B+" },
      { name: "DAU", value: "1M+" },
    ];
    const { container } = render(wrap(<ProductCard product={baseProduct} metrics={metrics} />));
    // Scope to the metrics container
    const metricsSection = container.querySelector("aside")!.querySelectorAll("h3");
    const metricsHeading = Array.from(metricsSection).find((h) =>
      h.textContent?.includes("metrics")
    );
    expect(metricsHeading).toBeDefined();
    const metricsContainer = metricsHeading!.parentElement!;
    expect(within(metricsContainer).getByText(/^ARR:/)).toBeInTheDocument();
    expect(within(metricsContainer).getByText(/^\$1B\+$/)).toBeInTheDocument();
    expect(within(metricsContainer).getByText(/^DAU:/)).toBeInTheDocument();
    expect(within(metricsContainer).getByText(/^1M\+$/)).toBeInTheDocument();
  });

  it("hides sources section when sources array empty", () => {
    const { container } = render(wrap(<ProductCard product={baseProduct} sources={[]} />));
    expect(container.querySelector('[data-testid="sources"]')).toBeNull();
  });

  it("renders sources list when array provided", () => {
    const sources = [
      { label: "Anysphere blog", url: "https://cursor.com/blog" },
      { label: "TechCrunch", url: "https://techcrunch.com" },
    ];
    render(wrap(<ProductCard product={baseProduct} sources={sources} />));
    const links = screen.getAllByRole("link");
    // Should have website link + 2 source links
    expect(links.length).toBeGreaterThanOrEqual(3);
  });

  it("uses semantic <aside> for the card", () => {
    const { container } = render(wrap(<ProductCard product={baseProduct} />));
    const aside = container.querySelector("aside");
    expect(aside).toBeInTheDocument();
  });
});
