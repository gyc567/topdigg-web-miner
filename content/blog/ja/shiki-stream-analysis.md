---
title: "shiki-stream 徹底解説: LLMが出力するコードをまるでタイプライターのようにリアルタイムハイライトする"
description: "Anthony Fu（antfu）氏が公開した shiki-stream を徹底分析。Web Streams API を基盤とし、\u201cLLM が生成するコード\u201dのユースケースに特化したストリーミング構文ハイライトを実現します。「コードは徐々に届くのだから、ハイライトも徐々に進めるべき」という核となる発想から、テキストストリームをトークンストリームに変換する CodeToTokenTransformStream、文脈によって意味が変わる問題を解決した recall-token 機構、Vue/React/Solid/Svelte 対応レンダラー、充実の導入チュートリアルまで、約594スターのこのプロジェクトが公式の @shikijs/stream になった理由を解説します。"
date: "2026-08-03"
author: "TopDigg Research Team"
tags: ["shiki-stream", "Shiki", "構文ハイライト", "ストリーミング", "LLM", "Web Streams API", "antfu", "Vue", "React", "Solid", "TypeScript", "CodeToTokenTransformStream"]
categories: ["Deep Dive"]
keywords: ["shiki-stream", "Shiki", "ストリーミング構文ハイライト", "構文ハイライト", "ストリーミング出力", "LLM コード表示", "Web Streams API", "CodeToTokenTransformStream", "Recall Token", "Anthony Fu", "@shikijs/stream", "インクリメンタルレンダリング"]
---

# shiki-stream 徹底解説: LLMが出力するコードをまるでタイプライターのようにリアルタイムハイライトする

> 核となる認識: **「コードは少しずつ届くのだから、構文ハイライトも少しずつ進めるべきである。」** LLM が一文字ずつコードを吐き出す——まるでタイプイングするかのように——その時、従来の「コード全体を待ってからハイライトする」アプローチは破綻します。shiki-stream は **Web Streams API** で見事に応える:テキストストリームをリアルタイムにトークンストリームへ変換し、コードが生成される瞬間に色を付けます。そして **recall token 機構** を導入して、ストリーミング構文ハイライトの最難関——「構文は文脈に依存する」——を解決します。

---

## 1. プロジェクト概要

### 1.1 それは何か？

**shiki-stream** は Anthony Fu（antfu）氏が公開した **ストリーミング構文ハイライトライブラリ** です——Shiki 構文ハイライトエンジンを土台にした、ストリーミング／インクリメンタルハイライト用ラッパーです。

公式の一言説明:

- **"Streaming highlighting with Shiki. Useful for highlighting text streams like LLM outputs."**（Shiki によるストリーミングハイライト。LLM 出力のようなテキストストリームをハイライトするのに有用）

主なデータ:

- リポジトリ: `https://github.com/antfu/shiki-stream`
- スター数: **約 594**
- 著者: **Anthony Fu（antfu）** — Vue コアチームメンバー、Vite コアコントリビュータ、UnoCSS / Slidev / Vitesse の開発者
- ライセンス: MIT
- 言語: TypeScript / JavaScript
- 作成時期: 2025年2月
- 状態: **アーカイブ済み** — 実装が Shiki 公式の `@shikijs/stream` へ移ったため
- ライブデモ: https://shiki-stream.netlify.app/

### 1.2 何の問題を解決するのか？

ChatGPT や Claude でコードを生成したときを想像してください:**AI は一度に塊を出力せず、一文字ずつ、トークンずつ、タイプライターのように出力するのです。** 従来の構文ハイライター（Shiki 本体も含む）は「完全なコードが手元にある」ことを前提にしているため、ストリーミングでは破綻します:

- **コードが徐々に進む** — どの時点でも断片しか除外できません;
- **解析は文脈に依存する** — 先に出た文字が後ろの意味を変える（例: `// ` で始まる行はそれ以降をすべて飲み込む。閉じていない文字列や括弧は後続に影響する）;
- **描画は即時でなければならない** — ユーザは全ストリームを待ってからハイライトを見るのを望まない。

shiki-stream の答え:**標準の Web Streams API を使い、文字列ストリームをリアルタイムにハイライトトークンストリームへ変換** することで、ハイライトが生成と並行して進みます。

---

## 2. 中核となる思想

### 2.1 「一括ハイライト」から「ストリーミングハイライト」へ

従来のパイプライン:

**完全なコード → 一度トークン化 → 一括で色付け**

shiki-stream のパイプラインは逆方向:

**文字列ストリーム → リアルタイムにトークン化 → トークンを発行 → インクリメンタルに描画**

「静的入力」の前提を「動的入力」に置き換え、ハイライトを真のストリーミング出力へ対応させます。

### 2.2 中核 API: CodeToTokenTransformStream

shiki-stream の中核は、標準 Web `TransformStream` で `ReadableStream<string>` を `ReadableStream<ThemedToken | RecallToken>` に変換するものです:

```ts
import { CodeToTokenTransformStream } from '@shikijs/stream'
import { createHighlighter } from 'shiki'

// 1. Shiki ハイライターを作成
const highlighter = await createHighlighter({
  langs: ['javascript'],
  themes: ['nord'],
})

// 2. ハイライトしたいテキストストリーム（例: LLM の出力）
const textStream = getTextStreamFromSomewhere()

// 3. テキストストリームをトークンストリームへ
const tokensStream = textStream
  .pipeThrough(new CodeToTokenTransformStream({
    highlighter,
    lang: 'javascript',
    theme: 'nord',
    allowRecalls: true, // 後述
  }))
```

### 2.3 Recall Tokens

ハイライトは文脈に依存するため、**ストリームが進むにつれて、一度出力したトークンが変わることがあります。** しかしストリームは一方向——歴史を書き換えられません。そこで shiki-stream は特殊な **recall token** を導入し、受取側に「最後に出力した変更が生じた N 個のトークンを破棄せよ」と伝えます:

```ts
const receivedTokens: ThemedToken[] = []

tokensStream.pipeTo(new WritableStream({
  async write(token) {
    if ('recall' in token) {
      // 最後の token.recall 個を破棄
      receivedTokens.length -= token.recall
    }
    else {
      receivedTokens.push(token)
    }
  },
}))
```

要となるスイッチが `allowRecalls` です:

- **デフォルトは `allowRecalls: false`** — 安定トークンのみを粗い粒度（通常は行単位）で出力。単純な消費者向け;
- **`allowRecalls: true`** — 細かいトークンを出力し、Vue / React / Solid コンポーネントが「recall 再描画」を処理。

> 一言で: **recall は「ストリームは逆戻りできない——なら消費者に再描画を伝えよ」という慧眼の設計上の回答です。**

---

## 3. 技術アーキテクチャ

### 3.1 標準 Web Streams API で構築

コアはブラウザ／Node ネイティブの **Web Streams API** だけで構築され、余分なストリーミングライブラリは不要:

- `ReadableStream`
- `WritableStream`
- `TransformStream`

これが合成性の土台です——あらゆるテキストストリームを `.pipeThrough()` で `CodeToTokenTransformStream` に流しトークンストリームへ変え、`.pipeTo()` で消費できます。

### 3.2 フレームワーク用レンダラー（そのまま使える）

トークンストリームを手動で消費するだけでなく、shiki-stream は主要フロンテンドフレームワーク向けに `ShikiStreamRenderer` コンポーネントを同梱。ストリームを渡すだけで使えます:

- **Vue** — `@shikijs/stream/vue`
- **React** — `@shikijs/stream/react`
- **Solid** — `@shikijs/stream/solid`
- **Svelte** — `@shikijs/stream/svelte`

```vue
<script setup lang="ts">
import { ShikiStreamRenderer } from '@shikijs/stream/vue'
// トークンストリームを取得
</script>

<template>
  <ShikiStreamRenderer :stream="tokensStream" />
</template>
```

### 3.3 CachedRenderer（実験的）

shiki-stream はより単純なレンダラー API、`ShikiCachedRenderer` も提供——**段階的に更新されるコード文字列**を描画します。`ref('')` のコードを保持して追記するだけでよく、トークンの手動管理は不要です:

```vue
<script setup lang="ts">
import { ShikiCachedRenderer } from '@shikijs/stream/vue'
import { createHighlighter } from 'shiki'

const highlighter = await createHighlighter({
  langs: ['javascript'],
  themes: ['vitesse-light'],
})

const code = ref('') // コードはインクリメンタルに更新すること

// デモ用
onMounted(() => {
  setInterval(() => {
    code.value += '\nconsole.log("hello");'
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

### 3.4 コア技術スタック

- **Shiki**: 下層の構文ハイライトエンジン（本体リポジトリ約 1.4万スター）
- **Vue** ≥ 3.2（任意）
- **React** ≥ 19（任意）
- **Solid-js** ≥ 1.9（任意）
- **Web Streams API** — 追加のストリーミング依存ゼロ

---

## 4. 設計思想

### 4.1 「実需要のために作られ、過剰設計ではない」

shiki-stream と関連コミュニティパッケージを Shiki 公式モノレポへ移植した PR で、Anthony Fu 氏は次のように述べています:

> "Ports two community packages — basic streaming wrapper and revisions — into this monorepo as official @shikijs packages."

これは「ストリーミングハイライトは**実在の痛点**である」こと——LLM 時代、コードストリームは至る所にあり、従来の一括ハイライトでは不足する——を裏付けており、過剰設計ではなく本質を捉えています。

### 4.2 選択肢を提供し、押しつけない

`allowRecalls` の設計は明確なトレードオフの哲学を示す:

- **安定モード（デフォルト）**: 粗い粒度（行単位）、単純で速い——大半の消費者に適合;
- **recall モード**: 細かい粒度（トークン単位）、下流の「recall 再描画」が必要——よりエレガント。

**一つの解を全シナリオに強要せず、トレードオフはユーザに委ねる。**

### 4.3 フレームワーク非依存の抽象 + フレームワーク固有のアダプタ

中核の `CodeToTokenTransformStream` は完全にフレームワーク非依存（純粋 Web Streams API）。フレームワーク固有部分（Vue/React/Solid/Svelte のレンダラー）は個別の任意アダプタに置かれる。**中核ロジックはフレームワーク依存ゼロ、アダプタが独立**——Shiki の「コアとインテグレーションを分ける」思想に一致します。

---

## 5. 完全チュートリアル

> 注: 最新の公式方針に従い `@shikijs/stream` からインポートします（v4.2.0 / v0.1.5 以降、`shiki-stream` は薄い再エクスポート——既存インポートを維持するにはパッケージ名を差し替えるだけ）。

### 5.1 インストール

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

### 5.2 旧パッケージからの移行

```diff
- import { CodeToTokenTransformStream } from 'shiki-stream'
- import { ShikiStreamRenderer } from 'shiki-stream/vue'
+ import { CodeToTokenTransformStream } from '@shikijs/stream'
+ import { ShikiStreamRenderer } from '@shikijs/stream/vue'
```

### 5.3 基本のストリーミングハイライト

```ts
import { CodeToTokenTransformStream } from '@shikijs/stream'
import { createHighlighter, createJavaScriptRegexEngine } from 'shiki'

const highlighter = await createHighlighter({
  langs: ['javascript', 'typescript', 'python'],
  themes: ['nord', 'vitesse-dark'],
  engine: createJavaScriptRegexEngine(),
})

function createLLMStream(): ReadableStream<string> {
  return new ReadableStream({
    async start(controller) {
      const code = `function hello() {\n  console.log("world")\n}`
      for (const char of code) {
        controller.enqueue(char)
        await new Promise(r => setTimeout(r, 50))
      }
      controller.close()
    },
  })
}

const tokensStream = createLLMStream()
  .pipeThrough(new CodeToTokenTransformStream({
    highlighter,
    lang: 'javascript',
    theme: 'nord',
    allowRecalls: true,
  }))
```

### 5.4 トークンストリームを手動で消費する

```ts
tokensStream.pipeTo(new WritableStream({
  async write(token) {
    console.log(token)
  },
}))
```

### 5.5 レンダラーでフロントエンドへ統合する

**React:**

```tsx
import { ShikiStreamRenderer } from '@shikijs/stream/react'

export function MyComponent() {
  return <ShikiStreamRenderer stream={tokensStream} />
}
```

**Vue:**

```vue
<script setup>
import { ShikiStreamRenderer } from '@shikijs/stream/vue'
</script>

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

### 5.6 ShikiCachedRenderer でインクリメンタルコードを描画

「トークンを管理せず、伸び続けるコード文字列を描画したい」場合:

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

## 6. 機能一覧

- **ストリーミングハイライト**: テキストストリームをリアルタイムにトークンストリームへ変換（Web Streams API）
- **CodeToTokenStream**: 標準 TransformStream、あらゆるテキストストリームと合成可
- **recall-token 機構**: `allowRecalls` で制御、文脈依存のトークン変化を解決
- **安定トークンモード**: 既定では粗い粒度（行単位）、安定トークンのみ
- **4大フレームワークのレンダラー**: `ShikiStreamRenderer`（Vue/React/Solid/Svelte）
- **CachedRenderer**: インクリメンタル更新コード文字列用のより単純な描画 API（実験的、Vue で完全実装）
- **フレームワーク非依存のコア**: 純粋なストリーム処理ロジック、ゼロ依存
- **手動消費**: `.pipeTo()` + `WritableStream`、または `for await` 反復
- **公式エコシステム**: Shiki 公式リポジトリに `@shikijs/stream` として採択

---

## 7. まとめ: 考察と結論

### 7.1 代表的研究点

1. **「コード全体が揃うまで待ってハイライト」は LLM 時代の終わったパラダイム。** コードがストリームで生成されると、従来の一括ハイライトは描画を停滞させユーザ体験を損ないます。shiki-stream はトークンストリームを充分かけ流し、ハイライトをコードとともに動かす——**バッチ処理からストリーム処理への考え方の転換**です。
2. **recall token はストリーミングハイライトの最重要抽象。** 一方向ストリームは歴史を書き換えられないため、shiki-stream は消費者に「再描画」の recall 信号を受け入れる方式を選ぶ——**一方向ストリームの原理的な限界を回避する優れたプロトコルです。**
3. **標準 Web Streams API こそが正しい基盤。** 独自のストリーミングプロトコルを発明せず、ブラウザネイティブの `TransformStream` を再利用しているため、shiki-stream は **合成可能・パイプ可能・仕様準拠のあらゆるストリームと再利用可能**——最高の相互運用性です。
4. **フレームワーク非依存コア + フレームワーク別アダプタは、多フレームワーク対応ライブラリの教科書的なパターン。** 純粋ロジックにゼロ依存、Vue/React/Solid/Svelte 各々が独立して適応し、互いに干渉しない。
5. **コミュニティパッケージから公式パッケージへ——これこそ需要が実在する証明。** Shiki 公式モノレポへの採択（PR #1283）が価値を裏付け、元リポのアーカイブがその成功を最も強く示しています。

### 7.2 Shiki エコシステムの中での位置づけ

- **Shiki 本体**（約 1.4万スター） — コアエンジン;
- **`@shikijs/stream`**（ストリーミングハイライト、旧 shiki-stream）— 本記事の対象。
- **shiki-magic-move**（コードアニメーション）— 同種のコミュニティパッケージ;
- ソフトウェアは Shiki エコシステム／antfu エコシステムのプロダクト（Slidev、Vitesse など）で広く活用。

### 7.3 開発者への示唆

- LLM プロダクト構築中？ AI 生成コードをリアルタイムにハイライトしたい？ 一括で待つのではなく、**ストリーミングトークン描画を選ぶこと**;
- Web Streams の「パイプライン思考」を学べば、「テキストストリーム → トークンストリーム → 描画ストリーム」を一行にチェーンできます;
- 「オブジェクトの状態が変わり続ける」場合、recall 的な「再描画」モデルは広く使える設計であり、応用に値する。

### 7.4 まとめ

2026年、「LLM + コード生成」が一般化したいま、shiki-stream は小さなツールに見えるけれども、AI 時代のフロントエンドが直面する最大の日常的痛点である**リアルタイムコード表示**を、精密に解決しています。「一方向ストリーム + recall」という優雅な設計が、「ストリーミング」と「ハイライト」という本来相反する二つの要求を結びつけたのです。

> AI が一文字ずつコードを書くようになった以上、フロントエンドも一文字ずつハイライトすることを学ばなければならない。shiki-stream はまさに「非同期に追い付く」ための答えです。

---

## 参考文献

- shiki-stream 公式リポジトリ: https://github.com/antfu/shiki-stream
- 公式ドキュメント（@shikijs/stream）: https://shiki.style/packages/stream
- ライブデモ: https://shiki-stream.netlify.app/
- npm パッケージ: https://www.npmjs.com/package/shiki-stream
- Shiki 本体リポジトリ: https://github.com/shikijs/shiki
- Shiki のストリーミング実装: https://github.com/shikijs/shiki/tree/main/packages/stream