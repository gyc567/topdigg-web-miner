import { describe, it, expect } from "vitest";
import {
  supportedLocales,
  defaultLocale,
  countryToLocale,
  normalizeLang,
  localizeText,
  withLangParam,
  ogLocaleMap,
  htmlLangMap,
  type SupportedLocale,
} from "./locale";

describe("supportedLocales", () => {
  it("contains all four supported locales", () => {
    expect(supportedLocales).toEqual(["zh-Hans", "zh-Hant", "en", "ja"]);
  });
});

describe("defaultLocale", () => {
  it("defaults to simplified Chinese", () => {
    expect(defaultLocale).toBe("zh-Hans");
  });
});

describe("countryToLocale", () => {
  it.each<[string, SupportedLocale]>([
    ["CN", "zh-Hans"],
    ["SG", "zh-Hans"],
    ["TW", "zh-Hant"],
    ["HK", "zh-Hant"],
    ["MO", "zh-Hant"],
    ["JP", "ja"],
    ["US", "en"],
    ["GB", "en"],
    ["", "en"],
  ])("maps %s to %s", (input, expected) => {
    expect(countryToLocale(input)).toBe(expected);
  });

  it("handles lowercase country codes", () => {
    expect(countryToLocale("cn")).toBe("zh-Hans");
    expect(countryToLocale("jp")).toBe("ja");
  });
});

describe("normalizeLang", () => {
  it.each<[string, SupportedLocale]>([
    ["zh-Hans", "zh-Hans"],
    ["zh-hans", "zh-Hans"],
    ["zh-CN", "zh-Hans"],
    ["zh-SG", "zh-Hans"],
    ["zh-Hant", "zh-Hant"],
    ["zh-TW", "zh-Hant"],
    ["zh-HK", "zh-Hant"],
    ["en", "en"],
    ["en-US", "en"],
    ["ja", "ja"],
    ["ja-JP", "ja"],
    ["", "zh-Hans"],
    ["fr", "en"],
  ])("normalizes %s to %s", (input, expected) => {
    expect(normalizeLang(input)).toBe(expected);
  });
});

describe("localizeText", () => {
  const localized = {
    "zh-Hans": "简体中文",
    "zh-Hant": "繁體中文",
    en: "English",
    ja: "日本語",
  };

  it("returns the requested locale value", () => {
    expect(localizeText(localized, "en")).toBe("English");
    expect(localizeText(localized, "ja")).toBe("日本語");
  });

  it("falls back to default locale when requested locale is missing", () => {
    const partial = { "zh-Hans": "中文", en: "English" } as Record<SupportedLocale, string>;
    expect(localizeText(partial, "ja")).toBe("中文");
  });

  it("falls back to English if default locale is missing", () => {
    const partial = { en: "English", ja: "日本語" } as Record<SupportedLocale, string>;
    expect(localizeText(partial, "zh-Hans")).toBe("English");
  });

  it("returns first available value when no known fallback exists", () => {
    const partial = { ja: "日本語" } as Record<SupportedLocale, string>;
    expect(localizeText(partial, "zh-Hans")).toBe("日本語");
  });

  it("returns string values unchanged", () => {
    expect(localizeText("plain string", "en")).toBe("plain string");
  });

  it("returns empty string for empty object", () => {
    expect(localizeText({}, "en")).toBe("");
  });
});

describe("withLangParam", () => {
  it("appends lang query param to a plain path", () => {
    expect(withLangParam("/blog", "en")).toBe("/blog?lang=en");
  });

  it("appends lang to a path with existing query params", () => {
    expect(withLangParam("/blog?foo=bar", "ja")).toBe("/blog?foo=bar&lang=ja");
  });
});

describe("ogLocaleMap", () => {
  it("maps supported locales to OpenGraph locale codes", () => {
    expect(ogLocaleMap["zh-Hans"]).toBe("zh_CN");
    expect(ogLocaleMap["zh-Hant"]).toBe("zh_TW");
    expect(ogLocaleMap.en).toBe("en_US");
    expect(ogLocaleMap.ja).toBe("ja_JP");
  });
});

describe("htmlLangMap", () => {
  it("maps supported locales to HTML lang attributes", () => {
    expect(htmlLangMap["zh-Hans"]).toBe("zh-Hans");
    expect(htmlLangMap["zh-Hant"]).toBe("zh-Hant");
    expect(htmlLangMap.en).toBe("en");
    expect(htmlLangMap.ja).toBe("ja");
  });
});
