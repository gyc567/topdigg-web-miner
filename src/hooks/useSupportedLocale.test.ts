import { describe, it, expect, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { useSupportedLocale } from "./useSupportedLocale";
import * as reactI18next from "react-i18next";

vi.mock("react-i18next", async () => {
  const actual = await vi.importActual<typeof reactI18next>("react-i18next");
  return {
    ...actual,
    useTranslation: () => ({
      i18n: { language: "en-US" },
    }),
  };
});

describe("useSupportedLocale", () => {
  it("normalizes browser locale to supported locale", () => {
    const { result } = renderHook(() => useSupportedLocale());
    expect(result.current).toBe("en");
  });
});
