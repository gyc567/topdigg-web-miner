import { describe, it, expect, beforeEach } from "vitest";
import { aiDailyDataSource } from "./ai-daily-data";
import type { AIDailyMeta } from "./ai-daily-data";

describe("AIDailyDataSource", () => {
  describe("getReports", () => {
    it("returns all reports as array", () => {
      const reports = aiDailyDataSource.getReports();
      expect(Array.isArray(reports)).toBe(true);
    });

    it("each report has required fields", () => {
      const reports = aiDailyDataSource.getReports();
      if (reports.length === 0) return;
      const r = reports[0];
      expect(typeof r.slug).toBe("string");
      expect(typeof r.date).toBe("string");
      expect(Array.isArray(r.tags)).toBe(true);
      expect(Array.isArray(r.categories)).toBe(true);
      expect(r.source).toBeDefined();
      expect(typeof r.source.aggregator).toBe("string");
    });

    it("reports are sorted by date descending", () => {
      const reports = aiDailyDataSource.getReports();
      for (let i = 1; i < reports.length; i++) {
        expect(reports[i - 1].date.localeCompare(reports[i].date)).toBeGreaterThanOrEqual(0);
      }
    });

    it("no duplicate slugs", () => {
      const reports = aiDailyDataSource.getReports();
      const slugs = reports.map((r) => r.slug);
      const unique = new Set(slugs);
      expect(unique.size).toBe(slugs.length);
    });
  });

  describe("getReportBySlug", () => {
    it("returns report for valid slug", () => {
      const reports = aiDailyDataSource.getReports();
      if (reports.length === 0) return;
      const found = aiDailyDataSource.getReportBySlug(reports[0].slug);
      expect(found).toBeDefined();
      expect(found?.slug).toBe(reports[0].slug);
    });

    it("returns undefined for unknown slug", () => {
      const found = aiDailyDataSource.getReportBySlug("nonexistent-slug-xyz");
      expect(found).toBeUndefined();
    });
  });

  describe("getReportsLocalized", () => {
    it("returns reports for zh-Hans", async () => {
      const reports = await aiDailyDataSource.getReportsLocalized("zh-Hans");
      expect(Array.isArray(reports)).toBe(true);
    });

    it("returns reports for en", async () => {
      const reports = await aiDailyDataSource.getReportsLocalized("en");
      expect(Array.isArray(reports)).toBe(true);
    });

    it("same slug returns same data across locales", async () => {
      const zhHans = await aiDailyDataSource.getReportsLocalized("zh-Hans");
      const en = await aiDailyDataSource.getReportsLocalized("en");
      if (zhHans.length === 0 || en.length === 0) return;
      expect(zhHans[0].slug).toBe(en[0].slug);
    });

    it("no duplicate dates (one report per date)", async () => {
      const reports = await aiDailyDataSource.getReportsLocalized("zh-Hans");
      const dates = reports.map((r) => r.date);
      const unique = new Set(dates);
      expect(unique.size).toBe(dates.length);
    });

    it("reports sorted by date descending", async () => {
      const reports = await aiDailyDataSource.getReportsLocalized("zh-Hans");
      for (let i = 1; i < reports.length; i++) {
        expect(reports[i - 1].date.localeCompare(reports[i].date)).toBeGreaterThanOrEqual(0);
      }
    });
  });

  describe("resolve", () => {
    it("resolves title for zh-Hans locale", () => {
      const reports = aiDailyDataSource.getReports();
      if (reports.length === 0) return;
      const resolved = aiDailyDataSource.resolve(reports[0], "zh-Hans");
      expect(typeof resolved.title).toBe("string");
      expect(resolved.title.length).toBeGreaterThan(0);
    });

    it("resolves description for en locale", async () => {
      const reports = await aiDailyDataSource.getReportsLocalized("en");
      if (reports.length === 0) return;
      const resolved = aiDailyDataSource.resolve(reports[0], "en");
      expect(typeof resolved.description).toBe("string");
    });

    it("resolved object retains all meta fields", () => {
      const reports = aiDailyDataSource.getReports();
      if (reports.length === 0) return;
      const resolved = aiDailyDataSource.resolve(reports[0], "zh-Hans");
      expect(resolved.slug).toBe(reports[0].slug);
      expect(resolved.date).toBe(reports[0].date);
      expect(resolved.tags).toEqual(reports[0].tags);
    });
  });

  describe("source field structure", () => {
    it("aggregator field is present and non-empty", () => {
      const reports = aiDailyDataSource.getReports();
      if (reports.length === 0) return;
      const r = reports[0] as AIDailyMeta;
      expect(typeof r.source.aggregator).toBe("string");
      expect(r.source.aggregator.length).toBeGreaterThan(0);
    });

    it("original field has name", () => {
      const reports = aiDailyDataSource.getReports();
      if (reports.length === 0) return;
      const r = reports[0] as AIDailyMeta;
      expect(typeof r.source.original.name).toBe("string");
    });
  });

  describe("date format", () => {
    it("date is valid ISO format (YYYY-MM-DD)", () => {
      const reports = aiDailyDataSource.getReports();
      const isoDate = /^\d{4}-\d{2}-\d{2}$/;
      reports.forEach((r) => {
        expect(r.date).toMatch(isoDate);
      });
    });
  });
});
