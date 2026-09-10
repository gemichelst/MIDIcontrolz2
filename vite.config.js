import { defineConfig } from 'vite'

const isCloudPreview = process.env.DISABLE_HMR === 'true' || process.env.K_SERVICE;

export default defineConfig({
  server: {
    port: 3000,
    host: '0.0.0.0',
    hmr: isCloudPreview ? {
      protocol: 'wss',
      clientPort: 443,
      host: 'ais-dev-ikgtwbfauz6yhjc5kzhc4h-588914443806.europe-west2.run.app'
    } : true
  }
})
