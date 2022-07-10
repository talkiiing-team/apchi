import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import * as path from 'path'
import svgrPlugin from 'vite-plugin-svgr'
import mkcert from 'vite-plugin-mkcert'
import viteTsconfigPaths from 'vite-tsconfig-paths'

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    outDir: path.resolve(__dirname, '../dist-client'),
  },
  plugins: [
    viteTsconfigPaths(),
    react(),
    svgrPlugin({
      svgrOptions: {},
    }),
    mkcert(),
  ],
  optimizeDeps: {
    exclude: ['@headlessui/react'],
  },
  server: {
    https: true,
    hmr: {
      clientPort: process.env.IS_HOSTED ? 443 : 3000,
    },
  },
})
