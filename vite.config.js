import { defineConfig } from 'vite'

export default defineConfig({
  server: {
    port: 3000,
    host: '0.0.0.0',
    // Disable HMR entirely to prevent WebSocket 400 handshake errors in the browser console
    hmr: false
  }
})
