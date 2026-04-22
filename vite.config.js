import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import tailwindcss from '@tailwindcss/vite'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
import { cloudflare } from "@cloudflare/vite-plugin";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Lấy VITE_API_BASE từ .env (hoặc env runtime) để không hard-code backend.
  const env = loadEnv(mode, __dirname, 'VITE_')
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
    build: {
      chunkSizeWarningLimit: 1450,
      rollupOptions: {
        output: {
          manualChunks(id) {
            const normalizedId = id.split(path.sep).join('/')
            if (!normalizedId.includes('/node_modules/')) return

            if (normalizedId.includes('/three/')) return 'three-core'
            if (
              normalizedId.includes('/globe.gl/')
              || normalizedId.includes('/three-globe/')
              || normalizedId.includes('/three-render-objects/')
            ) {
              return 'globe-stack'
            }
            if (normalizedId.includes('/@react-three/fiber/')) return 'react-three-fiber'
            if (normalizedId.includes('/fabric/')) return 'fabric-engine'
            if (normalizedId.includes('/antd/') || normalizedId.includes('/@ant-design/icons/') || normalizedId.includes('/@rc-component/') || normalizedId.includes('/rc-')) return 'antd-ui'
            if (
              normalizedId.includes('/maplibre-gl/')
              || normalizedId.includes('/react-leaflet-cluster/')
              || normalizedId.includes('/leaflet.markercluster/')
            ) {
              return 'maps'
            }

            return undefined
          },
        },
      },
    },
  }
})
