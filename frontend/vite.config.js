import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { visualizer } from 'rollup-plugin-visualizer'
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer'

export default defineConfig({
  plugins: [
    react(),
    // Bundle analyzer - generates stats.html after build
    visualizer({
      open: false, // Set to true to auto-open after build
      filename: 'dist/stats.html',
      gzipSize: true,
      brotliSize: true,
    }),
    // Automatic image optimization
    ViteImageOptimizer({
      png: { quality: 80 },
      jpeg: { quality: 80 },
      jpg: { quality: 80 },
      webp: { quality: 80 },
    }),
  ],
  server: {
    port: 3000,
    host: true, // Allow access from any host
    allowedHosts: [
      'events.build2learn.in',
      'localhost',
      '.build2learn.in', // Allow all subdomains
    ],
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
  build: {
    // Modern build target for smaller bundles
    target: 'es2020',
    // Disable source maps in production for faster builds
    sourcemap: false,
    // Optimize bundle size
    rollupOptions: {
      output: {
        // Split vendor chunks for better caching
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'clerk-vendor': ['@clerk/clerk-react'],
          'query-vendor': ['@tanstack/react-query'],
          'animation-vendor': ['framer-motion'],
        },
      },
    },
    // Increase chunk size warning limit
    chunkSizeWarningLimit: 600,
    // Use Terser for maximum compression (slower but smaller bundles)
    // Alternative: 'esbuild' (faster but ~5-10% larger)
    minify: 'terser',
    terserOptions: {
      compress: {
        // Remove console.* statements in production
        drop_console: true,
        // Remove debugger statements
        drop_debugger: true,
        // Apply all safe optimizations
        passes: 2,
        // Remove unused code
        pure_funcs: ['console.log', 'console.info', 'console.debug', 'console.trace'],
      },
      mangle: {
        // Mangle property names for even smaller bundles (use with caution)
        // properties: false, // Set to true for extra compression (may break code)
        safari10: true, // Fix Safari 10 bugs
      },
      format: {
        // Remove all comments
        comments: false,
      },
    },
  },
  optimizeDeps: {
    // Pre-bundle these dependencies for faster dev server startup
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@clerk/clerk-react',
      '@tanstack/react-query',
      'framer-motion',
      'axios',
      'react-hook-form',
      'react-hot-toast',
    ],
  },
})
