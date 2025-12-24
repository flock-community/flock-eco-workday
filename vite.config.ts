import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [
    react({
      // Use classic JSX runtime for React 16
      jsxRuntime: 'classic',
      // Include .js files for JSX transformation
      include: /\.(jsx|js|tsx|ts)$/,
    }),
  ],

  // Entry point and HTML template
  root: 'workday-application/src/main/react',

  // Output directory
  build: {
    outDir: path.resolve(__dirname, 'workday-application/target/classes/static'),
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
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: false,
        cookieDomainRewrite: 'localhost',
      },
      '/login': {
        target: 'http://localhost:8080',
        changeOrigin: false,
        cookieDomainRewrite: 'localhost',
      },
      '/logout': {
        target: 'http://localhost:8080',
        changeOrigin: false,
        cookieDomainRewrite: 'localhost',
      },
      '/bootstrap': {
        target: 'http://localhost:8080',
        changeOrigin: false,
        cookieDomainRewrite: 'localhost',
      },
      '/tasks': {
        target: 'http://localhost:8080',
        changeOrigin: false,
        cookieDomainRewrite: 'localhost',
      },
      '/export': {
        target: 'http://localhost:8080',
        changeOrigin: false,
        cookieDomainRewrite: 'localhost',
      },
      '/oauth2': {
        target: 'http://localhost:8080',
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
      '@material-ui/core',
      '@material-ui/icons',
      '@material-ui/lab',
      '@material-ui/pickers',
    ],
  },
})
