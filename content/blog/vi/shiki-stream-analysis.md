---
title: "shiki-stream Đi Sâu: Để Mã Do LLM Sinh Ra Được Tô Màu Theo Thời Gian Thực, Giống Như Một Chiếc Máy Đánh Chữ"
description: "Bài phân tích toàn diện về shiki-stream, được Anthony Fu (antfu) mở nguồn — một thư viện tô màu cú pháp theo dòng (streaming) xây dựng trên Web Streams API, được thiết kế riêng cho tình huống 'mã do LLM sinh ra'. Từ hiểu biết cốt lõi rằng mã đến dần dần nên việc tô màu cũng phải dần dần, đến CodeToTokenTransformStream biến một luồng văn bản thành luồng token ngay trên đường đi, từ cơ chế recall-token khéo léo giải quyết vấn đề 'cú pháp phụ thuộc vào ngữ cảnh', đến các renderer Vue/React/Solid/Svelte có sẵn ngay và hướng dẫn cài đặt/sử dụng đầy đủ — bài viết này giải thích vì sao dự án 594 sao này trở thành @shikijs/stream chính thức."
date: "2026-08-03"
author: "TopDigg Research Team"
tags: ["shiki-stream", "Shiki", "Syntax Highlighting", "Streaming", "LLM", "Web Streams API", "anthu", "Vue", "React", "Solid", "TypeScript", "CodeToTokenTransformStream"]
categories: ["Deep Dive"]
keywords: ["shiki-stream", "Shiki tô màu theo dòng", "tô màu cú pháp", "đầu ra theo dòng", "tô màu mã LLM", "Web Streams API", "CodeToTokenTransformStream", "Recall Token", "Anthony Fu", "@shikijs/stream", "hiển thị tăng dần", "hiển thị mã AI"]
---

# shiki-stream Đi Sâu: Để Mã Do LLM Sinh Ra Được Tô Màu Theo Thời Gian Thực, Giống Như Một Chiếc Máy Đánh Chữ

> Ý tưởng cốt lõi: **"Mã đến dần dần, nên việc tô màu cú pháp cũng phải hoạt động dần dần."** Khi một LLM phun mã ra từng ký tự một — giống hệt một người đánh máy — cách tiếp cận truyền thống "chờ toàn bộ mã rồi mới tô màu" sụp đổ. shiki-stream trả lời một cách thanh lịch bằng **Web Streams API**: nó biến một luồng văn bản thành luồng token ngay trên đường đi, tô màu mã tại đúng thời điểm mã được tạo ra, và giới thiệu một **cơ chế recall-token** để giải quyết vấn đề khó nhất của tô màu cú pháp theo dòng — sự thật rằng cú pháp phụ thuộc vào ngữ cảnh.

---

## 1. Tổng Quan Dự Án

### 1.1 Nó Là Gì?

**shiki-stream** là một **thư viện tô màu cú pháp theo dòng (streaming syntax-highlighting)** do Anthony Fu (antfu) mở nguồn — một lớp bọc tô màu tăng dần/theo dòng được xây quanh engine tô màu cú pháp Shiki.

Mô tả một dòng chính thức:

- **"Streaming highlighting with Shiki. Useful for highlighting text streams like LLM outputs."**

Các sự thật chính:

- Kho lưu trữ: `https://github.com/antfu/shiki-stream`
- Số sao: **~594**
- Tác giả: **Anthony Fu (antfu)** — thành viên nhóm lõi Vue, người đóng góp lõi Vite, tác giả của UnoCSS, Slidev, Vitesse
- Giấy phép: MIT
- Ngôn ngữ: TypeScript / JavaScript
- Ngày tạo: tháng 2 năm 2025
- Trạng thái: **Đã lưu trữ (Archived)** — vì phần triển khai đã chuyển sang `@shikijs/stream` chính thức của Shiki
- Demo trực tiếp: https://shiki-stream.netlify.app/

### 1.2 Nó Giải Quyết Vấn Đề Gì?

Hãy tưởng tượng dùng ChatGPT hoặc Claude để tạo mã: **AI không xuất ra cả một khối cùng lúc — nó đi từng ký tự, từng token, giống như một chiếc máy đánh chữ.** Các bộ tô màu cú pháp truyền thống — kể cả Shiki gốc — giả định "bạn đã có toàn bộ mã," vốn sụp đổ trong các tình huống streaming:

- **Mã đến dần dần** — tại mỗi thời điểm bạn chỉ có một mảnh nhỏ;
- **Việc phân tích phụ thuộc vào ngữ cảnh** — các ký tự trước có thể thay đổi nghĩa của các ký tự sau (ví dụ một dòng bắt đầu bằng `// ` nuốt chửng mọi thứ sau nó; một chuỗi/dấu ngoặc chưa đóng ảnh hưởng đến những gì theo sau);
- **Việc hiển thị phải tức thời** — người dùng không muốn chờ toàn bộ luồng trước khi thấy tô màu.

Câu trả lời của shiki-stream: **dùng Web Streams API tiêu chuẩn để chuyển đổi một luồng chuỗi thành luồng token tô màu theo thời gian thực**, để việc tô màu chạy song song với quá trình tạo sinh.

---

## 2. Triết Lý Cốt Lõi

### 2.1 Từ "Tô Màu Hàng Loạt" Đến "Tô Màu Theo Dòng"

Đường ống truyền thống là:

**Toàn bộ mã → tokenize một lần → tô màu một lần**

Đường ống của shiki-stream thì ngược lại:

**Luồng chuỗi → tokenize ngay trên đường đi → xuất bản token → hiển thị tăng dần**

Nó thay thế giả định "đầu vào tĩnh" bằng "đầu vào động," để việc tô màu có thể thực sự áp dụng cho đầu ra streaming.

### 2.2 API Cốt Lõi: CodeToTokenTransformStream

Trái tim của shiki-stream là một `TransformStream` Web tiêu chuẩn chuyển đổi `ReadableStream<string>` thành `ReadableStream<ThemedToken | RecallToken>`:

```ts
import { CodeToTokenScrollStream, ... } from '@shikijs/stream'
import { createHighlighter } from 'shiki'

// 1. Tạo bộ tô màu Shiki
const highlighter = await createHighlighter({
  langs: ['javascript'],
  themes: ['nord'],
})

// 2. Luồng văn bản bạn muốn tô màu (ví dụ một đầu ra LLM)
const textStream = getTextStreamFromSomewhere()

// 3. Đưa luồng văn bản qua một luồng token
const tokensStream = textStream
  .pipeThrough(new CodeToTokenTransformStream({
    highlighter,
    lang: 'javascript',
    theme: 'nord',
    allowRecalls: true, // xem giải thích bên dưới
  }))
```

### 2.3 Recall Tokens

Vì việc tô màu phụ thuộc vào ngữ cảnh mã, **các token đã phát ra trước đó có thể thay đổi khi luồng tiến về phía trước.** Nhưng luồng là một chiều — bạn không thể viết lại lịch sử. Vì vậy shiki-stream giới thiệu một **recall token** đặc biệt báo cho phía nhận bỏ đi N token đã phát ra cuối cùng vốn đã thay đổi:

```ts
const receivedTokens: ThemedToken[] = []

tokensStream.pipeTo(new WritableStream({
  async write(token) {
    if ('recall' in token) {
      // bỏ đi token.recall token cuối cùng
      receivedTokens.length -= token.recall
    }
    else {
      receivedTokens.push(token)
    }
  },
}))
```

Núm điều chỉnh chính: `allowRecalls`:

- **Mặc định `allowRecalls: false`** — chỉ các token ổn định được phát ra, ở độ chi tiết thô hơn (thường theo từng dòng), cho các consumer đơn giản;
- **`allowRecalls: true`** — các token chi tiết hơn được phát ra, và component của framework xử lý "recall-redraw," cho các component Vue / React / Solid.

> Nói trong một câu: **recall là một câu trả lời kỹ thuật thanh lịch cho "luồng không thể quay lại — nên hãy bảo consumer vẽ lại."**

---

## 3. Kiến Trúc Kỹ Thuật

### 3.1 Xây Trên Web Streams API Tiêu Chuẩn

Toàn bộ phần lõi được xây trên **Web Streams API** gốc của trình duyệt/Node, không cần thư viện luồng phụ nào:

- `ReadableStream`
- `WritableStream`
- `TransformStream`

Đây là nền tảng của tính tổ hợp (composability) — bất kỳ luồng văn bản nào cũng có thể `.pipeThrough()` một `CodeToTokenTransformStream` để trở thành luồng token, rồi được tiêu thụ bằng `.pipeTo()`.

### 3.2 Renderer Của Các Framework (Có Sẵn Ngay)

Ngoài việc tiêu thụ luồng token thủ công, shiki-stream cung cấp sẵn một component `ShikiStreamRenderer` cho bốn framework frontend lớn — chỉ cần truyền luồng vào:

- **Vue** — `@shikijs/stream/vue`
- **React** — `@shikijs/stream/react`
- **Solid** — `@shikijs/stream/solid`
- **Svelte** — `@shikijs/stream/svelte`

```vue
<script setup lang="ts">
import { ShikiStreamRenderer } from '@shikijs/stream/vue'
// lấy luồng token
</script>

<template>
  <ShikiStreamRenderer :stream="tokensStream" />
</template>
```

### 3.3 CachedRenderer (Thử Nghiệm)

shiki-stream cũng cung cấp một API renderer đơn giản hơn, `ShikiCachedRenderer`, để hiển thị **các chuỗi mã được cập nhật tăng dần** — bạn giữ một biến `ref('')` và nối thêm vào; không cần xử lý token thủ công:

```vue
<script setup lang="ts">
import { ShikiCachedRenderer } from '@shikijs/stream/vue'
import { createHighlighter } from 'shiki'

const highlighter = await createHighlighter({
  langs: ['javascript'],
  themes: ['vitesse-light'],
})

const code = ref('') // code chỉ nên được cập nhật tăng dần

// Chỉ để minh họa
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

### 3.4 Ngăn Xếp Công Nghệ Lõi

- **Shiki**: engine tô màu cú pháp bên dưới (~14K repo chính)
- **Vue** ≥ 3.2 (tùy chọn)
- **React** ≥ 19 (tùy chọn)
- **Solid-js** ≥ 1.9 (tùy chọn)
- **Web Streams API** — không thêm bất kỳ phụ thuộc luồng nào

---

## 4. Triết Lý Thiết Kế

### 4.1 "Được xây cho một nhu cầu thực, không phải over-engineering"

Trong PR đưa shiki-stream và các gói cộng đồng liên quan vào monorepo chính thức của Shiki, Anthony Fu đã viết:

> "Ports two community packages — antfu/shiki-stream and shikijs/shiki-magic-move — into this monorepo as official @shikijs/* packages."

Điều này xác nhận tô màu theo dòng là **một điểm đau thực sự** — mang tính thời đại trong kỷ nguyên LLM, các luồng mã ở khắp mọi nơi, và kiểu tô màu toàn-bộ-mã kinh điển thất bại — nên đây không phải over-engineering mà là chính xác đúng chỗ.

### 4.2 Đưa Ra Lựa Chọn, Không Quyết Định Thay Bạn

Thiết kế `allowRecalls` phản ánh một triết lý đánh đổi rõ ràng:

- **Chế độ ổn định (mặc định)**: độ chi tiết thô hơn (từng dòng), đơn giản và nhanh — phù hợp hầu hết consumer;
- **Chế độ recall**: độ chi tiết mịn hơn (từng token), cần "recall-redraw" ở phía sau — thanh lịch hơn.

**Đừng áp một giải pháp cho mọi tình huống; để lại sự đánh đổi cho người dùng.**

### 4.3 Trừu Tượng Không Phụ Thuộc Framework + Adapter Riêng Cho Từng Framework

Phần lõi `CodeToTokenTransformStream` hoàn toàn không phụ thuộc framework (thuần Web Streams API); các phần riêng cho framework (renderer Vue/React/Solid/Svelte) nằm trong các adapter tùy chọn riêng biệt. **Logic lõi có zero phụ thuộc framework; các adapter sống độc lập** — khớp với triết lý "tách core khỏi integrations" của Shiki.

---

## 5. Hướng Dẫn Đầy Đủ: Bắt Đầu Với shiki-stream

> Lưu ý: theo hướng dẫn chính thức mới nhất, hãy import từ `@shikijs/stream` (từ v4.2.0 / v0.1.5, `shiki-stream` chỉ là một re-export mỏng — đổi tên gói để giữ nguyên các import hiện có hoạt động).

### 5.1 Cài Đặt

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

### 5.2 Di Chuyển Từ Gói Cũ

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

### 5.3 Tô Màu Theo Dòng Cơ Bản (Ví Dụ Hoàn Chỉnh)

```ts
import { CodeToTokenTransformStream } from '@shikijs/stream'
import { createHighlighter, createJavaScriptRegexEngine } from 'shiki'

// 1. Tạo bộ tô màu
const highlighter = await createHighlighter({
  langs: ['javascript', 'typescript', 'python'],
  themes: ['nord', 'vitesse-dark'],
  engine: createJavaScriptRegexEngine(),
})

// 2. Tạo một luồng đầu ra LLM giả lập
function createLLMStream(): ReadableStream<string> {
  return new ReadableStream({
    async start(controller) {
      const code = `function hello() {\n  console.log("world")\n}`
      for (const char of code) {
        controller.enqueue(char)
        await new Promise(r => setTimeout(r, 50)) // mô phỏng quá trình gõ
      }
      controller.close()
    },
  })
}

// 3. Đưa nó qua: luồng văn bản → luồng token
const tokensStream = createLLMStream()
  .pipeThrough(new CodeToTokenTransformStream({
    highlighter,
    lang: 'javascript',
    theme: 'nord',
    allowRecalls: true,
  }))

// 4. Tiêu thụ luồng token
for await (const token of tokensStream) {
  console.log(token)
}
```

### 5.4 Tiêu Thụ Luồng Token Thủ Công

```ts
tokensStream.pipeTo(new WritableStream({
  async write(token) {
    console.log(token)
  },
}))
```

### 5.5 Tích Hợp Vào Các Framework Frontend Với Renderers

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

### 5.6 Hiển Thị Mã Tăng Dần Với ShikiCachedRenderer

Cho "không muốn quản lý token, chỉ muốn hiển thị một chuỗi mã đang ngày càng lớn":

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

## 6. Danh Sách Tính Năng

- **Tô màu theo dòng**: chuyển đổi một luồng văn bản thành luồng token theo thời gian thực (Web Streams API)
- **CodeToTokenTransformStream**: một TransformStream tiêu chuẩn, pipe được với bất kỳ luồng văn bản nào
- **Cơ chế recall-token**: điều khiển bởi `allowRecalls`, giải quyết các thay đổi token phụ thuộc ngữ cảnh
- **Chế độ stable-token**: mặc định độ chi tiết thô hơn (từng dòng), chỉ các token ổn định
- **Bốn renderer framework**: `ShikiStreamRenderer` cho Vue / React / Solid / Svelte
- **CachedRenderer**: API hiển thị đơn giản hơn cho các chuỗi mã cập nhật tăng dần (thử nghiệm, triển khai đầy đủ cho Vue)
- **Lõi không phụ thuộc framework**: logic xử lý luồng thuần túy, zero phụ thuộc framework
- **Tiêu thụ thủ công**: `.pipeTo()` + `WritableStream`, hoặc vòng lặp `for await`
- **Hệ sinh thái chính thức**: được tiếp nhận vào repo chính thức của Shiki với tên `@shikijs/stream`

---

## 7. Tóm Tắt: Quan Điểm và Kết Luận

### 7.1 Quan Điểm Cốt Lõi

1. **"Chờ toàn bộ mã rồi tô màu" là một mô hình đã chết trong kỷ nguyên LLM.** Khi mã được tạo sinh dưới dạng luồng, kiểu tô màu hàng loạt kinh điển làm trì hoãn việc hiển thị và làm chậm trải nghiệm; shiki-stream phát ra một luồng token tiến dần để việc tô màu trở nên sống động cùng với mã — **một nâng cấp tư duy từ xử lý hàng loạt sang xử lý luồng.**
2. **Recall token là trừu tượng chủ chốt của tô màu theo dòng.** Vì luồng một chiều không thể viết lại lịch sử, shiki-stream để consumer chấp nhận một tín hiệu recall "vẽ lại" — **một giao thức thanh lịch né quanh giới hạn nền tảng của luồng một chiều.**
3. **Web Streams API tiêu chuẩn là nền tảng đúng đắn.** Nó không phát minh ra một giao thức streaming mới — nó tái sử dụng `TransformStream` gốc của trình duyệt, khiến shiki-stream **có thể tổ hợp, pipe được, và tái sử dụng với bất kỳ luồng tuân thủ spec nào** — khả năng tương tác hạng nhất.
4. **Một lõi không phụ thuộc framework cộng các adapter riêng cho từng framework là một khuôn mẫu kinh điển cho các thư viện đa framework.** Logic thuần túy với zero phụ thuộc; Vue/React/Solid/Svelte mỗi cái tự thích ứng mà không can thiệp lẫn nhau.
5. **Từ gói cộng đồng đến gói chính thức là bằng chứng tốt nhất rằng một nhu cầu là thực.** Việc được tiếp nhận vào monorepo chính thức của Shiki (PR #1283) xác thực giá trị của nó với hệ sinh thái — và việc lưu trữ repo gốc là bằng chứng mạnh nhất về thành công của nó.

### 7.2 Vị Trí Của Nó Trong Hệ Sinh Thái Shiki

- **Shiki main repo** (~14K sao) — engine lõi;
- **`@shikijs/stream`** (tô màu theo dòng, trước đây là shiki-stream) — chủ đề của bài viết này;
- **shiki-magic-move** (animation khối mã) — một gói cộng đồng tương tự;
- Được dùng rộng rãi trong hệ sinh thái Shiki / hệ sinh thái antfu như Slidev và Vitesse.

### 7.3 Bài Học Cho Nhà Phát Triển

- Đang xây sản phẩm LLM? Muốn mã do AI sinh ra được tô màu theo thời gian thực? Hiển thị token theo dòng là câu trả lời — đừng chờ toàn bộ mã;
- Học "tư duy đường ống" của Web Streams để bạn có thể nối "luồng văn bản → luồng token → luồng hiển thị" thành một dòng duy nhất đầy sức mạnh;
- Khi "trạng thái đối tượng liên tục thay đổi," mô hình recall "vẽ lại" là một khuôn mẫu dùng được rộng rãi đáng để học theo.

### 7.4 Kết Luận

Vào năm 2026, khi "LLM + tạo mã" đã trở thành xu thế chủ đạo, shiki-stream trông có vẻ là một công cụ nhỏ — nhưng nó giải quyết chính xác một trong những cơn đau hằng ngày lớn nhất của frontend trong kỷ nguyên AI: hiển thị mã theo thời gian thực. Với thiết kế thanh lịch "luồng một chiều + recall," nó khâu lại hai nhu cầu vốn mâu thuẫn nhau là "streaming" và "highlighting."

> Khi AI bắt đầu viết mã từng ký tự một, frontend phải học cách tô màu từng ký tự một. shiki-stream là câu trả lời cho "theo kịp một cách bất đồng bộ."

---

## References

- Repo chính thức shiki-stream: https://github.com/antfu/shiki-stream
- Tài liệu chính thức (@shikijs/stream): https://shiki.style/packages/stream
- Demo trực tiếp: https://shiki-stream.netlify.app/
- Gói npm: https://www.npmjs.com/package/shiki-stream
- Repo chính Shiki: https://github.com/shikijs/shiki
- Triển khai streaming của Shiki: https://github.com/shikijs/shiki/tree/main/packages/stream
