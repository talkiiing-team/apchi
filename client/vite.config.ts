import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import * as path from 'path'
import svgrPlugin from 'vite-plugin-svgr'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    svgrPlugin({
      svgrOptions: {},
    }),
  ],
  /*css: {
    preprocessorOptions: {
    },
  },*/
  resolve: {
    alias: [
      {
        find: '@',
        replacement: path.resolve(__dirname, 'src'),
      },
      {
        find: '@apchi/shared',
        replacement: path.resolve(__dirname, '../shared/src'),
      },
    ],
  },
  server: {
    hmr: {
      clientPort: process.env.IS_HOSTED ? 443 : 3000,
    },
  },
})
