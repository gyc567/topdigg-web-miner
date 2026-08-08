---
title: "Cloudflare Computer 深度解析：給你的 Agent 一台電腦"
description: "全面解析 Cloudflare Computer — Cloudflare 開源的虛擬檔案系統。深度探討其設計哲學、SQLite 持久化架構、多後端執行引擎、FUSE 掛載機制以及它為何代表了 AI Agent 基礎設施的未來範式。"
date: "2026-08-08"
author: "TopDigg Research Team"
tags: ["Cloudflare Computer", "Durable Objects", "AI Agent", "虛擬檔案系統", "SQLite", "FUSE", "開源", "Workers", "容器", "雲原生"]
categories: ["深度解析"]
keywords: ["Cloudflare Computer", "虛擬檔案系統", "Durable Objects", "AI Agent基礎設施", "SQLite持久化", "FUSE掛載", "多後端執行", "雲原生Agent"]
---

> **Cloudflare Computer** 是 Cloudflare 開源的虛擬檔案系統，它為 AI Agent 提供了一個持久化、可攜帶的工作目錄。本全面分析涵蓋項目的架構、設計哲學、實用教程以及 AI 基礎設施的核心洞察。

---

## 1. 專案說明

### 1.1 什麼是 Cloudflare Computer?

Cloudflare Computer 是一個生活在 Durable Object 內部的虛擬檔案系統。它提供了一個持久化的、基於 SQLite 的工作空間，具有可插拔的執行後端，專為需要小型、可攜帶工作目錄的 AI Agent 設計。

這不是傳統的檔案系統或雲端儲存。Cloudflare Computer 是一個完整的「Agent 計算機」概念——它不僅提供檔案儲存，還提供執行環境，讓 Agent 可以在其中讀取、寫入和執行程式碼。

### 1.2 核心特性

| 特性 | 詳情 |
|------|------|
| **持久化檔案系統** | 基於 SQLite 的虛擬檔案系統，跨 DO 重啟持久化 |
| **多後端執行** | Container、Worker Shell、Worker JavaScript 三種執行引擎 |
| **AI SDK 工具** | 內建 read、write、edit、ls、exec 等 Agent 工具 |
| **Git 整合** | 基於 isomorphic-git 的客戶端，直接操作 SQLite VFS |
| **R2 只讀掛載** | 從 R2 桶預填充只讀資料到工作空間 |
| **資產共享** | 透過 presigned URL 或 Cloudflare Artifacts 分享檔案 |
| **多後端路由** | 一個工作空間可註冊多個後端，按名稱路由執行 |

### 1.3 關鍵概念

#### 工作空間模式——Agent 的「家」

Cloudflare Computer 圍繞工作空間模式建構。每個 Agent 獲得一個獨立的工作空間，包含：

1. **檔案系統**：`workspace.fs` 提供類似 Node.js `fs/promises` 的 API
2. **執行引擎**：`workspace.runtime.exec()` 執行命令或模組
3. **持久化狀態**：所有操作都持久化到 Durable Object 的 SQLite 儲存

這種設計讓 Agent 擁有了一個真正的「家」——一個可以持久保存狀態、執行程式碼、管理檔案的環境。

#### 三後端架構——靈活性的核心

Cloudflare Computer 提供三種執行後端，每種都有不同的特性：

| 後端 | 執行環境 | 特點 |
|------|----------|------|
| **Container** | 完整 Linux 使用者空間 | 真實二進位檔、npm、node、網路 |
| **Worker Shell** | Dynamic Worker 中的 just-bash | 快速、無需容器 |
| **Worker JavaScript** | Dynamic Worker 中的 ECMAScript 模組 | 結構化 I/O、持久化匯入 |

**單一執行入口**：`workspace.runtime.exec(source, { backend })` 是唯一的執行入口點。`source` 的含義取決於後端：對於 shell 後端是命令，對於 JavaScript 後端是模組。

#### 同步協議——資料一致性保障

Cloudflare Computer 使用雙向同步協議，確保 Durable Object 的 SQLite 儲存與執行環境之間的資料一致性：

- **推送**：將 DO 端的寫入推送到配置的後端
- **拉取**：將後端的寫入拉回到 DO
- **內容定址**：使用 blob 快取和 LRU 策略
- **基於修訂**：追蹤變更歷史

---

## 2. 設計哲學

### 2.1 一切皆工作空間

Cloudflare Computer 的設計哲學是**一切皆工作空間**。檔案系統、執行引擎、Git 客戶端、資產共享——所有這些都圍繞工作空間建構。

這不是偶然的設計選擇，而是深思熟慮的架構決策：

1. **統一抽象**：工作空間是唯一的抽象層，所有操作都透過它進行
2. **可組合性**：不同的後端可以組合使用，支援複雜的工作流
3. **可攜性**：工作空間可以在不同的執行環境之間遷移

### 2.2 可插拔後端——按需選擇

Cloudflare Computer 的核心創新是可插拔後端架構。`workspace.runtime.exec()` 是唯一的執行入口點，後端定義了 `source` 是 shell 命令還是 ECMAScript 模組。

這種設計支援：
- **靈活性**：根據任務需求選擇最合適的後端
- **可擴展性**：可以新增新的執行後端
- **成本優化**：快速任務用 Worker Shell，複雜任務用 Container

### 2.3 持久化優先——狀態即資產

Cloudflare Computer 將持久化視為核心特性。所有檔案操作都持久化到 Durable Object 的 SQLite 儲存，跨重啟保持不變。

這與傳統的無狀態 Agent 框架有很大不同。傳統框架中，Agent 的狀態通常儲存在外部資料庫或檔案系統中。Cloudflare Computer 將狀態直接嵌入到 Agent 的工作空間中，使狀態管理變得簡單而可靠。

---

## 3. 詳細教程

### 3.1 安裝與設定

#### 安裝套件

```bash
npm install @cloudflare/computer
```

#### Wrangler 設定

```json
{
  "compatibility_flags": ["nodejs_compat"],
  "durable_objects": {
    "bindings": [
      { "name": "Agent", "class_name": "Agent" }
    ]
  },
  "migrations": [
    { "tag": "v1", "new_sqlite_classes": ["Agent"] }
  ]
}
```

#### 最小化範例——僅檔案系統

```typescript
import { withWorkspace, getWorkspace } from "@cloudflare/computer";
import { DurableObject } from "cloudflare:workers";

export class Agent extends withWorkspace(
  class extends DurableObject<Env> {},
  (self) => ({ storage: self.ctx.storage }),
) {}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const id = env.Agent.idFromName("user-123");
    using ws = await getWorkspace(env.Agent.get(id));

    await ws.fs.writeFile("/notes.md", "- [ ] ship it\n");
    const notes = await ws.fs.readFile("/notes.md", "utf8");

    return new Response(notes);
  },
} satisfies ExportedHandler<Env>;
```

### 3.2 新增執行後端

#### Worker Shell 後端（建議入門）

```typescript
import { withWorkspace, getWorkspace } from "@cloudflare/computer";
import { WorkerShellBackend } from "@cloudflare/computer/backends/worker-shell";
import curlModules from "@cloudflare/computer/shell/curl";
import { DurableObject } from "cloudflare:workers";

export class Agent extends withWorkspace(
  class extends DurableObject<Env> {},
  (self) => ({
    storage: self.ctx.storage,
    backends: [
      new WorkerShellBackend({
        loader: self.env.LOADER,
        workspace: { binding: "Agent", id: self.ctx.id.toString() },
        ctx: self.ctx,
        commands: [curlModules],
      }),
    ],
  }),
) {}
```

新增 Worker Loader 繫結到 `wrangler.jsonc`：

```json
{
  "compatibility_flags": ["nodejs_compat", "experimental"],
  "worker_loaders": [{ "binding": "LOADER" }]
}
```

#### Container 後端（完整 Linux 環境）

```typescript
import { Workspace } from "@cloudflare/computer";
import {
  CloudflareContainerBackend,
  withWorkspaceContainer,
} from "@cloudflare/computer/backends/container";
import { DurableObject } from "cloudflare:workers";

export class Agent extends withWorkspaceContainer(class extends DurableObject<Env> {}) {
  readonly workspace = new Workspace({
    storage: this.ctx.storage,
    backends: [
      new CloudflareContainerBackend({
        container: () => this,
        workspace: { binding: "Agent", id: this.ctx.id.toString() },
      }),
    ],
  });
}
```

### 3.3 檔案系統操作

```typescript
using ws = await getWorkspace(env.Agent.get(id));

// 寫入檔案
await ws.fs.writeFile("/notes/todo.md", "- [ ] ship it\n");
await ws.fs.writeFile("/data/blob.bin", new Uint8Array([1, 2, 3]));
await ws.fs.writeFile("/uploads/big.csv", request.body!);

// 讀取檔案
const todo = await ws.fs.readFile("/notes/todo.md", "utf8");
const stream = await ws.fs.readFile("/uploads/big.csv");

// 目錄操作
await ws.fs.mkdir("/notes/daily", { recursive: true });
for (const entry of await ws.fs.readdir("/notes")) {
  console.log(entry.isDirectory ? `d ${entry.name}` : `f ${entry.name}`);
}

// 刪除和搜尋
await ws.fs.rm("/notes/daily", { recursive: true });
const hits = await ws.fs.grep("TODO", "/", { ignoreCase: true });
```

### 3.4 執行命令和程式碼

```typescript
// 執行 shell 命令
using run = await ws.runtime.exec("ls -la /workspace", { encoding: "utf8" });
const { stdout, exitCode } = await run.result();

// 即時串流輸出（Server-Sent Events）
async fetch(request: Request) {
  const run = await ws.runtime.exec("npm test", { encoding: "utf8" });

  const sse = run.pipeThrough(
    new TransformStream({
      transform(event, controller) {
        const frame = `event: ${event.name}\ndata: ${JSON.stringify(event.value)}\n\n`;
        controller.enqueue(new TextEncoder().encode(frame));
      },
    }),
  );

  return new Response(sse, {
    headers: {
      "content-type": "text/event-stream",
      "cache-control": "no-cache",
    },
  });
}
```

### 3.5 Git 操作

```typescript
import { Workspace } from "@cloudflare/computer";
import { createGitClient } from "@cloudflare/computer/git";

const ws = new Workspace({
  storage: ctx.storage,
  git: createGitClient(),
  defaultGitIdentity: { name: "Agent", email: "agent@example.test" },
});

await ws.git.clone({ url: "https://github.com/example/repo.git" });
await ws.fs.writeFile("/notes.md", "hello");
await ws.git.add({ paths: ["notes.md"] });
await ws.git.commit({ message: "add notes" });
```

### 3.6 AI Agent 工具

```typescript
import { createAITools } from "@cloudflare/computer/tools";

const tools = createAITools({
  workspace,
  read: { maxBytes: 32 * 1024, maxLines: 800 },
  shell: {
    defaultBackend: "shell",
    backends: {
      shell: { description: "Fast Worker shell with built-in text commands." },
      container: { description: "Full Linux userland in a Cloudflare Container." },
    },
  },
});

// 將工具傳遞給 AI SDK
const result = await generateText({
  model: openai("gpt-4"),
  tools,
  prompt: "幫我分析這個程式碼庫",
});
```

---

## 4. 核心架構深度解析

### 4.1 套件結構

Cloudflare Computer 是一個小型 monorepo，包含以下套件：

| 套件 | 用途 |
|------|------|
| `@cloudflare/dofs` | Durable Object SQLite 支援的虛擬檔案系統 |
| `@cloudflare/computer-rpc` | capnweb 線協議和伺服器/客戶端輔助器 |
| `@cloudflare/computerd` | FUSE 掛載 + RPC 伺服器守護行程 |
| `@cloudflare/computer` | 頂級套件，Durable Objects 使用的 Workspace 門面 |
| `@cloudflare/computer/tools` | AI SDK 工具：read、write、edit、ls、exec |

### 4.2 同步協議

Cloudflare Computer 使用內容定址的 blob 快取和基於修訂的變更追蹤：

```
Durable Object (SQLite)
    ↓ 推送
同步協議
    ↓
執行環境 (Container/Worker)
    ↓ 拉取
Durable Object (SQLite)
```

關鍵特性：
- **內容定址**：使用 blob 雜湊進行去重
- **LRU 快取**：限制記憶體使用
- **緩衝寫入**：為 FUSE 提供寫緩衝
- **原子操作**：確保資料一致性

### 4.3 FUSE 掛載機制

Container 後端使用 FUSE（使用者空間檔案系統）將 SQLite 狀態投影到容器中：

```
Container
    ↓ FUSE 掛載
computerd 守護行程
    ↓ capnweb RPC
Durable Object
    ↓ SQLite
持久化儲存
```

`computerd` 是一個守護行程，它：
1. 掛載 FUSE 檔案系統
2. 透過 HTTP/WebSocket RPC 與 Durable Object 通訊
3. 同步檔案系統變更

### 4.4 效能特性

根據官方基準測試：

- **元資料密集型操作**：FUSE 掛載優於真實磁碟
- **大順序 I/O**：略遜於真實磁碟
- **容器檔案系統**：保持在記憶體中（~10 GB 限制，與 DO 共享）
- **冷啟動**：Container 較慢，Worker Shell 較快

---

## 5. 歸納總結

### 5.1 為什麼 Cloudflare Computer 重要?

Cloudflare Computer 代表了 AI Agent 基礎設施的重要進化。它不僅僅是一個檔案系統，而是一個完整的「Agent 計算機」概念。

**三個核心洞察**：

1. **工作空間即 Agent 的家**：持久化的工作空間讓 Agent 擁有了真正的狀態管理能力
2. **可插拔後端**：靈活的執行引擎支援不同的工作負載
3. **同步協議**：確保資料一致性，支援複雜的協作場景

### 5.2 與其他工具的比較

| 特性 | Cloudflare Computer | GitHub Codespaces | Replit | Vercel |
|------|---------------------|-------------------|--------|--------|
| **持久化** | ✅ SQLite in DO | ❌ 臨時 | ✅ | ❌ |
| **執行後端** | ✅ 3種 | ✅ 容器 | ✅ 容器 | ❌ |
| **AI 工具** | ✅ 內建 | ❌ | ❌ | ❌ |
| **Git 整合** | ✅ isomorphic-git | ✅ | ✅ | ✅ |
| **成本** | 按使用付費 | 按時間付費 | 按時間付費 | 按部署付費 |
| **開源** | ✅ MIT | ❌ | ❌ | ❌ |

### 5.3 適用場景

**最適合**：
- 需要持久化狀態的 AI Agent
- 需要執行程式碼的 Agent 工作流
- 需要檔案系統操作的自動化任務
- 需要 Git 操作的程式碼管理場景

**不太適合**：
- 大規模 monorepo（10 GB 限制）
- 高 I/O 密集型工作負載
- 需要完整 Linux 環境的複雜應用

### 5.4 設計哲學總結

Cloudflare Computer 的設計哲學可以概括為：

1. **一切皆工作空間**：統一的抽象層，所有操作都透過它進行
2. **可插拔後端**：按需選擇執行引擎，支援靈活的工作流
3. **持久化優先**：狀態即資產，跨重啟保持不變
4. **AI 原生**：內建 Agent 工具，支援 AI SDK 整合
5. **雲原生**：利用 Cloudflare 的全球網路和邊緣運算能力

---

## 6. 路線圖

基於項目的發展趨勢和 AI Agent 基礎設施的演進：

### 短期（3-6 個月）
- 更多執行後端支援
- 改進的同步協議效能
- 更豐富的 AI 工具集

### 中期（6-12 個月）
- 多 Agent 協作工作空間
- 企業級安全和合規功能
- 與主流 AI 框架深度整合

### 長期（1-2 年）
- 完全自主的 Agent 計算平台
- 跨組織的 Agent 協作網路
- AI 驅動的軟體工程基礎設施

---

## 7. 總結

Cloudflare Computer 是一個開創性的 AI Agent 基礎設施，它為 Agent 提供了一個持久化、可攜帶的工作目錄。透過 SQLite 持久化、可插拔執行後端和同步協議，它不僅僅是一個檔案系統，而是一個完整的「Agent 計算機」概念。

**核心價值**：
- **持久化工作空間**：跨重啟保持狀態
- **可插拔後端**：靈活的執行引擎
- **AI 原生工具**：內建 Agent 工具支援
- **雲原生架構**：利用 Cloudflare 全球網路

**為什麼選擇 Cloudflare Computer?**
- 開源透明（MIT 許可證）
- 真正的持久化狀態管理
- 靈活的執行後端選擇
- 內建 AI Agent 工具

**立即開始**：
```bash
# 安裝
npm install @cloudflare/computer

# 查看範例
git clone https://github.com/cloudflare/computer.git
cd computer/examples/worker-shell
npm install
npm start
```

---

> **聲明**：本文基於 Cloudflare Computer 公開文件和技術分析撰寫，旨在提供全面的技術解析和實踐指南。注意：該項目目前處於預覽階段，API 不穩定，不建議在生產環境中使用。
