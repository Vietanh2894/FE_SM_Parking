import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173, // Match the port in the backend's CORS configuration
    proxy: {
      // Using hash router now, so proxying not needed for client-side routes
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      }
    },
    // Configure history fallback for SPA routing
    historyApiFallback: true, 
  },
})