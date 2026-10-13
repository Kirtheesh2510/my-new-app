import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/api/roboflow': {
        target: 'https://serverless.roboflow.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/roboflow/, ''),
        secure: false,
      }
    }
  }
})

