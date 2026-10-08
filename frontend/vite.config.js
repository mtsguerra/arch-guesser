import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Same-origin API calls in dev; the Spring Boot backend runs on :8080.
    proxy: {
      '/api': 'http://localhost:8080',
    },
  },
})
