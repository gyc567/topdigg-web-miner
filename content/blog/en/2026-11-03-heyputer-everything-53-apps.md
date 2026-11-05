---
title: "Someone Rewrote Excel, Slack, and Photoshop From Scratch: 53 World-Class Apps in HeyPuter"
description: "A deep dive into HeyPuter/everything: 51 apps, 2.24M lines of code, 8,711 test files, zero frontend frameworks. Full local setup guide, deployment config, six design philosophies, and eight transferable lessons."
date: "2026-11-03"
author: "瑞哥观势"
tags:
  - open source project analysis
  - open source software
  - HeyPuter
  - Everything Project
  - monorepo
  - framework-free frontend
categories:
  - project analysis
  - developer tools
  - software architecture
keywords: ["HeyPuter everything", "Everything Project", "open source spreadsheet", "framework-free JavaScript", "Puter.js", "monorepo architecture", "no backend server", "self-hosted office suite"]
---

# HeyPuter's 53 World-Class Apps: Someone Rewrote Excel, Slack, Photoshop, and AutoCAD From Scratch

Conclusions first.

**First, this is not another "AI wrapper" app — it is a long run that would take a decade to complete.** I cloned HeyPuter/everything in full and went through it application by application: 51 app directories, 48 deployed and live, 2.24M lines of JavaScript / TypeScript, 8,711 test files, and not a single frontend framework (no React, no Vue, no Svelte), with the backend uniformly hanging off a cloud platform called Puter. This is a software empire stacked up the most naive way possible.

**Second, its sharpest move is not feature parity — it is daring to write "no server" into the architecture.** 24 app READMEs all contain the same sentence: "no server of its own". All backend capabilities (accounts, storage, databases, KV, Workers, deployment) come from the Puter platform. That means every app can be dropped onto any static host (AWS Amplify, object storage, your own Nginx) without configuring a single environment variable or requesting an API Key. In SaaS terms, this runs against intuition.

**Third, the vast majority of apps explicitly mark themselves as alpha.** The CAD README's first sentence is "Early alpha, please do not rely on it for real projects, keep your own copies of important work". Records, Wiki, and Expenses carry similar warnings. So the correct way to read this is: treat it as a **public architecture blueprint you can read for free**, not as a drop-in Office replacement.

**Fourth, its most valuable part is not the 53 apps but a complete methodology** for how to build a genuinely usable professional piece of software without writing a backend, without using a framework, and without touching licensing red lines. Below I break that methodology apart, including a hands-on local run tutorial you can use right away.

---

## 1. Project Overview: What Exactly Is It?

### 1.1 One-Line Positioning

The Everything Project describes itself as: "rebuild and open-source the world's software". From Office to Slack, from Photoshop to AutoCAD — redoing every proprietary software's free, open-source alternative, all inside a single repository (mono-repository).

### 1.2 Scale Inventory

Counted from actual files (excluding node_modules, dist, tests, vendor, tmp):

| Dimension | Actual Data |
|---|---|
| App directories | 51 (under src/) |
| Live sites | 48 `*.puter.com` subdomains |
| Main code lines (js/ts/jsx/tsx) | ~2,242,000 lines |
| HTML + CSS | ~243,000 lines |
| Source files | 7,945 |
| Test files | 8,711 |
| Frontend framework dependencies | **0** (no React / Vue / Svelte / Angular) |
| Build tool | Vite (unified) |
| Root repo license | MIT |

Top 10 apps by code size:

| App | Lines | Comparable Product |
|---|---|---|
| 3d | 404,367 | Blender |
| presentation | 252,512 | PowerPoint |
| vector-studio | 158,337 | Illustrator |
| spreadsheet | 154,514 | Excel |
| photo-studio | 151,674 | Photoshop |
| whiteboard | 117,710 | Miro |
| documents | 108,657 | Word |
| video-studio | 70,944 | Premiere Pro |
| pdf | 64,313 | Acrobat |
| audio-studio | 57,416 | Audition |

The single largest app, 3D, exceeds 400,000 lines — and it was hand-written from scratch. This is not the scale of "build a shell and call an API"; this is the core data structures, rendering pipelines, and geometry kernels of professional software, all reimplemented.

### 1.3 Category List

The README divides the 51 apps into 9 categories:

- **Office** (7): Spreadsheet, Documents, Presentation, Whiteboard, PDF, Notes, Records
- **Collaboration** (6): Meetings, Teamchat, Email, Contacts, Calendar, Signatures
- **Creative tools** (6): Photo Studio, Video Studio, Vector Studio, Audio Studio, Music Studio, 3D Studio
- **Engineering** (4): CAD, Parametric, Circuits, Building Design
- **Productivity** (5): Tasks, Projects, Wiki, Time Tracking, Surveys
- **Finance** (4): Accounting, Invoicing, Expenses, Cap Table
- **Business** (13): CRM, Help Desk, Contracts, POS, Inventory, Assets, Hiring, Shifts, Childcare, Field Service, Legal, Fleet, Property Management
- **Developer tools** (1): API Client
- **Games** (5): Chess, Backgammon, Checkers, Solitaire, Sudoku

**The distribution across these 9 categories is itself a requirements list.** Someone seriously counted the global taxonomy of software and then filled in every cell. Behind it is a rare kind of patience.

### 1.4 Licensing: There's a Trap You Need to Know About First

The root repo LICENSE is MIT, but **sub-apps are not uniformly MIT**. Going through each package.json:

- **AGPL-3.0-only (9)**: 3d, building-design, email, notes, pdf, presentation, spreadsheet, video-studio, whiteboard
- **MIT (7)**: accounting, calendar, help-desk, parametric, projects, records, survey
- **Not declared in package.json (the rest)**: mostly fall under the root repo's MIT, but each needs individual confirmation

What does AGPL mean in practice? Anyone who uses the software over a network — even as a SaaS — must be offered the complete source code. That's one step harsher than GPL. If you want to take spreadsheet and build a commercial closed-source product, AGPL will block you outright.

On top of that, the AGENTS.md of the `documents` app contains a hard rule that I think is the single most valuable piece of engineering governance text in the whole project:

> Do not introduce AGPL-licensed code or dependencies (directly, indirectly, vendored, or remotely loaded — none of it). Do not introduce proprietary third-party document engines, including in tests and tooling. Every published binary must have corresponding source and an acceptable license. After dependency changes, run `npm run check:licenses`. **Do not widen the license allowlist just to pass the check — review the actual licenses first.**

That last sentence matters most. It's a guardrail preventing open-source projects from numbing themselves during compliance checks.

---

## 2. Detailed Tutorial

### 2.1 Requirements

| Item | Requirement |
|---|---|
| Node.js | 22.12+ (24 LTS recommended for some apps, 3d explicitly requires 24) |
| npm | Bundled with Node |
| Browser | A modern browser with WebGL2 support (Chrome / Edge / Firefox / Safari) |
| Disk | ~1.8GB for a full clone, more after installing dependencies |

### 2.2 Clone and Run Locally

```sh
git clone https://github.com/HeyPuter/everything.git
cd everything/src/spreadsheet
npm install
npm run dev
```

That's all four steps. No `.env` file, no database init script, no Docker Compose.

The address your browser opens is a little unusual:

```
http://spreadsheet.puter.localhost:5173/
```

**The `puter.localhost` domain is deliberate.** The repo root has `dev/puter-localhost.mjs`, a Vite plugin that rewrites the hostname of the local URL to `<app-name>.puter.localhost` once the server is listening. The logic is simple: browsers resolve all `*.localhost` to the loopback address, and Vite accepts `.localhost` hostnames by default. So there's no need to edit `/etc/hosts` or set up a proxy. **A 20-line plugin solves domain isolation for multi-app local development** — that's a genuinely clean design.

Every app's vite.config imports this shared plugin:

```js
import puterLocalhost from '../../dev/puter-localhost.mjs';
```

### 2.3 Switching to Other Apps

All apps live in the same repo, so switching means changing directory:

```sh
cd ../3d            # 3D Studio, 400k lines
npm install
npm run dev

cd ../documents     # Document editor
npm install
npm run dev
```

### 2.4 You Can Use It Without Logging In

This point is critical enough to deserve its own section. **The vast majority of apps are usable without signing in.**

The Spreadsheet README is explicit:

> Nobody needs to log in to use it: the app opens a new spreadsheet directly, and Puter only asks you to sign in at the first action that genuinely needs the cloud — such as saving, opening files, or listing your spreadsheets. Until then, your edits stay in the tab (and in that browser's local drafts), and the status pill reads "Sign in to save".

Records, Presentation, and CAD all follow the same pattern. What does this mean? It means you can treat the whole suite as a local application in a fully offline state, including:

- Spreadsheet: formulas, charts, and formatting all work
- CAD: open local drawings, save to your device, restore from the browser after a refresh
- PDF: open, edit, and export PDFs locally
- Documents: `/playground.html` runs standalone, with no account and no cloud SDK

Login only happens at four moments: **saving to the cloud, opening from the cloud, collaborative editing, and features that need backend computation** (for example Spreadsheet's `AI()` and `IMPORTDATA()`).

### 2.5 Build and Test per App

Scripts differ slightly between apps; pick what you need:

```sh
# General: unit tests
npm test

# 3d: full check chain (unit tests + type checking + production build + browser E2E)
npm run check

# documents: license check + DOCX conformance check
npm run check:licenses
npm run check:conformance

# pdf: generate third-party notices + build + cross-browser E2E
npm run licenses
npm run build
npm test:e2e

# Whiteboard / general: production build + local preview
npm run build
npm run preview
```

**E2E requires browsers installed first:**

```sh
npx playwright install chromium
npm run test:e2e
```

### 2.6 Deployment: Every App Is an Independent Amplify App

Two files at the repo root define the entire deployment:

**`amplify.yml`** — each `src/xxx` directory is an independent Amplify app, and the root is that subdirectory:

```yaml
applications:
  - appRoot: src/whiteboard
    frontend:
      phases:
        preBuild:
          commands:
            - nvm install 22
            - npm ci
        build:
          commands:
            - npm run build
      artifacts:
        baseDirectory: dist
        files:
          - '**/*'
```

**`customHttp.yml`** defines the caching strategy. Note the critical note in its header:

> Amplify reads request headers for single-repo apps only from this file at the repo root, so each app's headers live in the entry whose appRoot matches its own directory. **Every app deployed from this repo needs an entry here, even if it has no headers of its own: Amplify will fail the deployment of any app it cannot find an entry for.**

The caching strategy itself is worth learning:

```yaml
- pattern: '/'
  headers:
    - key: 'Cache-Control'
      value: 'no-cache, max-age=0, s-maxage=0, must-revalidate'
- pattern: '/assets/*'
  headers:
    - key: 'Cache-Control'
      value: 'public, max-age=31536000, immutable'
```

The entry page is never cached (because Vite output is hashed, but the entry may still point at older assets), while hashed assets are cached forever. This "no-cache entry + immutable assets" combination is standard for any Vite static site, but here it's written into a config file and enforced by CI, rather than relying on people remembering.

### 2.7 Deploying to the Puter Platform

Some apps ship dedicated Puter deployment scripts, for example Spreadsheet:

```sh
npm run deploy:email-worker
```

Teamchat's mechanism is even more aggressive: **every workspace runs its own Worker inside its creator's Puter account.** From the original text:

> When a user first creates a workspace, the app copies its bundled worker package (`public/worker/teamchat-worker.js`) to their drive and calls `puter.workers.create()`. That worker's KV and filesystem hold all of the data.

In other words, multi-tenant isolation for a Slack alternative is implemented as "one independent Worker instance per tenant", with permission checks enforced on every route inside the worker.

### 2.8 Three Deep-Reading Paths

If you only read three documents, read these:

**① `src/documents/AGENTS.md` (27 lines)**: the shortest, but the highest information density. It defines the dependency policy, license red lines, the milestone requirements for the canvas engine, and how OOXML conformance is recorded. The core is a single rule:

> Separate the four concerns: document changes, DOCX serialization, layout, and painting. Preserve untouched DOCX package components. When opening a document with unsupported features, handle it on a best-effort basis; when safe editing is unavailable, fall back to a read-only approximation, **and do not attach a save handler that might discard unsupported content.**

That sentence carries real weight. It admits "I cannot be 100% compatible," but specifies how to degrade gracefully when you can't — instead of silently eating the user's data.

**② `src/3d/ARCHITECTURE.md` (273 lines)**: the module breakdown of an industrial-grade 3D engine. The core concepts are Depsgraph (dependency graph) and COW (copy-on-write) snapshots:

> **Typed arrays are immutable after a single undo push.** To modify one in place during an operation, use `cow(owner, 'key')` from `data/cow.ts` (one copy per undo step), or just assign a new array.

There's also a complete operator registration model:

```ts
registerOperators([{
  idname: 'mesh.subdivide',
  label: 'Subdivide',
  props: [...PropDef],
  poll: (ctx) => bool,
  exec: (ctx, props) => 'FINISHED' | 'CANCELLED' | void,
  undo?: boolean
}]);
```

**③ `src/spreadsheet/README.md` (1,200 lines)**: a document at the level of a "functional specification", and the benchmark for documentation quality across the whole project. It lists 510+ Excel functions by category, including `LAMBDA`'s self-recursion, `GROUPBY`'s grouped aggregation, `PIVOTBY`'s cross-tab pivot, the `@` implicit intersection operator, and `IMPORTXML`'s XPath node extraction. The documentation is detailed enough to use directly as an Excel function manual.

---

## 3. Technical Highlights of Key Apps

### 3.1 Spreadsheet: How Far Does Excel Compatibility Go?

The 510+ functions are just the baseline. The hard parts are these:

**Dynamic arrays**: `UNIQUE`, `FILTER`, `SORT`, `SORTBY`, `SEQUENCE`, `RANDARRAY`, `TRANSPOSE`, `TEXTSPLIT`, `VSTACK`, `HSTACK`, `WRAPROWS`, `TOCOL` all support spilling, `A1#` references the spilled range, and you get `#SPILL!` when the target area is occupied.

**Excel query language**: it directly supports Sheets-style query strings:

```
=QUERY(range, "select A, sum(C) where B > 5 group by A order by sum(C) desc limit 10 label sum(C) 'Total'")
```

**Error messages are product-grade**: `#NAME?` tells you outright "there's no function called SUMM, did you mean SUM?", and `#REF!` points at which sheet is missing. That's not an error report — that's teaching.

**AI written straight into cells**:

```
=AI(prompt, [data])
=TRANSLATE(text, [from], [to])
=DETECTLANGUAGE(text)
```

`AI()` returns `#BUSY!` while thinking, asks the same prompt only once, and re-asks on F9.

**Real .xlsx files**: what you save is a genuine Excel file that opens in Excel, Numbers, and LibreOffice. Round-trip import/export covers Excel's native charts (line, scatter, clustered column, stacked column, Pareto combo), theme colors, date axes, hidden helper sheets, named formula locator labels, and many other details.

**No backend server** — everything runs on Puter.js.

### 3.2 3D Studio: A Clean-room Blender Alternative

This app's ambition is the most alarming: modeling, sculpting, UV, material nodes / geometry nodes / compositor, animation rigging, physics simulation, path tracing and real-time rendering, video editing, motion tracking, Grease Pencil, scripting — **all running in the browser.**

Tech choices: **pure TypeScript + three.js (WebGL2)**, no frontend framework whatsoever.

**Z-axis up, units in meters, angles stored internally in radians.** Property naming follows the widely used `bpy` scripting conventions (`location`, `rotation_euler`, `hide_render`), so animation paths, scripts, and importers map 1:1.

There's a licensing statement:

> This project is independent: this is a clean-room implementation containing no Blender source code, icons, themes, or other assets, is not affiliated with the Blender Foundation, and is not endorsed by them.

A **clean-room implementation** is the hardest kind of cleanliness in software engineering: not "read the source and rewrite it," but "read the spec and docs, then implement from zero." The 3D README has one line that exposes the cost of this approach:

> `.blend` import covers active scenes and common data (not volume, point cloud, or line render settings); unsupported data is reported rather than silently dropped. **Exporting `.blend` is not supported.**

The **AI assistant** design is worth copying: it reads the scene, writes and runs scripts against `bpy`-style APIs (failing scripts roll back), queries the API docs, takes viewport screenshots to self-check, and reads reference images / PDFs / text you attach. **Everything it changes for a single message is merged into one undo step.**

### 3.3 Documents: Reimplementing a Canvas Editor

Not embedding a third-party rich-text editor — writing the rendering engine from scratch.

**Two operating modes**:

- `/playground.html`: a standalone local editor, no account and no cloud SDK required
- `/mock.html`: an in-memory Puter mock, for testing save and reopen
- `/`: uses real Puter cloud storage

**Font metric compatibility**: metric-compatible substitutes are provided for Calibri, Cambria, Arial, Times New Roman, and Courier New. This isn't "looks similar" — it's "lays out identically".

**Feature coverage**: review (comment threads, tracked changes, accept / reject, change bar, review pane), references (TOC, footer footnotes, caption SEQ, cross-references REF / PAGEREF, F9 field update), headers and footers, single and double strikethrough, kerning and style inheritance, contextual spacing, horizontal text scaling from 1% to 600%, character spacing expansion and condensation, baseline shift with symbols, superscripts and subscripts, the OOXML highlight palette, inherited theme colors, tables spanning pages with repeated headers, and floating images (cropping, flipping, rotation, alt text).

**The most important honesty**: the document states plainly what it is.

> This is a limited editor prototype. The page preview uses the saved single-section size / margins and a built-in Noto Sans font, **not a full reproduction of native DOCX layout**. Unsupported structures — fields, comments, revisions, multiple sections, nested tables, floating images, automatic paragraph spacing — are rejected before editing begins.

That last clause is the key: **better to reject explicitly before editing than to let the user discover afterwards that content was swallowed.**

### 3.4 Teamchat: The Permission Design Is More Worth Studying Than the Feature List

In the Slack alternative, the 1,292-line README spends a lot of space on the permission matrix:

**Roles**: owner, admin, member, guest. Guests can be invited individually into a single channel; invite links and invite codes have identical shapes, identical expiry behavior, and identical brute-force budgets. **Guests can only see the channels they're in and the people sharing those channels with them** — they cannot browse, join, or create channels, cannot invite anyone, cannot message strangers, and all of this is enforced by the worker on every route.

**Admins can restrict speaking rights per channel** (announcement channels: everyone is read-only and can react, with a megaphone icon in the sidebar), and **thread reply permissions can be set independently** (everyone / admins only / off). Also enforced by the worker, and members can still edit and delete their own old messages.

**Honest delivery**: the original text says "Delivery is honest: a Puter worker only runs while handling a request" — the worker runs only while it is handling a request. Empty promises don't count as promises.

### 3.5 Whiteboard: Building a "Facilitated Workshop" Into the Product

A whiteboard isn't just for drawing. There's a whole set of meeting facilitation mechanics built in:

- **Live reactions**: 8 emoji float across the canvas, not written to the board and not pushed into the undo history, requiring live peer connections
- **Raise hand**: displayed in raise order, announced to screen readers, and automatically lowered when someone leaves
- **Dot voting**: Miro-style voting on objects, plus badge voting and an accessible list vote; results can be hidden until reveal, with optional time limits, and can be exported to CSV / JSON
- **Private mode**: each person's new sticky notes stay face-down for everyone else until the facilitator reveals them all at once
- **Agenda runner**: ordered frames become steps with durations and notes; once saved as reusable content, the facilitator's own script can be inserted with its original timings
- **Follow-along presentation**: followers only see the current slide, clipped by the frame edges

Anonymous mode hides content and names in the app, and the README states plainly: **they are not encrypted**.

### 3.6 CAD: The Geometry Kernel Is Hand-Written

```
src/
  core/                # Framework-free model (unit-testable)
    schema.js            # Entity and drawing data model
    drawing.js           # Transactional drawing with undo/redo
    spatial.js           # R-tree spatial index for picking, selection, snapping
    tessellate.js        # Entities to display list (styles, blocks, text, fills)
    geom/                # Geometry kernel: intersection, offset, trimming, chamfer...
    text/                # Stroke fonts and text layout
```

The command line supports autocomplete, multiple coordinate syntaxes (`x,y`, `@dx,dy`, `@distance<angle`, direct distance, `<angle` for locked angles), feet/inches and fractional input, twelve object snaps, and polar tracking. DXF import/export (R2000 ASCII) runs in a Web Worker.

### 3.7 PDF: Actually Getting "Deletion" Right

Its secure-deletion logic is written with real restraint:

> Text, image pixels, drawings, links, and annotations under a redaction are **removed from the file, not merely covered over**. Form fields under a redaction are removed everywhere they appear. Any content that cannot be processed conventionally is listed for inspection.

OCR runs locally on the device via Tesseract, adding a layer of invisible text so scanned documents become searchable and selectable. Digital signatures are appended via incremental updates, so earlier signatures stay valid.

---

## 4. Design Philosophy: Why This Is Worth Studying

### 4.1 "No Framework" Is a Position, Not a Cost-Saving Measure

React being 400,000 lines is not the problem — the problem is **whether you can explain why you need it**. This project's answer is: you don't.

The result of Vanilla JS + Vite: no breaking changes from framework upgrades, no hydration issues, no inconsistency between the virtual DOM and the real DOM, and the build output is code you can actually read. For professional software that must be maintained long-term, may be audited, and may need to be ported to other runtimes, that's the safer choice.

**Especially for Documents and 3D, the two most complex apps**, they are the biggest beneficiaries of the "don't write a framework" decision: the document engine needs precise control over the boundary between rendering and serialization, and the 3D engine needs direct control over the WebGL lifecycle. In both scenarios a framework would only get in the way.

### 4.2 "Backend as Platform": Concentrating Complexity in One Place

Every app says "no server of its own". That has three consequences:

1. **Zero configuration on the app side**: no environment variables, no API Keys, no database migrations. Static hosting is enough.
2. **Unified data side**: accounts, permissions, storage, KV, Workers, and deployment all go through one abstraction, so the cost of adding a new app is extremely low.
3. **Naturally collaborative**: because storage and Workers live on the platform side, multi-user sync, data consistency, and permission checks — the hardest parts — are provided uniformly by the platform.

**The price is that apps depend heavily on the platform.** This is an explicit trade-off, not a free lunch. Using Puter.js means your app cannot exist independently of Puter.

### 4.3 "Never Lose Data Silently" Is an Iron Rule Running Through the Whole Project

This principle shows up repeatedly across apps, so I'll pull it out on its own:

- Documents: *"when opening a document with unsupported features, handle it on a best-effort basis… do not attach a save handler that might discard unsupported content"*
- 3D: *"unsupported data is reported rather than silently dropped"*
- PDF: *"any content that cannot be processed conventionally is listed for inspection"*
- Records (alpha): *"features may change and data may be lost"*
- CAD (alpha): *"features may change and drawings may be lost, please keep your own copies"*

**This is a principle that puts "the user's data safety" ahead of "feature demo polish".** Most startups can't do it, because in the alpha stage alpha means lighting up every button. Here they chose to write "please do not rely on it" in the first paragraph of the README, and to refuse at the code level any operation that can't be handled safely.

### 4.4 "Documentation as Specification"

Just look at the documentation structure of the documents app and you know what this practice is:

```
src/documents/docs/
  conformance.md                          # Conformance record
  docx-parity-roadmap.md                  # Gap roadmap vs. Word
  paragraph-property-coverage.md          # Paragraph property coverage
  run-property-coverage.md                # Character property coverage
  field-code-coverage.md                  # Field code coverage
  table-property-coverage.md              # Table property coverage
  theme-structure-coverage.md             # Theme structure coverage
  shape-fill-outline-coverage.md          # Shape fill and outline coverage
  comment-revision-property-coverage.md   # Comment/revision property coverage
  ...(20+ coverage documents in total)
  parity/                                 # Gap lists split by functional area
    chrome.md, collab.md, design.md, draw.md, format.md,
    insert.md, mailings.md, pictures.md, references.md,
    review.md, tables.md, views.md
```

And the rules are strict:

> For every editor feature, record the relevant ECMA-376 / OOXML clauses and the supported subset. Add behavior tests plus independently generated DOCX fixtures, and use `npm run check:conformance` to verify browser exports. **Before declaring a feature complete, fix the differences found during the spec review. Explicitly document the remaining gaps; passing the schema does not mean full OOXML conformance or layout fidelity.**

**"Passing the schema does not mean layout fidelity"** is the most valuable sentence in the entire document set. It punctures a very common form of self-deception in software engineering: matching the data model does not mean the rendered result is right.

The same rigor shows up in the test structure of Documents: there are hundreds of directories under `tests/fixtures/` alone, each one corresponding to a fine-grained feature (`border-round-continuous`, `cjk-wrap`, `script-line-boxes`, `para-line-units-default-24`…). Some fixture directories even have their own README explaining exactly what that feature tests.

### 4.5 "AI Is a Feature, Not the Protagonist"

The most countercultural thing about this project is: **it barely talks about AI.**

In Spreadsheet, AI is a cell function `AI()`. In 3D there's an AI assistant sidebar. In Whiteboard there's an AI integration. But the narrative spine of the entire repo is "rebuilding the world's software," and AI is just one capability among several apps.

Compare that with the current open-source scene, where titles routinely carry "AI-native" and "agentic." This project looks like an old-school craftsman. **But it put its energy where it counts**: 510 Excel functions, 40,000 lines of 3D geometry and rendering, clean data structures, two thousand-plus test fixtures. AI can't produce those, because they require decades of accumulated domain knowledge and patience.

### 4.6 "Write License Compliance Into CI"

`check:licenses` is not a reminder, it's a gate that blocks the build (a `prebuild` hook). And the rules explicitly forbid "relaxing the allowlist just to pass the check."

In an era where AI can generate code in bulk, license contamination is the most likely compliance incident. This rule arrives just in time.

---

## 5. Summary: Eight Transferable Lessons

**Lesson one: the moat of professional software is in the data structures, not the interface.** In those 400,000 lines of 3D code, the core is the data-block tables in `data/types.ts` (objects, meshes, materials, node_groups, actions) and dependency graph evaluation. The UI is the shell; the data model is the life. AI can help you write an interface — it cannot write a mature document object model.

**Lesson two: "no server" does not mean "no architecture" — it means concentrating architectural investment.** This project doesn't re-implement user systems, permissions, and storage in every app; it sinks them into the platform layer and focuses on differentiated features. This is the standard path for platform-style startups, but very few open-source projects dare to be this thorough.

**Lesson three: honest degradation is more valuable than forced compatibility.** Documents would rather reject unsupported structures before editing than fake compatibility that "looks like it opens but drops content when saved." The same judgment shows up in 3D refusing to export `.blend`, and in CAD clearly labeling itself alpha. **Product trust is accumulated this way.**

**Lesson four: documentation quality sets the ceiling of a project.** The 1,200-line Spreadsheet README is itself a product manual; the 20-plus coverage documents of Documents are engineering assets. Compare that with the "Contributing welcome!" emptiness of most open-source READMEs — this project's documentation density is an order of magnitude higher.

**Lesson five: test fixtures get closer to real complexity than unit tests do.** Documents builds a separate fixture directory for every fine-grained layout feature; that's easier to debug regressions from than one big all-in-one test file. **Splitting tests along feature dimensions fits how bugs actually happen better than splitting along function dimensions.**

**Lesson six: make consistency a CI contract.** `amplify.yml` requires an entry for every app, `customHttp.yml` explicitly says "deployment fails if the entry is missing," and `check:licenses` hangs off `prebuild`. **Rules belong in config, not in a wiki.** Wikis go stale; CI doesn't.

**Lesson seven: AI should be a first-class citizen inside the file format.** `AI()` as an Excel function and `TRANSLATE()` as a built-in function are more useful than "adding an AI sidebar." Because what users want is **one step inside a concrete workflow**, not a separate tool they have to switch to.

**Lesson eight: the most rational way to use this project is as an architecture textbook, not as a product.** It says so itself: "Early alpha," "do not rely on it for real projects yet." So the correct way to read it is: **read its AGENTS.md, ARCHITECTURE.md, and conformance.md, then copy its judgment in scenarios where you have real business constraints — not just copy its code.**

---

## 6. The Boss's View: What Does This Code Have to Do With Business?

The above is all engineering perspective. People who run businesses might ask: what's in this for me?

**First, it's a feature list bought with real money.** 53 apps cover the full chain from personal productivity to enterprise operations. If you've been in a category for years with no good open-source option, look at this list — you may just find a ready-made starting point.

**Second, it proves one thing: the cost of producing software is collapsing, but you need to see clearly which part is collapsing.** The cost of writing a 400,000-line 3D engine or a 250,000-line PPT engine will keep falling with AI assistance. **But the edge cases in those 510 Spreadsheet functions, and the spec knowledge behind the hundreds of Documents fixtures, will not appear automatically just because AI got stronger.** AI can write implementations; it can't write "knowing which spec clause needs to be covered."

**Third, "not writing a backend" is becoming a viable architectural style.** If in your business every app builds its own user system, permissions, and storage, you'll exhaust your patience on the third app. This project's approach: sink them into a platform layer. **For a SaaS boss, that's a rearrangement of your cost structure, not a preference in technology selection.**

**Fourth, and the most valuable: data sovereignty can be engineered.** "Your files live on your own cloud" sounds like marketing, but at the implementation level it's a set of concrete decisions: storing real `.xlsx` instead of a private format, using real `.docx` instead of an in-house structure, never losing data silently, providing complete export paths. For a boss serving enterprises, **this means your customers aren't locked in, and your product isn't held hostage by the platform's policy changes.**

---

## 7. Closing Thoughts

After going through this repo, my strongest feeling isn't "these apps are amazing" — it's **a sense of patience I haven't felt in a long time.**

53 apps, each implemented from scratch, none of them a wrapper. A 400,000-line 3D engine, 8,711 test files, hundreds of layout-feature fixtures, 20-plus OOXML coverage documents. Without AI helping, how much money and how many years would it take a company to produce these? Now all of it lies on GitHub, mixing MIT and AGPL, free of charge.

This isn't a "disrupt Microsoft Office" story. It's a plainer and more respectable story: **someone decided to do a hard thing properly for a long time, and then put it where everyone can reach it.**

As for whether to use it? My advice: **take the code freely, read the docs carefully, run the alpha parts cautiously, and read the licenses first.** Those four sentences happen to be the best things this project has to teach us.

---

## Appendix: Core Resource Index

| Purpose | Path |
|---|---|
| Project overview | `README.md` |
| License and dependency red lines | `src/documents/AGENTS.md` |
| 3D engine architecture | `src/3d/ARCHITECTURE.md` |
| Functional specification benchmark | `src/spreadsheet/README.md` |
| OOXML conformance record | `src/documents/docs/conformance.md` |
| Multi-app deployment config | `amplify.yml` / `customHttp.yml` |
| Local domain plugin | `dev/puter-localhost.mjs` |

> Related Chinese translations have been synced to the `docs/everything-translations/` directory of the public code repository, containing complete Chinese translations of 9 documents: the project overview, Spreadsheet, Documents, 3D Studio, CAD, Teamchat, PDF, the 3D architecture, and the dependency spec.

---

**Scope note**: This article is compiled from the public HeyPuter/everything repository at commit `f45527dee1f82c816849e6a3854c09da591f50b8`. Line counts, file counts, and test file counts were measured locally after a full clone, using one consistent baseline that excludes node_modules, dist, tests, vendor, and tmp directories; per-app line counts use the same baseline. Licensing information was checked one by one against the `license` field in each sub-app package.json and the LICENSE files in the repo, and the mix of MIT and AGPL-3.0-only is stated accurately. Application feature descriptions, limitation notes, and warnings (such as CAD's "Early alpha" status, the 3D clean-room declaration, and the lack of .blend export) are translated from the official READMEs without embellishment. The Chinese translation of the documentation has been published in the `docs/everything-translations/` directory of the companion code repository, 9 documents in total. The discussion of design philosophy, synthesized insights, and business implications is my own judgment and does not represent the project's official position.

Eric|瑞哥
Shenzhen, Guangdong

✅ Former IBM architect | Co-author of the blockchain book "Core Technologies and Applications of Blockchain"
Tech code repository: https://github.com/gyc567
Personal website: www.topdigg.com
💼 Former CTO of a Singapore asset management company
👉 Principal of the WeChat public account "瑞哥观势"
💎 Focus: creating wealth and preserving wealth
🎯 Focused on founders: using AI to cut costs and boost efficiency
WeChat: 360369487

---

In this fast-paced era, I still believe in the power of face-to-face, small-scale, high-density connections.

I'm building a "de-bubbled" circle of founders, focused on:

🔹 Full-funnel e-commerce: domestic livestreaming, cross-border e-commerce, and overseas project incubation

🔹 Venture capital and industrial investment: financial and banking resource matching, corporate financing and M&A

🔹 Content ecosystem: MCN agencies, creator matrices, and brand integration

🔹 Organizational building: core team formation, executive search

**【My offline gatherings】**

No conferences, only small meetings.

✅ Founder private board: deep-dive analysis of business problems

✅ Founders' closed-door dinners: connecting like-minded souls, and even solving life-defining matters (a high-quality singles circle)

✅ Industry salons: focused on specific tracks, driving real collaboration

**Selection criteria:**

Only founders and partners with results, a sense of boundaries, and a long-term mindset are welcome.

Time is precious, and it is only for people who bring value.
