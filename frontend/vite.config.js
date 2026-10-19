import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import hoverOnly from './postcss-hover-only.js'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  css: { postcss: { plugins: [hoverOnly()] } },
  server: {
    // Same-origin API calls in dev; the Spring Boot backend runs on :8090.
    proxy: {
      '/api': 'http://localhost:8090',
    },
  },
})
