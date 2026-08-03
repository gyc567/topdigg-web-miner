---
title: "shiki-stream Deep Dive: Let LLM-Generated Code Highlight in Real Time, Like a Typewriter"
description: "A complete analysis of shiki-stream, open-sourced by Anthony Fu (antfu) — a streaming syntax-highlighting library built on Web Streams API, purpose-built for the 'LLM-generated code' scenario. From the core insight that code arrives progressively so highlighting must be progressive too, to CodeToTokenTransformStream turning a text stream into a token stream on the fly, from the clever recall-token mechanism that solves the 'syntax depends on context' problem, to out-of-the-box Vue/React/Solid/Svelte renderers and full install/usage tutorials — this article explains why this 594-star project became the official @shikijs/stream."
date: "2026-08-03"
author: "TopDigg Research Team"
tags: ["shiki-stream", "Shiki", "Syntax Highlighting", "Streaming", "LLM", "Web Streams API", "anthu", "Vue", "React", "Solid", "TypeScript", "CodeToTokenTransformStream"]
categories: ["Deep Dive"]
keywords: ["shiki-stream", "Shiki streaming highlight", "syntax highlighting", "streaming output", "LLM code highlight", "Web Streams API", "CodeToTokenTransformStream", "Recall Token", "Anthony Fu", "@shikijs/stream", "incremental rendering", "AI code display"]
---

# shiki-stream Deep Dive: Let LLM-Generated Code Highlight in Real Time, Like a Typewriter

> Core idea: **"Code arrives progressively, so syntax highlighting must work progressively too."** When an LLM spits out code one character at a time — just like a typist — the traditional "wait for the full code before highlighting" approach breaks down. shiki-stream answers elegantly with **Web Streams API**: it turns a text stream into a token stream on the fly, coloring code the moment it's produced, and introduces a **recall-token mechanism** to solve the trickiest problem of streaming syntax highlighting — the fact that syntax depends on context.

---

## 1. Project Overview

### 1.1 What Is It?

**shiki-stream** is a **streaming syntax-highlighting library** open-sourced by Anthony Fu (antfu) — a streaming/incremental-highlighting wrapper built around the Shiki syntax-highlighting engine.

The official one-line description:

- **"Streaming highlighting with Shiki. Useful for highlighting text streams like LLM outputs."**

Key facts:

- Repository: `https://github.com/antfu/shiki-stream`
- Stars: **~594**
- Author: **Anthony Fu (antfu)** — Vue core team member, Vite core contributor, author of UnoCSS, Slidev, Vitesse
- License: MIT
- Language: TypeScript / JavaScript
- Created: February 2025
- Status: **Archived** — because the implementation moved to Shiki's official `@shikijs/stream`
- Live demo: https://shiki-stream.netlify.app/

### 1.2 What Problem Does It Solve?

Imagine using ChatGPT or Claude to generate code: **the AI does not output a whole blob at once — it goes character by character, token by token, like a typewriter.** Traditional syntax highlighters — including native Shiki — assume "you have the complete code," which breaks in streaming scenarios:

- **Code arrives progressively** — at each moment you only have a fragment;
- **Parsing depends on context** — earlier characters can change the meaning of later ones (e.g. a line starting `// ` swallows everything after it; an unclosed string/bracket affects what follows);
- **Rendering must be instant** — users don't want to wait for the whole stream before seeing highlights.

shiki-stream's answer: **use the standard Web Streams API to convert a string stream into a highlighting token stream in real time**, so highlighting runs in parallel with generation.

---

## 2. Core Philosophy

### 2.1 From "Bulk Highlighting" to "Streaming Highlighting"

The traditional pipeline was:

**Full code → tokenize once → color once**

shiki-stream's pipeline is the opposite:

**String stream → tokenize on the fly → publish tokens → render incrementally**

It replaces the "static input" assumption with "dynamic input," so highlighting can genuinely apply to streaming output.

### 2.2 The Core API: CodeToTokenTransformStream

At the heart of shiki-stream is a standard Web `TransformStream` that converts `ReadableStream<string>` into `ReadableStream<ThemedToken | RecallToken>`:

```ts
import { CodeToTokenScrollStream, ... } from '@shikijs/stream'
import { createHighlighter } from 'shiki'

// 1. Create the Shiki highlighter
const highlighter = await createHighlighter({
  langs: ['javascript'],
  themes: ['nord'],
})

// 2. The text stream you want to highlight (e.g. an LLM output)
const textStream = getTextStreamFromSomewhere()

// 3. Pipe the text stream into a token stream
const tokensStream = textStream
  .pipeThrough(new CodeToTokenTransformStream({
    highlighter,
    lang: 'javascript',
    theme: 'nord',
    allowRecalls: true, // see explanation below
  }))
```

### 2.3 Recall Tokens

Because highlighting depends on code context, **previously emitted tokens can change as the stream moves forward.** But streams are one-directional — you can't rewrite history. So shiki-stream introduces a special **recall token** that tells the receiver to discard the last N already-emitted tokens that have changed:

```ts
const receivedTokens: ThemedToken[] = []

tokensStream.pipeTo(new WritableStream({
  async write(token) {
    if ('recall' in token) {
      // discard the last token.recall tokens
      receivedTokens.length -= token.recall
    }
    else {
      receivedTokens.push(token)
    }
  },
}))
```

The key knob: `allowRecalls`:

- **By default `allowRecalls: false`** — only stable tokens are emitted, at a coarser granularity (usually line-by-line), for simple consumers;
- **`allowRecalls: true`** — finer-grained tokens are emitted, and the framework component handles "recall-redraw," for Vue / React / Solid components.

> In one sentence: **recall is an elegant engineering answer to "the stream can't go back — so tell the consumer to redraw."**

---

## 3. Technical Architecture

### 3.1 Built on the Standard Web Streams API

The whole core is built on the browser/Node-native **Web Streams API**, no extra stream library required:

- `ReadableStream`
- `WritableStream`
- `TransformStream`

This is the basis of composability — any text stream can be `.pipeThrough()` a `CodeToTokenTransformStream` to become a token stream, and then consumed by `.pipeTo()`.

### 3.2 Framework Renderers (Out of the Box)

Besides consuming the token stream manually, shiki-stream ships a ready `ShikiStreamRenderer` component for four major frontend frameworks — just pass in the stream:

- **Vue** — `@shikijs/stream/vue`
- **React** — `@shikijs/stream/react`
- **Solid** — `@shikijs/stream/solid`
- **Svelte** — `@shikijs/stream/svelte`

```vue
<script setup lang="ts">
import { ShikiStreamRenderer } from '@shikijs/stream/vue'
// get the token stream
</script>

<template>
  <ShikiStreamRenderer :stream="tokensStream" />
</template>
```

### 3.3 CachedRenderer (Experimental)

shiki-stream also provides a simpler renderer API, `ShikiCachedRenderer`, for rendering **incrementally-updated code strings** — you keep a `ref('')` code and append to it; no manual token handling needed:

```vue
<script setup lang="ts">
import { ShikiCachedRenderer } from '@shikijs/stream/vue'
import { createHighlighter } from 'shiki'

const highlighter = await createHighlighter({
  langs: ['javascript'],
  themes: ['vitesse-light'],
})

const code = ref('') // code should only be updated incrementally

// For demo purposes
onMounted(() => {
  setInterval(() => {
    code.value += '\nconsole.log("Hello");'
  }, 1000)
})
</script>

<template>
  <ShikiCachedRenderer
    :highlighter="highlighter"
    :code="code"
    lang="js"
    theme="vitesse-light"
  />
</template>
```

### 3.4 Core Tech Stack

- **Shiki**: the underlying syntax-highlighting engine (~14K main repo)
- **Vue** ≥ 3.2 (optional)
- **React** ≥ 19 (optional)
- **Solid-js** ≥ 1.9 (optional)
- **Web Streams API** — zero extra stream dependencies

---

## 4. Design Philosophy

### 4.1 "Built for a real need, not over-engineering"

In the PR that ported shiki-stream and related community packages into the Shiki official monorepo, Anthony Fu wrote:

> "Ports two community packages — antfu/shiki-stream and shikijs/shiki-magic-move — into this monorepo as official @shikijs/* packages."

This confirms streaming highlights is **a real pain point** — lexical in the LLM era, code streams are everywhere, and the classic full-code highlighting fails — so it's not over-engineering but spot-on.

### 4.2 Offer a Choice, Don't Decide for You

The `allowRecalls` design reflects a clear trade-off philosophy:

- **Stable mode (default)**: coarser granularity (line-by-line), simple and fast — fits most consumers;
- **Recall mode**: finer granularity (per-token), needs downstream "recall-redraw" — more elegant.

**Don't force one solution on all scenarios; leave the trade-off to the user.**

### 4.3 Framework-Agnostic Abstraction + Framework-Specific Adapters

The core `CodeToTokenTransformStream` is totally framework-agnostic (pure Web Streams API); the framework-specific parts (Vue/React/Solid/Svelte renderers) live in separate optional adapters. **Core logic has zero framework dependency; adapters live independently** — matching Shiki's "separate core from integrations" philosophy.

---

## 5. Full Tutorial: Getting Started with shiki-stream

> Note: per the latest official guidance, import from `@shikijs/stream` (since v4.2.0 / v0.1.5, `shiki-stream` is a thin re-export — swap the package name to keep existing imports working).

### 5.1 Install

```bash
# npm
npm i -D @shikijs/stream

# yarn
yarn add -D @shikijs/stream

# pnpm
pnpm add -D @shikijs/stream

# bun
bun add -D @shikijs/stream
```

### 5.2 Migrate from the old package

```diff
- import { CodeToTokenTransformStream } from 'shiki-stream'
- import { ShikiStreamRenderer } from 'shiki-stream/vue'
- import { ShikiStreamRenderer } from 'shiki-stream/react'
- import { ShikiStreamRenderer } from 'shiki-stream/solid'
+ import { CodeToTokenTransformStream } from '@shikijs/stream'
+ import { ShikiStreamRenderer } from '@shikijs/stream/vue'
+ import { ShikiStreamRenderer } from '@shikijs/stream/react'
+ import { ShikiStreamRenderer } from '@shikijs/stream/solid'
```

### 5.3 Basic Streaming Highlight (Complete Example)

```ts
import { CodeToTokenTransformStream } from '@shikijs/stream'
import { createHighlighter, createJavaScriptRegexEngine } from 'shiki'

// 1. Create the highlighter
const highlighter = await createHighlighter({
  langs: ['javascript', 'typescript', 'python'],
  themes: ['nord', 'vitesse-dark'],
  engine: createJavaScriptRegexEngine(),
})

// 2. Make a mock LLM output stream
function createLLMStream(): ReadableStream<string> {
  return new ReadableStream({
    async start(controller) {
      const code = `function hello() {\n  console.log("world")\n}`
      for (const char of code) {
        controller.enqueue(char)
        await new Promise(r => setTimeout(r, 50)) // simulate typing
      }
      controller.close()
    },
  })
}

// 3. Pipe it: text stream → token stream
const tokensStream = createLLMStream()
  .pipeThrough(new CodeToTokenTransformStream({
    highlighter,
    lang: 'javascript',
    theme: 'nord',
    allowRecalls: true,
  }))

// 4. Consume the token stream
for await (const token of tokensStream) {
  console.log(token)
}
```

### 5.4 Consume the Token Stream Manually

```ts
tokensStream.pipeTo(new WritableStream({
  async write(token) {
    console.log(token)
  },
}))
```

### 5.5 Integrate into Frontend Frameworks with Renderers

**React:**

```tsx
import { ShikiStreamRenderer } from '@shikijs/stream/react'

export function MyComponent() {
  return <ShikiStreamRenderer stream={tokensStream} />
}
```

**Vue:**

```vue
<template>
  <ShikiStreamRenderer :stream="tokensStream" />
</template>
```

**Solid:**

```tsx
import { ShikiStreamRenderer } from '@shikijs/stream/solid'

export function MyComponent() {
  return <ShikiStreamRenderer stream={tokensStream} />
}
```

### 5.6 Render Incremental Code with ShikiCachedRenderer

For "don't manage tokens, just want to render a code string that keeps growing":

```vue
<script setup lang="ts">
import { ShikiCachedRenderer } from '@shikijs/stream/vue'
import { createHighlighter } from 'shiki'

const highlighter = await createHighlighter({
  langs: ['javascript'],
  themes: ['vitesse-light'],
})
const code = ref('')
</script>

<template>
  <ShikiCachedRenderer
    :highlighter="highlighter"
    :code="code"
    lang="js"
    theme="vitesse-light"
  />
</template>
```

---

## 6. Feature Checklist

- **Streaming highlight**: converts a text stream into a token stream in real time (Web Streams API)
- **CodeToTokenTransformStream**: a standard TransformStream, pipes against any text stream
- **Recall-token mechanism**: controlled by `allowRecalls`, solves context-dependent token changes
- **Stable-token mode**: by default coarser granularity (line-by-line), stable tokens only
- **Four framework renderers**: `ShikiStreamRenderer` for Vue / React / Solid / Svelte
- **CachedRenderer**: simpler rendering API for incrementally-updated code strings (experimental, fully implemented for Vue)
- **Framework-agnostic core**: pure stream-processing logic, zero framework dependency
- **Manual consumption**: `.pipeTo()` + `WritableStream`, or `for await` iteration
- **Official ecosystem**: adopted into the Shiki official repo as `@shikijs/stream`

---

## 7. Summary: Viewpoints and Conclusions

### 7.1 Core Viewpoints

1. **"Waiting for the full code to highlight" is a dead paradigm in the LLM era.** When code is generated as a stream, classic bulk highlighting stalls the render and delays the experience; shiki-stream cascades a progressive token stream so highlighting comes alive along with the code — **a mental upgrade from batch processing to stream processing.**
2. **The recall token is the key abstraction of streaming highlighting.** Since one-directional streams can't rewrite history, shiki-stream lets the consumer accept a "redraw" recall signal — **an elegant protocol that works around the fundamental limit of one-directional streams.**
3. **The standard Web Streams API is the right foundation.** It doesn't invent a new streaming protocol — it reuses the browser's native `TransformStream`, making shiki-stream **composable, pipeable, and reusable with any spec-compliant stream** — first-class interoperability.
4. **A framework-agnostic core plus framework-specific adapters is a textbook pattern for multi-framework libraries.** Pure logic with zero dependencies; Vue/React/Solid/Svelte each adapt independently without interfering.
5. **From community package to official package is the best proof that a need is real.** Being adopted into Shiki's official monorepo (PR #1283) validates its value to the ecosystem — and the archive of the original repo is the strongest proof of its success.

### 7.2 Where It Stands in the Shiki Ecosystem

- **Shiki main repo** (~14K stars) — the core engine;
- **`@shikijs/stream`** (streaming highlight, formerly shiki-stream) — subject of this article;
- **shiki-magic-move** (code-block animation) — a similar community package;
- Used across the Shiki ecosystem / antfu ecosystem products such as Slidev and Vitesse.

### 7.3 Takeaways for Developers

- Building an LLM product? Want AI-generated code highlighted in real time? Streaming token rendering is the answer — don't wait for the whole code;
- Learning the "pipeline mindset" of Web Streams lets you chain "text stream → token stream → render stream" into one capable line;
- When "object state keeps changing," the recall "redraw" model is a broadly usable model worth borrowing.

### 7.4 Conclusion

In 2026, when "LLM + code generation" has become mainstream, shiki-stream looks like a small tool — yet it precisely solves one of the frontend's biggest everyday pains of the AI era: real-time code display. With an elegant "one-directional stream + recall" design, it stitches together the two otherwise-conflicting needs of "streaming" and "highlighting."

> As AI starts writing code one character at a time, the frontend must learn to highlight one character at a time. shiki-stream is the answer to "catching up asynchronously."

---

## References

- shiki-stream official repo: https://github.com/antfu/shiki-stream
- Official docs (@shikijs/stream): https://shiki.style/packages/stream
- Live demo: https://shiki-stream.netlify.app/
- npm package: https://www.npmjs.com/package/shiki-stream
- Shiki main repo: https://github.com/shikijs/shiki
- Shiki's streaming implementation: https://github.com/shikijs/shiki/tree/main/packages/stream