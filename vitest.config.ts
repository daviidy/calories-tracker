/// <reference types="vitest" />
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/__tests__/setup.ts'],
    globals: true,
    alias: {
      '@': resolve(__dirname, './src'),
    },
    coverage: {
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/**',
        'src/__tests__/**',
      ],
    },
  },
}) 