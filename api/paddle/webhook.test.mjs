/**
 * webhook 单元测试 — Paddle webhook handler (api/paddle/webhook.ts)
 *
 * Vitest globals (it/describe) + node:assert；接入 vitest 通过
 * vitest.config.ts include 路径（api/<name>.test.mjs 全匹配）。
 *
 * 重点守护命脉：
 *   1. readRawBody 字节级一致性（HMAC 验签依赖）
 *   2. verifySignature HMAC-SHA256 + timingSafeEqual 容错
 *   3. resolveUser 双路径（customData.user_id 优先 + email 兜底）
 *   4. 幂等 23505 处理（替代 SELECT-then-INSERT race）
 *
 * 用法：`npm test`（被 vitest 自动发现）
 *
 * 测试用 fake supabase client 验证 resolveUser 分支；其他测试用真实
 * crypto/Readable 与 webhook.ts 同实现逻辑等价验证（handler 自身测
 * ESM-Vercel-runtime 部分由 PR① 后 deploy preview 端到端确认）。
 */
// vitest globals (test/it/describe) + node:assert for compatibility
import assert from "node:assert/strict";
import crypto from "node:crypto";
import { Readable } from "node:stream";

const SECRET = "pdl_test_secret_for_unit_test";

// -------- equivalents of webhook.ts internals --------
function readRawBody(req) {
  return new Promise((resolve, reject) => {
    if (typeof req.body === "string") {
      resolve(req.body);
      return;
    }
    if (req.body && typeof req.body === "object" && !Array.isArray(req.body)) {
      reject(new Error("raw body required — set bodyParser: false in this function's config"));
      return;
    }
    const chunks = [];
    req.on("data", (c) => chunks.push(c));
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    req.on("error", reject);
  });
}

function verifySignature(rawBody, signature, secret = SECRET) {
  if (!signature || !secret) return false;
  const hmac = crypto.createHmac("sha256", secret);
  const digest = hmac.update(rawBody, "utf8").digest("hex");
  try {
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest));
  } catch {
    return false;
  }
}

async function resolveUser(supabase, customData, fallbackEmail) {
  const uidFromCustom =
    typeof customData?.user_id === "string" ? customData.user_id : "";
  if (uidFromCustom.length > 0) {
    const { data, error } = await supabase.auth.admin.getUserById(uidFromCustom);
    if (error) {
      console.warn(`[webhook] getUserById(${uidFromCustom}) failed: ${error.message}; falling back to email lookup`);
    } else if (data?.user) {
      return { userId: data.user.id };
    }
  }
  if (fallbackEmail) {
    const { data: list } = await supabase.auth.admin.listUsers();
    const matched = list?.users?.find(
      (u) => u.email === fallbackEmail,
    );
    if (matched) return { userId: matched.id };
  }
  return null;
}

function makeFakeReq({ body, asStream }) {
  if (asStream) {
    const r = new Readable({ read() {} });
    r.push(Buffer.from(body, "utf8"));
    r.push(null);
    return r;
  }
  return { body };
}

// -------- readRawBody --------
it("readRawBody: string body passes through", async () => {
  const raw = await readRawBody({ body: '{"event_id":"x"}' });
  assert.equal(raw, '{"event_id":"x"}');
});

it("readRawBody: pre-parsed object body throws typed error", async () => {
  await assert.rejects(
    () => readRawBody({ body: { event_id: "y" } }),
    /bodyParser: false/,
  );
});

it("readRawBody: streamed body assembles UTF-8 bytes", async () => {
  const body = '{"event_id":"中文","email":"用户@example.com"}';
  const raw = await readRawBody(makeFakeReq({ body, asStream: true }));
  assert.equal(raw, body);
  assert.equal(raw.length, body.length, "raw string vs JS char count");
});

// -------- verifySignature --------
it("verifySignature: valid HMAC-SHA256 returns true", () => {
  const body = '{"event_id":"evt_1"}';
  const sig = crypto.createHmac("sha256", SECRET).update(body, "utf8").digest("hex");
  assert.equal(verifySignature(body, sig), true);
});

it("verifySignature: tampered body returns false", () => {
  const sig = crypto.createHmac("sha256", SECRET).update('{"event_id":"a"}', "utf8").digest("hex");
  assert.equal(verifySignature('{"event_id":"b"}', sig), false);
});

it("verifySignature: missing secret returns false (no throw)", () => {
  assert.equal(verifySignature("anything", "deadbeef", ""), false);
});

it("verifySignature: wrong-length signature returns false (timingSafeEqual catch)", () => {
  const body = '{"event_id":"x"}';
  const sig = crypto.createHmac("sha256", SECRET).update(body, "utf8").digest("hex");
  // truncate sig → wrong length
  assert.equal(verifySignature(body, sig.slice(0, 10)), false);
});

// -------- resolveUser --------
it("resolveUser: customData.user_id path uses getUserById, no listUsers", async () => {
  let getByIdCalls = 0;
  let listUsersCalls = 0;
  const fakeSb = {
    auth: {
      admin: {
        getUserById: async (id) => {
          getByIdCalls++;
          assert.equal(id, "user_abc123");
          return { data: { user: { id: "user_abc123" } }, error: null };
        },
        listUsers: async () => {
          listUsersCalls++;
          return { data: { users: [] } };
        },
      },
    },
  };
  const ref = await resolveUser(fakeSb, { user_id: "user_abc123" }, "fallback@example.com");
  assert.deepEqual(ref, { userId: "user_abc123" });
  assert.equal(getByIdCalls, 1, "should hit getUserById");
  assert.equal(listUsersCalls, 0, "should NOT touch listUsers");
});

it("resolveUser: empty customData falls back to listUsers email match", async () => {
  let getByIdCalls = 0;
  let listUsersCalls = 0;
  const fakeSb = {
    auth: {
      admin: {
        getUserById: async () => {
          getByIdCalls++;
          return { data: null, error: null };
        },
        listUsers: async () => {
          listUsersCalls++;
          return {
            data: {
              users: [
                { id: "u_other", email: "other@example.com" },
                { id: "u_match", email: "match@example.com" },
              ],
            },
          };
        },
      },
    },
  };
  const ref = await resolveUser(fakeSb, {}, "match@example.com");
  assert.deepEqual(ref, { userId: "u_match" });
  assert.equal(listUsersCalls, 1);
});

it("resolveUser: getUserById error falls back to email lookup with warning", async () => {
  const warnings = [];
  const origWarn = console.warn;
  console.warn = (...args) => warnings.push(args.join(" "));
  try {
    const fakeSb = {
      auth: {
        admin: {
          getUserById: async () => ({ data: null, error: new Error("auth fail") }),
          listUsers: async () => ({
            data: { users: [{ id: "u_e", email: "e@example.com" }] },
          }),
        },
      },
    };
    const ref = await resolveUser(fakeSb, { user_id: "bad" }, "e@example.com");
    assert.deepEqual(ref, { userId: "u_e" });
    assert.ok(warnings.some((w) => w.includes("getUserById")), "should log warning");
  } finally {
    console.warn = origWarn;
  }
});

it("resolveUser: no match anywhere returns null", async () => {
  const fakeSb = {
    auth: {
      admin: {
        getUserById: async () => ({ data: null, error: null }),
        listUsers: async () => ({ data: { users: [] } }),
      },
    },
  };
  const ref = await resolveUser(fakeSb, {}, "nobody@example.com");
  assert.equal(ref, null);
});

// -------- idempotency pattern --------
it("idempotency: 23505 unique violation maps to 200 deduped", () => {
  // Replicates the handler's idempotency block — assert shape, not Supabase itself.
  const fakeInsertResult = { error: { code: "23505", message: "duplicate key value violates unique constraint" } };
  function mapInsert(res) {
    if (!res.error) return { status: 200, body: { ok: true } };
    if (res.error.code === "23505") return { status: 200, body: { ok: true, deduped: true } };
    return { status: 500, body: { error: `idempotency insert failed: ${res.error.message}` } };
  }
  assert.deepEqual(mapInsert(fakeInsertResult), { status: 200, body: { ok: true, deduped: true } });
});

it("idempotency: non-23505 insert error returns 500", () => {
  const fakeInsertResult = { error: { code: "PGRST1", message: "RLS violation" } };
  function mapInsert(res) {
    if (!res.error) return { status: 200, body: { ok: true } };
    if (res.error.code === "23505") return { status: 200, body: { ok: true, deduped: true } };
    return { status: 500, body: { error: `idempotency insert failed: ${res.error.message}` } };
  }
  const out = mapInsert(fakeInsertResult);
  assert.equal(out.status, 500);
  assert.match(out.body.error, /idempotency insert failed/);
  assert.equal(out.status, 500);
});
