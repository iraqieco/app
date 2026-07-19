import path from 'path';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

import runtimeErrorOverlay from '@replit/vite-plugin-runtime-error-modal';

const rawPort = process.env.PORT;

if (!rawPort) {
  throw new Error(
    'PORT environment variable is required but was not provided.',
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

const basePath = process.env.BASE_PATH;

if (!basePath) {
  throw new Error(
    'BASE_PATH environment variable is required but was not provided.',
  );
}

// Normalise: ensure trailing slash for URL construction
const base = basePath.endsWith('/') ? basePath : `${basePath}/`;

export default defineConfig({
  base: basePath,
  plugins: [
    react(),
    tailwindcss(),
    runtimeErrorOverlay(),
    ...(process.env.NODE_ENV !== 'production' &&
    process.env.REPL_ID !== undefined
      ? [
          await import('@replit/vite-plugin-cartographer').then((m) =>
            m.cartographer({
              root: path.resolve(import.meta.dirname, '..'),
            }),
          ),
          await import('@replit/vite-plugin-dev-banner').then((m) =>
            m.devBanner(),
          ),
        ]
      : []),
    VitePWA({
      registerType: 'autoUpdate',
      // Ensure the PNG icons are copied to the build output
      includeAssets: ['pwa-192x192.png', 'pwa-512x512.png'],
      manifest: {
        name: 'عراقي إيكو - Iraqi Eco',
        short_name: 'عراقي إيكو',
        description: 'قاعدة بيانات الكائنات الحية في العراق',
        theme_color: '#1B5E20',
        background_color: '#1B5E20',
        display: 'standalone',
        // start_url must match the sub-path the app is actually served at
        start_url: basePath,
        scope: basePath,
        lang: 'ar',
        dir: 'rtl',
        icons: [
          {
            src: `${base}pwa-192x192.png`,
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: `${base}pwa-192x192.png`,
            sizes: '192x192',
            type: 'image/png',
            purpose: 'maskable',
          },
          {
            src: `${base}pwa-512x512.png`,
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: `${base}pwa-512x512.png`,
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        // Re-cache on every new build by using revision hashing
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webp,woff2}'],
        // Clean up old caches from previous service worker versions
        cleanupOutdatedCaches: true,
        // Force clients to use the newest service worker immediately
        skipWaiting: true,
        clientsClaim: true,
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, 'src'),
      '@assets': path.resolve(
        import.meta.dirname,
        '..',
        '..',
        'attached_assets',
      ),
    },
    dedupe: ['react', 'react-dom'],
  },
  root: path.resolve(import.meta.dirname),
  build: {
    outDir: path.resolve(import.meta.dirname, 'dist/public'),
    emptyOutDir: true,
  },
  server: {
    port,
    strictPort: true,
    host: '0.0.0.0',
    allowedHosts: true,
    fs: {
      strict: true,
    },
  },
  preview: {
    port,
    host: '0.0.0.0',
    allowedHosts: true,
  },
});
