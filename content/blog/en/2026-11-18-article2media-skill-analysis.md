---
title: "article2media With 435 Stars: What It Is Actually Worth Is Not That AI Can Write, But That It Turns 'Something Feels Off' Into Metrics a Script Can Block"
date: "2026-11-18"
description: "article2media is an open source project with 435 stars and 65 forks that turns one article or one video into Xiaohongshu image posts, magazine long images, WeChat official account layouts and AI voiceover videos. The real value is not its 10 capabilities but its acceptance discipline, which turns vague feedback like 'too rushed' into machine-checkable numbers such as 4.5 characters per second."
author: "瑞哥观势"
tags:
  - open source project analysis
  - AI content production
  - Claude Code Skill
  - automated acceptance
categories:
  - AI应用
keywords:
  - article2media
  - Claude Code plugin
  - AI content pipeline
  - automated acceptance system
  - Xiaohongshu image posts
  - voiceover video generation
source:
  original:
    name: "瑞哥观势"
    url: "https://mp.weixin.qq.com/s/xxxxx"
---

# article2media With 435 Stars: What It Is Actually Worth Is Not That AI Can Write, But That It Turns "Something Feels Off" Into Metrics a Script Can Block

**Conclusion first:** On GitHub there is an open source project called article2media with 435 stars and 65 forks. What it does is turn one article or one video, with a single command, into Xiaohongshu image posts, magazine long images, WeChat official account layouts, and AI voiceover videos you can publish directly.

It has 10 capabilities, 12 themes, automatic acceptance (acceptance) for every kind of output, zero npm dependencies, and needs nothing but Node 22 and a Chrome.

But if you look at it as "yet another AI writing tool," you will read its real point wrong.

**What is most worth copying for a business owner is not the 10 capabilities, it is the acceptance discipline: turning vague feedback like "too rushed," "it keeps flickering," and "this theme is bad" into machine-checkable metrics like 4.5 characters per second, 0 flicker events, and 0 layout errors.**

This whole system can be moved straight into your own content team, your AI toolchain, and the SOP you deliver to clients. Let me take it apart for you.

---

## 1. Project Overview: What Exactly Is It

article2media is a set of open source Claude Code / Codex Skills, and at the same time a Claude Code plugin.

The author is LeiLiu (GitHub: threerocks), MIT licensed, the repository was created on November 8, 2026, and it reached 435 stars within a week. The repository is JavaScript, with 77 .mjs files and about 12400 lines of code.

Its inputs are:

- Articles: X (Twitter) long posts, threads, any web page, WeChat official account articles, local Markdown, or text you paste in directly;
- Videos: Douyin, YouTube, Bilibili links, local video or audio, `.srt` / `.vtt` subtitles.

Video is first converted into a verbatim transcript article, and everything after that follows exactly the same flow as an article.

Its outputs come in twelve forms:

| Output | Specification | Where it fits |
|---|---|---|
| Summary long image | 1080 wide single column mobile version, 1 to 4 pages; add `--wide` for a 1200 wide two column magazine version | WeChat, Moments, Weibo |
| Card set | Xiaohongshu 3:4 (1080×1440), also 4:5, 1:1, 9:16; 6 cover layouts, with room for full page pull quotes, large numbers, and full page images | Xiaohongshu, IG, Douyin image posts |
| Multiple cover versions | Several covers from the same article, with different layouts or different hooks | Pick a cover, publish separately, compare results |
| Lightweight forms | One page read, quote image, question and answer card | High frequency updates, driving traffic to a whole card set |
| WeChat official account layout | Inline styles, embedded images, paste directly into the editor; also a 2.35:1 header image and a 1:1 cover | WeChat official account |
| Voiceover video | 1080×1920 vertical, word by word synchronized animation, local AI voiceover with subtitles | Douyin, WeChat Channels, Xiaohongshu video |
| Original long image | Not one character changed, layout only | Preserving the full original |
| Original cards | The full text paginated into cards in order | Publishing the full text to Xiaohongshu |
| Full translation | Foreign text translated paragraph by paragraph into Chinese, structure matched block by block | Repurposing foreign content |
| Whiteboard argument | One vertical reasoning spine: problem, premise, evidence, contradiction, turn, conclusion | Seeing how the author reaches the conclusion |
| Comic | Black and white panels, characters consistent across the story | Explaining a mechanism through a story |

**The key design is "capabilities are independent, composition is free."** Each of the ten capabilities is a standalone skill, and they only hand work to each other through files in the working directory: `article.md` (original), `article.zh.md` (translation), `content.json` (rewritten draft), `rewrite.md` (the rewritten draft in article form).

So you can fetch only, translate only, or lay out only. You can also finish the long image, the Xiaohongshu cards, and the WeChat official account layout in one pass.

---

## 2. Detailed Tutorial: Getting the First Output Running From Scratch

### Step 1: Install

The recommended route is the Claude Code plugin, which installs all 11 skills at once:

```bash
claude plugin marketplace add threerocks/article2media
claude plugin install article2media@article2media
```

You can also use the skills CLI, which installs for Claude Code and Codex at the same time:

```bash
npx skills add threerocks/article2media -g -a claude-code -a codex -y
```

`-g` means a global install (Claude Code installs into `~/.claude/skills/`, Codex installs into `~/.agents/skills/`); without `-g` it only installs into the current project. `-y` skips confirmation, `-l` only lists without installing.

If you install manually, note one thing: **the repository root is not the skill directory, you need to sync the entire `skills/` directory**.

```bash
git clone --depth 1 https://github.com/threerocks/article2media.git ~/code/article2media
rsync -a ~/code/article2media/skills/ ~/.claude/skills/
rsync -a ~/code/article2media/skills/ ~/.agents/skills/
```

If you copy only a single capability without `article2media` next to it, the script will immediately report that it cannot find the shared engine, because the scripts for all capabilities live in `article2media/engine/`. You can also point at it with the environment variable `ARTICLE2MEDIA_ENGINE=/path/to/skills/article2media/engine`.

### Step 2: Check the Environment

```bash
bash scripts/install.sh
```

This script only tells you what is missing and how to install it, **it does not download a single thing by itself**.

It checks: Node 22+ and any Chrome / Chromium (required), ffmpeg (for voiceover video), Codex CLI login or an OpenAI / Gemini key (for AI illustration and comic), Apple Silicon plus mlx-audio plus VoxCPM2 (for local voiceover), mlx-whisper (for word level alignment and transcription of video without subtitles), yt-dlp (for YouTube and Bilibili subtitles).

On a mainland China network, theme fonts by default load from Google Fonts and jsDelivr, which frequently fails to pull through. When that happens, run this once:

```bash
node skills/article2media/scripts/fonts.mjs
```

About 65 MB. It mirrors the theme fonts into a local cache, and after that no image generation needs the network. The rendering process itself never downloads anything.

### Step 3: Call It Inside Claude Code

For one command combinations, use the main entry point:

```
/article2media https://x.com/thedankoe/status/2117664712532123680
/article2media https://example.com/post xiaohongshu
/article2media ./my-essay.md wechat
/article2media https://x.com/… translate to Chinese and publish to wechat
/article2media https://x.com/… long image, xiaohongshu and wechat all needed
/article2media https://www.bilibili.com/video/BV… xiaohongshu
/article2media links.txt batch, xiaohongshu and long image for each
```

You can also call a single capability directly (in the plugin the names carry the `article2media:` prefix):

```
/article2media:wechat-layout ./my-essay.md
/article2media:image-cards ./my-essay.md original text cards
/article2media:video-transcript https://www.bilibili.com/video/BV…
/article2media:article-translate article2media-out/x-…/article.md
```

Outputs are written to `article2media-out/<slug>/` under the current directory.

### Step 4: Run the Scripts Directly, Without Claude

Every capability has its own script entry point, and none of them requires Claude to run:

```bash
K=skills
node $K/article-fetch/scripts/fetch.mjs "https://x.com/…/status/…"
node $K/video-transcript/scripts/transcribe.mjs "https://www.bilibili.com/video/BV…"
node $K/article-rewrite/scripts/check.mjs <slug>/content.json
node $K/article-rewrite/scripts/export.mjs <slug>/content.json
node $K/long-image/scripts/long.mjs <slug>/content.json --theme all
node $K/image-cards/scripts/cards.mjs <slug>/content.json --ratio 3:4
node $K/image-cards/scripts/cards.mjs <slug>/content.json --covers
node $K/wechat-layout/scripts/wechat.mjs <slug>/article.md --theme quiet
node $K/explainer-video/scripts/video.mjs make <slug>/video/video.json
node $K/logic-whiteboard/scripts/whiteboard.mjs <slug>/article.md
node $K/article-comic/scripts/comic.mjs make <slug>/comic.json
```

The long image and cards also support `--out <dir>`, `--page 1,3`, `--scale 2`, `--format jpeg --quality 90`, `--max-height 7600`, `--brand brand.json`, `--issue 13`, `--html-only`. The WeChat official account layout has `--title`, `--digest`, `--cover-title`, `--kicker`, `--hero` as well.

### Step 5: Batch Processing and the Publishing Loop

In batch mode, put the links into a text file:

```bash
node $K/article2media/scripts/batch.mjs init links.txt --name this-week --spec "cards:3:4,long,wechat"
node $K/article2media/scripts/batch.mjs next this-week
node $K/article2media/scripts/batch.mjs checklist this-week
```

`batch.mjs init` handles fetching and builds the board. Claude works through `next` one item at a time, finishing one article before starting the next. Items where fetching failed, where the body is too short, or that look like a paywall are listed separately for you to confirm, and they never block the whole batch.

Once an article is done, there is a publishing checklist `publish.md`: upload order, alternative titles, body copy, tags, and checks against platform hard limits (Xiaohongshu title no more than 20 characters, body no more than 1000 characters, no more than 18 images; WeChat official account title no more than 64 characters, digest no more than 120 characters).

After publishing, feed the data back to it:

```bash
node $K/article2media/scripts/stats.mjs add <slug> --platform xhs --views 1200 --likes 80 --saves 150
node $K/article2media/scripts/stats.mjs report
```

The report compares save rate and engagement rate across themes and cover layouts, by platform. **Any group with fewer than 5 samples is explicitly labelled "sample too small, for reference only"**, so you are never asked to draw conclusions from the difference between two or three posts.

### Step 6: Self Testing (If You Change the Code Locally)

```bash
node tests/run-all.mjs --quick
node tests/run-all.mjs
node tests/unit.mjs
node tests/visual.mjs
node tests/eval-score.mjs <dir> --ref <dir>
```

`run-all.mjs` is the self test matrix: 4 sample articles times 7 layouts times 12 featured themes, 504 renders in total, and every one of them must produce 0 layout errors. `visual.mjs` is pixel level visual regression, and `eval-score.mjs` is the quality scoring used when you swap models.

---

## 3. Three Paths: Original, Summary, Translation

This is the most consequential design decision in the whole project, and the one a business owner can most easily copy.

Many tools have only one "AI summary" button, and if you want the original text they cannot help you. article2media turns this into an explicit routing rule.

| What you said | Which path it takes |
|---|---|
| Layout, original, full text, do not change a character, as is, `-f` | Original path: hand it straight to the presentation capability |
| Summarize, distill, rewrite, key points, the useful stuff | Rewrite path: run `article-rewrite` first, then present |
| Translate, translate to Chinese, repurpose foreign content | Translation path: translate the full text first, then present through the original path |
| None of the above, and you want a long image or cards | Rewrite by default |
| None of the above, and you want a WeChat official account | Original text layout by default |
| You take the original path, but the source language differs from the target language | Translate first, then do original text layout |

**There is a counterintuitive default here: the WeChat official account does not summarize by default.**

In other words, if you drop someone else's article into it and say "publish to WeChat", what you get back is a layout of the original text with not one character changed. Only when you explicitly say "summarize" does it rewrite.

**What this means for a business owner:** In a team that makes content, the most likely accident is not an ugly layout, it is the sentence "AI, help me summarize this a bit." Summarize once and one layer of the author's intent falls off, by the third layer it has become the empty language of success studies. Setting the default to "do not summarize" is equivalent to installing a door that does not overstep by default.

---

## 4. Design Philosophy: Six Hard Rules

### 1. Content And Style Are Separated

A theme is just a set of CSS variables plus a small amount of structural override. Switching themes only requires re-rendering, never rewriting content.

That means the same `content.json` can be rendered into any of the 12 featured themes, and can simultaneously produce a long image, cards, and a WeChat official account layout.

### 2. Zero npm Dependencies

It uses only the WebSocket and fetch built into Node 22, and drives the Chrome already on your machine directly. No puppeteer, no playwright, no package that needs to download a browser.

### 3. No Text Inside The Images

This is the single cleverest decision in the whole project.

One of the biggest problems with AI generated images is that Chinese characters get drawn wrong. The approach article2media takes is: **generated images contain no text at all**. All text, including titles, chart labels, comic dialogue, and video subtitles, is laid out in HTML and then captured with headless Chrome.

Two consequences follow. Characters never garble and can be changed at any time. More importantly, **the program can read the rendered text back and check it**.

### 4. Capability Detection, No Coercion

Image generation (Codex CLI to OpenAI to Gemini), local voiceover (VoxCPM2 to edge-tts to system speech), word level alignment, video transcription: all of them are detected first and then selected. If something is missing, it degrades or it tells you exactly what is missing, and **it never automatically downloads or installs anything**.

### 5. The Model Judges, The Scripts Measure

Claude handles understanding and writing: planning the structure, rewriting titles, deciding which section gets a bar chart and which gets a flow chart, checking the numbers. What it produces is a `content.json` that contains content only, with no styling whatsoever.

Layout, screenshots, voiceover, alignment, mixing, and acceptance are all handed to scripts.

### 6. Compliance First

All 6 bundled voices are designed purely from written descriptions and imitate no real person. Cloned voices stay in a local personal voice library, and the review step reminds you to confirm authorization when you use them. The first frame and the MP4 metadata of a finished video both carry the AI generated label, and every image is credited to the original source.

On the subject of voice, the project's conclusion is sober: **running AI over a cloned voice one more time does not produce a new voice.** The basis is Article 1023, paragraph 2 of the Civil Code (the rules protecting the voice of a natural person apply by reference to those protecting the portrait right), together with a 2024 April ruling by the Beijing Internet Court (if an ordinary listener can tell from an AI synthesized voice who it is, that voice is protected in the same way). So the voice library is split into two layers by copyright: public voices ship with the project, and the local personal voice library is for the owner alone.

---

## 5. Automatic Acceptance: Every Output Has Its Own Checker

This is the most fundamental difference between this project and "letting AI generate the image directly".

The worst thing about AI generated output is that it "looks about right". So every kind of output has its own acceptance, and if it does not pass, the script reports an error and exits, instead of handing it to a human to hunt for problems by eye.

| Output | Checks |
|---|---|
| Rewritten draft (compared against the original) | Numbers that cannot be found in the original, someone else's article rewritten in the first person, original images left unused, how much of the original's specific numbers, names and tool names actually made it in, ordinary English words mixed into Chinese; body too thin, too few data panels and full page cards, large numbers not matching the title, the same sentence repeated, "what to avoid" written as what to do, the footer describing the production process, no alternative titles |
| Summary long image, cards, covers | Text overflow, truncation, overlapping elements, a single character on its own line, page too tall, image failed to load, font checked by family, card overflow, chart too small, anything automatically dropped |
| Original long image, original cards, WeChat official account layout | Block by block comparison against the original block ledger (including card stitching across cards), parse coverage, source SHA-256 lock, the actual font in use, card overflow, page count limits, leftover styles in the WeChat output, title length |
| Full translation | Block count and structure matched block by block, code and images left as they are, suspected untranslated or dropped sections, whether any numbers were lost |
| Whiteboard argument | The argument ledger: every paragraph of the original must enter some step, or the reason for dropping it must be stated |
| Comic | Dialogue, narration and sound effect text do not cross the panel boundary |
| Voiceover video | Safe area, first sentence no longer than 5 seconds, first frame no longer than 2.5 seconds, static picture no longer than 5 seconds, narration speech rate, subtitle dwell time and flicker, frame by frame subtitle drop in the finished video, sentence by sentence voiceover quality check, loudness |
| Publishing checklist | Xiaohongshu title no more than 20 characters, body no more than 1000 characters, no more than 18 images; WeChat official account title no more than 64 characters, digest no more than 120 characters |

Every script reports line by line with `✓ / ⚠ / ✗`, and finally summarizes into "layout check: N errors, M warnings". **If there is any error, the script exits with a non zero code.**

The harshest of these is the "original block ledger". Every visible text block is registered in the ledger, and after rendering, each block is read back and compared in the browser. **Change one character, reorder once, drop one block or repeat one block, and it fails.**

---

## 6. Summary: 8 Observations And What They Mean For A Business Owner

### Observation 1: The essence of this project is an "acceptance system", not a "generation system".

The ten capabilities are the skin, acceptance is the bone. Anyone can attach a model to generation, but acceptance discipline takes thousands of iterations.

**For a business owner:** When you evaluate any AI tool, first look at how it "knows it made a mistake". If it cannot answer, the quality of the output rests entirely on your own eyes, and one team can only produce three items a day.

### Observation 2: Translating "something feels off" into metrics is the only way to scale high quality work.

The project's author recorded this piece of feedback: "the overall speech rate of a commentary must never be too rushed, that is the great taboo." They did not just change code. They measured the speech rate of a reference audio file, set the standard at about 4.5 characters per second, judged a segment above 5.2 characters per second as too fast, regenerated too fast sentences with a different seed, and if it was still too fast, slowed it down while keeping the pitch. After the change, the narration on the same video went from 5.97 characters per second to 4.27.

**That rule is now written into the review script. Next time anyone changes the code, the machine will remember the phrase "too rushed" on their behalf.**

**For a business owner:** Feedback like "this is not refined enough" and "this feels off" in your team stays mystical forever if it cannot become a number, and forever depends on one particular person watching. Quantifying them one by one is the cheapest step in industrialized content production.

### Observation 3: Machine checks are mandatory, and human eyes cannot be skipped either.

When the project built its new Chinese style theme it chose a good looking title font, and the layout check passed completely. But a human looked at the finished product and every instance of the character "hui" was a solid black block. The font file itself was broken, and the program could not detect it.

Since then, every new font is tested first with the characters "hui tu guo yuan pin qi e".

**For a business owner:** Your quality control process needs both automatic checks and human spot checks. Automatic checks alone will miss the category that "passes technically but is uncomfortable for a human to look at"; human checks alone will not scale the output.

### Observation 4: The fact that a feature can be built does not mean it should be.

Background music was tried three times: an online royalty free library, program generated chord beds, and local AI composition (the model alone is 11 GB). In the end none of them was kept.

The reason is simple: it is too heavy, and adding background music inside a platform app takes only a few seconds.

**For a business owner:** This is the most valuable trade-off I saw in the entire project. The easiest mistake when a team builds an AI toolchain is "add every feature that can be added". Every feature you add brings one more maintenance cost, one more failure point, one more entry point the user does not know how to use. **Subtraction is harder than addition, because addition gets praise and only you benefit from subtraction.**

### Observation 5: Compliance has to be right on day one, and the cost of fixing it later is far higher than getting it right at the start.

**For a business owner:** If your AI toolchain touches client data, asset copyright, or voice and portrait rights, the price of a late remediation is ten times the price of writing the rule correctly in the first place. This applies to every AI solution you deliver to a client.

### Observation 6: Swapping models is something you measure, not something you guess.

The project ships with a model swap regression test: it compares how Haiku and Opus rewrite 3 articles into Xiaohongshu cards.

The result: at the rule level (objective score), Haiku went from 70% to 95% against Opus, and above 100% once the rules held; at the reader level (blind evaluation, where nobody knows which group produced what, with three rounds of swapped positions), Haiku reached 85% to 91% of Opus, averaging about 88%. The gap is mostly in understanding: missing the core method of the original, conflating two similar numbers, putting the image in the wrong section.

**For a business owner:** This is the realistic ceiling of "a small model writes and a large model reviews", and it is 88%. Do not expect switching to a cheaper model to save money until you have measured the dimension you actually care about.

### Observation 7: Defaulting to "do not summarize" is a more important design decision than defaulting to "be smarter".

**For a business owner:** When you deliver an AI workflow to a client, the first thing you should do is set the default behaviour to the most conservative option. Give users what they explicitly ask for.

### Observation 8: The sign that a feature is well built is that it has a closed loop.

Image generation is only half of it. Around "publish it and have it work", the project built a whole set: multiple cover versions, brand kits, lightweight forms, batch processing, publishing checklists, and publishing data records with comparison reports. The data stays on your machine, and once enough samples accumulate, the theme selection guide treats it as the deciding factor between two equally good options.

**For a business owner:** This is the broken link between content and distribution. The vast majority of content teams produce the content, drop it into the publishing tool, and never look back at the data, so you never know which approach works. **A closed loop does not need a large system; recording 10 data points is enough to start.**

---

## 7. A Few Boundaries That Have To Be Stated Clearly

- **Local voiceover**: VoxCPM2 currently only runs on Apple Silicon. Other machines use edge-tts or system speech.
- **Image generation**: AI illustration and comics need image generation capability, either a Codex CLI login (a ChatGPT account is enough) or a paid OpenAI or Gemini key.
- **Background music**: videos currently have no background music, you add it yourself inside the platform app.
- **Fetching from X**: it depends on FxTwitter, and when that is unavailable you need to paste the body text manually.
- **Video input**: local speech recognition needs Apple Silicon. YouTube sometimes asks for a login confirmation on some networks, and Douyin sometimes needs browser cookies, so either you agree to reuse the browser state (`--cookies-from-browser chrome`), or you save the video locally and pass the file.
- **Listening feel**: the final judgement on timbre and speech rate still has to come from a human ear.
- **Codex sandbox**: Chrome is not allowed to start by default, and image generation will report "Chrome exited unexpectedly", so this step has to be allowed.

One more detail is worth recording: when converting video to text, **the machine translated subtitle track and Bilibili bullet comments are both unusable**. The first is not the speaker's own words, the second is audience commentary. The order of trust for text sources is: human subtitles, platform generated automatic subtitles in the original language, local Whisper recognition.

---

## 8. If You Only Copy Three Things

### First copy: give every AI output a checker that "exits non zero when it fails". Even five rules are better than relying entirely on human eyes.

### Second copy: turn the 3 to 5 feelings that come up most often in your team's spoken feedback into measurable numbers. "Too rushed" becomes 4.5 characters per second, "it keeps flickering" becomes 0 flicker events, "it is too long" becomes 15 seconds.

### Third copy: set the default behaviour conservative. No summarizing, no polishing, no filling in the gaps. Give it only when the user asks.

None of these three requires you to install Node 22 first, or own a MacBook Pro, or get Codex logged in. **You can try the first one in your own content pipeline this afternoon.**

This project itself, I read as an honest experiment. It proves one thing: **what is genuinely scarce in AI content production is not capacity, it is judgement**. Anyone can build ten capabilities. Writing that judgement down as rules and letting the machine keep watch for you is the moat.

---

## Complete Reference Material On This Project

I translated its English documentation into Chinese. The repository address is above (github.com/threerocks/article2media), MIT licensed, the author is LeiLiu.

I put the Chinese translation in the `docs/article2media-zh/` directory of my own repository, containing three files:

- `CLAUDE.zh.md`: a full translation of the repository development conventions, 88 lines of English, covering architecture, directory structure, coding conventions, and how to test;
- `README-en.zh.md`: a translation of the English introduction section of the README;
- `README.md`: an index of the translation, explaining the translation principles and the language situation of the upstream documentation.

One note in passing: the overwhelming majority of the documentation in this repository is already written in Simplified Chinese (11 SKILL.md files, 15 references documents, the CHANGELOG, and the long project introduction). Only two documents need translating: CLAUDE.md and the English section of the README.

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
