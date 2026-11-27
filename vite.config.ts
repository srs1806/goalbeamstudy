import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig(() => {
  const rawBase = (process.env.VITE_PUBLIC_BASE || './').trim();
  const normalizedBase =
    rawBase === './' || rawBase === '.'
      ? './'
      : rawBase.endsWith('/')
        ? rawBase
        : `${rawBase}/`;
  const assetPrefix = normalizedBase === './' ? './' : normalizedBase;
  const swPrefix = normalizedBase === './' ? '' : normalizedBase;

  return {
    base: normalizedBase,
    plugins: [
      react(),
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        manifestFilename: 'site.webmanifest',
        includeAssets: [
          'favicon.ico',
          'favicon.png',
          'favicon-192x192.png',
          'favicon-512x512.png',
          'pwa-maskable-512x512.png',
          'apple-touch-icon.png',
          'logo.png',
          'og-card.png',
          'sw-notifications.js',
          '404.html',
        ],
        manifest: {
          id: assetPrefix,
          name: 'GOALBEAM — Class 10 Study App',
          short_name: 'Goalbeam',
          description:
            'Installable offline CBSE Class 10 course & board syllabus app with chapter checklists, NCERT/PYQ Vault, Pomodoro Focus Garden, and AI Study Studio.',
          theme_color: '#03050a',
          background_color: '#03050a',
          display: 'standalone',
          display_override: ['window-controls-overlay', 'standalone', 'minimal-ui'],
          start_url: assetPrefix,
          scope: assetPrefix,
          categories: ['education', 'productivity'],
          icons: [
            {
              src: `${assetPrefix}favicon-192x192.png`,
              sizes: '192x192',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: `${assetPrefix}favicon-512x512.png`,
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: `${assetPrefix}pwa-maskable-512x512.png`,
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable',
            },
          ],
          shortcuts: [
            {
              name: 'Chapters & Syllabus',
              short_name: 'Chapters',
              url: `${assetPrefix}chapters`,
              icons: [{ src: `${assetPrefix}favicon-192x192.png`, sizes: '192x192', type: 'image/png' }],
            },
            {
              name: '3D Focus Garden',
              short_name: 'Focus',
              url: `${assetPrefix}focus-garden`,
              icons: [{ src: `${assetPrefix}favicon-192x192.png`, sizes: '192x192', type: 'image/png' }],
            },
            {
              name: 'CBSE & NCERT Vault',
              short_name: 'Resources',
              url: `${assetPrefix}resources`,
              icons: [{ src: `${assetPrefix}favicon-192x192.png`, sizes: '192x192', type: 'image/png' }],
            },
          ],
        },
        workbox: {
          importScripts: [`${swPrefix}sw-notifications.js`],
          globPatterns: ['**/*.{js,css,html,ico,png,svg,webp,woff,woff2,webmanifest,json}'],
          maximumFileSizeToCacheInBytes: 15 * 1024 * 1024,
          cleanupOutdatedCaches: true,
          clientsClaim: true,
          skipWaiting: true,
          navigateFallback: `${swPrefix}index.html`,
          navigateFallbackDenylist: [/\/api\//],
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'google-fonts-cache',
                expiration: {
                  maxEntries: 15,
                  maxAgeSeconds: 60 * 60 * 24 * 365,
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
            {
              urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'gstatic-fonts-cache',
                expiration: {
                  maxEntries: 25,
                  maxAgeSeconds: 60 * 60 * 24 * 365,
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
            {
              urlPattern: /\/api\/app-updates$/i,
              handler: 'NetworkFirst',
              options: {
                cacheName: 'app-updates-cache',
                networkTimeoutSeconds: 4,
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
            {
              urlPattern: /\/api\/leaderboard$/i,
              handler: 'NetworkFirst',
              options: {
                cacheName: 'leaderboard-cache',
                networkTimeoutSeconds: 4,
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
          ],
        },
        devOptions: {
          enabled: true,
          type: 'module',
          navigateFallback: '/index.html',
        },
      }),
    ],
    build: {
      chunkSizeWarningLimit: 600,
      rollupOptions: {
        output: {
          entryFileNames: 'assets/scripts/aura-study-app-[hash].js',
          chunkFileNames: 'assets/scripts/aura-[name]-[hash].js',
          assetFileNames: (assetInfo) => {
            const name = assetInfo.name || '';
            if (name.endsWith('.css')) {
              return 'assets/styles/aura-[name]-[hash][extname]';
            }
            if (/\.(png|jpe?g|svg|webp|ico|gif)$/i.test(name)) {
              return 'assets/images/aura-[name]-[hash][extname]';
            }
            return 'assets/media/aura-[name]-[hash][extname]';
          },
          manualChunks(id) {
            if (id.includes('node_modules/three')) return 'focus-garden-3d-engine';
            if (id.includes('node_modules/react-dom') || id.includes('node_modules/react/')) {
              return 'react-core';
            }
            if (
              id.includes('node_modules/lucide-react') ||
              id.includes('node_modules/motion') ||
              id.includes('node_modules/canvas-confetti')
            ) {
              return 'ui-motion-icons';
            }
            if (id.includes('/src/data/resourcesData')) return 'cbse-resources-vault-data';
            if (id.includes('/src/data/')) return 'cbse-boards-curriculum-data';
            if (
              id.includes('/src/utils/chapterTranslations') ||
              id.includes('/src/utils/translations')
            ) {
              return 'multilingual-study-translations';
            }
            if (id.includes('/src/components/aura/') || id.includes('AuraAIStudio')) {
              return 'ai-study-studio';
            }
          },
        },
      },
    },
    resolve: {
      dedupe: ['react', 'react-dom', 'react/jsx-runtime', 'react/jsx-dev-runtime'],
      alias: {
        '@': resolve(__dirname, '.'),
      },
    },
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        'react-dom/client',
        'react/jsx-runtime',
        'react/jsx-dev-runtime',
        'lucide-react',
        'canvas-confetti',
        'three',
      ],
    },
    server: {
      hmr: false,
      ws: false,
    },
  };
});
