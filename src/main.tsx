import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

const root = createRoot(document.getElementById("root")!);
root.render(<App />);

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
