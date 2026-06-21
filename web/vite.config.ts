import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
      },
      manifest: {
        name: 'OneVox',
        short_name: 'OneVox',
        description: 'Plataforma de comunicação assistiva',
        theme_color: '#0A1730',
        background_color: '#0A1730',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        icons: [
          { src: '/icons/icon-72.png',        sizes: '72x72',   type: 'image/png' },
          { src: '/icons/icon-96.png',        sizes: '96x96',   type: 'image/png' },
          { src: '/icons/icon-128.png',       sizes: '128x128', type: 'image/png' },
          { src: '/icons/icon-144.png',       sizes: '144x144', type: 'image/png' },
          { src: '/icons/icon-152.png',       sizes: '152x152', type: 'image/png' },
          { src: '/icons/icon-192.png',       sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-256.png',       sizes: '256x256', type: 'image/png' },
          { src: '/icons/icon-384.png',       sizes: '384x384', type: 'image/png' },
          { src: '/icons/icon-512.png',       sizes: '512x512', type: 'image/png' },
          { src: '/icons/maskable-192.png',   sizes: '192x192', type: 'image/png', purpose: 'maskable' },
          { src: '/icons/maskable-512.png',   sizes: '512x512', type: 'image/png', purpose: 'maskable' },
          { src: '/icons/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
        ],
      },
    }),
  ],
  envDir: '..',
  build: {
    sourcemap: false,
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
})
