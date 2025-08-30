import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    strictPort: true,
    headers: {
      'X-Content-Type-Options': 'nosniff',
      'Cache-Control': 'no-cache, no-store, must-revalidate, private',
      'Pragma': 'no-cache',
      'Expires': '0',
      'Vary': 'Authorization, Accept-Encoding',
    },
    proxy: {
      // Proxy para API com autenticação
      '/api': {
        target: 'https://bizlink-production.up.railway.app',
        changeOrigin: true,
        secure: true,
        headers: {
          'Cache-Control': 'no-cache',
        },
      },
    },
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    target: 'es2015',
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
  },
  optimizeDeps: {
    include: ['react', 'react-dom'],
    exclude: ['@tanstack/react-query'],
  },
  define: {
    __DEV__: mode === 'development',
    __AUTH_ENABLED__: true,
  },
}));
