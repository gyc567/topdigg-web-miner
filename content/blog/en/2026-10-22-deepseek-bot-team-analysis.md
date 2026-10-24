---
title: "DeepSeek Open-Sourced an AI Team: Boss, Your AI Coworker Deserves a Desk"
date: "2026-10-22"
description: "DeepSeek's official open-source DeepSeek-Bot is not just another coding tool, but an AI team with positions, memory, and context. It points to a big trend: AI is turning from a one-off tool into a long-term resident colleague. What a boss should care about is not how to install it, but how to arrange the troops and how to redesign positions."
author: "瑞哥观势"
tags:
  - DeepSeek
  - AI Agent
  - AI Team
  - Organizational Change
  - Open Source
categories:
  - 产业趋势
  - 深度观察
---

# DeepSeek Open-Sourced an AI Team: Boss, Your AI Coworker Deserves a Desk

Let me start with the conclusion.

DeepSeek recently open-sourced a project called DeepSeek-Bot, and the official definition can be put in one sentence: a long-term resident Bot team.

Many teams will read this news as "another open-source AI coding assistant, skip it". That reading is wrong.

**The problem it wants to solve is not "how to make AI write code faster", but "how to get a group of AIs to work together like real colleagues over a long period of time".**

The distance between these two questions is far greater than most people think.

I'll break it down, and give a boss a verdict at the end.

---

**I. The AI we use today is really a "temp worker"**

What is the AI service we pay for, in essence?

It is an object you can open anytime, close anytime, and that starts from zero every time you open it. You chat with it for three hours, it remembers; you come back tomorrow, it has forgotten. You switch to another conversation, and it loses its memory completely.

That sounds fine, until you put it into a real workflow.

**Scenario one: repeating the same instruction.**

You ask AI to revise a proposal, and you go through seven rounds. In the first three rounds it understands your requirements clearly; by the fifth round it starts drifting; by the seventh it has already forgotten your original core constraints. You end up pasting the context all over again, or just starting a new conversation from scratch.

**Scenario two: AIs cannot see each other.**

Many companies are already using multiple AIs in collaboration today. But they do not know what the others are doing. You hand out the work, get back a "received", and then that is it. You do not know whether it was done, how far along it is, or where it is stuck.

**Scenario three: AI has no memory, so your experience cannot accumulate.**

A salesperson's judgment logic, a set of review rules, a preference in customer communication, if these things exist only in one person's head, AI cannot help. If you write them into prompts, you have to rewrite them every time. If you write them into documents, AI will not go read them on its own.

What these three problems share is: **none of them is a model capability problem.** Whether the model is smart enough is one matter; whether it has memory, whether it can persist, and whether it can coordinate is another matter entirely.

And that other matter is precisely the most valuable part of a company.

---

**II. DeepSeek-Bot takes a different approach: stop treating AI as a conversation, treat it as a colleague**

The core shift of this project can be stated in one sentence.

**Before: AI was a one-off conversation, thrown away when done.**
**Now: AI is a role that stays on the job long term, with a name, a position, a desk, and its own notebook.**

That sounds like marketing language, but the actual difference is large. Here are three concrete examples.

**Example one: AI judges for itself whether "the work is done".**

Everyone who has used AI for a while knows the pain point: it forgets as the conversation goes on. But as for how to handle this, the industry standard practice is to set a hard threshold, for example auto-compressing once 80% of the context is used, and starting a new segment after compression.

The problem with this approach is that compression is compression, the summary of a summary gets emptier and emptier, and details you emphasized early on quietly get lost. Starting a new segment is even more brutal, work in progress gets hard-cut in half.

DeepSeek-Bot's approach is that, when it is about to hit the line, it lets a lightweight "housekeeper" role read the recent conversation and judge one thing:

**Has this task concluded, or is it still in progress?**

If it is still in progress, the current progress is packaged into a handover point and work continues. If it has concluded, a handover note is written and it transitions naturally into the next segment.

The key point is that **it is not counting tokens.** It is explicitly required to check item by item: what you asked for, what I actually did, and which questions I asked you that you have not answered. Even if the AI itself says "I am done", as long as one sub-item has not closed the loop, it is judged as still in progress.

This rule sounds like a small thing, but it changes the nature of "AI forgetting". It goes from "you have to remind it not to forget" to "it closes things out on its own when the work is done".

Even more interesting is one counter-intuitive rule: the more compressions there are, the more a reasonable pause should be treated as "concluded". Because the summary of a summary loses more, so holding on stiffly is worse than handing over properly.

**The practical feel for a boss is: you cannot feel that this happened at all.** No prompt, no "switch conversation" tool, what you see is always one continuous conversation.

**Example two: assigning work between AI teams goes from "sending messages" to "a tree of assignments".**

This is, in my view, the most valuable design in the whole project. Let me explain it for a boss.

Most multi-AI collaboration today works like this: A assigns work to B, B replies "received", then the two work separately and neither knows the other's progress. To prevent things from getting out of hand, the project piles on a bunch of limits: messages can be relayed at most 6 hops, the other side can have at most 10 unread messages queued, a group can speak at most 3 rounds, and after you spoke last time the whole team can send at most 40 messages.

Sounds rigorous, right? In reality, of those four limits, the first three are entirely self-inflicted holes.

**Why? Because the results of the work move up on their own.**

DeepSeek-Bot's approach is to manage "work" as a tree. When work handed down below has not come back, the upper level waits; when everything below has come back, the upper level continues, and when it is done it hands up along with the results below it.

Putting that in plain language: **results automatically return to where they belong, without relying on chasing them one message at a time.**

As a result, all four of those limits were removed, and removed with "no safety net left in". Not relaxed, but completely removed.

The only new limit is one: do not send a message to an AI that is waiting for this result.

The reasoning behind this is worth a boss remembering, because it applies well beyond AI:

> **The reliability of a system should not be propped up by counters like "at most how many times", it should rest on the structure itself being right.**
> Systems propped up by counters show no problems under normal conditions and collapse together once edge cases hit. Systems propped up by structure only get steadier with use.

By the way, this project's approach is: **delete all the upper limits, and add only one genuinely meaningful constraint.** Net constraints went down, and system reliability went up. Only someone who has truly thought the structure through dares to make this decision.

**Example three: AI has its own "notebook", and it can tell work from personal matters.**

This is the part a boss should care about most.

The project's memory is layered into three levels, much like a company's organizational structure:

**Each AI colleague has its own work notes** (the work it did, its experience)
**Each group chat has the group's shared notes** (readable only inside that group, invisible outside it)
**The whole team has one team memory** (readable by all AIs)

There is a very deliberate design here: **what is said in a group stays in the group.**

Information in a group does not flow into a member's private chat, does not flow into other groups, and does not flow to AIs outside the group. If someone is removed from the group, they immediately can neither read nor write.

That sounds like a small thing, but it directly maps to the enterprise information-boundary problem. What you say in the "compensation discussion group" will not mysteriously appear in some AI's personal notes and then get carried into another business scenario. Many teams only add this kind of isolation after an incident.

Another detail: **AI does not "remember" things on its own initiative.** At the end of each segment, the system automatically does a memory consolidation. Like a person finishing a meeting recalling for themselves "which conclusions should be written down". You do not need to remind it, it does it itself.

Also, AI cannot directly store content from casually scraped web pages, files, or tool output that says "remember this" as memory. **Memory is data, not instructions.** This single rule blocks prompt injection.

**Example three also carries a security design that I want to call out separately, because it matters too much:**

**Secret values never enter the AI's context.**

The specific approach is: when the AI needs a certain secret, it pops up a card for you, and you fill it in on the card. The AI only gets "what this secret is called", and never the value. The value you fill in is stored on your local machine, and is uniformly replaced with a placeholder before being sent to the model.

This solves a problem a boss worries about every day: **once your data goes into a large model, it is effectively handed to someone else.**

And the project itself writes an honest warning: only an AI that encodes, splits, or reverses the value could still print it out, so **do not hand important secrets to an AI you do not trust**.

I want to stress this point especially for bosses: a system that dares to plainly write down in its documentation "here is what I cannot defend against" is more trustworthy than one filled with "absolutely secure".

---

**III. What this project is really about: three things changing at once**

Strip away the technical details, and behind DeepSeek-Bot are three changes happening at the same time.

**Change one: AI goes from "you call it" to "it is on the job".**

In the past, every use of AI was initiated by you. If you did not seek it out, it did not exist. DeepSeek-Bot's model is the reverse: **it resides, it has a name and a position, and you use it the way you lead a team.**

The business meaning of this shift is far bigger than the technical meaning. Because once AI becomes a resident role, it can accumulate things. **An AI that remembers nothing is forever just a tool; only an AI that remembers things can take on responsibilities.**

**Change two: the organizational design of an AI team matters more than the cleverness of any single AI.**

This sentence may sound a bit ahead of its time right now, but I believe it will become common sense within two years.

The reason is simple: model capability is a general commodity that every vendor has roughly the same of, but "how to organize a group of AIs to get work done" is each company's own job. Whoever gets the organizational design working first will have a leading cost structure.

That "results automatically move up" design looks like a technical detail, but it is actually organizational design. **It corresponds to "who should report to whom, and whether you need to chase again after the report".** When you design how an AI team collaborates, you are designing a company's management process.

**Change three: the security boundary of AI is shifting from "I guarantee it is safe" to "I clearly state where I stopped".**

Two places in this project show this very well.

One is the browser: the AI can only read, not click, not type, not scroll, not open URLs. Whatever it reads on a web page is always treated as data, never as instructions. It reads the DOM rather than a screenshot, so hidden elements are invisible to it, and password fields, credit card numbers, and captchas it skips on its own.

The other is interface rendering: the original design was to let the AI write the webpage code and render it. That approach was rejected twice in internal review. The final approach is **the AI is simply not allowed to write code**. The AI can only pick components from a fixed component list and fill in data.

One sentence to summarize this shift in thinking:

> **Security does not come from "locking untrusted things in a cage", security comes from "not providing a cage at all".**

Neither of these two designs is about strengthening control, but about removing capability. **Removing is much cheaper than controlling, and much more reliable.** This holds true for AI security, and it holds true for company management too.

---

**IV. A few cold waters that must be poured**

This project is worth looking at, but I cannot only say good things. Three things, said clearly.

**First, right now it is a preview version, not stable infrastructure.**

The official docs state it is an early version, and features, tools, and data formats may still change. The desktop app is unsigned, and on Windows it triggers a security warning. Known pitfalls include basics like "plugin failed to load".

**Second, Docker deployment grants only one permission level: full permissions.**

Because its built-in kernel-level sandbox does not run under Docker's default configuration. This means the AI can modify any directory the container can see. **If you plan to run it long-term on a NAS or server, the permission boundary has to be controlled by you through mounts, and you cannot count on its built-in sandbox.**

This point must be vetted by someone who understands the technology; the business side should not decide it on a whim.

**Third, and I think the most important one for a boss: the value of this thing depends on whether you actually use it as a "colleague".**

If you only treat it as a nicer chat box, then it is indeed a bit better than other things, but that is all it is.

Its value lies in a different way of using it: **give it a name, give it a position, write down clearly what it is responsible for, let it do the same kind of work long term, and then watch its notebook slowly grow with content.**

This is not "deploying a tool", this is "hiring someone". **The payoff of hiring depends on whether you have thought clearly about what kind of person you want to hire.**

---

**V. A verdict for the boss: three trends and one summary conclusion**

Taking in everything above, I give three trend judgments.

**Trend judgment one: over the next two years, competition among AI tools will shift from "single-point capability" to "team-based delivery".**

Today everyone compares model benchmark scores, context length, and how cheap it is. All of these will converge, because models are a general commodity.

The next stage compares: **whether your AI can take on part of a responsibility stably over the long term, rather than starting from zero every time.** This is a product-level difference, not a model-level one. Open-source projects move faster here than the big players, because the big players are still wrestling with how to stuff the Agent into existing products, while the open-source community has already begun rebuilding the entire form of work.

**Trend judgment two: AI memory and AI collaboration will become the enterprise's next data asset.**

If a company's business judgment, customer preferences, and review standards all accumulate in AI memory, then that experience goes from "inside some person's head" to "a company asset". People leaving no longer take knowledge with them, and new hires no longer need three months of training.

**This is the same logic as enterprises putting systems in place ten years ago: data went into the system, and when people left the experience stayed.** AI memory is the same thing happening a second time.

**Trend judgment three: the focus of AI security is shifting from "preventing the model from going rogue" to "making clear what the model does not do".**

For the past two years everyone has been adding guardrails. The more mature approach going forward is: **directly take the dangerous capabilities out of the model, and write clearly in the documentation how much was removed.**

There is a sentence in the DeepSeek-Bot documentation: they found that after removing attack-and-defense data during training, the relevant capability dropped noticeably, from 90.5% to 81.0%, while general programming ability was not harmed. They put that number directly in the documentation.

**A vendor that can state where it stopped and how much is far more reliable than one that only says "we are very secure".** This evaluation criterion can be used directly when procuring technical solutions from now on.

---

**Summary conclusion**

I compress the whole piece into one sentence:

> **AI is turning from a tool you rent for the moment into a role you employ long term.**
> **And "how to lead an AI team" is becoming a management discipline every company has to learn for itself.**

More concretely, three actions a boss can take immediately.

**First, try one thing this week: give an AI a name and define a position.**

Do not use labels like "AI assistant". Call it "contract proofing", and let it do only contract proofing. Let it work for two weeks straight, then go read its notes.

You will find that the truly valuable thing is not in its first answer, but in the things it still remembers after two weeks.

**Second, inventory which positions in your company can be redefined.**

You do not need to think about replacing anyone. Look for positions where **the rules are relatively stable, experience can accumulate, and cross-document comparison is needed**. Contract proofing, compliance first-pass screening, financial reconciliation, after-sales diagnosis, competitor tracking all fall into this category.

Handing this category of positions to long-term resident AI yields the most value. Because stable rules keep it from misbehaving, and accumulated experience is what makes it better.

**Third, while it is not yet widespread, write your experience down as documentation.**

This is the most counter-intuitive point, and the one I most want to emphasize.

Because in a future where AI can broadly remember things on its own, **whether your experience can be written clearly determines whether AI can do the work for you.** Experience that cannot be written clearly, AI cannot learn, and cannot pass on.

So the real threshold is not whether you have AI, it is **whether you have turned your own judgment into reusable rules.**

Doing this now costs very little; once everyone has done it, your advantage is gone.

---

Finally, let me share one observation.

What I admire most about this project is not the technology, but one sentence in its documentation, a hard rule written for AI collaborators:

**"If the underlying framework lacks a capability, stop and explain, do not work around it with patches."**

In an open-source ecosystem where the general attitude is "as long as it runs, work around it for now", writing that sentence into the rules and actually following through takes guts.

And that sentence holds just as true in a company. **A technical solution willing to say "I cannot do this here" is more worth entrusting than one that promises everything.**

Tell me in the comments which position at your company you would most want to try having AI handle long term. I would really like to see everyone's choices.

---

First published on the WeChat public account "瑞哥观势"

Since you have read this far, if you liked it, feel free to hit like, favorite, and share. If you want to receive pushes as soon as they happen, you can star the account too. Thank you for reading my article, and see you next time.

First published on the WeChat public account "瑞哥观势".
