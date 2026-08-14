---
title: "AI 代理的代碼整潔之道——代理時代的原則重新排序"
date: "2026-08-14"
description: "深度解析 2026 年代碼整潔原則的重新排序——當代碼的讀者從人類程式設計師變為 AI 代理時，哪些原則變得至關重要，哪些原則變成了基礎設施"
tags:
  - Clean Code
  - AI 代理
  - 代碼規範
  - AI 編程
  - 軟體工程
  - TDD
  - SOLID
  - TypeScript
categories:
  - 軟體工程
  - AI 編程
  - 代碼品質
  - 最佳實踐
  - 開發者體驗
---

# AI 代理的代碼整潔之道——代理時代的原則重新排序

## 前言

2026 年，一個根本性的轉變正在悄然發生：**代碼的讀者從人類程式設計師變成了 AI 代理**。

這個變化不是漸進的，而是顛覆性的。當我們寫代碼給人類閱讀時，我們遵循的是 2008 年 Robert Martin 提出的 Clean Code 原則。但現在，這些原則的優先級需要被重新排序——因為 AI 代理有著與人類完全不同的約束和特點。

---

## 核心論點

### 發生了什麼變化？

```
2008 年的世界：                    2026 年的世界：
─────────────────               ─────────────────
代碼 → 人類閱讀                  代碼 → AI 代理讀取
↓                               ↓
人類程式設計師的視角              AI 代理的視角
• 可讀性重要                     • 上下文窗口有限
• 審美偏好                      • token 成本真實存在
• 團隊習慣                     • 工具調用消耗資源
• 代碼審查                     • 延遲直接影響體驗
```

### 核心洞察

> **「沒有任何 LLM 默認做到這些。」**

沒有明確的指示，代理會產生 2000 行的函數、沒有測試、重複邏輯、2000 行的文件。**乾淨的代碼從來不是時尚——它變成了基礎設施。**

---

## AI 代理的關鍵約束

```
┌─────────────────────────────────────────────────────────────┐
│                    AI 代理的關鍵約束                              │
├─────────────────────────────────────────────────────────────┤
│  📏 文件截斷 (File Truncation)                                  │
│  ├── 大多數代理 CLI 將讀取限制在 ~2000 行/塊                     │
│  └── 超過這個限制？文件被截斷，上下文丟失                          │
│                                                                  │
│  🧠 注意力衰減 (Attention Degradation)                          │
│  ├── 在聲稱的限制之前，質量就已經下降                              │
│  └── 接近上下文限制時，代理開始遺忘重要細節                        │
│                                                                  │
│  🔍 Grep 比 Read 便宜                                           │
│  ├── 詞法搜索 + 智能讀取 > 向量檢索                             │
│  └── 代理需要知道「在哪裡找」，而不是「語義相似」                   │
│                                                                  │
│  💰 工具調用消耗 token                                          │
│  ├── 每次 Read/Edit/Bash 都消耗資源                             │
│  └── 聰明的代理最小化工具調用次數                                 │
│                                                                  │
│  ⏱️ 延遲影響體驗                                                │
│  ├── 大文件拖慢整個會話                                          │
│  └── 代理需要快速響應用戶                                         │
└─────────────────────────────────────────────────────────────┘
```

---

## 重新排序的 13 條原則

### 最高優先級 ⭐⭐⭐

#### 1. 小函數和小文件 (Small Functions and Files)

**這是最重要的原則，沒有之一。**

| 文件大小 | 評估 |
|---------|------|
| > 500 行 | 危險 — 可能被截斷 |
| 200-300 行 | 理想 — 一次工具調用即可完整讀取 |
| < 100 行 | 最佳 — 可以快速掃描 |

#### 2. 單一職責原則 (Single Responsibility Principle)

> **代理可以隔離、測試和編輯而不產生副作用。**

```typescript
// ❌ 違反 SRP
function processUserData(user: User) {
  validateUser(user);        // 驗證
  saveToDatabase(user);      // 存儲
  sendWelcomeEmail(user);    // 通知
  return processResult;
}

// ✅ 符合 SRP
function validateUser(user: User): ValidationResult { /* 只做驗證 */ }
function saveUser(user: User): SaveResult { /* 只做存儲 */ }
function notifyUser(user: User): NotificationResult { /* 只做通知 */ }
```

#### 3. 有意義且獨特的命名 (Meaningful, Unique Names)

> **「可搜索性」是 paramount（最重要的）。**

| 命名風格 | Grep 結果 | 代理體驗 |
|---------|-----------|---------|
| `process()` | 50+ 個匹配 | 需要進一步搜索 |
| `processPaymentTransaction()` | 3 個匹配 | 精確定位 |
| `validateUserEmailForLogin()` | 1 個匹配 | 立即找到 |

#### 4. 带上下文和出處的註釋 (Comments with Context and Provenance)

> **這一條與 2008 年的建議相反。AI 代理讀取並重視解釋「為什麼」的註釋。**

```typescript
// ❌ 無用的註釋
function addUser(user: User) {
  users.push(user);  // 添加用戶到數組
}

// ✅ 有上下文的註釋
function addUser(user: User) {
  // 為什麼不直接用數據庫？為了演示目的使用內存存儲。
  // 參見 ADR-023 的架構決策記錄。
  users.push(user);
}
```

#### 5. 顯式類型 (Explicit Types)

> **類型化代碼給代理一個答案密鑰。**

```typescript
// ❌ 無類型
function fetchData(url, options) {
  return fetch(url, options).then(r => r.json());
}

// ✅ 有類型
interface FetchOptions {
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
}
async function fetchData(options: FetchOptions): Promise<unknown> { /* ... */ }
```

#### 6. DRY (Don't Repeat Yourself)

> **代理更新一處副本，然後忘記其他；重複代碼沒有自然的合併引力。**

```typescript
// ❌ 重複
function calculateAreaOfCircle(radius: number): number {
  return 3.14159 * radius * radius;
}

// ✅ DRY
const PI = 3.14159;
function calculateAreaOfCircle(radius: number): number {
  return PI * radius * radius;
}
```

#### 7. 代理可以運行的測試 (Tests the Agent Can Run)

> **TDD 從哲學變成了技術義務。**

```
有測試的代碼庫：
  代理修改代碼 → 運行測試 → 立即知道結果 → 可以自信地繼續
```

---

### 仍然重要 ⭐⭐

#### 8. 可預測的目錄結構 (Predictable Directory Structure)

> **代理可以預測路徑，而無需列出目錄。**

#### 9. 依賴注入 (Dependency Injection)

> **更容易隔離；無需觸碰邏輯即可替換真實實現為假實現。**

```typescript
class UserService {
  constructor(
    private db: DatabaseInterface,
    private email: EmailInterface
  ) {}
}
```

#### 10. 避免深層嵌套 (Avoid Deep Nesting)

> **每個縮進級別都消耗注意力。**

```typescript
// ✅ 早期返回 — 減少嵌套
async function processOrder(orderId: string) {
  const order = await db.orders.findById(orderId);
  if (!order) return;
  // ...
}
```

#### 11. 带上下文的錯誤 (Errors with Context)

> **異常消息必須包含出錯的值和預期的形狀。**

```typescript
if (!user) {
  throw new Error(
    `User not found: userId=${userId}`
  );
}
```

---

### 較低優先級 ⭐

#### 12. 格式和樣式 (Formatting and Style)

> **使用語言默認格式化工具。不要爭論。**

```
✅ 使用：
  - cargo fmt (Rust)
  - prettier (JavaScript/TypeScript)
  - black (Python)
```

#### 13. 顯而易見的註釋 (Obvious Comments)

> **仍然是壞的，但現在更糟。它們在 token 中浪費真金白銀。**

---

## AI 時代的新考慮

### 元文檔文件 (Meta-documentation Files)

```
┌─────────────────────────────────────────────────────────────┐
│                  元文檔文件層次                                    │
├─────────────────────────────────────────────────────────────┤
│  📄 CLAUDE.md — 項目級規則和指南                                │
│  📄 AGENTS.md — 代理特定指南                                   │
│  📄 .cursor/rules/ — IDE 規則                                 │
└─────────────────────────────────────────────────────────────┘
```

### CLAUDE.md 示例

```markdown
# CLAUDE.md

## 項目概述
[你的項目描述]

## 代碼規範

### 文件大小限制
- 軟限制: 300 行
- 硬限制: 500 行

## 代理特定規則

### 可以做
- 重構以改善代碼清晰度
- 添加類型註釋
- 創建測試

### 不可以做
- 刪除測試文件
- 修改 > 5 個文件而不說明
```

---

## 核心觀點總結

### 觀點一：Clean Code 從觀點變成了技術約束

> **現在有了一個指標：token 成本、工具調用延遲、輸出質量。**

### 觀點二：被淘汰的實踐正在回歸

> **那些正在過時的實踐（XP、TDD、SOLID）成為與代理工作的技術差異化因素。**

### 觀點三：命名變得比以前更重要

> **在 2000 行的限制下，能夠精確定位的命名比以往任何時候都重要。**

### 觀點四：註釋的優先級反轉

> **解釋「為什麼」的註釋變得至關重要，而「做什麼」的註釋變得多餘。**

### 觀點五：CLAUDE.md 是新的 .gitignore

> **每個 AI 時代的項目都需要一個 CLAUDE.md 文件。**

---

## 設計哲學總結

### 哲學一：AI 友好的代碼首先是工具友好的代碼

### 哲學二：約束是解放

```
表層看：                           實際上：
文件大小限制 → 限制你的自由          文件大小限制 → 代理更容易工作 → 你也更容易工作
測試要求 → 增加工作                  測試要求 → 代理有保障 → 你有保障
```

### 哲學三：可發現性是一等公民

```
在 2000 行的世界裡，
能夠被找到就是成功的 80%。
```

### 哲學四：結構化優於隱式

```
日誌：                       配置：
❌ prose logs             ✅ JSON logs
❌ 隱式依賴               ✅ 顯式 DI
❌ 魔法數字               ✅ 命名常量
```

### 哲學五：幂等性是默認值

---

## 結論

Clean Code 原則在 2026 年並沒有消亡——它們經歷了重新排序。當代碼的讀者從人類變成 AI 代理時，一些原本屬於「最佳實踐」的原則變成了「技術要求」。

**乾淨的代碼從來不是時尚，它變成了基礎設施。**

在 AI 時代，代碼整潔不再只是關於人類可讀性——它是關於代理可操作性、token 效率、工具調用優化。遵循這些原則，你不僅在幫助 AI 代理——你在幫助任何閱讀代碼的人，包括你自己。

現在就開始審視你的代碼庫。檢查那些超過 500 行的文件。添加缺失的測試。創建那個 CLAUDE.md。你的未來代理會感謝你。

---

## 參考資源

| 資源 | 連結 |
|------|------|
| 原文 | [Clean Code for AI Agents](https://akitaonrails.com/en/2026/04/20/clean-code-for-ai-agents/) |
| Clean Code | Robert C. Martin - Clean Code |

---

*本文基於 2026 年 4 月 20 日發布的「Clean Code for AI Agents」整理。*
