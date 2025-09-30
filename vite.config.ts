import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "node:path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const proxy: Record<string, any> = {};
  if (mode === 'development') {
    // Admin API points to local Cloudflare Worker with remote D1
    proxy['/api/admin'] = {
      target: 'http://localhost:8787',
      changeOrigin: true,
      secure: false,
    };

    // Blog API also points to local Cloudflare Worker with remote D1
    proxy['/api/blog'] = {
      target: 'http://localhost:8787',
      changeOrigin: true,
      secure: false,
    };
  }
  return {
    server: {
      host: "::",
      port: 8081,
      proxy,
    },
    plugins: [
      react(),
      mode === 'development' &&
      componentTagger(),
    ].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(process.cwd(), "./src"),
      },
    },
    define: {
      global: "globalThis",
    },
    optimizeDeps: {
      include: ["gray-matter"],
    },
  };
});
