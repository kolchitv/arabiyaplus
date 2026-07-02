import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import path from "path";

// ArabiaEasy Interactive Book Builder — Vite configuration
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.svg"],
      manifest: {
        name: "ArabiaEasy Interactive Book Builder",
        short_name: "ArabiaEasy",
        description: "Build interactive Arabic educational books without code.",
        theme_color: "#1E2A45",
        background_color: "#FAF6EE",
        dir: "rtl",
        lang: "ar",
        display: "standalone",
        icons: [
          { src: "pwa-192.png", sizes: "192x192", type: "image/png" },
          { src: "pwa-512.png", sizes: "512x512", type: "image/png" }
        ]
      },
      workbox: {
        // Cache media aggressively since books are media-heavy (audio/images)
        globPatterns: ["**/*.{js,css,html,svg,png,jpg,jpeg,webp,woff2}"],
        maximumFileSizeToCacheInBytes: 10 * 1024 * 1024
      }
    })
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src")
    }
  },
  server: {
    port: 5173
  }
});
