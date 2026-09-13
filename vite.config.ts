import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "node:path";

// https://vitejs.dev/config/
export default defineConfig(async ({ mode }) => {
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
  const plugins: any[] = [react()];
  if (mode === 'development') {
    try {
      const mod: any = await import('lovable-tagger');
      if (mod?.componentTagger) plugins.push(mod.componentTagger());
    } catch {
      // lovable-tagger not installed in prod builds; ignore
    }
  }

  return {
    server: {
      host: "::",
      port: 8081,
      proxy,
    },
    plugins,
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
    build: {
      target: "esnext",
      cssCodeSplit: true,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes("node_modules")) {
              if (/[\\/]node_modules[\\/](react|react-dom|scheduler)[\\/]/.test(id)) {
                return "react-core";
              }
              if (/[\\/]node_modules[\\/]react-router(-dom)?[\\/]/.test(id)) {
                return "react-router";
              }
              if (/[\\/]node_modules[\\/]@radix-ui[\\/]/.test(id)) {
                return "radix-vendor";
              }
              if (/[\\/]node_modules[\\/]@tanstack[\\/]/.test(id)) {
                return "tanstack-vendor";
              }
              if (/[\\/]node_modules[\\/]framer-motion[\\/]/.test(id)) {
                return "motion-vendor";
              }
              if (/[\\/]node_modules[\\/]lucide-react[\\/]/.test(id)) {
                return "icons-vendor";
              }
            }
          },
        },
      },
    },
  };
});
