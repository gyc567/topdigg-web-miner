/**
 * auth hooks 测试 — useAuth + useAccess
 *
 * 用 vi.mock @/lib/supabase 提供可控 fake client；
 * 用 vi.hoisted 共享 fake state；@testing-library/react 的 renderHook
 * 跑 hooks。
 */
import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";

import type { SubscriptionRow, UnlockRow } from "@/lib/supabase";

const fakeState = vi.hoisted(() => ({
  configured: true,
  user: null as null | { id: string; email?: string },
  subs: [] as SubscriptionRow[],
  unlocks: [] as UnlockRow[],
  authChangeHandlers: [] as Array<(event: string, session: unknown) => void>,
  // Shared auth method mocks so production code & tests see the same instance
  signUp: vi.fn(() => Promise.resolve({ data: { user: null }, error: null })),
  signInWithPassword: vi.fn(() => Promise.resolve({ data: { user: null }, error: null })),
  signInWithOAuth: vi.fn(() => Promise.resolve({ data: {}, error: null })),
}));

vi.mock("@/lib/supabase", () => ({
  getSupabase: () => ({
    auth: {
      getUser: () => Promise.resolve({ data: { user: fakeState.user }, error: null }),
      signUp: fakeState.signUp,
      signInWithPassword: fakeState.signInWithPassword,
      signInWithOAuth: fakeState.signInWithOAuth,
      onAuthStateChange: (cb: (event: string, session: unknown) => void) => {
        fakeState.authChangeHandlers.push(cb);
        return { data: { subscription: { unsubscribe: () => {} } } };
      },
      admin: {
        getUserById: (id: string) =>
          Promise.resolve({
            data: fakeState.user && fakeState.user.id === id ? { user: fakeState.user } : null,
            error: null,
          }),
        listUsers: () =>
          Promise.resolve({
            data: { users: fakeState.user ? [fakeState.user] : [] },
            error: null,
          }),
      },
    },
    from: (table: string) => {
      const allRows =
        table === "subscriptions"
          ? fakeState.subs
          : table === "unlocks"
            ? fakeState.unlocks
            : [];
      // Capture eq/in filters; resolve at .limit() time so ordering matches real supabase-js
      const eqFilters: Record<string, unknown> = {};
      let inFilter: { column: string; values: unknown[] } | null = null;
      const resolve = () => {
        const matched = allRows.filter((row) => {
          for (const [k, v] of Object.entries(eqFilters)) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            if ((row as any)[k] !== v) return false;
          }
          if (inFilter) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            if (!inFilter.values.includes((row as any)[inFilter.column])) return false;
          }
          return true;
        });
        return Promise.resolve({
          data: matched.length ? [matched[0]] : [],
          error: null,
        });
      };
      const chain: Record<string, unknown> = {};
      chain.select = () => chain;
      chain.eq = (col: string, val: unknown) => {
        eqFilters[col] = val;
        return chain;
      };
      chain.in = (col: string, vals: unknown[]) => {
        inFilter = { column: col, values: vals };
        return chain;
      };
      chain.order = () => chain;
      chain.limit = () => resolve();
      return chain;
    },
  }),
  isSupabaseConfigured: () => fakeState.configured,
}));

const {
  useAuth,
  useAccess,
  signUpWithEmail,
  signInWithEmail,
  signInWithGoogle,
  notifyPurchaseCompleted,
  onPurchaseCompleted,
} = await import("@/lib/auth");

// Reusable table helpers
function makeSub(over: Partial<SubscriptionRow> = {}): SubscriptionRow {
  return {
    id: "sub_1",
    user_id: "u1",
    paddle_subscription_id: "ps_1",
    paddle_customer_id: "pc_1",
    status: "active",
    plan: "monthly",
    current_period_end: "2026-12-01T00:00:00Z",
    cancel_at_period_end: false,
    ...over,
  };
}

function makeUnlock(over: Partial<UnlockRow> = {}): UnlockRow {
  return {
    id: "ul_1",
    user_id: "u1",
    post_slug: "xhs-2026",
    paddle_transaction_id: "tx_1",
    amount: 1.99,
    currency: "USD",
    created_at: "2026-09-01T00:00:00Z",
    ...over,
  };
}

beforeEach(() => {
  fakeState.configured = true;
  fakeState.user = null;
  fakeState.subs = [];
  fakeState.unlocks = [];
  fakeState.authChangeHandlers = [];
  fakeState.signUp.mockClear();
  fakeState.signInWithPassword.mockClear();
  fakeState.signInWithOAuth.mockClear();
});

// -------- useAuth --------
describe("useAuth", () => {
  it("Supabase 未配置时 loading 立刻 false, user 始终 null", async () => {
    fakeState.configured = false;
    const { result } = renderHook(() => useAuth());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it("已登录时 user 拉到 supabase.auth.getUser", async () => {
    fakeState.user = { id: "u1", email: "alice@example.com" };
    const { result } = renderHook(() => useAuth());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.user?.id).toBe("u1");
    expect(result.current.isAuthenticated).toBe(true);
  });

  it("未登录时 user null, isAuthenticated false", async () => {
    fakeState.user = null;
    const { result } = renderHook(() => useAuth());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it("onAuthStateChange 推送 SIGNED_IN 时 user 更新", async () => {
    fakeState.user = null;
    const { result } = renderHook(() => useAuth());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.user).toBeNull();

    const cb = fakeState.authChangeHandlers[0];
    act(() => {
      cb("SIGNED_IN", { user: { id: "u_signed_in", email: "s@x.com" } });
    });
    expect(result.current.user?.id).toBe("u_signed_in");
    expect(result.current.isAuthenticated).toBe(true);

    act(() => {
      cb("SIGNED_OUT", null);
    });
    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });
});

// -------- useAccess --------
describe("useAccess", () => {
  it("无 userId: loading false, hasSubscription/hasUnlock 都 false", async () => {
    const { result } = renderHook(() => useAccess(undefined, "post-1"));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.hasSubscription).toBe(false);
    expect(result.current.hasUnlock).toBe(false);
    expect(result.current.subscription).toBeNull();
  });

  it("Supabase 未配置: 同上", async () => {
    fakeState.configured = false;
    const { result } = renderHook(() => useAccess("u1", "post-1"));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.hasSubscription).toBe(false);
    expect(result.current.hasUnlock).toBe(false);
  });

  it("active subscription → hasSubscription true", async () => {
    fakeState.user = { id: "u1" };
    fakeState.subs = [makeSub({ status: "active", plan: "monthly" })];
    const { result } = renderHook(() => useAccess("u1", "post-1"));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.hasSubscription).toBe(true);
    expect(result.current.subscription?.plan).toBe("monthly");
  });

  it("trialing subscription 也算 active（按 in() 实现）", async () => {
    fakeState.user = { id: "u1" };
    fakeState.subs = [makeSub({ status: "trialing", plan: "yearly" })];
    const { result } = renderHook(() => useAccess("u1", "post-1"));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.hasSubscription).toBe(true);
    expect(result.current.subscription?.plan).toBe("yearly");
  });

  it("canceled subscription 不算", async () => {
    fakeState.user = { id: "u1" };
    fakeState.subs = [makeSub({ status: "canceled" })];
    const { result } = renderHook(() => useAccess("u1", "post-1"));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.hasSubscription).toBe(false);
    expect(result.current.subscription).toBeNull();
  });

  it("hasUnlock 为 true 时 hasSubscription 可为 false", async () => {
    fakeState.user = { id: "u1" };
    fakeState.subs = [];
    fakeState.unlocks = [makeUnlock({ post_slug: "post-1" })];
    const { result } = renderHook(() => useAccess("u1", "post-1"));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.hasSubscription).toBe(false);
    expect(result.current.hasUnlock).toBe(true);
  });

  it("不同 post 的 unlock: hasUnlock 为 false", async () => {
    fakeState.user = { id: "u1" };
    fakeState.unlocks = [makeUnlock({ post_slug: "post-OTHER" })];
    const { result } = renderHook(() => useAccess("u1", "post-target"));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.hasUnlock).toBe(false);
  });

  it("refetch() 重新拉取 subscription 状态", async () => {
    fakeState.user = { id: "u1" };
    fakeState.subs = [];
    const { result } = renderHook(() => useAccess("u1", "post-1"));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.hasSubscription).toBe(false);

    // 后台新建一条订阅
    fakeState.subs = [makeSub({ status: "active" })];

    // 手动 refetch
    act(() => {
      result.current.refetch();
    });
    await waitFor(() => expect(result.current.hasSubscription).toBe(true));
  });
});

// -------- helpers (signUp/signIn/Google/notify/onPurchase) --------
describe("auth helpers", () => {
  it("signUpWithEmail 调 supabase.auth.signUp with email+password", async () => {
    const fakeClient = (await import("@/lib/supabase")).getSupabase();
    // 触发一次让 fake client 被 query 一次
    fakeState.user = null;
    await signUpWithEmail("a@b.com", "secret123");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((fakeClient.auth as any).signUp).toHaveBeenCalledWith({
      email: "a@b.com",
      password: "secret123",
    });
  });

  it("signInWithEmail 调 supabase.auth.signInWithPassword", async () => {
    await signInWithEmail("a@b.com", "pw");
    expect(fakeState.signInWithPassword).toHaveBeenCalledWith({
      email: "a@b.com",
      password: "pw",
    });
  });

  it("signInWithGoogle 调 supabase.auth.signInWithOAuth with redirectTo", async () => {
    delete import.meta.env.VITE_PAY_DOMAIN;
    await signInWithGoogle("/money-lab/post-1");
    const call = fakeState.signInWithOAuth.mock.calls[0][0];
    expect(call.provider).toBe("google");
    expect(call.options.redirectTo).toMatch(/oauth-callback.*return_to=%2Fmoney-lab%2Fpost-1/);
  });

  it("notifyPurchaseCompleted 写 localStorage + dispatch CustomEvent", () => {
    const setSpy = vi.spyOn(Storage.prototype, "setItem");
    const dispatchSpy = vi.spyOn(window, "dispatchEvent");
    try {
      notifyPurchaseCompleted("post-x");
      expect(setSpy).toHaveBeenCalledWith(
        "purchase-completed",
        expect.stringContaining('"slug":"post-x"'),
      );
      expect(dispatchSpy).toHaveBeenCalled();
      const evt = dispatchSpy.mock.calls[0][0] as CustomEvent;
      expect(evt.type).toBe("purchase-completed");
      expect(evt.detail).toEqual({ slug: "post-x" });
    } finally {
      setSpy.mockRestore();
      dispatchSpy.mockRestore();
    }
  });

  it("onPurchaseCompleted: storage event 触发 handler with slug", () => {
    const handler = vi.fn();
    const off = onPurchaseCompleted(handler);
    const evt = new StorageEvent("storage", {
      key: "purchase-completed",
      newValue: JSON.stringify({ slug: "post-y" }),
    });
    window.dispatchEvent(evt);
    expect(handler).toHaveBeenCalledWith("post-y");
    off();
  });

  it("onPurchaseCompleted: custom event 触发 handler with slug", () => {
    const handler = vi.fn();
    const off = onPurchaseCompleted(handler);
    window.dispatchEvent(new CustomEvent("purchase-completed", { detail: { slug: "post-z" } }));
    expect(handler).toHaveBeenCalledWith("post-z");
    off();
  });

  it("onPurchaseCompleted: cleanup 后不再触发", () => {
    const handler = vi.fn();
    const off = onPurchaseCompleted(handler);
    off();
    window.dispatchEvent(new CustomEvent("purchase-completed", { detail: { slug: "post-q" } }));
    expect(handler).not.toHaveBeenCalled();
  });

  it("onPurchaseCompleted: storage event 无效 JSON 不 throw", () => {
    const handler = vi.fn();
    const off = onPurchaseCompleted(handler);
    const evt = new StorageEvent("storage", {
      key: "purchase-completed",
      newValue: "not json",
    });
    expect(() => window.dispatchEvent(evt)).not.toThrow();
    expect(handler).not.toHaveBeenCalled();
    off();
  });
});
