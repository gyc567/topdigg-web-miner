/**
 * Tests for chunk-load error recovery logic.
 *
 * Pure-logic tests for `shouldReload` guard and error-message regex.
 * One integration test using a private EventTarget (avoids window-global
 * listener pollution across tests).
 */
import { describe, it, expect, beforeEach, vi } from "vitest";

// =====================================================================
// Pure functions (mirror of production logic)
// =====================================================================

function shouldReload(): boolean {
  if (sessionStorage.getItem("__chunk_reload__") === "1") return false;
  sessionStorage.setItem("__chunk_reload__", "1");
  return true;
}

const CHUNK_ERR_RE = /Failed to fetch dynamically imported module|Loading chunk|Importing a module script failed/i;

// =====================================================================
// Unit: shouldReload()
// =====================================================================

describe("chunk-load recovery: shouldReload() guard", () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it("first call returns true", () => {
    expect(shouldReload()).toBe(true);
  });

  it("second call returns false (loop guard)", () => {
    expect(shouldReload()).toBe(true);
    expect(shouldReload()).toBe(false);
    expect(shouldReload()).toBe(false);
  });

  it("lock can be cleared explicitly (post-reload cleanup)", () => {
    sessionStorage.setItem("__chunk_reload__", "1");
    expect(sessionStorage.getItem("__chunk_reload__")).toBe("1");
    sessionStorage.removeItem("__chunk_reload__");
    expect(sessionStorage.getItem("__chunk_reload__")).toBeNull();
  });
});

// =====================================================================
// Unit: error-message regex
// =====================================================================

describe("chunk-load recovery: error message regex", () => {
  it("matches Vite 'Failed to fetch dynamically imported module'", () => {
    expect(CHUNK_ERR_RE.test("Failed to fetch dynamically imported module: /assets/abc.js")).toBe(true);
  });

  it("matches 'Loading chunk N failed' (webpack chunked)", () => {
    expect(CHUNK_ERR_RE.test("Loading chunk 5 failed")).toBe(true);
  });

  it("matches 'Importing a module script failed' (Safari)", () => {
    expect(CHUNK_ERR_RE.test("Importing a module script failed")).toBe(true);
  });

  it("does NOT match unrelated errors", () => {
    expect(CHUNK_ERR_RE.test("Network request failed")).toBe(false);
    expect(CHUNK_ERR_RE.test("TypeError: undefined is not a function")).toBe(false);
    expect(CHUNK_ERR_RE.test("Random text")).toBe(false);
  });
});

// =====================================================================
// Integration: full handler runs through isolated EventTarget
// (so we don't pollute window listeners across tests)
// =====================================================================

describe("chunk-load recovery: full handler integration", () => {
  let replace: ReturnType<typeof vi.fn>;
  let target: EventTarget;

  beforeEach(() => {
    sessionStorage.clear();
    replace = vi.fn();
    target = new EventTarget();

    // Install the same handler production uses, but on the isolated target
    target.addEventListener("vite:preloadError", (event) => {
      // Mirrors production: only preventDefault when actually going to reload
      if (!shouldReload()) return;
      (event as Event).preventDefault();
      replace("_v=test");
    });
    target.addEventListener("unhandledrejection", (event) => {
      const e = event as unknown as { reason?: unknown };
      const msg = e.reason instanceof Error ? e.reason.message : String(e.reason);
      if (!CHUNK_ERR_RE.test(msg)) return;
      if (!shouldReload()) return;
      replace("_v=test");
    });
  });

  function makeRejectionEvent(reason: unknown): Event {
    const evt = new Event("unhandledrejection");
    Object.defineProperty(evt, "reason", { value: reason, enumerable: true });
    return evt;
  }

  it("vite:preloadError triggers replace once", () => {
    const evt = new Event("vite:preloadError", { cancelable: true });
    target.dispatchEvent(evt);
    expect(replace).toHaveBeenCalledTimes(1);
    expect(replace).toHaveBeenCalledWith("_v=test");
    expect(evt.defaultPrevented).toBe(true);
  });

  it("2nd vite:preloadError is blocked by sessionStorage lock", () => {
    const evt1 = new Event("vite:preloadError", { cancelable: true });
    target.dispatchEvent(evt1);
    const evt2 = new Event("vite:preloadError", { cancelable: true });
    target.dispatchEvent(evt2);
    expect(replace).toHaveBeenCalledTimes(1);
    expect(evt2.defaultPrevented).toBe(false);
  });

  it("unhandledrejection with chunk error triggers reload", () => {
    target.dispatchEvent(
      makeRejectionEvent(
        new Error("Failed to fetch dynamically imported module: /assets/MoneyLabIndex-abc.js"),
      ),
    );
    expect(replace).toHaveBeenCalledTimes(1);
  });

  it("unhandledrejection with non-chunk error does NOT reload", () => {
    target.dispatchEvent(makeRejectionEvent(new Error("Network failure")));
    expect(replace).toHaveBeenCalledTimes(0);
  });

  it("unhandledrejection with string reason (non-Error) handled", () => {
    target.dispatchEvent(makeRejectionEvent("Loading chunk 5 failed"));
    expect(replace).toHaveBeenCalledTimes(1);
  });
});
