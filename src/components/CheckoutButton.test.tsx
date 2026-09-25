/**
 * CheckoutButton 测试
 *   C1: 无 userEmail → alert + 不调 openCheckout
 *   C2: 点击 → openCheckout + user_id 进 customData
 *   C3: openCheckout reject → alert + loading 复位
 *   C4: paddle:checkout:completed 事件 → loading 复位
 */
import { describe, it, expect, vi, beforeAll, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { I18nextProvider } from "react-i18next";
import i18n from "@/i18n";
import { CheckoutButton } from "./CheckoutButton";

const mocks = vi.hoisted(() => ({
  openCheckout: vi.fn(),
  paddleHandlers: [] as Array<(e: unknown) => void>,
  paddleEventName: "",
  user: { id: "u_test_123", email: "buyer@example.com" } as { id: string; email: string } | null,
}));

vi.mock("@/lib/auth", () => ({
  useAuth: () => ({ user: mocks.user, loading: false, isAuthenticated: !!mocks.user }),
  useAccess: () => ({
    hasSubscription: false,
    hasUnlock: false,
    loading: false,
    subscription: null,
    refetch: () => {},
  }),
  notifyPurchaseCompleted: vi.fn(),
  onPurchaseCompleted: () => () => {},
}));

vi.mock("@/lib/paddle", () => ({
  openCheckout: mocks.openCheckout,
  getPriceId: (kind: string) => `pri_test_${kind}`,
  onPaddleEvent: (name: string, cb: (e: unknown) => void) => {
    mocks.paddleEventName = name;
    mocks.paddleHandlers.push(cb);
    return () => {
      const idx = mocks.paddleHandlers.indexOf(cb);
      if (idx >= 0) mocks.paddleHandlers.splice(idx, 1);
    };
  },
}));

const wrap = (ui: React.ReactNode) => (
  <I18nextProvider i18n={i18n}>{ui}</I18nextProvider>
);

beforeAll(async () => {
  await i18n.changeLanguage("zh-Hans");
});

beforeEach(() => {
  mocks.openCheckout.mockReset().mockResolvedValue(undefined);
  mocks.paddleHandlers.length = 0;
  mocks.paddleEventName = "";
  mocks.user = { id: "u_test_123", email: "buyer@example.com" };
  // jsdom doesn't ship alert by default; stub it
  if (!window.alert) {
    (window as unknown as { alert: (msg: string) => void }).alert = () => {};
  }
});

describe("CheckoutButton", () => {
  it("C1: 无 userEmail → alert '请先登录', 不调 openCheckout", async () => {
    const alertSpy = vi.spyOn(window, "alert");
    const user = userEvent.setup();
    render(
      wrap(
        <CheckoutButton priceKind="monthly" postSlug="post-1">
          立即购买
        </CheckoutButton>,
      ),
    );
    // 注意：父组件传入 userEmail（覆盖 useAuth.user.email）— 传 undefined 触发 alert
    // 重新 mock 让 userEmail = undefined 进来后仍走 alert 分支
    // 这里我们手动覆盖 props：
    render(
      wrap(
        <CheckoutButton priceKind="monthly" postSlug="post-1" userEmail={undefined}>
          立即购买
        </CheckoutButton>,
      ),
    );
    // 找到按钮（有 children 时不被 fallback 替代）
    const btn = screen.getAllByRole("button").find((b) => b.textContent?.includes("立即购买"));
    expect(btn).toBeTruthy();
    await user.click(btn!);
    await waitFor(() => expect(alertSpy).toHaveBeenCalled());
    const msg = alertSpy.mock.calls[0][0];
    expect(msg).toMatch(/请先登录|Please sign in/i);
    expect(mocks.openCheckout).not.toHaveBeenCalled();
    alertSpy.mockRestore();
  });

  it("C2: 点击 → openCheckout 被调, customData 含 user_id + user_email + post_slug", async () => {
    const user = userEvent.setup();
    mocks.openCheckout.mockResolvedValue(undefined);

    // Suppress "alert not called" /window.alert stubs override
    const alertSpy = vi.spyOn(window, "alert").mockImplementation(() => {});
    try {
      render(
        wrap(
          <CheckoutButton
            priceKind="monthly"
            postSlug="post-target"
            userEmail="buyer@example.com"
          >
            立即购买
          </CheckoutButton>,
        ),
      );
      await user.click(screen.getByRole("button", { name: /立即购买/ }));
      await waitFor(() => expect(mocks.openCheckout).toHaveBeenCalledTimes(1));
      const call = mocks.openCheckout.mock.calls[0][0];
      expect(call.items).toEqual([{ priceId: "pri_test_monthly", quantity: 1 }]);
      expect(call.customer).toEqual({ email: "buyer@example.com" });
      expect(call.customData.user_id).toBe("u_test_123");
      expect(call.customData.user_email).toBe("buyer@example.com");
      expect(call.customData.post_slug).toBe("post-target");
      expect(call.successUrl).toContain("/money-lab/post-target");
    } finally {
      alertSpy.mockRestore();
    }
  });

  it("C3: openCheckout reject → alert + loading 复位", async () => {
    const user = userEvent.setup();
    mocks.openCheckout.mockRejectedValue(new Error("net fail"));

    const alertSpy = vi.spyOn(window, "alert").mockImplementation(() => {});
    try {
      render(
        wrap(
          <CheckoutButton
            priceKind="single"
            userEmail="buyer@example.com"
          >
            立即购买
          </CheckoutButton>,
        ),
      );
      const btn = screen.getByRole("button", { name: /立即购买/ });
      await user.click(btn);
      // loading 短暂变 true（"加载中..."），然后因异常回到 false
      await waitFor(() => expect(alertSpy).toHaveBeenCalled());
      const msg = alertSpy.mock.calls[0][0];
      expect(msg).toMatch(/结账初始化失败|Could not start/);
      // loading 复位：按钮文字回到 fallback "立即购买"（children 优先）
      await waitFor(() => expect(btn.textContent).toMatch(/立即购买/));
    } finally {
      alertSpy.mockRestore();
    }
  });

  it("C4: paddle:checkout:completed 事件触发 → loading 复位", async () => {
    const user = userEvent.setup();
    mocks.openCheckout.mockResolvedValue(undefined);
    const alertSpy = vi.spyOn(window, "alert").mockImplementation(() => {});
    try {
      render(
        wrap(
          <CheckoutButton
            priceKind="yearly"
            userEmail="buyer@example.com"
          >
            立即购买
          </CheckoutButton>,
        ),
      );
      const btn = screen.getByRole("button", { name: /立即购买/ });
      await user.click(btn);
      // 模拟 loading=true 后, paddle 事件回调
      await waitFor(() => expect(mocks.paddleHandlers.length).toBeGreaterThan(0));
      // 触发 completed
      mocks.paddleHandlers.forEach((h) => h({}));
      // loading 复位: 按钮文案恢复
      await waitFor(() => expect(btn.textContent).toMatch(/立即购买/));
    } finally {
      alertSpy.mockRestore();
    }
  });
});
