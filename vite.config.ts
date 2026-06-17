import path from 'node:path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

const backendUrl = process.env.VITE_BACKEND_URL || 'http://localhost:8080';

export default defineConfig({
  plugins: [
    react({
      // Use automatic JSX runtime for React 18
      jsxRuntime: 'automatic',
      // Include .js files for JSX transformation
      include: /\.(jsx|js|tsx|ts)$/,
    }),
  ],

  // Entry point and HTML template
  root: 'workday-application/src/main/react',

  // Output directory
  build: {
    outDir: path.resolve(
      __dirname,
      'workday-application/target/classes/static',
    ),
    emptyOutDir: true,
    sourcemap: true,
  },

  // Resolve aliases to match webpack config
  resolve: {
    alias: {
      '@workday-core': path.resolve(__dirname, 'workday-core/src/main/react'),
      '@workday-user': path.resolve(__dirname, 'workday-user/src/main/react'),
    },
    extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
  },

  // Development server
  server: {
    port: 3000,
    host: 'localhost',
    allowedHosts: ['frontend'],
    proxy: {
      '/api': {
        target: backendUrl,
        changeOrigin: false,
        cookieDomainRewrite: 'localhost',
      },
      '/login': {
        target: backendUrl,
        changeOrigin: false,
        cookieDomainRewrite: 'localhost',
      },
      '/logout': {
        target: backendUrl,
        changeOrigin: false,
        cookieDomainRewrite: 'localhost',
      },
      '/bootstrap': {
        target: backendUrl,
        changeOrigin: false,
        cookieDomainRewrite: 'localhost',
      },
      '/tasks': {
        target: backendUrl,
        changeOrigin: false,
        cookieDomainRewrite: 'localhost',
      },
      '/export': {
        target: backendUrl,
        changeOrigin: false,
        cookieDomainRewrite: 'localhost',
      },
      '/oauth2': {
        target: backendUrl,
        changeOrigin: false,
        cookieDomainRewrite: 'localhost',
      },
    },
  },

  // Optimizations
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@mui/material',
      '@mui/icons-material',
      '@mui/x-date-pickers',
    ],
  },
});
