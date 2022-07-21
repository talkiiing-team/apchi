import * as path from 'path'
import viteTsconfigPaths from 'vite-tsconfig-paths'
import mkCert from 'vite-plugin-mkcert'

import { defineConfig } from 'vite'

import pkg from './package.json'

export default defineConfig({
  plugins: [viteTsconfigPaths(), mkCert()],
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'),
      fileName: () => 'index.mjs',
      formats: ['es'],
    },
    outDir: path.resolve(__dirname, './dist'),
    emptyOutDir: true,
    rollupOptions: {
      external: [...Object.keys(pkg.dependencies), 'http', 'nanoid'],
    },
  },
  server: {
    https: true,
  },
  test: {},
})
