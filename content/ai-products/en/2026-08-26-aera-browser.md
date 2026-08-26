---
title: "Aera Browser Deep Dive: The Browser That Works for You — How $20/Month Sells Your Busywork"
description: "Aera Browser is a local-first Chromium automation browser launched Dec 2025. Describe a recurring job in plain English and Aera runs it on a schedule in your signed-in browser. Stripe-verified $343 MRR / 9 subscriptions / ~1,700 users. This report dissects its monetization ladder, pricing tiers, design philosophy, and per-user monthly value."
date: "2026-08-26"
author: "ERIC"
tags: ["AI Product", "Browser Automation", "MCP", "Monetization", "SaaS", "Aera Browser", "Chromium", "Local-First"]
categories: ["AI Products"]
keywords: ["Aera Browser", "getaera.app", "browser automation", "MCP", "Chromium", "TrustMRR", "subscription", "local-first"]
product:
  name: "Aera Browser"
  url: "https://trustmrr.com/startup/aera-browser?ref=eric-kwok-b654e8"
  category: "AI Browser Automation"
  launch_date: "2025-12"
  revenue: "$343 MRR (2026-08, Stripe-verified) · $3,635 lifetime"
  users: "~1,700 users · 9 paid subscriptions"
  pricing_model: "Free (self-hosted model) + Pro $20/mo + Ultra $200/mo"
  logo: "https://files.stripe.com/links/MDB8YWNjdF8xU2ZScTlMaGhtZ1p0d1NofGZsX2xpdmVfSFRRMUwxYVFBOEtkRjBZT0c0czRCd3FN00eG4pLTYa"
pricing:
  - plan: "Free"
    price: 0
    currency: "USD"
    period: null
  - plan: "Pro"
    price: 20
    currency: "USD"
    period: "month"
  - plan: "Ultra"
    price: 200
    currency: "USD"
    period: "month"
metrics:
  - name: "MRR"
    value: "$343 (2026-08)"
  - name: "Last 30d Revenue"
    value: "$140"
  - name: "Lifetime Revenue"
    value: "$3,635"
  - name: "Active Subscriptions"
    value: "9"
  - name: "Total Users"
    value: "~1,700"
  - name: "Paid Conversion"
    value: "~0.5% (9/1700 est.)"
  - name: "Blended ARPU"
    value: "~$38/mo"
  - name: "Domain Rating"
    value: "9/100"
  - name: "TrustMRR Rank"
    value: "#2108"
  - name: "Founded"
    value: "2025-12"
  - name: "Founder"
    value: "Andrew Rivers (US)"
  - name: "Tech Stack"
    value: "Chromium + Node.js + PostgreSQL + Stripe + OpenRouter"
sources:
  - label: "TrustMRR public archive (with ref)"
    url: "https://trustmrr.com/startup/aera-browser?ref=eric-kwok-b654e8"
  - label: "TrustMRR AI-readable Markdown"
    url: "https://trustmrr.com/startup/aera-browser.md"
  - label: "Aera official site"
    url: "https://getaera.app"
  - label: "Aera pricing"
    url: "https://getaera.app/pricing"
  - label: "Aera features"
    url: "https://getaera.app/features"
  - label: "Aera use cases"
    url: "https://getaera.app/use-cases"
  - label: "Aera security & privacy"
    url: "https://getaera.app/security"
  - label: "Aera FAQ"
    url: "https://getaera.app/faq"
---

> **Product link**: [https://trustmrr.com/startup/aera-browser?ref=eric-kwok-b654e8](https://trustmrr.com/startup/aera-browser?ref=eric-kwok-b654e8) (with referral tracking — also at the end)

# Aera Browser Deep Dive: The Browser That Works for You — How $20/Month Sells Your Busywork

## 1. Introduction: The Browser Is the Last Moat

The AI automation space is crowded: ChatGPT Scheduled Tasks, Claude Computer Use, BrowserBase headless clouds, Puppeteer script farms. **Aera Browser**, launched Dec 2025, picked the dumbest and smartest path — **no headless cloud, no plugin, just a Chromium browser that works on a schedule**.

One-liner: *Aera is a browser that executes.* Describe one recurring job in plain English and Aera runs it on a schedule in your own signed-in browser: reading pages, pulling numbers, filling forms, reporting what changed. Wake up to finished work.

As of 2026-08-26 TrustMRR snapshot: **$343 MRR, 9 paid subscriptions, ~1,700 users, $3,635 lifetime, Domain Rating 9**. Small numbers, pure sample: one US indie hacker, Stripe-verified, Chromium base, MCP, local-first. A textbook **early micro-SaaS monetization slice**.

---

## 2. Project Overview

**Aera = Chromium real browser + plain-English scheduler + MCP connector + local-first storage.** Homepage tagline: *The browser that does the work.* TrustMRR tags: AI / Productivity / Utilities. Audience: Developers, AI enthusiasts, workflow power-users.

### Core Capabilities

| Capability | Description |
|---|---|
| **Plain-English automation** | Describe a task; agent clicks, types, navigates real pages |
| **Scheduling & recurring tasks** | One-click turn any request into a scheduled workflow with history & notifications |
| **MCP integration** | Connect to Cursor, Claude Desktop, Gemini CLI |
| **Subagents** | Parallelize multi-step work |
| **Vision** | Complex visual pages (paid tiers) |
| **Chrome import** | Bring password manager, ad blocker, bookmarks |
| **Local-first** | History/bookmarks/configs stay on your machine |

### Where It's Dependable (and Not)

- **Dependable**: reading, watching for changes, pulling numbers, triaging inbox, filling ordinary forms on a schedule.
- **Not dependable**: rich-text / code editors — the agent damaged content in testing; don't use for drafting docs or editing code.
- **One scoped routine > long cross-site chain**.
- **No autonomous checkout** — intentionally no payments.

---

## 3. Design Philosophy: 5 Principles

### 1. Local-first, but Honest About Inference

*Your data stays local. Inference does not — unless you self-host.* History, chats, tasks are local SQLite; paid inference goes via OpenRouter to Anthropic/OpenAI/Google; Free goes to your Ollama. The security page lists every exfiltration and admits **no SOC 2 / no ISO 27001** — engineering honesty as GTM.

### 2. Your Browser, Not a Bot Farm

Drives your real Chromium profile with your signed-in sessions. No headless fingerprint, lower ban risk, zero migration cost.

### 3. One Sentence > One Selector Set

Re-reads page semantics each run instead of replaying selectors — resilient to redesigns. Trade-off: non-deterministic; the site says "we won't tell you it never fails."

### 4. Scheduling Is First-Class

Describe → Schedule → History → Notify. Fail-fast with step-by-step logs you read instead of stack traces.

### 5. Open Standards, No Lock-in

Chromium + MCP + OpenAI-compatible endpoints. Free forces self-hosting to push upgrades; paid sells hosted frontier models.

---

## 4. Detailed Tutorial: 7 Steps to Your First Auto-Worker

### Step 0 — Prerequisites

Any OS that runs Chrome (4GB min, 8GB for heavy use). Free: install Ollama first. All plans need an Aera account.

### Step 1 — Download & Import

Download from `getaera.app/download` → Import from Chrome → sign in (device fingerprint for referral tracking).

### Step 2 — Configure Model

- Free: Settings → Models → `http://localhost:11434`
- Pro/Ultra: pick hosted models (GPT-4o, Claude 3.5, Gemini)

### Step 3 — First Task in 60 Seconds

Sidebar: "Every day at 9am pull Stripe's yesterday revenue, MRR, new subs into Google Sheet row 1" → Run → Make recurring.

### Step 4 — Schedule

Pick cadence, notifications, retries. Check Run History.

### Step 5 — Connect MCP

Enable MCP Server → add to Cursor / Claude Desktop config → trigger browser automation from your IDE.

### Step 6 — Skills Marketplace

Install community Skills or publish your own (counter increments; no browsing data uploaded).

### Step 7 — Operate

Fail-fast, read logs, use local model for sensitive pages, expect updates every few days.

---

## 5. How Aera Makes Money

| Plan | Price | Annual | What You Sell | Intent |
|---|---|---|---|---|
| **Free** | $0 | — | Self-hosted model, full features w/o hosted Vision | **Acquisition funnel** — let you feel "local model pain" |
| **Pro** | $20/mo | $220/yr ($18.33) | Hosted frontier + Vision + subagents + MCP | **Cash cow**, $20 developer sweet spot |
| **Ultra** | $200/mo | $2200/yr ($183) | Pro + 11x limits + long/concurrent runs | **Whale tier**, 10x price filters heavy users |

**5 Replicable Plays**: Free self-host as upgrade filter, $20 + $200 tiering, sell usage not seats (11x meter), subscription sells model not browser, MCP + Skills marketplace future take-rate.

---

## 6. Core User Analysis: How Much $ per User per Month?

| Tier | Users | $/user/mo | Total/mo | % MRR | Typical Job |
|---|---|---|---|---|---|
| **Free** | ~1,691 | $0 | $0 | 0% | Try demo then churn |
| **Pro $20** | 8 est. | $20 ($18.33 annual) | ~$160 | ~47% | Daily reports, social drafts |
| **Ultra $200** | 1 est. | $200 ($183 annual) | ~$183 | **~53%** | Always-on reporting + concurrency |

**Math**: $343/9 = ARPU $38. 8 Pro + 1 Ultra = ~$360 ≈ actual (with annual discounts). All-Pro would be only $180 → **at least one whale**.

| Rank | Tier | $/mo | $/yr | Time ROI ($50/h) |
|---|---|---|---|---|
| 🥇 | Ultra $200 | $200 | $2,200 | Saves 2h/day = $3k/mo, 15x ROI |
| 🥈 | Pro $20 | $20 | $220 | Saves 1h/day = $1.5k/mo, 75x ROI |

**LTV (24mo)**: Pro $480 / Ultra $4,800. Conversion 0.5% is the bottleneck — 2% would be $1,360 MRR (4x).

---

## 7. Insights: 7 Takeaways

1. **Browser is the last moat** — real logged-in Chromium is the only stable wall-passer.
2. **Sell the model, not the browser** — container free, intelligence paid (same as Cursor).
3. **Honesty is GTM** — list risks before pricing.
4. **0.5% conversion is both opportunity and alarm** — narrow Free Vision to push conversion.
5. **MCP is growth leverage** — embed in workflow, not ads.
6. **Ultra $200 is a filter** — price screens customers.
7. **$15M ask is emotional, not valuation** — 3644x ARR, a not-for-sale signal.

---

## 8. 6 Replicable Lessons

1. Browser free, model paid  2. Free must self-host  3. $20 anchor + $200 whale  4. First task succeeds in 60s  5. Logs are the product  6. MCP before ads

---

## 9. Risks

Stalled conversion, model cost swings, non-determinism, no compliance certs, solo-founder risk, big-tech squeeze.

---

## 10. Conclusion

Aera is an early but clean sample: 1 Chromium + 1 scheduler + 3 tiers + $343 MRR. Copy: **container free, intelligence paid; Free self-hosted; auditable logs; scheduling first-class**.

---

> **Product link**: [https://trustmrr.com/startup/aera-browser?ref=eric-kwok-b654e8](https://trustmrr.com/startup/aera-browser?ref=eric-kwok-b654e8)
>
> Sources: TrustMRR (Stripe-verified) + getaera.app (Pricing/Features/Use-Cases/Security/FAQ). Estimates marked.

*Snapshot 2026-08-26. Analysis is author's view, not investment advice.*
