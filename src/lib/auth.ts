/**
 * Better Auth instance — the single source of truth for authentication.
 *
 * Runs on the Node runtime (api/auth/[...all].ts) with a Postgres backend.
 * The @dodopayments/better-auth plugin wires Dodo in: automatic customer
 * creation on signup, authenticated checkout, and the customer portal.
 */
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { checkout, dodopayments, portal } from "@dodopayments/better-auth";
import { db } from "./db";
import { dodo as dodoPayments } from "./dodo";
import { sendAuthResetPasswordEmail, sendAuthVerificationEmail } from "./email-templates";

const baseURL = process.env.BETTER_AUTH_URL ?? "http://localhost:8080";

const trustedOrigins = [
  "http://localhost:8080",
  "http://127.0.0.1:8080",
  ...(process.env.BETTER_AUTH_TRUSTED_ORIGINS?.split(",").filter(Boolean) ?? []),
];

export const auth = betterAuth({
  baseURL,
  secret: process.env.BETTER_AUTH_SECRET,
  database: drizzleAdapter(db, { provider: "pg" }),
  emailAndPassword: {
    enabled: true,
    // 强制邮箱验证：默认关闭（开发期免验证）。打开后：
    //   - 生产：验证信经 Resend 送达
    //   - 开发：验证信落到 .dev-emails/，从文件里点链接即可完成验证
    requireEmailVerification: process.env.EMAIL_REQUIRE_VERIFICATION === "true",
    sendResetPassword: async (data, request) => {
      await sendAuthResetPasswordEmail(data, request);
    },
    resetPasswordTokenExpiresIn: 3600,
    minPasswordLength: 8,
    maxPasswordLength: 128,
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    expiresIn: 3600,
    sendVerificationEmail: async (data, request) => {
      await sendAuthVerificationEmail(data, request);
    },
  },
  trustedOrigins,
  plugins: [
    dodopayments({
      client: dodoPayments,
      createCustomerOnSignUp: true,
      getCustomerParams: (user) => ({ metadata: { better_auth_user_id: user.id } }),
      use: [
        checkout({
          products: [
            { slug: "monthly", productId: process.env.DODO_PRODUCT_MONTHLY ?? "" },
            { slug: "yearly", productId: process.env.DODO_PRODUCT_YEARLY ?? "" },
            { slug: "single", productId: process.env.DODO_PRODUCT_SINGLE ?? "" },
          ],
          successUrl: `${baseURL}/checkout`,
          authenticatedUsersOnly: true,
        }),
        portal(),
      ],
    }),
  ],
});

export type Session = typeof auth.$Infer.Session;
