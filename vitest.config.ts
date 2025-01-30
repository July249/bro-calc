/// <reference types="vitest/config" />

// Configure Vitest (https://vitest.dev/config/)

import { defineConfig } from 'vite'
import path from 'path'

export default defineConfig({
  test: {
    /* for example, use global to avoid globals imports (describe, test, expect): */
    // globals: true,
    typecheck: {
      enabled: true,
    },
    include: ['src/test/**/*.test.ts'],
    exclude: ['src/core/**/*.ts', 'src/test/sample.ts'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
