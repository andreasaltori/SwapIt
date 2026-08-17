import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// VitePWA trasforma SwapIt in una Progressive Web App:
// - aggiunge un Service Worker che mette in cache le risorse
// - permette l'installazione sul dispositivo (pulsante "Aggiungi alla schermata Home")
// - la app funziona offline mostrando le pagine già visitate

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',   // aggiorna il service worker automaticamente
      includeAssets: ['favicon.svg', 'icons/*.png'],
      manifest: {
        name: 'SwapIt - Compra e vendi',
        short_name: 'SwapIt',
        description: 'Marketplace di compravendita oggetti usati',
        theme_color: '#2563eb',       // blu — colore principale dell'app
        background_color: '#f9fafb',
        display: 'standalone',        // si apre senza barra del browser (come un'app)
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: '/icons/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: '/icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        // Mette in cache le chiamate API per funzionare offline
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/swapit-backend.*\.onrender\.com\/api\/.*/i,
            handler: 'NetworkFirst',   // prova la rete, se offline usa la cache
            options: {
              cacheName: 'api-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24  // 24 ore
              }
            }
          }
        ]
      }
    })
  ],
})
