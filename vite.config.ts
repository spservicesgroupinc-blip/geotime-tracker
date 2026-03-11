import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3002,
        host: '0.0.0.0',
      },
      plugins: [
        react(),
        VitePWA({
          registerType: 'autoUpdate',
          includeAssets: [
            'icon-192.svg',
            'icon-512.svg',
            'apple-touch-icon.svg',
          ],
          manifest: {
            name: 'GeoTime Tracker',
            short_name: 'GeoTime',
            description: 'GPS-stamped time tracking for construction employees. Clock in/out, track hours, and generate pay reports.',
            theme_color: '#dc2626',
            background_color: '#f8fafc',
            display: 'standalone',
            orientation: 'portrait-primary',
            scope: '/',
            start_url: '/',
            id: '/',
            categories: ['productivity', 'business', 'utilities'],
            icons: [
              {
                src: 'icon-192.svg',
                sizes: '192x192',
                type: 'image/svg+xml',
                purpose: 'any',
              },
              {
                src: 'icon-512.svg',
                sizes: '512x512',
                type: 'image/svg+xml',
                purpose: 'any',
              },
              {
                src: 'icon-512.svg',
                sizes: '512x512',
                type: 'image/svg+xml',
                purpose: 'maskable',
              },
            ],
          },
          workbox: {
            globPatterns: ['**/*.{js,css,html,svg,png,woff2,woff}'],
            runtimeCaching: [
              {
                urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
                handler: 'StaleWhileRevalidate',
                options: {
                  cacheName: 'google-fonts-stylesheets',
                  expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
                },
              },
              {
                urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
                handler: 'CacheFirst',
                options: {
                  cacheName: 'google-fonts-webfonts',
                  expiration: { maxEntries: 30, maxAgeSeconds: 60 * 60 * 24 * 365 },
                  cacheableResponse: { statuses: [0, 200] },
                },
              },
            ],
          },
        }),
      ],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
