---
title: "Harper Deep Dive: The Open-Source Grammar Checker Automattic Bought to Challenge Grammarly"
description: "Harper is a free, open-source, fully local English grammar checker written in Rust, acquired by Automattic in late 2024. This report is double-verified against the official repo, the official site, and independent press coverage, analyzing its technology, business logic, and real limitations."
date: "2026-07-27"
author: "ERIC"
tags: ["Harper", "grammar checker", "open source", "Automattic", "Grammarly alternative", "privacy"]
categories: ["Review"]
keywords: ["Harper review", "Harper grammar checker", "open-source Grammarly alternative", "Automattic Harper", "local grammar checker"]
---

## 1. What Is Harper, in One Sentence

**Harper is a free, open-source English grammar checker that runs entirely on your own device — not a single byte of your writing ever leaves it.**

If you've used Grammarly, you might think of Harper as its "open-source alternative" — but that framing actually undersells it. Harper isn't trying to clone Grammarly. It's answering a more fundamental question: **does grammar checking really require sending your words to someone else's server?**

Key facts (all cross-verified against the official GitHub repo and the official site):

| Item | Detail |
|------|--------|
| Positioning | Local-first English grammar checker |
| Creator | Elijah Potter, now a Code Wrangler at Automattic |
| Name origin | A tribute to novelist Harper Lee (To Kill a Mockingbird) |
| Tech stack | Written in Rust; runs in the browser via WebAssembly |
| License | Apache-2.0, completely free |
| Ownership | Acquired by Automattic (the company behind WordPress.com) on Nov 21, 2024 |
| GitHub traction | ~13.4k stars, shipped actively (still releasing frequently in 2026) |
| Languages | English only (British, American, Canadian, Australian, Indian dialects) |

## 2. Origin: A Developer's Two-Front Frustration

Potter states plainly in the official README that he built Harper after years of putting up with the competition. His criticisms are worth preserving verbatim in spirit, because they hit structural weaknesses in both mainstream products.

**On Grammarly:**

1. **Too expensive, too overbearing** — pricey subscriptions, suggestions that ignore context and are "often just plain wrong";
2. **A privacy nightmare** — everything you write is sent to Grammarly's servers. The privacy policy says they don't sell your data, but that doesn't mean they don't use it to train large language models;
3. **Network latency kills flow** — every check is a network round-trip, making revision tedious.

**On LanguageTool:**

1. **A memory hog** — requires gigabytes of RAM and a ~16GB n-gram dataset download;
2. **Too slow** — several seconds to lint even a moderate-size document.

So Potter set himself three engineering constraints: lint in **milliseconds**, use **less than 1/50th of LanguageTool's memory**, and be **completely private**. Harper is what those constraints produced.

One detail worth noting: Harper's homepage claims "suggestions in under 10ms," while Automattic's acquisition announcement says "under 20 milliseconds — less than 1% of the time a certain popular online grammar tool takes." The numbers differ by framing, but the conclusion is the same: **local computation is at least two orders of magnitude faster than cloud round-trips.**

## 3. Core Principles: Why It's Fast and Private

### 3.1 No LLM — a deterministic rule engine

In an era when every product is bolting on an LLM, Harper made a counter-current decision: **its checks are entirely hand-written deterministic rules. No LLM in the loop, no telemetry, no cloud calls.**

Three direct payoffs:

- **Speed**: rule matching is pure local computation. Rust's performance plus a tiny memory footprint means feedback arrives faster than you can type;
- **Determinism**: the same input always yields the same output — no model "mood swings";
- **Size**: the whole engine is small enough to compile to WebAssembly and run inside a browser tab.

### 3.2 Rust + WebAssembly: write once, run everywhere

At the core sits `harper-core` (a Rust crate), with three product lines built on top:

- **harper-ls**: a language server. Any editor speaking the LSP protocol — VS Code, Neovim, Helix, Emacs, Zed, Sublime Text — is covered in one move;
- **harper.js**: the JavaScript/WebAssembly binding, powering the Obsidian plugin, the Chrome/Firefox extensions, and the WordPress plugin;
- **Native apps**: a desktop client (recent releases added Slack and Discord support).

The architectural cleverness here: **one rule set, near-infinite distribution channels.** Each new editor integration costs almost nothing. That's the protocol dividend — LSP was designed for code completion; Harper turned it into a distribution pipe for grammar checking.

### 3.3 It only checks the "human language" in your code

A developer-friendly touch: inside a code editor, Harper checks only comments, docstrings, and other natural-language regions — it won't nag you about variable names. Hence the "grammar checker for developers" label.

## 4. Double Verification: What We Cross-Checked

Every key claim in this article was confirmed by at least two independent sources:

| Claim | Source 1 | Source 2 |
|-------|----------|----------|
| Acquisition date & context | Automattic official announcement (2024-11-21) | TechCrunch report (2024-11-21) |
| Named after Harper Lee | Automattic announcement | WP Tavern report |
| <20ms response time | Automattic announcement | Official site (<10ms framing) |
| 1/50th of LanguageTool's memory | Author's README | WP Tavern quoting the author |
| Apache-2.0, free | Official site FAQ | GitHub repository |
| English only | Official site FAQ | GitHub README |
| Mixed hands-on review | It's FOSS review (2025-07) | User testimonials on official site |

## 5. Sharp Takes: Harper's Real Value — and What's Overrated

### Take 1: The moat isn't "free" — it's determinism

Many people file Harper under "free Grammarly." That misses the point. Its real differentiator is **architectural determinism**: running locally means privacy is not a policy promise but a physical fact — there is no channel for your text to leave the device. For lawyers, journalists, and anyone whose drafts cannot leak, "cannot leak" beats "promises not to leak" by an entire dimension. Grammarly's privacy rests on trust; Harper's rests on architecture — and architecture can't be revised by a policy update.

### Take 2: Automattic didn't buy a "Grammarly killer"

When the acquisition closed in November 2024, most coverage framed Harper as a Grammarly competitor. But watch what Automattic actually plans: integrating Harper into WordPress.com, WooCommerce, and Jetpack. **WordPress powers roughly 40% of the web** — Automattic isn't chasing Grammarly's subscribers; it's installing writing infrastructure into the entire WordPress ecosystem. Matt Mullenweg said it himself: "We're doing too much in the cloud right now, and there is so much compute and potential at the edge." Harper is a piece in his edge-computing layout, alongside Gutenberg and Playground.

In other words: **Grammarly runs a subscription business; Harper was bought to become a protocol layer.** Those are very different wars.

### Take 3: "No LLM" became a scarce asset

Looking back from 2026, Harper's most counterintuitive decision turned out to be its most valuable one. While every writing tool competes on model size, Harper proved another path: a huge class of grammar errors — spelling, capitalization, subject-verb agreement, fixed collocations — are **deterministic problems** that never needed a probabilistic model. Using an LLM for these is like delivering takeout by rocket: expensive, slow, and occasionally wrong-addressed. For this class of problems, a rule engine's cost-effectiveness and reliability won't be disrupted any time soon.

### Take 4: But don't mythologize it — the ceiling is just as visible

Objectively, Harper's weaknesses are as pronounced as its strengths:

1. **English only**, with the team explicitly focused on making English excellent before diversifying — multilingual support is nowhere on the horizon;
2. **Rule engines have a ceiling** — semantic understanding, style polishing, and tone adjustment are exactly where LLM-based tools win;
3. **False positives and false negatives coexist** — It's FOSS's hands-on title says it subtly: "I like it... well... kind of." Even with community contributors adding rules almost daily, coverage can't keep pace with the complexity of language itself;
4. **No clear commercialization path** — fully free under Apache-2.0, its continuity currently rides on Automattic's strategic patience.

To sum up: **Harper is the optimal answer for "good enough, trustworthy, zero-cost" — not the strongest answer overall.** It wins the privacy and speed battlegrounds, not the intelligence one.

## 6. Head-to-Head: Harper vs Grammarly vs LanguageTool

| Dimension | Harper | Grammarly | LanguageTool |
|-----------|--------|-----------|--------------|
| Price | Completely free | Limited free tier, pricey subscription | Free + paid |
| Data destination | Never leaves device | Cloud | Cloud (or self-hosted) |
| Check latency | <10–20ms | Seconds (incl. network) | Seconds |
| Memory footprint | Tiny | Heavy client | GBs + 16GB dataset |
| Intelligence | Rule engine, common errors | LLM-backed, strong comprehension | Rules + n-grams |
| Open source | Apache-2.0 | Proprietary | Core open-sourced |
| Languages | English only | English only | 30+ |
| Offline | Yes | No | Depends on deployment |
| Editor ecosystem | LSP everywhere + browser/Obsidian/WordPress | Mainstream plugins | Mainstream plugins |

## 7. Who Should Use Harper, and How to Start

**Recommended for:**

- Developers writing English docs, READMEs, and blogs (nearly zero-cost onboarding for VS Code/Neovim users);
- Heavy Obsidian users (official plugin works out of the box);
- Privacy-sensitive writers — contracts, medical notes, unpublished drafts belong nowhere near a cloud;
- Developers who want grammar checking inside their own product (integrate `harper.js` or `harper-core` directly).

**Not recommended for:**

- Anyone needing checks in Chinese or other non-English languages;
- Anyone expecting deep rewriting, polishing, or tone optimization — that's not its battleground.

**Getting started:** install the Chrome/Firefox extension; point your editor's LSP config at `harper-ls`; or search "Harper" in Obsidian's community plugin marketplace. No account required anywhere.

## 8. Overall Assessment

| Dimension | Score (/10) | Comment |
|-----------|:---:|---------|
| Privacy architecture | 10 | Data never leaves the device — privacy by physics |
| Performance | 9.5 | Millisecond latency, tiny footprint, superb engineering |
| Checking capability | 7 | Solid on common errors; complex semantics out of reach |
| Ecosystem integration | 9 | LSP + WASM distribution is nearly frictionless |
| Language coverage | 4 | English only, no multilingual timeline |
| Sustainability | 7.5 | Automattic backing helps, but no closed commercial loop |
| **Overall** | **8.0** | **Best-in-class for its niche — not an all-rounder** |

Harper proves something the industry half-forgot: **not every problem needs the cloud, a model, and a subscription.** Pushing engineering constraints to their limit is itself a product strategy. If your job is to "write correct English" rather than "write dazzling English," Harper is currently the best value on the planet — after all, with a tool that's free and doesn't sell your data, you don't become the product either.

## References

1. Official GitHub repo: github.com/Automattic/harper
2. Official site: writewithharper.com
3. Automattic acquisition announcement (2024-11-21)
4. TechCrunch: WordPress.com owner Automattic snaps up grammar checker Harper (2024-11-21)
5. WP Tavern: Automattic Acquires Harper; Founder Elijah Potter Joins the Team (2024-11-22)
6. It's FOSS: I Found a New Open Source Grammar Checker Tool (2025-07)
7. Matt Mullenweg's blog: Welcoming Harper (2024-11)
