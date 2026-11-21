# TopDigg 会员体系 + 积分系统设计方案

> 创建时间：2026-08-29
> 最后更新：2026-11-18
> 状态：Phase 0-4 全部完成（ai-daily 付费墙已上线并验证）
>
> **2026-11-18 全量重写**：原方案的 Stripe + Supabase + 自建 JWT 路线已废弃。
> 支付渠道改为 Dodo Payments（已完成接入并跑通真实测试支付），认证改用 Better Auth
> + Dodo 官方插件，数据库改用 Neon，积分改用 Dodo 原生能力。本文档是当前唯一
> 有效的实施方案。

---

## 一、决策摘要

| 决策项 | 选择 | 状态 |
|---|---|---|
| 支付渠道 | **Dodo Payments**（Merchant of Record） | ✅ 已接入并跑通测试支付 |
| 积分定位 | **消费型（能花）** | ✅ 已定 |
| 认证方案 | **Better Auth + `@dodopayments/better-auth`** | ✅ 已定 |
| 数据库 | **Neon**（Serverless Postgres） | ✅ 已定 |
| 付费墙范围 | **按栏目开关** | ✅ 已定 |
| 邮件服务 | 待定 | ⬜ 阻塞 Phase 1 |
| 积分换什么 | 待定 | ⬜ 阻塞积分原语选择 |
| 首个付费栏目 | 待定（建议 ai-daily） | ⬜ 阻塞 Phase 4 |

---

## 二、现状盘点

| 项 | 现状 |
|---|---|
| 用户体系 | **完全没有**。唯一沾边的是 `src/lib/creators.ts` 里 `localStorage.getItem('creator_hub_admin_auth') === '1'`，不是认证 |
| 数据库 | **0 个依赖**（30 个依赖里没有任何 DB/Auth 相关包） |
| 支付 | ✅ Dodo checkout + webhook 验签均已跑通（含完整测试卡支付） |
| Dodo test 模式资源 | 3 个商品、1 个客户、5 个订阅、**0 个积分定义** |
| 语言 | zh-Hans / zh-Hant / en / ja / vi —— **auth 与账户中心 UI 需 5 语言** |
| serverless | `api/checkout.ts`、`api/webhooks/dodo.ts` |

---

## 三、硬约束：付费正文目前全在客户端 bundle 里

**这是整个付费墙方案的地基，必须先看清楚。**

`src/lib/blog-data.ts:38`：

```ts
const slugLoaders = import.meta.glob<{ default: BlogPost }>("./blog-data/*.json");
```

`import.meta.glob` 是**构建期全量导入**。实测构建产物：

| chunk | 体积 |
|---|---|
| `ai-daily-data-*.js` | 2.6M |
| `finance-daily-data-*.js` | 1.4M |
| `blog-data-*.js` | 592K |
| **全部 JS chunk 合计** | **25M** |

在 `dist/assets/` 里搜索文章正文中的句子，**命中 7–8 个 chunk**。

> **结论：任何"前端隐藏正文"的付费墙都是摆设。** 用户 F12 搜一句就能读到全文，
> 付费内容等于免费。付费正文不能进 JS bundle、不能进静态 HTML，只能由服务端在
> 校验 entitlement 后返回。

好消息是这个仓库**已经有现成的干净边界**：

```
src/lib/{section}-meta.json    ← 只有元数据（标题/摘要/日期/封面）→ 可公开
src/lib/{section}-data/*.json  ← 全文 → 泄漏源
```

`-meta` / `-data` 的切分，正好就是「可公开」与「付费」的边界。

---

## 四、架构总览

```
浏览器
 ├─ /login  /register  /account          ← 新增（5 语言）
 ├─ /checkout                            ← ✅ 已完成
 └─ 付费栏目详情页 → 匿名只渲染 teaser，正文走 api/content
       ↓
Vercel Functions (api/)
 ├─ api/checkout.ts              ✅ 已完成
 ├─ api/webhooks/dodo.ts         ✅ 已完成
 ├─ api/auth/[...all].ts         ← Better Auth handler（Phase 0）
 ├─ api/account.ts               ← 会员状态 + 积分余额 + 解锁记录
 ├─ api/content/[slug].ts        ← 付费正文（鉴权 + entitlement 后返回）
 └─ api/credits/redeem.ts        ← 积分兑换（幂等扣减）
       ↓
Neon Postgres
 ├─ user / session / account / verification   ← Better Auth 自动生成
 ├─ entitlement_grant                           ← 解锁 + 兑换记录（合并，见 §6.2）
 ├─ webhook_log                                 ← webhook-id 唯一索引（幂等）
 ├─ credit_balance_cache                        ← Dodo 余额缓存（降级用）
 └─ gated_content                               ← 付费正文（slug, locale, body_md…）
       ↓
Dodo Payments
 ├─ products / checkout / subscriptions / portal
 ├─ creditEntitlements → balances → ledger     ← 虚拟积分
 └─ customers.wallets → ledgerEntries           ← 可抵扣账单的真钱余额
```

---

## 五、认证设计

```ts
// api/auth/[...all].ts
betterAuth({
  database: { provider: "pg", url: process.env.DATABASE_URL },
  emailAndPassword: { enabled: true, requireEmailVerification: true },
  plugins: [
    dodopayments({
      client: dodoPayments,
      createCustomerOnSignUp: true,   // 注册即自动建 Dodo customer
      getCustomerParams: (user) => ({ metadata: { better_auth_user_id: user.id } }),
      use: [
        checkout({
          products: [{ productId: MONTHLY, slug: "monthly" }],
          authenticatedUsersOnly: true,
        }),
        portal(),
        webhooks({ webhookKey: process.env.DODO_PAYMENTS_WEBHOOK_KEY, onPayload }),
      ],
    }),
  ],
})
```

要点：

- 浏览器侧用 `better-auth/react` 的 `useSession`；Cookie 是 HttpOnly，前端 JS 读不到 token
- `createCustomerOnSignUp: true` 免去自己写 Dodo customer 映射
- **`products` 把 slug 映射到 product ID，浏览器永远只能传 slug**
- **用户改邮箱时要调 `client.customers.update()`**，否则 Dodo 侧邮箱不同步
- Neon 在 serverless 环境**必须用 pooler 连接串**（`...-pooler.<region>.neon.tech`），直连域名会被 PgBouncer 断开

### 优化：手写 `api/checkout.ts` 将被插件取代

插件的 `checkout({ products, authenticatedUsersOnly: true })` 就是官方路径，且比我手写的更安全
（强制登录 + slug 白名单）。**Phase 0 接入插件后，手写的 `api/checkout.ts` 应当删除**，
避免两套结算入口并存。

---

## 六、数据模型（Neon）

### 6.1 Better Auth 自动生成

```sql
user(id, email, email_verified, name, image, dodo_customer_id, created_at, updated_at)
session(id, user_id, token, expires_at, ip_address, user_agent)
account(id, user_id, account_id, provider_id, password, ...)
verification(id, identifier, value, expires_at)
```

### 6.2 我们自己的表

```sql
-- 解锁记录 + 积分兑换记录合并成一张
entitlement_grant(
  id, user_id,
  item_type,        -- 'content' | 'membership_days'
  item_id,          -- slug 或天数
  source,           -- 'purchase' | 'credit'
  credits_spent,    -- 兑换时消耗的积分，购买时为 0
  idempotency_key UNIQUE,
  created_at
)

-- webhook 幂等（Dodo 失败会重试，且不保证顺序）
webhook_log(webhook_id UNIQUE, event_type, processed_at, created_at)

-- Dodo 余额缓存（webhook 驱动刷新），用于 Dodo 不可用时降级展示
credit_balance_cache(user_id, credit_entitlement_id, balance, updated_at)

-- 付费正文（不进客户端 bundle）
gated_content(slug, locale, section, title, summary, body_md, published_at)
```

### 6.3 优化：会员状态不单独建表

`client.subscriptions.list({ customer_id })` 能直接查到订阅状态。会员中心是低频页面，
按需查 Dodo 即可，**省掉一张表和一套 webhook 同步逻辑**。需要缓存时复用
`credit_balance_cache` 的模式。

---

## 七、积分系统设计

### 7.1 审计发现：Dodo 有两个原语，别用错

这是原方案的一个**实质性设计错误**。Dodo 同时提供：

| 原语 | 语义 | SDK | 适用场景 |
|---|---|---|---|
| **Credits** | 虚拟单位（token / 调用次数 / 算力），或带 `price_per_unit` 的法币余额 | `client.creditEntitlements` | 站内权益额度：兑换解锁、会员时长、算力 |
| **Wallet** | 客户钱包里的**真金白银**，可直接抵扣订阅账单 | `client.customers.wallets` | 积分能**抵扣订阅费** |

官方 credits.md 明确写了「Credits … are not the real-money customer wallet」，
并在常见错误里列出混用。

> **因此积分原语的选择取决于「积分能换什么」（待决策项）：**
> - 积分换**站内权益**（解锁文章、会员时长）→ 用 **Credits**
> - 积分能**抵扣订阅费** → 用 **Wallet**
> - 两个都要 → 两套并存，但要有明确的换算关系与单一真值源

### 7.2 耦合审计：Dodo Credits 到底绑多深

**强耦合点（换供应商就得改）**

| 耦合点 | 强度 | 说明 |
|---|---|---|
| 余额真值在 Dodo | 高 | 每次读余额 = 一次网络调用，无本地强一致读 |
| 发放规则挂在 product 上 | 高 | 积分规则与商品配置耦合，改商品可能连带改积分 |
| 发放时机跟随 Dodo 订阅周期 | 高 | 续费/试用/改套餐/降级的时序由 Dodo 决定，我们不完全可控 |
| `precision` 创建后不可改 | 高（不可逆） | 建错只能重建 entitlement |
| ledger 数据模型是 Dodo 的 | 中高 | grant / ledger / rollover / overage 都是它的语义 |
| `dodoCustomerId` 进 user 表 | 中 | 身份与 Dodo customer 一一对应，换邮箱需同步调用 |
| webhook 是唯一同步通道 | 中 | 最终一致，本地无强一致读 |
| 降级能力弱 | 弱 | Dodo 挂了 → 余额读不到、发放停摆 |

**弱耦合 / 我们的护城河（可移植）**

- 积分的**数值语义**（1 分等于什么）
- 积分的**获取规则**（我们决定发多少；非订阅来源用 `createLedgerEntry` 手动发也走得通）
- 积分的**消费场景**（兑换什么）
- 用户**身份**属于 Better Auth，不属于 Dodo

> **结论：耦合集中在「账本」这一层，规则与用途仍完全在我们手里。**
> 代价是每次读余额一次网络调用、一个外部依赖、以及导出/迁移时的额外工序。

### 7.3 解耦设计：Provider 抽象 + 本地缓存

把「积分」抽象成接口，让 Dodo 只是一个实现：

```ts
// src/lib/credits.ts
export interface CreditsProvider {
  getBalance(userId: string): Promise<{ balance: string; stale: boolean }>;
  grant(userId: string, amount: string, reason: string, idempotencyKey: string): Promise<void>;
  debit(userId: string, amount: string, reason: string, idempotencyKey: string): Promise<void>;
  listLedger(userId: string): Promise<LedgerEntry[]>;
}
```

实现可替换：

| Provider | 用途 |
|---|---|
| `DodoCreditsProvider` | 虚拟积分，订阅周期自动发放 |
| `DodoWalletProvider` | 可抵扣账单的真钱余额 |
| `LocalCreditsProvider` | Neon 自建账本，用作降级兜底或完全自持 |

配套的降级策略：

- 余额读取：**先读 `credit_balance_cache`（webhook 驱动刷新），再回源 Dodo**；Dodo 不可用时返回缓存值并标记 `stale: true`，前端显示「余额可能不是最新」而不是显示 0
- 发放失败：由 `credit.added` webhook 驱动对账修正，不依赖发放调用本身成功

### 7.4 积分定义与发放（以 Credits 为例）

```ts
await client.creditEntitlements.create({
  name: "TopDigg 积分",
  unit: "point",
  precision: 0,                 // 整数积分，创建后不可改 ⚠️
  expires_after_days: 365,
  rollover_enabled: true,
  rollover_percentage: 100,
  max_rollover_count: 3,
  overage_enabled: false,       // 积分不够直接拒，不倒扣钱
});
```

| 商品 | 发放方式 | 时机 |
|---|---|---|
| 月付订阅 | 挂 credit entitlement | **每周期自动发**（Dodo 负责） |
| 年付订阅 | 挂 credit entitlement | 每周期（年）发 |
| 单篇买断 | 挂 credit entitlement | 一次性发 |

订阅类商品的积分由 Dodo 自动发放，**不用我们写周期检测逻辑**（续费/试用/改套餐/降级的时序自己写很难写对）——这是 Dodo Credits 最实在的价值。

手动发放（活动、补偿、迁移）：

```ts
await client.creditEntitlements.balances.createLedgerEntry(dodoCustomerId, {
  credit_entitlement_id,
  amount: '500',
  entry_type: 'credit',        // 'debit' 为扣减
  idempotency_key: 'promo:2026-11',   // 必须由业务操作派生
  reason: '双十一活动',
});
```

- 重复的 `idempotency_key` 会返回 **409**，要去对账，**不能换新 key 重试**
- 扣减时余额不足返回 **400**，直接拒绝
- 金额是 **decimal string**，禁止用 JS float

### 7.5 积分 webhook

在已有的 `api/webhooks/dodo.ts` 中加入 `HANDLED_TYPES`：

| 事件 | 处理 |
|---|---|
| `credit.added` / `credit.deducted` / `credit.manual_adjustment` | 刷新 `credit_balance_cache`，与来源对账 |
| `credit.expired` / `credit.rolled_over` / `credit.rollover_forfeited` | 刷新余额与账户历史 |
| `credit.balance_low` | 提示用户余额不足，推充值包 checkout |

---

## 八、付费墙（按栏目开关）

### 8.1 配置

```ts
// src/config/paywall.ts
export const PAYWALL = {
  blog:            false,
  'ai-daily':      true,
  'finance-daily': true,
  'money-lab':     false,
  'ai-products':   false,
  twitter:         false,
} as const;
```

### 8.2 三处必须同步改造 —— 最容易漏的就是这里

| # | 改哪里 | 怎么改 | 漏了会怎样 |
|---|---|---|---|
| 1 | **客户端 bundle** | `import.meta.glob` 排除 gated 栏目的 `-data/` | ❌ 正文仍在 JS 里，F12 能搜到 |
| 2 | **构建脚本** | `build-*.js` 对 gated 栏目不写 `src/lib/*-data/`，改写进 Neon 的 `gated_content` | ❌ 构建产物仍含全文 JSON |
| 3 | **预渲染** | gated 栏目详情路由输出 teaser 而非全文；等待条件同步调整 | ❌ 静态 HTML 里带全文 |

**关于第 1 点的 Vite 坑**：`import.meta.glob` 的 `exclude` 必须是**静态可分析的字面量**，
不能用运行时变量。所以配置得编译期可见。

> **推荐做法**：把 gated 栏目的数据放到**独立目录**（如 `src/lib/gated/{section}-data/`），
> 客户端 glob 只覆盖免费目录；由**构建脚本决定往哪个目录写**。这样比让 glob 去猜配置可靠得多。

### 8.3 预渲染适配

现有预渲染对详情页的等待条件是「出现 `<article>`」。付费页没有 article 元素，
会**必然超时**。需要为 gated 路由改用新的等待标记，例如 `[data-paywall-locked]`。

另外：预渲染缓存键已包含 `scripts/prerender.mjs`，而 paywall 配置放在 `src/` 下，
配置变更会自动让缓存失效（2026-11-18 的预渲染修复已覆盖这一点）。

### 8.4 SEO 代价（必须认下来）

付费栏目详情页的静态 HTML 只有标题 + 摘要 + CTA，**爬虫读不到正文** → 该栏目收录量与排名会掉。

| 手段 | 评价 |
|---|---|
| 摘要页 + 栏目页承接 SEO | ✅ 可行，这两个页面可以预渲染完整摘要 |
| 保留 Article 结构化数据（标题/作者/日期） | ✅ 帮 Google 理解页面 |
| 「免费试读前 N 段」 | ⚠️ 正文片段进 HTML 就是有限泄漏，与「锁门」自相矛盾，除非接受这个泄漏 |
| 前端隐藏正文 | ❌ 已证明无效 |

**这是一笔要算的账：付费墙带来的收入 vs 该栏目自然流量的损失。**

---

## 九、实施顺序

| Phase | 内容 | 估时 | 验收标准 |
|---|---|---|---|
| **0** | Neon 建库 + Better Auth 接入 + 建表 + Dodo 插件；验证注册自动建 customer；**删除手写 `api/checkout.ts`** | 1.5d | 注册后 `user.dodo_customer_id` 有值 |
| **1** | `/login` `/register` 页面（5 语言）+ 邮箱验证 + session 打通 + 导航栏登录态 | 2d | 注册 → 验证 → 登录 → 刷新不掉线 |
| **2** | `/account`：会员状态、积分余额、账单历史、解锁记录；`api/account.ts` 聚合 | 1.5d | 账户中心数据全对 |
| **3** | 创建积分 entitlement（Wallet 或 Credits，见 §7.1）+ 绑定商品 + `credit.*` webhook + 余额缓存 | 2d | 订阅成功 → 积分到账 |
| **4** | 付费墙三处改造 + 预渲染适配 + 积分兑换 + 客户门户 | 2.5d | ✅ 完成（除积分兑换前端、客户门户 UI） |

合计 **~9.5 天**。建议先做 Phase 0–3（7 天）：会员与积分跑通即可开始收款，
付费墙（Phase 4）可延后。

---

## 十、风险与缓解

| # | 风险 | 缓解 |
|---|---|---|
| 1 | **正文泄漏到 bundle** | §8.2 三处同步改造；**CI 增加检查**：扫描 `dist/assets/` 是否含 gated 正文 |
| 2 | 积分 `precision` 创建后不可改 | 创建前定死（整数 = 0） |
| 3 | 积分原语选错（Credits vs Wallet） | §7.1 的选择矩阵；开工前必须先定「积分换什么」 |
| 4 | webhook 幂等只在内存 | 落 Neon `webhook_log` 唯一索引 |
| 5 | 积分余额最终一致，不是锁 | 兑换用幂等 ledger entry；余额不足 400 直接拒；并发用行锁或单飞 |
| 6 | 邮件服务未选 | 阻塞 Phase 1 |
| 7 | **注册送积分被批量薅** | 邮箱验证 + 延迟发放 + 注册接口限流 |
| 8 | 积分兑换并发双花 | `idempotency_key` 唯一索引 + 事务内校验余额 |
| 9 | Dodo 不可用导致余额读不到 | `credit_balance_cache` 降级 + `stale` 标记 |
| 10 | 付费栏目 SEO 下降 | 摘要页承接 + 结构化数据 |
| 11 | Neon 连接串未用 pooler | 部署配置检查项 |
| 12 | live 模式商品需重建 | test / live 的 key、商品、客户、webhook 密钥完全隔离 |
| 13 | 积分换算成钱需 `price_per_unit` | 仅当积分可折现时才需要 |

---

## 十一、待决策项

| # | 问题 | 影响 | 建议 |
|---|---|---|---|
| 1 | **邮件服务用哪个？** | 阻塞 Phase 1 | Resend（最省事）／ 阿里云邮件推送（国内送达高）／ AWS SES（最便宜）／ 开发期先不验证 |
| 2 | **积分能换什么？** | 决定用 Credits 还是 Wallet（§7.1） | 若只想换站内权益 → Credits；若要抵扣订阅费 → Wallet |
| 3 | **哪个栏目先开付费？** | 决定 Phase 4 的改造范围 | 建议 **ai-daily**：每天更新、复购意愿强、正文价值高，先验证付费意愿；blog 存量最大但 SEO 流量最好，锁了掉得最狠 |
| 4 | ~~付费正文存 Neon 还是对象存储？~~ **已实施：打进 API 函数包** | 影响部署体积与构建复杂度 | 构建脚本把全文写进 `api/_gated/ai-daily-data.json`，只被 `api/content/ai-daily/[slug].ts` 静态 import → 仅打进该 serverless 函数，客户端 bundle 与静态 HTML 零接触。比 Neon 存储更简单（构建无 DB 依赖、原子部署），代价是函数包 +2.7MB（250MB 限额内）。未来要换 Neon 存储只需改 API 的读取源 |

---

## 十二、部署检查清单（live 模式）

### 已完成 ✅

- Neon production 分支 schema 齐全（user/session/account/verification/content_unlock）
- `scripts/setup-dodo-live.mjs` 就绪：拿到 live key 后一键建商品/积分挂载/webhook 并输出 env
- 代码侧全部就绪（构建通过、付费墙零泄漏、验签/webhook/积分解锁实测）

### 待你提供（3 样凭据）

| # | 凭据 | 去哪拿 | 用途 |
|---|---|---|---|
| 1 | **Dodo live API key**（`dodo_live_...`） | Dodo dashboard → Developer → API Keys → 选 live 模式新建 | 我跑 setup-dodo-live.mjs 建商品/积分/webhook |
| 2 | **Resend API key** | resend.com 注册 → API Keys → 新建 | 真邮件（先用 onboarding@resend.dev 测试发信；生产再验证 topdigg.com 域名） |
| 3 | **Vercel 访问**（三选一） | ① 你终端跑 `vercel login` ② vercel.com/account/settings/tokens 建 token 给我 ③ 你自己在 dashboard 粘 env（列表在下面） | 设生产环境变量 |

### Vercel 生产环境变量（拿到 1、2 后我补全值）

```
DATABASE_URL                  = <Neon production pooler 连接串>
DATABASE_URL_UNPOOLED         = <Neon production 直连连接串>
BETTER_AUTH_SECRET            = <随机 64 位 hex>
BETTER_AUTH_URL               = https://www.topdigg.com
BETTER_AUTH_TRUSTED_ORIGINS   = https://www.topdigg.com
DODO_PAYMENTS_API_KEY         = dodo_live_...（你提供）
DODO_PAYMENTS_ENVIRONMENT     = live_mode
DODO_PAYMENTS_WEBHOOK_KEY     = whsec_...（setup 脚本输出）
DODO_PRODUCT_MONTHLY          = pdt_...（setup 脚本输出）
DODO_PRODUCT_YEARLY           = pdt_...（setup 脚本输出）
DODO_PRODUCT_SINGLE           = pdt_...（setup 脚本输出）
DODO_CREDIT_ENTITLEMENT_ID    = cde_...（setup 脚本输出）
VITE_DODO_ENVIRONMENT         = live_mode
SITE_URL                      = https://www.topdigg.com
EMAIL_REQUIRE_VERIFICATION    = true（Resend 配好后）
RESEND_API_KEY                = re_...（你提供）
EMAIL_FROM                    = TopDigg <noreply@topdigg.com>（域名验证后）
```

### 上线顺序

1. 拿到 3 样凭据 → 跑 setup-dodo-live.mjs → 本地用 live env 验证 checkout session 创建（**不刷真实支付**）
2. Resend 测试发信成功 → EMAIL_REQUIRE_VERIFICATION=true
3. 设 Vercel env → 合并分支到 main → Vercel 自动部署
4. 上线后验证：注册→验证邮件→登录→订阅流程→webhook 落库

### ⚠️ 上线即生效的业务变化

- **ai-daily 全文转为会员内容**（匿名只见 teaser）——SEO 该栏目会掉，已认
- `/checkout` 变成真实扣款页面
- 注册强制邮箱验证（Resend 就绪后）
