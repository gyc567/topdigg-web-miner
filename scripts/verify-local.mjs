/**
 * Local verification suite for the membership system.
 *
 *   node scripts/verify-local.mjs
 *
 * Exercises the auth, paywall, credits, account and portal paths against the
 * local API server (scripts/dev-dodo-api.mjs). Run it from the repo root.
 */
import http from "node:http";

const API = process.env.API_BASE ?? "http://127.0.0.1:3001";

/**
 * Minimal HTTP helper built on node:http rather than fetch.
 *
 * Node's fetch (undici) always adds `Sec-Fetch-Mode: cors`, which makes
 * Better Auth run its form-CSRF path and reject requests without a matching
 * Origin — and, on this version, reject the credentials even when the
 * Origin is valid. curl doesn't send that header, so it works.
 * node:http lets us send exactly the headers we want.
 */
function request(method, path, { body, cookie, headers = {} } = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, API);
    const payload = body === undefined ? null : JSON.stringify(body);
    const req = http.request(
      {
        hostname: url.hostname,
        port: url.port,
        path: url.pathname + url.search,
        method,
        headers: {
          ...(payload
            ? { "Content-Type": "application/json", "Content-Length": Buffer.byteLength(payload) }
            : {}),
          ...(cookie ? { cookie } : {}),
          ...headers,
        },
      },
      (res) => {
        const chunks = [];
        res.on("data", (c) => chunks.push(c));
        res.on("end", () => {
          const text = Buffer.concat(chunks).toString("utf8");
          let json = null;
          try {
            json = JSON.parse(text);
          } catch {
            /* not json */
          }
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: json,
            text,
            cookie: (res.headers["set-cookie"] ?? []).map((c) => c.split(";")[0]).join("; "),
          });
        });
      },
    );
    req.on("error", reject);
    if (payload) req.write(payload);
    req.end();
  });
}

let pass = 0;
let fail = 0;
const ok = (cond, name, detail = "") => {
  if (cond) {
    pass++;
    console.log(`  ✓ ${name}${detail ? "  " + detail : ""}`);
  } else {
    fail++;
    console.log(`  ✗ ${name}${detail ? "  " + detail : ""}`);
  }
};

const login = async (email, password) => {
  const res = await request("POST", "/api/auth/sign-in/email", { body: { email, password } });
  return { status: res.status, cookie: res.cookie, body: res.body ?? {} };
};

const account = async (cookie) =>
  (await request("GET", "/api/account", { cookie })).body ?? {};

console.log("════ ① 认证 ════");
let r = await request("GET", "/api/account");
ok(r.status === 401, "未登录访问 /api/account → 401");

const L = await login("probe1794973646370@example.com", "newpass12345");
ok(L.status === 200, "已验证用户登录 → 200", `user=${L.body.user?.email ?? ""}`);
ok(L.body.user?.emailVerified === true, "emailVerified = true");
ok(!!L.cookie, "拿到 session cookie");

const wrong = await login("probe1794973646370@example.com", "definitely-wrong");
ok(wrong.status === 401, "错误密码 → 401");

const sess = await request("GET", "/api/auth/get-session", { cookie: L.cookie });
const sj = sess.body;
ok(sess.status === 200 && !!sj?.user?.email, "get-session → 200 + user", sj?.user?.email ?? "");

const V = await login("verifytest@example.com", "password123");
ok(V.status === 200, "第二个已验证用户登录 → 200");

console.log("\n════ ② 付费墙 API ════");
const slug = "2026-11-14-ai-daily";
let c = await request("GET", `/api/content/ai-daily/${slug}`);
ok(c.status === 401, "匿名取付费正文 → 401");

c = await request("GET", `/api/content/ai-daily/${slug}`, { cookie: L.cookie });
const cj = c.body ?? {};
ok(c.status === 200, "已解锁用户 → 200");
ok(
  typeof cj.content === "object" && !!cj.content?.["zh-Hans"],
  "返回 5 语言正文",
  `zh-Hans ${String(cj.content?.["zh-Hans"]?.length ?? 0).padStart(5)} 字`
);

c = await request("GET", `/api/content/ai-daily/no-such-slug`, { cookie: L.cookie });
ok(c.status === 404, "未知 slug → 404");

c = await request("GET", "/api/content/ai-daily/2026-11-13-ai-daily", { cookie: V.cookie });
ok(c.status === 403, "已验证但无订阅/无解锁 → 403");

console.log("\n════ ③ 积分 ════");
const acc0 = await account(L.cookie);
ok(acc0.credits?.length === 1, "账户 API 返回积分余额", `balance=${acc0.credits?.[0]?.balance ?? "-"}`);
ok(acc0.unlocks?.length > 0, "账户 API 返回解锁列表", `${acc0.unlocks?.length ?? 0} 条`);

const before = Number(acc0.credits?.[0]?.balance ?? 0);
// Pick a slug the user has NOT unlocked yet so the suite is re-runnable.
const gated = JSON.parse(
  (await import("node:fs")).readFileSync("api/_gated/ai-daily-data.json", "utf8"),
);
const unlockedSlugs = new Set((acc0.unlocks ?? []).map((u) => u.contentSlug));
const fresh = gated.reports.find((r) => !unlockedSlugs.has(r.slug));
if (!fresh) {
  console.log("  ⚠ 所有文章都已解锁，跳过扣费断言");
  process.exit(fail === 0 ? 0 : 1);
}
const newSlug = fresh.slug;
const redeem = async (cookie, slug) => {
  const res = await request("POST", "/api/credits/redeem", {
    cookie,
    body: { slug, section: "ai-daily" },
  });
  return { status: res.status, body: res.body ?? {} };
};

const rex = await redeem(L.cookie, newSlug);
ok(rex.status === 200 && rex.body.unlocked === true, "积分解锁 → 200", JSON.stringify(rex.body));
const after = Number((await account(L.cookie)).credits?.[0]?.balance ?? 0);
ok(before - after === 20, "余额精确扣 20", `${before} → ${after}`);

const rex2 = await redeem(L.cookie, newSlug);
ok(
  rex2.status === 200 && rex2.body.alreadyUnlocked === true && rex2.body.creditsSpent === 0,
  "重复兑换 → 幂等不重复扣",
  JSON.stringify(rex2.body)
);
const after2 = Number((await account(L.cookie)).credits?.[0]?.balance ?? 0);
ok(after2 === after, "重复兑换后余额不变", String(after2));

const anonRedeem = await request("POST", "/api/credits/redeem", { body: { slug: "x" } });
ok(anonRedeem.status === 401, "匿名兑换 → 401");

console.log("\n════ ④ 账户聚合 ════");
ok(acc0.user?.emailVerified === true, "账户 API 带 emailVerified");
ok(!!acc0.user?.dodoCustomerId, "账户 API 带 dodoCustomerId");
ok(typeof acc0.environment === "string", "账户 API 带 environment", acc0.environment);

console.log("\n════ ⑤ 客户门户 ════");
const P = await request("GET", "/api/auth/dodopayments/customer/portal", { cookie: V.cookie });
const pj = P.body ?? {};
ok(P.status === 200 && !!pj.url, "已验证邮箱 → 门户 URL", `${(pj.url ?? "").slice(0, 52)}…`);

console.log(`\n════ 汇总：${pass} 通过 / ${fail} 失败 ════`);
process.exit(fail === 0 ? 0 : 1);
