import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],

  build: {
    outDir: "dist",
    chunkSizeWarningLimit: 1500
  },

  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'https://pund-management.onrender.com',
        changeOrigin: true,
      }
    }
  }
})