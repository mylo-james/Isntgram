/* eslint-disable no-undef */
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({
      // Enable JSX in both .js and .ts files
      include: '**/*.{jsx,tsx,js,ts}',
    }),
  ],

  // Configure esbuild to handle JSX in both JS and TS files
  esbuild: {
    loader: 'tsx',
    include: /src\/.*\.[jt]sx?$/,
    exclude: [],
  },

  // Optimize deps to pre-bundle common libraries
  optimizeDeps: {
    esbuildOptions: {
      loader: {
        '.js': 'jsx',
        '.jsx': 'jsx',
        '.ts': 'tsx',
        '.tsx': 'tsx',
      },
    },
  },

  // Path aliases (similar to our current structure)
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@/components': path.resolve(__dirname, './src/components'),
      '@/pages': path.resolve(__dirname, './src/Pages'),
      '@/contexts': path.resolve(__dirname, './src/Contexts'),
      '@/styles': path.resolve(__dirname, './src/Styles'),
    },
  },

  // Development server configuration
  server: {
    port: 3000,
    open: true,
    // Proxy API calls to Flask backend (replaces package.json proxy)
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8080',
        changeOrigin: true,
        secure: false,
      },
    },
  },

  // Build configuration
  build: {
    outDir: 'build',
    sourcemap: true,
    // Chunk splitting for better caching
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          ui: ['react-modal', 'react-toastify'],
        },
      },
    },
  },

  // Environment variables (Vite uses VITE_ prefix instead of REACT_APP_)
  define: {
    // Only expose specific environment variables for security
    'process.env.NODE_ENV': JSON.stringify(
      process.env.NODE_ENV ?? 'development'
    ),
  },
});
