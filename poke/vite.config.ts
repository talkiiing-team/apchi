import * as path from 'path'
import viteTsconfigPaths from 'vite-tsconfig-paths'

import { defineConfig } from 'vite'

import pkg from './package.json'

export default defineConfig({
  plugins: [viteTsconfigPaths()],
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'),
      fileName: () => 'index.js',
      formats: ['cjs'],
    },
    outDir: path.resolve(__dirname, './dist'),
    emptyOutDir: true,
    rollupOptions: {
      external: [...Object.keys(pkg.dependencies), 'http'],
    },
  },
  test: {},
})
