import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
   base: '/',
  // ✅ ADD THIS SERVER CONFIGURATION
  server: {
    proxy: {
      '/api': {
        target: 'http://15.207.59.143:5000', // Change if your backend runs on a different port
        changeOrigin: true,
        secure: false,      
      },
    }
  }
})
