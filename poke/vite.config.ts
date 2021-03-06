import * as path from 'path'
import viteTsconfigPaths from 'vite-tsconfig-paths'

import { defineConfig, Plugin } from 'vite'

import pkg from './package.json'

export default defineConfig({
  plugins: [viteTsconfigPaths() as Plugin],
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'),
      fileName: () => 'index.js',
      formats: ['es'],
    },
    outDir: path.resolve(__dirname, './dist'),
    emptyOutDir: true,
    rollupOptions: {
      external: [
        ...Object.keys(pkg.dependencies),
        ...Object.keys(pkg.devDependencies),
        'http',
      ],
    },
  },
  server: {
    https: true,
  },
})
