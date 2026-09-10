import { defineConfig } from 'vite'

// Detect if we are running in the AI Studio cloud environment
// The AI Studio environment automatically sets DISABLE_HMR=true and Cloud Run sets K_SERVICE
const isCloudPreview = process.env.DISABLE_HMR || process.env.K_SERVICE;

export default defineConfig({
  server: {
    port: 3000,
    host: '0.0.0.0',
    // If in the cloud preview, use the secure proxy host. 
    // If running locally, let Vite use standard local WebSockets (hmr: true)
    hmr: isCloudPreview ? {
      clientPort: 443,
      host: 'ais-dev-ikgtwbfauz6yhjc5kzhc4h-588914443806.europe-west2.run.app'
    } : true
  }
})
