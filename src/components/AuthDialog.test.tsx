/**
 * AuthDialog 组件测试 — signin/signup 流程 + Google OAuth
 *
 * Mock @/lib/auth 全部入口；用 userEvent 触发交互。
 */
import { describe, it, expect, vi, beforeAll, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { I18nextProvider } from "react-i18next";
import i18n from "@/i18n";
import { AuthDialog } from "./AuthDialog";

const authMocks = vi.hoisted(() => ({
  signInWithGoogle: vi.fn(),
  signInWithEmail: vi.fn(),
  signUpWithEmail: vi.fn(),
  notifyPurchaseCompleted: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({
  useAuth: () => ({ user: null, loading: false, isAuthenticated: false }),
  useAccess: () => ({
    hasSubscription: false,
    hasUnlock: false,
    loading: false,
    subscription: null,
    refetch: () => {},
  }),
  signInWithGoogle: authMocks.signInWithGoogle,
  signInWithEmail: authMocks.signInWithEmail,
  signUpWithEmail: authMocks.signUpWithEmail,
  notifyPurchaseCompleted: authMocks.notifyPurchaseCompleted,
  onPurchaseCompleted: () => () => {},
}));

const wrap = (ui: React.ReactNode) => (
  <I18nextProvider i18n={i18n}>{ui}</I18nextProvider>
);

beforeAll(async () => {
  await i18n.changeLanguage("zh-Hans");
});

beforeEach(() => {
  authMocks.signInWithGoogle.mockReset().mockResolvedValue({ error: null });
  authMocks.signInWithEmail.mockReset().mockResolvedValue({ error: null });
  authMocks.signUpWithEmail.mockReset().mockResolvedValue({ error: null });
  authMocks.notifyPurchaseCompleted.mockReset();
});

describe("AuthDialog", () => {
  it("open=false: 组件不渲染", () => {
    const { container } = render(
      wrap(<AuthDialog open={false} onOpenChange={() => {}} />),
    );
    expect(container.textContent).toBe("");
  });

  it("open=true: 默认 signup 模式, 显示“创建账号”", () => {
    render(wrap(<AuthDialog open={true} onOpenChange={() => {}} />));
    expect(screen.getByText("创建账号")).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument();
  });

  it("切到 signin: 显示“登录”", async () => {
    const user = userEvent.setup();
    render(wrap(<AuthDialog open={true} onOpenChange={() => {}} />));
    await user.click(screen.getByText(/已有账号/));
    expect(screen.getByText("登录")).toBeInTheDocument();
  });

  it("提交 signup 成功: 关 dialog + notifyPurchaseCompleted(postSlug) 被调用", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    authMocks.signUpWithEmail.mockResolvedValue({ error: null });

    render(
      wrap(
        <AuthDialog open={true} onOpenChange={onOpenChange} postSlug="post-1" />,
      ),
    );
    await user.type(screen.getByPlaceholderText(/email/i), "alice@example.com");
    await user.type(screen.getByPlaceholderText(/密码|至少6位/i), "secret123");
    await user.click(screen.getByText("创建账号"));

    await waitFor(() => expect(onOpenChange).toHaveBeenCalledWith(false));
    expect(authMocks.signUpWithEmail).toHaveBeenCalledWith(
      "alice@example.com",
      "secret123",
    );
    // notifyPurchaseCompleted 在 setTimeout(100ms) 中调用，等待即可
    await waitFor(
      () => expect(authMocks.notifyPurchaseCompleted).toHaveBeenCalledWith("post-1"),
      { timeout: 1000 },
    );
  });

  it("提交失败: 显示错误文案, 不关 dialog", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    authMocks.signUpWithEmail.mockResolvedValue({
      error: new Error("邮箱已被注册"),
    });

    render(
      wrap(<AuthDialog open={true} onOpenChange={onOpenChange} />),
    );
    await user.type(screen.getByPlaceholderText(/email/i), "alice@example.com");
    await user.type(screen.getByPlaceholderText(/密码|至少6位/i), "secret123");
    await user.click(screen.getByText("创建账号"));

    await waitFor(() => {
      expect(screen.getByText(/邮箱已被注册/)).toBeInTheDocument();
    });
    expect(onOpenChange).not.toHaveBeenCalledWith(false);
    expect(authMocks.notifyPurchaseCompleted).not.toHaveBeenCalled();
  });

  it("点 Google 按钮: 调用 signInWithGoogle 带 returnTo", async () => {
    const user = userEvent.setup();
    authMocks.signInWithGoogle.mockResolvedValue({ error: null });

    render(
      wrap(
        <AuthDialog open={true} onOpenChange={() => {}} postSlug="post-1" />,
      ),
    );
    await user.click(screen.getByText(/Google/));
    await waitFor(() =>
      expect(authMocks.signInWithGoogle).toHaveBeenCalledWith("/money-lab/post-1"),
    );
  });
});
