import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LanguageSwitcher } from "./LanguageSwitcher";
import * as reactI18next from "react-i18next";

const changeLanguage = vi.fn();

vi.mock("react-i18next", async () => {
  const actual = await vi.importActual<typeof reactI18next>("react-i18next");
  return {
    ...actual,
    useTranslation: () => ({
      t: (key: string) => key,
      i18n: {
        language: "en",
        changeLanguage,
      },
    }),
  };
});

describe("LanguageSwitcher", () => {
  beforeEach(() => {
    changeLanguage.mockClear();
    localStorage.clear();
  });

  it("renders a select with the current language selected", () => {
    render(<LanguageSwitcher />);
    const select = screen.getByLabelText("Select language") as HTMLSelectElement;
    expect(select).toBeInTheDocument();
    expect(select.value).toBe("en");
  });

  it("changes language and persists to localStorage on selection", async () => {
    const user = userEvent.setup();
    render(<LanguageSwitcher />);

    const select = screen.getByLabelText("Select language");
    await user.selectOptions(select, "ja");

    expect(changeLanguage).toHaveBeenCalledWith("ja");
    expect(localStorage.getItem("lang")).toBe("ja");
  });
});
