/**
 * Analytics 组件测试 — env 驱动条件渲染
 *   A1: 全空 → 渲染空（no script, no meta tag）
 *   A2: 仅 GA4 set → 渲染 gtag.js + init script
 *   A3: 仅 Clarity set → 渲染 clarity inline script
 *   A4: 仅 GSC set → 渲染 meta tag
 *   A5: 全部 set → 渲染全部 3 件套
 *   A6: GA4 单引号避免被恶意 token 注入
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { HelmetProvider } from "react-helmet-async";
import { Analytics } from "./Analytics";

// Vite env vars are read at module load time. We import.meta.env at module-eval
// so we need to set them BEFORE the module is first imported. Use vi.stubEnv.
function setEnv(vars: Record<string, string | undefined>) {
  for (const [k, v] of Object.entries(vars)) {
    if (v === undefined) vi.unstubAllEnvs();
    else vi.stubEnv(k, v);
  }
}

const wrap = (ui: React.ReactNode) => (
  <HelmetProvider>{ui}</HelmetProvider>
);

/**
 * Helmet-async injects tags into <head>. After render, we read them from
 * document.head directly.
 */
function headSnapshot(): {
  metas: Array<{ name: string; content: string }>;
  scripts: Array<{ src?: string; innerHTML?: string }>;
} {
  const metas = Array.from(document.head.querySelectorAll('meta[name]'))
    .filter((m) => m.getAttribute("name") === "google-site-verification")
    .map((m) => ({
      name: m.getAttribute("name") ?? "",
      content: m.getAttribute("content") ?? "",
    }));
  const scripts = Array.from(document.head.querySelectorAll("script")).map((s) => ({
    src: s.getAttribute("src") ?? undefined,
    innerHTML: s.textContent ?? undefined,
  }));
  return { metas, scripts };
}

beforeEach(() => {
  // Each test starts with no env vars
  vi.unstubAllEnvs();
  // Reset head to avoid bleed from previous tests
  document.head.innerHTML = "";
});

describe("Analytics — env-driven injection", () => {
  it("A1: 全空 → 不渲染任何 meta/script", async () => {
    const { container } = render(wrap(<Analytics />));
    expect(container.textContent).toBe("");
    const head = headSnapshot();
    expect(head.metas).toEqual([]);
    expect(head.scripts.filter((s) => s.src?.includes("googletagmanager") || s.innerHTML?.includes("clarity"))).toEqual([]);
  });

  it("A2: 仅 GA4 → 渲染 gtag.js loader + init script", async () => {
    vi.stubEnv("VITE_GA4_MEASUREMENT_ID", "G-TEST1234");
    // re-import to pick up stubEnv value
    render(wrap(<Analytics />));
    const head = headSnapshot();
    expect(head.scripts.find((s) => s.src?.includes("G-TEST1234"))).toBeTruthy();
    expect(head.scripts.find((s) => s.innerHTML?.includes("G-TEST1234"))).toBeTruthy();
  });

  it("A3: 仅 Clarity → 渲染 clarity inline script", async () => {
    vi.stubEnv("VITE_CLARITY_PROJECT_ID", "clarity_test_id");
    render(wrap(<Analytics />));
    const head = headSnapshot();
    expect(head.scripts.find((s) => s.innerHTML?.includes("clarity_test_id"))).toBeTruthy();
  });

  it("A4: 仅 GSC → 渲染 google-site-verification meta", async () => {
    vi.stubEnv("VITE_GSC_VERIFICATION_ID", "gsc_test_token");
    render(wrap(<Analytics />));
    const head = headSnapshot();
    expect(head.metas).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ content: "gsc_test_token" }),
      ]),
    );
  });

  it("A5: 全部 set → 渲染全部 3 件套", async () => {
    vi.stubEnv("VITE_GA4_MEASUREMENT_ID", "G-ALL1");
    vi.stubEnv("VITE_CLARITY_PROJECT_ID", "all_clarity");
    vi.stubEnv("VITE_GSC_VERIFICATION_ID", "all_gsc");
    render(wrap(<Analytics />));
    const head = headSnapshot();
    expect(head.metas.find((m) => m.content === "all_gsc")).toBeTruthy();
    expect(head.scripts.find((s) => s.src?.includes("G-ALL1"))).toBeTruthy();
    expect(head.scripts.find((s) => s.innerHTML?.includes("G-ALL1"))).toBeTruthy();
    expect(head.scripts.find((s) => s.innerHTML?.includes("all_clarity"))).toBeTruthy();
  });
});

describe("Analytics — security", () => {
  it("GA4 ID 中的单引号被转义", async () => {
    vi.stubEnv("VITE_GA4_MEASUREMENT_ID", "G-EVIL'; alert(1);//");
    render(wrap(<Analytics />));
    const head = headSnapshot();
    const initScript = head.scripts.find((s) => s.innerHTML?.includes("G-EVIL"));
    expect(initScript).toBeTruthy();
    // 反斜杠转义后的产物：G-EVIL\'\; alert(1)//
    // 我们只检查不会以未转义的 ' 跟 config 紧挨
    expect(initScript?.innerHTML).not.toMatch(/config',\s*'G-EVIL';/);
  });
});


