import { defineConfig } from "npm:vite";
import react from "npm:@vitejs/plugin-react-swc";
import { resolve } from "https://deno.land/std@0.208.0/path/mod.ts";
import { componentTagger } from "npm:lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8081,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": resolve(Deno.cwd(), "./src"),
    },
  },
  define: {
    global: "globalThis",
  },
  optimizeDeps: {
    include: ["gray-matter"],
  },
}));
