import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  publicDir: "public",
  assetsInclude: ["**/*.md"],
  build: {
    // manualChunks: 拆 vendor 让主 bundle 更瘦.
    // 主 entry 不再抱着 react/i18n/lucide/json-data 全部,
    // 浏览器可并发请求更小的多个 chunk, LCP/TBT 改善,
    // 直接影响 Google Page Experience ranking.
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (!id.includes("node_modules")) return undefined;
          if (id.includes("react-router") || id.includes("react-helmet-async")) return "vendor-react";
          if (id.includes("i18next") || id.includes("react-i18next")) return "vendor-i18n";
          if (id.includes("lucide-react")) return "vendor-icons";
          if (id.includes("@supabase")) return "vendor-supabase";
          return "vendor-misc";
        },
      },
    },
    // 将巨大 JSON 数据 (ai-daily 1.1MB / blog 558KB) 切成独立 chunk,
    // index entry 不再依赖它们 — 它们只在路由级用 dynamic import 加载.
    chunkSizeWarningLimit: 1500,
  },
}));
