import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";
import path from "node:path";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["brand/logo-saokim-white.svg", "brand/logo-saokim-star.svg"],
      manifest: {
        name: "Hành trình Sao Kim",
        short_name: "Sao Kim",
        description:
          "5 trạm thắp sáng thương hiệu — game trải nghiệm SAOKIM Framework của Sao Kim Branding.",
        lang: "vi",
        start_url: "/",
        display: "standalone",
        orientation: "portrait",
        background_color: "#050a24",
        theme_color: "#050a24",
        icons: [
          { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
          {
            src: "/icons/icon-maskable-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,svg,png,woff2}"],
        navigateFallback: "/index.html",
        navigateFallbackDenylist: [/^\/api\//],
        runtimeCaching: [
          {
            urlPattern: /\/api\/assets\//,
            handler: "CacheFirst",
            options: {
              cacheName: "brand-assets",
              expiration: { maxEntries: 40, maxAgeSeconds: 60 * 60 * 24 * 7 },
            },
          },
        ],
      },
      devOptions: { enabled: false },
    }),
  ],
  resolve: {
    alias: { "@": path.resolve(import.meta.dirname, "src") },
  },
  server: {
    host: "127.0.0.1",
    port: 5173,
    strictPort: true,
    allowedHosts: ["game.davidtung.net", "localhost", "127.0.0.1"],
    proxy: {
      "/api": {
        target: "http://127.0.0.1:8788",
        changeOrigin: false,
      },
    },
  },
  build: {
    target: "es2022",
    cssCodeSplit: true,
  },
});
