import * as path from 'path'
import viteTsconfigPaths from 'vite-tsconfig-paths'

import { defineConfig } from 'vite'

import pkg from './package.json'

export default defineConfig({
  plugins: [viteTsconfigPaths()],
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/app/app.ts'),
      fileName: () => 'index.js',
      formats: ['es'],
    },
    outDir: path.resolve(__dirname, 'api/_build'),
    rollupOptions: {
      external: [...Object.keys(pkg.dependencies)],
    },
  },
  test: {},
})
