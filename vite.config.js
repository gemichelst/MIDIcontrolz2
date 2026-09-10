import { defineConfig } from 'vite'

export default defineConfig({
  server: {
    port: 3000,
    host: '0.0.0.0',
    hmr: {
      clientPort: 443,
      host: 'ais-dev-ikgtwbfauz6yhjc5kzhc4h-588914443806.europe-west2.run.app'
    }
  }
})
