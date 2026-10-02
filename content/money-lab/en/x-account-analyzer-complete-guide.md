---
title: "Twitter Account Reverse Analyzer: Crack Competitor Growth Logic"
date: "2026-10-02"
description: "Complete guide to x-account-analyzer skill: 6-step analysis, multi-source data matrix, content classification, follower growth attribution model and 30-day replication plan."
tags:
  - Twitter Growth
  - Account Analysis
  - Follower Strategy
  - AI Tools
  - Competitor Analysis
categories:
  - Skill Monetization
  - Tool Recommendations
---

# Twitter Account Reverse Analyzer: Crack Competitor Growth Logic

Give me a @handle, I'll give you a full-chain report on "why they grew followers + how you can replicate it."

That's what x-account-analyzer does.

From the great-skill-center project (github.com/gyc567/great-skill-center), by Huashu, AI Native indie developer, 300K+ follower account operator.

## 1. Overview: Reverse Engineering Growth

Most people's competitor analysis stays at the surface: "what does he post?"

x-account-analyzer thinks differently: not "what does he post" but "how did he grow followers" and "how can I replicate it?"

Core positioning: **Give me a @handle, get a full-chain analysis report.**

## 2. Core Features

### 2.1 Six-Step Analysis Flow

```
@handle input
      │
      ▼
[Step 1] Basic profile — twitter user + Exa + SuperX/SocialBlade
      │
[Step 2] Full tweet extraction — twitter user-posts + search + Exa
      │
[Step 2.5] Historical follower curve — fch (Wayback Machine)
      │
[Step 3] Content classification (AI-driven)
      │
[Step 4] Engagement data correlation
      │
[Step 5] Growth pattern + attribution
      │
[Step 6] Replicable experience extraction
      │
[Output] Complete analysis report
```

### 2.2 Multi-Source Data Matrix

| Source | Tool | Data | Required? |
|--------|------|------|-----------|
| Tweets + engagement | `twitter user-posts` | All tweets, likes/RTs/replies | ✅ |
| Basic profile | `twitter user` | Followers, bio, join date | ✅ |
| Historical growth | `fch` (Wayback Machine) | Historical follower snapshots | Strongly recommended |
| Tweet search | `twitter search --from` | Time/type filtered tweets | ✅ |
| Web-wide spread | `mcporter` → Exa | Widely-shared tweets | Recommended |
| Third-party data | `r.jina.ai` + SocialBlade | Engagement rates, trends | Recommended |

### 2.3 Content Classification (AI-Driven)

Each tweet tagged across dimensions:

**Content type**: Tech / Opinion / Personal story / Tutorial / Resource / Question / Hot take / Product / Daily / Humor / Data report / Long-form

**Tone**: Encouraging / Neutral / Controversial / Empathetic / Curious / Critical

**Engagement hook**: Question / Stance / Resource lure / Suspense / Emotion / Data shock

### 2.4 Growth Attribution Model

```
Growth drivers:
├── Content: high-engagement types, Thread vs short post efficiency, topic impact
├── Behavior: post frequency, reply frequency, posting time window
├── Relationship: big-V RTs, circle discussion frequency, quote/reply chains
├── Strategy: fixed content series, regular engagement activities, bio optimization
└── External: media coverage, cross-platform traffic, event-driven spikes
```

## 3. Tutorial

### 3.1 Environment Setup

```bash
# twitter-cli (core tweet extraction)
pipx install twitter-cli

# fch (historical follower tracking)
pipx install fch

# mcporter (Exa search)
npm i -g mcporter
```

### 3.2 Twitter Auth

```bash
twitter status
```

If not authenticated: install Cookie-Editor extension, copy `auth_token` + `ct0` from x.com cookies.

For China users:
```bash
export HTTP_PROXY=http://127.0.0.1:7890
export HTTPS_PROXY=http://127.0.0.1:7890
```

### 3.3 Full Analysis

```bash
twitter user HANDLE --json
twitter user-posts HANDLE -n 200 --json -o /tmp/tweets.json
fch --st=$(date -v-1y +%Y%m%d)000000 --et=$(date +%Y%m%d)000000 --freq=2592000 HANDLE
```

## 4. Design Philosophy: Reverse Engineering

Most operators ask competitors: "what does he post?"

Real growth hackers ask: "how did he grow followers, and can I replicate it?"

These are completely different questions with completely different answers.

> Growth = Content Strategy × Behavior Rhythm × Relationship Network × External Timing

x-account-analyzer breaks down these four variables and tells you which has the highest weight — and how to change yours.

Stop staring at competitor follower counts. Learn to dissect growth logic.

## Resources

- GitHub: github.com/gyc567/great-skill-center
- Skill: skills/x-account-analyzer
- Author's WeChat: 花叔 (300K+ followers)

*Originally published on WeChat Official Account.*
