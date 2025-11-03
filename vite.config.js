// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    proxy: mode === 'development'
      ? { '/api': 'http://localhost:3001' }
      : undefined
  },
  plugins: [
    react(),
    mode === 'development' && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "react": path.resolve(__dirname, "./node_modules/react/index.js"),
      "react-dom": path.resolve(__dirname, "./node_modules/react-dom/index.js"),
      "styled-components": path.resolve(__dirname, "./node_modules/styled-components/dist/styled-components.browser.esm.js")
    },
    dedupe: ["react", "react-dom", "styled-components"]
  },
  optimizeDeps: {
    include: ["react", "react-dom", "styled-components"]
  },
  define: { 'process.env': {} },
  build: { rollupOptions: { external: [] } },
}));
