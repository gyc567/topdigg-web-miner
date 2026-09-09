import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    // 构建脚本（scripts/）的纯 Node 测试；jsdom 环境下 Node API 同样可用
    include: [
      "src/**/*.{test,spec}.{ts,tsx}",
      "scripts/**/*.test.mjs",
    ],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      include: ["src/**/*.{ts,tsx}"],
      exclude: ["src/test/**/*", "src/**/*.d.ts", "src/lib/blog-data.json"],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
