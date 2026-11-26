/**
 * Auth email templates (verification + password reset), localized.
 *
 * The locale is derived from the request's Accept-Language header, so a user
 * receives the mail in the language their browser is set to.
 */
import { sendEmail } from "./email";

type Locale = "zh-Hans" | "zh-Hant" | "en" | "ja" | "vi";

const COPY: Record<Locale, { verifySubject: string; verifyBody: (url: string) => string; resetSubject: string; resetBody: (url: string) => string }> = {
  "zh-Hans": {
    verifySubject: "验证你的邮箱 · TopDigg",
    verifyBody: (url) => `欢迎加入 TopDigg！\n\n请点击下面的链接验证你的邮箱（1 小时内有效）：\n${url}\n\n如果不是你本人注册，请忽略这封邮件。`,
    resetSubject: "重置你的密码 · TopDigg",
    resetBody: (url) => `我们收到了重置密码的请求。\n\n点击下面的链接设置新密码（1 小时内有效）：\n${url}\n\n如果不是你本人操作，请忽略这封邮件。`,
  },
  "zh-Hant": {
    verifySubject: "驗證你的郵箱 · TopDigg",
    verifyBody: (url) => `歡迎加入 TopDigg！\n\n點擊下面的連結驗證你的郵箱（1 小時內有效）：\n${url}\n\n如果不是你本人註冊，請忽略這封郵件。`,
    resetSubject: "重置你的密碼 · TopDigg",
    resetBody: (url) => `我們收到了重置密碼的請求。\n\n點擊下面的連結設定新密碼（1 小時內有效）：\n${url}\n\n如果不是你本人操作，請忽略這封郵件。`,
  },
  en: {
    verifySubject: "Verify your email · TopDigg",
    verifyBody: (url) => `Welcome to TopDigg!\n\nVerify your email with this link (valid for 1 hour):\n${url}\n\nIf you didn't sign up, you can ignore this email.`,
    resetSubject: "Reset your password · TopDigg",
    resetBody: (url) => `We received a request to reset your password.\n\nSet a new password with this link (valid for 1 hour):\n${url}\n\nIf this wasn't you, ignore this email.`,
  },
  ja: {
    verifySubject: "メールアドレスの確認 · TopDigg",
    verifyBody: (url) => `TopDigg へようこそ！\n\n以下のリンクでメールアドレスを確認してください（1時間有効）：\n${url}\n\nご自身でない場合は破棄してください。`,
    resetSubject: "パスワードの再設定 · TopDigg",
    resetBody: (url) => `パスワード再設定のご依頼を受け付けました。\n\n以下のリンクで新しいパスワードを設定してください（1時間有効）：\n${url}\n\nご自身でない場合は破棄してください。`,
  },
  vi: {
    verifySubject: "Xác minh email của bạn · TopDigg",
    verifyBody: (url) => `Chào mừng đến với TopDigg!\n\nXác minh email của bạn bằng liên kết này (có hiệu lực 1 giờ):\n${url}\n\nNếu bạn không tự đăng ký, hãy bỏ qua email này.`,
    resetSubject: "Đặt lại mật khẩu · TopDigg",
    resetBody: (url) => `Chúng tôi đã nhận được yêu cầu đặt lại mật khẩu.\n\nĐặt mật khẩu mới bằng liên kết này (có hiệu lực 1 giờ):\n${url}\n\nNếu không phải bạn, hãy bỏ qua email này.`,
  },
};

export function localeFromAcceptLanguage(header: string | null | undefined): Locale {
  if (!header) return "en";
  const lower = header.toLowerCase();
  if (lower.includes("zh-cn") || lower.includes("zh-hans") || lower.startsWith("zh")) return "zh-Hans";
  if (lower.includes("zh-tw") || lower.includes("zh-hk") || lower.includes("zh-hant")) return "zh-Hant";
  if (lower.includes("ja")) return "ja";
  if (lower.includes("vi")) return "vi";
  return "en";
}

function localeOf(request: unknown): Locale {
  const req = request as { headers?: { get?: (k: string) => string | null } } | undefined;
  return localeFromAcceptLanguage(req?.headers?.get?.("accept-language") ?? null);
}

export async function sendAuthVerificationEmail(
  data: { user: { email?: string | null; name?: string | null }; url: string },
  request?: unknown
): Promise<void> {
  const to = data.user.email;
  if (!to) {
    console.warn("[email] verification email skipped — user has no email address");
    return;
  }
  const copy = COPY[localeOf(request)];
  await sendEmail({
    to,
    subject: copy.verifySubject,
    text: copy.verifyBody(data.url),
  });
}

export async function sendAuthResetPasswordEmail(
  data: { user: { email?: string | null; name?: string | null }; url: string },
  request?: unknown
): Promise<void> {
  const to = data.user.email;
  if (!to) {
    console.warn("[email] password-reset email skipped — user has no email address");
    return;
  }
  const copy = COPY[localeOf(request)];
  await sendEmail({
    to,
    subject: copy.resetSubject,
    text: copy.resetBody(data.url),
  });
}
