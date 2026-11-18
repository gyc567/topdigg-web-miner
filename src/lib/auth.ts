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
import { db } from "./db.ts";
import { dodo as dodoPayments } from "./dodo.ts";

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
    // TODO(production): 邮件服务接入后改为 true，强制邮箱验证。
    // 当前开发期跳过验证，注册即可登录。
    requireEmailVerification: false,
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
