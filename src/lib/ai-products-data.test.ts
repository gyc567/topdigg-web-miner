import { describe, it, expect } from "vitest";
import { aiProductsDataSource } from "./ai-products-data";
import type { AIProductMeta } from "./ai-products-data";

describe("AIProductsDataSource", () => {
  describe("getPosts", () => {
    it("returns all products as array", () => {
      const posts = aiProductsDataSource.getPosts();
      expect(Array.isArray(posts)).toBe(true);
    });

    it("each product has required fields", () => {
      const posts = aiProductsDataSource.getPosts();
      if (posts.length === 0) return;
      const p = posts[0];
      expect(typeof p.slug).toBe("string");
      expect(typeof p.date).toBe("string");
      expect(Array.isArray(p.tags)).toBe(true);
      expect(Array.isArray(p.categories)).toBe(true);
      expect(p.product).toBeDefined();
      expect(typeof p.product.name).toBe("string");
      expect(typeof p.product.url).toBe("string");
      expect(typeof p.product.category).toBe("string");
      expect(typeof p.product.launch_date).toBe("string");
    });

    it("reports are sorted by date descending", () => {
      const posts = aiProductsDataSource.getPosts();
      for (let i = 1; i < posts.length; i++) {
        expect(posts[i - 1].date.localeCompare(posts[i].date)).toBeGreaterThanOrEqual(0);
      }
    });

    it("no duplicate slugs", () => {
      const posts = aiProductsDataSource.getPosts();
      const slugs = posts.map((p) => p.slug);
      const unique = new Set(slugs);
      expect(unique.size).toBe(slugs.length);
    });
  });

  describe("getPostBySlug", () => {
    it("returns product for valid slug", () => {
      const posts = aiProductsDataSource.getPosts();
      if (posts.length === 0) return;
      const found = aiProductsDataSource.getPostBySlug(posts[0].slug);
      expect(found).toBeDefined();
      expect(found?.slug).toBe(posts[0].slug);
    });

    it("returns undefined for unknown slug", () => {
      const found = aiProductsDataSource.getPostBySlug("nonexistent-product-xyz");
      expect(found).toBeUndefined();
    });
  });

  describe("getPostsLocalized", () => {
    it("returns products for zh-Hans", async () => {
      const posts = await aiProductsDataSource.getPostsLocalized("zh-Hans");
      expect(Array.isArray(posts)).toBe(true);
    });

    it("returns products for en", async () => {
      const posts = await aiProductsDataSource.getPostsLocalized("en");
      expect(Array.isArray(posts)).toBe(true);
    });

    it("returns products for each locale", async () => {
      const locales = ["zh-Hans", "zh-Hant", "en", "ja", "vi"] as const;
      for (const locale of locales) {
        const posts = await aiProductsDataSource.getPostsLocalized(locale);
        expect(Array.isArray(posts)).toBe(true);
      }
    });

    it("same slug returns same data across locales", async () => {
      const zhHans = await aiProductsDataSource.getPostsLocalized("zh-Hans");
      const en = await aiProductsDataSource.getPostsLocalized("en");
      if (zhHans.length === 0 || en.length === 0) return;
      expect(zhHans[0].slug).toBe(en[0].slug);
    });

    it("reports sorted by date descending", async () => {
      const posts = await aiProductsDataSource.getPostsLocalized("zh-Hans");
      for (let i = 1; i < posts.length; i++) {
        expect(posts[i - 1].date.localeCompare(posts[i].date)).toBeGreaterThanOrEqual(0);
      }
    });
  });

  describe("resolve", () => {
    it("resolves title for zh-Hans locale", () => {
      const posts = aiProductsDataSource.getPosts();
      if (posts.length === 0) return;
      const resolved = aiProductsDataSource.resolve(posts[0], "zh-Hans");
      expect(typeof resolved.title).toBe("string");
      expect((resolved.title as string).length).toBeGreaterThan(0);
    });

    it("resolves description for en locale", async () => {
      const posts = await aiProductsDataSource.getPostsLocalized("en");
      if (posts.length === 0) return;
      const resolved = aiProductsDataSource.resolve(posts[0], "en");
      expect(typeof resolved.description).toBe("string");
    });

    it("resolved object retains all meta fields", () => {
      const posts = aiProductsDataSource.getPosts();
      if (posts.length === 0) return;
      const resolved = aiProductsDataSource.resolve(posts[0], "zh-Hans");
      expect(resolved.slug).toBe(posts[0].slug);
      expect(resolved.date).toBe(posts[0].date);
      expect(resolved.tags).toEqual(posts[0].tags);
    });
  });

  describe("product field structure", () => {
    it("product has required core fields", () => {
      const posts = aiProductsDataSource.getPosts();
      if (posts.length === 0) return;
      const p = posts[0] as AIProductMeta;
      expect(p.product.name.length).toBeGreaterThan(0);
      expect(p.product.url.length).toBeGreaterThan(0);
      expect(p.product.category.length).toBeGreaterThan(0);
      expect(p.product.launch_date.length).toBeGreaterThan(0);
    });

    it("product.url is a valid http(s) URL", () => {
      const posts = aiProductsDataSource.getPosts();
      if (posts.length === 0) return;
      const p = posts[0] as AIProductMeta;
      expect(p.product.url).toMatch(/^https?:\/\//);
    });

    it("product.launch_date is YYYY-MM format", () => {
      const posts = aiProductsDataSource.getPosts();
      if (posts.length === 0) return;
      const p = posts[0] as AIProductMeta;
      expect(p.product.launch_date).toMatch(/^\d{4}-\d{2}$/);
    });

    it("pricing is array of plan/price/currency/period when present", () => {
      const posts = aiProductsDataSource.getPosts();
      const withPricing = posts.find((p) => Array.isArray(p.pricing) && p.pricing.length > 0);
      if (!withPricing) return;
      const item = withPricing.pricing![0];
      expect(typeof item.plan).toBe("string");
      expect(typeof item.price).toBe("number");
      expect(typeof item.currency).toBe("string");
      expect(item.period === null || typeof item.period === "string").toBe(true);
    });

    it("metrics entries have name + value when present", () => {
      const posts = aiProductsDataSource.getPosts();
      const withMetrics = posts.find((p) => Array.isArray(p.metrics) && p.metrics.length > 0);
      if (!withMetrics) return;
      const item = withMetrics.metrics![0];
      expect(typeof item.name).toBe("string");
      expect(typeof item.value).toBe("string");
    });

    it("sources entries have label + url when present", () => {
      const posts = aiProductsDataSource.getPosts();
      const withSources = posts.find((p) => Array.isArray(p.sources) && p.sources.length > 0);
      if (!withSources) return;
      const item = withSources.sources![0];
      expect(typeof item.label).toBe("string");
      expect(item.url).toMatch(/^https?:\/\//);
    });
  });

  describe("getPostWithContent", () => {
    it("returns undefined for unknown slug", async () => {
      const result = await aiProductsDataSource.getPostWithContent("nonexistent-product-xyz");
      expect(result).toBeUndefined();
    });

    it("returns product with content for valid slug", async () => {
      const posts = aiProductsDataSource.getPosts();
      if (posts.length === 0) return;
      const result = await aiProductsDataSource.getPostWithContent(posts[0].slug);
      expect(result).toBeDefined();
      // content may be undefined when per-slug chunk is missing (fallback to meta)
      if (result) {
        expect(result.slug).toBe(posts[0].slug);
        expect(result.product).toBeDefined();
      }
    });
  });

  describe("date format", () => {
    it("date is valid ISO format (YYYY-MM-DD)", () => {
      const posts = aiProductsDataSource.getPosts();
      const isoDate = /^\d{4}-\d{2}-\d{2}$/;
      posts.forEach((p) => {
        expect(p.date).toMatch(isoDate);
      });
    });
  });
});
