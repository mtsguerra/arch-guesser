import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import hoverOnly from './postcss-hover-only.js'
import motionAttr from './postcss-motion-attr.js'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  css: { postcss: { plugins: [hoverOnly(), motionAttr()] } },
  server: {
    // Same-origin API calls in dev; the Spring Boot backend runs on :8090.
    proxy: {
      '/api': 'http://localhost:8090',
    },
  },
})
