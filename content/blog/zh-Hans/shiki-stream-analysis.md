---
title: "shiki-stream 深度解析：让 LLM 输出的代码像打字一样实时高亮"
description: "全面分析 Anthony Fu（antfu）开源的 shiki-stream —— 一个基于 Web Streams API 的流式语法高亮库，专为「LLM 流式输出代码」场景设计。从「代码是渐进式到达的，高亮也必须渐进式工作」的核心洞察，到 CodeToTokenTransformStream 把文本流实时转成 token 流，从巧妙的 recall（召回）token 机制解决「语法依赖上下文」的难题，到 Vue/React/Solid/Svelte 四种框架开箱即用的渲染器，再到完整的安装与使用教程，以及它为何被 Shiki 官方接纳为 @shikijs/stream——一文讲透这个 594 stars 的「异步代码高亮」革命。"
date: "2026-08-03"
author: "TopDigg Research Team"
tags: ["shiki-stream", "Shiki", "Syntax Highlighting", "Streaming", "LLM", "Web Streams API", "anthu", "Vue", "React", "Solid", "TypeScript", "CodeToTokenTransformStream"]
categories: ["深度解析"]
keywords: ["shiki-stream", "Shiki 流式高亮", "语法高亮", "流式输出", "LLM 代码高亮", "Web Streams API", "CodeToTokenTransformStream", "Recall Token", "Anthony Fu", "@shikijs/stream", "渐进式渲染", "AI 代码展示"]
---

# shiki-stream 深度解析：让 LLM 输出的代码像打字一样实时高亮

> 核心理念：**「代码是渐进式到达的，语法高亮就必须也能渐进式完成。」** 当 LLM 像一个打字者一样一个字一个字地吐出代码时，传统「必须等完整代码才能高亮」的做法就失效了。shiki-stream 用 **Web Streams API** 给出了优雅的答案——把「文本流」实时转换为「token 流」，让代码在生成的同时就被涂上正确的语法颜色，还引入 **recall（召回）token** 机制解决「语法依赖上下文」这一流式高亮最棘手的难题。

---

## 一、项目说明

### 1.1 这是什么？

**shiki-stream** 是 Anthony Fu（antfu）开源的一个**流式语法高亮库**——它是围绕 Shiki 语法高亮引擎构建的流式（streaming / 异步增量）高亮解决方案。

官方一句话描述：

- **「Streaming highlighting with Shiki. Useful for highlighting text streams like LLM outputs.」**——用 Shiki 做流式高亮，特别适合像 LLM 输出这样的文本流。

关键事实：

- 仓库：`https://github.com/antfu/shiki-stream`
- Stars：**~594**
- 作者：**Anthony Fu（antfu）**——Vue 核心团队成员、Vite 核心贡献者、UnoCSS、Slidev、Vitesse 作者
- 协议：MIT
- 语言：TypeScript / JavaScript
- 创建于：2025 年 2 月
- 状态：**已归档（Archived）**——因为实现已迁移到 Shiki 官方仓库的 `@shikijs/stream`
- 在线 Demo：https://shiki-stream.netlify.app/

### 1.2 它想解决什么问题？

想象一下你在用 ChatGPT 或 Claude 生成代码：**AI 不是一次性吐出完整代码，而是像打字机一样一个字一个字、一个 token 一个 token 地输出。** 传统语法高亮库（包括原生 Shiki）的假设是「你有完整代码」，所以在流式场景下会失效：

- **代码渐进式到达**——每一刻你只拥有代码的一部分；
- **语法解析依赖上下文**——前面的字符可能改变后面字符的语法含义（比如一个 `// ` 开头的注释，会吞掉后面所有内容）；左边还没闭合的字符串/括号，会影响后面的高亮；
- **需要实时渲染**——用户不想等到整个代码流结束后才看到高亮。

shiki-stream 的答案：**用标准 Web Streams API，把「字符串流」实时转换成一个「高亮 token 流」**，让高亮和生成同步进行。

---

## 二、核心思想

### 2.1 从「整体高亮」到「流式高亮」的范式转变

传统高亮的流水线是：

**完整代码 → 一次性分词 → 一次性上色**

shiki-stream 的流水线则完全相反：

**字符串流 → 实时分词 → 实时发布 token → 增量渲染**

它把「静态输入」的假设彻底替换为「动态输入」，从而让高亮能被真实地应用在流式输出上。

### 2.2 核心 API：CodeToTokenTransformStream

这是 shiki-stream 的心脏——一个标准的 Web `TransformStream`，把 `ReadableStream<string>`（字符流）转换成 `ReadableStream<ThemedToken | RecallToken>`（token 流）：

```ts
import { CodeToTokenTransformStream } from '@shikijs/stream'
import { createHighlighter, createJavaScriptRegexEngine } from 'shiki'

// 1. 初始化 Shiki 高亮器
const highlighter = await createHighlighter({
  langs: ['javascript'],
  themes: ['nord'],
  engine: createJavaScriptRegexEngine(),
})

// 2. 拿到你想高亮的文本流（例如 LLM 输出）
const textStream = getTextStreamFromSomewhere()

// 3. 把文本流「管道」进 token 流
const tokensStream = textStream
  .pipeThrough(new CodeToTokenTransformStream({
    highlighter,
    lang: 'javascript',
    theme: 'nord',
    allowRecalls: true, // 见下方解释
  }))
```

### 2.3 召回 token（Recall Token）——流式高亮最聪明的一笔

由于高亮会依赖代码上下文，**随着流继续前进，已输出的 token 可能被改变**。而流是单向的，无法「回头重写」。shiki-stream 为此设计了一个特殊的 **recall token**，通知接收方「丢弃最后 N 个已改变的 token」：

```ts
const receivedTokens: ThemedToken[] = []

tokensStream.pipeTo(new WritableStream({
  async write(token) {
    if ('recall' in token) {
      // 丢弃最后 token.recall 个令牌
      receivedTokens.length -= token.recall
    }
    else {
      receivedTokens.push(token)
    }
  },
}))
```

关键设计点 `allowRecalls`：

- **默认 `allowRecalls: false`**——只输出**稳定 token**，粒度较粗（通常逐行），适合简单消费者；
- **`allowRecalls: true`**——输出更细粒度的 token，框架组件自己处理「召回重绘」，适合能处理召回的 Vue / React / Solid 组件。

> 一句话：**recall 是「既然流不能回头，那就让下游收到一个『撤销』指令」的优雅工程解法。**

---

## 三、技术架构

### 3.1 基于标准 Web Streams API

整个核心完全建立在浏览器/Node 原生支持的 **Web Streams API** 之上，无需引入任何额外的流库：

- `ReadableStream`（可读流）
- `WritableStream`（可写流）
- `TransformStream`（转换流）

这是「可组合性」的基础——任何文本流都能被 `.pipeThrough()` 一个 `CodeToTokenTransformStream`，变成一个 token 流，再被 `.pipeTo()` 消费。

### 3.2 框架渲染器（开箱即用）

除了手动消费 token 流，shiki-stream 为四大前端框架提供了现成的 **`ShikiStreamRenderer`** 组件，只需传入 stream：

- **Vue** —— `@shikijs/stream/vue`
- **React** —— `@shikijs/stream/react`
- **Solid** —— `@shikijs/stream/solid`
- **Svelte** —— `@shikijs/stream/svelte`

```vue
<script setup lang="ts">
import { ShikiStreamRenderer } from '@shikijs/stream/vue'
// 获取 token 流
</script>

<template>
  <ShikiStreamRenderer :stream="tokensStream" />
</template>
```

### 3.3 CachedRenderer（实验性 API）

除了原始流式渲染，shiki-stream 还提供了一个**简化版渲染器** `ShikiCachedRenderer`，用于渲染「增量更新的代码字符串」——你只需维护一个 `ref('')` 的 code，在它后面追加内容即可，无需手动处理 token：

```vue
<script setup lang="ts">
import { ShikiCachedRenderer } from '@shikijs/stream/vue'
import { createHighlighter } from 'shiki'

const highlighter = await createHighlighter({
  langs: ['javascript'],
  themes: ['vitesse-light'],
})

const code = ref('') // code 应该只增量更新

// 模拟
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

### 3.4 核心技术栈

- **Shiki**——底层语法高亮引擎（~14K main repo）；
- **Vue** ≥ 3.2（可选）
- **React** ≥ 19（可选）
- **Solid-js** ≥ 1.9（可选）
- **Web Streams API**——零额外流引入

---

## 四、设计哲学

### 4.1 「为真实需求而造，而非过度设计」

Anthony Fu 把 shiki-stream 等一系列社区包移植进 Shiki 官方 monorepo 的 PR 中，明确写道：

> **"Ports two community packages — antfu/shiki-stream and shikijs/shiki-magic-move — into this monorepo as official @shikijs/* packages."**

（把两个社区包移植为官方的 @shikijs/* 包。）

这印证了流式高亮是**真实存在的痛点**——LLM 时代代码流式输出越来越普遍，传统整体高亮在它面前失效，所以这不是过度设计，而是切中要害。

### 4.2 提供选择权，而非替你做决定

`allowRecalls` 的设计体现了清晰权衡哲学：

- **稳定模式（默认）**：粗粒度（逐行），简单、性能好，适合大多数消费者；
- **召回模式**：细粒度（逐 token），需要下游处理「召回重绘」，但更精致。

**不给所有场景强塞一个方案，而是把选择交给使用者。**

### 4.3 框架无关的抽象，框架特定的适配

核心 `CodeToTokenTransformStream` 完全框架无关（纯 Web Streams API）；框架相关的东西（Vue/React/Solid/Svelte 渲染器）是分开的可选适配层。**核心逻辑零框架依赖，适配层独立存在**——这符合 Shiki 生态「core 与 integrations 解耦」的一贯哲学。

---

## 五、详细教程：从零开始用 shiki-stream

> 提示：以下按官方最新推荐，从 `@shikijs/stream` 导入（`shiki-stream` 自 v4.2.0 / v0.1.5 起是它的薄 re-export，旧代码换包名即可）。

### 5.1 安装

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

### 5.2 从旧包迁移（shiki-stream 用户）

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

### 5.3 基础流式高亮（完整示例）

```ts
import { CodeToTokenTransformStream } from '@shikijs/stream'
import { createHighlighter, createJavaScriptRegexEngine } from 'shiki'

// 1. 初始化 highlighter
const highlighter = await createHighlighter({
  langs: ['javascript', 'typescript', 'python'],
  themes: ['nord', 'vitesse-dark'],
  engine: createJavaScriptRegexEngine(),
})

// 2. 造一个模拟 LLM 输出流
function createLLMStream(): ReadableStream<string> {
  return new ReadableStream({
    async start(controller) {
      const code = `function hello() {\n  console.log("world")\n}`
      for (const char of code) {
        controller.enqueue(char)
        await new Promise(r => setTimeout(r, 50)) // 模拟打字
      }
      controller.close()
    },
  })
}

// 3. 管道化：文本流 → token 流
const tokensStream = createLLMStream()
  .pipeThrough(new CodeToTokenTransformStream({
    highlighter,
    lang: 'javascript',
    theme: 'nord',
    allowRecalls: true,
  }))

// 4. 消费 token 流
for await (const token of tokensStream) {
  console.log(token)
}
```

### 5.4 手动消费 token 流

```ts
tokensStream.pipeTo(new WritableStream({
  async write(token) {
    console.log(token)
  },
}))
```

### 5.5 用渲染组件集成到前端框架

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

### 5.6 用 ShikiCachedRenderer 渲染增量代码

适合「不需要只管 token，只想给一个会不断变长的 code 字符串」的场景：

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

## 六、功能清单

- **流式高亮**：把字符串流实时转为高亮 token 流（Web Streams API）
- **CodeToTokenTransformStream**：标准 TransformStream，管道化接入任何文本流
- **召回 token 机制**：`allowRecalls` 控制，解决上下文依赖的 token 变更
- **稳定 token 模式**：默认粗粒度（逐行），输出稳定 token
- **四种框架渲染器**：Vue / React / Solid / Svelte 的 `ShikiStreamRenderer`
- **CachedRenderer**：增量更新 code 字符串的简化渲染 API（实验性，仅 Vue 完整实现）
- **框架无关核心**：零框架依赖的纯流处理逻辑
- **手动消费**：`.pipeTo()` + `WritableStream`，或 `for await` 迭代
- **官方生态**：被纳入 Shiki 官方仓库，成为 `@shikijs/stream`

---

## 七、归纳总结：观点与结论

### 7.1 核心观点

1. **「等待完整代码再高亮」是 LLM 时代的失效范式。** 当代码是流式生成时，传统整体高亮在流程中会卡住渲染、延迟体验；shiki-stream 用渐进式 token 流，让高亮和代码一样「活」起来——**这是从「批处理」到「流处理」的思维升级**。
2. **recall token 是流式高亮的关键抽象。** 单行程流不能回溯重写，shiki-stream 选择让下游接收「撤销重发」的 recall 信号——**用巧妙的协议设计，绕过了「单向流无法纠正历史」的根本限制**。
3. **标准 Web Streams API 是正确的基础。** 不发明新的流协议，直接复用浏览器原生 `TransformStream`，让 shiki-stream **可与任何遵循标准的流组合、管道、复用**——这是一等公民的互操作性。
4. **框架无关核心 + 框架专属适配层，是多框架库的教科书范式。** 纯逻辑零依赖，Vue/React/Solid/Svelte 各自适配，各知所守、互不干扰。
5. **从社区包到官方包，是「真实需求被验证」的最佳注脚。** 被收录进 Shiki 官方 monorepo（PR #1283），证明了它的价值已被 ecosystem 认可，而原仓库「归档」反而是它成功的最好证明。

### 7.2 它在 Shiki 生态中的位置

- **Shiki 主仓库**（~14K stars）——核心引擎；
- **`@shikijs/stream`**（流式高亮，原 shiki-stream）——本文主角；
- **`shiki-magic-move`**（代码块动画）——同类社区包；
- Slidev / Vitesse 等 shiki 生态 / antfu 生态中的应用。

### 7.3 对开发者的启示

- 做 LLM 产品：想让 AI 生成的代码实时高亮？」流式 token 渲染就是标准答案，别用「等完整再高亮」；
- 懂 Web Streams API 的「管道思维」能让你把「文本流 → token 流 → 渲染流」串成一条赋能链路；
- 当「对象状态不断改变」时，recall 的「撤销-重发」模型可以作为通用借鉴。

### 7.4 结语

在「LLM + 代码生成」成为主流的 2026 年，shiki-stream 看似是个小工具，却精准解决了 AI 时代前端真正最大的日常痛点之一的——代码的实时展示。它用一个优雅的「单向流 + recall」设计，把「流式与高亮」这两个原本冲突的需求缝合在一起。

> **当 AI 开始像人一样逐字写代码，前端高亮也必须学会逐字跟上。shiki-stream 就是这个「异步跟上」的答案。**

---

## 参考资料

- shiki-stream 官方仓库：https://github.com/antfu/shiki-stream
- 官方文档（@shikijs/stream）：https://shiki.style/packages/stream
- 在线 Demo：https://shiki-stream.netlify.app/
- npm 包：https://www.npmjs.com/package/shiki-stream
- Shiki 主仓库：https://github.com/shikijs/shiki
- Shiki 的流式实现：https://github.com/shikijs/shiki/tree/main/packages/stream