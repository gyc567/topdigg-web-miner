---
title: "shuohao-skills with 6800 Stars: The Real Barrier to AI Short Dramas Is Not Generation, but Who Dares to Write Quality Gates as Code"
date: "2026-11-19"
description: "shuohao-skills, an open-source project with 6800 stars, turns a novel into an AI short-drama production pack that can be ordered directly: 7 skills, 60 quality gates, and more than 1600 self-test assertions. Its real value lies in driving the checklist out of the prompt and into deterministic code."
author: "瑞哥观势"
tags:
  - Open Source Project Analysis
  - AI Video
  - Agent Skill
  - Automated Acceptance
categories:
  - AI应用
keywords:
  - shuohao-skills
  - AI Short Drama
  - Agent Skill
  - Quality Gate
  - Automated Acceptance
  - storyboard
  - MiniMax H3
  - Seedance
source:
  original:
    name: "瑞哥观势"
    url: "https://mp.weixin.qq.com/s/xxxxx"
---

# shuohao-skills with 6800 Stars: The Real Barrier to AI Short Dramas Is Not Generation, but "Who Dares to Write the Quality Gates as Code"

**Conclusion first:** On GitHub there is an open-source project with 6800 stars and 960+ forks called `shuohao-skills`, and what it does is turn a novel into a short-drama production pack that can be handed straight to a video model for ordering. 7 skills, 6 production stages, 60 quality gates, and more than 1600 self-test assertions.

But the truly valuable thing about it is not those 7 skills — it is the anti-trend move it dared to make: **driving the "checklist" out of the prompt and into deterministic code, so that if the model fails a gate, it simply cannot proceed.**

This is the cleanest sample of "AI engineering" I have read this year. Below I will break it apart thoroughly: what the project is, how to run it, what design philosophy hides inside it, and — for people doing short-drama business — what this whole thing is actually worth.

---

## 1. Project Overview: A File Pipeline That Breaks Short-Drama Production into Six Segments

The author of `shuohao-skills` is "Shuohao" (X: @eternityspring), under the Apache 2.0 license. The project was started in August 2026 and reached 6800 stars in a bit over two months. The repository's positioning can be stated in one sentence:

> An AI short-drama production skill collection for all kinds of Agents, from a novel to the production assets you hand directly to a generation pipeline.

It is not bound to any Agent runtime. Claude Code and Codex are just "two supported examples, not prerequisites" — as long as your Agent can read `SKILL.md` and run Node scripts, it works.

### 1.1 The Seven-Piece Set

| Skill | What It Does | Quality Gates |
|---|---|---|
| `novel-outline` | Adapts the novel into a five-piece short-drama outline: adaptation notes, character roster, beat table, episode synopses, asset inventory | 14 gates |
| `novel-characters` | Turns the characters established in the outline into a character design set: character profiles, appearance prompts, voice-tone prompts, three-view layout instructions | — |
| `character-refs` | Actually generates character reference images: front full-body anchor plus derived views | check gate |
| `novel-art` | Art design set: scene consistency anchors, lighting-state variants, narrative prop table, white-background cutout-ready assets | 10 gates |
| `novel-script` | Script: scenes plus a beat flow (alternating action and dialogue), deterministic per-episode duration conversion, dialogue sheet | 10 gates |
| `novel-staging` | Opening blocking for every scene: who stands on which side of which object, sitting or standing, facing which way | 8 gates |
| `novel-storyboard` | Storyboard: segment (≤15 seconds) → cut (2–5 second hard gate) → storyboard image, H3 and Seedance production packs | 18 gates |

The flow chart looks like this:

```
source novel → outline → characters → art → script → staging → storyboard → production pack
                ↑         ↕        ↕
           characters ←──────┴────────┘
                └→ character reference images (fed into the storyboard)
```

Note that `novel-characters` / `novel-art` / `novel-script` have **bidirectional arrows** among them — characters, art, and script are three lines that iterate in sync, not a waterfall. This is intentional: if halfway through writing the script you discover a character has no story to tell, you go back and revise the outline; if art discovers a prop can't carry a scene, you go back and revise the script.

### 1.2 What Form It Delivers

Each stage produces a set of three: `*.json` (working data for machines), `*.md` (text export for humans), and `*-report.html` (a single-page review report you can open by double-clicking).

The report is not decoration. Take the report for `novel-outline`:

- **KPI band**: total episode count, beat count, character tiering, main scene count, generation difficulty, adaptation magnitude
- **Beat rhythm chart**: each beat marked on the plot timeline, gaps marked directly on the axis ("— 4-episode gap —"), over-threshold turns red
- **Per-episode scheduling matrix**: a 60-episode × 25-character grid, where reading one column vertically gives you that episode's requirement sheet
- **Quality gate panel**: ✓/✗ baked into the page, failed items pop up as pathology banners
- **Export JSON**: what you download is `outline.json` verbatim

The author's positioning is unambiguous: **this is a single-page report for industry review, and the reader uses it to decide whether to cut, and whether to schedule production.** The default delivery form of the report determines that it is used for decision-making rather than filed away to gather dust.

`novel-staging` goes one step further and delivers an **interactive HTML tool**: one top-down floor plan per scene, where a human can directly drag elements to reposition them, click to change sitting/standing and facing, and click "Export JSON" to download the new `staging.json` — no hand-editing of JSON required.

### 1.3 Engineering Constraints

| Item | Requirement |
|---|---|
| Node | ≥ 18, **standard library only, zero npm dependencies** |
| API key | **Not needed**, uses the current session quota |
| Agent | Any Agent that can read SKILL.md and run Node scripts |
| Image generation model | Only `character-refs` needs one (Qwen Image / Codex / GPT Image 2 / custom command) |

The zero-dependency constraint is not showing off — it is **the precondition for portability**. If you want to copy a single skill away on its own, it has to run.

---

## 2. Detailed Tutorial: Running the Entire Pipeline from Scratch

### 2.1 Installation

```bash
git clone https://github.com/eternityspring/shuohao-skills.git
cd shuohao-skills
./scripts/install.sh
```

What the install script does is very plain: it **symlinks** each skill directory into the detected Agent skills directory. Because it is a symlink and not a copy, it takes effect immediately after `git pull`, with no need to reinstall.

```bash
./scripts/install.sh novel-characters   # install just one
./scripts/install.sh --codex            # install into codex only
./scripts/install.sh --uninstall        # remove the symlinks
```

Manual installation works too:

```bash
ln -s "$PWD/skills/novel-characters" ~/.claude/skills/novel-characters
ln -s "$PWD/skills/novel-characters" ~/.codex/skills/novel-characters
```

After installing, run the full self-test suite first to confirm the environment is fine (do not skip this step):

```bash
for f in skills/*/scripts/selftest.mjs; do node "$f"; done
```

The self-tests do not call models, do not consume quota, and take about one second for the whole suite. **Note: upstream only verified on macOS + Node 24; Linux and lower Node versions are theoretically fine but unverified.**

### 2.2 Working Directory Convention (Do Not Flatten It)

Running a whole pipeline produces a large number of json / md / html files. The directory convention baked into the repository is:

```
<demo>/
├── outline/       ← <series>-outline.json / .md / -report.html
├── characters/    ← <series>-cast.json / .md / -report.html
├── art/           ← <series>-art.json / .md / -report.html
├── script/        ← <series>-script.json / .md / -report.html
├── staging/       ← staging-report.html (primary deliverable) + staging.json
├── storyboard/    ← <series>-storyboard.json / .md / -report.html
│   ├── manifest.json
│   ├── E01-01/        ← storyboard production pack from export, one folder per segment
│   └── E01-02/
├── docs/
└── scripts/
```

There is one pitfall worth pulling out on its own: **do not nest segment folders one level deeper** (for example, putting them inside `segments/`). Images in the storyboard report use relative paths `<segment-number>/f<cut-order>.png`, and by default the report html and the segment folders must be siblings. Add one more level without changing the paths and the images in the report will **silently** all become "not generated" placeholders — upstream testing moved 10 segment folders into `segments/` and the inline images went from 2 to 0, with **no error reported by the report**.

This is a classic sample of "silent failure": the files are there, the images are there, the links are wrong, and the page pretends everything is fine.

### 2.3 Stage 1: Adapted Outline

```bash
node skills/novel-outline/scripts/novel-outline.mjs chunk <book.txt> <workdir>
node skills/novel-outline/scripts/novel-outline.mjs validate <workdir>/outline.json --stage beats
node skills/novel-outline/scripts/novel-outline.mjs validate <output>/<series>-outline.json
node skills/novel-outline/scripts/novel-outline.mjs render <output>/<series>-outline.json --md   > <series>-outline.md
node skills/novel-outline/scripts/novel-outline.mjs render <output>/<series>-outline.json --html > outline-report.html
```

**The single most valuable rule in the whole flow: decide first, then refine.**

The skeleton (which storylines were cut, which characters were merged, which episode the big beat lands on) must first produce a **fast version** for the user to sign off on; only afterward is writing the episode synopses allowed. This is not a verbal convention — it is a **process gate**: before writing episodes you must pass `validate --stage beats`, and if the beat intervals or major beat timing are wrong they are blocked on the spot.

The author's logic is very practical: **a wrong fast version only costs one round of skeleton work; if you discover the direction was wrong only after the episodes are written, everything is wasted.** The 60 episodes are still written in batches, each batch ≤ 10 episodes — writing the second half in one breath will definitely collapse.

The 14 gates look like this:

| Gate | Default Threshold |
|---|---|
| Lead group (male lead + female lead + main antagonist) | 1–5 people |
| Named important supporting characters | ≤ 10 people |
| Functional characters (occupy faces, not names) | ≤ 10 people |
| Main scene cap | **Dynamic with episode count**: 4 + ⌈episodes/10⌉, clamped to 5–15 (6 episodes→5, 60 episodes→10, from 110 episodes it caps at 15) |
| Narrative prop cap | ≤ 8 items |
| One-off scenes have avoidance plans | — |
| No vacuum in beat intervals | ≤ 3 episodes |
| Episode 1 has a hook | — |
| Major beat does not occupy the final episode | — |
| Every episode has all three columns (synopsis/hook/cliffhanger) | — |
| Three or more people in one frame have a breakdown plan | — |
| Generation difficulties enter the warning list (rain scenes/body contact/crowds/hand close-ups) | keyword scan |
| References are complete: no unemployed characters, no idle scenes, all IDs exist | — |
| Synopses are narrative prose, with no quoted dialogue | — |

The design of these two thresholds is worth unpacking, because they expose the fundamental difference between "AI short drama" and "live-action short drama".

**Why characters are tiered into three buckets instead of a single cutoff**: A single cutoff conflates two different things — "who the audience needs to remember" and "how many faces production has to maintain". The lead group cap protects screen time and memory load; the supporting and functional character caps protect **AI character asset cost** (the consistency investment for each tier is completely different). Functional characters having "no character arc" is normal — the doctor is there to stitch someone up, and the validator will not demand one.

**Why the scene cap is far looser than in live-action drama**: In the live-action era, "≤ 5 sets" was economics (building sets costs money); in AI short drama, scenes are generated, and **there is no set-building cost**, so the economics of the live-action era no longer hold. What the cap now protects is only the **cross-episode consistency assets** of a scene and the audience's spatial cognition. Scenic variety directly feeds watchability, so the cap loosens to 15 as the episode count grows.

Incidentally: the fifth piece of the five-piece set, the "asset inventory", is **always computed by the script** — hand-written by the model it is guaranteed to miss things.

### 2.4 Stage 2: Character Design

```bash
node skills/novel-characters/scripts/novel-characters.mjs seed <outline.json> > <workdir>/seed.json
node skills/novel-characters/scripts/novel-characters.mjs chunk <book.txt> <workdir>
node skills/novel-characters/scripts/novel-characters.mjs merge <workdir> --apply merges.json | tee <workdir>/merged.json
node skills/novel-characters/scripts/novel-characters.mjs validate <cast.json>
node skills/novel-characters/scripts/novel-characters.mjs render <cast.json> --html > cast-report.html
```

**The seed mechanism is the general paradigm of this architecture**: facts already decided upstream (character IDs, names, tiers, character arcs, merge sources) are carried over deterministically by the script, and what is left blank is the design that belongs to this layer (aliases, one-line profiles, appearance prompts, voice tone). The sentence the documentation repeats over and over is:

> **Do not make the model think over again the facts that have already been decided.**

The same sentence appears once each in the four skills `novel-art`, `novel-script`, `novel-staging`, and `novel-storyboard`. **Avoiding repeated inference is the cheapest optimization in an AI pipeline** — every time the model thinks it over again, that is one more chance to go off track.

There is a detail in alias merging worth mentioning. The script can only converge through **exact matching** (if one block lists "Lu" as an alias of "Lu Xingyuan", the two merge into one person), and the remaining `mergeCandidates` are semantic judgments the script cannot make — they must be reviewed one by one by a human/model. Candidates come from name containment relations (`"Lu" ⊂ "Lu Xingyuan"`), but the author explicitly marks this as a **strong signal, not a verdict** — a father and son with the same surname, or two brothers, cannot be merged. And "Mr. Lu" and "Xingyuan" have no containment relation at all, so they never enter the candidate list — you have to notice them yourself.

The upstream sample "Duokou" (The Ferry Crossing) deliberately constructs this case: the peddler is called only by his nickname throughout, and the boatman is only ever called "Old Bo".

### 2.5 Stage 3: Art Design

```bash
node skills/novel-art/scripts/novel-art.mjs seed <outline.json> > <workdir>/art.json
node skills/novel-art/scripts/novel-art.mjs validate <art.json> --cast <cast.json>
node skills/novel-art/scripts/novel-art.mjs render <output>/<series>-art.json --html > art-report.html
```

This skill's premise is carved into its bones: **this is AI generation, not live action.** There is no location scouting, set building, dressing, or purchasing; environments and props are assets that must be generated dozens of times and still look alike. So all delivery revolves around consistency:

| Deliverable | What It Solves |
|---|---|
| Consistency anchors (3–5 per scene) | The audience recognizes scenes by them; QC uses them to check whether generated shots have drifted |
| Lighting time-of-day variants | Switching time of day in AI means **regenerating**, not re-lighting, so each state becomes a complete prompt |
| Empty-scene image prompts | Environment and characters are two layers of assets; if a person sneaks into the reference image, consistency is destroyed |
| Variant mechanism (`variantOf`) | Generating a new scene is cheap, but a variant that reuses the parent scene's assets is more consistent |
| Prop state variants | A suitcase closed and open are two reference images — props have state arcs, scenes do not |
| Prop scale reference | AI frequently draws handheld props at furniture size, so prompts must carry scale phrases |
| Props on white background without hands | Prop images get composited into all kinds of shots, so they must be cuttable; the hand holding a prop is the most common contamination |

The boundary "props only collect narrative props" is drawn very clearly: items with close-ups, spanning episodes, and carrying plot usually number 3–8. Scene furnishings belong to scene anchors; one-off hand props are solved at the shot-level prompt; none of them get a standalone asset.

"A suitcase like this, something that travels with people, belongs at this layer" — putting it in scene anchors or character profiles is wrong either way.

The two most practical of the 10 gates: **all prompts in English** (Chinese prompts generally perform worse with image models, and this best practice is enforced by a gate rather than left to self-discipline), and **prompts contain no character names** (the image model associates reference images on its own; the names actually become interference).

### 2.6 Stage 4: Script

```bash
node skills/novel-script/scripts/novel-script.mjs seed <outline.json> --eps 1-3 > <workdir>/script.json
node skills/novel-script/scripts/novel-script.mjs validate <script.json> --outline <outline.json> --art <art.json>
node skills/novel-script/scripts/novel-script.mjs render <output>/<series>-script.json --html > script-report.html
```

**The premise carved into its bones: the script handles the drama, the storyboard handles the shooting.** Dialogue gets overturned and rewritten repeatedly; once it is bound to a shot breakdown, every changed line forces a re-layout of the shots. So this layer has only episodes, scenes, and the beat flow — no shot numbers.

But there is one bottom line: **dialogue must be structured data, never prose.** Every line of dialogue is an independent entry (speaker + line + tone), and every action is an independent beat. This is the bedrock of all deterministic checking.

Duration is **computed**: dialogue is converted at 4.5 characters per second, action at 2.5 seconds per beat; a three-minute episode is three minutes, and being over or under is blocked on the spot rather than discovered at the generation stage.

Two of the 10 gates show the most craft:

- **The hook must be paid off concretely within the first 3 beats** (`hookBeat` claims it) — a hook is not a label, it is the first beat. The life-and-death line of a short drama has to land on paper, not rely on the model "remembering to write a cliffhanger".
- **Every scene has at least one action beat** — a pure-dialogue scene is a radio play, and there is nothing to write for when AI generates it.

If you write too much, cut action beats first and then compress dialogue; if you write too little, **add conflict, not filler** — add conflict, do not add small talk.

### 2.7 Stage 5: Opening Blocking (The Most Interesting Skill)

```bash
node skills/novel-staging/scripts/novel-staging.mjs seed <script.json> --art <art.json> --outline <outline.json> > <workdir>/staging.json
node skills/novel-staging/scripts/novel-staging.mjs validate <staging.json> --script <script.json> --art <art.json>
node skills/novel-staging/scripts/novel-staging.mjs render staging.json > staging-report.html
node skills/novel-staging/scripts/novel-staging.mjs blocking staging.json
```

**Why does blocking need its own stage?** Every segment of a short drama's video is an independent generation, and each segment decides for itself who sits where. In a group scene, six people surround a long table; in the first segment five unnamed extra guests appear at the table, and in the third segment the person sitting with the wine tray is wearing the protagonist's clothes.

The storyboard's blocking sentence is handed over from one segment to the next, but the sentence for the **first segment** of each scene is made up by the storyboard itself — **invisible to humans, impossible to edit**. So before storyboarding, each scene first gets a blocking layout, and the storyboard copies it verbatim.

The flow is **identify first from the image, then place**: from the main viewpoint of the scene image, identify the objects a person will stand beside or sit on (4–20 items), and write down the name, the box on the image, and the position on the top-down floor plan. Then, following the script, decide who is on which side of which object, how far along that side, sitting or standing, and which way they face.

Two iron rules:

- **Do not write what you cannot see in the image** (anything in the prompt but not in the image is not written) — otherwise a person sits on a high platform and every segment of video looks different
- **`plan` is derived from perspective**, not copied from `box` — the "north side of the table" on a perspective scene image is just a narrow slit, with no clear sense of front-to-back depth; only when flattened and viewed from above does it become obvious at a glance

The placement rules are equally hard-coded: **someone who enters later is not present at the opening**; **if the script does not mention others, there are no extras**; **only objects you identified may be used**.

The blocking sentence is written by the program and handed to the storyboard word for word:

> "Old Master Hu sits on the third bench, facing north; every other seat is empty, nobody else is present."

This skill was only added in 2.2.0 (2026-10-14). It is the newest one, and also the one that best illustrates that the author has hit real traps in real projects.

### 2.8 Stage 6: Storyboard

```bash
node skills/novel-storyboard/scripts/novel-storyboard.mjs seed <script.json> --eps 1-3 --aspect 16:9 > <workdir>/storyboard.json
node skills/novel-storyboard/scripts/novel-storyboard.mjs validate <storyboard.json> --script <script.json> --outline <outline.json> --cast <cast.json> --art <art.json>
node skills/novel-storyboard/scripts/novel-storyboard.mjs render <output>/<series>-storyboard.json --html > storyboard-report.html
node skills/novel-storyboard/scripts/novel-storyboard.mjs export <storyboard.json> --protocol h3 --out storyboard
```

**The premise carved into its bones: shots are generated, so the cost of one extra cut is almost zero.** So this stage does not economize on shot count, and there is only one cap: the duration a video model generates in a single segment (15 seconds by default).

A three-layer structure:

```
segment = one video-generation call, ≤ 15s, never crosses scenes
 ├─ cut     = intra-segment edit, 2–5s each (hard gate), each claiming script beats
 ├─ frame   = one keyframe per cut: master frame pinned at 0.00s, sub-frames at their own cut marks
 └─ H3 prompt = one per segment; multi-picture alignment + [Shot k] cut times audited verbatim
```

Several key mechanisms:

- **Beat claiming**: each cut declares which consecutive beats of which script scene it covers, and it may not cross scenes — a change of location must mean a change of shot. This makes the relationship between storyboard and script **mechanically reconcilable**.
- **Shot/reverse-shot dialogue is generated in one go within a segment**: the wide shot, the close-up on A, and the close-up on B are each a 2–5 second cut, and each frame's composition is controlled by its own storyboard image, **not bet on by text**.
- **Alignment instructions are derived, not written**: `Picture 2 aligns with the 3.00-second mark…` and `[Shot k] At 00:0X.XXX` are all derived from the cut seconds, and validate **reconciles them word for word** — change the seconds and forget to change the prompt, and it is blocked on the spot.
- **H3 and Seedance side by side**: the H3 prompt uses MiniMax's official I2VA structure (alignment instructions + `integrated_multimodal_description` + `overall_soundscape` + `non_diegetic_music`); the Seedance prompt is **assembled on the fly by the script according to the official structure**, and the model writes only each cut's `shot` — not the seconds, the numbering, or the image references.
- **Quantified composition fields**: per segment, `blocking` (who is left, who is right, spacing); per cut, focal length / camera position / composition / gaze target / focus / stability. The reason is stated very plainly — when producing from reference images alone there is no storyboard image, so information like "how close, how full, who is where, where the eyes look" is **either written down or vanishes on the spot**, and what actually vanished in testing was exactly that: shot sizes too wide, actions too small, character placement arbitrary.

The hardest of the 18 gates: **storyboard cut duration of 2–5 seconds is a hard gate, not a suggestion** (this is the attention rhythm of short-form drama); **dialogue must fit** (the seconds of claimed dialogue ≤ the seconds of the cut, checked cut by cut); **≤ 3 people in a single-shot frame** (if exceeded, a breakdown explanation is mandatory); **H3 dialogue verbatim** (changing a single punctuation mark fails); **video prompts contain no character names** (required by the official H3 and Seedance specs).

### 2.9 Report Assembly and Export

The reports of the five stages can be assembled into a single page:

```bash
node scripts/report.mjs --from <demo-dir> --out report.html
```

**It is an assembler, not a sixth skill.** It does not import any skill's code; instead it calls each one's `render --html`, takes the artifacts, and assembles them. So the five skills stay unchanged, each still independently runnable and individually copyable; if one skill changes its rendering, this side follows automatically.

Merging has to solve three things, **all handled inside the assembler, without intruding into the skills**:

- **Style bleed**: the five reports share 57 class names, 13 of which have the same name but different definitions (`.copy` `.kpis` `.badge` `.chip`…), so a scope prefix is added to every selector
- **Script bleed**: each report's script is a global query like `document.querySelector('.expo')`, and when combined onto one page only the first match is hit — all five export buttons would break. The approach is to wrap `document` in a Proxy and swap it out
- **Image paths**: each report's images are relative to its own json's directory, so after assembly they are recomputed relative to the output file's location

The assembler itself hit three traps, and each trap now has a self-test assertion watching it:

1. `<script type="application/json">` is the **data** that each report embeds so its export buttons can read the source JSON; if you extract it as a script and execute it, the browser throws `Unexpected token ':'` and all five panels break
2. CSS comments between rules can stick to the next selector, and the commas inside the comment cut the selector apart — in testing this caused 18 rules to lose their scope
3. The character report's thumbnails use inline `background-image:url(…)`, so checking only the `src` attribute misses them. The symptom is that the large images are fine while the thumbnails 404, which is very hard to debug

### 2.10 Running a Single Character (Without Adapting a Novel)

`character-refs` does not depend on a novel:

```bash
node skills/character-refs/scripts/character-refs.mjs config --model qwen --confirm-anchor yes
node skills/character-refs/scripts/character-refs.mjs intake-check <character>-intake.json
node skills/character-refs/scripts/character-refs.mjs gen <asset.json> --tier 1   # anchor only first
node skills/character-refs/scripts/character-refs.mjs gen <asset.json>           # then fill tier 2
node skills/character-refs/scripts/character-refs.mjs render <asset.json> --html > report.html
```

**The core rule: a set of images has only one root — the front full-body anchor.** Only that one is text-to-image; everything else is "anchor + one image-edit instruction". Hair, face, and neckline details additionally hang off confirmed front-facing headshots. Images no longer reference each other — so if any one image comes out bad, you just regenerate that one image, and there is **no cascade**.

Tiered image generation:

| Tier | Content | When to Generate |
|---|---|---|
| 1 | Front full body (anchor) | Always, the first image |
| 2 (default) | Front-facing headshot, 90° profile, back view | Generated by default |
| 3 | Detail images (up to 8) | When there are accessories or close-ups of partial clothing |
| 4 (not default) | 45° headshot | Only when the user explicitly asks |

Why default to tier 2? Measured on H3: **given only a front full body, the clothing and back view are right, but the face distorts; adding a headshot makes the face closest.**

**The model is not locked**: the main image and derived images may use different models — consistency comes from "the same anchor" rather than "the same model" (in testing, Qwen anchor + GPT derived, GPT anchor + Qwen derived, and mixing within a group all connected properly).

**Only three things are frozen**: the anchor file (sha256), the art-style snapshot, and the text-description fingerprint. If any one changes, the images that depend on it are automatically marked "outdated" — marked only, never deleted; all old versions are kept.

---

## 3. Design Philosophy: What This Project Is Really Saying

The following eight points are, in my view, the most valuable part of this repository.

### Philosophy One: Relying on the model's conscience for a checklist does not work

This is the first principle of the entire project, and its source is right there in the README of `novel-outline`, in one sentence:

> **A checklist handed to a model's good intentions is worthless.**

So every gate is a deterministic check inside `validate`, not text for the model to read. 14 gates, 10 gates, 10 gates, 8 gates, 18 gates — 60 gates in total.

The accompanying requirement is even harsher: **every gate has a breach case in the self-tests** — deliberately constructing violating data to confirm the validator really does report it. Proving that it really can block, rather than a fake test that is always true.

No amount of overestimating the weight of this point is enough. The vast majority of "AI workflow" projects stop at "I wrote 20 requirements for the model, it will probably obey them". The requirement here is: **do not write a single requirement for the model to hear; write it for the code.** Model output is probabilistic; only code is deterministic.

### Philosophy Two: Everything that can only be decided at the moment of image generation is moved out of the skill

This is the core of the breaking change in version 2.0, and also the most radical trade-off in the whole project — and the one most easily overlooked.

In the 1.x versions, the characters, art, and storyboard skills generated their own images, chose their own models, set their own art style, and managed their own aspect ratios. Version 2.0 deleted all of that. The reason is written in the changelog:

> **Everything that can only be decided at the moment of generation (which model, which visual style, which aspect ratio) is moved out of the skill; the skill delivers only prompts and structured data.**

The accompanying hard constraint is: **the skill does not generate images.** The README of `novel-art` explicitly says "do not say 'images have been generated' — that step no longer exists; what is delivered is prompts".

Why? Because choosing the model, choosing the art style, and choosing the aspect ratio are **project-level decisions**, not stage-level decisions. The character images and scene images of the same drama should use the same model, the same art style, and the same aspect ratio. If those parameters are scattered across three skills, you either configure them in three places (with the risk of inconsistency) or you have to add a layer of shared configuration (breaking self-containment). Move them out and the dilemma disappears.

The only exception is `character-refs` — it *is* "that moment", so it keeps the ability to generate images. **Rules must make room for exceptions, and an exception must be able to explain why.**

### Philosophy Three: Every skill is self-contained and can be copied away on its own

```
skills/<skill-name>/
├── SKILL.md          the workflow the agent reads (required)
├── README.md         the docs a human reads
├── scripts/
│   ├── <name>.mjs    deterministic helpers, zero dependencies
│   └── selftest.mjs  self-test, never calls a model (required)
├── references/       detailed instructions, loaded on demand
├── examples/         bundled samples that double as test fixtures
└── assets/           screenshots
```

Two hard requirements: `SKILL.md` is mandatory, and `scripts/selftest.mjs` is mandatory and **must not call models or consume quota**.

The accompanying behavioral rules in AGENTS.md are even harsher:

> **A skill must be self-contained and copyable on its own: it depends on no third-party skill (including the official ones). External methodologies are internalized into this repository's own reference documents, with the source noted.**

So the official H3 methodology was internalized into `references/h3-prompt.md` rather than hanging an external dependency on it.

**The cost of this constraint is real**: there is code duplication (the assembler has to solve the 57-class-name style bleed on its own rather than having each skill share CSS variables). The author chose to pay that cost — because a skill that can be lifted out and used on its own is worth far more than the bit of tidiness that eliminating duplication would bring.

### Philosophy Four: The model writes four pieces; the script computes the fifth

In the outline five-piece set, the first four (adaptation notes, character roster, beat table, episode synopses) are written by the model, and the fifth (asset inventory) is **always aggregated by the script**.

The reason in one sentence: "hand-written by the model is guaranteed to miss things."

The same principle is scattered everywhere: the character-position statistics in the report, the list of major beats, the beats carried by the scene overview cards — all are computed, and the model does not write a single word.

**The criterion is very clear: anything that can be computed mechanically must never be handed to the model.** Any job of the "the model has to count, calculate, and cross-check" kind should be code.

### Philosophy Five: Decide first, then refine — being wrong only costs one round

Discussed above; no need to expand. But its shape is worth emphasizing: **this is not a process suggestion, it is a process gate.** Before writing episodes you must pass `validate --stage beats`, and if you fail you are not allowed to continue.

AI pipelines have a special failure mode: small early errors **cascade** and waste a lot of compute. If the skeleton is wrong, all 60 episode synopses are wasted; if the characters are set wrong, the art and script both have to be redone. **Intercepting at the cheapest place is the only sane design for an AI pipeline.**

### Philosophy Six: Consistency comes from "anchors", not from "the same model"

The "one root, everything else derived" approach of the character reference images actually runs through the whole project:

- Scene consistency → 3–5 anchors per scene
- Prop consistency → state variants (one image each for closed/open)
- Character consistency → front full-body anchor, with derived images referencing only it
- Lighting consistency → concrete states derived backward from the episodes, each state becoming a complete prompt
- Cross-episode consistency → the variant mechanism `variantOf`, reusing the parent scene's assets

The unified idea is: **compress the vague thing "consistency" into one concrete file that can be passed along, checked, and versioned.**

### Philosophy Seven: Reconcile Word for Word, Do Not Rely on Human Eyes

Many of the `validate` gates are essentially "word-for-word comparison":

- The alignment instructions in the H3 prompt must be derived from the storyboard structure, not one character off
- Claimed dialogue must appear word for word inside the `<d>` block; changing one punctuation mark fails
- The cut timestamp must equal the cumulative sum of the preceding cut seconds
- The prompt language must be reconciled bidirectionally against `promptLang`

**The word "word-for-word" is the keyword.** What AI-generated things are most prone to is not "completely wrong" but "right, but not entirely right" — off by one word, off by half a second. Such deviations are extremely hard to spot with the naked eye, but on a production line they accumulate into wasted footage. Word-for-word reconciliation turns this kind of deviation into a red light.

### Philosophy Eight: Gate Failures Accumulate, and Stats Tell You Which Rule the Model Violates Most Often

Every `validate` in `novel-storyboard` appends the gate results to a `.gates.jsonl` file in the current directory:

```bash
node scripts/novel-storyboard.mjs stats
```

After accumulating dozens of runs, the statistics tell you **which rule the model most often trips over**, and then you can go change that rule.

This is a self-evolving design. And the author's handling of it is extremely restrained:

> **Gate-failure accumulation currently exists only on novel-storyboard. That is deliberate: run it in a real project for a while, confirm that what `stats` reports really points at the rule that should change, and only then decide whether to extend it to the other five. If nobody ever opens it, the feature should not exist, and spreading it would only copy the mistake five times. Do not proactively propose extending it again.**

**"If nobody opens it for a long time, that means this feature should not exist"** — this sentence carries more weight than it appears to. It admits it might be wrong, and pre-specifies the criterion for "if wrong, delete it". This is a very healthy engineering attitude: the value of a feature is proven by usage, not by the designer's enthusiasm.

The same restraint shows up in the handling of "shot recipes". The recipe card library is an optional mount, and the **suggested shot size and camera movement in the cards deliberately have no gates**; they only add a `≠` marker in the report. The author's reason:

> **A recipe is a vocabulary, not a statute; once an optional mount is made strict nobody mounts it any more, and a gate that blocks wrongly is worse than no gate at all.**

**"A gate that falsely blocks is worse than no gate"** — this line deserves to be framed on its own. Once a quality gate produces false positives, the user's reaction is not "this gate has a bug" but "this tool picks nits, I'm not using it". A gating system that loses trust is equivalent to not existing.

---

## 4. Summary: Eight Opinions

Combined with this project, my own judgment is as follows.

**Opinion One: The real barrier to AI short drama has already shifted from "can it generate" to "can it be accepted".**

Generating a 5-second video with a model is no longer hard. What is hard is this: when running 600 episodes, how do you know that segment 2 of episode 387 has not collapsed. This project writes 60 concrete criteria into code, which is equivalent to turning "acceptance" from human eyeballing into something machine-executable. **Whoever builds this acceptance system first is the one whose production capacity can dare to scale up.**

**Opinion Two: Writing the checklist as code is worth more than writing a hundred prompts.**

This is the most transferable point in the project. It applies to any AI workflow: prompts are soft constraints, code is hard constraints. The difference is not in the strength of the wording but in **whether it can be violated**.

**Opinion Three: To judge whether an AI pipeline is professional, look at who you give the decision-making power to.**

This repository's attitude is very clear: structure, counting, validation, assembly, export — all handed to code. The model only does the two things it is genuinely good at: writing content, and aesthetic judgment. **The clearer the division of labor, the more reliable the pipeline.**

**Opinion Four: Consistency is an asset, not an atmosphere.**

"Atmosphere" is an adjective; "3–5 anchors + state variants + scale reference + sha256 freezing" is an asset. The former may drift on every generation; the latter can be reused across episodes, can be QC'd, and can be versioned. **The final competition in AI content production is asset-management capability, not inspiration.**

**Opinion Five: "Can be copied away on its own" is the litmus test of good architecture.**

Whether a component can be copied away on its own without falling apart exposes its implicit dependencies on context. This repository makes self-containment a hard requirement, at the cost of code duplication, and in return **every skill can be sold as an independent product**. This is a classic "trading controlled duplication for structural freedom".

**Opinion Six: Set "must be decided" as a gate, not as a suggestion.**

The rework cost of AI pipelines is extremely high. If the direction is wrong, everything afterward is wasted. So "decide first, then refine" has to be written as a code gate, not as one sentence on a flowchart. **In any process involving AI, the earlier the decision point, the harder it must be.**

**Opinion Seven: The author's courage in judging "this feature should not exist" is worth more than the features he built.**

"If nobody opens it for a long time, that means this feature should not exist" and "do not proactively bring up extending it" — these two sentences are rare in open-source projects. Most projects only add features; very few pre-write their own cancellation conditions.

**Opinion Eight: The real product of this project is those 1600+ self-test assertions, not those 7 skills.**

1600+ assertions, no model calls, no quota consumed, one second to run, and every gate has a breach case. This is the true asset of the "quality gate system" — it lets any team reuse this methodology on their own content types. **Skills can be copied; methodology cannot, because it grows in the tests.**

---

## 5. What This Means for People Doing Short-Drama Business

If you are a boss using AI to do short-drama business, these points are more practical:

**First, this system directly compresses the "uncontrollable rework rate".** The most expensive thing in AI short drama is not generation, it is "after running 200 episodes you discover the characters collapsed, the scenes broke continuity, and the hook was never paid off". 60 gates turn this kind of rework from "spot-checking after the fact" into "interception before the fact".

**Second, zero dependencies and zero API key mean the trial-and-error cost is almost zero.** Getting a whole pipeline running requires only Node 18+ and your own session quota. The cost of running the outline for a whole book may be lower than buying someone a coffee. **This cost structure suits a "try in bulk first, then concentrate on production" strategy.**

**Third, the boundary of "the script handles the drama, the storyboard handles the shooting" is worth remembering on its own.** Many people doing AI video mix writing the drama with cutting the shots, and as a result changing one line of dialogue forces a re-layout of dozens of shots, with all the time wasted on rework. The cost of separating them is one extra handoff; the benefit is that **the two stages can iterate in parallel**.

**Fourth, the 2–5 second cut duration hard gate is an industry default you can copy directly.** The audience's attention rhythm for short drama, generation cost, and the video model's duration limit — three constraints converge on a single number here. If you shoot short dramas yourself, this number should also be 2–5 seconds.

**Fifth, "a gate that falsely blocks is worse than no gate" is the lesson for every AI tool product.** If you want to sell a similar system to your own team, **the first thing is not adding gates but guaranteeing that the existing gates have zero false positives**. A tool that false-positives once will never be used by the team again.

---

## 6. Final Thoughts

`shuohao-skills` is not an "AI short-drama generator"; it does not even generate video.

What it does is something more fundamental and harder: **define every "what counts as correct" in the AI short-drama production process, and turn those definitions into judgments a machine can execute.**

6800 stars are buying this cognitive density. The 7 skills are the skeleton, the 60 quality gates are the muscle, and the 1600+ assertions are the regression tests. **The truly scarce commodity is not a model that can write prompts, but people who know what "correct" means and can encode it.**

If you are looking for AI short-drama tooling, do not rush to see whether it can produce footage; first see whether it **dares to write the acceptance criteria as code**. That is the watershed.

---

Eric|瑞哥
广东 深圳

✅前IBM架构师｜区块链书《区块链核心技术与应用》合著作者
技术代码仓库:https://github.com/gyc567
个人网站:www.topdigg.com
💼新加坡资管公司前CTO
👉公众号「瑞哥观势」主理人
💎聚焦在:创富和守富
🎯专注老板群体：用AI 降本增效
微信:360369487

---

在这个快节奏的时代，我依然相信面对面、小范围、高浓度的链接力量。

我致力于搭建一个"去泡沫化"的老板圈子，重点关注：

🔹 电商全域：国内直播、跨境电商与出海项目孵化

🔹 创投与产投：金融银行资源对接、企业融资与并购

🔹 内容生态：MCN机构、达人矩阵与品牌整合

🔹 组织建设：企业核心团队搭建、高管寻访

**【我的线下局】**

不办大会，只办"小会"。

✅ 创业私董会：深度剖析商业难题

✅ 老板闭门饭：链接同频灵魂，甚至解决人生大事（高质量单身圈层）

✅ 行业沙龙：聚焦具体赛道，促成实质合作

**筛选标准：**

只欢迎有结果、有边界感、有长期主义心态的创始人/合伙人。

时间宝贵，只留给有价值的人。
