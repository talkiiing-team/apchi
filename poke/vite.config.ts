/// <reference models="vitest" />

import * as path from 'path'

import { defineConfig } from 'vite'

import pkg from './package.json'

export default defineConfig({
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
  resolve: {
    alias: [
      {
        find: '@',
        replacement: path.resolve(__dirname, 'src'),
      },
    ],
  },
  test: {},
})
