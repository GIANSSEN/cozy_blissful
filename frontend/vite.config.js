import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  // Pre-bundle heavy deps once so cold start doesn't re-transform them
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'framer-motion',
      'axios',
      'clsx',
      'tailwind-merge',
      'date-fns',
      'lucide-react',
    ],
    // xlsx is huge (~900KB) and only used in AdminHistory — load on demand
    exclude: ['xlsx'],
  },
  server: {
    port: 5174,
    host: true,
    allowedHosts: true,
    // Warm up entry files so "ready in X ms" measures real readiness
    warmup: {
      clientFiles: ['./index.html', './src/main.jsx', './src/App.jsx'],
    },
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        secure: false,
      }
    }
  },
  build: {
    chunkSizeWarningLimit: 1000,
    // React.lazy() already code-splits per route — no manual manualChunks needed.
    // (Vite 8 / Rolldown rejects the legacy object form, so we leave chunking automatic.)
  },
})