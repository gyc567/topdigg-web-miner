/**
 * prerender-cache 单元测试
 *
 * 用临时目录搭建最小项目结构，验证三层 hash 的失效语义：
 * - chrome（代码层）变化 → 所有路由 key 变化
 * - data（列表 meta）变化 → 只有列表/静态路由 key 变化
 * - 路由自身内容变化 → 只有该 detail 路由 key 变化
 */
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import {
  collectFiles,
  hashFiles,
  computeChromeHash,
  computeDataHash,
  contentFilesForRoute,
  cacheKeyForRoute,
  readCache,
  writeCache,
} from "./prerender-cache.mjs";

let root;
let hashes;

function write(rel, content) {
  const p = path.join(root, rel);
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, content);
}

beforeEach(() => {
  root = fs.mkdtempSync(path.join(os.tmpdir(), "prerender-cache-test-"));
  // 最小项目结构
  write("src/pages/Index.tsx", "export default function Index() {}");
  write("src/lib/blog-meta.json", JSON.stringify({ posts: [] }));
  write("src/lib/blog-data/post-a.json", JSON.stringify({ slug: "post-a", content: "A" }));
  write("src/lib/blog-data/post-b.json", JSON.stringify({ slug: "post-b", content: "B" }));
  write("content/blog/zh-Hans/post-a.md", "# A");
  write("content/blog/zh-Hans/post-b.md", "# B");
  write("public/content/twitter/tw-a.md", "# tw");
  write("vite.config.ts", "export default {};");
  write("index.html", "<html></html>");
  hashes = { chrome: computeChromeHash(root), data: computeDataHash(root) };
});

afterEach(() => {
  fs.rmSync(root, { recursive: true, force: true });
});

describe("collectFiles / hashFiles", () => {
  it("collects files recursively and respects excludeDirs", () => {
    const all = collectFiles(path.join(root, "src"));
    expect(all.length).toBe(4); // Index.tsx + blog-meta.json + 2 per-slug json
    const excluded = collectFiles(path.join(root, "src"), {
      excludeDirs: ["blog-data"],
    });
    expect(excluded.map((f) => path.basename(f))).toEqual(["blog-meta.json", "Index.tsx"]);
  });

  it("hash changes when file content changes", () => {
    const f = path.join(root, "src/pages/Index.tsx");
    const before = hashFiles([f]);
    write("src/pages/Index.tsx", "changed");
    expect(hashFiles([f])).not.toBe(before);
  });
});

describe("computeChromeHash / computeDataHash", () => {
  it("chromeHash ignores generated JSON under src/lib", () => {
    const before = computeChromeHash(root);
    // 修改 per-slug 数据 → chromeHash 不变（数据层不影响代码层）
    write("src/lib/blog-data/post-a.json", JSON.stringify({ slug: "post-a", content: "A2" }));
    expect(computeChromeHash(root)).toBe(before);
    // 修改代码 → chromeHash 变
    write("src/pages/Index.tsx", "export default function Index() { return null; }");
    expect(computeChromeHash(root)).not.toBe(before);
  });

  it("dataHash covers meta JSON at src/lib root", () => {
    const before = computeDataHash(root);
    write("src/lib/blog-meta.json", JSON.stringify({ posts: [{ slug: "new" }] }));
    expect(computeDataHash(root)).not.toBe(before);
  });
});

describe("contentFilesForRoute", () => {
  it("returns per-slug JSON for detail routes", () => {
    const files = contentFilesForRoute(root, "/blog/post-a");
    expect(files.map((f) => path.basename(f))).toEqual(["post-a.json"]);
  });

  it("falls back to content md files when per-slug JSON is missing", () => {
    const files = contentFilesForRoute(root, "/blog/post-b");
    expect(files.map((f) => path.basename(f))).toEqual(["post-b.json"]);
    fs.unlinkSync(path.join(root, "src/lib/blog-data/post-b.json"));
    const fallback = contentFilesForRoute(root, "/blog/post-b");
    expect(fallback.map((f) => path.basename(f))).toEqual(["post-b.md"]);
  });

  it("resolves twitter routes to public content md", () => {
    const files = contentFilesForRoute(root, "/twitter/tw-a");
    expect(files.map((f) => path.basename(f))).toEqual(["tw-a.md"]);
  });

  it("returns [] for static routes", () => {
    expect(contentFilesForRoute(root, "/")).toEqual([]);
    expect(contentFilesForRoute(root, "/about")).toEqual([]);
  });
});

describe("cacheKeyForRoute — invalidation semantics", () => {
  it("same inputs produce the same key", () => {
    const k1 = cacheKeyForRoute(root, "/blog/post-a", hashes);
    const k2 = cacheKeyForRoute(root, "/blog/post-a", hashes);
    expect(k1).toBe(k2);
  });

  it("different routes have different keys", () => {
    expect(cacheKeyForRoute(root, "/blog/post-a", hashes)).not.toBe(
      cacheKeyForRoute(root, "/blog/post-b", hashes)
    );
  });

  it("editing one post only invalidates that post's detail route", () => {
    const beforeA = cacheKeyForRoute(root, "/blog/post-a", hashes);
    const beforeB = cacheKeyForRoute(root, "/blog/post-b", hashes);
    write("src/lib/blog-data/post-a.json", JSON.stringify({ slug: "post-a", content: "A-edited" }));
    const hashes2 = { chrome: computeChromeHash(root), data: computeDataHash(root) };
    expect(cacheKeyForRoute(root, "/blog/post-a", hashes2)).not.toBe(beforeA);
    expect(cacheKeyForRoute(root, "/blog/post-b", hashes2)).toBe(beforeB);
  });

  it("data (meta) changes invalidate static routes but not detail routes", () => {
    const beforeStatic = cacheKeyForRoute(root, "/", hashes);
    const beforeDetail = cacheKeyForRoute(root, "/blog/post-a", hashes);
    write("src/lib/blog-meta.json", JSON.stringify({ posts: [{ slug: "new-post" }] }));
    const hashes2 = { chrome: computeChromeHash(root), data: computeDataHash(root) };
    expect(cacheKeyForRoute(root, "/", hashes2)).not.toBe(beforeStatic);
    expect(cacheKeyForRoute(root, "/blog/post-a", hashes2)).toBe(beforeDetail);
  });

  it("chrome changes invalidate every route", () => {
    const before = {
      static: cacheKeyForRoute(root, "/", hashes),
      detail: cacheKeyForRoute(root, "/blog/post-a", hashes),
    };
    write("src/pages/Index.tsx", "export default function Changed() {}");
    const hashes2 = { chrome: computeChromeHash(root), data: computeDataHash(root) };
    expect(cacheKeyForRoute(root, "/", hashes2)).not.toBe(before.static);
    expect(cacheKeyForRoute(root, "/blog/post-a", hashes2)).not.toBe(before.detail);
  });
});

describe("readCache / writeCache", () => {
  it("round-trips HTML", () => {
    const dir = path.join(root, "cache");
    expect(readCache(dir, "k")).toBeNull();
    writeCache(dir, "k", "<html>hi</html>");
    expect(readCache(dir, "k")).toBe("<html>hi</html>");
  });
});
