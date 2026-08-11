---
title: 'Promptless ''Writing code was hard, actually'' Deep Dive: When ''Coding Was Never the Hard Part'' Becomes the Hot Take, Time to Settle the Account — Market, Machine, and Engineer'
description: 'Using Promptless''s engineering blog post ''Writing code was hard, actually'' as the spine, this article dissects how a 900-word short piece rebuts the viral 2025-2026 narrative that ''writing code was never the hard part.'' It walks through: (1) project overview — what Promptless is and why this short piece is worth a deep read; (2) detailed tutorial — four evidence lines (timing, machine, market, engineer) + one honest concession (''this skill is becoming less scarce'' ≠ ''this skill was never impressive'') + one engineering warning (''engineers built the tool being used to call them trivial''); (3) synthesized insights — the article separates ''AI makes code cheaper'' from ''code was always easy''; (4) design philosophy — three postures toward scarcity narratives, historical respect, and engineering identity. Core claim: don''t rewrite ''a skill is becoming cheaper'' as ''a skill was always trivial'' — the former is an honest market assessment, the latter is rewriting history. This short piece offers the cleanest argumentation template for any ''does AI replace / not replace X'' debate.'
date: "2026-08-10"
author: "TopDigg Research Team"
tags: ["Promptless", "writing-code", "AI Engineering", "Software Engineering", "AI Agents", "Engineering Culture", "AI Hype", "Code Generation", "Engineering Identity", "Career"]
categories: ["Deep Dive"]
keywords: ["Promptless", "writing code was hard", "AI replaces programmers", "engineering narrative", "AI hype", "LLM training cost", "software engineer salary", "engineering identity", "AI-era career", "AI tools", "engineering culture"]
---

# Promptless "Writing code was hard, actually" Deep Dive: When "Coding Was Never the Hard Part" Becomes the Hot Take, Time to Settle the Account — Market, Machine, and Engineer

> Core idea: **"Writing code was never the hard part" is a convenient revisionism that gets invented at exactly the moment AI makes code nearly free. Promptless's engineering blog post 'Writing code was hard, actually' dismantles it with four evidence lines — timing (nobody said it in 2018, when the requirements problem already existed), machine (billions of dollars + gigawatts + purpose-built supercomputers to *partially* automate a 'trivial' thing), market (30 years of climbing software engineer salaries — either the market was collectively irrational for three decades, or writing code was hard), and engineer (the people who built LLMs *are* software engineers — they used the skill to partially automate the skill).** The sharpest move, though, is the concession inside the rebuttal: "this skill is becoming less scarce" — just don't rewrite it as "this skill was never impressive." One is an honest market assessment; the other is rewriting history. **It offers the cleanest argumentation template for any "does AI replace / not replace X" debate: ask "is the machine expensive?" then "how long has the market judged?" then "who built the machine?" — three questions and the narrative can't stand.**

---

## 1. Project Overview

### 1.1 What Is It?

This article analyzes a short piece on **Promptless**'s engineering blog titled **"Writing code was hard, actually"**.

What Promptless does: an AI tool that automatically updates your customer-facing docs as you ship features and support customers. Their engineering blog is in the genre of "engineering narrative + documentation craft" — short, opinionated, no waffling. This piece is a typical sample.

The article is about 900 words in English, but the structure is immaculate:

1. **Phenomenon**: every few days, someone posts "writing code was never the hard part"
2. **Unmask**: this narrative is "convenient revisionism"
3. **Four evidence lines**: timing, machine, market, engineer
4. **Concession**: there's one true thing inside it — "this skill is becoming less scarce" (not "was never impressive")
5. **Coda**: engineers built this machine — they're not the replaced; they're the ones best placed to answer "what comes next"

### 1.2 One-Line Positioning

> **A 900-word engineering-culture short piece rebutting the viral narrative that "writing code was never the hard part," using three evidence lines (machine, market, engineer) and one distinction between "skill becoming cheaper" and "skill was always trivial."**

### 1.3 Key Facts

- **Source**: Promptless engineering blog ([promptless.ai/blog/technical/writing-code-was-hard-actually](https://promptless.ai/blog/technical/writing-code-was-hard-actually))
- **Category**: engineering culture / Technical
- **Author**: Promptless team (no individual byline)
- **Format**: single-page short piece, no charts, no code, no product pitch — **pure opinion**
- **Core act**: rebuttal of the viral "writing code was never the hard part" narrative
- **Companion pieces** (same site): [Docs Site Search Optimization](https://promptless.ai/blog/technical/docs-site-search-optimization), [Developer Relations Docs](https://promptless.ai/blog/technical/developer-relations-docs), [Developer Relations Docs Have a New Primary Reader](https://promptless.ai/blog/technical/developer-relations-docs-agent-primary-reader)
- **Related product**: Promptless's main product is an automated documentation updater; this post has no direct product tie-in — it's engineering-culture commentary

### 1.4 The Problem It Solves

Throughout 2025-2026, X / LinkedIn / industry newsletters have been cycling through variations of:

> "Engineers describe changes in plain English, Claude Code writes the code."
> "Non-technical people build real products without touching a line of code."
> "Writing code was never the hard part — understanding requirements, designing systems, and communicating with stakeholders are."

**This narrative is doing one very specific thing: it takes a skill that's been partially automated, and re-frames it from "used to be hard but got solved" to "was never hard to begin with" — which makes "AI replaces programmers" look inevitable, long-overdue, and nobody's fault.**

What this 900-word piece does is: **don't accept the rewrite.** Push back with evidence.

---

## 2. Detailed Tutorial: Four Evidence Lines + One Honest Concession + One Engineering Warning

The post doesn't give you "code" — it gives you "argumentation." This section unpacks its argumentative structure, each piece with recognizable evidence, reusable rebuttal templates, and real-world analogies.

### 2.1 Evidence 1: Timing Exposes the Narrative

**Original argument**:

> "If writing code was never the hard part, someone should have been saying this in 2018. The requirements problem existed then. System design existed then. But nobody was writing blog posts about how coding was a trivial formality, because it obviously wasn't."

**Structure of this evidence**:

- **If X is true, X should have been said before X's moment** (time-reversal proof)
- In 2018, the requirements problem, system design, stakeholder communication — all those problems already existed
- But **nobody back then was writing "writing code was never the hard part"** — because obviously it wasn't
- The narrative appears at the exact moment AI makes code cheap — **so it's a product of the AI moment, not engineering truth**

**Reusable rebuttal template**:

> "If the 'X has always been this way' you're claiming was unsaid in 2018, then it wasn't 'always this way' — it was invented recently to support a new position."

**Analogies**:

- In 2010 nobody said "flying a plane was never the hard part" — that wasn't true then. After AI-driven autonomy appeared, people started saying "flying a plane was always just rule-matching"
- In 2015 nobody said "translation was never the hard part" — that wasn't true then. After neural machine translation crossed a quality bar (2016-2017), "translation was always just language conversion" appeared as a hot take

### 2.2 Evidence 2: The Machine Is the Proof

**Original argument**:

> "If writing code were easy, you would not need the machine. You don't spend billions of dollars training a model on purpose-built supercomputers to automate something trivial."

**Structure**:

- **The existence of a tool is the counter-evidence to the task's triviality** — humans build tools for what they can't or can't easily do
- LLM training: billions of dollars, purpose-built supercomputers, gigawatts of power, decades of algorithmic research — all to *partially* automate code generation
- A task that absorbs this scale of resources **is not "never the hard part"**

**The piece uses a killer counter-question**:

> "Can you describe the chip architecture, power delivery, and network topology required to run the coding tool you're using to declare that coding was never hard?"

The machine that makes coding *look* easy is itself a miracle of engineering that almost nobody on Earth fully understands end to end. The very machine that creates the appearance of "easiness" is the proof that the underlying task is hard.

**Reusable rebuttal template**:

> "If it were really easy, you wouldn't need a machine this expensive to partially automate it."

**Analogies**:

- Robotic welding of car frames — we don't say "welding was never the hard part"; we say welding engineers solved a hard problem
- Writing-assistance AI — we don't say "writing was never the hard part"; we say writers solved a hard problem
- The selective use of the "never the hard part" rhetoric is conditional on **whether you are the person being automated**

### 2.3 Evidence 3: The Market Wasn't Confused for Thirty Years

**Original argument**:

> "For thirty years, companies fought over software engineers. Salaries climbed steadily. Entire recruiting industries existed just to find people who could do the job. Was the market wrong this entire time? The 'never the hard part' crowd has to pick one: either the labor market was wildly irrational for three decades, or writing software was in fact hard."

**Structure**:

- Markets aggregate all information — **they don't lie for thirty years**
- Software engineer salaries climbed steadily for thirty years, dedicated headhunting industries exist, visa policy tilts toward technical workers — all of this says "the people who write code are doing something valuable"
- The "never the hard part" crowd must pick one: **the market was wrong for three decades, or writing code was actually hard**
- The market was clearly not wrong

**Reusable rebuttal template**:

> "In the face of 30 years of salary data, your 'never the hard part' must explain why headhunting firms, visa policy, and compensation curves all went the other direction."

**Analogies**:

- Surgeons earn high pay / law partners earn high pay / senior traders earn high pay — the market's price is consistent with "hard things"
- If "writing code was never the hard part" holds, then everyone who paid software engineers a premium for three decades — boards, HR, headhunters, immigration officers — was wrong

### 2.4 Evidence 4: The Engineers Built the Tool That "Replaces" Them

**Original argument**:

> "It's not like a bunch of outsiders looked over at software engineers and thought, 'those lazy bastards soaking up all that pay for easy work—let's build AI to expose them.' Coal miners did not do this. Management consultants did not do this. The people who built LLMs are software engineers. Researchers who write code. Infrastructure teams who write code. ML engineers who write code. They spent their careers mastering the skill, and then used that mastery to partially automate it."

**Structure**:

- The people who wrote the LLMs **are** software engineers — they spent thirty years mastering "writing code," then used that mastery to **partially automate** it
- This isn't "outsiders looking at insiders and resenting their pay" — **it's insiders using their own skill to build a new tool**
- Same as a robotics engineer who builds a robot that welds — **nobody says "welding was never the hard part"**

**Reusable rebuttal template**:

> "The people who built the tool are the very people who were supposedly doing 'easy work' — either admit that building the tool requires mastering the 'easy work,' or admit the work was never easy."

**Analogies**:

- Welding engineers build welding robots — **never reframed as "welding was always trivial"**
- Translators build translation tools — **never reframed as "translation was always trivial"**
- The only difference: engineers **don't have unions** or **visible professional shields** — so the "was always trivial" rhetoric flows unimpeded

### 2.5 The Honest Concession: One True Thing Inside

After the rebuttal, the piece **voluntarily concedes a portion of the truth**:

> "The economic value of writing code, in isolation, is declining. AI tools are making it cheaper and faster to produce working software. The mix of skills that makes an engineer valuable is shifting. Those are true, defensible claims."

**What it concedes**:

- The economic value of "writing code" *as a single skill* is declining
- AI makes "producing working software" cheaper and faster
- The mix of skills that makes an engineer valuable **is shifting** — coding's share is changing, other skills are rising

**That's the honest part.**

But the piece immediately separates this from another claim:

> "But that's not what people are saying. They're reaching backward in time to retroactively trivialize the skill. There's an enormous difference between 'this skill is becoming less scarce' and 'this skill was never impressive.' One is an honest market assessment. The other is rewriting history."

**The sharpest cut in the piece**:

- "This skill is becoming less scarce" — **honest market assessment** ✓
- "This skill was never impressive" — **rewriting history** ✗

**These are fundamentally different — wrapping the latter in the former is revisionism.**

**Reusable cognitive frame**:

> "Trend ≠ rewrite." "AI makes X cheaper" is a trend; "X was always easy" is a rewrite.

### 2.6 The Engineering Warning: Engineers Built the Machine

**The closing**:

> "But as we adapt, it's worth remembering who made the machine. Not the executives. Not the thought leaders. Engineers made it. The same people now being called trivial built the tool being used to call them trivial. That should give everyone pause."

> "The engineers who built the modern digital world aren't suddenly less capable because their hardest problem got automated. If anything, they're the ones best positioned to tackle what comes next. They've already proven they can do hard things. Now they have better tools."

**The posture of this section**:

- Not sentimental; not "engineers are undervalued"
- It's stating facts + offering a falsifiable prediction
- **Fact**: the people who built LLMs, who built supercomputers, who wrote distributed training code — are software engineers
- **Prediction**: this group is the most capable of answering "what comes next in the AI era"
- **Not comfort. Restoration of place.**

### 2.7 One-Sentence Summary

> **"A skill is becoming cheaper" ≠ "a skill was always trivial."** Promptless takes 900 words to make that distinction clear. The method is simple: ask three questions — is the machine expensive? how long has the market judged? who built the machine? — and "was always trivial" can't stand.

---

## 3. Synthesized Insights: 5 Core Judgments from 900 Words

Collapsing the post's core argument, here are five judgments about engineering narrative.

### 3.1 Insight 1: Convenient Revisionism Is the Hardest Narrative to Beat, Because It's Not Wrong — It's "Partially Right"

**Core**:

> "It is convenient revisionism, because it arrives at exactly the moment that AI tools are making code free to produce, and it flatters exactly the people who never wrote any."

**Unfolding**:

- "Writing code was never the hard part" isn't completely wrong — it's laced with the truth that "AI makes code cheaper"
- But **it rewrites "becoming cheaper now" as "always trivial"** — that's the rhetorical move
- This rhetoric is hard to rebut because rebutters must first concede part of the truth, then say "but not the part you're implying" — **the psychological bar is high**

**Conclusion**:

- Rebutting this kind of narrative doesn't start from "completely wrong" — **start from "partially right"**: "what you said first is right, but the last part isn't"
- Revisionism is "convenient" because **its "right part" primes the reader** — you feel rude rebutting the right part, so you swallow the wrong part too

### 3.2 Insight 2: The Existence of a Tool Is Itself Counter-Evidence to the Triviality of a Task

**Core**:

> "If writing code were easy, you would not need the machine."

**Unfolding**:

- Humans build tools for what they can't do well
- LLMs aren't "magic" — they're built on **billions of dollars, purpose-built supercomputers, gigawatts of power, decades of algorithmic research**
- That scale of resources is committed **only to partial automation** — because full automation is impossible
- The tool that makes "writing code look easy" **is itself a miracle of engineering** — the machine that creates "easiness" is the proof that the underlying task is hard

**Conclusion**:

- To assess whether a skill was "always trivial" — **first look at the resources committed to it**
- More resources → harder task
- Conversely: the "lightness" of AI automation ≠ the "lightness" of the original task — automation just makes "light" look easy

### 3.3 Insight 3: Thirty Years of Salary Data Is More Convincing Than Any Blog Post

**Core**:

> "Was the market wrong this entire time?"

**Unfolding**:

- Markets aggregate all information — **they don't lie for thirty years**
- Software engineer salaries climbed steadily for thirty years — this spans multiple economic cycles, multiple countries, multiple sub-disciplines
- The "never the hard part" crowd must explain: **why has the market been wrong for thirty consecutive years?**
- The only consistent explanation: writing code was hard

**Conclusion**:

- When a narrative contradicts thirty years of market data — **suspect the narrative first**
- Revisionism's trademark: "fast and reasonable" — but it requires a **counterfactual assumption** ("the market is stupid") to hold
- Evaluating any "X was always trivial" claim — **check the thirty-year salary curve**

### 3.4 Insight 4: "A Skill Is Becoming Less Scarce" and "A Skill Was Always Trivial" Are Fundamentally Different Things

**Core**:

> "There's an enormous difference between 'this skill is becoming less scarce' and 'this skill was never impressive.' One is an honest market assessment. The other is rewriting history."

**Unfolding**:

- Trend judgment vs. historical rewrite — **two completely different things**
- "AI makes writing code cheaper" — **a phenomenon that began in 2023** (post-GPT-4)
- "Writing code was never the hard part" — **a position that didn't exist in 2018**
- **Disguising "now less scarce" as "always trivial" is a time-dimension sleight-of-hand**

**Conclusion**:

- Distinguish "judgments about the future" from "judgments about the past" — **don't let a future judgment rewrite the past**
- Revisionism's standard operation: use the "X is now X" framing to make people think "X has always been X" — but the former is observation, the latter is assertion
- Any honest framing of "X is becoming cheaper" **does not need the "X has always been trivial" tail** — adding that tail is revisionism

### 3.5 Insight 5: Whoever Built the Machine Is Best Placed to Answer "What Comes Next"

**Core**:

> "The engineers who built the modern digital world aren't suddenly less capable because their hardest problem got automated. If anything, they're the ones best positioned to tackle what comes next."

**Unfolding**:

- Not comfort, restoration of place
- The people who wrote LLMs **are** software engineers
- They have **thirty years of engineering experience** — only "coding" was partially automated; other capabilities (system design, requirement understanding, cross-team communication, machine understanding) **were not**
- This group is most capable of **judging "what's worth doing in the AI era"** — because they understand the machine

**Conclusion**:

- Evaluating "who gets replaced in the AI era" — **don't look at the skill list, look at the skill-holder**
- Software engineers **won't** be replaced because "coding was partially automated" — because their **whole professional identity** was never "coding," it was "solving hard problems with engineering methods"
- What gets replaced is **single-skill work roles** (people who only code without understanding the system) — **not the engineering profession**

### 3.6 How the 5 Insights Connect

```
Insight 1: convenient revisionism (wraps "partial right" around "partial wrong")
   ↓ (rhetorical move)
Insight 2: the existence of the tool is the counter-evidence to the task's triviality
Insight 3: thirty years of market data don't lie
   ↓ (historical facts)
Insight 4: trend ≠ rewrite
Insight 5: engineers aren't replaced; single-skill work roles are
```

Insight 1 is the rhetorical layer ("why this narrative is hard to beat"); 2/3 are the factual layer ("what evidence rebuts it"); 4 is the distinction layer ("how to cut the true part from the false"); 5 is the prediction layer ("what happens to engineers"). **All five together form a complete "AI-era engineering narrative" argumentation template.**

---

## 4. Design Philosophy: Reading 900 Words as Promptless's Engineering Posture

This 900-word short piece (and the few other tech pieces on the same site) demonstrates a **rare engineering posture** — **it sets a clean, reusable, unsentimental argumentation template for "does AI replace / not replace X" debates.** Distilling that posture yields four design philosophies.

### 4.1 Philosophy 1: Concede the "Partially Right" Honestly, Then Cut the "Partially Wrong" Cleanly

**Posture**:

The post does not deny "AI makes code cheaper" — **that's true**. What it does is **acknowledge the true part, then cut the false part cleanly**:

> "Those are true, defensible claims. But that's not what people are saying."

**Why this is a good engineering posture**:

- Reject "all-or-nothing" binary thinking — **real-world judgments are partial**
- Leave the "right part" to the reader — **don't shame those who already accepted the narrative**
- Cut the "wrong part" cleanly — **let the reader choose which half to follow**

**Reusable template**:

> "What you said is true — but only up to that sentence. From that sentence on, what you said is not true."

**Anti-patterns (how not to do it)**:

- Deny "AI makes code cheaper" entirely — **that's revisionism in the other direction**
- Turn the rebuttal into a rant — **emotional escalation makes the argument fail**
- Adopt a "engineers are an underdog" posture — **no one needs protecting**

### 4.2 Philosophy 2: Use Evidence to Rebut Narratives, Not Emotion

**Posture**:

All four evidence lines — timing, machine, market, engineer — **are checkable facts**. No emotion, no complaint, no grandstanding.

**Why this is a good engineering posture**:

- Engineering readers **only look at evidence**
- Evidence-based rebuttals can **be cited, replicated, verified**
- Emotion-based rebuttals can only **be felt, forgotten**

**Reusable rebuttal structure**:

> "You said X. Was X said in year Y? Does X require investment Z? What does X's market data W say? Who built the tools for X? — if all four questions fail, X is a narrative, not a fact."

**Anti-patterns**:

- "As an engineer, I'm heartbroken" — **emotion doesn't rebut narrative**
- "Those AI-hype people don't understand" — **ad hominem turns off engineering readers**
- "The next five years will prove you wrong" — **future-casting isn't argument**

### 4.3 Philosophy 3: Put "AI-Era" Judgments Back Into the Time Dimension

**Posture**:

The post repeatedly returns to the **time dimension**:

- "If writing code was never the hard part, someone should have been saying this in 2018."
- "For thirty years, salaries climbed steadily."
- "The 'never the hard part' crowd has to pick one"

**Why this is a good engineering posture**:

- Any "X has always been this way" claim needs **time-dimension evidence**
- Judgments without time-dimension are **present-narratives** — and narratives move with AI capability
- Engineering readers **are sensitive to history** — they've read the engineering history before LLMs

**Reusable judgment frame**:

> For any "X has always been X" claim — ask "why wasn't it said in 2018, 2010, 2000?"
> For any "X is now X" claim — ask "when did it start? what triggered it?"

### 4.4 Philosophy 4: Put "The People Who Do It" Back in the Center

**Posture**:

The post's sharpest cut isn't machine / market — it's **"the people who built the machine are the very people who were supposedly doing 'easy work'"**.

> "The people who built LLMs are software engineers. Researchers who write code. Infrastructure teams who write code. ML engineers who write code. They spent their careers mastering the skill, and then used that mastery to partially automate it."

**Why this is a good engineering posture**:

- Rhetorical narratives often **empty out "the people who do it"** — leaving only "the thing" and "abstract capabilities"
- Putting "the people who do it" back at the center — **the narrative immediately loses its rhetorical force**
- "The people who built the robots" = "the people who were supposedly doing easy work" — **this self-reference can't be sidestepped**

**Reusable writing move**:

> For any "X is being replaced by AI" — ask "are the people who built the AI the same people who were previously doing X?"
> If yes — **the narrative can't stand**.
> If no — **that's a new occupational shift** (worth discussing).
> But the common case is the former.

### 4.5 Philosophy Summary: 4 Philosophies = Promptless's Posture

| Philosophy | One-liner | What the post does |
|---|---|---|
| 1. Concede partial right, cut partial wrong | Reject binary thinking | Concedes "skill becoming scarce", cuts "always trivial" |
| 2. Evidence rebuts narrative, not emotion | Engineers only look at evidence | Timing / machine / market / engineer — 4 evidence lines |
| 3. Put judgments back in the time dimension | Rhetoric fears history | 2018 / 1990 / 30-year salary curve |
| 4. Put "the people who do it" back at the center | Narrative fears self-reference | The people who wrote LLMs = software engineers |

**The four aren't independent — they form a rebuttal toolkit**:

- To rebut an AI-era narrative — **first use philosophy 3 to put it back in time** ("what about before?")
- Time doesn't hold — **use philosophy 2 to find evidence** (market, machine, people)
- Evidence still doesn't hold — **use philosophy 1 to cut "right part" from "wrong part"**
- Finally — **use philosophy 4 to put people on stage** (the AI-builders are the "easy-work" people)

**This 900-word short piece is not commentary — it is a reusable methodology for "AI-era engineering narrative rebuttal."**

---

## 5. Core Takeaway

The most important legacy Promptless's "Writing code was hard, actually" leaves for AI-era engineering narrative is **a 4-step methodology for rebutting convenient revisionism**:

1. **Concede the partial right** — "AI makes code cheaper" is true
2. **Cut the partial wrong** — but "writing code was always trivial" is a rewrite
3. **Rebut with evidence** — thirty years of market data, billions for the machine, engineers built it
4. **Put "the people who do it" back at the center** — the AI-builders are the very "easy-work" people

**Three questions to topple any "X was always trivial" narrative**:

- Is this machine expensive? (expensive → not trivial)
- How long has the market judged? (decades → not trivial)
- Who built the machine? (the very people who do it → not trivial)

**The sentence to remember**:

> **"A skill is becoming less scarce" ≠ "a skill was always trivial."** The former is an honest market assessment; the latter is rewriting history. Promptless takes 900 words to make that distinction clear — and without denying any real change in the AI era, it refuses to let "change" become "rewrite."
>
> Engineers won't be convinced by "code was always trivial" rhetoric — but they will be convinced by "the market didn't lie for thirty years" and "the people who built the machine are the people who were supposedly doing trivial work." **That's rebuttal, not complaint.** **That's the cleanest gift this 900-word piece gives to AI-era engineering narrative.**

---

## Appendix A: References

- [Promptless — "Writing code was hard, actually"](https://promptless.ai/blog/technical/writing-code-was-hard-actually)
- [Promptless — complete documentation index (llms.txt)](https://promptless.ai/llms.txt)
- [Promptless homepage (Markdown)](https://promptless.ai/index.md)
- Companion engineering-culture posts on the same site:
  - [Docs Site Search Optimization: Why Content Accuracy Comes First](https://promptless.ai/blog/technical/docs-site-search-optimization)
  - [Developer Relations Docs: Why They Go Stale and Who Should Own Them](https://promptless.ai/blog/technical/developer-relations-docs)
  - [Developer Relations Docs Have a New Primary Reader](https://promptless.ai/blog/technical/developer-relations-docs-agent-primary-reader)
- Promptless main product ([promptless.ai](https://promptless.ai/)): AI tool that automatically updates your customer-facing docs as you ship features and support customers
