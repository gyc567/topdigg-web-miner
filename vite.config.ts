import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    allowedHosts: [
      'both-gauntlet-acronym.ngrok-free.dev',  // 开发 tunnel
      'topdigg.com',                           // 你的生产域名
      'www.topdigg.com',
    ],
    headers: {
      // Allow Paddle checkout iframe in both sandbox and production
      'Content-Security-Policy': "frame-ancestors https://sandbox-buy.paddle.com https://sandbox.paddle.com https://buy.paddle.com https://paddle.com",
    },
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
    // ---- 性能优化核心 ----
    // target: 'esnext' 让 rollup 使用最高效的代码生成，输出更小的 bundle
    target: 'esnext',
    // minify: 'esbuild' 比 terser 快 20x，压缩率接近，CI 构建时间大幅缩短
    minify: 'esbuild',
    // sourcemap: false 避免生成 .map 文件，减少 30-40% 构建产物大小
    sourcemap: false,
    // cssCodeSplit: true 按路由拆分 CSS，减少首屏 CSS 体积
    cssCodeSplit: true,
    // 关闭 manifest 生成（Vercel 不需要）
    manifest: false,
    // ---- manualChunks: 拆 vendor 让主 bundle 更瘦 ----
    // 主 entry 不再抱着 react/i18n/lucide/json-data 全部,
    // 浏览器可并发请求更小的多个 chunk, LCP/TBT 改善,
    // 直接影响 Google Page Experience ranking.
    rollupOptions: {
      output: {
        // 固定 hash 在文件名中，确保持久缓存生效
        // 同时进一步细化 chunk 拆分，让首屏只加载必要的 JS
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
