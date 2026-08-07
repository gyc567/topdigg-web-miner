import { describe, it, expect } from "vitest";
import zhHans from "./zh-Hans/translation.json";
import zhHant from "./zh-Hant/translation.json";
import en from "./en/translation.json";
import ja from "./ja/translation.json";
import vi from "./vi/translation.json";

type NestedRecord = Record<string, unknown>;

const flattenKeys = (obj: NestedRecord, prefix = ""): string[] =>
  Object.entries(obj).flatMap(([key, value]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    return value !== null && typeof value === "object"
      ? flattenKeys(value as NestedRecord, path)
      : [path];
  });

describe("i18n translation key parity", () => {
  const locales: Record<string, NestedRecord> = { zhHans, zhHant, en, ja, vi };
  const enKeys = flattenKeys(en).sort();

  it("en file has keys", () => {
    expect(enKeys.length).toBeGreaterThan(0);
  });

  it.each(Object.entries(locales))(
    "%s has exactly the same key structure as en",
    (_name, translations) => {
      const keys = flattenKeys(translations).sort();
      expect(keys).toEqual(enKeys);
    }
  );

  it("every locale declares all five language names in the switcher", () => {
    const languageKeys = ["zh-Hans", "zh-Hant", "en", "ja", "vi"];
    for (const translations of Object.values(locales)) {
      const languages = (translations as NestedRecord).languages as NestedRecord;
      for (const key of languageKeys) {
        expect(typeof languages[key], `missing languages.${key}`).toBe("string");
      }
    }
  });
});
