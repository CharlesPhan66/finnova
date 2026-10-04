import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/finnova/',
  plugins: [react({ jsxImportSource: '@gloss' })],
  resolve: { alias: { '@gloss': decodeURIComponent(new URL('./src/gloss', import.meta.url).pathname) } },
})
