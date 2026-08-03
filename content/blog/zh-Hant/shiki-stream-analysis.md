---
title: "shiki-stream 深度解析：讓 LLM 輸出的程式碼像打字一樣即時高亮"
description: "全面分析 Anthony Fu（antfu）開源的 shiki-stream —— 一個基於 Web Streams API 的串流式語法高亮函式庫，專為「LLM 串流輸出程式碼」場景設計。從「程式碼是漸進式到達的，高亮也必須漸進式工作」的核心洞察，到 CodeToTokenTransformStream 把文字流即時轉成 token 流，從巧妙的 recall（召回）token 機制解決「語法依賴上下文」的難題，到 Vue/React/Solid/Svelte 四種框架開箱即用的渲染器，再到完整的安裝與使用教學，以及它為何被 Shiki 官方接納為 @shikijs/stream——一文講透這個 594 stars 的「非同步程式碼高亮」革命。"
date: "2026-08-03"
author: "TopDigg Research Team"
tags: ["shiki-stream", "Shiki", "Syntax Highlighting", "Streaming", "LLM", "Web Streams API", "anthu", "Vue", "React", "Solid", "TypeScript", "CodeToTokenTransformStream"]
categories: ["深度解析"]
keywords: ["shiki-stream", "Shiki 串流高亮", "語法高亮", "串流輸出", "LLM 程式碼高亮", "Web Streams API", "CodeToTokenTransformStream", "Recall Token", "Anthony Fu", "@shikijs/stream", "漸進式渲染", "AI 程式碼展示"]
---

# shiki-stream 深度解析：讓 LLM 輸出的程式碼像打字一樣即時高亮

> 核心理念：**「程式碼是漸進式到達的，語法高亮就必須也能漸進式完成。」** 當 LLM 像一個打字者一樣一個字一個字地吐出程式碼時，傳統「必須等完整程式碼才能高亮」的做法就失效了。shiki-stream 用 **Web Streams API** 給出了優雅的答案——把「文字流」即時轉換為「token 流」，讓程式碼在產生的同時就被塗上正確的語法顏色，還引入 **recall（召回）token** 機制解決「語法依賴上下文」這一串流高亮最棘手的難題。

---

## 一、專案說明

### 1.1 這是什麼？

**shiki-stream** 是 Anthony Fu（antfu）開源的一個**串流式語法高亮函式庫**——它是圍繞 Shiki 語法高亮引擎建構的串流（streaming / 非同步增量）高亮解決方案。

官方一句話描述：

- **「Streaming highlighting with Shiki. Useful for highlighting text streams like LLM outputs.」**——用 Shiki 做串流高亮，特別適合像 LLM 輸出這樣的文字流。

關鍵事實：

- 倉庫：`https://github.com/antfu/shiki-stream`
- Stars：**~594**
- 作者：**Anthony Fu（antfu）**——Vue 核心團隊成員、Vite 核心貢獻者、UnoCSS、Slidev、Vitesse 作者
- 協議：MIT
- 語言：TypeScript / JavaScript
- 建立於：2025 年 2 月
- 狀態：**已封存（Archived）**——因為實作已遷移到 Shiki 官方倉庫的 `@shikijs/stream`
- 線上 Demo：https://shiki-stream.netlify.app/

### 1.2 它想解決什麼問題？

想像你在用 ChatGPT 或 Claude 產生程式碼：**AI 不是一次性吐出完整程式碼，而是像打字機一樣一個字一個字、一個 token 一個 token 地輸出。** 傳統語法高亮函式庫（包括原生 Shiki）的假設是「你有完整程式碼」，所以在串流場景下會失效：

- **程式碼漸進式到達**——每一刻你只擁有程式碼的一部分；
- **語法解析依賴上下文**——前面的字元可能改變後面字元的語法含義（比如一個 `// ` 開頭的註解，會吞掉後面所有內容）；左邊還沒閉合的字串/括號，會影響後面的高亮；
- **需要即時渲染**——使用者不想等到整個程式碼流結束後才看到高亮。

shiki-stream 的答案：**用標準 Web Streams API，把「字串流」即時轉換成一個「高亮 token 流」**，讓高亮和產生同步進行。

---

## 二、核心思想

### 2.1 從「整體高亮」到「串流高亮」的典範轉移

傳統高亮的管線是：

**完整程式碼 → 一次性分詞 → 一次性上色**

shiki-stream 的管線則完全相反：

**字串流 → 即時分詞 → 即時發布 token → 增量渲染**

它把「靜態輸入」的假設徹底替換為「動態輸入」，從而讓高亮能被真實地應用在串流輸出上。

### 2.2 核心 API：CodeToTokenTransformStream

這是 shiki-stream 的心臟——一個標準的 Web `TransformStream`，把 `ReadableStream<string>`（字元流）轉換成 `ReadableStream<ThemedToken | RecallToken>`（token 流）：

```ts
import { CodeToTokenTransformStream } from '@shikijs/stream'
import { createHighlighter, createJavaScriptRegexEngine } from 'shiki'

// 1. 初始化 Shiki 高亮器
const highlighter = await createHighlighter({
  langs: ['javascript'],
  themes: ['nord'],
  engine: createJavaScriptRegexEngine(),
})

// 2. 拿到你想高亮的文字流（例如 LLM 輸出）
const textStream = getTextStreamFromSomewhere()

// 3. 把文字流「管道」進 token 流
const tokensStream = textStream
  .pipeThrough(new CodeToTokenTransformStream({
    highlighter,
    lang: 'javascript',
    theme: 'nord',
    allowRecalls: true, // 見下方解釋
  }))
```

### 2.3 召回 token（Recall Token）——串流高亮最聰明的一筆

由於高亮會依賴程式碼上下文，**隨著流繼續前進，已輸出的 token 可能被改變**。而流是單向的，無法「回頭重寫」。shiki-stream 為此設計了一個特殊的 **recall token**，通知接收方「丟棄最後 N 個已改變的 token」：

```ts
const receivedTokens: ThemedToken[] = []

tokensStream.pipeTo(new WritableStream({
  async write(token) {
    if ('recall' in token) {
      // 丟棄最後 token.recall 個令牌
      receivedTokens.length -= token.recall
    }
    else {
      receivedTokens.push(token)
    }
  },
}))
```

關鍵設計點 `allowRecalls`：

- **預設 `allowRecalls: false`**——只輸出**穩定 token**，粒度較粗（通常逐行），適合簡單消費者；
- **`allowRecalls: true`**——輸出更細粒度的 token，框架元件自己處理「召回重繪」，適合能處理召回的 Vue / React / Solid 元件。

> 一句話：**recall 是「既然流不能回頭，那就讓下游收到一個『撤銷』指令」的優雅工程解法。**

---

## 三、技術架構

### 3.1 基於標準 Web Streams API

整個核心完全建立在瀏覽器/Node 原生支援的 **Web Streams API** 之上，無需引入任何額外的流函式庫：

- `ReadableStream`（可讀流）
- `WritableStream`（可寫流）
- `TransformStream`（轉換流）

這是「可組合性」的基礎——任何文字流都能被 `.pipeThrough()` 一個 `CodeToTokenTransformStream`，變成一個 token 流，再被 `.pipeTo()` 消費。

### 3.2 框架渲染器（開箱即用）

除了手動消費 token 流，shiki-stream 為四大前端框架提供了現成的 **`ShikiStreamRenderer`** 元件，只需傳入 stream：

- **Vue** —— `@shikijs/stream/vue`
- **React** —— `@shikijs/stream/react`
- **Solid** —— `@shikijs/stream/solid`
- **Svelte** —— `@shikijs/stream/svelte`

```vue
<script setup lang="ts">
import { ShikiStreamRenderer } from '@shikijs/stream/vue'
// 取得 token 流
</script>

<template>
  <ShikiStreamRenderer :stream="tokensStream" />
</template>
```

### 3.3 CachedRenderer（實驗性 API）

除了原始串流渲染，shiki-stream 還提供了一個**簡化版渲染器** `ShikiCachedRenderer`，用於渲染「增量更新的程式碼字串」——你只需維護一個 `ref('')` 的 code，在它後面追加內容即可，無需手動處理 token：

```vue
<script setup lang="ts">
import { ShikiCachedRenderer } from '@shikijs/stream/vue'
import { createHighlighter } from 'shiki'

const highlighter = await createHighlighter({
  langs: ['javascript'],
  themes: ['vitesse-light'],
})

const code = ref('') // code 應該只增量更新

// 模擬
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

### 3.4 核心技術棧

- **Shiki**——底層語法高亮引擎（~14K main repo）；
- **Vue** ≥ 3.2（可選）
- **React** ≥ 19（可選）
- **Solid-js** ≥ 1.9（可選）
- **Web Streams API**——零額外流引入

---

## 四、設計哲學

### 4.1 「為真實需求而造，而非過度設計」

Anthony Fu 把 shiki-stream 等一系列社群套件移植進 Shiki 官方 monorepo 的 PR 中，明確寫道：

> **"Ports two community packages — antfu/shiki-stream and shikijs/shiki-magic-move — into this monorepo as official @shikijs/* packages."**

（把兩個社群套件移植為官方的 @shikijs/* 套件。）

這印證了串流高亮是**真實存在的痛點**——LLM 時代程式碼串流輸出越來越普遍，傳統整體高亮在它面前失效，所以這不是過度設計，而是切中要害。

### 4.2 提供選擇權，而非替你做決定

`allowRecalls` 的設計體現了清晰權衡哲學：

- **穩定模式（預設）**：粗粒度（逐行），簡單、效能好，適合大多數消費者；
- **召回模式**：細粒度（逐 token），需要下游處理「召回重繪」，但更精緻。

**不給所有場景強塞一個方案，而是把選擇交給使用者。**

### 4.3 框架無關的抽象，框架特定的適配

核心 `CodeToTokenTransformStream` 完全框架無關（純 Web Streams API）；框架相關的東西（Vue/React/Solid/Svelte 渲染器）是分開的可選適配層。**核心邏輯零框架依賴，適配層獨立存在**——這符合 Shiki 生態「core 與 integrations 解耦」的一貫哲學。

---

## 五、詳細教學：從零開始用 shiki-stream

> 提示：以下按官方最新推薦，從 `@shikijs/stream` 匯入（`shiki-stream` 自 v4.2.0 / v0.1.5 起是它的薄 re-export，舊程式碼換套件名即可）。

### 5.1 安裝

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

### 5.2 從舊套件遷移（shiki-stream 使用者）

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

### 5.3 基礎串流高亮（完整範例）

```ts
import { CodeToTokenTransformStream } from '@shikijs/stream'
import { createHighlighter, createJavaScriptRegexEngine } from 'shiki'

// 1. 初始化 highlighter
const highlighter = await createHighlighter({
  langs: ['javascript', 'typescript', 'python'],
  themes: ['nord', 'vitesse-dark'],
  engine: createJavaScriptRegexEngine(),
})

// 2. 造一個模擬 LLM 輸出流
function createLLMStream(): ReadableStream<string> {
  return new ReadableStream({
    async start(controller) {
      const code = `function hello() {\n  console.log("world")\n}`
      for (const char of code) {
        controller.enqueue(char)
        await new Promise(r => setTimeout(r, 50)) // 模擬打字
      }
      controller.close()
    },
  })
}

// 3. 管道化：文字流 → token 流
const tokensStream = createLLMStream()
  .pipeThrough(new CodeToTokenTransformStream({
    highlighter,
    lang: 'javascript',
    theme: 'nord',
    allowRecalls: true,
  }))

// 4. 消費 token 流
for await (const token of tokensStream) {
  console.log(token)
}
```

### 5.4 手動消費 token 流

```ts
tokensStream.pipeTo(new WritableStream({
  async write(token) {
    console.log(token)
  },
}))
```

### 5.5 用渲染元件整合到前端框架

**React：**

```tsx
import { ShikiStreamRenderer } from '@shikijs/stream/react'

export function MyComponent() {
  return <ShikiStreamRenderer stream={tokensStream} />
}
```

**Vue：**

```vue
<template>
  <ShikiStreamRenderer :stream="tokensStream" />
</template>
```

**Solid：**

```tsx
import { ShikiStreamRenderer } from '@shikijs/stream/solid'

export function MyComponent() {
  return <ShikiStreamRenderer stream={tokensStream} />
}
```

### 5.6 用 ShikiCachedRenderer 渲染增量程式碼

適合「不需要只管 token，只想給一個會不斷變長的 code 字串」的場景：

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

## 六、功能清單

- **串流高亮**：把字串流即時轉為高亮 token 流（Web Streams API）
- **CodeToTokenTransformStream**：標準 TransformStream，管道化接入任何文字流
- **召回 token 機制**：`allowRecalls` 控制，解決上下文依賴的 token 變更
- **穩定 token 模式**：預設粗粒度（逐行），輸出穩定 token
- **四種框架渲染器**：Vue / React / Solid / Svelte 的 `ShikiStreamRenderer`
- **CachedRenderer**：增量更新 code 字串的簡化渲染 API（實驗性，僅 Vue 完整實作）
- **框架無關核心**：零框架依賴的純流處理邏輯
- **手動消費**：`.pipeTo()` + `WritableStream`，或 `for await` 迭代
- **官方生態**：被納入 Shiki 官方倉庫，成為 `@shikijs/stream`

---

## 七、歸納總結：觀點與結論

### 7.1 核心觀點

1. **「等待完整程式碼再高亮」是 LLM 時代的失效典範。** 當程式碼是串流產生時，傳統整體高亮在流程中會卡住渲染、延遲體驗；shiki-stream 用漸進式 token 流，讓高亮和程式碼一樣「活」起來——**這是從「批次處理」到「流處理」的思維升級**。
2. **recall token 是串流高亮的關鍵抽象。** 單行程流不能回溯重寫，shiki-stream 選擇讓下游接收「撤銷重發」的 recall 訊號——**用巧妙的協定設計，繞過了「單向流無法糾正歷史」的根本限制**。
3. **標準 Web Streams API 是正確的基礎。** 不發明新的流協定，直接複用瀏覽器原生 `TransformStream`，讓 shiki-stream **可與任何遵循標準的流組合、管道、複用**——這是一等公民的互通性。
4. **框架無關核心 + 框架專屬適配層，是多框架函式庫的教科書典範。** 純邏輯零依賴，Vue/React/Solid/Svelte 各自適配，各知所守、互不干擾。
5. **從社群套件到官方套件，是「真實需求被驗證」的最佳註腳。** 被收錄進 Shiki 官方 monorepo（PR #1283），證明了它的價值已被 ecosystem 認可，而原倉庫「封存」反而是它成功的最好證明。

### 7.2 它在 Shiki 生態中的位置

- **Shiki 主倉庫**（~14K stars）——核心引擎；
- **`@shikijs/stream`**（串流高亮，原 shiki-stream）——本文主角；
- **`shiki-magic-move`**（程式碼區塊動畫）——同類社群套件；
- Slidev / Vitesse 等 shiki 生態 / antfu 生態中的應用。

### 7.3 對開發者的啟示

- 做 LLM 產品：想讓 AI 產生的程式碼即時高亮？串流 token 渲染就是標準答案，別用「等完整再高亮」；
- 懂 Web Streams API 的「管道思維」能讓你把「文字流 → token 流 → 渲染流」串成一條賦能鏈路；
- 當「物件狀態不斷改變」時，recall 的「撤銷-重發」模型可以作為通用借鏡。

### 7.4 結語

在「LLM + 程式碼產生」成為主流的 2026 年，shiki-stream 看似是個小工具，卻精準解決了 AI 時代前端真正最大的日常痛點之一的——程式碼的即時展示。它用一個優雅的「單向流 + recall」設計，把「串流與高亮」這兩個原本衝突的需求縫合在一起。

> **當 AI 開始像人一樣逐字寫程式碼，前端高亮也必須學會逐字跟上。shiki-stream 就是這個「非同步跟上」的答案。**

---

## 參考資料

- shiki-stream 官方倉庫：https://github.com/antfu/shiki-stream
- 官方文件（@shikijs/stream）：https://shiki.style/packages/stream
- 線上 Demo：https://shiki-stream.netlify.app/
- npm 套件：https://www.npmjs.com/package/shiki-stream
- Shiki 主倉庫：https://github.com/shikijs/shiki
- Shiki 的串流實作：https://github.com/shikijs/shiki/tree/main/packages/stream