import { defineConfig } from "vite";

const isCloudPreview =
  process.env.DISABLE_HMR === "true" || Boolean(process.env.K_SERVICE);

export default defineConfig({
  server: {
    host: "0.0.0.0",
    port: 3000,
    hmr: isCloudPreview
      ? {
          protocol: "wss",
          clientPort: 443,
          host: "ais-dev-ikgtwbfauz6yhjc5kzhc4h-588914443806.europe-west2.run.app"
        }
      : true
  }
});