import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'
import tailwindcss from '@tailwindcss/vite'

import { cloudflare } from "@cloudflare/vite-plugin";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Lấy VITE_API_BASE từ .env (hoặc env runtime) để không hard-code backend.
  const env = loadEnv(mode, process.cwd(), 'VITE_')
  const apiBase = (env.VITE_API_BASE || '').replace(/\/$/, '')

  return {
    plugins: [react(), tailwindcss(), cloudflare()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: apiBase
      ? {
          proxy: {
            '/api': {
              target: apiBase,
              changeOrigin: true,
            },
          },
        }
      : undefined,
  };
})