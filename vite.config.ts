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
    mode === 'development' &&
    componentTagger(),
    {
      name: 'markdown-loader',
      async load(id) {
        if (id.endsWith('.md')) {
          const content = await readFile(id, 'utf-8');
          const { data, content: markdownContent } = matter(content);
          
          return `
            const content = ${JSON.stringify(markdownContent)};
            const metadata = ${JSON.stringify(data)};
            export { metadata };
            export default content;
          `;
        }
      }
    }
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
