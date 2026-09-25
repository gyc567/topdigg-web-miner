/**
 * AuthGate 组件测试 — 覆盖 4 个状态分支
 *   1. loading  → 加载中文案
 *   2. 未登录  → 解锁提示 + CTA
 *   3. 已订阅 / 已解锁 → 返回 null（容器空）
 *   4. 已登录但无访问 → 3 个 PricingCard
 *
 * 通过 vi.mock @/lib/auth 全部 stub，避免依赖 supabase 状态。
 */
import { describe, it, expect, vi, beforeAll, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { I18nextProvider } from "react-i18next";
import i18n from "@/i18n";
import { AuthGate } from "./AuthGate";

const authMockState = vi.hoisted(() => ({
  user: null as null | { id: string; email?: string },
  authLoading: false,
  accessLoading: false,
  hasSubscription: false,
  hasUnlock: false,
}));

vi.mock("@/lib/auth", () => ({
  useAuth: () => ({
    user: authMockState.user,
    loading: authMockState.authLoading,
    isAuthenticated: !!authMockState.user,
  }),
  useAccess: () => ({
    hasSubscription: authMockState.hasSubscription,
    hasUnlock: authMockState.hasUnlock,
    loading: authMockState.accessLoading,
    subscription: null,
    refetch: () => {},
  }),
  notifyPurchaseCompleted: vi.fn(),
  onPurchaseCompleted: () => () => {},
}));

const wrap = (ui: React.ReactNode) => (
  <I18nextProvider i18n={i18n}>{ui}</I18nextProvider>
);

beforeAll(async () => {
  await i18n.changeLanguage("zh-Hans");
});

beforeEach(() => {
  authMockState.user = null;
  authMockState.authLoading = false;
  authMockState.accessLoading = false;
  authMockState.hasSubscription = false;
  authMockState.hasUnlock = false;
});

describe("AuthGate", () => {
  it("loading 态（auth 或 access 任一在 loading）: 显示加载中", () => {
    authMockState.user = null;
    authMockState.authLoading = true;
    const { container } = render(
      wrap(<AuthGate postSlug="post-1" postTitle="标题" />),
    );
    expect(container.textContent).toMatch(/加载|loading/i);
  });

  it("access loading 时（已登录）也是 loading", () => {
    authMockState.user = { id: "u1", email: "a@b.com" };
    authMockState.accessLoading = true;
    const { container } = render(
      wrap(<AuthGate postSlug="post-1" postTitle="标题" />),
    );
    expect(container.textContent).toMatch(/加载|loading/i);
  });

  it("未登录: 解锁 CTA 按钮可见", () => {
    authMockState.user = null;
    authMockState.authLoading = false;
    const { getByRole, container } = render(
      wrap(<AuthGate postSlug="post-1" postTitle="标题" />),
    );
    // 期待"立即解锁"或 fallback 文案的按钮存在
    const btn = container.querySelector("button");
    expect(btn).toBeTruthy();
    expect(container.textContent).toMatch(/解锁/);
    // 不应该出现 PricingCard 价签
    expect(container.textContent).not.toMatch(/单篇解锁/);
    expect(container.textContent).not.toMatch(/月度会员/);
    // sanity: not throwing without getByRole
    expect(getByRole).toBeDefined();
  });

  it("已登录 + hasSubscription: 返回 null（容器空）", () => {
    authMockState.user = { id: "u1", email: "a@b.com" };
    authMockState.hasSubscription = true;
    const { container } = render(
      wrap(<AuthGate postSlug="post-1" postTitle="标题" />),
    );
    // AuthGate 在 hasSubscription 路径 return null，渲染容器为空
    expect(container.textContent?.trim()).toBe("");
  });

  it("已登录 + hasUnlock（无订阅）: 返回 null", () => {
    authMockState.user = { id: "u1", email: "a@b.com" };
    authMockState.hasSubscription = false;
    authMockState.hasUnlock = true;
    const { container } = render(
      wrap(<AuthGate postSlug="post-1" postTitle="标题" />),
    );
    expect(container.textContent?.trim()).toBe("");
  });

  it("已登录 + 无 sub 无 unlock: 渲染 3 个 PricingCard (single/monthly/yearly)", () => {
    authMockState.user = { id: "u1", email: "a@b.com" };
    authMockState.hasSubscription = false;
    authMockState.hasUnlock = false;
    const { container } = render(
      wrap(<AuthGate postSlug="post-1" postTitle="标题" />),
    );
    expect(container.textContent).toMatch(/单篇解锁/);
    expect(container.textContent).toMatch(/月度会员/);
    expect(container.textContent).toMatch(/年度会员/);
  });
});
