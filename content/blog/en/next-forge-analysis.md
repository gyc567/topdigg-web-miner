---
title: "next-forge Deep Dive: Vercel's Production-Grade Next.js Monorepo Template"
description: "A complete analysis of next-forge, the production-grade Turborepo template for Next.js apps open-sourced by Vercel, purpose-built for shipping SaaS fast. From the five design principles — Fast, Cheap, Opinionated, Modern, Safe — to the apps/ + packages/ monorepo architecture, from Clerk auth, Stripe payments and Prisma database to 18+ shared packages including AI integration, this article covers everything: full tutorial, project breakdown, viewpoints, and the design philosophy behind the 7.5k-star template often called 'the best starting point for your next SaaS'."
date: "2026-08-03"
author: "TopDigg Research Team"
tags: ["next-forge", "Vercel", "Turborepo", "Next.js", "Monorepo", "SaaS", "Template", "Clerk", "Stripe", "Prisma", "Tailwind CSS", "shadcn/ui", "TypeScript"]
categories: ["Deep Dive"]
keywords: ["next-forge", "Vercel", "Turborepo", "Next.js template", "Monorepo", "SaaS template", "production-grade", "Clerk", "Stripe", "Prisma", "shadcn/ui", "Tailwind CSS 4", "React", "TypeScript", "developer experience"]
---

# next-forge Deep Dive: Vercel's Production-Grade Next.js Monorepo Template

> Core philosophy: **A production-grade SaaS foundation should not be a pile of parts you assemble one by one — it should be an opinionated, fully-integrated system where every piece works together naturally.** next-forge distills "ten years of web app development experience" into five principles — **Fast, Cheap, Opinionated, Modern, Safe** — so developers can focus on their business logic instead of rebuilding auth, payments, and databases over and over.

---

## 1. Project Overview

### 1.1 What Is It?

**next-forge** is an open-source project maintained by **Vercel**, self-described as a "**Production-grade Turborepo template for Next.js apps**." Its single purpose: **let you skip the "build infrastructure from scratch" phase of a SaaS project and start writing business code on a complete, deployable, full-stack skeleton.**

Key facts:

- Repository: `https://github.com/vercel/next-forge`
- Organization: **Vercel** (official)
- Stars: **7.5k+**, Forks: 686
- Language: TypeScript
- License: MIT
- Version: v6.0.2 (March 2026)
- Created: January 2023

It is not an interactive CLI wizard like create-t3-app — it's a **template repository you clone and copy directly**. Clone it, install dependencies, fill in environment variables, and you have a complete SaaS skeleton with a marketing site, main app, API, docs, email, and a component library.

### 1.2 What Problem Does It Solve?

Anyone who has built a SaaS knows the list: **auth, database, payments, email, analytics, monitoring, rate limiting, webhooks, SEO, internationalization…** Each one individually takes days to set up properly — and is easy to set up badly.

next-forge's answer: **integrate all of it, verify it works end-to-end, and ship it as a template.** It ships with 6 apps and 18+ shared packages covering nearly all the infrastructure a modern SaaS needs.

### 1.3 Official Demos

- **Web** (marketing site): https://demo.next-forge.com
- **App** (main application): https://app.demo.next-forge.com
- **Storybook** (component library): https://storybook.demo.next-forge.com
- **API** (health check): https://api.demo.next-forge.com/health

---

## 2. Core Philosophy: The Five Design Principles

Every design decision in next-forge revolves around five principles. Understand these five, and you understand the whole project.

### 2.1 Fast

"Build fast, run fast, deploy fast, iterate fast" runs through everything:

- **Turborepo** for task orchestration and build caching;
- **Bun** as the default package manager (much faster than npm/yarn);
- Every app is independently deployable — nothing blocks anything else.

### 2.2 Cheap

"Start free, scale on demand":

- The early stages run almost entirely on free tiers: Neon database free tier, Clerk free tier, Vercel Hobby plan;
- The architecture lets you "use the free stuff first, upgrade when you grow" — no pressure to spend big from day one.

### 2.3 Opinionated

This is the most important one: **next-forge does not pretend to be "neutral" — it makes the choices for you, explicitly.** Auth is Clerk, database is Prisma + Neon, payments is Stripe, UI is Tailwind + shadcn/ui — **the chosen pieces are designed to work together natively**, instead of giving you a menu of options to agonize over.

### 2.4 Modern

Only the **latest stable** technology:

- Next.js App Router (not the legacy Pages Router);
- Tailwind CSS 4;
- React 19;
- End-to-end type safety with TypeScript.

### 2.5 Safe

Security by default:

- **End-to-end type safety** (TypeScript across the whole stack);
- Arcjet WAF application security;
- Nosecone security headers;
- Rate limiting (Upstash Redis).

> In one sentence: **these five principles are not slogans — they are a "selection filter."** Any technology that violates "fast, cheap, opinionated, modern, safe" does not make it into the template.

---

## 3. Technical Architecture: The apps/ + packages/ Monorepo

next-forge uses a Turborepo-managed monorepo, split into two layers: deployable apps and shared packages.

### 3.1 Apps (Deployable)

- **web** (port 3001) — marketing site: Tailwind CSS + shadcn/ui + docs
- **app** (port 3000) — main app: Next.js App Router, Clerk auth, Prisma database, collaboration features
- **api** (port 3002) — REST API: Stripe webhooks, health checks, monitoring
- **docs** (port 3003) — documentation site: Fumadocs (MDX), AI chat, RSS
- **email** (port 3004) — email templates: React Email + Resend
- **storybook** (port 3005) — component development: Storybook + shadcn/ui

Every app is **independent, self-contained, and individually deployable** — the core idea of a monorepo: share code, but never block each other's deploys.

### 3.2 Packages (Shared)

- **@repo/auth** — authentication: Clerk
- **@repo/database** — database: Prisma + Neon + Zod
- **@repo/design-system** — design system: Radix UI + Tailwind CSS 4 + shadcn/ui (new-york style)
- **@repo/payments** — payments: Stripe subscription management
- **@repo/email** — transactional email: Resend + React Email
- **@repo/analytics** — analytics: Vercel Analytics + PostHog
- **@repo/observability** — observability: Sentry + Logtail (BetterStack)
- **@repo/security** — security: Arcjet + Nosecone
- **@repo/rate-limit** — rate limiting: Upstash Redis + Ratelimit
- **@repo/feature-flags** — feature flags: Vercel Toolbar + Flags SDK
- **@repo/webhooks** — webhooks: Svix (inbound/outbound)
- **@repo/ai** — AI integration: AI SDK + OpenAI
- **@repo/cms** — content management: BaseHub (type-safe)
- **@repo/seo** — SEO: Metadata + JSON-LD + Sitemap
- **@repo/storage** — storage: file upload and management
- **@repo/notifications** — notifications: in-app notifications
- **@repo/collaboration** — collaboration: live cursors + avatars
- **@repo/internationalization** — i18n: Languine
- **@repo/next-config** — shared Next.js config
- **@repo/typescript-config** — shared TS config

### 3.3 Package Dependencies

- `@repo/design-system` depends on `@repo/auth`, `@repo/observability`;
- `@repo/feature-flags` depends on `@repo/analytics`, `@repo/auth`, `@repo/design-system`;
- `@repo/database` depends on Prisma, Neon, Zod.

This "packages referencing packages" design lets shared code be **written once, used everywhere**, while keeping each app independent.

### 3.4 Toolchain at a Glance

- **Package manager**: Bun (engine requires bun@1.3.10)
- **Monorepo**: Turborepo 2.8
- **Bundler**: tsup
- **Code quality**: Biome + Ultracite
- **Testing**: Vitest
- **Styling**: Tailwind CSS 4 + PostCSS

---

## 4. Design Philosophy: Why These Choices?

### 4.1 Why Turborepo?

Because **Turborepo is Vercel's own product** — and this is not "home-team favoritism," it's genuinely native integration:

- Remote Caching works seamlessly with Vercel;
- Task pipelines (`^build` dependency orchestration, automatic);
- Incremental builds — change one package, only rebuild the affected apps.

### 4.2 Why Bun Instead of npm/yarn/pnpm?

- Bun is **one of the fastest JS runtimes/package managers today** — cold start and install speed far exceed npm;
- The root `package.json` declares `packageManager: "bun@1.3.10"`, and all dev scripts default to Bun;
- npm/pnpm remain compatible, but "fast by default" is the stance.

### 4.3 Why Clerk Instead of NextAuth?

- **Multi-tenancy (Organizations) out of the box** — org management is a hard requirement for SaaS products;
- Webhook-based user sync (`CLERK_WEBHOOK_SECRET` in `packages/auth/keys.ts`);
- Compared to self-hosted NextAuth, Clerk is far less work for an "out-of-the-box" SaaS.

### 4.4 Why REST Instead of tRPC?

A deliberately interesting choice: **next-forge explicitly avoids tRPC and uses REST.** Reasons:

- **Broader ecosystem compatibility** — REST is a universal standard any client can consume;
- `@repo/payments` and `@repo/webhooks` are REST-style;
- For a "template," REST's universality outweighs tRPC's type convenience.

### 4.5 Deployment Philosophy: Single Project or Multiple?

next-forge supports both:

- **A single Vercel project**: best for a fast start;
- **Multiple Vercel projects**: each `apps/*` deploys independently — this is the real value of the monorepo.

---

## 5. Full Tutorial: Getting Started with next-forge

### 5.1 Step One: Initialize the Project

```bash
# Option A: official init command
npx next-forge@latest init

# Option B: clone directly
git clone https://github.com/vercel/next-forge.git my-saas
cd my-saas
bun install
```

Prerequisites:

- Node.js 20+
- Bun (or npm/yarn/pnpm)
- Stripe CLI (for testing webhooks locally)

### 5.2 Step Two: Configure Environment Variables

Every package ships a `.env.example` — just fill it in:

```bash
# packages/auth/.env.example
CLERK_SECRET_KEY=sk_...
CLERK_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...

# packages/database/.env.example
DATABASE_URL=postgresql://...

# packages/rate-limit/.env.example
UPSTASH_REDIS_REST_URL=...
UPSTASH_REDIS_REST_TOKEN=...

# packages/payments/.env.example
STRIPE_SECRET_KEY=sk_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

Service accounts to register: Clerk, Stripe, Resend, Neon, Upstash, Sentry, PostHog, Arcjet, etc. (depending on which modules you actually use).

### 5.3 Step Three: Initialize the Database

```bash
# Format + generate + migrate the dev database
bun run migrate

# Or skip migrations and push the schema directly
bun run db:push
```

### 5.4 Step Four: Daily Development Commands

```bash
bun run dev                    # run all apps via turbo
bun run dev --filter=web       # run only the marketing site
bun run build                  # production build
bun run test                   # run all tests
bun run check                  # Ultracite code check
```

### 5.5 Step Five: Deploy to Vercel

Each app is its own Vercel project:

```bash
vercel --prod --token=xxx apps/web
vercel --prod --token=xxx apps/app
vercel --prod --token=xxx apps/api
```

Or use Vercel's monorepo auto-detection and connect them one by one in the dashboard.

### 5.6 Step Six: Add a New Package

```bash
cd packages
mkdir my-package && cd my-package
bun init -y
```

- Name it `@repo/my-package` in `packages/my-package/package.json`;
- Register it in the workspaces of the root `package.json`;
- `import { x } from "@repo/my-package"` in any app that needs it.

---

## 6. Feature Checklist: Out of the Box

- **Auth**: full Clerk authentication + multi-tenant organization management
- **Payments**: complete Stripe subscription lifecycle (create, update, cancel, webhooks)
- **Database**: Prisma ORM + Neon Serverless PostgreSQL + migrations
- **UI**: shadcn/ui (new-york) + Radix + dark mode + Geist font
- **Email**: React Email templates + Resend delivery
- **Analytics**: Vercel Analytics + PostHog (web and product analytics)
- **Observability**: Sentry error tracking + Logtail logs + BetterStack monitoring
- **Security**: Arcjet WAF + Nosecone security headers + rate limiting
- **Feature flags**: Vercel Toolbar + Flags SDK (user-based evaluation)
- **Webhooks**: Svix inbound/outbound management
- **AI**: AI SDK streaming + OpenAI integration
- **CMS**: BaseHub type-safe content management
- **SEO**: Metadata + JSON-LD + Sitemap
- **Internationalization**: Languine multi-language dictionaries
- **Collaboration**: live cursors + presence avatars
- **Storage**: file upload management
- **Notifications**: in-app notification system
- **Scheduled jobs**: Vercel Cron (with Sentry monitoring)

---

## 7. Summary: Viewpoints and Conclusions

### 7.1 Core Viewpoints

1. **The value of a "production-grade template" is making tacit knowledge explicit.** next-forge's biggest contribution is not any single feature — it's delivering a decade of web-app selection experience, directory structure, and engineering standards to newcomers in one package — **this is knowledge reuse, not just code reuse.**
2. **"Opinionated" is the template's core competitive advantage.** A neutral template is no template at all (you still have to agonize over choices); next-forge decides for you so you can "clone and run" — **fewer choices to make means zero decision cost.**
3. **Monorepo is the right way to build a SaaS.** Shared code + independent deploys let the marketing site, main app, API, docs, and email evolve in one codebase without blocking each other — **this is the most important lesson Turborepo passes to the next generation of scaffolds.**
4. **Type safety is the first layer of the "Safe" principle.** From database (Prisma + Zod) to UI (shadcn/ui) to config (shared tsconfig), end-to-end TypeScript dramatically reduces the traditional fear of "change one place, break everything."

### 7.2 Who It's NOT For (An Honest Boundary)

- **Minimalists**: 19+ packages is over-engineering for a simple project;
- **People who want full control over every choice**: next-forge's "opinionated" stance is a constraint for you;
- **Small tools that don't need SaaS multi-tenancy**: the Clerk + Stripe + Neon combination is too heavy.

### 7.3 Takeaways for Developers

- Look at next-forge before building a SaaS — **even if you don't use it directly, its package layout is an excellent architecture reference**;
- The "free first, scale later" architecture mindset is worth learning — **not everything needs enterprise-grade config on day one**;
- The confidence from end-to-end type safety will noticeably speed up your iteration.

### 7.4 Conclusion

In the crowded "Next.js scaffold" space, next-forge's differentiator is that **it is not another hello-world template — it is a complete, deployable, production-minded SaaS skeleton.** It does all the things "every product needs but nobody enjoys building," so you write real business code from day one.

For any team about to launch its next SaaS, this may be the most accurate verdict: **"This is not a template — it's a proven starting point."**

---

## References

- next-forge official repository: https://github.com/vercel/next-forge
- Official docs: https://www.next-forge.com/docs
- Official demo (Web): https://demo.next-forge.com
- Official demo (App): https://app.demo.next-forge.com
- Turborepo website: https://turborepo.com
- Clerk website: https://clerk.com
- Stripe website: https://stripe.com
