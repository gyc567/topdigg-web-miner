import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

const root = createRoot(document.getElementById("root")!);
root.render(<App />);

// ---------- Chunk-load error recovery (SOP defense against hash mismatch) ----------
//
// Symptom: 用户浏览器加载了 Vercel CDN 缓存的旧 `index.html`，但 chunk 已被新 build 替换。
//          dynamic import 找不到旧 hash 文件 → 404 → TypeError。
//
//          Vite 在 preloading/dynamic-import 失败时派发 `vite:preloadError` 事件。
//          监听后强制 reload 一次，让浏览器拿到 fresh `index.html`。
//
//          同时兜底 unhandledrejection：覆盖非 Vite 路径 (e.g. asset 加载错)。

function reloadOnce(reason: string) {
  // 防递归：已经在 reload 就别再触发
  if (sessionStorage.getItem("__chunk_reload__") === "1") return;
  sessionStorage.setItem("__chunk_reload__", "1");
  // 用 query 戳破 HTTP cache（即使有 max-age=0 + must-revalidate 也兜底）
  const url = new URL(window.location.href);
  url.searchParams.set("_v", String(Date.now()));
  console.warn(`[chunk-error] reload: ${reason}`);
  window.location.replace(url.toString());
}

window.addEventListener("vite:preloadError", (event: Event) => {
  // Only suppress Vite's default error if we're going to recover;
  // for the 2nd+ event the sessionStorage lock short-circuits, so Vite
  // still surfaces the original error (helpful for dev-mode debugging).
  if (!reloadOnce("vite:preloadError")) return;
  event.preventDefault();
});

window.addEventListener("unhandledrejection", (event: PromiseRejectionEvent) => {
  const reason = event.reason;
  const msg = reason instanceof Error ? reason.message : String(reason);
  // 命中典型 chunk-load 失败信息
  if (/Failed to fetch dynamically imported module|Loading chunk|Importing a module script failed/i.test(msg)) {
    reloadOnce("unhandledrejection");
  }
});

// 标记首次访问（reload 后清除，2 次失败不再 reload → 防止死循环）
if (window.location.search.includes("_v")) {
  sessionStorage.removeItem("__chunk_reload__");
}
// ---------- End chunk-load recovery ----------

// 通知 prerender 抓取完成：兼容 vite-plugin-prerender renderAfterDocumentEvent
// CSR 完成后立即 dispatch，配合 i18n + react-helmet-async 已注入 head
function dispatchPrerenderReady() {
  if (typeof document === "undefined") return;
  document.dispatchEvent(new Event("render-event"));
}

if (document.readyState === "complete") {
  // SPA 已经在客户端 hydration 完成
  // 再延迟一帧确保 react-helmet-async 的 effect 完成
  setTimeout(dispatchPrerenderReady, 50);
} else {
  window.addEventListener("load", () => setTimeout(dispatchPrerenderReady, 50));
}
